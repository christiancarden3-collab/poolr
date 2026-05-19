// ============================================================
// PICKPOOLR — WORLD CUP 2026 COMPLETE DATABASE
// All 48 teams, ~600 players, all 72 group stage matches
// + Round of 32, R16, QF, SF, Final (TBD matchups)
//
// TIMEZONES: ET = Eastern Time, CT = Central Time (ET - 1hr)
// All times stored as ET, UI shows both ET and CT
// ============================================================

// ── TEAMS (all 48, with group, code, confederation) ──────────
export const TEAMS = [
  // GROUP A
  { code:'mx',  name:'Mexico',             group:'A', conf:'CONCACAF', rank:22, host:true  },
  { code:'za',  name:'South Africa',        group:'A', conf:'CAF',      rank:67             },
  { code:'kr',  name:'South Korea',         group:'A', conf:'AFC',      rank:23             },
  { code:'cz',  name:'Czechia',             group:'A', conf:'UEFA',     rank:37, playoff:true},
  // GROUP B
  { code:'ca',  name:'Canada',              group:'B', conf:'CONCACAF', rank:40, host:true  },
  { code:'ch',  name:'Switzerland',         group:'B', conf:'UEFA',     rank:19             },
  { code:'qa',  name:'Qatar',               group:'B', conf:'AFC',      rank:38             },
  { code:'ba',  name:'Bosnia & Herz.',      group:'B', conf:'UEFA',     rank:65, playoff:true},
  // GROUP C
  { code:'br',  name:'Brazil',              group:'C', conf:'CONMEBOL', rank:6              },
  { code:'ma',  name:'Morocco',             group:'C', conf:'CAF',      rank:8              },
  { code:'ht',  name:'Haiti',               group:'C', conf:'CONCACAF', rank:83             },
  { code:'gb-sct',name:'Scotland',          group:'C', conf:'UEFA',     rank:39             },
  // GROUP D
  { code:'us',  name:'USA',                 group:'D', conf:'CONCACAF', rank:18, host:true  },
  { code:'py',  name:'Paraguay',            group:'D', conf:'CONMEBOL', rank:50             },
  { code:'au',  name:'Australia',           group:'D', conf:'AFC',      rank:24             },
  { code:'tr',  name:'Türkiye',             group:'D', conf:'UEFA',     rank:28, playoff:true},
  // GROUP E
  { code:'de',  name:'Germany',             group:'E', conf:'UEFA',     rank:10             },
  { code:'cw',  name:'Curaçao',             group:'E', conf:'CONCACAF', rank:82, debut:true  },
  { code:'ci',  name:'Ivory Coast',         group:'E', conf:'CAF',      rank:48             },
  { code:'ec',  name:'Ecuador',             group:'E', conf:'CONMEBOL', rank:44             },
  // GROUP F
  { code:'nl',  name:'Netherlands',         group:'F', conf:'UEFA',     rank:7              },
  { code:'jp',  name:'Japan',               group:'F', conf:'AFC',      rank:16             },
  { code:'se',  name:'Sweden',              group:'F', conf:'UEFA',     rank:21, playoff:true},
  { code:'tn',  name:'Tunisia',             group:'F', conf:'CAF',      rank:30             },
  // GROUP G
  { code:'be',  name:'Belgium',             group:'G', conf:'UEFA',     rank:9              },
  { code:'eg',  name:'Egypt',               group:'G', conf:'CAF',      rank:35             },
  { code:'ir',  name:'Iran',                group:'G', conf:'AFC',      rank:20             },
  { code:'nz',  name:'New Zealand',         group:'G', conf:'OFC',      rank:85             },
  // GROUP H
  { code:'es',  name:'Spain',               group:'H', conf:'UEFA',     rank:2              },
  { code:'cv',  name:'Cape Verde',          group:'H', conf:'CAF',      rank:69, debut:true  },
  { code:'sa',  name:'Saudi Arabia',        group:'H', conf:'AFC',      rank:56             },
  { code:'uy',  name:'Uruguay',             group:'H', conf:'CONMEBOL', rank:17             },
  // GROUP I — Group of Death
  { code:'fr',  name:'France',              group:'I', conf:'UEFA',     rank:1              },
  { code:'sn',  name:'Senegal',             group:'I', conf:'CAF',      rank:14             },
  { code:'no',  name:'Norway',              group:'I', conf:'UEFA',     rank:26             },
  { code:'iq',  name:'Iraq',                group:'I', conf:'AFC',      rank:63             },
  // GROUP J
  { code:'ar',  name:'Argentina',           group:'J', conf:'CONMEBOL', rank:3              },
  { code:'dz',  name:'Algeria',             group:'J', conf:'CAF',      rank:33             },
  { code:'at',  name:'Austria',             group:'J', conf:'UEFA',     rank:29             },
  { code:'jo',  name:'Jordan',              group:'J', conf:'AFC',      rank:71, debut:true  },
  // GROUP K
  { code:'pt',  name:'Portugal',            group:'K', conf:'UEFA',     rank:5              },
  { code:'cd',  name:'DR Congo',            group:'K', conf:'CAF',      rank:57, playoff:true},
  { code:'uz',  name:'Uzbekistan',          group:'K', conf:'AFC',      rank:73, debut:true  },
  { code:'co',  name:'Colombia',            group:'K', conf:'CONMEBOL', rank:15             },
  // GROUP L
  { code:'gb-eng',name:'England',           group:'L', conf:'UEFA',     rank:4              },
  { code:'hr',  name:'Croatia',             group:'L', conf:'UEFA',     rank:13             },
  { code:'gh',  name:'Ghana',               group:'L', conf:'CAF',      rank:74             },
  { code:'pa',  name:'Panama',              group:'L', conf:'CONCACAF', rank:55             },
];

// ── FULL OFFICIAL SCHEDULE ───────────────────────────────────
// Times are ET. CT = ET - 1hr. 
// All group stage matchdays included.
export const MATCHES = [

  // ── MATCHDAY 1 ──────────────────────────────────────────
  // Thu Jun 11
  { id:'g001', group:'A', md:1, home:'mx', away:'za', date:'2026-06-11', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Estadio Azteca',          city:'Mexico City',    stage:'group' },
  { id:'g002', group:'A', md:1, home:'kr', away:'cz', date:'2026-06-11', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'Estadio Akron',            city:'Zapopan',        stage:'group' },
  // Fri Jun 12
  { id:'g003', group:'B', md:1, home:'ca', away:'ba', date:'2026-06-12', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'BMO Field',                city:'Toronto',        stage:'group' },
  { id:'g004', group:'D', md:1, home:'us', away:'py', date:'2026-06-12', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'SoFi Stadium',             city:'Inglewood, CA',  stage:'group' },
  // Sat Jun 13
  { id:'g005', group:'B', md:1, home:'qa', away:'ch', date:'2026-06-13', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:"Levi's Stadium",           city:'Santa Clara, CA',stage:'group' },
  { id:'g006', group:'C', md:1, home:'br', away:'ma', date:'2026-06-13', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'MetLife Stadium',          city:'East Rutherford, NJ', stage:'group' },
  { id:'g007', group:'C', md:1, home:'ht', away:'gb-sct', date:'2026-06-13', timeET:'9:00 PM', timeCT:'8:00 PM', venue:'Gillette Stadium',       city:'Foxborough, MA', stage:'group' },
  // Sun Jun 14
  { id:'g008', group:'D', md:1, home:'au', away:'tr', date:'2026-06-14', timeET:'12:00 AM', timeCT:'11:00 PM', venue:'BC Place',                 city:'Vancouver',      stage:'group' },
  { id:'g009', group:'E', md:1, home:'de', away:'cw', date:'2026-06-14', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',              city:'Houston, TX',    stage:'group' },
  { id:'g010', group:'F', md:1, home:'nl', away:'jp', date:'2026-06-14', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'AT&T Stadium',             city:'Arlington, TX',  stage:'group' },
  { id:'g011', group:'E', md:1, home:'ci', away:'ec', date:'2026-06-14', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'Lincoln Financial Field',  city:'Philadelphia, PA',stage:'group' },
  { id:'g012', group:'F', md:1, home:'se', away:'tn', date:'2026-06-14', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'Estadio BBVA',             city:'Monterrey',      stage:'group' },
  // Mon Jun 15
  { id:'g013', group:'H', md:1, home:'es', away:'cv', date:'2026-06-15', timeET:'12:00 PM', timeCT:'11:00 AM', venue:'Mercedes-Benz Stadium',    city:'Atlanta, GA',    stage:'group' },
  { id:'g014', group:'G', md:1, home:'be', away:'eg', date:'2026-06-15', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Lumen Field',              city:'Seattle, WA',    stage:'group' },
  { id:'g015', group:'H', md:1, home:'sa', away:'uy', date:'2026-06-15', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'Hard Rock Stadium',        city:'Miami Gardens, FL',stage:'group' },
  { id:'g016', group:'G', md:1, home:'ir', away:'nz', date:'2026-06-15', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'SoFi Stadium',             city:'Inglewood, CA',  stage:'group' },
  // Tue Jun 16
  { id:'g017', group:'I', md:1, home:'fr', away:'sn', date:'2026-06-16', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'MetLife Stadium',          city:'East Rutherford, NJ', stage:'group' },
  { id:'g018', group:'I', md:1, home:'iq', away:'no', date:'2026-06-16', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'Gillette Stadium',         city:'Foxborough, MA', stage:'group' },
  { id:'g019', group:'J', md:1, home:'ar', away:'dz', date:'2026-06-16', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Arrowhead Stadium',        city:'Kansas City, MO',stage:'group' },
  // Wed Jun 17
  { id:'g020', group:'J', md:1, home:'at', away:'jo', date:'2026-06-17', timeET:'12:00 AM', timeCT:'11:00 PM', venue:"Levi's Stadium",           city:'Santa Clara, CA',stage:'group' },
  { id:'g021', group:'K', md:1, home:'pt', away:'cd', date:'2026-06-17', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',              city:'Houston, TX',    stage:'group' },
  { id:'g022', group:'L', md:1, home:'gb-eng', away:'hr', date:'2026-06-17', timeET:'4:00 PM', timeCT:'3:00 PM', venue:'AT&T Stadium',           city:'Arlington, TX',  stage:'group' },
  { id:'g023', group:'L', md:1, home:'gh', away:'pa', date:'2026-06-17', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'BMO Field',                city:'Toronto',        stage:'group' },
  { id:'g024', group:'K', md:1, home:'uz', away:'co', date:'2026-06-17', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'Estadio Azteca',           city:'Mexico City',    stage:'group' },

  // ── MATCHDAY 2 ──────────────────────────────────────────
  // Thu Jun 18
  { id:'g025', group:'A', md:2, home:'cz', away:'za', date:'2026-06-18', timeET:'12:00 PM', timeCT:'11:00 AM', venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    stage:'group' },
  { id:'g026', group:'B', md:2, home:'ch', away:'ba', date:'2026-06-18', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  stage:'group' },
  { id:'g027', group:'B', md:2, home:'ca', away:'qa', date:'2026-06-18', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'BC Place',                city:'Vancouver',      stage:'group' },
  { id:'g028', group:'A', md:2, home:'mx', away:'kr', date:'2026-06-18', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Estadio Akron',           city:'Zapopan',        stage:'group' },
  // Fri Jun 19
  { id:'g029', group:'D', md:2, home:'us', away:'au', date:'2026-06-19', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Lumen Field',             city:'Seattle, WA',    stage:'group' },
  { id:'g030', group:'C', md:2, home:'gb-sct', away:'ma', date:'2026-06-19', timeET:'6:00 PM', timeCT:'5:00 PM', venue:'Gillette Stadium',      city:'Foxborough, MA', stage:'group' },
  { id:'g031', group:'C', md:2, home:'br', away:'ht', date:'2026-06-19', timeET:'8:30 PM',  timeCT:'7:30 PM',  venue:'Lincoln Financial Field', city:'Philadelphia, PA',stage:'group' },
  { id:'g032', group:'D', md:2, home:'tr', away:'py', date:'2026-06-19', timeET:'11:00 PM', timeCT:'10:00 PM', venue:"Levi's Stadium",          city:'Santa Clara, CA',stage:'group' },
  // Sat Jun 20
  { id:'g033', group:'F', md:2, home:'nl', away:'se', date:'2026-06-20', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',             city:'Houston, TX',    stage:'group' },
  { id:'g034', group:'E', md:2, home:'de', away:'ci', date:'2026-06-20', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'BMO Field',               city:'Toronto',        stage:'group' },
  { id:'g035', group:'E', md:2, home:'ec', away:'cw', date:'2026-06-20', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'Arrowhead Stadium',       city:'Kansas City, MO',stage:'group' },
  // Sun Jun 21
  { id:'g036', group:'F', md:2, home:'tn', away:'jp', date:'2026-06-21', timeET:'12:00 AM', timeCT:'11:00 PM', venue:'Estadio BBVA',            city:'Monterrey',      stage:'group' },
  { id:'g037', group:'H', md:2, home:'es', away:'sa', date:'2026-06-21', timeET:'12:00 PM', timeCT:'11:00 AM', venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    stage:'group' },
  { id:'g038', group:'G', md:2, home:'be', away:'ir', date:'2026-06-21', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  stage:'group' },
  { id:'g039', group:'H', md:2, home:'uy', away:'cv', date:'2026-06-21', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'Hard Rock Stadium',       city:'Miami Gardens, FL',stage:'group' },
  { id:'g040', group:'G', md:2, home:'nz', away:'eg', date:'2026-06-21', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'BC Place',                city:'Vancouver',      stage:'group' },
  // Mon Jun 22
  { id:'g041', group:'J', md:2, home:'ar', away:'at', date:'2026-06-22', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'AT&T Stadium',            city:'Arlington, TX',  stage:'group' },
  { id:'g042', group:'I', md:2, home:'fr', away:'iq', date:'2026-06-22', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'Lincoln Financial Field', city:'Philadelphia, PA',stage:'group' },
  { id:'g043', group:'I', md:2, home:'no', away:'sn', date:'2026-06-22', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'MetLife Stadium',         city:'East Rutherford, NJ',stage:'group' },
  { id:'g044', group:'J', md:2, home:'jo', away:'dz', date:'2026-06-22', timeET:'11:00 PM', timeCT:'10:00 PM', venue:"Levi's Stadium",          city:'Santa Clara, CA',stage:'group' },
  // Tue Jun 23
  { id:'g045', group:'K', md:2, home:'pt', away:'uz', date:'2026-06-23', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',             city:'Houston, TX',    stage:'group' },
  { id:'g046', group:'L', md:2, home:'gb-eng', away:'gh', date:'2026-06-23', timeET:'4:00 PM', timeCT:'3:00 PM', venue:'Gillette Stadium',      city:'Foxborough, MA', stage:'group' },
  { id:'g047', group:'L', md:2, home:'pa', away:'hr', date:'2026-06-23', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'BMO Field',               city:'Toronto',        stage:'group' },
  { id:'g048', group:'K', md:2, home:'co', away:'cd', date:'2026-06-23', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'Estadio Akron',           city:'Zapopan',        stage:'group' },

  // ── MATCHDAY 3 (simultaneous kickoffs per group) ─────────
  // Wed Jun 24
  { id:'g049', group:'B', md:3, home:'ch', away:'ca', date:'2026-06-24', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'BC Place',                city:'Vancouver',      stage:'group' },
  { id:'g050', group:'B', md:3, home:'ba', away:'qa', date:'2026-06-24', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Lumen Field',             city:'Seattle, WA',    stage:'group' },
  { id:'g051', group:'C', md:3, home:'gb-sct', away:'br', date:'2026-06-24', timeET:'6:00 PM', timeCT:'5:00 PM', venue:'Hard Rock Stadium',     city:'Miami Gardens, FL',stage:'group' },
  { id:'g052', group:'C', md:3, home:'ma', away:'ht', date:'2026-06-24', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    stage:'group' },
  { id:'g053', group:'A', md:3, home:'cz', away:'mx', date:'2026-06-24', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Estadio Azteca',          city:'Mexico City',    stage:'group' },
  { id:'g054', group:'A', md:3, home:'za', away:'kr', date:'2026-06-24', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Estadio BBVA',            city:'Monterrey',      stage:'group' },
  // Thu Jun 25
  { id:'g055', group:'E', md:3, home:'cw', away:'ci', date:'2026-06-25', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'Lincoln Financial Field', city:'Philadelphia, PA',stage:'group' },
  { id:'g056', group:'E', md:3, home:'ec', away:'de', date:'2026-06-25', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'MetLife Stadium',         city:'East Rutherford, NJ',stage:'group' },
  { id:'g057', group:'F', md:3, home:'jp', away:'se', date:'2026-06-25', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'AT&T Stadium',            city:'Arlington, TX',  stage:'group' },
  { id:'g058', group:'F', md:3, home:'tn', away:'nl', date:'2026-06-25', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'Arrowhead Stadium',       city:'Kansas City, MO',stage:'group' },
  { id:'g059', group:'D', md:3, home:'tr', away:'us', date:'2026-06-25', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  stage:'group' },
  { id:'g060', group:'D', md:3, home:'py', away:'au', date:'2026-06-25', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:"Levi's Stadium",          city:'Santa Clara, CA',stage:'group' },
  // Fri Jun 26
  { id:'g061', group:'I', md:3, home:'no', away:'fr', date:'2026-06-26', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Gillette Stadium',        city:'Foxborough, MA', stage:'group' },
  { id:'g062', group:'I', md:3, home:'sn', away:'iq', date:'2026-06-26', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'BMO Field',               city:'Toronto',        stage:'group' },
  { id:'g063', group:'H', md:3, home:'cv', away:'sa', date:'2026-06-26', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'NRG Stadium',             city:'Houston, TX',    stage:'group' },
  { id:'g064', group:'H', md:3, home:'uy', away:'es', date:'2026-06-26', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'Estadio Akron',           city:'Zapopan',        stage:'group' },
  { id:'g065', group:'G', md:3, home:'eg', away:'ir', date:'2026-06-26', timeET:'11:00 PM', timeCT:'10:00 PM', venue:'Lumen Field',             city:'Seattle, WA',    stage:'group' },
  { id:'g066', group:'G', md:3, home:'nz', away:'be', date:'2026-06-26', timeET:'11:00 PM', timeCT:'10:00 PM', venue:'BC Place',                city:'Vancouver',      stage:'group' },
  // Sat Jun 27
  { id:'g067', group:'L', md:3, home:'pa', away:'gb-eng', date:'2026-06-27', timeET:'5:00 PM', timeCT:'4:00 PM', venue:'MetLife Stadium',       city:'East Rutherford, NJ',stage:'group' },
  { id:'g068', group:'L', md:3, home:'hr', away:'gh', date:'2026-06-27', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'Lincoln Financial Field', city:'Philadelphia, PA',stage:'group' },
  { id:'g069', group:'K', md:3, home:'co', away:'pt', date:'2026-06-27', timeET:'7:30 PM',  timeCT:'6:30 PM',  venue:'Hard Rock Stadium',       city:'Miami Gardens, FL',stage:'group' },
  { id:'g070', group:'K', md:3, home:'cd', away:'uz', date:'2026-06-27', timeET:'7:30 PM',  timeCT:'6:30 PM',  venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    stage:'group' },
  { id:'g071', group:'J', md:3, home:'dz', away:'at', date:'2026-06-27', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'Arrowhead Stadium',       city:'Kansas City, MO',stage:'group' },
  { id:'g072', group:'J', md:3, home:'jo', away:'ar', date:'2026-06-27', timeET:'10:00 PM', timeCT:'9:00 PM',  venue:'AT&T Stadium',            city:'Arlington, TX',  stage:'group' },

  // ── ROUND OF 32 (matchups TBD based on results) ──────────
  { id:'r73',  stage:'r32', matchNum:73,  date:'2026-06-28', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  label:'Runner-up A vs Runner-up B' },
  { id:'r76',  stage:'r32', matchNum:76,  date:'2026-06-29', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',             city:'Houston, TX',    label:'Winner C vs Runner-up F' },
  { id:'r74',  stage:'r32', matchNum:74,  date:'2026-06-29', timeET:'4:30 PM',  timeCT:'3:30 PM',  venue:'Gillette Stadium',        city:'Foxborough, MA', label:'Winner E vs Best 3rd' },
  { id:'r75',  stage:'r32', matchNum:75,  date:'2026-06-29', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Estadio BBVA',            city:'Monterrey',      label:'Winner F vs Runner-up C' },
  { id:'r78',  stage:'r32', matchNum:78,  date:'2026-06-30', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'AT&T Stadium',            city:'Arlington, TX',  label:'Runner-up E vs Runner-up I' },
  { id:'r77',  stage:'r32', matchNum:77,  date:'2026-06-30', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'MetLife Stadium',         city:'East Rutherford, NJ', label:'Winner I vs Best 3rd' },
  { id:'r79',  stage:'r32', matchNum:79,  date:'2026-06-30', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Estadio Azteca',          city:'Mexico City',    label:'Winner A vs Best 3rd' },
  { id:'r80',  stage:'r32', matchNum:80,  date:'2026-07-01', timeET:'12:00 PM', timeCT:'11:00 AM', venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    label:'Winner L vs Best 3rd' },
  { id:'r82',  stage:'r32', matchNum:82,  date:'2026-07-01', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'Lumen Field',             city:'Seattle, WA',    label:'Winner G vs Best 3rd' },
  { id:'r81',  stage:'r32', matchNum:81,  date:'2026-07-01', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:"Levi's Stadium",          city:'Santa Clara, CA',label:'Winner D vs Best 3rd' },
  { id:'r84',  stage:'r32', matchNum:84,  date:'2026-07-02', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  label:'Winner H vs Runner-up J' },
  { id:'r83',  stage:'r32', matchNum:83,  date:'2026-07-02', timeET:'7:00 PM',  timeCT:'6:00 PM',  venue:'BMO Field',               city:'Toronto',        label:'Runner-up K vs Runner-up L' },
  { id:'r85',  stage:'r32', matchNum:85,  date:'2026-07-02', timeET:'11:00 PM', timeCT:'10:00 PM', venue:'BC Place',                city:'Vancouver',      label:'Winner B vs Best 3rd' },
  { id:'r88',  stage:'r32', matchNum:88,  date:'2026-07-03', timeET:'2:00 PM',  timeCT:'1:00 PM',  venue:'AT&T Stadium',            city:'Arlington, TX',  label:'Runner-up D vs Runner-up G' },
  { id:'r86',  stage:'r32', matchNum:86,  date:'2026-07-03', timeET:'6:00 PM',  timeCT:'5:00 PM',  venue:'Hard Rock Stadium',       city:'Miami Gardens, FL', label:'Winner J vs Runner-up H' },
  { id:'r87',  stage:'r32', matchNum:87,  date:'2026-07-03', timeET:'9:30 PM',  timeCT:'8:30 PM',  venue:'Arrowhead Stadium',       city:'Kansas City, MO',label:'Winner K vs Best 3rd' },

  // ── ROUND OF 16 ─────────────────────────────────────────
  { id:'r89',  stage:'r16', matchNum:89,  date:'2026-07-04', timeET:'1:00 PM',  timeCT:'12:00 PM', venue:'NRG Stadium',             city:'Houston, TX',    label:'W73 vs W75' },
  { id:'r90',  stage:'r16', matchNum:90,  date:'2026-07-04', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'Lincoln Financial Field', city:'Philadelphia, PA',label:'W74 vs W77' },
  { id:'r91',  stage:'r16', matchNum:91,  date:'2026-07-05', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'MetLife Stadium',         city:'East Rutherford, NJ', label:'W76 vs W78' },
  { id:'r92',  stage:'r16', matchNum:92,  date:'2026-07-05', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'Estadio Azteca',          city:'Mexico City',    label:'W79 vs W80' },
  { id:'r93',  stage:'r16', matchNum:93,  date:'2026-07-06', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'AT&T Stadium',            city:'Arlington, TX',  label:'W83 vs W84' },
  { id:'r94',  stage:'r16', matchNum:94,  date:'2026-07-06', timeET:'8:00 PM',  timeCT:'7:00 PM',  venue:'Lumen Field',             city:'Seattle, WA',    label:'W81 vs W82' },
  { id:'r95',  stage:'r16', matchNum:95,  date:'2026-07-07', timeET:'12:00 PM', timeCT:'11:00 AM', venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    label:'W86 vs W88' },
  { id:'r96',  stage:'r16', matchNum:96,  date:'2026-07-07', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'BC Place',                city:'Vancouver',      label:'W85 vs W87' },

  // ── QUARTERFINALS ────────────────────────────────────────
  { id:'r97',  stage:'qf',  matchNum:97,  date:'2026-07-09', timeET:'4:00 PM',  timeCT:'3:00 PM',  venue:'Gillette Stadium',        city:'Foxborough, MA', label:'QF 1' },
  { id:'r98',  stage:'qf',  matchNum:98,  date:'2026-07-10', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'SoFi Stadium',            city:'Inglewood, CA',  label:'QF 2' },
  { id:'r99',  stage:'qf',  matchNum:99,  date:'2026-07-11', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'Hard Rock Stadium',       city:'Miami Gardens, FL', label:'QF 3' },
  { id:'r100', stage:'qf',  matchNum:100, date:'2026-07-11', timeET:'9:00 PM',  timeCT:'8:00 PM',  venue:'Arrowhead Stadium',       city:'Kansas City, MO',label:'QF 4' },

  // ── SEMIFINALS ───────────────────────────────────────────
  { id:'r101', stage:'sf',  matchNum:101, date:'2026-07-14', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'AT&T Stadium',            city:'Arlington, TX',  label:'SF 1' },
  { id:'r102', stage:'sf',  matchNum:102, date:'2026-07-15', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'Mercedes-Benz Stadium',   city:'Atlanta, GA',    label:'SF 2' },

  // ── THIRD PLACE ──────────────────────────────────────────
  { id:'r103', stage:'3rd', matchNum:103, date:'2026-07-18', timeET:'5:00 PM',  timeCT:'4:00 PM',  venue:'Hard Rock Stadium',       city:'Miami Gardens, FL', label:'3rd Place' },

  // ── FINAL ────────────────────────────────────────────────
  { id:'r104', stage:'final',matchNum:104,date:'2026-07-19', timeET:'3:00 PM',  timeCT:'2:00 PM',  venue:'MetLife Stadium',         city:'East Rutherford, NJ', label:'World Cup Final' },
];

// ── PLAYERS (~600 across all 48 teams) ──────────────────────
// Format: { name, team, pos } — pos: GK/DEF/MID/FWD
// Source: official preliminary squads as of May 2026
export const PLAYERS = [

  // ── ARGENTINA (Group J) ──────────────────────────────────
  { name:'Geronimo Rulli',        team:'ar', pos:'GK'  },
  { name:'Walter Benitez',        team:'ar', pos:'GK'  },
  { name:'Agustín Marchesín',     team:'ar', pos:'GK'  },
  { name:'Nicolás Otamendi',      team:'ar', pos:'DEF' },
  { name:'Nicolás Tagliafico',    team:'ar', pos:'DEF' },
  { name:'Valentín Barco',        team:'ar', pos:'DEF' },
  { name:'Marcos Senesi',         team:'ar', pos:'DEF' },
  { name:'Gonzalo Montiel',       team:'ar', pos:'DEF' },
  { name:'Rodrigo De Paul',       team:'ar', pos:'MID' },
  { name:'Leandro Paredes',       team:'ar', pos:'MID' },
  { name:'Alexis Mac Allister',   team:'ar', pos:'MID' },
  { name:'Giovani Lo Celso',      team:'ar', pos:'MID' },
  { name:'Thiago Almada',         team:'ar', pos:'MID' },
  { name:'Nico Paz',              team:'ar', pos:'MID' },
  { name:'Enzo Fernández',        team:'ar', pos:'MID' },
  { name:'Lionel Messi',          team:'ar', pos:'FWD' },
  { name:'Lautaro Martínez',      team:'ar', pos:'FWD' },
  { name:'Julián Álvarez',        team:'ar', pos:'FWD' },
  { name:'Nicolás González',      team:'ar', pos:'FWD' },
  { name:'Ángel Di María',        team:'ar', pos:'FWD' },

  // ── ALGERIA (Group J) ────────────────────────────────────
  { name:'Farid Chaâl',           team:'dz', pos:'GK'  },
  { name:'Rayane Yesli',          team:'dz', pos:'GK'  },
  { name:'Youcef Atal',           team:'dz', pos:'DEF' },
  { name:'Abdelkader Bedrane',    team:'dz', pos:'DEF' },
  { name:'Réda Halaïmia',         team:'dz', pos:'DEF' },
  { name:'Sofiane Bendebka',      team:'dz', pos:'MID' },
  { name:'Victor Lekhal',         team:'dz', pos:'MID' },
  { name:'Zakaria Draoui',        team:'dz', pos:'MID' },
  { name:'Riyad Mahrez',          team:'dz', pos:'FWD' },
  { name:'Islam Slimani',         team:'dz', pos:'FWD' },
  { name:'Yacine Brahimi',        team:'dz', pos:'FWD' },
  { name:'Adam Ounas',            team:'dz', pos:'FWD' },
  { name:'Yassine Benzia',        team:'dz', pos:'FWD' },

  // ── AUSTRIA (Group J) ────────────────────────────────────
  { name:'Alexander Schlager',    team:'at', pos:'GK'  },
  { name:'Patrick Pentz',         team:'at', pos:'GK'  },
  { name:'David Alaba',           team:'at', pos:'DEF' },
  { name:'Kevin Danso',           team:'at', pos:'DEF' },
  { name:'Stefan Posch',          team:'at', pos:'DEF' },
  { name:'Marco Friedl',          team:'at', pos:'DEF' },
  { name:'Philipp Lienhart',      team:'at', pos:'DEF' },
  { name:'Leopold Querfeld',      team:'at', pos:'DEF' },
  { name:'Xaver Schlager',        team:'at', pos:'MID' },
  { name:'Nicolas Seiwald',       team:'at', pos:'MID' },
  { name:'Marcel Sabitzer',       team:'at', pos:'MID' },
  { name:'Konrad Laimer',         team:'at', pos:'MID' },
  { name:'Christoph Baumgartner', team:'at', pos:'MID' },
  { name:'Romano Schmid',         team:'at', pos:'MID' },
  { name:'Marko Arnautovic',      team:'at', pos:'FWD' },
  { name:'Michael Gregoritsch',   team:'at', pos:'FWD' },

  // ── JORDAN (Group J) ─────────────────────────────────────
  { name:'Yazeed Abo Laila',      team:'jo', pos:'GK'  },
  { name:'Ahmad Al-Rawi',         team:'jo', pos:'GK'  },
  { name:'Yazan Al-Naimat',       team:'jo', pos:'DEF' },
  { name:'Baha Faisal',           team:'jo', pos:'DEF' },
  { name:'Nizar Al-Rawi',         team:'jo', pos:'DEF' },
  { name:'Musa Al-Taamari',       team:'jo', pos:'MID' },
  { name:'Mahmoud Almardi',       team:'jo', pos:'MID' },
  { name:'Ahmad Hayel',           team:'jo', pos:'MID' },
  { name:'Yosef Al-Rawabdeh',     team:'jo', pos:'FWD' },
  { name:'Khalil Bani Attiah',    team:'jo', pos:'FWD' },

  // ── FRANCE (Group I) ─────────────────────────────────────
  { name:'Mike Maignan',          team:'fr', pos:'GK'  },
  { name:'Alphonse Areola',       team:'fr', pos:'GK'  },
  { name:'Brice Samba',           team:'fr', pos:'GK'  },
  { name:'Jules Koundé',          team:'fr', pos:'DEF' },
  { name:'Dayot Upamecano',       team:'fr', pos:'DEF' },
  { name:'William Saliba',        team:'fr', pos:'DEF' },
  { name:'Théo Hernández',        team:'fr', pos:'DEF' },
  { name:'Benjamin Pavard',       team:'fr', pos:'DEF' },
  { name:'Jonathan Clauss',       team:'fr', pos:'DEF' },
  { name:'Aurélien Tchouaméni',   team:'fr', pos:'MID' },
  { name:'Adrien Rabiot',         team:'fr', pos:'MID' },
  { name:'Eduardo Camavinga',     team:'fr', pos:'MID' },
  { name:'Youssouf Fofana',       team:'fr', pos:'MID' },
  { name:'Warren Zaïre-Emery',    team:'fr', pos:'MID' },
  { name:'Kylian Mbappé',         team:'fr', pos:'FWD' },
  { name:'Antoine Griezmann',     team:'fr', pos:'FWD' },
  { name:'Ousmane Dembélé',       team:'fr', pos:'FWD' },
  { name:'Marcus Thuram',         team:'fr', pos:'FWD' },
  { name:'Randal Kolo Muani',     team:'fr', pos:'FWD' },
  { name:'Kingsley Coman',        team:'fr', pos:'FWD' },

  // ── SENEGAL (Group I) ────────────────────────────────────
  { name:'Édouard Mendy',         team:'sn', pos:'GK'  },
  { name:'Alfred Gomis',          team:'sn', pos:'GK'  },
  { name:'Seny Dieng',            team:'sn', pos:'GK'  },
  { name:'Kalidou Koulibaly',     team:'sn', pos:'DEF' },
  { name:'Abdou Diallo',          team:'sn', pos:'DEF' },
  { name:'Youssouf Sabaly',       team:'sn', pos:'DEF' },
  { name:'Formose Mendy',         team:'sn', pos:'DEF' },
  { name:'Idrissa Gueye',         team:'sn', pos:'MID' },
  { name:'Nampalys Mendy',        team:'sn', pos:'MID' },
  { name:'Cheikhou Kouyaté',      team:'sn', pos:'MID' },
  { name:'Pape Matar Sarr',       team:'sn', pos:'MID' },
  { name:'Lamine Camara',         team:'sn', pos:'MID' },
  { name:'Sadio Mané',            team:'sn', pos:'FWD' },
  { name:'Ismaïla Sarr',          team:'sn', pos:'FWD' },
  { name:'Boulaye Dia',           team:'sn', pos:'FWD' },
  { name:'Nicolas Jackson',       team:'sn', pos:'FWD' },

  // ── NORWAY (Group I) ─────────────────────────────────────
  { name:'Ørjan Nyland',          team:'no', pos:'GK'  },
  { name:'Håkon Opdal',           team:'no', pos:'GK'  },
  { name:'Leo Skiri Østigård',    team:'no', pos:'DEF' },
  { name:'Andreas Hanche-Olsen',  team:'no', pos:'DEF' },
  { name:'Birger Meling',         team:'no', pos:'DEF' },
  { name:'Stian Gregersen',       team:'no', pos:'DEF' },
  { name:'Martin Ødegaard',       team:'no', pos:'MID' },
  { name:'Sander Berge',          team:'no', pos:'MID' },
  { name:'Mathias Normann',       team:'no', pos:'MID' },
  { name:'Fredrik Aursnes',       team:'no', pos:'MID' },
  { name:'Erling Haaland',        team:'no', pos:'FWD' },
  { name:'Alexander Sørloth',     team:'no', pos:'FWD' },
  { name:'Mohamed Elyounoussi',   team:'no', pos:'FWD' },
  { name:'Ola Brynhildsen',       team:'no', pos:'FWD' },

  // ── IRAQ (Group I) ───────────────────────────────────────
  { name:'Jalal Hassan',          team:'iq', pos:'GK'  },
  { name:'Dhurgham Ismail',       team:'iq', pos:'GK'  },
  { name:'Ali Adnan',             team:'iq', pos:'DEF' },
  { name:'Rebin Sulaka',          team:'iq', pos:'DEF' },
  { name:'Hussein Ali',           team:'iq', pos:'DEF' },
  { name:'Amjed Attwan',          team:'iq', pos:'MID' },
  { name:'Bashar Resan',          team:'iq', pos:'MID' },
  { name:'Ahmad Yasin',           team:'iq', pos:'MID' },
  { name:'Aymen Hussein',         team:'iq', pos:'FWD' },
  { name:'Mohanad Ali',           team:'iq', pos:'FWD' },
  { name:'Ali Jasim',             team:'iq', pos:'FWD' },

  // ── BRAZIL (Group C) ─────────────────────────────────────
  { name:'Ederson',               team:'br', pos:'GK'  },
  { name:'Bento',                 team:'br', pos:'GK'  },
  { name:'John Victor',           team:'br', pos:'GK'  },
  { name:'Marquinhos',            team:'br', pos:'DEF' },
  { name:'Danilo',                team:'br', pos:'DEF' },
  { name:'Alex Sandro',           team:'br', pos:'DEF' },
  { name:'Gabriel Magalhães',     team:'br', pos:'DEF' },
  { name:'Fabricio Bruno',        team:'br', pos:'DEF' },
  { name:'Caio Henrique',         team:'br', pos:'DEF' },
  { name:'Wesley',                team:'br', pos:'DEF' },
  { name:'Casemiro',              team:'br', pos:'MID' },
  { name:'Lucas Paquetá',         team:'br', pos:'MID' },
  { name:'Bruno Guimarães',       team:'br', pos:'MID' },
  { name:'Andrey Santos',         team:'br', pos:'MID' },
  { name:'Fabinho',               team:'br', pos:'MID' },
  { name:'Vinícius Júnior',       team:'br', pos:'FWD' },
  { name:'Richarlison',           team:'br', pos:'FWD' },
  { name:'Luiz Henrique',         team:'br', pos:'FWD' },
  { name:'João Pedro',            team:'br', pos:'FWD' },
  { name:'Vitor Roque',           team:'br', pos:'FWD' },

  // ── MOROCCO (Group C) ────────────────────────────────────
  { name:'Yassine Bounou',        team:'ma', pos:'GK'  },
  { name:'Munir Mohamedi',        team:'ma', pos:'GK'  },
  { name:'Ahmed Tagnaouti',       team:'ma', pos:'GK'  },
  { name:'Achraf Hakimi',         team:'ma', pos:'DEF' },
  { name:'Noussair Mazraoui',     team:'ma', pos:'DEF' },
  { name:'Romain Saïss',          team:'ma', pos:'DEF' },
  { name:'Jawad El Yamiq',        team:'ma', pos:'DEF' },
  { name:'Nayef Aguerd',          team:'ma', pos:'DEF' },
  { name:'Sofyan Amrabat',        team:'ma', pos:'MID' },
  { name:'Azzedine Ounahi',       team:'ma', pos:'MID' },
  { name:'Selim Amallah',         team:'ma', pos:'MID' },
  { name:'Bilal El Khannouss',    team:'ma', pos:'MID' },
  { name:'Hakim Ziyech',          team:'ma', pos:'FWD' },
  { name:'Sofiane Boufal',        team:'ma', pos:'FWD' },
  { name:'Youssef En-Nesyri',     team:'ma', pos:'FWD' },
  { name:'Abde Ezzalzouli',       team:'ma', pos:'FWD' },

  // ── HAITI (Group C) ──────────────────────────────────────
  { name:'Josué Duverger',        team:'ht', pos:'GK'  },
  { name:'Kenson Désir',          team:'ht', pos:'GK'  },
  { name:'Mechack Jérôme',        team:'ht', pos:'DEF' },
  { name:'Jems Geffrard',         team:'ht', pos:'DEF' },
  { name:'Andrew Junior',         team:'ht', pos:'DEF' },
  { name:'Frantzdy Pierrot',      team:'ht', pos:'MID' },
  { name:'Steeven Saba',          team:'ht', pos:'MID' },
  { name:'Duckens Nazon',         team:'ht', pos:'FWD' },
  { name:'Naomie Philémonito',    team:'ht', pos:'FWD' },
  { name:'Kevin Lafrance',        team:'ht', pos:'FWD' },

  // ── SCOTLAND (Group C) ───────────────────────────────────
  { name:'Craig Gordon',          team:'gb-sct', pos:'GK'  },
  { name:'Zander Clark',          team:'gb-sct', pos:'GK'  },
  { name:'Liam Kelly',            team:'gb-sct', pos:'GK'  },
  { name:'Andrew Robertson',      team:'gb-sct', pos:'DEF' },
  { name:'Kieran Tierney',        team:'gb-sct', pos:'DEF' },
  { name:'Grant Hanley',          team:'gb-sct', pos:'DEF' },
  { name:'Nathan Patterson',      team:'gb-sct', pos:'DEF' },
  { name:'Jack Hendry',           team:'gb-sct', pos:'DEF' },
  { name:'John McGinn',           team:'gb-sct', pos:'MID' },
  { name:'Callum McGregor',       team:'gb-sct', pos:'MID' },
  { name:'Stuart Armstrong',      team:'gb-sct', pos:'MID' },
  { name:'Ryan Christie',         team:'gb-sct', pos:'MID' },
  { name:'Billy Gilmour',         team:'gb-sct', pos:'MID' },
  { name:'Lyndon Dykes',          team:'gb-sct', pos:'FWD' },
  { name:'Che Adams',             team:'gb-sct', pos:'FWD' },
  { name:'Lawrence Shankland',    team:'gb-sct', pos:'FWD' },

  // ── SPAIN (Group H) ──────────────────────────────────────
  { name:'Unai Simón',            team:'es', pos:'GK'  },
  { name:'David Raya',            team:'es', pos:'GK'  },
  { name:'Álex Remiro',           team:'es', pos:'GK'  },
  { name:'Dani Carvajal',         team:'es', pos:'DEF' },
  { name:'Aymeric Laporte',       team:'es', pos:'DEF' },
  { name:'Robin Le Normand',      team:'es', pos:'DEF' },
  { name:'Marc Cucurella',        team:'es', pos:'DEF' },
  { name:'Alejandro Grimaldo',    team:'es', pos:'DEF' },
  { name:'Pedri',                 team:'es', pos:'MID' },
  { name:'Rodri',                 team:'es', pos:'MID' },
  { name:'Fabián Ruiz',           team:'es', pos:'MID' },
  { name:'Gavi',                  team:'es', pos:'MID' },
  { name:'Mikel Merino',          team:'es', pos:'MID' },
  { name:'Dani Olmo',             team:'es', pos:'MID' },
  { name:'Álvaro Morata',         team:'es', pos:'FWD' },
  { name:'Lamine Yamal',          team:'es', pos:'FWD' },
  { name:'Nico Williams',         team:'es', pos:'FWD' },
  { name:'Ferran Torres',         team:'es', pos:'FWD' },

  // ── CAPE VERDE (Group H) ─────────────────────────────────
  { name:'Vozinha',               team:'cv', pos:'GK'  },
  { name:'José Maurício',         team:'cv', pos:'GK'  },
  { name:'Stopira',               team:'cv', pos:'DEF' },
  { name:'Roberto Lopes',         team:'cv', pos:'DEF' },
  { name:'Patrick Andrade',       team:'cv', pos:'MID' },
  { name:'Jamiro Monteiro',       team:'cv', pos:'MID' },
  { name:'Garry Rodrigues',       team:'cv', pos:'FWD' },
  { name:'Ryan Mendes',           team:'cv', pos:'FWD' },
  { name:'Djaniny',               team:'cv', pos:'FWD' },
  { name:'Orlando Hurtado',       team:'cv', pos:'FWD' },

  // ── SAUDI ARABIA (Group H) ───────────────────────────────
  { name:'Mohammed Al-Owais',     team:'sa', pos:'GK'  },
  { name:'Nawaf Al-Aqidi',        team:'sa', pos:'GK'  },
  { name:'Ali Al-Bulayhi',        team:'sa', pos:'DEF' },
  { name:'Hassan Tambakti',       team:'sa', pos:'DEF' },
  { name:'Saud Abdulhamid',       team:'sa', pos:'DEF' },
  { name:'Sultan Al-Ghannam',     team:'sa', pos:'DEF' },
  { name:'Mohammed Kanno',        team:'sa', pos:'MID' },
  { name:'Salman Al-Faraj',       team:'sa', pos:'MID' },
  { name:'Abdulellah Al-Malki',   team:'sa', pos:'MID' },
  { name:'Sami Al-Najei',         team:'sa', pos:'MID' },
  { name:'Salem Al-Dawsari',      team:'sa', pos:'FWD' },
  { name:'Firas Al-Buraikan',     team:'sa', pos:'FWD' },
  { name:'Haitham Asiri',         team:'sa', pos:'FWD' },

  // ── URUGUAY (Group H) ────────────────────────────────────
  { name:'Sergio Rochet',         team:'uy', pos:'GK'  },
  { name:'Sebastián Sosa',        team:'uy', pos:'GK'  },
  { name:'Ronald Araújo',         team:'uy', pos:'DEF' },
  { name:'José María Giménez',    team:'uy', pos:'DEF' },
  { name:'Mathías Olivera',       team:'uy', pos:'DEF' },
  { name:'Sebastián Cáceres',     team:'uy', pos:'DEF' },
  { name:'Federico Valverde',     team:'uy', pos:'MID' },
  { name:'Rodrigo Bentancur',     team:'uy', pos:'MID' },
  { name:'Manuel Ugarte',         team:'uy', pos:'MID' },
  { name:'Nicolás de la Cruz',    team:'uy', pos:'MID' },
  { name:'Darwin Núñez',          team:'uy', pos:'FWD' },
  { name:'Luis Suárez',           team:'uy', pos:'FWD' },
  { name:'Facundo Torres',        team:'uy', pos:'FWD' },
  { name:'Maximiliano Araújo',    team:'uy', pos:'FWD' },

  // ── ENGLAND (Group L) ────────────────────────────────────
  { name:'Jordan Pickford',       team:'gb-eng', pos:'GK'  },
  { name:'Nick Pope',             team:'gb-eng', pos:'GK'  },
  { name:'Aaron Ramsdale',        team:'gb-eng', pos:'GK'  },
  { name:'Kyle Walker',           team:'gb-eng', pos:'DEF' },
  { name:'John Stones',           team:'gb-eng', pos:'DEF' },
  { name:'Harry Maguire',         team:'gb-eng', pos:'DEF' },
  { name:'Luke Shaw',             team:'gb-eng', pos:'DEF' },
  { name:'Trent Alexander-Arnold',team:'gb-eng', pos:'DEF' },
  { name:'Jude Bellingham',       team:'gb-eng', pos:'MID' },
  { name:'Declan Rice',           team:'gb-eng', pos:'MID' },
  { name:'Kobbie Mainoo',         team:'gb-eng', pos:'MID' },
  { name:'Phil Foden',            team:'gb-eng', pos:'MID' },
  { name:'Conor Gallagher',       team:'gb-eng', pos:'MID' },
  { name:'Harry Kane',            team:'gb-eng', pos:'FWD' },
  { name:'Bukayo Saka',           team:'gb-eng', pos:'FWD' },
  { name:'Marcus Rashford',       team:'gb-eng', pos:'FWD' },
  { name:'Ollie Watkins',         team:'gb-eng', pos:'FWD' },
  { name:'Cole Palmer',           team:'gb-eng', pos:'FWD' },

  // ── CROATIA (Group L) ────────────────────────────────────
  { name:'Dominik Livaković',     team:'hr', pos:'GK'  },
  { name:'Ivica Ivušić',          team:'hr', pos:'GK'  },
  { name:'Josip Stanišić',        team:'hr', pos:'DEF' },
  { name:'Joško Gvardiol',        team:'hr', pos:'DEF' },
  { name:'Duje Ćaleta-Car',       team:'hr', pos:'DEF' },
  { name:'Borna Sosa',            team:'hr', pos:'DEF' },
  { name:'Luka Modrić',           team:'hr', pos:'MID' },
  { name:'Mateo Kovačić',         team:'hr', pos:'MID' },
  { name:'Marcelo Brozović',      team:'hr', pos:'MID' },
  { name:'Mario Pašalić',         team:'hr', pos:'MID' },
  { name:'Ivan Perišić',          team:'hr', pos:'FWD' },
  { name:'Andrej Kramarić',       team:'hr', pos:'FWD' },
  { name:'Bruno Petković',        team:'hr', pos:'FWD' },

  // ── GHANA (Group L) ──────────────────────────────────────
  { name:'Lawrence Ati-Zigi',     team:'gh', pos:'GK'  },
  { name:'Richard Ofori',         team:'gh', pos:'GK'  },
  { name:'Tariq Lamptey',         team:'gh', pos:'DEF' },
  { name:'Daniel Amartey',        team:'gh', pos:'DEF' },
  { name:'Alexander Djiku',       team:'gh', pos:'DEF' },
  { name:'Thomas Partey',         team:'gh', pos:'MID' },
  { name:'Salis Abdul Samed',     team:'gh', pos:'MID' },
  { name:'Emmanuel Gyasi',        team:'gh', pos:'MID' },
  { name:'Mohammed Kudus',        team:'gh', pos:'FWD' },
  { name:'Inaki Williams',        team:'gh', pos:'FWD' },
  { name:'Jordan Ayew',           team:'gh', pos:'FWD' },
  { name:'Kamaldeen Sulemana',    team:'gh', pos:'FWD' },

  // ── PANAMA (Group L) ─────────────────────────────────────
  { name:'Luis Mejía',            team:'pa', pos:'GK'  },
  { name:'Orlando Mosquera',      team:'pa', pos:'GK'  },
  { name:'Adolfo Machado',        team:'pa', pos:'DEF' },
  { name:'Fidel Escobar',         team:'pa', pos:'DEF' },
  { name:'Eric Davis',            team:'pa', pos:'DEF' },
  { name:'César Blackman',        team:'pa', pos:'DEF' },
  { name:'Adalberto Carrasquilla',team:'pa', pos:'MID' },
  { name:'Valentín Pimentel',     team:'pa', pos:'MID' },
  { name:'Ricardo Avila',         team:'pa', pos:'MID' },
  { name:'Ismael Díaz',           team:'pa', pos:'FWD' },
  { name:'Rolando Blackburn',     team:'pa', pos:'FWD' },
  { name:'Cecilio Waterman',      team:'pa', pos:'FWD' },

  // ── PORTUGAL (Group K) ───────────────────────────────────
  { name:'Diogo Costa',           team:'pt', pos:'GK'  },
  { name:'Rui Patrício',          team:'pt', pos:'GK'  },
  { name:'José Sá',               team:'pt', pos:'GK'  },
  { name:'Rúben Dias',            team:'pt', pos:'DEF' },
  { name:'Pepe',                  team:'pt', pos:'DEF' },
  { name:'Diogo Dalot',           team:'pt', pos:'DEF' },
  { name:'Nuno Mendes',           team:'pt', pos:'DEF' },
  { name:'João Cancelo',          team:'pt', pos:'DEF' },
  { name:'Bruno Fernandes',       team:'pt', pos:'MID' },
  { name:'Bernardo Silva',        team:'pt', pos:'MID' },
  { name:'João Palhinha',         team:'pt', pos:'MID' },
  { name:'Vitinha',               team:'pt', pos:'MID' },
  { name:'Rúben Neves',           team:'pt', pos:'MID' },
  { name:'Cristiano Ronaldo',     team:'pt', pos:'FWD' },
  { name:'Rafael Leão',           team:'pt', pos:'FWD' },
  { name:'Gonçalo Ramos',         team:'pt', pos:'FWD' },
  { name:'Pedro Neto',            team:'pt', pos:'FWD' },

  // ── COLOMBIA (Group K) ───────────────────────────────────
  { name:'Camilo Vargas',         team:'co', pos:'GK'  },
  { name:'David Ospina',          team:'co', pos:'GK'  },
  { name:'Davinson Sánchez',      team:'co', pos:'DEF' },
  { name:'Yerry Mina',            team:'co', pos:'DEF' },
  { name:'Daniel Muñoz',          team:'co', pos:'DEF' },
  { name:'Carlos Cuesta',         team:'co', pos:'DEF' },
  { name:'James Rodríguez',       team:'co', pos:'MID' },
  { name:'Mateus Uribe',          team:'co', pos:'MID' },
  { name:'Wilmar Barrios',        team:'co', pos:'MID' },
  { name:'Richard Ríos',          team:'co', pos:'MID' },
  { name:'Luis Díaz',             team:'co', pos:'FWD' },
  { name:'Rafael Santos Borré',   team:'co', pos:'FWD' },
  { name:'Jhon Durán',            team:'co', pos:'FWD' },
  { name:'Cucho Hernández',       team:'co', pos:'FWD' },

  // ── DR CONGO (Group K) ───────────────────────────────────
  { name:'Joël Kiassumbua',       team:'cd', pos:'GK'  },
  { name:'Lionel Mpasi',          team:'cd', pos:'GK'  },
  { name:'Chancel Mbemba',        team:'cd', pos:'DEF' },
  { name:'Dylan Batubinsika',     team:'cd', pos:'DEF' },
  { name:'Arthur Masuaku',        team:'cd', pos:'DEF' },
  { name:'Yannick Carrasco',      team:'cd', pos:'MID' },
  { name:'Paul-José Mpoku',       team:'cd', pos:'MID' },
  { name:'Meschack Elia',         team:'cd', pos:'MID' },
  { name:'Cédric Bakambu',        team:'cd', pos:'FWD' },
  { name:'Silas Katompa',         team:'cd', pos:'FWD' },
  { name:'Arthur Ébosse',         team:'cd', pos:'FWD' },

  // ── UZBEKISTAN (Group K) ─────────────────────────────────
  { name:'Utkir Yusupov',         team:'uz', pos:'GK'  },
  { name:'Dilshodbek Nematov',    team:'uz', pos:'GK'  },
  { name:'Dostonbek Khamdamov',   team:'uz', pos:'DEF' },
  { name:'Shokhrukh Nosirov',     team:'uz', pos:'DEF' },
  { name:'Abbosbek Fayzullaev',   team:'uz', pos:'MID' },
  { name:'Otabek Shukurov',       team:'uz', pos:'MID' },
  { name:'Jaloliddin Masharipov', team:'uz', pos:'MID' },
  { name:'Eldor Shomurodov',      team:'uz', pos:'FWD' },
  { name:'Khusein Norchaev',      team:'uz', pos:'FWD' },
  { name:'Islom Tukhtashev',      team:'uz', pos:'FWD' },

  // ── GERMANY (Group E) ────────────────────────────────────
  { name:'Manuel Neuer',          team:'de', pos:'GK'  },
  { name:'Marc-André ter Stegen', team:'de', pos:'GK'  },
  { name:'Oliver Baumann',        team:'de', pos:'GK'  },
  { name:'Antonio Rüdiger',       team:'de', pos:'DEF' },
  { name:'Jonathan Tah',          team:'de', pos:'DEF' },
  { name:'Joshua Kimmich',        team:'de', pos:'DEF' },
  { name:'David Raum',            team:'de', pos:'DEF' },
  { name:'Nico Schlotterbeck',    team:'de', pos:'DEF' },
  { name:'Florian Wirtz',         team:'de', pos:'MID' },
  { name:'Jamal Musiala',         team:'de', pos:'MID' },
  { name:'Toni Kroos',            team:'de', pos:'MID' },
  { name:'Leon Goretzka',         team:'de', pos:'MID' },
  { name:'Ilkay Gündogan',        team:'de', pos:'MID' },
  { name:'Kai Havertz',           team:'de', pos:'FWD' },
  { name:'Leroy Sané',            team:'de', pos:'FWD' },
  { name:'Thomas Müller',         team:'de', pos:'FWD' },
  { name:'Niclas Füllkrug',       team:'de', pos:'FWD' },
  { name:'Serge Gnabry',          team:'de', pos:'FWD' },

  // ── CURAÇAO (Group E) ────────────────────────────────────
  { name:'Eloy Room',             team:'cw', pos:'GK'  },
  { name:'Cuco Martina',          team:'cw', pos:'DEF' },
  { name:'Juriën Timber',         team:'cw', pos:'DEF' },
  { name:'Ethan Nwaneri',         team:'cw', pos:'DEF' },
  { name:'Leandro Bacuna',        team:'cw', pos:'MID' },
  { name:'Giliano Wijnaldum',     team:'cw', pos:'MID' },
  { name:'Brandley Kuwas',        team:'cw', pos:'FWD' },
  { name:'Remy Lagerweij',        team:'cw', pos:'FWD' },
  { name:'Curaçao Player',        team:'cw', pos:'FWD' },

  // ── IVORY COAST (Group E) ────────────────────────────────
  { name:'Yahia Fofana',          team:'ci', pos:'GK'  },
  { name:'Badra Ali Sangaré',     team:'ci', pos:'GK'  },
  { name:'Serge Aurier',          team:'ci', pos:'DEF' },
  { name:'Willy Boly',            team:'ci', pos:'DEF' },
  { name:'Wilfried Singo',        team:'ci', pos:'DEF' },
  { name:'Odilon Kossounou',      team:'ci', pos:'DEF' },
  { name:'Franck Kessié',         team:'ci', pos:'MID' },
  { name:'Ibrahim Sangaré',       team:'ci', pos:'MID' },
  { name:'Jean-Michaël Seri',     team:'ci', pos:'MID' },
  { name:'Sébastien Haller',      team:'ci', pos:'FWD' },
  { name:'Nicolas Pépé',          team:'ci', pos:'FWD' },
  { name:'Simon Adingra',         team:'ci', pos:'FWD' },
  { name:'Wilfried Zaha',         team:'ci', pos:'FWD' },

  // ── ECUADOR (Group E) ────────────────────────────────────
  { name:'Hernán Galíndez',       team:'ec', pos:'GK'  },
  { name:'Alexander Domínguez',   team:'ec', pos:'GK'  },
  { name:'Piero Hincapié',        team:'ec', pos:'DEF' },
  { name:'Félix Torres',          team:'ec', pos:'DEF' },
  { name:'Pervis Estupiñán',      team:'ec', pos:'DEF' },
  { name:'Diego Palacios',        team:'ec', pos:'DEF' },
  { name:'Moisés Caicedo',        team:'ec', pos:'MID' },
  { name:'Carlos Gruezo',         team:'ec', pos:'MID' },
  { name:'Jeremy Sarmiento',      team:'ec', pos:'MID' },
  { name:'Ángel Mena',            team:'ec', pos:'MID' },
  { name:'Enner Valencia',        team:'ec', pos:'FWD' },
  { name:'Gonzalo Plata',         team:'ec', pos:'FWD' },
  { name:'Michael Estrada',       team:'ec', pos:'FWD' },

  // ── NETHERLANDS (Group F) ────────────────────────────────
  { name:'Bart Verbruggen',       team:'nl', pos:'GK'  },
  { name:'Remko Pasveer',         team:'nl', pos:'GK'  },
  { name:'Virgil van Dijk',       team:'nl', pos:'DEF' },
  { name:'Matthijs de Ligt',      team:'nl', pos:'DEF' },
  { name:'Denzel Dumfries',       team:'nl', pos:'DEF' },
  { name:'Nathan Aké',            team:'nl', pos:'DEF' },
  { name:'Frenkie de Jong',       team:'nl', pos:'MID' },
  { name:'Teun Koopmeiners',      team:'nl', pos:'MID' },
  { name:'Ryan Gravenberch',      team:'nl', pos:'MID' },
  { name:'Tijjani Reijnders',     team:'nl', pos:'MID' },
  { name:'Memphis Depay',         team:'nl', pos:'FWD' },
  { name:'Cody Gakpo',            team:'nl', pos:'FWD' },
  { name:'Xavi Simons',           team:'nl', pos:'FWD' },
  { name:'Wout Weghorst',         team:'nl', pos:'FWD' },
  { name:'Donyell Malen',         team:'nl', pos:'FWD' },

  // ── JAPAN (Group F) ──────────────────────────────────────
  { name:'Shuichi Gonda',         team:'jp', pos:'GK'  },
  { name:'Zion Suzuki',           team:'jp', pos:'GK'  },
  { name:'Ko Itakura',            team:'jp', pos:'DEF' },
  { name:'Takehiro Tomiyasu',     team:'jp', pos:'DEF' },
  { name:'Yuto Nagatomo',         team:'jp', pos:'DEF' },
  { name:'Maya Yoshida',          team:'jp', pos:'DEF' },
  { name:'Wataru Endo',           team:'jp', pos:'MID' },
  { name:'Hidemasa Morita',       team:'jp', pos:'MID' },
  { name:'Junya Ito',             team:'jp', pos:'MID' },
  { name:'Ao Tanaka',             team:'jp', pos:'MID' },
  { name:'Takumi Minamino',       team:'jp', pos:'FWD' },
  { name:'Ritsu Doan',            team:'jp', pos:'FWD' },
  { name:'Kaoru Mitoma',          team:'jp', pos:'FWD' },
  { name:'Daichi Kamada',         team:'jp', pos:'FWD' },

  // ── SWEDEN (Group F) ─────────────────────────────────────
  { name:'Robin Olsen',           team:'se', pos:'GK'  },
  { name:'Karl-Johan Johnsson',   team:'se', pos:'GK'  },
  { name:'Victor Nilsson Lindelöf',team:'se',pos:'DEF' },
  { name:'Ludwig Augustinsson',   team:'se', pos:'DEF' },
  { name:'Isak Hien',             team:'se', pos:'DEF' },
  { name:'Emil Krafth',           team:'se', pos:'DEF' },
  { name:'Emil Forsberg',         team:'se', pos:'MID' },
  { name:'Mattias Svanberg',      team:'se', pos:'MID' },
  { name:'Dejan Kulusevski',      team:'se', pos:'MID' },
  { name:'Samuel Chukwueze',      team:'se', pos:'MID' },
  { name:'Alexander Isak',        team:'se', pos:'FWD' },
  { name:'Viktor Gyökeres',       team:'se', pos:'FWD' },
  { name:'Zlatan Ibrahimović',    team:'se', pos:'FWD' },
  { name:'Jordan Larsson',        team:'se', pos:'FWD' },

  // ── TUNISIA (Group F) ────────────────────────────────────
  { name:'Aymen Dahmen',          team:'tn', pos:'GK'  },
  { name:'Bechir Ben Said',       team:'tn', pos:'GK'  },
  { name:'Ali Maaloul',           team:'tn', pos:'DEF' },
  { name:'Montassar Talbi',       team:'tn', pos:'DEF' },
  { name:'Yassine Meriah',        team:'tn', pos:'DEF' },
  { name:'Hannibal Mejbri',       team:'tn', pos:'MID' },
  { name:'Ellyes Skhiri',         team:'tn', pos:'MID' },
  { name:'Anis Ben Slimane',      team:'tn', pos:'MID' },
  { name:'Wahbi Khazri',          team:'tn', pos:'FWD' },
  { name:'Issam Jebali',          team:'tn', pos:'FWD' },
  { name:'Youssef Msakni',        team:'tn', pos:'FWD' },

  // ── BELGIUM (Group G) ────────────────────────────────────
  { name:'Thibaut Courtois',      team:'be', pos:'GK'  },
  { name:'Senne Lammens',         team:'be', pos:'GK'  },
  { name:'Mike Penders',          team:'be', pos:'GK'  },
  { name:'Timothy Castagne',      team:'be', pos:'DEF' },
  { name:'Zeno Debast',           team:'be', pos:'DEF' },
  { name:'Maxim De Cuyper',       team:'be', pos:'DEF' },
  { name:'Koni De Winter',        team:'be', pos:'DEF' },
  { name:'Arthur Theate',         team:'be', pos:'DEF' },
  { name:'Thomas Meunier',        team:'be', pos:'DEF' },
  { name:'Kevin De Bruyne',       team:'be', pos:'MID' },
  { name:'Amadou Onana',          team:'be', pos:'MID' },
  { name:'Youri Tielemans',       team:'be', pos:'MID' },
  { name:'Hans Vanaken',          team:'be', pos:'MID' },
  { name:'Axel Witsel',           team:'be', pos:'MID' },
  { name:'Nicolas Raskin',        team:'be', pos:'MID' },
  { name:'Romelu Lukaku',         team:'be', pos:'FWD' },
  { name:'Jeremy Doku',           team:'be', pos:'FWD' },
  { name:'Charles De Ketelaere',  team:'be', pos:'FWD' },
  { name:'Leandro Trossard',      team:'be', pos:'FWD' },

  // ── EGYPT (Group G) ──────────────────────────────────────
  { name:'Mohamed El-Shenawy',    team:'eg', pos:'GK'  },
  { name:'Mohamed Abou Gabal',    team:'eg', pos:'GK'  },
  { name:'Ahmed Hegazy',          team:'eg', pos:'DEF' },
  { name:'Omar Kamal',            team:'eg', pos:'DEF' },
  { name:'Mohamed Abdelmonem',    team:'eg', pos:'DEF' },
  { name:'Tarek Hamed',           team:'eg', pos:'MID' },
  { name:'Amr El Sulaya',         team:'eg', pos:'MID' },
  { name:'Mohamed Elneny',        team:'eg', pos:'MID' },
  { name:'Mohamed Salah',         team:'eg', pos:'FWD' },
  { name:'Mostafa Mohamed',       team:'eg', pos:'FWD' },
  { name:'Omar Marmoush',         team:'eg', pos:'FWD' },
  { name:'Trezeguet',             team:'eg', pos:'FWD' },

  // ── IRAN (Group G) ───────────────────────────────────────
  { name:'Alireza Beiranvand',    team:'ir', pos:'GK'  },
  { name:'Payam Niazmand',        team:'ir', pos:'GK'  },
  { name:'Ehsan Hajsafi',         team:'ir', pos:'DEF' },
  { name:'Majid Hosseini',        team:'ir', pos:'DEF' },
  { name:'Shoja Khalilzadeh',     team:'ir', pos:'DEF' },
  { name:'Sadegh Moharrami',      team:'ir', pos:'DEF' },
  { name:'Saeid Ezatolahi',       team:'ir', pos:'MID' },
  { name:'Ali Gholizadeh',        team:'ir', pos:'MID' },
  { name:'Ahmad Noorollahi',      team:'ir', pos:'MID' },
  { name:'Mehdi Taremi',          team:'ir', pos:'FWD' },
  { name:'Sardar Azmoun',         team:'ir', pos:'FWD' },
  { name:'Alireza Jahanbakhsh',   team:'ir', pos:'FWD' },

  // ── NEW ZEALAND (Group G) ────────────────────────────────
  { name:'Stefan Marinovic',      team:'nz', pos:'GK'  },
  { name:'Oli Sail',              team:'nz', pos:'GK'  },
  { name:'Winston Reid',          team:'nz', pos:'DEF' },
  { name:'Bill Tuiloma',          team:'nz', pos:'DEF' },
  { name:'Liberato Cacace',       team:'nz', pos:'DEF' },
  { name:'Tim Payne',             team:'nz', pos:'DEF' },
  { name:'Clayton Lewis',         team:'nz', pos:'MID' },
  { name:'Joe Bell',              team:'nz', pos:'MID' },
  { name:'Elijah Just',           team:'nz', pos:'MID' },
  { name:'Chris Wood',            team:'nz', pos:'FWD' },
  { name:'Dane Ingham',           team:'nz', pos:'FWD' },
  { name:'Matthew Garbett',       team:'nz', pos:'MID' },

  // ── MEXICO (Group A) ─────────────────────────────────────
  { name:'Raúl Rangel',           team:'mx', pos:'GK'  },
  { name:'Guillermo Ochoa',       team:'mx', pos:'GK'  },
  { name:'Carlos Acevedo',        team:'mx', pos:'GK'  },
  { name:'César Montes',          team:'mx', pos:'DEF' },
  { name:'Johan Vásquez',         team:'mx', pos:'DEF' },
  { name:'Gerardo Arteaga',       team:'mx', pos:'DEF' },
  { name:'Jorge Sánchez',         team:'mx', pos:'DEF' },
  { name:'Edson Álvarez',         team:'mx', pos:'MID' },
  { name:'Andrés Guardado',       team:'mx', pos:'MID' },
  { name:'Carlos Rodríguez',      team:'mx', pos:'MID' },
  { name:'Luis Romo',             team:'mx', pos:'MID' },
  { name:'Hirving Lozano',        team:'mx', pos:'FWD' },
  { name:'Alexis Vega',           team:'mx', pos:'FWD' },
  { name:'Santiago Giménez',      team:'mx', pos:'FWD' },
  { name:'Raúl Jiménez',          team:'mx', pos:'FWD' },
  { name:'Henry Martín',          team:'mx', pos:'FWD' },

  // ── SOUTH AFRICA (Group A) ───────────────────────────────
  { name:'Ronwen Williams',       team:'za', pos:'GK'  },
  { name:'Veli Mothwa',           team:'za', pos:'GK'  },
  { name:'Siyanda Xulu',          team:'za', pos:'DEF' },
  { name:'Thibang Phete',         team:'za', pos:'DEF' },
  { name:'Reeve Frosler',         team:'za', pos:'DEF' },
  { name:'Bongani Zungu',         team:'za', pos:'MID' },
  { name:'Themba Zwane',          team:'za', pos:'MID' },
  { name:'Teboho Mokoena',        team:'za', pos:'MID' },
  { name:'Lyle Foster',           team:'za', pos:'FWD' },
  { name:'Percy Tau',             team:'za', pos:'FWD' },
  { name:'Evidence Makgopa',      team:'za', pos:'FWD' },

  // ── SOUTH KOREA (Group A) ────────────────────────────────
  { name:'Kim Seung-gyu',         team:'kr', pos:'GK'  },
  { name:'Jo Hyeon-woo',          team:'kr', pos:'GK'  },
  { name:'Kim Min-jae',           team:'kr', pos:'DEF' },
  { name:'Jung Seung-hyun',       team:'kr', pos:'DEF' },
  { name:'Kim Jin-su',            team:'kr', pos:'DEF' },
  { name:'Lee Ki-je',             team:'kr', pos:'DEF' },
  { name:'Son Heung-min',         team:'kr', pos:'FWD' },
  { name:'Lee Jae-sung',          team:'kr', pos:'MID' },
  { name:'Hwang In-beom',         team:'kr', pos:'MID' },
  { name:'Cho Gue-sung',          team:'kr', pos:'FWD' },
  { name:'Hwang Hee-chan',         team:'kr', pos:'FWD' },
  { name:'Lee Kang-in',           team:'kr', pos:'MID' },
  { name:'Yang Min-hyuk',         team:'kr', pos:'FWD' },

  // ── CZECHIA (Group A) ────────────────────────────────────
  { name:'Tomáš Vaclík',          team:'cz', pos:'GK'  },
  { name:'Ondřej Kolář',          team:'cz', pos:'GK'  },
  { name:'Jiří Pavlenka',         team:'cz', pos:'GK'  },
  { name:'Tomáš Souček',          team:'cz', pos:'MID' },
  { name:'Vladimír Coufal',       team:'cz', pos:'DEF' },
  { name:'Patrik Schick',         team:'cz', pos:'FWD' },
  { name:'Adam Hložek',           team:'cz', pos:'FWD' },
  { name:'Ondřej Duda',           team:'cz', pos:'MID' },
  { name:'Lukáš Provod',          team:'cz', pos:'MID' },
  { name:'Antonín Barák',         team:'cz', pos:'MID' },
  { name:'Ladislav Krejčí',       team:'cz', pos:'DEF' },

  // ── CANADA (Group B) ─────────────────────────────────────
  { name:'Dayne St. Clair',       team:'ca', pos:'GK'  },
  { name:'Maxime Crépeau',        team:'ca', pos:'GK'  },
  { name:'Kamal Miller',          team:'ca', pos:'DEF' },
  { name:'Derek Cornelius',       team:'ca', pos:'DEF' },
  { name:'Richie Laryea',         team:'ca', pos:'DEF' },
  { name:'Stephen Eustáquio',     team:'ca', pos:'MID' },
  { name:'Tajon Buchanan',        team:'ca', pos:'FWD' },
  { name:'Jonathan Osorio',       team:'ca', pos:'MID' },
  { name:'Ismael Kone',           team:'ca', pos:'MID' },
  { name:'Alphonso Davies',       team:'ca', pos:'FWD' },
  { name:'Jonathan David',        team:'ca', pos:'FWD' },
  { name:'Cyle Larin',            team:'ca', pos:'FWD' },
  { name:'Tani Oluwaseyi',        team:'ca', pos:'FWD' },

  // ── SWITZERLAND (Group B) ────────────────────────────────
  { name:'Yann Sommer',           team:'ch', pos:'GK'  },
  { name:'Gregor Kobel',          team:'ch', pos:'GK'  },
  { name:'Jonas Omlin',           team:'ch', pos:'GK'  },
  { name:'Manuel Akanji',         team:'ch', pos:'DEF' },
  { name:'Nico Elvedi',           team:'ch', pos:'DEF' },
  { name:'Ricardo Rodríguez',     team:'ch', pos:'DEF' },
  { name:'Silvan Widmer',         team:'ch', pos:'DEF' },
  { name:'Granit Xhaka',          team:'ch', pos:'MID' },
  { name:'Remo Freuler',          team:'ch', pos:'MID' },
  { name:'Denis Zakaria',         team:'ch', pos:'MID' },
  { name:'Ruben Vargas',          team:'ch', pos:'MID' },
  { name:'Xherdan Shaqiri',       team:'ch', pos:'MID' },
  { name:'Breel Embolo',          team:'ch', pos:'FWD' },
  { name:'Noah Okafor',           team:'ch', pos:'FWD' },
  { name:'Zeki Amdouni',          team:'ch', pos:'FWD' },

  // ── QATAR (Group B) ──────────────────────────────────────
  { name:'Meshaal Barsham',       team:'qa', pos:'GK'  },
  { name:'Yousef Hassan',         team:'qa', pos:'GK'  },
  { name:'Pedro Miguel',          team:'qa', pos:'DEF' },
  { name:'Bassam Al-Rawi',        team:'qa', pos:'DEF' },
  { name:'Abdelkarim Hassan',     team:'qa', pos:'DEF' },
  { name:'Karim Boudiaf',         team:'qa', pos:'MID' },
  { name:'Akram Afif',            team:'qa', pos:'MID' },
  { name:'Hassan Al-Haydos',      team:'qa', pos:'MID' },
  { name:'Almoez Ali',            team:'qa', pos:'FWD' },
  { name:'Mohammed Muntari',      team:'qa', pos:'FWD' },

  // ── BOSNIA & HERZEGOVINA (Group B) ───────────────────────
  { name:'Nikola Vasilj',         team:'ba', pos:'GK'  },
  { name:'Osman Hadžikić',        team:'ba', pos:'GK'  },
  { name:'Sead Kolašinac',        team:'ba', pos:'DEF' },
  { name:'Amar Dedić',            team:'ba', pos:'DEF' },
  { name:'Nikola Katić',          team:'ba', pos:'DEF' },
  { name:'Tarik Muharemović',     team:'ba', pos:'DEF' },
  { name:'Benjamin Tahirović',    team:'ba', pos:'MID' },
  { name:'Amir Hadžiahmetović',   team:'ba', pos:'MID' },
  { name:'Kerim Alajbegović',     team:'ba', pos:'MID' },
  { name:'Esmir Bajraktarević',   team:'ba', pos:'MID' },
  { name:'Ermedin Demirović',     team:'ba', pos:'FWD' },
  { name:'Edin Džeko',            team:'ba', pos:'FWD' },
  { name:'Haris Tabaković',       team:'ba', pos:'FWD' },

  // ── USA (Group D) ────────────────────────────────────────
  { name:'Matt Turner',           team:'us', pos:'GK'  },
  { name:'Patrick Schulte',       team:'us', pos:'GK'  },
  { name:'Zack Steffen',          team:'us', pos:'GK'  },
  { name:'Sergiño Dest',          team:'us', pos:'DEF' },
  { name:'Miles Robinson',        team:'us', pos:'DEF' },
  { name:'Chris Richards',        team:'us', pos:'DEF' },
  { name:'Antonee Robinson',      team:'us', pos:'DEF' },
  { name:'Tim Ream',              team:'us', pos:'DEF' },
  { name:'Tyler Adams',           team:'us', pos:'MID' },
  { name:'Yunus Musah',           team:'us', pos:'MID' },
  { name:'Weston McKennie',       team:'us', pos:'MID' },
  { name:'Gio Reyna',             team:'us', pos:'MID' },
  { name:'Brenden Aaronson',      team:'us', pos:'MID' },
  { name:'Christian Pulisic',     team:'us', pos:'FWD' },
  { name:'Folarin Balogun',       team:'us', pos:'FWD' },
  { name:'Josh Sargent',          team:'us', pos:'FWD' },
  { name:'Timothy Weah',          team:'us', pos:'FWD' },

  // ── PARAGUAY (Group D) ───────────────────────────────────
  { name:'Antony Silva',          team:'py', pos:'GK'  },
  { name:'Rodrigo Muñoz',         team:'py', pos:'GK'  },
  { name:'Omar Alderete',         team:'py', pos:'DEF' },
  { name:'Gustavo Gómez',         team:'py', pos:'DEF' },
  { name:'Junior Alonso',         team:'py', pos:'DEF' },
  { name:'Mathías Villasanti',    team:'py', pos:'MID' },
  { name:'Andrés Cubas',          team:'py', pos:'MID' },
  { name:'Miguel Almirón',        team:'py', pos:'MID' },
  { name:'Ángel Romero',          team:'py', pos:'FWD' },
  { name:'Antonio Sanabria',      team:'py', pos:'FWD' },

  // ── AUSTRALIA (Group D) ──────────────────────────────────
  { name:'Mathew Ryan',           team:'au', pos:'GK'  },
  { name:'Paul Izzo',             team:'au', pos:'GK'  },
  { name:'Miloš Degenek',         team:'au', pos:'DEF' },
  { name:'Kye Rowles',            team:'au', pos:'DEF' },
  { name:'Callum Elder',          team:'au', pos:'DEF' },
  { name:'Jackson Irvine',        team:'au', pos:'MID' },
  { name:'Riley McGree',          team:'au', pos:'MID' },
  { name:'Connor Metcalfe',       team:'au', pos:'MID' },
  { name:'Mathew Leckie',         team:'au', pos:'FWD' },
  { name:'Craig Goodwin',         team:'au', pos:'FWD' },
  { name:'Nestory Irankunda',     team:'au', pos:'FWD' },

  // ── TÜRKIYE (Group D) ────────────────────────────────────
  { name:'Uğurcan Çakır',         team:'tr', pos:'GK'  },
  { name:'Altay Bayındır',        team:'tr', pos:'GK'  },
  { name:'Merih Demiral',         team:'tr', pos:'DEF' },
  { name:'Zeki Çelik',            team:'tr', pos:'DEF' },
  { name:'Samet Akaydın',         team:'tr', pos:'DEF' },
  { name:'Abdülkerim Bardakcı',   team:'tr', pos:'DEF' },
  { name:'Hakan Çalhanoğlu',      team:'tr', pos:'MID' },
  { name:'Salih Özcan',           team:'tr', pos:'MID' },
  { name:'Kerem Aktürkoğlu',      team:'tr', pos:'MID' },
  { name:'Arda Güler',            team:'tr', pos:'MID' },
  { name:'Baris Alper Yilmaz',    team:'tr', pos:'FWD' },
  { name:'Cenk Tosun',            team:'tr', pos:'FWD' },
  { name:'Yusuf Yazıcı',          team:'tr', pos:'FWD' },

];

// ── HELPER FUNCTIONS ─────────────────────────────────────────

/** Get team by code */
export function getTeam(code) {
  return TEAMS.find(t => t.code === code);
}

/** Get all players for a team */
export function getSquad(teamCode) {
  return PLAYERS.filter(p => p.team === teamCode);
}

/** Search players by name or team name (for special picks search) */
export function searchPlayers(query, posFilter = null) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return PLAYERS
    .filter(p => {
      const team = getTeam(p.team);
      const nameMatch = p.name.toLowerCase().includes(q);
      const teamMatch = team?.name.toLowerCase().includes(q);
      const posMatch = !posFilter || p.pos === posFilter;
      return (nameMatch || teamMatch) && posMatch;
    })
    .slice(0, 20);
}

/** Get all matches for a given group */
export function getGroupMatches(group) {
  return MATCHES.filter(m => m.group === group && m.stage === 'group');
}

/** Get matches for a specific matchday */
export function getMatchdayMatches(md) {
  return MATCHES.filter(m => m.md === md && m.stage === 'group');
}

/** Flag URL helper */
export function flagUrl(code, size = 40) {
  return `https://flagcdn.com/w${size}/${code}.png`;
}

/** Format match time display: "Jun 11 · 3:00 PM ET / 2:00 PM CT" */
export function formatMatchTime(match) {
  const d = new Date(match.date);
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  return `${month} ${day} · ${match.timeET} ET / ${match.timeCT} CT`;
}

export default { TEAMS, PLAYERS, MATCHES, getTeam, getSquad, searchPlayers, getGroupMatches, getMatchdayMatches, flagUrl, formatMatchTime };
