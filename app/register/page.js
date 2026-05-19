'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) throw error
      
      // If email confirmation is disabled, user is logged in immediately
      if (data.session) {
        router.push(redirect || '/dashboard')
      } else {
        setSuccess(true)
      }
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
            <Link href="/" className="logo">Poolr</Link>
            <h1>Check your email</h1>
            <p>We sent a confirmation link to <strong>{email}</strong></p>
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

          .full-width {
            width: 100%;
            text-align: center;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <Link href="/" className="back-link">
        <i className="ti ti-arrow-left"></i> Back to home
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="logo">Poolr</Link>
          <h1>Create your account</h1>
          <p>Start your first prediction pool</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

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
              minLength={8}
              required
            />
            <small>Minimum 8 characters</small>
          </div>

          <button type="submit" className="btn-gold full-width" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="terms-notice">
            By creating an account, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>
          </p>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
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

        .form-group small {
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          margin-top: 0.35rem;
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

        .terms-notice {
          font-size: 0.75rem;
          color: var(--muted);
          text-align: center;
          margin-top: 1rem;
        }

        .terms-notice :global(a) {
          color: var(--body);
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

        .auth-footer :global(a) {
          color: var(--gold);
        }
      `}</style>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)'}}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
