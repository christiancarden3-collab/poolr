import './globals.css'

export const metadata = {
  title: 'Poolr — Predict. Compete. Win.',
  description: 'Private prediction pools for World Cup 2026. Score picks, chase the leaderboard, split the pot.',
  keywords: 'world cup 2026, prediction pool, quiniela, soccer predictions, football pool',
  openGraph: {
    title: 'Poolr — Predict. Compete. Win.',
    description: 'Private prediction pools for World Cup 2026.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
