'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../lib/supabase'

export default function BrowsePoolsPage() {
  const router = useRouter()
  const [pools, setPools] = useState([])
  const [filteredPools, setFilteredPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [userPools, setUserPools] = useState([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [tournamentFilter, setTournamentFilter] = useState('')
  const [buyInFilter, setBuyInFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Joining state
  const [joiningPool, setJoiningPool] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      // Get current user
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      // Get user's joined pools
      if (currentUser) {
        const { data: memberData } = await supabase
          .from('pool_members')
          .select('pool_id')
          .eq('user_id', currentUser.id)
        
        setUserPools(memberData?.map(m => m.pool_id) || [])
      }
      
      // Fetch public pools
      const { data: poolsData, error } = await supabase
        .from('pools')
        .select(`
          *,
          commissioner:profiles!pools_commissioner_id_fkey(id, first_name, last_name),
          tournaments(id, name, start_date, end_date),
          pool_members(user_id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (!error && poolsData) {
        setPools(poolsData)
        setFilteredPools(poolsData)
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    let result = [...pools]
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        `${p.commissioner?.first_name} ${p.commissioner?.last_name}`.toLowerCase().includes(q)
      )
    }
    
    // Tournament filter
    if (tournamentFilter) {
      result = result.filter(p => p.tournaments?.id === tournamentFilter)
    }
    
    // Buy-in filter
    if (buyInFilter === 'free') {
      result = result.filter(p => !p.buy_in || p.buy_in === 0)
    } else if (buyInFilter === 'paid') {
      result = result.filter(p => p.buy_in && p.buy_in > 0)
    }
    
    // Status filter
    if (statusFilter === 'open') {
      result = result.filter(p => p.status === 'open' || !p.status)
    } else if (statusFilter === 'live') {
      result = result.filter(p => p.status === 'live')
    }
    
    setFilteredPools(result)
  }, [searchQuery, tournamentFilter, buyInFilter, statusFilter, pools])

  const handleJoinPool = async (pool) => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/join/${pool.invite_code}`)}`)
      return
    }
    
    setJoiningPool(pool.id)
    
    try {
      const { error } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: user.id,
          role: 'member'
        })
      
      if (error && !error.message.includes('duplicate')) throw error
      
      setUserPools([...userPools, pool.id])
    } catch (err) {
      console.error('Error joining pool:', err)
    } finally {
      setJoiningPool(null)
    }
  }

  const formatBuyIn = (amount) => {
    if (!amount || amount === 0) return 'Free'
    return `$${amount}`
  }

  const getPoolStatus = (pool) => {
    const now = new Date()
    const startDate = pool.tournaments?.start_date ? new Date(pool.tournaments.start_date) : null
    
    if (pool.status === 'live' || (startDate && now >= startDate)) {
      return { label: 'Live', isLive: true }
    }
    
    if (startDate) {
      return { 
        label: `Starting ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, 
        isLive: false 
      }
    }
    
    return { label: 'Open', isLive: false }
  }

  return (
    <div className="browse-page">
      {/* Header */}
      <div className="page-header-browse">
        <div>
          <div className="ph-title">Browse Public Pools</div>
          <div className="ph-sub">Find and join open prediction pools for World Cup 2026</div>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          className="filter-search"
          type="text"
          placeholder="Search pool name or commissioner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="filter-select"
          value={tournamentFilter}
          onChange={(e) => setTournamentFilter(e.target.value)}
        >
          <option value="">All tournaments</option>
          <option value="wc2026">World Cup 2026</option>
        </select>
        <select 
          className="filter-select"
          value={buyInFilter}
          onChange={(e) => setBuyInFilter(e.target.value)}
        >
          <option value="">All buy-ins</option>
          <option value="free">Free only</option>
          <option value="paid">Paid only</option>
        </select>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Any status</option>
          <option value="open">Open to join</option>
          <option value="live">Live now</option>
        </select>
      </div>

      {/* Pools Table */}
      <div className="pools-table">
        <div className="pt-head">
          <div className="pt-col">Pool name</div>
          <div className="pt-col">Tournament</div>
          <div className="pt-col r">Players</div>
          <div className="pt-col r">Buy-in</div>
          <div className="pt-col">Status</div>
          <div className="pt-col"></div>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading pools...</div>
        ) : filteredPools.length === 0 ? (
          <div className="empty-state">
            No pools match your search.{' '}
            <span className="clear-filters" onClick={() => {
              setSearchQuery('')
              setTournamentFilter('')
              setBuyInFilter('')
              setStatusFilter('')
            }}>Clear filters</span>
          </div>
        ) : (
          <div className="pools-list">
            {filteredPools.map(pool => {
              const status = getPoolStatus(pool)
              const isJoined = userPools.includes(pool.id)
              const memberCount = pool.pool_members?.length || 0
              
              return (
                <div key={pool.id} className="pt-row" onClick={() => router.push(`/pool/${pool.id}`)}>
                  <div>
                    <div className="pt-name">{pool.name}</div>
                    <div className="pt-commissioner">
                      by {pool.commissioner?.first_name} {pool.commissioner?.last_name?.[0]}.
                      {pool.max_members && ` · ${memberCount}/${pool.max_members} players`}
                    </div>
                  </div>
                  <div className="pt-tournament">
                    <div className="pt-flag">
                      <img src="https://flagcdn.com/w40/un.png" alt="WC26" />
                    </div>
                    {pool.tournaments?.name || 'WC 2026'}
                  </div>
                  <div className="pt-val r">{memberCount}</div>
                  <div className={`pt-val r ${!pool.buy_in || pool.buy_in === 0 ? 'gold' : ''}`}>
                    {formatBuyIn(pool.buy_in)}
                  </div>
                  <div className="pt-status">
                    <span className={`status-dot ${status.isLive ? 'dot-live' : 'dot-upcoming'}`}></span>
                    <span style={{ color: status.isLive ? 'var(--red)' : 'var(--gold)' }}>{status.label}</span>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {isJoined ? (
                      <span className="btn-joined">✓ Joined</span>
                    ) : (
                      <button 
                        className="btn-join-sm" 
                        onClick={() => handleJoinPool(pool)}
                        disabled={joiningPool === pool.id}
                      >
                        {joiningPool === pool.id ? 'Joining...' : 'Join Pool'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .browse-page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          background: var(--bg);
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
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }

        .nav-cta:hover {
          background: var(--gold2);
        }

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

        .filter-search:focus {
          border-color: var(--gold);
        }

        .filter-search::placeholder {
          color: var(--f4);
        }

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

        .filter-select:focus {
          border-color: var(--gold);
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

        .pt-col.r {
          text-align: right;
        }

        .pt-row {
          display: grid;
          grid-template-columns: 2fr 1.2fr 0.8fr 0.8fr 0.8fr 120px;
          gap: 0 1rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          align-items: center;
          transition: background 0.15s;
          cursor: pointer;
        }

        .pt-row:last-child {
          border-bottom: none;
        }

        .pt-row:hover {
          background: rgba(255, 255, 255, 0.025);
        }

        .pt-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--f1);
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

        .pt-val.r {
          text-align: right;
        }

        .pt-val.gold {
          color: var(--gold);
        }

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

        .dot-upcoming {
          background: var(--gold);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

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

        .btn-join-sm:hover {
          background: var(--gold2);
        }

        .btn-join-sm:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-joined {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: transparent;
          color: var(--green);
          border: 1px solid rgba(44, 182, 125, 0.3);
          padding: 0.32rem 0.85rem;
          border-radius: 2px;
          cursor: default;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 2rem;
          font-size: 0.85rem;
          color: var(--f3);
        }

        .clear-filters {
          color: var(--gold);
          cursor: pointer;
        }

        .clear-filters:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .browse-page {
            padding: 1rem;
          }

          .page-header-browse {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .pt-head,
          .pt-row {
            grid-template-columns: 1fr auto 80px;
          }

          .pt-col:nth-child(n+3):not(:last-child),
          .pt-val:nth-child(n+3):not(:last-child),
          .pt-tournament,
          .pt-status {
            display: none;
          }

          .filters {
            gap: 0.4rem;
          }

          .filter-search {
            min-width: 100%;
            order: -1;
          }

          .pools-table {
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>
    </div>
  )
}
