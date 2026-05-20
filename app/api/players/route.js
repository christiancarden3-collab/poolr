export const dynamic = 'force-dynamic'

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    
    const position = searchParams.get('position') // GK, DEF, MID, FWD
    const teamId = searchParams.get('team')

    let query = supabase
      .from('players')
      .select(`
        id,
        name,
        position,
        jersey_number,
        is_captain,
        team:teams (
          id,
          name,
          code,
          flag_code
        )
      `)
      .order('name')

    if (position) {
      query = query.eq('position', position.toUpperCase())
    }
    
    if (teamId) {
      query = query.eq('team_id', teamId)
    }

    const { data: players, error } = await query

    if (error) throw error

    // Format for frontend
    const formattedPlayers = (players || []).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      number: p.jersey_number,
      isCaptain: p.is_captain,
      team: p.team?.name || 'Unknown',
      teamCode: p.team?.code || '',
      flag: p.team?.flag_code || '',
      flagUrl: p.team?.flag_code ? `https://flagcdn.com/w40/${p.team.flag_code}.png` : '',
    }))

    return NextResponse.json({
      success: true,
      count: formattedPlayers.length,
      players: formattedPlayers,
    })
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      players: []
    }, { status: 500 })
  }
}
