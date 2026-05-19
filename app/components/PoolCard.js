'use client'

import Link from 'next/link'

export default function PoolCard({ pool }) {
  const statusClass = pool.status === 'open' ? 'badge-open' : pool.status === 'locked' ? 'badge-locked' : 'badge-done'
  
  return (
    <Link href={`/pool/${pool.id}`} className="pool-card">
      <div className="card-header">
        <div className="card-title">
          <h3>{pool.name}</h3>
          <span className={`badge ${statusClass}`}>{pool.status}</span>
        </div>
        {pool.isCommissioner && (
          <span className="badge badge-commissioner">Commissioner</span>
        )}
      </div>
      
      <div className="card-stats">
        <div className="stat">
          <span className="stat-value">{pool.playerCount}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat">
          <span className="stat-value">{pool.buy_in === 0 ? 'Free' : `$${pool.buy_in}`}</span>
          <span className="stat-label">Buy-in</span>
        </div>
        <div className="stat primary">
          <span className="stat-value">${pool.prizePool?.toFixed(0) || 0}</span>
          <span className="stat-label">Prize Pool</span>
        </div>
      </div>
      
      <div className="card-footer">
        {!pool.isCommissioner && pool.myRank && (
          <div className="your-rank">
            <span className="rank-label">Your Rank</span>
            <span className="rank-value">#{pool.myRank}</span>
          </div>
        )}
        <div className="card-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .pool-card {
          display: block;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 12px;
          padding: 1.25rem;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .pool-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-green);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .pool-card:hover {
          border-color: var(--accent-green);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .pool-card:hover::before {
          opacity: 1;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 0.75rem;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        .card-title h3 {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .card-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .stat {
          text-align: center;
          padding: 0.625rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
        }

        .stat.primary {
          background: rgba(0, 213, 99, 0.08);
          border: 1px solid rgba(0, 213, 99, 0.2);
        }

        .stat-value {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat.primary .stat-value {
          color: var(--accent-green);
        }

        .stat-label {
          display: block;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: 0.125rem;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-default);
        }

        .your-rank {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rank-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .rank-value {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--accent-green);
        }

        .card-arrow {
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .pool-card:hover .card-arrow {
          color: var(--accent-green);
          transform: translateX(4px);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.1875rem 0.5rem;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-open {
          background: rgba(0, 213, 99, 0.15);
          color: var(--accent-green);
        }

        .badge-locked {
          background: rgba(251, 191, 36, 0.15);
          color: var(--accent-yellow);
        }

        .badge-done {
          background: rgba(107, 107, 122, 0.15);
          color: var(--text-muted);
        }

        .badge-commissioner {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent-blue);
        }
      `}</style>
    </Link>
  )
}
