// Router - projects
const { Router } = require('express');
const warRouter = Router();

// Services
const WarService = require('./war-service');
const ClanService = require('../clan/clan-service');
const RemoteService = require('../remote/remote-service');

// const clans = {
//   'Synergy': '809R8PG8',
//   'Synergy Fusion': '8URQ0UR8',
//   'Synergy Union': '8VVGG08G',
//   'Synergy Rising': 'P9UY2Y0U',
//   'Synergy Wrath': '9UG8LG0U',
//   'Synergy Reborn': '9LYPC809'
// };

warRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

warRouter
  .route('/update')
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    ClanService.getClanTags(knexInst)
      .then(response => response.map(clan => clan.tag))
      .then(clanTags => {
        RemoteService.getClansWarlogs(clanTags)
          .then(results => Promise.all(results.map(response => response.json())))
          .then(warlogs => {
            let normalizedWars = [];
            let normalizedWarPlayers = [];
            warlogs.forEach((clan, i) => {
              clan.items.forEach(war => {
                const clanTag = clanTags[i];
                const ourClan = war.standings.find(c => c.clan.tag === `#${clanTag}`);
                const placement = war.standings.findIndex(c => c.clan.tag === `#${clanTag}`);
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
                normalizedWars.push(newWar);

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
                  normalizedWarPlayers.push(newPlayer);
                });
              });
            });
            const response = {};
            WarService.updateWars(knexInst, normalizedWars)
              .then(result => response.wars = result)
              .then(() => {
                WarService.updateWarPlayers(knexInst, normalizedWarPlayers)
                  .then(result => {
                    response.players = result;
                    return (
                      res.json(response)
                    );
                  });
              });
          });
      });
  });

warRouter
  .route('/:clan_tag')
  .get( (req, res, next) => {
    let response = { data: {}};
    const knexInst = req.app.get('db');
    RemoteService.getClan(req.params.clan_tag)
      .then(response => response.json())
      .then(clanData => {
        let playerTags = [];
        clanData.memberList.forEach(member => playerTags.push(member.tag.split('#')[1]));
        // console.log(playerTags);
        Promise.all([
          WarService.getPlayers(knexInst, playerTags),
          WarService.getWars(knexInst, req.params.clan_tag)
        ])
          .then(warData => {
            let response = {
              players: warData[0],
              wars: warData[1]
            };
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


module.exports = warRouter;