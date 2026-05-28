'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../../../lib/supabase'

export default function PoolSettingsPage({ params }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  const [buyIn, setBuyIn] = useState('')
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [tournament, setTournament] = useState('wc2026')

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)

    const { data: poolData } = await supabase
      .from('pools')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!poolData || poolData.commissioner_id !== currentUser.id) {
      router.push('/dashboard')
      return
    }
    
    setPool(poolData)
    setBuyIn(poolData.buy_in || '')
    setPaymentInstructions(poolData.payment_instructions || '')
    setTournament(poolData.tournament || 'wc2026')
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('pools')
        .update({
          tournament: tournament,
          buy_in: parseFloat(buyIn) || 0,
          payment_instructions: paymentInstructions || null
        })
        .eq('id', params.id)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">PickPoolr</div>
        <p>Loading...</p>
        <style jsx global>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--ink);
          }
          .logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 2rem;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: var(--gold2);
            text-transform: uppercase;
          }
          p { color: var(--muted); margin-top: 1rem; }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <nav className="settings-nav">
        <Link href={`/pool/${pool.id}`} className="back-link">← Back to Pool</Link>
        <div className="logo">PickPoolr</div>
        <div style={{width: '150px'}}></div>
      </nav>

      <main className="settings-container">
        <div className="settings-header">
          <h1>Pool Settings</h1>
          <p>{pool.name}</p>
        </div>

        <div className="settings-card">
          <div className="form-group">
            <label>Tournament</label>
            <select
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              className="form-select"
            >
              <option value="rg2026">Roland Garros 2026</option>
              <option value="wc2026">FIFA World Cup 2026</option>
            </select>
          </div>

          <div className="form-group">
            <label>Buy-in Amount ($)</label>
            <input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              placeholder="25"
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Payment Instructions</label>
            <p className="field-hint">This is shown to members when they need to pay. Include your payment methods and any important notes.</p>
            <textarea
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              placeholder={`Buy-in: $25

Payment Options:

Zelle: Your Name (phone number)

PayPal: your@email.com
IMPORTANT: Select FRIENDS AND FAMILY when sending payment. Do NOT select Goods and Services.

Include your name in the payment note so we can confirm your entry.`}
              rows={10}
            />
          </div>

          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-gold save-btn"
          >
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        :root {
          --bg:#0a0c10;--bg2:#111318;--bg3:#181c24;
          --gold:#c9a84c;--gold2:#e6c76a;--green:#2cb67d;
          --f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;
          --line:rgba(255,255,255,0.07);
          --ink:var(--bg);--ink2:var(--bg2);--ink3:var(--bg3);
          --border:var(--line);--border2:var(--line);
          --silk:#fff;--body:var(--f3);--muted:var(--f4);
        }
        body { background:var(--bg);font-family:'Inter',sans-serif;color:var(--f1); }
        .settings-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
        }

        .back-link {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--f3);
          text-decoration: none;
          width: 150px;
          transition: color 0.15s;
        }
        .back-link:hover {
          color: var(--gold);
        }

        .settings-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: #fff;
        }
        .logo {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .logo span { color: var(--gold); }

        .settings-header p {
          color: var(--body);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .settings-card {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--silk);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .field-hint {
          font-size: 0.8rem;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          background: var(--ink3);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.875rem 1rem;
          color: var(--silk);
          font-size: 0.95rem;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--gold);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 200px;
        }

        .save-btn {
          width: 100%;
          padding: 1rem;
          font-size: 1rem;
          margin-top: 1rem;
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
