'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Guatemala', label: 'Guatemala (GT)' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)' },
  { value: 'UTC', label: 'UTC' },
]

export default function ManagePoolPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingPool, setDeletingPool] = useState(false)
  const [removingMember, setRemovingMember] = useState(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('open')
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [timezone, setTimezone] = useState('America/New_York')

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
    setTimezone(poolData.timezone || 'America/New_York')

    // Get members
    const { data: membersData } = await supabase
      .from('pool_members')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email
        )
      `)
      .eq('pool_id', params.id)
      .order('joined_at', { ascending: true })

    setMembers(membersData || [])
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
          timezone,
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

  const removeMember = async (memberId, memberName) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the pool? This will delete all their predictions.`)) {
      return
    }

    setRemovingMember(memberId)
    try {
      // Delete their predictions first
      await supabase
        .from('predictions')
        .delete()
        .eq('pool_id', pool.id)
        .eq('user_id', members.find(m => m.id === memberId)?.user_id)

      // Delete their special picks
      await supabase
        .from('special_picks')
        .delete()
        .eq('pool_id', pool.id)
        .eq('user_id', members.find(m => m.id === memberId)?.user_id)

      // Delete the membership
      const { error } = await supabase
        .from('pool_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))
      setMessage('Member removed successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setRemovingMember(null)
    }
  }

  const deletePool = async () => {
    if (deleteConfirmText !== pool.name) {
      setMessage('Error: Pool name does not match')
      return
    }

    setDeletingPool(true)
    try {
      // Delete all predictions
      await supabase
        .from('predictions')
        .delete()
        .eq('pool_id', pool.id)

      // Delete all special picks
      await supabase
        .from('special_picks')
        .delete()
        .eq('pool_id', pool.id)

      // Delete all members
      await supabase
        .from('pool_members')
        .delete()
        .eq('pool_id', pool.id)

      // Delete the pool
      const { error } = await supabase
        .from('pools')
        .delete()
        .eq('id', pool.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      setMessage('Error: ' + err.message)
      setDeletingPool(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Pick<span>Poolr</span></div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--bg);
          }
          .logo {
            font-family: 'Barlow Condensed', sans-serif;
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: 0.04em;
            color: var(--white);
            text-transform: uppercase;
          }
          .logo span { color: var(--gold); }
          p { color: var(--f3); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <Link href={`/pool/${pool.id}`} className="nav-item active">{pool.name}</Link>
        </div>
        <button onClick={handleSave} disabled={saving} className="nav-cta">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-left">
            <Link href={`/pool/${pool.id}`} className="ph-back">← Back to Pool</Link>
            <div className="ph-title">Pool Settings</div>
            <div className="ph-meta">{pool.name} · Commissioner Only</div>
          </div>
        </div>
      </div>

      <main className="manage-container">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Basic Info</div>
          </div>
          <div className="section-body">
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

            <div className="form-row">
              <div className="form-group">
                <label>Pool Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="open">Open (accepting members)</option>
                  <option value="locked">Locked (no new members)</option>
                  <option value="completed">Completed</option>
                </select>
                <small>Lock the pool to prevent new members from joining</small>
              </div>

              <div className="form-group">
                <label>Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <small>Match times displayed in this timezone</small>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Invite Link</div>
          </div>
          <div className="section-body">
            <div className="invite-display">
              <code>{pool.invite_code}</code>
              <button onClick={regenerateInviteCode} className="btn-outline">
                Generate New Code
              </button>
            </div>
            <small className="warning">⚠️ Generating a new code will invalidate the old invite link</small>
          </div>
        </div>

        {pool.payment_method === 'external' && (
          <div className="settings-section">
            <div className="section-head">
              <div className="section-title">Payment Instructions</div>
            </div>
            <div className="section-body">
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
          </div>
        )}

        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Pool Details</div>
            <span className="section-badge">Read-only</span>
          </div>
          <div className="section-body">
            <div className="info-grid">
              <div className="info-row">
                <span>Buy-in</span>
                <strong>${pool.buy_in || 0}</strong>
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
                <strong style={{ textTransform: 'capitalize' }}>{pool.visibility}</strong>
              </div>
              <div className="info-row">
                <span>Created</span>
                <strong>{new Date(pool.created_at).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Manage Members</div>
            <span className="section-badge">{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="section-body" style={{ padding: 0 }}>
            <div className="members-list">
              {members.map(member => {
                const isCommissioner = member.user_id === pool.commissioner_id
                return (
                  <div key={member.id} className="member-row">
                    <div className="member-info">
                      <span className="member-name">
                        {member.team_name || member.profiles?.display_name || 'Unknown'}
                        {isCommissioner && <span className="commissioner-badge">Commissioner</span>}
                      </span>
                      <span className="member-email">{member.profiles?.email}</span>
                    </div>
                    {!isCommissioner && (
                      <button
                        onClick={() => removeMember(member.id, member.team_name || member.profiles?.display_name)}
                        disabled={removingMember === member.id}
                        className="btn-remove"
                      >
                        {removingMember === member.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="danger-zone">
          <div className="section-head danger">
            <div className="section-title">Danger Zone</div>
          </div>
          <div className="section-body">
            <p className="danger-text">These actions cannot be undone</p>
            
            {!showDeleteConfirm ? (
              <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete Pool
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-warning">
                  This will permanently delete the pool, all members, and all predictions. 
                  Type <strong>{pool.name}</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type pool name to confirm"
                  className="delete-input"
                />
                <div className="delete-actions">
                  <button 
                    className="btn-cancel" 
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-danger-confirm"
                    onClick={deletePool}
                    disabled={deleteConfirmText !== pool.name || deletingPool}
                  >
                    {deletingPool ? 'Deleting...' : 'Delete Forever'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
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
          padding-right: 2rem;
          border-right: 1px solid var(--f4);
          text-decoration: none;
        }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
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
          border-bottom: 3px solid transparent;
          margin-bottom: -3px;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta {
          margin-left: auto;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.5rem 1.25rem;
          border-radius: 2px;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .nav-cta:hover { background: var(--gold2); }
        .nav-cta:disabled { opacity: 0.5; cursor: not-allowed; }

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
        .ph-back {
          font-size: 0.78rem;
          color: var(--f3);
          text-decoration: none;
          margin-bottom: 0.5rem;
          display: inline-block;
        }
        .ph-back:hover { color: var(--gold); }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--white);
        }
        .ph-meta {
          font-size: 0.78rem;
          color: var(--f3);
          margin-top: 0.2rem;
        }

        /* CONTAINER */
        .manage-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* MESSAGE */
        .message {
          padding: 0.75rem 1rem;
          border-radius: 4px;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .message.success {
          background: rgba(44,182,125,0.1);
          border: 1px solid var(--green);
          color: var(--green);
        }
        .message.error {
          background: rgba(224,59,59,0.1);
          border: 1px solid var(--red);
          color: var(--red);
        }

        /* SECTIONS */
        .settings-section {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        .section-head {
          background: var(--bg3);
          padding: 0.65rem 1rem;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-head.danger {
          background: rgba(224,59,59,0.1);
          border-bottom-color: rgba(224,59,59,0.2);
        }
        .section-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--white);
        }
        .section-head.danger .section-title {
          color: var(--red);
        }
        .section-badge {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f4);
          background: var(--bg);
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
        }
        .section-body {
          padding: 1.25rem;
        }

        /* FORMS */
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group:last-child { margin-bottom: 0; }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f3);
          margin-bottom: 0.5rem;
        }
        input, textarea, select {
          width: 100%;
          padding: 0.65rem 0.85rem;
          background: var(--bg);
          border: 1px solid var(--f4);
          border-radius: 3px;
          color: var(--f1);
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.15s;
        }
        input:focus, textarea:focus, select:focus {
          border-color: var(--gold);
        }
        textarea { resize: vertical; min-height: 80px; }
        small {
          display: block;
          color: var(--f4);
          font-size: 0.72rem;
          margin-top: 0.35rem;
        }
        small.warning { color: var(--gold); }

        /* INVITE */
        .invite-display {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .invite-display code {
          flex: 1;
          background: var(--bg);
          padding: 0.85rem 1rem;
          border-radius: 4px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--gold);
        }
        .btn-outline {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--f3);
          border: 1px solid var(--f4);
          padding: 0.5rem 1rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-outline:hover {
          color: var(--f1);
          border-color: var(--f2);
        }

        /* INFO GRID */
        .info-grid {
          background: var(--bg);
          border-radius: 4px;
          padding: 0.25rem 1rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--line);
        }
        .info-row:last-child { border-bottom: none; }
        .info-row span { color: var(--f3); font-size: 0.85rem; }
        .info-row strong {
          color: var(--f1);
          font-weight: 600;
          font-size: 0.85rem;
        }

        /* MEMBERS */
        .members-list {
          background: var(--bg);
        }
        .member-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--line);
        }
        .member-row:last-child { border-bottom: none; }
        .member-info { display: flex; flex-direction: column; gap: 0.2rem; }
        .member-name {
          color: var(--f1);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .commissioner-badge {
          background: var(--gold);
          color: #000;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .member-email {
          color: var(--f4);
          font-size: 0.78rem;
        }
        .btn-remove {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid var(--red);
          color: var(--red);
          padding: 0.35rem 0.75rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-remove:hover:not(:disabled) {
          background: var(--red);
          color: #fff;
        }
        .btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }

        /* DANGER ZONE */
        .danger-zone {
          background: var(--bg2);
          border: 1px solid var(--red);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 3rem;
        }
        .danger-text {
          color: var(--f3);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .btn-danger {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid var(--red);
          color: var(--red);
          padding: 0.6rem 1.25rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-danger:hover {
          background: var(--red);
          color: #fff;
        }
        .delete-confirm {
          background: var(--bg);
          border-radius: 4px;
          padding: 1.25rem;
        }
        .delete-warning {
          color: var(--f3);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .delete-warning strong { color: var(--red); }
        .delete-input {
          margin-bottom: 1rem;
        }
        .delete-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
        .btn-cancel {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          border: 1px solid var(--f4);
          color: var(--f3);
          padding: 0.5rem 1rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .btn-danger-confirm {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--red);
          border: none;
          color: #fff;
          padding: 0.5rem 1rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .btn-danger-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .manage-container { padding: 1rem; }
          .form-row { grid-template-columns: 1fr; }
          .invite-display { flex-direction: column; }
          .invite-display code { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  )
}
