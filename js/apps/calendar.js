/* Calendar — iOS 26: scrolling Month view (event dots, Chinese lunar dates), Year view, Day view (hour timeline with
   current-time line), List view, search, Calendars sheet, Inbox (invitations), event detail, New/Edit Event sheet. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;

  // ── Calendars ──────────────────────────────────────────────────────────────
  const BASE_CALS = [
    { id: 'work', title: 'Work', color: '#0a84ff', group: 'iCloud' },
    { id: 'home', title: 'Home', color: '#bf5af2', group: 'iCloud' },
    { id: 'family', title: 'Family', color: '#ff375f', group: 'iCloud' },
    { id: 'health', title: 'Medication', color: '#30b0c7', group: 'iCloud' },
    { id: 'birthdays', title: 'Birthdays', color: '#ff9f0a', group: 'Other', ro: true },
    { id: 'holidays', title: 'Holidays in China', color: '#30d158', group: 'Subscribed', ro: true },
  ];

  // ── Seed events ────────────────────────────────────────────────────────────
  const E = (id, cal, title, start, end, o) => Object.assign({ id, cal, title, start, end, allDay: false, location: '', notes: '', tentative: false }, o || {});
  JC.store.seed('events', [
    // tonight & this weekend
    E('ev_gala', 'work', 'Jin Group Gala', '+0 19:00', '+0 23:30', { location: 'Koi Tower, Lanling', notes: 'Autumn Charity Gala. Black tie. Table 1.\nSeating chart “changed” — Nie Huaisang emailed (“hehe”).\nLeave by 11.', alert: 60, invitees: ['nhs', 'lxc', 'jl'], organizer: 'Jin Group Events', url: 'jingroup.lanling/gala' }),
    // Lan Xichen's invitation, sent after Wednesday's call; Jiang Cheng answered "Maybe". Accepting or declining it here
    // tells him (story: js/story/scenes/react-life.js).
    E('ev_tea_q', 'home', 'Tea? — Hanshi', '+1 15:00', '+1 17:00', { location: 'The Hanshi, Cloud Recesses', notes: 'He said “Saturday, perhaps three?”\nI said I’d see.', tentative: true, organizer: 'Lan Xichen', organizerId: 'lxc' }),
    E('ev_aling18', 'family', 'A-Ling turns 18 🎂', '+2 00:00', '+2 23:59', { allDay: true, notes: 'The bell. The cake (lotus seed paste). Do not make a speech.', alert: 'd0' }),
    E('ev_dinner', 'family', 'Dinner — Lotus Pier (?)', '+2 18:30', '+2 21:00', { location: 'Lotus Pier Residence, Yunmeng', notes: 'Cake: pick up 17:00 (Sizhui’s bakery).\nChairs: four? five?\nSoup — he said he’d bring it. If.', alert: 120 }),
    E('ev_board', 'work', 'Board — Q4', '+3 09:00', '+3 11:00', { location: 'Lotus Pier HQ, Boardroom 1', notes: 'Deck: Tang Mei. Talking points in Notes.\nDo not engage on Dog Friday.', alert: 30, organizer: 'Tang Mei', organizerId: 'ea' }),
    // this week (past)
    E('ev_sync', 'work', 'Exec Team Sync', '2026-09-07 10:00', '2026-09-07 11:00', { location: 'Lotus Pier HQ, Boardroom 2', repeat: 'weekly', exdates: ['2026-10-05'], notes: 'Weekly. Tang Mei sends the agenda Sunday night.' }),
    E('ev_ops', 'work', 'Ops review — Q4 targets', '-3 14:00', '-3 15:30', { location: 'Lotus Pier HQ', notes: 'Liu Qian. Whiteboard. (Someone will draw a dog.)' }),
    E('ev_port', 'work', 'Yunmeng Port — cold chain walkthrough', '-2 10:30', '-2 12:00', { location: 'Yunmeng Port, Warehouse 3' }),
    E('ev_drive', 'home', 'Drive to Lanling', '-1 12:30', '-1 15:00', { location: 'Golden Peony Hotel, Lanling', notes: 'Sandu. Room 1808 from Thursday.' }),
    E('ev_ptc', 'family', 'Parent–teacher conference', '-1 16:00', '-1 17:00', { location: 'Lanling International School', notes: 'Ms. Su. Room 3B. (The chemistry thing.)' }),
    E('ev_run', 'home', 'Run', '+0 06:00', '+0 06:45', { location: 'Lanling Riverside', notes: '6.2 km.' }),
    E('ev_jinlog', 'work', 'Jin Group — logistics partnership', '+0 10:00', '+0 11:30', { location: 'Koi Tower, 38F', notes: 'Bring the cold-chain numbers. Not the lotus root numbers.' }),
    // the month ahead
    E('ev_lotuseats', 'work', 'Lotus Eats — contract renewal', '+4 11:00', '+4 12:00', { location: 'Lotus Pier HQ', notes: '3%, not 5%.' }),
    E('ev_interview', 'work', 'Interview — Head of Cold Chain', '+5 15:00', '+5 16:00', { location: 'Lotus Pier HQ, Room 6' }),
    E('ev_chamber', 'work', 'Yunmeng Chamber of Commerce breakfast', '+6 08:00', '+6 09:30', { location: 'Yunmeng Lake Pavilion' }),
    E('ev_hep', 'health', 'Hepatology follow-up', '+11 09:30', '+11 10:30', { location: 'Yunmeng People’s Hospital', notes: 'Fasting from midnight. Bring the old results.\n(Liver panel, tacrolimus level.)', alert: 'd1' }),
    E('ev_wh3', 'work', 'Site visit — Warehouse 3', '+12 13:00', '+12 15:00', { location: 'Yunmeng Port, Warehouse 3' }),
    E('ev_archery', 'family', 'A-Ling — archery regionals', '+13 18:00', '+13 20:00', { location: 'Lanling Sports Center', notes: 'Bring the good bow. (Not the gold one.)' }),
    E('ev_investor', 'work', 'Investor call — H2 outlook', '+19 10:00', '+19 11:00', { notes: 'Dial-in from Tang Mei.' }),
    E('ev_test', 'family', 'A-Ling — driving test', '+28 09:00', '+28 10:00', { location: 'Vehicle Administration Office, Lanling', notes: 'God help Lanling.' }),
    // the past
    E('ev_ma_staff', 'work', 'Mid-Autumn — staff mooncakes', '2026-09-25 15:00', '2026-09-25 16:00', { location: 'Lotus Pier HQ, Canteen' }),
    E('ev_ma_dinner', 'family', 'Mid-Autumn dinner — A-Ling home', '2026-09-25 18:30', '2026-09-25 20:30', { location: 'Lotus Pier Residence, Yunmeng' }),
    E('ev_qingming', 'family', 'Qingming — Yiling', '2026-04-05 00:00', '2026-04-05 23:59', { allDay: true, location: 'Yiling, hill cemetery', notes: 'Wen Qing. Under the camphor tree. Flowers.' }),
    // yearly & medication
    E('ev_ajie_bday', 'family', 'A-Jie’s birthday', '2010-02-12 00:00', '2010-02-12 23:59', { allDay: true, repeat: 'yearly', notes: 'Text her. (It won’t deliver. Text her anyway.)' }),
    E('ev_ajie', 'family', 'A-Jie', '2010-11-02 00:00', '2010-11-02 23:59', { allDay: true, repeat: 'yearly', notes: 'Tang Mei keeps the day clear.' }),
    E('ev_parents', 'family', 'Mother & Father', '2009-08-23 00:00', '2009-08-23 23:59', { allDay: true, repeat: 'yearly' }),
    E('ev_tac_am', 'health', 'Tacrolimus 2 mg', '2026-01-01 08:00', '2026-01-01 08:10', { repeat: 'daily', notes: 'With water. Not with grapefruit.' }),
    E('ev_tac_pm', 'health', 'Tacrolimus 2 mg', '2026-01-01 20:00', '2026-01-01 20:10', { repeat: 'daily' }),
  ]);
  JC.store.seed('calinvites', [
    { id: 'inv_wwx', from: 'wwx', organizer: 'Wei Wuxian', cal: 'family', title: 'radish harvest party!!! 🥕 (u have to come)', start: '+15 14:00', end: '+15 18:00', location: 'Yiling Radish Co.', notes: 'its my birthday. bring nothing. bring yourself.\n(bring jin ling) (bring fairy) (DONT bring fairy)', status: null, sent: '-1 23:58' },
    { id: 'inv_qr', from: 'qr', organizer: 'Lan Qiren', cal: 'work', title: 'Gusu Lan Academy — Board Dinner', start: '+8 18:00', end: '+8 20:30', location: 'Cloud Recesses', notes: 'Formal attire. No alcohol will be served.\n— Lan Qiren', status: null, sent: '-5 09:00' },
    { id: 'inv_nhs', from: 'nhs', organizer: 'Nie Huaisang', cal: 'home', title: '🪭 Fans & Folly — Autumn Exhibition', start: '+14 19:00', end: '+14 22:00', location: 'The Unclean Realm, Qinghe', notes: 'Brother Jiang you HAVE to come hehe~ there will be snacks 🙈', status: null, sent: '-2 13:30' },
    { id: 'inv_school', from: null, organizer: 'Lanling International School', cal: 'family', title: 'Senior Parents’ Committee', start: '+22 10:00', end: '+22 11:30', location: 'Lanling International School', notes: 'Graduation planning. Coffee provided.', status: null, sent: '-6 08:00' },
    { id: 'inv_gala', from: null, organizer: 'Jin Group Events', cal: 'work', title: 'Jin Group Gala', start: '+0 19:00', end: '+0 23:30', location: 'Koi Tower, Lanling', notes: '', status: 'accepted', sent: '-30 10:00', eventId: 'ev_gala' },
  ]);

  // the story adds an accepted "Tea — Hanshi" (ev_tea); the tentative one disappears (no question mark)
  function dedupeTea() {
    if (JC.store.get('events', 'ev_tea') && JC.store.get('events', 'ev_tea_q')) JC.store.remove('events', 'ev_tea_q');
  }
  JC.store.on('events', dedupeTea);

  // ── Chinese calendar (2026–2027) ──────────────────────────────────────────
  const LUNAR = [['2026-01-19', 12], ['2026-02-17', 1], ['2026-03-19', 2], ['2026-04-17', 3], ['2026-05-17', 4], ['2026-06-15', 5], ['2026-07-14', 6], ['2026-08-13', 7], ['2026-09-11', 8], ['2026-10-10', 9], ['2026-11-09', 10], ['2026-12-09', 11], ['2027-01-08', 12], ['2027-02-06', 1], ['2027-03-08', 2]];
  const LM = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
  const LD = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十', '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十', '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  const LFEST = { '1-1': '春节', '1-15': '元宵', '5-5': '端午', '7-7': '七夕', '7-15': '中元', '8-15': '中秋', '9-9': '重阳', '10-1': '寒衣', '12-8': '腊八', '12-23': '小年' };
  const TERMS = { '2026-02-04': '立春', '2026-04-05': '清明', '2026-06-21': '夏至', '2026-08-07': '立秋', '2026-09-23': '秋分', '2026-10-08': '寒露', '2026-10-23': '霜降', '2026-11-07': '立冬', '2026-11-22': '小雪', '2026-12-07': '大雪', '2026-12-22': '冬至', '2027-01-05': '小寒', '2027-01-20': '大寒', '2027-02-04': '立春' };
  const LSTART = LUNAR.map(([d, m]) => [new Date(d + 'T00:00:00').getTime(), m]);
  function lunar(d) {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const key = dk(d);
    if (TERMS[key]) return { label: TERMS[key], fest: true };
    for (let i = LSTART.length - 2; i >= 0; i--) {
      if (t >= LSTART[i][0]) {
        if (t >= LSTART[i + 1][0]) return null;
        const day = Math.round((t - LSTART[i][0]) / 86400e3) + 1;
        const m = LSTART[i][1];
        const len = Math.round((LSTART[i + 1][0] - LSTART[i][0]) / 86400e3);
        if (m === 12 && day === len) return { label: '除夕', fest: true };
        if (LFEST[m + '-' + day]) return { label: LFEST[m + '-' + day], fest: true };
        return { label: day === 1 ? LM[m] : LD[day - 1], fest: false, monthStart: day === 1 };
      }
    }
    return null;
  }
  const HOLIDAYS = [
    ['2026-01-01', 'New Year’s Day'], ['2026-02-16', 'Chinese New Year’s Eve'], ['2026-02-17', 'Spring Festival'], ['2026-03-03', 'Lantern Festival'],
    ['2026-04-05', 'Qingming Festival'], ['2026-05-01', 'Labour Day'], ['2026-06-19', 'Dragon Boat Festival'], ['2026-08-19', 'Qixi Festival'],
    ['2026-09-25', 'Mid-Autumn Festival'], ['2026-10-01', 'National Day'], ['2026-10-18', 'Double Ninth Festival'], ['2026-12-22', 'Winter Solstice'],
    ['2027-01-01', 'New Year’s Day'], ['2027-02-05', 'Chinese New Year’s Eve'], ['2027-02-06', 'Spring Festival'],
  ];

  // ── date helpers ──────────────────────────────────────────────────────────
  const MONTHS = U.MONTHS;
  const DAY = 86400e3;
  function dk(d) { d = new Date(d); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function sod(t) { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function addDays(t, n) { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); }
  function addMonths(t, n) { const d = new Date(t); d.setMonth(d.getMonth() + n); return d.getTime(); }
  const today = () => sod(JC.time.now());
  const fmtT = (t) => U.fmtTime(t);
  function fmtRange(o) {
    if (o.allDay) return 'all-day';
    return fmtT(o.start) + ' – ' + fmtT(o.end);
  }
  function longDate(t) { return U.fmtDate(t, 'full'); }

  // ── state (persisted lightly) ─────────────────────────────────────────────
  function prefs() { return Object.assign({ hidden: {}, alt: true, custom: [] }, JC.state.get('apx_calendar') || {}); }
  function setPrefs(p) { JC.state.set('apx_calendar', Object.assign(prefs(), p)); }
  function cals() { return BASE_CALS.concat(prefs().custom || []); }
  function calById(id) { return cals().find((c) => c.id === id) || BASE_CALS[1]; }
  const visible = (cid) => !prefs().hidden[cid];

  // ── occurrences ───────────────────────────────────────────────────────────
  const STEP = { daily: (t, n) => addDays(t, n), weekly: (t, n) => addDays(t, 7 * n), biweekly: (t, n) => addDays(t, 14 * n), monthly: (t, n) => addMonths(t, n), yearly: (t, n) => addMonths(t, 12 * n) };
  function expand(ev, from, to, out) {
    const dur = Math.max(0, (ev.end || ev.start) - ev.start);
    const push = (s) => {
      const e = s + dur;
      if (e < from || s > to) return;
      if (ev.exdates && ev.exdates.includes(dk(s))) return;
      if (ev.until && s > ev.until) return;
      out.push({ ev, id: ev.id, key: ev.id + '@' + dk(s), title: ev.title, cal: ev.cal, start: s, end: e, allDay: !!ev.allDay, location: ev.location, tentative: !!ev.tentative, recurring: !!ev.repeat });
    };
    if (!ev.repeat || !STEP[ev.repeat]) { push(ev.start); return; }
    let n = 0;
    if (ev.repeat === 'daily' && from > ev.start) n = Math.max(0, Math.floor((from - ev.start) / DAY) - 1);
    if (ev.repeat === 'yearly' && from > ev.start) n = Math.max(0, new Date(from).getFullYear() - new Date(ev.start).getFullYear() - 1);
    for (let guard = 0; guard < 800; guard++, n++) {
      const s = STEP[ev.repeat](ev.start, n);
      if (s > to) break;
      push(s);
    }
  }
  function generated(from, to) {
    const out = [];
    if (visible('holidays')) HOLIDAYS.forEach(([d, t]) => {
      const s = new Date(d + 'T00:00:00').getTime();
      if (s >= from - DAY && s <= to) out.push({ id: 'hol_' + d, key: 'hol_' + d, title: t, cal: 'holidays', start: s, end: s + DAY - 60e3, allDay: true, ro: true });
    });
    if (visible('birthdays')) JC.contacts.all().filter((c) => c.bday && !['ajie', 'mom', 'dad'].includes(c.id) && !c.service).forEach((c) => {
      const [y, m, d] = c.bday.split('-').map(Number);
      for (let yy = new Date(from).getFullYear(); yy <= new Date(to).getFullYear(); yy++) {
        const s = new Date(yy, m - 1, d).getTime();
        if (s < from - DAY || s > to) continue;
        const age = yy - y;
        out.push({ id: 'bd_' + c.id + '_' + yy, key: 'bd_' + c.id + '_' + yy, title: JC.contacts.name(c.id) + '’s Birthday', cal: 'birthdays', start: s, end: s + DAY - 60e3, allDay: true, ro: true, contact: c.id, age });
      }
    });
    return out;
  }
  function occurrences(from, to) {
    const out = [];
    JC.store.all('events').forEach((ev) => { if (visible(ev.cal)) expand(ev, from, to, out); });
    return out.concat(generated(from, to)).sort((a, b) => (b.allDay - a.allDay) || a.start - b.start || (a.title < b.title ? -1 : 1));
  }
  function dayOcc(t) { const s = sod(t); return occurrences(s, s + DAY - 1).filter((o) => o.allDay ? sod(o.start) <= s && sod(o.end) >= s : true); }

  // ── calendar alerts (fire while the phone runs) ───────────────────────────
  const ALERTS = [
    { v: null, t: 'None' }, { v: 0, t: 'At time of event' }, { v: 5, t: '5 minutes before' }, { v: 10, t: '10 minutes before' }, { v: 15, t: '15 minutes before' },
    { v: 30, t: '30 minutes before' }, { v: 60, t: '1 hour before' }, { v: 120, t: '2 hours before' }, { v: 1440, t: '1 day before' }, { v: 2880, t: '2 days before' }, { v: 10080, t: '1 week before' },
  ];
  const ALERTS_ALLDAY = [{ v: null, t: 'None' }, { v: 'd0', t: 'On day of event (9 AM)' }, { v: 'd1', t: '1 day before (9 AM)' }, { v: 'd2', t: '2 days before (9 AM)' }, { v: 'd7', t: '1 week before (9 AM)' }];
  function alertLabel(o) { const l = (o.allDay ? ALERTS_ALLDAY : ALERTS).find((a) => a.v === (o.alert == null ? null : o.alert)); return l ? l.t : 'None'; }
  function alertTime(occ) {
    const a = occ.ev && occ.ev.alert;
    if (a == null) return null;
    if (typeof a === 'string') { const d = parseInt(a.slice(1), 10) || 0; return addDays(sod(occ.start), -d) + 9 * 3600e3; }
    return occ.start - a * 60e3;
  }
  let lastAlertCheck = 0;
  function checkAlerts() {
    const now = JC.time.now();
    const from = lastAlertCheck || now - 60e3;
    lastAlertCheck = now;
    if (now - from > 6 * 3600e3) return; // big jumps (time skips): don't flood
    occurrences(now - 8 * DAY, now + 8 * DAY).forEach((o) => {
      if (!o.ev || o.cal === 'health') return;
      const at = alertTime(o);
      if (at == null || at <= from || at > now) return;
      JC.notify.push({ app: 'calendar', title: o.title, body: (o.allDay ? U.fmtDate(o.start, 'day') + ' · all-day' : (U.sameDay(new Date(o.start), new Date(now)) ? 'Today' : U.fmtDate(o.start, 'day')) + ' at ' + fmtT(o.start)) + (o.location ? '\n' + o.location : ''), open: { app: 'calendar', intent: { id: o.id } } });
    });
  }
  JC.bus.on('boot', () => {
    lastAlertCheck = JC.time.now();
    JC.bus.on('minute', checkAlerts);
    const n = JC.store.all('calinvites').filter((i) => !i.status).length;
    JC.notify.badge('calendar', n);
    dedupeTea();
  });

  const PLACE_IDS = [[/koi tower/i, 'koi-tower'], [/golden peony/i, 'golden-peony'], [/hanshi/i, 'hanshi'], [/jingshi/i, 'jingshi'], [/cloud recesses/i, 'cloud-recesses'], [/lotus pier residence/i, 'lp-residence'], [/lotus pier/i, 'lotus-pier'], [/lanling international/i, 'lanling-intl'], [/unclean realm/i, 'unclean-realm'], [/radish/i, 'radish-farm'], [/laoma/i, 'laoma-hotpot'], [/guanyin/i, 'guanyin-temple'], [/yunmeng lake/i, 'yunmeng-lake'], [/pet kingdom/i, 'pet-kingdom']];
  function placeId(loc) { const m = PLACE_IDS.find(([re]) => re.test(loc || '')); return m ? m[1] : null; }

  JC.icon.add({
    'cal.list': '<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.5" cy="6.5" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1.2" fill="currentColor"/>',
    'cal.inbox': '<path d="M3.5 13.5 6 5.5h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M3.5 13.5h5l1 2h5l1-2h5"/>',
    'cal.split': '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M3.5 9h17M3.5 14.5h17M9.2 3.5v11M14.8 3.5v11"/>',
  });

  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'calendar',
    name: 'Calendar',
    status: 'auto',
    launch(win, intent0) {
      win.body.classList.add('app-calendar');
      const live = new Set();
      const keep = (pg) => { live.add(pg); return pg; };
      const glass = (o) => ui.navBtn(o);
      let selected = today();
      const rerender = () => live.forEach((pg) => { if (pg.el.isConnected) pg.render(); else live.delete(pg); });

      const inboxCount = () => JC.store.all('calinvites').filter((i) => !i.status).length;
      function bottomBar() {
        const n = inboxCount();
        return [
          ui.btn({ text: 'Today', kind: 'glass', size: 'm', cls: 'cal-tb', onTap: () => goToday() }),
          ui.spacer(),
          ui.btn({ text: 'Calendars', kind: 'glass', size: 'm', cls: 'cal-tb', onTap: () => calendarsSheet() }),
          h('div.cal-inboxwrap', ui.btn({ text: 'Inbox', kind: 'glass', size: 'm', cls: 'cal-tb', onTap: () => inboxSheet() }), n ? h('span.cal-inbox-badge', String(n)) : null),
        ];
      }
      function rightBtns(extra) {
        return [
          glass({ icon: 'cal.list', onTap: () => nav.push(listPage()) }),
          glass({ icon: 'magnifyingglass', onTap: () => nav.push(searchPage()) }),
          glass({ icon: 'plus', onTap: () => editSheet(null, { date: selected }) }),
        ].concat(extra || []);
      }
      function goToday() {
        selected = today();
        const top = nav.top();
        if (top && top.goToday) top.goToday();
        else { while (nav.depth() > 1) nav.pop({ instant: true }); const r = nav.top(); if (r.goToday) r.goToday(); }
      }

      // ═══ MONTH ═══════════════════════════════════════════════════════════
      function monthPage() {
        let split = false;
        let shownYear = JC.time.date().getFullYear();
        const yearBtn = glass({ text: String(shownYear), icon: 'chevron.left', cls: 'cal-yearbtn', onTap: () => nav.push(yearPage(shownYear)) });
        const wk = h('div.cal-wkhead', ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => h('div', { class: { we: i === 0 || i === 6 } }, d)));
        const page = keep(ui.page({
          title: '', cls: 'cal-month-page', left: [yearBtn],
          right: [glass({ icon: 'cal.split', onTap: () => { split = !split; page.render(); if (!split) scrollToMonth(selected, false); } })].concat(rightBtns()),
          toolbar: bottomBar(),
          footer: wk,
          content: (pg) => { pg.setToolbar(bottomBar()); return split ? splitView() : monthsView(); },
          onScroll: U.throttle((y) => {
            if (split) return;
            const ms = page.content.querySelectorAll('.cal-mblock');
            let cur = null;
            for (const m of ms) { if (m.offsetTop - 60 <= y + 140) cur = m; }
            if (cur) { const yr = parseInt(cur.dataset.m.slice(0, 4), 10); if (yr !== shownYear) { shownYear = yr; yearBtn.querySelector('span').textContent = String(yr); } }
          }, 100),
        }));
        page.goToday = () => { selected = today(); if (split) page.render(); else { page.render(); scrollToMonth(today(), true); } };
        function monthsView() {
          const out = [];
          const start = new Date(2026, 0, 1).getTime();
          for (let i = 0; i < 18; i++) out.push(monthBlock(addMonths(start, i), false));
          return [h('div.cal-months', out)];
        }
        function monthBlock(t, compact) {
          const d0 = new Date(t);
          const y = d0.getFullYear(), m = d0.getMonth();
          const first = new Date(y, m, 1);
          const days = new Date(y, m + 1, 0).getDate();
          const lead = first.getDay();
          const occ = occurrences(first.getTime(), new Date(y, m, days, 23, 59).getTime());
          const byDay = {};
          occ.forEach((o) => {
            const a = sod(o.start), b = o.allDay ? sod(o.end) : a;
            for (let x = a; x <= b; x = addDays(x, 1)) (byDay[dk(x)] = byDay[dk(x)] || []).push(o);
          });
          const isCur = y === JC.time.date().getFullYear() && m === JC.time.date().getMonth();
          const block = h('div.cal-mblock', { class: { compact }, data: { m: y + '-' + m } });
          if (!compact) block.appendChild(h('div.cal-mname', { class: { cur: isCur }, style: { paddingLeft: 'calc(' + (lead * 100 / 7).toFixed(3) + '% + 12px)' } }, MONTHS[m]));
          const grid = h('div.cal-grid');
          for (let i = 0; i < lead; i++) grid.appendChild(h('div.cal-cell.empty'));
          const alt = prefs().alt;
          for (let dd = 1; dd <= days; dd++) {
            const t2 = new Date(y, m, dd).getTime();
            const key = dk(t2);
            const evs = byDay[key] || [];
            const lun = alt ? lunar(new Date(t2)) : null;
            const dow = new Date(t2).getDay();
            const isToday = t2 === today();
            const isSel = t2 === selected && (compact || split);
            const cell = h('div.cal-cell', { class: { today: isToday, sel: isSel, we: dow === 0 || dow === 6 }, onTap: () => {
              selected = t2;
              if (split || compact) page.render();
              else nav.push(dayPage(t2));
            } },
            h('div.cal-num', String(dd)),
            lun ? h('div.cal-lunar', { class: { fest: lun.fest, ms: lun.monthStart } }, lun.label) : null,
            h('div.cal-dots', Array.from(new Set(evs.filter((o) => !(o.ev && o.ev.repeat === 'daily')).map((o) => o.cal))).slice(0, 3).map((c) => h('i', { style: { background: calById(c).color } }))));
            grid.appendChild(cell);
          }
          block.appendChild(grid);
          return block;
        }
        function splitView() {
          const d = new Date(selected);
          const mt = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
          const head = h('div.cal-splithead',
            h('div.cal-splitm', MONTHS[d.getMonth()] + ' ' + d.getFullYear()),
            h('div.cal-arrows',
              h('div.cal-arrow', { onTap: () => { selected = addMonths(mt, -1); page.render(); } }, JC.icon('chevron.left', { size: 18, weight: 2.4 })),
              h('div.cal-arrow', { onTap: () => { selected = addMonths(mt, 1); page.render(); } }, JC.icon('chevron.right', { size: 18, weight: 2.4 }))));
          const list = dayOcc(selected);
          return [head, monthBlock(mt, true), h('div.cal-splitday', longDate(selected)), list.length ? ui.list([{ rows: list.map((o) => occRow(o)) }]) : h('div.cal-noev', 'No Events')];
        }
        function scrollToMonth(t, smooth) {
          requestAnimationFrame(() => {
            const d = new Date(t);
            const el = page.content.querySelector(`.cal-mblock[data-m="${d.getFullYear()}-${d.getMonth()}"]`);
            const pad = parseFloat(getComputedStyle(page.scroll).paddingTop) || 132;
            if (el) page.scroll.scrollTo({ top: Math.max(0, el.offsetTop - pad + 4), behavior: smooth ? 'smooth' : 'auto' });
          });
        }
        page.scrollToMonth = scrollToMonth;
        setTimeout(() => scrollToMonth(selected, false), 0);
        return page;
      }

      // ═══ YEAR ════════════════════════════════════════════════════════════
      function yearPage(year) {
        const page = ui.page({
          title: String(year), large: true, cls: 'cal-year-page',
          right: rightBtns(),
          toolbar: bottomBar(),
          content: () => {
            const out = [];
            [year - 1, year, year + 1].forEach((y) => {
              out.push(h('div.cal-yhead', { class: { cur: y === JC.time.date().getFullYear() }, data: { y } }, String(y)));
              out.push(h('div.cal-ygrid', MONTHS.map((mn, m) => {
                const first = new Date(y, m, 1);
                const days = new Date(y, m + 1, 0).getDate();
                const cells = [];
                for (let i = 0; i < first.getDay(); i++) cells.push(h('i'));
                for (let d = 1; d <= days; d++) cells.push(h('b', { class: { t: new Date(y, m, d).getTime() === today() } }, String(d)));
                const isCur = y === JC.time.date().getFullYear() && m === JC.time.date().getMonth();
                return h('div.cal-ymonth', { onTap: () => { selected = first.getTime(); nav.pop(); setTimeout(() => { const r = nav.top(); if (r.scrollToMonth) r.scrollToMonth(first.getTime(), false); }, 450); } },
                  h('div.cal-ymname', { class: { cur: isCur } }, mn.slice(0, 3)), h('div.cal-ydays', cells));
              })));
            });
            return out;
          },
        });
        requestAnimationFrame(() => { const el = page.content.querySelector(`.cal-yhead[data-y="${year}"]`); if (el) page.scroll.scrollTop = el.offsetTop - 110; });
        return page;
      }

      // ═══ DAY ═════════════════════════════════════════════════════════════
      const HOUR = 52;
      function dayPage(t0) {
        let day = sod(t0);
        const strip = h('div.cal-strip');
        const dateLine = h('div.cal-dateline');
        const head = h('div.cal-dayhead', strip, dateLine);
        const page = keep(ui.page({
          title: MONTHS[new Date(day).getMonth()], cls: 'cal-day-page',
          right: rightBtns(),
          toolbar: bottomBar(),
          content: (pg) => { pg.setTitle(MONTHS[new Date(day).getMonth()]); pg.setToolbar(bottomBar()); return [head, renderDay()]; },
        }));
        page.goToday = () => setDay(today());
        U.drag(strip, { axis: 'x', end: (e, p) => { if (p.dx < -50) setDay(addDays(day, 7)); else if (p.dx > 50) setDay(addDays(day, -7)); } });
        function renderStrip() {
          strip.innerHTML = '';
          const ws = addDays(day, -new Date(day).getDay());
          const row = h('div.cal-strip-row');
          for (let i = 0; i < 7; i++) {
            const t = addDays(ws, i);
            const d = new Date(t);
            const has = dayOcc(t).some((o) => o.cal !== 'health');
            row.appendChild(h('div.cal-sd', { class: { sel: t === day, today: t === today(), we: i === 0 || i === 6 }, onTap: () => setDay(t) },
              h('div.cal-sd-w', 'SMTWTFS'[i]), h('div.cal-sd-n', String(d.getDate())), h('div.cal-sd-dot', { class: { on: has } })));
          }
          strip.appendChild(row);
          const lun = prefs().alt ? lunar(new Date(day)) : null;
          dateLine.textContent = longDate(day) + (lun ? '  ·  ' + (lun.fest ? lun.label : lunarFull(day)) : '');
        }
        function lunarFull(t) {
          const d = new Date(t);
          let mm = '';
          for (let i = LSTART.length - 2; i >= 0; i--) { if (sod(t) >= LSTART[i][0]) { mm = LM[LSTART[i][1]]; break; } }
          const l = lunar(d);
          return mm + (l && !l.monthStart ? l.label : '初一');
        }
        function setDay(t) {
          const dir = t > day ? 1 : -1;
          day = sod(t);
          selected = day;
          page.render();
          const tl = page.content.querySelector('.cal-tlwrap');
          if (tl) U.anim(tl, [{ opacity: 0.2, transform: `translateX(${dir * 30}px)` }, { opacity: 1, transform: 'none' }], { duration: 220, fill: 'none' });
        }
        function renderDay() {
          renderStrip();
          const occ = dayOcc(day);
          const allDay = occ.filter((o) => o.allDay);
          const timed = occ.filter((o) => !o.allDay);
          const wrap = h('div.cal-tlwrap');
          if (allDay.length) wrap.appendChild(h('div.cal-allday', h('div.cal-allday-k', 'all-day'), h('div.cal-allday-list', allDay.map((o) => h('div.cal-adev', { style: { '--c': calById(o.cal).color }, onTap: () => openOcc(o) }, o.title)))));
          const tl = h('div.cal-tl', { style: { height: 24 * HOUR + 'px' } });
          for (let hr = 0; hr < 24; hr++) {
            const lab = hr === 0 ? '12 AM' : hr < 12 ? hr + ' AM' : hr === 12 ? 'Noon' : (hr - 12) + ' PM';
            tl.appendChild(h('div.cal-hr', { style: { top: hr * HOUR + 'px' } }, h('span.cal-hr-l', lab)));
          }
          // layout overlapping events into columns
          const items = timed.map((o) => ({ o, s: Math.max(o.start, day), e: Math.min(Math.max(o.end, o.start + 20 * 60e3), day + DAY) })).sort((a, b) => a.s - b.s || b.e - a.e);
          const clusters = [];
          items.forEach((it) => {
            const c = clusters[clusters.length - 1];
            if (c && it.s < c.end) { c.items.push(it); c.end = Math.max(c.end, it.e); } else clusters.push({ items: [it], end: it.e });
          });
          clusters.forEach((c) => {
            const cols = [];
            c.items.forEach((it) => {
              let ci = cols.findIndex((end) => end <= it.s);
              if (ci < 0) { ci = cols.length; cols.push(0); }
              cols[ci] = it.e;
              it.col = ci;
            });
            c.items.forEach((it) => { it.n = cols.length; });
          });
          items.forEach((it) => {
            const top = ((it.s - day) / 3600e3) * HOUR;
            const hh = Math.max(20, ((it.e - it.s) / 3600e3) * HOUR - 2);
            const c = calById(it.o.cal);
            const ev = h('div.cal-ev', { class: { tent: it.o.tentative, short: hh < 34 }, style: { top: top + 'px', height: hh + 'px', left: 'calc(58px + (100% - 64px) * ' + (it.col / it.n) + ')', width: 'calc((100% - 64px) / ' + it.n + ' - 2px)', '--c': c.color }, onTap: (e) => { e.stopPropagation(); openOcc(it.o); } },
              h('div.cal-ev-t', it.o.title), hh >= 34 && it.o.location ? h('div.cal-ev-l', it.o.location) : null, hh >= 50 ? h('div.cal-ev-l', fmtRange(it.o)) : null);
            tl.appendChild(ev);
          });
          if (day === today()) {
            const now = JC.time.now();
            const top = ((now - day) / 3600e3) * HOUR;
            tl.appendChild(h('div.cal-now', { style: { top: top + 'px' } }, h('span.cal-now-t', fmtT(now).replace(/ (AM|PM)$/, '')), h('i')));
          }
          U.longPress(tl, (e) => {
            const r = tl.getBoundingClientRect();
            const sc = (JC.os && JC.os.scale) || 1;
            const y = (e.clientY - r.top) / sc;
            const mins = Math.round(((y / HOUR) * 60) / 15) * 15;
            editSheet(null, { date: day, start: day + mins * 60e3 });
          }, 520);
          wrap.appendChild(tl);
          U.drag(tl, { axis: 'x', end: (e, p) => { if (p.dx < -60 || p.vx < -0.5) setDay(addDays(day, 1)); else if (p.dx > 60 || p.vx > 0.5) setDay(addDays(day, -1)); } });
          requestAnimationFrame(() => {
            if (page._scrolled === day) return;
            page._scrolled = day;
            const first = items[0];
            const target = day === today() ? ((JC.time.now() - day) / 3600e3) * HOUR - 200 : first ? ((first.s - day) / 3600e3) * HOUR - 80 : 8 * HOUR;
            page.scroll.scrollTop = Math.max(0, target + (allDay.length ? 40 : 0));
          });
          return wrap;
        }
        return page;
      }

      // ═══ LIST & SEARCH ═══════════════════════════════════════════════════
      function occRow(o) {
        const c = calById(o.cal);
        return {
          leading: h('div.cal-bar', { style: { background: c.color } }),
          title: o.title + (o.tentative ? '' : ''),
          subtitle: o.allDay ? 'all-day' : fmtT(o.start) + ' – ' + fmtT(o.end) + (o.location ? ' · ' + o.location : ''),
          right: o.tentative ? h('span.cal-maybe', 'Maybe') : null,
          onTap: () => openOcc(o),
          cls: 'cal-occrow',
        };
      }
      function listPage() {
        const page = keep(ui.page({
          title: 'Events', large: true, cls: 'cal-list-page',
          right: [glass({ icon: 'magnifyingglass', onTap: () => nav.push(searchPage()) }), glass({ icon: 'plus', onTap: () => editSheet(null, { date: selected }) })],
          toolbar: bottomBar(),
          content: (pg) => {
            pg.setToolbar(bottomBar());
            const from = addDays(today(), -14), to = addDays(today(), 60);
            const occ = occurrences(from, to).filter((o) => o.cal !== 'health');
            const days = {};
            occ.forEach((o) => { const k = dk(o.allDay ? Math.max(sod(o.start), from) : o.start); (days[k] = days[k] || []).push(o); });
            const keys = Object.keys(days).sort();
            return [ui.list(keys.map((k) => {
              const t = new Date(k + 'T00:00:00').getTime();
              const lbl = t === today() ? 'Today — ' + U.fmtDate(t, 'long') : t === addDays(today(), 1) ? 'Tomorrow — ' + U.fmtDate(t, 'long') : U.fmtDate(t, 'full');
              return { header: h('span', { class: t === today() ? 'cal-lh today' : 'cal-lh', data: { k } }, lbl), rows: days[k].map(occRow) };
            }), { cls: 'cal-lists' })];
          },
        }));
        page.goToday = () => { const el = page.content.querySelector('.cal-lh.today') || page.content.querySelector(`[data-k="${dk(addDays(today(), 1))}"]`); if (el) page.scroll.scrollTo({ top: el.closest('.section').offsetTop - 110, behavior: 'smooth' }); };
        setTimeout(() => page.goToday(), 50);
        return page;
      }
      function searchPage() {
        let q = '';
        const page = ui.page({
          title: 'Search', large: true, cls: 'cal-search',
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          content: () => {
            if (!q.trim()) return [h('div.cal-searchhint', 'Search for events by title, location, invitee or notes.')];
            const s = q.toLowerCase();
            const occ = occurrences(new Date(2025, 0, 1).getTime(), new Date(2027, 11, 31).getTime()).filter((o) => o.cal !== 'health' || /taco|med|hep/.test(s));
            const seen = new Set();
            const res = occ.filter((o) => { const ev = o.ev || {}; const hay = (o.title + ' ' + (o.location || '') + ' ' + (ev.notes || '') + ' ' + (ev.organizer || '')).toLowerCase(); if (!hay.includes(s)) return false; const k = o.id + (o.recurring ? '' : o.key); if (o.recurring) { if (seen.has(o.id) && o.start < today()) return false; } seen.add(k); return true; }).slice(0, 80);
            if (!res.length) return [ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'No events match “' + q + '”.' })];
            return [ui.list([{ rows: res.map((o) => Object.assign(occRow(o), { subtitle: U.fmtDate(o.start, 'medium') + (o.allDay ? ' · all-day' : ' · ' + fmtT(o.start)) })) }])];
          },
        });
        setTimeout(() => { const i = page.el.querySelector('.page-search input'); if (i) i.focus(); }, 500);
        return page;
      }

      // ═══ EVENT DETAIL ════════════════════════════════════════════════════
      function openOcc(o) {
        if (o.ev) JC.story.act('event_open', { id: o.id });
        nav.push(detailPage(o));
      }
      function detailPage(o0) {
        let o = o0;
        const page = keep(ui.page({
          title: '', cls: 'cal-detail', bg: 'grouped',
          right: o.ro ? [] : [glass({ text: 'Edit', onTap: () => editSheet(JC.store.get('events', o.id), { occ: o }) })],
          content: () => {
            const ev = o.ev ? JC.store.get('events', o.id) : null;
            if (o.ev && !ev) return [ui.empty({ icon: 'calendar', title: 'Event Deleted' })];
            if (ev) { const s = o.start, durn = ev.end - ev.start; o = Object.assign({}, o, { ev, title: ev.title, location: ev.location, cal: ev.cal, tentative: ev.tentative, allDay: ev.allDay, start: ev.repeat ? s : ev.start, end: ev.repeat ? s + durn : ev.end }); }
            const c = calById(o.cal);
            const sameDay = U.sameDay(new Date(o.start), new Date(o.end));
            const when = o.allDay
              ? (sameDay || sod(o.end) === sod(o.start) ? [longDate(o.start), 'all-day'] : ['from ' + U.fmtDate(o.start, 'medium'), 'to ' + U.fmtDate(o.end, 'medium')])
              : sameDay ? [longDate(o.start), 'from ' + fmtT(o.start) + ' to ' + fmtT(o.end)] : ['from ' + fmtT(o.start) + ', ' + U.fmtDate(o.start, 'medium'), 'to ' + fmtT(o.end) + ', ' + U.fmtDate(o.end, 'medium')];
            const repeatTxt = ev && ev.repeat ? { daily: 'Repeats every day', weekly: 'Repeats every week', biweekly: 'Repeats every 2 weeks', monthly: 'Repeats every month', yearly: 'Repeats every year' }[ev.repeat] : null;
            const out = [h('div.cal-dhead',
              h('div.cal-dtitle', o.title),
              o.location ? h('div.cal-dloc', { onTap: () => openMaps(o.location) }, o.location) : null,
              h('div.cal-dwhen', when[0]), h('div.cal-dwhen', when[1]),
              repeatTxt ? h('div.cal-dwhen.sub', repeatTxt) : null,
              o.cal === 'birthdays' && o.age ? h('div.cal-dwhen.sub', (o.age) + (o.age % 10 === 1 && o.age !== 11 ? 'st' : o.age % 10 === 2 && o.age !== 12 ? 'nd' : o.age % 10 === 3 && o.age !== 13 ? 'rd' : 'th') + ' birthday') : null)];
            if (o.location && placeId(o.location)) out.push(h('div.cal-dmap', { onTap: () => openMaps(o.location) }, h('div.cal-dmap-pin', JC.icon('mappin.fill', { size: 20 })), h('div.cal-dmap-lbl', o.location, h('span', 'Open in Maps'))));
            const rows = [];
            rows.push({ title: 'Calendar', detail: h('span.cal-calchip', h('i', { style: { background: c.color } }), c.title), onTap: o.ro ? null : (e) => ui.menu(e.currentTarget, cals().filter((x) => !x.ro).map((x) => ({ text: x.title, checked: x.id === o.cal, onTap: () => { JC.store.update('events', o.id, { cal: x.id }); } }))), chevron: !o.ro });
            if (!o.ro) rows.push({ title: 'Alert', detail: alertLabel(ev || {}), chevron: true, onTap: (e) => ui.menu(e.currentTarget, (o.allDay ? ALERTS_ALLDAY : ALERTS).map((a) => ({ text: a.t, checked: (ev.alert == null ? null : ev.alert) === a.v, onTap: () => JC.store.update('events', o.id, { alert: a.v }) }))) });
            if (ev && (ev.invitees || ev.organizer)) rows.push({ title: 'Invitees', detail: ev.organizer ? ev.organizer + (ev.invitees ? ' + ' + ev.invitees.length : '') : String(ev.invitees.length), chevron: true, onTap: () => inviteesSheet(ev) });
            if (o.cal === 'birthdays' && o.contact) rows.push({ title: 'View Contact', tinted: true, onTap: () => JC.os.open('contacts', { contact: o.contact }) });
            if (o.cal === 'holidays') rows.push({ title: 'Subscribed Calendar', detail: 'Holidays in China' });
            out.push(ui.list([{ rows }]));
            if (ev && ev.url) out.push(ui.list([{ header: 'URL', rows: [{ title: ev.url, tinted: true, onTap: () => JC.os.open('safari', { url: 'https://' + ev.url }) }] }]));
            if (ev && ev.notes) out.push(ui.list([{ header: 'Notes', rows: [{ custom: h('div.cal-dnotes', ev.notes) }] }]));
            if (o.tentative) out.push(h('div.cal-rsvp',
              h('div.cal-rsvp-k', 'Status: Maybe'),
              h('div.cal-rsvp-btns',
                ui.btn({ text: 'Accept', kind: 'tinted', size: 'm', onTap: () => { JC.store.update('events', o.id, { tentative: false }); ui.toast(ev && ev.organizer ? 'Accepted · ' + ev.organizer + ' will be notified' : 'Accepted', { icon: 'checkmark' }); JC.story.act('event_add', { id: o.id, title: o.title, accepted: true, status: 'accepted' }); } }),
                ui.btn({ text: 'Maybe', kind: 'gray', size: 'm', onTap: () => ui.toast('Still a maybe', { icon: 'questionmark.circle' }) }),
                ui.btn({ text: 'Decline', kind: 'gray', size: 'm', cls: 'cal-decline', onTap: () => ui.actionSheet({ title: 'Decline “' + o.title + '”?', message: ev && ev.organizer ? ev.organizer + ' will be notified.' : undefined, actions: [{ text: 'Decline', style: 'destructive', onTap: () => { JC.store.remove('events', o.id); nav.pop(); try { JC.story.act('event_decline', { id: o.id, title: o.title, status: 'declined' }); } catch (e) { /* ignore */ } } }] }) }))));
            if (!o.ro) out.push(ui.list([{ rows: [{ title: 'Delete Event', destructive: true, center: true, onTap: () => deleteEvent(ev, o) }] }]));
            else out.push(h('div.cal-ro', o.cal === 'birthdays' ? 'Birthdays are taken from your contacts.' : 'Events from subscribed calendars can’t be edited.'));
            return out;
          },
        }));
        return page;
      }
      function openMaps(loc) {
        const id = placeId(loc);
        if (id) JC.os.open('maps', { place: id });
        else { JC.os.open('maps', {}); ui.toast('Searching Maps for “' + loc + '”', { icon: 'map' }); }
      }
      function inviteesSheet(ev) {
        ui.sheet({
          title: 'Invitees', detent: 'medium', right: { text: 'Done' },
          content: () => [ui.list([
            ev.organizer ? { header: 'Organizer', rows: [{ icon: { node: ui.avatar(ev.organizerId || 'me', 32) }, title: ev.organizer, onTap: ev.organizerId ? () => JC.os.open('contacts', { contact: ev.organizerId }) : undefined }] } : null,
            ev.invitees && ev.invitees.length ? { header: 'Invitees', rows: ev.invitees.map((cid) => ({ avatar: cid, avatarSize: 32, title: JC.contacts.name(cid), detail: 'Accepted', onTap: () => JC.os.open('contacts', { contact: cid }) })) } : null,
          ].filter(Boolean))],
        });
      }
      function deleteEvent(ev, o) {
        if (!ev) return;
        const done = () => { if (nav.depth() > 1) nav.pop(); };
        if (ev.repeat) {
          ui.actionSheet({ title: 'This is a repeating event.', actions: [
            { text: 'Delete This Event Only', style: 'destructive', onTap: () => { JC.store.update('events', ev.id, { exdates: (ev.exdates || []).concat(dk(o.start)) }); done(); } },
            { text: 'Delete All Future Events', style: 'destructive', onTap: () => { if (o.start <= ev.start) JC.store.remove('events', ev.id); else JC.store.update('events', ev.id, { until: o.start - 1 }); done(); } },
          ] });
          return;
        }
        ui.actionSheet({ title: 'Are you sure you want to delete this event?', actions: [{ text: 'Delete Event', style: 'destructive', onTap: () => { JC.store.remove('events', ev.id); done(); } }] });
      }

      // ═══ NEW / EDIT EVENT ════════════════════════════════════════════════
      function editSheet(ev, o) {
        o = o || {};
        const isNew = !ev;
        const base = o.start || (o.date && sod(o.date) !== today() ? sod(o.date) + 9 * 3600e3 : Math.ceil((JC.time.now() + 60e3) / 3600e3) * 3600e3);
        const d = ev ? JSON.parse(JSON.stringify(ev)) : { title: '', location: '', allDay: false, start: base, end: base + 3600e3, cal: 'home', repeat: null, alert: null, notes: '', url: '', busy: true, invitees: [] };
        if (ev && o.occ && ev.repeat) { const dur = ev.end - ev.start; d.start = o.occ.start; d.end = o.occ.start + dur; }
        let open = null;
        const title = ui.input({ placeholder: 'Title', value: d.title, cls: 'cal-f', onInput: (v) => { d.title = v; } });
        const loc = ui.input({ placeholder: 'Location or Video Call', value: d.location, cls: 'cal-f', onInput: (v) => { d.location = v; } });
        const notes = ui.input({ placeholder: 'Notes', value: d.notes, cls: 'cal-f cal-notes', multiline: true, rows: 3, onInput: (v) => { d.notes = v; } });
        const url = ui.input({ placeholder: 'URL', value: d.url || '', cls: 'cal-f', cap: 'none', onInput: (v) => { d.url = v; } });
        const s = ui.sheet({
          title: isNew ? 'New Event' : 'Edit Event', detent: 'large', cls: 'cal-edit',
          left: { text: 'Cancel' },
          right: { text: isNew ? 'Add' : 'Done', onTap: () => save() },
          content: () => {
            const rows = [];
            const startRow = { title: 'Starts', right: h('div.cal-chips', h('span.cal-chip', { class: { on: open === 'start' } }, U.fmtDate(d.start, 'medium')), d.allDay ? null : h('span.cal-chip', { class: { on: open === 'start' } }, fmtT(d.start))), onTap: () => { open = open === 'start' ? null : 'start'; s.render(); } };
            const endRow = { title: 'Ends', right: h('div.cal-chips', { class: { bad: d.end < d.start } }, h('span.cal-chip', { class: { on: open === 'end' } }, U.fmtDate(d.end, 'medium')), d.allDay ? null : h('span.cal-chip', { class: { on: open === 'end' } }, fmtT(d.end))), onTap: () => { open = open === 'end' ? null : 'end'; s.render(); } };
            rows.push({ title: 'All-day', toggle: { on: d.allDay, onChange: (v) => { d.allDay = v; if (v) { d.start = sod(d.start); d.end = sod(d.end) + DAY - 60e3; } else { d.start = sod(d.start) + 9 * 3600e3; d.end = d.start + 3600e3; } s.render(); } } });
            rows.push(startRow);
            if (open === 'start') rows.push({ custom: wheelFor('start') });
            rows.push(endRow);
            if (open === 'end') rows.push({ custom: wheelFor('end') });
            const rep = { null: 'Never', daily: 'Every Day', weekly: 'Every Week', biweekly: 'Every 2 Weeks', monthly: 'Every Month', yearly: 'Every Year' };
            const c = calById(d.cal);
            return [
              h('div.cal-editwrap',
                ui.list([{ rows: [{ custom: title }, { custom: loc }] }]),
                ui.list([{ rows }]),
                ui.list([{ rows: [{ title: 'Repeat', detail: rep[d.repeat || null], chevron: true, onTap: (e) => ui.menu(e.currentTarget, Object.keys(rep).map((k) => ({ text: rep[k], checked: (d.repeat || 'null') === k, onTap: () => { d.repeat = k === 'null' ? null : k; s.render(); } }))) }] }]),
                ui.list([{ rows: [
                  { title: 'Calendar', detail: h('span.cal-calchip', h('i', { style: { background: c.color } }), c.title), chevron: true, onTap: (e) => ui.menu(e.currentTarget, cals().filter((x) => !x.ro).map((x) => ({ text: x.title, checked: x.id === d.cal, onTap: () => { d.cal = x.id; s.render(); } }))) },
                  { title: 'Invitees', detail: (d.invitees || []).length ? (d.invitees || []).map((x) => JC.contacts.short(x)).join(', ') : 'None', chevron: true, onTap: () => pickInvitees(d, () => s.render()) },
                ] }]),
                ui.list([{ rows: [
                  { title: 'Alert', detail: alertLabel(d), chevron: true, onTap: (e) => ui.menu(e.currentTarget, (d.allDay ? ALERTS_ALLDAY : ALERTS).map((a) => ({ text: a.t, checked: (d.alert == null ? null : d.alert) === a.v, onTap: () => { d.alert = a.v; s.render(); } }))) },
                  { title: 'Show As', detail: d.busy === false ? 'Free' : 'Busy', chevron: true, onTap: (e) => ui.menu(e.currentTarget, [{ text: 'Busy', checked: d.busy !== false, onTap: () => { d.busy = true; s.render(); } }, { text: 'Free', checked: d.busy === false, onTap: () => { d.busy = false; s.render(); } }]) },
                ] }]),
                ui.list([{ rows: [{ custom: url }, { custom: notes }] }]),
                !isNew ? ui.list([{ rows: [{ title: 'Delete Event', destructive: true, center: true, onTap: () => { s.close(); deleteEvent(ev, o.occ || { start: ev.start }); } }] }]) : null),
            ];
          },
        });
        if (isNew) setTimeout(() => title.focus(), 450);
        function wheelFor(which) {
          const cur = d[which];
          const days = [];
          const anchor = sod(cur);
          for (let i = -60; i <= 365; i++) {
            const t = addDays(anchor, i);
            days.push({ label: t === today() ? 'Today' : U.DAYS[new Date(t).getDay()].slice(0, 3) + ' ' + U.fmtDate(t, 'md'), value: t });
          }
          const hrs = Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
          const mins = Array.from({ length: 12 }, (_, i) => ({ label: String(i * 5).padStart(2, '0'), value: i * 5 }));
          const cd = new Date(cur);
          const h12 = cd.getHours() % 12 || 12;
          const ap = cd.getHours() >= 12 ? 'PM' : 'AM';
          const cols = [{ items: days, value: anchor, width: d.allDay ? undefined : 150 }];
          if (!d.allDay) cols.push({ items: hrs, value: h12, width: 50 }, { items: mins, value: Math.round(cd.getMinutes() / 5) * 5 % 60, width: 50 }, { items: ['AM', 'PM'], value: ap, width: 56 });
          return h('div.cal-wheel', ui.wheel({ cols, onChange: (v) => {
            let t = v[0];
            if (!d.allDay) { let hr = v[1] % 12; if (v[3] === 'PM') hr += 12; t = v[0] + hr * 3600e3 + v[2] * 60e3; }
            else t = which === 'end' ? v[0] + DAY - 60e3 : v[0];
            const dur = d.end - d.start;
            d[which] = t;
            if (which === 'start' && d.end <= d.start) d.end = d.start + Math.max(dur, d.allDay ? DAY - 60e3 : 3600e3);
            const chips = s.body.querySelectorAll('.cal-chips');
            if (chips[0]) { chips[0].children[0].textContent = U.fmtDate(d.start, 'medium'); if (chips[0].children[1]) chips[0].children[1].textContent = fmtT(d.start); }
            if (chips[1]) { chips[1].children[0].textContent = U.fmtDate(d.end, 'medium'); if (chips[1].children[1]) chips[1].children[1].textContent = fmtT(d.end); chips[1].classList.toggle('bad', d.end < d.start); }
          } }));
        }
        function save() {
          if (d.end < d.start) { ui.alert({ title: 'Cannot Save Event', message: 'The start date must be before the end date.', buttons: [{ text: 'OK' }] }); return false; }
          const item = { cal: d.cal, title: (d.title || '').trim() || 'New Event', start: d.start, end: d.end, allDay: !!d.allDay, location: d.location || '', notes: d.notes || '', url: d.url || '', repeat: d.repeat || null, alert: d.alert == null ? null : d.alert, busy: d.busy !== false, invitees: d.invitees || [], tentative: ev ? ev.tentative : false };
          if (isNew) {
            const added = JC.store.add('events', Object.assign({ id: U.uid('ev') }, item));
            JC.story.act('event_add', { id: added.id, title: added.title, isNew: true, cal: added.cal, start: added.start, allDay: !!added.allDay, invitees: (item.invitees || []).slice() });
            if ((item.invitees || []).length) ui.toast('Invitations sent', { icon: 'paperplane.fill' });
            selected = sod(added.start);
            const top = nav.top();
            if (top && top.goToday && top.scrollToMonth) { top.render(); top.scrollToMonth(added.start, true); }
          } else {
            if (ev.repeat && o.occ) item.start = ev.start + (d.start - o.occ.start), item.end = ev.end + (d.end - (o.occ.start + (ev.end - ev.start)));
            JC.store.update('events', ev.id, item);
          }
          return true;
        }
      }
      function pickInvitees(d, cb) {
        const chosen = new Set(d.invitees || []);
        const people = JC.contacts.people().filter((c) => !['ajie', 'mom', 'dad', 'hq'].includes(c.id));
        ui.sheet({
          title: 'Add Invitees', detent: 'large', left: { text: 'Cancel' }, right: { text: 'Done', onTap: () => { d.invitees = Array.from(chosen); cb(); } },
          content: (sh) => [ui.list([{ rows: people.map((c) => ({ avatar: c.id, avatarSize: 34, title: c.display, subtitle: (c.emails[0] && c.emails[0].addr) || (c.phones[0] && c.phones[0].num) || '', check: chosen.has(c.id), onTap: () => { if (chosen.has(c.id)) chosen.delete(c.id); else chosen.add(c.id); sh.render(); } })) }])],
        });
      }

      // ═══ CALENDARS & INBOX ═══════════════════════════════════════════════
      function calendarsSheet() {
        const s = ui.sheet({
          title: 'Calendars', detent: 'large', right: { text: 'Done', onTap: () => rerender() },
          content: () => {
            const p = prefs();
            const groups = {};
            cals().forEach((c) => { (groups[c.group || 'iCloud'] = groups[c.group || 'iCloud'] || []).push(c); });
            const allOn = cals().every((c) => !p.hidden[c.id]);
            return [
              ui.list(Object.keys(groups).map((g) => ({ header: g, rows: groups[g].map((c) => ({
                leading: h('div.cal-checkcirc', { class: { on: !p.hidden[c.id] }, style: { '--c': c.color } }, JC.icon('checkmark', { size: 13, weight: 3 })),
                title: c.title,
                subtitle: c.ro ? (c.id === 'birthdays' ? 'From Contacts' : 'Subscribed') : null,
                info: () => calInfo(c, s),
                onTap: () => { const hid = Object.assign({}, p.hidden); hid[c.id] = !hid[c.id]; setPrefs({ hidden: hid }); s.render(); rerender(); },
              })) }))),
              ui.list([{ rows: [
                { title: 'Show Chinese Calendar', subtitle: 'Lunar dates and solar terms in Month view', toggle: { on: p.alt, onChange: (v) => { setPrefs({ alt: v }); rerender(); } } },
              ] }]),
              h('div.cal-sheetbtns',
                ui.btn({ text: allOn ? 'Hide All' : 'Show All', kind: 'gray', size: 'm', onTap: () => { const hid = {}; if (allOn) cals().forEach((c) => { hid[c.id] = true; }); setPrefs({ hidden: hid }); s.render(); rerender(); } }),
                ui.btn({ text: 'Add Calendar', kind: 'tinted', size: 'm', onTap: () => ui.alert({ title: 'Add Calendar', message: 'Enter a name for this calendar.', input: { placeholder: 'Calendar Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Add', style: 'default' }] }).then((r) => {
                  if (r.index !== 1 || !(r.value || '').trim()) return;
                  const colors = ['#ff9500', '#34c759', '#ffcc00', '#a2845e', '#5856d6', '#ff2d55'];
                  const custom = (prefs().custom || []).concat({ id: U.uid('cal'), title: r.value.trim(), color: colors[(prefs().custom || []).length % colors.length], group: 'iCloud' });
                  setPrefs({ custom });
                  s.render();
                }) })),
            ];
          },
        });
      }
      function calInfo(c, parent) {
        ui.sheet({
          title: 'Edit Calendar', detent: 'medium', right: { text: 'Done' },
          content: () => [ui.list([
            { rows: [{ title: c.title, detail: c.group || 'iCloud' }] },
            { header: 'Shared With', rows: [c.id === 'work' ? { avatar: 'ea', avatarSize: 30, title: 'Tang Mei (EA)', detail: 'View & Edit' } : { title: c.ro ? 'Read Only' : 'Not Shared', detail: '' }] },
            { rows: [{ title: 'Event Alerts', toggle: { on: true, onChange: (v) => ui.toast(v ? 'Alerts on for ' + c.title : 'Alerts off for ' + c.title) } }] },
            !c.ro && !BASE_CALS.find((b) => b.id === c.id) ? { rows: [{ title: 'Delete Calendar', destructive: true, center: true, onTap: () => { setPrefs({ custom: (prefs().custom || []).filter((x) => x.id !== c.id) }); parent.render(); } }] } : null,
          ].filter(Boolean))],
        });
      }
      function inboxSheet() {
        let tab = 0;
        ui.sheet({
          title: 'Inbox', detent: 'large', right: { text: 'Done' },
          content: (sh) => {
            const inv = JC.store.all('calinvites');
            const list = inv.filter((i) => (tab === 0 ? !i.status : !!i.status));
            const seg = ui.segmented({ items: ['New', 'Replied'], value: tab, onChange: (i) => { tab = i; sh.render(); } });
            return [h('div.cal-inboxseg', seg), list.length ? h('div.cal-invites', list.map((i) => inviteCard(i, sh))) : ui.empty({ icon: 'cal.inbox', title: tab === 0 ? 'No New Invitations' : 'No Replies', text: tab === 0 ? 'Invitations you receive will appear here.' : '' })];
          },
        });
      }
      function inviteCard(i, s) {
        const reply = (status) => {
          const patch = { status };
          if (status !== 'declined') {
            const id = 'ev_' + i.id;
            JC.store.add('events', { id, cal: i.cal, title: i.title, start: i.start, end: i.end, location: i.location, notes: i.notes, organizer: i.organizer, organizerId: i.from || undefined, tentative: status === 'maybe' });
            patch.eventId = id;
            JC.story.act('event_add', { id, invite: i.id, status, title: i.title, accepted: status === 'accepted' });
          } else {
            if (i.eventId) JC.store.remove('events', i.eventId);
            try { JC.story.act('event_decline', { id: i.eventId || 'ev_' + i.id, invite: i.id, status, title: i.title }); } catch (e) { /* ignore */ }
          }
          JC.store.update('calinvites', i.id, patch);
          ui.toast(status === 'accepted' ? 'Accepted' : status === 'maybe' ? 'Replied Maybe' : 'Declined', { icon: status === 'declined' ? 'xmark' : 'checkmark' });
          s.render();
        };
        return h('div.cal-invite',
          h('div.cal-inv-top', i.from ? ui.avatar(i.from, 38) : h('div.cal-inv-org', JC.icon('building.2', { size: 18 })), h('div.cal-inv-meta', h('div.cal-inv-org-n', i.organizer), h('div.cal-inv-sent', 'Sent ' + U.fmtRelative(JC.time.parse(i.sent))))),
          h('div.cal-inv-title', i.title),
          h('div.cal-inv-when', U.fmtDate(i.start, 'full') + ' · ' + fmtT(i.start) + ' – ' + fmtT(i.end)),
          i.location ? h('div.cal-inv-loc', JC.icon('mappin', { size: 13 }), ' ' + i.location) : null,
          i.notes ? h('div.cal-inv-notes', i.notes) : null,
          i.status ? h('div.cal-inv-status', { class: i.status }, i.status === 'accepted' ? 'Accepted' : i.status === 'maybe' ? 'Maybe' : 'Declined', h('span.cal-inv-change', { onTap: () => { JC.store.update('calinvites', i.id, { status: null }); if (i.eventId) JC.store.remove('events', i.eventId); s.render(); } }, 'Change'))
            : h('div.cal-inv-btns',
              ui.btn({ text: 'Accept', kind: 'tinted', size: 's', onTap: () => reply('accepted') }),
              ui.btn({ text: 'Maybe', kind: 'gray', size: 's', onTap: () => reply('maybe') }),
              ui.btn({ text: 'Decline', kind: 'gray', size: 's', cls: 'cal-decline', onTap: () => reply('declined') })));
      }

      const nav = ui.nav(win.body, () => monthPage());
      const off1 = JC.store.on('events', () => requestAnimationFrame(rerender));
      const off2 = JC.store.on('calinvites', () => { requestAnimationFrame(rerender); JC.notify.badge('calendar', JC.store.all('calinvites').filter((i) => !i.status).length); });
      const onMin = () => rerender();
      JC.bus.on('minute', onMin);

      // ═══ INTENTS ═════════════════════════════════════════════════════════
      function handle(it) {
        if (!it) return;
        if (it.id) {
          const ev = JC.store.get('events', it.id);
          if (!ev) { ui.toast('Event not found'); return; }
          while (nav.depth() > 1) nav.pop({ instant: true });
          let start = ev.start;
          if (ev.repeat) { const nx = occurrences(today(), addDays(today(), 400)).find((o) => o.id === ev.id); if (nx) start = nx.start; }
          selected = sod(start);
          nav.push(dayPage(start), { instant: true });
          const occ = occurrences(sod(start), sod(start) + DAY).find((o) => o.id === ev.id) || { ev, id: ev.id, title: ev.title, cal: ev.cal, start: ev.start, end: ev.end, allDay: ev.allDay, location: ev.location, tentative: ev.tentative };
          openOcc(occ);
          return;
        }
        if (it.date != null) {
          const t = typeof it.date === 'number' ? it.date : JC.time.parse(String(it.date).length <= 10 && /^\d{4}-/.test(it.date) ? it.date + ' 00:00' : it.date);
          while (nav.depth() > 1) nav.pop({ instant: true });
          selected = sod(t);
          nav.push(dayPage(t), { instant: true });
          return;
        }
        if (it.create || it.compose) editSheet(null, { date: selected });
        if (it.inbox) inboxSheet();
      }
      if (intent0) setTimeout(() => handle(intent0), 0);
      return {
        intent: handle,
        show() { rerender(); },
        destroy() { off1(); off2(); JC.bus.off('minute', onMin); },
      };
    },
  });
})();
