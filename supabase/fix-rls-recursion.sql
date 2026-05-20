-- Fix infinite recursion in pool_members RLS policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing pool_members policies
DROP POLICY IF EXISTS "Pool members are viewable by pool members" ON pool_members;
DROP POLICY IF EXISTS "Users can join pools" ON pool_members;
DROP POLICY IF EXISTS "Commissioners can update pool members" ON pool_members;
DROP POLICY IF EXISTS "View pool members" ON pool_members;
DROP POLICY IF EXISTS "Join pools" ON pool_members;
DROP POLICY IF EXISTS "Update pool members" ON pool_members;
DROP POLICY IF EXISTS "Remove pool members" ON pool_members;

-- Simple, non-recursive policies:

-- SELECT: Anyone can view pool members (leaderboards are public)
CREATE POLICY "pool_members_select" ON pool_members FOR SELECT 
  USING (true);

-- INSERT: Authenticated users can add themselves to pools
CREATE POLICY "pool_members_insert" ON pool_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own record, commissioners can update any in their pool
CREATE POLICY "pool_members_update" ON pool_members FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    pool_id IN (SELECT id FROM pools WHERE commissioner_id = auth.uid())
  );

-- DELETE: Commissioners can remove members
CREATE POLICY "pool_members_delete" ON pool_members FOR DELETE 
  USING (pool_id IN (SELECT id FROM pools WHERE commissioner_id = auth.uid()));
