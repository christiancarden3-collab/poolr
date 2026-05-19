import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { SCORING_RULES } from '../../../lib/wc2026-data'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { pool_id, match_id } = body

    // Get the match result
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .eq('status', 'completed')
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found or not completed' }, { status: 404 })
    }

    // Get all picks for this match in this pool
    const { data: poolMembers } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', pool_id)

    const memberIds = poolMembers?.map(m => m.id) || []

    const { data: picks, error: picksError } = await supabase
      .from('match_picks')
      .select('*')
      .eq('match_id', match_id)
      .in('pool_member_id', memberIds)

    if (picksError) throw picksError

    // Calculate points for each pick
    const updates = []
    
    for (const pick of picks || []) {
      let points = 0
      
      const actualHome = match.home_score
      const actualAway = match.away_score
      const predictedHome = pick.home_score
      const predictedAway = pick.away_score

      // Exact score
      if (predictedHome === actualHome && predictedAway === actualAway) {
        points = SCORING_RULES.exactScore // 5 points
      } else {
        // Correct result (win/draw/loss)
        const actualResult = actualHome > actualAway ? 'home' : actualHome < actualAway ? 'away' : 'draw'
        const predictedResult = predictedHome > predictedAway ? 'home' : predictedHome < predictedAway ? 'away' : 'draw'
        
        if (actualResult === predictedResult) {
          points = SCORING_RULES.correctResult // 2 points
          
          // Bonus for correct goal difference
          const actualDiff = actualHome - actualAway
          const predictedDiff = predictedHome - predictedAway
          if (actualDiff === predictedDiff) {
            points += SCORING_RULES.correctGoalDiff // +1 point
          }
        }
      }

      // Apply stage multipliers for knockout rounds
      if (match.stage !== 'group') {
        const multiplier = SCORING_RULES[match.stage] || 1
        points = Math.round(points * multiplier)
      }

      updates.push({
        id: pick.id,
        points_earned: points,
        locked: true
      })
    }

    // Update picks with points
    for (const update of updates) {
      await supabase
        .from('match_picks')
        .update({ points_earned: update.points_earned, locked: update.locked })
        .eq('id', update.id)
    }

    // Recalculate total points for all pool members
    for (const memberId of memberIds) {
      const { data: memberPicks } = await supabase
        .from('match_picks')
        .select('points_earned')
        .eq('pool_member_id', memberId)

      const totalPoints = memberPicks?.reduce((sum, p) => sum + (p.points_earned || 0), 0) || 0

      await supabase
        .from('pool_members')
        .update({ total_points: totalPoints })
        .eq('id', memberId)
    }

    // Update ranks
    const { data: rankedMembers } = await supabase
      .from('pool_members')
      .select('id, total_points')
      .eq('pool_id', pool_id)
      .order('total_points', { ascending: false })

    for (let i = 0; i < (rankedMembers?.length || 0); i++) {
      const member = rankedMembers[i]
      await supabase
        .from('pool_members')
        .update({ 
          previous_rank: member.rank,
          rank: i + 1 
        })
        .eq('id', member.id)
    }

    return NextResponse.json({
      success: true,
      message: `Calculated points for ${updates.length} picks`,
      updates: updates
    })
  } catch (error) {
    console.error('Calculate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Calculate all completed matches for a pool
export async function PUT(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { pool_id } = body

    if (!pool_id) {
      return NextResponse.json({ error: 'pool_id required' }, { status: 400 })
    }

    // Get all completed matches
    const { data: completedMatches } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'completed')

    const results = []
    
    for (const match of completedMatches || []) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/calculate-points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pool_id, match_id: match.id })
      })
      results.push(await response.json())
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${completedMatches?.length || 0} completed matches`,
      results
    })
  } catch (error) {
    console.error('Batch calculate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
