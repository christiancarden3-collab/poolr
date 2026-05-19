'use client'

import { useState } from 'react'
import Link from 'next/link'

const PUBLIC_POOLS = [
  { name: 'La Quiniela Oficial', commissioner: 'Pedro M.', tournament: 'World Cup 2026', players: 31, max: 50, buyin: 'Free', status: 'live', joined: false },
  { name: 'WC2026 Open Championship', commissioner: 'Sarah K.', tournament: 'World Cup 2026', players: 87, max: null, buyin: '$10', status: 'live', joined: false },
  { name: 'Americas Rivalry Pool', commissioner: 'Carlos R.', tournament: 'World Cup 2026', players: 22, max: 30, buyin: 'Free', status: 'live', joined: true },
  { name: 'European HQ Picks', commissioner: 'Emma T.', tournament: 'World Cup 2026', players: 18, max: 25, buyin: '$5', status: 'live', joined: false },
  { name: 'Reddit Soccer WC26', commissioner: 'FootballFan99', tournament: 'World Cup 2026', players: 142, max: null, buyin: 'Free', status: 'live', joined: false },
  { name: 'Global Prediction League', commissioner: 'Aisha N.', tournament: 'World Cup 2026', players: 56, max: 100, buyin: '$20', status: 'upcoming', joined: false },
  { name: 'South American Special', commissioner: 'Diego V.', tournament: 'World Cup 2026', players: 9, max: 20, buyin: 'Free', status: 'upcoming', joined: false },
  { name: 'Expats United WC26', commissioner: 'Mike O.', tournament: 'World Cup 2026', players: 14, max: null, buyin: '$15', status: 'upcoming', joined: false },
]

export default function BrowsePage() {
  const [search, setSearch] = useState('')
  const [pools, setPools] = useState(PUBLIC_POOLS)

  const filteredPools = pools.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.commissioner.toLowerCase().includes(search.toLowerCase())
  )

  const handleJoin = (index) => {
    const newPools = [...pools]
    newPools[index].joined = true
    setPools(newPools)
  }

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" className="nav-cta">Create Account</Link>
        </div>
      </nav>

      <div className="browse-page">
        <div className="page-header-browse">
          <div>
            <div className="ph-title">Browse Public Pools</div>
            <div className="ph-sub">Find and join open prediction pools for World Cup 2026</div>
          </div>
          <Link href="/create" className="nav-cta-lg">+ Create Pool</Link>
        </div>

        <div className="filters">
          <input 
            className="filter-search" 
            type="text" 
            placeholder="Search pool name or commissioner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filter-select">
            <option value="">All tournaments</option>
            <option value="wc2026">World Cup 2026</option>
          </select>
          <select className="filter-select">
            <option value="">All buy-ins</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
          <select className="filter-select">
            <option value="">Any status</option>
            <option value="open">Open to join</option>
            <option value="live">Live now</option>
          </select>
        </div>

        <div className="pools-table">
          <div className="pt-head">
            <div className="pt-col">Pool name</div>
            <div className="pt-col">Tournament</div>
            <div className="pt-col r">Players</div>
            <div className="pt-col r">Buy-in</div>
            <div className="pt-col">Status</div>
            <div className="pt-col"></div>
          </div>
          {filteredPools.map((p, i) => (
            <div key={i} className="pt-row">
              <div>
                <div className="pt-name">{p.name}</div>
                <div className="pt-commissioner">
                  by {p.commissioner}
                  {p.max ? ` · ${p.players}/${p.max} players` : ''}
                </div>
              </div>
              <div className="pt-tournament">
                <div className="pt-flag"><img src="https://flagcdn.com/w40/us.png" alt="WC26" /></div>
                WC 2026
              </div>
              <div className="pt-val r">{p.players}</div>
              <div className={`pt-val r ${p.buyin === 'Free' ? 'gold' : ''}`}>{p.buyin}</div>
              <div className="pt-status">
                <span className={`status-dot ${p.status === 'live' ? 'dot-live' : 'dot-upcoming'}`}></span>
                <span style={{ color: p.status === 'live' ? 'var(--red)' : 'var(--gold)' }}>
                  {p.status === 'live' ? 'Live' : 'Starting Jun 11'}
                </span>
              </div>
              <div>
                {p.joined ? (
                  <span className="btn-joined">✓ Joined</span>
                ) : (
                  <button className="btn-join-sm" onClick={() => handleJoin(i)}>Join Pool</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPools.length === 0 && (
          <div className="browse-empty">
            No pools match your search. <span onClick={() => setSearch('')}>Clear filters</span>
          </div>
        )}
      </div>

      <style jsx>{`
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
        }
        .nav-logo span { color: var(--gold); }
        .nav-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--f1); }
        .nav-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.45rem 1.1rem;
          border-radius: 2px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nav-cta:hover { background: var(--gold2); }

        .browse-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header-browse {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--white);
        }
        .ph-sub {
          font-size: 0.82rem;
          color: var(--f3);
          margin-top: 0.2rem;
        }
        .nav-cta-lg {
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
          transition: background 0.15s;
        }
        .nav-cta-lg:hover { background: var(--gold2); }

        .filters {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .filter-search {
          background: var(--bg2);
          border: 1px solid var(--f4);
          color: var(--f1);
          padding: 0.4rem 0.85rem;
          border-radius: 3px;
          font-size: 0.82rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.15s;
          min-width: 220px;
        }
        .filter-search:focus { border-color: var(--gold); }
        .filter-search::placeholder { color: var(--f4); }
        .filter-select {
          background: var(--bg2);
          border: 1px solid var(--f4);
          color: var(--f2);
          padding: 0.4rem 0.75rem;
          border-radius: 3px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .filter-select:focus { border-color: var(--gold); }

        .pools-table {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          overflow: hidden;
        }
        .pt-head {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.8fr 120px;
          gap: 0 1rem;
          padding: 0.5rem 1.25rem;
          border-bottom: 1px solid var(--line);
          background: var(--bg3);
        }
        .pt-col {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--f4);
        }
        .pt-col.r { text-align: right; }
        .pt-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.8fr 120px;
          gap: 0 1rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center;
          transition: background 0.15s;
          cursor: pointer;
        }
        .pt-row:last-child { border-bottom: none; }
        .pt-row:hover { background: rgba(255,255,255,0.025); }
        .pt-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--f1);
        }
        .pt-commissioner {
          font-size: 0.72rem;
          color: var(--f3);
          margin-top: 2px;
        }
        .pt-tournament {
          font-size: 0.78rem;
          color: var(--f2);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pt-flag img {
          width: 18px;
          height: 13px;
          border-radius: 1px;
          object-fit: cover;
        }
        .pt-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--f2);
        }
        .pt-val.r { text-align: right; }
        .pt-val.gold { color: var(--gold); }
        .pt-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-live {
          background: var(--red);
          animation: pulse 1.4s ease infinite;
        }
        .dot-upcoming { background: var(--gold); }
        .btn-join-sm {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-join-sm:hover { background: var(--gold2); }
        .btn-joined {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--green);
          border: 1px solid rgba(44,182,125,0.3);
          padding: 0.32rem 0.85rem;
          border-radius: 2px;
          cursor: default;
        }

        .browse-empty {
          text-align: center;
          padding: 1.5rem 0;
          font-size: 0.78rem;
          color: var(--f3);
        }
        .browse-empty span {
          color: var(--gold);
          cursor: pointer;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        @media (max-width: 768px) {
          .browse-page { padding: 1rem; }
          .pt-head, .pt-row { grid-template-columns: 1fr auto 80px; }
          .pt-col:nth-child(n+3):not(:last-child),
          .pt-row > *:nth-child(n+3):not(:last-child) { display: none; }
          .filters { gap: 0.4rem; }
          .filter-search { min-width: 100%; order: -1; }
          .pools-table { border-radius: 0; border-left: none; border-right: none; }
          .page-header-browse { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
      `}</style>
    </>
  )
}
