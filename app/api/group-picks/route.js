import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// GET - Load existing picks for a user/pool
export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('pool_id')
    const userId = searchParams.get('user_id')
    
    if (!poolId || !userId) {
      return NextResponse.json({ error: 'pool_id and user_id required' }, { status: 400 })
    }
    
    const { data: picks, error } = await supabase
      .from('wc_group_picks')
      .select('*')
      .eq('pool_id', poolId)
      .eq('user_id', userId)
    
    if (error) throw error
    
    // Transform to simple format: { A: ['MEX', 'KOR'], B: [...], ... }
    const picksMap = {}
    picks?.forEach(pick => {
      picksMap[pick.group_letter] = [pick.first_place_team_id, pick.second_place_team_id]
    })
    
    return NextResponse.json({
      success: true,
      picks: picksMap,
      raw: picks
    })
  } catch (error) {
    console.error('GET group-picks error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save picks for a user/pool
export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { pool_id, user_id, picks } = body
    
    if (!pool_id || !user_id || !picks) {
      return NextResponse.json({ error: 'pool_id, user_id, and picks required' }, { status: 400 })
    }
    
    const now = new Date().toISOString()
    const rows = []
    
    // Transform picks object to rows
    // Accepts: { A: ['MEX', 'KOR'], B: ['CAN', 'SUI'], ... }
    for (const [group, teamIds] of Object.entries(picks)) {
      if (teamIds && teamIds.length === 2) {
        rows.push({
          pool_id,
          user_id,
          group_letter: group,
          first_place_team_id: teamIds[0],
          second_place_team_id: teamIds[1],
          updated_at: now
        })
      }
    }
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid picks to save' }, { status: 400 })
    }
    
    // Upsert all picks (insert or update on conflict)
    const { data, error } = await supabase
      .from('wc_group_picks')
      .upsert(rows, { 
        onConflict: 'pool_id,user_id,group_letter',
        ignoreDuplicates: false 
      })
      .select()
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      saved: rows.length,
      data
    })
  } catch (error) {
    console.error('POST group-picks error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
