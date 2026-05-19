'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'
import { WC2026_TEAMS, generateGroupStageMatches, SCORING_RULES } from '../../../../lib/wc2026-data'
import * as espn from '../../../styles/espn-theme'

// ESPN-style Match Pick Card
function MatchPickCard({ match, homeTeam, awayTeam, prediction, actualScore, onUpdatePrediction, status = 'open' }) {
  const isSaved = prediction?.homeScore !== undefined && prediction?.awayScore !== undefined
  const isLive = status === 'live'
  const isFinished = status === 'ft'
  const isLocked = isLive || isFinished

  const handleScoreChange = (team, value) => {
    if (isLocked) return
    const numVal = parseInt(value)
    if (isNaN(numVal) && value !== '') return
    if (numVal < 0 || numVal > 20) return
    onUpdatePrediction(match.id, team === 'home' ? 'homeScore' : 'awayScore', value === '' ? undefined : numVal)
  }

  // Calculate points earned
  let pointsEarned = null
  if (isFinished && isSaved && actualScore) {
    if (prediction.homeScore === actualScore.home && prediction.awayScore === actualScore.away) {
      pointsEarned = 3
    } else if (
      (prediction.homeScore > prediction.awayScore && actualScore.home > actualScore.away) ||
      (prediction.homeScore < prediction.awayScore && actualScore.home < actualScore.away) ||
      (prediction.homeScore === prediction.awayScore && actualScore.home === actualScore.away)
    ) {
      if (prediction.homeScore === actualScore.home || prediction.awayScore === actualScore.away) {
        pointsEarned = 2
      } else {
        pointsEarned = 1
      }
    } else {
      pointsEarned = 0
    }
  }

  return (
    <div className={`mpc ${isSaved ? 'submitted' : ''} ${isLocked ? 'locked-card' : ''}`}>
      <div className="mpc-head">
        <div className="mpc-info">
          Group {match.group} · {match.date} · {match.time} · {match.venue?.split(',')[0]}
        </div>
        <div className={`mpc-status ${isLive ? 's-live' : isFinished ? 's-ft' : isSaved ? 's-saved' : 's-open'}`}>
          {isLive && <span className="live-dot"></span>}
          {isLive ? `Live ${actualScore?.minute || ''}'` : isFinished ? 'FT' : isSaved ? '✓ Saved' : 'Open'}
        </div>
      </div>
      
      <div className="mpc-body">
        <div className="team-side">
          <div className="team-flag">
            <img src={`https://flagcdn.com/w80/${getCountryCode(homeTeam?.code)}.png`} alt={homeTeam?.code} />
          </div>
          <div className="team-nm">{homeTeam?.name}</div>
        </div>
        
        <div className="score-center">
          {isLive && actualScore && (
            <div className="live-score-label">Live {actualScore.home} – {actualScore.away}</div>
          )}
          {isFinished && actualScore && (
            <div className="final-score-label">Final {actualScore.home} – {actualScore.away}</div>
          )}
          
          {!isLocked ? (
            <>
              <div className="score-status s-open">Pick your score</div>
              <div className="score-inputs">
                <input 
                  className={`si ${prediction?.homeScore !== undefined ? 'filled' : ''}`}
                  type="number" 
                  min="0" 
                  max="20" 
                  placeholder="0"
                  value={prediction?.homeScore ?? ''}
                  onChange={(e) => handleScoreChange('home', e.target.value)}
                />
                <span className="sc-dash">—</span>
                <input 
                  className={`si ${prediction?.awayScore !== undefined ? 'filled' : ''}`}
                  type="number" 
                  min="0" 
                  max="20" 
                  placeholder="0"
                  value={prediction?.awayScore ?? ''}
                  onChange={(e) => handleScoreChange('away', e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="score-display">
                <span className={`sd-val ${isFinished && !pointsEarned ? 'muted' : ''}`}>{prediction?.homeScore ?? '—'}</span>
                <span className="sd-sep">–</span>
                <span className={`sd-val ${isFinished && !pointsEarned ? 'muted' : ''}`}>{prediction?.awayScore ?? '—'}</span>
              </div>
              <div className="your-pick-label">Your pick</div>
              {pointsEarned !== null && pointsEarned > 0 && (
                <span className="pts-badge">+{pointsEarned} pt{pointsEarned > 1 ? 's' : ''}</span>
              )}
              {isLive && isSaved && (
                <span className="pts-badge">+{prediction.homeScore === actualScore?.home && prediction.awayScore === actualScore?.away ? 3 : 1}+ pt so far</span>
              )}
            </>
          )}
        </div>
        
        <div className="team-side">
          <div className="team-flag">
            <img src={`https://flagcdn.com/w80/${getCountryCode(awayTeam?.code)}.png`} alt={awayTeam?.code} />
          </div>
          <div className="team-nm">{awayTeam?.name}</div>
        </div>
      </div>

      {!isLocked && (
        <div className="mpc-foot">
          {isSaved && (
            <div style={{fontSize: '0.7rem', color: 'var(--f3)', marginRight: 'auto'}}>
              Saved
            </div>
          )}
          <button className="btn-edit" onClick={() => {
            onUpdatePrediction(match.id, 'homeScore', undefined)
            onUpdatePrediction(match.id, 'awayScore', undefined)
          }}>Clear</button>
          <button className="btn-save">Save Pick</button>
        </div>
      )}

      <style jsx>{`
        ${espn.matchPickCardStyles}
        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--red);
          animation: pulse 1.4s ease infinite;
          display: inline-block;
          margin-right: 4px;
        }
        .live-score-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--red);
          margin-bottom: 2px;
        }
        .final-score-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f4);
          margin-bottom: 2px;
        }
        .your-pick-label {
          font-size: 0.65rem;
          color: var(--f4);
          margin-top: 2px;
          font-family: 'Barlow Condensed', sans-serif;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}

function getCountryCode(teamCode) {
  const codeMap = {
    'MEX': 'mx', 'USA': 'us', 'CAN': 'ca',
    'ARG': 'ar', 'BRA': 'br', 'COL': 'co', 'URU': 'uy', 'ECU': 'ec', 'PRY': 'py', 'CHL': 'cl', 'PER': 'pe', 'VEN': 've',
    'ENG': 'gb-eng', 'ESP': 'es', 'FRA': 'fr', 'GER': 'de', 'ITA': 'it', 'NED': 'nl', 'POR': 'pt', 'BEL': 'be',
    'CRO': 'hr', 'SUI': 'ch', 'DEN': 'dk', 'POL': 'pl', 'SWE': 'se', 'AUT': 'at', 'TUR': 'tr', 'UKR': 'ua',
    'JPN': 'jp', 'KOR': 'kr', 'AUS': 'au', 'IRN': 'ir', 'SAU': 'sa', 'QAT': 'qa', 'CHN': 'cn',
    'SEN': 'sn', 'NGA': 'ng', 'MAR': 'ma', 'GHA': 'gh', 'CMR': 'cm', 'CIV': 'ci', 'ALG': 'dz', 'EGY': 'eg', 'TUN': 'tn',
    'NZL': 'nz', 'WAL': 'gb-wls', 'CRC': 'cr', 'SRB': 'rs',
  }
  return codeMap[teamCode] || teamCode?.toLowerCase() || 'un'
}

export default function PredictionsPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [poolMemberId, setPoolMemberId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeMatchday, setActiveMatchday] = useState(1)
  const [predictions, setPredictions] = useState({})
  const [savedPredictions, setSavedPredictions] = useState({})
  const [matches, setMatches] = useState([])
  const [saveMessage, setSaveMessage] = useState('')
  const [countdown, setCountdown] = useState('11:42:07')
  const [myMembership, setMyMembership] = useState(null)

  useEffect(() => {
    loadData()
  }, [params.id])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        const [h, m, s] = prev.split(':').map(Number)
        let total = h * 3600 + m * 60 + s - 1
        if (total < 0) total = 0
        const newH = Math.floor(total / 3600)
        const newM = Math.floor((total % 3600) / 60)
        const newS = total % 60
        return [newH, newM, newS].map(v => String(v).padStart(2, '0')).join(':')
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

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

    // Get pool member ID
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
    setPoolMemberId(memberData.id)
    setMyMembership(memberData)

    // Generate matches
    const groupMatches = generateGroupStageMatches()
    setMatches(groupMatches)

    // Load existing predictions
    const { data: existingPicks } = await supabase
      .from('match_picks')
      .select('*')
      .eq('pool_member_id', memberData.id)

    if (existingPicks) {
      const picksMap = {}
      existingPicks.forEach(pick => {
        picksMap[pick.match_id] = {
          homeScore: pick.home_score,
          awayScore: pick.away_score,
        }
      })
      setPredictions(picksMap)
      setSavedPredictions(picksMap)
    }

    setLoading(false)
  }

  const updatePrediction = (matchId, field, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      }
    }))
  }

  const savePredictions = async () => {
    setSaving(true)
    setSaveMessage('')

    try {
      const validPredictions = Object.entries(predictions)
        .filter(([matchId, pred]) => 
          pred.homeScore !== undefined && 
          pred.awayScore !== undefined &&
          !isNaN(pred.homeScore) &&
          !isNaN(pred.awayScore)
        )

      if (validPredictions.length === 0) {
        setSaveMessage('No predictions to save')
        setSaving(false)
        return
      }

      const upserts = validPredictions.map(([matchId, pred]) => ({
        pool_member_id: poolMemberId,
        match_id: matchId,
        home_score: pred.homeScore,
        away_score: pred.awayScore,
        locked: false,
      }))

      const { error } = await supabase
        .from('match_picks')
        .upsert(upserts, { 
          onConflict: 'pool_member_id,match_id',
          ignoreDuplicates: false 
        })

      if (error) throw error

      setSavedPredictions({ ...predictions })
      setSaveMessage(`Saved ${upserts.length} predictions!`)
      
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setSaveMessage('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
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

  const getTeamByCode = (code) => WC2026_TEAMS.find(t => t.code === code)
  
  // Group matches by matchday (6 matches each for simplicity)
  const matchdays = [1, 2, 3, 4, 5, 6]
  const knockoutRounds = ['R32', 'R16', 'QF', 'SF', 'F']
  const matchesPerDay = 12
  const matchdayMatches = matches.slice((activeMatchday - 1) * matchesPerDay, activeMatchday * matchesPerDay)

  const hasUnsavedChanges = JSON.stringify(predictions) !== JSON.stringify(savedPredictions)

  // Count predictions
  const predictedCount = Object.entries(predictions).filter(
    ([id, p]) => p.homeScore !== undefined && p.awayScore !== undefined
  ).length

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
        </div>
      </div>

      {/* Main Nav */}
      <nav className="main-nav">
        <Link href="/dashboard" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${params.id}`} className="nav-item">{pool?.name}</Link>
          <span className="nav-item active">Match Picks</span>
        </div>
        <button 
          onClick={savePredictions} 
          disabled={saving || !hasUnsavedChanges}
          className="nav-cta"
          style={{opacity: hasUnsavedChanges ? 1 : 0.5}}
        >
          {saving ? 'Saving...' : hasUnsavedChanges ? 'Save All' : '✓ Saved'}
        </button>
      </nav>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">
              <Link href={`/pool/${params.id}`} style={{color: 'var(--gold)', textDecoration: 'none'}}>
                {pool?.name}
              </Link> › Match Picks
            </div>
            <div className="ph-title">Matchday {activeMatchday}</div>
            <div className="ph-meta">Submit your predictions before kickoff</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">{myMembership?.total_points || 0} pts</div>
            <div className="ph-rank">{predictedCount} / {matches.length} picks</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Matchday Strip */}
            <div className="md-strip">
              {matchdays.map(md => (
                <button 
                  key={md}
                  className={`md-btn ${activeMatchday === md ? 'active' : ''} ${md < activeMatchday ? 'done' : ''}`}
                  onClick={() => setActiveMatchday(md)}
                >
                  MD {md}
                </button>
              ))}
              {knockoutRounds.map(round => (
                <button key={round} className="md-btn locked">{round}</button>
              ))}
            </div>

            {/* Deadline Banner */}
            <div className="deadline-banner">
              <div>
                <div className="db-left">Matchday {activeMatchday} — Picks close Jun {10 + activeMatchday * 3}, 3:00 PM ET</div>
                <div className="db-sub">Submit all picks before the first match kicks off</div>
              </div>
              <div className="db-countdown">{countdown}</div>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
                {saveMessage.includes('Error') ? '❌' : '✅'} {saveMessage}
              </div>
            )}

            {/* Match Cards */}
            <div className="matches-list">
              {matchdayMatches.map(match => {
                const homeTeam = getTeamByCode(match.homeTeam)
                const awayTeam = getTeamByCode(match.awayTeam)
                const prediction = predictions[match.id] || {}

                return (
                  <MatchPickCard 
                    key={match.id}
                    match={match}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    prediction={prediction}
                    onUpdatePrediction={(matchId, field, value) => updatePrediction(matchId, field, value)}
                    status="open"
                  />
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Matchday {activeMatchday} Progress</div></div>
              <div className="card-body">
                <div className="sc-row">
                  <div className="sc-label">Picks submitted</div>
                  <div className="sc-val green">{matchdayMatches.filter(m => predictions[m.id]?.homeScore !== undefined).length} / {matchdayMatches.length}</div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Points this matchday</div>
                  <div className="sc-val gold">0</div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Total points</div>
                  <div className="sc-val">{myMembership?.total_points || 0}</div>
                </div>
                <div className="sc-row">
                  <div className="sc-label">Your rank</div>
                  <div className="sc-val gold">{myMembership?.rank ? `${myMembership.rank}${getRankSuffix(myMembership.rank)}` : '—'}</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Scoring</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Exact scoreline</div><div className="sc-val gold">3 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct winner + 1 score</div><div className="sc-val gold">2 pts</div></div>
                <div className="sc-row"><div className="sc-label">Correct result only</div><div className="sc-val gold">1 pt</div></div>
                <div className="sc-row" style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--line)'}}>
                  <div className="sc-label">Champion pick</div><div className="sc-val gold">10 pts</div>
                </div>
                <div className="sc-row"><div className="sc-label">Runner-up pick</div><div className="sc-val gold">7 pts</div></div>
                <div className="sc-row"><div className="sc-label">Top scorer pick</div><div className="sc-val gold">5 pts</div></div>
                <div className="sc-row"><div className="sc-label">Best goalkeeper pick</div><div className="sc-val gold">5 pts</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && (
        <button className="floating-save" onClick={savePredictions} disabled={saving}>
          {saving ? 'Saving...' : `Save ${Object.values(predictions).filter(p => p.homeScore !== undefined).length} Predictions`}
        </button>
      )}

      <style jsx>{`
        ${espn.espnStyles}
        ${espn.topbarStyles}
        ${espn.navStyles}
        ${espn.pageHeaderStyles}
        ${espn.cardStyles}
        ${espn.sidebarStyles}
        ${espn.matchdayStripStyles}
        ${espn.deadlineBannerStyles}
        ${espn.layoutStyles}

        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .save-message {
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .save-message.success {
          background: rgba(44,182,125,0.1);
          border: 1px solid rgba(44,182,125,0.3);
          color: var(--green);
        }
        .save-message.error {
          background: rgba(224,59,59,0.1);
          border: 1px solid rgba(224,59,59,0.3);
          color: var(--red);
        }

        .floating-save {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gold);
          color: #000;
          border: none;
          padding: 1rem 2rem;
          border-radius: 30px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(201,168,76,0.3);
          z-index: 1000;
          transition: all 0.2s ease;
        }
        .floating-save:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 6px 24px rgba(201,168,76,0.4);
        }
        .floating-save:disabled {
          opacity: 0.7;
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
