/* Live scenes — Family, chapters 1–3: the plane, Tonia and the woman who called the house, who meets the kids and
   where they sleep, the 07:40 landing, Teucer's FaceTime, the toy-factory tour, the Reel Rush rematch.
   Facts: docs/STORY.md (Family [S1b], pacing slots, cross-arc links). Format: docs/DEV.md "Story engine".
   Owner: S1b. Threads: fam, teucer, tonia, mama, papa, anthon (+ short confirmations written into zl, lumine, ekat,
   beidou when Childe asks them for a favour). Chapter 4–7 scenes, onAct rules and reactions: family-2.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const S = JC.story;

  // ── helpers ──────────────────────────────────────────────────────
  const F = (s) => s.flags || {};
  /** one choice scene per thread at a time: poll until the thread is free, then hold it */
  const waitFor = (k, next, self) => [{ if: (s) => !F(s)['busy_' + k], go: next }, { wait: 6 }, { go: self || 'start' }];
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });
  const scene = (def) => S.scene(Object.assign({ arc: 'fam' }, def));
  const at = (t) => JC.time.parse(t);
  const LODGING = ['kids_grand', 'kids_apartment', 'kids_wangshu', 'kids_alcor', 'kids_zl'];
  const stay = (k) => { const set = {}; LODGING.forEach((x) => { set[x] = x === k; }); return set; };
  const anyPickup = (s) => !!(F(s).zl_pickup || F(s).lumine_pickup || F(s).ekat_pickup || F(s).ride_kids || F(s).fatui_pickup);
  const held = (s) => !!(F(s).fatui_pickup && !F(s).kids_rescued);

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 1 — Friday night
  // ════════════════════════════════════════════════════════════════

  // ── The plane (the group, ch1 +15 s) ─────────────────────────────
  scene({
    id: 'fam_plane', thread: 'fam', ch: 'fri_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 15 },
    nodes: {
      start: waitFor('fam', 'go'),
      go: [
        lock('fam'),
        { m: 'Surprise!! 🎉', from: 'mama' },
        { m: '(Teucer made me promise to write it exactly like that.)', from: 'mama' },
        { m: '', img: 'p_teucer_plane', from: 'mama' },
        { m: 'Tonia sent this before they closed the doors. Window seats! Mr. Pulcinella arranged everything. LA 711, lands 07:40 your time.', from: 'mama' },
        { m: 'MAMA', from: 'teucer', d: 0.6 },
        { m: 'U SAID SURPRISE', from: 'teucer', d: 0.6 },
        { m: 'NOT THE PLANE PART', from: 'teucer', d: 0.8 },
        { m: 'teucer the surprise has been dead since wednesday', from: 'anthon' },
        { m: 'Teucer, airplane mode. The lady with the trolley is looking at us.', from: 'tonia' },
        { m: 'BROTHER DONT READ THIS 🙈', from: 'teucer', d: 0.7 },
        { choice: [
          { t: "TEUCER!!! I didn't see anything!! 🙈🐟 especially not a plane", fx: { aff: { teucer: 1 } }, go: 'cute' },
          { t: "Window seats!! you'll see the sea from the sky, Teucer. count the ships for me 😁", fx: { aff: { teucer: 1, mama: 1 } }, go: 'ships' },
          { t: 'Why is Pulcinella paying for all this?', fx: { sus: { mama: 1 } }, go: 'why' },
          { t: 'Great. See you tomorrow.', fx: { sus: { teucer: 1 } }, go: 'flat' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      cute: [
        { m: 'GOOD', from: 'teucer', d: 0.5 },
        { m: 'it is VERY SECRET', from: 'teucer' },
        { m: "He's going to fall asleep in eleven minutes. I'm timing it.", from: 'tonia' },
        { m: 'bet 5 mora he cries at takeoff', from: 'anthon' },
        { m: 'I DO NOT CRY AT PLANES', from: 'teucer' },
        { go: 'seed' },
      ],
      ships: [
        { m: 'I WILL COUNT ALL OF THEM', from: 'teucer' },
        { m: '1', from: 'teucer', d: 0.4 },
        { m: '2', from: 'teucer', d: 0.4 },
        { m: "We haven't taken off, Teucer. Those are luggage trucks.", from: 'tonia' },
        { m: 'TRUCK SHIPS', from: 'teucer' },
        { go: 'seed' },
      ],
      why: [
        { m: "Because he's a kind man, my sun! And you're his favourite. He told me so on the telephone.", from: 'mama' },
        { m: 'He said, “Tartaglia is like a grandson to me.” I said, “You mean Ajax.” He laughed and laughed.', from: 'mama' },
        { typing: 4, from: 'tonia' },
        { m: '…', from: 'tonia' },
        { m: 'Hm. — Papa', from: 'papa' },
        { go: 'seed' },
      ],
      flat: [
        { m: '😢', from: 'teucer', d: 1.2 },
        { m: 'that is a SAD message', from: 'teucer' },
        { m: 'bro texts like a dentist appointment', from: 'anthon' },
        { m: "He's tired, Teucer. It's midnight.", from: 'tonia' },
        { typing: 3, from: 'tonia' },
        { m: '…It\'s midnight and he\'s awake. Ajax, why are you awake?', from: 'tonia' },
        { go: 'seed' },
      ],
      read: [
        { wait: 4 },
        { m: 'brother is asleep', from: 'teucer' },
        { m: 'GOOD. the surprise is SAFE 🤫', from: 'teucer' },
        { m: 'the surprise is the least safe thing in this family', from: 'anthon' },
        { go: 'seed' },
      ],
      seed: [
        { m: "Sleep soon, my sun. I'll message you about the airport when I'm home with my tea.", from: 'mama' },
        free('fam'),
        { start: 'fam_teucer_plane', delay: 20 },
      ],
      exp: [free('fam')],
    },
  });

  // ── Teucer, last messages before airplane mode (DM) ──────────────
  scene({
    id: 'fam_teucer_plane', thread: 'teucer', ch: 'fri_night', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { m: 'brother', d: 0.6 },
        { m: 'r u still awake', d: 0.8 },
        { m: 'the plane is going on the RUNWAY' },
        { m: '', voice: { dur: 8, text: '(A roar of engines.) “BROTHER WE’RE FLYING WE’RE FLYING WE’RE— (Tonia: “Teucer. Inside voice.”) …flying.”' } },
        { m: 'ok tonia says i REALLY have to do airplane mode now' },
        { m: 'can u say goodnight to Sir Fang. he is a little bit scared of the sky' },
        { choice: [
          { t: "Goodnight, Sir Fang 🐺 you're on guard duty. if a cloud comes too close: AWOOO", fx: { aff: { teucer: 1 } }, go: 'fang' },
          { t: "Goodnight Teucer!! see you in the morning. I'll be the one with the biggest grin 😁🐟", fx: { aff: { teucer: 1 }, set: { promised_grin: true } }, go: 'grin' },
          { t: "Teucer, it's late. Put the watch away.", fx: { sus: { teucer: 1 } }, go: 'stern' },
          { t: 'Sir Fang? Who is Sir Fang?', fx: { sus: { teucer: 3 } }, go: 'who' },
        ] },
      ],
      fang: [
        { m: 'he says AWOOOOO', d: 0.8 },
        { m: 'that means ok' },
        { m: 'goodnight brother 🐟❤️' },
        { go: 'off' },
      ],
      grin: [
        { m: 'I WILL HAVE A BIGGER ONE' },
        { m: 'goodnight brother 🐟❤️' },
        { go: 'off' },
      ],
      stern: [
        { m: 'ok 😢', d: 1.4 },
        { m: 'u sound like tonia' },
        { m: 'goodnight brother' },
        { go: 'off' },
      ],
      who: [
        { m: 'BROTHER', d: 0.5 },
        { m: 'SIR FANG. MY WOLF. U GAVE HIM TO ME' },
        { m: 'at CHRISTMAS' },
        { m: '😢😢😢' },
        { typing: 3 },
        { m: 'tonia says u r making a JOKE' },
        { m: 'it is a BAD joke' },
        { m: 'goodnight' },
        { go: 'off' },
      ],
      off: [{ sys: 'Teucer 🐟 has notifications silenced' }, free('teucer')],
      exp: [free('teucer')],
    },
  });

  // ── Tonia: who is Signora? (ch1 +420 s) ──────────────────────────
  scene({
    id: 'fam_tonia_signora', thread: 'tonia', ch: 'fri_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 420 },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { m: 'Ajax.' },
        { m: "I know you're awake. You're always awake at midnight and you always pretend you were asleep." },
        { m: 'We\'re in the air. They have wifi. It costs 9 mora. I paid it to ask you this.' },
        { m: "The woman who called the house. Mama put her on speaker by accident, she still doesn't know how the new phone works." },
        { m: 'She had a voice like someone reading out a will. She said: “Good evening. I am looking for the Eleventh. Tell him Signora called, and that his family is in our thoughts.”' },
        { m: 'In our thoughts, Ajax.', d: 2 },
        { if: (s) => F(s).saw_travel, go: 'travel' },
        { go: 'ask' },
      ],
      travel: [
        { m: 'And a man from Mr. Pulcinella\'s office met us at check-in to “make sure we got on the plane”. He watched until the doors closed. He didn\'t wave.' },
        { go: 'ask' },
      ],
      ask: [
        { m: 'Who is Signora? And why is our family in her thoughts?' },
        { choice: [
          { t: 'Signora? Head of Accounts 😁 scary lady, very dramatic. she probably wants my expense reports', go: 'lie' },
          { t: "She's a colleague. My job's more complicated than toys, Tonia. I'll explain properly. Not over plane wifi.", fx: { set: { half_truth: true }, aff: { tonia: 1 } }, go: 'half' },
          { t: "I don't sell toys. I'll tell you everything when you land. Don't tell Teucer.", fx: { set: { told_tonia: true }, aff: { tonia: 2 } }, go: 'told' },
          { t: "Who's Signora? Never heard of her.", fx: { sus: { tonia: 2 } }, go: 'never' },
          { t: 'Please don\'t worry, Tonia 🙏 everything is under control', fx: { sus: { tonia: 2 } }, go: 'pray' },
          { t: '[Leave on read]', silent: true, go: 'onread' },
        ] },
      ],
      lie: [
        { typing: 4 },
        { m: 'Head of Accounts.' },
        { m: 'Head of Accounts telephoned our house in Morepesok at eleven at night on a Friday to say our family is in her thoughts.' },
        { typing: 3 },
        { m: 'Okay, Ajax.' },
        { m: "I'm writing it down. In the notebook. Not because I think you're lying. Because I want to remember exactly what you said, so that later I can be sure." },
        { go: 'end' },
      ],
      half: [
        { typing: 5 },
        { m: '…Thank you.' },
        { m: "That's the first true thing you've said to me about your job in two years. I can tell, because it was short." },
        { m: 'Okay. Not over plane wifi. But you will explain. In person.' },
        { m: 'Teucer is asleep on my arm. His mouth is open. Sir Fang is a little bit in his mouth.' },
        { go: 'end' },
      ],
      told: [
        { typing: 6 },
        { wait: 2 },
        { typing: 4 },
        { m: '…' },
        { m: 'Okay.' },
        { m: 'Okay. I think I knew. Since the letter. Maybe since the Inspector Volkov books, nobody gets those signed.' },
        { m: "I won't tell Teucer. I won't tell Mama." },
        { m: 'Is she dangerous? The woman?' },
        { choice: [
          { t: "Yes. But she's not getting anywhere near you. I promise.", fx: { aff: { tonia: 1 } }, go: 'told_promise' },
          { t: 'Not to you. Only to me 😁', go: 'told_grin' },
        ] },
      ],
      told_promise: [
        { m: 'You promise a lot of things, Ajax.' },
        { m: 'Keep this one.' },
        { go: 'end' },
      ],
      told_grin: [
        { m: "That isn't funny." },
        { typing: 3 },
        { m: "…It's a little funny. Because it's exactly what you would say." },
        { go: 'end' },
      ],
      never: [
        { typing: 4 },
        { m: 'Never heard of her.' },
        { m: 'She knew your work name. She knew our telephone number. She knew Mama\'s name.' },
        { m: 'And you\'ve never heard of her.' },
        { m: "Ajax, you're a terrible liar. But you're not usually this bad." },
        { go: 'end' },
      ],
      pray: [
        { m: '🙏?', d: 1 },
        { m: 'Since when do you do the praying hands? You make fun of Mama for the praying hands.' },
        { m: 'Is your consultant there? Did he make you drink osmanthus wine again?' },
        { m: 'Fine. “Everything is under control.” I\'ll remember you said that.' },
        { go: 'end' },
      ],
      onread: [
        { wait: 8 },
        { m: 'Read.' },
        { m: 'Okay.' },
        free('tonia'),
        { call: 'call_tonia_plane', delay: 4 },
      ],
      end: [{ m: 'Goodnight, bratik.' }, free('tonia')],
      exp: [free('tonia')],
    },
  });

  // Tonia calls from the plane when she's left on read.
  S.call({
    id: 'call_tonia_plane', from: 'tonia', ring: 25,
    onHangup: [{ start: 'fam_tonia_hungup' }],
    missed: [{ start: 'fam_tonia_stupid' }],
    nodes: {
      start: [
        { say: '(Engine hum. A child snoring very close to the microphone.)', from: 'sys' },
        { say: "Ajax? Don't hang up. I can hear you breathing." },
        { say: 'Just say something. Say “Tonia, go to sleep.” You always say that.' },
        { choice: [
          { t: '(Stay silent)', go: 'silent' },
          { t: '"…Tonia, go to sleep."', go: 'voice' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      silent: [
        { say: '…' },
        { say: 'I can hear the sea. Are you at the harbor? At midnight?' },
        { say: "Fine. Don't talk. You never talk when something's wrong, you just get louder in texts." },
        { say: "I'm hanging up. Text me something stupid so I know you're okay." },
        { start: 'fam_tonia_stupid' },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: "That's not your voice." },
        { say: 'Who is this? Where is my brother?' },
        { fx: { sus: { tonia: 3 } } },
        { choice: [
          { t: '"Bad line. I\'m at the harbor. It\'s the wind."', go: 'wind' },
          { t: '"I\'m not Ajax. I found his phone."', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      wind: [
        { say: "The wind doesn't make your voice lower, Ajax." },
        { say: 'Text me. Right now. In writing.' },
        { start: 'fam_tonia_stupid' },
        { hangup: true },
      ],
      truth: [
        { say: '…' },
        { say: "I knew it. I knew something was wrong. Where is he? Is he hurt?" },
        { say: "Don't answer that. Just give it back to him. Please." },
        { fx: { set: { told_truth: true, tonia_knows_stranger: true } } },
        { start: 'fam_honest_tonia' },
        { hangup: true },
      ],
      hang: [{ start: 'fam_tonia_hungup' }, { hangup: 'me' }],
    },
  });

  scene({
    id: 'fam_honest_tonia', thread: 'tonia', trigger: { on: 'manual' },
    nodes: { start: [{ wait: 3 }, { m: "I've told Teucer you're asleep. He believes me. He believes everyone." }, { m: 'Give my brother his phone back.' }, { wait: 3 }, { ending: 'honest' }] },
  });

  scene({
    id: 'fam_tonia_hungup', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 3 },
        { m: 'You hung up on me.' },
        { m: "You've never hung up on me. Not once. Not even when I was nine and called you eleven times about a spider." },
        { fx: { sus: { tonia: 1 } } },
        { start: 'fam_tonia_stupid', delay: 3 },
      ],
    },
  });

  scene({
    id: 'fam_tonia_stupid', thread: 'tonia', ch: 'fri_night', expire: 'exp', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { wait: 3 },
        { m: 'Text me something stupid. So I know you\'re okay.' },
        { choice: [
          { t: 'what do you call a fish with no eyes. a fsh 😁🐟', fx: { aff: { tonia: 1 } }, go: 'fsh' },
          { t: "Tonia, go to sleep 💧", fx: { aff: { tonia: 1 } }, go: 'sleep' },
          { t: "I'm okay. Go to sleep.", fx: { sus: { tonia: 1 } }, go: 'short' },
        ] },
      ],
      fsh: [
        { m: "That's the worst joke you know. You told it at Papa's birthday and he laughed so hard he had to go outside." },
        { m: "Okay. I believe you're okay. Goodnight." },
        free('tonia'),
      ],
      sleep: [{ m: 'There he is.', d: 1.2 }, { m: 'Goodnight, bratik.' }, free('tonia')],
      short: [{ m: "That isn't stupid. That's just short." }, { m: 'Goodnight.' }, free('tonia')],
      exp: [free('tonia')],
    },
  });

  // ── Who meets them, and where they sleep (Mama, ch1 +600 s, required) ──
  const P = {
    zl: "Xiansheng will meet them. My friend Zhongli. He's very good with kids.",
    lumine: 'Lumine. My sparring partner. She owes me a favour, and nobody gets past her.',
    ekat: "Ekaterina, from my office. She's the most organised person alive.",
    ride: "I'll book them a Harbor Ride. Tonia waits at the information desk until it comes.",
  };
  /** the four safe pickups, as choice options (go: p_zl / p_lumine / p_ekat / p_ride) */
  const pickOpts = (labels) => [
    { t: (labels && labels.zl) || P.zl, fx: { set: { zl_pickup: true, fatui_pickup: false }, aff: { zl: 1 } }, go: 'p_zl' },
    { t: (labels && labels.lumine) || P.lumine, fx: { set: { lumine_pickup: true, fatui_pickup: false } }, go: 'p_lumine' },
    { t: (labels && labels.ekat) || P.ekat, fx: { set: { ekat_pickup: true, fatui_pickup: false } }, go: 'p_ekat' },
    { t: (labels && labels.ride) || P.ride, fx: { set: { ride_plan: true, tonia_desk: true, fatui_pickup: false } }, go: 'p_ride' },
  ];

  scene({
    id: 'fam_pickup', thread: 'mama', ch: 'fri_night', required: true, expire: 'exp',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 600 },
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        { m: '', voice: { dur: 46, text: '“My sun, I’m home, I have my tea, your father is snoring in the chair. Listen. Mr. Pulcinella’s office says a driver will wait for the children at arrivals with a sign. But Tonia rang me from the gate, and she said she wants you. Not a driver. You. So — who is meeting them? Tell me, so I can sleep.”' } },
        { m: 'Who is meeting the children at 07:40? Tell me so I can sleep.' },
        { if: (s) => F(s).zl_pickup, go: 'zl_known' },
        { choice: [
          { t: "Mr. Pulcinella's driver is fine. Thank him for me.", fx: { set: { fatui_pickup: true } }, go: 'driver' },
          { t: 'Not the driver. Someone I trust will be there.', go: 'who' },
          { t: "Mama. Don't let them get into anything Pulcinella sends. Someone I trust will meet them.", if: (s) => F(s).saw_travel, fx: { aff: { tonia: 1 } }, go: 'who_warn' },
          { t: "I'll be there myself!! wouldn't miss it 😁", fx: { set: { pickup_myself: true } }, go: 'myself' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      zl_known: [
        { choice: [
          { t: "Xiansheng's meeting them! He offered. He's practising a face 😁", fx: { set: { fatui_pickup: false } }, go: 'p_zl_known' },
          { t: "Xiansheng. And tell Mr. Pulcinella's office we won't need the driver.", fx: { set: { fatui_pickup: false }, aff: { mama: 1 } }, go: 'p_zl_known' },
        ] },
      ],
      p_zl_known: [
        { m: 'The consultant! The one who never pays! He offered? My sun, he must like you very much.' },
        { m: 'Is he tall? Teucer will want to know if he is tall.' },
        { go: 'lodging' },
      ],
      who_warn: [
        { m: 'Ajax? What do you mean? He is your employer.', d: 2 },
        { m: '…All right. All right, my sun. You know him better than I do.' },
        { go: 'who' },
      ],
      who: [
        { m: 'Who, my sun?' },
        { choice: pickOpts() },
      ],
      p_zl: [
        { m: 'The consultant! The one who never pays!' },
        { m: 'Is he tall? Teucer will want to know if he is tall.' },
        { start: 'fam_ask_zl', delay: 2 },
        { go: 'lodging' },
      ],
      p_lumine: [
        { m: 'An adventurer! With a sword? Ajax, is she careful?' },
        { m: 'Tonia says if she has a sword, Teucer will never come home.' },
        { start: 'fam_ask_lumine', delay: 2 },
        { go: 'lodging' },
      ],
      p_ekat: [
        { m: 'Your Ekaterina! She sends me a card every New Year with the bank\'s snowflake on it. Yes. Good. I trust her.' },
        { start: 'fam_ask_ekat', delay: 2 },
        { go: 'lodging' },
      ],
      p_ride: [
        { m: 'A taxi? On their own?' },
        { m: '…Tonia is very sensible. More sensible than you.' },
        { m: 'Book it now, my sun, so I can see it. Otherwise you will forget. I know you.' },
        { go: 'lodging' },
      ],
      driver: [
        { m: "Good. I'll tell Mr. Pulcinella's office. Such a kind man. I'm going to knit him a scarf." },
        { start: 'fam_papa_driver', delay: 45 },
        { go: 'lodging' },
      ],
      myself: [
        { m: "I knew it!! Tonia will be so happy. I'll tell Mr. Pulcinella's office no, thank you." },
        { m: 'Wear something nice. Not the scarf with the fish on it.' },
        { go: 'lodging' },
      ],
      read: [
        { wait: 10 },
        { typing: 3 },
        { m: "You're asleep. Good. Sleep, my sun." },
        { m: "I'll tell them to go with Mr. Pulcinella's driver, then. Don't worry about anything." },
        { fx: { set: { fatui_pickup: true } } },
        { start: 'fam_papa_driver', delay: 45 },
        { fx: { set: stay('kids_grand') } },
        { go: 'end' },
      ],

      lodging: [
        { m: "And they're at the Liyue Harbor Grand, yes? Three nights, all paid. Mr. Pulcinella says it has a swimming pool on the roof." },
        { choice: [
          { t: "The Grand's perfect. Teucer will live in that pool.", fx: { set: stay('kids_grand') }, go: 'l_grand' },
          { t: 'No, they stay with me. My flat looks over the whole harbor 😁', fx: { set: stay('kids_apartment') }, go: 'l_apt' },
          { t: "There's an inn up in the hills. Wangshu Inn. Quiet, safe, the best almond tofu in Liyue. I'll book it.", fx: { set: stay('kids_wangshu') }, go: 'l_wangshu' },
          { t: 'Captain Beidou owes me. They can sleep on her ship. A real ship, Mama!!', if: (s) => !F(s).beidou_snubbed, fx: { set: stay('kids_alcor') }, go: 'l_alcor' },
          { t: 'Xiansheng has a spare room. And about four hundred teacups.', if: (s) => F(s).zl_pickup, fx: { set: stay('kids_zl') }, go: 'l_zl' },
        ] },
      ],
      l_grand: [{ m: "I'll tell Teucer about the pool. No, I won't. He'll never sleep again." }, { go: 'end' }],
      l_apt: [
        { m: 'With you! Of course with you. That\'s what Tonia wanted.' },
        { m: 'Is your flat clean? Ajax. Is your flat clean.' },
        { go: 'end' },
      ],
      l_wangshu: [{ m: 'An inn in the mountains. Like a story.' }, { m: 'Tonia will read on the balcony. Teucer will look for dragons.' }, { go: 'end' }],
      l_alcor: [
        { m: 'A SHIP? Ajax! Teucer will explode. Is the captain sensible?' },
        { m: "…Don't answer that. I can hear you grinning from here." },
        { start: 'fam_ask_beidou', delay: 2 },
        { go: 'end' },
      ],
      l_zl: [{ m: 'The consultant\'s house! With the teacups! Tell him Teucer breaks things. Tell him gently.' }, { start: 'fam_ask_zl_home', delay: 30 }, { go: 'end' }],
      end: [
        { m: 'Thank you, my sun. Now I can sleep.' },
        { m: "Eat something. It's late, but eat something." },
        free('mama'),
      ],
      exp: [free('mama')],
    },
  });

  // Childe asks his friends. (Short confirmations in their threads.)
  scene({
    id: 'fam_ask_zl', thread: 'zl', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'xiansheng. a favour. a big one' },
        { me: 'my little brother and sister land at 07:40 tomorrow, LA 711. could you meet them? I\'ll owe you a dinner. (I already owe you every dinner 😁)' },
        { wait: 6 },
        { m: 'Childe. It would be an honour.' },
        { m: 'I shall be at arrivals at half past seven with a suitably dignified sign. I will speak to them only of things that are both true and harmless, such as the migratory habits of cranes and the correct temperature for oolong.' },
        { m: 'I shall also, I suspect, need you to settle the cost of a juice.' },
      ],
    },
  });
  scene({
    id: 'fam_ask_zl_home', thread: 'zl', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'one more thing. could they stay with you? the hotel is… Pulcinella\'s' },
        { wait: 5 },
        { m: 'They are most welcome. I will air the guest room and put away the more fragile teacups.' },
        { m: 'Not all of them. Some fragility is educational.' },
      ],
    },
  });
  scene({
    id: 'fam_ask_lumine', thread: 'lumine', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'comrade!! favour. my little brother and sister land at 07:40, LA 711. can you meet them and keep them out of trouble? 😁' },
        { wait: 6 },
        { m: 'sure.' },
        { m: 'paimon wants to know if they like snacks' },
        { m: 'she\'s making a sign. it says WELCOME TO LIYUE (PAIMON IS THE GUIDE)' },
        { m: 'you owe me' },
      ],
    },
  });
  scene({
    id: 'fam_ask_ekat', thread: 'ekat', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Ekaterina! favour. LA 711 lands 07:40, my brother and sister. can you meet them? tell them you\'re from Northland Toys 😁' },
        { wait: 6 },
        { m: 'Of course, Sir.' },
        { m: 'I\'ll be there at seven with a sign. Should the sign say “Northland Toys”?' },
        { m: 'I\'ll make it say “Northland Toys”.' },
        { m: 'Sir… after my call earlier. Are you somewhere safe?' },
      ],
    },
  });
  scene({
    id: 'fam_ask_beidou', thread: 'beidou', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Captain!! calling in that favour 😁 my little brother and sister need a bed for three nights. a bed on a SHIP' },
        { wait: 7 },
        { m: "kid. the Alcor's a warship with a galley, not a hotel" },
        { m: '…how little' },
        { m: "ha. fine. Kazuha's making up the bunks. if the small one throws up he's swabbing the deck" },
        { m: 'and you still owe me a rematch ⚓' },
      ],
    },
  });

  // Papa doesn't like the car.
  scene({
    id: 'fam_papa_driver', thread: 'papa', ch: 'fri_night', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('papa', 'go'),
      go: [
        lock('papa'),
        { if: (s) => !F(s).fatui_pickup, go: 'done' },
        { m: "Your mother says Pulcinella's man will collect the children. — Papa" },
        { typing: 5 },
        { m: 'I rode in that man\'s car once. Eight years ago. With you. — Papa' },
        { m: 'Your choice, son. — Papa' },
        { choice: [
          { t: "It's fine, Papa. He's my boss. I'd know if something was wrong.", go: 'fine' },
          { t: "You're right. Someone I trust will meet them.", go: 'who' },
          { t: 'Papa, it was eight years ago. Let it go.', fx: { aff: { papa: -1 } }, go: 'letgo' },
        ] },
      ],
      fine: [{ m: 'Hm. — Papa' }, { go: 'done' }],
      letgo: [{ typing: 4 }, { m: 'I have tried. — Papa' }, { go: 'done' }],
      who: [{ m: 'Who? — Papa' }, { choice: pickOpts() }],
      p_zl: [{ m: 'Your friend with the teacups. Good. Your mother likes him and she\'s never met him. — Papa' }, { start: 'fam_ask_zl', delay: 2 }, { go: 'told' }],
      p_lumine: [{ m: 'A fighter. Good. — Papa' }, { start: 'fam_ask_lumine', delay: 2 }, { go: 'told' }],
      p_ekat: [{ m: 'Your secretary. Your mother says she writes nice cards. Good. — Papa' }, { start: 'fam_ask_ekat', delay: 2 }, { go: 'told' }],
      p_ride: [{ m: 'A taxi. Tonia is sensible. Book it now. — Papa' }, { go: 'told' }],
      told: [{ m: "I'll tell your mother in the morning. Let her sleep. — Papa" }, { go: 'done' }],
      done: [free('papa')],
      exp: [free('papa')],
    },
  });

  // ── Papa can't sleep (ch1, late) ─────────────────────────────────
  scene({
    id: 'fam_papa_night', thread: 'papa', ch: 'fri_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 1200 },
    when: (s) => !F(s).deal_refused,
    nodes: {
      start: waitFor('papa', 'go'),
      go: [
        lock('papa'),
        { m: "Can't sleep. Neither can your mother. She's pretending. I'm not. — Papa" },
        { m: 'Checked the weather over the sea. Calm all the way to Liyue. — Papa' },
        { typing: 6 },
        { m: 'Tonia is like you were. Watches everything. Teucer is like your mother. Believes everything. Look after the one who believes. Listen to the one who watches. — Papa' },
        { if: (s) => F(s).fatui_pickup, go: 'car' },
        { go: 'ask' },
      ],
      car: [{ m: "I wish it wasn't his car. — Papa" }, { go: 'ask' }],
      ask: [
        { choice: [
          { t: 'I will, Papa. Go to sleep ❤️', fx: { aff: { papa: 1 } }, go: 'yes' },
          { t: "Papa, you've never sent three messages in a row in your life. Are you okay? 😁", fx: { aff: { papa: 1 } }, go: 'three' },
          { t: 'Thank you for your advice, father.', fx: { sus: { papa: 2 } }, go: 'father' },
          { t: '[Leave on read]', silent: true, go: 'quiet' },
        ] },
      ],
      yes: [{ m: 'Yes. — Papa' }, free('papa')],
      three: [
        { typing: 5 },
        { m: 'Your mother is watching me type. She says to say it. — Papa' },
        { m: "I'm proud of you. Goodnight. — Papa" },
        free('papa'),
      ],
      father: [
        { typing: 4 },
        { m: '“Father.” — Papa' },
        { m: 'Are you angry with me, son? — Papa' },
        free('papa'),
      ],
      quiet: [{ wait: 10 }, { m: 'Goodnight. — Papa' }, free('papa')],
      exp: [free('papa')],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 2 — Saturday morning: the landing
  // ════════════════════════════════════════════════════════════════

  scene({
    id: 'fam_morning', thread: 'fam', ch: 'sat_dawn', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 20 },
    nodes: {
      start: waitFor('fam', 'go'),
      go: [
        lock('fam'),
        { m: 'Good morning, my sun!! ☀️ They land in less than an hour!', from: 'mama' },
        { m: "Did you sleep? You didn't sleep.", from: 'mama' },
        { m: "it's 7am on a SATURDAY why is everyone awake", from: 'anthon' },
        { if: (s) => F(s).fatui_pickup, go: 'drv' },
        { if: (s) => F(s).ride_plan && !F(s).ride_kids, go: 'noride' },
        { if: (s) => F(s).pickup_myself && !anyPickup(s), go: 'self' },
        { go: 'ask' },
      ],
      drv: [
        { m: "Mr. Pulcinella's office sent me the driver's name! Mr. Ivanov. Grey coat, black car. So organised.", from: 'mama' },
        { m: 'They will take the children straight to the Grand. You can meet them there for breakfast.', from: 'mama' },
        { choice: [
          { t: 'Change of plan. No driver. Someone I trust is meeting them.', go: 'change' },
          { t: 'Perfect 😁 thank Mr. Pulcinella for me', go: 'ok' },
          { t: '[Leave on read]', silent: true, go: 'ok_quiet' },
        ] },
      ],
      change: [
        { m: 'Again? My sun, you are making the poor man\'s office very busy.', from: 'mama' },
        { m: 'Who, then?', from: 'mama' },
        { choice: pickOpts() },
      ],
      p_zl: [{ m: 'The tall consultant! Teucer will be so pleased. I told him about the teacups.', from: 'mama' }, { start: 'fam_sos_zl', delay: 2 }, { go: 'end' }],
      p_lumine: [{ m: 'The girl with the sword. Tonia will be pleased. Teucer will be impossible.', from: 'mama' }, { start: 'fam_sos_lumine', delay: 2 }, { go: 'end' }],
      p_ekat: [{ m: 'Ekaterina! Good. I\'ll tell Mr. Pulcinella\'s office no, thank you.', from: 'mama' }, { start: 'fam_sos_ekat', delay: 2 }, { go: 'end' }],
      p_ride: [{ m: 'A taxi. Book it now, Ajax, the plane lands in fifty minutes!', from: 'mama' }, { go: 'end' }],
      noride: [
        { m: 'Did you book the car, my sun? I don\'t see it on your father\'s phone. He says I\'m looking at the weather.', from: 'mama' },
        { choice: [
          { t: 'Booking it now 😁', go: 'end' },
          { t: 'On it, Mama. Tonia knows to wait at the desk.', fx: { set: { tonia_desk: true } }, go: 'end' },
        ] },
      ],
      self: [
        { m: 'Are you on your way to the airport? Send me a photo of their faces when they see you!', from: 'mama' },
        { choice: [
          { t: "I'm on my way!! 😁", go: 'end' },
          { t: "Mama… something came up at work. Someone else will meet them.", go: 'change' },
        ] },
      ],
      ask: [
        { choice: [
          { t: 'Slept like a fish 😁🐟', go: 'ok' },
          { t: "Didn't sleep at all. too excited!!", fx: { aff: { mama: 1 } }, go: 'excited' },
          { t: '[Leave on read]', silent: true, go: 'ok_quiet' },
        ] },
      ],
      excited: [{ m: 'My sun. Me neither. Your father slept like a log, of course. Logs don\'t worry.', from: 'mama' }, { go: 'end' }],
      ok: [{ m: 'Eat breakfast! Real breakfast. Not coffee.', from: 'mama' }, { go: 'end' }],
      ok_quiet: [{ wait: 6 }, { m: 'he\'s asleep. he\'s going to miss the landing lmao', from: 'anthon' }, { go: 'end' }],
      end: [free('fam')],
      exp: [free('fam')],
    },
  });

  // Last-minute asks (the morning of / at arrivals).
  scene({
    id: 'fam_sos_zl', thread: 'zl', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'xiansheng. I need a favour, and fast. my brother and sister land at 07:40, LA 711. can you get them before anyone else does?' },
        { wait: 5 },
        { if: (s) => F(s).zl_admitted, go: 'knows' },
        { m: 'I am already putting on my coat.' },
        { m: 'Not the one with the wallet in it, I fear. But a coat.' },
      ],
      knows: [
        { m: 'I will go.' },
        { m: 'Not for you, since I do not yet know what you are. For him. And, I find, for them.' },
      ],
    },
  });
  scene({
    id: 'fam_sos_lumine', thread: 'lumine', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'comrade. emergency favour. my brother and sister land at 07:40, LA 711. please get them before Pulcinella\'s people do' },
        { wait: 5 },
        { m: 'on my way.' },
        { m: 'paimon is coming. paimon is the distraction' },
      ],
    },
  });
  scene({
    id: 'fam_sos_ekat', thread: 'ekat', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Ekaterina. my brother and sister land at 07:40, LA 711. get them. don\'t let anyone from Pulcinella\'s office take them' },
        { wait: 5 },
        { m: 'Yes, Sir. I\'m leaving now.' },
        { m: 'I\'m taking the sign that says Northland Toys. It\'s the only one I have.' },
      ],
    },
  });

  // ── 07:40: they land ─────────────────────────────────────────────
  /** steps every landing branch runs once the kids are with someone (non-blocking) */
  const landDone = [{ fx: { set: { kids_landed: true } } }, { start: 'fam_ft_ring', delay: 150 }, { start: 'fam_landed_group', delay: 10 }];
  const welcome = (first) => [
    first,
    { t: "Welcome to Liyue, Teucer!!! 🐟❤️ the fish are fat and the sea is warm and you're finally HERE", fx: { aff: { teucer: 1 } }, go: 'welcome' },
    { t: 'Good. Stay with the adult.', fx: { sus: { teucer: 1 } }, go: 'flat' },
  ];
  scene({
    id: 'fam_landing', thread: 'teucer', ch: 'sat_dawn', expire: 'exp',
    trigger: { on: 'time', at: '+1 07:40' },
    nodes: {
      start: [
        { if: (s) => !LODGING.some((k) => F(s)[k]), go: 'bed' },
        { go: 'route' },
      ],
      bed: [{ fx: { set: stay('kids_grand') } }, { go: 'route' }],
      route: [
        { if: (s) => F(s).zl_pickup, go: 'zl' },
        { if: (s) => F(s).lumine_pickup, go: 'lumine' },
        { if: (s) => F(s).ekat_pickup, go: 'ekat' },
        { if: (s) => F(s).ride_kids && F(s).tonia_desk, go: 'ride' },
        { if: (s) => F(s).ride_kids, go: 'ride_nodesk' },
        { if: (s) => F(s).ride_plan, go: 'noride' },
        { if: (s) => F(s).fatui_pickup, go: 'driver' },
        { go: 'nobody' },
      ],
      zl: [
        { m: 'WE LANDED!!!!! 🐟✈️', d: 0.6 },
        { m: 'BROTHER' },
        { m: 'THERE IS A VERY TALL MAN WITH A SIGN' },
        { m: 'it says “TEUCER AND TONIA, ESTEEMED GUESTS OF LIYUE HARBOR”' },
        { m: 'he has GOLD EYES' },
        { m: 'he BOWED to Sir Fang!!!!!!' },
        { m: 'Sir Fang bowed back (i did it for him)' },
        { m: 'Your friend is here. He introduced himself to the airport staff, a pigeon, and us, in that order.', th: 'tonia', from: 'tonia' },
        { m: 'He tried to buy Teucer a juice and discovered he had no money. He seemed genuinely surprised. Ajax, how often does that happen?', th: 'tonia', from: 'tonia' },
        ...landDone,
        { choice: welcome({ t: "That's Mr. Zhongli!! he knows EVERYTHING. ask him about rocks 😁", fx: { aff: { teucer: 1 } }, go: 'zl_rocks' }) },
      ],
      zl_rocks: [
        { m: 'I ASKED HIM' },
        { m: 'he said the oldest rock in liyue is older then the SEA' },
        { m: 'and that it is VERY patient' },
        { m: 'i love him' },
        { go: 'end' },
      ],
      lumine: [
        { m: 'WE LANDED!!!!! 🐟✈️', d: 0.6 },
        { m: 'BROTHER' },
        { m: 'a GIRL with a SWORD and a FLOATING BABY is here' },
        { m: 'the baby says she is NOT A BABY she is PAIMON' },
        { m: 'paimon ate my airplane cookie' },
        { m: 'Your friend Lumine is very calm. When we came out she looked at every person in the arrivals hall, one at a time. Like you do.', th: 'tonia', from: 'tonia' },
        { m: 'Where do you two know each other from? Toy fairs?', th: 'tonia', from: 'tonia' },
        ...landDone,
        { choice: welcome({ t: "Paimon owes you a cookie. that's a binding contract in Liyue 😁 make her pay", fx: { aff: { teucer: 1 } }, go: 'cookie' }) },
      ],
      cookie: [{ m: 'PAIMON. U OWE ME A COOKIE. IT IS A CONTRACT' }, { m: 'she says she will pay me 2 cookies LATER' }, { m: 'is that a good deal' }, { go: 'end' }],
      ekat: [
        { m: 'WE LANDED!!!!! 🐟✈️', d: 0.6 },
        { m: 'BROTHER' },
        { m: 'a LADY with a sign that says NORTHLAND TOYS' },
        { m: 'she says she is from UR FACTORY' },
        { m: 'she has a WALKIE TALKIE' },
        { m: 'Ekaterina called you “Sir” four times in two minutes. Is that normal at a toy company?', th: 'tonia', from: 'tonia' },
        { m: "She also checked every exit before we walked out. She thinks I didn't notice.", th: 'tonia', from: 'tonia' },
        ...landDone,
        { choice: welcome({ t: 'Ekaterina runs the whole factory. if she says jump, the elves jump 😁', fx: { aff: { teucer: 1 } }, go: 'ekat_elves' }) },
      ],
      ekat_elves: [{ m: 'I ASKED HER IF SHE KNOWS GRIGORY' }, { m: 'she said “of course” very fast' }, { m: 'then she wrote it down' }, { go: 'end' }],
      ride: [
        { m: "We're at the information desk. Like you said.", th: 'tonia', from: 'tonia' },
        { m: 'The car came. The driver is Mr. Fang. He has a fish-shaped air freshener. Teucer has decided he is our best friend.', th: 'tonia', from: 'tonia' },
        { m: 'WE LANDED!!!!! 🐟✈️', d: 0.6 },
        { m: 'MR FANG HAS A FISH IN HIS CAR (not real)' },
        { m: 'he says he drove u LAST NIGHT' },
        ...landDone,
        { choice: welcome({ t: 'Mr. Fang is the best driver in Liyue 😁 tell him I said so', fx: { aff: { teucer: 1 } }, go: 'fang' }) },
      ],
      fang: [{ m: 'HE SAYS THANK U' }, { m: 'he gave me a mint. it is SPICY' }, { go: 'end' }],

      // the emergencies happen in Tonia's thread
      ride_nodesk: waitFor('tonia', 'ride_nodesk_go', 'ride_nodesk'),
      ride_nodesk_go: [
        lock('tonia'),
        { m: 'Ajax. There are two men with signs.', th: 'tonia', from: 'tonia' },
        { m: "One says HARBOR RIDE — TONIA. The other one is from Mr. Pulcinella's office. He says your car was cancelled and he's here instead.", th: 'tonia', from: 'tonia' },
        { m: 'Which one?', th: 'tonia', from: 'tonia' },
        { choice: [
          { t: 'Harbor Ride. Only the Harbor Ride. Ignore the other one.', fx: { set: { tonia_desk: true } }, go: 'ride_ok' },
          { t: "Mr. Pulcinella's man. He knows the hotel.", fx: { set: { fatui_pickup: true, ride_kids: false } }, go: 'driver_t' },
        ], th: 'tonia', timeout: 90, onTimeout: 'take_driver' },
      ],
      ride_ok: [free('tonia'), { go: 'ride' }],
      noride: waitFor('tonia', 'noride_go', 'noride'),
      noride_go: [
        lock('tonia'),
        { m: "We're at the information desk. Like you said.", th: 'tonia', from: 'tonia' },
        { m: "Ajax, there's no car.", th: 'tonia', from: 'tonia' },
        { m: "There's a man here with a sign from Mr. Pulcinella. He says his name is Mr. Ivanov. He says he'll take us.", th: 'tonia', from: 'tonia' },
        { m: 'Teucer already gave him his backpack.', th: 'tonia', from: 'tonia' },
        { go: 'rescue' },
      ],
      nobody: waitFor('tonia', 'nobody_go', 'nobody'),
      nobody_go: [
        lock('tonia'),
        { m: "We're at arrivals.", th: 'tonia', from: 'tonia' },
        { m: 'Where are you?', th: 'tonia', from: 'tonia' },
        { m: 'BROTHER WHERE R U' },
        { if: (s) => F(s).promised_grin || F(s).pickup_myself, go: 'nobody_grin' },
        { go: 'nobody2' },
      ],
      nobody_grin: [{ m: 'u said u would be HERE' }, { m: 'i have the biggest grin. where is urs' }, { go: 'nobody2' }],
      nobody2: [
        { m: "There's a man with a sign from Mr. Pulcinella. He says Mama cancelled him, but he came anyway, “just in case”.", th: 'tonia', from: 'tonia' },
        { go: 'rescue' },
      ],
      rescue: [
        { choice: [
          { t: "Don't go with him. Stay at the information desk. I'm sending someone right now.", fx: { set: { tonia_desk: true } }, go: 'sos' },
          { t: "It's okay. Go with Mr. Ivanov. I'll see you at the hotel.", fx: { set: { fatui_pickup: true } }, go: 'driver_t' },
          { t: '[Leave on read]', silent: true, go: 'take_driver' },
        ], th: 'tonia', timeout: 90, onTimeout: 'take_driver' },
      ],
      sos: [
        { m: "Okay. We're staying. I'm getting Teucer's bag back.", th: 'tonia', from: 'tonia' },
        { m: 'Who is coming?', th: 'tonia', from: 'tonia' },
        { choice: pickOpts({ zl: 'My friend Zhongli. Tall, gold eyes, very polite. Go with him.', lumine: 'My friend Lumine. Blonde, a sword, and a small loud friend. Go with her.', ekat: "Ekaterina from my office. She'll have a sign. Go with her.", ride: "A Harbor Ride. I'm booking it now. Wait at the desk." }), th: 'tonia', timeout: 90, onTimeout: 'take_driver' },
      ],
      p_zl: [free('tonia'), { start: 'fam_sos_zl' }, { wait: 30 }, { go: 'zl' }],
      p_lumine: [free('tonia'), { start: 'fam_sos_lumine' }, { wait: 30 }, { go: 'lumine' }],
      p_ekat: [free('tonia'), { start: 'fam_sos_ekat' }, { wait: 30 }, { go: 'ekat' }],
      p_ride: [
        { m: "Okay. We're at the desk. Hurry.", th: 'tonia', from: 'tonia' },
        free('tonia'),
        { fx: { set: { ride_wait: 0 } } },
        { go: 'p_ride_wait' },
      ],
      p_ride_wait: [
        { if: (s) => F(s).ride_kids, go: 'ride' },
        { if: (s) => (F(s).ride_wait || 0) >= 18, go: 'ride_late' },
        { wait: 5 },
        { fx: { inc: { ride_wait: 1 } } },
        { go: 'p_ride_wait' },
      ],
      ride_late: [
        { m: "Ajax, there's still no car. Mr. Ivanov is being very nice and very patient, and he won't go away.", th: 'tonia', from: 'tonia' },
        { go: 'take_driver' },
      ],
      take_driver: [
        { m: "Ajax? … He's carrying Teucer's bag to the car. I'm going with them. I'm not letting Teucer go anywhere alone.", th: 'tonia', from: 'tonia' },
        { fx: { set: { fatui_pickup: true } } },
        { go: 'driver_t' },
      ],
      driver_t: [free('tonia'), { go: 'driver' }],
      driver: [
        { m: 'WE LANDED!!!!! 🐟✈️', d: 0.6 },
        { m: 'a MAN with a SIGN and a BIG COAT' },
        { m: 'he says we r going to a HOTEL with a POOL ON THE ROOF' },
        { m: 'his car has very dark windows. like a SPY car' },
        { m: 'Mr. Ivanov took our passports “to help with check-in”. He hasn\'t given them back.', th: 'tonia', from: 'tonia' },
        { m: 'He called you “the Eleventh” on the telephone in the car. He thought I wasn\'t listening.', th: 'tonia', from: 'tonia' },
        ...landDone,
        { choice: welcome({ t: 'A pool on the roof!! save me a cannonball, Teucer 😁', fx: { aff: { teucer: 1 } }, go: 'pool' }) },
      ],
      pool: [{ m: 'I WILL DO 100 CANNONBALLS' }, { m: 'tonia says “we\'ll see”' }, { go: 'end' }],
      welcome: [
        { m: 'THE SEA IS SO BLUE HERE' },
        { m: 'at home the sea is GREY' },
        { m: 'i like both' },
        { go: 'end' },
      ],
      flat: [{ m: 'ok', d: 1.2 }, { m: 'brother ur being SHORT today' }, { go: 'end' }],
      end: [{ fx: { set: { kids_landed: true } } }],
      exp: [free('tonia'), { fx: { set: { kids_landed: true } } }],
    },
  });

  scene({
    id: 'fam_landed_group', thread: 'fam', ch: 'sat_dawn', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'did they land?? is teucer alive?? did he cry', from: 'anthon' },
        { m: 'They landed! Tonia says Teucer cried a little when the wheels touched. Happy crying.', from: 'mama' },
        { m: 'I DID NOT', from: 'teucer' },
        { m: 'Good. — Papa', from: 'papa' },
      ],
    },
  });

  // ── Teucer's FaceTime (~08:10) ───────────────────────────────────
  scene({
    id: 'fam_ft_ring', thread: 'teucer', ch: 'sat_dawn',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'brother' },
        { m: 'can i FACETIME u' },
        { m: 'i want to show u the SEA' },
        { m: 'calling u NOW 📞' },
        { call: 'call_teucer_ft', delay: 2 },
      ],
    },
  });

  S.call({
    id: 'call_teucer_ft', from: 'teucer', video: true, ring: 25,
    onHangup: [{ start: 'fam_ft_hung' }],
    missed: [{ start: 'fam_ft_missed' }],
    nodes: {
      start: [
        { say: '(FaceTime. A blur of ginger hair, then a nostril, then all of Teucer, much too close to the camera.)', from: 'sys' },
        { say: 'BROTHER! BROTHER, HI! …Brother, your screen is BLACK.' },
        { choice: [
          { t: '(Keep the camera off)', go: 'off' },
          { t: '(Cover the camera with your thumb)', go: 'thumb' },
          { t: '(Turn the camera on)', go: 'cam' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      off: [
        { say: 'Is your camera BROKEN? …Is it because you\'re at WORK? Is it SECRET at the factory?' },
        { say: "Okay! I'll show you MY camera then!" },
        { fx: { set: { ft_answered: true } } },
        { go: 'show' },
      ],
      thumb: [
        { say: 'Is that your THUMB? Brother, I can see your THUMB! Hahahaha! It\'s so BIG!' },
        { say: 'Hello, thumb. Tell brother I landed.' },
        { fx: { set: { ft_answered: true, ft_thumb: true }, aff: { teucer: 1 } } },
        { go: 'show' },
      ],
      show: [
        { say: 'LOOK! That\'s the SEA!' },
        { say: '(The phone swings wildly: a window, a slice of blue water, Tonia\'s elbow, one of Sir Fang\'s ears.)', from: 'sys' },
        { if: (s) => F(s).zl_pickup, go: 'show_zl' },
        { if: (s) => F(s).lumine_pickup, go: 'show_lumine' },
        { if: (s) => F(s).ekat_pickup, go: 'show_ekat' },
        { if: (s) => F(s).fatui_pickup, go: 'show_drv' },
        { go: 'say' },
      ],
      show_zl: [
        { say: "And that's MR. ZHONGLI! Say hi, Mr. Zhongli!" },
        { say: '(A calm voice, just out of frame:) “Good morning, Childe. Your brother has asked me eleven questions about rocks. I have answered nine. The other two do not have answers yet.”', from: 'sys' },
        { go: 'say' },
      ],
      show_lumine: [
        { say: "And that's PAIMON! She's eating my SANDWICH now!" },
        { say: '(A shrill voice:) “Paimon is TASTING it! For SAFETY!” (Lumine, dry:) “hi childe.”', from: 'sys' },
        { go: 'say' },
      ],
      show_ekat: [
        { say: "And that's Ekaterina! She's driving! She drives like a ROCKET!" },
        { say: '(Ekaterina, tight:) “Good morning, Sir. Everything is under control, Sir.”', from: 'sys' },
        { go: 'say' },
      ],
      show_drv: [
        { say: "And that's Mr. Ivanov! He doesn't like the camera. He put his hand on it. Mr. Ivanov, that's RUDE!" },
        { say: '(A big gloved hand covers the lens. Somewhere, Tonia says: “Teucer. Give me the phone.”)', from: 'sys' },
        { go: 'say' },
      ],
      say: [
        { say: 'Brother, say something! Say “Teucer!!” like you do!' },
        { choice: [
          { t: "(Stay silent and wave, even though he can't see you)", go: 'wave' },
          { t: '"Teucer!!"', go: 'voice' },
          { t: '(Turn the camera on)', go: 'cam' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      wave: [
        { say: "…Brother? You're so QUIET." },
        { say: "Is it because you're on a secret mission at the factory?" },
        { say: "(whispering) Okay. I'll be quiet too." },
        { say: '(whispering) Bye, brother. I love you. Sir Fang loves you too.' },
        { fx: { aff: { teucer: 1 } } },
        { start: 'fam_ft_after' },
        { hangup: true },
      ],
      voice: [
        { say: '…' },
        { say: 'Brother, you sound like a DIFFERENT person. Did you catch a cold?' },
        { say: '(Tonia, closer:) “Let me hear.”', from: 'sys' },
        { fx: { sus: { teucer: 2, tonia: 1 } } },
        { choice: [
          { t: '"Bad connection!" (lower, rougher)', go: 'badline' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      badline: [
        { say: 'Tonia says you don\'t sound like a bad connection, you sound like a STRANGER. Hahaha!' },
        { say: '(Tonia isn\'t laughing.)', from: 'sys' },
        { say: 'Bye, brother!' },
        { start: 'fam_ft_after' },
        { hangup: true },
      ],
      cam: [
        { fx: { set: { facetime_cam: true } } },
        { say: '(The camera turns on. Your face fills the little window in the corner. You look tired.)', from: 'sys' },
        { say: 'Brother! FINA—' },
        { say: '…' },
        { say: 'Who are you?' },
        { say: "TONIA. TONIA, THERE'S A MAN IN BROTHER'S PHONE." },
        { say: '(Tonia\'s face crowds into the frame. She looks at you for one long second. She doesn\'t scream. She takes a screenshot.)', from: 'sys' },
        { say: "(Tonia:) “Don't hang up. I'm calling the police.”", from: 'sys' },
        { start: 'fam_ft_caught' },
        { hangup: true },
      ],
      hang: [{ start: 'fam_ft_hung' }, { hangup: 'me' }],
    },
  });

  scene({
    id: 'fam_ft_caught', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { facetime_cam: true } } },
        { wait: 3 },
        { m: 'I have a screenshot of your face.' },
        { m: "I've sent it to the Millelith and to my mother." },
        { m: 'Where is my brother?' },
        { start: 'fam_ft_police', delay: 150 },
        { choice: [
          { t: "He's safe. I'm going to give his phone back.", go: 'safe' },
          { t: "I found it on a pier. I'm sorry.", go: 'pier' },
          { t: '[Say nothing]', silent: true, go: 'none' },
        ] },
      ],
      safe: [{ m: 'Then give it back. To the police. They\'re very interested in you.' }, { go: 'end' }],
      pier: [{ m: 'A pier.' }, { m: "He loves piers. He'd leave his own head on a pier if it wasn't attached." }, { m: 'The police are coming. Stay where you are.' }, { go: 'end' }],
      none: [{ wait: 4 }, { m: "Teucer is crying. He thinks you're a ghost who ate his brother." }, { m: "I'm not crying. I'm calling the police." }, { go: 'end' }],
      end: [{ wait: 4 }, { ending: 'facetime' }],
    },
  });

  // nobody answers Tonia: the Millelith come anyway
  scene({
    id: 'fam_ft_police', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'Fine. Say nothing.' },
        { m: 'The Millelith traced the phone. They say two minutes. Stay where you are.' },
        { wait: 6 },
        { ending: 'facetime' },
      ],
    },
  });
  scene({
    id: 'fam_ft_after', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 4 },
        { if: (s) => (s.sus.teucer || 0) >= 2, go: 'odd' },
        { m: 'u were SO quiet' },
        { m: 'was it a SECRET MISSION 🤫' },
        { m: 'i wont tell anyone. only Sir Fang. he is a vault' },
        { start: 'fam_factory_ask', delay: 30 },
      ],
      odd: [
        { m: 'ur voice was WEIRD' },
        { m: 'tonia made her notebook face' },
        { start: 'fam_factory_ask', delay: 30 },
      ],
    },
  });
  scene({
    id: 'fam_ft_hung', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      caught: [{ start: 'fam_ft_caught' }],
      start: [
        { if: (s) => F(s).facetime_cam, go: 'caught' },
        { wait: 3 },
        { m: 'u hung up on me 😢' },
        { m: 'was it a BAD time' },
        { m: 'tonia says u r “busy”. she said it with her EYEBROWS' },
        { fx: { sus: { teucer: 1 } } },
        { start: 'fam_factory_ask', delay: 30 },
      ],
    },
  });
  scene({
    id: 'fam_ft_missed', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { wait: 4 },
        { m: 'brother didnt answer 😢' },
        { m: 'he is SLEEPING. tonia says he is “avoiding”' },
        { m: 'i will call u later. ok?' },
        { choice: [
          { t: "sorry Teucer!! I'm in a meeting with the elves. tonight, I promise 😁", fx: { aff: { teucer: 1 } }, go: 'ok' },
          { t: "Can't talk now.", go: 'short' },
          { t: '[Leave on read]', silent: true, fx: { sus: { teucer: 1 } }, go: 'read' },
        ] },
      ],
      ok: [{ m: 'A MEETING WITH THE ELVES' }, { m: 'tell them i said HI' }, { go: 'end' }],
      short: [{ m: 'ok', d: 1 }, { go: 'end' }],
      read: [{ wait: 6 }, { m: 'ok' }, { go: 'end' }],
      end: [free('teucer'), { start: 'fam_factory_ask', delay: 30 }],
    },
  });

  // ── "Can we see the toy factory?" (after the FaceTime) ───────────
  scene({
    id: 'fam_factory_ask', thread: 'teucer', ch: 'sat_dawn', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { m: 'brother' },
        { m: 'can we see the TOY FACTORY today' },
        { m: 'pleeeeeease' },
        { m: 'i want to meet grigory and little masha and OLD PYOTR' },
        { m: 'i will not ask him for a doll. ONLY trains' },
        { m: 'tonia says u r “too busy”. r u too busy?' },
        { choice: [
          { t: 'Never too busy for you!! this afternoon. the elves are already getting ready 😁', fx: { set: { factory_promised: true }, aff: { teucer: 1 } }, go: 'yes' },
          { t: "We'll see 😁", fx: { set: { factory_promised: true } }, go: 'see' },
          { t: "The factory's closed on weekends, Teucer. The elves need their rest.", fx: { set: { factory_closed_said: true }, aff: { teucer: -1 } }, go: 'closed' },
          { t: 'Teucer, there is no toy factory.', fx: { sus: { teucer: 3, tonia: 1 } }, go: 'none' },
        ] },
      ],
      yes: [{ m: 'YESSSSSSSSSS' }, { m: 'i am wearing my GLACIER GUARDIANS SHIRT' }, { go: 'fortress' }],
      see: [{ m: 'WE\'LL SEE MEANS YES!!!!!!' }, { m: 'Tonia says “we\'ll see” means no. I\'ve told him it means no. He won\'t listen.', th: 'tonia', from: 'tonia' }, { go: 'fortress' }],
      closed: [{ m: 'oh', d: 1.4 }, { m: 'ok' }, { m: 'the elves need rest. that is fair' }, { m: '😢' }, { go: 'fortress' }],
      none: [
        { m: '…what', d: 2 },
        { m: 'yes there is' },
        { m: 'grigory painted my owl' },
        { m: 'TONIA' },
        { m: 'What did you say to him? He\'s crying into Sir Fang.', th: 'tonia', from: 'tonia', d: 2 },
        { m: 'Whatever it was, I hope it was worth it.', th: 'tonia', from: 'tonia' },
        { go: 'end' },
      ],
      fortress: [
        { m: 'also' },
        { m: 'if there is a TOY SHOP in liyue' },
        { m: 'and if it has a FROST FORTRESS' },
        { m: 'i am just saying' },
        { go: 'end' },
      ],
      end: [free('teucer')],
      exp: [free('teucer')],
    },
  });

  // ── Tonia after the landing: questions, or the trap, or the watchers ──
  scene({
    id: 'fam_tonia_morning', thread: 'tonia', ch: 'sat_dawn', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 560 },
    when: (s) => !!F(s).kids_landed,
    retry: true,
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { if: (s) => held(s), go: 'trap' },
        { if: (s) => F(s).kids_apartment, go: 'apt' },
        { if: (s) => F(s).kids_grand, go: 'grand' },
        { if: (s) => F(s).zl_pickup, go: 'q_zl' },
        { if: (s) => F(s).lumine_pickup, go: 'q_lumine' },
        { if: (s) => F(s).ekat_pickup, go: 'q_ekat' },
        { if: (s) => F(s).ride_kids, go: 'q_ride' },
        { go: 'end' },
      ],

      // the Fatui driver: the Grand is a cage with a pool
      trap: [
        { m: 'We\'re in the room. It\'s beautiful. It has a pool on the roof and a man in a grey coat on a sun lounger who doesn\'t swim.' },
        { m: 'Mr. Ivanov took Teucer\'s watch “to charge it”. He says Mr. Pulcinella wants us to “rest” in the room today.' },
        { m: 'I don\'t want to rest, Ajax.' },
        { choice: [
          { t: 'Pack your bag. My friend Lumine is coming. Go with her, and nobody else.', fx: { set: Object.assign({ kids_rescued: true, rescue_by: 'lumine' }, stay('kids_wangshu')) }, go: 'r_lumine' },
          { t: "Captain Beidou's coming for you. Eyepatch, very loud. Go with her.", if: (s) => F(s).beidou_accepted && !F(s).beidou_snubbed, fx: { set: Object.assign({ kids_rescued: true, rescue_by: 'beidou' }, stay('kids_alcor')) }, go: 'r_beidou' },
          { t: "Stay in the room. Do what he says. I'll sort it out.", go: 'r_stay' },
          { t: 'Call Mama.', go: 'r_mama' },
        ] },
      ],
      r_lumine: [
        { start: 'fam_rescue_lumine', delay: 1 },
        { m: 'Okay. I\'m packing. I\'m telling Teucer it\'s a game. He\'s very good at games.' },
        { wait: 25 },
        { m: 'She came. She walked past the man on the sun lounger and he got up and then he sat down again very fast.' },
        { m: "Paimon told the man at the front desk that she was “a VIP”. We walked out of the side door. Nobody stopped us." },
        { m: 'We\'re in a car going up into the hills. To an inn. Teucer is asleep. Thank you, Ajax.' },
        { go: 'end' },
      ],
      r_beidou: [
        { start: 'fam_rescue_beidou', delay: 1 },
        { m: 'Okay. I\'m packing.' },
        { wait: 25 },
        { m: 'She came through the lobby like a storm. She called Mr. Ivanov “sweetheart” and he gave her our passports.' },
        { m: 'We\'re on a ship. A real ship. Teucer is steering. He\'s not really steering. He thinks he is.' },
        { go: 'end' },
      ],
      r_stay: [{ m: 'Okay.', d: 2 }, { m: 'I\'ll do what he says. I\'ll do it very slowly.' }, { go: 'end' }],
      r_mama: [
        { m: 'And tell her what?' },
        { m: 'That her son\'s employer has locked her children in a hotel with a swimming pool?' },
        { m: 'She\'d say “how kind”.' },
        { go: 'end' },
      ],

      // the apartment is watched
      apt: [
        { m: "We're at your flat. It's very clean. Suspiciously clean." },
        { m: "There are two men in grey coats across the street. They've been there since we arrived. One of them waved at Teucer." },
        { m: 'Teucer waved back. Ajax, who are they?' },
        { go: 'move' },
      ],
      grand: [
        { m: 'The Grand is beautiful. Teucer has already been in the pool, the bath and a potted palm.' },
        { m: 'The concierge asked me which room “the Eleventh” will be staying in. I said “who?”. He smiled like he knew I was lying.' },
        { m: 'There\'s a man in the lobby who doesn\'t read his newspaper.' },
        { go: 'move' },
      ],
      move: [
        { choice: [
          { t: "Pack a bag. You're moving to Wangshu Inn, up in the hills. Quieter.", fx: { set: Object.assign({ kids_moved: true }, stay('kids_wangshu')) }, go: 'mv_wangshu' },
          { t: "Beidou's ship. The Alcor. Nobody touches the Alcor.", if: (s) => !F(s).beidou_snubbed, fx: { set: Object.assign({ kids_moved: true }, stay('kids_alcor')) }, go: 'mv_alcor' },
          { t: "Xiansheng's house. He's expecting you.", if: (s) => F(s).zl_pickup, fx: { set: Object.assign({ kids_moved: true }, stay('kids_zl')) }, go: 'mv_zl' },
          { t: 'Security from my work. They\'re there to keep you safe 😁', go: 'mv_stay' },
        ] },
      ],
      mv_wangshu: [{ m: 'Wangshu Inn. Okay.' }, { m: "I'll tell Teucer we're going to look for dragons." }, { go: 'end' }],
      mv_alcor: [{ start: 'fam_ask_beidou', delay: 1 }, { m: 'A SHIP?' }, { m: "Don't tell Teucer yet. I want to see his face." }, { go: 'end' }],
      mv_zl: [{ start: 'fam_ask_zl_home', delay: 1 }, { m: 'Mr. Zhongli\'s house. Teucer will ask him nine hundred questions.' }, { m: 'I\'ll ask him one.' }, { go: 'end' }],
      mv_stay: [{ m: 'Security.' }, { m: "Okay. Then I'll stop looking at them." }, { m: "I won't stop looking at them." }, { go: 'end' }],

      // safe pickups: Tonia's questions
      q_zl: [
        { m: "Your friend talked to me for twenty minutes about the history of Liyue's school examinations. Then he asked what I want to be. Nobody asks me that." },
        { m: 'He said you talk about us “with great frequency and at considerable volume”.' },
        { m: 'When you texted, he looked at your name on my screen and he smiled like… I don\'t know. Like Mama looks at the sea.' },
        { m: 'Who are you to him, Ajax?' },
        { choice: [
          { t: "His best customer 😁 I pay for everything. he's a terrible influence", go: 'zl_joke' },
          { t: "…I don't know yet.", fx: { aff: { tonia: 1 } }, go: 'zl_honest' },
          { t: "Just a client. It's professional.", fx: { sus: { tonia: 1 } }, go: 'zl_cold' },
        ] },
      ],
      zl_joke: [{ m: 'He said that too. Almost word for word.' }, { m: 'You\'ve rehearsed this.' }, { go: 'end' }],
      zl_honest: [{ m: '…Oh.' }, { m: "That's the most honest thing you've ever said to me." }, { m: 'I like him. For the record.' }, { go: 'end' }],
      zl_cold: [{ m: 'A client.' }, { m: "You said his name four times in one voice message to Mama, Ajax." }, { m: "Fine. A client." }, { go: 'end' }],
      q_lumine: [
        { m: "Your friend Lumine has a sword under her coat. Teucer asked if it's a toy. She said “no”. Then she said “yes”. Then she looked at me." },
        { m: 'Where does a toy salesman meet an adventurer who carries a real sword?' },
        { choice: [
          { t: "Sparring club 😁 she's the only one who can keep up with me", go: 'lu_spar' },
          { t: "Work. She helps us with… difficult deliveries.", fx: { set: { half_truth: true } }, go: 'lu_half' },
        ] },
      ],
      lu_spar: [{ m: 'A sparring club.' }, { m: 'Okay. That I believe. You\'ve always needed someone to hit.' }, { go: 'end' }],
      lu_half: [{ m: 'Difficult deliveries.' }, { m: 'Of toys.' }, { m: "I'm adding it to the notebook, Ajax." }, { go: 'end' }],
      q_ekat: [
        { m: 'Ekaterina is lovely. She is also terrified. She keeps checking her phone and then looking at me and smiling too much.' },
        { m: 'Is something happening at your work?' },
        { choice: [
          { t: 'Quarterly reviews 😁 everyone is terrified of quarterly reviews', go: 'ek_lie' },
          { t: "Something's happening. Nothing that touches you. Stay close to her.", fx: { set: { half_truth: true }, aff: { tonia: 1 } }, go: 'ek_half' },
        ] },
      ],
      ek_lie: [{ m: 'Quarterly reviews. Like the letter.' }, { m: 'Okay.' }, { go: 'end' }],
      ek_half: [{ m: 'Okay. Thank you for not saying “quarterly reviews”.' }, { go: 'end' }],
      q_ride: [
        { m: 'Mr. Fang told us he drove you last night. You and “a tall gentleman in a very nice coat”. From a restaurant to the pier. At eleven at night.' },
        { m: 'Who was the tall gentleman, Ajax?' },
        { choice: [
          { t: 'Xiansheng! dinner ran late. it always runs late 😁', if: (s) => F(s).clue_shared_ride, go: 'rd_zl' },
          { t: 'A colleague.', go: 'rd_coll' },
          { t: 'Mr. Fang must be thinking of someone else.', fx: { sus: { tonia: 1 } }, go: 'rd_else' },
        ] },
      ],
      rd_zl: [{ m: 'Your consultant. At the pier. At eleven at night.' }, { m: 'Mr. Fang said you were both very quiet in the car. He said it was “a nice quiet”.' }, { go: 'end' }],
      rd_coll: [{ m: 'A colleague in a very nice coat.' }, { m: "Mr. Fang said you were both very quiet. He said it was “a nice quiet”." }, { go: 'end' }],
      rd_else: [{ m: 'He described your scarf, Ajax.' }, { go: 'end' }],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });

  scene({
    id: 'fam_rescue_lumine', thread: 'lumine', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'comrade. I need you. my brother and sister are at the Liyue Harbor Grand and Pulcinella\'s people won\'t let them leave the room. get them out. take them somewhere quiet' },
        { wait: 5 },
        { m: 'which floor.' },
        { m: 'never mind. paimon found it' },
        { m: 'paimon is the distraction. i am the door' },
      ],
    },
  });
  scene({
    id: 'fam_rescue_beidou', thread: 'beidou', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Captain. Pulcinella\'s men are sitting on my brother and sister at the Grand. I need them on the Alcor' },
        { wait: 5 },
        { m: "say no more kid" },
        { m: "nobody keeps kids in a cage in MY harbor. be there in twenty ⚓" },
      ],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 3 — Saturday afternoon: the toy factory and the rematch
  // ════════════════════════════════════════════════════════════════

  scene({
    id: 'fam_factory', thread: 'teucer', ch: 'sat_noon', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 60 },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { if: (s) => held(s), go: 'caged' },
        { if: (s) => F(s).factory_promised, go: 'promised' },
        { if: (s) => F(s).factory_closed_said, go: 'closed' },
        { m: 'brother can we go to the TOY FACTORY today. pleeeease' },
        { go: 'ask' },
      ],
      caged: [
        { m: 'brother' },
        { m: 'we r still in the hotel. the man says we have to REST' },
        { m: 'i am not tired. i am the LEAST tired' },
        { m: 'can the toy factory come HERE' },
        { choice: [
          { t: "Soon, Teucer. I promise. Build me a fortress out of pillows till then 😁", fx: { aff: { teucer: 1 } }, go: 'pillows' },
          { t: 'Do what the man says.', fx: { sus: { teucer: 1 } }, go: 'pillows' },
        ] },
      ],
      pillows: [{ m: 'ok' }, { m: 'Sir Fang is the guard' }, free('teucer')],
      promised: [
        { m: 'BROTHER is it TOY FACTORY TIME' },
        { m: 'i am wearing my glacier guardians shirt' },
        { m: 'and Sir Fang is wearing a TIE (tonia made it out of a sock)' },
        { go: 'ask' },
      ],
      closed: [
        { m: 'brother' },
        { m: 'is the factory still closed' },
        { m: 'maybe the elves could come in for ONE hour' },
        { m: 'i could help them. i am good at glitter' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'Factory tour!! the Liyue branch, Harbor Road 1. Ekaterina will show you the factory floor 😁', go: 'bank_try' },
          { t: 'Mingyun Toys & Games, on the main street. Ask for the manager. he\'s… very knowledgeable 😁', go: 'zl_try' },
          { t: "Sorry, Teucer. The factory's closed for inspections this weekend.", fx: { set: { factory_cancelled: true }, aff: { teucer: -1 } }, go: 'cancel' },
        ] },
      ],
      bank_try: [{ if: (s) => (F(s).ops_morale || 0) >= 1, go: 'bank', else: 'bank_no' }],
      bank: [
        { fx: { set: { factory_bank: true, factory_cancelled: false } } },
        { start: 'fam_factory_ekat' },
        { m: 'THE REAL FACTORY????????' },
        { m: 'TONIA. TONIA WE ARE GOING TO THE REAL FACTORY' },
        { m: 'He just put his shoes on the wrong feet. On purpose. “For speed.”', th: 'tonia', from: 'tonia' },
        free('teucer'),
        { start: 'fam_tour_bank', delay: 150 },
      ],
      bank_no: [
        { start: 'fam_factory_ekat_no' },
        { wait: 14 },
        { m: 'brother?? is the factory open??' },
        { choice: [
          { t: 'Change of plan!! Mingyun Toys. Ask for the manager 😁', go: 'zl_try' },
          { t: "Sorry, Teucer. The factory's closed for inspections this weekend.", fx: { set: { factory_cancelled: true }, aff: { teucer: -1 } }, go: 'cancel' },
        ] },
      ],
      zl_try: [
        { fx: { set: { factory_zl: true, factory_cancelled: false } } },
        { start: 'fam_factory_zl_ask' },
        { m: 'MINGYUN TOYS!!!!!!!!!!' },
        { m: 'is that where the elves SELL the toys' },
        { m: 'i am going to ask for the MANAGER' },
        free('teucer'),
        { start: 'fam_tour_zl', delay: 130 },
      ],
      cancel: [
        { m: 'oh', d: 1.5 },
        { m: 'ok' },
        { m: 'can the elves send me a picture at least' },
        { m: "He's fine. He's pretending to be fine. It's the same thing you do.", th: 'tonia', from: 'tonia' },
        { m: 'can we go to a toy SHOP then. a normal one' },
        { m: 'Mingyun Toys & Games has a FROST FORTRESS in the window', img: 'mk_frost_fortress' },
        { m: 'ℳ2,400. the drawbridge WORKS' },
        { m: 'i am just saying' },
        { go: 'toy_q' },
      ],
      toy_q: [
        { choice: [
          { t: 'Consider it done 😁⚔️', fx: { set: { toy_promised: true }, aff: { teucer: 1 } }, go: 'toy_yes' },
          { t: 'Christmas, Teucer 😁', go: 'toy_xmas' },
          { t: 'Ask Mama.', go: 'toy_mama' },
        ] },
      ],
      toy_yes: [{ m: 'REALLY????' }, { m: 'u can get it on FEIYUN MARKET. tonia looked. they deliver to where we r staying' }, { m: 'i am not saying hurry. i am just SAYING' }, free('teucer')],
      toy_xmas: [{ m: 'christmas is in TWO MONTHS' }, { m: 'that is SIXTY DAYS' }, { m: 'ok' }, free('teucer')],
      toy_mama: [{ m: 'mama says ask u' }, { m: 'this is a LOOP' }, free('teucer')],
      exp: [free('teucer')],
    },
  });

  scene({
    id: 'fam_factory_ekat', thread: 'ekat', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Ekaterina. code Teucer. the factory tour. today. the elves need to be ready 😁' },
        { wait: 6 },
        { m: 'Sir. The… factory. Yes. Leave it to me.' },
        { m: 'Pyotr is wearing the elf hat. Lyuba has made snow in the lobby. Big Boris has volunteered to be a “toy bear”. He is very moved.' },
        { m: 'Anya refuses to wear the antlers. She has agreed to hold them.' },
        { m: 'Kolya is lost. He will not be part of the tour.' },
      ],
    },
  });
  scene({
    id: 'fam_factory_ekat_no', thread: 'ekat', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'Ekaterina. code Teucer. the factory tour. today. can the night shift play elves?' },
        { wait: 6 },
        { m: 'Sir… I asked.' },
        { m: 'They said no. Anya said, and I quote, “He didn\'t even save the fish.”' },
        { m: 'I\'m so sorry, Sir. If it were up to me, I would wear the antlers myself.' },
      ],
    },
  });
  scene({
    id: 'fam_factory_zl_ask', thread: 'zl', trigger: { on: 'manual' },
    nodes: {
      start: [
        { me: 'xiansheng. emergency. could you be the manager of a toy shop for one hour this afternoon? Mingyun Toys. my brother thinks I make the toys. there are elves. it\'s complicated 😁' },
        { wait: 7 },
        { if: (s) => F(s).zl_guarded, go: 'cold' },
        { m: 'I have managed larger enterprises on shorter notice.' },
        { m: 'I will require an apron, a working knowledge of the stock, and, I suspect, a small sum for the till. I am on my way.' },
      ],
      cold: [
        { m: 'For the children. Not for you.' },
        { m: 'I am on my way.' },
      ],
    },
  });

  // The tour at the bank (ops in costume).
  scene({
    id: 'fam_tour_bank', thread: 'teucer', ch: 'sat_noon', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { m: 'BROTHER', img: 'p_northland_lobby' },
        { m: 'THE FACTORY HAS A SNOWFLAKE ON THE FLOOR' },
        { m: 'OLD PYOTR IS NOT OLD' },
        { m: 'he is YOUNG and he was SCARED of me' },
        { m: 'and his elf hat went on FIRE a little bit. he said it happens' },
        { m: 'a SNOW LADY made it SNOW. INSIDE' },
        { m: 'a VERY BIG man let me sit on his sholders and he said “for the young master” and then he CRIED' },
        { m: 'a lady with a hammer showed me sparks (only small ones)' },
        { m: 'the fish tank is FROZEN with FISH INSIDE. the snow lady says it is “a display”' },
        { m: 'ekaterina gave me a badge. it says VISITOR. i am a VISITOR' },
        { wait: 6 },
        { m: 'Ajax, your toy factory has a vault door.', th: 'tonia', from: 'tonia' },
        { m: 'And a portrait of a woman wearing a crown of ice in the lobby. Everybody walks faster past it.', th: 'tonia', from: 'tonia' },
        { m: 'And Ekaterina calls the elves “agents” when she thinks I\'m not listening.', th: 'tonia', from: 'tonia' },
        { m: 'the FIRE elf says the FROST FORTRESS is on FEIYUN MARKET' },
        { m: 'i am just saying' },
        { start: 'fam_tonia_tour', delay: 40 },
        { go: 'toy_q' },
      ],
      toy_q: [
        { choice: [
          { t: 'Consider it done 😁⚔️', fx: { set: { toy_promised: true }, aff: { teucer: 1 } }, go: 'yes' },
          { t: 'Tell Old Pyotr I said hi 😁 and to stay away from candles', fx: { aff: { teucer: 1 } }, go: 'pyotr' },
          { t: 'Christmas, Teucer 😁', go: 'xmas' },
        ] },
      ],
      yes: [{ m: 'REALLY????' }, { m: 'i am going to tell old pyotr' }, free('teucer')],
      pyotr: [{ m: 'HE SAYS HI BACK' }, { m: 'he says “please don\'t tell the boss about the hat”' }, { m: 'u r the boss right?? hahaha' }, free('teucer')],
      xmas: [{ m: 'christmas is SIXTY DAYS' }, { m: 'ok' }, free('teucer')],
      exp: [free('teucer')],
    },
  });

  // The tour at Mingyun Toys (Zhongli as manager).
  scene({
    id: 'fam_tour_zl', thread: 'teucer', ch: 'sat_noon', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { if: (s) => F(s).zl_pickup, go: 'known' },
        { m: 'BROTHER' },
        { m: 'THE MANAGER IS VERY TALL' },
        { m: 'his name is MR ZHONGLI' },
        { go: 'tour' },
      ],
      known: [
        { m: 'BROTHER' },
        { m: 'MR ZHONGLI IS THE MANAGER?!?!' },
        { m: 'HE NEVER SAID' },
        { m: 'he said “one does not boast of one\'s positions”' },
        { go: 'tour' },
      ],
      tour: [
        { m: 'he is wearing an APRON' },
        { m: 'he knows the NAME of every toy and how OLD the idea is' },
        { m: 'he says the first toy was a ROCK' },
        { m: 'i asked if the elves are in the back' },
        { m: 'he said the elves are ON STRIKE' },
        { m: 'because they want better TEA' },
        { m: 'he said “your brother is negotiating”' },
        { m: 'BROTHER PAY THE ELVES' },
        { wait: 5 },
        { m: 'Mr. Zhongli rang up a customer at the till. Then he tried to give her change out of his own pocket, found nothing, and gave her a button.', th: 'tonia', from: 'tonia' },
        { m: 'Ajax. This is a shop.', th: 'tonia', from: 'tonia' },
        { m: 'THE FROST FORTRESS IS HERE', img: 'mk_frost_fortress' },
        { m: 'ℳ2,400. the drawbridge WORKS' },
        { m: 'mr zhongli says he cannot buy it because his wallet is in his other coat' },
        { m: 'he says u can buy it on FEIYUN MARKET and they deliver' },
        { m: 'i am just saying' },
        { start: 'fam_tonia_tour', delay: 40 },
        { go: 'toy_q' },
      ],
      toy_q: [
        { choice: [
          { t: 'Consider it done 😁⚔️', fx: { set: { toy_promised: true }, aff: { teucer: 1 } }, go: 'yes' },
          { t: "I'll pay the elves. in tea. tell Mr. Zhongli he's a terrible manager 😁", fx: { aff: { teucer: 1, zl: 1 } }, go: 'tea' },
          { t: 'Christmas, Teucer 😁', go: 'xmas' },
        ] },
      ],
      yes: [{ m: 'REALLY????' }, { m: 'MR ZHONGLI. BROTHER SAYS CONSIDER IT DONE' }, { m: 'he says “then it is a contract”' }, free('teucer')],
      tea: [{ m: 'i told him' }, { m: 'he said “your brother is correct, as he occasionally is”' }, { m: 'then he smiled at his phone for a LONG time' }, free('teucer')],
      xmas: [{ m: 'christmas is SIXTY DAYS' }, { m: 'mr zhongli says sixty days is “an eyeblink”. he is WRONG' }, free('teucer')],
      exp: [free('teucer')],
    },
  });

  // Tonia after the tour.
  scene({
    id: 'fam_tonia_tour', thread: 'tonia', ch: 'sat_noon', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { if: (s) => F(s).factory_bank, go: 'bank' },
        { m: "Teucer thinks Mr. Zhongli is the head elf. I didn't correct him." },
        { m: 'Mr. Zhongli didn\'t correct him either. He said “I have been called worse, and by greater authorities.”' },
        { m: 'Ajax, is anything you\'ve ever told us about your work true? Even one thing?' },
        { go: 'ask' },
      ],
      bank: [
        { m: "Teucer had the best afternoon of his life. Your elves were very kind to him. The big one gave him his own scarf." },
        { m: 'They called you “Sir” and “the Director” and once, by accident, “the Harbinger”. Then everyone stopped talking.' },
        { m: 'Ajax, is anything you\'ve ever told us about your work true? Even one thing?' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'The fish. Every fish I ever told you about was true 😁', fx: { aff: { tonia: 1 } }, go: 'fish' },
          { t: 'Tonight. After Teucer\'s asleep. I\'ll tell you everything I can.', fx: { set: { tonia_talk_promised: true }, aff: { tonia: 1 } }, go: 'tonight' },
          { t: "It's all true! the elves are real, Tonia. ask them yourself 😁", fx: { sus: { tonia: 1 } }, go: 'lie' },
        ] },
      ],
      fish: [{ m: '…' , d: 2 }, { m: 'Yes. Okay. I believe the fish.' }, { m: "That's something." }, { go: 'end' }],
      tonight: [{ m: 'Tonight.' }, { m: "I'm holding you to it. I've written it down." }, { go: 'end' }],
      lie: [{ m: 'I did ask them. One of them saluted.' }, { go: 'end' }],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });

  // ── Reel Rush: Teucer's challenge (ch3 +500 s) ────────────────────
  scene({
    id: 'fam_reelrush', thread: 'teucer', ch: 'sat_noon', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 500 },
    when: (s) => !F(s).beat_teucer,
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { fx: { set: { rr_challenge: true } } },
        { m: 'BROTHER' },
        { if: (s) => F(s).kids_alcor, go: 'w_ship' },
        { m: 'there is WIFI here' },
        { go: 'w2' },
      ],
      w_ship: [{ m: 'the SHIP has wifi. kazuha says it is “mostly wind”' }, { go: 'w2' }],
      w2: [
        { m: 'i am PRACTISING reel rush' },
        { m: '2,047 is still the record. MY record' },
        { m: 'u said u would make me CRY' },
        { m: 'i am not crying. U r going to cry 😤🎣' },
        { choice: [
          { t: "Oh it's ON. I'm beating it before dinner. one-handed. while eating noodles 😁⚔️", fx: { aff: { teucer: 1 } }, go: 'on' },
          { t: "You're going down, fish boy 🎣", go: 'on' },
          { t: 'You keep the record, Teucer. You earned it ❤️', fx: { sus: { teucer: 1 } }, go: 'soft' },
          { t: "I'm not really in the mood for games.", fx: { sus: { teucer: 2, tonia: 0.5 } }, go: 'mood' },
        ] },
      ],
      on: [{ m: 'PROVE IT' }, { m: 'the leaderboard will TELL me' }, { m: 'i am watching 👀🐟' }, { go: 'end' }],
      soft: [
        { m: '…', d: 1.5 },
        { m: 'u NEVER say that' },
        { m: 'u always say “prepare to cry”' },
        { m: 'r u SICK' },
        { go: 'end' },
      ],
      mood: [
        { m: 'ur ALWAYS in the mood' },
        { m: 'TONIA. brother is NOT IN THE MOOD' },
        { m: 'Teucer says you\'re “not in the mood” for Reel Rush. Ajax. You once played Reel Rush under the table at Papa\'s birthday dinner.', th: 'tonia', from: 'tonia' },
        { go: 'end' },
      ],
      end: [free('teucer')],
      exp: [free('teucer')],
    },
  });

  JC.famKit = { F, waitFor, lock, free, scene, at, LODGING, stay, held, pickOpts };
})();
