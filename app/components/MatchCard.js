'use client'

export default function MatchCard({ 
  match, 
  homeTeam, 
  awayTeam, 
  prediction, 
  onUpdatePrediction,
  isLocked = false 
}) {
  const isPredicted = prediction?.homeScore !== undefined && prediction?.awayScore !== undefined

  return (
    <div className={`match-card ${isPredicted ? 'predicted' : ''} ${isLocked ? 'locked' : ''}`}>
      {isLocked && <div className="locked-badge">LOCKED</div>}
      
      <div className="match-meta">
        <span className="match-date">
          {new Date(match.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <span className="match-divider">•</span>
        <span className="match-time">{match.time}</span>
      </div>
      
      <div className="match-content">
        <div className="team home">
          <span className="team-flag">{homeTeam?.flag}</span>
          <span className="team-name">{homeTeam?.name}</span>
        </div>
        
        <div className="score-section">
          <input
            type="number"
            min="0"
            max="20"
            value={prediction?.homeScore ?? ''}
            onChange={(e) => onUpdatePrediction(match.id, 'homeScore', e.target.value)}
            placeholder="-"
            disabled={isLocked}
            className="score-input"
          />
          <span className="vs-badge">VS</span>
          <input
            type="number"
            min="0"
            max="20"
            value={prediction?.awayScore ?? ''}
            onChange={(e) => onUpdatePrediction(match.id, 'awayScore', e.target.value)}
            placeholder="-"
            disabled={isLocked}
            className="score-input"
          />
        </div>
        
        <div className="team away">
          <span className="team-name">{awayTeam?.name}</span>
          <span className="team-flag">{awayTeam?.flag}</span>
        </div>
      </div>
      
      <div className="match-venue">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.33333C5.42 1.33333 3.33333 3.42 3.33333 6C3.33333 9.5 8 14.6667 8 14.6667C8 14.6667 12.6667 9.5 12.6667 6C12.6667 3.42 10.58 1.33333 8 1.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {match.venue}
      </div>

      <style jsx>{`
        .match-card {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          transition: all 0.2s ease;
          position: relative;
        }

        .match-card.predicted {
          border-color: var(--accent-green);
          background: linear-gradient(135deg, rgba(0, 213, 99, 0.03) 0%, transparent 50%);
        }

        .match-card.locked {
          opacity: 0.6;
        }

        .locked-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(107, 107, 122, 0.15);
          color: var(--text-muted);
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.05em;
        }

        .match-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .match-date, .match-time {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .match-divider {
          color: var(--border-light);
        }

        .match-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .team {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex: 1;
          min-width: 0;
        }

        .team.home {
          justify-content: flex-end;
        }

        .team.away {
          justify-content: flex-start;
        }

        .team-flag {
          font-size: 1.75rem;
          line-height: 1;
        }

        .team-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .score-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .score-input {
          width: 48px;
          height: 48px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-light);
          border-radius: 10px;
          color: var(--text-primary);
          padding: 0;
          -moz-appearance: textfield;
        }

        .score-input::-webkit-outer-spin-button,
        .score-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .score-input:focus {
          border-color: var(--accent-green);
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 213, 99, 0.15);
        }

        .score-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .score-input::placeholder {
          color: var(--text-muted);
        }

        .vs-badge {
          font-family: 'Inter', sans-serif;
          font-size: 0.6875rem;
          font-weight: 700;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .match-venue {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          margin-top: 0.875rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 480px) {
          .team-name {
            font-size: 0.75rem;
          }
          
          .team-flag {
            font-size: 1.5rem;
          }
          
          .score-input {
            width: 42px;
            height: 42px;
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  )
}
