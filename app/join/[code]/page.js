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
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const [error, setError] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [teamName, setTeamName] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [poolPassword, setPoolPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPaymentStep, setShowPaymentStep] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        // Fetch pool by invite code with commissioner info
        const { data: poolData, error: poolError } = await supabase
          .from('pools')
          .select(`
            *,
            profiles:commissioner_id (
              id,
              name
            )
          `)
          .eq('invite_code', params.code)
          .single()

        if (poolError || !poolData) {
          setError('Pool not found or invite link is invalid')
          setLoading(false)
          return
        }

        // Check if user is already a member
        if (currentUser) {
          const { data: existingMember } = await supabase
            .from('pool_members')
            .select('id')
            .eq('pool_id', poolData.id)
            .eq('user_id', currentUser.id)
            .single()
          
          if (existingMember) {
            setAlreadyMember(true)
          }
        }

        // Get member count
        const { count } = await supabase
          .from('pool_members')
          .select('*', { count: 'exact', head: true })
          .eq('pool_id', poolData.id)

        // Format commissioner name and initials
        const commName = poolData.profiles?.name || 'Unknown'
        const initials = commName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

        setPool({
          ...poolData,
          player_count: count || 0,
          commissioner: {
            name: commName,
            initials: initials
          }
        })
      } catch (err) {
        console.error('Error loading pool:', err)
        setError('Failed to load pool')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [params.code])

  // Check if pool is paid
  const isPaidPool = pool && parseFloat(pool.buy_in) > 0

  const handleJoinClick = async () => {
    if (!user || !pool) return
    
    // Check if already a member
    const { data: existing } = await supabase
      .from('pool_members')
      .select('id')
      .eq('pool_id', pool.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Already a member, just redirect
      router.push(`/pool/${pool.id}`)
      return
    }

    if (isPaidPool) {
      // Redirect to payment page
      router.push(`/pool/${pool.id}/pay?join=true`)
    } else {
      // Show confirmation for free pools
      setShowConfirm(true)
    }
  }

  const handleConfirmJoin = async () => {
    if (!user || !pool) return
    if (!teamName.trim()) {
      setError('Please enter a team name')
      return
    }
    
    // Direct link = trusted, no password check needed
    setJoining(true)
    setError(null)
    
    try {
      // Add user to pool with team name and payment method
      const { error: joinError } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: user.id,
          team_name: teamName.trim(),
          payment_status: paymentMethod ? 'pending' : 'paid', // Pending approval if they selected payment method
          payment_method: paymentMethod || null
        })

      if (joinError) throw joinError
      
      setSuccess(true)
      setShowConfirm(false)
    } catch (err) {
      console.error('Error joining pool:', err)
      setError(err.message || 'Failed to join pool')
    } finally {
      setJoining(false)
    }
  }

  const handleSignInAndJoin = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      setUser(data.user)
      
      // Check if already a member after login
      const { data: existingMember } = await supabase
        .from('pool_members')
        .select('id')
        .eq('pool_id', pool.id)
        .eq('user_id', data.user.id)
        .single()
      
      if (existingMember) {
        setAlreadyMember(true)
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setAuthLoading(false)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--f3)' }}>Loading...</div>
  }

  if (error && !pool) {
    return (
      <>
        <nav>
          <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', color: 'var(--f3)', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <div style={{ fontSize: '1.2rem', color: 'var(--f1)', marginBottom: '0.5rem' }}>Pool Not Found</div>
          <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>{error}</div>
          <Link href="/" style={{ color: 'var(--gold)' }}>← Back to home</Link>
        </div>
        <style jsx global>{`
          nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; }
          .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; text-decoration: none; }
          .nav-logo span { color: var(--gold); }
        `}</style>
      </>
    )
  }

  // Format buy-in display
  const buyinDisplay = isPaidPool ? `$${pool.buy_in}` : 'Free'
  const visibilityDisplay = pool?.visibility === 'private' ? 'Private' : 'Public'
  const tournamentDates = 'Jun 11 – Jul 19'

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
          {/* CONFIRMATION MODAL WITH PAYMENT INFO */}
          {showConfirm && (
            <div className="confirm-overlay">
              <div className="confirm-modal" style={{maxWidth: showPaymentStep ? '420px' : '340px'}}>
                {showPaymentStep ? (
                  <>
                    <div className="confirm-icon">💳</div>
                    <div className="confirm-title">Payment Required</div>
                    <div className="confirm-text">
                      Para unirte a <strong style={{color:'var(--gold)'}}>{pool?.name}</strong>, primero debes pagar.
                    </div>
                    
                    {/* Payment Options */}
                    <div className="payment-options">
                      <div className="payment-option" onClick={() => setPaymentMethod('zelle')}>
                        <div className={`po-radio ${paymentMethod === 'zelle' ? 'selected' : ''}`}></div>
                        <div className="po-icon">💜</div>
                        <div className="po-info">
                          <div className="po-name">Zelle</div>
                          <div className="po-detail">christiancarden3@gmail.com</div>
                        </div>
                      </div>
                      <div className="payment-option" onClick={() => setPaymentMethod('paypal')}>
                        <div className={`po-radio ${paymentMethod === 'paypal' ? 'selected' : ''}`}></div>
                        <div className="po-icon">🅿️</div>
                        <div className="po-info">
                          <div className="po-name">PayPal</div>
                          <div className="po-detail">@ChristianCarden</div>
                        </div>
                      </div>
                      <div className="payment-option" onClick={() => setPaymentMethod('venmo')}>
                        <div className={`po-radio ${paymentMethod === 'venmo' ? 'selected' : ''}`}></div>
                        <div className="po-icon">💙</div>
                        <div className="po-info">
                          <div className="po-name">Venmo</div>
                          <div className="po-detail">@Christian-Carden-1</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Instructions */}
                    <div className="payment-instructions">
                      <div className="pi-title">📝 Instrucciones:</div>
                      <div className="pi-text">Pongan su nombre completo y &quot;Quiniela&quot; cuando paguen, y por donde pagaron para confirmar y aceptarlos a la liga.</div>
                    </div>
                    
                    <button 
                      className="btn-full green" 
                      onClick={() => setShowPaymentStep(false)}
                      disabled={!paymentMethod}
                    >
                      Ya pagué por {paymentMethod ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1) : '...'} →
                    </button>
                    <button className="btn-outline-full" style={{ marginTop: '0.6rem' }} onClick={() => setShowConfirm(false)}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <div className="confirm-icon">🏆</div>
                    <div className="confirm-title">Último Paso</div>
                    <div className="confirm-text">
                      Elige tu nombre de equipo para <strong>{pool?.name}</strong>
                    </div>
                    <div className="team-name-field">
                      <label className="field-label">Nombre del Equipo *</label>
                      <input 
                        className="field-input" 
                        type="text" 
                        placeholder="ej: Los Galácticos, Dream Team..." 
                        value={teamName} 
                        onChange={(e) => setTeamName(e.target.value)}
                        maxLength={30}
                      />
                      <div className="field-hint">Así aparecerás en la tabla de posiciones</div>
                    </div>
                    <div className="confirm-details">
                      <div>Torneo: {pool?.tournament === 'rg2026' ? 'Roland Garros 2026' : 'FIFA World Cup 2026'}</div>
                      <div>Buy-in: {buyinDisplay}</div>
                      <div>Pagaste por: <strong style={{color:'var(--gold)'}}>{paymentMethod?.charAt(0).toUpperCase() + paymentMethod?.slice(1)}</strong></div>
                    </div>
                    <button className="btn-full green" onClick={handleConfirmJoin} disabled={joining || !teamName.trim()}>
                      {joining ? 'Solicitando...' : 'Solicitar Unirme →'}
                    </button>
                    <button className="btn-outline-full" style={{ marginTop: '0.6rem' }} onClick={() => setShowPaymentStep(true)}>
                      ← Volver
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {!success ? (
            <>
              <div className="auth-card-head">
                <div className="auth-eyebrow">You were invited</div>
                <div className="auth-title">Join Pool</div>
                <div className="auth-sub">You&apos;ve been invited to join a prediction pool</div>
              </div>

              <div className="auth-body">
                {error && <div className="error-msg">{error}</div>}
                
                {/* Pool preview */}
                <div className="pool-preview-card">
                  <div className="ppc-name">{pool?.name}</div>
                  <div className="ppc-tournament">{pool?.tournament || 'FIFA World Cup 2026'} · {tournamentDates}</div>
                  <div className="ppc-stats">
                    <div className="ppc-stat"><div className="ppc-stat-val">{pool?.player_count}</div><div className="ppc-stat-label">Players</div></div>
                    <div className="ppc-stat"><div className={`ppc-stat-val ${isPaidPool ? 'paid' : ''}`}>{buyinDisplay}</div><div className="ppc-stat-label">Buy-in</div></div>
                    <div className="ppc-stat"><div className="ppc-stat-val">{visibilityDisplay}</div><div className="ppc-stat-label">Visibility</div></div>
                  </div>
                  <div className="commissioner-row">
                    <div className="commissioner-avatar">{pool?.commissioner?.initials}</div>
                    <div className="commissioner-info">Hosted by <span className="commissioner-name">{pool?.commissioner?.name}</span></div>
                  </div>
                  
                  {isPaidPool && (
                    <div className="payment-notice">
                      <span className="payment-icon">💳</span>
                      <span>Payment of <strong>${pool.buy_in}</strong> required to join</span>
                    </div>
                  )}
                </div>

                {user ? (
                  <div>
                    <div className="signed-in-msg">
                      <span className="signed-in-dot"></span>
                      Signed in as <strong>{user.email}</strong>
                    </div>
                    
                    {alreadyMember ? (
                      <div>
                        <div className="already-member-msg">✓ You&apos;re already a member of this pool</div>
                        <Link href={`/pool/${pool?.id}`} className="btn-full">
                          Go to Pool →
                        </Link>
                      </div>
                    ) : (
                      <button className="btn-full green" onClick={handleJoinClick} disabled={joining}>
                        {isPaidPool ? `Pay $${pool.buy_in} & Join →` : 'Join Pool →'}
                      </button>
                    )}
                    
                    <button className="btn-outline-full" style={{ marginTop: '0.6rem' }} onClick={() => { supabase.auth.signOut(); setUser(null); setAlreadyMember(false); }}>
                      Not you? Sign in with a different account
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignInAndJoin}>
                    <div className="or-divider"><div className="or-line"></div><div className="or-text">Sign in to join</div><div className="or-line"></div></div>
                    <div className="field">
                      <label className="field-label">Email address</label>
                      <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="field">
                      <label className="field-label">Password</label>
                      <input className="field-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-full green" disabled={authLoading}>
                      {authLoading ? 'Signing in...' : isPaidPool ? 'Sign in to Pay & Join →' : 'Sign in & Join Pool →'}
                    </button>
                    <div className="or-divider"><div className="or-line"></div><div className="or-text">new to poolr?</div><div className="or-line"></div></div>
                    <Link href={`/register?redirect=/join/${params.code}`} className="btn-outline-full">Create account & join</Link>
                  </form>
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
                <Link href={`/pool/${pool?.id}/predictions`} className="btn-outline-full" style={{ marginTop: '0.6rem' }}>Submit picks now</Link>
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

        .error-msg { background: rgba(220, 53, 69, 0.15); border: 1px solid rgba(220, 53, 69, 0.3); color: #ff6b7a; padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.8rem; margin-bottom: 1rem; }

        .pool-preview-card { background: var(--bg3); border: 1px solid var(--gold-line); border-radius: 4px; padding: 1.25rem; margin-bottom: 1.25rem; }
        .ppc-name { font-family: 'Barlow Condensed', sans-serif; font-size: 1.3rem; font-weight: 900; text-transform: uppercase; color: var(--white); margin-bottom: 0.2rem; }
        .ppc-tournament { font-size: 0.78rem; color: var(--f3); margin-bottom: 1rem; }
        .ppc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid var(--line); border-radius: 3px; overflow: hidden; }
        .ppc-stat { padding: 0.6rem 0.75rem; border-right: 1px solid var(--line); text-align: center; }
        .ppc-stat:last-child { border-right: none; }
        .ppc-stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem; font-weight: 900; color: var(--gold); }
        .ppc-stat-val.paid { color: var(--green); }
        .ppc-stat-label { font-size: 0.6rem; color: var(--f4); text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; margin-top: 2px; }
        .commissioner-row { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px solid var(--line); }
        .commissioner-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 900; color: #000; flex-shrink: 0; }
        .commissioner-info { font-size: 0.75rem; color: var(--f3); }
        .commissioner-name { color: var(--f1); font-weight: 600; }

        .payment-notice { display: flex; align-items: center; gap: 0.5rem; background: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.3); border-radius: 4px; padding: 0.6rem 0.85rem; margin-top: 0.85rem; font-size: 0.78rem; color: var(--green); }
        .payment-icon { font-size: 1rem; }

        .signed-in-msg { font-size: 0.78rem; color: var(--f3); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .signed-in-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; }

        .already-member-msg { background: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.3); color: var(--green); padding: 0.75rem 1rem; border-radius: 4px; font-size: 0.85rem; margin-bottom: 1rem; text-align: center; font-weight: 600; }

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

        /* Confirmation Modal */
        .confirm-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1.5rem; }
        .confirm-modal { background: var(--bg2); border: 1px solid var(--gold-line); border-radius: 6px; padding: 1.75rem; max-width: 340px; width: 100%; text-align: center; }
        .confirm-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
        .confirm-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 900; text-transform: uppercase; color: var(--white); margin-bottom: 0.5rem; }
        .confirm-text { font-size: 0.85rem; color: var(--f3); margin-bottom: 1rem; line-height: 1.5; }
        .confirm-details { background: var(--bg3); border-radius: 4px; padding: 0.75rem; margin-bottom: 1.25rem; font-size: 0.75rem; color: var(--f3); text-align: left; }
        .confirm-details div { padding: 0.25rem 0; border-bottom: 1px solid var(--line); }
        .confirm-details div:last-child { border-bottom: none; }
        .team-name-field { margin-bottom: 1rem; text-align: left; }
        .team-name-field .field-input { width: 100%; padding: 0.75rem 1rem; background: var(--bg); border: 2px solid var(--gold-line); border-radius: 4px; color: var(--f1); font-size: 1rem; font-family: 'Inter', sans-serif; font-weight: 600; transition: border-color 0.2s; }
        .team-name-field .field-input:focus { outline: none; border-color: var(--gold); }
        .team-name-field .field-input::placeholder { color: var(--f4); font-weight: 400; }
        .team-name-field .field-label { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.5rem; }
        .team-name-field .field-hint { font-size: 0.7rem; color: var(--f4); margin-top: 0.4rem; }
        .team-name-field .field-error { font-size: 0.72rem; color: var(--red); margin-top: 0.4rem; }
        .field-input.error { border-color: var(--red); }

        /* Payment Options */
        .payment-options { margin-bottom: 1rem; }
        .payment-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; background: var(--bg3); border: 2px solid var(--line); border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.15s; }
        .payment-option:hover { border-color: var(--gold-line); background: rgba(201,168,76,0.05); }
        .po-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--f4); flex-shrink: 0; transition: all 0.15s; }
        .po-radio.selected { border-color: var(--gold); background: var(--gold); box-shadow: inset 0 0 0 3px var(--bg3); }
        .po-icon { font-size: 1.3rem; }
        .po-info { flex: 1; text-align: left; }
        .po-name { font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 800; text-transform: uppercase; color: var(--f1); }
        .po-detail { font-size: 0.75rem; color: var(--gold); margin-top: 1px; }

        /* Payment Instructions */
        .payment-instructions { background: rgba(201,168,76,0.08); border: 1px solid var(--gold-line); border-radius: 6px; padding: 1rem; margin-bottom: 1.25rem; text-align: left; }
        .pi-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; color: var(--gold); margin-bottom: 0.4rem; }
        .pi-text { font-size: 0.8rem; color: var(--f2); line-height: 1.5; }

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
