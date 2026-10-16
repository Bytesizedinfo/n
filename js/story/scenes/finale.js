/* Finale — the night clock, falling asleep, Saturday 07:38 (Lost Mode), the real Jiang Cheng calling from
   Lotus Pier HQ, and the ending computation. Also: Swift Ride lost-item report, passcode change.
   Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const S = JC.story;

  const F = (s) => s.flags || {};
  const aff = (s, id) => (s.aff && s.aff[id]) || 0;
  const num = (s, k) => {
    const v = s.flags && s.flags[k];
    if (typeof v === 'number') return v;
    const c = s.counters && s.counters[k];
    return typeof c === 'number' ? c : 0;
  };
  const total = (s) => (typeof s.susTotal === 'function' ? s.susTotal() : 0);
  const night = (s) => !F(s).night_done;

  // ── Ending conditions (docs/STORY.md "Endings") ──────────────────
  const cond = {
    reunited: (s) => !!(F(s).wwx_invited && (F(s).memo_sent || F(s).wwx_thanked) && !F(s).burned),
    tea: (s) => !!(F(s).tea_yes && aff(s, 'lxc') >= 3),
    jl_hero: (s) => !!(F(s).car_handled && !F(s).car_cover && F(s).bday_planned && aff(s, 'jl') >= 3),
    legend: (s) => num(s, 'ops_morale') >= 3,
    unsent: (s) => !!(F(s).memo_heard && !F(s).memo_sent && !F(s).wwx_thanked),
  };
  cond.true = (s) => cond.reunited(s) && cond.tea(s) && cond.jl_hero(s) && total(s) < 12 && !!F(s).told_truth;

  // true > reunited > tea > jl_hero > legend > unsent > honest (honest only when no arc qualifies).
  function finaleEndings(s) {
    const out = ['true', 'reunited', 'tea', 'jl_hero', 'legend', 'unsent'].filter((id) => cond[id](s));
    if (!out.length) out.push('honest');
    return out;
  }

  // ── What "he" did through the other apps: the call picks the two most notable (in this order) ──
  // Lines are Jiang Cheng's. Flags come from js/story/scenes/react-*.js (docs/reactions/*.md).
  const APP_REMARKS = [
    { if: (s) => F(s).soup_owned, lines: ['You told him about the soup.', "Both times. He wasn't supposed to know about the first one."] },
    { if: (s) => F(s).soup_sent && !F(s).soup_owned, lines: ["And there's a pot of Auntie Lu's going to the Jingshi at ten-thirty.", "…It's the right soup."] },
    { if: (s) => F(s).fed_jc === true, lines: ['And somebody sent food to my room at one in the morning. From my account.', '…It was good.'] },
    { if: (s) => F(s).fed_jc === 'later', lines: ['And breakfast is coming to my room. From my own account.'] },
    { if: (s) => !!F(s).loc_nhs, lines: ['You shared my location with Nie Huaisang.', "He's going to ask about Jinxing Road for the rest of my life."] },
    { if: (s) => !!F(s).wn_paid, lines: ['You paid Wen Ning for the tow. He kept fifty for petrol.', '…Good.'] },
    { if: (s) => !!F(s).ate_on_card, lines: ['You ate on my card.', '…Did you eat enough.'] },
    { if: (s) => !!F(s).huang_fridge, lines: ['Old Huang says thank you for whatever you sent the house. He ate it. That is the rule.'] },
  ];
  const remarks = (s) => APP_REMARKS.filter((r) => { try { return r.if(s); } catch (e) { return false; } }).slice(0, 2);
  const remark = (k, j) => (s) => { const r = remarks(s)[k]; return (r && r.lines[j]) || null; };

  // ── The night clock: 23:47 → ~02:00 in ~35 minutes of play ──────
  // Jumps on top of the 1:1 clock, so the arcs land near their beats (car ~00:03, moon ~01:00).
  const tick = (wait, by) => [
    { wait },
    { if: (s) => F(s).night_done, go: 'stop' },
    { time: by },
  ];
  S.scene({
    id: 'night_clock',
    thread: 'ea',
    trigger: { on: 'unlock', delay: 170 },
    when: night,
    nodes: {
      start: [
        { time: '+12m' },
        ...tick(250, '+12m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+15m'),
        ...tick(300, '+12m'),
        ...tick(300, '+6m'),
      ],
      stop: [{ end: true }],
    },
  });

  // ── Falling asleep (~02:00, or earlier once every arc has settled) ─
  const settled = (s) => ['wwx_done', 'jl_done', 'lxc_done', 'ops_done', 'nhs_done'].every((k) => F(s)[k]);
  S.scene({
    id: 'night_end',
    thread: 'ea',
    trigger: { on: 'unlock', delay: 1560 },
    when: night,
    nodes: {
      start: [
        { if: settled, go: 'sleepy' },
        { fx: { inc: { night_wait: 1 } } },
        { if: (s) => num(s, 'night_wait') >= 14, go: 'sleepy' },
        { wait: 45 },
        { go: 'start' },
      ],
      sleepy: [
        { run: (api) => { try { api.os.setBattery(10); } catch (e) { /* optional */ } } },
        { notify: { app: 'settings', title: 'Low Battery', body: '10% of battery remaining' } },
        { wait: 20 },
        { fx: { set: { night_done: true } } },
        { time: '07:38', card: 'You plug his phone into your charger and close your eyes. Just for a minute. Across Lanling a wet dog is asleep on someone’s bed, a pot is cooling on a stove in Gusu, and in Room 1808 Jiang Cheng is asleep with no idea what he said tonight.' },
        { run: (api) => { try { api.os.setBattery(100); } catch (e) { /* optional */ } } },
        { start: 'morning' },
      ],
    },
  });

  // ── Saturday, 07:38 ──────────────────────────────────────────────
  // The lock screen renders its own "This iPhone has been lost." title above this message.
  const LOST = 'Please call Lotus Pier HQ. — J.C. Return it. I mean it.';
  S.scene({
    id: 'morning',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { fx: { set: { lost_mode: true, finale: true } } },
        { run: (api) => { try { api.os.lostMode({ message: LOST, phone: '+86 555 0716 0000', contact: 'hq' }); } catch (e) { /* optional */ } } },
        { wait: 4 },
        { m: "To whoever has this phone: this is Tang Mei, Mr. Jiang's assistant." },
        { m: 'He will call it from the Lotus Pier HQ line at 7:41. He was specific about the minute.' },
        { m: 'Please answer. He is calm.' },
        { m: '(He is not calm.)' },
        { if: (s) => F(s).wwx_invited, go: 'm_wwx', else: 'm_jl' },
      ],
      // He read everything on his laptop at six. Some of it, he keeps.
      m_wwx: [
        { me: 'Ignore everything this phone sent last night.', th: 'wwx' },
        { wait: 3 },
        { me: 'Except Sunday.', th: 'wwx' },
        { m: 'JIANG CHENG', th: 'wwx', from: 'wwx' },
        { m: 'ur LAPTOP just said "except sunday"', th: 'wwx', from: 'wwx' },
        { m: "IT STANDS. lan zhan it stands. i'm crying at 7am", th: 'wwx', from: 'wwx' },
        { m: '…wait. who did i talk to last night', th: 'wwx', from: 'wwx' },
        { go: 'm_jl' },
      ],
      m_jl: [
        { m: 'jiujiu called me from the HOTEL PHONE', th: 'jl', from: 'jl' },
        { m: 'he says he lost his phone in a taxi last night??', th: 'jl', from: 'jl' },
        { if: (s) => F(s).car_handled, go: 'm_jl_car' },
        { m: 'so who have i been texting', th: 'jl', from: 'jl' },
        { go: 'm_lxc' },
      ],
      m_jl_car: [
        { m: 'so who got sandu out of the pond', th: 'jl', from: 'jl' },
        { m: '…', th: 'jl', from: 'jl' },
        { m: 'whoever u are. thanks i guess', th: 'jl', from: 'jl' },
        { go: 'm_lxc' },
      ],
      m_lxc: [{ if: (s) => F(s).tea_yes, go: 'm_lxc_tea', else: 'ring' }],
      m_lxc_tea: [
        { me: 'Three.', th: 'lxc' },
        { m: 'Good morning, Wanyin. Three. 🙂', th: 'lxc', from: 'lxc' },
        { go: 'ring' },
      ],
      ring: [
        { wait: 10 },
        { time: '07:41' },
        { if: (s) => F(s).hq_talked, go: 'done' },
        { call: 'call_hq' },
      ],
      done: [{ end: true }],
    },
  });

  // ── The call. Shared by the incoming call, the callback, and the player phoning HQ. ─
  function hqNodes(opening, ignoreFlag, after) {
    const ignore = [{ fx: { set: { [ignoreFlag]: true } } }, { start: after }, { hangup: 'me' }];
    const first = [
      { t: `"I found it in the taxi. I'm sorry."`, go: 'truth' },
      { t: '"Swift Ride, Master Wu speaking."', label: '(Pretend to be the taxi driver)', go: 'driver' },
      { t: '(Say nothing)', go: 'silent' },
      { t: '(Hang up)', go: 'hang' },
    ];
    return {
      start: [{ fx: { set: { hq_talked: true } } }, ...opening, { choice: first }],
      hang: ignore,
      silent: [
        { say: 'I can hear you breathing.' },
        { say: "I've had a long night. You've had my phone for eight hours. Say something." },
        { choice: [
            { t: `"I found it in the taxi. I'm sorry."`, go: 'truth' },
            { t: '"Swift Ride, Master Wu speaking."', label: '(Pretend to be the taxi driver)', go: 'driver' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      driver: [
        { say: 'Master Wu is a woman.' },
        { say: "And she called Swift Ride at six this morning to say my phone wasn't in her car. Try again." },
        { choice: [
            { t: `"…Okay. I'm not the driver. I found it."`, go: 'truth' },
            { t: `"…I'm her husband."`, go: 'husband' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      husband: [
        { say: 'Her husband.' },
        { say: 'Put Master Wu on.' },
        { choice: [
            { t: `"…Fine. I'm not her husband. I found it."`, go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],

      truth: [
        { fx: { set: { told_truth: true, hq_truth: true } } },
        { say: '…' },
        { say: 'Fine.' },
        { say: 'Where are you.' },
        { choice: [
            { t: '"Jinxing Road 27. Lanling."', go: 'where' },
            { t: '"I can bring it to you myself."', go: 'bring' },
          ] },
      ],
      bring: [
        { say: "You're not taking my phone on any more trips. Where are you." },
        { choice: [
            { t: '"Jinxing Road 27. Lanling."', go: 'where' },
            { t: '(Hang up)', go: 'hang' },
          ] },
      ],
      where: [
        { say: "Stay there. Someone will come for it at ten. Don't touch anything else." },
        { say: '…' },
        { say: 'Did you read my messages?' },
        { choice: [
            { t: '"Some of them."', go: 'read_some' },
            { t: '"I answered some of them."', go: 'answered' },
            { t: '"No."', label: '(Lie) "No."', go: 'lie' },
          ] },
      ],
      lie: [
        { say: 'I have a laptop.' },
        { say: "I read every message this phone sent last night. At six o'clock this morning. In a hotel bathrobe." },
        { go: 'why' },
      ],
      read_some: [
        { say: 'Some.' },
        { say: 'And?' },
        { choice: [
            { t: '"…And I answered some of them."', go: 'answered' },
            { t: `"And I'm sorry."`, go: 'answered' },
          ] },
      ],
      answered: [
        { say: 'I know.' },
        { say: 'I have a laptop. I read every one of them at six this morning, in a hotel bathrobe, while Old Huang called me four times.' },
        { go: 'why' },
      ],
      why: [
        { say: 'So. Tell me why.' },
        { choice: [
            { t: '"They kept texting. They sounded like they needed an answer."', go: 'why_needed' },
            { t: `"I didn't want them to think you weren't there."`, go: 'why_there' },
            { t: '"Honestly? It was fun."', go: 'why_fun' },
          ] },
      ],
      why_needed: [
        { say: '…They always sound like that.' },
        { say: "That doesn't mean you answer." },
        { say: "…It usually doesn't mean I answer, either." },
        { go: 'r_wwx' },
      ],
      why_there: [
        { say: '…' },
        { say: "I wasn't." },
        { say: 'I was asleep in Room 1808 like an idiot.' },
        { go: 'r_wwx' },
      ],
      why_fun: [
        { say: 'Fun.' },
        { say: "You put my whole family's blood pressure through the roof and you found it fun." },
        { say: '…Tch. Apparently they did too.' },
        { go: 'r_wwx' },
      ],

      // What "he" did, one thing at a time.
      r_wwx: [{ if: (s) => F(s).wwx_invited, go: 'r_wwx_yes', else: 'r_wwx_no' }],
      r_wwx_yes: [
        { say: 'You told Wei Wuxian yes.' },
        { say: 'For Sunday. At Lotus Pier.' },
        { say: '(A long pause.)', from: 'sys' },
        { say: 'Six-thirty?' },
        { choice: [
            { t: `"He's bringing the soup."`, go: 'r_memo' },
            { t: `"He's bringing her pot."`, go: 'r_pot' },
          ] },
      ],
      r_pot: [
        { say: '…' },
        { say: 'He kept the pot.' },
        { say: 'Of course he kept the pot.' },
        { go: 'r_memo' },
      ],
      r_wwx_no: [{ if: (s) => F(s).wwx_maybe, go: 'r_notno' }, { go: 'r_memo' }],
      r_notno: [
        { say: 'And you told Wei Wuxian "not no".' },
        { say: 'He has a notebook now. With a section for me.' },
        { go: 'r_memo' },
      ],
      r_memo: [
        { if: (s) => F(s).memo_sent, go: 'r_memo_sent' },
        { if: (s) => F(s).wwx_thanked, go: 'r_thanked' },
        { if: (s) => F(s).memo_heard, go: 'r_memo_heard' },
        { go: 'r_tea' },
      ],
      r_memo_sent: [
        { say: '…And you sent it.' },
        { say: 'The memo.' },
        { say: '(For a while there is only his breathing, and somewhere behind him a hotel door closing.)', from: 'sys' },
        { say: 'Two years I kept that.' },
        { say: "Fine. That's— fine." },
        { go: 'r_tea' },
      ],
      r_thanked: [
        { say: 'And you thanked him. For the—' },
        { say: 'Tch.' },
        { say: '…Good. Someone had to.' },
        { go: 'r_tea' },
      ],
      r_memo_heard: [
        { say: 'And you listened to it. The memo. It says "played".' },
        { say: "Don't tell anyone what's on it." },
        { say: "…Don't tell me how it sounded, either." },
        { go: 'r_tea' },
      ],
      r_tea: [{ if: (s) => F(s).tea_yes, go: 'r_tea_yes', else: 'r_car' }],
      r_tea_yes: [
        { say: 'And tea.' },
        { say: "Today. Three o'clock. With Xichen." },
        { say: '…With Zewu-jun.' },
        { choice: [
            { t: '"He said you liked the white peony."', go: 'r_tea2' },
            { t: '"You should go."', go: 'r_tea2' },
          ] },
      ],
      r_tea2: [
        { say: "I wasn't going to go." },
        { say: '(A pause.)', from: 'sys' },
        { say: '…I was going to go.' },
        { if: (s) => !!F(s).ride_gusu, go: 'r_tea_car' },
        { go: 'r_car' },
      ],
      r_tea_car: [
        { say: "And there's a car booked to Cloud Recesses. On my account." },
        { say: "…I'll take it." },
        { go: 'r_car' },
      ],
      r_car: [{ if: (s) => F(s).car_handled, go: 'r_car_yes', else: 'r_car_no' }],
      r_car_yes: [
        { say: 'Sandu is out of the pond.' },
        { if: (s) => F(s).wn_towed, go: 'r_wn' },
        { say: "Old Huang's cousin towed it. Apparently one of the koi is famous now." },
        { go: 'r_bday' },
      ],
      r_wn: [
        { say: 'Wen Ning towed it. With a rope. He called the hotel at seven to apologize. Four times.' },
        { say: "…I'll call him." },
        { go: 'r_bday' },
      ],
      r_car_no: [{ if: (s) => F(s).car_known, go: 'r_car_pond' }, { go: 'r_bday' }],
      r_car_pond: [
        { say: 'And my car is still in a koi pond.' },
        { say: "You didn't think to mention that to anyone." },
        { go: 'r_bday' },
      ],
      r_bday: [{ if: (s) => F(s).bday_planned, go: 'r_bday_yes' }, { go: 'r_ops' }],
      r_bday_yes: [
        { say: 'Sizhui sent me a spreadsheet at six. Sunday is planned. Cake, venue, gift.' },
        { if: (s) => F(s).gift_bell, go: 'r_bell' },
        { go: 'r_ops' },
      ],
      r_bell: [{ say: 'You told them about the bell.' }, { say: '…Good.' }, { go: 'r_ops' }],
      r_ops: [{ if: (s) => num(s, 'ops_morale') >= 3, go: 'r_ops_yes' }, { go: 'r_ajie' }],
      r_ops_yes: [
        { say: 'And my operations group thinks I have become a different person.' },
        { say: "Old Huang sent me a voice message. He's crying. Happy crying, he says." },
        { go: 'r_ajie' },
      ],
      r_ajie: [{ if: (s) => F(s).ajie_wrote, go: 'r_ajie_yes' }, { go: 'r_pass' }],
      r_ajie_yes: [
        { say: '…' },
        { say: 'You wrote to my sister.' },
        { say: "It didn't go through." },
        { say: 'It never does.' },
        { say: 'What did you say to her?' },
        { choice: [
            { t: '"That A-Ling turns eighteen on Sunday."', go: 'r_ajie2' },
            { t: '"That you still write to her."', go: 'r_ajie2' },
            { t: '(Say nothing)', go: 'r_ajie2' },
          ] },
      ],
      r_ajie2: [{ say: '…' }, { say: 'Okay.' }, { go: 'r_pass' }],
      r_pass: [{ if: (s) => F(s).changed_passcode, go: 'r_pass_yes' }, { go: 'r_apps' }],
      r_pass_yes: [
        { say: 'And you changed my passcode.' },
        { choice: [
            { t: '"Your old one was a birthday card."', go: 'r_pass2' },
            { t: '"Jin Ling told you to. Twice."', go: 'r_pass2' },
          ] },
      ],
      r_pass2: [{ say: '…Tch.' }, { say: 'Fine.' }, { go: 'r_apps' }],
      r_apps: [
        { say: remark(0, 0) }, { say: remark(0, 1) },
        { say: remark(1, 0) }, { say: remark(1, 1) },
        { go: 'close' },
      ],

      close: [{ if: (s) => cond.true(s), go: 'invite' }, { go: 'bye' }],
      bye: [
        { say: "Someone will come for the phone at ten. Tang Mei. Don't argue with her. Nobody wins." },
        { say: '…' },
        { say: "And— you didn't throw it in a river. Fine." },
        { start: 'finale_end' },
        { hangup: true },
      ],
      invite: [
        { say: '…' },
        { say: 'Sunday.' },
        { say: 'Six-thirty. Lotus Pier.' },
        { say: "Wei Wuxian is bringing soup. Apparently there's enough. There's always enough, with her recipe." },
        { say: "Don't bring anything. Don't be late." },
        { choice: [
            { t: `"I'll be there."`, go: 'invite_yes' },
            { t: '"Are you sure?"', go: 'invite_sure' },
          ] },
      ],
      invite_sure: [{ say: "I don't ask twice." }, { go: 'invite_yes' }],
      invite_yes: [
        { say: 'Good.' },
        { say: 'Tang Mei will still come at ten. I need my phone. I am not an idiot.' },
        { say: '…Six-thirty.' },
        { start: 'finale_end' },
        { hangup: true },
      ],
    };
  }

  const firstIgnore = [{ fx: { set: { hq_ignored1: true } } }, { start: 'hq_after1' }];
  S.call({
    id: 'call_hq',
    from: 'hq',
    ring: 25,
    missed: firstIgnore,
    onHangup: firstIgnore,
    nodes: hqNodes([{ say: 'You. Whoever has my phone.' }, { say: "Don't hang up." }], 'hq_ignored1', 'hq_after1'),
  });
  S.call({
    id: 'call_hq_out',
    from: 'hq',
    onHangup: firstIgnore,
    nodes: hqNodes([
      { say: 'Lotus Pier, Yunmeng Jiang Gr—' },
      { say: '(A click. One bar of hold music. The switchboard patches you through to a hotel room in Lanling.)', from: 'sys' },
      { say: 'You. Whoever has my phone.' },
      { say: "Don't hang up." },
    ], 'hq_ignored1', 'hq_after1'),
  });
  S.dialScript('hq', 'call_hq_out', (s) => !!F(s).lost_mode);

  const secondIgnore = [{ fx: { set: { hq_ignored2: true } } }, { start: 'hq_after2' }];
  S.call({
    id: 'call_hq2',
    from: 'hq',
    ring: 25,
    missed: secondIgnore,
    onHangup: secondIgnore,
    nodes: hqNodes([
      { say: 'You hung up on me.' },
      { say: 'Nobody hangs up on me. Not twice.' },
      { say: 'Last chance.' },
    ], 'hq_ignored2', 'hq_after2'),
  });

  // After the first ignore he calls back; after the second, Zidian is waiting.
  S.scene({
    id: 'hq_after1',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).hq_truth, go: 'fin' },
        { wait: 15 },
        { call: 'call_hq2' },
      ],
      fin: [{ start: 'finale_end' }],
    },
  });
  S.scene({
    id: 'hq_after2',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: {
      start: [
        { if: (s) => F(s).hq_truth, go: 'fin' },
        { wait: 3 },
        { m: 'He has your address. He has Find My. He has a taxi waiting.', th: 'ea', from: 'ea' },
        { m: 'I would put the kettle on.', th: 'ea', from: 'ea' },
        { wait: 4 },
        { ending: 'zidian' },
      ],
      fin: [{ start: 'finale_end' }],
    },
  });
  S.scene({
    id: 'finale_end',
    thread: 'ea',
    trigger: { on: 'manual' },
    nodes: { start: [{ wait: 3 }, { endings: finaleEndings }] },
  });

  // ── Reporting the phone in Swift Ride → The Honest Stranger ──────
  S.scene({
    id: 'swift_report',
    thread: 'swift',
    trigger: { on: 'act', act: 'ride_report_lost' },
    nodes: {
      start: [
        { wait: 3 },
        { m: '[Swift Ride] Thank you. Found-item report #SR-1016-2347 has been sent to the driver, Master Wu Lihua, and to the account holder.' },
        { wait: 6 },
        { m: '[Swift Ride] The account holder has been contacted at his registered email. Please keep the item safe; he will reach you shortly. Thank you for being a Swift Ride Good Samaritan!' },
        { wait: 4 },
        { ending: 'honest' },
      ],
    },
  });

  // ── The passcode is no longer a birthday card ────────────────────
  S.scene({
    id: 'passcode_changed',
    thread: 'jl',
    trigger: { on: 'act', act: 'setting', match: (p) => !!p && p.key === 'passcode' },
    nodes: { start: [{ fx: { set: { changed_passcode: true } } }] },
  });
})();
