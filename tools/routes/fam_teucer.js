/* Family: a safe pickup, the lie kept lovingly, the toy-shop tour with Zhongli as manager, the Frost Fortress bought
   on Feiyun Market → The Toy Factory. (S1b) */
module.exports = {
  name: 'fam_teucer',
  expect: 'teucer',
  calls: 'answer',
  steps: [
    { choose: { thread: 'fam', match: /didn't see anything/ } },
    { choose: { thread: 'mama', match: /^Not the driver/ } },
    { choose: { thread: 'mama', match: /Ekaterina, from my office/ } },
    { choose: { thread: 'mama', match: /Wangshu Inn/ } },
    { choose: { thread: 'tonia', match: /Head of Accounts/ } },
    { until: 's.flags.deal_childe', within: 7200 },
    { choose: { thread: 'teucer', match: /Ekaterina runs the whole factory/, within: 7200 } },
    { choose: { thread: 'teucer', match: /Never too busy for you/, within: 7200 } },
    { choose: { thread: 'teucer', match: /Mingyun Toys/, within: 7200 } },
    { act: ['purchase', { id: 'toy_frost_fortress', total: 2400 }] },
    { until: 's.flags.gift_teucer && s.flags.factory_zl', within: 600 },
  ],
};
