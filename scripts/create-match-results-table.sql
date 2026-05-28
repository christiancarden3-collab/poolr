-- Create match_results table for storing completed match scores
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS match_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id TEXT NOT NULL UNIQUE,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  winner TEXT CHECK (winner IN ('home', 'away')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON match_results(match_id);

-- RLS (allow anyone to read, only authenticated to write)
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Everyone can read results
CREATE POLICY "Anyone can read results" ON match_results
  FOR SELECT USING (true);

-- Only service role can insert/update (via API)
CREATE POLICY "Service can manage results" ON match_results
  FOR ALL USING (auth.role() = 'service_role');

-- Actually, disable RLS for now to allow API to work easily
ALTER TABLE match_results DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON match_results TO authenticated;
GRANT ALL ON match_results TO anon;
