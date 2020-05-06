CREATE TABLE wars (
  id TEXT PRIMARY KEY,
  season_id INTEGER NOT NULL,
  participants INTEGER NOT NULL,
  placement INTEGER NOT NULL,
  trophy_change INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  battles_played INTEGER NOT NULL,
  crowns INTEGER NOT NULL,
  clan_tag TEXT NOT NULL
);