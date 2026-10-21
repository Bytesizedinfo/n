/* "Sunday at Lotus Pier" — confessions. Started by the engine (in that thread) when the player free-types
   something like "I'm not Jiang Cheng, I found this phone" (the engine has already set told_truth), or by a
   selfie come-clean (react-social.js sets r_selfie to that contact first: no take-back, returned_how 'selfie').
   Nothing ends the game:
   - Wei Wuxian, Jin Ling, Lan Xichen, Lan Wangji → the phone goes back tonight (returned_early → early_return, writer C)
   - Wen Ning → he becomes your accomplice (wn_accomplice, calls.js)
   - Nie Huaisang → he knows (nhs_knows → nhs_bargain, writer B)
   Jin Ling and Wei Wuxian give you one chance to take it back (told_truth is cleared again). Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags || {};

  /** start a consequence scene another writer owns (it may not exist yet: warn instead of failing) */
  const goTo = (id) => ({ run: () => {
    if (!S.defs.scenes[id]) { console.warn('[sunday] consequence scene missing:', id); return; }
    if (!S.view().done[id]) S.start(id);
  } });
  const viaSelfie = (cid) => (s) => F(s).r_selfie === cid;
  /** The Honest Stranger, Sunday edition: the phone goes back tonight */
  const giveBack = (cid) => [
    { run: () => {
      const how = S.view().flags.r_selfie === cid ? 'selfie' : 'confess';
      S.applyFx({ set: { told_truth: true, returned_early: true, returned_how: how, told_to: cid, r_selfie: null } });
    } },
    { wait: 4 },
    goTo('early_return'),
    { end: true },
  ];
  const takeBack = (cid) => ({ fx: { set: { ['busy_' + cid]: false, told_truth: false } } });

  // ── Wei Wuxian ───────────────────────────────────────────────────
  S.scene({
    id: 'confess_wwx',
    thread: 'wwx',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: viaSelfie('wwx'), go: 'real' },
        { typing: 3 },
        { m: '…' },
        { m: 'lol' },
        { m: 'wait' },
        { m: "jiang cheng is this a bit. u don't do bits" },
        { choice: [
            { t: "It's not a bit. I found his phone in a taxi.", go: 'real' },
            { t: 'Obviously a bit. Get lost.', fx: { sus: { wwx: 4 } }, go: 'takeback' },
          ] },
      ],
      takeback: [
        takeBack('wwx'),
        { m: 'ok. ok good' },
        { m: 'that was a weird bit. never do a bit again' },
        { m: '(if ur a stranger, ur a VERY good jiang cheng. the "get lost" was perfect)' },
        { hint: 'Wei Wuxian noticed.' },
        { end: true },
      ],
      real: [
        { m: 'a TAXI' },
        { m: 'is he ok?? where is he' },
        { m: 'wait. he always stays at the golden peony. lan zhan. LAN ZHAN' },
        { wait: 6 },
        { m: "ok lan zhan called. he's asleep in room 1808. he's fine. he doesn't know yet. he's going to be SO mad" },
        { m: 'stranger. thank u for telling me' },
        { if: (s) => !!F(s).burned, go: 'burned' },
        { if: (s) => !!F(s).wwx_invited, go: 'yes' },
        { m: "can i ask u something weird. don't tell him what i asked about sunday. i want him to answer it himself" },
        { go: 'end' },
      ],
      yes: [
        { m: 'so the yes. for sunday. that was u' },
        { m: "…that's ok. i'm going to make him say it himself. i'm keeping the practice yes tho" },
        { go: 'end' },
      ],
      burned: [
        { m: 'so "you should have stayed gone". that was u too' },
        { typing: 5 },
        { m: '…' },
        { m: "it still sounded like him. that's the worst part. i've heard him think it" },
        { go: 'end' },
      ],
      end: [
        { m: "take it to the front desk at the golden peony. or give it to wen ning. he's the nicest person alive" },
        { log: 'Told Wei Wuxian the truth', once: 'truth:wwx' },
      ].concat(giveBack('wwx')),
    },
  });

  // ── Jin Ling ─────────────────────────────────────────────────────
  // He knows; if tonight went well for him he wants the stranger at his birthday (jl_knows: docs/SUNDAY.md).
  const jlLikes = (s) => !!(F(s).bday_planned || F(s).car_handled || F(s).fairy_ok) || ((s.aff || {}).jl || 0) >= 3;
  S.scene({
    id: 'confess_jl',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: viaSelfie('jl'), go: 'real' },
        { m: '???' },
        { m: 'WHAT' },
        { m: 'who r u' },
        { m: 'did u read my texts' },
        { choice: [
            { t: "Yes. I found his phone in a taxi. I'm sorry.", go: 'real' },
            { t: 'Kidding. Go to sleep.', fx: { sus: { jl: 4 } }, go: 'takeback' },
          ] },
      ],
      takeback: [
        takeBack('jl'),
        { m: "that's NOT funny jiujiu" },
        { m: "u don't even make jokes. who taught u jokes" },
        { m: '…ok. goodnight. weirdo' },
        { hint: 'A-Ling noticed.' },
        { end: true },
      ],
      real: [
        { m: 'OMG' },
        { m: 'who have i been TALKING to all night' },
        { if: (s) => F(s).car_known, go: 'koi' },
        { go: 'where' },
      ],
      koi: [
        { m: 'DELETE THE KOI PHOTO' },
        { m: 'actually dont. he needs to hear it from me. ugh' },
        { go: 'where' },
      ],
      where: [
        { m: 'ok. he always stays at the golden peony. room 1808' },
        { m: "leave it at the front desk. i'll tell them it's his" },
        { m: '…' },
        { m: 'thanks for telling me i guess. ur weirdly good at being him' },
        { if: jlLikes, go: 'invite' },
        { log: 'Told A-Ling the truth', once: 'truth:jl' },
      ].concat(giveBack('jl')),
      invite: [
        { if: (s) => !!F(s).bday_planned, go: 'invite_party' },
        { m: 'u were nicer to me tonight than he usually is. and also exactly as mean. how' },
        { go: 'invite_q' },
      ],
      invite_party: [
        { m: 'wait. the birthday chat. the cake and the bell and everything. that was u??' },
        { go: 'invite_q' },
      ],
      invite_q: [
        { m: "ok. ur coming on sunday. don't argue. it's MY birthday and i'm an adult and i decide" },
        { m: "i'll tell jiujiu in the morning. he'll yell. he yells at everyone he likes" },
        { fx: { set: { jl_knows: true }, aff: { jl: 1 } } },
        { log: 'Told A-Ling the truth. He wants you at his birthday', once: 'truth:jl' },
        { hint: 'A-Ling wants you there on Sunday.' },
      ].concat(giveBack('jl')),
    },
  });

  // ── Lan Xichen ───────────────────────────────────────────────────
  S.scene({
    id: 'confess_lxc',
    thread: 'lxc',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { typing: 6 },
        { m: '…Ah.' },
        { m: 'Then I owe you an apology as well. I have said a great many things tonight to someone I have never met.' },
        { m: 'Is he safe? He would be at the Golden Peony. He always is.' },
        { choice: [
            { t: "He's at the hotel. He doesn't know yet.", go: 'safe' },
            { t: 'I should have said something sooner.', go: 'sooner' },
          ] },
      ],
      safe: [{ m: 'Thank you.' }, { go: 'end' }],
      sooner: [{ m: "You've said it now. That is what matters." }, { go: 'end' }],
      end: [
        { if: (s) => F(s).tea_yes, go: 'tea' },
        { m: 'Please make sure he gets it back. And— no. Never mind.' },
        { m: 'Goodnight. Thank you for your honesty.' },
        { log: 'Told Lan Xichen the truth', once: 'truth:lxc' },
      ].concat(giveBack('lxc')),
      tea: [
        { m: 'Then the tea, too, was you.' },
        { m: "That's all right. I'll keep the water at eighty-five degrees anyway. He may come. He may not." },
        { m: 'Goodnight. Thank you for your honesty.' },
        { log: 'Told Lan Xichen the truth. He is keeping the water at eighty-five degrees anyway', once: 'truth:lxc' },
      ].concat(giveBack('lxc')),
    },
  });

  // ── Nie Huaisang → he knows (consequence: nhs_bargain, writer B) ─
  S.scene({
    id: 'confess_nhs',
    thread: 'nhs',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'Hehe~' },
        { m: 'I know 🙈' },
        { m: "I knew at your second message. Brother Jiang types like he's being charged by the word" },
        { m: "Don't worry!!! I don't know anything, remember? 🪭" },
        { fx: { set: { nhs_knows: true, told_to: 'nhs', r_selfie: null } } },
        { log: 'Told Nie Huaisang the truth. He already knew', once: 'truth:nhs' },
        { hint: 'Nie Huaisang knows.' },
        { wait: 3 },
        goTo('nhs_bargain'),
      ],
    },
  });

  // ── Wen Ning → your accomplice (consequence: wn_accomplice, calls.js) ─
  S.scene({
    id: 'confess_wn',
    thread: 'wn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { typing: 5 },
        { m: 'Oh.' },
        { m: 'Oh no. Is Mr. Jiang all right?' },
        { m: "I'm sorry. I don't know why I'm sorry. I'm just sorry. — Wen Ning" },
        { choice: [
            { t: "He's fine. He's at his hotel. He doesn't know yet.", go: 'fine' },
            { t: "Don't tell anyone.", go: 'tell' },
          ] },
      ],
      fine: [{ m: "Okay. Okay. That's good." }, { go: 'help' }],
      tell: [{ m: "I won't. — Wen Ning" }, { go: 'help' }],
      help: [
        { fx: { set: { told_truth: true, told_to: 'wn', wn_told: true, wn_knows: true, wn_accomplice: true, r_selfie: null } } },
        { log: 'Told Wen Ning the truth', once: 'truth:wn' },
        { start: 'wn_accomplice' },
      ],
    },
  });

  // ── Lan Wangji ───────────────────────────────────────────────────
  S.scene({
    id: 'confess_lwj',
    thread: 'lwj',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { typing: 4 },
        { m: 'Mn.' },
        { m: 'Golden Peony. Room 1808.' },
        { m: 'Return it.' },
        { choice: [
            { t: 'Will you tell Wei Wuxian?', go: 'tell' },
            { t: "I'm sorry.", go: 'sorry' },
          ] },
      ],
      tell: [
        { m: 'In the morning.' },
        { m: 'He will laugh. Then he will want to meet you.' },
        { go: 'end' },
      ],
      sorry: [{ m: 'You told the truth. That is enough.' }, { go: 'end' }],
      end: [{ log: 'Told Lan Wangji the truth', once: 'truth:lwj' }].concat(giveBack('lwj')),
    },
  });
})();
