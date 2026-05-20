'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

const TEAMS = [
  {c:'ar',n:'Argentina'},{c:'fr',n:'France'},{c:'es',n:'Spain'},{c:'gb-eng',n:'England'},{c:'br',n:'Brazil'},{c:'pt',n:'Portugal'},{c:'de',n:'Germany'},{c:'nl',n:'Netherlands'},{c:'no',n:'Norway'},{c:'be',n:'Belgium'},{c:'uy',n:'Uruguay'},{c:'co',n:'Colombia'},{c:'mx',n:'Mexico'},{c:'us',n:'USA'},{c:'ca',n:'Canada'},{c:'hr',n:'Croatia'},{c:'sn',n:'Senegal'},{c:'ma',n:'Morocco'},{c:'jp',n:'Japan'},{c:'au',n:'Australia'},{c:'kr',n:'S. Korea'},{c:'ch',n:'Switzerland'},{c:'se',n:'Sweden'},{c:'at',n:'Austria'},{c:'dz',n:'Algeria'},{c:'ec',n:'Ecuador'},{c:'tr',n:'Türkiye'},{c:'gh',n:'Ghana'},{c:'eg',n:'Egypt'},{c:'ci',n:'Ivory Coast'},{c:'ir',n:'Iran'},{c:'gb-sct',n:'Scotland'},{c:'tn',n:'Tunisia'},{c:'py',n:'Paraguay'},{c:'sa',n:'Saudi Arabia'},{c:'qa',n:'Qatar'},{c:'ba',n:'Bosnia'},{c:'jo',n:'Jordan'},{c:'cd',n:'DR Congo'},{c:'uz',n:'Uzbekistan'},{c:'cv',n:'Cape Verde'},{c:'cw',n:'Curaçao'},{c:'nz',n:'New Zealand'},{c:'ht',n:'Haiti'},{c:'iq',n:'Iraq'},{c:'za',n:'S. Africa'},{c:'pa',n:'Panama'}
]

const PLAYERS = [
  {n:'Kylian Mbappé',t:'fr',tn:'France',p:'FWD'},{n:'Erling Haaland',t:'no',tn:'Norway',p:'FWD'},{n:'Lionel Messi',t:'ar',tn:'Argentina',p:'FWD'},{n:'Cristiano Ronaldo',t:'pt',tn:'Portugal',p:'FWD'},{n:'Lautaro Martínez',t:'ar',tn:'Argentina',p:'FWD'},{n:'Julián Álvarez',t:'ar',tn:'Argentina',p:'FWD'},{n:'Harry Kane',t:'gb-eng',tn:'England',p:'FWD'},{n:'Vinícius Jr.',t:'br',tn:'Brazil',p:'FWD'},{n:'Bukayo Saka',t:'gb-eng',tn:'England',p:'FWD'},{n:'Alexander Isak',t:'se',tn:'Sweden',p:'FWD'},{n:'Viktor Gyökeres',t:'se',tn:'Sweden',p:'FWD'},{n:'Darwin Núñez',t:'uy',tn:'Uruguay',p:'FWD'},{n:'Santiago Giménez',t:'mx',tn:'Mexico',p:'FWD'},{n:'Luis Díaz',t:'co',tn:'Colombia',p:'FWD'},{n:'Cody Gakpo',t:'nl',tn:'Netherlands',p:'FWD'},{n:'Mohamed Salah',t:'eg',tn:'Egypt',p:'FWD'},{n:'Emiliano Martínez',t:'ar',tn:'Argentina',p:'GK'},{n:'Thibaut Courtois',t:'be',tn:'Belgium',p:'GK'},{n:'Mike Maignan',t:'fr',tn:'France',p:'GK'},{n:'Alisson Becker',t:'br',tn:'Brazil',p:'GK'},{n:'Jordan Pickford',t:'gb-eng',tn:'England',p:'GK'},{n:'Manuel Neuer',t:'de',tn:'Germany',p:'GK'},{n:'Diogo Costa',t:'pt',tn:'Portugal',p:'GK'},{n:'Yann Sommer',t:'ch',tn:'Switzerland',p:'GK'},{n:'Bart Verbruggen',t:'nl',tn:'Netherlands',p:'GK'},{n:'Unai Simón',t:'es',tn:'Spain',p:'GK'},{n:'Ørjan Nyland',t:'no',tn:'Norway',p:'GK'}
]

const fl = (c, sm) => `https://flagcdn.com/w${sm ? 40 : 80}/${c.replace('gb-', '')}.png`

export default function SpecialPicksPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [poolMember, setPoolMember] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Picks state
  const [champion, setChampion] = useState(null)
  const [runnerUp, setRunnerUp] = useState(null)
  const [topScorer, setTopScorer] = useState(null)
  const [bestKeeper, setBestKeeper] = useState(null)
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState(null) // 'champion' | 'runner' | 'scorer' | 'gk'
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState({})
  const [threeLoaded, setThreeLoaded] = useState(false)

  const tournamentStart = new Date('2026-06-11T17:00:00-04:00')
  const isLocked = new Date() >= tournamentStart

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
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

        // Load existing picks
        if (memberData) {
          const { data: picks } = await supabase
            .from('special_picks')
            .select('*')
            .eq('pool_member_id', memberData.id)

          if (picks) {
            picks.forEach(pick => {
              if (pick.pick_type === 'champion' && pick.team_code) {
                const team = TEAMS.find(t => t.c === pick.team_code)
                if (team) setChampion({ c: team.c, n: team.n })
              }
              if (pick.pick_type === 'runner_up' && pick.team_code) {
                const team = TEAMS.find(t => t.c === pick.team_code)
                if (team) setRunnerUp({ c: team.c, n: team.n })
              }
              if (pick.pick_type === 'top_scorer' && pick.player_name) {
                const player = PLAYERS.find(p => p.n === pick.player_name)
                if (player) setTopScorer({ name: player.n, team: player.t, teamName: player.tn, pos: player.p })
              }
              if (pick.pick_type === 'best_keeper' && pick.player_name) {
                const player = PLAYERS.find(p => p.n === pick.player_name)
                if (player) setBestKeeper({ name: player.n, team: player.t, teamName: player.tn, pos: player.p })
              }
            })
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id, router])

  // Initialize 3D after Three.js loads
  useEffect(() => {
    if (threeLoaded && !loading && typeof window !== 'undefined' && window.THREE) {
      setTimeout(() => {
        initAll3D()
      }, 300)
    }
  }, [threeLoaded, loading, champion, runnerUp, topScorer, bestKeeper])

  const initAll3D = () => {
    if (typeof window === 'undefined' || !window.THREE) return
    if (typeof window.buildTrophy === 'function') {
      window.buildTrophy('cv-champion', true)
      window.buildTrophy('cv-runner', false)
    }
    if (typeof window.buildStriker === 'function') {
      window.buildStriker('cv-scorer')
    }
    if (typeof window.buildKeeper === 'function') {
      window.buildKeeper('cv-gk')
    }
    if (champion && typeof window.buildFlag === 'function') {
      window.buildFlag('flag-champion', champion.c, true, 118, 78)
    }
    if (runnerUp && typeof window.buildFlag === 'function') {
      window.buildFlag('flag-runner', runnerUp.c, false, 118, 78)
    }
    if (topScorer && typeof window.buildFlag === 'function') {
      window.buildFlag('pflag-scorer', topScorer.team, true, 80, 54)
    }
    if (bestKeeper && typeof window.buildFlag === 'function') {
      window.buildFlag('pflag-gk', bestKeeper.team, true, 80, 54)
    }
  }

  const savePick = async (pickType, data) => {
    if (!poolMember || isLocked) return
    setSaving(prev => ({ ...prev, [pickType]: true }))
    
    try {
      const pickData = {
        pool_member_id: poolMember.id,
        pick_type: pickType,
        team_code: data.teamCode || null,
        team_name: data.teamName || null,
        player_name: data.playerName || null,
      }

      await supabase
        .from('special_picks')
        .upsert(pickData, { onConflict: 'pool_member_id,pick_type' })
    } catch (err) {
      console.error('Error saving pick:', err)
    } finally {
      setSaving(prev => ({ ...prev, [pickType]: false }))
    }
  }

  const openTeamModal = (type) => {
    if (isLocked) return
    setModalType(type)
    setSearchTerm('')
    setModalOpen(true)
  }

  const openPlayerModal = (type) => {
    if (isLocked) return
    setModalType(type)
    setSearchTerm('')
    setModalOpen(true)
  }

  const pickTeam = (team) => {
    if (modalType === 'champion') {
      setChampion(team)
      savePick('champion', { teamCode: team.c, teamName: team.n })
      setTimeout(() => buildFlag('flag-champion', team.c, true, 118, 78), 100)
    } else if (modalType === 'runner') {
      setRunnerUp(team)
      savePick('runner_up', { teamCode: team.c, teamName: team.n })
      setTimeout(() => buildFlag('flag-runner', team.c, false, 118, 78), 100)
    }
    setModalOpen(false)
  }

  const pickPlayer = (player) => {
    const data = { name: player.n, team: player.t, teamName: player.tn, pos: player.p }
    if (modalType === 'scorer') {
      setTopScorer(data)
      savePick('top_scorer', { playerName: player.n })
      setTimeout(() => buildFlag('pflag-scorer', player.t, true, 80, 54), 100)
    } else if (modalType === 'gk') {
      setBestKeeper(data)
      savePick('best_keeper', { playerName: player.n })
      setTimeout(() => buildFlag('pflag-gk', player.t, true, 80, 54), 100)
    }
    setModalOpen(false)
  }

  const filteredTeams = TEAMS.filter(t => 
    t.n.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPlayers = PLAYERS.filter(p => {
    const isGk = modalType === 'gk'
    const matchesPos = isGk ? p.p === 'GK' : p.p !== 'GK'
    const matchesSearch = p.n.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.tn.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPos && matchesSearch
  })

  // Format user name
  const getUserName = () => {
    if (!user) return 'User'
    const meta = user.user_metadata || {}
    if (meta.first_name) return `${meta.first_name} ${meta.last_name?.[0] || ''}.`
    return user.email?.split('@')[0] || 'User'
  }
  
  const getUserInitials = () => {
    if (!user) return 'U'
    const meta = user.user_metadata || {}
    const first = meta.first_name?.[0] || user.email?.[0] || 'U'
    const last = meta.last_name?.[0] || ''
    return (first + last).toUpperCase()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0c10', color: '#8a8780' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Script 
        src="https://unpkg.com/three@0.128.0/build/three.min.js" 
        strategy="afterInteractive"
        onReady={() => {
          console.log('Three.js ready')
          // Define helper functions
          window.fl = (c, sm) => 'https://flagcdn.com/w' + (sm ? 40 : 80) + '/' + c.replace('gb-', '') + '.png';
          window.flHD = c => 'https://flagcdn.com/w320/' + c.replace('gb-', '') + '.png';
          window.flagScenes = {};
          window.mkMat = (c, r, m, x) => Object.assign(new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m }), x || {});
          window.mkRenderer = (id, w, h) => {
            const cv = document.getElementById(id);
            if (!cv) return null;
            const rr = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
            rr.setSize(w, h);
            rr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            return rr;
          };
          window.addLights = (scene, isGold) => {
            scene.add(new THREE.AmbientLight(0xffffff, 0.45));
            const k = new THREE.DirectionalLight(isGold ? 0xfff4cc : 0xddeeff, 3.5);
            k.position.set(4, 8, 5);
            scene.add(k);
          };
          window.buildTrophy = (canvasId, isGold) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
            cam.position.set(0, 0.5, 7);
            window.addLights(scene, isGold);
            const gc = isGold ? 0xd4a017 : 0x9ab0cc;
            const mM = window.mkMat(gc, 0.10, 0.97);
            const grp = new THREE.Group();
            grp.add(new THREE.Mesh(new THREE.CylinderGeometry(1.10, 1.10, 0.08, 32), mM));
            const pts = [[0.02,0],[0.28,0.45],[0.72,1.00],[1.08,1.80],[0.72,2.42],[0.44,2.46]].map(([x,y]) => new THREE.Vector2(x, y));
            const cup = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), mM);
            cup.position.y = -0.12;
            grp.add(cup);
            grp.position.y = 0.20;
            scene.add(grp);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.008; grp.rotation.y = t * 0.5; grp.position.y = 0.20 + Math.sin(t) * 0.05; rr.render(scene, cam); })();
          };
          window.buildStriker = (canvasId) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            cam.position.set(0, 1.2, 6);
            window.addLights(scene, true);
            const mB = window.mkMat(0xd4a832, 0.15, 0.92);
            const g = new THREE.Group();
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.50), mB));
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.70, 0.48), mB));
            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), window.mkMat(0xffffff, 0.7, 0));
            ball.position.set(0.48, -0.80, 1.30);
            g.add(ball);
            g.position.set(0, -0.2, 0);
            scene.add(g);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.015; ball.rotation.y += 0.03; g.rotation.y = Math.sin(t * 0.5) * 0.2; rr.render(scene, cam); })();
          };
          window.buildKeeper = (canvasId) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
            cam.position.set(0, 0.8, 6.5);
            window.addLights(scene, true);
            const mB = window.mkMat(0xd4a832, 0.15, 0.92);
            const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
            [-2.2, 2.2].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 16), postMat); p.position.set(x, 0.2, -1.5); scene.add(p); });
            const cb = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.54, 16), postMat); cb.rotation.z = Math.PI / 2; cb.position.set(0, 1.82, -1.5); scene.add(cb);
            const g = new THREE.Group();
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.45, 0.48), mB));
            g.add(new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.66, 0.46), mB));
            const glv = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.30, 0.12), window.mkMat(0xc9a84c, 0.25, 0.80));
            glv.position.set(1.2, 0.8, 0);
            g.add(glv);
            g.position.set(-0.15, 0, 0);
            scene.add(g);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.012; glv.position.x = 1.2 + Math.sin(t * 2.5) * 0.1; g.rotation.y = Math.sin(t * 0.5) * 0.1; rr.render(scene, cam); })();
          };
          window.buildFlag = (canvasId, code, isGold, cW, cH) => {
            const cv = document.getElementById(canvasId);
            if (!cv) return;
            const W = cW || 118, H = cH || 78;
            const rr = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
            rr.setSize(W, H);
            rr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            const scene = new THREE.Scene();
            const aspect = W / H;
            const cam = new THREE.OrthographicCamera(-aspect * 1.06, aspect * 1.06, 1.06, -1.06, 0.1, 20);
            cam.position.set(0, 0, 5);
            scene.add(new THREE.AmbientLight(0xffffff, 1.1));
            const fW = 3.0, fH = 2.0, sX = 30, sY = 20, vC = (sX + 1) * (sY + 1);
            const geo = new THREE.PlaneGeometry(fW, fH, sX, sY);
            const arr = geo.attributes.position.array;
            const ox = new Float32Array(vC), oy = new Float32Array(vC);
            for (let i = 0; i < vC; i++) { ox[i] = arr[i * 3]; oy[i] = arr[i * 3 + 1]; }
            const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
            new THREE.TextureLoader().load(window.flHD(code), tex => { mat.map = tex; mat.needsUpdate = true; }, undefined, () => {
              new THREE.TextureLoader().load(window.fl(code, false), tex => { mat.map = tex; mat.needsUpdate = true; });
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.x = 0.14;
            scene.add(mesh);
            const poleMat = new THREE.MeshBasicMaterial({ color: isGold ? 0xc9a84c : 0xb0c4de });
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, fH * 1.12, 12), poleMat);
            pole.position.set(-fW / 2 - 0.04, 0, 0);
            scene.add(pole);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.040;
              const p = geo.attributes.position.array;
              for (let vi = 0; vi < vC; vi++) {
                const xN = (ox[vi] + fW / 2) / fW;
                p[vi * 3 + 1] = oy[vi] + Math.sin(xN * 2.8 - t * 0.85) * 0.032 * xN;
                p[vi * 3 + 2] = Math.sin(xN * 3.5 - t) * 0.11 * xN;
              }
              geo.attributes.position.needsUpdate = true;
              rr.render(scene, cam);
            })();
          };
          setThreeLoaded(true);
        }}
      />
      
      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-links">
          <Link href="/dashboard" className="tb-link">Dashboard</Link>
          <span className="tb-link active">{pool?.name || 'Pool'}</span>
        </div>
        <div className="topbar-right">
          <Link href="/profile" className="user-pill">
            <div className="user-avatar">{getUserInitials()}</div>
            {getUserName()}
          </Link>
          <button className="signout-btn" onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}>Sign Out</button>
        </div>
      </div>

      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href="/browse" className="nav-item">Browse</Link>
          <Link href="/results" className="nav-item">Scores</Link>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">Special Picks</div>
            <div className="ph-meta">FIFA World Cup 2026 · 27 pts available</div>
          </div>
        </div>
      </div>

      <div className="tab-nav">
        <div className="tab-nav-inner">
          <Link href={`/pool/${params.id}/predictions`} className="tab">Match Picks</Link>
          <span className="tab active">Special Picks</span>
          <Link href={`/pool/${params.id}`} className="tab">Leaderboard</Link>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid">
        {/* CHAMPION */}
        <div className={`card gold ${champion ? 'picked' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => openTeamModal('champion')}>
          <div className="pts">10 pts</div>
          <canvas className="bg3d" id="cv-champion" width="170" height="170"></canvas>
          <div className="inner">
            <div className="lbl">Champion</div>
            <div id="b-champion">
              {champion ? (
                <div className="team-selected">
                  <div className="flag-canvas-wrap flag-border-gold">
                    <canvas id="flag-champion" width="118" height="78"></canvas>
                    <div className="chk-badge ck-g">✓</div>
                  </div>
                  <div className="tn tn-g">{champion.n}</div>
                </div>
              ) : (
                <div className="cta"><div className="plus-c">+</div>Select team</div>
              )}
            </div>
          </div>
          {saving.champion && <div className="saving">Saving...</div>}
        </div>

        {/* RUNNER-UP */}
        <div className={`card silver ${runnerUp ? 'picked' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => openTeamModal('runner')}>
          <div className="pts sv">7 pts</div>
          <canvas className="bg3d" id="cv-runner" width="170" height="170"></canvas>
          <div className="inner">
            <div className="lbl">Runner-Up</div>
            <div id="b-runner">
              {runnerUp ? (
                <div className="team-selected">
                  <div className="flag-canvas-wrap flag-border-silver">
                    <canvas id="flag-runner" width="118" height="78"></canvas>
                    <div className="chk-badge ck-s">✓</div>
                  </div>
                  <div className="tn tn-s">{runnerUp.n}</div>
                </div>
              ) : (
                <div className="cta"><div className="plus-c">+</div>Select team</div>
              )}
            </div>
          </div>
          {saving.runner_up && <div className="saving">Saving...</div>}
        </div>

        {/* PICHICHI */}
        <div className={`card ${topScorer ? 'picked' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => openPlayerModal('scorer')}>
          <div className="pts">5 pts</div>
          <canvas className="bg3d" id="cv-scorer" width="170" height="170"></canvas>
          <div className="inner">
            <div className="lbl">Pichichi</div>
            <div className="sub">Top Scorer</div>
            <div id="b-scorer">
              {topScorer ? (
                <div className="player-pick">
                  <div className="pn-full">{topScorer.name}</div>
                  <div className="pm">{topScorer.teamName} · {topScorer.pos}</div>
                  <div className="player-flag-wrap player-flag-border">
                    <canvas id="pflag-scorer" width="80" height="54"></canvas>
                  </div>
                </div>
              ) : (
                <div className="cta" style={{ marginTop: '6px' }}><div className="plus-c">+</div>Select player</div>
              )}
            </div>
          </div>
          {saving.top_scorer && <div className="saving">Saving...</div>}
        </div>

        {/* GOLDEN GLOVE */}
        <div className={`card ${bestKeeper ? 'picked' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => openPlayerModal('gk')}>
          <div className="pts">5 pts</div>
          <canvas className="bg3d" id="cv-gk" width="170" height="170"></canvas>
          <div className="inner">
            <div className="lbl">Golden Glove</div>
            <div className="sub">Best Goalkeeper</div>
            <div id="b-gk">
              {bestKeeper ? (
                <div className="player-pick">
                  <div className="pn-full">{bestKeeper.name}</div>
                  <div className="pm">{bestKeeper.teamName} · {bestKeeper.pos}</div>
                  <div className="player-flag-wrap player-flag-border">
                    <canvas id="pflag-gk" width="80" height="54"></canvas>
                  </div>
                </div>
              ) : (
                <div className="cta" style={{ marginTop: '6px' }}><div className="plus-c">+</div>Select player</div>
              )}
            </div>
          </div>
          {saving.best_keeper && <div className="saving">Saving...</div>}
        </div>
      </div>

      {/* Deadline Banner */}
      <div className="deadline-banner">
        <span>🏆</span>
        <div>
          <strong>DEADLINE: JUNE 11, 2026 · 5:00 PM ET</strong>
          <p>All special picks lock when the first match kicks off</p>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="ovl" onClick={() => setModalOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sh-head">
              <div className="sh-title">
                {modalType === 'champion' && 'Select Champion'}
                {modalType === 'runner' && 'Select Runner-Up'}
                {modalType === 'scorer' && 'Pichichi — Top Scorer'}
                {modalType === 'gk' && 'Golden Glove — Best GK'}
              </div>
              <button className="sh-close" onClick={() => setModalOpen(false)}>Close</button>
            </div>
            <div className="sh-body">
              {(modalType === 'scorer' || modalType === 'gk') && (
                <input 
                  className="srch" 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              )}
              
              {(modalType === 'champion' || modalType === 'runner') && (
                <div className="tgrid">
                  {filteredTeams.map(t => {
                    const isS = modalType === 'runner'
                    const cur = modalType === 'champion' ? champion : runnerUp
                    const sel = cur && cur.c === t.c
                    return (
                      <div 
                        key={t.c}
                        className={`topt ${sel ? 'selected' : ''}`}
                        style={sel ? { borderColor: isS ? '#b8cce0' : '#c9a84c', background: isS ? 'rgba(184,204,224,0.12)' : 'rgba(201,168,76,0.12)' } : {}}
                        onClick={() => pickTeam(t)}
                      >
                        <img src={fl(t.c, true)} alt={t.n} />
                        <div className="topt-n" style={sel ? { color: isS ? '#b8cce0' : '#c9a84c' } : {}}>{t.n}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              {(modalType === 'scorer' || modalType === 'gk') && (
                <div className="plist">
                  {filteredPlayers.slice(0, 20).map(p => (
                    <div key={p.n} className="pitem" onClick={() => pickPlayer(p)}>
                      <img src={fl(p.t, true)} alt={p.t} />
                      <div>
                        <div className="pi-n">{p.n}</div>
                        <div className="pi-t">{p.tn}</div>
                      </div>
                      <span className="pi-p" style={{ background: p.p === 'GK' ? 'rgba(201,168,76,0.12)' : 'rgba(224,59,59,0.12)', color: p.p === 'GK' ? '#c9a84c' : '#e03b3b' }}>
                        {p.p}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* TOPBAR */
        .topbar { background: var(--bg, #0a0c10); border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 36px; }
        .topbar-links { display: flex; gap: 1.5rem; }
        .tb-link { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a4845; text-decoration: none; }
        .tb-link:hover, .tb-link.active { color: #8a8780; }
        .topbar-right { display: flex; align-items: center; gap: 0.75rem; }
        .user-pill { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #8a8780; text-decoration: none; cursor: pointer; transition: color 0.15s; }
        .user-pill:hover { color: #c9a84c; }
        .user-avatar { width: 22px; height: 22px; background: #c9a84c; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 800; color: #000; }
        .signout-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid #4a4845; color: #8a8780; padding: 0.35rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .signout-btn:hover { border-color: #c9a84c; color: #c9a84c; }

        /* NAV */
        nav { background: #0a0c10; border-bottom: 3px solid #c9a84c; display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: #f0ede8; text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid #4a4845; text-decoration: none; }
        .nav-logo span { color: #c9a84c; }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8780; text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: #f0ede8; }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #c9a84c; color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        /* PAGE HEADER */
        .page-header { background: #111318; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 900px; margin: 0 auto; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a84c; margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: #f0ede8; }
        .ph-meta { font-size: 0.78rem; color: #8a8780; margin-top: 0.2rem; }

        /* TABS */
        .tab-nav { background: #111318; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .tab-nav-inner { max-width: 900px; margin: 0 auto; display: flex; gap: 1rem; }
        .tab { display: flex; align-items: center; gap: 0.4rem; padding: 0 1rem; height: 44px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8780; border-bottom: 2px solid transparent; cursor: pointer; text-decoration: none; }
        .tab:hover { color: #f0ede8; }
        .tab.active { color: #f0ede8; border-bottom-color: #c9a84c; }

        /* GRID */
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; background: #0a0c10; max-width: 500px; margin: 0 auto; }

        /* CARD */
        .card { position: relative; border-radius: 10px; overflow: hidden; background: #111318; border: 1px solid rgba(255,255,255,0.08); min-height: 230px; display: flex; flex-direction: column; cursor: pointer; transition: border-color 0.2s; }
        .card:hover:not(.locked) { border-color: rgba(255,255,255,0.2); }
        .card.gold { border: 2px solid #c9a84c; background: #0d0f09; }
        .card.silver { border: 2px solid #b8cce0; background: #0d0f15; }
        .card.picked { border: 2px solid #c9a84c; background: #0d0f09; }
        .card.locked { opacity: 0.6; cursor: not-allowed; }
        
        .bg3d { position: absolute; bottom: -5px; right: -5px; width: 170px; height: 170px; pointer-events: none; z-index: 1; }
        
        .pts { position: absolute; top: 10px; left: 10px; z-index: 10; font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #c9a84c; color: #000; padding: 0.2rem 0.6rem; border-radius: 2px; }
        .pts.sv { background: #b8cce0; color: #111; }
        
        .inner { position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.1rem 0.85rem 1rem; text-align: center; gap: 8px; }
        .lbl { font-family: 'Barlow Condensed', sans-serif; font-size: 1.05rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #f0ede8; }
        .sub { font-size: 0.72rem; color: #8a8780; }
        
        .cta { display: flex; align-items: center; gap: 5px; font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a4845; margin-top: 4px; }
        .plus-c { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #4a4845; display: flex; align-items: center; justify-content: center; font-size: 11px; }

        .saving { position: absolute; bottom: 8px; right: 8px; font-size: 0.65rem; color: #c9a84c; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }

        /* FLAG CANVAS */
        .team-selected { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .flag-canvas-wrap { position: relative; width: 118px; height: 78px; }
        .flag-canvas-wrap canvas { width: 118px; height: 78px; border-radius: 4px; display: block; }
        .flag-border-gold { outline: 3px solid #c9a84c; outline-offset: 2px; border-radius: 4px; }
        .flag-border-silver { outline: 3px solid #b8cce0; outline-offset: 2px; border-radius: 4px; }
        .chk-badge { position: absolute; top: -8px; right: -8px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #000; z-index: 5; }
        .ck-g { background: #c9a84c; }
        .ck-s { background: #b8cce0; }

        .tn { font-family: 'Barlow Condensed', sans-serif; font-size: 1.05rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }
        .tn-g { color: #c9a84c; }
        .tn-s { color: #b8cce0; }

        /* PLAYER PICK */
        .player-pick { display: flex; flex-direction: column; align-items: center; gap: 6px; margin-top: 2px; }
        .pn-full { font-family: 'Barlow Condensed', sans-serif; font-size: 1.0rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; color: #c9a84c; line-height: 1.15; }
        .pm { font-size: 0.7rem; color: #8a8780; margin-top: 1px; }
        .player-flag-wrap { position: relative; width: 80px; height: 54px; margin-top: 2px; }
        .player-flag-wrap canvas { width: 80px; height: 54px; border-radius: 3px; display: block; }
        .player-flag-border { outline: 2px solid #c9a84c; outline-offset: 2px; border-radius: 3px; }

        /* DEADLINE BANNER */
        .deadline-banner { display: flex; align-items: center; gap: 12px; background: #111318; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem 1.25rem; margin: 12px; max-width: 476px; margin-left: auto; margin-right: auto; }
        .deadline-banner span { font-size: 1.5rem; }
        .deadline-banner strong { font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #c9a84c; }
        .deadline-banner p { font-size: 0.72rem; color: #8a8780; margin-top: 2px; }

        /* MODAL */
        .ovl { position: fixed; inset: 0; background: rgba(0,0,0,0.84); z-index: 200; display: flex; align-items: flex-end; justify-content: center; }
        .sheet { background: #111318; border-radius: 12px 12px 0 0; width: 100%; max-width: 480px; border-top: 3px solid #c9a84c; max-height: 72vh; display: flex; flex-direction: column; }
        .sh-head { padding: 1rem 1.25rem 0.6rem; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .sh-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #f0ede8; }
        .sh-close { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; color: #8a8780; cursor: pointer; border: 1px solid #4a4845; padding: 0.25rem 0.6rem; border-radius: 2px; background: transparent; }
        .sh-body { overflow-y: auto; padding: 0 1.25rem 1.25rem; flex: 1; }
        
        .srch { width: 100%; padding: 0.6rem 0.85rem; background: #181c24; border: 1px solid #4a4845; border-radius: 3px; color: #f1ede8; font-size: 0.85rem; outline: none; margin-bottom: 0.6rem; font-family: 'Inter', sans-serif; }
        .srch:focus { border-color: #c9a84c; }
        .srch::placeholder { color: #4a4845; }
        
        .tgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .topt { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 4px; border-radius: 4px; cursor: pointer; border: 1.5px solid rgba(255,255,255,0.06); transition: all 0.12s; }
        .topt:hover { background: rgba(255,255,255,0.04); }
        .topt img { width: 32px; height: 22px; border-radius: 2px; object-fit: cover; }
        .topt-n { font-family: 'Barlow Condensed', sans-serif; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #8a8780; text-align: center; }
        
        .plist { }
        .pitem { display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; border-radius: 3px; }
        .pitem:hover { background: rgba(201,168,76,0.07); }
        .pitem img { width: 24px; height: 16px; border-radius: 2px; object-fit: cover; }
        .pi-n { font-size: 0.85rem; font-weight: 500; color: #f0ede8; }
        .pi-t { font-size: 0.72rem; color: #8a8780; }
        .pi-p { font-family: 'Barlow Condensed', sans-serif; font-size: 0.64rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-left: auto; padding: 0.12rem 0.45rem; border-radius: 2px; }

        @media (max-width: 520px) {
          .grid { max-width: 100%; }
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .tgrid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </>
  )
}
