-- ============================================================
-- STRIPE CONNECT MIGRATION
-- Run this in Supabase SQL Editor to enable Stripe Connect
-- ============================================================

-- Add stripe_account_id to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account 
ON profiles(stripe_account_id) 
WHERE stripe_account_id IS NOT NULL;

-- Add stripe_payout_status to pool_members for tracking disbursements
ALTER TABLE pool_members
ADD COLUMN IF NOT EXISTS stripe_payout_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT NULL 
  CHECK (payout_status IS NULL OR payout_status IN ('pending', 'paid', 'failed'));

-- Update handle_new_user function to include email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(profiles.name, EXCLUDED.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- RLS Policies for Stripe fields
-- ============================================================

-- Users can read their own stripe_account_id
CREATE POLICY "users_read_own_stripe" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own stripe_account_id (set by API)
CREATE POLICY "users_update_own_stripe" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- DONE! Your database is now ready for Stripe Connect.
-- ============================================================
