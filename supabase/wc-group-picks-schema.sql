-- ============================================================
-- WC_GROUP_PICKS - Group Stage Qualifier Predictions
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS wc_group_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_letter CHAR(1) NOT NULL CHECK (group_letter IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
  first_place_team_id TEXT NOT NULL,  -- FIFA 3-letter code (e.g., 'MEX', 'BRA')
  second_place_team_id TEXT NOT NULL, -- FIFA 3-letter code
  first_place_points INT DEFAULT 0,
  second_place_points INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only have one pick per group per pool
  UNIQUE(pool_id, user_id, group_letter)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_wc_group_picks_pool ON wc_group_picks(pool_id);
CREATE INDEX IF NOT EXISTS idx_wc_group_picks_user ON wc_group_picks(user_id);
CREATE INDEX IF NOT EXISTS idx_wc_group_picks_group ON wc_group_picks(group_letter);

-- Disable RLS for easier management (same as other wc tables)
ALTER TABLE wc_group_picks DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONE! 🏆
-- ============================================================
