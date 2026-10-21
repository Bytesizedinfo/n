/* Contacts in Childe's phone. Facts: docs/STORY.md
   Extra fields used by apps:
   - voice: { f0, range, rate, breath, fs, rough?, robot? }  murmured call voice (js/apps/callui.js)
   - hint:  one line shown in Messages' suspicion card: how Childe talks to this person
   - videoArt: [artId…] backgrounds for FaceTime/calls, first existing one wins */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const list = [];
  const byId = {};

  const GRAY = ['#a5abb9', '#858994'];

  function def(c) {
    c.phones = c.phones || [];
    c.emails = c.emails || [];
    c.related = c.related || [];
    c.idle = c.idle || [];
    c.avatar = c.avatar || { initials: ((c.first || '')[0] || '') + ((c.last || '')[0] || ''), grad: GRAY };
    if (!c.display) c.display = [c.first, c.last].filter(Boolean).join(' ');
    list.push(c);
    byId[c.id] = c;
    return c;
  }

  JC.contacts = {
    def,
    get: (id) => (id === 'me' ? JC.me : byId[id] || null),
    all: () => list.slice(),
    people: () => list.filter((c) => !c.service),
    name: (id) => (id === 'me' ? JC.me.display : byId[id] ? byId[id].display : id),
    full: (id) => {
      if (id === 'me') return JC.me.real;
      const c = byId[id];
      return c ? c.real || [c.first, c.last].filter(Boolean).join(' ') || c.display : id;
    },
    real: (id) => (id === 'me' ? JC.me.real : (byId[id] && byId[id].real) || JC.contacts.full(id)),
    short: (id) => {
      if (id === 'me') return JC.me.display;
      const c = byId[id];
      if (!c) return id;
      return c.short || c.display.replace(/\s*\(.*\)$/, '').replace(/\s*[\u{1F300}-\u{1FAFF}☀-➿]+$/u, '');
    },
  };

  JC.me = {
    id: 'me', first: 'Ajax', last: '', real: 'Ajax', display: 'Childe', nick: 'Tartaglia',
    phones: [{ label: 'mobile', num: '(0761) 555 0111' }, { label: 'Snezhnaya', num: '+9 812 555 0720' }],
    emails: [{ label: 'work', addr: 'tartaglia@northland.sn' }, { label: 'home', addr: 'ajax.fishes@ripple.mail' }],
    bday: '2004-07-20', company: 'Northland Bank Group', title: 'Director, Special Collections (Liyue Branch)',
    address: 'Pier View Residences 2207, Liyue Harbor',
    avatar: { art: 'av_childe', initials: 'A', grad: ['#3aa0e6', '#1d5fa8'] },
    voice: { f0: 132, range: 1.25, rate: 1.12, breath: 0.18, fs: 1.02 },
    wavelet: 'tartaglia',
  };

  // ── Zhongli ──────────────────────────────────────────────────────
  def({
    id: 'zl', first: 'Zhongli', last: '', real: 'Zhongli', display: 'Xiansheng 🍵', short: 'Zhongli', nick: 'xiansheng',
    avatar: { art: 'av_zl', initials: 'Z', grad: ['#c99a4b', '#6b4a24'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0131' }, { label: 'Wangsheng', num: '(0761) 555 0144' }],
    emails: [{ label: 'work', addr: 'consultant@wangsheng.ly' }],
    bday: '1990-12-31', company: 'Wangsheng Funeral Parlor', title: 'Consultant',
    address: 'Lane of Stone Lions 6, Liyue Harbor',
    notes: 'Tea: no sugar, not too hot. Doesn’t like seafood with tentacles. Has never once had his wallet. Do NOT let him near the antiques stall unsupervised.',
    related: [{ label: 'dinner every week', id: 'me' }],
    color: '#a87b3a', fav: true, dial: 'answer',
    voicemail: 'You have reached Zhongli. I am presumably at the teahouse, or watching birds. Please leave a message and I will return your call at an appropriate hour.',
    voice: { f0: 96, range: 1.04, rate: 0.82, breath: 0.22, fs: 0.95 },
    hint: 'He notices everything: rhythm, punctuation, hesitation. Childe teases him about money and calls him "xiansheng". No semicolons.',
    videoArt: ['p_zl_teahouse', 'p_zl_pier', 'av_zl'],
  });

  // ── Family ───────────────────────────────────────────────────────
  def({
    id: 'teucer', first: 'Teucer', last: '', real: 'Teucer', display: 'Teucer 🐟', short: 'Teucer',
    avatar: { art: 'av_teucer', initials: 'T', grad: ['#ffd8a8', '#f08c00'] },
    phones: [{ label: 'kid’s watch', num: '+9 812 555 0718' }],
    bday: '2018-11-11', address: 'Fisherman’s Row 3, Morepesok',
    notes: 'Glacier Guardians: has Frost Knight, Snow Owl, NOT the Frost Fortress (Christmas?). Sir Fang must be in the bed or nobody sleeps. Allergic to nothing. Afraid of the dark (says he isn’t).',
    related: [{ label: 'brother', id: 'me' }], color: '#f08c00', fav: true, dial: 'answer',
    voicemail: 'HI IT’S TEUCER!!! leave a message!! unless ur a toy then— wait toys can’t talk. BYE!',
    voice: { f0: 300, range: 1.45, rate: 1.18, breath: 0.22, fs: 1.3 },
    hint: 'He thinks you sell toys. Big brother energy: excited, warm, lots of fish emoji, and lie about the toy factory beautifully.',
    videoArt: ['p_teucer_plane', 'p_teucer_sirfang', 'av_teucer'],
  });
  def({
    id: 'tonia', first: 'Tonia', last: '', real: 'Tonia', display: 'Tonia', short: 'Tonia',
    avatar: { art: 'av_tonia', initials: 'T', grad: ['#ffc9c9', '#e8590c'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0711' }],
    emails: [{ label: 'school', addr: 'tonia@morepesok-school.sn' }],
    bday: '2011-03-09', address: 'Fisherman’s Row 3, Morepesok',
    notes: 'Reads everything. Will find out. Likes fountain pens and detective novels.',
    related: [{ label: 'sister', id: 'me' }], color: '#e8590c', fav: false, dial: 'answer',
    voicemail: 'This is Tonia. If this is about homework, I’ve done it. If this is Ajax: call Mama.',
    voice: { f0: 228, range: 1.18, rate: 1.02, breath: 0.2, fs: 1.17 },
    hint: 'She is smarter than you want her to be. Childe is gentle with her and never quite answers the question.',
    videoArt: ['av_tonia'],
  });
  def({
    id: 'anthon', first: 'Anthon', last: '', real: 'Anthon', display: 'Anthon', short: 'Anthon',
    avatar: { art: 'av_anthon', initials: 'A', grad: ['#d3f9d8', '#2f9e44'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0714' }],
    bday: '2014-09-05', address: 'Fisherman’s Row 3, Morepesok',
    notes: 'Wants a gaming headset that “doesn’t sound like a fridge”. Snitches to Mama within 4 minutes.',
    related: [{ label: 'brother', id: 'me' }], color: '#2f9e44', dial: 'answer',
    voicemail: 'yo it’s anthon. i’m in a match. text me.',
    voice: { f0: 196, range: 1.32, rate: 1.2, breath: 0.18, fs: 1.12 },
    hint: 'Twelve and chaotic. Childe roasts him back. Anything you say reaches Mama.',
    videoArt: ['av_anthon'],
  });
  def({
    id: 'mama', first: 'Mama', last: '', real: 'Mama', display: 'Mama ❤️', short: 'Mama',
    avatar: { art: 'av_mama', initials: 'M', grad: ['#ffdeeb', '#d6336c'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0702' }, { label: 'home', num: '+9 812 555 0700' }],
    bday: '1976-02-14', address: 'Fisherman’s Row 3, Morepesok',
    notes: 'Pelmeni: pork + beef, a little ice water in the filling, pinch the edges twice. Call on Sundays.',
    related: [{ label: 'mother', id: 'me' }], color: '#d6336c', fav: true, dial: 'answer',
    voicemail: 'You’ve reached Mama. If you are my son: eat something. If you are not my son: hello, leave a message.',
    voice: { f0: 210, range: 1.12, rate: 0.96, breath: 0.24, fs: 1.12 },
    hint: 'Warm, worried, always asking if you’ve eaten. Childe is soft with her and never lets her worry.',
    videoArt: ['p_mama_pelmeni', 'av_mama'],
  });
  def({
    id: 'papa', first: 'Papa', last: '', real: 'Papa', display: 'Papa', short: 'Papa',
    avatar: { art: 'av_papa', initials: 'P', grad: ['#dee2e6', '#495057'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0703' }],
    bday: '1971-06-30', address: 'Fisherman’s Row 3, Morepesok',
    notes: 'Tells the story about the whale every New Year. Let him.',
    related: [{ label: 'father', id: 'me' }], color: '#495057', dial: 'voicemail',
    voicemail: 'This is the phone of a fisherman. I am on the water. Speak after the tone.',
    voice: { f0: 104, range: 1.08, rate: 0.84, breath: 0.32, fs: 0.96, rough: 1 },
    hint: 'Few words, a lot of feeling. He sent Ajax away at fourteen and hasn’t forgiven himself. Childe is respectful and a bit distant.',
    videoArt: ['p_papa_boat', 'av_papa'],
  });

  // ── Liyue ────────────────────────────────────────────────────────
  def({
    id: 'ht', first: 'Hu Tao', last: '', real: 'Hu Tao', display: 'Hu Tao 👻', short: 'Hu Tao',
    avatar: { art: 'av_ht', initials: 'HT', grad: ['#ffa8a8', '#a61e4d'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0177' }, { label: 'Wangsheng', num: '(0761) 555 0144' }],
    emails: [{ label: 'work', addr: 'director@wangsheng.ly' }],
    bday: '2007-07-15', company: 'Wangsheng Funeral Parlor', title: '77th Director',
    address: 'Wangsheng Funeral Parlor, Feiyun Slope',
    notes: 'Gave me a “VIP Client” card. I am not dead. She says that’s what they all say.',
    color: '#a61e4d', wavelet: 'wangsheng_hutao', dial: 'answer',
    voicemail: 'hi hi! you’ve reached hu tao of wangsheng funeral parlor~ if you’re alive, leave a message! if you’re not… wow, how?',
    voice: { f0: 238, range: 1.42, rate: 1.24, breath: 0.18, fs: 1.18 },
    hint: 'She sees through everyone. Match her chaos, insult her hat, never sound scared of coffins.',
    videoArt: ['p_wangsheng_door', 'av_ht'],
  });
  def({
    id: 'lumine', first: 'Lumine', last: '', real: 'Lumine', display: 'Lumine', short: 'Lumine',
    avatar: { art: 'av_lumine', initials: 'L', grad: ['#fff3bf', '#f59f00'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0122' }],
    emails: [{ label: 'guild', addr: 'traveler@adventurers-guild.ly' }],
    company: 'Adventurers’ Guild', title: 'Freelance (everything)',
    notes: 'Comrade. 14–13 to me. She says 14–14. She’s wrong. Promised her anything I find on the Abyss Order.',
    color: '#e8b600', wavelet: 'traveler.l', fav: true, dial: 'answer',
    voicemail: 'it’s lumine. leave a message. paimon, stop eating the phone.',
    voice: { f0: 214, range: 1.08, rate: 0.98, breath: 0.2, fs: 1.14 },
    hint: 'His favourite sparring partner. Call her "comrade", challenge her, tell her the truth about the Abyss when you can.',
    videoArt: ['p_hotpot_crew', 'av_lumine'],
  });
  def({
    id: 'paimon', first: 'Paimon', last: '', real: 'Paimon', display: 'Paimon (Emergency Food)', short: 'Paimon',
    avatar: { art: 'av_paimon', initials: 'P', grad: ['#e5dbff', '#5f3dc4'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0123' }],
    bday: '2000-06-01', notes: 'Owes me 31 meals. Will never pay. Do not open Wanmin Go when she is in the room.',
    color: '#5f3dc4', wavelet: 'emergencyfood', dial: 'answer',
    voicemail: 'THIS IS PAIMON!!! Paimon can’t come to the phone because Paimon is EATING. Leave food— a message!',
    voice: { f0: 300, range: 1.5, rate: 1.3, breath: 0.16, fs: 1.32 },
    hint: 'Loud, hungry, and she tells Lumine everything. Childe calls her Emergency Food and pays anyway.',
    videoArt: ['p_paimon_food', 'av_paimon'],
  });
  def({
    id: 'xl', first: 'Xiangling', last: '', real: 'Xiangling', display: 'Xiangling 🌶️', short: 'Xiangling',
    avatar: { art: 'av_xl', initials: 'X', grad: ['#ffe3e3', '#e03131'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0160' }, { label: 'Wanmin', num: '(0761) 555 0161' }],
    company: 'Wanmin Restaurant', title: 'Head Chef', address: 'Wanmin Restaurant, Chihu Rock',
    bday: '2006-11-02', notes: 'Wants Mama’s pelmeni recipe. Guoba likes me now (after the fish).',
    color: '#e03131', wavelet: 'wanmin_chef', dial: 'answer',
    voicemail: 'Wanmin Restaurant, Xiangling speaking— oh, it’s the machine. Leave a message! Unless it’s an order, then use Wanmin Go!',
    voice: { f0: 232, range: 1.3, rate: 1.2, breath: 0.2, fs: 1.17 },
    hint: 'Bright, food-obsessed, friendly. Childe brags about Snezhnayan cooking.',
    videoArt: ['p_wanmin_kitchen', 'av_xl'],
  });
  def({
    id: 'beidou', first: 'Beidou', last: '', real: 'Beidou', display: 'Beidou ⚓', short: 'Beidou',
    avatar: { art: 'av_beidou', initials: 'B', grad: ['#ffc9c9', '#862e2e'] },
    phones: [{ label: 'ship', num: '(0761) 555 0190' }],
    company: 'Crux Shipping', title: 'Captain, The Alcor', address: 'The Alcor, Crux Pier',
    bday: '1996-02-14', notes: 'Owes me a rematch (I owe her one, technically). Kazuha says hi.',
    color: '#862e2e', wavelet: 'crux.captain', dial: 'answer',
    voicemail: 'Beidou. If I didn’t pick up, I’m at sea or I’m winning a fight. Leave it at the tone, kid.',
    voice: { f0: 172, range: 1.2, rate: 1.04, breath: 0.24, fs: 1.06, rough: 1 },
    hint: 'She respects bravado. Childe never turns down a fight with her. Never.',
    videoArt: ['p_alcor_deck', 'av_beidou'],
  });
  def({
    id: 'yelan', first: 'Unknown', last: '', real: 'Yelan', display: '(0761) 555 0099', short: 'Unknown',
    avatar: { initials: '?', grad: ['#c3fae8', '#0b7285'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0099' }],
    notes: '', color: '#0b7285', dial: 'voicemail', unsaved: true, saveAs: 'Yelan',
    voicemail: 'The number you have dialed is not accepting calls. …Nice try.',
    voice: { f0: 196, range: 1.14, rate: 1.04, breath: 0.24, fs: 1.1 },
    hint: 'She plays dice with people. Bluff with confidence, or deal straight; nothing in between works.',
    videoArt: ['av_yelan'],
  });
  def({
    id: 'ning', first: 'Ningguang', last: '', real: 'Ningguang', display: 'Ningguang (Jade Chamber)', short: 'Ningguang',
    avatar: { art: 'av_ning', initials: 'N', grad: ['#fff9db', '#c9a227'] },
    phones: [{ label: 'office', num: '(0761) 555 0100' }],
    emails: [{ label: 'office', addr: 'tianquan@jadechamber.ly' }],
    company: 'Liyue Qixing', title: 'Tianquan', address: 'The Jade Chamber',
    bday: '1994-08-26', color: '#c9a227', dial: 'voicemail',
    voicemail: 'You have reached the office of the Tianquan. State your name, your business and its value.',
    voice: { f0: 188, range: 1.06, rate: 0.92, breath: 0.2, fs: 1.1 },
    hint: 'Business only. Childe is polite, sharp and slightly theatrical with her.',
    videoArt: ['p_jade_chamber', 'av_ning'],
  });
  def({
    id: 'xiao', first: '', last: '', real: 'Xiao', display: '(0761) 555 0017', short: 'Unknown',
    avatar: { initials: '?', grad: ['#d3f9d8', '#087f5b'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0017' }], color: '#087f5b', dial: 'busy', unsaved: true, saveAs: 'Xiao',
    voice: { f0: 120, range: 1.02, rate: 0.9, breath: 0.2, fs: 1 },
    hint: 'A threat from someone who means it. Childe would grin.',
  });
  def({
    id: 'yunjin', first: 'Yun Jin', last: '', real: 'Yun Jin', display: 'Yun Jin', short: 'Yun Jin',
    avatar: { art: 'av_yunjin', initials: 'YJ', grad: ['#ffe8cc', '#c92a2a'] },
    phones: [{ label: 'troupe', num: '(0761) 555 0155' }],
    company: 'Yun-Han Opera Troupe', title: 'Lead performer', address: 'Heyu Tea House',
    bday: '2003-05-21', color: '#c92a2a', wavelet: 'yunjin.opera', dial: 'voicemail',
    voicemail: 'Yun Jin of the Yun-Han Troupe. I am rehearsing; leave a message after the gong.',
    voice: { f0: 236, range: 1.24, rate: 0.94, breath: 0.2, fs: 1.18 },
    hint: 'Gracious and theatrical. Childe bought the box seats for Zhongli and pretends it was nothing.',
    videoArt: ['p_heyu_stage', 'av_yunjin'],
  });

  // ── Northland Bank / Fatui ───────────────────────────────────────
  def({
    id: 'ekat', first: 'Ekaterina', last: '', real: 'Ekaterina', display: 'Ekaterina', short: 'Ekaterina',
    avatar: { art: 'av_ekat', initials: 'E', grad: ['#d0ebff', '#1c4f82'] },
    phones: [{ label: 'mobile', num: '(0761) 555 0112' }, { label: 'front desk', num: '(0761) 555 0110' }],
    emails: [{ label: 'work', addr: 'reception.liyue@northland.sn' }],
    company: 'Northland Bank Group', title: 'Reception, Liyue Branch', address: 'Northland Bank, Harbor Road 1',
    notes: 'Best employee in the branch. Bring her the almond tofu from Wanmin. Birthday: never told anyone.',
    color: '#1c4f82', fav: true, dial: 'answer',
    voicemail: 'Northland Bank, Liyue Branch, Ekaterina speaking— this is a recording. Please leave a message.',
    voice: { f0: 206, range: 1.08, rate: 1.04, breath: 0.22, fs: 1.12 },
    hint: 'Formal, loyal, frightened tonight. Childe is protective of her and calls her by name.',
    videoArt: ['p_northland_lobby', 'av_ekat'],
  });
  def({
    id: 'signora', first: 'Signora', last: '', real: 'La Signora', display: 'La Signora', short: 'Signora',
    avatar: { art: 'av_signora', initials: 'S', grad: ['#fff5f5', '#c92a2a'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0708' }],
    company: 'Northland Bank Group', title: 'Eighth of the Harbingers', color: '#c92a2a', dial: 'voicemail',
    voicemail: 'Leave your message. Be brief. Be useful.',
    voice: { f0: 196, range: 1.04, rate: 0.9, breath: 0.16, fs: 1.1 },
    hint: 'Cold, polite and dangerous. Childe never says please to her, never apologises, never sounds afraid.',
    videoArt: ['av_signora'],
  });
  def({
    id: 'scara', first: 'Scaramouche', last: '', real: 'Scaramouche', display: 'Scaramouche (do NOT)', short: 'Scaramouche',
    avatar: { art: 'av_scara', initials: 'S', grad: ['#e5dbff', '#4c2a85'] },
    phones: [{ label: 'mobile', num: '+9 812 555 0706' }],
    bday: '2005-01-03', company: 'Northland Bank Group', title: 'Sixth of the Harbingers',
    notes: 'Birthday: 3 Jan. Sent him a tuna named after him. He blocked me for a week.',
    color: '#4c2a85', wavelet: 'balladeer', dial: 'busy',
    voice: { f0: 150, range: 1.2, rate: 1.06, breath: 0.16, fs: 1.04 },
    hint: 'He is looking for a reason to mock you. Insult him back. If you sound polite, he will know.',
    videoArt: ['av_scara'],
  });
  def({
    id: 'dottore', first: 'Dottore', last: '', real: 'Il Dottore', display: 'Dottore', short: 'Dottore',
    avatar: { art: 'av_dottore', initials: 'D', grad: ['#c5f6fa', '#0c5460'] },
    phones: [{ label: 'lab', num: '+9 812 555 0722' }],
    company: 'Northland Bank Group', title: 'Second of the Harbingers', color: '#0c5460', dial: 'voicemail',
    notes: 'Do not let him near the kids.',
    voicemail: 'You have reached the laboratory. Your call may be recorded for research.',
    voice: { f0: 124, range: 1.06, rate: 0.9, breath: 0.2, fs: 0.98 },
    hint: 'Never give him anything. Childe is icily polite with him and nothing more.',
    videoArt: ['av_dottore'],
  });
  def({
    id: 'pulci', first: 'Pulcinella', last: '', real: 'Pulcinella', display: 'Pulcinella', short: 'Pulcinella',
    avatar: { art: 'av_pulci', initials: 'P', grad: ['#e9ecef', '#5c4033'] },
    phones: [{ label: 'office', num: '+9 812 555 0705' }],
    company: 'Northland Bank Group / Mayor of Morepesok', title: 'Fifth of the Harbingers', color: '#5c4033', dial: 'answer',
    voicemail: 'Ah, you’ve reached old Pulcinella. Leave a message, my dear, and I shall call you back.',
    voice: { f0: 108, range: 1.12, rate: 0.84, breath: 0.3, fs: 0.97, rough: 1 },
    hint: 'He sponsored Ajax and he never lets him forget it. Childe is respectful, careful, never grateful out loud.',
    videoArt: ['p_morepesok', 'av_pulci'],
  });
  def({
    id: 'pantalone', first: 'Pantalone', last: '', real: 'Pantalone', display: 'Pantalone', short: 'Pantalone',
    avatar: { art: 'av_pantalone', initials: 'P', grad: ['#fff9db', '#7d5a00'] },
    phones: [{ label: 'office', num: '+9 812 555 0709' }],
    company: 'Northland Bank Group', title: 'Ninth of the Harbingers · Chairman', color: '#7d5a00', dial: 'voicemail',
    voicemail: 'Pantalone. Every minute is billable. Leave a message.',
    voice: { f0: 120, range: 1.06, rate: 0.96, breath: 0.16, fs: 1 },
    hint: 'He watches every Mora on the card. Childe spends loudly and never explains.',
    videoArt: ['av_pantalone'],
  });
  def({
    id: 'arle', first: 'Arlecchino', last: '', real: 'Arlecchino', display: 'Arlecchino', short: 'Arlecchino',
    avatar: { art: 'av_arle', initials: 'A', grad: ['#f1f3f5', '#212529'] },
    phones: [{ label: 'House of the Hearth', num: '+9 812 555 0704' }],
    bday: '1992-08-22', company: 'Northland Bank Group', title: 'Fourth of the Harbingers', color: '#212529', dial: 'voicemail',
    voicemail: 'Speak.',
    voice: { f0: 170, range: 1.02, rate: 0.88, breath: 0.18, fs: 1.04 },
    hint: 'Few words. She protects children. Childe respects her and asks plainly.',
    videoArt: ['av_arle'],
  });
  def({ id: 'pierro', first: 'Pierro', display: 'Pierro', avatar: { initials: 'P', grad: ['#e9ecef', '#343a40'] }, phones: [{ label: 'office', num: '+9 812 555 0701' }], company: 'Northland Bank Group', title: 'First of the Harbingers', color: '#343a40', dial: 'busy', voice: { f0: 100, range: 1.02, rate: 0.82, breath: 0.24, fs: 0.95 } });
  def({ id: 'columbina', first: 'Columbina', display: 'Columbina 🕊️', short: 'Columbina', avatar: { initials: 'C', grad: ['#f8f0fc', '#9c36b5'] }, phones: [{ label: 'mobile', num: '+9 812 555 0733' }], company: 'Northland Bank Group', title: 'Third of the Harbingers', color: '#9c36b5', dial: 'voicemail', voicemail: '♪ la la… ♪', voice: { f0: 246, range: 1.3, rate: 0.86, breath: 0.3, fs: 1.2 } });
  def({ id: 'sandrone', first: 'Sandrone', display: 'Sandrone', avatar: { initials: 'S', grad: ['#fff4e6', '#a5682a'] }, phones: [{ label: 'workshop', num: '+9 812 555 0707' }], company: 'Northland Bank Group', title: 'Seventh of the Harbingers', color: '#a5682a', dial: 'busy', voice: { f0: 210, range: 1.04, rate: 1, breath: 0.1, fs: 1.12, robot: true } });
  def({ id: 'capitano', first: 'Capitano', display: 'Capitano', avatar: { initials: 'C', grad: ['#dee2e6', '#1b1b1b'] }, phones: [{ label: 'mobile', num: '+9 812 555 0730' }], company: 'Northland Bank Group', title: 'First of the Harbingers (field)', color: '#1b1b1b', dial: 'voicemail', voicemail: '…', notes: 'Has never sent a message. Reacts with 👍. We think it’s affectionate.' });

  // Liyue Branch grunts (all saved by Ekaterina when she set up my phone)
  def({ id: 'pyotr', first: 'Pyotr', display: 'Pyotr (Pyro)', short: 'Pyotr', avatar: { emoji: '🔥', grad: ['#ffe8cc', '#e8590c'] }, phones: [{ label: 'mobile', num: '(0761) 555 0181' }], company: 'Northland Bank Group', title: 'Pyro Agent (Liyue)', color: '#e8590c', dial: 'answer', voice: { f0: 128, range: 1.3, rate: 1.22, breath: 0.2, fs: 1 } });
  def({ id: 'lyuba', first: 'Lyuba', display: 'Lyuba (Cryo)', short: 'Lyuba', avatar: { emoji: '❄️', grad: ['#e7f5ff', '#1c7ed6'] }, phones: [{ label: 'mobile', num: '(0761) 555 0182' }], company: 'Northland Bank Group', title: 'Cryo Cicin Mage (Liyue)', color: '#1c7ed6', dial: 'answer', notes: 'Froze the aquarium (twice).', voice: { f0: 218, range: 1.14, rate: 1, breath: 0.22, fs: 1.14 } });
  def({ id: 'boris', first: 'Big Boris', display: 'Big Boris', short: 'Boris', avatar: { emoji: '🛡️', grad: ['#e9ecef', '#495057'] }, phones: [{ label: 'mobile', num: '(0761) 555 0183' }], company: 'Northland Bank Group', title: 'Heavy Skirmisher (Liyue)', color: '#495057', dial: 'answer', voice: { f0: 92, range: 1.08, rate: 0.84, breath: 0.28, fs: 0.92, rough: 1 } });
  def({ id: 'anya', first: 'Anya', display: 'Anya (Electro)', short: 'Anya', avatar: { emoji: '⚡', grad: ['#f3f0ff', '#7048e8'] }, phones: [{ label: 'mobile', num: '(0761) 555 0184' }], company: 'Northland Bank Group', title: 'Electrohammer Vanguard (Liyue)', color: '#7048e8', dial: 'answer', voice: { f0: 204, range: 1.1, rate: 1.08, breath: 0.16, fs: 1.1 } });
  def({ id: 'kolya', first: 'Kolya', display: 'Kolya (new)', short: 'Kolya', avatar: { emoji: '🐣', grad: ['#fff9db', '#f59f00'] }, phones: [{ label: 'mobile', num: '(0761) 555 0185' }], company: 'Northland Bank Group', title: 'Recruit (Liyue)', color: '#f59f00', dial: 'answer', voice: { f0: 142, range: 1.32, rate: 1.24, breath: 0.22, fs: 1.04 } });
  def({ id: 'valentina', first: 'Valentina', display: 'Valentina (Mirror)', short: 'Valentina', avatar: { emoji: '🪞', grad: ['#e3fafc', '#0c8599'] }, phones: [{ label: 'mobile', num: '(0761) 555 0186' }], company: 'Northland Bank Group', title: 'Mirror Maiden (Liyue)', color: '#0c8599', dial: 'voicemail', voicemail: 'I see you.', voice: { f0: 214, range: 1.04, rate: 0.9, breath: 0.24, fs: 1.12 } });

  // ── The ones without numbers ─────────────────────────────────────
  def({
    id: 'skirk', first: '—', last: '', real: 'Skirk', display: '—', short: '—',
    avatar: { initials: '', grad: ['#343a40', '#0b0b14'] }, phones: [], color: '#5c5f99', dial: 'disconnected',
    notes: '', voice: { f0: 176, range: 1.02, rate: 0.82, breath: 0.34, fs: 1.06 },
    hint: 'Ajax answers her. Briefly. Like a student who is still afraid of her.',
  });
  def({
    id: 'unknown', first: 'Unknown', last: '', real: 'Childe', display: 'Unknown', short: 'Unknown',
    avatar: { initials: '?', grad: ['#adb5bd', '#495057'] }, phones: [{ label: 'mobile', num: 'No Caller ID' }],
    color: '#495057', dial: 'disconnected', voice: { f0: 132, range: 1.25, rate: 1.12, breath: 0.26, fs: 1.02 },
  });
  def({
    id: 'wangsheng', first: 'Wangsheng Funeral Parlor', last: '', display: 'Wangsheng Funeral Parlor',
    avatar: { emoji: '🦋', grad: ['#ffe3e3', '#5c1a1b'] },
    phones: [{ label: 'main', num: '(0761) 555 0144' }], company: 'Wangsheng Funeral Parlor', address: 'Feiyun Slope, Liyue Harbor',
    color: '#5c1a1b', dial: 'answer', voice: { f0: 132, range: 1.25, rate: 1.12, breath: 0.22, fs: 1.02 },
  });

  // ── Services ─────────────────────────────────────────────────────
  def({ id: 'nbank', first: 'Northland Bank', display: 'Northland Bank', service: true, avatar: { emoji: '❄️', grad: ['#d0ebff', '#1c4f82'] }, phones: [{ label: 'service', num: '95511' }], dial: 'busy' });
  def({ id: 'wanmin', first: 'Wanmin Go', display: 'Wanmin Go', service: true, avatar: { emoji: '🥢', grad: ['#ffc9c9', '#e03131'] }, phones: [{ label: 'service', num: '10655 0761' }], dial: 'busy' });
  def({ id: 'ride', first: 'Harbor Ride', display: 'Harbor Ride', service: true, avatar: { emoji: '🚕', grad: ['#c3fae8', '#0ca678'] }, phones: [{ label: 'service', num: '10655 0762' }], dial: 'busy' });
  def({ id: 'market', first: 'Feiyun Market', display: 'Feiyun Market', service: true, avatar: { emoji: '🛍️', grad: ['#fff3bf', '#e67700'] }, phones: [{ label: 'service', num: '10655 0763' }], dial: 'busy' });
  def({ id: 'liyueair', first: 'Liyue Air', display: 'Liyue Air', service: true, avatar: { emoji: '✈️', grad: ['#e7f5ff', '#1971c2'] }, phones: [{ label: 'service', num: '95536' }], dial: 'busy' });
})();
