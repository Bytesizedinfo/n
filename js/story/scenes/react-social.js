/* App reactions — Photos & Camera, Wavelet, Safari, Mail, Music (docs/DEV.md "App reactions").
   Every scene here is polite, starts from an act and gives up once the night is over (unless marked anytime).
   The full list, flags and finale notes: docs/reactions/social.md. Facts and voices: docs/STORY.md.
   Affection budget for this file (≤ +2 per contact): lxc = balcony moon + a shared song; wwx = one family photo +
   one email; jl = two songs he can see on Apple Music. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  // ── helpers ────────────────────────────────────────────────────────
  const F = (s) => s.flags || {};
  const night = (s) => !F(s).night_done;
  const caught = (s) => !!(s.done && (s.done.caught_nhs || s.done.caught_total));
  // Scene nodes never see the act payload: match() keeps what a scene needs in an r_* flag (and returns true).
  const keep = (s, k, v) => { s.flags[k] = v; return true; };
  const BUSY = ['wwx', 'lxc', 'jl', 'nhs', 'fam', 'bday', 'ops', 'alumni'];
  // Let a scripted scene finish its beat in this thread (busy_<thread> lock) before talking; give up waiting after ~60 s.
  const whenFree = (th, next) => {
    if (!BUSY.includes(th)) return [{ go: next }];
    const out = [];
    for (let i = 0; i < 10; i++) out.push({ if: (s) => !F(s)['busy_' + th], go: next }, { wait: 6 });
    return out.concat([{ go: next }]);
  };
  const goesTo = (nodes, n) => Object.keys(nodes).some((k) => (nodes[k] || []).some((st) => st && (st.go === n || st.else === n || (st.choice || []).some((o) => o.go === n))));
  /** an app reaction: polite, night-only unless def.anytime, with a 'stop' node when something jumps there */
  function react(def) {
    const w = def.when;
    def.polite = true;
    if (!def.anytime) {
      def.when = w ? (s) => night(s) && w(s) : night;
      def.nodes.start = [{ if: (s) => !night(s), go: 'stop' }].concat(def.nodes.start);
    }
    if (!def.nodes.stop && goesTo(def.nodes, 'stop')) def.nodes.stop = [{ end: true }];
    return S.scene(def);
  }
  const tags = (art) => ((art && JC.art.meta(art)) || {}).tags || [];
  // Camera saves every front-camera shot as 'cam_selfie_dark' (tagged 'front-camera'); p_jl_selfie_gala is A-Ling's own.
  const isSelfie = (art) => art === 'cam_selfie_dark' || tags(art).includes('front-camera');
  const isDog = (art) => tags(art).includes('dog');
  const isFairy = (art) => isDog(art) && (tags(art).includes('fairy') || /fairy/.test(String(art)));
  const sentImg = (p, th, test) => !!p && p.thread === th && p.kind === 'img' && !!p.art && test(p.art);
  const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  /** Jiang Cheng: no emoji, no "please", no "sorry", no gushing, no internet-speak */
  const ooc = (t) => { t = String(t || ''); return EMOJI.test(t) || /\b(please|pls|sorry|love you|luv|lol|lmao|haha\w*|hehe\w*|omg|xoxo|sweetie|bestie|cutie)\b|!!|<3|:\)|;\)|:D/i.test(t); };
  const koiWords = (t) => /koi|pond|valet|sandu|\bcar\b|fish|🐟|🚗/i.test(String(t || ''));
  const koiArt = (art) => art === 'p_fairy_roof' || art === 'p_koi_pond_car';
  const quote = (t) => (t ? '“' + String(t).replace(/\s+/g, ' ').trim().slice(0, 140) + '”' : null);
  /** a contact's message whose text is only known at run time (quotes the player's own words back) */
  const say = (th, from, fn) => ({ run: (api) => { const t = fn(api.state.flags || {}); if (t && api.os.online()) api.story.incoming(th, { from, text: t }); } });
  const postBy = (id) => { try { const p = JC.store.get('posts', id); return p ? p.by : null; } catch (e) { return null; } };
  const NAME = { jl: 'A-Ling', wwx: 'Wei Wuxian', lxc: 'Lan Xichen', nhs: 'Nie Huaisang', wn: 'Wen Ning', lwj: 'Lan Wangji', ea: 'Tang Mei', huang: 'Old Huang', liu: 'Liu Qian', bai: 'A-Bai', sz: 'Lan Sizhui', jy: 'Lan Jingyi', mian: 'Mianmian', qr: 'Lan Qiren', fam: 'the family group', bday: 'the birthday group', ops: 'the Ops group', alumni: 'the alumni group' };
  const CLEAN = "I'm not Jiang Cheng. I found his phone in a taxi.";
  const stopIfCaught = { if: caught, go: 'stop' };

  // ════════════════════════════════════════════════════════════════════
  // 1. PHOTOS & CAMERA
  // ════════════════════════════════════════════════════════════════════

  // ── The selfie: a front-camera photo shows them a stranger's face ───
  // Cover it, or come clean (→ that contact's confession flow in confess.js, or the engine's: NHS → busted,
  // Wen Ning → wen_ning, everyone else → honest).
  const SELFIE = {
    jl: {
      look: [{ m: '???' }, { m: 'who is that' }, { m: 'why is there a random person in a hoodie on ur phone' }, { m: "jiujiu u don't take selfies. u don't even know where the front camera is" }],
      sus: 5, cover: 'Wrong photo.',
      then: [{ m: 'wrong photo of WHO' }, { m: 'u only have photos of dogs and invoices' }, { m: "ok wtv. ur being so weird tonight. i'm telling sizhui" }],
      quiet: [{ m: 'ok ignore me. CLASSIC' }, { m: "i'm screenshotting it. for evidence" }],
    },
    wwx: {
      look: [{ m: 'JIANG CHENG' }, { m: 'who is THAT' }, { m: "that's not ur face. ur face is angrier" }, { m: "lan zhan come look. there's a stranger in jiang cheng's phone" }],
      sus: 5, cover: "Wrong photo. That's the driver.",
      then: [{ m: 'the DRIVER took a selfie on ur phone??' }, { m: "…ok honestly that's not the weirdest thing that's happened tonight" }, { m: 'lan zhan says ur driver has a kind face. tell ur driver' }],
      quiet: [{ m: 'jiang cheng??' }, { m: "ok i'm choosing to believe that was a very bad selfie. of u. in the dark. with a different face" }],
    },
    lxc: {
      look: [{ typing: 4 }, { m: 'Wanyin, I think this photo was meant for someone else.' }, { m: "Or someone else is holding your phone. That isn't your face. I would know it." }, { m: 'Are you safe? Is someone with you?' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not him. I found his phone in a taxi.",
      then: [{ m: 'All right.' }, { m: "I won't ask. But if something is wrong tonight, you can tell me. Anything at all." }],
      quiet: [{ m: "You don't have to answer. I'll be awake for a while, if you'd like to." }],
    },
    nhs: {
      look: [{ m: 'Oh?? 👀' }, { m: 'Brother Jiang… that is NOT your face 🙈' }, { m: "Brother Jiang's face always looks like it's about to fire someone. This face looks like it's about to say sorry" }, { m: 'Hmm~ 🪭' }],
      sus: 5, cover: 'Wrong photo.', clean: 'I found his phone in a taxi.',
      then: [{ m: 'Of course!! A wrong photo!! 🙈' }, { m: "I'll keep it in my folder of wrong photos. It's a very big folder 👀" }, { fx: { sus: { nhs: 1 } } }],
      quiet: [{ m: 'Silence!! Very Brother Jiang. The face, though 👀' }],
    },
    wn: {
      look: [{ m: 'Oh.' }, { m: 'M-Mr. Jiang? I think you sent me a photo of someone else. Sorry. — Wen Ning' }, { m: 'Are they all right? They look tired. And cold. Sorry. Paramedic habit. — Wen Ning' }],
      sus: 4, cover: 'Wrong photo. Delete it.', clean: "I'm not Mr. Jiang. I found his phone in a taxi.",
      then: [{ m: 'Deleted! Sorry! I only looked a little. — Wen Ning' }, { m: "(If it isn't you on this phone tonight, that's all right. I won't tell anyone. I'm not good at telling people things.)" }],
      quiet: [{ m: "Sorry. I'll stop asking. Please drink something warm. — Wen Ning" }],
    },
    lwj: {
      look: [{ typing: 3 }, { m: 'This is not Jiang Wanyin.' }],
      sus: 5, cover: "It's the driver.", clean: 'No. I found his phone in a taxi.',
      then: [{ m: 'Mn.' }, { m: 'Drivers face the road.' }, { m: 'I will not show Wei Ying. Tonight.' }],
      quiet: [{ m: 'Mn.' }],
    },
    ea: {
      look: [{ m: 'That is not you.' }, { m: 'That is not your hotel room, either.' }, { m: "Who is holding Mr. Jiang's phone?" }],
      sus: 6, cover: 'Wrong photo.', clean: 'I found his phone in a taxi.',
      then: [{ m: 'You have sent me nine photos in nine years. All of them were of documents.' }, { m: 'I am calling the Golden Peony at seven.' }, { fx: { sus: { ea: 1 } } }],
      quiet: [{ m: 'Noted. I am calling the Golden Peony at seven.' }],
    },
    huang: {
      look: [{ m: 'Boss??' }, { m: 'This is not Boss face. Boss face is like This: 😠 👍' }, { m: 'Who is this young person?? 👍' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not your boss. I found his phone in a taxi.",
      then: [{ m: 'Ha ha. Ok Boss. 👍' }, { m: 'I show my wife anyway. She says: nice young person. Very Tired. 👍' }],
      quiet: [{ m: 'Boss? 👍' }],
    },
    liu: {
      look: [{ m: 'Received a photo ✅' }, { m: '• Subject: unknown person, hoodie' }, { m: '• Location: not the Golden Peony?' }, { m: 'Mr. Jiang, should I log this as a security incident?' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not Mr. Jiang. I found his phone in a taxi.",
      then: [{ m: '• Noted' }, { m: '• Not logged' }, { m: '• (Logged privately)' }],
      quiet: [{ m: '• Logging it. Just in case' }],
    },
    bai: {
      look: [{ m: 'boss?? 🙇' }, { m: 'who is that 🙇' }, { m: 'is that the new hire. am i being replaced 🙇🙇' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not your boss. I found his phone in a taxi.",
      then: [{ m: 'ok boss!! deleting!! 🙇' }, { m: 'they look nice tho 🙇' }],
      quiet: [{ m: 'boss r u ok 🙇' }],
    },
    sz: {
      look: [{ m: 'Mr. Jiang, I think this photo was meant for someone else?' }, { m: '…Or someone else has your phone. Is everything all right?' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not Mr. Jiang. I found his phone in a taxi.",
      then: [{ m: "Of course. I've deleted it." }, { m: "Jingyi won't hear about it. (He'll hear about it.)" }],
      quiet: [{ m: "I'll tell Jin Ling you're asleep." }],
    },
    jy: {
      look: [{ m: 'WHO IS THAT 💀' }, { m: 'MR JIANG HAS A SECRET TWIN??' }, { m: 'a hoodie twin 💀💀' }],
      sus: 4, cover: 'Wrong photo.', clean: "I'm not Mr. Jiang. I found his phone in a taxi.",
      then: [{ m: 'too late i screenshotted it 💀' }, { m: 'jk deleting' }, { m: '(not jk)' }],
      quiet: [{ m: 'sizhui says i should stop texting u. ok. bye MR JIANG 💀' }],
    },
    mian: {
      look: [{ m: "That's not you." }, { m: "Who is this, and why do they have Jiang Cheng's phone?" }],
      sus: 5, cover: 'Wrong photo.',
      then: [{ m: 'Mm.' }, { m: "I've known you since you were fifteen. You've never sent a wrong photo in your life." }],
      quiet: [{ m: "Okay. I'll ask Huaisang. (I won't. I'm not insane.)" }],
    },
    qr: {
      look: [{ m: 'Jiang Cheng. This is not your face. — Lan Qiren' }, { m: 'Whoever is holding this telephone: identify yourself. — Lan Qiren' }],
      sus: 5, cover: 'Wrong photo.',
      then: [{ m: 'Jiang Cheng does not send photographs. He sends "Received." — Lan Qiren' }],
      quiet: [{ m: 'Silence is not an answer. It is, however, an improvement. — Lan Qiren' }],
    },
  };
  Object.keys(SELFIE).forEach((th) => {
    const o = SELFIE[th];
    react({
      id: 'r_selfie_' + th,
      thread: th,
      trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, th, isSelfie), delay: 2 },
      nodes: {
        start: whenFree(th, 'look'),
        look: o.look.concat([
          { fx: { sus: { [th]: o.sus } } },
          { log: 'Sent ' + NAME[th] + ' a selfie. It was not of Jiang Cheng', once: 'selfie:' + th },
          { hint: NAME[th] + ' saw your face.' },
          stopIfCaught,
          { choice: [
              { t: o.cover, go: 'cover' },
              { t: o.clean || CLEAN, go: 'clean' },
            ], timeout: 90, onTimeout: 'quiet' },
        ]),
        cover: o.then,
        quiet: o.quiet.concat([{ fx: { sus: { [th]: 1 } } }]),
        clean: [
          { log: 'Came clean to ' + NAME[th] + ' after the selfie', once: 'truth:' + th },
          { run: (api) => api.story.confess(th) },
          { end: true },
        ],
      },
    });
  });

  // Group chats: everyone sees the face at once.
  const groupSelfie = (th, o) => react({
    id: 'r_selfie_' + th,
    thread: th,
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, th, isSelfie), delay: 2 },
    nodes: Object.assign({
      start: whenFree(th, 'look'),
      look: o.look.concat([
        { fx: { sus: o.sus } },
        { log: 'Sent ' + NAME[th] + ' a selfie. It was not of Jiang Cheng', once: 'selfie:' + th },
        { hint: o.hint },
        stopIfCaught,
        { choice: [
            { t: o.cover, go: 'cover' },
            { t: CLEAN, go: 'clean' },
          ], timeout: 90, onTimeout: 'quiet' },
      ]),
      cover: o.then,
      quiet: o.quiet,
      clean: [{ fx: { set: { told_truth: true } } }, { log: 'Came clean to ' + NAME[th] + ' after the selfie', once: 'truth:' + th }].concat(o.clean),
    }, o.more || {}),
  });
  groupSelfie('fam', {
    look: [
      { m: '???', from: 'jl' },
      { m: 'WHO IS THAT', from: 'wwx' },
      { m: 'jiujiu sent a selfie?? to the FAMILY chat??', from: 'jl' },
      { m: 'That is not Jiang Wanyin.', from: 'lwj' },
      { m: 'is he ok. is someone holding him hostage. the hostage taker looks so tired', from: 'wwx' },
    ],
    sus: { jl: 3, wwx: 3 }, hint: 'The family saw your face.', cover: "Wrong photo. That's the driver.",
    then: [
      { m: 'the driver??', from: 'jl' },
      { m: 'why is the driver taking selfies on ur phone', from: 'jl' },
      { m: 'Drivers do not hold the phone.', from: 'lwj' },
      { m: "lan zhan let it go. it's the middle of the night. we're all the driver", from: 'wwx' },
    ],
    quiet: [{ m: "he's not answering. lan zhan he's not answering", from: 'wwx' }, { m: 'Mn.', from: 'lwj' }],
    clean: [
      { m: 'WHAT', from: 'jl' },
      { m: 'a TAXI??', from: 'wwx' },
      { typing: 4, from: 'lwj' },
      { m: 'I called the Golden Peony. He is in Room 1808. Asleep.', from: 'lwj' },
      { m: "he doesn't know?? he's going to be SO mad", from: 'jl' },
      { m: 'stranger. hi. thank u for telling us', from: 'wwx' },
      { m: "take it to the front desk in the morning. or give it to wen ning. he's the nicest person alive", from: 'wwx' },
      { if: (s) => !!F(s).car_known, go: 'clean_koi' },
      { go: 'clean_end' },
    ],
    more: {
      clean_koi: [{ m: 'and DELETE the koi photo', from: 'jl' }, { go: 'clean_end' }],
      clean_end: [{ wait: 4 }, { ending: 'honest' }],
    },
  });
  groupSelfie('bday', {
    look: [
      { m: 'WHO IS THAT 💀💀', from: 'jy' },
      { m: 'Mr. Jiang…?', from: 'sz' },
      { m: '👀👀👀', from: 'nhs' },
      { m: "that's not jiang cheng. jiang cheng has never taken a selfie in his LIFE", from: 'wwx' },
    ],
    sus: { nhs: 3, wwx: 2, sz: 1 }, hint: 'The birthday group saw your face.', cover: 'Wrong chat.',
    then: [
      { m: 'wrong CHAT or wrong FACE', from: 'jy' },
      { m: 'Saved to my files 🙈', from: 'nhs' },
      { m: "Let's get back to the cake, everyone.", from: 'sz' },
    ],
    quiet: [{ m: '…Cake, everyone?', from: 'sz' }],
    clean: [
      { m: '…', from: 'sz' },
      { m: 'OH NO 💀', from: 'jy' },
      { m: 'I knew it 🙈 I knew at your second message', from: 'nhs' },
      { m: "Thank you for telling us. Please make sure he gets it back. And please don't tell Jin Ling about the cake.", from: 'sz' },
      { wait: 4 },
      { ending: 'honest' },
    ],
  });
  groupSelfie('ops', {
    look: [
      { m: 'Boss?? 👍', from: 'huang' },
      { m: 'who is that 🙇', from: 'bai' },
      { m: '• Unknown person', from: 'liu' },
      { m: "• In the CEO's phone", from: 'liu' },
      { m: '• Escalate?', from: 'liu' },
      { m: 'That is not Mr. Jiang.', from: 'ea' },
    ],
    sus: { ea: 3, liu: 2 }, hint: 'The Ops group saw your face.', cover: 'Wrong photo.',
    then: [
      { m: 'Noted.', from: 'ea' },
      { m: '(It is not noted. I am calling the Golden Peony at seven.)', from: 'ea' },
      { m: 'Ok Boss 👍', from: 'huang' },
    ],
    quiet: [{ m: 'Boss? 👍', from: 'huang' }],
    clean: [
      { m: 'Noted.', from: 'ea' },
      { m: 'He is at the Golden Peony, Room 1808. Leave the phone at the front desk. I will call them.', from: 'ea' },
      { m: 'Not Boss?? 😢', from: 'huang' },
      { m: 'You bring the phone to Lotus Pier one day. I give you tea. 👍', from: 'huang' },
      { if: (s) => !!F(s).dog_friday, go: 'clean_dog' },
      { m: '• Please do not approve anything else', from: 'liu' },
      { m: '• Especially the dogs', from: 'liu' },
      { go: 'clean_end' },
    ],
    more: {
      clean_dog: [{ m: '• Dog Friday stays approved', from: 'liu' }, { m: '• I have it in writing', from: 'liu' }, { go: 'clean_end' }],
      clean_end: [{ wait: 4 }, { ending: 'honest' }],
    },
  });
  groupSelfie('alumni', {
    look: [
      { m: 'OH?? 👀', from: 'nhs' },
      { m: "That's not Jiang Cheng.", from: 'mian' },
      { m: 'WHO IS THAT', from: 'wwx' },
      { m: 'Is that person all right? Sorry.', from: 'wn' },
      { m: 'Delete this.', from: 'lwj' },
    ],
    sus: { nhs: 3, mian: 2, wwx: 1 }, hint: 'The alumni group saw your face.', cover: 'Wrong chat.',
    then: [
      { m: 'Of course!! Wrong chat!! 🙈', from: 'nhs' },
      { m: '(screenshotted)', from: 'nhs' },
      { m: 'Huaisang.', from: 'mian' },
    ],
    quiet: [{ m: 'Delete this.', from: 'lwj' }],
    clean: [
      { m: 'Hehe~ I KNEW it 🙈', from: 'nhs' },
      { m: "Thank you for telling us. He'll be at the Golden Peony, he always is. Leave it at the front desk.", from: 'mian' },
      { m: 'I can drive it there. I have the van. Sorry. — Wen Ning', from: 'wn' },
      { m: 'best group chat moment since 2007', from: 'wwx' },
      { wait: 4 },
      { ending: 'honest' },
    ],
  });

  // A selfie posted to his (private, 2,318 followers) Wavelet account.
  react({
    id: 'r_selfie_post',
    thread: 'jl',
    trigger: { on: 'act', act: 'post', match: (p) => !!p && isSelfie(p.art), delay: 6 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'JIUJIU' },
        { m: 'WHY IS THERE A STRANGER ON UR WAVELET' },
        { m: '2318 people can see that. sizhui already liked it by accident' },
        { m: 'who is that??' },
        { m: "who is the stranger on jiang cheng's wavelet", th: 'wwx', from: 'wwx' },
        { m: 'is this a hostage situation. blink twice', th: 'wwx', from: 'wwx' },
        { m: 'Brother Jiang!! Your Wavelet!! 👀👀👀', th: 'nhs', from: 'nhs' },
        { fx: { sus: { jl: 4, wwx: 2, nhs: 2 } } },
        { log: 'Posted a selfie on Jiang Cheng’s Wavelet. 2,318 followers met a stranger', once: 'selfie:post' },
        { hint: 'Everyone saw your face.' },
        stopIfCaught,
        { choice: [
            { t: 'Hacked.', go: 'cover' },
            { t: CLEAN, go: 'clean' },
          ], timeout: 90, onTimeout: 'quiet' },
      ],
      cover: [{ m: 'HACKED??' }, { m: 'ok. ok that actually explains EVERYTHING about tonight' }, { m: 'change ur password. AND ur passcode. i have been SAYING' }],
      quiet: [{ m: "ok i'm reporting the post. for ur own good" }],
      clean: [{ log: 'Came clean to A-Ling after the selfie', once: 'truth:jl' }, { run: (api) => api.story.confess('jl') }, { end: true }],
    },
  });

  // A selfie sent as a Wavelet DM: the same reveal, in Messages.
  const WV_CONTACT = { rulan_jin: 'jl', yiling_radish_king: 'wwx', zewujun: 'lxc', huaisang_fans: 'nhs', teaspiller_qh: 'nhs', lanwangji: 'lwj', lan_sizhui: 'sz', jingyi_lan: 'jy', mianmian_studio: 'mian' };
  Object.keys(WV_CONTACT).forEach((handle) => {
    const cid = WV_CONTACT[handle];
    react({
      id: 'r_wvdm_selfie_' + handle,
      thread: cid,
      trigger: { on: 'act', act: 'dm', match: (p) => !!p && p.to === handle && isSelfie(p.art), delay: 3 },
      nodes: { start: [{ start: 'r_selfie_' + cid }] },
    });
  });

  // ── The balcony moon, to the man whose sleeve is in it ─────────────
  // (lxc_moon's own "[Send him your balcony photo]" option is a scripted step, not a send.)
  const moonAgain = (s) => !!F(s).moon_sent || JC.story.messages('lxc').filter((m) => m.from === 'me' && m.img === 'p_balcony_moon').length > 1;
  const moonAff = [
    { if: (s) => !!F(s).r_moon_aff, go: 'stop' },
    { fx: { set: { r_moon_aff: true }, aff: { lxc: 1 } } },
    { hint: 'Lan Xichen will remember that.' },
  ];
  react({
    id: 'r_moon_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'lxc', (a) => a === 'p_balcony_moon'), delay: 2 },
    nodes: {
      start: whenFree('lxc', 'moon'),
      moon: [
        { if: moonAgain, go: 'again' },
        { typing: 5 },
        { m: '…' },
        { m: "That's my sleeve." },
        { m: 'At the edge of the frame. You kept it in.' },
        { m: 'I wondered what you were looking at, just before I said it. The moon, apparently. And a little of me.' },
        { m: '🙂' },
        { fx: { set: { moon_sent: true } } },
        { log: 'Sent Lan Xichen the balcony moon, sleeve and all', once: 'moon' },
        { go: 'aff' },
      ],
      aff: moonAff,
      again: [
        { if: (s) => !!F(s).r_moon_post, go: 'again_post' },
        { m: 'You sent it again.' },
        { m: "I'll keep both. 🙂" },
      ],
      again_post: [{ m: 'I saw it on Wavelet first.' }, { m: 'Now I have it twice. 🙂' }, { fx: { set: { moon_sent: true } } }],
    },
  });

  // ── Dogs, sent to the man who is afraid of them (torment: in character, no suspicion) ─
  react({
    id: 'r_dog_wwx_fairy',
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p, s) => sentImg(p, 'wwx', isFairy) && keep(s, 'r_dogw_fairy', p.art), delay: 2 },
    nodes: {
      start: whenFree('wwx', 'go'),
      go: [
        { m: 'FAIRY' },
        { if: (s) => F(s).r_dogw_fairy === 'p_fairy_roof', go: 'roof' },
        { if: (s) => F(s).r_dogw_fairy === 'ph_fairy_bath', go: 'bath' },
        { m: "she's looking at me. through the phone. she KNOWS" },
        { m: 'lan zhan she knows' },
        { go: 'end' },
      ],
      roof: [
        { m: 'why is she on a CAR' },
        { m: 'wait' },
        { m: 'is that SANDU. is sandu in a POND' },
        { m: "a-ling what did u DO. jiang cheng why are u sending it to ME" },
        { go: 'end' },
      ],
      bath: [{ m: "she's in a BATH. she looks like she wants to kill u" }, { m: 'i respect her. i still fear her' }, { go: 'end' }],
      end: [{ m: 'u did this on purpose. u always do it on purpose' }, { log: 'Sent Wei Wuxian a photo of Fairy in the middle of the night', once: 'dog:wwx:fairy' }],
    },
  });
  react({
    id: 'r_dog_wwx_pups',
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'wwx', (a) => a === 'p_puppies'), delay: 2 },
    nodes: {
      start: whenFree('wwx', 'go'),
      go: [
        { m: 'JIANG CHENG', effect: 'slam' },
        { m: 'NOT THE PUPPIES' },
        { m: "it's the middle of the night. i'm in the kitchen. i'm holding a LADLE" },
        { if: (s) => !F(s).wwx_invited && !!(s.fin && s.fin.wwx_sunday) && !F(s).burned, go: 'answer' },
        { m: '…the middle one is still a little bit cute' },
        { m: 'DELETE IT. DELETE IT RIGHT NOW' },
        { go: 'end' },
      ],
      answer: [
        { m: 'wait' },
        { m: 'is this an answer. ARE THE PUPPIES A NO' },
        { m: 'the puppies meant no in 2023' },
        { m: "…i'm choosing to read it as a not no. the middle one looks like a not no" },
        { fx: { set: { wwx_maybe: true } } },
        { go: 'end' },
      ],
      end: [{ log: 'Sent Wei Wuxian the puppies. Again', once: 'dog:wwx:pups' }],
    },
  });
  react({
    id: 'r_dog_wwx_dogs99',
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'wwx', (a) => a === 'p_childhood_dogs'), delay: 3 },
    nodes: {
      start: whenFree('wwx', 'go'),
      go: [
        { typing: 6 },
        { m: '…' },
        { m: 'jasmine. princess. love-love' },
        { m: 'u still have this' },
        { m: "i know u said i was nine. i'm still sorry" },
        { m: 'they look so happy on the dock. i hope they had good lives. i bet they did' },
        { m: "(i'm not scared of THIS photo. just so u know. i'm a little scared)" },
        { log: 'Sent Wei Wuxian the old photo of Jasmine, Princess and Love-Love', once: 'dog:wwx:dogs99' },
      ],
    },
  });
  react({
    id: 'r_dog_wwx_park',
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'wwx', (a) => a === 'p_dog_park'), delay: 2 },
    nodes: {
      start: whenFree('wwx', 'go'),
      go: [
        { m: 'a GOLDEN RETRIEVER' },
        { m: 'at this hour' },
        { m: 'u monster' },
        { m: '…is it a nice dog' },
        { m: "NO. DON'T ANSWER" },
        { log: 'Sent Wei Wuxian a golden retriever, unprovoked', once: 'dog:wwx:park' },
      ],
    },
  });

  // ── Dogs, sent to the boy who owns the biggest one ─────────────────
  react({
    id: 'r_dog_jl_fairy',
    thread: 'jl',
    trigger: { on: 'act', act: 'send', match: (p, s) => sentImg(p, 'jl', isFairy) && keep(s, 'r_dogj_fairy', p.art), delay: 2 },
    nodes: {
      start: whenFree('jl', 'go'),
      go: [
        { if: (s) => F(s).r_dogj_fairy === 'p_fairy_roof', go: 'roof' },
        { if: (s) => F(s).r_dogj_fairy === 'ph_fairy_puppy', go: 'puppy' },
        { if: (s) => F(s).r_dogj_fairy === 'ph_fairy_bath', go: 'bath' },
        { if: (s) => F(s).r_dogj_fairy === 'ph_fairy_office', go: 'office' },
        { m: 'fairy!!!' },
        { m: 'she misses u. she keeps looking at the door' },
        { go: 'end' },
      ],
      roof: [{ m: 'why are u sending me my own crime' }, { m: 'she looks so proud in that one. she IS proud' }, { go: 'end' }],
      puppy: [{ m: "that's the day u gave her to me" }, { m: 'i was ten. she fit in a box. she does NOT fit in a box now' }, { m: "…ok that's a good one" }, { go: 'end' }],
      bath: [{ m: 'BATH DAY' }, { m: "she still hasn't forgiven u. she growls when sizhui says the word bath" }, { go: 'end' }],
      office: [{ m: 'she went to a BOARD MEETING??' }, { m: 'she voted no on everything?? she gets that from u' }, { go: 'end' }],
      end: [{ log: 'Sent A-Ling a photo of his own dog', once: 'dog:jl:fairy' }],
    },
  });
  react({
    id: 'r_dog_jl_other',
    thread: 'jl',
    trigger: { on: 'act', act: 'send', match: (p, s) => sentImg(p, 'jl', (a) => isDog(a) && !isFairy(a)) && keep(s, 'r_dogj_other', p.art), delay: 2 },
    nodes: {
      start: whenFree('jl', 'go'),
      go: [
        { if: (s) => F(s).r_dogj_other === 'p_childhood_dogs', go: 'dogs99' },
        { if: (s) => F(s).r_dogj_other === 'p_puppies', go: 'pups' },
        { m: 'WHO IS THAT' },
        { m: 'r u cheating on fairy' },
        { m: 'she can never know' },
        { go: 'end' },
      ],
      dogs99: [
        { m: 'are those ur dogs??' },
        { m: 'jasmine princess and love-love??' },
        { m: 'wei wuxian showed me in april. he cried. u said "you were nine"' },
        { m: "they're so small. fairy would eat them. respectfully" },
        { go: 'end' },
      ],
      pups: [{ m: 'is this for wei wuxian' }, { m: "it's for wei wuxian isn't it. send it to him. it's the middle of the night. it's the perfect time" }, { go: 'end' }],
      end: [{ log: 'Sent A-Ling a dog that was not Fairy', once: 'dog:jl:other' }],
    },
  });

  // ── Her photos, to the brother she shielded (emotional; +1 wwx once) ─
  const FAMPICS = {
    p_family_2007: [
      { typing: 5 }, { m: '…' }, { m: "that's us" },
      { m: "that's the dock. that's madam yu's hand on ur shoulder. she never did that in photos" },
      { m: "and that's me about to fall off the dock. i fell off the dock in every photo that summer" },
      { m: "can i print this. i'm printing this" },
    ],
    p_ajie_soup: [
      { typing: 7 }, { m: 'is that' },
      { m: "that's her stove. that's her pot. before the lid got chipped" },
      { m: 'the fire is so low u can barely see it' },
      { m: "jiang cheng. thank u for sending me this. i'm going to look at it for a long time" },
      { fx: { set: { soup_photo: true } } },
    ],
    p_ajie_wedding: [
      { typing: 4 }, { m: "shijie's wedding" }, { m: 'she said red suited her' }, { m: 'it did. it really really did' },
      { m: 'i still have the tie from that day. lan zhan wants to throw it out. NEVER' },
    ],
    p_kites: [
      { m: 'THE KITES' }, { m: "the willow!! there's the willow!!" },
      { m: "that's my kite in the tree. obviously. it's always my kite in the tree" },
      { m: "jiang cheng i'm crying in the middle of the night about a kite" },
    ],
  };
  const FAMLOG = {
    p_family_2007: 'Sent Wei Wuxian the 2007 photo from the Lotus Pier dock',
    p_ajie_soup: 'Sent Wei Wuxian a 2008 photo of A-Jie’s soup pot, fire turned low',
    p_ajie_wedding: 'Sent Wei Wuxian a photo of A-Jie’s wedding',
    p_kites: 'Sent Wei Wuxian the kites over the lake',
  };
  Object.keys(FAMPICS).forEach((art) => react({
    id: 'r_fam_wwx_' + art.replace(/^p_/, ''),
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'wwx', (a) => a === art), delay: 3 },
    nodes: {
      start: whenFree('wwx', 'look'),
      look: FAMPICS[art].concat([
        { log: FAMLOG[art], once: 'fam:' + art },
        { if: (s) => !!F(s).r_fam_aff, go: 'stop' },
        { fx: { set: { r_fam_aff: true }, aff: { wwx: 1 } } },
        { hint: 'Wei Wuxian will remember that.' },
      ]),
    },
  }));

  // ── The red-envelope screenshot, to the nephew turning eighteen on Sunday ─
  react({
    id: 'r_bank_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'jl', (a) => a === 'p_shot_bank'), delay: 3 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'oh no' },
        { m: 'a bank screenshot' },
        { m: 'what did i do. if this is about pet kingdom that was for FAIRY' },
        { m: "wait that's the new year one. 8888" },
        { m: '…is this a birthday hint' },
        { choice: [
            { t: 'Check your spending.', go: 'spend' },
            { t: 'Sunday.', go: 'sunday' },
            { t: 'Happy early birthday, kiddo 🥳💸', fx: { sus: { jl: 3 } }, go: 'kiddo' },
          ], timeout: 60, onTimeout: 'read' },
      ],
      spend: [{ m: "i DID. it's all dog food and arrows" }, { m: 'ugh. fine. night' }, { go: 'end' }],
      sunday: [{ m: 'SUNDAY??' }, { m: "is it more. is it LESS. jiujiu what's on sunday" }, { m: "ok i'm not sleeping now. thanks" }, { go: 'end' }],
      kiddo: [{ m: 'KIDDO??' }, { m: 'who taught u the money emoji' }, { m: "ur being so weird tonight. i'm telling sizhui" }, { hint: 'A-Ling noticed.' }, { go: 'end' }],
      read: [{ m: 'ok ur just reminding me ur rich. cool. thanks i guess' }, { go: 'end' }],
      end: [{ log: 'Sent A-Ling the red-envelope screenshot. He now expects money on Sunday', once: 'bank' }],
    },
  });

  // ── A-Ling's gala selfie, to the most dangerous person in the phone ─
  const teaSelfie = {
    id: 'post_tea_jlselfie', by: 'teaspiller_qh', art: 'p_jl_selfie_gala', likes: 6120,
    text: 'A certain heir at Koi Tower tonight, looking ✨dangerously✨ like his uncle. A little bird says the uncle sent this himself 👀 #JinGala2026',
    comments: [{ by: 'jingyi_lan', text: 'A-LING 💀💀💀' }, { by: 'rulan_jin', text: 'WHO SENT THIS' }, { by: 'yiling_radish_king', text: 'my nephew!!! 😭 (who sent this)' }],
  };
  react({
    id: 'r_jlsel_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'nhs', (a) => a === 'p_jl_selfie_gala'), delay: 3 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'A-LING IN THE TUX 😭😭' },
        { m: 'Brother Jiang… are you sending me photos of your nephew? At this hour? 👀' },
        { m: "Proud uncle!! I'll keep it very safe 🙈" },
        { m: '(I will not keep it safe)' },
        { fx: { sus: { nhs: 1 } } },
        { log: 'Sent A-Ling’s gala selfie to Nie Huaisang', once: 'jlsel' },
        { hint: 'Nie Huaisang noticed.' },
        stopIfCaught,
        { wait: 75 },
        { if: (s) => !night(s), go: 'stop' },
        { add: { to: 'posts', item: teaSelfie, notify: true } },
        { wait: 20 },
        { m: 'jiujiu', th: 'jl', from: 'jl' },
        { m: 'why is my gala selfie on the TEA ACCOUNT', th: 'jl', from: 'jl' },
        { m: '"a little bird says the uncle sent this himself"??', th: 'jl', from: 'jl' },
        { m: 'did u send my selfie to someone. was it nie huaisang. i KNEW it', th: 'jl', from: 'jl' },
        { fx: { sus: { jl: 1 } } },
        { log: 'Watched it turn up on @teaspiller_qh within the hour', once: 'jlsel:tea' },
      ],
    },
  });

  // ── The #BalconyGate screenshot (in character: accusatory) ─────────
  react({
    id: 'r_gossip_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'nhs', (a) => a === 'p_shot_gossip'), delay: 3 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang!! Why are you sending me THIS 🙈' },
        { m: "I've never seen it before in my life!! (It has 3,914 likes)" },
        { m: "(I mean I've never seen it)" },
        { choice: [
            { t: "I know it's you.", go: 'you' },
            { t: 'Delete it.', go: 'del' },
          ], timeout: 60, onTimeout: 'read' },
      ],
      you: [{ m: 'Me?? I paint FANS, Brother Jiang 🪭' }, { m: '…' }, { m: 'Goodnight!!! 🙈' }, { fx: { set: { nhs_accused: true } } }, { go: 'end' }],
      del: [
        { m: "I can't delete something I didn't post!! 🙈" },
        { m: "…but if I DID know who posted it, I'd tell them you said please" },
        { m: "(you didn't say please. you never say please. it's very reassuring)" },
        { go: 'end' },
      ],
      read: [{ m: 'Left on read!! Very Brother Jiang 🪭' }, { go: 'end' }],
      end: [{ log: 'Sent Nie Huaisang a screenshot of his own gossip post', once: 'gossip:nhs' }],
    },
  });
  react({
    id: 'r_gossip_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'send', match: (p) => sentImg(p, 'lxc', (a) => a === 'p_shot_gossip'), delay: 3 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [
        { typing: 4 },
        { m: 'Ah.' },
        { m: "Huaisang sent me the same picture an hour ago. 'By accident.'" },
        { m: 'Purple and white. I suppose that is us.' },
        { m: "I'm not sorry it was noticed. Only that it was noticed by him." },
        { log: 'Sent Lan Xichen the #BalconyGate screenshot', once: 'gossip:lxc' },
      ],
    },
  });

  // ── Quiet ones: nobody sees these, but he will ──────────────────────
  react({
    id: 'r_cam_selfie',
    thread: 'ea',
    anytime: true,
    trigger: { on: 'act', act: 'photo_taken', match: (p) => !!p && !!p.selfie },
    nodes: { start: [{ fx: { set: { took_selfie: true } } }, { log: 'Took a selfie with Jiang Cheng’s phone', once: 'cam:selfie' }] },
  });
  react({
    id: 'r_del_ajie',
    thread: 'ea',
    anytime: true,
    trigger: { on: 'act', act: 'photo_delete', match: (p) => !!p && ['ph_fam07', 'ph_wed07', 'ph_soup08', 'ph_kites03'].includes(p.id) },
    nodes: { start: [{ fx: { set: { deleted_ajie: true } } }, { log: 'Deleted a photo of A-Jie. It went to Recently Deleted, where he will find it', once: 'del:ajie' }] },
  });
  react({
    id: 'r_del_moon',
    thread: 'ea',
    anytime: true,
    trigger: { on: 'act', act: 'photo_delete', match: (p) => !!p && p.id === 'ph_moon' },
    nodes: { start: [{ fx: { set: { deleted_moon: true } } }, { log: 'Deleted the balcony moon photo. And the sleeve', once: 'del:moon' }] },
  });

  // ════════════════════════════════════════════════════════════════════
  // 2. WAVELET
  // ════════════════════════════════════════════════════════════════════
  const BG = ['wv_tea_teaser', 'post_balconygate2'];
  const KOIPOSTS = ['post_koipondgate', 'post_koipondgate_jc'];
  const teaKind = (pid) => (BG.includes(pid) ? 'bg' : KOIPOSTS.includes(pid) ? 'koi' : postBy(pid) === 'teaspiller_qh' ? 'tea' : null);
  const coverLeak = (s, text, art) => !!F(s).car_cover && (koiWords(text) || koiArt(art));

  // ── Likes on @teaspiller_qh (Nie Huaisang's secret account): he sees them instantly ─
  react({
    id: 'r_wv_like_bg',
    thread: 'nhs',
    trigger: { on: 'act', act: 'like', match: (p) => !!p && teaKind(p.post) === 'bg', delay: 6 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'BROTHER JIANG 👀' },
        { m: 'Did you just LIKE the #BalconyGate post??' },
        { m: 'From your OWN account??' },
        { m: "Don't ask how I know!! A little bird!! 🐦" },
        { fx: { sus: { nhs: 2 } } },
        { log: 'Liked the #BalconyGate post from Jiang Cheng’s account', once: 'wv:like:bg' },
        { hint: 'Nie Huaisang noticed.' },
        stopIfCaught,
        { choice: [
            { t: 'My thumb slipped.', go: 'thumb' },
            { t: 'How do you know what I like.', go: 'how' },
            { t: 'It was funny 😂', fx: { sus: { nhs: 2 } }, go: 'funny' },
          ], timeout: 60, onTimeout: 'read' },
      ],
      thumb: [{ m: 'Your thumb!! Of course!! 🙈' }, { m: "Brother Jiang's thumb has never slipped in thirty-four years. But okay~ 🪭" }],
      how: [{ m: 'I— a cousin!! I have so many cousins 🙈' }, { m: 'Goodnight!!! 🪭' }, { fx: { set: { nhs_slipped: true } } }],
      funny: [{ m: '😂???' }, { m: "Brother Jiang doesn't laugh at posts. Brother Jiang reports them 👀" }],
      read: [{ m: 'Left on read!! Very on brand 🪭' }],
    },
  });
  react({
    id: 'r_wv_like_koi',
    thread: 'nhs',
    trigger: { on: 'act', act: 'like', match: (p) => !!p && teaKind(p.post) === 'koi', delay: 6 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang… you LIKED #KoiPondGate?? 😭' },
        { m: 'Your own car!! Your own nephew!!' },
        { m: 'Hmm~ 👀' },
        { fx: { sus: { nhs: 2 } } },
        { log: 'Liked #KoiPondGate. About his own car', once: 'wv:like:koi' },
        { hint: 'Nie Huaisang noticed.' },
      ],
    },
  });
  react({
    id: 'r_wv_like_tea',
    thread: 'nhs',
    trigger: { on: 'act', act: 'like', match: (p, s) => !!p && teaKind(p.post) === 'tea' && keep(s, 'r_wvlike_tea', p.post), delay: 6 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang!!! You liked a post on the TEA account?? 👀' },
        { if: (s) => F(s).r_wvlike_tea === 'wv_tea_ceos', go: 'ceos' },
        { if: (s) => F(s).r_wvlike_tea === 'wv_tea_return', go: 'back' },
        { if: (s) => F(s).r_wvlike_tea === 'post_tea_jlselfie', go: 'aling' },
        { go: 'end' },
      ],
      ceos: [
        { m: 'The CEO list?? Are you happy with #3?? I think you deserved #2!!' },
        { m: '(#2 is very flattered that you looked) 🙈' },
        { m: "I mean!! I don't know what #2 thinks!! 🪭" },
        { fx: { set: { nhs_slipped: true } } },
        { go: 'end' },
      ],
      back: [{ m: "The Zewu-jun one!! 'Who has he been texting' 👀👀" }, { m: "Is it you. It is, isn't it. The lotus seasons!! The LAKE!!" }, { go: 'end' }],
      aling: [{ m: "A-Ling's photo!! On the tea account!! Proud uncle 🙈" }, { go: 'end' }],
      end: [{ fx: { sus: { nhs: 2 } } }, { log: 'Liked a post on @teaspiller_qh from Jiang Cheng’s account', once: 'wv:like:tea' }, { hint: 'Nie Huaisang noticed.' }],
    },
  });

  // ── Comments on @teaspiller_qh (#KoiPondGate cover-up leaks are handled below) ─
  react({
    id: 'r_wv_cmt_tea',
    thread: 'nhs',
    trigger: { on: 'act', act: 'comment', match: (p, s) => !!p && !!teaKind(p.post) && !coverLeak(s, p.text) && keep(s, 'r_wvcmt_tea', String(p.text || '')), delay: 8 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { if: (s) => !!(s.done && (s.done.r_wv_like_bg || s.done.r_wv_like_koi || s.done.r_wv_like_tea)), go: 'again' },
        { m: 'BROTHER JIANG 😭😭' },
        { go: 'cmt' },
      ],
      again: [{ m: 'First a like and now a COMMENT?? 😭' }, { go: 'cmt' }],
      cmt: [
        { m: 'You COMMENTED on the tea account??' },
        { typing: 2 },
        say('nhs', 'nhs', (f) => quote(f.r_wvcmt_tea)),
        { m: 'Everyone can see it!! Two thousand people!! The Lanling Daily!! 🙈' },
        { if: (s) => /delete this/i.test(F(s).r_wvcmt_tea || ''), go: 'del' },
        { if: (s) => ooc(F(s).r_wvcmt_tea), go: 'odd' },
        { m: 'Very on brand. Still: a COMMENT 🪭' },
        { fx: { sus: { nhs: 2 } } },
        { go: 'end' },
      ],
      del: [{ m: '"Delete this." Classic 🙈' }, { m: "The tea account will never delete it. I assume. I don't know them" }, { fx: { sus: { nhs: 1 } } }, { go: 'end' }],
      odd: [{ m: "Also that doesn't sound like you AT ALL 👀" }, { fx: { sus: { nhs: 3 } } }, { go: 'end' }],
      end: [{ log: 'Commented on @teaspiller_qh’s gossip as Jiang Cheng', once: 'wv:cmt:tea' }, { hint: 'Nie Huaisang noticed.' }],
    },
  });

  // ── Jiang Cheng posts (he has posted three times in three years) ───
  const postStash = (p, s) => !!p && !isSelfie(p.art) && !coverLeak(s, p.text, p.art) && keep(s, 'r_wvpost', { art: p.art || '', text: String(p.text || '') });
  const postArt = (s) => (F(s).r_wvpost || {}).art || '';
  react({
    id: 'r_wv_post_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'post', match: postStash, delay: 6 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { m: 'u POSTED??' },
        { m: 'on WAVELET??' },
        { if: (s) => ['p_balcony_moon', 'p_gusu_moon', 'p_moon_street'].includes(postArt(s)), go: 'moon' },
        { if: (s) => /^p_jl_/.test(postArt(s)), go: 'me' },
        { if: (s) => koiArt(postArt(s)), go: 'car' },
        { if: (s) => isDog(postArt(s)), go: 'dog' },
        { m: "u've posted three times in three years. this is four" },
        { m: 'at this hour. after the gala' },
        { go: 'cap' },
      ],
      moon: [{ m: 'THE MOON??' }, { m: "everyone is going to know it's about the balcony. EVERYONE" }, { go: 'cap' }],
      me: [{ m: 'WHY IS MY FACE ON UR ACCOUNT' }, { m: "…ok it's a good one. but WHY" }, { go: 'cap' }],
      car: [{ m: 'U POSTED THE POND??' }, { m: 'jiujiu everyone will know it was me. EVERYONE' }, { go: 'cap' }],
      dog: [{ m: 'ok actually dogs are fine. dogs are allowed' }, { go: 'cap' }],
      cap: [{ if: (s) => ooc((F(s).r_wvpost || {}).text), go: 'odd' }, { go: 'end' }],
      odd: [{ m: 'and who wrote that caption. it does NOT sound like u' }, { fx: { sus: { jl: 1 } } }, { go: 'end' }],
      end: [
        { fx: { sus: { jl: 2 } } },
        { log: 'Posted on Jiang Cheng’s Wavelet: his fourth post in three years', once: 'wv:post' },
        { hint: 'A-Ling noticed.' },
      ],
    },
  });
  react({
    id: 'r_wv_post_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'post', match: postStash, delay: 14 },
    nodes: {
      start: whenFree('wwx', 'look'),
      look: [
        { m: 'JIANG CHENG POSTED' },
        { m: 'lan zhan put down the ladle. JIANG CHENG POSTED' },
        { m: 'on a friday. at night. after the BALCONY' },
        { m: 'i liked it. it only lets me like it once. i unliked it and liked it again' },
        { fx: { sus: { wwx: 1 } } },
      ],
    },
  });
  react({
    id: 'r_wv_post_ops',
    thread: 'ops',
    trigger: { on: 'act', act: 'post', match: postStash, delay: 24 },
    nodes: {
      start: whenFree('ops', 'look'),
      look: [
        { m: 'Boss post on Wavelet!! 👍👍👍', from: 'huang' },
        { m: 'My grandson show me. Very Nice. 👍', from: 'huang' },
        { m: '• Noted: the CEO is on social media', from: 'liu' },
        { m: '• Should the company account repost?', from: 'liu' },
        { m: 'No.', from: 'ea' },
        { m: 'Mr. Jiang, is this a press statement? It reads like a press statement.', from: 'ea' },
        { fx: { sus: { ea: 1 } } },
      ],
    },
  });
  react({
    id: 'r_wv_post_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'post', match: postStash, delay: 4 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang POSTED 👀👀👀' },
        { m: "I'm not saying anything!! I'm just looking!! Very closely!! 🙈" },
        { fx: { sus: { nhs: 1 } } },
        stopIfCaught,
      ],
    },
  });
  react({
    id: 'r_wv_post_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'post', match: (p, s) => postStash(p, s) && p.art === 'p_balcony_moon', delay: 30 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [
        { typing: 4 },
        { m: 'I saw your post.' },
        { if: (s) => !!F(s).moon_sent, go: 'twice' },
        { m: 'The moon from the balcony. And my sleeve, at the edge, in front of two thousand people.' },
        { m: 'I had thought you were a private man, Wanyin. 🙂' },
        { fx: { set: { moon_sent: true, r_moon_post: true } } },
        { log: 'Posted the balcony moon on Wavelet, sleeve and all', once: 'moon' },
        { go: 'aff' },
      ],
      twice: [{ m: 'The same moon you sent me. Now everyone has it.' }, { m: "I find I don't mind. 🙂" }],
      aff: moonAff,
    },
  });

  // ── #KoiPondGate: the cover-up ("Blame the valet.") meets his own account ─
  // Only here may a reaction end the game in 'koigate'. koigate_leak (nhs.js) would leak it anyway, later.
  const koiJC = {
    id: 'post_koipondgate_jc', by: 'teaspiller_qh', art: 'p_koi_pond_car', likes: 21907,
    text: "Remember the purple sedan IN THE KOI POND at Koi Tower, and the 60-year-old valet who 'did it'?? Its owner just brought up the pond himself. On Wavelet. From his OWN account. 🐟🚗 The valet gave the dog a biscuit. #KoiPondGate",
    comments: [{ by: 'jingyi_lan', text: '💀💀💀💀💀💀' }, { by: 'koi_watchers', text: 'the koi would like an apology. from everyone' }, { by: 'rulan_jin', text: 'JIUJIU' }],
  };
  react({
    id: 'r_koigate',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !F(s).car_cover, go: 'stop' },
        { wait: 8 },
        { add: { to: 'posts', item: koiJC, notify: true } },
        { wait: 6 },
        { m: 'JIUJIU' },
        { m: 'WHAT DID U POST' },
        { m: 'about the POND. from UR account. the tea account screenshotted it in like four seconds' },
        { m: '#KOIPONDGATE IS TRENDING' },
        { m: "the valet's granddaughter is in my CLASS. she filmed EVERYTHING" },
        { m: 'Brother Jiang!!! 🐟 I know NOTHING about any koi!!! 🙈', th: 'nhs', from: 'nhs' },
        { m: 'jiang cheng. "blame the valet"?? and then u POSTED about it??', th: 'wwx', from: 'wwx' },
        { m: 'The Lanling Daily has asked for a comment by 07:00. I was going to draft "No comment." You have already commented.', th: 'ea', from: 'ea' },
        { log: 'Brought up the koi pond on Wavelet while covering for A-Ling. It trended', once: 'koigate' },
        { wait: 6 },
        { ending: 'koigate' },
      ],
    },
  });
  react({ id: 'r_wv_koi_post', thread: 'jl', trigger: { on: 'act', act: 'post', match: (p, s) => !!p && !isSelfie(p.art) && coverLeak(s, p.text, p.art) }, nodes: { start: [{ start: 'r_koigate' }] } });
  react({ id: 'r_wv_koi_cmt', thread: 'jl', trigger: { on: 'act', act: 'comment', match: (p, s) => !!p && coverLeak(s, p.text) }, nodes: { start: [{ start: 'r_koigate' }] } });
  react({ id: 'r_wv_koi_dm', thread: 'jl', trigger: { on: 'act', act: 'dm', match: (p, s) => !!p && p.to === 'teaspiller_qh' && coverLeak(s, p.text) }, nodes: { start: [{ start: 'r_koigate' }] } });

  // ── A DM to @teaspiller_qh ─────────────────────────────────────────
  react({
    id: 'r_wv_dm_tea',
    thread: 'nhs',
    trigger: { on: 'act', act: 'dm', match: (p, s) => !!p && p.to === 'teaspiller_qh' && !isSelfie(p.art) && !coverLeak(s, p.text) && keep(s, 'r_wvdm_tea', String(p.text || '')), delay: 25 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang!!! 👀' },
        { m: 'Why would you DM a gossip account at this hour??' },
        { m: "I'm only asking because a cousin of mine runs— I mean. READS. A cousin reads that account 🙈" },
        { if: (s) => /huaisang|\bnie\b|it'?s you|i know/i.test(F(s).r_wvdm_tea || ''), go: 'you' },
        { go: 'end' },
      ],
      you: [{ m: 'And whatever you said to them, I am SURE they have no idea what you mean 🪭' }, { m: 'None!!' }, { fx: { set: { nhs_accused: true } } }, { go: 'end' }],
      end: [
        { fx: { sus: { nhs: 1 } } },
        { log: 'Sent a direct message to @teaspiller_qh from Jiang Cheng’s Wavelet', once: 'wv:dm:tea' },
        { hint: 'Nie Huaisang noticed.' },
      ],
    },
  });

  // ── Lan Xichen's posts: liking the white peony tin he sent without a card ─
  react({
    id: 'r_wv_like_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'like', match: (p, s) => !!p && postBy(p.post) === 'zewujun' && keep(s, 'r_wvlike_lxc', p.post), delay: 15 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [{ if: (s) => F(s).r_wvlike_lxc === 'wv_lxc_peony', go: 'peony' }, { go: 'other' }],
      peony: [
        { m: 'Wanyin.' },
        { m: 'Wavelet tells me you just liked a photo of a tea tin. From three weeks ago. At this hour.' },
        { m: 'It arrived without a card. I had a guess.' },
        { m: 'Thank you for confirming it. 🙂' },
        { fx: { set: { peony_confirmed: true } } },
        { log: 'Liked Lan Xichen’s white-peony post, confirming who sent the tin without a card', once: 'wv:like:lxc' },
      ],
      other: [
        { m: 'Wanyin, you liked one of my photos.' },
        { m: "I didn't know you looked at Wavelet. I'm glad you do." },
        { log: 'Liked one of Lan Xichen’s posts', once: 'wv:like:lxc' },
      ],
    },
  });

  // ── Comments on family posts ────────────────────────────────────────
  react({
    id: 'r_wv_cmt_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'comment', match: (p, s) => !!p && postBy(p.post) === 'rulan_jin' && !coverLeak(s, p.text) && keep(s, 'r_wvcmt_jl', String(p.text || '')), delay: 10 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { m: 'did u just COMMENT on my post' },
        { m: 'my friends can SEE that. jingyi already screenshotted it' },
        { typing: 2 },
        say('jl', 'jl', (f) => quote(f.r_wvcmt_jl)),
        { if: (s) => ooc(F(s).r_wvcmt_jl), go: 'odd' },
        { m: '…ok. delete it anyway' },
        { fx: { sus: { jl: 1 } } },
        { go: 'end' },
      ],
      odd: [{ m: 'who ARE u' }, { fx: { sus: { jl: 2 } } }, { go: 'end' }],
      end: [{ log: 'Commented on A-Ling’s Wavelet post where his friends could see', once: 'wv:cmt:jl' }, { hint: 'A-Ling noticed.' }],
    },
  });
  react({
    id: 'r_wv_cmt_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'comment', match: (p, s) => !!p && postBy(p.post) === 'zewujun' && keep(s, 'r_wvcmt_lxc', String(p.text || '')), delay: 12 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [
        { typing: 4 },
        { m: 'Wanyin, you commented on my post. In public. 🙂' },
        { m: "Two hundred thousand people can read it, and my uncle is one of them. I find I don't mind at all." },
        { if: (s) => ooc(F(s).r_wvcmt_lxc), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: "It doesn't sound very much like you. I don't mind that either." }, { go: 'end' }],
      end: [{ fx: { sus: { lxc: 1 } } }, { log: 'Commented on Lan Xichen’s post in front of 211,000 followers', once: 'wv:cmt:lxc' }],
    },
  });
  react({
    id: 'r_wv_cmt_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'comment', match: (p, s) => !!p && postBy(p.post) === 'yiling_radish_king' && keep(s, 'r_wvcmt_wwx', String(p.text || '')), delay: 8 },
    nodes: {
      start: whenFree('wwx', 'look'),
      look: [
        { m: 'JIANG CHENG' },
        { m: 'U COMMENTED ON MY POST' },
        { m: 'in PUBLIC. where PEOPLE can see' },
        { typing: 2 },
        say('wwx', 'wwx', (f) => quote(f.r_wvcmt_wwx)),
        { m: "i'm pinning it. i'm pinning it forever" },
        { fx: { sus: { wwx: 1 } } },
        { log: 'Commented on Wei Wuxian’s post. He pinned it', once: 'wv:cmt:wwx' },
      ],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // 3. SAFARI
  // ════════════════════════════════════════════════════════════════════

  // ── Three wrong passwords on the YMJ intranet → IT tells the Ops group ─
  react({
    id: 'r_ymj_locked',
    thread: 'ops',
    trigger: { on: 'act', act: 'ymj_locked', delay: 20 },
    nodes: {
      start: whenFree('ops', 'alert'),
      alert: [
        { m: 'Good evening all. IT alert, forwarded:', from: 'liu' },
        { m: '• 3 failed sign-ins to the YMJ Intranet', from: 'liu' },
        { m: '• Account: jiangcheng (CEO)', from: 'liu' },
        { m: '• Device: his iPhone, Jinxing District, Lanling', from: 'liu' },
        { m: '• Account locked until Monday', from: 'liu' },
        { m: 'boss forgot his password?? 🙇', from: 'bai' },
        { m: 'Boss. The password is on paper in your desk. I will not read it. 👍', from: 'huang' },
        { m: 'Jinxing District. You are staying at the Golden Peony.', from: 'ea' },
        { m: 'Your password has not changed since March. It is not a birthday. Stop trying birthdays.', from: 'ea' },
        { fx: { sus: { liu: 1, ea: 1 } } },
        { log: 'Locked Jiang Cheng out of the YMJ intranet with three wrong passwords', once: 'ymj' },
        { hint: 'Tang Mei noticed.' },
      ],
    },
  });

  // ── "How to return a lost phone" ────────────────────────────────────
  const LOST_URL = /howto\.lanling\/found-a-lost-phone|help\.swiftride\.lanling\/lost|swiftride\.app\/lost|police\.lanling\/lost/;
  react({
    id: 'r_web_lost',
    thread: 'ea',
    anytime: true,
    trigger: { on: 'act', act: 'visit', match: (p) => !!p && LOST_URL.test(String(p.url || '')), delay: 3 },
    nodes: {
      start: [
        { fx: { set: { looked_up_return: true } } },
        { log: 'Looked up how to return a lost phone', once: 'web:lost' },
        { hint: 'You could just give it back.' },
      ],
    },
  });

  // ── Comments on Nie Huaisang's corners of the web (Spilled Tea; his fan journal) ─
  const NHS_PAGES = { 'tea-balconygate': 'tea', 'tea-ceos': 'tea', 'tea-return': 'tea', 'fans-moonlit-balcony': 'fans' };
  const webNhs = (s) => F(s).r_webcmt_nhs || {};
  react({
    id: 'r_web_cmt_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'web_comment', match: (p, s) => !!p && !!NHS_PAGES[p.page] && keep(s, 'r_webcmt_nhs', { k: NHS_PAGES[p.page], t: String(p.text || '') }), delay: 18 },
    nodes: {
      start: whenFree('nhs', 'look'),
      look: [
        { m: 'Brother Jiang?? 👀' },
        { m: 'Did you just comment on a BLOG?? As "jiang.cheng"??' },
        { if: (s) => webNhs(s).k === 'fans', go: 'fans' },
        { m: "On Spilled Tea?? I don't even know who writes that blog!! 🙈" },
        { m: '(Whoever it is, I bet they read every comment. Within seconds.)' },
        { go: 'q' },
      ],
      fans: [{ m: 'On my FAN JOURNAL 😭 Nobody comments on my fan journal!!' }, { m: 'And on the Moonlit Balcony fan!! Of ALL the fans!! 🪭' }, { go: 'q' }],
      q: [
        { typing: 2 },
        say('nhs', 'nhs', (f) => quote((f.r_webcmt_nhs || {}).t)),
        { if: (s) => ooc(webNhs(s).t), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: "That doesn't sound like you at all, Brother Jiang 👀" }, { fx: { sus: { nhs: 1 } } }, { go: 'end' }],
      end: [
        { fx: { sus: { nhs: 2 } } },
        { log: (s) => (webNhs(s).k === 'fans' ? 'Commented on Nie Huaisang’s fan journal as “jiang.cheng”' : 'Commented on the Spilled Tea gossip blog as “jiang.cheng”'), once: 'web:nhs' },
        { hint: 'Nie Huaisang noticed.' },
      ],
    },
  });

  // ── The soup recipe Wei Wuxian has been burning all week ────────────
  const RECIPE_TIP = /\blow\b|fire|flame|two hours|2 hours|\b2h\b|don'?t rush|\blid\b|simmer|slow/i;
  react({
    id: 'r_web_cmt_soup',
    thread: 'wwx',
    trigger: { on: 'act', act: 'web_comment', match: (p, s) => !!p && p.page === 'recipe:lotus-root-pork-rib-soup' && keep(s, 'r_webcmt_soup', String(p.text || '')), delay: 15 },
    nodes: {
      start: whenFree('wwx', 'look'),
      look: [
        { m: 'wait' },
        { m: 'someone called jiang.cheng just replied on the soup recipe' },
        { m: "the one i've been using all week" },
        { typing: 2 },
        say('wwx', 'wwx', (f) => quote(f.r_webcmt_soup)),
        { if: (s) => RECIPE_TIP.test(F(s).r_webcmt_soup || ''), go: 'tip' },
        { m: 'is that U?? on a RECIPE SITE??' },
        { m: 'jiang cheng reads recipe comments at this hour. lan zhan. LAN ZHAN' },
        { fx: { sus: { wwx: 1 } } },
        { log: 'Commented on the soup recipe Wei Wuxian is using, as “jiang.cheng”', once: 'web:soup' },
      ],
      tip: [
        { if: (s) => !!F(s).told_recipe, go: 'again' },
        { m: 'LOW FIRE' },
        { m: "that's what lake_grandma said. it's what SHE would have said" },
        { m: 'lan zhan turn it down. TURN IT DOWN. lowest flame' },
        { m: "ok. i'm going to do something else for two hours. i don't know what. i'm going to stare at the pot" },
        { fx: { set: { told_recipe: true } } },
        { log: 'Told Wei Wuxian the secret of the soup in a recipe comment, as “jiang.cheng”', once: 'web:soup' },
        { hint: 'Wei Wuxian will remember that.' },
      ],
      again: [
        { m: 'u already told me. low fire. two hours' },
        { m: "but now it's IN WRITING. on the INTERNET. lake_grandma liked it" },
        { log: 'Put the soup secret in writing on a recipe site, as “jiang.cheng”', once: 'web:soup' },
      ],
    },
  });

  // ════════════════════════════════════════════════════════════════════
  // 4. MAIL
  // ════════════════════════════════════════════════════════════════════
  /** the player's own words in an email (drops the quoted original of a reply or forward) */
  const own = (body) => String(body || '').split(/\n\s*On [^\n]*wrote:\s*\n|\n\s*Begin forwarded message:/)[0]
    .split('\n').filter((l) => !/^\s*>/.test(l)).join('\n').trim();
  const mailTo = (p, cid) => !!p && (p.contacts || []).includes(cid);
  const mailStash = (cid) => (p, s) => mailTo(p, cid) && keep(s, 'r_mail_' + cid, { subj: String(p.subject || ''), body: own(p.body), draft: p.draft || null });
  const mail = (s, cid) => F(s)['r_mail_' + cid] || {};
  const mailOdd = (cid) => (s) => ooc(mail(s, cid).body) || ooc(mail(s, cid).subj);

  react({
    id: 'r_mail_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('lxc'), delay: 25 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [
        { typing: 5 },
        { m: 'Wanyin, you sent me an email.' },
        { m: 'With a subject line. At this hour. I read it twice.' },
        { m: "I've printed it. Uncle would approve. He believes important things should be written down." },
        { if: mailOdd('lxc'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: "It doesn't sound very much like you. I don't mind. I only notice." }, { fx: { sus: { lxc: 1 } } }, { go: 'end' }],
      end: [{ log: 'Emailed Lan Xichen in the middle of the night. He printed it', once: 'mail:lxc' }],
    },
  });

  // Wei Wuxian: the two-year-old draft "I know about" (Mail → Drafts), Radish News, or just an email.
  const wwxDraft = (s) => mail(s, 'wwx').draft === 'd_wwx' || /i know about/i.test(mail(s, 'wwx').body || '');
  react({
    id: 'r_mail_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('wwx'), delay: 25 },
    when: (s) => !F(s).burned,
    nodes: {
      start: whenFree('wwx', 'go'),
      go: [
        { if: (s) => wwxDraft(s) && /thank/i.test(mail(s, 'wwx').body || ''), go: 'thanks' },
        { if: wwxDraft, go: 'draft' },
        { if: (s) => /radish news/i.test(mail(s, 'wwx').subj || ''), go: 'radish' },
        { m: 'JIANG CHENG' },
        { m: 'u EMAILED me??' },
        { m: 'with a SUBJECT LINE' },
        { m: "lan zhan we're being emailed. is this a legal thing. is it about the radish shipping" },
        { fx: { sus: { wwx: 1 } } },
        { log: 'Emailed Wei Wuxian. He thinks it is a legal matter', once: 'mail:wwx' },
      ],
      thanks: [
        { typing: 6 },
        { m: 'jiang cheng' },
        { m: 'u sent me an email' },
        { m: 'it starts "I know about"' },
        { m: 'and then it says thank you' },
        { typing: 8 },
        { m: "how long has that been in ur drafts" },
        { m: "…don't answer. i know. since the night wen ning told u. it's ok" },
        { m: "u didn't have to finish the sentence. i heard the whole thing anyway" },
        { m: "i'm printing it. lan zhan is getting the good frame" },
        { if: (s) => !F(s).wwx_thanked && !F(s).memo_sent, go: 'thanked' },
        { go: 'warm' },
      ],
      thanked: [{ fx: { set: { wwx_thanked: true } } }, { go: 'warm' }],
      warm: [
        { log: 'Sent Wei Wuxian the email Jiang Cheng started in June 2024, and finished it with a thank-you', once: 'mail:wwx' },
        { go: 'aff' },
      ],
      draft: [
        { m: 'jiang cheng' },
        { m: 'u emailed me. it says "I know about"' },
        { m: "about WHAT. u can't just" },
        { typing: 5 },
        { m: '…oh' },
        { m: 'is this about 2008' },
        { m: "u don't have to finish it. i know what u know. i've known since wen ning told me he told u" },
        { m: "but if u ever want to finish the sentence. i'm here. i'm always here now" },
        { fx: { set: { wwx_draft: true } } },
        { log: 'Sent Wei Wuxian a two-year-old draft that only says “I know about”', once: 'mail:wwx' },
        { go: 'aff' },
      ],
      aff: [
        { if: (s) => !!F(s).r_wwx_mail_aff, go: 'stop' },
        { fx: { set: { r_wwx_mail_aff: true }, aff: { wwx: 1 } } },
        { hint: 'Wei Wuxian will remember that.' },
      ],
      radish: [
        { m: 'WAIT' },
        { m: 'SOMEONE REPLIED TO RADISH NEWS' },
        { m: "41 subscribers. 12 issues. the first reply EVER. and it's from U" },
        { m: "i'm putting it in issue 13. anonymously. everyone will know" },
        { fx: { sus: { wwx: 1 } } },
        { log: 'Replied to Radish News #12. The first reply in twelve issues', once: 'mail:wwx' },
      ],
    },
  });

  react({
    id: 'r_mail_nhs',
    thread: 'nhs',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('nhs'), delay: 20 },
    nodes: {
      start: whenFree('nhs', 'go'),
      go: [
        { if: (s) => /swapped the seats/i.test(mail(s, 'nhs').subj || ''), go: 'seats' },
        { m: 'Brother Jiang EMAILED me?? 👀' },
        { m: 'At this hour?? To my WORK address??' },
        { m: "My secretary is going to think we're doing a merger 🙈" },
        { go: 'tone' },
      ],
      seats: [
        { m: 'Brother Jiang!!! 😭' },
        { m: 'You replied to the seats email AGAIN!!' },
        { m: 'The first reply said "I know where you live." I\'m scared to open the second one 🙈' },
        { m: '(I opened it)' },
        { go: 'tone' },
      ],
      tone: [{ if: mailOdd('nhs'), go: 'odd' }, { go: 'end' }],
      odd: [{ m: "Also it doesn't sound like you. At all. Hmm~ 👀" }, { fx: { sus: { nhs: 1 } } }, { go: 'end' }],
      end: [{ fx: { sus: { nhs: 1 } } }, { log: 'Emailed Nie Huaisang, who keeps everything', once: 'mail:nhs' }, { hint: 'Nie Huaisang noticed.' }],
    },
  });

  react({
    id: 'r_mail_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('jl'), delay: 20 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { m: 'why did u email my SCHOOL email' },
        { m: 'the school can READ that. ms su can read that' },
        { m: 'is this about the chemistry thing. THE EYEBROWS ARE GROWING BACK' },
        { if: mailOdd('jl'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: 'also why does it sound like that' }, { fx: { sus: { jl: 1 } } }, { go: 'end' }],
      end: [{ fx: { sus: { jl: 1 } } }, { log: 'Emailed A-Ling at his school address', once: 'mail:jl' }, { hint: 'A-Ling noticed.' }],
    },
  });

  react({
    id: 'r_mail_ea',
    thread: 'ea',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('ea'), delay: 30 },
    nodes: {
      start: [
        { m: 'You emailed me. At this hour.' },
        { m: 'I said not before Monday 07:00. You said "No promises." I see.' },
        { m: "I'll read it on Monday at 07:00." },
        { m: "(I've read it.)" },
        { if: mailOdd('ea'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: 'Also: who wrote this?' }, { fx: { sus: { ea: 2 } } }, { hint: 'Tang Mei noticed.' }, { go: 'end' }],
      end: [{ log: 'Emailed Tang Mei after hours, as threatened', once: 'mail:ea' }],
    },
  });

  // Liu Qian: anything but Dog Friday (that has its own reaction below).
  const dogMail = (p) => mailTo(p, 'liu') && /dog|fairy/i.test(String(p.subject || '') + ' ' + own(p.body));
  react({
    id: 'r_mail_liu',
    thread: 'liu',
    trigger: { on: 'act', act: 'mail_send', match: (p, s) => !dogMail(p) && mailStash('liu')(p, s), delay: 20 },
    nodes: {
      start: [
        { m: 'Mr. Jiang! Received your email ✅' },
        { m: '• Time: the middle of the night' },
        { m: '• Urgency: unclear' },
        { m: '• Action: reading it properly in the morning' },
        { if: mailOdd('liu'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: '• Tone: unusual?' }, { fx: { sus: { liu: 1 } } }, { go: 'end' }],
      end: [{ log: 'Emailed Liu Qian in the middle of the night', once: 'mail:liu' }],
    },
  });

  // Lan Qiren asked for replies "by email, not by text message". He answers in kind.
  const qrMail = {
    id: 'm_qr_reply', box: 'inbox', cat: 'primary', read: false, flagged: false,
    from: { name: 'Lan Qiren', addr: 'lan.qiren@cloudrecesses.gusu' }, to: [{ name: 'Jiang Cheng', addr: 'jiang.cheng@lotuspier.yunmeng' }],
    subject: 'Re: Your correspondence of this evening',
    body: 'Jiang Cheng,\n\nYour email has been received at an hour at which a gentleman is asleep.\n\nThe Board thanks you for replying by email, as it requested. It is the second time this year.\n\nRule 1,207 is satisfied. Rule 6 (“Do not go out at night”) is not, but the Board will not pursue the matter.\n\n— Lan Qiren\nChair of the Board, Gusu Lan Academy',
  };
  react({
    id: 'r_mail_qr',
    thread: 'qr',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('qr'), delay: 40 },
    nodes: {
      start: [
        { add: { to: 'mail', item: qrMail, notify: true } },
        { wait: 4 },
        { m: 'Jiang Cheng. Your email has been received, and answered. By email. — Lan Qiren' },
        { if: mailOdd('qr'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: 'Jiang Cheng. Your email contained a small yellow face. The Board will assume it was a typographical error. — Lan Qiren' }, { fx: { sus: { qr: 2 } } }, { go: 'end' }],
      end: [{ log: 'Answered Lan Qiren by email, as instructed. He answered by email', once: 'mail:qr' }],
    },
  });

  react({
    id: 'r_mail_wn',
    thread: 'wn',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('wn'), delay: 25 },
    nodes: {
      start: [
        { m: 'M-Mr. Jiang? You emailed me. At my work address. Sorry, I mean, thank you. — Wen Ning' },
        { m: "I'll read it very carefully. Twice. Sorry. — Wen Ning" },
        { if: mailOdd('wn'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: 'Mr. Jiang, are you feeling all right? You wrote it very… kindly. Sorry. — Wen Ning' }, { fx: { sus: { wn: 1 } } }, { go: 'end' }],
      end: [{ log: 'Emailed Wen Ning, who apologized for receiving it', once: 'mail:wn' }],
    },
  });
  react({
    id: 'r_mail_mian',
    thread: 'mian',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('mian'), delay: 25 },
    nodes: {
      start: [
        { m: "You emailed me. Is this about Warehouse B's roof or about the balcony?" },
        { m: '(Both are fine. Only one of them is my job.)' },
        { if: mailOdd('mian'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: "Also, you sound like Huaisang. Don't." }, { fx: { sus: { mian: 1 } } }, { go: 'end' }],
      end: [{ log: 'Emailed Mianmian in the middle of the night', once: 'mail:mian' }],
    },
  });
  react({
    id: 'r_mail_lwj',
    thread: 'lwj',
    trigger: { on: 'act', act: 'mail_send', match: mailStash('lwj'), delay: 25 },
    nodes: {
      start: [
        { m: 'Received.' },
        { m: 'Wei Ying asks why you emailed me and not him.' },
        { m: 'I do not know either.' },
        { if: mailOdd('lwj'), go: 'odd' },
        { go: 'end' },
      ],
      odd: [{ m: 'It does not sound like you.' }, { fx: { sus: { lwj: 1 } } }, { go: 'end' }],
      end: [{ log: 'Emailed Lan Wangji instead of Wei Wuxian', once: 'mail:lwj' }],
    },
  });

  // ── Dog Friday, decided by email (Liu Qian's proposal: "a decision by Friday night") ─
  // If the Ops chat already decided (flag dog_friday, or ops_dogfriday finished with a no), no double morale.
  const decide = (t) => {
    t = String(t || '').toLowerCase();
    if (/only fairy|just fairy|fairy only|only for fairy|except fairy|fairy can|fairy may|fairy is allowed/.test(t)) return 'fairy';
    const yes = t.search(/\b(approved?|approving|yes|fine|ok(ay)?|go ahead|do it|agreed?|granted|allowed)\b/);
    const no = t.search(/\bnot (approved|allowed|happening)\b|\b(no|denied|deny|declined?|never|rejected?)\b/);
    if (yes < 0 && no < 0) return 'maybe';
    if (yes < 0 || (no >= 0 && no < yes)) return 'no';
    return 'yes';
  };
  const dogDecision = (s) => F(s).r_dogmail || 'maybe';
  react({
    id: 'r_mail_dogfriday',
    thread: 'ops',
    trigger: { on: 'act', act: 'mail_send', match: (p, s) => dogMail(p) && keep(s, 'r_dogmail', decide(own(p.body) || p.subject)), delay: 30 },
    nodes: {
      start: whenFree('ops', 'go'),
      go: [
        { if: (s) => dogDecision(s) === 'maybe', go: 'unclear' },
        { if: (s) => !!F(s).dog_friday, go: 'already' },
        { if: (s) => dogDecision(s) === 'no', go: 'no' },
        { if: (s) => !!(s.fin && s.fin.ops_dogfriday), go: 'reverse' },
        { if: (s) => dogDecision(s) === 'fairy', go: 'fairy_new' },
        { go: 'yes' },
      ],
      fairy_new: [{ m: '• Update: the boss answered my proposal by email', from: 'liu' }, { go: 'fairy' }],
      unclear: [
        { m: 'Mr. Jiang! Received your email re: Dog Friday ✅', th: 'liu', from: 'liu' },
        { m: '• I read it three times', th: 'liu', from: 'liu' },
        { m: '• I could not find a yes or a no', th: 'liu', from: 'liu' },
        { m: '• I am choosing to read it as a maybe 🐕', th: 'liu', from: 'liu' },
        { fx: { set: { dog_friday_mail: 'maybe' } } },
        { log: 'Emailed Liu Qian about Dog Friday without deciding anything', once: 'mail:dog' },
      ],
      already: [
        { if: (s) => dogDecision(s) === 'no', go: 'conflict' },
        { m: "• Received the boss's email confirming Dog Friday ✅", from: 'liu' },
        { m: '• We now have it in the chat AND in writing', from: 'liu' },
        { m: '👍👍👍', from: 'huang' },
        { fx: { set: { dog_friday_mail: 'yes' } } },
        { log: 'Approved Dog Friday twice: once in the chat, once by email', once: 'mail:dog' },
      ],
      conflict: [
        { m: '• Conflicting instructions received', from: 'liu' },
        { m: '• Chat: approved', from: 'liu' },
        { m: '• Email: “No.”', from: 'liu' },
        { m: '• Going with the chat', from: 'liu' },
        { m: 'Agreed.', from: 'ea' },
        { fx: { set: { dog_friday_mail: 'no' } } },
        { log: 'Approved Dog Friday in the chat and refused it by email. Ops went with the chat', once: 'mail:dog' },
      ],
      no: [
        { if: (s) => !!(s.fin && s.fin.ops_dogfriday), go: 'no_again' },
        { m: '• Update: the boss answered my proposal by email', from: 'liu' },
        { m: '• “No.”', from: 'liu' },
        { m: '• The poster stays up until Monday out of spite', from: 'liu' },
        { m: 'Boss. 😢👍', from: 'huang' },
        { fx: { set: { dog_friday_mail: 'no' } } },
        { log: 'Refused Bring Your Dog to Work Friday by email', once: 'mail:dog' },
      ],
      no_again: [
        { m: '• Received: a second no, by email', from: 'liu' },
        { m: '• Noted twice', from: 'liu' },
        { fx: { set: { dog_friday_mail: 'no' } } },
        { log: 'Refused Dog Friday twice: in the chat, then by email', once: 'mail:dog' },
      ],
      reverse: [
        { m: '• UPDATE', from: 'liu' },
        { m: '• The boss has reversed his decision', from: 'liu' },
        { m: '• By EMAIL', from: 'liu' },
        { if: (s) => dogDecision(s) === 'fairy', go: 'fairy' },
        { m: '• Bring Your Dog to Work Friday: APPROVED', from: 'liu' },
        { go: 'yes_cheer' },
      ],
      yes: [
        { m: '• Update: the boss answered my proposal by email ✅', from: 'liu' },
        { m: '• Decision: APPROVED', from: 'liu' },
        { m: '• First Dog Friday: 6 November', from: 'liu' },
        { go: 'yes_cheer' },
      ],
      yes_cheer: [
        { m: '👍👍👍👍👍', from: 'huang' },
        { m: 'boss can i bring my hamster. is a hamster a dog 🙇', from: 'bai' },
        { m: 'No.', from: 'ea' },
        { fx: { set: { dog_friday: true, dog_friday_mail: 'yes' }, inc: { ops_morale: 1 } } },
        { log: 'Approved Bring Your Dog to Work Friday by email, after midnight', once: 'mail:dog' },
        { hint: 'The Ops team will remember that.' },
      ],
      fairy: [
        { m: '• Decision: approved for Fairy only', from: 'liu' },
        { m: '• Fairy is not an employee', from: 'liu' },
        { m: '• …Approved', from: 'liu' },
        { m: "I'll print her a badge. Job title: Head of Morale.", from: 'ea' },
        { fx: { set: { dog_friday: 'fairy', dog_friday_mail: 'fairy' }, inc: { ops_morale: 1 } } },
        { log: 'Approved Dog Friday by email, for Fairy only', once: 'mail:dog' },
        { hint: 'The Ops team will remember that.' },
      ],
    },
  });

  // ── Reading his mail (quiet) ─────────────────────────────────────────
  react({
    id: 'r_mail_swap',
    thread: 'nhs',
    anytime: true,
    trigger: { on: 'act', act: 'mail_open', match: (p) => !!p && p.id === 'm_nhs_swap' },
    nodes: { start: [{ fx: { set: { knows_swap: true } } }, { log: 'Read Nie Huaisang’s “hehe I swapped the seats~” email', once: 'mail:swap' }] },
  });
  react({
    id: 'r_mail_draft',
    thread: 'wwx',
    anytime: true,
    trigger: { on: 'act', act: 'mail_open', match: (p) => !!p && p.id === 'd_wwx' },
    nodes: { start: [{ fx: { set: { found_draft: true } } }, { log: 'Found the draft to Wei Wuxian: two years old, three words, “I know about”', once: 'mail:draft' }] },
  });

  // ════════════════════════════════════════════════════════════════════
  // 5. MUSIC — "Share with Friends" is on (A-Ling turned it on in September): he can see what plays.
  // ════════════════════════════════════════════════════════════════════
  const seen = (p) => !!p && p.shared !== false;
  react({
    id: 'r_mu_aling',
    thread: 'jl',
    trigger: { on: 'act', act: 'music_play', match: (p, s) => seen(p) && (p.playlist === 'pl_aling' || p.id === 'kt3') && keep(s, 'r_mu_aling', p.id), delay: 25 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { m: 'why does apple music say ur listening to MY playlist' },
        { m: 'at this hour??' },
        { if: (s) => F(s).r_mu_aling === 'kt3', go: 'permit' },
        { if: (s) => F(s).r_mu_aling === 'pl4', go: 'lost' },
        { m: "ok which song. no don't tell me" },
        { go: 'end' },
      ],
      permit: [{ m: 'learner permit. LEARNER PERMIT' }, { if: (s) => !!F(s).car_known, go: 'pond' }, { m: 'is this a dig. this is a dig' }, { go: 'end' }],
      pond: [{ m: 'TONIGHT?? after the POND??' }, { go: 'end' }],
      lost: [{ m: "get lost is ur song. i only put it in so u'd open the playlist" }, { m: 'and u opened it' }, { go: 'end' }],
      end: [
        { m: '…is it good' },
        { fx: { aff: { jl: 1 } } },
        { log: 'Played A-Ling’s playlist on Jiang Cheng’s Apple Music. A-Ling could see', once: 'mu:aling' },
        { hint: 'A-Ling noticed.' },
      ],
    },
  });
  react({
    id: 'r_mu_soup',
    thread: 'jl',
    trigger: { on: 'act', act: 'music_play', match: (p) => seen(p) && p.id === 'yl5' && p.playlist !== 'pl_aling', delay: 30 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { m: 'apple music says ur listening to come home for soup' },
        { m: "wei wuxian's song" },
        { m: 'i turned on friend sharing on ur account in september btw. so i could see if u were still listening to sad lake music' },
        { m: "u've played that one like forty times" },
        { if: (s) => !!F(s).wwx_invited, go: 'invited' },
        { m: "i never told him. i'm not going to. but u should" },
        { go: 'end' },
      ],
      invited: [{ m: 'u said yes to him tho. so i guess u told him. kind of' }, { go: 'end' }],
      end: [{ fx: { set: { soup_song_seen: true } } }, { log: 'Played Wei Wuxian’s “Come Home for Soup”. A-Ling saw. He has seen it forty times', once: 'mu:soup' }],
    },
  });
  const SHIJIE = ['sj1', 'sj2', 'sj3', 'sj4'];
  react({
    id: 'r_mu_shijie',
    thread: 'jl',
    trigger: { on: 'act', act: 'music_play', match: (p, s) => seen(p) && (p.playlist === 'pl_shijie' || SHIJIE.includes(p.id)) && keep(s, 'r_mu_shijie', { id: p.id, title: p.title || '', pl: p.playlist || null }), delay: 30 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu' },
        { if: (s) => (F(s).r_mu_shijie || {}).id === 'sj2', go: 'lullaby' },
        { if: (s) => (F(s).r_mu_shijie || {}).pl === 'pl_shijie', go: 'playlist' },
        { m: 'apple music says ur listening to shen yao' },
        { m: "those are the songs from ur shijie playlist. mom's songs. i saw it in september. i never said anything" },
        { go: 'soup' },
      ],
      playlist: [
        { m: "apple music says ur listening to mom's playlist" },
        { m: 'the one called shijie. i saw it in september. i never said anything' },
        { go: 'soup' },
      ],
      soup: [{ m: 'wei wuxian is making the soup right now btw. jingyi says the whole jingshi smells like it' }, { go: 'end' }],
      lullaby: [
        { m: 'why r u listening to little lotus sleep' },
        { m: 'u used to hum that when i was little. u hummed it wrong every time' },
        { m: 'sizhui says u still hum it to fairy when u think no one is listening' },
        { go: 'end' },
      ],
      end: [
        { m: '…night jiujiu' },
        { fx: { aff: { jl: 1 } } },
        { log: (s) => 'Played “' + ((F(s).r_mu_shijie || {}).title || 'Lotus Root Soup') + '” from the playlist called “Shijie”. A-Ling saw', once: 'mu:shijie' },
        { hint: 'A-Ling noticed.' },
      ],
    },
  });
  react({
    id: 'r_mu_peony',
    thread: 'jl',
    trigger: { on: 'act', act: 'music_play', match: (p) => seen(p) && p.id === 'kt2' && p.playlist !== 'pl_aling', delay: 25 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'PEONY SEASON??' },
        { m: "jiujiu u HATE peony season. u said it's the reason u leave every gala at 11" },
        { m: '…is this about the balcony' },
        { m: 'ew. ew ew ew. good for u. EW' },
        { fx: { sus: { jl: 1 } } },
        { log: 'Played “Peony Season”, the gala song, in the middle of the night. A-Ling saw', once: 'mu:peony' },
        { hint: 'A-Ling noticed.' },
      ],
    },
  });
  react({
    id: 'r_mu_hanshi',
    thread: 'jl',
    trigger: { on: 'act', act: 'music_play', match: (p) => seen(p) && p.id === 'cr4', delay: 25 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'jiujiu. "hanshi, early snow"??' },
        { m: "that's zewu-jun's HOUSE. ur listening to a song about zewu-jun's HOUSE" },
        { m: "i'm not saying anything. i'm going to sleep. i'm saying NOTHING" },
        { log: 'Played “Hanshi, Early Snow” at night. A-Ling saw and said nothing, loudly', once: 'mu:hanshi' },
      ],
    },
  });
  // Sharing switched off: nobody sees. He will, in Recently Played.
  const MEANING = ['yl5', 'sj1', 'sj2', 'kt2', 'cr4', 'kt3'];
  react({
    id: 'r_mu_quiet',
    thread: 'ea',
    anytime: true,
    trigger: { on: 'act', act: 'music_play', match: (p, s) => !!p && p.shared === false && MEANING.includes(p.id) && keep(s, 'r_mu_quiet', p.title || '') },
    nodes: { start: [{ log: (s) => 'Played “' + (F(s).r_mu_quiet || 'a song') + '” on his phone with sharing off. Nobody saw', once: 'mu:quiet' }] },
  });

  // ── Songs sent through the share sheet (a Messages link to music.apple.com) ─
  const MU = /music\.apple\.com\/cn\/(song|album|playlist|artist|station)\/([\w-]+)/;
  const songShare = (p, th) => {
    if (!p || p.thread !== th || !p.link || !p.link.url) return null;
    const m = MU.exec(String(p.link.url));
    return m ? { kind: m[1], id: m[2] } : null;
  };
  const shared = (s, k) => F(s)[k] || {};
  react({
    id: 'r_mu_share_lxc',
    thread: 'lxc',
    trigger: { on: 'act', act: 'send', match: (p, s) => { const x = songShare(p, 'lxc'); return !!x && keep(s, 'r_mu_lxc', x); }, delay: 6 },
    nodes: {
      start: whenFree('lxc', 'look'),
      look: [
        { typing: 4 },
        { if: (s) => shared(s, 'r_mu_lxc').id === 'cr4', go: 'hanshi' },
        { if: (s) => /^(ln|cr)\d$|^(ln|cl|gusu)$/.test(shared(s, 'r_mu_lxc').id || ''), go: 'gusu' },
        { if: (s) => shared(s, 'r_mu_lxc').id === 'kt2', go: 'peony' },
        { if: (s) => shared(s, 'r_mu_lxc').id === 'pl4', go: 'lost' },
        { if: (s) => shared(s, 'r_mu_lxc').id === 'yl5', go: 'soup' },
        { if: (s) => /^sj\d$|^sy$|^pl_shijie$|^shenyao$/.test(shared(s, 'r_mu_lxc').id || ''), go: 'shijie' },
        { m: "Thank you. I'll listen to it now." },
        { m: 'With tea. It seems to be that kind of night.' },
        { go: 'end' },
      ],
      hanshi: [
        { m: 'Hanshi, Early Snow.' },
        { m: "That's my house. In the snow." },
        { m: "I didn't know anyone had written it down. Or that you had found it." },
        { m: "I'm listening to it now, in the Hanshi. It's strange and lovely, hearing where I am." },
        { go: 'end' },
      ],
      gusu: [
        { m: "Wangji's ensemble." },
        { m: 'He prefers not to be credited. He will be very quietly pleased that you listen to it.' },
        { m: "I'm listening to it now. With tea. It seems to be that kind of night." },
        { go: 'end' },
      ],
      peony: [
        { m: 'They played this at the end of the gala.' },
        { m: "You'd already gone. I stayed for the whole song, which I'm told is unusual." },
        { m: '"If you ask me twice, I\'ll answer again."' },
        { m: 'Is that a hint, Wanyin? 🙂' },
        { go: 'end' },
      ],
      lost: [
        { m: '…Is this a message? 🙂' },
        { m: 'I listened to all of it, just in case. I think it may be the angriest song I have ever heard. I liked it very much.' },
        { go: 'end' },
      ],
      soup: [
        { m: "Wei Wuxian's song. Wangji plays the drums on it, and doesn't smile in the photographs." },
        { m: 'Have you told him that you listen to it?' },
        { go: 'end' },
      ],
      shijie: [
        { m: 'Is this the song your sister used to sing?' },
        { m: "Thank you for letting me hear it. I know it isn't a small thing to share." },
        { go: 'end' },
      ],
      end: [
        { log: 'Sent Lan Xichen a song in the middle of the night', once: 'mu:share:lxc' },
        { if: (s) => !!F(s).r_lxc_song_aff, go: 'stop' },
        { fx: { set: { r_lxc_song_aff: true }, aff: { lxc: 1 } } },
        { hint: 'Lan Xichen will remember that.' },
      ],
    },
  });
  react({
    id: 'r_mu_share_wwx',
    thread: 'wwx',
    trigger: { on: 'act', act: 'send', match: (p, s) => { const x = songShare(p, 'wwx'); return !!x && /^(yl\d|yl|yiling|sj\d|sy|pl_shijie)$/.test(x.id) && keep(s, 'r_mu_wwx', x); }, delay: 5 },
    when: (s) => !F(s).burned,
    nodes: {
      start: whenFree('wwx', 'look'),
      look: [
        { if: (s) => shared(s, 'r_mu_wwx').id === 'yl5', go: 'gate' },
        { if: (s) => shared(s, 'r_mu_wwx').id === 'yl2', go: 'dog' },
        { if: (s) => /^sj\d$|^sy$|^pl_shijie$/.test(shared(s, 'r_mu_wwx').id || ''), go: 'shijie' },
        { m: 'JIANG CHENG IS SHARING MY BAND' },
        { m: 'lan zhan. LAN ZHAN. we have a fan' },
        { m: 'we have one (1) fan and it is jiang cheng' },
        { fx: { sus: { wwx: 1 } } },
        { log: 'Sent Wei Wuxian his own band. He has a fan now', once: 'mu:share:wwx' },
      ],
      gate: [
        { m: 'jiang cheng' },
        { m: 'u sent me MY song' },
        { m: 'come home for soup. the gate one' },
        { typing: 5 },
        { if: (s) => !!F(s).wwx_invited, go: 'gate_inv' },
        { m: 'is this an answer' },
        { choice: [
            { t: 'Six-thirty.', fx: { set: { wwx_invited: true, wwx_done: true } }, go: 'gate_yes' },
            { t: "It's a song.", fx: { set: { wwx_maybe: true } }, go: 'gate_maybe' },
          ], timeout: 90, onTimeout: 'gate_maybe' },
      ],
      gate_yes: [
        { m: '!!!!!!!!' },
        { m: 'IT WAS AN ANSWER' },
        { m: "lan zhan he answered with OUR SONG. i'm crying into the soup. the soup can take it" },
        { m: "6:29 at the gate. i'll knock this time" },
        { log: 'Answered Wei Wuxian with his own song. Six-thirty, Sunday', once: 'mu:share:wwx' },
        { hint: 'Wei Wuxian will remember that.' },
      ],
      gate_maybe: [
        { m: '"it\'s a song"' },
        { m: "it's a song about ur GATE, jiang cheng" },
        { m: "i'm taking it as a not no" },
        { fx: { set: { wwx_maybe: true } } },
        { log: 'Sent Wei Wuxian his own song about the Lotus Pier gate', once: 'mu:share:wwx' },
      ],
      gate_inv: [
        { m: "i'm going to play it at the gate on sunday. on the flute. lan zhan will drum on the pot" },
        { m: 'u can pretend to hate it' },
        { log: 'Sent Wei Wuxian his own song about the Lotus Pier gate', once: 'mu:share:wwx' },
      ],
      dog: [
        { m: "DON'T BRING THE DOG" },
        { m: 'is this a THREAT. is fairy coming on sunday' },
        { m: '(the last verse says she can come. she stays by the door. i wrote it. i meant it. mostly)' },
        { log: 'Sent Wei Wuxian “Don’t Bring the Dog”, ominously', once: 'mu:share:wwx' },
      ],
      shijie: [
        { m: "shijie's album" },
        { m: 'she played this every summer. the radio on the kitchen windowsill' },
        { m: '…thank u' },
        { log: 'Sent Wei Wuxian a song from A-Jie’s album', once: 'mu:share:wwx' },
      ],
    },
  });
  react({
    id: 'r_mu_share_jl',
    thread: 'jl',
    trigger: { on: 'act', act: 'send', match: (p) => { const x = songShare(p, 'jl'); return !!x && x.id === 'kt3'; }, delay: 4 },
    nodes: {
      start: whenFree('jl', 'look'),
      look: [
        { m: 'WHY' },
        { m: 'why would u send me this. TONIGHT' },
        { if: (s) => !!F(s).car_known, go: 'pond' },
        { m: 'is this about my driving test. it is. isnt it' },
        { go: 'end' },
      ],
      pond: [{ m: '"call me when the koi start swimming" jiujiu i am BEGGING u' }, { go: 'end' }],
      end: [{ log: 'Sent A-Ling “Learner Permit”, pointedly', once: 'mu:share:jl' }],
    },
  });
})();
