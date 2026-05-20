-- Add prediction_deadline column to pools table
-- Values: '30m_before_match', '1h_before_matchday', '2h_before_matchday', '24h_before_matchday'

ALTER TABLE pools 
ADD COLUMN IF NOT EXISTS prediction_deadline TEXT DEFAULT '1h_before_matchday';

-- Add a comment for documentation
COMMENT ON COLUMN pools.prediction_deadline IS 'When predictions lock: 30m_before_match (per-match), 1h/2h/24h_before_matchday (per-matchday first game)';
