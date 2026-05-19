'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    
    // Fetch user's pools
    const { data: memberships } = await supabase
      .from('pool_members')
      .select(`
        pool_id,
        role,
        pools:pool_id (
          id,
          name,
          buy_in,
          status,
          created_at
        )
      `)
      .eq('user_id', user.id)
    
    if (memberships) {
      // Get member counts for each pool
      const poolsWithCounts = await Promise.all(
        memberships.map(async (m) => {
          const { count } = await supabase
            .from('pool_members')
            .select('*', { count: 'exact', head: true })
            .eq('pool_id', m.pool_id)
          
          return {
            ...m.pools,
            role: m.role,
            playerCount: count || 0,
            prizePool: (m.pools?.buy_in || 0) * (count || 0) * 0.95,
          }
        })
      )
      setPools(poolsWithCounts.filter(p => p.id))
    }
    
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
        <p>Loading...</p>
        <style jsx>{`
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
          p {
            color: var(--muted);
            margin-top: 1rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      {/* Dashboard Nav */}
      <nav className="dashboard-nav">
        <Link href="/" className="logo">Poolr</Link>
        <div className="nav-right">
          <span className="user-name">{user?.user_metadata?.name || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Sign out</button>
        </div>
      </nav>

      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>My Pools</h1>
            <p>Manage your prediction pools</p>
          </div>
          <Link href="/create" className="btn-gold">
            <i className="ti ti-plus"></i> Create Pool
          </Link>
        </div>

        {pools.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h2>No pools yet</h2>
            <p>Create your first prediction pool or join one with an invite link.</p>
            <div className="empty-actions">
              <Link href="/create" className="btn-gold">Create a Pool</Link>
              <button className="btn-outline">Join with Code</button>
            </div>
          </div>
        ) : (
          <div className="pools-grid">
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .dashboard-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-name {
          color: var(--body);
          font-size: 0.85rem;
        }

        .logout-btn {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--body);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          border-color: var(--error);
          color: var(--error);
        }

        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--silk);
        }

        .dashboard-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        .empty-state h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: var(--body);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .pools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
      `}</style>
    </>
  )
}

function PoolCard({ pool }) {
  return (
    <Link href={`/pool/${pool.id}`} className="pool-card">
      <div className="pool-card-header">
        <h3>{pool.name}</h3>
        <span className="pool-status">{pool.status}</span>
      </div>
      <div className="pool-card-meta">
        <span>{pool.playerCount} players</span>
        <span>${pool.buyIn} buy-in</span>
      </div>
      <div className="pool-card-footer">
        <span className="your-rank">Your rank: #{pool.yourRank || '—'}</span>
        <span className="prize-pool">${pool.prizePool} pot</span>
      </div>

      <style jsx>{`
        .pool-card {
          display: block;
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .pool-card:hover {
          border-color: var(--gold);
          transform: translateY(-2px);
        }

        .pool-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .pool-card-header h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 500;
          color: var(--silk);
        }

        .pool-status {
          font-size: 0.7rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(212, 175, 55, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
        }

        .pool-card-meta {
          display: flex;
          gap: 1rem;
          color: var(--body);
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .pool-card-footer {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border2);
        }

        .your-rank {
          color: var(--body);
          font-size: 0.85rem;
        }

        .prize-pool {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem;
          color: var(--gold2);
        }
      `}</style>
    </Link>
  )
}
