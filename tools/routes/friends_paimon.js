/* S3 — Emergency Food: Paimon's Wanmin Go orders on Childe's account pass ℳ20,000. */
module.exports = {
  name: 'friends_paimon',
  expect: 'paimon',
  steps: [
    { until: "s.chapter === 'fri_night'", within: 60 },
    { choose: { thread: 'paimon', match: /Hotpot's on me/ }, within: 400 },
    { choose: { thread: 'paimon', match: /Fine\. Ordering/ }, within: 120 },
    { act: ['order', { rest: 'wanmin', to: 'paimon', total: 688, items: [{ name: 'Hotpot Set for Four', qty: 1, price: 688 }] }] },
    { wait: 60 },
    { act: ['order', { rest: 'wanmin', to: 'paimon', total: 4980 }] },
    { act: ['order', { rest: 'wanmin', to: 'paimon', total: 4980 }] },
    { act: ['order', { rest: 'wanmin', to: 'paimon', total: 4980 }] },
    { assert: 's.flags.paimon_fed >= 4' },
    { wait: 60 },
    { act: ['order', { rest: 'xinyue', to: 'paimon', total: 4980 }] },
    { assert: 's.flags.paimon_total >= 20000' },
  ],
};
