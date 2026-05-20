import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { user_id, return_url } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if user already has a connected account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id, email, username')
      .eq('id', user_id)
      .single()

    let accountId = profile?.stripe_account_id

    if (!accountId) {
      // Create a new Express connected account
      const account = await stripe.accounts.create({
        type: 'express',
        email: profile?.email,
        metadata: {
          user_id,
          platform: 'pickpoolr'
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })

      accountId = account.id

      // Save account ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user_id)
    }

    // Create account link for onboarding
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pickpoolr.com'
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/create?stripe_refresh=true`,
      return_url: return_url || `${appUrl}/create?stripe_connected=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
      account_id: accountId,
    })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET - Check if user has completed Stripe onboarding
export async function GET(request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user's Stripe account ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user_id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        onboarding_complete: false,
        message: 'No Stripe account linked'
      })
    }

    // Check account status
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    const isComplete = account.details_submitted && 
                       account.charges_enabled && 
                       account.payouts_enabled

    return NextResponse.json({
      connected: true,
      onboarding_complete: isComplete,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      account_id: account.id,
    })
  } catch (error) {
    console.error('Stripe status check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
