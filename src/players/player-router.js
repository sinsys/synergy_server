// Router - projects
const { Router } = require('express');
const playerRouter = Router();
// Services
const PlayerService = require('./player-service');
const { getPlayerPercentages } = require('../utils/player-utility');

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
  .route('/update')
  .get( (req, res, next) => {
    PlayerService.getPlayers(req.app.get('db'))
      .then(players => players.map(player => player.tag))
      .then(playersArr => {
        let count = playersArr.length; // 307
        let completed = 0;
        const queue = setInterval(() => {
          PlayerService.getRemotePlayer(playersArr[count - 1])
            .then(playerData => playerData.json())
            .then(player => {
              let playerCardPercs = getPlayerPercentages(player.cards);
              let newPlayer = {
                id: player.tag.split('#')[1],
                tag: player.tag.split('#')[1],
                name: player.name,
                role: player.role,
                war_day_wins: player.warDayWins,
                legendary_perc: playerCardPercs[0],
                gold_perc: playerCardPercs[1],
                clan_tag: player.clan.tag.split('#')[1],
                exp_level: player.expLevel,
                trophies: player.trophies,
                best_trophies: player.bestTrophies,
                donations: player.donations,
                donations_received: player.donationsReceived,
                clan_cards_collected: player.clanCardsCollected,
                favorite_card: player.currentFavouriteCard.id,
                star_points: player.starPoints,
                war_streak: null
              };
              console.log(`Adding ${player.name}`);
              PlayerService.addPlayer(req.app.get('db'), newPlayer)
                .then(() => {
                  console.log(`Player ${player.name} added...`);
                  completed += 1;
                  console.log(`Count: ${count}`);
                  console.log(`Completed: ${completed}`);
                })
            })
            .catch(err => {
              completed+=1;
              console.log(`An error occured: ${err}`);
            });
          count-=1;
          if ( count <= 0 ) clearInterval(queue);
        }, 100);
        if ( completed >= playersArr.length - 1 ) {
          return (
            res.send("All players added")
          );
        }
      });
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