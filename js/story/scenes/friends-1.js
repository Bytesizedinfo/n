/* Live scenes — Friends, part 1 (S3): chapters 1–3 and the reactions that can happen any time.
   Lumine & Paimon, the hotpot crew, Hu Tao, Xiangling (and Mama's recipe), Xiao, Yun Jin, Beidou's challenge, Skirk.
   Facts: docs/STORY.md "Friends" + "Cross-arc links". Format: docs/DEV.md "Story engine".
   friends-2.js (chapters 4–7, the Alcor and the Chasm) reuses the helpers exported here as JC.storyFriends. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;
  const F = (s) => s.flags || {};
  const N = (s, k) => Number((s.flags || {})[k]) || 0;
  const T = (str) => JC.time.parse(str);
  const idOf = (p) => (p && (p.id || p.art || p.place)) || '';
  const say = (...lines) => lines.map((m) => ({ m }));
  const by = (from, ...lines) => lines.map((m) => ({ m, from }));
  const H = () => JC.storyHelpers || {};

  /* Thread locks: only one choice scene runs per thread. A scene with `lock: 'paimon'` waits for busy_paimon,
     takes it (the flag holds the scene id), and frees it when it ends or when its chapter expires it.
     Its conversation starts at node `go`. `onExpire` steps run (instantly) only if the chapter ends mid-conversation. */
  const release = (key, id) => ({ run: (api) => { if (api.state.flags[key] === id) api.story.applyFx({ set: { [key]: false } }); } });
  function scene(def) {
    def.arc = def.arc || 'friends';
    if (def.lock) {
      const key = 'busy_' + def.lock;
      const id = def.id;
      const body = def.nodes;
      const nodes = {
        start: [{ if: (s) => !F(s)[key], go: '_take' }, { wait: 5 }, { go: 'start' }],
        _take: [{ fx: { set: { [key]: id } } }, { go: 'go' }],
        _expire: [{ if: (s) => F(s)[key] === id, go: '_expire_own' }],
        _expire_own: (def.onExpire || []).concat([release(key, id)]),
      };
      Object.keys(body).forEach((n) => { nodes[n] = body[n].concat([release(key, id)]); });
      def.nodes = nodes;
      def.expire = '_expire';
    } else if (def.onExpire) {
      def.nodes._expire = def.onExpire;
      def.expire = '_expire';
    }
    delete def.lock;
    delete def.onExpire;
    return S.scene(def);
  }

  // Paimon's appetite (Wanmin Go orders "to: paimon"). JC.world.acts keeps the official paimon_fed / paimon_total;
  // S3 keeps its own count too so the reactions never depend on which rule runs first.
  const isPaimon = (p) => !!p && (p.to === 'paimon' || p.for === 'paimon');
  const fed = (s) => Math.max(N(s, 'paimon_fed'), N(s, 'fr_paimon_n'));
  const total = (s) => Math.max(N(s, 'paimon_total'), N(s, 'fr_paimon_sum'));
  /** where the kids are sleeping (S1b's lodging flags, or a friend's rescue) */
  const lodging = (s) => (F(s).kids_zl ? 'zl' : F(s).kids_wangshu ? 'wangshu' : F(s).kids_alcor ? 'alcor' : F(s).kids_apartment ? 'apartment' : F(s).kids_grand ? 'grand' : null);
  const kidsSafe = (s) => (H().kidsSafe ? !!H().kidsSafe(s) : !F(s).fatui_pickup || !!F(s).kids_rescued);
  /** move the kids: exactly one lodging flag on (same convention as S1b's family scenes) */
  const LODGING = ['kids_grand', 'kids_apartment', 'kids_wangshu', 'kids_alcor', 'kids_zl'];
  const stay = (k, extra) => { const set = {}; LODGING.forEach((x) => { set[x] = x === k; }); return Object.assign(set, extra || {}); };

  JC.storyFriends = { F, N, T, idOf, say, by, scene, release, isPaimon, fed, total, lodging, kidsSafe, stay };

  // Mama's recipe, as she records it (forwarded to Xiangling word for word)
  const MAMA_VN = "My sun! A chef wants my pelmeni? A real chef? …Good. Recipes should travel, they get lonely in one kitchen. Pork and beef, half and half. A little ice water in the filling — this is the secret, tell her this is the secret. Pinch the edges twice. Twice! Your father pinches once and for thirty years they open in the pot. Boil until they float, then count to sixty. Not fifty. Sixty. The little ones landed, Tonia sent me a photo, I can breathe again. I made pelmeni at four in the morning because I couldn't sleep. Of course I did. Eat something, my sun.";

  // ════════════════════════════════════════════════════════════════════
  // Setup: Zhongli "left the group" in July. His messages stay in the history; he is not a live member.
  scene({
    id: 'fr_crew_setup', thread: 'crew',
    trigger: { on: 'unlock', delay: 0 },
    nodes: { start: [{ removeMember: 'zl' }] },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 1 — Friday night
  // ════════════════════════════════════════════════════════════════════

  // ── Paimon: hotpot tomorrow, food now (slot 200) ──
  scene({
    id: 'fr_paimon_hotpot', thread: 'paimon', ch: 'fri_night', lock: 'paimon',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 200 },
    nodes: {
      go: [
        { m: "CHILDE!!!", d: 0.8 },
        ...say(
          "Paimon can SEE that you're online!!! 👀",
          "Paimon has TWO (2) questions!!!",
          "1. Is it TRUE you're paying for hotpot tomorrow??? Xiangling said you said!!! 🔥",
          "2. Paimon is hungry RIGHT NOW. Not tomorrow. NOW!!! 🍡",
        ),
        { choice: [
          { t: "Heh. Hotpot's on me, Emergency Food. Like always 😁", fx: { set: { hotpot_tab: true }, aff: { paimon: 1 } }, go: 'yes' },
          { t: "Who told you I was paying?", go: 'who' },
          { t: "I'm not paying for anything.", fx: { sus: { paimon: 2 } }, go: 'no' },
          { t: "It's past midnight, Paimon. Go to sleep.", fx: { sus: { paimon: 1 } }, go: 'sleep' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      yes: [
        { m: "!!!!!!!!!!", d: 0.6 },
        ...say("Paimon KNEW it!!! Lumine said 'don't get your hopes up' and Paimon said 'Paimon's hopes are ALWAYS up'!!! 🍲", "Okay okay okay. Question 2."),
        { go: 'now' },
      ],
      who: [
        ...say("XIANGLING!!! (Xiangling said Hu Tao said. Hu Tao said a ghost told her.)", "But Paimon is choosing to BELIEVE!!! 🔥"),
        { choice: [
          { t: "The ghost is right. On me 😁", fx: { set: { hotpot_tab: true }, aff: { paimon: 1 } }, go: 'yes' },
          { t: "The ghost lied.", go: 'ghost' },
        ] },
      ],
      ghost: [
        ...say("NOOOOO 😭", "Paimon is going to cry into Lumine's sleeve!!! Lumine's sleeve is STILL wet from last time!!!", "…You're joking. You're JOKING, right??? You ALWAYS pay!!!"),
        { choice: [
          { t: "Heh. Obviously I'm paying 😁", fx: { set: { hotpot_tab: true } }, go: 'yes' },
          { t: "Not this time.", fx: { sus: { paimon: 1 } }, go: 'hard' },
        ] },
      ],
      no: [
        { typing: 4 }, { wait: 1 },
        ...say("…", "WHAT", "Childe. You ALWAYS pay. You paid when Paimon ate 38 dumplings!!! You paid when the BROTH caught FIRE!!!", "Are you SICK??? Is it a FEVER??? 🤒"),
        { choice: [
          { t: "Heh. Got you. Of course I'm paying 😁", fx: { set: { hotpot_tab: true } }, go: 'got' },
          { t: "Times are hard.", fx: { sus: { paimon: 1 } }, go: 'hard' },
        ] },
      ],
      got: [{ m: "DON'T SCARE PAIMON LIKE THAT!!! Paimon's heart is SMALL!!! (Paimon's stomach is BIG.)" }, { go: 'now' }],
      hard: [
        ...say("Times are hard??? For a HARBINGER??? You have a BLACK CARD!!! Paimon has SEEN it!!! It's SHINY!!!", "Paimon is telling Lumine. Lumine will know what to do. (Lumine will say 'hm'.)", "…Paimon is still hungry, by the way."),
        { go: 'now' },
      ],
      sleep: [
        ...say("SLEEP??? Paimon doesn't SLEEP when Paimon is HUNGRY!!!", "And YOU never sleep!!! You text Lumine about SWORDS at 3AM!!! 👀", "Paimon is telling Lumine you said 'go to sleep'. She'll think you have a fever."),
        { go: 'now' },
      ],
      now: [
        ...say(
          "Paimon is STARVING. Lumine had a guild job and Paimon only had ONE dinner. (Two dinners.)",
          "Wanmin Go is still open!!! Xiangling's night menu!!! The HOTPOT SET FOR FOUR is ℳ688!!! Paimon will share!!! (Paimon will not share.) 🍲",
          "Pleeeeease 🥺🥺🥺",
        ),
        { choice: [
          { t: "Fine. Ordering. You owe me, Emergency Food 😤", fx: { set: { paimon_promised: true } }, go: 'promised' },
          { t: "You already owe me 31 meals.", go: 'debt' },
          { t: "No. Sleep.", go: 'nofood' },
          { t: "Where do I even send it?", fx: { sus: { paimon: 2 } }, go: 'addr' },
        ] },
      ],
      promised: [
        ...say("YAAAAY!!! 🥳🍲", "Paimon is already in your Wanmin Go!!! Under 'Emergency Food'!!! (Xiangling did it. Paimon supervised.)", "Paimon will wait at the window!!! Like a PUPPY!!! (Paimon is NOT a puppy.)"),
        { start: 'fr_paimon_nag', delay: 240 },
      ],
      debt: [
        ...say("THIRTY-TWO now!!! Paimon is keeping count too!!! Paimon is very HONEST!!! 📒", "Paimon will pay you back when Paimon is rich!!! Paimon will be rich SOON!!! (Lumine says 'no'.)", "So… is that a yes??? 🥺"),
        { choice: [
          { t: "Fine. Thirty-two. Ordering 😤", fx: { set: { paimon_promised: true }, aff: { paimon: 1 } }, go: 'promised' },
          { t: "Thirty-two. And no.", go: 'nofood' },
        ] },
      ],
      nofood: [
        ...say("😭", "Paimon will REMEMBER this!!! Paimon will remember it all the way until TOMORROW, when you pay for HOTPOT!!! 🔥"),
        { if: (s) => !F(s).hotpot_tab, go: 'nofood2' },
      ],
      nofood2: [
        { m: "…you ARE paying tomorrow. Right??? Paimon is going to assume YES. That's how assuming works!!!" },
        { fx: { set: { hotpot_tab: true } } },
      ],
      addr: [
        ...say("??? You've sent food here like FIFTY times!!!", "Lumine's place!!! Above the Adventurers' Guild!!! The window with the TOWEL!!! Paimon is IN your Wanmin Go!!! Under 'Emergency Food'!!!", "Did you hit your head on a fish??? 🐟💫", "…Paimon is taking that as a YES!!! 🍲"),
        { fx: { set: { paimon_promised: true } } },
        { start: 'fr_paimon_nag', delay: 240 },
      ],
      read: [
        { wait: 8 },
        ...say("…Childe???", "Paimon can SEE that you READ it!!! 👀", "Fine!!! Paimon will assume YES on hotpot!!! That's how silence works!!! 🔥"),
        { fx: { set: { hotpot_tab: true } } },
      ],
    },
  });

  // ── Paimon, forty minutes later, if nothing arrived ──
  scene({
    id: 'fr_paimon_nag', thread: 'paimon', lock: 'paimon',
    trigger: { on: 'manual' },
    nodes: {
      go: [
        { if: (s) => fed(s) > 0, go: 'fed' },
        ...say("Childe.", "It's been FORTY MINUTES.", "Paimon checked the app. There is NO ORDER. There is NOTHING.", "Paimon is at the window. In the COLD. Like a sad little LANTERN. 🏮"),
        { choice: [
          { t: "Ordering NOW. Hold on, Emergency Food 😤", go: 'nowx' },
          { t: "Heh. Gotcha. Go to sleep 😁", fx: { aff: { paimon: -1 } }, go: 'tease' },
          { t: "Sorry, I got distracted.", fx: { sus: { paimon: 1 } }, go: 'sorry' },
        ] },
      ],
      fed: [],
      nowx: say("Paimon is counting!!! ONE… TWO…", "(Paimon can count very high. Paimon has time.)"),
      tease: say("THAT'S NOT FUNNY!!!", "…It's a LITTLE funny. Paimon is still telling Lumine."),
      sorry: say("'Sorry'??? Since when do you say SORRY???", "You didn't even say sorry when you broke the LAMPPOST!!! 👀", "Paimon is putting this in the Weird Childe Log. 📒"),
    },
  });

  // ── Xiangling: the broth, and the pelmeni question (after Paimon, or slot 640) ──
  scene({
    id: 'fr_xl_fri', thread: 'xl', ch: 'fri_night', lock: 'xl',
    trigger: [{ on: 'scene', scene: 'fr_paimon_hotpot', delay: 120 }, { on: 'chapter', ch: 'fri_night', delay: 640 }],
    nodes: {
      go: [
        { m: "Childe!! You're up!! Of course you're up 🔥" },
        { if: (s) => fed(s) > 0, go: 'order' },
        { go: 'broth' },
      ],
      order: [{ m: "Paimon's order just came through on your account 😆 I put extra chili in. You never have to ask 🌶️" }, { go: 'broth' }],
      broth: [
        ...say(
          "The broth for tomorrow is at hour 4. Guoba fell asleep guarding it. I'm letting him have this",
          "Also!! Totally unrelated!! Did you ask your mama about the pelmeni yet?? 🥟",
          "Attempt #7 is ready to go. I just need the secret. The one thing. The FAMILY LAW thing",
        ),
        { choice: [
          { t: "Asking her right now 😁 She gets up early, she'll answer", fx: { set: { recipe_asked: true } }, go: 'ask' },
          { t: "That recipe is a state secret, chef 😁", go: 'secret' },
          { t: "What pelmeni?", fx: { sus: { xl: 2 } }, go: 'what' },
        ] },
      ],
      ask: [
        { me: "Mama!! Xiangling, the chef from Wanmin, wants your pelmeni recipe. Can I give it to her? She'll treat it like treasure ❤️🐟", th: 'mama' },
        ...say("!!!!!! You're the BEST 🔥🔥", "I'm going to make Snezhnayan dumplings so good your mama cries. Good crying!!", "Goodnight Childe!! Don't fall in the harbor!! 🌶️"),
      ],
      secret: say("Then I'll STEAL it!! I'm a chef, I have ways 🌶️", "…I don't have ways. I have Guoba. Guoba is not a spy. Guoba is a red panda", "Goodnight Childe!! I'll get it out of you at hotpot 🔥"),
      what: say("…Your MAMA'S pelmeni?? You talked about them for an hour at hotpot?? You got a little teary???", "Childe, are you okay?? Did you eat?? I'll send soup!! 🍲", "Okay. I'll ask again when you're less weird. Goodnight!!"),
    },
  });

  // ── Hu Tao's slip: "is it normal for a client to drip on the coffins" (slot 880) ──
  scene({
    id: 'fr_ht_slip', thread: 'ht', ch: 'fri_night', lock: 'ht',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 880 },
    nodes: {
      go: [
        { m: "zhongli is it normal for a client to drip on the coffins", d: 1.6 },
        ...say("like. a LOT. there's a puddle", "he says it's 'only seawater' like that makes it better 👻"),
        { typing: 3 },
        { unsend: true },
        ...say("WRONG CHAT", "ignore that!!! that was for my consultant!!! about a client!!! a normal, dead, completely dry client!!! 👻"),
        { wait: 3 },
        ...say("…wait", "mr. harbinger. where are you right now", "it's for a poem"),
        { choice: [
          { t: "Pier 7. Night fishing. Where else? 🎣", fx: { sus: { ht: 1 } }, go: 'pier' },
          { t: "Home. In bed. Why is your client wet?", fx: { sus: { ht: 2 } }, go: 'home' },
          { t: "Who's dripping on your coffins, director? 😏", go: 'tease' },
          { t: "Is the client in Coffin 4, by any chance? 🐟", if: (s) => !!F(s).knows_hideout, fx: { sus: { ht: 2 } }, go: 'coffin4' },
          { t: "…Where do you think I am?", fx: { sus: { ht: 1 } }, go: 'think' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      pier: [
        ...say("fishing. at 1am. in october.", "and you're DRY? 👻", "…", "ok that's a weird question. ignore it. i ask weird questions. it's my brand", "poem: a fisherman fishing, a pier in the night, somebody's lying and it isn't me, right? 🦋"),
        { choice: [
          { t: "Rude. My poems are better 😁", go: 'poems' },
          { t: "Always dry. Hydro Vision, director 💧", go: 'hydro' },
          { t: "Are you okay? You seem stressed.", fx: { sus: { ht: 2 } }, go: 'stressed' },
        ] },
      ],
      poems: say("your poems are about FISH", "every single one. 'ode to a carp'. 'the bass that got away'. 'scaramouche (tuna)'", "goodnight mr. harbinger. stay dry 👻"),
      hydro: say("a hydro vision doesn't make you DRY it makes you WETTER", "that's not how— you know what. goodnight 👻"),
      stressed: say("are you OKAY?? 👻", "mr. harbinger has never once asked if i'm okay. you once asked if i was 'alive or a very convincing ghost'. that's your version of okay", "hmm. hmmm. 🦋"),
      home: [
        ...say("home. in bed.", "mr. harbinger you have NEVER been in bed before 4am in your life. you text lumine about swords at 3. you text ME about coffins at 2", "who sleeps at 1am. ghosts don't even sleep at 1am 👻"),
        { choice: [
          { t: "Fine. I lied. I'm at the pier 😁", fx: { sus: { ht: 1 } }, go: 'lied' },
          { t: "Long dinner. Xiansheng ordered everything on the menu.", go: 'dinner' },
          { t: "Goodnight, Hu Tao.", fx: { sus: { ht: 1 } }, go: 'night' },
        ] },
      ],
      lied: say("lying about lying. very harbinger of you 🦋", "stay dry 👻"),
      dinner: say("he does that. he ate my lunch on tuesday. i watched him do it. he didn't even blink", "go to sleep mr. harbinger. or don't. you won't 👻"),
      night: say("goodnight?? since when do you say goodnight", "sleep tight. don't let the coffin bugs bite. (there are no coffin bugs. there's just one big one. very wet.) 👻"),
      tease: [
        ...say("NOBODY!!! nobody is dripping!!! there's no client!!! there's no coffin 4!!! we skip 4!!! it's unlucky!!! 👻👻", "…", "i said too much. that's my OTHER brand"),
        { fx: { set: { knows_hideout: true } } },
        { m: "anyway. how was dinner with my consultant. did he pay. lol. lmao 🦋" },
        { choice: [
          { t: "Does he ever? 41 dinners and counting 😁", go: 'tomb' },
          { t: "He paid this time, actually.", fx: { sus: { ht: 2 } }, go: 'paid' },
        ] },
      ],
      tomb: say("41!!! i'm putting that on his tombstone. 'he never paid. he was loved anyway.' 👻"),
      paid: say("LIAR. that man hasn't carried mora since the 1900s 👻", "…that's a figure of speech", "goodnight mr. 'he paid this time'. hmmm 🦋"),
      coffin4: [
        ...say("WHAT", "WHAT IS COFFIN 4", "THERE IS NO COFFIN 4"),
        { typing: 4 },
        ...say("who told you about coffin 4. only three people know about coffin 4. four with the cat", "…ok. hypothetically. if someone WERE in coffin 4", "he'd be fine. he'd be eating my noodles. he'd be complaining about the pillow", "hypothetically 👻"),
      ],
      think: say("where do I THINK you are 👻", "i think you're somewhere with your phone. which is more than i can say for some people", "…that was cryptic. i'm practicing for the rite of parting. very cryptic event 🦋"),
      read: [
        { wait: 8 },
        ...say("left on read by a harbinger. classic", "poem: the phone went quiet, the screen stayed lit, somebody's reading and not saying sh—", "…shoes. not saying shoes. it's a family parlor 👻"),
      ],
    },
  });

  // ── Skirk, late on Friday night (only while chapter 1 is still running). A reply gets the coordinates. ──
  //    (STORY.md asks for 02:55; chapter 1 settles from 02:00 and its clock stops at 02:40, so 01:56 is the late slot.)
  scene({
    id: 'fr_skirk_sat', thread: 'skirk', ch: 'fri_night',
    trigger: [{ on: 'time', at: '+1 02:55' }, { on: 'time', at: '+1 01:56' }],
    nodes: {
      start: [
        { m: "Ajax.", d: 3 },
        { wait: 5 },
        { m: "The sea under the stone forest is waking. You did this.", d: 3 },
        { choice: [
          { t: "Master?", go: 'master' },
          { t: "Who is this?", go: 'who' },
          { t: "He's not here.", go: 'nothere' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      master: [{ wait: 6 }, { m: "Not you.", d: 2 }, { wait: 3 }, { m: "He is wet, and alive, and angry." }, { go: 'road' }],
      who: [{ wait: 8 }, { m: "Someone who knows whose hand is on that glass.", d: 3 }, { m: "He is wet, and alive, and angry." }, { go: 'road' }],
      nothere: [{ wait: 5 }, { m: "I know.", d: 2 }, { m: "He never sleeps. Now neither will you." }, { go: 'road' }],
      road: [
        { fx: { set: { skirk_sat: 'spoke', skirk_answered: true, clue_abyss: true } } },
        { wait: 5 },
        { m: "If he will not come, someone must.", d: 3 },
        { m: "23.71 north. 112.04 east. The old lift. Down." },
        { m: '', loc: { place: 'chasm' } },
        { m: "Not tonight. Sunday. At three." },
        { m: "Keep his things dry." },
      ],
      read: [{ wait: 12 }, { typing: 5 }, { fx: { set: { skirk_sat: 'silent' } } }],
    },
  });
  // too early for the Chasm: she says so, once
  scene({
    id: 'fr_skirk_early', thread: 'skirk', trigger: { on: 'manual' },
    nodes: { start: [{ m: "Not yet.", d: 3 }, { m: "Sunday. Three." }] },
  });
  S.onAct({ id: 'fr_chasm_early', arc: 'friends', act: 'directions', match: (p, s) => idOf(p) === 'chasm' && s.chapter !== 'sun_night' && !!F(s).skirk_answered, start: 'fr_skirk_early', delay: 10 });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 2 — Saturday morning
  // ════════════════════════════════════════════════════════════════════

  // ── Xiao: one line (slot 120) ──
  scene({
    id: 'fr_xiao', thread: 'xiao', ch: 'sat_dawn',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 120 },
    nodes: {
      start: [
        { m: "Stay away from Zhongli-xiansheng.", d: 2.5 },
        { choice: [
          { t: "Make me 😁⚔️", fx: { set: { xiao_replied: 'bold' } }, go: 'bold' },
          { t: "The stalker from July!! Name a time and a place 😁", fx: { set: { xiao_replied: 'bold' } }, go: 'bold' },
          { t: "Okay. Sorry.", fx: { set: { xiao_replied: 'meek' }, sus: { xiao: 1 } }, go: 'meek' },
          { t: "Is he in danger?", fx: { set: { xiao_replied: 'worried' }, sus: { xiao: 1 } }, go: 'worried' },
          { t: '[Leave on read]', silent: true, go: 'none' },
        ] },
      ],
      // He never writes a second line. He types, and thinks better of it.
      bold: [{ wait: 4 }, { typing: 3 }],
      meek: [{ wait: 6 }, { typing: 2 }],
      worried: [{ wait: 10 }, { typing: 6 }],
      none: [],
    },
  });

  // ── Lumine at arrivals (if she did the pickup; S1b's fam_pickup sets lumine_pickup) ──
  scene({
    id: 'fr_lumine_airport', thread: 'lumine', ch: 'sat_dawn', lock: 'lumine',
    trigger: { on: 'time', at: '+1 07:52' },
    when: (s) => !!F(s).lumine_pickup,
    nodes: {
      go: [
        ...say("they're here.", "teucer recognized paimon from your ripple. he screamed. she screamed. it was a lot", "tonia shook my hand and asked what i do for 'northland toys'. i said quality control. she wrote it down", "she's writing a lot of things down, childe"),
        { if: (s) => lodging(s) === 'grand' || lodging(s) === 'apartment', go: 'unsafe' },
        { if: (s) => !lodging(s), go: 'where' },
        { if: (s) => lodging(s) === 'zl', go: 'to_zl' },
        { if: (s) => lodging(s) === 'alcor', go: 'to_alcor' },
        { m: "taking them up to wangshu inn now. paimon is negotiating snacks with the driver" },
        { go: 'thanks' },
      ],
      to_zl: [{ m: "zhongli met us at the curb. he bowed to teucer. teucer bowed back. they're friends now. i don't understand it either" }, { go: 'thanks' }],
      to_alcor: [{ m: "dropping them at crux pier. beidou's crew lined up like a welcome party. kazuha brought a kite" }, { go: 'thanks' }],
      unsafe: [
        { if: (s) => lodging(s) === 'grand', go: 'grand' },
        { m: "your building has a car outside. two men. they've been 'parking' for an hour" },
        { go: 'move' },
      ],
      grand: [{ m: "the grand hotel. two men in grey coats in the lobby pretending to read the same newspaper" }, { go: 'move' }],
      move: [
        { m: "want me to take them somewhere else? somewhere nobody knows them" },
        { choice: [
          { t: "Wangshu Inn. Up the river. Nobody asks questions there.", fx: { set: stay('kids_wangshu'), aff: { lumine: 1 } }, go: 'moved' },
          { t: "They're fine where they are.", go: 'stay' },
        ] },
      ],
      moved: [{ m: "on it. tonia already had her bag on her shoulder. she's quick" }, { go: 'thanks' }],
      stay: [{ m: "ok. i don't like it. but ok" }, { go: 'thanks' }],
      where: [
        { m: "where am i taking them, childe" },
        { choice: [
          { t: "Wangshu Inn. Up the river. Safe and boring.", fx: { set: stay('kids_wangshu') }, go: 'moved' },
          { t: "My place. Pier View, 2207. Paimon knows the code 😁", fx: { set: stay('kids_apartment') }, go: 'flat' },
        ] },
      ],
      flat: [{ m: "paimon does NOT know the code. paimon is guessing. paimon guessed 1111. it worked. change that" }, { go: 'thanks' }],
      thanks: [
        { choice: [
          { t: "Thanks, comrade. I owe you one ⚔️", fx: { aff: { lumine: 1 } }, go: 'owe' },
          { t: "Tell Teucer I'm in a meeting with the toy board 😁", fx: { set: { lumine_toyboard: true } }, go: 'board' },
          { t: "Is Tonia suspicious?", go: 'tonia' },
        ] },
      ],
      owe: say("you owe me several. i'm counting. like paimon"),
      board: say("i'm not lying to an eight-year-old for you", "…i told him the toy board is very strict and very wooden. he asked if the board is made of wood. i said yes. he's satisfied"),
      tonia: say("tonia is suspicious of everything. she asked why your 'toy company' needs bodyguards", "nobody mentioned bodyguards. she was testing me", "i like her"),
    },
  });

  // ── Lumine: the Abyss Order, the map, the debt (slot 500) ──
  function mapNodes() {
    return {
      map: [
        { typing: 6 }, { wait: 3 }, { typing: 3 },
        ...say("you drew this", "'she said 3 am'. who's she"),
        { choice: [
          { t: "My master. Long story. Very cold story.", go: 'master' },
          { t: "Someone I owe everything to. Don't ask, comrade.", go: 'master' },
          { t: "No idea. Found it like that.", fx: { sus: { lumine: 1 } }, go: 'master_lie' },
        ] },
      ],
      master: [{ m: "ok." }, { go: 'coords' }],
      master_lie: [...say("it's your handwriting, childe. you cross your sevens. snezhnayan sevens", "fine. keep your secrets"), { go: 'coords' }],
      coords: [
        ...say("23.71 north. that's the chasm. the old lift shaft", "'down. keep going.'", "i went down to the third level. i thought the stairs stopped there", "they don't, do they"),
        { wait: 2 },
        { m: "thank you, childe. really" },
        { go: 'owe' },
      ],
    };
  }
  function oweNodes() {
    return {
      owe: [
        ...say("so. i owe you one. a real one", "anything you need this weekend. i mean it"),
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'owe_kids' },
        { choice: [
          { t: "Then you owe me the 14th point. 14–13 😁", fx: { aff: { lumine: 1 } }, go: 'point' },
          { t: "Keep an eye on my siblings this weekend?", fx: { set: { lumine_eye: true } }, go: 'eye' },
          { t: "You don't owe me anything, comrade.", go: 'nothing_owed' },
        ] },
      ],
      owe_kids: [
        { choice: [
          { t: "Then help me. My siblings are at the Grand with Pulcinella's people. Get them out.", go: 'rescue' },
          { t: "Then you owe me the 14th point 😁", fx: { aff: { lumine: 1 } }, go: 'point' },
        ] },
      ],
      point: say("it's 14–14", "nice try"),
      eye: say("already planning to. sunday especially. the funeral crowds are going to be insane", "paimon will bring snacks. paimon will eat the snacks"),
      nothing_owed: say("i do. i'll pay it", "lumine pays her debts. unlike some people. paimon"),
      rescue: [
        ...say("…", "the grand. ok", "abyss later. kids first", "paimon. shoes"),
        { start: 'fr_lumine_rescue', delay: 70 },
      ],
    };
  }
  scene({
    id: 'fr_lumine_abyss', thread: 'lumine', ch: 'sat_dawn', lock: 'lumine',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 500 },
    onExpire: [{ m: "ok. later then. you promised, childe" }, { fx: { set: { lumine_waiting: true } } }],
    nodes: Object.assign({
      go: [
        { if: (s) => !!F(s).lumine_pickup, go: 'open_kids' },
        { m: "morning." },
        { go: 'ask' },
      ],
      open_kids: [{ m: "kids are settled. teucer has adopted paimon. paimon has adopted his snacks" }, { go: 'ask' }],
      ask: [
        ...say("you said 'tomorrow'. it's tomorrow.", "the abyss order. aether. you said you drew me a map"),
        { if: (s) => (s.sus.paimon || 0) >= 2 || (s.sus.lumine || 0) >= 2, go: 'gossip' },
        { go: 'ask2' },
      ],
      gossip: [...say("also paimon says you were weird last night. weirder than usual. she wrote it down in a notebook", "we'll talk about that"), { go: 'ask2' }],
      ask2: [
        { m: "i'm not asking for a favor. you promised" },
        { choice: [
          { t: "Here, comrade. Don't ask about the handwriting 😁", label: '[Send the map] “Here, comrade. Don’t ask about the handwriting 😁”', if: (s) => !!F(s).clue_abyss, send: [{ img: 'p_abyss_map' }], fx: { set: { gave_abyss_notes: true, lumine_map_sent: true }, aff: { lumine: 2 } }, go: 'map' },
          { t: "The Chasm. Past the third level, where the stairs stop. They go down at 3 AM. That's what I've got ⚔️", fx: { set: { gave_abyss_notes: true }, aff: { lumine: 1 } }, go: 'notes' },
          { t: "Forget the Abyss for a second. My siblings are at the Grand with Pulcinella's people. I need help.", if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'rescue' },
          { t: "Give me an hour. I'm finding it.", fx: { set: { lumine_waiting: true } }, go: 'stall' },
          { t: "What map?", fx: { sus: { lumine: 2 } }, go: 'whatmap' },
          { t: "I don't know anything about the Abyss.", fx: { sus: { lumine: 3 } }, go: 'nothing' },
        ] },
      ],
      notes: [
        ...say("the chasm. past the third level", "…that matches the star in the rock", "you said there was a map. if you find it, send it. please", "and thank you. that's more than anyone's given me in three years"),
        { fx: { set: { lumine_waiting: true } } },
        { go: 'owe' },
      ],
      stall: say("an hour", "i'm timing you"),
      whatmap: [
        ...say("'what map'", "childe. last night. 'i drew you a map. it's in my photos somewhere'", "did you hit your head", "…find it. please"),
        { fx: { set: { lumine_waiting: true } } },
      ],
      nothing: [
        ...say("you told me you'd been down there. at fourteen. at three in the morning, in june", "you don't get to take that back", "whatever's going on with you, i'll wait. but i'm not stupid"),
        { fx: { set: { lumine_waiting: true } } },
      ],
    }, mapNodes(), oweNodes()),
  });

  // ── Lumine gets the kids out of the Grand (after a Fatui pickup) ──
  scene({
    id: 'fr_lumine_rescue', thread: 'lumine',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        ...say(
          "got them.",
          "two men in grey coats at the grand's side door. paimon asked them where the buffet was. it worked for nine seconds",
          "nine seconds was enough",
          "tonia had already packed. she knew something was off before i got there",
          "teucer thinks it was a game called 'escape the hotel'. he wants to play again. let him think that",
          "taking them to wangshu inn. up the river. nobody there knows anybody",
        ),
        { fx: { set: stay('kids_wangshu', { kids_rescued: true, rescue_by: 'lumine' }), aff: { lumine: 1 } } },
      ],
    },
  });

  // ── The map, later: found in Photos (photo_view p_abyss_map) or sent from the share sheet ──
  scene({
    id: 'fr_lumine_map', thread: 'lumine', lock: 'lumine',
    trigger: { on: 'manual' },
    nodes: Object.assign({
      go: [
        { if: (s) => !!F(s).lumine_map_sent, go: 'done' },
        ...say("well?", "did you find the map"),
        { choice: [
          { t: "Found it. Here, comrade ⚔️", label: '[Send the map] “Found it. Here, comrade ⚔️”', send: [{ img: 'p_abyss_map' }], fx: { set: { gave_abyss_notes: true, lumine_map_sent: true, lumine_waiting: false }, aff: { lumine: 2 } }, go: 'map' },
          { t: "Not yet.", go: 'notyet' },
        ] },
      ],
      done: [],
      notyet: say("ok", "i'm still timing you"),
    }, mapNodes(), oweNodes()),
  });
  scene({
    id: 'fr_lumine_map_got', thread: 'lumine', lock: 'lumine',
    trigger: { on: 'manual' },
    nodes: Object.assign({
      go: [
        { fx: { sus: { lumine: -1 } } }, // a photo sent out of the blue is still in character when it's this one
        ...say("wait", "this is the map"),
        { go: 'map' },
      ],
    }, mapNodes(), oweNodes()),
  });
  S.onAct({
    id: 'fr_map_seen', arc: 'friends', act: 'photo_view',
    match: (p, s) => idOf(p) === 'p_abyss_map' && !F(s).lumine_map_sent && !!(F(s).lumine_waiting || F(s).gave_abyss_notes),
    start: 'fr_lumine_map', delay: 25,
  });
  S.onAct({
    id: 'fr_map_to_lumine', arc: 'friends', act: 'send',
    match: (p, s) => p.thread === 'lumine' && p.art === 'p_abyss_map' && !F(s).lumine_map_sent,
    fx: { set: { gave_abyss_notes: true, lumine_map_sent: true, clue_abyss: true, lumine_waiting: false }, aff: { lumine: 2 } },
    start: 'fr_lumine_map_got', delay: 5,
  });

  // ── Mama sends the recipe (asked on Friday night). Mama's thread, no choices: S1b owns her conversations. ──
  scene({
    id: 'fr_mama_recipe', thread: 'mama', ch: 'sat_dawn',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 450 },
    when: (s) => !!F(s).recipe_asked && !F(s).recipe,
    nodes: {
      start: [
        { m: '', voice: { dur: 52, text: MAMA_VN } },
        { m: '', img: 'p_mama_pelmeni' },
        { m: "Send her this. And tell her: if she makes them better than me, I don't want to know ❤️" },
      ],
    },
  });

  // ── …and Xiangling waits for it ──
  scene({
    id: 'fr_xl_recipe', thread: 'xl', lock: 'xl',
    trigger: { on: 'scene', scene: 'fr_mama_recipe', delay: 45 },
    nodes: {
      go: [
        ...say("Childe!! Good morning!! Did your mama say anything?? 👀🥟", "I've been staring at my phone like Guoba stares at the fish tank"),
        { choice: [
          { t: "She said yes 😁", label: '[Forward Mama’s voice note] “She said yes 😁”', send: [{ voice: { dur: 52, text: MAMA_VN } }], fx: { set: { recipe: true }, aff: { xl: 1 } }, go: 'yes' },
          { t: "She said it stays in the family. Sorry, chef 😁", go: 'no' },
          { t: "I'll make them for you myself one day. Better than hers 😁", go: 'brag' },
        ] },
      ],
      yes: [
        { typing: 5 },
        ...say("!!!!!!!", "ICE WATER. In the FILLING. I would never have guessed that in a hundred years 😭🥟", "And pinch TWICE!! Your papa pinches once?? For thirty years?? Tell your papa I believe in him 🔥", "Tell your mama she eats free at Wanmin forever. FOREVER forever", "Attempt #7 starts NOW 🔥🔥"),
        { start: 'fr_xl_pelmeni', delay: 420 },
      ],
      no: say("Family law. I respect it. I'm crying a little", "Guoba is patting my hand 🐾"),
      brag: say("YOU can cook?? Since WHEN??", "…Okay. Deal. But I'm watching your hands the whole time 🔥"),
    },
  });
  scene({
    id: 'fr_xl_pelmeni', thread: 'xl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: '', img: 'food_pelmeni' },
        ...say("ATTEMPT #7 😭🥟", "They floated. I counted to sixty. NOT fifty. They didn't explode. Guoba cried", "They're on the specials board now: MAMA'S PELMENI (SNEZHNAYA). DO NOT ASK FOR THE RECIPE 🔥"),
      ],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // CHAPTER 3 — Saturday afternoon
  // ════════════════════════════════════════════════════════════════════

  // ── Yun Jin at the interval (slot 400 ≈ 15:40): thanks for the box, and who sat in it ──
  scene({
    id: 'fr_yunjin', thread: 'yunjin', ch: 'sat_noon', lock: 'yunjin',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 400 },
    nodes: {
      go: [
        { m: "Mr. Tartaglia! It is the interval. I have eleven minutes and one cup of tea, and I am spending both on you." },
        { if: (s) => !!F(s).zl_opera_live, go: 'live' },
        { if: (s) => !!F(s).zl_tea_sent, go: 'tea' },
        { go: 'empty' },
      ],
      live: [
        ...say(
          "Box 2 was occupied, as promised. Mr. Zhongli, mouthing every line, and beside him a figure I could not quite make out under the lights.",
          "Whoever sat there today sat very still through the aria. Mr. Tartaglia has never once sat still through anything.",
          "I mention it only because stillness suits you. Or whoever it was.",
        ),
        { choice: [
          { t: "I was moved, okay? Your aria hits hard 😁", go: 'moved' },
          { t: "Your stage lights are too bright, Yun Jin.", go: 'lights' },
          { t: "That wasn't me. I sent someone in my place.", fx: { sus: { yunjin: 2 } }, go: 'sent' },
        ] },
      ],
      tea: [
        ...say("The tea arrived in Box 2 at the second gong. Mr. Zhongli drank it slowly, and looked at the empty seat beside him rather a lot.", "He did not mouth the lines in the first act. I have never seen him forget a line."),
        { choice: [
          { t: "Tell him I'm sorry I missed it. Next time I'm there 😁", fx: { aff: { zl: 1 } }, go: 'relay' },
          { t: "He'll survive. He's seen a thousand operas 😁", go: 'survive' },
          { t: "Was he okay?", go: 'okay' },
        ] },
      ],
      empty: [
        ...say("Box 2: one gentleman, one empty seat.", "He mouthed every line of the first act, as he always does, and between the verses he looked at the door."),
        { choice: [
          { t: "Tell him the next dinner's on me. Like always 😁", fx: { aff: { zl: 1 } }, go: 'relay' },
          { t: "Something came up. He'll understand.", go: 'survive' },
          { t: "Was he okay?", go: 'okay' },
        ] },
      ],
      moved: say("Then the aria did its work. I shall tell the musicians. They will be insufferable for a week.", "Mr. Zhongli applauded the encore for a very long time, by the way. Longer than anyone. I counted."),
      lights: say("They are exactly as bright as they need to be to see who is sitting in the boxes, Mr. Tartaglia.", "But I take your point. I shall dim them. For you, or for whoever you are this afternoon."),
      sent: say("How generous, to give away the seat beside him.", "I shall not ask. A good actor never asks why the understudy went on. But your understudy wept at the encore, and so did he."),
      relay: say("I shall tell him between acts. He will say 'that is unnecessary' and then sit up a little straighter.", "Thank you for the box, Mr. Tartaglia. In all the years he has come to Heyu, I have never seen him sit in one with company. I hope one day I shall."),
      survive: say("He will. He always does. That is rather the problem with him, I think.", "The gong. I must go back and die beautifully in the second act. Good afternoon, Mr. Tartaglia."),
      okay: say("He was gracious to the usher and generous to the tea boy, and he left a single glaze lily on the edge of the stage.", "Whether he was okay, Mr. Tartaglia, I suspect you are better placed to know than I am.", "The gong. I must go."),
    },
  });

  // ── The hotpot crew: Hu Tao re-adds Zhongli by accident (after Yun Jin, or slot 480) ──
  scene({
    id: 'fr_crew_readd', thread: 'crew', ch: 'sat_noon', lock: 'crew',
    trigger: [{ on: 'scene', scene: 'fr_yunjin', delay: 50 }, { on: 'chapter', ch: 'sat_noon', delay: 480 }],
    nodes: {
      go: [
        ...by('xl', "Hotpot TONIGHT!! 19:00!! Back room!! The broth has simmered for 16 hours and achieved consciousness 🔥"),
        ...by('paimon', "PAIMON HAS BEEN FASTING SINCE BREAKFAST!!! (Paimon had two breakfasts.) 🍲"),
        ...by('ht', "ok i'm sharing the rite of parting urn catalog so everyone can pick a favorite for my birthday 👻"),
        { sys: "Hu Tao 👻 added Xiansheng 🍵 to the conversation." },
        { addMember: 'zl' },
        ...by('ht', "…", "that is not the catalog"),
        { m: "Good afternoon. I appear to have been added to a conversation. Again.", from: 'zl', d: 3 },
        ...by('zl', "Hu Tao, I believe this is the second time. On the first occasion, the twentieth of July, I departed by means of a button I had misread."),
        ...by('paimon', "IT'S THE ONE WHO NEVER PAYS!!! 😱"),
        ...by('zl', "I always intend to."),
        ...by('lumine', "hi zhongli"),
        ...by('xl', "Mr. Zhongli!! Come to hotpot tonight!! I'm making a broth with NO tentacles, I promise!! 🔥"),
        { if: (s) => F(s).xiao_replied === 'bold', go: 'xiao' },
        { if: (s) => (s.sus.ht || 0) >= 2 && !F(s).zl_contract, go: 'coat' },
        { go: 'pick' },
      ],
      xiao: [
        ...by('zl', "Childe. A young friend of mine tells me you invited him to 'make you'. He is very earnest, and takes such invitations literally. I would be grateful if you did not encourage him."),
        ...by('paimon', "WHO'S THE YOUNG FRIEND??? Is he HUNGRY???"),
        { go: 'pick' },
      ],
      coat: [
        ...by('zl', "Hu Tao also tells me you have been 'texting in a borrowed coat'. I told her that coats, like habits, are sometimes changed in autumn."),
        ...by('ht', "that's not how i said it. i said it with more ghosts 👻"),
        { go: 'pick' },
      ],
      pick: [
        { choice: [
          { t: "XIANSHENG!! Stay this time 😁 Hotpot's on me. Like always", fx: { aff: { zl: 1 }, set: { zl_in_crew: true, hotpot_tab: true } }, go: 'stay' },
          { t: "Run, xiansheng. Before Paimon makes you pay 😁", go: 'leave' },
          { t: "Hu Tao, what is wrong with you 😂", go: 'htbit' },
          { t: "Mr. Zhongli, nice to see you here.", fx: { sus: { paimon: 1, lumine: 1 } }, go: 'polite' },
        ] },
      ],
      stay: [
        { m: "Then I shall stay. I am told it is customary to send a 'sticker'.", from: 'zl', d: 3 },
        ...by('zl', "I have examined the available stickers for some time and find none of them adequate."),
        ...by('paimon', "PAIMON WILL TEACH YOU!!!"),
        ...by('zl', "I will attend at seven, if the parlor allows it. There is a great deal of incense to count."),
        ...by('ht', "THE FUNERAL AND THE FISHERMAN AT HOTPOT 👻👻👻"),
        { go: 'tab' },
      ],
      leave: [
        { m: "A wise suggestion.", from: 'zl', d: 2 },
        { sys: "Xiansheng 🍵 left the conversation." },
        { removeMember: 'zl' },
        ...by('ht', "noooo he did it AGAIN 👻", "ok but he pressed the right button this time. growth 🦋"),
        { go: 'tab' },
      ],
      htbit: [
        ...by('ht', "i have a condition called 'busiest funeral week in history' 👻"),
        ...by('zl', "It is, in fairness, the busiest funeral week in six thousand years.", "I shall remain, briefly, to observe what a 'hotpot crew' does."),
        { fx: { set: { zl_in_crew: true } } },
        { go: 'tab' },
      ],
      polite: [
        ...by('paimon', "'MR. ZHONGLI'??? Since WHEN do you call him MISTER???"),
        ...by('lumine', "childe. you say xiansheng like it's a pet name"),
        { if: (s) => !!F(s).zl_contract, go: 'polite_cover' },
        { m: "How unusual.", from: 'zl', d: 2 },
        { go: 'tab' },
      ],
      polite_cover: [
        ...by('zl', "He is attempting a new formality. It does not suit him. I have told him so."),
        ...by('ht', "lmao 👻"),
        { go: 'tab' },
      ],
      tab: [
        { if: (s) => !!F(s).hotpot_tab, go: 'tab_yes' },
        ...by('xl', "Childe!! Should I put tonight on your tab?? Like always?? 🔥"),
        { choice: [
          { t: "Always 😁 Order the good lamb", fx: { set: { hotpot_tab: true } }, go: 'tab_ok' },
          { t: "You guys pay this time.", fx: { sus: { paimon: 1 } }, go: 'tab_no' },
        ] },
      ],
      tab_yes: by('xl', "Paimon says you're paying tonight, so it's on your tab!! Like always!! 🔥", "19:00!! Don't be late!!"),
      tab_ok: [...by('paimon', "THE GOOD LAMB!!! 😭🔥"), ...by('xl', "19:00!! Don't be late!!")],
      tab_no: [...by('paimon', "…", "Paimon is writing this in the Weird Childe Log. 📒"), ...by('lumine', "it's fine. i'll pay. in coins")],
    },
  });

  // ── Hu Tao's quiz: "what did you call my hat?" (the answer is in her Ripple comments: "the moth") ──
  scene({
    id: 'fr_ht_quiz', thread: 'ht', ch: 'sat_noon', lock: 'ht',
    trigger: [{ on: 'scene', scene: 'fr_crew_readd', delay: 40 }, { on: 'chapter', ch: 'sat_noon', delay: 560 }],
    when: (s) => !F(s).zl_contract && !F(s).ht_ally,
    nodes: {
      go: [
        ...say(
          "ok mr. harbinger. pop quiz 👻",
          "i've been thinking about last night. the puddle. the vibes. the way you've been typing like you're wearing oven mitts",
          "so. a question only the REAL you would know",
          "two weeks ago i posted my new hat. my beautiful, hand-stitched, seventy-seven-directors-of-tradition plum blossom butterfly hat",
          "and you called it something. in public. on ripple. in front of my followers 🦋",
        ),
        { m: "what did you call my hat", d: 2 },
        { choice: [
          { t: "the lampshade 😁", fx: { sus: { ht: 3 } }, go: 'wrong' },
          { t: "the pancake 😁", fx: { sus: { ht: 3 } }, go: 'wrong' },
          { t: "the moth 😁", fx: { set: { ht_quiz_ok: true }, sus: { ht: -2 } }, go: 'right' },
          { t: "…a very brave hat?", fx: { sus: { ht: 3 } }, go: 'wrong' },
        ], timeout: 90, onTimeout: 'slow' },
      ],
      right: say("…", "ok. OK. it's you. nobody else would be that rude to a hat 👻", "i forgive you. i don't. there's still a curse on your next fish. a small one", "carry on mr. harbinger 🦋"),
      wrong: say("the WHAT", "that's not what you called it. you called it something much WORSE. i remember because i cried a little in the showroom", "hmm. hmmmmm. 👻", "the coffins are whispering, mr. harbinger. they're saying 'not him'"),
      slow: [{ fx: { sus: { ht: 2 } } }, ...say("too slow!!! the real one answers in 0.4 seconds with a crying-laughing emoji 👻", "hmm. 🦋")],
    },
  });

  // ── Beidou: "Tonight. 22:00. Third round." (slot 600; S4's chapter floor is 16:30) ──
  scene({
    id: 'fr_beidou', thread: 'beidou', ch: 'sat_noon', lock: 'beidou',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 600 },
    onExpire: [{ m: "No answer? Where I'm from, silence means yes. 22:00, kid. ⚓" }, { fx: { set: { beidou_accepted: true } } }],
    nodes: {
      go: [
        ...say("Kid!", "The Alcor's deck is scrubbed, the crew's placing bets, and Kazuha's been sharpening something he won't show me. ⚔️", "Tonight. 22:00. Third round. You in or are you out?"),
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: "In. Obviously. Bring your whole crew, I'll take them too 😁⚔️", fx: { set: { beidou_accepted: true }, aff: { beidou: 1 } }, go: 'yes' },
          { t: "Next week. I'll still win. 😁", fx: { set: { beidou_rain_check: true } }, go: 'rain' },
          { t: "I can't. My family's visiting.", fx: { set: { beidou_declined: true }, sus: { beidou: 2 } }, go: 'meek' },
          { t: "First: can my siblings sleep on the Alcor tonight? Somewhere safe.", if: (s) => !F(s).kids_alcor && !F(s).fatui_pickup && (!!F(s).kids_grand || !!F(s).kids_apartment), go: 'kids' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      yes: [
        ...say("HA! That's my kid. ⚓", "Kazuha's already writing the poem about your defeat. The first line rhymes 'Snezhnaya' with 'ow'.", "Crux Pier, the big ship with the red sails. You can't miss it. Don't be late."),
        { add: { to: 'events', item: { cal: 'home', title: 'Rematch — The Alcor ⚔️', start: T('+1 22:00'), end: T('+1 23:30'), location: 'The Alcor, Crux Pier', notes: 'Third round. (Beidou)' }, notify: true } },
        { if: (s) => !!F(s).fatui_pickup && !F(s).kids_rescued, go: 'tight' },
      ],
      tight: [
        { m: "You sound wound tight, kid. Even for you. Something wrong?" },
        { choice: [
          { t: "My siblings are at the Grand with Pulcinella's people. I need them out. Tonight.", go: 'rescue' },
          { t: "Nothing. Just hungry for a fight 😁", go: 'hungry' },
        ] },
      ],
      rescue: [
        ...say("…Pulcinella. The old man with the cane and the nice voice.", "Say no more. Kazuha and I will have them aboard within the hour. Nobody touches kids on my watch.", "They can have my cabin. I sleep on deck anyway. ⚓"),
        { fx: { set: stay('kids_alcor', { kids_rescued: true, rescue_by: 'beidou' }) } },
        { start: 'fr_beidou_rescued', delay: 90 },
      ],
      hungry: say("That's the spirit. Save it for my deck."),
      rain: say("Ha! 'I'll still win.' Now THAT sounds like you.", "Next week, then. Kazuha says he'll hold the poem.", "But if you change your mind, the deck's open at ten. ⚓"),
      meek: say("…", "'I can't'?", "Kid, you once challenged me with a broken wrist. On a moving ship. In a storm.", "Fine. Go play with your family. I'll tell the crew you went soft. ⚓"),
      kids: [
        ...say("On my ship? Ha! Sure. The Alcor's been a nursery before. Kazuha's good with kids. He talks to them like they're poets.", "Send them down to Crux Pier. Anyone who isn't them goes in the harbor."),
        { fx: { set: stay('kids_alcor') } },
        { m: "Now. Tonight. Are you in or not?" },
        { go: 'ask' },
      ],
      read: [{ wait: 10 }, ...say("No answer? Where I'm from, silence means yes.", "22:00, kid. ⚓"), { fx: { set: { beidou_accepted: true } } }],
    },
  });
  scene({
    id: 'fr_beidou_rescued', thread: 'beidou',
    trigger: { on: 'manual' },
    nodes: {
      start: say(
        "They're aboard. ⚓",
        "The small one asked if I'm a pirate. I said 'licensed'. He's been saluting everyone since.",
        "The tall one asked how much the Fatui pay you. Smart girl. I told her to ask you.",
        "Two men in grey coats followed us to the pier. My crew suggested they swim home. They agreed.",
      ),
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // ANY TIME — reactions to other arcs and to the apps
  // ════════════════════════════════════════════════════════════════════

  // ── Paimon's Wanmin Go orders: S3's own counter first, then one reaction per milestone ──
  S.onAct({ id: 'fr_paimon_count', arc: 'friends', act: 'order', match: isPaimon, fx: (p) => ({ inc: { fr_paimon_n: 1, fr_paimon_sum: Math.round(Number(p.total) || 0) } }) });
  S.onAct({ id: 'fr_paimon_full', arc: 'friends', act: 'order', once: true, match: (p, s) => isPaimon(p) && total(s) >= 20000, start: 'fr_paimon_emergency', delay: 20 });
  [[1, 'fr_paimon_meal_1'], [2, 'fr_paimon_meal_2'], [3, 'fr_paimon_meal_3'], [4, 'fr_paimon_meal_4']].forEach(([n, sc]) => {
    S.onAct({ id: 'fr_paimon_react_' + n, arc: 'friends', act: 'order', match: (p, s) => isPaimon(p) && N(s, 'fr_paimon_n') === n && total(s) < 20000, start: sc, delay: 25 });
  });
  S.onAct({ id: 'fr_paimon_react_big', arc: 'friends', act: 'order', once: true, match: (p, s) => isPaimon(p) && total(s) >= 12000 && total(s) < 20000, start: 'fr_paimon_meal_big', delay: 40 });

  scene({
    id: 'fr_paimon_meal_1', thread: 'paimon', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: "THE FOOD IS HERE!!! 😭🍲" },
        { m: '', img: 'food_hotpot' },
        ...say("Paimon is going to eat ALL of it and then Paimon is going to SLEEP in it", "Paimon is crossing you off the list of people Paimon might bite!!! 💖", "Paimon owes you THIRTY-TWO now. Paimon is very honest. 📒"),
        { m: "you fed her in the middle of the night. she's going to expect this now. forever", th: 'lumine', from: 'lumine' },
      ],
    },
  });
  scene({
    id: 'fr_paimon_meal_2', thread: 'paimon', trigger: { on: 'manual' },
    nodes: {
      start: [
        ...say("AGAIN??? 😭💖", "Paimon didn't even ASK this time!!! …Paimon asked a LITTLE."),
        { m: '', img: 'food_almond_tofu' },
        { m: "Xiangling drew a little heart on the box!!! Paimon ATE the little heart!!!" },
      ],
    },
  });
  scene({
    id: 'fr_paimon_meal_3', thread: 'lumine', trigger: { on: 'manual' },
    nodes: {
      start: [
        ...say("childe.", "stop feeding her.", "she's asleep in a bowl. an actual bowl"),
        { m: "Paimon is NOT asleep in a bowl!!! Paimon is RESTING in a bowl!!! It's DIFFERENT!!! 🥣", th: 'paimon', from: 'paimon' },
      ],
    },
  });
  scene({
    id: 'fr_paimon_meal_4', thread: 'xl', trigger: { on: 'manual' },
    nodes: {
      start: [
        ...say("Childe!! That's Paimon's FOURTH order on your account!! Are you okay?? Is SHE okay?? 🔥😅", "Guoba stopped eating in solidarity. Guoba has started eating again"),
        { m: "Paimon has decided to love you forever. That's it. That's the message. 🍡💖", th: 'paimon', from: 'paimon' },
      ],
    },
  });
  scene({
    id: 'fr_paimon_meal_big', thread: 'paimon', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: '', voice: { dur: 14, text: "(chewing) Childe. (chewing) Paimon wants you to know. (chewing) That Paimon has never been happier. (a long pause) Okay bye." } },
        { m: "she's eaten more than the guild's quarterly budget. i checked. i'm not joking", th: 'lumine', from: 'lumine' },
      ],
    },
  });
  // ── Emergency Food (paimon_total ≥ ℳ20,000) ──
  scene({
    id: 'fr_paimon_emergency', thread: 'paimon', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: "Childe.", d: 2 },
        ...say("Paimon needs to tell you something.", "Paimon ate it ALL.", "Everything on the Wanmin menu. Twice. And the Xinyue Kiosk menu. And something Hu Tao says was 'probably incense'."),
        { m: '', img: 'p_paimon_food' },
        { m: "CHILDE. My whole kitchen is EMPTY. The walk-in fridge is EMPTY. Dad came out of retirement to work the woks and then went BACK into retirement 🔥😭", th: 'xl', from: 'xl' },
        { m: "childe. she's not moving. no. she's moving. she's singing to a dumpling", th: 'lumine', from: 'lumine' },
        { wait: 3 },
        { m: '', voice: { dur: 21, text: "(very slowly) Childe… Paimon has known you for… seven months… and you have NEVER… let Paimon order the dessert page… twice… (a long, contented sigh) …you're not Childe, are you. …Paimon doesn't care. Paimon loves you. Whoever you are." } },
        { wait: 3 },
        { ending: 'paimon' },
      ],
    },
  });

  // ── card_frozen: Paimon is devastated ──
  scene({
    id: 'fr_paimon_frozen', thread: 'paimon', lock: 'paimon',
    trigger: { on: 'flag', flag: 'card_frozen', delay: 25 },
    when: (s) => !!F(s).card_frozen,
    nodes: {
      go: [
        ...say("CHILDE!!! EMERGENCY!!! 🚨", "Paimon tried to add ONE (1) almond tofu to your Wanmin Go group order and it said 'PAYMENT CARD FROZEN' ❄️❄️❄️", "FROZEN!!! Like SNEZHNAYA!!! Like a FISH in a FREEZER!!!", "Who did this??? Was it a BANK??? Paimon will FIGHT a bank!!!"),
        { choice: [
          { t: "I froze it. Long story. Important story 🧊", go: 'me' },
          { t: "Bank stuff. It'll thaw 😁", go: 'thaw' },
          { t: "Someone was going to use it for something evil.", fx: { aff: { lumine: 1 } }, go: 'evil' },
        ] },
      ],
      me: [
        ...say("WHY WOULD YOU DO THIS TO PAIMON", "Paimon is lying on the floor. Lumine is stepping over Paimon. Paimon is in MOURNING 😭"),
        { m: "she's fine. she's lying on the floor 'in mourning'. thanks for this", th: 'lumine', from: 'lumine' },
      ],
      thaw: say("It'll THAW??? WHEN??? Paimon's stomach doesn't THAW, Childe!!! It's ALWAYS READY!!!", "…Paimon will wait. Paimon is very patient. (Paimon is not.)"),
      evil: [
        ...say("WAS IT PAIMON??? Paimon is not evil!!! Paimon is HUNGRY!!! Those are DIFFERENT!!!", "…Wait. REAL evil? Like FATUI evil?", "…Okay. Paimon is proud of you. Paimon is ALSO hungry. Both things are true."),
        { m: "paimon told me. whatever you stopped. good", th: 'lumine', from: 'lumine' },
      ],
    },
  });

  // ── zl_contract: Hu Tao is in on it (ht_ally) ──
  scene({
    id: 'fr_ht_ally', thread: 'ht', lock: 'ht',
    trigger: { on: 'flag', flag: 'zl_contract', delay: 40 },
    when: (s) => !!F(s).zl_contract && !F(s).ht_ally,
    nodes: {
      go: [
        ...say(
          "so.",
          "zhongli just walked into the showroom holding a contract and wearing his smug face. his SMUGGEST face. i've seen it twice in my life",
          "he says you're 'a person of good character holding a phone that does not belong to them' 👻",
          "welcome to the conspiracy!!! we have snacks (incense)",
          "rules: 1. the package stays in the box. 2. you keep answering like him. 3. if anyone asks, coffin 4 doesn't exist",
        ),
        { fx: { set: { ht_ally: true, knows_hideout: true } } },
        { m: "the package says, and i quote: 'tell them to beat teucer's reel rush score, never say please to signora, and don't let paimon order the whole menu' 👻" },
        { choice: [
          { t: "Tell the package he owes me.", fx: { set: { ht_owes_fish: true } }, go: 'owes' },
          { t: "Is he okay? Really?", go: 'okay' },
          { t: "Thanks for covering, Hu Tao.", go: 'thanks' },
        ] },
      ],
      owes: say("he says 'i owe you a fish'. that's his currency 🐟", "he's going to pick one with a NAME. you've been warned"),
      okay: say("he's fine. he's sulking. he lost to me at cards twice. he's bad at cards when he can't punch the deck", "he also asked about his siblings forty times in an hour. i timed it 👻"),
      thanks: say("aw. polite. we'll fix that 🦋", "seriously though. you're doing ok, phone ghost. he'd be proud. he'd never say it. he'd challenge you to a fight instead"),
    },
  });

  // ── Find My → Childe's AirPods → Play Sound: heard in Coffin 4 ──
  scene({
    id: 'fr_ht_beeping', thread: 'ht', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: "WHAT IS BEEPING IN COFFIN 4", d: 0.8 },
        { m: "WHAT. IS. BEEPING." },
        { m: '', img: 'p_coffin4' },
        { if: (s) => !!F(s).ht_ally, go: 'ally' },
        { typing: 4 },
        ...say(
          "ok. it stopped. it was earbuds. in somebody's pocket. somebody who is not in coffin 4, because there is no coffin 4",
          "…mr. harbinger. are you playing a sound on your own earbuds. from your own phone. while you're— you know what. never mind 👻",
          "he jumped so high he hit the lid. i mean NOBODY jumped. there's nobody. goodnight",
        ),
        { fx: { sus: { ht: 1 } } },
        { end: true },
      ],
      ally: say("oh it's YOU. very funny, phone ghost 👻", "he jumped so high he hit the lid. he says 'whoever did that, i respect it'. then he said a word i can't put in the parlor newsletter"),
    },
  });
  S.onAct({ id: 'fr_airpods_beep', arc: 'friends', act: 'findmy_sound', match: (p) => idOf(p) === 'airpods', start: 'fr_ht_beeping', delay: 6 });

  // ── sus.ht ≥ 5: she clocks you → Wangsheng Is Hiring (unless Zhongli's contract makes her an ally) ──
  scene({
    id: 'fr_ht_clocked', thread: 'ht',
    trigger: { on: 'sus', who: 'ht', at: 5, delay: 12 },
    when: (s) => !F(s).zl_contract && !F(s).ht_ally,
    nodes: {
      start: [
        { m: "ok.", d: 2 },
        ...say(
          "ok ok ok. i've been doing math. ghost math 👻",
          "the real mr. harbinger texts like a golden retriever who learned swordplay. you text like someone holding a stranger's phone very, very carefully",
          "you're not him.",
          "don't panic. i'm not mad. i'm a funeral director. i see stranger things than you before breakfast",
          "i just have one (1) question 🦋",
        ),
        { choice: [
          { t: "…Who am I, then?", go: 'job' },
          { t: "I'm Childe. Obviously 😁", go: 'deny' },
          { t: "Please don't tell anyone.", go: 'job' },
        ], timeout: 120, onTimeout: 'job' },
      ],
      deny: [...say("mhm. and i'm a qixing", "the real one would've challenged me to a duel by now. with a ladle"), { go: 'job' }],
      job: [
        ...say(
          "here's my question:",
          "you've been lying to a bank, a man with opinions about tea, a ship captain, a gremlin and ME. for hours. without crying",
          "that's composure. that's a face that can stand next to a coffin and not flinch",
          "do you want a job? 👻",
          "wangsheng is hiring. the uniform is a hat. you get the hat",
          "come by the parlor. bring the phone. there's someone in the showroom who'd very much like it back 🦋",
        ),
        { wait: 2 },
        { ending: 'wangsheng' },
      ],
    },
  });
  scene({
    id: 'fr_ht_sloppy', thread: 'ht',
    trigger: { on: 'sus', who: 'ht', at: 5, delay: 12 },
    when: (s) => !!F(s).zl_contract || !!F(s).ht_ally,
    nodes: {
      start: [
        ...say("psst. phone ghost 👻", "you're getting sloppy. even the coffins noticed", "lucky for you i'm in on it. unlucky for you i'm telling zhongli. he'll be disappointed in a very calm way. the worst way 🦋"),
        { fx: { set: { ht_ally: true } } },
      ],
    },
  });

  // ── Xiangling delivers to the ops night shift (any Wanmin Go order to the bank) ──
  scene({
    id: 'fr_xl_nightshift', thread: 'xl', trigger: { on: 'manual' },
    nodes: {
      start: say(
        "Childe!! Delivered to your office!! 🔥",
        "The front door was locked, so a very big man opened a window and took the bag like a bear taking honey",
        "He said 'Boris says thank you to Boss' and cried a little??",
        "A lady with a hammer said 'finally, food that isn't from the vending machine'. A guy kept apologizing to me about a fire",
        "Also your lobby floor was very wet. Is that normal for banks?? 😅",
      ),
    },
  });
  S.onAct({ id: 'fr_xl_ops_order', arc: 'friends', act: 'order', match: (p) => p.to === 'northland', start: 'fr_xl_nightshift', delay: 40 });
})();
