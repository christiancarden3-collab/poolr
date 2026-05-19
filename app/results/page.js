'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TEAMS, MATCHES, getTeam, flagUrl } from '../../lib/wc2026-database'

export default function ResultsPage() {
  const [selectedMatchday, setSelectedMatchday] = useState(1)
  const [selectedStage, setSelectedStage] = useState('group')

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

  return (
    <>
      {/* NAV */}
      <nav>
        <a href="/" className="nav-logo">Pick<span>Poolr</span></a>
        <div className="nav-items">
          <a href="/" className="nav-item">Home</a>
          <a href="/dashboard" className="nav-item">My Pools</a>
          <a href="#" className="nav-item">World Cup 2026</a>
          <a href="/results" className="nav-item active">Results</a>
        </div>
        <a href="/create" className="nav-cta">+ Create Pool</a>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">World Cup 2026</div>
            <h1 className="ph-title">Match Results</h1>
            <p className="ph-meta">All scores and standings from the tournament</p>
          </div>
        </div>
      </div>

      {/* STAGE TABS */}
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

      {/* MATCHDAY SELECTOR (for group stage) */}
      {selectedStage === 'group' && (
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
        {Object.entries(matchesByDate).map(([date, matches]) => (
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
        :root {
          --bg: #0a0c10;
          --bg2: #111318;
          --bg3: #181c24;
          --bg4: #1e2330;
          --gold: #c9a84c;
          --gold2: #e6c76a;
          --red: #e03b3b;
          --green: #2cb67d;
          --white: #fff;
          --f1: #f0ede8;
          --f2: #c8c5be;
          --f3: #8a8780;
          --f4: #4a4845;
          --line: rgba(255,255,255,0.07);
          --gold-line: rgba(201,168,76,0.3);
        }

        body {
          background: var(--bg);
          color: var(--f1);
          font-family: 'Inter', sans-serif;
          margin: 0;
        }

        nav {
          background: var(--bg);
          border-bottom: 3px solid var(--gold);
          display: flex;
          align-items: center;
          padding: 0 2rem;
          height: 56px;
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .nav-logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          color: var(--white);
          text-transform: uppercase;
          text-decoration: none;
          margin-right: 2rem;
          padding-right: 2rem;
          border-right: 1px solid var(--f4);
        }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          border-bottom: 3px solid transparent;
          margin-bottom: -3px;
          transition: all 0.15s;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta {
          margin-left: auto;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.5rem 1.25rem;
          border-radius: 2px;
          text-decoration: none;
        }

        .page-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          padding: 1.5rem 2rem;
        }
        .page-header-inner { max-width: 1100px; margin: 0 auto; }
        .ph-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.3rem;
        }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--white);
          margin: 0;
        }
        .ph-meta { font-size: 0.82rem; color: var(--f3); margin-top: 0.25rem; }

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
          .nav-items { display: none; }
          nav { padding: 0 1rem; }
          .nav-logo { margin-right: 0; padding-right: 0; border-right: none; }
          .wrap { padding: 1rem; }
          .tab { padding: 0 0.75rem; font-size: 0.72rem; }
        }
      `}</style>
    </>
  )
}
