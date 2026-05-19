'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const teams = [
  { code: 'ar', name: 'Argentina' }, { code: 'fr', name: 'France' },
  { code: 'br', name: 'Brazil' }, { code: 'es', name: 'Spain' },
  { code: 'de', name: 'Germany' }, { code: 'pt', name: 'Portugal' },
  { code: 'gb-eng', name: 'England' }, { code: 'nl', name: 'Netherlands' },
]

const players = [
  { name: 'Kylian Mbappé', team: 'France', flag: 'fr' },
  { name: 'Lionel Messi', team: 'Argentina', flag: 'ar' },
  { name: 'Vinicius Jr', team: 'Brazil', flag: 'br' },
  { name: 'Harry Kane', team: 'England', flag: 'gb-eng' },
]

const goalkeepers = [
  { name: 'Emiliano Martínez', team: 'Argentina', flag: 'ar' },
  { name: 'Alisson Becker', team: 'Brazil', flag: 'br' },
  { name: 'Rui Patrício', team: 'Portugal', flag: 'pt' },
  { name: 'David Raya', team: 'Spain', flag: 'es' },
]

export default function SpecialPicksPage() {
  const params = useParams()
  const [champion, setChampion] = useState('ar')
  const [runnerUp, setRunnerUp] = useState('fr')
  const [topScorer, setTopScorer] = useState('Kylian Mbappé')
  const [goalkeeper, setGoalkeeper] = useState(null)
  const [scorerSearch, setScorerSearch] = useState('')
  const [gkSearch, setGkSearch] = useState('')

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${params.id}`} className="nav-item active">Amigos WC26</Link>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › Amigos WC26 Pool</div>
            <div className="ph-title">Special Picks</div>
            <div className="ph-meta">FIFA World Cup 2026 · 14 players</div>
          </div>
          <div className="ph-right">
            <div className="ph-score">47 pts</div>
            <div className="ph-rank">3rd place</div>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <div className="tab-nav-inner">
          <Link href={`/pool/${params.id}/predictions`} className="tab">Match Picks<span className="tab-badge">2</span></Link>
          <span className="tab active">Special Picks</span>
          <span className="tab">Leaderboard</span>
        </div>
      </div>

      <div className="wrap">
        <div className="two-col">
          <div>
            {/* Lock warning */}
            <div className="sp-lock-banner">
              <div>
                <div className="slb-title">⚠ Locks at first kickoff — Jun 11, 5:00 PM ET</div>
                <div className="slb-sub">All special picks lock permanently when the tournament begins. You cannot change them once the first match starts.</div>
              </div>
            </div>

            {/* Champion */}
            <div className="sp-card">
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🏆</div><div className="sp-title">Champion</div></div>
                <div className="sp-pts">10 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that wins the 2026 World Cup.</div>
                <div className="team-grid">
                  {teams.map(t => (
                    <div key={t.code} className={`tg-opt ${champion === t.code ? 'sel' : ''}`} onClick={() => setChampion(t.code)}>
                      <img src={`https://flagcdn.com/w40/${t.code}.png`} alt={t.name} />
                      <div className="tg-opt-name">{t.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">Selected: <strong style={{ color: 'var(--gold)' }}>{teams.find(t => t.code === champion)?.name}</strong></div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Runner-up */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🥈</div><div className="sp-title">Runner-Up</div></div>
                <div className="sp-pts">7 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the team that reaches the final but finishes second.</div>
                <div className="team-grid">
                  {teams.map(t => (
                    <div key={t.code} className={`tg-opt ${runnerUp === t.code ? 'sel' : ''}`} onClick={() => setRunnerUp(t.code)}>
                      <img src={`https://flagcdn.com/w40/${t.code}.png`} alt={t.name} />
                      <div className="tg-opt-name">{t.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">Selected: <strong style={{ color: 'var(--gold)' }}>{teams.find(t => t.code === runnerUp)?.name}</strong></div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Top Scorer */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">⚽</div><div className="sp-title">Pichichi — Top Scorer</div></div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the player who scores the most goals in the tournament.</div>
                <input 
                  className="player-search" 
                  type="text" 
                  placeholder="Search player name or country..."
                  value={scorerSearch}
                  onChange={(e) => setScorerSearch(e.target.value)}
                />
                <div className="player-results">
                  {players.filter(p => !scorerSearch || p.name.toLowerCase().includes(scorerSearch.toLowerCase())).map(p => (
                    <div key={p.name} className={`pr-item ${topScorer === p.name ? 'sel-player' : ''}`} onClick={() => setTopScorer(p.name)}>
                      <div className="pr-flag"><img src={`https://flagcdn.com/w40/${p.flag}.png`} alt="" /></div>
                      <div><div className="pr-name">{p.name}</div><div className="pr-team">{p.team}</div></div>
                      {topScorer === p.name && <div className="pr-check">✓</div>}
                    </div>
                  ))}
                </div>
                {topScorer && (
                  <div className="selected-pick">
                    <div className="sel-flag"><img src={`https://flagcdn.com/w40/${players.find(p => p.name === topScorer)?.flag}.png`} alt="" /></div>
                    <div><div className="sel-name">{topScorer}</div><div className="sel-team">{players.find(p => p.name === topScorer)?.team}</div></div>
                    <div className="sel-change" onClick={() => setTopScorer(null)}>Change</div>
                  </div>
                )}
              </div>
              <div className="sp-foot">
                <div className="sp-foot-note">Selected: <strong style={{ color: 'var(--gold)' }}>{topScorer ? topScorer.split(' ')[0][0] + '. ' + topScorer.split(' ').slice(-1) : '—'}</strong></div>
                <button className="btn-save">Save</button>
              </div>
            </div>

            {/* Best Goalkeeper */}
            <div className="sp-card" style={{ marginTop: '2px' }}>
              <div className="sp-head">
                <div className="sp-title-group"><div className="sp-icon">🥅</div><div className="sp-title">Best Goalkeeper</div></div>
                <div className="sp-pts">5 pts</div>
              </div>
              <div className="sp-body">
                <div className="sp-desc">Pick the goalkeeper awarded the Golden Glove at the end of the tournament.</div>
                <input 
                  className="player-search" 
                  type="text" 
                  placeholder="Search goalkeeper name or country..."
                  value={gkSearch}
                  onChange={(e) => setGkSearch(e.target.value)}
                />
                <div className="player-results">
                  {goalkeepers.filter(p => !gkSearch || p.name.toLowerCase().includes(gkSearch.toLowerCase())).map(p => (
                    <div key={p.name} className={`pr-item ${goalkeeper === p.name ? 'sel-player' : ''}`} onClick={() => setGoalkeeper(p.name)}>
                      <div className="pr-flag"><img src={`https://flagcdn.com/w40/${p.flag}.png`} alt="" /></div>
                      <div><div className="pr-name">{p.name}</div><div className="pr-team">{p.team}</div></div>
                      {goalkeeper === p.name && <div className="pr-check">✓</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="sp-foot">
                <div className={`sp-foot-note ${!goalkeeper ? 'missing' : ''}`}>
                  {goalkeeper ? <>Selected: <strong style={{ color: 'var(--gold)' }}>{goalkeeper}</strong></> : '⚠ No pick saved yet'}
                </div>
                <button className="btn-save">Save</button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card">
              <div className="card-head"><div className="card-title">Special Picks Status</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Champion</div><div className="sc-val green">✓ {teams.find(t => t.code === champion)?.name}</div></div>
                <div className="sc-row"><div className="sc-label">Runner-up</div><div className="sc-val green">✓ {teams.find(t => t.code === runnerUp)?.name}</div></div>
                <div className="sc-row"><div className="sc-label">Top scorer</div><div className="sc-val green">✓ {topScorer?.split(' ').slice(-1)}</div></div>
                <div className="sc-row"><div className="sc-label" style={{ color: goalkeeper ? 'var(--f3)' : 'var(--red)' }}>Goalkeeper</div><div className="sc-val" style={{ color: goalkeeper ? 'var(--green)' : 'var(--red)' }}>{goalkeeper ? `✓ ${goalkeeper}` : '⚠ Missing'}</div></div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><div className="card-title">Points Available</div></div>
              <div className="card-body">
                <div className="sc-row"><div className="sc-label">Champion</div><div className="sc-val gold">10 pts</div></div>
                <div className="sc-row"><div className="sc-label">Runner-up</div><div className="sc-val gold">7 pts</div></div>
                <div className="sc-row"><div className="sc-label">Top scorer</div><div className="sc-val gold">5 pts</div></div>
                <div className="sc-row"><div className="sc-label">Best goalkeeper</div><div className="sc-val gold">5 pts</div></div>
                <div className="sc-row" style={{ borderTop: '1px solid var(--line)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <div className="sc-label" style={{ fontWeight: 600 }}>Total</div>
                  <div className="sc-val gold" style={{ fontSize: '1.1rem' }}>27 pts</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ borderColor: 'rgba(224,59,59,0.2)' }}>
              <div className="card-head" style={{ background: 'rgba(224,59,59,0.08)', borderColor: 'rgba(224,59,59,0.15)' }}>
                <div className="card-title" style={{ color: 'var(--red)' }}>Deadline</div>
              </div>
              <div className="card-body">
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>Jun 11</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--f3)', marginTop: '4px' }}>5:00 PM ET — First kickoff</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--f4)', marginTop: '8px', lineHeight: 1.5 }}>All special picks lock the moment the first match starts. No exceptions.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid var(--f4); text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        .page-header { background: var(--bg2); border-bottom: 1px solid var(--line); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: var(--white); }
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; }
        .ph-right { text-align: right; }
        .ph-score { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; color: var(--gold); line-height: 1; }
        .ph-rank { font-size: 0.72rem; color: var(--f3); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Barlow Condensed', sans-serif; margin-top: 2px; }

        .tab-nav { background: var(--bg2); border-bottom: 1px solid var(--line); }
        .tab-nav-inner { max-width: 1100px; margin: 0 auto; display: flex; }
        .tab { display: flex; align-items: center; gap: 0.4rem; padding: 0 1.5rem; height: 44px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); border-bottom: 2px solid transparent; cursor: pointer; text-decoration: none; }
        .tab:hover { color: var(--f1); }
        .tab.active { color: var(--white); border-bottom-color: var(--gold); }
        .tab-badge { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--gold); color: #000; font-size: 0.6rem; font-weight: 900; }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .two-col { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }

        .sp-lock-banner { display: flex; align-items: flex-start; gap: 0.75rem; background: rgba(201,168,76,0.07); border: 1px solid var(--gold-line); border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; }
        .slb-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold); }
        .slb-sub { font-size: 0.72rem; color: var(--f3); margin-top: 3px; line-height: 1.5; }

        .sp-card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
        .sp-head { background: var(--bg3); padding: 0.5rem 1rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .sp-title-group { display: flex; align-items: center; gap: 0.6rem; }
        .sp-icon { font-size: 1rem; }
        .sp-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.88rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--white); }
        .sp-pts { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.15rem 0.5rem; border-radius: 2px; background: rgba(201,168,76,0.12); color: var(--gold); border: 1px solid var(--gold-line); }
        .sp-body { padding: 1rem; }
        .sp-desc { font-size: 0.77rem; color: var(--f3); margin-bottom: 0.75rem; line-height: 1.5; }
        .sp-foot { border-top: 1px solid var(--line); padding: 0.6rem 1rem; display: flex; align-items: center; justify-content: space-between; }
        .sp-foot-note { font-size: 0.7rem; color: var(--f4); }
        .sp-foot-note.missing { color: var(--red); }

        .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .tg-opt { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 0.6rem 0.5rem; border-radius: 3px; background: var(--bg3); border: 1px solid var(--line); cursor: pointer; transition: all 0.15s; }
        .tg-opt:hover { border-color: var(--f3); }
        .tg-opt.sel { border-color: var(--gold); background: rgba(201,168,76,0.08); }
        .tg-opt img { width: 36px; height: 25px; border-radius: 2px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
        .tg-opt-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--f2); text-align: center; }
        .tg-opt.sel .tg-opt-name { color: var(--gold); }

        .player-search { width: 100%; padding: 0.55rem 0.85rem; background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; color: var(--f1); font-size: 0.82rem; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.15s; margin-bottom: 0.5rem; }
        .player-search:focus { border-color: var(--gold); }
        .player-search::placeholder { color: var(--f4); }
        .player-results { background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; overflow: hidden; }
        .pr-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.15s; }
        .pr-item:last-child { border-bottom: none; }
        .pr-item:hover { background: rgba(255,255,255,0.04); }
        .pr-item.sel-player { background: rgba(201,168,76,0.08); }
        .pr-flag img { width: 20px; height: 14px; border-radius: 1px; object-fit: cover; }
        .pr-name { font-size: 0.82rem; font-weight: 500; color: var(--f1); }
        .pr-team { font-size: 0.7rem; color: var(--f3); }
        .pr-check { margin-left: auto; color: var(--gold); font-weight: 700; }

        .selected-pick { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.85rem; background: rgba(201,168,76,0.06); border: 1px solid var(--gold-line); border-radius: 3px; margin-top: 0.5rem; }
        .sel-flag img { width: 28px; height: 19px; border-radius: 2px; object-fit: cover; }
        .sel-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: var(--white); }
        .sel-team { font-size: 0.7rem; color: var(--f3); }
        .sel-change { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--f4); cursor: pointer; text-decoration: underline; }
        .sel-change:hover { color: var(--f2); }

        .btn-save { font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.4rem 1.1rem; border-radius: 2px; border: none; cursor: pointer; }
        .btn-save:hover { background: var(--gold2); }

        .card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; margin-bottom: 1rem; }
        .card-head { background: var(--bg3); padding: 0.65rem 1rem; border-bottom: 1px solid var(--line); }
        .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .card-body { padding: 1rem; }
        .sc-row { display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .sc-row:last-child { border-bottom: none; }
        .sc-label { font-size: 0.75rem; color: var(--f3); }
        .sc-val { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 700; color: var(--f1); }
        .sc-val.gold { color: var(--gold); }
        .sc-val.green { color: var(--green); }

        @media (max-width: 900px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .two-col { grid-template-columns: 1fr; }
          .team-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  )
}
