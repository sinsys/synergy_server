const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const util = require('util');
const WarService = {

  getRemotePlayer: (tag) => {
    let fetchUrl = `${BASE_URL}/players/%23${tag}`;
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

  getPlayers: (db) => {
    return (
      db
        .from('war_players')
        .select('tag')
        .distinctOn('tag')
    )
  },

  addPlayer: (db, player) => {
    let query = db.insert(player).into('players');
    query += ` ON CONFLICT (id) DO NOTHING`;
    return (
      db.raw(query)
    );
  }
  // DATABASE
  // getWars: (db, clanTag) => {
  //   return (
  //     db
  //       .from('wars')
  //       .select('*')
  //       .where('clan_tag', clanTag)
  //   );
  // },

  // getPlayers: (db, clanTag) => {
  //   return (
  //     db
  //       .from('war_players')
  //       .select('name')
  //       .where('clan_tag', clanTag)
  //   );
  // },

  // getCurrentWar: (clanTag) => {
  //   const fetchUrl = `${BASE_URL}/clans/%23${clanTag}/currentwar`;
  //   return (
  //     fetch(fetchUrl, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
  //         'Content-Type': 'application/json'
  //       }
  //     })
  //   )
  // },

  // addWars: (db, wars) => {
  //   let query = db.insert(wars).into('wars');
  //   query += ` ON CONFLICT (id) DO NOTHING;`;
  //   return (
  //     db.raw(query)
  //   );
  // },

  // addPlayers: (db, players) => {
  //   let query = db.insert(players).into('war_players');
  //   query += ` ON CONFLICT (id) DO NOTHING;`;
  //   return (
  //     db.raw(query)
  //   );
  // },

  // // REMOTE API
  // getRemoteWars: (clanTags) => {
  //   let fetchUrls = clanTags.map(tag => `${BASE_URL}/clans/%23${tag}/warlog`);
  //   const headers = {
  //     method: 'GET',
  //     headers: {
  //       'Authorization': 'Bearer ' + process.env.ROYALE_API_KEY,
  //       'Content-Type': 'application/json'
  //     }
  //   };
  //   return (
  //     Promise.all(fetchUrls.map(fetchUrl => fetch(fetchUrl, headers)))
  //   );
  // }
}

module.exports = WarService;