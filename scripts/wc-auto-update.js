#!/usr/bin/env node
/**
 * World Cup 2026 - Auto Update Results
 * 
 * Fetches live/completed matches from API and updates results
 * using sofascore_id for reliable matching (no name guessing!)
 * 
 * Usage:
 *   node scripts/wc-auto-update.js
 *   node scripts/wc-auto-update.js --verbose
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

const VERBOSE = args.verbose || false

function log(...msg) {
  console.log(`[${new Date().toISOString()}]`, ...msg)
}

/**
 * Fetch scheduled events for today
 */
async function fetchTodayEvents() {
  const today = new Date().toISOString().split('T')[0]
  const url = `${API_BASE}/sport/football/scheduled-events/${today}`
  
  if (VERBOSE) log(`Fetching: ${url}`)
  
  const response = await fetch(url, { headers })
  if (!response.ok) throw new Error(`API error: ${response.status}`)
  
  const data = await response.json()
  return data.events || []
}

/**
 * Filter World Cup events
 */
function filterWorldCup(events) {
  return events.filter(e => {
    const tName = (e.tournament?.name || '').toLowerCase()
    const utName = (e.tournament?.uniqueTournament?.name || '').toLowerCase()
    return tName.includes('world cup') || utName.includes('world cup') ||
           tName.includes('fifa') || utName.includes('fifa')
  })
}

/**
 * Get our stored matches by sofascore_id
 */
async function getStoredMatches() {
  const { data, error } = await supabase
    .from('wc_matches')
    .select('sofascore_id, match_id')
  
  if (error) {
    log('⚠️ Error fetching stored matches:', error.message)
    return {}
  }
  
  const map = {}
  data?.forEach(m => { map[m.sofascore_id] = m.match_id })
  return map
}

/**
 * Update match result
 */
async function updateMatchResult(matchId, homeScore, awayScore, status) {
  // Determine winner
  let winner = null
  if (status === 'finished') {
    if (homeScore > awayScore) winner = 'home'
    else if (awayScore > homeScore) winner = 'away'
    else winner = 'draw'
  }
  
  const { error } = await supabase
    .from('wc_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      winner,
      status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'match_id' })
  
  return !error
}

/**
 * Recalculate World Cup leaderboard
 * 
 * Scoring:
 * - Exact score = 3 pts
 * - Correct result (win/draw/loss) = 1 pt
 */
async function recalculateLeaderboard() {
  log('📊 Recalculating leaderboard...')
  
  // Get all results
  const { data: results } = await supabase
    .from('wc_results')
    .select('*')
    .eq('status', 'finished')
  
  const resultsMap = {}
  results?.forEach(r => { resultsMap[r.match_id] = r })
  
  // Get all WC pools
  const { data: pools } = await supabase
    .from('pools')
    .select('id, name')
    .eq('tournament', 'wc2026')
  
  for (const pool of (pools || [])) {
    // Get members
    const { data: members } = await supabase
      .from('pool_members')
      .select('id, user_id, total_points, profiles(team_name, name)')
      .eq('pool_id', pool.id)
    
    // Get all picks
    const { data: picks } = await supabase
      .from('wc_picks')
      .select('*')
      .eq('pool_id', pool.id)
    
    const picksByUser = {}
    picks?.forEach(p => {
      if (!picksByUser[p.user_id]) picksByUser[p.user_id] = []
      picksByUser[p.user_id].push(p)
    })
    
    // Calculate points
    for (const member of (members || [])) {
      const userPicks = picksByUser[member.user_id] || []
      let totalPoints = 0
      
      for (const pick of userPicks) {
        const result = resultsMap[pick.match_id]
        if (!result) continue
        
        // Determine result types
        const pickResult = pick.home_score > pick.away_score ? 'home' :
                         pick.away_score > pick.home_score ? 'away' : 'draw'
        const actualResult = result.winner
        
        const resultCorrect = pickResult === actualResult
        const exactScore = pick.home_score === result.home_score && 
                          pick.away_score === result.away_score
        
        if (exactScore) totalPoints += 3
        else if (resultCorrect) totalPoints += 1
      }
      
      // Update if changed
      if (totalPoints !== member.total_points) {
        await supabase
          .from('pool_members')
          .update({ total_points: totalPoints })
          .eq('id', member.id)
        
        if (VERBOSE) {
          const name = member.profiles?.team_name || member.profiles?.name
          log(`  ${name}: ${member.total_points} → ${totalPoints}`)
        }
      }
    }
  }
  
  log('✅ Leaderboard updated')
}

/**
 * Main update function
 */
async function runUpdate() {
  log('⚽ World Cup Auto-Update Starting')
  
  try {
    // Get our stored match IDs
    const storedMatches = await getStoredMatches()
    const storedCount = Object.keys(storedMatches).length
    
    if (storedCount === 0) {
      log('⚠️ No matches in database. Run wc-fetch-schedule.js first!')
      return
    }
    
    log(`Found ${storedCount} matches in database`)
    
    // Fetch today's events
    const events = await fetchTodayEvents()
    const wcEvents = filterWorldCup(events)
    
    log(`📡 Found ${wcEvents.length} World Cup matches today`)
    
    let updated = 0
    
    for (const event of wcEvents) {
      const sofascoreId = event.id
      const matchId = storedMatches[sofascoreId]
      
      if (!matchId) {
        if (VERBOSE) log(`⚠️ Match not in DB: ${event.homeTeam?.name} vs ${event.awayTeam?.name}`)
        continue
      }
      
      const homeScore = event.homeScore?.current ?? null
      const awayScore = event.awayScore?.current ?? null
      const status = event.status?.type || 'scheduled'
      
      // Only update if has scores or finished
      if (status === 'finished' || status === 'inprogress') {
        const success = await updateMatchResult(matchId, homeScore, awayScore, status)
        
        if (success) {
          updated++
          const statusEmoji = status === 'finished' ? '✅' : '🔴'
          log(`${statusEmoji} ${matchId}: ${event.homeTeam?.name} ${homeScore}-${awayScore} ${event.awayTeam?.name}`)
        }
      }
    }
    
    log(`Updated ${updated} match results`)
    
    // Recalculate leaderboard if any finished matches
    const finishedCount = wcEvents.filter(e => e.status?.type === 'finished').length
    if (finishedCount > 0) {
      await recalculateLeaderboard()
    }
    
    log('✅ Update complete')
    
  } catch (err) {
    log('❌ Error:', err.message)
    if (VERBOSE) console.error(err)
    process.exit(1)
  }
}

// Run
runUpdate()
