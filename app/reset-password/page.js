'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase handles the token from the URL automatically
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
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
            <h1>Password updated!</h1>
            <p>Redirecting you to the dashboard...</p>
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
            font-weight: 600;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
            text-decoration: none;
          }
          .auth-header h1 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 600;
            color: var(--success);
            margin-top: 1.5rem;
          }
          .auth-header p {
            color: var(--body);
            font-size: 0.9rem;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link href="/" className="logo">Poolr</Link>
          <h1>Set new password</h1>
          <p>Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleReset}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
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

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-gold full-width" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
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
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--gold2);
          text-transform: uppercase;
          text-decoration: none;
        }
        .auth-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 600;
          color: var(--silk);
          margin-top: 1.5rem;
        }
        .auth-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .form-group { margin-bottom: 1.25rem; }
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
        .full-width { width: 100%; text-align: center; margin-top: 0.5rem; }
      `}</style>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)'}}>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
