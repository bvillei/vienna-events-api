const service = require('./events.service');

async function list(req, res, next) {
  try {
    const { category, from_date, to_date, free_type, search, sort } = req.query;
    const events = await service.getEvents({ category, from_date, to_date, free_type, search, sort });
    res.json(events);
  } catch (err) { next(err); }
}

async function detail(req, res, next) {
  try {
    const event = await service.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
}

async function categories(req, res, next) {
  try {
    const cats = await service.getCategories();
    res.json(cats);
  } catch (err) { next(err); }
}

module.exports = { list, detail, categories };
