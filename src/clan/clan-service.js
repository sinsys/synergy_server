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

  getClanTags: (db) => {
    return (
      db
        .from('clans')
        .select('tag')
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
  getRemoteClan: (clanTag) => {
    let fetchUrl = `${BASE_URL}/clans/%23${clanTag}`;
    const headers = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    return (
      fetch(fetchUrl, headers)
    );
  },

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
  },

  // Upsert all clans
  updateClans: (db, clans) => {
    let query = db.insert(clans).into('clans');
    query += ` ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name,
      tag=EXCLUDED.tag,
      description=EXCLUDED.description,
      clan_score=EXCLUDED.clan_score,
      clan_war_trophies=EXCLUDED.clan_war_trophies,
      location=EXCLUDED.location,
      required_trophies=EXCLUDED.required_trophies,
      donations_per_week=EXCLUDED.donations_per_week,
      members=EXCLUDED.members,
      avg_war_placement=EXCLUDED.avg_war_placement
    RETURNING *;`;
    return (
      db.raw(query)
    );
  }
}

module.exports = ClanService;