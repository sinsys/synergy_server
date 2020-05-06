// Router - cards
const { Router } = require('express');
const cardsRouter = Router();
const { BASE_URL } = require('../config');

// Services
const CardsService = require('./cards-service');

cardsRouter
  .route('/')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    CardsService.getCards(knexInst)
      .then(cards => res.json(cards))
  });

cardsRouter
  .route('/update')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    CardsService.truncateCards(knexInst)
      .then(() => {
        CardsService.getRemoteCards()
          .then(response => response.json())
          .then(cards => {
            const cardsArr = cards.items;
            const normalizeCards = [];
            cardsArr.forEach(card => {
              const newCard = {
                name: card.name,
                id: card.id,
                max_level: card.maxLevel,
                icon_url: card.iconUrls.medium
              };
              normalizeCards.push(newCard);
            });
    
            CardsService.addCards(
              req.app.get('db'),
              normalizeCards
            )
              .then(() => res.json(cards))
          })
      })
  });

module.exports = cardsRouter;