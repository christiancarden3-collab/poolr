#!/usr/bin/env node
/**
 * PickPoolr Sports API - Fetches results from SofaScore via RapidAPI
 * 
 * Usage:
 *   node scripts/sports-api.js --sport=tennis --date=2026-05-28
 *   node scripts/sports-api.js --tournament=roland-garros --update-db
 */

const RAPIDAPI_KEY = '158e30dfc0msha6ebce69d05cb48p1880ebjsnd3e00dc63725'
const RAPIDAPI_HOST = 'sportapi7.p.rapidapi.com'
const API_BASE = 'https://sportapi7.p.rapidapi.com/api/v1'

// Supabase config
const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const headers = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST,
  'Content-Type': 'application/json'
}

// Parse command line args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=')
  acc[key] = value || true
  return acc
}, {})

/**
 * Fetch scheduled events for a sport on a specific date
 */
async function getScheduledEvents(sport, date) {
  const url = `${API_BASE}/sport/${sport}/scheduled-events/${date}`
  console.log(`📡 Fetching: ${url}`)
  
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get event details by ID
 */
async function getEvent(eventId) {
  const url = `${API_BASE}/event/${eventId}`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Search for tournaments
 */
async function searchTournaments(query) {
  const url = `${API_BASE}/search/${encodeURIComponent(query)}`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Get tournaments for a date
 */
async function getTournamentsOnDate(date) {
  const url = `${API_BASE}/sport/tennis/tournaments-events?date=${date}`
  console.log(`📡 Fetching tournaments: ${url}`)
  
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Get all live events
 */
async function getLiveEvents() {
  const url = `${API_BASE}/sport/tennis/events/live`
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

/**
 * Filter for Roland Garros events
 */
function filterRolandGarros(events) {
  return (events || []).filter(e => {
    const tName = (e.tournament?.name || '').toLowerCase()
    const utName = (e.tournament?.uniqueTournament?.name || '').toLowerCase()
    return tName.includes('roland') || tName.includes('french open') ||
           utName.includes('roland') || utName.includes('french open')
  })
}

/**
 * Update Supabase with match results
 */
async function updateMatchResults(results) {
  if (!SUPABASE_KEY) {
    console.log('⚠️ No SUPABASE_KEY - skipping DB update')
    return
  }

  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  for (const result of results) {
    const { error } = await supabase
      .from('match_results')
      .upsert({
        match_id: result.match_id,
        home_score: result.home_score,
        away_score: result.away_score,
        winner: result.winner,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })

    if (error) {
      console.error(`❌ Failed to update ${result.match_id}:`, error.message)
    } else {
      console.log(`✅ Updated ${result.match_id}: ${result.home_score}-${result.away_score}`)
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🏆 PickPoolr Sports API')
  console.log('========================\n')

  const today = new Date().toISOString().split('T')[0]
  const date = args.date || today
  const sport = args.sport || 'tennis'

  try {
    if (args.live) {
      // Get live events
      console.log('📺 Fetching live tennis events...\n')
      const data = await getLiveEvents()
      const rgEvents = filterRolandGarros(data.events)
      
      console.log(`Found ${rgEvents.length} live Roland Garros matches:\n`)
      rgEvents.forEach(e => {
        const home = e.homeTeam?.name || 'TBD'
        const away = e.awayTeam?.name || 'TBD'
        const score = `${e.homeScore?.current || 0}-${e.awayScore?.current || 0}`
        console.log(`  ${home} vs ${away}: ${score} (${e.status?.description || 'live'})`)
      })
      return
    }

    if (args.search) {
      // Search for tournaments
      console.log(`🔍 Searching for: ${args.search}\n`)
      const data = await searchTournaments(args.search)
      console.log(JSON.stringify(data, null, 2))
      return
    }

    // Get scheduled events for date
    console.log(`📅 Fetching ${sport} events for ${date}...\n`)
    const data = await getScheduledEvents(sport, date)
    
    // Filter for Roland Garros
    const rgEvents = filterRolandGarros(data.events)
    console.log(`Found ${rgEvents.length} Roland Garros matches:\n`)

    const finished = []
    
    for (const event of rgEvents) {
      const home = event.homeTeam?.name || 'TBD'
      const away = event.awayTeam?.name || 'TBD'
      const homeScore = event.homeScore?.current || 0
      const awayScore = event.awayScore?.current || 0
      const status = event.status?.type || 'scheduled'
      
      const statusIcon = status === 'finished' ? '✅' : status === 'inprogress' ? '🔴' : '⏳'
      console.log(`${statusIcon} ${home} vs ${away}: ${homeScore}-${awayScore} (${status})`)
      
      if (status === 'finished') {
        // Try to match to our RG schedule
        // Our match IDs are like "rg1-1", "rg2-5", etc.
        // We'd need to match by player names
        finished.push({
          event_id: event.id,
          home_player: home,
          away_player: away,
          home_score: homeScore,
          away_score: awayScore,
          winner: homeScore > awayScore ? 'home' : 'away'
        })
      }
    }

    console.log(`\n📊 ${finished.length} matches finished`)
    
    if (finished.length > 0 && args['update-db']) {
      console.log('\n📝 Updating database...')
      // Would need to map event names to our match IDs
      // For now, just log what we'd update
      console.log('Results to update:', finished)
    }

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

// Export for use as module
module.exports = {
  getScheduledEvents,
  getEvent,
  searchTournaments,
  getLiveEvents,
  filterRolandGarros,
  updateMatchResults,
  RAPIDAPI_KEY,
  headers
}

// Run if called directly
if (require.main === module) {
  main()
}
