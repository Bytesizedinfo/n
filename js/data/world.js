/* JC.world — every story-specific value the engine (js/core) reads. Loaded right after util.js, before state.js.
   Core never hard-codes names, places, passcodes or jokes: it reads them from here. See docs/DEV.md "World config".
   This is Childe's world. Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  /** does thread `tid` include contact `cid`? (safe before the story engine has loaded) */
  const hasMember = (tid, cid) => {
    if (!tid) return false;
    if (tid === cid) return true;
    try { return JC.story.members(tid).includes(cid); } catch (e) { return false; }
  };
  const idOf = (p) => (p && (p.id || p.art)) || '';
  const has = (s, k) => !!(s && s.flags && s.flags[k]);
  const mora = (n) => (n < 0 ? '−' : '') + 'ℳ' + Math.round(Math.abs(n)).toLocaleString('en-US');

  JC.world = {
    id: 'childe',
    storageKey: 'childephone.v1',
    start: '2026-10-16 23:47',
    introFallback: ['11:47 PM. Liyue Harbor.', 'A phone buzzes on the bench beside an abandoned fishing rod.'],
    endings: 24,

    device: {
      battery: 31,
      wallpaper: 'wp_harbor_night',
      owner: 'Childe',
      mirroring: 'Looking for Apple TV and AirPlay-compatible TVs…\n\nNo devices found. (You are standing on a pier.)',
      mdm: 'This iPhone is managed by Northland Bank Group. Contact Liyue Branch IT. (Ekaterina.)',
      files: 'iCloud Drive is managed by Northland Bank Group IT. Ask Ekaterina.',
      print: 'Make sure you’re on the same Wi-Fi network as a printer. (You’re on a pier. There is a fish.)',
      emergency: ['112', '110', '119', '120', '911', '999'],
    },

    passcode: {
      code: '110720',
      wrong: { tries: 2, thread: 'teucer', text: 'brother i know ur passcode!!! its ur number and ur birthday!! the summer one!! 🐟' },
      hints: ['', '', '', 'Scaramouche seemed very sure about this passcode.', 'His seat at the table, then his birthday. The Medical ID knows his birthday.', 'Eleven… and a birthday in summer. Emergency → Medical ID.', 'Medical ID: born 20 July. Eleven, then 07, then 20.', 'Try 11 · 07 · 20.'],
      hintLast: 'Try 11 · 07 · 20.',
      unavailHint: 'You read the lock screen again. “Your seat at the table, followed by your birthday.” Eleventh…',
    },

    medicalId: {
      name: 'Ajax (“Childe”)',
      age: '20 July 2004 (22 years)',
      rows: [
        ['Medical Conditions', 'Hydro Vision bearer — do not remove the pendant. Old injuries: left shoulder (2023), ribs (twice).'],
        ['Medical Notes', 'Resting heart rate rises after prolonged “Delusion” use. Do NOT refer to Dr. Dottore. — Ekaterina'],
        ['Allergies & Reactions', 'None. (Paperwork. — Ekaterina)'],
        ['Medications', 'None'],
        ['Blood Type', 'O−'],
        ['Organ Donor', 'Yes'],
        ['Height', '183 cm'],
        ['Weight', '71 kg'],
      ],
      contacts: [{ id: 'mama', rel: 'mother', fallback: 'Mama' }, { id: 'ekat', rel: 'assistant', fallback: 'Ekaterina' }],
    },

    contacts: {
      noReply: ['wangsheng', 'nbank', 'wanmin', 'ride', 'market', 'liyueair', 'capitano'],
      failSend: ['unknown'],
      /** Lost Mode's "Call" button and its default script when dialled (scenes may override with a dial script) */
      ownerLine: 'wangsheng',
      ownerLineCall: {
        nodes: {
          start: [
            { say: 'Wangsheng Funeral Parlor, Hu Tao speaking! How may we bury you today?' },
            { choice: [
              { t: '"Is Childe there?"', go: 'ask' },
              { t: 'Tell her you found Childe’s phone', go: 'truth' },
              { t: '(Hang up)', go: 'hang' },
            ] },
          ],
          ask: [
            { say: 'Childe? Never heard of him. There are definitely no tall ginger men in any of our coffins.' },
            { say: 'Especially not number four. Byeee~' },
            { fx: { set: { knows_hideout: true } } },
            { hangup: true },
          ],
          hang: [{ hangup: 'me' }],
          truth: [
            { if: (s) => s.flags.zl_contract, go: 'ally', else: 'caught' },
          ],
          ally: [
            { say: 'Ohhh, YOU’RE the phone person! Xiansheng told me. Hang in there~ and don’t let the fish one see you.' },
            { fx: { set: { ht_ally: true } } },
            { hangup: true },
          ],
          caught: [
            { say: 'Ooh. A stranger with a Harbinger’s phone. That’s either very brave or very dead.' },
            { say: 'Come by the parlor. We’re hiring.' },
            { fx: { set: { told_truth: true } } },
            { ending: 'wangsheng' },
          ],
        },
      },
      hello: { normal: 'Childe? You called? You never call. You text forty times instead.', emergency: 'Childe?? Why are you calling from your emergency screen??' },
    },

    confess: {
      re: /(i'?m not|i am not|this (is ?n['’]?t|is not)|not)\s+(childe|tartaglia|ajax|him|your (brother|boss|son|director)|ur (brother|boss|bro))|found (this|his|the|a|your|ur) (phone|iphone)|(this|his) phone (was|got) (lost|left|dropped)|lost (his|this) phone|i('?m| am) a stranger|i('?m| am) (just )?(the|a) (person|guy|girl) who found/i,
      endings: { ht: 'wangsheng', scara: 'caught_scara' },
      fallback: 'honest',
    },

    imgPools: { fish: 'fishReact' },

    /** Cross-app clue rules (scenes add their own onAct rules for arc-specific reactions) */
    acts: [
      // Harbor Ride
      { id: 'clue_shared_ride', act: 'ride_view', match: (p) => idOf(p) === 'ride_1016_2258', fx: { set: { clue_shared_ride: true } } },
      { id: 'ride_kids', arc: 'fam', act: 'ride_book', match: (p) => p.to === 'airport', fx: { set: { ride_kids: true } } },
      { id: 'reported_lost', act: 'ride_report_lost', fx: { set: { reported_lost: true } } },
      // Northland Bank / Mail: Osial money trail and the kids' trip
      { id: 'saw_wire', arc: 'osial', act: 'statement_view', match: (p) => idOf(p) === 'osial', fx: { set: { saw_wire: true } } },
      { id: 'saw_travel', arc: 'osial', act: ['statement_view', 'mail_open'], match: (p) => idOf(p) === 'travel' || idOf(p) === 'mail_travel', fx: { set: { saw_travel: true } } },
      { id: 'saw_protocol_pdf', arc: 'osial', act: 'attach_open', match: (p) => /osial/i.test(p.name || ''), fx: { set: { saw_protocol: true } } },
      { id: 'saw_protocol_web', arc: 'osial', act: 'visit', match: (p) => /intranet\.northland\.sn\/.*osial/i.test(p.url || ''), fx: { set: { saw_protocol: true } } },
      { id: 'clue_invoice', act: 'mail_open', match: (p) => idOf(p) === 'mail_invoice', fx: (p, s) => ({ set: Object.assign({ clue_invoice: true }, has(s, 'clue_archive') ? { knows_morax: true } : {}) }) },
      // Safari: the 1926 archive photo
      { id: 'clue_archive', act: 'visit', match: (p) => /archives\.ly\/.*1926/i.test(p.url || ''), fx: (p, s) => ({ set: Object.assign({ clue_archive: true }, has(s, 'clue_inscription') || has(s, 'clue_invoice') ? { knows_morax: true } : {}) }) },
      // Feiyun Market
      { id: 'bought_teaset', arc: 'zl', act: ['purchase', 'auction_won'], match: (p) => idOf(p) === 'lot_teaset', fx: { set: { bought_teaset: true } } },
      { id: 'teaset_lost', arc: 'zl', act: 'auction_lost', match: (p) => idOf(p) === 'lot_teaset', fx: { set: { teaset_lost: true } } },
      { id: 'clue_inscription', arc: 'zl', act: 'item_view', match: (p, s) => idOf(p) === 'lot_teaset' && has(s, 'bought_teaset'), fx: (p, s) => ({ set: Object.assign({ clue_inscription: true }, has(s, 'clue_archive') ? { knows_morax: true } : {}) }) },
      { id: 'lilies_sent', arc: 'zl', act: 'purchase', match: (p) => idOf(p) === 'lilies_wangsheng', fx: { set: { lilies_sent: true } } },
      { id: 'gift_teucer', arc: 'fam', act: 'purchase', match: (p) => /^toy_/.test(idOf(p)), fx: { set: { gift_teucer: true } } },
      { id: 'gift_tonia', arc: 'fam', act: 'purchase', match: (p) => idOf(p) === 'pen_tonia', fx: { set: { gift_tonia: true } } },
      // Wanmin Go: Paimon's appetite is everyone's problem
      { id: 'paimon_fed', arc: 'friends', act: 'order', match: (p) => p.to === 'paimon' || p.for === 'paimon', fx: (p) => ({ inc: { paimon_fed: 1, paimon_total: Math.round(p.total || 0) } }) },
      // Voice Memos
      { id: 'memo31_heard', arc: 'osial', act: 'memo_play', match: (p) => idOf(p) === 'memo31', fx: { set: { memo31_heard: true } } },
      { id: 'memo_zl_heard', arc: 'zl', act: 'memo_play', match: (p) => idOf(p) === 'memo_xiansheng', fx: { set: { memo_zl_heard: true } } },
      { id: 'memo_zl_sent', arc: 'zl', act: 'memo_share', match: (p) => idOf(p) === 'memo_xiansheng' && hasMember(p.to, 'zl'), fx: { set: { memo_zl_sent: true, memo_zl_heard: true } } },
      { id: 'lullaby_sent', arc: 'fam', act: 'memo_share', match: (p) => idOf(p) === 'memo_lullaby' && hasMember(p.to, 'teucer'), fx: { set: { lullaby_sent: true } } },
      { id: 'memo31_yelan', arc: 'osial', act: 'memo_share', match: (p) => idOf(p) === 'memo31' && hasMember(p.to, 'yelan'), fx: { set: { memo31_to_yelan: true, memo31_heard: true } } },
      // Find My
      { id: 'knows_hideout', arc: 'friends', act: 'findmy_sound', match: (p) => idOf(p) === 'airpods', fx: { set: { knows_hideout: true } } },
      { id: 'clue_unit3', arc: 'osial', act: 'findmy_view', match: (p) => idOf(p) === 'unit3', fx: { set: { clue_unit3: true } } },
      // Photos
      { id: 'clue_bluefin', act: 'photo_view', match: (p) => idOf(p) === 'p_bluefin', fx: { set: { clue_bluefin: true } } },
      { id: 'clue_abyss', arc: 'friends', act: 'photo_view', match: (p) => idOf(p) === 'p_abyss_map', fx: { set: { clue_abyss: true } } },
      // Notes
      { id: 'code_seen', arc: 'osial', act: ['note_unlock', 'note_open'], match: (p) => idOf(p) === 'n_osial', fx: { set: { code_seen: true } } },
      { id: 'ledger_read', arc: 'zl', act: ['note_unlock', 'note_open'], match: (p) => idOf(p) === 'n_ledger', fx: { set: { ledger_read: true } } },
      { id: 'clue_intranet', arc: 'osial', act: 'note_open', match: (p) => idOf(p) === 'n_logins', fx: { set: { clue_intranet: true } } },
      // Calendar
      { id: 'dottore_cancelled', arc: 'fam', act: 'event_delete', match: (p) => idOf(p) === 'ev_dottore', fx: { set: { dottore_cancelled: true } } },
      // Reel Rush — beating Teucer is in character
      { id: 'beat_teucer', arc: 'fam', act: 'game_score', match: (p) => p.score > 2047, fx: { set: { beat_teucer: true } } },
      // Settings
      { id: 'changed_passcode', act: 'setting', match: (p) => p.key === 'passcode', fx: { set: { changed_passcode: true } } },
    ],

    actVocab: [
      'open_app', 'unlock', 'open_thread', 'send', 'tapback', 'memo_play', 'memo_share', 'memo_delete',
      'photo_view', 'photo_fav', 'photo_delete', 'photo_taken', 'note_open', 'note_edit', 'note_unlock',
      'mail_open', 'mail_send', 'attach_open', 'event_open', 'event_add', 'event_delete', 'reminder_done',
      'alarm_set', 'sleep', 'visit', 'search', 'login', 'place_view', 'directions', 'share_loc',
      'findmy_view', 'findmy_sound', 'findmy_share', 'wallet_view', 'pass_view',
      'charge', 'decline', 'transfer', 'card_freeze', 'account_view', 'statement_view',
      'item_view', 'bid', 'purchase', 'auction_won', 'auction_lost', 'order',
      'ride_view', 'ride_book', 'ride_report_lost', 'game_score', 'game_catch',
      'post', 'like', 'comment', 'dm', 'story_view', 'voicemail_play', 'call_start', 'call_end', 'facetime_cam',
      'health_view', 'stock_view', 'weather_view', 'music_play', 'setting',
    ],

    gossip: [
      { from: 'scara', to: 'signora', share: 0.5 },
      { from: 'signora', to: 'pulci', share: 0.3 },
      { from: 'tonia', to: 'mama', share: 0.5 },
      { from: 'anthon', to: 'mama', share: 0.5 },
      { from: 'mama', to: 'pulci', share: 0.3 },
      { from: 'ht', to: 'zl', share: 0.5 },
      { from: 'paimon', to: 'lumine', share: 0.5 },
      { from: 'ekat', to: 'pyotr', share: 0.3 },
      { from: 'ekat', to: 'lyuba', share: 0.3 },
      { from: 'pantalone', to: 'signora', share: 0.3 },
    ],
    // groupShare left unset: the engine default (0.5) spreads group-chat slips to every member

    siri: {
      where: 'You’re near Pier 7, Liyue Harbor.',
      weather: 'It’s 18° and clear in Liyue Harbor. Rain is expected later this weekend.',
      owner: 'This iPhone belongs to Childe. You are not Childe.',
      joke: 'Why don’t Fatui agents play hide-and-seek? Good luck hiding from Signora. (Childe added this joke to my database.)',
      extra: [
        [/childe|tartaglia|ajax/, 'Childe is the owner of this iPhone. His Medical ID says he is allergic to paperwork.'],
        [/zhongli|xiansheng/, 'Zhongli is saved as “Xiansheng 🍵”. He has called this iPhone 112 times. He has never once paid for anything.'],
        [/osial/, 'I found a note called “Osial — read once”. It’s locked.'],
        [/fish/, 'Childe has caught 214 fish this year according to his notes. He has named nine of them after colleagues.'],
        [/sorry|thank/, 'You don’t need to apologize to me. But maybe to someone.'],
      ],
    },

    keyboard: {
      frequent: ['😁', '🐟', '💧', '⚔️', '🎣', '❤️', '😂', '😤', '🙄', '👍', '😭', '🔥', '😏', '🧸', '✨', '👀'],
      dict: 'fish fishing comrade xiansheng mora tea dinner rematch toys factory elves teucer tonia anthon mama papa zhongli lumine paimon hutao ekaterina signora scaramouche dottore pulcinella pantalone arlecchino xiangling beidou yelan ningguang liyue harbor snezhnaya morepesok northland wangsheng osial harbinger vision hydro bluefin pelmeni hotpot opera lanterns coffin ledger contract',
      completions: {
        zho: ['Zhongli', 'xiansheng', 'Zhongli-xiansheng'], xia: ['xiansheng', 'Xiangling', 'Xiao'], teu: ['Teucer', 'Teucer!!', 'Teucer 🐟'],
        ton: ['Tonia', 'tonight', 'Tonia…'], lum: ['Lumine', 'comrade', 'luminous'], pai: ['Paimon', 'Emergency Food', 'paid'],
        sig: ['Signora', 'signal', 'sign'], sca: ['Scaramouche', 'scary', 'scale'], com: ['comrade', 'come', 'coming'],
        fis: ['fish', 'fishing', 'fishes'], eka: ['Ekaterina', 'Ekaterina!', 'eka'], hut: ['Hu Tao', 'hut', 'hutao'],
        ree: ['Reel Rush', 'reel', 'really'], rem: ['rematch', 'remember', 'remind'], ele: ['Eleventh', 'elves', 'eleven'],
      },
    },

    apps: {
      names: {
        phone: 'Phone', messages: 'Messages', safari: 'Safari', music: 'Music', facetime: 'FaceTime', calendar: 'Calendar',
        photos: 'Photos', camera: 'Camera', mail: 'Mail', notes: 'Notes', reminders: 'Reminders', clock: 'Clock', maps: 'Maps',
        weather: 'Weather', wallet: 'Wallet', settings: 'Settings', wavelet: 'Ripple', lotuseats: 'Wanmin Go', swift: 'Harbor Ride',
        health: 'Health', findmy: 'Find My', voicememos: 'Voice Memos', stocks: 'Stocks', reelrush: 'Reel Rush', contacts: 'Contacts',
        calculator: 'Calculator', northland: 'Northland', feiyun: 'Feiyun Market',
      },
      home: {
        pages: [
          [{ widget: 'weather' }, { widget: 'calendar' }, 'facetime', 'calendar', 'photos', 'camera', 'mail', 'notes', 'reminders', 'clock', 'maps', 'weather', 'wallet', 'northland', 'wavelet', 'lotuseats', 'swift', 'feiyun'],
          [{ widget: 'memories' }, { widget: 'endings' }, 'findmy', 'voicememos', 'health', 'stocks', 'reelrush', 'settings', { folder: 'Utilities', apps: ['calculator', 'contacts'] }],
        ],
        dock: ['phone', 'messages', 'safari', 'music'],
        hidden: [],
      },
      library: [
        ['Suggestions', ['messages', 'phone', 'northland', 'voicememos', 'notes', 'findmy', 'feiyun', 'maps']],
        ['Social', ['messages', 'wavelet', 'facetime', 'phone', 'contacts']],
        ['Finance', ['northland', 'wallet', 'stocks']],
        ['Shopping & Food', ['feiyun', 'lotuseats']],
        ['Productivity', ['mail', 'notes', 'calendar', 'reminders']],
        ['Utilities', ['calculator', 'clock', 'settings', 'findmy', 'voicememos', 'contacts']],
        ['Travel', ['maps', 'swift', 'weather']],
        ['Creativity', ['photos', 'camera', 'music']],
        ['Health & Fitness', ['health']],
        ['Games', ['reelrush']],
        ['Information & Reading', ['safari', 'weather', 'stocks']],
      ],
      spotlightApps: ['messages', 'voicememos', 'northland', 'findmy', 'notes', 'feiyun', 'maps', 'reelrush'],
      quick: {
        messages: [{ text: 'New Message', icon: 'square.and.pencil', intent: { compose: {} } }, { text: 'Xiansheng 🍵', icon: 'person.crop.circle', intent: { thread: 'zl' } }, { text: 'Teucer 🐟', icon: 'person.crop.circle', intent: { thread: 'teucer' } }],
        maps: [{ text: 'Directions Home', icon: 'house.fill', intent: { directions: 'apartment' } }, { text: 'Share My Location', icon: 'location.fill', intent: { share: true } }],
      },
    },

    people: {
      share: ['zl', 'teucer', 'tonia', 'lumine', 'ht', 'ekat', 'paimon', 'mama'],
      spotlight: ['zl', 'teucer', 'lumine', 'ekat'],
    },

    widgets: {
      weather: { city: 'liyue', label: 'Liyue Harbor', fallback: { temp: 18, label: 'Clear', cond: 'clear', hi: 22, lo: 16, night: true } },
      lockEvent: { match: /LA 711|Teucer|Rite/, fallback: { title: 'LA 711 lands 🐟', when: 'Sat 07:40' } },
      calendar: [{ title: 'LA 711 lands 07:40 🐟', start: '+1 07:40', cal: 'family' }, { title: 'Yun Jin matinee (2 seats)', start: '+1 15:00', cal: 'home' }],
      memories: { art: 'p_siblings_snow', title: 'Morepesok, 2019', intent: { memory: 'morepesok-2019' } },
      note: { title: 'Things Teucer believes about my job' },
    },

    brand: {
      title: 'Childe’s Phone',
      tagline: 'You found it on a pier. Everyone thinks you’re him.',
      emblem: 'vision.hydro',
      replyAs: 'Reply as Childe',
      dictation: 'Dictation needs Childe’s voice',
      epilogue: 'When Childe got his phone back…',
      allFound: 'You found every ending. Childe says you’d make a terrifying Harbinger.',
      someFound: 'Every weekend can end differently. Rewind or start over to find them all.',
      restart: 'The weekend begins again on Pier 7. Endings you have found stay unlocked.',
      endingsHint: 'Find out how the weekend ends.',
    },

    money: { symbol: 'ℳ', fmt: mora },

    bank: {
      name: 'Northland Bank',
      main: 'nb',
      balance: 48260,
      cards: [{ id: 'nb', name: 'Northland Black', last: '1111', kind: 'debit' }],
      accounts: [
        { id: 'current', name: 'Personal Current', number: 'NB •••• 1111', main: true },
        { id: 'kids', name: 'Savings — for the kids', number: 'NB •••• 0720', balance: 312000, locked: true },
        { id: 'corp', name: 'Corporate — Special Collections (Liyue)', number: 'NB-C •••• 0011', balance: 41800000, viewOnly: true },
      ],
      sms: {
        thread: 'nbank',
        text: (kind, tx) => {
          const amt = mora(Math.abs(tx.amount));
          const d = new Date(tx.t);
          const when = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
          const who = String(tx.sms || tx.merchant).toUpperCase();
          if (kind === 'charge') return '[Northland Bank] Card ••1111: ' + amt + ' at ' + who + ', ' + when + '. Not you? Freeze your card in the Northland app.';
          if (kind === 'credit') return '[Northland Bank] Card ••1111: refund of ' + amt + ' from ' + who + ', ' + when + '.';
          if (kind === 'decline') return '[Northland Bank] Card ••1111: ' + amt + ' at ' + who + ' was declined (' + (tx.reason === 'frozen' ? 'card frozen' : 'insufficient funds') + ').';
          if (kind === 'transfer') return '[Northland Bank] Transfer of ' + amt + ' sent, ' + when + '.';
          return null;
        },
      },
    },

    test: {
      flags: ['clue_shared_ride', 'ride_kids', 'reported_lost', 'saw_wire', 'saw_travel', 'saw_protocol', 'clue_invoice', 'clue_archive',
        'clue_inscription', 'knows_morax', 'bought_teaset', 'teaset_lost', 'lilies_sent', 'gift_teucer', 'gift_tonia', 'paimon_fed', 'paimon_total',
        'memo31_heard', 'memo_zl_heard', 'memo_zl_sent', 'lullaby_sent', 'memo31_to_yelan', 'knows_hideout', 'clue_unit3', 'clue_bluefin',
        'clue_abyss', 'code_seen', 'ledger_read', 'clue_intranet', 'dottore_cancelled', 'beat_teucer', 'changed_passcode', 'card_frozen',
        'told_truth', 'unlocked'],
      actions: [
        { id: 'ride', p: 0.02, after: 10, not: ['minimal'], run: (T) => { T.act('ride_view', { id: 'ride_1016_2258' }); T.log('ride_view'); } },
        { id: 'teaset', p: 0.02, after: 20, not: ['minimal'], run: (T) => { T.act('purchase', { id: 'lot_teaset', total: 12000 }); T.log('teaset'); } },
        { id: 'toy', p: 0.015, after: 20, not: ['minimal'], run: (T) => { T.act('purchase', { id: 'toy_sirfang', total: 680 }); T.log('toy'); } },
        { id: 'lilies', p: 0.01, after: 40, only: ['nice', 'chaos'], run: (T) => { T.act('purchase', { id: 'lilies_wangsheng', total: 1288 }); T.log('lilies'); } },
        { id: 'wire', p: 0.015, after: 30, not: ['minimal'], run: (T) => { T.act('statement_view', { id: 'osial' }); T.log('wire'); } },
        { id: 'travel', p: 0.015, after: 30, not: ['minimal'], run: (T) => { T.act('statement_view', { id: 'travel' }); T.log('travel'); } },
        { id: 'pdf', p: 0.015, after: 30, not: ['minimal'], run: (T) => { T.act('attach_open', { name: 'osial_protocol.pdf' }); T.log('protocol'); } },
        { id: 'memo31', p: 0.01, after: 30, not: ['minimal'], run: (T) => { T.act('memo_play', { id: 'memo31' }); T.log('memo31'); } },
        { id: 'memo_zl', p: 0.012, after: 60, not: ['minimal'], run: (T) => { T.act('memo_play', { id: 'memo_xiansheng' }); T.log('memo_xiansheng'); if (T.rnd() < 0.6) { T.send('zl', { memo: 'memo_xiansheng' }); T.log('memo_xiansheng → zl'); } } },
        { id: 'lullaby', p: 0.01, after: 60, not: ['minimal'], run: (T) => { T.send('teucer', { memo: 'memo_lullaby' }); T.log('lullaby'); } },
        { id: 'airpods', p: 0.01, after: 40, not: ['minimal'], run: (T) => { T.act('findmy_sound', { id: 'airpods' }); T.log('airpods'); } },
        { id: 'archive', p: 0.01, after: 60, not: ['minimal'], run: (T) => { T.act('visit', { url: 'https://archives.ly/photos/1926-founding' }); T.log('archives'); } },
        { id: 'bluefin', p: 0.015, after: 20, not: ['minimal'], run: (T) => { T.act('photo_view', { id: 'p_bluefin' }); T.log('bluefin'); } },
        { id: 'abyss', p: 0.008, after: 60, only: ['chaos', 'nice'], run: (T) => { T.act('photo_view', { id: 'p_abyss_map' }); T.log('abyss map'); } },
        { id: 'code', p: 0.01, after: 60, not: ['minimal'], run: (T) => { T.act('note_unlock', { id: 'n_osial' }); T.log('osial note'); } },
        { id: 'dottore', p: 0.008, after: 60, not: ['minimal'], run: (T) => { T.act('event_delete', { id: 'ev_dottore' }); T.log('cancel dottore'); } },
        { id: 'freeze', p: 0.006, after: 80, not: ['minimal'], run: (T) => { try { JC.bank.freeze(true); } catch (e) { T.act('card_freeze', { on: true }); } T.log('freeze card'); } },
        { id: 'paimon', p: 0.01, after: 20, repeat: true, only: ['chaos'], run: (T) => { T.act('order', { rest: 'wanmin', to: 'paimon', total: 688 }); T.log('order for paimon'); } },
        { id: 'game', p: 0.01, after: 40, not: ['minimal'], run: (T) => { T.act('game_score', { score: 2100 + Math.round(T.rnd() * 400) }); T.log('reel rush'); } },
        { id: 'free', p: 0.004, only: ['chaos'], repeat: true, run: (T) => { T.send(T.pick(['zl', 'teucer', 'scara', 'lumine', 'ht', 'tonia']), { text: 'hello' }); T.log('free text'); } },
      ],
    },
  };
})();
