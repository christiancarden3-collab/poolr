'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'
import { WC2026_TEAMS, generateGroupStageMatches, SCORING_RULES } from '../../../../lib/wc2026-data'

export default function PredictionsPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGroup, setActiveGroup] = useState('A')
  const [predictions, setPredictions] = useState({})
  const [savedPredictions, setSavedPredictions] = useState({})
  const [matches, setMatches] = useState([])

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Load pool
    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!poolData) {
      router.push('/dashboard')
      return
    }
    setPool(poolData)

    // Generate matches (in real app, these would come from database)
    const groupMatches = generateGroupStageMatches()
    setMatches(groupMatches)

    // Load user's existing predictions
    const { data: existingPicks } = await supabase
      .from('match_picks')
      .select('*')
      .eq('pool_id', params.id)
      .eq('user_id', currentUser.id)

    if (existingPicks) {
      const picksMap = {}
      existingPicks.forEach(pick => {
        picksMap[pick.match_id] = {
          homeScore: pick.predicted_home_score,
          awayScore: pick.predicted_away_score,
        }
      })
      setPredictions(picksMap)
      setSavedPredictions(picksMap)
    }

    setLoading(false)
  }

  const updatePrediction = (matchId, team, score) => {
    const numScore = parseInt(score) || 0
    if (numScore < 0 || numScore > 20) return

    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: numScore,
      }
    }))
  }

  const savePredictions = async () => {
    setSaving(true)

    try {
      // Prepare upserts for all predictions
      const upserts = Object.entries(predictions)
        .filter(([matchId, pred]) => pred.homeScore !== undefined && pred.awayScore !== undefined)
        .map(([matchId, pred]) => ({
          pool_id: params.id,
          user_id: user.id,
          match_id: matchId,
          predicted_home_score: pred.homeScore,
          predicted_away_score: pred.awayScore,
        }))

      if (upserts.length > 0) {
        const { error } = await supabase
          .from('match_picks')
          .upsert(upserts, { onConflict: 'pool_id,user_id,match_id' })

        if (error) throw error
      }

      setSavedPredictions({ ...predictions })
      alert('Predictions saved!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const getTeamByCode = (code) => WC2026_TEAMS.find(t => t.code === code)
  
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  const groupMatches = matches.filter(m => m.group === activeGroup)

  const hasUnsavedChanges = JSON.stringify(predictions) !== JSON.stringify(savedPredictions)

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
        <p>Loading predictions...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--ink);
          }
          .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <nav className="predictions-nav">
        <Link href={`/pool/${params.id}`} className="back-link">← Back to Pool</Link>
        <div className="logo">Poolr</div>
        <button 
          onClick={savePredictions} 
          disabled={saving || !hasUnsavedChanges}
          className="save-btn"
        >
          {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved ✓'}
        </button>
      </nav>

      <main className="predictions-container">
        <div className="predictions-header">
          <h1>Match Predictions</h1>
          <p>Predict the score for each match • Exact score = {SCORING_RULES.exactScore} pts • Correct result = {SCORING_RULES.correctResult} pts</p>
        </div>

        {/* Group tabs */}
        <div className="group-tabs">
          {groups.map(group => (
            <button
              key={group}
              className={`group-tab ${activeGroup === group ? 'active' : ''}`}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Group teams */}
        <div className="group-teams">
          <h3>Group {activeGroup}</h3>
          <div className="teams-row">
            {WC2026_TEAMS.filter(t => t.group === activeGroup).map(team => (
              <div key={team.code} className="team-chip">
                <span className="team-flag">{team.flag}</span>
                <span className="team-name">{team.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Matches */}
        <div className="matches-list">
          {groupMatches.map(match => {
            const homeTeam = getTeamByCode(match.homeTeam)
            const awayTeam = getTeamByCode(match.awayTeam)
            const prediction = predictions[match.id] || {}
            const isPredicted = prediction.homeScore !== undefined && prediction.awayScore !== undefined

            return (
              <div key={match.id} className={`match-card ${isPredicted ? 'predicted' : ''}`}>
                <div className="match-info">
                  <span className="match-date">{new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="match-time">{match.time}</span>
                </div>
                
                <div className="match-teams">
                  <div className="team home">
                    <span className="team-flag">{homeTeam?.flag}</span>
                    <span className="team-name">{homeTeam?.name}</span>
                  </div>
                  
                  <div className="score-inputs">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={prediction.homeScore ?? ''}
                      onChange={(e) => updatePrediction(match.id, 'homeScore', e.target.value)}
                      placeholder="-"
                    />
                    <span className="vs">:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={prediction.awayScore ?? ''}
                      onChange={(e) => updatePrediction(match.id, 'awayScore', e.target.value)}
                      placeholder="-"
                    />
                  </div>
                  
                  <div className="team away">
                    <span className="team-name">{awayTeam?.name}</span>
                    <span className="team-flag">{awayTeam?.flag}</span>
                  </div>
                </div>

                <div className="match-venue">{match.venue}</div>
              </div>
            )
          })}
        </div>

        {/* Floating save button on mobile */}
        {hasUnsavedChanges && (
          <button className="floating-save" onClick={savePredictions} disabled={saving}>
            {saving ? 'Saving...' : 'Save Predictions'}
          </button>
        )}
      </main>

      <style jsx>{`
        .predictions-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
        }

        .save-btn {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .predictions-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 1.5rem;
          padding-bottom: 100px;
        }

        .predictions-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .predictions-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .predictions-header p {
          color: var(--body);
          font-size: 0.85rem;
        }

        .group-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
          -webkit-overflow-scrolling: touch;
        }

        .group-tab {
          background: var(--ink2);
          border: 1px solid var(--border);
          color: var(--body);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .group-tab:hover {
          border-color: var(--gold);
        }

        .group-tab.active {
          background: var(--gold);
          border-color: var(--gold);
          color: var(--ink);
          font-weight: 600;
        }

        .group-teams {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .group-teams h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .teams-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .team-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--ink3);
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
        }

        .team-chip .team-flag {
          font-size: 1.25rem;
        }

        .team-chip .team-name {
          font-size: 0.85rem;
          color: var(--silk);
        }

        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .match-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.2s;
        }

        .match-card.predicted {
          border-color: var(--success);
          background: rgba(93, 187, 138, 0.05);
        }

        .match-info {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .match-date, .match-time {
          font-size: 0.75rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .match-teams {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .team {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .team.home {
          justify-content: flex-end;
          text-align: right;
        }

        .team.away {
          justify-content: flex-start;
        }

        .team .team-flag {
          font-size: 1.5rem;
        }

        .team .team-name {
          font-size: 0.9rem;
          color: var(--silk);
          font-weight: 500;
        }

        .score-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .score-inputs input {
          width: 45px;
          height: 45px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
          background: var(--ink3);
          border: 2px solid var(--border);
          border-radius: 8px;
          color: var(--silk);
        }

        .score-inputs input:focus {
          border-color: var(--gold);
          outline: none;
        }

        .score-inputs input::placeholder {
          color: var(--muted);
        }

        .vs {
          color: var(--muted);
          font-size: 1.25rem;
          font-weight: 300;
        }

        .match-venue {
          text-align: center;
          font-size: 0.75rem;
          color: var(--muted);
          margin-top: 0.75rem;
        }

        .floating-save {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 1rem 2rem;
          border-radius: 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          z-index: 1000;
        }

        .floating-save:disabled {
          opacity: 0.7;
        }

        @media (max-width: 600px) {
          .team .team-name {
            font-size: 0.8rem;
          }

          .score-inputs input {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  )
}
