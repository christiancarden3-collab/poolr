import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { bet_id, user_id } = await request.json()

    if (!bet_id || !user_id) {
      return NextResponse.json({ error: 'bet_id and user_id required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get bet with participants
    const { data: bet, error: betError } = await supabase
      .from('bets')
      .select('*')
      .eq('id', bet_id)
      .single()

    if (betError || !bet) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 })
    }

    // Check user is participant
    const isCreator = user_id === bet.creator_id
    const isOpponent = user_id === bet.opponent_id
    
    if (!isCreator && !isOpponent) {
      return NextResponse.json({ error: 'Not a participant in this bet' }, { status: 403 })
    }

    // Check if already paid
    if (isCreator && bet.creator_paid) {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }
    if (isOpponent && bet.opponent_paid) {
      return NextResponse.json({ error: 'Already paid' }, { status: 400 })
    }

    // Calculate amounts - 3% platform fee
    const betAmount = Math.round(bet.amount * 100) // cents
    const platformFee = Math.max(Math.round(betAmount * 0.03), 30) // 3% min 30 cents

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickpoolr.com'

    // Create Stripe Checkout - money goes to platform account
    // We'll transfer to winner when bet settles
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `1v1 Bet: ${bet.title}`,
              description: `Your pick: ${isCreator ? (bet.creator_pick === 'team1' ? bet.team1 : bet.team2) : (bet.opponent_pick === 'team1' ? bet.team1 : bet.team2)}`,
            },
            unit_amount: betAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/bet/${bet_id}?payment=success`,
      cancel_url: `${appUrl}/bet/${bet_id}?payment=cancelled`,
      metadata: {
        bet_id,
        user_id,
        is_creator: isCreator ? 'true' : 'false',
        platform_fee: platformFee,
      },
    })

    // Store session reference
    const updateField = isCreator ? 'creator_stripe_session' : 'opponent_stripe_session'
    await supabase
      .from('bets')
      .update({ [updateField]: session.id })
      .eq('id', bet_id)

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    })
  } catch (error) {
    console.error('Bet checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
