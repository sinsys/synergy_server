// Router - projects
const { Router } = require('express');
const clanRouter = Router();
const { BASE_URL } = require('../config');
// Services
const ClanService = require('./clan-service');
const clans = {
  'Synergy': '809R8PG8',
  'Synergy Fusion': '8URQ0UR8',
  'Synergy Union': '8VVGG08G',
  'Synergy Rising': 'P9UY2Y0U',
  'Synergy Wrath': '9UG8LG0U',
  'Synergy Reborn': '9LYPC809'
};

clanRouter
  .route('/')
  .get( (req, res, next) => {
    res.send('Active');
  });

clanRouter
  .route('/remote/:clan_tag')
  .get( (req, res, next) => {
    ClanService.getRemoteClan(req.params.clan_tag)
      .then(results => results.json())
      .then(data => res.json(data))
  });

clanRouter
  .route('/update')
  .get( (req, res, next) => {
    let clanTagList = Object.keys(clans).map(clan => clans[clan]);
    const knexInst = req.app.get('db');
    ClanService.getRemoteClans(clanTagList)
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
      //   let response = {
      //     clansInserted: 0
      //   };
      //   let normalizeClans = [];
      //   let currentMembers = [];
        // allClanData.forEach(clan => {
        //   let clanData = {
        //     id: clan.tag.split('#')[1],
        //     name: clan.name,
        //     tag: clan.tag.split('#')[1],
        //     description: clan.description,
        //     clan_score: clan.clanScore,
        //     clan_war_trophies: clan.clanWarTrophies,
        //     location: clan.location.name,
        //     required_trophies: clan.requiredTrophies,
        //     donations_per_week: clan.donationsPerWeek,
        //     members: clan.members,
        //     avg_war_placement: null
        //   };
        //   normalizeClans.push(clanData);
      //     clan.memberList.forEach(member => {
      //       currentMembers.push(member.tag.split('#')[1]);
      //     });
      //   });
      //   const knexInst = req.app.get('db');
      //   ClanService.addClans(
      //     knexInst,
      //     normalizeClans
      //   )
      //     .then((clanRows) => {
      //       let response = {
      //         success: true,
      //         clanRows: clanRows.rowCount
      //       };
      //       return res.status(201).send(response);
      //     });
      // })

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

module.exports = clanRouter;