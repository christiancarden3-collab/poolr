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

    // Get pool details with commissioner info
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .select(`
        *,
        commissioner:profiles!commissioner_id(stripe_account_id, username)
      `)
      .eq('id', pool_id)
      .single()

    if (poolError || !pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 })
    }

    if (pool.payment_method !== 'stripe') {
      return NextResponse.json({ error: 'Pool does not use Stripe payments' }, { status: 400 })
    }

    // Verify commissioner has connected Stripe account
    const commissionerStripeId = pool.commissioner?.stripe_account_id
    if (!commissionerStripeId) {
      return NextResponse.json({ 
        error: 'Commissioner has not set up Stripe payments yet',
        code: 'COMMISSIONER_NOT_CONNECTED'
      }, { status: 400 })
    }

    // Verify commissioner's account is fully onboarded
    const commissionerAccount = await stripe.accounts.retrieve(commissionerStripeId)
    if (!commissionerAccount.charges_enabled) {
      return NextResponse.json({ 
        error: 'Commissioner Stripe account is not fully set up',
        code: 'COMMISSIONER_NOT_VERIFIED'
      }, { status: 400 })
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

    // For "absorbed" fee handling, the application_fee is still 5% of total
    // For "on_top", the application_fee is the extra amount
    const applicationFee = platformFee

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickpoolr.com'

    // Create Stripe Checkout Session with Connected Account
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pool.name} - Pool Entry`,
              description: `Buy-in for World Cup 2026 Prediction Pool`,
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
        user_id,
        member_id: member.id,
        platform_fee: applicationFee,
        buy_in: buyIn,
        fee_handling: pool.fee_handling,
      },
      // STRIPE CONNECT: Route payment to commissioner, take platform fee
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: commissionerStripeId,
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
      fee: applicationFee,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
