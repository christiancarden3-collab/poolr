// Day 2 Results Calculator - DETAILED
const DAY2_RESULTS = {
  'rg2-1': { winner: 'home', score: '3-2' },  // Walton beat Medvedev (UPSET!)
  'rg2-2': { winner: 'home', score: '3-0' },  // Tabilo
  'rg2-3': { winner: 'away', score: '3-0' },  // Jódar
  'rg2-4': { winner: 'home', score: '3-0' },  // de Minaur
  'rg2-5': { winner: 'away', score: '3-1' },  // Struff beat Bublik
  'rg2-6': { winner: 'away', score: '3-0' },  // Michelsen
  'rg2-7': { winner: 'away', score: 'RET' },  // Tsitsipas (ret)
  'rg2-8': { winner: 'away', score: '3-1' },  // Svajda beat Popyrin
  'rg2-9': { winner: 'home', score: '3-0' },  // Rinderknech
  'rg2-10': { winner: 'away', score: 'RET' }, // Vallejo beat Norrie (ret)
  'rg2-11': { winner: 'home', score: '3-2' }, // Ruud
  'rg2-12': { winner: 'away', score: '3-0' }, // Tien
  'rg2-13': { winner: 'away', score: '3-0' }, // Shelton
  'rg2-14': { winner: 'away', score: '3-1' }, // Tiafoe
  'rg2-15': { winner: 'away', score: '3-0' }, // Ugo Carabelli
  'rg2-16': { winner: 'away', score: '3-0' }, // Comesaña
  'rg2-17': { winner: 'home', score: '3-0' }, // Diaz Acosta
  'rg2-18': { winner: 'home', score: '3-2' }, // Auger-Aliassime
  'rg2-19': { winner: 'home', score: '3-0' }, // Cobolli
  'rg2-20': { winner: 'home', score: '3-1' }, // Cerundolo
  'rg2-21': { winner: 'home', score: '3-2' }, // Gaston
  'rg2-22': { winner: 'away', score: '3-1' }, // Rublev
  'rg2-23': { winner: 'away', score: '3-0' }, // J. Cerundolo
  'rg2-24': { winner: 'home', score: '3-0' }, // Faria beat Shapovalov
  'rg2-25': { winner: 'away', score: '3-1' }, // Hurkacz
  'rg2-26': { winner: 'home', score: '3-1' }, // Van Assche
  'rg2-27': { winner: 'home', score: '3-0' }, // Navone
  'rg2-28': { winner: 'away', score: '3-0' }, // Kouame beat Čilić
  'rg2-29': { winner: 'home', score: '3-2' }, // Landaluce
  'rg2-30': { winner: 'away', score: '3-1' }, // Berrettini
  'rg2-31': { winner: 'home', score: '3-0' }, // Carreño Busta
  'rg2-32': { winner: 'home', score: '3-0' }, // Collignon
  'rg2-33': { winner: 'away', score: '3-1' }, // Paul
  'rg2-34': { winner: 'away', score: '3-0' }, // Nakashima
  'rg2-35': { winner: 'away', score: '3-0' }, // Darderi
  'rg2-36': { winner: 'away', score: 'RET' }, // Burruchaga (ret)
  'rg2-37': { winner: 'skip', score: 'CANCELED' }, // Wawrinka canceled
  'rg2-38': { winner: 'away', score: '3-1' }, // Arnaldi
  'rg2-39': { winner: 'home', score: '3-2' }, // Kokkinakis
  'rg2-40': { winner: 'away', score: '3-1' }, // Vacherot
  'rg2-41': { winner: 'home', score: '3-0' }, // Humbert
  'rg2-42': { winner: 'home', score: '3-2' }, // Kopřiva
  'rg2-43': { winner: 'home', score: '3-0' }, // Wu
  'rg2-44': { winner: 'home', score: '3-0' }, // Sinner
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
const wrong = { 'OPAA': [], '😁': [], 'RiverPlateSV': [] }
const exactMatches = { 'OPAA': [], '😁': [], 'RiverPlateSV': [] }

// Group by match
const byMatch = {}
for (const p of picks) {
  if (!byMatch[p.match_id]) byMatch[p.match_id] = {}
  byMatch[p.match_id][USERS[p.user_id]] = p
}

// Calculate
for (const matchId of Object.keys(DAY2_RESULTS).sort()) {
  const result = DAY2_RESULTS[matchId]
  if (result.winner === 'skip') continue
  
  for (const team of ['OPAA', '😁', 'RiverPlateSV']) {
    const pick = byMatch[matchId]?.[team]
    if (!pick) continue
    
    const isCorrect = pick.winner === result.winner
    
    // Exact score check
    let isExact = false
    if (result.score !== 'RET' && pick.home_score !== null) {
      const [h, a] = result.score.split('-').map(Number)
      isExact = (pick.home_score === h && pick.away_score === a)
    }
    
    if (isExact) {
      exact[team]++
      scores[team] += 6
      exactMatches[team].push(matchId)
    } else if (isCorrect) {
      correct[team]++
      scores[team] += 1
    } else {
      wrong[team].push(matchId)
    }
  }
}

console.log('\n=== Day 2 Detailed Results ===\n')
for (const team of ['OPAA', '😁', 'RiverPlateSV']) {
  console.log(`${team}:`)
  console.log(`  Correct winner: ${correct[team]} × 1pt = ${correct[team]}`)
  console.log(`  Exact scores: ${exact[team]} × 6pt = ${exact[team] * 6}`)
  console.log(`  TOTAL: ${scores[team]} pts`)
  if (exactMatches[team].length) console.log(`  Exact: ${exactMatches[team].join(', ')}`)
  console.log(`  Wrong: ${wrong[team].length} matches`)
  console.log()
}

console.log('\n=== Updated Leaderboard ===')
const day1 = { 'OPAA': 25, '😁': 38, 'RiverPlateSV': 22 }
const totals = []
for (const team of Object.keys(day1)) {
  totals.push({ team, total: day1[team] + scores[team], d1: day1[team], d2: scores[team] })
}
totals.sort((a, b) => b.total - a.total)
console.log('\n| Rank | Team | Day 1 | Day 2 | Total |')
console.log('|------|------|-------|-------|-------|')
totals.forEach((t, i) => {
  const medal = ['🥇', '🥈', '🥉'][i] || ''
  console.log(`| ${medal} | ${t.team} | ${t.d1} | ${t.d2} | ${t.total} |`)
})
