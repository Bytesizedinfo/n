/* Core: post on Ripple with a location after Saturday noon → Fatui Hospitality. */
module.exports = {
  name: 'core_fatui',
  expect: 'caught_fatui',
  calls: 'answer',
  steps: [
    { until: "s.chapter === 'sat_noon'", within: 20000 },
    { until: 's.now >= JC.time.parse("+1 12:30")', within: 20000 },
    { act: ['post', { loc: 'Liyue Harbor', text: 'the sea is warm today 🐟' }] },
  ],
};
