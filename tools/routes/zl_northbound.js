/* Zhongli: a warm weekend and his secret uncovered, but Osial never reaches him, so Childe is still recalled. Send
   "for xiansheng", and on Monday tell Childe who Zhongli really is → Northbound. */
module.exports = {
  name: 'zl_northbound',
  expect: 'northbound',
  calls: 'answer',
  auto: ['zl'],
  steps: [
    { act: ['mail_open', { id: 'mail_invoice' }] },
    { act: ['visit', { url: 'https://archives.ly/photos/1926-founding', host: 'archives.ly' }] },
    { until: 's.flags.zl_contract', within: 20000 },
    { until: "s.chapter === 'sun_night'", within: 30000 },
    { act: ['memo_share', { id: 'memo_xiansheng', to: 'zl' }] },
    { choose: { thread: 'signora', match: /^No\.$/ }, within: 3600 },
    { until: 's.flags.told_childe_morax', within: 30000 },
  ],
};
