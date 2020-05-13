// Router - cards
const { Router } = require('express');
const cardsRouter = Router();
const RemoteService = require('../remote/remote-service');
const { BASE_URL } = require('../config');

// Services
const CardsService = require('./cards-service');

// Return all cards from database
cardsRouter
  .route('/')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    CardsService.getCards(knexInst)
      .then(cards => res.json(cards))
  });

// Upsert all cards in db from remote API
cardsRouter
  .route('/update')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    RemoteService.getCards()
      .then(response => response.json())
      .then(cards => {
        const normalizeCards = [];
        cards.items.forEach(card => {
          const currentCard = {
            name: card.name,
            id: card.id,
            max_level: card.maxLevel,
            icon_url: card.iconUrls.medium
          };
          normalizeCards.push(currentCard);
        });
        CardsService.updateCards(knexInst, normalizeCards)
          .then(response => {
            res.json(response);
          });
      });
  });

module.exports = cardsRouter;