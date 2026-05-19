'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { WC2026_TOURNAMENT } from '../../lib/wc2026-data'
import * as espn from '../styles/espn-theme'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [myPools, setMyPools] = useState([])
  const [joinedPools, setJoinedPools] = useState([])
  const [joinCode, setJoinCode] = useState('')
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    // Fetch pools I created (as commissioner)
    const { data: createdPools } = await supabase
      .from('pools')
      .select('*')
      .eq('commissioner_id', currentUser.id)
      .order('created_at', { ascending: false })
    
    // Fetch pools I joined
    const { data: memberships } = await supabase
      .from('pool_members')
      .select(`
        pool_id,
        total_points,
        rank,
        payment_status,
        pools:pool_id (
          id,
          name,
          buy_in,
          status,
          commissioner_id,
          created_at
        )
      `)
      .eq('user_id', currentUser.id)
    
    // Process my pools (as commissioner)
    if (createdPools) {
      const poolsWithCounts = await Promise.all(
        createdPools.map(async (pool) => {
          const { count } = await supabase
            .from('pool_members')
            .select('*', { count: 'exact', head: true })
            .eq('pool_id', pool.id)
          
          // Get user's rank in this pool
          const myMember = memberships?.find(m => m.pool_id === pool.id)
          
          return {
            ...pool,
            isCommissioner: true,
            playerCount: count || 0,
            prizePool: (pool.buy_in || 0) * (count || 0) * 0.95,
            myRank: myMember?.rank,
            myPoints: myMember?.total_points,
          }
        })
      )
      setMyPools(poolsWithCounts)
    }
    
    // Process joined pools (where I'm not the commissioner)
    if (memberships) {
      const joined = memberships
        .filter(m => m.pools && m.pools.commissioner_id !== currentUser.id)
        .map(m => ({
          ...m.pools,
          myRank: m.rank,
          myPoints: m.total_points,
        }))
      
      const poolsWithCounts = await Promise.all(
        joined.map(async (pool) => {
          const { count } = await supabase
            .from('pool_members')
            .select('*', { count: 'exact', head: true })
            .eq('pool_id', pool.id)
          
          return {
            ...pool,
            isCommissioner: false,
            playerCount: count || 0,
            prizePool: (pool.buy_in || 0) * (count || 0) * 0.95,
          }
        })
      )
      setJoinedPools(poolsWithCounts)
    }
    
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleJoinSubmit = (e) => {
    e.preventDefault()
    if (joinCode.trim()) {
      router.push(`/join/${joinCode.trim().toUpperCase()}`)
    }
  }

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || ''
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return name[0]?.toUpperCase() || '?'
  }

  const allPools = [...myPools, ...joinedPools]

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader">
          <div className="logo">Pick<span>Poolr</span></div>
          <div className="loading-bar"><div className="loading-fill"></div></div>
        </div>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
          }
          .loader { text-align: center; }
          .logo {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 2rem;
            font-weight: 900;
            color: var(--white);
            margin-bottom: 1.5rem;
            text-transform: uppercase;
          }
          .logo span { color: var(--gold); }
          .loading-bar {
            width: 120px;
            height: 4px;
            background: var(--bg3);
            border-radius: 2px;
            overflow: hidden;
          }
          .loading-fill {
            height: 100%;
            width: 40%;
            background: var(--gold);
            border-radius: 2px;
            animation: loading 1s ease-in-out infinite;
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          ${espn.espnStyles}
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-links">
          <span className="tb-link active">Dashboard</span>
          <span className="tb-link">My Pools</span>
          <span className="tb-link">World Cup 2026</span>
          <span className="tb-link">Results</span>
        </div>
        <div className="topbar-right">
          <div className="user-pill">
            <div className="user-avatar">{getUserInitials()}</div>
            {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="main-nav">
        <Link href="/dashboard" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <span className="nav-item active">Home</span>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Account</div>
            <div className="ph-title">Dashboard</div>
            <div className="ph-meta">{WC2026_TOURNAMENT.name} — {WC2026_TOURNAMENT.startDate.replace('2026-', 'Jun ')} to {WC2026_TOURNAMENT.endDate.replace('2026-', 'Jul ')}</div>
          </div>
          <div className="ph-right">
            <Link href="/create" className="btn-primary">+ Create Pool</Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="wrap">
        {/* My Pools Card */}
        <div className="card" style={{marginBottom: '2rem'}}>
          <div className="card-head">
            <div className="card-title">My Pools</div>
            <span className="card-link">{allPools.length} active</span>
          </div>
          <div className="card-body">
            {allPools.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏆</div>
                <h2>No pools yet</h2>
                <p>Create your first prediction pool or join one with an invite code.</p>
                <div className="empty-actions">
                  <Link href="/create" className="btn-primary">Create a Pool</Link>
                  <button onClick={() => setShowJoinModal(true)} className="btn-ghost">Join with Code</button>
                </div>
              </div>
            ) : (
              <div className="pool-grid">
                {allPools.map((pool) => (
                  <Link href={`/pool/${pool.id}`} key={pool.id} className="pool-card">
                    <div className="pc-banner">
                      <div>
                        <div className="pc-name">{pool.name}</div>
                        <div className="pc-tournament">{WC2026_TOURNAMENT.name}</div>
                      </div>
                      <span className={`pc-role ${pool.isCommissioner ? '' : 'player'}`}>
                        {pool.isCommissioner ? 'Commissioner' : 'Player'}
                      </span>
                    </div>
                    <div className="pc-body">
                      <div className="pc-stats">
                        <div className="pc-stat">
                          <div className="pc-stat-val">{pool.playerCount}</div>
                          <div className="pc-stat-label">Players</div>
                        </div>
                        <div className="pc-stat">
                          <div className="pc-stat-val" style={{color: pool.myRank ? 'var(--gold)' : 'var(--f3)'}}>
                            {pool.myRank ? `${pool.myRank}${getRankSuffix(pool.myRank)}` : '—'}
                          </div>
                          <div className="pc-stat-label">Your rank</div>
                        </div>
                        <div className="pc-stat">
                          <div className="pc-stat-val">
                            {pool.buy_in === 0 ? 'Free' : `$${pool.prizePool?.toFixed(0) || 0}`}
                          </div>
                          <div className="pc-stat-label">Pot</div>
                        </div>
                      </div>
                      <div className="pc-footer">
                        <div className="pc-status">
                          <span className={`status-dot ${pool.status === 'open' ? 'dot-upcoming' : pool.status === 'live' ? 'dot-live' : 'dot-done'}`}></span>
                          <span style={{color: pool.status === 'live' ? 'var(--red)' : pool.status === 'open' ? 'var(--gold)' : 'var(--f4)'}}>
                            {pool.status === 'open' ? 'Starting Jun 11' : pool.status === 'live' ? 'Live' : 'Completed'}
                          </span>
                        </div>
                        <span className="pc-cta">Open Pool</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tournament Overview */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">World Cup 2026 — Group Stage</div>
            <span className="card-link">Full schedule</span>
          </div>
          <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--line)', borderRadius: '3px', overflow: 'hidden'}}>
            <div className="stat-cell">
              <div className="stat-label">Start</div>
              <div className="stat-value">Jun 11</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Teams</div>
              <div className="stat-value">48</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Matches</div>
              <div className="stat-value">104</div>
            </div>
            <div className="stat-cell">
              <div className="stat-label">Final</div>
              <div className="stat-value">Jul 19</div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowJoinModal(false)}>×</button>
            <div className="modal-icon">🎟️</div>
            <h2>Join a Pool</h2>
            <p>Enter the invite code shared by your pool commissioner</p>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={8}
                autoFocus
                className="code-input"
              />
              <button type="submit" className="btn-primary w-full" disabled={!joinCode.trim()}>
                Join Pool
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        ${espn.espnStyles}
        ${espn.topbarStyles}
        ${espn.navStyles}
        ${espn.pageHeaderStyles}
        ${espn.cardStyles}
        ${espn.poolCardStyles}
        ${espn.formStyles}
        ${espn.layoutStyles}

        .logout-btn {
          background: transparent;
          border: 1px solid var(--f4);
          color: var(--f3);
          width: 30px;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .logout-btn:hover {
          border-color: var(--red);
          color: var(--red);
        }

        .stat-cell {
          background: var(--bg);
          padding: 0.75rem;
          text-align: center;
        }
        .stat-cell .stat-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--f4);
          margin-bottom: 4px;
        }
        .stat-cell .stat-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          color: var(--gold);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .empty-state h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--white);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .empty-state p {
          color: var(--f3);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .empty-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 2rem;
          width: 100%;
          max-width: 360px;
          position: relative;
          text-align: center;
        }
        .modal-close {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--f4);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }
        .modal-close:hover {
          color: var(--f1);
        }
        .modal-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .modal h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--white);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .modal p {
          color: var(--f3);
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
        }
        .code-input {
          text-align: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.85rem;
          margin-bottom: 1rem;
          background: var(--bg3);
          border: 1px solid var(--f4);
          color: var(--white);
          width: 100%;
          border-radius: 3px;
        }
        .code-input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .w-full {
          width: 100%;
        }
      `}</style>
    </>
  )
}

function getRankSuffix(rank) {
  if (rank === 1) return 'st'
  if (rank === 2) return 'nd'
  if (rank === 3) return 'rd'
  return 'th'
}
