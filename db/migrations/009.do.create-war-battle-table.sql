CREATE TABLE war_decks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  battle_time TIMESTAMPTZ NOT NULL,
  king_tower_hit_points INTEGER DEFAULT 0,
  princess_tower_hit_points_1 INTEGER DEFAULT 0,
  princess_tower_hit_points_2 INTEGER DEFAULT 0,
  clan_tag TEXT NOT NULL,
  clan_name TEXT NOT NULL,
  deck INTEGER ARRAY NOT NULL,
  opponent_deck INTEGER ARRAY NOT NULL,
  crowns INTEGER NOT NULL,
  opponent_crowns INTEGER NOT NULL,
  won BOOLEAN NOT NULL
);