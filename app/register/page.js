'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [teamName, setTeamName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [language, setLanguage] = useState('English')
  const [terms, setTerms] = useState(false)
  const [showMagic, setShowMagic] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password validation
  const hasCapital = /[A-Z]/.test(password)
  const hasMinLength = password.length >= 8

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!email || !password || !hasMinLength || !firstName || !username) {
      setError('Please fill all required fields. Password must be at least 8 characters.')
      return
    }
    if (!hasCapital) {
      setError('Password must contain at least one capital letter.')
      return
    }
    if (!terms) {
      setError('You must agree to the Terms of Service.')
      return
    }
    
    // Check if username is taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .single()
    
    if (existingUser) {
      setError('Username is already taken. Please choose another.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username.toLowerCase(),
            team_name: teamName,
            preferred_language: language
          }
        }
      })
      
      if (authError) throw authError
      
      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          name: `${firstName} ${lastName}`.trim(),
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          team_name: teamName || null,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }
      
      // Check if email confirmation is required
      if (!authData.session) {
        setShowConfirmation(true)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      setShowMagic(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/login" className="nav-signin">Sign In</Link>
          <Link href="/browse" className="nav-browse">Browse Pools</Link>
        </div>
      </nav>

      <div className="page">
        {/* LEFT - Marketing */}
        <div className="left">
          <div className="pitch-overlay"></div>
          <div className="pitch-lines">
            <svg viewBox="0 0 400 560" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="20" y="20" width="360" height="520" rx="2"/>
              <line x1="20" y1="280" x2="380" y2="280"/>
              <circle cx="200" cy="280" r="55"/>
              <circle cx="200" cy="280" r="3" fill="white"/>
              <rect x="90" y="20" width="220" height="90"/>
              <rect x="140" y="20" width="120" height="40"/>
              <circle cx="200" cy="82" r="2.5" fill="white"/>
              <rect x="90" y="450" width="220" height="90"/>
              <rect x="140" y="500" width="120" height="40"/>
              <circle cx="200" cy="478" r="2.5" fill="white"/>
            </svg>
          </div>
          <div className="pitch-glow"></div>
          <div className="left-content">
            <div className="left-eyebrow">World Cup 2026</div>
            <div className="left-title">Predict<em>Win</em>Dominate</div>
            <div className="left-sub">Create private prediction pools with friends. Score every match, track the leaderboard, split the pot.</div>
            <div className="features">
              <div className="feat"><div className="feat-dot"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="feat-text"><strong>Free to play</strong> — create unlimited pools, no subscription</div></div>
              <div className="feat"><div className="feat-dot"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="feat-text"><strong>48 teams, 104 matches</strong> — full World Cup 2026 coverage</div></div>
              <div className="feat"><div className="feat-dot"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="feat-text"><strong>Live leaderboards</strong> — real-time standings after every match</div></div>
              <div className="feat"><div className="feat-dot"><svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div><div className="feat-text"><strong>EN / ES</strong> — full English and Spanish support</div></div>
            </div>
          </div>
        </div>

        {/* RIGHT - Form */}
        <div className="right">
          <div className="form-wrap">
            <div className="form-bar"></div>
            
            {showConfirmation ? (
              <div className="confirmation">
                <div className="confirm-icon">✉</div>
                <div className="form-title">Check<br/>Email</div>
                <div className="form-sub">We sent a confirmation link to <span className="email-highlight">{email}</span>. Click it to activate your account, then sign in.</div>
                <Link href="/login" className="btn-primary">
                  Go to Sign In
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            ) : showMagic ? (
              <div className="confirmation">
                <div className="confirm-icon">✉</div>
                <div className="form-title">Check<br/>Inbox</div>
                <div className="form-sub">We sent a magic link to <span className="email-highlight">{email}</span>. Click it to sign in.</div>
                <button onClick={() => setShowMagic(false)} className="btn-magic">← Use password instead</button>
              </div>
            ) : (
              <>
                <div className="form-eyebrow">Join Free</div>
                <div className="form-title">Create<br/>Account</div>
                <div className="form-sub">Set up in seconds. No credit card required.</div>

                <form onSubmit={handleRegister}>
                  <div className="field">
                    <div className="field-row">
                      <div>
                        <label className="field-label">First name</label>
                        <input className="field-input" type="text" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div>
                        <label className="field-label">Last name</label>
                        <input className="field-input" type="text" placeholder="García" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Username</label>
                    <input className="field-input" type="text" placeholder="juangarcia" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())} maxLength={20} />
                    <div className="field-hint">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#8a8780" strokeWidth="1.2"/><line x1="6" y1="5.5" x2="6" y2="8.5" stroke="#8a8780" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="3.8" r="0.6" fill="#8a8780"/></svg>
                      Used for sign in · No spaces · Lowercase only
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Team name <span className="field-opt">(optional)</span></label>
                    <input className="field-input" type="text" placeholder="The Golden Boots" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                    <div className="field-hint">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#8a8780" strokeWidth="1.2"/><line x1="6" y1="5.5" x2="6" y2="8.5" stroke="#8a8780" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="3.8" r="0.6" fill="#8a8780"/></svg>
                      Your display name on leaderboards
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Email address</label>
                    <input className="field-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="field-label">Password</label>
                    <input className="field-input" type="password" placeholder="At least 8 characters with 1 capital" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div className="pw-rules">
                      <div className={`pw-rule ${hasMinLength ? 'met' : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        8+ characters
                      </div>
                      <div className={`pw-rule ${hasCapital ? 'met' : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L5 9.5L10.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        1 capital letter
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Preferred language</label>
                    <select className="field-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>

                  <div className="check-row">
                    <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
                    <label className="terms-text" htmlFor="terms">
                      I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link>. I confirm I am 18 years or older.
                    </label>
                  </div>

                  {error && <div className="error-msg">{error}</div>}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                    {!loading && <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </button>
                </form>

                <div className="or-div"><div className="or-line"></div><div className="or-text">or</div><div className="or-line"></div></div>

                <button type="button" onClick={handleMagicLink} className="btn-magic" disabled={loading}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Sign up with magic link
                </button>

                <div className="form-footer">Already have an account? <Link href="/login">Sign in →</Link></div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;
          --gold:#c9a84c;--gold2:#e6c76a;--green:#2cb67d;
          --f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;
          --line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3);
        }
        body{background:#0a0c10;font-family:'Inter',sans-serif;color:var(--f1);margin:0;padding:0}

        .nav{background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:52px;z-index:10;position:relative}
        .nav-logo{font-family:'Barlow Condensed',sans-serif;font-size:1.7rem;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:#fff;text-decoration:none}
        .nav-logo span{color:var(--gold)}
        .nav-right{margin-left:auto;display:flex;align-items:center;gap:1rem}
        .nav-signin{font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f2);cursor:pointer;text-decoration:none}
        .nav-browse{font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:transparent;color:var(--f1);border:1px solid var(--f4);padding:0.4rem 1rem;border-radius:2px;cursor:pointer;text-decoration:none}

        .page{display:grid;grid-template-columns:1fr 1fr;min-height:calc(100vh - 52px)}

        /* LEFT */
        .left{position:relative;overflow:hidden;background:linear-gradient(160deg,#0a1a0a 0%,#060e06 60%,#0a0c10 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2.5rem}
        .pitch-overlay{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,0.018) 0px,rgba(255,255,255,0.018) 1px,transparent 1px,transparent 52px),radial-gradient(ellipse 90% 60% at 50% 50%,rgba(44,100,44,0.25) 0%,transparent 70%);pointer-events:none}
        .pitch-lines{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0.11}
        .pitch-lines svg{width:85%;height:85%}
        .pitch-glow{position:absolute;bottom:-20%;left:50%;transform:translateX(-50%);width:70%;height:50%;background:radial-gradient(ellipse,rgba(201,168,76,0.07) 0%,transparent 70%);pointer-events:none}
        .left-content{position:relative;z-index:2;text-align:center;max-width:300px}
        .left-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:1.1rem}
        .left-eyebrow::before,.left-eyebrow::after{content:'';width:18px;height:2px;background:var(--gold)}
        .left-title{font-family:'Bebas Neue',sans-serif;font-size:3.8rem;letter-spacing:0.04em;color:#fff;line-height:0.88;margin-bottom:0.85rem}
        .left-title em{color:var(--gold);font-style:normal;display:block}
        .left-sub{font-size:0.8rem;font-weight:300;color:var(--f3);line-height:1.7;margin-bottom:1.5rem;max-width:260px;margin-left:auto;margin-right:auto}
        .features{display:flex;flex-direction:column;gap:0.55rem;text-align:left}
        .feat{display:flex;align-items:flex-start;gap:0.65rem}
        .feat-dot{width:18px;height:18px;border-radius:50%;background:rgba(201,168,76,0.1);border:1px solid var(--gold-line);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        .feat-dot svg{display:block}
        .feat-text{font-size:0.78rem;color:var(--f2);line-height:1.5}
        .feat-text strong{color:var(--f1);font-weight:600}

        /* RIGHT */
        .right{background:#0a0c10;border-left:1px solid rgba(255,255,255,0.06);padding:2.25rem 1.75rem;display:flex;align-items:center;justify-content:center;overflow-y:auto}
        .form-wrap{width:100%;max-width:390px}

        .form-bar{height:4px;background:var(--gold);margin-bottom:1.5rem;border-radius:0}
        .form-eyebrow{font-family:'Bebas Neue',sans-serif;font-size:0.85rem;letter-spacing:0.35em;color:var(--gold);margin-bottom:0.15rem}
        .form-title{font-family:'Bebas Neue',sans-serif;font-size:3.8rem;letter-spacing:0.06em;color:var(--gold);line-height:0.88;margin-bottom:0.35rem}
        .form-sub{font-family:'Inter',sans-serif;font-size:0.75rem;color:var(--f4);margin-bottom:1.4rem;line-height:1.5}

        .field{margin-bottom:0.85rem}
        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem}
        .field-label{font-family:'Bebas Neue',sans-serif;font-size:0.82rem;letter-spacing:0.14em;color:var(--f3);margin-bottom:0.35rem;display:block}
        .field-opt{font-family:'Inter',sans-serif;font-size:0.65rem;color:var(--f4);letter-spacing:0;font-weight:400}
        .field-input{width:100%;padding:0.62rem 0.8rem;background:#111318;border:1px solid #2a2e38;border-radius:2px;color:var(--f1);font-size:0.85rem;font-family:'Inter',sans-serif;outline:none;transition:border-color 0.15s,box-shadow 0.15s}
        .field-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,0.08)}
        .field-input::placeholder{color:var(--f4)}
        select.field-input{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8780' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.75rem center}
        .field-hint{font-size:0.68rem;color:#4a4845;margin-top:0.3rem;display:flex;align-items:center;gap:3px;font-family:'Inter',sans-serif}
        .pw-rules{display:flex;gap:0.75rem;margin-top:0.35rem;flex-wrap:wrap}
        .pw-rule{display:flex;align-items:center;gap:3px;font-size:0.66rem;color:#4a4845;font-family:'Inter',sans-serif}
        .pw-rule.met{color:#2cb67d}
        .check-row{display:flex;align-items:flex-start;gap:0.55rem;margin-bottom:1rem;margin-top:0.15rem}
        .check-row input{margin-top:2px;width:14px;height:14px;flex-shrink:0;accent-color:#c9a84c;cursor:pointer}
        .terms-text{font-size:0.72rem;color:#8a8780;line-height:1.5;cursor:pointer;font-family:'Inter',sans-serif}
        .terms-text a{color:var(--gold);text-decoration:none}
        .terms-text a:hover{text-decoration:underline}

        .or-div{display:flex;align-items:center;gap:0.65rem;margin:0.85rem 0}
        .or-line{flex:1;height:1px;background:rgba(255,255,255,0.07)}
        .or-text{font-family:'Bebas Neue',sans-serif;font-size:0.78rem;letter-spacing:0.2em;color:var(--f4)}

        .btn-primary{
          width:100%;
          font-family:'Bebas Neue',sans-serif;
          font-size:1.1rem;
          letter-spacing:0.18em;
          background:#e6b832;
          color:#000;
          padding:0.88rem;
          border:none;
          border-radius:2px;
          cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          box-shadow:0 4px 20px rgba(201,168,76,0.45), 0 0 0 1px rgba(201,168,76,0.3);
          transition:all 0.15s;
          text-decoration:none;
        }
        .btn-primary:hover{background:#f0c840;box-shadow:0 6px 28px rgba(201,168,76,0.6), 0 0 0 1px rgba(201,168,76,0.4)}
        .btn-primary:disabled{opacity:0.6;cursor:not-allowed}

        .btn-magic{width:100%;font-family:'Bebas Neue',sans-serif;font-size:0.88rem;letter-spacing:0.12em;background:transparent;color:var(--f3);border:1px solid #2a2e38;padding:0.72rem;border-radius:2px;cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:7px}
        .btn-magic:hover{border-color:var(--f3);color:var(--f1)}
        .btn-magic:disabled{opacity:0.6;cursor:not-allowed}

        .form-footer{text-align:center;font-size:0.72rem;color:var(--f4);margin-top:1.1rem}
        .form-footer a{color:var(--gold);text-decoration:none;font-weight:500}
        .form-footer a:hover{text-decoration:underline}

        .error-msg{font-size:0.72rem;color:#ff6b6b;margin-bottom:0.75rem;padding:0.5rem;background:rgba(255,107,107,0.1);border-radius:2px}

        .confirmation{text-align:center;padding:1rem 0}
        .confirm-icon{font-size:3rem;margin-bottom:1rem}
        .email-highlight{color:var(--gold);font-weight:500}

        @media (max-width: 900px) {
          .page{grid-template-columns:1fr}
          .left{display:none}
          .right{border-left:none;min-height:calc(100vh - 52px)}
        }
      `}</style>
    </>
  )
}
