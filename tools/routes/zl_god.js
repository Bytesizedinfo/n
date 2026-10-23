/* Zhongli × Osial: sign his contract, then send Signora the real code anyway → The God of Contracts. */
module.exports = {
  name: 'zl_god',
  expect: 'godofcontracts',
  calls: 'answer',
  auto: ['zl'],
  steps: [
    { until: 's.flags.zl_contract', within: 20000 },
    { act: ['note_open', { id: 'n_osial' }] },
    { until: "s.chapter === 'sun_night'", within: 30000 },
    { choose: { thread: 'signora', match: /OSL-0918/ }, within: 3600 },
  ],
};
