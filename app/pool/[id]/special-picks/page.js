'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'
import { WC2026_TEAMS } from '../../../../lib/wc2026-data'
import * as espn from '../../../styles/espn-theme'

// Top teams for selection
const TOP_TEAMS = [
  { code: 'ARG', name: 'Argentina' },
  { code: 'FRA', name: 'France' },
  { code: 'ESP', name: 'Spain' },
  { code: 'ENG', name: 'England' },
  { code: 'BRA', name: 'Brazil' },
  { code: 'POR', name: 'Portugal' },
  { code: 'GER', name: 'Germany' },
  { code: 'NED', name: 'Netherlands' },
]

// Sample players data
const PLAYERS = [
  { name: 'Kylian Mbappé', team: 'FRA', teamName: 'France', pos: 'FWD' },
  { name: 'Lionel Messi', team: 'ARG', teamName: 'Argentina', pos: 'FWD' },
  { name: 'Erling Haaland', team: 'NOR', teamName: 'Norway', pos: 'FWD' },
  { name: 'Harry Kane', team: 'ENG', teamName: 'England', pos: 'FWD' },
  { name: 'Vinícius Jr.', team: 'BRA', teamName: 'Brazil', pos: 'FWD' },
  { name: 'Jude Bellingham', team: 'ENG', teamName: 'England', pos: 'MID' },
  { name: 'Cristiano Ronaldo', team: 'POR', teamName: 'Portugal', pos: 'FWD' },
  { name: 'Lamine Yamal', team: 'ESP', teamName: 'Spain', pos: 'FWD' },
  { name: 'Emiliano Martínez', team: 'ARG', teamName: 'Argentina', pos: 'GK' },
  { name: 'Thibaut Courtois', team: 'BEL', teamName: 'Belgium', pos: 'GK' },
  { name: 'Alisson Becker', team: 'BRA', teamName: 'Brazil', pos: 'GK' },
  { name: 'Manuel Neuer', team: 'GER', teamName: 'Germany', pos: 'GK' },
  { name: 'Mike Maignan', team: 'FRA', teamName: 'France', pos: 'GK' },
  { name: 'Unai Simón', team: 'ESP', teamName: 'Spain', pos: 'GK' },
  { name: 'Jordan Pickford', team: 'ENG', teamName: 'England', pos: 'GK' },
  { name: 'Diogo Costa', team: 'POR', teamName: 'Portugal', pos: 'GK' },
]

function getCountryCode(teamCode) {
  const codeMap = {
    'ARG': 'ar', 'FRA': 'fr', 'ESP': 'es', 'ENG': 'gb-eng', 'BRA': 'br',
    'POR': 'pt', 'GER': 'de', 'NED': 'nl', 'NOR': 'no', 'BEL': 'be',
  }
  return codeMap[teamCode] || teamCode?.toLowerCase() || 'un'
}

export default function SpecialPicksPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [myMembership, setMyMembership] = useState(null)

  // Special picks state
  const [champion, setChampion] = useState(null)
  const [runnerUp, setRunnerUp] = useState(null)
  const [topScorer, setTopScorer] = useState(null)
  const [bestGK, setBestGK] = useState(null)

  // Search state
  const [scorerSearch, setScorerSearch] = useState('')
  const [gkSearch, setGkSearch] = useState('')

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

    // Load pool
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

    // Get pool membership
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
    setMyMembership(memberData)

    // Load existing special picks (if stored)
    // For now we'll use local state

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    // TODO: Save to Supabase
    setTimeout(() => {
      setSaving(false)
      alert('Special picks saved!')
    }, 500)
  }

  const getUserInitials = () => {
    const name = user?.user_metadata?.name || user?.email || ''
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return name[0]?.toUpperCase() || '?'
  }

  // Filter players for search
  const filteredScorers = PLAYERS.filter(p => 
    (p.pos === 'FWD' || p.pos === 'MID') &&
    (p.name.toLowerCase().includes(scorerSearch.toLowerCase()) ||
     p.teamName.toLowerCase().includes(scorerSearch.toLowerCase()))
  ).slice(0, 6)

  const filteredGKs = PLAYERS.filter(p => 
    p.pos === 'GK' &&
    (p.name.toLowerCase().includes(gkSearch.toLowerCase()) ||
     p.teamName.toLowerCase().includes(gkSearch.toLowerCase()))
  ).slice(0, 6)

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
          .loading-bar { width: 120px; height: 4px; background: var(--bg3); border-radius: 2px; overflow: hidden; }
          .loading-fill { height: 100%; width: 40%; background: var(--gold); animation: loading 1s ease-in-out infinite; }
          @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
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
        </div>
        <div className="topbar-right">
          <div className="user-pill">
            <div className="user-avatar">{getUserInitials()}</div>
            {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="main-nav">
        <Link href="/dashboard" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${params.id}`} className="nav-item">{pool?.name}</Link>
          <span className="nav-item active">Special Picks</span>
        </div>
        <button onClick={handleSave} disabled={saving} className="nav-cta">
          {saving ? 'Saving...' : 'Save All'}
        </button>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">
              <Link href={`/pool/${params.id}`} style={{color: 'var(--gold)', textDecoration: 'none'}}>
                {pool?.name}
              </Link> › Special Picks
            </div>
            <div className="ph-title">Special Picks</div>
            <div className="ph-meta">Predict tournament outcomes for bonus points</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">27 pts</div>
            <div className="ph-rank">available</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Deadline Warning */}
            <div className="sp-lock-banner">
              <div>
                <div className="slb-title">⚠ Locks at first kickoff — Jun 11, 5:00 PM ET</div>
                <div className="slb-sub">All special picks lock permanently when the tournament begins. Submit before the deadline to earn bonus points. No changes after kickoff.</div>
              </div>
            </div>

            {/* Champion Pick */}
            <div className="sp-card">
              <div className="sp-head">
                <div className="sp-title-group">
                  <div className="sp-icon-wrap">🏆</div>
                  <div className="sp-title">Champion</div>
                </div>
                <div className="sp-pts">10 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that wins the 2026 World Cup.</div>
                <div className="team-grid">
                  {TOP_TEAMS.map(team => (
                    <div 
                      key={team.code}
                      className={`tg-opt ${champion === team.code ? 'sel' : ''}`}
                      onClick={() => setChampion(team.code)}
                    >
                      <img src={`https://flagcdn.com/w40/${getCountryCode(team.code)}.png`} alt={team.code} />
                      <div className="tg-opt-name">{team.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {champion ? <>Selected: <strong style={{color: 'var(--gold)'}}>{TOP_TEAMS.find(t => t.code === champion)?.name}</strong></> : <span className="missing">⚠ No pick saved yet</span>}
                </div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Runner-up Pick */}
            <div className="sp-card" style={{marginTop: '2px'}}>
              <div className="sp-head">
                <div className="sp-title-group">
                  <div className="sp-icon-wrap">🥈</div>
                  <div className="sp-title">Runner-Up</div>
                </div>
                <div className="sp-pts">7 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that reaches the final but finishes second.</div>
                <div className="team-grid">
                  {TOP_TEAMS.map(team => (
                    <div 
                      key={team.code}
                      className={`tg-opt ${runnerUp === team.code ? 'sel' : ''}`}
                      onClick={() => setRunnerUp(team.code)}
                    >
                      <img src={`https://flagcdn.com/w40/${getCountryCode(team.code)}.png`} alt={team.code} />
                      <div className="tg-opt-name">{team.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {runnerUp ? <>Selected: <strong style={{color: 'var(--gold)'}}>{TOP_TEAMS.find(t => t.code === runnerUp)?.name}</strong></> : <span className="missing">⚠ No pick saved yet</span>}
                </div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Top Scorer Pick */}
            <div className="sp-card" style={{marginTop: '2px'}}>
              <div className="sp-head">
                <div className="sp-title-group">
                  <div className="sp-icon-wrap">⚽</div>
                  <div className="sp-title">Pichichi — Top Scorer</div>
                </div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the player who scores the most goals. Ties broken by assists, then fewer matches played.</div>
                <input 
                  className="player-search" 
                  type="text" 
                  placeholder="Search player name or country..."
                  value={scorerSearch}
                  onChange={(e) => setScorerSearch(e.target.value)}
                />
                {scorerSearch && filteredScorers.length > 0 && (
                  <div className="player-results">
                    {filteredScorers.map(player => (
                      <div 
                        key={player.name}
                        className={`pr-item ${topScorer?.name === player.name ? 'sel-player' : ''}`}
                        onClick={() => {
                          setTopScorer(player)
                          setScorerSearch('')
                        }}
                      >
                        <div className="pr-flag">
                          <img src={`https://flagcdn.com/w40/${getCountryCode(player.team)}.png`} alt={player.team} />
                        </div>
                        <div>
                          <div className="pr-name">{player.name}</div>
                          <div className="pr-team">{player.teamName}</div>
                        </div>
                        <span className={`pr-pos pos-${player.pos.toLowerCase()}`}>{player.pos}</span>
                      </div>
                    ))}
                  </div>
                )}
                {topScorer && (
                  <div className="selected-pick">
                    <div className="sel-flag">
                      <img src={`https://flagcdn.com/w40/${getCountryCode(topScorer.team)}.png`} alt={topScorer.team} />
                    </div>
                    <div>
                      <div className="sel-name">{topScorer.name}</div>
                      <div className="sel-team">{topScorer.teamName} · {topScorer.pos}</div>
                    </div>
                    <div className="sel-change" onClick={() => setTopScorer(null)}>Change</div>
                  </div>
                )}
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {topScorer ? <>Selected: <strong style={{color: 'var(--gold)'}}>{topScorer.name}</strong></> : <span className="missing">⚠ No pick saved yet</span>}
                </div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Best Goalkeeper Pick */}
            <div className="sp-card" style={{marginTop: '2px'}}>
              <div className="sp-head">
                <div className="sp-title-group">
                  <div className="sp-icon-wrap">🧤</div>
                  <div className="sp-title">Best Goalkeeper</div>
                </div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the goalkeeper awarded the Golden Glove at the end of the tournament.</div>
                <input 
                  className="player-search" 
                  type="text" 
                  placeholder="Search goalkeeper name or country..."
                  value={gkSearch}
                  onChange={(e) => setGkSearch(e.target.value)}
                />
                {gkSearch && filteredGKs.length > 0 && (
                  <div className="player-results">
                    {filteredGKs.map(player => (
                      <div 
                        key={player.name}
                        className={`pr-item ${bestGK?.name === player.name ? 'sel-player' : ''}`}
                        onClick={() => {
                          setBestGK(player)
                          setGkSearch('')
                        }}
                      >
                        <div className="pr-flag">
                          <img src={`https://flagcdn.com/w40/${getCountryCode(player.team)}.png`} alt={player.team} />
                        </div>
                        <div>
                          <div className="pr-name">{player.name}</div>
                          <div className="pr-team">{player.teamName}</div>
                        </div>
                        <span className="pr-pos pos-gk">{player.pos}</span>
                      </div>
                    ))}
                  </div>
                )}
                {bestGK && (
                  <div className="selected-pick">
                    <div className="sel-flag">
                      <img src={`https://flagcdn.com/w40/${getCountryCode(bestGK.team)}.png`} alt={bestGK.team} />
                    </div>
                    <div>
                      <div className="sel-name">{bestGK.name}</div>
                      <div className="sel-team">{bestGK.teamName} · {bestGK.pos}</div>
                    </div>
                    <div className="sel-change" onClick={() => setBestGK(null)}>Change</div>
                  </div>
                )}
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {bestGK ? <>Selected: <strong style={{color: 'var(--gold)'}}>{bestGK.name}</strong></> : <span className="missing">⚠ No pick saved yet</span>}
                </div>
                <button className="btn-save">Save</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Special Picks Status</div></div>
              <div className="card-body">
                <div className="sc-row">
                  <div className="sc-label">Champion</div>
                  <div className={`sc-val ${champion ? 'green' : 'red'}`}>
                    {champion ? `✓ ${TOP_TEAMS.find(t => t.code === champion)?.name}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Runner-up</div>
                  <div className={`sc-val ${runnerUp ? 'green' : 'red'}`}>
                    {runnerUp ? `✓ ${TOP_TEAMS.find(t => t.code === runnerUp)?.name}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Top scorer</div>
                  <div className={`sc-val ${topScorer ? 'green' : 'red'}`}>
                    {topScorer ? `✓ ${topScorer.name}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Goalkeeper</div>
                  <div className={`sc-val ${bestGK ? 'green' : 'red'}`}>
                    {bestGK ? `✓ ${bestGK.name}` : '⚠ Missing'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Points Available</div></div>
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

            <div className="card" style={{borderColor: 'rgba(224,59,59,0.2)'}}>
              <div className="card-head" style={{background: 'rgba(224,59,59,0.08)', borderColor: 'rgba(224,59,59,0.15)'}}>
                <div className="card-title" style={{color: 'var(--red)'}}>Deadline</div>
              </div>
              <div className="card-body">
                <div style={{fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--red)', lineHeight: 1}}>Jun 11</div>
                <div style={{fontSize: '0.75rem', color: 'var(--f3)', marginTop: '4px'}}>5:00 PM ET — First kickoff</div>
                <div style={{fontSize: '0.72rem', color: 'var(--f4)', marginTop: '8px', lineHeight: 1.5}}>All special picks lock the moment the first match starts. No exceptions.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        ${espn.espnStyles}
        ${espn.topbarStyles}
        ${espn.navStyles}
        ${espn.pageHeaderStyles}
        ${espn.cardStyles}
        ${espn.sidebarStyles}
        ${espn.specialPicksStyles}
        ${espn.layoutStyles}
        ${espn.matchPickCardStyles}

        .missing {
          color: var(--red);
        }
      `}</style>
    </>
  )
}
