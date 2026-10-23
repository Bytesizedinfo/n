/* Wallet (iOS 26). Card stack (payment cards, Cash, transit, hotel key, event ticket, car key, store card) →
   tap a card to bring it to the top with its transactions / pass details; pass backs, card info, Pay flow
   (Face ID fails for a stranger → passcode → Hold Near Reader), Add (+) and ··· menus.
   Shared API (used by Wanmin Go, Harbor Ride, Feiyun Market…): JC.wallet.pay({ merchant, amount, card, record }) → Promise<{ ok, card, reason }>
   shows the Wallet Pay sheet (bank cards are checked against JC.bank first: a frozen card or too little money declines);
   JC.wallet.charge / refund record a transaction. Cards that draw on the bank balance go through JC.bank.
   Collection `tx`: { card, merchant, amount (+ charge, − credit), t, cat, note, place, pending, supp }.
   Intents: { card } or { id } (card/pass id), { tx } (transaction id). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;

  JC.icon.add({
    applelogo: '<path d="M15.6 3.2c.1 1.2-.4 2.3-1.1 3.1-.8.8-1.8 1.3-2.9 1.2-.1-1.1.4-2.3 1.1-3 .8-.8 1.9-1.3 2.9-1.3zM19 16.6c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.3.9-3.7.9C4.8 22.3 3.6 20.8 2.7 19.4 0.300 15.600 0 11.200 1.5 8.900c1-1.700 2.700-2.700 4.300-2.700 1.600 0 2.600.9 3.900.9 1.300 0 2.100-.9 3.900-.9 1.400 0 2.900.8 3.900 2.100-3.400 1.900-2.900 6.800.5 8.300z" fill="currentColor" stroke="none"/>',
    mora: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 15.5v-7l3.5 4.2 3.5-4.2v7"/>',
    'wave.3.right': '<path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17"/>',
    faceid: '<path d="M4 8.5V6.5a2.5 2.5 0 0 1 2.5-2.5h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2M9 9.5v1.5M15 9.5v1.5M12 9.5v4h-1M9.5 16c1.5 1.2 3.5 1.2 5 0"/>',
    ticket: '<path d="M3.5 8.5V6.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 5v2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-2a2.5 2.5 0 0 0 0-5z"/><path d="M14.5 5.5v13" stroke-dasharray="1.6 2"/>',
    'car.key': '<path d="M5 13.5 6.6 9a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4L19 13.5"/><rect x="3.5" y="13.5" width="17" height="5" rx="1.6"/><path d="M6.5 18.5v1.5M17.5 18.5v1.5"/><circle cx="7.5" cy="16" r=".8" fill="currentColor"/><circle cx="16.5" cy="16" r=".8" fill="currentColor"/>',
    barcode: '<path d="M4 5v14M7 5v14M9.5 5v14M13 5v14M15 5v14M18 5v14M20 5v14"/>',
    'arrow.left.arrow.right': '<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',
    'lock.open': '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 7.6-1.7"/>',
    'speaker.wave.3.fill': '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11"/>',
    'car.side': '<path d="M3 15.5v-2.2c0-.8.5-1.5 1.3-1.8L8 10l2.4-3h5.4l3 3.4 1.6.6c.6.2 1 .8 1 1.5v3"/><circle cx="7.5" cy="16" r="1.8"/><circle cx="17" cy="16" r="1.8"/><path d="M9.3 16h5.9"/>',
  });

  const CARDS = [
    { id: 'nb', kind: 'pay', title: 'Northland Bank', short: 'Northland Black', last: '1111', type: 'Debit', dan: '0711', holder: 'TARTAGLIA' },
    { id: 'cash', kind: 'cash', title: 'Mora Cash', short: 'Mora Cash' },
    { id: 'metro', kind: 'transit', title: 'Liyue Metro', short: 'Liyue Metro' },
    { id: 'opera', kind: 'event', title: 'Yun Jin — “The Divine Damsel”', short: 'Box 2 · 2 seats' },
    { id: 'flight', kind: 'board', title: 'Liyue Air LA 711', short: 'LA 711 · 2 passengers' },
    { id: 'hotel', kind: 'hotel', title: 'Liyue Harbor Grand', short: 'Suite 1101' },
    { id: 'wangsheng', kind: 'store', title: 'Wangsheng Funeral Parlor', short: 'VIP Client' },
    { id: 'wanmin', kind: 'store', title: 'Wanmin Restaurant', short: 'Stamp card' },
    { id: 'knockout', kind: 'store', title: 'Third-Round Knockout', short: 'Punch card' },
  ];
  const cardDef = (id) => CARDS.find((c) => c.id === id) || null;
  const PAYABLE = ['nb', 'cash'];
  const TALL = ['opera', 'flight', 'wangsheng', 'wanmin', 'knockout'];

  // ── transactions (positive = charge, negative = credit) ──
  // bank-card transactions come from the Northland app (js/apps/northland-data.js); these are the rest
  JC.store.seed('tx', [
    // Mora Cash (person to person)
    { id: 'tx_c_paimon', card: 'cash', merchant: 'Paimon', contact: 'paimon', amount: 388, t: '-1 19:40', cat: 'p2p', note: '“emergency food fund” 🍗' },
    { id: 'tx_c_tonia', card: 'cash', merchant: 'Tonia', contact: 'tonia', amount: 500, t: '-6 20:15', cat: 'p2p', note: 'for the school trip. don’t tell Mama it was 500' },
    { id: 'tx_c_ht', card: 'cash', merchant: 'Hu Tao', contact: 'ht', amount: -77, t: '-9 23:02', cat: 'p2p', note: 'refund for the coupon you didn’t use 👻 (it was a joke coupon)' },
    { id: 'tx_c_lumine', card: 'cash', merchant: 'Lumine', contact: 'lumine', amount: -260, t: '-11 21:30', cat: 'p2p', note: 'you lost. 14–13. pay up.' },
    { id: 'tx_c_teucer', card: 'cash', merchant: 'Teucer', contact: 'teucer', amount: 50, t: '2026-09-14 18:00', cat: 'p2p', note: 'for Sir Fang’s new hat 🎩' },
    { id: 'tx_c_add', card: 'cash', merchant: 'Added from Northland •• 1111', amount: -2000, t: '2026-09-01 09:00', cat: 'topup', note: 'Add Money' },
    { id: 'tx_c_mama', card: 'cash', merchant: 'Mama', contact: 'mama', amount: 3000, t: '2026-08-31 10:00', cat: 'p2p', note: 'toy commission 🧸 (August)' },
    // Liyue Metro
    { id: 'tx_m_3', card: 'metro', merchant: 'L1 · Feiyun Slope → Harbor Road', amount: 3, t: '-1 07:05', cat: 'transit' },
    { id: 'tx_m_2', card: 'metro', merchant: 'L2 · Harbor Road → Yujing Terrace', amount: 4, t: '-4 18:12', cat: 'transit' },
    { id: 'tx_m_top', card: 'metro', merchant: 'Top-up', amount: -100, t: '-4 18:10', cat: 'topup', note: 'From Northland •• 1111' },
    { id: 'tx_m_1', card: 'metro', merchant: 'L3 · Chihu Rock → Wangshu', amount: 6, t: '-9 06:20', cat: 'transit', note: 'fishing trip' },
    { id: 'tx_m_0', card: 'metro', merchant: 'L1 · Harbor Road → Liyue Intl', amount: 9, t: '2026-03-12 13:40', cat: 'transit' },
  ]);

  const CAT = {
    ride: ['car.fill', '#111214'], hotel: ['bed.double.fill', '#b8862b'], car: ['car.side', '#5b3fa6'], fuel: ['fuelpump', '#ff9500'],
    food: ['fork.knife', '#e8590c'], shop: ['bag.fill', '#5856d6'], pet: ['pawprint.fill', '#20a39e'], rail: ['tram.fill', '#0a84ff'],
    transfer: ['paperplane.fill', '#0a84ff'], jewel: ['sparkles', '#8e8e93'], tea: ['cup.and.saucer.fill', '#34a853'], transit: ['tram.fill', '#c8102e'],
    p2p: ['person.fill', '#30b0c7'], topup: ['plus', '#34c759'], other: ['creditcard.fill', '#8e8e93'],
    wire: ['building.columns.fill', '#0f2740'], dining: ['fork.knife', '#b3261e'], fishing: ['drop.fill', '#0a84ff'], gifts: ['gift.fill', '#ff2d55'], health: ['heart.fill', '#ff375f'], leisure: ['ticket', '#af52de'], services: ['gearshape.fill', '#8e8e93'], transport: ['car.fill', '#0d6e6e'], collections: ['briefcase.fill', '#5856d6'], interest: ['chart.line.uptrend.xyaxis', '#34c759'], office: ['building.2', '#0f2740'], payroll: ['creditcard.fill', '#34c759'], savings: ['lock.fill', '#30b0c7'], internal: ['arrow.left.arrow.right', '#0a84ff'], notice: ['info.circle', '#8e8e93'], travel: ['airplane', '#b3261e'], shopping: ['bag.fill', '#c2410c'], gift: ['gift.fill', '#ff2d55'], funeral: ['leaf.fill', '#3b1d18'], fight: ['flame.fill', '#e5383b'],
  };

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.wallet || (d.apps.wallet = {});
    const def = { cash: 1288, metro: 86.4, express: true, hidden: [], notif: { nb: true }, auto: { hotel: true, opera: true, flight: true, wangsheng: true, wanmin: true, knockout: true }, suggest: { hotel: false, opera: true, flight: true, wanmin: true }, order: null };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();
  const mora = (n) => U.fmtMoney(n);
  const passcode = () => String((JC.state.d.settings && JC.state.d.settings.passcode) || JC.world.passcode.code);

  const isBank = (card) => !!(JC.bank && JC.bank.isBankCard(card || 'nb'));
  function record(o) {
    if (isBank(o.card)) {
      // one balance for every app: JC.bank records the tx, sends the bank SMS and emits charge / decline
      const spec = { card: o.card || 'nb', merchant: o.merchant, amount: Math.abs(o.amount), cat: o.cat || 'other', note: o.note || '', place: o.place || null, pending: !!o.pending, sms: o.sms, app: o.app || 'wallet' };
      const r = o.amount < 0 ? JC.bank.credit(spec) : JC.bank.charge(spec);
      return r.ok ? r.tx : null;
    }
    const t = JC.time.now();
    const tx = JC.store.add('tx', { card: o.card || 'nb', merchant: o.merchant, amount: o.amount, t, cat: o.cat || 'other', note: o.note || '', place: o.place || null, pending: !!o.pending }, { front: true });
    const S = st();
    if (tx.card === 'cash') { S.cash = Math.round((S.cash - o.amount) * 100) / 100; save(); }
    JC.bus.emit('wallet:tx', tx);
    return tx;
  }

  // ═══ Shared keypad + Face ID helpers (used by the pay sheet and the in-Wallet Pay flow) ═══
  function faceId(el) {
    // scanning → "Face Not Recognized" (whoever is holding this phone, it isn't Childe)
    return new Promise((resolve) => {
      el.classList.remove('fail', 'ok');
      el.classList.add('scan');
      JC.audio.haptic(10);
      setTimeout(() => { el.classList.remove('scan'); el.classList.add('fail'); JC.audio.play('error'); JC.audio.haptic(30); resolve(false); }, 1300);
    });
  }
  function keypad(o) {
    let v = '';
    let tries = 0;
    const dots = h('div.wlk-dots', [0, 1, 2, 3, 4, 5].map(() => h('i')));
    const msg = h('div.wlk-msg', o.title || 'Enter iPhone Passcode');
    const paint = () => dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i < v.length));
    const press = (k) => {
      if (k === 'del') { v = v.slice(0, -1); paint(); return; }
      if (v.length >= 6) return;
      v += k; paint(); JC.audio.play('tap');
      if (v.length === 6) setTimeout(check, 160);
    };
    const check = () => {
      if (v === passcode()) { o.ok && o.ok(); return; }
      tries++;
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
      JC.audio.play('error'); JC.audio.haptic(40);
      v = ''; paint();
      msg.textContent = tries >= 3 ? 'Too many attempts' : 'Wrong Passcode';
      if (tries >= 3) setTimeout(() => o.fail && o.fail(), 700);
    };
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', ''], ['del', '']];
    const el = h('div.wlk', msg, dots, h('div.wlk-grid', keys.map(([k, s]) => (k === '' ? h('span') : k === 'del' ? h('div.wlk-key.del', { onTap: () => press('del') }, JC.icon('delete.left', { size: 24 })) : h('div.wlk-key', { onTap: () => press(k) }, h('b', k), s ? h('small', s) : null)))),
      o.cancel ? h('div.wlk-cancel.tap', { onTap: () => o.cancel() }, 'Cancel') : null);
    const onKey = (e) => { if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; } if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('del'); };
    document.addEventListener('keydown', onKey);
    return el;
  }
  /** While a payment is waiting: intercept the hardware side button (double-click = confirm) instead of sleeping. */
  function sideButton(onDouble) {
    let last = 0;
    const isSide = (e) => e.target && e.target.closest && e.target.closest('.hw-side');
    const down = (e) => { if (isSide(e)) { e.stopPropagation(); e.preventDefault(); } };
    const up = (e) => {
      if (!isSide(e)) return;
      e.stopPropagation(); e.preventDefault();
      const now = performance.now();
      if (now - last < 600) { last = 0; onDouble(); } else { last = now; JC.audio.haptic(8); }
    };
    document.addEventListener('pointerdown', down, true);
    document.addEventListener('pointerup', up, true);
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('pointerup', up, true); };
  }
  function cardFace(id, o) {
    o = o || {};
    const c = cardDef(id);
    const S = st();
    const el0 = h('div.wl-card.wl-c-' + id, { class: o.cls, data: { id } });
    if (!c) return el0;
    const el = { append: (...kids) => el0.append(...kids.filter(Boolean)) };
    const f = flags();
    if (id === 'nb') el.append(h('div.wl-ctop', h('span.wl-bank', '❄ NORTHLAND BANK'), h('span.wl-ctype', JC.bank && JC.bank.frozen() ? 'Frozen' : 'Black')), h('div.wl-chip'), h('div.wl-cbot', h('span', '•••• ' + c.last), h('span.wl-net', JC.icon('wave.3.right', { size: 16, weight: 2 }), ' DEBIT')));
    else if (id === 'cash') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('mora', { size: 16 }), ' Mora Cash'), h('span.wl-cbal', mora(S.cash))), h('div.wl-cash-swirl'), h('div.wl-cbot', h('span', 'Wallet Cash'), h('span.wl-net', 'Send & receive')));
    else if (id === 'metro') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('tram.fill', { size: 16 }), ' LIYUE METRO'), h('span.wl-cbal', mora(S.metro))), h('div.wl-metro-koi'), h('div.wl-cbot', h('span', S.express ? 'Express Mode' : 'Transit card'), h('span.wl-net', 'Metro · ferries · buses')));
    else if (id === 'hotel') el.append(h('div.wl-ctop', h('span.wl-bank', '✦ LIYUE HARBOR GRAND'), h('span.wl-pfield', h('small', 'SUITE'), h('b', '1101'))), h('div.wl-pmid', h('div', h('small', 'CHECK-IN'), h('b', 'Sat, Oct 17')), h('div', h('small', 'CHECK-OUT'), h('b', 'Mon, Oct 19'))), h('div.wl-cbot', h('span', 'Shared by Northland Executive Travel'), h('span.wl-net', JC.icon('wave.3.right', { size: 16, weight: 2 }))));
    else if (id === 'opera') el.append(h('div.wl-ctop', h('span.wl-bank', '雲堇 HEYU TEA HOUSE'), h('span.wl-pfield', h('small', 'SAT, OCT 17'), h('b', '3:00 PM'))), h('div.wl-gala-t', 'The Divine Damsel of Devastation'), h('div.wl-pmid', h('div', h('small', 'BOX'), h('b', '2')), h('div', h('small', 'SEATS'), h('b', '071820–21')), h('div', h('small', 'TROUPE'), h('b', 'Yun Jin'))), o.full ? h('div.wl-qr', qrSvg('HEYU-BOX2-071820-071821', 108)) : null);
    else if (id === 'flight') el.append(h('div.wl-ctop', h('span.wl-bank', '✈ LIYUE AIR'), h('span.wl-pfield', h('small', 'FLIGHT'), h('b', 'LA 711'))), h('div.wl-board', h('div', h('b', 'ZPL'), h('small', 'Zapolyarny')), h('span.wl-board-plane', '✈'), h('div', h('b', 'LYH'), h('small', 'Liyue Harbor'))), h('div.wl-pmid', h('div', h('small', 'DEPARTS'), h('b', '23:50')), h('div', h('small', 'ARRIVES'), h('b', '07:40')), h('div', h('small', 'SEATS'), h('b', '23A · 23B'))), o.full ? h('div.wl-qr', qrSvg('LA711-1016-TONIA-TEUCER-UMNR', 108)) : h('div.wl-cbot', h('span', 'TONIA · TEUCER'), h('span.wl-net', 'Shared by Mama')));
    else if (id === 'wangsheng') el.append(h('div.wl-ctop', h('span.wl-bank', '往生堂 WANGSHENG'), h('span.wl-pfield', h('small', 'DISCOUNT'), h('b', '10%'))), h('div.wl-pmid', h('div', h('small', 'TIER'), h('b', 'VIP Client')), h('div', h('small', 'ISSUED BY'), h('b', 'Hu Tao'))), o.full ? h('div.wl-bar', barSvg('0077 1111 0720 2026', 230, 54)) : h('div.wl-cbot', h('span', 'Valid in this life and the next'), h('span.wl-net', '👻')));
    else if (id === 'wanmin') el.append(h('div.wl-ctop', h('span.wl-bank', '萬民 WANMIN RESTAURANT'), h('span.wl-pfield', h('small', 'STAMPS'), h('b', (f.wanmin_stamp ? 10 : 9) + ' / 10'))), h('div.wl-stamps', Array.from({ length: 10 }, (_, i) => h('i', { class: { on: i < (f.wanmin_stamp ? 10 : 9) } }, i < (f.wanmin_stamp ? 10 : 9) ? '🍲' : ''))), h('div.wl-cbot', h('span', f.wanmin_stamp ? 'Free hotpot set ready!' : 'One more for a free hotpot set'), h('span.wl-net', 'Xiangling')));
    else if (id === 'knockout') el.append(h('div.wl-ctop', h('span.wl-bank', '🥊 THIRD-ROUND KNOCKOUT'), h('span.wl-pfield', h('small', 'RECORD'), h('b', '41–0'))), h('div.wl-stamps', Array.from({ length: 10 }, (_, i) => h('i', { class: { on: i < 7 } }, i < 7 ? '✊' : ''))), h('div.wl-cbot', h('span', '10 wins = free drinks for the bar'), h('span.wl-net', f.rematch_won ? 'Beidou: 0–2' : 'Beidou: 0–1 (rematch pending)')));
    return el0;
  }
  function flags() { return (JC.state.d && JC.state.d.flags) || {}; }
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function qrSvg(seed, size) {
    const n = 25;
    let r = hash(seed);
    const rnd = () => { r ^= r << 13; r ^= r >>> 17; r ^= r << 5; return ((r >>> 0) % 1000) / 1000; };
    let rects = '';
    const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" fill="#000"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#000"/>`;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue;
      if (rnd() < 0.48) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000"/>`;
    }
    const s = document.createElement('span');
    s.className = 'wl-qrsvg';
    s.innerHTML = `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/>${rects}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
    return s;
  }
  function barSvg(code, w, hgt) {
    let r = hash(code);
    let x = 4, bars = '';
    while (x < w - 6) { r = Math.imul(r ^ (r >>> 15), 2246822507) >>> 0; const bw = 1 + (r % 3); if ((r >>> 4) % 3) bars += `<rect x="${x}" y="0" width="${bw}" height="${hgt - 14}" fill="#000"/>`; x += bw + 1 + ((r >>> 8) % 2); }
    const s = document.createElement('span');
    s.className = 'wl-barsvg';
    s.innerHTML = `<svg viewBox="0 0 ${w} ${hgt}" width="${w}" height="${hgt}"><rect width="${w}" height="${hgt}" fill="#fff"/>${bars}<text x="${w / 2}" y="${hgt - 2}" font-size="10" text-anchor="middle" font-family="Menlo,monospace" fill="#000">${code}</text></svg>`;
    return s;
  }

  // ═══ Wallet Pay sheet (in-app purchases) ═══
  function pay(o) {
    o = o || {};
    return new Promise((resolve) => {
      const layer = JC.ui.layer();
      let card = PAYABLE.includes(o.card) ? o.card : 'nb';
      const back = h('div.wlp-back');
      const sheet = h('div.wlp');
      layer.append(back, sheet);
      let done = false;
      let sideEl = null, offSide = null;
      const finish = (ok) => {
        if (done) return;
        done = true;
        if (sideEl) sideEl.remove();
        if (offSide) { offSide(); offSide = null; }
        U.anim(sheet, [{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }], { duration: 320 }).then(() => sheet.remove());
        U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => back.remove());
        resolve({ ok, card });
      };
      JC.ui.onTap(back, () => finish(false));
      const main = () => {
        const c = cardDef(card);
        sheet.innerHTML = '';
        const fid = h('div.wlp-fid', JC.icon('faceid', { size: 46, weight: 1.6 }));
        const status = h('div.wlp-status', 'Confirm with Side Button');
        if (sideEl) sideEl.remove();
        const side = sideEl = h('div.wlp-side', { onTap: () => go() }, h('span', 'Double Click'), h('i'));
        sheet.append(
          h('div.wlp-head', h('div.wlp-logo', JC.icon('applelogo', { size: 18 }), ' Pay'), h('div.wlp-x', { onTap: () => finish(false) }, JC.icon('xmark', { size: 14, weight: 2.8 }))),
          h('div.wlp-row.tap', { onTap: () => pick() }, h('div.wlp-mini', cardFace(card, { cls: 'mini' })), h('div.wlp-rm', h('b', c.short + (c.last ? ' •• ' + c.last : '')), h('span', cardSub(card))), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
          h('div.wlp-row', h('div.wlp-k', 'CONTACT'), h('div.wlp-rm', h('span', 'tartaglia@northland.sn'))),
          h('div.wlp-total', h('div', h('small', 'PAY ' + String(o.merchant || 'MERCHANT').toUpperCase()), o.sub ? h('span', o.sub) : null), h('b', mora(o.amount || 0))),
          h('div.wlp-auth', { onTap: () => go() }, fid, status));
        layer.appendChild(side);
        U.anim(side, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
        if (offSide) offSide();
        offSide = sideButton(() => go());
        let busy = false;
        function go() {
          if (busy) return;
          busy = true;
          if (offSide) { offSide(); offSide = null; }
          status.textContent = 'Face ID';
          faceId(fid).then(() => {
            status.textContent = 'Face Not Recognized';
            sheet.classList.add('shake');
            setTimeout(() => sheet.classList.remove('shake'), 500);
            side.remove();
            const btn = JC.ui.btn({ text: 'Pay with Passcode', kind: 'filled', size: 'l', cls: 'wlp-pc', onTap: () => passPage() });
            sheet.appendChild(btn);
          });
        }
      };
      const pick = () => {
        if (sideEl) { sideEl.remove(); sideEl = null; }
        if (offSide) { offSide(); offSide = null; }
        sheet.innerHTML = '';
        sheet.append(h('div.wlp-head', h('div.wlp-back-btn', { onTap: () => main() }, JC.icon('chevron.left', { size: 18, weight: 2.4 })), h('div.wlp-title', 'Cards'), h('span')),
          h('div.wlp-cards', PAYABLE.map((id) => { const c = cardDef(id); return h('div.wlp-crow', { class: { on: id === card }, onTap: () => { card = id; main(); } }, h('div.wlp-mini', cardFace(id, { cls: 'mini' })), h('div.wlp-rm', h('b', c.short + (c.last ? ' •• ' + c.last : '')), h('span', cardSub(id))), id === card ? JC.icon('checkmark', { size: 16, weight: 2.6 }) : null); })));
      };
      const passPage = () => {
        sheet.innerHTML = '';
        sheet.append(keypad({
          title: 'Enter iPhone Passcode for “Pay”',
          ok: () => processing(),
          fail: () => { JC.ui.toast('Payment not completed', { icon: 'xmark' }); finish(false); },
          cancel: () => finish(false),
        }));
      };
      const processing = () => {
        const chk = isBank(card) ? JC.bank.check({ card, amount: o.amount || 0 }) : { ok: true };
        if (!chk.ok) {
          // the bank declines: a frozen card or not enough money (JC.bank.charge reports the decline)
          if (o.record !== false) record({ card, merchant: o.merchant, amount: o.amount, cat: o.cat, note: o.note, place: o.place, sms: o.sms, app: o.app });
          else JC.bank.charge({ card, merchant: o.merchant, amount: o.amount, app: o.app || 'wallet', quiet: true });
          sheet.innerHTML = '';
          sheet.append(h('div.wlp-done.err', JC.icon(chk.reason === 'frozen' ? 'snowflake' : 'exclamationmark.circle.fill', { size: 54 }), h('b', chk.reason === 'frozen' ? 'Card Frozen' : 'Payment Declined'), h('span', JC.bank.reasonText(chk.reason))));
          JC.audio.play('error');
          setTimeout(() => { if (done) return; done = true; U.anim(sheet, [{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }], { duration: 320 }).then(() => sheet.remove()); U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => back.remove()); resolve({ ok: false, card, reason: chk.reason }); }, 2000);
          return;
        }
        if (card === 'cash' && st().cash < (o.amount || 0)) {
          sheet.innerHTML = '';
          sheet.append(h('div.wlp-done.err', JC.icon('exclamationmark.circle.fill', { size: 54 }), h('b', 'Insufficient Balance'), h('span', 'Cash balance is ' + mora(st().cash) + '.')));
          setTimeout(() => main(), 1600);
          return;
        }
        sheet.innerHTML = '';
        const spin = h('div.wlp-done', h('div.wlp-spin'), h('b', 'Processing'));
        sheet.append(spin);
        setTimeout(() => {
          spin.innerHTML = '';
          spin.append(h('div.wlp-check', JC.icon('checkmark', { size: 34, weight: 3 })), h('b', 'Done'));
          JC.audio.play('success'); JC.audio.haptic(20);
          if (o.record !== false) record({ card, merchant: o.merchant, amount: o.amount, cat: o.cat, note: o.note, place: o.place, sms: o.sms, app: o.app });
          setTimeout(() => finish(true), 900);
        }, 1000);
      };
      main();
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
      U.anim(sheet, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: U.EASE });
    });
  }

  /** second line under a card in the Pay sheet */
  function cardSub(id) {
    if (id === 'cash') return 'Balance ' + mora(st().cash);
    if (isBank(id)) return JC.bank.frozen() ? 'Frozen' : 'Available ' + mora(JC.bank.balance());
    const c = cardDef(id);
    return c ? c.title : '';
  }

  JC.wallet = {
    cards: () => CARDS.slice(),
    pay,
    /** card-on-file charge without UI (e.g. a finished ride) */
    charge: (o) => record(Object.assign({}, o, { amount: Math.abs(o.amount) })),
    refund: (o) => record(Object.assign({}, o, { amount: -Math.abs(o.amount) })),
    balance: (id) => (id === 'cash' ? st().cash : id === 'metro' ? st().metro : isBank(id) ? JC.bank.balance() : null),
  };

  JC.app({
    id: 'wallet',
    name: 'Wallet',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-wallet');
      let sel = null; // selected card id
      let flipped = false;
      let page = null, stage = null, detail = null, peek = null;
      const CH = 233, GAP = 62;

      function topButtons() { return [JC.ui.navBtn({ icon: 'plus', label: 'Add', onTap: () => addSheet() }), JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => moreMenu(e.currentTarget) })]; }
      function order() {
        const S = st();
        return CARDS.filter((c) => !S.hidden.includes(c.id)).map((c) => c.id);
      }
      function mainPage() {
        stage = h('div.wl-stage');
        detail = h('div.wl-detail');
        peek = h('div.wl-peek', { onTap: () => collapse() });
        page = JC.ui.page({
          title: 'Wallet', large: true, cls: 'wl-main',
          right: topButtons(),
          footer: peek,
          content: () => [stage],
        });
        layout(false);
        return page;
      }
      function positions() {
        const ids = order();
        const pos = {};
        let y = 0;
        ids.forEach((id, i) => {
          const c = cardDef(id);
          if (i > 0 && c.kind !== 'pay' && c.kind !== 'cash' && c.kind !== 'transit' && ['pay', 'cash', 'transit'].includes(cardDef(ids[i - 1]).kind)) y += 22;
          pos[id] = y;
          y += GAP;
        });
        return { pos, height: y - GAP + CH + 30 };
      }
      function layout(animate) {
        const ids = order();
        const P = positions();
        // (re)create card elements
        const have = {};
        stage.querySelectorAll('.wl-card[data-id]').forEach((el) => { if (el.parentElement === stage) have[el.dataset.id] = el; });
        Object.keys(have).forEach((id) => { if (!ids.includes(id)) have[id].remove(); });
        ids.forEach((id, i) => {
          let el = have[id];
          if (!el) {
            el = cardFace(id, { full: sel === id });
            el.style.zIndex = String(10 + i);
            JC.ui.onTap(el, () => tapCard(id));
            stage.appendChild(el);
          }
          el.style.zIndex = String(10 + i);
          el.style.transition = animate ? '' : 'none';
          if (!sel) { el.style.transform = `translateY(${P.pos[id]}px)`; el.style.opacity = '1'; el.classList.remove('wl-away', 'wl-sel'); }
          else if (id === sel) { el.style.transform = 'translateY(0px)'; el.style.opacity = '1'; el.classList.add('wl-sel'); el.classList.remove('wl-away'); }
          else { el.style.transform = `translateY(${Math.max(P.height, 900)}px)`; el.style.opacity = '0'; el.classList.add('wl-away'); el.classList.remove('wl-sel'); }
          if (!animate) { void el.offsetWidth; el.style.transition = ''; }
        });
        if (!sel) {
          stage.style.height = P.height + 'px';
          detail.classList.remove('on');
          if (detail.parentElement) setTimeout(() => { if (!sel && detail.parentElement) detail.remove(); }, animate ? 320 : 0);
          peek.classList.remove('on');
          page.el.classList.remove('wl-expanded');
        } else {
          if (!detail.parentElement) stage.appendChild(detail);
          renderDetail();
          requestAnimationFrame(() => detail.classList.add('on'));
          stage.style.height = Math.max(selH() + 18 + detail.offsetHeight + 130, 400) + 'px';
          renderPeek();
          peek.classList.add('on');
          page.el.classList.add('wl-expanded');
        }
      }
      function tapCard(id) {
        if (sel === id) { if (cardDef(id).kind !== 'pay' && cardDef(id).kind !== 'cash' && cardDef(id).kind !== 'transit') return flip(); collapse(); return; }
        if (sel) return;
        expand(id);
      }
      function expand(id) {
        sel = id; flipped = false;
        const c = cardDef(id);
        // the card front for passes shows its barcode/QR when presented
        const el = stage.querySelector('.wl-card[data-id="' + id + '"]');
        if (el && TALL.includes(id)) { const nf = cardFace(id, { full: true }); nf.style.cssText = el.style.cssText; JC.ui.onTap(nf, () => tapCard(id)); el.replaceWith(nf); }
        page.scrollTop(true);
        page.setTitle(c.short);
        page.setRight([JC.ui.navBtn({ icon: 'ellipsis', label: 'Card options', onTap: () => (c.kind === 'pay' ? cardInfo(c) : flip()) }), JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => collapse() })]);
        layout(true);
        JC.audio.haptic(8);
        JC.story.act('wallet_view', { id }); if (c.kind !== 'pay' && c.kind !== 'cash' && c.kind !== 'transit') JC.story.act('pass_view', { id });
      }
      function collapse() {
        if (!sel) return;
        const id = sel;
        sel = null; flipped = false;
        const el = stage.querySelector('.wl-card[data-id="' + id + '"]');
        if (el) { el.classList.remove('flip'); const nf = cardFace(id); nf.style.cssText = el.style.cssText; JC.ui.onTap(nf, () => tapCard(id)); el.replaceWith(nf); }
        page.setTitle('Wallet');
        page.setRight(topButtons());
        layout(true);
      }
      function flip() {
        if (!sel) return;
        flipped = !flipped;
        const el = stage.querySelector('.wl-card[data-id="' + sel + '"]');
        if (el) {
          const base = el.style.transform || 'translateY(0px)';
          U.anim(el, [{ transform: base + ' perspective(900px) rotateY(0deg)' }, { transform: base + ' perspective(900px) rotateY(90deg)' }], { duration: 170, easing: 'ease-in' }).then(() => {
            el.classList.toggle('flip', flipped);
            const old = el.querySelector('.wl-backface');
            if (old) old.remove();
            if (flipped) el.appendChild(h('div.wl-backface', h('b', cardDef(sel).title), h('span', 'Pass details'), h('i', JC.icon('info.circle', { size: 22 }))));
            U.anim(el, [{ transform: base + ' perspective(900px) rotateY(-90deg)' }, { transform: base + ' perspective(900px) rotateY(0deg)' }], { duration: 190, easing: 'ease-out' });
          });
        }
        renderDetail();
      }
      function renderPeek() {
        peek.innerHTML = '';
        const others = order().filter((id) => id !== sel).slice(-4);
        others.forEach((id, i) => { const m = cardFace(id, { cls: 'peekcard' }); m.style.top = (i * 11) + 'px'; m.style.zIndex = String(i); peek.appendChild(m); });
      }

      // ── detail panels ──
      function selH() { return TALL.includes(sel) ? 320 : CH; }
      function renderDetail() {
        detail.innerHTML = '';
        detail.style.top = (selH() + 18) + 'px';
        const c = cardDef(sel);
        if (!c) return;
        if (flipped) { detail.append(passBack(c)); return; }
        if (c.kind === 'pay') detail.append(payDetail(c));
        else if (c.kind === 'cash') detail.append(cashDetail());
        else if (c.kind === 'transit') detail.append(transitDetail());
        else if (c.kind === 'hotel') detail.append(hotelDetail());
        else if (c.kind === 'event') detail.append(eventDetail());
        else if (c.kind === 'board') detail.append(boardDetail());
        else if (c.kind === 'store') detail.append(storeDetail(c));
        stage.style.height = Math.max(selH() + 18 + detail.offsetHeight + 130, 400) + 'px';
      }
      const txFor = (card) => JC.store.all('tx').filter((t) => t.card === card).sort((a, b) => b.t - a.t);
      function txRow(t) {
        const [g, col] = CAT[t.cat] || CAT.other;
        const credit = t.amount < 0;
        const lead = t.contact ? JC.ui.avatar(t.contact, 40) : h('div.wl-txic', { style: { background: col } }, JC.icon(g, { size: 19 }));
        return { leading: lead, title: t.merchant, subtitle: (t.pending ? 'Pending · ' : '') + whenText(t.t), detail: h('span.wl-amt', { class: { credit } }, (credit ? '+' : '') + mora(Math.abs(t.amount))), chevron: true, onTap: () => nav.push(txPage(t.id)) };
      }
      function whenText(t) {
        const d = U.dayDiff(new Date(t), JC.time.date());
        if (d <= 0) return U.fmtTime(t);
        if (d === 1) return 'Yesterday';
        if (d < 7) return U.fmtDate(t, 'day');
        return U.fmtDate(t, 'short');
      }
      function actions(list) { return h('div.wl-acts', list.map(([t, g, fn, cls]) => h('div.wl-act', { class: cls, onTap: fn }, h('div.wl-act-ic', JC.icon(g, { size: 21 })), h('span', t)))); }
      function payDetail(c) {
        const txs = txFor(c.id);
        const S = st();
        const frozen = JC.bank && JC.bank.frozen();
        return h('div.wl-d',
          h('div.wl-balance', h('div', h('small', frozen ? 'Card Frozen' : 'Available'), h('b', mora(JC.bank ? JC.bank.balance() : 0))), h('div', h('small', 'Account'), h('b', 'Personal Current')), h('div.wl-auto', JC.icon(frozen ? 'snowflake' : 'checkmark.circle.fill', { size: 14 }), frozen ? ' Frozen' : ' Active')),
          actions([['Pay', 'wave.3.right', () => payFlow(c.id), 'pri'], ['Card Info', 'creditcard.fill', () => cardInfo(c)], ['Bank', 'building.columns.fill', () => JC.os.open('northland')], ['Freeze', 'snowflake', () => JC.os.open('northland', { tab: 'card' })]]),
          S.notif[c.id] === false ? h('div.wl-note', 'Transaction notifications are off for this card.') : null,
          frozen ? h('div.wl-note', 'This card is frozen in the Northland app. Payments will be declined until it is unfrozen.') : null,
          h('div.wl-sec-h', h('b', 'Latest Transactions'), h('span.tap', { onTap: () => nav.push(allTx(c.id)) }, 'See All')),
          JC.ui.list([{ rows: txs.slice(0, 6).map(txRow) }], { cls: 'wl-list' }));
      }
      function cashDetail() {
        const S = st();
        return h('div.wl-d',
          h('div.wl-bigbal', h('small', 'Cash Balance'), h('b', mora(S.cash))),
          actions([['Send', 'paperplane.fill', () => sendMoney(false), 'pri'], ['Request', 'arrow.down', () => sendMoney(true)], ['Add Money', 'plus', () => addMoney()], ['Transfer', 'arrow.left.arrow.right', () => JC.ui.alert({ title: 'Transfer to Bank', message: 'Transfers go to Northland Bank ···· 1111 in 1–3 business days. Confirm with Face ID.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Transfer', style: 'default', onTap: () => setTimeout(() => JC.ui.alert({ title: 'Face ID Not Recognized', message: 'Transfers need Face ID. Try again from the device owner’s face.', buttons: [{ text: 'OK' }] }), 300) }] })]]),
          h('div.wl-sec-h', h('b', 'Latest Transactions'), h('span.tap', { onTap: () => nav.push(allTx('cash')) }, 'See All')),
          JC.ui.list([{ rows: txFor('cash').slice(0, 6).map(txRow) }], { cls: 'wl-list' }));
      }
      function transitDetail() {
        const S = st();
        return h('div.wl-d',
          h('div.wl-bigbal', h('small', 'Balance'), h('b', mora(S.metro)), S.metro < 20 ? h('span.wl-low', 'Low balance') : null),
          actions([['Top Up', 'plus', () => topUp(), 'pri'], ['Express', 'bolt.fill', () => { S.express = !S.express; save(); JC.ui.toast('Express Mode ' + (S.express ? 'On' : 'Off'), { icon: 'bolt.fill' }); refreshSel(); }], ['Map', 'map.fill', () => JC.os.open('maps', { place: 'liyue-station' })], ['Info', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [{ title: 'Express Mode', subtitle: 'Pay fares without waking or unlocking iPhone', toggle: { on: S.express, onChange: (v) => { S.express = v; save(); refreshSel(); } } }] }], { cls: 'wl-list' }),
          h('div.wl-sec-h', h('b', 'Trips & Top-ups'), h('span.tap', { onTap: () => nav.push(allTx('metro')) }, 'See All')),
          JC.ui.list([{ rows: txFor('metro').slice(0, 6).map(txRow) }], { cls: 'wl-list' }));
      }
      function hotelDetail() {
        return h('div.wl-d',
          h('div.wl-note', 'Shared with this iPhone by Northland Executive Travel (Office of Pulcinella). Security and room service “provided”.'),
          actions([['Unlock', 'lock.open', () => hotelKey(), 'pri'], ['Front Desk', 'phone.fill', () => JC.ui.alert({ title: 'Liyue Harbor Grand', message: 'The front desk says Suite 1101 is “prepared for Mr. Pulcinella’s guests” and that “the gentlemen from Northland will be waiting in the lobby.”', buttons: [{ text: 'OK' }] })], ['Directions', 'arrow.triangle.turn.up.right.diamond.fill', () => JC.os.open('maps', { directions: 'liyue-grand' })], ['Details', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [
            { title: 'Guests', detail: 'Tonia, Teucer (minors)' }, { title: 'Suite', detail: '1101 · 11th floor, sea view' }, { title: 'Check-in', detail: 'Sat, Oct 17 · from 08:30' }, { title: 'Check-out', detail: 'Mon, Oct 19 · 11:00' }, { title: 'Confirmation', detail: 'NET-1014-0711' },
          ] }, { rows: [{ title: 'Cancel Reservation', destructive: true, onTap: () => JC.ui.alert({ title: 'Cancel Suite 1101?', message: 'This booking was made by the Office of Pulcinella. Only the booker can cancel it. (The kids can still stay somewhere else. Nobody can make them sleep here.)', buttons: [{ text: 'OK' }] }) }] }], { cls: 'wl-list' }));
      }
      function hotelKey() {
        const ov = h('div.wl-keyov', h('div.wl-key-card', cardFace('hotel')), h('div.wl-key-wave', h('i'), h('i'), h('i')), h('b.wl-key-t', 'Hold Near Lock'), h('span.wl-key-s', 'Suite 1101 · Liyue Harbor Grand'), h('div.wl-key-x.tap', { onTap: () => close() }, 'Cancel'));
        body.appendChild(ov);
        U.anim(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
        const tm = setTimeout(() => { if (!ov.isConnected) return; ov.querySelector('.wl-key-t').textContent = 'No Lock Nearby'; ov.querySelector('.wl-key-s').textContent = 'Suite 1101 is ' + MV().fmtDist(MV().fromUser('liyue-grand')) + ' away.'; ov.classList.add('fail'); JC.audio.play('error'); }, 3600);
        function close() { clearTimeout(tm); U.anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => ov.remove()); }
      }
      function eventDetail() {
        const ended = JC.time.now() > JC.time.parse('+1 17:30');
        return h('div.wl-d',
          ended ? h('div.wl-ended', JC.icon('clock.fill', { size: 14 }), ' This performance has ended.') : h('div.wl-note', 'Doors 14:30 · Osmanthus tea and almond tofu served in the box. Two seats: one for you, one for xiansheng.'),
          actions([['Seats', 'person.2.fill', () => JC.ui.alert({ title: 'Box 2 · Seats 071820, 071821', message: 'Booked by Childe fourteen days ago. The note in Calendar says: “For xiansheng. Don’t tell him till Saturday morning.”', buttons: [{ text: 'OK' }] }), 'pri'], ['Venue', 'map.fill', () => JC.os.open('maps', { place: 'heyu' })], ['Box Office', 'phone.fill', () => JC.callui && JC.callui.dialNumber('(0761) 555 0156')], ['Details', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [{ title: 'Date', detail: 'Sat, Oct 17, 2026 · 3:00 PM' }, { title: 'Venue', detail: 'Heyu Tea House, Lantern Street' }, { title: 'Performance', detail: 'The Divine Damsel of Devastation' }, { title: 'Tickets', detail: 'Box 2 · 2 seats' }, { title: 'Paid', detail: mora(3600) }] }], { cls: 'wl-list' }));
      }
      function boardDetail() {
        return h('div.wl-d',
          h('div.wl-note', 'Shared by Mama. Unaccompanied minor service: staff release the children only to the adult named on the booking — “a Northland driver”.'),
          actions([['Status', 'airplane', () => JC.os.open('safari', { url: 'https://liyueair.ly/flight/LA711' }), 'pri'], ['Find My', 'location.fill', () => JC.os.open('findmy', { id: 'sirfang' })], ['Liyue Air', 'phone.fill', () => JC.callui && JC.callui.dialNumber('95536')], ['Details', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [{ title: 'Passengers', detail: 'TONIA · TEUCER' }, { title: 'Flight', detail: 'LA 711 · Zapolyarny → Liyue Harbor' }, { title: 'Departs', detail: 'Fri, Oct 16 · 23:50 · Gate B4' }, { title: 'Arrives', detail: 'Sat, Oct 17 · 07:40 · Gate B' }, { title: 'Seats', detail: '23A · 23B' }, { title: 'Collecting adult', detail: 'Office of Pulcinella' }] }], { cls: 'wl-list' }));
      }
      const STORES = {
        wangsheng: { place: 'wangsheng', offer: ['VIP Client offer', '10% off every service, plus a free consultation with our consultant (tea included). Coffin No. 4 excluded.'], code: 'Scan at the counter. Hu Tao will pretend to be surprised.', note: 'Issued by Hu Tao, 77th Director, after Childe paid for “a friend’s” funeral consultancy. Valid in this life and the next.', match: /wangsheng/i },
        wanmin: { place: 'wanmin-rest', offer: ['One stamp to go', 'Your next order earns a free hotpot set for four. Xiangling says she’ll add a chili.'], code: 'Show at the counter or order on Wanmin Go.', note: 'Nine stamps. Eight of them are pelmeni for the night shift.', match: /wanmin/i },
        knockout: { place: 'third-round', offer: ['Rematch pending', 'Captain Beidou wants a rematch. Loser buys the bar a round. Saturday night.'], code: 'Show at the door. Bouncer: Boris’s cousin.', note: 'Undefeated: 41–0. (Beidou disputes one of them.)', match: /knockout|third-round/i },
      };
      function storeDetail(c) {
        const d = STORES[c.id];
        return h('div.wl-d',
          actions([['Show Code', 'barcode', () => JC.ui.toast(d.code, { icon: 'barcode' }), 'pri'], ['Place', 'map.fill', () => JC.os.open('maps', { place: d.place })], ['Call', 'phone.fill', () => MV().callPlace(d.place)], ['Details', 'info.circle', () => flip()]]),
          h('div.wl-offer', h('b', d.offer[0]), h('span', d.offer[1])),
          h('div.wl-sec-h', h('b', 'Recent Visits')),
          JC.ui.list([{ rows: JC.store.all('tx').filter((t) => d.match.test(t.merchant)).sort((a, b) => b.t - a.t).slice(0, 4).map(txRow) }], { cls: 'wl-list' }));
      }
      function passBack(c) {
        const S = st();
        const rows = {
          hotel: [['Guests', 'Tonia, Teucer'], ['Booked by', 'Northland Executive Travel · Office of Pulcinella'], ['Confirmation', 'NET-1014-0711'], ['Rate', 'Corporate — Special Collections (Liyue)'], ['Notes', '“Security and room service provided. The gentlemen will wait in the lobby.”']],
          opera: [['Performance', 'The Divine Damsel of Devastation'], ['Doors', '14:30 · Heyu Tea House'], ['Box', '2 · Seats 071820, 071821'], ['Booked', '14 days ago · ' + mora(3600)], ['Terms', 'Please do not sing along. (The gentleman in Box 2 has been asked before.)']],
          flight: [['Passengers', 'TONIA · TEUCER (UMNR)'], ['Booking', 'NET-1014-0711'], ['Release to', 'Office of Pulcinella · Northland driver'], ['Change collecting adult', 'Call 95536 before landing'], ['Baggage', '2 × 23 kg · 1 plush shark (cabin)']],
          wangsheng: [['Member', 'Mr. Tartaglia (VIP)'], ['Card number', '0077 1111 0720 2026'], ['Discount', '10%'], ['Issued by', 'Hu Tao, 77th Director'], ['Note', STORES.wangsheng.note]],
          wanmin: [['Member', 'Childe'], ['Stamps', (flags().wanmin_stamp ? 10 : 9) + ' of 10'], ['Reward', 'Free hotpot set for four'], ['Chef', 'Xiangling (and Guoba)'], ['Note', STORES.wanmin.note]],
          knockout: [['Member', 'Tartaglia'], ['Record', '41–0'], ['Reward', '10 wins: free drinks for the bar'], ['Pending', 'Rematch: Captain Beidou'], ['Note', STORES.knockout.note]],
          metro: [['Card number', 'LM 1111 0720 2026'], ['Issuer', 'Liyue Metro & Ferries'], ['Express Mode', S.express ? 'On' : 'Off'], ['Valid on', 'Metro L1–L3 · harbor ferries · city buses']],
        }[c.id] || [];
        const autoKey = ['hotel', 'opera', 'flight', 'wangsheng', 'wanmin', 'knockout'].includes(c.id);
        return h('div.wl-d.wl-back',
          h('div.wl-backbar', h('b', c.title), h('span.tap', { onTap: () => flip() }, 'Done')),
          JC.ui.list([{ rows: rows.map(([k, v]) => ({ title: k, subtitle: v })) },
            autoKey ? { rows: [{ title: 'Automatic Updates', toggle: { on: S.auto[c.id] !== false, onChange: (v) => { S.auto[c.id] = v; save(); } } }, { title: 'Suggest on Lock Screen', toggle: { on: !!S.suggest[c.id], onChange: (v) => { S.suggest[c.id] = v; save(); } } }] } : null,
            { rows: [{ title: 'Share Pass', tinted: true, onTap: () => JC.ui.share({ title: c.title, subtitle: 'Wallet pass', icon: 'ticket', payload: { kind: 'text', text: c.title + ' — ' + (c.short || '') } }) },
              { title: 'Remove Pass', destructive: true, onTap: () => removePass(c) }] }].filter(Boolean), { cls: 'wl-list' }));
      }
      function removePass(c) {
        if (c.kind === 'transit') {
          JC.ui.alert({ title: 'Remove ' + c.title + '?', message: 'Removing a transit card needs the Apple Account password for this iPhone.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', buttons: [{ text: 'OK' }] }), 300); });
          return;
        }
        JC.ui.alert({ title: 'Remove Pass?', message: '“' + c.title + '” will be moved to Expired Passes.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          const S = st();
          if (!S.hidden.includes(c.id)) S.hidden.push(c.id);
          save();
          const el = stage.querySelector('.wl-card[data-id="' + c.id + '"]');
          sel = null; flipped = false;
          page.setTitle('Wallet');
          page.setRight(topButtons());
          if (el) U.anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(40px) scale(.9)' }], { duration: 300 }).then(() => { el.remove(); layout(true); });
          else layout(true);
        });
      }
      function refreshSel() {
        if (!sel) return;
        const el = stage.querySelector('.wl-card[data-id="' + sel + '"]');
        if (el) { const nf = cardFace(sel, { full: true }); nf.style.cssText = el.style.cssText; nf.className = el.className; JC.ui.onTap(nf, () => tapCard(sel)); el.replaceWith(nf); }
        renderDetail();
      }

      // ── card info (···) ──
      function cardInfo(c) {
        const S = st();
        const s = JC.ui.sheet({ title: c.short, detent: 'large', left: { text: 'Done' }, content: () => [
          h('div.wl-info-card', cardFace(c.id)),
          JC.ui.list([{ header: 'Card Information', rows: [
            { title: 'Card Number', detail: '•••• ' + c.last }, { title: 'Device Account Number', detail: '•••• ' + c.dan }, { title: 'Type', detail: c.type }, { title: 'Billing Address', subtitle: 'Pier View Residences, Feiyun Slope, Liyue Harbor' },
          ] }, { header: 'Notifications', rows: [
            { title: 'Allow Notifications', toggle: { on: S.notif[c.id] !== false, onChange: (v) => { S.notif[c.id] = v; save(); } } },
            { title: 'Transaction History', subtitle: 'Show the latest transactions on the card', toggle: { on: true, onChange: (v) => { if (!v) JC.ui.toast('History is managed by the bank', { icon: 'info.circle' }); } } },
          ] }, { rows: [
            { title: 'Contact Bank', tinted: true, onTap: () => { s.close(); if (JC.callui) JC.callui.dialNumber('(0761) 555 0110'); } },
            { title: 'Open Northland App', tinted: true, onTap: () => { s.close(); JC.os.open('northland'); } },
            { title: 'Bank Website', tinted: true, onTap: () => { s.close(); JC.os.open('safari', { url: 'https://northland.sn/' }); } },
            { title: 'Remove This Card', destructive: true, onTap: () => JC.ui.alert({ title: 'Remove Card?', message: 'Enter the Apple Account password for tartaglia@northland.sn to remove this card.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'The card was not removed.', buttons: [{ text: 'OK' }] }), 300); }) },
          ] }], { cls: 'wl-list' }),
        ] });
      }
      // ── money actions ──
      function sendMoney(request) {
        JC.ui.actionSheet({ title: request ? 'Request money from…' : 'Send money to…', actions: ['teucer', 'tonia', 'mama', 'paimon', 'lumine', 'ht'].map((cid) => ({ text: JC.contacts.short(cid), onTap: () => amountAlert(cid, request) })) });
      }
      function amountAlert(cid, request) {
        JC.ui.alert({ title: (request ? 'Request from ' : 'Send to ') + JC.contacts.short(cid), message: 'Amount in Mora (ℳ)', input: { placeholder: '0.00', kbType: 'num', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: request ? 'Request' : 'Next', style: 'default' }] }).then((x) => {
          if (x.index !== 1) return;
          const amt = Math.round(parseFloat(String(x.value || '').replace(/[^\d.]/g, '')) * 100) / 100;
          if (!amt || amt <= 0) return;
          if (request) {
            const th = JC.story.threadFor(cid);
            JC.story.send(th, { text: 'Requested ' + mora(amt) + ' with Wallet Cash.' });
            JC.ui.toast('Request sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' });
            return;
          }
          pay({ merchant: JC.contacts.short(cid), amount: amt, card: 'cash', record: false }).then((r) => {
            if (!r.ok) return;
            if (isBank(r.card)) {
              const b = JC.bank.charge({ card: r.card, merchant: JC.contacts.short(cid), contact: cid, amount: amt, cat: 'p2p', note: 'Sent with Wallet Cash', sms: 'WALLET CASH', app: 'wallet' });
              if (!b.ok) { JC.ui.alert({ title: 'Payment Declined', message: JC.bank.reasonText(b.reason), buttons: [{ text: 'OK' }] }); return; }
            } else {
              const tx = JC.store.add('tx', { card: r.card, merchant: JC.contacts.short(cid), contact: cid, amount: amt, t: JC.time.now(), cat: 'p2p', note: 'Sent with Wallet Cash' }, { front: true });
              if (r.card === 'cash') { const S = st(); S.cash = Math.round((S.cash - amt) * 100) / 100; save(); }
            }
            JC.story.send(JC.story.threadFor(cid), { text: 'Sent ' + mora(amt) + ' with Wallet Cash.' });
            refreshSel();
          });
        });
      }
      function addMoney() {
        JC.ui.actionSheet({ title: 'Add Money to Cash', actions: [100, 200, 500].map((n) => ({ text: mora(n), onTap: () => pay({ merchant: 'Wallet Cash', sub: 'Add Money', amount: n, card: 'nb', record: false }).then((r) => {
          if (!r.ok) return;
          if (isBank(r.card)) {
            const b = JC.bank.charge({ card: r.card, merchant: 'Wallet Cash', amount: n, cat: 'topup', note: 'Add Money', sms: 'WALLET CASH', app: 'wallet' });
            if (!b.ok) { JC.ui.alert({ title: 'Payment Declined', message: JC.bank.reasonText(b.reason), buttons: [{ text: 'OK' }] }); return; }
          } else {
            JC.store.add('tx', { card: r.card, merchant: 'Wallet Cash', amount: n, t: JC.time.now(), cat: 'topup', note: 'Add Money' }, { front: true });
          }
          const S = st();
          S.cash = Math.round((S.cash + n) * 100) / 100; save();
          JC.store.add('tx', { card: 'cash', merchant: 'Added from Northland •• 1111', amount: -n, t: JC.time.now(), cat: 'topup', note: 'Add Money' }, { front: true });
          refreshSel();
        }) })) });
      }
      function topUp() {
        JC.ui.actionSheet({ title: 'Top Up Liyue Metro', message: 'Balance ' + mora(st().metro), actions: [20, 50, 100].map((n) => ({ text: mora(n), onTap: () => pay({ merchant: 'Liyue Metro', sub: 'Transit top-up', amount: n, card: 'nb', cat: 'transit', note: 'Top-up · transit card in Wallet', sms: 'LIYUE METRO' }).then((r) => {
          if (!r.ok) return;
          const S = st();
          S.metro = Math.round((S.metro + n) * 100) / 100; save();
          JC.store.add('tx', { card: 'metro', merchant: 'Top-up', amount: -n, t: JC.time.now(), cat: 'topup', note: 'From ' + (r.card === 'cash' ? 'Mora Cash' : 'Northland •• 1111') }, { front: true });
          refreshSel();
        }) })) });
      }

      // ── Pay (Hold Near Reader) ──
      function payFlow(id) {
        const c = cardDef(id);
        const ov = h('div.wl-payov');
        let tm = null, offSide = null, busy = false;
        const close = () => { clearTimeout(tm); if (offSide) offSide(); if (side.isConnected) side.remove(); U.anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).then(() => ov.remove()); };
        const fid = h('div.wlp-fid.big', JC.icon('faceid', { size: 56, weight: 1.5 }));
        const t1 = h('b', 'Double-Click to Pay');
        const t2 = h('span.wl-pay-sub', 'Press the side button twice, then look at iPhone');
        const side = h('div.wlp-side.wl-pay-side', { onTap: () => go() }, h('span', 'Double Click'), h('i'));
        const mid = h('div.wl-pay-mid', h('div.tap', { onTap: () => go() }, fid), t1, t2, h('div.wl-pay-alt.tap', { onTap: () => passcode() }, 'Pay with Passcode'));
        ov.append(h('div.wl-pay-top', h('span.tap', { onTap: close }, 'Cancel')), h('div.wl-pay-card', cardFace(id)), mid, side);
        body.appendChild(ov);
        U.anim(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
        offSide = sideButton(() => go());
        function go() {
          if (busy) return;
          busy = true;
          if (offSide) { offSide(); offSide = null; }
          side.remove();
          t1.textContent = 'Face ID'; t2.textContent = '';
          faceId(fid).then(() => {
            t1.textContent = 'Face Not Recognized';
            t2.textContent = 'Try again or use the passcode';
            const alt = mid.querySelector('.wl-pay-alt'); if (alt) alt.remove();
            mid.appendChild(JC.ui.btn({ text: 'Pay with Passcode', kind: 'filled', size: 'm', cls: 'wl-pcbtn', onTap: () => passcode() }));
          });
        }
        function passcode() {
          if (offSide) { offSide(); offSide = null; }
          if (side.isConnected) side.remove();
          mid.innerHTML = '';
          mid.appendChild(keypad({ title: 'Enter iPhone Passcode', cancel: close, fail: () => { close(); JC.ui.toast('Pay disabled for 1 minute', { icon: 'lock.fill' }); }, ok: () => ready() }));
        }
        function ready() {
          mid.innerHTML = '';
          let left = 60;
          const cnt = h('span', 'Ready for 60 s');
          mid.append(h('div.wl-ready', h('div.wl-ripple', h('i'), h('i'), h('i'), JC.icon('wave.3.right', { size: 40, weight: 2.2 })), h('b', 'Hold Near Reader'), cnt, h('small', c.short + ' •• ' + c.last)));
          JC.audio.play('tink');
          const tick = () => { if (!ov.isConnected) return; left--; cnt.textContent = 'Ready for ' + left + ' s'; if (left <= 0) { close(); JC.ui.toast('No reader detected', { icon: 'wave.3.right' }); return; } tm = setTimeout(tick, 1000); };
          tm = setTimeout(tick, 1000);
        }
      }

      // ── transactions ──
      function allTx(card) {
        let q = '';
        const pg = JC.ui.page({
          title: card === 'metro' ? 'Trips' : 'Transactions', cls: 'wl-allp', bg: 'grouped',
          search: { placeholder: 'Search', onInput: (v) => { q = String(v || '').trim().toLowerCase(); pg.render(); } },
          content: () => {
            const list = txFor(card).filter((t) => !q || (t.merchant + ' ' + (t.note || '')).toLowerCase().includes(q));
            const groups = {};
            list.forEach((t) => { const d = new Date(t.t); const k = U.MONTHS[d.getMonth()] + ' ' + d.getFullYear(); (groups[k] = groups[k] || []).push(t); });
            return [Object.keys(groups).length ? JC.ui.list(Object.keys(groups).map((k) => ({ header: k, rows: groups[k].map(txRow) })), { cls: 'wl-list' }) : JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results' })];
          },
        });
        return pg;
      }
      function txPage(id) {
        const t = JC.store.get('tx', id);
        if (!t) return JC.ui.page({ title: 'Transaction', content: () => JC.ui.empty({ icon: 'creditcard.fill', title: 'Not found' }) });
        const [g, col] = CAT[t.cat] || CAT.other;
        const p = t.place ? MV().place(t.place) : null;
        const c = cardDef(t.card);
        const credit = t.amount < 0;
        JC.story.act('wallet_tx', { id: t.id });
        return JC.ui.page({
          title: '', cls: 'wl-txp', bg: 'grouped',
          content: () => [
            h('div.wl-txhead', t.contact ? JC.ui.avatar(t.contact, 64) : h('div.wl-txic.big', { style: { background: col } }, JC.icon(g, { size: 30 })), h('div.wl-txamt', { class: { credit } }, (credit ? '+' : '') + mora(Math.abs(t.amount))), h('div.wl-txm', t.merchant), h('div.wl-txs', (p ? p.city + ' · ' : '') + U.fmtDate(t.t, 'medium') + ' at ' + U.fmtTime(t.t))),
            p ? h('div.wl-txmap', { onTap: () => JC.os.open('maps', { place: p.id }) }, MV().thumb(p.id, { w: 370, h: 140, zoom: 60, style: 'explore' }), h('div.wl-txmap-cap', h('b', p.short || p.name), h('span', p.addr || ''))) : null,
            JC.ui.list([{ rows: [
              { title: 'Status', detail: t.pending ? 'Pending' : credit ? (t.cat === 'p2p' || t.cat === 'topup' ? 'Received' : 'Refunded') : 'Approved' },
              { title: credit && t.card === 'cash' ? 'To' : 'Card', detail: c ? (c.short + (c.last ? ' •• ' + c.last : '')) : t.card },
              t.note ? { title: 'Details', subtitle: t.note } : null,
            ].filter(Boolean) }, { rows: [
              p ? { title: 'Show in Maps', tinted: true, onTap: () => JC.os.open('maps', { place: p.id }) } : null,
              t.contact ? { title: 'Message ' + JC.contacts.short(t.contact), tinted: true, onTap: () => JC.os.open('messages', { thread: JC.story.threadFor(t.contact) }) } : null,
              { title: 'Report an Issue', tinted: true, onTap: () => JC.ui.actionSheet({ title: 'Report an Issue', message: t.merchant, actions: [{ text: 'I don’t recognize this', onTap: () => JC.ui.alert({ title: 'Contact Your Bank', message: 'Call Northland Bank on (0761) 555 0110 to dispute a transaction.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', style: 'default', onTap: () => JC.callui && JC.callui.dialNumber('(0761) 555 0110') }] }) }, { text: 'Wrong amount', onTap: () => JC.ui.toast('Reported to the bank', { icon: 'checkmark' }) }] }) },
            ].filter(Boolean) }], { cls: 'wl-list' }),
          ],
        });
      }

      // ── + and ··· ──
      function addSheet() {
        const s = JC.ui.sheet({ title: 'Add to Wallet', detent: 'large', left: { text: 'Cancel' }, content: () => [
          h('div.wl-addhead', h('div.wl-addic', JC.icon('creditcard.fill', { size: 30 })), h('b', 'Add to Wallet'), h('span', 'Keep your cards, keys and passes in one place.')),
          JC.ui.list([{ rows: [
            { icon: { glyph: 'creditcard.fill', bg: '#48484a' }, title: 'Debit or Credit Card', chevron: true, onTap: () => pwFail('Add Card', 'Adding a card needs the Apple Account password for tartaglia@northland.sn.') },
            { icon: { glyph: 'tram.fill', bg: '#c8102e' }, title: 'Transit Card', chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Transit Cards', actions: ['Mondstadt City Pass', 'Inazuma Rail', 'Snezhnaya Ferries'].map((n) => ({ text: n, onTap: () => JC.ui.alert({ title: n, message: 'A new transit card needs an initial top-up of ℳ20 and Face ID.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'default', onTap: () => setTimeout(() => JC.ui.alert({ title: 'Face ID Not Recognized', buttons: [{ text: 'OK' }] }), 300) }] }) })) }) },
                        { icon: { glyph: 'clock.fill', bg: '#8e8e93' }, title: 'Previous Cards', chevron: true, onTap: () => { s.close(); prevCards(); } },
          ] }, { rows: [{ icon: { glyph: 'qrcode', bg: '#0a84ff' }, title: 'Scan Code', subtitle: 'Add a pass from a code', chevron: true, onTap: () => JC.os.open('camera') }] }], { cls: 'wl-list' }),
        ] });
      }
      function pwFail(title, msg) {
        JC.ui.alert({ title, message: msg, input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'default' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'Try again, or reset the password at the owner’s account page.', buttons: [{ text: 'OK' }] }), 300); });
      }
      function prevCards() {
        JC.ui.sheet({ title: 'Previous Cards', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ footer: 'Cards you removed or that expired. Re-adding one needs the card’s security code.', rows: [
          { icon: { glyph: 'creditcard.fill', bg: '#0f2740' }, title: 'Morepesok Savings Bank', subtitle: 'Debit •• 0720 · expired 06/2024', onTap: () => JC.ui.alert({ title: 'Security Code', input: { placeholder: 'CVV', kbType: 'num', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Add', style: 'default' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Card Expired', message: 'This card expired in June 2024.', buttons: [{ text: 'OK' }] }), 300); }) },
          { icon: { glyph: 'tram.fill', bg: '#2f7d5b' }, title: 'Snezhnaya Ferries', subtitle: 'Balance ℳ3.50 · removed 2026' },
        ] }], { cls: 'wl-list' })] });
      }
      function moreMenu(anchor) {
        const S = st();
        JC.ui.menu(anchor, [
          { text: 'Orders', icon: 'bag.fill', onTap: () => nav.push(ordersPage()) },
          { text: 'Expired Passes', icon: 'clock.fill', sub: S.hidden.length ? S.hidden.length + ' pass' + (S.hidden.length > 1 ? 'es' : '') : null, onTap: () => nav.push(expiredPage()) },
          '-',
          { text: 'Wallet & Pay Settings', icon: 'gearshape.fill', onTap: () => JC.os.open('settings', { page: 'walletpay' }) },
        ]);
      }
      function ordersPage() {
        return JC.ui.page({ title: 'Orders', bg: 'grouped', content: () => {
          const o = JC.store.all('orders') || [];
          const recent = o.slice().sort((a, b) => b.t - a.t).slice(0, 6);
          return [recent.length ? JC.ui.list([{ header: 'Wanmin Go', footer: 'Order details shared by apps you paid with Wallet.', rows: recent.map((x) => ({ icon: { glyph: 'bag.fill', bg: '#e8590c' }, title: (JC.lotusEatsData && (JC.lotusEatsData.RESTS.find((r) => r.id === x.rest) || {}).name) || 'Wanmin Go', subtitle: U.fmtDate(x.t, 'medium') + ' · ' + (x.status === 'active' ? 'On the way' : x.status), detail: mora(x.total), chevron: true, onTap: () => JC.os.open('lotuseats', { id: x.id }) })) }], { cls: 'wl-list' }) : JC.ui.empty({ icon: 'bag.fill', title: 'No Orders' })];
        } });
      }
      function expiredPage() {
        const p = JC.ui.page({ title: 'Expired Passes', bg: 'grouped', content: () => {
          const S = st();
          return [S.hidden.length ? JC.ui.list([{ footer: 'Swipe left to delete permanently, or tap to put a pass back in Wallet.', rows: S.hidden.map((id) => ({ leading: h('div.wl-expthumb', cardFace(id, { cls: 'mini' })), title: cardDef(id).title, subtitle: 'Tap to unhide', onTap: () => { S.hidden = S.hidden.filter((x) => x !== id); save(); p.render(); layout(false); JC.ui.toast('Pass restored', { icon: 'checkmark' }); } })) }], { cls: 'wl-list' }) : JC.ui.empty({ icon: 'ticket', title: 'No Expired Passes' })];
        } });
        return p;
      }

      const nav = JC.ui.nav(body, () => mainPage());

      // ── intents & lifecycle ──
      const offTx = JC.bus.on('wallet:tx', () => { if (sel) refreshSel(); });
      function handle(it) {
        if (!it) return;
        while (nav.depth() > 1 && nav.pop({ instant: true })) { /* unwind */ }
        const id = it.card || it.id;
        if (it.tx) { const t = JC.store.get('tx', it.tx); if (t) { if (sel !== t.card) { collapse(); setTimeout(() => expand(t.card), 60); } setTimeout(() => nav.push(txPage(t.id)), 420); } return; }
        if (id && cardDef(id)) {
          const S = st();
          if (S.hidden.includes(id)) { S.hidden = S.hidden.filter((x) => x !== id); save(); layout(false); }
          if (sel && sel !== id) collapse();
          setTimeout(() => { if (sel !== id) expand(id); }, sel ? 380 : 60);
        }
      }
      setTimeout(() => handle(intent0), 60);
      return {
        intent: handle,
        show() { if (!sel) layout(false); },
        back() { if (nav.depth() > 1) { nav.pop(); return true; } if (flipped) { flip(); return true; } if (sel) { collapse(); return true; } return false; },
        destroy() { offTx(); },
      };
    },
  });
})();
