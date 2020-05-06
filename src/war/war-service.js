const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const util = require('util');
const WarService = {

  // DATABASE
  getWars: (db) => {
    return (
      db
        .from('cards')
        .select('*')
    );
  },

  addWars: (db, wars) => {
    let query = db.insert(wars).into('wars');
    query += ` ON CONFLICT (id) DO NOTHING;`;
    return (
      db.raw(query)
    );
  },

  addPlayers: (db, players) => {
    let query = db.insert(players).into('war_players');
    query += ` ON CONFLICT (id) DO NOTHING;`;
    return (
      db.raw(query)
    );
  },

  // REMOTE API
  getRemoteWars: (clanTag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${clanTag}/warlog`;
    return (
      fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
          'Content-Type': 'application/json'
        }
      })
    );
  }
}

module.exports = WarService;