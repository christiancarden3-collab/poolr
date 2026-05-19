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
  const [error, setError] = useState('')

  // Form state
  const [poolName, setPoolName] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('1hr')
  const [privacy, setPrivacy] = useState('private')
  const [inviteCode, setInviteCode] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [poolType, setPoolType] = useState('free')
  const [buyIn, setBuyIn] = useState(20)
  const [feeHandling, setFeeHandling] = useState('on_top')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [prizeStructure, setPrizeStructure] = useState('winner')
  const [prizes, setPrizes] = useState([{ place: 1, pct: 100 }])
  const [success, setSuccess] = useState(false)
  const [createdPoolId, setCreatedPoolId] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    // Generate invite code from pool name
    if (poolName) {
      const code = poolName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10) || 'pool26'
      setInviteCode(code)
    }
  }, [poolName])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      router.push('/login?redirect=/create')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }

  const regenerateCode = () => {
    const codes = ['pool26', 'wc2026', 'group26', 'amigos26', 'champs26', 'final26', 'mypool', 'picks26']
    setInviteCode(codes[Math.floor(Math.random() * codes.length)])
  }

  const handlePrizeStructure = (type) => {
    setPrizeStructure(type)
    if (type === 'winner') {
      setPrizes([{ place: 1, pct: 100 }])
    } else if (type === 'top3') {
      setPrizes([{ place: 1, pct: 60 }, { place: 2, pct: 30 }, { place: 3, pct: 10 }])
    } else {
      setPrizes([{ place: 1, pct: 60 }, { place: 2, pct: 25 }, { place: 3, pct: 15 }])
    }
  }

  const updatePrize = (index, value) => {
    const newPrizes = [...prizes]
    newPrizes[index].pct = parseInt(value) || 0
    setPrizes(newPrizes)
  }

  const prizeTotal = prizes.reduce((sum, p) => sum + p.pct, 0)

  const fee = buyIn * 0.05
  const playerPays = feeHandling === 'on_top' ? buyIn + fee : buyIn
  const netPerPlayer = feeHandling === 'absorbed' ? buyIn - fee : buyIn

  const handleCreate = async () => {
    if (prizeTotal !== 100) {
      setError('Prize allocations must total 100%')
      return
    }
    
    setCreating(true)
    setError('')
    
    try {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id')
        .eq('slug', 'world-cup-2026')
        .single()

      const prizeObj = {}
      prizes.forEach(p => { prizeObj[p.place] = p.pct })
      
      const { data: pool, error: poolError } = await supabase
        .from('pools')
        .insert({
          name: poolName,
          description: description || null,
          tournament_id: tournament?.id || null,
          commissioner_id: user.id,
          buy_in: poolType === 'paid' ? buyIn : 0,
          visibility: privacy,
          access_type: privacy === 'private' ? 'invite' : 'invite',
          invite_code: inviteCode.toUpperCase(),
          payment_method: poolType === 'paid' ? 'stripe' : 'external',
          payment_instructions: paymentNotes || null,
          fee_handling: feeHandling,
          prize_structure: prizeObj,
          status: 'open'
        })
        .select()
        .single()

      if (poolError) throw poolError

      await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: user.id,
          payment_status: 'paid',
          total_points: 0,
          rank: 1
        })

      setCreatedPoolId(pool.id)
      setSuccess(true)
    } catch (err) {
      console.error('Create pool error:', err)
      setError(err.message || 'Failed to create pool')
      setCreating(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(`https://pickpoolr.com/join/${inviteCode.toUpperCase()}`)
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="logo">Pick<span>Poolr</span></div>
        <p>Loading...</p>
        <style jsx>{`
          .loading-screen{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0c10}
          .logo{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;color:#fff;text-transform:uppercase}
          .logo span{color:#c9a84c}
          p{color:#8a8780;margin-top:1rem}
        `}</style>
      </div>
    )
  }

  if (success) {
    return (
      <>
        <style jsx global>{styles}</style>
        <nav className="nav">
          <Link href="/" className="nav-logo">Pick<span>Poolr</span></Link>
        </nav>
        <div className="success-wrap">
          <div className="success-icon">✓</div>
          <div className="success-title">Pool Created!</div>
          <div className="success-sub">Your pool is live. Share the invite link and let the predictions begin. Special picks lock at first kickoff on June 11.</div>
          <div className="invite-box">
            <div className="invite-label">Invite Link</div>
            <div className="invite-link-row">
              <div className="invite-link">pickpoolr.com/join/{inviteCode.toUpperCase()}</div>
              <button className="btn-copy" onClick={copyLink}>Copy</button>
            </div>
          </div>
          <div className="success-actions">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Join my World Cup 2026 pool! https://pickpoolr.com/join/${inviteCode.toUpperCase()}`)}`} target="_blank" className="btn-wa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </a>
            <Link href={`/pool/${createdPoolId}`} className="btn-go">Go to My Pool →</Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style jsx global>{styles}</style>
      
      <nav className="nav">
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

      <div className="step-progress">
        <div className="step-progress-inner">
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`sp-step ${step === n ? 'active' : ''} ${step > n ? 'done' : ''}`} onClick={() => n < step && setStep(n)}>
              <div className="sp-num">{step > n ? '✓' : n}</div>
              {['Details', 'Privacy', 'Payment', 'Prizes', 'Review'][n-1]}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* STEP 1 - DETAILS */}
      {step === 1 && (
        <div className="main">
          <div>
            <div className="form-card">
              <div className="fc-header"><div className="fc-title">Pool Details</div><div className="fc-sub">Give your pool a name and pick your tournament</div></div>
              <div className="fc-body">
                <div className="field">
                  <label className="field-label">Pool Name</label>
                  <input className="field-input" type="text" placeholder="e.g. Amigos WC26 Pool" value={poolName} onChange={e => setPoolName(e.target.value)} />
                  <div className="field-hint">This is what your players see when they join</div>
                </div>
                <div className="field">
                  <label className="field-label">Description <span style={{color:'var(--f4)',fontWeight:400}}>(optional)</span></label>
                  <textarea className="field-input" placeholder="Any rules or notes for your players..." value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Tournament</label>
                  <select className="field-input"><option>FIFA World Cup 2026 — USA, Canada & Mexico</option></select>
                  <div className="field-hint">More tournaments coming soon</div>
                </div>
                <div className="field">
                  <label className="field-label">Picks deadline</label>
                  <select className="field-input" value={deadline} onChange={e => setDeadline(e.target.value)}>
                    <option value="1hr">1 hour before first match of each matchday</option>
                    <option value="2hr">2 hours before first match of each matchday</option>
                    <option value="24hr">24 hours before first match of each matchday</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <div style={{fontSize:'0.75rem',color:'var(--f4)'}}>Step 1 of 5</div>
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!poolName.trim()}>Next →</button>
              </div>
            </div>
          </div>
          <Sidebar poolName={poolName} privacy={privacy} poolType={poolType} buyIn={buyIn} prizeStructure={prizeStructure} prizes={prizes} />
        </div>
      )}

      {/* STEP 2 - PRIVACY */}
      {step === 2 && (
        <div className="main">
          <div>
            <div className="form-card">
              <div className="fc-header"><div className="fc-title">Privacy Settings</div><div className="fc-sub">Choose who can find and join your pool</div></div>
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
                    <div style={{display:'flex',gap:'0.5rem'}}>
                      <input className="field-input" type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)} style={{flex:1}} />
                      <button className="btn-ghost" onClick={regenerateCode}>Regenerate</button>
                    </div>
                    <div className="field-hint">Players join at pickpoolr.com/join/{inviteCode.toUpperCase()}</div>
                  </div>
                )}
                <div className="field">
                  <label className="field-label">Max players <span style={{color:'var(--f4)',fontWeight:400}}>(optional)</span></label>
                  <input className="field-input" type="number" min="2" max="500" placeholder="No limit" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} />
                  <div className="field-hint">Leave blank for unlimited</div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          </div>
          <Sidebar poolName={poolName} privacy={privacy} poolType={poolType} buyIn={buyIn} prizeStructure={prizeStructure} prizes={prizes} inviteCode={inviteCode} />
        </div>
      )}

      {/* STEP 3 - PAYMENT */}
      {step === 3 && (
        <div className="main">
          <div>
            <div className="form-card">
              <div className="fc-header"><div className="fc-title">Payment Settings</div><div className="fc-sub">Set your buy-in amount and how the platform fee is handled</div></div>
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
                      <div className="oc-desc">Players pay a buy-in via Stripe. Funds held in escrow. Winners paid automatically.</div>
                      <span className="oc-badge badge-paid">5% platform fee</span>
                    </div>
                  </div>
                </div>
                
                {poolType === 'free' && (
                  <div className="free-note">
                    <div className="free-note-title">Free pool — zero platform fee</div>
                    <div className="free-note-desc">No payment processing needed. Players join for free.</div>
                  </div>
                )}
                
                {poolType === 'paid' && (
                  <div className="paid-options">
                    <div className="field">
                      <label className="field-label">Buy-in amount per player</label>
                      <div className="amount-wrap">
                        <span className="amount-prefix">$</span>
                        <input className="field-input amount-input" type="number" min="1" max="10000" placeholder="20" value={buyIn} onChange={e => setBuyIn(parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Platform fee handling</label>
                      <div style={{fontSize:'0.75rem',color:'var(--f3)',marginBottom:'0.5rem'}}>The 5% PickPoolr fee can be structured either way.</div>
                      <div className="fee-toggle">
                        <button className={`fee-opt ${feeHandling === 'on_top' ? 'active' : ''}`} onClick={() => setFeeHandling('on_top')}>Players pay +5%</button>
                        <button className={`fee-opt ${feeHandling === 'absorbed' ? 'active' : ''}`} onClick={() => setFeeHandling('absorbed')}>Deduct from pot</button>
                      </div>
                      {feeHandling === 'on_top' && (
                        <div className="field-hint">Each player pays ${playerPays.toFixed(2)} — buy-in + 5% fee. Full buy-in goes to the prize pot.</div>
                      )}
                      {feeHandling === 'absorbed' && (
                        <div className="field-hint">Each player pays ${buyIn.toFixed(2)}. The 5% (${fee.toFixed(2)}) is deducted from the pot. Net per player: ${netPerPlayer.toFixed(2)}.</div>
                      )}
                    </div>
                    <div className="stripe-panel">
                      <div className="stripe-panel-title">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span className="stripe-logo">stripe</span> Secure payments
                      </div>
                      <div className="stripe-panel-desc">Players pay via Stripe Checkout. Funds held in escrow until tournament ends, then paid out to winners automatically.</div>
                    </div>
                  </div>
                )}
                
                <div className="field" style={{marginTop:'1rem'}}>
                  <label className="field-label">Payment notes <span style={{color:'var(--f4)',fontWeight:400}}>(optional)</span></label>
                  <input className="field-input" type="text" placeholder="Any payment instructions for your players..." value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} />
                  <div className="field-hint">Shown to players on the pool page</div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(4)}>Next →</button>
              </div>
            </div>
          </div>
          <PaymentSidebar poolType={poolType} buyIn={buyIn} feeHandling={feeHandling} playerPays={playerPays} />
        </div>
      )}

      {/* STEP 4 - PRIZES */}
      {step === 4 && (
        <div className="main">
          <div>
            <div className="form-card">
              <div className="fc-header"><div className="fc-title">Prize Distribution</div><div className="fc-sub">Decide how the pot is split among winners</div></div>
              <div className="fc-body">
                <div className="field">
                  <label className="field-label">Prize structure</label>
                  <div className="option-grid" style={{gridTemplateColumns:'repeat(3, 1fr)'}}>
                    <div className={`option-card ${prizeStructure === 'winner' ? 'selected' : ''}`} onClick={() => handlePrizeStructure('winner')} style={{textAlign:'center'}}>
                      <div className="oc-header" style={{justifyContent:'center'}}><div className="oc-title">Winner</div></div>
                      <div className="oc-desc" style={{textAlign:'center'}}>1st takes all</div>
                      <div className="prize-pct">100%</div>
                    </div>
                    <div className={`option-card ${prizeStructure === 'top3' ? 'selected' : ''}`} onClick={() => handlePrizeStructure('top3')} style={{textAlign:'center'}}>
                      <div className="oc-header" style={{justifyContent:'center'}}><div className="oc-title">Top 3</div></div>
                      <div className="oc-desc" style={{textAlign:'center'}}>60 / 30 / 10</div>
                      <div className="prize-pct">3 winners</div>
                    </div>
                    <div className={`option-card ${prizeStructure === 'custom' ? 'selected' : ''}`} onClick={() => handlePrizeStructure('custom')} style={{textAlign:'center'}}>
                      <div className="oc-header" style={{justifyContent:'center'}}><div className="oc-title">Custom</div></div>
                      <div className="oc-desc" style={{textAlign:'center'}}>Set your own split</div>
                      <div className="prize-pct" style={{color:'var(--f4)'}}>— %</div>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Payout breakdown</label>
                  <div className="prize-rows">
                    {prizes.map((p, i) => (
                      <div key={i} className="prize-row">
                        <div className="prize-place">{['🏆 1st', '🥈 2nd', '🥉 3rd'][i]}</div>
                        <input className="field-input" type="number" value={p.pct} min="0" max="100" onChange={e => updatePrize(i, e.target.value)} />
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.85rem',fontWeight:700,color:'var(--f2)',minWidth:28,textAlign:'right'}}>%</div>
                      </div>
                    ))}
                  </div>
                  <div className="prize-total">
                    <div className="prize-total-label">Total allocated</div>
                    <div className={`prize-total-val ${prizeTotal === 100 ? 'ok' : 'err'}`}>{prizeTotal}%</div>
                  </div>
                  <div className="field-hint" style={{color: prizeTotal === 100 ? 'var(--green)' : 'var(--red)'}}>
                    {prizeTotal === 100 ? '✓ Allocations confirmed — must total exactly 100%' : `Must add up to exactly 100% (currently ${prizeTotal}%)`}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(5)} disabled={prizeTotal !== 100}>Review pool →</button>
              </div>
            </div>
          </div>
          <PrizeSidebar poolType={poolType} buyIn={buyIn} prizes={prizes} />
        </div>
      )}

      {/* STEP 5 - REVIEW */}
      {step === 5 && (
        <div className="main">
          <div>
            <div className="form-card">
              <div className="fc-header"><div className="fc-title">Review & Create</div><div className="fc-sub">Double-check everything before creating your pool</div></div>
              <div className="fc-body">
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div>
                    <div className="field-label" style={{marginBottom:'0.75rem'}}>Pool Details</div>
                    <div className="preview-row"><div className="preview-label">Name</div><div className="preview-val">{poolName || '—'}</div></div>
                    <div className="preview-row"><div className="preview-label">Tournament</div><div className="preview-val">World Cup 2026</div></div>
                    <div className="preview-row"><div className="preview-label">Deadline</div><div className="preview-val">{deadline === '1hr' ? '1hr before kickoff' : deadline === '2hr' ? '2hrs before kickoff' : '24hrs before kickoff'}</div></div>
                  </div>
                  <div>
                    <div className="field-label" style={{marginBottom:'0.75rem'}}>Settings</div>
                    <div className="preview-row"><div className="preview-label">Privacy</div><div className="preview-val" style={{color:'var(--green)'}}>{privacy === 'private' ? 'Private' : 'Public'}</div></div>
                    <div className="preview-row"><div className="preview-label">Pool type</div><div className="preview-val">{poolType === 'free' ? 'Free' : 'Paid'}</div></div>
                    <div className="preview-row"><div className="preview-label">Prize</div><div className="preview-val" style={{color:'var(--gold)'}}>{prizeStructure === 'winner' ? 'Winner takes all' : prizeStructure === 'top3' ? 'Top 3 (60/30/10)' : 'Custom'}</div></div>
                  </div>
                </div>
              </div>
              <div className="fc-body" style={{background:'rgba(201,168,76,0.04)'}}>
                <div style={{fontSize:'0.78rem',color:'var(--f3)',lineHeight:1.7}}>
                  By creating this pool you agree to our <Link href="/terms" style={{color:'var(--gold)'}}>Terms of Service</Link>. As commissioner, you are responsible for your pool's conduct. PickPoolr is an entertainment platform — not a gambling service.
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost" onClick={() => setStep(4)}>← Back</button>
                <button className="btn-primary btn-green" onClick={handleCreate} disabled={creating}>
                  {creating ? 'Creating...' : 'Create Pool ✓'}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div className="sidebar-card">
              <div className="sc-head"><div className="sc-title">What happens next</div></div>
              <div className="sc-body">
                <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                  <div style={{display:'flex',gap:'0.75rem'}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.75rem',fontWeight:900,color:'var(--gold)',minWidth:20}}>01</div><div style={{fontSize:'0.75rem',color:'var(--f2)',lineHeight:1.5}}>Your pool is created instantly with a unique invite link</div></div>
                  <div style={{display:'flex',gap:'0.75rem'}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.75rem',fontWeight:900,color:'var(--gold)',minWidth:20}}>02</div><div style={{fontSize:'0.75rem',color:'var(--f2)',lineHeight:1.5}}>Share the link via WhatsApp, SMS, or email</div></div>
                  <div style={{display:'flex',gap:'0.75rem'}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.75rem',fontWeight:900,color:'var(--gold)',minWidth:20}}>03</div><div style={{fontSize:'0.75rem',color:'var(--f2)',lineHeight:1.5}}>Players sign up and submit picks before Jun 11</div></div>
                  <div style={{display:'flex',gap:'0.75rem'}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:'0.75rem',fontWeight:900,color:'var(--gold)',minWidth:20}}>04</div><div style={{fontSize:'0.75rem',color:'var(--f2)',lineHeight:1.5}}>Leaderboard updates live as results come in</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Sidebar({ poolName, privacy, poolType, buyIn, prizeStructure, prizes, inviteCode }) {
  return (
    <div>
      <div className="sidebar-card">
        <div className="sc-head"><div className="sc-title">Pool Preview</div></div>
        <div className="sc-body">
          <div className="preview-name">{poolName || 'Your Pool Name'}</div>
          <div className="preview-meta">FIFA World Cup 2026</div>
          <div className="preview-row"><div className="preview-label">Privacy</div><div className="preview-val" style={{color: privacy === 'private' ? 'var(--green)' : 'var(--f1)'}}>{privacy === 'private' ? 'Private' : 'Public'}</div></div>
          <div className="preview-row"><div className="preview-label">Buy-in</div><div className="preview-val">{poolType === 'paid' && buyIn > 0 ? `$${buyIn}` : 'Free'}</div></div>
          <div className="preview-row"><div className="preview-label">Payment</div><div className="preview-val">{poolType === 'paid' ? 'Stripe' : '—'}</div></div>
          <div className="preview-row"><div className="preview-label">1st Place</div><div className="preview-val gold">{prizes[0]?.pct}%</div></div>
        </div>
      </div>
    </div>
  )
}

function PaymentSidebar({ poolType, buyIn, feeHandling, playerPays }) {
  return (
    <div>
      <div className="sidebar-card">
        <div className="sc-head"><div className="sc-title">Payment Summary</div></div>
        <div className="sc-body">
          <div className="preview-row"><div className="preview-label">Pool type</div><div className="preview-val" style={{color: poolType === 'free' ? 'var(--green)' : 'var(--gold)'}}>{poolType === 'free' ? 'Free' : 'Paid'}</div></div>
          <div className="preview-row"><div className="preview-label">Buy-in</div><div className="preview-val">{poolType === 'paid' && buyIn > 0 ? `$${buyIn.toFixed(2)}` : '—'}</div></div>
          <div className="preview-row"><div className="preview-label">Platform fee</div><div className="preview-val">{poolType === 'free' ? 'None' : feeHandling === 'on_top' ? '+5% on top' : '5% from pot'}</div></div>
          <div className="preview-row" style={{marginTop:'0.5rem',paddingTop:'0.75rem',borderTop:'1px solid var(--line)'}}><div className="preview-label">Each player pays</div><div className="preview-val gold">{poolType === 'free' ? 'Free' : `$${playerPays.toFixed(2)}`}</div></div>
        </div>
      </div>
      <div className="sidebar-card" style={{background:'rgba(201,168,76,0.05)',borderColor:'var(--gold-line)'}}>
        <div className="sc-head" style={{background:'rgba(201,168,76,0.08)',borderColor:'rgba(201,168,76,0.15)'}}><div className="sc-title" style={{color:'var(--gold)'}}>About the 5% fee</div></div>
        <div className="sc-body" style={{fontSize:'0.75rem',color:'var(--f3)',lineHeight:1.6}}>Only applies to paid Stripe pools. Free pools have zero platform fee. Commissioners choose: players pay +5% on top, or 5% is deducted from the pot.</div>
      </div>
    </div>
  )
}

function PrizeSidebar({ poolType, buyIn, prizes }) {
  const examplePlayers = 10
  const pot = poolType === 'paid' ? buyIn * examplePlayers * 0.95 : 0
  return (
    <div>
      <div className="sidebar-card">
        <div className="sc-head"><div className="sc-title">Estimated Payouts</div></div>
        <div className="sc-body">
          <div style={{fontSize:'0.72rem',color:'var(--f4)',marginBottom:'0.75rem'}}>Based on {examplePlayers} players</div>
          <div className="preview-row"><div className="preview-label">🏆 1st Place</div><div className="preview-val gold">{poolType === 'paid' && pot > 0 ? `$${(pot * prizes[0].pct / 100).toFixed(0)}` : '—'}</div></div>
          <div className="preview-row"><div className="preview-label">Total pot</div><div className="preview-val">{poolType === 'paid' && pot > 0 ? `$${pot.toFixed(0)}` : 'Free pool'}</div></div>
        </div>
      </div>
    </div>
  )
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0c10;--bg2:#111318;--bg3:#181c24;--bg4:#1e2330;--gold:#c9a84c;--gold2:#e6c76a;--red:#e03b3b;--green:#2cb67d;--white:#ffffff;--f1:#f0ede8;--f2:#c8c5be;--f3:#8a8780;--f4:#4a4845;--line:rgba(255,255,255,0.07);--gold-line:rgba(201,168,76,0.3)}
body{background:var(--bg);color:var(--f1);font-family:'Inter',sans-serif;min-height:100vh}

.nav{background:var(--bg);border-bottom:3px solid var(--gold);display:flex;align-items:center;padding:0 2rem;height:56px;position:sticky;top:0;z-index:200}
.nav-logo{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;letter-spacing:0.04em;color:var(--white);text-transform:uppercase;margin-right:2rem;padding-right:2rem;border-right:1px solid var(--f4);text-decoration:none}
.nav-logo span{color:var(--gold)}
.nav-items{display:flex;height:100%}
.nav-item{display:flex;align-items:center;padding:0 1.25rem;font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none;border-bottom:3px solid transparent;margin-bottom:-3px}
.nav-item.active{color:var(--white);border-bottom-color:var(--gold)}
.nav-back{margin-left:auto;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f3);text-decoration:none}
.nav-back:hover{color:var(--f1)}

.page-header{background:var(--bg2);border-bottom:1px solid var(--line);padding:1.5rem 2rem}
.page-header-inner{max-width:900px;margin:0 auto}
.page-eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold);margin-bottom:0.4rem}
.page-title{font-family:'Barlow Condensed',sans-serif;font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:var(--white)}
.page-sub{font-size:0.82rem;color:var(--f3);margin-top:0.25rem}

.step-progress{background:var(--bg2);border-bottom:1px solid var(--line);padding:0 2rem}
.step-progress-inner{max-width:900px;margin:0 auto;display:flex}
.sp-step{display:flex;align-items:center;gap:0.6rem;padding:0.85rem 1.25rem 0.85rem 0;margin-right:1.25rem;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--f4);border-bottom:2px solid transparent;cursor:pointer}
.sp-step.done{color:var(--green)}
.sp-step.active{color:var(--white);border-bottom-color:var(--gold)}
.sp-step.active .sp-num{background:var(--gold);color:#000;border-color:var(--gold)}
.sp-step.done .sp-num{background:var(--green);color:#000;border-color:var(--green)}
.sp-num{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--f4);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:900;color:var(--f4);flex-shrink:0}

.error-banner{max-width:900px;margin:1rem auto;background:rgba(224,59,59,0.1);border:1px solid var(--red);color:var(--red);padding:0.75rem 1rem;border-radius:4px;font-size:0.85rem}

.main{max-width:900px;margin:0 auto;padding:2rem;display:grid;grid-template-columns:1fr 280px;gap:2rem;align-items:start}

.form-card{background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden}
.fc-header{background:var(--bg3);padding:0.75rem 1.25rem;border-bottom:1px solid var(--line)}
.fc-title{font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:var(--white)}
.fc-sub{font-size:0.72rem;color:var(--f3);margin-top:2px}
.fc-body{padding:1.5rem 1.25rem}
.fc-body+.fc-body{border-top:1px solid var(--line)}

.field{margin-bottom:1.25rem}
.field:last-child{margin-bottom:0}
.field-label{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--f2);margin-bottom:0.5rem;display:block}
.field-hint{font-size:0.72rem;color:var(--f4);margin-top:0.3rem}
.field-input{width:100%;padding:0.65rem 0.85rem;background:var(--bg3);border:1px solid var(--f4);border-radius:3px;color:var(--f1);font-size:0.88rem;font-family:'Inter',sans-serif;outline:none;transition:border-color 0.15s}
.field-input:focus{border-color:var(--gold)}
.field-input::placeholder{color:var(--f4)}
textarea.field-input{resize:vertical;min-height:80px;line-height:1.5}
select.field-input{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8780' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0.75rem center}

.option-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.75rem}
.option-card{border:1px solid var(--f4);border-radius:3px;padding:1rem;cursor:pointer;transition:all 0.15s;position:relative}
.option-card:hover{border-color:var(--f3);background:rgba(255,255,255,0.02)}
.option-card.selected{border-color:var(--gold);background:rgba(201,168,76,0.07)}
.oc-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem}
.oc-title{font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:var(--white)}
.oc-check{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--f4);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s}
.option-card.selected .oc-check{border-color:var(--gold);background:var(--gold)}
.option-card.selected .oc-check::after{content:'';display:block;width:6px;height:6px;border-radius:50%;background:#000}
.oc-desc{font-size:0.75rem;color:var(--f3);line-height:1.5}
.oc-badge{display:inline-block;font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.5rem;border-radius:2px;margin-top:0.5rem}
.badge-free{background:rgba(44,182,125,0.15);color:var(--green);border:1px solid rgba(44,182,125,0.25)}
.badge-paid{background:rgba(201,168,76,0.12);color:var(--gold);border:1px solid var(--gold-line)}
.badge-rec{background:rgba(201,168,76,0.12);color:var(--gold);border:1px solid var(--gold-line);font-size:0.58rem}

.free-note{background:rgba(44,182,125,0.06);border:1px solid rgba(44,182,125,0.2);border-radius:4px;padding:0.85rem 1rem;margin-top:0.25rem}
.free-note-title{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--green);margin-bottom:0.35rem}
.free-note-desc{font-size:0.75rem;color:var(--f3);line-height:1.6}

.paid-options{margin-top:1rem}

.amount-wrap{position:relative}
.amount-prefix{position:absolute;left:0.85rem;top:50%;transform:translateY(-50%);font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700;color:var(--f3)}
.amount-input{padding-left:1.75rem !important;font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;font-weight:700;color:var(--gold) !important}

.fee-toggle{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--f4);border-radius:3px;overflow:hidden;margin-top:0.5rem}
.fee-opt{padding:0.65rem 1rem;text-align:center;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--f3);background:transparent;border:none;border-right:1px solid var(--f4);transition:all 0.15s}
.fee-opt:last-child{border-right:none}
.fee-opt.active{background:var(--gold);color:#000}

.stripe-panel{background:rgba(99,91,255,0.06);border:1px solid rgba(99,91,255,0.2);border-radius:4px;padding:1rem;margin-top:0.75rem}
.stripe-panel-title{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7c75ff;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.4rem}
.stripe-panel-desc{font-size:0.75rem;color:var(--f3);line-height:1.6}
.stripe-logo{font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:900;letter-spacing:0.04em;color:#7c75ff}

.prize-pct{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:900;color:var(--gold);margin-top:0.5rem}

.prize-rows{display:flex;flex-direction:column;gap:0.5rem;margin-top:0.5rem}
.prize-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0.75rem}
.prize-place{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;color:var(--f3);white-space:nowrap;min-width:56px}
.prize-total{display:flex;align-items:center;justify-content:space-between;margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--line)}
.prize-total-label{font-size:0.75rem;color:var(--f3)}
.prize-total-val{font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;font-weight:700}
.prize-total-val.ok{color:var(--green)}
.prize-total-val.err{color:var(--red)}

.form-actions{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-top:1px solid var(--line);background:var(--bg3)}
.btn-primary{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.65rem 1.75rem;border-radius:2px;border:none;cursor:pointer;transition:background 0.15s}
.btn-primary:hover{background:var(--gold2)}
.btn-primary:disabled{opacity:0.5;cursor:not-allowed}
.btn-primary.btn-green{background:var(--green)}
.btn-primary.btn-green:hover{background:#3dd493}
.btn-ghost{font-family:'Barlow Condensed',sans-serif;font-size:0.82rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;background:transparent;color:var(--f3);border:1px solid var(--f4);padding:0.6rem 1.25rem;border-radius:2px;cursor:pointer;transition:all 0.15s}
.btn-ghost:hover{color:var(--f1);border-color:var(--f2)}

.sidebar-card{background:var(--bg2);border:1px solid var(--line);border-radius:4px;overflow:hidden;margin-bottom:1rem;position:sticky;top:76px}
.sc-head{background:var(--bg3);padding:0.6rem 1rem;border-bottom:1px solid var(--line)}
.sc-title{font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--f3)}
.sc-body{padding:1rem}
.preview-name{font-family:'Barlow Condensed',sans-serif;font-size:1.2rem;font-weight:900;text-transform:uppercase;color:var(--white);letter-spacing:0.02em;margin-bottom:0.25rem}
.preview-meta{font-size:0.75rem;color:var(--f3);margin-bottom:1rem}
.preview-row{display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.preview-row:last-child{border-bottom:none}
.preview-label{font-size:0.75rem;color:var(--f3)}
.preview-val{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:700;color:var(--f1)}
.preview-val.gold{color:var(--gold)}

.success-wrap{max-width:680px;margin:3rem auto;padding:0 2rem;text-align:center}
.success-icon{width:64px;height:64px;border-radius:50%;background:rgba(44,182,125,0.12);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;font-size:1.5rem;color:var(--green)}
.success-title{font-family:'Barlow Condensed',sans-serif;font-size:2.5rem;font-weight:900;text-transform:uppercase;letter-spacing:0.02em;color:var(--white);margin-bottom:0.5rem}
.success-sub{font-size:0.9rem;color:var(--f2);line-height:1.7;max-width:440px;margin:0 auto 2rem}
.invite-box{background:var(--bg2);border:1px solid var(--gold-line);border-radius:4px;padding:1rem 1.25rem;text-align:left;margin-bottom:1.5rem}
.invite-label{font-family:'Barlow Condensed',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--f3);margin-bottom:0.5rem}
.invite-link-row{display:flex;align-items:center;gap:0.75rem}
.invite-link{font-family:'Barlow Condensed',sans-serif;font-size:0.95rem;font-weight:600;color:var(--gold);flex:1;word-break:break-all;letter-spacing:0.02em}
.btn-copy{font-family:'Barlow Condensed',sans-serif;font-size:0.72rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.5rem 1rem;border-radius:2px;border:none;cursor:pointer;white-space:nowrap}
.btn-copy:hover{background:var(--gold2)}
.success-actions{display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap}
.btn-wa{display:flex;align-items:center;gap:0.5rem;font-family:'Barlow Condensed',sans-serif;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:rgba(37,211,102,0.12);color:#25d366;border:1px solid rgba(37,211,102,0.25);padding:0.6rem 1.25rem;border-radius:2px;cursor:pointer;text-decoration:none}
.btn-wa:hover{background:rgba(37,211,102,0.2)}
.btn-go{font-family:'Barlow Condensed',sans-serif;font-size:0.85rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;background:var(--gold);color:#000;padding:0.65rem 1.75rem;border-radius:2px;border:none;cursor:pointer;text-decoration:none;display:inline-block}
.btn-go:hover{background:var(--gold2)}

@media (max-width: 768px) {
  .main{grid-template-columns:1fr;padding:1rem}
  .sidebar-card{position:static}
  .step-progress-inner{overflow-x:auto}
  .sp-step{white-space:nowrap}
}
`
