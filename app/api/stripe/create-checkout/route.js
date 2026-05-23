import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to environment.' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { pool_id, user_id, return_url } = await request.json()

    if (!pool_id || !user_id) {
      return NextResponse.json({ error: 'pool_id and user_id required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get pool details
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('id', pool_id)
      .single()

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    if (pool.payment_method !== 'stripe') {
      return NextResponse.json({ error: 'Pool does not use Stripe payments' }, { status: 400 })
    }

    // Get pool member
    const { data: member, error: memberError } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', pool_id)
      .eq('user_id', user_id)
      .single()

    if (memberError || !member) {
      return NextResponse.json({ error: 'Not a member of this pool' }, { status: 403 })
    }

    if (member.payment_status === 'paid') {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }

    // Calculate amounts
    const buyIn = Math.round(pool.buy_in * 100) // Convert to cents
    const platformFeePercent = 5
    const platformFee = Math.round(buyIn * (platformFeePercent / 100)) // 5% fee

    // Total player pays depends on fee handling
    // - "on_top": Player pays buy-in + 5% fee
    // - "absorbed": Player pays buy-in, fee comes out of pool
    const totalAmount = pool.fee_handling === 'on_top' 
      ? buyIn + platformFee 
      : buyIn

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickpoolr.com'

    // Create Stripe Checkout Session
    // PLATFORM HOLDS FUNDS - No transfer_data, platform collects everything
    // Each pool is tracked via metadata and transfer_group
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pool.name} - Pool Entry`,
              description: `Buy-in for ${pool.tournament || 'World Cup 2026'} Prediction Pool`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${return_url || appUrl}/pool/${pool_id}?payment=success`,
      cancel_url: `${return_url || appUrl}/pool/${pool_id}?payment=cancelled`,
      metadata: {
        pool_id,
        pool_name: pool.name,
        user_id,
        member_id: member.id,
        buy_in_cents: buyIn,
        platform_fee_cents: platformFee,
        fee_handling: pool.fee_handling,
        type: 'pool_entry',
      },
      // Use transfer_group to group all payments for this pool
      // Makes it easy to track and payout later
      payment_intent_data: {
        transfer_group: `pool_${pool_id}`,
        metadata: {
          pool_id,
          pool_name: pool.name,
          user_id,
          member_id: member.id,
          type: 'pool_entry',
        },
      },
    })

    // Store session ID on member record
    await supabase
      .from('pool_members')
      .update({ 
        stripe_payment_id: session.id,
        payment_status: 'pending'
      })
      .eq('id', member.id)

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
      amount: totalAmount,
      fee: platformFee,
      pool_id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
