/* Reel Rush — "Snezhnaya Fun Factory". Night fishing off Pier 7.
   Tap to cast (the power bar sets how far out the hook lands). Hold to reel the hook up, release to let it sink.
   Touch a fish and it bites: then hold to reel and release to let it run, keeping the line's tension out of the red.
   120 seconds until the tide turns. Catches in a row build a streak multiplier. Bluefin are rare, deep and worth 500.
   Teucer's best is 2,047; Childe's is 1,998. Acts: game_catch { species, points } · game_score { score }. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;

  const W = 402;
  const GOAL = 2047;
  const ROUND = 120;
  const TUNE = {
    sink: 240, rise: 210, reel: 0.62, tensUp: 0.62, tensDown: 1.25, run: 0.09, escape: 1.3,
    surge: 0.22, surgeEvery: [1.6, 3.4], streakStep: 0.15, streakMax: 2, snapPenalty: 2,
  };
  // species: value, depth band (0 = surface, 1 = sea floor), speed px/s, body length px, strength, colours, spawn weight
  const SPECIES = [
    { id: 'sardine', name: 'Sardine', v: 25, d: [0.08, 0.4], spd: [70, 100], len: 22, str: 0.55, c: ['#d7e3ea', '#8aa3b4'], wt: 24 },
    { id: 'mackerel', name: 'Mackerel', v: 45, d: [0.25, 0.6], spd: [80, 120], len: 30, str: 0.85, c: ['#5fb7a8', '#2d5f78'], wt: 22, stripes: true },
    { id: 'puffer', name: 'Pufferfish', v: 70, d: [0.35, 0.7], spd: [28, 48], len: 26, str: 0.8, c: ['#f2d36b', '#b88a2c'], wt: 14, spiky: true },
    { id: 'crystal', name: 'Crystalfish', v: 110, d: [0.45, 0.8], spd: [130, 170], len: 24, str: 1.0, c: ['#a8f0ff', '#3fb6d9'], wt: 14, glow: true },
    { id: 'koi', name: 'Golden Koi', v: 170, d: [0.5, 0.85], spd: [48, 72], len: 36, str: 1.25, c: ['#ffcf4d', '#e0702b'], wt: 10 },
    { id: 'bluefin', name: 'Bluefin Tuna', v: 500, d: [0.82, 0.96], spd: [95, 130], len: 70, str: 1.6, c: ['#3a6db0', '#16294d'], wt: 3.5, rare: true },
  ];
  const BY = {};
  SPECIES.forEach((s) => { BY[s.id] = s; });

  JC.icon.add({
    trophy: '<path d="M7 4h10v4.5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
    'trophy.fill': '<path d="M7 4h10v4.5a5 5 0 0 1-10 0z" fill="currentColor" stroke="none"/><path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 13.5V17"/><path d="M8.5 20.5h7M9.5 17h5v3.5h-5z" fill="currentColor"/>',
    'speaker.slash': '<path d="M4 9.3h3l4.4-3.7c.5-.4 1.2 0 1.2.6v11.6c0 .6-.7 1-1.2.6L7 14.7H4a1 1 0 0 1-1-1V10.3a1 1 0 0 1 1-1z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    'fish.fill': '<path d="M3 12c3.5-4.5 9-6 13.5-3.5L21 5v14l-4.5-3.5C12 18 6.5 16.5 3 12z" fill="currentColor" stroke="none"/><circle cx="8" cy="11" r="1" fill="#fff" stroke="none"/>',
  });
  JC.appIcon.add('reelrush', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3a6b"/><stop offset=".48" stop-color="#14579a"/><stop offset=".5" stop-color="#0b6fa8"/><stop offset="1" stop-color="#062a4a"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><circle cx="46" cy="13" r="5" fill="#ffe9a6"/><path d="M8 4 C 24 10, 34 18, 38 30" stroke="#f0e6d2" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M38 30v12" stroke="#e8f4ff" stroke-width="1"/><path d="M38 42a3 3 0 1 1-3 3" stroke="#e8f4ff" stroke-width="1.6" fill="none"/><path d="M13 44c5-6 13-7.5 19-4l5-3.5v14l-5-3.5c-6 3.5-14 2-19-3z" fill="#ffcf4d"/><circle cx="18.5" cy="43.5" r="1.4" fill="#16294d"/><path d="M0 30c6 2 12 2 18 0s12-2 18 0 12 2 18 0 6 0 6 0" stroke="#7fc8ff" stroke-width="1.2" fill="none" opacity=".7"/></svg>`);

  // Childe's record on this phone. Teucer's 2,047 is the one that matters.
  JC.store.seed('reelrush', [{ id: 'me', best: 1998, plays: 57, last: 1998, beat: false }]);

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const prefs = () => (JC.state.d.settings.prefs || {});
  const sfxOn = () => prefs()['rr.sfx'] !== false && !JC.state.d.settings.silent;
  const hapticsOn = () => prefs()['rr.haptics'] !== false;
  const meterOn = () => prefs()['rr.meter'] !== false;
  const reduced = () => !!(JC.state.d.settings.reduceMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));

  // ── sound effects (WebAudio) ─────────────────────────────────────
  let noiseBuf = null;
  function sfx(kind) {
    if (!sfxOn()) return;
    const ctx = JC.audio.ctx && JC.audio.ctx();
    if (!ctx || ctx.state !== 'running') { if (ctx && ctx.state === 'suspended') ctx.resume(); return; }
    const out = JC.audio.out || ctx.destination;
    const t = ctx.currentTime + 0.005;
    const tone = (f0, f1, dur, type, gain, at) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t + (at || 0));
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + (at || 0) + dur);
      g.gain.setValueAtTime(0.0001, t + (at || 0));
      g.gain.exponentialRampToValueAtTime(gain || 0.12, t + (at || 0) + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (at || 0) + dur);
      o.connect(g); g.connect(out); o.start(t + (at || 0)); o.stop(t + (at || 0) + dur + 0.05);
    };
    const noise = (dur, freq, gain) => {
      if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(Math.max(80, freq / 6), t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    };
    switch (kind) {
      case 'cast': noise(0.25, 3000, 0.08); tone(900, 300, 0.22, 'triangle', 0.05); break;
      case 'plop': tone(420, 140, 0.16, 'sine', 0.14); noise(0.12, 1800, 0.05); break;
      case 'bite': tone(660, 990, 0.08, 'square', 0.05); tone(990, 0, 0.12, 'square', 0.04, 0.08); break;
      case 'reel': tone(1500 + Math.random() * 300, 0, 0.03, 'square', 0.015); break;
      case 'catch': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0, 0.22, 'triangle', 0.06, i * 0.06)); break;
      case 'big': [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, 0, 0.35, 'triangle', 0.07, i * 0.08)); break;
      case 'snap': noise(0.3, 5000, 0.12); tone(220, 80, 0.3, 'sawtooth', 0.06); break;
      case 'escape': tone(500, 250, 0.25, 'sine', 0.06); break;
      case 'over': [392, 329.63, 261.63].forEach((f, i) => tone(f, f * 0.98, 0.35, 'triangle', 0.08, i * 0.18)); break;
      case 'best': [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, 0, 0.3, 'triangle', 0.07, i * 0.09)); break;
      case 'tap': tone(1200, 0, 0.04, 'sine', 0.04); break;
      default: break;
    }
  }
  function buzz(ms) { if (hapticsOn()) JC.audio.haptic(ms); }

  JC.app({
    id: 'reelrush',
    name: 'Reel Rush',
    status: 'light',
    launch(win) {
      win.body.classList.add('app-reelrush');
      const canvas = h('canvas.rr-canvas');
      const hud = h('div.rr-hud');
      const ui = h('div.rr-ui');
      win.body.append(canvas, hud, ui);
      const ctx2 = canvas.getContext('2d');
      let H = 874, dpr = 1;
      function resize() {
        H = win.body.clientHeight || JC.os.H || 874;
        dpr = Math.min(2, window.devicePixelRatio || 1) * Math.max(1, (JC.os && JC.os.scale) || 1);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
      }
      resize();
      const offs = [];
      offs.push(JC.bus.on('layout', () => setTimeout(resize, 50)));
      offs.push(JC.bus.on('lock', () => { if (G && G.mode === 'play') pause(); }));
      offs.push(JC.bus.on('story:call', () => { if (G && G.mode === 'play') pause(); }));

      const rec = () => JC.store.get('reelrush', 'me') || { best: 1998, plays: 0 };
      const best = () => rec().best || 0;

      // geometry
      const SURF = () => Math.round(H * 0.34);
      const FLOOR = () => H - 70;
      const depthY = (d) => SURF() + 18 + d * (FLOOR() - SURF() - 30);
      const ROD = () => ({ x: 70, y: SURF() - 96 });

      const SR = rng(711);
      const stars = Array.from({ length: 60 }, () => ({ x: SR() * W, y: SR() * 260, r: SR() * 1.2 + 0.3, tw: SR() * 6 }));
      const skyline = Array.from({ length: 16 }, (_, i) => ({ x: 150 + i * 17 + SR() * 6, w: 10 + SR() * 12, h: 14 + SR() * 46, roof: SR() < 0.4 }));
      const lanterns = Array.from({ length: 9 }, () => ({ x: 150 + SR() * 250, y: SR() * 40, p: SR() * 6 }));

      // ── game state ───────────────────────────────────────────────
      let G = null;
      function newGame(mode) {
        const seed = (Date.now() ^ 0x5bd1e995) >>> 0;
        G = {
          mode: mode || 'play', t: 0, left: ROUND, R: rng(seed), score: 0, catches: 0, streak: 0, bestStreak: 0, snaps: 0, bluefin: 0, log: [],
          phase: 'aim', power: 0, pdir: 1, hook: null, fish: [], spawnT: 0, hooked: null, tension: 0, dist: 0, surgeT: 2, holding: false, penalty: 0,
          parts: [], pops: [], ripple: [], landed: null, overShown: false, reelTick: 0,
        };
        for (let i = 0; i < 7; i++) spawn(true);
        paintHud();
      }
      function pickSpecies() {
        const R = G.R;
        const pool = SPECIES.filter((s) => !(s.rare && G.fish.some((f) => f.sp.rare)));
        const tot = pool.reduce((a, s) => a + s.wt, 0);
        let x = R() * tot;
        for (const s of pool) { x -= s.wt; if (x <= 0) return s; }
        return pool[0];
      }
      function spawn(initial) {
        const R = G.R;
        const sp = pickSpecies();
        const dir = R() < 0.5 ? 1 : -1;
        const d = sp.d[0] + R() * (sp.d[1] - sp.d[0]);
        const size = 0.85 + R() * 0.5;
        const x = initial ? 40 + R() * (W - 80) : dir > 0 ? -sp.len * 2 : W + sp.len * 2;
        G.fish.push({ sp, dir, d, y: depthY(d), x, size, v: sp.spd[0] + R() * (sp.spd[1] - sp.spd[0]), wob: R() * 6, id: Math.round(R() * 1e9) });
      }

      // ── input ────────────────────────────────────────────────────
      function press() {
        if (!G || G.mode !== 'play') return;
        G.holding = true;
        if (G.phase === 'aim' && G.penalty <= 0) cast();
      }
      function release() { if (G) G.holding = false; }
      function cast() {
        const p = G.power;
        G.hook = { x: 120 + p * (W - 150), y: SURF(), vy: 0, state: 'fly', ft: 0, x0: ROD().x, y0: ROD().y };
        G.phase = 'cast';
        G.holding = false;
        sfx('cast'); buzz(8);
      }
      const isUi = (e) => !!e.target.closest('.rr-btn, .rr-panel, .rr-pause');
      canvas.addEventListener('pointerdown', (e) => {
        if (isUi(e)) return;
        if (G && G.mode === 'play') { e.preventDefault(); press(); }
        else if (G && G.mode === 'title' && !ui.querySelector('.rr-panel')) start();
      });
      const up = () => release();
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      canvas.__tap = true;
      const covered = () => !!(win.overlays.querySelector('.sheet, .alert, .action-sheet') || document.querySelector('#screen .alert'));
      const onKey = (e) => {
        if (!JC.os.isOpen('reelrush') || JC.kb.visible || !G || covered()) return;
        if (e.code === 'Space' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (e.type === 'keyup') { release(); return; }
          if (e.repeat) return;
          if (G.mode === 'play') press();
          else if (G.mode === 'title') start();
          else if (G.mode === 'over' && G.overShown) start();
        } else if (e.type === 'keydown' && (e.key === 'p' || e.key === 'P')) {
          if (G.mode === 'play') pause(); else if (G.mode === 'paused') resume();
        }
      };
      window.addEventListener('keydown', onKey);
      window.addEventListener('keyup', onKey);

      // ── update ───────────────────────────────────────────────────
      function update(dt) {
        if (!G) return;
        G.t += dt;
        // fish swim (always, also on the title screen)
        G.fish.forEach((f) => {
          if (f === (G.hooked && G.hooked.f)) return;
          f.x += f.dir * f.v * dt * (G.mode === 'play' ? 1 : 0.6);
          f.wob += dt * 3;
          f.y = depthY(f.d) + Math.sin(f.wob) * 4;
        });
        G.fish = G.fish.filter((f) => f.x > -140 && f.x < W + 140);
        G.spawnT -= dt;
        if (G.spawnT <= 0 && G.fish.length < 9) { spawn(false); G.spawnT = 0.5 + G.R() * 0.9; }
        G.ripple.forEach((r) => { r.r += dt * 60; r.a -= dt * 0.9; });
        G.ripple = G.ripple.filter((r) => r.a > 0);
        G.pops.forEach((p) => { p.y -= dt * 30; p.life -= dt; });
        G.pops = G.pops.filter((p) => p.life > 0);
        G.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; p.life -= dt; });
        G.parts = G.parts.filter((p) => p.life > 0);
        if (G.mode !== 'play') return;

        G.left -= dt;
        if (G.left <= 0) { G.left = 0; if (G.phase !== 'fight') { gameOver(); return; } }
        if (G.penalty > 0) G.penalty -= dt;

        if (G.phase === 'aim') {
          G.power += G.pdir * dt * 0.9;
          if (G.power > 1) { G.power = 1; G.pdir = -1; }
          if (G.power < 0) { G.power = 0; G.pdir = 1; }
        } else if (G.phase === 'cast') {
          const k = G.hook;
          k.ft += dt / 0.55;
          if (k.ft >= 1) { k.state = 'sink'; k.y = SURF(); G.phase = 'sink'; G.ripple.push({ x: k.x, y: SURF(), r: 4, a: 1 }); sfx('plop'); }
        } else if (G.phase === 'sink') {
          const k = G.hook;
          if (G.holding) {
            k.y -= TUNE.rise * dt;
            G.reelTick -= dt; if (G.reelTick <= 0) { sfx('reel'); G.reelTick = 0.08; }
            k.x += (ROD().x + 40 - k.x) * dt * 0.25;
            if (k.y <= SURF()) { G.phase = 'aim'; G.hook = null; G.streak = 0; G.pops.push({ x: k.x, y: SURF() - 20, text: 'Reeled in empty', life: 1, c: '#cfe3f5' }); paintHud(); return; }
          } else k.y = Math.min(FLOOR() - 10, k.y + TUNE.sink * dt);
          // bite?
          for (const f of G.fish) {
            const dx = Math.abs(f.x - k.x), dy = Math.abs(f.y - k.y);
            if (dx < f.sp.len * f.size * 0.55 && dy < 12 * f.size) { hookFish(f); break; }
          }
        } else if (G.phase === 'fight') fight(dt);
        else if (G.phase === 'landed') {
          G.landed.t -= dt;
          if (G.landed.t <= 0) { G.landed = null; G.phase = 'aim'; G.hook = null; if (G.left <= 0) gameOver(); }
        }
        paintHud();
      }
      function hookFish(f) {
        G.phase = 'fight';
        G.hooked = { f, sp: f.sp };
        G.tension = 0.35;
        G.dist = 1;
        G.surgeT = TUNE.surgeEvery[0] + G.R() * (TUNE.surgeEvery[1] - TUNE.surgeEvery[0]);
        f.dir = f.x > G.hook.x ? 1 : -1;
        sfx('bite'); buzz(25);
        G.pops.push({ x: f.x, y: f.y - 24, text: 'Fish on!', life: 0.9, c: '#ffd36b', big: true });
        if (f.sp.spiky) G.tension = 0.6;
      }
      function fight(dt) {
        const H2 = G.hooked, sp = H2.sp, f = H2.f, k = G.hook;
        const str = sp.str * (0.85 + f.size * 0.2);
        if (G.holding) {
          G.dist -= (TUNE.reel / Math.sqrt(str)) * dt;
          G.tension += TUNE.tensUp * str * dt * (sp.spiky ? 1.35 : 1);
          G.reelTick -= dt; if (G.reelTick <= 0) { sfx('reel'); G.reelTick = 0.06; }
        } else {
          G.tension -= TUNE.tensDown * dt;
          G.dist += TUNE.run * str * dt;
        }
        G.surgeT -= dt;
        if (G.surgeT <= 0) {
          G.tension += TUNE.surge * (0.6 + G.R() * 0.8) * Math.min(1.6, str);
          G.dist += 0.04 * str;
          G.surgeT = TUNE.surgeEvery[0] + G.R() * (TUNE.surgeEvery[1] - TUNE.surgeEvery[0]);
          buzz(12);
          for (let i = 0; i < 6; i++) G.parts.push({ x: k.x, y: k.y, vx: (G.R() - 0.5) * 60, vy: -20 - G.R() * 40, life: 0.6, c: 'rgba(200,230,255,.8)', r: 2 });
        }
        G.tension = Math.max(0, G.tension);
        // the fish pulls the hook around while it fights
        const ty = depthY(Math.max(0, Math.min(1, f.d * G.dist)));
        k.y += (ty - k.y) * dt * 3;
        k.x += (Math.sin(G.t * 2.2 + f.wob) * 60 + (ROD().x + 60 + (W - 140) * G.dist * 0.7) - k.x) * dt * 1.5;
        f.x = k.x + f.dir * f.sp.len * f.size * 0.45;
        f.y = k.y;
        if (G.tension >= 1) { snap(); return; }
        if (G.dist >= TUNE.escape) { escape(); return; }
        if (G.dist <= 0) land();
      }
      function snap() {
        sfx('snap'); buzz(40);
        G.pops.push({ x: G.hook.x, y: G.hook.y - 20, text: 'SNAP!', life: 1.2, c: '#ff6b6b', big: true });
        G.fish = G.fish.filter((x) => x !== G.hooked.f);
        G.hooked = null; G.hook = null; G.phase = 'aim'; G.streak = 0; G.snaps++; G.penalty = TUNE.snapPenalty; G.tension = 0;
        paintHud();
      }
      function escape() {
        sfx('escape');
        G.pops.push({ x: G.hook.x, y: G.hook.y - 20, text: 'It got away…', life: 1.1, c: '#cfe3f5' });
        const f = G.hooked.f; f.dir = f.x > W / 2 ? 1 : -1; f.v *= 1.6;
        G.hooked = null; G.hook = null; G.phase = 'aim'; G.streak = 0; G.tension = 0;
        paintHud();
      }
      function land() {
        const f = G.hooked.f, sp = f.sp;
        const mult = Math.min(TUNE.streakMax, 1 + G.streak * TUNE.streakStep);
        const pts = Math.round(sp.v * f.size * mult);
        G.score += pts; G.catches++; G.streak++; G.bestStreak = Math.max(G.bestStreak, G.streak);
        if (sp.id === 'bluefin') G.bluefin++;
        const kg = Math.round((sp.v / 20) * f.size * (sp.id === 'bluefin' ? 22 : 1) * 10) / 10;
        G.log.push({ sp: sp.id, pts, kg });
        G.fish = G.fish.filter((x) => x !== f);
        G.landed = { sp, pts, kg, t: sp.id === 'bluefin' ? 2.2 : 1.1, mult };
        G.phase = 'landed'; G.hooked = null; G.tension = 0;
        sfx(sp.id === 'bluefin' || sp.id === 'koi' ? 'big' : 'catch'); buzz(sp.id === 'bluefin' ? 60 : 20);
        G.pops.push({ x: ROD().x + 70, y: SURF() - 40, text: '+' + pts + (mult > 1 ? '  ×' + mult.toFixed(2).replace(/0$/, '').replace(/\.$/, '') : ''), life: 1.4, c: '#ffe08a', big: true });
        for (let i = 0; i < 14; i++) G.parts.push({ x: ROD().x + 60, y: SURF(), vx: (G.R() - 0.5) * 120, vy: -40 - G.R() * 80, life: 0.8, c: 'rgba(160,215,255,.9)', r: 2.2 });
        try { JC.story.act('game_catch', { species: sp.id, points: pts }); } catch (e) { /* ignore */ }
        paintHud();
      }

      // ── drawing ──────────────────────────────────────────────────
      function fishPath(c, f, x, y, s, dir) {
        const L = f.sp.len * s, Hh = L * (f.sp.id === 'bluefin' ? 0.32 : f.sp.spiky ? 0.55 : 0.36);
        c.save(); c.translate(x, y); c.scale(dir, 1);
        const g = c.createLinearGradient(0, -Hh, 0, Hh);
        g.addColorStop(0, f.sp.c[1]); g.addColorStop(0.55, f.sp.c[0]); g.addColorStop(1, '#f4f8fb');
        if (f.sp.glow) { c.shadowColor = '#7fe8ff'; c.shadowBlur = 14; }
        c.fillStyle = g;
        c.beginPath(); c.ellipse(0, 0, L / 2, Hh / 2, 0, 0, Math.PI * 2); c.fill();
        c.shadowBlur = 0;
        c.beginPath(); c.moveTo(-L / 2 + 2, 0); c.lineTo(-L / 2 - L * 0.28, -Hh * 0.5); c.lineTo(-L / 2 - L * 0.22, 0); c.lineTo(-L / 2 - L * 0.28, Hh * 0.5); c.closePath(); c.fillStyle = f.sp.c[1]; c.fill();
        if (f.sp.stripes) { c.strokeStyle = 'rgba(20,40,60,.45)'; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * L * 0.1, -Hh * 0.45); c.quadraticCurveTo(i * L * 0.1 + 3, 0, i * L * 0.1, -Hh * 0.05); c.stroke(); } }
        if (f.sp.spiky) { c.strokeStyle = f.sp.c[1]; c.lineWidth = 1.4; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * L * 0.42, Math.sin(a) * Hh * 0.42); c.lineTo(Math.cos(a) * L * 0.58, Math.sin(a) * Hh * 0.62); c.stroke(); } }
        if (f.sp.id === 'bluefin') { c.fillStyle = '#ffd34d'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-L * 0.05 - i * L * 0.07, Hh * 0.42); c.lineTo(-L * 0.08 - i * L * 0.07, Hh * 0.62); c.lineTo(-L * 0.11 - i * L * 0.07, Hh * 0.42); c.fill(); } }
        c.fillStyle = '#fff'; c.beginPath(); c.arc(L * 0.3, -Hh * 0.1, Math.max(1.6, L * 0.05), 0, Math.PI * 2); c.fill();
        c.fillStyle = '#10202f'; c.beginPath(); c.arc(L * 0.31, -Hh * 0.1, Math.max(0.9, L * 0.028), 0, Math.PI * 2); c.fill();
        c.restore();
      }
      function draw() {
        const c = ctx2;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        const S = SURF(), F = FLOOR();
        // sky
        let g = c.createLinearGradient(0, 0, 0, S);
        g.addColorStop(0, '#0b1430'); g.addColorStop(0.7, '#1d2f5c'); g.addColorStop(1, '#41557f');
        c.fillStyle = g; c.fillRect(0, 0, W, S);
        const tt = performance.now() / 1000;
        stars.forEach((s) => { if (s.y > S - 40) return; c.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(tt * 1.3 + s.tw)); c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill(); });
        c.globalAlpha = 1;
        // moon
        c.fillStyle = '#fff4cf'; c.beginPath(); c.arc(330, 70, 22, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,244,207,.12)'; c.beginPath(); c.arc(330, 70, 40, 0, Math.PI * 2); c.fill();
        // Liyue skyline across the harbor + Jade Chamber
        c.fillStyle = '#16203d';
        skyline.forEach((b) => { c.fillRect(b.x, S - b.h, b.w, b.h); if (b.roof) { c.beginPath(); c.moveTo(b.x - 4, S - b.h); c.lineTo(b.x + b.w / 2, S - b.h - 7); c.lineTo(b.x + b.w + 4, S - b.h); c.fill(); } });
        c.fillStyle = '#1b2848'; c.beginPath(); c.ellipse(300, S - 92, 34, 9, 0, 0, Math.PI * 2); c.fill(); c.fillRect(296, S - 92, 8, 36);
        lanterns.forEach((l) => { c.fillStyle = 'rgba(255,170,90,' + (0.6 + 0.4 * Math.sin(tt * 2 + l.p)) + ')'; c.beginPath(); c.arc(l.x, S - 60 + l.y, 2.2, 0, Math.PI * 2); c.fill(); });
        // water
        g = c.createLinearGradient(0, S, 0, H);
        g.addColorStop(0, '#1f5f8f'); g.addColorStop(0.35, '#123f69'); g.addColorStop(1, '#04152b');
        c.fillStyle = g; c.fillRect(0, S, W, H - S);
        c.fillStyle = 'rgba(255,244,207,.18)';
        for (let i = 0; i < 8; i++) c.fillRect(300 + Math.sin(tt * 1.5 + i) * 6 - 10 + i * 2, S + 6 + i * 9, 30 - i * 3, 2);
        c.strokeStyle = 'rgba(160,210,255,.35)'; c.lineWidth = 1.5; c.beginPath();
        for (let x = 0; x <= W; x += 6) c.lineTo(x, S + Math.sin(x / 22 + tt * 1.8) * 2.2);
        c.stroke();
        // light shafts
        c.fillStyle = 'rgba(255,255,255,.03)';
        for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(60 + i * 95, S); c.lineTo(100 + i * 95, S); c.lineTo(60 + i * 95 + 70, F); c.lineTo(20 + i * 95 + 70, F); c.fill(); }
        // sea floor + Guyun pillar silhouettes
        c.fillStyle = '#071b30'; c.beginPath(); c.moveTo(0, F); for (let x = 0; x <= W; x += 20) c.lineTo(x, F - 6 - Math.sin(x / 40) * 6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.fillStyle = '#0a2440'; [[330, 200], [365, 150], [300, 120]].forEach(([x, hh]) => { c.beginPath(); c.moveTo(x - 10, F); c.lineTo(x - 4, F - hh); c.lineTo(x + 6, F - hh + 10); c.lineTo(x + 12, F); c.fill(); });
        c.fillStyle = '#2f6d4f'; for (let i = 0; i < 10; i++) { const x = 20 + i * 38; c.beginPath(); c.moveTo(x, F); c.quadraticCurveTo(x + Math.sin(tt + i) * 8, F - 30, x + 4, F - 46); c.quadraticCurveTo(x + 6, F - 24, x + 8, F); c.fill(); }
        // fish
        G && G.fish.forEach((f) => fishPath(c, f, f.x, f.y, f.size, f.dir));
        // pier (left)
        c.fillStyle = '#3a2a1c'; c.fillRect(0, S - 64, 104, 10);
        c.fillStyle = '#2a1e14'; [12, 52, 92].forEach((x) => c.fillRect(x, S - 54, 8, 90));
        c.fillStyle = '#4b3726'; c.fillRect(0, S - 70, 104, 6);
        // bench + a little figure fishing
        c.fillStyle = '#20160e'; c.fillRect(22, S - 84, 34, 4); c.fillRect(24, S - 80, 3, 10); c.fillRect(51, S - 80, 3, 10);
        c.fillStyle = '#c0532a'; c.beginPath(); c.arc(46, S - 100, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#1b2236'; c.fillRect(40, S - 94, 12, 16);
        c.fillStyle = '#c8463a'; c.fillRect(40, S - 92, 12, 3);
        const rod = ROD();
        c.strokeStyle = '#d9c7a6'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(50, S - 86); c.lineTo(rod.x, rod.y); c.stroke();
        // line + hook
        if (G && G.hook) {
          const k = G.hook;
          let hx = k.x, hy = k.y;
          if (G.phase === 'cast') { const p = Math.min(1, k.ft); hx = rod.x + (k.x - rod.x) * p; hy = rod.y + (S - rod.y) * p - Math.sin(p * Math.PI) * 120; }
          c.strokeStyle = G.phase === 'fight' && G.tension > 0.85 ? 'rgba(255,120,120,.95)' : 'rgba(230,240,255,.8)';
          c.lineWidth = 1;
          c.beginPath(); c.moveTo(rod.x, rod.y);
          if (G.phase === 'cast') c.lineTo(hx, hy); else { c.quadraticCurveTo((rod.x + hx) / 2, Math.min(S, (rod.y + hy) / 2) + (G.phase === 'fight' ? 0 : 30), hx, hy); }
          c.stroke();
          if (G.phase !== 'cast') { c.fillStyle = '#ff5a4f'; c.beginPath(); c.arc(hx, S - 1, 3.5, 0, Math.PI * 2); c.fill(); }
          c.strokeStyle = '#e9eef5'; c.lineWidth = 1.6; c.beginPath(); c.arc(hx, hy + 4, 4, Math.PI * 0.1, Math.PI * 1.1); c.stroke();
        }
        // aim power bar
        if (G && G.mode === 'play' && G.phase === 'aim') {
          const x0 = 120, x1 = W - 30, y = S - 22;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x0, y, x1 - x0, 8);
          const px = x0 + G.power * (x1 - x0);
          c.fillStyle = G.penalty > 0 ? '#8a8a8a' : '#ffd36b'; c.fillRect(px - 3, y - 4, 6, 16);
          c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 12px -apple-system, Inter, sans-serif'; c.textAlign = 'center';
          c.fillText(G.penalty > 0 ? 'Re-tying the line…' : 'Tap to cast', W / 2 + 40, y - 10);
        }
        // tension meter
        if (G && G.phase === 'fight' && meterOn()) {
          const x = W - 34, y0 = S + 40, hh = 220;
          c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(x, y0, 14, hh);
          c.fillStyle = 'rgba(70,200,120,.45)'; c.fillRect(x, y0 + hh * 0.2, 14, hh * 0.55);
          c.fillStyle = 'rgba(255,90,90,.55)'; c.fillRect(x, y0, 14, hh * 0.15);
          const ty = y0 + hh * (1 - Math.min(1, G.tension));
          c.fillStyle = '#fff'; c.fillRect(x - 4, ty - 2, 22, 4);
          c.font = '700 10px -apple-system, Inter, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#e8f4ff';
          c.fillText('LINE', x + 7, y0 - 8);
          // distance bar
          const dx0 = 40, dx1 = W - 70, dy = H - 40;
          c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(dx0, dy, dx1 - dx0, 6);
          c.fillStyle = '#7fd0ff'; c.fillRect(dx0, dy, (dx1 - dx0) * Math.max(0, Math.min(1, G.dist / TUNE.escape)), 6);
          c.fillStyle = 'rgba(255,255,255,.9)'; c.textAlign = 'left'; c.fillText(G.holding ? 'Reeling — release before the line goes red' : 'Hold to reel', dx0, dy - 6);
        }
        // landed card
        if (G && G.landed) {
          const L = G.landed;
          c.fillStyle = 'rgba(8,20,40,.78)';
          const bw = 250, bh = 120, bx = (W - bw) / 2, by = S - 170;
          c.beginPath(); c.roundRect ? c.roundRect(bx, by, bw, bh, 16) : c.rect(bx, by, bw, bh); c.fill();
          fishPath(c, { sp: L.sp }, W / 2, by + 44, L.sp.id === 'bluefin' ? 1.3 : 1.6, 1);
          c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '700 16px -apple-system, Inter, sans-serif';
          c.fillText(L.sp.name + ' · ' + L.kg + ' kg', W / 2, by + 88);
          c.fillStyle = '#ffd36b'; c.font = '800 14px -apple-system, Inter, sans-serif';
          c.fillText('+' + L.pts, W / 2, by + 108);
        }
        // ripples, particles, pops
        if (G) {
          G.ripple.forEach((r) => { c.strokeStyle = 'rgba(220,240,255,' + r.a + ')'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(r.x, r.y, r.r, r.r * 0.3, 0, 0, Math.PI * 2); c.stroke(); });
          G.parts.forEach((p) => { c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, p.r, 0, Math.PI * 2); c.fill(); });
          c.globalAlpha = 1;
          G.pops.forEach((p) => { c.globalAlpha = Math.min(1, p.life * 1.5); c.fillStyle = p.c; c.textAlign = 'center'; c.font = (p.big ? '800 18px' : '600 13px') + ' -apple-system, Inter, sans-serif'; c.fillText(p.text, p.x, p.y); });
          c.globalAlpha = 1;
        }
      }

      // ── HUD & panels ─────────────────────────────────────────────
      function paintHud() {
        hud.innerHTML = '';
        if (!G || G.mode === 'title') return;
        const mult = Math.min(TUNE.streakMax, 1 + G.streak * TUNE.streakStep);
        hud.append(
          h('div.rr-hs', h('div.rr-score', G.score.toLocaleString('en-US')), h('div.rr-sub', 'Best ' + best().toLocaleString('en-US') + ' · Teucer 2,047')),
          h('div.rr-hr', h('div.rr-time', { class: { low: G.left < 15 } }, Math.ceil(G.left) + 's'), h('div.rr-streak', G.streak ? '🐟 ×' + mult.toFixed(2).replace(/0$/, '').replace(/\.$/, '') : '')),
          G.mode === 'play' ? h('div.rr-pause.tap', { onTap: () => pause() }, JC.icon('pause.fill', { size: 16 })) : null);
      }
      const btn = (t, icon, fn, cls) => h('div.rr-btn.tap', { class: cls, onTap: (e) => { e.stopPropagation(); sfx('tap'); fn(); } }, icon ? JC.icon(icon, { size: 17 }) : null, h('span', t));
      function showTitle() {
        newGame('title');
        ui.innerHTML = '';
        ui.append(h('div.rr-title',
          h('div.rr-logo', 'REEL RUSH'), h('div.rr-tag', 'Night fishing · Pier 7'),
          h('div.rr-best', 'Your best ' + best().toLocaleString('en-US'), h('span', ' · Teucer 2,047 👑')),
          btn('Play', 'play.fill', () => start(), 'primary'),
          h('div.rr-row', btn('Leaderboard', 'trophy', () => leaderboard()), btn('How to Play', 'questionmark.circle', () => howTo())),
          h('div.rr-row', btn('Settings', 'gearshape.fill', () => settingsSheet()))));
        paintHud();
      }
      function start() {
        ui.innerHTML = '';
        newGame('play');
        const r = rec();
        JC.store.update('reelrush', 'me', { plays: (r.plays || 0) + 1 });
        last = performance.now();
        startLoop();
      }
      function pause() {
        if (!G || G.mode !== 'play') return;
        G.mode = 'paused'; G.holding = false;
        ui.innerHTML = '';
        ui.append(h('div.rr-panel',
          h('div.rr-ph', 'Paused'),
          h('div.rr-pstats', h('div', h('b', G.score.toLocaleString('en-US')), h('span', 'Score')), h('div', h('b', String(G.catches)), h('span', 'Fish')), h('div', h('b', Math.ceil(G.left) + 's'), h('span', 'Left'))),
          btn('Resume', 'play.fill', () => resume(), 'primary'),
          btn('Restart', 'arrow.clockwise', () => start()),
          btn('Quit to Title', 'xmark', () => showTitle())));
        paintHud();
      }
      function resume() {
        if (!G || G.mode !== 'paused') return;
        ui.innerHTML = '';
        G.mode = 'play';
        last = performance.now();
        paintHud();
      }
      function gameOver() {
        if (!G || G.mode === 'over') return;
        G.mode = 'over'; G.holding = false;
        const score = G.score;
        const prevBest = best();
        const newBest = score > prevBest;
        const r = rec();
        JC.store.update('reelrush', 'me', { best: Math.max(prevBest, score), last: score, beat: r.beat || score > GOAL });
        try { JC.story.act('game_score', { score, catches: G.catches, bluefin: G.bluefin }); } catch (e) { /* ignore */ }
        sfx(newBest ? 'best' : 'over');
        setTimeout(() => {
          if (!G || G.mode !== 'over') return;
          G.overShown = true;
          ui.innerHTML = '';
          const beat = score > GOAL;
          const pct = Math.min(1, score / GOAL);
          const short = (GOAL + 1 - score).toLocaleString('en-US');
          const msg = beat ? h('div.rr-msg', 'Teucer is going to be ', h('b', 'devastated'), '. (And very proud.)')
            : newBest ? h('div.rr-msg', 'New personal best! ', h('b', short), ' more to beat Teucer.')
              : h('div.rr-msg', h('b', short), ' points short of Teucer’s 2,047. Bluefin swim deep.');
          ui.append(h('div.rr-panel.over', { class: { beat } },
            h('div.rr-ph', beat ? 'You beat Teucer!' : 'The tide turned'),
            h('div.rr-final', score.toLocaleString('en-US')),
            newBest ? h('div.rr-newbest', 'NEW BEST') : h('div.rr-bestline', 'Best: ' + prevBest.toLocaleString('en-US')),
            h('div.rr-prog', h('div.rr-prog-bar', h('i', { style: { width: Math.max(4, Math.round(pct * 100)) + '%' } })), h('div.rr-prog-l', h('span', 'You · ' + score.toLocaleString('en-US')), h('span', 'Teucer · 2,047'))),
            msg,
            h('div.rr-pstats', h('div', h('b', String(G.catches)), h('span', 'Fish')), h('div', h('b', String(G.bestStreak)), h('span', 'Best streak')), h('div', h('b', String(G.bluefin)), h('span', 'Bluefin'))),
            btn('Play Again', 'arrow.clockwise', () => start(), 'primary'),
            h('div.rr-row', btn('Leaderboard', 'trophy', () => leaderboard()), btn('Share', 'square.and.arrow.up', () => JC.ui.share({ title: 'Reel Rush · ' + score.toLocaleString('en-US'), subtitle: G.catches + ' fish · Pier 7', icon: 'fish.fill', payload: { kind: 'text', text: 'Reel Rush: ' + score.toLocaleString('en-US') + ' (' + G.catches + ' fish' + (G.bluefin ? ', ' + G.bluefin + ' bluefin' : '') + ') 🎣' } })))));
        }, 900);
      }
      function leaderboard() {
        const me = best();
        let tab = 0;
        JC.ui.sheet({
          title: 'Reel Rush', detent: 'large', right: { text: 'Done' }, cls: 'rr-lb',
          content: (s) => {
            const friends = [
              { n: 'Teucer', h: 'teucer_fishking · Oct 15 · “I AM THE CHAMPION”', v: 2047, av: 'teucer' },
              { n: 'TheEleventhFish', h: 'You', v: me, av: 'me', me: true },
              { n: 'Anthon', h: 'anthon_the_great', v: 1701, av: 'anthon' },
              { n: 'Lumine', h: 'traveler.l · “I don’t even like fishing”', v: 1240, av: 'lumine' },
              { n: 'Paimon', h: 'emergencyfood · ate the bait', v: 12, av: 'paimon' },
            ].sort((a, b) => b.v - a.v);
            const AV = (n, g) => ({ initials: n, grad: g });
            const global = [
              { n: 'crux.captain', h: 'Liyue Harbor', v: 9410, av: AV('CC', ['#ffd166', '#c2410c']) },
              { n: 'fontaine_fisher', h: 'Court of Fontaine', v: 6120, av: AV('FF', ['#74c0fc', '#1c7ed6']) },
              { n: 'xiangling_cooks', h: 'Liyue Harbor', v: 4404, av: AV('XL', ['#ff922b', '#e8590c']) },
              { n: 'teucer_fishking', h: 'Morepesok', v: 2047, av: 'teucer' },
              { n: 'TheEleventhFish', h: 'You', v: me, av: 'me', me: true },
            ].sort((a, b) => b.v - a.v);
            const list = tab ? global : friends;
            const rows = list.map((p, i) => ({
              icon: { node: h('div.rr-rank', String(i + 1)) }, avatar: p.av, title: p.n + (p.me ? ' (You)' : ''), subtitle: p.h || null, detail: p.v.toLocaleString('en-US'),
              cls: [p.me ? 'rr-me' : '', i === 0 ? 'rr-top' : ''].join(' ').trim() || null,
              onTap: () => (p.me ? JC.ui.toast('Your best: ' + p.v.toLocaleString('en-US'), { icon: 'trophy.fill' })
                : p.av === 'teucer' ? JC.ui.alert({ title: 'Challenge Teucer?', message: 'Beat 2,047 and Game Center will tell him. He will not take it well. (He will tell everyone at school anyway.)', buttons: [{ text: 'Not Now' }, { text: 'Play', primary: true, onTap: () => { if (s.close) s.close(); start(); } }] })
                  : JC.ui.toast(p.n + ' · ' + p.v.toLocaleString('en-US'), { icon: 'person.crop.circle' })),
            }));
            return [h('div.rr-lb-head', h('div.rr-lb-ic', JC.icon('trophy.fill', { size: 30 })), h('div.rr-lb-t', 'High Score'), h('div.rr-lb-s', 'All Time · Snezhnaya Fun Factory')),
              h('div.rr-lb-seg', JC.ui.segmented({ items: ['Friends', 'All Players'], value: tab, onChange: (i) => { tab = i; s.render(); } })),
              JC.ui.list([{ rows, footer: tab ? 'Top scores from players near Liyue Harbor.' : 'Teucer set 2,047 on Thursday and voice-noted the whole family. Anthon says the game is rigged. Paimon ate the bait.' }])];
          },
        });
      }
      function howTo() {
        const items = [
          ['hand.tap.fill', '#ffd36b', 'Cast', 'The marker swings along the bar. Tap to cast — further out is deeper water and bigger fish.'],
          ['arrow.up', '#7fd0ff', 'Hold to raise, let go to sink', 'While the hook sinks, hold to pull it up and let go to let it drop. Touch a fish and it bites.'],
          ['exclamationmark.triangle.fill', '#ff6b6b', 'Watch the line', 'Once a fish bites, hold to reel it in — but tension builds while you reel. Let go before the meter hits red or the line snaps. Let go too long and the fish swims off.'],
          ['flame.fill', '#ff9500', 'Streaks', 'Every catch in a row raises your multiplier, up to ×2. Snapping a line or losing a fish resets it.'],
          ['fish.fill', '#3a6db0', 'Bluefin', 'Rare, deep and strong — worth 500 before the multiplier. Pufferfish are spiky: the line tenses fast.'],
          ['timer', '#30b0c7', 'Two minutes', 'You have 120 seconds before the tide turns. Teucer’s best is 2,047.'],
        ];
        JC.ui.sheet({
          title: 'How to Play', detent: 'large', right: { text: 'Got It' }, cls: 'rr-how',
          content: () => [h('div.rr-howto',
            h('div.rr-how-hero', JC.appIcon('reelrush'), h('div.rr-how-hero-t', 'Catch as many fish as you can before the tide turns.')),
            items.map(([ic, c, t, b]) => h('div.rr-how-i', h('div.rr-how-ic', { style: { '--c': c } }, JC.icon(ic, { size: 20 })), h('div', h('div.rr-how-t', t), h('div.rr-how-b', b)))),
            h('div.rr-how-sp', SPECIES.map((sp) => h('div.rr-sp', h('b', sp.name), h('span', sp.v + ' pts')))))],
        });
      }
      function settingsSheet() {
        const set = (k, v) => JC.state.setting('prefs', Object.assign({}, prefs(), { [k]: v }));
        JC.ui.sheet({
          title: 'Settings', detent: 'medium', right: { text: 'Done' },
          content: () => [JC.ui.list([{ rows: [
            { title: 'Sound Effects', toggle: { on: prefs()['rr.sfx'] !== false, onChange: (v) => { set('rr.sfx', v); if (v) sfx('tap'); } } },
            { title: 'Haptics', toggle: { on: prefs()['rr.haptics'] !== false, onChange: (v) => { set('rr.haptics', v); if (v) JC.audio.haptic(10); } } },
            { title: 'Show Tension Meter', toggle: { on: meterOn(), onChange: (v) => set('rr.meter', v) } },
            { title: 'Reduce Motion', detail: reduced() ? 'On' : 'Off', chevron: true, onTap: () => JC.os.open('settings', { page: 'a11y.motion' }) },
          ], footer: 'Sound follows the Silent switch. Teucer turned the tension meter off once to “make it harder”. He lost three fish and turned it back on.' }])],
        });
      }

      // ── loop ─────────────────────────────────────────────────────
      let raf = 0, last = 0, running = false;
      function frame(now) {
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        update(dt);
        draw();
        raf = requestAnimationFrame(frame);
      }
      function startLoop() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      function stopLoop() { running = false; cancelAnimationFrame(raf); }

      // ── lifecycle ────────────────────────────────────────────────
      showTitle();
      startLoop();
      return {
        intent(intent) { if (intent && intent.board) setTimeout(leaderboard, 200); if (intent && intent.play) setTimeout(start, 100); },
        show() { resize(); startLoop(); },
        hide() { if (G && G.mode === 'play') pause(); stopLoop(); },
        back() { if (G && G.mode === 'play') { pause(); return true; } if (G && G.mode === 'paused') { resume(); return true; } return false; },
        destroy() { stopLoop(); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); offs.forEach((f) => f()); },
        _debug: () => G,
        _start: () => start(),
        _press: () => press(),
        _release: () => release(),
        _end: () => { if (G) { G.left = 0; gameOver(); } },
        _loop: (on) => (on ? startLoop() : stopLoop()),
        _tick: (dt) => { update(dt); draw(); },
        _tune: (o) => Object.assign(TUNE, o || {}),
      };
    },
  });
})();
