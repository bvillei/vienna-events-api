require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// lat/lng for known Vienna venues, matched on location_name substring
const COORDS = [
  { match: 'Rathausplatz',         lat: 48.2102, lng: 16.3572 },
  { match: 'Rathaus',              lat: 48.2102, lng: 16.3572 },
  { match: 'Volksprater',          lat: 48.2008, lng: 16.3958 },
  { match: 'Prater',               lat: 48.2008, lng: 16.3958 },
  { match: 'Stadtpark',            lat: 48.2047, lng: 16.3781 },
  { match: 'Schönbrunn',           lat: 48.1848, lng: 16.3123 },
  { match: 'Schoenbrunn',          lat: 48.1848, lng: 16.3123 },
  { match: 'Augarten',             lat: 48.2222, lng: 16.3769 },
  { match: 'Donauinsel',           lat: 48.2285, lng: 16.4147 },
  { match: 'Museumsquartier',      lat: 48.2032, lng: 16.3598 },
  { match: 'MQ ',                  lat: 48.2032, lng: 16.3598 },
  { match: 'Türkenschanzpark',     lat: 48.2337, lng: 16.3346 },
  { match: 'Votivpark',            lat: 48.2160, lng: 16.3587 },
  { match: 'Votivkirche',          lat: 48.2160, lng: 16.3587 },
  { match: 'Burgtheater',          lat: 48.2103, lng: 16.3611 },
  { match: 'Kunsthistorisches',    lat: 48.2035, lng: 16.3612 },
  { match: 'Secession',            lat: 48.1988, lng: 16.3643 },
  { match: 'WUK',                  lat: 48.2191, lng: 16.3549 },
  { match: 'Brunnenmarkt',         lat: 48.2063, lng: 16.3387 },
  { match: 'Arena Wien',           lat: 48.1770, lng: 16.3852 },
  { match: 'Konzerthaus',          lat: 48.2008, lng: 16.3826 },
  { match: 'Volksoper',            lat: 48.2241, lng: 16.3562 },
  { match: 'Volkstheater',         lat: 48.2051, lng: 16.3579 },
  { match: 'Narrenturm',           lat: 48.2168, lng: 16.3425 },
  { match: 'Jesuitenwiese',        lat: 48.2047, lng: 16.3989 },
  { match: 'Kahlenberg',           lat: 48.2734, lng: 16.3432 },
  { match: 'Stephansplatz',        lat: 48.2085, lng: 16.3731 },
  { match: 'Naschmarkt',           lat: 48.1985, lng: 16.3640 },
  { match: 'Karlsplatz',           lat: 48.2001, lng: 16.3701 },
  { match: 'Schwedenplatz',        lat: 48.2122, lng: 16.3774 },
  { match: 'Resselpark',           lat: 48.2002, lng: 16.3694 },
  { match: 'Burggarten',           lat: 48.2027, lng: 16.3669 },
  { match: 'Volksgarten',          lat: 48.2065, lng: 16.3617 },
  { match: 'Sigmund Freud Park',   lat: 48.2154, lng: 16.3604 },
  { match: 'Heldenplatz',          lat: 48.2060, lng: 16.3622 },
  { match: 'Belvedere',            lat: 48.1914, lng: 16.3808 },
  { match: 'Badeschiff',           lat: 48.2114, lng: 16.3757 },
  { match: 'Summerstage',          lat: 48.2153, lng: 16.3696 },
  { match: 'Schwarzenbergplatz',   lat: 48.2013, lng: 16.3774 },
  { match: 'Seestadt',             lat: 48.2312, lng: 16.4507 },
];

async function run() {
  // Add columns if not present
  await pool.query(`
    ALTER TABLE events
      ADD COLUMN IF NOT EXISTS latitude  FLOAT,
      ADD COLUMN IF NOT EXISTS longitude FLOAT
  `);
  console.log('Columns ensured.');

  const { rows: events } = await pool.query(
    'SELECT id, location_name FROM events WHERE latitude IS NULL'
  );
  console.log(`Updating ${events.length} events without coordinates…`);

  let updated = 0;
  for (const ev of events) {
    const name = ev.location_name || '';
    const match = COORDS.find(c => name.toLowerCase().includes(c.match.toLowerCase()));
    if (match) {
      await pool.query(
        'UPDATE events SET latitude=$1, longitude=$2 WHERE id=$3',
        [match.lat, match.lng, ev.id]
      );
      console.log(`  ✓ ${name} → ${match.lat}, ${match.lng}`);
      updated++;
    } else {
      console.log(`  ✗ No coords for: ${name}`);
    }
  }

  console.log(`\nDone. ${updated}/${events.length} events updated.`);
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
