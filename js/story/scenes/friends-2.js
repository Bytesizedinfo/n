/* Live scenes — Friends, part 2 (S3): chapters 4–7. Hotpot night, Beidou's deck and the rematch, Hu Tao's night,
   the Rite of Parting, Lumine's guard, Osial on the water, Skirk's 03:00 message and the Chasm, Monday goodbyes.
   Helpers come from friends-1.js (JC.storyFriends). Facts: docs/STORY.md "Friends". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const { F, idOf, say, by, scene, kidsSafe } = JC.storyFriends;
  const H = () => JC.storyHelpers || {};
  const osialStopped = (s) => (H().osialStopped ? !!H().osialStopped(s) : !F(s).osial_sent && !!(F(s).leaked_yelan || F(s).leaked_ning || F(s).ops_sabotage || F(s).zl_amended || F(s).card_frozen));
  /** charge the one Northland card; returns 'paid' | 'declined' */
  const charge = (o) => {
    try { const r = JC.bank.charge(o); return r && r.ok ? 'paid' : 'declined'; } catch (e) { return 'paid'; }
  };

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 4 — Saturday night
  // ════════════════════════════════════════════════════════════════════

  // ── Hotpot happened without him (slot 60): the photo, the bill, the empty chair ──
  scene({
    id: 'fr_crew_hotpot', thread: 'crew', ch: 'sat_night', lock: 'crew',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 60 },
    nodes: {
      go: [
        ...by('paimon', "HOTPOT CREW!!! 🔥🔥🔥"),
        { m: '', img: 'p_hotpot_crew', from: 'paimon' },
        { if: (s) => !!F(s).zl_in_crew, go: 'zl' },
        { go: 'bill' },
      ],
      zl: [
        ...by('ht', "zhongli CAME. he ordered for the whole table with enormous authority. then we all looked at childe's empty chair 👻"),
        ...by('zl', "The broth was excellent. Xiangling has achieved something rare with the star anise. I have left my compliments, and nothing else, with the kitchen."),
        { go: 'bill' },
      ],
      bill: [
        { if: (s) => !F(s).hotpot_tab, go: 'split' },
        { run: (api) => api.story.applyFx({ set: { hotpot_paid: charge({ amount: 2380, merchant: 'Wanmin Restaurant', app: 'lotuseats', cat: 'Food & Drink', note: 'hotpot crew 🔥 (back room)', place: 'wanmin-rest', sms: 'WANMIN RESTAURANT' }) } }) },
        { if: (s) => F(s).hotpot_paid === 'declined', go: 'declined' },
        ...by('xl', "Put it on your tab like always, Childe!! ℳ2,380!! Paimon had NINE plates of lamb 🔥"),
        ...by('paimon', "IT WAS EIGHT!!! The ninth was a SNACK!!!"),
        { go: 'where' },
      ],
      declined: [
        ...by('xl', "Childe… your card got declined at the counter?? 😳"),
        ...by('paimon', "DECLINED!!! Paimon has never been so ASHAMED!!! Lumine paid!!! LUMINE!!! In COINS!!! 😭"),
        ...by('lumine', "i paid in coins. it took eleven minutes. xiangling counted with me"),
        { go: 'where' },
      ],
      split: [
        ...by('lumine', "we split it. paimon contributed 'emotional support'"),
        ...by('paimon', "Childe didn't PAY. Childe ALWAYS pays. Paimon told the broth. The broth was SHOCKED"),
        { go: 'where' },
      ],
      where: [
        ...by('ht', "where WERE you mr. harbinger 👻 we saved you a fish ball. paimon ate it"),
        { choice: [
          { t: "Busy saving the world 😁 Next one's mine, I swear", go: 'world' },
          { t: "With my siblings! Teucer says hi 🐟", go: 'kids' },
          { t: "With xiansheng 😏", go: 'withzl' },
          { t: "Sorry. I just couldn't face it tonight.", fx: { sus: { ht: 1, lumine: 1 } }, go: 'sad' },
        ] },
      ],
      world: [...by('paimon', "Saving the world doesn't count if there's no FOOD in it!!!"), ...by('xl', "Next one's yours!! I'm writing it on the wall 🔥")],
      kids: [...by('paimon', "HI TEUCER!!! Tell him Paimon says he can have Paimon's fish ball next time!!! (Paimon will not save the fish ball.)"), ...by('lumine', "tell tonia i said hi. she'll know why")],
      withzl: [
        { if: (s) => !!F(s).zl_in_crew, go: 'withzl_caught' },
        ...by('ht', "THE FUNERAL AND THE FISHERMAN 🦋⚰️🐟"),
        ...by('ht', "(he did leave early. said he had 'a walk'. a WALK. at NIGHT. on a TERRACE.)"),
      ],
      withzl_caught: [
        ...by('zl', "I was here, Childe. With a great many plates of lamb."),
        ...by('paimon', "LIAR!!! He was HERE!!! Paimon WATCHED him eat a MUSHROOM for TEN MINUTES!!!"),
        { fx: { sus: { ht: 1 } } },
      ],
      sad: [...by('lumine', "…ok", "that's not like you"), ...by('ht', "hmm. 🦋")],
    },
  });

  // ── Beidou on deck, 21:50 ──
  scene({
    id: 'fr_beidou_deck', thread: 'beidou', ch: 'sat_night', lock: 'beidou',
    trigger: { on: 'time', at: '+1 21:50' },
    when: (s) => !!F(s).beidou_accepted && !F(s).beidou_went,
    nodes: {
      go: [
        { m: "Deck's clear. Lanterns lit. Crew's got the wine open. ⚓" },
        { m: '', img: 'p_alcor_deck' },
        { m: "Where are you, kid?" },
        { choice: [
          { t: "On my way. Warm up, captain 😁⚔️", fx: { set: { beidou_otw: true } }, go: 'otw' },
          { t: "Something came up. Rain check?", fx: { set: { beidou_snubbed: true }, sus: { beidou: 1 } }, go: 'snub' },
          { t: '[Leave on read]', silent: true, go: 'none' },
        ] },
      ],
      otw: say("HA! The crew just cheered. Kazuha is pretending he didn't.", "Crux Pier. Red sails. Don't make me come find you."),
      snub: say("Something came up. On rematch night.", "…Fine, kid. But the whole crew watched me wait in my good coat. Don't ask the Crux for favors this week. ⚓"),
      none: [],
    },
  });

  // ── 22:45: nobody came ──
  scene({
    id: 'fr_beidou_snub', thread: 'beidou', ch: 'sat_night', lock: 'beidou',
    trigger: { on: 'time', at: '+1 22:45' },
    when: (s) => !!F(s).beidou_accepted && !F(s).beidou_went && !F(s).beidou_snubbed,
    nodes: {
      go: [
        ...say("22:45.", "Deck's empty. Crew's quiet. Kazuha wrote a poem. It's about waiting.", "You stood me up, kid."),
        { fx: { set: { beidou_snubbed: true } } },
        { m: "Don't come asking the Crux for favors this week. ⚓" },
      ],
    },
  });

  // ── Maps → directions to the Alcor during chapter 4: you go. Third-Round Knockout. ──
  scene({
    id: 'fr_rematch_go', thread: 'beidou',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !!F(s).beidou_snubbed, go: 'late' },
        { if: (s) => !F(s).beidou_accepted, go: 'changed' },
        { m: "There's someone on my gangway. ⚓", d: 1.5 },
        { go: 'face' },
      ],
      late: [{ m: "Ha! Late, kid. Very late. The crew went to bed. I didn't." }, { go: 'face' }],
      changed: [{ m: "Someone's on my gangway. You said you couldn't, kid. Changed your mind? Good." }, { go: 'face' }],
      face: [
        { fx: { set: { beidou_went: true, beidou_accepted: true, beidou_snubbed: false } } },
        { m: "Kazuha says it's you. Kazuha also says 'the wind disagrees'." },
        { wait: 4 },
        { m: "…Huh.", d: 2 },
        ...say(
          "You're not the kid.",
          "Same coat. Same phone. Same ridiculous fish charm. Wrong face. Wrong walk. You walk like someone who's never set foot on a ship.",
        ),
        { wait: 2 },
        ...say("But you came. On rematch night. To MY deck. Nobody does that by accident.", "Kazuha, get our guest a sword. The light one."),
        { wait: 3 },
        { m: "Three rounds. Still standing after the third, and you can tell me where the kid is. ⚓" },
        { wait: 3 },
        { ending: 'rematch' },
      ],
    },
  });
  S.onAct({ id: 'fr_alcor', arc: 'friends', act: 'directions', match: (p, s) => idOf(p) === 'alcor' && s.chapter === 'sat_night' && !F(s).beidou_went, start: 'fr_rematch_go', delay: 8 });

  // ── Hu Tao's night (slot ~720; S4's chapter floor is 00:30) ──
  scene({
    id: 'fr_ht_night', thread: 'ht', ch: 'sat_night', lock: 'ht',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 720 },
    nodes: {
      go: [
        { if: (s) => !!F(s).ht_ally, go: 'ally' },
        ...say("big day tomorrow. biggest funeral in liyue's history. i'm so excited i could die. (i won't. professional courtesy) 👻", "poem: tomorrow we bury a god who was old, the lanterns are lit and the tea's getting cold 🦋"),
        { choice: [
          { t: "Break a leg, director. Not literally 😁", go: 'leg' },
          { t: "Is xiansheng okay? He's been quiet.", go: 'quiet' },
          { t: "What happens after the rite?", fx: { sus: { ht: 1 } }, go: 'after' },
        ] },
      ],
      leg: say("literally would be good for business. but ok 👻"),
      quiet: say("he's been quiet since the first. he wrote the eulogy himself and keeps reading it with a face like he's reviewing a restaurant he owns", "weird man. good man. go to sleep 🦋"),
      after: say("the parlor gets very rich and zhongli gets very… free? he said that. 'free'. weird word for a consultant", "why do YOU care, mr. harbinger 👻"),
      ally: [
        ...say("package report 👻", "he did two hundred push-ups in the showroom. the coffins are scared. zhongli watched and said 'adequate'", "he's asked about his siblings forty-one times today. i'm counting. are they ok?"),
        { choice: [
          { t: "Asleep and safe. Tell him 🐟", go: 'relay' },
          { t: "Tell him to stay in the box. I've got this.", fx: { set: { ht_relay: 'box' } }, go: 'box' },
          { t: "Tell him the truth. It's getting bad out here.", fx: { set: { ht_relay: 'truth' } }, go: 'truth' },
        ] },
      ],
      relay: [
        { if: (s) => !kidsSafe(s), go: 'relay_lie' },
        { fx: { set: { ht_relay: 'safe' } } },
        { m: "telling him. he made a noise like a kettle. a happy kettle 👻" },
      ],
      relay_lie: [{ fx: { set: { ht_relay: 'lie' } } }, { typing: 3 }, ...say("…ok.", "telling him.")],
      box: say("he says 'who does this guy think he is'. then he said 'ok'. then he lay back down", "that's trust, phone ghost. from him that's practically a hug 🦋"),
      truth: say("…ok. he's sitting up.", "zhongli put a hand on his shoulder and he lay back down. he says 'i trust xiansheng. and the phone person. barely'", "barely is a lot, from him 👻"),
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 5 — Sunday, the Rite of Parting
  // ════════════════════════════════════════════════════════════════════

  // ── Hu Tao from the rite (slot ~250, no choices) ──
  scene({
    id: 'fr_ht_rite', thread: 'ht', ch: 'sun_rite',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 250 },
    nodes: {
      start: [
        { m: "the rite is going GREAT 👻 everyone's crying. the good kind" },
        { if: (s) => !!F(s).lilies_sent, go: 'lilies' },
        { m: "zhongli read the eulogy. he paused at a line about 'an old friend who planted lilies'. then he kept going. i've never seen him pause" },
        { go: 'tail' },
      ],
      lilies: [{ m: "zhongli read the eulogy. he paused at a line about 'an old friend who planted lilies'. he had your glaze lilies tucked in his sleeve. i saw. i see everything" }, { go: 'tail' }],
      tail: [
        { if: (s) => !!F(s).ht_ally, go: 'pkg' },
        { m: "ok i have to light three thousand incense sticks. pray for my eyebrows 🦋" },
      ],
      pkg: say("the package watched from the showroom window with my binoculars. he cried. he says he didn't. he did", "ok i have to light three thousand incense sticks. pray for my eyebrows 🦋"),
    },
  });

  // ── Lumine on guard duty (slot 400): free because she has the notes (gave_abyss_notes → lumine_guard) ──
  scene({
    id: 'fr_lumine_guard', thread: 'lumine', ch: 'sun_rite', lock: 'lumine',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 400 },
    nodes: {
      go: [
        { if: (s) => !F(s).gave_abyss_notes, go: 'busy' },
        { m: "funeral crowds are insane. half of liyue on yujing terrace, all in white" },
        { m: "i'm not going down until 3 tonight. like you said. so i'm free today" },
        { if: (s) => !!F(s).lumine_eye, go: 'eye' },
        { go: 'offer' },
      ],
      eye: [
        ...say("you asked me to keep an eye on your siblings. i'm keeping it", "already with them. paimon is teaching teucer to eat faster. this is a mistake"),
        { fx: { set: { lumine_guard: true } } },
        { start: 'fr_lumine_guard_report', delay: 250 },
      ],
      offer: [
        { m: "want me on your siblings today? there are men in grey coats near the hotels. paimon says they 'smell like snow'" },
        { choice: [
          { t: "Do it, comrade. Don't let them out of your sight ⚔️", fx: { set: { lumine_guard: true }, aff: { lumine: 1 } }, go: 'on' },
          { t: "They're fine. Rest before tonight.", go: 'rest' },
        ] },
      ],
      on: [...say("on it.", "paimon is bringing snacks. teucer is about to learn about snacks"), { start: 'fr_lumine_guard_report', delay: 250 }],
      rest: say("ok. i'll be on the terrace anyway. if something happens, call. don't text. call"),
      busy: [
        ...say("going down the chasm today. alone. since nobody gave me a map", "if you find it before i'm out of signal, send it"),
        { choice: [
          { t: "Found it. Go at 3, not now.", label: '[Send the map] “Found it. Go at 3, not now.”', if: (s) => !!F(s).clue_abyss, send: [{ img: 'p_abyss_map' }], fx: { set: { gave_abyss_notes: true, lumine_map_sent: true }, aff: { lumine: 2 } }, go: 'late_map' },
          { t: "Be careful down there, comrade.", go: 'careful' },
          { t: "Don't go alone.", go: 'alone' },
        ] },
      ],
      late_map: [
        { typing: 5 },
        ...say("…3 am. 'down. keep going.'", "ok. i'll wait for tonight. thank you, childe", "so i'm free today. want me on your siblings?"),
        { choice: [
          { t: "Do it ⚔️", fx: { set: { lumine_guard: true } }, go: 'on' },
          { t: "Rest. Tonight's the real fight.", go: 'rest' },
        ] },
      ],
      careful: say("i'm always careful. you're the one who falls in rivers"),
      alone: say("i'm not alone. paimon", "she's emotional support"),
    },
  });
  scene({
    id: 'fr_lumine_guard_report', thread: 'lumine',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !F(s).dottore_cancelled && !F(s).arle_protects, go: 'beak' },
        { m: "quiet so far. teucer has eaten four sweet buns and asked me nine questions about the toy factory. i answered three. badly" },
        { go: 'tail' },
      ],
      beak: [
        ...say("a man in a beak mask came up to teucer at the rite. 'complimentary health check for children'. clipboard and everything", "i said no. he said 'i wasn't asking you'", "paimon bit him", "we left. teucer thinks the beak man was part of the funeral. a 'bird priest'"),
        { go: 'tail' },
      ],
      tail: [
        { if: (s) => !!F(s).lumine_toyboard, go: 'board' },
        { m: "kids are fine. i've got them till tonight" },
      ],
      board: say("he asked about the toy board again. i said they're 'in session'", "kids are fine. i've got them till tonight"),
    },
  });

  // ── Paimon at the funeral: no food, only incense (slot ~600) ──
  scene({
    id: 'fr_paimon_rite', thread: 'paimon', ch: 'sun_rite', lock: 'paimon',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 600 },
    nodes: {
      go: [
        ...say("CHILDE!!! Paimon is at the FUNERAL!!!", "There is NO FOOD!!! There is only INCENSE!!!", "Hu Tao says you can't eat incense. Paimon tried. Hu Tao was right. 😭"),
        { if: (s) => !!F(s).card_frozen, go: 'frozen' },
        ...say("BUT!!! Wanmin Go has a special today!!! The 'MOURNING MENU'!!! It's EVERYTHING on the menu for ℳ4,980!!! For GRIEF!!!", "Can Paimon get it delivered to Yujing Terrace??? To the GOD'S FUNERAL??? The god would WANT Paimon to eat!!!"),
        { choice: [
          { t: "For grief. Sure. You'll have it, Emergency Food 😤", fx: { set: { paimon_promised: true } }, go: 'ok' },
          { t: "Paimon. It's a funeral.", go: 'funeral' },
          { t: "The god would want you to fast.", go: 'fast' },
        ] },
      ],
      frozen: say("And your card is STILL FROZEN!!! Paimon checked!!! TWICE!!!", "Paimon is going to faint. Respectfully. At a funeral."),
      ok: say("PAIMON WILL GRIEVE SO HARD!!! 😭🍲", "(Paimon can't order on YOUR account, Paimon doesn't have your PASSWORD. You have to do it in the APP. Deliver to 'Emergency Food Drop'. Lumine will bring it. Paimon will WAIT.)"),
      funeral: say("A HUNGRY funeral!!!", "…Fine. Paimon will be RESPECTFUL. Paimon will eat RESPECTFULLY. Later."),
      fast: say("THE GOD WOULD NOT!!! Zhongli said Rex Lapis LOVED a feast!!!", "He said it in a really SPECIFIC way. Like he was THERE. Zhongli is weird!!!"),
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 6 — Sunday night
  // ════════════════════════════════════════════════════════════════════

  // ── Xiangling offers to feed the scared night shift (slot ~650) ──
  scene({
    id: 'fr_xl_ops_offer', thread: 'xl', ch: 'sun_night', lock: 'xl',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 650 },
    nodes: {
      go: [
        ...say(
          "Childe!! I'm doing a late delivery run down Harbor Road 🔥",
          "Your office lights are on. All of them. At midnight. There are people at the windows and they look scared",
          "Want me to bring them something warm? Pelmeni and soup for everyone? I'll put it on your tab 🥟",
        ),
        { choice: [
          { t: "Do it. Everything. On my tab 😁", go: 'deliver' },
          { t: "They're Fatui. They run on fear and vending-machine soda 😁", go: 'no' },
        ] },
      ],
      deliver: [
        { run: (api) => {
          const r = charge({ amount: 980, merchant: 'Wanmin Go', app: 'lotuseats', cat: 'Food & Drink', note: 'Night shift: pelmeni ×40, soup ×12', place: 'northland', sms: 'WANMIN GO' });
          api.story.applyFx({ set: { xl_ops_paid: r } });
          // Xiangling delivers either way; Wanmin Go records it as an order to the bank (the ops arc counts it)
          api.story.act('order', { rest: 'wanmin', to: 'northland', total: 980, items: [{ name: 'Pelmeni (Mama’s recipe)', qty: 40, price: 18 }, { name: 'Night-shift soup', qty: 12, price: 22 }], via: 'xl' });
        } },
        { if: (s) => F(s).xl_ops_paid === 'declined', go: 'declined' },
        ...say("On it!! 🔥🔥", "Guoba is riding in the basket. He insists"),
      ],
      declined: say("Your card got declined?? 😳", "I'm bringing it anyway. Pay me in fish 🐟🔥"),
      no: say("That's the saddest thing you've ever said 😭", "I'm leaving a pot of soup by their door anyway. Nobody's too scary for soup"),
    },
  });

  // ── Osial is sent: the harbor goes dark. Lumine fights; the Crux pulls people off the piers. ──
  scene({
    id: 'fr_osial_friends', thread: 'lumine',
    trigger: { on: 'flag', flag: 'osial_sent', delay: 30 },
    when: (s) => !!F(s).osial_sent,
    nodes: {
      start: [
        ...say("there's something in the water off guyun. something big. the pillars are glowing", "i'm going to the east pier. people are still on the low docks"),
        { if: (s) => !!F(s).gave_abyss_notes, go: 'chasm' },
        { go: 'crux' },
      ],
      chasm: [{ m: "the chasm can wait one more night" }, { go: 'crux' }],
      crux: [
        { if: (s) => !!F(s).beidou_snubbed, go: 'crux_cold' },
        { m: "Every Crux ship is out pulling people off the low piers. The Alcor has the east side. Whatever you did, kid, I hope you've got a way to undo it. ⚓", th: 'beidou', from: 'beidou' },
        { go: 'paimon' },
      ],
      crux_cold: [{ m: "Every Crux ship is out pulling people off the low piers. Not for you, kid. For the harbor. ⚓", th: 'beidou', from: 'beidou' }, { go: 'paimon' }],
      paimon: [{ m: "Childe… is this a FOOD emergency or a REAL emergency??? Lumine left without her snacks… Paimon is holding them… 😢", th: 'paimon', from: 'paimon' }],
    },
  });

  // ── The contract is broken: Hu Tao stops covering ──
  scene({
    id: 'fr_ht_closed', thread: 'ht',
    trigger: [{ on: 'flag', flag: 'morax_sold', delay: 30 }, { on: 'flag', flag: 'zl_broken', delay: 30 }],
    when: (s) => !!(F(s).morax_sold || F(s).zl_broken),
    nodes: {
      start: [
        ...say("hey. phone person.", "i don't know exactly what you did. i know zhongli came back to the parlor and sat in the dark for an hour", "the parlor's closed to you. the package moved. don't ask where", "no poem tonight"),
        { fx: { set: { ht_ally: false } } },
      ],
    },
  });

  // ── Lumine, before she goes down (02:35, if she has the notes and the sea is quiet) ──
  scene({
    id: 'fr_lumine_descent', thread: 'lumine', ch: 'sun_night', lock: 'lumine',
    trigger: { on: 'time', at: '+3 02:35' },
    when: (s) => !!F(s).gave_abyss_notes && !F(s).osial_sent,
    nodes: {
      go: [
        { if: (s) => F(s).kolya_found === 'lumine_late', go: 'kolya_late' },
        { if: (s) => F(s).kolya_found === 'lumine', go: 'kolya' },
        { go: 'down' },
      ],
      kolya: [{ m: "your recruit sent me a thank-you card. it's a drawing of a mine cart. he calls me ma'am. eleven times so far" }, { go: 'down' }],
      kolya_late: [{ m: "already went down once tonight. your recruit was on the third level, sitting in a mine cart, eating paimon's sandwich. he's out. he called me ma'am eleven times" }, { go: 'down' }],
      down: [
        ...say("going down at 3. like the map says", "if i'm not back by morning, tell paimon the ladle is under xiangling's sink. she'll know what it means", "…and thank you. whatever's down there"),
        { choice: [
          { t: "Come back up, comrade. You still owe me a point. 14–13 ⚔️", fx: { aff: { lumine: 1 } }, go: 'point' },
          { t: "I'm coming with you.", fx: { set: { lumine_with: true } }, go: 'with' },
          { t: "Don't go.", go: 'dont' },
        ] },
      ],
      point: say("14–14. i'll come back up just to say it to your face"),
      with: say("…ok", "don't be late. don't fall in anything", "the old lift. 23.71 north"),
      dont: say("i've waited three years. i'm going", "…but thanks for saying it"),
    },
  });

  // ── Skirk, 03:00 Sunday night: the sea is waking; coordinates; the Chasm ──
  scene({
    id: 'fr_skirk_sun', thread: 'skirk', ch: 'sun_night',
    trigger: [{ on: 'time', at: '+3 03:00' }, { on: 'chapter', ch: 'sun_night', delay: 1035 }],
    nodes: {
      start: [
        { m: "Ajax.", d: 3 },
        { wait: 4 },
        { if: (s) => !!F(s).osial_sent, go: 'awake' },
        { if: (s) => osialStopped(s), go: 'turned' },
        { m: "The sea under the stone forest is waking. You did this.", d: 3 },
        { go: 'more' },
      ],
      awake: [{ m: "The sea under the stone forest is awake. You did this.", d: 3 }, { go: 'more' }],
      turned: [{ m: "The sea under the stone forest turned over in its sleep. You did this. Then you undid it.", d: 3 }, { go: 'more' }],
      more: [
        { if: (s) => !!F(s).skirk_answered, go: 'again' },
        { if: (s) => F(s).skirk_sat === 'silent', go: 'answer_now' },
        { go: 'road' },
      ],
      again: [
        ...say("You again. Holder of his things.", "It is three."),
        { if: (s) => !!F(s).gave_abyss_notes, go: 'again_traveler' },
        { go: 'come' },
      ],
      again_traveler: [{ m: "You gave the traveler my road. She is on it." }, { go: 'come' }],
      answer_now: [{ m: "You did not answer before. Answer now." }, { go: 'road' }],
      road: [
        { if: (s) => !!F(s).gave_abyss_notes, go: 'traveler' },
        { go: 'ask' },
      ],
      traveler: [{ m: "You gave the traveler my road. She is on it." }, { go: 'ask' }],
      ask: [
        { choice: [
          { t: "Master?", go: 'reply' },
          { t: "Who are you?", go: 'reply' },
          { t: "I'm listening.", go: 'reply' },
          { t: '[Leave on read]', silent: true, go: 'unanswered' },
        ] },
      ],
      reply: [
        { fx: { set: { skirk_answered: true, clue_abyss: true } } },
        { wait: 6 },
        { m: "23.71 north. 112.04 east.", d: 3 },
        { m: "The old lift. Down. Keep going." },
        { go: 'come' },
      ],
      come: [
        { m: '', loc: { place: 'chasm' } },
        { m: "Come before the stars move." },
        { choice: [
          { t: "I'm coming.", label: '“I’m coming.” (Maps → The Chasm)', fx: { set: { skirk_coming: true } }, go: 'hold' },
          { t: "Not tonight.", go: 'not' },
        ] },
      ],
      // she waits (typing…) while you find the way; the night does not end while she is waiting
      hold: [
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' }, { typing: 12 },
        { if: (s) => !!F(s).chasm_went, go: 'gone' },
        { m: "The stars moved." },
      ],
      gone: [],
      not: [{ wait: 8 }, ...say("Then sleep.", "It will still be there. It is always there.")],
      unanswered: [{ wait: 15 }, { typing: 6 }],
    },
  });

  // ── Maps → directions to the Chasm in chapter 6, after answering her: Where the Abyss Looks Back ──
  scene({
    id: 'fr_abyss_go', thread: 'skirk',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { chasm_went: true } } },
        { notify: { app: 'maps', title: 'Maps', body: 'Arrived: The Chasm. GPS signal lost.' } },
        { if: (s) => !s.done.fr_skirk_sun, go: 'early' },
        { m: "Good.", d: 2 },
        { go: 'lights' },
      ],
      early: [{ m: "Early. Good. The dark does not mind.", d: 3 }, { go: 'lights' }],
      lights: [
        { wait: 6 },
        { m: "Leave the lights behind." },
        { wait: 6 },
        { if: (s) => !!F(s).gave_abyss_notes, go: 'traveler' },
        { go: 'stairs' },
      ],
      traveler: [{ m: "The traveler went down before you. Her lantern is far below. Do not call out to her." }, { go: 'stairs' }],
      stairs: [
        { m: "He would have run down these stairs. You are walking. That is wiser." },
        { wait: 7 },
        { m: "Third level. The stairs stop. Keep going." },
        { wait: 7 },
        { m: "Now look up." },
        { wait: 5 },
        { m: "No.", d: 1.5 },
        { m: "Look down." },
        { wait: 5 },
        { m: "The stars are below you here. They always were." },
        { wait: 4 },
        { m: "And something between them is looking back.", d: 4 },
        { wait: 4 },
        { ending: 'abyss' },
      ],
    },
  });
  S.onAct({ id: 'fr_chasm', arc: 'friends', act: 'directions', match: (p, s) => idOf(p) === 'chasm' && s.chapter === 'sun_night' && !!F(s).skirk_answered && !F(s).chasm_went, start: 'fr_abyss_go', delay: 6 });

  // ── memo_zl_sent: Hu Tao knows within minutes and is insufferable about it ──
  scene({
    id: 'fr_ht_memo', thread: 'ht', lock: 'ht',
    trigger: { on: 'flag', flag: 'memo_zl_sent', delay: 50 },
    when: (s) => !!F(s).memo_zl_sent && !(F(s).morax_sold || F(s).zl_broken),
    nodes: {
      go: [
        { m: "WHAT DID YOU SEND HIM", d: 1 },
        ...say(
          "zhongli has played a voice memo FOUR times. in the tea room. with the door shut",
          "he made a sound. i have known that man for years and i have never once heard him make a sound 👻",
          "i'm not saying anything",
          "i'm saying EVERYTHING",
          "the funeral and the fisherman 🦋⚰️🐟",
        ),
        { if: (s) => !!F(s).ht_ally, go: 'pkg' },
        { go: 'ask' },
      ],
      pkg: [{ m: "the package doesn't know yet. should i tell him. i'm going to tell him. i'm not going to tell him 👻" }, { go: 'ask' }],
      ask: [
        { choice: [
          { t: "Hu Tao. Delete this conversation.", go: 'delete' },
          { t: "…Is he okay?", fx: { aff: { zl: 1 } }, go: 'okay' },
          { t: "Mind your coffins 😤", go: 'coffins' },
        ] },
      ],
      delete: say("deleted. (framed.) 🦋"),
      okay: say("he's drinking tea out of the good cup and looking at the sea like it owes him money. so. yes. i think he's more than okay", "i'm telling him you asked. go to sleep, mr. fisherman 👻"),
      coffins: say("my coffins are MINDED. my business is MINDED. your business is now ALSO my business 👻👻"),
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 7 — Monday
  // ════════════════════════════════════════════════════════════════════

  // ── Skirk's last word, if she wrote on Sunday night and you did not go ──
  scene({
    id: 'fr_skirk_mon', thread: 'skirk', ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 60 },
    when: (s) => !!s.fin.fr_skirk_sun && !F(s).chasm_went,
    nodes: {
      start: [
        { if: (s) => !F(s).skirk_answered, go: 'silent' },
        { m: "You did not come.", d: 3 },
        ...say("Good.", "Give him back his things."),
      ],
      silent: [{ m: "You did not answer. That is also an answer.", d: 3 }, { m: "Give him back his things." }],
    },
  });

  // ── Hu Tao, Monday ──
  scene({
    id: 'fr_ht_mon', thread: 'ht', ch: 'mon', lock: 'ht',
    trigger: { on: 'chapter', ch: 'mon', delay: 280 },
    when: (s) => !(F(s).morax_sold || F(s).zl_broken),
    nodes: {
      go: [{ if: (s) => !!F(s).ht_ally, go: 'ally' }, { go: 'plain' }],
      ally: [
        ...say("good morning phone ghost 👻 last day", "the package used the parlor phone this morning. very loud. the coffins are traumatized"),
        { if: (s) => !!F(s).ht_owes_fish, go: 'fish' },
        { go: 'relay' },
      ],
      fish: [{ m: "also he left a fish in the parlor freezer for you. it has a name. i'm not telling you the name. it's rude" }, { go: 'relay' }],
      relay: [
        { if: (s) => F(s).ht_relay === 'lie', go: 'lie' },
        { go: 'poem' },
      ],
      lie: [{ m: "he knows you told him his siblings were fine when they weren't. he says thank you. he says he'd have lied too" }, { go: 'poem' }],
      poem: [
        { m: "poem for the phone ghost: you borrowed a life and you gave it back clean, the nicest impostor wangsheng's ever seen 🦋" },
        { choice: [
          { t: "Best poem you've ever written.", go: 'best' },
          { t: "Tell him: Pier 7, 17:30. Bring nothing. I'll bring his rod.", fx: { set: { ht_pier_msg: true } }, go: 'pier' },
        ] },
      ],
      best: say("i KNOW 👻"),
      pier: say("telling him. he says 'obviously'. he says 'and tell them to bring the rod'. you already said that. he didn't listen. he never listens 🦋"),
      plain: [
        ...say("morning mr. harbinger 👻 the rite is over. the parlor is full of flowers and empty of money. we spent it all on incense", "zhongli is 'taking a few days'. he has never taken a day in his life"),
        { if: (s) => !!F(s).memo_zl_sent, go: 'hum' },
        { go: 'moth' },
      ],
      hum: [{ m: "he hums now. in the tea room. i'm blaming you 🦋" }, { go: 'moth' }],
      moth: [
        { if: (s) => !!F(s).ht_quiz_ok, go: 'cert' },
        { m: "and i'm still thinking about my quiz. hmm. 🦋" },
      ],
      cert: say("also i've officially forgiven you about the moth. there's a certificate. it's framed next to paimon's napkin"),
    },
  });

  // ── Lumine, Monday: the door at the bottom, and the score ──
  scene({
    id: 'fr_lumine_mon', thread: 'lumine', ch: 'mon', lock: 'lumine',
    trigger: { on: 'chapter', ch: 'mon', delay: 400 },
    nodes: {
      go: [{ if: (s) => !!F(s).gave_abyss_notes && !F(s).osial_sent, go: 'came_up' }, { go: 'no_notes' }],
      came_up: [
        ...say(
          "i came back up.",
          "past the third level the stairs keep going. like you said. like she said",
          "there's a door at the bottom. warm. someone had been there recently",
          "small boot prints. his size. a star scratched next to the handle",
          "i'm not ready to talk about it. but i'm closer than i've been in three years",
        ),
        { if: (s) => !!F(s).skirk_answered, go: 'her' },
        { go: 'thanks' },
      ],
      her: [{ m: "the woman who says 3 am. she knew exactly where he'd been. if you ever hear from her again, tell her thank you" }, { go: 'thanks' }],
      thanks: [{ m: "thank you, childe." }, { go: 'score' }],
      no_notes: [
        { if: (s) => !!F(s).osial_sent, go: 'pier' },
        ...say("went down the chasm alone. the stairs stop at three. the star in the rock is still there", "i'll try again next month"),
        { if: (s) => !!F(s).skirk_answered, go: 'coords' },
        { m: "you promised me something, childe. i'm still waiting" },
        { go: 'score' },
      ],
      pier: [...say("held the east pier all night. nobody drowned. paimon handed out snacks to people in blankets", "the chasm will have to wait. again"), { if: (s) => !!F(s).skirk_answered && !F(s).gave_abyss_notes, go: 'coords' }, { go: 'score' }],
      coords: [
        { choice: [
          { t: "23.71 N, 112.04 E. The old lift. Down past the third level. Go at 3.", label: '[Send her Skirk’s coordinates] “23.71 N, 112.04 E. The old lift. Go at 3.”', fx: { set: { gave_abyss_notes: true }, aff: { lumine: 2 } }, go: 'got_coords' },
          { t: "Next month. I'll come with you ⚔️", go: 'score' },
        ] },
      ],
      got_coords: [...say("…where did you get these", "never mind. i don't care. thank you", "tonight, then"), { go: 'score' }],
      score: [
        ...say("also", "it's 14–14"),
        { choice: [
          { t: "14–13. ⚔️", fx: { aff: { lumine: 1 } }, go: 's13' },
          { t: "15–14 after Sunday. You weren't there 😁", go: 's15' },
          { t: "14–14. You earned it.", fx: { sus: { lumine: 2 } }, go: 's14' },
        ] },
      ],
      s13: say("…fine. 14–13. don't tell paimon", "see you at the cliffs, comrade"),
      s15: say("you can't win a point against someone who wasn't there", "…that's actually very you. fine"),
      s14: say("…", "who are you", "childe would rather die than give me a point. he'd rather die in a RIVER", "whoever you are. give him his phone back. and tell him it's 14–14. he'll hate that"),
    },
  });

  // ── Beidou, Monday: the Crux sails north at 18:00 too (no passage if you stood her up) ──
  scene({
    id: 'fr_beidou_mon', thread: 'beidou', ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 520 },
    when: (s) => !F(s).beidou_went,
    nodes: {
      start: [
        { if: (s) => !!F(s).beidou_snubbed, go: 'cold' },
        { if: (s) => !!F(s).beidou_rain_check, go: 'rain' },
        { if: (s) => !!F(s).beidou_declined, go: 'soft' },
        { m: "Kid. Haven't heard from you. The Crux sails north at 18:00 if you need to be somewhere cold in a hurry. ⚓" },
        { go: 'kids' },
      ],
      cold: [...say("Heard you might be sailing north tonight, kid.", "Don't ask the Crux. You know why."), { go: 'kids' }],
      rain: [...say("Next week, kid. I'll be here. And if you're not, I'll come find you in Snezhnaya. ⚓", "The Crux sails north at 18:00 tonight too. There's a berth with your name on it if you need one. Paid in rematches."), { go: 'kids' }],
      soft: [...say("Hope your family's good, kid.", "Next time, don't make me ask twice. ⚓"), { go: 'kids' }],
      kids: [
        { if: (s) => !!F(s).kids_alcor, go: 'drawing' },
      ],
      drawing: say("The small one left a drawing in my cabin. It's me. As a pirate. Licensed. I'm framing it."),
    },
  });

  // ── The crew, Monday ──
  scene({
    id: 'fr_crew_mon', thread: 'crew', ch: 'mon', lock: 'crew',
    trigger: { on: 'chapter', ch: 'mon', delay: 640 },
    nodes: {
      go: [
        ...by('paimon', "IT'S MONDAY!!! Paimon heard you're going to PIER 7 tonight!!! Is there FOOD at Pier 7???"),
        { if: (s) => !!F(s).recipe, go: 'pelmeni' },
        ...by('xl', "I'm packing dumplings for the road!! For whoever's going anywhere!! 🥟🔥"),
        { go: 'rest' },
      ],
      pelmeni: [...by('xl', "I'm packing MAMA'S PELMENI for the road!! For whoever's going anywhere!! 🥟🔥"), { go: 'rest' }],
      rest: [
        ...by('lumine', "paimon. let him breathe"),
        { if: (s) => !!F(s).ht_ally, go: 'ht_ally' },
        ...by('ht', "i'll be at pier 7. i'm always at pier 7. it's a funeral-adjacent location 👻"),
        { go: 'zl' },
      ],
      ht_ally: [...by('ht', "pier 7, 17:30. i'm bringing a coffin. for vibes 👻"), { go: 'zl' }],
      zl: [
        { if: (s) => !!F(s).zl_in_crew, go: 'zl_msg' },
        { go: 'pick' },
      ],
      zl_msg: [...by('zl', "I will also be there. I have been told to bring nothing, and I intend to comply."), { go: 'pick' }],
      pick: [
        { choice: [
          { t: "Hotpot crew forever 🔥", go: 'forever' },
          { t: "Thanks for this weekend. Really.", go: 'thanks' },
          { t: "Paimon. You owe me thirty-two meals.", go: 'debt' },
        ] },
      ],
      forever: [...by('paimon', "HOTPOT CREW FOREVER!!! 🔥🔥🔥"), ...by('ht', "👻🔥"), ...by('xl', "🔥🔥🔥")],
      thanks: [
        { if: (s) => (s.sus.lumine || 0) >= 3, go: 'thanks_knows' },
        ...by('lumine', "don't get sappy, childe"),
        ...by('paimon', "Paimon is a LITTLE sappy!!! 😭"),
      ],
      thanks_knows: [...by('lumine', "you're welcome. whoever you are"), ...by('paimon', "Lumine??? What does THAT mean???")],
      debt: [...by('paimon', "PAIMON IS HONEST!!! Paimon will pay you back on the TWELFTH of NEVER!!! 📒"), ...by('lumine', "that's not a date"), ...by('paimon', "IT IS IN PAIMON'S CALENDAR!!!")],
    },
  });
})();
