import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /api/results - Fetch all match results
 * GET /api/results?match_id=rg1-1 - Fetch specific match result
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get('match_id')
  
  const supabase = createRouteHandlerClient({ cookies })
  
  let query = supabase.from('match_results').select('*')
  if (matchId) {
    query = query.eq('match_id', matchId)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ results: data })
}

/**
 * POST /api/results - Update match result
 * Body: { match_id: "rg1-1", home_score: 2, away_score: 1, winner: "home" }
 * 
 * For tennis: home_score/away_score = sets won (e.g., 2-1 means 2 sets to 1)
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { match_id, home_score, away_score, winner } = body
    
    if (!match_id || home_score === undefined || away_score === undefined) {
      return NextResponse.json({ 
        error: 'Required: match_id, home_score, away_score' 
      }, { status: 400 })
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data, error } = await supabase
      .from('match_results')
      .upsert({
        match_id,
        home_score: parseInt(home_score),
        away_score: parseInt(away_score),
        winner: winner || (home_score > away_score ? 'home' : 'away'),
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, result: data?.[0] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/results/bulk - Bulk update multiple results
 * Body: { results: [{ match_id, home_score, away_score, winner }, ...] }
 */
export async function PUT(request) {
  try {
    const body = await request.json()
    const { results } = body
    
    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ 
        error: 'Required: results array' 
      }, { status: 400 })
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    const toUpsert = results.map(r => ({
      match_id: r.match_id,
      home_score: parseInt(r.home_score),
      away_score: parseInt(r.away_score),
      winner: r.winner || (r.home_score > r.away_score ? 'home' : 'away'),
      updated_at: new Date().toISOString()
    }))
    
    const { data, error } = await supabase
      .from('match_results')
      .upsert(toUpsert, { onConflict: 'match_id' })
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, count: data?.length || 0 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
