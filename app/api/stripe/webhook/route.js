import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
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
      // ============================================================
      // CHECKOUT COMPLETED - Player paid for pool entry
      // ============================================================
      case 'checkout.session.completed': {
        const session = event.data.object
        const { pool_id, user_id, member_id, platform_fee, buy_in, fee_handling } = session.metadata

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

          console.log(`✅ Payment confirmed: member ${member_id} in pool ${pool_id}`)
          console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}, Platform fee: $${(platform_fee / 100).toFixed(2)}`)
        }
        break
      }

      // ============================================================
      // CHECKOUT EXPIRED - Session timed out
      // ============================================================
      case 'checkout.session.expired': {
        const session = event.data.object
        const { member_id } = session.metadata

        if (member_id) {
          await supabase
            .from('pool_members')
            .update({ 
              stripe_payment_id: null,
              payment_status: 'pending'
            })
            .eq('id', member_id)

          console.log(`⏰ Checkout expired for member ${member_id}`)
        }
        break
      }

      // ============================================================
      // REFUND - Player refunded
      // ============================================================
      case 'charge.refunded': {
        const charge = event.data.object

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

          console.log(`💸 Refund processed for member ${member.id}`)
        }
        break
      }

      // ============================================================
      // CONNECT: Account updated (onboarding status)
      // ============================================================
      case 'account.updated': {
        const account = event.data.object

        if (account.metadata?.user_id) {
          const isReady = account.charges_enabled && account.payouts_enabled

          console.log(`🔗 Connect account ${account.id} updated:`)
          console.log(`   User: ${account.metadata.user_id}`)
          console.log(`   Charges enabled: ${account.charges_enabled}`)
          console.log(`   Payouts enabled: ${account.payouts_enabled}`)
          console.log(`   Ready: ${isReady}`)
        }
        break
      }

      // ============================================================
      // TRANSFER: Money sent to commissioner
      // ============================================================
      case 'transfer.created': {
        const transfer = event.data.object
        console.log(`💰 Transfer created: $${(transfer.amount / 100).toFixed(2)} to ${transfer.destination}`)
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
