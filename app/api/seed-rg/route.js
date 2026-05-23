import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Roland Garros 2026 Test Matches (May 24 - May 31)
const RG_MATCHES = [
  // Sunday May 24 - Round of 16
  { id: 'rg-r16-1', round: 'R16', matchday: 1, player1: { name: 'Carlos Alcaraz', country: 'es' }, player2: { name: 'Holger Rune', country: 'dk' }, date: 'May 24', time: '11:00 AM ET', status: 'scheduled' },
  { id: 'rg-r16-2', round: 'R16', matchday: 1, player1: { name: 'Jannik Sinner', country: 'it' }, player2: { name: 'Ben Shelton', country: 'us' }, date: 'May 24', time: '1:00 PM ET', status: 'scheduled' },
  { id: 'rg-r16-3', round: 'R16', matchday: 1, player1: { name: 'Novak Djokovic', country: 'rs' }, player2: { name: 'Alex de Minaur', country: 'au' }, date: 'May 24', time: '3:00 PM ET', status: 'scheduled' },
  { id: 'rg-r16-4', round: 'R16', matchday: 1, player1: { name: 'Daniil Medvedev', country: 'ru' }, player2: { name: 'Taylor Fritz', country: 'us' }, date: 'May 24', time: '5:00 PM ET', status: 'scheduled' },
  
  // Monday May 25 - Round of 16
  { id: 'rg-r16-5', round: 'R16', matchday: 2, player1: { name: 'Alexander Zverev', country: 'de' }, player2: { name: 'Casper Ruud', country: 'no' }, date: 'May 25', time: '11:00 AM ET', status: 'scheduled' },
  { id: 'rg-r16-6', round: 'R16', matchday: 2, player1: { name: 'Stefanos Tsitsipas', country: 'gr' }, player2: { name: 'Hubert Hurkacz', country: 'pl' }, date: 'May 25', time: '1:00 PM ET', status: 'scheduled' },
  { id: 'rg-r16-7', round: 'R16', matchday: 2, player1: { name: 'Andrey Rublev', country: 'ru' }, player2: { name: 'Frances Tiafoe', country: 'us' }, date: 'May 25', time: '3:00 PM ET', status: 'scheduled' },
  { id: 'rg-r16-8', round: 'R16', matchday: 2, player1: { name: 'Tommy Paul', country: 'us' }, player2: { name: 'Lorenzo Musetti', country: 'it' }, date: 'May 25', time: '5:00 PM ET', status: 'scheduled' },

  // Tuesday May 26 - Quarterfinals
  { id: 'rg-qf-1', round: 'QF', matchday: 3, player1: { name: 'TBD (R16-1 Winner)', country: 'xx' }, player2: { name: 'TBD (R16-2 Winner)', country: 'xx' }, date: 'May 26', time: '12:00 PM ET', status: 'scheduled' },
  { id: 'rg-qf-2', round: 'QF', matchday: 3, player1: { name: 'TBD (R16-3 Winner)', country: 'xx' }, player2: { name: 'TBD (R16-4 Winner)', country: 'xx' }, date: 'May 26', time: '3:00 PM ET', status: 'scheduled' },

  // Wednesday May 27 - Quarterfinals
  { id: 'rg-qf-3', round: 'QF', matchday: 4, player1: { name: 'TBD (R16-5 Winner)', country: 'xx' }, player2: { name: 'TBD (R16-6 Winner)', country: 'xx' }, date: 'May 27', time: '12:00 PM ET', status: 'scheduled' },
  { id: 'rg-qf-4', round: 'QF', matchday: 4, player1: { name: 'TBD (R16-7 Winner)', country: 'xx' }, player2: { name: 'TBD (R16-8 Winner)', country: 'xx' }, date: 'May 27', time: '3:00 PM ET', status: 'scheduled' },

  // Thursday May 28 - Semifinals
  { id: 'rg-sf-1', round: 'SF', matchday: 5, player1: { name: 'TBD (QF-1 Winner)', country: 'xx' }, player2: { name: 'TBD (QF-2 Winner)', country: 'xx' }, date: 'May 28', time: '12:00 PM ET', status: 'scheduled' },
  
  // Friday May 29 - Semifinals
  { id: 'rg-sf-2', round: 'SF', matchday: 6, player1: { name: 'TBD (QF-3 Winner)', country: 'xx' }, player2: { name: 'TBD (QF-4 Winner)', country: 'xx' }, date: 'May 29', time: '12:00 PM ET', status: 'scheduled' },

  // Sunday May 31 - Final
  { id: 'rg-final', round: 'F', matchday: 7, player1: { name: 'TBD (SF-1 Winner)', country: 'xx' }, player2: { name: 'TBD (SF-2 Winner)', country: 'xx' }, date: 'May 31', time: '9:00 AM ET', status: 'scheduled' },
]

// Women's matches
const RG_MATCHES_WOMEN = [
  // Sunday May 24
  { id: 'rg-w-r16-1', round: 'R16', matchday: 1, player1: { name: 'Iga Swiatek', country: 'pl' }, player2: { name: 'Ons Jabeur', country: 'tn' }, date: 'May 24', time: '10:00 AM ET', status: 'scheduled' },
  { id: 'rg-w-r16-2', round: 'R16', matchday: 1, player1: { name: 'Aryna Sabalenka', country: 'by' }, player2: { name: 'Emma Navarro', country: 'us' }, date: 'May 24', time: '2:00 PM ET', status: 'scheduled' },
  
  // Monday May 25
  { id: 'rg-w-r16-3', round: 'R16', matchday: 2, player1: { name: 'Coco Gauff', country: 'us' }, player2: { name: 'Jessica Pegula', country: 'us' }, date: 'May 25', time: '10:00 AM ET', status: 'scheduled' },
  { id: 'rg-w-r16-4', round: 'R16', matchday: 2, player1: { name: 'Elena Rybakina', country: 'kz' }, player2: { name: 'Qinwen Zheng', country: 'cn' }, date: 'May 25', time: '2:00 PM ET', status: 'scheduled' },

  // Tuesday May 26 - QF
  { id: 'rg-w-qf-1', round: 'QF', matchday: 3, player1: { name: 'TBD', country: 'xx' }, player2: { name: 'TBD', country: 'xx' }, date: 'May 26', time: '10:00 AM ET', status: 'scheduled' },
  { id: 'rg-w-qf-2', round: 'QF', matchday: 3, player1: { name: 'TBD', country: 'xx' }, player2: { name: 'TBD', country: 'xx' }, date: 'May 26', time: '1:00 PM ET', status: 'scheduled' },

  // Thursday May 28 - SF
  { id: 'rg-w-sf-1', round: 'SF', matchday: 5, player1: { name: 'TBD', country: 'xx' }, player2: { name: 'TBD', country: 'xx' }, date: 'May 28', time: '10:00 AM ET', status: 'scheduled' },
  { id: 'rg-w-sf-2', round: 'SF', matchday: 5, player1: { name: 'TBD', country: 'xx' }, player2: { name: 'TBD', country: 'xx' }, date: 'May 28', time: '2:00 PM ET', status: 'scheduled' },

  // Saturday May 30 - Final
  { id: 'rg-w-final', round: 'F', matchday: 6, player1: { name: 'TBD', country: 'xx' }, player2: { name: 'TBD', country: 'xx' }, date: 'May 30', time: '9:00 AM ET', status: 'scheduled' },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const draw = searchParams.get('draw') || 'men' // 'men' or 'women' or 'both'

    let matches = []
    if (draw === 'men' || draw === 'both') {
      matches = [...matches, ...RG_MATCHES]
    }
    if (draw === 'women' || draw === 'both') {
      matches = [...matches, ...RG_MATCHES_WOMEN]
    }

    return NextResponse.json({
      tournament: 'Roland Garros 2026',
      testPeriod: 'May 24 - May 31, 2026',
      draw,
      matchCount: matches.length,
      matches,
      scoringRules: {
        correctWinner: '1 point',
        correctSetScore: '2 bonus points (e.g., predicting 3-1 sets)',
        exactScore: '3 bonus points (predicting exact game scores - optional)',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Seed matches to database (if using DB for matches)
export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { draw = 'men' } = await request.json()

    let matches = []
    if (draw === 'men' || draw === 'both') {
      matches = [...matches, ...RG_MATCHES]
    }
    if (draw === 'women' || draw === 'both') {
      matches = [...matches, ...RG_MATCHES_WOMEN]
    }

    // For now just return the matches - can insert to DB if needed
    return NextResponse.json({
      success: true,
      tournament: 'rg2026',
      seeded: matches.length,
      matches,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
