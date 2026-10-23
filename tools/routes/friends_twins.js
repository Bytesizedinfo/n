/* S3 — Brother, Sister (finale): find the map in Photos, send it to Lumine on Saturday morning, let her guard the kids on
   Sunday. gave_abyss_notes ∧ clue_abyss ∧ lumine_guard. */
module.exports = {
  name: 'friends_twins',
  expect: 'twins',
  steps: [
    { until: "s.chapter === 'fri_night'", within: 60 },
    { act: ['photo_view', { id: 'p_abyss_map' }] },
    { assert: 's.flags.clue_abyss' },
    { until: "s.chapter === 'sat_dawn'", within: 4000 },
    { choose: { thread: 'lumine', match: /Send the map/ }, within: 1200 },
    { choose: { thread: 'lumine', match: /^My master/ }, within: 200 },
    { choose: { thread: 'lumine', match: /14th point/ }, within: 200 },
    { assert: 's.flags.gave_abyss_notes' },
    { until: "s.chapter === 'sun_rite'", within: 9000 },
    { choose: { thread: 'lumine', match: /^Do it, comrade/ }, within: 1200 },
    { assert: 's.flags.lumine_guard' },
    { answer: 'wangsheng', within: 20000 },
  ],
};
