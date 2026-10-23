/* S3 — Third-Round Knockout: accept Beidou's rematch (ch3), then take Maps directions to the Alcor on Saturday night. */
module.exports = {
  name: 'friends_rematch',
  expect: 'rematch',
  steps: [
    { until: "s.chapter === 'sat_noon'", within: 4000 },
    { choose: { thread: 'beidou', match: /In\. Obviously/ }, within: 1200 },
    { assert: 's.flags.beidou_accepted' },
    { until: "s.chapter === 'sat_night'", within: 2000 },
    { choose: { thread: 'beidou', match: /On my way/ }, within: 400 },
    { act: ['directions', { place: 'alcor' }] },
  ],
};
