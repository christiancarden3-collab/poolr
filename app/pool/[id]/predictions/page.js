'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function PredictionsPage() {
  const params = useParams()
  const router = useRouter()
  const [matchday, setMatchday] = useState(1)
  const [matches, setMatches] = useState([])
  const [picks, setPicks] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [user, setUser] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [pool, setPool] = useState(null)
  const [deadline, setDeadline] = useState(null)

  // Load data on mount and matchday change
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

      // Fetch matches for this matchday
      const response = await fetch(`/api/matches?matchday=${matchday}`)
      const data = await response.json()
      
      if (data.success && data.matches) {
        setMatches(data.matches)
        
        // Find earliest match time for deadline
        if (data.matches.length > 0) {
          const earliestMatch = data.matches.reduce((earliest, match) => 
            new Date(match.matchTime) < new Date(earliest.matchTime) ? match : earliest
          )
          setDeadline(new Date(earliestMatch.matchTime))
        }
      }

      // Load existing picks for this user
      if (memberData && data.matches) {
        const matchIds = data.matches.map(m => m.id)
        const { data: existingPicks } = await supabase
          .from('match_picks')
          .select('*')
          .eq('pool_member_id', memberData.id)
          .in('match_id', matchIds)

        if (existingPicks) {
          const picksMap = {}
          existingPicks.forEach(pick => {
            picksMap[pick.match_id] = {
              homeScore: pick.home_score,
              awayScore: pick.away_score,
              saved: true,
              savedAt: pick.submitted_at,
              pointsEarned: pick.points_earned,
            }
          })
          setPicks(picksMap)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }, [matchday, params.id, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleScoreChange = (matchId, side, value) => {
    const numValue = value === '' ? null : parseInt(value)
    setPicks(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [`${side}Score`]: numValue,
        saved: false,
      }
    }))
  }

  const handleSave = async (matchId) => {
    const pick = picks[matchId]
    if (pick?.homeScore === null || pick?.awayScore === null || pick?.homeScore === undefined || pick?.awayScore === undefined) {
      alert('Please enter both scores')
      return
    }

    setSaving(prev => ({ ...prev, [matchId]: true }))
    
    try {
      // Upsert the pick
      const { error } = await supabase
        .from('match_picks')
        .upsert({
          pool_member_id: poolMember.id,
          match_id: matchId,
          home_score: pick.homeScore,
          away_score: pick.awayScore,
          locked: false,
          submitted_at: new Date().toISOString(),
        }, {
          onConflict: 'pool_member_id,match_id'
        })

      if (error) throw error

      setPicks(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          saved: true,
          savedAt: 'Just now',
        }
      }))
    } catch (error) {
      console.error('Error saving pick:', error)
      alert('Failed to save pick: ' + error.message)
    } finally {
      setSaving(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const handleClear = (matchId) => {
    setPicks(prev => ({
      ...prev,
      [matchId]: {
        homeScore: null,
        awayScore: null,
        saved: false,
      }
    }))
  }

  const getMatchStatus = (match) => {
    const now = new Date()
    const matchTime = new Date(match.matchTime)
    const pick = picks[match.id]

    if (match.status === 'completed') return 'ft'
    if (match.status === 'live') return 'live'
    if (matchTime <= now) return 'locked'
    if (pick?.saved) return 'saved'
    return 'open'
  }

  const formatDeadline = () => {
    if (!deadline) return 'Loading...'
    return deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    }) + ' ET'
  }

  const getCountdown = () => {
    if (!deadline) return '--:--:--'
    const now = new Date()
    const diff = deadline - now
    if (diff <= 0) return 'LOCKED'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Count submitted picks
  const submittedCount = matches.filter(m => picks[m.id]?.saved).length
  const totalMatches = matches.length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>
        Loading matches...
      </div>
    )
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${params.id}`} className="nav-item active">{pool?.name || 'Pool'}</Link>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">Match Picks</div>
            <div className="ph-meta">FIFA World Cup 2026 · Matchday {matchday}</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{poolMember?.total_points || 0} pts</div>
            <div className="ph-rank">{poolMember?.rank ? `${poolMember.rank}${poolMember.rank === 1 ? 'st' : poolMember.rank === 2 ? 'nd' : poolMember.rank === 3 ? 'rd' : 'th'} place` : '—'}</div>
          </div>
        </div>
      </div>

      {/* TAB NAV */}
      <div className="tab-nav">
        <div className="tab-nav-inner">
          <span className="tab active">Match Picks{submittedCount < totalMatches && <span className="tab-badge">{totalMatches - submittedCount}</span>}</span>
          <Link href={`/pool/${params.id}/special-picks`} className="tab">Special Picks</Link>
          <Link href={`/pool/${params.id}`} className="tab">Leaderboard</Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Matchday strip */}
            <div className="md-strip">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((md) => {
                const labels = ['MD 1', 'MD 2', 'MD 3', 'R32', 'R16', 'QF', 'SF', 'F']
                return (
                  <button 
                    key={md}
                    className={`md-btn ${md === matchday ? 'active' : ''} ${md < matchday ? 'done' : ''}`}
                    onClick={() => setMatchday(md)}
                  >
                    {labels[md - 1]}
                  </button>
                )
              })}
            </div>

            {/* Deadline banner */}
            <div className="deadline-banner">
              <div>
                <div className="db-left">Matchday {matchday} — Picks close {formatDeadline()}</div>
                <div className="db-sub">Submit all picks before the first match kicks off</div>
              </div>
              <div className="db-countdown">{getCountdown()}</div>
            </div>

            {/* No matches message */}
            {matches.length === 0 && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚽</div>
                  <div style={{ color: 'var(--f2)', marginBottom: '0.5rem' }}>No matches for Matchday {matchday}</div>
                  <div style={{ color: 'var(--f4)', fontSize: '0.85rem' }}>
                    {matchday > 3 ? 'Knockout matches will appear after group stage' : 'Try running the seed script first'}
                  </div>
                </div>
              </div>
            )}

            {/* Match cards */}
            {matches.map(match => {
              const status = getMatchStatus(match)
              const pick = picks[match.id] || {}
              const isLocked = ['live', 'ft', 'locked'].includes(status)
              
              return (
                <div key={match.id} className={`mpc ${status === 'saved' ? 'submitted' : ''} ${isLocked ? 'locked-card' : ''}`}>
                  <div className="mpc-head">
                    <div className="mpc-info">
                      {match.group ? `Group ${match.group} · ` : ''}{match.date} · {match.time}
                    </div>
                    <div className={`mpc-status s-${status}`}>
                      {status === 'open' && 'Open'}
                      {status === 'saved' && '✓ Saved'}
                      {status === 'live' && <><span className="live-dot"></span>Live</>}
                      {status === 'ft' && 'FT'}
                      {status === 'locked' && '🔒 Locked'}
                    </div>
                  </div>
                  <div className="mpc-body">
                    <div className="team-side">
                      <div className="team-flag">
                        <img src={`https://flagcdn.com/w80/${match.homeTeam.flag}.png`} alt="" />
                      </div>
                      <div className="team-nm">{match.homeTeam.name}</div>
                    </div>
                    <div className="score-center">
                      {status === 'live' && (
                        <div className="live-label">Live {match.homeScore} – {match.awayScore}</div>
                      )}
                      {status === 'ft' && (
                        <div className="ft-label">Final {match.homeScore} – {match.awayScore}</div>
                      )}
                      
                      {!isLocked ? (
                        <>
                          <div className="score-status">Pick your score</div>
                          <div className="score-inputs">
                            <input 
                              className={`si ${pick.homeScore !== null && pick.homeScore !== undefined ? 'filled' : ''}`}
                              type="number" 
                              min="0" 
                              max="20" 
                              placeholder="0"
                              value={pick.homeScore ?? ''}
                              onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                            />
                            <span className="sc-dash">—</span>
                            <input 
                              className={`si ${pick.awayScore !== null && pick.awayScore !== undefined ? 'filled' : ''}`}
                              type="number" 
                              min="0" 
                              max="20" 
                              placeholder="0"
                              value={pick.awayScore ?? ''}
                              onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                            />
                          </div>
                        </>
                      ) : pick.homeScore !== undefined ? (
                        <>
                          <div className="score-display">
                            <span className={`sd-val ${isLocked ? 'muted' : ''}`}>{pick.homeScore}</span>
                            <span className="sd-sep">–</span>
                            <span className={`sd-val ${isLocked ? 'muted' : ''}`}>{pick.awayScore}</span>
                          </div>
                          <div className="pick-label">Your pick</div>
                          {pick.pointsEarned > 0 && <span className="pts-badge">+{pick.pointsEarned} pts</span>}
                        </>
                      ) : (
                        <div className="pick-label" style={{ color: 'var(--red)' }}>No pick submitted</div>
                      )}
                    </div>
                    <div className="team-side">
                      <div className="team-flag">
                        <img src={`https://flagcdn.com/w80/${match.awayTeam.flag}.png`} alt="" />
                      </div>
                      <div className="team-nm">{match.awayTeam.name}</div>
                    </div>
                  </div>
                  {status === 'open' && (
                    <div className="mpc-foot">
                      <button className="btn-edit" onClick={() => handleClear(match.id)}>Clear</button>
                      <button 
                        className="btn-save" 
                        onClick={() => handleSave(match.id)}
                        disabled={saving[match.id]}
                      >
                        {saving[match.id] ? 'Saving...' : 'Save Pick'}
                      </button>
                    </div>
                  )}
                  {status === 'saved' && !isLocked && (
                    <div className="mpc-foot">
                      <div style={{ fontSize: '0.7rem', color: 'var(--f3)' }}>
                        Saved {typeof pick.savedAt === 'string' ? pick.savedAt : new Date(pick.savedAt).toLocaleString()}
                      </div>
                      <button className="btn-edit" onClick={() => setPicks(prev => ({
                        ...prev,
                        [match.id]: { ...prev[match.id], saved: false }
                      }))}>Edit</button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Matchday {matchday} Progress</div></div>
              <div className="card-body">
                <div className="sc-row">
                  <div className="sc-label">Picks submitted</div>
                  <div className={`sc-val ${submittedCount === totalMatches ? 'green' : ''}`}>
                    {submittedCount} / {totalMatches}
                  </div>
                </div>
                <div className="sc-row"><div className="sc-label">Total points</div><div className="sc-val">{poolMember?.total_points || 0}</div></div>
                <div className="sc-row"><div className="sc-label">Your rank</div><div className="sc-val gold">{poolMember?.rank || '—'}</div></div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Scoring</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Exact scoreline</div><div className="sc-val gold">3 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct result only</div><div className="sc-val gold">1 pt</div></div>
                <div className="sc-row"><div className="sc-label">Knockout multiplier</div><div className="sc-val gold">1.5x – 3x</div></div>
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

        .md-strip { display: flex; gap: 0; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1.25rem; }
        .md-btn { flex: 1; padding: 0.45rem 0; text-align: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--bg2); color: var(--f3); border: none; cursor: pointer; border-right: 1px solid var(--line); transition: all 0.15s; }
        .md-btn:last-child { border-right: none; }
        .md-btn.active { background: var(--gold); color: #000; }
        .md-btn.done { color: var(--green); }
        .md-btn.locked { color: var(--f4); cursor: default; }

        .deadline-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(201,168,76,0.07); border: 1px solid var(--gold-line); border-radius: 4px; padding: 0.6rem 1rem; margin-bottom: 1.25rem; }
        .db-left { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold); }
        .db-sub { font-size: 0.7rem; color: var(--f3); margin-top: 1px; }
        .db-countdown { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 900; color: var(--gold); letter-spacing: 0.04em; }

        .mpc { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 2px; }
        .mpc.submitted { border-color: rgba(44,182,125,0.25); }
        .mpc.locked-card { opacity: 0.65; }
        .mpc-head { background: var(--bg3); padding: 0.4rem 1rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
        .mpc-info { font-family: 'Barlow Condensed', sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); }
        .mpc-status { font-family: 'Barlow Condensed', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 4px; }
        .s-open { color: var(--green); }
        .s-saved { color: var(--green); }
        .s-live { color: var(--red); }
        .s-ft { color: var(--f4); }
        .s-locked { color: var(--f4); }
        .live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); animation: pulse 1.4s ease infinite; }

        .mpc-body { display: grid; grid-template-columns: 1fr 170px 1fr; align-items: center; gap: 0; padding: 0.85rem 1rem; }
        .team-side { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
        .team-flag img { width: 42px; height: 29px; border-radius: 3px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .team-nm { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; color: var(--f1); text-align: center; }
        .score-center { display: flex; flex-direction: column; align-items: center; gap: 3px; }
        .score-status { font-family: 'Barlow Condensed', sans-serif; font-size: 0.58rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); }
        .live-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--red); margin-bottom: 2px; }
        .ft-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); margin-bottom: 2px; }
        .pick-label { font-size: 0.65rem; color: var(--f4); margin-top: 2px; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }

        .score-inputs { display: flex; align-items: center; gap: 6px; }
        .si { width: 50px; height: 50px; background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; color: var(--white); font-family: 'Barlow Condensed', sans-serif; font-size: 1.7rem; font-weight: 900; text-align: center; outline: none; transition: border-color 0.15s; -moz-appearance: textfield; padding: 0; }
        .si::-webkit-outer-spin-button, .si::-webkit-inner-spin-button { -webkit-appearance: none; }
        .si:focus { border-color: var(--gold); }
        .si.filled { border-color: rgba(44,182,125,0.4); background: rgba(44,182,125,0.04); }
        .sc-dash { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 900; color: var(--f4); }

        .score-display { display: flex; align-items: center; gap: 6px; }
        .sd-val { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; color: var(--gold); min-width: 30px; text-align: center; line-height: 1; }
        .sd-val.muted { color: var(--f2); }
        .sd-sep { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 700; color: var(--f4); }
        .pts-badge { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 2px; background: rgba(44,182,125,0.12); color: var(--green); border: 1px solid rgba(44,182,125,0.25); margin-top: 3px; }

        .mpc-foot { border-top: 1px solid var(--line); padding: 0.5rem 1rem; display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; background: rgba(0,0,0,0.15); }
        .btn-save { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.4rem 1.1rem; border-radius: 2px; border: none; cursor: pointer; }
        .btn-save:hover { background: var(--gold2); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-edit { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; color: var(--f3); border: 1px solid var(--f4); padding: 0.35rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .btn-edit:hover { color: var(--f1); border-color: var(--f2); }

        .card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { background: var(--bg3); padding: 0.65rem 1rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .card-body { padding: 1rem; }
        .sc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sc-row:last-child { border-bottom: none; }
        .sc-label { font-size: 0.75rem; color: var(--f3); }
        .sc-val { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--f1); }
        .sc-val.gold { color: var(--gold); }
        .sc-val.green { color: var(--green); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

        @media (max-width: 900px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .two-col { grid-template-columns: 1fr; }
          .mpc-body { grid-template-columns: 1fr 120px 1fr; }
          .si { width: 40px; height: 40px; font-size: 1.4rem; }
          .md-strip { overflow-x: auto; }
        }
      `}</style>
    </>
  )
}
