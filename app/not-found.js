'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-right">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" className="nav-cta">Create Account</Link>
        </div>
      </nav>

      <div className="error-page">
        <div className="auth-pitch">
          <div className="pitch-3d">
            <div className="pitch-surface"></div>
            <div className="pitch-lines"></div>
            <div className="pitch-circle"></div>
            <div className="pitch-glow"></div>
          </div>
        </div>

        <div className="error-card">
          <div className="error-num">404</div>
          <div className="error-title">Page not found</div>
          <div className="error-sub">
            The page you&apos;re looking for doesn&apos;t exist, or the pool invite link may have expired. Double-check the URL or head back home.
          </div>
          <div className="error-actions">
            <Link href="/" className="btn-err-primary">Go Home</Link>
            <Link href="/browse" className="btn-err-ghost">Browse Pools</Link>
          </div>
        </div>
      </div>

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
        }
        .nav-logo span { color: var(--gold); }
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

        .error-page {
          min-height: calc(100vh - 56px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }
        .auth-pitch {
          position: absolute;
          inset: 0;
          perspective: 700px;
          perspective-origin: 50% 10%;
          pointer-events: none;
          overflow: hidden;
        }
        .pitch-3d {
          position: absolute;
          bottom: -35%;
          left: 50%;
          transform: translateX(-50%) rotateX(64deg);
          width: 900px;
          height: 620px;
          animation: pitchFloat 9s ease-in-out infinite;
        }
        .pitch-surface {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, rgba(10,28,10,0.6) 0px, rgba(10,28,10,0.6) 38px, rgba(14,36,14,0.6) 38px, rgba(14,36,14,0.6) 76px);
          border: 2px solid rgba(255,255,255,0.06);
        }
        .pitch-lines {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%),
                      linear-gradient(0deg, transparent 49.4%, rgba(255,255,255,0.1) 49.4%, rgba(255,255,255,0.1) 50.6%, transparent 50.6%);
        }
        .pitch-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .pitch-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 40% at 50% 60%, rgba(201,168,76,0.05), transparent 70%);
        }

        .error-card {
          text-align: center;
          position: relative;
          z-index: 2;
          max-width: 480px;
        }
        .error-num {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(6rem, 18vw, 12rem);
          font-weight: 900;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 2px var(--gold);
          letter-spacing: -0.02em;
        }
        .error-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--white);
          margin-top: 0.5rem;
        }
        .error-sub {
          font-size: 0.9rem;
          color: var(--f3);
          line-height: 1.7;
          margin: 0.75rem auto 2rem;
          max-width: 340px;
        }
        .error-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-err-primary {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: var(--gold);
          color: #000;
          padding: 0.7rem 1.75rem;
          border-radius: 2px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-err-primary:hover { background: var(--gold2); }
        .btn-err-ghost {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          color: var(--f2);
          border: 1px solid var(--f4);
          padding: 0.68rem 1.5rem;
          border-radius: 2px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.15s;
        }
        .btn-err-ghost:hover { border-color: var(--f2); color: var(--white); }

        @keyframes pitchFloat {
          0%, 100% { transform: translateX(-50%) rotateX(64deg) translateY(0); }
          50% { transform: translateX(-50%) rotateX(64deg) translateY(-14px); }
        }

        @media (max-width: 640px) {
          nav { padding: 0 1rem; }
          .nav-logo { font-size: 1.6rem; }
          .nav-link { display: none; }
        }
      `}</style>
    </>
  )
}
