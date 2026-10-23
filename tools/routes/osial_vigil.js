/* Osial: find the protocol (Mail) and Ekaterina's 23:21 memo, hand both to Yelan, and spend her favour on the kids, not on
   Childe. Osial is stopped; Childe is not protected → Night Vigil. */
module.exports = {
  name: 'osial_vigil',
  expect: 'vigil',
  calls: 'answer',
  steps: [
    { act: ['attach_open', { name: 'osial_protocol.pdf' }] },
    { act: ['memo_play', { id: 'memo31' }] },
    { assert: 's.flags.saw_protocol && s.flags.memo31_heard' },
    { choose: { thread: 'yelan', match: /^Who is this\?/ }, within: 20000 },
    { until: "s.chapter === 'sat_night'", within: 20000 },
    { choose: { thread: 'yelan', match: /protocol and New Recording 31/ }, within: 3600 },
    { choose: { thread: 'yelan', match: /Watch over the kids/ }, within: 600 },
    { assert: 's.flags.leaked_yelan && s.flags.yelan_protects_kids && !s.flags.yelan_protects_childe' },
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { choose: { thread: 'signora', match: /^No\.$/ }, within: 3600 },
  ],
};
