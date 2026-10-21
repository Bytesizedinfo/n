/* Wallet (iOS 26). Card stack (payment cards, Cash, transit, hotel key, event ticket, car key, store card) →
   tap a card to bring it to the top with its transactions / pass details; pass backs, card info, Pay flow
   (Face ID fails for a stranger → passcode → Hold Near Reader), Add (+) and ··· menus.
   Shared API (used by Lotus Eats, Swift Ride…): JC.wallet.pay({ merchant, amount, card }) → Promise<{ ok, card }>
   shows the Wallet Pay sheet; JC.wallet.charge / refund record a transaction (+ the bank's SMS for card 4417).
   Collection `tx`: { card, merchant, amount (+ charge, − credit), t, cat, note, place, pending, supp }.
   Intents: { card } or { id } (card/pass id), { tx } (transaction id). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;

  JC.icon.add({
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

  const BANK = '[Yunmeng Commercial Bank] ';
  const CARDS = [
    { id: 'ycb', kind: 'pay', title: 'Yunmeng Commercial Bank', short: 'YCB Black', last: '4417', type: 'Credit', dan: '8823', holder: 'JIANG CHENG' },
    { id: 'ymj', kind: 'pay', title: 'YMJ Corporate', short: 'YMJ Corporate', last: '1992', type: 'Corporate Credit', dan: '3051', holder: 'JIANG CHENG · YUNMENG JIANG GROUP' },
    { id: 'cash', kind: 'cash', title: 'Cash', short: 'Cash' },
    { id: 'metro', kind: 'transit', title: 'Lanling Metro', short: 'Lanling Metro' },
    { id: 'hotel', kind: 'hotel', title: 'Golden Peony Hotel', short: 'Room 1808' },
    { id: 'gala', kind: 'event', title: 'Jin Group Autumn Charity Gala', short: 'Autumn Charity Gala' },
    { id: 'sandu', kind: 'car', title: 'Sandu', short: 'Sandu' },
    { id: 'petk', kind: 'store', title: 'Pet Kingdom', short: 'Platinum Paw' },
  ];
  const cardDef = (id) => CARDS.find((c) => c.id === id) || null;
  const PAYABLE = ['ycb', 'ymj', 'cash'];

  // ── transactions (positive = charge, negative = credit) ──
  JC.store.seed('tx', [
    { id: 'tx_swift_tonight', card: 'ycb', merchant: 'Swift Ride', amount: 64, t: '+0 23:21', cat: 'ride', note: 'Koi Tower → Golden Peony Hotel', place: 'koi-tower' },
    { id: 'tx_gp_preauth', card: 'ycb', merchant: 'Golden Peony Hotel', amount: 3600, t: '-1 15:20', cat: 'hotel', note: 'Pre-authorization · Room 1808 · 3 nights', place: 'golden-peony', pending: true },
    { id: 'tx_toll_thu', card: 'ycb', merchant: 'Yunmeng–Lanling Expressway', amount: 95, t: '-1 13:02', cat: 'car', note: 'ETC toll · Sandu' },
    { id: 'tx_fuel_thu', card: 'ycb', merchant: 'Petro Yunmeng', amount: 486, t: '-1 09:12', cat: 'fuel', note: '95 octane · 62 L' },
    { id: 'tx_le_tea', card: 'ymj', merchant: 'Lotus Eats', amount: 878, t: '-2 13:10', cat: 'food', note: 'Tea Leaf Milk Tea → YMJ Warehouse B · 38 × brown sugar milk tea', place: 'tea-leaf' },
    { id: 'tx_canteen', card: 'ymj', merchant: 'Yunmeng Fresh Market', amount: 2360, t: '-3 15:40', cat: 'shop', note: 'Canteen supplies · soup week' },
    { id: 'tx_petk_oct10', card: 'ycb', merchant: 'Pet Kingdom (Lanling)', amount: 801.8, t: '-6 18:42', cat: 'pet', note: 'GiantPaws Large Breed 20 kg ¥689.00 · treats & toys ¥112.80', place: 'pet-kingdom' },
    { id: 'tx_office', card: 'ymj', merchant: 'Yunmeng Office Supply', amount: 1284.5, t: '-7 10:22', cat: 'shop', note: 'Printer toner ×6 · A4 paper' },
    { id: 'tx_rail_oct8', card: 'ycb', merchant: 'Lanling Rail', amount: 128, t: '-8 07:20', cat: 'rail', note: 'Yunmeng → Lanling South · 2nd class', place: 'yunmeng-station' },
    { id: 'tx_swift_oct8', card: 'ycb', merchant: 'Swift Ride', amount: 41, t: '-8 06:41', cat: 'ride', note: 'Lotus Pier → Yunmeng Station', place: 'lotus-pier' },
    { id: 'tx_petk_oct4', card: 'ycb', merchant: 'Pet Kingdom (Lanling)', amount: 1260, t: '-12 16:05', cat: 'pet', note: 'Dog food (bulk) · GiantPaws Large Breed', place: 'pet-kingdom' },
    { id: 'tx_allow_oct', card: 'ycb', merchant: 'Transfer to Jin Ling', amount: 3000, t: '-15 08:00', cat: 'transfer', note: 'Allowance (scheduled, 1st of every month)' },
    { id: 'tx_silver', card: 'ycb', merchant: 'Silver Lotus Jewelers', amount: 680, t: '2026-09-28 11:30', cat: 'jewel', note: 'Restoration & polish · antique silver bell', place: 'silver-lotus' },
    { id: 'tx_crtea', card: 'ycb', merchant: 'Cloud Recesses Tea Shop', amount: 880, t: '2026-09-25 09:48', cat: 'tea', note: 'White Peony · 250 g tin · delivery to The Hanshi', place: 'cr-tea-shop' },
    { id: 'tx_metro_topup', card: 'ycb', merchant: 'Lanling Metro', amount: 100, t: '2026-09-24 08:05', cat: 'transit', note: 'Top-up · transit card in Wallet' },
    { id: 'tx_swift_sep23', card: 'ycb', merchant: 'Swift Ride', amount: 38, t: '2026-09-23 21:56', cat: 'ride', note: 'Lanling South Station → Koi Tower Residences', place: 'lanling-south' },
    { id: 'tx_rail_sep23', card: 'ycb', merchant: 'Lanling Rail', amount: 128, t: '2026-09-23 19:30', cat: 'rail', note: 'Yunmeng → Lanling South · 2nd class', place: 'yunmeng-station' },
    { id: 'tx_allow_sep', card: 'ycb', merchant: 'Transfer to Jin Ling', amount: 3000, t: '2026-09-01 08:00', cat: 'transfer', note: 'Allowance (scheduled, 1st of every month)' },
    { id: 'tx_le_congee', card: 'ymj', merchant: 'Lotus Eats', amount: 75, t: '2026-03-19 01:12', cat: 'food', note: 'Night Owl Congee → YMJ Main Office', place: 'night-owl' },
    { id: 'tx_redenv', card: 'ycb', merchant: 'Transfer to Jin Ling', amount: 8888, t: '2026-02-17 09:40', cat: 'transfer', note: 'New Year 🧧 · to card ···· 7781' },
    { id: 'tx_le_qin', card: 'ycb', merchant: 'Lotus Eats', amount: 136, t: '2025-12-15 21:05', cat: 'food', note: 'Grandma Qin’s Kitchen → Koi Tower Residences', place: 'grandma-qin' },
    { id: 'tx_swift_wed', card: 'ycb', merchant: 'Swift Ride', amount: 86, t: '2025-05-20 15:08', cat: 'ride', note: 'Cloud Recesses → Gusu North Station · Comfort', place: 'cloud-recesses' },
    { id: 'tx_lmotors_ref', card: 'ycb', supp: '7781', merchant: 'Lanling Motors', amount: -26800, t: '2025-01-11 16:32', cat: 'car', note: 'Refund · deposit cancelled by primary cardholder', place: 'lanling-motors' },
    { id: 'tx_lmotors', card: 'ycb', supp: '7781', merchant: 'Lanling Motors', amount: 26800, t: '2025-01-11 14:47', cat: 'car', note: 'Deposit · sports coupe (red)', place: 'lanling-motors' },
    { id: 'tx_le_soup', card: 'ycb', merchant: 'Lotus Eats', amount: 168, t: '2024-12-09 11:50', cat: 'food', note: 'Auntie Lu’s Soup Kitchen → The Jingshi', place: 'auntie-lu' },
    { id: 'tx_le_fairy', card: 'ycb', merchant: 'Lotus Eats', amount: 186, t: '2024-10-18 10:20', cat: 'food', note: 'Pet Kingdom → Koi Tower Residences', place: 'pet-kingdom' },
    { id: 'tx_swift_guanyin', card: 'ycb', merchant: 'Swift Ride', amount: 92, t: '2024-06-21 23:44', cat: 'ride', note: 'Guanyin Temple → Lotus Pier Residence', place: 'guanyin-temple' },
    { id: 'tx_swift_reunion', card: 'ycb', merchant: 'Swift Ride', amount: 58, t: '2024-04-13 22:46', cat: 'ride', note: 'Laoma Hotpot → Cloud Recesses Guesthouse', place: 'laoma-hotpot' },
    { id: 'tx_laoma', card: 'ycb', merchant: 'Laoma Hotpot (Gusu)', amount: 1486, t: '2024-04-13 22:38', cat: 'food', note: 'Alumni reunion · table for 9', place: 'laoma-hotpot' },
    { id: 'tx_petk_bed', card: 'ycb', supp: '7781', merchant: 'Pet Kingdom', amount: 8800, t: '2022-07-03 14:22', cat: 'pet', note: 'Orthopedic dog bed XXL', place: 'pet-kingdom' },
    // Cash (person to person)
    { id: 'tx_c_jl', card: 'cash', merchant: 'A-Ling', contact: 'jl', amount: 200, t: '2026-08-28 17:30', cat: 'p2p', note: 'Learner permit. Don’t crash anything.' },
    { id: 'tx_c_add', card: 'cash', merchant: 'Added from YCB •• 4417', amount: -1000, t: '2026-06-01 09:00', cat: 'topup', note: 'Add Money' },
    { id: 'tx_c_wed', card: 'cash', merchant: 'Wei Wuxian', contact: 'wwx', amount: 5200, t: '2025-05-20 15:02', cat: 'p2p', note: 'For the wedding.' },
    { id: 'tx_c_wwx', card: 'cash', merchant: 'Wei Wuxian', contact: 'wwx', amount: -5.2, t: '2024-12-10 10:03', cat: 'p2p', note: 'thank u for the soup that u definitely didn’t send 🍲' },
    { id: 'tx_c_nhs', card: 'cash', merchant: 'Nie Huaisang', contact: 'nhs', amount: -88, t: '2024-04-14 00:12', cat: 'p2p', note: 'for the hotpot hehe~ 🙈' },
    // Lanling Metro
    { id: 'tx_m_1', card: 'metro', merchant: 'Line 1 · Jinlin → Lanling South', amount: 5, t: '2026-09-24 08:12', cat: 'transit' },
    { id: 'tx_m_top', card: 'metro', merchant: 'Top-up', amount: -100, t: '2026-09-24 08:05', cat: 'topup', note: 'From YCB •• 4417' },
    { id: 'tx_m_0', card: 'metro', merchant: 'Line 2 · Academy Road → Jinlin', amount: 3, t: '2026-09-24 07:41', cat: 'transit' },
    { id: 'tx_m_x', card: 'metro', merchant: 'Line 3 · Riverside → Peony Park', amount: 4, t: '2026-06-06 15:20', cat: 'transit' },
  ]);

  const CAT = {
    ride: ['car.fill', '#111214'], hotel: ['bed.double.fill', '#b8862b'], car: ['car.side', '#5b3fa6'], fuel: ['fuelpump', '#ff9500'],
    food: ['fork.knife', '#ff4d5e'], shop: ['bag.fill', '#5856d6'], pet: ['pawprint.fill', '#20a39e'], rail: ['tram.fill', '#0a84ff'],
    transfer: ['paperplane.fill', '#0a84ff'], jewel: ['sparkles', '#8e8e93'], tea: ['cup.and.saucer.fill', '#34a853'], transit: ['tram.fill', '#c8102e'],
    p2p: ['person.fill', '#30b0c7'], topup: ['plus', '#34c759'], other: ['creditcard.fill', '#8e8e93'],
  };

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.wallet || (d.apps.wallet = {});
    const def = { cash: 1288, metro: 86.4, express: true, hidden: [], notif: { ycb: true, ymj: true }, auto: { hotel: true, gala: true, petk: true }, suggest: { hotel: true, gala: false, petk: true }, order: null };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();
  const yen = (n) => U.fmtMoney(n);
  const passcode = () => String((JC.state.d.settings && JC.state.d.settings.passcode) || JC.world.passcode.code);
  const MM = (t) => { const d = new Date(t); return String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  function bankSms(card, text) {
    if (card !== 'ycb') return;
    try { JC.story.incoming('bank', { from: 'bank', text: BANK + text }); } catch (e) { /* no thread */ }
  }
  function record(o) {
    const t = JC.time.now();
    const tx = JC.store.add('tx', { card: o.card || 'ycb', merchant: o.merchant, amount: o.amount, t, cat: o.cat || 'other', note: o.note || '', place: o.place || null, pending: !!o.pending }, { front: true });
    const S = st();
    if (tx.card === 'cash') { S.cash = Math.round((S.cash - o.amount) * 100) / 100; save(); }
    if (o.amount > 0) bankSms(tx.card, 'Card ending 4417: ' + yen(o.amount) + ' spent at ' + String(o.sms || o.merchant).toUpperCase() + ' on ' + MM(t) + '.');
    else if (o.amount < 0) bankSms(tx.card, 'Card ending 4417: refund of ' + yen(-o.amount) + ' from ' + String(o.sms || o.merchant).toUpperCase() + ' on ' + MM(t) + '.');
    JC.bus.emit('wallet:tx', tx);
    return tx;
  }

  // ═══ Shared keypad + Face ID helpers (used by the pay sheet and the in-Wallet Pay flow) ═══
  function faceId(el) {
    // scanning → "Face Not Recognized" (whoever is holding this phone, it isn't Jiang Cheng)
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
    if (id === 'ycb') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('lotus.fill', { size: 16 }), ' YUNMENG COMMERCIAL BANK'), h('span.wl-ctype', 'Black')), h('div.wl-chip'), h('div.wl-cbot', h('span', '•••• ' + c.last), h('span.wl-net', JC.icon('wave.3.right', { size: 16, weight: 2 }), ' CREDIT')));
    else if (id === 'ymj') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('lotus.fill', { size: 16 }), ' YUNMENG JIANG GROUP'), h('span.wl-ctype', 'Corporate')), h('div.wl-chip'), h('div.wl-cbot', h('span', '•••• ' + c.last), h('span.wl-net', 'JIANG CHENG')));
    else if (id === 'cash') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('lotus.fill', { size: 16 }), ' Cash'), h('span.wl-cbal', yen(S.cash))), h('div.wl-cash-swirl'), h('div.wl-cbot', h('span', 'Wallet Cash'), h('span.wl-net', 'Send & receive')));
    else if (id === 'metro') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('tram.fill', { size: 16 }), ' LANLING METRO'), h('span.wl-cbal', yen(S.metro))), h('div.wl-metro-koi'), h('div.wl-cbot', h('span', S.express ? 'Express Mode' : 'Transit card'), h('span.wl-net', 'Lanling · Gusu interchange')));
    else if (id === 'hotel') el.append(h('div.wl-ctop', h('span.wl-bank', '✿ GOLDEN PEONY'), h('span.wl-pfield', h('small', 'ROOM'), h('b', '1808'))), h('div.wl-pmid', h('div', h('small', 'CHECK-IN'), h('b', 'Thu, Oct 15')), h('div', h('small', 'CHECK-OUT'), h('b', 'Sun, Oct 18'))), h('div.wl-cbot', h('span', 'Hold near the door lock'), h('span.wl-net', JC.icon('wave.3.right', { size: 16, weight: 2 }))));
    else if (id === 'gala') el.append(h('div.wl-ctop', h('span.wl-bank', 'JIN GROUP'), h('span.wl-pfield', h('small', 'FRI, OCT 16'), h('b', '7:00 PM'))), h('div.wl-gala-t', 'Autumn Charity Gala 2026'), h('div.wl-pmid', h('div', h('small', 'TABLE'), h('b', '1')), h('div', h('small', 'SEAT'), h('b', '2')), h('div', h('small', 'VENUE'), h('b', 'Koi Tower'))), o.full ? h('div.wl-qr', qrSvg('JG-GALA-2026-T1S2-JC', 108)) : null);
    else if (id === 'sandu') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('car.key', { size: 17 }), ' Car Key'), h('span.wl-pfield', h('small', 'STATUS'), h('b', carStatus().short))), h('div.wl-car-art', JC.icon('car.side', { size: 96, weight: 1.2 })), h('div.wl-cbot', h('span', 'Sandu'), h('span.wl-net', 'Purple · Owner key')));
    else if (id === 'petk') el.append(h('div.wl-ctop', h('span.wl-bank', JC.icon('pawprint.fill', { size: 16 }), ' PET KINGDOM'), h('span.wl-pfield', h('small', 'POINTS'), h('b', '18,240'))), h('div.wl-pmid', h('div', h('small', 'TIER'), h('b', 'Platinum Paw')), h('div', h('small', 'MEMBER SINCE'), h('b', 'Oct 2018'))), o.full ? h('div.wl-bar', barSvg('6904 2018 1018 0716', 230, 54)) : h('div.wl-cbot', h('span', 'Jiang Cheng'), h('span.wl-net', 'Fairy’s account')));
    return el0;
  }
  function carStatus() {
    const known = JC.story && JC.story.flag && JC.story.flag('car_known');
    return known ? { short: 'No Signal', long: 'Not responding since 11:58 PM · Koi Tower forecourt', ok: false } : { short: 'Unlocked', long: 'Unlocked with the spare key · 11:52 PM · Koi Tower forecourt', ok: true };
  }
  // deterministic QR-ish / barcode art
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
      let card = PAYABLE.includes(o.card) ? o.card : 'ycb';
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
          h('div.wlp-head', h('div.wlp-logo', JC.icon('lotus.fill', { size: 18 }), ' Pay'), h('div.wlp-x', { onTap: () => finish(false) }, JC.icon('xmark', { size: 14, weight: 2.8 }))),
          h('div.wlp-row.tap', { onTap: () => pick() }, h('div.wlp-mini', cardFace(card, { cls: 'mini' })), h('div.wlp-rm', h('b', c.short + (c.last ? ' •• ' + c.last : '')), h('span', card === 'cash' ? 'Balance ' + yen(st().cash) : c.title)), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
          h('div.wlp-row', h('div.wlp-k', 'CONTACT'), h('div.wlp-rm', h('span', 'jiang.cheng@lotuspier.yunmeng'))),
          h('div.wlp-total', h('div', h('small', 'PAY ' + String(o.merchant || 'MERCHANT').toUpperCase()), o.sub ? h('span', o.sub) : null), h('b', yen(o.amount || 0))),
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
          h('div.wlp-cards', PAYABLE.map((id) => { const c = cardDef(id); return h('div.wlp-crow', { class: { on: id === card }, onTap: () => { card = id; main(); } }, h('div.wlp-mini', cardFace(id, { cls: 'mini' })), h('div.wlp-rm', h('b', c.short + (c.last ? ' •• ' + c.last : '')), h('span', id === 'cash' ? 'Balance ' + yen(st().cash) : c.title)), id === card ? JC.icon('checkmark', { size: 16, weight: 2.6 }) : null); })));
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
        if (card === 'cash' && st().cash < (o.amount || 0)) {
          sheet.innerHTML = '';
          sheet.append(h('div.wlp-done.err', JC.icon('exclamationmark.circle.fill', { size: 54 }), h('b', 'Insufficient Balance'), h('span', 'Cash balance is ' + yen(st().cash) + '.')));
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
          if (o.record !== false) record({ card, merchant: o.merchant, amount: o.amount, cat: o.cat, note: o.note, place: o.place, sms: o.sms });
          setTimeout(() => finish(true), 900);
        }, 1000);
      };
      main();
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
      U.anim(sheet, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: U.EASE });
    });
  }

  JC.wallet = {
    cards: () => CARDS.slice(),
    pay,
    /** card-on-file charge without UI (e.g. a finished ride) */
    charge: (o) => record(Object.assign({}, o, { amount: Math.abs(o.amount) })),
    refund: (o) => record(Object.assign({}, o, { amount: -Math.abs(o.amount) })),
    balance: (id) => (id === 'cash' ? st().cash : id === 'metro' ? st().metro : null),
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
        if (el && (c.kind === 'event' || c.kind === 'store')) { const nf = cardFace(id, { full: true }); nf.style.cssText = el.style.cssText; JC.ui.onTap(nf, () => tapCard(id)); el.replaceWith(nf); }
        page.scrollTop(true);
        page.setTitle(c.short);
        page.setRight([JC.ui.navBtn({ icon: 'ellipsis', label: 'Card options', onTap: () => (c.kind === 'pay' ? cardInfo(c) : flip()) }), JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => collapse() })]);
        layout(true);
        JC.audio.haptic(8);
        if (id === 'hotel' || id === 'gala' || id === 'petk' || id === 'sandu') JC.story.act('wallet_view', { id });
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
      function selH() { return sel === 'gala' || sel === 'petk' ? 320 : CH; }
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
        else if (c.kind === 'car') detail.append(carDetail());
        else if (c.kind === 'store') detail.append(storeDetail());
        stage.style.height = Math.max(selH() + 18 + detail.offsetHeight + 130, 400) + 'px';
      }
      const txFor = (card) => JC.store.all('tx').filter((t) => t.card === card).sort((a, b) => b.t - a.t);
      function txRow(t) {
        const [g, col] = CAT[t.cat] || CAT.other;
        const credit = t.amount < 0;
        const lead = t.contact ? JC.ui.avatar(t.contact, 40) : h('div.wl-txic', { style: { background: col } }, JC.icon(g, { size: 19 }));
        return { leading: lead, title: t.merchant, subtitle: (t.pending ? 'Pending · ' : '') + (t.supp ? 'A-Ling ···· ' + t.supp + ' · ' : '') + whenText(t.t), detail: h('span.wl-amt', { class: { credit } }, (credit ? '+' : '') + yen(Math.abs(t.amount))), chevron: true, onTap: () => nav.push(txPage(t.id)) };
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
        return h('div.wl-d',
          c.id === 'ycb'
            ? h('div.wl-balance', h('div', h('small', 'Statement Balance'), h('b', yen(38214.6))), h('div', h('small', 'Payment Due'), h('b', 'Oct 25')), h('div.wl-auto', JC.icon('checkmark.circle.fill', { size: 14 }), ' Auto-Pay'))
            : h('div.wl-balance', h('div', h('small', 'This Month'), h('b', yen(txs.filter((t) => { const d = new Date(t.t), n = JC.time.date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).reduce((a, t) => a + t.amount, 0)))), h('div', h('small', 'Expense report'), h('b', 'Oct 31')), h('div.wl-auto', JC.icon('person.fill', { size: 13 }), ' Tang Mei')),
          actions([['Pay', 'wave.3.right', () => payFlow(c.id), 'pri'], ['Card Info', 'creditcard.fill', () => cardInfo(c)], ['Bank', 'phone.fill', () => JC.story.dial('bank', { num: '95588' })], ['More', 'ellipsis', () => cardInfo(c)]]),
          S.notif[c.id] === false ? h('div.wl-note', 'Transaction notifications are off for this card.') : null,
          h('div.wl-sec-h', h('b', 'Latest Transactions'), h('span.tap', { onTap: () => nav.push(allTx(c.id)) }, 'See All')),
          JC.ui.list([{ rows: txs.slice(0, 6).map(txRow) }], { cls: 'wl-list' }),
          c.id === 'ycb' ? h('div.wl-family', JC.icon('person.2.fill', { size: 16 }), h('span', 'Supplementary card ···· 7781 · Jin Ling'), h('span.tap', { onTap: () => familySheet() }, 'Manage')) : null);
      }
      function cashDetail() {
        const S = st();
        return h('div.wl-d',
          h('div.wl-bigbal', h('small', 'Cash Balance'), h('b', yen(S.cash))),
          actions([['Send', 'paperplane.fill', () => sendMoney(false), 'pri'], ['Request', 'arrow.down', () => sendMoney(true)], ['Add Money', 'plus', () => addMoney()], ['Transfer', 'arrow.left.arrow.right', () => JC.ui.alert({ title: 'Transfer to Bank', message: 'Transfers go to Yunmeng Commercial Bank ···· 4417 in 1–3 business days. Confirm with Face ID.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Transfer', style: 'default', onTap: () => setTimeout(() => JC.ui.alert({ title: 'Face ID Not Recognized', message: 'Transfers need Face ID. Try again from the device owner’s face.', buttons: [{ text: 'OK' }] }), 300) }] })]]),
          h('div.wl-sec-h', h('b', 'Latest Transactions'), h('span.tap', { onTap: () => nav.push(allTx('cash')) }, 'See All')),
          JC.ui.list([{ rows: txFor('cash').slice(0, 6).map(txRow) }], { cls: 'wl-list' }));
      }
      function transitDetail() {
        const S = st();
        return h('div.wl-d',
          h('div.wl-bigbal', h('small', 'Balance'), h('b', yen(S.metro)), S.metro < 20 ? h('span.wl-low', 'Low balance') : null),
          actions([['Top Up', 'plus', () => topUp(), 'pri'], ['Express', 'bolt.fill', () => { S.express = !S.express; save(); JC.ui.toast('Express Mode ' + (S.express ? 'On' : 'Off'), { icon: 'bolt.fill' }); refreshSel(); }], ['Map', 'map.fill', () => JC.os.open('maps', { place: 'lanling-south' })], ['Info', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [{ title: 'Express Mode', subtitle: 'Pay fares without waking or unlocking iPhone', toggle: { on: S.express, onChange: (v) => { S.express = v; save(); refreshSel(); } } }] }], { cls: 'wl-list' }),
          h('div.wl-sec-h', h('b', 'Trips & Top-ups'), h('span.tap', { onTap: () => nav.push(allTx('metro')) }, 'See All')),
          JC.ui.list([{ rows: txFor('metro').slice(0, 6).map(txRow) }], { cls: 'wl-list' }));
      }
      function hotelDetail() {
        return h('div.wl-d',
          actions([['Unlock', 'lock.open', () => hotelKey(), 'pri'], ['Front Desk', 'phone.fill', () => (JC.callui && JC.callui.dialNumber ? JC.callui.dialNumber('+86 555 0880 1808') : MV().callPlace('golden-peony'))], ['Directions', 'arrow.triangle.turn.up.right.diamond.fill', () => JC.os.open('maps', { directions: 'golden-peony' })], ['Details', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [
            { title: 'Guest', detail: 'Mr. Jiang Cheng' }, { title: 'Room', detail: '1808 · Peony Suite, 18th floor' }, { title: 'Check-in', detail: 'Thu, Oct 15 · 3:20 PM' }, { title: 'Check-out', detail: 'Sun, Oct 18 · 12:00 PM' }, { title: 'Confirmation', detail: 'GP-1808-1015' },
          ] }, { rows: [{ title: 'Request late checkout', tinted: true, onTap: () => JC.ui.alert({ title: 'Late Checkout', message: 'Late checkout until 4:00 PM on Sunday has been requested. The front desk will confirm by message.', buttons: [{ text: 'OK' }] }) }, { title: 'Pre-authorization', detail: yen(3600), chevron: true, onTap: () => nav.push(txPage('tx_gp_preauth')) }] }], { cls: 'wl-list' }));
      }
      function hotelKey() {
        const ov = h('div.wl-keyov', h('div.wl-key-card', cardFace('hotel')), h('div.wl-key-wave', h('i'), h('i'), h('i')), h('b.wl-key-t', 'Hold Near Lock'), h('span.wl-key-s', 'Room 1808 · Golden Peony Hotel'), h('div.wl-key-x.tap', { onTap: () => close() }, 'Cancel'));
        body.appendChild(ov);
        U.anim(ov, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
        const tm = setTimeout(() => { if (!ov.isConnected) return; ov.querySelector('.wl-key-t').textContent = 'No Lock Nearby'; ov.querySelector('.wl-key-s').textContent = 'You’re on Jinxing Road. Room 1808 is ' + MV().fmtDist(MV().fromUser('golden-peony')) + ' away.'; ov.classList.add('fail'); JC.audio.play('error'); }, 3600);
        function close() { clearTimeout(tm); U.anim(ov, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => ov.remove()); }
      }
      function eventDetail() {
        return h('div.wl-d',
          h('div.wl-ended', JC.icon('clock.fill', { size: 14 }), ' This event has ended. Thanks for attending.'),
          actions([['Seating', 'person.2.fill', () => JC.ui.alert({ title: 'Table 1 · Seat 2', message: 'Official seating chart: between Jin Rulan (Seat 1) and Board Treasurer Jin Zixun (Seat 3).\n\n(Your place card was somewhere else. Someone moved it.)', buttons: [{ text: 'OK' }] }), 'pri'], ['Venue', 'map.fill', () => JC.os.open('maps', { place: 'koi-tower' })], ['Events', 'phone.fill', () => (JC.callui && JC.callui.dialNumber ? JC.callui.dialNumber('+86 555 0518 0001') : MV().callPlace('koi-tower'))], ['Details', 'info.circle', () => flip()]]),
          JC.ui.list([{ rows: [{ title: 'Date', detail: 'Fri, Oct 16, 2026 · 7:00 PM' }, { title: 'Venue', detail: 'Grand Hall, Koi Tower' }, { title: 'Dress code', detail: 'Black tie' }, { title: 'Ticket', detail: 'Table 1 · Seat 2' }, { title: 'Host', detail: 'Jin Group Charity Foundation' }] }], { cls: 'wl-list' }));
      }
      function carDetail() {
        const cs = carStatus();
        const act = (t) => () => {
          if (!cs.ok) { JC.audio.play('error'); JC.ui.alert({ title: 'Sandu Isn’t Responding', message: 'The car hasn’t connected since 11:58 PM. It may be out of range, powered off, or… underwater?', buttons: [{ text: 'OK' }] }); return; }
          JC.ui.alert({ title: 'Out of Range', message: t + ' works within about 30 m of the car. Sandu was last seen at the Koi Tower forecourt, about 15 km from you. (Who unlocked it at 11:52 PM?)', buttons: [{ text: 'OK' }] });
        };
        return h('div.wl-d',
          h('div.wl-carstat', { class: { bad: !cs.ok } }, JC.icon(cs.ok ? 'lock.fill' : 'exclamationmark.triangle.fill', { size: 16 }), h('span', cs.long)),
          actions([['Unlock', 'lock.open', act('Unlock'), 'pri'], ['Lock', 'lock.fill', act('Lock')], ['Trunk', 'car.side', act('Opening the trunk')], ['Panic', 'speaker.wave.3.fill', act('Panic alarm'), 'warn']]),
          JC.ui.list([{ rows: [
            { title: 'Share Key', chevron: true, onTap: () => JC.ui.alert({ title: 'Share Key', message: JC.story.flag && JC.story.flag('car_known') ? 'A-Ling already found a key. The spare one. In your coat.' : 'Share a key with family via Messages. Shared keys can drive the car.', buttons: [{ text: 'OK' }] }) },
            { title: 'Key Details', chevron: true, onTap: () => flip() },
            { title: 'Find the Spare Key', subtitle: '“Sandu keys” item in Find My', chevron: true, onTap: () => JC.os.open('findmy', { id: 'sandu-keys' }) },
          ] }], { cls: 'wl-list' }));
      }
      function storeDetail() {
        return h('div.wl-d',
          actions([['Show Code', 'barcode', () => JC.ui.toast('Scan at the till — 10% off giant-breed food this week', { icon: 'barcode' }), 'pri'], ['Store', 'map.fill', () => JC.os.open('maps', { place: 'pet-kingdom' })], ['Call', 'phone.fill', () => MV().callPlace('pet-kingdom')], ['Details', 'info.circle', () => flip()]]),
          h('div.wl-offer', h('b', 'Platinum Paw offer'), h('span', '10% off giant-breed food this week. You have 18,240 points (¥182 to spend).')),
          h('div.wl-sec-h', h('b', 'Recent Purchases')),
          JC.ui.list([{ rows: JC.store.all('tx').filter((t) => /pet kingdom/i.test(t.merchant)).sort((a, b) => b.t - a.t).slice(0, 4).map(txRow) }], { cls: 'wl-list' }));
      }
      function passBack(c) {
        const S = st();
        const rows = {
          hotel: [['Guest', 'Mr. Jiang Cheng'], ['Confirmation', 'GP-1808-1015'], ['Rate', 'Peony Suite · ¥1,200 / night'], ['Front desk', '+86 555 0880 1808'], ['Night manager', 'Mr. Liang'], ['Notes', 'No flowers. White peony tea in room.']],
          gala: [['Event', 'Jin Group Autumn Charity Gala 2026'], ['Doors', '6:30 PM · Grand Hall, Koi Tower'], ['Seating', 'Table 1 · Seat 2'], ['Lost property', 'Koi Tower coat check · +86 555 0518 0001'], ['Terms', 'Non-transferable. Please do not feed the koi.']],
          sandu: [['Vehicle', 'Sandu · purple sedan'], ['Key type', 'Owner key'], ['Shared keys', 'None'], ['Spare key', 'Physical key · in the coat left at the Koi Tower coat check'], ['Parked', 'Fri, Oct 16 · 6:41 PM · Koi Tower car park (owner key)'], ['Last event', 'Fri, Oct 16 · 11:52 PM · unlocked with spare key']],
          petk: [['Member', 'Jiang Cheng'], ['Card number', '6904 2018 1018 0716'], ['Tier', 'Platinum Paw'], ['Points', '18,240 (¥182)'], ['Pets', 'Fairy · Newfoundland mix · 8 yrs'], ['Store', '118 Jinxing Road, Lanling']],
          metro: [['Card number', 'LM 0716 4417 2201'], ['Issuer', 'Lanling Metro Corporation'], ['Express Mode', S.express ? 'On' : 'Off'], ['Valid on', 'Lanling Metro · buses · Gusu interchange']],
        }[c.id] || [];
        const autoKey = ['hotel', 'gala', 'petk'].includes(c.id);
        return h('div.wl-d.wl-back',
          h('div.wl-backbar', h('b', c.title), h('span.tap', { onTap: () => flip() }, 'Done')),
          JC.ui.list([{ rows: rows.map(([k, v]) => ({ title: k, subtitle: v })) },
            autoKey ? { rows: [{ title: 'Automatic Updates', toggle: { on: S.auto[c.id] !== false, onChange: (v) => { S.auto[c.id] = v; save(); } } }, { title: 'Suggest on Lock Screen', toggle: { on: !!S.suggest[c.id], onChange: (v) => { S.suggest[c.id] = v; save(); } } }] } : null,
            { rows: [{ title: 'Share Pass', tinted: true, onTap: () => JC.ui.share({ title: c.title, subtitle: 'Wallet pass', icon: 'ticket', payload: { kind: 'text', text: c.title + ' — ' + (c.short || '') } }) },
              { title: c.kind === 'car' ? 'Remove Key' : 'Remove Pass', destructive: true, onTap: () => removePass(c) }] }].filter(Boolean), { cls: 'wl-list' }));
      }
      function removePass(c) {
        if (c.kind === 'car' || c.kind === 'transit') {
          JC.ui.alert({ title: 'Remove ' + c.title + '?', message: 'Removing a ' + (c.kind === 'car' ? 'car key' : 'transit card') + ' needs the Apple Account password for this iPhone.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', buttons: [{ text: 'OK' }] }), 300); });
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
            { title: 'Card Number', detail: '•••• ' + c.last }, { title: 'Device Account Number', detail: '•••• ' + c.dan }, { title: 'Type', detail: c.type }, { title: 'Billing Address', subtitle: c.id === 'ymj' ? '1 Lotus Pier Road, Yunmeng' : '3 Lotus Pier Road, Lotus Pier Estate, Yunmeng' },
          ] }, { header: 'Notifications', rows: [
            { title: 'Allow Notifications', toggle: { on: S.notif[c.id] !== false, onChange: (v) => { S.notif[c.id] = v; save(); } } },
            { title: 'Transaction History', subtitle: 'Show the latest transactions on the card', toggle: { on: true, onChange: (v) => { if (!v) JC.ui.toast('History is managed by the bank', { icon: 'info.circle' }); } } },
          ] }, { rows: [
            { title: 'Contact Bank', tinted: true, onTap: () => { s.close(); JC.story.dial('bank', { num: '95588' }); } },
            { title: 'Bank Website', tinted: true, onTap: () => { s.close(); JC.os.open('safari', { search: 'yunmeng commercial bank' }); } },
            { title: 'Remove This Card', destructive: true, onTap: () => JC.ui.alert({ title: 'Remove Card?', message: 'Enter the Apple Account password for jiang.cheng@lotuspier.yunmeng to remove this card.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'The card was not removed.', buttons: [{ text: 'OK' }] }), 300); }) },
          ] }], { cls: 'wl-list' }),
        ] });
      }
      function familySheet() {
        JC.ui.sheet({ title: 'Supplementary Card', detent: 'medium', left: { text: 'Done' }, content: () => [
          h('div.wl-fam', JC.ui.avatar('jl', 64), h('b', 'Jin Ling'), h('span', 'Card ···· 7781 · since Sep 2020')),
          JC.ui.list([{ rows: [
            { title: 'Monthly limit', detail: '¥20,000' },
            { title: 'Spending alerts', subtitle: 'Over ¥5,000 · added Jan 2025', toggle: { on: true, onChange: () => JC.ui.toast('Alert settings saved', { icon: 'checkmark' }) } },
            { title: 'Lock Card', subtitle: 'Temporarily block purchases', toggle: { on: false, onChange: (v) => { if (v) JC.ui.alert({ title: 'Lock A-Ling’s Card?', message: 'He will get a notification. On the night before his birthday.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Lock Anyway', style: 'destructive', onTap: () => JC.ui.toast('Card ···· 7781 locked', { icon: 'lock.fill' }) }] }); } } },
          ] }], { cls: 'wl-list' }),
        ] });
      }

      // ── money actions ──
      function sendMoney(request) {
        JC.ui.actionSheet({ title: request ? 'Request money from…' : 'Send money to…', actions: ['jl', 'wwx', 'nhs', 'lxc'].map((cid) => ({ text: JC.contacts.short(cid), onTap: () => amountAlert(cid, request) })) });
      }
      function amountAlert(cid, request) {
        JC.ui.alert({ title: (request ? 'Request from ' : 'Send to ') + JC.contacts.short(cid), message: 'Amount in ¥', input: { placeholder: '0.00', kbType: 'num', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: request ? 'Request' : 'Next', style: 'default' }] }).then((x) => {
          if (x.index !== 1) return;
          const amt = Math.round(parseFloat(String(x.value || '').replace(/[^\d.]/g, '')) * 100) / 100;
          if (!amt || amt <= 0) return;
          if (request) {
            const th = JC.story.threadFor(cid);
            JC.story.send(th, { text: 'Requested ' + yen(amt) + ' with Wallet Cash.' });
            JC.ui.toast('Request sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' });
            return;
          }
          pay({ merchant: JC.contacts.short(cid), amount: amt, card: 'cash', record: false }).then((r) => {
            if (!r.ok) return;
            const tx = JC.store.add('tx', { card: r.card, merchant: JC.contacts.short(cid), contact: cid, amount: amt, t: JC.time.now(), cat: 'p2p', note: 'Sent with Wallet Cash' }, { front: true });
            if (r.card === 'cash') { const S = st(); S.cash = Math.round((S.cash - amt) * 100) / 100; save(); }
            else bankSms(r.card, 'Card ending 4417: ' + yen(amt) + ' spent at WALLET CASH on ' + MM(tx.t) + '.');
            JC.story.send(JC.story.threadFor(cid), { text: 'Sent ' + yen(amt) + ' with Wallet Cash.' });
            refreshSel();
          });
        });
      }
      function addMoney() {
        JC.ui.actionSheet({ title: 'Add Money to Cash', actions: [100, 200, 500].map((n) => ({ text: yen(n), onTap: () => pay({ merchant: 'Wallet Cash', sub: 'Add Money', amount: n, card: 'ycb', record: false }).then((r) => {
          if (!r.ok) return;
          const S = st();
          S.cash = Math.round((S.cash + n) * 100) / 100; save();
          JC.store.add('tx', { card: 'cash', merchant: 'Added from YCB •• 4417', amount: -n, t: JC.time.now(), cat: 'topup', note: 'Add Money' }, { front: true });
          JC.store.add('tx', { card: r.card, merchant: 'Wallet Cash', amount: n, t: JC.time.now(), cat: 'topup', note: 'Add Money' }, { front: true });
          bankSms(r.card, 'Card ending 4417: ' + yen(n) + ' spent at WALLET CASH on ' + MM(JC.time.now()) + '.');
          refreshSel();
        }) })) });
      }
      function topUp() {
        JC.ui.actionSheet({ title: 'Top Up Lanling Metro', message: 'Balance ' + yen(st().metro), actions: [20, 50, 100].map((n) => ({ text: yen(n), onTap: () => pay({ merchant: 'Lanling Metro', sub: 'Transit top-up', amount: n, card: 'ycb', cat: 'transit', note: 'Top-up · transit card in Wallet', sms: 'LANLING METRO' }).then((r) => {
          if (!r.ok) return;
          const S = st();
          S.metro = Math.round((S.metro + n) * 100) / 100; save();
          JC.store.add('tx', { card: 'metro', merchant: 'Top-up', amount: -n, t: JC.time.now(), cat: 'topup', note: 'From ' + (r.card === 'ymj' ? 'YMJ •• 1992' : r.card === 'cash' ? 'Cash' : 'YCB •• 4417') }, { front: true });
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
            h('div.wl-txhead', t.contact ? JC.ui.avatar(t.contact, 64) : h('div.wl-txic.big', { style: { background: col } }, JC.icon(g, { size: 30 })), h('div.wl-txamt', { class: { credit } }, (credit ? '+' : '') + yen(Math.abs(t.amount))), h('div.wl-txm', t.merchant), h('div.wl-txs', (p ? p.city + ' · ' : '') + U.fmtDate(t.t, 'medium') + ' at ' + U.fmtTime(t.t))),
            p ? h('div.wl-txmap', { onTap: () => JC.os.open('maps', { place: p.id }) }, MV().thumb(p.id, { w: 370, h: 140, zoom: 60, style: 'explore' }), h('div.wl-txmap-cap', h('b', p.short || p.name), h('span', p.addr || ''))) : null,
            JC.ui.list([{ rows: [
              { title: 'Status', detail: t.pending ? 'Pending' : credit ? (t.cat === 'p2p' || t.cat === 'topup' ? 'Received' : 'Refunded') : 'Approved' },
              { title: credit && t.card === 'cash' ? 'To' : 'Card', detail: c ? (c.short + (c.last ? ' •• ' + c.last : '')) : t.card },
              t.supp ? { title: 'Cardholder', detail: 'Jin Ling · ···· ' + t.supp } : null,
              t.note ? { title: 'Details', subtitle: t.note } : null,
            ].filter(Boolean) }, { rows: [
              p ? { title: 'Show in Maps', tinted: true, onTap: () => JC.os.open('maps', { place: p.id }) } : null,
              t.contact ? { title: 'Message ' + JC.contacts.short(t.contact), tinted: true, onTap: () => JC.os.open('messages', { thread: JC.story.threadFor(t.contact) }) } : null,
              { title: 'Report an Issue', tinted: true, onTap: () => JC.ui.actionSheet({ title: 'Report an Issue', message: t.merchant, actions: [{ text: 'I don’t recognize this', onTap: () => JC.ui.alert({ title: 'Contact Your Bank', message: 'Call 95588 to dispute a transaction.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', style: 'default', onTap: () => JC.story.dial('bank', { num: '95588' }) }] }) }, { text: 'Wrong amount', onTap: () => JC.ui.toast('Reported to the bank', { icon: 'checkmark' }) }] }) },
            ].filter(Boolean) }], { cls: 'wl-list' }),
          ],
        });
      }

      // ── + and ··· ──
      function addSheet() {
        const s = JC.ui.sheet({ title: 'Add to Wallet', detent: 'large', left: { text: 'Cancel' }, content: () => [
          h('div.wl-addhead', h('div.wl-addic', JC.icon('creditcard.fill', { size: 30 })), h('b', 'Add to Wallet'), h('span', 'Keep your cards, keys and passes in one place.')),
          JC.ui.list([{ rows: [
            { icon: { glyph: 'creditcard.fill', bg: '#48484a' }, title: 'Debit or Credit Card', chevron: true, onTap: () => pwFail('Add Card', 'Adding a card needs the Apple Account password for jiang.cheng@lotuspier.yunmeng.') },
            { icon: { glyph: 'tram.fill', bg: '#c8102e' }, title: 'Transit Card', chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Transit Cards', actions: ['Gusu Metro', 'Yunmeng Bus & Ferry', 'Qinghe City Card'].map((n) => ({ text: n, onTap: () => JC.ui.alert({ title: n, message: 'A new transit card needs an initial top-up of ¥20 and Face ID.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'default', onTap: () => setTimeout(() => JC.ui.alert({ title: 'Face ID Not Recognized', buttons: [{ text: 'OK' }] }), 300) }] }) })) }) },
            { icon: { glyph: 'car.key', bg: '#5b3fa6' }, title: 'Car Key', chevron: true, onTap: () => JC.ui.alert({ title: 'Pair a Car Key', message: 'Hold iPhone near the car’s key reader. No car found nearby.', buttons: [{ text: 'OK' }] }) },
            { icon: { glyph: 'clock.fill', bg: '#8e8e93' }, title: 'Previous Cards', chevron: true, onTap: () => { s.close(); prevCards(); } },
          ] }, { rows: [{ icon: { glyph: 'qrcode', bg: '#0a84ff' }, title: 'Scan Code', subtitle: 'Add a pass from a code', chevron: true, onTap: () => JC.os.open('camera') }] }], { cls: 'wl-list' }),
        ] });
      }
      function pwFail(title, msg) {
        JC.ui.alert({ title, message: msg, input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'default' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'Try again, or reset the password at the owner’s account page.', buttons: [{ text: 'OK' }] }), 300); });
      }
      function prevCards() {
        JC.ui.sheet({ title: 'Previous Cards', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ footer: 'Cards you removed or that expired. Re-adding one needs the card’s security code.', rows: [
          { icon: { glyph: 'creditcard.fill', bg: '#7b4bd1' }, title: 'Yunmeng Commercial Bank', subtitle: 'Debit •• 0716 · expired 06/2024', onTap: () => JC.ui.alert({ title: 'Security Code', input: { placeholder: 'CVV', kbType: 'num', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Add', style: 'default' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Card Expired', message: 'This card expired in June 2024.', buttons: [{ text: 'OK' }] }), 300); }) },
          { icon: { glyph: 'tram.fill', bg: '#2f7d5b' }, title: 'Yunmeng Bus & Ferry', subtitle: 'Balance ¥3.50 · removed 2023' },
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
          return [recent.length ? JC.ui.list([{ header: 'Lotus Eats', footer: 'Order details shared by apps you paid with Wallet.', rows: recent.map((x) => ({ icon: { glyph: 'bag.fill', bg: '#ff4d5e' }, title: (JC.lotusEatsData && (JC.lotusEatsData.RESTS.find((r) => r.id === x.rest) || {}).name) || 'Lotus Eats', subtitle: U.fmtDate(x.t, 'medium') + ' · ' + (x.status === 'active' ? 'On the way' : x.status), detail: yen(x.total), chevron: true, onTap: () => JC.os.open('lotuseats', { id: x.id }) })) }], { cls: 'wl-list' }) : JC.ui.empty({ icon: 'bag.fill', title: 'No Orders' })];
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
