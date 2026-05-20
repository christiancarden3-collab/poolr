export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    
    const matchday = searchParams.get('matchday')
    const stage = searchParams.get('stage')
    const group = searchParams.get('group')

    // Get tournament ID
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', 'world-cup-2026')
      .single()

    if (!tournament) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tournament not found. Run seed first.',
        matches: [] 
      }, { status: 404 })
    }

    let query = supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order('match_time', { ascending: true })

    if (matchday) {
      query = query.eq('matchday', parseInt(matchday))
    }
    
    if (stage) {
      query = query.eq('stage', stage)
    }
    
    if (group) {
      query = query.eq('group_name', group)
    }

    const { data: matches, error } = await query

    if (error) throw error

    // Format matches for frontend
    const formattedMatches = (matches || []).map(m => ({
      id: m.id,
      matchday: m.matchday,
      stage: m.stage,
      group: m.group_name,
      homeTeam: {
        id: m.home_team_id,
        name: m.home_team_name,
        flag: m.home_flag,
      },
      awayTeam: {
        id: m.away_team_id,
        name: m.away_team_name,
        flag: m.away_flag,
      },
      matchTime: m.match_time,
      date: new Date(m.match_time).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'America/New_York'
      }),
      time: new Date(m.match_time).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'America/New_York'
      }) + ' ET',
      homeScore: m.home_score,
      awayScore: m.away_score,
      status: m.status,
    }))

    return NextResponse.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches,
    })
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      matches: []
    }, { status: 500 })
  }
}
