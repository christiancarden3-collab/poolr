'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function PoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState('picks')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)

        // Fetch pool with commissioner info
        const { data: poolData, error: poolError } = await supabase
          .from('pools')
          .select(`
            *,
            profiles:commissioner_id (
              id,
              name
            )
          `)
          .eq('id', params.id)
          .single()

        if (poolError || !poolData) {
          setError('Pool not found')
          setLoading(false)
          return
        }

        // Format commissioner name
        const commName = poolData.profiles?.name || 'Unknown'
        const commInitials = commName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

        // Fetch pool members with their profiles
        const { data: membersData, error: membersError } = await supabase
          .from('pool_members')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              team_name
            )
          `)
          .eq('pool_id', params.id)
          .order('total_points', { ascending: false, nullsFirst: false })

        // Format members for leaderboard
        const formattedMembers = (membersData || []).map((m, index) => {
          const teamName = m.profiles?.team_name || null
          const fullName = m.profiles?.name || 'Player'
          return {
            rank: index + 1,
            user_id: m.user_id,
            teamName: teamName,
            fullName: fullName,
            displayName: teamName || fullName,
            points: m.total_points || 0,
            paid: m.payment_status === 'paid',
            isYou: m.user_id === currentUser.id,
            change: '-' // TODO: calculate from previous standings
          }
        })

        // Calculate pot amount
        const buyIn = poolData.buy_in || 0
        const playerCount = formattedMembers.length
        const platformFee = poolData.fee_handling === 'from_pot' ? 0.05 : 0
        const potAmount = buyIn * playerCount * (1 - platformFee)

        // Get current user's stats
        const currentUserMember = formattedMembers.find(m => m.user_id === currentUser.id)

        setPool({
          ...poolData,
          commissioner_name: commName,
          commissioner_initials: commInitials,
          player_count: playerCount,
          pot_amount: potAmount,
          user_points: currentUserMember?.points || 0,
          user_rank: currentUserMember?.rank || '-',
          isCommissioner: poolData.commissioner_id === currentUser.id
        })

        setMembers(formattedMembers)
      } catch (err) {
        console.error('Error loading pool:', err)
        setError('Failed to load pool')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [router, params.id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <>
        <nav>
          <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', color: 'var(--f3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <div style={{ fontSize: '1.2rem', color: 'var(--f1)', marginBottom: '0.5rem' }}>Pool Not Found</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</div>
          <Link href="/dashboard" style={{ color: 'var(--gold)' }}>← Back to dashboard</Link>
        </div>
        <style jsx global>{`
          nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; }
          .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; text-decoration: none; }
          .nav-logo span { color: var(--gold); }
        `}</style>
      </>
    )
  }

  // Format display values
  const buyinDisplay = pool?.buy_in ? `$${pool.buy_in}` : 'Free'
  const potDisplay = pool?.pot_amount > 0 ? `$${pool.pot_amount.toFixed(0)}` : 'Free'
  const visibilityDisplay = pool?.visibility === 'private' ? 'Private' : 'Public'
  const rankSuffix = pool?.user_rank === 1 ? 'st' : pool?.user_rank === 2 ? 'nd' : pool?.user_rank === 3 ? 'rd' : 'th'

  // Get user display name for header
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-links">
          <Link href="/dashboard" className="tb-link">Dashboard</Link>
          <span className="tb-link active">My Pools</span>
          <span className="tb-link">World Cup 2026</span>
          <span className="tb-link">Results</span>
        </div>
        <div className="topbar-right">
          <div className="user-pill">
            <div className="user-avatar">{userInitials}</div>
            {userName}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <span className="nav-item active">{pool?.name || 'Pool'}</span>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label">World Cup 2026</div>
        <div className="ticker-items">
          <span className="ticker-item">48 Teams</span>
          <span className="ticker-item">104 Matches</span>
          <span className="ticker-item">Kicks off June 11, 2026</span>
        </div>
      </div>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">{pool?.name}</div>
            <div className="ph-meta">
              {pool?.tournament || 'FIFA World Cup 2026'} · {pool?.player_count} player{pool?.player_count !== 1 ? 's' : ''} · {visibilityDisplay} · Commissioner: {pool?.commissioner_name}
              {pool?.isCommissioner && <span className="commish-badge">You</span>}
            </div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{pool?.user_points} pts</div>
            <div className="ph-rank">
              {typeof pool?.user_rank === 'number' ? `${pool.user_rank}${rankSuffix} place` : 'Not ranked'}
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="tab-nav">
        <div className="tab-nav-inner">
          <Link href={`/pool/${params.id}/predictions`} className={`tab ${activeTab === 'picks' ? 'active' : ''}`}>
            Match Picks
          </Link>
          <Link href={`/pool/${params.id}/special-picks`} className={`tab ${activeTab === 'special' ? 'active' : ''}`}>
            Special Picks
          </Link>
          <span className={`tab ${activeTab === 'lb' ? 'active' : ''}`} onClick={() => setActiveTab('lb')}>Leaderboard</span>
          {pool?.isCommissioner && (
            <span className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Quick actions */}
            <div className="action-cards">
              <Link href={`/pool/${params.id}/predictions`} className="action-card">
                <div className="ac-icon">🎯</div>
                <div className="ac-content">
                  <div className="ac-title">Match Picks</div>
                  <div className="ac-desc">Predict scorelines for each matchday</div>
                </div>
                <div className="ac-arrow">→</div>
              </Link>
              <Link href={`/pool/${params.id}/special-picks`} className="action-card">
                <div className="ac-icon">🏆</div>
                <div className="ac-content">
                  <div className="ac-title">Special Picks</div>
                  <div className="ac-desc">Champion, top scorer, goalkeeper</div>
                </div>
                <div className="ac-arrow">→</div>
              </Link>
            </div>

            {/* Deadline banner */}
            <div className="deadline-banner">
              <div>
                <div className="db-left">Tournament starts Jun 11, 2026</div>
                <div className="db-sub">Submit all picks before the first match kicks off</div>
              </div>
              <div className="db-countdown">Coming Soon</div>
            </div>

            {/* Leaderboard preview */}
            <div className="card">
              <div className="card-head">
                <div className="card-title">Standings</div>
                <span className="card-link">Full table →</span>
              </div>
              {members.length === 0 ? (
                <div className="card-body" style={{ textAlign: 'center', color: 'var(--f3)', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                  <div>No players yet</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Share your invite link to get started</div>
                </div>
              ) : (
                <>
                  <div className="lb-cols">
                    <div className="lb-col-label">#</div>
                    <div className="lb-col-label">+/-</div>
                    <div className="lb-col-label">Player</div>
                    <div className="lb-col-label r">Pts</div>
                  </div>
                  {members.slice(0, 5).map((player, i) => (
                    <div key={i} className={`lb-row ${player.isYou ? 'you' : ''}`}>
                      <div className={`lb-rank ${player.rank === 1 ? 'rank-gold' : player.rank === 2 ? 'rank-silver' : player.rank === 3 ? 'rank-bronze' : 'rank-other'}`}>
                        {player.rank}
                      </div>
                      <div className={`lb-mv ${player.change.startsWith('+') ? 'mv-up' : player.change.startsWith('-') && player.change !== '-' ? 'mv-dn' : 'mv-flat'}`}>
                        {player.change}
                      </div>
                      <div className="lb-player">
                        <div className="lb-player-main">
                          <span className="lb-team-name">{player.displayName}</span>
                          {player.isYou && <span className="lb-you-tag">(You)</span>}
                          {player.paid && <span className="paid-dot"></span>}
                        </div>
                        {player.teamName && <div className="lb-real-name">{player.fullName}</div>}
                      </div>
                      <div className="lb-pts">{player.points}</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Invite link for commissioner */}
            {pool?.isCommissioner && pool?.invite_code && (
              <div className="card">
                <div className="card-head">
                  <div className="card-title">Invite Link</div>
                </div>
                <div className="card-body">
                  <div className="invite-link-box">
                    <code>pickpoolr.com/join/{pool.invite_code}</code>
                    <button onClick={() => navigator.clipboard.writeText(`https://pickpoolr.com/join/${pool.invite_code}`)}>Copy</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Pool Info</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Tournament</div><div className="sc-val">{pool?.tournament || 'FIFA World Cup 2026'}</div></div>
                <div className="sc-row"><div className="sc-label">Players</div><div className="sc-val">{pool?.player_count}</div></div>
                <div className="sc-row"><div className="sc-label">Buy-in</div><div className="sc-val">{buyinDisplay}</div></div>
                <div className="sc-row"><div className="sc-label">Prize pot</div><div className="sc-val gold">{potDisplay}</div></div>
                <div className="sc-row"><div className="sc-label">Status</div><div className="sc-val" style={{ color: 'var(--gold)' }}>Open</div></div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Your Stats</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Total points</div><div className="sc-val gold">{pool?.user_points || 0}</div></div>
                <div className="sc-row"><div className="sc-label">Current rank</div><div className="sc-val gold">{typeof pool?.user_rank === 'number' ? `${pool.user_rank}${rankSuffix}` : '-'}</div></div>
                <div className="sc-row"><div className="sc-label">Picks submitted</div><div className="sc-val">0 / 48</div></div>
                <div className="sc-row"><div className="sc-label">Special picks</div><div className="sc-val">0 / 4</div></div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Scoring</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Exact scoreline</div><div className="sc-val gold">3 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct winner + 1 score</div><div className="sc-val gold">2 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct result only</div><div className="sc-val gold">1 pt</div></div>
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
        .topbar-links { display: flex; height: 100%; }
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
        .tb-link:hover, .tb-link.active { color: var(--f1); background: rgba(255,255,255,0.03); }
        .topbar-right { display: flex; align-items: center; gap: 1rem; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--f2); }
        .user-avatar {
          width: 26px; height: 26px; border-radius: 50%; background: var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 900; color: #000;
        }

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
        .nav-items { display: flex; height: 100%; }
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
        .ticker-items { display: flex; gap: 2rem; }
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
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .commish-badge {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(201,168,76,0.15);
          border: 1px solid var(--gold-line);
          padding: 0.1rem 0.4rem;
          border-radius: 2px;
        }
        .ph-right { text-align: right; }
        .ph-score {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: var(--gold);
          line-height: 1;
        }
        .ph-rank {
          font-size: 0.72rem;
          color: var(--f3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'Barlow Condensed', sans-serif;
          margin-top: 2px;
        }

        /* TAB NAV */
        .tab-nav {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
        }
        .tab-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0 1.5rem;
          height: 44px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .tab:hover { color: var(--f1); }
        .tab.active { color: var(--white); border-bottom-color: var(--gold); }

        /* LAYOUT */
        .wrap {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
        }
        .two-col {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2rem;
          align-items: start;
        }

        /* ACTION CARDS */
        .action-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .action-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
        }
        .action-card:hover { border-color: var(--gold); }
        .ac-icon { font-size: 1.5rem; }
        .ac-content { flex: 1; }
        .ac-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--white);
        }
        .ac-desc { font-size: 0.72rem; color: var(--f3); margin-top: 2px; }
        .ac-arrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--gold);
        }

        /* DEADLINE BANNER */
        .deadline-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(201,168,76,0.07);
          border: 1px solid var(--gold-line);
          border-radius: 4px;
          padding: 0.6rem 1rem;
          margin-bottom: 1.25rem;
        }
        .db-left {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--gold);
        }
        .db-sub { font-size: 0.7rem; color: var(--f3); margin-top: 1px; }
        .db-countdown {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--gold);
          letter-spacing: 0.04em;
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

        /* INVITE LINK */
        .invite-link-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg3);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
        }
        .invite-link-box code {
          flex: 1;
          font-size: 0.8rem;
          color: var(--gold);
          word-break: break-all;
        }
        .invite-link-box button {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 2px;
          cursor: pointer;
        }

        /* LEADERBOARD */
        .lb-cols {
          display: grid;
          grid-template-columns: 36px 30px 1fr 60px;
          align-items: center;
          gap: 0 0.75rem;
          padding: 0.4rem 1rem;
          border-bottom: 1px solid var(--line);
        }
        .lb-col-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f4);
          font-family: 'Barlow Condensed', sans-serif;
        }
        .lb-col-label.r { text-align: right; }
        .lb-row {
          display: grid;
          grid-template-columns: 36px 30px 1fr 60px;
          align-items: center;
          gap: 0 0.75rem;
          padding: 0.55rem 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
          cursor: default;
        }
        .lb-row:last-child { border-bottom: none; }
        .lb-row:hover { background: rgba(255,255,255,0.02); }
        .lb-row.you { background: rgba(201,168,76,0.05); }
        .lb-rank {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          text-align: center;
        }
        .rank-gold { color: var(--gold2); }
        .rank-silver { color: #b0c4de; }
        .rank-bronze { color: #cd7f32; }
        .rank-other { color: var(--f3); }
        .lb-mv {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          text-align: center;
        }
        .mv-up { color: var(--green); }
        .mv-dn { color: var(--red); }
        .mv-flat { color: var(--f4); }
        .lb-player {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.15rem;
        }
        .lb-player-main {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .lb-team-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--f1);
        }
        .lb-real-name {
          font-size: 0.68rem;
          color: var(--f4);
          font-weight: 400;
        }
        .paid-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--green);
          display: inline-block;
          flex-shrink: 0;
        }
        .lb-you-tag {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(201,168,76,0.12);
          border: 1px solid var(--gold-line);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }
        .lb-pts {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--f1);
          text-align: right;
        }

        /* SIDEBAR */
        .sc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .sc-row:last-child { border-bottom: none; }
        .sc-label { font-size: 0.75rem; color: var(--f3); }
        .sc-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--f1);
        }
        .sc-val.gold { color: var(--gold); }
        .sc-val.green { color: var(--green); }

        @media (max-width: 900px) {
          .topbar { display: none; }
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .two-col { grid-template-columns: 1fr; }
          .action-cards { grid-template-columns: 1fr; }
          .page-header { padding: 1rem; }
          .page-header-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .ph-right { text-align: left; }
        }
      `}</style>
    </>
  )
}
