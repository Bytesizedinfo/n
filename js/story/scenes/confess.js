/* Confessions — started by the engine (in that thread) when the player free-types something like
   "I'm not Jiang Cheng, I found this phone". Each ends in an ending; Jin Ling and Wei Wuxian give you
   one chance to take it back (at a price). Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags || {};

  // ── Wei Wuxian → The Honest Stranger (or a take-back) ────────────
  S.scene({
    id: 'confess_wwx',
    thread: 'wwx',
    trigger: { on: 'manual' },
    nodes: {
      start: [
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
        { fx: { set: { busy_wwx: false } } },
        { m: 'ok. ok good' },
        { m: 'that was a weird bit. never do a bit again' },
        { m: '(if ur a stranger, ur a VERY good jiang cheng. the "get lost" was perfect)' },
        { end: true },
      ],
      real: [
        { m: 'a TAXI' },
        { m: 'is he ok?? where is he' },
        { m: 'wait. he always stays at the golden peony. lan zhan. LAN ZHAN' },
        { wait: 6 },
        { m: "ok lan zhan called. he's asleep in room 1808. he's fine. he doesn't know yet. he's going to be SO mad" },
        { m: 'stranger. thank u for telling me' },
        { if: (s) => F(s).wwx_invited, go: 'yes' },
        { m: "can i ask u something weird. don't tell him what i asked about sunday. i want him to answer it himself" },
        { go: 'end' },
      ],
      yes: [
        { m: 'so the yes. for sunday. that was u' },
        { m: "…that's ok. i'm going to make him say it himself. i'm keeping the practice yes tho" },
        { go: 'end' },
      ],
      end: [
        { m: "take it to the front desk at the golden peony. or give it to wen ning. he's the nicest person alive" },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });

  // ── Jin Ling → The Honest Stranger (or a take-back) ──────────────
  S.scene({
    id: 'confess_jl',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
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
        { fx: { set: { busy_jl: false } } },
        { m: "that's NOT funny jiujiu" },
        { m: "u don't even make jokes. who taught u jokes" },
        { m: '…ok. goodnight. weirdo' },
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
        { m: "thanks for telling me i guess. ur weirdly good at being him" },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });

  // ── Lan Xichen → The Honest Stranger ─────────────────────────────
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
        { wait: 4 },
        { ending: 'honest' },
      ],
      tea: [
        { m: 'Then the tea, too, was you.' },
        { m: "That's all right. I'll keep the water at eighty-five degrees anyway. He may come. He may not." },
        { m: 'Goodnight. Thank you for your honesty.' },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });

  // ── Nie Huaisang → I Know Nothing ────────────────────────────────
  S.scene({
    id: 'confess_nhs',
    thread: 'nhs',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'Hehe~' },
        { m: 'I know 🙈' },
        { m: "I knew at your second message. Brother Jiang types like he's being charged by the word" },
        { m: "Don't worry!!! I won't tell a soul. I don't know anything, remember? 🪭" },
        { m: 'But I would love a teeny tiny favor in return…' },
        { choice: [
            { t: 'What favor.', go: 'favor' },
            { t: 'No.', go: 'no' },
          ] },
      ],
      favor: [{ m: 'Screenshots!! The Zewu-jun thread!! All of it!! For… research 🙏' }, { go: 'end' }],
      no: [
        { m: 'Then I will simply know things about you. Forever 🙈' },
        { m: "Hehe. Joking. Mostly. Screenshots, please 🙏" },
        { go: 'end' },
      ],
      end: [
        { m: 'Then give the phone to Lotus Pier HQ, and I never met you 🪭' },
        { wait: 4 },
        { ending: 'busted' },
      ],
    },
  });

  // ── Wen Ning → Wen Ning Saw Nothing ──────────────────────────────
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
      tell: [{ m: "I won't. I'm not good at telling people things. — Wen Ning" }, { go: 'help' }],
      help: [
        { m: "Let me help. I have the van. I can take it to the Golden Peony. He doesn't have to know it was you. Or me." },
        { m: 'Where are you? — Wen Ning' },
        { wait: 4 },
        { ending: 'wen_ning' },
      ],
    },
  });

  // ── Lan Wangji → The Honest Stranger ─────────────────────────────
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
      end: [{ wait: 4 }, { ending: 'honest' }],
    },
  });
})();
