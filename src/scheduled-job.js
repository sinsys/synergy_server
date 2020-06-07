const PlayerService = require('./players/player-service');
const ClanService = require('./clan/clan-service');
const WarService = require('./war/war-service');
const CardsService = require('./cards/cards-service');
const RemoteService = require('./remote/remote-service');
const WarDeckService = require('./war/war-deck-service');
const knex = require('knex');
const { DATABASE_URL } = require('./config.js');
const { getPlayerTags } = require('./utils/player-utility');

const {
  normalizeCards,
  normalizeClans,
  normalizePlayers,
  normalizeWars,
  filterValidWarBattles,
  makeDate
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
      console.log('Fetching remote data for cards, clans, players, wars, and war states...');
      Promise.all([
        RemoteService.getCards(),
        RemoteService.getClans(clanTags),
        RemoteService.getClansPlayers(clanTags),
        RemoteService.getClansWarlogs(clanTags),
        RemoteService.getCurrentClanWars(clanTags)
      ])
      .then(([cardsRes, clansRes, playersRes, warlogsRes, currentWarsRes]) => {
        Promise.all([
          cardsRes.json(),
          Promise.all(clansRes.map(clan => clan.json())),
          Promise.all(playersRes.map(members => members.json())),
          Promise.all(warlogsRes.map(warlog => warlog.json())),
          Promise.all(currentWarsRes.map(currentWar => currentWar.json()))
        ])
          .then(([cards, clans, players, warlogs, currentWars]) => {
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
              clans: normalizeClans(clans, currentWars),
              wars: warData.normalizedWars,
              warPlayers: warData.normalizedPlayers,
              players,
              warDecks: []
            };

            /* Fetching theoretically ~300 fetches for all player's battle logs
            Making queries synchronous to avoid rate-limiting from API 
            Need to get tags for all players who've completed at least one war battle */

            const warPlayerTags = [];
            currentWars.forEach(war => {
              if ( war.state === 'warDay' ) {
                war.participants.map(player => {
                  if ( player.battlesPlayed > 0 ) warPlayerTags.push(player.tag.split('#')[1]);
                })
              }
            });

            let warCurrent = 0;
            let warCompleted = 0;
            const rawWarDecks = [];

            console.log(`Fetching remote additional ${warPlayerTags.length} war player(s) data...`);
            const warQueue = setInterval(() => {

              if ( warCurrent < warPlayerTags.length ) {
                RemoteService.getPlayerBattleLogs(warPlayerTags[warCurrent])
                  .then(response => response.json())
                  .then(playerLogs => {
                    rawWarDecks.push(playerLogs);
                    warCompleted += 1;
                  });
                warCurrent += 1;
              };

              if ( warCompleted >= warPlayerTags.length ) {
                console.log(`War deck data acquired...`);
                clearInterval(warQueue);
                normalizedData.warDecks = filterValidWarBattles(rawWarDecks);

                // Sequence players
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
                    console.log(`Player data acquired...`);
                    clearInterval(queue);
                    normalizedData.players = normalizePlayers(rawPlayers);
                    Promise.all([
                      CardsService.updateCards(knexInst, normalizedData.cards),
                      ClanService.updateClans(knexInst, normalizedData.clans),
                      WarService.updateWars(knexInst, normalizedData.wars),
                      WarService.updateWarPlayers(knexInst, normalizedData.warPlayers),
                      PlayerService.updatePlayers(knexInst, normalizedData.players),
                      WarDeckService.updateWarDecks(knexInst, normalizedData.warDecks)
                    ])
                      .then(results => {
                        let rows = results.map(result => result.rowCount);
                        let response = `
                        Updated: 
                        * ${rows[0]} Cards
                        * ${rows[1]} Clans
                        * ${rows[2]} Wars
                        * ${rows[3]} War Participants
                        * ${rows[4]} Players
                        * ${rows[5]} War Battles`;
                        console.log(response);
                        knexInst.destroy();
                      });
                  }
                }, 50);
              }
            }, 50);

          })
      });
    });
};

update();