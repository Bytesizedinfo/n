/* Ops × Osial: pelmeni for the night shift every night, a kind word for the frozen aquarium, then let the Liyue Branch
   sabotage Osial at the deadline → Comrade Tartaglia. */
module.exports = {
  name: 'ops_comrades',
  expect: 'comrades',
  calls: 'answer',
  steps: [
    { act: ['order', { rest: 'wanmin', to: 'northland', total: 688, items: [{ name: 'Pelmeni', qty: 40, price: 17 }] }] },
    { choose: { thread: 'ops', match: /^Warm tea/ }, within: 3600 },
    { until: "s.chapter === 'sat_night'", within: 20000 },
    { act: ['order', { rest: 'wanmin', to: 'northland', total: 688, items: [{ name: 'Pelmeni', qty: 40, price: 17 }] }] },
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { act: ['order', { rest: 'wanmin', to: 'northland', total: 688, items: [{ name: 'Pelmeni', qty: 40, price: 17 }] }] },
    { until: '(s.flags.ops_morale || 0) >= 3', within: 600 },
    { choose: { thread: 'signora', match: /Liyue Branch has a better idea/ }, within: 3600 },
    { assert: 's.flags.ops_sabotage' },
  ],
};
