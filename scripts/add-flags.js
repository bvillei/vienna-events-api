require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Venue/title substring → [is_outdoor, is_family_friendly]
// Match is case-insensitive on location_name or title_en
const RULES = [
  // Outdoor events
  { loc: 'Rathausplatz',          outdoor: true,  family: true  },
  { loc: 'Prater',                outdoor: true,  family: true  },
  { loc: 'Donauinsel',            outdoor: true,  family: true  },
  { loc: 'Stadtpark',             outdoor: true,  family: true  },
  { loc: 'Schönbrunn',            outdoor: true,  family: true  },
  { loc: 'Augarten',              outdoor: true,  family: false },
  { loc: 'Türkenschanzpark',      outdoor: true,  family: true  },
  { loc: 'Votivpark',             outdoor: true,  family: true  },
  { loc: 'Belvedere',             outdoor: true,  family: true  },
  { loc: 'Summerstage',           outdoor: true,  family: false },
  { loc: 'Badeschiff',            outdoor: true,  family: false },
  { loc: 'Heldenplatz',           outdoor: true,  family: true  },
  { loc: 'Volkstheater',          outdoor: false, family: false },
  { loc: 'Burgtheater',           outdoor: false, family: false },
  { loc: 'Volksoper',             outdoor: false, family: true  },
  { loc: 'Konzerthaus',           outdoor: false, family: false },
  { loc: 'MuseumsQuartier',       outdoor: false, family: true  },
  { loc: 'Various parks',         outdoor: true,  family: true  },
  { loc: 'Parks and open',        outdoor: true,  family: true  },
  { loc: 'Parks across',          outdoor: true,  family: true  },
  { loc: 'outdoor',               outdoor: true,  family: false },
  // Specific family-friendly titles
  { title: 'Film Festival',       outdoor: true,  family: true  },
  { title: 'Afrika Tage',         outdoor: true,  family: true  },
  { title: 'Donauinselfest',      outdoor: true,  family: true  },
  { title: 'Kino unter Sternen',  outdoor: true,  family: true  },
  { title: 'Lange Nacht',         outdoor: false, family: true  },
  { title: 'Kinderfilmfest',      outdoor: false, family: true  },
  { title: 'Open Air',            outdoor: true,  family: true  },
];

async function run() {
  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS is_outdoor        BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_family_friendly BOOLEAN NOT NULL DEFAULT FALSE
  `);
  console.log('Columns ensured.');

  const { rows: events } = await pool.query(
    `SELECT id, title_en, location_name FROM events`
  );
  console.log(`Processing ${events.length} events…`);

  for (const ev of events) {
    const loc   = (ev.location_name ?? '').toLowerCase();
    const title = (ev.title_en ?? '').toLowerCase();

    let outdoor = false;
    let family  = false;

    for (const rule of RULES) {
      if (rule.loc   && loc.includes(rule.loc.toLowerCase()))   { outdoor ||= rule.outdoor; family ||= rule.family; }
      if (rule.title && title.includes(rule.title.toLowerCase())){ outdoor ||= rule.outdoor; family ||= rule.family; }
    }

    await pool.query(
      `UPDATE events SET is_outdoor=$1, is_family_friendly=$2 WHERE id=$3`,
      [outdoor, family, ev.id]
    );
    const flags = [outdoor && '🌳 outdoor', family && '👨‍👩‍👧 family'].filter(Boolean).join(', ');
    console.log(`  ${ev.title_en.slice(0, 40).padEnd(40)} ${flags || '(none)'}`);
  }

  console.log('\nDone.');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
