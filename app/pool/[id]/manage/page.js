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
  const [message, setMessage] = useState('')
  
  // Timezone
  const [timezone, setTimezone] = useState('America/New_York')
  const [savingTimezone, setSavingTimezone] = useState(false)
  
  // Delete member
  const [removingMember, setRemovingMember] = useState(null)
  
  // Delete pool
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingPool, setDeletingPool] = useState(false)
  
  // Pending approvals
  const [approvingMember, setApprovingMember] = useState(null)
  const [rejectingMember, setRejectingMember] = useState(null)

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
    setTimezone(poolData.timezone || 'America/New_York')

    // Get members
    const { data: membersData } = await supabase
      .from('pool_members')
      .select(`
        *,
        profiles:user_id (
          id,
          display_name,
          email,
          name
        )
      `)
      .eq('pool_id', params.id)
      .order('joined_at', { ascending: true })

    setMembers(membersData || [])
    setLoading(false)
  }

  // Approve pending member
  const approveMember = async (memberId) => {
    setApprovingMember(memberId)
    try {
      const { error } = await supabase
        .from('pool_members')
        .update({ payment_status: 'paid' })
        .eq('id', memberId)
      
      if (error) throw error
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, payment_status: 'paid' } : m
      ))
      setMessage('Member approved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setApprovingMember(null)
    }
  }

  // Reject pending member
  const rejectMember = async (memberId) => {
    setRejectingMember(memberId)
    try {
      // Delete their picks first
      await supabase.from('match_picks').delete().eq('pool_member_id', memberId)
      await supabase.from('special_picks').delete().eq('pool_member_id', memberId)
      
      // Delete the member
      const { error } = await supabase
        .from('pool_members')
        .delete()
        .eq('id', memberId)
      
      if (error) throw error
      
      // Update local state
      setMembers(prev => prev.filter(m => m.id !== memberId))
      setMessage('Member rejected and removed.')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setRejectingMember(null)
    }
  }

  // Get pending members
  const pendingMembers = members.filter(m => m.payment_status === 'pending')
  const approvedMembers = members.filter(m => m.payment_status !== 'pending')

  const handleSaveTimezone = async () => {
    setSavingTimezone(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('pools')
        .update({ timezone, updated_at: new Date().toISOString() })
        .eq('id', pool.id)

      if (error) throw error

      setMessage('Timezone saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setSavingTimezone(false)
    }
  }

  const removeMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from the pool? This deletes all their picks.`)) {
      return
    }

    setRemovingMember(memberId)
    try {
      const memberToRemove = members.find(m => m.id === memberId)
      
      // Delete their picks from picks table (by user_id and pool_id)
      if (memberToRemove) {
        await supabase
          .from('picks')
          .delete()
          .eq('pool_id', pool.id)
          .eq('user_id', memberToRemove.user_id)
      }
      
      // Delete their match picks
      await supabase
        .from('match_picks')
        .delete()
        .eq('pool_member_id', memberId)

      // Delete their special picks
      await supabase
        .from('special_picks')
        .delete()
        .eq('pool_member_id', memberId)

      // Delete the membership
      const { error } = await supabase
        .from('pool_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setMembers(members.filter(m => m.id !== memberId))
      setMessage('Member removed')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setRemovingMember(null)
    }
  }

  const deletePool = async () => {
    if (deleteConfirmText.trim() !== pool.name.trim()) {
      setMessage('Pool name does not match')
      return
    }

    setDeletingPool(true)
    setMessage('')
    
    try {
      console.log('Starting pool deletion...')
      
      // Delete all picks for the pool first
      const { error: poolPicksErr } = await supabase.from('picks').delete().eq('pool_id', pool.id)
      if (poolPicksErr) console.log('Picks delete error (ok if table empty):', poolPicksErr)
      
      // Delete all match picks for all members
      for (const member of members) {
        const { error: picksErr } = await supabase.from('match_picks').delete().eq('pool_member_id', member.id)
        if (picksErr) console.log('Match picks delete error (ok if table empty):', picksErr)
        
        const { error: specialErr } = await supabase.from('special_picks').delete().eq('pool_member_id', member.id)
        if (specialErr) console.log('Special picks delete error (ok if table empty):', specialErr)
      }

      // Delete all members
      const { error: membersErr } = await supabase.from('pool_members').delete().eq('pool_id', pool.id)
      if (membersErr) {
        console.error('Members delete error:', membersErr)
        throw new Error('Failed to delete pool members: ' + membersErr.message)
      }

      // Delete the pool
      const { error } = await supabase.from('pools').delete().eq('id', pool.id)
      if (error) {
        console.error('Pool delete error:', error)
        throw new Error('Failed to delete pool: ' + error.message)
      }

      console.log('Pool deleted successfully, redirecting...')
      router.push('/dashboard')
    } catch (err) {
      console.error('Delete pool error:', err)
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
          .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg); }
          .logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; }
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
          <Link href="/browse" className="nav-item">Browse</Link>
          <Link href="/scores" className="nav-item">Scores</Link>
        </div>
        <Link href={`/pool/${pool.id}`} className="nav-cta">← Back to Pool</Link>
      </nav>

      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="ph-eyebrow">Commissioner Only</div>
          <div className="ph-title">Pool Settings</div>
          <div className="ph-meta">{pool.name}</div>
        </div>
      </div>

      <main className="manage-container">
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* 0. PENDING APPROVALS */}
        {pendingMembers.length > 0 && (
          <div className="settings-section pending-section">
            <div className="section-head">
              <div className="section-title">🔔 Pending Approvals</div>
              <span className="section-badge pending">{pendingMembers.length} waiting</span>
            </div>
            <div className="section-body" style={{ padding: 0 }}>
              <p className="section-desc" style={{ padding: '1rem 1.25rem 0' }}>
                These players claim they paid. Verify payment and approve or reject.
              </p>
              <div className="members-list">
                {pendingMembers.map(member => {
                  const displayName = member.team_name || member.profiles?.name || member.profiles?.display_name || 'Unknown'
                  const paymentMethod = member.payment_method?.charAt(0).toUpperCase() + member.payment_method?.slice(1)
                  return (
                    <div key={member.id} className="member-row pending-row">
                      <div className="member-info">
                        <span className="member-name">{displayName}</span>
                        <span className="member-email">{member.profiles?.email}</span>
                        <span className="payment-badge">{paymentMethod || 'Unknown'}</span>
                      </div>
                      <div className="approval-btns">
                        <button
                          onClick={() => approveMember(member.id)}
                          disabled={approvingMember === member.id}
                          className="btn-approve"
                        >
                          {approvingMember === member.id ? '...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => rejectMember(member.id)}
                          disabled={rejectingMember === member.id}
                          className="btn-reject"
                        >
                          {rejectingMember === member.id ? '...' : '✗ Reject'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* 1. TIMEZONE */}
        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Timezone</div>
          </div>
          <div className="section-body">
            <p className="section-desc">Match times will be displayed in this timezone for all pool members.</p>
            <div className="tz-row">
              <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
              <button 
                className="btn-save" 
                onClick={handleSaveTimezone}
                disabled={savingTimezone}
              >
                {savingTimezone ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. DELETE TEAM (MEMBER) */}
        <div className="settings-section">
          <div className="section-head">
            <div className="section-title">Remove Members</div>
            <span className="section-badge">{members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="section-body" style={{ padding: 0 }}>
            <p className="section-desc" style={{ padding: '1rem 1.25rem 0' }}>
              Remove a player from your pool. This will delete all their picks.
            </p>
            <div className="members-list">
              {members.map(member => {
                const isCommissioner = member.user_id === pool.commissioner_id
                const displayName = member.team_name || member.profiles?.name || member.profiles?.display_name || 'Unknown'
                return (
                  <div key={member.id} className="member-row">
                    <div className="member-info">
                      <span className="member-name">
                        {displayName}
                        {isCommissioner && <span className="commissioner-badge">You</span>}
                      </span>
                      <span className="member-email">{member.profiles?.email}</span>
                    </div>
                    {!isCommissioner && (
                      <button
                        onClick={() => removeMember(member.id, displayName)}
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

        {/* 3. DELETE POOL */}
        <div className="danger-zone">
          <div className="section-head danger">
            <div className="section-title">Delete Pool</div>
          </div>
          <div className="section-body">
            <p className="danger-text">
              Permanently delete this pool, all members, and all predictions. This cannot be undone.
            </p>
            
            {!showDeleteConfirm ? (
              <button className="btn-danger" onClick={() => setShowDeleteConfirm(true)}>
                Delete Pool
              </button>
            ) : (
              <div className="delete-confirm">
                <p className="delete-warning">
                  Type <strong>{pool.name}</strong> to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type pool name"
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
        nav { background: var(--bg); border-bottom: 3px solid var(--gold); display: flex; align-items: center; padding: 0 2rem; height: 56px; position: sticky; top: 0; z-index: 200; }
        .nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 2rem; font-weight: 900; letter-spacing: 0.04em; color: var(--white); text-transform: uppercase; margin-right: 2rem; padding-right: 2rem; border-right: 1px solid var(--f4); text-decoration: none; }
        .nav-logo span { color: var(--gold); }
        .nav-items { display: flex; height: 100%; }
        .nav-item { display: flex; align-items: center; padding: 0 1.25rem; font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--f3); text-decoration: none; border-bottom: 3px solid transparent; margin-bottom: -3px; }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-cta { margin-left: auto; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.5rem 1.25rem; border-radius: 2px; text-decoration: none; }

        /* PAGE HEADER */
        .page-header { background: var(--bg2); border-bottom: 1px solid var(--line); padding: 1.25rem 2rem; }
        .page-header-inner { max-width: 600px; margin: 0 auto; }
        .ph-eyebrow { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .ph-title { font-family: 'Barlow Condensed', sans-serif; font-size: 1.8rem; font-weight: 900; text-transform: uppercase; color: var(--white); }
        .ph-meta { font-size: 0.78rem; color: var(--f3); margin-top: 0.2rem; }

        /* CONTAINER */
        .manage-container { max-width: 600px; margin: 0 auto; padding: 2rem; }

        /* MESSAGE */
        .message { padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.85rem; font-weight: 600; text-align: center; }
        .message.success { background: rgba(44,182,125,0.1); border: 1px solid var(--green); color: var(--green); }
        .message.error { background: rgba(224,59,59,0.1); border: 1px solid var(--red); color: var(--red); }

        /* SECTIONS */
        .settings-section { background: var(--bg2); border: 1px solid var(--line); border-radius: 4px; margin-bottom: 1.5rem; overflow: hidden; }
        .section-head { background: var(--bg3); padding: 0.65rem 1.25rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .section-head.danger { background: rgba(224,59,59,0.1); border-bottom-color: rgba(224,59,59,0.2); }
        .section-title { font-family: 'Barlow Condensed', sans-serif; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
        .section-head.danger .section-title { color: var(--red); }
        .section-badge { font-family: 'Barlow Condensed', sans-serif; font-size: 0.68rem; font-weight: 700; color: var(--f4); background: var(--bg); padding: 0.2rem 0.5rem; border-radius: 2px; }
        .section-body { padding: 1.25rem; }
        .section-desc { font-size: 0.85rem; color: var(--f3); margin-bottom: 1rem; line-height: 1.5; }

        /* TIMEZONE ROW */
        .tz-row { display: flex; gap: 0.75rem; align-items: center; }
        .tz-row select { flex: 1; padding: 0.65rem 0.85rem; background: var(--bg); border: 1px solid var(--f4); border-radius: 3px; color: var(--f1); font-size: 0.9rem; outline: none; }
        .tz-row select:focus { border-color: var(--gold); }
        .btn-save { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; background: var(--gold); color: #000; padding: 0.65rem 1.25rem; border-radius: 2px; border: none; cursor: pointer; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        /* MEMBERS */
        .members-list { background: var(--bg); }
        .member-row { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--line); }
        .member-row:last-child { border-bottom: none; }
        .member-info { display: flex; flex-direction: column; gap: 0.15rem; }
        .member-name { color: var(--f1); font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
        .commissioner-badge { background: var(--gold); color: #000; font-family: 'Barlow Condensed', sans-serif; font-size: 0.58rem; font-weight: 800; padding: 0.12rem 0.4rem; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
        .member-email { color: var(--f4); font-size: 0.75rem; }
        .btn-remove { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid var(--red); color: var(--red); padding: 0.35rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .btn-remove:hover:not(:disabled) { background: var(--red); color: #fff; }
        .btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }

        /* PENDING APPROVALS */
        .pending-section { border-color: var(--gold); }
        .pending-section .section-head { background: rgba(201,168,76,0.1); }
        .section-badge.pending { background: var(--gold); color: #000; }
        .pending-row { background: rgba(201,168,76,0.03); }
        .payment-badge { display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background: rgba(201,168,76,0.15); color: var(--gold); padding: 0.15rem 0.5rem; border-radius: 2px; margin-top: 0.25rem; }
        .approval-btns { display: flex; gap: 0.5rem; }
        .btn-approve { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background: var(--green); border: none; color: #fff; padding: 0.4rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .btn-approve:hover:not(:disabled) { opacity: 0.9; }
        .btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-reject { font-family: 'Barlow Condensed', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; background: transparent; border: 1px solid var(--red); color: var(--red); padding: 0.4rem 0.75rem; border-radius: 2px; cursor: pointer; }
        .btn-reject:hover:not(:disabled) { background: var(--red); color: #fff; }
        .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }

        /* DANGER ZONE */
        .danger-zone { background: var(--bg2); border: 1px solid var(--red); border-radius: 4px; overflow: hidden; margin-top: 2rem; }
        .danger-text { color: var(--f3); font-size: 0.85rem; margin-bottom: 1rem; line-height: 1.5; }
        .btn-danger { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid var(--red); color: var(--red); padding: 0.6rem 1.25rem; border-radius: 2px; cursor: pointer; }
        .btn-danger:hover { background: var(--red); color: #fff; }
        .delete-confirm { background: var(--bg); border-radius: 4px; padding: 1.25rem; }
        .delete-warning { color: var(--f3); font-size: 0.85rem; margin-bottom: 0.75rem; }
        .delete-warning strong { color: var(--red); }
        .delete-input { width: 100%; padding: 0.65rem 0.85rem; background: var(--bg2); border: 1px solid var(--f4); border-radius: 3px; color: var(--f1); font-size: 0.9rem; margin-bottom: 1rem; }
        .delete-input:focus { outline: none; border-color: var(--red); }
        .delete-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
        .btn-cancel { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: transparent; border: 1px solid var(--f4); color: var(--f3); padding: 0.5rem 1rem; border-radius: 2px; cursor: pointer; }
        .btn-danger-confirm { font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; background: var(--red); border: none; color: #fff; padding: 0.5rem 1rem; border-radius: 2px; cursor: pointer; }
        .btn-danger-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .manage-container { padding: 1rem; }
          .tz-row { flex-direction: column; }
          .tz-row select { width: 100%; }
        }
      `}</style>
    </>
  )
}
