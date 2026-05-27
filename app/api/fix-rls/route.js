import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint creates the necessary RLS policies for the picks table
// Run this once to fix the issue

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Try to execute SQL to create/fix RLS policies
    // Note: This requires service_role key or admin access
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        -- Enable RLS on picks table (if not already)
        ALTER TABLE picks ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view their own picks" ON picks;
        DROP POLICY IF EXISTS "Users can insert their own picks" ON picks;
        DROP POLICY IF EXISTS "Users can update their own picks" ON picks;
        
        -- Create permissive policies
        CREATE POLICY "Users can view their own picks" ON picks
          FOR SELECT USING (auth.uid() = user_id);
          
        CREATE POLICY "Users can insert their own picks" ON picks
          FOR INSERT WITH CHECK (auth.uid() = user_id);
          
        CREATE POLICY "Users can update their own picks" ON picks
          FOR UPDATE USING (auth.uid() = user_id);
      `
    })
    
    if (error) {
      // If RPC doesn't exist, return instructions
      return NextResponse.json({
        success: false,
        error: error.message,
        manual_fix: `
Run this SQL in Supabase Dashboard > SQL Editor:

-- Enable RLS on picks table
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own picks" ON picks;
DROP POLICY IF EXISTS "Users can insert their own picks" ON picks;
DROP POLICY IF EXISTS "Users can update their own picks" ON picks;

-- Create permissive policies
CREATE POLICY "Users can view their own picks" ON picks
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert their own picks" ON picks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own picks" ON picks
  FOR UPDATE USING (auth.uid() = user_id);
        `
      })
    }
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Alternative: Insert picks directly using service role (bypasses RLS)
export async function PUT(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await request.json()
    const { picks } = body // Array of picks: [{user_id, pool_id, match_id, home_score, away_score, winner}]
    
    if (!picks || !Array.isArray(picks)) {
      return NextResponse.json({ error: 'picks array required' }, { status: 400 })
    }
    
    // Try to insert picks directly (only works with service_role key)
    const { data, error } = await supabase
      .from('picks')
      .upsert(picks.map(p => ({
        ...p,
        updated_at: new Date().toISOString()
      })), {
        onConflict: 'user_id,pool_id,match_id'
      })
      .select()
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        hint: 'This requires SUPABASE_SERVICE_KEY in .env.local to bypass RLS'
      }, { status: 403 })
    }
    
    return NextResponse.json({ success: true, inserted: data?.length || 0, data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
