-- Add timezone column to pools table
ALTER TABLE pools ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Update any existing pools to have a default timezone
UPDATE pools SET timezone = 'America/New_York' WHERE timezone IS NULL;
