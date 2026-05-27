-- Roland Garros 2026 - R32 Day 1 & Day 2 Seed
-- Run this in Supabase SQL Editor

-- 1. Create/get tournament
INSERT INTO tournaments (name, slug, start_date, end_date, status, config)
VALUES (
  'Roland Garros 2026',
  'roland-garros-2026',
  '2026-05-25',
  '2026-06-08',
  'active',
  '{"sport": "tennis", "scoring": {"correct_winner": 1, "upset_bonus": 2}}'
)
ON CONFLICT (slug) DO UPDATE SET status = 'active'
RETURNING id;

-- 2. Delete old R32 matches (matchday 1 and 2)
DELETE FROM matches 
WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'roland-garros-2026')
  AND matchday IN (1, 2);

-- 3. Insert R32 Day 1 matches (May 27)
INSERT INTO matches (tournament_id, matchday, stage, home_team_name, away_team_name, home_flag, away_flag, match_time, status)
SELECT 
  (SELECT id FROM tournaments WHERE slug = 'roland-garros-2026'),
  matchday, stage, home_team_name, away_team_name, home_flag, away_flag, match_time, status
FROM (VALUES
  (1, 'round_of_32', 'A. Davidovich Fokina', 'T. Tirante', 'es', 'ar', '2026-05-27 09:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'A. de Minaur', 'A. Blockx', 'au', 'be', '2026-05-27 09:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'F. Cinà', 'J. De Jong', 'it', 'nl', '2026-05-27 09:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'K. Khachanov', 'M. Trungelliti', 'ru', 'ar', '2026-05-27 09:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'C. Ugo Carabelli', 'A. Rublev', 'ar', 'ru', '2026-05-27 10:10:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'M. Navone', 'J. Menšik', 'ar', 'cz', '2026-05-27 10:40:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'J. Duckworth', 'R. Jódar', 'au', 'es', '2026-05-27 11:20:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'N. Borges', 'M. Kecmanović', 'pt', 'rs', '2026-05-27 11:20:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'T. Kokkinakis', 'P. Carreño Busta', 'au', 'es', '2026-05-27 11:20:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'J. Fonseca', 'D. Prižmić', 'br', 'hr', '2026-05-27 11:50:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'U. Humbert', 'Q. Halys', 'fr', 'fr', '2026-05-27 11:50:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'V. Royer', 'N. Djokovic', 'fr', 'rs', '2026-05-27 12:20:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'N. Basavareddy', 'A. Michelsen', 'us', 'us', '2026-05-27 12:50:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'C. Ruud', 'H. Medjedović', 'no', 'rs', '2026-05-27 13:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'L. Sonego', 'T. Paul', 'it', 'us', '2026-05-27 13:00:00+00'::timestamptz, 'scheduled'),
  (1, 'round_of_32', 'T. Machač', 'A. Zverev', 'cz', 'de', '2026-05-27 18:15:00+00'::timestamptz, 'scheduled'),
  -- R32 Day 2 (May 28)
  (2, 'round_of_32', 'A. Vallejo', 'M. Kouamé', 'py', 'fr', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'A. Tabilo', 'V. Vacherot', 'cl', 'mc', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'A. Rinderknech', 'M. Berrettini', 'fr', 'it', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'F. Diaz Acosta', 'L. Tien', 'ar', 'us', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'F. Auger-Aliassime', 'R. Burruchaga', 'ca', 'ar', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'F. Cobolli', 'Y. Wu', 'it', 'cn', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'F. Cerundolo', 'H. Gaston', 'ar', 'fr', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'F. Comesaña', 'L. Darderi', 'ar', 'it', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'H. Hurkacz', 'F. Tiafoe', 'pl', 'us', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'J. Struff', 'J. Faria', 'de', 'pt', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'J. Sinner', 'J. Cerundolo', 'it', 'ar', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'L. Van Assche', 'B. Nakashima', 'fr', 'us', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'M. Landaluce', 'V. Kopřiva', 'es', 'cz', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'M. Arnaldi', 'S. Tsitsipas', 'it', 'gr', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'R. Collignon', 'B. Shelton', 'be', 'us', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled'),
  (2, 'round_of_32', 'Z. Svajda', 'A. Walton', 'us', 'au', '2026-05-28 09:00:00+00'::timestamptz, 'scheduled')
) AS t(matchday, stage, home_team_name, away_team_name, home_flag, away_flag, match_time, status);

-- 4. Verify
SELECT matchday, COUNT(*) as matches FROM matches 
WHERE tournament_id = (SELECT id FROM tournaments WHERE slug = 'roland-garros-2026')
  AND matchday IN (1, 2)
GROUP BY matchday;
