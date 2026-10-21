/* Live scenes — Jin Ling (`jl`): Sandu in the koi pond, Fairy, the birthday group `bday`, Lotus Leap, Find My beeps.
   "Sunday at Lotus Pier" edition: every beat here points at Sunday 6:30 p.m. (docs/SUNDAY.md, docs/sunday/b.md).
   Table flags set here: bday_planned, cake_ok, gift_bell, bell_ready, venue_lp, party_moved, fairy_inside,
   car_cover, fairy_taken (+ jl_knows… via Fairy's New Favorite → early_return). Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;
  // One scene with choices per thread at a time: poll until the thread is free, then hold it.
  // Night scenes give up quietly once the night is over (an 'off' node is added automatically).
  const waitFor = (k, next, self, anytime) => [
    ...(anytime ? [] : [{ if: (s) => !!F(s).night_done, go: 'off' }]),
    { if: (s) => !F(s)['busy_' + k], go: next },
    { wait: 6 },
    { go: self || 'start' },
  ];
  const usesOff = (nodes) => Object.keys(nodes).some((n) => (nodes[n] || []).some((st) => st && st.go === 'off'));
  const scene = (def) => {
    if (def.nodes && !def.nodes.off && usesOff(def.nodes)) def.nodes.off = [{ end: true }];
    return S.scene(def);
  };
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });

  // ── Sunday helpers ───────────────────────────────────────────────
  const live = () => S.view();
  const TBL = (s) => { try { return JC.sunday && JC.sunday.table ? JC.sunday.table(s || live()) : null; } catch (e) { return null; } };
  const seat = (s, k) => { const t = TBL(s); return t ? t.seats[k].state : 'no'; };
  // A message whose text is computed from the state when it is sent (the getter runs at typing time).
  function say(fn, o) {
    const st = Object.assign({}, o || {});
    Object.defineProperty(st, 'm', { enumerable: true, get: () => { let t = ''; try { t = fn(live()); } catch (e) { /* fallback */ } return t ? String(t) : '…'; } });
    return st;
  }
  // Start a consequence scene another writer owns (docs/SUNDAY.md "Consequences"); warn, don't fail, while it is unwritten.
  const goOn = (id) => ({ run: (api) => { if (api.story.defs.scenes[id]) api.story.start(id); else console.warn('[sunday] consequence scene missing:', id); } });

  /** Sizhui's seating plan, read from JC.sunday.table(s) (docs/SUNDAY.md beat 9). */
  function seatingPlan(s, title) {
    const t = TBL(s);
    if (!t) return 'Seating plan to follow!';
    const st = (k) => t.seats[k].state;
    const L = [title || 'Seating plan for Sunday (draft 1):'];
    L.push('• Head of the table: Sect Leader Jiang');
    L.push(st('jl') === 'late' ? '• His right: Jin Ling (late, after the Koi Tower thing, if he escapes)' : '• His right: Jin Ling');
    if (st('wwx') === 'yes') L.push('• His left: Mr. Wei and Hanguang-jun. The soup goes in the middle');
    else if (st('wwx') === 'outside') L.push('• His left: (I left it empty. I hope that is all right)');
    else L.push('• His left: empty, for now');
    if (st('lxc') === 'yes') L.push('• Zewu-jun, across from you');
    else if (st('lxc') === 'late') L.push('• Zewu-jun: tea, after dinner?');
    if (st('wn') === 'yes') L.push('• Wen Ning, inside, not in the van');
    else if (st('wn') === 'drives') L.push('• Wen Ning: driving us. He says he will wait in the van. Jingyi says no');
    if (st('nhs') === 'yes') L.push('• Mr. Nie (phones in the basket)');
    if (st('sz') === 'yes') L.push('• Jingyi and me, at the end, near the kitchen');
    L.push(st('fairy') === 'in' ? '• Fairy: under the table' : '• Fairy: the garden (Rule 3)');
    L.push('• And one bowl at the end, for his mother. Mr. Wei asked. I think you would have anyway.');
    return L.join('\n');
  }
  JC.sundayB = Object.assign(JC.sundayB || {}, { seatingPlan });

  // ── 1. "jiujiu" ×3 — Sandu is in the koi pond (~00:03) ──────────
  scene({
    id: 'jl_car',
    thread: 'jl',
    trigger: { on: 'unlock', delay: 200 },
    when: night,
    nodes: {
      start: waitFor('jl', 'crash'),
      crash: [
        lock('jl'),
        { m: 'jiujiu', d: 0.8 },
        { m: 'jiujiu', d: 0.6 },
        { m: 'JIUJIU', d: 0.5 },
        { typing: 3 },
        { m: 'ok dont be mad' },
        { m: 'i know u said nobody touches sandu' },
        { m: 'i touched sandu' },
        { m: 'u left ur coat at the coat check when u ran off the balcony. the spare key was in the pocket' },
        { m: 'i wanted to practice for my test' },
        { m: 'i parked it' },
        { m: 'in the koi pond', img: 'p_fairy_roof' },
        { fx: { set: { car_known: true } } },
        { m: "fairy is on the roof. she won't come down" },
        { m: 'THE KOI ARE FINE. i counted. there were 23 and there are still 23' },
        { m: "i'm fine too. if u care" },
        { m: 'pls dont break my legs i need them for the test' },
        { choice: [
            { t: "I'm going to break both your legs.", fx: { aff: { jl: 1 } }, go: 'yell' },
            { t: 'Are you hurt?', fx: { aff: { jl: 2 } }, go: 'hurt' },
            { t: "It's okay sweetie, cars can be replaced 🥰", fx: { sus: { jl: 4 } }, go: 'sweet' },
            { t: 'Tell no one. Blame the valet.', fx: { set: { car_cover: true } }, go: 'cover' },
          ] },
      ],
      yell: [
        { m: 'ok good ur normal' },
        { m: 'i thought u were gonna be weird about it. u were weird at the gala' },
        { go: 'what_now' },
      ],
      hurt: [
        { m: 'no' },
        { m: "my shoes are wet. that's it" },
        { m: '…' },
        { m: 'thanks for asking i guess' },
        { m: 'ur still gonna break my legs right' },
        { choice: [
            { t: 'Both of them. After the test.', fx: { aff: { jl: 1 } }, go: 'legs' },
            { t: 'No.', go: 'no_legs' },
          ] },
      ],
      legs: [{ m: 'ok. fair' }, { go: 'what_now' }],
      no_legs: [{ m: "ok now i'm scared" }, { go: 'what_now' }],
      sweet: [
        { m: '??????' },
        { m: 'sweetie???' },
        { m: 'jiujiu did u hit ur head on the balcony' },
        { m: 'is this a lan xichen thing. sizhui says lan xichen makes people weird' },
        { go: 'what_now' },
      ],
      cover: [
        { m: 'wait for real??' },
        { m: "jiujiu u wouldn't even let the valet PARK it" },
        { m: '…ok actually that makes it believable. "the valet was mad and took revenge"' },
        { m: "but he's like 60 and he gave fairy a biscuit" },
        { choice: [
            { t: '…Fine. Tell them it was you.', fx: { set: { car_cover: false }, aff: { jl: 1 } }, go: 'cover_undo' },
            { t: 'Not my problem.', go: 'cover_keep' },
          ] },
      ],
      cover_undo: [
        { m: 'ugh' },
        { m: 'FINE. ur right' },
        { m: "don't tell anyone u were right" },
        { go: 'what_now' },
      ],
      cover_keep: [
        { log: 'Told A-Ling to blame the valet', once: 'jl_cover' },
        { m: "jiujiu that's so cold" },
        { m: "ok wtv. i'm putting on sunglasses. at night. no one will know it was me" },
        { go: 'what_now' },
      ],
      what_now: [
        { m: 'ok so what do i DO' },
        { m: 'people r filming. the jin security guy is on the phone and he keeps saying "young master" in a scary voice' },
        { choice: [
            { t: 'Call Old Huang. He knows people in Lanling.', fx: { set: { tow_huang: true } }, go: 'huang' },
            { t: "Wen Ning's still in Lanling. He has a van. Ask him.", fx: { set: { wn_asked: true } }, go: 'wn' },
            { t: "Leave it. It's not going anywhere.", go: 'leave' },
            { t: 'Get your security to deal with it.', go: 'security' },
          ] },
      ],
      huang: [
        { m: "old huang?? it's midnight" },
        { m: 'ok calling' },
        { wait: 6 },
        { m: 'he said "Received" and "thumbs up" out loud and hung up' },
        { m: 'is that good' },
        { go: 'calm' },
      ],
      wn: [
        { m: 'WEN NING???' },
        { m: 'the guy u glare at every new year??' },
        { m: "ok. ok fine. he's literally in the parking lot. wei wuxian made him wait to drive them home" },
        { m: 'he says he has a tow rope. why does he have a tow rope' },
        { m: "he's going to call u. he's scared to. but he's going to" },
        { call: 'call_wn', delay: 25 },
        { go: 'calm' },
      ],
      leave: [
        { m: 'LEAVE IT??' },
        { m: "it's SANDU" },
        { m: 'u wash it by hand every sunday. u gave it a NAME' },
        { choice: [
            { t: 'Fine. Call Old Huang.', fx: { set: { tow_huang: true } }, go: 'huang' },
            { t: 'Fine. Ask Wen Ning.', fx: { set: { wn_asked: true } }, go: 'wn' },
            { t: 'I said leave it.', fx: { sus: { jl: 1 } }, go: 'left_it' },
          ] },
      ],
      left_it: [
        { m: 'ok' },
        { m: "ur so weird tonight. u'd kill me for a scratch on it yesterday" },
        { m: 'a koi just swam into the exhaust. i think it lives there now' },
        { go: 'calm' },
      ],
      security: [
        { m: 'the security guy is literally filming it for the jin staff group chat' },
        { m: "he says it's the best thing that's happened at koi tower since 2015" },
        { m: 'jiujiu pls' },
        { choice: [
            { t: 'Fine. Call Old Huang.', fx: { set: { tow_huang: true } }, go: 'huang' },
            { t: 'Fine. Ask Wen Ning.', fx: { set: { wn_asked: true } }, go: 'wn' },
          ] },
      ],
      calm: [
        { m: 'ok' },
        { m: "ok i'm breathing" },
        { m: "fairy is still on the roof. she's very proud of herself" },
        { go: 'board' },
      ],
      // The threat that hangs over Sunday: the Jin board wants the 18th at Koi Tower, with press.
      board: [
        { m: 'also' },
        { m: 'is this going to ruin sunday' },
        { m: 'the jin board already wants a "press moment" for my 18th. at koi tower. with SPEECHES' },
        { m: 'if a car in a pond gets out they will say i need "image management"' },
        { choice: [
            { t: 'Sunday is at Lotus Pier. Nobody moves it.', fx: { aff: { jl: 1 } }, go: 'b_lp' },
            { t: "Then don't put any more cars in ponds.", go: 'b_ponds' },
            { t: 'Nobody will know it was you.', if: (s) => !!F(s).car_cover, go: 'b_cover' },
          ] },
      ],
      b_lp: [
        { m: '…ok' },
        { m: 'ur scary when u say it like that. good scary' },
        { go: 'end' },
      ],
      b_ponds: [{ m: 'wow. ok. noted. GOT IT' }, { m: 'no more ponds' }, { go: 'end' }],
      b_cover: [
        { m: 'the valet will know' },
        { m: "he's still standing by the pond jiujiu. he looks sad. he keeps patting his pockets for biscuits" },
        { choice: [
            { t: '…Fine. Go and tell him it was you.', fx: { set: { car_cover: false }, aff: { jl: 1 } }, go: 'b_own' },
            { t: 'Sunglasses.', go: 'b_shades' },
          ] },
      ],
      b_own: [
        { log: 'Made A-Ling go and own up to the valet before anyone posted it', once: 'jl_own' },
        { hint: 'A-Ling did the right thing.' },
        { m: 'UGH' },
        { m: 'ok' },
        { wait: 10 },
        { m: 'i told him. he said "young master, i know. i saw you." and gave fairy another biscuit' },
        { m: "i feel like i'm 6. in a good way. no in a bad way. both" },
        { go: 'end' },
      ],
      b_shades: [{ m: '😎' }, { m: "ok. it's dark. no one can see anything. including me" }, { go: 'end' }],
      end: [free('jl')],
    },
  });

  // ── 2. Fairy needs somewhere to sleep ────────────────────────────
  scene({
    id: 'jl_fairy',
    thread: 'jl',
    trigger: { on: 'scene', scene: 'jl_car', delay: 140 },
    when: night,
    nodes: {
      start: waitFor('jl', 'wet'),
      wet: [
        lock('jl'),
        { m: 'ok update' },
        { if: (s) => F(s).tow_huang || (F(s).wn_asked && !F(s).wn_declined), go: 'towing', else: 'still' },
      ],
      towing: [{ m: 'someone is coming for the car' }, { go: 'fairy' }],
      still: [{ m: 'the car is still in the pond. the koi have accepted it as one of their own' }, { go: 'fairy' }],
      fairy: [
        { m: 'but' },
        { m: 'fairy finally jumped off the roof. into the pond. on purpose' },
        { m: 'and now shes soaked and the night manager wont let her inside. he said "not on the carpet"' },
        { m: "it's a GOLD carpet jiujiu. it's ugly. she would improve it" },
        { m: 'can she stay with u tonight' },
        { m: 'i mean. wtv. if u want' },
        { choice: [
            { t: 'Tell the night manager whose dog she is.', fx: { aff: { jl: 1 } }, go: 'manager' },
            { t: "I'll come get her.", go: 'come' },
            { t: "She's your dog. Figure it out.", go: 'figure' },
            { t: "Aww poor baby!! Bring her to me, I'll give her a bubble bath 🛁", fx: { sus: { jl: 4 } }, go: 'bath' },
          ] },
      ],
      manager: [
        { m: 'LMAO' },
        { m: 'ok' },
        { wait: 25 },
        { m: 'i told him she belongs to jiang wanyin of yunmeng' },
        { m: 'he went white and got her a towel' },
        { m: 'a GOLD towel', img: 'p_jl_selfie_gala' },
        { m: "she's on the carpet now. she's rolling on it. best night of her life" },
        { go: 'done' },
      ],
      come: [
        { m: 'rly??' },
        { m: "ok. east gate. i'm the one in a tux holding a wet dog" },
        { m: 'hurry she smells like pond' },
        { choice: [
            { t: 'On my way.', label: 'On my way. [Go and meet him]', go: 'go_meet' },
            { t: '…On second thought, ask the doorman for towels.', fx: { sus: { jl: 1 } }, go: 'second' },
          ] },
      ],
      go_meet: [
        { fx: { set: { fairy_taken: true, fairy_where: 'gate' } } },
        { m: 'ok!!!' },
        { m: "she's wagging. she knows ur coming" },
        free('jl'),
        { start: 'fairy_meet' },
      ],
      second: [
        { m: 'ok make up ur mind old man' },
        { m: 'fine. the doorman has towels. he also has a biscuit. fairy loves him now. traitor' },
        { go: 'done' },
      ],
      figure: [
        { m: 'ugh' },
        { m: "fine. sizhui says she can sleep in his car. he's here. he's always here" },
        { m: "she's going to destroy his seats. he says that's ok. he's too nice. it's annoying" },
        { go: 'done' },
      ],
      bath: [
        { m: 'a BATH??' },
        { m: 'she HATES baths. u KNOW she hates baths. she bit the groomer in 2023' },
        { m: 'who taught u "bubble bath"' },
        { m: '…' },
        { m: "wtv. she's not getting a bath. but she misses u. where r u" },
        { choice: [
            { t: 'Jinxing Road 27.', label: 'Jinxing Road 27. [Send your own address]', fx: { sus: { jl: 2 } }, go: 'address' },
            { t: 'Never mind. Ask the doorman for towels.', go: 'second' },
          ] },
      ],
      address: [
        { m: 'jinxing road?? whose house is that' },
        { m: "wtv. fairy doesn't care. sizhui is driving us. omw" },
        { fx: { set: { fairy_taken: true, fairy_where: 'home' } } },
        free('jl'),
        { start: 'fairy_meet' },
      ],
      done: [
        { fx: { set: { fairy_ok: true } } },
        { if: (s) => !!F(s).fairy_inside, go: 'end' },
        { m: 'also. sunday' },
        { m: "she's coming. she's family" },
        { m: "if anyone says she has to stay in the garden i'm staying in the garden too" },
        { choice: [
            { t: 'She can come in.', fx: { set: { fairy_inside: true }, aff: { jl: 1 } }, go: 'in' },
            { t: 'Garden. She smells like pond.', go: 'garden' },
            { t: "We'll see.", go: 'see' },
          ] },
      ],
      in: [
        { log: 'Promised A-Ling that Fairy can come inside on Sunday', once: 'fairy_inside' },
        { hint: 'Fairy is welcome inside on Sunday.' },
        { m: '!!!' },
        { m: "i'm telling her. she's wagging. she doesn't know why but she's wagging" },
        { go: 'end' },
      ],
      garden: [{ m: "she'll be dry by sunday. probably" }, { m: 'mostly' }, { go: 'end' }],
      see: [{ m: '"we\'ll see"' }, { m: "tang mei says that means no. i say it means u haven't decided to say yes yet" }, { go: 'end' }],
      end: [free('jl')],
    },
  });

  // Fairy's New Favorite: a teenager in a tuxedo, a soaking wet dog, and you. Jin Ling knows now; he takes the
  // phone, keeps the secret till breakfast, and wants you at his birthday → early_return (writer C).
  scene({
    id: 'fairy_meet',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        lock('jl'),
        { wait: 30 },
        { m: 'here' },
        { m: 'where r u' },
        { wait: 10 },
        { m: 'wait' },
        { m: 'who r u' },
        { m: "why do u have jiujiu's phone. i can SEE it. it's the purple case" },
        { m: "fairy stop. FAIRY. she's licking u. she never licks anyone except jiujiu" },
        { wait: 5 },
        { time: '+6m', card: 'Jin Ling looks at the purple phone, then at you, then at Fairy, who is trying very hard to climb into your arms. “She bit the groomer,” he says slowly. “She bit a Lan.” You tell him about the taxi. He listens with his whole face, the way his uncle never does, and then he holds out his hand.' },
        { fx: { set: { jl_knows: true, told_truth: true, returned_early: true, returned_how: 'fairy', fairy_taken: true } } },
        { log: 'Met A-Ling and a soaking wet Fairy at Koi Tower, told him the truth and gave him the phone', once: 'fairy_meet' },
        { hint: 'A-Ling knows.' },
        free('jl'),
        goOn('early_return'),
      ],
    },
  });

  // ── 3. The birthday group: cake, venue, gift, the box, Rule 3, the seating plan ─
  scene({
    id: 'bday_plan',
    thread: 'bday',
    trigger: { on: 'unlock', delay: 900 },
    when: night,
    nodes: {
      start: waitFor('bday', 'plan'),
      plan: [
        lock('bday'),
        { m: 'Good evening, everyone. Sorry for the late hour.', from: 'sz' },
        { m: 'Since Sect Leader Jiang is awake, may we finalize Sunday? Cake, venue, gift. In that order.', from: 'sz' },
        { m: 'MR JIANG', from: 'jy' },
        { if: (s) => !!F(s).scandal && !F(s).scandal_fixed, go: 'trending' },
        { if: (s) => F(s).car_known, go: 'pond', else: 'cake' },
      ],
      trending: [
        { m: 'MR JIANG UR FAMILY IS TRENDING 💀💀💀', from: 'jy' },
        { m: 'I know nothing!! About any hashtag!! 🙈', from: 'nhs' },
        { m: 'Then it matters even more that Sunday is decided tonight.', from: 'sz' },
        { go: 'cake' },
      ],
      pond: [
        { m: 'is it true jin ling parked sandu in the koi pond 💀💀💀', from: 'jy' },
        { m: 'A little fish told me 🐟 hehe~', from: 'nhs' },
        { m: 'Is everyone all right? Sorry. Is the car all right? Sorry.', from: 'wn' },
        { go: 'cake' },
      ],
      cake: [
        { m: "Cake first. Jin's Cakes sent the design: lotus seed paste, like Mr. Wei said. Or they can do chocolate.", from: 'sz', img: 'p_cake_lotus' },
        { choice: [
            { t: 'Lotus seed paste.', fx: { set: { cake_ok: true } }, go: 'cake_ok' },
            { t: 'Chocolate. Kids love chocolate.', fx: { sus: { sz: 2, jy: 1 } }, go: 'cake_choc' },
            { t: "Whatever's easiest.", fx: { sus: { sz: 1 } }, go: 'cake_easy' },
          ] },
      ],
      cake_ok: [
        { m: 'Lotus seed paste. Wonderful.', from: 'sz' },
        { m: 'his favorite!! (and urs)', from: 'wwx' },
        { go: 'venue' },
      ],
      cake_choc: [
        { m: '…Mr. Jiang, Jin Ling has refused chocolate since the fountain incident. You were there.', from: 'sz' },
        { m: 'THE FOUNTAIN 💀💀💀', from: 'jy' },
        { choice: [
            { t: '…Lotus seed paste.', fx: { set: { cake_ok: true } }, go: 'cake_fix' },
            { t: "Chocolate. He'll live.", fx: { sus: { sz: 1 } }, go: 'cake_live' },
          ] },
      ],
      cake_fix: [{ m: "Lotus seed paste. I'll tell Jin's Cakes. 😊", from: 'sz' }, { go: 'venue' }],
      cake_live: [
        { m: "Chocolate, then. I'll… put it down.", from: 'sz' },
        { m: 'jin ling is going to stare at it like it owes him money 💀', from: 'jy' },
        { go: 'venue' },
      ],
      cake_easy: [
        { m: "Then lotus seed paste. It's his favorite. And yours, I think.", from: 'sz' },
        { fx: { set: { cake_ok: true } } },
        { go: 'venue' },
      ],
      venue: [
        { m: 'VENUE', from: 'wwx' },
        { m: 'LOTUS PIER', from: 'wwx' },
        { m: 'lotus pier lotus pier lotus pier', from: 'wwx' },
        { m: 'koi tower has a ballroom tho', from: 'jy' },
        { m: 'Koi Tower has a POND hehe 🐟', from: 'nhs' },
        { m: 'And a board that wants to make speeches. 👀', from: 'nhs' },
        { m: 'Wei Ying. The vote is not decided by repetition.', from: 'lwj' },
        { m: 'it is in my heart', from: 'wwx' },
        { choice: [
            { t: 'Lotus Pier. He grew up there.', fx: { set: { venue_lp: true, party_moved: false } }, go: 'venue_lp' },
            { t: "Koi Tower. It's his house.", fx: { set: { party_moved: true, venue_kt: true } }, go: 'venue_kt' },
            { t: 'Let the birthday boy decide! 🎉', fx: { sus: { wwx: 1, sz: 1, nhs: 1 } }, go: 'venue_party' },
          ] },
      ],
      venue_lp: [
        { m: '!!!!!!!!', from: 'wwx' },
        { m: 'Lotus Pier. Noted.', from: 'sz' },
        { m: 'can we swim in the lake', from: 'jy' },
        { m: 'No.', from: 'lwj' },
        { go: 'gift' },
      ],
      venue_kt: [
        { log: 'Agreed to hold A-Ling’s party at Koi Tower, with the Jin board', once: 'venue' },
        { hint: 'The party is at Koi Tower now.' },
        { m: 'oh', from: 'wwx' },
        { m: "ok. yeah. that's fair. it's his house", from: 'wwx' },
        { m: "Koi Tower, then. I'll ask the staff to keep the pond… clear.", from: 'sz' },
        { m: '(Dinner at Lotus Pier afterwards, for family? If he can get away from the board.)', from: 'sz' },
        { go: 'gift' },
      ],
      venue_party: [
        { m: '🎉??', from: 'wwx' },
        { m: 'mr jiang used the party popper 💀', from: 'jy' },
        { m: 'Screenshotted 👀', from: 'nhs' },
        { m: "I'll put down Lotus Pier. Jin Ling says it every year when he thinks no one is listening.", from: 'sz' },
        { fx: { set: { venue_lp: true, party_moved: false } } },
        { go: 'gift' },
      ],
      gift: [
        { m: 'and jiang cheng. what is "handled"', from: 'wwx' },
        { m: 'if "handled" is a watch again i am leaving this chat', from: 'wwx' },
        { choice: [
            { t: "A-Jie's bell. I had it polished.", fx: { set: { gift_bell: true }, aff: { wwx: 1 } }, go: 'bell' },
            { t: 'A watch.', go: 'watch' },
            { t: 'Something from all of us?', fx: { sus: { wwx: 1 } }, go: 'together' },
            { t: 'Idk, you guys pick!! 🙏', fx: { sus: { wwx: 2, sz: 2 } }, go: 'pick' },
          ] },
      ],
      bell: [
        { me: 'It came back from the jeweller on Tuesday.', img: 'p_silver_bell' },
        { typing: 5, from: 'wwx' },
        { m: '…', from: 'wwx' },
        { m: 'jiang cheng', from: 'wwx' },
        { m: 'oh', from: 'wwx' },
        { m: "she'd love that. she'd love that so much", from: 'wwx' },
        { m: 'It is a good gift.', from: 'lwj' },
        { m: 'wait whats the bell', from: 'jy' },
        { m: 'Jingyi.', from: 'sz' },
        { m: 'ok ok', from: 'jy' },
        { go: 'box' },
      ],
      watch: [
        { m: "I'M LEAVING THIS CHAT", from: 'wwx' },
        { sys: 'Wei Wuxian left the conversation.' },
        { removeMember: 'wwx' },
        { wait: 3 },
        { sys: 'Lan Wangji added Wei Wuxian to the conversation.' },
        { addMember: 'wwx' },
        { m: "ok i'm back. lan zhan made me", from: 'wwx' },
        { m: "it's the bell. isn't it. it was always going to be the bell", from: 'wwx' },
        { choice: [
            { t: "…It's the bell.", fx: { set: { gift_bell: true }, aff: { wwx: 1 } }, go: 'bell_late' },
            { t: "It's a watch.", go: 'watch_final' },
          ] },
      ],
      bell_late: [
        { m: 'I KNEW IT', from: 'wwx' },
        { m: "she'd love that", from: 'wwx' },
        { go: 'box' },
      ],
      watch_final: [
        { m: 'a WATCH', from: 'wwx' },
        { m: 'lan zhan hold me', from: 'wwx' },
        { m: 'It is a good watch, I am sure.', from: 'sz' },
        { go: 'rule3' },
      ],
      together: [
        { m: 'jiang cheng wants a GROUP gift??', from: 'wwx' },
        { m: 'who are u and what have u done with my brother', from: 'wwx' },
        { m: 'A group card, then. And his own gift from you. I think you already know what it is.', from: 'sz' },
        { choice: [
            { t: "His mother's bell.", fx: { set: { gift_bell: true } }, go: 'bell_late' },
            { t: 'Handled.', go: 'rule3' },
          ] },
      ],
      pick: [
        { m: '🙏??', from: 'wwx' },
        { m: 'jiang cheng does NOT pray', from: 'wwx' },
        { m: '…Mr. Jiang, are you all right?', from: 'sz' },
        { m: "I'll put down 'Mr. Jiang: to be confirmed'.", from: 'sz' },
        { go: 'rule3' },
      ],
      // The bell has to be in the purple velvet box (his own Notes and Reminders say so: "not gold").
      box: [
        { if: (s) => !!F(s).bell_ready, go: 'box_done' },
        { m: 'May I ask one small thing? What will it be wrapped in?', from: 'sz' },
        { m: "Jin Ling notices boxes. He kept the paper from his 10th birthday. It's in a drawer.", from: 'sz' },
        { choice: [
            { t: 'Purple velvet. Not gold.', fx: { set: { bell_ready: true } }, go: 'box_purple' },
            { t: "Gold. It's a Jin birthday.", fx: { sus: { sz: 1 } }, go: 'box_gold' },
            { t: "Whatever the jeweller gave me.", go: 'box_bag' },
          ] },
      ],
      box_purple: [
        { log: 'Told Sizhui the bell goes in the purple velvet box', once: 'bell_box' },
        { hint: 'The bell is ready.' },
        { m: 'He is going to complain about the colour for one whole minute. 😊', from: 'sz' },
        { m: "Then he isn't going to take it off.", from: 'sz' },
        { go: 'rule3' },
      ],
      box_gold: [
        { m: "…Your list says 'not gold', Sect Leader Jiang. It's shared with me. I'm sorry. I read everything.", from: 'sz' },
        { m: "I'll leave the box to you.", from: 'sz' },
        { go: 'rule3' },
      ],
      box_bag: [
        { m: "Of course. (Your reminder says purple velvet, though. I'll remind you on Saturday.)", from: 'sz' },
        { go: 'rule3' },
      ],
      box_done: [{ m: 'And I saw the box is ticked off on our list. Purple velvet. Perfect. 😊', from: 'sz' }, { go: 'rule3' }],
      // Rule 3 (Wednesday): "fairy stays OUTSIDE"
      rule3: [
        { m: 'ALSO', from: 'wwx' },
        { m: 'rule 3. fairy stays OUTSIDE', from: 'wwx' },
        { if: (s) => !!F(s).wwx_invited, go: 'rule3_soup' },
        { go: 'rule3_q' },
      ],
      rule3_soup: [{ m: 'i will be carrying a pot of SOUP. her pot. through a door. with a DOG', from: 'wwx' }, { go: 'rule3_q' }],
      rule3_q: [
        { if: (s) => !!F(s).fairy_inside, go: 'rule3_already' },
        { if: (s) => !!F(s).dog_friday, go: 'rule3_dogs' },
        { choice: [
            { t: "Fairy comes in. It's his birthday.", fx: { set: { fairy_inside: true } }, go: 'rule3_in' },
            { t: 'Garden. Old Huang will watch her.', go: 'rule3_out' },
            { t: '[Say nothing]', silent: true, go: 'rule3_out' },
          ] },
      ],
      rule3_already: [
        { m: 'jin ling just told sizhui u ALREADY said fairy comes inside', from: 'wwx' },
        { m: 'jiang cheng. RULE 3', from: 'wwx' },
        { m: 'I will sit between you and the dog.', from: 'lwj' },
        { go: 'seats' },
      ],
      rule3_dogs: [
        { m: 'wait. liu qian posted "DOG FRIDAY APPROVED" on the ymj wavelet', from: 'wwx' },
        { m: 'u approved DOG FRIDAY?? 12 dogs and a cat?? and fairy has to stay in the GARDEN??', from: 'wwx' },
        { m: '…oh no. she doesnt, does she', from: 'wwx' },
        { m: 'I will sit between you and the dog.', from: 'lwj' },
        { go: 'seats' },
      ],
      rule3_in: [
        { log: 'Overruled Rule 3: Fairy comes inside on Sunday', once: 'fairy_inside' },
        { hint: 'Fairy is welcome inside on Sunday.' },
        { m: 'BETRAYED', from: 'wwx' },
        { m: 'by my own brother', from: 'wwx' },
        { m: 'I will sit between you and the dog.', from: 'lwj' },
        { m: 'lan zhan 🥺', from: 'wwx' },
        { go: 'seats' },
      ],
      rule3_out: [
        { m: 'old huang is my HERO', from: 'wwx' },
        { m: 'Jin Ling will sit in the garden with her for at least ten minutes. I am just telling you.', from: 'sz' },
        { go: 'seats' },
      ],
      // Sizhui's first seating plan, read off the Sunday table (docs/SUNDAY.md beat 9)
      seats: [
        { fx: { set: { bday_planned: true } } },
        { log: 'Planned A-Ling’s 18th with the group: cake, venue, gift', once: 'bday_planned' },
        { m: 'Thank you. Then here is my first seating plan. Please correct me.', from: 'sz' },
        say((s) => seatingPlan(s), { from: 'sz' }),
        { m: 'why am i near the kitchen 💀', from: 'jy' },
        { m: 'Because of the fountain.', from: 'sz' },
        { go: 'planned' },
      ],
      planned: [
        { m: 'Wonderful. Cake, venue, gift. Thank you, everyone. Goodnight.', from: 'sz' },
        { m: 'wait i have one more thing', from: 'jy' },
        free('bday'),
        { start: 'bday_oops', delay: 4 },
      ],
    },
  });

  // Jingyi adds the wrong Jin.
  scene({
    id: 'bday_oops',
    thread: 'bday',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('bday', 'oops'),
      oops: [
        lock('bday'),
        { m: 'adding the bakery lady so she can see the design', from: 'jy' },
        { sys: 'Lan Jingyi added A-Ling to the conversation.' },
        { addMember: 'jl' },
        { fx: { set: { jl_added_oops: true } } },
        { m: 'WAIT', from: 'jy' },
        { m: 'NO', from: 'jy' },
        { m: "WRONG JIN. THE BAKERY IS CALLED JIN'S CAKES", from: 'jy' },
        { m: '???', from: 'jl' },
        { m: '"a-ling\'s 18th DO NOT ADD JIN LING"???', from: 'jl' },
        { m: 'WHAT IS THIS', from: 'jl' },
        { m: 'nothing!!!!!!', from: 'wwx' },
        { m: "I don't know anything! 🙈", from: 'nhs' },
        { m: '💀💀💀💀💀', from: 'jy' },
        { m: 'Jingyi.', from: 'sz' },
        { m: 'Jingyi. Copy the rules. All of them.', from: 'lwj' },
        { choice: [
            { t: 'Remove him.', label: '[Remove A-Ling from the group]', silent: true, go: 'remove' },
            { t: "It's a group about your cake allergy.", fx: { sus: { jl: 2 } }, go: 'allergy' },
            { t: "It's a surprise, idiot. Get out.", fx: { aff: { jl: 1 } }, go: 'truth' },
            { t: 'Hi sweetie!! Nothing to see here 😅', fx: { sus: { jl: 3 } }, go: 'sweetie' },
          ] },
      ],
      remove: [
        { sys: 'You removed A-Ling from the conversation.' },
        { removeMember: 'jl' },
        { m: 'SAVED', from: 'jy' },
        { m: 'Not quite.', from: 'sz' },
        { go: 'end' },
      ],
      allergy: [
        { m: "i don't have a cake allergy", from: 'jl' },
        { m: 'jiujiu i had cake for DINNER', from: 'jl' },
        { m: 'he has a cake allergy now. it is new. it is very serious', from: 'wwx' },
        { sys: 'A-Ling left the conversation.' },
        { removeMember: 'jl' },
        { go: 'end' },
      ],
      truth: [
        { m: 'oh', from: 'jl' },
        { m: 'ok', from: 'jl' },
        { m: "ok i'm leaving. i saw nothing", from: 'jl' },
        { sys: 'A-Ling left the conversation.' },
        { removeMember: 'jl' },
        { m: 'mr jiang said the S word 💀', from: 'jy' },
        { m: 'Jingyi.', from: 'sz' },
        { go: 'end' },
      ],
      sweetie: [
        { m: 'SWEETIE??', from: 'jl' },
        { m: '😅??????', from: 'jl' },
        { m: 'ok everyone in this chat is acting insane. bye', from: 'jl' },
        { sys: 'A-Ling left the conversation.' },
        { removeMember: 'jl' },
        { go: 'end' },
      ],
      end: [free('bday'), { start: 'jl_soft', delay: 20 }],
    },
  });

  // Jin Ling DMs, soft: is it at Lotus Pier, is Wei Wuxian really coming, and his mother's soup (beat 7).
  scene({
    id: 'jl_soft',
    thread: 'jl',
    trigger: { on: 'manual' },
    when: night,
    nodes: {
      start: waitFor('jl', 'soft'),
      soft: [
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'u guys are planning something?' },
        { m: 'for sunday?' },
        { choice: [
            { t: 'Go to sleep.', go: 'sleep' },
            { t: 'Yes. Act surprised.', fx: { aff: { jl: 1 } }, go: 'yes' },
            { t: 'No.', go: 'no' },
            { t: "We're planning the best birthday ever for our little man!! 🥳", fx: { sus: { jl: 4 } }, go: 'little' },
          ] },
      ],
      sleep: [{ m: 'ugh. ok' }, { go: 'venue' }],
      yes: [
        { m: "i'll act SO surprised" },
        { m: "i'll cry. fake. fake cry" },
        { m: '…' },
        { m: 'thanks' },
        { go: 'venue' },
      ],
      no: [{ m: 'liar' }, { m: "ur the worst liar in yunmeng. sizhui says so too" }, { go: 'venue' }],
      little: [
        { m: 'LITTLE MAN??' },
        { m: "i'm 18 on sunday" },
        { m: "i'm blocking u. not really. but i'm thinking about it" },
        { go: 'venue' },
      ],
      venue: [{ if: (s) => !!F(s).party_moved, go: 'kt' }, { go: 'wwx_q' }],
      kt: [
        { m: "sizhui let it slip. it's at koi tower??" },
        { m: 'with the board. they will make a SPEECH. about the FUTURE OF THE JIN GROUP' },
        { m: 'i wanted lotus pier. i always want lotus pier. u know that' },
        { choice: [
            { t: "Then it's at Lotus Pier.", fx: { set: { party_moved: false, venue_lp: true }, aff: { jl: 1 } }, go: 'kt_lp' },
            { t: "Koi Tower is your house too.", go: 'kt_stay' },
          ] },
      ],
      kt_lp: [
        { log: 'Moved A-Ling’s party back to Lotus Pier', once: 'venue_back' },
        { hint: 'The party is back at Lotus Pier.' },
        { m: 'Update: Lotus Pier after all. Sect Leader Jiang says so. 😊', th: 'bday', from: 'sz' },
        { m: 'LOTUS PIER LOTUS PIER LOTUS PIER', th: 'bday', from: 'wwx' },
        { m: 'ok' },
        { m: 'ok good' },
        { go: 'wwx_q' },
      ],
      kt_stay: [{ m: "koi tower isn't a house. it's a building with a pond" }, { m: 'and now a car' }, { go: 'wwx_q' }],
      wwx_q: [
        { m: 'is wei wuxian coming' },
        { m: 'like REALLY coming' },
        { if: (s) => !!F(s).burned && !F(s).burned_mended, go: 'burned' },
        { if: (s) => F(s).wwx_invited, go: 'coming', else: 'not_yet' },
      ],
      burned: [
        { m: 'he posted a picture of a dead radish on wavelet. no caption' },
        { m: 'did u two fight' },
        { choice: [
            { t: 'Go to sleep.', go: 'end' },
            { t: "I'll fix it.", fx: { aff: { jl: 1 } }, go: 'fix' },
          ] },
      ],
      fix: [{ m: 'u better' }, { m: "it's my birthday. u have to do what i say on my birthday" }, { go: 'end' }],
      coming: [
        { m: "he says he is. but he also said he'd be on time to my graduation" },
        { choice: [
            { t: "He's coming. He's bringing the soup.", fx: { aff: { jl: 1 } }, go: 'soup' },
            { t: 'Yes.', go: 'soup' },
          ] },
      ],
      soup: [
        { m: "mom's soup?" },
        { m: 'the lotus root one' },
        { m: "i've never had it. only heard about it" },
        { m: 'does he even know how to make it. sizhui says the jingshi smoke alarm went off four times this week' },
        { if: (s) => !!F(s).told_recipe, go: 'told' },
        { choice: [
            { t: "Two hours. Low fire. Don't rush it.", fx: { set: { jl_recipe: true }, aff: { jl: 1 } }, go: 'recipe' },
            { t: "He'll burn it.", go: 'burn' },
            { t: "It'll be close enough.", go: 'close' },
          ] },
      ],
      told: [
        { m: 'wait. u TOLD him?? two hours low fire??' },
        { m: 'u never told ME that' },
        { m: "…ok. then it's going to be good" },
        { go: 'after' },
      ],
      recipe: [
        { log: 'Told A-Ling his mother’s soup recipe: two hours, low fire', once: 'jl_recipe' },
        { m: '…is that the recipe' },
        { m: "is that MOM'S recipe" },
        { m: "tell HIM that. no don't. i'll tell him. no. ok i will" },
        { go: 'after' },
      ],
      burn: [{ m: 'lol' }, { m: "ok. i'll eat it anyway. don't tell him" }, { go: 'after' }],
      close: [{ m: "close enough is fine. i don't know what it's supposed to taste like anyway" }, { m: '…u do though' }, { go: 'after' }],
      after: [
        { if: (s) => !!F(s).ops_keep, go: 'root' },
        { go: 'night' },
      ],
      root: [
        { m: 'also old huang sent me a voice message. there are 20 kilos of lotus root in the cold room with "SUNDAY — DO NOT TOUCH" on the box' },
        { m: 'in his handwriting. is that for the soup' },
        { go: 'night' },
      ],
      night: [{ m: '…' }, { m: 'ok. goodnight jiujiu' }, { go: 'end' }],
      not_yet: [
        { choice: [
            { t: 'Do you want him to?', fx: { aff: { jl: 1 } }, go: 'want' },
            { t: 'No.', go: 'nope' },
            { t: 'Go to sleep.', go: 'end' },
          ] },
      ],
      want: [
        { m: '…' },
        { m: 'yeah' },
        { m: "don't tell him i said that" },
        { m: 'he talks about mom like he knew her better than anyone. except u' },
        { m: "and he said he'd bring her soup. i've never had it" },
        { fx: { set: { jl_wants_wwx: true } } },
        { go: 'end' },
      ],
      nope: [{ m: 'oh' }, { m: 'ok' }, { go: 'end' }],
      end: [free('jl')],
    },
  });

  // Sizhui's seating plan, updated after the night (~01:25): the table as it stands now, plus Nie Huaisang's question.
  scene({
    id: 'bday_seats',
    thread: 'bday',
    trigger: { on: 'unlock', delay: 1500 },
    when: (s) => night(s) && !!F(s).bday_planned,
    nodes: {
      start: waitFor('bday', 'go'),
      go: [
        lock('bday'),
        { m: "Sorry, one more thing before I sleep. I've updated the seating plan after tonight.", from: 'sz' },
        say((s) => seatingPlan(s, 'Seating plan for Sunday (draft 2):'), { from: 'sz' }),
        { if: (s) => seat(s, 'wn') === 'drives', go: 'van' },
        { go: 'nhs' },
      ],
      van: [
        { m: 'I really am happy to wait in the van. Sorry. — Wen Ning', from: 'wn' },
        { m: 'WEN NING NO 💀', from: 'jy' },
        { go: 'nhs' },
      ],
      nhs: [
        { if: (s) => !!F(s).nhs_ally || !!F(s).nhs_leak || !!F(s).nhs_knows, go: 'end' },
        { m: 'Sizhui… I am not on it 😭', from: 'nhs' },
        { m: "Brother Jiang, am I a 'few friends'?? I'd bring the purple lotus fan!! I'd be so quiet 🪭", from: 'nhs' },
        { choice: [
            { t: "You're on the list. Post nothing.", fx: { set: { nhs_ally: true } }, go: 'nhs_yes' },
            { t: 'Family only.', go: 'nhs_no' },
            { t: '[Say nothing]', silent: true, go: 'nhs_quiet' },
          ] },
      ],
      nhs_yes: [
        { log: 'Put Nie Huaisang on the list for Sunday, on condition he posts nothing', once: 'nhs_ally' },
        { hint: 'Nie Huaisang is coming on Sunday.' },
        { m: '😭😭😭🪭', from: 'nhs' },
        { m: "Posting nothing!! I don't even know what posting is!!", from: 'nhs' },
        { m: 'Adding Mr. Nie. Phones in the basket. 😊', from: 'sz' },
        { go: 'end' },
      ],
      nhs_no: [
        { m: 'Understood!! 🙏', from: 'nhs' },
        { m: "(I'm family-adjacent. Like a cousin. I have so many cousins)", from: 'nhs' },
        { go: 'end' },
      ],
      nhs_quiet: [{ m: 'Left on read in a GROUP 😭', from: 'nhs' }, { m: "I'll take that as a 'we'll see' 🪭", from: 'nhs' }, { go: 'end' }],
      end: [{ m: 'Goodnight, everyone. Truly this time.', from: 'sz' }, free('bday')],
    },
  });

  // ── 4. Lotus Leap: someone beat 1824 ─────────────────────────────
  scene({
    id: 'jl_score',
    thread: 'jl',
    trigger: { on: 'act', act: 'game_score', match: (p) => !!p && Number(p.score) > 1824 },
    when: night,
    nodes: {
      start: [{ fx: { set: { beat_score: true }, sus: { jl: 2 } } }, { wait: 8 }, { go: 'q' }],
      q: waitFor('jl', 'how', 'q'),
      how: [
        lock('jl'),
        { m: 'HOW' },
        { m: 'lotus leap just told me someone beat my score' },
        { m: 'jiujiu cant even play phone games??' },
        { m: 'who taught u. was it sizhui. SIZHUI' },
        { choice: [
            { t: "I've been practicing.", fx: { aff: { jl: 1 } }, go: 'practice' },
            { t: 'Get good.', fx: { aff: { jl: 1 } }, go: 'good' },
            { t: "Hehe I'm just that good 😎", fx: { sus: { jl: 3 } }, go: 'cool' },
          ] },
      ],
      practice: [
        { m: 'since WHEN' },
        { m: '…is THAT why ur screen time said games' },
        { m: "ok. it's on. rematch on sunday. after cake. loser does the dishes" },
        free('jl'),
      ],
      good: [
        { m: 'GET GOOD??' },
        { m: "ur 34. ur not allowed to say get good" },
        { m: "ok. it's on. i'm not sleeping tonight" },
        free('jl'),
      ],
      cool: [
        { m: '"hehe"' },
        { m: '😎???' },
        { m: "ok who is this. is this wei wuxian. wei wuxian give jiujiu his phone back" },
        free('jl'),
      ],
    },
  });

  // ── 5. Find My: playing a sound ──────────────────────────────────
  scene({
    id: 'jl_beep_fairy',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'findmy_sound', match: (p) => /fairy/i.test(String(p && p.id)) },
    when: (s) => night(s) && !F(s).fairy_taken,
    nodes: {
      start: [
        { wait: 4 },
        { m: 'WHY IS FAIRY BEEPING' },
        { m: 'jiujiu was that u' },
        { m: "she's chasing her own collar. she thinks it's a bird" },
        { m: 'ok now shes howling. thanks. the night manager is crying' },
      ],
    },
  });
  scene({
    id: 'jl_beep_keys',
    thread: 'jl',
    polite: true,
    trigger: { on: 'act', act: 'findmy_sound', match: (p) => /sandu|key/i.test(String(p && p.id)) },
    when: night,
    nodes: {
      start: [
        { wait: 4 },
        { m: 'my POCKET is beeping' },
        { m: 'the sandu keys. jiujiu stop' },
        { m: 'everyone is looking at me. the koi are looking at me' },
      ],
    },
  });

  // ── 6. Goodnight (~01:40) ────────────────────────────────────────
  scene({
    id: 'jl_night',
    thread: 'jl',
    trigger: { on: 'unlock', delay: 1720 },
    when: (s) => night(s) && !F(s).fairy_taken,
    nodes: {
      start: waitFor('jl', 'gn'),
      gn: [
        lock('jl'),
        { m: 'jiujiu' },
        { m: 'u up' },
        { if: (s) => F(s).car_handled, go: 'car_ok', else: 'car_no' },
      ],
      car_ok: [
        { m: "i'm home. the car's out. fairy is asleep on my bed. she smells like pond" },
        { go: 'board' },
      ],
      car_no: [
        { m: "i'm home. the car is still in the pond. fairy is asleep on my bed. she smells like pond" },
        { go: 'board' },
      ],
      board: [
        { if: (s) => !!F(s).scandal && !F(s).scandal_fixed, go: 'board_bad' },
        { if: (s) => !!F(s).scandal_fixed, go: 'board_ok' },
        { go: 'fairy' },
      ],
      board_bad: [
        { m: 'the board\'s assistant emailed AGAIN. "koi tower, sunday, 5 pm, press"' },
        { m: 'i said i have a dinner. she said "reschedule it"' },
        { m: "u're calling them tomorrow right. u're scarier than them" },
        { go: 'fairy' },
      ],
      board_ok: [{ m: "the valet followed me on wavelet. he's nice. his granddaughter is not" }, { go: 'fairy' }],
      fairy: [
        { if: (s) => seat(s, 'fairy') === 'in', go: 'fairy_in' },
        { go: 'more' },
      ],
      fairy_in: [{ m: "i told fairy she's coming inside on sunday. she understood. she sighed" }, { go: 'more' }],
      more: [
        { if: (s) => F(s).wwx_invited && F(s).jl_wants_wwx, go: 'wwx' },
        { go: 'thanks' },
      ],
      wwx: [
        { m: 'also wei wuxian is coming on sunday. he told everyone. twice' },
        { m: 'u said yes. after i said. (thanks)' },
        { go: 'thanks' },
      ],
      thanks: [
        { m: 'thanks for tonight. or wtv' },
        { m: "don't make it weird" },
        { choice: [
            { t: 'Go to sleep, brat.', fx: { aff: { jl: 1 } }, go: 'brat' },
            { t: 'Six-thirty Sunday. Don’t be late.', fx: { aff: { jl: 1 } }, go: 'sunday' },
            { t: 'I love you so much, kiddo ❤️', fx: { sus: { jl: 4 } }, go: 'love' },
            { t: '[Leave him on read]', silent: true, go: 'read' },
          ] },
      ],
      brat: [{ m: 'ur the brat' }, { m: 'night jiujiu' }, { go: 'done' }],
      sunday: [
        { m: "i'm never late. ur early. there's a difference" },
        { m: "it's not sunday yet old man" },
        { m: '…' },
        { m: 'thanks' },
        { go: 'done' },
      ],
      love: [
        { m: 'WHAT' },
        { m: "ok i'm calling sizhui. ur possessed" },
        { m: '…' },
        { m: '(love u too. never say that again)' },
        { go: 'done' },
      ],
      read: [{ m: 'ok. classic' }, { go: 'done' }],
      done: [{ fx: { set: { jl_done: true } } }, free('jl')],
    },
  });
})();
