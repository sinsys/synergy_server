const { BASE_URL, ROYALE_API_KEY } = require('../config');
const fetch = require('node-fetch');
const CardsService = {

  // DATABASE
  getCards: (db) => {
    return (
      db
        .from('cards')
        .select('*')
    );
  },

  truncateCards: (db) => {
    return (
      db.raw(`TRUNCATE TABLE cards`)
    );
  },

  addCards: (db, cards) => {
    return (
      db
        .insert(cards)
        .into('cards')
        .returning('*')
    );
  },

  // REMOTE API
  getRemoteCards: () => {
    let fetchUrl = BASE_URL + "/cards";
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

module.exports = CardsService;