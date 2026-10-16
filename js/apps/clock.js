/* Clock — iOS 26: World Clock (DST-aware, from the in-game time), Alarms (fire full-screen with Snooze/Stop and a
   looping tone when the in-game time reaches them), Stopwatch (digital/analog, laps), Timers (multiple, recents,
   Dynamic Island countdown, sound at zero). */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;

  // ── time zones ─────────────────────────────────────────────────────────────
  // rule: 'cn' fixed, 'eu' (last Sun Mar → last Sun Oct, 01:00 UTC), 'us' (2nd Sun Mar → 1st Sun Nov, 02:00 local),
  // 'au' (1st Sun Oct → 1st Sun Apr, southern), 'nz' (last Sun Sep → 1st Sun Apr), null = no DST
  const CITIES = [
    ['Lanling', 'China', 8, null], ['Yunmeng', 'China', 8, null], ['Gusu', 'China', 8, null], ['Qinghe', 'China', 8, null], ['Yiling', 'China', 8, null],
    ['Beijing', 'China', 8, null], ['Shanghai', 'China', 8, null], ['Hong Kong', 'China', 8, null], ['Taipei', 'Taiwan', 8, null], ['Singapore', 'Singapore', 8, null],
    ['Tokyo', 'Japan', 9, null], ['Seoul', 'South Korea', 9, null], ['Bangkok', 'Thailand', 7, null], ['Hanoi', 'Vietnam', 7, null], ['Kathmandu', 'Nepal', 5.75, null],
    ['Mumbai', 'India', 5.5, null], ['Dubai', 'United Arab Emirates', 4, null], ['Moscow', 'Russia', 3, null], ['Istanbul', 'Türkiye', 3, null], ['Cairo', 'Egypt', 2, null],
    ['Athens', 'Greece', 2, 'eu'], ['Berlin', 'Germany', 1, 'eu'], ['Paris', 'France', 1, 'eu'], ['Rome', 'Italy', 1, 'eu'], ['Madrid', 'Spain', 1, 'eu'], ['Amsterdam', 'Netherlands', 1, 'eu'],
    ['London', 'United Kingdom', 0, 'eu'], ['Dublin', 'Ireland', 0, 'eu'], ['Reykjavík', 'Iceland', 0, null], ['São Paulo', 'Brazil', -3, null], ['New York', 'United States', -5, 'us'],
    ['Toronto', 'Canada', -5, 'us'], ['Chicago', 'United States', -6, 'us'], ['Denver', 'United States', -7, 'us'], ['Los Angeles', 'United States', -8, 'us'], ['San Francisco', 'United States', -8, 'us'],
    ['Vancouver', 'Canada', -8, 'us'], ['Honolulu', 'United States', -10, null], ['Anchorage', 'United States', -9, 'us'], ['Sydney', 'Australia', 10, 'au'], ['Melbourne', 'Australia', 10, 'au'],
    ['Auckland', 'New Zealand', 12, 'nz'], ['Jakarta', 'Indonesia', 7, null], ['Manila', 'Philippines', 8, null], ['Kuala Lumpur', 'Malaysia', 8, null], ['Cupertino', 'United States', -8, 'us'],
  ];
  const cityInfo = (name) => CITIES.find((c) => c[0] === name) || [name, '', 8, null];
  function nthSunday(y, m, n) { const d = new Date(Date.UTC(y, m, 1)); const first = (7 - d.getUTCDay()) % 7; return Date.UTC(y, m, 1 + first + (n - 1) * 7); }
  function lastSunday(y, m) { const d = new Date(Date.UTC(y, m + 1, 0)); return Date.UTC(y, m, d.getUTCDate() - d.getUTCDay()); }
  function offsetFor(name, utc) {
    const [, , base, rule] = cityInfo(name);
    const y = new Date(utc).getUTCFullYear();
    let dst = false;
    if (rule === 'eu') dst = utc >= lastSunday(y, 2) + 3600e3 && utc < lastSunday(y, 9) + 3600e3;
    else if (rule === 'us') { const s = nthSunday(y, 2, 2) + (2 - base) * 3600e3; const e = nthSunday(y, 10, 1) + (2 - base - 1) * 3600e3; dst = utc >= s && utc < e; }
    else if (rule === 'au') { const e = nthSunday(y, 3, 1) + (3 - base - 1) * 3600e3; const s = nthSunday(y, 9, 1) + (2 - base) * 3600e3; dst = utc < e || utc >= s; }
    else if (rule === 'nz') { const e = nthSunday(y, 3, 1) + (3 - base - 1) * 3600e3; const s = lastSunday(y, 8) + (2 - base) * 3600e3; dst = utc < e || utc >= s; }
    return base + (dst ? 1 : 0);
  }
  /** UTC ms of the in-game "now" (the phone's local time is Lanling, UTC+8) */
  function utcNow() { const d = JC.time.date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()) - 8 * 3600e3; }
  function cityTime(name) { const u = utcNow(); const off = offsetFor(name, u); return { d: new Date(u + off * 3600e3), off }; }

  // ── data ───────────────────────────────────────────────────────────────────
  JC.store.seed('worldclocks', [{ id: 'wc_lanling', city: 'Lanling' }, { id: 'wc_yunmeng', city: 'Yunmeng' }, { id: 'wc_london', city: 'London' }, { id: 'wc_ny', city: 'New York' }, { id: 'wc_van', city: 'Vancouver' }]);
  JC.store.seed('alarms', [
    { id: 'al_run', h: 5, m: 45, label: 'Run', repeat: [0, 1, 2, 3, 4, 5, 6], on: true, sound: 'Radar', snooze: true },
    { id: 'al_wd', h: 6, m: 30, label: 'Alarm', repeat: [1, 2, 3, 4, 5], on: true, sound: 'Radar', snooze: true },
    { id: 'al_tac_am', h: 8, m: 0, label: 'Tacrolimus', repeat: [0, 1, 2, 3, 4, 5, 6], on: true, sound: 'Chimes', snooze: true },
    { id: 'al_tac_pm', h: 20, m: 0, label: 'Tacrolimus', repeat: [0, 1, 2, 3, 4, 5, 6], on: true, sound: 'Chimes', snooze: true },
    { id: 'al_gala', h: 22, m: 45, label: 'Leave. (Gala.)', repeat: [], on: false, sound: 'Radar', snooze: false },
  ]);
  const SOUNDS = ['Radar', 'Apex', 'Beacon', 'Bulletin', 'Chimes', 'Circuit', 'Constellation', 'Cosmic', 'Crystals', 'Hillside', 'Illuminate', 'Night Owl', 'Opening', 'Playtime', 'Presto', 'Radiate', 'Reflection', 'Ripples', 'Sencha', 'Signal', 'Silk', 'Slow Rise', 'Stargaze', 'Summit', 'Twinkle', 'Uplift', 'Waves'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function repeatText(rep) {
    if (!rep || !rep.length) return '';
    const s = rep.slice().sort();
    if (s.length === 7) return 'every day';
    if (s.join() === '1,2,3,4,5') return 'weekdays';
    if (s.join() === '0,6') return 'weekends';
    return s.map((d) => DAYS[d].slice(0, 3)).join(' ');
  }
  const fmt12 = (hh, mm) => ({ t: (hh % 12 || 12) + ':' + String(mm).padStart(2, '0'), ap: hh >= 12 ? 'PM' : 'AM' });

  // ── tones (synthesized) ────────────────────────────────────────────────────
  function tone(name) {
    let stopped = false;
    const ctx = (() => { try { return JC.audio.ctx(); } catch (e) { return null; } })();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    const P = {
      Radar: { every: 1100, notes: [[0, 1568, 0.07], [0.14, 1568, 0.07], [0.28, 1568, 0.07], [0.42, 1568, 0.07]], beep: true },
      Apex: { every: 1600, notes: [[0, 784, 0.4], [0.18, 1047, 0.4], [0.36, 1319, 0.5], [0.54, 1568, 0.6]] },
      Beacon: { every: 1400, notes: [[0, 1175, 0.6], [0.3, 1568, 0.8]] },
      Chimes: { every: 2200, notes: [[0, 1319, 0.6], [0.25, 1175, 0.6], [0.5, 988, 0.6], [0.75, 784, 1.2]] },
      'Night Owl': { every: 1800, notes: [[0, 659, 0.6], [0.4, 523, 0.9]] },
      Ripples: { every: 1500, notes: [[0, 1047, 0.3], [0.12, 1319, 0.3], [0.24, 1568, 0.3], [0.36, 2093, 0.5]] },
    };
    const p = P[name] || { every: 1500, notes: [[0, 880 + (SOUNDS.indexOf(name) % 6) * 110, 0.5], [0.22, 1175 + (SOUNDS.indexOf(name) % 4) * 90, 0.6], [0.44, 988, 0.7]] };
    const play = () => {
      if (stopped || !ctx || ctx.state !== 'running') return;
      const t0 = ctx.currentTime + 0.02;
      p.notes.forEach(([dt, f, d]) => { if (p.beep) JC.audio.beep(f, d, 0.06); else JC.audio.bell(f, d, 0.09, t0 + dt); });
      if (p.beep) p.notes.slice(1).forEach(([dt, f, d], i) => setTimeout(() => { if (!stopped) JC.audio.beep(f, d, 0.06); }, dt * 1000));
      JC.audio.haptic([60, 60, 60]);
    };
    play();
    const iv = setInterval(play, p.every);
    return () => { stopped = true; clearInterval(iv); };
  }

  // ── runtime (survives the app being closed) ────────────────────────────────
  const RT = { timers: [], recents: [{ s: 180, label: 'Tea' }, { s: 5400, label: 'Soup' }, { s: 600, label: 'Timer' }, { s: 1200, label: 'Nap (no)' }], sw: { running: false, start: 0, acc: 0, laps: [] }, ringing: null, snoozes: {}, firedKey: {} };
  const fmtSW = (ms) => { const t = Math.floor(ms / 10); const cs = t % 100; const s = Math.floor(t / 100) % 60; const m = Math.floor(t / 6000); return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(cs).padStart(2, '0'); };
  const fmtTimer = (s) => { s = Math.max(0, Math.ceil(s)); const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm)) + ':' + String(ss).padStart(2, '0'); };
  const swElapsed = () => RT.sw.acc + (RT.sw.running ? performance.now() - RT.sw.start : 0);
  const timerLeft = (t) => (t.paused ? t.left : Math.max(0, (t.endAt - performance.now()) / 1000));
  function durText(s) { const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return [hh ? hh + ' hr' : '', mm ? mm + ' min' : '', ss ? ss + ' sec' : ''].filter(Boolean).join(', ') || '0 sec'; }

  // Dynamic Island activities (shown while Clock isn't the foreground app)
  function islandSync() {
    const inApp = JC.os && JC.os.isOpen && JC.os.isOpen('clock');
    const running = RT.timers.filter((t) => !t.done);
    if (running.length && !inApp) {
      if (!JC.os.island.has('clock-timer')) JC.os.island.start('clock-timer', {
        priority: 4, width: 214,
        compact: () => { const t = RT.timers.filter((x) => !x.done).sort((a, b) => timerLeft(a) - timerLeft(b))[0]; if (!t) return {}; return { left: h('span.ck-isl-ic', JC.icon('timer', { size: 17, weight: 2.2 })), right: h('span.ck-isl-t', fmtTimer(timerLeft(t))) }; },
        expanded: (el) => {
          const t = RT.timers.filter((x) => !x.done)[0];
          if (!t) return;
          el.append(h('div.ck-isl-x', h('div.ck-isl-x-l', h('div.ck-isl-x-k', t.label || 'Timer'), h('div.ck-isl-x-t', fmtTimer(timerLeft(t)))),
            h('div.ck-isl-x-b', h('div.ck-isl-btn.or', { onTap: (e) => { e.stopPropagation(); pauseTimer(t); JC.os.island.collapse(); } }, JC.icon(t.paused ? 'play.fill' : 'pause.fill', { size: 20 })), h('div.ck-isl-btn', { onTap: (e) => { e.stopPropagation(); cancelTimer(t); JC.os.island.collapse(); } }, JC.icon('xmark', { size: 18, weight: 2.6 })))));
        },
        onTap: () => JC.os.open('clock', { tab: 'timer' }),
      });
    } else if (JC.os.island.has('clock-timer')) JC.os.island.stop('clock-timer');
    if (RT.sw.running && !inApp) {
      if (!JC.os.island.has('clock-sw')) JC.os.island.start('clock-sw', { priority: 3, width: 200, compact: () => ({ left: h('span.ck-isl-ic', JC.icon('stopwatch.fill', { size: 17 })), right: h('span.ck-isl-t', fmtSW(swElapsed()).slice(0, 5)) }), onTap: () => JC.os.open('clock', { tab: 'stopwatch' }) });
    } else if (JC.os.island.has('clock-sw')) JC.os.island.stop('clock-sw');
  }
  function startTimer(s, label, sound) {
    if (s <= 0) return null;
    const t = { id: U.uid('tm'), total: s, endAt: performance.now() + s * 1000, paused: false, left: s, label: label || 'Timer', sound: sound || 'Radar', done: false };
    RT.timers.unshift(t);
    const ri = RT.recents.findIndex((r) => r.s === s && r.label === t.label);
    if (ri >= 0) RT.recents.splice(ri, 1);
    RT.recents.unshift({ s, label: t.label });
    RT.recents.length = Math.min(RT.recents.length, 8);
    JC.bus.emit('clock:timers');
    return t;
  }
  function pauseTimer(t) {
    if (t.paused) { t.paused = false; t.endAt = performance.now() + t.left * 1000; } else { t.left = timerLeft(t); t.paused = true; }
    JC.bus.emit('clock:timers');
  }
  function cancelTimer(t) { RT.timers = RT.timers.filter((x) => x !== t); JC.bus.emit('clock:timers'); islandSync(); }
  function timerDone(t) {
    t.done = true;
    RT.timers = RT.timers.filter((x) => x !== t);
    JC.bus.emit('clock:timers');
    islandSync();
    const stop = tone(t.sound);
    JC.os.island.flash(t.label === 'Timer' ? 'Timer Done' : t.label, 'timer', '#ff9f0a');
    if (JC.os.asleep) JC.os.wake();
    ui.alert({ icon: 'timer', title: t.label === 'Timer' ? 'Timer' : t.label, message: durText(t.total) + ' — done.', buttons: [{ text: 'Repeat' }, { text: 'Stop', style: 'default' }] }).then((r) => {
      stop();
      if (r.index === 0) startTimer(t.total, t.label, t.sound);
    });
    JC.notify.push({ app: 'clock', title: 'Timer', body: (t.label || 'Timer') + ' — ' + durText(t.total), silent: true, open: { app: 'clock', intent: { tab: 'timer' } } });
  }
  setInterval(() => {
    RT.timers.slice().forEach((t) => { if (!t.paused && !t.done && performance.now() >= t.endAt) timerDone(t); });
  }, 250);

  // alarms fire on the in-game clock
  function checkAlarms() {
    if (!JC.store.hasSeed('alarms')) return;
    const d = JC.time.date();
    const key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
    const nowMin = d.getHours() * 60 + d.getMinutes();
    JC.store.all('alarms').forEach((a) => {
      if (!a.on) return;
      const days = a.repeat || [];
      if (days.length && !days.includes(d.getDay())) return;
      if (a.h * 60 + a.m !== nowMin) return;
      if (RT.firedKey[a.id] === key) return;
      RT.firedKey[a.id] = key;
      if (!days.length) JC.store.update('alarms', a.id, { on: false });
      ring(a);
    });
    Object.keys(RT.snoozes).forEach((id) => {
      if (JC.time.now() >= RT.snoozes[id]) { delete RT.snoozes[id]; const a = JC.store.get('alarms', id); if (a) ring(a, true); }
    });
  }
  function ring(a, snoozed) {
    if (RT.ringing) RT.ringing.stop(true);
    if (JC.os.asleep) JC.os.wake();
    const stop = tone(a.sound || 'Radar');
    const locked = JC.os.locked;
    const layer = ui.layer(true);
    const t = fmt12(JC.time.date().getHours(), JC.time.date().getMinutes());
    const el = h('div.ck-ring', { class: { banner: !locked } },
      h('div.ck-ring-bg'),
      h('div.ck-ring-card',
        h('div.ck-ring-k', JC.icon('alarm.fill', { size: 16 }), h('span', 'Alarm' + (snoozed ? ' · Snoozed' : ''))),
        h('div.ck-ring-t', t.t, h('span', t.ap)),
        h('div.ck-ring-l', a.label || 'Alarm'),
        h('div.ck-ring-btns',
          a.snooze !== false ? h('div.ck-ring-snooze', { onTap: () => { RT.snoozes[a.id] = JC.time.now() + 9 * 60e3; done(false); JC.ui.toast('Snoozed for 9 minutes', { icon: 'alarm.fill' }); } }, 'Snooze') : null,
          h('div.ck-ring-stop', { onTap: () => done(false) }, 'Stop'))));
    layer.appendChild(el);
    U.anim(el, [{ opacity: 0, transform: 'translateY(-20px)' }, { opacity: 1, transform: 'none' }], { duration: 380 });
    const autoT = setTimeout(() => { done(true); }, 90000);
    function done(missed) {
      clearTimeout(autoT);
      stop();
      RT.ringing = null;
      U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 }).then(() => el.remove());
      if (missed) JC.notify.push({ app: 'clock', title: 'Alarm', body: (a.label || 'Alarm') + ' — ' + fmt12(a.h, a.m).t + ' ' + fmt12(a.h, a.m).ap, open: { app: 'clock', intent: { tab: 'alarm' } } });
      JC.story.act('alarm_stop', { id: a.id, label: a.label, missed: !!missed });
    }
    RT.ringing = { stop: done };
    JC.story.act('alarm', { id: a.id, label: a.label });
  }
  JC.bus.on('boot', () => {
    JC.bus.on('minute', checkAlarms);
    JC.bus.on('app:open', () => setTimeout(islandSync, 50));
    JC.bus.on('app:home', () => setTimeout(islandSync, 50));
  });

  JC.icon.add({
    'ck.globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>',
    'ck.bed': '<path d="M3 18.5V7M3 14h18v4.5M21 14v-2.5a3 3 0 0 0-3-3h-7v5.5"/><circle cx="7" cy="11" r="2"/>',
    'ck.handle': '<path d="M5 9h14M5 12h14M5 15h14"/>',
  });


  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'clock',
    name: 'Clock',
    status: 'auto',
    launch(win, intent0) {
      win.body.classList.add('app-clock');
      const glass = (o) => ui.navBtn(o);
      const live = new Set();
      const keep = (pg) => { live.add(pg); return pg; };
      const rerender = () => live.forEach((pg) => { if (pg.el.isConnected) pg.render(); else live.delete(pg); });
      let raf = null;

      // ═══ WORLD CLOCK ═══════════════════════════════════════════════════
      function worldPage() {
        let editing = false;
        const editBtn = glass({ text: 'Edit', onTap: () => { editing = !editing; editBtn.querySelector('span').textContent = editing ? 'Done' : 'Edit'; page.render(); } });
        const page = keep(ui.page({
          title: 'World Clock', large: true, cls: 'ck-world',
          left: [editBtn],
          right: [glass({ icon: 'plus', onTap: () => addCity() })],
          content: () => {
            const list = JC.store.all('worldclocks');
            if (!list.length) return [ui.empty({ icon: 'ck.globe', title: 'No World Clocks', text: 'Tap + to add a city.' })];
            const local = JC.time.date();
            return [h('div.ck-wlist', list.map((w, i) => {
              const { d, off } = cityTime(w.city);
              const dayDiff = Math.round((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(local.getFullYear(), local.getMonth(), local.getDate())) / 86400e3);
              const rel = dayDiff === 0 ? 'Today' : dayDiff === 1 ? 'Tomorrow' : 'Yesterday';
              const diff = off - 8;
              const diffTxt = (diff >= 0 ? '+' : '') + (Number.isInteger(diff) ? diff : diff.toFixed(2).replace(/0$/, '')) + 'HRS';
              const t = fmt12(d.getUTCHours(), d.getUTCMinutes());
              const row = h('div.ck-wrow', { class: { editing } },
                editing ? h('div.ck-del', { onTap: () => JC.store.remove('worldclocks', w.id) }, JC.icon('minus.circle.fill', { size: 24 })) : null,
                h('div.ck-wl', h('div.ck-wsub', rel + ', ' + diffTxt), h('div.ck-wcity', w.city)),
                editing ? h('div.ck-handle', { onTap: () => { if (i > 0) { const arr = JC.store.all('worldclocks').slice(); [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; JC.store.set('worldclocks', arr); } } }, JC.icon('ck.handle', { size: 22 }))
                  : h('div.ck-wtime', t.t, h('span', t.ap)));
              if (!editing) {
                U.drag(row, { axis: 'x', end: (e, p) => { if (p.dx < -80) ui.actionSheet({ title: 'Remove ' + w.city + '?', actions: [{ text: 'Delete', style: 'destructive', onTap: () => JC.store.remove('worldclocks', w.id) }] }); } });
                ui.contextMenu(row, () => ({ items: [
                  { text: 'Copy Time', icon: 'doc.on.doc', onTap: () => { U.copy(w.city + ' ' + t.t + ' ' + t.ap); ui.toast('Copied', { icon: 'doc.on.doc' }); } },
                  { text: 'Delete', icon: 'trash', destructive: true, onTap: () => JC.store.remove('worldclocks', w.id) },
                ] }));
                ui.onTap(row, () => ui.toast(w.city + ' · ' + cityInfo(w.city)[1] + ' · UTC' + (off >= 0 ? '+' : '') + off, { icon: 'ck.globe' }));
              }
              return row;
            }))];
          },
        }));
        return page;
      }
      function addCity() {
        let q = '';
        const s = ui.sheet({
          title: 'Choose a City', detent: 'large', left: { text: 'Cancel' }, cls: 'ck-citysheet',
          content: (sh) => {
            const search = ui.search({ placeholder: 'Search', onInput: (v) => { q = v; const l = sh.body.querySelector('.ck-cities'); if (l) l.replaceWith(cityList()); } });
            setTimeout(() => search.input.focus(), 350);
            return [h('div.ck-citysearch', search), cityList()];
          },
        });
        function cityList() {
          const have = JC.store.all('worldclocks').map((w) => w.city);
          const items = CITIES.filter((c) => !q || (c[0] + ' ' + c[1]).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a[0].localeCompare(b[0]));
          const groups = {};
          items.forEach((c) => { const k = c[0][0].toUpperCase(); (groups[k] = groups[k] || []).push(c); });
          return h('div.ck-cities', ui.list(Object.keys(groups).sort().map((k) => ({ header: k, rows: groups[k].map((c) => ({ title: c[0] + ', ' + c[1], detail: have.includes(c[0]) ? '✓' : '', onTap: () => {
            if (!have.includes(c[0])) JC.store.add('worldclocks', { id: U.uid('wc'), city: c[0] });
            s.close();
          } })) }))));
        }
      }

      // ═══ ALARMS ════════════════════════════════════════════════════════
      function alarmsPage() {
        let editing = false;
        const editBtn = glass({ text: 'Edit', onTap: () => { editing = !editing; editBtn.querySelector('span').textContent = editing ? 'Done' : 'Edit'; page.render(); } });
        const page = keep(ui.page({
          title: 'Alarms', large: true, cls: 'ck-alarms',
          left: [editBtn],
          right: [glass({ icon: 'plus', onTap: () => alarmSheet(null) })],
          content: () => {
            const list = JC.store.all('alarms').slice().sort((a, b) => a.h * 60 + a.m - (b.h * 60 + b.m));
            return [
              h('div.ck-sleephead', JC.icon('ck.bed', { size: 18 }), h('span', 'Sleep | Wake Up')),
              h('div.ck-sleep', h('div.ck-sleep-t', 'No Alarm'), h('div.ck-pill', { onTap: () => ui.alert({ title: 'Sleep Schedule', message: 'Set a sleep schedule in Health to get a wake-up alarm and wind down.\n\nYour average this month: 4 hr 52 min.', buttons: [{ text: 'Not Now', style: 'cancel' }, { text: 'Open Health', style: 'default', onTap: () => JC.os.open('health') }] }) }, 'SET UP')),
              h('div.ck-sechead', 'Other'),
              h('div.ck-alist', list.map((a) => {
                const t = fmt12(a.h, a.m);
                const tog = ui.toggle({ on: a.on, onChange: (v) => { JC.store.update('alarms', a.id, { on: v }); if (v) ui.toast(untilText(a), { icon: 'alarm.fill' }); else alarmOff(a); } });
                const row = h('div.ck-arow', { class: { off: !a.on, editing } },
                  editing ? h('div.ck-del', { onTap: () => { JC.store.remove('alarms', a.id); alarmOff(a, true); } }, JC.icon('minus.circle.fill', { size: 24 })) : null,
                  h('div.ck-amain', h('div.ck-atime', t.t, h('span', t.ap)), h('div.ck-alabel', (a.label || 'Alarm') + (a.repeat && a.repeat.length ? ', ' + repeatText(a.repeat) : ''))),
                  editing ? h('div.ck-chev', JC.icon('chevron.right', { size: 15, weight: 2.4 })) : tog);
                ui.onTap(row, (e) => { if (e.target.closest('.toggle, .ck-del')) return; alarmSheet(a); });
                U.drag(row, { axis: 'x', end: (e, p) => { if (p.dx < -80) ui.actionSheet({ title: 'Delete this alarm?', actions: [{ text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('alarms', a.id); alarmOff(a, true); } }] }); } });
                return row;
              })),
            ];
          },
        }));
        return page;
      }
      function alarmOff(a, deleted) {
        try { JC.story.act('alarm_off', { id: a.id, label: a.label, deleted: !!deleted }); } catch (e) { /* ignore */ }
      }
      function untilText(a) {
        const n = JC.time.date();
        let best = null;
        for (let dd = 0; dd < 8; dd++) {
          const t = new Date(n);
          t.setDate(t.getDate() + dd);
          t.setHours(a.h, a.m, 0, 0);
          if (t <= n) continue;
          if (a.repeat && a.repeat.length && !a.repeat.includes(t.getDay())) continue;
          best = t; break;
        }
        if (!best) return 'Alarm set';
        const mins = Math.round((best - n) / 60e3);
        const hh = Math.floor(mins / 60), mm = mins % 60;
        return 'Alarm set for ' + (hh ? hh + ' hr ' : '') + mm + ' min from now';
      }
      function alarmSheet(a) {
        const isNew = !a;
        const now = JC.time.date();
        const d = a ? JSON.parse(JSON.stringify(a)) : { h: now.getHours(), m: now.getMinutes(), label: 'Alarm', repeat: [], on: true, sound: 'Radar', snooze: true };
        const labelIn = ui.input({ value: d.label, placeholder: 'Alarm', cls: 'ck-labelin', onInput: (v) => { d.label = v; } });
        const s = ui.sheet({
          title: isNew ? 'Add Alarm' : 'Edit Alarm', detent: 'large', cls: 'ck-asheet', left: { text: 'Cancel' },
          right: { text: 'Save', onTap: () => {
            const item = { h: d.h, m: d.m, label: (d.label || '').trim() || 'Alarm', repeat: d.repeat, on: true, sound: d.sound, snooze: d.snooze };
            const id = isNew ? U.uid('al') : a.id;
            if (isNew) JC.store.add('alarms', Object.assign({ id }, item)); else JC.store.update('alarms', a.id, item);
            ui.toast(untilText(item), { icon: 'alarm.fill' });
            try { JC.story.act('alarm_set', { id, label: item.label, time: String(item.h).padStart(2, '0') + ':' + String(item.m).padStart(2, '0'), h: item.h, m: item.m, repeat: (item.repeat || []).slice(), isNew }); } catch (e) { /* ignore */ }
          } },
          content: (sh) => [
            h('div.ck-awheel', ui.wheel({ cols: [
              { items: Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1 })), value: d.h % 12 || 12, width: 70, align: 'right' },
              { items: Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), value: d.m, width: 70 },
              { items: ['AM', 'PM'], value: d.h >= 12 ? 'PM' : 'AM', width: 70, align: 'left' },
            ], onChange: (v) => { let hh = v[0] % 12; if (v[2] === 'PM') hh += 12; d.h = hh; d.m = v[1]; } })),
            ui.list([{ rows: [
              { title: 'Repeat', detail: d.repeat.length ? repeatText(d.repeat).replace(/^every day$/, 'Every Day').replace(/^weekdays$/, 'Weekdays').replace(/^weekends$/, 'Weekends') : 'Never', chevron: true, onTap: () => repeatSheet(d, () => sh.render()) },
              { title: 'Label', custom: null, right: labelIn },
              { title: 'Sound', detail: d.sound, chevron: true, onTap: () => soundSheet(d, () => sh.render()) },
              { title: 'Snooze', toggle: { on: d.snooze !== false, onChange: (v) => { d.snooze = v; } } },
            ] }]),
            !isNew ? ui.list([{ rows: [{ title: 'Delete Alarm', destructive: true, center: true, onTap: () => { s.close(); JC.store.remove('alarms', a.id); alarmOff(a, true); } }] }]) : null,
          ],
        });
      }
      function repeatSheet(d, cb) {
        ui.sheet({
          title: 'Repeat', detent: 'large', right: { text: 'Done', onTap: () => cb() },
          content: (sh) => [ui.list([{ rows: DAYS.map((name, i) => ({ title: 'Every ' + name, check: d.repeat.includes(i), onTap: () => { if (d.repeat.includes(i)) d.repeat = d.repeat.filter((x) => x !== i); else d.repeat = d.repeat.concat(i).sort(); sh.render(); } })) }])],
        });
      }
      function soundSheet(d, cb) {
        let stop = null;
        ui.sheet({
          title: 'Sound', detent: 'large', right: { text: 'Done', onTap: () => { if (stop) stop(); cb(); } }, onClose: () => { if (stop) stop(); },
          content: (sh) => [
            ui.list([{ rows: [{ title: 'Haptics', detail: 'Synchronized', chevron: true, onTap: () => { JC.audio.haptic([80, 60, 80]); ui.toast('Synchronized'); } }] }]),
            ui.list([{ header: 'Ringtones', rows: SOUNDS.map((n) => ({ title: n + (n === 'Radar' ? ' (Default)' : ''), check: d.sound === n, onTap: () => { d.sound = n; if (stop) stop(); stop = tone(n); setTimeout(() => { if (stop) { stop(); stop = null; } }, 2600); sh.render(); } })) }]),
          ],
        });
      }

      // ═══ STOPWATCH ═════════════════════════════════════════════════════
      function stopwatchPage() {
        let face = 0;
        const digital = h('div.ck-swd', '00:00.00');
        const analogHand = h('div.ck-hand.big');
        const analogSmall = h('div.ck-hand.small');
        const analogLabel = h('div.ck-ana-t', '00:00.00');
        const analog = h('div.ck-ana', { html: analogSvg() }, analogSmall, analogHand, h('div.ck-ana-hub'), analogLabel);
        const pager = h('div.ck-pager', h('div.ck-pages', h('div.ck-pagep', digital), h('div.ck-pagep', analog)));
        const dots = h('div.ck-dots', h('i.on'), h('i'));
        const leftBtn = h('div.ck-round.gray');
        const rightBtn = h('div.ck-round');
        const laps = h('div.ck-laps');
        const page = keep(ui.page({
          title: 'Stopwatch', large: false, cls: 'ck-sw', navbar: false,
          content: () => [pager, dots, h('div.ck-btnrow', leftBtn, rightBtn), laps],
        }));
        U.drag(pager, { axis: 'x', end: (e, p) => { if (p.dx < -40) setFace(1); else if (p.dx > 40) setFace(0); } });
        ui.onTap(dots, () => setFace(face ? 0 : 1));
        function setFace(f) { face = f; pager.firstChild.style.transform = `translateX(${-f * 100}%)`; dots.children[0].classList.toggle('on', !f); dots.children[1].classList.toggle('on', !!f); }
        function paintButtons() {
          const sw = RT.sw;
          const has = swElapsed() > 0;
          leftBtn.className = 'ck-round gray tap' + (!sw.running && !has ? ' dis' : '');
          leftBtn.textContent = sw.running || !has ? 'Lap' : 'Reset';
          rightBtn.className = 'ck-round tap ' + (sw.running ? 'red' : 'green');
          rightBtn.textContent = sw.running ? 'Stop' : 'Start';
        }
        ui.onTap(leftBtn, () => {
          const sw = RT.sw;
          if (sw.running) { sw.laps.unshift(swElapsed()); JC.audio.play('tap'); paintLaps(); }
          else if (swElapsed() > 0) { sw.acc = 0; sw.laps = []; paintLaps(); tick(true); }
          paintButtons();
        });
        ui.onTap(rightBtn, () => {
          const sw = RT.sw;
          if (sw.running) { sw.acc = swElapsed(); sw.running = false; } else { sw.start = performance.now(); sw.running = true; }
          JC.audio.haptic(8);
          paintButtons();
        });
        function paintLaps() {
          const sw = RT.sw;
          laps.innerHTML = '';
          const splits = [];
          const marks = sw.laps.slice().reverse();
          marks.forEach((m, i) => splits.push(m - (i ? marks[i - 1] : 0)));
          const cur = swElapsed() - (marks.length ? marks[marks.length - 1] : 0);
          const done = splits.slice();
          const best = done.length >= 2 ? Math.min(...done) : null;
          const worst = done.length >= 2 ? Math.max(...done) : null;
          const rows = [];
          if (sw.running || swElapsed() > 0) rows.push(h('div.ck-lap.cur', h('span', 'Lap ' + (marks.length + 1)), h('span.ck-lapv', fmtSW(cur))));
          for (let i = done.length - 1; i >= 0; i--) rows.push(h('div.ck-lap', { class: { best: done[i] === best, worst: done[i] === worst } }, h('span', 'Lap ' + (i + 1)), h('span.ck-lapv', fmtSW(done[i]))));
          laps.append(...rows);
        }
        function tick(force) {
          const ms = swElapsed();
          const txt = fmtSW(ms);
          if (digital.textContent !== txt || force) {
            digital.textContent = txt;
            analogLabel.textContent = txt;
            analogHand.style.transform = `rotate(${(ms / 60000) * 360}deg)`;
            analogSmall.style.transform = `rotate(${(ms / 1800000) * 360}deg)`;
            const cur = laps.querySelector('.ck-lap.cur .ck-lapv');
            if (cur) { const marks = RT.sw.laps; cur.textContent = fmtSW(ms - (marks.length ? marks[0] : 0)); }
          }
        }
        page.tick = tick;
        page.opts.onShow = () => { paintButtons(); paintLaps(); tick(true); };
        paintButtons(); paintLaps(); tick(true);
        return page;
      }
      function analogSvg() {
        let ticks = '';
        for (let i = 0; i < 240; i++) {
          const a = (i / 240) * Math.PI * 2;
          const major = i % 20 === 0, mid = i % 4 === 0;
          const r1 = 150, r2 = major ? 136 : mid ? 141 : 145;
          ticks += `<line x1="${160 + Math.sin(a) * r1}" y1="${160 - Math.cos(a) * r1}" x2="${160 + Math.sin(a) * r2}" y2="${160 - Math.cos(a) * r2}" class="${major ? 'mj' : mid ? 'md' : 'mn'}"/>`;
        }
        let nums = '';
        for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2; nums += `<text x="${160 + Math.sin(a) * 118}" y="${166 - Math.cos(a) * 118}">${i * 5}</text>`; }
        let small = '';
        for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2; small += `<line x1="${160 + Math.sin(a) * 34}" y1="${108 - Math.cos(a) * 34}" x2="${160 + Math.sin(a) * (i % 5 ? 31 : 28)}" y2="${108 - Math.cos(a) * (i % 5 ? 31 : 28)}" class="mn"/>`; }
        return `<svg viewBox="0 0 320 320" class="ck-ana-svg">${ticks}${nums}${small}<text x="160" y="96" class="sm">30</text></svg>`;
      }

      // ═══ TIMERS ════════════════════════════════════════════════════════
      function timersPage() {
        let pick = [0, 5, 0];
        let label = 'Timer';
        let sound = 'Radar';
        const page = keep(ui.page({
          title: 'Timers', large: true, cls: 'ck-timers',
          right: [glass({ icon: 'plus', onTap: () => { page.scrollTop(true); ui.toast('Choose a duration, then tap Start', { icon: 'timer' }); } })],
          content: (pg) => {
            const active = RT.timers.filter((t) => !t.done);
            const out = [];
            if (active.length) out.push(h('div.ck-tlist', active.map((t) => timerRow(t))));
            const wheel = ui.wheel({ cols: [
              { items: Array.from({ length: 24 }, (_, i) => ({ label: String(i), value: i })), value: pick[0], width: 92 },
              { items: Array.from({ length: 60 }, (_, i) => ({ label: String(i), value: i })), value: pick[1], width: 92 },
              { items: Array.from({ length: 60 }, (_, i) => ({ label: String(i), value: i })), value: pick[2], width: 92 },
            ], onChange: (v) => { pick = v; } });
            out.push(h('div.ck-twheel', wheel, h('div.ck-tunits', h('span', 'hours'), h('span', 'min'), h('span', 'sec'))));
            out.push(h('div.ck-btnrow',
              h('div.ck-round.gray', { class: { dis: !active.length }, onTap: () => { if (active.length) cancelTimer(active[0]); } }, 'Cancel'),
              h('div.ck-round.green', { onTap: () => { const sTot = pick[0] * 3600 + pick[1] * 60 + pick[2]; if (!sTot) { ui.toast('Choose a duration', { icon: 'timer' }); return; } startTimer(sTot, label, sound); JC.audio.haptic(10); } }, 'Start')));
            out.push(ui.list([{ rows: [
              { title: 'Label', detail: label, chevron: true, onTap: () => ui.alert({ title: 'Label', input: { value: label === 'Timer' ? '' : label, placeholder: 'Timer' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Done', style: 'default' }] }).then((r) => { if (r.index === 1) { label = (r.value || '').trim() || 'Timer'; pg.render(); } }) },
              { title: 'When Timer Ends', detail: sound, chevron: true, onTap: () => { const d = { sound }; soundSheet(d, () => { sound = d.sound; pg.render(); }); } },
            ] }]));
            if (RT.recents.length) out.push(ui.list([{ header: 'Recents', rows: RT.recents.map((r) => ({
              title: durShort(r.s), subtitle: r.label,
              right: h('div.ck-play', { onTap: (e) => { e.stopPropagation(); startTimer(r.s, r.label, sound); } }, JC.icon('play.fill', { size: 16 })),
              swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { RT.recents = RT.recents.filter((x) => x !== r); pg.render(); } }],
              onTap: () => startTimer(r.s, r.label, sound),
            })) }]));
            return out;
          },
        }));
        function durShort(s) { const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60; return hh ? hh + ':' + String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0') : mm + ':' + String(ss).padStart(2, '0'); }
        function timerRow(t) {
          const ring = h('div.ck-tring', { style: { '--p': 0 } }, h('div.ck-tring-in', h('div.ck-tleft'), h('div.ck-tend')));
          const row = h('div.ck-trow', { data: { id: t.id } },
            h('div.ck-tinfo', h('div.ck-tbig'), h('div.ck-tlabel', t.label + ' · ' + durShort(t.total))),
            h('div.ck-tbtns',
              h('div.ck-tbtn.or', { onTap: () => { pauseTimer(t); } }, JC.icon(t.paused ? 'play.fill' : 'pause.fill', { size: 18 })),
              h('div.ck-tbtn.gray', { onTap: () => cancelTimer(t) }, JC.icon('xmark', { size: 15, weight: 2.6 }))),
            ring);
          row.__t = t;
          return row;
        }
        page.tick = () => {
          page.content.querySelectorAll('.ck-trow').forEach((row) => {
            const t = row.__t;
            const left = timerLeft(t);
            row.querySelector('.ck-tbig').textContent = fmtTimer(left);
            row.querySelector('.ck-tring').style.setProperty('--p', ((1 - left / t.total) * 100).toFixed(2));
            const end = new Date(JC.time.now() + left * 1000);
            row.querySelector('.ck-tbig').classList.toggle('paused', t.paused);
            row.querySelector('.ck-tlabel').textContent = (t.label || 'Timer') + ' · ' + (t.paused ? 'Paused' : '🔔 ' + U.fmtTime(end));
          });
        };
        return page;
      }

      // ═══ TABS ══════════════════════════════════════════════════════════
      const tabs = ui.tabs(win.body, {
        tabs: [
          { id: 'world', title: 'World Clock', icon: 'ck.globe', root: () => worldPage() },
          { id: 'alarm', title: 'Alarms', icon: 'alarm.fill', root: () => alarmsPage() },
          { id: 'stopwatch', title: 'Stopwatch', icon: 'stopwatch.fill', root: () => stopwatchPage() },
          { id: 'timer', title: 'Timers', icon: 'timer', root: () => timersPage() },
        ],
        active: 'world',
        tint: 'var(--orange)',
      });
      const offs = [JC.store.on('worldclocks', () => rerender()), JC.store.on('alarms', () => rerender())];
      const onT = () => rerender();
      JC.bus.on('clock:timers', onT);
      const onMin = () => { const n = tabs.nav('world'); if (n && tabs.current() === 'world') n.top().render(); const a = tabs.nav('alarm'); if (a && tabs.current() === 'alarm') a.top().render(); };
      JC.bus.on('minute', onMin);
      function loop() {
        raf = requestAnimationFrame(loop);
        const id = tabs.current();
        const n = tabs.nav(id);
        const top = n && n.top();
        if (top && top.tick) top.tick();
      }
      raf = requestAnimationFrame(loop);

      function handle(it) {
        if (!it) return;
        const map = { world: 'world', worldclock: 'world', alarm: 'alarm', alarms: 'alarm', stopwatch: 'stopwatch', timer: 'timer', timers: 'timer' };
        if (it.tab && map[it.tab]) tabs.select(map[it.tab]);
        if (it.create) setTimeout(() => { if ((map[it.tab] || 'alarm') === 'alarm') { tabs.select('alarm'); alarmSheet(null); } }, 150);
      }
      if (intent0) setTimeout(() => handle(intent0), 0);
      return {
        intent: handle,
        show() { if (!raf) raf = requestAnimationFrame(loop); rerender(); setTimeout(islandSync, 60); },
        hide() { cancelAnimationFrame(raf); raf = null; setTimeout(islandSync, 60); },
        destroy() { offs.forEach((f) => f()); JC.bus.off('clock:timers', onT); JC.bus.off('minute', onMin); cancelAnimationFrame(raf); },
      };
    },
  });
})();
