/* Osial: no leak, no freeze, nobody told. Stall Signora at the deadline; the frame-up goes through → The Scapegoat. */
module.exports = {
  name: 'osial_scapegoat',
  expect: 'scapegoat',
  calls: 'answer',
  steps: [
    { until: "s.chapter === 'sun_night'", within: 20000 },
    { choose: { thread: 'signora', match: /until midnight/ }, within: 3600 },
    { assert: 's.flags.osial_stalled && !s.flags.osial_sent' },
  ],
};
