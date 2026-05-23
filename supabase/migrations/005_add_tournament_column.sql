-- Add tournament column to pools table
ALTER TABLE pools ADD COLUMN IF NOT EXISTS tournament TEXT DEFAULT 'wc2026';
