'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function BrowsePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userMemberships, setUserMemberships] = useState([])
  const [joiningPool, setJoiningPool] = useState(null)
  const [showTeamNameModal, setShowTeamNameModal] = useState(false)
  const [pendingPoolId, setPendingPoolId] = useState(null)
  const [teamNameInput, setTeamNameInput] = useState('')
  const [previewPool, setPreviewPool] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    // Check if user is logged in
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    // Load public pools with members and commissioner
    const { data: publicPools, error } = await supabase
      .from('pools')
      .select(`
        *,
        pool_members(id, team_name, user_id),
        commissioner:profiles!pools_commissioner_id_fkey(id, name, display_name)
      `)
      .eq('visibility', 'public')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (publicPools) {
      // Get member names for each pool
      const poolsWithMembers = await Promise.all(publicPools.map(async (p) => {
        const memberList = p.pool_members || []
        
        // Get commissioner name
        const commName = p.commissioner?.name || p.commissioner?.display_name || 'Unknown'
        
        // Get profile names for all members
        const membersWithNames = await Promise.all(memberList.map(async (m) => {
          // Fetch profile name for this member
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, display_name')
            .eq('id', m.user_id)
            .single()
          
          const realName = profile?.name || profile?.display_name || 'Unknown'
          const displayName = m.team_name || realName
          
          return { 
            id: m.id, 
            name: displayName,
            realName: realName,
            isCommissioner: m.user_id === p.commissioner_id
          }
        }))

        return {
          ...p,
          player_count: memberList.length,
          members: membersWithNames,
          commissionerName: commName
        }
      }))
      
      setPools(poolsWithMembers)
    }

    // Load user's memberships if logged in
    if (currentUser) {
      const { data: memberships } = await supabase
        .from('pool_members')
        .select('pool_id')
        .eq('user_id', currentUser.id)

      if (memberships) {
        setUserMemberships(memberships.map(m => m.pool_id))
      }
    }

    setLoading(false)
  }

  const handleJoin = async (poolId) => {
    if (!user) {
      router.push('/login')
      return
    }

    // Show team name modal
    setPendingPoolId(poolId)
    setTeamNameInput('')
    setShowTeamNameModal(true)
  }

  const confirmJoin = async () => {
    if (!pendingPoolId) return

    setJoiningPool(pendingPoolId)
    setShowTeamNameModal(false)
    
    try {
      const { error } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pendingPoolId,
          user_id: user.id,
          role: 'player',
          payment_status: 'pending',
          total_points: 0,
          team_name: teamNameInput.trim() || null
        })

      if (error) throw error

      setUserMemberships([...userMemberships, pendingPoolId])
      router.push(`/pool/${pendingPoolId}`)
    } catch (err) {
      console.error('Error joining pool:', err)
      alert('Failed to join pool: ' + err.message)
    } finally {
      setJoiningPool(null)
      setPendingPoolId(null)
    }
  }

  const filteredPools = pools.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const isJoined = (poolId) => userMemberships.includes(poolId)

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/" className="nav-item">Home</Link>
          <Link href="/dashboard" className="nav-item">My Pools</Link>
          <Link href="/browse" className="nav-item active">Browse</Link>
          <Link href="/results" className="nav-item">Scores</Link>
          <Link href="/profile" className="nav-item">Profile</Link>
        </div>
        <div className="nav-right">
          {user ? (
            <Link href="/dashboard" className="nav-cta">My Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/register" className="nav-cta">Create Account</Link>
            </>
          )}
        </div>
      </nav>

      <div className="browse-page">
        <div className="page-header-browse">
          <div>
            <div className="ph-title">Browse Public Pools</div>
            <div className="ph-sub">Find and join open prediction pools for World Cup 2026</div>
          </div>
          <Link href="/create" className="nav-cta-lg">+ Create Pool</Link>
        </div>

        <div className="filters">
          <input 
            className="filter-search" 
            type="text" 
            placeholder="Search pool name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="filter-select">
            <option value="">All tournaments</option>
            <option value="wc2026">World Cup 2026</option>
          </select>
          <select className="filter-select">
            <option value="">All buy-ins</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-state">Loading pools...</div>
        ) : filteredPools.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <div className="empty-title">No public pools yet</div>
            <div className="empty-text">Be the first to create a public pool for World Cup 2026!</div>
            <Link href="/create" className="btn-primary">+ Create Pool</Link>
          </div>
        ) : (
          <div className="pools-table">
            <div className="pt-head">
              <div className="pt-col">Pool name</div>
              <div className="pt-col">Tournament</div>
              <div className="pt-col r">Players</div>
              <div className="pt-col r">Buy-in</div>
              <div className="pt-col">Status</div>
              <div className="pt-col"></div>
            </div>
            {filteredPools.map((p) => (
              <div key={p.id} className="pt-row-wrap">
                <div className="pt-row">
                  <div>
                    <div className="pt-name clickable" onClick={() => setPreviewPool(p)}>{p.name}</div>
                    <div className="pt-commissioner">
                      by {p.commissionerName} · {p.player_count} player{p.player_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="pt-tournament">FIFA World Cup</div>
                  <div className="pt-val r">{p.player_count}</div>
                  <div className={`pt-val r ${p.buy_in === 0 ? 'gold' : ''}`}>
                    {p.buy_in === 0 ? 'Free' : `$${p.buy_in}`}
                  </div>
                  <div className="pt-status">
                    <span className="status-dot dot-upcoming"></span>
                    <span style={{ color: 'var(--gold)' }}>
                      {p.status === 'open' ? 'Open' : 'Starting Jun 11'}
                    </span>
                  </div>
                  <div>
                    {isJoined(p.id) ? (
                      <Link href={`/pool/${p.id}`} className="btn-joined">✓ Joined</Link>
                    ) : (
                      <button 
                        className="btn-join-sm" 
                        onClick={() => handleJoin(p.id)}
                        disabled={joiningPool === p.id}
                      >
                        {joiningPool === p.id ? 'Joining...' : 'Join Pool'}
                      </button>
                    )}
                  </div>
                </div>
                {p.members && p.members.length > 0 && (
                  <div className="pt-members-row">
                    <span className="pt-members-label">Players:</span>
                    {p.members.map((m, i) => (
                      <span key={m.id} className="pt-member-tag">{m.name}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredPools.length > 0 && search && (
          <div className="browse-empty">
            {filteredPools.length} pool{filteredPools.length !== 1 ? 's' : ''} found. 
            <span onClick={() => setSearch('')}> Clear search</span>
          </div>
        )}
      </div>

      {/* Team Name Modal */}
      {showTeamNameModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Join Pool</h3>
            </div>
            <div className="modal-body">
              <label className="modal-label">Team Name (optional)</label>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g., The Golden Boots"
                value={teamNameInput}
                onChange={(e) => setTeamNameInput(e.target.value)}
                maxLength={30}
                autoFocus
              />
              <p className="modal-hint">Your display name on the leaderboard. You can change it later.</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowTeamNameModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={confirmJoin}>
                Join Pool
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pool Preview Modal */}
      {previewPool && (
        <div className="modal-overlay" onClick={() => setPreviewPool(null)}>
          <div className="modal-card preview-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{previewPool.name}</h3>
              <button className="modal-close" onClick={() => setPreviewPool(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="preview-section">
                <div className="preview-label">Commissioner</div>
                <div className="preview-value highlight">{previewPool.commissionerName}</div>
              </div>
              <div className="preview-section">
                <div className="preview-label">Entry Fee</div>
                <div className="preview-value">{previewPool.buy_in === 0 ? 'Free' : `$${previewPool.buy_in}`}</div>
              </div>
              <div className="preview-section">
                <div className="preview-label">Players ({previewPool.members?.length || 0})</div>
                <div className="preview-members">
                  {previewPool.members && previewPool.members.length > 0 ? (
                    previewPool.members.map((m, i) => (
                      <div key={i} className="preview-member">
                        <span className="pm-name">{m.name}</span>
                        {m.isCommissioner && <span className="pm-badge">Commissioner</span>}
                        {m.realName && m.realName !== m.name && <span className="pm-real">{m.realName}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="preview-empty">No players yet — be the first to join!</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setPreviewPool(null)}>
                Close
              </button>
              {!isJoined(previewPool.id) ? (
                <button className="modal-btn-confirm" onClick={() => {
                  setPreviewPool(null)
                  handleJoin(previewPool.id)
                }}>
                  Join Pool
                </button>
              ) : (
                <Link href={`/pool/${previewPool.id}`} className="modal-btn-confirm" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  View Pool
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
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
          text-decoration: none;
          margin-right: 2rem;
          padding-right: 2rem;
          border-right: 1px solid var(--f4);
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
          border-bottom: 3px solid transparent;
          margin-bottom: -3px;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
        .nav-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--f1); }
        .nav-cta {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.45rem 1.1rem;
          border-radius: 2px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .nav-cta:hover { background: var(--gold2); }

        .browse-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
        }
        .page-header-browse {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .ph-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: var(--white);
        }
        .ph-sub {
          font-size: 0.82rem;
          color: var(--f3);
          margin-top: 0.2rem;
        }
        .nav-cta-lg {
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
          transition: background 0.15s;
        }
        .nav-cta-lg:hover { background: var(--gold2); }

        .filters {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }
        .filter-search {
          background: var(--bg2);
          border: 1px solid var(--f4);
          color: var(--f1);
          padding: 0.4rem 0.85rem;
          border-radius: 3px;
          font-size: 0.82rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.15s;
          min-width: 220px;
        }
        .filter-search:focus { border-color: var(--gold); }
        .filter-search::placeholder { color: var(--f4); }
        .filter-select {
          background: var(--bg2);
          border: 1px solid var(--f4);
          color: var(--f2);
          padding: 0.4rem 0.75rem;
          border-radius: 3px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .filter-select:focus { border-color: var(--gold); }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: var(--f3);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .empty-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--white);
          margin-bottom: 0.5rem;
        }
        .empty-text {
          color: var(--f3);
          margin-bottom: 1.5rem;
        }
        .btn-primary {
          display: inline-block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.6rem 1.5rem;
          border-radius: 2px;
          text-decoration: none;
        }

        .pools-table {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 4px;
          overflow: hidden;
        }
        .pt-head {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.8fr 120px;
          gap: 0 1rem;
          padding: 0.5rem 1.25rem;
          border-bottom: 1px solid var(--line);
          background: var(--bg3);
        }
        .pt-col {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--f4);
        }
        .pt-col.r { text-align: right; }
        .pt-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.8fr 120px;
          gap: 0 1rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          align-items: center;
          transition: background 0.15s;
          cursor: pointer;
        }
        .pt-row:last-child { border-bottom: none; }
        .pt-row:hover { background: rgba(255,255,255,0.025); }
        .pt-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--f1);
        }
        .pt-name.clickable {
          cursor: pointer;
          transition: color 0.15s;
        }
        .pt-name.clickable:hover {
          color: var(--gold);
        }
        .pt-commissioner {
          font-size: 0.72rem;
          color: var(--f3);
          margin-top: 2px;
        }
        .pt-tournament {
          font-size: 0.78rem;
          color: var(--f2);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pt-flag img {
          width: 18px;
          height: 13px;
          border-radius: 1px;
          object-fit: cover;
        }
        .pt-val {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--f2);
        }
        .pt-val.r { text-align: right; }
        .pt-val.gold { color: var(--gold); }
        .pt-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .dot-live {
          background: var(--red);
          animation: pulse 1.4s ease infinite;
        }
        .dot-upcoming { background: var(--gold); }
        .btn-join-sm {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.35rem 0.85rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-join-sm:hover { background: var(--gold2); }
        .btn-join-sm:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-joined {
          display: inline-block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--green);
          border: 1px solid rgba(44,182,125,0.3);
          padding: 0.32rem 0.85rem;
          border-radius: 2px;
          text-decoration: none;
        }

        .browse-empty {
          text-align: center;
          padding: 1.5rem 0;
          font-size: 0.78rem;
          color: var(--f3);
        }
        .browse-empty span {
          color: var(--gold);
          cursor: pointer;
        }

        /* Pool row with members */
        .pt-row-wrap {
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .pt-row-wrap:last-child { border-bottom: none; }
        .pt-row-wrap .pt-row { border-bottom: none; }
        .pt-members-preview {
          color: var(--f4);
        }
        .pt-members-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0 1.25rem 0.75rem;
          align-items: center;
        }
        .pt-members-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--f4);
          margin-right: 0.25rem;
        }
        .pt-member-tag {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--f2);
          background: var(--bg3);
          padding: 0.2rem 0.5rem;
          border-radius: 2px;
          border: 1px solid var(--line);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-card {
          background: var(--bg2);
          border: 1px solid var(--line);
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          overflow: hidden;
        }
        .modal-header {
          background: var(--bg3);
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--line);
        }
        .modal-header h3 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--white);
          margin: 0;
        }
        .modal-body {
          padding: 1.25rem;
        }
        .modal-label {
          display: block;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--f3);
          margin-bottom: 0.5rem;
        }
        .modal-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg);
          border: 1px solid var(--f4);
          border-radius: 4px;
          color: var(--f1);
          font-size: 1rem;
        }
        .modal-input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .modal-hint {
          font-size: 0.75rem;
          color: var(--f4);
          margin-top: 0.5rem;
        }
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          padding: 1rem 1.25rem;
          background: var(--bg3);
          border-top: 1px solid var(--line);
        }
        .modal-btn-cancel {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: transparent;
          border: 1px solid var(--f4);
          color: var(--f3);
          padding: 0.6rem 1.25rem;
          border-radius: 3px;
          cursor: pointer;
        }
        .modal-btn-confirm {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: var(--gold);
          border: none;
          color: #000;
          padding: 0.6rem 1.25rem;
          border-radius: 3px;
          cursor: pointer;
        }

        /* Preview Modal */
        .preview-modal {
          max-width: 450px;
        }
        .modal-close {
          background: none;
          border: none;
          color: var(--f3);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }
        .modal-close:hover {
          color: var(--white);
        }
        .preview-modal .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .preview-section {
          margin-bottom: 1rem;
        }
        .preview-section:last-child {
          margin-bottom: 0;
        }
        .preview-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--f4);
          margin-bottom: 0.35rem;
        }
        .preview-value {
          font-size: 0.95rem;
          color: var(--f1);
        }
        .preview-value.highlight {
          color: var(--gold);
          font-weight: 600;
        }
        .preview-members {
          background: var(--bg);
          border-radius: 4px;
          max-height: 200px;
          overflow-y: auto;
        }
        .preview-member {
          padding: 0.6rem 0.8rem;
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .preview-member:last-child {
          border-bottom: none;
        }
        .pm-name {
          font-size: 0.85rem;
          color: var(--f1);
          font-weight: 500;
        }
        .pm-badge {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--gold);
          color: #000;
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
        }
        .pm-real {
          font-size: 0.72rem;
          color: var(--f4);
          margin-left: auto;
        }
        .preview-empty {
          padding: 1rem;
          text-align: center;
          color: var(--f4);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .browse-page { padding: 1rem; }
          .pt-head, .pt-row { grid-template-columns: 1fr auto 80px; }
          .pt-col:nth-child(n+3):not(:last-child),
          .pt-row > *:nth-child(n+3):not(:last-child) { display: none; }
          .filters { gap: 0.4rem; }
          .filter-search { min-width: 100%; order: -1; }
          .pools-table { border-radius: 0; border-left: none; border-right: none; }
          .page-header-browse { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
      `}</style>
    </>
  )
}
