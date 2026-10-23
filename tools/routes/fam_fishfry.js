/* Family × Ops: beat Teucer's 2,047, feed the night shift twice, send the lullaby → Fish Fry. (S1b) */
module.exports = {
  name: 'fam_fishfry',
  expect: 'fishfry',
  calls: 'answer',
  steps: [
    { choose: { thread: 'mama', match: /^Not the driver/ } },
    { choose: { thread: 'mama', match: /Ekaterina, from my office/ } },
    { choose: { thread: 'mama', match: /Wangshu Inn/ } },
    { act: ['order', { rest: 'wanmin', to: 'northland', total: 688, items: [{ name: 'Pelmeni', qty: 40, price: 17 }] }] },
    { until: 's.flags.deal_childe', within: 7200 },
    { until: "s.chapter === 'sat_noon'", within: 7200 },
    { act: ['game_score', { score: 2310 }] },
    { until: "s.chapter === 'sat_night'", within: 7200 },
    { act: ['order', { rest: 'wanmin', to: 'northland', total: 688, items: [{ name: 'Pelmeni', qty: 40, price: 17 }] }] },
    { choose: { thread: 'teucer', match: /lullaby for Teucer/, within: 3600 } },
    { assert: 's.flags.beat_teucer && s.flags.lullaby_sent && (s.flags.ops_morale || 0) >= 2' },
  ],
};
