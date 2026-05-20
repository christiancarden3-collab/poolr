import './globals.css'

export const metadata = {
  title: 'PickPoolr',
  description: 'Private prediction pools for World Cup 2026. Score picks, chase the leaderboard, split the pot.',
  keywords: 'world cup 2026, prediction pool, quiniela, soccer predictions, football pool, pickpoolr',
  openGraph: {
    title: 'PickPoolr | Predict. Compete. Win.',
    description: 'Private prediction pools for World Cup 2026.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          #loader{position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0c10;display:flex;align-items:center;justify-content:center;z-index:9999;transition:opacity 0.3s}
          #loader.hide{opacity:0;pointer-events:none}
          #loader img{width:80px;height:80px;animation:pulse 1.2s ease-in-out infinite}
          @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.95)}}
          body{opacity:0}
        ` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9a84c" />
      </head>
      <body>
        <div id="loader"><img src="/logo-192.png" alt="Loading" /></div>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('load', function() {
            document.body.style.opacity = '1';
            document.getElementById('loader').classList.add('hide');
            setTimeout(function() { document.getElementById('loader').remove(); }, 300);
          });
        ` }} />
      </body>
    </html>
  )
}
// Build 1779236320
