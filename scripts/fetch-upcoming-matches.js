#!/usr/bin/env node
/**
 * Fetch Upcoming Tennis Matches from SofaScore API
 * 
 * Fetches scheduled matches for a given date and stores them
 * Can be used to populate the schedule for picks
 * 
 * Usage:
 *   node scripts/fetch-upcoming-matches.js                    # Tomorrow's matches
 *   node scripts/fetch-upcoming-matches.js --date=2026-05-29  # Specific date
 *   node scripts/fetch-upcoming-matches.js --save             # Save to database
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

// Tournament start date for day calculation
const TOURNAMENT_START = new Date('2026-05-24')

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
 * Calculate tournament day from date
 */
function getTournamentDay(dateStr) {
  const date = new Date(dateStr)
  const diffTime = date - TOURNAMENT_START
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

/**
 * Fetch scheduled events for a date
 */
async function fetchScheduledEvents(date) {
  const url = `${API_BASE}/sport/tennis/scheduled-events/${date}`
  log(`Fetching: ${url}`)
  
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.events || []
}

/**
 * Filter events by Roland Garros tournament
 */
function filterRolandGarros(events) {
  return events.filter(e => {
    const tName = (e.tournament?.name || '').toLowerCase()
    const utName = (e.tournament?.uniqueTournament?.name || '').toLowerCase()
    return tName.includes('roland garros') || utName.includes('roland garros') ||
           tName.includes('french open') || utName.includes('french open')
  })
}

/**
 * Filter to Men's Singles only
 */
function filterMensSingles(events) {
  return events.filter(e => {
    const category = (e.tournament?.category?.name || '').toLowerCase()
    const tName = (e.tournament?.name || '').toLowerCase()
    // Men's singles typically has "ATP" or "Men" in category, not "WTA" or "Women" or "Doubles"
    const isATP = category.includes('atp') || category.includes('men')
    const isNotDoubles = !tName.includes('doubles') && !tName.includes('double')
    const isNotWomen = !category.includes('wta') && !category.includes('women')
    return isNotDoubles && isNotWomen
  })
}

/**
 * Format match for our system
 */
function formatMatch(event, index, day) {
  const homeTeam = event.homeTeam || {}
  const awayTeam = event.awayTeam || {}
  
  // Extract player names (format: "J. Sinner" from "Jannik Sinner")
  const formatName = (name) => {
    if (!name) return 'TBD'
    const parts = name.split(' ')
    if (parts.length === 1) return name
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ')
    return `${firstName.charAt(0)}. ${lastName}`
  }
  
  // Get country from team data
  const getCountry = (team) => {
    return team.country?.name || team.country?.alpha2 || 'Unknown'
  }
  
  // Convert Unix timestamp to time string
  const startTime = event.startTimestamp ? new Date(event.startTimestamp * 1000) : null
  const timeStr = startTime ? startTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York'
  }) : 'TBD'
  
  return {
    id: `rg${day}-${index + 1}`,
    sofascore_id: event.id,
    p1: formatName(homeTeam.name),
    c1: getCountry(homeTeam),
    p2: formatName(awayTeam.name),
    c2: getCountry(awayTeam),
    time: timeStr,
    date: startTime ? startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
    status: event.status?.type || 'scheduled',
    round: event.roundInfo?.name || 'Unknown'
  }
}

/**
 * Save matches to database
 */
async function saveToDatabase(matches, day) {
  log(`Saving ${matches.length} matches to database for Day ${day}...`)
  
  for (const match of matches) {
    const { error } = await supabase
      .from('rg_schedule')
      .upsert({
        match_id: match.id,
        sofascore_id: match.sofascore_id,
        day: day,
        player1: match.p1,
        country1: match.c1,
        player2: match.p2,
        country2: match.c2,
        match_time: match.time,
        match_date: match.date,
        status: match.status,
        round: match.round,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'match_id'
      })
    
    if (error) {
      log(`⚠️ Error saving ${match.id}:`, error.message)
    }
  }
  
  log(`✅ Saved to database`)
}

/**
 * Save matches to JSON file
 */
function saveToFile(matches, day, date) {
  const filepath = path.join(__dirname, '..', 'data', `rg-day${day}-${date}.json`)
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  fs.writeFileSync(filepath, JSON.stringify(matches, null, 2))
  log(`✅ Saved to: ${filepath}`)
  return filepath
}

/**
 * Main function
 */
async function main() {
  // Get target date (default: tomorrow)
  let targetDate = args.date
  if (!targetDate) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    targetDate = tomorrow.toISOString().split('T')[0]
  }
  
  const day = getTournamentDay(targetDate)
  
  log(`\n🎾 Fetching Roland Garros matches for ${targetDate} (Day ${day})...\n`)
  
  try {
    // Fetch all tennis events for the date
    const allEvents = await fetchScheduledEvents(targetDate)
    log(`Found ${allEvents.length} total tennis events`)
    
    // Filter to Roland Garros
    const rgEvents = filterRolandGarros(allEvents)
    log(`Found ${rgEvents.length} Roland Garros events`)
    
    // Filter to Men's Singles
    const mensSingles = filterMensSingles(rgEvents)
    log(`Found ${mensSingles.length} Men's Singles matches`)
    
    if (mensSingles.length === 0) {
      log('\n⚠️ No Men\'s Singles matches found for this date')
      log('This might be a rest day or matches haven\'t been scheduled yet')
      return
    }
    
    // Format matches
    const matches = mensSingles.map((e, i) => formatMatch(e, i, day))
    
    // Sort by time
    matches.sort((a, b) => {
      if (a.time === 'TBD') return 1
      if (b.time === 'TBD') return -1
      return a.time.localeCompare(b.time)
    })
    
    // Re-index after sorting
    matches.forEach((m, i) => {
      m.id = `rg${day}-${i + 1}`
    })
    
    // Display matches
    console.log(`\n📋 Day ${day} Schedule (${targetDate}):\n`)
    matches.forEach(m => {
      console.log(`  ${m.id}: ${m.p1} vs ${m.p2} @ ${m.time} (${m.round})`)
    })
    
    // Save to file
    const filepath = saveToFile(matches, day, targetDate)
    
    // Save to database if requested
    if (args.save) {
      await saveToDatabase(matches, day)
    }
    
    console.log(`\n✅ Done! ${matches.length} matches ready for Day ${day}\n`)
    
    return matches
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
