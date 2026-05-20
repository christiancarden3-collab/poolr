'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'

export default function CreateBetPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    team1: '',
    team2: '',
    amount: '',
    selectedTeam: '',
  })

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login?redirect=/bet/create')
        return
      }
      setUser(currentUser)
      setLoading(false)
    }
    loadUser()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.team1 || !formData.team2 || !formData.amount || !formData.selectedTeam) {
      setError('Please fill in all fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount < 1) {
      setError('Minimum bet is $1')
      return
    }

    setCreating(true)
    setError(null)

    try {
      // Create the bet
      const { data: bet, error: betError } = await supabase
        .from('bets')
        .insert({
          creator_id: user.id,
          title: formData.title,
          team1: formData.team1,
          team2: formData.team2,
          amount: amount,
          creator_pick: formData.selectedTeam,
          status: 'pending_opponent', // waiting for opponent to join
        })
        .select()
        .single()

      if (betError) throw betError

      // Redirect to bet page
      router.push(`/bet/${bet.id}`)
    } catch (err) {
      console.error('Create bet error:', err)
      setError(err.message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
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
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <span className="text-[#c9a227] text-sm font-medium tracking-wider">1v1 BET</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tight">
            CREATE A BET
          </h1>
          <p className="text-gray-400 mt-2">Challenge a friend to a private wager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-5">
            
            {/* Game Title */}
            <div>
              <label className="block text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-2">
                Game / Event
              </label>
              <input
                type="text"
                placeholder="e.g. Thunder vs Spurs - Game 5"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#c9a227] focus:outline-none"
              />
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Team 1
                </label>
                <input
                  type="text"
                  placeholder="Thunder"
                  value={formData.team1}
                  onChange={(e) => setFormData({ ...formData, team1: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#c9a227] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Team 2
                </label>
                <input
                  type="text"
                  placeholder="Spurs"
                  value={formData.team2}
                  onChange={(e) => setFormData({ ...formData, team2: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#c9a227] focus:outline-none"
                />
              </div>
            </div>

            {/* Your Pick */}
            {formData.team1 && formData.team2 && (
              <div>
                <label className="block text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-2">
                  Your Pick
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedTeam: 'team1' })}
                    className={`py-4 rounded-lg font-bold text-lg transition-all ${
                      formData.selectedTeam === 'team1'
                        ? 'bg-[#c9a227] text-black'
                        : 'bg-[#1a1a1a] border border-[#333] text-white hover:border-[#c9a227]'
                    }`}
                  >
                    {formData.team1}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedTeam: 'team2' })}
                    className={`py-4 rounded-lg font-bold text-lg transition-all ${
                      formData.selectedTeam === 'team2'
                        ? 'bg-[#c9a227] text-black'
                        : 'bg-[#1a1a1a] border border-[#333] text-white hover:border-[#c9a227]'
                    }`}
                  >
                    {formData.team2}
                  </button>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-[#c9a227] uppercase tracking-wider mb-2">
                Bet Amount (each person pays this)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="10.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-4 py-3 text-white text-xl font-bold placeholder-gray-500 focus:border-[#c9a227] focus:outline-none"
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Winner takes ${formData.amount ? (parseFloat(formData.amount) * 2 * 0.97).toFixed(2) : '0.00'} (after 3% platform fee)
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#c9a227] hover:bg-[#b8922a] text-black font-bold py-4 rounded-lg text-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'CREATE BET →'}
          </button>

          <p className="text-center text-gray-500 text-sm">
            You'll get a link to share with your opponent
          </p>
        </form>
      </main>
    </div>
  )
}
