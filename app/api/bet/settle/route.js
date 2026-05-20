import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { bet_id, winner } = await request.json()

    if (!bet_id || !winner) {
      return NextResponse.json({ error: 'bet_id and winner required' }, { status: 400 })
    }

    if (winner !== 'team1' && winner !== 'team2') {
      return NextResponse.json({ error: 'winner must be team1 or team2' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get bet with participants
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select(`
        *,
        creator:profiles!creator_id(id, username, email, stripe_account_id),
        opponent:profiles!opponent_id(id, username, email, stripe_account_id)
      `)
      .eq('id', bet_id)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    if (bet.status !== 'active') {
      return NextResponse.json({ error: 'Bet is not active' }, { status: 400 })
    }

    // Determine winner
    const creatorWins = bet.creator_pick === winner
    const winnerId = creatorWins ? bet.creator_id : bet.opponent_id
    const winnerProfile = creatorWins ? bet.creator : bet.opponent

    // Calculate payout - total pot minus 3% fee
    const totalPot = bet.amount * 2
    const platformFee = totalPot * 0.03
    const winnerPayout = totalPot - platformFee

    // Update bet status
    const { error: updateError } = await supabase
      .from('bets')
      .update({
        status: 'settled',
        winner: winner,
        winner_id: winnerId,
        winner_payout: winnerPayout,
        platform_fee: platformFee,
        settled_at: new Date().toISOString(),
      })
      .eq('id', bet_id)

    if (updateError) throw updateError

    // If winner has Stripe Connect, do automatic payout
    let payoutResult = null
    if (winnerProfile?.stripe_account_id) {
      try {
        // Transfer winnings to winner's connected account
        const transfer = await stripe.transfers.create({
          amount: Math.round(winnerPayout * 100), // cents
          currency: 'usd',
          destination: winnerProfile.stripe_account_id,
          description: `1v1 Bet win: ${bet.title}`,
          metadata: {
            bet_id,
            winner_id: winnerId,
          },
        })

        payoutResult = { transfer_id: transfer.id, amount: winnerPayout }

        // Update bet as paid out
        await supabase
          .from('bets')
          .update({
            status: 'paid_out',
            payout_transfer_id: transfer.id,
            paid_out_at: new Date().toISOString(),
          })
          .eq('id', bet_id)

      } catch (transferError) {
        console.error('Transfer error:', transferError)
        payoutResult = { error: transferError.message }
      }
    } else {
      payoutResult = { 
        note: 'Winner does not have Stripe Connect. Manual payout needed.',
        winner_email: winnerProfile?.email,
        amount: winnerPayout,
      }
    }

    return NextResponse.json({
      success: true,
      winner: winner === 'team1' ? bet.team1 : bet.team2,
      winner_id: winnerId,
      winner_username: winnerProfile?.username,
      payout: winnerPayout,
      platform_fee: platformFee,
      payout_result: payoutResult,
    })
  } catch (error) {
    console.error('Settle bet error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
