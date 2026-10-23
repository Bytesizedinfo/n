/* Zhongli: be kind to him all weekend, play "for xiansheng (don't send)" and keep it → Unspoken. */
module.exports = {
  name: 'zl_unspoken',
  expect: 'unspoken',
  calls: 'answer',
  auto: ['zl'],
  steps: [
    { until: 's.flags.zl_contract', within: 20000 },
    { act: ['memo_play', { id: 'memo_xiansheng' }] },
    { until: "s.chapter === 'sun_night'", within: 30000 },
    { choose: { thread: 'signora', match: /^No\.$/ }, within: 3600 },
    { assert: 's.flags.memo_zl_heard && !s.flags.memo_zl_sent && (s.aff.zl || 0) >= 3' },
  ],
};
