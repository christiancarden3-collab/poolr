'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../lib/supabase'
import { WC2026_TOURNAMENT } from '../../../lib/wc2026-data'
import * as espn from '../../styles/espn-theme'

// Leaderboard Component
function Leaderboard({ members, currentUserId, commissionerId }) {
  return (
    <div className="leaderboard">
      <div className="lb-cols">
        <div className="lb-col-label" style={{textAlign: 'center'}}>#</div>
        <div className="lb-col-label" style={{textAlign: 'center'}}>+/-</div>
        <div className="lb-col-label">Player</div>
        <div className="lb-col-label r">Total</div>
        <div className="lb-col-label r">Picks</div>
        <div className="lb-col-label r">Special</div>
      </div>
      {members.map((member) => {
        const isYou = member.user_id === currentUserId
        const movement = (member.previous_rank || member.rank) - member.rank
        const mvStr = movement > 0 ? `+${movement}` : movement < 0 ? `${movement}` : '—'
        const mvClass = movement > 0 ? 'mv-up' : movement < 0 ? 'mv-dn' : 'mv-flat'
        const rankClass = member.rank === 1 ? 'rank-gold' : member.rank === 2 ? 'rank-silver' : member.rank === 3 ? 'rank-bronze' : 'rank-other'
        
        return (
          <div key={member.id} className={`lb-row ${isYou ? 'you' : ''}`}>
            <div className={`lb-rank ${rankClass}`}>{member.rank}</div>
            <div className={`lb-mv ${mvClass}`}>{mvStr}</div>
            <div className="lb-player">
              {isYou && <span className="lb-you-tag">You</span>}
              {member.profiles?.name || 'Unknown'}
              {member.payment_status === 'paid' && <span className="paid-dot" title="Paid"></span>}
            </div>
            <div className="lb-pts">{member.total_points || 0}</div>
            <div className="lb-rd">{member.match_points || 0}</div>
            <div className="lb-rd">{member.special_points || 0}</div>
          </div>
        )
      })}
      <style jsx>{`
        ${espn.leaderboardStyles}
      `}</style>
    </div>
  )
}

// Settings Tab Component
function SettingsTab({ pool, onUpdate }) {
  const [name, setName] = useState(pool.name)
  const [description, setDescription] = useState(pool.description || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('pools')
      .update({ name, description })
      .eq('id', pool.id)
    
    setSaving(false)
    if (!error && onUpdate) {
      onUpdate({ ...pool, name, description })
    }
  }

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${pool.invite_code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="two-col">
      <div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Pool Settings</div>
            <span style={{fontSize: '0.72rem', color: 'var(--gold)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase'}}>Commissioner only</span>
          </div>
          <div className="card-body">
            <label className="field-label">Pool Name</label>
            <input 
              className="field-input" 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            
            <label className="field-label">Description</label>
            <input 
              className="field-input" 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description..."
            />
            
            <label className="field-label">Invite Link</label>
            <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
              <input 
                className="field-input" 
                style={{marginBottom: 0, flex: 1}} 
                type="text" 
                value={`${typeof window !== 'undefined' ? window.location.origin : 'pickpoolr.com'}/join/${pool.invite_code}`}
                readOnly
              />
              <button className="btn-ghost" onClick={copyInviteLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
      
      <div>
        <div className="card">
          <div className="card-head"><div className="card-title">Pool Info</div></div>
          <div className="card-body">
            <div className="sc-row"><div className="sc-label">Tournament</div><div className="sc-val">WC 2026</div></div>
            <div className="sc-row"><div className="sc-label">Players</div><div className="sc-val">{pool.playerCount || 0} / unlimited</div></div>
            <div className="sc-row"><div className="sc-label">Pool type</div><div className="sc-val">{pool.buy_in > 0 ? `$${pool.buy_in} buy-in` : 'Free'}</div></div>
            <div className="sc-row"><div className="sc-label">Privacy</div><div className="sc-val green">Private</div></div>
            <div className="sc-row"><div className="sc-label">Prize</div><div className="sc-val gold">Winner takes all</div></div>
            <div className="sc-row"><div className="sc-label">Created</div><div className="sc-val">{new Date(pool.created_at).toLocaleDateString()}</div></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        ${espn.cardStyles}
        ${espn.formStyles}
        ${espn.sidebarStyles}
        ${espn.layoutStyles}
      `}</style>
    </div>
  )
}

function PoolPageContent({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justCreated = searchParams.get('created') === 'true'
  const justJoined = searchParams.get('joined') === 'true'
  
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCommissioner, setIsCommissioner] = useState(false)
  const [myMembership, setMyMembership] = useState(null)
  const [activeTab, setActiveTab] = useState('picks')
  const [pendingPicks, setPendingPicks] = useState(2) // Mock for badge

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

    // Get member count
    const { count } = await supabase
      .from('pool_members')
      .select('*', { count: 'exact', head: true })
      .eq('pool_id', params.id)

    setPool({ ...poolData, playerCount: count || 0 })
    setIsCommissioner(poolData.commissioner_id === currentUser.id)

    // Fetch members with profiles
    const { data: membersData } = await supabase
      .from('pool_members')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('pool_id', params.id)
      .order('total_points', { ascending: false })

    if (membersData) {
      const rankedMembers = membersData.map((member, index) => ({
        ...member,
        rank: index + 1
      }))
      setMembers(rankedMembers)
      
      const myMember = rankedMembers.find(m => m.user_id === currentUser.id)
      setMyMembership(myMember)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || ''
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return name[0]?.toUpperCase() || '?'
  }

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
          <Link href="/dashboard" className="tb-link">Dashboard</Link>
          <span className="tb-link active">My Pools</span>
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
          <Link href="/dashboard" className="nav-item">Home</Link>
          <span className="nav-item active">{pool.name}</span>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      {/* Success Banner */}
      {(justCreated || justJoined) && (
        <div className="success-banner">
          <span className="success-icon">{justCreated ? '🎉' : '🎯'}</span>
          {justCreated ? 'Pool created! Share the invite link to get your friends in.' : "You've joined the pool! Start making your predictions."}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool.name}</div>
            <div className="ph-title">{pool.name}</div>
            <div className="ph-meta">{WC2026_TOURNAMENT.name} · {pool.playerCount} players · Private · Commissioner: {isCommissioner ? 'You' : 'Unknown'}</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{myMembership?.total_points || 0} pts</div>
            <div className="ph-rank">
              {myMembership?.rank ? `${myMembership.rank}${getRankSuffix(myMembership.rank)} place` : 'No rank yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <div className="tab-nav-inner">
          <button 
            className={`tab ${activeTab === 'picks' ? 'active' : ''}`}
            onClick={() => setActiveTab('picks')}
          >
            Match Picks
            {pendingPicks > 0 && <span className="tab-badge">{pendingPicks}</span>}
          </button>
          <button 
            className={`tab ${activeTab === 'special' ? 'active' : ''}`}
            onClick={() => setActiveTab('special')}
          >
            Special Picks
          </button>
          <button 
            className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
          {isCommissioner && (
            <button 
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="wrap">
        {activeTab === 'picks' && (
          <div className="picks-overview">
            <Link href={`/pool/${pool.id}/predictions`} className="action-card">
              <div className="action-left">
                <span className="action-icon">⚽</span>
                <div className="action-info">
                  <h3>Match Predictions</h3>
                  <p>Predict scores for all 104 World Cup matches</p>
                </div>
              </div>
              <span className="action-btn">Make Picks →</span>
            </Link>

            <div className="two-col" style={{marginTop: '1.5rem'}}>
              <div>
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">How It Works</div>
                  </div>
                  <div className="card-body">
                    <p style={{color: 'var(--f3)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem'}}>
                      Predict the exact score for each match before kickoff. Points are awarded based on accuracy:
                    </p>
                    <div className="scoring-grid">
                      <div className="scoring-item">
                        <span className="scoring-pts">3</span>
                        <span className="scoring-label">Exact score</span>
                      </div>
                      <div className="scoring-item">
                        <span className="scoring-pts">2</span>
                        <span className="scoring-label">Winner + 1 score</span>
                      </div>
                      <div className="scoring-item">
                        <span className="scoring-pts">1</span>
                        <span className="scoring-label">Correct result</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="card">
                  <div className="card-head"><div className="card-title">Your Progress</div></div>
                  <div className="card-body">
                    <div className="sc-row"><div className="sc-label">Picks submitted</div><div className="sc-val green">0 / 104</div></div>
                    <div className="sc-row"><div className="sc-label">Total points</div><div className="sc-val">{myMembership?.total_points || 0}</div></div>
                    <div className="sc-row"><div className="sc-label">Your rank</div><div className="sc-val gold">{myMembership?.rank ? `${myMembership.rank}${getRankSuffix(myMembership.rank)} / ${pool.playerCount}` : '—'}</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'special' && (
          <div className="special-overview">
            <Link href={`/pool/${pool.id}/special-picks`} className="action-card">
              <div className="action-left">
                <span className="action-icon">🏆</span>
                <div className="action-info">
                  <h3>Special Predictions</h3>
                  <p>Pick the champion, runner-up, top scorer, and best goalkeeper</p>
                </div>
              </div>
              <span className="action-btn">Make Picks →</span>
            </Link>

            <div className="card" style={{marginTop: '1.5rem'}}>
              <div className="card-head">
                <div className="card-title">Bonus Points Available</div>
              </div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Champion</div><div className="sc-val gold">10 pts</div></div>
                <div className="sc-row"><div className="sc-label">Runner-up</div><div className="sc-val gold">7 pts</div></div>
                <div className="sc-row"><div className="sc-label">Top scorer</div><div className="sc-val gold">5 pts</div></div>
                <div className="sc-row"><div className="sc-label">Best goalkeeper</div><div className="sc-val gold">5 pts</div></div>
                <div className="sc-row" style={{borderTop: '1px solid var(--line)', marginTop: '0.5rem', paddingTop: '0.5rem'}}>
                  <div className="sc-label" style={{fontWeight: 600}}>Total</div>
                  <div className="sc-val gold" style={{fontSize: '1.1rem'}}>27 pts</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="card">
            <div className="card-head">
              <div className="card-title">Full Standings — {pool.name}</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <span style={{fontSize: '0.72rem', color: 'var(--f3)'}}>{pool.playerCount} players</span>
              </div>
            </div>
            <Leaderboard 
              members={members} 
              currentUserId={user?.id}
              commissionerId={pool.commissioner_id}
            />
          </div>
        )}

        {activeTab === 'settings' && isCommissioner && (
          <SettingsTab 
            pool={pool} 
            onUpdate={(updated) => setPool(updated)}
          />
        )}
      </div>

      <style jsx>{`
        ${espn.espnStyles}
        ${espn.topbarStyles}
        ${espn.navStyles}
        ${espn.pageHeaderStyles}
        ${espn.tabNavStyles}
        ${espn.cardStyles}
        ${espn.sidebarStyles}
        ${espn.layoutStyles}
        ${espn.formStyles}

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

        .success-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          background: rgba(44,182,125,0.1);
          border-bottom: 1px solid rgba(44,182,125,0.3);
          color: var(--green);
          padding: 0.75rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .success-icon { font-size: 1.1rem; }

        .action-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg2);
          border: 2px solid var(--gold);
          border-radius: 4px;
          padding: 1.25rem 1.5rem;
          text-decoration: none;
          transition: all 0.15s;
        }
        .action-card:hover {
          background: var(--bg3);
        }
        .action-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .action-icon { font-size: 2rem; }
        .action-info h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 0.2rem;
        }
        .action-info p {
          font-size: 0.8rem;
          color: var(--f3);
        }
        .action-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.6rem 1.25rem;
          border-radius: 2px;
        }

        .scoring-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }
        .scoring-item {
          background: var(--bg3);
          padding: 0.75rem;
          border-radius: 3px;
          text-align: center;
        }
        .scoring-pts {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--gold);
        }
        .scoring-label {
          font-size: 0.7rem;
          color: var(--f3);
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

export default function PoolPage({ params }) {
  return (
    <Suspense fallback={
      <div style={{minHeight: '100vh', background: '#0a0c10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a8780'}}>
        Loading...
      </div>
    }>
      <PoolPageContent params={params} />
    </Suspense>
  )
}
