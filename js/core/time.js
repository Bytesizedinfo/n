/* JC.time — in-game clock. The night starts Fri 16 Oct 2026, 23:47. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const BASE = new Date(2026, 9, 16, 0, 0, 0, 0); // base day for '+N HH:MM'
  const START = new Date(2026, 9, 16, 23, 47, 0, 0).getTime();

  let last = 0;
  let frozen = 0;
  let lastSec = -1;
  let lastMin = -1;
  let timer = null;

  function d() { return JC.state.d; }

  const time = {
    START,
    BASE,
    now() {
      return d().clock == null ? START : d().clock;
    },
    date() { return new Date(time.now()); },
    set(ms) {
      d().clock = ms;
      JC.state.save();
      lastMin = -1;
      time._emit(true);
    },
    advance(ms) { time.set(time.now() + ms); },
    freeze(on) { frozen += on ? 1 : -1; if (frozen < 0) frozen = 0; },
    get frozen() { return frozen > 0; },
    /** '-3 21:04' | '+1 07:40' | '2009-02-12 18:30' | '23:12' | ms */
    parse(x) {
      if (x == null) return time.now();
      if (typeof x === 'number') return x;
      if (x instanceof Date) return x.getTime();
      const s = String(x).trim();
      let m = s.match(/^([+-]\d+)\s+(\d{1,2}):(\d{2})$/);
      if (m) {
        const dt = new Date(BASE);
        dt.setDate(dt.getDate() + parseInt(m[1], 10));
        dt.setHours(parseInt(m[2], 10), parseInt(m[3], 10), 0, 0);
        return dt.getTime();
      }
      m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?$/);
      if (m) return new Date(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0, 0, 0).getTime();
      m = s.match(/^(\d{1,2}):(\d{2})$/);
      if (m) {
        const dt = new Date(BASE);
        dt.setHours(+m[1], +m[2], 0, 0);
        return dt.getTime();
      }
      const p = Date.parse(s);
      return isNaN(p) ? time.now() : p;
    },
    /** Next occurrence (>= now) of HH:MM, or a relative '+20m' / '+2h' from now. */
    resolve(spec) {
      const s = String(spec).trim();
      let m = s.match(/^\+(\d+(?:\.\d+)?)\s*(m|min|h|s)$/);
      if (m) {
        const n = parseFloat(m[1]);
        const unit = m[2] === 'h' ? 3600e3 : m[2] === 's' ? 1e3 : 60e3;
        return time.now() + n * unit;
      }
      m = s.match(/^(\d{1,2}):(\d{2})$/);
      if (m) {
        const dt = time.date();
        dt.setHours(+m[1], +m[2], 0, 0);
        if (dt.getTime() <= time.now()) dt.setDate(dt.getDate() + 1);
        return dt.getTime();
      }
      return time.parse(s);
    },
    start() {
      if (timer) return;
      if (d().clock == null) d().clock = START;
      last = performance.now();
      timer = setInterval(time._step, 250);
    },
    _step() {
      const n = performance.now();
      const dt = n - last;
      last = n;
      if (!frozen && dt < 5000) d().clock += dt;
      time._emit(false);
    },
    _emit(force) {
      const t = time.now();
      const sec = Math.floor(t / 1000);
      const min = Math.floor(t / 60000);
      if (sec !== lastSec || force) {
        lastSec = sec;
        JC.bus.emit('tick', t);
      }
      if (min !== lastMin) {
        lastMin = min;
        JC.bus.emit('minute', t);
      }
    },
  };
  JC.time = time;
})();
