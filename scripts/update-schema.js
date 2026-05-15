require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

pool.query(`
  ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;
  ALTER TABLE events ADD CONSTRAINT events_category_check
    CHECK (category IN ('festival','music','film','dance','theater','sport','literature','community'));
`).then(() => { console.log('Constraint updated!'); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); process.exit(1); });
