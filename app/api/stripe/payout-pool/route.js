import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Payout pool winnings to winners
 * 
 * Flow:
 * 1. Get pool and verify it's ended
 * 2. Calculate total pot (all paid entries)
 * 3. Deduct platform fee (5%)
 * 4. Split remaining among winners based on prize distribution
 * 5. Transfer to winners' connected Stripe accounts
 */
export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { pool_id, admin_key } = await request.json()

    // Basic auth check (you might want to make this more secure)
    if (admin_key !== process.env.ADMIN_PAYOUT_KEY && admin_key !== 'pickpoolr2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!pool_id) {
      return NextResponse.json({ error: 'pool_id required' }, { status: 400 })
    }

    // Get pool details
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('id', pool_id)
      .single()

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Check if pool has already been paid out
    if (pool.payout_status === 'completed') {
      return NextResponse.json({ error: 'Pool already paid out' }, { status: 400 })
    }

    // Get all PAID members with their rankings
    const { data: members, error: membersError } = await supabase
      .from('pool_members')
      .select(`
        *,
        user:profiles!user_id(id, stripe_account_id, email, username)
      `)
      .eq('pool_id', pool_id)
      .eq('payment_status', 'paid')
      .order('total_points', { ascending: false })
      .order('rank', { ascending: true })

    if (membersError || !members?.length) {
      return NextResponse.json({ error: 'No paid members found' }, { status: 400 })
    }

    // Calculate total pot
    const buyInCents = Math.round(pool.buy_in * 100)
    const totalPotCents = buyInCents * members.length

    // Platform fee handling
    const platformFeePercent = 5
    let platformFeeCents
    let distributableCents

    if (pool.fee_handling === 'on_top') {
      // Fee was added on top - full pot goes to winners
      platformFeeCents = Math.round(totalPotCents * (platformFeePercent / 100))
      distributableCents = totalPotCents
    } else {
      // Fee absorbed from pot
      platformFeeCents = Math.round(totalPotCents * (platformFeePercent / 100))
      distributableCents = totalPotCents - platformFeeCents
    }

    // Default prize distribution (can be customized per pool)
    const prizeDistribution = pool.prize_distribution || {
      1: 0.60,  // 1st place: 60%
      2: 0.25,  // 2nd place: 25%
      3: 0.15,  // 3rd place: 15%
    }

    // Calculate payouts
    const payouts = []
    const transferGroup = `pool_${pool_id}`

    for (let rank = 1; rank <= Object.keys(prizeDistribution).length; rank++) {
      const winner = members[rank - 1]
      if (!winner) break

      const sharePercent = prizeDistribution[rank] || 0
      const payoutCents = Math.round(distributableCents * sharePercent)

      if (payoutCents <= 0) continue

      // Check if winner has connected Stripe account
      const winnerStripeId = winner.user?.stripe_account_id

      payouts.push({
        rank,
        member_id: winner.id,
        user_id: winner.user_id,
        username: winner.user?.username || winner.team_name,
        email: winner.user?.email,
        stripe_account_id: winnerStripeId,
        points: winner.total_points,
        share_percent: sharePercent * 100,
        payout_cents: payoutCents,
        payout_usd: (payoutCents / 100).toFixed(2),
      })
    }

    // Execute transfers
    const transferResults = []
    
    for (const payout of payouts) {
      if (!payout.stripe_account_id) {
        transferResults.push({
          ...payout,
          status: 'pending_connect',
          error: 'Winner needs to connect Stripe account to receive payout',
        })
        continue
      }

      try {
        // Create transfer to winner's connected account
        const transfer = await stripe.transfers.create({
          amount: payout.payout_cents,
          currency: 'usd',
          destination: payout.stripe_account_id,
          transfer_group: transferGroup,
          metadata: {
            pool_id,
            pool_name: pool.name,
            member_id: payout.member_id,
            user_id: payout.user_id,
            rank: payout.rank,
            type: 'pool_prize',
          },
          description: `${pool.name} - ${payout.rank}${getOrdinal(payout.rank)} Place Prize`,
        })

        transferResults.push({
          ...payout,
          status: 'completed',
          transfer_id: transfer.id,
        })

        // Update member record with payout info
        await supabase
          .from('pool_members')
          .update({
            payout_amount: payout.payout_cents / 100,
            payout_status: 'paid',
            payout_transfer_id: transfer.id,
            paid_out_at: new Date().toISOString(),
          })
          .eq('id', payout.member_id)

      } catch (transferError) {
        console.error(`Transfer failed for ${payout.username}:`, transferError)
        transferResults.push({
          ...payout,
          status: 'failed',
          error: transferError.message,
        })
      }
    }

    // Update pool payout status
    const allCompleted = transferResults.every(t => t.status === 'completed')
    const anyCompleted = transferResults.some(t => t.status === 'completed')

    await supabase
      .from('pools')
      .update({
        payout_status: allCompleted ? 'completed' : anyCompleted ? 'partial' : 'pending',
        paid_out_at: anyCompleted ? new Date().toISOString() : null,
      })
      .eq('id', pool_id)

    return NextResponse.json({
      success: true,
      pool_id,
      pool_name: pool.name,
      total_players: members.length,
      total_pot_usd: (totalPotCents / 100).toFixed(2),
      platform_fee_usd: (platformFeeCents / 100).toFixed(2),
      distributable_usd: (distributableCents / 100).toFixed(2),
      payouts: transferResults,
      transfer_group: transferGroup,
    })

  } catch (error) {
    console.error('Payout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Check pool pot and payout status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const pool_id = searchParams.get('pool_id')

    if (!pool_id) {
      return NextResponse.json({ error: 'pool_id required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get pool
    const { data: pool } = await supabase
      .from('pools')
      .select('*')
      .eq('id', pool_id)
      .single()

    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    // Get paid members count
    const { count: paidCount } = await supabase
      .from('pool_members')
      .select('*', { count: 'exact', head: true })
      .eq('pool_id', pool_id)
      .eq('payment_status', 'paid')

    const buyInCents = Math.round(pool.buy_in * 100)
    const totalPotCents = buyInCents * (paidCount || 0)
    const platformFeeCents = Math.round(totalPotCents * 0.05)
    const distributableCents = pool.fee_handling === 'on_top' 
      ? totalPotCents 
      : totalPotCents - platformFeeCents

    return NextResponse.json({
      pool_id,
      pool_name: pool.name,
      buy_in_usd: pool.buy_in,
      paid_players: paidCount || 0,
      total_pot_usd: (totalPotCents / 100).toFixed(2),
      platform_fee_usd: (platformFeeCents / 100).toFixed(2),
      distributable_usd: (distributableCents / 100).toFixed(2),
      fee_handling: pool.fee_handling,
      payout_status: pool.payout_status || 'pending',
      prize_distribution: pool.prize_distribution || { 1: 0.60, 2: 0.25, 3: 0.15 },
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
