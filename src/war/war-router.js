// Router - projects
const { Router } = require('express');
const warRouter = Router();
const { BASE_URL } = require('../config');
// Services
const WarService = require('./war-service');
const clans = {
  'Synergy': '809R8PG8',
  'Synergy Fusion': '8URQ0UR8',
  'Synergy Union': '8VVGG08G',
  'Synergy Rising': 'P9UY2Y0U',
  'Synergy Wrath': '9UG8LG0U',
  'Synergy Reborn': '9LYPC809'
};

warRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

warRouter
  .route('/update')
  .get( (req, res, next) => {
    let clanTagList = Object.keys(clans).map(clan => clans[clan]);
    WarService.getRemoteWars(clanTagList)
      .then(results => Promise.all(results.map(response => response.json())))
      .then(allClanWarlogData => {
        let response = {
          warsInserted: 0,
          playersInserted: 0
        };
        let normalizeWars = [];
        let normalizePlayers = [];
        allClanWarlogData.map((warlog, i) => {
          warlog.items.map(war => {
            const clanTag = clanTagList[i];
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
                clan_tag: clanTag,
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
        });
        const knexInst = req.app.get('db');
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
      })
  });

warRouter
  .route('/:clan_tag')
  .get( (req, res, next) => {
    let response = { data: {}};
    // const knexInst = req.app.get('db');
    WarService.getWars(req.app.get('db'), req.params.clan_tag)
      .then(warData => {
        response.data.warData = warData;
        WarService.getPlayers(req.app.get('db'), req.params.clan_tag)
          .then(playerData => {
            response.data.playerData = playerData;
            res.json(response);
          });
      });
  });

warRouter
  .route('/:clan_tag/players')
  .get( (req, res, next) => {
    WarService.getPlayerTags(req.app.get('db'), req.params.clan_tag)
      .then(playerData => {
        res.json(playerData);
      })
  });

warRouter
  .route('/:clan_tag/current')
  .get( (req, res, next) => {
    WarService.getCurrentWar(req.params.clan_tag)
      .then(res => res.json())
      .then(currentWarData => {
        res.json(currentWarData);
      })
  });


    // const clanTag = req.params.clan_tag;
    // WarService.getRemoteWars(clanTag)
    //   .then(response => response.json())
    //   .then(warlog => {
    //     const warsArr = warlog.items;
    //     const normalizeWars = [];
    //     const normalizePlayers = [];
    //     warsArr.forEach(war => {
    //       const ourClan = war.standings.find(clan => clan.clan.tag === `#${clanTag}`);
    //       const placement = war.standings.findIndex(clan => clan.clan.tag === `#${clanTag}`);
    //       const newWar = {
    //         id: war.createdDate,
    //         season_id: war.seasonId,
    //         participants: war.participants.length,
    //         placement: placement,
    //         clan_tag: clanTag,
    //         trophy_change: ourClan.trophyChange,
    //         wins: ourClan.clan.wins,
    //         battles_played: ourClan.clan.battlesPlayed,
    //         crowns: ourClan.clan.crowns,
    //         clan_tag: clanTag
    //       };
    //       normalizeWars.push(newWar);
          
    //       // Get all player info into separate table
    //       war.participants.forEach(player => {
    //         let playerTag = player.tag.split('#')[1];
    //         const newPlayer = {
    //           id: war.createdDate + "_" + playerTag,
    //           war_id: war.createdDate,
    //           tag: playerTag,
    //           name: player.name,
    //           cards_earned: player.cardsEarned,
    //           battles_played: player.battlesPlayed,
    //           wins: player.wins,
    //           collection_day_battles_played: player.collectionDayBattlesPlayed,
    //           number_of_battles: player.numberOfBattles
    //         };
    //         normalizePlayers.push(newPlayer);
    //       });
          
    //     });

    //     WarService.addWars(
    //       knexInst,
    //       normalizeWars
    //     )
    //       .then((warRows) => {
    //         WarService.addPlayers(
    //           knexInst,
    //           normalizePlayers
    //         )
    //           .then((playerRows) => {
    //             let response = {
    //               success: true,
    //               warRows: warRows.rowCount,
    //               playerRowCount: playerRows.rowCount
    //             };
    //             return res.status(201).send(response);
    //           })
    //       });
    //   });
  // });

module.exports = warRouter;