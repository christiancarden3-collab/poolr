#!/usr/bin/env node
/**
 * Daily Picks Report
 * 
 * Exports all picks for today's matches to Excel and outputs the filepath
 * Designed to be run by a cron job that sends to WhatsApp
 * 
 * Usage:
 *   node scripts/daily-picks-report.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE0MTYyNiwiZXhwIjoyMDk0NzE3NjI2fQ.phNsgmfw7mmJltNBspCK4C9djgvMlex7rFI9or2QuxM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const POOL_ID = 'b6b9b815-205e-4f6c-bb1d-fe6e520aedbe'
const TOURNAMENT_START = new Date('2026-05-24')

function getCurrentDay() {
  const today = new Date()
  const diffTime = today - TOURNAMENT_START
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDays)
}

function loadSchedule(day) {
  const dataDir = path.join(__dirname, '..', 'data')
  const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : []
  const jsonFile = files.find(f => f.startsWith(`rg-day${day}-`) && f.endsWith('.json'))
  
  if (jsonFile) {
    return JSON.parse(fs.readFileSync(path.join(dataDir, jsonFile), 'utf8'))
  }
  
  try {
    const { DAY1_MATCHES, DAY2_MATCHES, DAY3_MATCHES, DAY4_MATCHES } = require('../lib/rg-matches.js')
    const SCHEDULES = { 1: DAY1_MATCHES, 2: DAY2_MATCHES, 3: DAY3_MATCHES, 4: DAY4_MATCHES }
    return SCHEDULES[day] || null
  } catch {
    return null
  }
}

async function generateReport() {
  const day = getCurrentDay()
  const schedule = loadSchedule(day)
  
  if (!schedule || schedule.length === 0) {
    console.log(`No schedule for Day ${day}`)
    process.exit(0)
  }
  
  const matchIds = schedule.map(m => m.id)
  
  // Get members
  const { data: members } = await supabase
    .from('pool_members')
    .select('user_id, total_points, profiles(name, username, team_name)')
    .eq('pool_id', POOL_ID)
  
  // Get picks
  const { data: picks } = await supabase
    .from('picks')
    .select('*')
    .eq('pool_id', POOL_ID)
    .in('match_id', matchIds)
  
  const picksByUser = {}
  picks?.forEach(p => {
    if (!picksByUser[p.user_id]) picksByUser[p.user_id] = {}
    picksByUser[p.user_id][p.match_id] = p
  })
  
  // Build Excel
  const headers = ['Rank', 'Player', 'Points']
  schedule.forEach(m => headers.push(`${m.p1} vs ${m.p2}`))
  
  const rows = []
  for (const member of members || []) {
    const profile = member.profiles || {}
    const displayName = profile.team_name || profile.name || profile.username || 'Unknown'
    const row = [0, displayName, member.total_points || 0]
    
    const userPicks = picksByUser[member.user_id] || {}
    for (const match of schedule) {
      const pick = userPicks[match.id]
      row.push(pick ? `${pick.home_score}-${pick.away_score}` : '—')
    }
    rows.push(row)
  }
  
  // Sort by points and add rank
  rows.sort((a, b) => (b[2] || 0) - (a[2] || 0))
  rows.forEach((row, i) => { row[0] = i + 1 })
  
  // Export to Excel
  const XLSX = require('xlsx')
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  
  // Style: auto-width columns
  ws['!cols'] = headers.map((h, i) => ({
    wch: Math.max(String(h).length, ...rows.map(r => String(r[i]).length)) + 2
  }))
  
  XLSX.utils.book_append_sheet(wb, ws, `Day ${day}`)
  
  const date = new Date().toISOString().split('T')[0]
  const filename = `whitemalan-open-day${day}-${date}.xlsx`
  const filepath = path.join(__dirname, '..', 'exports', filename)
  
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  XLSX.writeFile(wb, filepath)
  
  // Output for cron to capture
  console.log(`EXCEL_PATH=${filepath}`)
  console.log(`DAY=${day}`)
  console.log(`MATCH_COUNT=${schedule.length}`)
  console.log(`MEMBER_COUNT=${members?.length || 0}`)
  console.log(`PICK_COUNT=${picks?.length || 0}`)
  
  return filepath
}

generateReport().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
