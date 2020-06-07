const { getPlayerPercentages } = require('./player-utility');

const normalizeCards = (cards) => {
  const normalizedCards = [];
  cards.items.forEach(card => {
    const currentCard = {
      name: card.name,
      id: card.id,
      max_level: card.maxLevel,
      icon_url: card.iconUrls.medium
    };
    normalizedCards.push(currentCard);
  });
  return normalizedCards;
};

const normalizeClans = (clans, currentWars) => {
  const normalizedClans = [];
  clans.forEach((clan, i) => {
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
      avg_war_placement: null,
      badge_id: clan.badgeId,
      type: clan.type,
      war_status: currentWars[i].state,
      collection_end: typeof currentWars[i].collectionEndTime !== 'undefined'
        ? makeDate(currentWars[i].collectionEndTime)
        : null,
      war_end: typeof currentWars[i].warEndTime !== 'undefined'
        ? makeDate(currentWars[i].warEndTime)
        : null
    };
    clanData.member_tags = clan.memberList.map(member => member.tag.split('#')[1]);
    normalizedClans.push(clanData);
  });
  return normalizedClans;
};

const normalizePlayers = (players) => {
  const normalizedPlayers = [];
  players.forEach(player => {
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
  })
  return normalizedPlayers;
};

const normalizeWarDecks = (decks) => {

};
const normalizeWars = (wars) => {
  const normalizedWars = [];
  const normalizedWarPlayers = [];
  wars.forEach(clan => {
    clan.items.forEach(war => {
      const ourClan = war.standings.find(c => c.clan.tag === `#${clan.clanTag}`);
      const placement = war.standings.findIndex(c => c.clan.tag === `#${clan.clanTag}`);
      const newWar = {
        id: war.createdDate,
        season_id: war.seasonId,
        participants: war.participants.length,
        placement: placement,
        trophy_change: ourClan.trophyChange,
        wins: ourClan.clan.wins,
        battles_played: ourClan.clan.battlesPlayed,
        crowns: ourClan.clan.crowns,
        clan_tag: clan.clanTag
      };
      normalizedWars.push(newWar);
      // Get all player info into separate table
      war.participants.forEach(player => {
        const playerTag = player.tag.split('#')[1];
        const newPlayer = {
          id: war.createdDate + "_" + playerTag,
          war_id: war.createdDate,
          tag: playerTag,
          clan_tag: clan.clanTag,
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
  return (
    {
      normalizedWars: normalizedWars,
      normalizedPlayers: normalizedWarPlayers
    }
  );
};

const filterValidWarBattles = (battleLogs) => {
  let warDecks = [];
  let now = new Date();
  battleLogs.forEach(playerLog => {
    if (playerLog.length > 0) playerLog.forEach(battle => {
      let oneDay = 1000 * 60 * 60 * 24;
      let validBattle = now - makeDate(battle.battleTime) <= oneDay;
      if (battle.type === 'clanWarWarDay' && validBattle) {
        let warDeck = {
          id: battle.battleTime + "_" + battle.team[0].tag.split('#')[1],
          name: battle.team[0].name,
          tag: battle.team[0].tag,
          battle_time: makeDate(battle.battleTime),
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
    });
  });
  return warDecks;
};

const makeDate = (dateStr) => {
  let year = dateStr.slice(0,4);
  let month = dateStr.slice(4,6);
  let day = dateStr.slice(6,8);
  let hour = dateStr.slice(9,11);
  let min = dateStr.slice(11,13);
  let ss = dateStr.slice(13,15);
  let sss = dateStr.slice(16,19);
	let convertedDateStr = `${year}-${month}-${day}T${hour}:${min}:${ss}.${sss}Z`;
	return new Date(convertedDateStr);
};

module.exports = {
  normalizeCards,
  normalizeClans,
  normalizePlayers,
  normalizeWars,
  normalizeWarDecks,
  filterValidWarBattles,
  makeDate
};