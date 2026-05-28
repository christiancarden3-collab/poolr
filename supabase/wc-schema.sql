-- ============================================================
-- WORLD CUP 2026 SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- WC_MATCHES - Schedule pulled from API
-- ============================================================
CREATE TABLE IF NOT EXISTS wc_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sofascore_id BIGINT UNIQUE NOT NULL,  -- API event ID for matching
  match_id TEXT UNIQUE NOT NULL,         -- Our internal ID (wc-{sofascore_id})
  home_team TEXT NOT NULL,
  home_code TEXT,
  away_team TEXT NOT NULL,
  away_code TEXT,
  match_date DATE NOT NULL,
  match_time TEXT,
  matchday INT,
  stage TEXT DEFAULT 'Group Stage',
  group_name TEXT,
  venue TEXT,
  city TEXT,
  status TEXT DEFAULT 'scheduled',
  home_score INT,
  away_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by API ID
CREATE INDEX IF NOT EXISTS idx_wc_matches_sofascore ON wc_matches(sofascore_id);
CREATE INDEX IF NOT EXISTS idx_wc_matches_date ON wc_matches(match_date);

-- ============================================================
-- WC_RESULTS - Match results
-- ============================================================
CREATE TABLE IF NOT EXISTS wc_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT UNIQUE NOT NULL REFERENCES wc_matches(match_id) ON DELETE CASCADE,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IN ('home', 'away', 'draw')),
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WC_PICKS - User predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS wc_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL REFERENCES wc_matches(match_id) ON DELETE CASCADE,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  points_earned INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, user_id, match_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_wc_picks_pool ON wc_picks(pool_id);
CREATE INDEX IF NOT EXISTS idx_wc_picks_user ON wc_picks(user_id);
CREATE INDEX IF NOT EXISTS idx_wc_picks_match ON wc_picks(match_id);

-- ============================================================
-- WC_SPECIAL_PICKS - Tournament predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS wc_special_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  champion TEXT,
  runner_up TEXT,
  third_place TEXT,
  top_scorer TEXT,
  golden_ball TEXT,
  golden_glove TEXT,
  champion_points INT DEFAULT 0,
  runner_up_points INT DEFAULT 0,
  third_place_points INT DEFAULT 0,
  top_scorer_points INT DEFAULT 0,
  golden_ball_points INT DEFAULT 0,
  golden_glove_points INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, user_id)
);

-- ============================================================
-- RLS Policies (if needed)
-- ============================================================

-- For now, disable RLS on these tables for easier management
-- Enable later with proper policies if needed
ALTER TABLE wc_matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE wc_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE wc_picks DISABLE ROW LEVEL SECURITY;
ALTER TABLE wc_special_picks DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! 🏆
-- ============================================================
