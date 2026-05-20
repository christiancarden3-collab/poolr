import pg from 'pg';
import fs from 'fs';

const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:Chanelita1015@db.locvlxgcjvwxezqclima.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check the constraint
    const result = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as def 
      FROM pg_constraint 
      WHERE conname LIKE '%stage%'
    `);
    console.log('Stage constraints:', result.rows);
    
    // Drop the constraint
    console.log('Dropping stage constraint...');
    await client.query('ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_stage_check');
    
    const sql = fs.readFileSync('supabase/seed-wc2026.sql', 'utf8');
    console.log('Running seed SQL...');
    
    await client.query(sql);
    console.log('Seed completed!');
    
    // Check results
    const tournaments = await client.query('SELECT COUNT(*) as count FROM tournaments');
    const teams = await client.query('SELECT COUNT(*) as count FROM teams');
    const matches = await client.query('SELECT COUNT(*) as count FROM matches');
    const players = await client.query('SELECT COUNT(*) as count FROM players');
    
    console.log(`Tournaments: ${tournaments.rows[0].count}`);
    console.log(`Teams: ${teams.rows[0].count}`);
    console.log(`Matches: ${matches.rows[0].count}`);
    console.log(`Players: ${players.rows[0].count}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();
