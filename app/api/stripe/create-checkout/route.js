import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    // Check if Stripe is configured
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

    // Calculate amount with fee
    const buyIn = pool.buy_in * 100 // Convert to cents
    const platformFee = Math.round(buyIn * 0.05) // 5% fee
    const totalAmount = pool.fee_handling === 'on_top' ? buyIn + platformFee : buyIn

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pool.name} - Pool Buy-in`,
              description: `World Cup 2026 Prediction Pool Entry`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${return_url || process.env.NEXT_PUBLIC_APP_URL}/pool/${pool_id}?payment=success`,
      cancel_url: `${return_url || process.env.NEXT_PUBLIC_APP_URL}/pool/${pool_id}?payment=cancelled`,
      metadata: {
        pool_id,
        user_id,
        member_id: member.id,
        platform_fee: platformFee,
      },
      // Application fee for platform (5%)
      // Note: This requires a connected account. For now, we just track it.
    })

    // Store session ID on member record
    await supabase
      .from('pool_members')
      .update({ stripe_payment_id: session.id })
      .eq('id', member.id)

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
