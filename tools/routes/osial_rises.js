/* Osial: read the authorization code in Notes, then send Signora the real code at the Sunday deadline → Osial Rises. */
module.exports = {
  name: 'osial_rises',
  expect: 'osial',
  calls: 'answer',
  steps: [
    { act: ['note_open', { id: 'n_osial' }] },
    { assert: 's.flags.code_seen' },
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { choose: { thread: 'signora', match: /OSL-0918/ }, within: 3600 },
    { assert: 's.flags.osial_sent' },
  ],
};
