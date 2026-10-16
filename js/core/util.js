/* JC.h, JC.util, JC.bus — foundations. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const SVGNS = 'http://www.w3.org/2000/svg';
  const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect', 'g', 'line', 'polyline', 'polygon', 'ellipse', 'defs', 'linearGradient', 'radialGradient', 'stop', 'text', 'tspan', 'clipPath', 'mask', 'use']);

  function isProps(x) {
    return x && typeof x === 'object' && !(x instanceof Node) && !Array.isArray(x);
  }

  function appendKids(el, kids) {
    for (const k of kids) {
      if (k == null || k === false || k === true) continue;
      if (Array.isArray(k)) appendKids(el, k);
      else if (k instanceof Node) el.appendChild(k);
      else el.appendChild(document.createTextNode(String(k)));
    }
  }

  function setClass(el, v) {
    if (!v) return;
    if (typeof v === 'string') v.split(/\s+/).filter(Boolean).forEach((c) => el.classList.add(c));
    else if (Array.isArray(v)) v.forEach((c) => setClass(el, c));
    else for (const k in v) if (v[k]) el.classList.add(k);
  }

  function tapWrap(fn) {
    return function (e) {
      if (JC.util._suppress && performance.now() - JC.util._suppress < 60) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      fn.call(this, e);
    };
  }

  /** h('div.a.b#id', {props}, ...children) */
  function h(sel, props, ...kids) {
    let tag = 'div';
    let id = null;
    const classes = [];
    const parts = String(sel || 'div').split(/(?=[.#])/);
    if (parts[0] && !/^[.#]/.test(parts[0])) tag = parts.shift();
    for (const p of parts) {
      if (p[0] === '.') classes.push(p.slice(1));
      else if (p[0] === '#') id = p.slice(1);
    }
    const svg = SVG_TAGS.has(tag);
    const el = svg ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
    if (id) el.id = id;
    classes.forEach((c) => el.classList.add(c));
    if (!isProps(props)) {
      if (props !== undefined) kids.unshift(props);
      props = null;
    }
    if (props) {
      for (const key in props) {
        const v = props[key];
        if (v === undefined) continue;
        if (key === 'class' || key === 'className') setClass(el, v);
        else if (key === 'style') {
          if (typeof v === 'string') el.style.cssText += ';' + v;
          else if (v) for (const s in v) {
            if (v[s] == null) continue;
            if (s.startsWith('--')) el.style.setProperty(s, v[s]);
            else el.style[s] = v[s];
          }
        } else if (key === 'onTap' || key === 'onClick') {
          if (typeof v === 'function') {
            el.addEventListener('click', tapWrap(v));
            el.__tap = true;
            if (!svg && !el.classList.contains('tap')) el.classList.add('tap');
          }
        } else if (key.startsWith('on') && typeof v === 'function') {
          el.addEventListener(key.slice(2).toLowerCase(), v);
        } else if (key === 'html') el.innerHTML = v;
        else if (key === 'text') el.textContent = v;
        else if (key === 'data') { for (const d in v) el.dataset[d] = v[d]; }
        else if (key === 'attrs') { for (const a in v) if (v[a] != null && v[a] !== false) el.setAttribute(a, v[a] === true ? '' : v[a]); }
        else if (key === 'ref') v(el);
        else if (key === 'hidden') el.hidden = !!v;
        else if (svg) el.setAttribute(key, v);
        else if (key in el && typeof el[key] !== 'function') {
          try { el[key] = v; } catch (e) { el.setAttribute(key, v); }
        } else if (v === true) el.setAttribute(key, '');
        else if (v !== false && v !== null) el.setAttribute(key, v);
      }
    }
    appendKids(el, kids);
    return el;
  }
  JC.h = h;
  JC.$ = (s, r) => (r || document).querySelector(s);
  JC.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // ── Event bus ──────────────────────────────────────────────────
  const handlers = {};
  JC.bus = {
    on(name, fn) {
      (handlers[name] = handlers[name] || []).push(fn);
      return () => JC.bus.off(name, fn);
    },
    off(name, fn) {
      const a = handlers[name];
      if (!a) return;
      const i = a.indexOf(fn);
      if (i >= 0) a.splice(i, 1);
    },
    once(name, fn) {
      const off = JC.bus.on(name, (p) => { off(); fn(p); });
      return off;
    },
    emit(name, payload) {
      const a = handlers[name];
      if (!a) return;
      for (const fn of a.slice()) {
        try { fn(payload); } catch (e) { console.error('bus handler error', name, e); }
      }
    },
  };

  // ── Utilities ──────────────────────────────────────────────────
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let uidN = 0;

  function toDate(x) { return x instanceof Date ? x : new Date(x); }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function dayDiff(a, b) {
    const A = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const B = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((B - A) / 86400000);
  }
  function now() { return JC.time ? JC.time.date() : new Date(); }
  function h24() { return !!(JC.state && JC.state.d && JC.state.d.settings && JC.state.d.settings.h24); }

  const util = {
    _suppress: 0,
    suppressClick() { util._suppress = performance.now(); },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    uid: (p) => (p || 'id') + '_' + Date.now().toString(36) + '_' + (uidN++).toString(36),
    wait: (ms) => new Promise((r) => setTimeout(r, ms)),
    esc: (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    pick: (a) => a[Math.floor(Math.random() * a.length)],
    shuffle(a) {
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    debounce(fn, ms) {
      let t;
      return function (...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
    },
    throttle(fn, ms) {
      let last = 0, t;
      return function (...args) {
        const n = Date.now();
        if (n - last >= ms) { last = n; fn.apply(this, args); }
        else { clearTimeout(t); t = setTimeout(() => { last = Date.now(); fn.apply(this, args); }, ms - (n - last)); }
      };
    },
    MONTHS, DAYS,
    sameDay, dayDiff,
    /** 11:47 PM (or 23:47) */
    fmtTime(x, opts) {
      const d = toDate(x);
      let H = d.getHours();
      const M = String(d.getMinutes()).padStart(2, '0');
      if (h24() || (opts && opts.h24)) return String(H).padStart(2, '0') + ':' + M;
      const ap = H >= 12 ? 'PM' : 'AM';
      H = H % 12 || 12;
      return (opts && opts.noAmPm) ? H + ':' + M : H + ':' + M + ' ' + ap;
    },
    /** status-bar style clock: 11:47 */
    fmtClock(x) {
      const d = toDate(x);
      let H = d.getHours();
      const M = String(d.getMinutes()).padStart(2, '0');
      if (h24()) return String(H).padStart(2, '0') + ':' + M;
      H = H % 12 || 12;
      return H + ':' + M;
    },
    /** styles: 'long' Friday, October 16 | 'short' 10/16/26 | 'medium' Oct 16, 2026 | 'day' Friday | 'md' Oct 16 */
    fmtDate(x, style) {
      const d = toDate(x);
      const mon = MONTHS[d.getMonth()];
      switch (style) {
        case 'short': return (d.getMonth() + 1) + '/' + d.getDate() + '/' + String(d.getFullYear()).slice(2);
        case 'medium': return mon.slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear();
        case 'day': return DAYS[d.getDay()];
        case 'md': return mon.slice(0, 3) + ' ' + d.getDate();
        case 'full': return DAYS[d.getDay()] + ', ' + mon + ' ' + d.getDate() + ', ' + d.getFullYear();
        default: return DAYS[d.getDay()] + ', ' + mon + ' ' + d.getDate();
      }
    },
    /** list-style relative stamp: 11:47 PM | Yesterday | Wednesday | 10/12/26 */
    fmtRelative(x) {
      const d = toDate(x);
      const n = now();
      const diff = dayDiff(d, n);
      if (diff <= 0) return util.fmtTime(d);
      if (diff === 1) return 'Yesterday';
      if (diff < 7) return DAYS[d.getDay()];
      return util.fmtDate(d, 'short');
    },
    /** iMessage separator: Today 11:47 PM | Yesterday 9:03 PM | Wed 9:03 PM | Sat, Oct 10 at 9:03 PM | Oct 10, 2025 at 9:03 PM */
    fmtStamp(x) {
      const d = toDate(x);
      const n = now();
      const diff = dayDiff(d, n);
      const t = util.fmtTime(d);
      if (diff <= 0) return 'Today ' + t;
      if (diff === 1) return 'Yesterday ' + t;
      if (diff < 7) return DAYS[d.getDay()].slice(0, 3) + ' ' + t;
      if (d.getFullYear() === n.getFullYear()) return DAYS[d.getDay()].slice(0, 3) + ', ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ' at ' + t;
      return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear() + ' at ' + t;
    },
    /** 75 -> 1:15 */
    fmtDur(sec) {
      sec = Math.max(0, Math.round(sec));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = String(sec % 60).padStart(2, '0');
      return h ? h + ':' + String(m).padStart(2, '0') + ':' + s : m + ':' + s;
    },
    fmtMoney(n, cur) {
      const neg = n < 0;
      const v = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return (neg ? '−' : '') + (cur == null ? '¥' : cur) + v;
    },
    /** Pointer drag helper. handlers: start(e,p) → false to cancel, move(e,p), end(e,p). p = {x,y,dx,dy,vx,vy,t} in logical px. */
    drag(el, hd) {
      const thr = hd.threshold == null ? 6 : hd.threshold;
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (hd.filter && !hd.filter(e)) return;
        const sc = (JC.os && JC.os.scale) || 1;
        const p = { x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, dx: 0, dy: 0, vx: 0, vy: 0, t: performance.now(), started: false, axis: null };
        let lastX = e.clientX, lastY = e.clientY, lastT = p.t;
        const id = e.pointerId;
        const move = (ev) => {
          if (ev.pointerId !== id) return;
          const n = performance.now();
          const dtm = Math.max(1, n - lastT);
          p.vx = ((ev.clientX - lastX) / sc) / dtm;
          p.vy = ((ev.clientY - lastY) / sc) / dtm;
          lastX = ev.clientX; lastY = ev.clientY; lastT = n;
          p.x = ev.clientX; p.y = ev.clientY;
          p.dx = (ev.clientX - p.x0) / sc;
          p.dy = (ev.clientY - p.y0) / sc;
          if (!p.started) {
            if (Math.hypot(p.dx, p.dy) < thr) return;
            p.axis = Math.abs(p.dx) > Math.abs(p.dy) ? 'x' : 'y';
            if (hd.axis && hd.axis !== p.axis) { cleanup(); return; }
            if (hd.start && hd.start(ev, p) === false) { cleanup(); return; }
            p.started = true;
            try { el.setPointerCapture(id); } catch (err) { /* ignore */ }
          }
          hd.move && hd.move(ev, p);
          if (ev.cancelable) ev.preventDefault();
        };
        const up = (ev) => {
          if (ev.pointerId !== id) return;
          cleanup();
          if (p.started) {
            util.suppressClick();
            if (performance.now() - lastT > 90) { p.vx = 0; p.vy = 0; }
            hd.end && hd.end(ev, p);
          } else hd.tap && hd.tap(ev, p);
        };
        const cleanup = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
        };
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        if (hd.down) hd.down(e, p);
      });
    },
    /** long press: fn(e). Returns nothing. Cancels the following click. */
    longPress(el, fn, ms) {
      ms = ms || 480;
      let t = null, x = 0, y = 0, fired = false;
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        fired = false;
        x = e.clientX; y = e.clientY;
        clearTimeout(t);
        t = setTimeout(() => { fired = true; util.suppressClick(); fn(e); }, ms);
      });
      const cancel = () => clearTimeout(t);
      el.addEventListener('pointermove', (e) => { if (Math.hypot(e.clientX - x, e.clientY - y) > 8) cancel(); });
      el.addEventListener('pointerup', cancel);
      el.addEventListener('pointercancel', cancel);
      el.addEventListener('pointerleave', cancel);
      el.addEventListener('contextmenu', (e) => { e.preventDefault(); if (!fired) { cancel(); fired = true; fn(e); } });
      el.addEventListener('click', (e) => { if (fired) { e.stopPropagation(); e.preventDefault(); fired = false; } }, true);
    },
    anim(el, kf, opts) {
      if (!el || !el.animate) return Promise.resolve();
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const o = Object.assign({ duration: 350, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' }, opts || {});
      if (reduce) o.duration = Math.min(o.duration, 120);
      const a = el.animate(kf, o);
      return a.finished.catch(() => {}).then(() => a);
    },
    EASE: 'cubic-bezier(.32,.72,0,1)',
    SPRING: 'cubic-bezier(.2,.9,.25,1.08)',
    plural: (n, w, ws) => n + ' ' + (n === 1 ? w : (ws || w + 's')),
    copy(text) {
      try {
        if (navigator.clipboard) return navigator.clipboard.writeText(text).catch(() => {});
      } catch (e) { /* ignore */ }
      return Promise.resolve();
    },
  };
  JC.util = util;
})();
