import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    
    const group = searchParams.get('group')

    // Get tournament
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('id')
      .eq('slug', 'world-cup-2026')
      .single()

    if (!tournament) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tournament not found',
        teams: [] 
      }, { status: 404 })
    }

    let query = supabase
      .from('teams')
      .select('id, name, code, flag_code, group_name')
      .eq('tournament_id', tournament.id)
      .order('group_name')
      .order('name')

    if (group) {
      query = query.eq('group_name', group)
    }

    const { data: teams, error } = await query

    if (error) throw error

    // Format for frontend
    const formattedTeams = (teams || []).map(t => ({
      id: t.id,
      name: t.name,
      code: t.code,
      flag: t.flag_code,
      flagUrl: `https://flagcdn.com/w80/${t.flag_code}.png`,
      group: t.group_name,
    }))

    return NextResponse.json({
      success: true,
      count: formattedTeams.length,
      teams: formattedTeams,
    })
  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message,
      teams: []
    }, { status: 500 })
  }
}
