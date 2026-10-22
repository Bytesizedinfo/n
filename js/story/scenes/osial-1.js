/* Live scenes — Project Osial, chapters 1–3: Signora's demand, Ekaterina after the pier, Dottore's appointment,
   Scaramouche's bluefin quiz, the unknown number (Yelan), Pulcinella's kindness, Ekaterina in danger.
   Package S2. Facts: docs/STORY.md. Format: docs/DEV.md "Story engine". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  // ── shared helpers (S2) ──────────────────────────────────────────
  const F = (s) => s.flags || {};
  const sus = (s, id) => Number((s.sus && s.sus[id]) || 0);
  const held = (s, k, me) => {
    const o = F(s)['busy_' + k];
    if (!o || o === me) return false;
    if (typeof o === 'string') { const d = s.done || {}; if (!d[o] || d[o] === 'expired' || d[o] === 'skipped' || (s.fin && s.fin[o])) return false; }
    return true;
  };
  const waitFor = (k, me, next) => [{ if: (s) => !held(s, k, me), go: next }, { wait: 5 }, { go: 'start' }];
  const lock = (k, me) => ({ fx: { set: { ['busy_' + k]: me } } });
  const free = (k, me) => ({ run: (api) => { const f = api.state.flags; if (f['busy_' + k] === me) f['busy_' + k] = false; } });
  const alive = (s) => !F(s).deal_refused && !F(s).lost_mode && !F(s).finale;
  const night = (s) => s.chapter === 'fri_night' || s.chapter === 'sat_night' || s.chapter === 'sun_night';
  const scene = (def) => S.scene(Object.assign({ arc: 'osial' }, def));
  const idOf = (p) => String((p && (p.id || p.art)) || '');

  // the calendar invite Dottore planted (Calendar → "Dottore: blood work (bring T.)")
  S.onAct({ id: 's2_clue_dottore', act: 'event_open', arc: 'osial', match: (p) => idOf(p) === 'ev_dottore', fx: { set: { clue_dottore: true } } });

  // ── 1. Signora: "Your authorization" (ch1 +140 ≈ 00:01) ──────────
  scene({
    id: 'os_signora_1',
    thread: 'signora',
    ch: 'fri_night',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 140 },
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_signora_1', 'go'),
      go: [
        lock('signora', 'os_signora_1'),
        { m: 'Tartaglia.' },
        { m: 'You did not answer me. You always answer me, if only to be rude.' },
        { m: 'My people tell me you went swimming tonight. In October. How invigorating.' },
        { m: 'Your authorization, Tartaglia. By the time the founder\'s lanterns go out.' },
        { choice: [
          { t: "You'll get my answer when I feel like giving it.", fx: { set: { sig_tone: 'cold' } }, go: 'cold' },
          { t: 'Go to sleep, Signora. Even ice needs rest. 😁', fx: { set: { sig_tone: 'bold' } }, go: 'bold' },
          { t: "I'm sorry. I'll have it ready for you.", fx: { set: { sig_tone: 'meek' }, sus: { signora: 3 } }, go: 'meek' },
          { t: 'What authorization?', fx: { set: { sig_tone: 'lost' }, sus: { signora: 2 } }, go: 'what' },
          { t: '[Leave on read]', silent: true, fx: { set: { sig_tone: 'silent' } }, go: 'silent' },
        ] },
      ],
      cold: [
        { m: 'Then feel like it soon.' },
        { m: 'The Rite of Parting is on Sunday. When the last lantern goes out, I will ask you once, politely. The second time, I will not be asking you.' },
        free('signora', 'os_signora_1'),
      ],
      bold: [
        { m: 'Ice does not sleep, Tartaglia. It waits.' },
        { m: 'Sunday. When the lanterns go out.' },
        free('signora', 'os_signora_1'),
      ],
      meek: [
        { typing: 4 },
        { m: '…Sorry?' },
        { m: 'You have not apologised to me in two years. Not when you broke my window in Fontaine. Not when you set my coat on fire in Mondstadt.' },
        { m: 'Did the water get into your head?' },
        { m: 'Never mind. Sunday.' },
        free('signora', 'os_signora_1'),
      ],
      what: [
        { m: 'The authorization you signed. On every page. For the project you pitched, at one in the morning, in August.' },
        { m: 'If this is a joke, it is beneath even you.' },
        { m: 'If it is not a joke, it is very interesting.' },
        free('signora', 'os_signora_1'),
      ],
      silent: [
        { wait: 6 },
        { m: 'Silence. Good. You are learning.' },
        free('signora', 'os_signora_1'),
      ],
      x: [free('signora', 'os_signora_1')],
    },
  });

  // ── 2. Ekaterina, after the call that went dead (opening her thread, or ch1 +900) ──
  scene({
    id: 'ekat_1',
    thread: 'ekat',
    ch: 'fri_night',
    trigger: [{ on: 'open', thread: 'ekat', delay: 2 }, { on: 'chapter', ch: 'fri_night', delay: 900 }],
    expire: 'x',
    nodes: {
      start: waitFor('ekat', 'ekat_1', 'go'),
      go: [
        lock('ekat', 'ekat_1'),
        { m: 'Sir!', d: 0.6 },
        { m: 'Sir, you\'re reading. I can see that you\'re reading.' },
        { m: 'I called and we were talking and then the line went dead and I heard… I don\'t know what I heard. Water.' },
        { m: 'Are you hurt? Please just tell me you\'re not hurt.' },
        { choice: [
          { t: "Takes more than two of Signora's goons. 😁 I'm fine, Ekaterina.", fx: { set: { ekat_c1: 'fine' }, aff: { ekat: 1 } }, go: 'fine' },
          { t: 'I heard your warning. All of it. You saved my life tonight.', if: (s) => !!F(s).memo31_heard, fx: { set: { ekat_c1: 'memo' }, aff: { ekat: 2 } }, go: 'memo' },
          { t: 'Who were they? Tell me everything again, from the start.', fx: { set: { ekat_c1: 'who' }, sus: { ekat: 1 } }, go: 'who' },
          { t: "Don't go home tonight. Stay somewhere they don't know about.", fx: { set: { ekat_c1: 'warn', ekat_warned: true }, aff: { ekat: 1 } }, go: 'warn' },
          { t: '[Leave on read]', silent: true, fx: { set: { ekat_c1: 'read' }, sus: { ekat: 1 } }, go: 'read' },
        ] },
      ],
      fine: [
        { m: 'Thank God.' },
        { m: 'Sir, you always say that. You said it in Fontaine with a broken shoulder.' },
        { go: 'next' },
      ],
      memo: [
        { typing: 4 },
        { m: 'You… recorded it?' },
        { m: 'I didn\'t know you were recording.' },
        { m: 'Then you know everything I know. And you know I would do it again.' },
        { go: 'next' },
      ],
      who: [
        { m: 'Sir… you were there. You fought them.' },
        { typing: 3 },
        { m: 'All right. From the start.' },
        { m: 'Signora rewrote the Osial file this week. Your name is the only signature left. The countersignature says "removed". If the sea wakes, it is yours.' },
        { m: 'Tonight she sent two agents to Pier 7 to bring you to her. I heard at 23:20. I called you at 23:21. I was too slow.' },
        { m: 'Sir, are you sure you didn\'t hit your head?' },
        { go: 'next' },
      ],
      next: [
        { choice: [
          { t: 'Good. Normal day tomorrow. Front desk at eight.', fx: { set: { ekat_c2: 'normal' } }, go: 'normal' },
          { t: "Actually, Ekaterina, don't go home tonight. Stay somewhere they don't know about.", fx: { set: { ekat_c2: 'warn', ekat_warned: true }, aff: { ekat: 1 } }, go: 'warn' },
          { t: 'And Ekaterina, thank you.', fx: { set: { ekat_c2: 'thanks' }, aff: { ekat: 1 } }, go: 'thanks' },
        ] },
      ],
      normal: [
        { m: 'Yes, Sir. Front desk at eight.' },
        { m: 'The aquarium is apparently frozen again. I will deal with it at eight as well.' },
        free('ekat', 'ekat_1'),
      ],
      thanks: [
        { typing: 3 },
        { m: 'Sir. You never…' },
        { m: 'You\'re welcome.' },
        { m: 'Please go somewhere warm.' },
        free('ekat', 'ekat_1'),
      ],
      warn: [
        { m: 'Sir?' },
        { typing: 4 },
        { m: '…You think they will come for me.' },
        { m: 'I\'ll go to my aunt\'s in Qingce. I\'ll take the back stairs. I won\'t tell anyone where I am. Not even you.' },
        { m: 'Sir, the Osial note. If anything happens, I remember. You made me promise.' },
        free('ekat', 'ekat_1'),
      ],
      read: [
        { wait: 5 },
        { m: 'Sir?' },
        { wait: 4 },
        { m: 'All right. You\'re reading. That\'s enough. That is enough for tonight.' },
        free('ekat', 'ekat_1'),
      ],
      x: [free('ekat', 'ekat_1')],
    },
  });

  // ── 3. Dottore: "bring the boy Monday" (ch1 +1120 ≈ 01:39, after Childe's call; carries over if ch1 ends first) ──
  scene({
    id: 'dottore_1',
    thread: 'dottore',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 1120 },
    when: alive,
    nodes: {
      start: waitFor('dottore', 'dottore_1', 'go'),
      go: [
        lock('dottore', 'dottore_1'),
        { if: night, go: 'go_night' },
        { m: 'Good morning, Tartaglia. Did you sleep? You did not. I can tell. You type faster when you have not slept.' },
        { go: 'body' },
      ],
      go_night: [
        { m: 'Good evening, Tartaglia. Or good morning. Your sleep schedule is a crime against medicine.' },
        { go: 'body' },
      ],
      body: [
        { m: 'Your watch reported a heart rate of 168 at 23:24, followed by a hard fall. Then nothing. Then, a little later, your phone woke up again, as if nothing had happened.' },
        { m: 'Fascinating. I would like the readings. Your Delusion readings are three weeks overdue.' },
        { m: 'And bring the boy on Monday. Nine o\'clock. I have put it in your calendar.' },
        { fx: { set: { clue_dottore: true } } },
        { choice: [
          { t: 'Stay away from my brother.', fx: { set: { dottore_c1: 'warn' } }, go: 'warn' },
          { t: 'What boy?', fx: { set: { dottore_c1: 'what' }, sus: { dottore: 2 } }, go: 'whatboy' },
          { t: 'Sure. Nine works.', fx: { set: { dottore_c1: 'agree', dottore_agreed: true }, sus: { dottore: 3 } }, go: 'agree' },
          { t: '[Leave on read]', silent: true, fx: { set: { dottore_c1: 'read' } }, go: 'read' },
        ] },
      ],
      warn: [
        { m: 'I am only interested in a few millilitres, Tartaglia. You give more than that every time you lose a fight.' },
        { m: 'Which is never, of course. Which is why I need his.' },
        { m: 'Nine o\'clock.' },
        free('dottore', 'dottore_1'),
      ],
      whatboy: [
        { m: 'Teucer. Eight years old. Your brother. Ginger, a gap in the front teeth, an ice-wolf plush called Sir Fang.' },
        { m: 'How strange that I should know your brother better than you do tonight.' },
        { m: 'Is something wrong with your memory? I would love to examine it.' },
        free('dottore', 'dottore_1'),
      ],
      agree: [
        { typing: 5 },
        { m: '…' },
        { m: 'How wonderful. I did not expect you to say yes. I had prepared several other approaches.' },
        { m: 'I will put them away. Nine o\'clock. I will bring a lollipop. Children like lollipops, I am told.' },
        free('dottore', 'dottore_1'),
      ],
      read: [
        { wait: 6 },
        { m: 'Silence. The Knave says silence is also an answer. In my laboratory, silence is consent.' },
        free('dottore', 'dottore_1'),
      ],
    },
  });

  // ── 4. Scaramouche's bluefin quiz (ch1 +680 ≈ 00:55; carries over if ch1 ends first) ──
  const quizOpts = (dodge) => [
    { t: 'A bluefin. I named it after you. 🐟', if: (s) => !!F(s).clue_bluefin, fx: { set: { scara_quiz_ok: true } }, go: 'pass' },
    { t: 'A shark. Named it after your hat. 🦈', fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } }, go: 'fail1' },
    { t: 'A swordfish. Named it after Signora. ⚔️', fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } }, go: 'fail1' },
    { t: 'Something with your eyes. So it got your name. 😁', fx: { set: { scara_quiz_ok: true } }, go: 'pass' },
    { t: 'A tuna. Named it Lunch.', fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } }, go: 'fail1' },
    ...(dodge ? [{ t: 'You want another one this year? 😁', go: 'dodge' }] : []),
    { t: '[Leave on read]', silent: true, fx: { set: { scara_quiz_dodged: true }, sus: { scara: 2 } }, go: 'q1_read' },
  ];
  scene({
    id: 'scara_quiz',
    thread: 'scara',
    trigger: { on: 'chapter', ch: 'fri_night', delay: 680 },
    when: alive,
    nodes: {
      start: waitFor('scara', 'scara_quiz', 'go'),
      go: [
        lock('scara', 'scara_quiz'),
        { if: (s) => sus(s, 'scara') >= 2, go: 'sharp' },
        { if: night, go: 'go_night' },
        { m: "you're up early. you're never up early. you're up late, then you fish, then you're up early by accident" },
        { go: 'gossip' },
      ],
      go_night: [
        { m: "it's past midnight and you haven't sent me a single fish today" },
        { m: 'suspicious' },
        { go: 'gossip' },
      ],
      gossip: [
        { m: "signora says you're \"unavailable\". dottore says your heart did something funny. pantalone says your card went quiet" },
        { m: "everyone's talking about you. you'd love that. you're not bragging. why aren't you bragging" },
        { go: 'q1' },
      ],
      sharp: [
        { m: "you're being weird. don't deny it. i can smell weird through a phone" },
        { m: "and don't think i didn't notice the passcode thing. you unlocked it. so either you're an idiot or you're not you" },
        { go: 'q1' },
      ],
      q1: [
        { m: "quiz. if you're really the eleventh this is easy" },
        { m: 'what did you send me for my birthday. and what did you NAME it' },
        { choice: quizOpts(true), timeout: 120, onTimeout: 'q1_read' },
      ],
      dodge: [
        { m: 'if you send me another fish i will have YOU stuffed' },
        { m: 'answer the question, eleventh' },
        { choice: quizOpts(false), timeout: 90, onTimeout: 'q1_read' },
      ],
      pass: [
        { typing: 4 },
        { m: '…' },
        { m: 'fine' },
        { m: "it's you. unfortunately" },
        { m: "the carpet still smells, by the way. it's in pantalone's report under \"arson, justified\"" },
        free('scara', 'scara_quiz'),
      ],
      fail1: [
        { m: 'wrong' },
        { m: 'interesting. very, very interesting' },
        { m: 'one more. different question. you get exactly one more' },
        { m: "if you're really him, insult me. properly. the eleventh never misses" },
        { choice: [
          { t: "You're five foot nothing and the hat is doing all the work.", fx: { set: { scara_quiz_half: true } }, go: 'pass2' },
          { t: "You're the worst person I know, Sixth. Happy belated birthday. 🐟", fx: { set: { scara_quiz_half: true } }, go: 'pass2' },
          { t: "I'd rather not. It's late.", fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } }, go: 'fail2' },
          { t: 'Please, just leave me alone.', fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } }, go: 'fail2' },
        ], timeout: 90, onTimeout: 'fail2_silent' },
      ],
      pass2: [
        { m: '…' },
        { m: 'ok. that was him. that was horribly him' },
        { m: "you're still on thin ice. i'm writing everything down. every comma" },
        free('scara', 'scara_quiz'),
      ],
      fail2_silent: [
        { fx: { inc: { scara_quiz_fail: 1 }, sus: { scara: 3 } } },
        { m: 'silence. twice. that settles it' },
        { go: 'fail2' },
      ],
      fail2: [
        { m: 'oh this is PERFECT' },
        free('scara', 'scara_quiz'),
        { start: 'caught_scara', delay: 2 },
      ],
      q1_read: [
        { m: 'ignoring me. very you' },
        { m: "also very someone-who-doesn't-know-the-answer" },
        { m: "i'll ask again. i always ask again" },
        { fx: { set: { scara_quiz_dodged: true } } },
        free('scara', 'scara_quiz'),
      ],
    },
  });

  // ── 5. The unknown number (Yelan): "You type like someone who's never been punched." (ch2 +400) ──
  scene({
    id: 'yelan_1',
    thread: 'yelan',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 400 },
    when: alive,
    nodes: {
      start: waitFor('yelan', 'yelan_1', 'go'),
      go: [
        lock('yelan', 'yelan_1'),
        { fx: { set: { yelan_met: true } } },
        { m: 'Good morning, Tartaglia.' },
        { m: 'Or not-Tartaglia. I haven\'t decided.' },
        { m: 'You type like someone who\'s never been punched. 🎲' },
        { m: 'He types like someone who\'s been punched a great deal and enjoyed every single one.' },
        { choice: [
          { t: 'Come down to the pier and find out. 😁', fx: { set: { yelan_c1: 'bravado' } }, go: 'bravado' },
          { t: 'Who is this?', fx: { set: { yelan_c1: 'who' } }, go: 'who' },
          { t: 'Please leave me alone.', fx: { set: { yelan_c1: 'please' }, sus: { yelan: 2 } }, go: 'please' },
          { t: '[Leave on read]', silent: true, fx: { set: { yelan_c1: 'read' }, sus: { yelan: 1 } }, go: 'read' },
        ] },
      ],
      bravado: [
        { m: 'Ha. Better. Almost.' },
        { m: 'Here\'s a free one, since you made me smile.' },
        { go: 'hint' },
      ],
      who: [
        { m: 'You asked me that in September. Same words. Same question mark.' },
        { m: 'That\'s either very consistent or very well researched. 🎲' },
        { go: 'hint' },
      ],
      please: [
        { m: '"Please."' },
        { m: 'Oh, that\'s a tell. That\'s a whole hand of tells.' },
        { m: 'Keep the phone charged, stranger.' },
        { go: 'hint' },
      ],
      read: [
        { wait: 6 },
        { m: 'Silence is a tell too. 🎲' },
        { go: 'hint' },
      ],
      hint: [
        { m: 'Look at your bank\'s corporate account. There\'s a three-million-Mora wire scheduled for Sunday, 23:00.' },
        { m: 'Look at it. Then we\'ll talk.' },
        { fx: { set: { yelan_hint_wire: true } } },
        free('yelan', 'yelan_1'),
      ],
    },
  });

  // ── 6. Pulcinella has the children (after `fatui_pickup`, ch2 +250) ──
  scene({
    id: 'pulci_kids',
    thread: 'pulci',
    trigger: { on: 'chapter', ch: 'sat_dawn', delay: 250 },
    when: (s) => alive(s) && !!F(s).fatui_pickup && !F(s).kids_rescued,
    nodes: {
      start: waitFor('pulci', 'pulci_kids', 'go'),
      go: [
        lock('pulci', 'pulci_kids'),
        { fx: { set: { pulci_leverage: true } } },
        { m: 'Good morning, my boy!' },
        { m: 'My driver has collected the little ones. Such well-mannered children. Teucer asked whether I sell toys too. I said yes, of course. We all sell something.' },
        { m: 'They are settling in at the Grand. I have asked the staff to take very good care of them. Very good care.' },
        { m: 'You are busy this weekend, I know. Signora tells me you have paperwork. Do your paperwork, Ajax, and then come and see them.' },
        { choice: [
          { t: 'Bring them to me. Now.', fx: { set: { pulci_c: 'demand' } }, go: 'demand' },
          { t: 'If anything happens to them, Pulcinella—', fx: { set: { pulci_c: 'threat' } }, go: 'threat' },
          { t: 'Thank you for looking after them.', fx: { set: { pulci_c: 'thanks' }, sus: { pulci: 2 } }, go: 'thanks' },
          { t: '[Leave on read]', silent: true, fx: { set: { pulci_c: 'read' } }, go: 'read' },
        ] },
      ],
      demand: [
        { m: 'In good time, my boy. In good time.' },
        { m: 'When the paperwork is done.' },
        free('pulci', 'pulci_kids'),
      ],
      threat: [
        { m: 'Then you will have done as you were told, and nothing will happen to them at all.' },
        { m: 'You see how simple it is? You always did make things complicated.' },
        free('pulci', 'pulci_kids'),
      ],
      thanks: [
        { m: 'You\'re welcome, my boy.' },
        { m: 'You have never thanked me twice in one week. Is something the matter?' },
        free('pulci', 'pulci_kids'),
      ],
      read: [
        { wait: 5 },
        { m: 'I\'ll take that as gratitude. You never could say it.' },
        free('pulci', 'pulci_kids'),
      ],
    },
  });

  // someone took them out of the Grand (Lumine, Beidou, Arlecchino…)
  scene({
    id: 'pulci_rescued',
    thread: 'pulci',
    trigger: { on: 'flag', flag: 'kids_rescued', delay: 90 },
    when: (s) => alive(s) && !!F(s).fatui_pickup,
    nodes: {
      start: waitFor('pulci', 'pulci_rescued', 'go'),
      go: [
        lock('pulci', 'pulci_rescued'),
        { m: 'My boy. The little ones have checked out of the Grand. Early. Without a word to my staff.' },
        { m: 'How rude. Not you, of course. Whoever helped them. I will find out who. I always do.' },
        free('pulci', 'pulci_rescued'),
      ],
    },
  });

  // ── 7. "Your mother seems worried, my boy" (gossip reaches Pulcinella; or ch3 +650) ──
  scene({
    id: 'pulci_1',
    thread: 'pulci',
    trigger: [{ on: 'sus', who: 'mama', at: 2 }, { on: 'sus', who: 'tonia', at: 3 }, { on: 'sus', who: 'pulci', at: 2 }, { on: 'chapter', ch: 'sat_noon', delay: 650 }],
    when: (s) => alive(s) && ['sat_dawn', 'sat_noon', 'sat_night', 'sun_rite'].includes(s.chapter),
    retry: true,
    nodes: {
      start: waitFor('pulci', 'pulci_1', 'go'),
      go: [
        lock('pulci', 'pulci_1'),
        { if: (s) => sus(s, 'mama') >= 2 || sus(s, 'tonia') >= 3, go: 'worried' },
        { m: 'My boy! A little bird tells me the weekend is going well. Is it? I do hope so.' },
        { m: 'Your mother seems worried, though. Mothers always are. I told her Liyue is very safe this time of year. Apart from the sea.' },
        { go: 'ask' },
      ],
      worried: [
        { m: 'My boy. Your mother telephoned me today.' },
        { m: 'Your mother seems worried. She thinks you sound tired.' },
        { if: (s) => sus(s, 'tonia') >= 3, go: 'tonia' },
        { go: 'liar' },
      ],
      tonia: [
        { m: 'And Tonia told her you sound "like somebody else". Children say such things. I would hate for it to be true.' },
        { go: 'liar' },
      ],
      liar: [
        { m: 'I told her you are simply working hard. Don\'t make a liar of me, Ajax. I am too old to start.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: "I'm fine. Tell her to stop worrying.", fx: { set: { pulci_c1: 'fine' } }, go: 'fine' },
          { t: 'Stay away from my family, Pulcinella.', fx: { set: { pulci_c1: 'away' } }, go: 'away' },
          { t: 'Could you tell her I love her?', fx: { set: { pulci_c1: 'love' }, sus: { pulci: 1 } }, go: 'love' },
          { t: '[Leave on read]', silent: true, fx: { set: { pulci_c1: 'read' } }, go: 'read' },
        ] },
      ],
      fine: [
        { m: 'Of course you are. You always are. That is what I tell everyone.' },
        free('pulci', 'pulci_1'),
      ],
      away: [
        { m: 'Stay away? My boy, I am the mayor. I am the family\'s nearest neighbour. I am the one who brings the goose.' },
        { m: 'Where exactly would you like me to go?' },
        free('pulci', 'pulci_1'),
      ],
      love: [
        { m: 'Tell her yourself, Ajax. You have a phone.' },
        { m: 'Unless something is wrong with it?' },
        free('pulci', 'pulci_1'),
      ],
      read: [
        { wait: 5 },
        { m: 'I\'ll tell her you said hello. I always do.' },
        free('pulci', 'pulci_1'),
      ],
    },
  });

  // ── 8. Ekaterina in danger: the binder, the key, the protocol (ch3 +200 ≈ 15:00) ──
  const ekatChoice = (codeAsk) => ({ choice: [
    { t: "Take the weekend off. Go somewhere nobody knows. Don't tell me where.", if: (s) => !F(s).ekat_warned, fx: { set: { ekat_c3: 'go', ekat_warned: true }, aff: { ekat: 1 } }, go: 'leave' },
    { t: 'I listened to your warning again. You saved my life. Now save yours. Go.', if: (s) => !F(s).ekat_warned && !!F(s).memo31_heard, fx: { set: { ekat_c3: 'memo', ekat_warned: true }, aff: { ekat: 2 } }, go: 'go_memo' },
    { t: 'Stay at your desk. Act normal. I need eyes in that building.', if: (s) => !F(s).ekat_warned, fx: { set: { ekat_c3: 'inside', ekat_inside: true } }, go: 'inside' },
    { t: 'Good. Stay hidden. You did everything right.', if: (s) => !!F(s).ekat_warned, fx: { set: { ekat_c3: 'hidden' }, aff: { ekat: 1 } }, go: 'hidden' },
    ...(codeAsk ? [{ t: 'Ekaterina, the Osial code. Do you remember it?', if: (s) => !F(s).code_seen, fx: { set: { ekat_c3_code: true }, sus: { ekat: 2 } }, go: 'code' }] : []),
    { t: "You're overreacting, Ekaterina.", fx: { set: { ekat_c3: 'over' }, sus: { ekat: 2 }, aff: { ekat: -1 } }, go: 'over' },
  ] });
  scene({
    id: 'ekat_danger',
    thread: 'ekat',
    ch: 'sat_noon',
    trigger: { on: 'chapter', ch: 'sat_noon', delay: 200 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ekat', 'ekat_danger', 'go'),
      go: [
        lock('ekat', 'ekat_danger'),
        { if: (s) => !!F(s).ekat_warned, go: 'safe' },
        { m: 'Sir. I\'m in the stairwell. I can\'t talk long.' },
        { m: 'Two people from Signora\'s office came at noon with a locksmith. They opened your safe and took the Osial binder.' },
        { m: 'They asked who else has a key. I have a key, Sir.' },
        { m: 'They asked very politely. Twice.' },
        { go: 'brief' },
      ],
      safe: [
        { m: 'Sir. I\'m not at the branch. I did what you said.' },
        { m: 'Valentina says two people from Signora\'s office came at noon with a locksmith and took the Osial binder from your safe. They asked for me by name.' },
        { m: 'She told them I had a dentist appointment. In Qingce. On a Saturday. They wrote it down.' },
        { go: 'brief' },
      ],
      brief: [
        { if: (s) => !!F(s).ekat_pickup, go: 'pickup' },
        { go: 'brief2' },
      ],
      pickup: [
        { m: 'Teucer hugged me at arrivals this morning. He thinks I am the toy factory\'s secretary. I am keeping the sign.' },
        { go: 'brief2' },
      ],
      brief2: [
        { if: (s) => !!F(s).factory_bank, go: 'factory' },
        { go: 'brief3' },
      ],
      factory: [
        { m: 'I will still be there for Teucer\'s tour. Valentina is watching the door. Nothing will happen to him in that building. Not today.' },
        { go: 'brief3' },
      ],
      brief3: [
        { m: 'And Sir, Signora copied you on the final protocol. It\'s in your Mail. "Re: Osial — final". There is a PDF.' },
        { m: 'One more thing. Pantalone once told me, very proudly, that the Osial wire has a clause: if the signatory\'s card is frozen, the money cannot move. He thought it was funny. I didn\'t.' },
        { fx: { set: { knows_freeze_rule: true } } },
        { m: 'Please read the protocol. Then please tell me what to do.' },
        ekatChoice(true),
      ],
      code: [
        { typing: 4 },
        { m: 'Sir… you made me promise to remember. You never forget anything that matters.' },
        { m: 'OSL-0918-ΛΣ. The eighteenth of September. The day she made you sole signatory.' },
        { m: 'Sir, why are you asking me?' },
        { fx: { set: { code_seen: true } } },
        ekatChoice(false),
      ],
      leave: [
        { m: 'Yes, Sir.' },
        { m: 'I\'ll go now. The back stairs.' },
        { m: 'If they ask you where I am, you don\'t know. That will be true.' },
        free('ekat', 'ekat_danger'),
      ],
      go_memo: [
        { typing: 3 },
        { m: 'You listened to it again.' },
        { m: 'I\'m going. Thank you, Sir.' },
        free('ekat', 'ekat_danger'),
      ],
      inside: [
        { m: 'Yes, Sir. Head down, eyes open.' },
        { m: 'I am very good at being furniture.' },
        free('ekat', 'ekat_danger'),
      ],
      hidden: [
        { m: 'Thank you, Sir. I\'m at my aunt\'s. She is teaching me to make tea correctly. Apparently I have been doing it wrong for twenty-six years.' },
        free('ekat', 'ekat_danger'),
      ],
      over: [
        { typing: 4 },
        { m: '…Yes, Sir. Of course.' },
        { m: 'I\'m sorry. I\'ll go back to my desk.' },
        free('ekat', 'ekat_danger'),
      ],
      x: [free('ekat', 'ekat_danger')],
    },
  });
})();
