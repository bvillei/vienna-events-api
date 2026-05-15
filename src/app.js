const express = require('express');
const cors = require('cors');
const eventsRouter = require('./modules/events/events.router');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'vienna-events-api' }));
app.use('/api/v1/events', eventsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
