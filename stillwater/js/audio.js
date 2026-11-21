/* Stillwater · sound
   Everything is synthesised with the Web Audio API and nothing plays until the visitor asks for it.
   Layers cross-fade with dread: lake and birdsong → a pad that drifts out of tune → a low beating drone →
   bells under the water → whispers → a heartbeat that speeds up → knocking → silence → the scream. */
(function () {
  'use strict';
  var SW = window.SW;
  var A = (SW.audio = { on: false, built: false });
  var ctx, master, comp, verb, noiseBuf, brownBuf;
  var L = {};
  var hushed = false;
  var LEVEL = 0.85;

  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function filt(type, f, q) { var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  function osc(type, f) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
  function pan(v) {
    if (ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = v; return p; }
    return gain(1);
  }
  function ramp(param, v, tau) { param.setTargetAtTime(v, ctx.currentTime, tau || 0.4); }
  function noise(kind, seconds) {
    var len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch), last = 0;
      for (var i = 0; i < len; i++) {
        var w = Math.random() * 2 - 1;
        if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2; } else data[i] = w;
      }
    }
    return buf;
  }
  function impulse(sec, decay) {
    var len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function loop(buf) { var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; }
  function shot(buf, offset) { var s = ctx.createBufferSource(); s.buffer = buf; return s; }
  function out(node, wet) { node.connect(master); if (wet) { var g = gain(wet); node.connect(g); g.connect(verb); } }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.3;
    master = gain(0);
    master.connect(comp); comp.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(3.4, 2.4);
    var verbOut = gain(0.6); verb.connect(verbOut); verbOut.connect(master);
    noiseBuf = noise('white', 3); brownBuf = noise('brown', 5);

    // lake: brown noise, a slow filter sweep and an amplitude "lap"
    var lakeLP = filt('lowpass', 620, 0.5);
    var lfo = osc('sine', 0.11), lfoG = gain(240); lfo.connect(lfoG); lfoG.connect(lakeLP.frequency); lfo.start();
    var lap = gain(0.7), lapO = osc('sine', 0.27), lapG = gain(0.28); lapO.connect(lapG); lapG.connect(lap.gain); lapO.start();
    var lakeG = gain(0);
    loop(brownBuf).connect(lakeLP); lakeLP.connect(lap); lap.connect(lakeG); out(lakeG, 0.15);
    L.lake = { g: lakeG, lp: lakeLP };

    // pad: a warm open chord that slowly loses its tuning
    var padLP = filt('lowpass', 1500, 0.3), padG = gain(0);
    padLP.connect(padG); out(padG, 0.7);
    var vib = osc('sine', 0.17), vibG = gain(0); vib.connect(vibG); vib.start();
    var oscs = [130.81, 196.0, 246.94, 293.66, 392.0].map(function (f, i) {
      var o = osc(i % 2 ? 'sine' : 'triangle', f), g = gain(0.09);
      o.connect(g); g.connect(padLP); vibG.connect(o.detune); o.start(); return o;
    });
    L.pad = { g: padG, oscs: oscs, vib: vibG, lp: padLP };

    // drone: two saws a fraction apart so they beat, plus a sub
    var droneLP = filt('lowpass', 200, 1), droneG = gain(0);
    [[55, 'sawtooth', 0.32], [55.6, 'sawtooth', 0.32], [41.2, 'sine', 0.6], [82.4, 'triangle', 0.08]].forEach(function (p) {
      var o = osc(p[1], p[0]), g = gain(p[2]); o.connect(g); g.connect(droneLP); o.start();
    });
    droneLP.connect(droneG); out(droneG, 0.4);
    L.drone = { g: droneG, lp: droneLP };

    // shared buses for one-shot events
    L.bellBus = filt('lowpass', 900, 1.4); var bellG = gain(1); L.bellBus.connect(bellG); out(bellG, 1.1); L.bellG = bellG;
    L.fxBus = gain(1); out(L.fxBus, 0.5);
    A.built = true;
    schedule();
    return true;
  }

  /* ---------- one-shot voices ---------- */
  function chirp(t, p) {
    var f = 2600 + Math.random() * 1600, o = osc('sine', f), g = gain(0), pn = pan(p);
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 1.45, t + 0.045);
    o.frequency.exponentialRampToValueAtTime(f * 0.85, t + 0.09);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.11);
    o.connect(g); g.connect(pn); pn.connect(L.fxBus); o.start(t); o.stop(t + 0.15);
  }
  function birds(level) {
    var t = ctx.currentTime + 0.05, p = Math.random() * 1.6 - 0.8, n = 2 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) chirp(t + i * (0.1 + Math.random() * 0.08), p);
  }
  function bell(level) {
    var t = ctx.currentTime + 0.05, base = [146.83, 130.81, 110, 98][Math.floor(Math.random() * 4)];
    var parts = [[0.5, 0.55, 9], [1, 1, 7], [1.19, 0.45, 5], [1.5, 0.3, 4], [2, 0.3, 3.5], [2.74, 0.2, 2.6], [3.76, 0.14, 2], [5.4, 0.08, 1.4]];
    var wob = osc('sine', 0.6 + Math.random() * 0.4), wobG = gain(10); wob.connect(wobG); wob.start(t); wob.stop(t + 10);
    parts.forEach(function (p) {
      var o = osc('sine', base * p[0]), g = gain(0);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p[1] * level, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0005, t + p[2]);
      wobG.connect(o.detune); o.connect(g); g.connect(L.bellBus); o.start(t); o.stop(t + p[2] + 0.1);
    });
  }
  function whisper(level) {
    var t = ctx.currentTime + 0.05, dur = 0.8 + Math.random() * 1.1;
    var src = shot(noiseBuf), hp = filt('highpass', 380, 0.7), f1 = filt('bandpass', 700, 6), f2 = filt('bandpass', 1800, 9);
    var g1 = gain(1), g2 = gain(0.7), amp = gain(0), pn = pan(Math.random() * 1.9 - 0.95);
    src.connect(hp); hp.connect(f1); hp.connect(f2); f1.connect(g1); f2.connect(g2); g1.connect(amp); g2.connect(amp);
    amp.connect(pn); pn.connect(L.fxBus);
    var tt = t;
    amp.gain.setValueAtTime(0, t);
    while (tt < t + dur) {
      var syl = 0.07 + Math.random() * 0.12;
      f1.frequency.setValueAtTime(400 + Math.random() * 600, tt);
      f2.frequency.setValueAtTime(1100 + Math.random() * 1600, tt);
      amp.gain.linearRampToValueAtTime(level * (0.4 + Math.random() * 0.6), tt + syl * 0.3);
      amp.gain.linearRampToValueAtTime(level * 0.05, tt + syl);
      tt += syl;
    }
    amp.gain.linearRampToValueAtTime(0, tt + 0.1);
    src.start(t, Math.random() * 2); src.stop(tt + 0.2);
  }
  function thump(t, amp) {
    var o = osc('sine', 64), g = gain(0), lp = filt('lowpass', 140, 0.8);
    o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.16);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
  }
  function heartbeat(level) { var t = ctx.currentTime + 0.03; thump(t, level); thump(t + 0.24, level * 0.6); }
  function knock(t, level) {
    var src = shot(noiseBuf), bp = filt('bandpass', 280, 3), g = gain(0);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.09);
    src.connect(bp); bp.connect(g); g.connect(L.fxBus); src.start(t, Math.random()); src.stop(t + 0.12);
    var o = osc('sine', 120), og = gain(0);
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(65, t + 0.08);
    og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(level * 0.8, t + 0.004); og.gain.exponentialRampToValueAtTime(0.0008, t + 0.12);
    o.connect(og); og.connect(L.fxBus); o.start(t); o.stop(t + 0.15);
  }
  function knocks(level) { var t = ctx.currentTime + 0.05; for (var i = 0; i < 3; i++) knock(t + i * 0.3, level); }

  /* ---------- scheduler: each voice decides when it next speaks ---------- */
  var voices = [
    { name: 'birds', when: function (d) { return d < 0.3; }, level: function (d) { return 1 - d / 0.3; }, gap: function (d) { return 1.6 + Math.random() * 3 + d * 8; }, play: birds },
    { name: 'bell', when: function (d) { return d >= 0.48; }, level: function (d) { return 0.22 * SW.smooth(0.48, 0.66, d); }, gap: function () { return 6 + Math.random() * 5; }, play: bell },
    { name: 'whisper', when: function (d) { return d >= 0.6; }, level: function (d) { return 0.55 * SW.smooth(0.6, 0.85, d); }, gap: function (d) { return 1.2 + Math.random() * (5 - d * 3.5); }, play: whisper },
    { name: 'heart', when: function (d) { return d >= 0.74; }, level: function (d) { return 0.95 * SW.smooth(0.74, 0.9, d); }, gap: function (d) { return 60 / (52 + 72 * SW.smooth(0.74, 1, d)); }, play: heartbeat },
    { name: 'knock', when: function (d) { return d >= 0.82; }, level: function () { return 0.7; }, gap: function () { return 11 + Math.random() * 12; }, play: knocks }
  ];
  function schedule() {
    voices.forEach(function (v) { v.next = 0; });
    setInterval(function () {
      if (!A.on || hushed || !ctx || ctx.state !== 'running') return;
      var now = ctx.currentTime, d = SW.d;
      voices.forEach(function (v) {
        if (!v.when(d)) { v.next = 0; return; }
        if (!v.next) { v.next = now + (v.name === 'heart' ? 0.1 : Math.random() * 2); return; }
        if (now >= v.next) { v.play(v.level(d)); v.next = now + v.gap(d); }
      });
    }, 50);
  }

  /* ---------- continuous layers follow dread ---------- */
  function update(d) {
    if (!A.built || !A.on || hushed) return;
    ramp(L.lake.g.gain, 0.55 * (1 - SW.smooth(0.85, 1, d) * 0.5));
    ramp(L.lake.lp.frequency, SW.lerp(640, 150, SW.smooth(0.5, 0.8, d)));
    ramp(L.pad.g.gain, 0.32 * (1 - SW.smooth(0.42, 0.72, d)));
    ramp(L.pad.lp.frequency, SW.lerp(1500, 600, SW.smooth(0.2, 0.6, d)));
    ramp(L.pad.vib.gain, SW.smooth(0.18, 0.6, d) * 28);
    L.pad.oscs.forEach(function (o, i) { ramp(o.detune, (i % 2 ? 1 : -1) * (i + 1) * 22 * SW.smooth(0.15, 0.6, d)); });
    ramp(L.drone.g.gain, 0.28 * SW.smooth(0.34, 0.8, d));
    ramp(L.drone.lp.frequency, SW.lerp(150, 420, SW.smooth(0.4, 1, d)));
  }
  SW.on('d', update);

  /* ---------- public controls ---------- */
  A.start = function () {
    if (!A.built && !build()) return false;
    if (ctx.state !== 'running') ctx.resume();
    A.on = true; hushed = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 0.6);
    update(SW.d);
    SW.emit('sound', true);
    return true;
  };
  A.stop = function () {
    if (!A.built) return;
    A.on = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
    SW.emit('sound', false);
  };
  A.toggle = function () { return A.on ? (A.stop(), false) : A.start(); };

  /** a sudden total silence before the scare */
  A.silence = function () {
    hushed = true;
    if (!A.built) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.05);
  };
  /** after the reset loop */
  A.resume = function () {
    hushed = false;
    if (!A.built || !A.on) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 1.2);
    update(SW.d);
  };

  function distCurve(k) {
    var n = 2048, c = new Float32Array(n);
    for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    return c;
  }
  A.scream = function () {
    if (!A.built || !A.on) return;
    var t = ctx.currentTime + 0.01;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(1, t);
    var shaper = ctx.createWaveShaper(); shaper.curve = distCurve(40); shaper.oversample = '4x';
    var peak = filt('peaking', 1500, 1.2); peak.gain.value = 7;
    var env = gain(0);
    shaper.connect(peak); peak.connect(env); env.connect(master);
    var send = gain(0.5); env.connect(send); send.connect(verb);
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.95, t + 0.015);
    env.gain.setValueAtTime(0.9, t + 0.85);
    env.gain.exponentialRampToValueAtTime(0.001, t + 1.75);
    [523, 622, 741, 880, 1046].forEach(function (f, i) {
      var o = osc('sawtooth', f * 0.78), g = gain(0.13), v = osc('sine', 7 + i * 1.3), vg = gain(f * 0.05);
      o.frequency.setValueAtTime(f * 0.78, t);
      o.frequency.exponentialRampToValueAtTime(f * 1.16, t + 0.22);
      o.frequency.exponentialRampToValueAtTime(f * 1.34, t + 1.6);
      v.connect(vg); vg.connect(o.frequency);
      o.connect(g); g.connect(shaper); o.start(t); v.start(t); o.stop(t + 1.9); v.stop(t + 1.9);
    });
    var n = shot(noiseBuf), bp = filt('bandpass', 2400, 0.9), ng = gain(0.55);
    n.connect(bp); bp.connect(ng); ng.connect(shaper); n.start(t); n.stop(t + 1.9);
    // impact: a sub drop and a burst of glassy noise
    var sub = osc('sine', 72), sg = gain(0);
    sub.frequency.setValueAtTime(72, t); sub.frequency.exponentialRampToValueAtTime(26, t + 0.9);
    sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(1, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(sg); sg.connect(master); sub.start(t); sub.stop(t + 1.3);
    var hit = shot(noiseBuf), hhp = filt('highpass', 2800, 0.7), hg = gain(0);
    hg.gain.setValueAtTime(0, t); hg.gain.linearRampToValueAtTime(0.6, t + 0.005); hg.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    hit.connect(hhp); hhp.connect(hg); hg.connect(master); hit.start(t); hit.stop(t + 0.4);
    // then nothing at all while the screen is black
    master.gain.setValueAtTime(1, t + 1.7);
    master.gain.linearRampToValueAtTime(0, t + 1.95);
  };

  /* polite: pause when the tab is hidden */
  document.addEventListener('visibilitychange', function () {
    if (!A.built) return;
    if (document.hidden) ctx.suspend(); else if (A.on) ctx.resume();
  });
})();
