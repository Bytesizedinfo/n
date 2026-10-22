/* Live scenes — Project Osial, chapters 4–7: Signora's deadline, Yelan's deal, Ningguang by mail, Signora hunting a
   mole, Arlecchino and the boy, the Gnosis, THE SUNDAY 22:30 DEADLINE, the hideout leak, Monday's consequences,
   and Fatui Hospitality (caught_fatui). Package S2. Facts: docs/STORY.md. Format: docs/DEV.md "Story engine". */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  // ── shared helpers (S2) ──────────────────────────────────────────
  const F = (s) => s.flags || {};
  const num = (s, k) => Number(F(s)[k] || 0);
  const sus = (s, id) => Number((s.sus && s.sus[id]) || 0);
  const at = (t) => JC.time.parse(t);
  const held = (s, k, me) => {
    const o = F(s)['busy_' + k];
    if (!o || o === me) return false;
    if (typeof o === 'string') { const d = s.done || {}; if (!d[o] || d[o] === 'expired' || d[o] === 'skipped' || (s.fin && s.fin[o])) return false; }
    return true;
  };
  const waitFor = (k, me, next) => [{ if: (s) => !held(s, k, me), go: next }, { wait: 5 }, { go: 'start' }];
  const lock = (k, me) => ({ fx: { set: { ['busy_' + k]: me } } });
  const free = (k, me) => ({ run: (api) => { const f = api.state.flags; if (f['busy_' + k] === me) f['busy_' + k] = false; } });
  const helper = (names, s, dflt) => {
    const H = JC.storyHelpers || {};
    for (const n of names) if (typeof H[n] === 'function') { try { return !!H[n](s); } catch (e) { break; } }
    return !!dflt(s);
  };
  const stopped = (s) => helper(['osial_stopped', 'osialStopped'], s, (x) => !F(x).osial_sent && !!(F(x).leaked_yelan || F(x).leaked_ning || F(x).ops_sabotage || F(x).zl_amended || F(x).card_frozen));
  const recalled = (s) => helper(['recalled'], s, (x) => !F(x).defected && !F(x).zl_amended);
  const alive = (s) => !F(s).deal_refused && !F(s).lost_mode && !F(s).finale;
  const hostage = (s) => !!F(s).fatui_pickup && !F(s).kids_rescued;
  const memoEv = (s) => !!(F(s).memo31_heard || F(s).memo31_to_yelan);
  const fullEv = (s) => !!F(s).saw_protocol && memoEv(s);
  const beforeDeadline = (s) => s.now < at('+2 22:30');
  const scene = (def) => S.scene(Object.assign({ arc: 'osial' }, def));
  const MEMO31 = { memo: 'memo31', voice: { dur: 42, text: '(wind) Sir, it\'s Ekaterina — Signora has rewritten the Osial file. You\'re the only signatory now. She\'s sending people to the pier, Sir, tonight, please—' } };

  // ── 1. Signora sets the deadline (ch4 +200 ≈ 22:17 Saturday) ─────
  scene({
    id: 'os_pressure',
    thread: 'signora',
    ch: 'sat_night',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 200 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_pressure', 'go'),
      go: [
        lock('signora', 'os_pressure'),
        { m: 'Tartaglia.' },
        { if: (s) => F(s).sig_tone === 'bold', go: 'go_bold' },
        { go: 'body' },
      ],
      go_bold: [
        { m: 'You told me to sleep on Friday. I did not. I read your file instead. Twice.' },
        { go: 'body' },
      ],
      body: [
        { if: (s) => !!F(s).card_frozen, go: 'body_frozen' },
        { go: 'deadline' },
      ],
      body_frozen: [
        { m: 'Your card is still frozen. Pantalone has started speaking to it, like a sick pet.' },
        { go: 'deadline' },
      ],
      deadline: [
        { m: 'Tomorrow at 22:30 I will ask you for the authorization code. At 23:00 the wire releases, whether you like it or not.' },
        { m: 'Your name is on every page. Your code is merely the signature at the bottom. I would prefer it to be voluntary. It reads better in the report.' },
        { if: hostage, go: 'lev_grand' },
        { if: (s) => !!F(s).kids_grand, go: 'lev_walls' },
        { if: (s) => !!F(s).kids_apartment, go: 'lev_apt' },
        { if: (s) => !!F(s).kids_alcor, go: 'lev_alcor' },
        { if: (s) => !!F(s).kids_zl, go: 'lev_zl' },
        { if: (s) => !!F(s).kids_wangshu, go: 'lev_wangshu' },
        { go: 'ask' },
      ],
      lev_grand: [
        { m: 'Your siblings are asleep at the Liyue Harbor Grand. Nineteenth floor. Pulcinella\'s staff are very attentive. I mention it only as a matter of hospitality.' },
        { go: 'ask' },
      ],
      lev_walls: [
        { m: 'The Liyue Harbor Grand has very thin walls. Your sister reads late. I mention it only as a matter of hospitality.' },
        { go: 'ask' },
      ],
      lev_apt: [
        { m: 'Your apartment is very well lit at night. Two small shadows in the window of 2207. My people are standing in the rain admiring them.' },
        { go: 'ask' },
      ],
      lev_alcor: [
        { m: 'You put your siblings on a pirate ship. How very like you. Ships leave harbors, Tartaglia. Ships also come back.' },
        { go: 'ask' },
      ],
      lev_zl: [
        { m: 'Your siblings are staying with the funeral consultant. How domestic. I hope he has a large enough teapot.' },
        { go: 'ask' },
      ],
      lev_wangshu: [
        { m: 'Wangshu Inn. A pleasant drive from the harbor. Not a long one.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: "You'll get your answer at 22:30.", fx: { set: { pressure_c: 'wait' } }, go: 'wait' },
          { t: "Touch my family and I'll freeze the whole bank.", fx: { set: { pressure_c: 'threat', sig_threatened: true, knows_freeze_rule: true } }, go: 'threat' },
          { t: 'Why do you even need me? You have my name.', fx: { set: { pressure_c: 'why' } }, go: 'why' },
          { t: "Fine. I'll send it now.", fx: { set: { pressure_c: 'eager' }, sus: { signora: 2 } }, go: 'eager' },
          { t: '[Leave on read]', silent: true, fx: { set: { pressure_c: 'read' } }, go: 'read' },
        ] },
      ],
      wait: [
        { m: 'I know.' },
        free('signora', 'os_pressure'),
      ],
      threat: [
        { m: 'You would freeze your own card to spite me?' },
        { typing: 3 },
        { m: '…No. You love spending far too much. Goodnight, Tartaglia.' },
        free('signora', 'os_pressure'),
      ],
      why: [
        { m: 'Because Sandrone\'s resonators answer to a code, not to a name. She built them to be stubborn.' },
        { m: 'The code makes it voluntary. The name makes it yours.' },
        { m: 'If you refuse, I will use the contractors\' manual override. It is slower and uglier and it will still have your name on every page.' },
        { m: 'So you see, Tartaglia, the only thing you are choosing tomorrow is whether you look like a hero or a coward in my report.' },
        free('signora', 'os_pressure'),
      ],
      eager: [
        { m: 'No.' },
        { m: 'Tomorrow. At 22:30. I want you to sit with it.' },
        { m: 'Eager. That is new. I do not like new.' },
        free('signora', 'os_pressure'),
      ],
      read: [
        { wait: 6 },
        { m: '22:30, Tartaglia. I will not ask twice.' },
        free('signora', 'os_pressure'),
      ],
      x: [free('signora', 'os_pressure')],
    },
  });

  // ── 2. Yelan's deal (ch4 +600 ≈ 23:50 Saturday) ──────────────────
  // what she does in return (shared by the deal and the follow-ups)
  const rewardNodes = (me) => ({
    reward: [
      { m: 'Now. I pay my debts. One favour. Choose carefully, I only roll once. 🎲' },
      { if: (s) => !F(s).ekat_warned, go: 'reward_mole' },
      { go: 'reward_ask' },
    ],
    reward_mole: [
      { m: 'Before you choose: Signora will be looking for a mole by tomorrow. She\'ll start at your front desk. Just so you know.' },
      { go: 'reward_ask' },
    ],
    reward_ask: [
      { choice: [
        { t: 'Keep his name out of it. Make sure Childe walks away from this.', fx: { set: { yelan_protects_childe: true, yelan_favour: 'childe' } }, go: 'r_childe' },
        { t: 'Watch over the kids. Teucer and Tonia. Nobody touches them.', fx: { set: { yelan_protects_kids: true, yelan_favour: 'kids' } }, go: 'r_kids' },
        { t: "Both. And I'll throw in the authorization code.", if: (s) => !!F(s).code_seen, fx: { set: { yelan_protects_childe: true, yelan_protects_kids: true, yelan_has_code: true, yelan_favour: 'both' } }, go: 'r_both' },
        { t: 'Nothing. Just stop Osial.', fx: { set: { yelan_favour: 'nothing' } }, go: 'r_nothing' },
      ] },
    ],
    r_childe: [
      { m: 'Done. When this is over, his name won\'t be on any list I keep.' },
      { m: 'That\'s a big favour. Bigger than you know.' },
      free('yelan', me),
    ],
    r_kids: [
      { m: 'Done. They\'ll have a new shadow by morning. Don\'t look for her. That\'s the point.' },
      free('yelan', me),
    ],
    r_both: [
      { m: 'Greedy. I like greedy.' },
      { m: 'With the code, my people can make those resonators answer to the Qixing instead of to her. Fine. Both. 🎲🎲' },
      free('yelan', me),
    ],
    r_nothing: [
      { m: 'A selfless bluff? Or a stupid one?' },
      { m: 'Either way, I\'ll remember it. Don\'t expect me to return the favour.' },
      free('yelan', me),
    ],
  });
  scene({
    id: 'yelan_deal',
    thread: 'yelan',
    ch: 'sat_night',
    trigger: [{ on: 'chapter', ch: 'sat_night', delay: 600 }, { on: 'sus', who: 'yelan', at: 4, delay: 30 }],
    when: (s) => alive(s) && !F(s).leaked_yelan,
    expire: 'x',
    nodes: Object.assign({
      start: waitFor('yelan', 'yelan_deal', 'go'),
      go: [
        lock('yelan', 'yelan_deal'),
        { if: (s) => sus(s, 'yelan') >= 4, go: 'knows' },
        { if: (s) => !F(s).yelan_met, go: 'intro' },
        { go: 'open' },
      ],
      intro: [
        { fx: { set: { yelan_met: true } } },
        { m: 'Evening, Tartaglia. We haven\'t been introduced. We won\'t be, either. 🎲' },
        { go: 'open' },
      ],
      open: [
        { m: 'Let\'s skip the part where you pretend not to know what\'s happening on Sunday.' },
        { m: 'Three resonators on Guyun. A wire at 23:00. Your name on the paperwork. And a woman in a mask who wants you to pull the trigger.' },
        { m: 'I work for people who\'d like Liyue to stay above water. Help me prove it, and I\'ll owe you.' },
        { go: 'ask' },
      ],
      knows: [
        { fx: { set: { yelan_met: true, yelan_knows: true } } },
        { m: 'Let\'s drop the act. You\'re not him.' },
        { m: 'Relax. I don\'t care. You ask questions he\'d already know the answers to, and you haven\'t bragged about a single fish.' },
        { if: (s) => !!F(s).deal_childe, go: 'knows_deal' },
        { go: 'knows2' },
      ],
      knows_deal: [
        { m: 'And you\'ve made some sort of deal with him. People who\'ve made deals text very carefully.' },
        { go: 'knows2' },
      ],
      knows2: [
        { m: 'What I care about is Guyun. You\'re holding a Harbinger\'s phone the night before a Harbinger floods my city. Let\'s be useful to each other.' },
        { go: 'ask' },
      ],
      ask: [
        { m: 'I need two things. Proof that the order came from Signora, not from him. And the plan itself: pillars, timings, the wire.' },
        { m: 'Give me both and the Qixing can move tonight. Give me one and I\'m just a woman with a hunch. 🎲' },
        { go: 'offer' },
      ],
      offer: [
        { choice: [
          { label: '[Send her the protocol and New Recording 31]', t: 'Here. All of it.', if: fullEv, send: [{ img: 'p_osial_diagram' }, MEMO31], fx: { set: { leaked_yelan: true, memo31_to_yelan: true } }, go: 'got' },
          { label: '[Send her the Osial protocol]', t: 'The plan. Page three.', if: (s) => !!F(s).saw_protocol && !memoEv(s), send: [{ img: 'p_osial_diagram' }], fx: { set: { yelan_waiting: true, yelan_has_plan: true } }, go: 'half' },
          { label: '[Send her New Recording 31]', t: 'Listen to this.', if: (s) => !F(s).saw_protocol && memoEv(s), send: [MEMO31], fx: { set: { yelan_waiting: true, memo31_to_yelan: true } }, go: 'half' },
          { t: "What's in it for me?", if: (s) => !F(s).yelan_terms, fx: { set: { yelan_terms: true } }, go: 'terms' },
          { t: "I don't have anything. Yet.", if: (s) => !fullEv(s), fx: { set: { yelan_waiting: true } }, go: 'nothing' },
          { t: "I don't deal with strangers.", fx: { set: { yelan_snubbed: true } }, go: 'snub' },
        ] },
      ],
      terms: [
        { m: 'In return? Protection. For him, or for those two ginger kids your family put on a plane. One favour. I\'m generous, not a charity.' },
        { go: 'offer' },
      ],
      half: [
        { m: 'Half a hand. Good start.' },
        { m: 'Bring me the other half before 22:30 tomorrow and we\'re in business.' },
        { if: (s) => !!F(s).saw_protocol, go: 'half_voice' },
        { m: 'Hint: you have the voice. Now find the plan. Your mail. Your bank\'s intranet. Someone always copies the Harbinger they\'re framing.' },
        free('yelan', 'yelan_deal'),
      ],
      half_voice: [
        { m: 'Hint: you have the plan. Now find the voice. People record more than they think. Check your voice memos.' },
        free('yelan', 'yelan_deal'),
      ],
      nothing: [
        { m: 'Then find something. Your mail. Your intranet. Your own voice memos. People record more than they think.' },
        { m: 'I\'ll be here until 22:30 tomorrow. After that I\'ll be busy pulling bodies out of the harbor. 🎲' },
        free('yelan', 'yelan_deal'),
      ],
      snub: [
        { m: 'Fair. You\'ll call me. People always call me eventually. 🎲' },
        free('yelan', 'yelan_deal'),
      ],
      got: [
        { typing: 5 },
        { m: '…' },
        { m: 'That\'s her. Your front desk, 23:21 on Friday, telling you Signora rewrote the file. Brave girl.' },
        { m: 'And that\'s the plan. Page three. G-4, G-9, G-17. Unit 3.' },
        { m: 'Thank you. Liyue thanks you. Liyue will never know, which is how I like it.' },
        { go: 'reward' },
      ],
      x: [free('yelan', 'yelan_deal')],
    }, rewardNodes('yelan_deal')),
  });

  // the other half of the hand (any time before the deadline, once she's waiting or was snubbed)
  scene({
    id: 'yelan_more',
    thread: 'yelan',
    trigger: [
      { on: 'flag', flag: 'saw_protocol', delay: 20 },
      { on: 'flag', flag: 'memo31_heard', delay: 20 },
      { on: 'flag', flag: 'memo31_to_yelan', delay: 10 },
      { on: 'act', act: 'send', match: (p) => !!p && p.thread === 'yelan', delay: 8 },
    ],
    when: (s) => alive(s) && !F(s).leaked_yelan && !!(F(s).yelan_waiting || F(s).yelan_snubbed) && fullEv(s) && beforeDeadline(s) && !!s.fin.yelan_deal,
    retry: true,
    nodes: Object.assign({
      start: waitFor('yelan', 'yelan_more', 'go'),
      go: [
        lock('yelan', 'yelan_more'),
        { if: (s) => !!F(s).yelan_snubbed, go: 'snubbed' },
        { m: 'Well, well. You found the other half. 🎲' },
        { go: 'ask' },
      ],
      snubbed: [
        { m: 'Told you you\'d call. You didn\'t, technically. But you\'re holding the right cards now, and I can tell. 🎲' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { label: '[Send her everything]', t: 'Here. All of it.', send: [{ img: 'p_osial_diagram' }, MEMO31], fx: { set: { leaked_yelan: true, memo31_to_yelan: true } }, go: 'got' },
          { t: 'Not yet.', go: 'later' },
        ] },
      ],
      got: [
        { typing: 4 },
        { m: 'There she is. Your receptionist, 23:21, the night it all started. And there\'s the plan. G-4, G-9, G-17.' },
        { m: 'That\'s a full hand. Liyue thanks you.' },
        { go: 'reward' },
      ],
      later: [
        { m: 'Clock\'s ticking, stranger. 22:30 tomorrow, and then it\'s the sea\'s turn to talk.' },
        { fx: { set: { yelan_waiting: true, yelan_snubbed: false } } },
        free('yelan', 'yelan_more'),
      ],
    }, rewardNodes('yelan_more')),
  });

  // New Recording 31 shared to her straight from Voice Memos
  scene({
    id: 'yelan_memo',
    thread: 'yelan',
    trigger: { on: 'act', act: 'memo_share', match: (p) => !!p && p.id === 'memo31' && String(p.to || '') === 'yelan', delay: 6 },
    when: (s) => alive(s) && !F(s).leaked_yelan,
    nodes: {
      start: waitFor('yelan', 'yelan_memo', 'go'),
      go: [
        lock('yelan', 'yelan_memo'),
        { m: 'Forty-two seconds of wind and a frightened receptionist.' },
        { m: 'That\'s proof the order came from Signora. Now I want the plan.' },
        { fx: { set: { yelan_waiting: true } } },
        free('yelan', 'yelan_memo'),
      ],
    },
  });

  // ── 3. Ningguang wants an explanation (ch4 +880 ≈ 00:55 Sunday) ───
  scene({
    id: 'ning_1',
    thread: 'ning',
    ch: 'sat_night',
    trigger: { on: 'chapter', ch: 'sat_night', delay: 880 },
    when: (s) => alive(s) && !F(s).leaked_ning,
    expire: 'x',
    nodes: {
      start: waitFor('ning', 'ning_1', 'go'),
      go: [
        lock('ning', 'ning_1'),
        { m: 'Tartaglia. It is late. I am awake because Snezhnaya\'s markets are awake, and because something in your bank\'s accounts is keeping me awake.' },
        { m: 'Three million Mora, scheduled for tomorrow night, to a "Sea Lantern Logistics". It owns no ships. It owns no lanterns. It owns, as far as my people can tell, a diving permit for Guyun Stone Forest.' },
        { m: 'Explain. Or do not, and I will find out on my own, more slowly and less kindly.' },
        { choice: [
          { t: 'Check your inbox in five minutes, Tianquan.', if: (s) => !!F(s).saw_protocol, fx: { set: { ning_c: 'inbox', ning_invited: true } }, go: 'inbox' },
          { t: "Give me until tomorrow. I'll have something for you.", if: (s) => !F(s).saw_protocol, fx: { set: { ning_c: 'tomorrow', ning_invited: true } }, go: 'tomorrow' },
          { t: 'Business as usual, Tianquan. Logistics.', fx: { set: { ning_c: 'usual' } }, go: 'usual' },
          { t: "Stay out of Northland's affairs.", fx: { set: { ning_c: 'away' } }, go: 'away' },
        ] },
      ],
      inbox: [
        { m: 'I will be watching it. tianquan@jadechamber.ly, should you have forgotten.' },
        free('ning', 'ning_1'),
      ],
      tomorrow: [
        { m: 'Before the lanterns go out, then. The Jade Chamber\'s address is tianquan@jadechamber.ly. I trust you can spell it.' },
        free('ning', 'ning_1'),
      ],
      usual: [
        { m: 'Then I will treat it as usual business. That is to say, with suspicion.' },
        free('ning', 'ning_1'),
      ],
      away: [
        { m: 'Bold. Northland\'s affairs are in Liyue\'s harbor, Tartaglia. That makes them mine.' },
        free('ning', 'ning_1'),
      ],
      x: [free('ning', 'ning_1')],
    },
  });

  // mailing the protocol to the Jade Chamber
  const toNing = (p) => {
    const to = String((p && p.to) || '') + ' ' + ((p && p.contacts) || []).join(' ');
    return /jadechamber|tianquan|\bning\b|ningguang/i.test(to);
  };
  const carriesOsial = (p) => {
    const att = (p && (p.attach || p.attachments)) || [];
    const names = (Array.isArray(att) ? att : [att]).map((a) => (a && (a.name || a)) || '').join(' ');
    return /osial|protocol|guyun|resonator/i.test(names + ' ' + String((p && p.subject) || '') + ' ' + String((p && p.body) || ''));
  };
  S.onAct({ id: 's2_leaked_ning', act: 'mail_send', arc: 'osial', once: true, match: (p, s) => toNing(p) && carriesOsial(p) && !F(s).osial_sent, fx: { set: { leaked_ning: true } }, start: 'ning_thanks', delay: 45 });

  scene({
    id: 'ning_thanks',
    thread: 'ning',
    trigger: { on: 'manual' },
    when: alive,
    nodes: {
      start: waitFor('ning', 'ning_thanks', 'go'),
      go: [
        lock('ning', 'ning_thanks'),
        { m: 'I have read the attachment.' },
        { m: 'Pillars G-4, G-9 and G-17. A countersignature "removed, rev. 4". A stamp from the Office of the Eighth.' },
        { m: 'Sea Lantern Logistics will find that its harbor permits have been suspended for the period of mourning. All of them. Effective immediately.' },
        { m: 'Liyue thanks you. I will not, in writing.' },
        { choice: [
          { t: 'Happy to help, Tianquan. 😁', fx: { set: { ning_c2: 'help' } }, go: 'help' },
          { t: 'Keep my name out of your files.', fx: { set: { ning_c2: 'name' } }, go: 'name' },
          { t: 'If he ever wants out, would Liyue take him?', fx: { set: { ning_c2: 'door', ning_door: true }, sus: { ning: 2 } }, go: 'door' },
        ] },
      ],
      help: [
        { m: 'You are not a man who helps, Tartaglia. You are a man who fights, and occasionally the fight is on the right side.' },
        { m: 'Tonight, it was.' },
        free('ning', 'ning_thanks'),
      ],
      name: [
        { m: 'Your name is in every file I have. I will put this one somewhere else.' },
        free('ning', 'ning_thanks'),
      ],
      door: [
        { typing: 4 },
        { m: '"Him."' },
        { m: 'I see. Then tell "him" that the Jade Chamber has a guest room with a very good lock, and that I do not ask guests where they have been.' },
        free('ning', 'ning_thanks'),
      ],
    },
  });

  // ── 4. Signora hunts a mole: Ekaterina's door (after any leak) ───
  scene({
    id: 'ekat_hunted',
    thread: 'ekat',
    trigger: [{ on: 'flag', flag: 'leaked_yelan', delay: 150 }, { on: 'flag', flag: 'leaked_ning', delay: 150 }],
    when: (s) => alive(s) && s.chapter !== 'mon',
    nodes: {
      start: waitFor('ekat', 'ekat_hunted', 'go'),
      go: [
        lock('ekat', 'ekat_hunted'),
        { if: (s) => !!F(s).ekat_warned, go: 'safe' },
        { m: 'Sir.', d: 0.5 },
        { m: 'There are people outside my apartment door. Two. They knocked and said my name and "Signora would like a word about the Qixing".' },
        { m: 'Sir, I didn\'t tell anyone anything. I swear on the aquarium.' },
        { m: 'What do I do?' },
        { choice: [
          { t: "Don't open. Fire escape. Now. Go to Wangsheng, tell Hu Tao I sent you.", fx: { set: { ekat_warned: true, ekat_escape: 'wangsheng' } }, go: 'escape' },
          { t: "Don't open. Call Valentina. She'll know what to do.", fx: { set: { ekat_warned: true, ekat_escape: 'valentina' } }, go: 'valentina' },
          { t: 'Open the door. Tell them the truth: you know nothing.', fx: { set: { ekat_taken: true } }, go: 'open' },
          { t: "Calm down, it's probably nothing.", fx: { set: { ekat_taken: true }, sus: { ekat: 2 } }, go: 'open' },
        ], timeout: 60, onTimeout: 'taken' },
      ],
      escape: [
        { m: 'Going.' },
        { wait: 8 },
        { m: 'I\'m on the roof of the bakery next door. I\'m fine. I\'m… I\'m fine.' },
        { wait: 5 },
        { m: 'A girl in a hat with a plum blossom on it just waved at me from the street and shouted "this way, receptionist!". Sir, is that Hu Tao?' },
        { m: 'She says she has "a very comfortable coffin, practically a hotel". I am going with her. I don\'t know why.' },
        free('ekat', 'ekat_hunted'),
      ],
      valentina: [
        { m: 'Calling her.' },
        { wait: 8 },
        { m: 'Valentina is in the corridor. She is standing very still. She isn\'t saying anything.' },
        { m: 'The two men have just remembered that they are needed somewhere else.' },
        free('ekat', 'ekat_hunted'),
      ],
      open: [
        { m: 'Yes, Sir.' },
        { wait: 8 },
        { m: 'They\'re taking me to the branch "for a conversation". They\'re being very polite.' },
        { m: 'Sir, if I don\'t write tomorrow—' },
        { wait: 2 },
        { unsend: true },
        free('ekat', 'ekat_hunted'),
      ],
      taken: [
        { fx: { set: { ekat_taken: true } } },
        { m: 'Sir, they\'re opening the door' },
        { wait: 4 },
        { typing: 6 },
        free('ekat', 'ekat_hunted'),
      ],
      safe: [
        { m: 'Sir. Valentina just called. Two of Signora\'s people knocked on my apartment door tonight and asked for me by name. They said "the Qixing".' },
        { m: 'I wasn\'t there. I was at my aunt\'s, because you told me to be.' },
        { m: 'Thank you.' },
        free('ekat', 'ekat_hunted'),
      ],
    },
  });

  // ── 5. Arlecchino and the boy (ch5 +600, or as soon as he writes to her) ──
  scene({
    id: 'arle_1',
    thread: 'arle',
    trigger: [{ on: 'act', act: 'send', match: (p) => !!p && p.thread === 'arle', delay: 8 }, { on: 'chapter', ch: 'sun_rite', delay: 600 }],
    when: (s) => alive(s) && s.chapter !== 'mon' && !!(F(s).clue_dottore || s.done.dottore_1 || F(s).arle_protects),
    nodes: {
      start: waitFor('arle', 'arle_1', 'go'),
      go: [
        lock('arle', 'arle_1'),
        { if: (s) => !!F(s).arle_protects, go: 'confirm' },
        { m: 'Tartaglia.' },
        { if: (s) => !!F(s).harb_warned_dottore, go: 'warned' },
        { go: 'ledger' },
      ],
      warned: [
        { m: 'You warned the Doctor in front of the table on Friday. Good. He remembers threats. So do I.' },
        { go: 'ledger' },
      ],
      ledger: [
        { m: 'The Doctor has written your brother\'s name in his Monday ledger. Nine o\'clock. I have seen the page.' },
        { if: (s) => !!F(s).dottore_agreed, go: 'agreed' },
        { if: (s) => !!F(s).dottore_cancelled, go: 'cancelled' },
        { go: 'ask' },
      ],
      agreed: [
        { m: 'He says you agreed. Tell me he is lying.' },
        { go: 'ask' },
      ],
      cancelled: [
        { m: 'You deleted his appointment. Good. He has already written another.' },
        { go: 'ask' },
      ],
      ask: [
        { m: 'Do you want him there?' },
        { choice: [
          { t: 'No. Keep him away from Dottore.', fx: { set: { arle_protects: true, arle_c: 'yes' } }, go: 'yes' },
          { t: 'No. Please. Keep him away from Dottore.', fx: { set: { arle_protects: true, arle_c: 'please' }, sus: { arle: 1 } }, go: 'please' },
          { t: "I'll handle Dottore myself.", fx: { set: { arle_c: 'self' } }, go: 'self' },
          { t: 'Why do you care?', if: (s) => !F(s).arle_why, fx: { set: { arle_why: true } }, go: 'why' },
        ] },
      ],
      why: [
        { m: 'Because I was a child once, in a house like his.' },
        { m: 'Answer the question.' },
        { go: 'ask' },
      ],
      please: [
        { m: 'You said please. I will pretend you didn\'t.' },
        { go: 'yes' },
      ],
      yes: [
        { m: 'Then he will not be.' },
        { if: hostage, go: 'rescue' },
        { m: 'I will have someone near them until their plane leaves. They will not see her. Neither will he.' },
        free('arle', 'arle_1'),
      ],
      rescue: [
        { m: 'They are at the Grand. Pulcinella\'s booking.' },
        { m: 'I will collect them myself, tonight. Pulcinella will not argue with me. He never has.' },
        { fx: { set: { kids_rescued: true, arle_rescued: true } } },
        free('arle', 'arle_1'),
      ],
      self: [
        { m: 'Then handle him.' },
        { m: 'If you fail, I will not.' },
        free('arle', 'arle_1'),
      ],
      confirm: [
        { m: 'I received your request about the boy. It is done.' },
        { m: 'Do not thank me. Keep him close until the plane leaves.' },
        { if: hostage, go: 'rescue' },
        free('arle', 'arle_1'),
      ],
    },
  });

  // ── 6. The Gnosis (Sunday 16:20, after the Golden House) ──────────
  scene({
    id: 'os_gnosis',
    thread: 'signora',
    ch: 'sun_rite',
    trigger: { on: 'time', at: '+2 16:20' },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_gnosis', 'go'),
      go: [
        lock('signora', 'os_gnosis'),
        { m: 'The founder\'s lanterns are lit. The contract is signed. The Gnosis is in my hand.', img: 'p_golden_house' },
        { m: 'It is smaller than you would think. Most power is.' },
        { if: (s) => !!F(s).zl_amended, go: 'margin' },
        { go: 'tonight' },
      ],
      margin: [
        { m: 'The consultant insisted on a clause in the margin. In ink. Who still uses ink?' },
        { m: '"Honoured to the letter, kept in spirit elsewhere." I read it three times. It says nothing at all.' },
        { go: 'tonight' },
      ],
      tonight: [
        { m: 'Tonight is yours, Tartaglia. 22:30.' },
        { choice: [
          { t: 'Enjoy your rock.', fx: { set: { gnosis_c: 'rock' } }, go: 'rock' },
          { t: 'Read the margin again.', if: (s) => !!F(s).zl_amended, fx: { set: { gnosis_c: 'margin' } }, go: 'reread' },
          { t: 'What did you give Liyue for it?', fx: { set: { gnosis_c: 'price' } }, go: 'price' },
          { t: '[Leave on read]', silent: true, fx: { set: { gnosis_c: 'read' } }, go: 'read' },
        ] },
      ],
      rock: [
        { m: 'I will. It is warm. Like something that was alive until very recently.' },
        free('signora', 'os_gnosis'),
      ],
      reread: [
        { typing: 4 },
        { m: '…I have. Twice. It is a sentence about the sea. The consultant is sentimental.' },
        { m: 'Why do you care about the margin, Tartaglia?' },
        free('signora', 'os_gnosis'),
      ],
      price: [
        { m: 'Its debts. All of them. Liyue is free and Northland is rich. Everyone wins.' },
        { m: 'Except the dragon. But the dragon is dead, so he will not mind.' },
        free('signora', 'os_gnosis'),
      ],
      read: [
        { wait: 5 },
        { m: '22:30.' },
        free('signora', 'os_gnosis'),
      ],
      x: [free('signora', 'os_gnosis')],
    },
  });

  // ── 7. THE DEADLINE — Sunday 22:30 (required) ────────────────────
  const T2300 = () => at('+2 23:00');
  scene({
    id: 'os_deadline',
    thread: 'signora',
    ch: 'sun_night',
    required: true,
    trigger: { on: 'time', at: '+2 22:30' },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_deadline', 'go'),
      go: [
        lock('signora', 'os_deadline'),
        { m: 'Tartaglia.' },
        { m: 'It is half past ten. The founder\'s lanterns are out. All of Liyue has gone home to cry.' },
        { m: 'Your authorization code. Now.' },
        { if: (s) => !!F(s).card_frozen, go: 'frozen' },
        { go: 'lev' },
      ],
      frozen: [
        { m: 'And unfreeze your card. Pantalone has been weeping into a ledger.' },
        { go: 'lev' },
      ],
      lev: [
        { if: hostage, go: 'lev_grand' },
        { go: 'ask' },
      ],
      lev_grand: [
        { m: 'Before you answer: I went up to the nineteenth floor of the Grand this evening. Your brother was asleep with a toy wolf on his face. Your sister was reading. She did not see me.' },
        { m: 'Answer carefully.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { label: '[Send the code: OSL-0918-ΛΣ]', t: 'OSL-0918-ΛΣ', if: (s) => !!F(s).code_seen, fx: { set: { osial_sent: true, osial_choice: 'sent' } }, go: 'sent' },
          { label: '[Send a fake code]', t: 'OSL-0720-ΩΔ', fx: { set: { osial_fake: true, osial_choice: 'fake' } }, go: 'fake' },
          { t: "Give me until midnight. I'm not done thinking.", fx: { set: { osial_stalled: true, osial_choice: 'stall' } }, go: 'stall' },
          { t: 'No.', fx: { set: { osial_refused: true, osial_choice: 'no' } }, go: 'no' },
          { t: 'The Liyue Branch has a better idea.', if: (s) => num(s, 'ops_morale') >= 3, fx: { set: { ops_sabotage: true, osial_choice: 'ops' } }, go: 'ops' },
          { t: 'Ask the founder.', if: (s) => !!F(s).zl_knows_osial, fx: { set: { osial_founder: true, osial_stopped: true, osial_choice: 'founder' } }, go: 'founder' },
          { t: '[Leave on read]', silent: true, go: 'silence' },
        ], timeout: 120, onTimeout: 'silence' },
      ],
      sent: [
        { typing: 3 },
        { m: 'Thank you, Tartaglia.' },
        { m: 'That was not so difficult. You will find it gets easier.' },
        { go: 'hold' },
      ],
      fake: [
        { m: 'Received.' },
        { m: 'I will enter it at 23:00, when the wire releases. If the resonators like it, you will not hear from me again tonight.' },
        { m: 'If they do not, you will.' },
        { go: 'hold' },
      ],
      stall: [
        { m: 'Midnight.' },
        { m: 'The wire releases at 23:00, Tartaglia, whether you have finished thinking or not. Thinking was never your strength.' },
        { go: 'hold' },
      ],
      no: [
        { if: hostage, go: 'no_threat' },
        { m: '"No."' },
        { m: 'A single word. How economical.' },
        { m: 'You will find that I can be economical too.' },
        { go: 'hold' },
      ],
      no_threat: [
        { m: '"No."' },
        { m: 'Then I will go back upstairs and wake the little one. He will be so pleased to meet a friend of his brother\'s.' },
        { fx: { set: { kids_threatened: true } } },
        { choice: [
          { t: 'No.', fx: { set: { no_firm: true } }, go: 'no_firm' },
          { t: "Touch him and I'll burn your bank to the ground. Every branch.", fx: { set: { no_firm: true } }, go: 'no_firm' },
          { label: '[Give in: OSL-0918-ΛΣ]', t: 'Wait. …OSL-0918-ΛΣ.', if: (s) => !!F(s).code_seen, fx: { set: { osial_sent: true, osial_refused: false, osial_choice: 'sent' } }, go: 'sent' },
        ], timeout: 60, onTimeout: 'no_firm' },
      ],
      no_firm: [
        { typing: 5 },
        { m: '…' },
        { m: 'Your family is very stubborn, Tartaglia. It is the only thing you have ever had in common with me.' },
        { m: 'I will not wake him. Tonight.' },
        { go: 'hold' },
      ],
      ops: [
        { m: 'Does it.' },
        { m: 'Your branch is standing on Guyun right now, Tartaglia, because I ordered them there. Whatever they are planning, they are planning it in front of my guards.' },
        { m: 'How brave. How very short-lived.' },
        { go: 'hold' },
      ],
      founder: [
        { typing: 5 },
        { m: '…' },
        { m: 'The founder is dead. I attended the funeral. I stood in the rain for an hour.' },
        { m: 'What an extraordinary thing to say.' },
        { m: 'I will look at the sea at 23:00, Tartaglia. Think about who you are joking with.' },
        { go: 'hold' },
      ],
      silence: [
        { fx: { set: { osial_stalled: true, osial_choice: 'silence' } } },
        { m: 'Silence.' },
        { m: 'Silence is a form of refusal, Tartaglia, and I answer refusal.' },
        { go: 'hold' },
      ],
      hold: [
        { if: (s) => s.now >= T2300(), go: 'wire' },
        { wait: 4 },
        { go: 'hold' },
      ],
      wire: [
        { if: (s) => !!F(s).card_frozen, go: 'wire_frozen' },
        { m: '[Northland Bank] Corporate transfer OSIAL/PH3 ℳ3,000,000 to SEA LANTERN LOGISTICS released, 18/10 23:00.', th: 'nbank', from: 'nbank' },
        { fx: { set: { osial_wire: 'released' } } },
        { go: 'result' },
      ],
      wire_frozen: [
        { m: '[Northland Bank] Corporate transfer OSIAL/PH3 ℳ3,000,000 to SEA LANTERN LOGISTICS could not be released: signatory card ••1111 is frozen.', th: 'nbank', from: 'nbank' },
        { fx: { set: { osial_wire: 'held' } } },
        { go: 'result' },
      ],
      result: [
        { if: (s) => !!F(s).osial_sent, go: 'r_sent' },
        { if: stopped, go: 'r_stopped' },
        { go: 'r_scape' },
      ],
      r_sent: [
        { m: 'The resonators have accepted your code.' },
        { if: (s) => !!F(s).card_frozen, go: 'r_sent_frozen' },
        { go: 'r_sent2' },
      ],
      r_sent_frozen: [
        { m: 'Your little freeze stopped the money. It did not stop the sea. The sea does not need paying.' },
        { go: 'r_sent2' },
      ],
      r_sent2: [
        { m: 'Go to a window, Tartaglia. Listen. You can hear it from the harbor.' },
        { go: 'end' },
      ],
      r_stopped: [
        { if: (s) => !!F(s).osial_fake, go: 'rs_fake' },
        { go: 'rs_body' },
      ],
      rs_fake: [
        { m: 'Your code was a fiction. I entered it anyway, to see. The resonators laughed at me. I did not know machines could laugh.' },
        { go: 'rs_body' },
      ],
      rs_body: [
        { m: 'Something is wrong at Guyun.' },
        { if: (s) => !!F(s).ops_sabotage, go: 'rs_ops' },
        { go: 'rs_y' },
      ],
      rs_ops: [
        { m: 'Unit 3 is not answering. My guards say it is covered in ice. With feathers in it.' },
        { go: 'rs_y' },
      ],
      rs_y: [
        { if: (s) => !!F(s).leaked_yelan, go: 'rs_y2' },
        { go: 'rs_n' },
      ],
      rs_y2: [
        { m: 'The Millelith are on the water. They have the pillar numbers.' },
        { go: 'rs_n' },
      ],
      rs_n: [
        { if: (s) => !!F(s).leaked_ning, go: 'rs_n2' },
        { go: 'rs_c' },
      ],
      rs_n2: [
        { m: 'The Jade Chamber suspended the contractors\' permits an hour ago. For "mourning".' },
        { go: 'rs_c' },
      ],
      rs_c: [
        { if: (s) => !!F(s).card_frozen, go: 'rs_c2' },
        { go: 'rs_z' },
      ],
      rs_c2: [
        { m: 'And the money did not move.' },
        { go: 'rs_z' },
      ],
      rs_z: [
        { if: (s) => !!F(s).zl_amended, go: 'rs_z2' },
        { go: 'rs_end' },
      ],
      rs_z2: [
        { m: 'And the sea is very calm. It should not be this calm. It is as if something very old told it to lie down.' },
        { go: 'rs_end' },
      ],
      rs_end: [
        { m: 'You did this.' },
        { m: 'Whoever you are tonight, Tartaglia, you are not mine.' },
        { go: 'end' },
      ],
      r_scape: [
        { if: (s) => !!F(s).osial_fake, go: 'sc_fake' },
        { go: 'sc_body' },
      ],
      sc_fake: [
        { m: 'Your code was a fiction. Fortunately, I did not need it.' },
        { go: 'sc_body' },
      ],
      sc_body: [
        { m: 'The wire has released. The contractors have their override.' },
        { m: 'I did not need your code, Tartaglia. I needed your name. I have had it since September.' },
        { m: 'Goodnight.' },
        { go: 'end' },
      ],
      end: [free('signora', 'os_deadline')],
      // the chapter ended before she got an answer (or before 23:00): resolve it now
      x: [
        { if: (s) => !F(s).osial_choice, go: 'x_silent' },
        { go: 'wire' },
      ],
      x_silent: [
        { fx: { set: { osial_stalled: true, osial_choice: 'silence' } } },
        { m: 'Silence, then.' },
        { go: 'wire' },
      ],
    },
  });

  // ── 8. Yelan after midnight (ch6, if she was given the hand) ─────
  scene({
    id: 'yelan_sunday',
    thread: 'yelan',
    ch: 'sun_night',
    trigger: { on: 'time', at: '+3 00:40' },
    when: (s) => alive(s) && !!F(s).leaked_yelan,
    expire: 'x',
    nodes: {
      start: waitFor('yelan', 'yelan_sunday', 'go'),
      go: [
        lock('yelan', 'yelan_sunday'),
        { if: (s) => !!F(s).osial_sent, go: 'sent' },
        { m: 'The sea\'s flat. My people are pulling three very ugly machines out of the water. One of them is still humming. We\'re ignoring it.' },
        { go: 'debts' },
      ],
      sent: [
        { m: 'You dealt with me and you gave her the code anyway.' },
        { m: 'That\'s not a bluff. That\'s just losing. 🎲' },
        { go: 'debts' },
      ],
      debts: [
        { m: 'I keep my debts.' },
        { if: (s) => !!F(s).yelan_protects_childe, go: 'door' },
        { go: 'kids' },
      ],
      door: [
        { m: 'When this is over, if he wants out, tell him the Qixing has a door. It opens once.' },
        { fx: { set: { yelan_door: true } } },
        { go: 'kids' },
      ],
      kids: [
        { if: (s) => !!F(s).yelan_protects_kids, go: 'kids2' },
        { go: 'ask' },
      ],
      kids2: [
        { m: 'And your siblings slept through all of it. Their new shadow says the little one snores like a walrus.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: "We're even.", fx: { set: { yelan_end: 'even' } }, go: 'even' },
          { t: 'Thank you, Yelan.', fx: { set: { yelan_end: 'thanks' } }, go: 'thanks' },
          { t: 'Tell him yourself.', fx: { set: { yelan_end: 'tell' } }, go: 'tell' },
        ] },
      ],
      even: [
        { m: 'We were never playing the same game. But sure. Even. 🎲' },
        free('yelan', 'yelan_sunday'),
      ],
      thanks: [
        { m: 'Yelan. Hm. I don\'t remember telling you my name.' },
        { m: 'I\'ll let it slide. Tonight I\'m in a good mood.' },
        free('yelan', 'yelan_sunday'),
      ],
      tell: [
        { m: 'I intend to. Tomorrow. He\'ll be easy to find. He always is, eventually.' },
        free('yelan', 'yelan_sunday'),
      ],
      x: [free('yelan', 'yelan_sunday')],
    },
  });

  // ── 9. The hideout leaks (zl_broken / morax_sold, with knows_hideout) ──
  scene({
    id: 'os_hideout',
    thread: 'signora',
    ch: 'sun_night',
    trigger: { on: 'time', at: '+3 01:15' },
    when: (s) => alive(s) && !!F(s).knows_hideout && !!(F(s).zl_broken || F(s).morax_sold),
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_hideout', 'go'),
      go: [
        lock('signora', 'os_hideout'),
        { fx: { set: { hideout_leaked: true } } },
        { m: 'Wangsheng Funeral Parlor.' },
        { m: 'Coffin four. How very theatrical, Tartaglia. Or whoever has been holding your phone.' },
        { if: (s) => !!F(s).morax_sold, go: 'sold' },
        { m: 'The consultant is no longer protecting it. The funeral girl stopped lying for you at about midnight. Contracts are such fragile things.' },
        { go: 'ask' },
      ],
      sold: [
        { m: 'You told the table to ask the funeral consultant. So I did. He was very polite. His director, less so. She talks a great deal when she is angry.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'Leave him alone.', fx: { set: { hideout_c: 'leave' } }, go: 'leave' },
          { t: "You're bluffing.", fx: { set: { hideout_c: 'bluff' } }, go: 'bluff' },
          { t: '[Say nothing]', silent: true, fx: { set: { hideout_c: 'silent' } }, go: 'silent' },
        ] },
      ],
      leave: [
        { m: '"Him." Not "me".' },
        { m: 'My people are on Feiyun Slope. We will see who is in the coffin by morning.' },
        free('signora', 'os_hideout'),
      ],
      bluff: [
        { m: 'Then you will sleep well tonight. My people are on Feiyun Slope. They will not.' },
        free('signora', 'os_hideout'),
      ],
      silent: [
        { m: 'Feiyun Slope, by morning.' },
        free('signora', 'os_hideout'),
      ],
      x: [free('signora', 'os_hideout')],
    },
  });

  // ── 10. Monday: Signora's last message (ch7 +60 ≈ 08:25) ─────────
  scene({
    id: 'os_last',
    thread: 'signora',
    ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 60 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('signora', 'os_last', 'go'),
      go: [
        lock('signora', 'os_last'),
        { if: (s) => !!F(s).osial_sent, go: 'obeyed' },
        { if: stopped, go: 'outplayed' },
        { go: 'scape' },
      ],
      obeyed: [
        { m: 'Thank you, Tartaglia. The Tsaritsa sends her regards.' },
        { m: 'Half of Guyun is under water and the harbor smells of something very old. Your name will be remembered.' },
        { m: 'Not fondly.' },
        { go: 'fate' },
      ],
      outplayed: [
        { if: (s) => !!(F(s).osial_fake || F(s).osial_stalled), go: 'hunting' },
        { m: 'Well played.' },
        { m: 'I have been outplayed by a man who names fish after his colleagues. I will not forget it.' },
        { if: (s) => sus(s, 'signora') >= 4, go: 'wearing' },
        { go: 'fate' },
      ],
      hunting: [
        { if: (s) => !!F(s).osial_fake, go: 'hunt_fake' },
        { m: 'You stalled, and while you stalled, someone took my sea away from me.' },
        { m: 'I do not know how yet. I will. And then I will come and find you, wherever the Tsaritsa puts you.' },
        { go: 'fate' },
      ],
      hunt_fake: [
        { m: 'Your fake code is framed on my office wall. It is in excellent company.' },
        { if: (s) => F(s).sig_tone === 'meek', go: 'hunt_meek' },
        { m: 'I will find out who stopped my sea. And then I will find you.' },
        { go: 'fate' },
      ],
      hunt_meek: [
        { m: 'It hangs next to your apology from Friday.' },
        { m: 'I will find out who stopped my sea. And then I will find you.' },
        { go: 'fate' },
      ],
      wearing: [
        { m: 'Or by whoever has been wearing his voice this weekend. I have not yet decided which is worse.' },
        { go: 'fate' },
      ],
      scape: [
        { m: 'It is done, and it is yours. Every page. I told you on the ninth.' },
        { m: 'The harbor is counting broken windows this morning. Every insurance claim in Liyue has your name on it.' },
        { go: 'fate' },
      ],
      fate: [
        { if: (s) => !!F(s).defected, go: 'run' },
        { if: recalled, go: 'ferry' },
        { go: 'ask' },
      ],
      run: [
        { m: 'And I am told you have resigned.' },
        { m: 'Run, then. Liyue is a small city, and I am very patient.' },
        { go: 'ask' },
      ],
      ferry: [
        { m: 'The Tsaritsa has summoned you. The 18:00 ferry. I will be on the pier to wave.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'See you on the pier, Signora. 😁', fx: { set: { sig_last: 'pier' } }, go: 'pier' },
          { t: 'Next time, I win.', fx: { set: { sig_last: 'win' } }, go: 'win' },
          { t: "I'm sorry it ended like this.", fx: { set: { sig_last: 'sorry' }, sus: { signora: 2 } }, go: 'sorry' },
          { t: '[Leave on read]', silent: true, fx: { set: { sig_last: 'read' } }, go: 'read' },
        ] },
      ],
      pier: [
        { m: 'Wear something warm. The sea is cold in October. You of all people should know.' },
        free('signora', 'os_last'),
      ],
      win: [
        { m: 'There is no next time, Tartaglia. There is only the table, and the table remembers.' },
        free('signora', 'os_last'),
      ],
      sorry: [
        { typing: 4 },
        { m: 'Tartaglia does not apologise to me.' },
        { m: 'Remember that, whoever you are, the next time you borrow a man.' },
        free('signora', 'os_last'),
      ],
      read: [
        { wait: 5 },
        { m: 'Goodbye, Tartaglia.' },
        free('signora', 'os_last'),
      ],
      x: [free('signora', 'os_last')],
    },
  });

  // ── 11. Monday 09:05: Dottore's final message ────────────────────
  scene({
    id: 'dottore_monday',
    thread: 'dottore',
    ch: 'mon',
    trigger: { on: 'time', at: '+3 09:05' },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('dottore', 'dottore_monday', 'go'),
      go: [
        lock('dottore', 'dottore_monday'),
        { if: (s) => !!F(s).arle_protects, go: 'arle' },
        { if: (s) => !!F(s).dottore_cancelled, go: 'cancel' },
        { if: (s) => !!F(s).dottore_agreed, go: 'agreed' },
        { go: 'late' },
      ],
      arle: [
        { m: 'The Knave was waiting in my clinic at 08:45. She was sitting in my chair, holding my scalpel by the blade, as if it could not cut her.' },
        { m: 'Perhaps it cannot. I should like to find out one day.' },
        { m: 'I have postponed the boy. Indefinitely. Give her my regards. From a distance.' },
        { go: 'end' },
      ],
      cancel: [
        { m: 'You cancelled our appointment. How disappointing.' },
        { m: 'I have simply rescheduled. I always reschedule. His plane leaves at 13:10, I believe. There will be other Mondays.' },
        { go: 'end' },
      ],
      agreed: [
        { m: 'Nine o\'clock, Tartaglia. You promised. I have the lollipop.' },
        { m: 'The boy is late.' },
        { wait: 4 },
        { m: 'Your sister answered the hotel phone. She said "no" in a tone I have only ever heard from you, and then she hung up on me.' },
        { m: 'They are already at the airport. Four hours early. She is very like you. I have noted it. Both of them, in fact.' },
        { go: 'end' },
      ],
      late: [
        { m: 'Nine o\'clock. The boy is late.' },
        { m: 'I will come to him.' },
        { wait: 5 },
        { m: 'Never mind. Your sister has taken him to the airport four hours early. She is very like you. I have noted it.' },
        { go: 'end' },
      ],
      end: [free('dottore', 'dottore_monday')],
      x: [free('dottore', 'dottore_monday')],
    },
  });

  // ── 12. Monday: Ekaterina (ch7 +550) ─────────────────────────────
  scene({
    id: 'ekat_monday',
    thread: 'ekat',
    ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 550 },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('ekat', 'ekat_monday', 'go'),
      go: [
        lock('ekat', 'ekat_monday'),
        { if: (s) => !!F(s).ekat_taken, go: 'taken' },
        { if: (s) => !!F(s).ekat_warned, go: 'safe' },
        { if: (s) => !!(F(s).leaked_yelan || F(s).leaked_ning), go: 'scared' },
        { m: 'Sir. Monday. The aquarium is not frozen. Pyotr is not on fire. I have checked twice.' },
        { go: 'foreman' },
      ],
      taken: [
        { m: 'Sir. I\'m home.' },
        { m: 'They kept me at the branch until four in the morning. They asked the same question two hundred times. I said "I don\'t know" two hundred times.' },
        { m: 'I\'m all right. Please don\'t come here.' },
        { go: 'foreman' },
      ],
      safe: [
        { m: 'Sir. I\'m back at my desk. Signora\'s office is empty. They left in a hurry. They left the locksmith.' },
        { m: 'He is sitting in the lobby. Boris has made him tea.' },
        { go: 'foreman' },
      ],
      scared: [
        { m: 'Sir… people from Signora\'s office were at my desk this morning. They were very polite. They asked about the Qixing.' },
        { m: 'I said nothing. Should I be afraid?' },
        { go: 'foreman' },
      ],
      foreman: [
        { if: (s) => !!F(s).factory_bank, go: 'foreman2' },
        { go: 'ask' },
      ],
      foreman2: [
        { m: 'Also, Sir: Big Boris has asked whether the toy factory can become permanent. I am told I am now "foreman". I have accepted.' },
        { go: 'ask' },
      ],
      ask: [
        { choice: [
          { t: 'Thank you, Ekaterina. For everything.', fx: { set: { ekat_last: 'thanks' }, aff: { ekat: 1 } }, go: 'thanks' },
          { t: 'Take the week off. Paid. Northland pays 😁', fx: { set: { ekat_last: 'week' }, aff: { ekat: 1 } }, go: 'week' },
          { t: 'Good. Back to work.', fx: { set: { ekat_last: 'work' } }, go: 'work' },
        ] },
      ],
      thanks: [
        { typing: 3 },
        { m: 'Sir. You\'ve been saying that a lot this weekend.' },
        { m: 'I don\'t mind. I\'m just noticing.' },
        free('ekat', 'ekat_monday'),
      ],
      week: [
        { m: 'Pantalone will have a heart attack.' },
        { m: 'Accepted, Sir.' },
        free('ekat', 'ekat_monday'),
      ],
      work: [
        { m: 'Yes, Sir. Front desk.' },
        free('ekat', 'ekat_monday'),
      ],
      x: [free('ekat', 'ekat_monday')],
    },
  });

  // ── 13. Monday: Yelan settles up (ch7 +800) ──────────────────────
  scene({
    id: 'yelan_monday',
    thread: 'yelan',
    ch: 'mon',
    trigger: { on: 'chapter', ch: 'mon', delay: 800 },
    when: (s) => alive(s) && !!(F(s).yelan_met || s.done.yelan_deal),
    expire: 'x',
    nodes: {
      start: waitFor('yelan', 'yelan_monday', 'go'),
      go: [
        lock('yelan', 'yelan_monday'),
        { if: (s) => !!F(s).leaked_yelan && !!F(s).yelan_protects_childe, go: 'kept' },
        { if: (s) => !!F(s).leaked_yelan, go: 'vigil' },
        { m: 'You never played your hand. Pity. I\'d have liked to see what you were holding. 🎲' },
        { go: 'bye' },
      ],
      kept: [
        { m: 'Our deal\'s done. His name\'s off every list I keep.' },
        { if: (s) => !!F(s).defected, go: 'kept_door' },
        { go: 'bye' },
      ],
      kept_door: [
        { m: 'And he took the door. Good. Doors are wasted on people who don\'t walk through them.' },
        { go: 'bye' },
      ],
      vigil: [
        { m: 'I owe him nothing, and he owes Liyue a great deal. He\'ll sit a night vigil with the Millelith. It\'s just questions. Long ones.' },
        { m: 'Don\'t look at me like that. You chose. 🎲' },
        { go: 'bye' },
      ],
      bye: [
        { if: (s) => sus(s, 'yelan') >= 4 || !!F(s).yelan_knows, go: 'stranger' },
        { m: 'Goodbye, Tartaglia. Fish somewhere else for a while.' },
        free('yelan', 'yelan_monday'),
      ],
      stranger: [
        { m: 'Goodbye, stranger. Give the phone back. You were a good player, for someone who never held any cards.' },
        free('yelan', 'yelan_monday'),
      ],
      x: [free('yelan', 'yelan_monday')],
    },
  });

  // ── 14. Monday 13:30: Pulcinella, after the plane ────────────────
  scene({
    id: 'pulci_monday',
    thread: 'pulci',
    ch: 'mon',
    trigger: { on: 'time', at: '+3 13:30' },
    when: alive,
    expire: 'x',
    nodes: {
      start: waitFor('pulci', 'pulci_monday', 'go'),
      go: [
        lock('pulci', 'pulci_monday'),
        { m: 'They\'re in the air, my boy. Safe and sound.' },
        { if: hostage, go: 'driver' },
        { if: (s) => !!F(s).kids_rescued && !!F(s).fatui_pickup, go: 'moved' },
        { go: 'word' },
      ],
      driver: [
        { m: 'My driver took them to the airport himself. Such well-behaved children. Teucer gave him a drawing. It is of you. You are holding a toy.' },
        { go: 'word' },
      ],
      moved: [
        { m: 'Though I notice they did not spend their last night at my hotel. Someone moved them. I will find out who. I always do.' },
        { go: 'word' },
      ],
      word: [
        { m: 'You see? I always keep my word.' },
        { m: 'Remember that, Ajax, when you choose whose word to keep.' },
        free('pulci', 'pulci_monday'),
      ],
      x: [free('pulci', 'pulci_monday')],
    },
  });

  // ── Fatui Hospitality (total suspicion ≥ 25, or a Ripple post with a location after Saturday noon) ──
  S.onAct({
    id: 's2_post_loc', act: 'post', arc: 'osial', once: true,
    match: (p, s) => !!(p && p.loc) && s.now >= at('+1 12:00') && alive(s),
    fx: { set: { fatui_saw_post: true } }, start: 'caught_fatui', delay: 30,
  });
  scene({
    id: 'caught_fatui',
    thread: 'signora',
    trigger: { on: 'sus', who: 'total', at: 25 },
    when: alive,
    nodes: {
      start: [
        { typing: 4 },
        { if: (s) => !!F(s).fatui_saw_post, go: 'post' },
        { m: 'Good evening.' },
        { m: 'You are not Tartaglia.' },
        { m: 'Everyone at the table has noticed, you know. Scaramouche keeps a list. Pulcinella keeps a different list. Pantalone keeps a spreadsheet.' },
        { m: 'We traced this phone on Friday night. We were curious how long you would last.' },
        { go: 'come' },
      ],
      post: [
        { m: 'What a lovely photo.' },
        { m: 'Ripple attaches a location to everything, did you know? Tartaglia knows. Tartaglia has never once posted where he is.' },
        { m: 'You did.' },
        { go: 'come' },
      ],
      come: [
        { m: 'Do not run. Pulcinella\'s people are very good with stairs.' },
        { m: 'Whoever you are: please, leave the phone and go out the back. They\'re coming. I\'m so sorry.', th: 'ekat', from: 'ekat' },
        { wait: 3 },
        { m: 'Knock, knock.' },
        { wait: 4 },
        { ending: 'caught_fatui' },
      ],
    },
  });
})();
