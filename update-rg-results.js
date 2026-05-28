// Update Roland Garros R2 (Round of 64) match results
// Run with: node update-rg-results.js

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTE0MTYyNiwiZXhwIjoyMDk0NzE3NjI2fQ.phNsgmfw7mmJltNBspCK4C9djgvMlex7rFI9or2QuxM'

// R2 (Round of 64) Results from SofaScore - May 26, 2026
// Format: { home: player1, away: player2, homeWins: sets won by home, awayWins: sets won by away }
const r2Results = [
  // These are the R2 matches scheduled in the DB that now have results
  { home: "T. Machac", homeWins: 0, away: "A. Zverev", awayWins: 3, status: "upcoming" }, // Tomorrow
  { home: "A. Davidovich Fokina", homeWins: 0, away: "T. Tirante", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "K. Khachanov", homeWins: 0, away: "M. Trungelliti", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "F. Cina", homeWins: 0, away: "J. De Jong", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "C. Ugo Carabelli", homeWins: 0, away: "A. Rublev", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "M. Navone", homeWins: 0, away: "J. Mensik", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "J. Duckworth", homeWins: 0, away: "R. Jodar", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "N. Borges", homeWins: 0, away: "M. Kecmanovic", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "T. Kokkinakis", homeWins: 0, away: "P. Carreno Busta", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "J. Fonseca", homeWins: 0, away: "D. Prizmic", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "U. Humbert", homeWins: 0, away: "Q. Halys", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "V. Royer", homeWins: 0, away: "N. Djokovic", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "N. Basavareddy", homeWins: 0, away: "A. Michelsen", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "C. Ruud", homeWins: 0, away: "H. Medjedovic", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "L. Sonego", homeWins: 0, away: "T. Paul", awayWins: 0, status: "upcoming" }, // Tomorrow
  { home: "A. de Minaur", homeWins: 0, away: "A. Blockx", awayWins: 0, status: "upcoming" }, // Tomorrow
]

// Note: R2 matches are for TOMORROW (May 27). R1 is already done but those matches
// were different (first round matchups like Sinner vs Tabur, etc.)

async function updateResults() {
  console.log('Fetching current matches from database...')
  
  // Get all matches
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/matches?select=*`,
    {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    }
  )
  
  const matches = await response.json()
  console.log(`Found ${matches.length} matches in database`)
  
  // Find tennis matches (they have player names like "J. Sinner")
  const tennisMatches = matches.filter(m => 
    m.home_team_name && (
      m.home_team_name.includes('.') || 
      m.home_team_name.match(/^[A-Z]\. [A-Z]/)
    )
  )
  
  console.log(`Found ${tennisMatches.length} tennis matches`)
  console.log('\nTennis matches in DB:')
  tennisMatches.forEach(m => {
    console.log(`  ${m.home_team_name} vs ${m.away_team_name} - Status: ${m.status}`)
  })
  
  // Note: The matches in DB are R2 (Round of 64) - they haven't played yet!
  // R1 (Round of 128) has finished but those were different matchups
  console.log('\n⚠️ These are ROUND OF 64 matches scheduled for tomorrow (May 27)')
  console.log('R1 (Round of 128) has already completed - those were different matchups.')
  console.log('\nTo update the leaderboard, we need to:')
  console.log('1. Check if R1 matches exist in DB (or need to be seeded)')
  console.log('2. Enter R1 results to calculate Day 1-2 points')
}

updateResults().catch(console.error)
