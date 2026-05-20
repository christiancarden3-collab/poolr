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
        <style dangerouslySetInnerHTML={{ __html: `body{opacity:0}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9a84c" />
      </head>
      <body>{children}</body>
    </html>
  )
}
