/* Live scenes — YMJ Ops group `ops` (Old Huang, Liu Qian, A-Bai, Tang Mei) and Old Huang's DM `huang`:
   400 kg of lotus root (twenty kilos kept for Sunday), Bring Your Dog to Work Friday, towing Sandu, the guest list
   for the gate, goodnight. Decent, fun decisions raise the `ops_morale` counter.
   "Sunday at Lotus Pier": table flags set here: ops_keep, ops_soup, ops_morale, dog_friday, huang_list (+ huang_wwx),
   car_handled. Facts: docs/STORY.md; design: docs/sunday/b.md. */
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

  const live = () => S.view();
  const TBL = (s) => { try { return JC.sunday && JC.sunday.table ? JC.sunday.table(s || live()) : null; } catch (e) { return null; } };
  const seat = (s, k) => { const t = TBL(s); return t ? t.seats[k].state : 'no'; };

  /** The guest list as Jiang Cheng would text it to Old Huang: whoever is coming, as of now (docs/SUNDAY.md beat 6). */
  function guestList(s) {
    const t = TBL(s);
    if (!t) return 'A-Ling. Family.';
    const st = (k) => t.seats[k].state;
    const L = [st('jl') === 'late' ? 'A-Ling, late.' : 'A-Ling.'];
    if (st('sz') === 'yes') L.push('Sizhui and Jingyi.');
    if (st('wwx') === 'yes') L.push('Wei Wuxian and Lan Wangji.');
    if (st('wn') === 'yes') L.push('Wen Ning.');
    else if (st('wn') === 'drives') L.push('Wen Ning’s van.');
    if (st('lxc') !== 'no') L.push('Lan Xichen.');
    if (st('nhs') === 'yes') L.push('Nie Huaisang.');
    if (st('fairy') === 'in') L.push('Fairy comes in.');
    L.push('Nobody else.');
    return L.join(' ');
  }

  // ── 1. 400 kg of lotus root (~00:15) ─────────────────────────────
  scene({
    id: 'ops_lotus',
    thread: 'ops',
    trigger: { on: 'unlock', delay: 430 },
    when: night,
    nodes: {
      start: waitFor('ops', 'root'),
      root: [
        lock('ops'),
        { m: "Good evening all. Re: Old Huang's message above:", from: 'liu' },
        { m: '• Delivered: 400 kg of lotus root (Honghu Cooperative)', from: 'liu' },
        { m: '• Ordered: 40 kg (canteen soup week)', from: 'liu' },
        { m: '• Cold room: full. Decision needed before the 06:00 shift', from: 'liu' },
        { m: '', from: 'huang', voice: { dur: 14, text: 'Boss. Huang here. I am standing in the lotus root. It comes up to my knee. I am sixty-three years old. Okay. Bye.' } },
        { m: 'The Lotus Root. 👍', from: 'huang', img: 'p_ops_lotusroots' },
        { typing: 4, from: 'bai' },
        { wait: 2 },
        { typing: 3, from: 'bai' },
        { choice: [
            { t: 'Who ordered this.', go: 'who' },
            { t: 'Send it back.', go: 'back' },
            { t: 'Make soup. For the whole company.', fx: { set: { ops_soup: true }, inc: { ops_morale: 1 } }, go: 'soup' },
            { t: 'Ridiculous.', go: 'ridiculous' },
          ] },
      ],
      who: [
        { fx: { set: { ops_who: true } } },
        { typing: 6, from: 'bai' },
        { m: 'boss', from: 'bai' },
        { m: 'it was me', from: 'bai' },
        { m: "i typed 400 instead of 40. the 0 key sticks. that's not an excuse. i'm so sorry 🙇🙇🙇", from: 'bai' },
        { m: "please don't use Zidian", from: 'bai' },
        { m: '• Context: A-Bai is 23. First year. Otherwise excellent', from: 'liu' },
        { choice: [
            { t: 'Zidian stays where it is. Fix it by Monday.', fx: { inc: { ops_morale: 1 } }, go: 'mercy' },
            { t: "Do it again and you're on dog-walking duty.", fx: { inc: { ops_morale: 1 } }, go: 'dogduty' },
            { t: "You're fired.", go: 'fired' },
            { t: "Aww don't worry, everyone makes mistakes 🤗", fx: { sus: { bai: 2, liu: 2, ea: 2 } }, go: 'hug' },
          ] },
      ],
      mercy: [
        { m: 'thank you boss thank you thank you 🙇🙇🙇🙇', from: 'bai' },
        { m: '👍👍👍', from: 'huang' },
        { m: '• Noted: mercy', from: 'liu' },
        { m: 'Noted. Also noted: he did not say "this time".', from: 'ea' },
        { go: 'what' },
      ],
      dogduty: [
        { m: '• Dog-walking duty does not exist', from: 'liu' },
        { m: '• Yet', from: 'liu' },
        { m: "i'd be honored boss 🙇", from: 'bai' },
        { go: 'what' },
      ],
      fired: [
        { m: 'Boss. With respect. He is 23 and it is his first year.', from: 'liu' },
        { m: 'Boss. 😢', from: 'huang' },
        { typing: 5, from: 'bai' },
        { choice: [
            { t: "…Fine. He's not fired. He's peeling.", fx: { inc: { ops_morale: 1 } }, go: 'peeling' },
            { t: 'Fired.', fx: { set: { bai_fired: true } }, go: 'really_fired' },
          ] },
      ],
      peeling: [
        { m: "i'll peel all of it boss. all 400 kg 🙇", from: 'bai' },
        { m: '• Please do not peel all of it', from: 'liu' },
        { go: 'what' },
      ],
      really_fired: [
        { m: 'ok', from: 'bai' },
        { m: 'thank you for the opportunity boss', from: 'bai' },
        { m: "I'll draft the paperwork on Monday. I'll also draft the version where you change your mind. You usually need it.", from: 'ea' },
        { go: 'what' },
      ],
      hug: [
        { m: '…', from: 'bai' },
        { m: 'boss are you ok', from: 'bai' },
        { m: '🤗?', from: 'liu' },
        { m: "Noted. I'll book the CEO a doctor's appointment for Monday.", from: 'ea' },
        { go: 'what' },
      ],
      what: [
        { if: (s) => F(s).ops_soup, go: 'done' },
        { m: '• Remaining question: what do we do with 400 kg of lotus root', from: 'liu' },
        { go: 'decide' },
      ],
      back: [
        { m: '• Supplier closed until Monday', from: 'liu' },
        { m: '• No returns on fresh produce once unloaded', from: 'liu' },
        { m: '• It will not keep until Monday', from: 'liu' },
        { go: 'decide' },
      ],
      ridiculous: [
        { m: '• Agreed', from: 'liu' },
        { m: '• Still need a decision', from: 'liu' },
        { go: 'decide' },
      ],
      decide: [
        { choice: [
            { t: 'Make soup. For the whole company.', fx: { set: { ops_soup: true }, inc: { ops_morale: 1 } }, go: 'soup' },
            { t: 'Keep twenty kilos for Sunday. The best ones.', fx: { set: { ops_keep: true }, inc: { ops_morale: 1 } }, go: 'keep' },
            { t: 'Sell it at the farm shop. Half price.', go: 'sell' },
            { t: 'Who ordered this.', if: (s) => !F(s).ops_who, go: 'who' },
          ] },
      ],
      soup: [
        { m: 'Boss!!! 👍👍👍👍', from: 'huang' },
        { m: '', from: 'huang', voice: { dur: 11, text: 'Boss. Auntie Chen in the canteen says she can make three hundred bowls. She is crying. Happy crying. Okay. Bye.' } },
        { m: '• Soup week → soup for the whole company ✔', from: 'liu' },
        { m: '• 340 staff, Monday to Friday', from: 'liu' },
        { m: '• Remaining ~150 kg → farm shop', from: 'liu' },
        { m: 'boss can i help peel 🙇', from: 'bai' },
        { m: "Noted. The Honghu invoice is already on my desk: ¥4,800 for 400 kg. I'll tell the board it's a wellness initiative.", from: 'ea' },
        { if: (s) => !!F(s).ops_keep, go: 'done' },
        // the beat that points at Sunday (docs/SUNDAY.md beat 5)
        { m: 'Boss. Sunday young master birthday. Keep some? The Best ones? I pick. 👍', from: 'huang' },
        { choice: [
            { t: 'Twenty kilos. The best ones. For the Residence kitchen.', fx: { set: { ops_keep: true }, inc: { ops_morale: 1 } }, go: 'keep' },
            { t: 'Farm shop.', go: 'sell_rest' },
          ] },
      ],
      sell_rest: [{ m: 'Farm shop. Received. 👍', from: 'huang' }, { go: 'done' }],
      keep: [
        { log: 'Kept twenty kilos of the 400 kg of Honghu lotus root for Sunday', once: 'ops_keep' },
        { hint: 'Twenty kilos of lotus root are kept for Sunday.' },
        { m: '', from: 'huang', voice: { dur: 15, text: 'Boss. Twenty kilo. I pick the best ones myself. Long ones, nine holes. I write SUNDAY on the box. Nobody touch. Okay. Bye.' } },
        { m: '• 20 kg reserved: Lotus Pier Residence kitchen, Sunday', from: 'liu' },
        { if: (s) => !F(s).ops_soup, go: 'keep_rest' },
        { go: 'keep_ea' },
      ],
      keep_rest: [
        { m: '• Remaining 380 kg → farm shop, half price', from: 'liu' },
        { m: '• Canteen soup week: 40 kg, as planned', from: 'liu' },
        { go: 'keep_ea' },
      ],
      keep_ea: [
        { m: "Noted. I've seen the Honghu invoice. Twenty kilos go under \"Family\". The rest go under \"A-Bai\".", from: 'ea' },
        { m: '🙇', from: 'bai' },
        { if: (s) => !!F(s).wwx_invited && !F(s).burned, go: 'keep_wwx' },
        { go: 'done' },
      ],
      keep_wwx: [
        { m: 'Mr. Wei comes Sunday? He makes the soup? Then he need Good Root. 👍👍', from: 'huang' },
        { m: '(I heard about the smoke alarm. Four times. I put in a fire blanket also.)', from: 'huang' },
        { go: 'done' },
      ],
      sell: [
        { m: '• Farm shop: noted', from: 'liu' },
        { m: '• Half-price lotus root this weekend', from: 'liu' },
        { m: 'Boss. Received. 👍', from: 'huang' },
        { m: 'Noted. The Honghu invoice is ¥4,800. The farm shop will make back about half. I will not mention the other half on Monday.', from: 'ea' },
        { go: 'done' },
      ],
      done: [free('ops')],
    },
  });

  // ── 2. Bring Your Dog to Work Friday ─────────────────────────────
  scene({
    id: 'ops_dogfriday',
    thread: 'ops',
    trigger: { on: 'scene', scene: 'ops_lotus', delay: 150 },
    when: night,
    nodes: {
      start: waitFor('ops', 'dogs'),
      dogs: [
        lock('ops'),
        { if: (s) => !!F(s).dog_friday_mail, go: 'mailed' },
        { if: (s) => F(s).car_known && !F(s).tow_huang, go: 'carvid' },
        { go: 'pitch' },
      ],
      // the boss already answered Liu Qian's proposal by email (react-social.js)
      mailed: [
        { m: '• The boss already answered my proposal by email', from: 'liu' },
        { m: '• No further questions 🐕', from: 'liu' },
        { go: 'done' },
      ],
      carvid: [
        { m: 'Boss. My nephew sends me video. Sandu. In Pond. 😢', from: 'huang' },
        { m: '• Noted', from: 'liu' },
        { m: '• Not an ops issue', from: 'liu' },
        { m: '• Unless it is?', from: 'liu' },
        { m: 'It is a Jin Ling issue. Those are never ops issues until Monday.', from: 'ea' },
        { go: 'pitch' },
      ],
      pitch: [
        { m: 'While I have everyone:', from: 'liu' },
        { m: "Re: Bring Your Dog to Work Friday — you said you'd decide tonight.", from: 'liu', img: 'p_dogfriday_poster' },
        { m: '• 47 signatures', from: 'liu' },
        { m: '• 12 dogs, 1 cat (under discussion)', from: 'liu' },
        { m: '• Insurance: confirmed', from: 'liu' },
        { m: 'I have no dog. But I Support. 👍', from: 'huang' },
        { m: 'For the record: in April you said "we\'ll see", which I logged as a no.', from: 'ea' },
        { choice: [
            { t: 'Approved.', fx: { set: { dog_friday: true }, inc: { ops_morale: 1 } }, go: 'yes' },
            { t: 'Denied.', go: 'no' },
            { t: 'Only Fairy.', fx: { set: { dog_friday: 'fairy' }, inc: { ops_morale: 1 } }, go: 'fairy' },
            { t: 'OMG YES I love dogs so much 🐶🐶🐶', fx: { set: { dog_friday: true }, inc: { ops_morale: 1 }, sus: { ea: 3, liu: 2 } }, go: 'omg' },
          ] },
      ],
      yes: [
        { m: '👍👍👍👍👍', from: 'huang' },
        { m: '• Thank you', from: 'liu' },
        { m: '• First Dog Friday: 6 November', from: 'liu' },
        { m: '• Fairy invited as guest of honour', from: 'liu' },
        { m: 'boss can i bring my hamster. is a hamster a dog', from: 'bai' },
        { m: 'No.', from: 'ea' },
        { go: 'sunday' },
      ],
      no: [
        { m: '• Noted', from: 'liu' },
        { m: '• The poster stays up until Monday out of spite', from: 'liu' },
        { m: 'Boss. 😢👍', from: 'huang' },
        { go: 'done' },
      ],
      fairy: [
        { m: '• Fairy is not an employee', from: 'liu' },
        { m: '• Fairy is a dog', from: 'liu' },
        { m: '• …Approved for Fairy', from: 'liu' },
        { m: "I'll print her a badge. Job title: Head of Morale.", from: 'ea' },
        { go: 'sunday' },
      ],
      omg: [
        { m: '…', from: 'liu' },
        { m: '• Approved?', from: 'liu' },
        { m: 'Boss uses dog emoji. Very Good. 🐶👍', from: 'huang' },
        { m: 'Who is this.', from: 'ea' },
        { m: '(I am going to assume the balcony.)', from: 'ea' },
        { go: 'sunday' },
      ],
      // if dogs may come to work, Fairy may come to dinner: she sits inside on Sunday
      sunday: [
        { m: 'Boss. So Sunday Fairy come Inside also? Young master birthday? I move the good carpet. 👍', from: 'huang' },
        { log: 'Approved Dog Friday; Fairy comes inside on Sunday', once: 'fairy_inside' },
        { hint: 'Fairy is welcome inside on Sunday.' },
        { go: 'done' },
      ],
      done: [free('ops')],
    },
  });

  // ── 3. Towing Sandu through Old Huang's cousin ───────────────────
  scene({
    id: 'ops_tow',
    thread: 'ops',
    trigger: { on: 'flag', flag: 'tow_huang', delay: 25 },
    when: night,
    nodes: {
      start: waitFor('ops', 'tow'),
      tow: [
        lock('ops'),
        { m: 'Boss. Young master Jin called me. Car. Pond. Received. 👍', from: 'huang' },
        { m: 'My Cousin Huang Er has tow truck in Lanling. He is going Now.', from: 'huang' },
        { wait: 20 },
        { m: '', from: 'huang', voice: { dur: 19, text: 'Boss. Huang Er is at the pond. He asks, front hook or back hook. Also there is a very big black dog on the roof. He is afraid of the dog. Boss, what to do.' } },
        { choice: [
            { t: 'Front. Mind the koi.', fx: { inc: { ops_morale: 1 } }, go: 'koi' },
            { t: "Tell him Fairy doesn't bite. Much.", fx: { inc: { ops_morale: 1 } }, go: 'bite' },
            { t: 'Whatever is fastest.', go: 'fast' },
            { t: "You're the best, Old Huang!! 👍👍", fx: { sus: { huang: 1 }, inc: { ops_morale: 1 } }, go: 'thumbs' },
          ] },
      ],
      koi: [{ m: 'Front. Mind Koi. Received. 👍', from: 'huang' }, { go: 'out' }],
      bite: [
        { m: 'Huang Er says: "Much??"', from: 'huang' },
        { m: 'Young master Jin is holding the dog. Ok. 👍', from: 'huang' },
        { go: 'out' },
      ],
      fast: [{ m: 'Received. 👍', from: 'huang' }, { go: 'out' }],
      thumbs: [
        { m: 'Boss uses 👍!!!', from: 'huang' },
        { m: 'Finally!!! 👍👍👍👍👍👍', from: 'huang' },
        { m: 'I am telling my wife.', from: 'huang' },
        { go: 'out' },
      ],
      out: [
        { wait: 40 },
        { m: 'Before Photo. Huang Er took it. Car is out Now. 👍', from: 'huang', img: 'p_koi_pond_car' },
        { m: 'Koi: all fine. One koi is now Famous on internet.', from: 'huang' },
        { m: '• Tow invoice: Huang Er, ¥600. Filed under "Family"', from: 'liu' },
        { fx: { set: { car_handled: true } } },
        { log: 'Got Sandu out of the koi pond through Old Huang’s cousin', once: 'car_out' },
        { hint: 'Sandu is out of the pond.' },
        { m: "the car is out!!! old huang's cousin has a mustache like a broom", th: 'jl', from: 'jl' },
        { m: 'fairy barked at him the whole time. he says he forgives her', th: 'jl', from: 'jl' },
        { if: (s) => !!F(s).car_cover && !F(s).scandal, go: 'valet' },
        { go: 'done' },
      ],
      // a nudge before #KoiPondGate: Huang Er saw the valet
      valet: [
        { m: 'Boss. Huang Er says the old valet is still standing by the pond. Very sad. Somebody say he did it?? 🤔', from: 'huang' },
        { m: 'Huang Er gave him a cigarette. He does not smoke. He held it anyway.', from: 'huang' },
        { go: 'done' },
      ],
      done: [free('ops')],
    },
  });

  // ── 4. The guest list for the gate (~01:10; earlier if Old Huang gets in touch) ─
  // Old Huang wants Sunday's list for the guardhouse board. The list the player sends is whoever is coming so far
  // (JC.sunday.table); the 2024 gate ("Next time, let him in." Nobody told Wei Wuxian) gets its answer here.
  scene({
    id: 'huang_gate',
    thread: 'huang',
    trigger: { on: 'unlock', delay: 1350 },
    when: night,
    nodes: {
      start: waitFor('huang', 'ask'),
      ask: [
        lock('huang'),
        { m: '', d: 3, voice: { dur: 18, text: 'Boss. Huang here. Sunday. Young master birthday. Six-thirty. I am at the gate. Who comes? You give me the list. I write it on the board in the guardhouse. Okay.' } },
        { m: '👍' },
        { choice: [
            { label: '[Send him the guest list]', get t() { return guestList(live()); }, fx: { set: { huang_list: true } }, go: 'list' },
            { t: 'And if Wei Wuxian comes to the gate, let him in. Not like last time.', if: (s) => seat(s, 'wwx') !== 'yes' && !F(s).burned, fx: { set: { huang_list: true, huang_wwx: true } }, go: 'wwx' },
            { t: 'Nobody gets in without asking me.', go: 'closed' },
          ] },
      ],
      list: [
        { log: 'Gave Old Huang the guest list for the gate', once: 'huang_list' },
        { hint: 'Old Huang has the guest list.' },
        { m: 'Boss. Received. I write it on the Board. Big letters. 👍' },
        { if: (s) => seat(s, 'wwx') === 'yes', go: 'l_wwx' },
        { go: 'l_wn' },
      ],
      l_wwx: [
        { m: '', voice: { dur: 16, text: 'Mr. Wei. Boss. Last time he stand at the gate twenty minutes. I give him tea and one egg. This time I open the gate before he knock. Okay.' } },
        { fx: { set: { huang_wwx: true } } },
        { go: 'l_wn' },
      ],
      l_wn: [
        { if: (s) => ['yes', 'drives'].includes(seat(s, 'wn')), go: 'l_wn_yes' },
        { go: 'l_lxc' },
      ],
      l_wn_yes: [{ m: 'Wen Ning with the van. I show him where to park. Not across three space. 👍' }, { go: 'l_lxc' }],
      l_lxc: [
        { if: (s) => seat(s, 'lxc') !== 'no', go: 'l_lxc_yes' },
        { go: 'l_nhs' },
      ],
      l_lxc_yes: [{ m: 'Zewu-jun?? 🤔' }, { m: 'Boss. I iron my shirt.' }, { go: 'l_nhs' }],
      l_nhs: [
        { if: (s) => seat(s, 'nhs') === 'yes', go: 'l_nhs_yes' },
        { go: 'l_fairy' },
      ],
      l_nhs_yes: [{ m: 'Mr. Nie. I count the fans when he come in. I count when he go out. 👍' }, { go: 'l_fairy' }],
      l_fairy: [
        { if: (s) => seat(s, 'fairy') === 'in', go: 'l_fairy_in' },
        { go: 'l_root' },
      ],
      l_fairy_in: [{ m: 'Fairy Inside!! I roll up the good carpet. 👍👍' }, { go: 'l_root' }],
      l_root: [
        { if: (s) => !!F(s).ops_keep, go: 'l_root_yes' },
        { go: 'end' },
      ],
      l_root_yes: [{ m: 'And the box SUNDAY in the cold room. I guard it also. 👍' }, { go: 'end' }],
      wwx: [
        { log: 'Told Old Huang to let Wei Wuxian in if he comes to the gate', once: 'huang_wwx' },
        { hint: 'Old Huang will remember that.' },
        { m: '', voice: { dur: 20, text: 'Boss. Mr. Wei. Yes. Two years ago you say next time let him in. He never come again. This time I open the gate. I give him tea also. And two egg.' } },
        { m: '👍👍👍' },
        { go: 'end' },
      ],
      closed: [
        { m: 'Boss. Received. Nobody. 👍' },
        { if: (s) => seat(s, 'wwx') === 'yes', go: 'closed_wwx' },
        { go: 'end' },
      ],
      closed_wwx: [{ m: '(Mr. Wei also Nobody?? 🤔 I ask you again Sunday.)' }, { go: 'end' }],
      end: [free('huang')],
    },
  });

  // ── 5. Minutes, and goodnight (~01:45) ───────────────────────────
  scene({
    id: 'ops_goodnight',
    thread: 'ops',
    trigger: { on: 'unlock', delay: 1880 },
    when: night,
    nodes: {
      start: waitFor('ops', 'sum'),
      sum: [
        lock('ops'),
        { m: "Summary of tonight, for Monday's minutes:", from: 'liu' },
        { if: (s) => F(s).ops_soup, go: 's_soup', else: 's_nosoup' },
      ],
      s_soup: [{ m: '• Lotus root soup for the whole company (approved, 340 bowls a day)', from: 'liu' }, { go: 's_keep' }],
      s_nosoup: [{ m: '• 400 kg of lotus root (situation ongoing)', from: 'liu' }, { go: 's_keep' }],
      s_keep: [
        { if: (s) => !!F(s).ops_keep, go: 's_keep_yes' },
        { go: 's_dog' },
      ],
      s_keep_yes: [{ m: '• 20 kg reserved for Sunday (box labelled SUNDAY, guarded by Old Huang)', from: 'liu' }, { go: 's_dog' }],
      s_dog: [
        { if: (s) => !!F(s).dog_friday, go: 's_dog_yes' },
        { m: '• Bring Your Dog to Work Friday (pending, again)', from: 'liu' },
        { go: 's_car' },
      ],
      s_dog_yes: [{ m: '• Bring Your Dog to Work Friday (approved)', from: 'liu' }, { go: 's_car' }],
      s_car: [
        { if: (s) => F(s).car_handled, go: 's_car_yes' },
        { go: 's_press' },
      ],
      s_car_yes: [{ m: '• 1 (one) Sandu, retrieved from 1 (one) koi pond', from: 'liu' }, { go: 's_press' }],
      s_press: [
        { if: (s) => !!F(s).scandal && !F(s).scandal_fixed, go: 's_press_yes' },
        { go: 's_bai' },
      ],
      s_press_yes: [{ m: '• Press inquiry (Lanling Daily): Tang Mei handling', from: 'liu' }, { go: 's_bai' }],
      s_bai: [
        { if: (s) => F(s).bai_fired, go: 's_bai_fired' },
        { m: '• A-Bai: still employed', from: 'liu' },
        { go: 'bed' },
      ],
      s_bai_fired: [{ m: '• A-Bai: see separate memo', from: 'liu' }, { go: 'bed' }],
      bed: [
        { m: 'Go to sleep. All of you. Especially you.', from: 'ea' },
        { choice: [
            { t: 'Good work tonight. All of you. Go home.', fx: { inc: { ops_morale: 1 } }, go: 'good' },
            { t: 'Monday. Nine.', go: 'monday' },
            { t: 'Love you guys!!! ❤️', fx: { sus: { ea: 2, liu: 1, bai: 1 }, inc: { ops_morale: 1 } }, go: 'love' },
          ] },
      ],
      good: [
        { m: '', from: 'huang', voice: { dur: 23, text: 'Boss said good work. Boss said good work! I have worked at Lotus Pier for thirty-one years. Your father hired me. I am telling my wife. I am telling her right now. Okay. Bye. Good work, Boss.' } },
        { m: 'thank you boss 🙇', from: 'bai' },
        { m: '• Noted, with gratitude', from: 'liu' },
        { m: 'Noted. Framing it.', from: 'ea' },
        { go: 'done' },
      ],
      monday: [
        { m: 'Monday. Nine.', from: 'ea' },
        { m: 'Boss. Received. 👍', from: 'huang' },
        { go: 'done' },
      ],
      love: [
        { m: '❤️👍', from: 'huang' },
        { m: '…', from: 'liu' },
        { m: 'Screenshotted. For the board. For leverage.', from: 'ea' },
        { go: 'done' },
      ],
      done: [{ fx: { set: { ops_done: true } } }, free('ops')],
    },
  });
})();
