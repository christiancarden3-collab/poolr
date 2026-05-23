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

    if (memberData.payment_status === 'paid') {
      router.push(`/pool/${params.id}`)
      return
    }

    setMember(memberData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">PickPoolr</div>
        <p>Loading...</p>
        <style jsx global>{`
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
            font-weight: 600;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="payment-screen">
      <div className="logo">PickPoolr</div>
      
      <div className="payment-card">
        <Link href={`/pool/${pool.id}`} className="back-link">← Back to pool</Link>
        
        <h1>Complete Payment</h1>
        <p className="pool-name">{pool.name}</p>

        <div className="amount-box">
          <span className="amount-label">Amount Due</span>
          <span className="amount-value">${pool.buy_in || 0}</span>
        </div>

        <div className="external-payment">
          <h3>Payment Instructions</h3>
          <p className="instructions">{pool.payment_instructions || 'Contact the pool commissioner for payment details.'}</p>
          <div className="pending-notice">
            Your payment status will be updated by the commissioner once received.
          </div>
          <Link href={`/pool/${pool.id}`} className="btn-confirm">
            I've Sent Payment
          </Link>
        </div>
      </div>

      <style jsx global>{`
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
          font-weight: 600;
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
          font-weight: 600;
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

        .external-payment {
          background: var(--ink3);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .external-payment h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .instructions {
          color: var(--body);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          white-space: pre-wrap;
        }

        .pending-notice {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .btn-confirm {
          display: block;
          width: 100%;
          text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #c9a84c;
          color: #000;
          padding: 0.9rem;
          border-radius: 4px;
          text-decoration: none;
          transition: background 0.15s;
        }

        .btn-confirm:hover {
          background: #e6c76a;
        }
      `}</style>
    </div>
  )
}
