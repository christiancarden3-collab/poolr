'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Navbar({ user, showBack, backHref, backLabel }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        {showBack ? (
          <Link href={backHref || '/dashboard'} className="back-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {backLabel || 'Back'}
          </Link>
        ) : null}
      </div>
      
      <Link href="/dashboard" className="nav-logo">
        Pool<span>r</span>
      </Link>
      
      <div className="nav-right">
        {user && (
          <>
            <div className="user-info">
              <div className="user-avatar">
                {user.user_metadata?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="user-name">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.25rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-default);
          position: sticky;
          top: 0;
          z-index: 200;
        }

        .nav-left, .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 180px;
        }

        .nav-right {
          justify-content: flex-end;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          text-decoration: none;
          padding: 0.375rem 0.5rem;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .back-btn:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-logo {
          font-family: 'Inter', sans-serif;
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-decoration: none;
        }

        .nav-logo span {
          color: var(--accent-green);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--accent-green);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8125rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }

        .user-name {
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid var(--border-light);
          border-radius: 6px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .logout-btn:hover {
          border-color: var(--accent-red);
          color: var(--accent-red);
        }

        @media (max-width: 640px) {
          .user-name {
            display: none;
          }
          
          .nav-left, .nav-right {
            min-width: auto;
          }
        }
      `}</style>
    </nav>
  )
}
