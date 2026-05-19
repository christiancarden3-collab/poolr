'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'

export default function ManagePaymentsPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

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

    // Get members
    const { data: membersData } = await supabase
      .from('pool_members')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('pool_id', params.id)
      .order('joined_at', { ascending: true })

    setMembers(membersData || [])
    setLoading(false)
  }

  const updatePaymentStatus = async (memberId, status) => {
    setUpdating(memberId)

    try {
      const { error } = await supabase
        .from('pool_members')
        .update({ 
          payment_status: status,
          paid_at: status === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', memberId)

      if (error) throw error

      // Refresh members
      setMembers(members.map(m => 
        m.id === memberId 
          ? { ...m, payment_status: status, paid_at: status === 'paid' ? new Date().toISOString() : null }
          : m
      ))
    } catch (err) {
      console.error('Update error:', err)
      alert('Failed to update: ' + err.message)
    } finally {
      setUpdating(null)
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
            font-weight: 300;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  const paidCount = members.filter(m => m.payment_status === 'paid').length
  const pendingCount = members.filter(m => m.payment_status === 'pending').length
  const totalCollected = paidCount * pool.buy_in

  return (
    <>
      <nav className="manage-nav">
        <Link href={`/pool/${pool.id}`} className="back-link">← Back to Pool</Link>
        <div className="logo">Poolr</div>
        <div style={{width: '150px'}}></div>
      </nav>

      <main className="manage-container">
        <div className="manage-header">
          <h1>Manage Payments</h1>
          <p>{pool.name}</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{paidCount}</span>
            <span className="stat-label">Paid</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card highlight">
            <span className="stat-value">${totalCollected}</span>
            <span className="stat-label">Collected</span>
          </div>
        </div>

        <div className="members-section">
          <h2>Members ({members.length})</h2>
          
          <div className="members-list">
            {members.map(member => (
              <div key={member.id} className="member-row">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.profiles?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="member-details">
                    <span className="member-name">
                      {member.profiles?.name || 'Unknown'}
                      {member.user_id === pool.commissioner_id && (
                        <span className="you-badge">You</span>
                      )}
                    </span>
                    <span className="member-email">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="member-actions">
                  <span className={`status-badge ${member.payment_status}`}>
                    {member.payment_status}
                  </span>
                  
                  {member.user_id !== pool.commissioner_id && (
                    <div className="action-buttons">
                      {member.payment_status !== 'paid' && (
                        <button 
                          onClick={() => updatePaymentStatus(member.id, 'paid')}
                          disabled={updating === member.id}
                          className="action-btn confirm"
                        >
                          {updating === member.id ? '...' : '✓ Mark Paid'}
                        </button>
                      )}
                      {member.payment_status === 'paid' && (
                        <button 
                          onClick={() => updatePaymentStatus(member.id, 'pending')}
                          disabled={updating === member.id}
                          className="action-btn revert"
                        >
                          {updating === member.id ? '...' : 'Undo'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {pool.payment_method === 'external' && pool.payment_instructions && (
          <div className="instructions-section">
            <h2>Payment Instructions (visible to members)</h2>
            <p>{pool.payment_instructions}</p>
          </div>
        )}
      </main>

      <style jsx global>{`
        .manage-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          text-decoration: none;
          width: 150px;
        }

        .manage-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .manage-header {
          margin-bottom: 2rem;
        }

        .manage-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--silk);
        }

        .manage-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-card.highlight {
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.08);
        }

        .stat-value {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: var(--silk);
        }

        .stat-card.highlight .stat-value {
          color: var(--gold2);
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
        }

        .members-section {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
        }

        .members-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 1.5rem;
        }

        .members-list {
          display: flex;
          flex-direction: column;
        }

        .member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border2);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .member-row:last-child {
          border-bottom: none;
        }

        .member-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .member-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .member-details {
          display: flex;
          flex-direction: column;
        }

        .member-name {
          color: var(--silk);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .you-badge {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--gold);
          background: rgba(212, 175, 55, 0.2);
          padding: 0.15rem 0.4rem;
          border-radius: 3px;
        }

        .member-email {
          color: var(--muted);
          font-size: 0.8rem;
        }

        .member-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.paid {
          background: rgba(93, 187, 138, 0.1);
          color: var(--success);
        }

        .status-badge.pending {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gold);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .action-btn.confirm {
          background: var(--success);
          color: white;
        }

        .action-btn.confirm:hover {
          background: #4aa876;
        }

        .action-btn.revert {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--body);
        }

        .action-btn.revert:hover {
          border-color: var(--error);
          color: var(--error);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .instructions-section {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          margin-top: 1.5rem;
        }

        .instructions-section h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 1rem;
        }

        .instructions-section p {
          color: var(--body);
          background: var(--ink3);
          padding: 1rem;
          border-radius: 8px;
        }
      `}</style>
    </>
  )
}
