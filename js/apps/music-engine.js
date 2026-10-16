/* Music — playback engine. Every song is synthesized live with WebAudio, deterministically from its id
   (pentatonic melodies, plucked guqin, pads, drums, chiptune pulses…), scheduled with a lookahead scheduler.
   Exposes JC.music (used by Control Center) and the Dynamic Island "Now Playing" activity. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const D = JC.musicData;

  // ── deterministic randomness ─────────────────────────────────────
  function hash(str) {
    let x = 2166136261;
    for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
    return x >>> 0;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (R, a) => a[Math.floor(R() * a.length) % a.length];

  // ── theory ───────────────────────────────────────────────────────
  const SCALE = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10] };
  const PENT = { maj: [0, 2, 4, 7, 9], min: [0, 3, 5, 7, 10] };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function chordPcs(mode, deg, seventh) {
    const sc = SCALE[mode];
    const out = [0, 2, 4].concat(seventh ? [6] : []).map((k) => {
      const i = deg + k;
      return sc[i % 7] + 12 * Math.floor(i / 7);
    });
    return out; // semitones above the key root (may exceed 12)
  }

  // ── styles ───────────────────────────────────────────────────────
  const STYLES = {
    guqin: { mode: 'maj', root: [50, 55], mel: 14, gain: 1.15, rest: 0.08,
      A: [[0, 5, 3, 4], [0, 0, 5, 4], [0, 3, 0, 4]], B: [[3, 4, 0, 5], [5, 3, 4, 0]], C: [[5, 4, 3, 4]],
      rhythm: [[2, 1, 1, 2, 2], [1, 1, 2, 1, 1, 2], [3, 1, 2, 2], [1.5, 0.5, 2, 1, 3], [2, 2, 1, 1, 2]] },
    ambient: { mode: 'maj', root: [48, 53], mel: 19, gain: 1.1, rest: 0.18,
      A: [[0, 5, 3, 0], [0, 3, 5, 4]], B: [[3, 0, 4, 5], [5, 3, 0, 4]], C: [[5, 3, 4, 4]],
      rhythm: [[4, 4], [3, 1, 4], [6, 2], [2, 2, 4], [5, 3]] },
    folk: { mode: 'maj', root: [55, 60], mel: 12, gain: 0.95, rest: 0.05,
      A: [[0, 4, 5, 3], [0, 3, 4, 0]], B: [[3, 4, 0, 5], [3, 0, 4, 0]], C: [[5, 3, 0, 4]],
      rhythm: [[1, 0.5, 0.5, 1, 1, 1, 1, 2], [0.5, 0.5, 1, 1, 0.5, 0.5, 1, 3], [1, 1, 0.5, 0.5, 1, 2, 2], [0.5, 0.5, 0.5, 0.5, 1, 1, 1, 3]] },
    folkslow: { mode: 'maj', root: [53, 58], mel: 12, gain: 1.0, rest: 0.06,
      A: [[0, 5, 3, 4], [0, 3, 0, 4]], B: [[3, 4, 0, 5], [3, 0, 4, 0]], C: [[5, 3, 4, 4]],
      rhythm: [[2, 1, 1, 4], [1, 1, 2, 4], [1.5, 0.5, 2, 4], [2, 2, 2, 2]] },
    gym: { mode: 'min', root: [45, 50], mel: 19, gain: 0.82, rest: 0.12,
      A: [[0, 0, 5, 6], [0, 5, 2, 6]], B: [[5, 6, 0, 0], [5, 2, 6, 0]], C: [[3, 4, 5, 6]],
      rhythm: [[0.5, 0.5, 1, 0.5, 0.5, 1, 1, 1, 2], [1, 0.5, 0.5, 1, 1, 0.5, 0.5, 1, 2], [0.5, 0.5, 0.5, 0.5, 1, 1, 2, 2]] },
    chip: { mode: 'maj', root: [57, 62], mel: 12, gain: 0.8, rest: 0.06,
      A: [[0, 4, 5, 3], [0, 5, 3, 4]], B: [[3, 4, 2, 5], [3, 4, 0, 0]], C: [[5, 3, 4, 4]],
      rhythm: [[0.5, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5, 1, 2], [0.25, 0.25, 0.5, 0.5, 0.5, 1, 1, 1, 1, 2], [1, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 0.5, 2]] },
    pop: { mode: 'maj', root: [55, 60], mel: 12, gain: 0.9, rest: 0.06,
      A: [[0, 4, 5, 3], [5, 3, 0, 4]], B: [[3, 4, 5, 0], [3, 0, 4, 5]], C: [[1, 4, 2, 5]],
      rhythm: [[1, 0.5, 1, 0.5, 1, 1, 3], [0.5, 0.5, 1, 1, 0.5, 1.5, 3], [1.5, 0.5, 1, 1, 1, 3]] },
    ballad: { mode: 'min', root: [52, 57], mel: 12, gain: 1.08, rest: 0.05,
      A: [[0, 5, 2, 6], [0, 3, 6, 2]], B: [[5, 6, 0, 0], [3, 6, 2, 5]], C: [[5, 3, 6, 4]],
      rhythm: [[2, 1, 1, 4], [1, 1, 1, 1, 4], [1.5, 0.5, 2, 4], [2, 2, 1, 3]] },
    lofi: { mode: 'maj', root: [53, 58], mel: 12, gain: 1.0, rest: 0.25,
      A: [[1, 4, 0, 5], [3, 2, 1, 4]], B: [[3, 4, 2, 5]], C: [[1, 4, 0, 0]],
      rhythm: [[1.5, 0.5, 1, 1, 4], [1, 1, 2, 4], [0.5, 1, 0.5, 2, 4], [2, 1.5, 0.5, 4]] },
  };

  // ── song plans (form, tempo, key) — cheap, cached ─────────────────
  const plans = {};
  function buildForm(n) {
    const body = [];
    let cycles = 0;
    while (body.length < n - 4) {
      body.push('A', 'A', 'A', 'A', 'B', 'B', 'B', 'B');
      cycles++;
      if (cycles === 2) body.push('C', 'C', 'C', 'C');
    }
    return ['I', 'I'].concat(body.slice(0, Math.max(4, n - 4)), ['O', 'O']);
  }
  function plan(id) {
    if (plans[id]) return plans[id];
    const s = D.song(id);
    if (!s) return null;
    const seed = hash(s.id);
    const R = rng(seed);
    const st = STYLES[s.style] || STYLES.pop;
    const bpm = s.bpm || 90;
    const beat = 60 / bpm;
    const phraseDur = beat * 8;
    let form;
    const lyr = [];
    if (s.lyrics) {
      form = s.lyrics.map((x) => (typeof x === 'string' ? x : x[0]));
      let lastInst = false;
      s.lyrics.forEach((x, i) => {
        if (typeof x === 'string') {
          if (!lastInst) lyr.push({ t: i * phraseDur, text: '', inst: true });
          lastInst = true;
        } else {
          lyr.push({ t: i * phraseDur, text: x[1] });
          lastInst = false;
        }
      });
    } else form = buildForm(Math.max(12, Math.round(s.dur / phraseDur)));
    const root = st.root[0] + Math.floor(R() * (st.root[1] - st.root[0] + 1));
    const p = {
      id, s, st, seed, bpm, beat, bar: beat * 4, phraseDur, form, root, mode: st.mode,
      dur: form.length * phraseDur, lyrics: lyr.length ? lyr : null,
      progs: { A: pick(R, st.A), B: pick(R, st.B), C: pick(R, st.C) },
      cache: {}, mel: {},
    };
    p.progs.I = p.progs.A;
    p.progs.O = p.progs.A;
    plans[id] = p;
    return p;
  }

  // melody for (section type, variant): list of { b (beat 0..8), d (beats), m (midi), v, slide, grace }
  function melody(p, type, variant, chords) {
    const key = type + variant;
    if (p.mel[key]) return p.mel[key];
    const R = rng(p.seed ^ hash(key) ^ 0x9e3779b9);
    const st = p.st;
    let pattern = pick(R, st.rhythm).slice();
    if (variant === 3) { // cadence: end on a long note
      pattern = pick(R, st.rhythm).slice();
      const last = pattern.pop();
      if (last < 2 && pattern.length) pattern[pattern.length - 1] += last; else pattern.push(last);
    }
    const pent = PENT[p.mode];
    const base = p.root + st.mel + (type === 'C' ? 5 : 0) + (type === 'B' && /pop|chip|folk/.test(p.s.style) ? 2 : 0);
    const pitches = [];
    for (let o = -1; o < 3; o++) pent.forEach((x) => { const m = p.root + 12 * Math.floor((base - p.root) / 12) + o * 12 + x; if (m >= base - 3 && m <= base + 17) pitches.push(m); });
    pitches.sort((a, b) => a - b);
    let idx = Math.floor(pitches.length / 2) + Math.floor(R() * 3) - 1;
    const notes = [];
    let b = 0;
    pattern.forEach((d, i) => {
      const isLast = i === pattern.length - 1;
      const chordDeg = chords[b < 4 ? 0 : 1];
      const pcs = chordPcs(p.mode, chordDeg).map((x) => ((x % 12) + 12) % 12);
      const rest = !isLast && b > 0 && R() < st.rest;
      if (!rest) {
        const strong = b % 2 === 0;
        let step = pick(R, [-2, -1, -1, 0, 1, 1, 2, -1, 1]);
        if (R() < 0.12) step = pick(R, [-3, 3, 4, -4]);
        idx = U.clamp(idx + step, 0, pitches.length - 1);
        if (strong || isLast) {
          // snap to the nearest chord tone
          let best = idx, bd = 99;
          pitches.forEach((m, j) => {
            const pc = (((m - p.root) % 12) + 12) % 12;
            if (pcs.includes(pc) && Math.abs(j - idx) < bd) { bd = Math.abs(j - idx); best = j; }
          });
          idx = best;
        }
        if (isLast && variant === 3) {
          let best = idx, bd = 99;
          pitches.forEach((m, j) => { if ((((m - p.root) % 12) + 12) % 12 === 0 && Math.abs(j - idx) < bd) { bd = Math.abs(j - idx); best = j; } });
          idx = best;
        }
        const n = { b, d, m: pitches[idx], v: 0.75 + R() * 0.25 + (strong ? 0.1 : 0) };
        if (p.s.style === 'guqin' && R() < 0.3) n.slide = pick(R, [-2, -2, 2, -3]);
        if ((p.s.style === 'folk' || p.s.style === 'folkslow') && d >= 1 && R() < 0.22) n.grace = pitches[Math.min(pitches.length - 1, idx + 1)];
        notes.push(n);
      }
      b += d;
    });
    p.mel[key] = notes;
    return notes;
  }

  function phraseMeta(p, pi) {
    const type = p.form[pi];
    let k = 0;
    while (pi - k - 1 >= 0 && p.form[pi - k - 1] === type) k++;
    return { type, k };
  }

  /** all notes of phrase pi, absolute song time (seconds). cached. */
  function phraseNotes(p, pi) {
    if (p.cache[pi]) return p.cache[pi];
    const { type, k } = phraseMeta(p, pi);
    const prog = p.progs[type] || p.progs.A;
    const chords = [prog[(2 * k) % 4], prog[(2 * k + 1) % 4]];
    const t0 = pi * p.phraseDur;
    const B = p.beat;
    const out = [];
    const R = rng(p.seed ^ (pi * 2654435761));
    const style = p.s.style;
    const total = p.form.length;
    const fade = pi >= total - 2 ? 1 - ((pi - (total - 2)) * 0.32) : 1;
    const intro = type === 'I';
    const add = (b, inst, m, d, v, extra) => { out.push(Object.assign({ at: t0 + b * B, inst, m, d: d * B, v: v * fade }, extra || {})); };
    const R0 = p.root;

    for (let bar = 0; bar < 2; bar++) {
      const deg = chords[bar];
      const pcs = chordPcs(p.mode, deg, style === 'lofi');
      const rootM = R0 + pcs[0];
      const ob = bar * 4;
      const barIndex = pi * 2 + bar;
      switch (style) {
        case 'guqin':
          add(ob, 'pluck', rootM - 12, 3, 0.5);
          add(ob + 2, 'pluck', R0 + pcs[2] - 12, 2, 0.3);
          add(ob, 'pad', [rootM - 12, R0 + pcs[2] - 12], 4.2, 0.22);
          if (barIndex % 4 === 3) add(ob + 3.5, 'bell', rootM + 24, 2, 0.16);
          if (intro && bar === 1) add(ob + 1, 'pluck', R0 + pcs[1], 2, 0.22, { slide: -2 });
          break;
        case 'ambient':
          add(ob, 'pad', pcs.map((x) => R0 + x), 4.6, 0.5);
          add(ob, 'drone', rootM - 12, 4.2, 0.35);
          for (let q = 0; q < 4; q++) if (R() < 0.28) add(ob + q + (R() < 0.5 ? 0.5 : 0), 'bell', R0 + 24 + pick(R, PENT[p.mode]), 2.5, 0.12 + R() * 0.08);
          break;
        case 'folk': {
          add(ob, 'bass', rootM - 12, 1.6, 0.6);
          add(ob + 2, 'bass', R0 + pcs[2] - 12, 1.6, 0.5);
          const arp = [0, 2, 1, 2, 0, 2, 1, 2];
          arp.forEach((ci, j) => add(ob + j * 0.5, 'gtr', R0 + pcs[ci] + (j === 4 ? 12 : 0), 0.9, j % 2 ? 0.22 : 0.3));
          if (!(intro && pi === 0)) {
            add(ob, 'kick', 0, 0.3, 0.5); add(ob + 2, 'kick', 0, 0.3, 0.45);
            add(ob + 1, 'clap', 0, 0.2, 0.32); add(ob + 3, 'clap', 0, 0.2, 0.32);
            for (let j = 0; j < 8; j++) add(ob + j * 0.5, 'shaker', 0, 0.1, j % 2 ? 0.5 : 0.3);
          }
          break;
        }
        case 'folkslow': {
          add(ob, 'bass', rootM - 12, 3.5, 0.5);
          [0, 1, 2, 3].forEach((q) => add(ob + q, 'gtr', R0 + pcs[[0, 2, 1, 2][q]] + (q === 2 ? 12 : 0), 1.8, 0.26));
          add(ob, 'pad', pcs.map((x) => R0 + x), 4.2, 0.18);
          if (!intro) { add(ob, 'kick', 0, 0.3, 0.32); add(ob + 2, 'shaker', 0, 0.1, 0.4); add(ob + 3.5, 'shaker', 0, 0.1, 0.25); }
          break;
        }
        case 'gym': {
          const build = intro && pi === 0;
          for (let q = 0; q < 4; q++) {
            if (!build) add(ob + q, 'kick', 0, 0.3, 0.75);
            if (!build && (q === 1 || q === 3)) add(ob + q, 'snare', 0, 0.2, 0.55);
            add(ob + q, 'hat', 0, 0.05, 0.25); add(ob + q + 0.5, 'hat', 0, q === 3 ? 0.25 : 0.05, q === 3 ? 0.4 : 0.32, { open: q === 3 });
          }
          for (let j = 0; j < 8; j++) add(ob + j * 0.5, 'saw', rootM - 24 + (j === 7 ? 12 : 0), 0.45, j % 2 ? 0.4 : 0.55);
          if (type === 'B' || type === 'C') { add(ob, 'stab', pcs.map((x) => R0 + x), 0.6, 0.45); add(ob + 1.5, 'stab', pcs.map((x) => R0 + x), 0.5, 0.35); }
          break;
        }
        case 'chip': {
          add(ob, 'ckick', 0, 0.15, 0.6); add(ob + 2, 'ckick', 0, 0.15, 0.6);
          add(ob + 1, 'csnare', 0, 0.12, 0.5); add(ob + 3, 'csnare', 0, 0.12, 0.5);
          for (let j = 0; j < 8; j++) { add(ob + j * 0.5, 'tri', rootM - 12 + (j % 2 ? 12 : 0), 0.45, 0.7); if (j % 2) add(ob + j * 0.5, 'chat', 0, 0.04, 0.3); }
          if (type !== 'A' || bar === 1) {
            const ar = [0, 1, 2, 1];
            for (let j = 0; j < 16; j++) add(ob + j * 0.25, 'pulse8', R0 + 12 + pcs[ar[j % 4]] + (j >= 8 ? 12 : 0), 0.22, 0.38);
          }
          break;
        }
        case 'pop': {
          add(ob, 'kick', 0, 0.3, 0.6); add(ob + 2, 'kick', 0, 0.3, 0.55); if (R() < 0.5) add(ob + 2.5, 'kick', 0, 0.3, 0.4);
          if (!(intro && pi === 0)) { add(ob + 1, 'snare', 0, 0.2, 0.42); add(ob + 3, 'snare', 0, 0.2, 0.42); }
          for (let j = 0; j < 8; j++) add(ob + j * 0.5, 'hat', 0, 0.05, j % 2 ? 0.22 : 0.15);
          [0, 1.5, 2, 3].forEach((q) => add(ob + q, 'ep', pcs.map((x) => R0 + x), 0.9, 0.32));
          [0, 1, 1.5, 2, 3].forEach((q, j) => add(ob + q, 'bass', (j === 3 ? R0 + pcs[2] : rootM) - 12, 0.45, 0.55));
          break;
        }
        case 'ballad': {
          const arp = [0, 2, 0, 1, 2, 0, 1, 2];
          arp.forEach((ci, j) => add(ob + j * 0.5, 'piano', R0 + pcs[ci] + (j === 0 ? -12 : j >= 4 ? 12 : 0), 1.4, j === 0 ? 0.42 : 0.24));
          add(ob, 'pad', pcs.map((x) => R0 + x), 4.4, 0.2);
          break;
        }
        case 'lofi': {
          add(ob, 'ep', pcs.map((x) => R0 + x), 3.4, 0.36, { warm: true });
          add(ob + 2.5, 'ep', pcs.slice(1).map((x) => R0 + x + 12), 0.9, 0.16, { warm: true });
          add(ob, 'bass', rootM - 12, 1.6, 0.55); add(ob + 2, 'bass', R0 + pcs[2] - 12, 1.2, 0.45);
          if (!(intro && pi === 0)) {
            add(ob, 'kick', 0, 0.3, 0.5); add(ob + 1.75, 'kick', 0, 0.3, 0.32); add(ob + 2.5, 'kick', 0, 0.3, 0.4);
            add(ob + 1, 'snare', 0, 0.2, 0.3, { soft: true }); add(ob + 3, 'snare', 0, 0.2, 0.3, { soft: true });
            for (let j = 0; j < 4; j++) { add(ob + j, 'hat', 0, 0.04, 0.16); add(ob + j + 0.62, 'hat', 0, 0.04, 0.1); }
          }
          for (let q = 0; q < 4; q++) if (R() < 0.5) add(ob + q + R(), 'crackle', 0, 0.01, 0.4);
          break;
        }
        default: break;
      }
    }

    // lead melody
    const variant = [0, 1, 0, 3][k % 4];
    const playMel = !(type === 'I' && ['gym', 'chip', 'pop', 'folk'].includes(style)) && !(type === 'I' && pi === 0 && style === 'lofi');
    if (playMel) {
      const mel = melody(p, type === 'O' ? 'A' : type, type === 'O' ? 3 : variant, chords);
      const lead = { guqin: 'pluck', ambient: 'xiao', folk: 'dizi', folkslow: 'dizi', gym: 'lead', chip: 'pulse25', pop: 'synth', ballad: 'voice', lofi: 'piano' }[style] || 'synth';
      const thin = (type === 'I' || (style === 'ambient' && type === 'A')) ? 0.55 : 1;
      mel.forEach((n, j) => {
        if (thin < 1 && j % 2 === 1) return;
        const v = n.v * (type === 'I' ? 0.7 : 1) * (style === 'gym' && type === 'A' ? 0.85 : 1);
        if (n.grace) add(n.b - 0.12 < 0 ? n.b : n.b - 0.12, lead, n.grace, 0.12, v * 0.6);
        add(n.b, lead, n.m + (style === 'gym' && type === 'B' ? 12 : 0), n.d, v, { slide: n.slide });
      });
    }
    out.sort((a, b) => a.at - b.at);
    p.cache[pi] = out;
    return out;
  }

  // ── WebAudio voices ──────────────────────────────────────────────
  let ctx = null, master = null, eqLow = null, eqHigh = null, comp = null, analyser = null, noiseBuf = null;
  const pulseWaves = {};
  function audio() {
    const c = JC.audio && JC.audio.ctx ? JC.audio.ctx() : null;
    if (!c) return null;
    if (ctx !== c) {
      ctx = c;
      master = ctx.createGain();
      master.gain.value = 0.9;
      eqLow = ctx.createBiquadFilter(); eqLow.type = 'lowshelf'; eqLow.frequency.value = 180;
      eqHigh = ctx.createBiquadFilter(); eqHigh.type = 'highshelf'; eqHigh.frequency.value = 3800;
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.25;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.72;
      master.connect(eqLow); eqLow.connect(eqHigh); eqHigh.connect(comp); comp.connect(analyser);
      analyser.connect(JC.audio.out || ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      applyEQ();
      ctx.addEventListener && ctx.addEventListener('statechange', onCtxState);
    }
    return ctx;
  }
  const EQS = {
    off: [0, 0], acoustic: [2, 3], bass: [6, 0], 'bass-reducer': [-6, 0], treble: [0, 6], 'treble-reducer': [0, -6],
    'late-night': [3, -2], 'small-speakers': [-3, 3], vocal: [-2, 4], loudness: [5, 4], piano: [1, 3], rock: [4, 3],
  };
  function applyEQ() {
    if (!ctx) return;
    const e = EQS[JC.state.setting('musicEQ') || 'off'] || EQS.off;
    eqLow.gain.setTargetAtTime(e[0], ctx.currentTime, 0.05);
    eqHigh.gain.setTargetAtTime(e[1], ctx.currentTime, 0.05);
  }
  function pulseWave(duty) {
    if (pulseWaves[duty]) return pulseWaves[duty];
    const n = 40;
    const re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    pulseWaves[duty] = ctx.createPeriodicWave(re, im);
    return pulseWaves[duty];
  }
  function osc(type, f, t, end, dest) {
    const o = ctx.createOscillator();
    if (typeof type === 'number') o.setPeriodicWave(pulseWave(type)); else o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.connect(dest);
    o.start(t);
    o.stop(end + 0.05);
    return o;
  }
  function gainNode(dest) { const g = ctx.createGain(); g.gain.value = 0; g.connect(dest); return g; }
  function adsr(g, t, a, peak, end, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(0.0001, Math.max(t + a, end - (rel || 0.1)), (rel || 0.1) / 3);
  }
  function perc(g, t, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
  }
  function noise(t, dur, dest, filterType, freq, q) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq; f.Q.value = q || 0.8;
    src.connect(f); f.connect(dest);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
    return f;
  }

  const V = {
    pluck(n, t, out) { // guqin-like plucked string with optional slide
      const f = mtof(n.m);
      const len = Math.min(n.d * 1.4 + 0.8, 3.6);
      const g = gainNode(out);
      perc(g, t, 0.3 * n.v, len);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 1.4;
      lp.frequency.setValueAtTime(Math.min(9000, f * 9), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(260, f * 1.6), t + len);
      lp.connect(g);
      const o1 = osc('triangle', f, t, t + len, lp);
      const g2 = gainNode(lp); g2.gain.setValueAtTime(0.32, t); g2.gain.exponentialRampToValueAtTime(0.001, t + len * 0.5);
      const o2 = osc('sine', f * 2.003, t, t + len, g2);
      const g3 = gainNode(lp); g3.gain.setValueAtTime(0.12, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc('sawtooth', f, t, t + 0.3, g3);
      if (n.slide) {
        const from = f * Math.pow(2, n.slide / 12);
        [o1, o2].forEach((o, i) => { o.frequency.setValueAtTime(from * (i ? 2.003 : 1), t); o.frequency.exponentialRampToValueAtTime(f * (i ? 2.003 : 1), t + 0.16); });
      }
      const ng = gainNode(out); perc(ng, t, 0.05 * n.v, 0.03); noise(t, 0.04, ng, 'bandpass', 3200, 1);
    },
    bell(n, t, out) {
      const f = mtof(n.m);
      const g = gainNode(out); perc(g, t, 0.09 * n.v, 2.4);
      osc('sine', f, t, t + 2.4, g);
      const g2 = gainNode(out); perc(g2, t, 0.03 * n.v, 1.2);
      osc('sine', f * 2.76, t, t + 1.2, g2);
    },
    pad(n, t, out) {
      const ms = Array.isArray(n.m) ? n.m : [n.m];
      const end = t + n.d;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = 0.5;
      const g = gainNode(out);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05 * n.v, t + Math.min(0.9, n.d / 3));
      g.gain.setTargetAtTime(0.0001, end - 0.4, 0.35);
      lp.connect(g);
      ms.forEach((m) => { const f = mtof(m); osc('sawtooth', f * 1.003, t, end + 1, lp); osc('sawtooth', f * 0.997, t, end + 1, lp); });
    },
    drone(n, t, out) {
      const g = gainNode(out); adsr(g, t, 1.2, 0.12 * n.v, t + n.d, 1);
      osc('sine', mtof(n.m), t, t + n.d + 1, g);
    },
    xiao(n, t, out) { // breathy vertical flute
      const f = mtof(n.m);
      const end = t + Math.max(0.2, n.d * 0.96);
      const g = gainNode(out); adsr(g, t, 0.09, 0.15 * n.v, end, 0.25);
      const o = osc('sine', f, t, end + 0.3, g);
      const o2g = gainNode(g); o2g.gain.value = 0.18; osc('triangle', f * 2, t, end + 0.3, o2g);
      if (n.d > 0.5) {
        const lfo = ctx.createOscillator(); const lg = ctx.createGain();
        lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.007, t + Math.min(0.5, n.d * 0.5));
        lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end + 0.3);
      }
      const ng = gainNode(out); adsr(ng, t, 0.05, 0.035 * n.v, t + 0.18, 0.1); noise(t, 0.3, ng, 'bandpass', f * 2, 2);
    },
    dizi(n, t, out) { // brighter bamboo flute
      const f = mtof(n.m);
      const end = t + Math.max(0.1, n.d * 0.9);
      const g = gainNode(out); adsr(g, t, 0.03, 0.12 * n.v, end, 0.12);
      const o = osc('triangle', f, t, end + 0.15, g);
      const g2 = gainNode(g); g2.gain.value = 0.35; osc('sine', f * 2, t, end + 0.15, g2);
      if (n.d > 0.4) {
        const lfo = ctx.createOscillator(); const lg = ctx.createGain();
        lfo.frequency.value = 6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.009, t + 0.3);
        lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end + 0.15);
      }
      const ng = gainNode(out); adsr(ng, t, 0.02, 0.03 * n.v, end, 0.1); noise(t, end - t + 0.1, ng, 'bandpass', f * 3, 3);
    },
    gtr(n, t, out) {
      const f = mtof(n.m);
      const len = Math.min(n.d + 0.3, 1.6);
      const g = gainNode(out); perc(g, t, 0.13 * n.v, len);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 6, t); lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + len); lp.connect(g);
      osc('triangle', f, t, t + len, lp);
      const g2 = gainNode(lp); g2.gain.value = 0.3; osc('square', f, t, t + 0.08, g2);
    },
    bass(n, t, out) {
      const f = mtof(n.m);
      const end = t + n.d * 0.92;
      const g = gainNode(out); adsr(g, t, 0.008, 0.32 * n.v, end, 0.08);
      osc('sine', f, t, end + 0.1, g);
      const g2 = gainNode(out); adsr(g2, t, 0.005, 0.07 * n.v, t + 0.12, 0.06); osc('triangle', f * 2, t, t + 0.2, g2);
    },
    saw(n, t, out) { // pumping gym bass
      const f = mtof(n.m);
      const end = t + n.d * 0.85;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5;
      lp.frequency.setValueAtTime(1400, t); lp.frequency.exponentialRampToValueAtTime(220, t + 0.2);
      const g = gainNode(out); adsr(g, t, 0.004, 0.15 * n.v, end, 0.05);
      lp.connect(g);
      osc('sawtooth', f, t, end + 0.08, lp);
      osc('square', f / 2, t, end + 0.08, lp);
    },
    stab(n, t, out) {
      const end = t + n.d;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(500, end);
      const g = gainNode(out); adsr(g, t, 0.005, 0.05 * n.v, end, 0.08); lp.connect(g);
      n.m.forEach((m) => { osc('sawtooth', mtof(m) * 1.004, t, end + 0.1, lp); osc('sawtooth', mtof(m) * 0.996, t, end + 0.1, lp); });
    },
    lead(n, t, out) {
      const f = mtof(n.m);
      const end = t + Math.max(0.08, n.d * 0.9);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(1600, end); lp.Q.value = 2;
      const g = gainNode(out); adsr(g, t, 0.006, 0.075 * n.v, end, 0.06); lp.connect(g);
      osc('square', f, t, end + 0.1, lp); osc('sawtooth', f * 1.005, t, end + 0.1, lp);
    },
    synth(n, t, out) {
      const f = mtof(n.m);
      const end = t + Math.max(0.1, n.d * 0.9);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      const g = gainNode(out); adsr(g, t, 0.02, 0.1 * n.v, end, 0.12); lp.connect(g);
      const o = osc('sawtooth', f, t, end + 0.15, lp);
      const g2 = gainNode(g); g2.gain.value = 0.9; osc('sine', f, t, end + 0.15, g2);
      if (n.d > 0.6) { const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + 0.35); lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end + 0.15); }
    },
    voice(n, t, out) { // soft "humming" lead for ballads
      const f = mtof(n.m);
      const end = t + Math.max(0.15, n.d * 0.95);
      const g = gainNode(out); adsr(g, t, 0.07, 0.15 * n.v, end, 0.3);
      const o = osc('sine', f, t, end + 0.35, g);
      const g2 = gainNode(g); g2.gain.value = 0.22; osc('triangle', f, t, end + 0.35, g2);
      const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 4.8; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + 0.6); lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end + 0.35);
    },
    piano(n, t, out) {
      const f = mtof(n.m);
      const len = Math.min(n.d * 1.8 + 0.4, 2.8);
      const g = gainNode(out); perc(g, t, 0.16 * n.v, len);
      osc('sine', f, t, t + len, g);
      const g2 = gainNode(out); perc(g2, t, 0.05 * n.v, len * 0.5); osc('sine', f * 2, t, t + len, g2);
      const g3 = gainNode(out); perc(g3, t, 0.025 * n.v, len * 0.25); osc('triangle', f * 3, t, t + len, g3);
    },
    ep(n, t, out) { // electric piano chord
      const ms = Array.isArray(n.m) ? n.m : [n.m];
      const len = Math.min(n.d + 0.4, 3.8);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = n.warm ? 1500 : 3200;
      const g = gainNode(out); perc(g, t, 0.07 * n.v, len); lp.connect(g);
      ms.forEach((m) => { const f = mtof(m); osc('sine', f, t, t + len, lp); const g2 = gainNode(lp); perc(g2, t, 0.35, 0.4); osc('sine', f * 4.01, t, t + 0.5, g2); });
    },
    pulse25(n, t, out) {
      const f = mtof(n.m);
      const end = t + Math.max(0.06, n.d * 0.85);
      const g = gainNode(out);
      g.gain.setValueAtTime(0.07 * n.v, t); g.gain.setValueAtTime(0.05 * n.v, t + 0.05); g.gain.setValueAtTime(0.0001, end);
      const o = osc(0.25, f, t, end + 0.02, g);
      if (n.d > 0.5) { const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 7; lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(f * 0.012, t + 0.18); lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end); }
    },
    pulse8(n, t, out) {
      const end = t + n.d * 0.8;
      const g = gainNode(out); g.gain.setValueAtTime(0.04 * n.v, t); g.gain.setValueAtTime(0.0001, end);
      osc(0.125, mtof(n.m), t, end + 0.02, g);
    },
    tri(n, t, out) {
      const end = t + n.d * 0.85;
      const g = gainNode(out); g.gain.setValueAtTime(0.2 * n.v, t); g.gain.setValueAtTime(0.0001, end);
      osc('triangle', mtof(n.m), t, end + 0.02, g);
    },
    kick(n, t, out) {
      const g = gainNode(out); perc(g, t, 0.55 * n.v, 0.32);
      const o = osc('sine', 150, t, t + 0.35, g);
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.12);
    },
    snare(n, t, out) {
      const g = gainNode(out); perc(g, t, (n.soft ? 0.2 : 0.32) * n.v, n.soft ? 0.12 : 0.17); noise(t, 0.2, g, n.soft ? 'lowpass' : 'bandpass', n.soft ? 2600 : 1900, 0.8);
      const g2 = gainNode(out); perc(g2, t, 0.12 * n.v, 0.08); osc('triangle', 185, t, t + 0.1, g2);
    },
    hat(n, t, out) { const g = gainNode(out); perc(g, t, 0.11 * n.v, n.open ? 0.22 : 0.045); noise(t, 0.25, g, 'highpass', 7600, 0.7); },
    clap(n, t, out) {
      const g = gainNode(out);
      g.gain.setValueAtTime(0.0001, t);
      [0, 0.012, 0.024].forEach((dt) => { g.gain.setValueAtTime(0.22 * n.v, t + dt); g.gain.exponentialRampToValueAtTime(0.02, t + dt + 0.01); });
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      noise(t, 0.18, g, 'bandpass', 1500, 1);
    },
    shaker(n, t, out) { const g = gainNode(out); adsr(g, t, 0.012, 0.05 * n.v, t + 0.07, 0.03); noise(t, 0.12, g, 'bandpass', 6200, 1.6); },
    ckick(n, t, out) { const g = gainNode(out); g.gain.setValueAtTime(0.3 * n.v, t); g.gain.setValueAtTime(0.0001, t + 0.11); const o = osc('triangle', 220, t, t + 0.12, g); o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.1); },
    csnare(n, t, out) { const g = gainNode(out); g.gain.setValueAtTime(0.13 * n.v, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.12); noise(t, 0.13, g, 'highpass', 1200, 0.5); },
    chat(n, t, out) { const g = gainNode(out); g.gain.setValueAtTime(0.05 * n.v, t); g.gain.setValueAtTime(0.0001, t + 0.03); noise(t, 0.04, g, 'highpass', 8000, 0.5); },
    crackle(n, t, out) { const g = gainNode(out); perc(g, t, 0.05 * n.v, 0.012); noise(t, 0.02, g, 'highpass', 2500, 0.5); },
  };

  // ── engine state ─────────────────────────────────────────────────
  const st = {
    cur: null, queue: [], qi: -1, src: null, // src: {kind, id, title}
    playing: false, pos: 0, shuffle: false, repeat: 'off', orig: null,
    clock: 'perf', t0: 0, p0: 0, schedTo: 0, bus: null, loops: [], timer: null, airplay: 'iphone', autoplay: true,
  };
  const lib = () => JC.store.get('mlib', 'lib') || { favs: [], dlAlbums: [], recent: [], plays: {} };
  function nowT() { return st.clock === 'ctx' && ctx ? ctx.currentTime : performance.now() / 1000; }
  function curPos() {
    if (!st.playing) return st.pos;
    return Math.max(0, st.p0 + (nowT() - st.t0));
  }
  function emit() { JC.bus.emit('music', api.nowPlaying()); island(); }

  function startSession(pos) {
    const c = audio();
    if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } }
    st.clock = c && c.state === 'running' ? 'ctx' : 'perf';
    st.p0 = pos;
    st.t0 = nowT() + (st.clock === 'ctx' ? 0.06 : 0);
    st.schedTo = pos;
    if (st.clock === 'ctx') {
      st.bus = ctx.createGain();
      st.bus.gain.setValueAtTime(0, ctx.currentTime);
      st.bus.gain.linearRampToValueAtTime((STYLES[D.song(st.cur).style] || {}).gain || 1, ctx.currentTime + 0.05);
      st.bus.connect(master);
      const s = D.song(st.cur);
      if (s && s.style === 'lofi') startRain();
    }
    clearInterval(st.timer);
    st.timer = setInterval(tick, 45);
    tick();
  }
  function endSession() {
    clearInterval(st.timer);
    st.timer = null;
    st.loops.forEach((l) => { try { l.stop(); } catch (e) { /* ignore */ } });
    st.loops = [];
    const bus = st.bus;
    st.bus = null;
    if (bus && ctx) {
      try {
        bus.gain.cancelScheduledValues(ctx.currentTime);
        bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
        bus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
      } catch (e) { /* ignore */ }
      setTimeout(() => { try { bus.disconnect(); } catch (e) { /* ignore */ } }, 160);
    }
  }
  function startRain() {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
    const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 500;
    lfo.connect(lg); lg.connect(lp.frequency);
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(st.bus);
    src.start(); lfo.start();
    st.loops.push(src, lfo);
  }
  function tick() {
    if (!st.playing || !st.cur) return;
    const p = plan(st.cur);
    const pos = curPos();
    if (pos >= p.dur) { ended(); return; }
    if (st.clock !== 'ctx' || !st.bus) return;
    const ahead = document.hidden ? 1.6 : 0.3;
    if (st.schedTo < pos) st.schedTo = pos;
    const until = Math.min(p.dur, pos + ahead);
    if (until <= st.schedTo) return;
    const pi0 = Math.floor(st.schedTo / p.phraseDur);
    const pi1 = Math.min(p.form.length - 1, Math.floor(until / p.phraseDur));
    for (let pi = pi0; pi <= pi1; pi++) {
      phraseNotes(p, pi).forEach((n) => {
        if (n.at < st.schedTo || n.at >= until) return;
        const fn = V[n.inst];
        const when = st.t0 + (n.at - st.p0);
        if (!fn || when < ctx.currentTime - 0.01) return;
        try { fn(n, Math.max(when, ctx.currentTime), st.bus); } catch (e) { /* ignore a bad voice */ }
      });
    }
    st.schedTo = until;
  }
  function onCtxState() {
    if (ctx && ctx.state === 'running' && st.playing && st.clock !== 'ctx') {
      const pos = curPos();
      endSession();
      startSession(pos);
    }
  }

  function ended() {
    if (st.repeat === 'one') { seek(0); return; }
    if (st.qi < st.queue.length - 1) { loadIndex(st.qi + 1, true); return; }
    if (st.repeat === 'all' && st.queue.length) { loadIndex(0, true); return; }
    if (st.autoplay && st.cur) {
      // Autoplay: keep going with similar music
      const last = D.song(st.cur);
      const similar = D.songs.filter((s) => s.style === last.style && !st.queue.includes(s.id)).map((s) => s.id);
      const more = shuffleArr(similar.length ? similar : D.songs.map((s) => s.id).filter((x) => x !== st.cur)).slice(0, 6);
      st.queue.push(...more);
      loadIndex(st.qi + 1, true);
      return;
    }
    // end of queue
    endSession();
    st.playing = false;
    st.pos = 0;
    emit();
  }

  function recordPlay(id) {
    const L = lib();
    if (!L.id) return;
    const plays = Object.assign({}, L.plays || {});
    plays[id] = (plays[id] || 0) + 1;
    let recent = (L.recent || []).slice();
    if (st.src && st.src.kind && st.src.id) {
      recent = recent.filter((r) => !(r.kind === st.src.kind && r.id === st.src.id));
      recent.unshift({ kind: st.src.kind, id: st.src.id, t: JC.time.now() });
    } else {
      recent = recent.filter((r) => !(r.kind === 'song' && r.id === id));
      recent.unshift({ kind: 'song', id, t: JC.time.now() });
    }
    JC.store.update('mlib', 'lib', { plays, recent: recent.slice(0, 20) });
  }

  function loadIndex(i, autoplay, pos) {
    endSession();
    st.qi = i;
    st.cur = st.queue[i] || null;
    st.pos = pos || 0;
    if (!st.cur) { st.playing = false; emit(); return; }
    plan(st.cur);
    if (autoplay) {
      st.playing = true;
      startSession(st.pos);
      recordPlay(st.cur);
    } else st.playing = false;
    emit();
  }

  function seek(sec) {
    if (!st.cur) return;
    const p = plan(st.cur);
    const pos = U.clamp(sec, 0, Math.max(0, p.dur - 0.25));
    if (st.playing) { endSession(); startSession(pos); } else st.pos = pos;
    emit();
  }

  function shuffleArr(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function resolve(id) {
    if (D.song(id)) return { kind: 'song', ids: [id] };
    const pl = JC.store.get('mplaylists', id);
    if (pl) return { kind: 'playlist', ids: pl.songs.slice(), title: pl.title };
    const al = D.album(id);
    if (al) return { kind: 'album', ids: al.songs.slice(), title: al.title };
    const stn = D.stations.find((x) => x.id === id);
    if (stn) return { kind: 'station', ids: shuffleArr(D.songs.filter((s) => stn.styles.includes(s.style)).map((s) => s.id)), title: stn.name };
    const ar = D.artist(id);
    if (ar) return { kind: 'artist', ids: D.songs.filter((s) => s.artist === id).map((s) => s.id), title: ar.name };
    const cat = D.categories.find((x) => x.id === id);
    if (cat) return { kind: 'category', ids: cat.ids ? cat.ids.slice() : D.songs.filter((s) => cat.styles.includes(s.style)).map((s) => s.id), title: cat.title };
    if (id === 'favorites') return { kind: 'playlist', ids: (lib().favs || []).slice(), title: 'Favorite Songs' };
    if (api.virtual[id]) return { kind: 'playlist', ids: api.virtual[id].ids(), title: api.virtual[id].title };
    if (id === 'all') return { kind: 'library', ids: D.songs.map((s) => s.id), title: 'Songs' };
    return null;
  }

  /** play(id, {start: songId, shuffle, queue: [ids], src}) */
  function play(id, o) {
    o = o || {};
    let ids = o.queue ? o.queue.slice() : null;
    let src = o.src || null;
    if (!ids) {
      const r = resolve(id);
      if (!r) return false;
      if (r.kind === 'song') {
        // play a song in the context of its album
        const s = D.song(id);
        const al = D.album(s.album);
        ids = al ? al.songs.slice() : [id];
        src = src || (al ? { kind: 'album', id: al.id, title: al.title } : null);
        o.start = id;
      } else {
        ids = r.ids;
        src = src || { kind: r.kind, id, title: r.title };
      }
    }
    if (!ids.length) return false;
    st.src = src;
    st.orig = ids.slice();
    let start = o.start ? Math.max(0, ids.indexOf(o.start)) : 0;
    st.shuffle = !!o.shuffle;
    if (st.shuffle) {
      const first = o.start ? o.start : ids[Math.floor(Math.random() * ids.length)];
      ids = [first].concat(shuffleArr(ids.filter((x) => x !== first)));
      start = 0;
    }
    st.queue = ids;
    loadIndex(start, true);
    return true;
  }
  function pause() {
    if (!st.playing) return;
    st.pos = curPos();
    st.playing = false;
    endSession();
    emit();
  }
  function resume() {
    if (!st.cur) { play('pl_lotus'); return; }
    if (st.playing) return;
    const p = plan(st.cur);
    if (st.pos >= p.dur - 0.3) st.pos = 0;
    st.playing = true;
    startSession(st.pos);
    emit();
  }
  function next() {
    if (!st.queue.length) return;
    if (st.qi < st.queue.length - 1) loadIndex(st.qi + 1, st.playing || true);
    else if (st.repeat !== 'off') loadIndex(0, true);
    else { loadIndex(0, false); }
  }
  function prev() {
    if (!st.cur) return;
    if (curPos() > 3 || st.qi === 0) { seek(0); if (!st.playing) resume(); return; }
    loadIndex(st.qi - 1, true);
  }
  function setShuffle(on) {
    on = !!on;
    if (on === st.shuffle) return;
    st.shuffle = on;
    const cur = st.cur;
    if (on) {
      const rest = shuffleArr(st.queue.filter((x, i) => i > st.qi));
      st.orig = st.orig || st.queue.slice();
      st.queue = st.queue.slice(0, st.qi + 1).concat(rest);
    } else if (st.orig) {
      const i = st.orig.indexOf(cur);
      st.queue = st.orig.slice();
      st.qi = Math.max(0, i);
    }
    emit();
  }
  function setRepeat(m) { st.repeat = m; emit(); }
  function playNext(id) {
    const r = resolve(id);
    if (!r) return;
    if (!st.cur) { play(id); return; }
    st.queue.splice(st.qi + 1, 0, ...r.ids);
    emit();
  }
  function playLast(id) {
    const r = resolve(id);
    if (!r) return;
    if (!st.cur) { play(id); return; }
    st.queue.push(...r.ids);
    emit();
  }
  function removeAt(i) {
    if (i <= st.qi || i >= st.queue.length) return;
    st.queue.splice(i, 1);
    emit();
  }
  function move(from, to) {
    if (from <= st.qi || to <= st.qi || from >= st.queue.length) return;
    to = Math.min(st.queue.length - 1, to);
    const [x] = st.queue.splice(from, 1);
    st.queue.splice(to, 0, x);
    emit();
  }
  function stop() {
    endSession();
    st.playing = false;
    st.cur = null;
    st.queue = [];
    st.qi = -1;
    st.pos = 0;
    emit();
  }

  /** 4 band levels 0..1 for visualizers */
  const fbuf = new Uint8Array(64);
  function levels() {
    if (!st.playing) return [0, 0, 0, 0];
    if (!analyser || st.clock !== 'ctx') {
      const t = performance.now() / 1000;
      const p = st.cur ? plan(st.cur) : null;
      const beat = p ? p.beat : 0.5;
      const ph = (t % beat) / beat;
      return [0.35 + 0.5 * (1 - ph), 0.4 + 0.3 * Math.sin(t * 7), 0.4 + 0.3 * Math.sin(t * 9 + 1), 0.3 + 0.25 * Math.sin(t * 11 + 2)];
    }
    analyser.getByteFrequencyData(fbuf);
    const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += fbuf[i]; return s / ((b - a) * 255); };
    return [band(1, 3), band(3, 7), band(7, 16), band(16, 40)].map((x) => U.clamp(x * 1.6, 0, 1));
  }

  const api = {
    hash,
    plan,
    STYLES,
    nowPlaying() {
      if (!st.cur) return null;
      const s = D.song(st.cur);
      const p = plan(st.cur);
      return { id: s.id, title: s.title, artist: D.artistName(s.artist), art: D.art(s), album: s.album, playing: st.playing, pos: curPos(), dur: p.dur };
    },
    state: () => ({ cur: st.cur, queue: st.queue.slice(), qi: st.qi, src: st.src, playing: st.playing, shuffle: st.shuffle, repeat: st.repeat, airplay: st.airplay, autoplay: st.autoplay }),
    virtual: {},
    setAutoplay(on) { st.autoplay = !!on; emit(); },
    pos: () => (st.cur ? curPos() : 0),
    dur: (id) => { const p = plan(id || st.cur); return p ? p.dur : 0; },
    lyrics: (id) => { const p = plan(id || st.cur); return p ? p.lyrics : null; },
    toggle() { if (st.playing) pause(); else resume(); },
    play(id, o) { return play(id, o); },
    pause, resume, next, prev, seek, stop,
    setShuffle, setRepeat, playNext, playLast, removeAt, move,
    levels,
    setAirplay(id) { st.airplay = id; emit(); },
    applyEQ,
    isPlaying: () => st.playing,
  };
  JC.music = api;

  // ── Dynamic Island activity ──────────────────────────────────────
  let islOn = false;
  const eqBars = h('div.mui-eq', [0, 1, 2, 3].map(() => h('span.mui-eqb')));
  let eqRAF = null;
  function eqLoop() {
    eqRAF = null;
    const lv = levels();
    Array.from(eqBars.children).forEach((b, i) => {
      const v = st.playing ? 0.18 + lv[i] * 0.82 : 0.18;
      b.style.transform = `scaleY(${v.toFixed(3)})`;
    });
    if (st.playing && islOn) eqRAF = requestAnimationFrame(eqLoop);
  }
  function accent() {
    const s = st.cur && D.song(st.cur);
    const al = s && D.album(s.album);
    return (al && al.accent) || '#fa2d48';
  }
  function island() {
    if (!JC.os || !JC.os.island) return;
    const want = !!st.cur && !(JC.os.isOpen && JC.os.isOpen('music'));
    if (!want) {
      if (islOn) { JC.os.island.stop('music'); islOn = false; }
      return;
    }
    eqBars.style.setProperty('--eqc', accent());
    const def = {
      priority: 1,
      width: 214,
      compact: () => {
        const s = D.song(st.cur);
        return { left: JC.art.el(D.art(s), { cls: 'mui-thumb' }), right: eqBars };
      },
      expanded: (el) => buildExpanded(el),
      onTap: () => JC.os.open('music', { nowPlaying: true }),
    };
    if (!islOn) { JC.os.island.start('music', def); islOn = true; } else JC.os.island.update('music', def);
    if (!eqRAF) eqRAF = requestAnimationFrame(eqLoop);
  }
  function buildExpanded(el) {
    const s = D.song(st.cur);
    if (!s) return;
    const stop = (fn) => (e) => { e.stopPropagation(); fn(); };
    const fill = h('div.mui-x-fill');
    const tl = h('span', U.fmtDur(curPos()));
    const tr = h('span', '-' + U.fmtDur(plan(st.cur).dur - curPos()));
    const playBtn = h('div.mui-x-btn.big', { onTap: stop(() => { api.toggle(); paint(); }) }, JC.icon(st.playing ? 'pause.fill' : 'play.fill', { size: 30 }));
    el.append(
      h('div.mui-x-top',
        JC.art.el(D.art(s), { cls: 'mui-x-art' }),
        h('div.mui-x-meta', h('div.mui-x-title', s.title), h('div.mui-x-artist', D.artistName(s.artist))),
        h('div.mui-x-eq', eqBars)),
      h('div.mui-x-scrub', tl, h('div.mui-x-track', fill), tr),
      h('div.mui-x-ctrls',
        h('div.mui-x-btn', { onTap: stop(() => JC.os.open('music', { nowPlaying: true, airplay: true })) }, JC.icon('airplayaudio', { size: 20 })),
        h('div.mui-x-btn', { onTap: stop(() => { api.prev(); paint(); }) }, JC.icon('backward.fill', { size: 26 })),
        playBtn,
        h('div.mui-x-btn', { onTap: stop(() => { api.next(); paint(); }) }, JC.icon('forward.fill', { size: 26 })),
        h('div.mui-x-btn', { onTap: stop(() => JC.os.open('music', { nowPlaying: true })) }, JC.icon('music.note.list', { size: 20 }))));
    const paint = () => {
      if (!st.cur) return;
      const p = plan(st.cur);
      const ns = D.song(st.cur);
      el.querySelector('.mui-x-title').textContent = ns.title;
      el.querySelector('.mui-x-artist').textContent = D.artistName(ns.artist);
      const pos = curPos();
      fill.style.width = (pos / p.dur) * 100 + '%';
      tl.textContent = U.fmtDur(pos);
      tr.textContent = '-' + U.fmtDur(p.dur - pos);
      playBtn.innerHTML = '';
      playBtn.appendChild(JC.icon(st.playing ? 'pause.fill' : 'play.fill', { size: 30 }));
    };
    paint();
    const iv = setInterval(() => { if (!el.isConnected || !el.firstChild) { clearInterval(iv); return; } paint(); }, 500);
    if (!eqRAF) eqRAF = requestAnimationFrame(eqLoop);
  }

  JC.icon.add({
    airplayaudio: '<path d="M7 17.5a7.5 7.5 0 1 1 10 0"/><path d="M9.3 15a4.5 4.5 0 1 1 5.4 0"/><path d="M12 15.2 7.6 20.5h8.8z" fill="currentColor" stroke="none"/>',
    'quote.bubble': '<path d="M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z"/><path d="M8.6 12.6c0-1.3.6-2.3 1.9-2.8M12.6 12.6c0-1.3.6-2.3 1.9-2.8" stroke-width="2.2"/>',
    'quote.bubble.fill': '<path d="M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z" fill="currentColor" stroke="none"/><path d="M8.6 12.6c0-1.3.6-2.3 1.9-2.8M12.6 12.6c0-1.3.6-2.3 1.9-2.8" stroke-width="2.2" style="stroke:var(--knock,#000)"/>',
    'music.mic': '<circle cx="15.5" cy="8.5" r="4.5"/><path d="M12.4 11.7 4.6 19.4a1.4 1.4 0 0 0 2 2l7.7-7.8"/>',
    'square.stack': '<rect x="4" y="8" width="16" height="12.5" rx="2.4"/><path d="M6.5 5.2h11M8.8 2.8h6.4"/>',
    'arrow.down.circle': '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M8.2 12.8 12 16.6l3.8-3.8"/>',
    'arrow.down.circle.fill': '<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/><path d="M12 7.5v9M8.2 12.8 12 16.6l3.8-3.8" style="stroke:var(--knock,#fff)" stroke-width="2"/>',
    'person.crop.square': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="10" r="3.2"/><path d="M6.8 18.4c1-2.4 3-3.6 5.2-3.6s4.2 1.2 5.2 3.6"/>',
    'repeat.1': '<path d="M4.5 11V9.5a3 3 0 0 1 3-3h12M19.5 13v1.5a3 3 0 0 1-3 3h-12"/><path d="m16.8 3.8 2.7 2.7-2.7 2.7M7.2 20.2l-2.7-2.7 2.7-2.7"/><path d="M11.3 10.6l1.2-.8v4.6" stroke-width="1.6"/>',
    'infinity': '<path d="M12 12c-2-2.6-3.6-4-5.6-4a4 4 0 0 0 0 8c2 0 3.6-1.4 5.6-4zm0 0c2 2.6 3.6 4 5.6 4a4 4 0 0 0 0-8c-2 0-3.6 1.4-5.6 4z"/>',
    'radio': '<rect x="3" y="8" width="18" height="12" rx="2.4"/><path d="M7 8l9-4.5"/><circle cx="15.5" cy="14" r="2.6"/><path d="M6.5 12.5h4M6.5 15.5h4"/>',
    'play.circle.fill': '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M10 8.2v7.6l6-3.8z" style="fill:var(--knock,#fff)" stroke="none"/>',
    'speaker.wave.3.fill': '<path d="M4 9.3h3l4.4-3.7c.5-.4 1.2 0 1.2.6v11.6c0 .6-.7 1-1.2.6L7 14.7H4a1 1 0 0 1-1-1V10.3a1 1 0 0 1 1-1z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.6a7.5 7.5 0 0 1 0 10.8M20.4 4.3a11 11 0 0 1 0 15.4"/>',
    'hifispeaker.fill': '<rect x="6" y="2.8" width="12" height="18.4" rx="3" fill="currentColor" stroke="none"/><circle cx="12" cy="14.5" r="3.3" style="stroke:var(--knock,#fff)"/><circle cx="12" cy="7.2" r="1.3" style="fill:var(--knock,#fff)" stroke="none"/>',
    'tv.fill': '<rect x="2.5" y="4.5" width="19" height="12.5" rx="2.4" fill="currentColor" stroke="none"/><path d="M8 20h8"/>',
    'car.side': '<path d="M3 15.5v-2.7c0-.8.5-1.4 1.2-1.6l2.3-.6 2.2-3c.4-.6 1.1-.9 1.8-.9h4.3c.8 0 1.5.4 1.9 1l1.8 2.6 2.2.6c.7.2 1.3.9 1.3 1.6v3"/><circle cx="7.5" cy="16" r="2"/><circle cx="16.5" cy="16" r="2"/>',
    'star.circle': '<circle cx="12" cy="12" r="9"/><path d="m12 6.8 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"/>',
    'text.badge.plus': '<path d="M3.5 6.5h10M3.5 11.5h10M3.5 16.5h7"/><path d="M18 13v7M14.5 16.5h7"/>',
    'minus.circle': '<circle cx="12" cy="12" r="9"/><path d="M7.5 12h9"/>',
    'line.3.horizontal.handle': '<path d="M5 8h14M5 12h14M5 16h14"/>',
  });

  // ── reactions to the rest of the phone ───────────────────────────
  JC.bus.on('app:open', () => setTimeout(island, 30));
  JC.bus.on('app:home', () => setTimeout(island, 30));
  JC.bus.on('lock', () => setTimeout(island, 30));
  JC.bus.on('setting:musicEQ', applyEQ);
  let resumeAfterCall = false;
  JC.bus.on('story:call', (c) => {
    if (c && (c.phase === 'ringing' || c.phase === 'active')) {
      if (st.playing) { resumeAfterCall = true; pause(); }
    } else if (resumeAfterCall) {
      resumeAfterCall = false;
      setTimeout(() => { if (!(JC.story.call && JC.story.call())) resume(); }, 900);
    }
  });
  JC.bus.on('story:reset', () => { resumeAfterCall = false; stop(); });
  document.addEventListener('visibilitychange', () => { if (st.playing) tick(); });
})();
