'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Load user's pools
      const { data: memberships } = await supabase
        .from('pool_members')
        .select('*, pool:pools(*)')
        .eq('user_id', currentUser.id)

      if (memberships) {
        setPools(memberships.map(m => ({
          ...m.pool,
          role: m.role,
          points: m.points || 0
        })))
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const meta = user.user_metadata || {}
    const first = meta.first_name?.[0] || user.email?.[0] || 'U'
    const last = meta.last_name?.[0] || ''
    return (first + last).toUpperCase()
  }

  const getUserName = () => {
    if (!user) return 'User'
    const meta = user.user_metadata || {}
    if (meta.first_name) return `${meta.first_name} ${meta.last_name?.[0] || ''}.`
    return user.email?.split('@')[0] || 'User'
  }

  // No mock data - show empty state if no pools
  const displayPools = pools

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-links">
          <a href="/dashboard" className="tb-link active">Dashboard</a>
          <a href="/browse" className="tb-link">Browse Pools</a>
          <a href="/profile" className="tb-link">My Profile</a>
        </div>
        <div className="topbar-right">
          <Link href="/profile" className="user-pill">
            <div className="user-avatar">{getUserInitials()}</div>
            {getUserName()}
          </Link>
          <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">Pick<span>Poolr</span></a>
        <div className="nav-items">
          <a href="/" className="nav-item">Home</a>
          <a href="/dashboard" className="nav-item active">My Pools</a>
          <a href="/browse" className="nav-item">Browse</a>
        </div>
        <a href="/create" className="nav-cta">+ Create Pool</a>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label">Live</div>
        <div className="ticker-items">
          <span className="ticker-item">ARG 3 – 1 FRA &nbsp;●&nbsp; 78&apos;</span>
          <span className="ticker-item">BRA 2 – 2 GER &nbsp;●&nbsp; 86&apos;</span>
          <span className="ticker-item">MEX 1 – 0 ZAF &nbsp;●&nbsp; FT</span>
          <span className="ticker-item">ESP 2 – 0 CPV &nbsp;●&nbsp; HT</span>
          <span className="ticker-item">ENG 1 – 1 CRO &nbsp;●&nbsp; 67&apos;</span>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Account</div>
            <div className="ph-title">Dashboard</div>
            <div className="ph-meta">World Cup 2026 · Jun 11 to Jul 19</div>
          </div>
          <div className="ph-right">
            <Link href="/create" className="btn-primary">+ Create Pool</Link>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-head">
            <div className="card-title">My Pools</div>
            <span className="card-link">{displayPools.length} active</span>
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--f3)' }}>Loading...</div>
            ) : displayPools.length === 0 ? (
              <div className="empty-state">
                <i className="ti ti-ball-football empty-icon"></i>
                <div className="empty-title">No pools yet</div>
                <div className="empty-text">Create your first pool or join one to get started</div>
                <Link href="/create" className="btn-primary">+ Create Pool</Link>
              </div>
            ) : (
              <div className="pool-grid">
                {displayPools.map((pool, i) => (
                  <Link key={pool.id || i} href={`/pool/${pool.id || i + 1}`} className="pool-card">
                    <div className="pc-banner">
                      <div>
                        <div className="pc-name">{pool.name}</div>
                        <div className="pc-tournament">{pool.tournament_name || 'FIFA World Cup 2026'}</div>
                      </div>
                      <span className={`pc-role ${pool.role === 'player' ? 'player' : ''}`}>
                        {pool.role || 'Commissioner'}
                      </span>
                    </div>
                    <div className="pc-body">
                      <div className="pc-stats">
                        <div className="pc-stat">
                          <div className="pc-stat-val">{pool.player_count || 0}</div>
                          <div className="pc-stat-label">Players</div>
                        </div>
                        <div className="pc-stat">
                          <div className="pc-stat-val" style={{ color: pool.user_rank ? 'var(--gold)' : 'var(--f3)' }}>
                            {pool.user_rank ? `${pool.user_rank}${pool.user_rank === 1 ? 'st' : pool.user_rank === 2 ? 'nd' : pool.user_rank === 3 ? 'rd' : 'th'}` : '-'}
                          </div>
                          <div className="pc-stat-label">Your rank</div>
                        </div>
                        <div className="pc-stat">
                          <div className="pc-stat-val">{pool.pot_amount > 0 ? `$${pool.pot_amount}` : 'Free'}</div>
                          <div className="pc-stat-label">Pot</div>
                        </div>
                      </div>
                      <div className="pc-footer">
                        <div className="pc-status">
                          <span className={`status-dot ${pool.status === 'live' ? 'dot-live' : pool.status === 'upcoming' ? 'dot-upcoming' : 'dot-done'}`}></span>
                          <span style={{ color: pool.status === 'live' ? 'var(--red)' : pool.status === 'upcoming' ? 'var(--gold)' : 'var(--f4)' }}>
                            {pool.status === 'live' ? 'Live' : pool.status === 'upcoming' ? 'Starting Jun 11' : 'Completed'}
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

        {/* Tournament overview */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">World Cup 2026 · Group Stage</div>
            <span className="card-link">Full schedule</span>
          </div>
          <div className="card-body">
            <div className="overview-grid">
              <div className="overview-item">
                <div className="overview-label">Start</div>
                <div className="overview-val">Jun 11</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Teams</div>
                <div className="overview-val">48</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Matches</div>
                <div className="overview-val">104</div>
              </div>
              <div className="overview-item">
                <div className="overview-label">Final</div>
                <div className="overview-val">Jul 19</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* TOPBAR */
        .topbar {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 42px;
        }
        .topbar-links {
          display: flex;
          height: 100%;
        }
        .tb-link {
          display: flex;
          align-items: center;
          padding: 0 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          border-right: 1px solid var(--line);
          cursor: pointer;
          transition: all 0.15s;
        }
        .tb-link:first-child { border-left: 1px solid var(--line); }
        .tb-link:hover, .tb-link.active {
          color: var(--f1);
          background: rgba(255,255,255,0.03);
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--f2);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s;
        }
        .user-pill:hover { color: var(--gold); }
        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 900;
          color: #000;
        }
        .signout-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f4);
          background: transparent;
          border: 1px solid var(--f4);
          padding: 0.25rem 0.6rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .signout-btn:hover { color: var(--f2); border-color: var(--f2); }

        /* NAV */
        nav {
          background: var(--bg);
          border-bottom: 3px solid var(--gold);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          height: 56px;
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .nav-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: var(--white);
          text-transform: uppercase;
          margin-right: 2rem;
          padding-right: 2rem;
          border-right: 1px solid var(--f4);
          text-decoration: none;
        }
        .nav-logo span { color: var(--gold); }
        .nav-items {
          display: flex;
          height: 100%;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          border-bottom: 3px solid transparent;
          margin-bottom: -3px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta {
          margin-left: auto;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.5rem 1.25rem;
          border-radius: 2px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: background 0.15s;
        }
        .nav-cta:hover { background: var(--gold2); }

        /* TICKER */
        .ticker {
          background: var(--gold);
          padding: 0 2rem;
          height: 30px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          overflow: hidden;
        }
        .ticker-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
          border-right: 1px solid rgba(0,0,0,0.2);
          padding-right: 1.5rem;
        }
        .ticker-items {
          display: flex;
          gap: 2rem;
        }
        .ticker-item {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
        }

        /* PAGE HEADER */
        .page-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          padding: 1.25rem 2rem;
        }
        .page-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .ph-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.3rem;
        }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--white);
        }
        .ph-meta {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--f3);
          margin-top: 0.2rem;
        }
        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.6rem 1.5rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: var(--gold2); }

        /* LAYOUT */
        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* CARDS */
        .card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .card-head {
          background: var(--bg3);
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--white);
        }
        .card-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--gold);
          cursor: pointer;
          text-decoration: none;
        }
        .card-body { padding: 1rem; }

        /* POOL CARDS */
        .pool-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1rem;
        }
        .pool-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.15s;
          text-decoration: none;
          display: block;
        }
        .pool-card:hover { border-color: var(--gold); }
        .pc-banner {
          background: var(--bg3);
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pc-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--white);
        }
        .pc-tournament {
          font-size: 0.72rem;
          color: var(--f3);
          margin-top: 2px;
        }
        .pc-body { padding: 1rem; }
        .pc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid var(--line);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .pc-stat {
          padding: 0.6rem 0.75rem;
          border-right: 1px solid var(--line);
          text-align: center;
        }
        .pc-stat:last-child { border-right: none; }
        .pc-stat-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
        }
        .pc-stat-label {
          font-size: 0.62rem;
          color: var(--f4);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
        }
        .pc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pc-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .dot-live { background: var(--red); animation: pulse 1.4s ease infinite; }
        .dot-upcoming { background: var(--gold); }
        .dot-done { background: var(--f4); }
        .pc-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
        }
        .pc-role {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
          background: rgba(201,168,76,0.12);
          color: var(--gold);
          border: 1px solid var(--gold-line);
        }
        .pc-role.player {
          background: rgba(44,182,125,0.1);
          color: var(--green);
          border-color: rgba(44,182,125,0.25);
        }

        /* OVERVIEW */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--line);
          border-radius: 3px;
          overflow: hidden;
        }
        .overview-item {
          background: var(--bg);
          padding: 0.75rem;
          text-align: center;
        }
        .overview-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--f4);
          margin-bottom: 4px;
        }
        .overview-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          color: var(--gold);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        /* EMPTY STATE */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
        }
        .empty-icon {
          font-size: 4rem;
          color: var(--gold);
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }
        .empty-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--white);
          margin-bottom: 0.75rem;
        }
        .empty-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--f3);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .topbar { display: none; }
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .pool-grid { grid-template-columns: 1fr; }
          .overview-grid { grid-template-columns: repeat(2, 1fr); }
          .page-header { padding: 1rem; }
          .page-header-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>
    </>
  )
}
