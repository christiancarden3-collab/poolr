import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { pool_id, user_id, member_id } = session.metadata

        if (member_id) {
          // Update payment status
          await supabase
            .from('pool_members')
            .update({
              payment_status: 'paid',
              payment_method: 'stripe',
              stripe_payment_id: session.payment_intent,
              paid_at: new Date().toISOString(),
            })
            .eq('id', member_id)

          console.log(`Payment confirmed for member ${member_id} in pool ${pool_id}`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object
        const { member_id } = session.metadata

        if (member_id) {
          // Clear the session ID since it expired
          await supabase
            .from('pool_members')
            .update({ stripe_payment_id: null })
            .eq('id', member_id)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        
        // Find member by payment ID
        const { data: member } = await supabase
          .from('pool_members')
          .select('*')
          .eq('stripe_payment_id', charge.payment_intent)
          .single()

        if (member) {
          await supabase
            .from('pool_members')
            .update({ payment_status: 'refunded' })
            .eq('id', member.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
