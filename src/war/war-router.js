// Router - projects
const { Router } = require('express');
const warRouter = Router();
const { BASE_URL } = require('../config');
// Services
const WarService = require('./war-service');

warRouter
  .route('/:clan_tag')
  .get( (req, res, next) => {
    // const knexInst = req.app.get('db');
    WarService.getRemoteWars(req.params.clan_tag)
      .then(res => res.json())
      .then(warData => {
        res.json(warData);
      })
  });

warRouter
  .route('/:clan_tag/update')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    const clanTag = req.params.clan_tag;
    WarService.getRemoteWars(clanTag)
      .then(response => response.json())
      .then(warlog => {
        const warsArr = warlog.items;
        const normalizeWars = [];
        const normalizePlayers = [];
        warsArr.forEach(war => {
          const ourClan = war.standings.find(clan => clan.clan.tag === `#${clanTag}`);
          const placement = war.standings.findIndex(clan => clan.clan.tag === `#${clanTag}`);
          const newWar = {
            id: war.createdDate,
            season_id: war.seasonId,
            participants: war.participants.length,
            placement: placement,
            trophy_change: ourClan.trophyChange,
            wins: ourClan.clan.wins,
            battles_played: ourClan.clan.battlesPlayed,
            crowns: ourClan.clan.crowns,
            clan_tag: clanTag
          };
          normalizeWars.push(newWar);
          
          // Get all player info into separate table
          war.participants.forEach(player => {
            let playerTag = player.tag.split('#')[1];
            const newPlayer = {
              id: war.createdDate + "_" + playerTag,
              war_id: war.createdDate,
              tag: playerTag,
              name: player.name,
              cards_earned: player.cardsEarned,
              battles_played: player.battlesPlayed,
              wins: player.wins,
              collection_day_battles_played: player.collectionDayBattlesPlayed,
              number_of_battles: player.numberOfBattles
            };
            normalizePlayers.push(newPlayer);
          });
          
        });


        WarService.addWars(
          knexInst,
          normalizeWars
        )
          .then((warRows) => {
            WarService.addPlayers(
              knexInst,
              normalizePlayers
            )
              .then((playerRows) => {
                let response = {
                  success: true,
                  warRows: warRows.rowCount,
                  playerRowCount: playerRows.rowCount
                };
                return res.status(201).send(response);
              })
          });
      });
  });

module.exports = warRouter;