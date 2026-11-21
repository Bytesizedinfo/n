/* Hushling · sound
   Synthesised with the Web Audio API; nothing plays until the visitor asks for it.
   Monitor hiss and room tone → a music-box lullaby (an original tune) that slows, drifts out of tune and
   slips into a minor key → a baby breathing, then something else breathing → "shh" → a heartbeat → the scream. */
(function () {
  'use strict';
  var SW = window.HL;
  var A = (SW.audio = { on: false, built: false, lullabyOn: false });
  var ctx, master, comp, verb, noiseBuf, brownBuf, L = {}, hushed = false, LEVEL = 0.85;

  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function filt(type, f, q) { var b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; return b; }
  function osc(type, f) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; }
  function pan(v) { if (ctx.createStereoPanner) { var p = ctx.createStereoPanner(); p.pan.value = v; return p; } return gain(1); }
  function ramp(param, v, tau) { param.setTargetAtTime(v, ctx.currentTime, tau || 0.4); }
  function noise(kind, seconds) {
    var len = Math.floor(ctx.sampleRate * seconds), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; data[i] = last * 3.2; } else data[i] = w; }
    }
    return buf;
  }
  function impulse(sec, decay) {
    var len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var data = buf.getChannelData(ch); for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return buf;
  }
  function loop(buf) { var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; }
  function shot(buf) { var s = ctx.createBufferSource(); s.buffer = buf; return s; }
  function out(node, wet) { node.connect(master); if (wet) { var g = gain(wet); node.connect(g); g.connect(verb); } }

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.3;
    master = gain(0); master.connect(comp); comp.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(2.2, 2.8);
    var verbOut = gain(0.5); verb.connect(verbOut); verbOut.connect(master);
    noiseBuf = noise('white', 3); brownBuf = noise('brown', 5);

    // monitor hiss and room tone
    var hissBP = filt('bandpass', 2600, 0.6), hissG = gain(0);
    loop(noiseBuf).connect(hissBP); hissBP.connect(hissG); out(hissG, 0);
    var roomLP = filt('lowpass', 260, 0.6), roomG = gain(0);
    loop(brownBuf).connect(roomLP); roomLP.connect(roomG); out(roomG, 0);
    L.hiss = hissG; L.room = roomG;
    // the music box bus: a little lowpass and a lot of room
    L.box = filt('lowpass', 5200, 0.5); L.boxG = gain(0.32); L.box.connect(L.boxG); out(L.boxG, 0.6);
    L.fx = gain(1); out(L.fx, 0.35);
    A.built = true;
    schedule();
    return true;
  }

  /* ---------- the lullaby: an original tune, in beats ---------- */
  var TUNE = [[7, 1], [4, 1], [5, 1], [7, 2], [9, 1], [7, 1], [4, 2], [2, 1], [4, 1], [5, 1], [4, 1], [2, 1], [0, 3],
              [7, 1], [4, 1], [5, 1], [7, 2], [12, 1], [11, 1], [9, 2], [7, 1], [5, 1], [4, 1], [2, 1], [0, 4]];
  var MINOR = { 4: 3, 9: 8, 11: 10 };
  var noteIdx = 0, nextNote = 0;
  function boxNote(t, semis, detune, level) {
    var f = 523.25 * Math.pow(2, semis / 12);
    [[1, 1, 1.8], [2, 0.32, 0.9], [4.07, 0.12, 0.35], [5.4, 0.05, 0.2]].forEach(function (p) {
      var o = osc('sine', f * p[0]), g = gain(0);
      o.detune.value = detune;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(p[1] * level, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0004, t + p[2]);
      o.connect(g); g.connect(L.box); o.start(t); o.stop(t + p[2] + 0.05);
    });
    var tick = shot(noiseBuf), hp = filt('highpass', 4000, 0.7), tg = gain(0);
    tg.gain.setValueAtTime(0.05 * level, t); tg.gain.exponentialRampToValueAtTime(0.0004, t + 0.02);
    tick.connect(hp); hp.connect(tg); tg.connect(L.box); tick.start(t, Math.random()); tick.stop(t + 0.03);
  }
  function lullabyTick() {
    var playing = A.lullabyOn || SW.d >= 0.5;
    if (!playing) { nextNote = 0; return; }
    var d = SW.d, now = ctx.currentTime;
    if (!nextNote || nextNote < now) nextNote = now + 0.05;
    while (nextNote < now + 0.25) {
      var n = TUNE[noteIdx % TUNE.length];
      var bpm = SW.lerp(96, 44, SW.smooth(0.45, 1, d));
      var semis = d > 0.6 && MINOR[n[0]] != null ? MINOR[n[0]] : n[0];
      var detune = (Math.random() - 0.5) * 70 * SW.smooth(0.35, 1, d) + Math.sin(now * 0.7) * 40 * SW.smooth(0.6, 1, d);
      if (!(d > 0.72 && Math.random() < 0.14)) boxNote(nextNote, semis, detune, 1 - SW.smooth(0.9, 1, d) * 0.4);
      nextNote += 60 / bpm * n[1];
      noteIdx++;
    }
  }

  /* ---------- breathing, shh, heartbeat ---------- */
  function breath(level, f, q, inhale, exhale, p) {
    var t = ctx.currentTime + 0.03, src = shot(noiseBuf), bp = filt('bandpass', f, q), g = gain(0), pn = pan(p);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(level, t + inhale * 0.7); g.gain.linearRampToValueAtTime(level * 0.15, t + inhale);
    g.gain.linearRampToValueAtTime(level * 0.8, t + inhale + exhale * 0.3); g.gain.linearRampToValueAtTime(0, t + inhale + exhale);
    src.connect(bp); bp.connect(g); g.connect(pn); pn.connect(L.fx); src.start(t, Math.random() * 1.5); src.stop(t + inhale + exhale + 0.1);
  }
  A.shh = function (level, p) {
    if (!A.built || !A.on) return;
    var t = ctx.currentTime + 0.02, src = shot(noiseBuf), hp = filt('highpass', 2600, 0.8), bp = filt('bandpass', 4800, 1.4), g = gain(0), pn = pan(p || 0);
    var lv = level || 0.5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lv, t + 0.12); g.gain.setValueAtTime(lv * 0.9, t + 0.6); g.gain.linearRampToValueAtTime(0, t + 1.1);
    src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(pn); pn.connect(L.fx); src.start(t, Math.random()); src.stop(t + 1.2);
  };
  function thump(t, amp) {
    var o = osc('sine', 64), g = gain(0), lp = filt('lowpass', 140, 0.8);
    o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.16);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
  }

  var voices = [
    { when: function (d) { return d >= 0.16 && d < 0.78; }, play: function (d) { breath(0.05, 1900, 1.6, 0.7, 1.0, -0.1); }, gap: function () { return 60 / 34; } },
    { when: function (d) { return d >= 0.3; }, play: function (d) { breath(0.08 + 0.3 * SW.smooth(0.3, 0.9, d), 520, 1.1, 1.7, 2.4, 0.25); }, gap: function () { return 60 / 11; } },
    { when: function (d) { return d >= 0.56; }, play: function (d) { A.shh(0.25 + 0.35 * SW.smooth(0.56, 0.9, d), Math.random() * 1.6 - 0.8); }, gap: function (d) { return 3 + Math.random() * (9 - d * 6); } },
    { when: function (d) { return d >= 0.78; }, play: function (d) { var t = ctx.currentTime + 0.03, lv = 0.95 * SW.smooth(0.78, 0.92, d); thump(t, lv); thump(t + 0.24, lv * 0.6); }, gap: function (d) { return 60 / (54 + 70 * SW.smooth(0.78, 1, d)); } }
  ];
  function schedule() {
    voices.forEach(function (v) { v.next = 0; });
    setInterval(function () {
      if (!A.on || hushed || !ctx || ctx.state !== 'running') return;
      lullabyTick();
      var now = ctx.currentTime, d = SW.d;
      voices.forEach(function (v) {
        if (!v.when(d)) { v.next = 0; return; }
        if (!v.next) { v.next = now + Math.random() * 1.5; return; }
        if (now >= v.next) { v.play(d); v.next = now + v.gap(d); }
      });
    }, 50);
  }
  function update(d) {
    if (!A.built || !A.on || hushed) return;
    ramp(L.hiss.gain, 0.012 + 0.07 * SW.smooth(0.3, 1, d));
    ramp(L.room.gain, 0.12 + 0.2 * SW.smooth(0.5, 1, d));
    ramp(L.box.frequency, SW.lerp(5200, 1800, SW.smooth(0.6, 1, d)));
  }
  SW.on('d', update);

  /* ---------- public controls ---------- */
  A.start = function () {
    if (!A.built && !build()) return false;
    if (ctx.state !== 'running') ctx.resume();
    A.on = true; hushed = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 0.5);
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
  A.lullaby = function (on) { A.lullabyOn = on; if (on && !A.on) A.start(); noteIdx = on ? 0 : noteIdx; SW.emit('lullaby', on); };

  /* hold to talk: an open channel of static */
  var talkSrc = null, talkG = null;
  A.talk = function (on) {
    if (!A.built || !A.on) return;
    var t = ctx.currentTime;
    if (on && !talkSrc) {
      talkSrc = shot(noiseBuf); talkSrc.loop = true;
      var bp = filt('bandpass', 1700, 0.5); talkG = gain(0);
      talkG.gain.setValueAtTime(0, t); talkG.gain.linearRampToValueAtTime(0.16, t + 0.05);
      talkSrc.connect(bp); bp.connect(talkG); talkG.connect(master); talkSrc.start(t);
    } else if (!on && talkSrc) {
      talkG.gain.cancelScheduledValues(t); talkG.gain.setValueAtTime(talkG.gain.value, t); talkG.gain.linearRampToValueAtTime(0, t + 0.08);
      talkSrc.stop(t + 0.1); talkSrc = null;
    }
  };
  /** a burst of static when the camera switches */
  A.static = function (dur, level) {
    if (!A.built || !A.on || hushed) return;
    var t = ctx.currentTime, src = shot(noiseBuf), bp = filt('bandpass', 2200, 0.4), g = gain(0);
    g.gain.setValueAtTime(level || 0.35, t); g.gain.linearRampToValueAtTime(0, t + (dur || 0.4));
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t, Math.random()); src.stop(t + (dur || 0.4) + 0.05);
  };
  /** three cries for the translator */
  A.cry = function (i) {
    if (!A.built || !A.on) return;
    var t = ctx.currentTime + 0.02, base = [430, 480, 390][i % 3], dur = [0.9, 1.3, 0.7][i % 3];
    for (var k = 0; k < 2; k++) {
      var t0 = t + k * (dur + 0.25);
      var o = osc('sawtooth', base), v = osc('sine', 6 + i), vg = gain(18), env = gain(0);
      var f1 = filt('bandpass', 1100, 4), f2 = filt('bandpass', 2700, 6), g1 = gain(1), g2 = gain(0.6);
      o.frequency.setValueAtTime(base * 0.85, t0); o.frequency.linearRampToValueAtTime(base * 1.2, t0 + dur * 0.3); o.frequency.linearRampToValueAtTime(base * 0.8, t0 + dur);
      v.connect(vg); vg.connect(o.frequency);
      o.connect(f1); o.connect(f2); f1.connect(g1); f2.connect(g2); g1.connect(env); g2.connect(env); env.connect(L.fx);
      env.gain.setValueAtTime(0, t0); env.gain.linearRampToValueAtTime(0.5, t0 + 0.08); env.gain.setValueAtTime(0.45, t0 + dur - 0.15); env.gain.linearRampToValueAtTime(0, t0 + dur);
      o.start(t0); v.start(t0); o.stop(t0 + dur + 0.05); v.stop(t0 + dur + 0.05);
    }
  };

  A.silence = function () {
    hushed = true;
    if (!A.built) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.05);
  };
  A.resume = function () {
    hushed = false;
    if (!A.built || !A.on) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(LEVEL, ctx.currentTime, 1.2);
    update(SW.d);
  };
  function distCurve(k) { var n = 2048, c = new Float32Array(n); for (var i = 0; i < n; i++) { var x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
  A.scream = function () {
    if (!A.built || !A.on) return;
    var t = ctx.currentTime + 0.01;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(1, t);
    var shaper = ctx.createWaveShaper(); shaper.curve = distCurve(40); shaper.oversample = '4x';
    var peak = filt('peaking', 1500, 1.2); peak.gain.value = 7;
    var env = gain(0); shaper.connect(peak); peak.connect(env); env.connect(master);
    var send = gain(0.4); env.connect(send); send.connect(verb);
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(0.95, t + 0.015); env.gain.setValueAtTime(0.9, t + 0.85); env.gain.exponentialRampToValueAtTime(0.001, t + 1.75);
    [523, 622, 741, 880, 1046].forEach(function (f, i) {
      var o = osc('sawtooth', f * 0.78), g = gain(0.13), v = osc('sine', 7 + i * 1.3), vg = gain(f * 0.05);
      o.frequency.setValueAtTime(f * 0.78, t); o.frequency.exponentialRampToValueAtTime(f * 1.16, t + 0.22); o.frequency.exponentialRampToValueAtTime(f * 1.34, t + 1.6);
      v.connect(vg); vg.connect(o.frequency); o.connect(g); g.connect(shaper); o.start(t); v.start(t); o.stop(t + 1.9); v.stop(t + 1.9);
    });
    // a burst of monitor static under it
    var n = shot(noiseBuf), bp = filt('bandpass', 2400, 0.6), ng = gain(0.6);
    n.connect(bp); bp.connect(ng); ng.connect(shaper); n.start(t); n.stop(t + 1.9);
    var sub = osc('sine', 72), sg = gain(0);
    sub.frequency.setValueAtTime(72, t); sub.frequency.exponentialRampToValueAtTime(26, t + 0.9);
    sg.gain.setValueAtTime(0, t); sg.gain.linearRampToValueAtTime(1, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(sg); sg.connect(master); sub.start(t); sub.stop(t + 1.3);
    master.gain.setValueAtTime(1, t + 1.7); master.gain.linearRampToValueAtTime(0, t + 1.95);
  };

  document.addEventListener('visibilitychange', function () {
    if (!A.built) return;
    if (document.hidden) ctx.suspend(); else if (A.on) ctx.resume();
  });
})();
