'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <Link href="/" className="back-link">
        <i className="ti ti-arrow-left"></i> Back to home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="logo">Poolr</Link>
          <h1>Welcome back</h1>
          <p>Sign in to manage your pools</p>
        </div>

        <form onSubmit={handleLogin}>
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

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-gold full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link href="/register">Create one</Link></p>
        </div>
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .back-link:hover {
          color: var(--silk);
        }

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

        .form-group {
          margin-bottom: 1.25rem;
        }

        .error-msg {
          background: rgba(224, 108, 117, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .full-width {
          width: 100%;
          text-align: center;
          margin-top: 0.5rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border2);
        }

        .auth-footer p {
          color: var(--body);
          font-size: 0.85rem;
        }

        .auth-footer a {
          color: var(--gold);
        }
      `}</style>
    </div>
  )
}
