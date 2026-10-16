/* Health — deterministic data for Jiang Cheng's Health app. Facts: docs/STORY.md
   (6.2 km run this morning, 121 BPM at 22:50, sleep averaging 4 h 52 m, Tacrolimus 2 mg twice daily). */
(function () {
  'use strict';
  const JC = window.JC;
  const DAY = 86400e3;
  const BASE = new Date(2026, 9, 16, 0, 0, 0, 0).getTime();
  function hash(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rnd(key) { let a = hash(key); return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const dayIdx = (ms) => Math.floor((ms - BASE) / DAY);
  const dayStart = (d) => BASE + d * DAY;
  const dow = (d) => new Date(dayStart(d)).getDay(); // 0 Sun
  const isRunDay = (d) => d === 0 || (dow(d) !== 0 && rnd('run' + d)() < 0.82);

  // ── metric catalog ────────────────────────────────────────────────
  const CATS = {
    activity: { name: 'Activity', icon: 'flame.fill', color: 'var(--hl-activity)' },
    body: { name: 'Body Measurements', icon: 'figure.wave', color: 'var(--hl-body)' },
    cycle: { name: 'Cycle Tracking', icon: 'circle.fill', color: 'var(--hl-cycle)' },
    hearing: { name: 'Hearing', icon: 'ear', color: 'var(--hl-hearing)' },
    heart: { name: 'Heart', icon: 'heart.fill', color: 'var(--hl-heart)' },
    meds: { name: 'Medications', icon: 'pills.fill', color: 'var(--hl-meds)' },
    mind: { name: 'Mental Wellbeing', icon: 'brain.head.profile', color: 'var(--hl-mind)' },
    mobility: { name: 'Mobility', icon: 'figure.walk', color: 'var(--hl-activity)' },
    nutrition: { name: 'Nutrition', icon: 'leaf.fill', color: 'var(--hl-nutrition)' },
    resp: { name: 'Respiratory', icon: 'lungs.fill', color: 'var(--hl-resp)' },
    sleep: { name: 'Sleep', icon: 'bed.double.fill', color: 'var(--hl-sleep)' },
    symptoms: { name: 'Symptoms', icon: 'list.bullet', color: 'var(--hl-symptoms)' },
    vitals: { name: 'Vitals', icon: 'waveform.path.ecg', color: 'var(--hl-heart)' },
  };
  const M = {
    steps: { name: 'Steps', cat: 'activity', unit: 'steps', agg: 'sum', fmt: 0, about: 'Step count is the number of steps you take throughout the day. Pedometers and digital activity trackers can help you determine your step count. These devices count steps for any activity that involves step-like movement, including walking, running, stair-climbing, cross-country skiing, and even movement as you go about your daily chores.' },
    distance: { name: 'Walking + Running Distance', short: 'Distance', cat: 'activity', unit: 'km', agg: 'sum', fmt: 1, about: 'This is an estimate of the distance you’ve walked or run. It’s based on the steps you’ve taken and your stride length.' },
    active: { name: 'Active Energy', cat: 'activity', unit: 'kcal', agg: 'sum', fmt: 0, about: 'Active energy is the energy you burn when you move. It does not include energy burned at rest.' },
    exercise: { name: 'Exercise Minutes', cat: 'activity', unit: 'min', agg: 'sum', fmt: 0, about: 'Every full minute of movement equal to or exceeding the intensity of a brisk walk counts toward your Exercise minutes.' },
    flights: { name: 'Flights Climbed', cat: 'activity', unit: 'floors', agg: 'sum', fmt: 0, about: 'A flight of stairs is counted as approximately 3 meters (10 feet) of elevation gain.' },
    heart: { name: 'Heart Rate', cat: 'heart', unit: 'BPM', agg: 'range', fmt: 0, about: 'Your heart beats approximately 100,000 times per day, accelerating and slowing through periods of rest and exertion. Your heart rate refers to how many times your heart beats per minute.' },
    resting: { name: 'Resting Heart Rate', cat: 'heart', unit: 'BPM', agg: 'avg', fmt: 0, about: 'Your resting heart rate is the average heartbeats per minute measured when you’ve been inactive for a while.' },
    walkhr: { name: 'Walking Heart Rate Average', cat: 'heart', unit: 'BPM', agg: 'avg', fmt: 0, about: 'The average heart rate while walking.' },
    hrv: { name: 'Heart Rate Variability', cat: 'heart', unit: 'ms', agg: 'avg', fmt: 0, about: 'Heart Rate Variability (HRV) is a measure of the variation in time between each heartbeat. Lower HRV can be a sign of stress.' },
    vo2: { name: 'Cardio Fitness', cat: 'heart', unit: 'VO₂ max', agg: 'avg', fmt: 1, about: 'Cardio fitness is a measure of your VO₂ max — the maximum amount of oxygen your body can consume during exercise.' },
    sleep: { name: 'Sleep', cat: 'sleep', unit: 'hr', agg: 'sleep', fmt: 0, about: 'Sleep provides insight into your sleep habits. Sleep trackers can help you determine the amount of time you are in bed and asleep, and the stages of your sleep: REM, Core and Deep.' },
    mindful: { name: 'Mindful Minutes', cat: 'mind', unit: 'min', agg: 'sum', fmt: 0, about: 'Mindfulness is the practice of focusing on the present moment. Regular practice may help reduce stress.' },
    weight: { name: 'Weight', cat: 'body', unit: 'kg', agg: 'avg', fmt: 1, about: 'Weight is the measurement of your body mass.' },
    height: { name: 'Height', cat: 'body', unit: 'cm', agg: 'avg', fmt: 0, static: 183, about: 'Height.' },
    resp: { name: 'Respiratory Rate', cat: 'resp', unit: 'breaths/min', agg: 'avg', fmt: 1, about: 'Respiratory rate is the number of times you breathe in a minute. It is measured while you sleep.' },
    oxygen: { name: 'Blood Oxygen', cat: 'resp', unit: '%', agg: 'avg', fmt: 0, about: 'Blood oxygen is a measure of how much oxygen your red blood cells are carrying.' },
    noise: { name: 'Environmental Sound Levels', cat: 'hearing', unit: 'dB', agg: 'avg', fmt: 0, about: 'Environmental sound levels are measured by Apple Watch. Prolonged exposure above 80 dB can affect hearing.' },
    caffeine: { name: 'Caffeine', cat: 'nutrition', unit: 'mg', agg: 'sum', fmt: 0, about: 'Caffeine is a stimulant found in coffee, tea and energy drinks.' },
    steadiness: { name: 'Walking Steadiness', cat: 'mobility', unit: '%', agg: 'avg', fmt: 0, about: 'Walking steadiness estimates your risk of falling.' },
  };
  Object.keys(M).forEach((k) => { M[k].id = k; });

  // scripted day: Fri 16 Oct (d = 0) and early Sat (d = 1)
  const STEPS0 = [0, 0, 0, 0, 0, 160, 420, 7420, 640, 360, 290, 420, 540, 230, 180, 310, 270, 430, 360, 640, 410, 380, 560, 150];
  const STEPS1 = [90, 60, 0, 0, 0, 0, 0, 220, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const HR0 = [[54, 61], [52, 58], [51, 57], [52, 59], [53, 60], [56, 88], [62, 104], [96, 171], [70, 112], [64, 92], [66, 94], [65, 90], [68, 96], [64, 88], [63, 86], [66, 92], [64, 90], [66, 95], [70, 98], [76, 102], [74, 96], [72, 98], [84, 121], [72, 98]];
  const HR1 = [[66, 88], [58, 70], [55, 64], [54, 62], [53, 61], [54, 63], [56, 74], [64, 96]];
  const DIST_PROFILE = [0, 0, 0, 0, 0, 0.02, 0.04, 0.55, 0.05, 0.03, 0.02, 0.03, 0.04, 0.02, 0.02, 0.03, 0.02, 0.03, 0.03, 0.04, 0.03, 0.03, 0.03, 0.01];

  function dailyRaw(metric, d) {
    const R = rnd(metric + ':' + d);
    const run = isRunDay(d);
    switch (metric) {
      case 'steps': return d === 0 ? STEPS0.reduce((a, b) => a + b, 0) : d === 1 ? STEPS1.reduce((a, b) => a + b, 0) : Math.round(run ? 10800 + R() * 3600 : 5200 + R() * 3400);
      case 'distance': return d === 0 ? 9.1 : Math.round(dailyRaw('steps', d) * 0.00068 * 10) / 10;
      case 'active': return Math.round(360 + dailyRaw('steps', d) * 0.031 + R() * 40);
      case 'exercise': return d === 0 ? 46 : d === 1 ? 2 : Math.round(run ? 36 + R() * 18 : 6 + R() * 14);
      case 'flights': return Math.round(3 + R() * 11);
      case 'resting': return d === 0 ? 59 : Math.round(55 + R() * 6);
      case 'walkhr': return Math.round(92 + R() * 9);
      case 'hrv': return d === 0 ? 29 : Math.round(32 + R() * 16);
      case 'vo2': return Math.round((45.6 + R() * 1.2 - (d < -200 ? 0.8 : 0)) * 10) / 10;
      case 'mindful': return 0;
      case 'weight': return Math.round((72 + (R() - 0.5) * 0.8) * 10) / 10;
      case 'height': return 183;
      case 'resp': return Math.round((14.2 + R() * 1.8) * 10) / 10;
      case 'oxygen': return Math.round(96 + R() * 3);
      case 'noise': return d === 0 ? 74 : Math.round(58 + R() * 10);
      case 'caffeine': return d === 0 ? 380 : Math.round(200 + R() * 260);
      case 'steadiness': return 100;
      default: return 0;
    }
  }
  const SLEEP7 = { '-6': 311, '-5': 243, '-4': 380, '-3': 271, '-2': 289, '-1': 238, '0': 312 };
  function sleepMin(d) { // minutes asleep in the night that ENDS on day d
    if (SLEEP7[d] != null) return SLEEP7[d];
    if (d === 1) return 0;
    const R = rnd('sleep:' + d);
    return Math.round(dow(d) === 0 || dow(d) === 6 ? 300 + R() * 90 : 225 + R() * 105);
  }
  // last night's stages (Thu 15 → Fri 16): minutes from 23:52
  const STAGES0 = [['awake', 0, 6], ['core', 6, 38], ['deep', 38, 64], ['core', 64, 98], ['rem', 98, 116], ['core', 116, 150], ['deep', 150, 172], ['core', 172, 204], ['awake', 204, 208], ['rem', 208, 236], ['core', 236, 268], ['rem', 268, 290], ['core', 290, 322], ['awake', 322, 328]];

  function manual(metric) { return JC.store.hasSeed('hldata') ? JC.store.all('hldata').filter((x) => x.metric === metric) : []; }

  /** hourly buckets for day d: [{t, label, v} | {t, lo, hi}] (future hours of today empty) */
  function hourly(metric, d, nowMs) {
    const cur = dayIdx(nowMs);
    const lastHour = d < cur ? 23 : d > cur ? -1 : new Date(nowMs).getHours();
    const out = [];
    const R = rnd('h:' + metric + ':' + d);
    const total = dailyRaw(metric, d);
    for (let hr = 0; hr < 24; hr++) {
      const t = dayStart(d) + hr * 3600e3;
      if (hr > lastHour) { out.push({ t }); continue; }
      let b = { t };
      if (metric === 'heart') {
        const src = d === 0 ? HR0 : d === 1 ? HR1 : null;
        const pr = src && src[hr] ? src[hr] : (() => { const sleepH = hr < 6; const lo = sleepH ? 52 + R() * 5 : 62 + R() * 8; const hi = sleepH ? lo + 4 + R() * 6 : lo + 18 + R() * 16 + (hr === 6 && isRunDay(d) ? 60 : 0); return [Math.round(lo), Math.round(hi)]; })();
        b.lo = pr[0]; b.hi = pr[1];
      } else if (metric === 'steps') {
        b.v = d === 0 ? STEPS0[hr] : d === 1 ? STEPS1[hr] : Math.round(total * (DIST_PROFILE[hr] * (0.7 + R() * 0.6)));
      } else if (['distance', 'active', 'exercise', 'flights', 'caffeine'].includes(metric)) {
        const prof = metric === 'caffeine' ? [0, 0, 0, 0, 0, 0, 0.3, 0.1, 0.2, 0, 0, 0, 0.1, 0, 0.2, 0, 0, 0, 0, 0, 0, 0.1, 0, 0][hr] : (metric === 'exercise' && d === 0 ? (hr === 7 ? 0.82 : hr === 5 ? 0.1 : 0.0) : DIST_PROFILE[hr]);
        const v = total * prof;
        b.v = metric === 'distance' ? Math.round(v * 100) / 100 : Math.round(v);
      } else if (metric === 'mindful') b.v = 0;
      else if (metric === 'noise') b.v = hr >= 19 && hr <= 22 && d === 0 ? 76 + Math.round(R() * 8) : hr < 6 ? null : Math.round(48 + R() * 16);
      else b.v = hr % 4 === 1 ? total : null; // sparse readings
      out.push(b);
    }
    manual(metric).forEach((m) => {
      if (dayIdx(m.t) !== d) return;
      const b = out[new Date(m.t).getHours()];
      if (!b) return;
      if (metric === 'heart') { b.lo = b.lo == null ? m.v : Math.min(b.lo, m.v); b.hi = b.hi == null ? m.v : Math.max(b.hi, m.v); }
      else if (M[metric].agg === 'sum') b.v = (b.v || 0) + m.v;
      else b.v = m.v;
    });
    return out;
  }
  function dayValue(metric, d, nowMs) {
    const cur = dayIdx(nowMs);
    if (d > cur) return null;
    const m = M[metric];
    if (metric === 'sleep') return d === cur + 1 ? null : sleepMin(d) + manual('sleep').filter((x) => dayIdx(x.t) === d).reduce((a, x) => a + x.v, 0);
    if (d === cur || manual(metric).some((x) => dayIdx(x.t) === d)) {
      const hs = hourly(metric, d, nowMs);
      if (metric === 'heart') { const r = hs.filter((x) => x.hi != null); return r.length ? { lo: Math.min(...r.map((x) => x.lo)), hi: Math.max(...r.map((x) => x.hi)) } : null; }
      const vs = hs.filter((x) => x.v != null).map((x) => x.v);
      if (!vs.length) return m.agg === 'sum' ? 0 : null;
      return m.agg === 'sum' ? vs.reduce((a, b) => a + b, 0) : vs.reduce((a, b) => a + b, 0) / vs.length;
    }
    if (metric === 'heart') { const R = rnd('hr:' + d); return { lo: Math.round(49 + R() * 6), hi: Math.round(isRunDay(d) ? 158 + R() * 14 : 104 + R() * 22) }; }
    return dailyRaw(metric, d);
  }

  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYL = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  /** series(metric, range, now) → { buckets:[{t, v|lo,hi, label, full}], xLabels:[{i,text}], unitLabel } */
  function series(metric, range, nowMs) {
    const cur = dayIdx(nowMs);
    const fmtH = (h) => (JC.util.fmtTime(new Date(2026, 0, 1, h)).replace(':00', ''));
    if (range === 'D') {
      if (metric === 'sleep') return sleepNight(cur, nowMs);
      const hs = hourly(metric, cur, nowMs).map((b, i) => Object.assign(b, { full: (i === 0 ? '12 AM' : fmtH(i)) + '–' + fmtH((i + 1) % 24) }));
      return { buckets: hs, xLabels: [0, 6, 12, 18].map((i) => ({ i, text: i === 0 ? '12 AM' : i === 12 ? '12 PM' : fmtH(i).replace(/ [AP]M/, '') })) };
    }
    if (range === 'W' || range === 'M') {
      const n = range === 'W' ? 7 : 30;
      const buckets = [];
      for (let k = n - 1; k >= 0; k--) {
        const d = cur - k;
        const v = dayValue(metric, d, nowMs);
        const date = new Date(dayStart(d));
        const b = { t: dayStart(d), full: JC.util.fmtDate(date, 'md') + (d === cur ? ' (Today)' : '') };
        if (v && typeof v === 'object') Object.assign(b, v); else b.v = v;
        buckets.push(b);
      }
      const xLabels = range === 'W' ? buckets.map((b, i) => ({ i, text: DAYL[new Date(b.t).getDay()] })) : buckets.map((b, i) => ({ i, text: new Date(b.t).getDay() === 0 ? String(new Date(b.t).getDate()) : null })).filter((x) => x.text);
      return { buckets, xLabels };
    }
    if (range === '6M') {
      const buckets = [];
      for (let w = 25; w >= 0; w--) {
        const days = [];
        for (let k = 6; k >= 0; k--) days.push(cur - w * 7 - k);
        buckets.push(aggDays(metric, days, nowMs, JC.util.fmtDate(dayStart(days[0]), 'md') + '–' + JC.util.fmtDate(dayStart(days[6]), 'md')));
      }
      const xLabels = [];
      let lastMon = -1;
      buckets.forEach((b, i) => { const mo = new Date(b.t).getMonth(); if (mo !== lastMon) { if (lastMon !== -1) xLabels.push({ i, text: MON[mo] }); lastMon = mo; } });
      return { buckets, xLabels };
    }
    // Y: 12 calendar months ending this month
    const now = new Date(nowMs);
    const buckets = [];
    for (let k = 11; k >= 0; k--) {
      const m0 = new Date(now.getFullYear(), now.getMonth() - k, 1);
      const m1 = new Date(now.getFullYear(), now.getMonth() - k + 1, 1);
      const days = [];
      for (let t = m0.getTime(); t < m1.getTime() && dayIdx(t) <= cur; t += DAY) days.push(dayIdx(t + 3600e3));
      buckets.push(aggDays(metric, days, nowMs, MON[m0.getMonth()] + ' ' + m0.getFullYear()));
    }
    return { buckets, xLabels: buckets.map((b, i) => ({ i, text: MON[new Date(b.t).getMonth()][0] })) };
  }
  function aggDays(metric, days, nowMs, full) {
    const vals = days.map((d) => dayValue(metric, d, nowMs)).filter((v) => v != null);
    const b = { t: dayStart(days[0]), full };
    if (!vals.length) return b;
    if (metric === 'heart') { b.lo = Math.min(...vals.map((v) => v.lo)); b.hi = Math.max(...vals.map((v) => v.hi)); return b; }
    b.v = vals.reduce((a, v) => a + v, 0) / vals.length;
    return b;
  }
  function sleepNight(cur, nowMs) {
    const t0 = dayStart(cur) - 8 * 60e3; // 23:52 previous evening
    const segs = cur === 0 ? STAGES0 : null;
    if (!segs) {
      const mins = sleepMin(cur);
      if (!mins) return { stages: [], t0, t1: t0 + 6 * 3600e3, asleep: 0, inBed: 0 };
      const R = rnd('st:' + cur);
      const out = [];
      let m = 0;
      const pat = ['awake', 'core', 'deep', 'core', 'rem', 'core', 'deep', 'core', 'rem', 'core', 'awake', 'rem', 'core'];
      pat.forEach((s, i) => { const len = s === 'awake' ? 4 + R() * 6 : (mins / 10) * (0.6 + R() * 0.8); out.push([s, m, m + len]); m += len; });
      return toStages(out, t0);
    }
    return toStages(segs, t0);
  }
  function toStages(segs, t0) {
    const stages = segs.map(([stage, a, b]) => ({ stage, s: t0 + a * 60e3, e: t0 + b * 60e3 }));
    const asleep = stages.filter((x) => x.stage !== 'awake').reduce((a, x) => a + (x.e - x.s), 0) / 60e3;
    const inBed = (stages[stages.length - 1].e - stages[0].s) / 60e3;
    const by = {};
    stages.forEach((x) => { by[x.stage] = (by[x.stage] || 0) + (x.e - x.s) / 60e3; });
    return { stages, t0: stages[0].s, t1: stages[stages.length - 1].e, asleep, inBed, by };
  }

  // ── seeds (persist edits) ─────────────────────────────────────────
  JC.store.seed('hldata', []);
  // wwxShare: since July 2024 (after Guanyin Temple) he has shared Medications — only that — with Wei Wuxian.
  // Neither of them has ever mentioned it. Wei Wuxian checks it every night at 8:05.
  JC.store.seed('hlprefs', [{ id: 'p', pins: ['steps', 'workouts', 'heart', 'sleep', 'mindful', 'meds', 'mind'], share: 'pending', topics: ['heart', 'sleep', 'steps', 'meds'], invites: [], wwxShare: true }]);
  const medSeed = [];
  for (let d = -13; d <= 0; d++) {
    ['08:00', '20:00'].forEach((slot, k) => {
      if (d === 0 && k === 1) return; // tonight's dose: not logged (the gala)
      const R = rnd('med' + d + slot);
      const late = Math.round(R() * 9);
      medSeed.push({ id: 'med_' + d + '_' + k, med: 'tacrolimus', slot, day: d, status: d === -9 && k === 1 ? 'taken' : 'taken', t: dayStart(d) + (k ? 20 : 8) * 3600e3 + late * 60e3 + (d === -9 && k === 1 ? 95 * 60e3 : 0) });
    });
  }
  JC.store.seed('hlmeds', medSeed);
  const mindSeed = [
    ['-13 07:58', 'moment', -1, ['Annoyed'], ['Work']], ['-12 23:40', 'moment', -2, ['Annoyed', 'Frustrated'], ['Family']], ['-11 06:10', 'moment', 0, ['Calm'], ['Fitness']],
    ['-10 13:22', 'moment', -1, ['Annoyed'], ['Work']], ['-9 21:05', 'moment', -2, ['Stressed', 'Annoyed'], ['Work']], ['-8 18:30', 'day', -1, ['Annoyed', 'Overwhelmed'], ['Family', 'Work']],
    ['-7 22:11', 'moment', -1, ['Annoyed'], ['Family']], ['-5 10:47', 'moment', -2, ['Irritated', 'Annoyed'], ['Work']], ['-3 08:15', 'moment', -1, ['Annoyed'], ['Tasks']],
    ['-2 22:58', 'moment', 1, ['Hopeful', 'Confused'], ['Friends']], ['-1 16:20', 'moment', -1, ['Annoyed', 'Worried'], ['Family']], ['+0 22:52', 'moment', -1, ['Annoyed', 'Confused', 'Hopeful'], ['Friends']],
  ].map(([t, kind, valence, feel, assoc], i) => ({ id: 'mind_' + i, t, kind, valence, feel, assoc }));
  JC.store.seed('hlmind', mindSeed);
  // older logs, summarised (so totals add up: Annoyed × 47)
  JC.store.seed('hlmindsum', [{ id: 'sum', counts: { Annoyed: 37, Stressed: 19, Frustrated: 15, Irritated: 9, Overwhelmed: 7, Worried: 6, Content: 5, Calm: 3, Hopeful: 1, Grateful: 1, Disappointed: 4 } }]);

  JC.healthData = { M, CATS, DAY, BASE, dayIdx, dayStart, series, hourly, dayValue, sleepMin, sleepNight, hash, rnd };
})();
