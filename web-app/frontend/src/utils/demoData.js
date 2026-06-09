import {
  collection, doc, setDoc, getDocs,
  deleteDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ── 24-hour reset threshold (ms) ────────────────────────────
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000;

// ── Manufacturer serial prefixes ─────────────────────────────
const MFR_PREFIX = {
  'Globe Manufacturing': 'GLB',
  'Morning Pride':       'MPN',
  'Lion Protects':       'LIO',
  'Honeywell':           'HNW',
  'MSA Safety':          'MSA',
};

function serial(mfr, year, seed) {
  const prefix = MFR_PREFIX[mfr] || 'UNK';
  const num = String((seed * 7919 + 10000) % 900000 + 100000);
  return `${prefix}-${year}-${num}`;
}

// ── NFPA edition by manufacture year ─────────────────────────
function nfpa(year) {
  if (year >= 2023) return { std: 'NFPA 1971', edition: '2023 Edition' };
  if (year >= 2018) return { std: 'NFPA 1971', edition: '2018 Edition' };
  return               { std: 'NFPA 1971', edition: '2013 Edition' };
}

// ── Scan timestamp: days before today ────────────────────────
function scanAt(daysAgo) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

// ── Record builder ────────────────────────────────────────────
function rec(id, ff, gearType, mfgDate, mfr, model, seed, scanDaysAgo, extra = {}) {
  const year = parseInt(mfgDate.slice(0, 4), 10);
  const n    = nfpa(year);
  return {
    id,
    timestamp:   scanAt(scanDaysAgo),
    employeeId:  ff.id,
    name:        ff.name,
    station:     ff.station,
    gearType,
    manufacturer: mfr,
    model,
    serialNumber: serial(mfr, year, seed),
    manufactureDate: mfgDate,
    nfpaStandard:    n.std,
    complianceInfo:  n.edition,
    measureChest:  '', measureFront:  '', measureBack:   '', measureSleeve: '',
    measureInseam: '', measureWaist:  '', measureHelmet: '',
    measureGloves: '', measureBoots:  '',
    inspectionInfo: extra.inspection || '',
    ...extra.measures,
  };
}

// ── 15 Firefighters ───────────────────────────────────────────
// measures: coat fields + pants fields + helmet/gloves/boots sizes
const FF = {
  //                       chest front back sleeve waist inseam helmet  gloves boots
  1001: { id: '1001', name: 'John Mitchell',     station: 'Station 1', c: '48', f: '33', b: '39', sl: '35', w: '40', i: '32', h: 'L/XL', g: 'L',  bt: '11' },
  1002: { id: '1002', name: 'Sarah Johnson',     station: 'Station 1', c: '40', f: '29', b: '33', sl: '31', w: '32', i: '29', h: 'S/M', g: 'S',  bt: '8'  },
  1003: { id: '1003', name: 'Mike Thompson',     station: 'Station 1', c: '44', f: '31', b: '36', sl: '33', w: '36', i: '31', h: 'M/L', g: 'M',  bt: '10' },
  1004: { id: '1004', name: 'Chris Davis',       station: 'Station 1', c: '50', f: '34', b: '40', sl: '36', w: '44', i: '32', h: 'XL',  g: 'XL', bt: '13' },
  1005: { id: '1005', name: 'Amanda Wilson',     station: 'Station 1', c: '42', f: '30', b: '34', sl: '32', w: '34', i: '30', h: 'S/M', g: 'S',  bt: '8'  },
  2001: { id: '2001', name: 'Robert Garcia',     station: 'Station 2', c: '44', f: '32', b: '36', sl: '33', w: '36', i: '31', h: 'M/L', g: 'M',  bt: '10' },
  2002: { id: '2002', name: 'Jennifer Martinez', station: 'Station 2', c: '38', f: '28', b: '31', sl: '30', w: '30', i: '28', h: 'S',   g: 'S',  bt: '7'  },
  2003: { id: '2003', name: 'David Anderson',    station: 'Station 2', c: '48', f: '33', b: '38', sl: '35', w: '42', i: '33', h: 'L/XL',g: 'L',  bt: '12' },
  2004: { id: '2004', name: 'Lisa Taylor',       station: 'Station 2', c: '40', f: '29', b: '33', sl: '31', w: '32', i: '29', h: 'M',   g: 'S',  bt: '9'  },
  2005: { id: '2005', name: 'James Brown',       station: 'Station 2', c: '52', f: '35', b: '40', sl: '36', w: '46', i: '32', h: 'XL',  g: 'XL', bt: '12' },
  3001: { id: '3001', name: 'William Lee',       station: 'Station 3', c: '44', f: '31', b: '35', sl: '33', w: '38', i: '30', h: 'M/L', g: 'M',  bt: '10' },
  3002: { id: '3002', name: 'Patricia White',    station: 'Station 3', c: '42', f: '30', b: '34', sl: '32', w: '34', i: '29', h: 'M',   g: 'S',  bt: '8'  },
  3003: { id: '3003', name: 'Charles Harris',    station: 'Station 3', c: '46', f: '32', b: '37', sl: '34', w: '40', i: '32', h: 'L',   g: 'L',  bt: '11' },
  3004: { id: '3004', name: 'Barbara Clark',     station: 'Station 3', c: '40', f: '29', b: '32', sl: '31', w: '32', i: '28', h: 'S/M', g: 'S',  bt: '7'  },
  3005: { id: '3005', name: 'Thomas Lewis',      station: 'Station 3', c: '48', f: '33', b: '38', sl: '35', w: '42', i: '33', h: 'L/XL',g: 'L',  bt: '11' },
};

function coat(id, ff, mfgDate, mfr, model, seed, scanDaysAgo, inspection = '') {
  return rec(id, ff, 'coat', mfgDate, mfr, model, seed, scanDaysAgo, {
    inspection,
    measures: {
      measureChest: ff.c, measureFront: ff.f,
      measureBack: ff.b, measureSleeve: ff.sl,
    },
  });
}

function pants(id, ff, mfgDate, mfr, model, seed, scanDaysAgo, inspection = '') {
  return rec(id, ff, 'pants', mfgDate, mfr, model, seed, scanDaysAgo, {
    inspection,
    measures: { measureWaist: ff.w, measureInseam: ff.i },
  });
}

function helmet(id, ff, mfgDate, mfr, model, seed, scanDaysAgo) {
  return rec(id, ff, 'helmet', mfgDate, mfr, model, seed, scanDaysAgo, {
    measures: { measureHelmet: ff.h },
  });
}

function gloves(id, ff, mfgDate, mfr, model, seed, scanDaysAgo) {
  return rec(id, ff, 'gloves', mfgDate, mfr, model, seed, scanDaysAgo, {
    measures: { measureGloves: ff.g },
  });
}

function boots(id, ff, mfgDate, mfr, model, seed, scanDaysAgo) {
  return rec(id, ff, 'boots', mfgDate, mfr, model, seed, scanDaysAgo, {
    measures: { measureBoots: ff.bt },
  });
}

function hood(id, ff, mfgDate, mfr, model, seed, scanDaysAgo, inspection = '') {
  return rec(id, ff, 'hood', mfgDate, mfr, model, seed, scanDaysAgo, {
    inspection,
  });
}

// ── All 90 demo records ───────────────────────────────────────
// Manufacture dates engineered to produce all 4 status colors:
//   RED    (expired)    : mfg before June 2016   → ~10 records
//   ORANGE (retire soon): mfg June 2016–June 2017 → ~6 records
//   YELLOW (monitor)   : mfg June 2017–June 2018  → ~8 records
//   GREEN  (active)    : mfg after June 2018       → ~66 records
function buildDemoRecords() {
  const f = FF;
  return [
    // ── STATION 1 ───────────────────────────────────────────
    // John Mitchell — veteran, coat/pants are EXPIRED (red), newer accessories
    coat  ('gs-1001-01', f[1001], '2014-03-12', 'Globe Manufacturing', 'G-Xtreme',        10010, 680, 'OVERDUE FOR REPLACEMENT'),
    pants ('gs-1001-02', f[1001], '2014-03-12', 'Globe Manufacturing', 'G-Xtreme',        10011, 679, 'OVERDUE FOR REPLACEMENT'),
    helmet('gs-1001-03', f[1001], '2021-07-08', 'MSA Safety',          'Cairns 1044',     10012, 120),
    gloves('gs-1001-04', f[1001], '2022-02-14', 'Lion Protects',       'Liongrip Pro',    10013, 90),
    boots ('gs-1001-05', f[1001], '2020-09-22', 'Honeywell',           'Ranger FF',       10014, 180),
    hood  ('gs-1001-06', f[1001], '2019-11-05', 'Morning Pride',       'UltraHood',       10015, 200),

    // Sarah Johnson — mostly green, one orange hood
    coat  ('gs-1002-01', f[1002], '2020-04-18', 'Morning Pride',       'Triumph NFPA',    10020, 365),
    pants ('gs-1002-02', f[1002], '2020-04-18', 'Morning Pride',       'Triumph NFPA',    10021, 364),
    helmet('gs-1002-03', f[1002], '2022-08-30', 'MSA Safety',          'Cairns XR',       10022, 85),
    gloves('gs-1002-04', f[1002], '2023-03-11', 'Globe Manufacturing', 'G-Xtreme Glove',  10023, 60),
    boots ('gs-1002-05', f[1002], '2021-06-25', 'Honeywell',           'Crossfire WP',    10024, 150),
    hood  ('gs-1002-06', f[1002], '2016-08-14', 'Lion Protects',       'FlashHood Pro',   10025, 700, 'Scheduled for replacement Q3 2026'),

    // Mike Thompson — coat/pants YELLOW, hood RED
    coat  ('gs-1003-01', f[1003], '2017-07-20', 'Globe Manufacturing', 'Interceptor Plus',10030, 500, 'Monitor — replace within 2 years'),
    pants ('gs-1003-02', f[1003], '2017-07-20', 'Globe Manufacturing', 'Interceptor Plus',10031, 499),
    helmet('gs-1003-03', f[1003], '2019-04-09', 'MSA Safety',          'Cairns 1044',     10032, 400),
    gloves('gs-1003-04', f[1003], '2021-11-17', 'Honeywell',           'Firehunter Plus', 10033, 95),
    boots ('gs-1003-05', f[1003], '2018-08-03', 'Lion Protects',       'Terrain Pro',     10034, 350),
    hood  ('gs-1003-06', f[1003], '2015-05-27', 'Morning Pride',       'UltraHood',       10035, 720, 'OVERDUE — replace immediately'),

    // Chris Davis — coat RED, pants ORANGE, hood RED
    coat  ('gs-1004-01', f[1004], '2013-11-04', 'Morning Pride',       'Newera Pro',      10040, 730, 'OVERDUE — do not use in structural fire'),
    pants ('gs-1004-02', f[1004], '2016-10-19', 'Morning Pride',       'Newera Pro',      10041, 729, 'Critical — retires Oct 2026'),
    helmet('gs-1004-03', f[1004], '2020-05-13', 'MSA Safety',          'Cairns XR',       10042, 200),
    gloves('gs-1004-04', f[1004], '2022-09-28', 'Globe Manufacturing', 'G-Xtreme Glove',  10043, 75),
    boots ('gs-1004-05', f[1004], '2021-03-07', 'Honeywell',           'Ranger FF',       10044, 160),
    hood  ('gs-1004-06', f[1004], '2014-07-22', 'Lion Protects',       'FlashHood Pro',   10045, 725, 'OVERDUE — do not use'),

    // Amanda Wilson — all green, newest gear in Station 1
    coat  ('gs-1005-01', f[1005], '2022-01-10', 'Lion Protects',       'Neos',            10050, 300),
    pants ('gs-1005-02', f[1005], '2022-01-10', 'Lion Protects',       'Neos',            10051, 299),
    helmet('gs-1005-03', f[1005], '2023-06-05', 'MSA Safety',          'Cairns 1044',     10052, 50),
    gloves('gs-1005-04', f[1005], '2023-11-14', 'Lion Protects',       'Liongrip Pro',    10053, 30),
    boots ('gs-1005-05', f[1005], '2022-07-19', 'Honeywell',           'Crossfire WP',    10054, 200),
    hood  ('gs-1005-06', f[1005], '2020-09-30', 'Morning Pride',       'UltraHood',       10055, 310),

    // ── STATION 2 ───────────────────────────────────────────
    // Robert Garcia — full green set from 2021 station-wide purchase
    coat  ('gs-2001-01', f[2001], '2021-05-17', 'Globe Manufacturing', 'Veridian',        20010, 370),
    pants ('gs-2001-02', f[2001], '2021-05-17', 'Globe Manufacturing', 'Veridian',        20011, 369),
    helmet('gs-2001-03', f[2001], '2022-03-08', 'MSA Safety',          'Cairns XR',       20012, 120),
    gloves('gs-2001-04', f[2001], '2022-08-24', 'Honeywell',           'Firehunter Plus', 20013, 100),
    boots ('gs-2001-05', f[2001], '2021-11-02', 'Lion Protects',       'Terrain Pro',     20014, 180),
    hood  ('gs-2001-06', f[2001], '2021-05-17', 'Globe Manufacturing', 'G-Hood',          20015, 368),

    // Jennifer Martinez — newest firefighter, all 2023 gear
    coat  ('gs-2002-01', f[2002], '2023-02-20', 'Lion Protects',       'Lattice',         20020, 180),
    pants ('gs-2002-02', f[2002], '2023-02-20', 'Lion Protects',       'Lattice',         20021, 179),
    helmet('gs-2002-03', f[2002], '2023-04-11', 'MSA Safety',          'Cairns 1044',     20022, 150),
    gloves('gs-2002-04', f[2002], '2024-01-08', 'Globe Manufacturing', 'G-Xtreme Glove',  20023, 45),
    boots ('gs-2002-05', f[2002], '2023-08-16', 'Honeywell',           'Ranger FF',       20024, 90),
    hood  ('gs-2002-06', f[2002], '2023-02-20', 'Lion Protects',       'FlashHood Pro',   20025, 178),

    // David Anderson — coat/pants YELLOW, hood ORANGE
    coat  ('gs-2003-01', f[2003], '2017-09-14', 'Morning Pride',       'TechGen 2.0',     20030, 580, 'Schedule replacement 2027'),
    pants ('gs-2003-02', f[2003], '2017-09-14', 'Morning Pride',       'TechGen 2.0',     20031, 579),
    helmet('gs-2003-03', f[2003], '2021-02-22', 'MSA Safety',          'Cairns XR',       20032, 200),
    gloves('gs-2003-04', f[2003], '2020-06-30', 'Lion Protects',       'Liongrip Pro',    20033, 280),
    boots ('gs-2003-05', f[2003], '2019-10-14', 'Honeywell',           'Crossfire WP',    20034, 400),
    hood  ('gs-2003-06', f[2003], '2016-11-29', 'Morning Pride',       'UltraHood',       20035, 650, 'Retires Nov 2026 — order replacement'),

    // Lisa Taylor — all green, reliable mid-career firefighter
    coat  ('gs-2004-01', f[2004], '2019-03-07', 'Globe Manufacturing', 'G-Xtreme',        20040, 450),
    pants ('gs-2004-02', f[2004], '2019-03-07', 'Globe Manufacturing', 'G-Xtreme',        20041, 449),
    helmet('gs-2004-03', f[2004], '2021-09-19', 'MSA Safety',          'Cairns 1044',     20042, 170),
    gloves('gs-2004-04', f[2004], '2022-04-25', 'Honeywell',           'Firehunter Plus', 20043, 130),
    boots ('gs-2004-05', f[2004], '2020-12-01', 'Honeywell',           'Ranger FF',       20044, 240),
    hood  ('gs-2004-06', f[2004], '2018-07-10', 'Lion Protects',       'FlashHood Pro',   20045, 480),

    // James Brown — coat RED, pants ORANGE, hood RED
    coat  ('gs-2005-01', f[2005], '2015-08-23', 'Morning Pride',       'Triumph NFPA',    20050, 700, 'OVERDUE — immediate replacement required'),
    pants ('gs-2005-02', f[2005], '2016-08-04', 'Morning Pride',       'Triumph NFPA',    20051, 699, 'Critical — retires Aug 2026'),
    helmet('gs-2005-03', f[2005], '2020-10-15', 'MSA Safety',          'Cairns XR',       20052, 210),
    gloves('gs-2005-04', f[2005], '2021-04-20', 'Globe Manufacturing', 'G-Xtreme Glove',  20053, 190),
    boots ('gs-2005-05', f[2005], '2019-07-31', 'Honeywell',           'Crossfire WP',    20054, 380),
    hood  ('gs-2005-06', f[2005], '2015-12-09', 'Lion Protects',       'FlashHood Pro',   20055, 710, 'OVERDUE — do not use in service'),

    // ── STATION 3 ───────────────────────────────────────────
    // William Lee — coat/pants ORANGE, hood YELLOW
    coat  ('gs-3001-01', f[3001], '2016-09-18', 'Honeywell',           'Salisbury Pro-Wear', 30010, 660, 'Critical — retires Sep 2026'),
    pants ('gs-3001-02', f[3001], '2016-09-18', 'Honeywell',           'Salisbury Pro-Wear', 30011, 659),
    helmet('gs-3001-03', f[3001], '2020-03-26', 'MSA Safety',          'Cairns 1044',        30012, 310),
    gloves('gs-3001-04', f[3001], '2021-08-13', 'Lion Protects',       'Liongrip Pro',       30013, 175),
    boots ('gs-3001-05', f[3001], '2019-05-29', 'Honeywell',           'Ranger FF',          30014, 420),
    hood  ('gs-3001-06', f[3001], '2017-10-07', 'Globe Manufacturing', 'G-Hood',             30015, 550, 'Monitor — replace within 2 years'),

    // Patricia White — all green, efficient gear lifecycle
    coat  ('gs-3002-01', f[3002], '2020-02-14', 'Lion Protects',       'Armor',           30020, 395),
    pants ('gs-3002-02', f[3002], '2020-02-14', 'Lion Protects',       'Armor',           30021, 394),
    helmet('gs-3002-03', f[3002], '2021-10-08', 'MSA Safety',          'Cairns XR',       30022, 165),
    gloves('gs-3002-04', f[3002], '2022-06-16', 'Honeywell',           'Firehunter Plus', 30023, 115),
    boots ('gs-3002-05', f[3002], '2021-01-27', 'Lion Protects',       'Terrain Pro',     30024, 220),
    hood  ('gs-3002-06', f[3002], '2019-08-20', 'Morning Pride',       'UltraHood',       30025, 410),

    // Charles Harris — coat/pants YELLOW, hood YELLOW
    coat  ('gs-3003-01', f[3003], '2018-01-22', 'Globe Manufacturing', 'Interceptor Plus',30030, 520, 'Monitor — plan replacement 2027-2028'),
    pants ('gs-3003-02', f[3003], '2018-01-22', 'Globe Manufacturing', 'Interceptor Plus',30031, 519),
    helmet('gs-3003-03', f[3003], '2022-05-04', 'MSA Safety',          'Cairns 1044',     30032, 100),
    gloves('gs-3003-04', f[3003], '2023-01-30', 'Globe Manufacturing', 'G-Xtreme Glove',  30033, 65),
    boots ('gs-3003-05', f[3003], '2021-07-15', 'Honeywell',           'Crossfire WP',    30034, 160),
    hood  ('gs-3003-06', f[3003], '2017-06-11', 'Lion Protects',       'FlashHood Pro',   30035, 540, 'Monitor — retires Jun 2027'),

    // Barbara Clark — newest Station 3 member, all green 2021+
    coat  ('gs-3004-01', f[3004], '2021-04-06', 'Morning Pride',       'TechGen 2.0',     30040, 340),
    pants ('gs-3004-02', f[3004], '2021-04-06', 'Morning Pride',       'TechGen 2.0',     30041, 339),
    helmet('gs-3004-03', f[3004], '2023-07-18', 'MSA Safety',          'Cairns XR',       30042, 40),
    gloves('gs-3004-04', f[3004], '2023-09-04', 'Lion Protects',       'Liongrip Pro',    30043, 25),
    boots ('gs-3004-05', f[3004], '2022-11-21', 'Honeywell',           'Ranger FF',       30044, 120),
    hood  ('gs-3004-06', f[3004], '2021-04-06', 'Morning Pride',       'UltraHood',       30045, 338),

    // Thomas Lewis — coat RED, pants RED, hood RED (worst offender, needs full replacement)
    coat  ('gs-3005-01', f[3005], '2014-10-30', 'Honeywell',           'Salisbury Pro-Wear', 30050, 720, 'OVERDUE — flagged by safety officer'),
    pants ('gs-3005-02', f[3005], '2014-10-30', 'Honeywell',           'Salisbury Pro-Wear', 30051, 719, 'OVERDUE — flagged by safety officer'),
    helmet('gs-3005-03', f[3005], '2019-06-17', 'MSA Safety',          'Cairns 1044',        30052, 360),
    gloves('gs-3005-04', f[3005], '2020-11-03', 'Honeywell',           'Firehunter Plus',    30053, 250),
    boots ('gs-3005-05', f[3005], '2018-04-22', 'Lion Protects',       'Terrain Pro',        30054, 430),
    hood  ('gs-3005-06', f[3005], '2015-02-16', 'Globe Manufacturing', 'G-Hood',             30055, 715, 'OVERDUE — do not use in structural fire'),
  ];
}

// ── Seed demo data for a given UID ────────────────────────────
export async function seedDemoData(uid) {
  const metaRef = doc(db, 'users', uid, 'meta', 'demoSeed');
  const colRef  = collection(db, 'users', uid, 'gearRecords');

  // Check last seed time
  let shouldReseed = true;
  try {
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const seededAt = metaSnap.data().seededAt?.toMillis?.() ?? 0;
      if (Date.now() - seededAt < RESET_INTERVAL_MS) {
        shouldReseed = false;
      }
    }
  } catch { /* first run */ }

  if (!shouldReseed) return;

  // Delete all existing records
  try {
    const existing = await getDocs(colRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
  } catch { /* ignore */ }

  // Write all 90 records
  const records = buildDemoRecords();
  await Promise.all(
    records.map(r =>
      setDoc(doc(db, 'users', uid, 'gearRecords', r.id), {
        ...r,
        _savedAt: serverTimestamp(),
      })
    )
  );

  // Update seed timestamp
  await setDoc(metaRef, { seededAt: serverTimestamp() });
}
