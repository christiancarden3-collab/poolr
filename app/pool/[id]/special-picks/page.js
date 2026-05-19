'use client'

import { useState, useEffect, useCallback } from 'react'

// Demo teams fallback
const DEMO_TEAMS = [
  { code: 'ARG', name: 'Argentina', flag: 'ar', flagUrl: 'https://flagcdn.com/w80/ar.png' },
  { code: 'FRA', name: 'France', flag: 'fr', flagUrl: 'https://flagcdn.com/w80/fr.png' },
  { code: 'BRA', name: 'Brazil', flag: 'br', flagUrl: 'https://flagcdn.com/w80/br.png' },
  { code: 'ENG', name: 'England', flag: 'gb-eng', flagUrl: 'https://flagcdn.com/w80/gb-eng.png' },
  { code: 'ESP', name: 'Spain', flag: 'es', flagUrl: 'https://flagcdn.com/w80/es.png' },
  { code: 'GER', name: 'Germany', flag: 'de', flagUrl: 'https://flagcdn.com/w80/de.png' },
  { code: 'POR', name: 'Portugal', flag: 'pt', flagUrl: 'https://flagcdn.com/w80/pt.png' },
  { code: 'NED', name: 'Netherlands', flag: 'nl', flagUrl: 'https://flagcdn.com/w80/nl.png' },
  { code: 'ITA', name: 'Italy', flag: 'it', flagUrl: 'https://flagcdn.com/w80/it.png' },
  { code: 'BEL', name: 'Belgium', flag: 'be', flagUrl: 'https://flagcdn.com/w80/be.png' },
  { code: 'USA', name: 'United States', flag: 'us', flagUrl: 'https://flagcdn.com/w80/us.png' },
  { code: 'MEX', name: 'Mexico', flag: 'mx', flagUrl: 'https://flagcdn.com/w80/mx.png' },
  { code: 'URU', name: 'Uruguay', flag: 'uy', flagUrl: 'https://flagcdn.com/w80/uy.png' },
  { code: 'COL', name: 'Colombia', flag: 'co', flagUrl: 'https://flagcdn.com/w80/co.png' },
  { code: 'CRO', name: 'Croatia', flag: 'hr', flagUrl: 'https://flagcdn.com/w80/hr.png' },
  { code: 'MAR', name: 'Morocco', flag: 'ma', flagUrl: 'https://flagcdn.com/w80/ma.png' },
]

const DEMO_PLAYERS = [
  { id: 'p1', name: 'Kylian Mbappé', position: 'FWD', team: 'France', flag: 'fr', flagUrl: 'https://flagcdn.com/w40/fr.png' },
  { id: 'p2', name: 'Lionel Messi', position: 'FWD', team: 'Argentina', flag: 'ar', flagUrl: 'https://flagcdn.com/w40/ar.png' },
  { id: 'p3', name: 'Vinícius Júnior', position: 'FWD', team: 'Brazil', flag: 'br', flagUrl: 'https://flagcdn.com/w40/br.png' },
  { id: 'p4', name: 'Harry Kane', position: 'FWD', team: 'England', flag: 'gb-eng', flagUrl: 'https://flagcdn.com/w40/gb-eng.png' },
  { id: 'p5', name: 'Erling Haaland', position: 'FWD', team: 'Norway', flag: 'no', flagUrl: 'https://flagcdn.com/w40/no.png' },
  { id: 'p6', name: 'Jude Bellingham', position: 'MID', team: 'England', flag: 'gb-eng', flagUrl: 'https://flagcdn.com/w40/gb-eng.png' },
  { id: 'p7', name: 'Lamine Yamal', position: 'FWD', team: 'Spain', flag: 'es', flagUrl: 'https://flagcdn.com/w40/es.png' },
  { id: 'p8', name: 'Julián Álvarez', position: 'FWD', team: 'Argentina', flag: 'ar', flagUrl: 'https://flagcdn.com/w40/ar.png' },
  { id: 'p9', name: 'Darwin Núñez', position: 'FWD', team: 'Uruguay', flag: 'uy', flagUrl: 'https://flagcdn.com/w40/uy.png' },
  { id: 'p10', name: 'Victor Osimhen', position: 'FWD', team: 'Nigeria', flag: 'ng', flagUrl: 'https://flagcdn.com/w40/ng.png' },
]

const DEMO_GOALKEEPERS = [
  { id: 'gk1', name: 'Emiliano Martínez', position: 'GK', team: 'Argentina', flag: 'ar', flagUrl: 'https://flagcdn.com/w40/ar.png' },
  { id: 'gk2', name: 'Alisson Becker', position: 'GK', team: 'Brazil', flag: 'br', flagUrl: 'https://flagcdn.com/w40/br.png' },
  { id: 'gk3', name: 'Thibaut Courtois', position: 'GK', team: 'Belgium', flag: 'be', flagUrl: 'https://flagcdn.com/w40/be.png' },
  { id: 'gk4', name: 'Jordan Pickford', position: 'GK', team: 'England', flag: 'gb-eng', flagUrl: 'https://flagcdn.com/w40/gb-eng.png' },
  { id: 'gk5', name: 'Gianluigi Donnarumma', position: 'GK', team: 'Italy', flag: 'it', flagUrl: 'https://flagcdn.com/w40/it.png' },
  { id: 'gk6', name: 'Manuel Neuer', position: 'GK', team: 'Germany', flag: 'de', flagUrl: 'https://flagcdn.com/w40/de.png' },
  { id: 'gk7', name: 'Yassine Bounou', position: 'GK', team: 'Morocco', flag: 'ma', flagUrl: 'https://flagcdn.com/w40/ma.png' },
  { id: 'gk8', name: 'Dominik Livaković', position: 'GK', team: 'Croatia', flag: 'hr', flagUrl: 'https://flagcdn.com/w40/hr.png' },
]
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function SpecialPicksPage() {
  const params = useParams()
  const router = useRouter()
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [goalkeepers, setGoalkeepers] = useState([])
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
  
  // Search state
  const [scorerSearch, setScorerSearch] = useState('')
  const [gkSearch, setGkSearch] = useState('')

  // Tournament deadline (first match)
  const tournamentStart = new Date('2026-06-11T17:00:00-04:00')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Get current user
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Load pool info
      const { data: poolData } = await supabase
        .from('pools')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (poolData) setPool(poolData)

      // Get pool membership
      const { data: memberData } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', params.id)
        .eq('user_id', currentUser.id)
        .single()
      
      if (memberData) setPoolMember(memberData)

      // Load teams
      const teamsRes = await fetch('/api/teams')
      const teamsData = await teamsRes.json()
      if (teamsData.success && teamsData.teams.length > 0) {
        setTeams(teamsData.teams)
      } else {
        setTeams(DEMO_TEAMS)
      }

      // Load players (forwards and midfielders for top scorer)
      const playersRes = await fetch('/api/players')
      const playersData = await playersRes.json()
      if (playersData.success && playersData.players.length > 0) {
        setPlayers(playersData.players.filter(p => p.position === 'FWD' || p.position === 'MID'))
        setGoalkeepers(playersData.players.filter(p => p.position === 'GK'))
      } else {
        setPlayers(DEMO_PLAYERS)
        setGoalkeepers(DEMO_GOALKEEPERS)
      }

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
    if (!poolMember) {
      alert('You must be a pool member to make picks')
      return
    }

    setSaving(prev => ({ ...prev, [pickType]: true }))
    
    try {
      // Prepare the update object
      const updateObj = { [pickType]: value }
      
      // Check if special picks record exists
      const { data: existing } = await supabase
        .from('special_picks')
        .select('id')
        .eq('pool_member_id', poolMember.id)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('special_picks')
          .update(updateObj)
          .eq('pool_member_id', poolMember.id)
        
        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('special_picks')
          .insert({
            pool_member_id: poolMember.id,
            ...updateObj,
          })
        
        if (error) throw error
      }

      // Success feedback could be added here
    } catch (error) {
      console.error('Error saving pick:', error)
      alert('Failed to save: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [pickType]: false }))
    }
  }

  const isLocked = new Date() >= tournamentStart

  // Filter players based on search
  const filteredPlayers = players.filter(p => 
    !scorerSearch || 
    p.name.toLowerCase().includes(scorerSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(scorerSearch.toLowerCase())
  ).slice(0, 10)

  const filteredGKs = goalkeepers.filter(p => 
    !gkSearch || 
    p.name.toLowerCase().includes(gkSearch.toLowerCase()) ||
    p.team.toLowerCase().includes(gkSearch.toLowerCase())
  ).slice(0, 10)

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
            <div className="ph-meta">FIFA World Cup 2026</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{poolMember?.total_points || 0} pts</div>
            <div className="ph-rank">{poolMember?.rank ? `${poolMember.rank}${poolMember.rank === 1 ? 'st' : poolMember.rank === 2 ? 'nd' : poolMember.rank === 3 ? 'rd' : 'th'} place` : '—'}</div>
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
        <div className="two-col">
          <div>
            {/* Lock warning */}
            <div className={`sp-lock-banner ${isLocked ? 'locked' : ''}`}>
              <div>
                <div className="slb-title">{isLocked ? '🔒 PICKS LOCKED' : '⚠ Locks at first kickoff · Jun 11, 5:00 PM ET'}</div>
                <div className="slb-sub">
                  {isLocked 
                    ? 'The tournament has started. Special picks can no longer be changed.'
                    : 'All special picks lock permanently when the tournament begins. You cannot change them once the first match starts.'}
                </div>
              </div>
            </div>

            {/* Champion */}
            <div className="sp-card">
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🏆</div><div className="sp-title">Champion</div></div>
                <div className="sp-pts">10 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that wins the 2026 World Cup.</div>
                <div className="team-grid">
                  {teams.slice(0, 16).map(t => (
                    <div 
                      key={t.code} 
                      className={`tg-opt ${champion === t.code ? 'sel' : ''} ${isLocked ? 'disabled' : ''}`} 
                      onClick={() => !isLocked && setChampion(t.code)}
                    >
                      <img src={t.flagUrl} alt={t.name} />
                      <div className="tg-opt-name">{t.name}</div>
                    </div>
                  ))}
                </div>
                {teams.length > 16 && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ color: 'var(--f4)', cursor: 'pointer', fontSize: '0.75rem' }}>Show all {teams.length} teams</summary>
                    <div className="team-grid" style={{ marginTop: '0.5rem' }}>
                      {teams.slice(16).map(t => (
                        <div 
                          key={t.code} 
                          className={`tg-opt ${champion === t.code ? 'sel' : ''} ${isLocked ? 'disabled' : ''}`} 
                          onClick={() => !isLocked && setChampion(t.code)}
                        >
                          <img src={t.flagUrl} alt={t.name} />
                          <div className="tg-opt-name">{t.name}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {champion 
                    ? <>Selected: <strong style={{ color: 'var(--gold)' }}>{teams.find(t => t.code === champion)?.name}</strong></>
                    : <span style={{ color: 'var(--red)' }}>⚠ No pick saved</span>
                  }
                </div>
                {!isLocked && (
                  <button 
                    className="btn-save" 
                    onClick={() => handleSave('champion', champion)}
                    disabled={saving.champion || !champion}
                  >
                    {saving.champion ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Runner-up */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🥈</div><div className="sp-title">Runner-Up</div></div>
                <div className="sp-pts">7 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that reaches the final but finishes second.</div>
                <div className="team-grid">
                  {teams.slice(0, 16).map(t => (
                    <div 
                      key={t.code} 
                      className={`tg-opt ${runnerUp === t.code ? 'sel' : ''} ${isLocked ? 'disabled' : ''}`} 
                      onClick={() => !isLocked && setRunnerUp(t.code)}
                    >
                      <img src={t.flagUrl} alt={t.name} />
                      <div className="tg-opt-name">{t.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {runnerUp 
                    ? <>Selected: <strong style={{ color: 'var(--gold)' }}>{teams.find(t => t.code === runnerUp)?.name}</strong></>
                    : <span style={{ color: 'var(--red)' }}>⚠ No pick saved</span>
                  }
                </div>
                {!isLocked && (
                  <button 
                    className="btn-save" 
                    onClick={() => handleSave('runner_up', runnerUp)}
                    disabled={saving.runner_up || !runnerUp}
                  >
                    {saving.runner_up ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Top Scorer */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">⚽</div><div className="sp-title">Pichichi · Top Scorer</div></div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the player who scores the most goals in the tournament.</div>
                {!isLocked && (
                  <>
                    <input 
                      className="player-search" 
                      type="text" 
                      placeholder="Search player name or country..."
                      value={scorerSearch}
                      onChange={(e) => setScorerSearch(e.target.value)}
                    />
                    <div className="player-results">
                      {filteredPlayers.map(p => (
                        <div 
                          key={p.id} 
                          className={`pr-item ${topScorer === p.name ? 'sel-player' : ''}`} 
                          onClick={() => setTopScorer(p.name)}
                        >
                          <div className="pr-flag"><img src={p.flagUrl} alt="" /></div>
                          <div><div className="pr-name">{p.name}</div><div className="pr-team">{p.team}</div></div>
                          {topScorer === p.name && <div className="pr-check">✓</div>}
                        </div>
                      ))}
                      {filteredPlayers.length === 0 && (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--f4)' }}>
                          No players found. Try a different search.
                        </div>
                      )}
                    </div>
                  </>
                )}
                {topScorer && (
                  <div className="selected-pick">
                    <div className="sel-flag">
                      <img src={players.find(p => p.name === topScorer)?.flagUrl} alt="" />
                    </div>
                    <div>
                      <div className="sel-name">{topScorer}</div>
                      <div className="sel-team">{players.find(p => p.name === topScorer)?.team}</div>
                    </div>
                    {!isLocked && (
                      <div className="sel-change" onClick={() => setTopScorer(null)}>Change</div>
                    )}
                  </div>
                )}
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">
                  {topScorer 
                    ? <>Selected: <strong style={{ color: 'var(--gold)' }}>{topScorer}</strong></>
                    : <span style={{ color: 'var(--red)' }}>⚠ No pick saved</span>
                  }
                </div>
                {!isLocked && (
                  <button 
                    className="btn-save" 
                    onClick={() => handleSave('top_scorer', topScorer)}
                    disabled={saving.top_scorer || !topScorer}
                  >
                    {saving.top_scorer ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Best Goalkeeper */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🥅</div><div className="sp-title">Best Goalkeeper</div></div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the goalkeeper awarded the Golden Glove at the end of the tournament.</div>
                {!isLocked && (
                  <>
                    <input 
                      className="player-search" 
                      type="text" 
                      placeholder="Search goalkeeper name or country..."
                      value={gkSearch}
                      onChange={(e) => setGkSearch(e.target.value)}
                    />
                    <div className="player-results">
                      {filteredGKs.map(p => (
                        <div 
                          key={p.id} 
                          className={`pr-item ${bestKeeper === p.name ? 'sel-player' : ''}`} 
                          onClick={() => setBestKeeper(p.name)}
                        >
                          <div className="pr-flag"><img src={p.flagUrl} alt="" /></div>
                          <div><div className="pr-name">{p.name}</div><div className="pr-team">{p.team}</div></div>
                          {bestKeeper === p.name && <div className="pr-check">✓</div>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {bestKeeper && (
                  <div className="selected-pick">
                    <div className="sel-flag">
                      <img src={goalkeepers.find(p => p.name === bestKeeper)?.flagUrl} alt="" />
                    </div>
                    <div>
                      <div className="sel-name">{bestKeeper}</div>
                      <div className="sel-team">{goalkeepers.find(p => p.name === bestKeeper)?.team}</div>
                    </div>
                    {!isLocked && (
                      <div className="sel-change" onClick={() => setBestKeeper(null)}>Change</div>
                    )}
                  </div>
                )}
              </div>
              <div className="sp-foot">
                <div className={`sp-foot-note ${!bestKeeper ? 'missing' : ''}`}>
                  {bestKeeper 
                    ? <>Selected: <strong style={{ color: 'var(--gold)' }}>{bestKeeper}</strong></>
                    : <span style={{ color: 'var(--red)' }}>⚠ No pick saved yet</span>
                  }
                </div>
                {!isLocked && (
                  <button 
                    className="btn-save" 
                    onClick={() => handleSave('best_keeper', bestKeeper)}
                    disabled={saving.best_keeper || !bestKeeper}
                  >
                    {saving.best_keeper ? 'Saving...' : 'Save'}
                  </button>
                )}
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
                  <div className={`sc-val ${champion ? 'green' : ''}`} style={{ color: champion ? 'var(--green)' : 'var(--red)' }}>
                    {champion ? `✓ ${teams.find(t => t.code === champion)?.name}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Runner-up</div>
                  <div className={`sc-val ${runnerUp ? 'green' : ''}`} style={{ color: runnerUp ? 'var(--green)' : 'var(--red)' }}>
                    {runnerUp ? `✓ ${teams.find(t => t.code === runnerUp)?.name}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Top scorer</div>
                  <div className="sc-val" style={{ color: topScorer ? 'var(--green)' : 'var(--red)' }}>
                    {topScorer ? `✓ ${topScorer.split(' ').slice(-1)}` : '⚠ Missing'}
                  </div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Goalkeeper</div>
                  <div className="sc-val" style={{ color: bestKeeper ? 'var(--green)' : 'var(--red)' }}>
                    {bestKeeper ? `✓ ${bestKeeper.split(' ').slice(-1)}` : '⚠ Missing'}
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
                <div className="sc-row" style={{ borderTop: '1px solid var(--line)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <div className="sc-label" style={{ fontWeight: 600 }}>Total</div>
                  <div className="sc-val gold" style={{ fontSize: '1.1rem' }}>27 pts</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ borderColor: isLocked ? 'rgba(224,59,59,0.4)' : 'rgba(224,59,59,0.2)' }}>
              <div className="card-head" style={{ background: isLocked ? 'rgba(224,59,59,0.15)' : 'rgba(224,59,59,0.08)', borderColor: 'rgba(224,59,59,0.15)' }}>
                <div className="card-title" style={{ color: 'var(--red)' }}>{isLocked ? '🔒 Locked' : 'Deadline'}</div>
              </div>
              <div className="card-body">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>Jun 11</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--f3)', marginTop: '4px' }}>5:00 PM ET — First kickoff</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--f4)', marginTop: '8px', lineHeight: 1.5 }}>
                  {isLocked 
                    ? 'Tournament has started. Picks are now locked.'
                    : 'All special picks lock the moment the first match starts. No exceptions.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid var(--f4); text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        .page-header { background: var(--bg2); border-bottom: 1px solid var(--line); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: var(--white); }
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; }
        .ph-right { text-align: right; }
        .ph-score { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; color: var(--gold); line-height: 1; }
        .ph-rank { font-size: 0.72rem; color: var(--f3); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Barlow Condensed', sans-serif; margin-top: 2px; }

        .tab-nav { background: var(--bg2); border-bottom: 1px solid var(--line); }
        .tab-nav-inner { max-width: 1100px; margin: 0 auto; display: flex; }
        .tab { display: flex; align-items: center; gap: 0.4rem; padding: 0 1.5rem; height: 44px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); border-bottom: 2px solid transparent; cursor: pointer; text-decoration: none; }
        .tab:hover { color: var(--f1); }
        .tab.active { color: var(--white); border-bottom-color: var(--gold); }
        .tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); color: #000; font-size: 0.6rem; font-weight: 900; }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .two-col { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }

        .sp-lock-banner { display: flex; align-items: flex-start; gap: 0.75rem; background: rgba(201,168,76,0.07); border: 1px solid var(--gold-line); border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
        .sp-lock-banner.locked { background: rgba(224,59,59,0.08); border-color: rgba(224,59,59,0.25); }
        .slb-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); }
        .sp-lock-banner.locked .slb-title { color: var(--red); }
        .slb-sub { font-size: 0.72rem; color: var(--f3); margin-top: 3px; line-height: 1.5; }

        .sp-card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
        .sp-head { background: var(--bg3); padding: 0.5rem 1rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .sp-title-group { display: flex; align-items: center; gap: 0.6rem; }
        .sp-icon { font-size: 1rem; }
        .sp-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.88rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--white); }
        .sp-pts { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 2px; background: rgba(201,168,76,0.12); color: var(--gold); border: 1px solid var(--gold-line); }
        .sp-body { padding: 1rem; }
        .sp-desc { font-size: 0.77rem; color: var(--f3); margin-bottom: 0.75rem; line-height: 1.5; }
        .sp-foot { border-top: 1px solid var(--line); padding: 0.6rem 1rem; display: flex; align-items: center; justify-content: space-between; }
        .sp-foot-note { font-size: 0.7rem; color: var(--f4); }
        .sp-foot-note.missing { color: var(--red); }

        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .tg-opt { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.5rem; border-radius: 3px; background: var(--bg3); border: 1px solid var(--line); cursor: pointer; transition: all 0.15s; }
        .tg-opt:hover:not(.disabled) { border-color: var(--f3); }
        .tg-opt.sel { border-color: var(--gold); background: rgba(201,168,76,0.08); }
        .tg-opt.disabled { cursor: not-allowed; opacity: 0.6; }
        .tg-opt img { width: 36px; height: 25px; border-radius: 2px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .tg-opt-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--f2); text-align: center; }
        .tg-opt.sel .tg-opt-name { color: var(--gold); }

        .player-search { width: 100%; padding: 0.55rem 0.85rem; background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; color: var(--f1); font-size: 0.82rem; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.15s; margin-bottom: 0.5rem; }
        .player-search:focus { border-color: var(--gold); }
        .player-search::placeholder { color: var(--f4); }
        .player-results { background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; overflow: hidden; max-height: 200px; overflow-y: auto; }
        .pr-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.15s; }
        .pr-item:last-child { border-bottom: none; }
        .pr-item:hover { background: rgba(255,255,255,0.04); }
        .pr-item.sel-player { background: rgba(201,168,76,0.08); }
        .pr-flag img { width: 20px; height: 14px; border-radius: 1px; object-fit: cover; }
        .pr-name { font-size: 0.82rem; font-weight: 600; color: var(--f1); }
        .pr-team { font-size: 0.7rem; color: var(--f3); }
        .pr-check { margin-left: auto; color: var(--gold); font-weight: 700; }

        .selected-pick { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.85rem; background: rgba(201,168,76,0.06); border: 1px solid var(--gold-line); border-radius: 3px; margin-top: 0.5rem; }
        .sel-flag img { width: 28px; height: 19px; border-radius: 2px; object-fit: cover; }
        .sel-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--white); }
        .sel-team { font-size: 0.7rem; color: var(--f3); }
        .sel-change { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--f4); cursor: pointer; text-decoration: underline; }
        .sel-change:hover { color: var(--f2); }

        .btn-save { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.4rem 1.1rem; border-radius: 2px; border: none; cursor: pointer; }
        .btn-save:hover:not(:disabled) { background: var(--gold2); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { background: var(--bg3); padding: 0.65rem 1rem; border-bottom: 1px solid var(--line); }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .card-body { padding: 1rem; }
        .sc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sc-row:last-child { border-bottom: none; }
        .sc-label { font-size: 0.75rem; color: var(--f3); }
        .sc-val { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--f1); }
        .sc-val.gold { color: var(--gold); }
        .sc-val.green { color: var(--green); }

        @media (max-width: 900px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .two-col { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  )
}
