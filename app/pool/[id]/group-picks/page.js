'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

// Official FIFA WC 2026 Groups - from Dec 5, 2025 draw
const GROUPS = [
  {g:'A', teams:[{c:'mx',n:'Mexico',id:'MEX'},{c:'za',n:'South Africa',id:'RSA'},{c:'kr',n:'South Korea',id:'KOR'},{c:'cz',n:'Czechia',id:'CZE'}]},
  {g:'B', teams:[{c:'ca',n:'Canada',id:'CAN'},{c:'ba',n:'Bosnia & Herz.',id:'BIH'},{c:'qa',n:'Qatar',id:'QAT'},{c:'ch',n:'Switzerland',id:'SUI'}]},
  {g:'C', teams:[{c:'br',n:'Brazil',id:'BRA'},{c:'ma',n:'Morocco',id:'MAR'},{c:'ht',n:'Haiti',id:'HAI'},{c:'gb-sct',n:'Scotland',id:'SCO'}]},
  {g:'D', teams:[{c:'us',n:'USA',id:'USA'},{c:'py',n:'Paraguay',id:'PAR'},{c:'au',n:'Australia',id:'AUS'},{c:'tr',n:'Turkey',id:'TUR'}]},
  {g:'E', teams:[{c:'de',n:'Germany',id:'GER'},{c:'cw',n:'Curaçao',id:'CUW'},{c:'ci',n:'Ivory Coast',id:'CIV'},{c:'ec',n:'Ecuador',id:'ECU'}]},
  {g:'F', teams:[{c:'nl',n:'Netherlands',id:'NED'},{c:'jp',n:'Japan',id:'JPN'},{c:'se',n:'Sweden',id:'SWE'},{c:'tn',n:'Tunisia',id:'TUN'}]},
  {g:'G', teams:[{c:'be',n:'Belgium',id:'BEL'},{c:'eg',n:'Egypt',id:'EGY'},{c:'ir',n:'Iran',id:'IRN'},{c:'nz',n:'New Zealand',id:'NZL'}]},
  {g:'H', teams:[{c:'es',n:'Spain',id:'ESP'},{c:'cv',n:'Cape Verde',id:'CPV'},{c:'sa',n:'Saudi Arabia',id:'KSA'},{c:'uy',n:'Uruguay',id:'URU'}]},
  {g:'I', teams:[{c:'fr',n:'France',id:'FRA'},{c:'sn',n:'Senegal',id:'SEN'},{c:'iq',n:'Iraq',id:'IRQ'},{c:'no',n:'Norway',id:'NOR'}]},
  {g:'J', teams:[{c:'ar',n:'Argentina',id:'ARG'},{c:'dz',n:'Algeria',id:'ALG'},{c:'at',n:'Austria',id:'AUT'},{c:'jo',n:'Jordan',id:'JOR'}]},
  {g:'K', teams:[{c:'pt',n:'Portugal',id:'POR'},{c:'cd',n:'DR Congo',id:'COD'},{c:'uz',n:'Uzbekistan',id:'UZB'},{c:'co',n:'Colombia',id:'COL'}]},
  {g:'L', teams:[{c:'gb-eng',n:'England',id:'ENG'},{c:'hr',n:'Croatia',id:'CRO'},{c:'gh',n:'Ghana',id:'GHA'},{c:'pa',n:'Panama',id:'PAN'}]},
]

const TEAM_BY_ID = {}
GROUPS.forEach(({g, teams}) => {
  teams.forEach(team => {
    team.group = g
    TEAM_BY_ID[team.id] = team
  })
})

const fl = c => `https://flagcdn.com/w40/${c}.png`

export default function GroupPicksPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [picks, setPicks] = useState({})
  
  const tournamentStart = new Date('2026-06-11T17:00:00-04:00')
  const deadline = new Date(tournamentStart.getTime() - 60*60*1000)
  const isLocked = new Date() >= deadline

  useEffect(() => {
    const initial = {}
    GROUPS.forEach(({g}) => initial[g] = [])
    setPicks(initial)
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) { router.push('/login'); return }
        setUser(currentUser)

        const { data: poolData } = await supabase
          .from('pools')
          .select('*')
          .eq('id', params.id)
          .single()
        setPool(poolData)

        const { data: memberData } = await supabase
          .from('pool_members')
          .select('*')
          .eq('pool_id', params.id)
          .eq('user_id', currentUser.id)
          .single()
        setPoolMember(memberData)

        const res = await fetch(`/api/group-picks?pool_id=${params.id}&user_id=${currentUser.id}`)
        const data = await res.json()
        if (data.success && data.picks) {
          setPicks(prev => ({ ...prev, ...data.picks }))
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id, router])

  const toggle = (g, teamId) => {
    if (isLocked) return
    setPicks(prev => {
      const sel = [...(prev[g] || [])]
      const idx = sel.indexOf(teamId)
      if (idx > -1) sel.splice(idx, 1)
      else if (sel.length < 2) sel.push(teamId)
      else sel[1] = teamId
      return { ...prev, [g]: sel }
    })
  }

  const saveAll = async () => {
    if (isLocked || !user) return
    const completeGroups = Object.values(picks).filter(p => p.length === 2).length
    if (completeGroups < GROUPS.length) {
      alert(`Complete all ${GROUPS.length} groups first. You have ${completeGroups} done.`)
      return
    }
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch('/api/group-picks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pool_id: params.id, user_id: user.id, picks })
      })
      const data = await res.json()
      if (data.success) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus(null), 3000)
      } else throw new Error(data.error || 'Save failed')
    } catch (err) {
      console.error('Save error:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  const doneCount = Object.values(picks).filter(p => p.length === 2).length
  const totalSel = Object.values(picks).reduce((a, p) => a + p.length, 0)

  const getUserInitials = () => {
    if (!user) return 'U'
    const meta = user.user_metadata || {}
    return ((meta.first_name?.[0] || user.email?.[0] || 'U') + (meta.last_name?.[0] || '')).toUpperCase()
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        :root{--bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--gold:#c9a84c;--gold2:#e6c76a;--green:#2cb67d;--f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;--line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3)}
        .loading{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);color:var(--f3)}

        .nav{background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:56px;position:sticky;top:0;z-index:200}
        .nav-logo{font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900;color:#fff;text-decoration:none;letter-spacing:0.04em}
        .nav-logo span{color:var(--gold)}
        .nav-right{margin-left:auto;display:flex;gap:1rem;align-items:center}
        .nav-link{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none}
        .nav-link:hover{color:var(--f1)}

        .hero{background:linear-gradient(180deg,#0f1420 0%,#07090e 100%);border-bottom:1px solid rgba(201,168,76,0.15);padding:1rem 1.5rem 0}
        .hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;padding-bottom:1rem}
        .h-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:0.25rem;display:flex;align-items:center;gap:6px}
        .h-eyebrow::before{content:'';width:14px;height:2px;background:var(--gold)}
        .h-name{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:#fff;line-height:1;margin-bottom:0.35rem}
        .h-tags{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
        .htag{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.16rem 0.5rem;border-radius:2px}
        .htag-green{border:1px solid rgba(44,182,125,0.25);color:var(--green);background:rgba(44,182,125,0.08)}
        .htag-gold{border:1px solid var(--gold-line);color:var(--gold);background:rgba(201,168,76,0.08)}
        .htag-outline{border:1px solid var(--f4);color:var(--f3)}
        .stats-row{display:flex;gap:0;border:1px solid rgba(201,168,76,0.18);border-radius:4px;overflow:hidden;flex-shrink:0;align-self:flex-start}
        .stat{padding:0.6rem 1rem;border-right:1px solid rgba(201,168,76,0.12);text-align:center;background:rgba(201,168,76,0.03);min-width:64px}
        .stat:last-child{border-right:none}
        .stat-n{font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:900;color:var(--gold);line-height:1}
        .stat-n.w{color:#fff}.stat-n.gr{color:var(--green)}
        .stat-l{font-family:'Barlow Condensed',sans-serif;font-size:0.55rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f4);margin-top:2px;white-space:nowrap}
        .tabs{display:flex;border-top:1px solid rgba(255,255,255,0.05);margin:0 -1.5rem;padding:0 1.5rem}
        .tab{font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);padding:0.65rem 1rem;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;text-decoration:none}
        .tab:hover{color:var(--f1)}
        .tab.active{color:#fff;border-bottom-color:var(--gold)}

        .body{display:grid;grid-template-columns:1fr 268px;gap:0;min-height:500px}
        .main{padding:1.1rem 1.5rem;border-right:1px solid var(--line);background:#07090e}
        .side{padding:1.1rem 1.25rem;background:#07090d}

        .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.85rem}
        .sec-title{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--f3)}
        .sec-right{display:flex;align-items:center;gap:8px}
        .prog-label{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;color:var(--f4)}
        .prog-label span{color:var(--gold)}
        .prog-bar-wrap{width:100px;height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden}
        .prog-bar-fill{height:100%;background:var(--gold);border-radius:2px;transition:width 0.3s}

        .groups-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        @media(max-width:1000px){.groups-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.groups-grid{grid-template-columns:1fr}.body{grid-template-columns:1fr}.side{border-top:1px solid var(--line)}}

        .gc{background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden;transition:border-color 0.2s}
        .gc.complete{border-color:rgba(201,168,76,0.3)}
        .gc-head{background:var(--bg3);padding:0.38rem 0.75rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}
        .gc-name{font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#fff}
        .gc-badge{font-family:'Barlow Condensed',sans-serif;font-size:0.5rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.1rem 0.35rem;border-radius:2px;background:rgba(255,255,255,0.05);color:var(--f4)}
        .gc-badge.done{background:rgba(201,168,76,0.12);color:var(--gold)}

        .tr{display:flex;align-items:center;gap:6px;padding:0.38rem 0.75rem;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.12s;user-select:none}
        .tr:last-of-type{border-bottom:none}
        .tr:hover{background:rgba(255,255,255,0.025)}
        .tr.s1{background:rgba(201,168,76,0.07)}
        .tr.s2{background:rgba(44,182,125,0.06)}
        .tr.el{opacity:0.28}
        .tr-flag{width:26px;height:17px;border-radius:2px;object-fit:cover;border:1px solid rgba(255,255,255,0.1);flex-shrink:0;background:var(--bg3)}
        .tr-name{font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:var(--f1);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .tr.s1 .tr-name{color:var(--gold2)}
        .tr.s2 .tr-name{color:#6de0a8}
        .tr-note{font-family:'Inter',sans-serif;font-size:0.52rem;color:var(--f4);flex-shrink:0;font-style:italic}
        .rb{width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Barlow Condensed',sans-serif;font-size:0.6rem;font-weight:900;flex-shrink:0}
        .rb1{background:var(--gold);color:#000}
        .rb2{background:rgba(44,182,125,0.18);border:1.5px solid rgba(44,182,125,0.4);color:#6de0a8}
        .rbe{background:transparent;border:1.5px solid rgba(255,255,255,0.08)}

        .qs{padding:0.38rem 0.75rem;background:var(--bg3);border-top:1px solid var(--line);display:flex;align-items:center;gap:4px;min-height:28px}
        .qs-lbl{font-family:'Barlow Condensed',sans-serif;font-size:0.52rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--f4);flex-shrink:0}
        .qs-pills{display:flex;gap:3px;flex-wrap:wrap}
        .qp{font-family:'Barlow Condensed',sans-serif;font-size:0.55rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:0.08rem 0.35rem;border-radius:2px}
        .qp1{background:rgba(201,168,76,0.12);color:var(--gold);border:1px solid rgba(201,168,76,0.2)}
        .qp2{background:rgba(44,182,125,0.1);color:#6de0a8;border:1px solid rgba(44,182,125,0.18)}
        .qs-empty{font-family:'Barlow Condensed',sans-serif;font-size:0.55rem;color:var(--f4)}

        .save-wrap{margin-top:1rem;display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-top:1px solid var(--line)}
        .save-status{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.06em;color:var(--f3)}
        .save-status span{color:var(--gold)}
        .save-btn{font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;background:#e6b832;color:#000;border:none;padding:0.6rem 1.3rem;border-radius:2px;cursor:pointer;box-shadow:0 4px 18px rgba(201,168,76,0.4);transition:all 0.15s}
        .save-btn:hover{background:var(--gold2)}
        .save-btn:disabled{background:var(--f4);color:var(--bg);box-shadow:none;cursor:not-allowed;opacity:0.4}
        .save-btn.success{background:var(--green);color:#fff}
        .save-btn.error{background:#e03b3b;color:#fff}

        .sw{margin-bottom:0.85rem}
        .sw-head{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--f4);border-bottom:1px solid var(--line);padding-bottom:0.4rem;margin-bottom:0.5rem}
        .sw-row{display:flex;align-items:center;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(255,255,255,0.04)}
        .sw-row:last-child{border-bottom:none}
        .sw-label{font-family:'Inter',sans-serif;font-size:0.72rem;color:var(--f3)}
        .sw-val{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700}
        .vg{color:var(--gold)}.vgr{color:var(--green)}.vw{color:#fff}
        .hint-box{background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);border-radius:4px;padding:0.65rem 0.75rem;margin-bottom:0.85rem}
        .hint-title{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold);margin-bottom:0.3rem}
        .hint-text{font-family:'Inter',sans-serif;font-size:0.7rem;color:var(--f3);line-height:1.55}
        .hint-text strong{color:var(--f2);font-weight:600}
        .sc-row{display:flex;align-items:center;justify-content:space-between;padding:0.26rem 0;border-bottom:1px solid rgba(255,255,255,0.04)}
        .sc-row:last-child{border-bottom:none}
        .sc-label{font-family:'Inter',sans-serif;font-size:0.7rem;color:var(--f3)}
        .sc-pts{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;color:var(--gold)}
      `}</style>

      <nav className="nav">
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/scores" className="nav-link">Scores</Link>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-top">
          <div>
            <div className="h-eyebrow">FIFA World Cup 2026</div>
            <div className="h-name">{pool?.name || 'Pool'}</div>
            <div className="h-tags">
              <span className="htag htag-green">● Open</span>
              {pool?.buy_in && <span className="htag htag-gold">${pool.buy_in} pool</span>}
              <span className="htag htag-outline">{pool?.visibility === 'private' ? 'Private' : 'Public'}</span>
            </div>
          </div>
          <div className="stats-row">
            <div className="stat"><div className="stat-n" style={{color: doneCount === 12 ? '#2cb67d' : '#fff'}}>{doneCount}/12</div><div className="stat-l">Groups</div></div>
            <div className="stat"><div className="stat-n">{totalSel}</div><div className="stat-l">Picks</div></div>
          </div>
        </div>
        <div className="tabs">
          <Link href={`/pool/${params.id}/predictions`} className="tab">Match Picks</Link>
          <Link href={`/pool/${params.id}/special-picks`} className="tab">Special Picks</Link>
          <span className="tab active">Qualifiers</span>
          <Link href={`/pool/${params.id}`} className="tab">Overview</Link>
        </div>
      </div>

      <div className="body">
        <div className="main">
          <div className="sec-head">
            <div className="sec-title">Group Stage Qualifiers — Pick 2 per group</div>
            <div className="sec-right">
              <div className="prog-label">Done: <span>{doneCount}</span>/12</div>
              <div className="prog-bar-wrap"><div className="prog-bar-fill" style={{width:`${(doneCount/12)*100}%`}}></div></div>
            </div>
          </div>

          <div className="groups-grid">
            {GROUPS.map(({g, teams}) => {
              const sel = picks[g] || []
              const done = sel.length === 2
              return (
                <div key={g} className={`gc ${done ? 'complete' : ''}`}>
                  <div className="gc-head">
                    <div className="gc-name">Group {g}</div>
                    <div className={`gc-badge ${done ? 'done' : ''}`}>{done ? '✓ Done' : 'Pick 2'}</div>
                  </div>
                  {teams.map(t => {
                    const idx = sel.indexOf(t.id)
                    const isS1 = idx === 0, isS2 = idx === 1
                    const isEl = sel.length === 2 && idx === -1
                    const cls = isS1 ? 's1' : isS2 ? 's2' : isEl ? 'el' : ''
                    return (
                      <div key={t.id} className={`tr ${cls}`} onClick={() => toggle(g, t.id)}>
                        <img className="tr-flag" src={fl(t.c)} alt={t.n} loading="lazy" />
                        <div className="tr-name">{t.n}</div>
                        {t.po && <span className="tr-note">PO</span>}
                        <div className={`rb ${isS1 ? 'rb1' : isS2 ? 'rb2' : 'rbe'}`}>{isS1 ? '1' : isS2 ? '2' : ''}</div>
                      </div>
                    )
                  })}
                  <div className="qs">
                    {sel.length === 0 ? (
                      <div className="qs-empty">Select 2 qualifiers</div>
                    ) : (
                      <>
                        <div className="qs-lbl">Qualifiers</div>
                        <div className="qs-pills">
                          {sel.map((id, i) => (
                            <span key={id} className={`qp ${i === 0 ? 'qp1' : 'qp2'}`}>
                              {i === 0 ? '1st' : '2nd'} · {TEAM_BY_ID[id]?.n || id}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="save-wrap">
            <div className="save-status">Selected: <span>{totalSel}</span> / 24 qualifiers</div>
            <button 
              className={`save-btn ${saveStatus === 'success' ? 'success' : saveStatus === 'error' ? 'error' : ''}`}
              disabled={isLocked || saving || doneCount < 12}
              onClick={saveAll}
            >
              {saving ? 'Saving...' : saveStatus === 'success' ? '✓ Picks Saved!' : saveStatus === 'error' ? '✗ Error' : 'Save Qualifier Picks →'}
            </button>
          </div>
        </div>

        <div className="side">
          <div className="hint-box">
            <div className="hint-title">How it works</div>
            <div className="hint-text">
              Pick <strong>2 teams</strong> to advance from each of the 12 groups.<br/>
              Tap a team to select — first pick gets <strong style={{color:'var(--gold)'}}>1st</strong>, second gets <strong style={{color:'#6de0a8'}}>2nd</strong>.<br/>
              Tap again to deselect. Tap a 3rd team to swap your 2nd pick.
            </div>
          </div>

          <div className="sw">
            <div className="sw-head">Pool Info</div>
            <div className="sw-row"><div className="sw-label">Tournament</div><div className="sw-val vw" style={{fontSize:'0.75rem'}}>FIFA World Cup 2026</div></div>
            <div className="sw-row"><div className="sw-label">Buy-in</div><div className="sw-val vgr">{pool?.buy_in ? `$${pool.buy_in}` : 'Free'}</div></div>
            <div className="sw-row"><div className="sw-label">Status</div><div className="sw-val vg">Open</div></div>
          </div>

          <div className="sw">
            <div className="sw-head">Qualifier Scoring</div>
            <div className="sc-row"><div className="sc-label">Correct qualifier (any order)</div><div className="sc-pts">2 pts</div></div>
            <div className="sc-row"><div className="sc-label">Correct 1st place finish</div><div className="sc-pts">+1 pt</div></div>
            <div className="sc-row"><div className="sc-label">Both correct in right order</div><div className="sc-pts">5 pts</div></div>
          </div>

          <div className="sw">
            <div className="sw-head">Your Progress</div>
            <div className="sw-row"><div className="sw-label">Groups complete</div><div className="sw-val vg">{doneCount} / 12</div></div>
            <div className="sw-row"><div className="sw-label">Picks remaining</div><div className="sw-val vw">{24 - totalSel}</div></div>
          </div>
        </div>
      </div>
    </>
  )
}
