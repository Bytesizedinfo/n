/* Live scenes — the Liyue Branch ops group "Liyue Branch 🐟": the frozen aquarium, pelmeni for the night shift
   (Wanmin Go → Northland), the toy-factory costume caper, Kolya lost in the Chasm, "Do we really do Osial?",
   the better idea at Guyun, and Monday. Decent, brave, honest choices raise `ops_morale`; ≥ 3 unlocks
   `ops_sabotage` at Signora's deadline. Package S2. Facts: docs/STORY.md. Format: docs/DEV.md "Story engine". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  // ── shared helpers (S2) ──────────────────────────────────────────
  const F = (s) => s.flags || {};
  const num = (s, k) => Number(F(s)[k] || 0);
  const held = (s, k, me) => {
    const o = F(s)['busy_' + k];
    if (!o || o === me) return false;
    if (typeof o === 'string') { const d = s.done || {}; if (!d[o] || d[o] === 'expired' || d[o] === 'skipped' || (s.fin && s.fin[o])) return false; }
    return true;
  };
  const waitFor = (k, me, next) => [{ if: (s) => !held(s, k, me), go: next }, { wait: 5 }, { go: 'start' }];
  const lock = (k, me) => ({ fx: { set: { ['busy_' + k]: me } } });
  const free = (k, me) => ({ run: (api) => { const f = api.state.flags; if (f['busy_' + k] === me) f['busy_' + k] = false; } });
  const helper = (names, s, dflt) => {
    const H = JC.storyHelpers || {};
    for (const n of names) if (typeof H[n] === 'function') { try { return !!H[n](s); } catch (e) { break; } }
    return !!dflt(s);
  };
  const stopped = (s) => helper(['osial_stopped', 'osialStopped'], s, (x) => !F(x).osial_sent && !!(F(x).leaked_yelan || F(x).leaked_ning || F(x).ops_sabotage || F(x).zl_amended || F(x).card_frozen));
  const recalled = (s) => helper(['recalled'], s, (x) => !F(x).defected && !F(x).zl_amended);
  const alive = (s) => !F(s).deal_refused && !F(s).lost_mode && !F(s).finale;
  const scene = (def) => S.scene(Object.assign({ arc: 'ops' }, def));
  const M = (from, m, x) => Object.assign({ m, from }, x || {});

  // ── 1. The aquarium (ch1 +280 ≈ 00:15) ───────────────────────────
  scene({
    id: 'ops_aquarium',
    thread: 'ops',
    ch: 'fri_night',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 280 },
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_aquarium', 'go'),
      go: [
        lock('ops', 'ops_aquarium'),
        M('lyuba', 'update: the fish are in the ice. the ice is in the aquarium. the aquarium is in trouble'),
        M('lyuba', '', { img: 'p_aquarium_frozen' }),
        M('pyotr', 'LYUBA'),
        M('pyotr', 'SIR IS IN THIS GROUP. SIR CAN READ'),
        M('lyuba', 'oh no'),
        M('lyuba', "it's past midnight. maybe Sir is asleep"),
        M('anya', 'sir has never been asleep in his life'),
        M('valentina', 'I see three fish. Ekaterina II. Boris Jr. And Signora.'),
        M('valentina', 'Signora is glaring at me through the ice. I respect her.'),
        M('boris', 'boris jr. 😢 boris is sad 🛡️'),
        M('kolya', 'where is the aquarium. asking so i can help. also where am i'),
        M('ekat', 'Everyone, please. Sir has had a very long night.'),
        { choice: [
          { t: 'Warm tea. Pour it slowly. Not boiling. Talk to them while you do it.', fx: { set: { aquarium: 'tea', aquarium_saved: true }, inc: { ops_morale: 1 } }, go: 'tea' },
          { t: 'LYUBA.', fx: { set: { aquarium: 'yell' } }, go: 'yell' },
          { t: 'Anya. Hammer. Gently.', fx: { set: { aquarium: 'hammer' } }, go: 'hammer' },
          { t: "It's okay, accidents happen 🥰", fx: { set: { aquarium: 'soft' }, sus: { lyuba: 1 } }, go: 'soft' },
          { t: "Who cares, they're just fish.", fx: { set: { aquarium: 'cold' }, sus: { lyuba: 1 }, inc: { ops_morale: -1 } }, go: 'cold' },
          { t: '[Leave on read]', silent: true, fx: { set: { aquarium: 'read' } }, go: 'read' },
        ] },
      ],
      yell: [
        M('lyuba', 'yes Sir. sorry Sir. ❄️'),
        M('lyuba', 'what do we do Sir'),
        { choice: [
          { t: 'Warm tea. Slowly. Not boiling. Talk to them.', fx: { set: { aquarium_saved: true }, inc: { ops_morale: 1 } }, go: 'tea' },
          { t: 'Anya. Hammer. Gently.', fx: { set: { aquarium: 'hammer' } }, go: 'hammer' },
          { t: 'Leave them. Fish are tougher than you think.', fx: { set: { aquarium: 'read' } }, go: 'read' },
        ] },
      ],
      tea: [
        M('lyuba', 'pouring. slowly. talking to them'),
        M('lyuba', 'i am telling them about my childhood again'),
        { wait: 5 },
        M('lyuba', 'Ekaterina II is swimming. Boris Jr. is swimming 🐟'),
        M('boris', 'BORIS JR LIVES 🛡️😭'),
        M('valentina', 'Signora is swimming. Slowly. In a circle. Glaring.'),
        M('kolya', 'how did sir know about the tea'),
        M('pyotr', 'sir knows everything about fish. sir IS a fish 🔥'),
        { go: 'food' },
      ],
      hammer: [
        M('anya', 'gently is not in the manual, sir ⚡'),
        M('anya', 'ok. one tap'),
        { wait: 4 },
        M('anya', 'so the ice is fine and the glass is not'),
        M('valentina', 'There is water on the second floor.'),
        M('pyotr', 'the fish are on the carpet. they are alive. they are FURIOUS'),
        M('boris', 'boris is carrying them to the sink in his hands. one by one. gently 🛡️'),
        { fx: { set: { aquarium: 'smashed' } } },
        { go: 'food' },
      ],
      soft: [
        M('lyuba', '…'),
        M('pyotr', 'sir?'),
        M('anya', '"accidents happen"? last time you made her write the fish an apology. by hand'),
        M('kolya', 'sir are you ok'),
        M('lyuba', '…warm tea. that is what Sir said last time. i will do that'),
        { fx: { set: { aquarium_saved: true } } },
        { go: 'food' },
      ],
      cold: [
        M('anya', '"just fish"'),
        M('pyotr', 'sir named every single one of them. sir made us LEARN their names'),
        M('boris', 'boris jr. is not just fish 😢'),
        M('valentina', 'Sir. Are you well?'),
        M('lyuba', '…i will use warm tea. like last time. they deserve it'),
        { go: 'food' },
      ],
      read: [
        { wait: 6 },
        M('anya', 'sir read it. sir is choosing violence by silence'),
        M('pyotr', 'i can fix it!! i can melt it!! 🔥'),
        M('anya', 'PYOTR NO'),
        { wait: 4 },
        M('kolya', 'it is steaming. why is it steaming'),
        M('valentina', 'The fish are alive. They are warm. They are very warm. Signora has turned slightly pink.'),
        { fx: { set: { aquarium: 'pyotr' } } },
        { go: 'food' },
      ],
      food: [
        M('boris', 'boss. the night shift is hungry. boris is not saying anything. boris is just saying'),
        { choice: [
          { t: "I'll send pelmeni. 🥟", fx: { set: { pelmeni_promised: true } }, go: 'promise' },
          { t: 'Eat the vending machine.', go: 'vend' },
          { t: 'Ekaterina, expense everyone a snack.', fx: { set: { ops_snack: true } }, go: 'snack' },
        ] },
      ],
      promise: [
        M('pyotr', 'SIR 😭🔥'),
        M('boris', 'the best boss in snezhnaya 🛡️'),
        M('anya', '(he has to actually order them, pyotr. on the app. wanmin go. to the branch)'),
        M('pyotr', '(i know. i am manifesting)'),
        free('ops', 'ops_aquarium'),
      ],
      vend: [
        M('pyotr', 'the vending machine says E-11. it says E-11 to everything now. it has given up'),
        M('anya', 'i respect it'),
        free('ops', 'ops_aquarium'),
      ],
      snack: [
        M('ekat', 'Done, Sir. Expensed under "morale".'),
        M('lyuba', 'thank you Sir ❄️'),
        free('ops', 'ops_aquarium'),
      ],
      x: [free('ops', 'ops_aquarium')],
    },
  });

  // ── 2. Pelmeni for the night shift (Wanmin Go → Northland, once per night: ops_morale +1) ──
  const toBranch = (p) => !!p && ['northland', 'ops', 'ekat'].includes(String(p.to || p.place || ''));
  const NIGHTS = ['fri_night', 'sat_night', 'sun_night'];
  NIGHTS.forEach((ch) => {
    S.onAct({
      id: 's2_pelmeni_' + ch, act: 'order', arc: 'ops', once: true,
      match: (p, s) => toBranch(p) && s.chapter === ch,
      fx: { inc: { ops_morale: 1 }, set: { ['pelmeni_' + ch]: true } },
      start: 'ops_pelmeni_' + ch, delay: 40,
    });
  });
  const pelmeni = {
    fri_night: [
      M('pyotr', 'SIR. THE PELMENI. 🥟🔥'),
      M('pyotr', '', { img: 'food_pelmeni' }),
      { if: (s) => !!F(s).pelmeni_promised, go: 'promised' },
      { go: 'rest' },
    ],
    sat_night: [
      M('boris', 'boss. pelmeni. at the door. boris is opening the door 🛡️'),
      M('boris', '', { img: 'food_pelmeni' }),
      { if: (s) => !!F(s).kolya_found, go: 'kolya' },
      { go: 'rest' },
    ],
    sun_night: [
      M('pyotr', 'SIR. PELMENI. ON THE NIGHT OF ALL NIGHTS 🔥'),
      M('pyotr', '', { img: 'food_pelmeni' }),
      M('anya', 'fuel. for whatever happens next ⚡'),
      { go: 'rest' },
    ],
  };
  NIGHTS.forEach((ch) => {
    const me = 'ops_pelmeni_' + ch;
    scene({
      id: me,
      thread: 'ops',
      trigger: { on: 'manual' },
      when: alive,
      nodes: Object.assign({
        start: waitFor('ops', me, 'go'),
        go: [lock('ops', me)].concat(pelmeni[ch]),
      }, ch === 'fri_night' ? {
        promised: [
          M('pyotr', 'he promised and then he ORDERED. i am crying. it is mostly steam 🔥'),
          { go: 'rest' },
        ],
      } : {}, ch === 'sat_night' ? {
        kolya: [
          M('anya', "kolya is eating like he spent a day in a cave. because he did"),
          M('kolya', 'these are the best pelmeni of my life 🐣'),
          { go: 'rest' },
        ],
      } : {}, {
        rest: [
          M('boris', 'boss is the best boss 🛡️'),
          M('lyuba', 'i froze the leftovers so they last forever ❄️'),
          M('anya', 'there are no leftovers. boris ate the leftovers'),
          M('valentina', 'I see a happy branch.'),
          M('ekat', 'Thank you, Sir. The chef sent extra chili oil and a note that says "for the night shift 🔥".'),
          free('ops', me),
        ],
      }),
    });
  });

  // ── 3. Saturday afternoon: the toy factory costume caper (ch3 +120 ≈ 14:44) ──
  scene({
    id: 'ops_costumes',
    thread: 'ops',
    ch: 'sat_noon',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 120 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_costumes', 'go'),
      go: [
        lock('ops', 'ops_costumes'),
        { if: (s) => !!F(s).factory_bank, go: 'ready' },
        { if: (s) => !!F(s).factory_zl, go: 'zl' },
        { if: (s) => !!F(s).factory_cancelled, go: 'cancel' },
        { go: 'pitch' },
      ],
      pitch: [
        M('valentina', 'Sir. Ekaterina says your little brother wants to see the toy factory.'),
        M('anya', 'we can BE a toy factory. give us two hours'),
        M('boris', 'boris has a bear costume. a toy bear. boris has had it since wednesday 🛡️'),
        M('pyotr', 'i have an elf hat!! i can do festive sparks!! only festive ones!! 🔥'),
        M('lyuba', 'i can make it snow in the lobby ❄️'),
        M('ekat', 'The sign arrived this morning, Sir. NORTHLAND TOYS. Gold letters.'),
        { choice: [
          { t: 'Do it. Full costumes. Everyone.', fx: { set: { ops_costumes: true }, inc: { ops_morale: 1 } }, go: 'yes' },
          { t: "You're all idiots. I love it. 😁", fx: { set: { ops_costumes: true }, inc: { ops_morale: 1 } }, go: 'yes' },
          { t: 'Not this time. Too dangerous with Signora sniffing around.', fx: { set: { ops_costumes: false, ops_costumes_no: true } }, go: 'no' },
        ] },
      ],
      yes: [
        M('pyotr', 'ELVES ASSEMBLE 🔥'),
        M('ekat', 'Weapons are going into the vault. Valentina is Quality Control.'),
        M('valentina', 'I control quality.'),
        M('anya', "we're ready whenever the small one is. bring him in through the front, not the loading dock. the loading dock has blood on it. it's pyotr's. long story"),
        free('ops', 'ops_costumes'),
      ],
      no: [
        M('boris', 'understood boss. 😢'),
        M('boris', 'boris will wear the bear costume at home. for the cat'),
        free('ops', 'ops_costumes'),
      ],
      ready: [
        M('ekat', 'Sir. Checklist for the tour:'),
        M('ekat', '• Sign: NORTHLAND TOYS ✔\n• Weapons: in the vault ✔\n• Pyotr: festive sparks only ✔\n• Lyuba: snow, lobby only ✔\n• Kolya: tour guide (with a map) ✔'),
        M('ekat', '• Valentina: Quality Control. She chose the title herself.'),
        M('boris', 'boris made the bear costume bigger. for the shoulders. the little brother will ride the bear 🛡️'),
        M('anya', "i am holding the antlers. i am NOT wearing the antlers ⚡"),
        { fx: { set: { ops_costumes: true } } },
        { choice: [
          { t: 'Boris is head toy. Head bear. Whatever.', fx: { set: { ops_headelf: 'boris' } }, go: 'r_boris' },
          { t: 'Kolya is NOT the tour guide. Kolya will get Teucer lost.', fx: { set: { ops_headelf: 'kolya' } }, go: 'r_kolya' },
          { t: "Valentina, no mirrors. He'll have nightmares.", fx: { set: { ops_headelf: 'valentina' } }, go: 'r_val' },
          { t: "You're the best branch in Snezhnaya. 😁", fx: { set: { ops_headelf: 'all' }, inc: { ops_morale: 1 } }, go: 'r_all' },
        ] },
      ],
      r_boris: [
        M('boris', 'head bear. 🥹 boris will not cry. boris is crying 🛡️'),
        free('ops', 'ops_costumes'),
      ],
      r_kolya: [
        M('kolya', 'i would only get him a LITTLE lost 🐣'),
        M('anya', 'promoted to door-holder. congratulations'),
        free('ops', 'ops_costumes'),
      ],
      r_val: [
        M('valentina', 'No mirrors. I will be a very boring mirror today.'),
        free('ops', 'ops_costumes'),
      ],
      r_all: [
        M('pyotr', 'SIR 😭🔥'),
        M('anya', "don't make it weird. (i'm smiling) ⚡"),
        free('ops', 'ops_costumes'),
      ],
      zl: [
        M('pyotr', 'sir. we heard the tour is at the toy shop. with the tea man'),
        M('boris', 'boris already made the bear costume 😢'),
        { choice: [
          { t: 'Wear it anyway. Monday is Elf Day.', fx: { set: { ops_elfday: true }, inc: { ops_morale: 1 } }, go: 'elfday' },
          { t: 'Next time. Promise.', fx: { set: { ops_next_time: true } }, go: 'next' },
          { t: 'Put the bear away, Boris.', go: 'away' },
        ] },
      ],
      cancel: [
        M('pyotr', "sir we heard the tour's off"),
        M('boris', 'boris is wearing the bear costume anyway. boris has made peace with it 🛡️'),
        { choice: [
          { t: 'Wear it anyway. Monday is Elf Day.', fx: { set: { ops_elfday: true }, inc: { ops_morale: 1 } }, go: 'elfday' },
          { t: 'Next time. Promise.', fx: { set: { ops_next_time: true } }, go: 'next' },
          { t: 'Put the bear away, Boris.', go: 'away' },
        ] },
      ],
      elfday: [
        M('anya', 'elf day. it is decreed. i hate this branch. i love this branch ⚡'),
        free('ops', 'ops_costumes'),
      ],
      next: [
        M('boris', 'boris will keep the bear in a safe place. the vault 🛡️'),
        free('ops', 'ops_costumes'),
      ],
      away: [
        M('boris', '…yes boss'),
        M('valentina', 'He folded it very small. He is sitting on it.'),
        free('ops', 'ops_costumes'),
      ],
      x: [free('ops', 'ops_costumes')],
    },
  });

  // the tour itself (when the family arc books the bank: factory_bank)
  scene({
    id: 'ops_factory',
    thread: 'ops',
    ch: 'sat_noon',
    trigger: { on: 'flag', flag: 'factory_bank', delay: 60 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_factory', 'go'),
      go: [
        lock('ops', 'ops_factory'),
        M('pyotr', 'THE SMALL ONE IS HERE'),
        M('pyotr', "he asked if i'm an elf. i said yes. i'm an elf now. this is my life now 🔥"),
        M('ekat', 'Sir, they are in the lobby. Your sister is looking at everything.'),
        { if: (s) => !!F(s).told_tonia, go: 'tonia' },
        { go: 'boris' },
      ],
      tonia: [
        M('ekat', 'Your sister just said "nice elves" to me in a tone I will remember for the rest of my life.'),
        { go: 'boris' },
      ],
      boris: [
        { if: (s) => F(s).ops_headelf === 'boris', go: 'boris_head' },
        M('boris', "the little brother is on boris's shoulders. boris is a mountain. the mountain is happy 🛡️"),
        { go: 'snow' },
      ],
      boris_head: [
        M('boris', 'the head bear has the little brother on his shoulders. he calls boris "mister bear". boris is mister bear now 🛡️🥹'),
        { go: 'snow' },
      ],
      snow: [
        M('lyuba', 'i made it snow in the lobby. he stood in it with his mouth open. happy, i think ❄️'),
        { if: (s) => F(s).ops_headelf === 'valentina', go: 'val_plain' },
        M('valentina', 'He asked why a toy company has a vault. I told him it is where we keep the dreams.'),
        { go: 'anya' },
      ],
      val_plain: [
        M('valentina', 'He asked why a toy company has a vault. I told him it is where we keep the dreams. No mirrors. As ordered.'),
        { go: 'anya' },
      ],
      anya: [
        M('anya', "he wants my hammer. i told him it's a toy. it is not a toy. he's very strong for eight. i am still holding the antlers ⚡"),
        { if: (s) => F(s).ops_headelf === 'kolya', go: 'kolya_door' },
        M('kolya', 'sir i was going to give the tour but i am in the vault!! which way is the lobby 🐣'),
        { go: 'ask' },
      ],
      kolya_door: [
        M('kolya', "i am holding the door!! it's the best door!! nobody is lost!! 🐣"),
        { go: 'ask' },
      ],
      ask: [
        M('ekat', 'Sir. He has a question for the elves. He says it is very important.'),
        M('ekat', '"Is my brother a good boss?"'),
        M('ekat', 'What do we tell him?'),
        { choice: [
          { t: "Tell him the truth: I'm the worst boss in Snezhnaya. 😁", fx: { set: { factory_answer: 'worst' } }, go: 'worst' },
          { t: "Tell him I'm the best brother and the second-best boss.", fx: { set: { factory_answer: 'brother' } }, go: 'brother' },
          { t: 'Tell him the elves get pelmeni every Friday.', fx: { set: { factory_answer: 'pelmeni' } }, go: 'pel' },
          { t: "Tell him whatever you want. Just don't say Signora.", fx: { set: { factory_answer: 'free' } }, go: 'free' },
        ] },
      ],
      worst: [
        M('pyotr', 'WE WILL NOT LIE TO A CHILD'),
        M('boris', 'boris told him boss is the best boss. boris does not lie 🛡️'),
        M('anya', 'we outvoted you, sir. democracy ⚡'),
        { go: 'end' },
      ],
      brother: [
        M('ekat', 'I told him exactly that. He said "who\'s the first-best boss?" I said "the Tsaritsa". He said "is she nice?"'),
        M('ekat', 'I said "she is very cold". He said "like Sir Fang!" and was satisfied.'),
        { go: 'end' },
      ],
      pel: [
        M('pyotr', 'he wants to be an elf now. he asked how old you have to be. i said nine. he is counting the days 🔥'),
        { go: 'end' },
      ],
      free: [
        M('pyotr', 'he asked who signora is. i panicked. i said she\'s a fish'),
        M('valentina', 'He has now met Signora. She glared at him through the glass. He glared back.'),
        M('lyuba', 'he won ❄️'),
        { go: 'end' },
      ],
      end: [
        M('ekat', 'Tour complete. One brother, delighted. One sister, suspicious. Zero weapons seen. Sir, I think we did it.'),
        { fx: { set: { ops_factory_done: true }, inc: { ops_morale: 1 } } },
        free('ops', 'ops_factory'),
      ],
      x: [free('ops', 'ops_factory')],
    },
  });

  // ── 4. Saturday night: Kolya in the Chasm, and "Do we really do Osial?" (ch4 +300 ≈ 22:40) ──
  scene({
    id: 'ops_night4',
    thread: 'ops',
    ch: 'sat_night',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 300 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_night4', 'go'),
      go: [
        lock('ops', 'ops_night4'),
        { if: (s) => !!F(s).pelmeni_promised && !F(s).pelmeni_fri_night, go: 'broken' },
        { go: 'kolya' },
      ],
      broken: [
        M('pyotr', "also sir. friday's pelmeni never came. it's fine. we ate the vending machine"),
        M('anya', 'it was E-11 flavoured'),
        { go: 'kolya' },
      ],
      kolya: [
        M('kolya', "sir. it's kolya"),
        M('kolya', "i'm in the chasm again. it's not a training exercise this time. i followed a sign that said \"liyue branch →\""),
        M('anya', 'the sign was a hilichurl totem, kolya'),
        M('kolya', 'oh'),
        M('kolya', "there's something breathing down here. it's big. it sounds like the sea, but upside down 🐣"),
        { if: (s) => !!F(s).skirk_answered, go: 'skirk' },
        { go: 'boris' },
      ],
      skirk: [
        M('kolya', 'and a lady with a sword walked past me in the dark. she said "Ajax." and kept walking. who is ajax'),
        M('valentina', 'Kolya. Do not follow her.'),
        { go: 'boris' },
      ],
      boris: [
        M('boris', 'boris can go. boris always finds him 🛡️'),
        { choice: [
          { t: 'Boris. Go get him. Take the rope this time.', fx: { set: { kolya_found: 'boris' }, inc: { ops_morale: 1 } }, go: 'k_boris' },
          { t: "Lumine's already down there chasing the Abyss Order. I'll tell her.", if: (s) => !!F(s).gave_abyss_notes, fx: { set: { kolya_found: 'lumine' }, inc: { ops_morale: 1 } }, go: 'k_lumine' },
          { t: "Comrade Lumine owes me a favour. I'll send her.", if: (s) => !F(s).gave_abyss_notes, fx: { set: { kolya_found: 'lumine' }, inc: { ops_morale: 1 } }, go: 'k_lumine2' },
          { t: "He'll find his way out. Builds character.", fx: { set: { kolya_lost: true } }, go: 'k_ignore' },
        ], timeout: 90, onTimeout: 'k_ignore' },
      ],
      k_boris: [
        M('boris', 'boris is going. with rope 🛡️'),
        { wait: 8 },
        M('boris', 'found. three kilometres down. he made a new friend. a different slime 🛡️'),
        M('kolya', 'his name is gerald 2'),
        { go: 'osial' },
      ],
      k_lumine: [
        { wait: 8 },
        M('kolya', 'a blonde girl with a sword just found me. she was ALREADY down here?? she said "tell childe he owes me a fish"'),
        M('kolya', 'and a very small floating girl asked if i had snacks 🐣'),
        { go: 'osial' },
      ],
      k_lumine2: [
        { wait: 8 },
        M('kolya', 'a blonde girl just came down the shaft on a rope. she said "childe sent me. he owes me." 🐣'),
        M('kolya', 'then a floating girl asked if i have snacks. i do not have snacks. she was very disappointed in me'),
        { go: 'osial' },
      ],
      k_ignore: [
        { fx: { set: { kolya_lost: true } } },
        M('kolya', 'ok sir. character. building it 🐣'),
        M('boris', 'boss? 😟'),
        M('boris', 'boss said character. boris will wait. boris does not like it'),
        { go: 'osial' },
      ],
      osial: [
        M('pyotr', "sir. while everyone's here"),
        M('pyotr', 'is it true about tomorrow night. guyun. osial'),
        M('anya', 'signora\'s office sent the roster. all of us. guyun. 22:45. "guard duty"'),
        M('pyotr', 'do we really do osial? some of us have families here now'),
        M('boris', 'boris has a cat in liyue. the cat is family 🛡️'),
        M('lyuba', 'i have the cicins ❄️'),
        M('valentina', 'I have all of you.'),
        { typing: 4, from: 'ekat' },
        { choice: [
          { t: "Honestly? I don't know. It was my idea, and I want it dead.", fx: { set: { ops_honest: 'dead' }, inc: { ops_morale: 1 } }, go: 'honest' },
          { t: "It's Signora's show now. I'm working on it. Trust me.", fx: { set: { ops_honest: 'working' }, inc: { ops_morale: 1 } }, go: 'working' },
          { t: 'Orders are orders.', fx: { set: { ops_orders: true } }, go: 'orders' },
          { t: "Don't worry about it! Everything will be fine 🥰", fx: { set: { ops_honest: 'lie' }, sus: { anya: 1 }, inc: { ops_morale: -1 } }, go: 'fine' },
          { t: '[Leave on read]', silent: true, fx: { set: { ops_honest: 'read' }, inc: { ops_morale: -1 } }, go: 'read' },
        ] },
      ],
      honest: [
        M('pyotr', '…'),
        M('pyotr', 'thank you sir. for not lying to us'),
        M('anya', "that's the most honest thing a harbinger has ever said in this chat ⚡"),
        M('lyuba', 'then we will help you kill it. somehow ❄️'),
        M('valentina', 'I am watching the roster. And the guards.'),
        free('ops', 'ops_night4'),
      ],
      working: [
        M('pyotr', 'we trust you sir 🔥'),
        M('boris', 'boris trusts boss 🛡️'),
        M('ekat', 'Whatever you need, Sir. All of us.'),
        free('ops', 'ops_night4'),
      ],
      orders: [
        M('pyotr', 'yes sir'),
        M('anya', 'understood'),
        M('boris', '…'),
        M('ekat', 'Sir.'),
        free('ops', 'ops_night4'),
      ],
      fine: [
        M('anya', 'sir you have never used that emoji in your life'),
        M('pyotr', '"everything will be fine" is what signora says right before something is not fine'),
        M('valentina', 'I see.'),
        free('ops', 'ops_night4'),
      ],
      read: [
        { wait: 6 },
        M('pyotr', "sir read it. sir didn't answer"),
        M('anya', "that's an answer"),
        free('ops', 'ops_night4'),
      ],
      x: [free('ops', 'ops_night4')],
    },
  });

  // ── 5. Sunday 21:42: Signora's orders, and the better idea (ch6 +120) ──
  scene({
    id: 'ops_osial',
    thread: 'ops',
    ch: 'sun_night',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 120 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_osial', 'go'),
      go: [
        lock('ops', 'ops_osial'),
        M('ekat', 'Sir. Signora\'s orders came in. All Liyue agents to Guyun at 22:45. "Guard duty at the pillars."'),
        { if: (s) => !!F(s).kolya_lost && !F(s).kolya_found, go: 'still_lost' },
        { go: 'branch' },
      ],
      still_lost: [
        M('boris', 'kolya is still down there. since yesterday. boss.'),
        { go: 'branch' },
      ],
      branch: [
        { if: (s) => num(s, 'ops_morale') >= 3, go: 'plan' },
        { go: 'scared' },
      ],
      plan: [
        M('ekat', "Sir. We've been talking."),
        M('ekat', 'Lyuba can freeze the relay on Unit 3. Anya can short the other two. Valentina knows the guard rotation. Pyotr is a distraction. Boris is a door.'),
        M('boris', 'boris is a very good door 🛡️'),
        M('ekat', 'We need one word from you at 22:30, when she asks.'),
        M('anya', 'tell her the liyue branch has a better idea ⚡'),
        { choice: [
          { t: 'Be ready. When I say it, go.', fx: { set: { ops_ready: true } }, go: 'ready' },
          { t: 'Make it look like an accident.', fx: { set: { ops_ready: true, ops_accident: true } }, go: 'accident' },
          { t: "No. Go home. All of you. That's an order.", fx: { set: { ops_sent_home: true } }, go: 'home' },
        ] },
      ],
      ready: [
        M('pyotr', 'READY 🔥'),
        M('lyuba', 'ready ❄️'),
        M('valentina', 'Ready.'),
        { go: 'card' },
      ],
      accident: [
        M('anya', 'an accident. three accidents. in a row. on three pillars. very natural ⚡'),
        M('valentina', 'Accidents are my speciality.'),
        { go: 'card' },
      ],
      home: [
        M('boris', '…yes boss'),
        M('anya', 'sure. home. we are all going home. definitely'),
        { go: 'card' },
      ],
      scared: [
        M('pyotr', 'sir. do we go?'),
        M('anya', "we'll go if you say go. we'll stay if you say stay. we just want you to say it ⚡"),
        { choice: [
          { t: 'Go. Stand at the pillars. Touch nothing.', fx: { set: { ops_guard: true } }, go: 'guard' },
          { t: "Call in sick. All of you. I'll sign it.", fx: { set: { ops_sick: true }, inc: { ops_morale: 1 } }, go: 'sick' },
          { t: 'Do what she says.', fx: { set: { ops_obey: true } }, go: 'obey' },
        ] },
      ],
      guard: [
        M('pyotr', 'touch nothing. yes sir. i will keep my hands in my pockets. my pockets might catch fire'),
        { go: 'card' },
      ],
      sick: [
        M('anya', 'seven sick notes. one signature. beautiful ⚡'),
        M('lyuba', 'i really am a little cold ❄️'),
        M('valentina', 'Signora will notice. Good.'),
        { go: 'card' },
      ],
      obey: [
        M('ekat', 'Yes, Sir.'),
        M('boris', 'boris will go. boris will stand. 🛡️'),
        { go: 'card' },
      ],
      card: [
        { if: (s) => !!F(s).card_frozen, go: 'end' },
        M('ekat', 'And Sir, one more thing. If you report your card lost, Northland freezes it within the minute. Including the corporate wire. I am only saying it out loud.'),
        { choice: [
          { t: 'Do it. Report it lost.', fx: { set: { card_frozen: true, ekat_froze_card: true } }, go: 'froze' },
          { t: 'Not yet.', go: 'end' },
        ] },
      ],
      froze: [
        M('ekat', 'Done, Sir. Card ending 1111, reported lost.'),
        M('anya', 'pantalone is going to have a stroke ⚡'),
        M('pyotr', 'i hope he does. no i don\'t. a small one'),
        { go: 'end' },
      ],
      end: [free('ops', 'ops_osial')],
      x: [free('ops', 'ops_osial')],
    },
  });

  // ── 6. Kolya, from the dark (DM, ch6 +300, if he was left down there) ──
  scene({
    id: 'kolya_dark',
    thread: 'kolya',
    ch: 'sun_night',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 300 },
    when: (s) => alive(s) && !!F(s).kolya_lost && !F(s).kolya_found,
    expire: 'x',
    nodes: {
      start: waitFor('kolya', 'kolya_dark', 'go'),
      go: [
        lock('kolya', 'kolya_dark'),
        { m: "sir. it's kolya. there's no signal for the group. only for you", d: 1.5 },
        { m: "i've been down here since yesterday. i found water. it tastes like the sea. we are very far from the sea" },
        { m: "the dark is humming. the same note as the thing at guyun. like it's listening for something" },
        { if: (s) => !!F(s).skirk_answered, go: 'skirk' },
        { go: 'light' },
      ],
      skirk: [
        { m: 'the lady with the sword came back. she looked at me for a long time. then she said "not you" and left' },
        { go: 'light' },
      ],
      light: [
        { m: "there's a light down the tunnel. should i go toward the light 🐣" },
        { choice: [
          { t: 'NOT toward the light. Stay where you are. Boris is coming.', fx: { set: { kolya_found: 'boris_late' }, inc: { ops_morale: 1 } }, go: 'stay' },
          { t: "Stay put. Lumine's in the Chasm tonight. I'll send her.", if: (s) => !!F(s).gave_abyss_notes, fx: { set: { kolya_found: 'lumine_late' }, inc: { ops_morale: 1 } }, go: 'lumine' },
          { t: 'Follow the water uphill. Water always finds the sea.', fx: { set: { kolya_found: 'self' } }, go: 'water' },
        ], timeout: 90, onTimeout: 'lantern' },
      ],
      stay: [
        { m: 'staying. very still. like valentina' },
        { m: 'boris is coming 🛡️', th: 'ops', from: 'boris' },
        { wait: 10 },
        { m: 'boris found me. he cried a little. i cried a lot 🐣' },
        free('kolya', 'kolya_dark'),
      ],
      lumine: [
        { wait: 10 },
        { m: 'the blonde girl found me!! she said "of course it\'s you". the floating one gave me half a sandwich 🐣' },
        free('kolya', 'kolya_dark'),
      ],
      water: [
        { m: 'following the water' },
        { wait: 10 },
        { m: "sir i came out somewhere wet and windy. there are big stone pillars. i think i'm at guyun?? the tunnels go UNDER the sea??" },
        free('kolya', 'kolya_dark'),
      ],
      lantern: [
        { fx: { set: { kolya_found: 'hilichurls' } } },
        { m: 'going toward the light' },
        { wait: 8 },
        { m: "it was a lantern. a hilichurl lantern. they're having a party. they gave me a mushroom. i think i live here now 🐣" },
        free('kolya', 'kolya_dark'),
      ],
      x: [free('kolya', 'kolya_dark')],
    },
  });

  // ── 7. The better idea, live from Guyun (after "The Liyue Branch has a better idea.") ──
  scene({
    id: 'ops_sabotage_run',
    thread: 'ops',
    ch: 'sun_night',
    trigger: { on: 'flag', flag: 'ops_sabotage', delay: 8 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_sabotage_run', 'go'),
      go: [
        lock('ops', 'ops_sabotage_run'),
        M('ekat', 'He said it. GO.'),
        { if: (s) => !!F(s).ops_sent_home, go: 'home' },
        { go: 'run' },
      ],
      home: [
        M('boris', 'boss, we did not go home 🛡️'),
        { go: 'run' },
      ],
      run: [
        M('valentina', 'Guards rotate at 22:40. Two on G-4. One on G-9. None on G-17. I see everything.'),
        M('pyotr', "I'M THE DISTRACTION 🔥🔥🔥 I'M VERY DISTRACTING"),
        M('anya', "he really is. three guards are chasing him around G-4. he's on fire. on purpose this time"),
        M('anya', 'G-4 shorted ⚡'),
        M('anya', 'G-9 shorted. that one was fun ⚡⚡'),
        M('boris', 'boris carried a guard into the sea. gently. he can swim. boris checked 🛡️'),
        { if: (s) => !!F(s).kolya_found && F(s).kolya_found !== 'self', go: 'flash' },
        { if: (s) => F(s).kolya_found === 'self' || !!F(s).kolya_lost, go: 'tunnel' },
        { go: 'flash' },
      ],
      flash: [
        M('kolya', "i'm holding the flashlight!! i'm the flashlight guy 🐣"),
        { go: 'unit3' },
      ],
      tunnel: [
        M('kolya', "SIR. i came out of the chasm and i'm at GUYUN?? the tunnels go under the sea??? i'm standing next to unit 3 🐣"),
        { if: (s) => !F(s).kolya_found, go: 'tunnel_found' },
        { go: 'unit3' },
      ],
      tunnel_found: [
        { fx: { set: { kolya_found: 'guyun' } } },
        { go: 'unit3' },
      ],
      unit3: [
        M('lyuba', 'i am on G-17. unit 3. it is humming. i am going to make it stop humming ❄️'),
        { wait: 5 },
        M('lyuba', '', { img: 'p_unit3' }),
        M('lyuba', 'unit 3. frozen solid. the cicins helped. the sea stopped humming ❄️'),
        M('valentina', "Sir. Signora's second team is on the water. Four boats. Coming for G-17."),
        { choice: [
          { t: 'Get out. Now. Everyone. Nobody stays behind.', fx: { set: { ops_escaped: true } }, go: 'out' },
          { t: 'Hold the line. Nobody touches my branch.', fx: { set: { ops_identified: true } }, go: 'hold' },
          { t: 'Lyuba. Freeze the water around the boats.', fx: { set: { ops_escaped: true, ops_icefield: true } }, go: 'ice' },
        ], timeout: 60, onTimeout: 'hold' },
      ],
      out: [
        M('pyotr', 'moving!!'),
        M('anya', 'all out. all seven. kolya too'),
        M('ekat', 'Everyone is in the van. Valentina is driving. Nobody saw our faces.'),
        free('ops', 'ops_sabotage_run'),
      ],
      hold: [
        { fx: { set: { ops_identified: true } } },
        M('boris', 'HOLDING 🛡️'),
        M('anya', 'they saw us. they saw all of us. worth it ⚡'),
        M('ekat', 'Sir, they have our names now. It does not matter. Unit 3 is ice.'),
        free('ops', 'ops_sabotage_run'),
      ],
      ice: [
        M('lyuba', 'freezing ❄️'),
        { wait: 5 },
        M('valentina', 'The boats are stuck. In the sea. In October. They are very confused.'),
        M('pyotr', 'LYUBA YOU ABSOLUTE LEGEND 🔥'),
        M('ekat', 'Everyone is in the van. Nobody saw our faces.'),
        free('ops', 'ops_sabotage_run'),
      ],
      x: [free('ops', 'ops_sabotage_run')],
    },
  });

  // ── 8. Sunday 23:55: back at the branch (ch6 +500) ───────────────
  scene({
    id: 'ops_night6',
    thread: 'ops',
    ch: 'sun_night',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 500 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_night6', 'go'),
      go: [
        lock('ops', 'ops_night6'),
        { if: (s) => !!F(s).osial_sent, go: 'storm' },
        { if: stopped, go: 'calm' },
        { go: 'scape' },
      ],
      storm: [
        M('valentina', 'Sir. The sea is wrong.'),
        M('anya', '', { img: 'p_storm_guyun' }),
        M('pyotr', "we're at the branch. the windows are shaking. lyuba is crying. the tears are ice"),
        M('lyuba', 'the cicins are hiding in my coat ❄️'),
        M('boris', 'boris is holding the aquarium so it does not fall 🛡️'),
        { choice: [
          { t: 'Stay inside. All of you. Away from the windows.', fx: { set: { ops_storm: 'inside' } }, go: 'inside' },
          { t: "I'm sorry. This is my fault.", fx: { set: { ops_storm: 'sorry' }, inc: { ops_morale: 1 } }, go: 'sorry' },
          { t: 'It\'ll pass. It always passes.', fx: { set: { ops_storm: 'pass' } }, go: 'pass' },
        ] },
      ],
      inside: [
        M('ekat', 'Yes, Sir. We are in the vault. It is the only room without windows. Valentina says it is cosy.'),
        free('ops', 'ops_night6'),
      ],
      sorry: [
        M('anya', "it's signora's fault. you tried. we saw you try"),
        M('boris', 'boss is not the sea. boss is boss 🛡️'),
        free('ops', 'ops_night6'),
      ],
      pass: [
        M('valentina', 'It is not passing, Sir.'),
        free('ops', 'ops_night6'),
      ],
      calm: [
        M('valentina', 'Sir. The sea is flat. Flat like a plate.'),
        { if: (s) => !!F(s).ops_sabotage, go: 'calm_us' },
        { if: (s) => !!F(s).ops_sick, go: 'calm_sick' },
        M('pyotr', 'we stood at the pillars like statues and NOTHING HAPPENED. the sea just. didn\'t'),
        { go: 'calm2' },
      ],
      calm_us: [
        M('pyotr', 'WE DID IT. THE LIYUE BRANCH DID IT 🔥🔥🔥'),
        M('lyuba', 'unit 3 is a very expensive ice cube now ❄️'),
        { go: 'calm2' },
      ],
      calm_sick: [
        M('pyotr', 'we were home with soup. the sea did nothing. good sea. good soup'),
        { go: 'calm2' },
      ],
      calm2: [
        M('boris', 'boris is very happy. boris is going home to his cat 🛡️'),
        { choice: [
          { t: 'Pelmeni on me. Everything on me. 😁', fx: { set: { ops_calm: 'feast' } }, go: 'feast' },
          { t: 'Good work, comrades.', fx: { set: { ops_calm: 'comrades' } }, go: 'comrades' },
          { t: "Go home and sleep. That's an order.", fx: { set: { ops_calm: 'sleep' } }, go: 'sleep' },
        ] },
      ],
      feast: [
        M('pyotr', 'SIR 😭🔥'),
        { if: (s) => !!F(s).card_frozen, go: 'feast_frozen' },
        M('anya', 'ordering everything. i mean everything ⚡'),
        free('ops', 'ops_night6'),
      ],
      feast_frozen: [
        M('anya', 'the card is frozen, pyotr'),
        M('pyotr', 'then i will pay. on behalf of sir. that is how loyalty works 🔥'),
        free('ops', 'ops_night6'),
      ],
      comrades: [
        M('anya', '"comrades." he called us comrades. i\'m putting it on the wall ⚡'),
        M('ekat', 'Goodnight, Sir.'),
        free('ops', 'ops_night6'),
      ],
      sleep: [
        M('lyuba', 'yes Sir. goodnight Sir ❄️'),
        M('boris', 'goodnight boss 🛡️'),
        free('ops', 'ops_night6'),
      ],
      scape: [
        M('ekat', 'Sir. Signora\'s memo just arrived. It has your name on it. Sixty pages.'),
        M('anya', 'the sea boiled for eleven minutes and then lay down again. like it got bored'),
        M('pyotr', 'they\'re saying it was you. on the radio. "a Northland executive"'),
        M('boris', 'we know it was not you, boss 🛡️'),
        { choice: [
          { t: 'Let them say it.', fx: { set: { ops_scape: 'let' } }, go: 'let' },
          { t: 'It WAS me. I pitched it. I own that.', fx: { set: { ops_scape: 'own' }, inc: { ops_morale: 1 } }, go: 'own' },
          { t: '[Say nothing]', silent: true, fx: { set: { ops_scape: 'silent' } }, go: 'silent' },
        ] },
      ],
      let: [
        M('valentina', 'Sir. I will remember who says it.'),
        free('ops', 'ops_night6'),
      ],
      own: [
        M('anya', 'you pitched it. she pulled the trigger. we know the difference ⚡'),
        M('ekat', 'We all know the difference, Sir.'),
        free('ops', 'ops_night6'),
      ],
      silent: [
        M('pyotr', "sir's not answering. sir's sad. nobody say anything stupid"),
        M('kolya', 'hi 🐣'),
        M('anya', 'kolya'),
        free('ops', 'ops_night6'),
      ],
      x: [free('ops', 'ops_night6')],
    },
  });

  // ── 9. Monday (ch7 +300 ≈ 10:25) ─────────────────────────────────
  scene({
    id: 'ops_monday',
    thread: 'ops',
    ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 300 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ops', 'ops_monday', 'go'),
      go: [
        lock('ops', 'ops_monday'),
        { if: (s) => num(s, 'ops_morale') <= -1, go: 'mutiny' },
        { if: (s) => !!F(s).defected, go: 'defect' },
        { if: recalled, go: 'recall' },
        { go: 'stay' },
      ],
      mutiny: [
        M('anya', "Sir. We've talked."),
        M('anya', "we'd like a transfer. all of us. fontaine. sumeru. anywhere"),
        M('boris', 'boris is sorry. boris liked the fish 🛡️'),
        { choice: [
          { t: 'Fine. Go.', fx: { set: { ops_last: 'go' } }, go: 'm_go' },
          { t: 'Wait. Give me one more week. I owe you one.', fx: { set: { ops_last: 'week' }, inc: { ops_morale: 1 } }, go: 'm_week' },
        ] },
      ],
      m_go: [
        M('ekat', 'I will draft the transfers, Sir.'),
        free('ops', 'ops_monday'),
      ],
      m_week: [
        M('anya', '…one week. and pelmeni'),
        M('pyotr', 'he said "I owe you" 🔥'),
        free('ops', 'ops_monday'),
      ],
      defect: [
        M('ekat', 'Sir. Valentina says you resigned. Is it true?'),
        M('pyotr', 'can we come?? 🔥'),
        M('boris', 'boris will carry the aquarium 🛡️'),
        M('anya', "i'll unionise wherever we go ⚡"),
        { choice: [
          { t: 'Stay. Look after each other. And the fish.', fx: { set: { ops_last: 'stay' } }, go: 'd_stay' },
          { t: 'Ask me again in a month. 😁', fx: { set: { ops_last: 'month' } }, go: 'd_month' },
        ] },
      ],
      d_stay: [
        M('lyuba', 'we will look after the fish. i will not freeze them. i promise ❄️'),
        M('valentina', 'We will look after each other, Sir. I will be watching.'),
        free('ops', 'ops_monday'),
      ],
      d_month: [
        M('pyotr', 'I AM SETTING A REMINDER 🔥'),
        free('ops', 'ops_monday'),
      ],
      recall: [
        M('pyotr', 'Sir. Is it true? The 18:00 ferry?'),
        M('ekat', 'We made you a card. Lyuba froze it so it lasts the trip.'),
        M('lyuba', '❄️💌'),
        M('boris', 'boris will carry your bags to the pier. all of them. at once 🛡️'),
        { choice: [
          { t: 'Look after the fish. All of them. Even Signora.', fx: { set: { ops_last: 'fish' } }, go: 'r_fish' },
          { t: "I'll be back. Keep my seat warm. Lyuba, not that warm.", fx: { set: { ops_last: 'back' } }, go: 'r_back' },
          { t: '[Say nothing]', silent: true, fx: { set: { ops_last: 'silent' } }, go: 'r_silent' },
        ] },
      ],
      r_fish: [
        M('valentina', 'Even Signora. She will miss you. She will never show it. Like the other one.'),
        free('ops', 'ops_monday'),
      ],
      r_back: [
        M('lyuba', 'i will keep it room temperature ❄️'),
        M('anya', "come back, sir. who else is going to throw us across the lobby ⚡"),
        free('ops', 'ops_monday'),
      ],
      r_silent: [
        M('boris', 'boss is sad. boris is sad. boris will still carry the bags 🛡️'),
        free('ops', 'ops_monday'),
      ],
      stay: [
        M('pyotr', 'Sir. Monday. Nothing is on fire 🔥'),
        M('pyotr', "(that's just how i sign)"),
        { if: (s) => !!F(s).ops_sabotage, go: 'union' },
        { go: 'stay2' },
      ],
      union: [
        M('ekat', "Sir. We've formed a union. The Union of Comrades. You are the president. Anya wrote the constitution."),
        M('anya', 'article one: nobody wakes the sea. article two: pelmeni on fridays ⚡'),
        { if: (s) => !!F(s).ops_identified, go: 'papers' },
        { go: 'stay2' },
      ],
      papers: [
        M('pyotr', "signora's office sent us all transfer papers this morning. to snezhnaya. we tore them up. valentina ate one"),
        M('valentina', 'It tasted of paperwork.'),
        { go: 'stay2' },
      ],
      stay2: [
        { if: (s) => !!F(s).factory_bank, go: 'drawing' },
        { go: 'end' },
      ],
      drawing: [
        M('lyuba', 'also the small one sent a drawing. it is all of us as elves. boris is the biggest. it is on the fridge ❄️'),
        { go: 'end' },
      ],
      end: [
        { choice: [
          { t: 'Best branch in Snezhnaya. 🐟', fx: { set: { ops_last: 'best' } }, go: 'best' },
          { t: 'Back to work, comrades. 😁', fx: { set: { ops_last: 'work' } }, go: 'work' },
        ] },
      ],
      best: [
        M('boris', '🛡️🥹'),
        free('ops', 'ops_monday'),
      ],
      work: [
        M('anya', 'ugh. fine. ⚡'),
        free('ops', 'ops_monday'),
      ],
      x: [free('ops', 'ops_monday')],
    },
  });
})();
