/* S3 — Where the Abyss Looks Back: answer Skirk at 03:00 on Sunday night, then take Maps directions to the Chasm. */
module.exports = {
  name: 'friends_abyss',
  expect: 'abyss',
  steps: [
    { until: "s.chapter === 'sun_night'", within: 9000 },
    { choose: { thread: 'skirk', match: /^Master\?|I'm listening/ }, within: 1500 },
    { until: 's.flags.skirk_answered && s.flags.clue_abyss', within: 120 },
    { choose: { thread: 'skirk', match: /I.m coming/ }, within: 200 },
    { act: ['directions', { place: 'chasm' }] },
  ],
};
