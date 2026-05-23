'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AppShell({ user, children, pageTitle, pageEyebrow, pageMeta, showCreate = true, showPageHeader = true }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const meta = user.user_metadata || {}
    const first = meta.first_name?.[0] || user.email?.[0] || 'U'
    const last = meta.last_name?.[0] || ''
    return (first + last).toUpperCase()
  }

  const getUserName = () => {
    if (!user) return 'User'
    const meta = user.user_metadata || {}
    if (meta.first_name) return `${meta.first_name} ${meta.last_name?.[0] || ''}.`
    return user.email?.split('@')[0] || 'User'
  }

  const isActive = (path) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/pool/')
    if (path === '/browse') return pathname === '/browse'
    if (path === '/profile') return pathname === '/profile'
    if (path === '/scores') return pathname === '/scores'
    if (path === '/') return pathname === '/'
    return false
  }

  return (
    <>
      {/* TOPBAR - Only show if logged in */}
      {user && (
        <div className="topbar">
          <div className="topbar-links">
            <Link href="/dashboard" className={`tb-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
            <Link href="/browse" className={`tb-link ${isActive('/browse') ? 'active' : ''}`}>Browse Pools</Link>
            <Link href="/scores" className={`tb-link ${isActive('/scores') ? 'active' : ''}`}>Scores</Link>
          </div>
          <div className="topbar-right">
            <Link href="/profile" className="user-pill">
              <div className="user-avatar">{getUserInitials()}</div>
              {getUserName()}
            </Link>
            <button className="signout-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="main-nav">
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>Home</Link>
          <Link href="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>My Pools</Link>
          <Link href="/browse" className={`nav-item ${isActive('/browse') ? 'active' : ''}`}>Browse</Link>
          <Link href="/scores" className={`nav-item ${isActive('/scores') ? 'active' : ''}`}>Scores</Link>
        </div>
        <div className="nav-right-section">
          {user ? (
            showCreate && <Link href="/create" className="nav-cta">+ Create Pool</Link>
          ) : (
            <>
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/register" className="nav-cta">Create Account</Link>
            </>
          )}
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-label">World Cup 2026</div>
        <div className="ticker-items">
          <span className="ticker-item">48 Teams</span>
          <span className="ticker-item">104 Matches</span>
          <span className="ticker-item">16 Host Cities</span>
          <span className="ticker-item">USA · Canada · Mexico</span>
          <span className="ticker-item">Kicks off June 11, 2026</span>
        </div>
      </div>

      {/* PAGE HEADER (optional) */}
      {showPageHeader && pageTitle && (
        <div className="page-header">
          <div className="page-header-inner">
            <div className="ph-left">
              {pageEyebrow && <div className="ph-eyebrow">{pageEyebrow}</div>}
              <div className="ph-title">{pageTitle}</div>
              {pageMeta && <div className="ph-meta">{pageMeta}</div>}
            </div>
            {showCreate && (
              <div className="ph-right">
                <Link href="/create" className="btn-primary">+ Create Pool</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {children}

      <style jsx>{`
        /* TOPBAR */
        .topbar {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          height: 42px;
        }
        .topbar-links {
          display: flex;
          height: 100%;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .user-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--f2);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s;
        }
        .user-pill:hover { color: var(--gold); }
        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 900;
          color: #000;
        }
        .signout-btn {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f4);
          background: transparent;
          border: 1px solid var(--f4);
          padding: 0.25rem 0.6rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .signout-btn:hover { color: var(--f2); border-color: var(--f2); }

        /* NAV */
        .main-nav {
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
        .nav-items {
          display: flex;
          height: 100%;
        }
        .nav-right-section {
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
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.5rem 1.25rem;
          border-radius: 2px;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: background 0.15s;
        }
        .nav-cta:hover { background: var(--gold2); }

        /* TICKER */
        .ticker {
          background: var(--gold);
          padding: 0 2rem;
          height: 30px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          overflow: hidden;
        }
        .ticker-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.7rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
          border-right: 1px solid rgba(0,0,0,0.2);
          padding-right: 1.5rem;
        }
        .ticker-items {
          display: flex;
          gap: 2rem;
        }
        .ticker-item {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #000;
          white-space: nowrap;
        }

        /* PAGE HEADER */
        .page-header {
          background: var(--bg2);
          border-bottom: 1px solid var(--line);
          padding: 1.25rem 2rem;
        }
        .page-header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
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
        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.6rem 1.5rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: var(--gold2); }

        @media (max-width: 768px) {
          .topbar { display: none; }
          .main-nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
          .nav-items { display: none; }
          .ticker { padding: 0 1rem; gap: 1rem; }
          .ticker-items { gap: 1rem; }
          .page-header { padding: 1rem; }
          .page-header-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>

      <style jsx global>{`
        .tb-link {
          display: flex;
          align-items: center;
          padding: 0 1rem;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          border-right: 1px solid var(--line);
          cursor: pointer;
          transition: all 0.15s;
        }
        .tb-link:first-child { border-left: 1px solid var(--line); }
        .tb-link:hover, .tb-link.active {
          color: var(--f1);
          background: rgba(255,255,255,0.03);
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
          cursor: pointer;
          transition: all 0.15s;
        }
        .nav-item:hover { color: var(--f1); }
        .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
      `}</style>
    </>
  )
}
