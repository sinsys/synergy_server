const CardsService = {

  // Return all cards from database
  getCards: (db) => {
    return (
      db
        .from('cards')
        .select('*')
    );
  },

  // Upsert all cards
  updateCards: (db, cards) => {
    let query = db.insert(cards).into('cards');
    query += ` ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name,
      max_level=EXCLUDED.max_level,
      icon_url=EXCLUDED.icon_url
    RETURNING *;`;
    return (
      db.raw(query)
    );
  }
  
}

module.exports = CardsService;