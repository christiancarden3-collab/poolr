#!/usr/bin/env node
/**
 * World Cup 2026 - Fetch Schedule from SofaScore API
 * 
 * Pulls the official match schedule and stores with API event IDs
 * for reliable result matching later.
 * 
 * Usage:
 *   node scripts/wc-fetch-schedule.js                    # Fetch full schedule
 *   node scripts/wc-fetch-schedule.js --date=2026-06-11  # Specific date
 *   node scripts/wc-fetch-schedule.js --save             # Save to database
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

// World Cup 2026 dates
const WC_START = '2026-06-11'
const WC_END = '2026-07-19'

// Parse args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=')
  acc[key] = value || true
  return acc
}, {})

function log(...msg) {
  console.log(`[${new Date().toISOString()}]`, ...msg)
}

/**
 * Fetch scheduled events for a date
 */
async function fetchScheduledEvents(date) {
  const url = `${API_BASE}/sport/football/scheduled-events/${date}`
  log(`Fetching: ${url}`)
  
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.events || []
}

/**
 * Filter events by World Cup tournament
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
 * Format match for our system
 */
function formatMatch(event, matchday) {
  const homeTeam = event.homeTeam || {}
  const awayTeam = event.awayTeam || {}
  
  // Get start time
  const startTime = event.startTimestamp ? new Date(event.startTimestamp * 1000) : null
  const dateStr = startTime ? startTime.toISOString().split('T')[0] : 'TBD'
  const timeStr = startTime ? startTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  }) : 'TBD'
  
  return {
    sofascore_id: event.id,
    match_id: `wc-${event.id}`, // Use API ID as match ID
    home_team: homeTeam.name || 'TBD',
    home_code: homeTeam.nameCode || homeTeam.shortName || 'TBD',
    away_team: awayTeam.name || 'TBD', 
    away_code: awayTeam.nameCode || awayTeam.shortName || 'TBD',
    match_date: dateStr,
    match_time: timeStr,
    matchday: matchday,
    stage: event.roundInfo?.name || 'Group Stage',
    group: event.tournament?.name?.match(/Group ([A-L])/)?.[1] || null,
    status: event.status?.type || 'scheduled',
    home_score: event.homeScore?.current,
    away_score: event.awayScore?.current,
    venue: event.venue?.stadium?.name || null,
    city: event.venue?.city?.name || null
  }
}

/**
 * Save matches to database
 */
async function saveToDatabase(matches) {
  log(`Saving ${matches.length} matches to database...`)
  
  for (const match of matches) {
    const { error } = await supabase
      .from('wc_matches')
      .upsert({
        ...match,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'sofascore_id'
      })
    
    if (error) {
      log(`⚠️ Error saving ${match.match_id}:`, error.message)
    }
  }
  
  log(`✅ Saved to database`)
}

/**
 * Save matches to JSON file
 */
function saveToFile(matches, date) {
  const filepath = path.join(__dirname, '..', 'data', `wc-${date}.json`)
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  fs.writeFileSync(filepath, JSON.stringify(matches, null, 2))
  log(`✅ Saved to: ${filepath}`)
  return filepath
}

/**
 * Get all dates in World Cup range
 */
function getWCDates() {
  const dates = []
  let current = new Date(WC_START)
  const end = new Date(WC_END)
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

/**
 * Main function
 */
async function main() {
  log(`\n⚽ World Cup 2026 Schedule Fetcher\n`)
  
  try {
    let dates
    if (args.date) {
      dates = [args.date]
    } else {
      // For now, just fetch the first few days as a test
      dates = ['2026-06-11', '2026-06-12', '2026-06-13']
      log(`Fetching first 3 days as test. Use --date=YYYY-MM-DD for specific date.`)
    }
    
    const allMatches = []
    
    for (const date of dates) {
      log(`\n📅 Fetching ${date}...`)
      
      const events = await fetchScheduledEvents(date)
      log(`Found ${events.length} total football events`)
      
      const wcEvents = filterWorldCup(events)
      log(`Found ${wcEvents.length} World Cup matches`)
      
      if (wcEvents.length > 0) {
        const matchday = Math.floor((new Date(date) - new Date(WC_START)) / (1000 * 60 * 60 * 24)) + 1
        const matches = wcEvents.map(e => formatMatch(e, matchday))
        allMatches.push(...matches)
        
        // Display matches
        matches.forEach(m => {
          console.log(`  ${m.match_id}: ${m.home_team} vs ${m.away_team} @ ${m.match_time} (${m.stage})`)
        })
      }
    }
    
    if (allMatches.length === 0) {
      log('\n⚠️ No World Cup matches found. Tournament might not have started or API doesn\'t have data yet.')
      return
    }
    
    // Save to file
    const date = args.date || 'schedule'
    saveToFile(allMatches, date)
    
    // Save to database if requested
    if (args.save) {
      await saveToDatabase(allMatches)
    }
    
    console.log(`\n✅ Done! ${allMatches.length} matches fetched\n`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
