/* Family: let Pulcinella's driver collect the kids and never get them out (the card freeze keeps Osial from being
   the headline) → Pulcinella's Guests. (S1b) */
module.exports = {
  name: 'fam_leverage',
  expect: 'leverage',
  calls: 'answer',
  steps: [
    { choose: { thread: 'mama', match: /Pulcinella's driver is fine/ } },
    { choose: { thread: 'mama', match: /The Grand's perfect/ } },
    { choose: { thread: 'papa', match: /He's my boss/, within: 1200 } },
    { until: 's.flags.deal_childe', within: 7200 },
    { until: "s.chapter === 'sat_dawn'", within: 7200 },
    { until: () => { try { JC.bank.freeze(true); } catch (e) { JC.story.act('card_freeze', { on: true }); } return true; } },
    { until: 's.flags.kids_landed', within: 7200 },
    { assert: 's.flags.fatui_pickup && !s.flags.kids_rescued' },
  ],
};
