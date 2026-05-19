'use client'

export default function Leaderboard({ members, currentUserId, commissionerId }) {
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span className="col-rank">Rank</span>
        <span className="col-player">Player</span>
        <span className="col-points">Points</span>
      </div>
      
      <div className="leaderboard-body">
        {members.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <p>No members yet</p>
          </div>
        ) : (
          members.map((member, index) => {
            const isYou = member.user_id === currentUserId
            const isCommissioner = member.user_id === commissionerId
            
            return (
              <div 
                key={member.id} 
                className={`leaderboard-row ${isYou ? 'is-you' : ''} ${index < 3 ? `top-${index + 1}` : ''}`}
              >
                <div className="col-rank">
                  <span className={`rank-badge ${index < 3 ? `rank-${index + 1}` : 'rank-default'}`}>
                    {getRankBadge(member.rank)}
                  </span>
                </div>
                
                <div className="col-player">
                  <div className="player-avatar">
                    {member.profiles?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="player-info">
                    <span className="player-name">
                      {member.profiles?.name || 'Unknown'}
                    </span>
                    <div className="player-badges">
                      {isYou && <span className="badge badge-you">You</span>}
                      {isCommissioner && <span className="badge badge-commissioner">Commish</span>}
                    </div>
                  </div>
                </div>
                
                <div className="col-points">
                  <span className="points-value">{member.total_points || 0}</span>
                  <span className="points-label">pts</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <style jsx>{`
        .leaderboard {
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          overflow: hidden;
        }

        .leaderboard-header {
          display: grid;
          grid-template-columns: 60px 1fr 80px;
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-default);
        }

        .leaderboard-header span {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          font-family: 'Inter', sans-serif;
        }

        .col-rank { text-align: center; }
        .col-points { text-align: right; }

        .leaderboard-body {
          max-height: 400px;
          overflow-y: auto;
        }

        .leaderboard-row {
          display: grid;
          grid-template-columns: 60px 1fr 80px;
          align-items: center;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--border-default);
          transition: background 0.15s ease;
        }

        .leaderboard-row:last-child {
          border-bottom: none;
        }

        .leaderboard-row:hover {
          background: var(--bg-tertiary);
        }

        .leaderboard-row.is-you {
          background: rgba(0, 213, 99, 0.05);
        }

        .leaderboard-row.top-1 {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, transparent 100%);
        }

        .leaderboard-row.top-2 {
          background: linear-gradient(90deg, rgba(192, 192, 192, 0.08) 0%, transparent 100%);
        }

        .leaderboard-row.top-3 {
          background: linear-gradient(90deg, rgba(205, 127, 50, 0.08) 0%, transparent 100%);
        }

        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 28px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-size: 0.8125rem;
          font-weight: 700;
        }

        .rank-badge.rank-1 {
          background: linear-gradient(135deg, #ffd700 0%, #ffb800 100%);
          color: #000;
        }

        .rank-badge.rank-2 {
          background: linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%);
          color: #000;
        }

        .rank-badge.rank-3 {
          background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
          color: #000;
        }

        .rank-badge.rank-default {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px solid var(--border-default);
        }

        .col-player {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .player-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-secondary);
          font-family: 'Inter', sans-serif;
        }

        .player-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .player-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .player-badges {
          display: flex;
          gap: 0.375rem;
        }

        .badge {
          display: inline-flex;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
          font-size: 0.5625rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-you {
          background: rgba(0, 213, 99, 0.15);
          color: var(--accent-green);
        }

        .badge-commissioner {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .col-points {
          display: flex;
          align-items: baseline;
          justify-content: flex-end;
          gap: 0.25rem;
        }

        .points-value {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent-green);
        }

        .points-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .empty-state {
          padding: 3rem 1rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .empty-state p {
          color: var(--text-muted);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
