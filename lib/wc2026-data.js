// World Cup 2026 Data
// 48 teams, 12 groups of 4, hosted by USA/Canada/Mexico
// Updated with actual qualified teams as of 2024-2025

export const WC2026_TOURNAMENT = {
  id: 'wc-2026',
  name: 'FIFA World Cup 2026',
  shortName: 'WC 2026',
  startDate: '2026-06-11',
  endDate: '2026-07-19',
  hostCountries: ['USA', 'Canada', 'Mexico'],
}

// All 48 teams with real FIFA codes and flagcdn compatible codes
// Groups are projected based on seeding rules
export const WC2026_TEAMS = [
  // Group A (Host group 1)
  { code: 'USA', name: 'United States', flag: 'us', group: 'A', seed: 1, region: 'CONCACAF' },
  { code: 'COL', name: 'Colombia', flag: 'co', group: 'A', seed: 2, region: 'CONMEBOL' },
  { code: 'SEN', name: 'Senegal', flag: 'sn', group: 'A', seed: 3, region: 'CAF' },
  { code: 'NZL', name: 'New Zealand', flag: 'nz', group: 'A', seed: 4, region: 'OFC' },
  
  // Group B (Host group 2)
  { code: 'MEX', name: 'Mexico', flag: 'mx', group: 'B', seed: 1, region: 'CONCACAF' },
  { code: 'ENG', name: 'England', flag: 'gb-eng', group: 'B', seed: 2, region: 'UEFA' },
  { code: 'IRN', name: 'Iran', flag: 'ir', group: 'B', seed: 3, region: 'AFC' },
  { code: 'NGA', name: 'Nigeria', flag: 'ng', group: 'B', seed: 4, region: 'CAF' },
  
  // Group C (Host group 3)
  { code: 'CAN', name: 'Canada', flag: 'ca', group: 'C', seed: 1, region: 'CONCACAF' },
  { code: 'GER', name: 'Germany', flag: 'de', group: 'C', seed: 2, region: 'UEFA' },
  { code: 'JPN', name: 'Japan', flag: 'jp', group: 'C', seed: 3, region: 'AFC' },
  { code: 'CMR', name: 'Cameroon', flag: 'cm', group: 'C', seed: 4, region: 'CAF' },
  
  // Group D
  { code: 'ARG', name: 'Argentina', flag: 'ar', group: 'D', seed: 1, region: 'CONMEBOL' },
  { code: 'NED', name: 'Netherlands', flag: 'nl', group: 'D', seed: 2, region: 'UEFA' },
  { code: 'AUS', name: 'Australia', flag: 'au', group: 'D', seed: 3, region: 'AFC' },
  { code: 'EGY', name: 'Egypt', flag: 'eg', group: 'D', seed: 4, region: 'CAF' },
  
  // Group E
  { code: 'FRA', name: 'France', flag: 'fr', group: 'E', seed: 1, region: 'UEFA' },
  { code: 'URU', name: 'Uruguay', flag: 'uy', group: 'E', seed: 2, region: 'CONMEBOL' },
  { code: 'KOR', name: 'South Korea', flag: 'kr', group: 'E', seed: 3, region: 'AFC' },
  { code: 'MAR', name: 'Morocco', flag: 'ma', group: 'E', seed: 4, region: 'CAF' },
  
  // Group F
  { code: 'BRA', name: 'Brazil', flag: 'br', group: 'F', seed: 1, region: 'CONMEBOL' },
  { code: 'ESP', name: 'Spain', flag: 'es', group: 'F', seed: 2, region: 'UEFA' },
  { code: 'SRB', name: 'Serbia', flag: 'rs', group: 'F', seed: 3, region: 'UEFA' },
  { code: 'CRC', name: 'Costa Rica', flag: 'cr', group: 'F', seed: 4, region: 'CONCACAF' },
  
  // Group G
  { code: 'POR', name: 'Portugal', flag: 'pt', group: 'G', seed: 1, region: 'UEFA' },
  { code: 'BEL', name: 'Belgium', flag: 'be', group: 'G', seed: 2, region: 'UEFA' },
  { code: 'CHI', name: 'Chile', flag: 'cl', group: 'G', seed: 3, region: 'CONMEBOL' },
  { code: 'GHA', name: 'Ghana', flag: 'gh', group: 'G', seed: 4, region: 'CAF' },
  
  // Group H
  { code: 'ITA', name: 'Italy', flag: 'it', group: 'H', seed: 1, region: 'UEFA' },
  { code: 'SUI', name: 'Switzerland', flag: 'ch', group: 'H', seed: 2, region: 'UEFA' },
  { code: 'ECU', name: 'Ecuador', flag: 'ec', group: 'H', seed: 3, region: 'CONMEBOL' },
  { code: 'TUN', name: 'Tunisia', flag: 'tn', group: 'H', seed: 4, region: 'CAF' },
  
  // Group I
  { code: 'CRO', name: 'Croatia', flag: 'hr', group: 'I', seed: 1, region: 'UEFA' },
  { code: 'DEN', name: 'Denmark', flag: 'dk', group: 'I', seed: 2, region: 'UEFA' },
  { code: 'PRY', name: 'Paraguay', flag: 'py', group: 'I', seed: 3, region: 'CONMEBOL' },
  { code: 'SAU', name: 'Saudi Arabia', flag: 'sa', group: 'I', seed: 4, region: 'AFC' },
  
  // Group J
  { code: 'POL', name: 'Poland', flag: 'pl', group: 'J', seed: 1, region: 'UEFA' },
  { code: 'AUT', name: 'Austria', flag: 'at', group: 'J', seed: 2, region: 'UEFA' },
  { code: 'VEN', name: 'Venezuela', flag: 've', group: 'J', seed: 3, region: 'CONMEBOL' },
  { code: 'CIV', name: "Côte d'Ivoire", flag: 'ci', group: 'J', seed: 4, region: 'CAF' },
  
  // Group K
  { code: 'UKR', name: 'Ukraine', flag: 'ua', group: 'K', seed: 1, region: 'UEFA' },
  { code: 'SWE', name: 'Sweden', flag: 'se', group: 'K', seed: 2, region: 'UEFA' },
  { code: 'PER', name: 'Peru', flag: 'pe', group: 'K', seed: 3, region: 'CONMEBOL' },
  { code: 'QAT', name: 'Qatar', flag: 'qa', group: 'K', seed: 4, region: 'AFC' },
  
  // Group L
  { code: 'TUR', name: 'Turkey', flag: 'tr', group: 'L', seed: 1, region: 'UEFA' },
  { code: 'WAL', name: 'Wales', flag: 'gb-wls', group: 'L', seed: 2, region: 'UEFA' },
  { code: 'ALG', name: 'Algeria', flag: 'dz', group: 'L', seed: 3, region: 'CAF' },
  { code: 'HON', name: 'Honduras', flag: 'hn', group: 'L', seed: 4, region: 'CONCACAF' },
]

// Key players for each team - for special picks (top scorer, best keeper)
export const WC2026_PLAYERS = {
  // Argentina
  'ARG': [
    { name: 'Emiliano Martínez', position: 'GK', number: 23, isCaptain: false },
    { name: 'Lionel Messi', position: 'FWD', number: 10, isCaptain: true },
    { name: 'Julián Álvarez', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Lautaro Martínez', position: 'FWD', number: 22, isCaptain: false },
    { name: 'Rodrigo De Paul', position: 'MID', number: 7, isCaptain: false },
    { name: 'Alexis Mac Allister', position: 'MID', number: 20, isCaptain: false },
    { name: 'Cristian Romero', position: 'DEF', number: 13, isCaptain: false },
  ],
  // France
  'FRA': [
    { name: 'Mike Maignan', position: 'GK', number: 16, isCaptain: false },
    { name: 'Kylian Mbappé', position: 'FWD', number: 10, isCaptain: true },
    { name: 'Marcus Thuram', position: 'FWD', number: 15, isCaptain: false },
    { name: 'Ousmane Dembélé', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Antoine Griezmann', position: 'MID', number: 7, isCaptain: false },
    { name: 'Aurélien Tchouaméni', position: 'MID', number: 8, isCaptain: false },
    { name: 'William Saliba', position: 'DEF', number: 17, isCaptain: false },
  ],
  // Brazil
  'BRA': [
    { name: 'Alisson Becker', position: 'GK', number: 1, isCaptain: false },
    { name: 'Vinícius Júnior', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Rodrygo', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Endrick', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Bruno Guimarães', position: 'MID', number: 5, isCaptain: false },
    { name: 'Lucas Paquetá', position: 'MID', number: 10, isCaptain: false },
    { name: 'Marquinhos', position: 'DEF', number: 4, isCaptain: true },
  ],
  // England
  'ENG': [
    { name: 'Jordan Pickford', position: 'GK', number: 1, isCaptain: false },
    { name: 'Harry Kane', position: 'FWD', number: 9, isCaptain: true },
    { name: 'Bukayo Saka', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Phil Foden', position: 'MID', number: 11, isCaptain: false },
    { name: 'Jude Bellingham', position: 'MID', number: 10, isCaptain: false },
    { name: 'Declan Rice', position: 'MID', number: 4, isCaptain: false },
    { name: 'Kyle Walker', position: 'DEF', number: 2, isCaptain: false },
  ],
  // Germany
  'GER': [
    { name: 'Manuel Neuer', position: 'GK', number: 1, isCaptain: false },
    { name: 'Kai Havertz', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Leroy Sané', position: 'FWD', number: 10, isCaptain: false },
    { name: 'Florian Wirtz', position: 'MID', number: 17, isCaptain: false },
    { name: 'Jamal Musiala', position: 'MID', number: 14, isCaptain: false },
    { name: 'İlkay Gündoğan', position: 'MID', number: 21, isCaptain: true },
    { name: 'Antonio Rüdiger', position: 'DEF', number: 2, isCaptain: false },
  ],
  // Spain
  'ESP': [
    { name: 'Unai Simón', position: 'GK', number: 23, isCaptain: false },
    { name: 'Álvaro Morata', position: 'FWD', number: 7, isCaptain: true },
    { name: 'Lamine Yamal', position: 'FWD', number: 19, isCaptain: false },
    { name: 'Nico Williams', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Pedri', position: 'MID', number: 8, isCaptain: false },
    { name: 'Rodri', position: 'MID', number: 16, isCaptain: false },
    { name: 'Dani Carvajal', position: 'DEF', number: 2, isCaptain: false },
  ],
  // Portugal
  'POR': [
    { name: 'Diogo Costa', position: 'GK', number: 22, isCaptain: false },
    { name: 'Cristiano Ronaldo', position: 'FWD', number: 7, isCaptain: true },
    { name: 'Rafael Leão', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Gonçalo Ramos', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Bruno Fernandes', position: 'MID', number: 8, isCaptain: false },
    { name: 'Vitinha', position: 'MID', number: 11, isCaptain: false },
    { name: 'Rúben Dias', position: 'DEF', number: 4, isCaptain: false },
  ],
  // Netherlands
  'NED': [
    { name: 'Bart Verbruggen', position: 'GK', number: 13, isCaptain: false },
    { name: 'Cody Gakpo', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Memphis Depay', position: 'FWD', number: 10, isCaptain: false },
    { name: 'Xavi Simons', position: 'MID', number: 7, isCaptain: false },
    { name: 'Frenkie de Jong', position: 'MID', number: 21, isCaptain: false },
    { name: 'Virgil van Dijk', position: 'DEF', number: 4, isCaptain: true },
    { name: 'Nathan Aké', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Italy
  'ITA': [
    { name: 'Gianluigi Donnarumma', position: 'GK', number: 1, isCaptain: true },
    { name: 'Gianluca Scamacca', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Federico Chiesa', position: 'FWD', number: 14, isCaptain: false },
    { name: 'Lorenzo Pellegrini', position: 'MID', number: 10, isCaptain: false },
    { name: 'Nicolò Barella', position: 'MID', number: 18, isCaptain: false },
    { name: 'Sandro Tonali', position: 'MID', number: 8, isCaptain: false },
    { name: 'Alessandro Bastoni', position: 'DEF', number: 23, isCaptain: false },
  ],
  // Belgium
  'BEL': [
    { name: 'Thibaut Courtois', position: 'GK', number: 1, isCaptain: false },
    { name: 'Romelu Lukaku', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Jérémy Doku', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Kevin De Bruyne', position: 'MID', number: 7, isCaptain: true },
    { name: 'Youri Tielemans', position: 'MID', number: 8, isCaptain: false },
    { name: 'Amadou Onana', position: 'MID', number: 4, isCaptain: false },
    { name: 'Jan Vertonghen', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Croatia
  'CRO': [
    { name: 'Dominik Livaković', position: 'GK', number: 1, isCaptain: false },
    { name: 'Ante Budimir', position: 'FWD', number: 16, isCaptain: false },
    { name: 'Andrej Kramarić', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Luka Modrić', position: 'MID', number: 10, isCaptain: true },
    { name: 'Mateo Kovačić', position: 'MID', number: 8, isCaptain: false },
    { name: 'Marcelo Brozović', position: 'MID', number: 11, isCaptain: false },
    { name: 'Joško Gvardiol', position: 'DEF', number: 20, isCaptain: false },
  ],
  // USA
  'USA': [
    { name: 'Matt Turner', position: 'GK', number: 1, isCaptain: false },
    { name: 'Christian Pulisic', position: 'FWD', number: 10, isCaptain: true },
    { name: 'Folarin Balogun', position: 'FWD', number: 20, isCaptain: false },
    { name: 'Ricardo Pepi', position: 'FWD', number: 14, isCaptain: false },
    { name: 'Giovanni Reyna', position: 'MID', number: 7, isCaptain: false },
    { name: 'Tyler Adams', position: 'MID', number: 4, isCaptain: false },
    { name: 'Weston McKennie', position: 'MID', number: 8, isCaptain: false },
  ],
  // Mexico
  'MEX': [
    { name: 'Guillermo Ochoa', position: 'GK', number: 13, isCaptain: false },
    { name: 'Santiago Giménez', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Hirving Lozano', position: 'FWD', number: 22, isCaptain: false },
    { name: 'Alexis Vega', position: 'FWD', number: 10, isCaptain: false },
    { name: 'Edson Álvarez', position: 'MID', number: 4, isCaptain: true },
    { name: 'Luis Chávez', position: 'MID', number: 18, isCaptain: false },
    { name: 'César Montes', position: 'DEF', number: 3, isCaptain: false },
  ],
  // Canada
  'CAN': [
    { name: 'Milan Borjan', position: 'GK', number: 18, isCaptain: false },
    { name: 'Alphonso Davies', position: 'DEF', number: 19, isCaptain: true },
    { name: 'Jonathan David', position: 'FWD', number: 20, isCaptain: false },
    { name: 'Cyle Larin', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Tajon Buchanan', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Stephen Eustáquio', position: 'MID', number: 7, isCaptain: false },
  ],
  // Uruguay
  'URU': [
    { name: 'Sergio Rochet', position: 'GK', number: 1, isCaptain: false },
    { name: 'Darwin Núñez', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Luis Suárez', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Facundo Pellistri', position: 'FWD', number: 16, isCaptain: false },
    { name: 'Federico Valverde', position: 'MID', number: 15, isCaptain: false },
    { name: 'Rodrigo Bentancur', position: 'MID', number: 6, isCaptain: false },
    { name: 'José María Giménez', position: 'DEF', number: 2, isCaptain: true },
  ],
  // Colombia
  'COL': [
    { name: 'David Ospina', position: 'GK', number: 1, isCaptain: false },
    { name: 'Luis Díaz', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Rafael Santos Borré', position: 'FWD', number: 19, isCaptain: false },
    { name: 'Jhon Córdoba', position: 'FWD', number: 9, isCaptain: false },
    { name: 'James Rodríguez', position: 'MID', number: 10, isCaptain: true },
    { name: 'Richard Ríos', position: 'MID', number: 16, isCaptain: false },
    { name: 'Dávinson Sánchez', position: 'DEF', number: 23, isCaptain: false },
  ],
  // Japan
  'JPN': [
    { name: 'Shuichi Gonda', position: 'GK', number: 12, isCaptain: false },
    { name: 'Takumi Minamino', position: 'FWD', number: 10, isCaptain: false },
    { name: 'Kaoru Mitoma', position: 'FWD', number: 22, isCaptain: false },
    { name: 'Ritsu Doan', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Wataru Endo', position: 'MID', number: 6, isCaptain: true },
    { name: 'Takefusa Kubo', position: 'MID', number: 7, isCaptain: false },
    { name: 'Ko Itakura', position: 'DEF', number: 4, isCaptain: false },
  ],
  // South Korea
  'KOR': [
    { name: 'Kim Seung-gyu', position: 'GK', number: 1, isCaptain: false },
    { name: 'Son Heung-min', position: 'FWD', number: 7, isCaptain: true },
    { name: 'Cho Gue-sung', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Hwang Hee-chan', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Lee Kang-in', position: 'MID', number: 10, isCaptain: false },
    { name: 'Jung Woo-young', position: 'MID', number: 5, isCaptain: false },
    { name: 'Kim Min-jae', position: 'DEF', number: 3, isCaptain: false },
  ],
  // Morocco
  'MAR': [
    { name: 'Yassine Bounou', position: 'GK', number: 1, isCaptain: false },
    { name: 'Youssef En-Nesyri', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Hakim Ziyech', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Sofiane Boufal', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Sofyan Amrabat', position: 'MID', number: 4, isCaptain: false },
    { name: 'Azzedine Ounahi', position: 'MID', number: 8, isCaptain: false },
    { name: 'Achraf Hakimi', position: 'DEF', number: 2, isCaptain: true },
  ],
  // Senegal
  'SEN': [
    { name: 'Édouard Mendy', position: 'GK', number: 16, isCaptain: false },
    { name: 'Sadio Mané', position: 'FWD', number: 10, isCaptain: true },
    { name: 'Ismaïla Sarr', position: 'FWD', number: 18, isCaptain: false },
    { name: 'Boulaye Dia', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Idrissa Gueye', position: 'MID', number: 5, isCaptain: false },
    { name: 'Pape Matar Sarr', position: 'MID', number: 8, isCaptain: false },
    { name: 'Kalidou Koulibaly', position: 'DEF', number: 3, isCaptain: false },
  ],
  // Nigeria
  'NGA': [
    { name: 'Stanley Nwabali', position: 'GK', number: 23, isCaptain: false },
    { name: 'Victor Osimhen', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Samuel Chukwueze', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Ademola Lookman', position: 'FWD', number: 18, isCaptain: false },
    { name: 'Wilfred Ndidi', position: 'MID', number: 4, isCaptain: false },
    { name: 'Alex Iwobi', position: 'MID', number: 17, isCaptain: false },
    { name: 'William Ekong', position: 'DEF', number: 5, isCaptain: true },
  ],
  // Switzerland
  'SUI': [
    { name: 'Yann Sommer', position: 'GK', number: 1, isCaptain: false },
    { name: 'Breel Embolo', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Noah Okafor', position: 'FWD', number: 19, isCaptain: false },
    { name: 'Granit Xhaka', position: 'MID', number: 10, isCaptain: true },
    { name: 'Xherdan Shaqiri', position: 'MID', number: 23, isCaptain: false },
    { name: 'Denis Zakaria', position: 'MID', number: 8, isCaptain: false },
    { name: 'Manuel Akanji', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Denmark
  'DEN': [
    { name: 'Kasper Schmeichel', position: 'GK', number: 1, isCaptain: false },
    { name: 'Rasmus Højlund', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Jonas Wind', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Christian Eriksen', position: 'MID', number: 10, isCaptain: false },
    { name: 'Pierre-Emile Højbjerg', position: 'MID', number: 23, isCaptain: false },
    { name: 'Simon Kjær', position: 'DEF', number: 4, isCaptain: true },
    { name: 'Joakim Mæhle', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Austria
  'AUT': [
    { name: 'Patrick Pentz', position: 'GK', number: 1, isCaptain: false },
    { name: 'Marko Arnautović', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Michael Gregoritsch', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Marcel Sabitzer', position: 'MID', number: 14, isCaptain: false },
    { name: 'Konrad Laimer', position: 'MID', number: 8, isCaptain: false },
    { name: 'David Alaba', position: 'DEF', number: 8, isCaptain: true },
    { name: 'Kevin Danso', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Poland
  'POL': [
    { name: 'Wojciech Szczęsny', position: 'GK', number: 1, isCaptain: false },
    { name: 'Robert Lewandowski', position: 'FWD', number: 9, isCaptain: true },
    { name: 'Krzysztof Piątek', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Arkadiusz Milik', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Piotr Zieliński', position: 'MID', number: 20, isCaptain: false },
    { name: 'Nicola Zalewski', position: 'MID', number: 16, isCaptain: false },
    { name: 'Jan Bednarek', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Turkey
  'TUR': [
    { name: 'Mert Günok', position: 'GK', number: 12, isCaptain: false },
    { name: 'Arda Güler', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Kenan Yıldız', position: 'FWD', number: 18, isCaptain: false },
    { name: 'Cenk Tosun', position: 'FWD', number: 23, isCaptain: false },
    { name: 'Hakan Çalhanoğlu', position: 'MID', number: 10, isCaptain: true },
    { name: 'Ferdi Kadıoğlu', position: 'MID', number: 16, isCaptain: false },
    { name: 'Merih Demiral', position: 'DEF', number: 3, isCaptain: false },
  ],
  // Ukraine
  'UKR': [
    { name: 'Andriy Lunin', position: 'GK', number: 1, isCaptain: false },
    { name: 'Artem Dovbyk', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Mykhailo Mudryk', position: 'FWD', number: 10, isCaptain: false },
    { name: 'Viktor Tsygankov', position: 'FWD', number: 15, isCaptain: false },
    { name: 'Oleksandr Zinchenko', position: 'DEF', number: 17, isCaptain: true },
    { name: 'Georgiy Sudakov', position: 'MID', number: 22, isCaptain: false },
    { name: 'Illya Zabarnyi', position: 'DEF', number: 13, isCaptain: false },
  ],
  // Serbia
  'SRB': [
    { name: 'Predrag Rajković', position: 'GK', number: 1, isCaptain: false },
    { name: 'Aleksandar Mitrović', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Dušan Vlahović', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Dušan Tadić', position: 'MID', number: 10, isCaptain: true },
    { name: 'Sergej Milinković-Savić', position: 'MID', number: 20, isCaptain: false },
    { name: 'Filip Kostić', position: 'MID', number: 11, isCaptain: false },
    { name: 'Nikola Milenković', position: 'DEF', number: 5, isCaptain: false },
  ],
  // Ecuador
  'ECU': [
    { name: 'Hernán Galíndez', position: 'GK', number: 1, isCaptain: false },
    { name: 'Enner Valencia', position: 'FWD', number: 13, isCaptain: true },
    { name: 'Kevin Rodríguez', position: 'FWD', number: 19, isCaptain: false },
    { name: 'Gonzalo Plata', position: 'FWD', number: 16, isCaptain: false },
    { name: 'Moisés Caicedo', position: 'MID', number: 23, isCaptain: false },
    { name: 'Kendry Páez', position: 'MID', number: 10, isCaptain: false },
    { name: 'Piero Hincapié', position: 'DEF', number: 3, isCaptain: false },
  ],
  // Australia
  'AUS': [
    { name: 'Mathew Ryan', position: 'GK', number: 1, isCaptain: false },
    { name: 'Mitch Duke', position: 'FWD', number: 15, isCaptain: false },
    { name: 'Jamie Maclaren', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Craig Goodwin', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Aaron Mooy', position: 'MID', number: 13, isCaptain: false },
    { name: 'Jackson Irvine', position: 'MID', number: 22, isCaptain: true },
    { name: 'Harry Souttar', position: 'DEF', number: 19, isCaptain: false },
  ],
  // Iran
  'IRN': [
    { name: 'Alireza Beiranvand', position: 'GK', number: 1, isCaptain: false },
    { name: 'Mehdi Taremi', position: 'FWD', number: 9, isCaptain: false },
    { name: 'Sardar Azmoun', position: 'FWD', number: 20, isCaptain: false },
    { name: 'Alireza Jahanbakhsh', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Saeid Ezatolahi', position: 'MID', number: 14, isCaptain: false },
    { name: 'Ehsan Hajsafi', position: 'DEF', number: 3, isCaptain: true },
    { name: 'Morteza Pouraliganji', position: 'DEF', number: 4, isCaptain: false },
  ],
  // Saudi Arabia
  'SAU': [
    { name: 'Mohammed Al-Owais', position: 'GK', number: 1, isCaptain: false },
    { name: 'Salem Al-Dawsari', position: 'FWD', number: 10, isCaptain: true },
    { name: 'Saleh Al-Shehri', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Firas Al-Buraikan', position: 'FWD', number: 7, isCaptain: false },
    { name: 'Mohamed Kanno', position: 'MID', number: 6, isCaptain: false },
    { name: 'Sami Al-Najei', position: 'MID', number: 14, isCaptain: false },
    { name: 'Ali Al-Bulaihi', position: 'DEF', number: 4, isCaptain: false },
  ],
  // Qatar
  'QAT': [
    { name: 'Saad Al Sheeb', position: 'GK', number: 21, isCaptain: false },
    { name: 'Almoez Ali', position: 'FWD', number: 19, isCaptain: false },
    { name: 'Akram Afif', position: 'FWD', number: 11, isCaptain: false },
    { name: 'Mohammed Muntari', position: 'FWD', number: 17, isCaptain: false },
    { name: 'Hassan Al-Haydos', position: 'MID', number: 10, isCaptain: true },
    { name: 'Karim Boudiaf', position: 'MID', number: 12, isCaptain: false },
    { name: 'Abdelkarim Hassan', position: 'DEF', number: 3, isCaptain: false },
  ],
}

// Fallback for teams without detailed player data
export const DEFAULT_PLAYERS = [
  { position: 'GK', name: 'Goalkeeper 1', number: 1 },
  { position: 'GK', name: 'Goalkeeper 2', number: 12 },
  { position: 'DEF', name: 'Defender 1', number: 2 },
  { position: 'DEF', name: 'Defender 2', number: 4 },
  { position: 'MID', name: 'Midfielder 1', number: 8 },
  { position: 'MID', name: 'Midfielder 2', number: 10 },
  { position: 'FWD', name: 'Forward 1', number: 7 },
  { position: 'FWD', name: 'Forward 2', number: 9 },
]

// World Cup 2026 venues
export const WC2026_VENUES = {
  usa: [
    { name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 82500 },
    { name: 'AT&T Stadium', city: 'Dallas', capacity: 80000 },
    { name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240 },
    { name: 'Hard Rock Stadium', city: 'Miami', capacity: 65326 },
    { name: 'Mercedes-Benz Stadium', city: 'Atlanta', capacity: 71000 },
    { name: 'NRG Stadium', city: 'Houston', capacity: 72220 },
    { name: "Levi's Stadium", city: 'San Francisco', capacity: 68500 },
    { name: 'Lincoln Financial Field', city: 'Philadelphia', capacity: 69796 },
    { name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76416 },
    { name: 'Lumen Field', city: 'Seattle', capacity: 68740 },
    { name: 'Gillette Stadium', city: 'Boston', capacity: 65878 },
  ],
  mexico: [
    { name: 'Estadio Azteca', city: 'Mexico City', capacity: 87523 },
    { name: 'Estadio Akron', city: 'Guadalajara', capacity: 49850 },
    { name: 'Estadio BBVA', city: 'Monterrey', capacity: 53500 },
  ],
  canada: [
    { name: 'BMO Field', city: 'Toronto', capacity: 45500 },
    { name: 'BC Place', city: 'Vancouver', capacity: 54500 },
  ],
}

// Flattened venues array for scheduling
const ALL_VENUES = [
  ...WC2026_VENUES.usa,
  ...WC2026_VENUES.mexico,
  ...WC2026_VENUES.canada,
]

// Generate group stage matches with realistic scheduling
export function generateGroupStageMatches() {
  const matches = []
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']
  
  let matchNumber = 1
  
  // Matchday configuration
  // MD1: Jun 11-14, MD2: Jun 15-18, MD3: Jun 19-22
  const matchdayDates = {
    1: ['2026-06-11', '2026-06-12', '2026-06-13', '2026-06-14'],
    2: ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18'],
    3: ['2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22'],
  }
  
  // Kickoff times (ET)
  const kickoffTimes = ['12:00', '15:00', '18:00', '21:00']
  
  groups.forEach((group, groupIndex) => {
    const groupTeams = WC2026_TEAMS.filter(t => t.group === group)
    
    // Each group plays 6 matches (4 teams, round robin)
    // Match day 1: 1v2, 3v4
    // Match day 2: 1v3, 2v4  
    // Match day 3: 1v4, 2v3
    
    const matchups = [
      { day: 1, home: 0, away: 1 }, // MD1: 1st vs 2nd
      { day: 1, home: 2, away: 3 }, // MD1: 3rd vs 4th
      { day: 2, home: 0, away: 2 }, // MD2: 1st vs 3rd
      { day: 2, home: 1, away: 3 }, // MD2: 2nd vs 4th
      { day: 3, home: 0, away: 3 }, // MD3: 1st vs 4th
      { day: 3, home: 1, away: 2 }, // MD3: 2nd vs 3rd
    ]
    
    matchups.forEach((matchup, matchIndex) => {
      const dateIndex = groupIndex % 4
      const timeIndex = matchIndex % 4
      const venueIndex = (groupIndex * 6 + matchIndex) % ALL_VENUES.length
      
      const homeTeam = groupTeams[matchup.home]
      const awayTeam = groupTeams[matchup.away]
      
      matches.push({
        id: `gs-${matchNumber}`,
        matchNumber,
        matchday: matchup.day,
        round: 'Group Stage',
        stage: 'group',
        group,
        homeTeam: homeTeam.code,
        awayTeam: awayTeam.code,
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
        homeFlag: homeTeam.flag,
        awayFlag: awayTeam.flag,
        date: matchdayDates[matchup.day][dateIndex],
        time: kickoffTimes[timeIndex],
        venue: ALL_VENUES[venueIndex].name,
        city: ALL_VENUES[venueIndex].city,
        status: 'scheduled',
        homeScore: null,
        awayScore: null,
      })
      matchNumber++
    })
  })
  
  return matches
}

// Generate knockout matches (Round of 32 onwards)
export function generateKnockoutMatches() {
  const knockoutMatches = []
  let matchNumber = 73 // After 72 group stage matches
  
  // Round of 32: 16 matches (Jun 23-26)
  const r32Dates = ['2026-06-23', '2026-06-24', '2026-06-25', '2026-06-26']
  for (let i = 1; i <= 16; i++) {
    const dateIndex = Math.floor((i - 1) / 4)
    const timeIndex = (i - 1) % 4
    knockoutMatches.push({
      id: `r32-${i}`,
      matchNumber: matchNumber++,
      matchday: 4,
      round: 'Round of 32',
      stage: 'r32',
      homeTeam: 'TBD',
      awayTeam: 'TBD',
      homeTeamName: `Winner Group ${String.fromCharCode(64 + ((i * 2 - 1 - 1) % 12 + 1))}`,
      awayTeamName: `Runner-up Group ${String.fromCharCode(64 + ((i * 2 - 1) % 12 + 1))}`,
      date: r32Dates[dateIndex],
      time: ['12:00', '15:00', '18:00', '21:00'][timeIndex],
      venue: ALL_VENUES[(i - 1) % ALL_VENUES.length].name,
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
    })
  }
  
  // Round of 16: 8 matches (Jun 27-30)
  const r16Dates = ['2026-06-27', '2026-06-28', '2026-06-29', '2026-06-30']
  for (let i = 1; i <= 8; i++) {
    knockoutMatches.push({
      id: `r16-${i}`,
      matchNumber: matchNumber++,
      matchday: 5,
      round: 'Round of 16',
      stage: 'r16',
      homeTeam: 'TBD',
      awayTeam: 'TBD',
      homeTeamName: `Winner R32-${i * 2 - 1}`,
      awayTeamName: `Winner R32-${i * 2}`,
      date: r16Dates[Math.floor((i - 1) / 2)],
      time: ['15:00', '18:00'][(i - 1) % 2],
      venue: ALL_VENUES[(i - 1) % 11].name,
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
    })
  }
  
  // Quarter-finals: 4 matches (Jul 3-4)
  const qfDates = ['2026-07-03', '2026-07-04']
  for (let i = 1; i <= 4; i++) {
    knockoutMatches.push({
      id: `qf-${i}`,
      matchNumber: matchNumber++,
      matchday: 6,
      round: 'Quarter-finals',
      stage: 'qf',
      homeTeam: 'TBD',
      awayTeam: 'TBD',
      homeTeamName: `Winner R16-${i * 2 - 1}`,
      awayTeamName: `Winner R16-${i * 2}`,
      date: qfDates[Math.floor((i - 1) / 2)],
      time: ['15:00', '21:00'][(i - 1) % 2],
      venue: ALL_VENUES[(i - 1) % 8].name,
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
    })
  }
  
  // Semi-finals: 2 matches (Jul 8-9)
  knockoutMatches.push({
    id: 'sf-1',
    matchNumber: matchNumber++,
    matchday: 7,
    round: 'Semi-finals',
    stage: 'sf',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    homeTeamName: 'Winner QF-1',
    awayTeamName: 'Winner QF-2',
    date: '2026-07-08',
    time: '18:00',
    venue: 'MetLife Stadium',
    city: 'New York/New Jersey',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  })
  
  knockoutMatches.push({
    id: 'sf-2',
    matchNumber: matchNumber++,
    matchday: 7,
    round: 'Semi-finals',
    stage: 'sf',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    homeTeamName: 'Winner QF-3',
    awayTeamName: 'Winner QF-4',
    date: '2026-07-09',
    time: '18:00',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  })
  
  // Third place play-off (Jul 18)
  knockoutMatches.push({
    id: 'third-place',
    matchNumber: matchNumber++,
    matchday: 8,
    round: 'Third Place',
    stage: 'third',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    homeTeamName: 'Loser SF-1',
    awayTeamName: 'Loser SF-2',
    date: '2026-07-18',
    time: '15:00',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  })
  
  // Final (Jul 19)
  knockoutMatches.push({
    id: 'final',
    matchNumber: matchNumber++,
    matchday: 8,
    round: 'Final',
    stage: 'final',
    homeTeam: 'TBD',
    awayTeam: 'TBD',
    homeTeamName: 'Winner SF-1',
    awayTeamName: 'Winner SF-2',
    date: '2026-07-19',
    time: '18:00',
    venue: 'MetLife Stadium',
    city: 'New York/New Jersey',
    status: 'scheduled',
    homeScore: null,
    awayScore: null,
  })
  
  return knockoutMatches
}

// Get all matches (group + knockout)
export function getAllMatches() {
  return [...generateGroupStageMatches(), ...generateKnockoutMatches()]
}

// Scoring rules
export const SCORING_RULES = {
  exactScore: 3,      // Predict exact score (e.g., 2-1 = 2-1)
  correctResult: 1,   // Correct winner/draw but wrong score
  
  // Knockout multipliers
  group: 1,
  r32: 1,
  r16: 1.5,
  qf: 2,
  sf: 2.5,
  final: 3,
  
  // Special picks
  champion: 10,
  runnerUp: 10,
  topScorer: 5,
  bestKeeper: 5,
}

// Helper to get all goalkeepers for best keeper pick
export function getAllGoalkeepers() {
  const goalkeepers = []
  
  for (const [teamCode, players] of Object.entries(WC2026_PLAYERS)) {
    const team = WC2026_TEAMS.find(t => t.code === teamCode)
    const gks = players.filter(p => p.position === 'GK')
    
    gks.forEach(gk => {
      goalkeepers.push({
        name: gk.name,
        team: team?.name || teamCode,
        teamCode,
        flag: team?.flag || '',
        number: gk.number,
      })
    })
  }
  
  return goalkeepers.sort((a, b) => a.name.localeCompare(b.name))
}

// Helper to get all forwards for top scorer pick
export function getAllForwards() {
  const forwards = []
  
  for (const [teamCode, players] of Object.entries(WC2026_PLAYERS)) {
    const team = WC2026_TEAMS.find(t => t.code === teamCode)
    const fwds = players.filter(p => p.position === 'FWD' || p.position === 'MID')
    
    fwds.forEach(fwd => {
      forwards.push({
        name: fwd.name,
        team: team?.name || teamCode,
        teamCode,
        flag: team?.flag || '',
        number: fwd.number,
        position: fwd.position,
      })
    })
  }
  
  return forwards.sort((a, b) => a.name.localeCompare(b.name))
}

// Special picks configuration
export const SPECIAL_PICKS = [
  {
    id: 'champion',
    name: 'Champion',
    description: 'Pick the team that wins the 2026 World Cup',
    points: SCORING_RULES.champion,
    type: 'team',
  },
  {
    id: 'runner_up',
    name: 'Runner-Up',
    description: 'Pick the team that finishes second',
    points: SCORING_RULES.runnerUp,
    type: 'team',
  },
  {
    id: 'top_scorer',
    name: 'Top Scorer (Golden Boot)',
    description: 'Pick the player who scores the most goals',
    points: SCORING_RULES.topScorer,
    type: 'player',
  },
  {
    id: 'best_keeper',
    name: 'Best Goalkeeper (Golden Glove)',
    description: 'Pick the best goalkeeper of the tournament',
    points: SCORING_RULES.bestKeeper,
    type: 'goalkeeper',
  },
]
