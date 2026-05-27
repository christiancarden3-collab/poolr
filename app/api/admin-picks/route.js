import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Admin endpoint to fetch all picks (bypasses RLS by using service role or direct query)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { searchParams } = new URL(request.url)
    const poolId = searchParams.get('pool_id')
    
    // Get pool info
    const { data: pool } = await supabase
      .from('pools')
      .select('*')
      .eq('id', poolId)
      .single()
    
    // Get pool members
    const { data: members } = await supabase
      .from('pool_members')
      .select('id, user_id, team_name, total_points')
      .eq('pool_id', poolId)
    
    // Get ALL picks for this pool (need to query by user_ids)
    const userIds = members?.map(m => m.user_id) || []
    
    const { data: picks, error: picksError } = await supabase
      .from('picks')
      .select('*')
      .eq('pool_id', poolId)
    
    // Get special picks
    const memberIds = members?.map(m => m.id) || []
    const { data: specialPicks } = await supabase
      .from('special_picks')
      .select('*')
      .in('pool_member_id', memberIds)
    
    return NextResponse.json({
      success: true,
      pool,
      members,
      picks: picks || [],
      picksError: picksError?.message,
      specialPicks,
      debug: {
        userIds,
        memberIds,
        poolId
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
