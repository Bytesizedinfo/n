/* Live scenes — Nie Huaisang (`nhs`), the detective: balcony gossip, the Laoma Hotpot quiz, group `alumni`,
   @teaspiller_qh's #BalconyGate and #KoiPondGate, and the "caught" scene. Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;
  const waitFor = (k, next, self) => [
    { if: (s) => !F(s)['busy_' + k], go: next },
    { wait: 6 },
    { go: self || 'start' },
  ];
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });

  const balconyMild = {
    id: 'post_balconygate', by: 'teaspiller_qh', art: 'p_gala_hall', likes: 2481,
    text: 'Which CEO in purple fled a certain balcony at 11:15 tonight, right after a certain Chancellor in white said something soft? 🙈 Sources say the moon was involved. #BalconyGate #KoiTowerGala',
    comments: [
      { by: 'yiling_radish_king', text: 'LMAOOOO' },
      { by: 'rulan_jin', text: 'delete this' },
    ],
  };
  const balconyHot = {
    id: 'post_balconygate', by: 'teaspiller_qh', art: 'p_gala_hall', likes: 9132,
    text: 'Which CEO in purple fled a certain balcony at 11:15 tonight? Our sources say a certain Chancellor in white told him he MISSED him 😳 …and the CEO has CONFIRMED it?? 🙈🪭 #BalconyGate #KoiTowerGala',
    comments: [
      { by: 'yiling_radish_king', text: 'WAIT WHAT' },
      { by: 'rulan_jin', text: 'delete this' },
      { by: 'jingyi_lan', text: 'MR JIANG 💀💀💀' },
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

  // ── 1. "So........ the balcony" ──────────────────────────────────
  S.scene({
    id: 'nhs_balcony',
    thread: 'nhs',
    trigger: { on: 'unlock', delay: 130 },
    when: night,
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
        { m: 'Brother Jiang… "hehe I swapped the seats~"? It\'s right there in your inbox 👀' },
        { m: 'You always read my emails. You just never answer them' },
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
  S.scene({
    id: 'nhs_quiz',
    thread: 'nhs',
    trigger: { on: 'scene', scene: 'nhs_balcony', delay: 200 },
    when: night,
    nodes: {
      start: waitFor('nhs', 'quiz'),
      quiz: [
        lock('nhs'),
        { m: 'Oh!! Unrelated!!' },
        { m: 'Mianmian and I are planning the next reunion. What was the hotpot place we went to after the summer exams? I forgot~ 🙏' },
        { choice: [
            { t: 'Laoma Hotpot.', fx: { set: { nhs_quiz_ok: true } }, go: 'right' },
            { t: 'Why would I remember that.', fx: { sus: { nhs: 1 } }, go: 'dodge' },
            { t: 'Haidilao.', fx: { sus: { nhs: 4 } }, go: 'wrong1' },
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
        { m: 'Brother Jiang. We were fifteen. We were in Gusu. There was no Haidilao in Gusu 👀' },
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
  S.scene({
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
        { m: "It's past midnight and my daughter has just learned to climb out of her crib. Please be quieter in this chat.", from: 'mian' },
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
        { m: "For what it's worth: he looked happy before you left. You looked like you did at summer school.", th: 'mian', from: 'mian' },
        { m: "Don't overthink it. (You will.)", th: 'mian', from: 'mian' },
        free('alumni'),
      ],
    },
  });

  // ── 4. @teaspiller_qh posts #BalconyGate ─────────────────────────
  S.scene({
    id: 'nhs_post',
    thread: 'nhs',
    trigger: { on: 'scene', scene: 'nhs_quiz', delay: 240 },
    when: night,
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
        lock('nhs'),
        { m: 'Brother Jiang!!! 😱' },
        { m: 'Have you SEEN this?? Some anonymous account posted about the balcony!!', img: 'p_shot_gossip' },
        { m: "I don't know who would DO such a thing 🙈" },
        { m: '(It has 2,000 likes)' },
        { choice: [
            { t: "It's you.", go: 'you' },
            { t: 'Delete it.', go: 'del' },
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
      del: [
        { m: "I can't delete something I didn't post!!" },
        { wait: 20 },
        { run: (api) => { try { api.store.remove('posts', 'post_balconygate'); } catch (e) { /* already gone */ } } },
        { m: "…it's gone now. Weird! The internet is so mysterious 🙈" },
        { go: 'end' },
      ],
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
  S.scene({
    id: 'nhs_tea_knows',
    thread: 'nhs',
    trigger: { on: 'flag', flag: 'tea_yes', delay: 110 },
    when: night,
    nodes: {
      start: waitFor('nhs', 'tea'),
      tea: [
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
  S.scene({
    id: 'koigate_leak',
    thread: 'jl',
    trigger: { on: 'flag', flag: 'car_cover', delay: 200 },
    when: night,
    nodes: {
      start: [
        { if: (s) => !F(s).car_cover, go: 'fizzle' },
        { add: { to: 'posts', item: koiPost, notify: true } },
        { wait: 6 },
        { m: 'JIUJIU' },
        { m: 'CHECK WAVELET' },
        { m: '#KOIPONDGATE IS TRENDING' },
        { m: "the valet's granddaughter is in my CLASS. she filmed EVERYTHING" },
        { m: 'someone made a remix. it\'s called "blame the valet". it slaps. i hate it' },
        { m: 'Brother Jiang!!! 🐟 I know NOTHING about any koi!!! 🙈', th: 'nhs', from: 'nhs' },
        { m: 'jiang cheng. "blame the valet"?? the lanling daily is calling it koipondgate', th: 'wwx', from: 'wwx' },
        { m: 'The Lanling Daily has asked for a comment by 07:00. I have drafted "No comment." Please do not improve it.', th: 'ea', from: 'ea' },
        { wait: 6 },
        { ending: 'koigate' },
      ],
      fizzle: [{ end: true }],
    },
  });

  // ── 7. Caught: suspicion with Nie Huaisang ≥ 8 → I Know Nothing ─
  S.scene({
    id: 'caught_nhs',
    thread: 'nhs',
    trigger: { on: 'manual' },
    nodes: {
      start: [
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
      me: [{ m: 'Hehe~ no 🙈' }, { go: 'deal' }],
      truth: [{ m: 'A TAXI 😭😭😭' }, { m: 'Oh, this is the best night of my life' }, { go: 'deal' }],
      down: [
        { m: "I can see you're still reading, stranger 👀" },
        { m: "(I can't. But you believed me for a second, didn't you?)" },
        { go: 'deal' },
      ],
      deal: [
        { m: "Don't worry!! I won't tell anyone. I don't know anything, remember? 🙈" },
        { m: 'But I would LOVE a few screenshots. The Zewu-jun thread. All of it. For… research 🪭' },
        { m: 'And then you give the phone back to Lotus Pier HQ, and I will have never met you 🙏' },
        { wait: 5 },
        { ending: 'busted' },
      ],
    },
  });

  S.onSuspicion('nhs', 8, 'caught_nhs');
})();
