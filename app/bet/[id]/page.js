'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function BetPage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bet, setBet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [paying, setPaying] = useState(false)
  const [settlingWinner, setSettlingWinner] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    const currentUser = await getCurrentUser()
    setUser(currentUser)

    const { data: betData, error: betError } = await supabase
      .from('bets')
      .select(`
        *,
        creator:profiles!creator_id(id, username, email, stripe_account_id),
        opponent:profiles!opponent_id(id, username, email, stripe_account_id)
      `)
      .eq('id', id)
      .single()

    if (betError) {
      setError('Bet not found')
    } else {
      setBet(betData)
    }
    setLoading(false)
  }

  const joinBet = async () => {
    if (!user) {
      router.push(`/login?redirect=/bet/${id}`)
      return
    }

    setJoining(true)
    setError(null)

    try {
      // Join as opponent with opposite pick
      const opponentPick = bet.creator_pick === 'team1' ? 'team2' : 'team1'
      
      const { error: joinError } = await supabase
        .from('bets')
        .update({
          opponent_id: user.id,
          opponent_pick: opponentPick,
          status: 'pending_payment',
        })
        .eq('id', id)
        .eq('status', 'pending_opponent')

      if (joinError) throw joinError
      
      await loadData()
    } catch (err) {
      setError(err.message)
    }
    setJoining(false)
  }

  const payBet = async () => {
    setPaying(true)
    setError(null)

    try {
      const res = await fetch('/api/bet/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bet_id: id,
          user_id: user.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Redirect to Stripe
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setPaying(false)
    }
  }

  const settleBet = async (winner) => {
    setSettlingWinner(winner)
    setError(null)

    try {
      const res = await fetch('/api/bet/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bet_id: id,
          winner: winner, // 'team1' or 'team2'
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await loadData()
    } catch (err) {
      setError(err.message)
    }
    setSettlingWinner(null)
  }

  const copyShareLink = () => {
    const url = `${window.location.origin}/bet/${id}`
    navigator.clipboard.writeText(url)
    alert('Link copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error && !bet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    )
  }

  const isCreator = user?.id === bet.creator_id
  const isOpponent = user?.id === bet.opponent_id
  const isParticipant = isCreator || isOpponent

  const creatorPaid = bet.creator_paid
  const opponentPaid = bet.opponent_paid
  const bothPaid = creatorPaid && opponentPaid

  const myPick = isCreator ? bet.creator_pick : bet.opponent_pick
  const myPaid = isCreator ? creatorPaid : opponentPaid

  const getStatusText = () => {
    switch (bet.status) {
      case 'pending_opponent': return 'Waiting for opponent to join'
      case 'pending_payment': return 'Waiting for payments'
      case 'active': return 'Bet is LIVE - waiting for result'
      case 'settled': return `Winner: ${bet.winner === 'team1' ? bet.team1 : bet.team2}`
      case 'paid_out': return 'Payout complete!'
      default: return bet.status
    }
  }

  const getStatusColor = () => {
    switch (bet.status) {
      case 'pending_opponent': return 'text-yellow-400'
      case 'pending_payment': return 'text-orange-400'
      case 'active': return 'text-green-400'
      case 'settled': return 'text-blue-400'
      case 'paid_out': return 'text-[#c9a227]'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black">
            <span className="text-white">PICK</span>
            <span className="text-[#c9a227]">POOLR</span>
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        {/* Status Banner */}
        <div className={`text-center mb-6 py-3 px-4 rounded-lg bg-[#111] border border-[#222] ${getStatusColor()}`}>
          <span className="font-bold">{getStatusText()}</span>
        </div>

        {/* Bet Card */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          {/* Title */}
          <div className="p-6 border-b border-[#222] text-center">
            <span className="text-[#c9a227] text-xs font-bold uppercase tracking-wider">1v1 Bet</span>
            <h1 className="text-2xl font-black text-white mt-1">{bet.title}</h1>
          </div>

          {/* Matchup */}
          <div className="p-6 border-b border-[#222]">
            <div className="flex items-center justify-between">
              <div className={`text-center flex-1 ${bet.winner === 'team1' ? 'opacity-100' : bet.winner ? 'opacity-40' : ''}`}>
                <div className="text-3xl font-black text-white">{bet.team1}</div>
                {bet.creator && (
                  <div className="mt-2 text-sm">
                    <span className={`${bet.creator_pick === 'team1' ? 'text-[#c9a227]' : 'text-gray-500'}`}>
                      {bet.creator?.username || 'Creator'}
                      {bet.creator_pick === 'team1' && ' 🎯'}
                    </span>
                    {creatorPaid && <span className="text-green-400 ml-1">✓</span>}
                  </div>
                )}
              </div>

              <div className="px-4 text-gray-500 font-bold">VS</div>

              <div className={`text-center flex-1 ${bet.winner === 'team2' ? 'opacity-100' : bet.winner ? 'opacity-40' : ''}`}>
                <div className="text-3xl font-black text-white">{bet.team2}</div>
                {bet.opponent && (
                  <div className="mt-2 text-sm">
                    <span className={`${bet.opponent_pick === 'team2' ? 'text-[#c9a227]' : 'text-gray-500'}`}>
                      {bet.opponent?.username || 'Opponent'}
                      {bet.opponent_pick === 'team2' && ' 🎯'}
                    </span>
                    {opponentPaid && <span className="text-green-400 ml-1">✓</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prize Pool */}
          <div className="p-6 border-b border-[#222] text-center bg-[#0a0a0a]">
            <div className="text-gray-400 text-sm">PRIZE POOL</div>
            <div className="text-4xl font-black text-[#c9a227]">
              ${(bet.amount * 2).toFixed(2)}
            </div>
            <div className="text-gray-500 text-xs mt-1">
              ${bet.amount.toFixed(2)} per person • 3% platform fee
            </div>
          </div>

          {/* Actions */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Waiting for opponent */}
            {bet.status === 'pending_opponent' && isCreator && (
              <div className="space-y-4">
                <p className="text-gray-400 text-center">Share this link with your opponent:</p>
                <button
                  onClick={copyShareLink}
                  className="w-full bg-[#c9a227] hover:bg-[#b8922a] text-black font-bold py-4 rounded-lg transition-colors"
                >
                  📋 COPY INVITE LINK
                </button>
              </div>
            )}

            {/* Join as opponent */}
            {bet.status === 'pending_opponent' && !isCreator && (
              <div className="space-y-4">
                <p className="text-gray-400 text-center">
                  {bet.creator?.username || 'Someone'} bet ${bet.amount.toFixed(2)} on <strong className="text-white">{bet.creator_pick === 'team1' ? bet.team1 : bet.team2}</strong>.
                  <br />You'll be betting on <strong className="text-[#c9a227]">{bet.creator_pick === 'team1' ? bet.team2 : bet.team1}</strong>.
                </p>
                <button
                  onClick={joinBet}
                  disabled={joining}
                  className="w-full bg-[#c9a227] hover:bg-[#b8922a] text-black font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {joining ? 'Joining...' : `ACCEPT BET - $${bet.amount.toFixed(2)}`}
                </button>
              </div>
            )}

            {/* Payment needed */}
            {bet.status === 'pending_payment' && isParticipant && !myPaid && (
              <div className="space-y-4">
                <p className="text-gray-400 text-center">
                  You picked <strong className="text-[#c9a227]">{myPick === 'team1' ? bet.team1 : bet.team2}</strong>. 
                  Pay to lock in your bet!
                </p>
                <button
                  onClick={payBet}
                  disabled={paying}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {paying ? 'Redirecting to payment...' : `PAY $${bet.amount.toFixed(2)}`}
                </button>
              </div>
            )}

            {/* Waiting for other payment */}
            {bet.status === 'pending_payment' && isParticipant && myPaid && (
              <div className="text-center">
                <p className="text-green-400 font-bold">✓ You've paid!</p>
                <p className="text-gray-400 mt-2">Waiting for {isCreator ? 'opponent' : 'creator'} to pay...</p>
              </div>
            )}

            {/* Bet is active - waiting for result */}
            {bet.status === 'active' && (
              <div className="space-y-4">
                <p className="text-green-400 text-center font-bold">🎮 BET IS LIVE!</p>
                <p className="text-gray-400 text-center">Game on! Come back after the match to settle.</p>
                
                {/* Only creator can settle */}
                {isCreator && (
                  <div className="pt-4 border-t border-[#222]">
                    <p className="text-gray-500 text-xs text-center mb-3">SETTLE THE BET (creator only)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => settleBet('team1')}
                        disabled={settlingWinner}
                        className="py-3 rounded-lg font-bold bg-[#1a1a1a] border border-[#333] text-white hover:border-green-500 hover:bg-green-500/10 transition-all disabled:opacity-50"
                      >
                        {settlingWinner === 'team1' ? '...' : `${bet.team1} Won`}
                      </button>
                      <button
                        onClick={() => settleBet('team2')}
                        disabled={settlingWinner}
                        className="py-3 rounded-lg font-bold bg-[#1a1a1a] border border-[#333] text-white hover:border-green-500 hover:bg-green-500/10 transition-all disabled:opacity-50"
                      >
                        {settlingWinner === 'team2' ? '...' : `${bet.team2} Won`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bet settled */}
            {(bet.status === 'settled' || bet.status === 'paid_out') && (
              <div className="text-center space-y-2">
                <p className="text-2xl font-black text-[#c9a227]">
                  🏆 {bet.winner === 'team1' ? bet.team1 : bet.team2} WINS!
                </p>
                {bet.winner_id && (
                  <p className="text-gray-400">
                    {bet.winner_id === user?.id ? 'You won!' : `${bet.winner_id === bet.creator_id ? bet.creator?.username : bet.opponent?.username} won`}
                    {' '}${(bet.amount * 2 * 0.97).toFixed(2)}
                  </p>
                )}
                {bet.status === 'paid_out' && (
                  <p className="text-green-400 font-bold">✓ Payout sent!</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
