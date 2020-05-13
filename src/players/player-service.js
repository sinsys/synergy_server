const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const RemoteService = require('../remote/remote-service');

const PlayerService = {

  getRemotePlayer: (tag) => {
    let fetchUrl = `${BASE_URL}/players/%23${tag}`;
    const headers = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + ROYALE_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    return (
      fetch(fetchUrl, headers)
    );
  },
  
  getPlayersStats: (db, playerTags) => {
    return (
      db
        .from('players')
        .select('*')
        .whereIn('tag', playerTags)
    );
  },

  // Upsert all players
  updatePlayers: (db, players) => {
    let query = db.insert(players).into('players');
    query += ` ON CONFLICT (id) DO UPDATE SET
      role=EXCLUDED.role,
      war_day_wins=EXCLUDED.war_day_wins,
      legendary_perc=EXCLUDED.legendary_perc,
      gold_perc=EXCLUDED.gold_perc,
      clan_tag=EXCLUDED.clan_tag,
      exp_level=EXCLUDED.exp_level,
      trophies=EXCLUDED.trophies,
      best_trophies=EXCLUDED.best_trophies,
      donations=EXCLUDED.donations,
      donations_received=EXCLUDED.donations_received,
      clan_cards_collected=EXCLUDED.clan_cards_collected,
      favorite_card=EXCLUDED.favorite_card,
      star_points=EXCLUDED.star_points,
      war_streak=EXCLUDED.war_streak,
      name=EXCLUDED.name
    RETURNING *;`;
    return (
      db.raw(query)
    );
  }

}

module.exports = PlayerService;