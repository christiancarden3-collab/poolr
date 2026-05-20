-- Add team_name column to pool_members table
ALTER TABLE pool_members ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Each member can have a unique team name per pool
