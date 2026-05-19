# PickPoolr Setup Guide - World Cup 2026 Data

## Quick Start (Tonight's Trial Run)

### Step 1: Run the RLS Policies
Open your Supabase project → SQL Editor and run:
```sql
-- Copy contents from supabase/enable-seed-policies.sql
```

### Step 2: Run the Players Table Migration
Run this in SQL Editor:
```sql
-- Copy contents from supabase/migration-players.sql
```

### Step 3: Seed the Data
Either:

**Option A: SQL Editor (Recommended)**
Run the contents of `supabase/seed-wc2026.sql` in Supabase SQL Editor.

**Option B: API Endpoint**
```bash
curl -X POST http://localhost:3000/api/seed-matches
```

### Step 4: Create a Test Pool
1. Go to http://localhost:3000
2. Register/Login
3. Create a new pool
4. Invite friends via the pool code
5. Make predictions!

## What's Seeded

### Teams (48)
All 48 World Cup 2026 teams organized in 12 groups (A-L):
- Group A: USA, Colombia, Senegal, New Zealand
- Group B: Mexico, England, Iran, Nigeria
- Group C: Canada, Germany, Japan, Cameroon
- Group D: Argentina, Netherlands, Australia, Egypt
- ... (see full list in lib/wc2026-data.js)

### Matches (104)
- 72 Group Stage matches (Matchday 1-3)
- 16 Round of 32 matches
- 8 Round of 16 matches
- 4 Quarter-finals
- 2 Semi-finals
- 1 Third-place playoff
- 1 Final

### Players (~250)
Key players for each major team:
- Goalkeepers (for Best Goalkeeper pick)
- Forwards & Midfielders (for Top Scorer pick)
- About 7 players per team

## API Endpoints

### Matches
- `GET /api/matches` - All matches
- `GET /api/matches?matchday=1` - Matchday 1 matches
- `GET /api/matches?stage=group` - Group stage matches

### Teams
- `GET /api/teams` - All teams
- `GET /api/teams?group=A` - Teams in Group A

### Players
- `GET /api/players` - All players
- `GET /api/players?position=GK` - All goalkeepers
- `GET /api/players?position=FWD` - All forwards

### Seeding
- `GET /api/seed-matches` - Get seed stats
- `POST /api/seed-matches` - Run seed

### Score Updates
- `GET /api/update-scores?matchday=1` - Get match statuses
- `POST /api/update-scores` - Update a match score:
  ```json
  {
    "matchId": "uuid",
    "homeScore": 2,
    "awayScore": 1,
    "status": "completed"
  }
  ```

## Scoring System

### Match Picks
- **Exact scoreline**: 3 points
- **Correct result only**: 1 point

### Knockout Multipliers
- Round of 32: 1x
- Round of 16: 1.5x
- Quarter-finals: 2x
- Semi-finals: 2.5x
- Final: 3x

### Special Picks
- Champion: 10 points
- Runner-up: 7 points
- Top Scorer: 5 points
- Best Goalkeeper: 5 points

## Database Schema

### Key Tables
- `tournaments` - Tournament info
- `teams` - 48 teams with groups
- `players` - Key players per team
- `matches` - All 104 matches
- `pools` - User pools
- `pool_members` - Pool memberships
- `match_picks` - User predictions
- `special_picks` - Champion/scorer/keeper picks

## Troubleshooting

### "Row-level security policy" error
Run the `enable-seed-policies.sql` script in Supabase SQL Editor.

### No matches showing
Run the `seed-wc2026.sql` script in Supabase SQL Editor.

### No players showing
1. First run `migration-players.sql` to create the table
2. Then run the seed script again

## File Structure

```
supabase/
├── schema.sql              # Main database schema
├── migration-players.sql   # Add players table
├── enable-seed-policies.sql # RLS policies for seeding
└── seed-wc2026.sql         # Complete data seed

lib/
├── supabase.js             # Supabase client
└── wc2026-data.js          # World Cup 2026 data

app/api/
├── matches/route.js        # Get matches
├── teams/route.js          # Get teams
├── players/route.js        # Get players
├── seed-matches/route.js   # Seed endpoint
├── update-scores/route.js  # Update scores
└── calculate-points/route.js # Calculate points
```
