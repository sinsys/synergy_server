const getPlayerPercentages = (cards) => {
  let cardCount = cards.length;
  let legCount = 0;
  let goldCount = 0;
  cards.forEach(card => {
    if ( card.level >= card.maxLevel - 1 ) {
      legCount += 1;
      goldCount += 1;
    } else if ( card.level >= card.maxLevel - 2 ) {
      goldCount += 1;
    }
  });
  return [(legCount / cardCount), (goldCount / cardCount)];
};

const getPlayerTags = (clans) => {
  const playerTags = [];
  clans.forEach(clan => {
    clan.items.forEach(player => {
      playerTags.push(player.tag.split('#')[1]);
    });
  });
  return playerTags;
};

module.exports = {
  getPlayerPercentages,
  getPlayerTags
};