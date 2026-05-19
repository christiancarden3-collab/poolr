'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function CreatePoolPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdPoolId, setCreatedPoolId] = useState(null)
  
  // Form state
  const [poolName, setPoolName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('private')
  const [inviteCode, setInviteCode] = useState('pool26')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [poolType, setPoolType] = useState('free')
  const [buyinAmount, setBuyinAmount] = useState('')
  const [feeType, setFeeType] = useState('on_top')
  const [prizeType, setPrizeType] = useState('winner')
  const [prizes, setPrizes] = useState([{ place: 1, percent: 100 }])

  const generateCode = () => {
    const codes = ['pool26', 'wc2026', 'group26', 'amigos26', 'champs26', 'final26', 'mypool', 'picks26']
    setInviteCode(codes[Math.floor(Math.random() * codes.length)])
  }

  const nextStep = () => {
    if (step === 1 && poolName) {
      const code = poolName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) || 'pool26'
      setInviteCode(code)
    }
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const selectPrize = (type) => {
    setPrizeType(type)
    if (type === 'winner') setPrizes([{ place: 1, percent: 100 }])
    else if (type === 'top3') setPrizes([{ place: 1, percent: 60 }, { place: 2, percent: 30 }, { place: 3, percent: 10 }])
    else setPrizes([{ place: 1, percent: 60 }, { place: 2, percent: 25 }, { place: 3, percent: 15 }])
  }

  const prizeTotal = prizes.reduce((sum, p) => sum + (p.percent || 0), 0)

  const handleCreate = async () => {
    setLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Create pool
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .insert({
          name: poolName,
          description,
          tournament_id: 1, // World Cup 2026
          commissioner_id: user.id,
          invite_code: inviteCode,
          is_public: privacy === 'public',
          max_players: maxPlayers ? parseInt(maxPlayers) : null,
          buy_in_amount: poolType === 'paid' ? parseFloat(buyinAmount) : 0,
          fee_type: poolType === 'paid' ? feeType : null,
          prize_distribution: JSON.stringify(prizes),
          status: 'open'
        })
        .select()
        .single()

      if (poolError) throw poolError

      // Add commissioner as member
      await supabase.from('pool_members').insert({
        pool_id: pool.id,
        user_id: user.id,
        role: 'commissioner',
        has_paid: true
      })

      setCreatedPoolId(pool.id)
      setSuccess(true)
      setStep(6)
    } catch (err) {
      console.error(err)
      alert('Error creating pool: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://pickpoolr.com/join/${inviteCode}`)
  }

  const renderStepIndicator = () => (
    <div className="step-progress">
      <div className="step-progress-inner">
        {[1, 2, 3, 4, 5].map(s => (
          <div 
            key={s}
            className={`sp-step ${step === s ? 'active' : ''} ${step > s || success ? 'done' : ''}`}
            onClick={() => !success && step > s && setStep(s)}
          >
            <div className="sp-num">{step > s || success ? '✓' : s}</div>
            {s === 1 ? 'Details' : s === 2 ? 'Privacy' : s === 3 ? 'Payment' : s === 4 ? 'Prizes' : 'Review'}
          </div>
        ))}
      </div>
    </div>
  )

  if (success) {
    return (
      <>
        <nav>
          <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
          <div className="nav-items">
            <Link href="/dashboard" className="nav-item">Home</Link>
            <span className="nav-item active">Create Pool</span>
          </div>
          <Link href="/dashboard" className="nav-back">← Back to dashboard</Link>
        </nav>

        <div className="page-header">
          <div className="page-header-inner">
            <div className="page-eyebrow">World Cup 2026</div>
            <div className="page-title">Create a Pool</div>
            <div className="page-sub">Set up your prediction pool in under two minutes</div>
          </div>
        </div>

        {renderStepIndicator()}

        <div className="success-wrap">
          <div className="success-icon">✓</div>
          <div className="success-title">Pool Created!</div>
          <div className="success-sub">
            Your pool is live. Share the invite link and let the predictions begin. Special picks lock at first kickoff on June 11.
          </div>
          <div className="invite-box">
            <div className="invite-label">Invite Link</div>
            <div className="invite-link-row">
              <div className="invite-link">pickpoolr.com/join/{inviteCode}</div>
              <button className="btn-copy" onClick={copyLink}>Copy</button>
            </div>
          </div>
          <div className="success-actions">
            <a href={`https://wa.me/?text=Join my World Cup pool! https://pickpoolr.com/join/${inviteCode}`} target="_blank" rel="noopener noreferrer" className="btn-wa">
              Share on WhatsApp
            </a>
            <Link href={`/pool/${createdPoolId || 1}`} className="btn-go">Go to My Pool →</Link>
          </div>
        </div>

        <style jsx global>{`${wizardStyles}`}</style>
      </>
    )
  }

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        <div className="nav-items">
          <Link href="/dashboard" className="nav-item">Home</Link>
          <span className="nav-item active">Create Pool</span>
        </div>
        <Link href="/dashboard" className="nav-back">← Back to dashboard</Link>
      </nav>

      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-eyebrow">World Cup 2026</div>
          <div className="page-title">Create a Pool</div>
          <div className="page-sub">Set up your prediction pool in under two minutes</div>
        </div>
      </div>

      {renderStepIndicator()}

      <div className="main">
        {/* STEP 1: DETAILS */}
        {step === 1 && (
          <>
            <div>
              <div className="form-card">
                <div className="fc-header">
                  <div className="fc-title">Pool Details</div>
                  <div className="fc-sub">Give your pool a name and pick your tournament</div>
                </div>
                <div className="fc-body">
                  <div className="field">
                    <label className="field-label">Pool Name</label>
                    <input 
                      className="field-input" 
                      type="text" 
                      placeholder="e.g. Amigos WC26 Pool"
                      value={poolName}
                      onChange={(e) => setPoolName(e.target.value)}
                    />
                    <div className="field-hint">This is what your players see when they join</div>
                  </div>
                  <div className="field">
                    <label className="field-label">Description <span style={{ color: 'var(--f4)', fontWeight: 400 }}>(optional)</span></label>
                    <textarea 
                      className="field-input"
                      placeholder="Any rules or notes for your players..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="field">
                    <label className="field-label">Tournament</label>
                    <select className="field-input field-select">
                      <option>FIFA World Cup 2026 · USA, Canada & Mexico</option>
                    </select>
                    <div className="field-hint">More tournaments coming soon</div>
                  </div>
                  <div className="field">
                    <label className="field-label">Picks deadline</label>
                    <select className="field-input field-select">
                      <option>1 hour before first match of each matchday</option>
                      <option>2 hours before first match of each matchday</option>
                      <option>24 hours before first match of each matchday</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <div style={{ fontSize: '0.75rem', color: 'var(--f4)' }}>Step 1 of 5</div>
                  <button className="btn-primary" onClick={nextStep}>Next →</button>
                </div>
              </div>
            </div>
            <Sidebar poolName={poolName} privacy={privacy} buyinAmount={buyinAmount} poolType={poolType} />
          </>
        )}

        {/* STEP 2: PRIVACY */}
        {step === 2 && (
          <>
            <div>
              <div className="form-card">
                <div className="fc-header">
                  <div className="fc-title">Privacy Settings</div>
                  <div className="fc-sub">Choose who can find and join your pool</div>
                </div>
                <div className="fc-body">
                  <div className="field">
                    <label className="field-label">Pool visibility</label>
                    <div className="option-grid">
                      <div className={`option-card ${privacy === 'private' ? 'selected' : ''}`} onClick={() => setPrivacy('private')}>
                        <div className="oc-header"><div className="oc-title">Private</div><div className="oc-check"></div></div>
                        <div className="oc-desc">Only people with your invite link can join. Not listed publicly.</div>
                        <span className="oc-badge badge-rec">Recommended</span>
                      </div>
                      <div className={`option-card ${privacy === 'public' ? 'selected' : ''}`} onClick={() => setPrivacy('public')}>
                        <div className="oc-header"><div className="oc-title">Public</div><div className="oc-check"></div></div>
                        <div className="oc-desc">Anyone can discover and join your pool from the tournaments page.</div>
                      </div>
                    </div>
                  </div>
                  {privacy === 'private' && (
                    <div className="field">
                      <label className="field-label">Invite code</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input className="field-input" type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} style={{ flex: 1 }} />
                        <button className="btn-ghost" onClick={generateCode}>Regenerate</button>
                      </div>
                      <div className="field-hint">Players join at pickpoolr.com/join/{inviteCode}</div>
                    </div>
                  )}
                  <div className="field">
                    <label className="field-label">Max players <span style={{ color: 'var(--f4)', fontWeight: 400 }}>(optional)</span></label>
                    <input 
                      className="field-input" 
                      type="number" 
                      min="2" 
                      max="500" 
                      placeholder="No limit"
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(e.target.value)}
                    />
                    <div className="field-hint">Leave blank for unlimited</div>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-ghost" onClick={prevStep}>← Back</button>
                  <button className="btn-primary" onClick={nextStep}>Next →</button>
                </div>
              </div>
            </div>
            <Sidebar poolName={poolName} privacy={privacy} buyinAmount={buyinAmount} poolType={poolType} inviteCode={inviteCode} />
          </>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <>
            <div>
              <div className="form-card">
                <div className="fc-header">
                  <div className="fc-title">Payment Settings</div>
                  <div className="fc-sub">Set your buy-in amount and how the platform fee is handled</div>
                </div>
                <div className="fc-body">
                  <div className="field">
                    <label className="field-label">Pool type</label>
                    <div className="option-grid">
                      <div className={`option-card ${poolType === 'free' ? 'selected' : ''}`} onClick={() => setPoolType('free')}>
                        <div className="oc-header"><div className="oc-title">Free Pool</div><div className="oc-check"></div></div>
                        <div className="oc-desc">No buy-in required. Play for fun, bragging rights, or a trophy.</div>
                        <span className="oc-badge badge-free">No platform fee</span>
                      </div>
                      <div className={`option-card ${poolType === 'paid' ? 'selected' : ''}`} onClick={() => setPoolType('paid')}>
                        <div className="oc-header"><div className="oc-title">Paid Pool</div><div className="oc-check"></div></div>
                        <div className="oc-desc">Players pay a buy-in via Stripe. Funds held in escrow.</div>
                        <span className="oc-badge badge-paid">5% platform fee</span>
                      </div>
                    </div>
                  </div>
                  {poolType === 'free' && (
                    <div className="free-note">
                      <div className="free-note-title">Free pool · zero platform fee</div>
                      <div className="free-note-desc">No payment processing needed. Players join for free.</div>
                    </div>
                  )}
                  {poolType === 'paid' && (
                    <>
                      <div className="field" style={{ marginTop: '1rem' }}>
                        <label className="field-label">Buy-in amount per player</label>
                        <div className="amount-wrap">
                          <span className="amount-prefix">$</span>
                          <input 
                            className="field-input amount-input" 
                            type="number" 
                            min="1" 
                            max="10000" 
                            placeholder="20"
                            value={buyinAmount}
                            onChange={(e) => setBuyinAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field-label">Platform fee handling</label>
                        <div style={{ fontSize: '0.75rem', color: 'var(--f3)', marginBottom: '0.5rem' }}>
                          The 5% PickPoolr fee can be structured either way.
                        </div>
                        <div className="fee-toggle">
                          <button className={`fee-opt ${feeType === 'on_top' ? 'active' : ''}`} onClick={() => setFeeType('on_top')}>Players pay +5%</button>
                          <button className={`fee-opt ${feeType === 'absorbed' ? 'active' : ''}`} onClick={() => setFeeType('absorbed')}>Deduct from pot</button>
                        </div>
                      </div>
                      <div className="stripe-panel">
                        <div className="stripe-panel-title">🔒 <span className="stripe-logo">stripe</span> Secure payments</div>
                        <div className="stripe-panel-desc">Players pay via Stripe Checkout. Funds held in escrow until tournament ends.</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="form-actions">
                  <button className="btn-ghost" onClick={prevStep}>← Back</button>
                  <button className="btn-primary" onClick={nextStep}>Next →</button>
                </div>
              </div>
            </div>
            <PaymentSidebar poolType={poolType} buyinAmount={buyinAmount} feeType={feeType} />
          </>
        )}

        {/* STEP 4: PRIZES */}
        {step === 4 && (
          <>
            <div>
              <div className="form-card">
                <div className="fc-header">
                  <div className="fc-title">Prize Distribution</div>
                  <div className="fc-sub">Decide how the pot is split among winners</div>
                </div>
                <div className="fc-body">
                  <div className="field">
                    <label className="field-label">Prize structure</label>
                    <div className="option-grid three">
                      <div className={`option-card center ${prizeType === 'winner' ? 'selected' : ''}`} onClick={() => selectPrize('winner')}>
                        <div className="oc-header center"><div className="oc-title">Winner</div></div>
                        <div className="oc-desc center">1st takes all</div>
                        <div className="prize-pct">100%</div>
                      </div>
                      <div className={`option-card center ${prizeType === 'top3' ? 'selected' : ''}`} onClick={() => selectPrize('top3')}>
                        <div className="oc-header center"><div className="oc-title">Top 3</div></div>
                        <div className="oc-desc center">60 / 30 / 10</div>
                        <div className="prize-pct">3 winners</div>
                      </div>
                      <div className={`option-card center ${prizeType === 'custom' ? 'selected' : ''}`} onClick={() => selectPrize('custom')}>
                        <div className="oc-header center"><div className="oc-title">Custom</div></div>
                        <div className="oc-desc center">Set your own split</div>
                        <div className="prize-pct muted">· %</div>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Payout breakdown</label>
                    <div className="prize-rows">
                      {prizes.map((p, i) => (
                        <div key={i} className="prize-row">
                          <div className="prize-place">{i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'} {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'}</div>
                          <input 
                            className="field-input" 
                            type="number" 
                            value={p.percent}
                            onChange={(e) => {
                              const newPrizes = [...prizes]
                              newPrizes[i].percent = parseInt(e.target.value) || 0
                              setPrizes(newPrizes)
                            }}
                            min="0" 
                            max="100"
                          />
                          <div className="prize-pct-label">%</div>
                        </div>
                      ))}
                    </div>
                    <div className="prize-total">
                      <div className="prize-total-label">Total allocated</div>
                      <div className={`prize-total-val ${prizeTotal === 100 ? 'ok' : 'err'}`}>{prizeTotal}%</div>
                    </div>
                    <div className={`field-hint ${prizeTotal === 100 ? 'ok' : 'err'}`}>
                      {prizeTotal === 100 ? '✓ Allocations confirmed · must total exactly 100%' : `Must add up to exactly 100% (currently ${prizeTotal}%)`}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-ghost" onClick={prevStep}>← Back</button>
                  <button className="btn-primary" onClick={nextStep}>Review pool →</button>
                </div>
              </div>
            </div>
            <PrizeSidebar poolType={poolType} buyinAmount={buyinAmount} prizes={prizes} />
          </>
        )}

        {/* STEP 5: REVIEW */}
        {step === 5 && (
          <>
            <div>
              <div className="form-card">
                <div className="fc-header">
                  <div className="fc-title">Review & Create</div>
                  <div className="fc-sub">Double-check everything before creating your pool</div>
                </div>
                <div className="fc-body">
                  <div className="review-grid">
                    <div>
                      <div className="field-label" style={{ marginBottom: '0.75rem' }}>Pool Details</div>
                      <div className="preview-row"><div className="preview-label">Name</div><div className="preview-val">{poolName || '-'}</div></div>
                      <div className="preview-row"><div className="preview-label">Tournament</div><div className="preview-val">World Cup 2026</div></div>
                      <div className="preview-row"><div className="preview-label">Deadline</div><div className="preview-val">1hr before kickoff</div></div>
                    </div>
                    <div>
                      <div className="field-label" style={{ marginBottom: '0.75rem' }}>Settings</div>
                      <div className="preview-row"><div className="preview-label">Privacy</div><div className="preview-val green">{privacy === 'private' ? 'Private' : 'Public'}</div></div>
                      <div className="preview-row"><div className="preview-label">Pool type</div><div className="preview-val">{poolType === 'free' ? 'Free' : 'Paid'}</div></div>
                      <div className="preview-row"><div className="preview-label">Prize</div><div className="preview-val gold">{prizeType === 'winner' ? 'Winner takes all' : prizeType === 'top3' ? 'Top 3 (60/30/10)' : 'Custom'}</div></div>
                    </div>
                  </div>
                </div>
                <div className="fc-body" style={{ background: 'rgba(201,168,76,0.04)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--f3)', lineHeight: 1.7 }}>
                    By creating this pool you agree to our <Link href="/terms" style={{ color: 'var(--gold)' }}>Terms of Service</Link>. As commissioner, you are responsible for your pool&apos;s conduct. PickPoolr is an entertainment platform · not a gambling service.
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-ghost" onClick={prevStep}>← Back</button>
                  <button className="btn-primary green" onClick={handleCreate} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Pool ✓'}
                  </button>
                </div>
              </div>
            </div>
            <NextStepsSidebar />
          </>
        )}
      </div>

      <style jsx global>{`${wizardStyles}`}</style>
    </>
  )
}

function Sidebar({ poolName, privacy, buyinAmount, poolType, inviteCode }) {
  return (
    <div className="sidebar-card">
      <div className="sc-head"><div className="sc-title">Pool Preview</div></div>
      <div className="sc-body">
        <div className="preview-name">{poolName || 'Your Pool Name'}</div>
        <div className="preview-meta">FIFA World Cup 2026</div>
        <div className="preview-row"><div className="preview-label">Privacy</div><div className="preview-val">{privacy === 'private' ? 'Private' : 'Public'}</div></div>
        {inviteCode && <div className="preview-row"><div className="preview-label">Invite link</div><div className="preview-val gold small">pickpoolr.com/join/{inviteCode}</div></div>}
        <div className="preview-row"><div className="preview-label">Buy-in</div><div className="preview-val">{poolType === 'paid' && buyinAmount ? `$${buyinAmount}` : 'Free'}</div></div>
      </div>
      <style jsx global>{`${sidebarStyles}`}</style>
    </div>
  )
}

function PaymentSidebar({ poolType, buyinAmount, feeType }) {
  const buyin = parseFloat(buyinAmount) || 0
  const fee = buyin * 0.05
  const total = feeType === 'on_top' ? buyin + fee : buyin
  
  return (
    <div>
      <div className="sidebar-card">
        <div className="sc-head"><div className="sc-title">Payment Summary</div></div>
        <div className="sc-body">
          <div className="preview-row"><div className="preview-label">Pool type</div><div className={`preview-val ${poolType === 'free' ? 'green' : 'gold'}`}>{poolType === 'free' ? 'Free' : 'Paid'}</div></div>
          <div className="preview-row"><div className="preview-label">Buy-in</div><div className="preview-val">{poolType === 'paid' && buyin > 0 ? `$${buyin.toFixed(2)}` : '-'}</div></div>
          <div className="preview-row"><div className="preview-label">Platform fee</div><div className="preview-val">{poolType === 'free' ? 'None' : feeType === 'on_top' ? '+5% on top' : '5% from pot'}</div></div>
          <div className="preview-row highlight"><div className="preview-label">Each player pays</div><div className="preview-val gold">{poolType === 'free' ? 'Free' : `$${total.toFixed(2)}`}</div></div>
        </div>
      </div>
      <div className="sidebar-card gold-bg">
        <div className="sc-head gold"><div className="sc-title gold">About the 5% fee</div></div>
        <div className="sc-body">
          <p className="info-text">Only applies to paid Stripe pools. Free pools have zero platform fee.</p>
        </div>
      </div>
      <style jsx global>{`${sidebarStyles}`}</style>
    </div>
  )
}

function PrizeSidebar({ poolType, buyinAmount, prizes }) {
  const buyin = parseFloat(buyinAmount) || 0
  const pot = buyin * 10 // assume 10 players
  const first = prizes[0] ? (pot * prizes[0].percent / 100) : 0
  
  return (
    <div className="sidebar-card">
      <div className="sc-head"><div className="sc-title">Estimated Payouts</div></div>
      <div className="sc-body">
        <div style={{ fontSize: '0.72rem', color: 'var(--f4)', marginBottom: '0.75rem' }}>Based on 10 players</div>
        <div className="preview-row"><div className="preview-label">🏆 1st Place</div><div className="preview-val gold">{poolType === 'paid' && buyin > 0 ? `$${first.toFixed(0)}` : '-'}</div></div>
        <div className="preview-row"><div className="preview-label">Total pot</div><div className="preview-val">{poolType === 'paid' && buyin > 0 ? `$${pot.toFixed(0)}` : 'Free pool'}</div></div>
      </div>
      <style jsx global>{`${sidebarStyles}`}</style>
    </div>
  )
}

function NextStepsSidebar() {
  return (
    <div className="sidebar-card">
      <div className="sc-head"><div className="sc-title">What happens next</div></div>
      <div className="sc-body">
        <div className="next-steps">
          <div className="next-step"><div className="step-n">01</div><div className="step-t">Your pool is created instantly with a unique invite link</div></div>
          <div className="next-step"><div className="step-n">02</div><div className="step-t">Share the link via WhatsApp, SMS, or email</div></div>
          <div className="next-step"><div className="step-n">03</div><div className="step-t">Players sign up and submit picks before Jun 11</div></div>
          <div className="next-step"><div className="step-n">04</div><div className="step-t">Leaderboard updates live as results come in</div></div>
        </div>
      </div>
      <style jsx global>{`${sidebarStyles}`}</style>
    </div>
  )
}

const sidebarStyles = `
  .sidebar-card {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 1rem;
    position: sticky;
    top: 76px;
  }
  .sidebar-card.gold-bg {
    background: rgba(201,168,76,0.05);
    border-color: var(--gold-line);
  }
  .sc-head {
    background: var(--bg3);
    padding: 0.6rem 1rem;
    border-bottom: 1px solid var(--line);
  }
  .sc-head.gold {
    background: rgba(201,168,76,0.08);
    border-color: rgba(201,168,76,0.15);
  }
  .sc-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--f3);
  }
  .sc-title.gold { color: var(--gold); }
  .sc-body { padding: 1rem; }
  .preview-name {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    text-transform: uppercase;
    color: var(--white);
    letter-spacing: 0.02em;
    margin-bottom: 0.25rem;
  }
  .preview-meta {
    font-size: 0.75rem;
    color: var(--f3);
    margin-bottom: 1rem;
  }
  .preview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .preview-row:last-child { border-bottom: none; }
  .preview-row.highlight {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--line);
  }
  .preview-label { font-size: 0.75rem; color: var(--f3); }
  .preview-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--f1);
  }
  .preview-val.gold { color: var(--gold); }
  .preview-val.green { color: var(--green); }
  .preview-val.small { font-size: 0.72rem; }
  .info-text {
    font-size: 0.75rem;
    color: var(--f3);
    line-height: 1.6;
  }
  .next-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .next-step {
    display: flex;
    gap: 0.75rem;
  }
  .step-n {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.75rem;
    font-weight: 900;
    color: var(--gold);
    min-width: 20px;
  }
  .step-t {
    font-size: 0.75rem;
    color: var(--f2);
    line-height: 1.5;
  }
`

const wizardStyles = `
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
    margin-right: 2rem;
    padding-right: 2rem;
    border-right: 1px solid var(--f4);
    text-decoration: none;
  }
  .nav-logo span { color: var(--gold); }
  .nav-items { display: flex; height: 100%; }
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
  }
  .nav-item.active { color: var(--white); border-bottom-color: var(--gold); }
  .nav-back {
    margin-left: auto;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--f3);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .nav-back:hover { color: var(--f1); }

  .page-header {
    background: var(--bg2);
    border-bottom: 1px solid var(--line);
    padding: 1.5rem 2rem;
  }
  .page-header-inner { max-width: 900px; margin: 0 auto; }
  .page-eyebrow {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 0.4rem;
  }
  .page-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--white);
  }
  .page-sub {
    font-size: 0.82rem;
    color: var(--f3);
    margin-top: 0.25rem;
  }

  .step-progress {
    background: var(--bg2);
    border-bottom: 1px solid var(--line);
    padding: 0 2rem;
  }
  .step-progress-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
  }
  .sp-step {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1.25rem 0.85rem 0;
    margin-right: 1.25rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--f4);
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }
  .sp-step.done { color: var(--green); }
  .sp-step.active { color: var(--white); border-bottom-color: var(--gold); }
  .sp-step.active .sp-num { background: var(--gold); color: #000; border-color: var(--gold); }
  .sp-step.done .sp-num { background: var(--green); color: #000; border-color: var(--green); }
  .sp-num {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid var(--f4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 900;
    color: var(--f4);
    flex-shrink: 0;
  }

  .main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 2rem;
    align-items: start;
  }

  .form-card {
    background: var(--bg2);
    border: 1px solid var(--line);
    border-radius: 4px;
    overflow: hidden;
  }
  .fc-header {
    background: var(--bg3);
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--line);
  }
  .fc-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--white);
  }
  .fc-sub {
    font-size: 0.72rem;
    color: var(--f3);
    margin-top: 2px;
  }
  .fc-body { padding: 1.5rem 1.25rem; }
  .fc-body + .fc-body { border-top: 1px solid var(--line); }

  .field { margin-bottom: 1.25rem; }
  .field:last-child { margin-bottom: 0; }
  .field-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--f2);
    margin-bottom: 0.5rem;
    display: block;
  }
  .field-hint {
    font-size: 0.72rem;
    color: var(--f4);
    margin-top: 0.3rem;
  }
  .field-hint.ok { color: var(--green); }
  .field-hint.err { color: var(--red); }
  .field-input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    background: var(--bg3);
    border: 1px solid var(--f4);
    border-radius: 3px;
    color: var(--f1);
    font-size: 0.88rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
  }
  .field-input:focus { border-color: var(--gold); }
  .field-input::placeholder { color: var(--f4); }
  textarea.field-input {
    resize: vertical;
    min-height: 80px;
    line-height: 1.5;
  }
  .field-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8780' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
  }

  .option-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .option-grid.three { grid-template-columns: repeat(3, 1fr); }
  .option-card {
    border: 1px solid var(--f4);
    border-radius: 3px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }
  .option-card:hover { border-color: var(--f3); background: rgba(255,255,255,0.02); }
  .option-card.selected { border-color: var(--gold); background: rgba(201,168,76,0.07); }
  .option-card.center { text-align: center; }
  .oc-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .oc-header.center { justify-content: center; }
  .oc-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--white);
  }
  .oc-check {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--f4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .option-card.selected .oc-check { border-color: var(--gold); background: var(--gold); }
  .option-card.selected .oc-check::after {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #000;
  }
  .oc-desc {
    font-size: 0.75rem;
    color: var(--f3);
    line-height: 1.5;
  }
  .oc-desc.center { text-align: center; }
  .oc-badge {
    display: inline-block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    margin-top: 0.5rem;
  }
  .badge-free { background: rgba(44,182,125,0.15); color: var(--green); border: 1px solid rgba(44,182,125,0.25); }
  .badge-paid { background: rgba(201,168,76,0.12); color: var(--gold); border: 1px solid var(--gold-line); }
  .badge-rec { background: rgba(201,168,76,0.12); color: var(--gold); border: 1px solid var(--gold-line); font-size: 0.58rem; }
  .prize-pct {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    color: var(--gold);
    margin-top: 0.5rem;
  }
  .prize-pct.muted { color: var(--f4); }

  .free-note {
    background: rgba(44,182,125,0.06);
    border: 1px solid rgba(44,182,125,0.2);
    border-radius: 4px;
    padding: 0.85rem 1rem;
    margin-top: 0.25rem;
  }
  .free-note-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green);
    margin-bottom: 0.35rem;
  }
  .free-note-desc {
    font-size: 0.75rem;
    color: var(--f3);
    line-height: 1.6;
  }

  .amount-wrap { position: relative; }
  .amount-prefix {
    position: absolute;
    left: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--f3);
  }
  .amount-input {
    padding-left: 1.75rem !important;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--gold) !important;
  }

  .fee-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid var(--f4);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 0.5rem;
  }
  .fee-opt {
    padding: 0.65rem 1rem;
    text-align: center;
    cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--f3);
    background: transparent;
    border: none;
    border-right: 1px solid var(--f4);
    transition: all 0.15s;
  }
  .fee-opt:last-child { border-right: none; }
  .fee-opt.active { background: var(--gold); color: #000; }

  .stripe-panel {
    background: rgba(99,91,255,0.06);
    border: 1px solid rgba(99,91,255,0.2);
    border-radius: 4px;
    padding: 1rem;
    margin-top: 0.75rem;
  }
  .stripe-panel-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #7c75ff;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .stripe-logo {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    color: #7c75ff;
  }
  .stripe-panel-desc {
    font-size: 0.75rem;
    color: var(--f3);
    line-height: 1.6;
  }

  .prize-rows {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .prize-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.75rem;
  }
  .prize-place {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--f3);
    white-space: nowrap;
    min-width: 56px;
  }
  .prize-pct-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--f2);
    min-width: 28px;
    text-align: right;
  }
  .prize-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--line);
  }
  .prize-total-label { font-size: 0.75rem; color: var(--f3); }
  .prize-total-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
  }
  .prize-total-val.ok { color: var(--green); }
  .prize-total-val.err { color: var(--red); }

  .review-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .preview-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .preview-row:last-child { border-bottom: none; }
  .preview-label { font-size: 0.75rem; color: var(--f3); }
  .preview-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--f1);
  }
  .preview-val.gold { color: var(--gold); }
  .preview-val.green { color: var(--green); }

  .form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--line);
    background: var(--bg3);
  }
  .btn-primary {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--gold);
    color: #000;
    padding: 0.65rem 1.75rem;
    border-radius: 2px;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--gold2); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-primary.green { background: var(--green); }
  .btn-primary.green:hover:not(:disabled) { opacity: 0.88; }
  .btn-ghost {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: transparent;
    color: var(--f3);
    border: 1px solid var(--f4);
    padding: 0.6rem 1.25rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-ghost:hover { color: var(--f1); border-color: var(--f2); }

  /* SUCCESS */
  .success-wrap {
    max-width: 680px;
    margin: 3rem auto;
    padding: 0 2rem;
    text-align: center;
  }
  .success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(44,182,125,0.12);
    border: 2px solid var(--green);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.5rem;
  }
  .success-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2.5rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--white);
    margin-bottom: 0.5rem;
  }
  .success-sub {
    font-size: 0.9rem;
    color: var(--f2);
    line-height: 1.7;
    max-width: 440px;
    margin: 0 auto 2rem;
  }
  .invite-box {
    background: var(--bg2);
    border: 1px solid var(--gold-line);
    border-radius: 4px;
    padding: 1rem 1.25rem;
    text-align: left;
    margin-bottom: 1.5rem;
  }
  .invite-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--f3);
    margin-bottom: 0.5rem;
  }
  .invite-link-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .invite-link {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--gold);
    flex: 1;
    word-break: break-all;
    letter-spacing: 0.02em;
  }
  .btn-copy {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--gold);
    color: #000;
    padding: 0.5rem 1rem;
    border-radius: 2px;
    border: none;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-copy:hover { background: var(--gold2); }
  .success-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  .btn-wa {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    background: rgba(37,211,102,0.12);
    color: #25d366;
    border: 1px solid rgba(37,211,102,0.25);
    padding: 0.6rem 1.25rem;
    border-radius: 2px;
    cursor: pointer;
    text-decoration: none;
  }
  .btn-wa:hover { background: rgba(37,211,102,0.2); }
  .btn-go {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: var(--gold);
    color: #000;
    padding: 0.65rem 1.75rem;
    border-radius: 2px;
    border: none;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
  }

  @media (max-width: 768px) {
    nav { padding: 0 1rem; }
    .nav-logo { font-size: 1.6rem; margin-right: 0; padding-right: 0; border-right: none; }
    .nav-items { display: none; }
    .page-header { padding: 1rem; }
    .step-progress { overflow-x: auto; padding: 0 1rem; }
    .sp-step { font-size: 0.65rem; padding-right: 0.75rem; margin-right: 0.75rem; }
    .main { grid-template-columns: 1fr; padding: 1rem; }
    .option-grid.three { grid-template-columns: 1fr; }
    .review-grid { grid-template-columns: 1fr; }
  }
`
