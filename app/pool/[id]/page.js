'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

const getTournamentName = (code) => ({
  'wc2026': 'FIFA World Cup 2026',
  'rg2026': 'Roland Garros 2026',
  'nba2026': 'NBA Western Conference Finals 2026'
})[code] || 'FIFA World Cup 2026'

const getTournamentStart = (code) => ({
  'wc2026': 'Jun 11, 2026',
  'rg2026': 'May 24, 2026',
  'nba2026': 'May 18, 2026'
})[code] || 'Jun 11, 2026'

const getTournamentDeadline = (code) => {
  const deadlines = {
    'wc2026': new Date('2026-06-11T17:00:00-04:00'), // Jun 11 5PM ET
    'rg2026': new Date('2026-05-24T05:00:00-04:00'), // May 24 5AM ET
    'nba2026': new Date('2026-05-18T20:00:00-04:00')
  }
  return deadlines[code] || deadlines['wc2026']
}

export default function PoolDashboard() {
  const params = useParams()
  const router = useRouter()
  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [currentMember, setCurrentMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTeamNameModal, setShowTeamNameModal] = useState(false)
  const [teamNameInput, setTeamNameInput] = useState('')
  const [savingTeamName, setSavingTeamName] = useState(false)
  const [countdown, setCountdown] = useState('--:--:--')
  const [userPicksCount, setUserPicksCount] = useState(0)
  const [userSpecialCount, setUserSpecialCount] = useState(0)
  const [userQualifiersCount, setUserQualifiersCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) { router.push('/login'); return }
        setUser(currentUser)

        const { data: poolData, error: poolError } = await supabase
          .from('pools')
          .select('*, profiles:commissioner_id (id, name)')
          .eq('id', params.id)
          .single()

        if (poolError || !poolData) {
          setError('Pool not found')
          setLoading(false)
          return
        }

        const { data: membersData } = await supabase
          .from('pool_members')
          .select('*, profiles:user_id (id, name, email, team_name)')
          .eq('pool_id', params.id)
          .order('total_points', { ascending: false, nullsFirst: false })

        const formattedMembers = (membersData || []).map((m, index) => {
          const teamName = m.team_name || m.profiles?.team_name || null
          const profileName = m.profiles?.name
          const emailUser = m.profiles?.email?.split('@')[0] || null
          const fullName = profileName || emailUser || 'Player'
          return {
            rank: index + 1,
            id: m.id,
            user_id: m.user_id,
            teamName,
            fullName,
            displayName: teamName || fullName,
            points: m.total_points || 0,
            paid: m.payment_status === 'paid',
            payment_status: m.payment_status,
            payment_method: m.payment_method,
            isYou: m.user_id === currentUser.id,
            name_changes_count: m.name_changes_count || 0
          }
        })

        const currentUserMember = formattedMembers.find(m => m.user_id === currentUser.id)

        setPool({
          ...poolData,
          commissioner_name: poolData.profiles?.name || 'Unknown',
          isCommissioner: poolData.commissioner_id === currentUser.id,
          player_count: formattedMembers.length,
          user_rank: currentUserMember?.rank,
          user_points: currentUserMember?.points || 0
        })
        setMembers(formattedMembers)
        setCurrentMember(currentUserMember)
        if (currentUserMember?.teamName) setTeamNameInput(currentUserMember.teamName)
        
        // Fetch user's picks count
        const { data: picksData } = await supabase
          .from('picks')
          .select('id')
          .eq('pool_id', params.id)
          .eq('user_id', currentUser.id)
        setUserPicksCount(picksData?.length || 0)
        
        // Fetch user's special picks count (uses pool_member_id)
        if (currentUserMember) {
          const { data: specialData } = await supabase
            .from('special_picks')
            .select('id')
            .eq('pool_member_id', currentUserMember.id)
          setUserSpecialCount(specialData?.length || 0)
        }
        
        // Fetch user's qualifiers count (for WC only)
        if (poolData?.tournament === 'wc2026') {
          const { data: qualifiersData } = await supabase
            .from('wc_group_picks')
            .select('id')
            .eq('pool_id', params.id)
            .eq('user_id', currentUser.id)
          setUserQualifiersCount(qualifiersData?.length || 0)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.id, router])

  // Countdown timer
  useEffect(() => {
    if (!pool?.tournament) return
    const deadline = getTournamentDeadline(pool.tournament)
    
    const updateCountdown = () => {
      const now = new Date()
      const diff = deadline - now
      if (diff <= 0) {
        setCountdown('LOCKED')
        return
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      
      if (days > 0) {
        setCountdown(`${days}d ${hours}h ${mins}m`)
      } else {
        setCountdown(`${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`)
      }
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [pool?.tournament])

  const handleUpdateTeamName = async () => {
    if (!teamNameInput.trim() || !currentMember) return
    setSavingTeamName(true)
    try {
      const { error } = await supabase
        .from('pool_members')
        .update({ 
          team_name: teamNameInput.trim(),
          name_changes_count: (currentMember.name_changes_count || 0) + 1
        })
        .eq('id', currentMember.id)
      if (error) throw error
      setShowTeamNameModal(false)
      window.location.reload()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSavingTeamName(false)
    }
  }

  const copyInviteLink = () => {
    const link = `https://pickpoolr.com/join/${pool?.invite_code || params.id}`
    navigator.clipboard.writeText(link)
    alert('Link copied!')
  }

  const shareWhatsApp = () => {
    const tournamentName = pool?.tournament === 'rg2026' ? 'Roland Garros' : 'World Cup'
    const text = `Join my ${tournamentName} pool "${pool?.name}" on PickPoolr! 🏆 https://pickpoolr.com/join/${pool?.invite_code || params.id}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareTwitter = () => {
    const tournamentName = pool?.tournament === 'rg2026' ? 'Roland Garros' : 'World Cup'
    const text = `Join my ${tournamentName} pool "${pool?.name}" on PickPoolr! 🏆`
    const url = `https://pickpoolr.com/join/${pool?.invite_code || params.id}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareFacebook = () => {
    const url = `https://pickpoolr.com/join/${pool?.invite_code || params.id}`
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const shareMore = async () => {
    const tournamentName = pool?.tournament === 'rg2026' ? 'Roland Garros' : 'World Cup'
    const text = `Join my ${tournamentName} pool "${pool?.name}" on PickPoolr!`
    const url = `https://pickpoolr.com/join/${pool?.invite_code || params.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: pool?.name, text, url })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied!')
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="loading">{error} <Link href="/dashboard">← Back</Link></div>
  
  // Block pending members until approved (but not the commissioner)
  const isCommissioner = pool?.commissioner_id === user?.id
  if (currentMember?.payment_status === 'pending' && !isCommissioner) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
          :root { --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--gold:#c9a84c;--gold2:#e6c76a;--f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;--line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3); }
          body { background:var(--bg);margin:0;font-family:'Inter',sans-serif; }
          .pending-screen { min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;text-align:center; }
          .pending-icon { font-size:4rem;margin-bottom:1.5rem; }
          .pending-title { font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;color:var(--f1);margin-bottom:0.5rem; }
          .pending-sub { color:var(--f3);font-size:0.95rem;line-height:1.6;max-width:400px;margin-bottom:2rem; }
          .pending-pool { font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:700;color:var(--gold);margin-bottom:0.5rem; }
          .pending-box { background:var(--bg2);border:1px solid var(--gold-line);border-radius:8px;padding:1.5rem 2rem;margin-bottom:2rem; }
          .pending-status { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:600;color:var(--f2);margin-bottom:0.5rem; }
          .pending-status span { color:var(--gold);font-weight:800; }
          .pending-method { font-size:0.8rem;color:var(--f4); }
          .pending-btn { font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:transparent;border:1px solid var(--f4);color:var(--f2);padding:0.75rem 1.5rem;border-radius:4px;text-decoration:none;transition:all 0.15s; }
          .pending-btn:hover { border-color:var(--gold);color:var(--gold); }
        `}</style>
        <div className="pending-screen">
          <div className="pending-icon">⏳</div>
          <div className="pending-title">Esperando Aprobación</div>
          <div className="pending-pool">{pool?.name}</div>
          <div className="pending-sub">
            Tu solicitud ha sido enviada. El comisionado verificará tu pago y te aceptará a la liga.
          </div>
          <div className="pending-box">
            <div className="pending-status">Estado: <span>Pendiente</span></div>
            {currentMember?.payment_method && (
              <div className="pending-method">Pagaste por: {currentMember.payment_method.charAt(0).toUpperCase() + currentMember.payment_method.slice(1)}</div>
            )}
          </div>
          <Link href="/dashboard" className="pending-btn">← Volver al Dashboard</Link>
        </div>
      </>
    )
  }

  const isRG = pool?.tournament === 'rg2026'
  const rankSuffix = pool?.user_rank === 1 ? 'st' : pool?.user_rank === 2 ? 'nd' : pool?.user_rank === 3 ? 'rd' : 'th'
  const totalMatches = isRG ? 127 : 48
  const totalSpecial = isRG ? 2 : 4

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--bg4:#1e2330;
          --gold:#c9a84c;--gold2:#e6c76a;--red:#e03b3b;--green:#2cb67d;
          --f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;
          --line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3);
        }
        .loading { display:flex;align-items:center;justify-content:center;min-height:100vh;color:var(--f3);gap:1rem; }
        .loading a { color:var(--gold); }

        /* NAV */
        .nav { background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:56px;position:sticky;top:0;z-index:200; }
        .nav-logo { font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900;color:#fff;text-decoration:none;letter-spacing:0.04em; }
        .nav-logo span { color:var(--gold); }
        .nav-right { margin-left:auto;display:flex;gap:1rem;align-items:center; }
        .nav-link { font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none; }
        .nav-link:hover { color:var(--f1); }

        /* WRAP */
        .a-wrap { background:#07090e;border-top:4px solid var(--gold);min-height:calc(100vh - 56px); }

        /* HERO */
        .a-hero { background:linear-gradient(180deg,#0f1420 0%,#07090e 100%);border-bottom:1px solid rgba(201,168,76,0.15);padding:1.1rem 1.5rem 0;max-width:1200px;margin:0 auto; }
        .a-hero-top { display:flex;align-items:flex-start;justify-content:space-between;gap:1.5rem;padding-bottom:1rem; }
        .a-pool-tag { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--gold);margin-bottom:0.35rem;display:flex;align-items:center;gap:6px; }
        .a-pool-tag::before { content:'';width:18px;height:2px;background:var(--gold); }
        .a-pool-name { font-family:'Barlow Condensed',sans-serif;font-size:2.2rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:#fff;line-height:1;margin-bottom:0.4rem; }
        .a-tags { display:flex;align-items:center;gap:6px;flex-wrap:wrap; }
        .tag { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.18rem 0.55rem;border-radius:2px; }
        .tag-outline { border:1px solid var(--f4);color:var(--f3); }
        .tag-gold { border:1px solid var(--gold-line);color:var(--gold);background:rgba(201,168,76,0.08); }
        .tag-green { border:1px solid rgba(44,182,125,0.25);color:var(--green);background:rgba(44,182,125,0.08); }
        
        /* TABS */
        .a-tabs { display:flex;gap:0;border-top:1px solid rgba(255,255,255,0.05);margin:0 -1.5rem;padding:0 1.5rem; }
        .a-tab { font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);padding:0.7rem 1rem;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;text-decoration:none;transition:color 0.15s;display:inline-block; }
        .a-tab:hover { color:var(--f1); }
        .a-tab.active { color:#fff;border-bottom-color:var(--gold); }
        .a-stats { display:flex;gap:0;border:1px solid rgba(201,168,76,0.18);border-radius:4px;overflow:hidden;align-self:flex-start;flex-shrink:0; }
        .a-stat { padding:0.65rem 1.1rem;border-right:1px solid rgba(201,168,76,0.12);text-align:center;background:rgba(201,168,76,0.03);min-width:72px; }
        .a-stat:last-child { border-right:none; }
        .a-stat-n { font-family:'Barlow Condensed',sans-serif;font-size:1.8rem;font-weight:900;color:var(--gold);line-height:1; }
        .a-stat-n.w { color:#fff; }
        .a-stat-n.g { color:var(--green); }
        .a-stat-l { font-family:'Barlow Condensed',sans-serif;font-size:0.58rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f4);margin-top:3px;white-space:nowrap; }

        /* BODY GRID */
        .a-body { display:grid;grid-template-columns:1fr 268px;gap:0;max-width:1200px;margin:0 auto; }
        .a-main { padding:1.25rem 1.5rem;border-right:1px solid var(--line); }
        .a-side { padding:1.25rem;background:#07090d; }

        /* ACTION CARDS */
        .a-cards { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:1.1rem; }
        .a-card { border:1px solid rgba(201,168,76,0.18);border-radius:4px;padding:0.85rem 0.9rem;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:0.75rem;background:rgba(201,168,76,0.03);text-decoration:none; }
        .a-card:hover { border-color:var(--gold);background:rgba(201,168,76,0.06); }
        .a-card.sil { border-color:rgba(184,204,224,0.18);background:rgba(184,204,224,0.03); }
        .a-card.sil:hover { border-color:#b8cce0;background:rgba(184,204,224,0.06); }
        .a-card.grn { border-color:rgba(44,182,125,0.2);background:rgba(44,182,125,0.03); }
        .a-card.grn:hover { border-color:rgba(44,182,125,0.5);background:rgba(44,182,125,0.06); }
        .a-card.grn .a-card-icon { background:rgba(44,182,125,0.08);border-color:rgba(44,182,125,0.2); }
        .a-card.grn .a-arrow { color:var(--green); }
        .a-card-icon { width:38px;height:38px;border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2); }
        .a-card.sil .a-card-icon { background:rgba(184,204,224,0.08);border-color:rgba(184,204,224,0.2); }
        .a-card-title { font-family:'Barlow Condensed',sans-serif;font-size:0.88rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:#fff;margin-bottom:2px; }
        .a-card-sub { font-size:0.66rem;color:var(--f3);line-height:1.4; }
        .a-prog { display:flex;align-items:center;gap:6px;margin-top:5px; }
        .a-prog-bar { flex:1;height:2px;background:rgba(255,255,255,0.08);border-radius:1px; }
        .a-prog-fill { height:100%;border-radius:1px;background:var(--gold); }
        .a-prog-txt { font-family:'Barlow Condensed',sans-serif;font-size:0.56rem;font-weight:700;color:var(--f4);white-space:nowrap; }
        .a-arrow { margin-left:auto;flex-shrink:0;color:var(--gold);font-size:1rem;font-family:'Barlow Condensed',sans-serif;font-weight:900; }
        .a-card.sil .a-arrow { color:#b8cce0; }

        /* BANNER */
        .a-banner { background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:4px;padding:0.7rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:1rem; }
        .a-banner-left { font-family:'Barlow Condensed',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold); }
        .a-banner-sub { font-size:0.68rem;color:var(--f3);margin-top:2px; }
        .a-banner-right { font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);white-space:nowrap; }

        /* SECTION HEADS */
        .a-sh { display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem; }
        .a-sh-title { font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--f3); }
        .a-sh-link { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);cursor:pointer;text-decoration:none; }

        /* LEADERBOARD */
        .a-lb { background:rgba(201,168,76,0.03);border:1px solid rgba(201,168,76,0.1);border-radius:4px;overflow:hidden;margin-bottom:1.1rem; }
        .a-lb-row { display:grid;grid-template-columns:32px 20px 1fr auto;align-items:center;gap:0 10px;padding:0.55rem 0.85rem;border-bottom:1px solid rgba(255,255,255,0.04); }
        .a-lb-row:last-child { border-bottom:none; }
        .a-lb-row.you { background:rgba(201,168,76,0.04); }
        .a-lb-rank { font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:900;color:var(--gold2);text-align:center; }
        .a-lb-mv { font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;color:var(--f4);text-align:center; }
        .a-lb-name { font-size:0.82rem;font-weight:500;color:#fff;display:flex;align-items:center;gap:5px;flex-wrap:wrap; }
        .a-lb-sub { font-size:0.65rem;color:var(--f4);margin-top:1px; }
        .you-chip { font-family:'Barlow Condensed',sans-serif;font-size:0.52rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);background:rgba(201,168,76,0.12);border:1px solid var(--gold-line);padding:0.08rem 0.3rem;border-radius:2px; }
        .a-lb-pts { font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;color:#fff; }
        .online-dot { width:5px;height:5px;border-radius:50%;background:var(--green);display:inline-block; }

        /* INVITE */
        .a-invite { background:var(--bg);border:1px solid var(--line);border-radius:3px;padding:0.55rem 0.85rem;display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem; }
        .a-invite-url { font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:600;color:var(--gold);flex:1; }
        .a-copy { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.3rem 0.7rem;border-radius:2px;border:none;cursor:pointer;white-space:nowrap; }
        .share-row { display:flex;gap:6px;flex-wrap:wrap; }
        .s-btn { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:0.32rem 0.65rem;border-radius:3px;border:none;cursor:pointer; }
        .s-wa { background:#25d366;color:#000; }
        .s-x { background:#000;color:#fff;border:1px solid var(--line); }
        .s-fb { background:#1877f2;color:#fff; }
        .s-more { background:var(--bg3);color:var(--f2);border:1px solid var(--line); }

        /* SIDEBAR WIDGETS */
        .sw { margin-bottom:0.85rem; }
        .sw-head { font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--f4);border-bottom:1px solid var(--line);padding-bottom:0.4rem;margin-bottom:0.55rem;display:flex;align-items:center;justify-content:space-between; }
        .sw-row { display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0;border-bottom:1px solid rgba(255,255,255,0.04); }
        .sw-row:last-child { border-bottom:none; }
        .sw-label { font-size:0.72rem;color:var(--f3); }
        .sw-val { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700; }
        .vg { color:var(--gold); }
        .vgr { color:var(--green); }
        .vw { color:#fff; }

        /* SCORING */
        .score-group { margin-bottom:0.6rem;padding-bottom:0.6rem;border-bottom:1px solid var(--line); }
        .score-group:last-child { margin-bottom:0;padding-bottom:0;border-bottom:none; }
        .score-group-label { font-family:'Barlow Condensed',sans-serif;font-size:0.56rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--f4);margin-bottom:0.3rem; }
        .score-row { display:flex;align-items:center;justify-content:space-between;padding:0.26rem 0;border-bottom:1px solid rgba(255,255,255,0.04); }
        .score-row:last-child { border-bottom:none; }
        .score-label { font-size:0.7rem;color:var(--f3); }
        .score-pts { font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;color:var(--gold); }
        .score-pts.dim { color:var(--f2); }

        /* SETTINGS CARD */
        .settings-card { background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden; }
        .settings-card-head { background:var(--bg3);padding:0.55rem 0.85rem;border-bottom:1px solid var(--line);font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--f4); }
        .settings-card-body { padding:0.75rem 0.85rem; }
        .settings-team-row { display:flex;align-items:center;justify-content:space-between;padding-bottom:0.65rem;margin-bottom:0.65rem;border-bottom:1px solid var(--line); }
        .settings-team-label { font-size:0.72rem;color:var(--f3); }
        .settings-team-name { font-family:'Barlow Condensed',sans-serif;font-size:1.05rem;font-weight:900;text-transform:uppercase;letter-spacing:0.03em;color:var(--gold); }
        .change-btn { font-family:'Barlow Condensed',sans-serif;font-size:0.58rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;background:transparent;color:var(--f3);border:1px solid var(--f4);padding:0.15rem 0.45rem;border-radius:2px;cursor:pointer;flex-shrink:0; }
        .change-btn:hover { border-color:var(--f2);color:var(--f1); }
        .settings-actions { display:flex;flex-direction:column;gap:0; }
        .settings-action-btn { display:flex;align-items:center;gap:8px;padding:0.55rem 0;border-bottom:1px solid var(--line);cursor:pointer;transition:all 0.15s;text-decoration:none; }
        .settings-action-btn:last-child { border-bottom:none;padding-bottom:0; }
        .settings-action-btn:first-child { padding-top:0; }
        .settings-action-icon { width:28px;height:28px;border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.9rem; }
        .icon-payments { background:rgba(44,182,125,0.1);border:1px solid rgba(44,182,125,0.2); }
        .icon-settings { background:rgba(138,135,128,0.12);border:1px solid rgba(138,135,128,0.15); }
        .settings-action-text { flex:1; }
        .settings-action-title { font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:var(--f1); }
        .settings-action-sub { font-size:0.62rem;color:var(--f4);margin-top:1px; }
        .settings-action-arrow { font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:900;color:var(--f4);flex-shrink:0; }
        .settings-action-btn:hover .settings-action-title { color:var(--gold); }
        .settings-action-btn:hover .settings-action-arrow { color:var(--gold); }
        .settings-action-btn.payments:hover .settings-action-title { color:var(--green); }
        .settings-action-btn.payments:hover .settings-action-arrow { color:var(--green); }

        /* MODAL */
        .modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:999; }
        .modal { background:var(--bg2);border:1px solid var(--line);border-radius:6px;width:90%;max-width:400px;overflow:hidden; }
        .modal-header { background:var(--bg3);padding:1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line); }
        .modal-title { font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:800;text-transform:uppercase;color:#fff; }
        .modal-close { background:none;border:none;color:var(--f3);font-size:1.5rem;cursor:pointer; }
        .modal-body { padding:1.25rem; }
        .field-label { font-family:'Barlow Condensed',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f3);margin-bottom:0.4rem; }
        .field-input { width:100%;background:var(--bg);border:1px solid var(--f4);border-radius:3px;padding:0.75rem;color:#fff;font-size:0.95rem; }
        .field-input:focus { outline:none;border-color:var(--gold); }
        .field-hint { font-size:0.7rem;color:var(--f4);margin-top:0.4rem; }
        .modal-actions { display:flex;gap:0.75rem;margin-top:1.25rem; }
        .btn-cancel { flex:1;padding:0.6rem;background:var(--bg3);border:1px solid var(--line);border-radius:3px;color:var(--f2);font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;cursor:pointer; }
        .btn-save { flex:1;padding:0.6rem;background:var(--gold);border:none;border-radius:3px;color:#000;font-family:'Barlow Condensed',sans-serif;font-weight:800;text-transform:uppercase;cursor:pointer; }
        .btn-save:disabled { opacity:0.5;cursor:not-allowed; }

        @media (max-width:900px) {
          .a-body { grid-template-columns:1fr; }
          .a-side { border-top:1px solid var(--line); }
          .a-header { flex-direction:column;gap:1rem; }
          .a-stats { align-self:stretch; }
          .a-stat { flex:1; }
          .a-cards { grid-template-columns:1fr 1fr; }
        }
        @media (max-width:600px) {
          .a-cards { grid-template-columns:1fr; }
        }
        @media (max-width:768px) {
          .a-wrap { padding:0; }
          .a-hero { padding:1rem; border-radius:0; }
          .a-hero-top { flex-direction:column; gap:1rem; }
          .a-pool-name { font-size:1.8rem; }
          .a-pool-tag { font-size:0.6rem; }
          .a-tags { flex-wrap:wrap; gap:0.4rem; }
          .tag { font-size:0.6rem; padding:0.2rem 0.5rem; }
          .a-stats { display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; padding:0.75rem 0; margin-top:0.5rem; border-top:1px solid var(--line); }
          .a-stat { border:1px solid var(--line); border-radius:4px; padding:0.6rem 0.4rem; text-align:center; }
          .a-stat-n { font-size:1.1rem; }
          .a-stat-l { font-size:0.55rem; }
          .a-tabs { padding:0 1rem; overflow-x:auto; -webkit-overflow-scrolling:touch; }
          .a-tab { font-size:0.7rem; padding:0.6rem 0.75rem; white-space:nowrap; }
          .a-main { padding:1rem; }
          .a-card { border-radius:6px; }
          .a-card-head { padding:0.75rem; }
          .a-card-title { font-size:0.85rem; }
          .a-card-body { padding:0.75rem; }
          .progress-label { font-size:0.65rem; }
          .progress-val { font-size:0.65rem; }
          .countdown-row { flex-direction:column; gap:0.5rem; padding:0.75rem; }
          .countdown-left { font-size:0.65rem; }
          .countdown-val { font-size:1.1rem; }
          .lb-row { padding:0.6rem 0.75rem; }
          .lb-rank { font-size:0.75rem; width:28px; }
          .lb-name { font-size:0.8rem; }
          .lb-pts { font-size:0.8rem; }
        }
        @media (max-width:480px) {
          .a-hero { padding:0.75rem; }
          .a-pool-name { font-size:1.5rem; }
          .a-stats { grid-template-columns:repeat(2, 1fr); }
          .a-main { padding:0.75rem; }
          .nav { padding:0 0.75rem; }
          .nav-logo { font-size:1.3rem; }
          .nav-link { font-size:0.65rem; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/scores" className="nav-link">Scores</Link>
        </div>
      </nav>

      <div className="a-wrap">
        {/* HERO */}
        <div className="a-hero">
          <div className="a-hero-top">
            <div>
              <div className="a-pool-tag">{getTournamentName(pool?.tournament)}</div>
              <div className="a-pool-name">{pool?.name}</div>
              <div className="a-tags">
                <span className="tag tag-green">● Open</span>
                <span className="tag tag-gold">{pool?.buy_in ? `$${pool.buy_in} pool` : 'Free pool'}</span>
                <span className="tag tag-outline">{pool?.visibility === 'private' ? 'Private' : 'Public'}</span>
                <span className="tag tag-outline">{pool?.player_count} player{pool?.player_count !== 1 ? 's' : ''}</span>
                <span className="tag tag-gold">Coming {getTournamentStart(pool?.tournament)?.split(',')[0]}</span>
              </div>
            </div>
            <div className="a-stats">
              <div className="a-stat"><div className="a-stat-n w">{pool?.user_rank ? `${pool.user_rank}${rankSuffix}` : '-'}</div><div className="a-stat-l">Rank</div></div>
              <div className="a-stat"><div className="a-stat-n">{pool?.user_points || 0}</div><div className="a-stat-l">Points</div></div>
              <div className="a-stat"><div className="a-stat-n">{userPicksCount}/{totalMatches}</div><div className="a-stat-l">Picks in</div></div>
              <div className="a-stat"><div className="a-stat-n">{userSpecialCount}/{totalSpecial}</div><div className="a-stat-l">Special</div></div>
              {!isRG && <div className="a-stat"><div className="a-stat-n" style={{color: userQualifiersCount === 12 ? 'var(--green)' : 'inherit'}}>{userQualifiersCount}/12</div><div className="a-stat-l">Groups</div></div>}
              {parseFloat(pool?.buy_in) > 0 && (
                <div className="a-stat"><div className="a-stat-n g">${(members.filter(m => m.paid).length * parseFloat(pool?.buy_in || 0)).toFixed(0)}</div><div className="a-stat-l">Prize pot</div></div>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="a-tabs" style={{display:'flex',gap:0,borderTop:'1px solid rgba(255,255,255,0.05)',margin:'0 -1.5rem',padding:'0 1.5rem'}}>
            <Link href={`/pool/${params.id}/predictions`} className="a-tab" style={{padding:'0.7rem 1rem',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--f3)',borderBottom:'2px solid transparent',whiteSpace:'nowrap',textDecoration:'none'}}>Match Picks</Link>
            <Link href={`/pool/${params.id}/special-picks`} className="a-tab" style={{padding:'0.7rem 1rem',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--f3)',borderBottom:'2px solid transparent',whiteSpace:'nowrap',textDecoration:'none'}}>Special Picks</Link>
            {!isRG && <Link href={`/pool/${params.id}/group-picks`} className="a-tab" style={{padding:'0.7rem 1rem',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--f3)',borderBottom:'2px solid transparent',whiteSpace:'nowrap',textDecoration:'none'}}>Qualifiers</Link>}
            <Link href={`/pool/${params.id}`} className="a-tab active" style={{padding:'0.7rem 1rem',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'#fff',borderBottom:'2px solid var(--gold)',whiteSpace:'nowrap',textDecoration:'none'}}>Overview</Link>
            {pool?.isCommissioner && <Link href={`/pool/${params.id}/manage`} className="a-tab" style={{padding:'0.7rem 1rem',fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.78rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--f3)',borderBottom:'2px solid transparent',whiteSpace:'nowrap',textDecoration:'none'}}>Settings</Link>}
          </div>
        </div>

        <div className="a-body">
          {/* MAIN */}
          <div className="a-main">
            {/* Action cards */}
            <div className="a-cards">
              <Link href={`/pool/${params.id}/predictions`} className="a-card">
                <div className="a-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="18" rx="1"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M2 8h4v8H2"/>
                    <path d="M22 8h-4v8h4"/>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="a-card-title">Match Picks</div>
                  <div className="a-card-sub">{isRG ? 'Predict winners' : 'Predict scorelines'}</div>
                  <div className="a-prog">
                    <div className="a-prog-bar"><div className="a-prog-fill" style={{width:`${Math.round((userPicksCount/totalMatches)*100)}%`}}></div></div>
                    <div className="a-prog-txt">{userPicksCount} / {totalMatches}</div>
                  </div>
                </div>
                <div className="a-arrow">→</div>
              </Link>
              <Link href={`/pool/${params.id}/special-picks`} className="a-card sil">
                <div className="a-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b8cce0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 3h12l-1.5 8a5 5 0 0 1-9 0L6 3z"/>
                    <path d="M6 5H3a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4"/>
                    <path d="M18 5h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4"/>
                    <line x1="12" y1="16" x2="12" y2="20"/>
                    <path d="M8 20h8"/>
                    <path d="M7 22h10" strokeWidth="2"/>
                  </svg>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="a-card-title">Special Picks</div>
                  <div className="a-card-sub">{isRG ? 'Champion, runner-up' : 'Champion, scorer, GK'}</div>
                  <div className="a-prog">
                    <div className="a-prog-bar"><div className="a-prog-fill" style={{width:`${Math.round((userSpecialCount/totalSpecial)*100)}%`,background:'#b8cce0'}}></div></div>
                    <div className="a-prog-txt">{userSpecialCount} / {totalSpecial}</div>
                  </div>
                </div>
                <div className="a-arrow" style={{color:'#b8cce0'}}>→</div>
              </Link>
              {!isRG && (
                <Link href={`/pool/${params.id}/group-picks`} className="a-card grn">
                  <div className="a-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2cb67d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18"/><path d="M9 21V9"/>
                      <path d="M7 6h.01"/><path d="M12 6h.01"/><path d="M17 6h.01"/>
                    </svg>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div className="a-card-title">Qualifiers</div>
                    <div className="a-card-sub">Pick 2 per group</div>
                    <div className="a-prog">
                      <div className="a-prog-bar"><div className="a-prog-fill" style={{width:`${Math.round((userQualifiersCount/12)*100)}%`,background:'#2cb67d'}}></div></div>
                      <div className="a-prog-txt">{userQualifiersCount} / 12 groups</div>
                    </div>
                  </div>
                  <div className="a-arrow">→</div>
                </Link>
              )}
            </div>

            {/* Banner */}
            <div className="a-banner">
              <div>
                <div className="a-banner-left">Tournament starts {getTournamentStart(pool?.tournament)}</div>
                <div className="a-banner-sub">Submit all picks before the first match {isRG ? 'starts' : 'kicks off'}</div>
              </div>
              <div className="a-banner-right">{countdown}</div>
            </div>

            {/* Standings */}
            <div className="a-sh">
              <div className="a-sh-title">Standings</div>
              <Link href={`/pool/${params.id}/leaderboard`} className="a-sh-link">Full Table →</Link>
            </div>
            <div className="a-lb">
              {members.slice(0, 5).map((player, i) => (
                <div key={i} className={`a-lb-row ${player.isYou ? 'you' : ''}`}>
                  <div className="a-lb-rank" style={!player.isYou && player.rank > 1 ? {color:'var(--f3)'} : {}}>{player.rank}</div>
                  <div className="a-lb-mv">—</div>
                  <div>
                    <div className="a-lb-name">
                      {player.displayName}
                      {player.isYou && <span className="you-chip">YOU</span>}
                      {player.isYou && <span className="online-dot"></span>}
                    </div>
                    {player.teamName && <div className="a-lb-sub">{player.fullName}</div>}
                  </div>
                  <div className="a-lb-pts">{player.points}</div>
                </div>
              ))}
            </div>

            {/* Invite */}
            <div style={{marginTop:'1.1rem'}}>
              <div className="a-sh">
                <div className="a-sh-title">Invite Friends</div>
              </div>
              <div className="a-invite">
                <div className="a-invite-url">pickpoolr.com/join/{pool?.invite_code || params.id.slice(0,8)}</div>
                <button className="a-copy" onClick={copyInviteLink}>Copy</button>
              </div>
              <div className="share-row">
                <button className="s-btn s-wa" onClick={shareWhatsApp}>WhatsApp</button>
                <button className="s-btn s-x" onClick={shareTwitter}>𝕏</button>
                <button className="s-btn s-fb" onClick={shareFacebook}>Facebook</button>
                <button className="s-btn s-more" onClick={shareMore}>••• More</button>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="a-side">
            {/* Pool Info */}
            <div className="sw">
              <div className="sw-head">Pool Info</div>
              <div className="sw-row"><div className="sw-label">Tournament</div><div className="sw-val vw" style={{fontSize:'0.75rem'}}>{getTournamentName(pool?.tournament)}</div></div>
              <div className="sw-row"><div className="sw-label">Players</div><div className="sw-val vw">{pool?.player_count}</div></div>
              <div className="sw-row"><div className="sw-label">Buy-in</div><div className="sw-val vgr">{pool?.buy_in ? `$${pool.buy_in}` : 'Free'}</div></div>
              <div className="sw-row"><div className="sw-label">Prize pot</div><div className="sw-val vgr">{pool?.buy_in ? `$${pool.buy_in * pool.player_count}` : 'Free'}</div></div>
              <div className="sw-row"><div className="sw-label">Status</div><div className="sw-val vg">Open</div></div>
            </div>

            {/* Your Stats */}
            <div className="sw">
              <div className="sw-head">Your Stats</div>
              <div className="sw-row"><div className="sw-label">Total points</div><div className="sw-val vg">{pool?.user_points || 0}</div></div>
              <div className="sw-row"><div className="sw-label">Current rank</div><div className="sw-val vg">{pool?.user_rank ? `${pool.user_rank}${rankSuffix}` : '-'}</div></div>
              <div className="sw-row"><div className="sw-label">Match picks</div><div className="sw-val vw">{userPicksCount} / {totalMatches}</div></div>
              <div className="sw-row"><div className="sw-label">Special picks</div><div className="sw-val vw">{userSpecialCount} / {totalSpecial}</div></div>
              {!isRG && <div className="sw-row"><div className="sw-label">Qualifiers</div><div className="sw-val" style={{color: userQualifiersCount < 12 ? 'var(--red)' : 'var(--green)'}}>{userQualifiersCount} / 12</div></div>}
            </div>

            {/* Scoring */}
            <div className="sw">
              <div className="sw-head">Scoring</div>
              {isRG ? (
                <>
                  <div className="score-group">
                    <div className="score-group-label">Match Picks</div>
                    <div className="score-row"><div className="score-label">Correct score</div><div className="score-pts">5 pts</div></div>
                    <div className="score-row"><div className="score-label">Correct winner</div><div className="score-pts">1 pt</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Round Bonus</div>
                    <div className="score-row"><div className="score-label">R1 – R4</div><div className="score-pts dim">×1</div></div>
                    <div className="score-row"><div className="score-label">Quarterfinals</div><div className="score-pts dim">×1.5</div></div>
                    <div className="score-row"><div className="score-label">Semifinals</div><div className="score-pts dim">×2</div></div>
                    <div className="score-row"><div className="score-label">Final</div><div className="score-pts dim">×3</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Special Picks</div>
                    <div className="score-row"><div className="score-label">Champion</div><div className="score-pts">10 pts</div></div>
                    <div className="score-row"><div className="score-label">Runner-up</div><div className="score-pts">7 pts</div></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="score-group">
                    <div className="score-group-label">Match Picks</div>
                    <div className="score-row"><div className="score-label">Exact scoreline</div><div className="score-pts">3 pts</div></div>
                    <div className="score-row"><div className="score-label">Winner + 1 score</div><div className="score-pts">2 pts</div></div>
                    <div className="score-row"><div className="score-label">Correct winner/tie</div><div className="score-pts">1 pt</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Knockout Bonus</div>
                    <div className="score-row"><div className="score-label">R32 · R16 · QF · SF · Final</div><div className="score-pts dim">+2→+6</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Special Picks</div>
                    <div className="score-row"><div className="score-label">Champion</div><div className="score-pts">10 pts</div></div>
                    <div className="score-row"><div className="score-label">Runner-up</div><div className="score-pts">7 pts</div></div>
                    <div className="score-row"><div className="score-label">Top scorer · Best GK</div><div className="score-pts">5 pts</div></div>
                  </div>
                  <div className="score-group">
                    <div className="score-group-label">Qualifiers</div>
                    <div className="score-row"><div className="score-label">Correct qualifier</div><div className="score-pts" style={{color:'var(--green)'}}>2 pts</div></div>
                    <div className="score-row"><div className="score-label">Correct 1st place</div><div className="score-pts" style={{color:'var(--green)'}}>+1 pt</div></div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            {currentMember && (
              <div className="settings-card">
                <div className="settings-card-head">Your Settings</div>
                <div className="settings-card-body">
                  <div className="settings-team-row">
                    <div>
                      <div className="settings-team-label">Team name</div>
                      <div className="settings-team-name">{currentMember.displayName}</div>
                    </div>
                    <button className="change-btn" onClick={() => setShowTeamNameModal(true)}>Change</button>
                  </div>
                  {pool?.isCommissioner && (
                    <div className="settings-actions">
                      {parseFloat(pool?.buy_in) > 0 && (
                        <Link href={`/pool/${params.id}/payments`} className="settings-action-btn payments">
                          <div className="settings-action-icon icon-payments">💰</div>
                          <div className="settings-action-text">
                            <div className="settings-action-title">Manage Payments</div>
                            <div className="settings-action-sub">View buy-ins · ${(members.filter(m => m.paid).length * parseFloat(pool?.buy_in || 0)).toFixed(0)} pot</div>
                          </div>
                          <div className="settings-action-arrow">→</div>
                        </Link>
                      )}
                      <Link href={`/pool/${params.id}/manage`} className="settings-action-btn">
                        <div className="settings-action-icon icon-settings">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8780" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                          </svg>
                        </div>
                        <div className="settings-action-text">
                          <div className="settings-action-title">Pool Settings</div>
                          <div className="settings-action-sub">Rules · visibility · prizes</div>
                        </div>
                        <div className="settings-action-arrow">→</div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Name Modal */}
      {showTeamNameModal && (
        <div className="modal-overlay" onClick={() => setShowTeamNameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Change Team Name</div>
              <button className="modal-close" onClick={() => setShowTeamNameModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field-label">Team Name</div>
              <input
                type="text"
                className="field-input"
                value={teamNameInput}
                onChange={e => setTeamNameInput(e.target.value)}
                placeholder="Enter your team name..."
                maxLength={30}
                disabled={(currentMember?.name_changes_count || 0) >= 2}
              />
              <div className="field-hint">
                {(currentMember?.name_changes_count || 0) >= 2 
                  ? '❌ No changes remaining (max 2)' 
                  : `${2 - (currentMember?.name_changes_count || 0)} change${2 - (currentMember?.name_changes_count || 0) === 1 ? '' : 's'} remaining`}
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowTeamNameModal(false)}>Cancel</button>
                <button 
                  className="btn-save" 
                  onClick={handleUpdateTeamName}
                  disabled={savingTeamName || !teamNameInput.trim() || (currentMember?.name_changes_count || 0) >= 2}
                >
                  {savingTeamName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
// Deploy Sat May 23 11:33:04 EDT 2026
