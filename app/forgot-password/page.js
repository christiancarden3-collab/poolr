'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="logo">PickPoolr</Link>
            <h1>Check your email</h1>
            <p>We sent a password reset link to <strong>{email}</strong></p>
          </div>
          <Link href="/login" className="btn-outline full-width">
            Back to login
          </Link>
        </div>

        <style jsx>{`
          .auth-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: var(--ink);
          }
          .auth-card {
            background: var(--ink2);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 3rem;
            width: 100%;
            max-width: 420px;
            text-align: center;
          }
          .auth-header .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
            text-decoration: none;
          }
          .auth-header h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 300;
            color: var(--silk);
            margin-top: 1.5rem;
          }
          .auth-header p {
            color: var(--body);
            font-size: 0.9rem;
            margin-top: 0.5rem;
            margin-bottom: 2rem;
          }
          .full-width { width: 100%; text-align: center; }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <Link href="/login" className="back-link">
        ← Back to login
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="logo">PickPoolr</Link>
          <h1>Reset password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleReset}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <button type="submit" className="btn-gold full-width" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: var(--ink);
        }
        .back-link {
          position: absolute;
          top: 2rem;
          left: 2rem;
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
        }
        .back-link:hover { color: var(--silk); }
        .auth-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: 420px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-header .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          letter-spacing: 0.12em;
          color: var(--gold2);
          text-transform: uppercase;
          text-decoration: none;
        }
        .auth-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--silk);
          margin-top: 1.5rem;
        }
        .auth-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .form-group { margin-bottom: 1.25rem; }
        .error-msg {
          background: rgba(224, 108, 117, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .full-width { width: 100%; text-align: center; margin-top: 0.5rem; }
      `}</style>
    </div>
  )
}
