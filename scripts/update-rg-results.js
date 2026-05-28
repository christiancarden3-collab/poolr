#!/usr/bin/env node
/**
 * Roland Garros Auto-Updater
 * Fetches results from SofaScore and updates the database
 * 
 * Usage: node scripts/update-rg-results.js [--dry-run] [--day N]
 */

const { createClient } = require('@supabase/supabase-js')

// Supabase config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// SofaScore endpoint for tennis events
const SOFASCORE_API = 'https://api.sofascore.com/api/v1'

// Parse args
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const dayArg = args.find(a => a.startsWith('--day='))
const SPECIFIC_DAY = dayArg ? parseInt(dayArg.split('=')[1]) : null

console.log('🎾 Roland Garros Results Updater')
console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE'}`)
if (SPECIFIC_DAY) console.log(`   Day: ${SPECIFIC_DAY}`)
console.log('')

// Roland Garros 2026 dates
const RG_START = new Date('2026-05-25')
const RG_DAYS = {
  1: '2026-05-25', 2: '2026-05-26', 3: '2026-05-27', 4: '2026-05-28',
  5: '2026-05-29', 6: '2026-05-30', 7: '2026-05-31', 8: '2026-06-01',
  9: '2026-06-02', 10: '2026-06-03', 11: '2026-06-04', 12: '2026-06-05',
  13: '2026-06-06', 14: '2026-06-07', 15: '2026-06-08'
}

// SofaScore match status
const FINISHED_STATUSES = ['finished', 'ended', 'aet']

/**
 * Fetch matches from SofaScore for a specific date
 */
async function fetchSofaScoreMatches(dateStr) {
  try {
    const url = `${SOFASCORE_API}/sport/tennis/scheduled-events/${dateStr}`
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      }
    })
    
    if (!resp.ok) {
      console.error(`   ⚠️ SofaScore API error: ${resp.status}`)
      return []
    }
    
    const data = await resp.json()
    const events = data.events || []
    
    // Filter for Roland Garros (tournament name contains "Roland Garros" or "French Open")
    const rgEvents = events.filter(e => {
      const tName = e.tournament?.name?.toLowerCase() || ''
      const tUname = e.tournament?.uniqueTournament?.name?.toLowerCase() || ''
      return tName.includes('roland') || tName.includes('french open') ||
             tUname.includes('roland') || tUname.includes('french open')
    })
    
    return rgEvents
  } catch (err) {
    console.error(`   ❌ Fetch error: ${err.message}`)
    return []
  }
}

/**
 * Normalize player name for matching
 */
function normalizeName(name) {
  if (!name) return ''
  // "J. Sinner" -> "sinner"
  // "Jannik Sinner" -> "sinner"
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .pop() // Take last word (surname)
    .trim()
}

/**
 * Parse SofaScore score into winner name
 */
function parseScore(event) {
  const home = event.homeTeam?.name || event.homeTeam?.shortName
  const away = event.awayTeam?.name || event.awayTeam?.shortName
  const homeScore = event.homeScore?.current || 0
  const awayScore = event.awayScore?.current || 0
  
  // Tennis: score is sets won
  const winner = homeScore > awayScore ? home : away
  const score = `${homeScore}-${awayScore}`
  
  return { home, away, homeScore, awayScore, winner, score }
}

/**
 * Find matching pick in our database
 */
async function findMatch(homePlayer, awayPlayer, poolId, matchId) {
  // Match IDs follow pattern like "rg1-1", "rg2-5" etc
  const { data, error } = await supabase
    .from('picks')
    .select('*')
    .eq('pool_id', poolId)
    .eq('match_id', matchId)
  
  if (error) {
    console.error(`   DB error: ${error.message}`)
    return null
  }
  
  return data
}

/**
 * Update match result in database
 * We store results in a separate table or in the match data
 */
async function updateMatchResult(matchId, homeScore, awayScore) {
  if (DRY_RUN) {
    console.log(`   [DRY RUN] Would update ${matchId}: ${homeScore}-${awayScore}`)
    return true
  }
  
  // Store in match_results table (create if needed)
  const { error } = await supabase
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString()
    }, { onConflict: 'match_id' })
  
  if (error) {
    console.error(`   ❌ Update failed for ${matchId}: ${error.message}`)
    return false
  }
  
  console.log(`   ✅ Updated ${matchId}: ${homeScore}-${awayScore}`)
  return true
}

/**
 * Main function
 */
async function main() {
  const today = new Date()
  const currentDay = SPECIFIC_DAY || Math.ceil((today - RG_START) / (1000 * 60 * 60 * 24)) + 1
  
  if (currentDay < 1 || currentDay > 15) {
    console.log('⚠️ Tournament not active (Day 1-15)')
    return
  }
  
  console.log(`📅 Processing Day ${currentDay} (${RG_DAYS[currentDay]})`)
  
  // Fetch SofaScore data
  const events = await fetchSofaScoreMatches(RG_DAYS[currentDay])
  console.log(`   Found ${events.length} RG matches`)
  
  // Filter for finished matches
  const finished = events.filter(e => FINISHED_STATUSES.includes(e.status?.type))
  console.log(`   ${finished.length} matches finished`)
  
  if (finished.length === 0) {
    console.log('   No completed matches to update')
    return
  }
  
  let updated = 0
  for (const event of finished) {
    const result = parseScore(event)
    console.log(`\n   📊 ${result.home} vs ${result.away}: ${result.score}`)
    
    // Find corresponding match ID in our system
    // Our match IDs are like "rg1-1", "rg1-2" etc.
    // We need to match by player names
    const homeNorm = normalizeName(result.home)
    const awayNorm = normalizeName(result.away)
    
    // For now, log the match - actual matching would require checking against RG_SCHEDULE
    console.log(`      Normalized: ${homeNorm} vs ${awayNorm}`)
    console.log(`      Winner: ${result.winner}`)
    
    // TODO: Match against RG_SCHEDULE and update database
    // This requires loading the schedule and finding the match ID
    updated++
  }
  
  console.log(`\n✅ Processed ${updated} matches`)
}

// Run
main().catch(console.error)
