'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'

export default function PaymentPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Get pool
    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!poolData) {
      router.push('/dashboard')
      return
    }
    setPool(poolData)

    // Get membership
    const { data: memberData } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', params.id)
      .eq('user_id', currentUser.id)
      .single()

    if (!memberData) {
      router.push(`/join/${poolData.invite_code}`)
      return
    }

    // If already paid, redirect to pool
    if (memberData.payment_status === 'paid') {
      router.push(`/pool/${params.id}`)
      return
    }

    setMember(memberData)
    setLoading(false)
  }

  const handleStripePayment = async () => {
    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pool_id: pool.id,
          user_id: user.id,
          return_url: window.location.origin,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--ink);
          }
          .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  const totalAmount = pool.fee_handling === 'on_top' 
    ? pool.buy_in * 1.05 
    : pool.buy_in

  return (
    <div className="payment-screen">
      <div className="logo">Poolr</div>
      
      <div className="payment-card">
        <Link href={`/pool/${pool.id}`} className="back-link">← Back to pool</Link>
        
        <h1>Complete Payment</h1>
        <p className="pool-name">{pool.name}</p>

        <div className="amount-box">
          <span className="amount-label">Amount Due</span>
          <span className="amount-value">${totalAmount.toFixed(2)}</span>
          {pool.fee_handling === 'on_top' && (
            <span className="amount-breakdown">
              ${pool.buy_in} buy-in + ${(pool.buy_in * 0.05).toFixed(2)} fee
            </span>
          )}
        </div>

        {error && <div className="error-msg">{error}</div>}

        {pool.payment_method === 'stripe' ? (
          <button 
            onClick={handleStripePayment} 
            disabled={processing}
            className="btn-gold full-width"
          >
            {processing ? 'Redirecting to Stripe...' : 'Pay with Card'}
          </button>
        ) : (
          <div className="external-payment">
            <h3>Payment Instructions</h3>
            <p>{pool.payment_instructions || 'Contact the pool commissioner for payment details.'}</p>
            <div className="pending-notice">
              Your payment status will be updated by the commissioner once received.
            </div>
            <Link href={`/pool/${pool.id}`} className="btn-outline full-width">
              I've Sent Payment
            </Link>
          </div>
        )}

        <div className="security-note">
          🔒 Payments are securely processed
        </div>
      </div>

      <style jsx>{`
        .payment-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--ink);
          padding: 2rem;
        }

        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: var(--gold2);
          text-transform: uppercase;
          margin-bottom: 2rem;
        }

        .payment-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
          display: block;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .pool-name {
          color: var(--body);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }

        .amount-box {
          text-align: center;
          padding: 2rem;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid var(--gold);
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .amount-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--body);
          margin-bottom: 0.5rem;
        }

        .amount-value {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          color: var(--gold2);
        }

        .amount-breakdown {
          display: block;
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 0.5rem;
        }

        .error-msg {
          background: rgba(224, 108, 117, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .full-width {
          width: 100%;
        }

        .external-payment {
          background: var(--ink3);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .external-payment h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gold);
          margin-bottom: 0.75rem;
        }

        .external-payment p {
          color: var(--body);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .pending-notice {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .security-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  )
}
