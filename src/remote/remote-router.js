// Router - projects
const { Router } = require('express');
const remoteRouter = Router();
const RemoteService = require('./remote-service');
const ClanService = require('../clan/clan-service');
const WarDeckService = require('../war/war-deck-service');
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
        let players = [];
        currentWar.participants.map(player => {
          if(player.battlesPlayed > 0) {
            players.push(player.tag.split('#')[1]);
          }
        })
        RemoteService.getPlayersBattleLogs(players)
          .then(results => Promise.all(results.map(result => result.json())))
          .then(battleLogs => {
            let warDecks = [];
            battleLogs.forEach(playerLog => {
              playerLog.forEach(battle => {
                let oneDay = 1000 * 60 * 60 * 24;
                let battleTimeDiff = new Date() - makeWarDate(battle.battleTime);
                
                if (
                  battle.type === 'clanWarWarDay' && 
                  battleTimeDiff <= oneDay
                ) {
                  let warDeck = {
                    id: battle.battleTime + "_" + battle.team[0].tag.split('#')[1],
                    name: battle.team[0].name,
                    tag: battle.team[0].tag,
                    battle_time: makeWarDate(battle.battleTime),
                    king_tower_hit_points: battle.team[0].kingTowerHitPoints,
                    clan_tag: battle.team[0].clan.tag.split('#')[1],
                    clan_name: battle.team[0].clan.name,
                    deck: battle.team[0].cards.map(card => card.id).sort((a,b) => a - b),
                    opponent_deck: battle.opponent[0].cards.map(card => card.id).sort((a,b) => a - b),
                    crowns: battle.team[0].crowns,
                    opponent_crowns: battle.opponent[0].crowns,
                    won: battle.team[0].crowns > battle.opponent[0].crowns
                  };
                  if (typeof battle.team[0].princessTowersHitPoints !== 'undefined') {
                    if (battle.team[0].princessTowersHitPoints.length === 2) {
                      warDeck.princess_tower_hit_points_1 = battle.team[0].princessTowersHitPoints[0];
                      warDeck.princess_tower_hit_points_2 = battle.team[0].princessTowersHitPoints[1];
                    } else if (battle.team[0].princessTowersHitPoints.length === 1 ) {
                      warDeck.princess_tower_hit_points_1 = battle.team[0].princessTowersHitPoints[0];
                      warDeck.princess_tower_hit_points_2 = 0;
                    } else {
                      warDeck.princess_tower_hit_points_1 = 0;
                      warDeck.princess_tower_hit_points_2 = 0;
                    }
                  }
                  warDecks.push(warDeck);
                };
              })
            });
            const knexInst = req.app.get('db');
            WarDeckService.updateWarDecks(knexInst, warDecks)
              .then(rows => res.json(rows.rowCount))
          });
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });
const makeWarDate = (dateStr) => {
  let stripDate = dateStr;
  let year = stripDate.slice(0,4);
  let month = stripDate.slice(4,6);
  let day = stripDate.slice(6,8);
  let hour = stripDate.slice(9,11);
  let min = stripDate.slice(11,13);
  let ss = stripDate.slice(13,15);
  let sss = stripDate.slice(16,19);
  let convertedDateStr = `${year}-${month}-${day}T${hour}:${min}:${ss}.${sss}Z`;
  return new Date(convertedDateStr);
}

module.exports = remoteRouter;