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
    if (path === '/results') return pathname === '/results'
    if (path === '/') return pathname === '/'
    return false
  }

  return (
    <>
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
          .page-header { padding: 1rem; }
          .page-header-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>
    </>
  )
}
