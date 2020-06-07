const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const WarDeckService = {

  // DATABASE
  getClans: (db) => {
    return (
      db
        .from('clans')
        .select('*')
    );
  },

  getClanWarDecks: (db, tag) => {
    return (
      db
        .from('war_decks')
        .select('*')
        .where('clan_tag', tag)
        .andWhere('battle_time', '>=', db.raw(`now() - (?*'1 HOUR'::INTERVAL)`, [24]))
    );
  },

  getAllWarDecks: (db) => {
    return (
      db
        .from('war_decks')
        .select('*')
        .where('battle_time', '>=', db.raw(`now() - (?*'1 HOUR'::INTERVAL)`, [24]))
    );
  },
  
  // Insert all war decks
  updateWarDecks: (db, decks) => {
    let query = db.insert(decks).into('war_decks');
    query += ` ON CONFLICT (id) DO NOTHING`;
    return (
      db.raw(query)
    );
  }
}

module.exports = WarDeckService;