'use client'

export default function Badge({ type, children, pulse }) {
  const typeClasses = {
    live: 'badge-live',
    open: 'badge-open',
    locked: 'badge-locked',
    completed: 'badge-done',
    commissioner: 'badge-commissioner',
    you: 'badge-you',
  }

  return (
    <span className={`badge ${typeClasses[type] || ''} ${pulse ? 'pulse' : ''}`}>
      {type === 'live' && <span className="pulse-dot" />}
      {children}

      <style jsx>{`
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.625rem;
          border-radius: 4px;
          font-size: 0.6875rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-live {
          background: var(--accent-red);
          color: white;
          animation: pulse-badge 2s ease-in-out infinite;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
          animation: pulse-dot 1s ease-in-out infinite;
        }

        .badge-open {
          background: rgba(0, 213, 99, 0.15);
          color: var(--accent-green);
          border: 1px solid rgba(0, 213, 99, 0.3);
        }

        .badge-locked {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .badge-done {
          background: rgba(107, 107, 122, 0.15);
          color: #6b6b7a;
          border: 1px solid rgba(107, 107, 122, 0.3);
        }

        .badge-commissioner {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .badge-you {
          background: rgba(0, 213, 99, 0.15);
          color: var(--accent-green);
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
        }
      `}</style>
    </span>
  )
}
