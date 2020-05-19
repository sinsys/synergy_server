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

const normalizeClans = (clans) => {
  const normalizedClans = [];
  clans.forEach(clan => {
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

module.exports = {
  normalizeCards,
  normalizeClans,
  normalizePlayers,
  normalizeWars
};