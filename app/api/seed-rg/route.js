import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Roland Garros 2026 - Round of 64 (labeled as R32 Day 1 & 2 for the pool)
const RG_MATCHES = [
  // ============================================
  // R32 DAY 1 - Tuesday May 27, 2026 (16 matches)
  // ============================================
  { id: 'rg-r32d1-01', round: 'R32', matchday: 1, player1: { name: 'A. Davidovich Fokina', country: 'es' }, player2: { name: 'T. Tirante', country: 'ar' }, date: 'May 27', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-02', round: 'R32', matchday: 1, player1: { name: 'A. de Minaur', country: 'au' }, player2: { name: 'A. Blockx', country: 'be' }, date: 'May 27', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-03', round: 'R32', matchday: 1, player1: { name: 'F. Cinà', country: 'it' }, player2: { name: 'J. De Jong', country: 'nl' }, date: 'May 27', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-04', round: 'R32', matchday: 1, player1: { name: 'K. Khachanov', country: 'ru' }, player2: { name: 'M. Trungelliti', country: 'ar' }, date: 'May 27', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-05', round: 'R32', matchday: 1, player1: { name: 'C. Ugo Carabelli', country: 'ar' }, player2: { name: 'A. Rublev', country: 'ru' }, date: 'May 27', time: '5:10 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-06', round: 'R32', matchday: 1, player1: { name: 'M. Navone', country: 'ar' }, player2: { name: 'J. Menšik', country: 'cz' }, date: 'May 27', time: '5:40 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-07', round: 'R32', matchday: 1, player1: { name: 'J. Duckworth', country: 'au' }, player2: { name: 'R. Jódar', country: 'es' }, date: 'May 27', time: '6:20 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-08', round: 'R32', matchday: 1, player1: { name: 'N. Borges', country: 'pt' }, player2: { name: 'M. Kecmanović', country: 'rs' }, date: 'May 27', time: '6:20 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-09', round: 'R32', matchday: 1, player1: { name: 'T. Kokkinakis', country: 'au' }, player2: { name: 'P. Carreño Busta', country: 'es' }, date: 'May 27', time: '6:20 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-10', round: 'R32', matchday: 1, player1: { name: 'J. Fonseca', country: 'br' }, player2: { name: 'D. Prižmić', country: 'hr' }, date: 'May 27', time: '6:50 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-11', round: 'R32', matchday: 1, player1: { name: 'U. Humbert', country: 'fr' }, player2: { name: 'Q. Halys', country: 'fr' }, date: 'May 27', time: '6:50 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-12', round: 'R32', matchday: 1, player1: { name: 'V. Royer', country: 'fr' }, player2: { name: 'N. Djokovic', country: 'rs' }, date: 'May 27', time: '7:20 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-13', round: 'R32', matchday: 1, player1: { name: 'N. Basavareddy', country: 'us' }, player2: { name: 'A. Michelsen', country: 'us' }, date: 'May 27', time: '7:50 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-14', round: 'R32', matchday: 1, player1: { name: 'C. Ruud', country: 'no' }, player2: { name: 'H. Medjedović', country: 'rs' }, date: 'May 27', time: '8:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-15', round: 'R32', matchday: 1, player1: { name: 'L. Sonego', country: 'it' }, player2: { name: 'T. Paul', country: 'us' }, date: 'May 27', time: '8:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d1-16', round: 'R32', matchday: 1, player1: { name: 'T. Machač', country: 'cz' }, player2: { name: 'A. Zverev', country: 'de' }, date: 'May 27', time: '1:15 PM CDT', status: 'scheduled' },

  // ============================================
  // R32 DAY 2 - Wednesday May 28, 2026 (16 matches)
  // ============================================
  { id: 'rg-r32d2-01', round: 'R32', matchday: 2, player1: { name: 'A. Vallejo', country: 'py' }, player2: { name: 'M. Kouamé', country: 'fr' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-02', round: 'R32', matchday: 2, player1: { name: 'A. Tabilo', country: 'cl' }, player2: { name: 'V. Vacherot', country: 'mc' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-03', round: 'R32', matchday: 2, player1: { name: 'A. Rinderknech', country: 'fr' }, player2: { name: 'M. Berrettini', country: 'it' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-04', round: 'R32', matchday: 2, player1: { name: 'F. Diaz Acosta', country: 'ar' }, player2: { name: 'L. Tien', country: 'us' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-05', round: 'R32', matchday: 2, player1: { name: 'F. Auger-Aliassime', country: 'ca' }, player2: { name: 'R. Burruchaga', country: 'ar' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-06', round: 'R32', matchday: 2, player1: { name: 'F. Cobolli', country: 'it' }, player2: { name: 'Y. Wu', country: 'cn' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-07', round: 'R32', matchday: 2, player1: { name: 'F. Cerundolo', country: 'ar' }, player2: { name: 'H. Gaston', country: 'fr' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-08', round: 'R32', matchday: 2, player1: { name: 'F. Comesaña', country: 'ar' }, player2: { name: 'L. Darderi', country: 'it' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-09', round: 'R32', matchday: 2, player1: { name: 'H. Hurkacz', country: 'pl' }, player2: { name: 'F. Tiafoe', country: 'us' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-10', round: 'R32', matchday: 2, player1: { name: 'J. Struff', country: 'de' }, player2: { name: 'J. Faria', country: 'pt' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-11', round: 'R32', matchday: 2, player1: { name: 'J. Sinner', country: 'it' }, player2: { name: 'J. Cerundolo', country: 'ar' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-12', round: 'R32', matchday: 2, player1: { name: 'L. Van Assche', country: 'fr' }, player2: { name: 'B. Nakashima', country: 'us' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-13', round: 'R32', matchday: 2, player1: { name: 'M. Landaluce', country: 'es' }, player2: { name: 'V. Kopřiva', country: 'cz' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-14', round: 'R32', matchday: 2, player1: { name: 'M. Arnaldi', country: 'it' }, player2: { name: 'S. Tsitsipas', country: 'gr' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-15', round: 'R32', matchday: 2, player1: { name: 'R. Collignon', country: 'be' }, player2: { name: 'B. Shelton', country: 'us' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
  { id: 'rg-r32d2-16', round: 'R32', matchday: 2, player1: { name: 'Z. Svajda', country: 'us' }, player2: { name: 'A. Walton', country: 'au' }, date: 'May 28', time: '4:00 AM CDT', status: 'scheduled' },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const matchday = searchParams.get('matchday')
    
    let matches = RG_MATCHES
    if (matchday) {
      matches = matches.filter(m => m.matchday === parseInt(matchday))
    }

    return NextResponse.json({
      tournament: 'Roland Garros 2026',
      round: 'Round of 64 (R32 Day 1 & 2)',
      matchCount: matches.length,
      matches,
      scoringRules: {
        correctWinner: '1 point',
        upset: 'Bonus points for calling upsets'
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Seed matches to database
export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json().catch(() => ({}))
    const { matchday } = body

    let matches = RG_MATCHES
    if (matchday) {
      matches = matches.filter(m => m.matchday === parseInt(matchday))
    }

    // Get or create RG tournament
    let { data: tournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', 'roland-garros-2026')
      .single()

    if (!tournament) {
      const { data: newTournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          name: 'Roland Garros 2026',
          slug: 'roland-garros-2026',
          start_date: '2026-05-25',
          end_date: '2026-06-08',
          status: 'active',
          config: {
            sport: 'tennis',
            scoring: {
              correct_winner: 1,
              upset_bonus: 2
            }
          }
        })
        .select('id')
        .single()
      
      if (tournamentError) throw tournamentError
      tournament = newTournament
    }

    // Delete existing R32 matches for clean slate
    await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournament.id)
      .in('matchday', matchday ? [parseInt(matchday)] : [1, 2])

    // Insert matches
    const matchesToInsert = matches.map(m => ({
      tournament_id: tournament.id,
      matchday: m.matchday,
      stage: 'round_of_32',
      home_team_name: m.player1.name,
      away_team_name: m.player2.name,
      home_flag: m.player1.country,
      away_flag: m.player2.country,
      match_time: parseMatchTime(m.date, m.time),
      status: 'scheduled'
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      tournament: 'roland-garros-2026',
      seeded: inserted.length,
      matches: inserted
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Helper to parse match time
function parseMatchTime(dateStr, timeStr) {
  // dateStr: "May 27", timeStr: "4:00 AM CDT"
  const year = 2026
  const monthMap = { 'May': 4, 'Jun': 5, 'Jul': 6 }
  const [month, day] = dateStr.split(' ')
  const monthNum = monthMap[month]
  
  // Parse time
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!timeMatch) return new Date(`${year}-${String(monthNum + 1).padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00Z`)
  
  let [, hours, minutes, ampm] = timeMatch
  hours = parseInt(hours)
  if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12
  if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0
  
  // CDT is UTC-5
  const utcHours = hours + 5
  
  return new Date(Date.UTC(year, monthNum, parseInt(day), utcHours, parseInt(minutes)))
}
