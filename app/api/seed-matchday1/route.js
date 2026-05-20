import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Matchday 1 - Official FIFA Schedule
const matchday1Data = {
  matchday: 1,
  matches: [
    { date: "2026-06-11", homeTeam: "Mexico", awayTeam: "South Africa", homeFlag: "mx", awayFlag: "za", group: "A", venue: "Mexico City Stadium", city: "Mexico City" },
    { date: "2026-06-11", homeTeam: "Korea Republic", awayTeam: "Czechia", homeFlag: "kr", awayFlag: "cz", group: "A", venue: "Estadio Guadalajara", city: "Guadalajara" },
    { date: "2026-06-12", homeTeam: "Canada", awayTeam: "Bosnia and Herzegovina", homeFlag: "ca", awayFlag: "ba", group: "B", venue: "BMO Field", city: "Toronto" },
    { date: "2026-06-12", homeTeam: "USA", awayTeam: "Paraguay", homeFlag: "us", awayFlag: "py", group: "D", venue: "SoFi Stadium", city: "Los Angeles" },
    { date: "2026-06-13", homeTeam: "Haiti", awayTeam: "Scotland", homeFlag: "ht", awayFlag: "gb-sct", group: "C", venue: "Gillette Stadium", city: "Boston" },
    { date: "2026-06-13", homeTeam: "Australia", awayTeam: "Türkiye", homeFlag: "au", awayFlag: "tr", group: "D", venue: "BC Place", city: "Vancouver" },
    { date: "2026-06-13", homeTeam: "Brazil", awayTeam: "Morocco", homeFlag: "br", awayFlag: "ma", group: "C", venue: "MetLife Stadium", city: "New York/New Jersey" },
    { date: "2026-06-13", homeTeam: "Qatar", awayTeam: "Switzerland", homeFlag: "qa", awayFlag: "ch", group: "B", venue: "Levi's Stadium", city: "San Francisco" },
    { date: "2026-06-14", homeTeam: "Côte d'Ivoire", awayTeam: "Ecuador", homeFlag: "ci", awayFlag: "ec", group: "E", venue: "Lincoln Financial Field", city: "Philadelphia" },
    { date: "2026-06-14", homeTeam: "Germany", awayTeam: "Curaçao", homeFlag: "de", awayFlag: "cw", group: "E", venue: "NRG Stadium", city: "Houston" },
    { date: "2026-06-14", homeTeam: "Netherlands", awayTeam: "Japan", homeFlag: "nl", awayFlag: "jp", group: "F", venue: "AT&T Stadium", city: "Dallas" },
    { date: "2026-06-14", homeTeam: "Sweden", awayTeam: "Tunisia", homeFlag: "se", awayFlag: "tn", group: "F", venue: "Estadio Monterrey", city: "Monterrey" },
    { date: "2026-06-15", homeTeam: "Saudi Arabia", awayTeam: "Uruguay", homeFlag: "sa", awayFlag: "uy", group: "H", venue: "Hard Rock Stadium", city: "Miami" },
    { date: "2026-06-15", homeTeam: "Spain", awayTeam: "Cabo Verde", homeFlag: "es", awayFlag: "cv", group: "H", venue: "Mercedes-Benz Stadium", city: "Atlanta" },
    { date: "2026-06-15", homeTeam: "IR Iran", awayTeam: "New Zealand", homeFlag: "ir", awayFlag: "nz", group: "G", venue: "SoFi Stadium", city: "Los Angeles" },
    { date: "2026-06-15", homeTeam: "Belgium", awayTeam: "Egypt", homeFlag: "be", awayFlag: "eg", group: "G", venue: "Lumen Field", city: "Seattle" },
    { date: "2026-06-16", homeTeam: "France", awayTeam: "Senegal", homeFlag: "fr", awayFlag: "sn", group: "I", venue: "MetLife Stadium", city: "New York/New Jersey" },
    { date: "2026-06-16", homeTeam: "Iraq", awayTeam: "Norway", homeFlag: "iq", awayFlag: "no", group: "I", venue: "Gillette Stadium", city: "Boston" },
    { date: "2026-06-16", homeTeam: "Argentina", awayTeam: "Algeria", homeFlag: "ar", awayFlag: "dz", group: "J", venue: "Arrowhead Stadium", city: "Kansas City" },
    { date: "2026-06-16", homeTeam: "Austria", awayTeam: "Jordan", homeFlag: "at", awayFlag: "jo", group: "J", venue: "Levi's Stadium", city: "San Francisco" },
    { date: "2026-06-17", homeTeam: "Ghana", awayTeam: "Panama", homeFlag: "gh", awayFlag: "pa", group: "L", venue: "BMO Field", city: "Toronto" },
    { date: "2026-06-17", homeTeam: "England", awayTeam: "Croatia", homeFlag: "gb-eng", awayFlag: "hr", group: "L", venue: "AT&T Stadium", city: "Dallas" },
    { date: "2026-06-17", homeTeam: "Portugal", awayTeam: "Congo DR", homeFlag: "pt", awayFlag: "cd", group: "K", venue: "NRG Stadium", city: "Houston" },
    { date: "2026-06-17", homeTeam: "Uzbekistan", awayTeam: "Colombia", homeFlag: "uz", awayFlag: "co", group: "K", venue: "Estadio Azteca", city: "Mexico City" }
  ]
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    // Get tournament ID
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', 'world-cup-2026')
      .single()

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    // Delete existing matchday 1 matches
    const { error: deleteError } = await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournament.id)
      .eq('matchday', 1)

    if (deleteError) {
      console.error('Delete error:', deleteError)
    }

    // Insert new matches
    const matchesToInsert = matchday1Data.matches.map((match, index) => ({
      tournament_id: tournament.id,
      matchday: 1,
      stage: 'group',
      group_name: match.group,
      home_team_name: match.homeTeam,
      away_team_name: match.awayTeam,
      home_flag: match.homeFlag,
      away_flag: match.awayFlag,
      match_time: new Date(match.date + 'T17:00:00Z').toISOString(),
      status: 'scheduled'
    }))

    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Inserted ${inserted.length} matches for matchday 1`,
      matches: inserted
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to seed matchday 1 matches',
    matchCount: matchday1Data.matches.length,
    matches: matchday1Data.matches.map(m => `${m.homeTeam} vs ${m.awayTeam} (Group ${m.group})`)
  })
}
