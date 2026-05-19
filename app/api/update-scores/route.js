import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// This API can be called by a cron job to update live scores
// For now it supports manual score updates and can be extended to fetch from external APIs

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    
    // Option 1: Manual score update
    if (body.matchId && body.homeScore !== undefined && body.awayScore !== undefined) {
      const { error } = await supabase
        .from('matches')
        .update({
          home_score: body.homeScore,
          away_score: body.awayScore,
          status: body.status || 'completed',
        })
        .eq('id', body.matchId)

      if (error) throw error

      // Calculate points for this match if completed
      if (body.status === 'completed') {
        await calculateMatchPoints(supabase, body.matchId, body.homeScore, body.awayScore)
      }

      return NextResponse.json({
        success: true,
        message: `Updated match ${body.matchId}`,
      })
    }

    // Option 2: Bulk update from external API (placeholder)
    // In production, you'd integrate with football-data.org or similar
    if (body.fetchLive) {
      // Placeholder for external API integration
      // const liveScores = await fetchFromFootballDataAPI()
      // for (const score of liveScores) { ... }
      
      return NextResponse.json({
        success: true,
        message: 'Live score fetching not yet configured',
        hint: 'Add FOOTBALL_DATA_API_KEY to .env.local and implement fetchFromFootballDataAPI()',
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No valid update parameters provided',
      usage: {
        manualUpdate: {
          matchId: 'uuid',
          homeScore: 2,
          awayScore: 1,
          status: 'completed' // or 'live'
        },
        fetchLive: {
          fetchLive: true
        }
      }
    }, { status: 400 })

  } catch (error) {
    console.error('Update scores error:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}

// Calculate and update points for all picks on a completed match
async function calculateMatchPoints(supabase, matchId, homeScore, awayScore) {
  try {
    // Get all picks for this match
    const { data: picks, error: picksError } = await supabase
      .from('match_picks')
      .select('id, pool_member_id, home_score, away_score')
      .eq('match_id', matchId)

    if (picksError) throw picksError
    if (!picks || picks.length === 0) return

    // Get match details for stage multiplier
    const { data: match } = await supabase
      .from('matches')
      .select('stage')
      .eq('id', matchId)
      .single()

    const stageMultiplier = getStageMultiplier(match?.stage || 'group')

    // Calculate points for each pick
    for (const pick of picks) {
      const points = calculatePoints(
        pick.home_score, pick.away_score,
        homeScore, awayScore,
        stageMultiplier
      )

      // Update pick with earned points
      await supabase
        .from('match_picks')
        .update({ points_earned: points, locked: true })
        .eq('id', pick.id)

      // Update total points for pool member
      await updateMemberTotalPoints(supabase, pick.pool_member_id)
    }
  } catch (error) {
    console.error('Error calculating points:', error)
  }
}

function calculatePoints(predictedHome, predictedAway, actualHome, actualAway, multiplier = 1) {
  const EXACT_SCORE = 3
  const CORRECT_RESULT = 1

  // Exact score match
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return Math.round(EXACT_SCORE * multiplier)
  }

  // Check for correct result (win/draw/loss)
  const predictedResult = getResult(predictedHome, predictedAway)
  const actualResult = getResult(actualHome, actualAway)

  if (predictedResult === actualResult) {
    return Math.round(CORRECT_RESULT * multiplier)
  }

  return 0
}

function getResult(homeScore, awayScore) {
  if (homeScore > awayScore) return 'home'
  if (homeScore < awayScore) return 'away'
  return 'draw'
}

function getStageMultiplier(stage) {
  const multipliers = {
    group: 1,
    r32: 1,
    round_of_32: 1,
    r16: 1.5,
    round_of_16: 1.5,
    qf: 2,
    quarter_final: 2,
    sf: 2.5,
    semi_final: 2.5,
    third: 1,
    third_place: 1,
    final: 3,
  }
  return multipliers[stage] || 1
}

async function updateMemberTotalPoints(supabase, poolMemberId) {
  // Sum all points from match_picks for this member
  const { data: totalData, error } = await supabase
    .from('match_picks')
    .select('points_earned')
    .eq('pool_member_id', poolMemberId)

  if (error || !totalData) return

  const total = totalData.reduce((sum, pick) => sum + (pick.points_earned || 0), 0)

  await supabase
    .from('pool_members')
    .update({ total_points: total })
    .eq('id', poolMemberId)
}

// GET endpoint to see current match statuses
export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const matchday = searchParams.get('matchday')

    let query = supabase
      .from('matches')
      .select('id, matchday, stage, home_team_name, away_team_name, match_time, home_score, away_score, status')
      .order('match_time', { ascending: true })

    if (status !== 'all') {
      query = query.eq('status', status)
    }
    
    if (matchday) {
      query = query.eq('matchday', parseInt(matchday))
    }

    const { data: matches, error } = await query.limit(50)

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: matches?.length || 0,
      matches,
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 })
  }
}
