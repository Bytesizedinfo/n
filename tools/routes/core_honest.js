/* Core: report the phone as a found item in Harbor Ride → Return to Sender. */
module.exports = {
  name: 'core_honest',
  expect: 'honest',
  steps: [
    { until: "s.chapter === 'fri_night'", within: 60 },
    { act: ['ride_report_lost', {}] },
  ],
};
