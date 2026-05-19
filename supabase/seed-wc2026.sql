-- World Cup 2026 Seed Data
-- Run this in Supabase SQL Editor to seed all data

-- First, get the tournament ID
DO $$
DECLARE
  tournament_uuid UUID;
BEGIN
  -- Get or create the tournament
  INSERT INTO tournaments (name, slug, start_date, end_date, status, config)
  VALUES (
    'FIFA World Cup 2026',
    'world-cup-2026',
    '2026-06-11',
    '2026-07-19',
    'upcoming',
    '{
      "scoring": {
        "exact_score": 3,
        "correct_result": 1,
        "champion": 10,
        "runner_up": 7,
        "top_scorer": 5,
        "best_keeper": 5
      },
      "host_countries": ["USA", "Canada", "Mexico"]
    }'
  )
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO tournament_uuid;

  -- Clear existing data for this tournament
  DELETE FROM players WHERE team_id IN (SELECT id FROM teams WHERE tournament_id = tournament_uuid);
  DELETE FROM matches WHERE tournament_id = tournament_uuid;
  DELETE FROM teams WHERE tournament_id = tournament_uuid;

  -- Insert teams
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'United States', 'USA', 'us', 'A');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Colombia', 'COL', 'co', 'A');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Senegal', 'SEN', 'sn', 'A');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'New Zealand', 'NZL', 'nz', 'A');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Mexico', 'MEX', 'mx', 'B');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'England', 'ENG', 'gb-eng', 'B');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Iran', 'IRN', 'ir', 'B');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Nigeria', 'NGA', 'ng', 'B');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Canada', 'CAN', 'ca', 'C');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Germany', 'GER', 'de', 'C');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Japan', 'JPN', 'jp', 'C');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Cameroon', 'CMR', 'cm', 'C');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Argentina', 'ARG', 'ar', 'D');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Netherlands', 'NED', 'nl', 'D');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Australia', 'AUS', 'au', 'D');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Egypt', 'EGY', 'eg', 'D');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'France', 'FRA', 'fr', 'E');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Uruguay', 'URU', 'uy', 'E');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'South Korea', 'KOR', 'kr', 'E');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Morocco', 'MAR', 'ma', 'E');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Brazil', 'BRA', 'br', 'F');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Spain', 'ESP', 'es', 'F');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Serbia', 'SRB', 'rs', 'F');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Costa Rica', 'CRC', 'cr', 'F');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Portugal', 'POR', 'pt', 'G');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Belgium', 'BEL', 'be', 'G');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Chile', 'CHI', 'cl', 'G');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Ghana', 'GHA', 'gh', 'G');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Italy', 'ITA', 'it', 'H');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Switzerland', 'SUI', 'ch', 'H');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Ecuador', 'ECU', 'ec', 'H');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Tunisia', 'TUN', 'tn', 'H');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Croatia', 'CRO', 'hr', 'I');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Denmark', 'DEN', 'dk', 'I');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Paraguay', 'PRY', 'py', 'I');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Saudi Arabia', 'SAU', 'sa', 'I');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Poland', 'POL', 'pl', 'J');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Austria', 'AUT', 'at', 'J');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Venezuela', 'VEN', 've', 'J');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Côte d''Ivoire', 'CIV', 'ci', 'J');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Ukraine', 'UKR', 'ua', 'K');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Sweden', 'SWE', 'se', 'K');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Peru', 'PER', 'pe', 'K');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Qatar', 'QAT', 'qa', 'K');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Turkey', 'TUR', 'tr', 'L');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Wales', 'WAL', 'gb-wls', 'L');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Algeria', 'ALG', 'dz', 'L');
  INSERT INTO teams (tournament_id, name, code, flag_code, group_name) VALUES (tournament_uuid, 'Honduras', 'HON', 'hn', 'L');

END $$;

-- Now insert matches (using a separate block to get team IDs)
DO $$
DECLARE
  tournament_uuid UUID;
  home_team_uuid UUID;
  away_team_uuid UUID;
BEGIN
  SELECT id INTO tournament_uuid FROM tournaments WHERE slug = 'world-cup-2026';

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'USA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'COL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'A', home_team_uuid, away_team_uuid, 'United States', 'Colombia', 'us', 'co', '2026-06-11T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SEN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NZL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'A', home_team_uuid, away_team_uuid, 'Senegal', 'New Zealand', 'sn', 'nz', '2026-06-11T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'USA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SEN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'A', home_team_uuid, away_team_uuid, 'United States', 'Senegal', 'us', 'sn', '2026-06-15T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'COL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NZL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'A', home_team_uuid, away_team_uuid, 'Colombia', 'New Zealand', 'co', 'nz', '2026-06-16T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'USA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NZL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'A', home_team_uuid, away_team_uuid, 'United States', 'New Zealand', 'us', 'nz', '2026-06-19T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'COL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SEN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'A', home_team_uuid, away_team_uuid, 'Colombia', 'Senegal', 'co', 'sn', '2026-06-19T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MEX';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ENG';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'B', home_team_uuid, away_team_uuid, 'Mexico', 'England', 'mx', 'gb-eng', '2026-06-12T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'IRN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NGA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'B', home_team_uuid, away_team_uuid, 'Iran', 'Nigeria', 'ir', 'ng', '2026-06-12T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MEX';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'IRN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'B', home_team_uuid, away_team_uuid, 'Mexico', 'Iran', 'mx', 'ir', '2026-06-16T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ENG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NGA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'B', home_team_uuid, away_team_uuid, 'England', 'Nigeria', 'gb-eng', 'ng', '2026-06-17T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MEX';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NGA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'B', home_team_uuid, away_team_uuid, 'Mexico', 'Nigeria', 'mx', 'ng', '2026-06-20T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ENG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'IRN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'B', home_team_uuid, away_team_uuid, 'England', 'Iran', 'gb-eng', 'ir', '2026-06-20T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CAN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GER';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'C', home_team_uuid, away_team_uuid, 'Canada', 'Germany', 'ca', 'de', '2026-06-13T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'JPN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CMR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'C', home_team_uuid, away_team_uuid, 'Japan', 'Cameroon', 'jp', 'cm', '2026-06-13T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CAN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'JPN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'C', home_team_uuid, away_team_uuid, 'Canada', 'Japan', 'ca', 'jp', '2026-06-17T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GER';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CMR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'C', home_team_uuid, away_team_uuid, 'Germany', 'Cameroon', 'de', 'cm', '2026-06-18T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CAN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CMR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'C', home_team_uuid, away_team_uuid, 'Canada', 'Cameroon', 'ca', 'cm', '2026-06-21T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GER';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'JPN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'C', home_team_uuid, away_team_uuid, 'Germany', 'Japan', 'de', 'jp', '2026-06-21T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ARG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NED';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'D', home_team_uuid, away_team_uuid, 'Argentina', 'Netherlands', 'ar', 'nl', '2026-06-14T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUS';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'EGY';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'D', home_team_uuid, away_team_uuid, 'Australia', 'Egypt', 'au', 'eg', '2026-06-14T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ARG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUS';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'D', home_team_uuid, away_team_uuid, 'Argentina', 'Australia', 'ar', 'au', '2026-06-18T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NED';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'EGY';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'D', home_team_uuid, away_team_uuid, 'Netherlands', 'Egypt', 'nl', 'eg', '2026-06-19T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ARG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'EGY';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'D', home_team_uuid, away_team_uuid, 'Argentina', 'Egypt', 'ar', 'eg', '2026-06-22T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NED';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUS';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'D', home_team_uuid, away_team_uuid, 'Netherlands', 'Australia', 'nl', 'au', '2026-06-22T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'FRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'URU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'E', home_team_uuid, away_team_uuid, 'France', 'Uruguay', 'fr', 'uy', '2026-06-11T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'KOR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MAR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'E', home_team_uuid, away_team_uuid, 'South Korea', 'Morocco', 'kr', 'ma', '2026-06-11T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'FRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'KOR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'E', home_team_uuid, away_team_uuid, 'France', 'South Korea', 'fr', 'kr', '2026-06-15T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'URU';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MAR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'E', home_team_uuid, away_team_uuid, 'Uruguay', 'Morocco', 'uy', 'ma', '2026-06-16T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'FRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MAR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'E', home_team_uuid, away_team_uuid, 'France', 'Morocco', 'fr', 'ma', '2026-06-19T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'URU';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'KOR';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'E', home_team_uuid, away_team_uuid, 'Uruguay', 'South Korea', 'uy', 'kr', '2026-06-19T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ESP';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'F', home_team_uuid, away_team_uuid, 'Brazil', 'Spain', 'br', 'es', '2026-06-12T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SRB';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRC';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'F', home_team_uuid, away_team_uuid, 'Serbia', 'Costa Rica', 'rs', 'cr', '2026-06-12T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SRB';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'F', home_team_uuid, away_team_uuid, 'Brazil', 'Serbia', 'br', 'rs', '2026-06-16T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ESP';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRC';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'F', home_team_uuid, away_team_uuid, 'Spain', 'Costa Rica', 'es', 'cr', '2026-06-17T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BRA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRC';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'F', home_team_uuid, away_team_uuid, 'Brazil', 'Costa Rica', 'br', 'cr', '2026-06-20T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ESP';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SRB';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'F', home_team_uuid, away_team_uuid, 'Spain', 'Serbia', 'es', 'rs', '2026-06-20T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BEL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'G', home_team_uuid, away_team_uuid, 'Portugal', 'Belgium', 'pt', 'be', '2026-06-13T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CHI';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GHA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'G', home_team_uuid, away_team_uuid, 'Chile', 'Ghana', 'cl', 'gh', '2026-06-13T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CHI';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'G', home_team_uuid, away_team_uuid, 'Portugal', 'Chile', 'pt', 'cl', '2026-06-17T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BEL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GHA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'G', home_team_uuid, away_team_uuid, 'Belgium', 'Ghana', 'be', 'gh', '2026-06-18T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GHA';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'G', home_team_uuid, away_team_uuid, 'Portugal', 'Ghana', 'pt', 'gh', '2026-06-21T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BEL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CHI';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'G', home_team_uuid, away_team_uuid, 'Belgium', 'Chile', 'be', 'cl', '2026-06-21T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ITA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SUI';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'H', home_team_uuid, away_team_uuid, 'Italy', 'Switzerland', 'it', 'ch', '2026-06-14T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ECU';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'H', home_team_uuid, away_team_uuid, 'Ecuador', 'Tunisia', 'ec', 'tn', '2026-06-14T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ITA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ECU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'H', home_team_uuid, away_team_uuid, 'Italy', 'Ecuador', 'it', 'ec', '2026-06-18T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SUI';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'H', home_team_uuid, away_team_uuid, 'Switzerland', 'Tunisia', 'ch', 'tn', '2026-06-19T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ITA';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'H', home_team_uuid, away_team_uuid, 'Italy', 'Tunisia', 'it', 'tn', '2026-06-22T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SUI';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ECU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'H', home_team_uuid, away_team_uuid, 'Switzerland', 'Ecuador', 'ch', 'ec', '2026-06-22T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRO';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'DEN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'I', home_team_uuid, away_team_uuid, 'Croatia', 'Denmark', 'hr', 'dk', '2026-06-11T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PRY';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SAU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'I', home_team_uuid, away_team_uuid, 'Paraguay', 'Saudi Arabia', 'py', 'sa', '2026-06-11T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRO';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PRY';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'I', home_team_uuid, away_team_uuid, 'Croatia', 'Paraguay', 'hr', 'py', '2026-06-15T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'DEN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SAU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'I', home_team_uuid, away_team_uuid, 'Denmark', 'Saudi Arabia', 'dk', 'sa', '2026-06-16T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRO';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SAU';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'I', home_team_uuid, away_team_uuid, 'Croatia', 'Saudi Arabia', 'hr', 'sa', '2026-06-19T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'DEN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PRY';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'I', home_team_uuid, away_team_uuid, 'Denmark', 'Paraguay', 'dk', 'py', '2026-06-19T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUT';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'J', home_team_uuid, away_team_uuid, 'Poland', 'Austria', 'pl', 'at', '2026-06-12T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'VEN';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CIV';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'J', home_team_uuid, away_team_uuid, 'Venezuela', 'Côte d''Ivoire', 've', 'ci', '2026-06-12T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'VEN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'J', home_team_uuid, away_team_uuid, 'Poland', 'Venezuela', 'pl', 've', '2026-06-16T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUT';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CIV';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'J', home_team_uuid, away_team_uuid, 'Austria', 'Côte d''Ivoire', 'at', 'ci', '2026-06-17T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CIV';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'J', home_team_uuid, away_team_uuid, 'Poland', 'Côte d''Ivoire', 'pl', 'ci', '2026-06-20T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUT';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'VEN';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'J', home_team_uuid, away_team_uuid, 'Austria', 'Venezuela', 'at', 've', '2026-06-20T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'UKR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SWE';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'K', home_team_uuid, away_team_uuid, 'Ukraine', 'Sweden', 'ua', 'se', '2026-06-13T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PER';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'QAT';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'K', home_team_uuid, away_team_uuid, 'Peru', 'Qatar', 'pe', 'qa', '2026-06-13T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'UKR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PER';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'K', home_team_uuid, away_team_uuid, 'Ukraine', 'Peru', 'ua', 'pe', '2026-06-17T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SWE';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'QAT';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'K', home_team_uuid, away_team_uuid, 'Sweden', 'Qatar', 'se', 'qa', '2026-06-18T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'UKR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'QAT';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'K', home_team_uuid, away_team_uuid, 'Ukraine', 'Qatar', 'ua', 'qa', '2026-06-21T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SWE';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'PER';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'K', home_team_uuid, away_team_uuid, 'Sweden', 'Peru', 'se', 'pe', '2026-06-21T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'WAL';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'L', home_team_uuid, away_team_uuid, 'Turkey', 'Wales', 'tr', 'gb-wls', '2026-06-14T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ALG';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'HON';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 1, 'group', 'L', home_team_uuid, away_team_uuid, 'Algeria', 'Honduras', 'dz', 'hn', '2026-06-14T19:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ALG';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'L', home_team_uuid, away_team_uuid, 'Turkey', 'Algeria', 'tr', 'dz', '2026-06-18T22:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'WAL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'HON';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 2, 'group', 'L', home_team_uuid, away_team_uuid, 'Wales', 'Honduras', 'gb-wls', 'hn', '2026-06-19T01:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUR';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'HON';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'L', home_team_uuid, away_team_uuid, 'Turkey', 'Honduras', 'tr', 'hn', '2026-06-22T16:00:00.000Z', 'scheduled');

  SELECT id INTO home_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'WAL';
  SELECT id INTO away_team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ALG';
  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_id, away_team_id, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
  VALUES (tournament_uuid, 3, 'group', 'L', home_team_uuid, away_team_uuid, 'Wales', 'Algeria', 'gb-wls', 'dz', '2026-06-22T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group A', 'Runner-up Group B', '2026-06-23T16:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group C', 'Runner-up Group D', '2026-06-23T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group E', 'Runner-up Group F', '2026-06-23T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group G', 'Runner-up Group H', '2026-06-24T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group I', 'Runner-up Group J', '2026-06-24T16:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group K', 'Runner-up Group L', '2026-06-24T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group A', 'Runner-up Group B', '2026-06-24T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group C', 'Runner-up Group D', '2026-06-25T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group E', 'Runner-up Group F', '2026-06-25T16:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group G', 'Runner-up Group H', '2026-06-25T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group I', 'Runner-up Group J', '2026-06-25T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group K', 'Runner-up Group L', '2026-06-26T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group A', 'Runner-up Group B', '2026-06-26T16:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group C', 'Runner-up Group D', '2026-06-26T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group E', 'Runner-up Group F', '2026-06-26T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 4, 'r32', NULL, 'Winner Group G', 'Runner-up Group H', '2026-06-27T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-1', 'Winner R32-2', '2026-06-27T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-3', 'Winner R32-4', '2026-06-27T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-5', 'Winner R32-6', '2026-06-28T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-7', 'Winner R32-8', '2026-06-28T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-9', 'Winner R32-10', '2026-06-29T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-11', 'Winner R32-12', '2026-06-29T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-13', 'Winner R32-14', '2026-06-30T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 5, 'r16', NULL, 'Winner R32-15', 'Winner R32-16', '2026-06-30T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 6, 'qf', NULL, 'Winner R16-1', 'Winner R16-2', '2026-07-03T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 6, 'qf', NULL, 'Winner R16-3', 'Winner R16-4', '2026-07-04T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 6, 'qf', NULL, 'Winner R16-5', 'Winner R16-6', '2026-07-04T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 6, 'qf', NULL, 'Winner R16-7', 'Winner R16-8', '2026-07-05T01:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 7, 'sf', NULL, 'Winner QF-1', 'Winner QF-2', '2026-07-08T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 7, 'sf', NULL, 'Winner QF-3', 'Winner QF-4', '2026-07-09T22:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 8, 'third', NULL, 'Loser SF-1', 'Loser SF-2', '2026-07-18T19:00:00.000Z', 'scheduled');

  INSERT INTO matches (tournament_id, matchday, stage, group_name, home_team_name, away_team_name, match_time, status)
  VALUES (tournament_uuid, 8, 'final', NULL, 'Winner SF-1', 'Winner SF-2', '2026-07-19T22:00:00.000Z', 'scheduled');


END $$;

-- Insert players
DO $$
DECLARE
  team_uuid UUID;
  tournament_uuid UUID;
BEGIN
  SELECT id INTO tournament_uuid FROM tournaments WHERE slug = 'world-cup-2026';

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ARG';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Emiliano Martínez', 'GK', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lionel Messi', 'FWD', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Julián Álvarez', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lautaro Martínez', 'FWD', 22, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rodrigo De Paul', 'MID', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alexis Mac Allister', 'MID', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cristian Romero', 'DEF', 13, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'FRA';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mike Maignan', 'GK', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kylian Mbappé', 'FWD', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Marcus Thuram', 'FWD', 15, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ousmane Dembélé', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Antoine Griezmann', 'MID', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Aurélien Tchouaméni', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'William Saliba', 'DEF', 17, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BRA';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alisson Becker', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Vinícius Júnior', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rodrygo', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Endrick', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Bruno Guimarães', 'MID', 5, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lucas Paquetá', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Marquinhos', 'DEF', 4, true);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ENG';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jordan Pickford', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Harry Kane', 'FWD', 9, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Bukayo Saka', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Phil Foden', 'MID', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jude Bellingham', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Declan Rice', 'MID', 4, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kyle Walker', 'DEF', 2, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'GER';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Manuel Neuer', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kai Havertz', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Leroy Sané', 'FWD', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Florian Wirtz', 'MID', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jamal Musiala', 'MID', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'İlkay Gündoğan', 'MID', 21, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Antonio Rüdiger', 'DEF', 2, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ESP';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Unai Simón', 'GK', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Álvaro Morata', 'FWD', 7, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lamine Yamal', 'FWD', 19, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Nico Williams', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Pedri', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rodri', 'MID', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Dani Carvajal', 'DEF', 2, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POR';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Diogo Costa', 'GK', 22, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cristiano Ronaldo', 'FWD', 7, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rafael Leão', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Gonçalo Ramos', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Bruno Fernandes', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Vitinha', 'MID', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rúben Dias', 'DEF', 4, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NED';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Bart Verbruggen', 'GK', 13, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cody Gakpo', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Memphis Depay', 'FWD', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Xavi Simons', 'MID', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Frenkie de Jong', 'MID', 21, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Virgil van Dijk', 'DEF', 4, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Nathan Aké', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ITA';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Gianluigi Donnarumma', 'GK', 1, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Gianluca Scamacca', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Federico Chiesa', 'FWD', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lorenzo Pellegrini', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Nicolò Barella', 'MID', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sandro Tonali', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alessandro Bastoni', 'DEF', 23, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'BEL';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Thibaut Courtois', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Romelu Lukaku', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jérémy Doku', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kevin De Bruyne', 'MID', 7, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Youri Tielemans', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Amadou Onana', 'MID', 4, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jan Vertonghen', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CRO';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Dominik Livaković', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ante Budimir', 'FWD', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Andrej Kramarić', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Luka Modrić', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mateo Kovačić', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Marcelo Brozović', 'MID', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Joško Gvardiol', 'DEF', 20, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'USA';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Matt Turner', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Christian Pulisic', 'FWD', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Folarin Balogun', 'FWD', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ricardo Pepi', 'FWD', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Giovanni Reyna', 'MID', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Tyler Adams', 'MID', 4, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Weston McKennie', 'MID', 8, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MEX';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Guillermo Ochoa', 'GK', 13, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Santiago Giménez', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hirving Lozano', 'FWD', 22, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alexis Vega', 'FWD', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Edson Álvarez', 'MID', 4, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Luis Chávez', 'MID', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'César Montes', 'DEF', 3, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'CAN';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Milan Borjan', 'GK', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alphonso Davies', 'DEF', 19, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jonathan David', 'FWD', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cyle Larin', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Tajon Buchanan', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Stephen Eustáquio', 'MID', 7, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'URU';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sergio Rochet', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Darwin Núñez', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Luis Suárez', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Facundo Pellistri', 'FWD', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Federico Valverde', 'MID', 15, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rodrigo Bentancur', 'MID', 6, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'José María Giménez', 'DEF', 2, true);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'COL';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'David Ospina', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Luis Díaz', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rafael Santos Borré', 'FWD', 19, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jhon Córdoba', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'James Rodríguez', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Richard Ríos', 'MID', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Dávinson Sánchez', 'DEF', 23, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'JPN';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Shuichi Gonda', 'GK', 12, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Takumi Minamino', 'FWD', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kaoru Mitoma', 'FWD', 22, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ritsu Doan', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Wataru Endo', 'MID', 6, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Takefusa Kubo', 'MID', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ko Itakura', 'DEF', 4, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'KOR';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kim Seung-gyu', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Son Heung-min', 'FWD', 7, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cho Gue-sung', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hwang Hee-chan', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Lee Kang-in', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jung Woo-young', 'MID', 5, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kim Min-jae', 'DEF', 3, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'MAR';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Yassine Bounou', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Youssef En-Nesyri', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hakim Ziyech', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sofiane Boufal', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sofyan Amrabat', 'MID', 4, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Azzedine Ounahi', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Achraf Hakimi', 'DEF', 2, true);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SEN';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Édouard Mendy', 'GK', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sadio Mané', 'FWD', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ismaïla Sarr', 'FWD', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Boulaye Dia', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Idrissa Gueye', 'MID', 5, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Pape Matar Sarr', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kalidou Koulibaly', 'DEF', 3, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'NGA';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Stanley Nwabali', 'GK', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Victor Osimhen', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Samuel Chukwueze', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ademola Lookman', 'FWD', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Wilfred Ndidi', 'MID', 4, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alex Iwobi', 'MID', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'William Ekong', 'DEF', 5, true);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SUI';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Yann Sommer', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Breel Embolo', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Noah Okafor', 'FWD', 19, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Granit Xhaka', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Xherdan Shaqiri', 'MID', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Denis Zakaria', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Manuel Akanji', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'DEN';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kasper Schmeichel', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Rasmus Højlund', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jonas Wind', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Christian Eriksen', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Pierre-Emile Højbjerg', 'MID', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Simon Kjær', 'DEF', 4, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Joakim Mæhle', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUT';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Patrick Pentz', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Marko Arnautović', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Michael Gregoritsch', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Marcel Sabitzer', 'MID', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Konrad Laimer', 'MID', 8, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'David Alaba', 'DEF', 8, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kevin Danso', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'POL';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Wojciech Szczęsny', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Robert Lewandowski', 'FWD', 9, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Krzysztof Piątek', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Arkadiusz Milik', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Piotr Zieliński', 'MID', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Nicola Zalewski', 'MID', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jan Bednarek', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'TUR';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mert Günok', 'GK', 12, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Arda Güler', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kenan Yıldız', 'FWD', 18, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Cenk Tosun', 'FWD', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hakan Çalhanoğlu', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ferdi Kadıoğlu', 'MID', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Merih Demiral', 'DEF', 3, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'UKR';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Andriy Lunin', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Artem Dovbyk', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mykhailo Mudryk', 'FWD', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Viktor Tsygankov', 'FWD', 15, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Oleksandr Zinchenko', 'DEF', 17, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Georgiy Sudakov', 'MID', 22, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Illya Zabarnyi', 'DEF', 13, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SRB';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Predrag Rajković', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Aleksandar Mitrović', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Dušan Vlahović', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Dušan Tadić', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sergej Milinković-Savić', 'MID', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Filip Kostić', 'MID', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Nikola Milenković', 'DEF', 5, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'ECU';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hernán Galíndez', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Enner Valencia', 'FWD', 13, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kevin Rodríguez', 'FWD', 19, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Gonzalo Plata', 'FWD', 16, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Moisés Caicedo', 'MID', 23, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Kendry Páez', 'MID', 10, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Piero Hincapié', 'DEF', 3, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'AUS';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mathew Ryan', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mitch Duke', 'FWD', 15, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jamie Maclaren', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Craig Goodwin', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Aaron Mooy', 'MID', 13, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Jackson Irvine', 'MID', 22, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Harry Souttar', 'DEF', 19, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'IRN';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alireza Beiranvand', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mehdi Taremi', 'FWD', 9, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sardar Azmoun', 'FWD', 20, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Alireza Jahanbakhsh', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Saeid Ezatolahi', 'MID', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ehsan Hajsafi', 'DEF', 3, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Morteza Pouraliganji', 'DEF', 4, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'SAU';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mohammed Al-Owais', 'GK', 1, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Salem Al-Dawsari', 'FWD', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Saleh Al-Shehri', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Firas Al-Buraikan', 'FWD', 7, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mohamed Kanno', 'MID', 6, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Sami Al-Najei', 'MID', 14, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Ali Al-Bulaihi', 'DEF', 4, false);

  SELECT id INTO team_uuid FROM teams WHERE tournament_id = tournament_uuid AND code = 'QAT';
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Saad Al Sheeb', 'GK', 21, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Almoez Ali', 'FWD', 19, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Akram Afif', 'FWD', 11, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Mohammed Muntari', 'FWD', 17, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Hassan Al-Haydos', 'MID', 10, true);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Karim Boudiaf', 'MID', 12, false);
  INSERT INTO players (team_id, name, position, jersey_number, is_captain) VALUES (team_uuid, 'Abdelkarim Hassan', 'DEF', 3, false);


END $$;

-- Verify the data
SELECT 'Teams' as table_name, COUNT(*) as count FROM teams WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'world-cup-2026')
UNION ALL
SELECT 'Matches', COUNT(*) FROM matches WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'world-cup-2026')
UNION ALL
SELECT 'Players', COUNT(*) FROM players WHERE team_id IN (SELECT id FROM teams WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'world-cup-2026'));

