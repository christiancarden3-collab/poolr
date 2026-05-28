// Day 2 Results Calculator
// Actual results from SofaScore (May 25-26)

const DAY2_RESULTS = {
  'rg2-1': { winner: 'home', score: '3-2' },  // Walton beat Medvedev (UPSET!)
  'rg2-2': { winner: 'home', score: '3-0' },  // Tabilo beat Majchrzak
  'rg2-3': { winner: 'away', score: '3-0' },  // Jódar beat Kovacevic  
  'rg2-4': { winner: 'home', score: '3-0' },  // de Minaur beat Samuel
  'rg2-5': { winner: 'away', score: '3-1' },  // Struff beat Bublik
  'rg2-6': { winner: 'away', score: '3-0' },  // Michelsen beat Shevchenko
  'rg2-7': { winner: 'away', score: 'RET' },  // Tsitsipas beat Muller (ret)
  'rg2-8': { winner: 'away', score: '3-1' },  // Svajda beat Popyrin
  'rg2-9': { winner: 'home', score: '3-0' },  // Rinderknech beat Rodionov
  'rg2-10': { winner: 'away', score: 'RET' }, // Vallejo beat Norrie (ret)
  'rg2-11': { winner: 'home', score: '3-2' }, // Ruud beat Safiullin
  'rg2-12': { winner: 'away', score: '3-0' }, // Tien beat Garin
  'rg2-13': { winner: 'away', score: '3-0' }, // Shelton beat Merida
  'rg2-14': { winner: 'away', score: '3-1' }, // Tiafoe beat Spizzirri
  'rg2-15': { winner: 'away', score: '3-0' }, // Ugo Carabelli beat Nava
  'rg2-16': { winner: 'away', score: '3-0' }, // Comesaña beat Quinn
  'rg2-17': { winner: 'home', score: '3-0' }, // Diaz Acosta beat Zhang
  'rg2-18': { winner: 'home', score: '3-2' }, // Auger-Aliassime beat Altmaier
  'rg2-19': { winner: 'home', score: '3-0' }, // Cobolli beat Pellegrino
  'rg2-20': { winner: 'home', score: '3-1' }, // Cerundolo beat Van de Zandschulp
  'rg2-21': { winner: 'home', score: '3-2' }, // Gaston beat Monfils
  'rg2-22': { winner: 'away', score: '3-1' }, // Rublev beat Buse
  'rg2-23': { winner: 'away', score: '3-0' }, // J. Cerundolo beat Fearnley
  'rg2-24': { winner: 'home', score: '3-0' }, // Faria beat Shapovalov
  'rg2-25': { winner: 'away', score: '3-1' }, // Hurkacz beat Munar
  'rg2-26': { winner: 'home', score: '3-1' }, // Van Assche beat Gaubas
  'rg2-27': { winner: 'home', score: '3-0' }, // Navone beat Brooksby
  'rg2-28': { winner: 'away', score: '3-0' }, // Kouame beat Čilić
  'rg2-29': { winner: 'home', score: '3-2' }, // Landaluce beat Prado Angelo
  'rg2-30': { winner: 'away', score: '3-1' }, // Berrettini beat Fucsovics
  'rg2-31': { winner: 'home', score: '3-0' }, // Carreño Busta beat Lehečka
  'rg2-32': { winner: 'home', score: '3-0' }, // Collignon beat Vukić
  'rg2-33': { winner: 'away', score: '3-1' }, // Paul beat Hijikata
  'rg2-34': { winner: 'away', score: '3-0' }, // Nakashima beat Bautista Agut
  'rg2-35': { winner: 'away', score: '3-0' }, // Darderi beat Ofner
  'rg2-36': { winner: 'away', score: 'RET' }, // Burruchaga beat Báez (ret)
  'rg2-37': { winner: 'skip', score: 'CANCELED' }, // Wawrinka vs Fils canceled
  'rg2-38': { winner: 'away', score: '3-1' }, // Arnaldi beat Griekspoor
  'rg2-39': { winner: 'home', score: '3-2' }, // Kokkinakis beat Atmane
  'rg2-40': { winner: 'away', score: '3-1' }, // Vacherot beat Faurel
  'rg2-41': { winner: 'home', score: '3-0' }, // Humbert beat Mannarino
  'rg2-42': { winner: 'home', score: '3-2' }, // Kopřiva beat Moutet
  'rg2-43': { winner: 'home', score: '3-0' }, // Wu beat Giron
  'rg2-44': { winner: 'home', score: '3-0' }, // Sinner beat Tabur
}

const USERS = {
  '59edbae3-dae0-4945-8ca5-7ea2adbe8621': 'OPAA',
  '7abc3086-59b6-4af8-a964-90875c76e01a': '😁',
  '36de178e-0bbe-4651-957d-45f91af161de': 'RiverPlateSV'
}

// Picks from database
const picks = JSON.parse(process.argv[2] || '[]')

const scores = { 'OPAA': 0, '😁': 0, 'RiverPlateSV': 0 }
const details = { 'OPAA': [], '😁': [], 'RiverPlateSV': [] }

for (const pick of picks) {
  const result = DAY2_RESULTS[pick.match_id]
  if (!result || result.winner === 'skip') continue
  
  const team = USERS[pick.user_id]
  const correct = pick.winner === result.winner
  
  // Check for exact score
  let exactScore = false
  if (result.score !== 'RET' && pick.home_score !== null) {
    const [h, a] = result.score.split('-').map(Number)
    exactScore = (pick.home_score === h && pick.away_score === a)
  }
  
  let pts = 0
  if (exactScore) pts = 6
  else if (correct) pts = 1
  
  scores[team] += pts
  if (pts > 0) {
    details[team].push(`${pick.match_id}: ${pts}pt`)
  }
}

console.log('\\n=== Day 2 Points ===')
for (const [team, pts] of Object.entries(scores)) {
  console.log(`${team}: +${pts} pts`)
}
console.log('\\nTotal with Day 1:')
const day1 = { 'OPAA': 25, '😁': 38, 'RiverPlateSV': 22 }
for (const [team, d1] of Object.entries(day1)) {
  console.log(`${team}: ${d1} + ${scores[team]} = ${d1 + scores[team]}`)
}
