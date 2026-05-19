-- ============================================================
-- ENABLE SEEDING POLICIES
-- Run this ONCE to allow seeding from the app
-- ============================================================

-- Allow anyone to insert teams (for seeding)
CREATE POLICY "Allow insert teams for seeding" ON teams FOR INSERT WITH CHECK (true);

-- Allow anyone to insert matches (for seeding)
CREATE POLICY "Allow insert matches for seeding" ON matches FOR INSERT WITH CHECK (true);

-- Allow anyone to insert players (for seeding)
CREATE POLICY "Allow insert players for seeding" ON players FOR INSERT WITH CHECK (true);

-- Allow anyone to delete teams (for re-seeding)
CREATE POLICY "Allow delete teams for seeding" ON teams FOR DELETE USING (true);

-- Allow anyone to delete matches (for re-seeding)
CREATE POLICY "Allow delete matches for seeding" ON matches FOR DELETE USING (true);

-- Allow anyone to delete players (for re-seeding)
CREATE POLICY "Allow delete players for seeding" ON players FOR DELETE USING (true);

-- ============================================================
-- NOTE: In production, you'd want to:
-- 1. Use a service role key for seeding
-- 2. Or remove these policies after initial seed
-- 3. Or add a check for admin role
-- ============================================================
