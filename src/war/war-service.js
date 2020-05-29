const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const WarService = {

  // DATABASE
  getWars: (db, clanTag) => {
    return (
      db
        .from('wars')
        .select('*')
        .where('clan_tag', clanTag)
    );
  },

  getPlayers: (db, playerTags) => {
    return (
      db
        .from('war_players')
        .select('*')
        .whereIn('tag', playerTags)
    );
  },

  getAllWars: (db) => {
    return (
      db
        .from('wars')
        .select('*')
    );
  },

  updateWars: (db, wars) => {
    let query = db.insert(wars).into('wars');
    query += ` ON CONFLICT (id) DO NOTHING RETURNING *;`
    return (
      db.raw(query)
    );
  },

  updateWarPlayers: (db, warPlayers) => {
    let query = db.insert(warPlayers).into('war_players');
    query += ` ON CONFLICT (id) DO NOTHING RETURNING *;`;
    return (
      db.raw(query)
    );
  }
}

module.exports = WarService;