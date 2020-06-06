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

  getWarDecks: (db, tag) => {
    return (
      db
        .from('war_decks')
        .select('*')
        .where('clan_tag', tag)
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