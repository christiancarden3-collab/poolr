import { createClient } from '@supabase/supabase-js'
import { TEAMS, PLAYERS, MATCHES } from '../../../lib/wc2026-database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const results = {
      teams: { inserted: 0, errors: [] },
      players: { inserted: 0, errors: [] },
      matches: { inserted: 0, errors: [] }
    }

    // 1. Seed Teams
    console.log('Seeding teams...')
    for (const team of TEAMS) {
      const { error } = await supabase
        .from('teams')
        .upsert({
          code: team.code,
          name: team.name,
          group_letter: team.group,
          confederation: team.conf,
          fifa_rank: team.rank,
          is_host: team.host || false,
          is_playoff: team.playoff || false,
          is_debut: team.debut || false,
          flag_url: `https://flagcdn.com/w80/${team.code}.png`
        }, { onConflict: 'code' })
      
      if (error) {
        results.teams.errors.push({ team: team.code, error: error.message })
      } else {
        results.teams.inserted++
      }
    }

    // 2. Seed Players
    console.log('Seeding players...')
    for (const player of PLAYERS) {
      const { error } = await supabase
        .from('players')
        .upsert({
          name: player.name,
          team_code: player.team,
          position: player.pos
        }, { onConflict: 'name,team_code' })
      
      if (error) {
        results.players.errors.push({ player: player.name, error: error.message })
      } else {
        results.players.inserted++
      }
    }

    // 3. Seed Matches
    console.log('Seeding matches...')
    for (const match of MATCHES) {
      const matchData = {
        match_id: match.id,
        matchday: match.md || null,
        stage: match.stage,
        group_letter: match.group || null,
        home_team_code: match.home || null,
        away_team_code: match.away || null,
        match_date: match.date,
        time_et: match.timeET,
        time_ct: match.timeCT,
        venue: match.venue,
        city: match.city,
        label: match.label || null,
        match_number: match.matchNum || null,
        home_score: null,
        away_score: null,
        status: 'scheduled'
      }

      const { error } = await supabase
        .from('matches')
        .upsert(matchData, { onConflict: 'match_id' })
      
      if (error) {
        results.matches.errors.push({ match: match.id, error: error.message })
      } else {
        results.matches.inserted++
      }
    }

    return Response.json({
      success: true,
      message: 'Database seeded successfully',
      results
    })

  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({
    message: 'POST to this endpoint to seed the database with WC2026 data',
    data: {
      teams: TEAMS.length,
      players: PLAYERS.length,
      matches: MATCHES.length
    }
  })
}
