'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../lib/supabase'

export default function JoinPoolPage({ params }) {
  const router = useRouter()
  const { code } = use(params)
  
  const [pool, setPool] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)
  
  // Login form state (for non-logged in users)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Get current user
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // Fetch pool by invite code
      const { data: poolData, error: poolError } = await supabase
        .from('pools')
        .select(`
          *,
          commissioner:profiles!pools_commissioner_id_fkey(id, first_name, last_name),
          tournaments(name, start_date, end_date),
          pool_members(user_id)
        `)
        .eq('invite_code', code)
        .single()
      
      if (poolError || !poolData) {
        setError('Pool not found or invite link has expired')
      } else {
        setPool(poolData)
        
        // Check if user already joined
        if (currentUser && poolData.pool_members?.some(m => m.user_id === currentUser.id)) {
          setJoined(true)
        }
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [code])

  const handleJoin = async () => {
    if (!user) return
    
    setJoining(true)
    setError('')
    
    try {
      const { error } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: user.id,
          role: 'member'
        })
      
      if (error) throw error
      setJoined(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const handleLoginAndJoin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setJoining(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // After login, join the pool
      setUser(data.user)
      
      const { error: joinError } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: data.user.id,
          role: 'member'
        })
      
      if (joinError && !joinError.message.includes('duplicate')) {
        throw joinError
      }
      
      setJoined(true)
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setJoining(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const formatBuyIn = (amount) => {
    if (!amount || amount === 0) return 'Free'
    return `$${amount}`
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-pitch">
          <div className="pitch-3d">
            <div className="pitch-surface"></div>
            <div className="pitch-lines"></div>
            <div className="pitch-circle"></div>
            <div className="pitch-glow"></div>
          </div>
        </div>
        <div className="loading-text">Loading pool...</div>
        <style jsx>{`
          .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            position: relative;
          }
          .auth-pitch {
            position: absolute;
            inset: 0;
            perspective: 700px;
            perspective-origin: 50% 10%;
            pointer-events: none;
            overflow: hidden;
          }
          .pitch-3d {
            position: absolute;
            bottom: -35%;
            left: 50%;
            transform: translateX(-50%) rotateX(64deg);
            width: 900px;
            height: 620px;
            animation: pitchFloat 9s ease-in-out infinite;
          }
          .pitch-surface {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(0deg,rgba(10, 28, 10, 0.6) 0px,rgba(10, 28, 10, 0.6) 38px,rgba(14, 36, 14, 0.6) 38px,rgba(14, 36, 14, 0.6) 76px);
            border: 2px solid rgba(255, 255, 255, 0.06);
          }
          .pitch-lines {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%),linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%);
          }
          .pitch-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200px;
            height: 200px;
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          .pitch-glow {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201, 168, 76, 0.05), transparent 70%);
          }
          @keyframes pitchFloat {
            0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); }
            50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); }
          }
          .loading-text {
            color: var(--f3);
            font-size: 0.9rem;
            z-index: 10;
          }
        `}</style>
      </div>
    )
  }

  if (error && !pool) {
    return (
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
          <div className="auth-card-head">
            <div className="auth-eyebrow">Error</div>
            <div className="auth-title">Pool Not Found</div>
            <div className="auth-sub">{error}</div>
          </div>
          <div className="auth-body">
            <Link href="/browse" className="btn-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Browse Public Pools →
            </Link>
            <Link href="/" className="btn-outline-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              ← Back to Home
            </Link>
          </div>
        </div>
        <style jsx>{`
          .auth-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            background: var(--bg);
          }
          .auth-pitch {
            position: absolute;
            inset: 0;
            perspective: 700px;
            perspective-origin: 50% 10%;
            pointer-events: none;
            overflow: hidden;
          }
          .pitch-3d {
            position: absolute;
            bottom: -35%;
            left: 50%;
            transform: translateX(-50%) rotateX(64deg);
            width: 900px;
            height: 620px;
            animation: pitchFloat 9s ease-in-out infinite;
          }
          .pitch-surface {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(0deg,rgba(10, 28, 10, 0.6) 0px,rgba(10, 28, 10, 0.6) 38px,rgba(14, 36, 14, 0.6) 38px,rgba(14, 36, 14, 0.6) 76px);
            border: 2px solid rgba(255, 255, 255, 0.06);
          }
          .pitch-lines {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%),linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%);
          }
          .pitch-circle {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 200px;
            height: 200px;
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }
          .pitch-glow {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201, 168, 76, 0.05), transparent 70%);
          }
          @keyframes pitchFloat {
            0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); }
            50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); }
          }
          .auth-card {
            background: var(--bg2);
            border: 1px solid var(--line);
            border-radius: 4px;
            width: 100%;
            max-width: 480px;
            overflow: hidden;
            position: relative;
            z-index: 2;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
          }
          .auth-card::before {
            content: '';
            display: block;
            height: 3px;
            background: linear-gradient(90deg, transparent, var(--red), transparent);
          }
          .auth-card-head {
            padding: 1.75rem 1.75rem 0;
          }
          .auth-eyebrow {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--red);
            margin-bottom: 0.35rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .auth-eyebrow::before {
            content: '';
            display: block;
            width: 16px;
            height: 1.5px;
            background: var(--red);
          }
          .auth-title {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 1.8rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            color: var(--white);
            line-height: 1;
          }
          .auth-sub {
            font-size: 0.8rem;
            color: var(--f3);
            margin-top: 0.4rem;
            line-height: 1.5;
          }
          .auth-body {
            padding: 1.5rem 1.75rem;
          }
          .btn-full {
            width: 100%;
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            background: var(--gold);
            color: #000;
            padding: 0.75rem;
            border-radius: 3px;
            border: none;
            cursor: pointer;
            transition: background 0.15s;
          }
          .btn-full:hover {
            background: var(--gold2);
          }
          .btn-outline-full {
            width: 100%;
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            background: transparent;
            color: var(--f2);
            padding: 0.7rem;
            border-radius: 3px;
            border: 1px solid var(--f4);
            cursor: pointer;
            transition: all 0.15s;
            margin-top: 0.6rem;
          }
          .btn-outline-full:hover {
            border-color: var(--f2);
            color: var(--white);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-page">
      {/* Pitch Background Animation */}
      <div className="auth-pitch">
        <div className="pitch-3d">
          <div className="pitch-surface"></div>
          <div className="pitch-lines"></div>
          <div className="pitch-circle"></div>
          <div className="pitch-glow"></div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card-head">
          <div className="auth-eyebrow">You were invited</div>
          <div className="auth-title">Join Pool</div>
          <div className="auth-sub">You've been invited to join a prediction pool</div>
        </div>

        <div className="auth-body">
          {/* Pool Preview Card */}
          <div className="pool-preview-card">
            <div className="ppc-name">{pool.name}</div>
            <div className="ppc-tournament">
              {pool.tournaments?.name || 'World Cup 2026'} — {pool.tournaments?.start_date ? new Date(pool.tournaments.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'} to {pool.tournaments?.end_date ? new Date(pool.tournaments.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
            </div>
            <div className="ppc-stats">
              <div className="ppc-stat">
                <div className="ppc-stat-val">{pool.pool_members?.length || 0}</div>
                <div className="ppc-stat-label">Players</div>
              </div>
              <div className="ppc-stat">
                <div className="ppc-stat-val">{formatBuyIn(pool.buy_in)}</div>
                <div className="ppc-stat-label">Buy-in</div>
              </div>
              <div className="ppc-stat">
                <div className="ppc-stat-val">{pool.is_public ? 'Public' : 'Private'}</div>
                <div className="ppc-stat-label">Visibility</div>
              </div>
            </div>
            <div className="commissioner-row">
              <div className="commissioner-avatar">
                {getInitials(pool.commissioner?.first_name, pool.commissioner?.last_name)}
              </div>
              <div className="commissioner-info">
                Hosted by <span className="commissioner-name">{pool.commissioner?.first_name} {pool.commissioner?.last_name?.[0]}.</span>
              </div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {!joined ? (
            <>
              {user ? (
                /* Signed in state — just confirm join */
                <div>
                  <div className="signed-in-row">
                    <span className="status-dot"></span>
                    Signed in as <strong>{user.user_metadata?.first_name || user.email}</strong>
                  </div>
                  <button className="btn-full green" onClick={handleJoin} disabled={joining}>
                    {joining ? 'Joining...' : 'Join Pool →'}
                  </button>
                  <button 
                    className="btn-outline-full"
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setUser(null)
                    }}
                  >
                    Not you? Sign in with a different account
                  </button>
                </div>
              ) : (
                /* Not signed in state */
                <div>
                  <div className="or-divider" style={{ margin: '0 0 1rem' }}>
                    <div className="or-line"></div>
                    <div className="or-text">Sign in to join</div>
                    <div className="or-line"></div>
                  </div>

                  {loginError && <div className="error-msg">{loginError}</div>}

                  <form onSubmit={handleLoginAndJoin}>
                    <div className="field">
                      <label className="field-label">Email address</label>
                      <input
                        className="field-input"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="field">
                      <label className="field-label">Password</label>
                      <input
                        className="field-input"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-full green" disabled={joining}>
                      {joining ? 'Signing in...' : 'Sign in & Join Pool →'}
                    </button>
                  </form>

                  <div className="or-divider">
                    <div className="or-line"></div>
                    <div className="or-text">new to poolr?</div>
                    <div className="or-line"></div>
                  </div>

                  <Link 
                    href={`/register?redirect=${encodeURIComponent(`/join/${code}`)}`}
                    className="btn-outline-full"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Create account & join
                  </Link>
                </div>
              )}
            </>
          ) : (
            /* Join success */
            <div className="join-success">
              <div className="js-icon">🏆</div>
              <div className="js-title">You're in!</div>
              <div className="js-sub">
                You've joined <strong style={{ color: 'var(--gold)' }}>{pool.name}</strong>. 
                Submit your picks before the tournament starts when special picks lock.
              </div>
              <Link href={`/pool/${pool.id}`} className="btn-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Go to Pool →
              </Link>
              <Link href={`/pool/${pool.id}/picks`} className="btn-outline-full" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Submit picks now
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: var(--bg);
        }

        .auth-pitch {
          position: absolute;
          inset: 0;
          perspective: 700px;
          perspective-origin: 50% 10%;
          pointer-events: none;
          overflow: hidden;
        }

        .pitch-3d {
          position: absolute;
          bottom: -35%;
          left: 50%;
          transform: translateX(-50%) rotateX(64deg);
          width: 900px;
          height: 620px;
          animation: pitchFloat 9s ease-in-out infinite;
        }

        .pitch-surface {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(10, 28, 10, 0.6) 0px,
            rgba(10, 28, 10, 0.6) 38px,
            rgba(14, 36, 14, 0.6) 38px,
            rgba(14, 36, 14, 0.6) 76px
          );
          border: 2px solid rgba(255, 255, 255, 0.06);
        }

        .pitch-lines {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%),
            linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%);
        }

        .pitch-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .pitch-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201, 168, 76, 0.05), transparent 70%);
        }

        @keyframes pitchFloat {
          0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); }
          50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); }
        }

        .auth-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          position: relative;
          z-index: 2;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
        }

        .auth-card::before {
          content: '';
          display: block;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .auth-card-head {
          padding: 1.75rem 1.75rem 0;
        }

        .auth-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .auth-eyebrow::before {
          content: '';
          display: block;
          width: 16px;
          height: 1.5px;
          background: var(--gold);
        }

        .auth-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--white);
          line-height: 1;
        }

        .auth-sub {
          font-size: 0.8rem;
          color: var(--f3);
          margin-top: 0.4rem;
          line-height: 1.5;
        }

        .auth-body {
          padding: 1.5rem 1.75rem 1.75rem;
        }

        .pool-preview-card {
          background: var(--bg3);
          border: 1px solid var(--gold-line);
          border-radius: 4px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .ppc-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.3rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 0.2rem;
        }

        .ppc-tournament {
          font-size: 0.78rem;
          color: var(--f3);
          margin-bottom: 1rem;
        }

        .ppc-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid var(--line);
          border-radius: 3px;
          overflow: hidden;
        }

        .ppc-stat {
          padding: 0.6rem 0.75rem;
          border-right: 1px solid var(--line);
          text-align: center;
        }

        .ppc-stat:last-child {
          border-right: none;
        }

        .ppc-stat-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--gold);
        }

        .ppc-stat-label {
          font-size: 0.6rem;
          color: var(--f4);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 600;
          margin-top: 2px;
        }

        .commissioner-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 0.85rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--line);
        }

        .commissioner-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 900;
          color: #000;
          flex-shrink: 0;
        }

        .commissioner-info {
          font-size: 0.75rem;
          color: var(--f3);
        }

        .commissioner-name {
          color: var(--f1);
          font-weight: 500;
        }

        .signed-in-row {
          font-size: 0.78rem;
          color: var(--f3);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .signed-in-row strong {
          color: var(--f1);
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          display: inline-block;
        }

        .field {
          margin-bottom: 1rem;
        }

        .field-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--f2);
          margin-bottom: 0.4rem;
          display: block;
        }

        .field-input {
          width: 100%;
          padding: 0.65rem 0.85rem;
          background: var(--bg3);
          border: 1px solid var(--f4);
          border-radius: 3px;
          color: var(--f1);
          font-size: 0.88rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }

        .field-input:focus {
          border-color: var(--gold);
        }

        .field-input::placeholder {
          color: var(--f4);
        }

        .btn-full {
          width: 100%;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.75rem;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-full:hover {
          background: var(--gold2);
        }

        .btn-full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-full.green {
          background: var(--green);
        }

        .btn-full.green:hover {
          opacity: 0.9;
        }

        .btn-outline-full {
          width: 100%;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          color: var(--f2);
          padding: 0.7rem;
          border-radius: 3px;
          border: 1px solid var(--f4);
          cursor: pointer;
          transition: all 0.15s;
          margin-top: 0.6rem;
        }

        .btn-outline-full:hover {
          border-color: var(--f2);
          color: var(--white);
        }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 1.25rem 0;
        }

        .or-line {
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .or-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f4);
        }

        .join-success {
          text-align: center;
          padding: 0.5rem 0;
        }

        .js-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .js-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 0.4rem;
        }

        .js-sub {
          font-size: 0.8rem;
          color: var(--f3);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .error-msg {
          background: rgba(224, 59, 59, 0.1);
          border: 1px solid var(--red);
          color: var(--red);
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 640px) {
          .auth-card {
            border-radius: 0;
            border-left: none;
            border-right: none;
            max-width: 100%;
          }

          .auth-page {
            padding: 0;
            align-items: flex-start;
          }

          .auth-card-head {
            padding: 1.5rem 1.25rem 0;
          }

          .auth-body {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}
