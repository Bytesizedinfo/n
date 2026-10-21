/* Live scenes — Lan Xichen (`lxc`): the balcony, tea at the Hanshi, the moon over Gusu, and Sunday.
   Cameos: Lan Qiren (`qr`), Tang Mei (`ea`). Facts: docs/STORY.md · Sunday: docs/SUNDAY.md, docs/sunday/c.md.
   Table flags set here: tea_yes, lxc_sunday (he asks, once tea is settled, whether he'd be welcome on Sunday),
   lxc_sunday_no, lxc_board (he offers to talk the Jin board out of moving A-Ling's party), qr_invited. */
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
        { m: 'I still have the white peony. The one you liked. (The tin that arrived from Yunmeng, by coincidence.)', img: 'p_tea_hanshi' },
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
        { if: (s) => F(s).burned && !F(s).burned_mended, go: 'roof' },
        { if: (s) => F(s).told_recipe, go: 'recipe' },
        { if: (s) => F(s).wwx_invited, go: 'yes_sunday' },
        { go: 'sky' },
      ],
      // Lan Wangji tells his brother things, in very few words
      roof: [
        { m: 'Wangji has gone up to the roof of the Jingshi with a blanket, and has not come down. I won\'t ask what happened.' },
        { m: 'But if there is anything you would like carried up there, I have very long arms.' },
        { go: 'sky' },
      ],
      yes_sunday: [
        { m: 'Wangji tells me you said yes to Sunday. He told me in three words, which for Wangji is a speech.' },
        { go: 'sky' },
      ],
      recipe: [
        { m: 'Wangji tells me Wei Wuxian is making soup at one in the morning, and crying into it. Apparently someone finally told him about the fire. 🙂' },
        { if: (s) => F(s).ops_keep, go: 'recipe_root' },
        { go: 'sky' },
      ],
      recipe_root: [
        { m: 'He also says twenty kilos of lotus root are coming from your warehouse. Wangji is clearing a shelf.' },
        { go: 'sky' },
      ],
      sky: [
        { m: 'The moon is very clear over Gusu tonight.', img: 'p_gusu_moon' },
        { m: 'You photographed it from the balcony, just before I said what I said. I saw you do it.' },
        { m: 'This is the same moon, from the other side. That is all. I wanted you to have it.' },
        { choice: [
            { t: 'Same moon.', label: '[Send him your balcony photo]', silent: true, if: (s) => !F(s).moon_sent, go: 'photo' },
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
        { if: (s) => F(s).lxc_sunday, go: 'until_sun' },
        { go: 'until2' },
      ],
      until_sun: [
        { m: 'And then, it seems, until Sunday. Twice in one weekend. I may have to sit down.' },
        { go: 'until2' },
      ],
      until2: [
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
        { if: (s) => !!F(s).xichen_draft_sent, go: 'xichen_twice' },
        { m: "You've never called me that before." },
        { m: 'I find I like it very much.' },
        { go: 'done' },
      ],
      // the player already sent him the locked "Xichen —" note (react-life.js)
      xichen_twice: [
        { m: 'Twice tonight. Once in writing.' },
        { m: 'I find I like it very much.' },
        { go: 'done' },
      ],
      done: [{ fx: { set: { lxc_done: true } } }, free('lxc')],
    },
  });

  // ── 3. Sunday: once tea is settled, he asks whether he'd be welcome (cross-beat 11) ─────────
  // tea_yes can come from his invitation, the moon, the Calendar invite (react-life.js) or the morning call.
  scene({
    id: 'lxc_sunday_ask',
    thread: 'lxc',
    trigger: { on: 'flag', flag: 'tea_yes', delay: 200 },
    when: night,
    nodes: {
      start: waitFor('lxc', 'ask'),
      ask: [
        lock('lxc'),
        { if: (s) => !!F(s).lxc_sunday, go: 'done' },
        { m: "Wanyin, may I ask one more thing, now that three o'clock is settled?" },
        { if: (s) => F(s).wwx_invited && !F(s).burned, go: 'ask_wwx' },
        { m: "Wangji tells me there's a dinner at Lotus Pier on Sunday. A-Ling's eighteenth." },
        { go: 'ask2' },
      ],
      ask_wwx: [
        { m: "Wangji tells me Wei Wuxian is going home on Sunday, for A-Ling's eighteenth. He told me in four words, which for Wangji is an oration." },
        { go: 'ask2' },
      ],
      ask2: [
        { m: "I've known A-Ling since he was small enough to sit on the Hanshi steps and refuse to take his shoes off." },
        { m: 'Would I be welcome? Please say no if it is a family evening. I would understand. I would send tea either way.' },
        { choice: [
            { t: 'Six-thirty. Lotus Pier.', fx: { set: { lxc_sunday: true }, aff: { lxc: 1 } }, go: 'yes' },
            { t: 'Bring the white peony.', fx: { set: { lxc_sunday: true }, aff: { lxc: 1 } }, go: 'peony' },
            { t: "It's family.", fx: { set: { lxc_sunday_no: true } }, go: 'family' },
            { t: 'Of course!! Everyone is welcome 🥰', fx: { set: { lxc_sunday: true }, sus: { lxc: 2 } }, go: 'gush' },
          ], timeout: 120, onTimeout: 'later' },
      ],
      yes: [
        { m: 'Six-thirty.' },
        { m: "Then I'll see you twice this weekend. I'm not sure I have prepared for that." },
        { fx: { log: 'Said yes to Lan Xichen at Sunday dinner', once: 'lxc_sunday', hint: 'Lan Xichen will be at the table.' } },
        { go: 'done' },
      ],
      peony: [
        { m: '🙂' },
        { m: 'I will bring the tin you sent me. It seems only fair that it should go home.' },
        { fx: { log: 'Asked Lan Xichen to bring the white peony on Sunday', once: 'lxc_sunday', hint: 'Lan Xichen will be at the table.' } },
        { go: 'done' },
      ],
      family: [
        { m: 'Of course.' },
        { m: 'Then I will come after dinner, if I may, with the tea, and leave before anyone has to be polite to me.' },
        { m: "Unless you'd rather I didn't. You can tell me at three." },
        { go: 'done' },
      ],
      gush: [
        { m: 'Everyone?' },
        { m: 'You once told Huaisang that a dinner for four was "a crowd". I will come anyway.' },
        { go: 'done' },
      ],
      later: [{ m: 'Forgive me. You can tell me at three.' }, { go: 'done' }],
      done: [free('lxc')],
    },
  });

  // ── 4. He hears about the party from Huaisang (cross-beat 12) ────────────────────────────
  // The scandal (Writer B: #KoiPondGate or Huaisang's balcony leak) makes the Jin board want a Koi Tower party.
  scene({
    id: 'lxc_scandal',
    thread: 'lxc',
    trigger: { on: 'flag', flag: 'scandal', delay: 100 },
    when: (s) => night(s) && !F(s).scandal_fixed,
    nodes: {
      start: waitFor('lxc', 'go'),
      go: [
        lock('lxc'),
        { if: (s) => !!F(s).scandal_fixed, go: 'done' },
        { m: 'Wanyin. Huaisang has sent me eleven messages in four minutes, which I have learned means something has happened.' },
        { if: (s) => F(s).scandal_kind === 'balcony', go: 'balcony' },
        { m: "He says the Jin board wants to move A-Ling's birthday to Koi Tower, because of the car. With a press wall." },
        { go: 'offer' },
      ],
      balcony: [
        { m: "He says the Jin board wants to move A-Ling's birthday to Koi Tower, because of the balcony. Because of me." },
        { m: 'I am so sorry. I said something true in the wrong place, and now it has become a seating problem for an eighteen-year-old.' },
        { go: 'offer' },
      ],
      offer: [
        { m: 'I chair the Lanling Charity Trust. Two of the Jin board sit on it. I could telephone Jin Zixun in the morning and ask him, very politely, whether a press wall is really how he would like to be remembered.' },
        { choice: [
            { t: 'Call him.', fx: { set: { lxc_board: true }, aff: { lxc: 1 } }, go: 'call' },
            { t: "I'll handle it.", go: 'handle' },
            { t: 'Stay out of it.', go: 'out' },
            { t: 'You would do that for me?? 🥺', fx: { set: { lxc_board: true }, sus: { lxc: 2 } }, go: 'call_gush' },
          ], timeout: 120, onTimeout: 'handle' },
      ],
      call: [
        { m: "At eight, then. Before he's had his coffee. People are kinder before their coffee; they haven't remembered who they are yet." },
        { fx: { log: 'Let Lan Xichen take on the Jin board for A-Ling’s birthday', once: 'lxc_board', hint: 'Lan Xichen will make a call.' } },
        { go: 'done' },
      ],
      call_gush: [
        { m: 'For you, and for A-Ling. And a little for myself. I have wanted to say something to Jin Zixun for years.' },
        { go: 'done' },
      ],
      handle: [{ m: 'Of course. If you change your mind, the offer keeps.' }, { go: 'done' }],
      out: [
        { m: "I will. I'm sorry. I'm told I have a habit of wanting to fix things for people who didn't ask." },
        { go: 'done' },
      ],
      done: [free('lxc')],
    },
  });

  // ── 5. Lan Qiren has no questions (~01:15): both nephews, one Yunmeng dinner (cross-beat 13) ─
  const both = (s) => !!(F(s).wwx_invited && !F(s).burned && (F(s).lxc_sunday || F(s).tea_yes));
  scene({
    id: 'qr_letter',
    thread: 'qr',
    trigger: { on: 'unlock', delay: 1250 },
    when: night,
    nodes: {
      start: [
        { m: 'Jiang Wanyin.' },
        { m: 'It has been brought to my attention by three separate members of the Academy board that you and my elder nephew were observed on a balcony this evening. I have no questions. I wish to have no questions.' },
        { if: both, go: 'both' },
        { if: (s) => F(s).wwx_invited && !F(s).burned, go: 'wangji' },
        { if: (s) => F(s).lxc_sunday || F(s).tea_yes, go: 'xichen' },
        { go: 'neither' },
      ],
      both: [
        { m: 'I am further informed that both of my nephews intend to leave Gusu on Sunday evening for a dinner in Yunmeng. Both. On the same evening. Wangji has packed five bowls. Xichen has packed tea.' },
        { m: 'In thirty-four years no member of this family has gone to Lotus Pier for a Sunday dinner. I have checked the records.' },
        { go: 'close' },
      ],
      wangji: [
        { m: 'I am further informed that my younger nephew intends to leave Gusu on Sunday evening for a dinner in Yunmeng, with his husband and a pot of soup, and that my elder nephew has begun asking about the trains.' },
        { go: 'close' },
      ],
      xichen: [
        { m: 'I am further informed that my elder nephew is going to Yunmeng this weekend, and that he has been walking about the Hanshi humming.' },
        { go: 'close' },
      ],
      neither: [
        { m: 'I note that my younger nephew has asked me twice this week whether Lotus Pier observes a curfew on Sundays. I did not ask why.' },
        { go: 'close' },
      ],
      close: [
        { m: 'The Hanshi observes a visiting curfew of 21:00. I trust Lotus Pier observes one also, and that my nephews will be returned to Gusu in the condition in which they left it.' },
        { m: '— Lan Qiren' },
        { choice: [
            { t: 'Noted.', go: 'noted' },
            { t: "It's one in the morning, Mr. Lan.", go: 'late' },
            { t: 'You could come too.', go: 'invite' },
            { t: 'Haha no worries Uncle Lan! 😊', fx: { sus: { qr: 4 } }, go: 'uncle' },
          ] },
      ],
      noted: [{ m: 'Good.' }, { m: '— Lan Qiren' }],
      late: [
        { m: 'I am aware of the hour. I have been unable to sleep since a board member described my nephew as "radiant".' },
        { m: '— Lan Qiren' },
      ],
      invite: [
        { fx: { set: { qr_invited: true } } },
        { typing: 6 },
        { m: 'I will be at the board dinner.' },
        { m: 'I will send something for the boy. He was polite to me once, in 2019. I believe it was an accident.' },
        { m: '— Lan Qiren' },
        { fx: { log: 'Invited Lan Qiren to Sunday dinner. He declined. He is sending cakes.', once: 'qr_invited' } },
      ],
      uncle: [
        { m: 'I am not your uncle.' },
        { m: 'I will inform the board that you have suffered a head injury.' },
        { m: '— Lan Qiren' },
      ],
    },
  });

  // ── 6. Tang Mei sees the calendar ────────────────────────────────
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
        { if: (s) => F(s).ops_keep, go: 'invoice' },
        { go: 'ask' },
      ],
      invoice: [
        { m: 'Also: Liu Qian has expensed twenty kilos of lotus root to a cost centre called "Sunday". I have approved it. I have seen the invoice. I have seen all the invoices.' },
        { go: 'ask' },
      ],
      ask: [
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
