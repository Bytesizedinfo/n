/* Messages — shared helpers: local prefs, thread info, places, emoji, tapbacks, mini maps, waveforms,
   voice playback (synthesised murmur), Invisible Ink, bubble & screen effects.  Used by messages*.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const M = (JC.msgApp = JC.msgApp || {});

  // threads that never deliver (beyond JC.world.contacts.failSend): none in Childe's world
  M.DEAD = [];

  // ── local, persisted app prefs (JC.store collection owned by Messages) ─────────
  M.pref = (k, v) => {
    if (v === undefined) { const it = JC.store.get('msgprefs', k); return it ? it.v : undefined; }
    JC.store.add('msgprefs', { id: k, v });
    return v;
  };
  M.prefMap = (k) => Object.assign({}, M.pref(k) || {});
  M.prefSet = (k, key, val) => {
    const o = M.prefMap(k);
    if (val === undefined || val === null || val === false) delete o[key]; else o[key] = val;
    M.pref(k, o);
  };

  // ── thread info (cached per story event) ───────────────────────────────────
  let thCache = null;
  ['story:thread', 'story:threads', 'story:reset', 'story:typing', 'story:pending', 'store:msgprefs'].forEach((ev) => JC.bus.on(ev, () => { thCache = null; }));
  M.invalidate = () => { thCache = null; };
  M.threads = () => {
    if (!thCache) {
      const deleted = M.prefMap('deleted');
      thCache = JC.story.threads().filter((t) => !(deleted[t.id] && t.last && t.last.t <= deleted[t.id]));
    }
    return thCache;
  };
  M.thread = (tid) => M.threads().find((t) => t.id === tid) || null;
  M.def = (tid) => JC.story.threadDef(tid) || { id: tid, members: [tid], group: false, service: 'imessage' };
  M.members = (tid) => { const t = M.thread(tid); return t ? t.members : M.def(tid).members || [tid]; };
  M.isGroup = (tid) => !!M.def(tid).group;
  M.isDead = (tid) => !!M.def(tid).fails || M.members(tid).some((c) => M.DEAD.includes(c));
  M.isSMS = (tid) => M.def(tid).service === 'sms';
  M.isService = (tid) => !M.isGroup(tid) && !!(JC.contacts.get(M.members(tid)[0]) || {}).service;
  M.peer = (tid) => (M.isGroup(tid) ? null : M.members(tid)[0]);
  M.name = (tid) => JC.story.threadName(tid);
  M.short = (cid) => (cid === 'me' ? 'You' : JC.contacts.short(cid));
  M.unreadTotal = (except) => M.threads().reduce((n, t) => n + (t.id === except ? 0 : t.unread || 0), 0);
  M.setDraft = (tid, text) => { JC.story.setDraft(tid, text); thCache = null; };

  M.GROUP_COLORS = [['#c7c7cc', '#8e8e93'], ['#ffb199', '#ff5e3a'], ['#ffe08a', '#ffb800'], ['#a8f0b4', '#2fbf55'], ['#a4dcff', '#2c8cf2'], ['#d5c2ff', '#8a5cf6'], ['#ffc2dc', '#ff4f8b']];
  M.avatar = (tid, size) => {
    if (M.isGroup(tid)) {
      const ph = M.prefMap('gphoto')[tid];
      if (ph) return JC.ui.avatar({ emoji: ph.emoji || null, initials: ph.initials || '', grad: ph.grad || M.GROUP_COLORS[0] }, size);
      return JC.ui.groupAvatar(M.members(tid), size);
    }
    return JC.ui.avatar(M.peer(tid), size);
  };

  // ── places (Maps owns `places`; fall back to the story bible) ────────────────
  const PLACES = {
    pier7: ['Pier 7', 'Liyue Harbor'], northland: ['Northland Bank', 'Liyue Harbor'], wangsheng: ['Wangsheng Funeral Parlor', 'Liyue Harbor'],
    liuli: ['Liuli Pavilion', 'Liyue Harbor'], heyu: ['Heyu Tea House', 'Liyue Harbor'], yujing: ['Yujing Terrace', 'Liyue Harbor'],
    'wanmin-rest': ['Wanmin Restaurant', 'Liyue Harbor'], xinyue: ['Xinyue Kiosk', 'Liyue Harbor'], 'third-round': ['Third-Round Knockout', 'Liyue Harbor'],
    apartment: ['Pier View Residences', 'Liyue Harbor'], 'player-home': ['Chihu Rock Lane 12', 'Liyue Harbor'], airport: ['Liyue International Airport', 'Liyue'],
    guyun: ['Guyun Stone Forest', 'Liyue'], chasm: ['The Chasm', 'Liyue'], morepesok: ['Morepesok', 'Snezhnaya'],
  };
  M.place = (loc) => {
    const id = loc && typeof loc === 'object' ? loc.place : loc;
    let p = null;
    try { if (JC.store.hasSeed('places')) p = JC.store.get('places', id); } catch (e) { p = null; }
    if (p) return { id, name: p.name, city: p.city || '', addr: p.addr || '' };
    const q = PLACES[id];
    if (q) return { id, name: q[0], city: q[1], addr: '' };
    return { id, name: (loc && loc.name) || String(id || 'Location').replace(/-/g, ' '), city: (loc && loc.city) || '', addr: '' };
  };

  // ── small utilities ─────────────────────────────────────────────────────────
  function hash(str) {
    let x = 2166136261;
    str = String(str || '');
    for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
    return x >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  M.hash = hash;
  M.rng = rng;

  const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|‍|️|⃣)+$/u;
  M.bigEmoji = (text) => {
    if (!text) return 0;
    const t = String(text).replace(/\s+/g, '');
    if (!t || t.length > 28 || !EMOJI_ONLY.test(t)) return 0;
    let n;
    try { n = Array.from(new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(t)).length; } catch (e) { n = (t.match(/\p{Extended_Pictographic}/gu) || []).length; }
    return n >= 1 && n <= 3 ? n : 0;
  };

  /** text → nodes with tappable links (opens Safari) */
  M.richText = (text) => {
    const out = [];
    const re = /\b((?:https?:\/\/|www\.)[^\s]+|[a-z0-9-]+\.(?:ly|sn|com|net|org|io)(?:\/[^\s]*)?)/gi;
    let last = 0, m;
    const s = String(text || '');
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      const url = m[1].replace(/[),.!?]+$/, '');
      out.push(h('span.msg-url', { onTap: (e) => { e.stopPropagation(); JC.os.open('safari', { url: /^https?:/.test(url) ? url : 'https://' + url }); } }, url));
      last = m.index + url.length;
      re.lastIndex = last;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  };

  M.stampNode = (t) => {
    const s = U.fmtStamp(t);
    const i = s.indexOf(' at ');
    if (i > 0) return [h('b', s.slice(0, i)), ' at' + s.slice(i + 3)];
    const sp = s.indexOf(' ');
    return [h('b', s.slice(0, sp)), s.slice(sp)];
  };
  M.relTime = (t) => U.fmtRelative(t);
  M.readLabel = (t) => {
    const d = new Date(t), n = JC.time.date();
    const diff = U.dayDiff(d, n);
    if (diff <= 0) return U.fmtTime(t);
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(t, 'short');
  };

  // ── tapbacks ───────────────────────────────────────────────────────────────
  M.TAPBACKS = [
    { t: 'love', label: 'Heart' }, { t: 'like', label: 'Thumbs Up' }, { t: 'dislike', label: 'Thumbs Down' },
    { t: 'haha', label: 'Ha Ha' }, { t: 'emph', label: 'Emphasize' }, { t: 'q', label: 'Question' },
  ];
  M.tbVerb = { love: 'Loved', like: 'Liked', dislike: 'Disliked', haha: 'Laughed at', emph: 'Emphasized', q: 'Questioned' };
  M.tbGlyph = (t, size) => {
    size = size || 18;
    switch (t) {
      case 'love': return JC.icon('heart.fill', { size, cls: 'msg-tbg love' });
      case 'like': return JC.icon('hand.thumbsup.fill', { size, cls: 'msg-tbg like' });
      case 'dislike': return JC.icon('hand.thumbsup.fill', { size, cls: 'msg-tbg dislike' });
      case 'haha': return h('span.msg-tbg.txt.haha', { style: { fontSize: Math.round(size * 0.42) + 'px' } }, h('span', 'HA'), h('span', 'HA'));
      case 'emph': return h('span.msg-tbg.txt.emph', { style: { fontSize: Math.round(size * 0.86) + 'px' } }, '!!');
      case 'q': return h('span.msg-tbg.txt.q', { style: { fontSize: Math.round(size * 0.92) + 'px' } }, '?');
      default: return h('span.msg-tbg.txt', { style: { fontSize: Math.round(size * 0.8) + 'px' } }, t);
    }
  };

  // ── mini map (inline SVG, themed with CSS variables) ────────────────────────
  M.miniMap = (seed, o) => {
    o = o || {};
    const W = o.w || 240, H = o.h || 130;
    const r = rng(hash(seed));
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" style="fill:var(--mm-land)"/>`;
    // water
    if (r() < 0.75) {
      const side = r() < 0.5;
      const x0 = side ? -20 : W * (0.55 + r() * 0.2);
      s += `<path d="M${x0} ${H * (0.55 + r() * 0.2)} C ${W * 0.3} ${H * (0.4 + r() * 0.3)}, ${W * 0.6} ${H * (0.8 + r() * 0.2)}, ${W + 20} ${H * (0.6 + r() * 0.3)} L ${W + 20} ${H + 20} L ${x0} ${H + 20} Z" style="fill:var(--mm-water)"/>`;
    }
    // parks
    for (let i = 0; i < 2; i++) {
      const x = r() * W * 0.8, y = r() * H * 0.6;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(30 + r() * 50).toFixed(1)}" height="${(18 + r() * 30).toFixed(1)}" rx="6" style="fill:var(--mm-park)"/>`;
    }
    // blocks
    for (let i = 0; i < 7; i++) {
      const x = r() * W, y = r() * H;
      s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(14 + r() * 26).toFixed(1)}" height="${(10 + r() * 20).toFixed(1)}" rx="2" style="fill:var(--mm-block)"/>`;
    }
    // roads
    const roads = [];
    for (let i = 0; i < 3; i++) roads.push(`M -10 ${(H * (0.15 + r() * 0.7)).toFixed(1)} Q ${(W * 0.5).toFixed(1)} ${(H * r()).toFixed(1)} ${W + 10} ${(H * (0.15 + r() * 0.7)).toFixed(1)}`);
    for (let i = 0; i < 3; i++) roads.push(`M ${(W * (0.1 + r() * 0.8)).toFixed(1)} -10 L ${(W * (0.1 + r() * 0.8)).toFixed(1)} ${H + 10}`);
    roads.forEach((d, i) => { s += `<path d="${d}" fill="none" style="stroke:var(--mm-road-edge)" stroke-width="${i === 0 ? 9 : 6}" stroke-linecap="round"/>`; });
    roads.forEach((d, i) => { s += `<path d="${d}" fill="none" style="stroke:${i === 0 ? 'var(--mm-major)' : 'var(--mm-road)'}" stroke-width="${i === 0 ? 7 : 4}" stroke-linecap="round"/>`; });
    // pin
    const cx = W / 2, cy = H / 2;
    if (o.dot) {
      s += `<circle cx="${cx}" cy="${cy}" r="16" fill="#0a84ff" fill-opacity=".18"/><circle cx="${cx}" cy="${cy}" r="7.5" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="5.5" fill="#0a84ff"/>`;
    } else {
      s += `<ellipse cx="${cx}" cy="${cy + 1}" rx="5" ry="2" fill="rgba(0,0,0,.25)"/><path d="M${cx} ${cy} L${cx - 3} ${cy - 12} A 10 10 0 1 1 ${cx + 3} ${cy - 12} Z" fill="#ff3b30"/><circle cx="${cx}" cy="${cy - 19}" r="4" fill="#fff"/>`;
    }
    s += '</svg>';
    return h('div.msg-minimap', { html: s });
  };

  // ── waveform ───────────────────────────────────────────────────────────────
  M.wave = (seed, n) => {
    const r = rng(hash(seed));
    const out = [];
    let prev = 0.4;
    for (let i = 0; i < n; i++) {
      const env = Math.sin((i / Math.max(1, n - 1)) * Math.PI) * 0.35 + 0.65;
      let v = (0.15 + r() * 0.85) * env;
      v = prev * 0.35 + v * 0.65;
      prev = v;
      out.push(U.clamp(v, 0.12, 1));
    }
    return out;
  };

  // ── voice playback (single global player) ───────────────────────────────────
  const VOWELS = [[730, 1090], [270, 2290], [300, 870], [530, 1840], [570, 840], [440, 1020], [660, 1720], [490, 1350], [390, 1990]];
  function murmur(dur, seed, low) {
    let ctx;
    try { ctx = JC.audio.ctx && JC.audio.ctx(); } catch (e) { ctx = null; }
    if (!ctx || ctx.state !== 'running' || !JC.audio.out) return null;
    const r = rng(seed);
    const t0 = ctx.currentTime + 0.05;
    const end = t0 + dur;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 180;
    const osc = ctx.createOscillator(); osc.type = 'sawtooth';
    const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6;
    const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 9;
    const g2 = ctx.createGain(); g2.gain.value = 0.55;
    osc.connect(f1); osc.connect(f2); f2.connect(g2); f1.connect(hp); g2.connect(hp); hp.connect(lp); lp.connect(out); out.connect(JC.audio.out);
    const base = low ? 112 : 168;
    let t = t0 + 0.08;
    while (t < end - 0.2) {
      const words = 2 + Math.floor(r() * 4);
      for (let w = 0; w < words && t < end - 0.2; w++) {
        const syl = 1 + Math.floor(r() * 3);
        for (let s = 0; s < syl && t < end - 0.15; s++) {
          const d = 0.09 + r() * 0.13;
          const v = VOWELS[Math.floor(r() * VOWELS.length)];
          f1.frequency.setTargetAtTime(v[0], t, 0.02);
          f2.frequency.setTargetAtTime(v[1], t, 0.02);
          osc.frequency.setTargetAtTime(base * (0.88 + r() * 0.3), t, 0.05);
          out.gain.setTargetAtTime(0.5, t, 0.018);
          out.gain.setTargetAtTime(0.12, t + d * 0.65, 0.025);
          t += d;
        }
        out.gain.setTargetAtTime(0.0001, t, 0.03);
        t += 0.05 + r() * 0.1;
      }
      t += 0.18 + r() * 0.4;
    }
    out.gain.setTargetAtTime(0.0001, Math.min(t, end), 0.05);
    osc.start(t0);
    osc.stop(end + 0.4);
    return () => {
      try {
        const now = ctx.currentTime;
        out.gain.cancelScheduledValues(now);
        out.gain.setTargetAtTime(0.0001, now, 0.02);
        osc.stop(now + 0.12);
      } catch (e) { /* already stopped */ }
    };
  }

  const player = { id: null, el: null, t0: 0, dur: 0, raf: 0, stopAudio: null, onEnd: null, offset: 0 };
  M.playingId = () => player.id;
  M.attachPlayer = (id, el) => { if (player.id === id) { player.el = el; if (el && el._setPlaying) el._setPlaying(true); } };
  M.stopVoice = () => {
    if (!player.id) return;
    cancelAnimationFrame(player.raf);
    if (player.stopAudio) player.stopAudio();
    const el = player.el;
    const cb = player.onEnd;
    player.id = null; player.el = null; player.stopAudio = null; player.onEnd = null;
    if (el && el._setPlaying) { el._setPlaying(false); el._setProgress(0); }
    if (cb) cb(false);
  };
  /** toggle playback of a voice bubble element (el._setProgress(p), el._setPlaying(b)) */
  M.toggleVoice = (id, dur, el, o) => {
    o = o || {};
    if (player.id === id) { M.stopVoice(); return false; }
    M.stopVoice();
    player.id = id; player.el = el; player.dur = Math.max(1, dur || 5); player.t0 = performance.now(); player.onEnd = o.onEnd || null;
    player.stopAudio = o.silent ? null : murmur(player.dur, hash(id), !!o.low);
    if (el && el._setPlaying) el._setPlaying(true);
    const step = () => {
      const p = (performance.now() - player.t0) / (player.dur * 1000);
      if (player.el && player.el._setProgress) player.el._setProgress(Math.min(1, p));
      if (p >= 1) {
        const pel = player.el, cb = player.onEnd;
        player.id = null; player.el = null; player.stopAudio = null; player.onEnd = null;
        if (pel && pel._setPlaying) { pel._setPlaying(false); setTimeout(() => pel._setProgress && pel._setProgress(0), 350); }
        if (cb) cb(true);
        return;
      }
      player.raf = requestAnimationFrame(step);
    };
    player.raf = requestAnimationFrame(step);
    return true;
  };

  // ── Invisible Ink (one shared animation loop) ──────────────────────────────
  const inks = new Set();
  let inkRaf = 0;
  M.ink = (host, o) => {
    o = o || {};
    const cv = h('canvas.msg-ink');
    host.appendChild(cv);
    host.classList.add('inked');
    const st = { host, cv, ctx: cv.getContext('2d'), parts: null, w: 0, h: 0, vis: 1, target: 1, hideAt: 0, color: o.color || '#fff' };
    inks.add(st);
    st.reveal = () => {
      st.target = 0;
      st.hideAt = performance.now() + 7000;
      host.classList.add('revealed');
    };
    host.addEventListener('click', () => { if (st.target === 1) st.reveal(); });
    host.addEventListener('pointermove', (e) => { if (e.buttons && st.target === 1) st.reveal(); });
    inkLoop();
    return st;
  };
  function inkLoop() {
    if (inkRaf) return;
    const step = (now) => {
      inkRaf = 0;
      let any = false;
      inks.forEach((st) => {
        if (!st.host.isConnected) { inks.delete(st); return; }
        any = true;
        drawInk(st, now);
      });
      if (any) inkRaf = requestAnimationFrame(step);
    };
    inkRaf = requestAnimationFrame(step);
  }
  function drawInk(st, now) {
    const w = st.host.clientWidth, hh = st.host.clientHeight;
    if (!w || !hh) return;
    if (w !== st.w || hh !== st.h || !st.parts) {
      st.w = w; st.h = hh;
      st.cv.width = w * 2; st.cv.height = hh * 2;
      const n = Math.round((w * hh) / 9);
      st.parts = [];
      for (let i = 0; i < n; i++) st.parts.push({ x: Math.random() * w, y: Math.random() * hh, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 0.35 + Math.random() * 0.75, ph: Math.random() * 6.28 });
    }
    if (st.target === 0 && now > st.hideAt) { st.target = 1; st.host.classList.remove('revealed'); }
    st.vis += (st.target - st.vis) * 0.08;
    const c = st.ctx;
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.clearRect(0, 0, w, hh);
    if (st.vis < 0.02) return;
    c.fillStyle = st.color;
    const scatter = (1 - st.vis) * 30;
    st.parts.forEach((p) => {
      p.x += p.vx + (Math.random() - 0.5) * 0.18; p.y += p.vy + (Math.random() - 0.5) * 0.18;
      if (p.x < 0) p.x += w; if (p.x > w) p.x -= w; if (p.y < 0) p.y += hh; if (p.y > hh) p.y -= hh;
      const a = (0.45 + 0.55 * Math.sin(now / 260 + p.ph)) * st.vis;
      c.globalAlpha = Math.max(0, a);
      c.beginPath();
      c.arc(p.x + Math.cos(p.ph) * scatter, p.y + Math.sin(p.ph) * scatter, p.r, 0, 6.283);
      c.fill();
    });
    c.globalAlpha = 1;
  }

  // ── bubble effects (WAAPI on the message element) ───────────────────────────
  M.bubbleFx = (el, kind, scroller) => {
    if (!el) return;
    if (kind === 'slam') {
      JC.audio.play('slam');
      JC.audio.haptic(30);
      U.anim(el, [
        { transform: 'scale(2.6) translateY(-40px)', opacity: 0 },
        { transform: 'scale(.94)', opacity: 1, offset: 0.42 },
        { transform: 'scale(1.03)', offset: 0.62 },
        { transform: 'scale(1)' },
      ], { duration: 720, easing: 'cubic-bezier(.3,.7,.3,1)', fill: 'none' });
      if (scroller) setTimeout(() => U.anim(scroller, [{ transform: 'translate(0,0)' }, { transform: 'translate(-4px,3px)' }, { transform: 'translate(4px,-2px)' }, { transform: 'translate(-2px,1px)' }, { transform: 'translate(0,0)' }], { duration: 300, fill: 'none' }), 300);
    } else if (kind === 'loud') {
      U.anim(el, [
        { transform: 'scale(.6)', opacity: 0 },
        { transform: 'scale(1.75) rotate(-2deg)', opacity: 1, offset: 0.22 },
        { transform: 'scale(1.75) rotate(2.5deg)', offset: 0.32 },
        { transform: 'scale(1.75) rotate(-2.5deg)', offset: 0.42 },
        { transform: 'scale(1.75) rotate(2deg)', offset: 0.52 },
        { transform: 'scale(1.7) rotate(0deg)', offset: 0.62 },
        { transform: 'scale(1)' },
      ], { duration: 1500, easing: 'ease-in-out', fill: 'none' });
      JC.audio.haptic([20, 40, 20]);
    } else if (kind === 'gentle') {
      U.anim(el, [
        { transform: 'scale(.45)', opacity: 0.2 },
        { transform: 'scale(.5)', opacity: 1, offset: 0.25 },
        { transform: 'scale(1)' },
      ], { duration: 2100, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'none' });
    }
  };

  M.SCREEN_FX = [
    { id: 'echo', label: 'Echo' }, { id: 'spotlight', label: 'Spotlight' }, { id: 'balloons', label: 'Balloons' },
    { id: 'confetti', label: 'Confetti' }, { id: 'love', label: 'Love' }, { id: 'lasers', label: 'Lasers' },
    { id: 'fireworks', label: 'Fireworks' }, { id: 'celebration', label: 'Celebration' },
  ];
  M.BUBBLE_FX = [{ id: 'slam', label: 'Slam' }, { id: 'loud', label: 'Loud' }, { id: 'gentle', label: 'Gentle' }, { id: 'invisible', label: 'Invisible Ink' }];
  M.isScreenFx = (e) => M.SCREEN_FX.some((x) => x.id === e) || e === 'petals';
  M.fxLabel = (e) => { const f = M.SCREEN_FX.concat(M.BUBBLE_FX).find((x) => x.id === e); return f ? f.label : e; };

  /** full-screen canvas effects. container: positioned element. o: {x, y, text, color} */
  M.screenFx = (container, kind, o) => {
    o = o || {};
    const W = container.clientWidth || 402, H = container.clientHeight || 874;
    const cv = h('canvas.msg-sfx');
    cv.width = W * 2; cv.height = H * 2;
    container.appendChild(cv);
    const c = cv.getContext('2d');
    c.setTransform(2, 0, 0, 2, 0, 0);
    const COLORS = ['#ff375f', '#ff9f0a', '#ffd60a', '#30d158', '#0a84ff', '#bf5af2', '#64d2ff', '#ff6ec7'];
    const R = Math.random;
    const T = { echo: 3200, spotlight: 3600, balloons: 5200, confetti: 4600, love: 2800, lasers: 4200, fireworks: 4600, celebration: 3600, petals: 9000 }[kind] || 3000;
    const start = performance.now();
    let parts = [];
    const ox = o.x != null ? o.x : W * 0.7, oy = o.y != null ? o.y : H * 0.7;
    if (kind === 'balloons') for (let i = 0; i < 16; i++) parts.push({ x: R() * W, y: H + 40 + R() * H * 0.6, r: 22 + R() * 14, col: COLORS[i % COLORS.length], sway: R() * 6.28, sp: 1.6 + R() * 1.4 });
    if (kind === 'confetti') for (let i = 0; i < 170; i++) parts.push({ x: R() * W, y: -R() * H * 0.8 - 10, w: 5 + R() * 6, h: 8 + R() * 8, col: COLORS[i % COLORS.length], a: R() * 6.28, va: (R() - 0.5) * 0.3, vy: 1.6 + R() * 2.2, sway: R() * 6.28 });
    if (kind === 'celebration') for (let i = 0; i < 90; i++) { const a = Math.PI * (0.55 + R() * 0.5); const sp = 2 + R() * 7; parts.push({ x: W - 10, y: 10, vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp * 0.6 + R() * 2, r: 1.5 + R() * 3, col: R() < 0.7 ? '#ffd60a' : '#fff4c2', life: 0.6 + R() * 0.4 }); }
    if (kind === 'petals') for (let i = 0; i < 11; i++) parts.push({ x: R() * W, y: -30 - R() * H * 0.7, r: 7 + R() * 6, a: R() * 6.28, va: (R() - 0.5) * 0.02, vy: 0.45 + R() * 0.45, sway: R() * 6.28 });
    if (kind === 'echo') for (let i = 0; i < 26; i++) parts.push({ x: -200 - R() * W, y: 60 + R() * (H - 180), sp: 3 + R() * 5, s: 0.6 + R() * 0.6 });
    const bursts = [];
    if (kind === 'fireworks') for (let b = 0; b < 6; b++) bursts.push({ at: b * 600 + R() * 200, x: W * (0.2 + R() * 0.6), y: H * (0.18 + R() * 0.4), col: COLORS[Math.floor(R() * COLORS.length)], done: false });
    function heart(x, y, s) {
      c.beginPath();
      c.moveTo(x, y + s * 0.3);
      c.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.1, x - s * 0.5, y + s * 0.25);
      c.bezierCurveTo(x - s * 0.5, y + s * 0.55, x - s * 0.1, y + s * 0.7, x, y + s * 0.95);
      c.bezierCurveTo(x + s * 0.1, y + s * 0.7, x + s * 0.5, y + s * 0.55, x + s * 0.5, y + s * 0.25);
      c.bezierCurveTo(x + s * 0.5, y - s * 0.1, x, y, x, y + s * 0.3);
      c.fill();
    }
    function rr(x, y, w, hh, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + hh, r); c.arcTo(x + w, y + hh, x, y + hh, r); c.arcTo(x, y + hh, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function frame(now) {
      if (!cv.isConnected) return;
      const el = now - start;
      const k = el / T;
      c.clearRect(0, 0, W, H);
      const fadeOut = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 1;
      if (kind === 'balloons') {
        parts.forEach((p) => {
          p.y -= p.sp; p.sway += 0.03;
          const x = p.x + Math.sin(p.sway) * 14;
          c.strokeStyle = 'rgba(140,140,150,.6)'; c.lineWidth = 1;
          c.beginPath(); c.moveTo(x, p.y + p.r * 1.2); c.quadraticCurveTo(x + 8, p.y + p.r * 1.9, x - 4, p.y + p.r * 2.8); c.stroke();
          c.fillStyle = p.col;
          c.beginPath(); c.ellipse(x, p.y, p.r * 0.86, p.r * 1.05, 0, 0, 6.283); c.fill();
          c.beginPath(); c.moveTo(x - 4, p.y + p.r * 1.2); c.lineTo(x + 4, p.y + p.r * 1.2); c.lineTo(x, p.y + p.r * 1.0); c.fill();
          c.fillStyle = 'rgba(255,255,255,.45)';
          c.beginPath(); c.ellipse(x - p.r * 0.32, p.y - p.r * 0.4, p.r * 0.16, p.r * 0.28, -0.5, 0, 6.283); c.fill();
        });
      } else if (kind === 'confetti') {
        c.globalAlpha = fadeOut;
        parts.forEach((p) => {
          p.y += p.vy; p.a += p.va; p.sway += 0.05;
          c.save(); c.translate(p.x + Math.sin(p.sway) * 18, p.y); c.rotate(p.a); c.scale(1, Math.abs(Math.cos(p.sway * 1.7)) + 0.15);
          c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
        });
        c.globalAlpha = 1;
      } else if (kind === 'love') {
        const s = el < 900 ? 40 + (el / 900) * 180 : 220 + Math.sin((el - 900) / 120) * 10;
        const lift = el > 1700 ? (el - 1700) * 0.25 : 0;
        c.globalAlpha = fadeOut;
        c.fillStyle = '#ff2d55';
        c.shadowColor = 'rgba(255,45,85,.5)'; c.shadowBlur = 30;
        heart(ox, oy - s * 0.95 - lift, s);
        c.shadowBlur = 0; c.globalAlpha = 1;
      } else if (kind === 'lasers') {
        c.fillStyle = `rgba(0,0,0,${0.55 * fadeOut})`; c.fillRect(0, 0, W, H);
        c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 8; i++) {
          const a = el / 700 + i * 0.785;
          const col = COLORS[(i + Math.floor(el / 400)) % COLORS.length];
          c.strokeStyle = col; c.globalAlpha = 0.55 * fadeOut; c.lineWidth = 5 + Math.sin(el / 90 + i) * 3;
          c.beginPath(); c.moveTo(W / 2, H * 0.12); c.lineTo(W / 2 + Math.cos(a) * H, H * 0.12 + Math.abs(Math.sin(a)) * H); c.stroke();
        }
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      } else if (kind === 'fireworks') {
        c.fillStyle = `rgba(0,0,0,${0.5 * fadeOut})`; c.fillRect(0, 0, W, H);
        bursts.forEach((b) => {
          if (!b.done && el >= b.at) {
            b.done = true;
            for (let i = 0; i < 70; i++) { const a = R() * 6.283, sp = 1 + R() * 4.2; parts.push({ x: b.x, y: b.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, col: R() < 0.2 ? '#fff' : b.col, life: 1 }); }
          }
        });
        c.globalCompositeOperation = 'lighter';
        parts.forEach((p) => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.045; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.012;
          if (p.life <= 0) return;
          c.globalAlpha = Math.max(0, p.life) * fadeOut; c.fillStyle = p.col;
          c.beginPath(); c.arc(p.x, p.y, 1.8, 0, 6.283); c.fill();
        });
        parts = parts.filter((p) => p.life > 0);
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      } else if (kind === 'celebration') {
        parts.forEach((p) => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= 0.008;
          if (p.life <= 0) return;
          c.globalAlpha = Math.max(0, p.life) * fadeOut; c.fillStyle = p.col;
          c.save(); c.translate(p.x, p.y); c.rotate(el / 300);
          c.beginPath(); for (let j = 0; j < 4; j++) { c.lineTo(0, -p.r * 2); c.rotate(Math.PI / 4); c.lineTo(0, -p.r * 0.6); c.rotate(Math.PI / 4); } c.closePath(); c.fill(); c.restore();
        });
        c.globalAlpha = 1;
      } else if (kind === 'petals') {
        parts.forEach((p) => {
          p.y += p.vy; p.a += p.va; p.sway += 0.012;
          const x = p.x + Math.sin(p.sway) * 22;
          c.save(); c.translate(x, p.y); c.rotate(p.a + Math.sin(p.sway) * 0.4);
          c.globalAlpha = 0.5 * fadeOut;
          const g = c.createLinearGradient(0, -p.r, 0, p.r);
          g.addColorStop(0, '#ffd1e3'); g.addColorStop(1, '#f783ac');
          c.fillStyle = g;
          c.beginPath(); c.moveTo(0, -p.r * 1.4); c.quadraticCurveTo(p.r, -p.r * 0.2, 0, p.r); c.quadraticCurveTo(-p.r, -p.r * 0.2, 0, -p.r * 1.4); c.fill();
          c.restore();
        });
        c.globalAlpha = 1;
      } else if (kind === 'echo') {
        const txt = String(o.text || '…').slice(0, 28);
        c.font = '600 15px -apple-system, Helvetica, Arial, sans-serif';
        const tw = c.measureText(txt).width;
        parts.forEach((p) => {
          p.x += p.sp;
          c.save(); c.globalAlpha = 0.85 * fadeOut; c.translate(p.x, p.y); c.scale(p.s, p.s);
          c.fillStyle = o.color || '#0b84fe'; rr(0, 0, tw + 24, 30, 15); c.fill();
          c.fillStyle = '#fff'; c.fillText(txt, 12, 20); c.restore();
        });
      } else if (kind === 'spotlight') {
        const tx = ox, ty = oy;
        const sx = el < 1600 ? W * 0.2 + Math.sin(el / 300) * W * 0.3 : tx;
        const sy = el < 1600 ? H * 0.35 + Math.cos(el / 380) * H * 0.2 : ty;
        const g = c.createRadialGradient(sx, sy, 30, sx, sy, 120);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.78 * fadeOut})`);
        c.fillStyle = g; c.fillRect(0, 0, W, H);
      }
      if (el < T) requestAnimationFrame(frame);
      else cv.remove();
    }
    requestAnimationFrame(frame);
    return cv;
  };

  // ── misc ───────────────────────────────────────────────────────────────────
  M.photos = () => {
    let arr = [];
    try { arr = JC.store.all('photos') || []; } catch (e) { arr = []; }
    arr = arr.filter((p) => p && p.art);
    if (!arr.length) {
      arr = ['p_pier7_rod', 'p_bluefin', 'p_zl_pier', 'p_liuli_dinner', 'p_cranes_yujing', 'p_teucer_sirfang', 'p_harbor_day', 'p_siblings_snow', 'p_catch_1', 'p_mama_pelmeni', 'p_yujing_lanterns', 'p_zl_teahouse', 'p_hotpot_crew', 'p_morepesok', 'p_glaze_lily', 'p_catch_2']
        .map((art, i) => ({ id: 'mp_' + art, art, t: JC.time.now() - i * 3600e3 * 7 }));
    }
    return arr.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  };
  M.memos = () => {
    let arr = [];
    try { arr = JC.store.all('memos') || []; } catch (e) { arr = []; }
    return arr.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  };
  M.savePhoto = (art, extra) => {
    JC.store.add('photos', Object.assign({ art, t: JC.time.now(), albums: [], fav: false, people: [], kind: 'photo' }, extra || {}), { front: true });
    JC.ui.toast('Saved to Photos', { icon: 'square.and.arrow.down' });
  };

  /** in-world "Translate" */
  M.translate = (m) => {
    const who = m.from;
    const lines = {
      zl: ['Zhongli → English', '“I enjoyed the evening more than the bill would suggest.” (The bill was yours.)'],
      teucer: ['Little Brother → English', '“I miss you. Also please bring a toy.”'],
      tonia: ['Little Sister → English', '“I know you’re lying. I love you anyway. Tell me the truth.”'],
      anthon: ['Twelve-Year-Old → English', '“Respect.” (Grudging. Will deny it.)'],
      mama: ['Russian → English', '“Eat something. Wear a scarf. Call your mother.”'],
      papa: ['Russian → English', '“I am proud of you. I am worried about you. Both. Always.”'],
      ht: ['Hu Tao → English', '“I know something you don’t know. It’ll cost you. 👻”'],
      paimon: ['Paimon → English', '“Food. Food? FOOD.”'],
      lumine: ['Lumine → English', '“I’m not angry. I’m keeping a list.”'],
      signora: ['Corporate → English', '“Do as you’re told, Eleventh.”'],
      scara: ['Scaramouche → English', '“I know. I’m deciding what it’s worth.”'],
      dottore: ['Dottore → English', '(Translation withheld for your own wellbeing.)'],
      pulci: ['Grandfatherly → English', '“I know where your family is, Ajax.”'],
      ekat: ['Receptionist → English', '“Please be alive.”'],
      yelan: ['Spy → English', '“I already know. I want to hear you say it.”'],
      ops: ['Grunt → English', '“We are scared and we want pelmeni.”'],
      me: ['Childe → English', '“Everything is fine!” (Everything is not fine.)'],
    };
    const l = lines[who] || ['Detected: English', 'This message is already in English. Childe would just reply with a fish emoji. 🐟'];
    return JC.ui.alert({ title: 'Translate', message: l[0] + '\n\n' + l[1], buttons: [{ text: 'Copy Translation', onTap: () => { U.copy(l[1]); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }, { text: 'Done', style: 'default' }] });
  };
})();
