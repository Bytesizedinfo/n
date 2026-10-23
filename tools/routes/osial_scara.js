/* Scaramouche: answer him like a stranger every time → The Balladeer's Gossip. */
module.exports = {
  name: 'osial_scara',
  expect: 'caught_scara',
  calls: 'answer',
  auto: { scara: 'sus' },
  steps: [
    { until: 's.sus.scara >= 8', within: 30000 },
  ],
};
