/* Live scenes — the Zhongli route, part 2: chapters 4–7 and the climax.
   Saturday night ("Yujing Terrace": the walk, the Gnosis, Rex Lapis), Sunday ("The Rite of Parting": the funeral,
   the amendment at the Golden House, the message), Sunday night ("Osial": the sea, "Will he come back?"),
   Monday ("Northbound": goodbyes). The voice memo "for xiansheng (don't send)" can arrive at any time.
   Facts: docs/STORY.md. Kit: JC.zlKit (zhongli-1.js). Owner: S1. */
(function () {
  'use strict';
  const JC = window.JC;
  const S = JC.story;
  const { F, AFF, T, past, started, finished, held, hold, lock, free, cancel, aware, kidsSafe, osialStopped, recalled, M, scene, sendMemo, ledgerNodes } = JC.zlKit;

  const live = (s) => !!F(s).zl_walk_live && s.chapter === 'sat_night';
  const signed = (s) => !!F(s).zl_contract && !F(s).zl_broken && !F(s).morax_sold;

  // ── App acts → Zhongli ─────────────────────────────────────────────
  // The climax: the memo reaches him (from Voice Memos, from a choice, or into a group he is in).
  S.onAct({
    id: 'zl_memo', arc: 'zl', act: 'memo_share', once: true,
    match: (p) => (p.id || p.memo) === 'memo_xiansheng' && (p.to === 'zl' || (() => { try { return JC.story.members(p.to).includes('zl'); } catch (e) { return false; } })()),
    fx: (p) => ({ set: { zl_memo_via: p.to || 'zl' } }),
    start: 'zl_memo',
  });
  // Typing "Rex Lapis." to him, once you know.
  S.onAct({
    id: 'zl_rexlapis_typed', arc: 'zl', act: 'send',
    match: (p, s) => p.thread === 'zl' && /rex\s*lapis|morax/i.test(p.text || '') && !!F(s).knows_morax && !F(s).zl_confessed && !started(s, 'zl_rexlapis'),
    start: 'zl_rexlapis', delay: 1,
  });
  // Telling him about Osial outside the Saturday-night conversation: the protocol page, or the word itself.
  S.onAct({
    id: 'zl_osial_photo', arc: 'zl', act: 'send', once: true,
    match: (p, s) => p.thread === 'zl' && (p.art === 'p_osial_diagram' || (/osial/i.test(p.text || '') && !!F(s).saw_protocol)) && !F(s).zl_knows_osial && !started(s, 'zl_osial_told'),
    fx: (p) => ({ set: { zl_osial_via_photo: p.art === 'p_osial_diagram' } }),
    start: 'zl_osial_told', delay: 2,
  });
  // Ch4: Maps directions to Yujing Terrace = the walk in person
  S.onAct({
    id: 'zl_walk_live', arc: 'zl', act: 'directions', once: true,
    match: (p, s) => p.place === 'yujing' && s.chapter === 'sat_night' && !past(s, '+2 00:30'),
    fx: { set: { zl_walk_live: true }, aff: { zl: 1 } },
    start: 'zl_walk_live', delay: 2,
  });
  // Find My → "Play Sound" on his AirPods: Coffin Four beeps while Zhongli is in the room.
  S.onAct({ id: 'zl_hideout', arc: 'zl', act: 'findmy_sound', match: (p) => (p.id || '') === 'airpods', once: true, start: 'zl_hideout', delay: 45 });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 4 — Saturday night, "Yujing Terrace"
  // ════════════════════════════════════════════════════════════════════

  scene({
    id: 'zl_walk', ch: 'sat_night', required: true,
    trigger: { on: 'chapter', ch: 'sat_night', delay: 60 },
    nodes: {
      start: hold('zl_walk'),
      go: [
        lock('zl_walk'),
        { if: (s) => !!F(s).zl_walk_live, go: 'poll_free' },
        ...M(
          'The lanterns along Yujing Terrace are being lit for tomorrow. Three thousand of them. Moon-white. I lost that argument, as you know.',
          'I am going to walk the length of it tonight, before it belongs to everyone. I would like company.',
        ),
        { if: (s) => !F(s).zl_admitted || !!F(s).zl_guarded, go: 'guarded' },
        { go: 'ask' },
      ],
      guarded: M('Yours, specifically. Whatever else we are to each other, I think we have some things to say.', { go: 'ask' }),
      ask: [free, { start: 'zl_walk_ask' }, { go: 'poll' }],
      poll_free: [free, { go: 'poll' }],
      poll: [
        { if: (s) => !!F(s).zl_walk_live || started(s, 'zl_walk_live'), go: 'live_cancel' },
        { if: (s) => finished(s, 'zl_walk_ask') && !F(s).zl_walk_going, go: 'texts' },
        { if: (s) => past(s, '+1 22:40'), go: 'texts' },
        { wait: 5 },
        { go: 'poll' },
      ],
      live_cancel: [
        { if: (s) => started(s, 'zl_walk_ask') && !finished(s, 'zl_walk_ask'), go: 'live_cancel_ask' },
        { go: 'live_wait' },
      ],
      live_cancel_ask: [cancel('zl_walk_ask'), { go: 'live_wait' }],
      live_wait: [
        { if: (s) => finished(s, 'zl_walk_live'), go: 'after' },
        { wait: 5 },
        { go: 'live_wait' },
      ],
      texts: [
        { if: (s) => !!F(s).zl_walk_live || started(s, 'zl_walk_live'), go: 'live_cancel' },
        { if: (s) => started(s, 'zl_walk_ask') && !finished(s, 'zl_walk_ask'), go: 'texts_cancel' },
        { if: (s) => held(s) && F(s).busy_zl !== 'zl_walk', go: 'texts_wait' },
        lock('zl_walk'),
        { if: (s) => !!F(s).zl_walk_going, go: 'waited' },
        { go: 'walk' },
      ],
      texts_cancel: [cancel('zl_walk_ask'), { go: 'texts' }],
      texts_wait: [{ wait: 3 }, { go: 'texts' }],
      waited: M('I waited by the lion for a while. It is all right. They are watching his places, and you were wise not to come. I will walk it for both of us.', { go: 'walk' }),
      walk: [
        ...M(
          'I am at the north stair. The stone lion with the chipped ear is still here. A cart wheel did that, in a year I will not mention.',
          'They are lighting the lanterns now. Men with long tapers are working their way down the terrace, and each lantern goes white as they pass, so that the light follows them like a dog.',
          'There is a crane asleep on the balustrade, one leg tucked up. I have stopped so as not to wake it. It is judging me in its sleep.',
        ),
        { if: (s) => !!F(s).beidou_accepted && !F(s).beidou_went && !F(s).zl_walk_rematch, go: 'beidou' },
        { go: 'walk_ask' },
      ],
      beidou: M('Hu Tao, who hears everything, tells me Beidou is waiting on the Alcor for a rematch. He would go. He would lose, gloriously, and claim afterwards that it was the weather.', { go: 'walk_ask' }),
      walk_ask: [
        { choice: [
          { t: 'What will you say tomorrow? At the Rite?', go: 'say' },
          { t: "Are you okay? It's a funeral tomorrow.", go: 'okay' },
          { t: 'Tell me what this place was like before.', go: 'before' },
        ], timeout: 100, onTimeout: 'end_walk' },
      ],
      say: M('Nothing. The consultant does not speak at the Rite. I will stand at the back, near the incense, and make certain it is the right incense.', { go: 'end_walk' }),
      okay: M('I am better than I expected to be. Ask me again tomorrow.', { go: 'end_walk' }),
      before: [
        ...M('Before the lanterns there were torches. Before the torches there was only the terrace, and before the terrace there was only the cliff, and a great many people standing on it, looking at the sea and wondering what would come out of it next.'),
        { if: (s) => !!F(s).zl_hinted || !!F(s).zl_confessed, go: 'before_true' },
        { m: 'I read a great deal.', d: 2 },
        { go: 'end_walk' },
      ],
      before_true: M({ m: 'I was there. I am tired of pretending otherwise to you.', d: 2.6 }, { go: 'end_walk' }),
      end_walk: M('Thank you for walking with me. Even like this.', { go: 'after' }),
      after: [free, { start: 'zl_gnosis', delay: 20 }],
    },
  });

  scene({
    id: 'zl_walk_ask', ch: 'sat_night', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_walk_ask'),
      go: [
        lock('zl_walk_ask'),
        { choice: [
          { t: "I'll come.", fx: { set: { zl_walk_going: true } }, go: 'come' },
          { t: "I can't. Walk it for me? Tell me what you see.", go: 'end' },
          { t: "Isn't it dangerous? The Fatui are watching his places.", go: 'danger' },
          { t: "I can't. I've got a rematch with Beidou on the Alcor. ⚔️", if: (s) => !!F(s).beidou_accepted && !F(s).beidou_went, fx: { set: { zl_walk_rematch: true } }, go: 'rematch' },
          { t: '[Leave on read]', silent: true, go: 'end' },
        ] },
      ],
      come: [
        { m: 'The north stair, by the stone lion with the chipped ear. I will be the one not holding a lantern.', loc: { place: 'yujing' } },
        { go: 'end' },
      ],
      danger: [
        ...M(
          'They are watching his places.',
          { m: 'Yujing Terrace has never been his place. It has always been mine.', d: 2.6 },
        ),
        { choice: [
          { t: "Then I'll come.", fx: { set: { zl_walk_going: true } }, go: 'come' },
          { t: 'Walk it for me, then. Tell me what you see.', go: 'end' },
        ] },
      ],
      rematch: M(
        'Of course you do.',
        'Go. He always loses to Beidou in front of witnesses and claims afterwards that it was the weather. Lose with dignity, on his behalf. I will walk the terrace for both of us.',
        { go: 'end' },
      ),
      end: [free],
    },
  });

  // In person (Maps → directions to Yujing Terrace). Narrated.
  scene({
    id: 'zl_walk_live', ch: 'sat_night',
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_walk_live'),
      go: [
        lock('zl_walk_live'),
        { time: '+14m', card: 'Yujing Terrace. Three thousand moon-white lanterns, and one man waiting by a stone lion with a chipped ear.', lock: false },
        { sys: 'He\'s leaning on the railing, looking down at the harbor. He doesn\'t turn around.' },
        { wait: 3 },
        { sys: '“You came,” he says. “Good. I was beginning to suspect I would have to describe the lanterns, and I am bad at describing things I love. I use too many words.”' },
        { wait: 4 },
        { sys: 'You walk. Men with long tapers are working their way down the terrace, and each lantern blooms white as they pass, so the light follows you.' },
        { choice: [
          { t: '“They\'re beautiful.”', silent: true, go: 'beautiful' },
          { t: '“Are you okay? Tomorrow\'s a funeral.”', silent: true, go: 'okay' },
          { t: '“Why did you want me here?”', silent: true, go: 'why' },
        ] },
      ],
      beautiful: [{ sys: '“They are,” he says. “They were silk, once. Then paper. One day they will be something else, and someone will say the old ones were better. They will be wrong. They are always beautiful.”' }, { go: 'crane' }],
      okay: [{ sys: 'He laughs, very quietly, as if you\'ve told a joke only he can hear. “I am better than I expected to be,” he says. “Ask me again tomorrow.”' }, { go: 'crane' }],
      why: [{ sys: '“Because tomorrow all of Liyue will walk this terrace,” he says, “and tonight I wanted to walk it with someone who did not know why it mattered.” He glances at you. “Or who knew, and came anyway.”' }, { go: 'crane' }],
      crane: [
        { wait: 5 },
        { sys: 'Halfway along, a crane is asleep on the balustrade, one leg tucked up. He stops so as not to wake it.' },
        { wait: 3 },
        { sys: '“It is judging you,” he murmurs. “He was right about that.”' },
        { wait: 3 },
        free,
      ],
    },
  });

  /** telling Zhongli about Osial (text) */
  const osialNodes = (after) => ({
    osial: [
      ...M({ m: 'Osial.', d: 2 }),
      { typing: 5 },
      { wait: 3 },
      { m: 'Tell me.' },
      { choice: [
        { t: 'This is from his mail. Page three.', label: '[Send him the protocol diagram]', send: [{ img: 'p_osial_diagram' }], go: 'osial_doc' },
        { t: "Northland resonators on three pillars at Guyun. They wake whatever's under there. His name is the only signature. Signora rewrote it so it would be.", go: 'osial_told' },
      ] },
    ],
    osial_doc: M({ m: 'Pillars four, nine and seventeen. "Unit 3." "Countersignature removed, revision four."', d: 3 }, { go: 'osial_told' }),
    osial_told: [
      { fx: { set: { zl_knows_osial: true }, aff: { zl: 1 } } },
      { wait: 3 },
      ...M(
        'The thing beneath Guyun is called Osial. It was put there a very long time ago, by someone who was very tired of it, under a great deal of stone.',
        'So that is what he meant, on the ninth. "If I did something really stupid."',
        'He pitched it in August, I imagine, on a night when he wanted to fight a god. And then he tried to take it back, and could not, because she had already written his name on every page.',
        { typing: 6 },
        { wait: 3 },
        'Signora has signed a contract with me while holding a knife behind her back. That is not, strictly, a breach. It is merely rude.',
      ),
      { if: (s) => past(s, '+2 16:00'), go: 'osial_late' },
      { m: 'Thank you for telling me. I will think about how best to answer her. I am, as it happens, very good at contracts.' },
      { go: after },
    ],
    osial_late: M(
      'I wish I had known before four o\'clock. The contract is signed. I will have to answer her some other way.',
      'If she asks you for anything tonight, tell her to ask the founder. She will not understand it. I will.',
      { go: after },
    ),
  });

  scene({
    id: 'zl_gnosis', ch: 'sat_night',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 480 },
    nodes: Object.assign({
      start: hold('zl_gnosis'),
      go: [
        lock('zl_gnosis'),
        { if: (s) => live(s), go: 'live' },
        ...M(
          'I have a contract of my own that ends tomorrow.',
          'I signed it on the first of October. It is the last of its kind I will ever make. Tomorrow at four, at the Golden House, something very old changes hands, and in return Liyue\'s debts to Northland are forgiven. All of them. It is a good contract. I wrote it myself.',
          'I tell you because you are carrying his phone, and his phone will hear about it from Signora before the day is out, and I would rather you heard it from me.',
        ),
        { choice: [
          { t: 'With Signora?', if: (s) => !!F(s).saw_protocol, fx: { set: { zl_asked_gnosis: true } }, go: 'signora' },
          { t: "There's something you need to know about Signora. It's called Osial.", if: (s) => !!F(s).saw_protocol, go: 'osial' },
          { t: 'Rex Lapis.', if: (s) => !!F(s).knows_morax && !F(s).zl_confessed, go: 'rex' },
          { t: 'What changes hands?', go: 'what' },
          { t: 'That sounds like goodbye.', go: 'goodbye' },
          { t: '[Leave on read]', silent: true, go: 'quiet' },
        ], timeout: 150, onTimeout: 'quiet' },
      ],
      signora: [
        ...M(
          'You have been reading his mail.',
          'Yes. With Signora. She came to me the day the god died, with a contract already drafted, which I found presumptuous. I rewrote it. She signed my version. She was very gracious about it.',
          { m: 'That worried me.', d: 1.8 },
        ),
        { choice: [
          { t: "She's not being straight with you. There's a project called Osial.", go: 'osial' },
          { t: 'Be careful tomorrow.', go: 'careful' },
          { t: 'Rex Lapis.', if: (s) => !!F(s).knows_morax && !F(s).zl_confessed, go: 'rex' },
        ] },
      ],
      careful: M('I am always careful. It is the only thing I have ever been accused of being too much of.', { go: 'wants' }),
      what: [
        { if: (s) => !!F(s).zl_confessed, go: 'what_true' },
        ...M('Something that belonged to the god. A small thing, as these things go. It will not be missed by anyone who knew what it was for.'),
        { go: 'wants' },
      ],
      what_true: M('The Gnosis. The last piece of the god. You know what that means now.', { go: 'wants' }),
      goodbye: M({ m: 'It is.', d: 1.6 }, 'Not to you. To something much older than you. I find I do not mind as much as I expected.', { go: 'wants' }),
      quiet: [{ typing: 3 }, { go: 'wants' }],
      rex: [free, { start: 'zl_rexlapis', delay: 1 }, { end: true }],
      wants: [
        { if: (s) => !F(s).saw_protocol && !F(s).zl_knows_osial, go: 'wants_ask' },
        { go: 'end' },
      ],
      wants_ask: [
        { fx: { set: { zl_wants_protocol: true } } },
        { m: 'One thing. If you find anything in his phone with Signora\'s name on it, anything at all, I would be grateful to read it before four o\'clock tomorrow. His mail would be the place to start. He never deletes anything; he says it is "evidence", in a voice that suggests he thinks it is a joke.' },
        { go: 'end' },
      ],
      // ── in person, on the terrace ──
      live: [
        { sys: 'At the far end of the terrace the lanterns stop. Past them there\'s only the dark, and the sound of the sea.' },
        { wait: 3 },
        { sys: '“I have a contract of my own,” he says, “that ends tomorrow.”' },
        { wait: 3 },
        { sys: 'He tells you about it the way people talk about the weather in a country they\'re leaving: the first of October, the Golden House, four o\'clock; something very old changing hands; Liyue\'s debts forgiven, all of them. “It is a good contract,” he says. “I wrote it myself.”' },
        { choice: [
          { t: '“With Signora?”', silent: true, if: (s) => !!F(s).saw_protocol, fx: { set: { zl_asked_gnosis: true } }, go: 'live_signora' },
          { t: '“There\'s something you need to know about Signora. It\'s called Osial.”', silent: true, if: (s) => !!F(s).saw_protocol, go: 'live_osial' },
          { t: '“Rex Lapis.”', silent: true, if: (s) => !!F(s).knows_morax && !F(s).zl_confessed, go: 'rex' },
          { t: '“What changes hands?”', silent: true, go: 'live_what' },
          { t: '“That sounds like goodbye.”', silent: true, go: 'live_goodbye' },
        ] },
      ],
      live_signora: [
        { sys: 'He turns and looks at you properly, for the first time all night. “You have been reading his mail,” he says. It isn\'t a reproach.' },
        { wait: 3 },
        { sys: '“Yes. With Signora. She came to me the day the god died, with a contract already drafted, which I found presumptuous. I rewrote it. She signed my version. She was very gracious about it.” A pause. “That worried me.”' },
        { choice: [
          { t: '“She\'s not being straight with you. There\'s a project called Osial.”', silent: true, go: 'live_osial' },
          { t: '“Be careful tomorrow.”', silent: true, go: 'live_careful' },
          { t: '“Rex Lapis.”', silent: true, if: (s) => !!F(s).knows_morax && !F(s).zl_confessed, go: 'rex' },
        ] },
      ],
      live_careful: [{ sys: '“I am always careful,” he says. “It is the only thing I have ever been accused of being too much of.”' }, { go: 'live_end' }],
      live_osial: [
        { sys: 'You tell him. The resonators, the three pillars at Guyun, the code in the locked note, Childe\'s name alone on every page, Signora\'s rewrite.' },
        { wait: 3 },
        { sys: 'He listens without moving. When you get to “Unit 3”, the sea below the terrace goes flat, all at once, as though someone had laid a hand on it.' },
        { wait: 4 },
        { sys: '“So that is what he meant,” he says quietly. “On the ninth. ‘If I did something really stupid.’”' },
        { wait: 3 },
        { sys: '“She has signed a contract with me while holding a knife behind her back. That is not, strictly, a breach.” He almost smiles. “It is merely rude. Thank you. I will think about how to answer her. I am very good at contracts.”' },
        { fx: { set: { zl_knows_osial: true }, aff: { zl: 1 } } },
        { go: 'live_end' },
      ],
      live_what: [{ sys: '“Something that belonged to the god,” he says. “A small thing, as these things go. It will not be missed by anyone who knew what it was for.”' }, { go: 'live_end' }],
      live_goodbye: [{ sys: '“It is,” he says. “Not to you. To something much older than you.” He looks back along the lanterns. “I find I do not mind as much as I expected.”' }, { go: 'live_end' }],
      live_end: [
        { wait: 4 },
        { sys: 'You walk back the way you came. Every lantern is lit now. At the north stair he stops by the lion with the chipped ear.' },
        { wait: 2 },
        { sys: '“Thank you for coming,” he says. “Go home a different way. They are watching his places, and you are carrying his whole life in your pocket.”' },
        { go: 'wants' },
      ],
      end: [
        free,
        { if: (s) => !!F(s).knows_morax && !F(s).zl_confessed && !started(s, 'zl_rexlapis'), go: 'to_rex' },
        { start: 'zl_where', delay: 45 },
      ],
      to_rex: [{ start: 'zl_rexlapis', delay: 45 }],
    }, osialNodes('wants')),
  });

  // After the Saturday-night talk: you found the protocol later, or sent it to him yourself.
  scene({
    id: 'zl_osial_told',
    trigger: { on: 'flag', flag: 'saw_protocol', delay: 40 },
    retry: true,
    when: (s) => !!F(s).zl_admitted && finished(s, 'zl_gnosis') && !F(s).zl_knows_osial && !past(s, '+2 15:30') && (s.chapter === 'sat_night' || s.chapter === 'sun_rite'),
    nodes: Object.assign({
      start: hold('zl_osial_told'),
      go: [
        { if: (s) => !!F(s).zl_knows_osial, go: 'none' },
        lock('zl_osial_told'),
        { if: (s) => !!F(s).zl_osial_via_photo, go: 'osial_doc' },
        { if: (s) => started(s, 'zl_osial_told') && !!F(s).saw_protocol && !!F(s).zl_wants_protocol, go: 'found' },
        { go: 'osial' },
      ],
      found: [
        ...M('You have found something. I can tell; you have stopped typing for a long time, which you never do.'),
        { choice: [
          { t: "Yes. It's called Osial. You need to read it.", go: 'osial' },
          { t: "There's nothing. Sorry.", go: 'nothing' },
        ] },
      ],
      nothing: M('Very well. Thank you for looking.', { go: 'end' }),
      end: [free],
      none: [{ end: true }],
    }, osialNodes('end')),
  });

  // "Rex Lapis." — his confession. The most important message of the route.
  scene({
    id: 'zl_rexlapis',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 760 },
    when: (s) => !!F(s).knows_morax && !F(s).zl_confessed && s.chapter === 'sat_night',
    nodes: {
      start: [
        { if: (s) => !!F(s).zl_confessed, go: 'none' },
        { go: 'q' },
      ],
      q: hold('zl_rexlapis', 'go', 'q'),
      go: [
        lock('zl_rexlapis'),
        { if: (s) => live(s) && started(s, 'zl_gnosis') && !finished(s, 'zl_where'), go: 'live' },
        { go: 'typed' },
      ],
      live: [
        { sys: 'You say it out loud. “Rex Lapis.”' },
        { wait: 2 },
        { sys: 'He stops walking.' },
        { wait: 4 },
        { sys: 'For a long moment he looks at the harbor. Then he takes out his phone. “I would rather write it,” he says. “I have never once said it aloud to anyone who did not already know.”' },
        { wait: 3 },
        { sys: 'Your phone buzzes. He is standing two feet away.' },
        { go: 'how' },
      ],
      typed: [
        { wait: 6 },
        { typing: 4 },
        { wait: 8 },
        { typing: 2 },
        { wait: 10 },
        { go: 'how' },
      ],
      how: [
        { m: 'How long have you known?', d: 2.4 },
        { choice: [
          { t: "The 1926 photograph. Liyue Exchange. You're standing in the middle.", if: (s) => !!F(s).clue_archive, go: 'confess' },
          { t: 'The tea set. “For Morax — G.”', if: (s) => !!F(s).clue_inscription, go: 'confess' },
          { t: 'The Wangsheng invoice. The client is you.', if: (s) => !!F(s).clue_invoice, go: 'confess' },
          { t: "Since the opera, maybe. I just didn't want to say it.", go: 'confess' },
        ] },
      ],
      confess: [
        { wait: 4 },
        { m: 'Yes.', d: 1.6 },
        { wait: 3 },
        ...M(
          'I was Rex Lapis. Morax, to a very few. I made this harbor when it was a beach with a rock on it, and a great many contracts besides, and I have watched over it every day for six thousand years.',
          'On the first of October I decided that it no longer needed watching. So I died. It seemed the kindest thing I could do for it.',
          'The funeral is mine. Hu Tao knows; she has been unbearable about it. She keeps asking whether I would prefer to be buried facing the sea.',
          'What changes hands tomorrow is the Gnosis: the last piece of the god. After that I will be a consultant at a funeral parlor. A man who knows a great deal about tea, and has no money.',
        ),
        { wait: 4 },
        { m: 'I find I am looking forward to it more than I have looked forward to anything in a very long time.' },
        { typing: 5 },
        { wait: 4 },
        ...M(
          { m: 'He does not know.', d: 2 },
          'I have had six months to tell him and I have told him nothing. I said I read a great deal. I said I was older than I looked. Every word of it was true, which is the worst kind of lie, and the only kind I am still capable of telling.',
          'In August he told me he wanted to fight Rex Lapis. I told him I thought the god would find it refreshing.',
          { m: 'I have been trying ever since to decide whether to let him.', d: 3 },
        ),
        { fx: { set: { zl_confessed: true }, aff: { zl: 1 } } },
        { if: (s) => live(s), go: 'live_look' },
        { go: 'after' },
      ],
      live_look: [
        { wait: 2 },
        { sys: 'When you look up from the screen, he\'s watching the sea, not you. “There,” he says. “Now someone knows.”' },
        { go: 'after' },
      ],
      after: [
        { choice: [
          { t: 'Your secret is safe with me.', fx: { set: { morax_kept: true }, aff: { zl: 1 } }, go: 'kept' },
          { t: "You should tell him. And if you can't, I'll tell him on Monday. If you want me to.", fx: { set: { morax_tell: true }, aff: { zl: 2 } }, go: 'tell' },
          { t: "He'd still pay for dinner. You know that, right?", fx: { set: { morax_kept: true }, aff: { zl: 2 } }, go: 'dinner' },
          { t: 'Signora would pay a lot to know this.', go: 'sold' },
        ] },
      ],
      kept: M(
        { m: 'Thank you.', d: 1.6 },
        'I have kept a great many secrets for a great many people. It is strange, and not at all unpleasant, to have one kept for me.',
        { go: 'end' },
      ),
      tell: [
        { wait: 4 },
        ...M(
          { m: 'Yes.', d: 1.4 },
          'I think I would like that. I think I am a coward about exactly one thing, and it is him.',
          'Tell him on Monday, at the pier. Tell him the god he wanted to fight has been letting him pay for dinner for six months. Tell him I am sorry I did not say it myself. Tell him I will, if he asks.',
        ),
        { go: 'end' },
      ],
      dinner: M(
        { m: 'He would.', d: 1.6 },
        'He would ask me what Rex Lapis used to eat, and then insist on paying for it, and then add it to the ledger under "god stuff".',
        { m: 'Yes. I know that. It is the only reason I am not more afraid.', d: 2.6 },
        { go: 'end' },
      ),
      sold: [
        { wait: 6 },
        ...M(
          { m: 'I see.', d: 2 },
          'She would. She would pay a great deal, and she would use it to make tomorrow very much worse for everyone in this city, including the man whose phone you are holding.',
        ),
        { if: (s) => !!F(s).zl_contract, go: 'sold_contract' },
        { go: 'sold_end' },
      ],
      sold_contract: M('We have a contract. You are aware, I think, that what you have just written breaks its spirit, if not yet its letter.', { go: 'sold_end' }),
      sold_end: [
        { m: 'I will not stop you. I have never stopped anyone from breaking a contract. I have only ever made certain that they paid for it.' },
        { choice: [
          { t: "I didn't mean it. I'm sorry. That was a stupid thing to say.", fx: { set: { zl_threatened: true }, aff: { zl: -2 } }, go: 'unsold' },
          { t: 'I meant it.', go: 'meant' },
        ] },
      ],
      unsold: [
        { wait: 4 },
        ...M(
          'It was.',
          'I will choose to believe you. I am old enough to know that frightened people say things they would like back. I am also old enough to remember them.',
        ),
        { go: 'end' },
      ],
      meant: [
        { fx: { set: { morax_sold: true }, aff: { zl: -4 } } },
        { if: (s) => !!F(s).zl_contract, go: 'meant_broken' },
        { go: 'meant_end' },
      ],
      meant_broken: [{ fx: { set: { zl_broken: true } } }, { m: 'Then our contract is ended, by you, tonight. I will remember the hour.' }, { go: 'meant_end' }],
      meant_end: [
        { m: 'Goodnight.', d: 2 },
        { if: (s) => live(s), go: 'meant_live' },
        { go: 'end' },
      ],
      meant_live: [{ sys: 'He puts the phone away, bows to you exactly as politely as he did at the north stair, and walks into the dark between the lanterns.' }, { go: 'end' }],
      end: [
        free,
        { if: (s) => s.chapter === 'sat_night' && !started(s, 'zl_where'), go: 'to_where' },
      ],
      to_where: [{ start: 'zl_where', delay: 50 }],
      none: [{ end: true }],
    },
  });

  scene({
    id: 'zl_where', ch: 'sat_night', soft: true,
    trigger: { on: 'chapter', ch: 'sat_night', delay: 880 },
    when: (s) => !!F(s).zl_admitted && !F(s).morax_sold,
    nodes: {
      start: [
        { if: (s) => !F(s).zl_admitted || !!F(s).morax_sold, go: 'none' },
        { go: 'q' },
      ],
      q: hold('zl_where', 'go', 'q'),
      go: [
        lock('zl_where'),
        { m: 'It is late. Is there anything you would like to ask me, before I go home?' },
        { choice: [
          { t: 'Where is he? Really.', go: 'where' },
          { t: "Does he know about me? What's he like right now?", go: 'him' },
          { t: 'Will he be okay? After Monday?', go: 'after' },
          { t: 'Goodnight, xiansheng.', go: 'night' },
        ], timeout: 120, onTimeout: 'night' },
      ],
      where: [
        ...M(
          { m: 'He is safe. He asked me not to say.', d: 2 },
          { m: 'I keep my word, even when I wish I didn\'t.', d: 2.6 },
        ),
        { if: (s) => !!F(s).knows_hideout, go: 'where_coffin' },
        { go: 'night' },
      ],
      where_coffin: M('Though I suspect you already know. Last night something in a coffin began to beep, and Hu Tao screamed so loudly that the neighbours called the Millelith.', { go: 'night' }),
      him: [
        ...M(
          'He asks about you every few hours. Not your name; he does not know it. He asks whether "the phone person" is eating. He asks whether you have beaten Teucer\'s score.',
        ),
        { if: (s) => !!F(s).beat_teucer, go: 'him_beat' },
        { m: 'I told him I did not know. He said "tell them to TRY", in capital letters, out loud.' },
        { go: 'night' },
      ],
      him_beat: M('I told him you had. He was furious and delighted, in that order, and then delighted again.', { go: 'night' }),
      after: M('That depends on a great many things. Some of them are in your hands.', 'I do not say that to frighten you. I say it because I think you would rather know.', { go: 'night' }),
      night: [
        { m: 'Goodnight.', d: 1.6 },
        { if: (s) => !!F(s).ht_ally, go: 'ht' },
        free,
      ],
      ht: [{ m: 'Hu Tao asks me to tell you that you are "doing great, for a fake". She means it kindly. I think.' }, free],
      none: [{ end: true }],
    },
  });

  // Coffin Four beeps (Find My → Play Sound on his AirPods), once Zhongli is there.
  scene({
    id: 'zl_hideout', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !aware(s), go: 'none' },
        { go: 'q' },
      ],
      q: hold('zl_hideout', 'go', 'q'),
      go: [
        lock('zl_hideout'),
        ...M(
          'Something in Coffin Four has begun to beep.',
          'Hu Tao screamed. A client who was choosing an urn has left without choosing one.',
          'He has turned it off. He asks me to tell you, and I quote, "nice one, phone person. now STOP."',
          'I would add, on my own account, that the fewer people who hear coffins beep this weekend, the better.',
        ),
        free,
      ],
      none: [{ end: true }],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 5 — Sunday, "The Rite of Parting"
  // ════════════════════════════════════════════════════════════════════

  scene({
    id: 'zl_factory_manager', ch: 'sun_rite', soft: true,
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 40 },
    when: (s) => !!F(s).factory_zl || !!F(s).kids_zl,
    nodes: {
      start: hold('zl_factory_manager'),
      go: [
        lock('zl_factory_manager'),
        { m: 'Good morning.' },
        { if: (s) => !!F(s).kids_zl, go: 'home' },
        { go: 'elves' },
      ],
      home: M(
        'Teucer slept in my study, under the birdcage. Mora sang at a quarter to seven, as she does, and he woke up and asked whether the bird was also on strike.',
        { go: 'elves' },
      ),
      elves: [
        { if: (s) => !!F(s).factory_zl, go: 'elves_yes' },
        { go: 'tonia' },
      ],
      elves_yes: M(
        'He asked me over breakfast whether the elves had returned to work. I told him negotiations were ongoing.',
        'He has drafted a list of demands on a napkin. Item one is "more fish". Item two is "a day off for Sir Fang".',
        { go: 'tonia' },
      ),
      tonia: [
        { m: 'Tonia watched me pour the tea and asked where I had learned to do it. I said I had read a great deal. She did not believe me. She is very like her brother.' },
        { if: (s) => Number((s.sus && s.sus.tonia) || 0) >= 4, go: 'tonia_sus' },
        { go: 'ask' },
      ],
      tonia_sus: M('She also asked me, very quietly, whether her brother had been "replaced by someone nicer". I said that he had always been nice, and that she should ask him about the toys herself. She did not find this reassuring.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: 'Thank you for taking care of them, xiansheng.', fx: { aff: { zl: 1 } }, go: 'thanks' },
          { t: 'Did Teucer eat breakfast?', fx: { aff: { zl: 1 } }, go: 'ate' },
        ], timeout: 100, onTimeout: 'end' },
      ],
      thanks: M('It is the easiest thing I have been asked to do in a thousand years. Please do not tell them I said so.', { go: 'end' }),
      ate: M('Three bowls of congee and a sweet bun. He said Liyue breakfast is "the best breakfast in the universe except Mama\'s", and then made me promise not to tell Mama.', { go: 'end' }),
      end: [free],
    },
  });

  // The day-long funeral thread. It waits for four o'clock (the Golden House) and the message after it.
  scene({
    id: 'zl_rite', ch: 'sun_rite', required: true,
    trigger: { on: 'time', at: '+2 10:00' },
    expire: 'expire',
    nodes: {
      start: hold('zl_rite'),
      go: [
        lock('zl_rite'),
        { if: (s) => !!F(s).zl_confessed, go: 'own' },
        ...M(
          'The Rite has begun. Three thousand lanterns, every one of them moon-white. The Qixing are speaking.',
          'Ningguang is very good at this. She makes grief sound like a balance sheet that has finally come out even.',
          'I have organised a great many funerals. In the end they are all about the same thing: a contract that has come to its end, and the people left holding their half of it.',
          'What do you do with your half, when the other party is gone? I have never found a good answer. I have only found that people keep holding it anyway, out of habit, or out of love. In my experience it is difficult to tell those apart.',
        ),
        { go: 'kids' },
      ],
      own: M(
        'All of Liyue is wearing white. I am wearing brown. Hu Tao says this is "the single most disrespectful thing a corpse has ever done at its own funeral".',
        { m: 'It is strange to read one\'s own eulogy. The prose is adequate.', d: 2.6 },
        'The Tianquan has described me as "stern but just". I was hoping for "fond of tea".',
        { go: 'kids' },
      ),
      kids: [
        { if: (s) => !!(F(s).kids_zl || F(s).zl_pickup) && kidsSafe(s), go: 'kids_yes' },
        { go: 'guard' },
      ],
      kids_yes: M('Teucer is on my shoulders. He says he can see the whole harbor, and has asked whether the god will be buried with his fishing rod. I said probably not. He thinks this is a terrible oversight.', { go: 'guard' }),
      guard: [
        { if: (s) => !!F(s).lumine_guard, go: 'guard_yes' },
        { go: 'ask' },
      ],
      guard_yes: M('Your friend Lumine has been standing near the children all morning with one hand resting on her sword. Teucer finds this thrilling. So, I confess, do I.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: 'How are you holding up, xiansheng?', fx: { aff: { zl: 1 } }, go: 'holding' },
          { t: "Want me to say something nice about you? I've read the eulogy.", if: (s) => !!F(s).zl_confessed, go: 'nice' },
          { t: "I'm sorry for your loss.", go: 'sorry' },
          { t: '[Leave on read]', silent: true, go: 'day0' },
        ], timeout: 150, onTimeout: 'day0' },
      ],
      holding: [
        { if: (s) => !!F(s).zl_confessed, go: 'holding_true' },
        { m: 'Better than the deceased.', d: 1.8 },
        { go: 'day0' },
      ],
      holding_true: M('Better than the deceased. That is a joke I have now made eleven times this morning, and Hu Tao has forbidden me to make it again.', { go: 'day0' }),
      nice: [
        ...M({ m: 'Please don\'t.', d: 1.4 }, { wait: 3 }, { m: '…Perhaps one thing.', d: 2 }),
        { choice: [
          { t: "You're fond of tea.", fx: { aff: { zl: 1 } }, go: 'nice_tea' },
          { t: "You're the best dinner company in Liyue. He'd say so.", fx: { aff: { zl: 1 } }, go: 'nice_dinner' },
        ] },
      ],
      nice_tea: M('Thank you. That is the one I wanted.', { go: 'day0' }),
      nice_dinner: M('He would say it with his mouth full. Thank you.', { go: 'day0' }),
      sorry: [
        { if: (s) => !!F(s).zl_confessed, go: 'sorry_true' },
        { m: 'Thank you. He was very old, and very tired, and I believe he went exactly the way he wanted to.' },
        { go: 'day0' },
      ],
      sorry_true: M('Thank you. I was very old. It was time.', { go: 'day0' }),
      day0: [free, { go: 'day' }],
      day: [
        { if: (s) => past(s, '+2 15:58'), go: 'golden' },
        { wait: 6 },
        { go: 'day' },
      ],
      golden: [{ start: 'zl_amend' }, { go: 'amend_wait' }],
      amend_wait: [
        { if: (s) => finished(s, 'zl_amend'), go: 'msg' },
        { wait: 4 },
        { go: 'amend_wait' },
      ],
      msg: [{ start: 'zl_message', delay: 30 }, { go: 'msg_wait' }],
      msg_wait: [
        { if: (s) => finished(s, 'zl_message'), go: 'done' },
        { wait: 4 },
        { go: 'msg_wait' },
      ],
      done: [{ end: true }],
      // the chapter ended before four o'clock: the Golden House happens anyway
      expire: [
        { if: (s) => !!F(s).zl_knows_osial && !F(s).zl_amended && !F(s).morax_sold, go: 'expire_amend' },
      ],
      expire_amend: [
        { fx: { set: { zl_amended: true } } },
        ...M(
          'Four o\'clock. The Golden House. I have amended the contract.',
          'She will have what she came for. But any instrument of Northland\'s placed in Liyue\'s waters without the Qixing\'s consent is now forfeit to the Millelith, together with every authorisation that names it.',
          'A contract may be honored to the letter while its spirit is kept elsewhere.',
        ),
      ],
    },
  });

  // 16:00, the Golden House.
  scene({
    id: 'zl_amend', ch: 'sun_rite',
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_amend'),
      go: [
        lock('zl_amend'),
        { img: 'p_golden_house' },
        { m: 'I am at the Golden House. Signora is early. She is always early. I believe she regards punctuality as a form of threat.' },
        { if: (s) => !!F(s).zl_knows_osial && !F(s).morax_sold, go: 'amend' },
        { go: 'handover' },
      ],
      amend: [
        { wait: 6 },
        { typing: 5 },
        ...M(
          { m: 'I have amended the contract.', d: 2.4 },
          'The letter of it stands. She will have what she came for, and Liyue\'s debts are forgiven, exactly as written.',
          'But I have added a clause. Any instrument of Northland\'s placed in Liyue\'s waters without the consent of the Qixing is forfeit to the Millelith, together with every authorisation that names it.',
          'Her resonators at Guyun became the property of the harbor police the moment she signed. The document with his name on it now describes equipment Northland does not own.',
          'She read it twice. She signed anyway. She wants what is in the box very badly, and she believes the stone forest will wake for her tonight, clause or no clause.',
          'She may be right. But if it wakes, it will not be his name on the paper.',
          { m: 'A contract may be honored to the letter while its spirit is kept elsewhere.', d: 3 },
        ),
        { fx: { set: { zl_amended: true }, aff: { zl: 1 } } },
        { choice: [
          { t: "You're brilliant, xiansheng.", go: 'brilliant' },
          { t: 'Will it be enough?', go: 'enough' },
          { t: 'Thank you. For him.', fx: { aff: { zl: 1 } }, go: 'for_him' },
        ], timeout: 120, onTimeout: 'kids' },
      ],
      brilliant: M('I am old. It is often mistaken for brilliance. Thank you all the same.', { go: 'kids' }),
      enough: M('It will be enough for the paper. The sea is another matter. The sea has never read a contract in its life.', { go: 'kids' }),
      for_him: M('For him. And for you. You brought it to me. I only wrote it down.', { go: 'kids' }),
      handover: [
        { wait: 8 },
        { typing: 4 },
        ...M(
          'It is done. The Gnosis is in her hands. Liyue owes Northland nothing.',
          'I feel lighter than I expected, and older than I would like.',
        ),
        { if: (s) => !!F(s).morax_sold, go: 'sold' },
        { choice: [
          { t: 'Are you okay?', go: 'okay' },
          { t: 'What happens now?', go: 'now' },
          { t: '[Leave on read]', silent: true, go: 'kids' },
        ], timeout: 120, onTimeout: 'kids' },
      ],
      okay: M('I am a consultant at a funeral parlor with no money and a thrush. I am better than okay. Ask me again in a century.', { go: 'kids' }),
      now: M('Now I go home and make tea. And tonight, I imagine, Signora will ask his phone for something. I would think very carefully before you answer her.', { go: 'kids' }),
      sold: M(
        { m: 'She called me "Morax" as she signed. Twice.', d: 2.6 },
        { m: 'I did not teach her that word.', d: 2.4 },
        { go: 'kids' },
      ),
      kids: [
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'kids_yes' },
        free,
      ],
      kids_yes: [{ m: 'She mentioned the children. In passing. As though it were the weather. I want you to know that I noticed.' }, free],
    },
  });

  // "Will you carry a message to him tomorrow?"
  scene({
    id: 'zl_message', ch: 'sun_rite',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !!F(s).morax_sold || !!F(s).zl_broken, go: 'none' },
        { go: 'q' },
      ],
      q: hold('zl_message', 'go', 'q'),
      go: [
        lock('zl_message'),
        { if: (s) => !F(s).zl_contract, go: 'unsigned' },
        { m: 'May I ask something of you? Not under the contract. As a favour.' },
        { go: 'ask' },
      ],
      unsigned: M('I have no right to ask anything of you. I am going to ask anyway.', { go: 'ask' }),
      ask: [
        { m: 'Tomorrow you will give him back his phone. Will you carry a message to him, from me?', d: 3 },
        { choice: [
          { t: 'Of course. What do you want me to say?', fx: { set: { zl_message: true }, aff: { zl: 1 } }, go: 'promise' },
          { t: "Shouldn't you tell him yourself?", go: 'self' },
          { t: "No. I'm sorry. I think it has to come from you.", go: 'decline' },
        ] },
      ],
      self: [
        { if: (s) => !!F(s).zl_confessed, go: 'self_true' },
        { m: 'Yes. I should. I will. But I have learned that the things I mean to say myself have a way of waiting a very long time.' },
        { go: 'self_ask' },
      ],
      self_true: M('Yes. I should. I will. But I have learned that the things I mean to say myself have a way of waiting six thousand years.', { go: 'self_ask' }),
      self_ask: [
        { choice: [
          { t: 'Okay. Tell me. I\'ll carry it.', fx: { set: { zl_message: true }, aff: { zl: 1 } }, go: 'promise' },
          { t: "Then don't wait. Tell him Monday.", go: 'decline' },
        ] },
      ],
      decline: M({ m: 'Yes. You are right.', d: 1.8 }, 'I suspect I knew that when I asked.', { go: 'end' }),
      promise: [
        { if: (s) => !!F(s).memo_zl_sent, go: 'm_memo' },
        { if: (s) => !!F(s).clause_four, go: 'm_four' },
        { go: 'm_plain' },
      ],
      m_memo: [
        ...M(
          { m: 'Tell him: the answer is yes.', d: 2.6 },
          'He will know the question. He asked it on the fourth of October, into his phone, after a bottle and a half of osmanthus wine, and then told himself not to send it.',
          'You sent it anyway. He will be furious with you for about a minute. Then he will not be.',
          { m: 'And tell him Thursday is still his. This time I am paying.', d: 2.6 },
        ),
        { go: 'end' },
      ],
      m_four: [
        ...M('You have made this very difficult, with your fourth clause.'),
        { typing: 6 },
        { wait: 4 },
        { typing: 3 },
        ...M(
          'Tell him I would like to have dinner with him on Thursday, and that I will pay. Tell him that, and he will know the rest.',
          'I will tell him the rest myself, as the contract requires. I would rather not do it through a third party, however kind.',
        ),
        { go: 'end' },
      ],
      m_plain: [
        { if: (s) => !!F(s).rod_kept, go: 'm_plain_rod' },
        { m: 'Tell him that I went back to the pier for his rod.' },
        { go: 'm_plain_end' },
      ],
      m_plain_rod: [{ m: 'Tell him that you kept his rod, and that I am more grateful for that than is entirely reasonable.' }, { go: 'm_plain_end' }],
      m_plain_end: [
        ...M(
          'Tell him I have a birdcage for a thrush that has no intention of using it, and a tea set I did not pay for, and that it is his turn to choose the restaurant.',
          { m: 'Tell him: Thursday is still his. And this time I am paying.', d: 2.6 },
        ),
        { go: 'end' },
      ],
      end: [free],
      none: [{ end: true }],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 6 — Sunday night, "Osial"
  // ════════════════════════════════════════════════════════════════════

  scene({
    id: 'zl_vigil', ch: 'sun_night', soft: true,
    trigger: { on: 'chapter', ch: 'sun_night', delay: 200 },
    when: (s) => !F(s).osial_sent,
    nodes: {
      start: hold('zl_vigil'),
      go: [
        lock('zl_vigil'),
        ...M('I am at the harbor. The sea is too still.', 'In my experience, the sea is only this still when it is listening.'),
        { if: (s) => !!F(s).morax_sold, go: 'cold' },
        { if: (s) => !!F(s).zl_amended, go: 'amended' },
        { if: (s) => !!F(s).zl_knows_osial, go: 'knows' },
        { m: 'I do not know exactly what she has asked of him. I know only that something under Guyun is turning over in its sleep, and that Signora has been smiling all day.' },
        { go: 'kids' },
      ],
      cold: M('I imagine she will ask you for something tonight. I imagine you will decide what to give her. I have stopped imagining what you will decide.', { go: 'end' }),
      amended: M(
        'Signora will ask you for the code tonight, I imagine. He kept it in a locked note, which is the first place anyone would look.',
        'Whatever you send her, her resonators now belong to the harbor police. But the stone forest does not read contracts. If that code reaches Unit 3, it will wake, and I will have to go and stand in front of it.',
        { m: 'I would rather you sent her nothing.', d: 2.4 },
        { go: 'kids' },
      ),
      knows: M('Signora will ask you for the code tonight. I could not answer her in time with ink. Please— send her nothing.', { go: 'kids' }),
      kids: [
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'kids_yes' },
        { go: 'ask' },
      ],
      kids_yes: M('She has the children at her hotel. She will use them tonight. When she does, remember that a contract signed under a threat binds no one. I would know. I have torn up several.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: "I won't send it.", fx: { set: { zl_vigil_promise: true }, aff: { zl: 1 } }, go: 'wont' },
          { t: 'What if she hurts the kids?', if: (s) => !kidsSafe(s), go: 'hurt' },
          { t: 'Stay with me while it happens?', fx: { aff: { zl: 1 } }, go: 'stay' },
          { t: "If she asks, I'll tell her to ask the founder.", if: (s) => !!F(s).zl_knows_osial, go: 'founder' },
          { t: '[Leave on read]', silent: true, go: 'end' },
        ], timeout: 120, onTimeout: 'end' },
      ],
      wont: M('Thank you. Then we will wait together.', { go: 'end' }),
      hurt: M('Then I will be very angry. I have not been very angry in a long time. Liyue has a great many stories about the last time, and most of them have been toned down for children.', { go: 'end' }),
      stay: M('I am not going anywhere. I am, as you know, a very patient man.', { go: 'end' }),
      founder: M({ m: '…Yes. Do that.', d: 2 }, 'She will not understand it. I will.', { go: 'end' }),
      end: [free],
    },
  });

  // After the deadline: the sea, either way.
  scene({
    id: 'zl_sea', ch: 'sun_night',
    trigger: [{ on: 'flag', flag: 'osial_sent', delay: 25 }, { on: 'time', at: '+2 23:15' }],
    nodes: {
      start: [
        { if: (s) => !!F(s).osial_sent, go: 'now' },
        { go: 'q' },
      ],
      // the sea does not wait for a free thread
      now: [
        { if: (s) => held(s), go: 'now_cancel' },
        { go: 'sent' },
      ],
      now_cancel: [{ run: (api) => { const b = api.state.flags.busy_zl; if (b && b !== 'zl_sea') cancel(b).run(api); } }, { go: 'sent' }],
      q: hold('zl_sea', 'still', 'q'),
      sent: [
        lock('zl_sea'),
        { wait: 4 },
        { typing: 3 },
        { wait: 6 },
        { img: 'p_storm_guyun', d: 1.6 },
        ...M(
          { m: 'You sent it.', d: 2 },
          'The stone forest is awake. I can see it from the harbor: the water around Guyun is turning, slowly, like a key in a lock.',
        ),
        { if: (s) => !!F(s).zl_contract && !F(s).zl_broken, go: 'sent_broken' },
        { if: (s) => !!F(s).zl_broken, go: 'sent_judge' },
        ...M(
          'I made no contract with you, so you have broken nothing of mine. Remember that, later, when people tell you what you have done. It will not help, but it is true.',
          'I am going to go and stand in front of the sea now.',
        ),
        { go: 'sent_after' },
      ],
      sent_broken: [
        ...M(
          { m: 'I am going to stop it.', d: 2 },
          'To do that I must be, for one night, the thing I promised Signora I would no longer be. Our contract does not survive it. Neither does the other one. I signed both in good faith, and I am breaking both, and it is because of you.',
        ),
        { fx: { set: { zl_broken: true }, aff: { zl: -3 } } },
        { wait: 6 },
        { m: 'I do not know your reasons. I hope they were good ones. I am going to go and stand in front of the sea now.' },
        { go: 'sent_after' },
      ],
      sent_judge: M('You have already shown me what you think a contract is worth. I will not ask you why. I am going to go and stand in front of the sea.', { go: 'sent_after' }),
      sent_after: [
        free,
        { wait: 40 },
        { if: (s) => held(s), go: 'sent_after_wait' },
        { go: 'sent_calm' },
      ],
      sent_after_wait: [{ wait: 5 }, { go: 'sent_after' }],
      sent_calm: [
        lock('zl_sea'),
        ...M(
          'It is asleep again, under rather more stone than before.',
          'The harbor is wet, and frightened, and alive. That will have to be enough.',
        ),
        { if: (s) => !!F(s).zl_broken, go: 'sent_cost' },
        free,
      ],
      sent_cost: [{ m: 'It cost me a promise to make it so. I had not broken one in a very long time. I would rather not discuss it.' }, free],
      still: [
        lock('zl_sea'),
        { if: (s) => osialStopped(s), go: 'stopped' },
        ...M(
          'Eleven o\'clock has come and gone, and the sea is still. You did not send her the code. Thank you.',
          'But she will not stop because you refused her. She will simply find another way, or another name to put on the paper. Tomorrow will be difficult for him.',
        ),
        free,
      ],
      stopped: [
        ...M(
          'Eleven o\'clock has come and gone.',
          'The water at Guyun is perfectly still. Not listening any more. Only still, the way water is when nothing is asking anything of it.',
          { m: 'I have watched this sea for a very long time. I do not think I have ever been so glad to see it do nothing.', d: 3 },
        ),
        { if: (s) => !!F(s).osial_founder, go: 'stopped_founder' },
        { if: (s) => !!F(s).zl_amended, go: 'stopped_amended' },
        { go: 'stopped_more' },
      ],
      stopped_founder: M('You told her to ask the founder. She did not understand it. I did. The stone forest and I had a short conversation at eleven o\'clock, and it has agreed to go back to sleep.', { go: 'stopped_amended_q' }),
      stopped_amended_q: [
        { if: (s) => !!F(s).zl_amended, go: 'stopped_amended' },
        { go: 'stopped_more' },
      ],
      stopped_amended: M('The Millelith have taken custody of three Northland resonators, which they found exactly where the protocol said they would be. They were very polite about it. Signora was not.', { go: 'stopped_more' }),
      stopped_more: [
        { if: (s) => !!F(s).card_frozen, go: 'frozen' },
        { go: 'stopped_more2' },
      ],
      frozen: M('I gather his card is frozen. Hu Tao says a three-million-Mora transfer bounced off it like a fish off a window.', { go: 'stopped_more2' }),
      stopped_more2: [
        { if: (s) => !!F(s).ops_sabotage, go: 'ops' },
        { if: (s) => !!F(s).leaked_yelan || !!F(s).leaked_ning, go: 'leak' },
        { go: 'stopped_ask' },
      ],
      ops: M('I am also told that the Liyue Branch of Northland Bank sabotaged its own equipment tonight, with what Hu Tao describes as "a vending machine and a great deal of love". I would like to meet them.', { go: 'stopped_ask' }),
      leak: M('And someone in the Qixing has been reading Signora\'s mail. I wonder who could have arranged that.', { go: 'stopped_ask' }),
      stopped_ask: [
        { choice: [
          { t: 'We did it, xiansheng.', fx: { aff: { zl: 1 } }, go: 'did' },
          { t: 'Are you okay?', go: 'okay' },
        ], timeout: 120, onTimeout: 'end' },
      ],
      did: M('We did. You did. I mostly watched. I am, it turns out, very good at watching.', { go: 'end' }),
      okay: M('I am— yes. I am tired, in the particular way one is tired after something terrible has not happened.', { go: 'end' }),
      end: [free],
    },
  });

  /** "Will he come back?" — the prompted moment for the memo (Sunday 02:10, or Monday dawn if the night ran out) */
  function willHe(def, morning) {
    const id = def.id;
    return scene(Object.assign(def, {
      soft: false,
      nodes: Object.assign({
        start: [
          { if: (s) => !F(s).zl_admitted || !!F(s).morax_sold || !!F(s).zl_broken, go: 'none' },
          { go: 'q' },
        ],
        q: hold(id, 'go', 'q'),
        go: [
          lock(id),
          { if: () => morning, go: 'dawn' },
          ...M(
            'You are awake. I can tell; the little word under my message says "Read".',
            'I have been sitting at the harbor for some hours. Mora is asleep. Hu Tao is asleep on Coffin Two. He is asleep in Coffin Four, I think, though with him one can never be entirely sure.',
          ),
          { go: 'north' },
        ],
        dawn: M(
          'Good morning. I did not sleep. I sat at the harbor and watched the sea do nothing, which it did very well.',
          { go: 'north' },
        ),
        north: [
          { if: (s) => recalled(s), go: 'north_yes' },
          { go: 'q2' },
        ],
        north_yes: M('Signora has written to the Tsaritsa. If he is called north, there is a ferry at six on Monday evening, and he will be on it, because he always does what he is told, right up until the moment he does not.', { go: 'q2' }),
        q2: [
          ...M(
            'May I ask you something? You have known him for three days, from the inside. I have known him six months, from across a table.',
            { m: 'Will he come back?', d: 3 },
          ),
          { choice: [
            { t: '[Send him “for xiansheng (don’t send)”]', silent: true, if: (s) => !!F(s).memo_zl_heard && !F(s).memo_zl_sent && !F(s).zl_memo_done, go: 'memo' },
            { t: 'Read the last line.', label: '[Send him the Ledger]', if: (s) => !!F(s).ledger_read && !F(s).ledger_shared, send: [{ img: 'p_ledger' }], go: 'ledger' },
            { t: 'He\'ll come back. He always comes back for you. Every Thursday.', fx: { aff: { zl: 2 } }, go: 'back' },
            { t: "I don't know. But if I were him, I would.", fx: { aff: { zl: 1 } }, go: 'honest' },
            { t: "Ask him. Tomorrow. Don't wait for him to send you something.", fx: { aff: { zl: 1 } }, go: 'ask' },
            { t: '[Leave on read]', silent: true, go: 'quiet' },
          ] },
        ],
        memo: [free, sendMemo, { end: true }],
        back: [
          ...M(
            { m: 'Every Thursday.', d: 2 },
            'He does, doesn\'t he. Even the week of the ribs. He came with his arm strapped to his side, and ordered with his left hand, and spilled the tea, and paid anyway.',
            'Thank you.',
          ),
          { go: 'end' },
        ],
        honest: M('That is a better answer than certainty. Thank you.', { go: 'end' }),
        ask: M('You are the second person this week to tell me not to wait. The first was a girl of nineteen who runs a funeral parlor. I am beginning to suspect the young are trying to tell me something.', { go: 'end' }),
        quiet: [{ typing: 3 }, { m: 'Goodnight.', d: 1.4 }, { go: 'end' }],
        end: [free],
        none: [{ end: true }],
      }, ledgerNodes('end')),
    }));
  }

  willHe({ id: 'zl_will_he', ch: 'sun_night', trigger: { on: 'time', at: '+3 02:10' } }, false);

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 7 — Monday, "Northbound"
  // ════════════════════════════════════════════════════════════════════

  willHe({
    id: 'zl_will_he_dawn', ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 25 },
    when: (s) => !s.done || !s.done.zl_will_he || s.done.zl_will_he === 'expired',
  }, true);

  scene({
    id: 'zl_monday', ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 120 },
    nodes: {
      start: hold('zl_monday'),
      go: [
        lock('zl_monday'),
        { if: (s) => !!F(s).zl_broken || !!F(s).morax_sold, go: 'judge' },
        { if: (s) => signed(s), go: 'kept' },
        { if: (s) => !!F(s).zl_admitted, go: 'unsigned' },
        { go: 'stranger' },
      ],
      // ── the judge ──
      judge: [
        { m: 'Good morning.' },
        { if: (s) => !!F(s).zl_broken, go: 'judge_sea' },
        { go: 'judge_name' },
      ],
      judge_sea: M('The stone forest is asleep, under rather more stone than before. I have not slept.', { go: 'judge_name' }),
      judge_name: [
        { if: (s) => !!F(s).morax_sold, go: 'judge_sold' },
        { go: 'judge_end' },
      ],
      judge_sold: M('Signora knows my name. I assume you are satisfied.', { go: 'judge_end' }),
      judge_end: [
        ...M(
          'At half past five you will give him back his phone. I will not be at the pier.',
          'He does not need to know what passed between us. I will not tell him. Not to protect you. To protect him from knowing that the person who held his life this weekend held it so carelessly.',
          { m: 'Goodbye.', d: 1.6 },
        ),
        { choice: [
          { t: "I'm sorry.", go: 'judge_sorry' },
          { t: '[Say nothing]', silent: true, go: 'end' },
        ], timeout: 120, onTimeout: 'end' },
      ],
      judge_sorry: M('I know. It is not enough. It rarely is. Goodbye.', { go: 'end' }),
      // ── never signed ──
      unsigned: [
        { if: (s) => !F(s).ws_talked, go: 'unsigned_missed' },
        { m: 'Good morning. He telephoned you at eight, from the parlor\'s landline. I was in the next room making tea. He will collect his phone from you at Pier 7 this evening.' },
        { go: 'unsigned2' },
      ],
      unsigned_missed: M('Good morning. He tried to telephone you at eight, from the parlor. He is coming to Pier 7 this evening regardless. He has never once waited to be invited.', { go: 'unsigned2' }),
      unsigned2: [
        ...M(
          'We never had a contract, you and I. I find, on reflection, that I am sorry about that. I think it would have been a good one.',
          'Thank you for keeping his phone alive. Whatever else, you did that.',
        ),
        { go: 'end' },
      ],
      stranger: [
        ...M(
          'Good morning. I gather from Hu Tao that his phone will find its way back to him at Pier 7 this evening.',
          'You never told me who you were. I never made you. I think, now, that I should have asked more gently.',
          'Goodbye, whoever you are.',
        ),
        { go: 'end' },
      ],
      // ── the contract kept ──
      kept: [
        { if: (s) => !F(s).ws_talked, go: 'kept_missed' },
        ...M(
          'Good morning. He telephoned you at eight, from the parlor\'s landline. I was in the next room making tea. I heard every word he said and none of yours, which I imagine is how most people experience him.',
          'He knows you will be at Pier 7 at half past five. He has asked me to tell you that he is "going to hug you, sorry in advance".',
        ),
        { go: 'kept_last' },
      ],
      kept_missed: M(
        'Good morning. He tried to telephone you at eight, from the parlor. You did not answer. He is coming to Pier 7 at half past five regardless, and he has asked me to warn you that he intends to hug you.',
        { go: 'kept_last' },
      ),
      kept_last: [
        ...M(
          'So this is the last day of our contract.',
        ),
        { if: (s) => Number(F(s).clause_struck || 0) === 1 && !kidsSafe(s), go: 'kept_most' },
        { m: 'Thank you for keeping your word.', d: 2.6 },
        { go: 'kept_kids' },
      ],
      kept_most: M({ m: 'Thank you for keeping most of your word. I kept the rest.', d: 2.6 }, { go: 'kept_kids' }),
      kept_kids: [
        { if: (s) => kidsSafe(s), go: 'kept_kids_yes' },
        { go: 'kept_name' },
      ],
      kept_kids_yes: M('Teucer and Tonia are safe, and will be on their plane at ten past one. Teucer has asked whether the elves will be at the airport. I have said they are shy.', { go: 'kept_name' }),
      kept_name: [
        { if: (s) => !!F(s).zl_amended && !F(s).osial_sent, go: 'kept_name_yes' },
        { go: 'kept_pay' },
      ],
      kept_name_yes: M('His name is not on anything that matters any more.', { go: 'kept_pay' }),
      kept_pay: [
        { if: (s) => !!F(s).clause_pay, go: 'kept_pay_yes' },
        { go: 'kept_ask' },
      ],
      kept_pay_yes: M(
        'I have also, as promised, paid for something.',
        'I have settled his tab at Heyu. Five thousand three hundred and twenty Mora. The proprietor wept. I have kept the receipt for his ledger, in the other column.',
        { go: 'kept_ask' },
      ),
      kept_ask: [
        { choice: [
          { t: 'It was an honour, xiansheng.', fx: { aff: { zl: 1 } }, go: 'honour' },
          { t: 'Will I ever hear from you again? After tonight?', go: 'again' },
          { t: 'Same time Thursday?', go: 'thursday' },
        ], timeout: 150, onTimeout: 'smile' },
      ],
      honour: M('The honour was mine. I mean that in the old way, the way it was meant before people started saying it at the end of letters.', { go: 'smile' }),
      again: M('If you are ever in want of a consultant on Liyue customs, I am told I am very expensive. You know where the parlor is. Knock twice on Coffin Four; it is a tradition now.', { go: 'smile' }),
      thursday: M({ m: 'Thursday belongs to him.', d: 2 }, 'But Wednesdays, I find, are free. They used to be his too. Ask me again when you are not holding his phone.', { go: 'smile' }),
      smile: [
        { if: (s) => AFF(s) >= 6 && !F(s).osial_sent, go: 'smile_yes' },
        { m: 'Goodbye, for now.', d: 1.6 },
        { go: 'end' },
      ],
      smile_yes: [
        { wait: 4 },
        { m: 'Hu Tao has been teaching me to use these. She says it is time.', d: 2.6 },
        { wait: 3 },
        { m: '🙂', d: 3 },
        { go: 'end' },
      ],
      end: [free],
    },
  });

  // 12:40 — the children fly home.
  scene({
    id: 'zl_monday_kids', ch: 'mon', soft: true,
    trigger: { on: 'time', at: '+3 12:40' },
    when: (s) => (!!F(s).zl_pickup || !!F(s).kids_zl) && !F(s).morax_sold,
    nodes: {
      start: hold('zl_monday_kids'),
      go: [
        lock('zl_monday_kids'),
        { m: 'I am at the airport again. They are through security.' },
        { if: (s) => !!F(s).factory_zl, go: 'drawing' },
        { go: 'tonia' },
      ],
      drawing: M('Teucer has given me a drawing "for the elves". It shows a factory, a great many elves, a fish, and a large man in a brown coat labelled MANAGER (NICE). I am going to frame it.', { go: 'tonia' }),
      tonia: [
        { if: (s) => !!F(s).told_tonia, go: 'tonia_knows' },
        { m: 'Tonia shook my hand at the gate and looked at me for a long time. Then she said, "Tell my brother he\'s a terrible liar." I said I would pass it on. I did not say to whom.' },
        { go: 'doc' },
      ],
      tonia_knows: M('Tonia shook my hand at the gate and said, "Look after him." I said I would try. She said, "Not him. The one who has his phone."', { go: 'doc' }),
      doc: [
        { if: (s) => !!F(s).dottore_cancelled, go: 'doc_off' },
        { if: (s) => !F(s).arle_protects, go: 'doc_on' },
        { go: 'end' },
      ],
      doc_off: M('Teucer\'s nine o\'clock appointment was cancelled, I gather. He spent the morning at the harbor aquarium instead, which he says was "a hundred times better than a doctor". It was.', { go: 'end' }),
      doc_on: M('There was a man in a beaked mask in the departure hall. He watched them go through security, and then he left. I do not think he had expected them to be leaving.', { go: 'end' }),
      end: [free],
    },
  });

  // 16:45 — before the pier.
  scene({
    id: 'zl_monday_pier', ch: 'mon',
    trigger: { on: 'time', at: '+3 16:45' },
    when: (s) => !!F(s).zl_admitted && !F(s).morax_sold && !F(s).zl_broken,
    nodes: {
      start: hold('zl_monday_pier'),
      go: [
        lock('zl_monday_pier'),
        { m: 'I will be at the pier. Not with him; a little way off, by the lantern. I would like to see your face when you give it back.' },
        { if: (s) => !!F(s).zl_message && !F(s).zl_said_ajax, go: 'ajax' },
        { go: 'god' },
      ],
      ajax: [
        ...M(
          'One more thing, when he sits down beside you, before you give it back. Say his name for me. His real one.',
          { wait: 3 },
          { m: 'Ajax.', d: 3 },
          { wait: 3 },
          'I have never once said it to him. I would like the first time to be in a voice he trusts, even if it is not mine.',
        ),
        { fx: { set: { zl_said_ajax: true } } },
        { go: 'god' },
      ],
      god: [
        { if: (s) => !!F(s).morax_tell, go: 'god_yes' },
        { go: 'north' },
      ],
      god_yes: M('And the other thing. Tell him about the god. I would rather he heard it from you than from Signora\'s next letter.', { go: 'north' }),
      north: [
        { if: (s) => recalled(s) && !!F(s).memo_zl_sent && AFF(s) >= 5, go: 'north_yes' },
        { go: 'ask' },
      ],
      north_yes: M('I have been looking at the ferry timetable. There is a sailing north at six. I have not decided anything. I want you to know that I am looking at it.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: "I'll be there.", go: 'there' },
          { t: 'Come and stand with us.', go: 'stand' },
          { t: 'Will you be okay?', go: 'okay' },
        ], timeout: 120, onTimeout: 'end' },
      ],
      there: M('I know. I have never once doubted that you would be.', { go: 'end' }),
      stand: M('No. This part is yours. I will have him for a great deal longer than you will.', { go: 'end' }),
      okay: [
        { if: (s) => !!F(s).zl_confessed, go: 'okay_true' },
        { m: 'I will be. I have had a great deal of practice.' },
        { go: 'end' },
      ],
      okay_true: M('I have been okay for six thousand years. I would like, now, to try being happy. I am told it is a different discipline.', { go: 'end' }),
      end: [free],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // THE CLIMAX — "for xiansheng (don't send)" reaches him (any time)
  // ════════════════════════════════════════════════════════════════════

  /** clear the thread for the memo: drop unscripted replies, end interruptible scenes, no suspicion for his own voice */
  const clearForMemo = { run: (api) => {
    const d = api.state;
    const defs = JC.story.defs.scenes;
    d.runs.slice().forEach((r) => {
      const sc = r.kind === 'scene' ? defs[r.sc] : null;
      const aside = r.kind === 'aside' && r.th === 'zl';
      const soft = !!(sc && sc.thread === 'zl' && sc.soft && r.sc !== 'zl_memo');
      if (!aside && !soft) return;
      Object.keys(d.threads).forEach((k) => { const t = d.threads[k]; if (t.pend && t.pend.rid === r.rid) { t.pend = null; JC.bus.emit('story:pending', { thread: k }); } });
      if (soft) d.fin[r.sc] = d.eng || 1;
      const i = d.runs.indexOf(r);
      if (i >= 0) d.runs.splice(i, 1);
    });
    const b = d.flags.busy_zl;
    if (b && defs[b] && defs[b].soft) d.flags.busy_zl = false;
    if (d.threads.zl) { d.threads.zl.typing = null; JC.bus.emit('story:typing', { thread: 'zl', who: null }); }
    if ((d.sus.zl || 0) > 0) JC.story.applyFx({ sus: { zl: -1 } });
  } };

  scene({
    id: 'zl_memo',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        clearForMemo,
        { fx: { set: { zl_memo_done: true }, aff: { zl: 3 } } },
        { go: 'q' },
      ],
      q: hold('zl_memo', 'go', 'q'),
      go: [
        lock('zl_memo'),
        { if: (s) => !!F(s).zl_memo_via && F(s).zl_memo_via !== 'zl', go: 'group' },
        { go: 'silence' },
      ],
      // sent into a group he is in (the hotpot crew, re-added by Hu Tao)
      group: [
        { run: (api) => {
          const th = api.state.flags.zl_memo_via;
          const say = (from, text) => { try { if (JC.story.members(th).includes(from)) api.story.incoming(th, { from, text }); } catch (e) { /* ignore */ } };
          say('paimon', 'IS THAT CHILDE\'S VOICE??? 😱');
          say('ht', 'oh no. oh no no no 👻');
          say('lumine', 'everyone stop talking.');
          try { api.story.incoming(th, { from: 'sys', sys: true, text: JC.contacts.name('zl') + ' left the conversation.' }); } catch (e) { /* ignore */ }
          try { const st = api.state.threads[th]; if (st) st.members = JC.story.members(th).filter((m) => m !== 'zl'); } catch (e) { /* ignore */ }
        } },
        { wait: 8 },
        ...M(
          { m: 'You sent that to the hotpot group.', d: 2.4 },
          { m: 'I have left the hotpot group again. This time I did not misread the button.', d: 3 },
        ),
        { go: 'silence' },
      ],
      silence: [
        { wait: 5 },
        { typing: 4 },
        { wait: 9 },
        { typing: 7 },
        { wait: 6 },
        { typing: 2 },
        { wait: 12 },
        { typing: 9 },
        { wait: 3 },
        { if: (s) => !aware(s), go: 'early' },
        { go: 'main' },
      ],
      // Friday, before one o'clock: he believes Childe sent it.
      early: [
        { fx: { set: { zl_memo_early: true } } },
        ...M(
          { m: 'Childe.', d: 2 },
          { wait: 4 },
          'I have listened to it three times.',
          'You recorded this on the fourth. I remember the fourth. You hummed in the car, and at eight minutes to midnight you wrote "xiansheng", and then "nvm", and I told you that whatever it was, it would keep.',
          { m: 'It kept.', d: 2.4 },
        ),
        { typing: 6 },
        { wait: 4 },
        ...M(
          'I am not going to answer it tonight.',
          'Not because I do not have an answer. Because you made this a little drunk, and sent it a little frightened, and I would like to give you my answer across a table, sober, with the bill on your side of it, as it always is.',
          { m: 'Thursday.', d: 1.6 },
          'Bring this. Bring your wallet. I will bring the rest.',
        ),
        { choice: [
          { t: '…ok', go: 'early_ok' },
          { t: 'xiansheng I—', go: 'early_i' },
          { t: '[Say nothing]', silent: true, go: 'end' },
        ], timeout: 120, onTimeout: 'end' },
      ],
      early_ok: M({ m: 'Good.', d: 1.6 }, 'Go to sleep, Childe.', { go: 'end' }),
      early_i: M({ m: 'Thursday.', d: 1.6 }, 'Go to sleep.', { go: 'end' }),
      // He knows the stranger sent it.
      main: [
        ...M(
          { m: 'I have listened to it four times.', d: 2.4 },
          'I know whose voice that is. I know whose hand sent it. I am not certain which of you I ought to answer, so I am going to answer both, and you will forgive me if the result is long. I have been brief about this for six months. I find I have run out of brevity.',
        ),
        { if: (s) => !!F(s).zl_confessed, go: 'main_god' },
        { m: 'When I was young— younger than you would believe— I made a great many contracts. I learned very early that everything has a price, and that the price is always paid, by someone, eventually. I have spent a very long time making certain it was paid fairly.' },
        { go: 'main2' },
      ],
      main_god: M('When I was young, six thousand years ago, I made a great many contracts. I learned very early that everything has a price, and that the price is always paid, by someone, eventually. I have spent a very long time making certain it was paid fairly.', { go: 'main2' }),
      main2: [
        ...M(
          'And then a loud young man from Snezhnaya asked me to dinner to discuss the correct temperature of tea for a bank gala. And paid. And asked me again. And paid again. And kept a ledger that he thought I did not know about.',
          { m: 'I knew about the ledger.', d: 2 },
          'I never carried money to those dinners. He is right. I did it on purpose.',
          'I told myself it was a small game between us: that a man who has been owed things for a very long time might be permitted, once, the novelty of owing someone.',
          { wait: 3 },
          { m: 'That was not the reason.', d: 2.4 },
          { m: 'The reason was that as long as I owed him, he would keep coming back to collect.', d: 3.4 },
        ),
        { typing: 8 },
        { wait: 5 },
        ...M(
          'He says it is the stupidest sentence he has ever said.',
          'He is wrong. It is only the second stupidest. The stupidest is the one I have been not saying since April.',
        ),
        { typing: 4 },
        { wait: 6 },
        { typing: 3 },
        { wait: 4 },
        { if: (s) => !!F(s).zl_said_ajax, go: 'main_no_name' },
        { m: 'Ajax.', d: 3.6 },
        { fx: { set: { zl_said_ajax: true } } },
        { wait: 6 },
        { m: 'No. Forgive me. That is not yours. It was never meant for this thread, or for your eyes, however kind they are.' },
        { go: 'main3' },
      ],
      main_no_name: [{ wait: 4 }, { m: 'No. That is not for this thread, or for your eyes, however kind they are.' }, { go: 'main3' }],
      main3: [
        ...M(
          'I will say it to him. On Monday, if he will let me. In person, across a table, with the bill on his side of it. Some things should be said in the right voice.',
          { wait: 3 },
          'He told you not to send it. "Ajax, do not send this." He was very clear.',
          { m: 'And you sent it anyway.', d: 2.4 },
          { wait: 3 },
          { m: 'Thank you.', d: 2.4 },
        ),
        { choice: [
          { t: 'He meant every word.', go: 'meant' },
          { t: "I'm sorry. It wasn't mine to send.", go: 'sorry' },
          { t: 'Tell him yourself. Monday.', go: 'monday' },
          { t: '[Say nothing]', silent: true, go: 'nothing' },
        ] },
      ],
      meant: M(
        { m: 'I know.', d: 1.6 },
        'He is a very bad liar after osmanthus wine. It is one of the things I love about him.',
        { wait: 4 },
        { m: 'There. I have said it to the wrong person. That will have to do for practice.', d: 3 },
        { go: 'close' },
      ),
      sorry: M('No, it was not. You did it anyway, knowing that. That is the kind of wrong thing that only kind people do.', { go: 'close' }),
      monday: M('I will. I promise. And I am, as you may have noticed, very good at keeping promises.', { go: 'close' }),
      nothing: M('Thank you for not saying anything. I would not have known what to do with it.', { go: 'close' }),
      close: [
        { wait: 3 },
        { m: 'I am going to go and sit by the sea for a while.', d: 2.4 },
        { go: 'end' },
      ],
      end: [free],
    },
  });
})();
