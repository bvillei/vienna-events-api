const db = require('../../config/db');

async function getEvents({ category, from_date, to_date, free_type, search, is_outdoor, is_family_friendly, sort = 'date' } = {}) {
  const conditions = [];
  const values = [];
  let i = 1;

  if (category) {
    conditions.push(`e.category = $${i++}`);
    values.push(category);
  }

  if (free_type && free_type !== 'all') {
    conditions.push(`e.free_type = $${i++}`);
    values.push(free_type);
  }

  // Include event if its date range overlaps with the requested range
  if (from_date) {
    conditions.push(`(e.end_date IS NULL OR e.end_date >= $${i++})`);
    values.push(from_date);
  }

  if (to_date) {
    conditions.push(`e.start_date <= $${i++}`);
    values.push(to_date);
  }

  if (is_outdoor === 'true') {
    conditions.push(`e.is_outdoor = TRUE`);
  }

  if (is_family_friendly === 'true') {
    conditions.push(`e.is_family_friendly = TRUE`);
  }

  if (search) {
    conditions.push(`(e.title_en ILIKE $${i} OR e.title_de ILIKE $${i} OR e.description_en ILIKE $${i} OR e.description_de ILIKE $${i})`);
    values.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy = 'ORDER BY e.start_date ASC';

  const query = `
    SELECT
      e.id, e.title_en, e.title_de, e.description_en, e.description_de,
      e.category, e.location_name, e.location_address, e.district,
      e.start_date, e.end_date, e.start_time, e.end_time,
      e.recurrence, e.recurrence_note,
      e.free_type, e.registration_note_en, e.registration_note_de,
      e.external_url, e.image_url,
      e.latitude, e.longitude,
      e.is_outdoor, e.is_family_friendly
    FROM events e
    ${where}
    ${orderBy}
  `;

  const { rows } = await db.query(query, values);
  return rows;
}

async function getEventById(id) {
  const { rows } = await db.query(
    `SELECT * FROM events WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function getCategories() {
  const { rows } = await db.query(
    `SELECT DISTINCT category FROM events ORDER BY category`
  );
  return rows.map(r => r.category);
}

module.exports = { getEvents, getEventById, getCategories };
