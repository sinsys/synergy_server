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

module.exports = {
  getPlayerPercentages
};