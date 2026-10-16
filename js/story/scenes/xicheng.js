/* Live scenes — Lan Xichen (`lxc`): the balcony, tea at the Hanshi, the moon over Gusu.
   Cameos: Lan Qiren (`qr`), Tang Mei (`ea`). Facts: docs/STORY.md. */
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

  const addTea = {
    add: {
      to: 'events',
      item: {
        id: 'ev_tea', cal: 'home', title: 'Tea — Hanshi', start: '+1 15:00', end: '+1 17:00',
        location: 'The Hanshi, Cloud Recesses', notes: 'White peony. 85°C. No sugar.',
      },
      notify: true,
    },
  };

  // ── 1. "Did you get home safely?" → the apology → the invitation ─
  scene({
    id: 'lxc_home',
    thread: 'lxc',
    trigger: { on: 'unlock', delay: 40 },
    when: night,
    nodes: {
      start: waitFor('lxc', 'reply'),
      // He is still waiting on his 23:31 message.
      reply: [
        lock('lxc'),
        { choice: [
            { t: "I'm at the hotel.", fx: { aff: { lxc: 1 } }, go: 'safe' },
            { t: "You didn't.", fx: { aff: { lxc: 1 } }, go: 'didnt' },
            { t: "Yes!! Don't worry about me 🙂", fx: { sus: { lxc: 2 } }, go: 'smile' },
            { t: '[Leave him on read]', silent: true, go: 'unread' },
          ] },
      ],
      safe: [
        { m: "Good. I'm glad." },
        { m: "I haven't slept either, if that is any comfort." },
        { go: 'apology' },
      ],
      didnt: [
        { m: "That's kind of you." },
        { m: "But you left so quickly that you didn't finish your tea. You always finish your tea." },
        { go: 'apology' },
      ],
      smile: [
        { m: '🙂' },
        { m: "I believe that one is mine. You're welcome to borrow it." },
        { m: "I'm glad you're safe." },
        { go: 'apology' },
      ],
      unread: [
        { wait: 60 },
        { m: "I'm sorry. It's late, and I'm keeping you." },
        { m: 'Sleep well, Wanyin.' },
        free('lxc'),
      ],

      apology: [
        { wait: 2 },
        { m: "I've been thinking about the balcony." },
        { m: "I shouldn't have said it like that. In public, after a year away, with half of Lanling pretending not to listen." },
        { m: "I'm sorry if I made you uncomfortable. That was never what I wanted." },
        { choice: [
            { t: 'Forget it.', go: 'forget' },
            { t: 'What did you mean.', fx: { aff: { lxc: 1 } }, go: 'meant' },
            { t: 'I panicked.', fx: { aff: { lxc: 2 } }, go: 'panicked' },
            { t: 'I missed you too.', fx: { aff: { lxc: 2 }, sus: { lxc: 1 } }, go: 'too' },
          ] },
      ],
      forget: [
        { m: 'If that is what you would like.' },
        { m: "I don't think I can, entirely. But I won't bring it up again unless you do." },
        { go: 'invite' },
      ],
      meant: [
        { m: 'Ah.' },
        { m: 'You asked without a question mark. That means you actually want to know.' },
        { m: 'During the year I was away, the messages I looked forward to were yours. Lotus seasons. The weather in Yunmeng. One very long complaint about a port authority.' },
        { m: "I read them all in order, the day I came out. I kept thinking: he didn't have to. Nobody asked him to." },
        { m: 'So when I said I missed you, I meant exactly that. I missed you.' },
        { choice: [
            { t: 'I know.', fx: { aff: { lxc: 1 } }, go: 'know' },
            { t: 'Someone had to tell you about the port authority.', fx: { aff: { lxc: 1 } }, go: 'port' },
            { t: 'Omg 😳😳', fx: { sus: { lxc: 2 } }, go: 'flustered' },
          ] },
      ],
      know: [{ m: '🙂' }, { go: 'invite' }],
      port: [
        { m: 'They sound dreadful.' },
        { m: 'I hoped every week that they would do something new, so that you would write again.' },
        { go: 'invite' },
      ],
      flustered: [
        { m: '…That is a great many faces, Wanyin.' },
        { m: "I think I've broken something. I'm sorry." },
        { go: 'invite' },
      ],
      panicked: [
        { m: 'Ah.' },
        { m: "I'm relieved, actually. I thought I had offended you." },
        { m: 'If it helps, I panicked too, afterwards. I went back inside and told Huaisang I needed some air. I was standing on a balcony at the time.' },
        { go: 'invite' },
      ],
      too: [
        { typing: 5 },
        { m: '…' },
        { m: 'Thank you for telling me.' },
        { m: "I don't think you have ever said something like that so quickly. I'll try very hard not to make you regret it." },
        { go: 'invite' },
      ],

      invite: [
        { wait: 2 },
        { m: 'On Wednesday I asked about Saturday, and you said "I\'ll see."' },
        { m: 'May I ask again, properly? You can still say no.' },
        { m: 'Would you come to tea tomorrow? At the Hanshi, at three.' },
        { m: 'I still have the white peony. The tin that came from Yunmeng by coincidence.', img: 'p_tea_hanshi' },
        { fx: { set: { lxc_invited: true } } },
        { choice: [
            { t: 'Three. Fine.', fx: { set: { tea_yes: true }, aff: { lxc: 1 } }, go: 'yes' },
            { t: "I'll be there.", fx: { set: { tea_yes: true }, aff: { lxc: 1 } }, go: 'yes' },
            { t: "Yes!! I'd love to 🙂🙂", fx: { set: { tea_yes: true }, sus: { lxc: 2 } }, go: 'yes_two' },
            { t: "I'm busy tomorrow.", go: 'busy' },
          ] },
      ],
      yes: [
        addTea,
        { m: 'Good.' },
        { m: "Then I'll have the water at eighty-five degrees at three." },
        { m: 'Goodnight, Wanyin.' },
        free('lxc'),
      ],
      yes_two: [
        addTea,
        { m: 'Two of them.' },
        { m: "I'm honored. Three o'clock, then." },
        free('lxc'),
      ],
      busy: [
        { m: 'Of course.' },
        { m: 'Another time, then. Whenever you like.' },
        { m: 'The tea keeps. So do I, apparently.' },
        free('lxc'),
      ],
    },
  });

  // ── 2. The moon over Gusu (~1 AM) ────────────────────────────────
  scene({
    id: 'lxc_moon',
    thread: 'lxc',
    trigger: { on: 'scene', scene: 'lxc_home', delay: 420 },
    when: night,
    nodes: {
      start: waitFor('lxc', 'moon'),
      moon: [
        lock('lxc'),
        { m: 'Forgive me. I know it is late.' },
        { m: 'The moon is very clear over Gusu tonight.', img: 'p_gusu_moon' },
        { m: 'You photographed it from the balcony, just before I said what I said. I saw you do it.' },
        { if: (s) => F(s).told_recipe, go: 'recipe' },
        { go: 'reply' },
      ],
      recipe: [
        { m: 'Also: Wangji says Wei Wuxian is making soup at one in the morning, and crying into it. Apparently someone finally told him about the fire. 🙂' },
        { go: 'reply' },
      ],
      reply: [
        { m: 'This is the same moon, from the other side. That is all. I wanted you to have it.' },
        { choice: [
            { t: 'Same moon.', label: '[Send him your balcony photo]', silent: true, go: 'photo' },
            { t: "It's one in the morning. Go to sleep.", fx: { aff: { lxc: 1 }, set: { moon_replied: true } }, go: 'sleep' },
            { t: "It's beautiful. Like you. 🌙✨", fx: { aff: { lxc: 1 }, sus: { lxc: 2 }, set: { moon_replied: true } }, go: 'gush' },
            { t: '[Leave him on read]', silent: true, go: 'unread' },
          ] },
      ],
      photo: [
        { me: 'Same moon.', img: 'p_balcony_moon' },
        { fx: { set: { moon_replied: true }, aff: { lxc: 2 } } },
        { typing: 4 },
        { m: '…That is my sleeve.' },
        { m: 'At the edge. You kept it in the frame.' },
        { m: '🙂' },
        { go: 'after' },
      ],
      sleep: [
        { m: 'You first.' },
        { m: "But yes. I'll go." },
        { go: 'after' },
      ],
      gush: [
        { m: 'Wanyin.' },
        { m: 'Is everything all right? You sound like someone reading a greeting card.' },
        { m: "…I'll keep it anyway." },
        { go: 'after' },
      ],
      unread: [{ wait: 20 }, { go: 'after' }],
      after: [
        { if: (s) => F(s).tea_yes, go: 'until' },
        { if: (s) => F(s).lxc_invited, go: 'stands', else: 'late_invite' },
      ],
      until: [
        { m: 'Until three, then.' },
        { choice: [
            { t: 'Goodnight, Xichen.', fx: { aff: { lxc: 1 }, set: { lxc_first_name: true } }, go: 'xichen' },
            { t: 'Goodnight.', go: 'done' },
            { t: '[Say nothing]', silent: true, go: 'done' },
          ] },
      ],
      stands: [
        { m: 'The invitation stands, by the way. Tomorrow, or any day you like.' },
        { choice: [
            { t: 'Three. Tomorrow.', fx: { set: { tea_yes: true }, aff: { lxc: 1 } }, go: 'late_yes' },
            { t: 'Goodnight, Xichen.', fx: { aff: { lxc: 1 }, set: { lxc_first_name: true } }, go: 'xichen' },
            { t: 'Goodnight.', go: 'done' },
          ] },
      ],
      late_invite: [
        { m: 'I meant to ask you something earlier, and lost my nerve.' },
        { m: 'On Wednesday you said "I\'ll see." Have you seen? Tea tomorrow, at the Hanshi, at three.' },
        { fx: { set: { lxc_invited: true } } },
        { choice: [
            { t: 'Three. Fine.', fx: { set: { tea_yes: true }, aff: { lxc: 1 } }, go: 'late_yes' },
            { t: 'Goodnight, Xichen.', fx: { aff: { lxc: 1 }, set: { lxc_first_name: true } }, go: 'xichen' },
            { t: "I'm busy.", go: 'done' },
          ] },
      ],
      late_yes: [
        addTea,
        { m: 'Good.' },
        { m: 'Eighty-five degrees, at three. Goodnight, Wanyin.' },
        { go: 'done' },
      ],
      xichen: [
        { typing: 6 },
        { m: '…Goodnight, Wanyin.' },
        { m: "You've never called me that before." },
        { m: 'I find I like it very much.' },
        { go: 'done' },
      ],
      done: [{ fx: { set: { lxc_done: true } } }, free('lxc')],
    },
  });

  // ── 3. Lan Qiren has no questions (~01:15) ───────────────────────
  scene({
    id: 'qr_letter',
    thread: 'qr',
    trigger: { on: 'unlock', delay: 1250 },
    when: night,
    nodes: {
      start: [
        { m: 'Jiang Wanyin.' },
        { m: 'It has been brought to my attention by three separate members of the Academy board that you and my elder nephew were observed on a balcony this evening.' },
        { m: 'I have no questions. I wish to have no questions. I write only to remind you that the Hanshi observes a visiting curfew of 21:00, which I expect to be respected.' },
        { m: '— Lan Qiren' },
        { choice: [
            { t: 'Noted.', go: 'noted' },
            { t: "It's one in the morning, Mr. Lan.", go: 'late' },
            { t: 'Haha no worries Uncle Lan! 😊', fx: { sus: { qr: 4 } }, go: 'uncle' },
          ] },
      ],
      noted: [{ m: 'Good.' }, { m: '— Lan Qiren' }],
      late: [
        { m: 'I am aware of the hour. I have been unable to sleep since a board member described my nephew as "radiant".' },
        { m: '— Lan Qiren' },
      ],
      uncle: [
        { m: 'I am not your uncle.' },
        { m: 'I will inform the board that you have suffered a head injury.' },
        { m: '— Lan Qiren' },
      ],
    },
  });

  // ── 4. Tang Mei sees the calendar ────────────────────────────────
  scene({
    id: 'ea_tea',
    thread: 'ea',
    trigger: { on: 'flag', flag: 'tea_yes', delay: 150 },
    when: night,
    nodes: {
      start: [
        { m: 'Your calendar just synced.' },
        { m: '"Tea — Hanshi", 15:00. No question mark.' },
        { if: (s) => F(s).car_known, go: 'car', else: 'nocar' },
      ],
      car: [
        { m: 'Sandu is, I am told, in a koi pond. I have booked you a car for 12:30.' },
        { go: 'coat' },
      ],
      nocar: [
        { m: 'Gusu is two hours by train. Leave by 12:30.' },
        { go: 'coat' },
      ],
      coat: [
        { m: 'Wear the grey coat. Not the purple one. You always wear the purple one.' },
        { m: 'Do not bring white peony. He still has the tin you had me send on the 25th.' },
        { m: 'For the record, I have kept your Saturday afternoons free since September. You never asked why.' },
        { choice: [
            { t: 'Noted.', go: 'noted' },
            { t: 'Why are you awake.', go: 'awake' },
            { t: 'OMG thank you, you are a lifesaver!! 💜', fx: { sus: { ea: 3 } }, go: 'omg' },
          ] },
      ],
      noted: [{ m: 'Noted that you said "Noted." Goodnight.' }],
      awake: [
        { m: 'Your calendar sends me notifications. You made that decision in 2019.' },
        { m: 'Goodnight.' },
      ],
      omg: [
        { m: '…' },
        { m: 'I am going to assume Lan Xichen has that effect on people.' },
        { m: 'Goodnight.' },
      ],
    },
  });
})();
