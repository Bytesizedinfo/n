/* JC.world — every story-specific value the engine (js/core) reads. Loaded right after util.js, before state.js.
   Core never hard-codes names, places, passcodes or jokes: it reads them from here. See docs/DEV.md "World config".
   (These are still the previous game's values; the Childe world replaces them.) */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  /** does thread `tid` include contact `cid`? (safe before the story engine has loaded) */
  const hasMember = (tid, cid) => {
    if (!tid) return false;
    if (tid === cid) return true;
    try { return JC.story.members(tid).includes(cid); } catch (e) { return false; }
  };

  JC.world = {
    id: 'jc',
    /** localStorage key for the save game. Change it when the story changes so saves never collide. */
    storageKey: 'jcphone.v1',
    /** in-game start: 'YYYY-MM-DD HH:MM'. '+N HH:MM' times are relative to that day at 00:00. */
    start: '2026-10-16 23:47',
    /** prologue fallback when JC.story.intro is empty */
    introFallback: ['11:47 PM. Lanling.', 'A phone buzzes under your hand.'],
    /** number of endings shown before the ending defs have loaded (gallery / widget fallbacks) */
    endings: 13,

    device: {
      battery: 23, // starting battery %
      wallpaper: 'wp_lotus_dusk', // default wallpaper art id
      owner: 'Jiang Cheng',
      mirroring: 'Looking for Apple TV and AirPlay-compatible TVs…\n\nNo devices found. (The taxi does not have a TV.)',
      mdm: 'This iPhone is managed by Yunmeng Jiang Group. Contact your IT department. (Tang Mei.)',
      files: 'iCloud Drive is managed by Yunmeng Jiang Group IT. Ask Tang Mei.',
      print: 'Make sure you’re on the same Wi-Fi network as a printer. (You’re in a taxi.)',
      emergency: ['110', '120', '119', '112', '911', '999'],
    },

    passcode: {
      code: '181008',
      /** after `tries` wrong attempts (before the first unlock) a message arrives in `thread` */
      wrong: { tries: 2, thread: 'jl', text: "also i'm literally an adult on sunday so stop calling me a child" },
      /** hint shown under the dots, indexed by number of wrong tries (from 3) */
      hints: ['', '', '', 'Jiang Cheng’s nephew seemed very sure about this passcode.', 'A birthday, written DDMMYY. Whose birthday is on the lock screen?', 'A-Ling turns 18 on Sunday, October 18. Born 2008.', 'A-Ling turns 18 on Sunday, October 18. Born 2008.', 'Try 18 · 10 · 08.'],
      hintLast: 'Try 18 · 10 · 08.',
      unavailHint: 'You look at the lock screen again. A-Ling’s texts. A birthday on Sunday. DDMMYY.',
    },

    medicalId: {
      name: 'Jiang Cheng',
      age: '15 May 1992 (34 years)',
      rows: [
        ['Medical Conditions', 'Liver transplant recipient (2008).'],
        ['Medical Notes', 'Immunosuppressed. Do not give him alcohol. (He will not listen.) — A-Ling'],
        ['Allergies & Reactions', 'None. (Wei Wuxian. — A-Ling)'],
        ['Medications', 'Tacrolimus 2 mg, twice daily.'],
        ['Blood Type', 'O+'],
        ['Organ Donor', 'Yes'],
        ['Height', '183 cm'],
        ['Weight', '72 kg'],
      ],
      contacts: [{ id: 'ajie', rel: 'sister', fallback: 'A-Jie' }, { id: 'jl', rel: 'nephew', fallback: 'A-Ling' }],
    },

    contacts: {
      /** contacts that never reply (the composer is hidden, free texts get nothing back) */
      noReply: ['ajie', 'mom', 'dad', 'hq'],
      /** messages to these contacts always show "Not Delivered" */
      failSend: ['mom', 'dad', 'ajie'],
      /** the owner's office line: lost-mode "Call Owner" target and its scripted answer when dialled */
      ownerLine: 'hq',
      ownerLineCall: {
        nodes: {
          start: [{ say: 'Yunmeng Jiang Group, Lotus Pier night desk. How can I help you?' }, { choice: [
            { t: '"Wrong number. Sorry."', go: 'wrong' },
            { t: 'Tell them you found Mr. Jiang’s phone', go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] }],
          wrong: [{ say: 'No problem. Good night.' }, { hangup: true }],
          hang: [{ hangup: 'me' }],
          truth: [{ say: 'You found the boss’s phone? Oh, thank heavens. Please — stay right there, I’m writing everything down…' }, { fx: { set: { told_truth: true } } }, { ending: 'honest' }],
        },
      },
      /** what a contact says when "the owner" calls them (contact.hello overrides) */
      hello: { normal: 'Hello? Jiang Cheng?', emergency: 'Jiang Cheng? Why are you calling from your emergency screen??' },
    },

    /** confessing ("I'm not him, I found this phone") */
    confess: {
      re: /(i'?m not|i am not|this (is ?n['’]?t|is not)|not)\s+(jiang ?cheng|wanyin|him|your (uncle|brother|boss|jiujiu)|ur (uncle|jiujiu))|found (this|his|the|a|your) (phone|iphone)|(this|his) phone (was|got) (lost|left)|lost (his|this) phone|i('?m| am) a stranger|i('?m| am) (just )?(the|a) (person|guy|girl) who found/i,
      /** ending when you confess to a contact that has no confess_<id> scene */
      endings: { nhs: 'busted', wn: 'wen_ning' },
      fallback: 'honest',
    },

    /** art tag → flavour pool used when the player sends a photo carrying that tag (default pool: imgReact) */
    imgPools: { dog: 'dogReact' },

    /** JC.story.onAct rules registered at init (see docs/DEV.md "onAct") */
    acts: [
      { id: 'memo_heard', act: 'memo_play', match: (p) => p.id === 'memo14', fx: { set: { memo_heard: true } } },
      { id: 'memo_sent', act: 'memo_share', match: (p) => p.id === 'memo14' && hasMember(p.to, 'wwx'), fx: { set: { memo_sent: true } } },
      { id: 'ajie_read', act: 'open_thread', match: (p) => p.thread === 'ajie', fx: { set: { ajie_read: true } } },
      { id: 'ajie_wrote', act: 'send', match: (p) => hasMember(p.thread, 'ajie'), fx: { set: { ajie_wrote: true } } },
      { id: 'ajie_called', act: 'call_start', match: (p) => p.contact === 'ajie' && p.dir === 'out', fx: { set: { ajie_called: true } } },
      { id: 'beat_score', act: 'game_score', match: (p) => p.score > 1824, fx: { set: { beat_score: true } } },
      { id: 'changed_passcode', act: 'setting', match: (p) => p.key === 'passcode', fx: { set: { changed_passcode: true } } },
      { id: 'reported_lost', act: 'ride_report_lost', fx: { set: { reported_lost: true } } },
    ],
    /** acts the story may listen to (storytest warns about triggers/rules using anything else). Optional. */
    actVocab: null,
    /** suspicion that spreads along relationships: [{ from, to, share }] */
    gossip: [],
    /** share of suspicion raised in a group thread that every other member also gets (the old game had none) */
    groupShare: 0,

    siri: {
      where: 'You’re near Jinxing Road, Lanling.',
      weather: 'It’s 14° and raining in Lanling.',
      owner: 'This iPhone belongs to Jiang Cheng. You are not Jiang Cheng.',
      joke: 'Why did the radish blush? It saw the salad dressing. (Wei Wuxian added this joke to my database.)',
      /** extra question → answer pairs, checked in order */
      extra: [
        [/jiang cheng|wanyin/, 'Jiang Cheng is the owner of this iPhone. His Medical ID says he is allergic to Wei Wuxian.'],
        [/sorry|thank/, 'You don’t need to apologize to me. But maybe to someone.'],
      ],
    },

    keyboard: {
      frequent: ['😂', '🙄', '😤', '🙏', '😭', '❤️', '👍', '😒', '🪷', '🐶', '💜', '🔥', '😅', '🥺', '😡', '👀'],
      /** story words suggested by the QuickType bar (after the built-in common words) */
      dict: 'soup dinner car dog fairy lotus pier tea idiot ridiculous lanling yunmeng gusu jiujiu jin ling wei wuxian ying lan xichen zhan wangji huaisang wen ning sizhui jingyi hotpot bell pond koi tower hanshi board ops warehouse',
      /** first three letters → three suggestions */
      completions: { wei: ['Wei', 'Wei Wuxian', 'Wei Ying'], lan: ['Lan', 'Lan Xichen', 'Lan Zhan'], jin: ['Jin', 'Jin Ling', 'jiujiu'], xi: ['Xichen', 'Xi', 'xin'], ji: ['jiujiu', 'Jin Ling', 'just'], zew: ['Zewu-jun', 'Zewu', 'zero'], hua: ['Huaisang', 'hua', 'huh'], nie: ['Nie Huaisang', 'Nie', 'niece'], idi: ['idiot', 'idea', 'idle'], ri: ['ridiculous', 'right', 'ring'] },
    },

    apps: {
      /** app id → display name (wins over the name an app registers) */
      names: {
        phone: 'Phone', messages: 'Messages', safari: 'Safari', music: 'Music', facetime: 'FaceTime', calendar: 'Calendar',
        photos: 'Photos', camera: 'Camera', mail: 'Mail', notes: 'Notes', reminders: 'Reminders', clock: 'Clock', maps: 'Maps',
        weather: 'Weather', wallet: 'Wallet', settings: 'Settings', wavelet: 'Wavelet', lotuseats: 'Lotus Eats', swift: 'Swift Ride',
        health: 'Health', findmy: 'Find My', voicememos: 'Voice Memos', stocks: 'Stocks', lotusleap: 'Lotus Leap', contacts: 'Contacts',
        calculator: 'Calculator',
      },
      /** default home screen: pages of app ids, { widget } and { folder, apps }; dock; hidden */
      home: {
        pages: [
          [{ widget: 'weather' }, { widget: 'calendar' }, 'facetime', 'calendar', 'photos', 'camera', 'mail', 'notes', 'reminders', 'clock', 'maps', 'weather', 'wallet', 'settings', 'wavelet', 'lotuseats', 'swift', 'health'],
          [{ widget: 'memories' }, { widget: 'endings' }, 'findmy', 'voicememos', 'stocks', 'lotusleap', { folder: 'Utilities', apps: ['calculator', 'contacts'] }],
        ],
        dock: ['phone', 'messages', 'safari', 'music'],
        hidden: [],
      },
      /** App Library: [category, [app ids]] */
      library: [
        ['Suggestions', ['messages', 'phone', 'photos', 'voicememos', 'notes', 'findmy', 'wavelet', 'maps']],
        ['Social', ['messages', 'wavelet', 'facetime', 'phone', 'contacts']],
        ['Productivity & Finance', ['mail', 'notes', 'calendar', 'reminders', 'wallet', 'stocks']],
        ['Utilities', ['calculator', 'clock', 'settings', 'findmy', 'voicememos', 'contacts']],
        ['Travel', ['maps', 'swift', 'weather']],
        ['Food & Drink', ['lotuseats']],
        ['Creativity', ['photos', 'camera', 'music']],
        ['Health & Fitness', ['health']],
        ['Games', ['lotusleap']],
        ['Information & Reading', ['safari', 'weather', 'stocks']],
      ],
      /** Spotlight "Siri Suggestions" */
      spotlightApps: ['messages', 'voicememos', 'photos', 'findmy', 'notes', 'wavelet', 'maps', 'lotusleap'],
      /** home-screen quick actions (long-press an icon); a list here replaces the built-in one for that app */
      quick: {
        messages: [{ text: 'New Message', icon: 'square.and.pencil', intent: { compose: {} } }, { text: 'A-Ling', icon: 'person.crop.circle', intent: { thread: 'jl' } }, { text: '🐶 DO NOT ANSWER', icon: 'person.crop.circle', intent: { thread: 'wwx' } }],
        maps: [{ text: 'Directions Home', icon: 'house.fill', intent: { directions: 'lp-residence' } }, { text: 'Share My Location', icon: 'location.fill', intent: { share: true } }],
      },
    },

    people: {
      /** share-sheet contact row */
      share: ['jl', 'wwx', 'lxc', 'nhs', 'ea', 'huang', 'lwj', 'wn'],
      /** Spotlight "Contacts" when the query is empty */
      spotlight: ['jl', 'wwx', 'lxc', 'nhs'],
    },

    widgets: {
      weather: { city: 'lanling', label: 'Lanling', fallback: { temp: 14, label: 'Rain', cond: 'rain', hi: 17, lo: 11, night: true } },
      /** lock-screen "up next" widget: first upcoming event whose title matches `match`, else the next event, else `fallback` */
      lockEvent: { match: /A-Ling/, fallback: { title: 'A-Ling turns 18 🎂', when: 'Sun' } },
      /** calendar widget when there are no events */
      calendar: [{ title: 'A-Ling turns 18 🎂', start: '+2 00:00', allDay: true, cal: 'birthdays' }, { title: 'Tea? — Hanshi', start: '+1 15:00', cal: 'home' }],
      memories: { art: 'p_family_2007', title: 'Lotus Pier, 2007', intent: { memory: 'lotus-pier-2007' } },
      note: { title: 'Things I will not say to Wei Wuxian' },
    },

    brand: {
      title: 'Jiang Cheng’s Phone',
      tagline: 'You found it in a taxi. Everyone thinks you’re him.',
      emblem: 'lotus.fill', // JC.icon glyph used for the story (endings, Pay, Settings → Story)
      replyAs: 'Reply as Jiang Cheng',
      dictation: 'Dictation needs Jiang Cheng’s voice',
      epilogue: 'When Jiang Cheng got his phone back…',
      allFound: 'You found every ending. Jiang Cheng is impressed (he will never say so).',
      someFound: 'Each night can end differently. Rewind or start over to find them all.',
      restart: 'The night begins again in the taxi. Endings you have found stay unlocked.',
      endingsHint: 'Find out how the night ends.',
    },

    money: {
      symbol: '¥',
      /** format an amount; core falls back to symbol + 1,234.56 */
      fmt: null,
    },

    /** one bank balance shared by every app (JC.bank) */
    bank: {
      name: 'Yunmeng Commercial Bank',
      main: 'ycb', // card that draws on the main balance
      balance: 286450.32,
      cards: [{ id: 'ycb', name: 'YCB Black', last: '4417', kind: 'credit' }],
      accounts: [{ id: 'current', name: 'Current Account', number: '6222 •••• •••• 4417', main: true }, { id: 'savings', name: 'Savings', number: '6222 •••• •••• 0716', balance: 1280000 }],
      /** bank text messages: thread id and a formatter (return null for no SMS) */
      sms: {
        thread: 'bank',
        text: (kind, tx) => {
          const amt = JC.util.fmtMoney(Math.abs(tx.amount));
          const d = new Date(tx.t);
          const when = String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          const who = String(tx.sms || tx.merchant).toUpperCase();
          if (kind === 'charge') return '[Yunmeng Commercial Bank] Card ending 4417: ' + amt + ' spent at ' + who + ' on ' + when + '.';
          if (kind === 'credit') return '[Yunmeng Commercial Bank] Card ending 4417: refund of ' + amt + ' from ' + who + ' on ' + when + '.';
          if (kind === 'decline') return '[Yunmeng Commercial Bank] Card ending 4417: a payment of ' + amt + ' at ' + who + ' was declined (' + (tx.reason === 'frozen' ? 'card frozen' : 'insufficient funds') + ').';
          return null;
        },
      },
    },

    /** story tester hints (tools/storytest.js) */
    test: {
      /** flags set outside static scene fx (apps, engine) — so flag triggers on them aren't reported as never set */
      flags: ['memo_heard', 'memo_sent', 'ajie_read', 'ajie_wrote', 'beat_score', 'changed_passcode', 'reported_lost', 'told_truth', 'ajie_called'],
      /** optional actions the random playthroughs take: { id, p (chance per step), after (min step), only/not: [strategies], repeat, run(T) }
          T = { act(name, p), send(contactId, msg), rnd(), pick(arr), log(text) } */
      actions: [
        { id: 'memo', p: 0.02, after: 30, not: ['minimal'], run: (T) => { T.act('memo_play', { id: 'memo14' }); T.log('memo_play'); if (T.rnd() < 0.6) { T.send('wwx', { memo: 'memo14' }); T.log('memo_share'); } } },
        { id: 'ajie', p: 0.01, not: ['minimal'], run: (T) => { T.act('open_thread', { thread: 'ajie' }); T.log('open ajie'); } },
        { id: 'game', p: 0.01, only: ['chaos'], run: (T) => { T.act('game_score', { score: 2000 }); T.log('game 2000'); } },
        { id: 'free', p: 0.004, only: ['chaos'], repeat: true, run: (T) => { T.send(T.pick(['jl', 'wwx', 'nhs', 'lxc']), { text: 'hello' }); T.log('free text'); } },
      ],
    },
  };
})();
