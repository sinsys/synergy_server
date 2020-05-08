CREATE TABLE clans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  description TEXT NOT NULL,
  clan_score INTEGER NOT NULL,
  clan_war_trophies INTEGER NOT NULL,
  location TEXT NOT NULL,
  required_trophies INTEGER NOT NULL,
  donations_per_week INTEGER NOT NULL,
  members INTEGER NOT NULL,
  avg_war_placement FLOAT
);

ALTER TABLE players
  ADD COLUMN clan_tag TEXT REFERENCES clans(id) ON DELETE SET NULL,
  ADD COLUMN exp_level INTEGER,
  ADD COLUMN trophies INTEGER NOT NULL,
  ADD COLUMN best_trophies INTEGER NOT NULL,
  ADD COLUMN donations INTEGER,
  ADD COLUMN donations_received INTEGER,
  ADD COLUMN clan_cards_collected INTEGER,
  ADD COLUMN favorite_card INTEGER REFERENCES cards(id) ON DELETE SET NULL,
  ADD COLUMN star_points INTEGER,
  ADD COLUMN war_streak INTEGER DEFAULT 0;

