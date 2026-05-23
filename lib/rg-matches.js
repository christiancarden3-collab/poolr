// Roland Garros 2026 - Real Schedule
// Flag codes for countries
const FLAGS = {
  'Spain': 'es', 'Bosnia & Herzegovina': 'ba', 'Australia': 'au', 'Canada': 'ca',
  'Russia': 'ru', 'France': 'fr', 'Serbia': 'rs', 'Hungary': 'hu', 'Argentina': 'ar',
  'Czechia': 'cz', 'Portugal': 'pt', 'Belgium': 'be', 'Germany': 'de', 'USA': 'us',
  'Croatia': 'hr', 'Italy': 'it', 'Hong Kong': 'hk', 'Bolivia': 'bo', 'Brazil': 'br',
  'Chile': 'cl', 'Poland': 'pl', 'Kazakhstan': 'kz', 'Greece': 'gr', 'Austria': 'at',
  'United Kingdom': 'gb', 'Paraguay': 'py', 'Norway': 'no', 'China': 'cn',
  'Netherlands': 'nl', 'Peru': 'pe', 'Switzerland': 'ch', 'Monaco': 'mc',
}

const f = (country) => FLAGS[country] || 'xx'

// Day 1 - May 24, 2026 (sorted by time)
export const DAY1_MATCHES = [
  { id: 'rg1-1', p1: 'A. Davidovich Fokina', c1: 'Spain', p2: 'D. Džumhur', c2: 'Bosnia & Herzegovina', time: '05:00', date: 'May 24' },
  { id: 'rg1-2', p1: 'J. Duckworth', c1: 'Australia', p2: 'G. Diallo', c2: 'Canada', time: '05:00', date: 'May 24' },
  { id: 'rg1-3', p1: 'K. Khachanov', c1: 'Russia', p2: 'A. Gea', c2: 'France', time: '05:00', date: 'May 24' },
  { id: 'rg1-4', p1: 'M. Kecmanović', c1: 'Serbia', p2: 'F. Marozsán', c2: 'Hungary', time: '05:00', date: 'May 24' },
  { id: 'rg1-5', p1: 'P. Llamas Ruiz', c1: 'Spain', p2: 'T. Tirante', c2: 'Argentina', time: '05:00', date: 'May 24' },
  { id: 'rg1-6', p1: 'K. Jacquet', c1: 'France', p2: 'M. Trungelliti', c2: 'Argentina', time: '06:10', date: 'May 24' },
  { id: 'rg1-7', p1: 'T. Etcheverry', c1: 'Argentina', p2: 'N. Borges', c2: 'Portugal', time: '06:40', date: 'May 24' },
  { id: 'rg1-8', p1: 'T. Machač', c1: 'Czechia', p2: 'Z. Bergs', c2: 'Belgium', time: '06:40', date: 'May 24' },
  { id: 'rg1-9', p1: 'B. Bonzi', c1: 'France', p2: 'A. Zverev', c2: 'Germany', time: '07:10', date: 'May 24' },
  { id: 'rg1-10', p1: 'M. Zheng', c1: 'USA', p2: 'D. Prižmić', c2: 'Croatia', time: '07:20', date: 'May 24' },
  { id: 'rg1-11', p1: 'Q. Halys', c1: 'France', p2: 'M. Bellucci', c2: 'Italy', time: '07:20', date: 'May 24' },
  { id: 'rg1-12', p1: 'T. Droguet', c1: 'France', p2: 'J. Menšik', c2: 'Czechia', time: '07:20', date: 'May 24' },
  { id: 'rg1-13', p1: 'F. Cinà', c1: 'Italy', p2: 'R. Opelka', c2: 'USA', time: '07:50', date: 'May 24' },
  { id: 'rg1-14', p1: 'T. Fritz', c1: 'USA', p2: 'N. Basavareddy', c2: 'USA', time: '07:50', date: 'May 24' },
  { id: 'rg1-15', p1: 'A. Blockx', c1: 'Belgium', p2: 'C. Wong', c2: 'Hong Kong', time: '09:00', date: 'May 24' },
  { id: 'rg1-16', p1: 'H. Medjedović', c1: 'Serbia', p2: 'Y. Hanfmann', c2: 'Germany', time: '09:00', date: 'May 24' },
  { id: 'rg1-17', p1: 'H. Dellien', c1: 'Bolivia', p2: 'V. Royer', c2: 'France', time: '09:00', date: 'May 24' },
  { id: 'rg1-18', p1: 'J. Fonseca', c1: 'Brazil', p2: 'L. Pavlović', c2: 'France', time: '09:00', date: 'May 24' },
  { id: 'rg1-19', p1: 'L. Sonego', c1: 'Italy', p2: 'P. Herbert', c2: 'France', time: '09:00', date: 'May 24' },
  { id: 'rg1-20', p1: 'G. Mpetshi Perricard', c1: 'France', p2: 'N. Djokovic', c2: 'Serbia', time: '14:15', date: 'May 24' },
]

// Day 2 - May 25, 2026
export const DAY2_MATCHES = [
  { id: 'rg2-1', p1: 'A. Walton', c1: 'Australia', p2: 'D. Medvedev', c2: 'Russia', time: '05:00', date: 'May 25' },
  { id: 'rg2-2', p1: 'A. Tabilo', c1: 'Chile', p2: 'K. Majchrzak', c2: 'Poland', time: '05:00', date: 'May 25' },
  { id: 'rg2-3', p1: 'A. Kovacevic', c1: 'USA', p2: 'R. Jódar', c2: 'Spain', time: '05:00', date: 'May 25' },
  { id: 'rg2-4', p1: 'A. de Minaur', c1: 'Australia', p2: 'T. Samuel', c2: 'United Kingdom', time: '05:00', date: 'May 25' },
  { id: 'rg2-5', p1: 'A. Bublik', c1: 'Kazakhstan', p2: 'J. Struff', c2: 'Germany', time: '05:00', date: 'May 25' },
  { id: 'rg2-6', p1: 'A. Shevchenko', c1: 'Kazakhstan', p2: 'A. Michelsen', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-7', p1: 'A. Muller', c1: 'France', p2: 'S. Tsitsipas', c2: 'Greece', time: '05:00', date: 'May 25' },
  { id: 'rg2-8', p1: 'A. Popyrin', c1: 'Australia', p2: 'Z. Svajda', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-9', p1: 'A. Rinderknech', c1: 'France', p2: 'J. Rodionov', c2: 'Austria', time: '05:00', date: 'May 25' },
  { id: 'rg2-10', p1: 'C. Norrie', c1: 'United Kingdom', p2: 'A. Vallejo', c2: 'Paraguay', time: '05:00', date: 'May 25' },
  { id: 'rg2-11', p1: 'C. Ruud', c1: 'Norway', p2: 'R. Safiullin', c2: 'Russia', time: '05:00', date: 'May 25' },
  { id: 'rg2-12', p1: 'C. Garin', c1: 'Chile', p2: 'L. Tien', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-13', p1: 'D. Merida', c1: 'Spain', p2: 'B. Shelton', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-14', p1: 'E. Spizzirri', c1: 'USA', p2: 'F. Tiafoe', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-15', p1: 'E. Nava', c1: 'USA', p2: 'C. Ugo Carabelli', c2: 'Argentina', time: '05:00', date: 'May 25' },
  { id: 'rg2-16', p1: 'E. Quinn', c1: 'USA', p2: 'F. Comesaña', c2: 'Argentina', time: '05:00', date: 'May 25' },
  { id: 'rg2-17', p1: 'F. Diaz Acosta', c1: 'Argentina', p2: 'Z. Zhang', c2: 'China', time: '05:00', date: 'May 25' },
  { id: 'rg2-18', p1: 'F. Auger-Aliassime', c1: 'Canada', p2: 'D. Altmaier', c2: 'Germany', time: '05:00', date: 'May 25' },
  { id: 'rg2-19', p1: 'F. Cobolli', c1: 'Italy', p2: 'A. Pellegrino', c2: 'Italy', time: '05:00', date: 'May 25' },
  { id: 'rg2-20', p1: 'F. Cerundolo', c1: 'Argentina', p2: 'B. Van de Zandschulp', c2: 'Netherlands', time: '05:00', date: 'May 25' },
  { id: 'rg2-21', p1: 'H. Gaston', c1: 'France', p2: 'G. Monfils', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-22', p1: 'I. Buse', c1: 'Peru', p2: 'A. Rublev', c2: 'Russia', time: '05:00', date: 'May 25' },
  { id: 'rg2-23', p1: 'J. Fearnley', c1: 'United Kingdom', p2: 'J. Cerundolo', c2: 'Argentina', time: '05:00', date: 'May 25' },
  { id: 'rg2-24', p1: 'J. Faria', c1: 'Portugal', p2: 'D. Shapovalov', c2: 'Canada', time: '05:00', date: 'May 25' },
  { id: 'rg2-25', p1: 'J. Sinner', c1: 'Italy', p2: 'C. Tabur', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-26', p1: 'J. Munar', c1: 'Spain', p2: 'H. Hurkacz', c2: 'Poland', time: '05:00', date: 'May 25' },
  { id: 'rg2-27', p1: 'L. Van Assche', c1: 'France', p2: 'P. Kypson', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-28', p1: 'M. Navone', c1: 'Argentina', p2: 'J. Brooksby', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-29', p1: 'M. Čilić', c1: 'Croatia', p2: 'M. Kouame', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-30', p1: 'M. Landaluce', c1: 'Spain', p2: 'J. Prado Angelo', c2: 'Bolivia', time: '05:00', date: 'May 25' },
  { id: 'rg2-31', p1: 'M. Fucsovics', c1: 'Hungary', p2: 'M. Berrettini', c2: 'Italy', time: '05:00', date: 'May 25' },
  { id: 'rg2-32', p1: 'P. Carreño Busta', c1: 'Spain', p2: 'J. Lehečka', c2: 'Czechia', time: '05:00', date: 'May 25' },
  { id: 'rg2-33', p1: 'R. Collignon', c1: 'Belgium', p2: 'A. Vukić', c2: 'Australia', time: '05:00', date: 'May 25' },
  { id: 'rg2-34', p1: 'R. Hijikata', c1: 'Australia', p2: 'T. Paul', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-35', p1: 'R. Bautista Agut', c1: 'Spain', p2: 'B. Nakashima', c2: 'USA', time: '05:00', date: 'May 25' },
  { id: 'rg2-36', p1: 'S. Ofner', c1: 'Austria', p2: 'L. Darderi', c2: 'Italy', time: '05:00', date: 'May 25' },
  { id: 'rg2-37', p1: 'S. Báez', c1: 'Argentina', p2: 'R. Burruchaga', c2: 'Argentina', time: '05:00', date: 'May 25' },
  { id: 'rg2-38', p1: 'S. Wawrinka', c1: 'Switzerland', p2: 'A. Fils', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-39', p1: 'T. Griekspoor', c1: 'Netherlands', p2: 'M. Arnaldi', c2: 'Italy', time: '05:00', date: 'May 25' },
  { id: 'rg2-40', p1: 'T. Kokkinakis', c1: 'Australia', p2: 'T. Atmane', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-41', p1: 'T. Faurel', c1: 'France', p2: 'V. Vacherot', c2: 'Monaco', time: '05:00', date: 'May 25' },
  { id: 'rg2-42', p1: 'U. Humbert', c1: 'France', p2: 'A. Mannarino', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-43', p1: 'V. Kopřiva', c1: 'Czechia', p2: 'C. Moutet', c2: 'France', time: '05:00', date: 'May 25' },
  { id: 'rg2-44', p1: 'Y. Wu', c1: 'China', p2: 'M. Giron', c2: 'USA', time: '05:00', date: 'May 25' },
]

// Get flag code
export const getFlag = (country) => FLAGS[country] || 'xx'

// All matches by day
export const RG_SCHEDULE = {
  1: DAY1_MATCHES,
  2: DAY2_MATCHES,
  // Later rounds TBD
  3: [], // R3
  4: [], // R16
  5: [], // QF
  6: [], // SF
  7: [], // Final
}
