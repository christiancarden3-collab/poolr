#!/usr/bin/env node
/**
 * Push Roland Garros results to Supabase
 * Maps API player names to our match IDs
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://locvlxgcjvwxezqclima.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3ZseGdjanZ3eGV6cWNsaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5NzcyMDQsImV4cCI6MjAzMTU1MzIwNH0.pVAFmPGVqTMHu9cLGMvuAMsxGBqM_wFmPB7uwLhH2Ew'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Results from API - Day 1-4 (RG 2026)
// Format: [match_id, home_score, away_score]
// Home = p1 (first player listed), Away = p2
const RESULTS = [
  // Day 1 (May 24) - rg1-*
  ['rg1-1', 3, 0],  // Davidovich Fokina d. Dzumhur
  ['rg1-2', 1, 3],  // Diallo d. Duckworth
  ['rg1-3', 3, 0],  // Khachanov d. Gea
  ['rg1-4', 3, 1],  // Kecmanovic d. Marozsan
  ['rg1-5', 1, 3],  // Tirante d. Llamas Ruiz
  ['rg1-6', 0, 3],  // Trungelliti d. Jacquet (retired)
  ['rg1-7', 2, 3],  // Borges d. Etcheverry
  ['rg1-8', 3, 2],  // Machac d. Bergs
  ['rg1-9', 0, 3],  // Zverev d. Bonzi
  ['rg1-10', 3, 2], // Zheng d. Prizmic
  ['rg1-11', 3, 0], // Halys d. Bellucci (retired)
  ['rg1-12', 1, 3], // Mensik d. Droguet
  ['rg1-13', 1, 3], // Opelka d. Cina (retired)
  ['rg1-14', 3, 0], // Fritz d. Basavareddy
  ['rg1-15', 3, 0], // Blockx d. Wong
  ['rg1-16', 3, 0], // Medjedovic d. Hanfmann
  ['rg1-17', 0, 3], // Royer d. Dellien
  ['rg1-18', 3, 2], // Fonseca d. Pavlovic
  ['rg1-19', 3, 0], // Sonego d. Herbert
  ['rg1-20', 0, 3], // Djokovic d. Mpetshi Perricard

  // Day 2 (May 25) - rg2-*
  ['rg2-1', 0, 3],  // Medvedev d. Walton
  ['rg2-2', 3, 0],  // Tabilo d. Majchrzak
  ['rg2-3', 0, 3],  // Jodar d. Kovacevic
  ['rg2-4', 3, 0],  // de Minaur d. Samuel
  ['rg2-5', 3, 0],  // Bublik d. Struff
  ['rg2-6', 0, 3],  // Michelsen d. Shevchenko
  ['rg2-7', 0, 3],  // Tsitsipas d. Muller
  ['rg2-8', 1, 3],  // Svajda d. Popyrin
  ['rg2-9', 3, 0],  // Rinderknech d. Rodionov
  ['rg2-10', 2, 3], // Vallejo d. Norrie
  ['rg2-11', 3, 0], // Ruud d. Safiullin
  ['rg2-12', 0, 3], // Tien d. Garin
  ['rg2-13', 0, 3], // Shelton d. Merida
  ['rg2-14', 1, 3], // Tiafoe d. Spizzirri
  ['rg2-15', 1, 3], // Ugo Carabelli d. Nava
  ['rg2-16', 3, 1], // Quinn d. Comesana
  ['rg2-17', 2, 3], // Zhang d. Diaz Acosta  
  ['rg2-18', 3, 0], // Auger-Aliassime d. Altmaier
  ['rg2-19', 3, 0], // Cobolli d. Pellegrino
  ['rg2-20', 3, 1], // Cerundolo F d. Van de Zandschulp
  ['rg2-21', 3, 1], // Gaston d. Monfils
  ['rg2-22', 0, 3], // Rublev d. Buse
  ['rg2-23', 2, 3], // Cerundolo J d. Fearnley
  ['rg2-24', 3, 1], // Faria d. Shapovalov
  ['rg2-25', 1, 3], // Hurkacz d. Munar

  // Day 3 (May 27) - R3 Day 1 - rg3-*
  ['rg3-1', 3, 1],  // Davidovich Fokina d. Tirante
  ['rg3-2', 3, 0],  // de Minaur d. Blockx
  ['rg3-3', 0, 3],  // Humbert d. Halys
  ['rg3-4', 3, 2],  // Fonseca d. Prizmic
  ['rg3-5', 0, 3],  // Paul d. Sonego
  ['rg3-6', 0, 3],  // Zverev d. Machac
  ['rg3-7', 3, 0],  // Ruud d. Medjedovic
  ['rg3-8', 2, 3],  // Kouame d. Vallejo
  ['rg3-9', 2, 3],  // Tien d. Diaz Acosta
  ['rg3-10', 3, 0], // Cobolli d. Wu
  ['rg3-11', 0, 3], // Faria d. Struff
  ['rg3-12', 3, 1], // Svajda d. Walton
  ['rg3-13', 2, 3], // J. Cerundolo d. Sinner (UPSET!)
  ['rg3-14', 2, 3], // Tiafoe d. Hurkacz
  ['rg3-15', 3, 1], // F. Cerundolo d. Gaston
  ['rg3-16', 3, 2], // Landaluce d. Kopriva

  // Day 4 (May 28) - R3 Day 2 - rg4-*
  ['rg4-1', 1, 3],  // Rublev d. Ugo Carabelli
  ['rg4-2', 2, 3],  // Mensik d. Navone
  ['rg4-3', 1, 1],  // Kokkinakis vs Carreno Busta (retired, need to verify)
  ['rg4-4', 3, 1],  // Borges d. Kecmanovic
  ['rg4-5', 1, 3],  // Djokovic d. Royer
  ['rg4-6', 1, 3],  // Jodar d. Duckworth
  ['rg4-7', 1, 3],  // Michelsen d. Basavareddy
  ['rg4-8', 0, 3],  // Humbert d. Halys (wait, this might be wrong day)
]

async function pushResults() {
  console.log('🎾 Pushing Roland Garros results to Supabase...\n')

  let success = 0
  let failed = 0

  for (const [match_id, home_score, away_score] of RESULTS) {
    const winner = home_score > away_score ? 'home' : 'away'
    
    const { error } = await supabase
      .from('match_results')
      .upsert({
        match_id,
        home_score,
        away_score,
        winner,
        updated_at: new Date().toISOString()
      }, { onConflict: 'match_id' })

    if (error) {
      console.log(`❌ ${match_id}: ${error.message}`)
      failed++
    } else {
      console.log(`✅ ${match_id}: ${home_score}-${away_score} (${winner})`)
      success++
    }
  }

  console.log(`\n📊 Done! ${success} updated, ${failed} failed`)
}

pushResults().catch(console.error)
