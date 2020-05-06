CREATE TABLE players (
  id TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  role TEXT NOT NULL,
  war_day_wins INTEGER NOT NULL,
  legendary_perc FLOAT,
  gold_perc FLOAT
);

CREATE TABLE war_players (
  id TEXT PRIMARY KEY,
  war_id TEXT REFERENCES wars(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  name TEXT NOT NULL,
  cards_earned INTEGER NOT NULL,
  battles_played INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  collection_day_battles_played INTEGER NOT NULL,
  number_of_battles INTEGER NOT NULL
);