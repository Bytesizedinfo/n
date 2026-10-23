/* Confessions — `confess_<id>` scenes the engine starts when the player types “I’m not Childe / I found this phone”
   to that contact (JC.story.confess; the engine sets `told_truth` first). Contacts without a scene here fall back to
   the engine default: their `confess` flavour line, then JC.world.confess.endings[id] or `honest`.
   Scenes that do NOT end the game clear their own `done` mark at the end, so a second confession is handled again
   (instead of falling through to the default ending). Owner: S4 (core story). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags;
  const again = (id) => ({ run: (api) => { try { delete api.state.done[id]; } catch (e) { /* ignore */ } } });

  // ── Zhongli: never an ending. The scene `confess_zl` belongs to the Zhongli arc (scenes/zhongli-1.js, S1).
  // The engine starts a confess_<id> scene only once; so that a second confession to Zhongli reaches that scene's
  // “again” branch instead of falling through to the default ending, its done mark is cleared before the engine
  // looks (onAct rules run before the confession check in JC.story.send).
  S.onAct({
    id: 'core_confess_zl_again', act: 'send', arc: 'core',
    match: (p, s) => p.thread === 'zl' && !!s.fin.confess_zl && !!s.done.confess_zl,
    fx: () => { try { delete JC.state.d.done.confess_zl; } catch (e) { /* ignore */ } return null; },
  });

  // ── Hu Tao: Wangsheng Is Hiring — unless Zhongli's contract vouches for you (then she's in on it) ──
  S.scene({
    id: 'confess_ht', thread: 'ht', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).ht_ally, go: 'already' },
        { if: (s) => F(s).zl_contract, go: 'ally' },
        { m: '…' },
        { m: 'oh.' },
        { m: 'OH.' },
        { m: 'a stranger. with mr. harbinger’s phone. texting ME. the funeral director. at THIS hour' },
        { m: 'do you know how many ghost stories start exactly like this 👻' },
        { m: 'ok. come by the parlor. bring the phone. bring your résumé' },
        { m: 'we’re hiring ⚰️🦋' },
        { fx: { set: { ht_hired: true } } },
        { wait: 3 },
        { ending: 'wangsheng' },
      ],
      ally: [
        { m: 'ohhhh you’re the PHONE PERSON 👻' },
        { m: 'xiansheng told me! well. he told me one sentence very slowly over about four minutes. something about a contract and “discretion”' },
        { m: 'don’t worry. your secret is safe in my coffin' },
        { m: 'i mean with me. i mean both' },
        { fx: { set: { ht_ally: true } } },
        { go: 'end' },
      ],
      already: [{ m: 'yes yes i KNOW, phone person. we’ve been over this. i’m on your side, remember? spooky solidarity 👻' }, { go: 'end' }],
      end: [again('confess_ht')],
    },
  });

  // ── Lumine: an ally if you're keeping Childe's deal; otherwise “give it back. today.” ──
  S.scene({
    id: 'confess_lumine', thread: 'lumine', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).lumine_knows, go: 'already' },
        { typing: 3 },
        { m: '…' },
        { m: 'knew it.' },
        { m: 'you used a full stop. childe hasn’t used a full stop since the day we met' },
        { if: (s) => F(s).deal_childe, go: 'deal' },
        { m: 'is he alive' },
        { choice: [
          { t: 'I don’t know. I just found it.', go: 'no_deal' },
          { t: '[Leave on read]', silent: true, go: 'no_deal' },
        ], timeout: 90, onTimeout: 'no_deal' },
      ],
      no_deal: [
        { m: 'ok.' },
        { m: 'then give it back. today. take it to wangsheng, hu tao will know what to do with it. she always does' },
        { m: 'and stop answering his messages. people are worried enough' },
        { wait: 3 },
        { ending: 'honest' },
      ],
      deal: [
        { m: 'is he alive' },
        { choice: [
          { t: 'He’s alive. He called me. He asked me to keep his phone going until Monday.', fx: { aff: { lumine: 1 } }, go: 'ally' },
          { t: 'He’s alive. That’s all I can say.', go: 'ally_short' },
        ] },
      ],
      ally: [
        { m: 'ok.' },
        { m: 'that’s the most childe plan i’ve ever heard. get a stranger to be you. sure' },
        { m: 'then i’ll help. what do you need' },
        { m: '(paimon says hi. she’s eating. she doesn’t know yet. she can’t keep a secret, so she won’t)' },
        { fx: { set: { lumine_knows: true } } },
        { go: 'end' },
      ],
      ally_short: [
        { m: 'ok. good.' },
        { m: 'i won’t ask. if you need a sword, i have one' },
        { fx: { set: { lumine_knows: true } } },
        { go: 'end' },
      ],
      already: [{ m: 'i know. you told me. still helping. still have the sword' }, { go: 'end' }],
      end: [again('confess_lumine')],
    },
  });

  // ── Tonia: stunned. She calls Mama. Return to Sender. ──
  S.scene({
    id: 'confess_tonia', thread: 'tonia', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { typing: 5 },
        { m: 'What?' },
        { m: 'No. No, this isn’t funny, Ajax.' },
        { typing: 4 },
        { m: 'Who is this.' },
        { m: 'You’ve been talking to Teucer. You’ve been talking to Mama. You… you told Teucer goodnight.' },
        { m: 'Where is my brother?' },
        { choice: [
          { t: 'I don’t know where he is. He’s alive. He asked me to keep his phone going.', go: 'alive', if: (s) => !!F(s).deal_childe },
          { t: 'I found his phone on a pier. I don’t know where he is.', go: 'found' },
          { t: 'I’m sorry.', go: 'sorry' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ], timeout: 120, onTimeout: 'read' },
      ],
      alive: [
        { m: 'He asked you.' },
        { m: 'Of course he did. Of course he’d ask a STRANGER before he’d ask me.' },
        { go: 'after' },
      ],
      found: [{ m: 'On a pier. In the middle of the night. With a woman calling the house asking for “the Eleventh”.' }, { m: 'Nu. Of course.' }, { go: 'after' }],
      sorry: [{ m: 'Don’t. Don’t be sorry at me in his words.' }, { go: 'after' }],
      read: [{ m: 'Answer me.' }, { m: '…Fine. Don’t.' }, { go: 'after' }],
      after: [
        { fx: { set: { tonia_knows_stranger: true }, sus: { tonia: 3 } } },
        { m: 'I’m calling Mama.' },
        { m: 'Don’t text Teucer. Don’t text anyone. Don’t send one more fish emoji in his name.' },
        { m: 'If you’re lying, I will find you. I’m from Morepesok. We are very good at finding things under ice.' },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });

  // ── Teucer: he doesn't believe you. ──
  S.scene({
    id: 'confess_teucer', thread: 'teucer', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'ur being weird brother 😭' },
        { m: 'ur not a stranger ur my BROTHER' },
        { m: 'is this a PRANK?? tonia said u would prank us at the airport!!' },
        { m: 'i’m not falling for it!!! 🐟🐟🐟' },
        { fx: { sus: { teucer: 2 } } },
        { choice: [
          { t: 'Haha!! Got you!! 😁', fx: { sus: { teucer: -1 } }, go: 'got' },
          { t: 'I’m serious, Teucer.', fx: { sus: { teucer: 2, tonia: 1 } }, go: 'serious' },
          { t: '[Leave on read]', silent: true, fx: { sus: { teucer: 1 } }, go: 'read' },
        ], timeout: 90, onTimeout: 'read' },
      ],
      got: [{ m: 'I KNEW IT!!!' }, { m: 'u can’t trick me i’m EIGHT' }, { m: 'sir fang says ur a big dummy 🧸' }, { go: 'end' }],
      serious: [
        { m: 'STOP IT 😭😭😭' },
        { m: 'i’m telling tonia' },
        { m: 'tonia says ur being an idiot and to stop scaring me' },
        { go: 'end' },
      ],
      read: [{ m: 'brother??' }, { m: '…ok ur sleeping. goodnight brother. ur still a big dummy 🐟' }, { go: 'end' }],
      end: [again('confess_teucer')],
    },
  });

  // ── Scaramouche: The Balladeer's Gossip. ──
  S.scene({
    id: 'confess_scara', thread: 'scara', arc: 'core', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'oh?' },
        { m: 'oh, this is DELICIOUS.' },
        { m: 'a stray. holding the eleventh’s phone. confessing to ME, of all people' },
        { m: 'do you have any idea what you’ve just done' },
        { m: 'no. don’t answer. i want to enjoy this' },
        { wait: 3 },
        { ending: 'caught_scara' },
      ],
    },
  });
})();
