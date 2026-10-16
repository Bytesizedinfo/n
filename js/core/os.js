/* JC.os — the phone: springboard, lock screen, passcode, gestures, app windows, control center,
   notification center, dynamic island, hardware buttons, cinematic overlays. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;

  // ── App registry ─────────────────────────────────────────────────
  const apps = (JC.apps = {});
  JC.app = (def) => {
    apps[def.id] = def;
    return def;
  };

  const APP_NAMES = {
    phone: 'Phone', messages: 'Messages', safari: 'Safari', music: 'Music', facetime: 'FaceTime', calendar: 'Calendar',
    photos: 'Photos', camera: 'Camera', mail: 'Mail', notes: 'Notes', reminders: 'Reminders', clock: 'Clock', maps: 'Maps',
    weather: 'Weather', wallet: 'Wallet', settings: 'Settings', wavelet: 'Wavelet', lotuseats: 'Lotus Eats', swift: 'Swift Ride',
    health: 'Health', findmy: 'Find My', voicememos: 'Voice Memos', stocks: 'Stocks', lotusleap: 'Lotus Leap', contacts: 'Contacts',
    calculator: 'Calculator',
  };

  const DEFAULT_HOME = {
    pages: [
      [{ widget: 'weather' }, { widget: 'calendar' }, 'facetime', 'calendar', 'photos', 'camera', 'mail', 'notes', 'reminders', 'clock', 'maps', 'weather', 'wallet', 'settings', 'wavelet', 'lotuseats', 'swift', 'health'],
      [{ widget: 'memories' }, { widget: 'endings' }, 'findmy', 'voicememos', 'stocks', 'lotusleap', { folder: 'Utilities', apps: ['calculator', 'contacts'] }],
    ],
    dock: ['phone', 'messages', 'safari', 'music'],
    hidden: [],
  };

  const LIBRARY = [
    ['Suggestions', ['messages', 'phone', 'photos', 'voicememos', 'notes', 'findmy', 'wavelet', 'maps']],
    ['Social', ['messages', 'wavelet', 'facetime', 'phone', 'contacts']],
    ['Productivity & Finance', ['mail', 'notes', 'calendar', 'reminders', 'wallet', 'stocks']],
    ['Utilities', ['calculator', 'clock', 'settings', 'findmy', 'voicememos', 'contacts']],
    ['Travel', ['maps', 'swift', 'weather']],
    ['Food & Drink', ['lotuseats']],
    ['Creativity', ['photos', 'camera', 'music']],
    ['Health & Fitness', ['health']],
    ['Games', ['lotusleap']],
    ['Information & Reading', ['safari', 'weather', 'stocks']],
  ];

  const S = () => JC.state.d;
  const setting = (k, v) => JC.state.setting(k, v);

  const os = {
    ready: false,
    scale: 1,
    W: 402,
    H: 874,
    locked: true,
    asleep: false,
    appNames: APP_NAMES,
    apps,
  };
  JC.os = os;

  let screen, device, stage;
  const els = {};
  const running = {}; // id -> win
  let order = []; // recency, most recent last
  let active = null; // win
  let homePage = 0;
  let jiggle = false;
  let pendingAfterUnlock = null;

  // ── Build ────────────────────────────────────────────────────────
  function build() {
    stage = document.getElementById('stage');
    stage.innerHTML = '';
    device = h('div#device',
      h('div.hw.hw-action', { title: 'Action button (silent mode)', onTap: () => hwAction() }),
      h('div.hw.hw-volup', { title: 'Volume up', onTap: () => volume(+1) }),
      h('div.hw.hw-voldown', { title: 'Volume down', onTap: () => volume(-1) }),
      h('div.hw.hw-side', { title: 'Side button (lock) — hold for Siri' }),
      h('div.hw.hw-camctl', { title: 'Camera Control', onTap: () => { if (os.locked) unlockThen(() => os.open('camera')); else os.open('camera'); } }));
    screen = h('div#screen');
    device.appendChild(screen);
    const caption = h('div#caption',
      h('div.cap-title', 'Jiang Cheng’s Phone'),
      h('div.cap-sub', 'You found it in a taxi. Everyone thinks you’re him.'),
      h('div.cap-hints',
        h('div', h('b', 'Home'), ' drag up from the bottom bar (or tap it) · Esc'),
        h('div', h('b', 'Control Center'), ' drag down from the top-right'),
        h('div', h('b', 'Notifications'), ' drag down from the top-left'),
        h('div', h('b', 'Back'), ' swipe from the left edge'),
        h('div', h('b', 'Lock'), ' side button (right edge)')),
      h('div.cap-links',
        h('span.cap-link', { onTap: () => os.showEndings() }, 'Endings'),
        h('span.cap-dot', '·'),
        h('span.cap-link', { onTap: () => confirmRestart() }, 'Restart story')));
    stage.append(device, caption);

    const layers = ['wall', 'home', 'apps', 'switcher', 'kb', 'lock', 'cc', 'banners', 'call-layer', 'sys-overlays', 'sys-toasts', 'cinema', 'statusbar', 'island', 'homebar', 'vol-hud', 'dim', 'sleep'];
    layers.forEach((id) => { els[id] = h('div#' + id); screen.appendChild(els[id]); });
    els.kb.classList.add('kb');
    JC.kb.mount(els.kb);

    buildStatusBar();
    buildIsland();
    buildHome();
    buildLock();
    buildCC();
    buildHomebar();
    buildSideButton();
    layout();
    window.addEventListener('resize', U.debounce(layout, 80));
    applyAppearance();
    applyWallpaper();
    applyBrightness();
    applyTextSize();
    keyboardShortcuts();
    document.addEventListener('touchstart', () => {}, { passive: true }); // :active on iOS
    os.ready = true;
  }

  function layout() {
    const cs = getComputedStyle(stage);
    const availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const mobile = availW < 470;
    const wide = !mobile && window.innerWidth > 980;
    stage.classList.toggle('mobile', mobile);
    stage.classList.toggle('wide', wide);
    let devW, devH;
    if (mobile) {
      os.scale = Math.min(availW / 402, 1.25);
      os.H = Math.max(600, Math.round(availH / os.scale));
      devW = 402;
      devH = os.H;
    } else {
      os.H = 874;
      devW = 434;
      devH = 906;
      const w = wide ? availW - 56 - 280 : availW;
      os.scale = Math.max(0.3, Math.min(1, availH / devH, w / devW));
    }
    screen.style.height = os.H + 'px';
    screen.style.setProperty('--H', os.H + 'px');
    device.style.width = devW + 'px';
    device.style.height = devH + 'px';
    device.style.transform = `scale(${os.scale})`;
    device.style.margin = `${(devH * os.scale - devH) / 2}px ${(devW * os.scale - devW) / 2}px`;
    JC.bus.emit('layout');
  }

  // ── Appearance ───────────────────────────────────────────────────
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function hostDark() {
    const t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return !!(mq && mq.matches);
  }
  function applyAppearance() {
    const a = S().settings.appearance;
    const dark = a === 'dark' || (a === 'auto' && hostDark());
    os.dark = dark;
    screen.classList.toggle('dark', dark);
    updateStatus();
    JC.bus.emit('appearance', dark);
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', () => applyAppearance());
  new MutationObserver(() => applyAppearance()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  os.setAppearance = (a) => { setting('appearance', a); applyAppearance(); };

  function wallUrl(id) { return JC.art.url(id || S().settings.wallpaper || 'wp_lotus_dusk'); }
  function applyWallpaper() {
    const id = S().settings.wallpaper || 'wp_lotus_dusk';
    const url = wallUrl(id);
    els.wall.style.backgroundImage = `url("${url}")`;
    if (els.lockWall) els.lockWall.style.backgroundImage = `url("${url}")`;
    if (els.passBg) els.passBg.style.backgroundImage = `url("${url}")`;
    const fg = id + '_fg';
    if (els.lockFg) {
      els.lockFg.style.backgroundImage = JC.art.has(fg) ? `url("${JC.art.url(fg)}")` : 'none';
    }
  }
  os.setWallpaper = (id) => { setting('wallpaper', id); applyWallpaper(); JC.story && JC.story.act('wallpaper', { id }); };
  function applyBrightness() {
    const b = S().settings.brightness == null ? 1 : S().settings.brightness;
    els.dim.style.opacity = String((1 - b) * 0.78);
  }
  os.setBrightness = (b) => { setting('brightness', U.clamp(b, 0.05, 1)); applyBrightness(); };

  // ── Toggles ──────────────────────────────────────────────────────
  os.toggles = new Proxy({}, { get: (t, k) => S().settings[k] });
  os.setToggle = (k, on) => {
    setting(k, on);
    if (k === 'airplane') {
      if (on) { setting('wifiWas', S().settings.wifi); setting('btWas', S().settings.bt); }
      JC.bus.emit('network', os.online());
    }
    if (k === 'cellular' || k === 'wifi') JC.bus.emit('network', os.online());
    if (k === 'silent') islandFlash(on ? 'Silent Mode' : 'Ring', on ? 'bell.slash.fill' : 'bell.fill', on ? '#ff453a' : '#fff');
    if (k === 'flashlight') stage.classList.toggle('flash-on', !!on);
    if (k === 'focus') updateStatus();
    if (k === 'lowPower') updateStatus();
    updateStatus();
    renderCC();
  };
  os.online = () => !S().settings.airplane && (S().settings.cellular || !!S().settings.wifiNet);

  // ── Status bar ───────────────────────────────────────────────────
  function buildStatusBar() {
    const sb = els.statusbar;
    sb.innerHTML = '';
    const left = h('div.sb-left', { onTap: () => openNC() }, h('span.sb-time'), h('span.sb-focus'));
    const right = h('div.sb-right', { onTap: () => openCC() },
      h('span.sb-cell', svgBars()), h('span.sb-net'), h('span.sb-wifi', JC.icon('wifi', { size: 17, weight: 2.4 })),
      h('span.sb-batt', h('span.sb-batt-body', h('span.sb-batt-fill')), h('span.sb-batt-cap')));
    sb.append(left, right);
    els.sbTime = left.querySelector('.sb-time');
    els.sbFocus = left.querySelector('.sb-focus');
    els.sbNet = right.querySelector('.sb-net');
    els.sbWifi = right.querySelector('.sb-wifi');
    els.sbCell = right.querySelector('.sb-cell');
    els.sbBatt = right.querySelector('.sb-batt');
    // pull-down gestures from the top edge
    U.drag(left, { axis: 'y', start: (e, p) => p.dy > 0, end: (e, p) => { if (p.dy > 40) openNC(); } });
    U.drag(right, { axis: 'y', start: (e, p) => p.dy > 0, end: (e, p) => { if (p.dy > 40) openCC(); } });
  }
  function svgBars() {
    const s = document.createElement('span');
    s.innerHTML = '<svg viewBox="0 0 18 12" width="18" height="12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>';
    return s;
  }
  function statusStyle() {
    if (els.cc && els.cc.classList.contains('open')) return 'light';
    if (!els.lock.classList.contains('gone') || os.asleep) return 'light';
    if (els.switcher.classList.contains('open')) return 'light';
    if (active && !active.closing) {
      const st = active.status || active.def.status || 'auto';
      if (st === 'auto') return os.dark ? 'light' : 'dark';
      return st;
    }
    return 'light';
  }
  function updateStatus() {
    if (!els.statusbar) return;
    const st = statusStyle();
    els.statusbar.classList.toggle('dark-text', st === 'dark');
    els.homebar.classList.toggle('dark-bar', st === 'dark');
    const s = S().settings;
    els.sbTime.textContent = U.fmtClock(JC.time.now());
    els.sbFocus.innerHTML = '';
    if (s.focus) els.sbFocus.appendChild(JC.icon(s.focus === 'sleep' ? 'bed.double.fill' : s.focus === 'work' ? 'briefcase.fill' : 'moon.fill', { size: 13 }));
    const air = s.airplane;
    els.sbCell.style.display = air ? 'none' : '';
    els.sbCell.classList.toggle('off', !s.cellular);
    els.sbNet.textContent = air ? '' : s.cellular ? (s.wifiNet ? '' : '5G') : '';
    els.sbNet.innerHTML = air ? '' : els.sbNet.textContent;
    if (air) els.sbNet.appendChild(JC.icon('airplane', { size: 15 }));
    els.sbWifi.style.display = s.wifiNet && s.wifi && !air ? '' : 'none';
    const b = S().battery;
    const fill = els.sbBatt.querySelector('.sb-batt-fill');
    fill.style.width = Math.max(3, b) + '%';
    els.sbBatt.classList.toggle('low', b <= 20 && !s.lowPower);
    els.sbBatt.classList.toggle('lpm', !!s.lowPower);
    els.sbBatt.classList.toggle('charging', !!os.charging);
    if (els.lockTime) renderLockClock();
  }
  os.updateStatus = updateStatus;
  os.setStatus = (style) => { if (active) { active.status = style; updateStatus(); } };

  // ── Battery ──────────────────────────────────────────────────────
  let battAcc = 0;
  let lowWarned = {};
  function batteryTick() {
    if (os.charging) return;
    battAcc += 1;
    const rate = S().settings.lowPower ? 220 : 150;
    if (battAcc >= rate) {
      battAcc = 0;
      const b = S().battery;
      if (b > 9) {
        S().battery = b - 1;
        JC.state.save();
        updateStatus();
        if ((S().battery === 20 || S().battery === 10) && !lowWarned[S().battery]) {
          lowWarned[S().battery] = true;
          JC.ui.alert({ title: 'Low Battery', message: S().battery + '% battery remaining', buttons: [{ text: 'Low Power Mode', onTap: () => os.setToggle('lowPower', true) }, { text: 'Close', style: 'cancel' }] });
        }
      }
    }
  }
  os.battery = () => S().battery;
  os.setBattery = (n) => { S().battery = U.clamp(Math.round(n), 1, 100); JC.state.save(); updateStatus(); JC.bus.emit('battery', S().battery); };

  // ── Dynamic Island ───────────────────────────────────────────────
  const activities = {};
  let islandExpanded = false;
  function buildIsland() {
    const isl = els.island;
    isl.innerHTML = '';
    isl.append(h('div.isl-left'), h('div.isl-cam'), h('div.isl-right'), h('div.isl-expanded'), h('div.isl-flash'));
    JC.ui.onTap(isl, () => {
      const a = topActivity();
      if (!a) return;
      if (islandExpanded) { collapseIsland(); if (a.onTap) a.onTap(); return; }
      if (a.expanded) expandIsland(a);
      else if (a.onTap) a.onTap();
    });
    U.longPress(isl, () => { const a = topActivity(); if (a && a.expanded) expandIsland(a); });
  }
  function topActivity() {
    const list = Object.values(activities).sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return list[0] || null;
  }
  function renderIsland() {
    const isl = els.island;
    const a = topActivity();
    const L = isl.querySelector('.isl-left'), R = isl.querySelector('.isl-right');
    L.innerHTML = ''; R.innerHTML = '';
    isl.classList.toggle('active', !!a && !islandExpanded);
    if (a && !islandExpanded) {
      const c = a.compact ? a.compact() : {};
      if (c.left) L.appendChild(c.left);
      if (c.right) R.appendChild(c.right);
      isl.style.setProperty('--iw', (a.width || 236) + 'px');
    }
  }
  function expandIsland(a) {
    const ex = els.island.querySelector('.isl-expanded');
    ex.innerHTML = '';
    a.expanded(ex);
    islandExpanded = true;
    els.island.classList.add('expanded');
    els.island.classList.remove('active');
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 50);
    function outside(e) {
      if (!els.island.contains(e.target)) { collapseIsland(); document.removeEventListener('pointerdown', outside, true); }
    }
  }
  function collapseIsland() {
    islandExpanded = false;
    els.island.classList.remove('expanded');
    renderIsland();
  }
  function islandFlash(text, icon, color) {
    const f = els.island.querySelector('.isl-flash');
    f.innerHTML = '';
    f.append(h('span.isl-flash-ic', { style: { color: color || '#fff' } }, JC.icon(icon, { size: 16 })), h('span', text));
    els.island.classList.add('flash');
    clearTimeout(islandFlash.t);
    islandFlash.t = setTimeout(() => els.island.classList.remove('flash'), 1700);
  }
  os.island = {
    start(id, a) { activities[id] = a; renderIsland(); },
    update(id, patch) { if (activities[id]) { Object.assign(activities[id], patch || {}); renderIsland(); } },
    stop(id) { delete activities[id]; if (islandExpanded) collapseIsland(); else renderIsland(); },
    has: (id) => !!activities[id],
    flash: islandFlash,
    collapse: collapseIsland,
  };
  setInterval(() => { if (Object.keys(activities).length && !islandExpanded) renderIsland(); }, 1000);

  function faceIdAnim(success) {
    return new Promise((resolve) => {
      const isl = els.island;
      const f = isl.querySelector('.isl-flash');
      f.innerHTML = '';
      f.appendChild(h('div.faceid', h('div.faceid-glyph', success ? JC.icon('checkmark', { size: 34, weight: 2.4 }) : faceGlyph())));
      isl.classList.add('faceid');
      if (!success) setTimeout(() => isl.classList.add('shake'), 650);
      setTimeout(() => {
        if (success) f.querySelector('.faceid-glyph').classList.add('ok');
      }, 300);
      setTimeout(() => {
        isl.classList.remove('faceid', 'shake');
        resolve();
      }, success ? 700 : 1150);
    });
  }
  function faceGlyph() {
    const s = document.createElement('span');
    s.innerHTML = '<svg viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M4 12V8a4 4 0 0 1 4-4h4M28 4h4a4 4 0 0 1 4 4v4M36 28v4a4 4 0 0 1-4 4h-4M12 36H8a4 4 0 0 1-4-4v-4M14 15v3M26 15v3M20 15v8h-2M15 28c3 2.5 7 2.5 10 0"/></svg>';
    return s;
  }

  // ── Lock screen ──────────────────────────────────────────────────
  function buildLock() {
    const L = els.lock;
    L.innerHTML = '';
    els.lockWall = h('div.lock-wall');
    els.lockFg = h('div.lock-fg');
    els.lockTime = h('div.lock-time');
    els.lockDate = h('div.lock-date');
    els.lockGlyph = h('div.lock-glyph', JC.icon('lock.fill', { size: 22 }));
    els.lockWidgets = h('div.lock-widgets');
    els.lockLost = h('div.lock-lost', { hidden: true });
    els.lockNotifs = h('div.lock-notifs.scroll');
    els.lockHint = h('div.lock-hint', 'Swipe up to open');
    const flash = h('div.lock-btn.flash', { onTap: () => { os.setToggle('flashlight', !S().settings.flashlight); flash.classList.toggle('on', !!S().settings.flashlight); } }, JC.icon('flashlight.off.fill', { size: 22 }));
    const cam = h('div.lock-btn.cam', { onTap: () => unlockThen(() => os.open('camera')) }, JC.icon('camera.fill', { size: 22 }));
    els.lockFlash = flash;
    // layers: wallpaper → clock → depth-effect foreground → date, widgets, notifications
    const clock = h('div.lock-clock', els.lockTime);
    const front = h('div.lock-front', els.lockGlyph, els.lockDate);
    els.lockWidgets.classList.add('lock-wlayer');
    const content = h('div.lock-content', els.lockWall, clock, els.lockFg, front, els.lockWidgets, els.lockLost, els.lockNotifs, flash, cam, els.lockHint);
    L.append(content);
    els.lockContent = content;
    buildPasscode();
    // swipe up anywhere on the lock screen
    U.drag(content, {
      axis: 'y',
      filter: (e) => !e.target.closest('.ncard, .lock-btn, .lock-lost, .lock-notifs .scrolling'),
      start: (e, p) => p.dy < 0,
      move: (e, p) => {
        const y = Math.min(0, p.dy);
        content.style.transform = `translateY(${y * 0.6}px)`;
        content.style.opacity = String(1 + y / 900);
      },
      end: (e, p) => {
        content.style.transform = '';
        content.style.opacity = '';
        if (p.dy < -90 || p.vy < -0.5) tryUnlock();
      },
    });
    JC.bus.on('notifs', () => renderLockNotifs());
    JC.bus.on('minute', () => { renderLockClock(); renderLockWidgets(); });
    renderLockClock();
    renderLockWidgets();
  }

  function renderLockClock() {
    const d = JC.time.date();
    els.lockTime.textContent = U.fmtClock(d);
    els.lockDate.textContent = U.fmtDate(d, 'long');
    if (els.ncTime) { els.ncTime.textContent = U.fmtClock(d); els.ncDate.textContent = U.fmtDate(d, 'long'); }
  }

  function upcomingLabel() {
    const evs = (JC.store.hasSeed('events') ? JC.store.all('events') : []).filter((e) => e.start >= JC.time.now() - 3600e3).sort((a, b) => a.start - b.start);
    const bday = evs.find((e) => /A-Ling/.test(e.title));
    if (bday) return { title: bday.title, when: U.fmtDate(bday.start, 'day').slice(0, 3) };
    if (evs[0]) return { title: evs[0].title, when: U.fmtTime(evs[0].start) };
    return { title: 'A-Ling turns 18 🎂', when: 'Sun' };
  }

  function wxGlyph(wx) {
    if (/rain|shower|drizzle/.test(wx.cond)) return 'cloud.rain.fill';
    if (wx.cond === 'clear' || (wx.night && wx.cond === 'sunny')) return 'moon.fill';
    if (wx.cond === 'sunny') return 'sun.max.fill';
    return 'cloud.fill';
  }
  JC.icon.add({ 'cloud.rain.fill': '<path d="M7 14.5a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 14.5z" fill="currentColor" stroke="none"/><path d="M8 17.5l-1 2.5M12 17.5l-1 2.5M16 17.5l-1 2.5" stroke-width="1.8"/>' });
  function renderLockWidgets() {
    const W = els.lockWidgets;
    W.innerHTML = '';
    const wx = JC.weather ? JC.weather.now('lanling') : { temp: 14, cond: 'rain', night: true };
    const up = upcomingLabel();
    W.append(
      h('div.lw.lw-rect', { onTap: () => unlockThen(() => os.open('calendar')) }, h('div.lw-k', JC.icon('calendar', { size: 13 }), ' ', up.when), h('div.lw-v', up.title)),
      h('div.lw.lw-circ', { onTap: () => unlockThen(() => os.open('weather')) }, JC.icon(wxGlyph(wx), { size: 15 }), h('div.lw-temp', wx.temp + '°')),
      h('div.lw.lw-circ', { onTap: () => unlockThen(() => os.open('settings', { page: 'battery' })) }, h('div.lw-ring', { style: { '--p': S().battery } }), h('div.lw-temp', S().battery + '%')));
  }

  function groupKey(n) { return n.thread ? 't:' + n.thread : 'a:' + n.app; }
  const expandedGroups = {};
  function renderNotifList(container, opts) {
    container.innerHTML = '';
    const list = JC.notify.list();
    if (!list.length) {
      if (opts.empty) container.appendChild(h('div.no-notifs', opts.empty));
      return;
    }
    const groups = [];
    const map = {};
    list.forEach((n) => {
      const k = groupKey(n);
      if (!map[k]) { map[k] = []; groups.push(k); }
      map[k].push(n);
    });
    if (opts.header) container.appendChild(h('div.nc-header', h('span', opts.header), h('span.nc-clear', { onTap: () => { JC.notify.clear(); } }, JC.icon('xmark', { size: 12, weight: 3 }))));
    groups.forEach((k) => {
      const items = map[k];
      const open = expandedGroups[k] || items.length === 1;
      const g = h('div.ngroup', { class: { stacked: !open, open: open && items.length > 1 } });
      if (open && items.length > 1) {
        g.appendChild(h('div.ngroup-head', h('span', JC.notify.appName(items[0].app) + (items[0].thread ? ' · ' + (items[0].title || '') : '')), h('span.ngroup-less', { onTap: () => { expandedGroups[k] = false; renderAll(); } }, 'Show less')));
      }
      (open ? items : items.slice(0, 1)).forEach((n, i) => {
        g.appendChild(JC.notify.card(n, {
          onTap: () => {
            if (!open) { expandedGroups[k] = true; renderAll(); return; }
            opts.onOpen(n);
          },
        }));
      });
      if (!open) {
        if (items.length > 1) g.appendChild(h('div.nstack', { onTap: () => { expandedGroups[k] = true; renderAll(); } }, h('div.nstack-1'), items.length > 2 ? h('div.nstack-2') : null));
        if (items.length > 1) g.appendChild(h('div.nmore', { onTap: () => { expandedGroups[k] = true; renderAll(); } }, (items.length - 1) + ' more notification' + (items.length > 2 ? 's' : '')));
      }
      container.appendChild(g);
    });
  }
  function renderAll() { renderLockNotifs(); if (els.ncList) renderNCList(); }
  function lockNowPlaying() {
    const np = JC.music && JC.music.nowPlaying ? JC.music.nowPlaying() : null;
    if (!np) return null;
    const pct = np.dur ? Math.min(100, (np.pos / np.dur) * 100) : 0;
    return h('div.lock-np', { onTap: () => unlockThen(() => os.open('music')) },
      h('div.lnp-top', JC.art.el(np.art, { cls: 'lnp-art' }), h('div.lnp-meta', h('div.lnp-title', np.title), h('div.lnp-artist', np.artist)), h('div.lnp-wave', { class: { on: !!np.playing } }, h('i'), h('i'), h('i'), h('i'))),
      h('div.lnp-bar', h('div.lnp-fill', { style: { width: pct + '%' } })),
      h('div.lnp-ctrls',
        h('div.lnp-btn', { onTap: (e) => { e.stopPropagation(); JC.music.prev && JC.music.prev(); } }, JC.icon('backward.fill', { size: 24 })),
        h('div.lnp-btn', { onTap: (e) => { e.stopPropagation(); JC.music.toggle && JC.music.toggle(); } }, JC.icon(np.playing ? 'pause.fill' : 'play.fill', { size: 30 })),
        h('div.lnp-btn', { onTap: (e) => { e.stopPropagation(); JC.music.next && JC.music.next(); } }, JC.icon('forward.fill', { size: 24 }))));
  }
  function renderLockNotifs() {
    if (!els.lockNotifs) return;
    renderNotifList(els.lockNotifs, {
      onOpen: (n) => unlockThen(() => JC.notify.open(n)),
    });
    const np = lockNowPlaying();
    if (np) els.lockNotifs.prepend(np);
    els.lockNotifs.classList.toggle('empty', !JC.notify.list().length && !np);
  }
  JC.bus.on('music', U.throttle(() => { if (os.locked) renderLockNotifs(); }, 400));

  // Lost mode panel (finale)
  os.lostMode = (o) => {
    S().lost = o || null;
    JC.state.save();
    renderLost();
    JC.bus.emit('lostmode', S().lost);
  };
  function renderLost() {
    const L = els.lockLost;
    const lost = S().lost;
    L.hidden = !lost;
    L.innerHTML = '';
    if (!lost) return;
    L.append(
      h('div.lost-title', 'This iPhone has been lost.'),
      h('div.lost-msg', lost.message || ''),
      h('div.lost-btn', { onTap: () => JC.story.dial(lost.contact || 'hq') }, JC.icon('phone.fill', { size: 16 }), h('span', 'Call ' + (lost.phone || 'Owner'))));
    els.lock.classList.add('lost');
  }

  // Passcode
  let pcEntry = '';
  let pcLockedUntil = 0;
  function buildPasscode() {
    els.passBg = h('div.pc-bg');
    const dots = h('div.pc-dots', [0, 1, 2, 3, 4, 5].map(() => h('div.pc-dot')));
    const title = h('div.pc-title', 'Enter Passcode');
    const hint = h('div.pc-hint');
    const keys = h('div.pc-keys');
    const L = { 1: '', 2: 'A B C', 3: 'D E F', 4: 'G H I', 5: 'J K L', 6: 'M N O', 7: 'P Q R S', 8: 'T U V', 9: 'W X Y Z', 0: '' };
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((n) => keys.appendChild(pcKey(n, L[n])));
    keys.appendChild(h('div.pc-key.ghost'));
    keys.appendChild(pcKey(0, ''));
    keys.appendChild(h('div.pc-key.ghost'));
    const emergency = h('div.pc-text.left', { onTap: () => openEmergency() }, 'Emergency');
    const cancel = h('div.pc-text.right', { onTap: () => { if (pcEntry.length) { pcEntry = pcEntry.slice(0, -1); paintDots(); } else hidePasscode(); } }, 'Cancel');
    const unavailable = h('div.pc-unavail', { hidden: true });
    const pc = h('div.passcode', { hidden: true }, els.passBg, h('div.pc-inner', h('div.pc-lockglyph', JC.icon('lock.fill', { size: 20 })), title, dots, hint, keys, h('div.pc-bottom', emergency, cancel)), unavailable);
    els.lock.appendChild(pc);
    els.pc = pc;
    els.pcDots = dots;
    els.pcTitle = title;
    els.pcHint = hint;
    els.pcCancel = cancel;
    els.pcUnavail = unavailable;
    function pcKey(n, letters) {
      return h('div.pc-key', { onTap: () => pcPress(String(n)) }, h('div.pc-num', String(n)), letters ? h('div.pc-letters', letters) : null);
    }
    window.addEventListener('keydown', (e) => {
      if (els.pc.hidden || pcLockedUntil > Date.now()) return;
      if (/^[0-9]$/.test(e.key)) pcPress(e.key);
      else if (e.key === 'Backspace') { pcEntry = pcEntry.slice(0, -1); paintDots(); }
    });
  }
  function paintDots() {
    Array.from(els.pcDots.children).forEach((d, i) => d.classList.toggle('on', i < pcEntry.length));
    els.pcCancel.textContent = pcEntry.length ? 'Delete' : 'Cancel';
  }
  function pcPress(n) {
    if (pcLockedUntil > Date.now()) return;
    if (pcEntry.length >= 6) return;
    JC.audio.play('key');
    pcEntry += n;
    paintDots();
    if (pcEntry.length === 6) setTimeout(checkPass, 120);
  }
  function checkPass() {
    const ok = pcEntry === (S().settings.passcode || '181008');
    if (ok) {
      pcEntry = '';
      paintDots();
      unlock(true);
      return;
    }
    S().passTries = (S().passTries || 0) + 1;
    JC.state.save();
    const tries = S().passTries;
    JC.audio.play('error');
    JC.audio.haptic([30, 40, 30]);
    U.anim(els.pcDots, [{ transform: 'translateX(0)' }, { transform: 'translateX(-14px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 420, easing: 'ease-out' });
    setTimeout(() => { pcEntry = ''; paintDots(); }, 380);
    JC.bus.emit('passcode:wrong', tries);
    if (tries === 2 && !S().unlocked && JC.story && JC.story.incoming) {
      setTimeout(() => JC.story.incoming('jl', { text: "also i'm literally an adult on sunday so stop calling me a child" }), 1600);
    }
    if (tries === 5 || tries === 9) {
      pcLockedUntil = Date.now() + 30000;
      showUnavailable();
    }
    if (tries >= 3 && !S().unlocked) {
      const hints = [
        '',
        '',
        '',
        'Jiang Cheng’s nephew seemed very sure about this passcode.',
        'A birthday, written DDMMYY. Whose birthday is on the lock screen?',
        'A-Ling turns 18 on Sunday, October 18. Born 2008.',
        'A-Ling turns 18 on Sunday, October 18. Born 2008.',
        'Try 18 · 10 · 08.',
      ];
      els.pcHint.textContent = hints[Math.min(tries, hints.length - 1)] || 'Try 18 · 10 · 08.';
    }
  }
  function showUnavailable() {
    const u = els.pcUnavail;
    u.hidden = false;
    const tick = () => {
      const left = Math.ceil((pcLockedUntil - Date.now()) / 1000);
      if (left <= 0) { u.hidden = true; return; }
      u.innerHTML = '';
      u.append(h('div.pcu-title', 'iPhone Unavailable'), h('div.pcu-sub', 'try again in ' + left + ' second' + (left === 1 ? '' : 's')),
        h('div.pcu-hint', 'You look at the lock screen again. A-Ling’s texts. A birthday on Sunday. DDMMYY.'),
        h('div.pcu-btn', { onTap: () => openEmergency() }, 'Emergency'));
      setTimeout(tick, 500);
    };
    tick();
  }
  function showPasscode() {
    els.pc.hidden = false;
    pcEntry = '';
    paintDots();
    els.pcTitle.textContent = S().unlocked ? 'Enter Passcode' : 'Enter Passcode';
    U.anim(els.pc, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    if (pcLockedUntil > Date.now()) showUnavailable();
  }
  function hidePasscode() {
    U.anim(els.pc, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => { els.pc.hidden = true; });
    pendingAfterUnlock = null;
  }

  function tryUnlock() {
    if (S().unlocked && S().settings.faceAlt) {
      faceIdAnim(true).then(() => unlock(false));
      return;
    }
    faceIdAnim(false).then(() => showPasscode());
  }
  function unlockThen(fn) {
    if (!os.locked) { fn(); return; }
    pendingAfterUnlock = fn;
    tryUnlock();
  }
  os.unlockThen = unlockThen;

  function unlock(viaPasscode) {
    const first = !S().unlocked;
    os.locked = false;
    S().unlocked = true;
    JC.state.save();
    JC.audio.play('unlock');
    els.lockGlyph.innerHTML = '';
    els.lockGlyph.appendChild(JC.icon('lock.open.fill', { size: 22 }));
    const L = els.lock;
    L.classList.add('leaving');
    U.anim(L, [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 1 }], { duration: 480 }).then(() => {
      L.classList.add('gone');
      L.classList.remove('leaving');
      L.getAnimations().forEach((a) => a.cancel());
      els.pc.hidden = true;
      updateStatus();
      els.lockGlyph.innerHTML = '';
      els.lockGlyph.appendChild(JC.icon('lock.fill', { size: 22 }));
    });
    U.anim(els.home, [{ transform: 'scale(1.12)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 520, fill: 'none' });
    JC.bus.emit('unlock', { first });
    if (JC.story) JC.story.act('unlock', { first });
    const after = pendingAfterUnlock;
    pendingAfterUnlock = null;
    if (after) setTimeout(after, 300);
    if (first) setTimeout(() => JC.ui.toast('Tip: swipe up from the bottom bar (or tap it) to go home', { icon: 'iphone', ms: 4200 }), 700);
    if (first && viaPasscode) {
      setTimeout(() => {
        JC.ui.alert({
          icon: faceGlyphDark(),
          title: 'Set Up an Alternate Appearance?',
          message: 'Face ID doesn’t recognize you. Add your face so you can unlock this iPhone without the passcode.',
          buttons: [{ text: 'Not Now', style: 'cancel' }, { text: 'Set Up', style: 'default', onTap: () => { setting('faceAlt', true); JC.ui.toast('Face ID is set up', { icon: 'checkmark.circle.fill' }); JC.story && JC.story.act('setting', { key: 'faceAlt', value: true }); } }],
        });
      }, 1600);
    }
  }
  function faceGlyphDark() {
    const s = document.createElement('span');
    s.innerHTML = '<svg viewBox="0 0 40 40" width="38" height="38" fill="none" stroke="#30d158" stroke-width="2.4" stroke-linecap="round"><path d="M4 12V8a4 4 0 0 1 4-4h4M28 4h4a4 4 0 0 1 4 4v4M36 28v4a4 4 0 0 1-4 4h-4M12 36H8a4 4 0 0 1-4-4v-4M14 15v3M26 15v3M20 15v8h-2M15 28c3 2.5 7 2.5 10 0"/></svg>';
    return s;
  }

  os.lock = (silent) => {
    if (os.locked) return;
    closeCC();
    closeNC();
    closeSwitcher();
    JC.kb.hide();
    os.locked = true;
    if (!silent) JC.audio.play('lock');
    const L = els.lock;
    L.classList.remove('gone');
    els.pc.hidden = true;
    expandedKeys();
    renderLockNotifs();
    renderLockWidgets();
    updateStatus();
    JC.bus.emit('lock');
  };
  function expandedKeys() { Object.keys(expandedGroups).forEach((k) => delete expandedGroups[k]); }

  os.sleep = () => {
    os.lock();
    os.asleep = true;
    els.sleep.classList.add('on');
    updateStatus();
  };
  os.wake = (o) => {
    if (!os.asleep) return;
    os.asleep = false;
    els.sleep.classList.remove('on');
    if (!(o && o.quiet)) U.anim(els.lock, [{ filter: 'brightness(.2)' }, { filter: 'brightness(1)' }], { duration: 500 });
    updateStatus();
  };

  // Emergency + Medical ID
  function openEmergency() {
    const layer = els.lock;
    let num = '';
    const display = h('div.em-num');
    const pad = h('div.em-pad');
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
    keys.forEach(([k, l]) => pad.appendChild(h('div.pc-key', { onTap: () => { num += k; JC.audio.dtmf(k); display.textContent = num; } }, h('div.pc-num', k), l ? h('div.pc-letters', l) : null)));
    const call = h('div.em-call', { onTap: () => {
      if (!num) return;
      if (['110', '120', '119', '112', '911', '999'].includes(num)) {
        JC.ui.alert({ title: 'Emergency SOS', message: 'This is a story phone. No real call will be placed.\n\nIf you are in danger in real life, call your local emergency number from your own phone.', buttons: [{ text: 'OK' }] });
      } else JC.ui.alert({ title: 'Emergency Calls Only', message: 'Unlock iPhone to call ' + num + '.', buttons: [{ text: 'OK' }] });
    } }, JC.icon('phone.fill', { size: 30 }));
    const el = h('div.emergency',
      h('div.em-top', h('div.em-label', 'Emergency call'), display),
      pad,
      h('div.em-row', h('div.em-side', { onTap: () => openMedicalID(el) }, 'Medical ID'), call, h('div.em-side', { onTap: () => { num = num.slice(0, -1); display.textContent = num; } }, 'Delete')),
      h('div.em-cancel', { onTap: () => U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => el.remove()) }, 'Cancel'));
    layer.appendChild(el);
    U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
  }
  function openMedicalID(parent) {
    const jl = JC.contacts.get('jl');
    const aj = JC.contacts.get('ajie');
    const row = (k, v) => h('div.mid-row', h('div.mid-k', k), h('div.mid-v', v));
    const el = h('div.medid.scroll',
      h('div.mid-head', h('div.mid-star', JC.icon('staroflife.fill', { size: 20 })), h('div.mid-h', 'Medical ID'), h('div.mid-done', { onTap: () => U.anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 300 }).then(() => el.remove()) }, 'Done')),
      h('div.mid-person', JC.ui.avatar('me', 64), h('div', h('div.mid-name', 'Jiang Cheng'), h('div.mid-age', '15 May 1992 (34 years)'))),
      h('div.mid-card',
        row('Medical Conditions', 'Liver transplant recipient (2008).'),
        row('Medical Notes', 'Immunosuppressed. Do not give him alcohol. (He will not listen.) — A-Ling'),
        row('Allergies & Reactions', 'None. (Wei Wuxian. — A-Ling)'),
        row('Medications', 'Tacrolimus 2 mg, twice daily.'),
        row('Blood Type', 'O+'),
        row('Organ Donor', 'Yes'),
        row('Height', '183 cm'),
        row('Weight', '72 kg')),
      h('div.mid-sec', 'Emergency Contacts'),
      h('div.mid-card',
        h('div.mid-contact', { onTap: () => { el.remove(); parent.remove(); JC.story.dial('ajie', { emergency: true }); } }, h('div.mid-c-rel', 'sister'), h('div.mid-c-name', aj ? aj.display : 'A-Jie'), h('div.mid-c-num', aj ? aj.phones[0].num : ''), JC.icon('phone.fill', { size: 18, cls: 'mid-c-ic' })),
        h('div.mid-contact', { onTap: () => { el.remove(); parent.remove(); JC.story.dial('jl', { emergency: true }); } }, h('div.mid-c-rel', 'nephew'), h('div.mid-c-name', jl ? jl.display : 'A-Ling'), h('div.mid-c-num', jl ? jl.phones[0].num : ''), JC.icon('phone.fill', { size: 18, cls: 'mid-c-ic' }))),
      h('div.mid-foot', 'Medical ID is visible while iPhone is locked.'));
    els.lock.appendChild(el);
    U.anim(el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 420 });
  }

  // ── Notification Center ─────────────────────────────────────────
  function openNC() {
    if (os.locked || els.cc.classList.contains('open')) return;
    if (els.nc && els.nc.parentNode) return;
    JC.kb.hide();
    els.ncTime = h('div.lock-time.nc-time');
    els.ncDate = h('div.lock-date');
    els.ncList = h('div.lock-notifs.scroll');
    const nc = h('div.nc', h('div.nc-bg'), h('div.nc-top', els.ncDate, els.ncTime), els.ncList, h('div.nc-handle'));
    els.nc = nc;
    els.lock.parentNode.insertBefore(nc, els.cc);
    renderLockClock();
    renderNCList();
    U.anim(nc, [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: 420 });
    U.drag(nc, {
      axis: 'y',
      filter: (e) => !e.target.closest('.ncard'),
      move: (e, p) => { if (p.dy < 0) nc.style.transform = `translateY(${p.dy}px)`; },
      end: (e, p) => { if (p.dy < -80 || p.vy < -0.4) closeNC(); else nc.style.transform = ''; },
    });
    updateStatus();
  }
  function renderNCList() {
    if (!els.ncList) return;
    renderNotifList(els.ncList, { header: 'Notification Center', empty: 'No Older Notifications', onOpen: (n) => { closeNC(); JC.notify.open(n); } });
  }
  function closeNC() {
    const nc = els.nc;
    if (!nc || !nc.parentNode) return;
    els.nc = null;
    els.ncList = null;
    U.anim(nc, [{ transform: nc.style.transform || 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 360 }).then(() => nc.remove());
  }
  os.openNC = openNC;
  os.closeNC = closeNC;

  // ── Control Center ───────────────────────────────────────────────
  function buildCC() {
    els.cc.innerHTML = '';
    els.cc.append(h('div.cc-bg', { onTap: () => closeCC() }), h('div.cc-grid'));
    U.drag(els.cc, {
      axis: 'y',
      filter: (e) => !e.target.closest('.cc-slider, .cc-tile, .cc-np'),
      move: (e, p) => { if (p.dy < 0) els.cc.querySelector('.cc-grid').style.transform = `translateY(${p.dy * 0.6}px) scale(${1 + p.dy / 3000})`; },
      end: (e, p) => { els.cc.querySelector('.cc-grid').style.transform = ''; if (p.dy < -60 || p.vy < -0.4) closeCC(); },
    });
    JC.bus.on('setting', () => { if (els.cc.classList.contains('open')) renderCC(); });
  }
  function ccTile(o) {
    return h('div.cc-tile', {
      class: [o.cls, o.on ? 'on' : '', o.span || ''],
      style: o.color ? { '--on-c': o.color } : null,
      onTap: (e) => { JC.audio.haptic(8); o.onTap && o.onTap(e); },
    }, h('div.cc-ic', JC.icon(o.icon, { size: o.size || 24 })), o.label ? h('div.cc-label', o.label) : null, o.sub ? h('div.cc-sub', o.sub) : null);
  }
  function ccSlider(kind) {
    const val = kind === 'bright' ? (S().settings.brightness == null ? 1 : S().settings.brightness) : (S().settings.volume == null ? 0.6 : S().settings.volume);
    const fill = h('div.ccs-fill', { style: { height: val * 100 + '%' } });
    const ic = h('div.ccs-ic', JC.icon(kind === 'bright' ? 'sun.max.fill' : val === 0 ? 'speaker.slash.fill' : 'speaker.wave.2.fill', { size: 24 }));
    const el = h('div.cc-slider.span-v2', fill, ic);
    el.__tap = true;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const set = (cy) => {
        const v = U.clamp(1 - (cy - r.top) / r.height, 0, 1);
        fill.style.height = v * 100 + '%';
        if (kind === 'bright') os.setBrightness(Math.max(0.05, v));
        else { setting('volume', Math.round(v * 16) / 16); JC.audio.applyVolume(); }
      };
      set(e.clientY);
      el.classList.add('active');
      const mv = (ev) => set(ev.clientY);
      const up = () => { el.classList.remove('active'); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
    });
    U.longPress(el, () => { if (kind === 'bright') os.setAppearance(os.dark ? 'light' : 'dark'); });
    return el;
  }
  function renderCC() {
    const g = els.cc.querySelector('.cc-grid');
    if (!g) return;
    const s = S().settings;
    g.innerHTML = '';
    const conn = h('div.cc-conn.span-2x2',
      ccTile({ icon: 'airplane', on: s.airplane, color: '#ff9f0a', cls: 'round', onTap: () => os.setToggle('airplane', !s.airplane) }),
      ccTile({ icon: 'antenna.radiowaves.left.and.right', on: s.cellular && !s.airplane, color: '#30d158', cls: 'round', onTap: () => os.setToggle('cellular', !s.cellular) }),
      ccTile({ icon: 'wifi', on: s.wifi && !s.airplane, color: '#0a84ff', cls: 'round', onTap: () => os.setToggle('wifi', !s.wifi) }),
      ccTile({ icon: 'bluetooth', on: s.bt && !s.airplane, color: '#0a84ff', cls: 'round', onTap: () => os.setToggle('bt', !s.bt) }));
    U.longPress(conn, () => { closeCC(); unlockThen(() => os.open('settings', { page: 'wifi' })); });
    const np = nowPlayingTile();
    const focusLabels = { dnd: 'Do Not Disturb', sleep: 'Sleep', personal: 'Personal', work: 'Work' };
    const focus = h('div.cc-focus.span-2x1', { class: { on: !!s.focus }, onTap: () => {
      JC.ui.menu(focus, [
        { text: 'Do Not Disturb', icon: 'moon.fill', checked: s.focus === 'dnd', onTap: () => os.setToggle('focus', s.focus === 'dnd' ? null : 'dnd') },
        { text: 'Sleep', icon: 'bed.double.fill', checked: s.focus === 'sleep', onTap: () => os.setToggle('focus', s.focus === 'sleep' ? null : 'sleep') },
        { text: 'Personal', icon: 'person.fill', checked: s.focus === 'personal', onTap: () => os.setToggle('focus', s.focus === 'personal' ? null : 'personal') },
        { text: 'Work', icon: 'briefcase.fill', checked: s.focus === 'work', onTap: () => os.setToggle('focus', s.focus === 'work' ? null : 'work') },
      ], { system: true });
    } }, h('div.ccf-ic', JC.icon(s.focus === 'sleep' ? 'bed.double.fill' : s.focus === 'work' ? 'briefcase.fill' : s.focus === 'personal' ? 'person.fill' : 'moon.fill', { size: 20 })), h('div.ccf-t', s.focus ? focusLabels[s.focus] : 'Focus'), s.focus ? h('div.ccf-s', 'On') : null);
    g.append(conn, np, focus, ccSlider('bright'), ccSlider('vol'),
      ccTile({ icon: 'lock.rotation', on: s.rotationLock, color: '#ff453a', onTap: () => os.setToggle('rotationLock', !s.rotationLock) }),
      ccTile({ icon: 'rectangle.on.rectangle', onTap: () => JC.ui.alert({ title: 'Screen Mirroring', message: 'Looking for Apple TV and AirPlay-compatible TVs…\n\nNo devices found. (The taxi does not have a TV.)', buttons: [{ text: 'OK' }] }) }),
      ccTile({ icon: s.flashlight ? 'flashlight.on.fill' : 'flashlight.off.fill', on: s.flashlight, color: '#fff', cls: 'white-on', onTap: () => os.setToggle('flashlight', !s.flashlight) }),
      ccTile({ icon: 'timer', onTap: () => { closeCC(); unlockThen(() => os.open('clock', { tab: 'timer' })); } }),
      ccTile({ icon: 'calculator', onTap: () => { closeCC(); unlockThen(() => os.open('calculator')); } }),
      ccTile({ icon: 'camera.fill', onTap: () => { closeCC(); unlockThen(() => os.open('camera')); } }),
      ccTile({ icon: s.silent ? 'bell.slash.fill' : 'bell.fill', on: s.silent, color: '#ff453a', onTap: () => os.setToggle('silent', !s.silent) }),
      ccTile({ icon: 'moon', on: os.dark, color: '#fff', cls: 'white-on', onTap: () => os.setAppearance(os.dark ? 'light' : 'dark') }),
      ccTile({ icon: 'battery.25', on: s.lowPower, color: '#ffd60a', onTap: () => os.setToggle('lowPower', !s.lowPower) }),
      ccTile({ icon: 'lock.fill', onTap: () => { closeCC(); setTimeout(() => os.sleep(), 250); } }));
  }
  function nowPlayingTile() {
    const np = JC.music && JC.music.nowPlaying ? JC.music.nowPlaying() : null;
    const el = h('div.cc-np.span-2x2');
    if (np) {
      el.append(
        h('div.np-top', JC.art.el(np.art, { cls: 'np-art' }), h('div.np-meta', h('div.np-title', np.title), h('div.np-artist', np.artist))),
        h('div.np-ctrls',
          h('div.np-btn', { onTap: () => JC.music.prev && JC.music.prev() }, JC.icon('backward.fill', { size: 20 })),
          h('div.np-btn', { onTap: () => { JC.music.toggle && JC.music.toggle(); setTimeout(renderCC, 50); } }, JC.icon(np.playing ? 'pause.fill' : 'play.fill', { size: 26 })),
          h('div.np-btn', { onTap: () => JC.music.next && JC.music.next() }, JC.icon('forward.fill', { size: 20 }))));
    } else {
      el.append(h('div.np-top', h('div.np-art.empty', JC.icon('music.note', { size: 20 })), h('div.np-meta', h('div.np-title', 'Not Playing'))),
        h('div.np-ctrls',
          h('div.np-btn.dim', { onTap: () => { closeCC(); unlockThen(() => os.open('music')); } }, JC.icon('backward.fill', { size: 20 })),
          h('div.np-btn', { onTap: () => { if (JC.music && JC.music.toggle) { JC.music.toggle(); setTimeout(renderCC, 80); } else { closeCC(); unlockThen(() => os.open('music')); } } }, JC.icon('play.fill', { size: 26 })),
          h('div.np-btn.dim', { onTap: () => { closeCC(); unlockThen(() => os.open('music')); } }, JC.icon('forward.fill', { size: 20 }))));
    }
    U.longPress(el, () => { closeCC(); unlockThen(() => os.open('music')); });
    return el;
  }
  function openCC() {
    if (els.cc.classList.contains('open')) return;
    JC.kb.hide();
    closeNC();
    renderCC();
    els.cc.classList.add('open');
    U.anim(els.cc.querySelector('.cc-grid'), [{ transform: 'translateY(-40px) scale(.9)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: 380, easing: U.SPRING, fill: 'none' });
    U.anim(els.cc.querySelector('.cc-bg'), [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    updateStatus();
  }
  function closeCC() {
    if (!els.cc.classList.contains('open')) return;
    U.anim(els.cc.querySelector('.cc-grid'), [{ opacity: 1 }, { transform: 'translateY(-30px) scale(.92)', opacity: 0 }], { duration: 240 });
    U.anim(els.cc.querySelector('.cc-bg'), [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).then(() => { els.cc.classList.remove('open'); updateStatus(); });
  }
  os.openCC = openCC;
  os.closeCC = closeCC;
  JC.bus.on('music', () => { if (els.cc && els.cc.classList.contains('open')) renderCC(); });

  // ── Home screen ──────────────────────────────────────────────────
  function home() {
    if (!S().home) S().home = JSON.parse(JSON.stringify(DEFAULT_HOME));
    return S().home;
  }
  os.homeLayout = home;
  os.resetHome = () => { S().home = JSON.parse(JSON.stringify(DEFAULT_HOME)); JC.state.save(); renderHome(); };

  function buildHome() {
    const H = els.home;
    H.innerHTML = '';
    els.pages = h('div.home-pages');
    els.dots = h('div.home-dots');
    els.searchPill = h('div.home-search', { onTap: () => openSpotlight() }, JC.icon('magnifyingglass', { size: 13, weight: 2.4 }), h('span', 'Search'));
    els.dock = h('div.dock');
    els.jiggleBar = h('div.jiggle-bar',
      h('div.jb-btn', { onTap: () => widgetGallery() }, JC.icon('plus', { size: 16, weight: 2.6 })),
      h('div.jb-btn.text', { onTap: () => setJiggle(false) }, 'Done'));
    H.append(els.pages, els.searchPill, els.dots, els.dock, els.jiggleBar);
    renderHome();
    // page swipe
    U.drag(H, {
      axis: 'x',
      filter: (e) => !jiggleDragging && !e.target.closest('.dock, .folder-open, .spotlight, .lib-search, .widget.interactive'),
      move: (e, p) => {
        const n = pageCount();
        let x = -homePage * 402 + p.dx;
        if (x > 0) x = x / 4;
        if (x < -(n - 1) * 402) x = -(n - 1) * 402 + (x + (n - 1) * 402) / 4;
        els.pages.style.transition = 'none';
        els.pages.style.transform = `translateX(${x}px)`;
        H.classList.add('paging');
      },
      end: (e, p) => {
        H.classList.remove('paging');
        let np = homePage;
        if (p.dx < -60 || p.vx < -0.4) np++;
        else if (p.dx > 60 || p.vx > 0.4) np--;
        goPage(U.clamp(np, 0, pageCount() - 1));
      },
    });
    // pull down for spotlight
    U.drag(H, {
      axis: 'y',
      filter: (e) => !jiggle && homePage < pageCount() - 1 && !e.target.closest('.dock, .folder-open, .spotlight'),
      end: (e, p) => { if (p.dy > 50) openSpotlight(); },
    });
    JC.bus.on('badge', () => paintBadges());
    JC.bus.on('minute', () => { H.querySelectorAll('.live-icon').forEach((i) => i.__redraw && i.__redraw()); refreshWidgets(); });
    setInterval(() => { const c = H.querySelector('.appicon[data-app="clock"].live-icon'); if (c && !H.classList.contains('hidden-home') && c.__redraw) c.__redraw(); }, 1000);
  }
  function pageCount() { return home().pages.length + 1; } // + App Library
  function goPage(n) {
    homePage = n;
    els.pages.style.transition = 'transform .45s cubic-bezier(.32,.72,0,1)';
    els.pages.style.transform = `translateX(${-n * 402}px)`;
    paintDots();
    els.home.classList.toggle('on-library', n === pageCount() - 1);
  }
  function paintDots() {
    els.dots.innerHTML = '';
    for (let i = 0; i < pageCount(); i++) els.dots.appendChild(h('div.hd', { class: { on: i === homePage, lib: i === pageCount() - 1 }, onTap: () => goPage(i) }));
  }

  function appTile(id, opts) {
    opts = opts || {};
    const name = (apps[id] && apps[id].name) || APP_NAMES[id] || id;
    const icon = JC.appIcon(id);
    const el = h('div.app', { data: { app: id } }, h('div.app-icon-wrap', icon, h('div.app-badge', { hidden: true }), h('div.app-minus', { onTap: (e) => { e.stopPropagation(); removeApp(id); } }, JC.icon('minus', { size: 12, weight: 3.2 }))), opts.noLabel ? null : h('div.app-label', name));
    JC.ui.onTap(el, (e) => {
      if (jiggle) return;
      openFromIcon(id, icon);
    });
    U.longPress(el, (e) => {
      if (jiggle) return;
      iconMenu(el, id);
    }, 520);
    if (!opts.noDrag) jiggleDrag(el);
    return el;
  }
  function openFromIcon(id, iconEl) {
    const r = JC.ui.toLocal(iconEl.getBoundingClientRect());
    os.open(id, null, r);
  }

  function quickActions(id) {
    const qa = {
      messages: [{ text: 'New Message', icon: 'square.and.pencil', intent: { compose: {} } }, { text: 'A-Ling', icon: 'person.crop.circle', intent: { thread: 'jl' } }, { text: '🐶 DO NOT ANSWER', icon: 'person.crop.circle', intent: { thread: 'wwx' } }],
      camera: [{ text: 'Take Selfie', icon: 'camera.rotate', intent: { selfie: true } }, { text: 'Take Photo', icon: 'camera', intent: {} }],
      phone: [{ text: 'Voicemail', icon: 'recordingtape', intent: { tab: 'voicemail' } }, { text: 'Recents', icon: 'clock', intent: { tab: 'recents' } }],
      notes: [{ text: 'New Note', icon: 'square.and.pencil', intent: { compose: true } }],
      clock: [{ text: 'Create Alarm', icon: 'alarm.fill', intent: { tab: 'alarm', create: true } }, { text: 'Start Timer', icon: 'timer', intent: { tab: 'timer' } }],
      maps: [{ text: 'Directions Home', icon: 'house.fill', intent: { directions: 'lp-residence' } }, { text: 'Share My Location', icon: 'location.fill', intent: { share: true } }],
      safari: [{ text: 'New Tab', icon: 'plus', intent: { newTab: true } }],
      music: [{ text: 'Search', icon: 'magnifyingglass', intent: { tab: 'search' } }],
      mail: [{ text: 'New Message', icon: 'square.and.pencil', intent: { compose: {} } }],
      photos: [{ text: 'Most Recent', icon: 'photo', intent: {} }, { text: 'Favorites', icon: 'heart', intent: { album: 'favorites' } }],
    };
    return qa[id] || [];
  }
  function iconMenu(el, id) {
    const items = quickActions(id).map((q) => ({ text: q.text, icon: q.icon, onTap: () => os.open(id, q.intent) }));
    if (items.length) items.push('-');
    items.push({ text: 'Edit Home Screen', icon: 'apps.iphone', onTap: () => setJiggle(true) });
    items.push({ text: 'Share App', icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: (apps[id] && apps[id].name) || APP_NAMES[id], subtitle: 'App', icon: 'square.grid.2x2', payload: { kind: 'text', text: 'Check out ' + ((apps[id] && apps[id].name) || APP_NAMES[id]) } }) });
    items.push({ text: 'Remove App', icon: 'minus.circle.fill', destructive: true, onTap: () => removeApp(id) });
    JC.ui.contextMenu.show ? JC.ui.contextMenu.show(el, items) : showCtx(el, items);
  }
  JC.icon.add({ 'apps.iphone': '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><rect x="8.8" y="6" width="2.6" height="2.6" rx=".6"/><rect x="12.6" y="6" width="2.6" height="2.6" rx=".6"/><rect x="8.8" y="10" width="2.6" height="2.6" rx=".6"/><rect x="12.6" y="10" width="2.6" height="2.6" rx=".6"/>' });
  function showCtx(el, items) {
    // reuse the kit's context menu presentation without a long-press binding
    const layer = JC.ui.layer(true);
    const back = h('div.ctx-back');
    layer.appendChild(back);
    const r = JC.ui.toLocal(el.getBoundingClientRect());
    const prev = el.cloneNode(true);
    prev.classList.add('ctx-preview', 'app-prev');
    prev.style.left = r.x + 'px';
    prev.style.top = r.y + 'px';
    prev.style.width = r.w + 'px';
    layer.appendChild(prev);
    const menu = h('div.pmenu.ctx-menu');
    let group = h('div.pmenu-group');
    menu.appendChild(group);
    items.forEach((it) => {
      if (it === '-') { group = h('div.pmenu-group'); menu.appendChild(group); return; }
      group.appendChild(h('div.pmenu-item', { class: { destructive: !!it.destructive }, onTap: () => { close(); setTimeout(() => it.onTap(), 160); } }, h('span.pmenu-text', it.text), JC.icon(it.icon, { size: 19 })));
    });
    layer.appendChild(menu);
    const mh = menu.offsetHeight;
    let top = r.y + r.h + 10;
    if (top + mh > os.H - 30) top = r.y - mh - 10;
    menu.style.top = top + 'px';
    menu.style.left = U.clamp(r.x, 12, 402 - 250 - 12) + 'px';
    U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    U.anim(menu, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: U.SPRING });
    U.anim(prev, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1.04)' }], { duration: 300 });
    function close() {
      U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => back.remove());
      prev.remove();
      U.anim(menu, [{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).then(() => menu.remove());
    }
    JC.ui.onTap(back, close);
  }

  function removeApp(id) {
    JC.ui.alert({
      title: 'Remove “' + ((apps[id] && apps[id].name) || APP_NAMES[id]) + '”?',
      message: 'Removing from Home Screen will keep the app in your App Library.',
      buttons: [
        { text: 'Delete App', style: 'destructive', onTap: () => setTimeout(() => JC.ui.alert({ title: 'Can’t Delete App', message: 'This iPhone is managed by Yunmeng Jiang Group. Contact your IT department. (Tang Mei.)', buttons: [{ text: 'OK' }] }), 300) },
        { text: 'Remove from Home Screen', onTap: () => {
          const hm = home();
          hm.pages.forEach((pg) => {
            const i = pg.indexOf(id);
            if (i >= 0) pg.splice(i, 1);
            pg.forEach((it) => { if (it && it.folder) { const j = it.apps.indexOf(id); if (j >= 0) it.apps.splice(j, 1); } });
          });
          const di = hm.dock.indexOf(id);
          if (di >= 0) hm.dock.splice(di, 1);
          JC.state.save();
          renderHome();
        } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  let jiggleDragging = false;
  function jiggleDrag(el) {
    U.drag(el, {
      filter: () => jiggle,
      threshold: 4,
      start: () => { jiggleDragging = true; el.classList.add('dragging'); },
      move: (e, p) => { el.style.transform = `translate(${p.dx}px, ${p.dy}px) scale(1.15)`; },
      end: (e, p) => {
        jiggleDragging = false;
        el.classList.remove('dragging');
        el.style.transform = '';
        el.style.visibility = 'hidden';
        const target = document.elementFromPoint(p.x, p.y);
        el.style.visibility = '';
        const tEl = target && target.closest('.app, .widget, .folder');
        if (!tEl || tEl === el) return;
        moveItem(el, tEl);
      },
    });
  }
  function itemKey(node) {
    if (node.dataset.app) return node.dataset.app;
    if (node.dataset.widget) return 'w:' + node.dataset.widget;
    if (node.dataset.folder) return 'f:' + node.dataset.folder;
    return null;
  }
  function findItem(key) {
    const hm = home();
    const lists = hm.pages.concat([hm.dock]);
    for (const L of lists) {
      for (let i = 0; i < L.length; i++) {
        const it = L[i];
        const k = typeof it === 'string' ? it : it.widget ? 'w:' + it.widget : 'f:' + it.folder;
        if (k === key) return { list: L, i };
      }
    }
    return null;
  }
  function moveItem(fromEl, toEl) {
    const a = findItem(itemKey(fromEl));
    const b = findItem(itemKey(toEl));
    if (!a || !b) return;
    const it = a.list[a.i];
    if (b.list === home().dock && typeof it !== 'string') return;
    if (b.list === home().dock && a.list !== b.list && b.list.length >= 4) {
      // swap with the dock item
      const t = b.list[b.i];
      b.list[b.i] = it;
      a.list[a.i] = t;
    } else {
      a.list.splice(a.i, 1);
      const nb = findItem(itemKey(toEl));
      const idx = nb ? nb.i : b.list.length;
      b.list.splice(idx, 0, it);
    }
    JC.state.save();
    renderHome();
    if (jiggle) setJiggle(true);
  }
  function setJiggle(on) {
    jiggle = on;
    els.home.classList.toggle('jiggle', on);
    if (on) JC.audio.haptic(15);
  }
  os.setJiggle = setJiggle;

  function widgetGallery() {
    const all = [['weather', 'Weather', 'Lanling forecast'], ['calendar', 'Calendar', 'Up Next'], ['memories', 'Photos', 'On This Day'], ['endings', 'Endings', 'Your story so far'], ['battery', 'Batteries', 'Device charge'], ['notes', 'Notes', 'A pinned note']];
    const s = JC.ui.sheet({
      title: 'Widgets', detent: 'large', system: true, left: { text: 'Done' },
      content: () => [h('div.wg-grid', all.map(([id, name, sub]) => h('div.wg-item', { onTap: () => {
        const pg = home().pages[Math.min(homePage, home().pages.length - 1)];
        pg.unshift({ widget: id });
        JC.state.save();
        renderHome();
        setJiggle(true);
        s.close();
      } }, h('div.wg-prev', widgetEl({ widget: id }, true)), h('div.wg-name', name), h('div.wg-sub', sub))))],
    });
  }

  function folderTile(f) {
    const mini = h('div.folder-mini', f.apps.slice(0, 9).map((id) => JC.appIcon(id)));
    const el = h('div.app.folder', { data: { folder: f.folder } }, h('div.app-icon-wrap', h('div.folder-icon', mini)), h('div.app-label', f.folder));
    JC.ui.onTap(el, () => { if (!jiggle) openFolder(f, el); });
    U.longPress(el, () => { if (!jiggle) showCtx(el, [{ text: 'Rename', icon: 'pencil', onTap: () => JC.ui.alert({ title: 'Rename Folder', input: { value: f.folder, placeholder: 'Folder name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default', onTap: (v) => { if (v) { f.folder = v; JC.state.save(); renderHome(); } } }] }) }, { text: 'Edit Home Screen', icon: 'apps.iphone', onTap: () => setJiggle(true) }]); });
    jiggleDrag(el);
    return el;
  }
  function openFolder(f, tile) {
    const ov = h('div.folder-open');
    const grid = h('div.fo-grid', f.apps.map((id) => appTile(id, { noDrag: true })));
    const title = h('div.fo-title', f.folder);
    ov.append(h('div.fo-back', { onTap: () => close() }), title, h('div.fo-panel', grid));
    els.home.appendChild(ov);
    U.anim(ov.querySelector('.fo-panel'), [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380, easing: U.SPRING });
    U.anim(ov.querySelector('.fo-back'), [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    function close() {
      U.anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => ov.remove());
    }
    ov._close = close;
    paintBadges();
  }

  function widgetEl(w, preview) {
    const id = w.widget;
    const el = h('div.widget', { data: { widget: id }, class: 'w-' + id });
    const d = JC.time.date();
    const open = (app, intent) => { if (!jiggle && !preview) os.open(app, intent, JC.ui.toLocal(el.getBoundingClientRect())); };
    if (id === 'weather') {
      const wx = JC.weather ? JC.weather.now('lanling') : { temp: 14, label: 'Rain', cond: 'rain', hi: 17, lo: 11, night: true };
      el.classList.toggle('night', !!wx.night);
      el.append(h('div.ww-city', 'Lanling ', JC.icon('location.fill', { size: 10 })), h('div.ww-temp', wx.temp + '°'), h('div.ww-cond', JC.icon(wxGlyph(wx), { size: 16 }), h('span', wx.label)), h('div.ww-hl', 'H:' + wx.hi + '° L:' + wx.lo + '°'));
      JC.ui.onTap(el, () => open('weather'));
    } else if (id === 'calendar') {
      const evs = (JC.store.hasSeed('events') ? JC.store.all('events') : []).filter((e) => e.end >= JC.time.now() || e.start >= JC.time.now()).sort((a, b) => a.start - b.start).slice(0, 2);
      el.append(h('div.wc-day', U.DAYS[d.getDay()].toUpperCase()), h('div.wc-date', String(d.getDate())));
      const list = h('div.wc-list');
      if (!evs.length) evs.push({ title: 'A-Ling turns 18 🎂', start: JC.time.parse('+2 00:00'), allDay: true, cal: 'birthdays' }, { title: 'Tea? — Hanshi', start: JC.time.parse('+1 15:00'), cal: 'home' });
      evs.forEach((e) => list.appendChild(h('div.wc-ev', { class: 'cal-' + (e.cal || 'home') }, h('div.wc-ev-t', e.title), h('div.wc-ev-w', e.allDay ? U.fmtDate(e.start, 'day') : U.fmtDate(e.start, 'day').slice(0, 3) + ' ' + U.fmtTime(e.start)))));
      el.append(list);
      JC.ui.onTap(el, () => open('calendar'));
    } else if (id === 'memories') {
      const art = JC.art.el('p_family_2007', { cls: 'wm-art' });
      el.append(art, h('div.wm-shade'), h('div.wm-label', h('div.wm-k', 'ON THIS DAY'), h('div.wm-t', 'Lotus Pier, 2007')));
      JC.ui.onTap(el, () => open('photos', { memory: 'lotus-pier-2007' }));
    } else if (id === 'endings') {
      const list = JC.story && JC.story.endings ? JC.story.endings() : [];
      const got = list.filter((e) => e.unlocked).length;
      const total = list.length || 13;
      el.append(h('div.we-top', h('div.we-ic', JC.icon('lotus.fill', { size: 16 })), h('div.we-k', 'ENDINGS')),
        h('div.we-ring', { style: { '--p': Math.round((got / total) * 100) } }, h('div.we-n', String(got)), h('div.we-of', 'of ' + total)),
        h('div.we-sub', got ? 'Latest: ' + (list.filter((e) => e.unlocked).sort((a, b) => b.at - a.at)[0].title) : 'Find out how the night ends.'));
      JC.ui.onTap(el, () => { if (!jiggle && !preview) os.showEndings(); });
    } else if (id === 'battery') {
      el.append(h('div.wb-row', h('div.wb-ring', { style: { '--p': S().battery } }, JC.icon('iphone', { size: 20 })), h('div.wb-pct', S().battery + '%')), h('div.wb-row', h('div.wb-ring.off', JC.icon('airpods', { size: 20 })), h('div.wb-pct.off', '—')));
      JC.ui.onTap(el, () => open('settings', { page: 'battery' }));
    } else if (id === 'notes') {
      const n = (JC.store.hasSeed('notes') ? JC.store.all('notes') : []).find((x) => x.pinned) || { title: 'Things I will not say to Wei Wuxian', body: '' };
      el.append(h('div.wn-k', JC.icon('folder.fill', { size: 12 }), ' Notes'), h('div.wn-t', n.title), h('div.wn-b', (n.body || '').split('\n').slice(0, 3).join('\n')));
      JC.ui.onTap(el, () => open('notes', { note: n.id }));
    }
    if (!preview) {
      el.appendChild(h('div.app-minus', { onTap: (e) => { e.stopPropagation(); home().pages.forEach((pg) => { const i = pg.findIndex((x) => x && x.widget === id); if (i >= 0) pg.splice(i, 1); }); JC.state.save(); renderHome(); setJiggle(true); } }, JC.icon('minus', { size: 12, weight: 3.2 })));
      U.longPress(el, () => { if (!jiggle) showCtx(el, [{ text: 'Edit Widget', icon: 'info.circle', onTap: () => JC.ui.toast('This widget has no options') }, { text: 'Edit Home Screen', icon: 'apps.iphone', onTap: () => setJiggle(true) }, { text: 'Remove Widget', icon: 'minus.circle.fill', destructive: true, onTap: () => { home().pages.forEach((pg) => { const i = pg.findIndex((x) => x && x.widget === id); if (i >= 0) pg.splice(i, 1); }); JC.state.save(); renderHome(); } }]); }, 520);
      jiggleDrag(el);
    }
    return el;
  }
  function refreshWidgets() {
    els.home.querySelectorAll('.home-page .widget').forEach((w) => {
      const n = widgetEl({ widget: w.dataset.widget });
      w.replaceWith(n);
    });
  }
  os.refreshWidgets = refreshWidgets;

  function renderHome() {
    const hm = home();
    els.pages.innerHTML = '';
    hm.pages.forEach((pg) => {
      const page = h('div.home-page');
      pg.forEach((it) => {
        if (!it) return;
        if (typeof it === 'string') { if (apps[it] || APP_NAMES[it]) page.appendChild(appTile(it)); }
        else if (it.widget) page.appendChild(widgetEl(it));
        else if (it.folder) page.appendChild(folderTile(it));
      });
      els.pages.appendChild(page);
    });
    els.pages.appendChild(buildLibrary());
    els.dock.innerHTML = '';
    hm.dock.forEach((id) => els.dock.appendChild(appTile(id)));
    els.pages.style.width = pageCount() * 402 + 'px';
    goPage(Math.min(homePage, pageCount() - 1));
    paintBadges();
  }
  os.renderHome = renderHome;

  function buildLibrary() {
    const lib = h('div.home-page.library');
    const content = h('div.lib-content');
    const search = h('div.lib-search', JC.ui.search({ placeholder: 'App Library', onInput: (q) => filter(q) }));
    const grid = h('div.lib-grid');
    const results = h('div.lib-results', { hidden: true });
    LIBRARY.forEach(([name, ids]) => {
      const big = ids.slice(0, ids.length > 4 ? 3 : 4);
      const small = ids.length > 4 ? ids.slice(3) : [];
      const box = h('div.lib-box', big.map((id) => { const t = appTile(id, { noLabel: true, noDrag: true }); t.classList.add('lib-app'); return t; }));
      if (small.length) {
        const cl = h('div.lib-cluster', { onTap: () => openLibCategory(name, ids) }, small.slice(0, 4).map((id) => JC.appIcon(id)));
        box.appendChild(cl);
      }
      grid.appendChild(h('div.lib-cat', box, h('div.lib-name', name)));
    });
    content.append(search, grid, results);
    lib.appendChild(content);
    function filter(q) {
      q = q.trim().toLowerCase();
      results.hidden = !q;
      grid.hidden = !!q;
      results.innerHTML = '';
      if (!q) return;
      const ids = Object.keys(APP_NAMES).filter((id) => APP_NAMES[id].toLowerCase().includes(q)).sort((a, b) => APP_NAMES[a].localeCompare(APP_NAMES[b]));
      results.appendChild(JC.ui.list([{ rows: ids.map((id) => ({ icon: { app: id }, title: APP_NAMES[id], onTap: () => os.open(id) })) }], { style: 'plain' }));
      if (!ids.length) results.appendChild(h('div.lib-none', 'No Results'));
    }
    return lib;
  }
  function openLibCategory(name, ids) {
    const ov = h('div.folder-open.lib');
    ov.append(h('div.fo-back', { onTap: () => ov.remove() }), h('div.fo-title', name), h('div.fo-panel', h('div.fo-grid', ids.map((id) => appTile(id, { noDrag: true })))));
    els.home.appendChild(ov);
    U.anim(ov.querySelector('.fo-panel'), [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 360, easing: U.SPRING });
  }

  function paintBadges() {
    els.home.querySelectorAll('.app[data-app]').forEach((a) => {
      const n = JC.notify.badge(a.dataset.app);
      const b = a.querySelector('.app-badge');
      if (!b) return;
      b.hidden = !n;
      b.textContent = n > 99 ? '99+' : String(n || '');
    });
    els.home.querySelectorAll('.app.folder').forEach((f) => {
      const fo = home().pages.flat().find((x) => x && x.folder === f.dataset.folder);
      const n = fo ? fo.apps.reduce((s, id) => s + (JC.notify.badge(id) || 0), 0) : 0;
      const b = f.querySelector('.app-badge');
      if (b) { b.hidden = !n; b.textContent = String(n); }
    });
  }

  // Spotlight
  function openSpotlight() {
    if (els.home.querySelector('.spotlight')) return;
    const results = h('div.sp-results.scroll');
    const sp = h('div.spotlight', h('div.sp-back', { onTap: () => close() }), results);
    const field = JC.ui.search({ placeholder: 'Search', cancelText: 'Cancel', onInput: (q) => render(q), onCancel: () => close(), onSubmit: (q) => { if (q) { close(); os.open('safari', { search: q }); } } });
    field.classList.add('sp-field');
    sp.appendChild(field);
    els.home.appendChild(sp);
    U.anim(sp, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'none' });
    setTimeout(() => field.input.focus(), 60);
    render('');
    function close() {
      JC.kb.hide();
      U.anim(sp, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => sp.remove());
    }
    sp._close = close;
    function render(q) {
      results.innerHTML = '';
      q = q.trim().toLowerCase();
      if (!q) {
        results.append(h('div.sp-h', 'Siri Suggestions'), h('div.sp-apps', ['messages', 'voicememos', 'photos', 'findmy', 'notes', 'wavelet', 'maps', 'lotusleap'].map((id) => appTile(id, { noDrag: true }))));
        const recent = JC.contacts.people().filter((c) => ['jl', 'wwx', 'lxc', 'nhs'].includes(c.id));
        results.append(h('div.sp-h', 'Contacts'), JC.ui.list([{ rows: recent.map((c) => ({ avatar: c.id, avatarSize: 34, title: c.display, subtitle: c.phones[0] ? c.phones[0].num : '', onTap: () => { close(); os.open('contacts', { contact: c.id }); } })) }]));
        return;
      }
      const appIds = Object.keys(APP_NAMES).filter((id) => APP_NAMES[id].toLowerCase().includes(q));
      if (appIds.length) results.append(h('div.sp-h', 'Apps'), h('div.sp-apps', appIds.slice(0, 8).map((id) => appTile(id, { noDrag: true }))));
      const cs = JC.contacts.people().filter((c) => (c.display + ' ' + JC.contacts.full(c.id) + ' ' + (c.nick || '')).toLowerCase().includes(q)).slice(0, 5);
      if (cs.length) results.append(h('div.sp-h', 'Contacts'), JC.ui.list([{ rows: cs.map((c) => ({ avatar: c.id, avatarSize: 34, title: c.display, subtitle: JC.contacts.real(c.id), onTap: () => { close(); os.open('contacts', { contact: c.id }); } })) }]));
      if (JC.story && JC.story.search) {
        const ms = JC.story.search(q).slice(0, 6);
        if (ms.length) results.append(h('div.sp-h', 'Messages'), JC.ui.list([{ rows: ms.map((m) => ({ avatar: m.avatar, avatarSize: 34, title: m.name, subtitle: m.text, detail: U.fmtRelative(m.t), onTap: () => { close(); os.open('messages', { thread: m.thread, msg: m.id }); } })) }]));
      }
      if (JC.store.hasSeed('notes')) {
        const ns = JC.store.all('notes').filter((n) => !n.locked && ((n.title || '') + ' ' + (n.body || '')).toLowerCase().includes(q)).slice(0, 4);
        if (ns.length) results.append(h('div.sp-h', 'Notes'), JC.ui.list([{ rows: ns.map((n) => ({ icon: { app: 'notes' }, title: n.title || 'Note', subtitle: (n.body || '').slice(0, 60), onTap: () => { close(); os.open('notes', { note: n.id }); } })) }]));
      }
      results.append(h('div.sp-h', 'Search the Web'), JC.ui.list([{ rows: [{ icon: { app: 'safari' }, title: '“' + q + '”', subtitle: 'Search in Safari', onTap: () => { close(); os.open('safari', { search: q }); } }] }]));
    }
  }
  os.spotlight = openSpotlight;

  // ── App windows ──────────────────────────────────────────────────
  function makeWin(id) {
    const def = apps[id];
    const el = h('div.win', { data: { app: id } });
    const body = h('div.win-body');
    const overlays = h('div.win-overlays');
    el.append(body, overlays);
    els.apps.appendChild(el);
    const win = {
      id, def, el, body, overlays, status: null, inst: null,
      setStatus(st) { win.status = st; updateStatus(); },
      close() { goHome(); },
    };
    try {
      win.inst = def.launch(win, null) || {};
    } catch (e) {
      console.error('app launch failed', id, e);
      body.appendChild(h('div.app-crash', h('div.ac-t', (def.name || id) + ' quit unexpectedly.'), h('div.ac-s', String(e && e.message || e))));
      win.inst = {};
    }
    return win;
  }

  function iconRect(id) {
    if (homePage >= pageCount()) return null;
    const pageEl = els.pages.children[homePage];
    let icon = pageEl && pageEl.querySelector(`.app[data-app="${id}"] .appicon`);
    if (!icon) icon = els.dock.querySelector(`.app[data-app="${id}"] .appicon`);
    if (!icon) return null;
    return JC.ui.toLocal(icon.getBoundingClientRect());
  }

  function zoomKeyframes(r, reverse) {
    const W = 402, H = os.H;
    const s = r.w / W;
    const visH = r.h / s;
    const inset = Math.max(0, (H - visH) / 2);
    const rad = 14 / s;
    const tx = r.x + r.w / 2 - (W / 2) * s;
    const ty = r.y + r.h / 2 - (H / 2) * s;
    const a = { transform: `translate(${tx}px, ${ty}px) scale(${s})`, clipPath: `inset(${inset}px 0px ${inset}px 0px round ${rad}px)` };
    const b = { transform: 'translate(0px, 0px) scale(1)', clipPath: `inset(0px 0px 0px 0px round ${stage.classList.contains('mobile') ? 0 : 58}px)` };
    return reverse ? [b, a] : [a, b];
  }

  os.activeWin = () => (active && !active.closing ? active : null);
  os.running = () => order.slice();
  os.isOpen = (id) => !!(active && active.id === id && !active.closing && !os.locked);

  os.open = (id, intent, fromRect) => {
    if (!apps[id]) {
      JC.ui.alert({ title: (APP_NAMES[id] || id) + ' is unavailable', message: 'This app is still being set up.', buttons: [{ text: 'OK' }] });
      return;
    }
    if (os.locked) { unlockThen(() => os.open(id, intent)); return; }
    closeCC(); closeNC();
    const sp = els.home.querySelector('.spotlight');
    if (sp && sp._close) sp._close();
    els.home.querySelectorAll('.folder-open').forEach((f) => f.remove());
    if (els.switcher.classList.contains('open')) closeSwitcher(true);
    setJiggle(false);
    JC.kb.hide();
    const prev = active;
    let win = running[id];
    if (!win) {
      win = running[id] = makeWin(id);
      if (win.inst.intent && intent) setTimeout(() => win.inst.intent(intent), 0);
    } else if (intent && win.inst.intent) win.inst.intent(intent);
    order = order.filter((x) => x !== id).concat(id);
    if (prev && prev !== win) {
      prev.el.classList.remove('active');
      prev.el.style.display = 'none';
      prev.inst.hide && prev.inst.hide();
    }
    active = win;
    win.closing = false;
    win.el.style.display = 'block';
    win.el.classList.add('active');
    els.home.classList.add('app-open');
    if (prev === win) { updateStatus(); return; }
    const r = fromRect || iconRect(id);
    win.el.style.zIndex = '2';
    if (r && !prev) {
      const cover = h('div.win-cover');
      cover.style.backgroundImage = `url("${JC.appIcon.url(id)}")`;
      win.el.appendChild(cover);
      U.anim(cover, [{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out' }).then(() => cover.remove());
      U.anim(win.el, zoomKeyframes(r), { duration: 520, easing: 'cubic-bezier(.2,.95,.25,1)' }).then(() => win.el.getAnimations().forEach((a) => a.cancel()));
      U.anim(els.home, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(1.08)', opacity: 0 }], { duration: 480, fill: 'none' });
    } else {
      U.anim(win.el, [{ transform: 'scale(.92)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 360 }).then(() => win.el.getAnimations().forEach((a) => a.cancel()));
    }
    win.inst.show && win.inst.show();
    updateStatus();
    if (JC.story) JC.story.act('open_app', { app: id });
    JC.bus.emit('app:open', id);
  };

  function goHome(opts) {
    opts = opts || {};
    JC.kb.hide();
    const sp = els.home.querySelector('.spotlight');
    if (sp && sp._close) { sp._close(); return; }
    const fo = els.home.querySelector('.folder-open');
    if (fo) { fo.remove(); return; }
    if (jiggle && !active) { setJiggle(false); return; }
    if (!active) { if (homePage !== 0) goPage(0); return; }
    const win = active;
    win.closing = true;
    active = null;
    win.inst.hide && win.inst.hide();
    els.home.classList.remove('app-open');
    updateStatus();
    const r = iconRect(win.id);
    const from = opts.from;
    const done = () => {
      win.el.getAnimations().forEach((a) => a.cancel());
      win.el.classList.remove('active');
      win.el.style.display = 'none';
      win.el.style.transform = '';
      win.closing = false;
      updateStatus();
    };
    if (r) {
      const kf = zoomKeyframes(r, true);
      if (from) kf[0] = from;
      U.anim(win.el, kf, { duration: 460, easing: 'cubic-bezier(.3,.9,.3,1)' }).then(done);
      const cover = h('div.win-cover');
      cover.style.backgroundImage = `url("${JC.appIcon.url(win.id)}")`;
      win.el.appendChild(cover);
      U.anim(cover, [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 460 }).then(() => cover.remove());
    } else {
      U.anim(win.el, [from || { transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.4)', opacity: 0 }], { duration: 380 }).then(done);
    }
    U.anim(els.home, [{ transform: 'scale(1.08)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 460, fill: 'none' });
    JC.bus.emit('app:home', win.id);
  }
  os.home = goHome;

  os.kill = (id) => {
    const w = running[id];
    if (!w) return;
    if (w.inst && w.inst.destroy) try { w.inst.destroy(); } catch (e) { /* ignore */ }
    w.el.remove();
    delete running[id];
    order = order.filter((x) => x !== id);
    if (active === w) { active = null; els.home.classList.remove('app-open'); }
    updateStatus();
  };

  os.back = () => {
    if (active && active.inst.back && active.inst.back()) return true;
    if (active) {
      const navEl = active.body.querySelector('.tab-pane.on .nav, .nav');
      if (navEl) {
        const pages = navEl.querySelectorAll(':scope > .page');
        if (pages.length > 1) {
          const back = pages[pages.length - 1].querySelector('.navbtn.back');
          if (back) { back.click(); return true; }
        }
      }
    }
    return false;
  };

  /** is the user currently looking at the place this notification points to? */
  os.isViewing = (n) => {
    if (os.locked || !active || active.closing) return false;
    if (n.thread && active.id === 'messages') return JC.story && JC.story.openThread && JC.story.openThread() === n.thread;
    if (n.app && active.id === n.app && !n.thread && n.app !== 'messages') return true;
    return false;
  };

  // ── Home bar & app switcher ──────────────────────────────────────
  function buildHomebar() {
    const hb = els.homebar;
    hb.innerHTML = '';
    hb.appendChild(h('div.hb-pill'));
    let holdT = null;
    let held = false;
    U.drag(hb, {
      axis: 'y',
      threshold: 3,
      tap: () => {
        if (os.asleep) { os.wake(); return; }
        if (os.locked) { tryUnlock(); return; }
        if (els.switcher.classList.contains('open')) { closeSwitcher(); return; }
        if (els.cc.classList.contains('open')) { closeCC(); return; }
        goHome();
      },
      start: (e, p) => {
        if (os.locked) { tryUnlock(); return false; }
        if (p.dy > 0) return false;
        held = false;
        return true;
      },
      move: (e, p) => {
        const dy = Math.min(0, p.dy);
        if (active && !active.closing) {
          // scale around a point near the bottom-centre, expressed with transform-origin 0 0
          const s = Math.max(0.5, 1 + dy / 1000);
          const ox = 201, oy = os.H * 0.9;
          const tx = ox * (1 - s);
          const ty = oy * (1 - s) + dy * 0.5;
          active.el.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
          active.el.style.clipPath = `inset(0px round ${Math.min(58, 30 + (1 - s) * 120) / s}px)`;
          active.el.classList.add('dragging');
        }
        clearTimeout(holdT);
        if (dy < -70) holdT = setTimeout(() => { held = true; }, 260);
      },
      end: (e, p) => {
        clearTimeout(holdT);
        const dy = Math.min(0, p.dy);
        if (active && !active.closing) {
          const el = active.el;
          const from = { transform: el.style.transform || 'none', clipPath: el.style.clipPath || 'inset(0px round 0px)' };
          el.classList.remove('dragging');
          const reset = () => { el.style.transform = ''; el.style.clipPath = ''; };
          if (held && Math.abs(p.vy) < 0.4) { reset(); openSwitcher(); return; }
          if (dy < -60 || p.vy < -0.5) { reset(); goHome({ from }); return; }
          U.anim(el, [from, { transform: 'translate(0px, 0px) scale(1)', clipPath: 'inset(0px round 0px)' }], { duration: 300 }).then(() => { reset(); el.getAnimations().forEach((a) => a.cancel()); });
          return;
        }
        if (held || dy < -140) openSwitcher();
      },
    });
    U.longPress(hb, () => { if (!os.locked) openSwitcher(); }, 650);
  }

  function openSwitcher() {
    if (os.locked) return;
    JC.kb.hide();
    const sw = els.switcher;
    sw.innerHTML = '';
    const ids = order.slice().reverse();
    sw.classList.add('open');
    els.home.classList.add('switching');
    if (!ids.length) {
      sw.appendChild(h('div.sw-empty', { onTap: () => closeSwitcher() }, 'No Recent Apps'));
      if (active) goHome();
      updateStatus();
      return;
    }
    const strip = h('div.sw-strip');
    sw.appendChild(h('div.sw-bg', { onTap: () => closeSwitcher() }));
    sw.appendChild(strip);
    let offset = 0;
    const cards = ids.map((id, i) => {
      const w = running[id];
      const card = h('div.sw-card', { data: { app: id } }, h('div.sw-head', JC.appIcon(id), h('span', (apps[id] && apps[id].name) || id)), h('div.sw-shot'));
      // live snapshot: temporarily move the window into the card
      w.el.style.display = 'block';
      w.el.classList.add('in-switcher');
      card.querySelector('.sw-shot').appendChild(w.el);
      strip.appendChild(card);
      JC.ui.onTap(card, () => switchTo(id));
      U.drag(card, {
        axis: 'y',
        move: (e, p) => { if (p.dy < 0) card.style.transform = `translateY(${p.dy}px)`; },
        end: (e, p) => {
          if (p.dy < -120 || p.vy < -0.6) {
            U.anim(card, [{ transform: card.style.transform }, { transform: 'translateY(-900px)' }], { duration: 260 }).then(() => {
              card.remove();
              restoreWin(id);
              os.kill(id);
              if (!strip.children.length) closeSwitcher();
              else layoutCards();
            });
          } else card.style.transform = '';
        },
      });
      return card;
    });
    function layoutCards() {
      Array.from(strip.children).forEach((c, i) => { c.style.setProperty('--i', i); });
    }
    layoutCards();
    U.drag(strip, {
      axis: 'x',
      start: () => { strip._x = offset; },
      move: (e, p) => { offset = U.clamp(strip._x - p.dx, 0, Math.max(0, (strip.children.length - 1) * 230)); strip.style.setProperty('--off', offset + 'px'); },
    });
    if (active) { active.el.classList.remove('active'); active = null; }
    els.home.classList.remove('app-open');
    U.anim(strip, [{ transform: 'scale(1.3)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 380 });
    updateStatus();
  }
  function restoreWin(id) {
    const w = running[id];
    if (!w) return;
    w.el.classList.remove('in-switcher', 'active');
    w.el.style.display = 'none';
    els.apps.appendChild(w.el);
  }
  function closeSwitcher(instant) {
    const sw = els.switcher;
    if (!sw.classList.contains('open')) return;
    Object.keys(running).forEach(restoreWin);
    sw.classList.remove('open');
    sw.innerHTML = '';
    els.home.classList.remove('switching');
    updateStatus();
  }
  function switchTo(id) {
    closeSwitcher(true);
    os.open(id);
  }
  os.switcher = openSwitcher;

  // ── Hardware ─────────────────────────────────────────────────────
  function buildSideButton() {
    const side = device.querySelector('.hw-side');
    let t = null, long = false;
    side.addEventListener('pointerdown', () => { long = false; t = setTimeout(() => { long = true; siri(); }, 600); });
    side.addEventListener('pointerup', () => { clearTimeout(t); if (!long) sideClick(); });
    side.addEventListener('pointerleave', () => clearTimeout(t));
    side.__tap = true;
  }
  function sideClick() {
    if (JC.story && JC.story.call && JC.story.call() && JC.story.call().phase === 'ringing') { JC.story.silenceRing && JC.story.silenceRing(); return; }
    if (os.asleep) os.wake();
    else os.sleep();
  }
  function hwAction() {
    JC.audio.haptic(20);
    const a = S().settings.actionButton || 'silent';
    if (a === 'silent') { os.setToggle('silent', !S().settings.silent); return; }
    if (a === 'none') return;
    if (a === 'flashlight') { os.setToggle('flashlight', !S().settings.flashlight); islandFlash(S().settings.flashlight ? 'Flashlight On' : 'Flashlight Off', S().settings.flashlight ? 'flashlight.on.fill' : 'flashlight.off.fill'); if (els.lockFlash) els.lockFlash.classList.toggle('on', !!S().settings.flashlight); return; }
    if (a === 'focus') { os.setToggle('focus', S().settings.focus ? null : 'dnd'); islandFlash(S().settings.focus ? 'Do Not Disturb' : 'Focus Off', 'moon.fill', '#a78bfa'); return; }
    if (a === 'camera' || a === 'memo' || a === 'music') {
      const app = a === 'memo' ? 'voicememos' : a;
      if (os.asleep) os.wake();
      unlockThen(() => os.open(app, a === 'memo' ? { record: true } : null));
      return;
    }
    if (os.locked) { openCC(); return; }
    openCC();
  }
  function applyTextSize() {
    const ts = U.clamp(S().settings.textSize || 1, 0.8, 1.4);
    screen.style.setProperty('--ts', String(ts));
  }
  let volT = null;
  function volume(dir) {
    const v = U.clamp((S().settings.volume == null ? 0.6 : S().settings.volume) + dir / 16, 0, 1);
    setting('volume', v);
    JC.audio.applyVolume();
    const hud = els['vol-hud'];
    hud.innerHTML = '';
    hud.append(h('div.vh-track', h('div.vh-fill', { style: { height: v * 100 + '%' } })), h('div.vh-ic', JC.icon(v === 0 ? 'speaker.slash.fill' : 'speaker.wave.2.fill', { size: 14 })));
    hud.classList.add('show');
    clearTimeout(volT);
    volT = setTimeout(() => hud.classList.remove('show'), 1300);
    if (!S().settings.silent) JC.audio.play('tink');
  }
  os.volume = volume;

  function siri() {
    if (os.asleep) os.wake();
    const layer = els['sys-overlays'];
    const glow = h('div.siri-glow');
    const answer = h('div.siri-answer');
    let input;
    const box = h('div.siri-box', answer, h('div.siri-field', input = JC.ui.input({ placeholder: 'Ask Siri…', enterkey: 'send', onSubmit: (v) => respond(v) })));
    const back = h('div.siri-back', { onTap: () => close() });
    layer.append(back, glow, box);
    setTimeout(() => input.focus(), 200);
    JC.audio.play('tink');
    function close() { JC.kb.hide(); [back, glow, box].forEach((e) => e.remove()); }
    function say(t) { answer.textContent = t; }
    say('What can I help with?');
    function respond(q) {
      const s = q.toLowerCase();
      input.value = '';
      if (!s.trim()) return;
      if (/time/.test(s)) say('It’s ' + U.fmtTime(JC.time.now()) + '.');
      else if (/where am i|location/.test(s)) say('You’re near Jinxing Road, Lanling.');
      else if (/weather|rain/.test(s)) say('It’s 14° and raining in Lanling.');
      else if (/who.*(own|this phone)|whose phone|my name/.test(s)) say('This iPhone belongs to Jiang Cheng. You are not Jiang Cheng.');
      else if (/call (.+)/.test(s)) {
        const name = s.match(/call (.+)/)[1];
        const c = JC.contacts.people().find((x) => (x.display + ' ' + JC.contacts.full(x.id) + ' ' + (x.nick || '')).toLowerCase().includes(name.trim()));
        if (c) { say('Calling ' + c.display + '…'); setTimeout(() => { close(); JC.story.dial(c.id); }, 900); } else say('I couldn’t find “' + name + '” in your contacts.');
      } else if (/open (.+)/.test(s)) {
        const n = s.match(/open (.+)/)[1].trim();
        const id = Object.keys(APP_NAMES).find((k) => APP_NAMES[k].toLowerCase() === n);
        if (id) { close(); os.open(id); } else say('I couldn’t find an app called “' + n + '”.');
      } else if (/joke/.test(s)) say('Why did the radish blush? It saw the salad dressing. (Wei Wuxian added this joke to my database.)');
      else if (/passcode|password/.test(s)) say('I can’t help with that.');
      else if (/jiang cheng|wanyin/.test(s)) say('Jiang Cheng is the owner of this iPhone. His Medical ID says he is allergic to Wei Wuxian.');
      else if (/sorry|thank/.test(s)) say('You don’t need to apologize to me. But maybe to someone.');
      else say('Here’s what I found on the web for “' + q + '”.') || setTimeout(() => { close(); os.open('safari', { search: q }); }, 900);
    }
  }
  os.siri = siri;

  function keyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const layer = els['sys-overlays'];
        const alertBtn = layer.querySelector('.alert .alert-btn.cancel') || null;
        if (alertBtn) { alertBtn.click(); return; }
        const w = os.activeWin();
        if (w) {
          const ov = w.overlays.querySelector('.sheet-back, .pmenu-back, .ctx-back, .backdrop');
          if (ov) { ov.click(); return; }
        }
        if (els.cc.classList.contains('open')) { closeCC(); return; }
        if (els.nc) { closeNC(); return; }
        if (els.switcher.classList.contains('open')) { closeSwitcher(); return; }
        if (JC.kb.visible) { JC.kb.hide(); return; }
        if (os.locked) return;
        if (!os.back()) goHome();
      }
    });
  }

  // ── Cinema: prologue, time skip, endings ─────────────────────────
  os.prologue = (lines) => new Promise((resolve) => {
    const C = els.cinema;
    C.innerHTML = '';
    C.classList.add('on');
    JC.time.freeze(true);
    let i = 0;
    const text = h('div.pro-text');
    const next = h('div.pro-next', 'Tap to continue');
    const skip = h('div.pro-skip', { onTap: (e) => { e.stopPropagation(); finish(); } }, 'Skip');
    const wrap = h('div.prologue', h('div.pro-rain'), text, next, skip);
    C.appendChild(wrap);
    JC.ui.onTap(wrap, () => step());
    function step() {
      if (i >= lines.length) return finish();
      const line = h('div.pro-line', lines[i++]);
      text.innerHTML = '';
      text.appendChild(line);
      U.anim(line, [{ opacity: 0, transform: 'translateY(8px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 700, easing: 'ease-out' });
      next.textContent = i >= lines.length ? 'Tap to pick up the phone' : 'Tap to continue';
    }
    function finish() {
      JC.time.freeze(false);
      U.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).then(() => { C.classList.remove('on'); C.innerHTML = ''; resolve(); });
      U.anim(els.lock, [{ filter: 'brightness(0)' }, { filter: 'brightness(1)' }], { duration: 1200 });
      JC.audio.play('notify');
    }
    step();
  });

  os.timeSkip = (o) => new Promise((resolve) => {
    o = o || {};
    const C = els.cinema;
    C.innerHTML = '';
    C.classList.add('on');
    JC.time.freeze(true);
    const fromT = JC.time.now();
    const toT = o.to;
    const clock = h('div.ts-clock', U.fmtClock(fromT));
    const card = h('div.timeskip', h('div.ts-moon'), clock, o.text ? h('div.ts-text', o.text) : null);
    C.appendChild(card);
    U.anim(card, [{ opacity: 0 }, { opacity: 1 }], { duration: 900 });
    const t0 = performance.now();
    const dur = 2600;
    const tick = () => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      clock.textContent = U.fmtClock(fromT + (toT - fromT) * e);
      if (k < 1) requestAnimationFrame(tick);
      else {
        JC.time.set(toT);
        if (o.lock !== false) { os.lock(true); }
        setTimeout(() => {
          U.anim(card, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).then(() => { C.classList.remove('on'); C.innerHTML = ''; JC.time.freeze(false); resolve(); });
        }, 1600);
      }
    };
    setTimeout(() => requestAnimationFrame(tick), 900);
    JC.ui.onTap(card, () => {});
  });

  function endingView(e, opts) {
    opts = opts || {};
    const all = JC.story.endings();
    const got = all.filter((x) => x.unlocked).length;
    const def = JC.story.endingDef(e.id) || e;
    const body = h('div.end-body',
      h('div.end-art', JC.art.el(def.art || 'end_' + def.id, { cls: 'end-art-img' }), h('div.end-art-fade')),
      h('div.end-text',
        h('div.end-tag', (def.tag ? def.tag + ' · ' : '') + 'Ending ' + (def.n || '') + ' of ' + (all.length || 13)),
        h('div.end-title', def.title),
        (def.text || []).map((p) => h('p', p)),
        def.jc && def.jc.length ? h('div.end-jc', h('div.end-jc-k', JC.icon('lotus.fill', { size: 14 }), ' When Jiang Cheng got his phone back…'), def.jc.map((p) => h('p', p))) : null,
        opts.also && opts.also.length ? h('div.end-also', 'Also unlocked: ' + opts.also.map((id) => (JC.story.endingDef(id) || {}).title || id).join(', ')) : null,
        h('div.end-count', 'Endings found: ' + got + ' / ' + (all.length || 13))));
    return body;
  }

  os.ending = (id, also) => {
    const C = els.cinema;
    C.innerHTML = '';
    C.classList.add('on');
    JC.time.freeze(true);
    JC.kb.hide();
    const e = JC.story.endingDef(id);
    const wrap = h('div.ending.scroll');
    const btns = h('div.end-btns',
      JC.state.canRewind() ? h('div.end-btn', { onTap: () => { close(); JC.story.rewind(); } }, JC.icon('arrow.counterclockwise', { size: 18 }), h('span', 'Rewind to last choice')) : null,
      h('div.end-btn', { onTap: () => { close(); JC.ui.toast('The story has ended — the phone is yours to explore', { icon: 'lotus.fill', ms: 3000 }); } }, JC.icon('iphone', { size: 18 }), h('span', 'Keep exploring the phone')),
      h('div.end-btn', { onTap: () => { close(); os.showEndings(); } }, JC.icon('square.grid.2x2', { size: 18 }), h('span', 'All endings')),
      h('div.end-btn.primary', { onTap: () => { close(); JC.story.restart(); } }, JC.icon('arrow.clockwise', { size: 18 }), h('span', 'Start over')));
    wrap.append(endingView(e || { id, title: id }, { also }), btns);
    C.appendChild(h('div.end-dim'));
    C.appendChild(wrap);
    U.anim(C.querySelector('.end-dim'), [{ opacity: 0 }, { opacity: 1 }], { duration: 1200 });
    U.anim(wrap, [{ transform: 'translateY(60px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 1100, delay: 500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    JC.audio.play('success');
    function close() {
      JC.time.freeze(false);
      U.anim(C, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).then(() => { C.classList.remove('on'); C.innerHTML = ''; C.style.opacity = ''; C.getAnimations().forEach((a) => a.cancel()); });
    }
  };

  os.showEndings = () => {
    const list = JC.story.endings();
    const got = list.filter((e) => e.unlocked).length;
    const s = JC.ui.sheet({
      title: 'Endings', detent: 'large', system: true, left: { text: 'Close' }, cls: 'endings-sheet',
      content: () => [
        h('div.eg-head', h('div.eg-ring', { style: { '--p': Math.round((got / (list.length || 13)) * 100) } }, h('span', got + '/' + (list.length || 13))), h('div.eg-sub', got === list.length && got ? 'You found every ending. Jiang Cheng is impressed (he will never say so).' : 'Each night can end differently. Rewind or start over to find them all.')),
        h('div.eg-grid', list.map((e) => h('div.eg-card', {
          class: { locked: !e.unlocked },
          onTap: () => {
            if (!e.unlocked) { JC.ui.alert({ title: 'Locked Ending', message: e.hint || 'Keep playing.', buttons: [{ text: 'OK' }] }); return; }
            const v = JC.ui.sheet({ title: e.title, detent: 'large', system: true, left: { text: 'Back' }, content: () => [h('div.ending.inline', endingView(e))] });
            return v;
          },
        }, e.unlocked ? JC.art.el(e.art || 'end_' + e.id, { cls: 'eg-art' }) : h('div.eg-art.locked', JC.icon('lock.fill', { size: 22 })),
        h('div.eg-n', 'Ending ' + e.n), h('div.eg-t', e.unlocked ? e.title : '???'), h('div.eg-h', e.unlocked ? (e.tag || '') : (e.hint || ''))))),
        h('div.eg-actions',
          JC.ui.btn({ text: 'Rewind to last choice', kind: 'gray', disabled: !JC.state.canRewind(), onTap: () => { s.close(); JC.story.rewind(); } }),
          JC.ui.btn({ text: 'Restart story', kind: 'tinted', onTap: () => { s.close(); confirmRestart(); } })),
      ],
    });
  };

  function confirmRestart() {
    JC.ui.alert({
      title: 'Start Over?',
      message: 'The night begins again in the taxi. Endings you have found stay unlocked.',
      buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Start Over', style: 'destructive', onTap: () => JC.story.restart() }],
    });
  }
  os.confirmRestart = confirmRestart;

  // full UI rebuild after restart / rewind
  os.rebuild = () => {
    Object.keys(running).forEach((id) => os.kill(id));
    active = null;
    order = [];
    homePage = 0;
    els.cinema.classList.remove('on');
    els.cinema.innerHTML = '';
    els.cinema.style.opacity = '';
    els.cinema.getAnimations().forEach((a) => a.cancel());
    JC.time.unfreezeAll();
    els['sys-overlays'].innerHTML = '';
    els.banners.innerHTML = '';
    applyAppearance();
    applyWallpaper();
    applyBrightness();
    renderHome();
    os.locked = false;
    if (S().unlocked && S().started) {
      // rewind: stay on the home screen
      els.lock.classList.add('gone');
      els.pc.hidden = true;
    } else os.lock(true);
    renderLost();
    if (!S().lost) els.lock.classList.remove('lost');
    updateStatus();
  };

  // ── Boot hooks ───────────────────────────────────────────────────
  os.build = build;
  os.start = () => {
    JC.bus.on('tick', () => { updateStatus(); batteryTick(); });
    JC.bus.on('setting', (s) => {
      if (s.key === 'wallpaper') applyWallpaper();
      if (s.key === 'appearance') applyAppearance();
      if (s.key === 'brightness') applyBrightness();
      if (s.key === 'h24') { renderLockClock(); updateStatus(); }
      if (s.key === 'textSize') applyTextSize();
      if (s.key === 'previews' || s.key === 'notifOff' || s.key === 'prefs') renderAll();
    });
    JC.bus.on('kb', (k) => {
      screen.classList.toggle('kb-open', k.open);
    });
    renderLost();
    renderLockNotifs();
    updateStatus();
    if (location.hash === '#audit') setInterval(() => {
      const bad = JC.ui.audit();
      document.querySelectorAll('.audit-bad').forEach((e) => e.classList.remove('audit-bad'));
      bad.forEach((e) => e.classList.add('audit-bad'));
      if (bad.length) console.warn('[audit] tappable elements without handlers:', bad);
    }, 2000);
  };
})();
