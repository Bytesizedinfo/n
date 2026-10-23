/* Family: tell Tonia the truth on the plane, keep both kids safe → What Big Brother Does. (S1b) */
module.exports = {
  name: 'fam_tonia',
  expect: 'tonia',
  calls: 'answer',
  steps: [
    { choose: { thread: 'mama', match: /^Not the driver/ } },
    { choose: { thread: 'mama', match: /Ekaterina, from my office/ } },
    { choose: { thread: 'mama', match: /Wangshu Inn/ } },
    { choose: { thread: 'tonia', match: /I don't sell toys/ } },
    { choose: { thread: 'tonia', match: /not getting anywhere near you/ } },
    { until: 's.flags.deal_childe', within: 7200 },
    { assert: 's.flags.told_tonia && s.flags.ekat_pickup && s.flags.kids_wangshu' },
  ],
};
