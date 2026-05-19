'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '../../lib/supabase'

export default function CreatePoolPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState(1)

  // Form state
  const [poolName, setPoolName] = useState('')
  const [tournament, setTournament] = useState('world-cup-2026')
  const [buyIn, setBuyIn] = useState(50)
  const [visibility, setVisibility] = useState('private')
  const [accessType, setAccessType] = useState('invite')
  const [password, setPassword] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('external')
  const [paymentInstructions, setPaymentInstructions] = useState('')
  const [feeHandling, setFeeHandling] = useState('absorbed')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    
    // TODO: Create pool in Supabase
    // For now, just simulate and redirect
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Poolr</div>
        <p>Loading...</p>
        <style jsx>{`
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
            font-weight: 300;
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
      <nav className="create-nav">
        <Link href="/dashboard" className="back-link">
          <i className="ti ti-arrow-left"></i> Back to dashboard
        </Link>
        <div className="logo">Poolr</div>
        <div style={{width: '150px'}}></div>
      </nav>

      <main className="create-container">
        <div className="create-header">
          <h1>Create a Pool</h1>
          <p>Set up your prediction pool in minutes</p>
        </div>

        <div className="steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {step === 1 && (
          <div className="create-step">
            <h2>Basic Info</h2>
            
            <div className="form-group">
              <label>Pool Name</label>
              <input
                type="text"
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="e.g., Los Boys Mundial 2026"
              />
            </div>

            <div className="form-group">
              <label>Tournament</label>
              <select value={tournament} onChange={(e) => setTournament(e.target.value)}>
                <option value="world-cup-2026">FIFA World Cup 2026</option>
              </select>
            </div>

            <div className="form-group">
              <label>Buy-in Amount ($)</label>
              <input
                type="number"
                value={buyIn}
                onChange={(e) => setBuyIn(Number(e.target.value))}
                min="0"
                placeholder="50"
              />
              <small>Set to $0 for a free pool</small>
            </div>

            <button 
              className="btn-gold full-width" 
              onClick={() => setStep(2)}
              disabled={!poolName}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="create-step">
            <h2>Access Settings</h2>

            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-group">
                <label className={`radio-option ${visibility === 'public' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="public" 
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                  />
                  <div className="radio-content">
                    <strong>Public</strong>
                    <span>Listed on browse page, anyone can find and join</span>
                  </div>
                </label>
                <label className={`radio-option ${visibility === 'private' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="visibility" 
                    value="private" 
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                  />
                  <div className="radio-content">
                    <strong>Private</strong>
                    <span>Only accessible via invite link or password</span>
                  </div>
                </label>
              </div>
            </div>

            {visibility === 'private' && (
              <div className="form-group">
                <label>Access Type</label>
                <div className="radio-group">
                  <label className={`radio-option ${accessType === 'invite' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="accessType" 
                      value="invite" 
                      checked={accessType === 'invite'}
                      onChange={() => setAccessType('invite')}
                    />
                    <div className="radio-content">
                      <strong>Invite Link Only</strong>
                      <span>Share a unique link to let people join</span>
                    </div>
                  </label>
                  <label className={`radio-option ${accessType === 'password' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="accessType" 
                      value="password" 
                      checked={accessType === 'password'}
                      onChange={() => setAccessType('password')}
                    />
                    <div className="radio-content">
                      <strong>Password Protected</strong>
                      <span>Require a password to join</span>
                    </div>
                  </label>
                </div>

                {accessType === 'password' && (
                  <div className="form-group" style={{marginTop: '1rem'}}>
                    <label>Pool Password</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="step-actions">
              <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
              <button className="btn-gold" onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="create-step">
            <h2>Payment Settings</h2>

            {buyIn > 0 ? (
              <>
                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="radio-group">
                    <label className={`radio-option ${paymentMethod === 'external' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="external" 
                        checked={paymentMethod === 'external'}
                        onChange={() => setPaymentMethod('external')}
                      />
                      <div className="radio-content">
                        <strong>External (Zelle/Venmo)</strong>
                        <span>You collect payments manually, no platform fee</span>
                      </div>
                    </label>
                    <label className={`radio-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="stripe" 
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                      />
                      <div className="radio-content">
                        <strong>Stripe (Coming Soon)</strong>
                        <span>In-app payments with automatic payouts, 5% fee</span>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === 'external' && (
                  <div className="form-group">
                    <label>Payment Instructions</label>
                    <textarea
                      value={paymentInstructions}
                      onChange={(e) => setPaymentInstructions(e.target.value)}
                      placeholder="e.g., Pay $50 via Zelle to (561) 525-6915. Include your email in the note."
                      rows={3}
                    />
                  </div>
                )}

                {paymentMethod === 'stripe' && (
                  <div className="form-group">
                    <label>Fee Handling</label>
                    <div className="radio-group">
                      <label className={`radio-option ${feeHandling === 'on_top' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="feeHandling" 
                          value="on_top" 
                          checked={feeHandling === 'on_top'}
                          onChange={() => setFeeHandling('on_top')}
                        />
                        <div className="radio-content">
                          <strong>Players pay fee</strong>
                          <span>Players pay ${buyIn} + ${(buyIn * 0.05).toFixed(2)} = ${(buyIn * 1.05).toFixed(2)}</span>
                        </div>
                      </label>
                      <label className={`radio-option ${feeHandling === 'absorbed' ? 'selected' : ''}`}>
                        <input 
                          type="radio" 
                          name="feeHandling" 
                          value="absorbed" 
                          checked={feeHandling === 'absorbed'}
                          onChange={() => setFeeHandling('absorbed')}
                        />
                        <div className="radio-content">
                          <strong>Pot absorbs fee</strong>
                          <span>Players pay ${buyIn}, pot gets ${(buyIn * 0.95).toFixed(2)} per player</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="free-pool-notice">
                <i className="ti ti-check"></i>
                <p>This is a free pool — no payment settings needed!</p>
              </div>
            )}

            <div className="pool-summary">
              <h3>Pool Summary</h3>
              <div className="summary-row">
                <span>Name</span>
                <strong>{poolName}</strong>
              </div>
              <div className="summary-row">
                <span>Tournament</span>
                <strong>World Cup 2026</strong>
              </div>
              <div className="summary-row">
                <span>Buy-in</span>
                <strong>${buyIn}</strong>
              </div>
              <div className="summary-row">
                <span>Access</span>
                <strong>{visibility === 'public' ? 'Public' : accessType === 'invite' ? 'Invite Only' : 'Password Protected'}</strong>
              </div>
              {buyIn > 0 && (
                <div className="summary-row">
                  <span>Payment</span>
                  <strong>{paymentMethod === 'external' ? 'Zelle/Venmo' : 'Stripe'}</strong>
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn-outline" onClick={() => setStep(2)}>Back</button>
              <button className="btn-gold" onClick={handleCreate} disabled={creating}>
                {creating ? 'Creating...' : 'Create Pool'}
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .create-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border2);
          background: var(--ink);
        }

        .back-link {
          color: var(--body);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          width: 150px;
        }

        .back-link:hover { color: var(--silk); }

        .create-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .create-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .create-header h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          color: var(--silk);
        }

        .create-header p {
          color: var(--body);
          margin-top: 0.5rem;
        }

        .steps-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          color: var(--muted);
          transition: all 0.2s;
        }

        .step-dot.active {
          background: var(--gold);
          border-color: var(--gold);
          color: var(--ink);
          font-weight: 600;
        }

        .step-line {
          width: 60px;
          height: 1px;
          background: var(--border);
        }

        .create-step {
          background: var(--ink2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
        }

        .create-step h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 300;
          color: var(--silk);
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group small {
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          margin-top: 0.35rem;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .radio-option {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .radio-option:hover {
          border-color: var(--gold);
        }

        .radio-option.selected {
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.05);
        }

        .radio-option input {
          margin-top: 3px;
          accent-color: var(--gold);
        }

        .radio-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .radio-content strong {
          color: var(--silk);
          font-size: 0.9rem;
        }

        .radio-content span {
          color: var(--body);
          font-size: 0.8rem;
        }

        .full-width {
          width: 100%;
          margin-top: 1rem;
        }

        .step-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .step-actions .btn-outline {
          flex: 1;
        }

        .step-actions .btn-gold {
          flex: 2;
        }

        .free-pool-notice {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: rgba(93, 187, 138, 0.1);
          border: 1px solid var(--success);
          border-radius: 8px;
          color: var(--success);
        }

        .free-pool-notice i {
          font-size: 1.5rem;
        }

        .pool-summary {
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--ink3);
          border-radius: 8px;
        }

        .pool-summary h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border2);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row span {
          color: var(--body);
          font-size: 0.85rem;
        }

        .summary-row strong {
          color: var(--silk);
          font-size: 0.85rem;
        }
      `}</style>
    </>
  )
}
