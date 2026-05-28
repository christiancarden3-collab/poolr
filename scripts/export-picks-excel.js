#!/usr/bin/env node
/**
 * Export Daily Picks to Excel/CSV
 * 
 * Pulls all picks for a specific day from the pool and exports to Excel
 * 
 * Usage:
 *   node scripts/export-picks-excel.js                    # Today's picks
 *   node scripts/export-picks-excel.js --day=1            # Day 1 picks
 *   node scripts/export-picks-excel.js --day=5 --csv      # Day 5 as CSV
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE0MTYyNiwiZXhwIjoyMDk0NzE3NjI2fQ.phNsgmfw7mmJltNBspCK4C9djgvMlex7rFI9or2QuxM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Pool ID for Whitemalan Open (Roland Garros 2026)
const POOL_ID = 'b6b9b815-205e-4f6c-bb1d-fe6e520aedbe'

// Tournament start date
const TOURNAMENT_START = new Date('2026-05-24')

/**
 * Load schedule for a specific day
 * Tries JSON file first, falls back to hardcoded lib file
 */
function loadSchedule(day) {
  // Try to find JSON file for this day
  const dataDir = path.join(__dirname, '..', 'data')
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : []
  const jsonFile = files.find(f => f.startsWith(`rg-day${day}-`) && f.endsWith('.json'))
  
  if (jsonFile) {
    const filepath = path.join(dataDir, jsonFile)
    console.log(`Loading schedule from: ${filepath}`)
    return JSON.parse(fs.readFileSync(filepath, 'utf8'))
  }
  
  // Fall back to hardcoded schedule in lib file
  try {
    const { DAY1_MATCHES, DAY2_MATCHES, DAY3_MATCHES, DAY4_MATCHES } = require('../lib/rg-matches.js')
    const SCHEDULES = { 1: DAY1_MATCHES, 2: DAY2_MATCHES, 3: DAY3_MATCHES, 4: DAY4_MATCHES }
    if (SCHEDULES[day]) {
      console.log(`Loading schedule from lib/rg-matches.js`)
      return SCHEDULES[day]
    }
  } catch (e) {
    // Ignore if lib file doesn't exist
  }
  
  return null
}

// Parse args
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.replace('--', '').split('=')
  acc[key] = value || true
  return acc
}, {})

// Calculate current day based on tournament start
function getCurrentDay() {
  const today = new Date()
  const diffTime = today - TOURNAMENT_START
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

async function exportPicks() {
  const day = parseInt(args.day) || getCurrentDay()
  const format = args.csv ? 'csv' : 'xlsx'
  
  console.log(`\n📊 Exporting Day ${day} Picks...\n`)
  
  // Get schedule for this day
  const schedule = loadSchedule(day)
  if (!schedule || schedule.length === 0) {
    console.error(`❌ No schedule found for Day ${day}`)
    console.error(`Run: node scripts/fetch-upcoming-matches.js --date=YYYY-MM-DD`)
    process.exit(1)
  }
  
  // Create match ID to match info lookup
  const matchLookup = {}
  schedule.forEach(m => {
    matchLookup[m.id] = m
  })
  
  // Get match IDs for this day (e.g., rg5-1, rg5-2, etc.)
  const dayPrefix = `rg${day}-`
  const matchIds = schedule.map(m => m.id)
  
  // Get all pool members with profiles
  const { data: members, error: membersError } = await supabase
    .from('pool_members')
    .select('user_id, total_points, profiles(name, username, team_name)')
    .eq('pool_id', POOL_ID)
  
  if (membersError) {
    console.error('Error fetching members:', membersError)
    process.exit(1)
  }
  
  console.log(`Found ${members.length} pool members`)
  
  // Get all picks for this day's matches
  const { data: picks, error: picksError } = await supabase
    .from('picks')
    .select('*')
    .eq('pool_id', POOL_ID)
    .in('match_id', matchIds)
  
  if (picksError) {
    console.error('Error fetching picks:', picksError)
    process.exit(1)
  }
  
  console.log(`Found ${picks?.length || 0} picks for Day ${day}`)
  
  // Group picks by user
  const picksByUser = {}
  picks?.forEach(p => {
    if (!picksByUser[p.user_id]) picksByUser[p.user_id] = {}
    picksByUser[p.user_id][p.match_id] = p
  })
  
  // Build header row
  const headers = ['Player', 'Team Name', 'Total Points']
  schedule.forEach(m => {
    headers.push(`${m.p1} vs ${m.p2}`)
  })
  
  // Build data rows
  const rows = []
  for (const member of members) {
    const profile = member.profiles || {}
    const displayName = profile.team_name || profile.name || profile.username || 'Unknown'
    const row = [
      profile.name || profile.username || 'Unknown',
      displayName,
      member.total_points || 0
    ]
    
    // Add picks for each match
    const userPicks = picksByUser[member.user_id] || {}
    for (const match of schedule) {
      const pick = userPicks[match.id]
      if (pick) {
        // Format: "Player1 3-1" (home_score-away_score, p1 is always home)
        row.push(`${pick.home_score}-${pick.away_score}`)
      } else {
        row.push('—')
      }
    }
    
    rows.push(row)
  }
  
  // Sort by total points descending
  rows.sort((a, b) => (b[2] || 0) - (a[2] || 0))
  
  // Export
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `picks-day${day}-${timestamp}`
  
  if (format === 'csv' || !hasXlsx()) {
    // CSV export
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const filepath = path.join(__dirname, '..', 'exports', `${filename}.csv`)
    fs.mkdirSync(path.dirname(filepath), { recursive: true })
    fs.writeFileSync(filepath, csvContent)
    
    console.log(`\n✅ Exported to: ${filepath}`)
    return filepath
  } else {
    // XLSX export (if xlsx package is available)
    const XLSX = require('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    
    // Auto-width columns
    const colWidths = headers.map((h, i) => ({
      wch: Math.max(h.length, ...rows.map(r => String(r[i]).length)) + 2
    }))
    ws['!cols'] = colWidths
    
    XLSX.utils.book_append_sheet(wb, ws, `Day ${day} Picks`)
    
    const filepath = path.join(__dirname, '..', 'exports', `${filename}.xlsx`)
    fs.mkdirSync(path.dirname(filepath), { recursive: true })
    XLSX.writeFile(wb, filepath)
    
    console.log(`\n✅ Exported to: ${filepath}`)
    return filepath
  }
}

function hasXlsx() {
  try {
    require.resolve('xlsx')
    return true
  } catch {
    return false
  }
}

// Run
exportPicks().catch(console.error)
