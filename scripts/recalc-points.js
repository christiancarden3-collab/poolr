#!/usr/bin/env node
/**
 * Recalculate leaderboard points with new scoring:
 * - Exact score = 3 pts
 * - Correct winner = 1 pt
 * - Max = 4 pts per match
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NzcyMDQsImV4cCI6MjAzMTU1MzIwNH0.pVAFmPGVqTMHu9cLGMvuAMsxGBqM_wFmPB7uwLhH2Ew'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function recalculate() {
  console.log('🎾 Recalculating leaderboard with new scoring...\n')
  console.log('Scoring: Exact=3pts, Winner=1pt, Max=4pts\n')

  // Get all results
  const { data: results, error: resultsError } = await supabase
    .from('match_results')
    .select('*')

  if (resultsError) {
    console.error('❌ Error fetching results:', resultsError.message)
    return
  }

  console.log(`📊 Found ${results.length} match results\n`)

  // Create results lookup
  const resultsMap = {}
  results.forEach(r => {
    resultsMap[r.match_id] = {
      home: r.home_score,
      away: r.away_score,
      winner: r.winner
    }
  })

  // Get all pools (RG2026 only for now)
  const { data: pools } = await supabase
    .from('pools')
    .select('id, name, tournament')
    .eq('tournament', 'rg2026')

  console.log(`🏆 Found ${pools?.length || 0} RG2026 pools\n`)

  for (const pool of (pools || [])) {
    console.log(`\n--- Pool: ${pool.name} ---`)

    // Get all members
    const { data: members } = await supabase
      .from('pool_members')
      .select('id, user_id, team_name, total_points')
      .eq('pool_id', pool.id)

    // Get all picks for this pool
    const { data: picks } = await supabase
      .from('picks')
      .select('*')
      .eq('pool_id', pool.id)

    // Group picks by user
    const picksByUser = {}
    picks?.forEach(p => {
      if (!picksByUser[p.user_id]) picksByUser[p.user_id] = []
      picksByUser[p.user_id].push(p)
    })

    // Calculate points for each member
    for (const member of (members || [])) {
      const userPicks = picksByUser[member.user_id] || []
      let totalPoints = 0
      let exactCount = 0
      let winnerCount = 0
      let wrongCount = 0

      for (const pick of userPicks) {
        const result = resultsMap[pick.match_id]
        if (!result) continue // No result yet

        const resultWinner = result.home > result.away ? 'home' : 'away'
        const winnerCorrect = pick.winner === resultWinner
        const scoreCorrect = pick.home_score === result.home && pick.away_score === result.away && winnerCorrect

        if (scoreCorrect) {
          totalPoints += 4 // 3 for exact + 1 for winner
          exactCount++
        } else if (winnerCorrect) {
          totalPoints += 1
          winnerCount++
        } else {
          wrongCount++
        }
      }

      console.log(`  ${member.team_name || member.user_id.slice(0,8)}: ${totalPoints} pts (${exactCount} exact, ${winnerCount} winner, ${wrongCount} wrong) [was: ${member.total_points}]`)

      // Update if changed
      if (totalPoints !== member.total_points) {
        const { error } = await supabase
          .from('pool_members')
          .update({ total_points: totalPoints })
          .eq('id', member.id)

        if (error) {
          console.log(`    ❌ Update failed: ${error.message}`)
        } else {
          console.log(`    ✅ Updated!`)
        }
      }
    }
  }

  console.log('\n✅ Done!')
}

recalculate().catch(console.error)
