'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'

export default function ManagePoolPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('open')
  const [paymentInstructions, setPaymentInstructions] = useState('')

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    // Get pool
    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!poolData || poolData.commissioner_id !== currentUser.id) {
      router.push('/dashboard')
      return
    }

    setPool(poolData)
    setName(poolData.name)
    setDescription(poolData.description || '')
    setStatus(poolData.status)
    setPaymentInstructions(poolData.payment_instructions || '')
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('pools')
        .update({
          name,
          description: description || null,
          status,
          payment_instructions: paymentInstructions || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pool.id)

      if (error) throw error

      setMessage('Settings saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const regenerateInviteCode = async () => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    try {
      const { error } = await supabase
        .from('pools')
        .update({ invite_code: newCode })
        .eq('id', pool.id)

      if (error) throw error

      setPool({ ...pool, invite_code: newCode })
      setMessage('New invite code generated!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
        <p>Loading...</p>
        <style jsx global>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--ink);
          }
          .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <nav className="manage-nav">
        <Link href={`/pool/${pool.id}`} className="back-link">← Back to Pool</Link>
        <div className="logo">Poolr</div>
        <button onClick={handleSave} disabled={saving} className="save-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </nav>

      <main className="manage-container">
        <div className="manage-header">
          <h1>Pool Settings</h1>
          <p>Manage your pool configuration</p>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="settings-section">
          <h2>Basic Info</h2>
          
          <div className="form-group">
            <label>Pool Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="form-group">
            <label>Pool Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="open">Open (accepting members)</option>
              <option value="locked">Locked (no new members)</option>
              <option value="completed">Completed</option>
            </select>
            <small>Lock the pool to prevent new members from joining</small>
          </div>
        </div>

        <div className="settings-section">
          <h2>Invite Link</h2>
          
          <div className="invite-display">
            <code>{pool.invite_code}</code>
            <button onClick={regenerateInviteCode} className="btn-outline small">
              Generate New Code
            </button>
          </div>
          <small>Warning: Generating a new code will invalidate the old invite link</small>
        </div>

        {pool.payment_method === 'external' && (
          <div className="settings-section">
            <h2>Payment Instructions</h2>
            
            <div className="form-group">
              <label>Instructions for members</label>
              <textarea
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                rows={4}
                placeholder="e.g., Send $50 to @johndoe on Venmo..."
              />
              <small>Members will see this when they join the pool</small>
            </div>
          </div>
        )}

        <div className="settings-section">
          <h2>Pool Details (Read-only)</h2>
          
          <div className="info-grid">
            <div className="info-row">
              <span>Buy-in</span>
              <strong>${pool.buy_in}</strong>
            </div>
            <div className="info-row">
              <span>Payment Method</span>
              <strong>{pool.payment_method === 'stripe' ? 'Stripe' : 'External'}</strong>
            </div>
            <div className="info-row">
              <span>Fee Handling</span>
              <strong>{pool.fee_handling === 'on_top' ? 'Player pays fee' : 'From pot'}</strong>
            </div>
            <div className="info-row">
              <span>Visibility</span>
              <strong>{pool.visibility}</strong>
            </div>
            <div className="info-row">
              <span>Created</span>
              <strong>{new Date(pool.created_at).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        <div className="danger-zone">
          <h2>Danger Zone</h2>
          <p>These actions cannot be undone</p>
          <button className="btn-danger" disabled>
            Delete Pool (Coming Soon)
          </button>
        </div>
      </main>

      <style jsx global>{`
        .manage-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
        }

        .save-btn {
          background: var(--gold);
          color: var(--ink);
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .save-btn:disabled {
          opacity: 0.5;
        }

        .manage-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
        }

        .manage-header {
          margin-bottom: 2rem;
        }

        .manage-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: var(--silk);
        }

        .manage-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .message.success {
          background: rgba(93, 187, 138, 0.1);
          border: 1px solid var(--success);
          color: var(--success);
        }

        .message.error {
          background: rgba(224, 108, 117, 0.1);
          border: 1px solid var(--error);
          color: var(--error);
        }

        .settings-section {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
        }

        .settings-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--silk);
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group small {
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          margin-top: 0.35rem;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .invite-display {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .invite-display code {
          flex: 1;
          background: var(--ink3);
          padding: 1rem;
          border-radius: 8px;
          font-family: monospace;
          font-size: 1.25rem;
          letter-spacing: 0.1em;
          color: var(--gold);
        }

        .btn-outline.small {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }

        .info-grid {
          background: var(--ink3);
          border-radius: 8px;
          padding: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border2);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row span {
          color: var(--body);
        }

        .info-row strong {
          color: var(--silk);
        }

        .danger-zone {
          background: var(--ink2);
          border: 1px solid var(--error);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 3rem;
        }

        .danger-zone h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--error);
          margin-bottom: 0.5rem;
        }

        .danger-zone p {
          color: var(--body);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .btn-danger {
          background: transparent;
          border: 1px solid var(--error);
          color: var(--error);
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
