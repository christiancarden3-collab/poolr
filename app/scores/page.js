'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TEAMS, MATCHES, getTeam, flagUrl } from '../../lib/wc2026-database'
import { getCurrentUser } from '@/lib/supabase'
import AppShell from '@/app/components/AppShell'

// Roland Garros matches data
const RG_MATCHES = {
  1: [ // Saturday May 23 - R2 Day 1
    { id: 'rg-r2-1', stage: 'R2', home: 'Novak Djokovic', away: 'G. Mpetshi Perricard', homeFlag: 'rs', awayFlag: 'fr', date: 'May 23', time: '5:00 AM ET' },
    { id: 'rg-r2-2', stage: 'R2', home: 'Alexander Zverev', away: 'Benjamin Bonzi', homeFlag: 'de', awayFlag: 'fr', date: 'May 23', time: '6:30 AM ET' },
    { id: 'rg-r2-3', stage: 'R2', home: 'Taylor Fritz', away: 'N. Basavareddy', homeFlag: 'us', awayFlag: 'us', date: 'May 23', time: '8:00 AM ET' },
    { id: 'rg-r2-4', stage: 'R2', home: 'Tomas Machac', away: 'Zizou Bergs', homeFlag: 'cz', awayFlag: 'be', date: 'May 23', time: '9:30 AM ET' },
    { id: 'rg-r2-5', stage: 'R2', home: 'Joao Fonseca', away: 'Luka Pavlovic', homeFlag: 'br', awayFlag: 'it', date: 'May 23', time: '11:00 AM ET' },
    { id: 'rg-r2-6', stage: 'R2', home: 'Lorenzo Sonego', away: 'P.H. Herbert', homeFlag: 'it', awayFlag: 'fr', date: 'May 23', time: '12:30 PM ET' },
  ],
  2: [ // Sunday May 24 - R2 Day 2
    { id: 'rg-r2-7', stage: 'R2', home: 'Karen Khachanov', away: 'Arthur Gea', homeFlag: 'ru', awayFlag: 'fr', date: 'May 24', time: '5:00 AM ET' },
    { id: 'rg-r2-8', stage: 'R2', home: 'T. Etcheverry', away: 'Nuno Borges', homeFlag: 'ar', awayFlag: 'pt', date: 'May 24', time: '6:30 AM ET' },
    { id: 'rg-r2-9', stage: 'R2', home: 'Jakub Mensik', away: 'Titouan Droguet', homeFlag: 'cz', awayFlag: 'fr', date: 'May 24', time: '8:00 AM ET' },
    { id: 'rg-r2-10', stage: 'R2', home: 'Reilly Opelka', away: 'Federico Cina', homeFlag: 'us', awayFlag: 'it', date: 'May 24', time: '9:30 AM ET' },
  ],
  3: [ // Monday May 25 - R3
    { id: 'rg-r3-1', stage: 'R3', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 25', time: '5:00 AM ET' },
    { id: 'rg-r3-2', stage: 'R3', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 25', time: '8:00 AM ET' },
  ],
  4: [ // R16
    { id: 'rg-r16-1', stage: 'R16', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 28', time: '6:00 AM ET' },
    { id: 'rg-r16-2', stage: 'R16', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 28', time: '9:00 AM ET' },
  ],
  5: [ // QF
    { id: 'rg-qf-1', stage: 'QF', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 30', time: '6:00 AM ET' },
    { id: 'rg-qf-2', stage: 'QF', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 30', time: '9:00 AM ET' },
  ],
  6: [ // SF
    { id: 'rg-sf-1', stage: 'SF', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 31', time: '6:00 AM ET' },
    { id: 'rg-sf-2', stage: 'SF', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'May 31', time: '9:00 AM ET' },
  ],
  7: [ // Final
    { id: 'rg-final', stage: 'F', home: 'TBD', away: 'TBD', homeFlag: 'xx', awayFlag: 'xx', date: 'Jun 1', time: '9:00 AM ET' },
  ],
}

export default function ResultsPage() {
  const [user, setUser] = useState(null)
  const [tournament, setTournament] = useState('wc2026')
  const [selectedMatchday, setSelectedMatchday] = useState(1)
  const [selectedStage, setSelectedStage] = useState('group')
  const [rgDay, setRgDay] = useState(1)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  const groupMatches = MATCHES.filter(m => m.stage === 'group')
  const knockoutMatches = MATCHES.filter(m => m.stage !== 'group')

  const matchdays = [1, 2, 3]
  const knockoutStages = [
    { key: 'r32', label: 'Round of 32' },
    { key: 'r16', label: 'Round of 16' },
    { key: 'qf', label: 'Quarter-finals' },
    { key: 'sf', label: 'Semi-finals' },
    { key: '3rd', label: '3rd Place' },
    { key: 'final', label: 'Final' },
  ]

  const displayMatches = selectedStage === 'group'
    ? groupMatches.filter(m => m.md === selectedMatchday)
    : knockoutMatches.filter(m => m.stage === selectedStage)

  // Group matches by date
  const matchesByDate = displayMatches.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = []
    acc[match.date].push(match)
    return acc
  }, {})

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // RG matches for current day
  const rgMatches = RG_MATCHES[rgDay] || []

  return (
    <AppShell 
      user={user} 
      pageTitle="Match Results" 
      pageEyebrow={tournament === 'rg2026' ? 'Roland Garros 2026' : 'World Cup 2026'}
      pageMeta="All scores and standings from the tournament"
      showCreate={!!user}
    >
      {/* TOURNAMENT SELECTOR */}
      <div className="tournament-selector">
        <select 
          value={tournament} 
          onChange={(e) => setTournament(e.target.value)}
          className="tournament-dropdown"
        >
          <option value="wc2026">🏆 FIFA World Cup 2026</option>
          <option value="rg2026">🎾 Roland Garros 2026</option>
        </select>
      </div>

      {tournament === 'wc2026' ? (
        <>
          {/* WC STAGE TABS */}
          <div className="tab-nav">
            <div className="tab-nav-inner">
              <button 
                className={`tab ${selectedStage === 'group' ? 'active' : ''}`}
                onClick={() => setSelectedStage('group')}
              >
                Group Stage
              </button>
              {knockoutStages.map(stage => (
                <button 
                  key={stage.key}
                  className={`tab ${selectedStage === stage.key ? 'active' : ''}`}
                  onClick={() => setSelectedStage(stage.key)}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* RG DAY TABS */}
          <div className="tab-nav">
            <div className="tab-nav-inner">
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <button 
                  key={day}
                  className={`tab ${rgDay === day ? 'active' : ''}`}
                  onClick={() => setRgDay(day)}
                >
                  {day <= 3 ? `R${day + 1}` : day === 4 ? 'R16' : day === 5 ? 'QF' : day === 6 ? 'SF' : 'Final'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MATCHDAY SELECTOR (for WC group stage) */}
      {tournament === 'wc2026' && selectedStage === 'group' && (
        <div className="matchday-bar">
          <div className="matchday-inner">
            {matchdays.map(md => (
              <button
                key={md}
                className={`md-btn ${selectedMatchday === md ? 'active' : ''}`}
                onClick={() => setSelectedMatchday(md)}
              >
                Matchday {md}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MATCHES */}
      <div className="wrap">
        {/* ROLAND GARROS MATCHES */}
        {tournament === 'rg2026' && (
          <div className="rg-matches">
            {rgMatches.length === 0 ? (
              <div className="no-matches">No matches scheduled for this round yet</div>
            ) : (
              rgMatches.map(match => (
                <div key={match.id} className="match-card tennis">
                  <div className="match-info">
                    <span className="match-group">{match.stage}</span>
                    <span className="match-time">{match.date} · {match.time}</span>
                  </div>
                  <div className="match-teams">
                    <div className="team home">
                      <span className="team-name">{match.home}</span>
                      {match.homeFlag !== 'xx' && (
                        <img src={`https://flagcdn.com/w40/${match.homeFlag}.png`} alt="" className="team-flag" />
                      )}
                      <span className="team-score pending">-</span>
                    </div>
                    <div className="team away">
                      <span className="team-score pending">-</span>
                      {match.awayFlag !== 'xx' && (
                        <img src={`https://flagcdn.com/w40/${match.awayFlag}.png`} alt="" className="team-flag" />
                      )}
                      <span className="team-name">{match.away}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* WORLD CUP MATCHES */}
        {tournament === 'wc2026' && Object.entries(matchesByDate).map(([date, matches]) => (
          <div key={date} className="date-group">
            <div className="date-header">{formatDate(date)}</div>
            <div className="matches-list">
              {matches.map(match => {
                const homeTeam = getTeam(match.home)
                const awayTeam = getTeam(match.away)
                const hasScore = match.home_score !== null && match.home_score !== undefined

                return (
                  <div key={match.id} className="match-card">
                    <div className="match-info">
                      <span className="match-group">{match.group ? `Group ${match.group}` : match.label}</span>
                      <span className="match-time">{match.timeET} ET</span>
                    </div>
                    <div className="match-teams">
                      <div className="team home">
                        {homeTeam ? (
                          <>
                            <span className="team-name">{homeTeam.name}</span>
                            <img src={flagUrl(homeTeam.code, 40)} alt={homeTeam.code} className="team-flag" />
                          </>
                        ) : (
                          <span className="team-name tbd">{match.label?.split(' vs ')[0] || 'TBD'}</span>
                        )}
                        <span className={`team-score ${hasScore ? '' : 'pending'}`}>
                          {hasScore ? match.home_score : '-'}
                        </span>
                      </div>
                      <div className="team away">
                        <span className={`team-score ${hasScore ? '' : 'pending'}`}>
                          {hasScore ? match.away_score : '-'}
                        </span>
                        {awayTeam ? (
                          <>
                            <img src={flagUrl(awayTeam.code, 40)} alt={awayTeam.code} className="team-flag" />
                            <span className="team-name">{awayTeam.name}</span>
                          </>
                        ) : (
                          <span className="team-name tbd">{match.label?.split(' vs ')[1] || 'TBD'}</span>
                        )}
                      </div>
                    </div>
                    <div className="match-venue">{match.venue}, {match.city}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {displayMatches.length === 0 && (
          <div className="empty-state">
            <p>No matches scheduled for this stage yet.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .tournament-selector {
          background: var(--bg);
          padding: 1rem 2rem;
          border-bottom: 1px solid var(--line);
          display: flex;
          justify-content: center;
        }
        .tournament-dropdown {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.6rem 1.5rem;
          background: var(--bg2);
          border: 2px solid var(--gold);
          border-radius: 4px;
          color: var(--gold);
          cursor: pointer;
          min-width: 280px;
          text-align: center;
        }
        .tournament-dropdown:focus {
          outline: none;
          border-color: var(--gold2);
        }
        .tournament-dropdown option {
          background: var(--bg2);
          color: var(--f1);
        }
        .rg-matches {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .match-card.tennis {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 6px;
          padding: 1rem;
        }
        .no-matches {
          text-align: center;
          padding: 3rem;
          color: var(--f3);
          font-size: 0.9rem;
        }
        .tab-nav {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          overflow-x: auto;
        }
        .tab-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
        }
        .tab {
          padding: 0 1.25rem;
          height: 44px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s;
        }
        .tab:hover { color: var(--f1); }
        .tab.active { color: var(--white); border-bottom-color: var(--gold); }

        .matchday-bar {
          background: var(--bg3);
          border-bottom: 1px solid var(--line);
          padding: 0.75rem 2rem;
        }
        .matchday-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          gap: 0.5rem;
        }
        .md-btn {
          padding: 0.5rem 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: var(--bg2);
          color: var(--f3);
          border: 1px solid var(--line);
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .md-btn:hover { background: var(--bg4); color: var(--f1); }
        .md-btn.active { background: var(--gold); color: #000; border-color: var(--gold); }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 2rem; }

        .date-group { margin-bottom: 2rem; }
        .date-header {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--line);
        }

        .matches-list { display: flex; flex-direction: column; gap: 1px; }

        .match-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }
        .match-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .match-group {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f4);
        }
        .match-time {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--f3);
        }

        .match-teams {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .team {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }
        .team.home { justify-content: flex-end; }
        .team.away { justify-content: flex-start; }
        .team-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--f1);
        }
        .team-name.tbd { color: var(--f4); font-style: italic; }
        .team-flag {
          width: 32px;
          height: 22px;
          border-radius: 2px;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .team-score {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--gold);
          min-width: 30px;
          text-align: center;
        }
        .team-score.pending { color: var(--f4); }

        .match-venue {
          font-size: 0.72rem;
          color: var(--f4);
          text-align: center;
          margin-top: 0.75rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--f3);
        }

        @media (max-width: 768px) {
          .wrap { padding: 1rem; }
          .tab { padding: 0 0.75rem; font-size: 0.72rem; }
          .matchday-bar { padding: 0.75rem 1rem; }
        }
      `}</style>
    </AppShell>
  )
}
