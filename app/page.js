'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--bg4:#1e2330;
          --gold:#c9a84c;--gold2:#e6c76a;--red:#e03b3b;--green:#2cb67d;
          --white:#ffffff;--f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;
          --line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3);
        }
        body{background:var(--bg);color:var(--f1);font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
      `}</style>

      <style jsx>{`
        .topbar{background:var(--bg2);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:42px}
        .topbar-links{display:flex;gap:0;height:100%}
        .topbar-link{display:flex;align-items:center;padding:0 1rem;font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none;border-right:1px solid var(--line);transition:color 0.15s,background 0.15s}
        .topbar-link:first-child{border-left:1px solid var(--line)}
        .topbar-link:hover{color:var(--f1);background:rgba(255,255,255,0.04)}
        .topbar-right{display:flex;align-items:center;gap:1rem}
        .lang-toggle{display:flex;border:1px solid var(--f4);border-radius:2px;overflow:hidden}
        .lang-btn{padding:0.2rem 0.6rem;font-size:0.72rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;background:transparent;border:none;color:var(--f1);cursor:pointer;font-family:'Inter',sans-serif;transition:background 0.15s}
        .lang-btn.active{background:var(--gold);color:#000}
        .topbar-signin{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f2);text-decoration:none;padding:0.25rem 0.75rem;border:1px solid var(--f4);border-radius:2px;transition:all 0.15s}
        .topbar-signin:hover{border-color:var(--gold);color:var(--gold)}

        nav{background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:56px;gap:0;position:sticky;top:0;z-index:200}
        .nav-logo{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;letter-spacing:0.04em;color:var(--white);text-transform:uppercase;margin-right:2rem;padding-right:2rem;border-right:1px solid var(--f4)}
        .nav-logo span{color:var(--gold)}
        .nav-items{display:flex;height:100%}
        .nav-item{display:flex;align-items:center;padding:0 1.25rem;font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none;border-bottom:3px solid transparent;margin-bottom:-3px;transition:color 0.15s,border-color 0.15s}
        .nav-item:hover{color:var(--f1);border-bottom-color:var(--f4)}
        .nav-item.active{color:var(--white);border-bottom-color:var(--gold)}
        .nav-cta{margin-left:auto;font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.5rem 1.25rem;border-radius:2px;text-decoration:none;transition:background 0.15s}
        .nav-cta:hover{background:var(--gold2)}

        .ticker{background:var(--gold);padding:0 2rem;height:30px;display:flex;align-items:center;gap:1.5rem;overflow:hidden}
        .ticker-label{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#000;white-space:nowrap;border-right:1px solid rgba(0,0,0,0.2);padding-right:1.5rem}
        .ticker-items{display:flex;gap:2rem;white-space:nowrap}
        .ticker-item{font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:#000}

        .hero{position:relative;overflow:hidden;min-height:480px;display:flex;align-items:stretch;border-bottom:1px solid var(--line)}
        .pitch-wrap{position:absolute;inset:0;perspective:700px;perspective-origin:50% 10%;pointer-events:none;overflow:hidden}
        .pitch-3d{position:absolute;bottom:-30%;left:50%;transform:translateX(-50%) rotateX(62deg);width:900px;height:620px;animation:pitchFloat 9s ease-in-out infinite;transform-style:preserve-3d}
        .pitch-surface{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(10,28,10,0.75) 0px,rgba(10,28,10,0.75) 38px,rgba(14,36,14,0.75) 38px,rgba(14,36,14,0.75) 76px);border:2px solid rgba(255,255,255,0.08)}
        .pitch-lines{position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.4%,rgba(255,255,255,0.12) 49.4%,rgba(255,255,255,0.12) 50.6%,transparent 50.6%),linear-gradient(0deg,transparent 49.4%,rgba(255,255,255,0.12) 49.4%,rgba(255,255,255,0.12) 50.6%,transparent 50.6%)}
        .pitch-circle{position:absolute;top:50%;left:50%;width:200px;height:200px;border:1.5px solid rgba(255,255,255,0.12);border-radius:50%;transform:translate(-50%,-50%)}
        .pitch-box{position:absolute;top:10%;left:50%;width:280px;height:100px;border:1.5px solid rgba(255,255,255,0.1);transform:translateX(-50%)}
        .pitch-box2{position:absolute;bottom:10%;left:50%;width:280px;height:100px;border:1.5px solid rgba(255,255,255,0.1);transform:translateX(-50%)}
        .pitch-glow{position:absolute;inset:0;background:radial-gradient(ellipse 70% 40% at 50% 60%,rgba(201,168,76,0.06),transparent 70%)}
        .pitch-fade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,12,16,0.15) 0%,rgba(10,12,16,0.0) 40%,rgba(10,12,16,0.5) 100%)}

        .hero-inner{position:relative;z-index:2;max-width:1200px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0 2rem}
        .hero-left{padding:3rem 3rem 3rem 0;border-right:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;justify-content:center}
        .hero-right{padding:3rem 0 3rem 3rem;display:flex;flex-direction:column;gap:1rem}
        .hero-tag{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--gold);margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem}
        .hero-tag::before{content:'';display:block;width:24px;height:2px;background:var(--gold)}
        .hero-h1{font-family:'Barlow Condensed',sans-serif;font-size:clamp(4rem,8vw,7rem);font-weight:900;line-height:0.88;text-transform:uppercase;letter-spacing:-0.01em;color:var(--white)}
        .hero-h1 .acc{color:var(--gold)}
        .hero-h1 .out{color:transparent;-webkit-text-stroke:2px var(--white)}
        .hero-sub{font-size:0.95rem;font-weight:300;color:var(--f2);line-height:1.7;max-width:380px;margin-top:1.25rem}
        .hero-btns{display:flex;gap:0.75rem;margin-top:2rem;align-items:center}
        .btn-primary{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.7rem 1.75rem;border-radius:2px;text-decoration:none;transition:background 0.15s;display:inline-block}
        .btn-primary:hover{background:var(--gold2)}
        .btn-secondary{font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;background:transparent;color:var(--f2);padding:0.7rem 1.5rem;border-radius:2px;text-decoration:none;border:1px solid var(--f4);transition:all 0.15s;display:inline-block}
        .btn-secondary:hover{border-color:var(--f2);color:var(--white)}
        .stat-row{display:flex;gap:0;margin-top:2.5rem;border-top:1px solid var(--line);padding-top:1.5rem}
        .stat-pill{padding-right:2rem}
        .stat-pill+.stat-pill{padding-left:2rem;border-left:1px solid var(--line)}
        .stat-num{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:var(--white);line-height:1}
        .stat-label{font-size:0.7rem;color:var(--f3);letter-spacing:0.06em;text-transform:uppercase;margin-top:2px}

        .match-panel{background:rgba(17,19,24,0.92);border:1px solid var(--line);border-radius:4px;overflow:hidden;backdrop-filter:blur(8px)}
        .mp-header{background:rgba(24,28,36,0.95);padding:0.6rem 1rem;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}
        .mp-title{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f3)}
        .mp-live{display:flex;align-items:center;gap:5px;font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--red)}
        .live-dot{width:6px;height:6px;border-radius:50%;background:var(--red);animation:pulse 1.4s ease infinite}
        .match-row{display:grid;grid-template-columns:1fr 40px 60px 40px 1fr;align-items:center;gap:0 8px;padding:0.85rem 1rem;border-bottom:1px solid var(--line)}
        .match-row:last-child{border-bottom:none}
        .t-name{font-size:0.82rem;font-weight:500;color:var(--f1)}
        .t-name.home{text-align:right}.t-name.away{text-align:left}
        .t-flag{display:flex;justify-content:center}
        .t-flag img{width:30px;height:21px;border-radius:2px;object-fit:cover;border:1px solid rgba(255,255,255,0.1)}
        .score-col{text-align:center}
        .score-main{font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;font-weight:800;color:var(--gold);display:flex;align-items:center;justify-content:center;gap:4px;line-height:1}
        .score-main.ft{color:var(--f2)}
        .score-main span{min-width:18px;text-align:center}
        .score-divider{color:var(--f4);font-size:1rem;margin:0 2px}
        .score-status{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2px}
        .status-live{color:var(--red)}.status-ft{color:var(--f4)}

        .lb-panel{background:rgba(17,19,24,0.92);border:1px solid var(--line);border-radius:4px;overflow:hidden;backdrop-filter:blur(8px)}
        .lb-head{background:rgba(24,28,36,0.95);padding:0.6rem 1rem;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between}
        .lb-head-title{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f3)}
        .lb-head-link{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold);text-decoration:none}
        .lb-cols{display:grid;grid-template-columns:36px 1fr 56px 44px;padding:0.35rem 1rem;border-bottom:1px solid var(--line)}
        .lb-col-label{font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--f4)}
        .lb-col-label.right{text-align:right}
        .lb-entry{display:grid;grid-template-columns:36px 1fr 56px 44px;align-items:center;padding:0.5rem 1rem;border-bottom:1px solid rgba(255,255,255,0.04);transition:background 0.15s}
        .lb-entry:last-child{border-bottom:none}
        .lb-entry:hover{background:rgba(255,255,255,0.03)}
        .lb-rank{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:800;color:var(--f3);text-align:center}
        .lb-rank.gold{color:var(--gold)}
        .lb-name{font-size:0.82rem;font-weight:500;color:var(--f1);display:flex;align-items:center;gap:6px}
        .lb-paid{width:6px;height:6px;border-radius:50%;background:var(--green);display:inline-block;flex-shrink:0}
        .lb-pts{font-family:'Barlow Condensed',sans-serif;font-size:0.95rem;font-weight:700;color:var(--f1);text-align:right}
        .lb-mv{font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;font-weight:700;text-align:right}
        .mv-up{color:var(--green)}.mv-dn{color:var(--red)}.mv-flat{color:var(--f4)}

        .content-wrap{max-width:1200px;margin:0 auto;padding:0 2rem}
        .three-col{display:grid;grid-template-columns:2fr 1fr;gap:0;border-bottom:1px solid var(--line)}
        .col-main{border-right:1px solid var(--line);padding:2.5rem 2.5rem 2.5rem 0}
        .col-side{padding:2.5rem 0 2.5rem 2.5rem}
        .section-head{display:flex;align-items:baseline;gap:0.75rem;border-bottom:2px solid var(--line);padding-bottom:0.6rem;margin-bottom:1.5rem}
        .section-head-title{font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--white)}
        .section-head-sub{font-size:0.75rem;color:var(--f3)}

        .feat-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:4px;overflow:hidden}
        .feat-card{background:var(--bg);padding:1.25rem 1.5rem;transition:background 0.15s}
        .feat-card:hover{background:var(--bg3)}
        .feat-card-icon{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:0.5rem;display:flex;align-items:center;gap:6px}
        .feat-card-icon::before{content:'';display:block;width:16px;height:1.5px;background:var(--gold)}
        .feat-card-name{font-size:0.9rem;font-weight:600;color:var(--white);margin-bottom:0.35rem}
        .feat-card-desc{font-size:0.78rem;color:var(--f3);line-height:1.6;font-weight:300}

        .scoring-table{width:100%;border-collapse:collapse;margin-top:0}
        .scoring-table th{font-family:'Barlow Condensed',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--f4);padding:0.4rem 0.75rem;text-align:left;border-bottom:1px solid var(--line)}
        .scoring-table th.right{text-align:right}
        .scoring-table td{font-size:0.8rem;color:var(--f2);padding:0.55rem 0.75rem;border-bottom:1px solid rgba(255,255,255,0.04)}
        .scoring-table td.pts{font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:800;color:var(--gold);text-align:right}
        .scoring-table tr:last-child td{border-bottom:none}
        .scoring-table tr:hover td{background:rgba(255,255,255,0.02)}
        .scoring-section-label{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--f4);padding:0.5rem 0.75rem;background:var(--bg3);border-bottom:1px solid var(--line);border-top:1px solid var(--line)}
        .scoring-wrap{border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:1.5rem}

        .steps-list{display:flex;flex-direction:column;gap:0}
        .step-item{display:grid;grid-template-columns:48px 1fr;gap:0 1rem;padding:1.25rem 0;border-bottom:1px solid var(--line);align-items:start}
        .step-item:last-child{border-bottom:none}
        .step-num{font-family:'Barlow Condensed',sans-serif;font-size:2.25rem;font-weight:900;color:var(--f4);line-height:1;padding-top:2px}
        .step-title{font-size:0.88rem;font-weight:600;color:var(--white);margin-bottom:0.25rem}
        .step-desc{font-size:0.78rem;color:var(--f3);line-height:1.6;font-weight:300}

        .price-box{background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:1.5rem}
        .price-box-head{padding:0.75rem 1.25rem;border-bottom:1px solid var(--line);background:var(--bg3)}
        .price-box-label{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--f3)}
        .price-box-body{padding:1.5rem 1.25rem}
        .price-amount{font-family:'Barlow Condensed',sans-serif;font-size:3.5rem;font-weight:900;color:var(--white);line-height:1}
        .price-period{font-size:0.78rem;color:var(--f3);margin-top:0.25rem}
        .price-divider{border:none;border-top:1px solid var(--line);margin:1.25rem 0}
        .price-item{display:flex;align-items:flex-start;gap:0.6rem;padding:0.4rem 0;font-size:0.78rem;color:var(--f2);line-height:1.5}
        .price-check{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
        .price-cta{display:block;text-align:center;margin-top:1.25rem;font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.7rem;border-radius:2px;text-decoration:none;transition:background 0.15s}
        .price-cta:hover{background:var(--gold2)}
        .price-note{font-size:0.7rem;color:var(--f4);text-align:center;margin-top:0.75rem;display:flex;align-items:center;justify-content:center;gap:0.35rem}

        footer{border-top:1px solid var(--line);padding:2rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;max-width:1200px;margin:0 auto}
        .footer-logo{font-family:'Barlow Condensed',sans-serif;font-size:1.4rem;font-weight:900;text-transform:uppercase;color:var(--white);letter-spacing:0.05em}
        .footer-logo span{color:var(--gold)}
        .footer-links{display:flex;gap:1.5rem;flex-wrap:wrap}
        .footer-links a{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none;transition:color 0.15s}
        .footer-links a:hover{color:var(--f1)}
        .footer-copy{width:100%;font-size:0.72rem;color:var(--f4);letter-spacing:0.02em}

        @keyframes pitchFloat{0%,100%{transform:translateX(-50%) rotateX(62deg) translateY(0)}50%{transform:translateX(-50%) rotateX(62deg) translateY(-14px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        
        @media (max-width: 900px) {
          .hero-inner{grid-template-columns:1fr}
          .hero-left{border-right:none;padding:2rem 0}
          .hero-right{padding:0 0 2rem 0}
          .three-col{grid-template-columns:1fr}
          .col-main{border-right:none;padding:2rem 0}
          .col-side{padding:2rem 0}
          .topbar-links{display:none}
          .nav-items{display:none}
        }
      `}</style>

      <div className="topbar">
        <div className="topbar-links">
          <a href="#how" className="topbar-link">How to Play</a>
          <a href="#scoring" className="topbar-link">Scoring</a>
          <a href="#pricing" className="topbar-link">Pricing</a>
        </div>
        <div className="topbar-right">
          <div className="lang-toggle">
            <button className="lang-btn active">EN</button>
            <button className="lang-btn">ES</button>
          </div>
          <Link href="/login" className="topbar-signin">Sign In</Link>
        </div>
      </div>

      <nav>
        <div className="nav-logo">Pick<span>Poolr</span></div>
        <div className="nav-items">
          <a href="#" className="nav-item active">Home</a>
          <Link href="/dashboard" className="nav-item">My Pools</Link>
          <a href="#" className="nav-item">World Cup 2026</a>
        </div>
        <Link href="/create" className="nav-cta">+ Create Pool</Link>
      </nav>

      <div className="ticker">
        <div className="ticker-label">Live</div>
        <div className="ticker-items">
          <span className="ticker-item">ARG 3 – 1 FRA • 78'</span>
          <span className="ticker-item">BRA 2 – 2 GER • 86'</span>
          <span className="ticker-item">MEX 1 – 0 POR • FT</span>
          <span className="ticker-item">ESP 0 – 0 NED • 34'</span>
          <span className="ticker-item">USA 1 – 2 JPN • HT</span>
        </div>
      </div>

      <div className="hero">
        <div className="pitch-wrap">
          <div className="pitch-3d">
            <div className="pitch-surface"></div>
            <div className="pitch-lines"></div>
            <div className="pitch-circle"></div>
            <div className="pitch-box"></div>
            <div className="pitch-box2"></div>
            <div className="pitch-glow"></div>
            <div className="pitch-fade"></div>
          </div>
        </div>

        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag">World Cup 2026 — USA · CAN · MEX</div>
            <h1 className="hero-h1">
              <span style={{display:'block'}}>Pick<span className="acc">poolr</span></span>
              <span style={{display:'block'}} className="out">Predict</span>
              <span style={{display:'block'}}>Win</span>
            </h1>
            <p className="hero-sub">Private prediction pools for friends, coworkers, and family. Score picks on every match, track the leaderboard, and split the pot.</p>
            <div className="hero-btns">
              <Link href="/create" className="btn-primary">Create a Pool</Link>
              <Link href="/login" className="btn-secondary">Sign In</Link>
            </div>
            <div className="stat-row">
              <div className="stat-pill"><div className="stat-num">104</div><div className="stat-label">Total matches</div></div>
              <div className="stat-pill"><div className="stat-num">Free</div><div className="stat-label">To join</div></div>
              <div className="stat-pill"><div className="stat-num">5%</div><div className="stat-label">Fee on paid pools</div></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="match-panel">
              <div className="mp-header">
                <div className="mp-title">Amigos WC26 — Round of 16</div>
                <div className="mp-live"><span className="live-dot"></span>Live</div>
              </div>
              <div className="match-row">
                <div className="t-name home">Argentina</div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/ar.png" alt="ARG" /></div>
                <div className="score-col">
                  <div className="score-status status-live">78'</div>
                  <div className="score-main"><span>3</span><span className="score-divider">–</span><span>1</span></div>
                </div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/fr.png" alt="FRA" /></div>
                <div className="t-name away">France</div>
              </div>
              <div className="match-row">
                <div className="t-name home">Brazil</div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/br.png" alt="BRA" /></div>
                <div className="score-col">
                  <div className="score-status status-live">86'</div>
                  <div className="score-main"><span>2</span><span className="score-divider">–</span><span>2</span></div>
                </div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/de.png" alt="GER" /></div>
                <div className="t-name away">Germany</div>
              </div>
              <div className="match-row">
                <div className="t-name home">Mexico</div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/mx.png" alt="MEX" /></div>
                <div className="score-col">
                  <div className="score-status status-ft">FT</div>
                  <div className="score-main ft"><span>1</span><span className="score-divider">–</span><span>0</span></div>
                </div>
                <div className="t-flag"><img src="https://flagcdn.com/w40/pt.png" alt="POR" /></div>
                <div className="t-name away">Portugal</div>
              </div>
            </div>

            <div className="lb-panel">
              <div className="lb-head">
                <div className="lb-head-title">Standings</div>
                <a href="#" className="lb-head-link">Full table →</a>
              </div>
              <div className="lb-cols">
                <div className="lb-col-label">#</div>
                <div className="lb-col-label">Player</div>
                <div className="lb-col-label right">Pts</div>
                <div className="lb-col-label right">+/-</div>
              </div>
              <div className="lb-entry"><div className="lb-rank gold">1</div><div className="lb-name">Carlos M.<span className="lb-paid"></span></div><div className="lb-pts">84</div><div className="lb-mv mv-up">+2</div></div>
              <div className="lb-entry"><div className="lb-rank">2</div><div className="lb-name">Ana R.<span className="lb-paid"></span></div><div className="lb-pts">79</div><div className="lb-mv mv-flat">—</div></div>
              <div className="lb-entry"><div className="lb-rank">3</div><div className="lb-name">Mike T.<span className="lb-paid"></span></div><div className="lb-pts">77</div><div className="lb-mv mv-dn">−1</div></div>
              <div className="lb-entry"><div className="lb-rank">4</div><div className="lb-name">Valentina S.</div><div className="lb-pts">72</div><div className="lb-mv mv-up">+3</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-wrap">
        <div className="three-col">
          <div className="col-main">
            <div className="section-head">
              <div className="section-head-title">Platform Features</div>
              <div className="section-head-sub">Everything you need to run a pool</div>
            </div>
            <div className="feat-grid">
              <div className="feat-card"><div className="feat-card-icon">Access</div><div className="feat-card-name">Private invite pools</div><p className="feat-card-desc">Share a unique link. Only your invitees can join — no public access, no strangers.</p></div>
              <div className="feat-card"><div className="feat-card-icon">Rankings</div><div className="feat-card-name">Live leaderboard</div><p className="feat-card-desc">Real-time standings with rank movement. Share a public link to your board.</p></div>
              <div className="feat-card"><div className="feat-card-icon">Picks</div><div className="feat-card-name">Match & special picks</div><p className="feat-card-desc">Predict every scoreline. Also pick champion, top scorer, and best goalkeeper.</p></div>
              <div className="feat-card"><div className="feat-card-icon">Payments</div><div className="feat-card-name">Stripe buy-ins</div><p className="feat-card-desc">Secure in-app payments via Stripe. Funds held in escrow until tournament ends.</p></div>
              <div className="feat-card"><div className="feat-card-icon">Scoring</div><div className="feat-card-name">Automatic scoring</div><p className="feat-card-desc">Points calculated instantly as results come in. No manual work for commissioners.</p></div>
              <div className="feat-card"><div className="feat-card-icon">Language</div><div className="feat-card-name">English & Spanish</div><p className="feat-card-desc">Full bilingual support. Every page in both languages, switchable instantly.</p></div>
            </div>

            <div className="section-head" style={{marginTop:'2.5rem'}} id="how">
              <div className="section-head-title">How to Play</div>
            </div>
            <div className="steps-list">
              <div className="step-item"><div className="step-num">01</div><div><div className="step-title">Create your pool</div><p className="step-desc">Choose a tournament, set your buy-in amount, define prize distribution, and configure payment settings. Takes under two minutes.</p></div></div>
              <div className="step-item"><div className="step-num">02</div><div><div className="step-title">Invite your group</div><p className="step-desc">Share your private invite link via WhatsApp, SMS, or email. Players sign up and pay their buy-in instantly through Stripe.</p></div></div>
              <div className="step-item"><div className="step-num">03</div><div><div className="step-title">Submit picks before kickoff</div><p className="step-desc">Predict scores for each matchday before the deadline. Also submit your special picks — champion, top scorer, and best goalkeeper — before the tournament starts.</p></div></div>
              <div className="step-item"><div className="step-num">04</div><div><div className="step-title">Watch the standings update live</div><p className="step-desc">Points are calculated automatically as results come in. Winners receive their payout via Stripe when the tournament ends.</p></div></div>
            </div>
          </div>

          <div className="col-side">
            <div className="section-head" id="scoring">
              <div className="section-head-title">Scoring</div>
            </div>

            <div className="scoring-wrap">
              <div className="scoring-section-label">Match picks</div>
              <table className="scoring-table">
                <thead><tr><th>Result</th><th className="right">Pts</th></tr></thead>
                <tbody>
                  <tr><td>Exact scoreline</td><td className="pts">3</td></tr>
                  <tr><td>Correct winner + one score right</td><td className="pts">2</td></tr>
                  <tr><td>Correct winner or draw only</td><td className="pts">1</td></tr>
                </tbody>
              </table>
              <div className="scoring-section-label">Knockout advancement</div>
              <table className="scoring-table">
                <tbody>
                  <tr><td>Round of 32</td><td className="pts">2</td></tr>
                  <tr><td>Round of 16</td><td className="pts">2</td></tr>
                  <tr><td>Quarter-final</td><td className="pts">3</td></tr>
                  <tr><td>Semi-final</td><td className="pts">4</td></tr>
                  <tr><td>Final</td><td className="pts">5</td></tr>
                </tbody>
              </table>
              <div className="scoring-section-label">Special picks</div>
              <table className="scoring-table">
                <tbody>
                  <tr><td>Champion</td><td className="pts">10</td></tr>
                  <tr><td>Runner-up</td><td className="pts">7</td></tr>
                  <tr><td>Top scorer</td><td className="pts">5</td></tr>
                  <tr><td>Best goalkeeper</td><td className="pts">5</td></tr>
                </tbody>
              </table>
            </div>

            <div className="section-head" style={{marginTop:'0.5rem'}} id="pricing">
              <div className="section-head-title">Pricing</div>
            </div>
            <div className="price-box">
              <div className="price-box-head"><div className="price-box-label">Standard plan</div></div>
              <div className="price-box-body">
                <div className="price-amount">Free</div>
                <div className="price-period">to create and play — always</div>
                <div className="price-divider"></div>
                <div className="price-item"><div className="price-check"></div><span>No subscription or monthly fee</span></div>
                <div className="price-item"><div className="price-check"></div><span>Unlimited pools and players</span></div>
                <div className="price-item"><div className="price-check"></div><span>Secure Stripe payments with escrow</span></div>
                <div className="price-item"><div className="price-check"></div><span>5% platform fee on paid pools only</span></div>
                <Link href="/create" className="price-cta">Create Your Pool</Link>
                <div className="price-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.5}}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Payments secured by Stripe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-logo">Pick<span>Poolr</span></div>
        <div className="footer-links">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="mailto:support@pickpoolr.com">Contact</a>
          <a href="#how">How to Play</a>
        </div>
        <p className="footer-copy">© 2026 PickPoolr. Not affiliated with FIFA. For entertainment purposes only.</p>
      </footer>
    </>
  )
}
