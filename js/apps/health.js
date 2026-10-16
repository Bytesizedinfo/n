/* Health — iOS 26 Health: Summary (pinned metrics, highlights), Sharing (A-Ling's request), Browse/Search,
   metric detail pages with D/W/M/6M/Y charts, Medical ID, Medications log, State of Mind log. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const HD = JC.healthData;
  const M = HD.M;

  JC.icon.add({
    'pills.fill': '<rect x="3" y="9" width="12" height="6.5" rx="3.25" transform="rotate(-35 9 12.25)" fill="currentColor" stroke="none"/><circle cx="17.2" cy="16.3" r="4.3" fill="currentColor" stroke="none"/><path d="M14.3 19.2 20.1 13.4" style="stroke:var(--knock,#fff)" stroke-width="1.4"/>',
    'brain.head.profile': '<path d="M14.5 21v-3h2a2 2 0 0 0 2-2v-2.5l1.6-.6c.5-.2.6-.8.3-1.2L18.5 9A7 7 0 0 0 5 10.5c0 2.3.9 4 2.5 5.4V21"/><path d="M9.5 8.5c1-1 3-1 3.8.3M10 12c.8.6 2 .6 2.8 0"/>',
    'lungs.fill': '<path d="M12 3.5v8M12 9.5c-1 1.2-2.4 1.8-3.4 1.8M12 9.5c1 1.2 2.4 1.8 3.4 1.8"/><path d="M8.3 7c-2.6 0-4.8 5.3-4.8 9.8 0 2.4 1.5 3.2 3 3.2 2 0 3-1.4 3-4V8.4C9.5 7.6 9 7 8.3 7zM15.7 7c2.6 0 4.8 5.3 4.8 9.8 0 2.4-1.5 3.2-3 3.2-2 0-3-1.4-3-4V8.4c0-.8.5-1.4 1.2-1.4z" fill="currentColor" stroke="none"/>',
    'figure.wave': '<circle cx="12" cy="4.6" r="1.9" fill="currentColor" stroke="none"/><path d="M12 7.5v7l-2.5 6M12 14.5l2.5 6M7 6.5l5 2 5-4"/>',
    ear: '<path d="M7 9.5a5 5 0 0 1 10 0c0 2.5-1.6 3.4-2.6 4.4-.9.9-1 1.7-1.1 2.8-.2 1.9-1.4 3.3-3.3 3.3-1.6 0-2.8-1-3.2-2.4"/><path d="M10 10a2 2 0 0 1 4 0c0 1-.8 1.4-1.6 1.6"/>',
    'heart.text.square': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 16.5s-4-2.4-4-5.3a2.2 2.2 0 0 1 4-1.3 2.2 2.2 0 0 1 4 1.3c0 2.9-4 5.3-4 5.3z" fill="currentColor" stroke="none"/>',
    'cross.case.fill': '<rect x="3" y="7" width="18" height="13" rx="2.5" fill="currentColor" stroke="none"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M12 10.5v6M9 13.5h6" style="stroke:var(--knock,#fff)" stroke-width="2"/>',
    'square.and.arrow.up.circle': '<circle cx="12" cy="12" r="9"/><path d="M12 7v8M9 10l3-3 3 3"/>',
    'figure.strengthtraining.traditional': '<circle cx="12" cy="4.5" r="1.8" fill="currentColor" stroke="none"/><path d="M12 7.5v6l-2.5 6.5M12 13.5l2.5 6.5M4 9.5h16M5.5 7.5v4M18.5 7.5v4"/>',
    'face.smiling': '<circle cx="12" cy="12" r="9"/><path d="M8.5 14c.9 1.4 2.1 2 3.5 2s2.6-.6 3.5-2"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/>',
  });

  const LANES = [{ key: 'awake', label: 'Awake', color: 'var(--hl-awake)' }, { key: 'rem', label: 'REM', color: 'var(--hl-rem)' }, { key: 'core', label: 'Core', color: 'var(--hl-core)' }, { key: 'deep', label: 'Deep', color: 'var(--hl-deep)' }];
  const VAL = { '-3': 'Very Unpleasant', '-2': 'Unpleasant', '-1': 'Slightly Unpleasant', 0: 'Neutral', 1: 'Slightly Pleasant', 2: 'Pleasant', 3: 'Very Pleasant' };
  const VAL_C = { '-3': 'var(--hl-v-3)', '-2': 'var(--hl-v-2)', '-1': 'var(--hl-v-1)', 0: 'var(--hl-v0)', 1: 'var(--hl-v1)', 2: 'var(--hl-v2)', 3: 'var(--hl-v3)' };
  const FEEL = {
    neg: ['Angry', 'Annoyed', 'Anxious', 'Ashamed', 'Disappointed', 'Discouraged', 'Embarrassed', 'Frustrated', 'Guilty', 'Hopeless', 'Irritated', 'Jealous', 'Lonely', 'Overwhelmed', 'Sad', 'Scared', 'Stressed', 'Worried', 'Confused'],
    mid: ['Calm', 'Content', 'Indifferent', 'Peaceful', 'Satisfied', 'Confused', 'Drained'],
    pos: ['Amazed', 'Amused', 'Brave', 'Confident', 'Excited', 'Grateful', 'Happy', 'Hopeful', 'Joyful', 'Passionate', 'Proud', 'Relieved', 'Surprised'],
  };
  const ASSOC = ['Health', 'Fitness', 'Self-Care', 'Hobbies', 'Identity', 'Spirituality', 'Community', 'Family', 'Friends', 'Partner', 'Dating', 'Tasks', 'Work', 'Education', 'Travel', 'Weather', 'Current Events', 'Money'];
  const WORKOUTS = [
    { id: 'w0', d: 0, type: 'Outdoor Run', icon: 'figure.run', km: 6.2, time: 1908, kcal: 412, hr: 152, pace: '5′08″', start: '07:02', place: 'Lanling Riverside', elev: 18, cadence: 172 },
    { id: 'w1', d: -2, type: 'Outdoor Run', icon: 'figure.run', km: 6.0, time: 1874, kcal: 398, hr: 149, pace: '5′12″', start: '06:10', place: 'Lotus Pier Lakeside', elev: 9, cadence: 170 },
    { id: 'w2', d: -3, type: 'Functional Strength Training', icon: 'figure.strengthtraining.traditional', km: 0, time: 3120, kcal: 356, hr: 118, start: '05:34', place: 'YMJ Gym', elev: 0 },
    { id: 'w3', d: -4, type: 'Outdoor Run', icon: 'figure.run', km: 7.1, time: 2262, kcal: 471, hr: 154, pace: '5′19″', start: '06:02', place: 'Lotus Pier Lakeside', elev: 12, cadence: 171 },
    { id: 'w4', d: -6, type: 'Outdoor Run', icon: 'figure.run', km: 5.4, time: 1702, kcal: 351, hr: 147, pace: '5′15″', start: '06:40', place: 'Yunmeng Lake Pavilion', elev: 6, cadence: 169 },
    { id: 'w5', d: -7, type: 'Functional Strength Training', icon: 'figure.strengthtraining.traditional', km: 0, time: 2940, kcal: 330, hr: 121, start: '05:31', place: 'YMJ Gym', elev: 0 },
  ];
  const prefs = () => JC.store.get('hlprefs', 'p') || { pins: [], share: 'pending', topics: [] };
  const setPrefs = (patch) => JC.store.update('hlprefs', 'p', patch);
  const now = () => JC.time.now();
  const today = () => HD.dayIdx(now());

  function fmtNum(metric, v) {
    if (v == null || isNaN(v)) return '—';
    const m = M[metric];
    if (metric === 'sleep') return fmtSleep(v);
    if (m && m.fmt) return (Math.round(v * Math.pow(10, m.fmt)) / Math.pow(10, m.fmt)).toFixed(m.fmt);
    return Math.round(v).toLocaleString('en-US');
  }
  function fmtSleep(mins) { mins = Math.round(mins); return Math.floor(mins / 60) + ' hr ' + (mins % 60) + ' min'; }
  function valueNode(main, unit, extra) {
    return h('div.hl-val', h('span.hl-val-n', main), unit ? h('span.hl-val-u', unit) : null, extra || null);
  }
  function sleepNode(mins) {
    mins = Math.round(mins);
    return h('div.hl-val', h('span.hl-val-n', String(Math.floor(mins / 60))), h('span.hl-val-u', 'hr '), h('span.hl-val-n', String(mins % 60)), h('span.hl-val-u', 'min'));
  }
  function catIcon(cat, size) { const c = HD.CATS[cat]; return h('span.hl-cic', { style: { color: c.color } }, JC.icon(c.icon, { size: size || 17 })); }
  function medsToday() {
    const d = today();
    const logs = JC.store.all('hlmeds').filter((x) => x.day === d);
    return ['08:00', '20:00'].map((slot) => ({ slot, log: logs.find((l) => l.slot === slot) || null }));
  }
  function mindCounts() {
    const c = Object.assign({}, (JC.store.get('hlmindsum', 'sum') || { counts: {} }).counts);
    JC.store.all('hlmind').forEach((e) => (e.feel || []).forEach((f) => { c[f] = (c[f] || 0) + 1; }));
    return c;
  }

  // ════════════════════════════════════════════════════════════════
  JC.app({
    id: 'health',
    name: 'Health',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-health');
      const offs = [];
      let tabs = null;
      const push = (p) => tabs.nav().push(p);
      const tint = 'var(--hl-heart)';

      // ── Summary cards ─────────────────────────────────────────────
      function card(o) {
        const el = h('div.hl-card', { onTap: o.onTap },
          h('div.hl-card-top', o.icon, h('span.hl-card-t', { style: { color: o.color } }, o.title), h('span.hl-card-time', o.time || ''), JC.icon('chevron.right', { size: 13, weight: 2.6, cls: 'hl-chev' })),
          h('div.hl-card-body', h('div.hl-card-l', o.value, o.sub ? h('div.hl-card-sub', o.sub) : null), o.chart ? h('div.hl-card-chart', o.chart) : null, o.action || null));
        if (o.menu) JC.ui.contextMenu(el, o.menu);
        return el;
      }
      function pinCard(id) {
        const d = today();
        const t = now();
        const unpin = () => ({ items: [{ text: 'Unpin', icon: 'pin.slash', onTap: () => setPrefs({ pins: prefs().pins.filter((x) => x !== id) }) }, { text: 'Show Details', icon: 'chevron.right', onTap: () => openMetric(id) }] });
        if (id === 'workouts') {
          const w = WORKOUTS.find((x) => x.d <= d) || WORKOUTS[0];
          return card({ icon: catIcon('activity'), color: HD.CATS.activity.color, title: 'Workouts', time: w.d === d ? w.start : U.fmtRelative(HD.dayStart(w.d)), value: valueNode(w.km.toFixed(1), 'km'), sub: w.type + ' · ' + U.fmtDur(w.time) + ' · ' + w.place, onTap: () => push(workoutPage(w.id)), menu: unpin });
        }
        if (id === 'meds') {
          const md = medsToday();
          const pend = md.find((x) => !x.log && HD.dayStart(d) + (x.slot === '08:00' ? 8 : 20) * 3600e3 <= t);
          return card({ icon: catIcon('meds'), color: HD.CATS.meds.color, title: 'Medications', time: pend ? pend.slot : 'Today',
            value: h('div.hl-med-v', h('div.hl-med-n', 'Tacrolimus'), h('div.hl-med-s', '2 mg Capsule')),
            sub: pend ? pend.slot + ' · Not Logged' : 'All doses logged today',
            action: pend ? h('div.hl-logbtn', { onTap: (e) => { e.stopPropagation(); logMeds(); } }, 'Log') : h('div.hl-logged', JC.icon('checkmark.circle.fill', { size: 22 })),
            onTap: () => push(medsPage()), menu: unpin });
        }
        if (id === 'mind') {
          const last = JC.store.all('hlmind').slice().sort((a, b) => b.t - a.t)[0];
          const c = mindCounts();
          return card({ icon: catIcon('mind'), color: HD.CATS.mind.color, title: 'State of Mind', time: last ? U.fmtRelative(last.t) : '',
            value: h('div.hl-med-v', h('div.hl-med-n', last ? last.feel[0] : 'Not Logged'), h('div.hl-med-s', 'Logged ' + (c.Annoyed || 0) + ' times: Annoyed')),
            sub: last ? VAL[last.valence] + ' · ' + (last.feel.join(', ')) : null,
            action: h('div.hl-logbtn', { onTap: (e) => { e.stopPropagation(); logMind(); } }, 'Log'),
            onTap: () => push(mindPage()), menu: unpin });
        }
        const m = M[id];
        if (!m) return null;
        const cat = HD.CATS[m.cat];
        if (id === 'heart') {
          const hs = HD.hourly('heart', d, t).filter((b) => b.hi != null);
          const last = hs[hs.length - 1];
          const latest = last ? (last.lo + Math.round((last.hi - last.lo) * 0.25)) : null;
          return card({ icon: catIcon('heart'), color: cat.color, title: 'Heart Rate', time: last ? U.fmtTime(Math.min(t, last.t + 40 * 60e3)) : '', value: valueNode(String(latest || '—'), 'BPM'), sub: 'Latest',
            chart: JC.hchart.spark({ kind: 'range', data: HD.hourly('heart', d, t), color: cat.color, barW: 3 }), onTap: () => openMetric('heart'), menu: unpin });
        }
        if (id === 'sleep') {
          const ser = HD.series('sleep', 'W', t);
          const vs = ser.buckets.filter((b) => b.v != null && b.v > 0);
          const avg = vs.reduce((a, b) => a + b.v, 0) / Math.max(1, vs.length);
          return card({ icon: catIcon('sleep'), color: cat.color, title: 'Sleep', time: 'This Week', value: sleepNode(avg), sub: 'Avg. Time Asleep',
            chart: JC.hchart.spark({ kind: 'bars', data: ser.buckets.map((b) => ({ v: b.v ? b.v / 60 : 0 })), color: cat.color, goal: { v: 7 }, barW: 7 }), onTap: () => openMetric('sleep', 'W'), menu: unpin });
        }
        const v = HD.dayValue(id, d, t);
        const hs = HD.hourly(id, d, t);
        return card({ icon: catIcon(m.cat), color: cat.color, title: m.short || m.name, time: m.agg === 'sum' ? 'Today' : U.fmtTime(t), value: valueNode(fmtNum(id, v), m.unit), sub: id === 'mindful' && !v ? 'No mindful minutes yet today' : null,
          chart: m.agg === 'sum' ? JC.hchart.spark({ kind: 'bars', data: hs, color: cat.color, barW: 3 }) : null, onTap: () => openMetric(id), menu: unpin });
      }
      function highlights() {
        const t = now();
        const items = [];
        const hr = HD.hourly('heart', 0, Math.max(t, HD.dayStart(0) + 23.8 * 3600e3));
        items.push({ cat: 'heart', title: 'Heart Rate', text: 'Your heart rate reached 121 BPM at 22:50 while you seemed to be inactive. That’s higher than usual for you at this time of night.', chart: JC.hchart.chart({ kind: 'range', data: hr.slice(16), color: 'var(--hl-heart)', h: 92, w: 300, barW: 7, xLabels: [{ i: 0, text: '4 PM' }, { i: 4, text: '8 PM' }, { i: 7, text: '11 PM' }], annotate: [{ i: 6, text: '121' }], ticks: [60, 90, 120] }), open: () => push(hrEventPage()) });
        const sl = HD.series('sleep', 'W', t).buckets;
        items.push({ cat: 'sleep', title: 'Sleep', text: 'On average, you slept 4 hr 52 min a night this week — about 2 hours less than your 7 hr sleep goal.', chart: JC.hchart.chart({ kind: 'bars', data: sl.map((b) => ({ v: b.v ? b.v / 60 : 0 })), color: 'var(--hl-sleep)', h: 92, w: 300, barW: 14, goal: { v: 7, label: 'Goal 7 hr' }, ticks: [0, 4, 8], fmtY: (v) => v + 'h', xLabels: sl.map((b, i) => ({ i, text: 'SSMTWTF'[new Date(b.t).getDay()] })) }), open: () => openMetric('sleep', 'W') });
        items.push({ cat: 'activity', title: 'Running', text: 'Your 6.2 km run this morning was your longest outdoor run in 5 days, at an average pace of 5′08″ per kilometre.', open: () => push(workoutPage('w0')) });
        items.push({ cat: 'activity', title: 'Steps', text: 'You’re averaging more steps this week than last week — about 11,900 steps a day.', open: () => openMetric('steps', 'W') });
        items.push({ cat: 'mind', title: 'Mindful Minutes', text: 'You haven’t recorded any mindful minutes in the last 30 days.', open: () => openMetric('mindful', 'M') });
        return items.map((x) => h('div.hl-hl', { onTap: x.open }, h('div.hl-hl-top', catIcon(x.cat, 15), h('span', { style: { color: HD.CATS[x.cat].color } }, x.title), JC.icon('chevron.right', { size: 12, weight: 2.6, cls: 'hl-chev' })), h('div.hl-hl-t', x.text), x.chart ? h('div.hl-hl-chart', x.chart) : null));
      }
      function summaryPage() {
        return JC.ui.page({
          title: 'Summary', large: true, bg: 'grouped', tint, refreshOnShow: true,
          largeRight: h('div.hl-me', { onTap: () => profileSheet() }, JC.ui.avatar('me', 34)),
          content: () => {
            const p = prefs();
            const notifOn = !p.hrDismissed;
            return [
              notifOn ? h('div.hl-alert', { onTap: () => push(hrEventPage()) },
                h('div.hl-alert-ic', JC.icon('heart.fill', { size: 18 })),
                h('div.hl-alert-m', h('div.hl-alert-t', 'High Heart Rate'), h('div.hl-alert-s', 'Your heart rate rose to 121 BPM at 22:50 while you seemed to be inactive for 10 minutes.')),
                h('div.hl-alert-x', { onTap: (e) => { e.stopPropagation(); setPrefs({ hrDismissed: true }); } }, JC.icon('xmark', { size: 13, weight: 2.8 }))) : null,
              h('div.hl-sec-h', h('span', 'Pinned'), h('span.hl-edit.tap', { onTap: () => editPins() }, 'Edit')),
              h('div.hl-cards', p.pins.map(pinCard).filter(Boolean)),
              JC.ui.list([{ rows: [{ title: 'Show All Health Data', icon: { glyph: 'heart.text.square', bg: 'var(--hl-heart)' }, chevron: true, onTap: () => push(allDataPage()) }] }]),
              h('div.hl-sec-h', h('span', 'Highlights'), h('span.hl-edit.tap', { onTap: () => push(highlightsPage()) }, 'Show All')),
              h('div.hl-hls', highlights().slice(0, 3)),
              h('div.hl-sec-h', h('span', 'Get More from Health')),
              h('div.hl-promo', { onTap: () => push(checklistPage()) }, h('div.hl-promo-ic', JC.icon('checkmark.shield.fill', { size: 26 })), h('div', h('div.hl-promo-t', 'Health Checklist'), h('div.hl-promo-s', 'Check that health and safety features are set up the way you want.')), JC.icon('chevron.right', { size: 13, weight: 2.6, cls: 'hl-chev' })),
              h('div.hl-foot', 'Data from Jiang Cheng’s Apple Watch and iPhone'),
            ];
          },
        });
      }
      function highlightsPage() { return JC.ui.page({ title: 'Highlights', bg: 'grouped', tint, content: () => [h('div.hl-hls', highlights())] }); }
      function editPins() {
        const all = ['steps', 'workouts', 'heart', 'sleep', 'mindful', 'meds', 'mind', 'distance', 'active', 'exercise', 'resting', 'hrv', 'weight', 'resp', 'oxygen', 'noise', 'vo2', 'flights', 'caffeine'];
        const sh = JC.ui.sheet({
          title: 'Edit Pinned', detent: 'large', right: { text: 'Done' },
          content: () => [JC.ui.list([{ header: 'Tap the pin to add or remove', rows: all.map((id) => {
            const on = prefs().pins.includes(id);
            const name = id === 'workouts' ? 'Workouts' : id === 'meds' ? 'Medications' : id === 'mind' ? 'State of Mind' : M[id].name;
            const cat = id === 'workouts' ? 'activity' : id === 'meds' ? 'meds' : id === 'mind' ? 'mind' : M[id].cat;
            return { title: name, leading: catIcon(cat, 19), right: h('div.hl-pin', { class: { on } }, JC.icon(on ? 'pin.fill' : 'pin', { size: 18 })), onTap: () => { const pins = prefs().pins.slice(); const i = pins.indexOf(id); if (i >= 0) pins.splice(i, 1); else pins.push(id); setPrefs({ pins }); sh.render(); } };
          }) }])],
        });
      }

      // ── metric detail ─────────────────────────────────────────────
      function openMetric(id, range) {
        if (id === 'workouts') return push(workoutsPage());
        if (id === 'meds') return push(medsPage());
        if (id === 'mind') return push(mindPage());
        if (!M[id]) return;
        return push(metricPage(id, range));
      }
      const RANGES = ['D', 'W', 'M', '6M', 'Y'];
      function dateRangeLabel(range, ser) {
        const t = now();
        const b = ser.buckets;
        if (range === 'D') return 'Today';
        if (range === 'W' || range === 'M') { const a = new Date(b[0].t), z = new Date(b[b.length - 1].t); return U.fmtDate(a, 'md') + '–' + (a.getMonth() === z.getMonth() ? z.getDate() : U.fmtDate(z, 'md')) + ', ' + z.getFullYear(); }
        if (range === '6M') return U.MONTHS[new Date(b[0].t).getMonth()].slice(0, 3) + '–' + U.MONTHS[new Date(t).getMonth()].slice(0, 3) + ' ' + new Date(t).getFullYear();
        return U.MONTHS[new Date(b[0].t).getMonth()].slice(0, 3) + ' ' + new Date(b[0].t).getFullYear() + '–' + U.MONTHS[new Date(t).getMonth()].slice(0, 3) + ' ' + new Date(t).getFullYear();
      }
      function summarize(id, range, ser, sel) {
        const m = M[id];
        const b = sel != null ? [ser.buckets[sel]] : ser.buckets;
        if (id === 'heart') {
          const r = b.filter((x) => x.hi != null);
          if (!r.length) return { k: 'RANGE', node: valueNode('—', 'BPM') };
          return { k: 'RANGE', node: valueNode(Math.min(...r.map((x) => x.lo)) + '–' + Math.max(...r.map((x) => x.hi)), 'BPM') };
        }
        if (id === 'sleep') {
          if (range === 'D') return { k: sel != null ? LANES.find((l) => l.key === ser.stages[sel].stage).label.toUpperCase() : 'TIME ASLEEP', node: sleepNode(sel != null ? (ser.stages[sel].e - ser.stages[sel].s) / 60e3 : ser.asleep) };
          const vs = b.filter((x) => x.v);
          return { k: sel != null ? 'TIME ASLEEP' : 'AVG. TIME ASLEEP', node: sleepNode(vs.length ? vs.reduce((a, x) => a + x.v, 0) / vs.length : 0) };
        }
        const vs = b.filter((x) => x.v != null);
        if (m.agg === 'sum') {
          if (range === 'D' || sel != null) return { k: sel != null && range !== 'D' ? (range === 'W' || range === 'M' ? 'TOTAL' : 'DAILY AVERAGE') : 'TOTAL', node: valueNode(fmtNum(id, vs.reduce((a, x) => a + x.v, 0)), m.unit) };
          return { k: 'AVERAGE', node: valueNode(fmtNum(id, vs.length ? vs.reduce((a, x) => a + x.v, 0) / vs.length : 0), m.unit) };
        }
        return { k: 'AVERAGE', node: valueNode(fmtNum(id, vs.length ? vs.reduce((a, x) => a + x.v, 0) / vs.length : null), m.unit) };
      }
      function metricChart(id, range, ser, onScrub) {
        const m = M[id];
        const color = HD.CATS[m.cat].color;
        if (id === 'sleep' && range === 'D') {
          if (!ser.stages.length) return JC.hchart.chart({ kind: 'bars', data: [], empty: 'No Data', h: 210 });
          const xl = [];
          const h0 = new Date(ser.t0); h0.setMinutes(0, 0, 0);
          for (let t = h0.getTime() + 3600e3; t < ser.t1; t += 2 * 3600e3) xl.push({ x: (t - ser.t0) / (ser.t1 - ser.t0), text: U.fmtTime(t).replace(':00', '') });
          return JC.hchart.chart({ kind: 'stages', data: ser.stages, lanes: LANES, t0: ser.t0, t1: ser.t1, h: 210, padR: 46, xLabels: xl, onScrub });
        }
        const base = { data: ser.buckets, color, h: 210, xLabels: ser.xLabels, onScrub, label: m.name };
        if (id === 'heart') return JC.hchart.chart(Object.assign(base, { kind: 'range', barW: range === 'M' || range === '6M' ? 5 : 8, annotate: range === 'D' ? [{ i: 7, text: '171' }, { i: 22, text: '121' }] : [] }));
        if (id === 'sleep') return JC.hchart.chart(Object.assign(base, { kind: 'bars', data: ser.buckets.map((b) => ({ v: b.v ? b.v / 60 : 0, t: b.t })), goal: { v: 7, label: 'Goal' }, fmtY: (v) => v + ' hr', ticks: [0, 4, 8], barW: range === 'W' ? 18 : 6 }));
        if (m.agg === 'sum') {
          const max = Math.max(...ser.buckets.map((b) => b.v || 0));
          const iMax = ser.buckets.findIndex((b) => b.v === max && max > 0);
          return JC.hchart.chart(Object.assign(base, { kind: 'bars', fmtY: (v) => (v >= 1000 ? (v / 1000) + 'K' : String(v)), barW: range === 'W' ? 20 : range === 'Y' ? 14 : range === 'D' ? 7 : 6, empty: id === 'mindful' ? 'No Data' : null, zeroIsEmpty: id === 'mindful', annotate: iMax >= 0 && range !== 'Y' ? [{ i: iMax, text: fmtNum(id, max) }] : [] }));
        }
        return JC.hchart.chart(Object.assign(base, { kind: 'dots', data: ser.buckets.map((b) => ({ v: b.v })) }));
      }
      function metricPage(id, range0) {
        const m = M[id];
        let range = range0 || 'D';
        const color = HD.CATS[m.cat].color;
        const page = JC.ui.page({
          title: m.name, bg: 'grouped', tint: color, refreshOnShow: true,
          right: id === 'sleep' ? [] : [JC.ui.navBtn({ text: 'Add Data', onTap: () => addData(id) })],
          content: () => {
            const ser = HD.series(id, range, now());
            const head = h('div.hl-dh');
            const paintHead = (sel) => {
              const s = summarize(id, range, ser, sel);
              head.innerHTML = '';
              const lab = sel == null ? dateRangeLabel(range, ser) : (id === 'sleep' && range === 'D' ? U.fmtTime(ser.stages[sel].s) + '–' + U.fmtTime(ser.stages[sel].e) : (ser.buckets[sel].full || ''));
              head.append(h('div.hl-dh-k', s.k), s.node, h('div.hl-dh-d', lab));
            };
            paintHead(null);
            const seg = JC.ui.segmented({ items: RANGES, value: RANGES.indexOf(range), onChange: (i) => { range = RANGES[i]; page.render(); } });
            const chart = metricChart(id, range, ser, (i) => paintHead(i));
            const out = [h('div.hl-seg', seg), h('div.hl-chartcard', head, chart,
              id === 'sleep' && range === 'D' && ser.by ? h('div.hl-legend', LANES.map((l) => h('span', h('i', { style: { background: l.color } }), l.label + ' ', h('b', fmtSleep(ser.by[l.key] || 0).replace(' 0 min', '').replace(/^0 hr /, ''))))) : null)];
            out.push(...metricExtras(id, range, ser));
            out.push(JC.ui.list([
              { rows: [{ title: 'Show All Data', chevron: true, onTap: () => push(dataTablePage(id)) }, { title: 'Data Sources & Access', chevron: true, onTap: () => push(sourcesPage(id)) }] },
              { header: 'About ' + m.name, rows: [{ custom: h('div.hl-about', m.about) }] },
              { header: 'Options', rows: [
                { title: 'Pin in Summary', toggle: { on: prefs().pins.includes(id), onChange: (v) => { const pins = prefs().pins.filter((x) => x !== id); if (v) pins.push(id); setPrefs({ pins }); } } },
                m.unit === 'km' ? { title: 'Unit', detail: 'Kilometres', onTap: () => JC.ui.toast('Units follow your Region: Metric', { icon: 'globe' }) } : null,
              ].filter(Boolean) },
            ]));
            return out;
          },
        });
        return page;
      }
      function metricExtras(id, range, ser) {
        const out = [];
        if (id === 'heart') {
          out.push(JC.ui.list([{ rows: [
            { title: 'Resting Rate', detail: fmtNum('resting', HD.dayValue('resting', today(), now())) + ' BPM', onTap: () => push(metricPage('resting')) },
            { title: 'Walking Average', detail: fmtNum('walkhr', HD.dayValue('walkhr', today(), now())) + ' BPM', onTap: () => push(metricPage('walkhr')) },
            { title: 'Workout', detail: '152 BPM', onTap: () => push(workoutPage('w0')) },
            { title: 'Heart Rate Variability', detail: fmtNum('hrv', HD.dayValue('hrv', today(), now())) + ' ms', onTap: () => push(metricPage('hrv')) },
          ] }, { header: 'Notifications', rows: [{ title: 'High Heart Rate', subtitle: 'Today at 22:50 · 121 BPM', icon: { glyph: 'heart.fill', bg: 'var(--red)' }, chevron: true, onTap: () => push(hrEventPage()) }, { title: 'High Heart Rate Notifications', detail: '120 BPM', chevron: true, onTap: () => push(hrNotifPage()) }] }]));
        }
        if (id === 'sleep') {
          out.push(JC.ui.list([{ header: 'Sleep Schedule', rows: [{ title: 'Every Day', subtitle: '23:30 – 07:00 · Goal 7 hr', chevron: true, onTap: () => JC.ui.alert({ title: 'Sleep Schedule', message: 'Bedtime 23:30, wake up 07:00.\n\nJiang Cheng has met his sleep goal once this month.', buttons: [{ text: 'OK' }] }) }, { title: 'Sleep Focus', detail: JC.state.d.settings.focus === 'sleep' ? 'On' : 'Off', chevron: true, onTap: () => JC.os.open('settings', { page: 'focus' }) }] }]));
        }
        if (id === 'mindful') {
          out.push(h('div.hl-btnrow', h('div.hl-bigbtn', { onTap: () => mindfulSession() }, JC.icon('leaf.fill', { size: 18 }), 'Start a 1-Minute Breathe')));
        }
        return out;
      }
      function mindfulSession() {
        let n = 0;
        const circle = h('div.hl-breathe-c');
        const label = h('div.hl-breathe-l', 'Breathe in…');
        const sh = JC.ui.sheet({ title: 'Breathe', detent: 'large', left: { text: 'End' }, content: () => [h('div.hl-breathe', circle, label, h('div.hl-breathe-s', 'Follow the circle. One minute.'))], onClose: () => { clearInterval(iv); if (n >= 6) { JC.store.add('hldata', { metric: 'mindful', t: now(), v: 1 }); JC.ui.toast('1 mindful minute logged', { icon: 'leaf.fill' }); } } });
        const iv = setInterval(() => { n++; label.textContent = n % 2 ? 'Breathe out…' : 'Breathe in…'; circle.classList.toggle('out', n % 2 === 1); if (n >= 12) { clearInterval(iv); label.textContent = 'Well done.'; setTimeout(() => sh.close(), 900); } }, 5000);
      }
      function addData(id) {
        const m = M[id];
        let val = '';
        const field = JC.ui.input({ placeholder: m.unit, kbType: 'num', enterkey: 'done', onInput: (v) => { val = v; } });
        JC.ui.sheet({
          title: m.name, detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Add', onTap: () => {
            const v = parseFloat(String(val).replace(',', '.'));
            const lim = { heart: [25, 230], resting: [25, 120], weight: [30, 200], steps: [1, 60000], mindful: [1, 240] }[id] || [0, 1e6];
            if (isNaN(v) || v < lim[0] || v > lim[1]) { JC.ui.alert({ title: 'Invalid Value', message: 'Enter a value between ' + lim[0] + ' and ' + lim[1] + ' ' + m.unit + '.', buttons: [{ text: 'OK' }] }); return false; }
            JC.store.add('hldata', { metric: id, t: now(), v });
            JC.ui.toast('Added ' + v + ' ' + m.unit, { icon: 'checkmark' });
            return true;
          } },
          content: () => [JC.ui.list([{ rows: [
            { title: 'Date', detail: U.fmtDate(now(), 'medium') },
            { title: 'Time', detail: U.fmtTime(now()) },
            { custom: h('div.hl-field', h('span', m.unit === 'steps' ? 'Steps' : m.name), field, h('span.hl-field-u', m.unit)) },
          ] }], { cls: 'hl-add' })],
        });
        setTimeout(() => field.focus(), 450);
      }
      function dataTablePage(id) {
        const m = M[id];
        return JC.ui.page({
          title: 'All Recorded Data', bg: 'grouped', tint: HD.CATS[m.cat].color, refreshOnShow: true,
          content: () => {
            const t = now();
            const man = JC.store.all('hldata').filter((x) => x.metric === id).sort((a, b) => b.t - a.t);
            const rows = [];
            if (man.length) rows.push({ header: 'Added by You', rows: man.map((x) => ({ title: fmtNum(id, x.v) + ' ' + m.unit, detail: U.fmtDate(x.t, 'md') + ', ' + U.fmtTime(x.t), swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => JC.store.remove('hldata', x.id) }] })) });
            if (id === 'sleep') {
              const ser = HD.series('sleep', 'M', t);
              rows.push({ header: 'Nights', rows: ser.buckets.slice().reverse().filter((b) => b.v).map((b) => ({ title: fmtSleep(b.v), detail: b.full })) });
            } else {
              const hs = HD.hourly(id, today(), t).filter((b) => (b.v != null && b.v !== 0) || b.hi != null).reverse();
              rows.push({ header: 'Today', rows: hs.map((b) => ({ title: b.hi != null ? b.lo + '–' + b.hi + ' BPM' : fmtNum(id, b.v) + ' ' + m.unit, detail: U.fmtTime(b.t), subtitle: 'Jiang Cheng’s Apple Watch' })) });
              const ser = HD.series(id, 'M', t);
              rows.push({ header: 'Daily', rows: ser.buckets.slice(0, -1).reverse().map((b) => ({ title: b.hi != null ? b.lo + '–' + b.hi + ' BPM' : fmtNum(id, b.v) + ' ' + m.unit, detail: b.full })) });
            }
            return [JC.ui.list(rows)];
          },
        });
      }
      function sourcesPage(id) {
        return JC.ui.page({ title: 'Data Sources & Access', bg: 'grouped', tint, content: () => [JC.ui.list([
          { header: 'Apps Allowed to Read Data', rows: [{ title: 'Lotus Leap', icon: { app: 'lotusleap' }, detail: 'Not Allowed', onTap: () => JC.ui.alert({ title: 'Lotus Leap', message: 'Lotus Leap asked to read your Heart Rate “for a fun feature”. You said no.', buttons: [{ text: 'OK' }] }) }] },
          { header: 'Data Sources', rows: [{ title: 'Jiang Cheng’s Apple Watch', icon: { glyph: 'clock', bg: 'var(--gray)' }, check: true }, { title: 'Jiang Cheng’s iPhone', icon: { glyph: 'iphone', bg: 'var(--gray)' }, check: true }], footer: 'When more than one source records the same data, Health uses the source at the top of the list.' },
        ])] });
      }
      function hrEventPage() {
        const pts = [];
        const t0 = HD.dayStart(0) + (22 * 60 + 30) * 60e3;
        const prof = [84, 85, 86, 86, 88, 87, 89, 90, 91, 93, 95, 96, 98, 101, 104, 107, 110, 113, 116, 118, 121, 120, 119, 118, 117, 116, 115, 114, 113, 112, 110, 106, 103, 99, 96, 94, 92, 91, 90, 89, 88];
        prof.forEach((v, i) => pts.push({ v, t: t0 + i * 60e3, full: U.fmtTime(t0 + i * 60e3) }));
        return JC.ui.page({ title: 'High Heart Rate', bg: 'grouped', tint, content: () => {
          const head = h('div.hl-dh', h('div.hl-dh-k', 'HIGHEST'), valueNode('121', 'BPM'), h('div.hl-dh-d', 'Today at 22:50'));
          const ch = JC.hchart.chart({ kind: 'line', data: pts, color: 'var(--hl-heart)', h: 190, goal: { v: 120, label: '120 BPM' }, yMin: 70, yMax: 130, ticks: [70, 100, 130], xLabels: [{ i: 0, text: U.fmtTime(t0).replace(/ [AP]M/, '') }, { i: 20, text: U.fmtTime(t0 + 20 * 60e3).replace(/ [AP]M/, '') }, { i: 40, text: U.fmtTime(t0 + 40 * 60e3).replace(/ [AP]M/, '') }], onScrub: (i) => { head.innerHTML = ''; if (i == null) head.append(h('div.hl-dh-k', 'HIGHEST'), valueNode('121', 'BPM'), h('div.hl-dh-d', 'Today at 22:50')); else head.append(h('div.hl-dh-k', 'HEART RATE'), valueNode(String(pts[i].v), 'BPM'), h('div.hl-dh-d', pts[i].full)); } });
          return [
            h('div.hl-chartcard', head, ch),
            JC.ui.list([{ rows: [{ custom: h('div.hl-about', 'Your heart rate rose above 120 BPM while you seemed to be inactive for 10 minutes starting at 22:50. A heart rate that stays high while you are at rest may be caused by stress, caffeine, alcohol, or a strong emotion.') }] },
              { rows: [{ title: 'Activity at the Time', detail: 'Standing still' }, { title: 'Location', detail: 'Koi Tower' }, { title: 'Source', detail: 'Apple Watch' }] },
              { rows: [{ title: 'High Heart Rate Notifications', chevron: true, onTap: () => push(hrNotifPage()) }, { title: 'Learn More', tinted: true, onTap: () => JC.os.open('safari', { url: 'support.apple.com/heart-rate-notifications' }) }] }]),
          ];
        } });
      }
      function hrNotifPage() {
        return JC.ui.page({ title: 'High Heart Rate', bg: 'grouped', tint, refreshOnShow: true, content: (pg) => {
          const thr = prefs().hrThr || 120;
          return [JC.ui.list([{ rows: [{ title: 'High Heart Rate Notifications', toggle: { on: prefs().hrOn !== false, onChange: (v) => setPrefs({ hrOn: v }) } }], footer: 'You’ll be notified if your heart rate stays above the chosen BPM for 10 minutes while you seem to be inactive.' },
            { header: 'Threshold', rows: [100, 110, 120, 130, 140, 150].map((v) => ({ title: v + ' BPM', check: thr === v, onTap: () => { setPrefs({ hrThr: v }); pg.render(); } })) },
            { header: 'Recent', rows: [{ title: 'Today, 22:50', detail: '121 BPM', chevron: true, onTap: () => push(hrEventPage()) }] }])];
        } });
      }

      // ── workouts ──────────────────────────────────────────────────
      function workoutsPage() {
        return JC.ui.page({ title: 'Workouts', bg: 'grouped', tint: 'var(--hl-activity)', content: () => [JC.ui.list([{ header: 'This Week', rows: WORKOUTS.map((w) => ({ leading: h('div.hl-wic', JC.icon(w.icon, { size: 20 })), title: w.type, subtitle: (w.km ? w.km.toFixed(2) + ' km · ' : '') + U.fmtDur(w.time), detail: w.d === today() ? w.start : U.fmtDate(HD.dayStart(w.d), 'day').slice(0, 3), chevron: true, onTap: () => push(workoutPage(w.id)) })) }])] });
      }
      function workoutPage(id) {
        const w = WORKOUTS.find((x) => x.id === id);
        return JC.ui.page({ title: w.d === today() ? 'Today' : U.fmtDate(HD.dayStart(w.d), 'long'), bg: 'grouped', tint: 'var(--hl-activity)', content: () => {
          const stat = (k, v, c) => h('div.hl-ws', h('div.hl-ws-k', k), h('div.hl-ws-v', { style: c ? { color: c } : null }, v));
          const hrPts = [];
          const n = Math.round(w.time / 60);
          for (let i = 0; i <= n; i++) { const r = HD.rnd(w.id + i)(); hrPts.push({ v: Math.round(i < 4 ? 100 + i * 12 : w.hr - 6 + r * 14 + (i > n - 4 ? 6 : 0)), full: i + ' min' }); }
          const route = h('div.hl-route', { html: '<svg viewBox="0 0 300 140" width="100%"><path d="M20 110 C 60 40, 110 120, 150 70 S 240 20, 280 60" fill="none" stroke="var(--hl-activity)" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="110" r="6" fill="var(--green)"/><circle cx="280" cy="60" r="6" fill="var(--red)"/></svg>' });
          const head = h('div.hl-dh', h('div.hl-dh-k', 'AVG HEART RATE'), valueNode(String(w.hr), 'BPM'));
          return [
            h('div.hl-whead', h('div.hl-wic.big', JC.icon(w.icon, { size: 30 })), h('div', h('div.hl-wt', w.type), h('div.hl-wsub', w.start + ' · ' + w.place))),
            h('div.hl-wgrid', stat('Workout Time', U.fmtDur(w.time), 'var(--hl-activity)'), w.km ? stat('Distance', w.km.toFixed(2) + ' km', 'var(--hl-activity)') : stat('Total Time', U.fmtDur(w.time + 120)), stat('Active Calories', w.kcal + ' kcal', 'var(--hl-heart)'), stat('Total Calories', (w.kcal + 56) + ' kcal'), stat('Avg. Heart Rate', w.hr + ' BPM', 'var(--hl-heart)'), w.pace ? stat('Avg. Pace', w.pace + '/km') : stat('Effort', '7 · Hard'), w.cadence ? stat('Avg. Cadence', w.cadence + ' spm') : null, w.km ? stat('Elevation Gain', w.elev + ' m') : null),
            w.km ? h('div.hl-chartcard', h('div.hl-dh-k', 'ROUTE'), route, h('div.hl-dh-d', w.place + ' · 13° Rain')) : null,
            h('div.hl-chartcard', head, JC.hchart.chart({ kind: 'line', data: hrPts, color: 'var(--hl-heart)', h: 150, xLabels: [{ i: 0, text: '0' }, { i: Math.round(n / 2), text: Math.round(n / 2) + ' min' }, { i: n, text: n + ' min' }], onScrub: (i) => { head.innerHTML = ''; if (i == null) head.append(h('div.hl-dh-k', 'AVG HEART RATE'), valueNode(String(w.hr), 'BPM')); else head.append(h('div.hl-dh-k', 'HEART RATE'), valueNode(String(hrPts[i].v), 'BPM'), h('div.hl-dh-d', hrPts[i].full)); } })),
            w.km ? JC.ui.list([{ header: 'Splits', rows: Array.from({ length: Math.ceil(w.km) }, (v, k) => { const sec = Math.round(w.time / w.km * (0.96 + HD.rnd(w.id + 's' + k)() * 0.08)); return { title: 'Kilometre ' + (k + 1) + (k + 1 > w.km ? ' (' + (w.km % 1).toFixed(1) + ')' : ''), detail: Math.floor(sec / 60) + '′' + String(sec % 60).padStart(2, '0') + '″' }; }) }]) : null,
            JC.ui.list([{ rows: [{ title: 'Share Workout', tinted: true, onTap: () => JC.ui.share({ title: w.type + ' · ' + (w.km ? w.km.toFixed(1) + ' km' : U.fmtDur(w.time)), subtitle: 'Fitness', payload: { kind: 'text', text: w.type + ': ' + (w.km ? w.km.toFixed(1) + ' km in ' : '') + U.fmtDur(w.time) } }) }, { title: 'Delete Workout', destructive: true, onTap: () => JC.ui.alert({ title: 'Delete Workout?', message: 'Workouts recorded by Apple Watch can only be deleted from the watch.', buttons: [{ text: 'OK' }] }) }] }]),
          ];
        } });
      }

      // ── medications ───────────────────────────────────────────────
      function logMeds() {
        const pend = medsToday().filter((x) => !x.log);
        if (!pend.length) { JC.ui.toast('All of today’s doses are logged', { icon: 'checkmark.circle.fill' }); return; }
        const choice = {};
        pend.forEach((p) => { choice[p.slot] = 'taken'; });
        JC.ui.sheet({
          title: 'Log Medication', detent: 'medium', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => {
            pend.forEach((p) => {
              const st = choice[p.slot];
              JC.store.add('hlmeds', { med: 'tacrolimus', slot: p.slot, day: today(), status: st, t: now() });
              try { JC.story.act('med_log', { med: 'tacrolimus', slot: p.slot, status: st }); } catch (e) { /* ignore */ }
            });
            JC.audio.play('success');
            JC.ui.toast(pend.length > 1 ? 'Doses logged' : 'Dose logged', { icon: 'pills.fill' });
          } },
          content: () => [h('div.hl-medlog', h('div.hl-med-hero', h('div.hl-pill', JC.icon('pills.fill', { size: 30 })), h('div', h('div.hl-med-n', 'Tacrolimus'), h('div.hl-med-s', '2 mg Capsule · Immunosuppressant'))),
            pend.map((p) => h('div.hl-medrow', h('div', h('div.hl-medrow-t', p.slot), h('div.hl-medrow-s', p.slot === '20:00' ? 'Scheduled · during the gala' : 'Scheduled')),
              JC.ui.segmented({ items: ['Taken', 'Skipped'], value: 0, onChange: (i) => { choice[p.slot] = i ? 'skipped' : 'taken'; } }))),
            h('div.hl-med-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), 'Tacrolimus interacts with alcohol and grapefruit. Take at the same times every day.'))],
        });
      }
      function medsPage() {
        return JC.ui.page({
          title: 'Medications', bg: 'grouped', tint: 'var(--hl-meds)', refreshOnShow: true,
          right: [JC.ui.navBtn({ text: 'Log', onTap: () => logMeds() })],
          content: () => {
            const md = medsToday();
            const logs = JC.store.all('hlmeds').slice().sort((a, b) => b.t - a.t);
            const days = [];
            logs.forEach((l) => { if (!days.includes(l.day)) days.push(l.day); });
            const dots = [];
            for (let d = today() - 13; d <= today(); d++) { const ls = logs.filter((l) => l.day === d && l.status === 'taken'); dots.push({ v: ls.length, full: U.fmtDate(HD.dayStart(d), 'md') + ' · ' + ls.length + ' of 2 taken', color: ls.length === 2 ? 'var(--hl-meds)' : 'var(--orange)' }); }
            const head = h('div.hl-dh', h('div.hl-dh-k', 'LAST 14 DAYS'), valueNode(String(dots.reduce((a, d) => a + d.v, 0)), 'of 28 doses taken'));
            return [
              h('div.hl-med-hero.card', h('div.hl-pill', JC.icon('pills.fill', { size: 30 })), h('div', h('div.hl-med-n', 'Tacrolimus'), h('div.hl-med-s', '2 mg Capsule · Twice a day at 08:00 and 20:00'))),
              JC.ui.list([{ header: 'Today', rows: md.map((x) => ({ title: x.slot, subtitle: x.log ? (x.log.status === 'taken' ? 'Taken at ' + U.fmtTime(x.log.t) : 'Skipped') : 'Not Logged', right: x.log ? h('span.hl-st', { class: x.log.status }, JC.icon(x.log.status === 'taken' ? 'checkmark.circle.fill' : 'xmark.circle.fill', { size: 22 })) : h('div.hl-logbtn', { onTap: (e) => { e.stopPropagation(); logMeds(); } }, 'Log'), onTap: x.log ? () => JC.ui.actionSheet({ title: x.slot + ' dose', actions: [{ text: 'Undo Log', style: 'destructive', onTap: () => JC.store.remove('hlmeds', x.log.id) }] }) : () => logMeds() })) }]),
              h('div.hl-chartcard', head, JC.hchart.chart({ kind: 'bars', data: dots, color: 'var(--hl-meds)', h: 120, ticks: [0, 1, 2], barW: 10, xLabels: [{ i: 0, text: U.fmtDate(HD.dayStart(today() - 13), 'md') }, { i: 13, text: 'Today' }], onScrub: (i) => { head.innerHTML = ''; if (i == null) head.append(h('div.hl-dh-k', 'LAST 14 DAYS'), valueNode(String(dots.reduce((a, d) => a + d.v, 0)), 'of 28 doses taken')); else head.append(h('div.hl-dh-k', 'DOSES TAKEN'), valueNode(String(dots[i].v), 'of 2'), h('div.hl-dh-d', dots[i].full)); } })),
              JC.ui.list([
                { header: 'Interactions', rows: [{ title: 'Alcohol', subtitle: 'Moderate · May increase side effects. Avoid while taking Tacrolimus.', icon: { glyph: 'exclamationmark.triangle.fill', bg: 'var(--orange)' } }, { title: 'Grapefruit', subtitle: 'Severe · Can raise Tacrolimus to unsafe levels.', icon: { glyph: 'exclamationmark.triangle.fill', bg: 'var(--red)' } }], footer: 'Medical ID note from A-Ling: “Do not give him alcohol. (He will not listen.)”' },
                { header: 'Details', rows: [{ title: 'Prescribed', detail: 'Since Sep 2008' }, { title: 'Prescriber', detail: 'Lotus Pier Hospital' }, { title: 'Reminders', toggle: { on: prefs().medRem !== false, onChange: (v) => setPrefs({ medRem: v }) } }, { title: 'Archive Medication', destructive: true, onTap: () => JC.ui.alert({ title: 'Can’t Archive', message: 'Tacrolimus keeps a transplanted liver from being rejected. It is taken for life.', buttons: [{ text: 'OK' }] }) }] },
                { header: 'Log History', rows: days.slice(0, 7).map((d) => { const ls = logs.filter((l) => l.day === d); return { title: d === today() ? 'Today' : U.fmtDate(HD.dayStart(d), 'long'), detail: ls.filter((l) => l.status === 'taken').length + ' of 2 taken' }; }) },
              ]),
            ];
          },
        });
      }

      // ── state of mind ─────────────────────────────────────────────
      function logMind() {
        const st = { kind: 'moment', valence: 0, feel: [], assoc: [] };
        let step = 0;
        const sh = JC.ui.sheet({
          title: 'State of Mind', detent: 'large', left: { text: 'Cancel' }, cls: 'hl-mindsheet',
          content: (s) => {
            const body = h('div.hl-mind');
            const next = (txt, fn) => h('div.hl-next', { onTap: fn }, txt);
            const go = (n) => { step = n; s.render(); };
            if (step === 0) {
              body.append(h('div.hl-mind-q', 'What would you like to log?'),
                h('div.hl-mind-opt', { onTap: () => { st.kind = 'moment'; go(1); } }, h('div.hl-mind-ot', 'Emotion'), h('div.hl-mind-os', 'How you feel right now')),
                h('div.hl-mind-opt', { onTap: () => { st.kind = 'day'; go(1); } }, h('div.hl-mind-ot', 'Mood'), h('div.hl-mind-os', 'How you’ve felt overall today')));
            } else if (step === 1) {
              const blob = h('div.hl-blob');
              const lab = h('div.hl-blob-l');
              const paint = () => { blob.style.setProperty('--c', VAL_C[st.valence]); blob.style.setProperty('--s', String(0.8 + Math.abs(st.valence) * 0.08)); lab.textContent = VAL[st.valence]; };
              const sl = JC.ui.slider({ value: st.valence, min: -3, max: 3, step: 1, onInput: (v) => { st.valence = v; paint(); } });
              paint();
              body.append(h('div.hl-mind-q', st.kind === 'moment' ? 'Choose how you’re feeling right now' : 'Choose how you’ve felt overall today'), blob, lab, h('div.hl-mind-sl', sl, h('div.hl-mind-ends', h('span', 'VERY UNPLEASANT'), h('span', 'VERY PLEASANT'))), next('Next', () => go(2)));
            } else if (step === 2) {
              const pool = st.valence < 0 ? FEEL.neg : st.valence > 0 ? FEEL.pos : FEEL.mid;
              body.append(h('div.hl-mind-q', 'What best describes this feeling?'), h('div.hl-chips', pool.map((f) => h('div.hl-chip', { class: { on: st.feel.includes(f) }, onTap: (e) => { const i = st.feel.indexOf(f); if (i >= 0) st.feel.splice(i, 1); else st.feel.push(f); e.currentTarget.classList.toggle('on'); } }, f))), next('Next', () => { if (!st.feel.length) { JC.ui.toast('Choose at least one', { icon: 'info.circle' }); return; } go(3); }));
            } else {
              body.append(h('div.hl-mind-q', 'What’s having the biggest impact on you?'), h('div.hl-chips', ASSOC.map((f) => h('div.hl-chip', { class: { on: st.assoc.includes(f) }, onTap: (e) => { const i = st.assoc.indexOf(f); if (i >= 0) st.assoc.splice(i, 1); else st.assoc.push(f); e.currentTarget.classList.toggle('on'); } }, f))), next('Done', () => {
                JC.store.add('hlmind', { t: now(), kind: st.kind, valence: st.valence, feel: st.feel.slice(), assoc: st.assoc.slice() });
                try { JC.story.act('mood_log', { valence: st.valence, feel: st.feel.slice() }); } catch (e) { /* ignore */ }
                sh.close();
                JC.ui.toast('Logged: ' + st.feel.join(', '), { icon: 'checkmark.circle.fill' });
              }));
            }
            return [body];
          },
        });
      }
      function mindPage() {
        let range = 'M';
        const page = JC.ui.page({
          title: 'State of Mind', bg: 'grouped', tint: 'var(--hl-mind)', refreshOnShow: true,
          right: [JC.ui.navBtn({ text: 'Log', onTap: () => logMind() })],
          content: () => {
            const logs = JC.store.all('hlmind').slice().sort((a, b) => a.t - b.t);
            const n = range === 'W' ? 7 : 30;
            const data = [];
            for (let k = n - 1; k >= 0; k--) {
              const d = today() - k;
              const ls = logs.filter((x) => HD.dayIdx(x.t) === d);
              data.push({ vs: ls.map((x) => ({ v: x.valence, color: VAL_C[x.valence] })), full: U.fmtDate(HD.dayStart(d), 'md') + ' · ' + (ls.length ? ls.map((x) => x.feel.join(', ')).join(' / ') : 'No logs') });
            }
            const head = h('div.hl-dh', h('div.hl-dh-k', 'LOGS'), valueNode(String(data.reduce((a, x) => a + x.vs.length, 0)), 'this ' + (range === 'W' ? 'week' : 'month')));
            const counts = mindCounts();
            const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 8);
            const maxC = counts[top[0]] || 1;
            const assocC = {};
            logs.forEach((x) => (x.assoc || []).forEach((a) => { assocC[a] = (assocC[a] || 0) + 1; }));
            return [
              h('div.hl-seg', JC.ui.segmented({ items: ['W', 'M'], value: range === 'W' ? 0 : 1, onChange: (i) => { range = i ? 'M' : 'W'; page.render(); } })),
              h('div.hl-chartcard', head, JC.hchart.chart({ kind: 'dots', data, ticks: [-3, 0, 3], fmtY: (v) => (v === 3 ? 'Pleasant' : v === -3 ? 'Unpl.' : 'Neutral'), padR: 52, h: 190, xLabels: range === 'W' ? data.map((x, i) => ({ i, text: 'SMTWTFS'[new Date(HD.dayStart(today() - (n - 1 - i))).getDay()] })) : [{ i: 0, text: U.fmtDate(HD.dayStart(today() - 29), 'md') }, { i: 29, text: 'Today' }], onScrub: (i) => { head.innerHTML = ''; if (i == null) head.append(h('div.hl-dh-k', 'LOGS'), valueNode(String(data.reduce((a, x) => a + x.vs.length, 0)), 'this ' + (range === 'W' ? 'week' : 'month'))); else head.append(h('div.hl-dh-k', 'LOGS'), valueNode(String(data[i].vs.length), data[i].vs.length === 1 ? 'log' : 'logs'), h('div.hl-dh-d', data[i].full)); } }),
                h('div.hl-legend', [-3, -1, 0, 1, 3].map((v) => h('span', h('i.round', { style: { background: VAL_C[v] } }), VAL[v])))),
              JC.ui.list([{ header: 'Most Logged Feelings', rows: top.map((f) => ({ title: f, right: h('div.hl-cbar', h('i', { style: { width: Math.round((counts[f] / maxC) * 100) + '%' } }), h('span', String(counts[f]))) })), footer: 'Annoyed has been logged ' + (counts.Annoyed || 0) + ' times. That is more than every other feeling combined, almost.' },
                { header: 'Associations', rows: Object.keys(assocC).sort((a, b) => assocC[b] - assocC[a]).map((a) => ({ title: a, detail: String(assocC[a]) })) },
                { header: 'Log History', rows: logs.slice().reverse().map((x) => ({ leading: h('i.hl-vdot', { style: { background: VAL_C[x.valence] } }), title: x.feel.join(', '), subtitle: VAL[x.valence] + ' · ' + (x.kind === 'day' ? 'Daily Mood' : 'Momentary Emotion') + (x.assoc && x.assoc.length ? ' · ' + x.assoc.join(', ') : ''), detail: U.fmtRelative(x.t), swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => JC.store.remove('hlmind', x.id) }] })) }]),
            ];
          },
        });
        return page;
      }

      // ── all data / categories / browse ────────────────────────────
      function latestLabel(id) {
        const t = now();
        if (id === 'sleep') { const s = HD.series('sleep', 'W', t).buckets.filter((b) => b.v); return s.length ? fmtSleep(s[s.length - 1].v) : '—'; }
        const v = HD.dayValue(id, today(), t);
        if (id === 'heart') return v ? v.lo + '–' + v.hi + ' BPM' : '—';
        if (M[id].static) return M[id].static + ' ' + M[id].unit;
        return fmtNum(id, v) + ' ' + M[id].unit;
      }
      function metricRows(ids) { return ids.map((id) => ({ title: M[id].name, subtitle: latestLabel(id), leading: catIcon(M[id].cat, 19), chevron: true, onTap: () => (M[id].static ? JC.ui.alert({ title: M[id].name, message: M[id].static + ' ' + M[id].unit + ' · Entered by Jiang Cheng', buttons: [{ text: 'OK' }] }) : openMetric(id)) })); }
      function allDataPage() {
        return JC.ui.page({ title: 'All Health Data', bg: 'grouped', tint, content: () => {
          const byCat = {};
          Object.keys(M).forEach((id) => { (byCat[M[id].cat] = byCat[M[id].cat] || []).push(id); });
          return [JC.ui.list(Object.keys(byCat).map((c) => ({ header: HD.CATS[c].name, rows: metricRows(byCat[c]) })).concat([{ header: 'Other', rows: [{ title: 'Workouts', leading: catIcon('activity', 19), subtitle: '6.2 km · Outdoor Run', chevron: true, onTap: () => push(workoutsPage()) }, { title: 'Medications', leading: catIcon('meds', 19), subtitle: 'Tacrolimus 2 mg', chevron: true, onTap: () => push(medsPage()) }, { title: 'State of Mind', leading: catIcon('mind', 19), subtitle: 'Annoyed', chevron: true, onTap: () => push(mindPage()) }] }]))];
        } });
      }
      function categoryPage(c) {
        const cat = HD.CATS[c];
        return JC.ui.page({ title: cat.name, bg: 'grouped', tint: cat.color, content: () => {
          const ids = Object.keys(M).filter((id) => M[id].cat === c);
          const extra = c === 'activity' ? [{ title: 'Workouts', leading: catIcon('activity', 19), subtitle: '6 this week', chevron: true, onTap: () => push(workoutsPage()) }] : c === 'meds' ? [{ title: 'Tacrolimus', leading: catIcon('meds', 19), subtitle: '2 mg · twice daily', chevron: true, onTap: () => push(medsPage()) }] : c === 'mind' ? [{ title: 'State of Mind', leading: catIcon('mind', 19), subtitle: 'Annoyed', chevron: true, onTap: () => push(mindPage()) }] : [];
          const rows = metricRows(ids).concat(extra);
          if (!rows.length) return [JC.ui.empty({ icon: cat.icon, title: 'No Data', text: c === 'cycle' ? 'Cycle Tracking isn’t set up.' : 'Nothing has been recorded in ' + cat.name + '.' })];
          return [JC.ui.list([{ rows }])];
        } });
      }
      const RECORDS = {
        Conditions: [['Status post liver transplantation', 'Since September 2008 · Lotus Pier Hospital'], ['Immunosuppressed state', 'On Tacrolimus']],
        'Lab Results': [['Tacrolimus trough', '6.8 ng/mL · target 5–8 · Sep 2, 2026'], ['ALT', '26 U/L · normal'], ['AST', '24 U/L · normal'], ['Total bilirubin', '0.8 mg/dL · normal'], ['Creatinine', '0.94 mg/dL · normal']],
        Medications: [['Tacrolimus 2 mg capsule', 'Twice daily · since 2008']],
        Procedures: [['Liver transplantation, living donor (right lobe)', 'Sep 13, 2008 · Surgeon: Dr. Wen Qing · Donor: anonymous'], ['Annual transplant review', 'Sep 2, 2026']],
        Immunizations: [['Influenza', 'Oct 3, 2025'], ['Hepatitis B (series)', '2008'], ['Tetanus booster', '2021']],
        Allergies: [['No known drug allergies', 'Recorded Sep 2, 2026']],
      };
      function recordsPage(k) {
        return JC.ui.page({ title: k, bg: 'grouped', tint, content: () => [JC.ui.list([{ header: 'Lotus Pier Hospital', rows: RECORDS[k].map(([t, s]) => ({ title: t, subtitle: s, onTap: () => JC.ui.alert({ title: t, message: s + '\n\nSource: Lotus Pier Hospital, Yunmeng.', buttons: [{ text: 'OK' }] }) })) }])] });
      }
      let browseQ = '';
      function browsePage() {
        const page = JC.ui.page({
          title: 'Search', large: true, bg: 'grouped', tint,
          search: { placeholder: 'Search', onInput: (q) => { browseQ = q.trim().toLowerCase(); page.render(); } },
          content: () => {
            if (browseQ) {
              const ids = Object.keys(M).filter((id) => (M[id].name + ' ' + HD.CATS[M[id].cat].name).toLowerCase().includes(browseQ));
              const extra = [['Workouts', () => push(workoutsPage())], ['Medications', () => push(medsPage())], ['State of Mind', () => push(mindPage())], ['Medical ID', () => push(medicalPage())]].filter(([t]) => t.toLowerCase().includes(browseQ));
              if (!ids.length && !extra.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Try another search.' })];
              return [JC.ui.list([{ rows: metricRows(ids).concat(extra.map(([t, fn]) => ({ title: t, chevron: true, onTap: fn }))) }])];
            }
            return [JC.ui.list([
              { header: 'Health Categories', rows: Object.keys(HD.CATS).map((c) => ({ title: HD.CATS[c].name, leading: catIcon(c, 21), chevron: true, onTap: () => push(categoryPage(c)) })) },
              { header: 'Health Records', rows: Object.keys(RECORDS).map((k) => ({ title: k, leading: h('span.hl-cic', { style: { color: 'var(--blue)' } }, JC.icon('cross.case.fill', { size: 19 })), chevron: true, onTap: () => push(recordsPage(k)) })), footer: 'Records from Lotus Pier Hospital, Yunmeng. Last updated Sep 2, 2026.' },
              { rows: [{ title: 'Medical ID', leading: h('span.hl-cic', { style: { color: 'var(--red)' } }, JC.icon('staroflife.fill', { size: 19 })), chevron: true, onTap: () => push(medicalPage()) }] },
            ])];
          },
        });
        return page;
      }

      // ── profile / Medical ID / checklist ──────────────────────────
      function profileSheet() {
        const sh = JC.ui.sheet({
          title: '', detent: 'large', right: { text: 'Done' },
          content: () => [h('div.hl-prof', JC.ui.avatar('me', 84), h('div.hl-prof-n', 'Jiang Cheng')), JC.ui.list([
            { rows: [{ title: 'Health Details', chevron: true, onTap: () => { sh.close(); push(detailsPage()); } }, { title: 'Medical ID', chevron: true, onTap: () => { sh.close(); push(medicalPage()); } }] },
            { header: 'Features', rows: [{ title: 'Health Checklist', chevron: true, onTap: () => { sh.close(); push(checklistPage()); } }, { title: 'Notifications', chevron: true, onTap: () => { sh.close(); push(hrNotifPage()); } }] },
            { header: 'Privacy', rows: [{ title: 'Apps', chevron: true, onTap: () => { sh.close(); push(sourcesPage('steps')); } }, { title: 'Research Studies', chevron: true, onTap: () => JC.ui.alert({ title: 'Research Studies', message: 'You aren’t enrolled in any studies.', buttons: [{ text: 'OK' }] }) }, { title: 'Devices', chevron: true, onTap: () => { sh.close(); push(devicesPage()); } }] },
            { rows: [{ title: 'Export All Health Data', tinted: true, onTap: () => exportData() }] },
          ])],
        });
      }
      function exportData() {
        JC.ui.alert({ title: 'Export Health Data', message: 'This will create a file containing all of Jiang Cheng’s health and fitness data. It may take a few minutes.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Export', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          JC.ui.toast('Exporting…', { icon: 'square.and.arrow.up' });
          setTimeout(() => JC.ui.share({ title: 'export.zip', subtitle: 'Health Data · 1.2 GB', payload: { kind: 'text', text: 'export.zip (Health data, 1.2 GB)' } }), 1600);
        });
      }
      function detailsPage() {
        return JC.ui.page({ title: 'Health Details', bg: 'grouped', tint, content: () => [h('div.hl-prof', JC.ui.avatar('me', 76)), JC.ui.list([{ rows: [['First Name', 'Cheng'], ['Last Name', 'Jiang'], ['Date of Birth', '15 May 1992 (34)'], ['Sex', 'Male'], ['Blood Type', 'O+'], ['Fitzpatrick Skin Type', 'Type III'], ['Wheelchair', 'No'], ['Medications That Affect Heart Rate', 'None']].map(([t, d]) => ({ title: t, detail: d })) }, { rows: [{ title: 'Edit', tinted: true, onTap: () => JC.ui.alert({ title: 'Edit Health Details', message: 'Health Details are synced from Jiang Cheng’s Apple Watch and can only be changed by him.', buttons: [{ text: 'OK' }] }) }] }])] });
      }
      function devicesPage() {
        return JC.ui.page({ title: 'Devices', bg: 'grouped', tint, content: () => [JC.ui.list([{ rows: [{ title: 'Jiang Cheng’s Apple Watch', subtitle: 'Apple Watch Series 11 · last synced 23:46', icon: { glyph: 'clock', bg: 'var(--gray)' }, onTap: () => JC.ui.alert({ title: 'Jiang Cheng’s Apple Watch', message: 'watchOS 26.0 · Last synced a minute ago over iCloud. It is still on his wrist, and it is still counting his heartbeats.', buttons: [{ text: 'OK' }] }) }, { title: 'Jiang Cheng’s iPhone', subtitle: 'iPhone 17 Pro · this iPhone', icon: { glyph: 'iphone', bg: 'var(--gray)' } }] }])] });
      }
      function medicalPage() {
        const row = (k, v) => h('div.hl-mid-row', h('div.hl-mid-k', k), h('div.hl-mid-v', v));
        return JC.ui.page({
          title: 'Medical ID', bg: 'grouped', tint: 'var(--red)',
          right: [JC.ui.navBtn({ text: 'Edit', onTap: () => JC.ui.alert({ title: 'Edit Medical ID', message: 'Only Jiang Cheng can edit his Medical ID. It requires his Apple Account password.', buttons: [{ text: 'OK' }] }) })],
          content: () => {
            const aj = JC.contacts.get('ajie'), jl = JC.contacts.get('jl');
            return [
              h('div.hl-mid-head', JC.ui.avatar('me', 64), h('div', h('div.hl-mid-n', 'Jiang Cheng'), h('div.hl-mid-a', '15 May 1992 (34 years)'))),
              h('div.hl-mid-card', row('Medical Conditions', 'Liver transplant recipient (2008).'), row('Medical Notes', 'Immunosuppressed. Do not give him alcohol. (He will not listen.) — A-Ling'), row('Allergies & Reactions', 'None. (Wei Wuxian. — A-Ling)'), row('Medications', 'Tacrolimus 2 mg, twice daily.'), row('Blood Type', 'O+'), row('Organ Donor', 'Yes'), row('Height', '183 cm'), row('Weight', '72 kg')),
              JC.ui.list([{ header: 'Emergency Contacts', rows: [
                { title: aj ? aj.display : 'A-Jie 🪷', subtitle: 'sister', avatar: 'ajie', onTap: () => JC.ui.alert({ title: 'A-Jie', message: 'This number is no longer in service. Jiang Cheng never removed her.', buttons: [{ text: 'OK' }] }) },
                { title: jl ? jl.display : 'A-Ling', subtitle: 'nephew', avatar: 'jl', onTap: () => JC.os.open('contacts', { contact: 'jl' }) },
              ] },
              { rows: [{ title: 'Show When Locked', detail: 'On' }, { title: 'Share During Emergency Call', detail: 'On' }], footer: 'Your Medical ID can be viewed when iPhone is locked by tapping Emergency, then Medical ID.' }]),
            ];
          },
        });
      }
      function checklistPage() {
        return JC.ui.page({ title: 'Health Checklist', bg: 'grouped', tint, refreshOnShow: true, content: (pg) => {
          const ok = (t) => h('span.hl-ck', JC.icon('checkmark.circle.fill', { size: 20 }), t);
          const p = prefs();
          return [JC.ui.list([{ rows: [
            { title: 'Medical ID', subtitle: 'Shown when iPhone is locked', right: ok('Set Up'), onTap: () => push(medicalPage()) },
            { title: 'Emergency SOS', subtitle: 'Call with Hold and Release', right: ok('On'), onTap: () => JC.os.open('settings', { page: 'sos' }) },
            { title: 'Fall Detection', subtitle: 'Apple Watch', right: ok('On'), onTap: () => JC.ui.alert({ title: 'Fall Detection', message: 'Fall Detection is on for Jiang Cheng’s Apple Watch.', buttons: [{ text: 'OK' }] }) },
            { title: 'High Heart Rate Notifications', subtitle: 'Above ' + (p.hrThr || 120) + ' BPM', right: ok('On'), onTap: () => push(hrNotifPage()) },
            { title: 'Irregular Rhythm Notifications', subtitle: 'Apple Watch', right: p.irn ? ok('On') : h('span.hl-setup', 'Set Up'), onTap: () => { if (p.irn) return; JC.ui.alert({ title: 'Irregular Rhythm Notifications', message: 'Set up requires Jiang Cheng’s Apple Watch to be nearby. It isn’t.', buttons: [{ text: 'OK' }] }); } },
            { title: 'Walking Steadiness Notifications', subtitle: 'iPhone', right: p.wsn ? ok('On') : h('span.hl-setup', 'Set Up'), onTap: () => { setPrefs({ wsn: !p.wsn }); pg.render(); } },
          ] }])];
        } });
      }

      // ── sharing ───────────────────────────────────────────────────
      function sharingPage() {
        return JC.ui.page({
          title: 'Sharing', large: true, bg: 'grouped', tint, refreshOnShow: true,
          content: () => {
            const p = prefs();
            const out = [];
            if (p.share === 'pending') {
              out.push(h('div.hl-req',
                h('div.hl-req-top', JC.ui.avatar('jl', 46), h('div', h('div.hl-req-t', 'A-Ling would like to see your Health data'), h('div.hl-req-s', 'Requested Wednesday · “i want to see if u actually sleep”'))),
                h('div.hl-req-list', ['Heart Rate', 'Sleep', 'Steps', 'Medications'].map((t) => h('span.hl-req-chip', t))),
                h('div.hl-req-btns',
                  h('div.hl-req-btn.decline', { onTap: () => { setPrefs({ share: 'declined' }); try { JC.story.act('health_share', { to: 'jl', accept: false }); } catch (e) { /* ignore */ } JC.ui.toast('Request declined', { icon: 'xmark' }); } }, 'Decline'),
                  h('div.hl-req-btn.accept', { onTap: () => acceptShare() }, 'Accept'))));
            }
            if (p.share === 'accepted') {
              out.push(JC.ui.list([{ header: 'Sharing With', rows: [{ title: 'A-Ling', subtitle: (p.topics || []).map((t) => ({ heart: 'Heart Rate', sleep: 'Sleep', steps: 'Steps', meds: 'Medications', mind: 'State of Mind' }[t])).join(', '), avatar: 'jl', chevron: true, onTap: () => sharePerson() }], footer: 'A-Ling can see a summary of the data you chose. Only you can see your data in Health.' }]));
            }
            if (p.share === 'declined') out.push(JC.ui.list([{ rows: [{ title: 'You declined A-Ling’s request', subtitle: 'He can ask again. He will.', avatar: 'jl', onTap: () => JC.ui.actionSheet({ actions: [{ text: 'Share with A-Ling Instead', onTap: () => acceptShare() }] }) }] }]));
            out.push(h('div.hl-share-hero', h('div.hl-share-ic', JC.icon('person.2.fill', { size: 34 })), h('div.hl-share-t', 'Share Your Health Data'), h('div.hl-share-s', 'Keep friends and family up to date on how you’re doing by securely sharing your Health data.'), h('div.hl-next', { onTap: () => inviteSheet() }, 'Share with Someone')));
            out.push(JC.ui.list([{ header: 'Sharing With You', rows: [{ title: 'No one is sharing Health data with you.', subtitle: 'Invite someone to share — they’ll see a request in their Health app.' }] }, { rows: [{ title: 'Share with Your Doctor', tinted: true, onTap: () => JC.ui.alert({ title: 'Share with Your Doctor', message: 'Lotus Pier Hospital supports sharing. Jiang Cheng hasn’t connected it — his doctor already calls every month.', buttons: [{ text: 'OK' }] }) }] }]));
            if ((p.invites || []).length) out.push(JC.ui.list([{ header: 'Invitations Sent', rows: p.invites.map((c) => ({ title: JC.contacts.name(c), avatar: c, detail: 'Pending', swipe: [{ text: 'Cancel', color: 'var(--red)', onTap: () => setPrefs({ invites: prefs().invites.filter((x) => x !== c) }) }] })) }]));
            return out;
          },
        });
      }
      function acceptShare() {
        const sel = new Set(prefs().topics && prefs().topics.length ? prefs().topics : ['heart', 'sleep', 'steps', 'meds']);
        JC.ui.sheet({
          title: 'Share with A-Ling', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Share', onTap: () => { setPrefs({ share: 'accepted', topics: Array.from(sel) }); try { JC.story.act('health_share', { to: 'jl', accept: true, topics: Array.from(sel) }); } catch (e) { /* ignore */ } JC.audio.play('success'); JC.ui.toast('Sharing with A-Ling', { icon: 'person.2.fill' }); } },
          content: (s) => [h('div.hl-prof', JC.ui.avatar('jl', 64), h('div.hl-prof-n', 'A-Ling'), h('div.hl-req-s', 'Choose what A-Ling can see.')), JC.ui.list([{ header: 'Topics', rows: [['heart', 'Heart Rate', 'heart'], ['sleep', 'Sleep', 'sleep'], ['steps', 'Steps', 'activity'], ['meds', 'Medications', 'meds'], ['mind', 'State of Mind', 'mind']].map(([k, t, c]) => ({ title: t, leading: catIcon(c, 19), toggle: { on: sel.has(k), onChange: (v) => { if (v) sel.add(k); else sel.delete(k); } } })), footer: 'A-Ling will be able to see these topics and get notified about significant changes — like a heart rate of 121 BPM at 22:50.' }])],
        });
      }
      function sharePerson() {
        JC.ui.actionSheet({ title: 'Sharing with A-Ling', actions: [{ text: 'Change Topics', onTap: () => acceptShare() }, { text: 'Stop Sharing', style: 'destructive', onTap: () => { setPrefs({ share: 'declined' }); JC.ui.toast('Stopped sharing with A-Ling', { icon: 'xmark' }); } }] });
      }
      function inviteSheet() {
        const people = ['lxc', 'wwx', 'ea', 'sz', 'wn', 'huang', 'nhs'];
        const sh = JC.ui.sheet({ title: 'Share with Someone', detent: 'large', left: { text: 'Cancel' }, content: () => [JC.ui.list([{ header: 'Suggested', rows: people.map((c) => ({ title: JC.contacts.name(c), avatar: c, onTap: () => { sh.close(); const inv = prefs().invites || []; if (!inv.includes(c)) setPrefs({ invites: inv.concat(c) }); try { JC.story.act('health_share', { to: c, invite: true }); } catch (e) { /* ignore */ } JC.ui.toast('Invitation sent to ' + JC.contacts.short(c), { icon: 'paperplane.fill' }); } })) }])] });
      }

      // ── tabs ──────────────────────────────────────────────────────
      tabs = JC.ui.tabs(win.body, {
        tint,
        tabs: [
          { id: 'summary', title: 'Summary', icon: 'heart.fill', root: () => summaryPage() },
          { id: 'sharing', title: 'Sharing', icon: 'person.2.fill', root: () => sharingPage() },
        ],
        search: { id: 'browse', title: 'Search', icon: 'magnifyingglass', root: () => browsePage() },
        active: 'summary',
      });
      const refresh = () => ['summary', 'sharing', 'browse'].forEach((id) => { const n = tabs.nav(id); if (n && n.top()) n.top().render(); });
      ['store:hlprefs', 'store:hlmeds', 'store:hlmind', 'store:hldata'].forEach((ev) => offs.push(JC.bus.on(ev, refresh)));

      function handle(intent) {
        if (!intent) return;
        if (intent.tab) tabs.select(intent.tab === 'search' ? 'browse' : intent.tab);
        const pg = intent.page || intent.metric || intent.id;
        if (pg === 'medicalid') { tabs.select('summary'); push(medicalPage()); }
        else if (pg === 'meds' || pg === 'medications') { tabs.select('summary'); push(medsPage()); }
        else if (pg === 'mind') { tabs.select('summary'); push(mindPage()); }
        else if (pg === 'hr' || pg === 'highheart') { tabs.select('summary'); push(hrEventPage()); }
        else if (pg === 'sharing') tabs.select('sharing');
        else if (pg && M[pg]) { tabs.select('summary'); push(metricPage(pg, intent.range)); }
      }
      return {
        intent: handle,
        show() { refresh(); },
        destroy() { offs.forEach((f) => f()); },
      };
    },
  });
  // notification from the lock screen ('health' app) opens the High Heart Rate event
  JC.bus.on('boot', () => { /* nothing to pre-register */ });
})();
