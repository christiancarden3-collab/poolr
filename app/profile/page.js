'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Form states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      const meta = currentUser.user_metadata || {}
      setFirstName(meta.first_name || '')
      setLastName(meta.last_name || '')
      setUsername(meta.username || '')
      setEmail(currentUser.email || '')
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!username || username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters' })
      return
    }
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username
        }
      })
      if (error) throw error
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required' })
      return
    }
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      setMessage({ type: 'success', text: 'Verification email sent to your new address. Please check your inbox.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="loading-page">Loading...</div>
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/" className="nav-item">Home</Link>
          <Link href="/dashboard" className="nav-item">My Pools</Link>
          <Link href="/browse" className="nav-item">Browse</Link>
        </div>
        <button className="nav-ghost" onClick={handleSignOut}>Sign Out</button>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <div className="ph-eyebrow">Settings</div>
            <div className="ph-title">My Profile</div>
            <div className="ph-meta">Manage your account settings</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap">
        {message.text && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Info */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Profile Information</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateProfile}>
              <div className="form-row">
                <div className="field">
                  <label className="field-label">First name</label>
                  <input 
                    className="field-input"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Juan"
                  />
                </div>
                <div className="field">
                  <label className="field-label">Last name</label>
                  <input 
                    className="field-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="García"
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Username</label>
                <input 
                  className="field-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="juangarcia26"
                />
                <div className="field-hint">Letters, numbers, underscores only</div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Email */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Email Address</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdateEmail}>
              <div className="field">
                <label className="field-label">Email</label>
                <input 
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <div className="field-hint">You will need to verify your new email address</div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Email'}
              </button>
            </form>
          </div>
        </div>

        {/* Password */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Change Password</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleUpdatePassword}>
              <div className="field">
                <label className="field-label">New password</label>
                <input 
                  className="field-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="field">
                <label className="field-label">Confirm new password</label>
                <input 
                  className="field-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card card-danger">
          <div className="card-head">
            <div className="card-title">Danger Zone</div>
          </div>
          <div className="card-body">
            <p className="danger-text">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="btn-danger" disabled>Delete Account</button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--f3);
        }

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
          margin-right: 2rem;
          text-decoration: none;
        }
        .nav-logo span { color: var(--gold); }
        .nav-items {
          display: flex;
          height: 100%;
        }
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0 1.25rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-ghost {
          margin-left: auto;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          background: transparent;
          border: 1px solid var(--f4);
          padding: 0.5rem 1rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-ghost:hover { color: var(--f1); border-color: var(--f2); }

        /* PAGE HEADER */
        .page-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          padding: 1.25rem 2rem;
        }
        .page-header-inner {
          max-width: 700px;
          margin: 0 auto;
        }
        .ph-eyebrow {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.3rem;
        }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--white);
        }
        .ph-meta {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--f3);
          margin-top: 0.2rem;
        }

        /* LAYOUT */
        .wrap {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* ALERTS */
        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .alert-error {
          background: rgba(224, 59, 59, 0.1);
          border: 1px solid var(--red);
          color: var(--red);
        }
        .alert-success {
          background: rgba(44, 182, 125, 0.1);
          border: 1px solid var(--green);
          color: var(--green);
        }

        /* CARDS */
        .card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }
        .card-head {
          background: var(--bg3);
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--line);
        }
        .card-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--white);
        }
        .card-body {
          padding: 1.5rem 1.25rem;
        }
        .card-danger {
          border-color: rgba(224, 59, 59, 0.3);
        }
        .card-danger .card-head {
          background: rgba(224, 59, 59, 0.1);
        }
        .card-danger .card-title {
          color: var(--red);
        }

        /* FORMS */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .field {
          margin-bottom: 1.25rem;
        }
        .field-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f2);
          margin-bottom: 0.4rem;
        }
        .field-input {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--line);
          border-radius: 3px;
          padding: 0.75rem 1rem;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--f1);
          transition: border-color 0.15s;
        }
        .field-input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .field-input::placeholder {
          color: var(--f4);
        }
        .field-hint {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--f4);
          margin-top: 0.35rem;
        }

        /* BUTTONS */
        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.75rem 1.5rem;
          border-radius: 3px;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: var(--gold2); }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-danger {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          color: var(--red);
          padding: 0.75rem 1.5rem;
          border-radius: 3px;
          border: 1px solid var(--red);
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-danger:hover {
          background: var(--red);
          color: #fff;
        }
        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .danger-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--f3);
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 1rem; }
          .nav-items { display: none; }
          .wrap { padding: 1rem; }
          .form-row { grid-template-columns: 1fr; }
          .page-header { padding: 1rem; }
        }
      `}</style>
    </>
  )
}
