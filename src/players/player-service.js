const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
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

  getRemotePlayerTags: (clanTag) => {
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
        .then(response => response.json())
        .then(data => {
          let tags = [];
          data.memberList.forEach(member => {
            tags.push(member.tag.split('#')[1]);
          });
          return tags;
        })
    );
  },
  
  getClanPlayerStats: (db, clanTag) => {
    return (
      db
        .from('players')
        .select('*')
        .where('clan_tag', clanTag)
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