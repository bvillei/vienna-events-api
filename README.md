# 🎪 Vienna Free Events — API

REST API for [vienna-free-events.netlify.app](https://vienna-free-events.netlify.app).

**Live API:** https://vienna-events-api.onrender.com

## Endpoints

```
GET /api/v1/events                  List events (filter & sort)
GET /api/v1/events/categories       All available categories
GET /api/v1/events/:id              Single event
```

### Query Parameters for `GET /api/v1/events`

| Param | Example | Description |
|---|---|---|
| `category` | `music` | Filter by category |
| `from_date` | `2026-07-01` | Events active from this date |
| `to_date` | `2026-07-31` | Events active until this date |
| `free_type` | `free` | `free` or `free_with_registration` |
| `search` | `philharmonic` | Keyword search in title & description |

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (Supabase) — shared with wtfsc-api
- **Hosting:** Render.com (free tier)

## Local Development

```bash
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run seed           # seed 15 real Vienna events
npm run dev
```
