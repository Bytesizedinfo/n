/* Example route (previous game; replace with Childe routes). Invite Wei Wuxian home, then call the office night desk and
   tell them you found the phone → The Honest Stranger.
   Steps: { choose: { thread, match } } · { act: [name, payload] } · { later: true } · { wait: seconds } · { dial: contactId }
          { answer: true | contactId } · { callChoose: { match } } · { hangup: true } · { send: [thread, text] }
          { open: threadId } · { app: appId } · { assert: 's.flags.x === true' } · { until: 's.flags.x' }
   Each waiting step fast-forwards play time until it can run (`within: seconds`, default 3600).
   Route options: calls: 'decline' (default) | 'answer' for calls the route doesn't handle; scale: 1|2|4|8; maxSec. */
module.exports = {
  name: 'old-honest-hq',
  expect: 'honest',
  steps: [
    { choose: { thread: 'wwx', match: /Six-thirty/ } },
    { assert: 's.flags.wwx_invited === true' },
    { wait: 30 },
    { dial: 'hq' },
    { callChoose: { match: /found Mr\. Jiang/ } },
  ],
};
