/* Stocks — iOS 26 Stocks: watchlist with sparklines & change pills, search to add, edit (reorder/remove),
   detail sheet with an interactive chart (1D–5Y, drag to scrub), stats and fictional business news that
   reacts to story flags. All companies are fictional (Lanling Stock Exchange). */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;

  function hash(str) { let x = 2166136261; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rnd(key) { let a = hash(key); return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function gauss(R) { return Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(2 * Math.PI * R()); }

  // ── universe ─────────────────────────────────────────────────────
  // price = today's close; chg = today's % change; vol = daily volatility; drift5y = total 5-year return factor
  const SYMS = [
    { s: 'YMCI', name: 'Yunmeng Composite', idx: true, price: 3287.41, chg: 0.62, vol: 0.009, drift5y: 1.32, about: 'The Yunmeng Composite tracks the 180 largest companies listed in Yunmeng and Lanling.' },
    { s: 'YMJ', name: 'Yunmeng Jiang Group', price: 186.40, chg: 1.79, vol: 0.014, drift5y: 2.9, pe: 18.4, mcap: 412.6, eps: 10.13, yld: 1.2, beta: 0.86, sector: 'Logistics & Food', about: 'Yunmeng Jiang Group (YMJ) operates shipping, cold-chain logistics and lotus-farm foods from its headquarters at Lotus Pier, Yunmeng. CEO: Jiang Cheng.', events: [[-1180, 0.82], [-640, 1.12], [-12, 1.04]] },
    { s: 'KOI', name: 'Jin Group', price: 92.15, chg: -0.84, vol: 0.016, drift5y: 0.74, pe: 22.1, mcap: 288.3, eps: 4.17, yld: 2.4, beta: 1.08, sector: 'Conglomerate', about: 'Jin Group is a Lanling conglomerate (property, hospitality, entertainment) headquartered at Koi Tower. Heir apparent: Jin Ling.', events: [[-575, 0.71], [-420, 1.08]] },
    { s: 'NIE', name: 'Nie Corp', price: 47.88, chg: 0.21, vol: 0.008, drift5y: 1.41, pe: 15.2, mcap: 96.4, eps: 3.15, yld: 3.1, beta: 0.62, sector: 'Industrials', about: 'Nie Corp is a Qinghe industrial group with a small, inexplicably profitable hand-painted fan division. Chairman: Nie Huaisang.' },
    { s: 'GUSU', name: 'Gusu Lan Education', price: 61.30, chg: 2.94, vol: 0.011, drift5y: 1.08, pe: 26.8, mcap: 54.2, eps: 2.29, yld: 1.8, beta: 0.71, sector: 'Education', about: 'Gusu Lan Education runs Gusu Lan Academy (the Cloud Recesses campus) and its summer programs. Chancellor: Lan Xichen.', events: [[-280, 0.84], [-15, 1.16]] },
    { s: 'RADSH', name: 'Yiling Radish Co.', price: 0.42, chg: 31.25, vol: 0.07, drift5y: 2.2, pe: null, mcap: 0.031, eps: -0.02, yld: 0, beta: 2.9, sector: 'Agriculture', about: 'Yiling Radish Co. grows radishes on Burial Mounds hill and runs a weekend market stall. Founder: Wei Wuxian. Listed on the LSE Growth Board in 2024 “as a joke”.', young: 560 },
    { s: 'WAVE', name: 'Wavelet Inc.', price: 142.70, chg: -1.12, vol: 0.02, drift5y: 1.9, pe: 41.3, mcap: 198.0, eps: 3.46, yld: 0, beta: 1.4, sector: 'Social Media', about: 'Wavelet is a social app for photos, gossip and #BalconyGate.' },
    { s: 'SWFT', name: 'Swift Ride Holdings', price: 23.42, chg: 0.47, vol: 0.017, drift5y: 0.9, pe: 33.0, mcap: 41.7, eps: 0.71, yld: 0, beta: 1.2, sector: 'Transport', about: 'Swift Ride runs ride-hailing across Lanling and Yunmeng. Lost items can be reported in the app.' },
    { s: 'LTEA', name: 'Cloud Recesses Tea Co.', price: 18.95, chg: 0.32, vol: 0.01, drift5y: 1.25, pe: 19.9, mcap: 6.4, eps: 0.95, yld: 2.2, beta: 0.5, sector: 'Consumer', about: 'Tea from the Cloud Recesses estate. Their white peony is a bestseller in Yunmeng, oddly.' },
    { s: 'GPHT', name: 'Golden Peony Hotels', price: 33.10, chg: -0.24, vol: 0.012, drift5y: 1.1, pe: 24.6, mcap: 12.8, eps: 1.35, yld: 1.4, beta: 0.9, sector: 'Hospitality', about: 'Golden Peony Hotels operates luxury hotels in Lanling.' },
    { s: 'LEAT', name: 'Lotus Eats Ltd.', price: 12.06, chg: 1.35, vol: 0.022, drift5y: 0.8, pe: 58.1, mcap: 9.1, eps: 0.21, yld: 0, beta: 1.5, sector: 'Food Delivery', about: 'Food delivery across Yunmeng, Lanling and Gusu.' },
    { s: 'PETK', name: 'Pet Kingdom', price: 7.82, chg: 0.51, vol: 0.015, drift5y: 1.3, pe: 21.2, mcap: 2.1, eps: 0.37, yld: 1.1, beta: 0.7, sector: 'Retail', about: 'Pet supplies. Sells a lot of 20 kg dog food bags to one customer in Lanling.' },
    { s: 'KOIR', name: 'Koi Records', price: 9.40, chg: 3.08, vol: 0.025, drift5y: 1.6, pe: 29.7, mcap: 3.3, eps: 0.32, yld: 0, beta: 1.3, sector: 'Entertainment', about: 'Record label behind Koi Pond Boys and Peony & the Golden Carp. A Jin Group subsidiary.' },
    { s: 'WEN', name: 'Wen Corp', price: 0, chg: 0, vol: 0, delisted: true, about: 'Wen Corp was delisted in 2009 following the collapse of its holding company.' },
  ];
  const BY = {};
  SYMS.forEach((x) => { BY[x.s] = x; });

  JC.store.seed('stockwatch', [{ id: 'w', list: ['YMCI', 'YMJ', 'KOI', 'NIE', 'GUSU', 'RADSH'], mode: 'pct' }]);
  const watch = () => JC.store.get('stockwatch', 'w') || { list: [], mode: 'pct' };
  const flag = (f) => !!(JC.story && JC.story.flag && JC.story.flag(f));
  const redUp = () => !!((JC.state.d.settings.prefs || {})['stk.redup']);
  const upC = () => (redUp() ? 'var(--red)' : 'var(--green)');
  const downC = () => (redUp() ? 'var(--green)' : 'var(--red)');
  const colorFor = (v) => (v >= 0 ? upC() : downC());

  // ── price history ────────────────────────────────────────────────
  const TODAY = new Date(2026, 9, 16);
  const cache = {};
  /** ~1300 trading-day closes ending at today's close (index last = today) */
  function daily(sym) {
    if (cache[sym]) return cache[sym];
    const x = BY[sym];
    const n = x.young || 1300;
    const R = rnd('d:' + sym);
    const out = new Array(n);
    // walk backwards from today's close
    let p = x.price;
    const prevClose = x.price / (1 + x.chg / 100);
    out[n - 1] = x.price;
    out[n - 2] = prevClose;
    p = prevClose;
    const drift = Math.log(x.drift5y || 1) / 1300;
    const ev = {};
    (x.events || []).forEach(([d, f]) => { ev[n - 1 + d] = f; });
    for (let i = n - 3; i >= 0; i--) {
      let r = drift + gauss(R) * x.vol;
      if (ev[i + 1]) r += Math.log(ev[i + 1]);
      p = p / Math.exp(r);
      if (sym === 'RADSH') p = Math.max(0.05, p);
      out[i] = p;
    }
    cache[sym] = out;
    return out;
  }
  /** trading dates going back from today (weekdays only) */
  function tradingDate(k) { // k trading days before today
    const d = new Date(TODAY);
    let left = k;
    while (left > 0) { d.setDate(d.getDate() - 1); if (d.getDay() !== 0 && d.getDay() !== 6) left--; }
    return d;
  }
  function intraday(sym, dayKey, open, close, steps) {
    const x = BY[sym];
    const R = rnd('i:' + sym + ':' + dayKey);
    const pts = [open];
    let p = open;
    for (let i = 1; i < steps; i++) {
      const left = steps - i;
      const pull = (close - p) / left;
      p = p + pull + gauss(R) * x.vol * open * 0.18;
      if (sym === 'RADSH' && dayKey === 0 && i === Math.round(steps * 0.78)) p *= 1.18; // the livestream
      pts.push(p);
    }
    pts[steps - 1] = close;
    return pts;
  }
  const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'];
  function series(sym, range) {
    const x = BY[sym];
    const d = daily(sym);
    const n = d.length;
    if (range === '1D') {
      const prev = d[n - 2];
      const open = prev * (1 + gauss(rnd('o:' + sym)) * x.vol * 0.3);
      const vals = intraday(sym, 0, open, d[n - 1], 121);
      const pts = vals.map((v, i) => { const m = i * 2; const hh = m < 120 ? 9 * 60 + 30 + m : 13 * 60 + (m - 120); return { v, label: String(Math.floor(hh / 60)).padStart(2, '0') + ':' + String(hh % 60).padStart(2, '0') }; });
      const xLabels = [['10:00', 15], ['11:00', 45], ['13:00', 60], ['14:00', 90], ['15:00', 120]].map(([t, i]) => ({ i, text: t.replace(':00', '') }));
      return { pts, base: prev, xLabels };
    }
    if (range === '1W') {
      const pts = [];
      for (let k = 4; k >= 0; k--) {
        const close = d[n - 1 - k], open = d[n - 2 - k];
        const date = tradingDate(k);
        intraday(sym, k + 100, open, close, 16).forEach((v, i) => pts.push({ v, label: U.DAYS[date.getDay()].slice(0, 3) + ' ' + (i < 8 ? (9 + Math.floor((30 + i * 15) / 60)) + ':' + String((30 + i * 15) % 60).padStart(2, '0') : (13 + Math.floor((i - 8) * 15 / 60)) + ':' + String(((i - 8) * 15) % 60).padStart(2, '0')) }));
      }
      return { pts, base: d[n - 6], xLabels: [0, 1, 2, 3, 4].map((k) => ({ i: k * 16 + 8, text: U.DAYS[tradingDate(4 - k).getDay()].slice(0, 1) })) };
    }
    const len = { '1M': 22, '3M': 64, '6M': 127, '1Y': 252, '5Y': 1300 }[range];
    const start = Math.max(0, n - len);
    const step = range === '5Y' ? 5 : 1;
    const pts = [];
    for (let i = start; i < n; i += step) {
      const k = n - 1 - i;
      const date = tradingDate(k);
      pts.push({ v: d[i], label: U.fmtDate(date, range === '5Y' || range === '1Y' ? 'medium' : 'md'), date });
    }
    if (pts[pts.length - 1].v !== d[n - 1]) pts.push({ v: d[n - 1], label: 'Oct 16', date: TODAY });
    const xLabels = [];
    let last = null;
    pts.forEach((p, i) => {
      const key = range === '5Y' ? p.date.getFullYear() : range === '1M' ? (p.date.getDay() === 1 ? p.date.getDate() : null) : p.date.getMonth();
      if (key != null && key !== last && i > 2 && i < pts.length - 2) { xLabels.push({ i, text: range === '5Y' ? String(key) : range === '1M' ? String(key) : U.MONTHS[key].slice(0, 3) }); }
      if (key != null) last = key;
    });
    return { pts, base: d[start], xLabels: range === '1Y' ? xLabels.filter((v, k) => k % 2 === 0) : xLabels };
  }
  function quote(sym) {
    const x = BY[sym];
    if (x.delisted) return { price: 0, chg: 0, pct: 0, delisted: true };
    const d = daily(sym);
    const n = d.length;
    const prev = d[n - 2];
    let after = null;
    if (sym === 'KOI' && (flag('car_cover') || flag('car_handled'))) after = flag('car_cover') ? -3.4 : -2.1;
    if (sym === 'GUSU' && flag('tea_yes')) after = 1.8;
    if (sym === 'RADSH' && (flag('wwx_invited') || flag('memo_sent'))) after = 12.0;
    if (sym === 'PETK' && flag('dog_friday')) after = 4.0;
    if (sym === 'YMJ' && flag('ops_soup')) after = 0.6;
    if (sym === 'LTEA' && flag('tea_yes')) after = 2.6;
    return { price: d[n - 1], prev, chg: d[n - 1] - prev, pct: ((d[n - 1] - prev) / prev) * 100, after, afterPrice: after != null ? d[n - 1] * (1 + after / 100) : null };
  }
  const dp = (sym) => (BY[sym].price < 1 ? 3 : 2);
  const curOn = () => !!((JC.state.d.settings.prefs || {})['stk.cur']);
  const fmtP = (sym, v) => (curOn() && !BY[sym].idx ? '¥' : '') + v.toLocaleString('en-US', { minimumFractionDigits: dp(sym), maximumFractionDigits: dp(sym) });
  const fmtPct = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '%';
  const fmtChg = (sym, v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(dp(sym));
  const fmtCap = (b) => (b == null ? '—' : b >= 1 ? '¥' + b.toFixed(1) + 'B' : '¥' + Math.round(b * 1000) + 'M');

  // ── news ─────────────────────────────────────────────────────────
  function news() {
    const N = [];
    const t = (s) => JC.time.parse(s);
    if (flag('car_cover') || flag('car_handled')) N.push({ id: 'n_car', sym: 'KOI', t: JC.time.now() - 12 * 60e3, src: 'Lanling Evening Post', art: 'p_koi_pond_car', title: flag('car_cover') ? '#KoiPondGate: Jin Group heir’s car found in Koi Tower pond; family declines to comment' : 'Jin Group heir’s car found in Koi Tower pond; nobody hurt, koi “unbothered”', body: [flag('car_cover') ? 'A dark purple sedan registered to Yunmeng Jiang Group was found partially submerged in the famous koi pond outside Koi Tower shortly after midnight, hours after the Jin Group’s Autumn Charity Gala. A Jin Group spokesperson blamed “a valet incident”. The valet says he has never seen the car before.' : 'A dark purple sedan was towed from the koi pond outside Koi Tower in the early hours of Saturday. Witnesses described a very large black dog sitting calmly on the roof during the operation.', 'Jin Group shares slipped in after-hours trading on the Lanling Stock Exchange. “It is not the first time something has ended up in that pond,” one analyst noted. “It is the first time it was a car.”', 'Lotus Pier declined to comment. A source close to the family said only: “He is fine. The koi are fine. The car is not fine.”'] });
    if (flag('tea_yes')) N.push({ id: 'n_tea', sym: 'LTEA', t: JC.time.now() - 25 * 60e3, src: 'Gusu Herald', art: 'p_tea_hanshi', title: 'White peony futures spike on “unusual demand from a single buyer in Yunmeng”', body: ['Cloud Recesses Tea Co. reported an overnight surge in orders for its white peony blend. The tea, brewed at exactly 85°C, is a favourite of Gusu Lan Education’s chancellor.', 'Analysts also noted a modest after-hours rise in Gusu Lan Education shares, citing what one called “cross-river synergies”. Asked to elaborate, she smiled and said nothing further.'] });
    if (flag('ops_soup')) N.push({ id: 'n_soup', sym: 'YMJ', t: JC.time.now() - 40 * 60e3, src: 'Yunmeng Evening News', art: 'p_ops_lotusroots', title: 'YMJ turns a 400 kg lotus root mix-up into company-wide soup day', body: ['A typo turned an order of 40 kg of lotus root into 400 kg at Yunmeng Jiang Group this week. Instead of returning it, the company is reportedly making lotus root and pork rib soup for every employee.', '“Visionary,” said one logistics analyst. “Or a very large pot.”'] });
    if (flag('dog_friday')) N.push({ id: 'n_dog', sym: 'PETK', t: JC.time.now() - 55 * 60e3, src: 'Lanling Financial Daily', art: 'p_dogfriday_poster', title: 'YMJ approves “Bring Your Dog to Work Friday”; Pet Kingdom rises 4%', body: ['Yunmeng Jiang Group will allow employees to bring dogs to its Lotus Pier offices on Fridays, according to an internal poster seen by this newspaper. The policy was proposed by operations manager Liu Qian.', 'Pet Kingdom shares rose in after-hours trading. One investor called it “the most bullish poster I have ever seen”.'] });
    if (flag('wwx_invited') || flag('memo_sent')) N.push({ id: 'n_rad2', sym: 'RADSH', t: JC.time.now() - 30 * 60e3, src: 'Lanling Financial Daily', art: 'p_radish_cake', title: 'Yiling Radish Co. rallies on rumours of a Lotus Pier “partnership”', body: ['Shares of the tiny radish grower jumped again after its founder posted a photo of a soup pot with the caption “sunday 🙏”.', 'Yunmeng Jiang Group did not respond to questions about a supply deal. Yiling Radish Co. did not respond either, because its investor relations department is also its founder, and he was “busy crying a little”.'] });
    N.push(
      { id: 'n_gala', sym: 'KOI', t: t('+0 22:30'), src: 'Lanling Evening Post', art: 'p_gala_hall', title: 'Jin Group’s Autumn Charity Gala raises ¥38 million at Koi Tower', body: ['The Jin Group’s annual gala at Koi Tower raised ¥38 million for children’s hospitals across Lanling. Guests included Gusu Lan Education chancellor Lan Xichen, Nie Corp chairman Nie Huaisang and Yunmeng Jiang Group chief Jiang Cheng, who was seated — unusually — at the head table.', 'Heir apparent Jin Ling, who turns 18 on Sunday, gave a brief speech and was seen leaving early with “a very large dog”.', 'A seating chart obtained by this newspaper appears to have been changed by hand on the morning of the event.'] },
      { id: 'n_ymj', sym: 'YMJ', t: t('+0 16:05'), src: 'Lanling Financial Daily', art: 'p_lotus_pond_day', title: 'Yunmeng Jiang Group posts record third quarter as lotus exports surge', body: ['Yunmeng Jiang Group reported its strongest quarter since listing, with revenue up 14% on growth in cold-chain shipping and lotus-farm foods.', 'Chief executive Jiang Cheng declined to join the earnings call. A written statement read: “The numbers speak for themselves.”', 'Shares closed up 1.8%. Analysts at three brokerages raised their targets; a fourth said it “would not dare”.'] },
      { id: 'n_gusu', sym: 'GUSU', t: t('+0 11:20'), src: 'Gusu Herald', art: 'p_cloud_recesses', title: 'Gusu Lan Education climbs as Chancellor Lan Xichen returns to public life', body: ['Shares of Gusu Lan Education rose nearly 3% after the academy confirmed that Chancellor Lan Xichen will attend tonight’s Jin Group gala — his first public appearance since stepping back last year.', 'Board chair Lan Qiren said in a statement that the academy’s 3,000 rules “remain in force, and are not up for discussion”.'] },
      { id: 'n_radsh', sym: 'RADSH', t: t('+0 14:41'), src: 'Lanling Financial Daily', art: 'p_radishes', title: 'Yiling Radish Co. jumps 31% after founder’s livestream features a “mystery guest” on guqin', body: ['Yiling Radish Co., the smallest company on the Lanling Growth Board, soared after its founder hosted a livestream from his farm in which an unnamed guest played the guqin for forty minutes without speaking.', 'Trading was halted twice. The company’s market value is now roughly the price of a nice car.', '“Radish futures are extremely volatile,” said one analyst. “I don’t know why I’m covering them.”'] },
      { id: 'n_nie', sym: 'NIE', t: t('-1 09:30'), src: 'Qinghe Business Weekly', art: null, title: 'Nie Corp chairman on record fan sales: “I don’t know, I don’t know!”', body: ['Nie Corp’s hand-painted fan division posted another record quarter. Asked how a hobby brand outsold the group’s steel division in Lanling, chairman Nie Huaisang said he did not know.', 'People familiar with the company say he knows exactly.'] },
      { id: 'n_idx', sym: 'YMCI', t: t('+0 15:10'), src: 'Lanling Financial Daily', art: null, title: 'Yunmeng Composite closes higher for a third straight session', body: ['The Yunmeng Composite rose 0.6% on Friday, led by logistics and education stocks. Volume was light ahead of the weekend.'] },
      { id: 'n_wave', sym: 'WAVE', t: t('+0 23:39'), src: 'Lanling Evening Post', art: 'p_shot_gossip', title: '#BalconyGate trends on Wavelet after anonymous gossip account posts gala photo', body: ['An anonymous Wavelet account, @teaspiller_qh, posted a photo from the Koi Tower balcony with the caption “#BalconyGate 👀”. It has been shared 41,000 times.', 'Wavelet declined to identify the account. The account declined to identify itself, adding “hehe~”.'] },
    );
    return N.sort((a, b) => b.t - a.t);
  }
  function ago(t) { const m = Math.round((JC.time.now() - t) / 60e3); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; if (m < 60 * 24) return Math.round(m / 60) + 'h ago'; return Math.round(m / 1440) + 'd ago'; }

  // ════════════════════════════════════════════════════════════════
  JC.app({
    id: 'stocks',
    name: 'Stocks',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-stocks');
      const offs = [];
      let q = '';
      let nav;
      function spark(sym) {
        const s = series(sym, '1D');
        const qq = quote(sym);
        const w = 64, hh = 30;
        const vs = s.pts.map((p) => p.v);
        const lo = Math.min(...vs, s.base), hi = Math.max(...vs, s.base);
        const X = (i) => (i / (vs.length - 1)) * w, Y = (v) => hh - 2 - ((v - lo) / (hi - lo || 1)) * (hh - 4);
        const path = vs.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ',' + Y(v).toFixed(1)).join('');
        const c = colorFor(qq.pct);
        const el = h('div.stk-spark');
        el.innerHTML = `<svg viewBox="0 0 ${w} ${hh}" width="${w}" height="${hh}"><line x1="0" x2="${w}" y1="${Y(s.base)}" y2="${Y(s.base)}" class="stk-base"/><path d="${path}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
        return el;
      }
      function pill(sym) {
        const qq = quote(sym);
        const mode = watch().mode;
        const txt = qq.delisted ? 'Delisted' : mode === 'pct' ? fmtPct(qq.pct) : mode === 'chg' ? fmtChg(sym, qq.chg) : fmtCap(BY[sym].mcap);
        return h('div.stk-pill', { style: { background: qq.delisted ? 'var(--gray)' : mode === 'cap' ? 'var(--gray)' : colorFor(qq.pct) }, onTap: (e) => { e.stopPropagation(); const order = ['pct', 'chg', 'cap']; JC.store.update('stockwatch', 'w', { mode: order[(order.indexOf(mode) + 1) % 3] }); JC.audio.haptic(6); } }, txt);
      }
      function row(sym, opts) {
        const x = BY[sym];
        const qq = quote(sym);
        opts = opts || {};
        const r = h('div.stk-row', { onTap: () => openDetail(sym) },
          h('div.stk-row-l', h('div.stk-sym', sym), h('div.stk-name', x.name)),
          qq.delisted ? null : spark(sym),
          h('div.stk-row-r', h('div.stk-price', qq.delisted ? '—' : fmtP(sym, qq.price)), pill(sym)));
        JC.ui.contextMenu(r, () => ({ items: [
          { text: 'Open', icon: 'chart.line.uptrend.xyaxis', onTap: () => openDetail(sym) },
          { text: 'Share', icon: 'square.and.arrow.up', onTap: () => shareSym(sym) },
          '-',
          { text: 'Remove from Watchlist', icon: 'trash', destructive: true, onTap: () => removeSym(sym) },
        ] }));
        return r;
      }
      function removeSym(sym) { JC.store.update('stockwatch', 'w', { list: watch().list.filter((x) => x !== sym) }); JC.ui.toast('Removed ' + sym, { icon: 'minus.circle' }); }
      function addSym(sym) { if (!watch().list.includes(sym)) JC.store.update('stockwatch', 'w', { list: watch().list.concat(sym) }); JC.ui.toast('Added ' + sym + ' to My Symbols', { icon: 'checkmark' }); }
      function shareSym(sym) {
        const qq = quote(sym);
        JC.ui.share({ title: BY[sym].name + ' (' + sym + ')', subtitle: qq.delisted ? 'Delisted' : fmtP(sym, qq.price) + ' · ' + fmtPct(qq.pct), payload: { kind: 'link', text: sym + ' ' + (qq.delisted ? 'delisted' : fmtP(sym, qq.price) + ' (' + fmtPct(qq.pct) + ')'), url: 'https://stocks.apple.com/symbol/' + sym } });
      }
      function newsCard(n, big) {
        return h('div.stk-news', { class: { big }, onTap: () => openArticle(n) },
          h('div.stk-news-m', h('div.stk-news-src', n.src), h('div.stk-news-t', n.title), h('div.stk-news-time', ago(n.t) + (n.sym ? ' · ' + n.sym : ''))),
          n.art ? JC.art.el(n.art, { cls: 'stk-news-art' }) : null);
      }
      function mainPage() {
        const page = JC.ui.page({
          title: 'Stocks', large: true, bg: 'plain', tint: 'var(--blue)',
          largeRight: h('div.stk-date', U.MONTHS[JC.time.date().getMonth()] + ' ' + JC.time.date().getDate()),
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => menu(e.currentTarget) })],
          search: { placeholder: 'Search', onInput: (v) => { q = v.trim().toLowerCase(); page.render(); }, onCancel: () => { q = ''; page.render(); } },
          content: () => {
            if (q) {
              const hits = SYMS.filter((x) => (x.s + ' ' + x.name).toLowerCase().includes(q));
              if (!hits.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Try a symbol like YMJ or KOI.' })];
              return [h('div.stk-sh', 'Symbols'), h('div.stk-results', hits.map((x) => {
                const inW = watch().list.includes(x.s);
                return h('div.stk-res', { onTap: () => openDetail(x.s) }, h('div.stk-row-l', h('div.stk-sym', x.s), h('div.stk-name', x.name + (x.delisted ? ' · Delisted' : ' · LSE'))),
                  h('div.stk-add', { class: { on: inW }, onTap: (e) => { e.stopPropagation(); if (inW) removeSym(x.s); else addSym(x.s); } }, JC.icon(inW ? 'checkmark' : 'plus', { size: 16, weight: 2.6 })));
              }))];
            }
            const list = watch().list;
            const ns = news();
            return [
              h('div.stk-sh', h('span', 'My Symbols'), h('span.stk-sh-r.tap', { onTap: () => editSheet() }, 'Edit')),
              list.length ? h('div.stk-list', list.map((s) => row(s))) : JC.ui.empty({ icon: 'chart.line.uptrend.xyaxis', title: 'No Symbols', text: 'Search to add symbols to your watchlist.' }),
              h('div.stk-market', JC.icon('clock', { size: 13 }), ' Lanling Stock Exchange · Closed · prices at 15:00 close'),
              h('div.stk-news-h', h('div.stk-news-k', 'Top Stories'), h('div.stk-news-sub', 'From Lanling Financial Daily and partners')),
              ns.length ? newsCard(ns[0], true) : null,
              h('div.stk-newslist', ns.slice(1).map((n) => newsCard(n))),
              h('div.stk-foot', 'Quotes are delayed. Every company here is fictional. Even the radishes.'),
            ];
          },
        });
        return page;
      }
      function menu(anchor) {
        const w = watch();
        JC.ui.menu(anchor, [
          { text: 'Edit Watchlist', icon: 'pencil', onTap: () => editSheet() },
          '-',
          { text: 'Show Percentage Change', checked: w.mode === 'pct', onTap: () => JC.store.update('stockwatch', 'w', { mode: 'pct' }) },
          { text: 'Show Price Change', checked: w.mode === 'chg', onTap: () => JC.store.update('stockwatch', 'w', { mode: 'chg' }) },
          { text: 'Show Market Cap', checked: w.mode === 'cap', onTap: () => JC.store.update('stockwatch', 'w', { mode: 'cap' }) },
          '-',
          { text: 'Sort by Change', icon: 'arrow.up.arrow.down', onTap: () => { const l = watch().list.slice().sort((a, b) => quote(b).pct - quote(a).pct); JC.store.update('stockwatch', 'w', { list: l }); } },
          { text: 'Sort by Name', icon: 'textformat', onTap: () => { const l = watch().list.slice().sort((a, b) => a.localeCompare(b)); JC.store.update('stockwatch', 'w', { list: l }); } },
        ]);
      }
      function editSheet() {
        const sh = JC.ui.sheet({
          title: 'My Symbols', detent: 'large', right: { text: 'Done' },
          content: (s) => {
            const list = h('div.stk-edit');
            watch().list.forEach((sym, i) => {
              const handle = h('div.stk-handle', JC.icon('line.3.horizontal', { size: 20 }));
              const r = h('div.stk-erow',
                h('div.stk-minus', { onTap: () => { removeSym(sym); s.render(); } }, JC.icon('minus.circle.fill', { size: 22 })),
                h('div.stk-row-l', h('div.stk-sym', sym), h('div.stk-name', BY[sym].name)), handle);
              reorder(handle, r, list, (from, to) => { const l = watch().list.slice(); const [x] = l.splice(from, 1); l.splice(to, 0, x); JC.store.update('stockwatch', 'w', { list: l }); s.render(); });
              list.appendChild(r);
            });
            return [h('div.stk-edit-note', 'Drag to reorder. Tap ⊖ to remove.'), list, h('div.stk-addmore.tap', { onTap: () => { sh.close(); setTimeout(() => { const inp = nav.top().el.querySelector('.page-search input'); if (inp) inp.focus(); }, 350); } }, JC.icon('plus', { size: 16, weight: 2.4 }), 'Add Symbols')];
          },
        });
      }
      function reorder(handle, row, list, done) {
        handle.__tap = true;
        handle.addEventListener('pointerdown', (e) => {
          e.preventDefault(); e.stopPropagation();
          const rows = Array.from(list.children);
          const from = rows.indexOf(row);
          const sc = (JC.os && JC.os.scale) || 1;
          const rh = row.getBoundingClientRect().height / sc;
          const y0 = e.clientY;
          let to = from;
          row.classList.add('stk-drag');
          const mv = (ev) => {
            const dy = (ev.clientY - y0) / sc;
            row.style.transform = `translateY(${dy}px)`;
            to = U.clamp(from + Math.round(dy / rh), 0, rows.length - 1);
            rows.forEach((r, k) => { if (r === row) return; let sh = 0; if (from < to && k > from && k <= to) sh = -rh; if (from > to && k < from && k >= to) sh = rh; r.style.transform = sh ? `translateY(${sh}px)` : ''; });
          };
          const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); rows.forEach((r) => { r.style.transform = ''; }); row.classList.remove('stk-drag'); if (to !== from) { JC.audio.haptic(8); done(from, to); } };
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', up);
        });
      }

      // ── detail sheet ──────────────────────────────────────────────
      let range = '1D';
      function openDetail(sym) {
        const x = BY[sym];
        if (!x) return;
        JC.kb.hide();
        const sh = JC.ui.sheet({
          title: '', detent: 'large', cls: 'stk-sheet', noHead: false,
          left: { icon: 'xmark' },
          right: { icon: watch().list.includes(sym) ? 'checkmark' : 'plus', bold: false, onTap: () => { if (watch().list.includes(sym)) removeSym(sym); else addSym(sym); return false; } },
          content: (s) => renderDetail(sym, s),
        });
        offsDetail.push(JC.bus.on('store:stockwatch', () => { if (!sh.closed) { const b = sh.head.querySelector('.sheet-right .navbtn'); if (b) { b.innerHTML = ''; b.appendChild(JC.icon(watch().list.includes(sym) ? 'checkmark' : 'plus', { size: 19, weight: 2 })); } } }));
        return sh;
      }
      const offsDetail = [];
      function renderDetail(sym, sheet) {
        const x = BY[sym];
        const qq = quote(sym);
        if (qq.delisted) {
          return [h('div.stk-dh', h('div.stk-dsym', sym), h('div.stk-dname', x.name)), JC.ui.empty({ icon: 'exclamationmark.triangle.fill', title: 'Delisted', text: x.about + ' Its last trade was on November 2, 2009.' })];
        }
        const ser = series(sym, range);
        const vs = ser.pts.map((p) => p.v);
        const first = range === '1D' ? ser.base : vs[0];
        const last = vs[vs.length - 1];
        const chgPeriod = last - first;
        const col = colorFor(chgPeriod);
        const priceEl = h('div.stk-dprice');
        const chgEl = h('div.stk-dchg');
        const whenEl = h('div.stk-dwhen');
        const paint = (i) => {
          if (i == null) {
            priceEl.textContent = fmtP(sym, qq.price);
            chgEl.textContent = (range === '1D' ? fmtChg(sym, qq.chg) + ' (' + fmtPct(qq.pct) + ')' : fmtChg(sym, chgPeriod) + ' (' + fmtPct((chgPeriod / first) * 100) + ') ' + { '1W': 'past week', '1M': 'past month', '3M': 'past 3 months', '6M': 'past 6 months', '1Y': 'past year', '5Y': 'past 5 years' }[range]);
            chgEl.style.color = range === '1D' ? colorFor(qq.pct) : col;
            whenEl.textContent = 'At Close: Oct 16, 15:00 CST';
          } else {
            const p = ser.pts[i];
            priceEl.textContent = fmtP(sym, p.v);
            const d = p.v - first;
            chgEl.textContent = fmtChg(sym, d) + ' (' + fmtPct((d / first) * 100) + ')';
            chgEl.style.color = colorFor(d);
            whenEl.textContent = p.label;
          }
        };
        paint(null);
        const seg = JC.ui.segmented({ items: RANGES, value: RANGES.indexOf(range), cls: 'stk-seg', onChange: (i) => { range = RANGES[i]; sheet.render(); } });
        const chart = JC.hchart.chart({ kind: 'line', data: ser.pts, color: col, h: 230, w: 362, baseline: range === '1D' ? { v: ser.base } : null, xLabels: ser.xLabels, nTicks: 4, fmtY: (v) => (BY[sym].price < 1 ? v.toFixed(2) : v >= 1000 ? Math.round(v).toLocaleString('en-US') : (Math.round(v * 10) / 10).toString()), onScrub: paint, endDot: range === '1D', label: sym + ' price chart' });
        // stats
        const d1 = series(sym, '1D').pts.map((p) => p.v);
        const y1 = series(sym, '1Y').pts.map((p) => p.v);
        const R = rnd('vol:' + sym);
        const volM = x.idx ? null : (x.mcap * (0.6 + R() * 0.8) * (sym === 'RADSH' ? 900 : 1));
        const stats = [
          ['Open', fmtP(sym, d1[0])], ['High', fmtP(sym, Math.max(...d1))], ['Low', fmtP(sym, Math.min(...d1))],
          ['Vol', volM == null ? '—' : volM.toFixed(1) + 'M'], ['P/E', x.pe ? x.pe.toFixed(1) : '—'], ['Mkt Cap', fmtCap(x.mcap)],
          ['52W H', fmtP(sym, Math.max(...y1))], ['52W L', fmtP(sym, Math.min(...y1))], ['Avg Vol', volM == null ? '—' : (volM * 0.86).toFixed(1) + 'M'],
          ['Yield', x.yld != null ? x.yld.toFixed(2) + '%' : '—'], ['Beta', x.beta != null ? x.beta.toFixed(2) : '—'], ['EPS', x.eps != null ? x.eps.toFixed(2) : '—'],
        ];
        const pages = [stats.slice(0, 6), stats.slice(6, 12)];
        const statsEl = h('div.stk-stats.hscroll', pages.map((pg) => h('div.stk-statpage', pg.map(([k, v]) => h('div.stk-stat', h('span.stk-stat-k', k), h('span.stk-stat-v', v))))));
        const dots = h('div.stk-dots', h('i.on'), h('i'));
        statsEl.addEventListener('scroll', () => { const i = Math.round(statsEl.scrollLeft / statsEl.clientWidth); Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
        const ns = news().filter((n) => n.sym === sym);
        return [
          h('div.stk-dh', h('div.stk-dsym', sym), h('div.stk-dname', x.name + (x.idx ? ' · Index' : ' · LSE · ' + (x.sector || '')))),
          h('div.stk-dq', priceEl, chgEl, whenEl,
            qq.after != null ? h('div.stk-after', 'After Hours: ', h('b', fmtP(sym, qq.afterPrice)), h('span', { style: { color: colorFor(qq.after) } }, ' ' + fmtPct(qq.after))) : null),
          seg,
          h('div.stk-chart', chart),
          statsEl, dots,
          h('div.stk-about', h('div.stk-about-h', 'About ' + x.name), h('div.stk-about-t', x.about)),
          h('div.stk-news-h', h('div.stk-news-k', ns.length ? 'Stories about ' + sym : 'Business News')),
          h('div.stk-newslist', (ns.length ? ns : news().slice(0, 3)).map((n) => newsCard(n))),
          h('div.stk-dbtns',
            h('div.stk-dbtn', { onTap: () => shareSym(sym) }, JC.icon('square.and.arrow.up', { size: 18 }), 'Share'),
            h('div.stk-dbtn', { onTap: () => { if (watch().list.includes(sym)) removeSym(sym); else addSym(sym); sheet.render(); } }, JC.icon(watch().list.includes(sym) ? 'minus.circle' : 'plus', { size: 18 }), watch().list.includes(sym) ? 'Remove' : 'Add to Watchlist')),
        ];
      }
      function openArticle(n) {
        JC.ui.sheet({
          title: '', detent: 'large', left: { icon: 'xmark' },
          right: { icon: 'square.and.arrow.up', bold: false, onTap: () => { JC.ui.share({ title: n.title, subtitle: n.src, art: n.art, payload: { kind: 'link', text: n.title, url: 'https://news.lanling.example/' + n.id } }); return false; } },
          content: () => [h('div.stk-art',
            h('div.stk-art-src', n.src), h('div.stk-art-t', n.title), h('div.stk-art-time', U.fmtDate(n.t, 'long') + ' · ' + U.fmtTime(n.t)),
            n.art ? JC.art.el(n.art, { cls: 'stk-art-img' }) : null,
            n.body.map((p) => h('p', p)),
            n.sym && BY[n.sym] ? h('div.stk-art-sym', { onTap: () => openDetail(n.sym) }, h('div.stk-row-l', h('div.stk-sym', n.sym), h('div.stk-name', BY[n.sym].name)), quote(n.sym).delisted ? null : pill(n.sym)) : null)],
        });
      }

      nav = JC.ui.nav(win.body, () => mainPage());
      offs.push(JC.bus.on('store:stockwatch', () => { const t = nav.top(); if (t) t.render(); }));
      offs.push(JC.bus.on('setting', (e) => { if (e && e.key === 'prefs') { const t = nav.top(); if (t) t.render(); } }));
      return {
        intent(intent) { if (intent && (intent.symbol || intent.id)) setTimeout(() => openDetail(String(intent.symbol || intent.id).toUpperCase()), 50); },
        show() { const t = nav.top(); if (t) t.render(); },
        destroy() { offs.forEach((f) => f()); offsDetail.forEach((f) => f()); },
      };
    },
  });
  JC.stocksData = { SYMS, quote, series };
})();
