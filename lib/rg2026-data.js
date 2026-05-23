// Roland Garros 2026 Data
// Tennis Grand Slam Special Picks Configuration

export const RG2026_TOURNAMENT = {
  id: 'rg-2026',
  name: 'Roland Garros 2026',
  shortName: 'RG 2026',
  startDate: '2026-05-24',
  endDate: '2026-06-07',
  location: 'Paris, France',
  surface: 'Clay',
}

// Roland Garros Scoring Rules
export const RG_SCORING_RULES = {
  // Match picks (tennis)
  correctWinner: 1,        // Predict match winner
  correctSetScore: 2,      // Predict correct set score (e.g., 3-1)
  exactScore: 3,           // Predict exact game scores (optional)
  
  // Round multipliers
  r16: 1,
  qf: 1.5,
  sf: 2,
  final: 3,
  
  // Special picks
  winner: 10,
  runnerUp: 7,    // Same as World Cup
}

// Special picks configuration for Roland Garros
export const RG_SPECIAL_PICKS = [
  {
    id: 'winner',
    name: 'Winner',
    description: 'Pick the player who wins Roland Garros 2026',
    points: RG_SCORING_RULES.winner,
    type: 'player',
  },
  {
    id: 'runner_up',
    name: 'Runner-Up',
    description: 'Pick the player who finishes as finalist',
    points: RG_SCORING_RULES.runnerUp,
    type: 'player',
  },
]

// Top ATP players for 2026
export const RG_PLAYERS_MEN = [
  { name: 'Carlos Alcaraz', country: 'es', rank: 1 },
  { name: 'Jannik Sinner', country: 'it', rank: 2 },
  { name: 'Novak Djokovic', country: 'rs', rank: 3 },
  { name: 'Daniil Medvedev', country: 'ru', rank: 4 },
  { name: 'Alexander Zverev', country: 'de', rank: 5 },
  { name: 'Andrey Rublev', country: 'ru', rank: 6 },
  { name: 'Holger Rune', country: 'dk', rank: 7 },
  { name: 'Casper Ruud', country: 'no', rank: 8 },
  { name: 'Stefanos Tsitsipas', country: 'gr', rank: 9 },
  { name: 'Taylor Fritz', country: 'us', rank: 10 },
  { name: 'Hubert Hurkacz', country: 'pl', rank: 11 },
  { name: 'Frances Tiafoe', country: 'us', rank: 12 },
  { name: 'Ben Shelton', country: 'us', rank: 13 },
  { name: 'Tommy Paul', country: 'us', rank: 14 },
  { name: 'Alex de Minaur', country: 'au', rank: 15 },
  { name: 'Lorenzo Musetti', country: 'it', rank: 16 },
]

// Top WTA players for 2026
export const RG_PLAYERS_WOMEN = [
  { name: 'Iga Swiatek', country: 'pl', rank: 1 },
  { name: 'Aryna Sabalenka', country: 'by', rank: 2 },
  { name: 'Coco Gauff', country: 'us', rank: 3 },
  { name: 'Elena Rybakina', country: 'kz', rank: 4 },
  { name: 'Jessica Pegula', country: 'us', rank: 5 },
  { name: 'Qinwen Zheng', country: 'cn', rank: 6 },
  { name: 'Ons Jabeur', country: 'tn', rank: 7 },
  { name: 'Emma Navarro', country: 'us', rank: 8 },
  { name: 'Maria Sakkari', country: 'gr', rank: 9 },
  { name: 'Jasmine Paolini', country: 'it', rank: 10 },
]

// Flag helper
export const flagUrl = (code, size = 40) => 
  `https://flagcdn.com/w${size}/${code}.png`
