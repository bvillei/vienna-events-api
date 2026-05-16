require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  let r;
  r = await pool.query(
    "UPDATE events SET latitude=48.2180, longitude=16.3648 WHERE location_name ILIKE '%Summerstage%'"
  );
  console.log('Summerstage updated:', r.rowCount, 'rows');
  r = await pool.query(
    "UPDATE events SET latitude=48.2033, longitude=16.3593 WHERE location_name ILIKE '%MuseumsQuartier%'"
  );
  console.log('MQ updated:', r.rowCount, 'rows');
  await pool.end();
}
run().catch(e => { console.error(e); process.exit(1); });
