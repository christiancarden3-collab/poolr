'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../lib/supabase'

export default function JoinPoolPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    loadPool()
  }, [params.code])

  const loadPool = async () => {
    // Get current user (might not be logged in)
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    // Find pool by invite code
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('invite_code', params.code.toUpperCase())
      .single()

    if (poolError || !poolData) {
      setError('Pool not found. Check your invite link.')
      setLoading(false)
      return
    }

    setPool(poolData)

    // Get member count
    const { count } = await supabase
      .from('pool_members')
      .select('*', { count: 'exact', head: true })
      .eq('pool_id', poolData.id)
    
    setMemberCount(count || 0)

    // Check if user is already a member
    if (currentUser) {
      const { data: membership } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', poolData.id)
        .eq('user_id', currentUser.id)
        .single()

      if (membership) {
        setAlreadyMember(true)
      }
    }

    setLoading(false)
  }

  const handleJoin = async () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/join/${params.code}`)
      return
    }

    setJoining(true)
    setError('')

    try {
      // Add user as pool member
      const { error: joinError } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: user.id,
          payment_status: pool.buy_in === 0 ? 'paid' : 'pending',
          total_points: 0,
          rank: null
        })

      if (joinError) {
        if (joinError.code === '23505') {
          // Already a member (unique constraint)
          router.push(`/pool/${pool.id}`)
          return
        }
        throw joinError
      }

      // Redirect to pool page
      router.push(`/pool/${pool.id}?joined=true`)
    } catch (err) {
      console.error('Join error:', err)
      setError(err.message || 'Failed to join pool')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">PickPoolr</div>
        <p>Loading pool...</p>
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

  if (error && !pool) {
    return (
      <div className="error-screen">
        <div className="logo">PickPoolr</div>
        <div className="error-card">
          <h1>😕 Pool Not Found</h1>
          <p>{error}</p>
          <Link href="/" className="btn-gold">Go to Homepage</Link>
        </div>
        <style jsx>{`
          .error-screen {
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
          .error-card {
            background: var(--ink2);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            max-width: 400px;
          }
          h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.75rem;
            color: var(--silk);
            margin-bottom: 1rem;
          }
          p {
            color: var(--body);
            margin-bottom: 2rem;
          }
        `}</style>
      </div>
    )
  }

  const totalCost = pool.fee_handling === 'on_top' 
    ? pool.buy_in * 1.05 
    : pool.buy_in

  return (
    <div className="join-screen">
      <div className="logo">PickPoolr</div>
      
      <div className="join-card">
        <div className="pool-badge">You're Invited!</div>
        
        <h1>{pool.name}</h1>
        
        {pool.description && (
          <p className="pool-description">{pool.description}</p>
        )}
        
        <div className="pool-details">
          <div className="detail-row">
            <span className="detail-label">Tournament</span>
            <span className="detail-value">World Cup 2026</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Players</span>
            <span className="detail-value">{memberCount} joined</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Buy-in</span>
            <span className="detail-value">{pool.buy_in === 0 ? 'Free' : `$${pool.buy_in}`}</span>
          </div>
          {pool.buy_in > 0 && pool.fee_handling === 'on_top' && (
            <div className="detail-row">
              <span className="detail-label">Platform Fee (5%)</span>
              <span className="detail-value">${(pool.buy_in * 0.05).toFixed(2)}</span>
            </div>
          )}
        </div>

        {pool.buy_in > 0 && (
          <div className="total-box">
            <span>You'll pay</span>
            <span className="total-amount">${totalCost.toFixed(2)}</span>
          </div>
        )}

        {pool.buy_in > 0 && pool.payment_method === 'external' && pool.payment_instructions && (
          <div className="payment-instructions">
            <strong>Payment Instructions:</strong>
            <p>{pool.payment_instructions}</p>
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {alreadyMember ? (
          <>
            <div className="already-member">✓ You're already in this pool!</div>
            <Link href={`/pool/${pool.id}`} className="btn-gold full-width">
              Go to Pool
            </Link>
          </>
        ) : (
          <>
            <button 
              onClick={handleJoin} 
              disabled={joining}
              className="btn-gold full-width"
            >
              {joining ? 'Joining...' : user ? 'Join Pool' : 'Sign in to Join'}
            </button>
            
            {!user && (
              <p className="signin-note">
                Don't have an account? <Link href={`/register?redirect=/join/${params.code}`}>Sign up</Link>
              </p>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .join-screen {
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

        .join-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          text-align: center;
        }

        .pool-badge {
          display: inline-block;
          background: rgba(212, 175, 55, 0.15);
          color: var(--gold);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 1rem;
        }

        .pool-description {
          color: var(--body);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .pool-details {
          background: var(--ink3);
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
        }

        .detail-row:not(:last-child) {
          border-bottom: 1px solid var(--border2);
        }

        .detail-label {
          color: var(--body);
          font-size: 0.9rem;
        }

        .detail-value {
          color: var(--silk);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .total-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid var(--gold);
          border-radius: 8px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }

        .total-box span:first-child {
          color: var(--body);
          font-size: 0.9rem;
        }

        .total-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          color: var(--gold2);
        }

        .payment-instructions {
          background: var(--ink3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
        }

        .payment-instructions strong {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }

        .payment-instructions p {
          color: var(--body);
          font-size: 0.9rem;
          margin: 0;
        }

        .error-msg {
          background: rgba(224, 108, 117, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
          text-align: left;
        }

        .already-member {
          color: var(--success);
          font-size: 0.95rem;
          margin-bottom: 1rem;
          padding: 1rem;
          background: rgba(93, 187, 138, 0.1);
          border-radius: 8px;
        }

        .full-width {
          width: 100%;
        }

        .signin-note {
          color: var(--body);
          font-size: 0.85rem;
          margin-top: 1rem;
        }

        .signin-note :global(a) {
          color: var(--gold);
        }
      `}</style>
    </div>
  )
}
