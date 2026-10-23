/* Weather — iOS 26: swipeable city pages with animated skies (rain / mist / clouds / stars), hourly strip, 10-day
   forecast with temperature-range bars, condition cards (UV, wind, humidity, visibility, sunset, AQI, precipitation,
   feels like, pressure), precipitation map, chart detail sheets with scrubbing, city list with search & add. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;

  // ── climate data (day 0 = Fri 16 Oct 2026) ─────────────────────────────────
  // c: condition per day; per-hour overrides tell the weekend's story (calm harbor, a quiet sea at Guyun, snow up north).
  // If Osial is set loose on Sunday night, liyue and guyun turn to storm from 23:00 (see stormAt).
  const D = (c, hi, lo, pop) => ({ c, hi, lo, pop: pop || 0 });
  const CLIMATE = {
    liyue: { name: 'Liyue Harbor', region: 'Liyue', tz: 8, sun: ['06:24', '17:52'], wind: [9, 15, 'SE', 135], aqi: 34, pres: 1015,
      days: [D('sunny', 24, 17), D('sunny', 24, 18), D('partly', 23, 18, 10), D('showers', 21, 17, 40), D('sunny', 24, 18), D('partly', 23, 18, 10), D('cloudy', 22, 17, 20), D('sunny', 24, 17), D('sunny', 25, 18), D('partly', 23, 18, 10), D('showers', 21, 17, 50)],
      hours: { 2: [[0, 'partly'], [18, 'cloudy']] },
      summary: { 0: 'Clear and calm tonight. A light sea breeze off the harbor.', 1: 'Sunny all day — good lantern-lighting weather tonight on Yujing Terrace.', 2: 'Cloud building offshore this evening. The lanterns go out at 23:00.' } },
    guyun: { name: 'Guyun Stone Forest', region: 'Liyue · marine', tz: 8, sun: ['06:21', '17:50'], wind: [3, 5, 'E', 90], aqi: 18, pres: 1012,
      days: [D('mist', 22, 17, 10), D('partly', 22, 17), D('mist', 21, 17, 10), D('rain', 19, 16, 70), D('cloudy', 21, 17, 20), D('partly', 22, 17, 10), D('mist', 21, 17, 10), D('sunny', 22, 17), D('partly', 22, 18), D('cloudy', 21, 17, 20), D('rain', 19, 16, 60)],
      hours: { 0: [[0, 'mist']], 2: [[0, 'mist'], [10, 'partly'], [20, 'mist']] },
      summary: { 0: 'Sea state glassy, swell 0.2 m. Mariners report a low hum around the outer pillars.', 2: 'Unusually still. Visibility falls after dark. Keep clear of pillar G-17.' } },
    morepesok: { name: 'Morepesok', region: 'Snezhnaya', tz: 3, sun: ['08:41', '15:58'], wind: [14, 24, 'N', 0], aqi: 12, pres: 1024,
      days: [D('snow', -2, -7, 70), D('snow', -2, -8, 80), D('cloudy', -1, -6, 20), D('snow', -3, -9, 70), D('snow', -5, -11, 60), D('cloudy', -4, -10, 20), D('sunny', -3, -12), D('snow', -6, -13, 70), D('snow', -7, -14, 80), D('cloudy', -6, -12, 20), D('sunny', -5, -14)],
      summary: { 0: 'Light snow on the bay. Ice fishing weather, according to every father in Morepesok.' } },
    zapolyarny: { name: 'Zapolyarny', region: 'Snezhnaya', tz: 3, sun: ['09:02', '15:31'], wind: [18, 30, 'NE', 45], aqi: 22, pres: 1027,
      days: [D('snow', -8, -15, 90), D('snow', -9, -16, 80), D('snow', -8, -14, 70), D('cloudy', -10, -17, 20), D('snow', -11, -18, 80), D('snow', -10, -17, 70), D('cloudy', -9, -15, 20), D('snow', -12, -19, 80), D('sunny', -13, -21), D('snow', -12, -18, 70), D('snow', -11, -17, 80)],
      summary: { 0: 'Heavy snow overnight. The airport is operating normally. Snezhnaya does not cancel flights for snow.' } },
    mondstadt: { name: 'Mondstadt', region: 'Mondstadt', tz: 7, sun: ['06:55', '18:01'], wind: [22, 36, 'W', 270], aqi: 15, pres: 1011,
      days: [D('partly', 17, 10, 10), D('sunny', 18, 11), D('sunny', 18, 11), D('partly', 17, 12, 10), D('showers', 15, 10, 50), D('cloudy', 15, 9, 20), D('sunny', 17, 10), D('partly', 17, 11, 10), D('sunny', 18, 10), D('showers', 14, 9, 60), D('partly', 16, 10, 10)],
      summary: { 0: 'Gusty west winds off Starfell Lake. Dandelion seeds expected.' } },
    fontaine: { name: 'Court of Fontaine', region: 'Fontaine', tz: 6, sun: ['07:12', '18:20'], wind: [8, 14, 'SW', 225], aqi: 28, pres: 1009,
      days: [D('drizzle', 18, 12, 60), D('showers', 18, 13, 50), D('rain', 17, 13, 80), D('cloudy', 17, 12, 20), D('drizzle', 18, 13, 60), D('rain', 16, 12, 80), D('showers', 17, 12, 50), D('cloudy', 18, 13, 20), D('drizzle', 18, 13, 60), D('rain', 17, 12, 80), D('showers', 17, 12, 50)],
      summary: { 0: 'It is raining in Fontaine. It is always raining in Fontaine.' } },
  };
  // more cities for search (generic forecasts)
  const MORE = [
    ['qingce', 'Qingce Village', 'Liyue', 8, 21, 14], ['wangshu', 'Wangshu Inn', 'Liyue', 8, 20, 13], ['stonegate', 'Stone Gate', 'Liyue', 8, 19, 12], ['mingyun', 'Mingyun Village', 'Liyue', 8, 23, 17],
    ['jueyun', 'Jueyun Karst', 'Liyue', 8, 15, 9], ['chasm', 'The Chasm', 'Liyue', 8, 17, 10], ['springvale', 'Springvale', 'Mondstadt', 7, 16, 9], ['inazuma', 'Inazuma City', 'Inazuma', 9, 21, 16],
    ['ritou', 'Ritou', 'Inazuma', 9, 22, 17], ['sumeru', 'Sumeru City', 'Sumeru', 7, 29, 22], ['aaru', 'Aaru Village', 'Sumeru', 7, 34, 20], ['poisson', 'Poisson', 'Fontaine', 6, 17, 12],
    ['natlan', 'Natlan', 'Natlan', 6, 31, 22], ['snezhnaya', 'Snezhnaya (Palace)', 'Snezhnaya', 3, -9, -16], ['dragonspine', 'Dragonspine', 'Mondstadt', 7, -6, -14],
  ];
  const CONDS = ['sunny', 'partly', 'cloudy', 'rain', 'sunny', 'partly'];
  const COLD = ['snow', 'cloudy', 'snow', 'sunny', 'snow', 'cloudy'];
  function climate(id) {
    if (CLIMATE[id]) return CLIMATE[id];
    const m = MORE.find((x) => x[0] === id);
    if (!m) return CLIMATE.liyue;
    const seed = m[0].split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    CLIMATE[id] = { name: m[1], region: m[2], tz: m[3], sun: ['06:' + (10 + seed % 40), '17:' + (20 + seed % 35)], wind: [6 + seed % 14, 12 + seed % 18, ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][seed % 8], (seed % 8) * 45], aqi: 20 + seed % 70, pres: 1008 + seed % 14,
      days: Array.from({ length: 11 }, (_, i) => { const c = (m[4] < 2 ? COLD : CONDS)[(seed + i * 3) % CONDS.length]; const w = ((seed + i * 7) % 5) - 2; return D(c, m[4] + w, m[5] + w, c === 'rain' ? 70 : c === 'cloudy' ? 20 : 0); }), summary: {} };
    return CLIMATE[id];
  }
  JC.store.seed('wxcities', [{ id: 'liyue', current: true }, { id: 'guyun' }, { id: 'morepesok' }, { id: 'zapolyarny' }, { id: 'mondstadt' }, { id: 'fontaine' }]);

  // ── model ──────────────────────────────────────────────────────────────────
  const DAY0 = new Date(2026, 9, 16).getTime();
  const HR = 3600e3;
  const NAMES = { sunny: 'Sunny', clear: 'Clear', partly: 'Partly Cloudy', cloudy: 'Mostly Cloudy', rain: 'Rain', showers: 'Showers', drizzle: 'Drizzle', mist: 'Mist', snow: 'Snow', storm: 'Violent Storm' };
  function localNow(cid) { const c = climate(cid); return JC.time.now() + (c.tz - 8) * HR; }
  function dayIdx(t) { const d = new Date(t); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - DAY0) / 864e5); }
  function dayOf(cid, i) { const c = climate(cid); const k = Math.max(0, Math.min(c.days.length - 1, i)); return c.days[k]; }
  const hm = (s) => { const [a, b] = s.split(':').map(Number); return a + b / 60; };
  function isNight(cid, t) { const c = climate(cid); const d = new Date(t); const x = d.getHours() + d.getMinutes() / 60; return x < hm(c.sun[0]) || x >= hm(c.sun[1]); }
  /** Osial: if the authorization went out, the sea rises at 23:00 on Sunday */
  function stormAt(cid, t) {
    if (cid !== 'liyue' && cid !== 'guyun') return false;
    const f = (JC.state.d && JC.state.d.flags) || {};
    return !!f.osial_sent && t >= DAY0 + (2 * 24 + 23) * HR && t < DAY0 + (3 * 24 + 9) * HR;
  }
  function condAt(cid, t) {
    if (stormAt(cid, t)) return 'storm';
    const c = climate(cid);
    const i = dayIdx(t);
    const hr = new Date(t).getHours();
    let cond = dayOf(cid, i).c;
    const ov = c.hours && c.hours[i];
    if (ov) ov.forEach(([from, cc]) => { if (hr >= from) cond = cc; });
    if (cond === 'sunny' && isNight(cid, t)) cond = 'clear';
    return cond;
  }
  function tempAt(cid, t) {
    const d = new Date(t);
    const i = dayIdx(t);
    const x = d.getHours() + d.getMinutes() / 60;
    const today = dayOf(cid, i), prev = dayOf(cid, i - 1), next = dayOf(cid, i + 1);
    let v;
    // evening cooling is slow at first (k^1.3), so the harbor still reads 18° at 23:47 like the widget
    if (x < 6) { const k = Math.pow((x + 9) / 15, 1.3); v = prev.hi - (prev.hi - today.lo) * k; }
    else if (x < 15) { const k = (x - 6) / 9; v = today.lo + (today.hi - today.lo) * (1 - Math.cos(k * Math.PI)) / 2; }
    else { const k = Math.pow((x - 15) / 15, 1.3); v = today.hi - (today.hi - next.lo) * k; }
    const cond = condAt(cid, t);
    if (cond === 'rain' || cond === 'showers') v -= 0.3;
    if (cond === 'storm') v -= 4;
    return v;
  }
  function popAt(cid, t) {
    const cond = condAt(cid, t);
    return { storm: 100, rain: 90, showers: 60, drizzle: 50, snow: 80, mist: 10, cloudy: 10, partly: 0, sunny: 0, clear: 0 }[cond] || 0;
  }
  function wig(cid, t) { const seed = cid.split('').reduce((a, c) => a + c.charCodeAt(0), 0); const n = Math.sin((Math.floor(t / HR) + seed) * 12.9898) * 43758.5453; return n - Math.floor(n); }
  function mmAt(cid, t) { const cond = condAt(cid, t); const base = { storm: 9, rain: 0.6, showers: 0.45, drizzle: 0.15, snow: 0.3 }[cond] || 0; return base ? Math.round(base * (0.45 + wig(cid, t)) * 10) / 10 : 0; }
  function metrics(cid, t) {
    const c = climate(cid);
    const cond = condAt(cid, t);
    const temp = tempAt(cid, t);
    const night = isNight(cid, t);
    const hum = { storm: 99, rain: 93, showers: 86, drizzle: 90, mist: 98, snow: 88, cloudy: 76, partly: 64, sunny: 48, clear: 58 }[cond];
    const vis = { storm: 0.4, rain: 6, showers: 9, drizzle: 9, mist: 0.8, snow: 3, cloudy: 16, partly: 24, sunny: 30, clear: 28 }[cond];
    const windF = cond === 'mist' ? 0.6 : cond === 'storm' ? 6 : 1;
    const wind = Math.round(c.wind[0] * windF), gust = Math.round(c.wind[1] * windF);
    const feels = temp - (wind > 15 ? 3 : wind > 8 ? 1.6 : 0.5) - (hum > 90 ? 0.4 : 0);
    const hour = new Date(t).getHours();
    const uvBase = { sunny: 5, partly: 4, cloudy: 2, mist: 1, drizzle: 1, showers: 1, rain: 1, snow: 1, storm: 0, clear: 0 }[cond];
    const uv = night ? 0 : Math.max(0, Math.round(uvBase * Math.sin(Math.max(0, Math.min(1, (hour - 6) / 12)) * Math.PI)));
    return { cond, temp, night, hum, dew: temp - (100 - hum) / 5, vis, wind, gust, dir: c.wind[2], deg: c.wind[3], feels, uv, pres: c.pres + (cond === 'rain' ? 0 : 3), aqi: c.aqi };
  }

  // ── units ──────────────────────────────────────────────────────────────────
  const prefs = () => Object.assign({ unit: 'C' }, JC.state.get('apx_weather') || {});
  const T = (c) => Math.round(prefs().unit === 'F' ? c * 9 / 5 + 32 : c);

  /** live conditions for widgets (home screen, lock screen) */
  JC.weather = {
    now(cid) {
      cid = cid || 'liyue';
      const t = JC.time.now();
      const m = metrics(cid, t);
      const d = dayOf(cid, dayIdx(t));
      return { temp: T(m.temp), cond: m.cond, label: (typeof NAMES !== 'undefined' && NAMES[m.cond]) || m.cond, hi: T(d.hi), lo: T(d.lo), name: climate(cid).name, night: m.night };
    },
  };
  const deg = (c) => T(c) + '°';
  const Tf = (c) => (prefs().unit === 'F' ? c * 9 / 5 + 32 : c);

  // ── icons (multi-colour, inline SVG) ────────────────────────────────────────
  function wxIcon(cond, size, night) {
    size = size || 24;
    const sun = '<circle cx="12" cy="12" r="4.2" fill="#ffd60a"/><g stroke="#ffd60a" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g>';
    const moon = '<path d="M15.5 3.6a8 8 0 1 0 5 12.4 6.6 6.6 0 0 1-5-12.4z" fill="#f2f2f7"/>';
    const cloud = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M7 19h10.2a4.3 4.3 0 0 0 .5-8.6A6 6 0 0 0 6.2 12 3.6 3.6 0 0 0 7 19z" fill="${c || '#f2f2f7'}"/>`;
    const drops = (n) => Array.from({ length: n }, (_, i) => `<path d="M${8 + i * 4} 19.5l-1 2.6" stroke="#5ac8fa" stroke-width="1.8" stroke-linecap="round"/>`).join('');
    let inner;
    switch (cond) {
      case 'sunny': inner = sun; break;
      case 'clear': inner = moon + '<circle cx="5" cy="5" r=".9" fill="#fff"/><circle cx="20" cy="9" r=".7" fill="#fff"/>'; break;
      case 'partly': inner = (night ? '<g transform="translate(4 -2) scale(.7)">' + moon + '</g>' : '<g transform="translate(5 -3) scale(.75)">' + sun + '</g>') + cloud(-1, 1, 1); break;
      case 'cloudy': inner = cloud(2, -3, 0.8, '#c7c7cc') + cloud(-1, 1, 1); break;
      case 'mist': inner = cloud(0, -3, 0.95) + '<g stroke="#d1d1d6" stroke-width="1.8" stroke-linecap="round"><path d="M4 17.5h16M6 21h12"/></g>'; break;
      case 'drizzle': inner = cloud(0, -3, 0.95) + '<g fill="#5ac8fa"><circle cx="9" cy="19.5" r="1"/><circle cx="13" cy="21" r="1"/><circle cx="16.5" cy="19.5" r="1"/></g>'; break;
      case 'showers': inner = (night ? '' : '<g transform="translate(6 -4) scale(.65)">' + sun + '</g>') + cloud(-1, -2, 1) + drops(2); break;
      case 'snow': inner = cloud(0, -3, 0.95) + '<g fill="#fff"><circle cx="8.5" cy="19.5" r="1.1"/><circle cx="12.5" cy="21.2" r="1.1"/><circle cx="16.5" cy="19.5" r="1.1"/></g>'; break;
      case 'storm': inner = cloud(0, -3, 0.95, '#8e8e93') + '<path d="M12.5 15.5 9.5 20h3l-1.5 3.5 4-5h-3l1.5-3z" fill="#ffd60a"/>' + drops(2); break;
      default: inner = cloud(0, -3, 0.95) + drops(3);
    }
    const s = document.createElement('span');
    s.className = 'wx-ic';
    s.style.width = s.style.height = size + 'px';
    s.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
    return s;
  }
  JC.icon.add({
    'wx.list': '<path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11"/><circle cx="4.5" cy="6.5" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="17.5" r="1.2" fill="currentColor"/>',
    'wx.map': '<path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
    'wx.drop': '<path d="M12 3.5c3.5 4.4 5.6 7.5 5.6 10.2a5.6 5.6 0 0 1-11.2 0c0-2.7 2.1-5.8 5.6-10.2z"/>',
    'wx.wind': '<path d="M3 9h11.5a3 3 0 1 0-3-3M3 13.5h15a3 3 0 1 1-3 3M3 18h7"/>',
    'wx.eye': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    'wx.thermo': '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/>',
    'wx.gauge': '<path d="M4.2 17.5a8.5 8.5 0 1 1 15.6 0"/><path d="m12 13.5 3.5-4"/>',
    'wx.sunset': '<path d="M4 18h16M7.5 14.5a4.5 4.5 0 0 1 9 0M12 4v4M9.5 6.5 12 9l2.5-2.5M5 10l1.4 1.4M19 10l-1.4 1.4"/>',
    'wx.aqi': '<path d="M3 8.5h10a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17.5h6"/><circle cx="19" cy="7" r="1.4" fill="currentColor"/>',
    'wx.cal': '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    'wx.clock': '<circle cx="12" cy="12" r="8.6"/><path d="M12 7v5l3.5 2"/>',
    'wx.umbrella': '<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0M12 3v1"/>',
    'wx.loc': '<path d="M20 4 3.5 11l7 2.5L13 20.5z" fill="currentColor" stroke="none"/>',
  });

  // ── backgrounds ────────────────────────────────────────────────────────────
  const reduce = () => (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || (JC.state.d && JC.state.d.settings && JC.state.d.settings.reduceMotion);
  function skyClass(m) {
    const n = m.night;
    if (m.cond === 'storm') return 'storm-n';
    if (m.cond === 'snow') return n ? 'snow-n' : 'snow-d';
    if (m.cond === 'rain' || m.cond === 'showers' || m.cond === 'drizzle') return n ? 'rain-n' : 'rain-d';
    if (m.cond === 'mist') return n ? 'mist-n' : 'mist-d';
    if (m.cond === 'cloudy') return n ? 'cloud-n' : 'cloud-d';
    if (m.cond === 'partly') return n ? 'partly-n' : 'partly-d';
    return n ? 'clear-n' : 'clear-d';
  }
  function Sky(el) {
    const canvas = h('canvas.wx-fx');
    const layers = h('div.wx-layers');
    el.append(canvas, layers);
    let kind = null, raf = null, parts = [], last = 0, running = false;
    function setup(m) {
      const k = skyClass(m) + (m.cond === 'drizzle' ? '-dz' : '');
      if (k === kind) return;
      kind = k;
      el.className = 'wx-bg ' + skyClass(m);
      layers.innerHTML = '';
      const cloudy = /cloud|partly|mist|rain|snow|storm/.test(kind);
      if (cloudy) for (let i = 0; i < (kind.startsWith('partly') ? 3 : 5); i++) layers.appendChild(h('div.wx-cloud', { style: { top: (8 + i * 9) + '%', animationDuration: (60 + i * 17) + 's', animationDelay: (-i * 13) + 's', opacity: String(kind.startsWith('partly') ? 0.5 : 0.7) } }));
      if (kind.startsWith('mist')) for (let i = 0; i < 4; i++) layers.appendChild(h('div.wx-fog', { style: { top: (30 + i * 14) + '%', animationDuration: (40 + i * 11) + 's', animationDelay: (-i * 9) + 's' } }));
      if (kind.startsWith('clear-d') || kind.startsWith('partly-d')) layers.appendChild(h('div.wx-sunglow'));
      const W = 402, H = (JC.os && JC.os.H) || 874;
      canvas.width = W; canvas.height = H;
      parts = [];
      if (kind.startsWith('snow')) {
        for (let i = 0; i < 120; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2.4, v: 30 + Math.random() * 50, p: Math.random() * 6.28 });
      } else if (kind.startsWith('rain') || kind.startsWith('storm')) {
        const n = kind.endsWith('-dz') ? 60 : kind.startsWith('storm') ? 320 : 150;
        for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 16, v: 520 + Math.random() * 380, a: 0.18 + Math.random() * 0.3 });
      } else if (kind === 'clear-n' || kind === 'partly-n' || kind === 'cloud-n') {
        const n = kind === 'clear-n' ? 110 : 40;
        for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: Math.random() * H * 0.6, r: Math.random() * 1.3 + 0.3, p: Math.random() * 6.28, f: 0.6 + Math.random() * 1.8 });
      }
      draw(0);
    }
    function draw(dt) {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (kind && kind.startsWith('snow')) {
        const tt = performance.now() / 1000;
        parts.forEach((p) => {
          p.y += p.v * dt; p.x += Math.sin(tt + p.p) * 12 * dt;
          if (p.y > H) { p.y = -4; p.x = Math.random() * W; }
          ctx.fillStyle = 'rgba(255,255,255,.85)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        });
      } else if (kind && (kind.startsWith('rain') || kind.startsWith('storm'))) {
        ctx.lineCap = 'round';
        if (kind.startsWith('storm') && Math.random() < 0.006) { el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 140); }
        parts.forEach((p) => {
          p.y += p.v * dt * (kind.startsWith('storm') ? 1.6 : 1); p.x -= p.v * dt * (kind.startsWith('storm') ? 0.45 : 0.12);
          if (p.y > H) { p.y = -p.l; p.x = Math.random() * (W + 60); }
          ctx.strokeStyle = `rgba(210,225,245,${p.a})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.l * 0.12, p.y + p.l); ctx.stroke();
        });
      } else if (parts.length) {
        const t = performance.now() / 1000;
        parts.forEach((p) => {
          const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.f + p.p));
          ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
        });
      }
    }
    function loop(ts) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }
    return {
      set: setup,
      start() { if (running || reduce()) { el.classList.toggle('still', !!reduce()); return; } running = true; last = 0; el.classList.remove('still'); raf = requestAnimationFrame(loop); },
      stop() { running = false; cancelAnimationFrame(raf); el.classList.add('still'); },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'weather',
    name: 'Weather',
    status: 'light',
    launch(win, intent0) {
      win.body.classList.add('app-weather');
      const root = h('div.wx');
      const pager = h('div.wx-pager');
      const dots = h('div.wx-dots');
      const bar = h('div.wx-bar',
        h('div.wx-barbtn', { onTap: () => mapSheet(cur()) }, JC.icon('wx.map', { size: 22 })),
        dots,
        h('div.wx-barbtn', { onTap: () => showList() }, JC.icon('wx.list', { size: 22 })));
      const listLayer = h('div.wx-listlayer', { hidden: true });
      root.append(pager, bar, listLayer);
      win.body.appendChild(root);
      let idx = 0;
      let pages = [];
      let visible = true;
      const cities = () => JC.store.all('wxcities');
      const cur = () => (cities()[idx] || cities()[0] || { id: 'liyue' }).id;

      function build() {
        pages.forEach((p) => p.sky.stop());
        pager.innerHTML = '';
        pages = cities().map((c, i) => cityPage(c, i));
        pages.forEach((p) => pager.appendChild(p.el));
        idx = Math.min(idx, pages.length - 1);
        go(idx, true);
      }
      function cityPage(c, i, preview) {
        const bg = h('div.wx-bg');
        const sky = Sky(bg);
        const scroll = h('div.wx-scroll.scroll');
        const compact = h('div.wx-compact');
        const el = h('div.wx-page', bg, scroll, compact);
        const p = { el, sky, scroll, id: c.id, render };
        scroll.addEventListener('scroll', () => {
          const y = scroll.scrollTop;
          el.classList.toggle('scrolled', y > 150);
          const head = scroll.querySelector('.wx-head');
          if (head) { head.style.opacity = String(Math.max(0, 1 - y / 160)); head.style.transform = `translateY(${Math.min(60, y * 0.35)}px)`; }
        }, { passive: true });
        function render() {
          const now = localNow(c.id);
          const m = metrics(c.id, now);
          const cl = climate(c.id);
          sky.set(m);
          const today = dayOf(c.id, dayIdx(now));
          compact.innerHTML = '';
          compact.append(h('span.wx-c-name', cl.name), h('span.wx-c-sep', ' | '), h('span', deg(m.temp) + ' ' + NAMES[m.cond]));
          const st = scroll.scrollTop;
          const hs = scroll.querySelector('.wx-hours');
          const hx = hs ? hs.scrollLeft : 0;
          scroll.innerHTML = '';
          scroll.append(
            h('div.wx-head',
              h('div.wx-city', c.current ? 'My Location' : cl.name),
              c.current ? h('div.wx-myloc', JC.icon('wx.loc', { size: 10 }), h('span', cl.name.toUpperCase())) : null,
              c.current ? null : h('div.wx-localtime', U.fmtTime(now) + (cl.tz !== 8 ? ' · ' + (cl.tz - 8 > 0 ? '+' : '') + (cl.tz - 8) + 'h' : '')),
              h('div.wx-temp', deg(m.temp)),
              h('div.wx-cond', NAMES[m.cond]),
              h('div.wx-hl', 'H:' + deg(today.hi) + '  L:' + deg(today.lo))),
            hourlyCard(c.id, now),
            tenDayCard(c.id, now, m),
            precipCard(c.id, now),
            h('div.wx-grid',
              smallCard(c.id, 'uv', 'ph.brightness', 'UV INDEX', h('div', h('div.wx-big', String(m.uv)), h('div.wx-mid', uvWord(m.uv)), h('div.wx-uvbar', h('i', { style: { left: Math.min(100, m.uv * 9) + '%' } })), h('div.wx-small', m.night ? 'Low for the rest of the night.' : m.uv >= 3 ? 'Use sun protection until 4 PM.' : 'Low for the rest of the day.'))),
              smallCard(c.id, 'sun', 'wx.sunset', m.night ? 'SUNRISE' : 'SUNSET', sunCard(c.id, now, m)),
              smallCard(c.id, 'wind', 'wx.wind', 'WIND', windCard(m)),
              smallCard(c.id, 'precip', 'wx.drop', 'PRECIPITATION', h('div', h('div.wx-big', precipPast(c.id, now) + ' mm'), h('div.wx-mid', 'in last 24h'), h('div.wx-small', precipNext(c.id, now) + ' mm expected in next 24h.'))),
              smallCard(c.id, 'feels', 'wx.thermo', 'FEELS LIKE', h('div', h('div.wx-big', deg(m.feels)), h('div.wx-small', m.wind > 8 ? 'Wind is making it feel cooler.' : 'Similar to the actual temperature.'))),
              smallCard(c.id, 'hum', 'wx.drop', 'HUMIDITY', h('div', h('div.wx-big', m.hum + '%'), h('div.wx-small', 'The dew point is ' + deg(m.dew) + ' right now.'))),
              smallCard(c.id, 'vis', 'wx.eye', 'VISIBILITY', h('div', h('div.wx-big', (m.vis < 1 ? m.vis.toFixed(1) : Math.round(m.vis)) + ' km'), h('div.wx-small', m.cond === 'mist' ? 'Mist is reducing visibility.' : /rain|drizzle|showers/.test(m.cond) ? 'Light rain is affecting visibility.' : 'Perfectly clear view.'))),
              smallCard(c.id, 'pres', 'wx.gauge', 'PRESSURE', pressCard(m))),
            aqiCard(c.id, m),
            h('div.wx-foot', h('div', 'Weather for ' + cl.name + ', ' + cl.region), h('div.wx-foot-l', { onTap: () => JC.os.open('safari', { search: 'weather data sources' }) }, 'Learn more about weather data'), h('div.wx-foot-l', { onTap: () => mapSheet(c.id) }, 'Open in Maps · Precipitation')),
          );
          scroll.scrollTop = st;
          const hs2 = scroll.querySelector('.wx-hours');
          if (hs2 && hx) hs2.scrollLeft = hx;
        }
        render();
        return p;
      }
      function uvWord(v) { return v <= 2 ? 'Low' : v <= 5 ? 'Moderate' : v <= 7 ? 'High' : 'Very High'; }
      function smallCard(cid, key, icon, title, body) {
        return h('div.wx-card.sm', { onTap: () => detailSheet(cid, key) }, h('div.wx-ch', JC.icon(icon, { size: 13, weight: 2 }), h('span', title)), body);
      }
      function hourlyCard(cid, now) {
        const c = climate(cid);
        const strip = h('div.wx-hours.hscroll');
        const t0 = Math.floor(now / HR) * HR;
        const sr = hm(c.sun[0]), ss = hm(c.sun[1]);
        for (let i = 0; i < 25; i++) {
          const t = t0 + i * HR;
          const hr = new Date(t).getHours();
          const night = isNight(cid, t + 30 * 60e3);
          strip.appendChild(h('div.wx-hour', h('div.wx-h-t', i === 0 ? 'Now' : U.fmtTime(t).replace(':00', '').replace(' ', '')), popAt(cid, t) >= 30 ? h('div.wx-h-pop', popAt(cid, t) + '%') : h('div.wx-h-pop.blank'), wxIcon(condAt(cid, t), 26, night), h('div.wx-h-v', deg(i === 0 ? tempAt(cid, now) : tempAt(cid, t)))));
          [[sr, 'Sunrise', 'sunrise'], [ss, 'Sunset', 'sunset']].forEach(([x, label]) => {
            if (Math.floor(x) === hr && i > 0) {
              const tt = new Date(t); tt.setMinutes(Math.round((x % 1) * 60));
              strip.appendChild(h('div.wx-hour.sun', h('div.wx-h-t', U.fmtTime(tt.getTime()).replace(' ', '')), h('div.wx-h-pop.blank'), h('span.wx-ic.sunic', JC.icon('wx.sunset', { size: 24 })), h('div.wx-h-v', label)));
            }
          });
        }
        const sum = (c.summary && c.summary[dayIdx(now)]) || (NAMES[condAt(cid, now)] + ' conditions will continue for the rest of the ' + (isNight(cid, now) ? 'night' : 'day') + '.');
        return h('div.wx-card', { onTap: (e) => { if (!e.target.closest('.wx-hours')) detailSheet(cid, 'temp'); } }, h('div.wx-sum', sum), h('div.wx-sep'), strip);
      }
      function tenDayCard(cid, now, m) {
        const di = dayIdx(now);
        const days = [];
        for (let i = 0; i < 10; i++) days.push(Object.assign({ i: di + i }, dayOf(cid, di + i)));
        const min = Math.min(...days.map((d) => d.lo)), max = Math.max(...days.map((d) => d.hi));
        const span = Math.max(1, max - min);
        const rows = days.map((d, k) => {
          const t = DAY0 + d.i * 864e5;
          const name = k === 0 ? 'Today' : U.DAYS[new Date(t).getDay()].slice(0, 3);
          const fill = h('div.wx-rfill', { style: { left: ((d.lo - min) / span * 100) + '%', right: ((max - d.hi) / span * 100) + '%', background: grad(d.lo, d.hi) } });
          const track = h('div.wx-rtrack', fill, k === 0 ? h('i.wx-rnow', { style: { left: U.clamp((m.temp - min) / span * 100, 0, 100) + '%' } }) : null);
          return h('div.wx-drow', { onTap: () => detailSheet(cid, 'temp', d.i) },
            h('div.wx-dname', name),
            h('div.wx-dicon', wxIcon(d.c === 'sunny' ? 'sunny' : d.c, 24), d.pop >= 30 ? h('span.wx-dpop', d.pop + '%') : null),
            h('div.wx-dlo', deg(d.lo)), track, h('div.wx-dhi', deg(d.hi)));
        });
        return h('div.wx-card', h('div.wx-ch', JC.icon('wx.cal', { size: 13, weight: 2 }), h('span', '10-DAY FORECAST')), rows);
      }
      function grad(lo, hi) {
        const col = (t) => (t <= 5 ? '#5ac8fa' : t <= 12 ? '#64d2c8' : t <= 17 ? '#a5d86b' : t <= 22 ? '#ffd60a' : t <= 27 ? '#ff9f0a' : '#ff6b3d');
        return `linear-gradient(90deg, ${col(lo)}, ${col((lo + hi) / 2)}, ${col(hi)})`;
      }
      function precipPast(cid, now) { let s = 0; for (let i = 1; i <= 24; i++) s += mmAt(cid, now - i * HR); return Math.round(s); }
      function precipNext(cid, now) { let s = 0; for (let i = 0; i < 24; i++) s += mmAt(cid, now + i * HR); return Math.round(s); }
      function precipCard(cid, now) {
        return h('div.wx-card.map', { onTap: () => mapSheet(cid) }, h('div.wx-ch', JC.icon('wx.umbrella', { size: 13, weight: 2 }), h('span', 'PRECIPITATION')), radarEl(cid, true));
      }
      function radarEl(cid, mini) {
        const c = climate(cid);
        const wet = /rain|drizzle|showers|snow|storm/.test(condAt(cid, localNow(cid)));
        const el = h('div.wx-radar' + (mini ? '.mini' : ''), { html: `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice"><rect width="400" height="260" class="wxm-sea"/><path class="wxm-land" d="M0 0h400v180c-30 10-60 40-90 50-50 18-110 10-160 30H0z"/><path class="wxm-park" d="M40 60c20-14 50-10 58 8 6 16-10 30-30 30-22 0-40-22-28-38zM300 40c18-8 40 0 40 16s-22 24-38 18c-14-6-16-26-2-34z"/><path class="wxm-river" d="M0 120C60 110 90 130 120 150"/><path class="wxm-lake" d="M120 150c30-20 80-24 110-4 20 14 16 40-10 52-30 14-80 10-100-8-14-14-12-30 0-40z"/><path class="wxm-road" d="M30 40 C120 70 200 90 260 150 M260 150 C300 190 340 210 400 220 M150 0 C160 60 180 120 170 160 M220 0 C230 40 250 70 300 90 C340 104 370 100 400 96"/><path class="wxm-road2" d="M0 90 C60 92 110 84 150 70 M260 150 C250 110 280 70 330 60 M60 160 C90 170 110 190 120 230"/><g class="wxm-lbl"><text x="64" y="84">${c.region === 'Liyue' || /marine/.test(c.region) ? 'Jueyun Karst' : 'Park'}</text><text x="320" y="62">Hills</text><text x="175" y="178">${/marine/.test(c.region) ? 'Guyun' : 'Bay'}</text></g></svg>` });
        const blobs = h('div.wx-blobs', { class: { dry: !wet } });
        if (wet) for (let i = 0; i < 6; i++) blobs.appendChild(h('i', { style: { left: (10 + i * 15) + '%', top: (15 + (i % 3) * 22) + '%', animationDelay: (-i * 1.7) + 's' } }));
        el.append(blobs, h('div.wx-pin', h('span', deg(tempAt(cid, localNow(cid))))), h('div.wx-pinname', c.name));
        return el;
      }
      function sunCard(cid, now, m) {
        const c = climate(cid);
        const sr = c.sun[0], ss = c.sun[1];
        const morning = m.night; // after sunset the card counts down to tomorrow's sunrise
        const t = (s) => { const [a, b] = s.split(':').map(Number); return U.fmtTime(new Date(2026, 9, 16, a, b).getTime()); };
        const d = new Date(now);
        const x = d.getHours() + d.getMinutes() / 60;
        const k = U.clamp((x - hm(sr)) / (hm(ss) - hm(sr)), -0.2, 1.2);
        const cx = 10 + k * 140, cy = 50 - Math.sin(Math.max(0, Math.min(1, k)) * Math.PI) * 34;
        return h('div', h('div.wx-big', morning ? t(sr) : t(ss)),
          h('div.wx-suncurve', { html: `<svg viewBox="0 0 160 60"><path d="M0 50 Q 80 -18 160 50" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2"/><path d="M0 46H160" stroke="rgba(255,255,255,.3)" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="5" fill="${m.night ? 'rgba(255,255,255,.5)' : '#fff'}"/></svg>` }),
          h('div.wx-small', (morning ? 'Sunset: ' + t(ss) : 'Sunrise: ' + t(sr))));
      }
      function windCard(m) {
        const comp = h('div.wx-compass', { html: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="7" stroke-dasharray="1 3.6"/><text x="50" y="13" text-anchor="middle">N</text><text x="91" y="54" text-anchor="middle">E</text><text x="50" y="96" text-anchor="middle">S</text><text x="9" y="54" text-anchor="middle">W</text><g transform="rotate(${m.deg + 180} 50 50)"><path d="M50 12 L50 88" stroke="#fff" stroke-width="2.4"/><path d="M44 22 50 10 56 22" fill="#fff"/><circle cx="50" cy="88" r="3.5" fill="#fff"/></g><circle cx="50" cy="50" r="19" fill="rgba(0,0,0,.35)"/></svg>` }, h('div.wx-wv', h('b', String(m.wind)), h('span', 'km/h')));
        return h('div.wx-windwrap', comp, h('div.wx-small', 'Gusts ' + m.gust + ' km/h · ' + m.dir));
      }
      function pressCard(m) {
        const a = U.clamp((m.pres - 980) / 60, 0, 1) * 270 - 135;
        return h('div.wx-presswrap', h('div.wx-gauge', { html: `<svg viewBox="0 0 100 100"><path d="M18 78 A40 40 0 1 1 82 78" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 3.2"/><g transform="rotate(${a} 50 50)"><path d="M50 16v12" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></g></svg>` }, h('div.wx-pv', h('b', String(m.pres)), h('span', 'hPa'))), h('div.wx-small', m.pres < 1012 ? 'Falling — rain nearby.' : 'Steady.'));
      }
      function aqiCard(cid, m) {
        const v = m.aqi;
        const word = v <= 50 ? 'Good' : v <= 100 ? 'Moderate' : 'Unhealthy for Sensitive Groups';
        return h('div.wx-card', { onTap: () => detailSheet(cid, 'aqi') }, h('div.wx-ch', JC.icon('wx.aqi', { size: 13, weight: 2 }), h('span', 'AIR QUALITY')),
          h('div.wx-aqi', h('div.wx-big', String(v)), h('div.wx-mid', word)),
          h('div.wx-aqibar', h('i', { style: { left: Math.min(100, v / 3) + '%' } })),
          h('div.wx-small', 'Air quality index is ' + v + ', which is ' + (v <= 50 ? 'similar to' : 'worse than') + ' yesterday at about this time.'));
      }

      // ── pager ─────────────────────────────────────────────────────────────
      function go(i, instant) {
        idx = U.clamp(i, 0, Math.max(0, pages.length - 1));
        pager.style.transition = instant ? 'none' : 'transform .45s var(--ease)';
        pager.style.transform = `translateX(${-idx * 402}px)`;
        pages.forEach((p, k) => { if (k === idx && visible) p.sky.start(); else p.sky.stop(); });
        try { JC.story.act('weather_view', { id: cur() }); } catch (e) { /* ignore */ }
        dots.innerHTML = '';
        cities().forEach((c, k) => dots.appendChild(k === 0 && c.current ? h('span.wx-dot.loc', { class: { on: k === idx }, onTap: () => go(k) }, JC.icon('wx.loc', { size: 9 })) : h('span.wx-dot', { class: { on: k === idx }, onTap: () => go(k) })));
      }
      U.drag(pager, {
        axis: 'x',
        filter: (e) => !e.target.closest('.wx-hours, .wx-svgwrap, .wx-bar'),
        start: () => { pager.style.transition = 'none'; },
        move: (e, p) => { let dx = p.dx; if ((idx === 0 && dx > 0) || (idx === pages.length - 1 && dx < 0)) dx /= 3; pager.style.transform = `translateX(${-idx * 402 + dx}px)`; },
        end: (e, p) => { if (p.dx < -60 || p.vx < -0.4) go(idx + 1); else if (p.dx > 60 || p.vx > 0.4) go(idx - 1); else go(idx); },
      });

      // ── list view ────────────────────────────────────────────────────────
      let editing = false;
      let q = '';
      function showList() {
        listLayer.hidden = false;
        renderList();
        U.anim(listLayer, [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 320 });
        pages.forEach((p) => p.sky.stop());
      }
      function hideList(to) {
        if (to != null) go(to, true);
        U.anim(listLayer, [{ opacity: 1 }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 240 }).then(() => { listLayer.hidden = true; });
        q = '';
        JC.kb.hide();
        go(idx, true);
      }
      function renderList() {
        listLayer.innerHTML = '';
        const search = ui.search({ placeholder: 'Search for a city or airport', onInput: (v) => { q = v; renderResults(); } });
        const results = h('div.wx-results');
        const cards = h('div.wx-cards');
        listLayer.append(
          h('div.wx-lnav', h('div.wx-ltitle', 'Weather'), editing ? ui.navBtn({ text: 'Done', prominent: true, onTap: () => { editing = false; renderList(); } }) : ui.navBtn({ icon: 'ellipsis', onTap: (e) => listMenu(e.currentTarget) })),
          h('div.wx-lsearch', search), results, cards);
        cities().forEach((c, k) => {
          const now = localNow(c.id);
          const m = metrics(c.id, now);
          const cl = climate(c.id);
          const d = dayOf(c.id, dayIdx(now));
          const card = h('div.wx-lcard', { class: skyClass(m), onTap: () => { if (!editing) hideList(k); } },
            h('div.wx-lc-l', h('div.wx-lc-n', c.current ? 'My Location' : cl.name), h('div.wx-lc-s', c.current ? cl.name : U.fmtTime(now)), h('div.wx-lc-c', NAMES[m.cond])),
            h('div.wx-lc-r', h('div.wx-lc-t', deg(m.temp)), h('div.wx-lc-hl', 'H:' + deg(d.hi) + ' L:' + deg(d.lo))),
            editing && !c.current ? h('div.wx-lc-del', { onTap: (e) => { e.stopPropagation(); JC.store.remove('wxcities', c.id); renderList(); build(); } }, JC.icon('minus.circle.fill', { size: 26 })) : null,
            editing && !c.current ? h('div.wx-lc-handle', JC.icon('line.3.horizontal', { size: 22 })) : null);
          if (!c.current && !editing) U.drag(card, { axis: 'x', move: (e, p) => { card.style.transform = `translateX(${Math.min(0, p.dx)}px)`; }, end: (e, p) => { card.style.transform = ''; if (p.dx < -90) ui.actionSheet({ title: 'Remove ' + cl.name + '?', actions: [{ text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('wxcities', c.id); renderList(); build(); } }] }); } });
          if (editing && !c.current) {
            const hd = card.querySelector('.wx-lc-handle');
            U.drag(hd, {
              axis: 'y',
              start: () => { card.classList.add('lifting'); },
              move: (e, p) => {
                card.style.transform = `translateY(${p.dy}px) scale(1.03)`;
                const els = [...cards.children];
                const from = els.indexOf(card);
                const to = U.clamp(from + Math.round(p.dy / 130), 1, els.length - 1);
                els.forEach((el, k) => {
                  if (el === card) return;
                  const sh = from < to && k > from && k <= to ? -130 : from > to && k >= to && k < from ? 130 : 0;
                  el.style.transition = 'transform .22s var(--ease)';
                  el.style.transform = sh ? `translateY(${sh}px)` : '';
                });
              },
              end: (e, p) => {
                const arr = cities().slice();
                const from = arr.findIndex((x) => x.id === c.id);
                const to = U.clamp(from + Math.round(p.dy / 130), 1, arr.length - 1);
                const [it] = arr.splice(from, 1);
                arr.splice(to, 0, it);
                [...cards.children].forEach((el) => { el.style.transform = ''; });
                card.classList.remove('lifting');
                if (to !== from) { JC.store.set('wxcities', arr); renderList(); build(); }
              },
            });
          }
          cards.appendChild(card);
        });
        function renderResults() {
          results.innerHTML = '';
          cards.hidden = !!q.trim();
          if (!q.trim()) return;
          const s = q.toLowerCase();
          const have = cities().map((c) => c.id);
          const all = Object.keys(CLIMATE).map((id) => [id, CLIMATE[id].name, CLIMATE[id].region]).concat(MORE.map((m) => [m[0], m[1], m[2]]));
          const seen = new Set();
          const res = all.filter(([id, n, r]) => { if (seen.has(id)) return false; seen.add(id); return (n + ' ' + r).toLowerCase().includes(s); });
          if (!res.length) { results.appendChild(h('div.wx-nores', 'No results for “' + q + '”')); return; }
          results.appendChild(ui.list([{ rows: res.map(([id, n, r]) => ({ title: n, subtitle: r, detail: have.includes(id) ? 'Added' : '', onTap: () => preview(id) })) }], { style: 'plain', cls: 'wx-reslist' }));
        }
      }
      function listMenu(anchor) {
        const unit = prefs().unit;
        ui.menu(anchor, [
          { text: editing ? 'Done' : 'Edit List', icon: 'pencil', onTap: () => { editing = !editing; renderList(); } },
          { text: 'Notifications', icon: 'bell', onTap: () => ui.alert({ title: 'Weather Notifications', message: 'Severe weather and next-hour precipitation alerts for My Location are on.' + (stormAt('liyue', JC.time.now()) ? '\n\n⚠️ RED WARNING: abnormal sea surge from Guyun. Move away from the waterfront.' : '\n\nNext hour: clear and calm in Liyue Harbor.'), buttons: [{ text: 'OK' }] }) },
          '-',
          { text: 'Celsius', sub: '°C', checked: unit === 'C', onTap: () => { JC.state.set('apx_weather', Object.assign(prefs(), { unit: 'C' })); renderList(); build(); } },
          { text: 'Fahrenheit', sub: '°F', checked: unit === 'F', onTap: () => { JC.state.set('apx_weather', Object.assign(prefs(), { unit: 'F' })); renderList(); build(); } },
          '-',
          { text: 'Units', icon: 'slider.horizontal.3', onTap: () => ui.alert({ title: 'Units', message: 'Wind: km/h · Precipitation: mm · Pressure: hPa · Distance: km', buttons: [{ text: 'OK' }] }) },
          { text: 'Report an Issue', icon: 'exclamationmark.triangle.fill', onTap: () => ui.actionSheet({ title: 'What’s wrong with the weather in ' + climate(cur()).name + '?', actions: [{ text: 'It’s raining', onTap: () => ui.toast(condAt(cur(), JC.time.now()) === 'storm' ? 'Thanks. (It is. A lot.)' : 'Thanks. (It isn’t.)') }, { text: 'It’s foggy', onTap: () => ui.toast('Thanks for your report') }, { text: 'It’s clear', onTap: () => ui.toast('Thanks for your report') }] }) },
        ]);
      }
      function preview(id) {
        climate(id);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        JC.kb.hide();
        const page = cityPage({ id }, 0, true);
        page.el.classList.add('preview');
        const s = ui.sheet({
          detent: 'large', cls: 'wx-prevsheet', left: { text: 'Cancel' },
          right: cities().find((c) => c.id === id) ? null : { text: 'Add', onTap: () => { JC.store.add('wxcities', { id }); build(); renderList(); ui.toast(climate(id).name + ' added', { icon: 'plus' }); } },
          onClose: () => page.sky.stop(),
          content: () => [page.el],
        });
        void s;
        page.sky.start();
      }

      // ── sheets: precipitation map & chart details ────────────────────────
      function mapSheet(cid) {
        let hour = 0, playing = null;
        const lbl = h('div.wx-maplbl', 'Now');
        const radar = radarEl(cid, false);
        const slider = ui.slider({ value: 0, min: 0, max: 12, step: 1, onInput: (v) => setH(v) });
        const play = h('div.wx-play', { onTap: () => toggle() }, JC.icon('play.fill', { size: 18 }));
        function setH(v) {
          hour = Math.round(v);
          slider.set(hour);
          const t = localNow(cid) + hour * HR;
          lbl.textContent = hour === 0 ? 'Now' : U.fmtTime(t);
          const wet = /rain|drizzle|showers/.test(condAt(cid, t));
          radar.querySelector('.wx-blobs').classList.toggle('dry', !wet);
          radar.querySelector('.wx-blobs').style.transform = `translateX(${-hour * 12}px)`;
        }
        function toggle() {
          if (playing) { clearInterval(playing); playing = null; play.innerHTML = ''; play.appendChild(JC.icon('play.fill', { size: 18 })); return; }
          play.innerHTML = ''; play.appendChild(JC.icon('pause.fill', { size: 18 }));
          playing = setInterval(() => setH((hour + 1) % 13), 700);
        }
        ui.sheet({
          title: 'Precipitation', detent: 'large', cls: 'wx-mapsheet', right: { text: 'Done' }, onClose: () => clearInterval(playing),
          content: () => [h('div.wx-mapwrap', radar), h('div.wx-mapctrl', play, h('div.wx-mapsl', slider), lbl),
            h('div.wx-maplegend', h('span', 'Light'), h('i'), h('span', 'Heavy')),
            ui.list([{ rows: [{ title: 'Open in Maps', icon: { glyph: 'map.fill', bg: 'var(--green)' }, chevron: true, onTap: () => { const pl = { liyue: 'pier7', guyun: 'guyun', morepesok: 'morepesok', zapolyarny: 'zapolyarny', qingce: 'qingce', wangshu: 'wangshu', stonegate: 'stonegate', mingyun: 'mingyun', chasm: 'chasm' }[cid]; JC.os.open('maps', pl ? { place: pl } : { search: climate(cid).name }); } }] }])],
        });
      }
      const METRIC = {
        temp: { title: 'Conditions', unit: '°', f: (cid, t) => Tf(tempAt(cid, t)), color: 'var(--orange)', kind: 'line', sum: (cid, i) => { const d = dayOf(cid, i); return 'High ' + deg(d.hi) + ', low ' + deg(d.lo) + '. ' + NAMES[d.c] + (d.pop ? ', ' + d.pop + '% chance of precipitation.' : '.'); } },
        uv: { title: 'UV Index', unit: '', f: (cid, t) => metrics(cid, t).uv, color: 'var(--yellow)', kind: 'bar', sum: () => 'The UV index peaks around 1 PM. Low at night — obviously.' },
        wind: { title: 'Wind', unit: ' km/h', f: (cid, t) => metrics(cid, t).wind + (Math.sin(new Date(t).getHours() / 3) * 2), color: 'var(--teal)', kind: 'line', sum: (cid) => 'Wind from the ' + climate(cid).wind[2] + '. Gusts up to ' + climate(cid).wind[1] + ' km/h.' },
        precip: { title: 'Precipitation', unit: ' mm', f: (cid, t) => mmAt(cid, t), color: 'var(--blue)', kind: 'bar', sum: (cid, i) => (dayOf(cid, i).pop ? dayOf(cid, i).pop + '% chance of precipitation.' : 'No precipitation expected.') },
        feels: { title: 'Feels Like', unit: '°', f: (cid, t) => Tf(metrics(cid, t).feels), color: 'var(--orange)', kind: 'line', sum: () => 'Wind and humidity make it feel slightly cooler than the actual temperature.' },
        hum: { title: 'Humidity', unit: '%', f: (cid, t) => metrics(cid, t).hum, color: 'var(--cyan)', kind: 'line', sum: () => 'Humid by the sea, as always.' },
        vis: { title: 'Visibility', unit: ' km', f: (cid, t) => metrics(cid, t).vis, color: 'var(--mint)', kind: 'line', sum: (cid) => (cid === 'guyun' ? 'Sea mist around the pillars keeps visibility low after dark.' : 'Visibility is good across the harbor.') },
        pres: { title: 'Pressure', unit: ' hPa', f: (cid, t) => metrics(cid, t).pres, color: 'var(--indigo)', kind: 'line', sum: () => 'Pressure is steady.' },
        sun: { title: 'Sunrise & Sunset', unit: '°', f: (cid, t) => { const c = climate(cid); const d = new Date(t); const x = d.getHours() + d.getMinutes() / 60; const k = (x - hm(c.sun[0])) / (hm(c.sun[1]) - hm(c.sun[0])); return Math.round(Math.sin(k * Math.PI) * 52); }, color: 'var(--yellow)', kind: 'line', sum: (cid) => 'Sunrise ' + climate(cid).sun[0] + ' · Sunset ' + climate(cid).sun[1] + '. Daylight: about 11 hr 17 min.', axisLabel: 'sun altitude' },
        aqi: { title: 'Air Quality', unit: '', f: (cid, t) => Math.round(climate(cid).aqi + Math.sin(new Date(t).getHours() / 2.5) * 6), color: 'var(--green)', kind: 'line', sum: (cid) => (climate(cid).aqi <= 50 ? 'Good. The sea breeze keeps the air clean.' : 'Moderate. Unusually sensitive people should consider reducing prolonged outdoor exertion.') },
      };
      function detailSheet(cid, key, dayI) {
        const M = METRIC[key] || METRIC.temp;
        let di = dayI != null ? dayI : dayIdx(localNow(cid));
        ui.sheet({
          title: M.title, detent: 'large', cls: 'wx-detail', right: { text: 'Done' },
          content: (sh) => {
            const base = dayIdx(localNow(cid));
            const strip = h('div.wx-dstrip', Array.from({ length: 10 }, (_, k) => {
              const i = base + k;
              const t = DAY0 + i * 864e5;
              return h('div.wx-dd', { class: { on: i === di }, onTap: () => { di = i; sh.render(); } }, h('div.wx-dd-w', 'SMTWTFS'[new Date(t).getDay()]), h('div.wx-dd-n', String(new Date(t).getDate())));
            }));
            const d0 = DAY0 + di * 864e5;
            const pts = Array.from({ length: 25 }, (_, i) => ({ t: d0 + i * HR, v: M.f(cid, d0 + i * HR) }));
            const title = h('div.wx-dtitle', U.fmtDate(d0, 'full'));
            return [strip, title, chart(pts, M, cid, di === dayIdx(localNow(cid))), h('div.wx-dsum', h('div.wx-dsum-k', 'Daily Summary'), h('div', M.sum(cid, di))),
              h('div.wx-dtable', pts.filter((_, i) => i % 3 === 0).slice(0, 8).map((p) => h('div.wx-dtr', h('span', U.fmtTime(p.t)), h('span', fmtV(p.v, M)))))];
          },
        });
      }
      function fmtV(v, M) { return (M.unit === ' km' || M.unit === ' mm' ? (Math.round(v * 10) / 10) : Math.round(v)) + M.unit; }
      function chart(pts, M, cid, isToday) {
        const W = 370, H = 210, P = { l: 8, r: 40, t: 34, b: 24 };
        const vals = pts.map((p) => p.v);
        let lo = Math.min(...vals), hi = Math.max(...vals);
        if (M.kind === 'bar') { lo = 0; hi = Math.max(hi * 1.15, M.unit === ' mm' ? 1 : 3); }
        else if (hi - lo < 4) { const mid = (hi + lo) / 2; hi = mid + 2; lo = mid - 2; }
        const step = niceStep((hi - lo) / 4);
        lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
        const x = (i) => P.l + (i / (pts.length - 1)) * (W - P.l - P.r);
        const y = (v) => P.t + (1 - (v - lo) / (hi - lo || 1)) * (H - P.t - P.b);
        let grid = '';
        for (let v = lo; v <= hi + 1e-6; v += step) grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" class="wxc-grid"/><text x="${W - P.r + 6}" y="${y(v) + 4}" class="wxc-ax">${Math.round(v * 10) / 10}</text>`;
        [0, 6, 12, 18, 24].forEach((i) => { grid += `<text x="${x(i)}" y="${H - 6}" class="wxc-ax" text-anchor="${i === 0 ? 'start' : i === 24 ? 'end' : 'middle'}">${i === 24 ? '' : ['12AM', '6AM', '12PM', '6PM'][i / 6]}</text>`; });
        let marks = '';
        if (M.kind === 'bar') {
          const bw = Math.min(10, (W - P.l - P.r) / pts.length - 2);
          pts.forEach((p, i) => { if (p.v <= 0) return; const yy = y(p.v), hh = y(lo) - yy; marks += `<path class="wxc-bar" d="M${x(i) - bw / 2} ${y(lo)}V${yy + 3}q0-3 3-3h${bw - 6}q3 0 3 3V${y(lo)}z"/>`; });
        } else {
          const d = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join(' ');
          marks += `<path class="wxc-area" d="${d} L${x(pts.length - 1)} ${y(lo)} L${x(0)} ${y(lo)} Z"/><path class="wxc-line" d="${d}"/>`;
        }
        const svg = `<svg viewBox="0 0 ${W} ${H}" class="wxc" style="--c:${M.color}">${grid}${marks}</svg>`;
        const read = h('div.wx-read', h('b'), h('span'));
        const cross = h('div.wx-cross', { hidden: true });
        const dot = h('div.wx-cdot', { hidden: true });
        const wrap = h('div.wx-chart', read, h('div.wx-svgwrap', { html: svg }), cross, dot);
        const show = (i) => {
          const p = pts[i];
          read.firstChild.textContent = fmtV(p.v, M);
          read.lastChild.textContent = '  ' + U.fmtTime(p.t);
          cross.hidden = false; dot.hidden = false;
          cross.style.left = (x(i) / W * 100) + '%';
          dot.style.left = (x(i) / W * 100) + '%';
          dot.style.top = (y(p.v) / H * 100) + '%';
        };
        const nowI = isToday ? new Date(localNow(cid)).getHours() : 12;
        show(nowI);
        const svgWrap = wrap.querySelector('.wx-svgwrap');
        const pick = (e) => { const r = svgWrap.getBoundingClientRect(); const fx = (e.clientX - r.left) / r.width * W; const i = U.clamp(Math.round((fx - P.l) / (W - P.l - P.r) * (pts.length - 1)), 0, pts.length - 1); show(i); };
        svgWrap.addEventListener('pointermove', pick);
        svgWrap.addEventListener('pointerdown', pick);
        svgWrap.addEventListener('pointerleave', () => show(nowI));
        svgWrap.__tap = true;
        return wrap;
      }
      function niceStep(s) { const p = Math.pow(10, Math.floor(Math.log10(Math.max(s, 0.01)))); const n = s / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }

      const offC = JC.store.on('wxcities', () => { build(); if (!listLayer.hidden) renderList(); });
      const onMin = () => { if (visible) pages.forEach((p) => p.render()); };
      JC.bus.on('minute', onMin);
      build();

      function handle(it) {
        if (!it) return;
        if (it.city) {
          const s = String(it.city).toLowerCase().replace(/\s+/g, '');
          let k = cities().findIndex((c) => c.id === s || climate(c.id).name.toLowerCase().replace(/\s+/g, '') === s);
          if (k < 0 && (CLIMATE[s] || MORE.find((m) => m[0] === s))) { preview(s); return; }
          if (!listLayer.hidden) hideList(Math.max(0, k)); else go(Math.max(0, k));
        }
        if (it.list) showList();
      }
      if (intent0) setTimeout(() => handle(intent0), 0);
      return {
        intent: handle,
        show() { visible = true; pages.forEach((p) => p.render()); go(idx, true); },
        hide() { visible = false; pages.forEach((p) => p.sky.stop()); },
        back() { if (!listLayer.hidden) { hideList(); return true; } return false; },
        destroy() { offC(); JC.bus.off('minute', onMin); pages.forEach((p) => p.sky.stop()); },
      };
    },
  });
})();
