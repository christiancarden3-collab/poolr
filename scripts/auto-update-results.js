#!/usr/bin/env node
/**
 * Auto-Update Results from SofaScore API
 * - Fetches live/completed matches
 * - Matches by player name (not home/away position)
 * - Updates match_results table
 * - Recalculates leaderboard points
 * 
 * Usage:
 *   node scripts/auto-update-results.js --sport=tennis
 *   node scripts/auto-update-results.js --sport=tennis --verbose
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

// Pool ID for RG
const POOL_ID = 'b6b9b815-205e-4f6c-bb1d-fe6e520aedbe'
const TOURNAMENT_START = new Date('2026-05-24')

function log(...msg) {
  console.log(`[${new Date().toISOString()}]`, ...msg)
}

/**
 * Get current tournament day
 */
function getCurrentDay() {
  const today = new Date()
  const diffTime = today - TOURNAMENT_START
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

/**
 * Load our schedule for matching
 */
function loadSchedule(day) {
  const dataDir = path.join(__dirname, '..', 'data')
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : []
  const jsonFile = files.find(f => f.startsWith(`rg-day${day}-`) && f.endsWith('.json'))
  
  if (jsonFile) {
    return JSON.parse(fs.readFileSync(path.join(dataDir, jsonFile), 'utf8'))
  }
  
  // Fallback to hardcoded
  try {
    const schedules = require('../lib/rg-matches.js')
    const key = `DAY${day}_MATCHES`
    return schedules[key] || null
  } catch {
    return null
  }
}

/**
 * Normalize player name for matching
 */
function normalizeName(name) {
  if (!name) return ''
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if two names match (fuzzy)
 */
function namesMatch(apiName, scheduleName) {
  const api = normalizeName(apiName)
  const sched = normalizeName(scheduleName)
  
  // Direct match
  if (api === sched) return true
  
  // Check if last name matches
  const apiParts = api.split(' ')
  const schedParts = sched.split(' ')
  const apiLast = apiParts[apiParts.length - 1]
  const schedLast = schedParts[schedParts.length - 1]
  
  if (apiLast === schedLast && apiLast.length > 2) return true
  
  // Check if one contains the other
  if (api.includes(sched) || sched.includes(api)) return true
  
  return false
}

/**
 * Find match in schedule by player names
 */
function findMatchInSchedule(schedule, apiHome, apiAway) {
  for (const match of schedule) {
    // Check if API home matches p1 and API away matches p2
    if (namesMatch(apiHome, match.p1) && namesMatch(apiAway, match.p2)) {
      return { match, homeIsP1: true }
    }
    // Check if API home matches p2 and API away matches p1 (swapped)
    if (namesMatch(apiHome, match.p2) && namesMatch(apiAway, match.p1)) {
      return { match, homeIsP1: false }
    }
  }
  return null
}

/**
 * Fetch scheduled events for today
 */
async function fetchTodayEvents(sport) {
  const today = new Date().toISOString().split('T')[0]
  const url = `${API_BASE}/sport/${sport}/scheduled-events/${today}`
  
  if (VERBOSE) log(`Fetching: ${url}`)
  
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
 * Filter to Men's Singles only
 */
function filterMensSingles(events) {
  return events.filter(e => {
    const category = (e.tournament?.category?.name || '').toLowerCase()
    const tName = (e.tournament?.name || '').toLowerCase()
    const isNotDoubles = !tName.includes('doubles') && !tName.includes('double')
    const isNotWomen = !category.includes('wta') && !category.includes('women')
    return isNotDoubles && isNotWomen
  })
}

/**
 * Update match result in database
 */
async function updateMatchResult(matchId, homeScore, awayScore, winner) {
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
 * Recalculate leaderboard points
 */
async function recalculateLeaderboard() {
  log('📊 Recalculating leaderboard...')
  
  const { data: results } = await supabase.from('match_results').select('*')
  const resultsMap = {}
  results?.forEach(r => { resultsMap[r.match_id] = r })
  
  const { data: members } = await supabase
    .from('pool_members')
    .select('id, user_id, total_points, profiles(team_name, name)')
    .eq('pool_id', POOL_ID)
  
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('pool_id', POOL_ID)
  
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
      const exactScore = pick.home_score === result.home_score && 
                        pick.away_score === result.away_score && 
                        winnerCorrect
      
      if (exactScore) totalPoints += 4
      else if (winnerCorrect) totalPoints += 1
    }
    
    if (totalPoints !== member.total_points) {
      await supabase
        .from('pool_members')
        .update({ total_points: totalPoints })
        .eq('id', member.id)
      
      if (VERBOSE) {
        const name = member.profiles?.team_name || member.profiles?.name
        log(`  Updated ${name}: ${member.total_points} → ${totalPoints}`)
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
    const day = getCurrentDay()
    log(`Tournament Day: ${day}`)
    
    // Load schedule
    const schedule = loadSchedule(day)
    if (!schedule || schedule.length === 0) {
      log(`⚠️ No schedule found for Day ${day}`)
      return
    }
    
    // Fetch today's events
    const data = await fetchTodayEvents(SPORT)
    const events = data.events || []
    
    // Filter to Roland Garros Men's Singles
    const rgEvents = filterByTournament(events, 'roland')
    const mensSingles = filterMensSingles(rgEvents)
    const finished = mensSingles.filter(e => e.status?.type === 'finished')
    
    log(`📡 Found ${mensSingles.length} matches, ${finished.length} finished`)
    
    let updatedCount = 0
    
    // Process finished matches
    for (const event of finished) {
      const apiHome = event.homeTeam?.name || ''
      const apiAway = event.awayTeam?.name || ''
      const apiHomeScore = event.homeScore?.current || 0
      const apiAwayScore = event.awayScore?.current || 0
      
      // Find this match in our schedule
      const found = findMatchInSchedule(schedule, apiHome, apiAway)
      
      if (!found) {
        if (VERBOSE) log(`  ⚠️ No match found for: ${apiHome} vs ${apiAway}`)
        continue
      }
      
      const { match, homeIsP1 } = found
      
      // Determine scores relative to OUR p1/p2
      let p1Score, p2Score, winner
      if (homeIsP1) {
        // API home = our p1
        p1Score = apiHomeScore
        p2Score = apiAwayScore
        winner = apiHomeScore > apiAwayScore ? 'home' : 'away'
      } else {
        // API home = our p2 (swapped)
        p1Score = apiAwayScore
        p2Score = apiHomeScore
        winner = apiAwayScore > apiHomeScore ? 'home' : 'away'
      }
      
      // Update database
      const updated = await updateMatchResult(match.id, p1Score, p2Score, winner)
      
      if (updated) {
        updatedCount++
        const winnerName = winner === 'home' ? match.p1 : match.p2
        log(`  ✅ ${match.id}: ${match.p1} ${p1Score}-${p2Score} ${match.p2} → ${winnerName} won`)
      }
    }
    
    log(`Updated ${updatedCount} match results`)
    
    // Recalculate leaderboard
    await recalculateLeaderboard()
    
    log('✅ Update complete')
    
  } catch (err) {
    log('❌ Error:', err.message)
    if (VERBOSE) console.error(err)
    process.exit(1)
  }
}

// Run
runUpdate()
