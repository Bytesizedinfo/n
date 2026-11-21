/* Stillwater · dread engine
   Turns scroll position into a single "dread" value (0 = ordinary marketing site, 1 = the bottom of the mere).
   Every <section data-d="…"> states the dread at its top edge; the value between two sections is interpolated
   at the centre of the viewport, smoothed, and written to :root as CSS custom properties.
   Other modules subscribe with SW.on('d', fn), SW.at(threshold, fn) and SW.on('frame', fn). */
(function () {
  'use strict';
  var SW = (window.SW = window.SW || {});
  var root = document.documentElement;

  SW.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  SW.clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  SW.lerp = function (a, b, t) { return a + (b - a) * t; };
  SW.smooth = function (a, b, x) { var t = SW.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  SW.rand = function (a, b) { return a + Math.random() * (b - a); };

  /* storage: per-viewer conveniences only, and it may be unavailable */
  SW.store = {
    get: function (k, def) { try { var v = localStorage.getItem('stillwater:' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem('stillwater:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del: function (k) { try { localStorage.removeItem('stillwater:' + k); } catch (e) { /* ignore */ } }
  };

  /* events */
  var subs = {};
  SW.on = function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); };
  SW.emit = function (ev, a, b) {
    var list = subs[ev]; if (!list) return;
    for (var i = 0; i < list.length; i++) { try { list[i](a, b); } catch (e) { console.error(e); } }
  };
  var marks = [];
  /** run fn once, the first time effective dread reaches `at` */
  SW.at = function (at, fn) { marks.push({ at: at, fn: fn, done: false }); };

  /* state */
  SW.d = 0;        // effective dread (what everything renders with)
  SW.raw = 0;      // smoothed dread at the current scroll position
  SW.maxD = 0;     // deepest the visitor has been
  SW.floor = 0;    // minimum after the reset loop
  SW.act = 1;
  SW.pointer = null;
  SW.returned = !!SW.store.get('returned', false);

  var sections = [];
  function measure() {
    sections = Array.prototype.map.call(document.querySelectorAll('[data-d]'), function (el) {
      return { el: el, d: parseFloat(el.getAttribute('data-d')) || 0 };
    });
  }
  SW.measure = measure;

  /* dread at the middle of the viewport, from the sections' live positions.
     Reading positions relative to the viewport (not window.scrollY) works whichever element scrolls. */
  function dreadNow() {
    var n = sections.length;
    if (!n) return 0;
    var y = window.innerHeight * 0.5, prevTop = sections[0].el.getBoundingClientRect().top;
    if (y <= prevTop) return sections[0].d;
    for (var i = 0; i < n - 1; i++) {
      var nextTop = sections[i + 1].el.getBoundingClientRect().top;
      if (y < nextTop) return SW.lerp(sections[i].d, sections[i + 1].d, (y - prevTop) / Math.max(1, nextTop - prevTop));
      prevTop = nextTop;
    }
    return sections[n - 1].d;
  }
  /** how far the page has scrolled, whichever element is scrolling */
  SW.scrolled = function () { return sections.length ? -sections[0].el.getBoundingClientRect().top : window.scrollY; };

  /* palette stops: colour tokens as a function of dread */
  function hex(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function stops(list) { return list.map(function (s) { return [s[0], hex(s[1])]; }); }
  function sample(st, d) {
    if (d <= st[0][0]) return st[0][1];
    for (var i = 0; i < st.length - 1; i++) {
      var a = st[i], b = st[i + 1];
      if (d <= b[0]) {
        var t = (d - a[0]) / (b[0] - a[0]);
        return [SW.lerp(a[1][0], b[1][0], t), SW.lerp(a[1][1], b[1][1], t), SW.lerp(a[1][2], b[1][2], t)];
      }
    }
    return st[st.length - 1][1];
  }
  function lum(c) {
    function ch(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    return 0.2126 * ch(c[0]) + 0.7152 * ch(c[1]) + 0.0722 * ch(c[2]);
  }
  function css(c) { return 'rgb(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ')'; }
  SW.mix = function (h1, h2, t) { var a = hex(h1), b = hex(h2); return css([SW.lerp(a[0], b[0], t), SW.lerp(a[1], b[1], t), SW.lerp(a[2], b[2], t)]); };

  var BG = stops([[0, '#E8EDEA'], [0.2, '#E3E8E4'], [0.38, '#D4D9D2'], [0.46, '#BEC5BC'], [0.51, '#9AA49B'], [0.545, '#6F7A73'], [0.58, '#46514B'], [0.64, '#26302C'], [0.72, '#151D1A'], [0.8, '#090E0C'], [1, '#020302']]);
  var SURF = stops([[0, '#F7F8F5'], [0.2, '#F3F4F0'], [0.38, '#E4E7E0'], [0.46, '#D3D8CF'], [0.51, '#B9C0B6'], [0.545, '#59645D'], [0.58, '#37423C'], [0.64, '#1E2824'], [0.8, '#101614'], [1, '#080A09']]);
  var ACC = stops([[0, '#335C66'], [0.3, '#3A5A5F'], [0.5, '#4A615D'], [0.58, '#8AA593'], [0.8, '#7C9283'], [1, '#5F6E63']]);
  var INK_D = stops([[0, '#1C2623'], [0.5, '#141A17']]);
  var SOFT_D = stops([[0, '#4F5C57'], [0.3, '#4E5853'], [0.5, '#39433E']]);
  var INK_L = stops([[0.5, '#E3E2D5'], [0.8, '#CFCEC0'], [1, '#B4B3A6']]);
  var SOFT_L = stops([[0.5, '#AEB4A6'], [0.8, '#8D9387'], [1, '#6B7166']]);

  var lastPaint = -1;
  function paint(d) {
    var bg = sample(BG, d), surf = sample(SURF, d), acc = sample(ACC, d);
    var darkBg = lum(bg) < 0.2, darkSurf = lum(surf) < 0.2;
    var s = root.style;
    s.setProperty('--d', d.toFixed(4));
    s.setProperty('--bg', css(bg));
    s.setProperty('--surface', css(surf));
    s.setProperty('--accent', css(acc));
    s.setProperty('--accent-ink', lum(acc) > 0.3 ? '#101614' : '#F3F6F4');
    s.setProperty('--ink', css(darkBg ? sample(INK_L, d) : sample(INK_D, d)));
    s.setProperty('--ink-soft', css(darkBg ? sample(SOFT_L, d) : sample(SOFT_D, d)));
    s.setProperty('--card-ink', css(darkSurf ? sample(INK_L, d) : sample(INK_D, d)));
    s.setProperty('--card-soft', css(darkSurf ? sample(SOFT_L, d) : sample(SOFT_D, d)));
    s.setProperty('--line', darkBg ? 'rgba(210,220,205,' + (0.1 + d * 0.04).toFixed(3) + ')' : 'rgba(28,38,35,.14)');
    s.setProperty('--sat', (1 - SW.smooth(0.12, 0.7, d) * 0.88).toFixed(3));
    s.setProperty('--vig', (SW.smooth(0.22, 0.9, d) * 0.95).toFixed(3));
    s.setProperty('--grain', (SW.smooth(0.28, 1, d) * 0.4).toFixed(3));
    s.setProperty('--water', SW.smooth(0.52, 0.75, d).toFixed(4));
    s.setProperty('--sway', SW.smooth(0.5, 0.85, d).toFixed(3));
    root.style.colorScheme = darkBg ? 'dark' : 'light';
    var act = d < 0.2 ? 1 : d < 0.5 ? 2 : d < 0.77 ? 3 : 4;
    if (act !== SW.act) { SW.act = act; root.setAttribute('data-act', String(act)); SW.emit('act', act); }
  }

  var lastY = -1, lastT = 0;
  SW.velocity = 0;
  function frame(now) {
    var y = SW.scrolled();
    SW.velocity = SW.lerp(SW.velocity, (y - lastY) / Math.max(1, now - lastT) * 16, 0.2);
    lastY = y; lastT = now;
    var target = dreadNow();
    var gap = target - SW.raw;
    SW.raw += gap * (Math.abs(gap) > 0.15 ? 0.3 : 0.12);
    if (Math.abs(gap) < 0.0002) SW.raw = target;
    SW.maxD = Math.max(SW.maxD, SW.raw);
    var eff = Math.max(SW.raw, SW.maxD * 0.35, SW.floor);
    if (Math.abs(eff - lastPaint) > 0.0003) {
      lastPaint = eff; SW.d = eff; paint(eff);
      SW.emit('d', eff);
      for (var i = 0; i < marks.length; i++) if (!marks[i].done && eff >= marks[i].at) { marks[i].done = true; try { marks[i].fn(eff); } catch (e) { console.error(e); } }
    }
    SW.emit('frame', now);
    requestAnimationFrame(frame);
  }

  /** after the reset loop: forget how deep they went, but never fully calm again */
  SW.resetDread = function (floor) {
    SW.floor = floor || 0;
    SW.maxD = 0;
    SW.raw = dreadNow();
    lastPaint = -1;
  };

  /* pointer for eyes that follow */
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    SW.pointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });
  document.addEventListener('pointerleave', function () { SW.pointer = null; });

  /* the experience always starts at the top */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function start() {
    if (!location.hash) window.scrollTo(0, 0);
    measure();
    root.setAttribute('data-act', '1');
    if (SW.returned) SW.floor = 0.16;
    paint(SW.floor);
    requestAnimationFrame(function (t) { lastT = t; lastY = SW.scrolled(); frame(t); });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
    SW.emit('ready');
  }
  SW.start = start;
  // modules register in the scripts that follow; boot once the DOM is parsed
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
