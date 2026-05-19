'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Translations
const translations = {
  en: {
    kicker: 'World Cup 2026 — Now Open',
    heroSub: 'Private prediction pools for the world\'s biggest tournament. Score picks, chase the leaderboard, split the pot.',
    startPool: 'Sign In',
    signUp: 'Create Account',
    howItWorks: 'See how it works',
    features: 'Features',
    pricing: 'Pricing',
    createPool: 'Sign In',
    platformFeatures: 'Platform features',
    everythingNeeds: 'Everything your pool needs',
    builtFor: 'Built for World Cup 2026. Works for any tournament. Clean, bilingual, built to last.',
    privateInvite: 'Private invite pools',
    privateInviteDesc: 'Share a unique link. Only invited players can join — no strangers, no spam.',
    liveLeaderboard: 'Live leaderboard',
    liveLeaderboardDesc: 'Real-time rankings with movement indicators. Share a public link to the board.',
    matchSpecial: 'Match & special picks',
    matchSpecialDesc: 'Predict every scoreline plus champion, top scorer, and best goalkeeper.',
    flexiblePayments: 'Flexible payments',
    flexiblePaymentsDesc: 'Stripe for in-app buy-ins, or track Venmo and Zelle manually.',
    smartScoring: 'Smart scoring',
    smartScoringDesc: 'Exact score earns 3 pts. Correct result earns 1. Special picks up to 10. Fully automatic.',
    engSpanish: 'English & Spanish',
    engSpanishDesc: 'Every page available in both languages. Switch anytime with one click.',
    process: 'Process',
    upRunning: 'Up and running in minutes',
    step1: 'Create your pool',
    step1Desc: 'Set name, buy-in, prize structure and tournament. Two minutes, no card required.',
    step2: 'Invite your crew',
    step2Desc: 'Share the invite link via WhatsApp, text, or email. Players join instantly.',
    step3: 'Submit picks',
    step3Desc: 'Everyone predicts before each matchday deadline. Picks lock automatically.',
    step4: 'Watch the board move',
    step4Desc: 'Points update with results. Track movement. Share the live leaderboard.',
    simpleFair: 'Simple, fair pricing',
    free: 'Free',
    toCreate: 'to create and play — always',
    noSubscription: 'No subscription or monthly fee',
    feeOnPaid: '5% fee on paid prize pools only — absorbed by pot or split among players',
    zeroPlatform: 'Zero platform fee for free pools with manual payment tracking',
    unlimited: 'Unlimited pools and unlimited players',
    createFirst: 'Create your first pool',
    securedStripe: 'Payments secured by Stripe',
    terms: 'Terms',
    privacy: 'Privacy',
    contact: 'Contact',
    poolName: 'Amigos WC26 Pool',
    poolMeta: 'Round of 16 · 14 players',
    prizePool: 'Prize pool',
    leaderboard: 'Leaderboard',
    viewAll: 'View all →',
    live: 'Live',
  },
  es: {
    kicker: 'Copa del Mundo 2026 — Disponible',
    heroSub: 'Pools privados de predicciones para el torneo más grande. Puntúa, sube en el marcador, divide el premio.',
    startPool: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    howItWorks: 'Cómo funciona',
    features: 'Funciones',
    pricing: 'Precios',
    createPool: 'Iniciar sesión',
    platformFeatures: 'Funciones de la plataforma',
    everythingNeeds: 'Todo lo que tu pool necesita',
    builtFor: 'Hecho para el Mundial 2026. Funciona para cualquier torneo. Limpio, bilingüe, duradero.',
    privateInvite: 'Pools por invitación',
    privateInviteDesc: 'Comparte un link único. Solo los invitados pueden unirse — sin extraños.',
    liveLeaderboard: 'Clasificación en vivo',
    liveLeaderboardDesc: 'Rankings en tiempo real con indicadores de movimiento.',
    matchSpecial: 'Picks de partidos y especiales',
    matchSpecialDesc: 'Predice cada marcador, campeón, goleador y portero.',
    flexiblePayments: 'Pagos flexibles',
    flexiblePaymentsDesc: 'Stripe para pagos en la app, o rastrea Venmo y Zelle manualmente.',
    smartScoring: 'Puntuación inteligente',
    smartScoringDesc: 'Marcador exacto: 3pts. Resultado: 1pt. Picks especiales hasta 10.',
    engSpanish: 'Inglés y Español',
    engSpanishDesc: 'Cada página disponible en ambos idiomas. Cambia en cualquier momento.',
    process: 'Proceso',
    upRunning: 'Listo en minutos',
    step1: 'Crea tu pool',
    step1Desc: 'Configura nombre, cuota, premios y torneo. Dos minutos, sin tarjeta.',
    step2: 'Invita a tu grupo',
    step2Desc: 'Comparte el link por WhatsApp, mensaje o correo. Unión instantánea.',
    step3: 'Envía tus picks',
    step3Desc: 'Todos predicen antes del cierre. Los picks se bloquean automáticamente.',
    step4: 'Mira la tabla moverse',
    step4Desc: 'Los puntos se actualizan. Sigue el movimiento. Comparte la tabla en vivo.',
    simpleFair: 'Precios simples y justos',
    free: 'Gratis',
    toCreate: 'para crear y jugar — siempre',
    noSubscription: 'Sin suscripción ni cuota mensual',
    feeOnPaid: '5% solo en pools con premio — absorbida por el bote o dividida entre jugadores',
    zeroPlatform: 'Sin comisión para pools gratuitos con seguimiento manual',
    unlimited: 'Pools y jugadores ilimitados',
    createFirst: 'Crea tu primer pool',
    securedStripe: 'Pagos protegidos por Stripe',
    terms: 'Términos',
    privacy: 'Privacidad',
    contact: 'Contacto',
    poolName: 'Pool Amigos MX26',
    poolMeta: 'Octavos de Final · 14 jugadores',
    prizePool: 'Premio',
    leaderboard: 'Clasificación',
    viewAll: 'Ver todos →',
    live: 'En vivo',
  }
}

export default function Home() {
  const [lang, setLang] = useState('en')
  const t = translations[lang]

  useEffect(() => {
    const saved = localStorage.getItem('poolr-lang')
    if (saved) setLang(saved)
  }, [])

  const switchLang = (newLang) => {
    setLang(newLang)
    localStorage.setItem('poolr-lang', newLang)
  }

  return (
    <>
      {/* NAV */}
      <nav>
        <div className="logo">Poolr</div>
        <div className="nav-links">
          <a href="#how-it-works">{t.howItWorks}</a>
          <a href="#features">{t.features}</a>
          <a href="#pricing">{t.pricing}</a>
          <div className="nav-lang">
            <button 
              className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
              onClick={() => switchLang('en')}
            >
              EN
            </button>
            <button 
              className={`lang-btn ${lang === 'es' ? 'active' : ''}`} 
              onClick={() => switchLang('es')}
            >
              ES
            </button>
          </div>
          <Link href="/login" className="nav-cta">{t.createPool}</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-canvas">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          <div className="pitch-3d">
            <div className="pitch-surface"></div>
            <div className="pitch-lines"></div>
            <div className="pitch-circle"></div>
            <div className="pitch-glow"></div>
          </div>
        </div>

        <div className="hero-kicker">{t.kicker}</div>

        <h1 className="hero-headline">
          <span className="line"><span className="pre">Pre</span><span className="dict">dict</span></span>
          <span className="compete">Compete</span>
          <span className="line win">Win</span>
        </h1>

        <p className="hero-sub">{t.heroSub}</p>

        <div className="hero-actions">
          <Link href="/login" className="btn-gold">{t.startPool}</Link>
          <Link href="/register" className="btn-outline">{t.signUp}</Link>
        </div>
      </section>

      {/* APP MOCKUP */}
      <div className="mockup-section">
        <div className="app-window">
          <div className="window-bar">
            <span className="dot dot-r"></span>
            <span className="dot dot-y"></span>
            <span className="dot dot-g"></span>
            <span className="window-url">poolr.app / pool / amigos-wc26</span>
          </div>

          <div className="pool-header">
            <div>
              <div className="pool-name">{t.poolName}</div>
              <div className="pool-meta">{t.poolMeta}</div>
            </div>
            <div>
              <div className="pot-amount">$280</div>
              <div className="pot-label">{t.prizePool}</div>
            </div>
          </div>

          <div className="match-list">
            <MatchRow 
              home="Argentina" homeFlag="ar" 
              away="France" awayFlag="fr" 
              homeScore="3" awayScore="1" 
              status={t.live} isLive={true}
            />
            <MatchRow 
              home="Brazil" homeFlag="br" 
              away="Germany" awayFlag="de" 
              homeScore="2" awayScore="2" 
              status="86'"
            />
            <MatchRow 
              home="Mexico" homeFlag="mx" 
              away="Portugal" awayFlag="pt" 
              homeScore="1" awayScore="0" 
              status="FT"
            />
          </div>

          <div className="lb-section">
            <div className="lb-header">
              <span className="lb-title">{t.leaderboard}</span>
              <span className="lb-viewall">{t.viewAll}</span>
            </div>
            <LeaderboardRow rank="1" name="Carlos M." pts="84" movement="+2" paid />
            <LeaderboardRow rank="2" name="Ana R." pts="79" movement="—" paid />
            <LeaderboardRow rank="3" name="Mike T." pts="77" movement="-1" paid />
            <LeaderboardRow rank="4" name="Valentina S." pts="72" movement="+3" />
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <hr className="divider" />
      <div className="section" id="features">
        <div className="section-eyebrow">{t.platformFeatures}</div>
        <h2 className="section-title">{t.everythingNeeds}</h2>
        <p className="section-sub">{t.builtFor}</p>
        <div className="features-grid">
          <Feature icon="lock" title={t.privateInvite} desc={t.privateInviteDesc} />
          <Feature icon="activity" title={t.liveLeaderboard} desc={t.liveLeaderboardDesc} />
          <Feature icon="trophy" title={t.matchSpecial} desc={t.matchSpecialDesc} />
          <Feature icon="credit-card" title={t.flexiblePayments} desc={t.flexiblePaymentsDesc} />
          <Feature icon="star" title={t.smartScoring} desc={t.smartScoringDesc} />
          <Feature icon="world" title={t.engSpanish} desc={t.engSpanishDesc} />
        </div>
      </div>

      {/* HOW IT WORKS */}
      <hr className="divider" />
      <div className="section" id="how-it-works">
        <div className="section-eyebrow">{t.process}</div>
        <h2 className="section-title">{t.upRunning}</h2>
        <div className="steps-row">
          <Step num="01" title={t.step1} desc={t.step1Desc} />
          <Step num="02" title={t.step2} desc={t.step2Desc} />
          <Step num="03" title={t.step3} desc={t.step3Desc} />
          <Step num="04" title={t.step4} desc={t.step4Desc} />
        </div>
      </div>

      {/* PRICING */}
      <hr className="divider" />
      <div className="pricing-wrap" id="pricing">
        <div className="section-eyebrow" style={{justifyContent: 'center'}}>{t.pricing}</div>
        <h2 className="section-title">{t.simpleFair}</h2>
        <div className="price-card">
          <div className="price-num">{t.free}</div>
          <div className="price-tag">{t.toCreate}</div>
          <hr className="price-divider" />
          <div className="price-features">
            <PriceFeature text={t.noSubscription} />
            <PriceFeature text={t.feeOnPaid} />
            <PriceFeature text={t.zeroPlatform} />
            <PriceFeature text={t.unlimited} />
          </div>
          <div style={{marginTop: '2.5rem'}}>
            <Link href="/login" className="btn-gold">{t.startPool}</Link>
          </div>
          <div className="stripe-note">
            <i className="ti ti-lock" aria-hidden="true"></i>
            <span>{t.securedStripe}</span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Poolr</div>
        <div className="footer-links">
          <Link href="/terms">{t.terms}</Link>
          <Link href="/privacy">{t.privacy}</Link>
          <Link href="/contact">{t.contact}</Link>
          <a href="#pricing">{t.pricing}</a>
        </div>
        <p className="footer-copy">© 2026 Poolr. Not affiliated with FIFA. For entertainment purposes only.</p>
      </footer>

      <style jsx>{`
        .hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem 3rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero-canvas {
          position: absolute;
          inset: 0;
          perspective: 900px;
          perspective-origin: 50% 40%;
        }

        .pitch-3d {
          position: absolute;
          bottom: -8%;
          left: 50%;
          transform: translateX(-50%) rotateX(58deg);
          width: 780px;
          height: 560px;
          transform-style: preserve-3d;
          animation: pitchFloat 8s ease-in-out infinite;
        }

        .pitch-surface {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            rgba(13,26,13,0.88) 0px, rgba(13,26,13,0.88) 36px,
            rgba(17,32,17,0.88) 36px, rgba(17,32,17,0.88) 72px
          );
          border: 2px solid rgba(255,255,255,0.10);
        }

        .pitch-lines {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, transparent 49.5%, rgba(255,255,255,0.15) 49.5%, rgba(255,255,255,0.15) 50.5%, transparent 50.5%),
            linear-gradient(0deg, transparent 49.5%, rgba(255,255,255,0.15) 49.5%, rgba(255,255,255,0.15) 50.5%, transparent 50.5%);
        }

        .pitch-circle {
          position: absolute;
          top: 50%; left: 50%;
          width: 180px; height: 180px;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }

        .pitch-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,55,0.07), transparent 70%);
        }

        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          animation: orbPulse 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px; height: 400px;
          top: -120px; left: -100px;
          background: radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%);
        }

        .orb-2 {
          width: 300px; height: 300px;
          top: -60px; right: -80px;
          background: radial-gradient(circle, rgba(100,120,255,0.03) 0%, transparent 70%);
          animation-delay: 3s;
        }

        .hero-kicker {
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: fadeUp 0.8s ease both;
          position: relative;
          z-index: 2;
        }

        .hero-kicker::before,
        .hero-kicker::after {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: var(--gold);
          opacity: 0.5;
        }

        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(4.5rem, 13vw, 10rem);
          font-weight: 300;
          line-height: 0.88;
          letter-spacing: -0.01em;
          animation: fadeUp 0.8s 0.1s ease both;
          position: relative;
          z-index: 2;
        }

        .hero-headline .line { display: block; }
        .pre { color: #f5f2ec; font-style: normal; }
        .dict { color: var(--gold2); font-style: italic; }
        .compete {
          display: block;
          color: transparent;
          -webkit-text-stroke: 1.5px var(--gold);
        }
        .win { color: #f5f2ec; }

        .hero-sub {
          font-size: 1rem;
          font-weight: 300;
          color: var(--body);
          line-height: 1.8;
          max-width: 420px;
          margin: 2rem auto 0;
          letter-spacing: 0.02em;
          animation: fadeUp 0.8s 0.2s ease both;
          position: relative;
          z-index: 2;
        }

        .hero-actions {
          display: flex;
          gap: 1.25rem;
          margin-top: 2.75rem;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.8s 0.3s ease both;
          position: relative;
          z-index: 2;
        }

        .mockup-section {
          padding: 0 2rem 5rem;
          display: flex;
          justify-content: center;
          position: relative;
          z-index: 2;
        }

        .app-window {
          width: 100%;
          max-width: 720px;
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          transform: perspective(1200px) rotateX(4deg);
          animation: windowFloat 7s ease-in-out infinite;
          box-shadow: 0 60px 120px rgba(0,0,0,0.5);
        }

        .window-bar {
          background: rgba(255,255,255,0.04);
          border-bottom: 1px solid var(--border2);
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-r { background: #ff5f57; }
        .dot-y { background: #febc2e; }
        .dot-g { background: #28c840; }

        .window-url {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 5px;
          padding: 0.25rem 0.75rem;
          font-size: 0.72rem;
          color: var(--body);
          margin: 0 0.75rem;
        }

        .pool-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pool-name { font-size: 0.9rem; font-weight: 500; color: var(--silk); }
        .pool-meta { font-size: 0.75rem; color: var(--body); font-weight: 300; margin-top: 3px; }
        .pot-amount { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 300; color: var(--gold2); text-align: right; }
        .pot-label { font-size: 0.68rem; color: var(--body); letter-spacing: 0.06em; text-transform: uppercase; text-align: right; }

        .match-list { padding: 0.5rem 0; }

        .lb-section { border-top: 1px solid var(--border2); padding: 1rem 1.5rem; }
        .lb-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .lb-title { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--body); }
        .lb-viewall { font-size: 0.7rem; color: var(--gold); cursor: pointer; }

        .divider { border: none; border-top: 1px solid var(--border2); }

        .section { padding: 5rem 3rem; max-width: 1100px; margin: 0 auto; }

        .section-eyebrow {
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-eyebrow::after {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: var(--gold);
          opacity: 0.5;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.5rem, 5vw, 3.75rem);
          font-weight: 300;
          line-height: 1.05;
          margin-bottom: 0.75rem;
          color: var(--silk);
        }

        .section-sub {
          color: var(--body);
          font-size: 0.93rem;
          font-weight: 300;
          line-height: 1.8;
          max-width: 440px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 3.5rem;
        }

        .steps-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          margin-top: 3.5rem;
        }

        .pricing-wrap {
          padding: 5rem 3rem;
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }

        .price-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 3.5rem;
          margin-top: 3rem;
          position: relative;
          overflow: hidden;
          transform: perspective(800px) rotateX(2deg);
          transition: transform 0.4s;
        }

        .price-card:hover {
          transform: perspective(800px) rotateX(0deg) translateY(-4px);
        }

        .price-card::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .price-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 5.5rem;
          font-weight: 300;
          color: var(--gold2);
          line-height: 1;
        }

        .price-tag {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--body);
          margin-top: 0.5rem;
          font-weight: 400;
        }

        .price-divider {
          border: none;
          border-top: 1px solid var(--border2);
          margin: 2.5rem 0;
        }

        .price-features {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: left;
        }

        .stripe-note {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.35rem 0.85rem;
          font-size: 0.72rem;
          color: var(--body);
          margin-top: 1.5rem;
        }

        .stripe-note i {
          font-size: 13px;
          color: var(--gold);
        }

        @media (max-width: 768px) {
          .section { padding: 3rem 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-row { grid-template-columns: 1fr 1fr; }
          .pricing-wrap { padding: 3rem 1.5rem; }
        }
      `}</style>
    </>
  )
}

// Components
function MatchRow({ home, homeFlag, away, awayFlag, homeScore, awayScore, status, isLive }) {
  return (
    <div className="match-item">
      <div className="team-home">{home}</div>
      <div className="flag-home">
        <img className="flag-img" src={`https://flagcdn.com/w40/${homeFlag}.png`} alt={`${home} flag`} />
      </div>
      <div className="score-block">
        <div className={`match-status ${!isLive ? 'done' : ''}`}>
          {isLive && <span className="live-ring"></span>}
          <span>{status}</span>
        </div>
        <div className="score-nums">
          <span className="score-num">{homeScore}</span>
          <span className="score-sep">–</span>
          <span className="score-num">{awayScore}</span>
        </div>
      </div>
      <div className="flag-away">
        <img className="flag-img" src={`https://flagcdn.com/w40/${awayFlag}.png`} alt={`${away} flag`} />
      </div>
      <div className="team-away">{away}</div>

      <style jsx>{`
        .match-item {
          display: grid;
          grid-template-columns: 1fr 36px 120px 36px 1fr;
          align-items: center;
          column-gap: 12px;
          padding: 1.1rem 1.75rem;
          border-bottom: 1px solid var(--border2);
        }
        .match-item:last-child { border-bottom: none; }
        .team-home { display: flex; align-items: center; justify-content: flex-end; font-size: 0.88rem; font-weight: 400; color: var(--silk); }
        .flag-home { display: flex; align-items: center; justify-content: flex-end; }
        .score-block { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; }
        .flag-away { display: flex; align-items: center; justify-content: flex-start; }
        .team-away { display: flex; align-items: center; justify-content: flex-start; font-size: 0.88rem; font-weight: 400; color: var(--silk); }
        .flag-img { width: 32px; height: 22px; border-radius: 3px; object-fit: cover; border: 1px solid rgba(255,255,255,0.12); }
        .score-nums { display: flex; align-items: center; gap: 6px; }
        .score-num { font-family: 'Cormorant Garamond', serif; font-size: 1.9rem; font-weight: 300; color: var(--gold); width: 28px; text-align: center; line-height: 1; }
        .score-sep { font-size: 0.9rem; color: var(--muted); line-height: 1; }
        .match-status { font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); display: flex; align-items: center; gap: 4px; justify-content: center; }
        .match-status.done { color: var(--muted); }
        .live-ring { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: ring 1.8s ease infinite; }
      `}</style>
    </div>
  )
}

function LeaderboardRow({ rank, name, pts, movement, paid }) {
  const mvClass = movement.startsWith('+') ? 'mv-up' : movement.startsWith('-') ? 'mv-dn' : 'mv-flat'
  return (
    <div className="lb-row">
      <div className={`lb-rank ${rank === '1' ? 'top' : ''}`}>{rank}</div>
      <div className="lb-player">
        {name}
        {paid && <span className="paid-dot" title="Paid"></span>}
      </div>
      <div className="lb-pts">{pts} pts</div>
      <div className={`mv ${mvClass}`}>{movement}</div>

      <style jsx>{`
        .lb-row { display: grid; grid-template-columns: 28px 1fr auto auto; align-items: center; gap: 0.5rem 0.75rem; padding: 0.45rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .lb-row:last-child { border-bottom: none; }
        .lb-rank { font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 300; color: var(--gold); text-align: center; }
        .lb-rank.top { color: var(--gold2); }
        .lb-player { font-size: 0.84rem; font-weight: 400; color: var(--silk); }
        .lb-pts { font-size: 0.82rem; color: var(--body); font-weight: 400; }
        .mv { font-size: 0.7rem; font-weight: 600; min-width: 28px; text-align: right; }
        .mv-up { color: #5dbb8a; }
        .mv-dn { color: #e06c75; }
        .mv-flat { color: var(--muted); }
        .paid-dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #5dbb8a; margin-left: 5px; vertical-align: middle; }
      `}</style>
    </div>
  )
}

function Feature({ icon, title, desc }) {
  const icons = {
    lock: <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    activity: <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    trophy: <svg viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
    'credit-card': <svg viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
    star: <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    world: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  }

  return (
    <div className="feat">
      <div className="feat-icon">{icons[icon]}</div>
      <div className="feat-name">{title}</div>
      <p className="feat-desc">{desc}</p>

      <style jsx>{`
        .feat { padding: 2.5rem 2rem; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); transition: background 0.3s; }
        .feat:nth-child(3n) { border-right: none; }
        .feat:nth-last-child(-n+3) { border-bottom: none; }
        .feat:hover { background: rgba(255,255,255,0.03); }
        .feat-icon { width: 44px; height: 44px; border: 1px solid var(--border); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .feat-icon :global(svg) { width: 20px; height: 20px; stroke: var(--gold); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .feat-name { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--silk); }
        .feat-desc { font-size: 0.82rem; color: var(--body); font-weight: 300; line-height: 1.75; }

        @media (max-width: 768px) {
          .feat { border-right: none !important; }
        }
      `}</style>
    </div>
  )
}

function Step({ num, title, desc }) {
  return (
    <div className="step">
      <div className="step-n">{num}</div>
      <div className="step-title">{title}</div>
      <p className="step-desc">{desc}</p>

      <style jsx>{`
        .step { padding: 2.5rem 1.75rem; border-right: 1px solid var(--border); transition: background 0.3s; }
        .step:last-child { border-right: none; }
        .step:hover { background: rgba(255,255,255,0.03); }
        .step-n { font-family: 'Cormorant Garamond', serif; font-size: 3rem; font-weight: 300; color: var(--gold); line-height: 1; margin-bottom: 1.25rem; opacity: 0.65; }
        .step-title { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--silk); }
        .step-desc { font-size: 0.8rem; color: var(--body); font-weight: 300; line-height: 1.75; }

        @media (max-width: 768px) {
          .step:nth-child(2n) { border-right: none; }
        }
      `}</style>
    </div>
  )
}

function PriceFeature({ text }) {
  return (
    <div className="price-feature">
      <div className="check-mark">
        <i className="ti ti-check" style={{fontSize: '9px'}} aria-hidden="true"></i>
      </div>
      <span>{text}</span>

      <style jsx>{`
        .price-feature { display: flex; align-items: flex-start; gap: 0.75rem; text-align: left; padding: 0.5rem 0; font-size: 0.86rem; font-weight: 300; color: var(--body); line-height: 1.6; }
        .check-mark { width: 17px; height: 17px; border-radius: 50%; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; color: var(--gold); }
      `}</style>
    </div>
  )
}
