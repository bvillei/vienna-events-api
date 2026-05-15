-- Vienna Free Events – schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS events (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en              TEXT NOT NULL,
  title_de              TEXT,
  description_en        TEXT,
  description_de        TEXT,
  category              TEXT NOT NULL CHECK (category IN ('festival','music','film','dance','theater','sport','literature')),
  location_name         TEXT NOT NULL,
  location_address      TEXT,
  district              SMALLINT CHECK (district BETWEEN 1 AND 23),
  start_date            DATE NOT NULL,
  end_date              DATE,
  start_time            TIME,
  end_time              TIME,
  recurrence            TEXT CHECK (recurrence IN ('daily','weekly')),
  recurrence_note       TEXT,
  free_type             TEXT NOT NULL DEFAULT 'free' CHECK (free_type IN ('free','free_with_registration')),
  registration_note_en  TEXT,
  registration_note_de  TEXT,
  external_url          TEXT,
  image_url             TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_category   ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_free_type  ON events(free_type);
