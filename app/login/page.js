'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showMagic, setShowMagic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          // When remember me is checked, session persists longer
          persistSession: rememberMe
        }
      })
      if (error) throw error
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }
      
      router.push('/dashboard')
    } catch (err) {
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
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/register" className="nav-link">Create Account</Link>
          <Link href="/browse" className="nav-ghost">Browse Pools</Link>
        </div>
      </nav>

      {/* AUTH PAGE */}
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
            <div className="auth-eyebrow">Welcome back</div>
            <div className="auth-title">Sign In</div>
            <div className="auth-sub">Sign in to manage your pools and submit picks</div>
          </div>

          <div className="auth-body">
            {!showMagic ? (
              <form onSubmit={handleLogin}>
                <div className="field">
                  <label className="field-label">Email address</label>
                  <input 
                    className={`field-input ${error ? 'error' : ''}`}
                    type="email" 
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="field-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Password
                    <Link href="/forgot-password" className="forgot-link">Forgot?</Link>
                  </label>
                  <input 
                    className="field-input" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="remember-row">
                  <label className="remember-label">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-check"
                    />
                    <span className="remember-box"></span>
                    <span className="remember-text">Remember me</span>
                  </label>
                </div>
                {error && <div className="error-msg">{error}</div>}
                <button type="submit" className="btn-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
                <div className="or-divider"><div className="or-line"></div><div className="or-text">or</div><div className="or-line"></div></div>
                <button type="button" className="btn-outline-full" onClick={handleMagicLink} disabled={loading}>
                  ✉ Sign in with magic link
                </button>
              </form>
            ) : (
              <div className="magic-sent">
                <div className="magic-icon">✉</div>
                <div className="magic-title">Check your inbox</div>
                <div className="magic-sub">
                  We sent a magic link to <span className="magic-email">{email}</span>. Click it to sign in · no password needed.
                </div>
                <button className="btn-outline-full" style={{ marginTop: '1rem' }} onClick={() => setShowMagic(false)}>
                  ← Use password instead
                </button>
              </div>
            )}
          </div>

          <div className="auth-foot">
            Don&apos;t have an account? <Link href="/register">Create one →</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* NAV */
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
        .nav-logo span {
          color: var(--gold);
        }
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
          cursor: pointer;
          transition: color 0.15s;
        }
        .nav-link:hover {
          color: var(--f1);
        }
        .nav-ghost {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: 1px solid var(--f4);
          color: var(--f2);
          padding: 0.42rem 1.1rem;
          border-radius: 2px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-ghost:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        /* AUTH PAGE */
        .auth-page {
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
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
          background: repeating-linear-gradient(0deg, rgba(10,28,10,0.6) 0px, rgba(10,28,10,0.6) 38px, rgba(14,36,14,0.6) 38px, rgba(14,36,14,0.6) 76px);
          border: 2px solid rgba(255,255,255,0.06);
        }
        .pitch-lines {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%),
                      linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%);
        }
        .pitch-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .pitch-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201,168,76,0.05), transparent 70%);
        }

        /* AUTH CARD */
        .auth-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          position: relative;
          z-index: 2;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
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
          padding: 1.5rem 1.75rem;
        }
        .auth-foot {
          padding: 0 1.75rem 1.5rem;
          border-top: 1px solid var(--line);
          padding-top: 1.25rem;
          text-align: center;
          font-size: 0.78rem;
          color: var(--f3);
        }
        .auth-foot a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
        }

        /* FORM FIELDS */
        .field {
          margin-bottom: 1rem;
        }
        .field:last-of-type {
          margin-bottom: 0;
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
        .field-input.error {
          border-color: var(--red);
        }
        .forgot-link {
          font-size: 0.7rem;
          color: var(--gold);
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
        }
        .error-msg {
          font-size: 0.75rem;
          color: var(--red);
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        /* REMEMBER ME */
        .remember-row {
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }
        .remember-check {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .remember-box {
          width: 18px;
          height: 18px;
          border: 1.5px solid var(--f4);
          border-radius: 3px;
          background: var(--bg3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .remember-box::after {
          content: '✓';
          font-size: 11px;
          color: var(--gold);
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.15s;
        }
        .remember-check:checked + .remember-box {
          border-color: var(--gold);
          background: rgba(201,168,76,0.1);
        }
        .remember-check:checked + .remember-box::after {
          opacity: 1;
          transform: scale(1);
        }
        .remember-text {
          font-size: 0.8rem;
          color: var(--f3);
        }
        .remember-label:hover .remember-box {
          border-color: var(--f3);
        }

        /* BUTTONS */
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
          margin-top: 1.25rem;
        }
        .btn-full:hover:not(:disabled) {
          background: var(--gold2);
        }
        .btn-full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        .btn-outline-full:hover:not(:disabled) {
          border-color: var(--f2);
          color: var(--white);
        }
        .btn-outline-full:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* DIVIDER */
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

        /* MAGIC LINK */
        .magic-sent {
          text-align: center;
          padding: 1rem 0;
        }
        .magic-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }
        .magic-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.2rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 0.4rem;
        }
        .magic-sub {
          font-size: 0.8rem;
          color: var(--f3);
          line-height: 1.6;
        }
        .magic-email {
          color: var(--gold);
          font-weight: 600;
        }

        @keyframes pitchFloat {
          0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); }
          50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); }
        }

        @media (max-width: 640px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; }
          .nav-link { display: none; }
          .auth-card { border-radius: 0; border-left: none; border-right: none; max-width: 100%; }
          .auth-page { padding: 0; align-items: flex-start; }
          .auth-card-head { padding: 1.5rem 1.25rem 0; }
          .auth-body { padding: 1.25rem; }
          .auth-foot { padding: 0 1.25rem 1.5rem; padding-top: 1rem; }
        }
      `}</style>
    </>
  )
}
