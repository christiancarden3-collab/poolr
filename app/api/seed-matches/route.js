import { createClient } from '@supabase/supabase-js'
import { WC2026_TEAMS, generateGroupStageMatches, generateKnockoutMatches, WC2026_TOURNAMENT } from '../../../lib/wc2026-data'
import { NextResponse } from 'next/server'

// Use service role key for admin operations (would be env var in production)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get or create tournament
    let { data: tournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', 'world-cup-2026')
      .single()

    if (!tournament) {
      const { data: newTournament, error: tournamentError } = await supabase
        .from('tournaments')
        .insert({
          name: WC2026_TOURNAMENT.name,
          slug: 'world-cup-2026',
          start_date: WC2026_TOURNAMENT.startDate,
          end_date: WC2026_TOURNAMENT.endDate,
          status: 'upcoming',
          config: {
            scoring: {
              exact_score: 5,
              correct_result: 2,
              champion: 25,
              runner_up: 15,
              top_scorer: 10
            },
            host_countries: WC2026_TOURNAMENT.hostCountries
          }
        })
        .select()
        .single()

      if (tournamentError) throw tournamentError
      tournament = newTournament
    }

    // Seed teams
    const teamInserts = WC2026_TEAMS.map(team => ({
      tournament_id: tournament.id,
      name: team.name,
      code: team.code,
      flag_code: team.flag,
      group_name: team.group
    }))

    // Delete existing teams for this tournament
    await supabase
      .from('teams')
      .delete()
      .eq('tournament_id', tournament.id)

    const { error: teamsError } = await supabase
      .from('teams')
      .insert(teamInserts)

    if (teamsError) throw teamsError

    // Get team IDs
    const { data: teams } = await supabase
      .from('teams')
      .select('id, code')
      .eq('tournament_id', tournament.id)

    const teamMap = {}
    teams.forEach(t => { teamMap[t.code] = t.id })

    // Generate and seed matches
    const groupMatches = generateGroupStageMatches()
    const knockoutMatches = generateKnockoutMatches()
    const allMatches = [...groupMatches, ...knockoutMatches]

    // Delete existing matches
    await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', tournament.id)

    const matchInserts = allMatches.map(match => {
      const homeTeam = WC2026_TEAMS.find(t => t.code === match.homeTeam)
      const awayTeam = WC2026_TEAMS.find(t => t.code === match.awayTeam)
      
      return {
        id: match.id, // Use the generated ID
        tournament_id: tournament.id,
        matchday: match.matchNumber,
        stage: match.round === 'Group Stage' ? 'group' : 
               match.round === 'Round of 32' ? 'round_of_32' :
               match.round === 'Round of 16' ? 'round_of_16' :
               match.round === 'Quarter-finals' ? 'quarter_final' :
               match.round === 'Semi-finals' ? 'semi_final' :
               match.round === 'Third Place' ? 'third_place' :
               match.round === 'Final' ? 'final' : 'group',
        group_name: match.group || null,
        home_team_id: teamMap[match.homeTeam] || null,
        away_team_id: teamMap[match.awayTeam] || null,
        home_team_name: homeTeam?.name || match.homeTeam,
        away_team_name: awayTeam?.name || match.awayTeam,
        home_flag: homeTeam?.flag || null,
        away_flag: awayTeam?.flag || null,
        match_time: new Date(`${match.date}T${match.time || '12:00'}:00Z`).toISOString(),
        status: 'scheduled'
      }
    })

    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matchInserts)

    if (matchesError) throw matchesError

    return NextResponse.json({
      success: true,
      message: `Seeded ${teamInserts.length} teams and ${matchInserts.length} matches`,
      tournament_id: tournament.id
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint to seed World Cup 2026 data',
    teams: WC2026_TEAMS.length,
    matches: generateGroupStageMatches().length + generateKnockoutMatches().length
  })
}
