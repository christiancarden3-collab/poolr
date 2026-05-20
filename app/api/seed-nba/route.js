import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // First, ensure we have NBA teams
  const nbaTeams = [
    { id: 'okc-thunder', name: 'Oklahoma City Thunder', code: 'OKC', group_name: 'Western Conference' },
    { id: 'sa-spurs', name: 'San Antonio Spurs', code: 'SAS', group_name: 'Western Conference' },
  ]

  for (const team of nbaTeams) {
    await supabase.from('teams').upsert(team, { onConflict: 'id' })
  }

  // Add NBA Western Conference Finals Game 2
  const nbaMatch = {
    id: 'nba-wcf-2026-g2',
    tournament_id: 'nba2026',
    matchday: 1,
    match_number: 1,
    home_team_id: 'sa-spurs',
    away_team_id: 'okc-thunder',
    match_time: new Date('2026-05-20T21:00:00-04:00').toISOString(), // 9 PM ET tonight
    venue: 'AT&T Center, San Antonio',
    stage: 'Western Conference Finals',
    status: 'scheduled',
  }

  const { data, error } = await supabase
    .from('matches')
    .upsert(nbaMatch, { onConflict: 'id' })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    message: 'NBA WCF Game 2 seeded!',
    match: nbaMatch,
    teams: nbaTeams
  })
}
