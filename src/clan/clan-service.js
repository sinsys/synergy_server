const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const ClanService = {

  // DATABASE
  getClans: (db) => {
    return (
      db
        .from('clans')
        .select('*')
    );
  },

  addClans: (db, clans) => {
    let query = db.insert(clans).into('clans');
    query += ` ON CONFLICT (id) DO NOTHING;`;
    return (
      db.raw(query)
    );
  },

  // REMOTE API
  getRemoteClans: (clanTags) => {
    let fetchUrls = clanTags.map(tag => `${BASE_URL}/clans/%23${tag}`);
    const headers = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    return (
      Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, headers)))
    );
  }
}

module.exports = ClanService;