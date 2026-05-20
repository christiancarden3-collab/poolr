-- 1v1 Bets table for private wagers
CREATE TABLE IF NOT EXISTS bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- The bet details
  title TEXT NOT NULL,
  team1 TEXT NOT NULL,
  team2 TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Creator (person who made the bet)
  creator_id UUID REFERENCES auth.users(id) NOT NULL,
  creator_pick TEXT NOT NULL CHECK (creator_pick IN ('team1', 'team2')),
  creator_paid BOOLEAN DEFAULT FALSE,
  creator_payment_intent TEXT,
  creator_stripe_session TEXT,
  
  -- Opponent (person who accepts the bet)
  opponent_id UUID REFERENCES auth.users(id),
  opponent_pick TEXT CHECK (opponent_pick IN ('team1', 'team2')),
  opponent_paid BOOLEAN DEFAULT FALSE,
  opponent_payment_intent TEXT,
  opponent_stripe_session TEXT,
  
  -- Status flow: pending_opponent -> pending_payment -> active -> settled -> paid_out
  status TEXT DEFAULT 'pending_opponent' CHECK (status IN (
    'pending_opponent',  -- waiting for someone to accept
    'pending_payment',   -- opponent joined, waiting for both to pay
    'active',            -- both paid, game in progress
    'settled',           -- winner determined
    'paid_out',          -- winner received payout
    'cancelled'          -- bet was cancelled
  )),
  
  -- Settlement
  winner TEXT CHECK (winner IN ('team1', 'team2')),
  winner_id UUID REFERENCES auth.users(id),
  winner_payout DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  settled_at TIMESTAMP WITH TIME ZONE,
  
  -- Payout
  payout_transfer_id TEXT,
  paid_out_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view bets they participate in"
  ON bets FOR SELECT
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id OR status = 'pending_opponent');

CREATE POLICY "Users can create bets"
  ON bets FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Participants can update their bets"
  ON bets FOR UPDATE
  USING (auth.uid() = creator_id OR auth.uid() = opponent_id);

-- Index for faster lookups
CREATE INDEX idx_bets_creator ON bets(creator_id);
CREATE INDEX idx_bets_opponent ON bets(opponent_id);
CREATE INDEX idx_bets_status ON bets(status);
