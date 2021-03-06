// Router - projects
const { Router } = require('express');
const warDeckRouter = Router();

// Services
const WarDeckService = require('./war-deck-service');

warDeckRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

warDeckRouter
  .route('/all')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    WarDeckService.getAllWarDecks(knexInst)
      .then(response => {
        res.json(response)
      });
  });
  
warDeckRouter
  .route('/:clan_tag')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    WarDeckService.getClanWarDecks(knexInst, req.params.clan_tag)
      .then(response => {
        res.json(response);
      });
  });

module.exports = warDeckRouter;