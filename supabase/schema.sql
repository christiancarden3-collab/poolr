-- ============================================================
-- POOLR DATABASE SCHEMA
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. TOURNAMENTS
-- ============================================================
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert World Cup 2026
INSERT INTO tournaments (name, slug, start_date, end_date, status, config)
VALUES (
  'FIFA World Cup 2026',
  'world-cup-2026',
  '2026-06-11',
  '2026-07-19',
  'upcoming',
  '{
    "scoring": {
      "exact_score": 3,
      "correct_result": 1,
      "champion": 10,
      "runner_up": 7,
      "top_scorer": 5,
      "best_keeper": 5
    },
    "host_countries": ["USA", "Canada", "Mexico"]
  }'
);

-- ============================================================
-- 3. TEAMS
-- ============================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  flag_code TEXT NOT NULL,
  group_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. MATCHES
-- ============================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  matchday INT,
  stage TEXT DEFAULT 'group' CHECK (stage IN ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final')),
  group_name TEXT,
  home_team_id UUID REFERENCES teams(id),
  away_team_id UUID REFERENCES teams(id),
  home_team_name TEXT,
  away_team_name TEXT,
  home_flag TEXT,
  away_flag TEXT,
  match_time TIMESTAMPTZ NOT NULL,
  home_score INT,
  away_score INT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. POOLS
-- ============================================================
CREATE TABLE pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  commissioner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  buy_in DECIMAL(10,2) DEFAULT 0,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  access_type TEXT DEFAULT 'invite' CHECK (access_type IN ('invite', 'password')),
  password_hash TEXT,
  invite_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  payment_method TEXT DEFAULT 'external' CHECK (payment_method IN ('stripe', 'external')),
  payment_instructions TEXT,
  fee_handling TEXT DEFAULT 'absorbed' CHECK (fee_handling IN ('on_top', 'absorbed')),
  prize_structure JSONB DEFAULT '{"1": 100}',
  stripe_account_id TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'locked', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. POOL MEMBERS
-- ============================================================
CREATE TABLE pool_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method TEXT,
  stripe_payment_id TEXT,
  total_points INT DEFAULT 0,
  rank INT,
  previous_rank INT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE(pool_id, user_id)
);

-- ============================================================
-- 7. MATCH PICKS
-- ============================================================
CREATE TABLE match_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_member_id UUID REFERENCES pool_members(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  home_score INT NOT NULL,
  away_score INT NOT NULL,
  points_earned INT DEFAULT 0,
  locked BOOLEAN DEFAULT TRUE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_member_id, match_id)
);

-- ============================================================
-- 8. SPECIAL PICKS
-- ============================================================
CREATE TABLE special_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_member_id UUID REFERENCES pool_members(id) ON DELETE CASCADE,
  champion TEXT,
  runner_up TEXT,
  top_scorer TEXT,
  best_keeper TEXT,
  champion_points INT DEFAULT 0,
  runner_up_points INT DEFAULT 0,
  top_scorer_points INT DEFAULT 0,
  best_keeper_points INT DEFAULT 0,
  locked BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_member_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_picks ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Tournaments: Public read
CREATE POLICY "Tournaments are viewable by everyone" ON tournaments FOR SELECT USING (true);

-- Teams: Public read
CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);

-- Matches: Public read
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);

-- Pools: Public pools visible to all, private pools visible to members
CREATE POLICY "Public pools are viewable" ON pools FOR SELECT 
  USING (visibility = 'public' OR commissioner_id = auth.uid() OR 
         id IN (SELECT pool_id FROM pool_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can create pools" ON pools FOR INSERT WITH CHECK (auth.uid() = commissioner_id);
CREATE POLICY "Commissioners can update their pools" ON pools FOR UPDATE USING (auth.uid() = commissioner_id);

-- Pool Members: Members can view pool members, join pools
CREATE POLICY "Pool members are viewable by pool members" ON pool_members FOR SELECT 
  USING (pool_id IN (SELECT pool_id FROM pool_members WHERE user_id = auth.uid()) OR
         pool_id IN (SELECT id FROM pools WHERE commissioner_id = auth.uid()));
CREATE POLICY "Users can join pools" ON pool_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Commissioners can update pool members" ON pool_members FOR UPDATE 
  USING (pool_id IN (SELECT id FROM pools WHERE commissioner_id = auth.uid()));

-- Match Picks: Members can view picks (after deadline), create/update own
CREATE POLICY "Members can view picks" ON match_picks FOR SELECT 
  USING (pool_member_id IN (SELECT id FROM pool_members WHERE pool_id IN 
         (SELECT pool_id FROM pool_members WHERE user_id = auth.uid())));
CREATE POLICY "Members can create picks" ON match_picks FOR INSERT 
  WITH CHECK (pool_member_id IN (SELECT id FROM pool_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can update own picks" ON match_picks FOR UPDATE 
  USING (pool_member_id IN (SELECT id FROM pool_members WHERE user_id = auth.uid()) AND locked = FALSE);

-- Special Picks: Similar to match picks
CREATE POLICY "Members can view special picks" ON special_picks FOR SELECT 
  USING (pool_member_id IN (SELECT id FROM pool_members WHERE pool_id IN 
         (SELECT pool_id FROM pool_members WHERE user_id = auth.uid())));
CREATE POLICY "Members can create special picks" ON special_picks FOR INSERT 
  WITH CHECK (pool_member_id IN (SELECT id FROM pool_members WHERE user_id = auth.uid()));
CREATE POLICY "Members can update own special picks" ON special_picks FOR UPDATE 
  USING (pool_member_id IN (SELECT id FROM pool_members WHERE user_id = auth.uid()) AND locked = FALSE);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_pools_tournament ON pools(tournament_id);
CREATE INDEX idx_pools_commissioner ON pools(commissioner_id);
CREATE INDEX idx_pools_invite_code ON pools(invite_code);
CREATE INDEX idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX idx_pool_members_user ON pool_members(user_id);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_match_picks_pool_member ON match_picks(pool_member_id);
CREATE INDEX idx_match_picks_match ON match_picks(match_id);

-- ============================================================
-- DONE! 🎉
-- ============================================================
