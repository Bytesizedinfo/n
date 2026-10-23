/* Family: answer Teucer's Saturday-morning FaceTime with the camera on → Stranger on the Screen. (S1b) */
module.exports = {
  name: 'fam_facetime',
  expect: 'facetime',
  calls: 'answer',
  steps: [
    { choose: { thread: 'mama', match: /^Not the driver/ } },
    { choose: { thread: 'mama', match: /Ekaterina, from my office/ } },
    { choose: { thread: 'mama', match: /Wangshu Inn/ } },
    { answer: 'unknown', within: 7200 },
    { callChoose: { match: /Who is this/ } },
    { callChoose: { match: /Until Monday/ } },
    { until: 's.flags.deal_childe' },
    { answer: 'teucer', within: 7200 },
    { callChoose: { match: /Turn the camera on/ } },
  ],
};
