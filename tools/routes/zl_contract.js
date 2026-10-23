/* Zhongli: sign his contract Saturday morning, tell him about Osial on the terrace (so he amends the Gnosis contract and
   Childe isn't recalled), send him "for xiansheng", and let the founder answer Signora → A Contract Renewed. */
module.exports = {
  name: 'zl_contract',
  expect: 'contract',
  calls: 'answer',
  auto: ['zl'],
  steps: [
    { act: ['attach_open', { name: 'osial_protocol.pdf' }] },
    { act: ['mail_open', { id: 'mail_invoice' }] },
    { act: ['visit', { url: 'https://archives.ly/photos/1926-founding', host: 'archives.ly' }] },
    { assert: 's.flags.saw_protocol && s.flags.knows_morax' },
    { until: 's.flags.zl_contract', within: 20000 },
    { choose: { thread: 'zl', match: /called Osial/ }, within: 20000 },
    { until: 's.flags.zl_knows_osial', within: 600 },
    { until: 's.flags.zl_amended', within: 20000 },
    { act: ['memo_share', { id: 'memo_xiansheng', to: 'zl' }] },
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { choose: { thread: 'signora', match: /Ask the founder/ }, within: 3600 },
    { until: '(s.aff.zl || 0) >= 6', within: 20000 },
  ],
};
