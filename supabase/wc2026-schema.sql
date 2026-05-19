-- ============================================================
-- WC2026 DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop existing tables if recreating
DROP TABLE IF EXISTS match_picks CASCADE;
DROP TABLE IF EXISTS special_picks CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- ============================================================
-- TEAMS (48 teams)
-- ============================================================
CREATE TABLE teams (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  group_letter TEXT NOT NULL,
  confederation TEXT NOT NULL,
  fifa_rank INT,
  is_host BOOLEAN DEFAULT FALSE,
  is_playoff BOOLEAN DEFAULT FALSE,
  is_debut BOOLEAN DEFAULT FALSE,
  flag_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PLAYERS (~600 players)
-- ============================================================
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  team_code TEXT REFERENCES teams(code) ON DELETE CASCADE,
  position TEXT NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, team_code)
);

-- ============================================================
-- MATCHES (104 matches)
-- ============================================================
CREATE TABLE matches (
  match_id TEXT PRIMARY KEY,
  matchday INT,
  stage TEXT NOT NULL CHECK (stage IN ('group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final')),
  group_letter TEXT,
  home_team_code TEXT REFERENCES teams(code),
  away_team_code TEXT REFERENCES teams(code),
  match_date DATE NOT NULL,
  time_et TEXT NOT NULL,
  time_ct TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  label TEXT,
  match_number INT,
  home_score INT,
  away_score INT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATCH PICKS (user predictions for each match)
-- ============================================================
CREATE TABLE match_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
  home_score_pick INT NOT NULL,
  away_score_pick INT NOT NULL,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pool_id, match_id)
);

-- ============================================================
-- SPECIAL PICKS (champion, top scorer, etc.)
-- ============================================================
CREATE TABLE special_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  pick_type TEXT NOT NULL CHECK (pick_type IN ('champion', 'runner_up', 'top_scorer', 'best_goalkeeper')),
  team_code TEXT REFERENCES teams(code),
  player_id UUID REFERENCES players(id),
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pool_id, pick_type)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_players_team ON players(team_code);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_matchday ON matches(matchday);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_match_picks_user ON match_picks(user_id);
CREATE INDEX idx_match_picks_pool ON match_picks(pool_id);
CREATE INDEX idx_special_picks_user ON special_picks(user_id);
CREATE INDEX idx_special_picks_pool ON special_picks(pool_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_picks ENABLE ROW LEVEL SECURITY;

-- Public read for teams, players, matches
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);

-- Users can manage their own picks
CREATE POLICY "Users can view their own picks" ON match_picks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own picks" ON match_picks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own picks" ON match_picks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own special picks" ON special_picks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own special picks" ON special_picks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own special picks" ON special_picks FOR UPDATE USING (auth.uid() = user_id);

-- Pool members can view each other's picks (for leaderboard)
CREATE POLICY "Pool members can view picks in their pools" ON match_picks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pool_members pm
    WHERE pm.pool_id = match_picks.pool_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Pool members can view special picks in their pools" ON special_picks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pool_members pm
    WHERE pm.pool_id = special_picks.pool_id
    AND pm.user_id = auth.uid()
  )
);
