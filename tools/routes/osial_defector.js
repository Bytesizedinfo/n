/* Osial × Family: kids safe (Ekaterina + Wangshu Inn), Ekaterina warned on Friday, the full hand to Yelan with Childe's
   name kept out of it, card frozen → The Eleventh Resigns. */
module.exports = {
  name: 'osial_defector',
  expect: 'defector',
  calls: 'answer',
  steps: [
    { choose: { thread: 'mama', match: /^Not the driver/ } },
    { choose: { thread: 'mama', match: /Ekaterina, from my office/ } },
    { choose: { thread: 'mama', match: /Wangshu Inn/ } },
    { choose: { thread: 'ekat', match: /^Don't go home tonight/ }, within: 3600 },
    { act: ['attach_open', { name: 'osial_protocol.pdf' }] },
    { act: ['memo_play', { id: 'memo31' }] },
    { choose: { thread: 'yelan', match: /^Who is this\?/ }, within: 20000 },
    { until: "s.chapter === 'sat_night'", within: 20000 },
    { choose: { thread: 'yelan', match: /protocol and New Recording 31/ }, within: 3600 },
    { choose: { thread: 'yelan', match: /Keep his name out of it/ }, within: 600 },
    { run: 'JC.bank.freeze(true)' },
    { assert: 's.flags.card_frozen && s.flags.ekat_warned && s.flags.yelan_protects_childe' },
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { choose: { thread: 'signora', match: /^No\.$/ }, within: 3600 },
  ],
};
