/* JC.audio — synthesized system sounds (WebAudio). Nothing is loaded from the network. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  let ctx = null;
  let master = null, sfx = null, media = null, noiseBuf = null;
  let ringTimer = null, ringNodes = [];

  function settings() { return (JC.state && JC.state.d && JC.state.d.settings) || {}; }

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    sfx = ctx.createGain();
    sfx.connect(master);
    media = ctx.createGain();
    media.connect(master);
    audio.out = media;
    applyVolume();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  function applyVolume() {
    if (!ctx) return;
    const s = settings();
    media.gain.setTargetAtTime(Math.pow(s.volume == null ? 0.6 : s.volume, 1.6), ctx.currentTime, 0.02);
    sfx.gain.setTargetAtTime(0.55 * (s.ringer == null ? 0.7 : s.ringer) + 0.1, ctx.currentTime, 0.02);
  }

  function unlock() {
    const c = ensure();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock, { passive: true, capture: true }));

  function tone(freq, t0, dur, opts) {
    opts = opts || {};
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if (opts.to) o.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    const peak = opts.gain == null ? 0.3 : opts.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(opts.dest || sfx);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
    return { o, g };
  }

  function bell(freq, t0, dur, gain, dest) {
    // two partials for a soft bell/marimba timbre
    tone(freq, t0, dur, { gain: gain, dest });
    tone(freq * 2.01, t0, dur * 0.5, { gain: gain * 0.35, dest });
    tone(freq * 3.98, t0, dur * 0.18, { gain: gain * 0.12, dest });
  }

  function noise(t0, dur, opts) {
    opts = opts || {};
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = opts.filter || 'highpass';
    f.frequency.setValueAtTime(opts.freq || 2000, t0);
    if (opts.to) f.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur);
    f.Q.value = opts.q || 0.7;
    const g = ctx.createGain();
    const peak = opts.gain == null ? 0.2 : opts.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.002));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(opts.dest || sfx);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }

  const RINGER = new Set(['receive', 'notify', 'ring', 'alert', 'sent.mail', 'charge', 'tink']);
  const KEYS = new Set(['key', 'key.delete', 'key.space', 'tap', 'lock', 'unlock']);

  const SOUNDS = {
    key(t) { noise(t, 0.022, { freq: 3800, gain: 0.07 }); tone(1900, t, 0.012, { gain: 0.02, type: 'square' }); },
    'key.delete'(t) { noise(t, 0.03, { freq: 2400, gain: 0.08 }); },
    'key.space'(t) { noise(t, 0.035, { freq: 1600, gain: 0.08 }); },
    tap(t) { noise(t, 0.015, { freq: 5000, gain: 0.05 }); },
    send(t) { noise(t, 0.28, { filter: 'bandpass', freq: 600, to: 4800, gain: 0.16, attack: 0.05, q: 1.2 }); tone(880, t + 0.12, 0.12, { gain: 0.05 }); },
    swoosh(t) { noise(t, 0.4, { filter: 'bandpass', freq: 400, to: 3000, gain: 0.14, attack: 0.08, q: 0.9 }); },
    'sent.mail'(t) { noise(t, 0.5, { filter: 'bandpass', freq: 300, to: 2400, gain: 0.14, attack: 0.1, q: 0.8 }); },
    receive(t) { bell(1318.5, t, 0.35, 0.12); bell(1760, t + 0.11, 0.5, 0.12); },
    notify(t) { bell(1046.5, t, 0.3, 0.1); bell(1318.5, t + 0.1, 0.3, 0.1); bell(1568, t + 0.2, 0.6, 0.11); },
    tink(t) { bell(2093, t, 0.25, 0.08); },
    alert(t) { bell(880, t, 0.25, 0.14); bell(659, t + 0.18, 0.4, 0.14); },
    error(t) { tone(160, t, 0.18, { type: 'sawtooth', gain: 0.05 }); tone(150, t + 0.2, 0.22, { type: 'sawtooth', gain: 0.05 }); },
    lock(t) { noise(t, 0.05, { filter: 'lowpass', freq: 1800, gain: 0.25 }); tone(140, t, 0.06, { gain: 0.18 }); },
    unlock(t) { noise(t, 0.03, { freq: 3000, gain: 0.12 }); tone(420, t, 0.04, { gain: 0.06 }); },
    shutter(t) { noise(t, 0.04, { filter: 'bandpass', freq: 3000, gain: 0.35, q: 0.6 }); noise(t + 0.07, 0.06, { filter: 'bandpass', freq: 2200, gain: 0.3, q: 0.6 }); },
    success(t) { bell(784, t, 0.2, 0.1); bell(988, t + 0.08, 0.2, 0.1); bell(1318.5, t + 0.16, 0.45, 0.11); },
    charge(t) { bell(1568, t, 0.5, 0.1); },
    pop(t) { tone(600, t, 0.08, { to: 900, gain: 0.08 }); },
    slam(t) { noise(t, 0.12, { filter: 'lowpass', freq: 600, gain: 0.4 }); tone(90, t, 0.25, { gain: 0.25 }); },
  };

  const RING_PATTERN = [
    [0, 659.3], [0.16, 784], [0.32, 987.8], [0.48, 1318.5], [0.64, 987.8], [0.8, 784], [1.12, 659.3], [1.28, 880], [1.44, 1046.5], [1.6, 1318.5],
  ];

  const audio = {
    out: null,
    ctx: ensure.bind(null),
    ready: () => !!ctx && ctx.state === 'running',
    applyVolume,
    play(name) {
      if (!ensure() || ctx.state !== 'running') return;
      const s = settings();
      if (s.silent && (RINGER.has(name) || KEYS.has(name))) return;
      if (name.startsWith('key') && s.keyClicks === false) return;
      if (name === 'ring') return audio.ring(true);
      if (name === 'ring.stop') return audio.ring(false);
      const fn = SOUNDS[name];
      if (fn) fn(ctx.currentTime + 0.005);
    },
    ring(on) {
      clearInterval(ringTimer);
      ringTimer = null;
      if (!on) {
        const custom = settings().ringtone;
        if (custom && custom !== 'Reflection' && JC.settingsKit && JC.settingsKit.playTone) JC.settingsKit.playTone('None');
        return;
      }
      if (!ensure() || settings().silent) return;
      const custom = settings().ringtone;
      const kit = JC.settingsKit && JC.settingsKit.playTone;
      if (custom && custom !== 'Reflection' && kit) {
        kit(custom);
        ringTimer = setInterval(() => kit(custom), 4200);
        return;
      }
      const playOnce = () => {
        if (!ctx || ctx.state !== 'running') return;
        const t = ctx.currentTime + 0.02;
        RING_PATTERN.forEach(([dt, f]) => bell(f, t + dt, 0.45, 0.13));
      };
      playOnce();
      ringTimer = setInterval(playOnce, 2600);
    },
    /** outgoing call ring-back (China: 450 Hz, 1 s on / 4 s off) */
    ringback(on) {
      clearInterval(audio._rb);
      audio._rb = null;
      if (!on || !ensure() || ctx.state !== 'running') return;
      const once = () => tone(450, ctx.currentTime + 0.01, 1.0, { gain: 0.06, attack: 0.02, dest: media });
      once();
      audio._rb = setInterval(once, 5000);
    },
    dtmf(key) {
      if (!ensure() || ctx.state !== 'running') return;
      const rows = { 1: 697, 2: 697, 3: 697, 4: 770, 5: 770, 6: 770, 7: 852, 8: 852, 9: 852, '*': 941, 0: 941, '#': 941 };
      const cols = { 1: 1209, 4: 1209, 7: 1209, '*': 1209, 2: 1336, 5: 1336, 8: 1336, 0: 1336, 3: 1477, 6: 1477, 9: 1477, '#': 1477 };
      const r = rows[key], c = cols[key];
      if (!r) return;
      const t = ctx.currentTime + 0.005;
      tone(r, t, 0.16, { gain: 0.06, attack: 0.004, dest: media });
      tone(c, t, 0.16, { gain: 0.06, attack: 0.004, dest: media });
    },
    beep(freq, dur, gain) {
      if (!ensure() || ctx.state !== 'running') return;
      tone(freq || 1000, ctx.currentTime + 0.005, dur || 0.2, { gain: gain || 0.08, dest: media });
    },
    bell(freq, dur, gain, at) {
      if (!ensure() || ctx.state !== 'running') return;
      bell(freq, (at || ctx.currentTime) + 0.005, dur || 0.5, gain || 0.1, media);
    },
    haptic(ms) {
      try { if (navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) { /* ignore */ }
    },
  };
  JC.audio = audio;
  if (JC.bus) {
    JC.bus.on('setting:volume', applyVolume);
    JC.bus.on('setting:ringer', applyVolume);
  }
})();
