'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { TEAMS, PLAYERS } from '@/lib/wc2026-database'

// Favorites first (by FIFA ranking), then rest alphabetically
const FAVORITE_CODES = ['fr', 'es', 'ar', 'gb-eng', 'pt', 'br', 'nl', 'de', 'be', 'ma', 'hr', 'co', 'sn', 'jp', 'uy', 'us']

const sortedTeams = [
  ...TEAMS.filter(t => FAVORITE_CODES.includes(t.code)).sort((a, b) => FAVORITE_CODES.indexOf(a.code) - FAVORITE_CODES.indexOf(b.code)),
  ...TEAMS.filter(t => !FAVORITE_CODES.includes(t.code)).sort((a, b) => a.name.localeCompare(b.name))
].map(t => ({
  code: t.code,
  name: t.name,
  flag: t.code,
  flagUrl: `https://flagcdn.com/w80/${t.code.replace('gb-', '')}.png`
}))

// Get players from database, format for display
const getTeamName = (code) => TEAMS.find(t => t.code === code)?.name || code

const allPlayers = PLAYERS.map((p, i) => ({
  id: `p${i}`,
  name: p.name,
  position: p.pos,
  team: getTeamName(p.team),
  teamCode: p.team,
  flag: p.team,
  flagUrl: `https://flagcdn.com/w40/${p.team.replace('gb-', '')}.png`
}))

const scorerCandidates = allPlayers.filter(p => p.position === 'FWD' || p.position === 'MID')
const goalkeeperCandidates = allPlayers.filter(p => p.position === 'GK')

export default function SpecialPicksPage() {
  const params = useParams()
  const router = useRouter()
  const [teams, setTeams] = useState(sortedTeams)
  const [players, setPlayers] = useState(scorerCandidates)
  const [goalkeepers, setGoalkeepers] = useState(goalkeeperCandidates)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  
  const [user, setUser] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [pool, setPool] = useState(null)
  
  // Picks state
  const [champion, setChampion] = useState(null)
  const [runnerUp, setRunnerUp] = useState(null)
  const [topScorer, setTopScorer] = useState(null)
  const [bestKeeper, setBestKeeper] = useState(null)
  
  // Modal state
  const [showTeamModal, setShowTeamModal] = useState(null) // 'champion' | 'runner_up' | null
  const [showPlayerModal, setShowPlayerModal] = useState(null) // 'top_scorer' | 'best_keeper' | null
  const [searchTerm, setSearchTerm] = useState('')

  // Tournament deadline (first match)
  const tournamentStart = new Date('2026-06-11T17:00:00-04:00')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
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
      
      if (poolData) setPool(poolData)

      const { data: memberData } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', params.id)
        .eq('user_id', currentUser.id)
        .single()
      
      if (memberData) setPoolMember(memberData)

      // Load existing special picks
      if (memberData) {
        const { data: existingPicks } = await supabase
          .from('special_picks')
          .select('*')
          .eq('pool_member_id', memberData.id)
          .single()

        if (existingPicks) {
          setChampion(existingPicks.champion)
          setRunnerUp(existingPicks.runner_up)
          setTopScorer(existingPicks.top_scorer)
          setBestKeeper(existingPicks.best_keeper)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSave = async (pickType, value) => {
    if (!poolMember || !value) return

    setSaving(prev => ({ ...prev, [pickType]: true }))
    
    try {
      const updateObj = { [pickType]: value }
      
      const { data: existing } = await supabase
        .from('special_picks')
        .select('id')
        .eq('pool_member_id', poolMember.id)
        .single()

      if (existing) {
        const { error } = await supabase
          .from('special_picks')
          .update(updateObj)
          .eq('pool_member_id', poolMember.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('special_picks')
          .insert({ pool_member_id: poolMember.id, ...updateObj })
        if (error) throw error
      }
    } catch (error) {
      console.error('Error saving pick:', error)
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [pickType]: false }))
    }
  }

  const selectTeam = (teamCode, type) => {
    if (type === 'champion') {
      setChampion(teamCode)
      handleSave('champion', teamCode)
    } else {
      setRunnerUp(teamCode)
      handleSave('runner_up', teamCode)
    }
    setShowTeamModal(null)
    setSearchTerm('')
  }

  const selectPlayer = (playerName, type) => {
    if (type === 'top_scorer') {
      setTopScorer(playerName)
      handleSave('top_scorer', playerName)
    } else {
      setBestKeeper(playerName)
      handleSave('best_keeper', playerName)
    }
    setShowPlayerModal(null)
    setSearchTerm('')
  }

  const isLocked = new Date() >= tournamentStart

  // Filter for modals
  const filteredTeams = teams.filter(t => 
    !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredPlayers = showPlayerModal === 'top_scorer' 
    ? players.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.team.toLowerCase().includes(searchTerm.toLowerCase()))
    : goalkeepers.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.team.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get selected data for display
  const championTeam = teams.find(t => t.code === champion)
  const runnerUpTeam = teams.find(t => t.code === runnerUp)
  const topScorerPlayer = players.find(p => p.name === topScorer)
  const bestKeeperPlayer = goalkeepers.find(p => p.name === bestKeeper)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${params.id}`} className="nav-item active">{pool?.name || 'Pool'}</Link>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">Special Picks</div>
            <div className="ph-meta">FIFA World Cup 2026 · 27 pts available</div>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <div className="tab-nav-inner">
          <Link href={`/pool/${params.id}/predictions`} className="tab">Match Picks</Link>
          <span className="tab active">Special Picks</span>
          <Link href={`/pool/${params.id}`} className="tab">Leaderboard</Link>
        </div>
      </div>

      <div className="wrap">
        {/* Lock warning */}
        {isLocked && (
          <div className="lock-banner">
            <span>🔒</span> Picks are locked. The tournament has started.
          </div>
        )}

        {/* Top Row: Champion & Runner-up */}
        <div className="picks-row top-row">
          {/* CHAMPION */}
          <div 
            className={`pick-card team-card gold ${champion ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && setShowTeamModal('champion')}
          >
            <div className="pick-badge gold-badge">10 PTS</div>
            <div className="pick-header">
              <div className="pick-title">CHAMPION</div>
              <div className="pick-subtitle">World Cup Winner</div>
            </div>
            {champion && championTeam ? (
              <div className="team-display gold-border">
                <img src={championTeam.flagUrl} alt={championTeam.name} className="team-flag-large" />
              </div>
            ) : (
              <div className="team-display empty gold-border">
                <div className="empty-plus">+</div>
              </div>
            )}
            {champion && championTeam && (
              <div className="team-name-display">{championTeam.name}</div>
            )}
            {!champion && <div className="pick-cta">Select Team</div>}
            {saving.champion && <div className="saving-indicator">Saving...</div>}
          </div>

          {/* RUNNER-UP */}
          <div 
            className={`pick-card team-card silver ${runnerUp ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && setShowTeamModal('runner_up')}
          >
            <div className="pick-badge silver-badge">7 PTS</div>
            <div className="pick-header">
              <div className="pick-title">RUNNER-UP</div>
              <div className="pick-subtitle">Final Loser</div>
            </div>
            {runnerUp && runnerUpTeam ? (
              <div className="team-display silver-border">
                <img src={runnerUpTeam.flagUrl} alt={runnerUpTeam.name} className="team-flag-large" />
              </div>
            ) : (
              <div className="team-display empty silver-border">
                <div className="empty-plus">+</div>
              </div>
            )}
            {runnerUp && runnerUpTeam && (
              <div className="team-name-display">{runnerUpTeam.name}</div>
            )}
            {!runnerUp && <div className="pick-cta">Select Team</div>}
            {saving.runner_up && <div className="saving-indicator">Saving...</div>}
          </div>
        </div>

        {/* Bottom Row: Pichichi & Golden Glove */}
        <div className="picks-row bottom-row">
          {/* PICHICHI (TOP SCORER) */}
          <div 
            className={`pick-card player-card ${topScorer ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && setShowPlayerModal('top_scorer')}
          >
            {/* Golden Boot SVG Background */}
            <svg className="bg-icon" viewBox="0 0 100 120" fill="none">
              <path d="M25 95 L35 30 Q37 20 50 20 Q63 20 65 30 L75 95 Q75 105 50 110 Q25 105 25 95Z" fill="currentColor"/>
              <ellipse cx="50" cy="25" rx="18" ry="8" fill="currentColor" opacity="0.6"/>
              <path d="M30 92 Q50 100 70 92" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4"/>
              <circle cx="50" cy="60" r="6" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="78" r="4" fill="currentColor" opacity="0.3"/>
            </svg>
            
            <div className="pick-badge gold-badge">5 PTS</div>
            <div className="pick-header">
              <div className="pick-title">PICHICHI</div>
              <div className="pick-subtitle">Top Goalscorer</div>
            </div>
            {topScorer && topScorerPlayer ? (
              <div className="player-display">
                <div className="player-name-large">{topScorer}</div>
                <div className="player-team-row">
                  <img src={topScorerPlayer.flagUrl} alt="" className="player-flag-small" />
                  <span>{topScorerPlayer.team}</span>
                </div>
              </div>
            ) : (
              <div className="player-display empty">
                <div className="empty-plus">+</div>
                <div className="pick-cta">Select Player</div>
              </div>
            )}
            {saving.top_scorer && <div className="saving-indicator">Saving...</div>}
          </div>

          {/* GOLDEN GLOVE (BEST KEEPER) */}
          <div 
            className={`pick-card player-card ${bestKeeper ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
            onClick={() => !isLocked && setShowPlayerModal('best_keeper')}
          >
            {/* Glove SVG Background */}
            <svg className="bg-icon" viewBox="0 0 100 120" fill="none">
              <path d="M25 100 V55 Q25 45 35 45 L38 45 V30 Q38 22 45 22 Q52 22 52 30 V45 L55 45 V25 Q55 17 62 17 Q69 17 69 25 V45 L72 45 V30 Q72 22 79 22 Q86 22 86 30 V45 L89 45 Q95 45 95 55 V100 Q95 115 60 115 Q25 115 25 100Z" fill="currentColor"/>
              <rect x="35" y="65" rx="3" width="40" height="10" fill="currentColor" opacity="0.4"/>
              <rect x="38" y="80" rx="2" width="34" height="6" fill="currentColor" opacity="0.3"/>
            </svg>
            
            <div className="pick-badge gold-badge">5 PTS</div>
            <div className="pick-header">
              <div className="pick-title">GOLDEN GLOVE</div>
              <div className="pick-subtitle">Best Goalkeeper</div>
            </div>
            {bestKeeper && bestKeeperPlayer ? (
              <div className="player-display">
                <div className="player-name-large">{bestKeeper}</div>
                <div className="player-team-row">
                  <img src={bestKeeperPlayer.flagUrl} alt="" className="player-flag-small" />
                  <span>{bestKeeperPlayer.team}</span>
                </div>
              </div>
            ) : (
              <div className="player-display empty">
                <div className="empty-plus">+</div>
                <div className="pick-cta">Select Player</div>
              </div>
            )}
            {saving.best_keeper && <div className="saving-indicator">Saving...</div>}
          </div>
        </div>

        {/* Deadline info */}
        <div className="deadline-info">
          <div className="deadline-icon">⏰</div>
          <div>
            <div className="deadline-title">Deadline: June 11, 2026 · 5:00 PM ET</div>
            <div className="deadline-sub">All special picks lock when the first match kicks off</div>
          </div>
        </div>
      </div>

      {/* Team Selection Modal */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={() => { setShowTeamModal(null); setSearchTerm(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {showTeamModal === 'champion' ? '🏆 Select Champion' : '🥈 Select Runner-Up'}
              </div>
              <button className="modal-close" onClick={() => { setShowTeamModal(null); setSearchTerm(''); }}>×</button>
            </div>
            <div className="modal-search">
              <input 
                type="text" 
                placeholder="Search teams..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-grid">
              {filteredTeams.map(team => (
                <div 
                  key={team.code}
                  className={`modal-team ${(showTeamModal === 'champion' ? champion : runnerUp) === team.code ? 'selected' : ''}`}
                  onClick={() => selectTeam(team.code, showTeamModal)}
                >
                  <img src={team.flagUrl} alt={team.name} />
                  <span>{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Player Selection Modal */}
      {showPlayerModal && (
        <div className="modal-overlay" onClick={() => { setShowPlayerModal(null); setSearchTerm(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {showPlayerModal === 'top_scorer' ? '⚽ Select Top Scorer' : '🧤 Select Best Goalkeeper'}
              </div>
              <button className="modal-close" onClick={() => { setShowPlayerModal(null); setSearchTerm(''); }}>×</button>
            </div>
            <div className="modal-search">
              <input 
                type="text" 
                placeholder="Search players..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-list">
              {filteredPlayers.map(player => (
                <div 
                  key={player.id}
                  className={`modal-player ${(showPlayerModal === 'top_scorer' ? topScorer : bestKeeper) === player.name ? 'selected' : ''}`}
                  onClick={() => selectPlayer(player.name, showPlayerModal)}
                >
                  <img src={player.flagUrl} alt="" className="modal-player-flag" />
                  <div className="modal-player-info">
                    <div className="modal-player-name">{player.name}</div>
                    <div className="modal-player-team">{player.team}</div>
                  </div>
                  {(showPlayerModal === 'top_scorer' ? topScorer : bestKeeper) === player.name && (
                    <div className="modal-check">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* NAV */
        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid var(--f4); text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        /* PAGE HEADER */
        .page-header { background: var(--bg2); border-bottom: 1px solid var(--line); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 900px; margin: 0 auto; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: var(--white); }
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; }

        /* TABS */
        .tab-nav { background: var(--bg2); border-bottom: 1px solid var(--line); }
        .tab-nav-inner { max-width: 900px; margin: 0 auto; display: flex; }
        .tab { display: flex; align-items: center; gap: 0.4rem; padding: 0 1.5rem; height: 44px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); border-bottom: 2px solid transparent; cursor: pointer; text-decoration: none; }
        .tab:hover { color: var(--f1); }
        .tab.active { color: var(--white); border-bottom-color: var(--gold); }

        .wrap { max-width: 900px; margin: 0 auto; padding: 2rem; }

        .lock-banner { background: rgba(224,59,59,0.1); border: 1px solid rgba(224,59,59,0.3); color: var(--red); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; text-align: center; font-weight: 600; }

        /* PICKS LAYOUT */
        .picks-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

        /* PICK CARD BASE */
        .pick-card {
          position: relative;
          background: var(--bg2);
          border: 2px solid var(--line);
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          overflow: hidden;
        }
        .pick-card:hover:not(.locked) { border-color: var(--f3); transform: translateY(-2px); }
        .pick-card.locked { cursor: not-allowed; opacity: 0.6; }
        .pick-card.selected { border-color: var(--gold); }
        .pick-card.silver.selected { border-color: #a8a8a8; }

        /* BADGES */
        .pick-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.6rem;
          border-radius: 3px;
        }
        .gold-badge { background: var(--gold); color: #000; }
        .silver-badge { background: #a8a8a8; color: #000; }

        /* HEADER */
        .pick-header { margin-bottom: 1rem; }
        .pick-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.3rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--white);
        }
        .pick-subtitle {
          font-size: 0.72rem;
          color: var(--f4);
          margin-top: 0.15rem;
        }

        /* TEAM CARDS */
        .team-display {
          width: 100px;
          height: 100px;
          margin: 0 auto 0.75rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--bg3);
        }
        .team-display.gold-border { border: 3px solid var(--gold); box-shadow: 0 4px 20px rgba(201,168,76,0.25); }
        .team-display.silver-border { border: 3px solid #a8a8a8; box-shadow: 0 4px 20px rgba(168,168,168,0.15); }
        .team-display.empty { border-style: dashed; }
        .team-flag-large { width: 100%; height: 100%; object-fit: cover; }
        .team-name-display {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--white);
        }
        .pick-card.gold .team-name-display { color: var(--gold); }
        .pick-card.silver .team-name-display { color: #c0c0c0; }

        /* PLAYER CARDS */
        .player-card { min-height: 200px; }
        .bg-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 160px;
          opacity: 0.12;
          color: var(--gold);
          pointer-events: none;
        }
        .player-card.selected .bg-icon { opacity: 0.2; }

        .player-display {
          position: relative;
          z-index: 1;
          margin-top: 1rem;
        }
        .player-display.empty { margin-top: 2rem; }
        .player-name-large {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.5rem;
        }
        .player-team-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--f3);
        }
        .player-flag-small {
          width: 22px;
          height: 15px;
          border-radius: 2px;
          object-fit: cover;
        }

        /* EMPTY STATE */
        .empty-plus {
          font-size: 2.5rem;
          color: var(--f4);
          line-height: 1;
        }
        .pick-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--f4);
          margin-top: 0.5rem;
        }

        .saving-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          font-size: 0.68rem;
          color: var(--gold);
          font-weight: 600;
        }

        /* DEADLINE */
        .deadline-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 1rem 1.5rem;
          margin-top: 1rem;
        }
        .deadline-icon { font-size: 1.5rem; }
        .deadline-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 700; color: var(--white); text-transform: uppercase; }
        .deadline-sub { font-size: 0.8rem; color: var(--f3); margin-top: 0.2rem; }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--line);
          background: var(--bg3);
        }
        .modal-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.2rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--white);
        }
        .modal-close {
          background: none;
          border: none;
          color: var(--f3);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }
        .modal-search {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--line);
        }
        .modal-search input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg);
          border: 1px solid var(--f4);
          border-radius: 6px;
          color: var(--f1);
          font-size: 0.9rem;
        }
        .modal-search input:focus { outline: none; border-color: var(--gold); }
        .modal-search input::placeholder { color: var(--f4); }

        .modal-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          padding: 1rem;
          overflow-y: auto;
          flex: 1;
        }
        .modal-team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 0.5rem;
          border-radius: 6px;
          border: 1px solid var(--line);
          cursor: pointer;
          transition: all 0.15s;
        }
        .modal-team:hover { border-color: var(--f3); background: var(--bg3); }
        .modal-team.selected { border-color: var(--gold); background: rgba(201,168,76,0.1); }
        .modal-team img { width: 40px; height: 28px; border-radius: 3px; object-fit: cover; }
        .modal-team span { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--f2); text-align: center; }
        .modal-team.selected span { color: var(--gold); }

        .modal-list {
          overflow-y: auto;
          flex: 1;
          padding: 0.5rem;
        }
        .modal-player {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .modal-player:hover { background: var(--bg3); }
        .modal-player.selected { background: rgba(201,168,76,0.1); }
        .modal-player-flag { width: 28px; height: 20px; border-radius: 3px; object-fit: cover; }
        .modal-player-info { flex: 1; }
        .modal-player-name { font-weight: 600; color: var(--f1); }
        .modal-player.selected .modal-player-name { color: var(--gold); }
        .modal-player-team { font-size: 0.75rem; color: var(--f4); }
        .modal-check { color: var(--gold); font-weight: 700; }

        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .picks-row { grid-template-columns: 1fr; }
          .modal-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  )
}
