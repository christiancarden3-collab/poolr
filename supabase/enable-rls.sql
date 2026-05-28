-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_picks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICIES: PROFILES
-- ============================================================
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- POLICIES: TOURNAMENTS, TEAMS, MATCHES, PLAYERS (read-only public)
-- ============================================================
CREATE POLICY "Anyone can view tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view players" ON players
  FOR SELECT USING (true);

-- ============================================================
-- POLICIES: POOLS
-- ============================================================
CREATE POLICY "Anyone can view public pools" ON pools
  FOR SELECT USING (visibility = 'public' OR commissioner_id = auth.uid());

CREATE POLICY "Users can view pools they're in" ON pools
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.pool_id = pools.id 
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Commissioners can update their pools" ON pools
  FOR UPDATE USING (commissioner_id = auth.uid());

CREATE POLICY "Authenticated users can create pools" ON pools
  FOR INSERT WITH CHECK (auth.uid() = commissioner_id);

-- ============================================================
-- POLICIES: POOL_MEMBERS
-- ============================================================
CREATE POLICY "Anyone can view pool members" ON pool_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join pools" ON pool_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership" ON pool_members
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: PICKS
-- ============================================================
CREATE POLICY "Users can view picks in their pools" ON picks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.pool_id = picks.pool_id 
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own picks" ON picks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own picks" ON picks
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- POLICIES: MATCH_PICKS
-- ============================================================
CREATE POLICY "Users can view match picks in their pools" ON match_picks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.id = match_picks.pool_member_id 
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own match picks" ON match_picks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.id = match_picks.pool_member_id 
      AND pool_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- POLICIES: SPECIAL_PICKS
-- ============================================================
CREATE POLICY "Users can view special picks in their pools" ON special_picks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.id = special_picks.pool_member_id 
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own special picks" ON special_picks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.id = special_picks.pool_member_id 
      AND pool_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- DONE! Refresh Security Advisor to confirm fix.
-- ============================================================
