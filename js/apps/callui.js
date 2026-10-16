/* Call UI — the global in-call layer drawn into #call-layer: incoming "contact poster" screens,
   outgoing / active calls with Live Captions and the player's story choices, FaceTime video,
   the Dynamic Island call activity. Also:
     JC.voiceBed — soft synthesized "voices" (voicemails, voice memos, call murmur), WebAudio only.
     JC.callui   — dialing helpers shared by Phone, Contacts, FaceTime and Mail (numbers, businesses). */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;

  // Compatibility shim (see docs/REQUESTS.md): story.js defines both `call(def)` (authoring) and
  // `call()` (current call getter) on the same name, and the getter wins — so call definitions never
  // register. Make JC.story.call() do both, exactly as docs/DEV.md describes.
  if (JC.story && JC.story.defs && !JC.story.call.__dual) {
    const getter = JC.story.call;
    const dual = function (def) {
      if (def && typeof def === 'object' && def.id) { JC.story.defs.calls[def.id] = def; return def; }
      return getter.call(JC.story);
    };
    dual.__dual = true;
    JC.story.call = dual;
  }

  JC.icon.add({
    'video.slash.fill': '<path d="M3.5 7.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="currentColor" stroke="none"/><path d="M16.5 10.2 21 7.4v9.2l-4.5-2.8z" fill="currentColor" stroke="none"/><path d="M3 3l18 18" stroke-width="2.2" style="stroke:var(--knock,#000)"/><path d="M3.8 3.8l16.4 16.4" stroke-width="1.6"/>',
    'quote.bubble': '<path d="M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z"/><path d="M8.7 10.2h2.2v2.2c0 1-.5 1.7-1.5 2M13.2 10.2h2.2v2.2c0 1-.5 1.7-1.5 2" stroke-width="1.6"/>',
    'captions.bubble': '<rect x="3" y="5" width="18" height="13" rx="3"/><path d="M10.4 10.2a2 2 0 1 0 0 3.6M16.4 10.2a2 2 0 1 0 0 3.6"/>',
    'person.wave': '<circle cx="9" cy="8" r="3.4"/><path d="M3 19.5c.5-3.4 3.1-5.4 6-5.4s5.5 2 6 5.4"/><path d="M17.5 8.5c1 1 1 2.5 0 3.5M19.8 6.6c2 2 2 5.3 0 7.3"/>',
  });

  // ══ Seeded randomness ════════════════════════════════════════════
  function hash(s) {
    let x = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    return x >>> 0;
  }
  function rng(seed) {
    let a = hash(seed) || 1;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ══ JC.voiceBed — murmured speech synthesis ══════════════════════
  // f0: base pitch (Hz), range: pitch movement, rate: syllables speed, breath: noise mix, fs: formant scale
  const VOICES = {
    me: { f0: 118, range: 1.05, rate: 0.95, breath: 0.18, fs: 1 },
    wwx: { f0: 138, range: 1.35, rate: 1.22, breath: 0.2, fs: 1.02 },
    jl: { f0: 152, range: 1.28, rate: 1.18, breath: 0.18, fs: 1.04 },
    lxc: { f0: 116, range: 1.08, rate: 0.84, breath: 0.3, fs: 1 },
    lwj: { f0: 98, range: 1.03, rate: 0.78, breath: 0.25, fs: 0.97 },
    nhs: { f0: 150, range: 1.4, rate: 1.2, breath: 0.22, fs: 1.05 },
    wn: { f0: 124, range: 1.12, rate: 0.95, breath: 0.32, fs: 1 },
    sz: { f0: 142, range: 1.15, rate: 1, breath: 0.2, fs: 1.04 },
    jy: { f0: 156, range: 1.38, rate: 1.3, breath: 0.15, fs: 1.05 },
    mian: { f0: 202, range: 1.12, rate: 1, breath: 0.22, fs: 1.14 },
    ea: { f0: 192, range: 1.06, rate: 1.12, breath: 0.16, fs: 1.13 },
    huang: { f0: 104, range: 1.16, rate: 0.84, breath: 0.34, fs: 0.96, rough: 1 },
    liu: { f0: 212, range: 1.16, rate: 1.16, breath: 0.18, fs: 1.15 },
    bai: { f0: 140, range: 1.3, rate: 1.26, breath: 0.2, fs: 1.04 },
    qr: { f0: 98, range: 1.04, rate: 0.78, breath: 0.22, fs: 0.95 },
    mom: { f0: 206, range: 1.1, rate: 1.02, breath: 0.18, fs: 1.12 },
    dad: { f0: 110, range: 1.08, rate: 0.84, breath: 0.32, fs: 0.98 },
    ajie: { f0: 226, range: 1.2, rate: 0.95, breath: 0.32, fs: 1.16 },
    baby: { f0: 330, range: 1.45, rate: 0.85, breath: 0.25, fs: 1.32 },
    sys: { f0: 196, range: 1.02, rate: 1.08, breath: 0.05, fs: 1.12, robot: true },
  };
  function vparams(who) {
    if (VOICES[who]) return VOICES[who];
    const n = hash(who || 'x');
    const fem = n % 2 === 0;
    return { f0: fem ? 195 + (n % 30) : 112 + (n % 30), range: 1.12, rate: 1, breath: 0.2, fs: fem ? 1.13 : 1 };
  }
  const VOWEL_F = { a: [760, 1250], e: [520, 1850], i: [330, 2250], o: [540, 930], u: [370, 830], y: [420, 2000] };

  function tokenize(text) {
    const out = [];
    const re = /\(([^)]*)\)|([0-9A-Za-zÀ-ɏ一-鿿'’]+(?:[-‑][0-9A-Za-zÀ-ɏ一-鿿'’]+)*)|(\.\.\.|…|[.,!?;:。，！？]|—|–|-)|(\s+)|([\s\S])/gu;
    let m;
    while ((m = re.exec(text))) {
      if (m[1] != null) out.push({ k: 'ev', s: m[0], inner: m[1].toLowerCase() });
      else if (m[2]) out.push({ k: 'w', s: m[2] });
      else if (m[3]) out.push({ k: 'p', s: m[3] });
      else if (m[4]) out.push({ k: 'sp', s: m[4] });
      else out.push({ k: 'x', s: m[5] });
    }
    return out;
  }
  function sylCount(w) {
    const han = w.replace(/[^一-鿿]/g, '').length;
    if (han) return U.clamp(han, 1, 12);
    const g = w.toLowerCase().match(/[aeiouy]+/g);
    let n = g ? g.length : 1;
    if (/[^aeiou]e$/i.test(w) && n > 1) n--;
    return U.clamp(n, 1, 5);
  }
  function sylVowel(w, i) {
    const g = w.toLowerCase().match(/[aeiouy]/g) || ['a', 'o', 'e'];
    return g[i % g.length];
  }
  const PUNCT_GAP = { ',': 0.26, '，': 0.26, ';': 0.3, ':': 0.3, '.': 0.5, '。': 0.5, '!': 0.5, '！': 0.5, '?': 0.52, '？': 0.52, '—': 0.34, '–': 0.3, '-': 0.14, '…': 0.9, '...': 0.9 };

  /** Build a timed transcript: display segments + timed syllables/events fitted to `dur` seconds. */
  function timeline(parts, dur, seed) {
    const R = rng(seed);
    const seq = []; // timed events
    const words = []; // timed display tokens
    const segs = []; // display segments [{s, wi, part, ev}]
    let sentence = [];
    const endSentence = (q) => {
      const n = sentence.length;
      sentence.forEach((e, i) => {
        const x = n > 1 ? i / (n - 1) : 0;
        let c = 1.09 - 0.2 * x;
        if (q && i >= n - 2) c *= i === n - 1 ? 1.32 : 1.15;
        e.f *= c;
      });
      sentence = [];
    };
    parts.forEach((p, pi) => {
      const v = vparams(p.who);
      if (p.ambient) { seq.push({ t: 'amb', d: p.d || 2, kind: p.ambient, part: pi, stretch: 3 }); return; }
      if (pi > 0) {
        segs.push({ s: '', br: true, part: pi });
        seq.push({ t: 'gap', d: 0.4, w: 0.9 });
      }
      tokenize(p.text || '').forEach((tok) => {
        if (tok.k === 'w') {
          const wi = words.length;
          words.push({ part: pi, s: tok.s });
          segs.push({ s: tok.s, wi, part: pi });
          const n = sylCount(tok.s);
          const loud = /^[A-Z]{2,}/.test(tok.s);
          for (let i = 0; i < n; i++) {
            if (i) seq.push({ t: 'gap', d: 0.016, w: 0 });
            const e = { t: 'syl', d: (0.13 + R() * 0.08) / v.rate, vow: sylVowel(tok.s, i), who: p.who, wi, f: v.f0 * (1 + (R() - 0.5) * 0.2 * v.range), amp: (0.72 + R() * 0.28) * (loud ? 1.15 : 1) };
            if (loud) e.f *= 1.18;
            seq.push(e);
            sentence.push(e);
          }
          seq.push({ t: 'gap', d: (0.055 + R() * 0.05) / v.rate, w: 0.3 });
        } else if (tok.k === 'p') {
          segs.push({ s: tok.s, part: pi, pw: words.length - 1 });
          const d = PUNCT_GAP[tok.s] || 0.2;
          const last = seq[seq.length - 1];
          if (last && last.t === 'gap') { last.d = Math.max(last.d, d); last.w = Math.max(last.w, d * 2.4); } else seq.push({ t: 'gap', d, w: d * 2.4 });
          if (/[.!?…。！？]/.test(tok.s)) endSentence(/[?？]/.test(tok.s));
        } else if (tok.k === 'ev') {
          const wi = words.length;
          words.push({ part: pi, s: tok.s, ev: true });
          segs.push({ s: tok.s, wi, part: pi, ev: true });
          const inner = tok.inner;
          let kind = 'sil', d = 1, stretch = 1;
          if (/long pause/.test(inner)) { d = 2.4; stretch = 4.5; }
          else if (/pause|silence|quiet/.test(inner)) { d = 1.4; stretch = 2.6; }
          else if (/sigh|breath|exhale|inhale/.test(inner)) { kind = 'breath'; d = 0.9; stretch = 0.6; }
          else if (/laugh|chuckle|giggle/.test(inner)) { kind = 'laugh'; d = 0.9; }
          else if (/beep|tone/.test(inner)) { kind = 'beep'; d = 0.5; stretch = 0; }
          else if (/engine|motor|car/.test(inner)) { kind = 'engine'; d = 2.4; stretch = 2; }
          else if (/rain|water|lake|wind|traffic|noise|crowd|music/.test(inner)) { kind = /wind/.test(inner) ? 'wind' : /rain|water|lake/.test(inner) ? 'rain' : 'room'; d = 2; stretch = 2; }
          seq.push({ t: 'ev', d, kind, wi, stretch, who: p.who, f: v.f0 });
          seq.push({ t: 'gap', d: 0.2, w: 0.4 });
        } else if (tok.k === 'sp') segs.push({ s: tok.s, part: pi, sp: true, pw: words.length - 1 });
        else segs.push({ s: tok.s, part: pi, pw: words.length - 1 });
      });
      endSentence(false);
    });
    // ── fit to the requested duration ──
    const lead = 0.35;
    let trail = 0.5;
    const sum = (fn) => seq.reduce((a, e) => a + fn(e), 0);
    let S = sum((e) => (e.t === 'syl' || e.t === 'ev' || e.t === 'amb' ? e.d : 0));
    let G = sum((e) => (e.t === 'gap' ? e.d : 0));
    if (dur && dur > 0) {
      const natural = lead + S + G + trail;
      if (natural > dur) {
        const k = Math.max(0.2, (dur - lead - trail) / Math.max(0.01, S + G));
        seq.forEach((e) => { e.d *= k; });
      } else {
        let extra = dur - natural;
        const slow = Math.min(1.32, 1 + (extra / Math.max(1, S + G)) * 0.22);
        seq.forEach((e) => { if (e.t === 'syl') e.d *= slow; });
        S = sum((e) => (e.t === 'syl' || e.t === 'ev' || e.t === 'amb' ? e.d : 0));
        extra = Math.max(0, dur - (lead + S + G + trail));
        const W = sum((e) => (e.t === 'gap' ? e.w : e.t === 'ev' || e.t === 'amb' ? (e.stretch || 0) * e.d : 0));
        if (W > 0) seq.forEach((e) => {
          const w = e.t === 'gap' ? e.w : e.t === 'ev' || e.t === 'amb' ? (e.stretch || 0) * e.d : 0;
          if (w) e.d += (extra * w) / W;
        });
        else trail += extra;
      }
    }
    let t = lead;
    seq.forEach((e) => { e.t0 = t; t += e.d; e.t1 = t; });
    const total = dur && dur > 0 ? dur : t + trail;
    words.forEach((w, i) => {
      const es = seq.filter((e) => e.wi === i);
      w.t0 = es.length ? es[0].t0 : 0;
      w.t1 = es.length ? es[es.length - 1].t1 : 0;
    });
    // amplitude envelope samples for waveforms (0..1)
    const env = (n) => {
      const out = new Array(n).fill(0);
      seq.forEach((e) => {
        if (e.t === 'gap') return;
        const a = e.t === 'syl' ? e.amp : e.kind === 'sil' ? 0 : e.kind === 'beep' ? 0.6 : 0.35;
        const i0 = Math.floor((e.t0 / total) * n), i1 = Math.ceil((e.t1 / total) * n);
        for (let i = Math.max(0, i0); i < Math.min(n, i1); i++) out[i] = Math.max(out[i], a);
      });
      return out;
    };
    return { seq, words, segs, total, env };
  }

  let noiseBuf = null;
  function noiseBuffer(ctx) {
    if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function liveCtx() {
    const ctx = JC.audio.ctx();
    if (!ctx || !JC.audio.out) return null;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  /** build the audio graph for one playback session */
  function graph(ctx, o) {
    const nodes = [];
    const mk = (n) => { nodes.push(n); return n; };
    const master = mk(ctx.createGain());
    master.gain.value = 0;
    master.connect(JC.audio.out);
    const lp = mk(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.value = o.vintage ? 2500 : o.earpiece ? 2900 : 3500;
    const hp = mk(ctx.createBiquadFilter());
    hp.type = 'highpass';
    hp.frequency.value = o.vintage ? 360 : 260;
    hp.connect(lp);
    lp.connect(master);
    const osc = mk(ctx.createOscillator());
    osc.type = 'sawtooth';
    osc.frequency.value = 120;
    const vib = mk(ctx.createOscillator());
    vib.frequency.value = 5.1;
    const vibG = mk(ctx.createGain());
    vibG.gain.value = 1.6;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    if (o.vintage) {
      const wow = mk(ctx.createOscillator());
      wow.frequency.value = 0.55;
      const wowG = mk(ctx.createGain());
      wowG.gain.value = 9;
      wow.connect(wowG);
      wowG.connect(osc.detune);
      wow.start();
    }
    const env = mk(ctx.createGain());
    env.gain.value = 0;
    osc.connect(env);
    const nz = mk(ctx.createBufferSource());
    nz.buffer = noiseBuffer(ctx);
    nz.loop = true;
    const nzG = mk(ctx.createGain());
    nzG.gain.value = 0;
    nz.connect(nzG);
    const bp = (f, q) => { const b = mk(ctx.createBiquadFilter()); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; return b; };
    const f1 = bp(700, 6.5), f2 = bp(1250, 8), f3 = bp(2650, 9);
    const g = (v) => { const x = mk(ctx.createGain()); x.gain.value = v; return x; };
    const g1 = g(1.25), g2 = g(0.7), g3 = g(0.28);
    [env, nzG].forEach((s) => { s.connect(f1); s.connect(f2); s.connect(f3); });
    f1.connect(g1); f2.connect(g2); f3.connect(g3);
    [g1, g2, g3].forEach((x) => x.connect(hp));
    // line hiss / tape
    const hiss = mk(ctx.createBufferSource());
    hiss.buffer = noiseBuffer(ctx);
    hiss.loop = true;
    const hissF = mk(ctx.createBiquadFilter());
    hissF.type = 'bandpass';
    hissF.frequency.value = o.vintage ? 2200 : 3000;
    hissF.Q.value = 0.4;
    const hissG = g(o.vintage ? 0.03 : o.hiss != null ? o.hiss : 0.008);
    hiss.connect(hissF);
    hissF.connect(hissG);
    hissG.connect(master);
    osc.start();
    vib.start();
    nz.start(0, Math.random());
    hiss.start(0, Math.random());
    return { ctx, master, osc, env, nz, nzG, f1, f2, f3, hp, nodes, extra: [] };
  }

  function ambientBed(G, kind, st, en, level) {
    const ctx = G.ctx;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const f = ctx.createBiquadFilter();
    const gg = ctx.createGain();
    gg.gain.value = 0;
    if (kind === 'engine') { f.type = 'lowpass'; f.frequency.value = 210; }
    else if (kind === 'wind') { f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.9; }
    else if (kind === 'rain') { f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.45; }
    else { f.type = 'lowpass'; f.frequency.value = 620; }
    src.connect(f);
    f.connect(gg);
    gg.connect(G.master);
    const peak = (level || 1) * (kind === 'engine' ? 0.5 : kind === 'rain' ? 0.32 : kind === 'wind' ? 0.3 : 0.18);
    gg.gain.setTargetAtTime(peak, st, 0.25);
    gg.gain.setTargetAtTime(0, Math.max(st + 0.1, en - 0.3), 0.2);
    src.start(st, Math.random());
    src.stop(en + 0.6);
    G.extra.push(src, f, gg);
    if (kind === 'engine') {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = 46;
      const og = ctx.createGain();
      og.gain.value = 0;
      og.gain.setTargetAtTime(0.18 * (level || 1), st, 0.2);
      og.gain.setTargetAtTime(0, Math.max(st + 0.1, en - 0.3), 0.2);
      o.connect(og);
      og.connect(G.master);
      o.start(st);
      o.stop(en + 0.6);
      G.extra.push(o, og);
    }
    if (kind === 'rain') {
      // a few close drops
      const R = rng(st);
      for (let t = st + 0.2; t < en - 0.2; t += 0.08 + R() * 0.35) {
        const d = ctx.createBufferSource();
        d.buffer = noiseBuffer(ctx);
        const df = ctx.createBiquadFilter();
        df.type = 'highpass';
        df.frequency.value = 2500 + R() * 2500;
        const dg = ctx.createGain();
        dg.gain.setValueAtTime(0.0001, t);
        dg.gain.exponentialRampToValueAtTime(0.05 + R() * 0.06, t + 0.004);
        dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        d.connect(df);
        df.connect(dg);
        dg.connect(G.master);
        d.start(t, R());
        d.stop(t + 0.08);
      }
    }
  }

  function schedule(G, tl, from, until, T0, o) {
    const env = G.env.gain, nzg = G.nzG.gain, fr = G.osc.frequency;
    env.cancelScheduledValues(T0);
    env.setValueAtTime(0, T0);
    nzg.setValueAtTime(0, T0);
    tl.seq.forEach((e) => {
      if (e.t1 <= from || e.t0 >= until || e.t === 'gap') return;
      const st = T0 + Math.max(0, e.t0 - from);
      const en = T0 + (Math.min(until, e.t1) - from);
      if (en - st < 0.02) return;
      if (e.t === 'syl') {
        const v = vparams(e.who);
        const fs = v.fs || 1;
        const [F1, F2] = VOWEL_F[e.vow] || VOWEL_F.a;
        const a = e.amp * (v.robot ? 0.8 : 1);
        env.setTargetAtTime(a, st, 0.012);
        env.setTargetAtTime(0, Math.max(st + 0.03, en - 0.035), 0.02);
        nzg.setTargetAtTime(a * (v.breath || 0.2) * (v.rough ? 1.6 : 1), st, 0.012);
        nzg.setTargetAtTime(0, Math.max(st + 0.03, en - 0.035), 0.02);
        fr.setTargetAtTime(e.f, st, v.robot ? 0.005 : 0.03);
        G.f1.frequency.setTargetAtTime(F1 * fs, st, 0.02);
        G.f2.frequency.setTargetAtTime(F2 * fs, st, 0.025);
      } else if (e.t === 'ev') {
        if (e.kind === 'breath') {
          nzg.setTargetAtTime(0.5, st, 0.12);
          nzg.setTargetAtTime(0, Math.max(st + 0.1, en - 0.25), 0.12);
          G.f1.frequency.setTargetAtTime(600, st, 0.05);
          G.f2.frequency.setTargetAtTime(1500, st, 0.05);
        } else if (e.kind === 'laugh') {
          const v = vparams(e.who);
          for (let k = 0; k < 3; k++) {
            const s2 = st + k * ((en - st) / 3);
            env.setTargetAtTime(0.8, s2, 0.01);
            env.setTargetAtTime(0, s2 + (en - st) / 6, 0.02);
            fr.setTargetAtTime(v.f0 * (1.35 - k * 0.08), s2, 0.01);
            nzg.setTargetAtTime(0.25, s2, 0.01);
            nzg.setTargetAtTime(0, s2 + (en - st) / 6, 0.02);
          }
          G.f1.frequency.setTargetAtTime(800, st, 0.02);
          G.f2.frequency.setTargetAtTime(1300, st, 0.02);
        } else if (e.kind === 'beep') {
          const ob = G.ctx.createOscillator();
          const gb = G.ctx.createGain();
          ob.frequency.value = 1000;
          gb.gain.setValueAtTime(0.0001, st);
          gb.gain.exponentialRampToValueAtTime(0.12, st + 0.01);
          gb.gain.setValueAtTime(0.12, en - 0.02);
          gb.gain.exponentialRampToValueAtTime(0.0001, en);
          ob.connect(gb);
          gb.connect(G.master);
          ob.start(st);
          ob.stop(en + 0.05);
          G.extra.push(ob, gb);
        } else if (e.kind !== 'sil') ambientBed(G, e.kind, st, en, 1);
      } else if (e.t === 'amb') ambientBed(G, e.kind, st, en, 1);
    });
    if (o.ambient) ambientBed(G, o.ambient, T0, T0 + (until - from), o.ambientLevel || 0.7);
  }

  function stopGraph(G) {
    if (!G) return;
    const t = G.ctx.currentTime;
    try {
      G.master.gain.cancelScheduledValues(t);
      G.master.gain.setTargetAtTime(0, t, 0.02);
    } catch (e) { /* ignore */ }
    setTimeout(() => {
      G.nodes.concat(G.extra).forEach((n) => {
        try { if (n.stop) n.stop(); } catch (e) { /* already stopped */ }
        try { n.disconnect(); } catch (e) { /* ignore */ }
      });
    }, 120);
  }

  /** A playable voice recording. o: { parts:[{who,text,ambient}] | who+text, dur, seed, vintage, gain, earpiece, ambient, offset, fullDur, onTick(pos), onEnd() } */
  function player(o) {
    o = o || {};
    const parts = o.parts && o.parts.length ? o.parts : [{ who: o.who || 'me', text: o.text || '' }];
    const full = o.fullDur || o.dur || 0;
    const tl = timeline(parts, full, o.seed || parts.map((p) => p.text || p.ambient).join('|'));
    const offset = o.offset || 0;
    const dur = o.dur || tl.total;
    let playing = false, pos = 0, pos0 = 0, wall0 = 0, G = null, loop = null, gain = o.gain == null ? 1 : o.gain;
    const now = () => (playing ? Math.min(dur, pos0 + (performance.now() - wall0) / 1000) : pos);
    const p = {
      tl, dur, offset,
      get playing() { return playing; },
      pos: now,
      play(from) {
        if (from != null) pos = U.clamp(from, 0, dur);
        if (pos >= dur - 0.05) pos = 0;
        if (playing) p.pause();
        playing = true;
        pos0 = pos;
        wall0 = performance.now();
        const ctx = liveCtx();
        if (ctx) {
          try {
            G = graph(ctx, o);
            const T0 = ctx.currentTime + 0.04;
            G.master.gain.setValueAtTime(0, ctx.currentTime);
            G.master.gain.setTargetAtTime(0.95 * gain, T0, 0.03);
            schedule(G, tl, offset + pos, offset + dur, T0, o);
          } catch (e) { console.warn('[voiceBed] audio failed', e); G = null; }
        }
        clearInterval(loop);
        loop = setInterval(() => {
          const t = now();
          if (o.onTick) o.onTick(t);
          if (t >= dur - 0.001) {
            p.pause();
            pos = dur;
            if (o.onTick) o.onTick(dur);
            if (o.onEnd) o.onEnd();
          }
        }, 70);
        if (o.onTick) o.onTick(pos);
        return p;
      },
      pause() {
        if (!playing) return p;
        pos = now();
        playing = false;
        clearInterval(loop);
        stopGraph(G);
        G = null;
        return p;
      },
      toggle() { return playing ? p.pause() : p.play(); },
      seek(t) {
        const was = playing;
        if (was) p.pause();
        pos = U.clamp(t, 0, dur);
        if (was) p.play();
        else if (o.onTick) o.onTick(pos);
        return p;
      },
      setGain(v) {
        gain = v;
        if (G) G.master.gain.setTargetAtTime(0.95 * gain, G.ctx.currentTime, 0.05);
      },
      /** index of the last word that has started at time t (relative) */
      wordAt(t) {
        const T = (t == null ? now() : t) + offset;
        let idx = -1;
        tl.words.forEach((w, i) => { if (w.t0 <= T + 0.02) idx = i; });
        return idx;
      },
      destroy() { p.pause(); },
    };
    return p;
  }

  /** waveform bars (0..1) for a recording, deterministic from its seed */
  function bars(o, n) {
    const parts = o.parts && o.parts.length ? o.parts : [{ who: o.who || 'me', text: o.text || '' }];
    const tl = timeline(parts, o.fullDur || o.dur || 0, o.seed || parts.map((p) => p.text || p.ambient).join('|'));
    const env = tl.env(n);
    const R = rng('bars:' + (o.seed || ''));
    const amb = o.ambient || parts.some((p) => p.ambient);
    return env.map((a) => U.clamp((a ? a * (0.45 + R() * 0.55) : amb ? 0.08 + R() * 0.12 : 0.03 + R() * 0.04), 0.03, 1));
  }

  function tone(f, t, d, gain) {
    const ctx = liveCtx();
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.08, t + 0.01);
    g.gain.setValueAtTime(gain || 0.08, t + d - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(JC.audio.out);
    o.start(t);
    o.stop(t + d + 0.05);
  }

  const murmurs = new Set();
  JC.voiceBed = {
    VOICES,
    timeline,
    player,
    bars,
    rng,
    hash,
    /** one-shot murmur (calls). returns the player */
    say(who, text, o) {
      o = o || {};
      const plain = String(text || '').replace(/\([^)]*\)/g, ' ');
      const len = plain.length;
      const dur = o.dur || U.clamp(0.7 + len * 0.055, 1.1, 6.4);
      const p = player({ parts: [{ who, text: plain }], dur, gain: o.gain == null ? 0.7 : o.gain, earpiece: !!o.earpiece, seed: who + ':' + text, onEnd: () => murmurs.delete(p) });
      murmurs.add(p);
      p.play(0);
      return p;
    },
    hush() { murmurs.forEach((p) => p.destroy()); murmurs.clear(); },
    /** special information tones (disconnected number) */
    sit() {
      const ctx = liveCtx();
      if (!ctx) return;
      const t = ctx.currentTime + 0.05;
      tone(913.8, t, 0.274, 0.07);
      tone(1370.6, t + 0.3, 0.274, 0.07);
      tone(1776.7, t + 0.6, 0.38, 0.07);
    },
    beep(f, d) { const ctx = liveCtx(); if (ctx) tone(f || 1000, ctx.currentTime + 0.02, d || 0.35, 0.09); },
    busy() { const ctx = liveCtx(); if (!ctx) return; const t = ctx.currentTime + 0.02; for (let i = 0; i < 3; i++) tone(450, t + i * 0.7, 0.35, 0.06); },
  };

  // ══ Dialing helpers ══════════════════════════════════════════════
  const PSEUDO = '_ph_num';
  const CALL_ID = '_ph_num_call';
  const digits = (s) => String(s || '').replace(/[^\d+*#]/g, '');
  const core = (s) => digits(s).replace(/^\+?86/, '').replace(/^0+/, '');

  /** in-world businesses reachable by phone (numbers appear in Mail) */
  const BIZ = [
    {
      num: '+86 555 0880 1808', name: 'Golden Peony Hotel', label: 'front desk',
      nodes: {
        start: [
          { say: 'Golden Peony Hotel, front desk. Good evening — oh. Mr. Jiang? Is everything alright? Your key card hasn’t been used since this afternoon.' },
          { choice: [
            { t: '"…Fine."', go: 'fine' },
            { t: '"Hold the room."', go: 'hold' },
            { t: 'Tell them you found Mr. Jiang’s phone', go: 'truth' },
            { t: '(Hang up)', go: 'hang' },
          ] },
        ],
        fine: [{ say: 'Of course, sir. Turndown is done, and the tea you asked for is in the room. Good night, Mr. Jiang.' }, { hangup: true }],
        hold: [{ say: 'Room 1808 is yours until Sunday, sir. Late checkout is noted. No flowers, as requested.' }, { hangup: true }],
        hang: [{ hangup: 'me' }],
        truth: [
          { say: 'You… found his phone? In a taxi? Oh, thank goodness. Please — let me take your details, we’ll make sure it gets back to him tonight.' },
          { fx: { set: { told_truth: true } } }, { wait: 1 }, { ending: 'honest' },
        ],
      },
    },
    {
      num: '+86 555 0418 6600', name: 'Lanling International School', label: 'office',
      nodes: {
        start: [
          { say: 'You have reached the office of Lanling International School. The office is now closed. Office hours are seven-thirty to five, Monday to Friday.', from: 'sys' },
          { say: 'If you are calling about the chemistry laboratory, the laboratory is fine.', from: 'sys' },
          { hangup: true },
        ],
      },
    },
    {
      num: '+86 555 0601 3300', name: 'Pet Kingdom Lanling', label: 'store',
      nodes: {
        start: [
          { say: 'Thank you for calling Pet Kingdom Lanling! We are closed. Our hours are nine AM to nine PM, every day. Woof!', from: 'sys' },
          { hangup: true },
        ],
      },
    },
    {
      num: '+86 555 0101 8888', name: 'Swift Ride Customer Care', label: 'support',
      nodes: {
        start: [
          { say: 'Thank you for calling Swift Ride. To report a lost item, please use Report a Lost Item in the Swift Ride app — it reaches your driver fastest.', from: 'sys' },
          { say: 'For a safety emergency, hang up and dial 110.', from: 'sys' },
          { hangup: true },
        ],
      },
    },
    {
      num: '+86 555 0518 0001', name: 'Jin Group · Koi Tower', label: 'events',
      nodes: {
        start: [
          { say: 'Jin Group, Koi Tower events office. Thank you for attending tonight’s Autumn Charity Gala. Our office is now closed.', from: 'sys' },
          { say: 'For lost property from the gala, please leave a message after the tone. For the koi pond, please hold.', from: 'sys' },
          { say: '(Beep.)', from: 'sys' },
          { choice: [{ t: '(Hang up)', go: 'hang' }, { t: '(Stay on the line)', go: 'hold' }] },
        ],
        hang: [{ hangup: 'me' }],
        hold: [{ say: '…(hold music: a guzheng cover of something that used to be a pop song)…', from: 'sys' }, { say: 'All our koi specialists are busy. Please call again later.', from: 'sys' }, { hangup: true }],
      },
    },
    {
      num: '+86 555 0512 2000', name: 'Cloud Recesses Tea Shop', label: 'shop',
      nodes: {
        start: [
          { say: 'Cloud Recesses Tea Shop. We are closed for the night. The mountain is quiet. Please call again after eight.', from: 'sys' },
          { hangup: true },
        ],
      },
    },
  ];
  const EMERGENCY = ['110', '119', '120', '122', '112', '911', '999', '000'];

  let pendingNum = null; // { cid, num, name } — fixes the recents record after the call

  function busy() {
    if (JC.story.call()) { JC.ui.toast('You’re already on a call', { icon: 'phone.fill' }); return true; }
    return false;
  }
  function dial(cid, o) {
    o = o || {};
    if (!cid || busy()) return false;
    if (cid === 'me') {
      JC.voiceBed.busy();
      JC.ui.alert({ title: 'Call Failed', message: 'You can’t call your own number.', buttons: [{ text: 'OK' }] });
      return false;
    }
    pendingNum = o.num || o.ft ? { cid, num: o.num || null, ft: !!o.ft && !o.video } : null;
    JC.story.dial(cid, { video: !!o.video });
    return true;
  }
  function bizFor(num) { const c = core(num); return c ? BIZ.find((b) => core(b.num) === c) || null : null; }
  function dialNumber(num, o) {
    o = o || {};
    const raw = digits(num);
    if (!raw || busy()) return false;
    if (EMERGENCY.includes(raw)) {
      JC.ui.alert({ title: 'Emergency SOS', message: 'This is a story phone. No real call will be placed.\n\nIf you are in danger in real life, call your local emergency number from your own phone.', buttons: [{ text: 'OK' }] });
      return false;
    }
    if (raw === '*#06#') {
      JC.ui.alert({ title: 'Device Info', message: 'IMEI 35 209 917 412 008 3\nIMEI2 35 209 917 412 008 1\nEID 8904 9032 0071 6051 5180 8000 0412', buttons: [{ text: 'Dismiss' }] });
      return false;
    }
    const cid = JC.ckit ? JC.ckit.findByNumber(raw) : null;
    if (cid) return dial(cid, { num, video: o.video });
    const biz = bizFor(raw);
    let def;
    if (biz) {
      def = { id: CALL_ID, from: PSEUDO, ringFor: 2.5, nodes: biz.nodes };
      pendingNum = { cid: PSEUDO, num: biz.num, name: biz.name, label: biz.label };
    } else {
      const n = core(raw).replace(/\D/g, '');
      if (n.length < 5 || /[*#]/.test(raw)) {
        JC.voiceBed.busy();
        JC.ui.alert({ title: 'Call Failed', buttons: [{ text: 'Dismiss', style: 'cancel' }, { text: 'Call Again', onTap: () => setTimeout(() => dialNumber(num, o), 300) }] });
        return false;
      }
      def = { id: CALL_ID, from: PSEUDO, ringFor: 6, nodes: { start: [
        { say: '您拨打的用户暂时无法接通，请稍后再拨。', from: 'sys' },
        { say: 'The subscriber you dialed cannot be reached at the moment. Please redial later.', from: 'sys' },
        { hangup: true },
      ] } };
      pendingNum = { cid: PSEUDO, num: fmtNum(raw), name: null };
    }
    JC.story.call(def);
    JC.story.dial(PSEUDO, { video: !!o.video });
    return true;
  }
  JC.story.dialScript(PSEUDO, CALL_ID);

  /** "+86 555 1018 2008" style */
  function fmtNum(s) {
    const d = digits(s);
    if (!d || /[*#]/.test(d)) return d;
    const plus = d[0] === '+';
    let x = d.replace(/^\+/, '');
    if (plus && x.startsWith('86')) {
      const r = x.slice(2);
      return '+86 ' + group(r);
    }
    return (plus ? '+' : '') + group(x);
  }
  function group(x) {
    if (x.length <= 4) return x;
    if (x.length <= 7) return x.slice(0, 3) + ' ' + x.slice(3);
    if (x.length === 8) return x.slice(0, 4) + ' ' + x.slice(4);
    if (x.length <= 11) return x.slice(0, 3) + ' ' + x.slice(3, 7) + ' ' + x.slice(7);
    return x.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  function patchRecord(c) {
    const fix = pendingNum && pendingNum.cid === c.cid ? pendingNum : null;
    if (!fix) return;
    pendingNum = null;
    try {
      const rec = JC.store.all('calls').find((x) => x.contact === c.cid && x.t === c.t0);
      if (!rec) return;
      if (c.cid === PSEUDO) JC.store.update('calls', rec.id, { contact: null, num: fix.num, name: fix.name || null, label: fix.label || null });
      else if (fix.num || fix.ft) JC.store.update('calls', rec.id, Object.assign({}, fix.num ? { num: fix.num } : {}, fix.ft ? { ft: true } : {}));
    } catch (e) { /* calls not seeded */ }
  }

  // ══ The call screen ══════════════════════════════════════════════
  let layer = null;
  let root = null; // current screen element
  let C = null; // call being shown
  let S = {}; // UI state for this call
  let closeT = null;
  let tickT = null;
  let savedStatus = null;

  const isPseudo = (cid) => cid === PSEUDO;
  function nameOf(cid) {
    if (isPseudo(cid)) return (pendingNum && (pendingNum.name || pendingNum.num)) || (S.pseudo && (S.pseudo.name || S.pseudo.num)) || 'Unknown';
    if (cid === 'sys') return '';
    return JC.ckit ? JC.ckit.name(cid) : JC.contacts.name(cid);
  }
  function sn(cid) { return isPseudo(cid) ? nameOf(cid) : JC.contacts.short(cid); }
  function shortOf(cid) {
    if (cid === 'me') return 'You';
    if (isPseudo(cid)) return S.pseudo && S.pseudo.name ? S.pseudo.name : 'Caller';
    return JC.ckit ? JC.ckit.name(cid) : JC.contacts.short(cid);
  }
  function contact(cid) { return isPseudo(cid) ? null : (JC.ckit ? JC.ckit.get(cid) : JC.contacts.get(cid)); }
  function labelOf(c) {
    if (c.video) return 'FaceTime Video';
    if (S.ft) return 'FaceTime Audio';
    if (isPseudo(c.cid)) return (S.pseudo && S.pseudo.label) || 'unknown';
    const k = contact(c.cid);
    if (!k || !k.phones || !k.phones.length) return 'mobile';
    if (S.num) { const p = k.phones.find((x) => core(x.num) === core(S.num)); if (p) return p.label; }
    return k.phones[0].label || 'mobile';
  }
  function avatarSpec(cid) {
    if (isPseudo(cid)) return { initials: '', grad: ['#9a9aa2', '#6c6c74'] };
    const k = contact(cid);
    return (k && k.avatar) || { initials: '?', grad: ['#9a9aa2', '#6c6c74'] };
  }
  const VIDEO_ART = { jl: ['p_jl_selfie_gala', 'av_jl'], lxc: ['p_tea_hanshi', 'av_lxc'], nhs: ['av_nhs'], huang: ['av_huang'], mian: ['av_mian'], sz: ['av_sz'], jy: ['av_jy'], wn: ['p_wn_van'] };
  function videoArt(c) {
    const list = [].concat(c.def && c.def.art ? [c.def.art] : [], VIDEO_ART[c.cid] || [], [avatarSpec(c.cid).art]).filter(Boolean);
    return list.find((a) => JC.art.has(a)) || null;
  }

  function hasArt(cid) { const sp = avatarSpec(cid); return !!(sp.art && JC.art.has(sp.art)); }
  function poster(cid, o) {
    o = o || {};
    const spec = avatarSpec(cid);
    const g = spec.grad || ['#8e8e93', '#636366'];
    const bg = h('div.cu-poster', { style: { '--g0': g[0], '--g1': g[1] } });
    if (hasArt(cid)) {
      bg.classList.add('has-art');
      bg.appendChild(JC.art.el(spec.art, { cls: 'cu-poster-art' }));
    } else if (o.mono !== false) {
      bg.appendChild(h('div.cu-poster-mono', spec.emoji ? h('span.cu-emoji', spec.emoji) : isPseudo(cid) ? JC.icon('person.fill', { size: 120 }) : (spec.initials || '?')));
    }
    bg.appendChild(h('div.cu-poster-shade'));
    return bg;
  }

  function setStatusLight(on) {
    const w = JC.os.activeWin && JC.os.activeWin();
    if (on) {
      if (w && !savedStatus) { savedStatus = { win: w, status: w.status }; JC.os.setStatus('light'); }
    } else if (savedStatus) {
      savedStatus.win.status = savedStatus.status;
      savedStatus = null;
      JC.os.updateStatus && JC.os.updateStatus();
    }
  }

  function timerText() {
    if (!C) return '';
    if (C.phase === 'ended') return 'Call Ended';
    if (C.phase === 'ringing') return C.dir === 'in' ? 'Incoming' : 'calling…';
    return U.fmtDur((Date.now() - (C.start || Date.now())) / 1000);
  }

  // ── public: show / react to engine ──
  function onCall(c) {
    if (!layer) layer = document.getElementById('call-layer');
    if (!layer || !c) return;
    if (c !== C) {
      if (C && C.phase !== 'ended' && c.phase === 'ended') return; // stale
      teardown(true);
      C = c;
      S = { phase: null, lines: 0, muted: false, speaker: !!c.video, keypad: false, min: false, dtmf: '', cam: 'off', pseudo: isPseudo(c.cid) ? Object.assign({}, pendingNum) : null, num: pendingNum && pendingNum.cid === c.cid ? pendingNum.num : null, ft: !!(pendingNum && pendingNum.cid === c.cid && pendingNum.ft), capOn: true };
    }
    if (c.phase === 'ended') { onEnded(c); return; }
    if (S.phase !== c.phase) {
      const prev = S.phase;
      S.phase = c.phase;
      if (c.phase === 'active' && prev === 'ringing' && c.dir === 'in') JC.audio.haptic(20);
      build();
      if (c.phase === 'active' && prev === 'ringing' && c.dir === 'out') JC.audio.play('tap');
    } else update();
    if (S.min) islandOn();
  }

  function build() {
    clearTimeout(closeT);
    const old = root;
    const c = C;
    if (!c) return;
    if (c.video) root = c.phase === 'ringing' && c.dir === 'in' ? buildIncoming() : buildVideo();
    else root = c.phase === 'ringing' && c.dir === 'in' ? buildIncoming() : buildAudio();
    S.lines = 0;
    layer.appendChild(root);
    if (old) {
      U.anim(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).then(() => old.remove());
    } else {
      U.anim(root, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360 });
    }
    root.hidden = !!S.min;
    if (!S.min) setStatusLight(true);
    update();
    clearInterval(tickT);
    tickT = setInterval(tick, 500);
    tick();
  }

  function tick() {
    if (!root || !C) return;
    root.querySelectorAll('.cu-timer').forEach((t) => { t.textContent = timerText(); });
    if (S.isl && S.isl.isConnected) S.isl.textContent = timerText();
  }

  function update() {
    if (!root || !C) return;
    renderLines();
    renderOptions();
  }

  // ── incoming ──
  function buildIncoming() {
    const c = C;
    const locked = JC.os.locked;
    const cid = c.cid;
    const bottom = locked ? slider() : h('div.cu-answer',
      bigBtn('decline', 'Decline', 'phone.down.fill', () => JC.story.decline()),
      bigBtn('accept', 'Accept', c.video ? 'video.fill' : 'phone.fill', () => JC.story.answer()));
    const el = h('div.cu-screen.cu-in', { class: { video: !!c.video, locked } },
      poster(cid),
      h('div.cu-top',
        h('div.cu-kind', c.video ? h('span.cu-ft', JC.icon('video.fill', { size: 14 }), 'FaceTime Video') : labelOf(c)),
        h('div.cu-name', nameOf(cid)),
        !c.video && contact(cid) && contact(cid).company && !isPseudo(cid) ? h('div.cu-sub', contact(cid).company) : null),
      h('div.cu-flex'),
      h('div.cu-aux',
        auxBtn('alarm.fill', 'Remind Me', remindMe),
        isPseudo(cid) || !JC.story.canReply(cid) ? auxBtn('message.fill', 'Message', () => JC.ui.toast('This caller can’t receive messages', { icon: 'message.fill' })) : auxBtn('message.fill', 'Message', quickReply)),
      bottom);
    return el;
  }
  function bigBtn(kind, label, icon, fn) {
    return h('div.cu-bigwrap',
      h('div.cu-big.' + kind, { onTap: (e) => { JC.audio.haptic(10); fn(e); }, attrs: { role: 'button', 'aria-label': label } }, JC.icon(icon, { size: 34 })),
      h('div.cu-biglabel', label));
  }
  function auxBtn(icon, label, fn) {
    return h('div.cu-auxbtn', { onTap: fn }, h('div.cu-auxic', JC.icon(icon, { size: 20 })), h('div.cu-auxlabel', label));
  }
  function slider() {
    const knob = h('div.cu-knob', JC.icon(C && C.video ? 'video.fill' : 'phone.fill', { size: 28 }));
    const text = h('div.cu-slidetext', 'slide to answer');
    const track = h('div.cu-track', text, knob);
    let max = 0;
    U.drag(knob, {
      axis: 'x',
      threshold: 2,
      start: () => { max = track.offsetWidth - knob.offsetWidth - 8; knob.style.transition = 'none'; },
      move: (e, p) => {
        const x = U.clamp(p.dx, 0, max);
        knob.style.transform = `translateX(${x}px)`;
        text.style.opacity = String(1 - x / (max * 0.6));
      },
      end: (e, p) => {
        knob.style.transition = '';
        if (p.dx >= max * 0.86 || p.vx > 1.2) {
          knob.style.transform = `translateX(${max}px)`;
          JC.story.answer();
        } else {
          knob.style.transform = '';
          text.style.opacity = '';
        }
      },
    });
    JC.ui.onTap(knob, () => {
      U.anim(knob, [{ transform: 'translateX(0)' }, { transform: 'translateX(26px)' }, { transform: 'translateX(0)' }], { duration: 420, easing: U.SPRING });
    });
    return h('div.cu-slidewrap', track);
  }
  function quickReply() {
    const c = C;
    if (!c) return;
    const send = (text) => {
      if (!text) return;
      const th = JC.story.threadFor(c.cid);
      JC.story.decline();
      setTimeout(() => {
        JC.story.send(th, { text });
        JC.audio.play('send');
        JC.ui.toast('Message sent to ' + JC.contacts.short(c.cid), { icon: 'message.fill' });
      }, 250);
    };
    JC.ui.actionSheet({
      system: true,
      title: 'Respond with Text',
      actions: [
        { text: 'Can’t talk.', onTap: () => send('Can’t talk.') },
        { text: 'Busy. Later.', onTap: () => send('Busy. Later.') },
        { text: 'What.', onTap: () => send('What.') },
        { text: 'Custom…', onTap: () => {
          JC.ui.alert({ title: 'Message ' + JC.contacts.short(c.cid), input: { placeholder: 'Text Message' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default' }] })
            .then((r) => { if (r.index === 1 && r.value && r.value.trim()) send(r.value.trim()); });
        } },
      ],
    });
  }
  function remindMe() {
    const c = C;
    if (!c) return;
    const name = nameOf(c.cid);
    const add = (mins, label) => {
      JC.story.decline();
      const due = mins ? JC.time.now() + mins * 60e3 : null;
      try {
        const lists = JC.store.hasSeed('remlists') ? JC.store.all('remlists') : [];
        JC.store.add('reminders', { list: lists[0] ? lists[0].id : 'reminders', title: 'Call ' + name, done: false, due, notes: 'Missed call', flagged: false }, { front: true });
      } catch (e) { /* ignore */ }
      if (due) {
        const r = JC.store.add('callreminders', { cid: c.cid, name, due });
        void r;
      }
      JC.ui.toast('Reminder set · ' + label, { icon: 'alarm.fill' });
    };
    JC.ui.actionSheet({
      system: true,
      title: 'Remind Me',
      actions: [
        { text: 'In 1 hour', onTap: () => add(60, 'in 1 hour') },
        { text: 'When I leave', onTap: () => add(0, 'when you leave') },
      ],
    });
  }
  // fire "Remind Me" reminders on the in-game clock
  JC.bus.on('minute', () => {
    if (!JC.state || !JC.state.d || !JC.state.d.store || !JC.state.d.store.callreminders) return;
    JC.store.all('callreminders').slice().forEach((r) => {
      if (r.due <= JC.time.now()) {
        JC.store.remove('callreminders', r.id);
        JC.notify.push({ app: 'reminders', title: 'Reminders', body: 'Call ' + r.name, open: { app: 'phone', intent: { tab: 'recents' } } });
      }
    });
  });

  // ── audio call (outgoing ringing / active) ──
  function buildAudio() {
    const c = C;
    const cid = c.cid;
    const el = h('div.cu-screen.cu-call', { class: { out: c.dir === 'out', active: c.phase === 'active', art: hasArt(cid) } },
      poster(cid, { mono: false }),
      h('div.cu-top',
        h('div.cu-kind.cu-timer', timerText()),
        h('div.cu-name', nameOf(cid)),
        c.phase === 'ringing' ? h('div.cu-sub', labelOf(c)) : null),
      h('div.cu-mid',
        c.phase === 'active' ? captions() : hasArt(cid) ? null : h('div.cu-ringav', h('div.cu-ringpulse'), JC.ui.avatar(isPseudo(cid) ? avatarSpec(cid) : cid, 112))),
      h('div.cu-opts'),
      S.keypad ? keypadPanel() : controls());
    return el;
  }
  function captions() {
    const list = h('div.cu-caplist.scroll');
    const el = h('div.cu-cap', { class: { off: !S.capOn } },
      h('div.cu-caphead', JC.icon('captions.bubble', { size: 15 }), h('span', 'Live Captions'), h('span.cu-capdot')),
      list);
    return el;
  }
  function ctl(icon, label, on, fn, cls) {
    return h('div.cu-ctlwrap',
      h('div.cu-ctl', { class: [on ? 'on' : '', cls || ''], onTap: (e) => { JC.audio.haptic(8); fn(e); } }, JC.icon(icon, { size: 28 })),
      h('div.cu-ctllabel', label));
  }
  function controls() {
    return h('div.cu-ctls',
      ctl('speaker.wave.2.fill', 'speaker', S.speaker, toggleSpeaker, 'k-speaker'),
      ctl('video.fill', 'FaceTime', false, faceTimeUpgrade),
      ctl('mic.slash.fill', 'mute', S.muted, toggleMute, 'k-mute'),
      ctl('plus', 'add', false, addCall),
      h('div.cu-ctlwrap', h('div.cu-ctl.end', { onTap: () => hangup() }, JC.icon('phone.down.fill', { size: 32 })), h('div.cu-ctllabel', 'end')),
      ctl('keypad', 'keypad', false, () => { S.keypad = true; swapBottom(); }));
  }
  function keypadPanel() {
    const L = { 1: '', 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', '*': '', 0: '+', '#': '' };
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => h('div.cu-key', { onTap: () => {
      JC.audio.dtmf(k);
      JC.audio.haptic(6);
      S.dtmf += k;
      const d = root && root.querySelector('.cu-dtmf');
      if (d) d.textContent = S.dtmf;
    } }, h('div.cu-keyn', k), L[k] ? h('div.cu-keyl', L[k]) : null));
    return h('div.cu-kp',
      h('div.cu-dtmf', S.dtmf),
      h('div.cu-kpgrid', keys),
      h('div.cu-kprow', h('div.cu-kpside'), h('div.cu-ctl.end', { onTap: () => hangup() }, JC.icon('phone.down.fill', { size: 32 })), h('div.cu-kpside.tap', { onTap: () => { S.keypad = false; swapBottom(); } }, 'Hide')));
  }
  function swapBottom() {
    if (!root) return;
    const cur = root.querySelector('.cu-ctls, .cu-kp');
    if (!cur) return;
    const next = S.keypad ? keypadPanel() : controls();
    cur.replaceWith(next);
    root.classList.toggle('kp-open', S.keypad);
    U.anim(next, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
  }
  function toggleSpeaker() {
    S.speaker = !S.speaker;
    const b = root && root.querySelector('.k-speaker');
    if (b) b.classList.toggle('on', S.speaker);
    JC.ui.toast(S.speaker ? 'Speaker on' : 'Speaker off', { icon: S.speaker ? 'speaker.wave.2.fill' : 'speaker.fill' });
  }
  function toggleMute() {
    S.muted = !S.muted;
    root && root.querySelectorAll('.k-mute').forEach((b) => b.classList.toggle('on', S.muted));
    if (S.islMute && S.islMute.isConnected) S.islMute.classList.toggle('on', S.muted);
  }
  function faceTimeUpgrade() {
    const n = C ? sn(C.cid) : '';
    JC.ui.alert({
      title: 'Switch to FaceTime?',
      message: isPseudo(C && C.cid) ? 'FaceTime isn’t available for this number.' : n + ' would see your camera. Your face is not Jiang Cheng’s face.',
      buttons: [{ text: 'Stay on the Phone', style: 'cancel' }],
    });
  }
  function addCall() {
    JC.ui.alert({
      title: 'Add Call',
      message: 'Conference calling is turned off on this line.\n(Yunmeng Jiang Group IT disabled it after the 2024 board call incident.)',
      buttons: [{ text: 'OK' }],
    });
  }
  function hangup() {
    JC.audio.haptic(14);
    JC.story.hangup();
  }

  // ── video call ──
  function buildVideo() {
    const c = C;
    const cid = c.cid;
    const art = videoArt(c);
    const connected = c.phase === 'active';
    const remote = h('div.cu-remote', { class: { live: connected } });
    if (connected) {
      if (art) remote.appendChild(JC.art.el(art, { cls: 'cu-remote-art' }));
      else {
        const sp = avatarSpec(cid);
        const g = sp.grad || ['#666', '#333'];
        remote.appendChild(h('div.cu-remote-blur', { style: { background: `linear-gradient(160deg, ${g[0]}, ${g[1]})` } }, JC.ui.avatar(isPseudo(cid) ? sp : cid, 160)));
      }
      remote.appendChild(h('div.cu-remote-grain'));
    } else {
      remote.appendChild(h('div.cu-selfoff', JC.icon('video.slash.fill', { size: 44 }), h('div', 'Your camera is off')));
    }
    const pip = h('div.cu-pip', { class: { hidden: !connected } });
    paintPip(pip);
    JC.ui.onTap(pip, () => JC.ui.toast(S.cam === 'face' ? 'Your camera is on' : S.cam === 'thumb' ? 'Your thumb is over the camera' : 'Your camera is off', { icon: S.cam === 'face' ? 'video.fill' : 'video.slash.fill' }));
    pipDrag(pip);
    const el = h('div.cu-screen.cu-vid', { class: { active: connected, out: c.dir === 'out' } },
      remote,
      h('div.cu-vshade'),
      h('div.cu-vtop',
        h('div.cu-vpill', JC.ui.avatar(isPseudo(cid) ? avatarSpec(cid) : cid, 26), h('div.cu-vname', nameOf(cid)), h('div.cu-vtime.cu-timer', connected ? timerText() : 'FaceTime…'))),
      pip,
      h('div.cu-vbottom',
        connected ? captions() : h('div.cu-vwait', 'Waiting for ' + sn(cid) + '…'),
        h('div.cu-opts'),
        h('div.cu-vbar',
          vbtn('ellipsis', 'More', (e) => vMore(e)),
          vbtn('mic.slash.fill', 'Mute', toggleMute, S.muted, 'k-mute'),
          vbtn('video.slash.fill', 'Camera', camera, true, 'k-cam'),
          vbtn('speaker.wave.2.fill', 'Speaker', () => { S.speaker = !S.speaker; const b = root.querySelector('.k-spk'); if (b) b.classList.toggle('on', S.speaker); }, S.speaker, 'k-spk'),
          h('div.cu-vbtn.end', { onTap: () => hangup(), attrs: { 'aria-label': 'End' } }, JC.icon('phone.down.fill', { size: 24 })))));
    return el;
  }
  /** your own picture-in-picture tile: camera off, a thumb over the lens, or (if the story shows your face) you */
  function paintPip(pip) {
    pip = pip || (root && root.querySelector('.cu-pip'));
    if (!pip) return;
    pip.innerHTML = '';
    pip.dataset.cam = S.cam || 'off';
    if (S.cam === 'face') {
      pip.appendChild(h('div.cu-pip-in.face',
        h('div.cu-fan', h('i'), h('i'), h('i')),
        h('div.cu-self', h('div.cu-self-head'), h('div.cu-self-body')),
        h('div.cu-pip-t.me', 'You')));
    } else if (S.cam === 'thumb') {
      pip.appendChild(h('div.cu-pip-in.thumb', h('div.cu-pip-t', '')));
    } else {
      pip.appendChild(h('div.cu-pip-in', JC.icon('video.slash.fill', { size: 26 }), h('div.cu-pip-t', 'Camera Off')));
    }
    const cb = root && root.querySelector('.k-cam');
    if (cb) { cb.classList.toggle('on', S.cam !== 'face'); cb.innerHTML = ''; cb.appendChild(JC.icon(S.cam === 'face' ? 'video.fill' : 'video.slash.fill', { size: 22 })); }
  }
  function camFromChoice(text) {
    if (/show (your|my) face|turn (on )?(the )?camera|camera on|look at the camera/i.test(text)) return 'face';
    if (/thumb|cover the camera|camera off|keep the camera off/i.test(text)) return 'thumb';
    return null;
  }
  function vbtn(icon, label, fn, on, cls) {
    return h('div.cu-vbtn', { class: [on ? 'on' : '', cls || ''], onTap: (e) => { JC.audio.haptic(8); fn(e); }, attrs: { 'aria-label': label } }, JC.icon(icon, { size: 22 }));
  }
  function camera() {
    if (S.cam === 'face' || S.cam === 'thumb') { S.cam = 'off'; paintPip(); JC.ui.toast('Camera off', { icon: 'video.slash.fill' }); return; }
    JC.ui.alert({
      title: 'Turn On Camera?',
      message: (C ? sn(C.cid) : 'They') + ' would see who is holding Jiang Cheng’s phone.',
      buttons: [{ text: 'Keep Camera Off', style: 'cancel' }],
    });
  }
  function vMore(e) {
    JC.ui.menu(e.currentTarget, [
      { text: S.capOn ? 'Hide Live Captions' : 'Show Live Captions', icon: 'captions.bubble', onTap: () => { S.capOn = !S.capOn; const cp = root && root.querySelector('.cu-cap'); if (cp) cp.classList.toggle('off', !S.capOn); } },
      { text: 'Flip Camera', icon: 'camera.rotate', onTap: () => JC.ui.toast('Camera is off', { icon: 'video.slash.fill' }) },
      { text: 'Effects', icon: 'sparkles', onTap: () => JC.ui.toast('Effects need the camera on', { icon: 'sparkles' }) },
      { text: 'Share My Screen', icon: 'rectangle.on.rectangle', onTap: () => JC.ui.alert({ title: 'Share Your Screen?', message: 'Everything on Jiang Cheng’s screen would be visible — including his messages.', buttons: [{ text: 'Don’t Share', style: 'cancel' }] }) },
      '-',
      { text: 'Add People', icon: 'person.badge.plus', onTap: () => addCall() },
    ], { system: true });
  }
  function pipDrag(pip) {
    U.drag(pip, {
      threshold: 4,
      move: (e, p) => { pip.style.transform = `translate(${p.dx}px, ${p.dy}px)`; pip.style.transition = 'none'; },
      end: (e, p) => {
        pip.style.transition = '';
        pip.style.transform = '';
        const r = JC.ui.toLocal(pip.getBoundingClientRect());
        const cx = r.x + r.w / 2 + 0, cy = r.y + r.h / 2;
        pip.classList.toggle('left', cx < 201);
        pip.classList.toggle('bottom', cy > (JC.os.H || 874) / 2);
      },
    });
  }

  // ── live captions & choices ──
  function renderLines() {
    const list = root && root.querySelector('.cu-caplist');
    if (!list || !C) { if (C) S.lines = C.lines.length; return; }
    const lines = C.lines || [];
    const fresh = S.lines < lines.length;
    for (let i = S.lines; i < lines.length; i++) {
      const ln = lines[i];
      const sys = ln.who === 'sys';
      const me = ln.who === 'me';
      const textEl = h('div.cu-lntext');
      const row = h('div.cu-ln', { class: { me, sys } }, !sys && !me ? h('div.cu-lnwho', shortOf(ln.who)) : me ? h('div.cu-lnwho', 'You') : null, textEl);
      list.appendChild(row);
      const live = i >= lines.length - 1 && fresh && S.started;
      if (live && !me) typeIn(textEl, ln);
      else textEl.textContent = ln.text;
      if (me && C.video) { const cam = camFromChoice(ln.text); if (cam) { S.cam = cam; paintPip(); } }
      if (live && sys && !/^\(/.test(ln.text.trim()) || live && sys && /^\(?beep\.?\)?$/i.test(ln.text.trim())) sysSound(ln.text);
      if (live && !sys && !me && !S.muted) {
        JC.voiceBed.say(ln.who, ln.text, { gain: S.speaker ? 0.85 : 0.45, earpiece: !S.speaker });
      }
    }
    S.lines = lines.length;
    S.started = true;
    if (fresh) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }
  function typeIn(el, ln) {
    const words = ln.text.split(/(\s+)/);
    const total = U.clamp(ln.text.length * 45, 500, 5200);
    let i = 0;
    const step = Math.max(28, total / Math.max(1, words.length));
    const go = () => {
      if (!el.isConnected) return;
      i = Math.min(words.length, i + 1);
      el.textContent = words.slice(0, i).join('');
      const list = el.closest('.cu-caplist');
      if (list) list.scrollTop = list.scrollHeight;
      if (i < words.length) setTimeout(go, step);
    };
    go();
  }
  function sysSound(text) {
    if (/no longer in service|not in service|disconnected/i.test(text)) JC.voiceBed.sit();
    else if (/^\(?beep\.?\)?$/i.test(text.trim())) JC.voiceBed.beep(1000, 0.4);
    else if (/does not accept/i.test(text)) JC.voiceBed.busy();
    else JC.voiceBed.say('sys', text, { gain: S.speaker ? 0.7 : 0.4, earpiece: !S.speaker });
  }
  function renderOptions() {
    const box = root && root.querySelector('.cu-opts');
    if (!box || !C) return;
    const pend = C.pend && C.pend.options && C.pend.options.length ? C.pend.options : null;
    const key = pend ? pend.map((o) => o.label).join('|') : '';
    if (box.dataset.key === key) return;
    box.dataset.key = key;
    box.innerHTML = '';
    root.classList.toggle('has-opts', !!pend);
    if (!pend) return;
    box.appendChild(h('div.cu-optshead', JC.icon('person.wave', { size: 14 }), 'Your move'));
    pend.forEach((o) => {
      const spoken = /^["“]/.test(o.label);
      box.appendChild(h('div.cu-opt', { class: { act: !spoken }, onTap: (e) => {
        if (box.classList.contains('busy')) return;
        box.classList.add('busy');
        e.currentTarget.classList.add('picked');
        JC.audio.haptic(10);
        setTimeout(() => { box.classList.remove('busy'); JC.story.callChoose(o.i); }, 160);
      } }, o.label));
    });
    U.anim(box, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
  }

  // ── ending & teardown ──
  function onEnded(c) {
    JC.voiceBed.hush();
    patchRecord(c);
    clearInterval(tickT);
    const quick = S.min || (c.dir === 'in' && c.outcome === 'missed') || !root;
    if (S.min) {
      JC.os.island.stop('call');
      if (c.outcome !== 'missed') JC.os.island.flash('Call Ended', 'phone.down.fill', '#ff453a');
    }
    if (quick) { close(); return; }
    root.classList.add('ended');
    root.querySelectorAll('.cu-timer').forEach((t) => { t.textContent = 'Call Ended'; });
    const opts = root.querySelector('.cu-opts');
    if (opts) opts.innerHTML = '';
    clearTimeout(closeT);
    closeT = setTimeout(close, 1500);
  }
  function close() {
    clearTimeout(closeT);
    clearInterval(tickT);
    const el = root;
    root = null;
    C = null;
    JC.os.island.stop('call');
    setStatusLight(false);
    if (el) U.anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.96)' }], { duration: 260 }).then(() => el.remove());
  }
  function teardown(instant) {
    JC.voiceBed.hush();
    clearTimeout(closeT);
    clearInterval(tickT);
    JC.os.island && JC.os.island.stop('call');
    setStatusLight(false);
    if (layer) Array.from(layer.querySelectorAll('.cu-screen')).forEach((n) => (instant ? n.remove() : U.anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => n.remove())));
    root = null;
    C = null;
  }

  // ── minimize to the Dynamic Island ──
  function minimize() {
    if (!root || !C || S.min || C.phase === 'ended') return;
    S.min = true;
    root.hidden = true;
    setStatusLight(false);
    islandOn();
  }
  function restore() {
    if (!root || !C) return;
    S.min = false;
    root.hidden = false;
    JC.os.island.stop('call');
    setStatusLight(true);
    U.anim(root, [{ opacity: 0, transform: 'scale(.9) translateY(-40px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: U.SPRING });
    renderLines();
  }
  function islandOn() {
    if (!C) return;
    const ringingIn = C.phase === 'ringing' && C.dir === 'in';
    JC.os.island.start('call', {
      priority: 20,
      width: ringingIn ? 250 : 214,
      compact: () => {
        if (!C) return {};
        if (C.phase === 'ringing' && C.dir === 'in') {
          return { left: h('span.cu-isl.cu-isl-ring', JC.ui.avatar(isPseudo(C.cid) ? avatarSpec(C.cid) : C.cid, 24), h('span.cu-isl-name', sn(C.cid))), right: h('span.cu-isl-green', JC.icon(C.video ? 'video.fill' : 'phone.fill', { size: 15 })) };
        }
        return {
          left: h('span.cu-isl.cu-isl-green', JC.icon(C.video ? 'video.fill' : 'phone.fill', { size: 14 }), h('span', timerText())),
          right: h('span.cu-islwave', [0, 1, 2, 3, 4].map((i) => h('i', { style: { animationDelay: i * 0.13 + 's' } }))),
        };
      },
      expanded: (ex) => {
        if (!C) return;
        const ring = C.phase === 'ringing' && C.dir === 'in';
        const t = h('div.cu-iex-time', ring ? (C.video ? 'FaceTime Video' : labelOf(C)) : timerText());
        S.isl = ring ? null : t;
        const btns = ring
          ? [h('div.cu-iex-btn.red', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); JC.story.decline(); } }, JC.icon('phone.down.fill', { size: 22 })),
            h('div.cu-iex-btn.green', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); JC.story.answer(); restore(); } }, JC.icon(C.video ? 'video.fill' : 'phone.fill', { size: 22 }))]
          : [S.islMute = h('div.cu-iex-btn.gray', { class: { on: S.muted }, onTap: (e) => { e.stopPropagation(); toggleMute(); } }, JC.icon('mic.slash.fill', { size: 20 })),
            h('div.cu-iex-btn.red', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); hangup(); } }, JC.icon('phone.down.fill', { size: 22 }))];
        ex.append(h('div.cu-iex',
          h('div.cu-iex-main', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); restore(); } },
            JC.ui.avatar(isPseudo(C.cid) ? avatarSpec(C.cid) : C.cid, 50),
            h('div.cu-iex-meta', h('div.cu-iex-name', nameOf(C.cid)), t)),
          h('div.cu-iex-btns', btns)));
      },
      onTap: () => restore(),
    });
  }

  function hookHomebar() {
    const hb = document.getElementById('homebar');
    if (hb && !hb.__cu) {
      hb.__cu = true;
      hb.addEventListener('pointerdown', () => { if (root && !S.min && C && C.phase !== 'ended') minimize(); }, true);
    }
  }
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !root || S.min || !C) return;
    const sys = document.getElementById('sys-overlays');
    if (sys && sys.querySelector('.alert, .action-sheet, .sheet, .pmenu')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    minimize();
  }, true);

  JC.bus.on('boot', () => { layer = document.getElementById('call-layer'); hookHomebar(); });
  JC.bus.on('story:call', (c) => { try { onCall(c); } catch (e) { console.error('[callui]', e); } });
  JC.bus.on('story:reset', () => teardown(true));
  const relock = () => { if (C && C.phase === 'ringing' && C.dir === 'in' && root && !S.min) { S.phase = null; onCall(C); } };
  JC.bus.on('lock', relock);
  JC.bus.on('unlock', relock);

  JC.callui = {
    PSEUDO,
    dial,
    dialNumber,
    fmtNum,
    digits,
    core,
    BIZ,
    bizFor,
    minimize,
    restore,
    isOpen: () => !!root && !S.min,
    current: () => C,
  };
})();
