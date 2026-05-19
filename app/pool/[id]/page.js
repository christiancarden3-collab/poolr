'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../lib/supabase'

export default function PoolPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justCreated = searchParams.get('created') === 'true'
  
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadPool()
  }, [params.id])

  const loadPool = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Fetch pool
    const { data: poolData, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .eq('id', params.id)
      .single()

    if (poolError || !poolData) {
      router.push('/dashboard')
      return
    }

    setPool(poolData)

    // Fetch members with profiles
    const { data: membersData } = await supabase
      .from('pool_members')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('pool_id', params.id)
      .order('created_at', { ascending: true })

    setMembers(membersData || [])
    setLoading(false)
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${pool.invite_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
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

  const isAdmin = members.find(m => m.user_id === user?.id)?.role === 'admin'
  const prizePool = pool.buy_in * members.filter(m => m.payment_status === 'confirmed').length * (pool.fee_handling === 'absorbed' ? 0.95 : 1)

  return (
    <>
      {/* Nav */}
      <nav className="pool-nav">
        <Link href="/dashboard" className="back-link">← My Pools</Link>
        <div className="logo">Poolr</div>
        <div className="nav-right">
          <span className="user-name">{user?.user_metadata?.name || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Sign out</button>
        </div>
      </nav>

      <main className="pool-container">
        {/* Success banner */}
        {justCreated && (
          <div className="success-banner">
            🎉 Pool created! Share the invite link below to get your friends in.
          </div>
        )}

        {/* Pool header */}
        <div className="pool-header">
          <div className="pool-title-section">
            <h1>{pool.name}</h1>
            <div className="pool-meta">
              <span className="pool-badge">{pool.status}</span>
              <span>World Cup 2026</span>
              <span>{pool.buy_in === 0 ? 'Free' : `$${pool.buy_in} buy-in`}</span>
            </div>
          </div>
          
          <div className="pool-prize">
            <span className="prize-label">Prize Pool</span>
            <span className="prize-amount">${prizePool.toFixed(0)}</span>
          </div>
        </div>

        {/* Invite section */}
        <div className="invite-section">
          <h2>Invite Players</h2>
          <p>Share this link with friends to let them join your pool</p>
          
          <div className="invite-link-box">
            <code>{typeof window !== 'undefined' ? `${window.location.origin}/join/${pool.invite_code}` : `poolr.app/join/${pool.invite_code}`}</code>
            <button onClick={copyInviteLink} className="copy-btn">
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="share-buttons">
            <a 
              href={`https://wa.me/?text=Join my World Cup 2026 prediction pool! ${typeof window !== 'undefined' ? `${window.location.origin}/join/${pool.invite_code}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn whatsapp"
            >
              Share on WhatsApp
            </a>
          </div>
        </div>

        {/* Members */}
        <div className="members-section">
          <div className="section-header">
            <h2>Players ({members.length})</h2>
          </div>

          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-row">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.profiles?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="member-details">
                    <span className="member-name">
                      {member.profiles?.name || 'Unknown'}
                      {member.role === 'admin' && <span className="admin-badge">Admin</span>}
                    </span>
                    <span className="member-joined">Joined {new Date(member.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`payment-status ${member.payment_status}`}>
                  {member.payment_status === 'confirmed' ? '✓ Paid' : member.payment_status === 'pending' ? '⏳ Pending' : '—'}
                </div>
              </div>
            ))}

            {members.length === 1 && (
              <div className="empty-members">
                <p>No other players yet. Share the invite link to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Coming soon */}
        <div className="coming-soon-section">
          <h2>Coming Soon</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">⚽</span>
              <h3>Match Predictions</h3>
              <p>Predict scores for every World Cup match</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏆</span>
              <h3>Special Picks</h3>
              <p>Golden Boot, Champion, MVP predictions</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📊</span>
              <h3>Live Leaderboard</h3>
              <p>Real-time standings as matches are played</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Stripe Payments</h3>
              <p>Secure buy-ins and automatic payouts</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .pool-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
        }

        .back-link:hover { color: var(--silk); }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-name {
          color: var(--body);
          font-size: 0.85rem;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--body);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .pool-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .success-banner {
          background: rgba(93, 187, 138, 0.1);
          border: 1px solid var(--success);
          color: var(--success);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .pool-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border2);
        }

        .pool-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .pool-meta {
          display: flex;
          gap: 1rem;
          color: var(--body);
          font-size: 0.85rem;
        }

        .pool-badge {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .pool-prize {
          text-align: right;
        }

        .prize-label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
          margin-bottom: 0.25rem;
        }

        .prize-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          color: var(--gold2);
        }

        .invite-section, .members-section, .coming-soon-section {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .invite-section h2, .members-section h2, .coming-soon-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .invite-section p {
          color: var(--body);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .invite-link-box {
          display: flex;
          gap: 1rem;
          background: var(--ink3);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .invite-link-box code {
          flex: 1;
          color: var(--silk);
          font-family: monospace;
          font-size: 0.9rem;
          word-break: break-all;
        }

        .copy-btn {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .share-buttons {
          display: flex;
          gap: 1rem;
        }

        .share-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 0.85rem;
          text-decoration: none;
          font-weight: 500;
        }

        .share-btn.whatsapp {
          background: #25D366;
          color: white;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .members-list {
          display: flex;
          flex-direction: column;
        }

        .member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border2);
        }

        .member-row:last-child {
          border-bottom: none;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .member-details {
          display: flex;
          flex-direction: column;
        }

        .member-name {
          color: var(--silk);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .admin-badge {
          background: rgba(212, 175, 55, 0.2);
          color: var(--gold);
          font-size: 0.65rem;
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .member-joined {
          color: var(--muted);
          font-size: 0.8rem;
        }

        .payment-status {
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
        }

        .payment-status.confirmed {
          background: rgba(93, 187, 138, 0.1);
          color: var(--success);
        }

        .payment-status.pending {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
        }

        .empty-members {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .feature-card {
          background: var(--ink3);
          border-radius: 8px;
          padding: 1.25rem;
          text-align: center;
        }

        .feature-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .feature-card h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          color: var(--silk);
          margin-bottom: 0.25rem;
        }

        .feature-card p {
          font-size: 0.75rem;
          color: var(--muted);
          margin: 0;
        }
      `}</style>
    </>
  )
}
