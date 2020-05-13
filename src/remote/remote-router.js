// Router - projects
const { Router } = require('express');
const remoteRouter = Router();
const RemoteService = require('./remote-service');
const ClanService = require('../clan/clan-service');

remoteRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

remoteRouter
  .route('/clan/all')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    ClanService.getClanTags(knexInst)
      .then(clanList => clanList.map(clan => clan.tag))
      .then(clanTags => {
        RemoteService.getClans(clanTags)
          .then(response => Promise.all(response.map(clan => clan.json())))
          .then(clans => {
            res.json(clans);
          })
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

remoteRouter
  .route('/clan/:clan_tag')
  .get( (req, res, next) => {
    RemoteService.getClan(req.params.clan_tag)
      .then(response => response.json())
      .then(clanData => {
        res.json(clanData);
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

remoteRouter
  .route('/player/:player_tag')
  .get( (req, res, next) => {
    RemoteService.getPlayer(req.params.player_tag)
      .then(response => response.json())
      .then(player => {
        res.json(player);
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

remoteRouter
  .route('/warlog/:clan_tag')
  .get( (req, res, next) => {
    RemoteService.getClanWarlogs(req.params.clan_tag)
      .then(response => response.json())
      .then(warlogs => {
        res.json(warlogs);
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

remoteRouter
  .route('/warlog/:clan_tag/current')
  .get( (req, res, next) => {
    RemoteService.getCurrentWarlog(req.params.clan_tag)
      .then(response => response.json())
      .then(currentWar => {
        res.json(currentWar);
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

module.exports = remoteRouter;