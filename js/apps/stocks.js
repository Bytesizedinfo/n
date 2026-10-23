/* Stocks — iOS 26 Stocks: watchlist with sparklines & change pills, search to add, edit (reorder/remove),
   detail sheet with an interactive chart (1D–5Y, drag to scrub), stats and fictional business news that
   reacts to story flags. All companies are fictional (Liyue Exchange, Zapolyarny Exchange). */
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
    { s: 'LYX', name: 'Liyue Exchange Composite', idx: true, price: 6120.38, chg: -0.41, vol: 0.009, drift5y: 1.38, about: 'The Liyue Exchange Composite tracks the 200 largest companies listed on the Liyue Exchange, founded under contract with Rex Lapis. Trading floor: Feiyun Slope.' },
    { s: 'SNZ', name: 'Zapolyarny 50', idx: true, price: 1488.02, chg: 0.33, vol: 0.008, drift5y: 1.21, about: 'The fifty largest companies on the Zapolyarny Exchange, Snezhnaya. Northland Bank Group is its largest component.' },
    { s: 'NBK', name: 'Northland Bank Group', price: 412.60, chg: 1.12, vol: 0.012, drift5y: 2.4, pe: 11.8, mcap: 2410.0, eps: 34.97, yld: 3.4, beta: 0.9, sector: 'Banking', about: 'Northland Bank Group is a Snezhnayan bank with branches across Teyvat and the largest creditor of several nations. Board: eleven executive directors. Liyue Branch Director: Tartaglia.', events: [[-900, 1.2], [-215, 1.14], [-14, 1.05]] },
    { s: 'CRUX', name: 'Crux Shipping Co.', price: 58.25, chg: 2.18, vol: 0.016, drift5y: 1.7, pe: 14.2, mcap: 38.6, eps: 4.1, yld: 2.8, beta: 1.1, sector: 'Shipping', about: 'The Crux Fleet’s commercial arm: cargo, escort and passenger services from Liyue Harbor. Captain: Beidou. Shareholders’ meetings are held on deck.', events: [[-6, 1.04]] },
    { s: 'FCG', name: 'Feiyun Commerce Guild', price: 133.70, chg: 0.58, vol: 0.011, drift5y: 1.55, pe: 21.4, mcap: 96.2, eps: 6.25, yld: 1.9, beta: 0.8, sector: 'Retail & Auctions', about: 'The Feiyun Commerce Guild runs Feiyun Market, Liyue’s largest marketplace and auction house, from Feiyun Slope.' },
    { s: 'WSF', name: 'Wangsheng Funeral Services', price: 77.77, chg: 7.70, vol: 0.02, drift5y: 1.3, pe: 27.7, mcap: 7.7, eps: 2.81, yld: 0.77, beta: 0.4, sector: 'Services', about: 'Liyue’s oldest funeral parlour, entrusted with the Rite of Parting. Director: Hu Tao (77th). Dividend: 0.77%. Of course.', events: [[-15, 1.21]] },
    { s: 'WMG', name: 'Wanmin Go Holdings', price: 24.18, chg: 1.04, vol: 0.022, drift5y: 1.1, pe: 44.0, mcap: 11.9, eps: 0.55, yld: 0, beta: 1.4, sector: 'Food Delivery', about: 'Food delivery across Liyue Harbor, built on Wanmin Restaurant. Head chef and largest shareholder of good ideas: Xiangling.' },
    { s: 'HRD', name: 'Harbor Ride Ltd.', price: 19.42, chg: -0.36, vol: 0.017, drift5y: 0.95, pe: 31.0, mcap: 14.3, eps: 0.63, yld: 0, beta: 1.2, sector: 'Transport', about: 'Ride-hailing and sampan water taxis across Liyue Harbor. Lost items can be reported in the app.' },
    { s: 'RPL', name: 'Ripple Inc.', price: 211.30, chg: -1.48, vol: 0.02, drift5y: 2.1, pe: 52.1, mcap: 320.4, eps: 4.06, yld: 0, beta: 1.5, sector: 'Social Media', about: 'Ripple is a photo and stories app popular across Teyvat. Its most-followed account in Liyue is a funeral parlour.' },
    { s: 'MNT', name: 'Mingyun Toys & Games', price: 16.05, chg: 0.94, vol: 0.015, drift5y: 1.4, pe: 18.0, mcap: 3.1, eps: 0.89, yld: 1.5, beta: 0.7, sector: 'Consumer', about: 'Makers of Glacier Guardians. The Frost Fortress (lights up!) is this season’s bestseller in Snezhnaya, for reasons the company cannot explain.' },
    { s: 'JDC', name: 'Jade Chamber Bonds', idx: true, price: 98.40, chg: -0.12, vol: 0.003, drift5y: 0.98, about: 'Liyue sovereign debt, issued by the Qixing. Largest holder: Northland Bank Group.' },
    { s: 'SLL', name: 'Sea Lantern Logistics', price: 1.06, chg: 18.40, vol: 0.09, drift5y: 1, pe: null, mcap: 0.009, eps: -0.31, yld: 0, beta: 3.2, sector: 'Shipping', young: 16, about: 'Sea Lantern Logistics listed on the Liyue Growth Board three weeks ago. It describes itself as a shipping company. It owns no ships. Its only client is a Northland account.' },
  ];
  const BY = {};
  SYMS.forEach((x) => { BY[x.s] = x; });

  JC.store.seed('stockwatch', [{ id: 'w', list: ['LYX', 'SNZ', 'NBK', 'CRUX', 'FCG', 'WSF', 'MNT'], mode: 'pct' }]);
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
      if (sym === 'SLL') p = Math.max(0.5, p);
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
      if (sym === 'SLL' && dayKey === 0 && i === Math.round(steps * 0.78)) p *= 1.18; // nobody knows why
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
    if (x.delisted || (sym === 'SLL' && (flag('leaked_ning') || flag('leaked_yelan')))) return { price: 0, chg: 0, pct: 0, delisted: true };
    const d = daily(sym);
    const n = d.length;
    const prev = d[n - 2];
    let after = null;
    const now = JC.time.now();
    if (sym === 'NBK' && flag('osial_sent')) after = -11.3;
    else if (sym === 'NBK' && (flag('leaked_ning') || flag('leaked_yelan'))) after = -6.8;
    else if (sym === 'NBK' && flag('card_frozen')) after = -0.4;
    if (sym === 'LYX' && flag('osial_sent')) after = -8.9;
    if (sym === 'JDC' && flag('osial_sent')) after = -4.2;
    if (sym === 'SLL' && flag('osial_sent')) after = 212.0;
    if (sym === 'FCG' && flag('bought_teaset')) after = 1.6;
    if (sym === 'WMG' && Number(JC.story && JC.story.flag && JC.story.flag('paimon_total')) > 3000) after = 3.2;
    if (sym === 'MNT' && flag('gift_teucer')) after = 0.9;
    if (sym === 'WSF' && now >= JC.time.parse('+2 13:00')) after = 4.4;
    if (sym === 'CRUX' && flag('rematch_won')) after = -1.5;
    return { price: d[n - 1], prev, chg: d[n - 1] - prev, pct: ((d[n - 1] - prev) / prev) * 100, after, afterPrice: after != null ? d[n - 1] * (1 + after / 100) : null };
  }
  const dp = (sym) => (BY[sym].price < 1 ? 3 : 2);
  const curOn = () => !!((JC.state.d.settings.prefs || {})['stk.cur']);
  const fmtP = (sym, v) => (curOn() && !BY[sym].idx ? 'ℳ' : '') + v.toLocaleString('en-US', { minimumFractionDigits: dp(sym), maximumFractionDigits: dp(sym) });
  const fmtPct = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '%';
  const fmtChg = (sym, v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(dp(sym));
  const fmtCap = (b) => (b == null ? '—' : b >= 1 ? 'ℳ' + b.toFixed(1) + 'B' : 'ℳ' + Math.round(b * 1000) + 'M');

  // ── news ─────────────────────────────────────────────────────────
  function news() {
    const N = [];
    const t = (s) => JC.time.parse(s);
    const now = JC.time.now();
    if (flag('osial_sent') && now >= t('+2 23:00')) N.push({ id: 'n_flood', sym: 'NBK', t: t('+2 23:20'), src: 'The Liyue Herald', art: 'p_storm_guyun', title: 'Liyue markets halted as sea surges at Guyun; Northland Bank named in leaked operation document', body: ['Trading in Liyue-listed securities was halted overnight after a sea surge struck the waterfront minutes after the founder’s lanterns went out.', 'A document circulating on Ripple names Northland Bank’s Liyue director, Tartaglia, as the sole signatory of an operation called “Osial”. The Bank declined to comment.', 'Sea Lantern Logistics, a three-week-old shipping company with no ships, rose 212% in after-hours trading.'] });
    if (flag('leaked_ning') || flag('leaked_yelan')) N.push({ id: 'n_halt', sym: 'SLL', t: now - 35 * 60e3, src: 'Liyue Exchange', art: 'p_unit3', title: 'Trading in Sea Lantern Logistics suspended at the request of the Jade Chamber', body: ['The Liyue Exchange has suspended trading in Sea Lantern Logistics “pending enquiries by the Office of the Tianquan”.', 'The company, which listed three weeks ago, received ℳ3.8 million in transfers from a single Northland corporate account.', 'Northland Bank Group shares fell in after-hours trading.'] });
    if (flag('bought_teaset')) N.push({ id: 'n_tea', sym: 'FCG', t: now - 25 * 60e3, src: 'The Liyue Herald', art: 'p_teaset', title: 'Guizhong-era tea set sets a Feiyun Market record', body: ['A seven-piece celadon tea set sold just after midnight on Feiyun Market, outbidding “jade_connoisseur_88” in the final minute.', 'Experts read the worn inscription on the pot as “for Morax — G.”'] });
    if (Number(JC.story && JC.story.flag && JC.story.flag('paimon_total')) > 3000) N.push({ id: 'n_paimon', sym: 'WMG', t: now - 15 * 60e3, src: 'Harbor Business', art: 'p_paimon_food', title: 'Wanmin Go raises guidance after “one extraordinary customer” orders the entire menu', body: ['Wanmin Go Holdings said weekend orders were running well ahead of forecast, citing “a single, very small, very hungry customer”.', 'Head chef Xiangling said: “I love her.”'] });
    N.push(
      { id: 'n_rite', sym: 'WSF', t: t('+0 18:40'), src: 'The Liyue Herald', art: 'p_yujing_lanterns', title: 'Wangsheng Funeral Services up 7.7% ahead of the Rite of Parting', body: ['Shares of Liyue’s oldest funeral parlour rose 7.7% on Friday as the city prepared for Sunday’s Rite of Parting on Yujing Terrace.', 'Director Hu Tao told analysts that the Rite would be “the funeral of seventy-seven lifetimes” and offered each of them a coupon.'] },
      { id: 'n_nbk', sym: 'NBK', t: t('+0 16:05'), src: 'Snezhnaya Financial Times', art: 'p_northland_lobby', title: 'Northland Bank nears historic Liyue debt deal; “item of cultural significance” to change hands', body: ['Northland Bank Group shares rose 1.1% on reports that the bank is close to writing off a large part of Liyue’s sovereign debt.', 'In exchange, the bank would receive “an item of cultural significance” after the Rite of Parting. A spokesperson for the Office of the Eighth declined to say what the item is.'] },
      { id: 'n_sll', sym: 'SLL', t: t('+0 14:41'), src: 'Harbor Business', art: null, title: 'Sea Lantern Logistics jumps 18% for no apparent reason', body: ['Sea Lantern Logistics, which listed three weeks ago and owns no ships, rose 18% on Friday on volume of just 4,000 shares.', 'Asked about the company’s business, its registered office — a desk on Pier 11 — did not answer the phone.'] },
      { id: 'n_crux', sym: 'CRUX', t: t('-6 10:00'), src: 'The Liyue Herald', art: 'p_alcor_deck', title: 'Crux Shipping rises as the Alcor returns to port', body: ['Crux Shipping shares rose after the fleet’s flagship returned from six weeks at sea.', 'Captain Beidou told shareholders: “Profits are up. Also I want a rematch with the ginger one.”'] },
      { id: 'n_lyx', sym: 'LYX', t: t('+0 15:10'), src: 'Harbor Business', art: null, title: 'Liyue Exchange slips as traders wait out the Rite of Parting', body: ['The Liyue Exchange Composite fell 0.4% on Friday. The exchange will close on Sunday for the Rite of Parting and reopen on Monday.', '“Nobody wants to be long Liyue the day its god is buried,” one trader said. “Or short it. Imagine if he’s watching.”'] },
      { id: 'n_mnt', sym: 'MNT', t: t('-3 12:00'), src: 'Snezhnaya Financial Times', art: null, title: 'Glacier Guardians Frost Fortress sells out in Morepesok', body: ['Mingyun Toys & Games said its Frost Fortress playset had sold out in Snezhnaya’s coastal towns.', 'A spokesperson said one eight-year-old in Morepesok had “personally told every child in his school about it”.'] },
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
        const txt = qq.delisted ? 'Halted' : mode === 'pct' ? fmtPct(qq.pct) : mode === 'chg' ? fmtChg(sym, qq.chg) : fmtCap(BY[sym].mcap);
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
        JC.ui.share({ title: BY[sym].name + ' (' + sym + ')', subtitle: qq.delisted ? 'Halted' : fmtP(sym, qq.price) + ' · ' + fmtPct(qq.pct), payload: { kind: 'link', text: sym + ' ' + (qq.delisted ? 'delisted' : fmtP(sym, qq.price) + ' (' + fmtPct(qq.pct) + ')'), url: 'https://stocks.apple.com/symbol/' + sym } });
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
              if (!hits.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Try a symbol like NBK or CRUX.' })];
              return [h('div.stk-sh', 'Symbols'), h('div.stk-results', hits.map((x) => {
                const inW = watch().list.includes(x.s);
                return h('div.stk-res', { onTap: () => openDetail(x.s) }, h('div.stk-row-l', h('div.stk-sym', x.s), h('div.stk-name', x.name + (x.delisted ? ' · Halted' : ' · LYX'))),
                  h('div.stk-add', { class: { on: inW }, onTap: (e) => { e.stopPropagation(); if (inW) removeSym(x.s); else addSym(x.s); } }, JC.icon(inW ? 'checkmark' : 'plus', { size: 16, weight: 2.6 })));
              }))];
            }
            const list = watch().list;
            const ns = news();
            return [
              h('div.stk-sh', h('span', 'My Symbols'), h('span.stk-sh-r.tap', { onTap: () => editSheet() }, 'Edit')),
              list.length ? h('div.stk-list', list.map((s) => row(s))) : JC.ui.empty({ icon: 'chart.line.uptrend.xyaxis', title: 'No Symbols', text: 'Search to add symbols to your watchlist.' }),
              h('div.stk-market', JC.icon('clock', { size: 13 }), ' Liyue Exchange · Closed · prices at 15:00 close'),
              h('div.stk-news-h', h('div.stk-news-k', 'Top Stories'), h('div.stk-news-sub', 'From The Liyue Herald and partners')),
              ns.length ? newsCard(ns[0], true) : null,
              h('div.stk-newslist', ns.slice(1).map((n) => newsCard(n))),
              h('div.stk-foot', 'Quotes are delayed. Every company here is fictional. Even Sea Lantern Logistics. Especially Sea Lantern Logistics.'),
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
        try { JC.story.act('stock_view', { id: sym }); } catch (e) { /* ignore */ }
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
          return [h('div.stk-dh', h('div.stk-dsym', sym), h('div.stk-dname', x.name)), JC.ui.empty({ icon: 'exclamationmark.triangle.fill', title: 'Trading Halted', text: x.about + ' Trading was suspended at the request of the Office of the Tianquan.' })];
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
        const volM = x.idx ? null : (x.mcap * (0.6 + R() * 0.8) * (sym === 'SLL' ? 900 : 1));
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
          h('div.stk-dh', h('div.stk-dsym', sym), h('div.stk-dname', x.name + (x.idx ? ' · Index' : ' · ' + (sym === 'NBK' ? 'ZPX' : 'LYX') + ' · ' + (x.sector || '')))),
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
          right: { icon: 'square.and.arrow.up', bold: false, onTap: () => { JC.ui.share({ title: n.title, subtitle: n.src, art: n.art, payload: { kind: 'link', text: n.title, url: 'https://liyueherald.ly/markets/' + n.id } }); return false; } },
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
