// ESPN-Style Theme for PickPoolr Inner Interface
// All CSS-in-JS styles extracted from design-inner-interface.html

export const espnStyles = `
  /* CSS Variables matching the HTML design */
  :root {
    --bg: #0a0c10;
    --bg2: #111318;
    --bg3: #181c24;
    --bg4: #1e2330;
    --gold: #c9a84c;
    --gold2: #e6c76a;
    --red: #e03b3b;
    --green: #2cb67d;
    --white: #fff;
    --f1: #f0ede8;
    --f2: #c8c5be;
    --f3: #8a8780;
    --f4: #4a4845;
    --line: rgba(255,255,255,0.07);
    --gold-line: rgba(201,168,76,0.3);
  }
`

export const topbarStyles = `
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
  .tb-link:first-child {
    border-left: 1px solid var(--line);
  }
  .tb-link:hover, .tb-link.active {
    color: var(--f1);
    background: rgba(255,255,255,0.03);
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
  }
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
`

export const navStyles = `
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
  .nav-logo span {
    color: var(--gold);
  }
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
    cursor: pointer;
    transition: all 0.15s;
  }
  .nav-item:hover {
    color: var(--f1);
  }
  .nav-item.active {
    color: var(--white);
    border-bottom-color: var(--gold);
  }
  .nav-cta {
    margin-left: auto;
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
  .nav-cta:hover {
    background: var(--gold2);
  }
`

export const pageHeaderStyles = `
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
    font-size: 0.78rem;
    color: var(--f3);
    margin-top: 0.2rem;
    font-family: 'Inter', sans-serif;
  }
  .ph-right {
    text-align: right;
  }
  .ph-score {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    color: var(--gold);
    line-height: 1;
  }
  .ph-rank {
    font-size: 0.72rem;
    color: var(--f3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: 'Barlow Condensed', sans-serif;
    margin-top: 2px;
  }
`

export const tabNavStyles = `
  .tab-nav {
    background: var(--bg2);
    border-bottom: 1px solid var(--line);
  }
  .tab-nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
  }
  .tab {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0 1.5rem;
    height: 44px;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--f3);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    border-left: none;
    border-right: none;
    border-top: none;
  }
  .tab:hover {
    color: var(--f1);
  }
  .tab.active {
    color: var(--white);
    border-bottom-color: var(--gold);
  }
  .tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--gold);
    color: #000;
    font-size: 0.6rem;
    font-weight: 900;
  }
`

export const cardStyles = `
  .card {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  .card-head {
    background: var(--bg3);
    padding: 0.65rem 1rem;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .card-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--white);
  }
  .card-link {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gold);
    cursor: pointer;
    text-decoration: none;
  }
  .card-body {
    padding: 1rem;
  }
`

export const poolCardStyles = `
  .pool-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }
  .pool-card {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.15s;
    text-decoration: none;
    display: block;
  }
  .pool-card:hover {
    border-color: var(--gold);
  }
  .pc-banner {
    background: var(--bg3);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pc-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--white);
  }
  .pc-tournament {
    font-size: 0.72rem;
    color: var(--f3);
    margin-top: 2px;
    font-family: 'Inter', sans-serif;
  }
  .pc-body {
    padding: 1rem;
  }
  .pc-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 1px solid var(--line);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }
  .pc-stat {
    padding: 0.6rem 0.75rem;
    border-right: 1px solid var(--line);
    text-align: center;
  }
  .pc-stat:last-child {
    border-right: none;
  }
  .pc-stat-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    color: var(--gold);
    line-height: 1;
  }
  .pc-stat-label {
    font-size: 0.62rem;
    color: var(--f4);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 2px;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600;
  }
  .pc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pc-status {
    display: flex;
    align-items: center;
    gap: 0.4rem;
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
  }
  .dot-live {
    background: var(--red);
    animation: pulse 1.4s ease infinite;
  }
  .dot-upcoming {
    background: var(--gold);
  }
  .dot-done {
    background: var(--f4);
  }
  .pc-cta {
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
  }
  .pc-role {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    background: rgba(201,168,76,0.12);
    color: var(--gold);
    border: 1px solid var(--gold-line);
  }
  .pc-role.player {
    background: rgba(44,182,125,0.1);
    color: var(--green);
    border-color: rgba(44,182,125,0.25);
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
`

export const matchPickCardStyles = `
  .mpc {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2px;
  }
  .mpc.submitted {
    border-color: rgba(44,182,125,0.25);
  }
  .mpc.locked-card {
    opacity: 0.65;
  }
  .mpc-head {
    background: var(--bg3);
    padding: 0.4rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--line);
  }
  .mpc-info {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--f4);
  }
  .mpc-status {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .s-open { color: var(--green); }
  .s-saved { color: var(--green); }
  .s-live { color: var(--red); }
  .s-ft { color: var(--f4); }
  .s-lock { color: var(--f4); }
  .mpc-body {
    display: grid;
    grid-template-columns: 1fr 170px 1fr;
    align-items: center;
    gap: 0;
    padding: 0.85rem 1rem;
  }
  .team-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }
  .team-flag img {
    width: 42px;
    height: 29px;
    border-radius: 3px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .team-nm {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: var(--f1);
    text-align: center;
  }
  .score-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }
  .score-status {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .score-inputs {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .si {
    width: 50px;
    height: 50px;
    background: var(--bg3);
    border: 1px solid var(--f4);
    border-radius: 3px;
    color: var(--white);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.7rem;
    font-weight: 900;
    text-align: center;
    outline: none;
    transition: border-color 0.15s;
    -moz-appearance: textfield;
    padding: 0;
  }
  .si::-webkit-outer-spin-button,
  .si::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  .si:focus {
    border-color: var(--gold);
  }
  .si.filled {
    border-color: rgba(44,182,125,0.4);
    background: rgba(44,182,125,0.04);
  }
  .si.rdonly {
    pointer-events: none;
    color: var(--f2);
  }
  .sc-dash {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--f4);
  }
  .score-display {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sd-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    color: var(--gold);
    min-width: 30px;
    text-align: center;
    line-height: 1;
  }
  .sd-val.muted {
    color: var(--f2);
  }
  .sd-sep {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--f4);
  }
  .pts-badge {
    display: inline-block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    background: rgba(44,182,125,0.12);
    color: var(--green);
    border: 1px solid rgba(44,182,125,0.25);
    margin-top: 3px;
  }
  .mpc-foot {
    border-top: 1px solid var(--line);
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.6rem;
    background: rgba(0,0,0,0.15);
  }
  .btn-save {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--gold);
    color: #000;
    padding: 0.4rem 1.1rem;
    border-radius: 2px;
    border: none;
    cursor: pointer;
  }
  .btn-save:hover {
    background: var(--gold2);
  }
  .btn-edit {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: transparent;
    color: var(--f3);
    border: 1px solid var(--f4);
    padding: 0.35rem 0.75rem;
    border-radius: 2px;
    cursor: pointer;
  }
  .btn-edit:hover {
    color: var(--f1);
    border-color: var(--f2);
  }
`

export const matchdayStripStyles = `
  .md-strip {
    display: flex;
    gap: 0;
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1.25rem;
  }
  .md-btn {
    flex: 1;
    padding: 0.45rem 0;
    text-align: center;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: var(--bg2);
    color: var(--f3);
    border: none;
    cursor: pointer;
    border-right: 1px solid var(--line);
    transition: all 0.15s;
  }
  .md-btn:last-child {
    border-right: none;
  }
  .md-btn.active {
    background: var(--gold);
    color: #000;
  }
  .md-btn.done {
    color: var(--green);
  }
  .md-btn.locked {
    color: var(--f4);
    cursor: default;
  }
`

export const deadlineBannerStyles = `
  .deadline-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(201,168,76,0.07);
    border: 1px solid var(--gold-line);
    border-radius: 4px;
    padding: 0.6rem 1rem;
    margin-bottom: 1.25rem;
  }
  .db-left {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .db-sub {
    font-size: 0.7rem;
    color: var(--f3);
    margin-top: 1px;
    font-family: 'Inter', sans-serif;
  }
  .db-countdown {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--gold);
    letter-spacing: 0.04em;
  }
`

export const leaderboardStyles = `
  .lb-cols {
    display: grid;
    grid-template-columns: 36px 16px 1fr 60px 50px 50px;
    align-items: center;
    gap: 0 0.75rem;
    padding: 0.4rem 1rem;
    border-bottom: 1px solid var(--line);
  }
  .lb-col-label {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--f4);
    font-family: 'Barlow Condensed', sans-serif;
  }
  .lb-col-label.r {
    text-align: right;
  }
  .lb-row {
    display: grid;
    grid-template-columns: 36px 16px 1fr 60px 50px 50px;
    align-items: center;
    gap: 0 0.75rem;
    padding: 0.55rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.15s;
    cursor: default;
  }
  .lb-row:last-child {
    border-bottom: none;
  }
  .lb-row:hover {
    background: rgba(255,255,255,0.02);
  }
  .lb-row.you {
    background: rgba(201,168,76,0.05);
  }
  .lb-rank {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    text-align: center;
  }
  .rank-gold { color: var(--gold2); }
  .rank-silver { color: #b0c4de; }
  .rank-bronze { color: #cd7f32; }
  .rank-other { color: var(--f3); }
  .lb-mv {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    text-align: center;
  }
  .mv-up { color: var(--green); }
  .mv-dn { color: var(--red); }
  .mv-flat { color: var(--f4); }
  .lb-player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--f1);
    font-family: 'Inter', sans-serif;
  }
  .lb-you-tag {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    background: rgba(201,168,76,0.12);
    border: 1px solid var(--gold-line);
    padding: 0.1rem 0.35rem;
    border-radius: 2px;
  }
  .paid-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--green);
    display: inline-block;
    flex-shrink: 0;
  }
  .lb-pts {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--f1);
    text-align: right;
  }
  .lb-rd {
    font-size: 0.75rem;
    color: var(--f3);
    text-align: right;
    font-family: 'Inter', sans-serif;
  }
`

export const sidebarStyles = `
  .sc-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .sc-row:last-child {
    border-bottom: none;
  }
  .sc-label {
    font-size: 0.75rem;
    color: var(--f3);
    font-family: 'Inter', sans-serif;
  }
  .sc-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--f1);
  }
  .sc-val.gold { color: var(--gold); }
  .sc-val.green { color: var(--green); }
  .sc-val.red { color: var(--red); }
`

export const specialPicksStyles = `
  .sp-card {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2px;
  }
  .sp-head {
    background: var(--bg3);
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--line);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sp-title-group {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .sp-icon-wrap {
    font-size: 1rem;
  }
  .sp-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--white);
  }
  .sp-pts {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    background: rgba(201,168,76,0.12);
    color: var(--gold);
    border: 1px solid var(--gold-line);
  }
  .sp-body {
    padding: 1rem;
  }
  .sp-desc {
    font-size: 0.77rem;
    color: var(--f3);
    margin-bottom: 0.75rem;
    line-height: 1.5;
    font-family: 'Inter', sans-serif;
  }
  .team-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .tg-opt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.6rem 0.5rem;
    border-radius: 3px;
    background: var(--bg3);
    border: 1px solid var(--line);
    cursor: pointer;
    transition: all 0.15s;
  }
  .tg-opt:hover {
    border-color: var(--f3);
  }
  .tg-opt.sel {
    border-color: var(--gold);
    background: rgba(201,168,76,0.08);
  }
  .tg-opt img {
    width: 36px;
    height: 25px;
    border-radius: 2px;
    object-fit: cover;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .tg-opt-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--f2);
    text-align: center;
  }
  .tg-opt.sel .tg-opt-name {
    color: var(--gold);
  }
  .player-search {
    width: 100%;
    padding: 0.55rem 0.85rem;
    background: var(--bg3);
    border: 1px solid var(--f4);
    border-radius: 3px;
    color: var(--f1);
    font-size: 0.82rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    margin-bottom: 0.5rem;
  }
  .player-search:focus {
    border-color: var(--gold);
  }
  .player-search::placeholder {
    color: var(--f4);
  }
  .player-results {
    background: var(--bg3);
    border: 1px solid var(--f4);
    border-radius: 3px;
    overflow: hidden;
  }
  .pr-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.85rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: background 0.15s;
  }
  .pr-item:last-child {
    border-bottom: none;
  }
  .pr-item:hover {
    background: rgba(255,255,255,0.04);
  }
  .pr-item.sel-player {
    background: rgba(201,168,76,0.08);
  }
  .pr-flag img {
    width: 20px;
    height: 14px;
    border-radius: 1px;
    object-fit: cover;
  }
  .pr-name {
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--f1);
    font-family: 'Inter', sans-serif;
  }
  .pr-team {
    font-size: 0.7rem;
    color: var(--f3);
    font-family: 'Inter', sans-serif;
  }
  .pr-pos {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-left: auto;
    padding: 0.1rem 0.4rem;
    border-radius: 2px;
  }
  .pos-gk { background: rgba(201,168,76,0.12); color: var(--gold); }
  .pos-fwd { background: rgba(224,59,59,0.12); color: var(--red); }
  .pos-mid { background: rgba(44,182,125,0.12); color: var(--green); }
  .pos-def { background: rgba(138,135,128,0.2); color: var(--f2); }
  .selected-pick {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.85rem;
    background: rgba(201,168,76,0.06);
    border: 1px solid var(--gold-line);
    border-radius: 3px;
    margin-top: 0.5rem;
  }
  .sel-flag img {
    width: 28px;
    height: 19px;
    border-radius: 2px;
    object-fit: cover;
  }
  .sel-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--white);
  }
  .sel-team {
    font-size: 0.7rem;
    color: var(--f3);
    font-family: 'Inter', sans-serif;
  }
  .sel-change {
    margin-left: auto;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--f4);
    cursor: pointer;
    text-decoration: underline;
  }
  .sp-foot {
    border-top: 1px solid var(--line);
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sp-foot-note {
    font-size: 0.7rem;
    color: var(--f4);
    font-family: 'Inter', sans-serif;
  }
  .sp-foot-note.missing {
    color: var(--red);
  }
  .sp-lock-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    background: rgba(201,168,76,0.07);
    border: 1px solid var(--gold-line);
    border-radius: 4px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
  }
  .slb-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
  }
  .slb-sub {
    font-size: 0.72rem;
    color: var(--f3);
    margin-top: 3px;
    line-height: 1.5;
    font-family: 'Inter', sans-serif;
  }
`

export const formStyles = `
  .field-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--f2);
    margin-bottom: 0.4rem;
    display: block;
  }
  .field-input {
    width: 100%;
    padding: 0.6rem 0.85rem;
    background: var(--bg3);
    border: 1px solid var(--f4);
    border-radius: 3px;
    color: var(--f1);
    font-size: 0.85rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    margin-bottom: 1rem;
  }
  .field-input:focus {
    border-color: var(--gold);
  }
  .field-input::placeholder {
    color: var(--f4);
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
  }
  .btn-primary:hover {
    background: var(--gold2);
  }
  .btn-ghost {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: transparent;
    color: var(--f3);
    border: 1px solid var(--f4);
    padding: 0.55rem 1.1rem;
    border-radius: 2px;
    cursor: pointer;
  }
  .btn-ghost:hover {
    color: var(--f1);
    border-color: var(--f2);
  }
`

export const layoutStyles = `
  .wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
  }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .two-col {
      grid-template-columns: 1fr;
    }
    .wrap {
      padding: 1rem;
    }
    .team-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .mpc-body {
      grid-template-columns: 1fr 120px 1fr;
    }
    .si {
      width: 40px;
      height: 40px;
      font-size: 1.4rem;
    }
    .md-strip {
      overflow-x: auto;
    }
    .lb-cols, .lb-row {
      grid-template-columns: 30px 1fr 50px;
    }
    .lb-cols .lb-col-label:nth-child(2),
    .lb-cols .lb-col-label:nth-child(5),
    .lb-cols .lb-col-label:nth-child(6),
    .lb-row > *:nth-child(2),
    .lb-row > *:nth-child(5),
    .lb-row > *:nth-child(6) {
      display: none;
    }
  }
`
