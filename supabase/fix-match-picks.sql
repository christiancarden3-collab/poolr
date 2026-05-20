-- FIX MATCH PICKS SCHEMA
-- The match_id column needs to be TEXT to support demo IDs like 'md1-1'

-- First, check if match_id is UUID and convert to TEXT
DO $$
BEGIN
  -- Drop the foreign key constraint if it exists (it references UUID matches.id)
  ALTER TABLE match_picks DROP CONSTRAINT IF EXISTS match_picks_match_id_fkey;
  
  -- Change match_id to TEXT if it's not already
  ALTER TABLE match_picks ALTER COLUMN match_id TYPE TEXT USING match_id::TEXT;
  
  RAISE NOTICE 'match_id column converted to TEXT';
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Column might already be TEXT or other error: %', SQLERRM;
END $$;

-- Ensure the unique constraint exists
ALTER TABLE match_picks DROP CONSTRAINT IF EXISTS match_picks_pool_member_id_match_id_key;
ALTER TABLE match_picks ADD CONSTRAINT match_picks_pool_member_id_match_id_key UNIQUE (pool_member_id, match_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_picks_match ON match_picks(match_id);
CREATE INDEX IF NOT EXISTS idx_match_picks_pool_member ON match_picks(pool_member_id);

-- Verify RLS policies allow updates
DROP POLICY IF EXISTS "match_picks_select" ON match_picks;
DROP POLICY IF EXISTS "match_picks_insert" ON match_picks;
DROP POLICY IF EXISTS "match_picks_update" ON match_picks;
DROP POLICY IF EXISTS "match_picks_delete" ON match_picks;

-- Simple policies that work with pool_member_id
CREATE POLICY "match_picks_select" ON match_picks FOR SELECT USING (true);

CREATE POLICY "match_picks_insert" ON match_picks FOR INSERT 
WITH CHECK (
  pool_member_id IN (
    SELECT id FROM pool_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "match_picks_update" ON match_picks FOR UPDATE 
USING (
  pool_member_id IN (
    SELECT id FROM pool_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "match_picks_delete" ON match_picks FOR DELETE 
USING (
  pool_member_id IN (
    SELECT id FROM pool_members WHERE user_id = auth.uid()
  )
);

-- Show current state
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'match_picks' AND column_name = 'match_id';
