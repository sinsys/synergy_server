const PlayerService = require('./players/player-service');
const ClanService = require('./clan/clan-service');
const WarService = require('./war/war-service');
const CardsService = require('./cards/cards-service');
const RemoteService = require('./remote/remote-service');

const knex = require('knex');
const { DATABASE_URL } = require('./config.js');
const { getPlayerTags } = require('./utils/player-utility');

const {
  normalizeCards,
  normalizeClans,
  normalizePlayers,
  normalizeWars
} = require('./utils/remote-utility');

const update = () => {

  // Database Connection
  let knexInst = knex({
    client: 'pg',
    connection: DATABASE_URL
  });

  console.log('Fetching clans...');
  ClanService.getClanTags(knexInst)
    .then(response => {
      let clanTags = response.map(clanTag => clanTag.tag);
      console.log('Clan tags acquired...');
      console.log('Fetching remote data for cards, clans, players, and wars...');
      Promise.all([
        RemoteService.getCards(),
        RemoteService.getClans(clanTags),
        RemoteService.getClansPlayers(clanTags),
        RemoteService.getClansWarlogs(clanTags)
      ])
      .then(([cardsRes, clansRes, playersRes, warlogsRes]) => {
        Promise.all([
          cardsRes.json(),
          Promise.all(clansRes.map(clan => clan.json())),
          Promise.all(playersRes.map(members => members.json())),
          Promise.all(warlogsRes.map(warlog => warlog.json()))
        ])
          .then(([cards, clans, players, warlogs]) => {
            console.log(`Remote data acquired...`);
            // Need to add appropriate clan tags to each warlog
            warlogs.map((warlog, i) => {
              warlog.clanTag = clanTags[i];
            });
            // Use helper function to normalize all war participants and wars
            const warData = normalizeWars(warlogs);
            // Establish an object with all normalized data
            const normalizedData = {
              cards: normalizeCards(cards),
              clans: normalizeClans(clans),
              wars: warData.normalizedWars,
              warPlayers: warData.normalizedPlayers,
              players
            };
            /* Need ~300 fetches for all players
            Making queries synchronous to avoid rate-limiting from API */
            const playerTags = getPlayerTags(players);
            let current = 0;
            let completed = 0;
            const rawPlayers = [];
            console.log(`Fetching remote additional ${playerTags.length} player(s) data...`);
            const queue = setInterval(() => {
              if ( current < playerTags.length ) {
                RemoteService.getPlayer(playerTags[current])
                  .then(response => response.json())
                  .then(player => {
                    rawPlayers.push(player);
                    completed += 1;
                  });
                current += 1;
              };
              if ( completed >= playerTags.length ) {
                clearInterval(queue);
                normalizedData.players = normalizePlayers(rawPlayers);
                Promise.all([
                  CardsService.updateCards(knexInst, normalizedData.cards),
                  ClanService.updateClans(knexInst, normalizedData.clans),
                  WarService.updateWars(knexInst, normalizedData.wars),
                  WarService.updateWarPlayers(knexInst, normalizedData.warPlayers),
                  PlayerService.updatePlayers(knexInst, normalizedData.players)
                ])
                  .then(results => {
                    let rows = results.map(result => result.rowCount);
                    let response = `
                    Updated: 
                    * ${rows[0]} Cards
                    * ${rows[1]} Clans
                    * ${rows[2]} Wars
                    * ${rows[3]} War Participants
                    * ${rows[4]} Players`;
                    console.log(response);
                    knexInst.destroy();
                  });
              }
            }, 50);
          })
      });
    });
};

update();