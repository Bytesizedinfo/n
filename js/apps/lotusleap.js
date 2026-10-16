/* Lotus Leap — "Koi Tower Games". A frog leaps across drifting lotus pads on a moonlit pond.
   Tap / click / Space to jump. Land on pads, keep a rhythm for combo multipliers, grab lotus flowers,
   reach the pavilion docks (bonus + breather). Three lives. A-Ling's high score is 1,824. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;

  const W = 402;
  const LANE_H = 92;
  const JUMP_T = 0.3;
  const REST_EVERY = 12;
  const GOAL = 1824;
  // Difficulty & scoring. Tuned with a bot (timing noise σ≈50 ms ≈ "decent player"): 1,824 falls after ~2–3 minutes of a good run.
  const TUNE = {
    ramp: 130, spd0: 26, spdR: 104, spdJ: 22, w0: 118, wR: 50, gap0: 40, gapR: 104, gapJ: 40,
    sinkFrom: 26, sinkMax: 0.34, sinkRamp: 140, flower: 0.14,
    rhythm: 1.05, comboStep: 8, multStep: 0.5, multMax: 3, center: 0.22,
    row: 10, perfect: 5, lotus: 25, pavilion: 50,
  };

  JC.icon.add({
    trophy: '<path d="M7 4h10v4.5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
    'trophy.fill': '<path d="M7 4h10v4.5a5 5 0 0 1-10 0z" fill="currentColor" stroke="none"/><path d="M7 6H4.5a3 3 0 0 0 3 4M17 6h2.5a3 3 0 0 1-3 4M12 13.5V17"/><path d="M8.5 20.5h7M9.5 17h5v3.5h-5z" fill="currentColor"/>',
    'speaker.slash': '<path d="M4 9.3h3l4.4-3.7c.5-.4 1.2 0 1.2.6v11.6c0 .6-.7 1-1.2.6L7 14.7H4a1 1 0 0 1-1-1V10.3a1 1 0 0 1 1-1z"/><path d="M16 9l5 6M21 9l-5 6"/>',
  });

  // Jiang Cheng's Game Center record on this phone (A-Ling set the account up as "jiujiu").
  JC.store.seed('lotusleap', [{ id: 'me', best: 1203, plays: 31, last: 1203, beat: false }]);

  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const prefs = () => (JC.state.d.settings.prefs || {});
  const sfxOn = () => prefs()['ll.sfx'] !== false && !JC.state.d.settings.silent;
  const hapticsOn = () => prefs()['ll.haptics'] !== false;
  const reduced = () => !!(JC.state.d.settings.reduceMotion || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches));

  // ── sound effects (WebAudio) ─────────────────────────────────────
  let noiseBuf = null;
  function sfx(kind, x) {
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
    const noise = (dur, freq, gain, type) => {
      if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.setValueAtTime(freq, t); f.frequency.exponentialRampToValueAtTime(Math.max(80, freq / 6), t + dur);
      const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
    };
    switch (kind) {
      case 'jump': tone(380 + (x || 0) * 30, 760 + (x || 0) * 40, 0.09, 'triangle', 0.07); break;
      case 'land': tone(190, 110, 0.11, 'sine', 0.16); noise(0.07, 1400, 0.05, 'bandpass'); break;
      case 'perfect': tone(1318.5, 0, 0.25, 'sine', 0.07); tone(1760, 0, 0.35, 'sine', 0.06, 0.06); break;
      case 'flower': [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(f, 0, 0.22, 'sine', 0.06, i * 0.05)); break;
      case 'combo': tone(880, 0, 0.14, 'triangle', 0.06); tone(1318.5, 0, 0.2, 'triangle', 0.06, 0.07); break;
      case 'checkpoint': [523.25, 659.25, 783.99].forEach((f) => tone(f, 0, 0.6, 'sine', 0.06)); tone(1046.5, 0, 0.5, 'sine', 0.05, 0.12); break;
      case 'splash': noise(0.45, 2600, 0.22); tone(320, 90, 0.35, 'sine', 0.1); break;
      case 'over': [392, 329.63, 261.63].forEach((f, i) => tone(f, f * 0.98, 0.35, 'triangle', 0.08, i * 0.18)); break;
      case 'best': [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, 0, 0.3, 'triangle', 0.07, i * 0.09)); break;
      case 'tap': tone(1200, 0, 0.04, 'sine', 0.04); break;
      default: break;
    }
  }
  function buzz(ms) { if (hapticsOn()) JC.audio.haptic(ms); }

  // ── world ────────────────────────────────────────────────────────
  function makeLane(k, seed) {
    if (k <= 0) return { k, type: 'start' };
    if (k % REST_EVERY === 0) return { k, type: 'rest' };
    const R = rng(seed ^ Math.imul(k, 2654435761));
    const T = TUNE;
    const d = Math.min(1, k / T.ramp);
    const dir = k % 2 ? 1 : -1; // strictly alternating rows, so a pad always drifts toward you
    const speed = (T.spd0 + T.spdR * d + R() * T.spdJ) * (k < 4 ? 0.75 : 1);
    const w = Math.round(T.w0 - T.wR * d + (R() - 0.5) * 16);
    const gap = Math.round(T.gap0 + T.gapR * d + R() * T.gapJ);
    const n = Math.max(2, Math.ceil((W + 2 * w + 60) / (w + gap)));
    const L = n * (w + gap);
    const pads = [];
    for (let i = 0; i < n; i++) {
      pads.push({
        i, base: i * (w + gap), w: Math.max(54, w + Math.round((R() - 0.5) * 16)),
        flower: k > 2 && R() < T.flower,
        sink: k > T.sinkFrom && R() < Math.min(T.sinkMax, (k - T.sinkFrom) / T.sinkRamp),
        phase: R(), rot: R() * Math.PI * 2, hue: R(),
      });
    }
    return { k, type: 'pads', dir, speed, L, off: R() * L, pads, tint: R() };
  }
  function padX(lane, p, t) {
    let x = (p.base + lane.off + lane.dir * lane.speed * t) % lane.L;
    if (x < 0) x += lane.L;
    return x - (lane.L - W) / 2;
  }
  function sinkState(p, t) {
    if (!p.sink) return 0; // 0 = afloat; (0..1) = warning/submerging; 1 = under
    const ph = (t * 0.24 + p.phase) % 1;
    if (ph < 0.55) return 0;
    if (ph < 0.78) return (ph - 0.55) / 0.23 * 0.5; // bubbling: still standable, but leave soon
    if (ph < 0.94) return 1;
    return 0.5 - (ph - 0.94) / 0.06 * 0.5; // resurfacing
  }

  // ════════════════════════════════════════════════════════════════
  JC.app({
    id: 'lotusleap',
    name: 'Lotus Leap',
    status: 'light',
    launch(win) {
      win.body.classList.add('app-lotusleap');
      const canvas = h('canvas.ll-canvas');
      const hud = h('div.ll-hud');
      const ui = h('div.ll-ui');
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
      // a locked screen or an incoming call pauses the run
      offs.push(JC.bus.on('lock', () => { if (G && G.mode === 'play') pause(); }));
      offs.push(JC.bus.on('story:call', () => { if (G && G.mode === 'play') pause(); }));

      const rec = () => JC.store.get('lotusleap', 'me') || { best: 1203, plays: 0 };
      const best = () => rec().best || 0;

      // stars & decor (static per session)
      const SR = rng(1508);
      const stars = Array.from({ length: 70 }, () => ({ x: SR() * W, y: SR() * 900, r: SR() * 1.3 + 0.3, tw: SR() * 6 }));
      const flies = Array.from({ length: 14 }, () => ({ x: SR() * W, y: SR() * 900, p: SR() * 6, s: 0.4 + SR() * 0.8 }));

      // ── game state ───────────────────────────────────────────────
      let G = null;
      const camFor = (mode) => laneY(0) - H * (mode === 'title' ? 0.84 : 0.7);
      function newGame(mode) {
        const seed = (Date.now() ^ 0x9e3779b9) >>> 0;
        const prevCam = G ? G.cam : null;
        G = {
          mode: mode || 'play', t: 0, seed, lanes: {}, score: 0, combo: 0, mult: 1, maxLane: 0, checkpoint: 0, lives: 3,
          frog: { lane: 0, x: W / 2, state: 'sit', jt: 0, pad: null, landT: -9, face: 0, blink: 0 },
          cam: 0, parts: [], pops: [], rings: [], shake: 0, buffer: false, eaten: {}, perfects: 0, flowers: 0, startT: performance.now(), deadT: 0, overShown: false,
        };
        G.cam = prevCam != null ? prevCam : camFor(G.mode);
        paintHud();
      }
      function lane(k) { if (!G.lanes[k]) G.lanes[k] = makeLane(k, G.seed); return G.lanes[k]; }
      const laneY = (k) => -k * LANE_H;

      // ── input ────────────────────────────────────────────────────
      function jump() {
        if (!G || G.mode !== 'play') return;
        const f = G.frog;
        if (f.state === 'jump') { if (f.jt > JUMP_T - 0.12) G.buffer = true; return; }
        if (f.state !== 'sit') return;
        // rhythm combo
        if (G.t - f.landT <= TUNE.rhythm && f.landT > 0) G.combo++; else G.combo = 0;
        const m = 1 + Math.min(TUNE.multMax, Math.floor(G.combo / TUNE.comboStep)) * TUNE.multStep;
        if (m > G.mult) { G.pops.push({ x: f.x, y: laneY(f.lane) - 40, text: 'Combo ×' + m, life: 1.1, c: '#ffd36b', big: true }); sfx('combo'); }
        G.mult = m;
        f.state = 'jump'; f.jt = 0; f.from = f.lane; f.pad = null;
        f.x0 = f.x; f.x1 = f.x + (W / 2 - f.x) * TUNE.center; // each hop drifts a little toward the middle
        sfx('jump', Math.min(8, G.combo));
        buzz(6);
      }
      function onPointer(e) {
        if (e.target.closest('.ll-btn, .ll-panel, .ll-pause')) return;
        if (G && G.mode === 'play') { e.preventDefault(); jump(); }
        else if (G && G.mode === 'title' && !ui.querySelector('.ll-panel')) start();
      }
      canvas.addEventListener('pointerdown', onPointer);
      canvas.__tap = true;
      const covered = () => !!(win.overlays.querySelector('.sheet, .alert, .action-sheet') || document.querySelector('#screen .alert'));
      const onKey = (e) => {
        if (!JC.os.isOpen('lotusleap') || JC.kb.visible || !G || covered()) return;
        if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          if (e.repeat) return;
          if (G.mode === 'play') jump();
          else if (G.mode === 'title') start();
          else if (G.mode === 'over' && G.overShown) start();
        } else if (e.key === 'p' || e.key === 'P') { // (Escape goes through the system Back → back())
          if (G.mode === 'play') pause(); else if (G.mode === 'paused') resume();
        }
      };
      window.addEventListener('keydown', onKey);

      // ── update ───────────────────────────────────────────────────
      function update(dt) {
        if (!G) return;
        G.t += dt;
        const f = G.frog;
        if (G.mode === 'title') {
          G.cam += (camFor('title') - G.cam) * 0.05;
          for (let k = -1; k < 12; k++) lane(k);
          return;
        }
        if (G.mode !== 'play' && G.mode !== 'over') return;
        for (let k = f.lane - 6; k <= f.lane + 12; k++) lane(k);
        Object.keys(G.lanes).forEach((k) => { if (+k < f.lane - 8) delete G.lanes[k]; });
        if (f.state === 'sit' && G.mode === 'play') {
          const L = lane(f.lane);
          if (L.type === 'pads' && f.pad) {
            f.x += L.dir * L.speed * dt;
            const ss = sinkState(f.pad, G.t);
            if (ss >= 1) return fall('sank');
            const px = padX(L, f.pad, G.t);
            if (f.x < px - 4 || f.x > px + f.pad.w + 4) f.x = U.clamp(f.x, px, px + f.pad.w);
          }
          if (f.x < 2 || f.x > W - 2) return fall('swept');
        } else if (f.state === 'jump') {
          f.jt += dt;
          f.x = f.x0 + (f.x1 - f.x0) * Math.min(1, f.jt / JUMP_T);
          if (f.jt >= JUMP_T) { f.x = f.x1; land(); }
        } else if (f.state === 'fall') {
          if (G.t - G.deadT > 1.1) {
            if (G.lives > 0) respawn();
            else if (G.mode === 'play') gameOver();
          }
        }
        // camera
        const vis = f.state === 'jump' ? f.from + ease(Math.min(1, f.jt / JUMP_T)) : f.lane;
        const target = laneY(vis) - H * 0.7;
        G.cam += (target - G.cam) * (1 - Math.exp(-7 * dt));
        G.shake = Math.max(0, G.shake - dt * 3);
      }
      const ease = (u) => 1 - Math.pow(1 - u, 2.2);
      function land() {
        const f = G.frog;
        const to = f.from + 1;
        const L = lane(to);
        f.lane = to;
        f.jt = 0;
        if (L.type === 'rest' || L.type === 'start') {
          f.state = 'sit'; f.pad = null; f.landT = G.t;
          sfx('land'); buzz(8);
          ripple(f.x, laneY(to), 0.7);
          if (to > G.maxLane) {
            G.maxLane = to;
            G.checkpoint = to;
            addScore(Math.round(TUNE.row * G.mult) + TUNE.pavilion, f.x, laneY(to), 'Pavilion +' + (Math.round(TUNE.row * G.mult) + TUNE.pavilion));
            sfx('checkpoint');
          }
          afterLand();
          return;
        }
        let hit = null;
        L.pads.forEach((p) => {
          const px = padX(L, p, G.t);
          if (f.x >= px - 7 && f.x <= px + p.w + 7 && sinkState(p, G.t) < 1) hit = { p, px };
        });
        if (!hit) { fall('missed'); return; }
        f.state = 'sit'; f.pad = hit.p; f.landT = G.t;
        const center = hit.px + hit.p.w / 2;
        const perfect = Math.abs(f.x - center) < hit.p.w * 0.19;
        ripple(f.x, laneY(to), perfect ? 1 : 0.6);
        sfx('land'); buzz(perfect ? 12 : 7);
        if (to > G.maxLane) {
          G.maxLane = to;
          let pts = Math.round(TUNE.row * G.mult);
          const tags = [];
          if (perfect) { pts += TUNE.perfect; G.perfects++; tags.push('Perfect!'); sfx('perfect'); }
          const key = to + ':' + hit.p.i;
          if (hit.p.flower && !G.eaten[key]) { G.eaten[key] = 1; pts += TUNE.lotus; G.flowers++; tags.push('Lotus!'); sfx('flower'); burst(f.x, laneY(to) - 10, '#ff9ec5', 14); }
          addScore(pts, f.x, laneY(to), (tags.length ? tags.join(' ') + ' ' : '') + '+' + pts, tags.length > 0);
        } else if (perfect) G.pops.push({ x: f.x, y: laneY(to) - 30, text: 'Nice', life: 0.6, c: '#cfe9ff' });
        afterLand();
      }
      function afterLand() {
        if (G.buffer) { G.buffer = false; setTimeout(() => jump(), 0); }
      }
      function addScore(pts, x, y, label, perfect) {
        G.score += pts;
        G.pops.push({ x, y: y - 36, text: label, life: 0.9, c: perfect ? '#fff3a8' : '#ffffff', big: !!perfect });
        paintHud();
      }
      function fall(why) {
        const f = G.frog;
        f.state = 'fall';
        G.lastWhy = why;
        G.deadT = G.t;
        G.lives--;
        G.combo = 0; G.mult = 1;
        if (!reduced()) G.shake = 1;
        sfx('splash'); buzz(30);
        const y = laneY(f.lane);
        ripple(f.x, y, 1.4); ripple(f.x, y, 0.9);
        burst(f.x, y, '#bfe6ff', reduced() ? 8 : 22);
        G.pops.push({ x: f.x, y: y - 40, text: why === 'swept' ? 'Swept away!' : why === 'sank' ? 'The pad sank!' : 'Splash!', life: 1.2, c: '#9fd8ff', big: true });
        paintHud();
      }
      function respawn() {
        // back on the row you were last standing on, on the safest pad near the middle
        const f = G.frog;
        const k = G.lastWhy === 'missed' ? f.lane - 1 : f.lane;
        const L = lane(k);
        f.lane = k; f.state = 'sit'; f.pad = null; f.landT = -9; f.x = W / 2;
        if (L.type === 'pads') {
          let bestP = null, bestD = 1e9;
          L.pads.forEach((p) => {
            const c = padX(L, p, G.t) + p.w / 2;
            const dd = Math.abs(c - W / 2) + (p.sink ? 400 : 0) - L.dir * (c - W / 2) * 0.6; // prefer pads drifting toward the middle
            if (c > 40 && c < W - 40 && dd < bestD) { bestD = dd; bestP = p; }
          });
          if (bestP) { f.pad = bestP; f.x = padX(L, bestP, G.t) + bestP.w / 2; }
        }
        ripple(f.x, laneY(k), 0.8);
        G.pops.push({ x: W / 2, y: laneY(f.lane) - 50, text: G.lives === 1 ? 'Last life!' : G.lives + ' lives left', life: 1.2, c: '#ffd36b', big: true });
        paintHud();
      }
      function ripple(x, y, s) { G.rings.push({ x, y, r: 4, life: 1, s }); }
      function burst(x, y, c, n) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 140; G.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, life: 0.6 + Math.random() * 0.5, c, r: 1.5 + Math.random() * 2.5 }); } }

      // ── render ───────────────────────────────────────────────────
      function render() {
        const c = ctx2;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        const t = G ? G.t : 0;
        // sky / water
        const g = c.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#070d22'); g.addColorStop(0.45, '#0d1d3d'); g.addColorStop(1, '#10284a');
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        const camY = G ? G.cam : 0;
        const shx = G && G.shake ? (Math.random() - 0.5) * 8 * G.shake : 0;
        const shy = G && G.shake ? (Math.random() - 0.5) * 8 * G.shake : 0;
        // stars (parallax)
        stars.forEach((s) => { const y = ((s.y - camY * 0.05) % 900 + 900) % 900; const a = 0.35 + 0.35 * Math.sin(t * 1.5 + s.tw); c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(s.x, y * H / 900, s.r, 0, 6.283); c.fill(); });
        // moon & reflection
        const mx = 308, my = 120;
        const mg = c.createRadialGradient(mx, my, 10, mx, my, 120);
        mg.addColorStop(0, 'rgba(255,244,214,.35)'); mg.addColorStop(1, 'rgba(255,244,214,0)');
        c.fillStyle = mg; c.fillRect(mx - 130, my - 130, 260, 260);
        c.fillStyle = '#fff4d6'; c.beginPath(); c.arc(mx, my, 30, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(220,210,180,.35)'; c.beginPath(); c.arc(mx - 8, my - 6, 6, 0, 6.283); c.arc(mx + 9, my + 7, 4, 0, 6.283); c.fill();
        for (let i = 0; i < 26; i++) {
          const yy = 190 + i * 26 + ((t * 18) % 26);
          if (yy > H) break;
          const ww = 22 + Math.sin(t * 2 + i) * 10 + i * 1.2;
          c.fillStyle = `rgba(255,236,190,${0.16 - i * 0.005})`;
          c.fillRect(mx - ww / 2 + Math.sin(t * 1.3 + i * 0.7) * 6, yy, ww, 2.2);
        }
        if (!G) return;
        c.save();
        c.translate(shx, shy);
        // lanes
        const k0 = Math.floor(-(camY + H) / LANE_H) - 1, k1 = Math.ceil(-camY / LANE_H) + 1;
        for (let k = k1; k >= k0; k--) {
          const L = lane(k);
          const y = laneY(k) - camY;
          if (y < -LANE_H || y > H + LANE_H) continue;
          if (L.type === 'pads') {
            // water ripple lines drifting with the current
            c.strokeStyle = 'rgba(160,200,255,.07)'; c.lineWidth = 1.5;
            for (let r = 0; r < 3; r++) { const off = ((t * L.speed * 0.35 * L.dir + r * 137 + k * 53) % 160 + 160) % 160; c.beginPath(); for (let x = -160 + off; x < W; x += 160) { c.moveTo(x, y + 18 + r * 9); c.quadraticCurveTo(x + 20, y + 15 + r * 9, x + 40, y + 18 + r * 9); } c.stroke(); }
            L.pads.forEach((p) => {
              const x = padX(L, p, t);
              if (x > W + 10 || x + p.w < -10) return;
              drawPad(c, x, y, p, sinkState(p, t), G.eaten[k + ':' + p.i]);
            });
          } else if (L.type === 'rest') drawDock(c, y, t, k);
          else if (k === 0) drawBank(c, y);
        }
        // rings
        G.rings.forEach((r) => { c.strokeStyle = `rgba(200,230,255,${r.life * 0.6})`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(r.x, r.y - camY, r.r * r.s, r.r * r.s * 0.4, 0, 0, 6.283); c.stroke(); });
        // frog
        drawFrog(c, camY, t);
        // particles
        G.parts.forEach((p) => { c.fillStyle = p.c; c.globalAlpha = Math.max(0, p.life); c.beginPath(); c.arc(p.x, p.y - camY, p.r, 0, 6.283); c.fill(); c.globalAlpha = 1; });
        // fireflies
        if (!reduced()) flies.forEach((fl) => { const x = (fl.x + Math.sin(t * fl.s + fl.p) * 30 + W) % W; const y = ((fl.y + Math.cos(t * fl.s * 0.7 + fl.p) * 40 - camY * 0.3) % 900 + 900) % 900 * H / 900; const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2 * fl.s + fl.p)); c.fillStyle = `rgba(255,230,120,${a * 0.25})`; c.beginPath(); c.arc(x, y, 5, 0, 6.283); c.fill(); c.fillStyle = `rgba(255,240,170,${a})`; c.beginPath(); c.arc(x, y, 1.6, 0, 6.283); c.fill(); });
        // popups
        c.textAlign = 'center';
        G.pops.forEach((p) => { c.globalAlpha = Math.min(1, p.life * 1.6); c.fillStyle = p.c; c.font = (p.big ? '800 19px' : '700 15px') + ' Inter, -apple-system, Helvetica, Arial, sans-serif'; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 6; c.fillText(p.text, U.clamp(p.x, 70, W - 70), p.y - camY); c.shadowBlur = 0; c.globalAlpha = 1; });
        c.restore();
      }
      function drawBank(c, y) {
        const gg = c.createLinearGradient(0, y - 30, 0, y + 60);
        gg.addColorStop(0, '#2e3b2a'); gg.addColorStop(1, '#16201a');
        c.fillStyle = gg; c.beginPath(); c.moveTo(0, y - 18); c.quadraticCurveTo(W * 0.5, y - 38, W, y - 16); c.lineTo(W, Math.max(y + 200, H)); c.lineTo(0, Math.max(y + 200, H)); c.fill();
        c.fillStyle = '#16201a'; if (y + 60 < H) c.fillRect(0, y + 60, W, H - y - 60);
        c.fillStyle = 'rgba(120,150,110,.35)';
        [[60, -14, 26], [150, -22, 18], [270, -20, 30], [350, -12, 16]].forEach(([x, dy, r]) => { c.beginPath(); c.ellipse(x, y + dy + 10, r, r * 0.45, 0, 0, 6.283); c.fill(); });
        c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '600 12px Inter, -apple-system, sans-serif'; c.textAlign = 'center';
        c.fillText('LOTUS POND · KOI TOWER GAMES', W / 2, y + 44);
      }
      function drawDock(c, y, t, k) {
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, y - 22 + 6, W, 44);
        const gg = c.createLinearGradient(0, y - 24, 0, y + 22);
        gg.addColorStop(0, '#8a5a34'); gg.addColorStop(1, '#5c3a20');
        c.fillStyle = gg; c.fillRect(0, y - 24, W, 44);
        c.strokeStyle = 'rgba(40,22,10,.55)'; c.lineWidth = 1.2;
        for (let x = 0; x < W; x += 34) { c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x, y + 20); c.stroke(); }
        c.fillStyle = '#3d2614'; c.fillRect(0, y + 18, W, 5);
        [44, W / 2, W - 44].forEach((x, i) => {
          c.fillStyle = '#2b1b0e'; c.fillRect(x - 2, y - 46, 4, 24);
          const flick = 0.8 + 0.2 * Math.sin(t * 6 + i * 2 + k);
          const lg = c.createRadialGradient(x, y - 50, 2, x, y - 50, 34);
          lg.addColorStop(0, `rgba(255,170,80,${0.55 * flick})`); lg.addColorStop(1, 'rgba(255,170,80,0)');
          c.fillStyle = lg; c.fillRect(x - 36, y - 86, 72, 72);
          c.fillStyle = '#e04f2f'; c.beginPath(); c.ellipse(x, y - 52, 8, 10, 0, 0, 6.283); c.fill();
          c.fillStyle = `rgba(255,214,120,${flick})`; c.beginPath(); c.ellipse(x, y - 52, 3.5, 5, 0, 0, 6.283); c.fill();
        });
        c.fillStyle = 'rgba(255,230,190,.8)'; c.font = '700 11px Inter, -apple-system, sans-serif'; c.textAlign = 'left';
        c.fillText('PAVILION ' + (k / REST_EVERY), 10, y + 14);
      }
      function drawPad(c, x, y, p, sink, eaten) {
        const cx = x + p.w / 2, rx = p.w / 2, ry = Math.min(30, p.w * 0.34);
        const under = sink >= 1;
        if (under) { // just a dark shape and a ring under the surface
          c.fillStyle = 'rgba(20,60,40,.28)'; c.beginPath(); c.ellipse(cx, y + 3, rx * 0.9, ry * 0.85, 0, 0, 6.283); c.fill();
          c.strokeStyle = 'rgba(190,230,255,.22)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(cx, y, rx, ry, 0, 0, 6.283); c.stroke();
          return;
        }
        const s = 1 - sink * 0.22; // shrinks a little while it goes under
        c.save();
        c.globalAlpha = 1 - sink * 0.75;
        // shadow
        c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(cx + 3, y + 6, rx * s, ry * s, 0, 0, 6.283); c.fill();
        const pg = c.createRadialGradient(cx - rx * 0.3, y - ry * 0.4, 4, cx, y, rx);
        if (p.sink) { pg.addColorStop(0, '#c9c06a'); pg.addColorStop(1, '#6f6a26'); } // old, waterlogged pad
        else { pg.addColorStop(0, p.hue < 0.5 ? '#5fbf6a' : '#4fae64'); pg.addColorStop(1, '#22703b'); }
        c.fillStyle = pg;
        c.beginPath();
        const notch = 0.28;
        const rot = p.rot;
        c.moveTo(cx, y);
        c.ellipse(cx, y, rx * s, ry * s, 0, rot + notch, rot + Math.PI * 2 - notch);
        c.closePath();
        c.fill();
        c.strokeStyle = p.sink ? 'rgba(80,70,20,.55)' : 'rgba(20,70,35,.55)'; c.lineWidth = 1;
        for (let i = 1; i < 7; i++) { const an = rot + notch + (i / 7) * (Math.PI * 2 - notch * 2); c.beginPath(); c.moveTo(cx, y); c.lineTo(cx + Math.cos(an) * rx * 0.85 * s, y + Math.sin(an) * ry * 0.85 * s); c.stroke(); }
        c.strokeStyle = p.sink ? 'rgba(255,240,170,.25)' : 'rgba(190,255,190,.25)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, y, rx * s - 1, ry * s - 1, 0, rot + notch, rot + Math.PI * 2 - notch); c.stroke();
        if (p.sink) { // brown spots
          c.fillStyle = 'rgba(90,60,20,.45)';
          [[-0.45, 0.2, 5], [0.3, -0.35, 4], [0.5, 0.35, 3.5], [-0.15, -0.5, 3]].forEach(([dx, dy, r]) => { c.beginPath(); c.ellipse(cx + dx * rx * s, y + dy * ry * s, r, r * 0.6, 0, 0, 6.283); c.fill(); });
        }
        if (p.flower && !eaten) drawLotus(c, cx + rx * 0.35, y - ry * 0.35, 0.9);
        c.restore();
        if (p.sink && sink > 0) { // bubbling: get off!
          const tt = G ? G.t : 0;
          c.fillStyle = 'rgba(210,240,255,.85)';
          for (let i = 0; i < 6; i++) {
            const ph = (tt * 2.2 + i / 6) % 1;
            const bx = cx + Math.sin(i * 2.3) * rx * 0.75, by = y + Math.cos(i * 1.7) * ry * 0.5 - ph * 10;
            c.globalAlpha = 1 - ph; c.beginPath(); c.arc(bx, by, 1.6 + (i % 3), 0, 6.283); c.fill();
          }
          c.globalAlpha = 1;
        }
      }
      function drawLotus(c, x, y, s) {
        c.save(); c.translate(x, y); c.scale(s, s);
        const petal = (ang, col) => { c.save(); c.rotate(ang); c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-7, -9, 0, -19); c.quadraticCurveTo(7, -9, 0, 0); c.fill(); c.restore(); };
        [-1.1, 1.1, -0.55, 0.55].forEach((a) => petal(a, '#ff9ec5'));
        petal(0, '#ffc2dc');
        c.fillStyle = '#ffe28a'; c.beginPath(); c.arc(0, -3, 3, 0, 6.283); c.fill();
        c.restore();
      }
      function drawFrog(c, camY, t) {
        const f = G.frog;
        if (f.state === 'fall' && G.t - G.deadT > 0.25) return;
        let wy = laneY(f.lane);
        let lift = 0, sc = 1;
        if (f.state === 'jump') {
          const u = Math.min(1, f.jt / JUMP_T);
          wy = laneY(f.from) + (laneY(f.from + 1) - laneY(f.from)) * ease(u);
          lift = Math.sin(Math.PI * u) * 30;
          sc = 1 + Math.sin(Math.PI * u) * 0.22;
        } else if (f.state === 'fall') { sc = 1 - (G.t - G.deadT) * 3; }
        const x = f.x, y = wy - camY;
        // rhythm ring: how long you have left to keep the combo going
        if (f.state === 'sit' && G.mode === 'play' && f.landT > 0 && prefs()['ll.ring'] !== false) {
          const left = 1 - (G.t - f.landT) / TUNE.rhythm;
          if (left > 0) {
            c.strokeStyle = G.mult > 1 ? 'rgba(255,211,107,.9)' : 'rgba(255,255,255,.75)'; c.lineWidth = 2.5; c.lineCap = 'round';
            c.beginPath(); c.ellipse(x, y + 2, 26, 12, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); c.stroke(); c.lineCap = 'butt';
          }
        }
        // shadow
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 2, y + 4, 15 * (1 - lift / 70), 6 * (1 - lift / 70), 0, 0, 6.283); c.fill();
        c.save();
        c.translate(x, y - 6 - lift);
        c.scale(sc, sc);
        const bob = f.state === 'sit' ? Math.sin(t * 3) * 0.8 : 0;
        // legs
        c.fillStyle = '#2f8f3c';
        if (f.state === 'jump') { c.beginPath(); c.ellipse(-12, 10, 5, 12, 0.5, 0, 6.283); c.ellipse(12, 10, 5, 12, -0.5, 0, 6.283); c.fill(); }
        else { c.beginPath(); c.ellipse(-13, 5 + bob, 8, 5, 0, 0, 6.283); c.ellipse(13, 5 + bob, 8, 5, 0, 0, 6.283); c.fill(); }
        // body
        const bg = c.createRadialGradient(-4, -6, 2, 0, 0, 18);
        bg.addColorStop(0, '#9be36f'); bg.addColorStop(1, '#3e9e46');
        c.fillStyle = bg; c.beginPath(); c.ellipse(0, bob, 15, 13, 0, 0, 6.283); c.fill();
        c.fillStyle = 'rgba(255,255,220,.55)'; c.beginPath(); c.ellipse(0, 4 + bob, 8, 6, 0, 0, 6.283); c.fill();
        // eyes
        const blink = (Math.floor(t * 10) % 37) === 0;
        [-6.5, 6.5].forEach((ex) => {
          c.fillStyle = '#7ccf5a'; c.beginPath(); c.arc(ex, -10 + bob, 5.5, 0, 6.283); c.fill();
          c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, -10.5 + bob, 3.6, 0, 6.283); c.fill();
          if (!blink) { c.fillStyle = '#16210f'; c.beginPath(); c.arc(ex + 0.4, -11 + bob, 1.9, 0, 6.283); c.fill(); }
        });
        // tiny gold crown (it is a Koi Tower game)
        c.fillStyle = '#ffd34d'; c.beginPath(); c.moveTo(-5, -15 + bob); c.lineTo(-4, -20 + bob); c.lineTo(-1.5, -16.5 + bob); c.lineTo(0, -21 + bob); c.lineTo(1.5, -16.5 + bob); c.lineTo(4, -20 + bob); c.lineTo(5, -15 + bob); c.closePath(); c.fill();
        // smile
        c.strokeStyle = '#1f5a26'; c.lineWidth = 1.3; c.beginPath(); c.arc(0, 0 + bob, 5, 0.25, Math.PI - 0.25); c.stroke();
        c.restore();
      }
      function stepFx(dt) {
        if (!G) return;
        G.rings.forEach((r) => { r.r += dt * 40; r.life -= dt * 1.1; });
        G.rings = G.rings.filter((r) => r.life > 0);
        G.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 320 * dt; p.life -= dt; });
        G.parts = G.parts.filter((p) => p.life > 0);
        G.pops.forEach((p) => { p.y -= dt * 34; p.life -= dt; });
        G.pops = G.pops.filter((p) => p.life > 0);
      }

      // ── loop ─────────────────────────────────────────────────────
      let raf = null, last = 0, running = false, acc = 0;
      const STEP = 1 / 120;
      function frame(now) {
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000 || 0);
        last = now;
        acc += dt;
        while (acc >= STEP) { update(STEP); acc -= STEP; }
        stepFx(dt);
        render();
        raf = requestAnimationFrame(frame);
      }
      function startLoop() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      function stopLoop() { running = false; cancelAnimationFrame(raf); }

      // ── HUD & menus (DOM) ────────────────────────────────────────
      function lotusIcon(on) { return h('span.ll-life', { class: { off: !on } }, JC.icon('lotus.fill', { size: 26 })); }
      function paintHud() {
        hud.innerHTML = '';
        if (!G || G.mode === 'title') return;
        hud.append(
          h('div.ll-hud-l', [0, 1, 2].map((i) => lotusIcon(i < G.lives))),
          h('div.ll-hud-c', h('div.ll-score', G.score.toLocaleString('en-US')), h('div.ll-sub', { class: { combo: G.mult > 1 } }, G.mult > 1 ? 'COMBO ×' + G.mult : 'BEST ' + best().toLocaleString('en-US'))),
          G.mode === 'play' || G.mode === 'paused' ? h('div.ll-pause.tap', { onTap: () => (G.mode === 'paused' ? resume() : pause()) }, JC.icon(G.mode === 'paused' ? 'play.fill' : 'pause.fill', { size: 18 })) : null);
        if (G.score > GOAL && !G.beatShown) { G.beatShown = true; G.pops.push({ x: W / 2, y: laneY(G.frog.lane) - 70, text: 'You beat A-Ling!', life: 2, c: '#ffd36b', big: true }); sfx('best'); }
      }
      function btn(text, icon, onTap, cls) { return h('div.ll-btn', { class: cls, onTap: (e) => { sfx('tap'); buzz(5); onTap(e); } }, icon ? JC.icon(icon, { size: 18 }) : null, text ? h('span', text) : null); }
      function showTitle() {
        newGame('title');
        ui.innerHTML = '';
        const b = best();
        const beat = b > GOAL;
        ui.append(h('div.ll-title',
          h('div.ll-studio', 'KOI TOWER GAMES'),
          h('div.ll-han', '莲跃'),
          h('div.ll-logo', h('span.ll-logo-l', 'Lotus'), h('span.ll-logo-r', 'Leap')),
          h('div.ll-tag', 'Leap across the moonlit pond. Don’t fall in.'),
          h('div.ll-goal.tap', { class: { done: beat }, onTap: () => { sfx('tap'); leaderboard(); } }, JC.icon(beat ? 'checkmark.circle.fill' : 'trophy.fill', { size: 16 }), beat ? 'You beat A-Ling’s 1,824' : 'Beat A-Ling’s 1,824!'),
          h('div.ll-bestline', 'Your best: ' + b.toLocaleString('en-US')),
          btn('Play', 'play.fill', () => start(), 'primary'),
          h('div.ll-row', btn('Leaderboard', 'trophy', () => leaderboard()), btn('How to Play', 'questionmark.circle', () => howTo()), btn('', 'gear', () => settingsSheet(), 'icon')),
          h('div.ll-hint', 'Tap anywhere or press ', h('kbd', 'Space'), ' to leap')));
        paintHud();
      }
      function start() {
        ui.innerHTML = '';
        newGame('play');
        const r = rec();
        JC.store.update('lotusleap', 'me', { plays: (r.plays || 0) + 1 });
        G.pops.push({ x: W / 2, y: laneY(0) - 60, text: 'Tap to leap!', life: 1.6, c: '#ffffff', big: true });
        paintHud();
        startLoop();
      }
      function pause() {
        if (!G || G.mode !== 'play') return;
        G.mode = 'paused';
        ui.innerHTML = '';
        ui.append(h('div.ll-panel',
          h('div.ll-ph', 'Paused'),
          h('div.ll-pstats', h('div', h('b', G.score.toLocaleString('en-US')), h('span', 'Score')), h('div', h('b', String(G.maxLane)), h('span', 'Rows')), h('div', h('b', String(G.lives)), h('span', 'Lives'))),
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
        G.mode = 'over';
        const score = G.score;
        const prevBest = best();
        const newBest = score > prevBest;
        const r = rec();
        JC.store.update('lotusleap', 'me', { best: Math.max(prevBest, score), last: score, beat: r.beat || score > GOAL });
        try { JC.story.act('game_score', { score }); } catch (e) { /* ignore */ }
        sfx(newBest ? 'best' : 'over');
        setTimeout(() => {
          if (!G || G.mode !== 'over') return;
          G.overShown = true;
          ui.innerHTML = '';
          const pct = Math.min(1, score / GOAL);
          const beat = score > GOAL;
          const short = (GOAL + 1 - score).toLocaleString('en-US');
          const msg = beat ? h('div.ll-msg', 'A-Ling is going to be ', h('b', 'furious'), '.')
            : newBest ? h('div.ll-msg', 'New personal best! ', h('b', short), ' more to beat A-Ling.')
              : h('div.ll-msg', h('b', short), ' points short of A-Ling’s 1,824. Keep the rhythm for combos.');
          ui.append(h('div.ll-panel.over', { class: { beat } },
            h('div.ll-ph', beat ? 'You beat A-Ling!' : G.lastWhy === 'swept' ? 'Swept Away!' : G.lastWhy === 'sank' ? 'Sunk!' : 'Splash!'),
            h('div.ll-final', score.toLocaleString('en-US')),
            newBest ? h('div.ll-newbest', 'NEW BEST') : h('div.ll-bestline', 'Best: ' + prevBest.toLocaleString('en-US')),
            h('div.ll-prog', h('div.ll-prog-bar', h('i', { style: { width: Math.max(4, Math.round(pct * 100)) + '%' } }), h('span.ll-prog-flag', { style: { left: '100%' } }, JC.icon('flag.fill', { size: 14 }))), h('div.ll-prog-l', h('span', 'You · ' + score.toLocaleString('en-US')), h('span', 'A-Ling · 1,824'))),
            msg,
            h('div.ll-pstats', h('div', h('b', String(G.maxLane)), h('span', 'Rows')), h('div', h('b', String(G.perfects)), h('span', 'Perfect')), h('div', h('b', String(G.flowers)), h('span', 'Lotus'))),
            btn('Play Again', 'arrow.clockwise', () => start(), 'primary'),
            h('div.ll-row', btn('Leaderboard', 'trophy', () => leaderboard()), btn('Share', 'square.and.arrow.up', () => JC.ui.share({ title: 'Lotus Leap · ' + score.toLocaleString('en-US'), subtitle: 'Koi Tower Games', icon: 'lotus.fill', payload: { kind: 'text', text: 'Lotus Leap: ' + score.toLocaleString('en-US') + (beat ? '. Beat that.' : '') } })), btn('', 'house.fill', () => showTitle(), 'icon'))));
        }, 900);
      }
      function leaderboard() {
        const me = best();
        const AV = (n, g) => ({ initials: n, grad: g });
        let tab = 0;
        JC.ui.sheet({
          title: 'Lotus Leap', detent: 'large', right: { text: 'Done' }, cls: 'll-lb',
          content: (s) => {
            const friends = [
              { n: 'A-Ling', h: 'rulan_jin · Sep 30', v: 1824, av: 'jl' },
              { n: 'jiujiu', h: 'Set up by A-Ling', v: me, av: 'me', me: true },
              { n: 'Sizhui', h: 'sizhui_lan · “wasn’t trying”', v: 990, av: 'sz' },
              { n: 'Wei Ying', h: 'radish_king · 214 games', v: 12, av: 'wwx' },
            ].sort((a, b) => b.v - a.v);
            const global = [
              { n: 'koipondboy_7', h: 'Lanling', v: 48210, av: AV('K7', ['#ffa94d', '#f76707']) },
              { n: 'fairy_fan', h: 'Yunmeng', v: 22400, av: AV('FF', ['#74c0fc', '#1c7ed6']) },
              { n: 'lanling_drift', h: 'Lanling', v: 17330, av: AV('LD', ['#b197fc', '#7048e8']) },
              { n: 'gold_carp', h: 'Qinghe', v: 9871, av: AV('GC', ['#ffd43b', '#f59f00']) },
              { n: 'A-Ling', h: 'rulan_jin', v: 1824, av: 'jl' },
              { n: 'jiujiu', h: 'You', v: me, av: 'me', me: true },
            ].sort((a, b) => b.v - a.v);
            const list = tab ? global : friends;
            const rows = list.map((p, i) => ({
              icon: { node: h('div.ll-rank', String(i + 1)) }, avatar: p.av, title: p.n + (p.me ? ' (You)' : ''), subtitle: p.h || null, detail: p.v.toLocaleString('en-US'),
              cls: [p.me ? 'll-me' : '', i === 0 ? 'll-top' : ''].join(' ').trim() || null,
              onTap: () => p.me ? JC.ui.toast('Your best: ' + p.v.toLocaleString('en-US'), { icon: 'trophy.fill' })
                : p.av === 'jl' ? JC.ui.alert({ title: 'Challenge A-Ling?', message: 'Beat 1,824 and Game Center will tell him. He will not take it well.', buttons: [{ text: 'Not Now' }, { text: 'Play', primary: true, onTap: () => { s.close && s.close(); start(); } }] })
                  : JC.ui.toast(p.n + ' · ' + p.v.toLocaleString('en-US'), { icon: 'person.crop.circle' }),
            }));
            return [h('div.ll-lb-head', h('div.ll-lb-ic', JC.icon('trophy.fill', { size: 30 })), h('div.ll-lb-t', 'High Score'), h('div.ll-lb-s', 'All Time · Koi Tower Games Center')),
              h('div.ll-lb-seg', JC.ui.segmented({ items: ['Friends', 'All Players'], value: tab, onChange: (i) => { tab = i; s.render(); } })),
              JC.ui.list([{ rows, footer: tab ? 'Top scores from players near Lanling and Yunmeng.' : 'A-Ling set 1,824 on Sep 30 and texted everyone. Sizhui says he wasn’t trying. Wei Ying fell in on purpose.' }])];
          },
        });
      }
      function howTo() {
        const items = [
          ['arrow.up', '#ff4f93', 'Tap to leap', 'Tap anywhere (or press Space) to hop to the next row. You only leap forward, so wait for a pad to drift under you.'],
          ['timer', '#ff9500', 'Keep the rhythm', 'Leap again within a second of landing to build a combo. Every ' + TUNE.comboStep + ' in a row raises your multiplier: ×1.5, ×2, then ×2.5. Hesitate and it resets.'],
          ['star.fill', '#f5b400', 'Perfect landings', 'Land near the middle of a pad for +5.'],
          ['lotus.fill', '#ff7eb3', 'Lotus flowers', 'Some pads carry a lotus. Land on it for +25.'],
          ['house.fill', '#a2845e', 'Pavilions', 'Every 12 rows there’s a pavilion dock: +50 and a breather. Your combo carries on.'],
          ['exclamationmark.triangle.fill', '#30b0c7', 'Watch out', 'Pads carry you sideways, so don’t ride off the edge. Bubbling pads sink for a moment. Fall in and you lose a lotus. Lose all three and it’s over.'],
        ];
        JC.ui.sheet({
          title: 'How to Play', detent: 'large', right: { text: 'Got It' }, cls: 'll-how',
          content: () => [h('div.ll-howto',
            h('div.ll-how-hero', JC.appIcon('lotusleap'), h('div.ll-how-hero-t', 'Cross the pond, row by row. Score points for every new row you reach.')),
            items.map(([ic, c, t, b]) => h('div.ll-how-i', h('div.ll-how-ic', { style: { '--c': c } }, JC.icon(ic, { size: 20 })), h('div', h('div.ll-how-t', t), h('div.ll-how-b', b)))))],
        });
      }
      function settingsSheet() {
        const set = (k, v) => JC.state.setting('prefs', Object.assign({}, prefs(), { [k]: v }));
        JC.ui.sheet({
          title: 'Settings', detent: 'medium', right: { text: 'Done' },
          content: () => [JC.ui.list([{ rows: [
            { title: 'Sound Effects', toggle: { on: prefs()['ll.sfx'] !== false, onChange: (v) => { set('ll.sfx', v); if (v) sfx('tap'); } } },
            { title: 'Haptics', toggle: { on: prefs()['ll.haptics'] !== false, onChange: (v) => { set('ll.haptics', v); if (v) JC.audio.haptic(10); } } },
            { title: 'Rhythm Ring', toggle: { on: prefs()['ll.ring'] !== false, onChange: (v) => set('ll.ring', v) } },
            { title: 'Reduce Motion', detail: reduced() ? 'On' : 'Off', chevron: true, onTap: () => JC.os.open('settings', { page: 'a11y.motion' }) },
          ], footer: 'The rhythm ring around the frog shows how long you have to keep your combo going. Sound follows the Silent switch; Reduce Motion follows Settings › Accessibility › Motion.' }])],
        });
      }

      // ── lifecycle ────────────────────────────────────────────────
      showTitle();
      startLoop();
      return {
        intent(intent) { if (intent && intent.board) setTimeout(leaderboard, 200); if (intent && intent.play) setTimeout(start, 100); },
        show() { resize(); startLoop(); },
        hide() { if (G && G.mode === 'play') pause(); stopLoop(); },
        back() { if (G && G.mode === 'play') { pause(); return true; } if (G && G.mode === 'paused') { resume(); return true; } return false; },
        destroy() { stopLoop(); window.removeEventListener('keydown', onKey); offs.forEach((f) => f()); },
        _debug: () => G,
        _jump: () => jump(),
        _start: () => start(),
        _loop: (on) => (on ? startLoop() : stopLoop()),
        _tick: (dt) => { update(dt); stepFx(dt); },
        _tune: (o) => Object.assign(TUNE, o || {}),
      };
    },
  });
})();
