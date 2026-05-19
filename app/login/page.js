'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push(redirect || '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${redirect || '/dashboard'}`,
        },
      })

      if (error) throw error
      setMagicLinkSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          <div className="auth-eyebrow">Welcome back</div>
          <div className="auth-title">Sign In</div>
          <div className="auth-sub">Sign in to manage your pools and submit picks</div>
        </div>

        <div className="auth-body">
          {error && <div className="error-msg">{error}</div>}

          {!magicLinkSent ? (
            <>
              {!showMagicLink ? (
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label className="field-label">Email address</label>
                    <input
                      className={`field-input ${error && !email ? 'error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
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
                      required
                    />
                  </div>

                  <button type="submit" className="btn-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In →'}
                  </button>

                  <div className="or-divider">
                    <div className="or-line"></div>
                    <div className="or-text">or</div>
                    <div className="or-line"></div>
                  </div>

                  <button
                    type="button"
                    className="btn-outline-full"
                    onClick={() => setShowMagicLink(true)}
                  >
                    ✉ Sign in with magic link
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMagicLink}>
                  <div className="field">
                    <label className="field-label">Email address</label>
                    <input
                      className={`field-input ${error && !email ? 'error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-full" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Magic Link →'}
                  </button>

                  <button
                    type="button"
                    className="btn-outline-full"
                    onClick={() => setShowMagicLink(false)}
                  >
                    ← Use password instead
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="magic-sent">
              <div className="magic-icon">✉</div>
              <div className="magic-title">Check your inbox</div>
              <div className="magic-sub">
                We sent a magic link to <span className="magic-email">{email}</span>. 
                Click it to sign in — no password needed.
              </div>
              <button
                type="button"
                className="btn-outline-full"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setMagicLinkSent(false)
                  setShowMagicLink(false)
                }}
              >
                ← Use password instead
              </button>
            </div>
          )}
        </div>

        <div className="auth-foot">
          Don't have an account? <Link href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>Create one →</Link>
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
          max-width: 420px;
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

        .auth-foot :global(a) {
          color: var(--gold);
          text-decoration: none;
          font-weight: 500;
        }

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
          text-decoration: none;
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
          margin-top: 1.25rem;
        }

        .btn-full:hover {
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
          font-weight: 500;
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

          .auth-foot {
            padding: 0 1.25rem 1.5rem;
            padding-top: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--f3)' }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
