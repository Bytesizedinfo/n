/* Live scenes — Nie Huaisang (`nhs`), the detective: balcony gossip, the Laoma Hotpot quiz, group `alumni`,
   @teaspiller_qh's #BalconyGate (and the Jin board reading it), #KoiPondGate, and being caught.
   "Sunday at Lotus Pier" consequences written here (docs/SUNDAY.md): `nhs_bargain` (I Know Nothing → he knows; you
   bargain kindly → nhs_ally, badly → nhs_leak + a 'balcony' scandal) and `scandal_breaks` (#KoiPondGate or
   #BalconyGate trends; the Jin board wants the 18th at Koi Tower; fixable tonight → scandal_fixed).
   Facts: docs/STORY.md; design: docs/sunday/b.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const D = (s) => s.done || {};
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
  // once he knows, the gossip storyline is over: his other scenes stand down
  const gossiping = (s) => night(s) && !F(s).nhs_knows;

  // The original #BalconyGate post (23:21) is seeded by the Wavelet app; tonight's is the sequel.
  const balconyMild = {
    id: 'post_balconygate2', by: 'teaspiller_qh', art: 'p_gala_hall', likes: 2481,
    text: '#BalconyGate, part two 🫖 Our sources say the CEO in purple went straight to his hotel and has been texting ever since. The Chancellor in white has been seen looking at the moon. On purpose. 👀 #BalconyGate #JinGala',
    comments: [
      { by: 'yiling_radish_king', text: 'LMAOOOO' },
      { by: 'rulan_jin', text: 'delete this' },
      { by: 'huaisang_fans', text: "I still don't know anything!! 🙈" },
    ],
  };
  const balconyHot = {
    id: 'post_balconygate2', by: 'teaspiller_qh', art: 'p_gala_hall', likes: 9132,
    text: '#BalconyGate, part two 🫖 A source close to the CEO in purple CONFIRMS: the Chancellor in white told him he MISSED him 😳 Make of that what you will 🙈 #BalconyGate #JinGala',
    comments: [
      { by: 'yiling_radish_king', text: 'WAIT WHAT' },
      { by: 'rulan_jin', text: 'delete this' },
      { by: 'jingyi_lan', text: 'MR JIANG 💀💀💀' },
      { by: 'huaisang_fans', text: "I don't know who the source is!! 🙈" },
    ],
  };
  // nhs_bargain gone badly: he spends what you gave him
  const balconyLeak = {
    id: 'post_balconygate3', by: 'teaspiller_qh', art: 'p_balcony_moon', likes: 31877,
    text: '#BalconyGate: THE RECEIPTS 🫖🫖🫖 A very reliable source has seen the CEO in purple\'s messages. The Chancellor in white texts him "did you get home safely?" and he has NOT ANSWERED. Also: the moon photo. Look at the edge of the frame. Look at the SLEEVE. 👀 #BalconyGate #JinGala',
    comments: [
      { by: 'yiling_radish_king', text: 'huaisang i know where u live' },
      { by: 'rulan_jin', text: 'DELETE THIS' },
      { by: 'zewujun', text: '🙂' },
      { by: 'huaisang_fans', text: "I have NO idea who this source is!!! 🙈🙈" },
    ],
  };
  const koiPost = {
    id: 'post_koipondgate', by: 'teaspiller_qh', art: 'p_koi_pond_car', likes: 18402,
    text: "Which young heir parked his uncle's purple sedan IN THE KOI POND at Koi Tower tonight… and then told security the 60-year-old valet did it?? 🐟🚗 The valet's granddaughter is in his class. She has video. #KoiPondGate",
    comments: [
      { by: 'jingyi_lan', text: '💀💀💀💀💀' },
      { by: 'yiling_radish_king', text: 'the koi deserve an apology' },
    ],
  };
  const jlSorry = {
    id: 'post_jl_valet', by: 'rulan_jin', art: 'p_koi_pond_car', likes: 6120,
    text: 'it was me. not the valet. i parked my uncle\'s car in the koi pond. sorry to uncle gao and to all 23 koi. they are fine. i counted. #KoiPondGate',
    comments: [
      { by: 'jingyi_lan', text: 'CHARACTER DEVELOPMENT 💀' },
      { by: 'yiling_radish_king', text: 'proud of u. the koi are proud of u' },
      { by: 'teaspiller_qh', text: 'Respect 🫖' },
    ],
  };

  // ── 1. "So........ the balcony" ──────────────────────────────────
  scene({
    id: 'nhs_balcony',
    thread: 'nhs',
    trigger: { on: 'unlock', delay: 130 },
    when: gossiping,
    nodes: {
      start: waitFor('nhs', 'fish'),
      fish: [
        lock('nhs'),
        { m: 'Brother Jiang?? 👀' },
        { m: "Hellooo~ I know you're awake, you never sleep before two" },
        { m: 'So........ the balcony 🙈' },
        { choice: [
            { t: 'Nothing happened.', go: 'nothing' },
            { t: 'Mind your own business.', go: 'mind' },
            { t: 'He said he missed me 😳', fx: { sus: { nhs: 3 }, set: { nhs_spilled: true } }, go: 'spilled' },
            { t: 'What balcony?', fx: { sus: { nhs: 1 } }, go: 'what' },
          ] },
      ],
      nothing: [
        { m: 'Brother Jiang, EVERYONE saw 🪭' },
        { m: 'Zewu-jun stood there after you left like a sad poem. A sad poem in a white coat' },
        { m: 'You ran so fast you left your coat at the coat check! I saw A-Ling go and get it 🙈' },
        { go: 'seats' },
      ],
      mind: [
        { m: "Hehe~ I'm only asking because I care!!! 🙏" },
        { m: '…and because Mianmian owes me 200 yuan if you two talk again before Sunday' },
        { go: 'seats' },
      ],
      spilled: [
        { m: '!!!!!!!!!!' },
        { m: 'BROTHER JIANG' },
        { m: 'He SAID that?? Out LOUD??' },
        { m: 'And you said—?? 👀👀👀' },
        { choice: [
            { t: 'Nothing. I left.', go: 'left' },
            { t: 'I said it back 💜', fx: { sus: { nhs: 3 } }, go: 'back' },
            { t: 'Forget I said anything.', fx: { sus: { nhs: 1 } }, go: 'forget' },
          ] },
      ],
      left: [
        { m: 'Brother Jiang 😭😭😭' },
        { m: 'You RAN?? From ZEWU-JUN??' },
        { m: "That's the most Brother Jiang thing I've ever heard. Okay. I believe you 🙏" },
        { go: 'seats' },
      ],
      back: [
        { m: '💜???' },
        { m: 'Brother Jiang… a purple heart…' },
        { m: 'Hmm~ 👀' },
        { go: 'seats' },
      ],
      forget: [
        { m: 'Forget? Brother Jiang, I have never forgotten anything in my life 🙈' },
        { m: "I mean! I forget everything! I don't know anything!" },
        { go: 'seats' },
      ],
      what: [
        { m: 'Brother Jiang. The balcony you RAN from 🙈' },
        { m: 'In front of the Lanling Daily photographer!' },
        { go: 'seats' },
      ],
      seats: [
        { m: 'Did you get my email? About the seats? 🙈' },
        { m: "I don't know who swapped them. Probably the wind 🪭" },
        { choice: [
            { t: 'You swapped the seats.', go: 'swapped' },
            { t: 'What email?', fx: { sus: { nhs: 2 } }, go: 'email' },
            { t: 'Thank you for the seats!! 🙏', fx: { sus: { nhs: 3 } }, go: 'thanks' },
            { t: 'Get lost.', go: 'lost' },
          ] },
      ],
      swapped: [
        { m: "I don't know what you're talking about! 🙈" },
        { m: "…you're welcome, though" },
        { go: 'end' },
      ],
      email: [
        { m: 'Brother Jiang… you texted me "You changed the seating chart." at 18:54 👀' },
        { m: '"hehe I swapped the seats~". Your inbox. You always read my emails. You just never answer them' },
        { go: 'end' },
      ],
      thanks: [
        { m: '…' },
        { m: 'Brother Jiang said thank you. To ME. With a 🙏' },
        { m: "I'm screenshotting this for my grandchildren 👀" },
        { go: 'end' },
      ],
      lost: [{ m: 'Getting lost!! 🙈' }, { m: '(not really)' }, { go: 'end' }],
      end: [free('nhs')],
    },
  });

  // ── 2. The quiz ──────────────────────────────────────────────────
  scene({
    id: 'nhs_quiz',
    thread: 'nhs',
    trigger: { on: 'scene', scene: 'nhs_balcony', delay: 200 },
    when: gossiping,
    nodes: {
      start: waitFor('nhs', 'quiz'),
      quiz: [
        lock('nhs'),
        { m: 'Oh!! Unrelated!!' },
        { m: 'Mianmian and I are planning the next reunion. What was the hotpot place we went to after the summer exams? I forgot~ 🙏' },
        { choice: [
            { t: 'Laoma Hotpot.', fx: { set: { nhs_quiz_ok: true } }, go: 'right' },
            { t: 'Why would I remember that.', fx: { sus: { nhs: 1 } }, go: 'dodge' },
            { t: 'Golden Ladle.', fx: { sus: { nhs: 4 } }, go: 'wrong1' },
            { t: 'Hotpot King?', fx: { sus: { nhs: 3 } }, go: 'wrong2' },
          ] },
      ],
      right: [
        { m: 'Laoma!!! Yes!!! 🙏' },
        { m: 'You ate eleven plates of lamb and fought Wei-xiong for the last fish ball', img: 'p_hotpot_alumni' },
        { m: "I knew you'd remember hehe~" },
        { go: 'end' },
      ],
      dodge: [
        { m: 'Hmm~ because you paid? 👀' },
        { m: "Hehe. I'll ask Mianmian" },
        { go: 'end' },
      ],
      wrong1: [
        { m: '…' },
        { m: 'Brother Jiang. Golden Ladle opened in 2019. We were fifteen 👀' },
        { m: 'Hmm.' },
        { go: 'end' },
      ],
      wrong2: [
        { m: 'Hotpot King is a karaoke bar, Brother Jiang 👀' },
        { m: "You've been. You sang. Once. We don't talk about it" },
        { m: 'Hmm.' },
        { go: 'end' },
      ],
      end: [free('nhs')],
    },
  });

  // ── 3. Alumni group: gala report ─────────────────────────────────
  scene({
    id: 'alumni_gossip',
    thread: 'alumni',
    trigger: { on: 'unlock', delay: 660 },
    when: night,
    nodes: {
      start: waitFor('alumni', 'report'),
      report: [
        lock('alumni'),
        { m: 'Gala report 🪭✨', from: 'nhs' },
        { m: "1. A-Ling's tie: gold (obviously)", from: 'nhs' },
        { m: '2. Brother Jiang and Zewu-jun ON THE BALCONY 👀', from: 'nhs' },
        { m: '3. A car?? In a pond?? 🐟', from: 'nhs' },
        { m: "4. Wen-xiong's van is parked across three spaces", from: 'nhs' },
        { m: 'Delete this.', from: 'lwj' },
        { m: 'LMAOOOO', from: 'wwx' },
        { m: "huaisang ur going to get us all killed. jiang cheng don't kill him he's small", from: 'wwx' },
        { m: "Tangtang's fever is gone and now she is wide awake asking why my phone keeps buzzing. Please be quieter in this chat.", from: 'mian' },
        { m: "Sorry about the van. I'll move it. Sorry.", from: 'wn' },
        { choice: [
            { t: 'Delete this.', go: 'delete' },
            { t: 'Huaisang.', go: 'name' },
            { t: 'lol yeah he basically confessed 😂', fx: { sus: { nhs: 3, wwx: 1 }, set: { nhs_spilled: true } }, go: 'lol' },
            { t: '[Say nothing]', silent: true, go: 'mian' },
          ] },
      ],
      delete: [
        { m: 'Two "Delete this"es!! 🙈 Fine, fine', from: 'nhs' },
        { unsend: true, from: 'nhs' },
        { m: 'he deleted one. there were four', from: 'wwx' },
        { go: 'mian' },
      ],
      name: [
        { m: 'Deleting!! Deleting!! 🙈', from: 'nhs' },
        { unsend: true, from: 'nhs' },
        { m: 'he said ur NAME. u know what that means', from: 'wwx' },
        { m: 'It means he will be at your door within the hour.', from: 'lwj' },
        { go: 'mian' },
      ],
      lol: [
        { m: 'WAIT WHAT', from: 'wwx' },
        { m: 'JIANG CHENG. CONFESSED???', from: 'wwx' },
        { m: '"lol"', from: 'mian' },
        { m: 'Oh no.', from: 'mian' },
        { m: '…', from: 'lwj' },
        { m: '😭😭😭🪭🪭🪭', from: 'nhs' },
        { go: 'mian' },
      ],
      mian: [
        free('alumni'),
        { m: "For what it's worth: he looked happy before you left. You looked like you did at summer school.", th: 'mian', from: 'mian' },
        { m: "Don't overthink it. (You will.)", th: 'mian', from: 'mian' },
        { m: "Also: Tangtang made A-Ling a birthday card. The dog has six legs. I'll leave it at the Lotus Pier gate on Sunday morning, if Old Huang lets me in.", th: 'mian', from: 'mian' },
      ],
    },
  });

  // ── 4. @teaspiller_qh posts #BalconyGate, part two — and the Jin board reads it ─
  // The gossip that could move the party (docs/SUNDAY.md beat 8): asked kindly, he takes it down and asks about Sunday.
  scene({
    id: 'nhs_post',
    thread: 'nhs',
    trigger: { on: 'scene', scene: 'nhs_quiz', delay: 240 },
    when: gossiping,
    nodes: {
      start: [{ if: (s) => F(s).nhs_spilled, go: 'hot', else: 'mild' }],
      mild: [{ add: { to: 'posts', item: balconyMild, notify: true } }, { go: 'dm' }],
      hot: [{ add: { to: 'posts', item: balconyHot, notify: true } }, { go: 'dm' }],
      dm: [
        { wait: 30 },
        { go: 'q' },
      ],
      q: waitFor('nhs', 'react', 'q'),
      react: [
        { if: (s) => !!F(s).nhs_knows, go: 'off' },
        lock('nhs'),
        { m: 'Brother Jiang!!! 😱' },
        { m: 'That tea account posted about the balcony AGAIN!! Part TWO!!' },
        { m: "I don't know who would DO such a thing 🙈" },
        { m: '(It already has 2,000 likes)' },
        { m: 'Also!! Unrelated!! The Jin board reads that account 👀' },
        { m: 'Treasurer Jin Zixun told my cousin\'s tea shop that if "the CEO in purple" is a story, A-Ling\'s 18th should be at Koi Tower. With press. "Managed" 🙈' },
        { choice: [
            { t: "Take it down, Huaisang. It's his birthday.", go: 'down' },
            { t: "It's you.", go: 'you' },
            { t: 'Who runs that account.', go: 'who' },
            { t: "omg I'm famous 😂", fx: { sus: { nhs: 3 } }, go: 'famous' },
          ] },
      ],
      you: [
        { m: "Me?? I don't even know what Wavelet is! 🙈" },
        { m: "I'm a simple painter of fans, Brother Jiang" },
        { m: '(how did you know)' },
        { unsend: true },
        { m: 'Goodnight!!! 🪭' },
        { go: 'end' },
      ],
      down: [
        { m: "I can't take down something I didn't post!!" },
        { m: '…' },
        { m: '"His birthday" 🥺' },
        { wait: 20 },
        { run: (api) => { try { api.store.remove('posts', 'post_balconygate2'); } catch (e) { /* already gone */ } } },
        { m: "…it's gone now. Weird! The internet is so mysterious 🙈" },
        { m: 'Brother Jiang… so there IS a Sunday? A dinner? 👀' },
        { m: "Am I… a 'few friends'? 🪭" },
        { choice: [
            { t: 'Six-thirty. Bring a fan. Post nothing.', fx: { set: { nhs_ally: true } }, go: 'invited' },
            { t: 'Family only.', go: 'family' },
            { t: "Don't push it.", go: 'push' },
          ] },
      ],
      invited: [
        { log: 'Got @teaspiller_qh to take #BalconyGate down, and asked Nie Huaisang to Sunday', once: 'nhs_ally' },
        { hint: 'Nie Huaisang is coming on Sunday.' },
        { m: '😭😭😭' },
        { m: "I'll bring the purple lotus fan!! And NOTHING else!!" },
        { m: '(My phone. I will bring my phone. But it will stay in my sleeve 🪭)' },
        { m: '(The tea account is taking a little holiday. I have heard.)' },
        { go: 'end' },
      ],
      family: [{ m: 'Understood!! 🙏' }, { m: "(I'm family-adjacent. Like a cousin. I have so many cousins)" }, { go: 'end' }],
      push: [{ m: 'Pushing nothing!! 🙈' }, { m: 'Not pushing at all. Look at me, standing very still 🪭' }, { go: 'end' }],
      who: [
        { m: "Nobody knows!!! It's a mystery!!! 🪭" },
        { m: "Some say it's a ghost. Some say it's a very bored chairman. I say: I don't know anything!" },
        { go: 'end' },
      ],
      famous: [
        { m: '😂??' },
        { m: "Brother Jiang… you've never laughed at a post in your life 👀" },
        { go: 'end' },
      ],
      end: [{ fx: { set: { nhs_done: true } } }, free('nhs')],
    },
  });

  // ── 5. Tea accepted: somehow, he knows ───────────────────────────
  scene({
    id: 'nhs_tea_knows',
    thread: 'nhs',
    trigger: { on: 'flag', flag: 'tea_yes', delay: 110 },
    when: gossiping,
    nodes: {
      start: waitFor('nhs', 'tea'),
      tea: [
        { if: (s) => !!F(s).nhs_knows, go: 'off' },
        lock('nhs'),
        { m: 'BROTHER JIANG' },
        { m: 'TEA??? AT THE HANSHI??? TOMORROW??? 🙈🙈🙈' },
        { m: "Don't ask how I know!!! I know nothing!!!" },
        { m: "(Zewu-jun just ordered the good white peony from my cousin's tea shop. At midnight. Express delivery. Hehe)" },
        { choice: [
            { t: 'How do you know that.', go: 'how' },
            { t: 'Mind your own business.', go: 'mind' },
            { t: "Yes!! I'm so nervous 😳", fx: { sus: { nhs: 3 } }, go: 'nervous' },
            { t: '[Leave him on read]', silent: true, go: 'read' },
          ] },
      ],
      how: [
        { m: 'I just told you how!! My cousin!! 🙈' },
        { m: "I have a lot of cousins, Brother Jiang. It's how I know nothing about everything" },
        { go: 'end' },
      ],
      mind: [{ m: 'This IS my business!! I swapped the seats!! I am a STAKEHOLDER 🪭' }, { go: 'end' }],
      nervous: [
        { m: '😳?????' },
        { m: 'Brother Jiang does not get nervous. Brother Jiang makes OTHER people nervous' },
        { m: '…Hmm 👀' },
        { go: 'end' },
      ],
      read: [
        { m: "Left on read!! I'll take that as a yes 🪭" },
        { m: 'Wear the grey coat!!' },
        { go: 'end' },
      ],
      end: [free('nhs')],
    },
  });

  // ── 6. The cover-up leaks → #KoiPondGate ─────────────────────────
  scene({
    id: 'koigate_leak',
    thread: 'jl',
    trigger: { on: 'flag', flag: 'car_cover', delay: 200 },
    when: night,
    nodes: {
      start: [
        { if: (s) => !F(s).car_cover, go: 'fizzle' },
        { add: { to: 'posts', item: koiPost, notify: true } },
        { log: '#KoiPondGate: the valet story leaked', once: 'koigate' },
        { if: (s) => !!D(s).scandal_breaks, go: 'again' },
        { fx: { set: { scandal: true, scandal_kind: 'koi', scandal_fixed: false } } },
        { start: 'scandal_breaks', delay: 6 },
      ],
      again: [{ fx: { set: { scandal_two: true } } }, { start: 'scandal_again', delay: 6 }],
      fizzle: [{ end: true }],
    },
  });

  // ── 7. #KoiPondGate / #BalconyGate trends: the Jin board wants the 18th at Koi Tower ─
  // Consequence scene (docs/SUNDAY.md "Consequences"). Fixable tonight → scandal_fixed; or left for the Saturday call.
  scene({
    id: 'scandal_breaks',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !!F(s).night_done, go: 'off' },
        { if: (s) => F(s).scandal_kind === 'balcony', go: 'b_wait' },
        { go: 'k_wait' },
      ],
      // ── koi: Jin Ling ──
      k_wait: waitFor('jl', 'koi', 'k_wait'),
      koi: [
        lock('jl'),
        { m: 'JIUJIU' },
        { m: 'CHECK WAVELET' },
        { m: '#KOIPONDGATE IS TRENDING' },
        { m: "the valet's granddaughter is in my CLASS. she filmed EVERYTHING" },
        { m: 'someone made a remix. it\'s called "blame the valet". it slaps. i hate it' },
        { m: 'Brother Jiang!!! 🐟 I know NOTHING about any koi!!! 🙈', th: 'nhs', from: 'nhs' },
        { if: (s) => !F(s).burned, go: 'k_wwx' },
        { go: 'k_ea' },
      ],
      k_wwx: [{ m: 'jiang cheng. "blame the valet"?? the lanling daily is calling it koipondgate', th: 'wwx', from: 'wwx' }, { go: 'k_ea' }],
      k_ea: [
        { m: 'The Lanling Daily has asked for a comment by 07:00. I have drafted "No comment." Please do not improve it.', th: 'ea', from: 'ea' },
        { hint: 'The Jin board noticed.' },
        { m: 'jiujiu' },
        { m: 'the board just emailed me. at 1am' },
        { m: '"in light of tonight\'s coverage" they want my 18th at koi tower. sunday. with a PRESS CALL' },
        { m: '"to reset the narrative"' },
        { m: "they're moving my birthday" },
        { choice: [
            { t: 'Go and find the valet. Tell him it was you. Then tell everyone.', go: 'k_own' },
            { t: "I'll deal with the board in the morning.", go: 'k_later' },
            { t: "Let them. It's one dinner.", fx: { aff: { jl: -1 } }, go: 'k_let' },
          ] },
      ],
      k_own: [
        { m: 'tonight??' },
        { m: '…' },
        { m: "ok. ok. he's still here. he's sitting on the bench by the pond" },
        { wait: 20 },
        { m: 'i told him' },
        { m: '"young master, i know. i saw you." and then he gave fairy ANOTHER biscuit' },
        { m: 'i posted it. under my own name' },
        { add: { to: 'posts', item: jlSorry, notify: true } },
        { fx: { set: { scandal_fixed: true, car_cover: false }, aff: { jl: 1 } } },
        { log: 'Made A-Ling own up to the valet in public. The Jin board backed down.', once: 'scandal_fixed' },
        { hint: 'The Jin board backed down.' },
        { wait: 8 },
        { m: 'the board says "acceptable". sunday stays where it is' },
        { m: 'that was the worst thing i ever did. and the best. dont tell anyone i said that' },
        { m: 'The Lanling Daily has withdrawn its question. Somebody apologised to a valet in public. I assume it was your influence.', th: 'ea', from: 'ea' },
        { go: 'k_end' },
      ],
      k_later: [
        { log: 'Left #KoiPondGate and the Jin board for the morning', once: 'scandal_later' },
        { m: "ok. u call them. ur scarier than them" },
        { m: "dont let them move it jiujiu" },
        { go: 'k_end' },
      ],
      k_let: [
        { log: 'Let the Jin board have A-Ling’s birthday', once: 'scandal_later' },
        { hint: 'A-Ling will remember that.' },
        { m: 'oh' },
        { m: 'ok' },
        { m: "it's fine. i'll do the press thing. in a tux. again" },
        { m: "i'll come to lotus pier after. for cake. if there's cake" },
        { go: 'k_end' },
      ],
      k_end: [free('jl')],
      // ── balcony: Tang Mei, then Jin Ling ──
      b_wait: waitFor('ea', 'bal', 'b_wait'),
      bal: [
        lock('ea'),
        { m: 'Mr. Jiang. @teaspiller_qh has posted the receipts. #BalconyGate is trending in Lanling and, for some reason, Qinghe.', th: 'ea', from: 'ea' },
        { m: 'The Jin board treasurer has called me twice. They propose moving A-Ling\'s birthday to Koi Tower, "where the press can be managed".', th: 'ea', from: 'ea' },
        { hint: 'The Jin board noticed.' },
        { m: 'jiujiu why is ur love life trending', th: 'jl', from: 'jl' },
        { m: 'the board wants my birthday at koi tower now. because of U', th: 'jl', from: 'jl' },
        { choice: [
            { t: 'Tell the board Lotus Pier has a gate, and Old Huang. No press gets in.', go: 'b_gate' },
            { t: "No comment. I'll call them in the morning.", go: 'b_later' },
            { t: 'Let them have it.', fx: { aff: { jl: -1 } }, go: 'b_let' },
          ], th: 'ea' },
      ],
      b_gate: [
        { m: '', th: 'huang', from: 'huang', voice: { dur: 12, text: 'Boss. Tang Mei call me. No camera on Sunday. I close the lake road. I have a stick. Okay. Bye.' } },
        { m: 'Noted. I have told the board that Lotus Pier has a gate and a sixty-three-year-old man with a stick. They have withdrawn the proposal.', th: 'ea', from: 'ea' },
        { fx: { set: { scandal_fixed: true } } },
        { log: 'Told the Jin board that Lotus Pier has a gate and Old Huang. They backed down.', once: 'scandal_fixed' },
        { hint: 'The Jin board backed down.' },
        { m: "old huang has a STICK??", th: 'jl', from: 'jl' },
        { m: 'ok. lotus pier. good', th: 'jl', from: 'jl' },
        { go: 'b_end' },
      ],
      b_later: [
        { log: 'Left #BalconyGate and the Jin board for the morning', once: 'scandal_later' },
        { m: 'Noted. "No comment" until nine.', th: 'ea', from: 'ea' },
        { m: "call them early. they get ideas after breakfast", th: 'jl', from: 'jl' },
        { go: 'b_end' },
      ],
      b_let: [
        { log: 'Let the Jin board have A-Ling’s birthday', once: 'scandal_later' },
        { hint: 'A-Ling will remember that.' },
        { m: 'Noted.', th: 'ea', from: 'ea' },
        { m: 'oh', th: 'jl', from: 'jl' },
        { m: "ok. i'll do the press thing. i'll come to lotus pier after. for cake", th: 'jl', from: 'jl' },
        { go: 'b_end' },
      ],
      b_end: [free('ea')],
    },
  });

  // A second hashtag after the first one was dealt with: Tang Mei holds the line until the morning call.
  scene({
    id: 'scandal_again',
    thread: 'ea',
    trigger: { on: 'manual' },
    when: night,
    nodes: {
      start: waitFor('ea', 'go'),
      go: [
        lock('ea'),
        { m: 'Mr. Jiang. There are now two hashtags.' },
        { m: 'The Jin board has called again about Sunday. I will say "No comment" until you call them in the morning.' },
        { fx: { set: { scandal: true, scandal_fixed: false } } },
        { hint: 'The Jin board noticed.' },
        free('ea'),
      ],
    },
  });

  // ── 8. Caught: suspicion with Nie Huaisang ≥ 8 → I Know Nothing → nhs_bargain ─
  const QUIET = ['nhs_balcony', 'nhs_quiz', 'nhs_post', 'nhs_tea_knows'];
  scene({
    id: 'caught_nhs',
    thread: 'nhs',
    trigger: { on: 'manual' },
    when: gossiping,
    nodes: {
      start: [
        ...QUIET.map((id) => ({ cancel: id })),
        lock('nhs'),
        { typing: 4 },
        { m: 'Hmm.' },
        { m: 'Brother Jiang' },
        { m: 'Can I tell you something funny? 🪭' },
        { m: 'Brother Jiang would rather die than use an emoji.' },
        { m: 'Brother Jiang has never said "please" in his life. Not to me. Not to Zewu-jun. Not to the gods.' },
        { m: 'Brother Jiang remembers every restaurant he has ever paid for.' },
        { m: 'So 👀' },
        { m: 'Who am I talking to?' },
        { choice: [
            { t: "It's me.", go: 'me' },
            { t: 'I found his phone in a taxi.', go: 'truth' },
            { t: '[Turn the phone face down]', silent: true, go: 'down' },
          ] },
      ],
      me: [{ m: 'Hehe~ no 🙈' }, { go: 'knows' }],
      truth: [{ m: 'A TAXI 😭😭😭' }, { m: 'Oh, this is the best night of my life' }, { go: 'knows' }],
      down: [
        { m: "I can see you're still reading, stranger 👀" },
        { m: "(I can't. But you believed me for a second, didn't you?)" },
        { go: 'knows' },
      ],
      knows: [
        { fx: { set: { nhs_knows: true } } },
        { hint: 'Nie Huaisang knows.' },
        free('nhs'),
        { start: 'nhs_bargain' },
      ],
    },
  });

  // ── 9. The bargain (consequence of I Know Nothing: confession to him, or caught) ─
  scene({
    id: 'nhs_bargain',
    thread: 'nhs',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        ...QUIET.map((id) => ({ cancel: id })),
        { fx: { set: { nhs_knows: true, busy_nhs: false } } },
        { if: (s) => !!F(s).night_done, go: 'off' },
        lock('nhs'),
        { if: (s) => !!D(s).caught_nhs, go: 'deal' },
        { typing: 3 },
        { m: 'Hmm~ 🪭' },
        { m: "So you're NOT Brother Jiang 👀" },
        { m: 'I knew it. Brother Jiang has never once answered me this fast' },
        { go: 'deal' },
      ],
      deal: [
        { m: "Don't worry!! I won't tell anyone. I don't know anything, remember? 🙈" },
        { m: 'But. A little something. For my silence 🪭' },
        { m: 'The Zewu-jun thread. Screenshots. All of it. For… research' },
        { choice: [
            { t: "No. That's his. Not mine to give.", go: 'no' },
            { t: '[Send him the balcony photo]', label: '[Send him the balcony photo and the Zewu-jun thread]', silent: true, go: 'shots' },
            { t: "Tell anyone and I'll tell everyone who @teaspiller_qh is.", go: 'threat' },
            { t: 'Get lost.', go: 'rude' },
          ] },
      ],
      no: [
        { m: '…' },
        { m: 'Hmm.' },
        { m: 'A stranger with manners 🪭 How rare' },
        { m: 'Fine. Then tell me something TRUE instead' },
        { choice: [
            { t: "His nephew turns eighteen on Sunday. Don't ruin it for him.", go: 'kind' },
            { t: 'He likes Lan Xichen. Obviously.', go: 'water' },
            { t: 'No.', go: 'nothing' },
          ] },
      ],
      kind: [
        { m: 'Ruin it?? I swapped the SEATS for him!! I am practically the godfather of this situation 🪭' },
        { m: '…' },
        { m: "Okay. No more posts tonight. Not about the balcony, not about the koi, not about A-Ling" },
        { m: 'I promise. On my fans' },
        { m: 'Is there… a dinner? On Sunday? 👀' },
        { m: "Do you think he'd let me come? I'd bring the purple lotus fan. I'd be so quiet. I'd be a decorative element" },
        { choice: [
            { t: "I'll tell him you kept quiet. He'll let you in.", fx: { set: { nhs_ally: true } }, go: 'ally' },
            { t: "I'll tell him you asked.", fx: { set: { nhs_ally: true } }, go: 'ally_ask' },
          ] },
      ],
      ally: [{ m: 'Deal!! 🙏' }, { go: 'ally_end' }],
      ally_ask: [{ m: "That's all I ever do, stranger. Ask 🪭" }, { go: 'ally_end' }],
      ally_end: [
        { log: 'Nie Huaisang found you out, and kept quiet for A-Ling’s sake', once: 'nhs_ally' },
        { hint: 'Nie Huaisang is on your side.' },
        { m: 'And give the phone back soon. Lotus Pier HQ. Before Tang Mei finds you' },
        { m: 'Tang Mei finds everyone' },
        { go: 'done' },
      ],
      water: [
        { m: 'Everybody knows that 🙈' },
        { m: "That's not tea, stranger. That's water" },
        { m: "Fine. I'll keep your secret anyway. I like a mystery more than I like a scoop" },
        { go: 'done' },
      ],
      nothing: [{ m: 'No!! 😭' }, { m: "Okay. I'll keep it anyway. You owe me one, stranger 🪭" }, { go: 'done' }],
      threat: [
        { m: '…' },
        { m: 'Ooh 🪭' },
        { m: "Brother Jiang would be proud. That's exactly what he'd say" },
        { m: 'Fine!! Mutually assured destruction!! I know nothing. You know nothing' },
        { log: 'Threatened Nie Huaisang into silence', once: 'nhs_threat' },
        { go: 'done' },
      ],
      shots: [
        { me: '', img: 'p_balcony_moon' },
        { me: '[3 screenshots: Zewu-jun]' },
        { typing: 3 },
        { m: '😭😭😭' },
        { m: 'The SLEEVE' },
        { m: 'Thank you, stranger. Pleasure doing business 🪭' },
        { log: 'Gave Nie Huaisang the balcony photo and Zewu-jun’s messages', once: 'nhs_leak' },
        { wait: 25 },
        { go: 'leak' },
      ],
      rude: [
        { m: 'Rude!! 😭' },
        { m: "Even the real one says 'get lost' with more love than that" },
        { m: "Okay. I won't tell anyone about YOU" },
        { m: '…I never promised anything about the balcony, though 🪭' },
        { log: 'Told Nie Huaisang to get lost. He did, straight to Wavelet.', once: 'nhs_leak' },
        { wait: 25 },
        { go: 'leak' },
      ],
      leak: [
        { add: { to: 'posts', item: balconyLeak, notify: true } },
        { fx: { set: { nhs_leak: true } } },
        { hint: 'Nie Huaisang will remember that.' },
        { if: (s) => !!D(s).scandal_breaks, go: 'leak_again' },
        { fx: { set: { scandal: true, scandal_kind: 'balcony', scandal_fixed: false } } },
        { start: 'scandal_breaks', delay: 8 },
        { go: 'done' },
      ],
      leak_again: [{ start: 'scandal_again', delay: 8 }, { go: 'done' }],
      done: [{ fx: { set: { nhs_done: true } } }, free('nhs')],
    },
  });

  S.onSuspicion('nhs', 8, 'caught_nhs');
})();
