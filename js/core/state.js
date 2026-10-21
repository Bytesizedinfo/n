/* JC.state — single persistent game state (localStorage, best effort) + rewind snapshots. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const W = () => JC.world || {};
  const KEY = W().storageKey || 'jcphone.v1';

  function defaults() {
    return {
      v: 1,
      started: false, // prologue seen
      unlocked: false, // passcode solved at least once
      passTries: 0,
      clock: null, // in-game ms (set by JC.time)
      eng: 0, // story engine play-time ms
      flags: {},
      sus: {},
      aff: {},
      runs: [], // active scene runs
      done: {}, // scene id -> 1 (started) | 'skipped' (when failed) | 'expired' (its chapter ended)
      fin: {}, // scene id -> play time when it finished
      due: {}, // scene id -> play time its (armed) trigger fires
      acts: {}, // act name -> times reported
      actOnce: {}, // onAct rule id -> times fired
      chap: null, // current chapter { id, at (play time it began), clock }
      chapAt: {}, // chapter id -> play time it began
      chapGo: null, // chapter transition in progress { id, to }
      bank: null, // JC.bank { bal: { accountId: n } }
      threads: {}, // per-thread dynamic data
      calls: [],
      notifs: [],
      store: {},
      home: null,
      lost: null, // lost mode {message, phone}
      battery: (W().device && W().device.battery) || 23,
      ended: null,
      endings: {}, // persists across restarts
      afterFound: {}, // aftermath outcomes ever found { chatId: { outcomeId: at } } (persists across restarts)
      afterLast: null, // aftermath shown with the last ending { ending, list }
      snaps: [],
      stats: { choices: 0, sent: 0, plays: 1 },
      settings: {
        appearance: 'auto',
        wallpaper: (W().device && W().device.wallpaper) || null,
        brightness: 1,
        textSize: 1,
        boldText: false,
        h24: false,
        volume: 0.6,
        ringer: 0.7,
        silent: false,
        wifi: true,
        wifiNet: null,
        bt: true,
        airplane: false,
        cellular: true,
        hotspot: false,
        focus: null,
        lowPower: false,
        rotationLock: true,
        flashlight: false,
        showSus: true,
        speed: 1, // Message Speed (typing pace)
        timeScale: 1, // 1 | 2 | 4 | 8: play time and the clock run this much faster
        keyClicks: true,
        passcode: (W().passcode && W().passcode.code) || '000000',
        faceAlt: false,
        previews: 'always',
        reduceMotion: false,
      },
    };
  }

  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    for (const k in saved) {
      if (k === 'settings') base.settings = Object.assign(base.settings, saved.settings || {});
      else base[k] = saved[k];
    }
    return base;
  }

  let saveTimer = null;
  let disabled = false;

  const state = {
    KEY,
    d: defaults(),
    defaults,
    init(hot) {
      let saved = null;
      if (hot && hot.v) saved = hot;
      else {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) saved = JSON.parse(raw);
        } catch (e) {
          saved = null;
        }
      }
      state.d = merge(defaults(), saved);
      return state.d;
    },
    save() {
      if (disabled) return;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(state.saveNow, 400);
    },
    saveNow() {
      clearTimeout(saveTimer);
      try {
        localStorage.setItem(KEY, JSON.stringify(state.d));
      } catch (e) {
        /* storage blocked or full: keep playing in memory */
      }
    },
    set(path, value) {
      const parts = path.split('.');
      let o = state.d;
      while (parts.length > 1) {
        const p = parts.shift();
        o = o[p] = o[p] || {};
      }
      o[parts[0]] = value;
      state.save();
      JC.bus.emit('state:' + path, value);
    },
    get(path) {
      return path.split('.').reduce((o, p) => (o == null ? o : o[p]), state.d);
    },
    setting(key, value) {
      if (value === undefined) return state.d.settings[key];
      state.d.settings[key] = value;
      state.save();
      JC.bus.emit('setting', { key, value });
      JC.bus.emit('setting:' + key, value);
      return value;
    },
    /** Snapshot everything except settings/endings/snapshots, for rewind. */
    snapshot(label) {
      const copy = Object.assign({}, state.d);
      delete copy.snaps;
      delete copy.endings;
      delete copy.afterFound;
      delete copy.settings;
      let json;
      try {
        json = JSON.stringify(copy);
      } catch (e) {
        return;
      }
      state.d.snaps.push({ label: label || '', at: Date.now(), json });
      while (state.d.snaps.length > 12) state.d.snaps.shift();
    },
    canRewind: () => state.d.snaps.length > 0,
    rewind() {
      const s = state.d.snaps.pop();
      if (!s) return false;
      const keep = { snaps: state.d.snaps, endings: state.d.endings, afterFound: state.d.afterFound, settings: state.d.settings };
      const restored = merge(defaults(), JSON.parse(s.json));
      state.d = Object.assign(restored, keep);
      state.saveNow();
      return true;
    },
    restart() {
      const keep = { endings: state.d.endings, afterFound: state.d.afterFound, settings: state.d.settings, stats: state.d.stats };
      state.d = defaults();
      state.d.endings = keep.endings || {};
      state.d.afterFound = keep.afterFound || {};
      state.d.settings = Object.assign(state.d.settings, keep.settings || {});
      state.d.stats = { choices: 0, sent: 0, plays: ((keep.stats && keep.stats.plays) || 1) + 1 };
      state.saveNow();
    },
    wipe() {
      disabled = true;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    },
  };
  JC.state = state;

  window.addEventListener('pagehide', () => state.saveNow());
  document.addEventListener('visibilitychange', () => { if (document.hidden) state.saveNow(); });
})();
