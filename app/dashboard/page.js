'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import AppShell from '@/app/components/AppShell'

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
          points: m.total_points || 0
        })))
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  const displayPools = pools

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ color: 'var(--f3)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <AppShell 
      user={user} 
      pageTitle="Dashboard" 
      pageEyebrow="My Account" 
      pageMeta="World Cup 2026 · Jun 11 to Jul 19"
    >
      <div className="wrap">
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-head">
            <div className="card-title">My Pools</div>
            <span className="card-link">{displayPools.length} active</span>
          </div>
          <div className="card-body">
            {displayPools.length === 0 ? (
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

        {/* Match Schedule */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Upcoming Matches · Matchday 1</div>
            <Link href="/scores" className="card-link">Full schedule →</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="match-list">
              <div className="match-date-header">Wednesday, June 11, 2026</div>
              <div className="match-item">
                <div className="match-time">5:00 PM ET</div>
                <div className="match-teams">
                  <div className="match-team">
                    <img src="https://flagcdn.com/w40/mx.png" alt="MEX" className="match-flag" />
                    <span>Mexico</span>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team right">
                    <span>South Africa</span>
                    <img src="https://flagcdn.com/w40/za.png" alt="RSA" className="match-flag" />
                  </div>
                </div>
                <div className="match-group">Group A</div>
              </div>
              <div className="match-item">
                <div className="match-time">8:00 PM ET</div>
                <div className="match-teams">
                  <div className="match-team">
                    <img src="https://flagcdn.com/w40/kr.png" alt="KOR" className="match-flag" />
                    <span>Korea Republic</span>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team right">
                    <span>Czechia</span>
                    <img src="https://flagcdn.com/w40/cz.png" alt="CZE" className="match-flag" />
                  </div>
                </div>
                <div className="match-group">Group A</div>
              </div>

              <div className="match-date-header">Thursday, June 12, 2026</div>
              <div className="match-item">
                <div className="match-time">2:00 PM ET</div>
                <div className="match-teams">
                  <div className="match-team">
                    <img src="https://flagcdn.com/w40/ca.png" alt="CAN" className="match-flag" />
                    <span>Canada</span>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team right">
                    <span>Bosnia and Herzegovina</span>
                    <img src="https://flagcdn.com/w40/ba.png" alt="BIH" className="match-flag" />
                  </div>
                </div>
                <div className="match-group">Group B</div>
              </div>
              <div className="match-item highlight">
                <div className="match-time">8:00 PM ET</div>
                <div className="match-teams">
                  <div className="match-team">
                    <img src="https://flagcdn.com/w40/us.png" alt="USA" className="match-flag" />
                    <span>USA</span>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team right">
                    <span>Paraguay</span>
                    <img src="https://flagcdn.com/w40/py.png" alt="PAR" className="match-flag" />
                  </div>
                </div>
                <div className="match-group">Group D</div>
              </div>

              <div className="match-date-header">Friday, June 13, 2026</div>
              <div className="match-item">
                <div className="match-time">5:00 PM ET</div>
                <div className="match-teams">
                  <div className="match-team">
                    <img src="https://flagcdn.com/w40/br.png" alt="BRA" className="match-flag" />
                    <span>Brazil</span>
                  </div>
                  <span className="match-vs">vs</span>
                  <div className="match-team right">
                    <span>Morocco</span>
                    <img src="https://flagcdn.com/w40/ma.png" alt="MAR" className="match-flag" />
                  </div>
                </div>
                <div className="match-group">Group C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament overview */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">World Cup 2026 · Overview</div>
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

        /* MATCH SCHEDULE */
        .match-list { }
        .match-date-header {
          background: var(--bg3);
          padding: 0.5rem 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          border-bottom: 1px solid var(--line);
        }
        .match-item {
          display: grid;
          grid-template-columns: 80px 1fr 70px;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .match-item:last-child { border-bottom: none; }
        .match-item:hover { background: rgba(255,255,255,0.02); }
        .match-item.highlight { background: rgba(201,168,76,0.05); }
        .match-time {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--f3);
        }
        .match-teams {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .match-team {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--f1);
          min-width: 140px;
        }
        .match-team.right {
          justify-content: flex-end;
          text-align: right;
        }
        .match-flag {
          width: 24px;
          height: 16px;
          border-radius: 2px;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .match-vs {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--f4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .match-group {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f4);
          text-align: right;
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
          display: inline-block;
        }
        .btn-primary:hover { background: var(--gold2); }

        @media (max-width: 768px) {
          .wrap { padding: 1rem; }
          .pool-grid { grid-template-columns: 1fr; }
          .overview-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </AppShell>
  )
}
