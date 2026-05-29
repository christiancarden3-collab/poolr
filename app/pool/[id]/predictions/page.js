'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { RG_SCHEDULE, getRanking, getFlag } from '@/lib/rg-matches'
import { MATCHES as WC_MATCHES, TEAMS as WC_TEAMS } from '@/lib/wc2026-database'

// Roland Garros 2026 fixtures
function getRGMatches(matchday) {
  const dayData = RG_SCHEDULE[matchday] || []
  return dayData.map(m => ({
    id: m.id,
    matchday,
    stage: 'R1',
    homeTeam: { name: m.p1, flag: getFlag(m.c1), rank: getRanking(m.p1) },
    awayTeam: { name: m.p2, flag: getFlag(m.c2), rank: getRanking(m.p2) },
    date: m.date,
    time: `${m.time} ET`,
    status: 'scheduled'
  }))
}

// World Cup 2026 fixtures - using real schedule from database
function getWCMatches(matchday) {
  // Build team lookup
  const teamLookup = {}
  WC_TEAMS.forEach(t => { teamLookup[t.code] = t })
  
  // Filter matches by matchday and format
  const matches = WC_MATCHES.filter(m => m.md === matchday && m.stage === 'group')
  
  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  return matches.map(m => {
    const home = teamLookup[m.home] || { name: m.home, code: m.home }
    const away = teamLookup[m.away] || { name: m.away, code: m.away }
    
    return {
      id: m.id,
      matchday: m.md,
      stage: 'group',
      group: m.group,
      homeTeam: { name: home.name, flag: home.code },
      awayTeam: { name: away.name, flag: away.code },
      date: formatDate(m.date),
      time: `${m.timeET} ET`,
      venue: m.venue,
      city: m.city,
      status: 'scheduled'
    }
  })
}

// Tournament helpers
const getTournamentName = (code) => ({
  'wc2026': 'FIFA World Cup 2026',
  'rg2026': 'Roland Garros 2026',
})[code] || 'FIFA World Cup 2026'

// Get current matchday based on date
const getCurrentMatchday = (tournament) => {
  const now = new Date()
  
  if (tournament === 'rg2026') {
    // Roland Garros 2026 schedule
    const rgDays = [
      { day: 1, date: new Date('2026-05-24') },
      { day: 2, date: new Date('2026-05-25') },
      { day: 3, date: new Date('2026-05-27') }, // R3 Day 1
      { day: 4, date: new Date('2026-05-28') }, // R3 Day 2
      { day: 5, date: new Date('2026-05-29') }, // R4 Day 1
      { day: 6, date: new Date('2026-05-30') }, // R4 Day 2
      { day: 7, date: new Date('2026-06-01') }, // QF
    ]
    // Find the current or most recent day
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    for (let i = rgDays.length - 1; i >= 0; i--) {
      if (today >= rgDays[i].date) return rgDays[i].day
    }
    return 1
  }
  
  if (tournament === 'wc2026') {
    // World Cup 2026 - starts June 11
    const wcStart = new Date('2026-06-11')
    if (now < wcStart) return 1
    const daysSinceStart = Math.floor((now - wcStart) / (1000 * 60 * 60 * 24))
    return Math.min(Math.max(1, daysSinceStart + 1), 3) // MD 1-3 for group stage
  }
  
  return 1
}

export default function MatchPicksPage() {
  const params = useParams()
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [matches, setMatches] = useState([])
  const [picks, setPicks] = useState({})
  const [results, setResults] = useState({}) // Match results from DB
  const [matchday, setMatchday] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState({})
  const [deadline, setDeadline] = useState(null)
  const [deadlineType, setDeadlineType] = useState('tournament_start')
  const [dateLockStatus, setDateLockStatus] = useState({})
  const [matchLockStatus, setMatchLockStatus] = useState({})

  // Load pool and user data
  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser()
      if (!currentUser) { router.push('/login'); return }
      setUser(currentUser)

      const { data: poolData } = await supabase
        .from('pools')
        .select('*')
        .eq('id', params.id)
        .single()

      if (poolData) {
        setPool(poolData)
        setDeadlineType(poolData.deadline_type || 'tournament_start')
        // Set to current matchday based on tournament schedule
        setMatchday(getCurrentMatchday(poolData.tournament))
        
        // Set deadline based on type
        if (poolData.deadline_type === '30m_before_match') {
          setDeadline(null)
        } else {
          // RG: Use first match of each day as deadline, WC: tournament start
          const deadlineDate = poolData.tournament === 'rg2026' 
            ? new Date('2026-05-27T04:00:00-04:00') // Day 3 start
            : new Date('2026-06-11T17:00:00-04:00')
          setDeadline(deadlineDate)
        }
      }

      const { data: memberData } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', params.id)
        .eq('user_id', currentUser.id)
        .single()
      
      if (memberData) setPoolMember(memberData)
      
      // Load existing picks
      const { data: existingPicks } = await supabase
        .from('picks')
        .select('*')
        .eq('pool_id', params.id)
        .eq('user_id', currentUser.id)
      
      if (existingPicks && existingPicks.length > 0) {
        const picksMap = {}
        existingPicks.forEach(p => {
          picksMap[p.match_id] = {
            homeScore: p.home_score,
            awayScore: p.away_score,
            winner: p.winner,
            saved: true,
            savedAt: 'Saved'
          }
        })
        setPicks(picksMap)
      }
      
      // Load match results (for showing completed matches)
      const { data: matchResults } = await supabase
        .from('match_results')
        .select('*')
      
      if (matchResults && matchResults.length > 0) {
        const resultsMap = {}
        matchResults.forEach(r => {
          resultsMap[r.match_id] = {
            resultHome: r.home_score,
            resultAway: r.away_score,
            winner: r.winner
          }
        })
        setResults(resultsMap)
      }
      
      setLoading(false)
    }
    loadData()
  }, [params.id, router])

  // Load matches for current matchday (merge with results)
  useEffect(() => {
    if (!pool) return
    const matchData = pool.tournament === 'rg2026' 
      ? getRGMatches(matchday)
      : getWCMatches(matchday)
    
    // Merge results into matches
    const matchesWithResults = matchData.map(m => {
      const result = results[m.id]
      if (result) {
        return { ...m, resultHome: result.resultHome, resultAway: result.resultAway }
      }
      return m
    })
    
    setMatches(matchesWithResults)

    // Calculate lock status
    const now = new Date()
    const newDateLockStatus = {}
    const newMatchLockStatus = {}
    
    matchData.forEach(match => {
      const matchTime = getMatchDateTime(match)
      if (deadlineType === '30m_before_match') {
        const lockTime = new Date(matchTime.getTime() - 30 * 60 * 1000)
        newMatchLockStatus[match.id] = now >= lockTime
      } else {
        const dayLockTime = getDayLockTime(match.date, pool.tournament)
        newDateLockStatus[match.date] = now >= dayLockTime
      }
    })
    
    setDateLockStatus(newDateLockStatus)
    setMatchLockStatus(newMatchLockStatus)
  }, [pool, matchday, deadlineType, results])

  // Helper functions
  const getMatchDateTime = (match) => {
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7 }
    const [mon, day] = match.date.split(' ')
    const timeParts = match.time.replace(' ET', '').match(/(\d+):(\d+)\s*(AM|PM)?/i)
    let hours = parseInt(timeParts[1])
    const minutes = parseInt(timeParts[2])
    if (timeParts[3]?.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (timeParts[3]?.toUpperCase() === 'AM' && hours === 12) hours = 0
    return new Date(2026, months[mon], parseInt(day), hours, minutes)
  }

  const getDayLockTime = (dateStr, tournament) => {
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7 }
    const [mon, day] = dateStr.split(' ')
    return new Date(2026, months[mon], parseInt(day), tournament === 'rg2026' ? 4 : 5, 0)
  }

  const handleScoreChange = (matchId, side, value) => {
    const score = value === '' ? null : Math.max(0, Math.min(20, parseInt(value) || 0))
    setPicks(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side === 'home' ? 'homeScore' : 'awayScore']: score, saved: false }
    }))
  }

  const handlePickWinner = (matchId, winner) => {
    setPicks(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], winner, saved: false }
    }))
  }

  const handleSetScore = (matchId, setScore) => {
    // setScore is like "3-0", "3-1", "3-2" (winner always gets 3)
    // Assign based on who the user picked as winner
    if (!setScore || !setScore.includes('-')) return
    const [winnerSets, loserSets] = setScore.split('-').map(Number)
    if (isNaN(winnerSets) || isNaN(loserSets)) return
    const currentPick = picks[matchId]
    const winner = currentPick?.winner
    
    // If winner is home team (or no winner yet, default to home)
    // homeScore = 3, awayScore = loser's sets
    // If winner is away team
    // homeScore = loser's sets, awayScore = 3
    let homeScore, awayScore
    if (winner === 'away') {
      homeScore = loserSets
      awayScore = winnerSets // 3
    } else {
      homeScore = winnerSets // 3
      awayScore = loserSets
    }
    
    setPicks(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], homeScore, awayScore, saved: false }
    }))
  }

  // Valid Grand Slam set scores (best of 5) - winner always shows as 3
  const validRGScores = ['3-0', '3-1', '3-2']

  const handleSave = async (matchId) => {
    const pick = picks[matchId]
    if (pick?.homeScore === null || pick?.awayScore === null) return
    if (!user || !pool) return
    
    setSaving(prev => ({ ...prev, [matchId]: true }))
    
    try {
      // Find match info for display
      const match = matches.find(m => m.id === matchId)
      const matchInfo = match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : matchId
      
      // Save to Supabase
      const { error } = await supabase
        .from('picks')
        .upsert({
          user_id: user.id,
          pool_id: pool.id,
          match_id: matchId,
          home_score: pick.homeScore,
          away_score: pick.awayScore,
          winner: pick.winner || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,pool_id,match_id'
        })
      
      if (error) throw error
      
      // Sync to Google Sheets for backup
      try {
        await fetch('/api/sync-sheets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'match_pick',
            data: {
              poolId: pool.id,
              poolName: pool.name,
              poolMemberId: poolMember?.id,
              userId: user.id,
              userName: user.user_metadata?.first_name || user.email,
              userEmail: user.email,
              teamName: poolMember?.team_name,
              matchId: matchId,
              matchInfo: matchInfo,
              homeScore: pick.homeScore,
              awayScore: pick.awayScore,
              submittedAt: new Date().toISOString()
            }
          })
        })
      } catch (sheetErr) {
        console.warn('Sheets sync failed (non-critical):', sheetErr)
      }
      
      setPicks(prev => ({
        ...prev,
        [matchId]: { ...prev[matchId], saved: true, savedAt: new Date().toLocaleTimeString() }
      }))
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save pick: ' + err.message)
    } finally {
      setSaving(prev => ({ ...prev, [matchId]: false }))
    }
  }

  const handleClear = (matchId) => {
    setPicks(prev => ({ ...prev, [matchId]: { homeScore: null, awayScore: null, saved: false } }))
  }

  // Save all unsaved picks at once
  const [savingAll, setSavingAll] = useState(false)
  const handleSaveAll = async () => {
    const unsavedPicks = matches.filter(m => {
      const pick = picks[m.id]
      return pick && pick.homeScore != null && pick.awayScore != null && !pick.saved
    })
    
    if (unsavedPicks.length === 0) return
    
    setSavingAll(true)
    
    for (const match of unsavedPicks) {
      await handleSave(match.id)
    }
    
    setSavingAll(false)
  }
  
  // Count unsaved picks
  const unsavedCount = matches.filter(m => {
    const pick = picks[m.id]
    return pick && pick.homeScore != null && pick.awayScore != null && !pick.saved
  }).length

  const getMatchStatus = (match) => {
    const pick = picks[match.id]
    if (match.status === 'completed') return 'ft'
    if (match.status === 'live') return 'live'
    if (pick?.saved) return 'saved'
    return 'open'
  }

  // Calculate points for a completed match
  // Scoring: Exact score = 3 pts, Correct winner = 1 pt, Max = 4 pts
  const calculateResult = (match, pick) => {
    if (!match.resultHome && match.resultHome !== 0) return null
    if (!pick || pick.winner == null) return { points: 0, winnerCorrect: false, scoreCorrect: false, description: 'No pick' }
    
    const resultWinner = match.resultHome > match.resultAway ? 'home' : (match.resultAway > match.resultHome ? 'away' : 'tie')
    const winnerCorrect = pick.winner === resultWinner
    const homeScoreCorrect = pick.homeScore === match.resultHome
    const awayScoreCorrect = pick.awayScore === match.resultAway
    const scoreCorrect = homeScoreCorrect && awayScoreCorrect && winnerCorrect // Exact score only counts if winner is also correct
    
    let points = 0
    let description = 'Wrong'
    
    if (scoreCorrect) {
      // Exact score (includes correct winner) = 3 + 1 = 4 pts
      points = 4
      description = 'Exact score + winner'
    } else if (winnerCorrect) {
      // Just correct winner = 1 pt
      points = 1
      description = 'Correct winner'
    }
    // Wrong winner = 0 pts
    
    return { points, winnerCorrect, scoreCorrect, homeScoreCorrect, awayScoreCorrect, description }
  }

  const formatCountdown = () => {
    if (!deadline) return '--:--:--'
    const diff = deadline - new Date()
    if (diff <= 0) return 'LOCKED'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  const submittedCount = matches.filter(m => picks[m.id]?.saved).length
  const totalMatches = matches.length
  const isRG = pool?.tournament === 'rg2026'
  const mdLabels = isRG ? ['Day 1','Day 2','R3 Day 1','R3 Day 2','R16 Day 1','R16 Day 2','QF','SF','Final'] : ['MD 1','MD 2','MD 3','R32','R16','QF','SF','F']

  if (loading) return <div className="loading">Loading...</div>

  // Group matches by date
  const matchesByDate = matches.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = []
    acc[m.date].push(m)
    return acc
  }, {})

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--bg4:#1e2330;
          --gold:#c9a84c;--gold2:#e6c76a;--red:#e03b3b;--green:#2cb67d;
          --f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;
          --line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3);
        }
        .loading { display:flex;align-items:center;justify-content:center;min-height:100vh;color:var(--f3); }

        /* NAV */
        .nav { background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:56px;position:sticky;top:0;z-index:200; }
        .nav-logo { font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900;color:#fff;text-decoration:none;letter-spacing:0.04em; }
        .nav-logo span { color:var(--gold); }
        .nav-right { margin-left:auto;display:flex;gap:1rem;align-items:center; }
        .nav-link { font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none; }
        .nav-link:hover { color:var(--f1); }

        /* WRAP */
        .a-wrap { background:#07090e;border-top:4px solid var(--gold);min-height:calc(100vh - 56px); }

        /* HEADER */
        .a-header { background:#0f1420;padding:1.25rem 1.5rem 1rem;border-bottom:1px solid rgba(201,168,76,0.15);display:flex;align-items:flex-start;gap:2rem;max-width:1200px;margin:0 auto; }
        .a-pool-tag { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--gold);margin-bottom:0.3rem;display:flex;align-items:center;gap:6px; }
        .a-pool-tag::before { content:'';width:18px;height:2px;background:var(--gold); }
        .a-pool-name { font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:#fff;line-height:1;margin-bottom:0.3rem; }
        .a-pool-sub { font-size:0.75rem;color:var(--f3);display:flex;align-items:center;gap:0.5rem; }
        .a-stats { display:flex;gap:0;border:1px solid rgba(201,168,76,0.2);border-radius:4px;overflow:hidden;align-self:flex-start;flex-shrink:0; }
        .a-stat { padding:0.75rem 1.25rem;border-right:1px solid rgba(201,168,76,0.15);text-align:center;background:rgba(201,168,76,0.04); }
        .a-stat:last-child { border-right:none; }
        .a-stat-n { font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:var(--gold);line-height:1; }
        .a-stat-n.w { color:#fff; }
        .a-stat-l { font-family:'Barlow Condensed',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f4);margin-top:3px; }

        /* BODY GRID */
        .a-body { display:grid;grid-template-columns:1fr 280px;gap:0;max-width:1200px;margin:0 auto; }
        .a-main { padding:1.25rem 1.5rem;border-right:1px solid var(--line); }
        .a-side { padding:1.25rem;background:#07090d; }

        /* MD STRIP */
        .md-strip { display:flex;gap:0;border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:1rem; }
        .md-btn { flex:1;padding:0.5rem 0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:var(--bg2);color:var(--f3);border:none;cursor:pointer;border-right:1px solid var(--line);transition:all 0.15s; }
        .md-btn:last-child { border-right:none; }
        .md-btn.active { background:var(--gold);color:#000; }
        .md-btn:hover:not(.active) { background:var(--bg3); }

        /* BANNER */
        .a-banner { background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:4px;padding:0.7rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem; }
        .a-banner-left { font-family:'Barlow Condensed',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold); }
        .a-banner-sub { font-size:0.68rem;color:var(--f3);margin-top:2px; }
        .a-banner-right { font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);white-space:nowrap; }

        /* DATE GROUP */
        .date-group { margin-bottom:1.25rem; }
        .date-header { display:flex;align-items:center;gap:1rem;padding:0.6rem 1rem;background:linear-gradient(90deg,rgba(201,168,76,0.12) 0%,transparent 100%);border-left:3px solid var(--gold);border-radius:0 4px 4px 0;margin-bottom:0.4rem; }
        .date-header.locked { background:linear-gradient(90deg,rgba(100,100,100,0.1) 0%,transparent 100%);border-left-color:var(--f4); }
        .dh-date { font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--gold); }
        .date-header.locked .dh-date { color:var(--f3); }
        .dh-count { font-size:0.7rem;color:var(--f3); }
        .dh-lock { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f4);margin-left:auto; }

        /* MATCH CARD */
        .mpc { background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:6px; }
        .mpc.submitted { border-color:rgba(44,182,125,0.25); }
        .mpc.locked-card { opacity:0.6; }
        .mpc-head { background:var(--bg3);padding:0.4rem 1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line); }
        .mpc-info { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--f4); }
        .mpc-status { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;display:flex;align-items:center;gap:4px; }
        .s-open { color:var(--green); }
        .s-saved { color:var(--green); }
        .s-live { color:var(--red); }
        .s-locked { color:var(--f4); }

        .mpc-body { display:grid;grid-template-columns:1fr 120px 1fr;align-items:center;padding:0.8rem 0.5rem;gap:0.5rem; }
        
        /* Team Box - Clickable */
        .team-box { display:flex;flex-direction:column;align-items:center;gap:0.3rem;padding:0.75rem 0.5rem;border:2px solid var(--line);border-radius:6px;cursor:pointer;transition:all 0.15s;position:relative;background:var(--bg3); }
        .team-box:hover:not(.locked) { border-color:var(--gold);background:rgba(201,168,76,0.05); }
        .team-box.selected { border-color:var(--gold);background:rgba(201,168,76,0.1);box-shadow:0 0 12px rgba(201,168,76,0.2); }
        .team-box.locked { cursor:default;opacity:0.7; }
        .winner-check { position:absolute;top:4px;right:6px;font-size:0.9rem;color:var(--gold);font-weight:900; }
        
        .team-flag img { width:44px;height:30px;border-radius:3px;object-fit:cover;border:1px solid rgba(255,255,255,0.1); }
        .team-nm { font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:var(--f1);text-align:center;line-height:1.2; }
        .player-rank { font-size:0.65rem;font-weight:700;color:var(--f3);margin-left:3px; }
        .player-rank.gold { color:var(--gold); }
        
        /* Score Select for RG */
        .score-select { width:100%;padding:0.6rem;background:var(--bg3);border:1px solid var(--f4);border-radius:4px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:700;text-align:center;cursor:pointer;appearance:none;-webkit-appearance:none; }
        .score-select:focus { outline:none;border-color:var(--gold); }

        .score-center { display:flex;flex-direction:column;align-items:center;gap:3px; }
        .score-status { font-family:'Barlow Condensed',sans-serif;font-size:0.55rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--green); }
        .score-inputs { display:flex;align-items:center;gap:6px; }
        .si { width:48px;height:48px;background:var(--bg3);border:1px solid var(--f4);border-radius:3px;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;text-align:center;outline:none;-moz-appearance:textfield; }
        .si::-webkit-outer-spin-button,.si::-webkit-inner-spin-button { -webkit-appearance:none; }
        .si:focus { border-color:var(--gold); }
        .si.filled { border-color:rgba(44,182,125,0.4);background:rgba(44,182,125,0.04); }
        .sc-dash { font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:900;color:var(--f4); }
        .score-display { display:flex;align-items:center;gap:6px; }
        .sd-val { font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900;color:var(--gold);min-width:28px;text-align:center; }
        .sd-val.muted { color:var(--f2); }
        .pick-label { font-size:0.6rem;color:var(--f4);font-family:'Barlow Condensed',sans-serif;letter-spacing:0.06em;text-transform:uppercase;margin-top:2px; }

        /* RESULTS DISPLAY */
        .result-center { display:flex;flex-direction:column;align-items:center;gap:5px; }
        .result-label { font-size:0.6rem;color:var(--f4);font-family:'Barlow Condensed',sans-serif;letter-spacing:0.1em;text-transform:uppercase; }
        .result-score { display:flex;align-items:center;gap:6px; }
        .rs-val { font-family:'Barlow Condensed',sans-serif;font-size:2.2rem;font-weight:900;color:var(--f1);min-width:26px;text-align:center;line-height:1; }
        .rs-dash { font-family:'Barlow Condensed',sans-serif;font-size:1.3rem;font-weight:700;color:var(--f4); }
        .pick-block { display:flex;flex-direction:column;align-items:center;gap:3px;margin-top:6px; }
        .pick-row { display:flex;align-items:center;gap:5px; }
        .ck { width:17px;height:17px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 8px rgba(201,168,76,0.35); }
        .xx { width:17px;height:17px;border-radius:50%;background:rgba(224,59,59,0.12);border:1.5px solid rgba(224,59,59,0.35);display:flex;align-items:center;justify-content:center;flex-shrink:0; }
        .pick-score-box { display:flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--line);border-radius:3px;padding:0.28rem 0.65rem; }
        .pick-score-box.correct { border-color:rgba(201,168,76,0.25); }
        .psv { font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:800;min-width:14px;text-align:center;color:var(--f3); }
        .psv.correct { color:var(--gold); }
        .pss { font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;color:var(--f4); }
        .pill-row { display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:center;margin-top:3px; }
        .pill { display:inline-flex;align-items:center;gap:3px;font-size:0.65rem;font-weight:700;padding:0.14rem 0.5rem;border-radius:4px;white-space:nowrap; }
        .pill-ok { background:rgba(201,168,76,0.1);color:var(--gold2);border:1px solid rgba(201,168,76,0.22); }
        .pill-bad { background:rgba(224,59,59,0.08);color:rgba(220,80,80,0.8);border:1px solid rgba(224,59,59,0.18); }
        .result-footer { border-top:1px solid var(--line);padding:0.45rem 1rem;display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.18); }
        .rf-desc { font-size:0.78rem;font-weight:600; }
        .pts-badge { display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;padding:0.2rem 0.65rem;border-radius:4px; }
        .pts-gold { background:rgba(201,168,76,0.12);color:var(--gold2);border:1px solid rgba(201,168,76,0.28); }
        .pts-zero { background:rgba(224,59,59,0.1);color:rgba(220,80,80,0.85);border:1px solid rgba(224,59,59,0.2); }

        .mpc-foot { border-top:1px solid var(--line);padding:0.45rem 1rem;display:flex;align-items:center;justify-content:flex-end;gap:0.6rem;background:rgba(0,0,0,0.15); }
        .btn-save { font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.4rem 1rem;border-radius:2px;border:none;cursor:pointer; }
        .btn-save:hover { background:var(--gold2); }
        .btn-save:disabled { opacity:0.5;cursor:not-allowed; }
        .btn-edit { font-family:'Barlow Condensed',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:transparent;color:var(--f3);border:1px solid var(--f4);padding:0.35rem 0.7rem;border-radius:2px;cursor:pointer; }
        .btn-edit:hover { color:var(--f1);border-color:var(--f2); }

        /* SAVE ALL BAR */
        .save-all-bar { display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05));border:1px solid var(--gold);border-radius:4px;padding:0.75rem 1rem;margin-bottom:1rem; }
        .save-all-info { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:600;color:var(--gold); }
        .btn-save-all { font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.5rem 1.5rem;border-radius:3px;border:none;cursor:pointer;transition:all 0.2s; }
        .btn-save-all:hover { background:var(--gold2);transform:scale(1.02); }
        .btn-save-all:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

        /* SIDEBAR WIDGETS */
        .sw { margin-bottom:1rem; }
        .sw-head { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--f4);border-bottom:1px solid var(--line);padding-bottom:0.4rem;margin-bottom:0.55rem; }
        .sw-row { display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.04); }
        .sw-row:last-child { border-bottom:none; }
        .sw-label { font-size:0.72rem;color:var(--f3); }
        .sw-val { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700; }
        .vg { color:var(--gold); }
        .vgr { color:var(--green); }
        .vw { color:#fff; }

        /* SCORING GROUPS */
        .score-group { margin-bottom:0.6rem;padding-bottom:0.6rem;border-bottom:1px solid var(--line); }
        .score-group:last-child { margin-bottom:0;padding-bottom:0;border-bottom:none; }
        .score-group-label { font-family:'Barlow Condensed',sans-serif;font-size:0.56rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--f4);margin-bottom:0.3rem; }
        .score-row { display:flex;align-items:center;justify-content:space-between;padding:0.26rem 0;border-bottom:1px solid rgba(255,255,255,0.04); }
        .score-row:last-child { border-bottom:none; }
        .score-label { font-size:0.7rem;color:var(--f3); }
        .score-pts { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;color:var(--gold); }
        .score-pts.dim { color:var(--f2); }

        /* BACK LINK */
        .back-link { display:inline-flex;align-items:center;gap:6px;font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);text-decoration:none;margin-bottom:1rem; }
        .back-link:hover { color:var(--gold2); }

        @media (max-width:900px) {
          .a-body { grid-template-columns:1fr; }
          .a-side { border-top:1px solid var(--line); }
          .a-header { flex-direction:column;gap:1rem; }
          .a-stats { align-self:stretch; }
          .a-stat { flex:1; }
          .mpc-body { grid-template-columns:1fr 120px 1fr; }
          .si { width:40px;height:40px;font-size:1.3rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href={`/pool/${params.id}`} className="nav-link">Pool Home</Link>
        </div>
      </nav>

      <div className="a-wrap">
        {/* HEADER */}
        <div className="a-header">
          <div style={{flex:1}}>
            <div className="a-pool-tag">{getTournamentName(pool?.tournament)}</div>
            <div className="a-pool-name">{pool?.name}</div>
            <div className="a-pool-sub">
              <span>Match Picks</span>
              <span style={{color:'var(--f4)'}}>·</span>
              <span>{isRG ? `Day ${matchday}` : `Matchday ${matchday}`}</span>
            </div>
          </div>
          <div className="a-stats">
            <div className="a-stat"><div className="a-stat-n w">{poolMember?.rank || '-'}</div><div className="a-stat-l">Rank</div></div>
            <div className="a-stat"><div className="a-stat-n">{poolMember?.total_points || 0}</div><div className="a-stat-l">Points</div></div>
            <div className="a-stat"><div className="a-stat-n">{submittedCount}/{totalMatches}</div><div className="a-stat-l">Picks</div></div>
          </div>
        </div>

        <div className="a-body">
          {/* MAIN */}
          <div className="a-main">
            <Link href={`/pool/${params.id}`} className="back-link" style={{display:'inline-flex',alignItems:'center',gap:'6px',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.85rem',fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--gold)',textDecoration:'none',marginBottom:'1rem'}}>← BACK TO POOL</Link>

            {/* Matchday strip */}
            <div className="md-strip">
              {(isRG ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6,7,8]).map(md => (
                <button key={md} className={`md-btn ${md === matchday ? 'active' : ''}`} onClick={() => setMatchday(md)}>
                  {mdLabels[md-1]}
                </button>
              ))}
            </div>

            {/* Deadline banner */}
            <div className="a-banner">
              <div>
                <div className="a-banner-left">{isRG ? `Day ${matchday}` : `Matchday ${matchday}`} · Locks {deadline?.toLocaleDateString('en-US', {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) || 'per match'} ET</div>
                <div className="a-banner-sub">Submit picks before {isRG ? 'matches start' : 'kickoff'}</div>
              </div>
              <div className="a-banner-right">{formatCountdown()}</div>
            </div>

            {/* Save All Button - RG only (WC has per-day buttons) */}
            {unsavedCount > 0 && isRG && (
              <div className="save-all-bar">
                <div className="save-all-info">{unsavedCount} unsaved pick{unsavedCount > 1 ? 's' : ''}</div>
                <button className="btn-save-all" onClick={handleSaveAll} disabled={savingAll}>
                  {savingAll ? 'Saving All...' : `Save All Picks (${unsavedCount})`}
                </button>
              </div>
            )}

            {/* Match cards by date */}
            {Object.entries(matchesByDate).map(([date, dayMatches]) => {
              const isDateLocked = dateLockStatus[date] || false
              return (
                <div key={date} className="date-group">
                  <div className={`date-header ${isDateLocked ? 'locked' : ''}`}>
                    <div className="dh-date">{date}, 2026</div>
                    <div className="dh-count">{dayMatches.length} match{dayMatches.length > 1 ? 'es' : ''}</div>
                    {isDateLocked && <div className="dh-lock">🔒 Locked</div>}
                  </div>
                  
                  {dayMatches.map(match => {
                    const status = getMatchStatus(match)
                    const pick = picks[match.id] || {}
                    const isLocked = deadlineType === '30m_before_match' ? matchLockStatus[match.id] : isDateLocked
                    
                    return (
                      <div key={match.id} className={`mpc ${status === 'saved' ? 'submitted' : ''} ${isLocked ? 'locked-card' : ''}`}>
                        <div className="mpc-head">
                          <div className="mpc-info">{match.group ? `Group ${match.group} · ` : ''}{match.time}</div>
                          <div className={`mpc-status s-${isLocked ? 'locked' : status}`}>
                            {isLocked ? '🔒 Locked' : status === 'saved' ? '✓ Saved' : 'Open'}
                          </div>
                        </div>
                        <div className="mpc-body">
                          {/* HOME TEAM - Clickable */}
                          <div 
                            className={`team-box ${pick.winner === 'home' ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => !isLocked && handlePickWinner(match.id, 'home')}
                          >
                            <div className="team-flag"><img src={`https://flagcdn.com/w80/${match.homeTeam.flag}.png`} alt="" /></div>
                            <div className="team-nm">
                              {match.homeTeam.name}
                              {match.homeTeam.rank && <span className={`player-rank ${match.homeTeam.rank === 1 ? 'gold' : ''}`}>({match.homeTeam.rank})</span>}
                            </div>
                            {pick.winner === 'home' && <div className="winner-check">✓</div>}
                          </div>
                          
                          {/* SCORE CENTER */}
                          <div className={match.resultHome != null ? "result-center" : "score-center"}>
                            {match.resultHome != null ? (
                              // COMPLETED MATCH - Show result
                              (() => {
                                const result = calculateResult(match, pick)
                                return (
                                  <>
                                    <div className="result-label">Result</div>
                                    <div className="result-score">
                                      <span className="rs-val">{match.resultHome}</span>
                                      <span className="rs-dash">–</span>
                                      <span className="rs-val">{match.resultAway}</span>
                                    </div>
                                    {pick?.homeScore != null ? (
                                      <div className="pick-block">
                                        <div className="pick-label">Your pick</div>
                                        <div className="pick-row">
                                          {result?.homeScoreCorrect ? (
                                            <div className="ck"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#000" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                          ) : (
                                            <div className="xx"><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="#e03b3b" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
                                          )}
                                          <div className={`pick-score-box ${result?.scoreCorrect ? 'correct' : ''}`}>
                                            <span className={`psv ${result?.homeScoreCorrect ? 'correct' : ''}`}>{pick.homeScore}</span>
                                            <span className="pss">–</span>
                                            <span className={`psv ${result?.awayScoreCorrect ? 'correct' : ''}`}>{pick.awayScore}</span>
                                          </div>
                                          {result?.awayScoreCorrect ? (
                                            <div className="ck"><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="#000" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                          ) : (
                                            <div className="xx"><svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 2L8 8M8 2L2 8" stroke="#e03b3b" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
                                          )}
                                        </div>
                                        <div className="pill-row">
                                          {result?.scoreCorrect ? (
                                            <span className="pill pill-ok">✓ Exact score (+3)</span>
                                          ) : (
                                            <span className="pill pill-bad">✗ Score</span>
                                          )}
                                          {result?.winnerCorrect ? (
                                            <span className="pill pill-ok">✓ Winner (+1)</span>
                                          ) : (
                                            <span className="pill pill-bad">✗ Winner</span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="pick-block">
                                        <div className="pick-label" style={{color:'var(--red)'}}>No pick</div>
                                      </div>
                                    )}
                                  </>
                                )
                              })()
                            ) : !isLocked ? (
                              isRG ? (
                                <>
                                  <div className="score-status">Set Score</div>
                                  <select 
                                    className="score-select"
                                    value={pick.homeScore != null ? (pick.winner === 'away' ? `${pick.awayScore}-${pick.homeScore}` : `${pick.homeScore}-${pick.awayScore}`) : ''}
                                    onChange={e => handleSetScore(match.id, e.target.value)}
                                    disabled={!pick.winner}
                                    title={!pick.winner ? 'Pick a winner first' : ''}
                                  >
                                    <option value="">{pick.winner ? 'Select' : 'Pick winner first'}</option>
                                    {validRGScores.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </>
                              ) : (
                                <>
                                  <div className="score-status">Score</div>
                                  <div className="score-inputs">
                                    <input className={`si ${pick.homeScore != null ? 'filled' : ''}`} type="number" min="0" max="20" placeholder="0" value={pick.homeScore ?? ''} onChange={e => handleScoreChange(match.id, 'home', e.target.value)} />
                                    <span className="sc-dash">-</span>
                                    <input className={`si ${pick.awayScore != null ? 'filled' : ''}`} type="number" min="0" max="20" placeholder="0" value={pick.awayScore ?? ''} onChange={e => handleScoreChange(match.id, 'away', e.target.value)} />
                                  </div>
                                </>
                              )
                            ) : pick.homeScore != null ? (
                              <>
                                <div className="score-display">
                                  <span className="sd-val muted">{pick.homeScore}</span>
                                  <span className="sc-dash">–</span>
                                  <span className="sd-val muted">{pick.awayScore}</span>
                                </div>
                                <div className="pick-label">Your pick</div>
                              </>
                            ) : (
                              <div className="pick-label" style={{color:'var(--red)'}}>No pick</div>
                            )}
                          </div>
                          
                          {/* AWAY TEAM - Clickable */}
                          <div 
                            className={`team-box ${pick.winner === 'away' ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => !isLocked && handlePickWinner(match.id, 'away')}
                          >
                            <div className="team-flag"><img src={`https://flagcdn.com/w80/${match.awayTeam.flag}.png`} alt="" /></div>
                            <div className="team-nm">
                              {match.awayTeam.name}
                              {match.awayTeam.rank && <span className={`player-rank ${match.awayTeam.rank === 1 ? 'gold' : ''}`}>({match.awayTeam.rank})</span>}
                            </div>
                            {pick.winner === 'away' && <div className="winner-check">✓</div>}
                          </div>
                        </div>
                        {status === 'open' && !isLocked && isRG && (
                          <div className="mpc-foot">
                            <button className="btn-edit" onClick={() => handleClear(match.id)}>Clear</button>
                            <button className="btn-save" onClick={() => handleSave(match.id)} disabled={saving[match.id]}>{saving[match.id] ? 'Saving...' : 'Save Pick'}</button>
                          </div>
                        )}
                        {status === 'saved' && !isLocked && isRG && (
                          <div className="mpc-foot">
                            <div style={{fontSize:'0.65rem',color:'var(--f3)'}}>Saved {pick.savedAt}</div>
                            <button className="btn-edit" onClick={() => setPicks(prev => ({...prev, [match.id]: {...prev[match.id], saved: false}}))}>Edit</button>
                          </div>
                        )}
                        {match.resultHome != null && (() => {
                          const result = calculateResult(match, pick)
                          return (
                            <div className="result-footer">
                              <div className="rf-desc" style={{color: result?.points > 0 ? 'var(--gold2)' : 'rgba(220,80,80,0.85)'}}>{result?.description}</div>
                              <span className={`pts-badge ${result?.points > 0 ? 'pts-gold' : 'pts-zero'}`}>
                                {result?.points > 0 ? `+${result.points} pts` : '0 pts'}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                  
                  {/* World Cup: Save button per day */}
                  {!isRG && !isDateLocked && (() => {
                    const dayUnsaved = dayMatches.filter(m => {
                      const p = picks[m.id]
                      return p && p.homeScore != null && p.awayScore != null && !p.saved
                    })
                    if (dayUnsaved.length === 0) return null
                    return (
                      <div className="save-all-bar" style={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>
                        <div className="save-all-info">{dayUnsaved.length} unsaved pick{dayUnsaved.length > 1 ? 's' : ''} for {date}</div>
                        <button className="btn-save-all" onClick={async () => {
                          setSavingAll(true)
                          for (const m of dayUnsaved) await handleSave(m.id)
                          setSavingAll(false)
                        }} disabled={savingAll}>
                          {savingAll ? 'Saving...' : `Save ${date} Picks`}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )
            })}

            {/* Save All Button - Bottom (RG only) */}
            {unsavedCount > 0 && isRG && (
              <div className="save-all-bar" style={{marginTop: '1rem'}}>
                <div className="save-all-info">{unsavedCount} unsaved pick{unsavedCount > 1 ? 's' : ''}</div>
                <button className="btn-save-all" onClick={handleSaveAll} disabled={savingAll}>
                  {savingAll ? 'Saving All...' : `Save All Picks (${unsavedCount})`}
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="a-side">
            <div className="sw">
              <div className="sw-head">Progress</div>
              <div className="sw-row"><div className="sw-label">Picks submitted</div><div className={`sw-val ${submittedCount === totalMatches ? 'vgr' : 'vw'}`}>{submittedCount} / {totalMatches}</div></div>
              <div className="sw-row"><div className="sw-label">Total points</div><div className="sw-val vg">{poolMember?.total_points || 0}</div></div>
              <div className="sw-row"><div className="sw-label">Your rank</div><div className="sw-val vg">{poolMember?.rank || '-'}</div></div>
            </div>

            <div className="sw">
              <div className="sw-head">Scoring</div>
              {isRG ? (
                <>
                  <div className="score-group">
                    <div className="score-group-label">Match Picks</div>
                    <div className="score-row"><div className="score-label">Exact score</div><div className="score-pts">3 pts</div></div>
                    <div className="score-row"><div className="score-label">Correct winner</div><div className="score-pts">1 pt</div></div>
                    <div className="score-row"><div className="score-label">Max per match</div><div className="score-pts">4 pts</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Round Bonus</div>
                    <div className="score-row"><div className="score-label">R1 – R4</div><div className="score-pts dim">×1</div></div>
                    <div className="score-row"><div className="score-label">Quarterfinals</div><div className="score-pts dim">×1.5</div></div>
                    <div className="score-row"><div className="score-label">Semifinals</div><div className="score-pts dim">×2</div></div>
                    <div className="score-row"><div className="score-label">Final</div><div className="score-pts dim">×3</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Special Picks</div>
                    <div className="score-row"><div className="score-label">Champion</div><div className="score-pts">10 pts</div></div>
                    <div className="score-row"><div className="score-label">Runner-up</div><div className="score-pts">7 pts</div></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="score-group">
                    <div className="score-group-label">Match Picks</div>
                    <div className="score-row"><div className="score-label">Exact scoreline</div><div className="score-pts">3 pts</div></div>
                    <div className="score-row"><div className="score-label">Winner + 1 score</div><div className="score-pts">2 pts</div></div>
                    <div className="score-row"><div className="score-label">Correct winner/tie</div><div className="score-pts">1 pt</div></div>
                    <div className="score-row"><div className="score-label">Correct qualifier</div><div className="score-pts">2 pts</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Knockout Bonus</div>
                    <div className="score-row"><div className="score-label">Round of 32</div><div className="score-pts dim">2 pts</div></div>
                    <div className="score-row"><div className="score-label">Round of 16</div><div className="score-pts dim">3 pts</div></div>
                    <div className="score-row"><div className="score-label">Quarterfinals</div><div className="score-pts dim">4 pts</div></div>
                    <div className="score-row"><div className="score-label">Semifinals</div><div className="score-pts dim">5 pts</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Special Picks</div>
                    <div className="score-row"><div className="score-label">Champion</div><div className="score-pts">10 pts</div></div>
                    <div className="score-row"><div className="score-label">Runner-up</div><div className="score-pts">7 pts</div></div>
                    <div className="score-row"><div className="score-label">Top scorer</div><div className="score-pts">5 pts</div></div>
                    <div className="score-row"><div className="score-label">Best goalkeeper</div><div className="score-pts">5 pts</div></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
