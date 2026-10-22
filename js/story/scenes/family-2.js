/* Live scenes — Family, chapters 4–7: Teucer's bedtime and the lullaby, Tonia's midnight question, Anthon the leak,
   the funeral crowds and the man in the bird mask, Arlecchino, "will we see you?", Mama's Sunday call, the night the
   harbor goes dark, Monday's car for Teucer, the goodbye. Plus the onAct rules for family app acts (toys, the pen,
   Reel Rush, the lullaby, transfers at 3 AM, the airport ride, Dottore's calendar event, the FaceTime camera) and the
   suspicion hooks (Tonia phones Mama; "Tonia says you sound weird").
   Facts: docs/STORY.md. Format: docs/DEV.md. Owner: S1b. Chapters 1–3: family-1.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const S = JC.story;

  // ── helpers (shared with family-1.js) ────────────────────────────
  const F = (s) => s.flags || {};
  const waitFor = (k, next, self) => [{ if: (s) => !F(s)['busy_' + k], go: next }, { wait: 6 }, { go: self || 'start' }];
  const lock = (k) => ({ fx: { set: { ['busy_' + k]: true } } });
  const free = (k) => ({ fx: { set: { ['busy_' + k]: false } } });
  const scene = (def) => S.scene(Object.assign({ arc: 'fam' }, def));
  const rule = (def) => S.onAct(Object.assign({ arc: 'fam' }, def));
  const at = (t) => JC.time.parse(t);
  const held = (s) => !!(F(s).fatui_pickup && !F(s).kids_rescued);
  const idOf = (p) => String((p && (p.id || p.art)) || '');
  const mora = (n) => ((JC.world && JC.world.money && JC.world.money.fmt) ? JC.world.money.fmt(n) : 'ℳ' + Math.round(n));
  const toTeucer = (to) => { const t = String(to || ''); if (t === 'teucer' || t === 'fam') return true; try { return JC.story.members(t).includes('teucer'); } catch (e) { return false; } };
  /** a message whose text depends on the live state (amounts, hours) */
  const say = (tid, from, text) => ({ run: (api) => { try { api.story.incoming(tid, { from, text: text(api.story.api()) }); } catch (e) { /* ignore */ } } });
  const hourOf = (s) => new Date(s.now).getHours();
  const night = (s) => hourOf(s) < 6;

  const LULLABY = '(Quietly, a little off-key, waves somewhere behind him:) “Sleep, little fish, the sea’s gone to bed… the ice is a blanket, the moon is your sled… count all the fishes and count them again… your brother is coming, he can’t tell you when…” (A soft laugh.) “Goodnight, Teucer.”';
  /** Childe shares “lullaby for Teucer” into a thread (same act an app share emits) */
  const shareLullaby = (tid) => ({ run: (api) => {
    let mm = null;
    try { mm = api.store.hasSeed && api.store.hasSeed('memos') ? api.store.get('memos', 'memo_lullaby') : null; } catch (e) { mm = null; }
    api.story.incoming(tid, { from: 'me', memo: 'memo_lullaby', voice: { dur: mm && mm.dur ? mm.dur : 130, text: mm && mm.text ? mm.text : LULLABY }, status: 'delivered' });
    api.story.act('memo_share', { id: 'memo_lullaby', to: tid, via: 'story' });
  } });
  /** where the kids are sleeping, for Teucer's bedtime and his "a box came to the …" */
  const bedName = (s) => (F(s).kids_alcor ? 'SHIP' : F(s).kids_wangshu ? 'INN' : F(s).kids_zl ? 'MR ZHONGLIS HOUSE' : F(s).kids_apartment ? 'UR APARTMENT' : 'HOTEL');

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 4 — Saturday night
  // ════════════════════════════════════════════════════════════════

  // ── Anthon, studying (allegedly). Everything you tell him reaches Mama. ──
  scene({
    id: 'fam_anthon_night', thread: 'anthon', ch: 'sat_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 250 },
    nodes: {
      start: waitFor('anthon', 'go'),
      go: [
        lock('anthon'),
        { m: 'bro', d: 0.5 },
        { m: 'bro', d: 0.5 },
        { if: (s) => F(s).told_tonia || (s.sus.tonia || 0) >= 3, go: 'tonia' },
        { if: (s) => F(s).kids_alcor, go: 'ship' },
        { m: 'teucer sent me a video from liyue. bro is living my DREAM while i study for a geography exam' },
        { go: 'exam' },
      ],
      tonia: [
        { m: 'tonia called mama and said nothing for 4 minutes and then said “its fine”' },
        { m: 'nobody says its fine like that unless its NOT fine' },
        { m: 'what did u do' },
        { go: 'exam' },
      ],
      ship: [
        { m: 'teucer is sleeping on a SHIP' },
        { m: 'i stay home for EXAMS and he gets a SHIP' },
        { go: 'exam' },
      ],
      exam: [
        { m: 'anyway. name 3 rivers in fontaine. fast' },
        { choice: [
          { t: 'the wet one, the wetter one, and the one Pantalone owns. study, carp 😁', fx: { aff: { anthon: 1 } }, go: 'rivers' },
          { t: 'Anthon, can you keep a secret?', go: 'secret' },
          { t: 'Go to sleep, Anthon.', go: 'sleep' },
          { t: 'Look it up yourself.', fx: { sus: { anthon: 1 } }, go: 'rude' },
        ] },
      ],
      rivers: [{ m: 'LMAOOO' }, { m: 'im writing that on the exam' }, { m: 'if i fail its ur fault' }, { go: 'end' }],
      sleep: [{ m: 'ur not my mom' }, { m: 'ur not even HOME' }, { go: 'end' }],
      rude: [{ m: 'bro what 💀' }, { m: 'who hurt u' }, { go: 'end' }],
      secret: [
        { m: 'no lmao', d: 0.6 },
        { m: 'ok yes. what' },
        { choice: [
          { t: "I'm buying you the headset. The one that doesn't sound like a fridge. Don't tell Mama.", fx: { set: { headset_promised: true }, aff: { anthon: 2 } }, go: 's_headset' },
          { t: "The trip isn't what it looks like. Keep an eye on Mama for me. Don't tell her.", fx: { set: { anthon_told: true } }, go: 's_trip' },
          { t: 'Never mind 😁', go: 'end' },
        ] },
      ],
      s_headset: [
        { m: 'BRO', d: 0.4 },
        { m: 'BRO' },
        { m: 'my lips are SEALED' },
        { m: 'BRO IS BUYING ME THE HEADSET', th: 'fam', from: 'anthon' },
        { m: 'Ajax. You spoil them.', th: 'fam', from: 'mama' },
        { m: '…oops', d: 1 },
        { go: 'end' },
      ],
      s_trip: [
        { m: '…ok', d: 2 },
        { m: 'ok bro. i got u' },
        free('anthon'),
        { start: 'fam_anthon_leak', delay: 40 },
      ],
      end: [free('anthon')],
      exp: [free('anthon')],
    },
  });
  scene({
    id: 'fam_anthon_leak', thread: 'mama', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'My sun. Anthon came into the kitchen and hugged me and said nothing.' },
        { m: 'Anthon has not hugged me since he was nine.' },
        { m: 'Then he said, “the trip isn\'t what it looks like.” Then he went very red and went to his room.' },
        { m: 'What does that mean, Ajax?' },
        { fx: { sus: { mama: 2 } } },
      ],
    },
  });

  // ── Teucer's bedtime: the lullaby (ch4 +500 s) ───────────────────
  scene({
    id: 'fam_bedtime', thread: 'teucer', ch: 'sat_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 500 },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { m: 'brother' },
        { m: 'r u awake' },
        { if: (s) => F(s).kids_alcor, go: 'b_alcor' },
        { if: (s) => F(s).kids_wangshu, go: 'b_wangshu' },
        { if: (s) => F(s).kids_zl, go: 'b_zl' },
        { if: (s) => F(s).kids_apartment, go: 'b_apt' },
        { go: 'b_grand' },
      ],
      b_alcor: [
        { m: 'the SHIP is ROCKING' },
        { m: 'a man with white hair played a song on a LEAF' },
        { m: 'it was nice but it was not THE song' },
        { go: 'ask' },
      ],
      b_wangshu: [
        { m: 'there is a BOY on the ROOF of the inn' },
        { m: 'he looks GRUMPY' },
        { m: 'tonia says dont look at him. i looked at him. he looked BACK' },
        { m: 'then he was gone. like a NINJA' },
        { go: 'ask' },
      ],
      b_zl: [
        { m: 'mr zhongli has 400 teacups. i counted 41 then i stopped' },
        { if: (s) => F(s).bought_teaset, go: 'b_zl_tea' },
        { go: 'b_zl2' },
      ],
      b_zl_tea: [{ m: 'he has a NEW old teapot. he says a friend gave it to him. he smiled at it for a LONG time' }, { go: 'b_zl2' }],
      b_zl2: [
        { m: 'he told me a story about a DRAGON who built a city out of rocks and then got very tired' },
        { m: 'i asked what happened to the dragon. he said “he is thinking about it”' },
        { go: 'ask' },
      ],
      b_apt: [
        { m: 'ur bed is SO big' },
        { m: 'ur freezer has a fish in it with a NAME TAG' },
        { m: 'the men across the street are still there. they have a FLASK' },
        { go: 'ask' },
      ],
      b_grand: [
        { m: 'the hotel is very quiet' },
        { if: (s) => held(s), go: 'b_grand_held' },
        { m: 'too quiet. the pool is closed at night. i checked' },
        { go: 'ask' },
      ],
      b_grand_held: [{ m: 'there is a man in the hall who doesnt sleep' }, { m: 'Sir Fang is watching the door' }, { go: 'ask' }],
      ask: [
        { m: 'i cant sleep' },
        { m: 'the dark here is a DIFFERENT dark' },
        { m: 'brother can u sing the song. the fish song' },
        { m: 'like at christmas. mama says u RECORDED it once' },
        { if: (s) => F(s).lullaby_sent, go: 'again' },
        { choice: [
          { t: '🎵 Send him “lullaby for Teucer”', silent: true, go: 'send' },
          { t: 'Hang on, Teucer 🐟', go: 'wait' },
          { t: "Count fish, Teucer. One fish, two fish… I bet you don't make it to twenty 😁", fx: { aff: { teucer: 1 } }, go: 'count' },
          { t: 'Sing it yourself. You know the words.', go: 'self' },
          { t: '[Leave on read]', silent: true, fx: { aff: { teucer: -1 } }, go: 'unread' },
        ] },
      ],
      again: [
        { m: 'i played the one u sent already. 5 times' },
        { m: 'can u send it AGAIN. its better when its NEW' },
        { choice: [
          { t: '🎵 Send it again', silent: true, go: 'send' },
          { t: "Count fish, Teucer. One fish, two fish… I bet you don't make it to twenty 😁", fx: { aff: { teucer: 1 } }, go: 'count' },
        ] },
      ],
      send: [shareLullaby('teucer'), { go: 'song' }],
      wait: [{ fx: { set: { bedtime_waiting: true, bt_wait: 0 } } }, { go: 'wait_loop' }],
      wait_loop: [
        { if: (s) => F(s).lullaby_fresh, go: 'song' },
        { if: (s) => (F(s).bt_wait || 0) === 6, go: 'nudge' },
        { if: (s) => (F(s).bt_wait || 0) >= 20, go: 'gave_up' },
        { wait: 5 },
        { fx: { inc: { bt_wait: 1 } } },
        { go: 'wait_loop' },
      ],
      nudge: [{ m: 'brother?' }, { m: 'Sir Fang is waiting too' }, { fx: { inc: { bt_wait: 1 } } }, { go: 'wait_loop' }],
      gave_up: [
        { m: 'ok' },
        { m: 'Sir Fang will sing it' },
        { m: 'AWOOOO' },
        { m: 'goodnight brother 🐟' },
        { go: 'end' },
      ],
      song: [
        { if: (s) => !F(s).lullaby_app, go: 'song2' },
        { fx: { sus: { teucer: -1 }, set: { lullaby_app: false } } },
        { go: 'song2' },
      ],
      song2: [
        { fx: { set: { lullaby_sent: true, lullaby_fresh: false } } },
        { wait: 8 },
        { m: '', voice: { dur: 7, text: '(Whispering, very sleepy:) “…brother… it’s the real one… Sir Fang is asleep already… I’m not… I’m just… resting my eyes…”' } },
        { wait: 6 },
        { m: 'He\'s asleep. He made me hold the phone to his ear for the whole song. Twice.', th: 'tonia', from: 'tonia' },
        { m: "I haven't heard you sing since you left. I forgot you were bad at it. I forgot I liked it.", th: 'tonia', from: 'tonia' },
        { go: 'end' },
      ],
      count: [
        { m: '1 fish', d: 1 },
        { m: '2 fish', d: 1.4 },
        { m: '3 fish', d: 1.8 },
        { m: '4 fsh', d: 2.4 },
        { m: '5 fs', d: 3 },
        { m: '6 f', d: 3.5 },
        { wait: 6 },
        { m: 'He made it to six. A new record.', th: 'tonia', from: 'tonia' },
        { go: 'end' },
      ],
      self: [
        { m: 'but its not the SAME', d: 1.2 },
        { m: 'ok' },
        { m: '', voice: { dur: 9, text: '(Tiny, off-key:) “Sleep, little fish, the sea’s gone to bed…” (A yawn.) “…the ice is a… blanket…”' } },
        { wait: 6 },
        { m: 'He fell asleep singing it to himself. You owe him.', th: 'tonia', from: 'tonia' },
        { go: 'end' },
      ],
      unread: [
        { wait: 12 },
        { m: 'brother?' },
        { wait: 10 },
        { m: 'ok' },
        { m: 'goodnight brother 🐟' },
        { wait: 8 },
        { m: 'He waited for you for twenty minutes, Ajax. He fell asleep holding the watch.', th: 'tonia', from: 'tonia' },
        { fx: { sus: { tonia: 1 } } },
        { go: 'end' },
      ],
      end: [{ fx: { set: { bedtime_waiting: false } } }, free('teucer')],
      exp: [{ fx: { set: { bedtime_waiting: false } } }, free('teucer')],
    },
  });

  // ── Tonia's midnight question (ch4 +700 s) ───────────────────────
  scene({
    id: 'fam_tonia_night', thread: 'tonia', ch: 'sat_night', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 700 },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { m: "Teucer's asleep." },
        { if: (s) => F(s).told_tonia, go: 'again' },
        { if: (s) => F(s).tonia_talk_promised, go: 'promised' },
        { m: 'Can we talk now? Properly. Not over plane wifi. Not in between other things.' },
        { go: 'case' },
      ],
      promised: [{ m: 'You said tonight. It\'s tonight.' }, { go: 'case' }],
      case: [
        { typing: 6 },
        { m: "Here's what I know." },
        { m: 'A letter from the Palace to “Harbinger Tartaglia”. A woman called Signora telephoning our house to say our family is in her thoughts.' },
        { if: (s) => F(s).fatui_pickup, go: 'c_drv' },
        { if: (s) => F(s).ekat_pickup, go: 'c_ekat' },
        { if: (s) => F(s).lumine_pickup, go: 'c_lumine' },
        { go: 'c2' },
      ],
      c_drv: [{ m: 'A driver who took our passports and called you “the Eleventh” on the telephone.' }, { go: 'c2' }],
      c_ekat: [{ m: 'A receptionist who calls you “Sir” and checks the exits.' }, { go: 'c2' }],
      c_lumine: [{ m: 'A friend who carries a real sword and looks at every face in a room.' }, { go: 'c2' }],
      c2: [
        { if: (s) => F(s).factory_bank, go: 'c_bank' },
        { if: (s) => F(s).factory_zl, go: 'c_shop' },
        { go: 'c3' },
      ],
      c_bank: [{ m: 'A toy factory with a vault door and a portrait of the Tsaritsa in the lobby.' }, { go: 'c3' }],
      c_shop: [{ m: 'A toy factory that is a shop, with your friend at the till.' }, { go: 'c3' }],
      c3: [
        { m: 'Mr. Pulcinella paying for everything. Papa sitting in the boat in the dark.' },
        { m: 'And you, texting me at midnight like someone holding his breath.' },
        { typing: 5 },
        { m: "I'm not Teucer, Ajax. I don't need elves. I need the truth." },
        { m: "Whatever it is, I'd rather carry it with you than watch you carry it by yourself." },
        { choice: [
          { t: "Okay. The truth. I don't sell toys. I'm a Harbinger of the Fatui, the eleventh. I fight for them. I'm very, very good at it.", fx: { set: { told_tonia: true }, aff: { tonia: 2 } }, go: 'truth' },
          { t: "I work for the bank. Security. It's dangerous sometimes. That's all I can say, and it's more than I should.", fx: { set: { half_truth: true }, aff: { tonia: 1 } }, go: 'half' },
          { t: 'There\'s nothing to tell 😁 rare toys, very expensive toys. go to sleep, detective', fx: { sus: { tonia: 1 } }, go: 'lie' },
          { t: "Tonia… I'm not Ajax. I found his phone.", fx: { set: { told_truth: true, tonia_knows_stranger: true } }, go: 'confess' },
          { t: '[Leave on read]', silent: true, fx: { sus: { tonia: 2 } }, go: 'read' },
        ] },
      ],
      truth: [
        { typing: 8 },
        { wait: 3 },
        { m: '…' },
        { m: 'Thank you.' },
        { m: "I'm not scared of you. I want you to know that first. Before anything else." },
        { m: "I'm scared FOR you. That's different." },
        { m: 'Does Mama know?' },
        { choice: [
          { t: "No. And she can't. Not ever.", go: 'mama_no' },
          { t: 'I think she guesses.', fx: { aff: { tonia: 1 } }, go: 'mama_guess' },
        ] },
      ],
      mama_no: [{ m: 'She sets your plate every Sunday like she\'s afraid you won\'t come back to eat it. She knows something. She just doesn\'t know what.' }, { go: 'stop' }],
      mama_guess: [{ m: 'She guesses.' }, { m: 'She sets your plate every Sunday like she\'s afraid you won\'t come back to eat it.' }, { go: 'stop' }],
      stop: [
        { m: 'Are you going to stop?' },
        { choice: [
          { t: "I don't know how to stop, Tonia.", fx: { aff: { tonia: 1 } }, go: 'stop_dunno' },
          { t: 'Someday. When you\'re all safe.', go: 'stop_someday' },
          { t: "I'm the best at it. Why would I stop? 😁", go: 'stop_best' },
        ] },
      ],
      stop_dunno: [{ m: "Then I'll ask you again next year. And the year after." }, { m: "I'm very patient. I'm your sister." }, { go: 'secret' }],
      stop_someday: [{ m: "We're safe when you're here, Ajax." }, { m: "You're never here." }, { go: 'secret' }],
      stop_best: [
        { m: 'Because one day Teucer will find out you don\'t make toys. You make… whatever it is you make.' },
        { m: "And I don't want to be the one who has to tell him." },
        { go: 'secret' },
      ],
      secret: [
        { m: "Don't tell Teucer. Ever. Let him have the elves." },
        { m: 'Goodnight, Ajax. Bratik.' },
        { typing: 4 },
        { m: "I love you. I'm going to pretend I didn't type that." },
        { go: 'end' },
      ],
      again: [
        { m: 'You told me on the plane. I\'ve been thinking about it all day. I have the questions I didn\'t ask.' },
        { m: 'Have you ever hurt anyone?' },
        { choice: [
          { t: 'Yes.', fx: { aff: { tonia: 1 } }, go: 'q_yes' },
          { t: 'Only people who were trying to hurt someone else.', go: 'q_only' },
          { t: "Tonia. Don't ask me that.", go: 'q_dont' },
        ] },
      ],
      q_yes: [{ typing: 5 }, { m: 'Okay.' }, { m: "Thank you for not lying. I'd have known." }, { go: 'stop' }],
      q_only: [{ m: 'That\'s what everyone who hurts people says, Ajax.' }, { m: 'But I think you might actually mean it.' }, { go: 'stop' }],
      q_dont: [{ m: 'Okay. I won\'t.' }, { m: "That's an answer too." }, { go: 'stop' }],
      half: [
        { typing: 4 },
        { m: 'Security.' },
        { m: 'Okay.' },
        { m: "It's not everything. But it's the first thing tonight that sounded like you were choosing your words instead of throwing them." },
        { m: 'I\'ll take it. For now. “For now” — that\'s what Mama says.' },
        { m: 'Goodnight, bratik.' },
        { go: 'end' },
      ],
      lie: [
        { typing: 6 },
        { wait: 3 },
        { m: 'Okay.' },
        { m: 'Goodnight, Ajax.' },
        { wait: 8 },
        { m: 'For the notebook: “rare toys, very expensive toys. go to sleep, detective.”' },
        { go: 'end' },
      ],
      confess: [
        { typing: 3 },
        { m: '…What?' },
        { m: "Where is he? Where's my brother?" },
        { choice: [
          { t: "He's safe. He asked me to keep his phone alive until Monday.", go: 'c_safe' },
          { t: "I don't know. I found it on Pier 7.", go: 'c_pier' },
        ] },
      ],
      c_safe: [
        { m: 'I knew. You don\'t type like him. You type like someone reading him.' },
        { m: 'If he\'s safe, tell him his sister knows. And give it back.' },
        { go: 'c_end' },
      ],
      c_pier: [
        { m: 'Pier 7.' },
        { m: "He fishes there. He'd never leave his phone there unless something was very wrong." },
        { m: "I'm calling Mama. Then I'm calling the police." },
        { go: 'c_end' },
      ],
      c_end: [free('tonia'), { wait: 4 }, { ending: 'honest' }],
      read: [{ wait: 10 }, { m: 'Read.' }, { m: 'Okay. I see.' }, { m: "That's an answer too." }, { go: 'end' }],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 5 — Sunday: the Rite of Parting
  // ════════════════════════════════════════════════════════════════

  scene({
    id: 'fam_crowds', thread: 'teucer', ch: 'sun_rite', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 300 },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { if: (s) => held(s), go: 'window' },
        { m: 'BROTHER', img: 'p_yujing_lanterns' },
        { m: 'EVERYONE IS WEARING WHITE' },
        { m: 'is it a TOY PARADE' },
        { m: 'tonia says it is a FUNERAL for a GOD' },
        { m: 'how do u bury a god. is the coffin SO big' },
        { if: (s) => F(s).zl_pickup || F(s).factory_zl || F(s).kids_zl, go: 'zl' },
        { go: 'bird' },
      ],
      window: [
        { m: 'brother' },
        { m: 'we can see the FUNERAL from the window' },
        { m: 'everyone is wearing white. mr ivanov is wearing grey. he is not invited i think' },
        { go: 'bird' },
      ],
      zl: [
        { m: 'MR ZHONGLI IS AT THE FRONT. he is doing the TALKING' },
        { if: (s) => F(s).zl_confessed, go: 'zl_wink' },
        { m: 'he looks sad. i waved. he did a tiny wave back with ONE finger' },
        { go: 'bird' },
      ],
      zl_wink: [{ m: 'he WINKED at me during the sad part' }, { m: 'tonia says “that\'s not appropriate”. i think it was VERY appropriate' }, { go: 'bird' }],
      bird: [
        { if: (s) => F(s).ht_ally || F(s).knows_hideout, go: 'hat' },
        { if: (s) => F(s).lumine_guard, go: 'guarded' },
        { go: 'bird2' },
      ],
      guarded: [
        { m: 'also' },
        { m: 'a man in a BIRD MASK tried to give me a lolipop' },
        { m: 'and PAIMON BIT HIM' },
        { m: 'lumine said “we\'re leaving” and we LEFT. very fast. like NINJAS' },
        { m: 'he said “see you Monday, little one”. paimon said a WORD' },
        { m: 'Ajax. Lumine says the man in the beaked mask works with you. He knew Teucer\'s name. He said “see you Monday”.', th: 'tonia', from: 'tonia' },
        { m: 'Who is he?', th: 'tonia', from: 'tonia' },
        { go: 'bird_q' },
      ],
      hat: [{ m: 'a girl in a BIG HAT gave me a ghost sticker 👻' }, { m: 'she said “tell your brother number four says hi”. what is number four' }, { go: 'bird2' }],
      bird2: [
        { m: 'also' },
        { m: 'a man in a BIRD MASK gave me a lolipop' },
        { m: 'he asked how old i am and if i like DOCTORS' },
        { m: 'i said NO. he wrote it down' },
        { m: 'he said “see you Monday, little one”' },
        { m: 'Ajax. A man in a beaked mask just talked to Teucer. The men in grey coats stood up straighter when he walked past. He knew Teucer\'s name.', th: 'tonia', from: 'tonia' },
        { m: 'Who is he?', th: 'tonia', from: 'tonia' },
        { go: 'bird_q' },
      ],
      bird_q: [
        { choice: [
          { t: "Teucer, give the lollipop to Tonia. Don't eat it. Stay right next to her. Right now.", fx: { set: { dottore_seen: true } }, go: 'protect' },
          { t: "That's a doctor from work. He's… weird. Stay with Tonia 😁", fx: { set: { dottore_seen: true } }, go: 'deflect' },
          { t: 'Fun! 😁', fx: { sus: { tonia: 2 } }, go: 'fun' },
        ], timeout: 90, onTimeout: 'slow' },
      ],
      protect: [
        { m: 'ok 😢 it was a STRAWBERRY one' },
        { m: 'I threw it into the incense burner. It burned green.', th: 'tonia', from: 'tonia' },
        { m: 'Ajax, what is happening on Monday?', th: 'tonia', from: 'tonia' },
        { go: 'next' },
      ],
      deflect: [{ m: 'he IS weird. he smelled like the DENTIST' }, { m: 'I took the lollipop. I\'m keeping it. As evidence.', th: 'tonia', from: 'tonia' }, { go: 'next' }],
      fun: [
        { m: 'FUN!!!' },
        { m: '“Fun.”', th: 'tonia', from: 'tonia', d: 2 },
        { m: 'A man in a plague doctor\'s mask said “see you Monday” to our little brother and you said “fun”.', th: 'tonia', from: 'tonia' },
        { m: "The real Ajax would have been on a boat to here already. I don't know who's texting me.", th: 'tonia', from: 'tonia' },
        { go: 'next' },
      ],
      slow: [
        { m: 'brother?' },
        { m: 'I took the lollipop off him. Nobody answered me, so I decided myself.', th: 'tonia', from: 'tonia' },
        { go: 'next' },
      ],
      next: [free('teucer'), { start: 'fam_dottore_call', delay: 25 }],
      exp: [free('teucer')],
    },
  });

  // Mama: "a doctor from your company telephoned"
  scene({
    id: 'fam_dottore_call', thread: 'mama', ch: 'sun_rite', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        { if: (s) => F(s).dottore_cancelled, go: 'already' },
        { m: 'My sun! A doctor from your company telephoned the house.' },
        { m: 'A Dr. Dottore. Such good manners. He says Teucer has a little check-up on Monday morning before the flight, for the travel insurance, all paid by the bank.' },
        { m: 'You didn\'t tell me! I said yes, of course.' },
        { choice: [
          { t: "Mama, cancel it. Teucer doesn't need a check-up. I'll deal with the insurance.", fx: { set: { mama_refused_dottore: true }, aff: { mama: 1 } }, go: 'cancel' },
          { t: 'I\'ll take care of it, Mama. Don\'t worry 😁', go: 'handle' },
          { t: "It's fine, Mama. Dottore's very thorough.", go: 'fine' },
        ] },
      ],
      already: [
        { m: 'My sun, a Dr. Dottore\'s office telephoned the house about some appointment for Teucer on Monday. Then they telephoned again and said it was cancelled.' },
        { m: 'Very confusing people. Very good manners.' },
        { go: 'end' },
      ],
      cancel: [
        { m: 'Oh! But he said Mr. Pulcinella insisted…' },
        { m: 'All right, my sun. I\'ll telephone him back and say no thank you.' },
        { m: 'Ajax, is something wrong?' },
        { go: 'end' },
      ],
      handle: [{ m: 'Good. You always take care of everything. Eat something.' }, { go: 'end' }],
      fine: [{ m: 'Good! Teucer hates needles. He bit the last nurse. I\'ll warn the doctor.' }, { go: 'end' }],
      end: [free('mama'), { start: 'fam_tonia_arle', delay: 30 }],
      exp: [free('mama')],
    },
  });

  // Tonia: "is there anyone at your work who isn't frightening?"
  scene({
    id: 'fam_tonia_arle', thread: 'tonia', ch: 'sun_rite', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { if: (s) => F(s).dottore_cancelled || F(s).arle_protects, go: 'end' },
        { m: 'Mama says the man in the mask is a doctor. He wants Teucer on Monday. For “blood work”.' },
        { m: 'Ajax, is there anyone at your work who isn\'t frightening?' },
        { choice: [
          { t: "One. Arlecchino. She runs an orphanage, and she hates him. I'm asking her now.", fx: { set: { asked_arle: true } }, go: 'arle' },
          { t: "He's not getting Teucer. I'll cancel the appointment myself.", go: 'self' },
          { t: 'Nobody. Stay away from all of them.', go: 'nobody' },
        ] },
      ],
      arle: [{ start: 'fam_arle', delay: 3 }, { m: 'An orphanage.' }, { m: 'Okay. I\'ll trust her because you do.' }, { go: 'end' }],
      self: [{ m: 'Then do it. Now. Before Monday. Before anyone remembers.' }, { go: 'end' }],
      nobody: [{ m: "That's what I thought." }, { m: 'I\'m not letting go of his hand until we\'re on the plane.' }, { go: 'end' }],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });

  // Arlecchino answers (writes into her thread; S2's arle_1 takes precedence if it already ran)
  scene({
    id: 'fam_arle', thread: 'arle', trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).arle_protects, go: 'skip' },
        { me: "Arlecchino. Dottore wants my little brother. Monday, 09:00. “Blood work”. He's a child." },
        { wait: 10 },
        { m: 'Tartaglia.' },
        { if: (s) => !!s.done.arle_1, go: 'again' },
        { m: 'I knew of the appointment. I did not know he had chosen your brother.' },
        { go: 'promise' },
      ],
      again: [
        { m: 'You told me you would handle the Doctor yourself.' },
        { m: 'I am glad you changed your mind. Pride is a poor guardian.' },
        { go: 'promise' },
      ],
      promise: [
        { m: 'He will not have him.' },
        { if: (s) => held(s), go: 'grand' },
        { go: 'done' },
      ],
      grand: [
        { m: "And I will collect them from Pulcinella's hotel myself. His men will not argue with me. They never have." },
        { fx: { set: { kids_rescued: true, rescue_by: 'arle' } } },
        { start: 'fam_arle_tonia', delay: 30 },
        { go: 'done' },
      ],
      done: [
        { m: 'This is not a favour to you. Do not thank me.' },
        { fx: { set: { arle_protects: true } } },
      ],
      skip: [],
    },
  });
  scene({
    id: 'fam_arle_tonia', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: [
        { m: 'Ajax.' },
        { m: 'A woman with white hair and very strange eyes came to the suite. The men in grey coats stood against the wall like schoolboys.' },
        { m: 'She said “Come, children.” Teucer asked if she was a queen. She said “No. Something more useful.”' },
        { m: 'We\'re in a car. She hasn\'t said anything else. Teucer is holding her hand. She is letting him.' },
      ],
    },
  });

  // ── "Will we see you before we go home?" (ch5 +750 s) ─────────────
  scene({
    id: 'fam_see_you', thread: 'teucer', ch: 'sun_rite', expire: 'exp',
    trigger: { on: 'chapter', ch: 'sun_rite', delay: 750 },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { m: 'brother' },
        { m: 'we have been in liyue for 2 days' },
        { m: 'and i have not seen u ONE time' },
        { if: (s) => F(s).ft_thumb, go: 'thumb' },
        { go: 'ask' },
      ],
      thumb: [{ m: 'only ur THUMB' }, { go: 'ask' }],
      ask: [
        { m: 'tonia says u r working on a BIG project' },
        { m: 'will we see u before the plane? the plane is TOMORROW' },
        { m: 'please' },
        { choice: [
          { t: 'Tomorrow. Before your plane. I promise. Look for the tallest guy in the worst hat 😁', if: (s) => F(s).knows_hideout && !F(s).deal_refused, fx: { set: { promised_monday: true }, aff: { teucer: 1 } }, go: 'promise' },
          { t: "I'll try, Teucer. I'm so sorry. Work's been… big.", go: 'try' },
          { t: 'Of course!! tomorrow for sure 😁', fx: { set: { promised_empty: true } }, go: 'empty' },
          { t: '[Leave on read]', silent: true, fx: { sus: { teucer: 1 } }, go: 'read' },
        ] },
      ],
      promise: [
        { m: 'PROMISE PROMISE?' },
        { m: 'pinky promise. i am doing a pinky on my side' },
        { m: 'ok. i believe u' },
        { m: 'u always keep promises' },
        { go: 'end' },
      ],
      try: [{ m: 'ok', d: 1.4 }, { m: 'Sir Fang says work is STUPID' }, { m: 'he is a wolf he can say that' }, { go: 'end' }],
      empty: [{ m: 'YAAAAY' }, { m: 'TOMORROW' }, { m: 'i am going to tell tonia. she said u wouldnt' }, { go: 'end' }],
      read: [{ wait: 10 }, { m: 'brother?' }, { m: 'ok' }, { go: 'end' }],
      end: [free('teucer')],
      exp: [free('teucer')],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 6 — Sunday night
  // ════════════════════════════════════════════════════════════════

  // ── Mama's Sunday call (ch6 +300 s) ──────────────────────────────
  scene({
    id: 'fam_mama_ring', thread: 'mama', ch: 'sun_night',
    trigger: { on: 'chapter', ch: 'sun_night', delay: 300 },
    nodes: {
      start: [{ call: 'call_mama_sun' }, { wait: 40 }, { if: (s) => !F(s).mama_picked, go: 'missed' }],
      missed: [{ start: 'fam_mama_missed' }],
    },
  });

  S.call({
    id: 'call_mama_sun', from: 'mama', ring: 25,
    onHangup: [{ start: 'fam_mama_hungup' }],
    voicemail: 'My sun. It\'s Sunday. You always answer on Sundays. …It\'s all right. You\'re busy. Eat something, and call your Mama.',
    nodes: {
      start: [
        { fx: { set: { mama_picked: true } } },
        { say: 'My sun! You answered. It\'s Sunday. You always answer on Sundays.' },
        { say: 'Don\'t say anything yet. Let me count how late it is there. …Too late. You should be asleep.' },
        { choice: [
          { t: '(Stay silent)', go: 'silent' },
          { t: '"Hi, Mama."', go: 'voice' },
          { t: '(Hang up)', go: 'hang' },
        ] },
      ],
      silent: [
        { fx: { set: { mama_called: true } } },
        { say: "You're quiet. You do that when you're tired. When you were small you'd come in from the ice and sit in the kitchen and say nothing, and I'd put soup in front of you." },
        { say: "So I'll talk. You listen." },
        { if: (s) => F(s).lullaby_sent, go: 's_song' },
        { go: 's2' },
      ],
      s_song: [{ say: 'Tonia played me your song through the telephone. You still go flat on “sled”.' }, { go: 's2' }],
      s2: [
        { if: (s) => F(s).gift_teucer, go: 's_toy' },
        { go: 's3' },
      ],
      s_toy: [{ say: 'Teucer has shown me his fortress four times. The drawbridge works. He told me so four times.' }, { go: 's3' }],
      s3: [
        { if: (s) => F(s).told_tonia, go: 's_tonia' },
        { if: (s) => held(s), go: 's_held' },
        { go: 's4' },
      ],
      s_tonia: [{ say: 'Tonia telephoned me tonight and didn\'t say anything either. She just breathed. My children, breathing at me down the telephone.' }, { go: 's4' }],
      s_held: [{ say: 'The children\'s hotel won\'t put me through to their room. They say it\'s Mr. Pulcinella\'s instructions. Ajax… why would Mr. Pulcinella have instructions?' }, { go: 's4' }],
      s4: [
        { say: "I don't know what you do, my sun." },
        { say: "I know it isn't toys. A mother knows. I knew when you came back from the cave, and I knew when that man sent the car for you." },
        { say: "I don't need to know. I only need you to eat, and come home sometimes, and call on Sundays." },
        { say: '(She hums. The fish song. The second verse, the one you always fell asleep before.)', from: 'sys' },
        { say: 'Goodnight, my sun.' },
        { fx: { aff: { mama: 2 } } },
        { start: 'fam_mama_after', delay: 20 },
        { hangup: true },
      ],
      voice: [
        { say: '…Ajax?' },
        { say: 'You sound far away. Is it the line? Your voice is lower.' },
        { fx: { sus: { mama: 3 } } },
        { choice: [
          { t: '"Bad line, Mama. I have a cold."', go: 'cold' },
          { t: '(Stay silent)', go: 'silent' },
          { t: '"Mama… I\'m not Ajax. I found his phone."', go: 'truth' },
        ] },
      ],
      cold: [
        { fx: { set: { mama_called: true } } },
        { say: 'A cold. Honey and hot milk. Now.' },
        { say: '…My sun, you sound like a stranger with a cold.' },
        { say: 'Sleep. I\'ll call tomorrow.' },
        { hangup: true },
      ],
      truth: [
        { say: '…' },
        { say: 'Then… where is he? Is he safe? Is he eating?' },
        { say: 'Please find him. Give it back to him, and tell him to call his Mama.' },
        { fx: { set: { told_truth: true } } },
        { start: 'fam_honest_mama' },
        { hangup: true },
      ],
      hang: [{ start: 'fam_mama_hungup' }, { hangup: 'me' }],
    },
  });
  scene({ id: 'fam_honest_mama', thread: 'mama', trigger: { on: 'manual' }, nodes: { start: [{ wait: 4 }, { m: 'Thank you for telling me. You sound like a good child.' }, { wait: 3 }, { ending: 'honest' }] } });
  scene({
    id: 'fam_mama_after', thread: 'mama', trigger: { on: 'manual' },
    nodes: { start: [{ m: 'I love you, my sun. Thank you for listening to your old Mama.' }, { m: 'Eat something.' }] },
  });
  scene({
    id: 'fam_mama_hungup', thread: 'mama', trigger: { on: 'manual' },
    nodes: { start: [{ wait: 4 }, { m: 'We were cut off, my sun. The line from here is terrible.' }, { m: "Call me back when you can. I'll stay up." }, { fx: { sus: { mama: 1 } } }] },
  });
  scene({
    id: 'fam_mama_missed', thread: 'mama', ch: 'sun_night', expire: 'exp', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        { wait: 8 },
        { m: "You didn't answer." },
        { m: 'You always answer on Sundays.' },
        { m: 'Are you all right, my sun? Just tell me you\'ve eaten.' },
        { choice: [
          { t: "I'm okay, Mama. I ate. Busy night ❤️", fx: { aff: { mama: 1 } }, go: 'ok' },
          { t: 'I ate a sandwich 😁', fx: { aff: { mama: 2 }, sus: { mama: -1 } }, go: 'sandwich' },
          { t: '[Leave on read]', silent: true, fx: { sus: { mama: 1 } }, go: 'read' },
        ] },
      ],
      ok: [{ m: 'Good. Sleep. Then eat again.' }, { go: 'end' }],
      sandwich: [{ m: 'A sandwich is not food, my sun.' }, { m: 'A sandwich is a plate with ideas.' }, { m: '❤️' }, { go: 'end' }],
      read: [{ wait: 10 }, { m: "Then I'll sit by the telephone. Like a girl waiting for a dance." }, { go: 'end' }],
      end: [free('mama')],
      exp: [free('mama')],
    },
  });

  // ── The harbor goes dark (Osial was sent) ────────────────────────
  scene({
    id: 'fam_dark', thread: 'teucer', ch: 'sun_night', expire: 'exp',
    trigger: { on: 'flag', flag: 'osial_sent', delay: 30 },
    nodes: {
      start: [
        { m: 'BROTHER THE LIGHTS WENT OUT', d: 0.6 },
        { m: 'ALL OF THEM' },
        { m: 'the whole HARBOR is dark' },
        { m: 'and the sea is making a NOISE' },
        { if: (s) => F(s).kids_alcor, go: 'ship' },
        { if: (s) => F(s).kids_wangshu, go: 'hill' },
        { m: 'Sir Fang is under the bed. i am under the bed too' },
        { go: 'tonia' },
      ],
      ship: [{ m: 'THE SHIP IS LEAVING THE HARBOR' }, { m: 'captain beidou says “hold on to something, kid”' }, { m: 'i am holding SIR FANG' }, { go: 'tonia' }],
      hill: [{ m: 'we can see it from the mountain' }, { m: 'the sea is BLACK. and it is going the WRONG WAY' }, { go: 'tonia' }],
      tonia: [
        { m: "Ajax. The harbor's gone dark. The water's pulling away from the piers. People are running uphill.", th: 'tonia', from: 'tonia' },
        { m: 'What is happening?', th: 'tonia', from: 'tonia' },
        { go: 'lockq' },
      ],
      lockq: waitFor('teucer', 'ask', 'lockq'),
      ask: [
        lock('teucer'),
        { choice: [
          { t: 'Tonia, take Teucer uphill, away from the water. Now. Don\'t stop for anything.', fx: { aff: { tonia: 1 } }, go: 'uphill' },
          { t: "It's a power cut, buddy. Count fish till the lights come back 🐟", go: 'count' },
          { t: '🎵 Send him “lullaby for Teucer”', silent: true, if: (s) => !F(s).lullaby_sent, go: 'song' },
        ], timeout: 90, onTimeout: 'alone' },
      ],
      uphill: [
        { m: "We're going. I've got his hand.", th: 'tonia', from: 'tonia' },
        { m: 'brother we r RUNNING' },
        { m: 'tonia says dont look back. i looked back' },
        { m: 'the sea is GONE' },
        { go: 'end' },
      ],
      count: [{ m: '1 fish' }, { m: '2 fish' }, { m: 'brother the fish are GONE. the water took them' }, { go: 'end' }],
      song: [shareLullaby('teucer'), { wait: 6 }, { m: 'i am playing it LOUD so i cant hear the sea' }, { go: 'end' }],
      alone: [{ m: 'brother??' }, { m: 'We\'re going uphill. Nobody told me to. I decided myself.', th: 'tonia', from: 'tonia' }, { go: 'end' }],
      end: [free('teucer')],
      exp: [free('teucer')],
    },
  });

  // ── …or the sea goes very still (Osial didn't happen) ────────────
  scene({
    id: 'fam_still', thread: 'teucer', ch: 'sun_night',
    trigger: { on: 'time', at: '+2 23:40' },
    when: (s) => !F(s).osial_sent && !held(s),
    nodes: {
      start: [
        { m: 'brother r u awake' },
        { m: 'the sea is SO flat. like a MIRROR' },
        { m: 'tonia says its weird. i say its PRETTY' },
        { if: (s) => F(s).kids_zl, go: 'zl' },
        { m: 'goodnight brother 🐟' },
      ],
      zl: [
        { m: 'mr zhongli is standing at the window looking at it. he has not moved for an HOUR' },
        { m: 'i asked what he is doing. he said “keeping a promise”' },
        { m: 'goodnight brother 🐟' },
      ],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // CHAPTER 7 — Monday
  // ════════════════════════════════════════════════════════════════

  // ── 08:40: a car comes for Teucer ────────────────────────────────
  scene({
    id: 'fam_dottore_car', thread: 'tonia', ch: 'mon', expire: 'exp',
    trigger: { on: 'time', at: '+3 08:40' },
    when: (s) => !F(s).dottore_cancelled && !F(s).arle_protects && !held(s) && !!F(s).kids_landed,
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { m: 'Ajax.' },
        { m: 'A car came. For Teucer. For the “check-up”.' },
        { if: (s) => F(s).mama_refused_dottore, go: 'refused' },
        { go: 'go2' },
      ],
      refused: [{ m: 'Mama told them no. They came anyway.' }, { go: 'go2' }],
      go2: [
        { m: 'The driver says Dr. Dottore is expecting him at nine. He says Mr. Pulcinella insisted.' },
        { m: "I said no. I've locked us in the bathroom. Teucer thinks it's hide-and-seek. He's winning." },
        { m: 'Tell me what to do.' },
        { choice: [
          { t: 'Say it through the door: “The Eleventh says no.” Exactly those words.', fx: { set: { dottore_stopped: true } }, go: 'eleventh' },
          { t: "Call Mr. Zhongli. He'll come.", if: (s) => F(s).zl_pickup || F(s).kids_zl || F(s).factory_zl, fx: { set: { dottore_stopped: true } }, go: 'zl' },
          { t: "Stay in there. Lumine's coming.", if: (s) => F(s).lumine_pickup || F(s).gave_abyss_notes, fx: { set: { dottore_stopped: true } }, go: 'lumine' },
          { t: "It's just a check-up, Tonia. Let him go. It's fine.", fx: { set: { dottore_got_teucer: true }, sus: { tonia: 1 } }, go: 'taken' },
        ], timeout: 90, onTimeout: 'taken' },
      ],
      eleventh: [
        { typing: 6 },
        { m: 'I said it.' },
        { m: '“The Eleventh says no.”' },
        { m: 'He went white. He apologised. To me. Through a bathroom door. Then he left.' },
        { typing: 5 },
        { m: 'Ajax, what does it mean when a grown man is afraid of your name?' },
        { go: 'end' },
      ],
      zl: [
        { start: 'fam_zl_dottore', delay: 1 },
        { wait: 20 },
        { m: 'Mr. Zhongli came. He didn\'t shout. He just stood in the corridor, and the driver… left. Very fast.' },
        { m: 'Mr. Zhongli said, “The appointment has been cancelled by mutual agreement.” Then he asked Teucer if he would like to see a very old coin.' },
        { go: 'end' },
      ],
      lumine: [
        { start: 'fam_lumine_dottore', delay: 1 },
        { wait: 20 },
        { m: 'Lumine came in through the window. Paimon came in through the door, very loudly.' },
        { m: 'The driver is gone. Teucer thinks this is the best hide-and-seek ever played.' },
        { go: 'end' },
      ],
      taken: [
        { fx: { set: { dottore_got_teucer: true } } },
        { wait: 6 },
        { m: "They didn't break the door. They waited. Teucer got bored and opened it." },
        { m: 'I went with him. A man in a bird mask watched them take three tubes of blood and wrote everything down.' },
        { m: 'Teucer got a sticker. It says BRAVE. He\'s very proud of it.' },
        { m: "I'm not." },
        { fx: { aff: { tonia: -1 } } },
        { go: 'end' },
      ],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });
  scene({
    id: 'fam_zl_dottore', thread: 'zl', trigger: { on: 'manual' },
    nodes: { start: [{ me: "xiansheng. Dottore's driver is at the kids' door. please" }, { wait: 4 }, { m: 'I am already on the stairs.' }] },
  });
  scene({
    id: 'fam_lumine_dottore', thread: 'lumine', trigger: { on: 'manual' },
    nodes: { start: [{ me: 'comrade. a man from Dottore is at my siblings\' door. please' }, { wait: 4 }, { m: 'going.' }, { m: 'window or door' }, { m: 'both. paimon is the door' }] },
  });

  // ── 12:10: the goodbye ───────────────────────────────────────────
  scene({
    id: 'fam_goodbye', thread: 'teucer', ch: 'mon', expire: 'exp',
    trigger: { on: 'time', at: '+3 12:10' },
    when: (s) => !!F(s).kids_landed,
    nodes: {
      start: [
        { if: (s) => held(s), go: 'held' },
        { go: 'wait' },
      ],
      wait: waitFor('teucer', 'go', 'wait'),
      go: [
        lock('teucer'),
        { m: 'BROTHER' },
        { m: 'we r at the AIRPORT' },
        { if: (s) => F(s).ride_monday, go: 'e_fang' },
        { if: (s) => F(s).kids_alcor, go: 'e_alcor' },
        { if: (s) => F(s).zl_pickup || F(s).kids_zl, go: 'e_zl' },
        { if: (s) => F(s).lumine_pickup, go: 'e_lumine' },
        { if: (s) => F(s).ekat_pickup, go: 'e_ekat' },
        { go: 'him' },
      ],
      e_fang: [{ m: 'MR FANG DROVE US AGAIN!!! he gave me the FISH AIR FRESHENER. to KEEP' }, { go: 'him' }],
      e_alcor: [{ m: 'captain beidou SALUTED me. kazuha played the leaf song. it was almost THE song' }, { go: 'him' }],
      e_zl: [{ m: 'mr zhongli carried my bag. he said “this is a contract between us, little one: you will come back”' }, { m: 'i said OK. so now its a CONTRACT' }, { go: 'him' }],
      e_lumine: [{ m: 'lumine and paimon came to say bye. paimon cried. lumine didnt but her eyes did' }, { go: 'him' }],
      e_ekat: [{ m: 'ekaterina gave me a NORTHLAND TOYS badge. a REAL one. it says JUNIOR DIRECTOR' }, { go: 'him' }],
      him: [
        { if: (s) => F(s).promised_monday && F(s).knows_hideout && F(s).deal_childe, go: 'came' },
        { if: (s) => F(s).promised_empty, go: 'empty' },
        { go: 'gifts' },
      ],
      came: [
        { fx: { set: { childe_at_airport: true } } },
        { m: 'BROTHER CAME!!!!!!!!!!!!!!!!', d: 0.5 },
        { m: 'he was wearing a HAT and SUNGLASSES' },
        { m: 'and he smelled like INCENSE' },
        { m: 'he hugged me SO hard Sir Fang squeaked' },
        { m: 'he said his phone is “with a friend”' },
        { m: 'so HI FRIEND 👋🐟' },
        { m: 'he hugged me for a whole minute. Then he looked at your messages over my shoulder and laughed with his whole face.', th: 'tonia', from: 'tonia' },
        { go: 'gifts' },
      ],
      empty: [
        { m: 'u said “tomorrow for sure”' },
        { m: 'its tomorrow' },
        { typing: 4 },
        { m: 'its ok' },
        { m: 'Sir Fang says work is stupid' },
        { go: 'gifts' },
      ],
      gifts: [
        { if: (s) => F(s).dottore_got_teucer, go: 'g_brave' },
        { go: 'g1' },
      ],
      g_brave: [{ m: 'i still have my sticker. it says BRAVE' }, { go: 'g1' }],
      g1: [
        { if: (s) => F(s).gift_teucer, go: 'g_fort' },
        { if: (s) => F(s).toy_promised, go: 'g_nofort' },
        { go: 'g2' },
      ],
      g_fort: [{ m: 'the FORTRESS is in my bag. the drawbridge is UP so nobody gets in' }, { go: 'g2' }],
      g_nofort: [{ m: 'the fortress is ok. maybe for christmas' }, { m: 'i am not sad. i am just SAYING' }, { go: 'g2' }],
      g2: [
        { if: (s) => F(s).beat_teucer, go: 'g_rr' },
        { if: (s) => F(s).rr_challenge, go: 'g_rr_no' },
        { go: 'g3' },
      ],
      g_rr: [{ m: 'i am going to practise reel rush the WHOLE flight. ur score is NOTHING 😤🎣' }, { go: 'g3' }],
      g_rr_no: [{ m: 'u never even beat my score. HA. i am still the CHAMPION 👑🐟' }, { go: 'g3' }],
      g3: [
        { if: (s) => F(s).lullaby_sent, go: 'g_song' },
        { go: 'elves' },
      ],
      g_song: [{ m: 'i will play ur song on the plane. tonia says not LOUD' }, { go: 'elves' }],
      elves: [
        { m: 'brother' },
        { m: 'tell the elves thank you' },
        { if: (s) => F(s).factory_zl, go: 'el_zl' },
        { if: (s) => F(s).factory_bank, go: 'el_bank' },
        { if: (s) => F(s).factory_cancelled, go: 'el_cancel' },
        { go: 'bye' },
      ],
      el_zl: [{ m: 'and tell mr zhongli the elves should get the GOOD tea' }, { go: 'bye' }],
      el_bank: [{ m: 'and tell old pyotr sorry about his hat' }, { go: 'bye' }],
      el_cancel: [{ m: 'and tell them good luck with the INSPECTION' }, { go: 'bye' }],
      bye: [
        { choice: [
          { t: 'The elves say you\'re welcome. They say come back soon 😁🐟', fx: { set: { elves_kept: true }, aff: { teucer: 1 } }, go: 'b_elves' },
          { t: 'Have a good flight, Teucer!! 🐟❤️ text me the second you land', fx: { aff: { teucer: 1 } }, go: 'b_land' },
          { t: 'Teucer… there are no elves.', fx: { sus: { teucer: 3 } }, go: 'b_none' },
        ] },
      ],
      b_elves: [{ m: 'I KNEW IT' }, { m: 'i will come back when im BIGGER and work at the factory' }, { m: 'i will be the second tallest elf' }, { go: 'end' }],
      b_land: [{ m: 'i will text u from the SKY' }, { m: 'tonia says i cant. i will try anyway' }, { go: 'end' }],
      b_none: [
        { m: '…', d: 3 },
        { m: 'yes there are' },
        { m: 'u r just sad because i am leaving' },
        { m: 'its ok. i am sad too' },
        { m: 'bye brother' },
        { go: 'end' },
      ],
      end: [free('teucer'), { start: 'fam_goodbye_tonia', delay: 15 }],

      // the Fatui still have them: they don't fly
      held: waitFor('tonia', 'held_go', 'held'),
      held_go: [
        lock('tonia'),
        { fx: { set: { kids_held: true } } },
        { m: 'Ajax.', th: 'tonia', from: 'tonia' },
        { m: "We're not at the airport.", th: 'tonia', from: 'tonia' },
        { m: 'Mr. Ivanov says the flight is “postponed”. He says our brother has to “come in and sign something” first.', th: 'tonia', from: 'tonia' },
        { m: "Teucer thinks we're staying longer because Liyue is so nice. He's doing cannonballs.", th: 'tonia', from: 'tonia' },
        { m: "I don't think that's why.", th: 'tonia', from: 'tonia' },
        { m: 'What do they want you to sign, Ajax?', th: 'tonia', from: 'tonia' },
        { choice: [
          { t: "Nothing you need to worry about. I'll come and get you. Today.", go: 'h_come' },
          { t: 'Stay together. Whatever happens, Teucer doesn\'t find out.', go: 'h_together' },
          { t: 'Call Mama. Tell her everything.', go: 'h_mama' },
        ], th: 'tonia' },
      ],
      h_come: [{ m: 'Promise.', th: 'tonia', from: 'tonia' }, { m: '…You always say it like it\'s easy.', th: 'tonia', from: 'tonia' }, { go: 'h_end' }],
      h_together: [{ m: "He won't. I'm good at it now. I learned from the best.", th: 'tonia', from: 'tonia' }, { go: 'h_end' }],
      h_mama: [
        { m: 'I did. She said “Mr. Pulcinella is a kind man.”', th: 'tonia', from: 'tonia' },
        { m: 'Then she was quiet for a very long time. Then she said “Put Teucer on.”', th: 'tonia', from: 'tonia' },
        { go: 'h_end' },
      ],
      h_end: [
        free('tonia'),
        { wait: 10 },
        { m: 'BROTHER WE GET TO STAY LONGER!!!!!!' },
        { m: 'the plane is BROKEN so we stay at the POOL' },
        { m: 'best. day. EVER 🐟🏊' },
      ],
      exp: [free('teucer'), free('tonia')],
    },
  });

  scene({
    id: 'fam_goodbye_tonia', thread: 'tonia', ch: 'mon', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { m: "We're boarding." },
        { if: (s) => F(s).told_tonia, go: 'told' },
        { if: (s) => (s.sus.tonia || 0) >= 6, go: 'stranger' },
        { if: (s) => F(s).half_truth, go: 'half' },
        { m: "I'm keeping the notebook. One day you'll read it and laugh. Or you won't." },
        { go: 'zl' },
      ],
      told: [
        { m: "I'm keeping your secret. Not for you. For him." },
        { m: '…And a little bit for you.' },
        { if: (s) => F(s).gift_tonia, go: 'told_pen' },
        { go: 'told2' },
      ],
      told_pen: [{ m: 'I wrote the first line in the notebook with your pen. It says: “My brother is the Eleventh. He is also my brother. Both things are true.”' }, { go: 'told2' }],
      told2: [{ m: "Come home for New Year. Tell Papa's whale story. The real one, whatever it is." }, { go: 'zl' }],
      half: [
        { m: 'You still owe me the rest of it. In person.' },
        { if: (s) => F(s).gift_tonia, go: 'half_pen' },
        { m: "I've written that in the notebook. In ink." },
        { go: 'zl' },
      ],
      half_pen: [{ m: "I've written that in the notebook with your pen. It writes beautifully. It makes every lie you've told me look very elegant." }, { go: 'zl' }],
      stranger: [
        { m: "I don't know who I've been talking to this weekend." },
        { m: "I hope it was you. And if it wasn't, please. Give him back to us." },
        { go: 'zl' },
      ],
      zl: [
        { if: (s) => F(s).memo_zl_sent && (F(s).zl_pickup || F(s).kids_zl || F(s).factory_zl), go: 'zl_letter' },
        { choice: [
          { t: 'I love you, Tonia. Fly safe 💧', fx: { aff: { tonia: 1 } }, go: 'love' },
          { t: 'The notebook is going to be very boring from now on 😁', go: 'boring' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      zl_letter: [
        { m: 'Mr. Zhongli came to the gate to see us off. He looked like someone who has just received a letter he has been waiting for for a very long time.' },
        { m: 'Ajax. Is it the “or is he… you know”?' },
        { choice: [
          { t: '…Yes. I think so.', fx: { aff: { tonia: 1 } }, go: 'zl_yes' },
          { t: 'Go and board, detective 😁', go: 'boring' },
          { t: '[Leave on read]', silent: true, go: 'read' },
        ] },
      ],
      zl_yes: [{ m: 'Good.' }, { m: "I told you I'd be fine with it. I'm better than fine. I'm going to tell Mama it was my idea." }, { go: 'end' }],
      love: [{ m: 'I know.' }, { m: "I'm going to pretend you didn't type that. I'm keeping it anyway." }, { go: 'end' }],
      boring: [{ m: "It won't be. It never is with you." }, { go: 'end' }],
      read: [{ wait: 8 }, { m: 'Read. Okay. Goodbye, bratik.' }, { go: 'end' }],
      end: [free('tonia')],
      exp: [free('tonia')],
    },
  });

  // ── 13:15: they're in the air ────────────────────────────────────
  scene({
    id: 'fam_flown', thread: 'fam', ch: 'mon',
    trigger: { on: 'time', at: '+3 13:15' },
    when: (s) => !!F(s).kids_landed && !held(s) && !F(s).kids_held,
    nodes: {
      start: [
        { if: (s) => F(s).gift_teucer, go: 'fort' },
        { m: "They're in the air, my sun. Tonia sent me a photo of Teucer asleep before take-off. Mouth open. Holding Sir Fang.", from: 'mama' },
        { go: 'm2' },
      ],
      fort: [{ m: "They're in the air, my sun. Tonia sent me a photo of Teucer asleep before take-off. Mouth open. Holding a fortress.", from: 'mama' }, { go: 'm2' }],
      m2: [
        { m: 'Thank you for looking after them.', from: 'mama' },
        { if: (s) => F(s).recipe, go: 'recipe' },
        { go: 'm3' },
      ],
      recipe: [{ m: 'And tell your Xiangling her pelmeni were very good. The edges: twice, gently. She\'ll understand.', from: 'mama' }, { go: 'm3' }],
      m3: [
        { m: 'Eat something.', from: 'mama' },
        { m: 'teucer sent me a voice note from the gate. its 40 seconds of him saying “liyue” in different voices', from: 'anthon' },
        { if: (s) => F(s).beat_teucer, go: 'rr' },
        { go: 'm4' },
      ],
      rr: [{ m: "also he wants a rematch. he's practising on the plane. bro you've created a monster", from: 'anthon' }, { go: 'm4' }],
      m4: [
        { m: "They're in the air. — Papa", from: 'papa' },
        { wait: 20 },
        { if: (s) => F(s).told_tonia, go: 'p_told' },
        { m: 'Teucer telephoned me from the airport. He says you work with elves. I said I know. — Papa', th: 'papa', from: 'papa' },
        { go: 'p2' },
      ],
      p_told: [
        { m: 'Your sister telephoned me from the gate. She told me nothing. She was very careful to tell me nothing. — Papa', th: 'papa', from: 'papa' },
        { m: 'I know what nothing sounds like. I taught all of you how to say it. — Papa', th: 'papa', from: 'papa' },
        { m: 'Come home, son. Whatever you are. — Papa', th: 'papa', from: 'papa' },
        { go: 'p2' },
      ],
      p2: [
        { m: 'Tell your brother the whale story when he is older. The true one. It was a seal. — Papa', th: 'papa', from: 'papa' },
        { wait: 25 },
        { m: '', th: 'teucer', from: 'teucer', voice: { dur: 14, text: '(Engines. Teucer, whispering:) “Brother, we’re flying. I can see Liyue. It’s so small now. You’re in there somewhere. Bye, brother. Bye, Liyue. Bye, elves.”' } },
        { start: 'fam_last_word', delay: 2 },
      ],
    },
  });
  scene({
    id: 'fam_last_word', thread: 'teucer', ch: 'mon', expire: 'exp',
    trigger: { on: 'manual' },
    nodes: {
      start: waitFor('teucer', 'go'),
      go: [
        lock('teucer'),
        { choice: [
          { t: 'Bye, Teucer ❤️🐟', fx: { aff: { teucer: 1 } }, go: 'end' },
          { t: 'See you soon, fish boy 😁 prepare to cry', fx: { aff: { teucer: 1 } }, go: 'end' },
          { t: '[Leave on read]', silent: true, go: 'end' },
        ] },
      ],
      end: [free('teucer')],
      exp: [free('teucer')],
    },
  });

  // ════════════════════════════════════════════════════════════════
  // ANY CHAPTER — reactions to app acts and to suspicion
  // ════════════════════════════════════════════════════════════════

  /** hold a reaction until the kids are off the plane (Teucer's watch is in airplane mode) */
  const afterLanding = (next) => [{ if: (s) => !!F(s).kids_landed || s.now >= at('+1 07:45'), go: next }, { wait: 8 }, { go: 'start' }];

  // ── A toy from Feiyun Market ─────────────────────────────────────
  rule({
    id: 'fam_toy', act: 'purchase', match: (p) => /^toy_/.test(idOf(p)),
    fx: (p) => ({ set: { gift_teucer: true, gift_toy: idOf(p) } }),
    start: 'fam_toy_bought', delay: 10,
  });
  scene({
    id: 'fam_toy_bought', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('lockit'),
      lockit: waitFor('teucer', 'go', 'lockit'),
      go: [
        lock('teucer'),
        say('teucer', 'teucer', (s) => 'A BOX CAME TO THE ' + bedName(s) + ' WITH MY NAME ON IT'),
        { if: (s) => /fang/i.test(String(F(s).gift_toy || '')), go: 'fang' },
        { if: (s) => /fortress/i.test(String(F(s).gift_toy || '')) || !F(s).gift_toy, go: 'fort' },
        { m: 'IT IS A GLACIER GUARDIAN!!!!!!!!' },
        { go: 'react' },
      ],
      fort: [
        { m: 'IT IS THE FROST FORTRESS', img: 'mk_frost_fortress' },
        { m: 'THE DRAWBRIDGE WORKS' },
        { m: 'BROTHER', d: 0.4 },
        { m: 'BROTHER', d: 0.4 },
        { m: 'BROTHER', d: 0.4 },
        { m: '', voice: { dur: 11, text: '(Pure screaming, then:) “IT HAS A DUNGEON! A REAL DUNGEON! Tonia, LOOK, the drawbridge— (clank) —IT WORKS!”' } },
        { m: "He hasn't let go of it. I think he's going to sleep inside it.", th: 'tonia', from: 'tonia' },
        { go: 'react' },
      ],
      fang: [
        { m: 'THERE IS A GIANT SIR FANG', img: 'mk_sirfang' },
        { m: 'he is Sir Fang\'s DAD' },
        { m: 'his name is LORD FANG' },
        { m: 'Sir Fang is a little bit jealous. i told him he is still the FIRST wolf' },
        { go: 'react' },
      ],
      react: [
        { if: (s) => F(s).toy_promised, go: 'kept' },
        { go: 'ask' },
      ],
      kept: [{ m: 'U SAID CONSIDER IT DONE' }, { m: 'AND IT WAS DONE' }, { go: 'ask' }],
      ask: [
        { choice: [
          { t: 'Straight off the line 😁 Little Masha wrapped it herself', fx: { aff: { teucer: 1 } }, go: 'elves' },
          { t: 'Happy early birthday, Teucer ❤️🐟', fx: { aff: { teucer: 1 } }, go: 'bday' },
          { t: 'It was on sale.', go: 'sale' },
        ] },
      ],
      elves: [{ m: 'TELL LITTLE MASHA THANK U' }, { m: 'the bow has GLITTER. i KNEW it was her' }, { go: 'end' }],
      bday: [{ m: 'my birthday is november 11' }, { m: 'so this is a VERY early birthday' }, { m: 'can i have another one on november 11' }, { go: 'end' }],
      sale: [{ m: 'ok' }, { m: 'i dont care. IT HAS A DUNGEON' }, { go: 'end' }],
      end: [free('teucer')],
    },
  });

  // ── Tonia's pen ──────────────────────────────────────────────────
  rule({ id: 'fam_pen', act: 'purchase', match: (p) => idOf(p) === 'pen_tonia', fx: { set: { gift_tonia: true } }, start: 'fam_pen_bought', delay: 10 });
  scene({
    id: 'fam_pen_bought', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('lockit'),
      lockit: waitFor('tonia', 'go', 'lockit'),
      go: [
        lock('tonia'),
        { m: 'A box came for me. SNEZHNAYA Atelier. Established 1801.' },
        { m: 'Ajax.' },
        { m: "It's the pen. The one I showed you in the catalogue two years ago and never mentioned again because it cost as much as a boat." },
        { m: 'You remembered.' },
        { m: "I'm going to write everything in my notebook with it now. Every lie you tell me. In beautiful handwriting." },
        { choice: [
          { t: 'Write something nice for once 😁', fx: { aff: { tonia: 1 } }, go: 'nice' },
          { t: 'Happy early birthday, detective 💧', fx: { aff: { tonia: 1 } }, go: 'bday' },
          { t: 'You deserve it.', go: 'deserve' },
        ] },
      ],
      nice: [{ m: 'Fine. First line: “My brother remembered the pen.”' }, { m: "That's nice. That's all you're getting." }, { go: 'end' }],
      bday: [{ m: 'My birthday is in March.' }, { m: "…Thank you, bratik." }, { go: 'end' }],
      deserve: [{ m: 'That\'s a very Mama thing to say.' }, { m: 'Thank you.' }, { go: 'end' }],
      end: [free('tonia')],
    },
  });

  // ── Reel Rush: the leaderboard tells Teucer everything ───────────
  rule({ id: 'fam_rr_win', act: 'game_score', match: (p) => Number(p.score) > 2047, fx: { set: { beat_teucer: true } }, start: 'fam_rr_won', delay: 8 });
  rule({
    id: 'fam_rr_loss', act: 'game_score',
    match: (p, s) => Number(p.score) > 0 && Number(p.score) <= 2047 && !s.flags.beat_teucer,
    fx: (p, s) => ((s.flags.rr_losses || 0) < 2 ? { inc: { rr_losses: 1 }, sus: { teucer: 1 } } : { inc: { rr_losses: 1 } }),
    start: 'fam_rr_lost', delay: 8,
  });
  scene({
    id: 'fam_rr_won', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('lockit'),
      lockit: waitFor('teucer', 'go', 'lockit'),
      go: [
        lock('teucer'),
        { m: 'WAIT', d: 0.5 },
        { m: 'the LEADERBOARD' },
        { m: 'U BEAT 2,047' },
        { m: 'U BEAT MY RECORD' },
        { m: '😭😭😭😭😭' },
        { m: '', voice: { dur: 10, text: '(Sniffling. Then a furious little laugh.) “Brother, Tonia says I have to say congratulations. CONGRATULATIONS. I’m going to beat you when I’m nine.”' } },
        { m: "He's not crying. He's “regrouping”.", th: 'tonia', from: 'tonia' },
        { m: 'teucer called me CRYING bc u beat his score lmaooo. legend behavior. no notes', th: 'anthon', from: 'anthon' },
        { choice: [
          { t: 'Told you, fish boy 😁🐟 rematch anytime', fx: { aff: { teucer: 1 } }, go: 'told' },
          { t: "You'll beat it someday. Not today though 😁⚔️", fx: { aff: { teucer: 1 } }, go: 'someday' },
          { t: '[Leave on read]', silent: true, go: 'end' },
        ] },
      ],
      told: [{ m: 'REMATCH' }, { m: 'REMATCH REMATCH REMATCH' }, { m: 'i am practising RIGHT NOW' }, { go: 'end' }],
      someday: [{ m: 'SOMEDAY IS SOON' }, { m: 'i am going to make a crown out of the cereal box AGAIN' }, { go: 'end' }],
      end: [free('teucer')],
    },
  });
  scene({
    id: 'fam_rr_lost', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('lockit'),
      lockit: waitFor('teucer', 'go', 'lockit'),
      go: [
        lock('teucer'),
        { if: (s) => s.flags.beat_teucer, go: 'end' },
        { m: 'brother' },
        { m: 'the leaderboard says u played' },
        { m: 'and u LOST' },
        { m: 'u NEVER lose. not at FISHING' },
        { m: 'r u sick?? did u hurt ur thumbs' },
        { m: 'Teucer says you lost at Reel Rush. Ajax, you once stayed on the ice for nine hours to catch one char because Papa said you couldn\'t.', th: 'tonia', from: 'tonia' },
        { fx: { sus: { tonia: 1 } } },
        { choice: [
          { t: "Liyue's air conditioning froze my thumbs 😤 rematch tonight. prepare to cry", fx: { aff: { teucer: 1 } }, go: 'excuse' },
          { t: "You're just better than me, Teucer.", fx: { sus: { teucer: 1 } }, go: 'better' },
        ] },
      ],
      excuse: [{ m: 'FROZEN THUMBS' }, { m: 'like the FISH TANK hahaha' }, { m: 'ok rematch. i am WAITING' }, { go: 'end' }],
      better: [{ m: '…' , d: 2 }, { m: 'u have NEVER said that' }, { m: 'not even when i was SMALL' }, { go: 'end' }],
      end: [free('teucer')],
    },
  });

  // ── The lullaby, shared from Voice Memos ─────────────────────────
  rule({
    id: 'fam_lullaby', act: 'memo_share',
    match: (p) => idOf(p) === 'memo_lullaby' && toTeucer(p.to) && p.via !== 'story',
    fx: (p) => ({ set: Object.assign({ lullaby_sent: true, lullaby_fresh: true }, String(p.to) === 'teucer' ? { lullaby_app: true } : {}) }),
  });
  rule({
    id: 'fam_lullaby_react', act: 'memo_share',
    match: (p, s) => idOf(p) === 'memo_lullaby' && toTeucer(p.to) && p.via !== 'story' && !s.flags.bedtime_waiting,
    start: 'fam_lullaby_heard', delay: 6,
  });
  scene({
    id: 'fam_lullaby_heard', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('comp'),
      comp: [
        { if: (s) => !s.flags.lullaby_app, go: 'go' },
        { fx: { sus: { teucer: -1 }, set: { lullaby_app: false } } },
        { go: 'go' },
      ],
      go: [
        { fx: { set: { lullaby_fresh: false } } },
        { if: (s) => { const h = new Date(s.now).getHours(); return h >= 21 || h < 6; }, go: 'night' },
        { m: 'BROTHER UR SINGING' },
        { m: 'u sound like a WHALE (a nice one)' },
        { m: 'tonia says u go FLAT on “sled”' },
        { m: 'i am going to play it 100 times' },
        { m: 'Ajax… you recorded the fish song. Your father has gone outside to look at the sea. There is no sea outside. There\'s snow.', th: 'mama', from: 'mama' },
        { go: 'end' },
      ],
      night: [
        { wait: 6 },
        { m: '', voice: { dur: 6, text: '(Whispering, half asleep:) “…it’s the real one… goodnight, brother… goodnight, Sir Fang…”' } },
        { m: 'He\'s asleep. You still go flat on “sled”.', th: 'tonia', from: 'tonia' },
      ],
      end: [],
    },
  });

  // ── Money at strange hours ───────────────────────────────────────
  rule({ id: 'fam_transfer_tonia', act: 'transfer', match: (p) => p.to === 'tonia', fx: (p) => ({ set: { tonia_money: Math.round(Number(p.amount) || 0) } }), start: 'fam_tonia_money', delay: 12 });
  rule({ id: 'fam_transfer_mama', act: 'transfer', match: (p) => p.to === 'mama', fx: (p) => ({ set: { mama_money: Math.round(Number(p.amount) || 0) } }), start: 'fam_mama_money', delay: 12 });
  scene({
    id: 'fam_tonia_money', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { if: (s) => night(s), go: 'night' },
        say('tonia', 'tonia', (s) => 'You just sent me ' + mora(s.flags.tonia_money || 0) + '. In the middle of the day. Without a word.'),
        { m: 'Is it a bribe? What am I not supposed to notice?' },
        { go: 'ask' },
      ],
      night: [
        say('tonia', 'tonia', (s) => 'Why did you send me money at ' + ((hourOf(s) % 12) || 12) + ' AM?'),
        say('tonia', 'tonia', (s) => mora(s.flags.tonia_money || 0) + ', Ajax. People send money in the middle of the night when they\'re saying goodbye.'),
        { m: 'Are you saying goodbye?' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'No!! it\'s for snacks 😁 Liyue snacks are expensive and Teucer eats like a seal', go: 'snacks' },
          { t: 'Buy yourself the pen. The one in the catalogue. You know the one 😁', fx: { aff: { tonia: 1 } }, go: 'pen' },
          { t: "It's for emergencies. Keep it. Just in case.", fx: { aff: { tonia: 1 }, sus: { tonia: 1 } }, go: 'case' },
        ] },
      ],
      snacks: [{ m: 'Teucer does eat like a seal.' }, { m: 'Okay. Snacks.' }, { go: 'end' }],
      pen: [{ m: '…You remember the pen.' }, { m: "I'm not buying it with your money. That's not how presents work. But thank you." }, { go: 'end' }],
      case: [{ m: 'In case of what, Ajax?' }, { typing: 4 }, { m: 'Never mind. I\'ll keep it. I\'ll keep it in the drawer with the letter.' }, { go: 'end' }],
      end: [free('tonia')],
    },
  });
  scene({
    id: 'fam_mama_money', thread: 'mama', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        say('mama', 'mama', (s) => 'My sun! ' + mora(s.flags.mama_money || 0) + ' just arrived' + (night(s) ? ', in the middle of the night,' : '') + ' and the toy commission isn\'t due until the 27th.'),
        { m: 'People only send money early when something is wrong. Is something wrong?' },
        { choice: [
          { t: 'Nothing\'s wrong, Mama!! big bonus 😁 buy Papa a net without holes', fx: { aff: { mama: 1 } }, go: 'bonus' },
          { t: 'Just in case, Mama. Put it in the jar.', fx: { sus: { mama: 1 } }, go: 'jar' },
          { t: 'Buy yourself a new coat. With a lining.', fx: { aff: { mama: 1 } }, go: 'coat' },
        ] },
      ],
      bonus: [{ m: 'A bonus! For the toys! My clever sun.' }, { m: 'Your father says the holes are where the small fish go.' }, { go: 'end' }],
      jar: [{ m: 'Just in case.' }, { m: '…All right, my sun. In the jar.' }, { m: 'I don\'t like the jar. The jar is for bad winters.' }, { go: 'end' }],
      coat: [{ m: 'I have a coat. It is a good coat.' }, { m: '…I will look at coats. Only look.' }, { go: 'end' }],
      end: [free('mama')],
    },
  });

  // ── Harbor Ride to the airport ───────────────────────────────────
  rule({
    id: 'fam_ride_airport', act: 'ride_book', match: (p) => p.to === 'airport',
    fx: (p, s) => (s.now >= JC.time.parse('+3 00:00') ? { set: { ride_monday: true } } : { set: { ride_kids: true } }),
    start: 'fam_ride_booked', delay: 6,
  });
  scene({
    id: 'fam_ride_booked', thread: 'tonia', trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => s.flags.ride_monday, go: 'monday' },
        { if: (s) => s.flags.kids_landed, go: 'end' },
        { go: 'w' },
      ],
      w: waitFor('tonia', 'go', 'w'),
      go: [
        lock('tonia'),
        { m: 'I see it, my sun! A Harbor Ride at arrivals. Your father says it\'s a very good taxi company. He has never been in a taxi.', th: 'mama', from: 'mama' },
        { if: (s) => s.flags.tonia_desk, go: 'desk' },
        { m: 'Mama says you booked us a car. Where do we wait?' },
        { choice: [
          { t: "At the information desk. Don't go with anyone else, Tonia. Anyone.", fx: { set: { tonia_desk: true }, aff: { tonia: 1 } }, go: 'ok' },
          { t: 'Just look for the sign with your name 😁', go: 'sign' },
        ] },
      ],
      desk: [{ m: "Mama says you booked us a car. We'll wait at the information desk. We won't go with anyone else." }, { go: 'free' }],
      ok: [{ m: 'Anyone. Okay.' }, { m: "You've never said “anyone” like that before." }, { go: 'free' }],
      sign: [{ m: 'Okay.' }, { go: 'free' }],
      free: [free('tonia')],
      monday: [
        { m: 'MR FANG IS TAKING US TO THE AIRPORT!!!!', th: 'teucer', from: 'teucer' },
        { m: 'You booked us the same driver. He remembered Teucer. Teucer remembered the air freshener.', th: 'tonia', from: 'tonia' },
      ],
      end: [],
    },
  });

  // ── Dottore's appointment deleted from the calendar ──────────────
  rule({ id: 'fam_dottore_cancel', act: 'event_delete', match: (p) => idOf(p) === 'ev_dottore', fx: { set: { dottore_cancelled: true } }, start: 'fam_dottore_gone', delay: 25 });
  scene({
    id: 'fam_dottore_gone', thread: 'mama', trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => !s.done.fam_dottore_call && !s.flags.dottore_seen, go: 'quiet' },
        { m: 'My sun, that Dr. Dottore\'s office telephoned. Teucer\'s check-up on Monday is cancelled. “By order of the Director,” they said. That\'s you!' },
        { m: 'Good. Teucer hates needles. He bit the last nurse.' },
      ],
      quiet: [],
    },
  });

  // ── The FaceTime camera (if the call screen turns it on) ─────────
  rule({
    id: 'fam_facetime_cam', act: 'facetime_cam',
    match: (p) => !!p.on && (!p.with || p.with === 'teucer'),
    fx: { set: { facetime_cam: true } },
    start: 'fam_ft_caught', delay: 3,
  });

  // ── The card freezes before the fortress arrives ─────────────────
  rule({ id: 'fam_card_frozen', act: 'card_freeze', match: (p, s) => !!p.on && !!s.flags.toy_promised && !s.flags.gift_teucer, start: 'fam_frozen', delay: 40 });
  scene({
    id: 'fam_frozen', thread: 'teucer', trigger: { on: 'manual' },
    nodes: {
      start: afterLanding('go'),
      go: [
        { m: 'brother' },
        { m: 'tonia says ur bank card is FROZEN' },
        { m: 'like the FISH TANK at ur factory 🧊🐟' },
        { m: 'does that mean the fortress is frozen too' },
      ],
    },
  });

  // ── Yelan keeps the kids (S2's deal) ─────────────────────────────
  scene({
    id: 'fam_yelan', thread: 'tonia',
    trigger: { on: 'flag', flag: 'yelan_protects_kids', delay: 60 },
    retry: true,
    when: (s) => !!s.flags.kids_landed || s.now >= JC.time.parse('+1 07:45'),
    nodes: {
      start: waitFor('tonia', 'go'),
      go: [
        lock('tonia'),
        { if: (s) => held(s), go: 'extract' },
        { m: 'Ajax. A woman sat in our lobby all night. Dark hair, a die hanging from one ear, a smile like she\'d already won something.' },
        { m: 'This morning she gave Teucer the die and taught him a game. Then she told me, “Your brother made a good deal.”' },
        { m: 'What deal, Ajax?' },
        { go: 'ask' },
      ],
      extract: [
        { fx: { set: { kids_rescued: true, rescue_by: 'yelan' } } },
        { m: 'Ajax. A woman walked into the suite and said, “Ministry of Civil Affairs, darlings. Pack light.”' },
        { m: 'She walked us out past Mr. Ivanov. He didn\'t even stand up. I think he forgot how.' },
        { m: 'She said, “Your brother made a good deal.” What deal, Ajax?' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'A deal to keep you safe. That\'s all you need to know.', fx: { aff: { tonia: 1 } }, go: 'safe' },
          { t: 'No idea 😁 Liyue is full of strange women with dice', go: 'dice' },
        ] },
      ],
      safe: [{ m: 'Okay.' }, { m: 'Thank you. Whatever it cost.' }, { go: 'end' }],
      dice: [{ m: 'She said you\'d say that. Word for word.' }, { m: 'Then she laughed.' }, { go: 'end' }],
      end: [free('tonia')],
    },
  });

  // ── Suspicion: Tonia phones Mama; Mama hears the gossip ──────────
  scene({
    id: 'fam_tonia_tells_mama', thread: 'mama', trigger: { on: 'manual' },
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        { fx: { set: { tonia_told_mama: true } } },
        { m: 'My sun.' },
        { m: 'Tonia telephoned me. She was crying, and Tonia does not cry. She cried at Grandmother\'s funeral and that was all.' },
        { m: 'She says you are “not you”. She says she has a notebook. Pages of it.' },
        { m: 'What does she mean, Ajax?' },
        { choice: [
          { t: "She's tired, Mama. Fifteen, far from home and tired. I'm me 😁", fx: { sus: { mama: 1 } }, go: 'tired' },
          { t: "I've been working too much. I'm sorry I scared her.", fx: { aff: { mama: 1 } }, go: 'sorry' },
          { t: "Mama… she's right. I'm not Ajax. I found his phone.", fx: { set: { told_truth: true } }, go: 'truth' },
        ] },
      ],
      tired: [{ m: 'Tired. Yes.' }, { m: 'She said you would say “tired”.' }, { go: 'end' }],
      sorry: [{ m: 'Then work less. And telephone your sister and let her hear your voice.' }, { m: '…Maybe not. She says your voice is the problem.' }, { go: 'end' }],
      truth: [{ m: '…' , d: 4 }, { m: 'Then please, find my son. Give him his telephone. Tell him to call his Mama.' }, free('mama'), { wait: 4 }, { ending: 'honest' }],
      end: [free('mama')],
    },
  });
  S.onSuspicion('tonia', 6, 'fam_tonia_tells_mama');

  scene({
    id: 'fam_mama_worry', thread: 'mama',
    trigger: { on: 'sus', who: 'mama', at: 3, delay: 20 },
    when: (s) => !s.flags.tonia_told_mama && !s.flags.told_truth,
    nodes: {
      start: waitFor('mama', 'go'),
      go: [
        lock('mama'),
        { if: (s) => (s.sus.tonia || 0) >= 1, go: 'tonia' },
        { if: (s) => (s.sus.anthon || 0) >= 1, go: 'anthon' },
        { m: 'My sun, you sound strange this weekend. A mother can tell, even in letters.' },
        { go: 'ask' },
      ],
      tonia: [
        { m: 'Tonia says you sound weird. Her word. Anthon says you text like a “substitute teacher”.' },
        { m: 'Your father says nothing, which means he agrees with them.' },
        { go: 'ask' },
      ],
      anthon: [{ m: 'Anthon showed me your message and laughed. I didn\'t laugh. He says you text like a “substitute teacher”.' }, { go: 'ask' }],
      ask: [
        { m: 'Is everything all right?' },
        { choice: [
          { t: 'I ate a sandwich 😁', fx: { aff: { mama: 1 }, sus: { mama: -1 } }, go: 'sandwich' },
          { t: "Everything's fine, Mama!! just tired. big project 😁", go: 'fine' },
          { t: 'Why does everyone keep asking me that?', fx: { sus: { mama: 1 } }, go: 'why' },
        ] },
      ],
      sandwich: [{ m: 'A sandwich is a plate with ideas.' }, { m: 'There you are. Eat something real.' }, { go: 'end' }],
      fine: [{ m: 'Big projects, big projects.' }, { m: 'Eat something.' }, { go: 'end' }],
      why: [{ m: 'Because we love you, my sun. That\'s what the asking is.' }, { go: 'end' }],
      end: [free('mama')],
    },
  });
})();
