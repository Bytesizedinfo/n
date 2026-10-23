/* S3 — Wangsheng Is Hiring: make Hu Tao suspicious (sus.ht ≥ 5) without Zhongli's contract. */
module.exports = {
  name: 'friends_wangsheng',
  expect: 'wangsheng',
  steps: [
    { until: "s.chapter === 'fri_night'", within: 60 },
    { choose: { thread: 'ht', match: /^Home\. In bed/ }, within: 1400 },
    { choose: { thread: 'ht', match: /Goodnight, Hu Tao/ }, within: 120 },
    { assert: 's.sus.ht >= 3' },
    { until: "s.chapter === 'sat_noon'", within: 4000 },
    { choose: { thread: 'ht', match: /lampshade/ }, within: 1200 },
    { choose: { thread: 'ht', match: /Who am I, then/ }, within: 3600 },
  ],
};
