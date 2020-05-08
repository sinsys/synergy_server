// Router - projects
const { Router } = require('express');
const playerRouter = Router();
// Services
const PlayerService = require('./player-service');
// const clans = {
//   'Synergy': '809R8PG8',
//   'Synergy Fusion': '8URQ0UR8',
//   'Synergy Union': '8VVGG08G',
//   'Synergy Rising': 'P9UY2Y0U',
//   'Synergy Wrath': '9UG8LG0U',
//   'Synergy Reborn': '9LYPC809'
// };

playerRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

playerRouter
  .route('/all')
  .get( (req, res, next) => {
    PlayerService.getPlayers(req.app.get('db'))
      .then(playersData => playersData.map(player => player.tag))
      .then(data => res.json(data));
  });

playerRouter
  .route('/:player_tag')
  .get( (req, res, next) => {
    let response = { data: {}};
    // const knexInst = req.app.get('db');
    PlayerService.getRemotePlayer(req.params.player_tag)
      .then(playerData => playerData.json())
      .then(data => res.json(data))
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

module.exports = playerRouter;