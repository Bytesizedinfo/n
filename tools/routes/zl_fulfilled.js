/* Zhongli: uncover Rex Lapis and make him say it on Yujing Terrace, never send the memo, and tell Childe on Monday →
   Contract Fulfilled. */
module.exports = {
  name: 'zl_fulfilled',
  expect: 'fulfilled',
  calls: 'answer',
  auto: ['zl'],
  steps: [
    { act: ['mail_open', { id: 'mail_invoice' }] },
    { act: ['visit', { url: 'https://archives.ly/photos/1926-founding', host: 'archives.ly' }] },
    { choose: { thread: 'zl', match: /^Rex Lapis\.$/ }, within: 30000 },
    { until: 's.flags.zl_confessed', within: 3600 },
    { until: "s.chapter === 'sun_night'", within: 30000 },
    { choose: { thread: 'signora', match: /^No\.$/ }, within: 3600 },
    { until: 's.flags.told_childe_morax', within: 30000 },
  ],
};
