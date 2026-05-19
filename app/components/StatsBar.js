'use client'

export default function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-item ${stat.highlight ? 'highlight' : ''}`}>
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}

      <style jsx>{`
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 0.75rem;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: 12px;
        }

        .stat-item {
          text-align: center;
          padding: 0.75rem;
          border-radius: 8px;
          background: var(--bg-tertiary);
        }

        .stat-item.highlight {
          background: rgba(0, 213, 99, 0.08);
          border: 1px solid rgba(0, 213, 99, 0.2);
        }

        .stat-value {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-item.highlight .stat-value {
          color: var(--accent-green);
        }

        .stat-label {
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        @media (max-width: 480px) {
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}
