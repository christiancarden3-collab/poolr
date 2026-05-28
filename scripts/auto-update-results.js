#!/usr/bin/env node
/**
 * Auto-Update Results from SofaScore API
 * - Fetches live/completed matches
 * - Updates match_results table
 * - Recalculates leaderboard points
 * 
 * Usage:
 *   node scripts/auto-update-results.js --sport=tennis
 *   node scripts/auto-update-results.js --sport=football
 */

const { createClient } = require('@supabase/supabase-js')

// Config
const RAPIDAPI_KEY = '158e30dfc0msha6ebce69d05cb48p1880ebjsnd3e00dc63725'
const RAPIDAPI_HOST = 'sportapi7.p.rapidapi.com'
const API_BASE = 'https://sportapi7.p.rapidapi.com/api/v1'

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE0MTYyNiwiZXhwIjoyMDk0NzE3NjI2fQ.phNsgmfw7mmJltNBspCK4C9djgvMlex7rFI9or2QuxM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const headers = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
}

// Parse args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=')
  acc[key] = value || true
  return acc
}, {})

const SPORT = args.sport || 'tennis'
const VERBOSE = args.verbose || false

function log(...msg) {
  console.log(`[${new Date().toISOString()}]`, ...msg)
}

/**
 * Fetch scheduled events for today
 */
async function fetchTodayEvents(sport) {
  const today = new Date().toISOString().split('T')[0]
  const url = `${API_BASE}/sport/${sport}/scheduled-events/${today}`
  
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  
  return response.json()
}

/**
 * Filter events by tournament
 */
function filterByTournament(events, tournamentName) {
  return (events || []).filter(e => {
    const tName = (e.tournament?.name || '').toLowerCase()
    const utName = (e.tournament?.uniqueTournament?.name || '').toLowerCase()
    return tName.includes(tournamentName) || utName.includes(tournamentName)
  })
}

/**
 * Normalize player name for matching
 */
function normalizeName(name) {
  if (!name) return ''
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z\s]/g, '')
    .trim()
}

/**
 * Match API event to our schedule by player names
 */
async function findMatchId(event, tournament) {
  const homeName = normalizeName(event.homeTeam?.name || '')
  const awayName = normalizeName(event.awayTeam?.name || '')
  
  // Get our schedule from the lib file
  // For now, we'll try to match based on the picks table
  const { data: picks } = await supabase
    .from('picks')
    .select('match_id')
    .limit(1000)
  
  // Extract unique match IDs
  const matchIds = [...new Set(picks?.map(p => p.match_id) || [])]
  
  // For RG, match IDs are like "rg1-1", "rg2-5", etc.
  // We need to load the schedule to match names
  // This is a simplified version - ideally we'd have a proper mapping
  
  return null // Return null for now, we'll use manual mapping
}

/**
 * Update match results in database
 */
async function updateMatchResult(matchId, homeScore, awayScore) {
  const winner = homeScore > awayScore ? 'home' : 'away'
  
  const { error } = await supabase
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      winner,
      updated_at: new Date().toISOString()
    }, { onConflict: 'match_id' })
  
  return !error
}

/**
 * Recalculate all leaderboard points
 */
async function recalculateLeaderboard(tournament) {
  log('📊 Recalculating leaderboard...')
  
  const { data: pools } = await supabase
    .from('pools')
    .select('id')
    .eq('tournament', tournament)
  
  for (const pool of (pools || [])) {
    const { data: members } = await supabase
      .from('pool_members')
      .select('id, user_id, total_points')
      .eq('pool_id', pool.id)
    
    const { data: picks } = await supabase
      .from('picks')
      .select('*')
      .eq('pool_id', pool.id)
    
    const { data: results } = await supabase
      .from('match_results')
      .select('*')
    
    const resultsMap = {}
    results?.forEach(r => { resultsMap[r.match_id] = r })
    
    const picksByUser = {}
    picks?.forEach(p => {
      if (!picksByUser[p.user_id]) picksByUser[p.user_id] = []
      picksByUser[p.user_id].push(p)
    })
    
    for (const member of (members || [])) {
      const userPicks = picksByUser[member.user_id] || []
      let totalPoints = 0
      
      for (const pick of userPicks) {
        const result = resultsMap[pick.match_id]
        if (!result) continue
        
        const winnerCorrect = pick.winner === result.winner
        const scoreCorrect = pick.home_score === result.home_score && 
                            pick.away_score === result.away_score && 
                            winnerCorrect
        
        if (scoreCorrect) totalPoints += 4
        else if (winnerCorrect) totalPoints += 1
      }
      
      if (totalPoints !== member.total_points) {
        await supabase
          .from('pool_members')
          .update({ total_points: totalPoints })
          .eq('id', member.id)
        
        if (VERBOSE) log(`  Updated ${member.user_id}: ${member.total_points} → ${totalPoints}`)
      }
    }
  }
  
  log('✅ Leaderboard updated')
}

/**
 * Main update function
 */
async function runUpdate() {
  log(`🏆 Auto-Update Starting (${SPORT})`)
  
  try {
    const data = await fetchTodayEvents(SPORT)
    const events = data.events || []
    
    let tournamentFilter, tournamentCode
    if (SPORT === 'tennis') {
      tournamentFilter = 'roland'
      tournamentCode = 'rg2026'
    } else if (SPORT === 'football') {
      tournamentFilter = 'world cup'
      tournamentCode = 'wc2026'
    }
    
    const filtered = filterByTournament(events, tournamentFilter)
    const finished = filtered.filter(e => e.status?.type === 'finished')
    
    log(`📡 Found ${filtered.length} matches, ${finished.length} finished`)
    
    // Log finished matches
    for (const event of finished) {
      const home = event.homeTeam?.name || 'TBD'
      const away = event.awayTeam?.name || 'TBD'
      const homeScore = event.homeScore?.current || 0
      const awayScore = event.awayScore?.current || 0
      
      if (VERBOSE) log(`  ✅ ${home} ${homeScore}-${awayScore} ${away}`)
    }
    
    // Recalculate leaderboard
    await recalculateLeaderboard(tournamentCode)
    
    log('✅ Update complete')
    
  } catch (err) {
    log('❌ Error:', err.message)
    process.exit(1)
  }
}

// Run
runUpdate()
