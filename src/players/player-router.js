// Router - projects
const { Router } = require('express');
const playerRouter = Router();
// Services
const PlayerService = require('./player-service');
const ClanService = require('../clan/clan-service');
const RemoteService = require('../remote/remote-service');

const { getPlayerPercentages } = require('../utils/player-utility');

const clans = {
  'Synergy': '809R8PG8',
  'Synergy Fusion': '8URQ0UR8',
  'Synergy Union': '8VVGG08G',
  'Synergy Rising': 'P9UY2Y0U',
  'Synergy Wrath': '9UG8LG0U',
  'Synergy Reborn': '9LYPC809'
};

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
  .route('/clan/:clan_tag')
  .get( (req, res, next) => {
    PlayerService.getClanPlayerStats(req.app.get('db'), req.params.clan_tag)
      .then(players => res.json(players));
  });

playerRouter
  .route('/remote/:clan_tag')
  .get( (req, res, next) => {
    PlayerService.getRemotePlayerTags(req.params.clan_tag)
      .then(playerTags => res.json(playerTags));
  });

playerRouter
  .route('/update')
  .get( (req, res, next) => {
    let clanTags = Object.keys(clans).map(clan => clans[clan]);
    RemoteService.getClansPlayers(clanTags)
      .then(results => Promise.all(results.map(response => response.json())))
      .then(allPlayers => {
        let playerTags = [];
        allPlayers.forEach(clan => {
          clan.items.forEach(player => {
            playerTags.push(player.tag.split('#')[1]);
          });
        });
        let current = 0;
        let completed = 0;
        const normalizedPlayers = [];
        const queue = setInterval(() => {
          RemoteService.getPlayer(playerTags[current])
            .then(response => response.json())
            .then(player => {
              let playerCardPercs = getPlayerPercentages(player.cards);
              let currentPlayer = {
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
              normalizedPlayers.push(currentPlayer);
              completed += 1;
              console.log(`Completed ${completed} of ${playerTags.length - 1}`);
              if ( completed >= playerTags.length - 1 ) {
                PlayerService.updatePlayers(req.app.get('db'), normalizedPlayers)
                  .then(response => res.json(response));
              };
            })
            .catch(err => {
              console.log(err);
              completed += 1;
              next();
            });
          current += 1;
          if ( current >= playerTags.length - 1 ) {
            clearInterval(queue);
          }
        }, 50);
      })
  });
// playerRouter
//   .route('/update')
//   .get( (req, res, next) => {
//     ClanService.getRemoteClans()
//         let count = playersArr.length; // 307
//         let completed = 0;
//         const queue = setInterval(() => {
//           PlayerService.getRemotePlayer(playersArr[count - 1])
//             .then(playerData => playerData.json())
//             .then(player => {
//               let playerCardPercs = getPlayerPercentages(player.cards);
//               let newPlayer = {
//                 id: player.tag.split('#')[1],
//                 tag: player.tag.split('#')[1],
//                 name: player.name,
//                 role: player.role,
//                 war_day_wins: player.warDayWins,
//                 legendary_perc: playerCardPercs[0],
//                 gold_perc: playerCardPercs[1],
//                 clan_tag: player.clan.tag.split('#')[1],
//                 exp_level: player.expLevel,
//                 trophies: player.trophies,
//                 best_trophies: player.bestTrophies,
//                 donations: player.donations,
//                 donations_received: player.donationsReceived,
//                 clan_cards_collected: player.clanCardsCollected,
//                 favorite_card: player.currentFavouriteCard.id,
//                 star_points: player.starPoints,
//                 war_streak: null
//               };
//               console.log(`Adding ${player.name}`);
//               PlayerService.addPlayer(req.app.get('db'), newPlayer)
//                 .then(() => {
//                   console.log(`Player ${player.name} added...`);
//                   completed += 1;
//                   console.log(`Count: ${count}`);
//                   console.log(`Completed: ${completed}`);
//                 })
//             })
//             .catch(err => {
//               completed+=1;
//               console.log(`An error occured: ${err}`);
//             });
//           count-=1;
//           if ( count <= 0 ) clearInterval(queue);
//         }, 100);
//         if ( completed >= playersArr.length - 1 ) {
//           return (
//             res.send("All players added")
//           );
//         }
//       });
//   });

playerRouter
  .route('/:player_tag')
  .get( (req, res, next) => {
    let response = { data: {}};
    // const knexInst = req.app.get('db');
    PlayerService.getRemotePlayer(req.params.player_tag)
      .then(playerData => playerData.json())
      .then(data => res.json(data))
  });

module.exports = playerRouter;