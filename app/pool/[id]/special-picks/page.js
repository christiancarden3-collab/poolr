'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { WC2026_GOALKEEPERS, WC2026_FORWARDS } from '@/lib/wc2026-squads'
import { WC2026_TEAMS } from '@/lib/wc2026-data'

// Map country codes to flag codes for flagcdn
const COUNTRY_TO_FLAG = {
  'USA': 'us', 'COL': 'co', 'SEN': 'sn', 'NZL': 'nz', 'MEX': 'mx', 'ENG': 'gb-eng',
  'IRN': 'ir', 'NGA': 'ng', 'CAN': 'ca', 'GER': 'de', 'JPN': 'jp', 'CMR': 'cm',
  'ARG': 'ar', 'NED': 'nl', 'AUS': 'au', 'EGY': 'eg', 'FRA': 'fr', 'URU': 'uy',
  'KOR': 'kr', 'MAR': 'ma', 'BRA': 'br', 'ESP': 'es', 'SRB': 'rs', 'CRC': 'cr',
  'POR': 'pt', 'BEL': 'be', 'CHI': 'cl', 'GHA': 'gh', 'ITA': 'it', 'SUI': 'ch',
  'ECU': 'ec', 'TUN': 'tn', 'CRO': 'hr', 'DEN': 'dk', 'PRY': 'py', 'SAU': 'sa',
  'POL': 'pl', 'AUT': 'at', 'VEN': 've', 'CIV': 'ci', 'UKR': 'ua', 'SWE': 'se',
  'PER': 'pe', 'QAT': 'qa', 'TUR': 'tr', 'WAL': 'gb-wls', 'ALG': 'dz', 'HON': 'hn'
}

// Transform WC2026_TEAMS to TEAMS format
const TEAMS = WC2026_TEAMS.map(t => ({
  c: t.flag,
  n: t.name
}))

// Transform forwards/scorers for UI
const SCORER_PLAYERS = WC2026_FORWARDS.map(p => ({
  n: p.name,
  t: COUNTRY_TO_FLAG[p.country] || p.country.toLowerCase(),
  tn: WC2026_TEAMS.find(t => t.code === p.country)?.name || p.country,
  p: p.position
}))

// Transform goalkeepers for UI
const KEEPER_PLAYERS = WC2026_GOALKEEPERS.map(p => ({
  n: p.name,
  t: COUNTRY_TO_FLAG[p.country] || p.country.toLowerCase(),
  tn: WC2026_TEAMS.find(t => t.code === p.country)?.name || p.country,
  p: 'GK'
}))

// Combined for lookups
const ALL_PLAYERS = [...SCORER_PLAYERS, ...KEEPER_PLAYERS]

// Roland Garros 2026 Entry List - Use official list
import { RG_ENTRY_LIST, getPlayerFlag } from '@/lib/rg2026-entrylist'

// Sort by ranking for display
const RG_PLAYERS = [...RG_ENTRY_LIST].sort((a, b) => a.r - b.r)

const fl = (c, sm) => `https://flagcdn.com/w${sm ? 40 : 80}/${c}.png`

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

  // Tournament start - special picks lock when first match starts
  // RG: May 24 5:00 AM ET (first Day 1 match)
  // WC: June 11 5:00 PM ET (opening match)
  const getTournamentStart = () => {
    if (pool?.tournament === 'rg2026') {
      return new Date('2026-05-24T05:00:00-04:00') // First RG match
    }
    return new Date('2026-06-11T17:00:00-04:00') // WC opener
  }
  // Apply pool's deadline offset (default 1 hour before)
  const deadlineOffset = pool?.prediction_deadline === '30m_before_matchday' ? 30 * 60 * 1000
    : pool?.prediction_deadline === '2h_before_matchday' ? 2 * 60 * 60 * 1000
    : 60 * 60 * 1000 // default 1 hour
  const tournamentStart = new Date(getTournamentStart().getTime() - deadlineOffset)
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
                const player = ALL_PLAYERS.find(p => p.n === pick.player_name)
                if (player) setTopScorer({ name: player.n, team: player.t, teamName: player.tn, pos: player.p })
              }
              if (pick.pick_type === 'best_keeper' && pick.player_name) {
                const player = ALL_PLAYERS.find(p => p.n === pick.player_name)
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
    
    const submittedAt = new Date().toISOString()
    
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

      // Sync to Google Sheets (fire and forget - don't block on this)
      fetch('/api/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'special_pick',
          data: {
            poolId: params.id,
            poolName: pool?.name,
            poolMemberId: poolMember.id,
            userId: user?.id,
            userName: user?.user_metadata?.first_name ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() : user?.email,
            userEmail: user?.email,
            teamName: poolMember?.team_name,
            pickType: pickType,
            teamCode: data.teamCode || null,
            teamPickName: data.teamName || null,
            playerName: data.playerName || null,
            submittedAt: submittedAt,
          }
        })
      }).catch(err => console.warn('Sheets sync failed (non-blocking):', err))
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

  // For RG - filter tennis players from official entry list
  const filteredTennisPlayers = RG_PLAYERS.filter(p =>
    p.n.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.c.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50) // Limit to 50 results for performance

  // Use appropriate player list based on modal type
  const playerList = modalType === 'gk' ? KEEPER_PLAYERS : SCORER_PLAYERS
  const filteredPlayers = playerList.filter(p => {
    const matchesSearch = p.n.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.tn.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  }).slice(0, 100) // Limit to 100 for performance

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
          window.fl = (c, sm) => 'https://flagcdn.com/w' + (sm ? 40 : 80) + '/' + c + '.png';
          window.flHD = c => 'https://flagcdn.com/w320/' + c + '.png';
          window.flagScenes = {};
          window.mkMat = (c, r, m, x) => Object.assign(new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m }), x || {});
          window.mkRenderer = (id, w, h) => {
            const cv = document.getElementById(id);
            if (!cv) return null;
            const rr = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'high-performance' });
            rr.setSize(w, h);
            rr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            rr.shadowMap.enabled = true;
            rr.shadowMap.type = THREE.PCFSoftShadowMap;
            return rr;
          };
          window.addLights = (scene, isGold) => {
            scene.add(new THREE.AmbientLight(0xffffff, 0.45));
            const k = new THREE.DirectionalLight(isGold ? 0xfff4cc : 0xddeeff, 3.5);
            k.position.set(4, 8, 5);
            k.castShadow = true;
            k.shadow.mapSize.set(1024, 1024);
            scene.add(k);
            const f = new THREE.DirectionalLight(isGold ? 0xffaa00 : 0x88aaff, 0.9);
            f.position.set(-4, 2, -3);
            scene.add(f);
            const rm = new THREE.DirectionalLight(0xffffff, 1.4);
            rm.position.set(0, -1, 5);
            scene.add(rm);
            const tp = new THREE.DirectionalLight(isGold ? 0xffe080 : 0xccddff, 0.8);
            tp.position.set(0, 10, 0);
            scene.add(tp);
          };
          
          // FULL DETAILED TROPHY
          window.buildTrophy = (canvasId, isGold) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
            cam.position.set(0, 0.5, 7);
            cam.lookAt(0, 0, 0);
            window.addLights(scene, isGold);
            const gc = isGold ? 0xd4a017 : 0x9ab0cc, gh = isGold ? 0xffed80 : 0xddeeff, gd = isGold ? 0x7a5500 : 0x2a4060;
            const mM = window.mkMat(gc, 0.10, 0.97), mS = window.mkMat(gh, 0.04, 0.99), mD = window.mkMat(gd, 0.45, 0.80);
            const grp = new THREE.Group();
            const add = (m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); grp.add(m); return m; };
            add(new THREE.Mesh(new THREE.CylinderGeometry(1.10, 1.10, 0.08, 64), mD), 0, -2.30);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 64), mM), 0, -2.16);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.80, 0.14, 64), mS), 0, -1.98);
            const bR = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.03, 8, 64), mS);
            bR.rotation.x = Math.PI / 2;
            add(bR, 0, -2.10);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.18, 48), mM), 0, -1.80);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.14, 1.30, 24), mM), 0, -0.95);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.12, 0.20, 48), mS), 0, -0.22);
            const pts = [[0.02,0],[0.05,0.08],[0.12,0.22],[0.28,0.45],[0.50,0.72],[0.72,1.00],[0.90,1.28],[1.02,1.55],[1.08,1.80],[1.06,2.02],[0.98,2.20],[0.86,2.34],[0.72,2.42],[0.58,2.46],[0.44,2.46]].map(([x,y]) => new THREE.Vector2(x, y));
            add(new THREE.Mesh(new THREE.LatheGeometry(pts, 80), mM), 0, -0.12);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.10, 0.50, 48), mD), 0, 2.22);
            const rR = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.055, 20, 80), mS);
            rR.rotation.x = Math.PI / 2;
            add(rR, 0, 2.34);
            [-1, 1].forEach(s => {
              const h = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.055, 16, 64, Math.PI * 0.75), mM);
              h.position.set(s * 1.05, 1.20, 0);
              h.rotation.z = s * (Math.PI * 0.38);
              h.rotation.y = Math.PI / 2;
              grp.add(h);
              const hs = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.016, 8, 64, Math.PI * 0.75), mS);
              hs.position.set(s * 1.05, 1.20, 0.04);
              hs.rotation.z = s * (Math.PI * 0.38);
              hs.rotation.y = Math.PI / 2;
              grp.add(hs);
            });
            add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 64, 48), window.mkMat(isGold ? 0xf5e030 : 0xe8f4ff, 0.06, 0.99)), 0, 2.90);
            for (let i = 0; i < 4; i++) {
              const m = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.010, 8, 64), mD);
              m.position.y = 2.90;
              m.rotation.y = i * Math.PI / 4;
              grp.add(m);
            }
            const eq = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.010, 8, 64), mD);
            eq.rotation.x = Math.PI / 2;
            add(eq, 0, 2.90);
            const gs = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.05, transparent: true, opacity: 0.55 }));
            add(gs, -0.14, 3.06, 0.26);
            [-0.22, 0.22].forEach(x => {
              add(new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.045, 0.38, 10), mD), x, 2.12);
              add(new THREE.Mesh(new THREE.CylinderGeometry(0.050, 0.060, 0.32, 12), mD), x, 2.40);
              add(new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 10), mD), x, 2.66);
              const ar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.44, 8), mM);
              ar.rotation.z = x < 0 ? 0.70 : -0.70;
              add(ar, x * 1.55, 2.60);
            });
            grp.position.y = 0.20;
            scene.add(grp);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.006; grp.rotation.y = t * 0.35 + Math.sin(t * 0.60) * 0.15; grp.position.y = 0.20 + Math.sin(t * 1.0) * 0.06; rr.render(scene, cam); })();
          };
          
          // FULL ROBOT STRIKER
          window.buildStriker = (canvasId) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            cam.position.set(0, 1.2, 6);
            cam.lookAt(0, 0.8, 0);
            window.addLights(scene, true);
            const mB = window.mkMat(0xd4a832, 0.15, 0.92), mS = window.mkMat(0xffe878, 0.05, 0.99), mJ = window.mkMat(0x8a6018, 0.3, 0.85), mE = window.mkMat(0x00eeff, 0.1, 0.3);
            const g = new THREE.Group();
            const add = (m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); g.add(m); return m; };
            // Head
            add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.48, 0.50), mB), 0, 2.08);
            add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.08), window.mkMat(0x001a2a, 0.1, 0.1)), 0, 2.10, 0.26);
            [-0.12, 0.12].forEach(x => {
              const ey = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), mE);
              ey.rotation.x = Math.PI / 2;
              add(ey, x, 2.10, 0.30);
              const gl = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), mE);
              gl.rotation.x = Math.PI / 2;
              add(gl, x, 2.10, 0.31);
            });
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), mJ), 0.1, 2.37);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mS), 0.1, 2.50);
            // Neck
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.12, 0.16, 16), mJ), 0, 1.78);
            // Torso
            add(new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.70, 0.48), mB), 0, 1.30);
            add(new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.30, 0.06), mS), 0, 1.36, 0.27);
            const em = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 5), window.mkMat(0xffcc00, 0.1, 0.9));
            em.rotation.y = Math.PI / 5;
            add(em, 0, 1.40, 0.31);
            // Pelvis
            add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.42), mB), 0, 0.86);
            // Left arm
            add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), mJ), -0.52, 1.58);
            const lu = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.45, 12), mB);
            lu.rotation.z = 0.5; lu.rotation.x = 0.3;
            add(lu, -0.68, 1.38, -0.12);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 8), mJ), -0.82, 1.14, -0.22);
            const ll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.40, 12), mB);
            ll.rotation.z = 0.3; ll.rotation.x = -0.5;
            add(ll, -0.92, 0.96, -0.10);
            // Right arm
            add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), mJ), 0.52, 1.58);
            const ru = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.45, 12), mB);
            ru.rotation.z = -0.5; ru.rotation.x = -0.3;
            add(ru, 0.68, 1.36, 0.14);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 8), mJ), 0.80, 1.10, 0.24);
            const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 12), mB);
            rl.rotation.z = -0.3; rl.rotation.x = 0.4;
            add(rl, 0.88, 0.92, 0.16);
            // Left leg
            add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), mJ), -0.22, 0.68);
            const lt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.48, 14), mB);
            lt.rotation.x = 0.1;
            add(lt, -0.24, 0.40, 0.05);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mJ), -0.24, 0.12, 0.08);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.44, 12), mB), -0.24, -0.14, 0.04);
            add(new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.34), mB), -0.24, -0.40, 0.08);
            // Right leg (kicking)
            add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), mJ), 0.22, 0.68);
            const rt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.50, 14), mB);
            rt.rotation.x = -0.85; rt.rotation.z = -0.12;
            add(rt, 0.28, 0.42, 0.28);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mJ), 0.32, 0.22, 0.60);
            const rSh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.46, 12), mB);
            rSh.rotation.x = -0.20; rSh.rotation.z = -0.10;
            add(rSh, 0.36, 0.14, 0.86);
            const rBt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.36), window.mkMat(0xc9a84c, 0.2, 0.85));
            rBt.rotation.x = 0.3;
            add(rBt, 0.38, 0.04, 1.06);
            // Ball
            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), window.mkMat(0xffffff, 0.7, 0));
            add(ball, 0.48, -0.30, 1.30);
            [[0,1,0],[0,0,1],[1,0,0],[-1,0,0],[0.7,0.7,0],[-0.7,0.7,0]].forEach(v => {
              const p = new THREE.Mesh(new THREE.CircleGeometry(0.07, 5), window.mkMat(0x111318, 0.8, 0));
              p.position.copy(ball.position).addScaledVector(new THREE.Vector3(...v).normalize(), 0.215);
              p.lookAt(ball.position);
              g.add(p);
            });
            g.position.set(0.1, -0.5, 0);
            g.rotation.y = -0.3;
            scene.add(g);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.012;
              const k = Math.sin(t * 2) * 0.3;
              rSh.rotation.x = -0.20 + k;
              rBt.position.z = 1.06 + k * 0.3;
              ball.position.z = 1.30 + Math.max(0, k) * 0.4;
              ball.rotation.y += 0.03;
              g.rotation.y = -0.3 + Math.sin(t * 0.5) * 0.15;
              g.position.y = -0.5 + Math.sin(t * 0.8) * 0.04;
              rr.render(scene, cam);
            })();
          };
          
          // FULL ROBOT KEEPER + GOALPOST
          window.buildKeeper = (canvasId) => {
            const rr = window.mkRenderer(canvasId, 170, 170);
            if (!rr) return;
            const scene = new THREE.Scene();
            const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 100);
            cam.position.set(0, 0.8, 6.5);
            cam.lookAt(0, 0.4, 0);
            window.addLights(scene, true);
            const mB = window.mkMat(0xd4a832, 0.15, 0.92), mS = window.mkMat(0xffe878, 0.05, 0.99), mJ = window.mkMat(0x8a6018, 0.3, 0.85), mE = window.mkMat(0x00eeff, 0.1, 0.3), mG = window.mkMat(0xc9a84c, 0.25, 0.80);
            const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.7 });
            const pGrp = new THREE.Group();
            const pR = 0.07;
            [-2.2, 2.2].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(pR, pR, 3.2, 16), postMat); p.position.set(x, 0.2, -1.5); pGrp.add(p); });
            const cb = new THREE.Mesh(new THREE.CylinderGeometry(pR, pR, 4.54, 16), postMat);
            cb.rotation.z = Math.PI / 2;
            cb.position.set(0, 1.82, -1.5);
            pGrp.add(cb);
            const netM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.09, side: THREE.DoubleSide, wireframe: true });
            const bn = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.8, 22, 9), netM);
            bn.position.set(0, 0.92, -2.5);
            pGrp.add(bn);
            [-1, 1].forEach(s => { const sn = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.8, 5, 9), netM); sn.rotation.y = Math.PI / 2; sn.position.set(s * 2.2, 0.92, -2.0); pGrp.add(sn); });
            const gnd = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.4), new THREE.MeshStandardMaterial({ color: 0x1a3a1a, roughness: 0.9, transparent: true, opacity: 0.55 }));
            gnd.rotation.x = -Math.PI / 2;
            gnd.position.set(0, -1.42, -1.8);
            pGrp.add(gnd);
            const gl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }));
            gl.rotation.x = -Math.PI / 2;
            gl.position.set(0, -1.41, -1.5);
            pGrp.add(gl);
            scene.add(pGrp);
            const g = new THREE.Group();
            const add = (m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); g.add(m); return m; };
            // Head tilted
            const hd = add(new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.45, 0.48), mB), -0.1, 1.0);
            hd.rotation.z = 0.35;
            const vs = add(new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.16, 0.08), window.mkMat(0x001a2a, 0.1, 0.1)), -0.12, 1.02, 0.25);
            vs.rotation.z = 0.35;
            [-0.11, 0.11].forEach(x => {
              const ey = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), mE);
              ey.rotation.x = Math.PI / 2;
              add(ey, x - 0.06, 1.02, 0.29);
              const gl2 = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 8, 16), mE);
              gl2.rotation.x = Math.PI / 2;
              add(gl2, x - 0.06, 1.02, 0.30);
            });
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), mJ);
            ant.rotation.z = -0.3;
            add(ant, 0.12, 1.26);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), mS), 0.18, 1.38);
            const nk = add(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.14, 16), mJ), -0.04, 0.74);
            nk.rotation.z = 0.35;
            const to = add(new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.66, 0.46), mB), 0.0, 0.32);
            to.rotation.z = 0.45;
            add(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.06), mS), 0.04, 0.36, 0.26);
            const pel = add(new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.26, 0.40), mB), 0.14, -0.08);
            pel.rotation.z = 0.45;
            // Right arm reaching up
            add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), mJ), 0.52, 0.58);
            const rUp = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.52, 12), mB);
            rUp.rotation.z = -1.1;
            add(rUp, 0.82, 0.92);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), mJ), 1.10, 1.20);
            const rLo = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.48, 12), mB);
            rLo.rotation.z = -1.0;
            add(rLo, 1.34, 1.42);
            const glv = add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.30, 0.12), mG), 1.58, 1.64);
            glv.rotation.z = -0.9;
            [[-0.11, 0.15], [-0.04, 0.16], [0.04, 0.15], [0.12, 0.13]].forEach(([fx, fy]) => {
              const fi = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.09), mG);
              fi.rotation.z = -0.9;
              add(fi, 1.58 + fx, 1.64 + fy, 0.01);
            });
            const gsh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.02), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.05, transparent: true, opacity: 0.55 }));
            gsh.rotation.z = -0.9;
            add(gsh, 1.56, 1.68, 0.09);
            // Left arm
            add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), mJ), -0.46, 0.52);
            const lUp = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.42, 12), mB);
            lUp.rotation.z = 0.8;
            add(lUp, -0.68, 0.28);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), mJ), -0.84, 0.06);
            const lLo = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.36, 12), mB);
            lLo.rotation.z = 0.5;
            add(lLo, -0.92, -0.14);
            // Legs splayed diving
            add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), mJ), 0.24, -0.26);
            const rTh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.50, 12), mB);
            rTh.rotation.z = -1.2;
            add(rTh, 0.42, -0.46);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 8), mJ), 0.70, -0.56);
            const rSh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.44, 12), mB);
            rSh2.rotation.z = -1.4;
            add(rSh2, 0.92, -0.58);
            add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.30), mB), 1.14, -0.56);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), mJ), -0.10, -0.28);
            const lTh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.42, 12), mB);
            lTh.rotation.z = 0.4;
            add(lTh, -0.22, -0.52);
            add(new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 8), mJ), -0.30, -0.74);
            const lSh2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.36, 12), mB);
            lSh2.rotation.z = -0.6;
            add(lSh2, -0.16, -0.90);
            add(new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.28), mB), -0.02, -1.02);
            // Ball
            const ball = new THREE.Mesh(new THREE.SphereGeometry(0.20, 32, 24), window.mkMat(0xffffff, 0.6, 0.1));
            add(ball, -1.4, 1.90, 0.3);
            [[-1,0,0],[0,1,0],[1,0,0],[0,-1,0],[0.7,0.7,0],[-0.7,0.7,0]].forEach(v => {
              const p = new THREE.Mesh(new THREE.CircleGeometry(0.065, 5), window.mkMat(0x111318, 0.8, 0));
              p.position.copy(ball.position).addScaledVector(new THREE.Vector3(...v).normalize(), 0.195);
              p.lookAt(ball.position);
              g.add(p);
            });
            g.position.set(-0.15, -0.28, 0);
            scene.add(g);
            let t = 0;
            (function a() { requestAnimationFrame(a); t += 0.010;
              const reach = Math.sin(t * 2.5) * 0.08;
              glv.position.set(1.58 + reach, 1.64 + reach * 0.8, 0);
              ball.position.set(-1.4 + Math.sin(t * 1.4) * 0.10, 1.90 + Math.cos(t * 1.4) * 0.08, 0.3);
              ball.rotation.z += 0.025;
              g.position.y = -0.28 + Math.sin(t * 1.8) * 0.025;
              g.rotation.y = Math.sin(t * 0.5) * 0.10;
              rr.render(scene, cam);
            })();
          };
          
          // WAVING FLAG
          window.buildFlag = (canvasId, code, isGold, cW, cH) => {
            const cv = document.getElementById(canvasId);
            if (!cv) return;
            if (window.flagScenes[canvasId]) try { window.flagScenes[canvasId](); } catch(e) {}
            const W = cW || 118, H = cH || 78;
            const rr = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
            rr.setSize(W, H);
            rr.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            rr.toneMapping = THREE.NoToneMapping;
            rr.outputEncoding = THREE.sRGBEncoding;
            const scene = new THREE.Scene();
            const aspect = W / H;
            const cam = new THREE.OrthographicCamera(-aspect * 1.06, aspect * 1.06, 1.06, -1.06, 0.1, 20);
            cam.position.set(0, 0, 5);
            cam.lookAt(0, 0, 0);
            scene.add(new THREE.AmbientLight(0xffffff, 1.1));
            const kl = new THREE.DirectionalLight(0xffffff, 0.5);
            kl.position.set(2, 3, 4);
            scene.add(kl);
            const fW = 3.0, fH = 2.0, sX = 40, sY = 26, vC = (sX + 1) * (sY + 1);
            const geo = new THREE.PlaneGeometry(fW, fH, sX, sY);
            const arr = geo.attributes.position.array;
            const ox = new Float32Array(vC), oy = new Float32Array(vC);
            for (let i = 0; i < vC; i++) { ox[i] = arr[i * 3]; oy[i] = arr[i * 3 + 1]; }
            const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
            const loader = new THREE.TextureLoader();
            function loadTex(url, fallback) {
              loader.load(url, tex => {
                tex.encoding = THREE.sRGBEncoding;
                tex.anisotropy = rr.capabilities.getMaxAnisotropy();
                tex.minFilter = THREE.LinearMipmapLinearFilter;
                tex.generateMipmaps = true;
                mat.map = tex;
                mat.needsUpdate = true;
              }, undefined, fallback);
            }
            loadTex(window.flHD(code), () => loadTex(window.fl(code, false), () => {}));
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.x = 0.14;
            scene.add(mesh);
            const poleMat = new THREE.MeshBasicMaterial({ color: isGold ? 0xc9a84c : 0xb0c4de });
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, fH * 1.12, 12), poleMat);
            pole.position.set(-fW / 2 - 0.04, 0, 0);
            scene.add(pole);
            const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), poleMat);
            finial.position.set(-fW / 2 - 0.04, fH * 0.57, 0);
            scene.add(finial);
            let t = 0, alive = true;
            (function a() {
              if (!alive) return;
              requestAnimationFrame(a);
              t += 0.040;
              const p = geo.attributes.position.array;
              for (let vi = 0; vi < vC; vi++) {
                const xN = (ox[vi] + fW / 2) / fW;
                p[vi * 3] = ox[vi];
                p[vi * 3 + 1] = oy[vi] + Math.sin(xN * 2.8 - t * 0.85) * 0.032 * xN;
                p[vi * 3 + 2] = Math.sin(xN * 3.5 - t) * 0.11 * xN + Math.sin(xN * 7.0 - t * 1.4) * 0.045 * xN;
              }
              geo.attributes.position.needsUpdate = true;
              geo.computeVertexNormals();
              rr.render(scene, cam);
            })();
            window.flagScenes[canvasId] = () => { alive = false; rr.dispose(); };
          };
          setThreeLoaded(true);
        }}
      />
      
      {/* SINGLE NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href="/dashboard" className="nav-item">My Pools</Link>
          <Link href="/browse" className="nav-item">Browse</Link>
          <Link href="/scores" className="nav-item">Scores</Link>
        </div>
        <div className="nav-right">
          <Link href="/create" className="nav-cta">+ Create Pool</Link>
          <Link href="/profile" className="nav-profile">
            <div className="nav-avatar">{getUserInitials()}</div>
          </Link>
        </div>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">My Pools › {pool?.name}</div>
            <div className="ph-title">Special Picks</div>
            <div className="ph-meta">{pool?.tournament === 'rg2026' ? 'Roland Garros 2026' : pool?.tournament === 'nba2026' ? 'NBA Western Conference Finals 2026' : 'FIFA World Cup 2026'} · {pool?.tournament === 'rg2026' ? '20' : '30'} pts available</div>
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
                  <div className="tn tn-g">
                    {champion.n}
                    {champion.r && <span style={{ fontWeight: 700, marginLeft: '4px', color: champion.r === 1 ? '#c9a84c' : '#8a8780' }}>({champion.r})</span>}
                  </div>
                </div>
              ) : (
                <div className="cta"><div className="plus-c">+</div>{pool?.tournament === 'rg2026' ? 'Select player' : 'Select team'}</div>
              )}
            </div>
          </div>
          {saving.champion && <div className="saving">Saving...</div>}
        </div>

        {/* RUNNER-UP */}
        <div className={`card silver ${runnerUp ? 'picked' : ''} ${isLocked ? 'locked' : ''}`} onClick={() => openTeamModal('runner')}>
          <div className="pts sv">10 pts</div>
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
                  <div className="tn tn-s">
                    {runnerUp.n}
                    {runnerUp.r && <span style={{ fontWeight: 700, marginLeft: '4px', color: runnerUp.r === 1 ? '#c9a84c' : '#8a8780' }}>({runnerUp.r})</span>}
                  </div>
                </div>
              ) : (
                <div className="cta"><div className="plus-c">+</div>{pool?.tournament === 'rg2026' ? 'Select player' : 'Select team'}</div>
              )}
            </div>
          </div>
          {saving.runner_up && <div className="saving">Saving...</div>}
        </div>

        {/* PICHICHI - Only for World Cup */}
        {pool?.tournament !== 'rg2026' && (
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
        )}

        {/* GOLDEN GLOVE - Only for World Cup */}
        {pool?.tournament !== 'rg2026' && (
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
        )}
      </div>

      {/* Save Button */}
      {!isLocked && (
        <div className="save-section">
          <button 
            className={`save-btn ${saving.done ? 'saved' : ''}`}
            onClick={async () => {
              setSaving({ all: true })
              try {
                const picks = []
                if (champion) picks.push({ pick_type: 'champion', team_code: champion.c, team_name: champion.n, player_name: null })
                if (runnerUp) picks.push({ pick_type: 'runner_up', team_code: runnerUp.c, team_name: runnerUp.n, player_name: null })
                if (topScorer) picks.push({ pick_type: 'top_scorer', team_code: topScorer.team, team_name: topScorer.teamName, player_name: topScorer.name })
                if (bestKeeper) picks.push({ pick_type: 'best_keeper', team_code: bestKeeper.team, team_name: bestKeeper.teamName, player_name: bestKeeper.name })
                
                console.log('Saving picks for member:', poolMember.id, picks)
                
                for (const pick of picks) {
                  const { data, error } = await supabase
                    .from('special_picks')
                    .upsert({ pool_member_id: poolMember.id, ...pick }, { onConflict: 'pool_member_id,pick_type' })
                  
                  if (error) {
                    console.error('Supabase error:', error)
                    throw error
                  }
                  console.log('Saved pick:', pick.pick_type, data)
                }
                setSaving({ done: true })
                setTimeout(() => setSaving({}), 2000)
              } catch (err) {
                console.error('Error saving picks:', err)
                setSaving({ error: true })
                setTimeout(() => setSaving({}), 2000)
              }
            }}
            disabled={saving.all || saving.done}
          >
            {saving.all ? 'Saving...' : saving.done ? 'Saved ✓' : saving.error ? 'Error!' : 'Save Picks'}
          </button>
        </div>
      )}

      {/* Deadline Banner */}
      <div className="deadline-banner">
        <span>{pool?.tournament === 'rg2026' ? '🎾' : '🏆'}</span>
        <div>
          <strong>DEADLINE: {tournamentStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' }).toUpperCase()} · {tournamentStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })} ET</strong>
          <p>All special picks lock {pool?.prediction_deadline === '30m_before_matchday' ? '30 min' : pool?.prediction_deadline === '2h_before_matchday' ? '2 hours' : '1 hour'} before first match</p>
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
              
              {(modalType === 'champion' || modalType === 'runner') && pool?.tournament !== 'rg2026' && (
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
              
              {/* RG - Tennis Players for Champion/Runner-up */}
              {(modalType === 'champion' || modalType === 'runner') && pool?.tournament === 'rg2026' && (
                <>
                  <input 
                    className="srch" 
                    type="text" 
                    placeholder="Search players..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div className="plist">
                    {filteredTennisPlayers.map(p => {
                      const isS = modalType === 'runner'
                      const cur = modalType === 'champion' ? champion : runnerUp
                      const sel = cur && cur.n === p.n
                      const isNumber1 = p.r === 1
                      return (
                        <div 
                          key={p.n + p.r} 
                          className={`pitem ${sel ? 'selected' : ''}`}
                          style={sel ? { borderColor: isS ? '#b8cce0' : '#c9a84c', background: isS ? 'rgba(184,204,224,0.12)' : 'rgba(201,168,76,0.12)' } : {}}
                          onClick={() => pickTeam({ c: p.c, n: p.n, r: p.r })}
                        >
                          <img src={fl(p.c, true)} alt={p.c} />
                          <div style={{ flex: 1 }}>
                            <div className="pi-n" style={sel ? { color: isS ? '#b8cce0' : '#c9a84c' } : {}}>
                              {p.n} <span style={{ fontWeight: 700, fontSize: '0.75rem', marginLeft: '4px', color: isNumber1 ? '#c9a84c' : '#8a8780' }}>({p.r})</span>
                            </div>
                            <div className="pi-t">ATP Rank #{p.r}</div>
                          </div>
                          <span className="pi-p" style={{ background: isNumber1 ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.12)', color: isNumber1 ? '#c9a84c' : '#8a8780', fontWeight: isNumber1 ? 800 : 600 }}>
                            #{p.r}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </>
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
        /* NAV - Single consolidated navigation */
        nav { background: #0a0c10; border-bottom: 3px solid #c9a84c; display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: #f0ede8; text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid #4a4845; text-decoration: none; }
        .nav-logo span { color: #c9a84c; }
        .nav-items { display: flex; height: 100%; flex: 1; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8a8780; text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: #f0ede8; }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .nav-cta { font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #c9a84c; color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }
        .nav-profile { display: flex; align-items: center; text-decoration: none; }
        .nav-avatar { width: 32px; height: 32px; background: #c9a84c; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 800; color: #000; transition: transform 0.15s; }
        .nav-avatar:hover { transform: scale(1.08); }

        /* PAGE HEADER */
        .page-header { background: #111318; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 900px; margin: 0 auto; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a84c; margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: #f0ede8; }
        .ph-meta { font-size: 0.78rem; color: #8a8780; margin-top: 0.2rem; }

        /* Tab styles now in globals.css */

        /* GRID */
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; background: #0a0c10; max-width: 640px; margin: 0 auto; }

        /* CARD */
        .card { position: relative; border-radius: 10px; overflow: hidden; background: #111318; border: 1px solid rgba(255,255,255,0.08); min-height: 290px; display: flex; flex-direction: column; cursor: pointer; transition: border-color 0.2s; }
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

        /* SAVE BUTTON */
        .save-section { display: flex; justify-content: center; padding: 1rem; max-width: 640px; margin: 0 auto; }
        .save-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 1rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: #c9a84c; color: #000; padding: 0.85rem 2.5rem; border-radius: 4px; border: none; cursor: pointer; transition: all 0.15s; }
        .save-btn:hover { background: #e6c76a; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .save-btn.saved { background: #2cb67d; color: #fff; }

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
