'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function JoinPoolPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Mock pool data
  const mockPool = {
    id: 1,
    name: 'Amigos WC26 Pool',
    tournament_name: 'FIFA World Cup 2026',
    dates: 'Jun 11 to Jul 19',
    player_count: 14,
    buyin: 'Free',
    visibility: 'Private',
    commissioner: { initials: 'JD', name: 'Juan D.' }
  }

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // In real app, load pool by invite code
      setPool(mockPool)
      setLoading(false)
    }
    loadData()
  }, [params.code])

  const handleJoin = async () => {
    if (!user) return
    setJoining(true)
    
    try {
      // In real app: add user to pool
      await new Promise(r => setTimeout(r, 500))
      setSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>Loading...</div>
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

      <div className="auth-page">
        <div className="auth-pitch">
          <div className="pitch-3d">
            <div className="pitch-surface"></div>
            <div className="pitch-lines"></div>
            <div className="pitch-circle"></div>
            <div className="pitch-glow"></div>
          </div>
        </div>

        <div className="auth-card">
          {!success ? (
            <>
              <div className="auth-card-head">
                <div className="auth-eyebrow">You were invited</div>
                <div className="auth-title">Join Pool</div>
                <div className="auth-sub">You&apos;ve been invited to join a prediction pool</div>
              </div>

              <div className="auth-body">
                {/* Pool preview */}
                <div className="pool-preview-card">
                  <div className="ppc-name">{pool?.name}</div>
                  <div className="ppc-tournament">{pool?.tournament_name} — {pool?.dates}</div>
                  <div className="ppc-stats">
                    <div className="ppc-stat"><div className="ppc-stat-val">{pool?.player_count}</div><div className="ppc-stat-label">Players</div></div>
                    <div className="ppc-stat"><div className="ppc-stat-val">{pool?.buyin}</div><div className="ppc-stat-label">Buy-in</div></div>
                    <div className="ppc-stat"><div className="ppc-stat-val">{pool?.visibility}</div><div className="ppc-stat-label">Visibility</div></div>
                  </div>
                  <div className="commissioner-row">
                    <div className="commissioner-avatar">{pool?.commissioner.initials}</div>
                    <div className="commissioner-info">Hosted by <span className="commissioner-name">{pool?.commissioner.name}</span></div>
                  </div>
                </div>

                {user ? (
                  <div>
                    <div className="signed-in-msg">
                      <span className="signed-in-dot"></span>
                      Signed in as <strong>{user.email}</strong>
                    </div>
                    <button className="btn-full green" onClick={handleJoin} disabled={joining}>
                      {joining ? 'Joining...' : 'Join Pool →'}
                    </button>
                    <button className="btn-outline-full" style={{ marginTop: '0.6rem' }}>Not you? Sign in with a different account</button>
                  </div>
                ) : (
                  <div>
                    <div className="or-divider"><div className="or-line"></div><div className="or-text">Sign in to join</div><div className="or-line"></div></div>
                    <div className="field">
                      <label className="field-label">Email address</label>
                      <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Password</label>
                      <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button className="btn-full green">Sign in & Join Pool →</button>
                    <div className="or-divider"><div className="or-line"></div><div className="or-text">new to poolr?</div><div className="or-line"></div></div>
                    <Link href="/register" className="btn-outline-full">Create account & join</Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-body">
              <div className="join-success">
                <div className="js-icon">🏆</div>
                <div className="js-title">You&apos;re in!</div>
                <div className="js-sub">You&apos;ve joined <strong style={{ color: 'var(--gold)' }}>{pool?.name}</strong>. Submit your picks before Jun 11 when special picks lock.</div>
                <Link href={`/pool/${pool?.id}`} className="btn-full">Go to Pool →</Link>
                <Link href={`/pool/${pool?.id}/predictions`} className="btn-outline-full">Submit picks now</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-right { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }
        .nav-link { font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: var(--f1); }
        .nav-cta { font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.45rem 1.1rem; border-radius: 2px; text-decoration: none; }

        .auth-page { min-height: calc(100vh - 56px); display: flex; align-items: center; justify-content: center; padding: 2rem; position: relative; overflow: hidden; }
        .auth-pitch { position: absolute; inset: 0; perspective: 700px; perspective-origin: 50% 10%; pointer-events: none; overflow: hidden; }
        .pitch-3d { position: absolute; bottom: -35%; left: 50%; transform: translateX(-50%) rotateX(64deg); width: 900px; height: 620px; animation: pitchFloat 9s ease-in-out infinite; }
        .pitch-surface { position: absolute; inset: 0; background: repeating-linear-gradient(0deg, rgba(10,28,10,0.6) 0px, rgba(10,28,10,0.6) 38px, rgba(14,36,14,0.6) 38px, rgba(14,36,14,0.6) 76px); border: 2px solid rgba(255,255,255,0.06); }
        .pitch-lines { position: absolute; inset: 0; background: linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%), linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%); }
        .pitch-circle { position: absolute; top: 50%; left: 50%; width: 200px; height: 200px; border: 1.5px solid rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-50%, -50%); }
        .pitch-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201,168,76,0.05), transparent 70%); }

        .auth-card { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; width: 100%; max-width: 480px; overflow: hidden; position: relative; z-index: 2; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
        .auth-card::before { content: ''; display: block; height: 3px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .auth-card-head { padding: 1.75rem 1.75rem 0; }
        .auth-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem; }
        .auth-eyebrow::before { content: ''; display: block; width: 16px; height: 1.5px; background: var(--gold); }
        .auth-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; color: var(--white); line-height: 1; }
        .auth-sub { font-size: 0.8rem; color: var(--f3); margin-top: 0.4rem; line-height: 1.5; }
        .auth-body { padding: 1.5rem 1.75rem; }

        .pool-preview-card { background: var(--bg3); border: 1px solid var(--gold-line); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.25rem; }
        .ppc-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; text-transform: uppercase; color: var(--white); margin-bottom: 0.2rem; }
        .ppc-tournament { font-size: 0.78rem; color: var(--f3); margin-bottom: 1rem; }
        .ppc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid var(--line); border-radius: 3px; overflow: hidden; }
        .ppc-stat { padding: 0.6rem 0.75rem; border-right: 1px solid var(--line); text-align: center; }
        .ppc-stat:last-child { border-right: none; }
        .ppc-stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 900; color: var(--gold); }
        .ppc-stat-label { font-size: 0.6rem; color: var(--f4); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; margin-top: 2px; }
        .commissioner-row { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--line); }
        .commissioner-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 900; color: #000; flex-shrink: 0; }
        .commissioner-info { font-size: 0.75rem; color: var(--f3); }
        .commissioner-name { color: var(--f1); font-weight: 500; }

        .signed-in-msg { font-size: 0.78rem; color: var(--f3); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .signed-in-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; }

        .field { margin-bottom: 1rem; }
        .field-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--f2); margin-bottom: 0.4rem; display: block; }
        .field-input { width: 100%; padding: 0.65rem 0.85rem; background: var(--bg3); border: 1px solid var(--f4); border-radius: 3px; color: var(--f1); font-size: 0.88rem; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: var(--gold); }
        .field-input::placeholder { color: var(--f4); }

        .btn-full { display: block; width: 100%; font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.75rem; border-radius: 3px; border: none; cursor: pointer; transition: background 0.15s; text-align: center; text-decoration: none; }
        .btn-full:hover:not(:disabled) { background: var(--gold2); }
        .btn-full:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-full.green { background: var(--green); }
        .btn-full.green:hover:not(:disabled) { opacity: 0.9; }
        .btn-outline-full { display: block; width: 100%; text-align: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; color: var(--f2); padding: 0.7rem; border-radius: 3px; border: 1px solid var(--f4); cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .btn-outline-full:hover { border-color: var(--f2); color: var(--white); }

        .or-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; }
        .or-line { flex: 1; height: 1px; background: var(--line); }
        .or-text { font-family: 'Barlow Condensed', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--f4); }

        .join-success { text-align: center; padding: 0.5rem 0; }
        .js-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .js-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 900; text-transform: uppercase; color: var(--white); margin-bottom: 0.4rem; }
        .js-sub { font-size: 0.8rem; color: var(--f3); line-height: 1.6; margin-bottom: 1.25rem; }

        @keyframes pitchFloat { 0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); } 50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); } }

        @media (max-width: 640px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; }
          .nav-link { display: none; }
          .auth-card { border-radius: 0; border-left: none; border-right: none; max-width: 100%; }
          .auth-page { padding: 0; align-items: flex-start; }
          .auth-card-head { padding: 1.5rem 1.25rem 0; }
          .auth-body { padding: 1.25rem; }
        }
      `}</style>
    </>
  )
}
