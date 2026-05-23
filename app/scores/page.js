'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ScoresPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/results')
  }, [router])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg)',
      color: 'var(--f2)'
    }}>
      Redirecting to scores...
    </div>
  )
}
