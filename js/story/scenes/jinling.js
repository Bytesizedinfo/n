/* Live scenes — Jin Ling (`jl`): Sandu in the koi pond, Fairy, the birthday group `bday`, Lotus Leap.
   Facts: docs/STORY.md. */
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

  // ── 1. "jiujiu" ×3 — Sandu is in the koi pond (~00:03) ──────────
  S.scene({
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
        { m: 'i took sandu' },
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
        { m: 'ok. ok i can do that' },
        { m: "but the valet is like 60 and he gave fairy a biscuit" },
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
          ] },
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
        free('jl'),
      ],
    },
  });

  // ── 2. Fairy needs somewhere to sleep ────────────────────────────
  S.scene({
    id: 'jl_fairy',
    thread: 'jl',
    trigger: { on: 'scene', scene: 'jl_car', delay: 140 },
    when: night,
    nodes: {
      start: waitFor('jl', 'wet'),
      wet: [
        lock('jl'),
        { m: 'ok update' },
        { if: (s) => F(s).tow_huang || F(s).wn_asked, go: 'towing', else: 'still' },
      ],
      towing: [{ m: 'someone is coming for the car' }, { go: 'fairy' }],
      still: [{ m: 'the car is still in the pond. a koi lives in the exhaust now' }, { go: 'fairy' }],
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
        { fx: { set: { fairy_taken: true } } },
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
        { fx: { set: { fairy_taken: true } } },
        free('jl'),
        { start: 'fairy_meet' },
      ],
      done: [{ fx: { set: { fairy_ok: true } } }, free('jl')],
    },
  });

  // Fairy's New Favorite: a teenager in a tuxedo, a soaking wet dog, and you.
  S.scene({
    id: 'fairy_meet',
    thread: 'jl',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { wait: 30 },
        { m: 'here' },
        { m: 'where r u' },
        { wait: 10 },
        { m: 'wait' },
        { m: 'who r u' },
        { m: "why do u have jiujiu's phone. i can SEE it. it's the purple case" },
        { m: "fairy stop. FAIRY. she's licking u. she never licks anyone except jiujiu" },
        { wait: 5 },
        { ending: 'fairy' },
      ],
    },
  });

  // ── 3. The birthday group ────────────────────────────────────────
  S.scene({
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
        { if: (s) => F(s).car_known, go: 'pond', else: 'cake' },
      ],
      pond: [
        { m: 'is it true jin ling parked sandu in the koi pond 💀💀💀', from: 'jy' },
        { m: 'A little fish told me 🐟 hehe~', from: 'nhs' },
        { m: 'Is everyone all right? Sorry. Is the car all right? Sorry.', from: 'wn' },
        { go: 'cake' },
      ],
      cake: [
        { m: 'Cake first. The bakery on Peony Street can do lotus seed paste or chocolate.', from: 'sz', img: 'p_cake_lotus' },
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
        { m: "I'll put down lotus seed paste.", from: 'sz' },
        { fx: { set: { cake_ok: true } } },
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
        { m: 'Wei Ying. The vote is not decided by repetition.', from: 'lwj' },
        { m: 'it is in my heart', from: 'wwx' },
        { choice: [
            { t: 'Lotus Pier. He grew up there.', fx: { set: { venue_lp: true } }, go: 'venue_lp' },
            { t: "Koi Tower. It's his house.", go: 'venue_kt' },
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
        { m: 'oh', from: 'wwx' },
        { m: "ok. yeah. that's fair. it's his house", from: 'wwx' },
        { m: "Koi Tower, then. I'll ask the staff to keep the pond… clear.", from: 'sz' },
        { go: 'gift' },
      ],
      venue_party: [
        { m: '🎉??', from: 'wwx' },
        { m: 'mr jiang used the party popper 💀', from: 'jy' },
        { m: 'Screenshotted 👀', from: 'nhs' },
        { m: "I'll put down Lotus Pier. Jin Ling says it every year when he thinks no one is listening.", from: 'sz' },
        { fx: { set: { venue_lp: true } } },
        { go: 'gift' },
      ],
      gift: [
        { m: 'and what r u getting him jiang cheng', from: 'wwx' },
        { m: 'if u say "a watch" again i am leaving this chat', from: 'wwx' },
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
        { go: 'planned' },
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
        { go: 'planned' },
      ],
      together: [
        { m: 'jiang cheng wants a GROUP gift??', from: 'wwx' },
        { m: 'who are u and what have u done with my brother', from: 'wwx' },
        { m: 'A group card, then. And his own gift from you. I think you already know what it is.', from: 'sz' },
        { go: 'planned' },
      ],
      pick: [
        { m: '🙏??', from: 'wwx' },
        { m: 'jiang cheng does NOT pray', from: 'wwx' },
        { m: '…Mr. Jiang, are you all right?', from: 'sz' },
        { m: "I'll put down 'Mr. Jiang: to be confirmed'.", from: 'sz' },
        { go: 'planned' },
      ],
      planned: [
        { fx: { set: { bday_planned: true } } },
        { m: 'Wonderful. Cake, venue, gift. Thank you, everyone. Goodnight.', from: 'sz' },
        { m: 'wait i have one more thing', from: 'jy' },
        free('bday'),
        { start: 'bday_oops', delay: 4 },
      ],
    },
  });

  // Jingyi adds the wrong Jin.
  S.scene({
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

  // Jin Ling DMs, soft.
  S.scene({
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
      sleep: [{ m: 'ugh. ok' }, { go: 'wwx_q' }],
      yes: [
        { m: "i'll act SO surprised" },
        { m: "i'll cry. fake. fake cry" },
        { m: '…' },
        { m: 'thanks' },
        { go: 'wwx_q' },
      ],
      no: [{ m: 'liar' }, { m: "ur the worst liar in yunmeng. sizhui says so too" }, { go: 'wwx_q' }],
      little: [
        { m: 'LITTLE MAN??' },
        { m: "i'm 18 on sunday" },
        { m: "i'm blocking u. not really. but i'm thinking about it" },
        { go: 'wwx_q' },
      ],
      wwx_q: [
        { m: 'is wei wuxian coming' },
        { if: (s) => F(s).wwx_invited, go: 'coming', else: 'not_yet' },
      ],
      coming: [
        { choice: [
            { t: "He's bringing soup.", fx: { aff: { jl: 1 } }, go: 'soup' },
            { t: 'Yes.', go: 'soup' },
          ] },
      ],
      soup: [
        { m: "mom's soup?" },
        { m: 'the lotus root one' },
        { m: "i've never had it. only heard about it" },
        { m: '…' },
        { m: 'ok. goodnight jiujiu' },
        { go: 'end' },
      ],
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
        { fx: { set: { jl_wants_wwx: true } } },
        { go: 'end' },
      ],
      nope: [{ m: 'oh' }, { m: 'ok' }, { go: 'end' }],
      end: [free('jl')],
    },
  });

  // ── 4. Lotus Leap: someone beat 1824 ─────────────────────────────
  S.scene({
    id: 'jl_score',
    thread: 'jl',
    trigger: { on: 'act', act: 'game_score', match: (p) => !!p && Number(p.score) > 1824 },
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
        { m: "ok. it's on. i'm not sleeping tonight" },
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
  S.scene({
    id: 'jl_beep_fairy',
    thread: 'jl',
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
  S.scene({
    id: 'jl_beep_keys',
    thread: 'jl',
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
  S.scene({
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
        { go: 'more' },
      ],
      car_no: [
        { m: "i'm home. the car is still in the pond. fairy is asleep on my bed. she smells like pond" },
        { go: 'more' },
      ],
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
            { t: 'Happy birthday. In advance.', fx: { aff: { jl: 1 } }, go: 'bday' },
            { t: 'I love you so much, kiddo ❤️', fx: { sus: { jl: 4 } }, go: 'love' },
            { t: '[Leave him on read]', silent: true, go: 'read' },
          ] },
      ],
      brat: [{ m: 'ur the brat' }, { m: 'night jiujiu' }, { go: 'done' }],
      bday: [{ m: "it's not sunday yet old man" }, { m: '…' }, { m: 'thanks' }, { go: 'done' }],
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
