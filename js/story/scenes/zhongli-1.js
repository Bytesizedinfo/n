/* Live scenes — the Zhongli route, part 1: shared kit, app-act reactions, chapters 1–3.
   Friday night ("The Bill"), Saturday morning ("Cranes": he knows, the contract), Saturday afternoon ("The Opera").
   Facts: docs/STORY.md (Zhongli — the spine). Engine: docs/DEV.md. Owner: S1.

   Thread lock: every scene here talks in the `zl` thread. A scene holds the thread while it waits on the player
   (flag busy_zl = its own scene id) and the lock frees itself when that scene finishes or expires, so a chapter
   ending mid-conversation never leaves the thread stuck. Scenes marked `soft` may be interrupted by the voice memo
   (the climax, in zhongli-2.js). */
(function () {
  'use strict';
  const JC = window.JC;
  const S = JC.story;

  // ── Kit (shared with zhongli-2.js) ─────────────────────────────────
  const F = (s) => (s && s.flags) || {};
  const AFF = (s) => Number((s && s.aff && s.aff.zl) || 0);
  const SUS = (s, id) => Number((s && s.sus && s.sus[id || 'zl']) || 0);
  const T = (x) => JC.time.parse(x);
  const past = (s, x) => s.now >= T(x);
  const started = (s, id) => !!(s.done && s.done[id]);
  const finished = (s, id) => !!(s.fin && s.fin[id]) || (s.done && (s.done[id] === 'skipped' || s.done[id] === 'expired'));
  /** the zl thread is held by a scene that is still running */
  const held = (s) => { const b = F(s).busy_zl; return !!b && !!s.done && s.done[b] === 1 && !(s.fin && s.fin[b]); };
  /** a node that waits until the thread is free (or ours), then goes to `next`; `self` = the node's own name */
  const hold = (id, next, self) => [
    { if: (s) => !held(s) || F(s).busy_zl === id, go: next || 'go' },
    { wait: 3 },
    { go: self || 'start' },
  ];
  const lock = (id) => ({ fx: { set: { busy_zl: id } } });
  const free = { fx: { set: { busy_zl: false } } };
  /** end another zl scene now (its pending choice disappears; it counts as finished) */
  const cancel = (id) => ({ run: (api) => {
    const d = api.state;
    d.runs.slice().forEach((r) => {
      if (r.kind !== 'scene' || r.sc !== id) return;
      Object.keys(d.threads).forEach((k) => { const t = d.threads[k]; if (t.pend && t.pend.rid === r.rid) { t.pend = null; JC.bus.emit('story:pending', { thread: k }); } });
      d.fin[id] = d.eng || 1;
      const i = d.runs.indexOf(r);
      if (i >= 0) d.runs.splice(i, 1);
    });
    if (d.flags.busy_zl === id) d.flags.busy_zl = false;
    JC.bus.emit('story:thread', { thread: 'zl' });
  } });
  /** Zhongli has known since ~01:00 Saturday that the phone is not with Childe (he saw him at Wangsheng) */
  const aware = (s) => !!F(s).zl_admitted || past(s, '+1 00:58');
  const helper = (name, alt) => { const h = JC.storyHelpers || {}; return h[name] || h[alt] || null; };
  const kidsSafe = (s) => {
    const fn = helper('kids_safe', 'kidsSafe');
    if (fn) { try { return !!fn(s); } catch (e) { /* fall through */ } }
    const f = F(s);
    if (f.fatui_pickup && !f.kids_rescued) return false;
    const pick = f.zl_pickup || f.lumine_pickup || f.ekat_pickup || (f.ride_kids && f.told_tonia);
    return !!((pick && !f.kids_grand && !f.kids_apartment) || f.yelan_protects_kids || f.kids_rescued);
  };
  const osialStopped = (s) => {
    const fn = helper('osial_stopped', 'osialStopped');
    if (fn) { try { return !!fn(s); } catch (e) { /* fall through */ } }
    const f = F(s);
    return !f.osial_sent && !!(f.osial_stopped || f.leaked_yelan || f.leaked_ning || f.ops_sabotage || f.zl_amended || f.card_frozen);
  };
  const recalled = (s) => {
    const fn = helper('recalled');
    if (fn) { try { return !!fn(s); } catch (e) { /* fall through */ } }
    return !F(s).defected && !F(s).zl_amended;
  };
  /** messages from Zhongli: strings become { m }, objects pass through */
  const M = (...xs) => xs.map((x) => (typeof x === 'string' ? { m: x } : x));
  const scene = (def) => S.scene(Object.assign({ arc: 'zl', thread: 'zl' }, def));
  /** send the memo from inside a scene (story.send reports memo_share, which starts the climax) */
  const sendMemo = { run: (api) => { try { api.story.send('zl', { memo: 'memo_xiansheng' }); } catch (e) { console.error('[zl] memo send failed', e); } } };

  /** the Ledger reaction (shared by "What does he say about me", the photo sent on its own, and Sunday night) */
  const ledgerNodes = (after) => ({
    ledger: [
      { fx: { set: { ledger_shared: true }, aff: { zl: 2 } } },
      { wait: 4 },
      { typing: 5 },
      { wait: 3 },
      ...M(
        'I am reading it.',
        { typing: 7 },
        'He has written down the umbrella.',
        'Seventy-five Mora. "Gave it to a stranger." He was so angry. The next day there was a new umbrella in the stand by my door when I came home. He never mentioned it. I do not know how he got in.',
        'And the salt story. He wants to know whether it counts.',
        { m: 'It counts.', d: 2 },
      ),
      { if: (s) => !!F(s).zl_confessed, go: 'ledger_tea_true' },
      ...M('Item six. The "tea". I owe him an explanation as well as the Mora, and I find I cannot give him either yet. It was not tea. It was never tea. It is the most expensive joke I have ever told, and I have not yet reached the punchline.'),
      { go: 'ledger_end' },
    ],
    ledger_tea_true: M(
      'Item six. The "tea". You know enough now to understand it.',
      'It was the deposit for the Rite of Parting. Wangsheng requires one, for rites of a certain size. I booked my own funeral on the thirtieth of June, on his card.',
      'He paid for my funeral. I have been trying since June to decide whether that is the most touching or the most absurd thing that has happened to me in a thousand years.',
      { go: 'ledger_end' },
    ),
    ledger_end: [
      { wait: 3 },
      ...M(
        { m: '"He\'s worth it. Don\'t tell him."', d: 3 },
        { wait: 5 },
        { m: 'You told me.', d: 2 },
        { wait: 2 },
        'Thank you.',
      ),
      { go: after },
    ],
  });

  JC.zlKit = { F, AFF, SUS, T, past, started, finished, held, hold, lock, free, cancel, aware, kidsSafe, osialStopped, recalled, M, scene, sendMemo, ledgerNodes };

  // ── App acts → Zhongli (onAct rules) ───────────────────────────────
  // world.js sets the shared flags (bought_teaset, lilies_sent, memo_zl_sent, ledger_read…); these rules start his reactions.
  S.onAct({ id: 'zl_teaset_won', arc: 'zl', act: ['purchase', 'auction_won'], match: (p) => (p.id || p.art) === 'lot_teaset', once: true, start: 'zl_teaset_won', delay: 12 });
  S.onAct({ id: 'zl_teaset_lost', arc: 'zl', act: 'auction_lost', match: (p, s) => (p.id || p.art) === 'lot_teaset' && !F(s).bought_teaset, once: true, fx: { set: { teaset_lost: true } }, start: 'zl_teaset_lost', delay: 6 });
  S.onAct({ id: 'zl_lilies', arc: 'zl', act: 'purchase', match: (p) => (p.id || p.art) === 'lilies_wangsheng', once: true, start: 'zl_lilies', delay: 40 });
  // Ch3: tea delivered to Box 2 at Heyu
  S.onAct({
    id: 'zl_tea_sent', arc: 'zl', act: 'order', once: true,
    match: (p, s) => p.to === 'heyu' && s.chapter === 'sat_noon',
    fx: (p) => ({ set: { zl_tea_sent: true, zl_tea_tentacles: (p.items || []).some((i) => /squid|octopus|tentacle|calamari/i.test(String((i && i.name) || i))) }, aff: { zl: 1 } }),
    start: 'zl_tea_arrives', delay: 25,
  });
  // Ch3: Maps directions to Heyu = you go to the opera in person
  S.onAct({
    id: 'zl_opera_live', arc: 'zl', act: 'directions', once: true,
    match: (p, s) => p.place === 'heyu' && s.chapter === 'sat_noon' && !past(s, '+1 16:05'),
    fx: { set: { zl_opera_live: true }, aff: { zl: 1 } },
    start: 'zl_opera_live', delay: 2,
  });
  // The Ledger screenshot sent to him on its own
  S.onAct({ id: 'zl_ledger_photo', arc: 'zl', act: 'send', match: (p, s) => p.thread === 'zl' && p.art === 'p_ledger' && !F(s).ledger_shared, once: true, start: 'zl_ledger', delay: 1 });
  // Paimon is eating the weekend
  S.onAct({ id: 'zl_paimon', arc: 'zl', act: 'order', match: (p, s) => (p.to === 'paimon' || p.for === 'paimon') && Number(F(s).paimon_total || 0) >= 3000, once: true, start: 'zl_paimon', delay: 90 });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 1 — Friday night, "The Bill"
  // ════════════════════════════════════════════════════════════════════

  scene({
    id: 'zl_bill', ch: 'fri_night', required: true, soft: true,
    trigger: { on: 'chapter', ch: 'fri_night', delay: 60 },
    nodes: {
      start: hold('zl_bill'),
      go: [
        lock('zl_bill'),
        ...M(
          { m: 'I have found my wallet.', d: 2.4 },
          'It was in my other coat, exactly as I said it would be. I mention this so that you cannot accuse me of having invented the other coat.',
          'Thank you for dinner, Childe. Eight thousand eight hundred Mora, which I have noted. I note everything. You may not believe it, but I do.',
        ),
        { choice: [
          { t: "Again, xiansheng? That's 41 dinners. 📒", fx: { aff: { zl: 1 } }, go: 'tease' },
          { t: 'Fine.', go: 'cold' },
          { t: 'It was my pleasure, truly. Thank you for a lovely evening 🙏', fx: { sus: { zl: 2 } }, go: 'sweet' },
          { t: '[Leave on read]', silent: true, go: 'unread' },
        ], timeout: 120, onTimeout: 'unread' },
      ],
      tease: [
        ...M(
          { m: 'Forty-one?', d: 1.6 },
          'I had counted thirty-nine. You must be including the night of the octopus, which I maintain was not a dinner but an assault.',
          'Add it to the ledger. I know about the ledger. I have always known about the ledger.',
        ),
        { go: 'next' },
      ],
      cold: [
        { typing: 3 },
        ...M(
          'Fine.',
          'That is a very short word, for you. You usually spend more letters on the bill than the restaurant does.',
          'Are you tired? You were quiet on the pier.',
        ),
        { go: 'next' },
      ],
      sweet: [
        { wait: 3 },
        ...M(
          { m: '"Truly."', d: 2 },
          'Thank you. That was very gracious.',
          'You are generally less gracious and considerably more exclamatory. And you have never once, in six months, thanked me with folded hands. Did you have wine after I left? We did not order any.',
        ),
        { go: 'next' },
      ],
      unread: [
        { typing: 2 },
        { m: 'I see that you have read it. I will take that as a receipt.' },
        { go: 'next' },
      ],
      next: [
        free,
        { if: (s) => !F(s).bought_teaset && !F(s).teaset_lost && !past(s, '+1 00:24'), go: 'auction' },
      ],
      auction: [{ start: 'zl_auction', delay: 40 }],
    },
  });

  scene({
    id: 'zl_auction', ch: 'fri_night', soft: true,
    trigger: { on: 'chapter', ch: 'fri_night', delay: 330 },
    when: (s) => !F(s).bought_teaset && !F(s).teaset_lost && !past(s, '+1 00:26'),
    nodes: {
      start: hold('zl_auction'),
      go: [
        { if: (s) => F(s).bought_teaset || F(s).teaset_lost || past(s, '+1 00:28'), go: 'none' },
        lock('zl_auction'),
        ...M(
          'On an entirely unrelated matter.',
          'The tea set. Lot 1016. It is still at eleven thousand two hundred, and it closes at half past twelve.',
          'I would not ask, except that the glaze is genuinely of her period, and there are perhaps four such sets left in Liyue, and three of them are in the Jade Chamber, where Ningguang uses them for guests she wishes to intimidate.',
          'If you were to place a modest bid on my behalf, I would of course settle it with you.',
          { m: 'In time.', d: 1.5 },
        ),
        { choice: [
          { t: "Fine. FINE. I'm bidding 🙄", go: 'bid' },
          { t: 'Add it to the ledger, xiansheng. With interest 📒', fx: { set: { zl_ledger_billed: true } }, go: 'billed' },
          { t: 'No. Not this time.', fx: { set: { zl_auction_refused: true } }, go: 'refuse' },
          { t: "Of course! How much should I bid? I'm not very familiar with auctions.", fx: { sus: { zl: 2 } }, go: 'ooc' },
        ], timeout: 90, onTimeout: 'silence' },
      ],
      bid: M(
        'Thank you.',
        'There is a bidder called jade_connoisseur_88 who has been bidding against me all week in small, petty increments. I would not wish to influence you, but I would very much like to see him lose.',
        'Anything at twelve thousand should do it. It is on Feiyun Market, under Lot 1016, where I sent it at dinner while you were sitting directly opposite me.',
        { go: 'end' },
      ),
      billed: M(
        { m: 'With interest.', d: 1.6 },
        'I accept the terms. I have always accepted the terms.',
        'At twelve thousand, I believe jade_connoisseur_88 will finally go to bed. Lot 1016, on Feiyun Market.',
        { go: 'end' },
      ),
      refuse: [
        { typing: 4 },
        ...M(
          'Of course. It was a great deal to ask, after a great deal of dinner.',
          'I will not mention it again.',
          { wait: 2 },
          { m: 'Tonight.', d: 1.2 },
        ),
        { go: 'end' },
      ],
      ooc: M(
        { m: '"Not very familiar with auctions."', d: 2 },
        'You once bid on a harpoon at three in the morning because, and I quote, the other bidder had a "smug username".',
        'Twelve thousand should be enough. Are you feeling quite well, Childe?',
        { go: 'end' },
      ),
      silence: [
        { m: 'I will take your silence as the sound of a man opening Feiyun Market.' },
        { go: 'end' },
      ],
      end: [free],
      none: [{ end: true }],
    },
  });

  // Winning the lot (any chapter): his paragraph about Guizhong, and a nudge towards the inscription.
  scene({
    id: 'zl_teaset_won',
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_teaset_won'),
      go: [
        lock('zl_teaset_won'),
        { fx: { aff: { zl: 1 } } },
        { wait: 2 },
        ...M(
          { m: 'The listing for Lot 1016 says SOLD.', d: 2 },
          'jade_connoisseur_88 has already left the auction house a review. It is one star. It is mostly capital letters.',
          { m: 'You won it.', d: 2 },
          { wait: 3 },
          { typing: 6 },
          'I should tell you why it matters, since you have paid for it, and since you have never once asked me why anything matters before paying for it.',
          'There was a woman called Guizhong. She made glazes like this one, a long time ago, in the hills above what is now Qingce. Pale green, like water over stone. In every set she painted one small lily on the inside of a single cup, where only the person drinking from it would see. She said tea should end with a surprise.',
          'She has been gone a very long time. I have not held anything she made in a very long time either.',
          'The seller\'s notes mention an inscription on the base of the teapot. They have transcribed it as "for Mora". They are mistaken. It is not a currency. You may look, if you like; the listing has the photograph.',
        ),
        { if: (s) => aware(s), go: 'aware' },
        ...M('Thank you, Childe. I will settle it with you.', { m: 'In time.', d: 1.4 }),
        { go: 'end' },
      ],
      aware: M(
        'Thank you. I will settle it.',
        { m: 'With whom, I have not yet entirely decided.', d: 2.4 },
        { go: 'end' },
      ),
      end: [free],
    },
  });

  // Losing the lot (or letting it close).
  scene({
    id: 'zl_teaset_lost', ch: 'fri_night', soft: true,
    trigger: { on: 'time', at: '+1 00:31' },
    when: (s) => !F(s).bought_teaset,
    nodes: {
      start: hold('zl_teaset_lost'),
      go: [
        { if: (s) => !!F(s).bought_teaset, go: 'none' },
        lock('zl_teaset_lost'),
        { fx: { set: { teaset_lost: true } } },
        ...M(
          'The auction has closed.',
          'The tea set has gone to jade_connoisseur_88, who will, I imagine, display it in a glass cabinet under a bright light, which is the worst thing one can do to celadon.',
          'I find I am not troubled. Objects have a way of finding the people who were meant to keep them. Sometimes it takes a century or two.',
        ),
        { if: (s) => !!F(s).zl_auction_refused, go: 'right' },
        ...M('Thank you for considering it. It was more than I had any right to ask.'),
        { go: 'end' },
      ],
      right: M('And you were right to say no. Some debts are better left unrecorded.', { go: 'end' }),
      end: [free],
      none: [{ end: true }],
    },
  });

  // The airport: he offers to meet the children (before 01:00 he still believes he is writing to Childe).
  scene({
    id: 'zl_pickup_offer', ch: 'fri_night', soft: true,
    trigger: { on: 'chapter', ch: 'fri_night', delay: 480 },
    when: (s) => !F(s).zl_pickup && !F(s).fatui_pickup && !F(s).lumine_pickup && !F(s).ekat_pickup && !F(s).ride_kids,
    nodes: {
      start: hold('zl_pickup_offer'),
      go: [
        { if: (s) => !!(F(s).zl_pickup || F(s).fatui_pickup || F(s).lumine_pickup || F(s).ekat_pickup || F(s).ride_kids), go: 'none' },
        lock('zl_pickup_offer'),
        ...M(
          'Forgive another message. I have been thinking about what you said at dinner.',
          'Your brother and sister land at twenty to eight. Pulcinella has arranged a driver. You said "a driver" the way other people say "a snake".',
          'If it would ease your mind, I could meet them at the airport myself.',
          'I am, as it happens, very good with children. And with lying to them gently.',
          'I would tell them I am a colleague from Northland Toys. I would be very convincing. I have been practising a face.',
        ),
        { choice: [
          { t: "XIANSHENG. you'd do that?? yes!! 😭", fx: { set: { zl_pickup: true }, aff: { zl: 1 } }, go: 'yes' },
          { t: "You'd lie to children for me? 😁 deal. Teucer is going to love you", fx: { set: { zl_pickup: true }, aff: { zl: 1 } }, go: 'yes' },
          { t: "Nah, I've got it handled. Go to sleep, xiansheng", go: 'no' },
          { t: "That's very kind of you; however, the driver should be fine.", fx: { sus: { zl: 2 } }, go: 'semi' },
        ], timeout: 120, onTimeout: 'quiet' },
      ],
      yes: [
        ...M(
          'Then it is settled.',
          'I will be at arrivals at half past seven with a sign. I will spell their names correctly, which I suspect will set me apart from the other signs.',
          'Tell them to look for a man in a brown coat who looks like a toy executive. I will work on the face.',
        ),
        { run: (api) => {
          try {
            api.store.add('events', { id: 'ev_zl_pickup', cal: 'family', title: 'Xiansheng meets T + T at arrivals 🐟', start: JC.time.parse('+1 07:30'), end: JC.time.parse('+1 08:15'), location: 'Liyue Harbor International (LHI)', notes: 'He is bringing a sign. He is practising a face.' });
          } catch (e) { /* calendar not seeded yet */ }
        } },
        { go: 'end' },
      ],
      no: M('Very well. The offer does not expire before twenty to eight.', { go: 'end' }),
      semi: M(
        { m: '"However."', d: 2 },
        'A semicolon. You have never once used a semicolon in six months. I had come to find it restful.',
        'Very well. If you change your mind, I will be awake. I am frequently awake.',
        { go: 'end' },
      ),
      quiet: M('I will take that as "I will think about it", which in my experience is what you say when you mean yes.', { go: 'end' }),
      end: [free],
      none: [{ end: true }],
    },
  });

  // 01:03 — he is at Wangsheng now, watching Childe wring seawater out of his sleeve. This is a test.
  scene({
    id: 'zl_fish', ch: 'fri_night', soft: true,
    trigger: { on: 'chapter', ch: 'fri_night', delay: 760 },
    when: (s) => !F(s).zl_admitted,
    nodes: {
      start: hold('zl_fish'),
      go: [
        lock('zl_fish'),
        ...M(
          { m: 'Did the fish bite after I left?', d: 2.2 },
          { m: 'You seemed restless.', d: 1.6 },
        ),
        { choice: [
          { t: 'Nothing after you left. Rude of them.', if: (s) => !!F(s).clue_shared_ride, fx: { set: { zl_fish_ok: true }, aff: { zl: 1 } }, go: 'right' },
          { t: 'Caught a HUGE sea bass!! 🐟 like 6 kilos', fx: { set: { zl_fish_lie: true }, sus: { zl: 2 } }, go: 'wrong' },
          { t: 'Not really. Went home early, too cold 😤', fx: { set: { zl_fish_lie: true }, sus: { zl: 1 } }, go: 'home' },
          { t: 'Who told you that I was restless?', go: 'who' },
        ], timeout: 110, onTimeout: 'silent' },
      ],
      right: [
        { wait: 3 },
        ...M(
          { m: 'Rude of them, yes.', d: 2 },
          { typing: 4 },
          'I am glad you were not out there long.',
        ),
        { go: 'end' },
      ],
      wrong: [
        { typing: 5 },
        { wait: 2 },
        ...M(
          { m: 'Six kilos.', d: 1.8 },
          'How remarkable.',
          'Goodnight, Childe.',
        ),
        { go: 'end' },
      ],
      home: [
        { typing: 3 },
        ...M(
          'Home early. I see.',
          'Then I hope it is warm, wherever you are.',
        ),
        { go: 'end' },
      ],
      who: [
        ...M(
          'No one told me. I was there.',
          'You checked your phone eleven times at dinner and smiled at none of them. On the pier you cast twice and reeled in twice without once looking at the water.',
          'I have known you six months. I know what your restless looks like.',
        ),
        { choice: [
          { t: 'Work stuff. Signora stuff. ⚔️', go: 'work' },
          { t: "I'm fine, xiansheng. Go to sleep 😁", go: 'fine' },
        ], timeout: 90, onTimeout: 'end' },
      ],
      work: M('Signora stuff. Yes. I imagined it might be.', 'The offer from September does not expire. Neither does the one from the ninth.', { go: 'end' }),
      fine: M('As you say.', { go: 'end' }),
      silent: M('Goodnight, then.', { go: 'end' }),
      end: [free],
    },
  });

  // ~01:57 — he knows by now. He writes to whoever is holding the phone, and calls them Childe, because he was asked to be kind.
  scene({
    id: 'zl_goodnight', ch: 'fri_night', soft: true,
    trigger: { on: 'chapter', ch: 'fri_night', delay: 1300 },
    nodes: {
      start: hold('zl_goodnight'),
      go: [
        lock('zl_goodnight'),
        ...M(
          'I could not sleep, so I went back down to the harbor for a while.',
          'The harbor at night is the oldest thing in Liyue. The lanterns change, the ships change, the people on the promenade change so quickly I sometimes think I am watching the same evening played by different actors. But the water under it all is very old, and it has a way of making everything that happens on top of it feel temporary, in the kindest possible sense.',
          'People think of the sea as restless. It is the most patient thing I know. It has waited for every ship that ever left this harbor, and for every one that never came back, and it does not seem to mind the difference. I find that a comfort, on nights like this one.',
          'Whatever you are carrying tonight, it will be lighter in the morning. Most things are.',
          'Sleep, if you can. Leave the phone somewhere it can rest too.',
        ),
        { choice: [
          { t: 'night xiansheng 💧 thanks for keeping an eye on the sea for me', fx: { aff: { zl: 1 } }, go: 'warm' },
          { t: 'go to bed grandpa 😁', go: 'grandpa' },
          { t: 'Goodnight. Thank you; that was beautiful.', fx: { sus: { zl: 2 } }, go: 'semi' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ], timeout: 120, onTimeout: 'read' },
      ],
      warm: [
        { wait: 2 },
        ...M(
          'I will keep an eye on it. I have had a great deal of practice.',
          { m: 'Goodnight, Childe.', d: 2.4 },
        ),
        { go: 'end' },
      ],
      grandpa: M('Go to bed yourself. It is two in the morning, and you have had a longer night than I have.', { go: 'end' }),
      semi: [
        { typing: 3 },
        ...M({ m: 'A semicolon.', d: 1.6 }, 'Goodnight.'),
        { go: 'end' },
      ],
      read: [{ typing: 3 }, { go: 'end' }],
      end: [free],
    },
  });

  // Confessing to Zhongli never ends the game: S4's `confess_zl` (scenes/confess.js) sets zl_admitted and, from
  // Saturday, starts zl_contract below.

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 2 — Saturday morning, "Cranes"
  // ════════════════════════════════════════════════════════════════════

  scene({
    id: 'zl_cranes', ch: 'sat_dawn', soft: true,
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 35 },
    nodes: {
      start: hold('zl_cranes'),
      go: [
        lock('zl_cranes'),
        { img: 'p_cranes_yujing', d: 1.2 },
        ...M(
          'The cranes have come back to Yujing Terrace for the Rite. Seven of them, this morning. The groundskeeper says they have not come in such numbers since before he was born. He seemed to think it an omen. I did not tell him what kind.',
          { m: 'You once said they look as if they are judging you.', d: 2.4 },
        ),
        { if: (s) => !!F(s).zl_admitted, go: 'known' },
        { choice: [
          { t: 'They ARE judging me. look at the big one. it knows about the octopus 🐙', fx: { set: { zl_cranes_ok: true }, aff: { zl: 1 } }, go: 'octopus' },
          { t: "they're beautiful, xiansheng 😁", go: 'pretty' },
          { t: "Cranes symbolise longevity in Liyue, don't they?", fx: { sus: { zl: 1 } }, go: 'longevity' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ], timeout: 100, onTimeout: 'read' },
      ],
      octopus: M(
        { m: 'It does.', d: 1.4 },
        'It has told the others. They are deciding what to do about you.',
        'Good morning, Childe.',
        { go: 'end' },
      ),
      pretty: M('They are. They are also deeply unimpressed by everyone. It is what makes them beautiful.', { go: 'end' }),
      longevity: M(
        'They do. Among other things.',
        'You have been reading.',
        { go: 'end' },
      ),
      read: [{ typing: 2 }, { go: 'end' }],
      known: [
        { choice: [
          { t: 'Good morning, xiansheng. They look like they know something.', go: 'known_yes' },
          { t: 'Did you sleep at all?', go: 'known_sleep' },
        ], timeout: 100, onTimeout: 'end' },
      ],
      known_yes: M('They usually do. They have the decency not to say it. I am trying to learn from them.', { go: 'end' }),
      known_sleep: M('A little. In a chair at the parlor, under a very bad painting of a crane. Hu Tao says it is the best painting in Liyue. She painted it.', { go: 'end' }),
      end: [free],
    },
  });

  // "You are not Childe." He never ends the game: he becomes an ally, or a judge.
  scene({
    id: 'zl_knows', ch: 'sat_dawn', required: true,
    trigger: [{ on: 'chapter', ch: 'sat_dawn', delay: 300 }, { on: 'sus', who: 'zl', at: 3, delay: 15 }],
    expire: 'expire',
    nodes: {
      start: hold('zl_knows'),
      go: [
        lock('zl_knows'),
        { if: (s) => !!F(s).zl_admitted, go: 'already' },
        { if: (s) => !!F(s).zl_pickup && past(s, '+1 07:36'), go: 'airport' },
        { if: (s) => !!F(s).zl_pickup, go: 'to_airport' },
        ...M(
          'Good morning.',
          'I would like to speak plainly with you, because I think you would prefer it, and because I have been speaking to you indirectly since a little after one o\'clock this morning.',
        ),
        { go: 'reveal' },
      ],
      airport: [
        ...M(
          'I am at the airport. LA 711 has landed.',
          'I can see them through the glass: a small boy with a backpack shaped like a wolf, and a girl holding his hand as though she expects someone to try to take it.',
          'In a moment I am going to walk over and introduce myself as a colleague from Northland Toys. Before I do, there is something I must say to you.',
        ),
        { go: 'reveal' },
      ],
      to_airport: [
        ...M(
          'I am on my way to the airport. I have a sign. I have spelled both names correctly; I checked them against his phone book, which lists his sister as "Tonia (DON\'T LIE BADLY)".',
          'Before I meet them, there is something I must say to you.',
        ),
        { go: 'reveal' },
      ],
      reveal: [
        { wait: 2 },
        { m: 'You are not Childe.', d: 3.2 },
        { wait: 2 },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'lol what?? xiansheng did you have too much tea 😂', fx: { sus: { zl: 3 } }, go: 'deny1' },
          { t: '…How did you know?', go: 'admit_how' },
          { t: "No. I'm not. I found his phone on Pier 7.", go: 'admit' },
          { t: "Is he okay? Please just tell me he's okay.", go: 'admit_okay' },
          { t: "Who's asking?", go: 'who' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      deny1: [
        { typing: 4 },
        ...M(
          'I was at Wangsheng at one o\'clock this morning. He was sitting on Coffin Four, wringing seawater out of his sleeve and complaining about his rod.',
          { m: 'He does not have his phone. You do.', d: 2.6 },
        ),
        { if: (s) => !!F(s).zl_fish_lie, go: 'deny1_fish' },
        { go: 'deny1_end' },
      ],
      deny1_fish: M('And the fish did not bite after I left. He told me so himself, at some length, with a great deal of feeling about the fish.', { go: 'deny1_end' }),
      deny1_end: [
        { m: 'I am not angry. I would only like you to say it.' },
        { choice: [
          { t: "…okay. You got me. I'm not him.", go: 'admit' },
          { t: "I don't know what you're talking about, xiansheng 😁", fx: { sus: { zl: 3 }, aff: { zl: -1 } }, go: 'deny2' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      deny2: [
        ...M(
          { m: 'Very well.', d: 1.6 },
          'I am a patient man. I have been told it is my most unbearable quality. He told me so, in fact, in May, after a game of chess.',
        ),
        { wait: 8 },
        { typing: 4 },
        { wait: 2 },
        { m: 'You are not Childe.', d: 3 },
        { choice: [
          { t: "…No. I'm not.", go: 'admit' },
          { t: "I'm not telling you anything.", go: 'guarded' },
          { t: '[Leave on read]', silent: true, go: 'guarded' },
        ] },
      ],
      read: [
        { typing: 3 },
        { wait: 4 },
        ...M(
          'I can see that you have read this. I am in no hurry.',
          'When you are ready, you need only say so. Until then I will keep calling you Childe, because he asked me last night to be kind to whoever had picked up his phone, and I keep my word.',
        ),
        { choice: [
          { t: "…I'm not him. I'm sorry.", go: 'admit' },
          { t: "I don't know what you're talking about.", fx: { sus: { zl: 2 } }, go: 'deny2' },
          { t: "I'm not telling you anything.", go: 'guarded' },
        ] },
      ],
      who: [
        ...M(
          'Someone he trusts.',
          'At present, that makes me the only person in Liyue whose opinion of you matters.',
        ),
        { choice: [
          { t: "…Fine. I'm not him. I found his phone.", go: 'admit' },
          { t: 'lol ok xiansheng 😂', fx: { sus: { zl: 3 } }, go: 'deny1' },
        ] },
      ],
      guarded: [
        { fx: { set: { zl_guarded: true }, aff: { zl: -1 } } },
        ...M(
          'Then we will proceed as though you had said it, since we both know you have.',
          'I will not tell anyone. I will not help you either, beyond what he asked of me.',
          'If his brother and sister come to harm through this, I will hold you responsible. That is not a threat. It is only a description.',
        ),
        free,
      ],
      admit_how: [
        { fx: { set: { zl_admitted: true, told_truth: true }, aff: { zl: 1 } } },
        ...M(
          'Several ways.',
          'You write the way people walk in borrowed shoes: carefully, and a little too fast.',
          'He answers the bill with at least four exclamation marks. He has never once let a message of mine about the antiques stall go unanswered for thirteen minutes.',
          'And at one o\'clock this morning I was standing in Wangsheng\'s coffin showroom, watching him wring seawater out of his sleeve.',
        ),
        { go: 'explain' },
      ],
      admit: [
        { fx: { set: { zl_admitted: true, told_truth: true }, aff: { zl: 1 } } },
        { wait: 2 },
        ...M('Thank you.', 'That cannot have been easy to type.'),
        { go: 'explain' },
      ],
      admit_okay: [
        { fx: { set: { zl_admitted: true, told_truth: true }, aff: { zl: 2 } } },
        ...M(
          { m: 'He is safe.', d: 1.6 },
          'He is cold, and wet, and very angry about his rod, and he is safe.',
          'You asked that first. I will remember that you asked it first.',
        ),
        { go: 'explain' },
      ],
      explain: [
        ...M(
          'He reached Wangsheng a little after midnight, soaked through. Hu Tao hid him. She called me at one.',
          'Two of Signora\'s people came for him on the pier. He went into the water rather than go with them, and he left his phone on the bench so they could not follow it.',
          'So you found the phone, and the rod, and a cup of osmanthus tea gone cold. The tea was mine.',
        ),
        { if: (s) => !!F(s).deal_childe, go: 'explain_deal' },
        { go: 'explain_kind' },
      ],
      explain_deal: [
        { m: 'He told me he called you, from a borrowed phone, and that you agreed to keep his alive until Monday. He said you sounded frightened and kind. In my experience the combination is rare.' },
        { if: (s) => !!F(s).deal_paid, go: 'explain_paid' },
        { go: 'explain_kind' },
      ],
      explain_paid: M('He also said you asked to be paid for it. I respect that. It is the most Liyuen thing anyone has done all week.', { go: 'explain_kind' }),
      explain_kind: [
        ...M(
          'Before I left him last night he asked me one thing. He said: "Whoever it is, xiansheng, they picked up. Be nice to them."',
          { m: 'So. I am being nice to you. This is what it looks like.', d: 3 },
        ),
        { if: (s) => !!F(s).zl_memo_early, go: 'explain_memo' },
        { go: 'explain_fish' },
      ],
      explain_memo: [
        { wait: 3 },
        ...M(
          'There is something else. At midnight I received a recording.',
          'I listened to it, and I answered it, and then I went to Wangsheng, and he was there, without his phone, and he did not know what I was talking about. I understood that he had not sent it. You had.',
          'I have not told him. I do not know how one tells a man that a stranger delivered his heart to the wrong door at midnight.',
          { m: 'Or to the right door, by the wrong hand.', d: 3 },
        ),
        { go: 'explain_fish' },
      ],
      explain_fish: [
        { if: (s) => !!F(s).zl_fish_ok, go: 'fish_ok' },
        { if: (s) => !!F(s).zl_fish_lie, go: 'fish_lie' },
        { go: 'cranes' },
      ],
      fish_ok: M('When I asked about the fish, you said nothing had bitten after I left. You had found the ride receipt, I imagine, and worked out that I had been on the pier. That was well done. It was the moment I decided I would like to meet you.', { go: 'cranes' }),
      fish_lie: M('When I asked about the fish, you told me what you thought he would say. He would have told me the truth: that the fish were cowards. He was very clear on that point at one o\'clock.', { go: 'cranes' }),
      cranes: [
        { if: (s) => !!F(s).zl_cranes_ok, go: 'cranes_ok' },
        { go: 'rod' },
      ],
      cranes_ok: M('And this morning you remembered the octopus. You have read our messages, I think. All of them.', { m: 'I find I do not mind.', d: 2 }, { go: 'rod' }),
      rod: [
        { m: 'One more question, and then business. The rod on the pier. Did you leave it there?' },
        { choice: [
          { t: "It's in my hallway. I couldn't just leave it.", fx: { set: { rod_kept: true }, aff: { zl: 1 } }, go: 'rod_kept' },
          { t: "I left it. I'm sorry.", go: 'rod_left' },
        ] },
      ],
      rod_kept: M('Thank you.', 'He has not stopped talking about it. I gave it to him in July. It is the only thing I have paid for myself in a very long while, and he knows it, and he will not let me forget it.', { go: 'proposal' }),
      rod_left: M('Then I will go and look for it this evening. Rods, like people, are sometimes still there in the morning.', { go: 'proposal' }),
      proposal: [
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'proposal_fatui' },
        { if: (s) => !!F(s).zl_pickup, go: 'proposal_airport' },
        { m: 'Now. I have a proposal for you.' },
        { go: 'to_contract' },
      ],
      proposal_fatui: M(
        'His brother and sister were collected this morning by a driver from the Liyue Harbor Grand. You know who owns the Liyue Harbor Grand. I suspect you did not, when you agreed to it.',
        'I have a proposal for you. It begins with them.',
        { go: 'to_contract' },
      ),
      proposal_airport: M('Now I must go and lie to two children beautifully. Before I do, I have a proposal for you.', { go: 'to_contract' }),
      to_contract: [free, { start: 'zl_contract', delay: 3 }],
      already: [
        ...M(
          'Good morning. We spoke last night, you and I, and I have thought about what you told me.',
          'I have a proposal for you.',
        ),
        free,
        { start: 'zl_contract', delay: 3 },
      ],
      expire: [
        { if: (s) => !F(s).zl_admitted, go: 'expire_quiet' },
      ],
      expire_quiet: [
        { fx: { set: { zl_guarded: true } } },
        { m: 'You have not answered me. I will take that as an answer of a kind.' },
      ],
    },
  });

  /** contract text for Notes and Mail */
  function contractBody(f) {
    const st = Number(f.clause_struck || 0);
    const cl = [
      [1, 'You keep his family safe. His brother and sister are in Liyue until Monday, and so are the people who would use them against him. They come first.'],
      [2, 'You tell no one what you are. (Hu Tao already knows. She does not count.)'],
      [3, 'When Zhongli asks you a question, you answer him truthfully. He will not ask many. He will ask them carefully.'],
    ];
    const out = [
      'A contract between Zhongli, consultant, Wangsheng Funeral Parlor, and the person currently holding Childe\'s phone.',
      '',
    ];
    cl.forEach(([n, t]) => out.push(st === n ? '(' + n + ') — struck, by agreement.' : '(' + n + ') ' + t));
    if (f.clause_four) out.push('(4) Zhongli tells him how he feels, before he leaves Liyue. (Added by the other party. Accepted under protest.)');
    if (f.clause_pay) out.push('(4) Before Monday, Zhongli pays for something himself. He will not say what.');
    out.push('', 'In return: Zhongli helps. He knows the city, he knows him, and he knows a great deal about Signora that she would prefer he did not.');
    out.push('', 'Term: until Monday 19 October, Pier 7, when the phone is given back.', '', 'Agreed by text, Saturday 17 October 2026.', '— Z.');
    return out.join('\n');
  }

  scene({
    id: 'zl_contract',
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_contract'),
      go: [
        { if: (s) => !!F(s).zl_contract, go: 'none' },
        lock('zl_contract'),
        ...M(
          'I would like to make a contract with you.',
          'You may find that a strange thing to want from a stranger, on a Saturday morning, by text. I have made a great many contracts. I have found they are the only honest way to begin anything that matters.',
          'Three clauses. I have kept them short.',
          'One. You keep his family safe. His brother and sister are in Liyue until Monday, and so are the people who would use them against him. Whatever else you do with his phone, they come first.',
          'Two. You tell no one what you are. Not his colleagues, not his family, not his friends. Hu Tao already knows; she does not count. She is, in any case, impossible to keep anything from.',
          'Three. When I ask you a question, you answer me truthfully. I will not ask many. I will ask them carefully.',
          'In return, I will help you. I know this city. I know him. And I know a great deal about Signora that she would prefer I did not.',
          'It ends on Monday evening, at Pier 7, when you give him back his phone.',
        ),
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'fatui' },
        { go: 'nego' },
      ],
      fatui: M('I should say: the first clause is already in difficulty. You would be signing it with the children in Pulcinella\'s hotel. I would rather you signed it anyway. Some contracts are made to repair things.', { go: 'nego' }),
      nego: [
        { choice: [
          { t: "I'll sign it as it is.", go: 'sign' },
          { t: 'Strike clause one.', go: 's1' },
          { t: 'Strike clause two.', go: 's2' },
          { t: 'Strike clause three.', go: 's3' },
          { t: 'I want to add a clause.', go: 'add' },
          { t: "I won't sign anything.", go: 'refuse' },
        ] },
      ],
      s1: [
        ...M({ m: 'You would remove the one clause that protects the children.', d: 2.4 }, 'May I ask why?'),
        { choice: [
          { t: "Because I can't promise it. I don't know if I can keep them safe.", fx: { set: { clause_struck: 1 } }, go: 's1_honest' },
          { t: "Because they're not my job.", fx: { set: { clause_struck: 1 }, aff: { zl: -1 } }, go: 's1_cold' },
          { t: "…Never mind. Leave it in.", go: 'sign_q' },
        ] },
      ],
      s1_honest: M('That is the most honest reason anyone has ever given me for refusing a clause.', 'Very well. It is struck. I will keep it myself, without you.', { go: 'sign_q' }),
      s1_cold: M({ m: 'No. They are not.', d: 2 }, 'It is struck. I will remember that you asked.', { go: 'sign_q' }),
      s2: [
        { fx: { set: { clause_struck: 2 } } },
        ...M('You would like to keep the option of honesty.', 'I can hardly object to that. Struck.'),
        { go: 'sign_q' },
      ],
      s3: [
        { fx: { set: { clause_struck: 3 } } },
        ...M('You would rather keep your secrets.', { m: 'Then I will keep mine. That seems fair. Struck.', d: 2.6 }),
        { go: 'sign_q' },
      ],
      add: [
        { m: 'A fourth clause. Go on.' },
        { choice: [
          { t: '(4) You tell him how you feel.', go: 'four' },
          { t: '(4) You pay for something. Once. Yourself.', go: 'pay' },
          { t: 'Actually, never mind.', go: 'sign_q' },
        ] },
      ],
      four: [
        { wait: 4 },
        { typing: 6 },
        { wait: 3 },
        { typing: 4 },
        { wait: 2 },
        ...M(
          { m: 'That is not a clause.', d: 2 },
          { m: 'That is an ambush.', d: 1.6 },
        ),
        { wait: 4 },
        { typing: 5 },
        ...M(
          { m: '…', d: 1 },
          'Very well. I accept, on one condition: that the term be "before he leaves Liyue", rather than "immediately". I am six— I am old enough to know that some things take a little time to say properly.',
        ),
        { fx: { set: { clause_four: true }, aff: { zl: 1 } } },
        { go: 'sign_q' },
      ],
      pay: [
        ...M(
          { m: 'You are asking me to carry Mora.', d: 2.2 },
          'I have not carried Mora since— I do not carry Mora.',
          'Very well. Before Monday, I will pay for something. I will not tell you what. You will know it when you see it.',
        ),
        { fx: { set: { clause_pay: true }, aff: { zl: 1 } } },
        { go: 'sign_q' },
      ],
      sign_q: [
        { m: 'Then: shall we sign?' },
        { choice: [
          { t: 'Signed.', go: 'sign' },
          { t: "No. I can't.", go: 'refuse' },
        ] },
      ],
      sign: [
        { fx: { set: { zl_contract: true }, aff: { zl: 1 } } },
        ...M(
          { m: 'Then it is signed.', d: 2 },
          'I have written it out properly. You will find it in his Notes, and in his mail, which I imagine is the first time anything binding has arrived there that did not come from Signora.',
        ),
        { run: (api) => {
          const f = api.state.flags;
          const body = contractBody(f);
          try {
            api.store.add('notes', { id: 'n_contract_zl', folder: 'notes', title: 'Contract — Xiansheng', body, t: JC.time.now(), created: JC.time.now(), pinned: true, locked: false }, { front: true });
            api.notify.push({ app: 'notes', title: 'Notes', body: 'Contract — Xiansheng', open: { app: 'notes', intent: { id: 'n_contract_zl' } } });
          } catch (e) { /* notes not seeded */ }
          try {
            api.store.add('mail', { id: 'mail_zl_contract', box: 'inbox', from: { name: 'Zhongli', addr: 'consultant@wangsheng.ly' }, to: [{ name: 'Childe', addr: 'tartaglia@northland.sn' }], subject: 'Terms, as agreed', body: body + '\n\nP.S. Hu Tao has asked me to add that she witnessed this. She did not. She was asleep on Coffin Two.', t: JC.time.now(), read: false, flagged: true, attach: [] }, { front: true });
            api.notify.push({ app: 'mail', title: 'Zhongli', body: 'Terms, as agreed', open: { app: 'mail', intent: { id: 'mail_zl_contract' } } });
          } catch (e) { /* mail not seeded */ }
        } },
        { wait: 2 },
        ...M(
          'Hu Tao has been told. She is delighted. She says, and I quote, "tell the phone person they\'re one of us now", and then she drew a ghost.',
          'One more thing. Before I came home last night, he gave me a list for you. He wrote it on the back of a Wangsheng price list with Hu Tao\'s eyeliner, because no one in the parlor could find a pen.',
          '"1. never say please to Signora. 2. never apologise to Signora either. 3. Teucer\'s Reel Rush record is 2,047. you HAVE to beat it. 4. Scaramouche\'s tuna. you\'ll know. 5. Tonia is smarter than both of us. lie to her well or don\'t lie at all. 6. pay for xiansheng\'s tea."',
          { m: 'He underlined the sixth one twice. I want you to know that I did not ask him to.', d: 3 },
        ),
        { run: (api) => {
          try {
            api.store.add('notes', { id: 'n_coffin4', folder: 'notes', title: 'From Coffin 4 (via xiansheng)', body: 'From Coffin 4 (via xiansheng)\n\n- [ ] never say please to Signora\n- [ ] never apologise to Signora either\n- [ ] beat Teucer\'s Reel Rush record (2,047)\n- [ ] Scaramouche\'s tuna. you\'ll know\n- [ ] Tonia: lie well or don\'t lie at all\n- [ ] pay for xiansheng\'s tea', t: JC.time.now(), created: JC.time.now(), pinned: false, locked: false }, { front: true });
          } catch (e) { /* notes not seeded */ }
        } },
        { if: (s) => !!F(s).zl_pickup && !past(s, '+1 09:30'), go: 'sign_kids' },
        free,
      ],
      sign_kids: [
        { wait: 5 },
        ...M(
          'The children are with me. Teucer has asked whether I am a wizard. I said no. He does not believe me.',
          'Tonia has asked nothing at all, and has watched me the entire time, which I find more alarming.',
        ),
        free,
      ],
      refuse: [
        { fx: { set: { zl_guarded: true }, aff: { zl: -1 } } },
        ...M(
          { m: 'I see.', d: 1.6 },
          'Then there is no contract between us, and I will behave accordingly.',
          'I will not betray you. I will not trust you either. Those are different things, though people often confuse them.',
        ),
        free,
      ],
      none: [{ end: true }],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 3 — Saturday afternoon, "The Opera"
  // ════════════════════════════════════════════════════════════════════

  // The umbrella scene for the afternoon: the invitation, then the opera (in person, or live-texted at 15:00).
  // The invitation's choice lives in its own scene (zl_opera_ask) so that three o'clock never waits for an answer.
  scene({
    id: 'zl_opera', ch: 'sat_noon', required: true,
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 30 },
    expire: 'expire',
    nodes: {
      start: hold('zl_opera'),
      go: [
        lock('zl_opera'),
        { if: (s) => !!F(s).zl_opera_live, go: 'poll_free' },
        ...M(
          'The matinee is at three. Yun Jin\'s new piece for the Rite: "The Lantern and the Stone".',
          'There are two seats in Box 2, both in his name. He bought them two weeks ago and told me it was nothing, which is how he describes everything that matters to him.',
        ),
        { if: (s) => !!F(s).zl_admitted && !F(s).zl_guarded, go: 'invite_friend' },
        { m: 'I assume you will be joining me. You did buy the seats, after all.' },
        { go: 'ask' },
      ],
      invite_friend: M(
        'I would like you to have his seat.',
        'If you would rather not be seen, I understand. If you would rather be seen, the usher will ask for his name. You may give it. Everyone in Liyue is pretending to be someone this weekend; you will be in good company.',
        { go: 'ask' },
      ),
      ask: [free, { start: 'zl_opera_ask' }, { go: 'poll' }],
      poll_free: [free, { go: 'poll' }],
      // wait for the in-person scene, or for three o'clock
      poll: [
        { if: (s) => !!F(s).zl_opera_live || started(s, 'zl_opera_live'), go: 'live_cancel' },
        { if: (s) => past(s, '+1 14:59'), go: 'texts' },
        { wait: 5 },
        { go: 'poll' },
      ],
      live_cancel: [
        { if: (s) => started(s, 'zl_opera_ask') && !finished(s, 'zl_opera_ask'), go: 'live_cancel_ask' },
        { go: 'live_wait' },
      ],
      live_cancel_ask: [cancel('zl_opera_ask'), { go: 'live_wait' }],
      live_wait: [
        { if: (s) => finished(s, 'zl_opera_live'), go: 'after' },
        { wait: 5 },
        { go: 'live_wait' },
      ],
      texts: [
        { if: (s) => !!F(s).zl_opera_live || started(s, 'zl_opera_live'), go: 'live_cancel' },
        { if: (s) => started(s, 'zl_opera_ask') && !finished(s, 'zl_opera_ask'), go: 'texts_noanswer' },
        { if: (s) => held(s) && F(s).busy_zl !== 'zl_opera', go: 'texts_wait' },
        lock('zl_opera'),
        { if: (s) => !!F(s).zl_opera_going, go: 'empty_seat' },
        { go: 'overture' },
      ],
      texts_noanswer: [
        cancel('zl_opera_ask'),
        lock('zl_opera'),
        { m: 'I will take your silence as a no. That is quite all right. I will tell you about it anyway.' },
        { go: 'overture' },
      ],
      texts_wait: [{ wait: 3 }, { go: 'texts' }],
      empty_seat: M(
        'The overture has begun.',
        'The seat beside me is empty. I have put my coat on it, so that it looks occupied by someone very quiet.',
        'I will tell you about it anyway.',
        { go: 'overture' },
      ),
      overture: [
        { img: 'p_heyu_stage' },
        ...M(
          'The curtain is up. A mountain painted in jade and gold, and a single drum.',
          'The god in this piece is played by a man who is considerably taller than necessary. I am not sure why everyone assumes gods are tall.',
        ),
        { wait: 14 },
        ...M(
          'Yun Jin is singing the friend: a woman who lives in the hills and makes bells, and talks to flowers, and argues with the god about whether people can be trusted to keep their own promises.',
          'The god thinks they cannot. She thinks they can, if someone believes they will. They argue about it beautifully for twenty minutes.',
        ),
        { choice: [
          { t: "Who's right?", go: 'right' },
          { t: 'Are you enjoying it, xiansheng?', go: 'enjoy' },
          { t: '[Just keep reading]', silent: true, go: 'act2' },
        ], timeout: 80, onTimeout: 'act2' },
      ],
      right: M('She is. She always was. It took him a very long time to admit it.', { go: 'act2' }),
      enjoy: M('Very much. The costumes are wrong, the dates are wrong, and the god is far too tall. I have not enjoyed anything so much in weeks.', { go: 'act2' }),
      act2: [
        { wait: 18 },
        ...M(
          'The second act. The stage has gone dark except for one lantern.',
          'She is singing the Glaze Lily aria, alone.',
        ),
        { wait: 6 },
        { typing: 5 },
        { wait: 8 },
        { typing: 3 },
        { wait: 10 },
        ...M(
          { m: 'Forgive me. I stopped writing for a moment.', d: 2.6 },
          'She has the words almost exactly right. I do not know where she found them.',
        ),
        { choice: [
          { t: 'Are you crying, xiansheng?', go: 'cry' },
          { t: 'Who was she? The woman in the song.', fx: { set: { zl_asked_lily: true } }, go: 'who' },
          { t: "Take your time. I'm here.", fx: { aff: { zl: 1 } }, go: 'here' },
        ], timeout: 90, onTimeout: 'bows' },
      ],
      cry: M('Discreetly, in the second act. I did warn him.', { go: 'bows' }),
      who: M('Later. I will tell you later, properly. Let me listen to the end.', { go: 'bows' }),
      here: M({ m: 'Thank you.', d: 1.6 }, 'That is a very kind thing to say to someone you have never seen.', { go: 'bows' }),
      bows: [
        { wait: 16 },
        ...M(
          'It is over. Yun Jin took four bows.',
          'On the third she looked up at the box, and at the empty seat, and then at me. I think she understood rather more than I would like.',
          'Thank you for keeping me company. It is a strange thing, to be kept company by a phone. I recommend it.',
        ),
        { go: 'after' },
      ],
      after: [
        free,
        { start: 'zl_what_he_says', delay: 25 },
      ],
      expire: [
        { if: (s) => !!F(s).zl_opera_live, go: 'expire_none' },
        { m: 'The seat beside me was empty for the whole of the opera. I put my coat on it. It was very well behaved.' },
      ],
      expire_none: [{ end: true }],
    },
  });

  // The invitation's answer (cancelled by zl_opera at three o'clock if it is still unanswered).
  scene({
    id: 'zl_opera_ask', ch: 'sat_noon', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_opera_ask'),
      go: [
        lock('zl_opera_ask'),
        { choice: [
          { t: "I'll be there.", fx: { set: { zl_opera_going: true } }, go: 'going' },
          { t: "I can't come. Tell me about it as it happens?", go: 'remote' },
          { t: "I can't come. But keep an eye on your table at three.", fx: { set: { zl_tea_promised: true } }, go: 'tea' },
          { t: '[Leave on read]', silent: true, go: 'end' },
        ] },
      ],
      going: [
        { m: 'Heyu Tea House. Box 2. The stair on the left; the one on the right is for people who wish to be seen arriving.', loc: { place: 'heyu' } },
        { go: 'end' },
      ],
      remote: M('Then I will be your eyes. I warn you that I have opinions about the costumes.', { go: 'end' }),
      tea: M({ m: 'My table.', d: 1.6 }, 'I will keep an eye on it. I am intrigued, and a little frightened.', { go: 'end' }),
      end: [free],
    },
  });

  // In person (Maps → directions to Heyu). He sees your face. He texts you from the seat beside you.
  scene({
    id: 'zl_opera_live', ch: 'sat_noon',
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_opera_live'),
      go: [
        lock('zl_opera_live'),
        { if: (s) => !past(s, '+1 14:50'), go: 'early' },
        { time: '+6m', card: 'You are late. The overture has already begun. The usher hurries you up a narrow staircase that smells of sandalwood and old applause.', lock: false },
        { go: 'box' },
      ],
      early: [
        { time: '+1 14:56', card: 'Heyu Tea House. The usher looks at the name on the ticket, then at you, and says “Box 2” as though it were a password.', lock: false },
        { go: 'box' },
      ],
      box: [
        { sys: 'He is already there.' },
        { wait: 2 },
        { sys: 'He stands when you come in, the way people did in old films. For a moment he simply looks at you.' },
        { wait: 3 },
        { sys: 'Then he pours you a cup of tea, sits down, and takes out his phone.' },
        { wait: 2 },
        ...M(
          'One does not speak during Yun Jin\'s overture. One may, however, text, if one is discreet.',
          { m: 'So that is your face.', d: 2.4 },
          { m: 'It is a good face. It looks as though it has not slept.', d: 2.6 },
        ),
        { choice: [
          { t: "It hasn't. Hi, xiansheng.", go: 'hi' },
          { t: 'You look exactly like the photos in his phone.', go: 'photos' },
          { t: 'Is this weird? This feels weird.', go: 'weird' },
        ] },
      ],
      hi: [{ m: 'Hello.' }, { sys: 'He smiles at the stage, not at you. It counts anyway.' }, { go: 'act1' }],
      photos: [{ m: 'I am told I photograph as though I am about to deliver a lecture. I am told this by him, constantly.' }, { go: 'act1' }],
      weird: [{ m: 'It is the strangest afternoon I have had in some time. I have had some very strange afternoons.' }, { go: 'act1' }],
      act1: [
        { wait: 3 },
        { sys: 'The curtain rises on a mountain painted in jade and gold. Yun Jin enters to a single drum.' },
        { wait: 4 },
        ...M(
          'The god in this piece is played by a man who is considerably taller than necessary.',
          'I am not sure why everyone assumes gods are tall.',
        ),
        { if: (s) => !!F(s).knows_morax && !F(s).zl_confessed, go: 'hint' },
        { go: 'act2' },
      ],
      hint: [
        { choice: [
          { t: 'Speaking from experience?', fx: { set: { zl_opera_hint: true } }, go: 'hint_yes' },
          { t: '[Drink your tea]', silent: true, go: 'act2' },
        ] },
      ],
      hint_yes: [
        { sys: 'He goes very still. Then, carefully, he drinks his tea.' },
        { wait: 3 },
        { m: 'We will talk about that. Not here.', d: 2.4 },
        { go: 'act2' },
      ],
      act2: [
        { wait: 6 },
        { sys: 'The second act. The stage goes dark except for a single lantern, and Yun Jin sings the Glaze Lily aria alone.' },
        { wait: 4 },
        { sys: 'Beside you, he stops typing.' },
        { wait: 6 },
        { sys: 'You don\'t look at him. It seems like the kind thing to do.' },
        { wait: 5 },
        ...M({ m: 'Forgive me.', d: 2 }, 'She has the words almost exactly right. I do not know where she found them.'),
        { choice: [
          { t: 'Who was she? The woman in the song.', fx: { set: { zl_asked_lily: true } }, go: 'who' },
          { t: '[Slide him a napkin]', silent: true, fx: { aff: { zl: 1 } }, go: 'napkin' },
          { t: '[Say nothing]', silent: true, go: 'nothing' },
        ] },
      ],
      who: [{ m: 'Later. I will tell you later. Let us listen.' }, { go: 'bows' }],
      napkin: [{ sys: 'You slide a napkin along the armrest. He takes it without looking at you, and keeps it.' }, { go: 'bows' }],
      nothing: [{ sys: 'You say nothing. The aria ends. The applause comes up like rain on a tin roof.' }, { go: 'bows' }],
      bows: [
        { wait: 4 },
        { sys: 'Yun Jin takes four bows. On the third, she looks straight up at Box 2, and at you.' },
        { wait: 2 },
        ...M(
          'She has noticed you are not him.',
          'She will not say anything. Opera singers are very good at keeping secrets. It is most of the job.',
        ),
        { wait: 3 },
        { sys: 'Outside, the harbor smells of rain that hasn\'t arrived. He walks you as far as the corner, and stops.' },
        { wait: 2 },
        { m: 'Thank you for coming. I think he would have liked to see us here. I think he would have been unbearable about it.' },
        { wait: 2 },
        { sys: 'He bows, very slightly, and walks away up Feiyun Slope. He doesn\'t look back. You get the feeling he wants to.' },
        free,
      ],
    },
  });

  // Tea delivered to Heyu (Wanmin Go, `order { to: 'heyu' }`).
  scene({
    id: 'zl_tea_arrives', ch: 'sat_noon', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_tea_arrives'),
      go: [
        lock('zl_tea_arrives'),
        { m: 'A delivery has arrived at Box 2.' },
        { if: (s) => !!F(s).zl_tea_tentacles, go: 'tentacles' },
        { m: 'Tea, steeped correctly, which tells me you asked someone how. That is the beginning of wisdom.' },
        { if: (s) => !!F(s).zl_opera_live, go: 'beside' },
        { go: 'ask' },
      ],
      tentacles: M(
        'It contains tea. It also contains, under a lid, something with tentacles.',
        { m: 'I can only assume you have been very thoroughly briefed.', d: 2.4 },
        { go: 'ask' },
      ),
      beside: M('You realise I can see you. You ordered it from the seat beside me. You have been staring at your phone with tremendous innocence.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: 'Enjoy the opera, xiansheng.', go: 'enjoy' },
          { t: "It's from him, really. He'd have done it.", fx: { aff: { zl: 1 } }, go: 'him' },
        ], timeout: 90, onTimeout: 'end' },
      ],
      enjoy: M('I will. Thank you.', { go: 'end' }),
      him: M('No. He would have bought the tea house. This is from you. I can tell the difference.', { go: 'end' }),
      end: [free],
    },
  });

  scene({
    id: 'zl_what_he_says', ch: 'sat_noon', soft: true,
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 720 },
    nodes: {
      start: [
        { if: (s) => !F(s).zl_admitted, go: 'none' },
        { go: 'wait' },
      ],
      wait: hold('zl_what_he_says', 'go', 'wait'),
      go: [
        lock('zl_what_he_says'),
        ...M(
          'May I ask you something? Not under the third clause. Only as a question.',
          'You have read his messages. You have been him for a day and a half. You must have seen things in his phone that I have not.',
          { m: 'What does he say about me, when I am not there?', d: 3 },
        ),
        { choice: [
          { t: 'He keeps a ledger. Read the bottom.', label: '[Send him a screenshot of the Ledger]', if: (s) => !!F(s).ledger_read && !F(s).ledger_shared, send: [{ img: 'p_ledger' }], go: 'ledger' },
          { t: '[Send him the voice memo “for xiansheng (don’t send)”]', silent: true, if: (s) => !!F(s).memo_zl_heard && !F(s).memo_zl_sent && !F(s).zl_memo_done, go: 'memo' },
          { t: "Honestly? He mostly talks about paying for your dinners. Constantly. Happily.", fx: { aff: { zl: 1 } }, go: 'paying' },
          { t: "He says you're his best friend.", go: 'lie' },
          { t: 'Ask him yourself.', fx: { set: { zl_ask_him: true } }, go: 'ask' },
        ] },
      ],
      memo: [free, sendMemo, { end: true }],
      paying: M(
        { m: '"Happily."', d: 2 },
        'I had wondered whether he minded. I find I had been afraid to ask.',
        { go: 'next' },
      ),
      lie: [
        ...M(
          { m: 'Best friend.', d: 2 },
          { wait: 2 },
          'You are being kind. I can tell, because he has never in his life used the word "best" about anything that was not a fish.',
          'Thank you. It was a good lie. I will keep it.',
        ),
        { go: 'next' },
      ],
      ask: [
        ...M({ m: 'Ask him myself.', d: 2 }, 'Yes. I suppose that is the only honest answer.'),
        { if: (s) => !!F(s).zl_contract, go: 'ask_contract' },
        { go: 'next' },
      ],
      ask_contract: [
        { fx: { aff: { zl: 1 } } },
        { if: (s) => !!F(s).clause_four, go: 'ask_four' },
        { m: 'You are very good at answering truthfully without answering at all. I wrote that clause, and I am beginning to regret it.' },
        { go: 'next' },
      ],
      ask_four: M('And I suppose I am contractually obliged to, now. You have been very efficient.', { go: 'next' }),
      ...ledgerNodes('next'),
      next: [free, { start: 'zl_guizhong', delay: 60 }],
      none: [{ end: true }],
    },
  });

  // The Ledger screenshot, sent from Photos at any time.
  scene({
    id: 'zl_ledger', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_ledger'),
      go: [
        { if: (s) => !!F(s).ledger_shared, go: 'none' },
        lock('zl_ledger'),
        { if: (s) => !aware(s), go: 'friday' },
        { go: 'ledger' },
      ],
      friday: [
        { fx: { set: { ledger_shared: true }, aff: { zl: 1 } } },
        ...M(
          { m: '"He\'s worth it. Don\'t tell him."', d: 3 },
          { wait: 3 },
          'Childe, you have sent me a photograph of a note to yourself about me.',
          'I am going to assume that this was an accident, as I assume most things you do after midnight are accidents.',
          { m: 'I am also going to keep it.', d: 2.2 },
        ),
        { go: 'end' },
      ],
      ...ledgerNodes('end'),
      end: [free],
      none: [{ end: true }],
    },
  });

  // The Glaze Lily story.
  scene({
    id: 'zl_guizhong', ch: 'sat_noon', soft: true,
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 800 },
    nodes: {
      start: hold('zl_guizhong'),
      go: [
        lock('zl_guizhong'),
        { if: (s) => !!F(s).zl_asked_lily, go: 'promised' },
        { m: 'I would like to tell you a story, if you have a moment. It is not a long one. That is to say, it is a very long one, and I will tell you the short version.' },
        { go: 'story' },
      ],
      promised: M('I said I would tell you about the woman in the song.', { go: 'story' }),
      story: [
        ...M(
          'Her name was Guizhong. She lived in the hills above what is now Qingce, a very long time ago, when Liyue was not yet a harbor but only a beach with ambitions.',
          'She was clever in a way that made other clever people uncomfortable. She made things: bells, glazes, small machines that did not need to exist and were wonderful anyway.',
          'She talked to the Glaze Lilies. She said a lily remembers the voice of whoever planted it, and blooms better if they keep talking.',
          { m: 'I told her that was superstition.', d: 2.4 },
          'She died in a war that was not hers. Afterwards the lilies on her hill stopped blooming, all at once, as though they were waiting for someone to say something.',
          'I talked to them anyway. For a long time. They came back eventually. I do not think it was because of me. But I have never been entirely certain that it wasn\'t.',
        ),
        { if: (s) => !!F(s).bought_teaset, go: 'teaset' },
        { go: 'lilies' },
      ],
      teaset: [
        ...M(
          'The tea set arrived at the parlor an hour ago. Hu Tao signed for it, and then opened it, and then pretended she had not.',
          { m: 'There is a mark on the base of the teapot. Her mark. A lily, three strokes. She painted it on everything she was proud of.', d: 3 },
          { wait: 3 },
          { m: 'I did not think I would see it again.', d: 2.6 },
        ),
        { fx: { set: { zl_moved: true }, aff: { zl: 1 } } },
        { go: 'lilies' },
      ],
      lilies: [
        { if: (s) => !!F(s).lilies_sent && !started(s, 'zl_lilies'), go: 'lilies_yes' },
        { go: 'ask' },
      ],
      lilies_yes: M('And someone has sent Glaze Lilies to the parlor this afternoon, with no card. They are on my desk. Hu Tao has photographed them nine times and accused me of having a secret admirer.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: 'She sounds wonderful.', fx: { aff: { zl: 1 } }, go: 'wonderful' },
          { t: 'You talk about her like you were there.', go: 'there' },
          { t: 'Does he know about her?', go: 'him' },
          { t: '[Say nothing]', silent: true, go: 'quiet' },
        ], timeout: 120, onTimeout: 'quiet' },
      ],
      wonderful: M('She was. She would have liked you. She liked anyone who asked questions without being afraid of the answers.', { go: 'end' }),
      there: [
        { if: (s) => !!F(s).zl_confessed, go: 'there_true' },
        ...M({ m: 'Do I?', d: 1.6 }, { wait: 3 }, { m: 'I read a great deal.', d: 2 }),
        { wait: 2 },
        { m: 'That is the last time I will say that to you. I think you deserve better than it.' },
        { fx: { set: { zl_hinted: true } } },
        { go: 'end' },
      ],
      there_true: M('I was. You know that now. It is a relief to say so to someone.', { go: 'end' }),
      him: M('He knows her name. He knows I go to Qingce every August. He has never once asked why, which I have come to understand is his way of being gentle.', { go: 'end' }),
      quiet: M('Thank you for listening. It is a long time since I told anyone.', { go: 'end' }),
      end: [free],
    },
  });

  // Glaze Lilies sent to Wangsheng (Feiyun Market): Hu Tao's photo of his desk.
  scene({
    id: 'zl_lilies', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'ok WHO sent glaze lilies to the parlor 👀', th: 'ht', from: 'ht' },
        { img: 'p_glaze_lily', th: 'ht', from: 'ht' },
        { m: "they're on xiansheng's desk. he's been looking at them for twenty minutes. no paperwork. no tea. just looking. this is the most emotion i've seen out of him since the incense shortage 👻🦋", th: 'ht', from: 'ht' },
        { go: 'zl' },
      ],
      zl: hold('zl_lilies', 'go', 'zl'),
      go: [
        lock('zl_lilies'),
        { fx: { aff: { zl: 1 } } },
        ...M(
          'Someone has sent Glaze Lilies to Wangsheng, with no card.',
          'I am not going to ask who. Some kindnesses ought to be received without an investigation.',
          'But if it was you: thank you. They are the right ones. Most florists send the white mountain lily and call it glaze, and it is not the same flower at all.',
        ),
        free,
      ],
    },
  });

  // Teucer meets "Mr. Zhongli, the factory manager" (S1b's toy-factory tour at Mingyun).
  scene({
    id: 'zl_factory_tour', ch: 'sat_noon', soft: true,
    trigger: { on: 'flag', flag: 'factory_zl', delay: 200 },
    nodes: {
      start: hold('zl_factory_tour'),
      go: [
        lock('zl_factory_tour'),
        ...M(
          'I have just been introduced to a child as "Mr. Zhongli, the factory manager".',
          'He asked whether the toys are made by elves. I said the elves are on strike.',
          'He asked what they want. I said better tea, shorter hours, and a pension. He has written all of this down. I believe he intends to negotiate on their behalf.',
        ),
        { if: (s) => !!F(s).gift_teucer, go: 'gift' },
        { go: 'ask' },
      ],
      gift: M('He has also shown me a new toy, which he says his brother chose. He is holding it the way one holds a contract.', { go: 'ask' }),
      ask: [
        { choice: [
          { t: "You're a natural, xiansheng 😁", fx: { aff: { zl: 1 } }, go: 'natural' },
          { t: 'Thank you. Really.', fx: { aff: { zl: 1 } }, go: 'thanks' },
        ], timeout: 90, onTimeout: 'end' },
      ],
      natural: M('I have had a great deal of practice lying to people for their own good. It is pleasant, for once, to do it for elves.', { go: 'end' }),
      thanks: M('You are welcome. Tonia has been watching me the entire time. I think she is the only person in the shop who knows that elves do not unionise.', { go: 'end' }),
      end: [free],
    },
  });

  // Paimon has been eating the weekend on his card.
  scene({
    id: 'zl_paimon', soft: true,
    trigger: { on: 'manual' },
    nodes: {
      start: hold('zl_paimon'),
      go: [
        lock('zl_paimon'),
        ...M(
          'Hu Tao informs me that a small person known as "Emergency Food" has been ordering from Wanmin on his card.',
          { m: 'At length.', d: 1.4 },
          'I have never felt so understood. I would like to meet her and compare techniques.',
        ),
        free,
      ],
    },
  });
})();
