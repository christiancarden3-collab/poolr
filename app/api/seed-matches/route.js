import { createClient } from '@supabase/supabase-js'
import { WC2026_TEAMS, WC2026_PLAYERS, DEFAULT_PLAYERS, generateGroupStageMatches, generateKnockoutMatches, WC2026_TOURNAMENT, SCORING_RULES } from '../../../lib/wc2026-data'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Parse options from request body
    let options = { teams: true, matches: true, players: true }
    try {
      const body = await request.json()
      options = { ...options, ...body }
    } catch (e) {
      // Use defaults
    }

    const results = {
      tournament: null,
      teams: 0,
      matches: 0,
      players: 0,
    }

    // 1. Get or create tournament
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
            scoring: SCORING_RULES,
            host_countries: WC2026_TOURNAMENT.hostCountries
          }
        })
        .select()
        .single()

      if (tournamentError) {
        console.error('Tournament error:', tournamentError)
        throw tournamentError
      }
      tournament = newTournament
    }
    
    results.tournament = tournament.id

    // 2. Seed teams
    if (options.teams) {
      // Delete existing teams (cascade will delete matches and players)
      await supabase
        .from('teams')
        .delete()
        .eq('tournament_id', tournament.id)

      const teamInserts = WC2026_TEAMS.map(team => ({
        tournament_id: tournament.id,
        name: team.name,
        code: team.code,
        flag_code: team.flag,
        group_name: team.group
      }))

      const { error: teamsError, data: insertedTeams } = await supabase
        .from('teams')
        .insert(teamInserts)
        .select()

      if (teamsError) {
        console.error('Teams error:', teamsError)
        throw teamsError
      }
      
      results.teams = insertedTeams?.length || 0
    }

    // 3. Get team IDs for foreign keys
    const { data: teams } = await supabase
      .from('teams')
      .select('id, code, name, flag_code')
      .eq('tournament_id', tournament.id)

    const teamMap = {}
    const teamByCode = {}
    teams?.forEach(t => {
      teamMap[t.code] = t.id
      teamByCode[t.code] = t
    })

    // 4. Seed matches
    if (options.matches) {
      // Delete existing matches
      await supabase
        .from('matches')
        .delete()
        .eq('tournament_id', tournament.id)

      const groupMatches = generateGroupStageMatches()
      const knockoutMatches = generateKnockoutMatches()
      const allMatches = [...groupMatches, ...knockoutMatches]

      const matchInserts = allMatches.map(match => {
        const homeTeam = teamByCode[match.homeTeam]
        const awayTeam = teamByCode[match.awayTeam]
        
        // Parse date and time into ISO timestamp
        const matchTime = new Date(`${match.date}T${match.time || '12:00'}:00-04:00`) // ET timezone
        
        return {
          tournament_id: tournament.id,
          matchday: match.matchday || Math.ceil(match.matchNumber / 12),
          stage: match.stage || 'group',
          group_name: match.group || null,
          home_team_id: homeTeam?.id || null,
          away_team_id: awayTeam?.id || null,
          home_team_name: homeTeam?.name || match.homeTeamName || match.homeTeam,
          away_team_name: awayTeam?.name || match.awayTeamName || match.awayTeam,
          home_flag: homeTeam?.flag_code || match.homeFlag || null,
          away_flag: awayTeam?.flag_code || match.awayFlag || null,
          match_time: matchTime.toISOString(),
          status: 'scheduled',
          home_score: null,
          away_score: null,
        }
      })

      const { error: matchesError, data: insertedMatches } = await supabase
        .from('matches')
        .insert(matchInserts)
        .select()

      if (matchesError) {
        console.error('Matches error:', matchesError)
        throw matchesError
      }
      
      results.matches = insertedMatches?.length || 0
    }

    // 5. Seed players
    if (options.players) {
      // Delete existing players
      await supabase
        .from('players')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      const playerInserts = []
      
      for (const team of teams || []) {
        const teamPlayers = WC2026_PLAYERS[team.code] || DEFAULT_PLAYERS
        
        teamPlayers.forEach(player => {
          playerInserts.push({
            team_id: team.id,
            name: player.name,
            position: player.position,
            jersey_number: player.number,
            is_captain: player.isCaptain || false,
          })
        })
      }

      if (playerInserts.length > 0) {
        const { error: playersError, data: insertedPlayers } = await supabase
          .from('players')
          .insert(playerInserts)
          .select()

        if (playersError) {
          console.error('Players error:', playersError)
          // Don't throw - players table might not exist yet
          results.playersError = playersError.message
        } else {
          results.players = insertedPlayers?.length || 0
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.teams} teams, ${results.matches} matches, ${results.players} players`,
      ...results
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: error.details || null 
    }, { status: 500 })
  }
}

export async function GET() {
  const groupMatches = generateGroupStageMatches()
  const knockoutMatches = generateKnockoutMatches()
  
  // Get match count per matchday for MD1
  const md1Matches = groupMatches.filter(m => m.matchday === 1)
  
  return NextResponse.json({ 
    message: 'POST to this endpoint to seed World Cup 2026 data',
    stats: {
      teams: WC2026_TEAMS.length,
      groupMatches: groupMatches.length,
      knockoutMatches: knockoutMatches.length,
      totalMatches: groupMatches.length + knockoutMatches.length,
      playersPerTeam: Object.keys(WC2026_PLAYERS).length,
    },
    matchday1: {
      count: md1Matches.length,
      firstMatch: md1Matches[0],
    },
    groups: [...new Set(WC2026_TEAMS.map(t => t.group))],
  })
}
