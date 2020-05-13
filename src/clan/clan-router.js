// Router - projects
const { Router } = require('express');
const clanRouter = Router();

// Services
const ClanService = require('./clan-service');
const RemoteService = require('../remote/remote-service');

clanRouter
  .route('/')
  .get( (req, res, next) => {
    ClanService.getClans(req.app.get('db'))
      .then(clanData => {
        res.json(clanData);
      })
  });

clanRouter
  .route('/update')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    ClanService.getClanTags(knexInst)
      .then(response => response.map(clan => clan.tag))
      .then(clanTags => {
        RemoteService.getClans(clanTags)
          .then(results => Promise.all(results.map(response => response.json())))
          .then(allClanData => {
            const normalizeClans = [];
            allClanData.forEach(clan => {
              let clanData = {
                id: clan.tag.split('#')[1],
                name: clan.name,
                tag: clan.tag.split('#')[1],
                description: clan.description,
                clan_score: clan.clanScore,
                clan_war_trophies: clan.clanWarTrophies,
                location: clan.location.name,
                required_trophies: clan.requiredTrophies,
                donations_per_week: clan.donationsPerWeek,
                members: clan.members,
                avg_war_placement: null
              };
              normalizeClans.push(clanData);
            });
            ClanService.updateClans(knexInst, normalizeClans)
              .then(response => res.json(response));
          });
        });
  });
    

module.exports = clanRouter;