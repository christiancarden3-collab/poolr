// Day 3 (May 27) Results - R2 Round of 64
const DAY3_RESULTS = {
  'rg3-1': { winner: 'away', score: '3-2' },  // Tirante beat Davidovich Fokina
  'rg3-2': { winner: 'home', score: 'WO' },   // de Minaur walkover vs Blockx
  'rg3-3': { winner: 'away', score: '3-0' },  // De Jong beat Cinà
  'rg3-4': { winner: 'home', score: '3-1' },  // Khachanov beat Trungelliti
  'rg3-5': { winner: 'away', score: '3-1' },  // Rublev beat Ugo Carabelli
  'rg3-6': { winner: 'away', score: '3-2' },  // Menšik beat Navone
  'rg3-7': { winner: 'away', score: '3-2' },  // Jódar beat Duckworth
  'rg3-8': { winner: 'home', score: '3-1' },  // Borges beat Kecmanović
  'rg3-9': { winner: 'away', score: 'RET' },  // Carreño Busta beat Kokkinakis (ret)
  'rg3-10': { winner: 'home', score: '3-2' }, // Fonseca beat Prižmić
  'rg3-11': { winner: 'away', score: '3-2' }, // Halys beat Humbert  
  'rg3-12': { winner: 'away', score: '3-1' }, // Djokovic beat Royer
  'rg3-13': { winner: 'away', score: '3-2' }, // Michelsen beat Basavareddy
  'rg3-14': { winner: 'home', score: '3-0' }, // Ruud beat Medjedović
  'rg3-15': { winner: 'away', score: '3-0' }, // Paul beat Sonego
  'rg3-16': { winner: 'away', score: '3-0' }, // Zverev beat Machač
}

const USERS = {
  '59edbae3-dae0-4945-8ca5-7ea2adbe8621': 'OPAA',
  '7abc3086-59b6-4af8-a964-90875c76e01a': '😁',
  '36de178e-0bbe-4651-957d-45f91af161de': 'RiverPlateSV'
}

const picks = JSON.parse(process.argv[2] || '[]')

const scores = { 'OPAA': 0, '😁': 0, 'RiverPlateSV': 0 }
const correct = { 'OPAA': 0, '😁': 0, 'RiverPlateSV': 0 }
const exact = { 'OPAA': 0, '😁': 0, 'RiverPlateSV': 0 }

// Group by match
const byMatch = {}
for (const p of picks) {
  if (!byMatch[p.match_id]) byMatch[p.match_id] = {}
  byMatch[p.match_id][USERS[p.user_id]] = p
}

// Calculate
for (const matchId of Object.keys(DAY3_RESULTS).sort()) {
  const result = DAY3_RESULTS[matchId]
  
  for (const team of ['OPAA', '😁', 'RiverPlateSV']) {
    const pick = byMatch[matchId]?.[team]
    if (!pick) continue
    
    const isCorrect = pick.winner === result.winner
    
    // Exact score check
    let isExact = false
    if (result.score !== 'RET' && result.score !== 'WO' && pick.home_score !== null) {
      const [h, a] = result.score.split('-').map(Number)
      isExact = (pick.home_score === h && pick.away_score === a)
    }
    
    if (isExact) {
      exact[team]++
      scores[team] += 6
    } else if (isCorrect) {
      correct[team]++
      scores[team] += 1
    }
  }
}

console.log('\n=== Day 3 (R2) Points ===\n')
for (const team of ['OPAA', '😁', 'RiverPlateSV']) {
  console.log(`${team}:`)
  console.log(`  Correct: ${correct[team]} × 1pt = ${correct[team]}`)
  console.log(`  Exact: ${exact[team]} × 6pt = ${exact[team] * 6}`)
  console.log(`  Day 3 Total: ${scores[team]} pts`)
  console.log()
}

console.log('\n=== Updated Leaderboard ===')
const day2 = { 'OPAA': 99, '😁': 112, 'RiverPlateSV': 96 }
const totals = []
for (const team of Object.keys(day2)) {
  totals.push({ team, total: day2[team] + scores[team], d2: day2[team], d3: scores[team] })
}
totals.sort((a, b) => b.total - a.total)
console.log('\n| Rank | Team | Through D2 | Day 3 | Total |')
console.log('|------|------|------------|-------|-------|')
totals.forEach((t, i) => {
  const medal = ['🥇', '🥈', '🥉'][i] || ''
  console.log(`| ${medal} | ${t.team} | ${t.d2} | +${t.d3} | ${t.total} |`)
})
