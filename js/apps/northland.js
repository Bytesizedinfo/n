/* Northland Bank (app id `northland`, display name "Northland") — Childe's private-banking app and an investigation
   tool. Face ID gate (passcode fallback), Home (account carousel, quick actions, spending by category, upcoming,
   recent activity), Accounts (Personal Current · Savings "for the kids" (locked) · Corporate — Special Collections
   (view only) with the OSIAL/PH3 wire and the Executive Travel charge), statements, Payments (transfers, move money,
   standing orders, requests), Cards (freeze, limits, controls, card details behind Face ID) and a secure Inbox.
   Every movement goes through JC.bank; history lives in the shared `tx` collection (seeded by northland-data.js).
   Acts: account_view { id }, statement_view { id } ('osial', 'travel', a tx id, 'stmt:<acct>:<yyyy-mm>'),
   transfer { to, from, amount, memo } (savings → current; JC.bank emits the rest), plus JC.bank's own acts.
   Intents: { id } / { tx }, { account }, { statement: 'osial'|'travel' }, { stmt }, { tab }, { inbox }, { transfer }. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const D = () => JC.northlandData;

  // ═══ icons ═══════════════════════════════════════════════════════════════════════════════════════════════════
  JC.icon.add({
    'nl.faceid': '<path d="M4 8.5V6.5a2.5 2.5 0 0 1 2.5-2.5h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2M9 9.5v1.5M15 9.5v1.5M12 9.5v4h-1M9.5 16c1.5 1.2 3.5 1.2 5 0"/>',
    'nl.transfer': '<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',
    'nl.statement': '<path d="M7 3.5h7.5L19 8v12.5H7z"/><path d="M14.5 3.5V8H19M9.8 12h6.4M9.8 15h6.4M9.8 18h4"/>',
    'nl.contactless': '<path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17"/>',
    'nl.banknote': '<rect x="3" y="6.5" width="18" height="11" rx="1.8"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
    'nl.shield': '<path d="M12 3.2 19 6v5.5c0 4.4-3 7.8-7 9.3-4-1.5-7-4.9-7-9.3V6z"/><path d="m9 12 2.2 2.2L15.4 10"/>',
    'nl.pie': '<path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12z"/><path d="M14.5 2.8A8.6 8.6 0 0 1 21.2 9.5h-6.7z"/>',
    'nl.receipt': '<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    'nl.down': '<path d="M12 4v13M6.5 11.5 12 17l5.5-5.5M5 20.5h14"/>',
    'nl.lock': '<rect x="5.5" y="10.5" width="13" height="10" rx="2.2"/><path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7M12 14.5v2"/>',
    'nl.crest': '<path d="M12 2.8 19.4 5.6v6.2c0 4.3-3 7.7-7.4 9.4-4.4-1.7-7.4-5.1-7.4-9.4V5.6z"/><path d="M12 7v9M8.1 9.2l7.8 4.6M15.9 9.2l-7.8 4.6M12 8.6l-1.2-1.1M12 8.6l1.2-1.1M12 14.4l-1.2 1.1M12 14.4l1.2 1.1"/>',
    'nl.wave': '<path d="M3 15c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.3-1.8 4.8-.6M3 10.5c2.2-2.4 4.4-2.4 6.6 0s4.4 2.4 6.6 0 3.3-1.8 4.8-.6"/>',
    'nl.globe': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5S9.6 5.9 12 3.5z"/>',
    'nl.dice': '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/>',
    'nl.wire': '<path d="M3.5 12h11M11 7.5l4.5 4.5-4.5 4.5"/><path d="M18.5 5v14"/>',
    'nl.wallet': '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3"/><rect x="4" y="8" width="16.5" height="11.5" rx="2.4"/><path d="M15.5 13.75h2"/>',
    'nl.cup': '<path d="M5 9.5h11v4.5a5.5 5.5 0 0 1-11 0z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H15.6M3.5 21h14M8 3.5c0 1.5 1 1.5 1 3M11.5 3.5c0 1.5 1 1.5 1 3"/>',
  });

  // ═══ app icon: frosted snowflake crest on deep navy ═════════════════════════════════════════════════════════
  const ARM = 'M30 30V16.6M30 21.8l-3.4-3.2M30 21.8l3.4-3.2M30 25.6l-2.3-2.1M30 25.6l2.3-2.1';
  JC.appIcon.add('northland', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#174677"/><stop offset=".55" stop-color="#0b2a4f"/><stop offset="1" stop-color="#05142a"/></linearGradient><radialGradient id="r" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#7fb6ec" stop-opacity=".45"/><stop offset="1" stop-color="#7fb6ec" stop-opacity="0"/></radialGradient><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset="1" stop-color="#9fb6cf"/></linearGradient></defs><rect width="60" height="60" fill="url(#g)"/><rect width="60" height="60" fill="url(#r)"/><g fill="#fff" fill-opacity=".14"><circle cx="11" cy="12" r="1"/><circle cx="49" cy="9" r=".8"/><circle cx="52" cy="41" r="1.1"/><circle cx="8" cy="46" r=".7"/></g><path d="M30 8.5 46.5 14.6v13.1c0 9.4-6.6 16.9-16.5 20.8-9.9-3.9-16.5-11.4-16.5-20.8V14.6z" fill="#ffffff" fill-opacity=".06" stroke="url(#c)" stroke-width="1.6"/><g stroke="#eef5ff" stroke-width="2" stroke-linecap="round" fill="none">${[0, 60, 120, 180, 240, 300].map((a) => `<path transform="rotate(${a} 30 30)" d="${ARM}"/>`).join('')}</g><circle cx="30" cy="30" r="2.2" fill="#0b2a4f" stroke="#eef5ff" stroke-width="1.4"/></svg>`);

  // ═══ helpers ═════════════════════════════════════════════════════════════════════════════════════════════════
  const B = () => JC.bank;
  const M = (n) => U.fmtMoney(n);
  const now = () => JC.time.now();
  const flag = (n) => !!(JC.story && JC.story.flag && JC.story.flag(n));
  const act = (name, p) => { try { JC.story.act(name, p); } catch (e) { console.error('[northland] act', e); } };
  const MON = U.MONTHS || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAY = U.DAYS || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const FAMILY = ['mama', 'papa', 'tonia', 'anthon', 'teucer'];
  const pad2 = (n) => String(n).padStart(2, '0');
  const hm = (t) => { const d = new Date(t); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); };
  const dmy = (t) => { const d = new Date(t); return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); };
  const dm = (t) => { const d = new Date(t); return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3); };
  const passcode = () => String((JC.state.d.settings && JC.state.d.settings.passcode) || JC.world.passcode.code);
  const short = (cid) => (JC.contacts.get(cid) ? JC.contacts.short(cid) : cid);
  function dayLabel(t) {
    const d = new Date(t), n = new Date(now());
    const diff = U.dayDiff ? U.dayDiff(d, n) : Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return DAY[d.getDay()];
    return DAY[d.getDay()].slice(0, 3) + ', ' + d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3) + (d.getFullYear() !== n.getFullYear() ? ' ' + d.getFullYear() : '');
  }
  function relStamp(t) {
    const l = dayLabel(t);
    return l === 'Today' ? hm(t) : l === 'Yesterday' ? 'Yesterday' : l;
  }
  /** signed money: charges −ℳ46, credits +ℳ450 */
  const signed = (amt) => (amt < 0 ? '+' + M(-amt) : amt > 0 ? '−' + M(amt) : M(0));

  // app state (persisted, rewind-safe)
  function S() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const s = d.apps.northland || (d.apps.northland = {});
    const def = { faceReq: true, online: true, contactless: true, abroad: true, atm: true, gambling: true, dailyLimit: 50000, atmLimit: 20000, xferLimit: 200000, notif: { tx: true, security: true, offers: false }, soPaused: {}, loginSeen: false, loginReview: null, wire: null, chairmanAt: null, kidsMoves: 0, frozenAt: null, disputes: {} };
    Object.keys(def).forEach((k) => { if (!(k in s)) s[k] = def[k]; });
    return s;
  }
  const save = () => JC.state.save();

  // ═══ accounts ════════════════════════════════════════════════════════════════════════════════════════════════
  const EXTRA = {
    current: { short: 'Current', kind: 'Personal Current', iban: 'SN54 NBGP 1101 0000 0072 1111', full: '1101 0072 1111', branch: 'NBGP-LY-011 · Liyue Branch, Harbor Road 1', glyph: 'creditcard.fill' },
    kids: { short: 'For the kids', kind: 'Protected savings', iban: 'SN22 NBGP 1101 0000 0007 0720', full: '1101 0007 0720', branch: 'NBGP-LY-011 · Liyue Branch, Harbor Road 1', glyph: 'nl.lock', goal: 500000, rate: '3.10% AER' },
    corp: { short: 'Special Collections', kind: 'Corporate · view only', iban: 'SN09 NBGP 0001 1000 0000 0011', full: '0001 1000 0011', branch: 'NBGP-ZP-001 · Zapolyarny Palace (managed in Liyue)', glyph: 'building.2' },
  };
  function accounts() {
    const list = (B() && B().accounts()) || [];
    return ['current', 'kids', 'corp'].map((id) => {
      const w = list.find((a) => a.id === id) || list.find((a) => (id === 'current' ? a.main : false)) || { id, name: id };
      return Object.assign({ id }, w, EXTRA[id], { balance: acctBalance(id) });
    });
  }
  const acct = (id) => accounts().find((a) => a.id === id);
  function acctBalance(id) {
    if (!B()) return 0;
    if (id === 'current') return B().balance();
    if (id === 'kids') return B().balance('kids');
    if (id === 'corp') { const w = wire(); return B().balance('corp') - (w.state === 'released' ? w.amount : 0); }
    return 0;
  }
  const acctOf = (t) => t.acct || (t.card === 'kids' ? 'kids' : t.card === 'corp' ? 'corp' : (B() && B().isBankCard(t.card) ? 'current' : null));
  const allTx = () => JC.store.all('tx');
  const txs = (id) => allTx().filter((t) => acctOf(t) === id).sort((a, b) => b.t - a.t);
  const txGet = (id) => JC.store.get('tx', id) || allTx().find((t) => t.key === id) || null;
  /** balance after each line, derived backwards from the live balance */
  function running(id) {
    let b = acctBalance(id);
    const out = {};
    txs(id).forEach((t) => { if (t.pending || t.declined) { out[t.id] = null; return; } out[t.id] = b; b += Number(t.amount) || 0; });
    return out;
  }

  // ═══ categories (fixed colour order per category identity) ═════════════════════════════════════════════════
  const CATS = [
    { id: 'dining', name: 'Dining & tea', glyph: 'nl.cup' },
    { id: 'family', name: 'Family', glyph: 'heart.fill' },
    { id: 'delivery', name: 'Delivery', glyph: 'bag.fill' },
    { id: 'shopping', name: 'Shopping', glyph: 'gift.fill' },
    { id: 'leisure', name: 'Fishing & fun', glyph: 'nl.wave' },
    { id: 'transport', name: 'Transport', glyph: 'car.fill' },
    { id: 'other', name: 'Bills & other', glyph: 'nl.receipt' },
  ];
  CATS.forEach((c, i) => { c.color = 'var(--nl-c' + (i + 1) + ')'; });
  const catDef = (id) => CATS.find((c) => c.id === id) || CATS[6];
  function catOf(t) {
    const c = String(t.cat || '').toLowerCase();
    if (['savings', 'income', 'interest', 'internal', 'notice', 'topup'].includes(c)) return null;
    if (c === 'transfer' || c === 'p2p') return t.contact && FAMILY.includes(t.contact) ? 'family' : 'other';
    if (t.app === 'lotuseats' || c === 'food' || c === 'delivery') return 'delivery';
    if (['dining', 'restaurant', 'tea', 'cafe', 'drinks'].includes(c)) return 'dining';
    if (['shop', 'shopping', 'gifts', 'gift', 'toys', 'market', 'jewel', 'antiques', 'books'].includes(c) || t.app === 'feiyun') return 'shopping';
    if (['leisure', 'fishing', 'games', 'game', 'opera', 'entertainment', 'music', 'tickets'].includes(c) || t.app === 'reelrush') return 'leisure';
    if (['ride', 'transport', 'transit', 'travel', 'rail', 'fuel', 'flight'].includes(c) || t.app === 'swift') return 'transport';
    return 'other';
  }
  const CAT_LABEL = { dining: 'Dining & tea', delivery: 'Food delivery', food: 'Food delivery', shopping: 'Shopping', shop: 'Shopping', gifts: 'Gifts', fishing: 'Fishing', leisure: 'Leisure', transport: 'Transport', ride: 'Transport', transfer: 'Transfer', p2p: 'Transfer', savings: 'Savings', income: 'Income', bills: 'Bills', health: 'Health', services: 'Services', interest: 'Interest', wire: 'Wire', travel: 'Travel', payroll: 'Payroll', collections: 'Collections', internal: 'Internal', office: 'Office', notice: 'Notice' };
  const catLabel = (t) => CAT_LABEL[t.cat] || (t.cat ? t.cat[0].toUpperCase() + t.cat.slice(1) : 'Payment');
  function monthRange(y, m) { return [new Date(y, m, 1).getTime(), new Date(y, m + 1, 1).getTime()]; }
  function spending(y, m) {
    const [a, b] = monthRange(y, m);
    const end = Math.min(b, now() + 1);
    const by = {};
    let total = 0;
    txs('current').forEach((t) => {
      if (t.t < a || t.t >= end || !(t.amount > 0) || t.declined) return;
      const c = catOf(t);
      if (!c) return;
      by[c] = (by[c] || 0) + t.amount;
      total += t.amount;
    });
    const segs = CATS.filter((c) => by[c.id]).map((c) => ({ cat: c, amount: by[c.id], pct: total ? by[c.id] / total : 0 }));
    return { total, segs, by };
  }

  // ═══ merchant logos ══════════════════════════════════════════════════════════════════════════════════════════
  const LOGOS = [
    [/liuli/i, { t: 'LP', bg: '#7b2433' }], [/xinyue/i, { t: 'XK', bg: '#a8641c' }], [/third-round/i, { t: '3R', bg: '#2f5d3a' }],
    [/heyu/i, { t: 'HT', bg: '#8a3b6b' }], [/wanmin go/i, { t: 'W', bg: '#e03131', round: true }], [/wanmin/i, { t: 'W', bg: '#c92a2a' }],
    [/harbor ride/i, { g: 'car.fill', bg: '#0ca678' }], [/liyue post/i, { g: 'envelope.fill', bg: '#2b6cb0' }], [/tackle/i, { e: '🎣', bg: '#dbe9f6' }],
    [/mingyun/i, { e: '🧸', bg: '#fff1d6' }], [/shitou/i, { t: 'S', bg: '#5c5f3a' }], [/wanwen/i, { g: 'book.fill', bg: '#7a4b2a' }],
    [/mingxing/i, { g: 'sparkles', bg: '#8d7a3c' }], [/bubu/i, { g: 'cross.case.fill', bg: '#2f9e44' }], [/pier view/i, { g: 'house.fill', bg: '#495a6e' }],
    [/steambird/i, { t: 'SB', bg: '#3b3b3f' }], [/wangsheng/i, { t: 'WS', bg: '#4a1d2a' }], [/salary|northland|zapolyarny/i, { g: 'snowflake', bg: '#0c2b4f' }],
    [/feiyun/i, { t: 'F', bg: '#e67700' }], [/reel rush/i, { e: '🐟', bg: '#d0ebff' }], [/jade cup/i, { e: '🍶', bg: '#e6f2ec' }],
    [/harbor authority/i, { g: 'flag.fill', bg: '#1f6f8b' }], [/breakfast/i, { e: '🥢', bg: '#fff0e6' }], [/convenience/i, { g: 'bag.fill', bg: '#5f6b7a' }],
    [/sea lantern/i, { t: 'SL', bg: '#1d3557' }], [/guyun marine/i, { t: 'GM', bg: '#264653' }], [/payroll/i, { g: 'person.2.fill', bg: '#3d5a80' }],
    [/qixing/i, { t: 'Q', bg: '#b08d2c' }], [/jade chamber/i, { t: 'JC', bg: '#2d6a4f' }], [/aquatics/i, { e: '🐠', bg: '#d0f0ff' }],
    [/frostfizz/i, { e: '🥤', bg: '#e3f2ff' }], [/expense claim/i, { g: 'person.fill', bg: '#6c757d' }], [/executive travel/i, { g: 'airplane', bg: '#0c2b4f' }],
    [/mandate/i, { g: 'doc.text', bg: '#6c757d' }], [/interest/i, { g: 'sparkles', bg: '#1f8f4e' }], [/savings|from personal current/i, { g: 'nl.lock', bg: '#0c2b4f' }],
  ];
  function logo(t, size) {
    size = size || 40;
    const st = { width: size + 'px', height: size + 'px', borderRadius: Math.round(size * 0.3) + 'px' };
    if (t.contact && JC.contacts.get(t.contact)) { const a = JC.ui.avatar(t.contact, size); a.classList.add('nl-logo-av'); return a; }
    const hit = LOGOS.find(([re]) => re.test(t.merchant || ''));
    const L = hit ? hit[1] : { t: String(t.merchant || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, 1).toUpperCase() || '?', bg: '#7d8794' };
    const el = h('div.nl-logo', { style: Object.assign({ background: L.bg }, st) });
    if (L.round) el.style.borderRadius = '50%';
    if (L.g) { el.appendChild(JC.icon(L.g, { size: Math.round(size * 0.5) })); el.classList.add('glyph'); }
    else if (L.e) { el.appendChild(h('span.nl-logo-e', { style: { fontSize: Math.round(size * 0.52) + 'px' } }, L.e)); el.classList.add('emoji'); }
    else el.appendChild(h('span.nl-logo-t', { style: { fontSize: Math.round(size * (L.t.length > 1 ? 0.34 : 0.44)) + 'px' } }, L.t));
    return el;
  }

  // ═══ the OSIAL/PH3 wire ═════════════════════════════════════════════════════════════════════════════════════
  const REL = () => JC.time.parse('+2 23:00');
  function stopReason() {
    const f = (JC.state.d && JC.state.d.flags) || {};
    if (f.card_frozen) return 'frozen';
    if (f.leaked_yelan || f.leaked_ning) return 'leaked';
    if (f.zl_amended) return 'amended';
    if (f.ops_sabotage) return 'sabotage';
    if (f.osial_stopped) return 'stopped';
    return null;
  }
  const WIRE_TXT = {
    pending: ['Scheduled', 'Releases Sun 18 Oct, 23:00 · awaiting signatory authorization'],
    held: ['On hold', 'Suspended by the signatory: your card and outgoing payments are frozen'],
    released: ['Released', 'Paid to Sea Lantern Logistics Co.'],
    frozen: ['Blocked', 'Not released: suspended by the signatory (account freeze at 23:00)'],
    leaked: ['Returned', 'Beneficiary account frozen by order of the Liyue Qixing. Funds returned.'],
    amended: ['Cancelled', 'Cancelled by the Office of the Eighth after the Golden House agreement was amended'],
    sabotage: ['Failed', 'Rejected by the beneficiary bank: account details invalid (altered at source)'],
    stopped: ['Blocked', 'Not released'],
  };
  /** live state of the wire: { state: 'pending'|'held'|'released'|'blocked', reason, label, text, amount, release, by } */
  function wire() {
    const t = JC.store.get('tx', 'nb_c_osial');
    const amount = t ? t.amount : 3000000;
    const rel = REL();
    const f = (JC.state.d && JC.state.d.flags) || {};
    const o = { amount, release: rel, left: rel - now() };
    if (now() < rel) {
      const st = f.card_frozen ? 'held' : 'pending';
      return Object.assign(o, { state: st, label: WIRE_TXT[st][0], text: WIRE_TXT[st][1] });
    }
    if (f.osial_sent) return Object.assign(o, { state: 'released', by: 'code', label: 'Released', text: 'Authorised with the signatory code at 23:00. Paid to Sea Lantern Logistics Co.' });
    const latched = S().wire;
    const r = latched ? latched.reason : stopReason();
    if (!latched) wireLatch();
    if (!r || r === 'override') return Object.assign(o, { state: 'released', by: 'override', label: 'Released', text: 'Authorised by override (Office of the Eighth) at 23:00. Paid to Sea Lantern Logistics Co.' });
    return Object.assign(o, { state: 'blocked', reason: r, label: WIRE_TXT[r][0], text: WIRE_TXT[r][1] });
  }
  /** after 23:00 the scheduled line becomes a posted (released) or declined (blocked) line in the corporate history */
  function syncWireTx(w) {
    const t = JC.store.get('tx', 'nb_c_osial');
    if (!t || w.state === 'pending' || w.state === 'held') return;
    const rel = w.state === 'released';
    if (t.pending === false && !!t.declined === !rel) return;
    JC.store.update('tx', 'nb_c_osial', { pending: false, declined: !rel, t: REL(), note: 'OSIAL/PH3 · ' + w.label.toLowerCase() + ' Sun 18 Oct, 23:00' });
  }
  function wireLatch() {
    if (now() < REL()) return;
    const s = S();
    if (s.wire) { syncWireTx(wire()); return; }
    const f = JC.state.d.flags || {};
    s.wire = { reason: f.osial_sent ? 'code' : (stopReason() || 'override'), at: now() };
    save();
    const w = wire();
    syncWireTx(w);
    const released = w.state === 'released';
    inboxAdd({
      id: 'm_wire_result', kind: 'corporate', from: 'Northland Corporate Banking', t: REL(),
      title: 'OSIAL/PH3 — ' + w.label,
      body: [released ? 'The scheduled wire OSIAL/PH3 (ℳ3,000,000) was released to Sea Lantern Logistics Co. at 23:00.' : 'The scheduled wire OSIAL/PH3 (ℳ3,000,000) was not released.', w.text.replace(/\.$/, '') + '.', released ? 'Corporate — Special Collections (Liyue) has been debited.' : 'No funds left Corporate — Special Collections (Liyue).'],
      action: { text: 'View Payment', open: { statement: 'osial' } },
    }, flag('saw_wire'));
  }
  function countdown(ms) {
    if (ms <= 0) return 'now';
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    return (d ? d + 'd ' : '') + pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss);
  }
  const countEl = (cls) => h('span.nl-count' + (cls ? '.' + cls : ''), countdown(REL() - now()));

  // ═══ inbox (collection `nbinbox`) ════════════════════════════════════════════════════════════════════════════
  const inbox = () => JC.store.all('nbinbox').slice().sort((a, b) => b.t - a.t);
  const unread = () => JC.store.all('nbinbox').filter((m) => !m.read && !m.archived).length;
  function inboxAdd(m, notify) {
    if (JC.store.get('nbinbox', m.id) && !m.replace) return null;
    const it = JC.store.add('nbinbox', Object.assign({ t: now(), read: false }, m), { front: true });
    if (notify && !(JC.state.d.ended)) {
      const pr = S().notif;
      const k = m.kind === 'fraud' || m.kind === 'security' ? 'security' : m.kind === 'info' ? 'offers' : 'tx';
      if (pr[k] !== false && !(JC.os && JC.os.isOpen && JC.os.isOpen('northland'))) {
        JC.notify.push({ app: 'northland', title: m.from || 'Northland', body: m.title + (m.body && m.body[0] ? ' — ' + m.body[0] : ''), open: { app: 'northland', intent: { inbox: m.id } } });
      }
    }
    return it;
  }
  function syncBadge() { try { JC.notify.badge('northland', unread()); } catch (e) { /* ignore */ } }

  /** Pantalone watches every Mora (STORY: single purchase > ℳ10,000 or > ℳ25,000 in one day, or Paimon's appetite) */
  function bigSpend() {
    const start = JC.time.START;
    const list = txs('current').filter((t) => t.t >= start && t.amount > 0 && !t.declined && catOf(t));
    const single = list.filter((t) => t.amount > 10000).sort((a, b) => b.amount - a.amount)[0] || null;
    const days = {};
    list.forEach((t) => { const k = new Date(t.t).toDateString(); days[k] = (days[k] || 0) + t.amount; });
    const dayMax = Object.values(days).reduce((a, b) => Math.max(a, b), 0);
    return { single, dayMax };
  }
  function checkChairman() {
    const s = S();
    if (s.chairmanAt || JC.state.d.ended) return;
    const pt = Number(JC.state.d.flags && JC.state.d.flags.paimon_total) || 0;
    const b = bigSpend();
    if (!(pt >= 3000 || b.single || b.dayMax > 25000)) return;
    s.chairmanAt = now();
    save();
    const lines = [];
    if (b.single) lines.push('· ' + M(b.single.amount) + ' at ' + b.single.merchant + ', ' + DAY[new Date(b.single.t).getDay()] + ' ' + hm(b.single.t) + '.');
    if (b.dayMax > 25000) lines.push('· ' + M(b.dayMax) + ' in a single day, which is ' + Math.round(b.dayMax / 25000 * 10) / 10 + '× what the Chairman’s office considers a “normal” day for a Director.');
    if (pt >= 3000) lines.push('· ' + M(pt) + ' at Wanmin Go for someone your delivery notes call “Paimon”.');
    inboxAdd({
      id: 'm_chairman', kind: 'chairman', from: 'Office of the Chairman', t: now(),
      title: 'The Chairman’s office reviewed your account',
      body: ['Dear Tartaglia,', 'The Chairman’s office has reviewed your personal account this weekend, as it reviews everyone’s. A few items caught my eye:', lines.join('\n'), 'I am sure there is a delightful explanation. There usually is, with you. I would simply hate for the Eighth to find it before I do.', 'Do spend carefully, dear boy. Mora remembers.\n\nWarmly,\nPantalone\nOffice of the Chairman, Northland Bank Group'],
    }, true);
  }
  function txAlerts(ev) {
    if (!ev) return;
    if (ev.kind === 'charge' && ev.tx && acctOf(ev.tx) === 'current' && ev.tx.amount > 10000) {
      inboxAdd({ id: 'm_large_' + ev.tx.id, kind: 'fraud', from: 'Northland Fraud Prevention', t: now(), title: 'Large payment: ' + M(ev.tx.amount) + ' at ' + ev.tx.merchant, body: ['Your Northland Black card •••• 1111 was used for ' + M(ev.tx.amount) + ' at ' + ev.tx.merchant + ' at ' + hm(ev.tx.t) + '.', 'Was this you?'], confirm: ev.tx.id }, true);
    }
    if (ev.kind === 'decline') {
      const id = 'm_decl_' + Math.round(now() / 1000);
      inboxAdd({ id, kind: 'card', from: 'Northland Bank', t: now(), title: 'Declined: ' + M(ev.amount || 0) + (ev.merchant ? ' at ' + ev.merchant : ''), body: [ev.reason === 'frozen' ? 'We declined this payment because your card •••• 1111 is frozen. Unfreeze it in Cards to pay.' : 'We declined this payment because there isn’t enough money in Personal Current (' + M(B().balance()) + ').'], action: ev.reason === 'frozen' ? { text: 'Go to Cards', open: { tab: 'cards' } } : { text: 'Move Money', open: { move: 'in' } } }, false);
    }
    if (ev.kind === 'freeze') {
      const on = B().frozen();
      S().frozenAt = on ? now() : null; save();
      inboxAdd({ id: 'm_freeze', replace: true, kind: 'card', from: 'Northland Bank', t: now(), read: true, title: on ? 'Your card is frozen' : 'Your card is active again', body: on ? ['Northland Black •••• 1111 was frozen at ' + hm(now()) + '.', 'Card payments, transfers and outgoing payments you authorise — including scheduled wires on accounts you sign for — are blocked until you unfreeze.', 'As a Harbinger account, freezes are reported to the Office of the Chairman automatically.'] : ['Northland Black •••• 1111 was unfrozen at ' + hm(now()) + '. Payments work normally again.'] }, false);
    }
    checkChairman();
  }

  // boot-level wiring: alerts, badge, the wire's release, Pantalone — even if the app was never opened
  JC.bus.on('boot', () => {
    if (B()) B().on(txAlerts);
    JC.store.on('nbinbox', syncBadge);
    JC.bus.on('story:fx', () => { checkChairman(); wireLatch(); });
    JC.bus.on('minute', wireLatch);
    JC.bus.on('story:chapter', wireLatch);
    JC.bus.on('story:reset', () => setTimeout(syncBadge, 50));
    syncBadge();
  });

  // ═══ Face ID visuals ═════════════════════════════════════════════════════════════════════════════════════════
  function faceGlyph(size) {
    const el = h('div.nl-fid', { style: { width: size + 'px', height: size + 'px' } });
    el.innerHTML = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<g class="nl-fid-corners"><path d="M6 20v-7a7 7 0 0 1 7-7h7M44 6h7a7 7 0 0 1 7 7v7M58 44v7a7 7 0 0 1-7 7h-7M20 58h-7a7 7 0 0 1-7-7v-7"/></g>' +
      '<g class="nl-fid-face"><path d="M23 24v5M41 24v5M32 24v12h-3M24.5 43c4.5 3.6 10.5 3.6 15 0"/></g>' +
      '<circle class="nl-fid-ring" cx="32" cy="32" r="31" stroke-dasharray="2.5 5.5"/>' +
      '<path class="nl-fid-check" d="M19 33.5l9 9 17-19" stroke-width="4"/></svg>';
    el.reset = () => { el.classList.remove('scan', 'ok', 'fail'); };
    el.scan = () => { el.classList.remove('ok', 'fail'); el.classList.add('scan'); };
    el.ok = () => { el.classList.remove('scan'); el.classList.add('ok'); };
    return el;
  }
  function crest(size) {
    const s = h('span.nl-crest');
    s.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 60 60"><path d="M30 6.5 47.5 13v14c0 10-7 18-17.5 22.2C19.5 45 12.5 37 12.5 27V13z" fill="currentColor" fill-opacity=".08" stroke="currentColor" stroke-width="1.6"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none">${[0, 60, 120, 180, 240, 300].map((a) => `<path transform="rotate(${a} 30 28.5)" d="M30 28.5V16.8M30 21.6l-3 -2.8M30 21.6l3 -2.8M30 25l-2 -1.8M30 25l2 -1.8"/>`).join('')}</g><circle cx="30" cy="28.5" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;
    return s;
  }
  /** iOS Face ID HUD for in-app approvals → Promise<true> */
  function faceAuth() {
    return new Promise((resolve) => {
      const layer = JC.ui.layer();
      const g = faceGlyph(64);
      const lbl = h('div.nl-hud-l', 'Face ID');
      const hud = h('div.nl-hud', g, lbl);
      const back = h('div.nl-hud-back');
      layer.append(back, hud);
      JC.audio.haptic(8);
      U.anim(hud, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.85)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 260, easing: U.SPRING });
      setTimeout(() => g.scan(), 60);
      setTimeout(() => { g.ok(); JC.audio.haptic(14); JC.audio.play('tink'); }, 950);
      setTimeout(() => {
        U.anim(hud, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.92)' }], { duration: 200 }).then(() => { hud.remove(); back.remove(); });
        resolve(true);
      }, 1450);
    });
  }

  /** 6-digit passcode pad (gate fallback) */
  function passPad(o) {
    let v = '', tries = 0;
    const dots = h('div.nl-pdots', [0, 1, 2, 3, 4, 5].map(() => h('i')));
    const msg = h('div.nl-pmsg', 'Enter iPhone Passcode');
    const paint = () => dots.querySelectorAll('i').forEach((d, i) => d.classList.toggle('on', i < v.length));
    const el = h('div.nl-pad');
    const press = (k) => {
      if (k === 'del') { v = v.slice(0, -1); paint(); return; }
      if (v.length >= 6) return;
      v += k; paint(); JC.audio.play('key');
      if (v.length === 6) setTimeout(check, 140);
    };
    const check = () => {
      if (v === passcode()) { JC.audio.play('unlock'); o.ok(); return; }
      tries++;
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
      JC.audio.play('error'); JC.audio.haptic(40);
      v = ''; paint();
      msg.textContent = tries >= 3 ? 'Wrong Passcode — hint: his seat, then his birthday' : 'Wrong Passcode';
    };
    const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['', ''], ['0', ''], ['del', '']];
    el.append(msg, dots, h('div.nl-pgrid', keys.map(([k, s]) => (k === '' ? h('span') : k === 'del' ? h('div.nl-pkey.del', { onTap: () => press('del') }, JC.icon('delete.left', { size: 24 })) : h('div.nl-pkey', { onTap: () => press(k) }, h('b', k), s ? h('small', s) : null)))),
      h('div.nl-pcancel', { onTap: () => o.cancel() }, 'Cancel'));
    const onKey = (e) => { if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; } if (e.target && /input|textarea/i.test(e.target.tagName)) return; if (/^\d$/.test(e.key)) press(e.key); if (e.key === 'Backspace') press('del'); };
    document.addEventListener('keydown', onKey);
    return el;
  }

  // ═══ shared bits ═════════════════════════════════════════════════════════════════════════════════════════════
  const pill = (text, kind) => h('span.nl-pill', { class: kind ? 'k-' + kind : '' }, text);
  const section = (title, body, right) => h('div.nl-sec', h('div.nl-sec-h', h('span', title), right || null), body);
  const kvRow = (k, v, cls) => ({ custom: h('div.nl-kv' + (cls ? '.' + cls : ''), h('div.nl-kv-k', k), h('div.nl-kv-v', v)) });
  function kv(rows, o) {
    o = o || {};
    return JC.ui.list([{ header: o.header, footer: o.footer, rows: rows.filter(Boolean).map((r) => (Array.isArray(r) ? kvRow(r[0], r[1]) : r)) }], { cls: 'nl-kvlist' });
  }
  function bigBtn(icon, text, onTap, o) {
    o = o || {};
    return h('div.nl-qa', { class: { on: !!o.on, disabled: !!o.disabled }, onTap: () => { if (o.disabled) { o.why && JC.ui.toast(o.why, { icon: 'nl.lock' }); return; } onTap(); } }, h('div.nl-qa-i', JC.icon(icon, { size: 22 })), h('div.nl-qa-t', text));
  }

  // ═══ the app ═════════════════════════════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'northland',
    name: 'Northland',
    status: 'light',
    launch(win, intent0) {
      win.body.classList.add('app-northland');
      const live = new Set();
      const offs = [];
      let tabs = null, gate = null, gateOn = false, hiddenAt = 0, pendingIntent = intent0 || null;
      const reg = (p) => { live.add(p); return p; };
      const nav = () => tabs.nav();
      const push = (p) => { const r = nav().push(p); updStatus(); setTimeout(updStatus, 520); return r; };
      let rq = 0;
      const refresh = () => {
        if (rq) return;
        rq = requestAnimationFrame(() => {
          rq = 0;
          live.forEach((p) => { if (!p.el.isConnected) { if (p._gone) live.delete(p); return; } try { p.render(); } catch (e) { console.error('[northland] render', e); } });
          if (tabs) tabs.badge('inbox', unread());
          updStatus();
        });
      };
      const gone = (p) => { p._gone = true; live.delete(p); };

      function updStatus() {
        if (gateOn) { win.setStatus('light'); return; }
        const n = tabs && tabs.nav();
        const p = n && n.top();
        const hero = p && p.data && p.data.hero && p.scroll.scrollTop < (p.data.heroH || 200);
        win.setStatus(hero ? 'light' : 'auto');
        if (p && p.data && p.data.hero) p.el.classList.toggle('nl-scrolled', p.scroll.scrollTop > (p.data.heroH || 200) - 70);
      }

      // ── freeze ────────────────────────────────────────────────────────────────────────────────────────────
      function setFrozen(on, o) {
        o = o || {};
        if (on === B().frozen()) return;
        B().freeze(on);
        JC.audio.haptic(on ? 20 : 10);
        JC.audio.play(on ? 'swoosh' : 'tink');
        if (!o.quiet) JC.ui.toast(on ? 'Card frozen' : 'Card unfrozen', { icon: on ? 'snowflake' : 'checkmark' });
        refresh();
      }
      function confirmFreeze(on) {
        if (!on) { setFrozen(false); return; }
        JC.ui.alert({ title: 'Freeze card •••• 1111?', message: 'Card payments, transfers and outgoing payments you authorise — including scheduled wires on accounts you sign for — are blocked until you unfreeze. You can unfreeze at any time.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Freeze', style: 'default', onTap: () => setFrozen(true) }] });
      }

      // ── gate ──────────────────────────────────────────────────────────────────────────────────────────────
      function buildGate() {
        const g = faceGlyph(92);
        const label = h('div.nl-gate-label', 'Face ID');
        const mid = h('div.nl-gate-mid', h('div.nl-gate-fid', { onTap: () => scan() }, g), label);
        const padBox = h('div.nl-gate-padbox');
        const link = h('div.nl-gate-link', { onTap: () => showPad() }, 'Use Passcode');
        const el = h('div.nl-gate', h('div.nl-gate-frost'),
          h('div.nl-gate-top', crest(54), h('div.nl-wordmark', 'NORTHLAND'), h('div.nl-gate-sub', 'PRIVATE BANKING')),
          mid, padBox,
          h('div.nl-gate-bot', link, h('div.nl-gate-foot', 'Northland Bank Group · Liyue Branch · Harbor Road 1')));
        let tok = 0;
        function scan() {
          const my = ++tok;
          el.classList.remove('pad');
          padBox.innerHTML = '';
          g.reset();
          label.textContent = 'Face ID';
          setTimeout(() => { if (my !== tok) return; g.scan(); label.textContent = 'Looking for you…'; JC.audio.haptic(6); }, 280);
          setTimeout(() => { if (my !== tok) return; g.ok(); label.textContent = 'Welcome back'; JC.audio.haptic(16); JC.audio.play('tink'); }, 1250);
          setTimeout(() => { if (my !== tok) return; open(); }, 1750);
        }
        function showPad() {
          tok++;
          g.reset();
          el.classList.add('pad');
          padBox.innerHTML = '';
          padBox.appendChild(passPad({ ok: () => open(), cancel: () => scan() }));
        }
        function open() {
          tok++;
          U.anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 320, easing: 'ease-in' }).then(() => { el.style.display = 'none'; el.classList.remove('pad'); padBox.innerHTML = ''; });
          gateOn = false;
          updStatus();
          afterUnlock();
        }
        return {
          el,
          show() {
            gateOn = true;
            el.style.display = '';
            el.getAnimations().forEach((a) => a.cancel());
            updStatus();
            scan();
          },
          hideNow() { tok++; gateOn = false; el.style.display = 'none'; updStatus(); },
        };
      }
      function afterUnlock() {
        const s = S();
        if (!s.loginSeen) {
          s.loginSeen = true; save();
          inboxAdd({ id: 'm_login', kind: 'security', from: 'Northland Security', t: now(), title: 'Unusual login from an unrecognised device: iPhone, Pier 7', body: ['We noticed a sign-in to your Northland account at ' + hm(now()) + ' on ' + DAY[new Date(now()).getDay()] + ' from an unrecognised device: iPhone, Pier 7, Liyue Harbor.', 'Face ID was accepted, but the device fingerprint didn’t match your usual sign-in pattern.', 'If this was you, you don’t need to do anything. If it wasn’t, secure your account now: we’ll freeze your card.'], login: true }, false);
          setTimeout(() => JC.audio.play('notify'), 400);
        }
        if (pendingIntent) { const it = pendingIntent; pendingIntent = null; setTimeout(() => handleIntent(it), 60); }
        refresh();
      }
      function reviewLogin(me) {
        const s = S();
        s.loginReview = me ? 'me' : 'not-me'; save();
        const m = JC.store.get('nbinbox', 'm_login');
        if (m) JC.store.update('nbinbox', 'm_login', { read: true, done: me ? 'Marked as you' : 'Secured' });
        if (me) JC.ui.toast('Thanks — we’ll remember this iPhone', { icon: 'checkmark' });
        else JC.ui.alert({ title: 'Secure your account', message: 'We’ll freeze Northland Black •••• 1111 now. Payments, transfers and outgoing wires you authorise will be blocked until you unfreeze it in Cards.', buttons: [{ text: 'Not Now', style: 'cancel' }, { text: 'Freeze Card', style: 'destructive', onTap: () => setFrozen(true) }] });
        refresh();
      }

      // ── tx rows & lists ───────────────────────────────────────────────────────────────────────────────────
      function txSub(t, withDay) {
        const bits = [];
        bits.push(withDay ? relStamp(t.t) : hm(t.t));
        if (t.pending) bits.push('Pending');
        else if (t.declined) bits.push('Declined');
        else if (S().disputes[t.id]) bits.push('Disputed');
        bits.push(t.contact ? (t.note || 'Transfer') : (t.cat === 'savings' || t.cat === 'interest' ? t.note : catLabel(t)));
        return bits.filter(Boolean).join(' · ');
      }
      function amtEl(t, bal) {
        const credit = t.amount < 0;
        return h('div.nl-amt', h('div.nl-amt-v', { class: { pos: credit, pend: !!t.pending, zero: !t.amount } }, t.amount ? signed(t.amount) : '—'), bal != null ? h('div.nl-amt-b', M(bal)) : null);
      }
      function txRowDef(t, o) {
        o = o || {};
        return {
          cls: 'nl-txrow', leading: logo(t, 40), title: t.merchant, subtitle: txSub(t, o.withDay), right: amtEl(t, o.bal),
          onTap: () => openTx(t),
          menu: () => ({ items: [
            { text: 'View Details', icon: 'info.circle', onTap: () => openTx(t) },
            { text: 'Copy Amount', icon: 'doc.on.doc', onTap: () => { U.copy(M(Math.abs(t.amount))); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
            t.place ? { text: 'Show on Map', icon: 'map', onTap: () => JC.os.open('maps', { place: t.place }) } : null,
            acctOf(t) === 'current' && t.amount > 0 ? { text: 'Report a Problem', icon: 'exclamationmark.triangle.fill', destructive: true, onTap: () => report(t) } : null,
          ].filter(Boolean) }),
        };
      }
      function groupedTx(list, o) {
        o = o || {};
        list = list.filter((t) => t.pending).concat(list.filter((t) => !t.pending));
        const bal = o.bal || {};
        const groups = [];
        list.forEach((t) => {
          const k = t.pending ? 'Scheduled & pending' : dayLabel(t.t);
          let g = groups[groups.length - 1];
          if (!g || g.k !== k) { g = { k, rows: [] }; groups.push(g); }
          g.rows.push(txRowDef(t, { bal: o.showBal ? bal[t.id] : null }));
        });
        return JC.ui.list(groups.map((g) => ({ header: g.k, rows: g.rows })), { cls: 'nl-txlist' });
      }
      function openTx(t) {
        if (t.key === 'osial' || t.id === 'nb_c_osial') return push(wirePage());
        if (t.key === 'travel' || t.id === 'nb_c_travel') return push(travelPage());
        push(txPage(t.id));
      }
      function report(t) {
        JC.ui.actionSheet({ title: t.merchant + ' · ' + M(t.amount), message: 'What’s wrong with this payment?', actions: [
          { text: 'I don’t recognise it', onTap: () => JC.ui.alert({ title: 'Don’t recognise it?', message: 'If someone else used your card, freeze it now. We’ll open a fraud case for ' + M(t.amount) + '.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Freeze & Report', style: 'destructive', onTap: () => { dispute(t, 'fraud'); setFrozen(true); } }] }) },
          { text: 'Wrong amount charged', onTap: () => dispute(t, 'amount') },
          { text: 'I was charged twice', onTap: () => dispute(t, 'duplicate') },
        ] });
      }
      function dispute(t, why) {
        const ref = 'D-' + String(Math.abs(U.hash ? U.hash(t.id) : t.id.length * 7919)).slice(0, 5) + '-' + (why === 'fraud' ? 'F' : 'C');
        S().disputes[t.id] = { why, ref, at: now() }; save();
        inboxAdd({ id: 'm_disp_' + t.id, kind: why === 'fraud' ? 'fraud' : 'card', from: 'Northland Card Services', t: now(), read: false, title: 'Dispute opened: ' + t.merchant + ' ' + M(t.amount), body: ['We’ve opened case ' + ref + ' for ' + M(t.amount) + ' at ' + t.merchant + ' (' + dmy(t.t) + ').', 'Card Services will contact the merchant. Most cases are resolved within 10 working days.'] }, false);
        JC.ui.toast('Case ' + ref + ' opened', { icon: 'checkmark' });
        refresh();
      }

      // ── the hero top bar for pages without a kit navbar ────────────────────────────────────────────────────
      function heroBar(pg, title, right) {
        const bar = h('div.nl-topbar',
          h('div.nl-tb-l', JC.ui.navBtn({ icon: 'chevron.left', label: 'Back', weight: 2.3, iconSize: 20, onTap: () => nav().pop() })),
          h('div.nl-tb-t', title),
          h('div.nl-tb-r', right || null));
        pg.el.appendChild(bar);
        return bar;
      }
      function scrim(pg) { pg.el.appendChild(h('div.nl-scrim')); }

      // ═══ HOME ═════════════════════════════════════════════════════════════════════════════════════════════
      let carIdx = 0;
      function homePage() {
        const pg = JC.ui.page({ navbar: false, bg: 'grouped', cls: 'nl-home', data: { hero: true, heroH: 330 }, content: (p) => homeContent(p), onScroll: () => updStatus(), onShow: () => updStatus() });
        scrim(pg);
        ptr(pg);
        return reg(pg);
      }
      function greeting() {
        const hr = new Date(now()).getHours();
        if (hr < 5) return 'Still up, Ajax?';
        if (hr < 12) return 'Good morning, Ajax';
        if (hr < 18) return 'Good afternoon, Ajax';
        return 'Good evening, Ajax';
      }
      function accCard(a) {
        const fr = a.id === 'current' && B().frozen();
        const w = wire();
        return h('div.nl-acard', { class: ['a-' + a.id, fr ? 'frozen' : ''], onTap: () => push(accountPage(a.id)) },
          h('div.nl-acard-top', h('span.nl-acard-n', a.id === 'kids' ? 'Savings · “for the kids”' : a.id === 'corp' ? 'Corporate · Special Collections' : 'Personal Current'),
            a.id === 'kids' ? h('span.nl-acard-tag', JC.icon('nl.lock', { size: 12 }), 'Locked') : a.id === 'corp' ? h('span.nl-acard-tag', JC.icon('eye', { size: 12 }), 'View only') : fr ? h('span.nl-acard-tag.ice', JC.icon('snowflake', { size: 12 }), 'Frozen') : null),
          h('div.nl-acard-bal', M(a.balance)),
          h('div.nl-acard-sub', a.id === 'current' ? 'Available · Northland Black •••• 1111' : a.id === 'kids' ? Math.round(a.balance / a.goal * 100) + '% of ' + M(a.goal) + ' goal · ' + a.rate : (w.state === 'pending' || w.state === 'held' ? '1 scheduled wire · ' + M(w.amount) : 'NB-C •••• 0011')),
          a.id === 'kids' ? h('div.nl-goal', h('i', { style: { width: Math.min(100, a.balance / a.goal * 100) + '%' } })) : null);
      }
      function carousel() {
        const list = accounts();
        const dots = h('div.nl-dots', list.map((a, i) => h('i', { class: { on: i === carIdx } })));
        const track = h('div.nl-car.hscroll', list.map(accCard));
        track.addEventListener('scroll', () => {
          const i = Math.round(track.scrollLeft / (track.clientWidth * 0.88 || 1));
          if (i !== carIdx) { carIdx = U.clamp(i, 0, list.length - 1); dots.querySelectorAll('i').forEach((d, j) => d.classList.toggle('on', j === carIdx)); }
        }, { passive: true });
        requestAnimationFrame(() => { if (carIdx) track.scrollLeft = carIdx * track.clientWidth * 0.88; });
        return [track, dots];
      }
      function homeContent(pg) {
        const fr = B().frozen();
        const n = unread();
        const d = new Date(now());
        const sp = spending(d.getFullYear(), d.getMonth());
        const s = S();
        const alerts = [];
        if (s.loginSeen && !s.loginReview) {
          alerts.push(h('div.nl-alert.k-sec', h('div.nl-alert-i', JC.icon('nl.shield', { size: 22 })),
            h('div.nl-alert-m', h('b', 'Unusual login: iPhone, Pier 7'), h('span', 'An unrecognised device signed in at ' + hm((JC.store.get('nbinbox', 'm_login') || {}).t || now()) + '. Was this you?'),
              h('div.nl-alert-btns', h('div.nl-abtn', { onTap: () => reviewLogin(true) }, 'This was me'), h('div.nl-abtn.danger', { onTap: () => reviewLogin(false) }, 'Secure account')))));
        }
        if (fr) {
          alerts.push(h('div.nl-alert.k-ice', h('div.nl-alert-i', JC.icon('snowflake', { size: 22 })),
            h('div.nl-alert-m', h('b', 'Your card is frozen'), h('span', 'Payments, transfers and wires you authorise are blocked.'),
              h('div.nl-alert-btns', h('div.nl-abtn', { onTap: () => setFrozen(false) }, 'Unfreeze')))));
        }
        return [
          h('div.nl-hero',
            h('div.nl-hero-frost'),
            h('div.nl-hero-bar',
              h('div.nl-me', { onTap: () => profileSheet() }, 'A'),
              h('div.nl-hello', h('div.nl-hello-1', greeting()), h('div.nl-hello-2', crest(13), 'Northland Private')),
              h('div.nl-hbtn', { onTap: () => push(searchPage()) }, JC.icon('magnifyingglass', { size: 19 })),
              h('div.nl-hbtn', { onTap: () => tabs.select('inbox', true) }, JC.icon('bell.fill', { size: 19 }), n ? h('span.nl-hbadge', String(n)) : null)),
            ...carousel(),
            h('div.nl-qas',
              bigBtn('nl.transfer', 'Transfer', () => push(transferPage({}))),
              bigBtn('snowflake', fr ? 'Unfreeze' : 'Freeze card', () => confirmFreeze(!fr), { on: fr }),
              bigBtn('nl.statement', 'Statements', () => push(statementsPage('current'))),
              bigBtn('creditcard.fill', 'Cards', () => tabs.select('cards', true)))),
          alerts.length ? h('div.nl-alerts', alerts) : null,
          section(MON[d.getMonth()] + ' spending', spendCard(sp, d), h('span.nl-sec-a', { onTap: () => push(insightsPage()) }, 'Insights')),
          section('Upcoming', upcoming()),
          section('Recent activity', recentList(), h('span.nl-sec-a', { onTap: () => push(accountPage('current')) }, 'See All')),
          h('div.nl-foot', crest(18), h('div', 'Northland Bank Group · Liyue Branch, Harbor Road 1'), h('div', 'Deposits protected by the Snezhnayan Deposit Guarantee up to ℳ1,000,000.')),
        ];
      }
      function spendCard(sp, d) {
        const prev = spending(d.getMonth() ? d.getFullYear() : d.getFullYear() - 1, (d.getMonth() + 11) % 12);
        const day = d.getDate();
        const prevSame = (() => { const [a] = monthRange(d.getMonth() ? d.getFullYear() : d.getFullYear() - 1, (d.getMonth() + 11) % 12); const cut = a + day * 864e5; return txs('current').filter((t) => t.t >= a && t.t < cut && t.amount > 0 && catOf(t)).reduce((x, t) => x + t.amount, 0); })();
        const delta = prevSame ? Math.round((sp.total - prevSame) / prevSame * 100) : 0;
        const tip = h('div.nl-tip');
        const bar = h('div.nl-stack', sp.segs.map((s) => h('div.nl-seg', { style: { flex: String(Math.max(0.012, s.pct)), background: s.cat.color }, onTap: (e) => { e.stopPropagation(); showTip(tip, e.currentTarget, s.cat.name + ' · ' + M(s.amount) + ' · ' + Math.round(s.pct * 100) + '%'); } })));
        const top = sp.segs.slice().sort((a, b) => b.amount - a.amount);
        return h('div.nl-card.nl-spend', { onTap: () => push(insightsPage()) },
          h('div.nl-spend-h', h('div', h('div.nl-k', 'Spent so far'), h('div.nl-big', M(sp.total))),
            h('div.nl-delta', { class: { up: delta > 0 } }, JC.icon(delta > 0 ? 'arrow.up' : 'arrow.down', { size: 12 }), Math.abs(delta) + '% vs ' + MON[(d.getMonth() + 11) % 12].slice(0, 3) + ' 1–' + day)),
          h('div.nl-stack-wrap', bar, tip),
          h('div.nl-legend', top.slice(0, 4).map((s) => h('div.nl-leg', h('i', { style: { background: s.cat.color } }), h('span.nl-leg-n', s.cat.name), h('span.nl-leg-v', M(s.amount))))),
          top.length > 4 ? h('div.nl-leg-more', '+ ' + (top.length - 4) + ' more · ' + M(top.slice(4).reduce((a, s) => a + s.amount, 0))) : null,
          prev.total ? null : null);
      }
      function showTip(tip, seg, text) {
        const wrap = tip.parentElement;
        const r = JC.ui.toLocal(seg.getBoundingClientRect());
        const w = JC.ui.toLocal(wrap.getBoundingClientRect());
        tip.textContent = text;
        tip.classList.add('on');
        const x = U.clamp(r.x - w.x + r.w / 2, 70, w.w - 70);
        tip.style.left = x + 'px';
        JC.audio.haptic(5);
        clearTimeout(tip._t);
        tip._t = setTimeout(() => tip.classList.remove('on'), 2400);
      }
      function upcoming() {
        const w = wire();
        const rows = [];
        if (w.state === 'pending' || w.state === 'held' || now() < REL() + 18 * 3600e3) {
          rows.push({ cls: 'nl-uprow', leading: logo({ merchant: 'Sea Lantern Logistics' }, 40), title: 'OSIAL/PH3 wire',
            subtitle: w.state === 'pending' ? h('span', 'in ', countEl()) : w.state === 'held' ? 'On hold · card frozen' : w.label + ' · Sun 23:00',
            right: h('div.nl-amt', h('div.nl-amt-v', { class: { strike: w.state === 'blocked' } }, '−' + M(w.amount)), pill(w.label, w.state)), onTap: () => push(wirePage()) });
        }
        const nd = new Date(now());
        const next = new Date(nd.getFullYear(), nd.getMonth() + 1, 1, 8, 0);
        D().STANDING.forEach((so) => {
          const paused = S().soPaused[so.id];
          rows.push({ cls: 'nl-uprow', leading: so.to === 'kids' ? logo({ merchant: 'Savings' }, 40) : JC.contacts.get(so.to) ? logo({ contact: so.to }, 40) : logo({ merchant: so.to }, 40), title: so.title, subtitle: (paused ? 'Paused' : dm(next.getTime())) + ' · Standing order', right: h('div.nl-amt', h('div.nl-amt-v', { class: { dim: paused } }, '−' + M(so.amount))), onTap: () => standingSheet(so) });
        });
        return JC.ui.list([{ rows }], { cls: 'nl-txlist nl-flat' });
      }
      function recentList() {
        const list = txs('current').slice(0, 6);
        if (!list.length) return JC.ui.empty({ icon: 'creditcard', title: 'No activity yet' });
        return JC.ui.list([{ rows: list.map((t) => txRowDef(t, { withDay: true })) }], { cls: 'nl-txlist nl-flat' });
      }
      /** pull to refresh */
      function ptr(pg) {
        const spin = h('div.nl-ptr', JC.icon('arrow.clockwise', { size: 18 }));
        pg.el.appendChild(spin);
        U.drag(pg.scroll, {
          axis: 'y',
          filter: () => pg.scroll.scrollTop <= 0,
          start: (e, p) => (p.dy > 0 ? undefined : false),
          move: (e, p) => { const y = Math.min(110, p.dy * 0.5); pg.content.style.transform = `translateY(${y}px)`; spin.style.opacity = String(Math.min(1, y / 60)); spin.style.transform = `translateX(-50%) rotate(${y * 4}deg)`; },
          end: (e, p) => {
            const go = p.dy * 0.5 > 60;
            U.anim(pg.content, [{ transform: pg.content.style.transform }, { transform: 'translateY(0)' }], { duration: 300 }).then(() => { pg.content.style.transform = ''; });
            pg.content.style.transform = '';
            if (!go) { spin.style.opacity = '0'; return; }
            spin.classList.add('spin');
            JC.audio.haptic(10);
            setTimeout(() => { spin.classList.remove('spin'); spin.style.opacity = '0'; refresh(); JC.ui.toast('Updated just now', { icon: 'checkmark' }); }, 900);
          },
        });
      }

      // ═══ ACCOUNTS ════════════════════════════════════════════════════════════════════════════════════════
      function accountsPage() {
        const pg = JC.ui.page({ title: 'Accounts', large: true, bg: 'grouped', cls: 'nl-accts',
          right: [JC.ui.navBtn({ icon: 'magnifyingglass', onTap: () => push(searchPage()) })],
          content: () => {
            const list = accounts();
            const personal = list.filter((a) => a.id !== 'corp').reduce((x, a) => x + a.balance, 0);
            return [
              h('div.nl-net', h('div.nl-k', 'Personal total'), h('div.nl-net-v', M(personal)), h('div.nl-net-s', 'Across Personal Current and Savings · excludes corporate accounts')),
              JC.ui.list([{ header: 'Personal', rows: list.filter((a) => a.id !== 'corp').map(acctRow) }, { header: 'Corporate', footer: 'You are an authorised signatory on this account. Corporate accounts are view only in the app.', rows: list.filter((a) => a.id === 'corp').map(acctRow) },
                { header: 'Cards', rows: [{ leading: miniCard(), title: 'Northland Black', subtitle: 'Debit · •••• 1111' + (B().frozen() ? ' · Frozen' : ''), chevron: true, onTap: () => tabs.select('cards', true) }] },
                { header: 'More', rows: [
                  { icon: { glyph: 'nl.statement', bg: '#0c2b4f' }, title: 'Statements & documents', chevron: true, onTap: () => push(statementsPage('current')) },
                  { icon: { glyph: 'nl.pie', bg: '#2a78d6' }, title: 'Insights', chevron: true, onTap: () => push(insightsPage()) },
                  { icon: { glyph: 'plus', bg: '#8e8e93' }, title: 'Open an account', chevron: true, onTap: () => JC.ui.alert({ title: 'Speak to your relationship manager', message: 'New Northland Private accounts are opened by your relationship manager at the Office of the Chairman. They will be in touch. They always are.', buttons: [{ text: 'OK' }] }) },
                ] }]),
            ];
          } });
        return reg(pg);
      }
      function miniCard() { return h('div.nl-minicard', { class: { frozen: B().frozen() } }, h('i')); }
      function acctRow(a) {
        const t = a.id === 'kids' ? '“for the kids”' : a.id === 'corp' ? 'Special Collections' : 'Personal Current';
        const sub = (a.id === 'kids' ? 'Savings · ' : a.id === 'corp' ? 'Corporate (Liyue) · ' : 'Current · ') + a.number + (a.id === 'kids' ? ' · Locked' : a.id === 'corp' ? ' · View only' : '');
        return { cls: 'nl-acrow', leading: h('div.nl-acicon', { class: 'a-' + a.id }, JC.icon(a.glyph, { size: 20 })), title: t, subtitle: sub,
          right: h('div.nl-amt', h('div.nl-amt-v', M(a.balance))), chevron: true, onTap: () => push(accountPage(a.id)) };
      }
      function accountPage(id) {
        act('account_view', { id });
        const A0 = acct(id);
        let filter = 0, q = '', limit = 60;
        const listBox = h('div.nl-listbox');
        const fillList = () => {
          let list = txs(id);
          if (filter === 1) list = list.filter((t) => t.amount < 0);
          if (filter === 2) list = list.filter((t) => t.amount > 0);
          if (q) { const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); list = list.filter((t) => re.test(t.merchant + ' ' + (t.note || '') + ' ' + Math.abs(t.amount))); }
          listBox.innerHTML = '';
          if (!list.length) { listBox.appendChild(JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: q ? 'Nothing matches “' + q + '”.' : 'No transactions.' })); return; }
          listBox.appendChild(groupedTx(list.slice(0, limit), { bal: running(id), showBal: true }));
          if (list.length > limit) listBox.appendChild(h('div.nl-more', { onTap: () => { limit += 60; fillList(); } }, 'Show earlier transactions'));
        };
        const pg = JC.ui.page({ navbar: false, bg: 'grouped', cls: 'nl-acctpage', data: { hero: true, heroH: 250 },
          onScroll: () => updStatus(), onShow: () => updStatus(), onClose: () => gone(pg),
          content: () => {
            const A = acct(id);
            const fr = B().frozen();
            const w = wire();
            const actions = id === 'current' ? [
              bigBtn('nl.transfer', 'Transfer', () => push(transferPage({}))),
              bigBtn('arrow.up.arrow.down', 'Move', () => moveSheet('out')),
              bigBtn('nl.statement', 'Statements', () => push(statementsPage(id))),
              bigBtn('info.circle', 'Details', () => detailsSheet(A)),
            ] : id === 'kids' ? [
              bigBtn('plus', 'Add money', () => moveSheet('out')),
              bigBtn('nl.lock', 'Move out', () => moveSheet('in')),
              bigBtn('nl.statement', 'Statements', () => push(statementsPage(id))),
              bigBtn('info.circle', 'Details', () => detailsSheet(A)),
            ] : [
              bigBtn('nl.wire', 'Scheduled', () => push(wirePage())),
              bigBtn('nl.statement', 'Statements', () => push(statementsPage(id))),
              bigBtn('person.2.fill', 'Mandate', () => mandateSheet()),
              bigBtn('info.circle', 'Details', () => detailsSheet(A)),
            ];
            const extra = [];
            if (id === 'kids') {
              extra.push(h('div.nl-card.nl-goalcard', h('div.nl-goal-h', h('div', h('div.nl-k', 'Goal'), h('b', M(A.goal))), h('div.nl-goal-pct', Math.round(A.balance / A.goal * 100) + '%')),
                h('div.nl-goal.big', h('i', { style: { width: Math.min(100, A.balance / A.goal * 100) + '%' } })),
                h('div.nl-goal-n', 'For Tonia, Anthon and Teucer — school, and whatever comes after. ' + M(10000) + ' every 1st since July 2024.'),
                h('div.nl-goal-lock', JC.icon('nl.lock', { size: 14 }), 'Protected: Face ID to move money out. Withdrawals are reviewed by the Office of the Chairman.')));
            }
            if (id === 'corp') {
              extra.push(section('Scheduled', JC.ui.list([{ rows: [
                { cls: 'nl-uprow', leading: logo({ merchant: 'Sea Lantern Logistics' }, 40), title: 'OSIAL/PH3 wire', subtitle: w.state === 'pending' ? h('span', 'Sea Lantern · in ', countEl()) : w.state === 'held' ? 'On hold · card frozen' : w.label + ' · Sun 23:00', right: h('div.nl-amt', h('div.nl-amt-v', { class: { strike: w.state === 'blocked' } }, '−' + M(w.amount)), pill(w.label, w.state)), onTap: () => push(wirePage()) },
              ] }], { cls: 'nl-txlist nl-flat' })));
            }
            const search = JC.ui.search({ placeholder: 'Search transactions', onInput: (v) => { q = v.trim(); fillList(); } });
            if (q) search.setValue(q);
            const seg = JC.ui.segmented({ items: ['All', 'Money in', 'Money out'], value: filter, onChange: (i) => { filter = i; fillList(); } });
            fillList();
            return [
              h('div.nl-hero.small', { class: 'a-' + id },
                h('div.nl-hero-frost'),
                h('div.nl-ah-name', A.name),
                h('div.nl-ah-num', A.number + ' · ' + A.kind),
                h('div.nl-ah-bal', M(A.balance)),
                h('div.nl-ah-sub', id === 'current' ? (fr ? h('span.nl-chip.ice', JC.icon('snowflake', { size: 12 }), 'Card frozen') : 'Available balance') : id === 'kids' ? h('span.nl-chip', JC.icon('nl.lock', { size: 12 }), 'Locked · ' + A.rate) : h('span', h('span.nl-chip', JC.icon('eye', { size: 12 }), 'View only'), (w.state === 'pending' || w.state === 'held') ? ' Available ' + M(A.balance - w.amount) : '')),
                h('div.nl-qas.in', actions)),
              ...extra,
              h('div.nl-filter', search, seg),
              listBox,
            ];
          } });
        heroBar(pg, A0.name, JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
          { text: 'Copy account number', icon: 'doc.on.doc', onTap: () => { U.copy(A0.full); JC.ui.toast('Account number copied', { icon: 'doc.on.doc' }); } },
          { text: 'Share account details', icon: 'square.and.arrow.up', onTap: () => shareDetails(A0) },
          { text: 'Statements', icon: 'nl.statement', onTap: () => push(statementsPage(id)) },
          id === 'current' ? { text: B().frozen() ? 'Unfreeze card' : 'Freeze card', icon: 'snowflake', onTap: () => confirmFreeze(!B().frozen()) } : null,
        ].filter(Boolean)) }));
        return reg(pg);
      }
      function detailsSheet(A) {
        JC.ui.sheet({ title: 'Account Details', detent: 'medium', right: { text: 'Done' }, content: () => [
          kv([['Account name', A.name], ['Account holder', 'Ajax (Tartaglia)'], ['Account number', A.full], ['IBAN', A.iban], ['Branch', A.branch], A.id === 'kids' ? ['Interest', A.rate + ' · paid quarterly'] : null, A.id === 'corp' ? ['Your role', 'Authorising signatory · view only in app'] : null]),
          h('div.nl-sheetbtns', JC.ui.btn({ text: 'Share Details', icon: 'square.and.arrow.up', kind: 'tinted', size: 'l', onTap: () => shareDetails(A) }), JC.ui.btn({ text: 'Copy', icon: 'doc.on.doc', kind: 'gray', size: 'l', onTap: () => { U.copy(A.iban); JC.ui.toast('IBAN copied', { icon: 'doc.on.doc' }); } })),
        ] });
      }
      function shareDetails(A) { JC.ui.share({ title: 'Northland Bank — ' + A.name, subtitle: A.iban, icon: 'nl.crest', payload: { kind: 'text', text: 'Northland Bank · ' + A.name + '\nName: Ajax\nIBAN: ' + A.iban + '\nAccount: ' + A.full + '\nBranch: ' + A.branch } }); }
      function mandateSheet() {
        JC.ui.sheet({ title: 'Signing Mandate', detent: 'large', right: { text: 'Done' }, content: () => [
          h('div.nl-doc-intro', 'Corporate — Special Collections (Liyue) · mandate rev. 4, effective 9 Oct 2026'),
          kv([['Account owner', 'Northland Bank Group — Special Collections (Liyue)'], ['Sole authorising signatory', 'Tartaglia, Director of Special Collections'], ['Countersignature', 'Removed (rev. 4)'], ['Programme owner (OSIAL)', 'Office of the Eighth'], ['Requested by', 'Office of the Eighth · 9 Oct 2026, 16:02']], { header: 'Current mandate' }),
          kv([['rev. 3 · 24 Sep', 'Two signatures: Tartaglia + Office of the Eighth'], ['rev. 2 · 29 Aug', 'Programme OSIAL transferred to the Office of the Eighth'], ['rev. 1 · 21 Aug', 'Programme OSIAL created by Tartaglia']], { header: 'History', footer: 'Every scheduled payment on this account is released in your name.' }),
        ] });
      }

      // ── tx detail ─────────────────────────────────────────────────────────────────────────────────────────
      function txPage(id) {
        const t0 = JC.store.get('tx', id);
        if (t0) act('statement_view', { id: t0.key || t0.id, acct: acctOf(t0) });
        const pg = JC.ui.page({ title: '', bg: 'grouped', cls: 'nl-txpage', onClose: () => gone(pg),
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', onTap: () => { const t = JC.store.get('tx', id); if (t) shareTx(t); } })],
          content: () => {
            const t = JC.store.get('tx', id);
            if (!t) return [JC.ui.empty({ icon: 'creditcard', title: 'Transaction unavailable' })];
            const a = acctOf(t);
            const disp = S().disputes[t.id];
            const c = t.contact ? JC.contacts.get(t.contact) : null;
            const payee = t.contact ? D().PAYEES.find((p) => p.id === t.contact) : null;
            const status = t.pending ? 'Pending' : t.declined ? 'Declined' : disp ? 'Disputed · case ' + disp.ref : 'Completed';
            const ccat = catOf(t);
            const rows = [
              ['Status', status],
              ['When', DAY[new Date(t.t).getDay()] + ', ' + dmy(t.t) + ' at ' + hm(t.t)],
              ['Account', (acct(a) || {}).name || '—'],
              a === 'current' && !t.contact && t.cat !== 'savings' && t.cat !== 'income' ? ['Card', 'Northland Black •••• 1111'] : null,
              t.ref ? ['Reference', t.ref] : ['Reference', 'NB' + String(t.id).replace(/[^0-9a-z]/gi, '').toUpperCase().slice(-10)],
              t.note && !t.items ? ['Description', t.note] : null,
            ];
            const catRow = ccat && a === 'current' ? { title: 'Category', leading: h('i.nl-catdot', { style: { background: catDef(t.ucat || ccat).color } }), detail: catDef(t.ucat || ccat).name, chevron: true, onTap: (e) => JC.ui.menu(e.currentTarget, CATS.map((cd) => ({ text: cd.name, checked: (t.ucat || ccat) === cd.id, onTap: () => { JC.store.update('tx', t.id, { ucat: cd.id }); JC.ui.toast('Category updated', { icon: 'checkmark' }); } }))) } : null;
            return [
              h('div.nl-txhead', logo(t, 64), h('div.nl-txh-m', t.merchant), h('div.nl-txh-amt', { class: { pos: t.amount < 0, pend: !!t.pending } }, t.amount ? signed(t.amount) : '—'), h('div.nl-txh-s', status === 'Completed' ? dmy(t.t) + ' · ' + hm(t.t) : status)),
              t.items ? JC.ui.list([{ header: 'Receipt', footer: t.memo || null, rows: t.items.map(([n, v]) => ({ custom: h('div.nl-kv.item', h('div.nl-kv-k', n), h('div.nl-kv-v.num', M(v))) })).concat([{ custom: h('div.nl-kv.total', h('div.nl-kv-k', 'Total'), h('div.nl-kv-v.num', M(Math.abs(t.amount)))) }]) }]) : null,
              c ? JC.ui.list([{ header: t.amount < 0 ? 'From' : 'Sent to', rows: [{ avatar: t.contact, title: JC.contacts.short(t.contact), subtitle: payee ? payee.bank + ' · ' + payee.acct : 'Northland Pay', chevron: false }] }]) : null,
              kv(rows),
              catRow ? JC.ui.list([{ rows: [catRow] }]) : null,
              t.place ? JC.ui.list([{ rows: [{ icon: { glyph: 'mappin', bg: '#ff3b30' }, title: 'Show on Map', subtitle: t.merchant, chevron: true, onTap: () => { act('place_view', { place: t.place }); JC.os.open('maps', { place: t.place }); } }] }]) : null,
              JC.ui.list([{ rows: [
                c && t.amount > 0 ? { icon: { glyph: 'arrow.clockwise', bg: '#1d5fa3' }, title: 'Send again', chevron: true, onTap: () => push(transferPage({ to: t.contact, amount: t.amount, memo: t.note })) } : null,
                { icon: { glyph: 'square.and.arrow.up', bg: '#8e8e93' }, title: 'Share receipt', onTap: () => shareTx(t) },
                a === 'current' && t.amount > 0 && !disp ? { title: 'Report a problem', destructive: true, onTap: () => report(t) } : null,
              ].filter(Boolean) }]),
            ];
          } });
        return reg(pg);
      }
      function shareTx(t) {
        JC.ui.share({ title: t.merchant + ' · ' + M(Math.abs(t.amount)), subtitle: 'Northland Bank receipt · ' + dmy(t.t), icon: 'nl.receipt', payload: { kind: 'text', text: 'Northland Bank receipt\n' + t.merchant + '\n' + M(Math.abs(t.amount)) + ' · ' + dmy(t.t) + ' ' + hm(t.t) + (t.note ? '\n' + t.note : '') + '\nRef ' + (t.ref || t.id) } });
      }

      // ── the wire ──────────────────────────────────────────────────────────────────────────────────────────
      function wirePage() {
        act('statement_view', { id: 'osial', acct: 'corp' });
        const pg = JC.ui.page({ title: 'Corporate Wire', bg: 'grouped', cls: 'nl-wirepage', onClose: () => gone(pg),
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'Copy wire reference', icon: 'doc.on.doc', onTap: () => { U.copy('NBW-26-1018-0003'); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
            { text: 'Share details', icon: 'square.and.arrow.up', onTap: () => shareWire() },
          ]) })],
          content: () => {
            const t = JC.store.get('tx', 'nb_c_osial') || {};
            const w = wire();
            const fr = B().frozen();
            const steps = [
              ['Created', 'Office of the Eighth · Wed 14 Oct, 17:42', true],
              ['Approved', 'Office of the Eighth', true],
              ['Signatory', w.state === 'released' ? (w.by === 'code' ? 'Authorised with your code' : 'Overridden by the Office of the Eighth') : now() < REL() ? 'Awaiting your authorization code' : 'Not authorised', w.state === 'released'],
              ['Release', w.state === 'pending' ? 'Sun 18 Oct, 23:00' : w.state === 'held' ? 'Suspended — your card is frozen' : w.label + ' · Sun 23:00', w.state === 'released', w.state === 'blocked' || w.state === 'held'],
            ];
            return [
              h('div.nl-wirehead', { class: 'w-' + w.state },
                h('div.nl-wh-k', 'OSIAL/PH3 · Corporate — Special Collections'),
                h('div.nl-wh-amt', M(w.amount)),
                h('div.nl-wh-to', '→ Sea Lantern Logistics Co.'),
                pill(w.label, w.state),
                w.state === 'pending' || w.state === 'held' ? h('div.nl-wh-count', h('small', w.state === 'held' ? 'Release time' : 'Releases in'), countEl('big')) : h('div.nl-wh-res', w.text),
                h('div.nl-steps', steps.map(([k, v, done, bad]) => h('div.nl-step', { class: { done, bad: !!bad } }, h('i'), h('div', h('b', k), h('span', v)))))),
              kv([['Amount', M(w.amount)], ['From', 'Corporate — Special Collections (Liyue) · NB-C •••• 0011'], ['Wire reference', t.wire || 'NBW-26-1018-0003'], ['Programme reference', 'OSIAL/PH3'], ['Scheduled release', 'Sun 18 Oct 2026, 23:00 (Liyue Harbor time)'], ['Fees', 'ℳ0 · internal routing']], { header: 'Payment' }),
              kv((t.counterparty || []).map((r) => r), { header: 'Beneficiary' }),
              kv([['Purpose', t.purpose || ''], ['Memo', t.memo || '']], { header: 'Purpose & memo' }),
              kv((t.approvals || []).map((r) => r), { header: 'Approvals', footer: 'Countersignature removed in mandate rev. 4. You are the only person this payment is released in the name of.' }),
              JC.ui.list([{ header: 'Controls', footer: t.controls || '', rows: [
                { icon: { glyph: 'snowflake', bg: fr ? '#5aa7e8' : '#0c2b4f' }, title: fr ? 'Your card and payments are frozen' : 'Freeze card & outgoing payments', subtitle: fr ? 'This wire is on hold while the freeze stays on' : 'Suspends every payment you authorise', toggle: { on: fr, onChange: (on) => { if (on) confirmFreeze(true); else setFrozen(false); setTimeout(refresh, 50); } } },
                { icon: { glyph: 'xmark', bg: '#8e8e93' }, title: 'Cancel payment', onTap: () => JC.ui.alert({ title: 'View-only account', message: 'Payments on Corporate — Special Collections can only be cancelled by the programme owner: the Office of the Eighth.', buttons: [{ text: 'OK' }] }) },
              ] }]),
              JC.ui.list([{ header: 'Audit trail', rows: (t.audit || []).map(([d, v]) => ({ custom: h('div.nl-kv', h('div.nl-kv-k', d), h('div.nl-kv-v', v)) })) }]),
            ];
          } });
        return reg(pg);
      }
      function shareWire() {
        const t = JC.store.get('tx', 'nb_c_osial') || {};
        JC.ui.share({ title: 'OSIAL/PH3 — ℳ3,000,000 → Sea Lantern Logistics', subtitle: 'Northland Corporate · NBW-26-1018-0003', icon: 'nl.wire', payload: { kind: 'text', text: 'Northland Corporate Banking — scheduled wire\nOSIAL/PH3 · ℳ3,000,000 → Sea Lantern Logistics Co. (Pier 11)\nRelease: Sun 18 Oct 23:00\nPurpose: ' + (t.purpose || '') + '\nApproved: Office of the Eighth · countersignature removed (rev. 4)\nRef NBW-26-1018-0003' } });
      }
      function travelPage() {
        act('statement_view', { id: 'travel', acct: 'corp' });
        const pg = JC.ui.page({ title: 'Card Charge', bg: 'grouped', cls: 'nl-travelpage', onClose: () => gone(pg),
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', onTap: () => { const t = JC.store.get('tx', 'nb_c_travel'); if (t) shareTx(t); } })],
          content: () => {
            const t = JC.store.get('tx', 'nb_c_travel') || { items: [], counterparty: [], approvals: [] };
            return [
              h('div.nl-txhead', logo(t, 64), h('div.nl-txh-m', 'Executive Travel — Office of Pulcinella'), h('div.nl-txh-amt', signed(t.amount || 21400)), h('div.nl-txh-s', 'Wed 14 Oct 2026 · 10:14 · Corporate — Special Collections')),
              JC.ui.list([{ header: 'Itinerary & charges', rows: (t.items || []).map(([n, v]) => ({ custom: h('div.nl-kv.item', h('div.nl-kv-k', n), h('div.nl-kv-v.num', M(v))) })).concat([{ custom: h('div.nl-kv.total', h('div.nl-kv-k', 'Total'), h('div.nl-kv-v.num', M(t.amount || 21400))) }]) }]),
              kv((t.counterparty || []).map((r) => r), { header: 'Booking' }),
              kv((t.approvals || []).map((r) => r).concat([['Reference', t.ref || 'NB-ET-26-1014-0711']]), { header: 'Approvals' }),
              kv([['Memo', t.memo || '']], { header: 'Booking note' }),
              JC.ui.list([{ rows: [
                { icon: { glyph: 'bed.double.fill', bg: '#b08d2c' }, title: 'Liyue Harbor Grand Hotel', subtitle: 'Northland partner property · Show on Map', chevron: true, onTap: () => { act('place_view', { place: 'liyue-grand' }); JC.os.open('maps', { place: 'liyue-grand' }); } },
                { icon: { glyph: 'airplane', bg: '#1971c2' }, title: 'LA 711 · arrives 07:40', subtitle: 'Liyue Harbor International (LHI) · Show on Map', chevron: true, onTap: () => { act('place_view', { place: 'airport' }); JC.os.open('maps', { place: 'airport' }); } },
                { icon: { glyph: 'questionmark.circle', bg: '#8e8e93' }, title: 'Query this charge', chevron: true, onTap: () => JC.ui.alert({ title: 'Query Executive Travel?', message: 'This charge was approved by the Office of the Fifth. Queries are routed to the approver — Pulcinella will be told you asked.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send Query', onTap: () => JC.ui.toast('Query sent to the Office of the Fifth', { icon: 'paperplane.fill' }) }] }) },
              ] }]),
            ];
          } });
        return reg(pg);
      }

      // ── statements ────────────────────────────────────────────────────────────────────────────────────────
      function stmtMonths(id) {
        const set = new Set();
        txs(id).forEach((t) => { const d = new Date(t.t); set.add(d.getFullYear() + '-' + pad2(d.getMonth() + 1)); });
        return Array.from(set).sort().reverse();
      }
      function statementsPage(id) {
        let cur = id;
        const pg = JC.ui.page({ title: 'Statements', bg: 'grouped', cls: 'nl-stmts', onClose: () => gone(pg),
          content: (p) => {
            const nd = new Date(now());
            const thisYm = nd.getFullYear() + '-' + pad2(nd.getMonth() + 1);
            const seg = JC.ui.segmented({ items: ['Current', 'Savings', 'Corporate'], value: ['current', 'kids', 'corp'].indexOf(cur), onChange: (i) => { cur = ['current', 'kids', 'corp'][i]; p.render(); } });
            const months = stmtMonths(cur);
            return [
              h('div.nl-pad16', seg),
              JC.ui.list([{ header: (acct(cur) || {}).name, footer: 'Statements before April 2026 are held by your previous branch (Morepesok). Request copies from your relationship manager.', rows: months.map((ym) => {
                const [y, m] = ym.split('-').map(Number);
                const inprog = ym === thisYm;
                return { icon: { glyph: 'nl.statement', bg: inprog ? '#8e8e93' : '#0c2b4f' }, title: MON[m - 1] + ' ' + y, subtitle: inprog ? 'In progress · available 2 ' + MON[m % 12].slice(0, 3) : 'PDF · ' + (6 + (m * 7) % 9) + ' pages', chevron: true, onTap: () => push(stmtDoc(cur, ym)) };
              }) }]),
            ];
          } });
        return reg(pg);
      }
      function stmtDoc(id, ym) {
        act('statement_view', { id: 'stmt:' + id + ':' + ym, acct: id });
        const [y, m] = ym.split('-').map(Number);
        const [a, b] = monthRange(y, m - 1);
        const A = acct(id);
        const bal = running(id);
        const lines = txs(id).filter((t) => t.t >= a && t.t < b).reverse();
        const posted = lines.filter((t) => !t.pending);
        const closing = posted.length ? bal[posted[posted.length - 1].id] : null;
        const opening = posted.length ? bal[posted[0].id] + posted[0].amount : null;
        const moneyIn = posted.filter((t) => t.amount < 0).reduce((x, t) => x - t.amount, 0);
        const moneyOut = posted.filter((t) => t.amount > 0).reduce((x, t) => x + t.amount, 0);
        const title = MON[m - 1] + ' ' + y;
        const pg = JC.ui.page({ title, bg: 'grouped', cls: 'nl-docpage', onClose: () => gone(pg),
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'Share PDF', icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: 'Northland Statement — ' + title + '.pdf', subtitle: A.name + ' · ' + A.number, icon: 'nl.statement', payload: { kind: 'text', text: 'Northland Bank statement · ' + A.name + ' · ' + title + '\nOpening ' + M(opening || 0) + ' · In ' + M(moneyIn) + ' · Out ' + M(moneyOut) + ' · Closing ' + M(closing || 0) } }) },
            { text: 'Print', icon: 'printer', onTap: () => JC.ui.alert({ title: 'No AirPrint Printers Found', message: (JC.world.device && JC.world.device.print) || 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }) },
          ]) })],
          content: () => [h('div.nl-paper',
            h('div.nl-ph', h('div.nl-ph-l', crest(30), h('div', h('b', 'NORTHLAND BANK'), h('small', 'Northland Bank Group · Liyue Branch'))), h('div.nl-ph-r', h('b', 'Statement of account'), h('small', '1 ' + MON[m - 1].slice(0, 3) + ' – ' + new Date(b - 1).getDate() + ' ' + MON[m - 1].slice(0, 3) + ' ' + y))),
            h('div.nl-pblock', h('div', h('small', 'Account holder'), h('b', id === 'corp' ? 'Northland Bank Group — Special Collections (Liyue)' : 'Ajax (Tartaglia)'), h('span', id === 'corp' ? 'Harbor Road 1, Liyue Harbor' : 'Pier View Residences 2207, Liyue Harbor')), h('div', h('small', 'Account'), h('b', A.name), h('span', A.iban))),
            h('div.nl-psum', [['Opening balance', opening], ['Money in', moneyIn], ['Money out', moneyOut], ['Closing balance', closing]].map(([k, v]) => h('div', h('small', k), h('b', v == null ? '—' : M(v))))),
            h('table.nl-ptable', h('thead', h('tr', h('th', 'Date'), h('th', 'Description'), h('th.r', 'Out'), h('th.r', 'In'), h('th.r', 'Balance'))),
              h('tbody', lines.length ? lines.map((t) => h('tr', { class: { pend: !!t.pending }, onTap: () => openTx(t) }, h('td', dm(t.t)), h('td', h('b', t.merchant), t.note ? h('small', t.note) : null), h('td.r', t.amount > 0 ? M(t.amount) : ''), h('td.r', t.amount < 0 ? M(-t.amount) : ''), h('td.r', t.pending ? 'pending' : bal[t.id] != null ? M(bal[t.id]) : ''))) : h('tr', h('td', { attrs: { colspan: 5 } }, 'No transactions this month.')))),
            h('div.nl-pfoot', 'Northland Bank Group plc · registered at Zapolyarny Palace, Snezhnaya · Liyue Branch licence LY-FB-011. Deposits are protected by the Snezhnayan Deposit Guarantee up to ℳ1,000,000 per depositor. Lines marked pending are not included in the closing balance.'))],
        });
        return reg(pg);
      }

      // ── insights ──────────────────────────────────────────────────────────────────────────────────────────
      function insightsPage() {
        const nd = new Date(now());
        const opts = [2, 1, 0].map((k) => { const d = new Date(nd.getFullYear(), nd.getMonth() - k, 1); return [d.getFullYear(), d.getMonth()]; });
        let sel = 2;
        const pg = JC.ui.page({ title: 'Insights', bg: 'grouped', cls: 'nl-insights', onClose: () => gone(pg),
          content: (p) => {
            const [y, m] = opts[sel];
            const sp = spending(y, m);
            const [a, b] = monthRange(y, m);
            const days = new Date(y, m + 1, 0).getDate();
            const daily = Array.from({ length: days }, () => 0);
            txs('current').forEach((t) => { if (t.t >= a && t.t < b && t.amount > 0 && catOf(t)) daily[new Date(t.t).getDate() - 1] += t.amount; });
            const max = Math.max(1, ...daily);
            const tip = h('div.nl-tip');
            const cols = h('div.nl-cols', daily.map((v, i) => h('div.nl-col', { onTap: (e) => { e.stopPropagation(); showTip(tip, e.currentTarget, (i + 1) + ' ' + MON[m].slice(0, 3) + ' · ' + M(v)); } }, h('i', { style: { height: (v ? Math.max(3, v / max * 100) : 0) + '%' } }))));
            const sorted = sp.segs.slice().sort((x, z) => z.amount - x.amount);
            const big = txs('current').filter((t) => t.t >= a && t.t < b && t.amount > 0 && catOf(t)).sort((x, z) => z.amount - x.amount).slice(0, 5);
            return [
              h('div.nl-pad16', JC.ui.segmented({ items: opts.map(([yy, mm]) => MON[mm].slice(0, 3)), value: sel, onChange: (i) => { sel = i; p.render(); } })),
              h('div.nl-card.nl-ins-top', h('div.nl-k', 'Spent in ' + MON[m]), h('div.nl-big', M(sp.total)), h('div.nl-ins-n', sp.segs.length + ' categories · excludes transfers to your own accounts and income'),
                h('div.nl-stack-wrap', h('div.nl-stack', sp.segs.map((s) => h('div.nl-seg', { style: { flex: String(Math.max(0.012, s.pct)), background: s.cat.color }, onTap: (e) => { e.stopPropagation(); showTip(e.currentTarget.parentElement.nextSibling, e.currentTarget, s.cat.name + ' · ' + M(s.amount)); } }))), h('div.nl-tip'))),
              section('By category', JC.ui.list([{ rows: sorted.map((s) => ({ cls: 'nl-catrow', leading: h('div.nl-catic', { style: { background: s.cat.color } }, JC.icon(s.cat.glyph, { size: 17 })), title: s.cat.name,
                subtitle: h('div.nl-catbar', h('i', { style: { width: (s.amount / (sorted[0] ? sorted[0].amount : 1) * 100) + '%', background: s.cat.color } })),
                right: h('div.nl-amt', h('div.nl-amt-v', M(s.amount)), h('div.nl-amt-b', s.pct > 0 && s.pct < 0.01 ? '<1%' : Math.round(s.pct * 100) + '%')), chevron: true, onTap: () => push(catPage(s.cat.id, y, m)) })) }], { cls: 'nl-flat' })),
              section('Daily spending', h('div.nl-card.nl-daily', h('div.nl-stack-wrap', cols, tip), h('div.nl-axis', h('span', '1 ' + MON[m].slice(0, 3)), h('span', '15'), h('span', days + ' ' + MON[m].slice(0, 3))), h('div.nl-ins-n', 'Highest day: ' + M(max) + ' · tap a bar for the day’s total'))),
              section('Biggest payments', JC.ui.list([{ rows: big.map((t) => txRowDef(t, { withDay: true })) }], { cls: 'nl-txlist nl-flat' })),
              h('div.nl-tablebtn', { onTap: () => tableSheet(sp, MON[m]) }, JC.icon('list.bullet', { size: 16 }), 'View as table'),
            ];
          } });
        return reg(pg);
      }
      function tableSheet(sp, month) {
        JC.ui.sheet({ title: month + ' by category', detent: 'medium', right: { text: 'Done' }, content: () => [
          kv(sp.segs.slice().sort((a, b) => b.amount - a.amount).map((s) => [s.cat.name, M(s.amount) + ' · ' + Math.round(s.pct * 100) + '%']).concat([['Total', M(sp.total)]])),
        ] });
      }
      function catPage(cid, y, m) {
        const [a, b] = monthRange(y, m);
        const pg = JC.ui.page({ title: catDef(cid).name, bg: 'grouped', onClose: () => gone(pg), content: () => {
          const list = txs('current').filter((t) => t.t >= a && t.t < b && t.amount > 0 && (t.ucat || catOf(t)) === cid);
          return [h('div.nl-net', h('div.nl-k', MON[m] + ' ' + y), h('div.nl-net-v', M(list.reduce((x, t) => x + t.amount, 0))), h('div.nl-net-s', list.length + ' payments')), groupedTx(list)];
        } });
        return reg(pg);
      }

      // ── search ────────────────────────────────────────────────────────────────────────────────────────────
      function searchPage() {
        let q = '';
        const pg = JC.ui.page({ title: 'Search', bg: 'grouped', onClose: () => gone(pg),
          search: { placeholder: 'Merchants, people, amounts', onInput: (v) => { q = v.trim(); pg.render(); } },
          content: () => {
            if (!q) return [JC.ui.list([{ header: 'Try', rows: ['Liuli Pavilion', 'Wanmin', 'Mama', 'OSIAL', 'Executive Travel', 'Shitou'].map((s) => ({ icon: { glyph: 'magnifyingglass', bg: '#8e8e93' }, title: s, onTap: () => { pg.searchEl.querySelector('input').value = s; q = s; pg.render(); } })) }])];
            const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const list = allTx().filter((t) => acctOf(t) && re.test([t.merchant, t.note, t.ref, Math.abs(t.amount), t.contact ? short(t.contact) : ''].join(' '))).sort((a, b) => b.t - a.t).slice(0, 80);
            if (!list.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Nothing matches “' + q + '”.' })];
            return [JC.ui.list([{ header: list.length + ' results', rows: list.map((t) => Object.assign(txRowDef(t, { withDay: true }), { subtitle: (acct(acctOf(t)) || {}).short + ' · ' + relStamp(t.t) + (t.note ? ' · ' + t.note : '') })) }], { cls: 'nl-txlist' })];
          } });
        return reg(pg);
      }

      // ═══ PAYMENTS ════════════════════════════════════════════════════════════════════════════════════════
      function payPage() {
        const pg = JC.ui.page({ title: 'Payments', large: true, bg: 'grouped', cls: 'nl-pay',
          right: [JC.ui.navBtn({ icon: 'plus', onTap: () => push(transferPage({})) })],
          content: () => {
            const recent = txs('current').filter((t) => t.contact && (t.cat === 'transfer' || t.cat === 'p2p')).slice(0, 5);
            const quick = ['mama', 'teucer', 'tonia', 'anthon', 'zl', 'ht', 'lumine', 'paimon', 'ekat', 'papa', 'xl', 'beidou', 'yunjin'].filter((c) => JC.contacts.get(c));
            return [
              h('div.nl-paytiles',
                h('div.nl-ptile', { onTap: () => push(transferPage({})) }, h('i', JC.icon('paperplane.fill', { size: 20 })), h('b', 'Send'), h('span', 'To anyone, instantly')),
                h('div.nl-ptile', { onTap: () => requestFlow() }, h('i', JC.icon('arrow.down.left', { size: 20 })), h('b', 'Request'), h('span', 'Send a pay link')),
                h('div.nl-ptile', { onTap: () => moveSheet('out') }, h('i', JC.icon('arrow.up.arrow.down', { size: 20 })), h('b', 'Move'), h('span', 'Between your accounts')),
                h('div.nl-ptile', { onTap: () => push(payeePage()) }, h('i', JC.icon('person.2.fill', { size: 20 })), h('b', 'Payees'), h('span', D().PAYEES.length + ' saved'))),
              section('Quick send', h('div.nl-quick.hscroll', quick.map((c) => h('div.nl-qp', { onTap: () => push(transferPage({ to: c })) }, JC.ui.avatar(c, 56), h('span', short(c)))))),
              section('Standing orders', JC.ui.list([{ rows: D().STANDING.map((so) => ({ cls: 'nl-txrow', leading: so.to === 'kids' ? logo({ merchant: 'Savings' }, 40) : JC.contacts.get(so.to) ? logo({ contact: so.to }, 40) : logo({ merchant: so.to }, 40), title: so.title, subtitle: (S().soPaused[so.id] ? 'Paused' : 'Monthly, 1st') + ' · ' + so.since.toLowerCase(), right: h('div.nl-amt', h('div.nl-amt-v', { class: { dim: !!S().soPaused[so.id] } }, M(so.amount))), onTap: () => standingSheet(so) })) }], { cls: 'nl-txlist nl-flat' })),
              section('Recent transfers', recent.length ? JC.ui.list([{ rows: recent.map((t) => txRowDef(t, { withDay: true })) }], { cls: 'nl-txlist nl-flat' }) : JC.ui.empty({ icon: 'paperplane.fill', title: 'No transfers yet' })),
            ];
          } });
        return reg(pg);
      }
      function payeePage() {
        const pg = JC.ui.page({ title: 'Payees', bg: 'grouped', onClose: () => gone(pg), content: () => [
          JC.ui.list([{ header: 'Family', rows: D().PAYEES.filter((p) => p.fam).map(payeeRow) }, { header: 'Friends & others', rows: D().PAYEES.filter((p) => !p.fam).map(payeeRow) },
            { header: 'Businesses', rows: [{ leading: logo({ merchant: 'Wangsheng Funeral Parlor' }, 40), title: 'Wangsheng Funeral Parlor', subtitle: 'Liyue Maritime Bank •••• 0001', chevron: true, onTap: () => push(transferPage({ to: 'ht', memo: 'invoice — Rite of Parting consultancy' })) }, { leading: logo({ merchant: 'Pier View Residences' }, 40), title: 'Pier View Residences', subtitle: 'Standing order · ℳ2,850 monthly', chevron: true, onTap: () => standingSheet(D().STANDING[2]) }] }]),
        ] });
        return reg(pg);
      }
      const payeeRow = (p) => ({ avatar: p.id, title: short(p.id), subtitle: p.bank + ' · ' + p.acct, chevron: true, onTap: () => push(transferPage({ to: p.id })) });
      function standingSheet(so) {
        const s = JC.ui.sheet({ title: 'Standing Order', detent: 'medium', right: { text: 'Done' }, content: () => {
          const paused = !!S().soPaused[so.id];
          return [
            h('div.nl-txhead.sm', so.to === 'kids' ? logo({ merchant: 'Savings' }, 52) : JC.contacts.get(so.to) ? logo({ contact: so.to }, 52) : logo({ merchant: so.to }, 52), h('div.nl-txh-m', so.title), h('div.nl-txh-amt', M(so.amount)), h('div.nl-txh-s', paused ? 'Paused' : 'Every month on the 1st · next ' + dm(new Date(new Date(now()).getFullYear(), new Date(now()).getMonth() + 1, 1).getTime()))),
            JC.ui.list([{ footer: so.id === 'so_mama' ? 'Reference shown to Mama: “toy commission”. She has never asked what kind of toys.' : null, rows: [
              { title: 'Pause this standing order', toggle: { on: paused, onChange: (on) => { S().soPaused[so.id] = on; save(); JC.ui.toast(on ? 'Standing order paused' : 'Standing order resumed', { icon: on ? 'pause.fill' : 'play.fill' }); s.render(); refresh(); } } },
              ['From', 'Personal Current •••• 1111'], ['Started', so.since.replace('Since ', '')],
            ].map((r) => (Array.isArray(r) ? { custom: h('div.nl-kv', h('div.nl-kv-k', r[0]), h('div.nl-kv-v', r[1])) } : r)) }]),
          ];
        } });
      }
      function requestFlow() {
        JC.ui.alert({ title: 'Request money', message: 'How much? We’ll write a Northland Pay link you can send in Messages.', input: { placeholder: 'Amount in Mora', kbType: 'num' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Create Link', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          const n = Math.round(Number(String(r.value || '').replace(/[^0-9.]/g, '')) || 0);
          if (!n) { JC.ui.toast('Enter an amount', { icon: 'exclamationmark.circle.fill' }); return; }
          const code = Math.random().toString(36).slice(2, 8);
          JC.os.open('messages', { compose: { text: 'you owe me ' + M(n) + ' 😁 pay here → nb.pay/ajax/' + code } });
        });
      }

      // ── amount keypad ─────────────────────────────────────────────────────────────────────────────────────
      function keypad(onKey) {
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'del'];
        return h('div.nl-keys', keys.map((k) => h('div.nl-key', { class: { del: k === 'del' }, onTap: () => { JC.audio.play(k === 'del' ? 'key.delete' : 'key'); onKey(k); } }, k === 'del' ? JC.icon('delete.left', { size: 22 }) : k)));
      }

      // ── transfer ──────────────────────────────────────────────────────────────────────────────────────────
      function transferPage(o) {
        let to = o.to || null;
        let amt = o.amount ? String(Math.round(o.amount)) : '';
        let memo = o.memo || (to ? (D().PAYEES.find((p) => p.id === to) || {}).memo || '' : '');
        const amtEl = h('div.nl-xamt');
        const warn = h('div.nl-xwarn');
        const payeeBox = h('div.nl-xpayee');
        const reviewBtn = h('div.nl-cta', { onTap: () => review() }, 'Review');
        const memoIn = JC.ui.input({ placeholder: 'Add a note (shown to them)', value: memo, enterkey: 'done', max: 60, onInput: (v) => { memo = v; } });
        const chips = h('div.nl-chips');
        const paint = () => {
          const n = Number(amt || 0);
          amtEl.textContent = M(n);
          amtEl.classList.toggle('empty', !n);
          const bal = B().balance();
          warn.textContent = B().frozen() ? 'Your card is frozen — transfers are blocked' : n > bal ? 'More than your available ' + M(bal) : n > S().xferLimit ? 'Over your daily transfer limit (' + M(S().xferLimit) + ')' : 'Available ' + M(bal);
          warn.classList.toggle('bad', B().frozen() || n > bal || n > S().xferLimit);
          payeeBox.innerHTML = '';
          if (to) {
            const p = D().PAYEES.find((x) => x.id === to) || { bank: 'Northland Pay', acct: '' };
            payeeBox.append(JC.ui.avatar(to, 44), h('div.nl-xp-m', h('b', JC.contacts.short(to)), h('span', p.bank + (p.acct ? ' · ' + p.acct : ''))), h('div.nl-xp-c', 'Change'));
          } else payeeBox.append(h('div.nl-xp-add', JC.icon('plus', { size: 20 })), h('div.nl-xp-m', h('b', 'Choose who to pay'), h('span', 'Family, friends or a saved payee')), JC.icon('chevron.right', { size: 14 }));
          chips.innerHTML = '';
          const p = to && D().PAYEES.find((x) => x.id === to);
          [p && p.memo, 'dinner 🍵', 'for the fish 🐟'].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).forEach((c) => chips.appendChild(h('div.nl-chip2', { onTap: () => { memo = c; memoIn.value = c; } }, c)));
          reviewBtn.classList.toggle('disabled', !(to && n > 0));
        };
        const onKey = (k) => {
          if (k === 'del') amt = amt.slice(0, -1);
          else if ((amt + k).replace(/^0+/, '').length <= 8) amt = (amt + k).replace(/^0+/, '');
          paint();
        };
        const pg = JC.ui.page({ title: 'Send Money', bg: 'grouped', cls: 'nl-xfer',
          content: () => [
            h('div.nl-xrow', { onTap: () => pickPayee((id) => { to = id; const p = D().PAYEES.find((x) => x.id === id); if (p && !memo) { memo = p.memo; memoIn.value = memo; } paint(); }) }, payeeBox),
            h('div.nl-xfrom', { onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Personal Current', sub: M(B().balance()), checked: true, onTap: () => {} }, { text: 'Savings — for the kids', sub: 'Locked · move to Current first', checked: false, onTap: () => moveSheet('in') }, { text: 'Corporate', sub: 'View only', checked: false, disabled: true }]) }, h('span', 'From'), h('b', 'Personal Current •••• 1111'), JC.icon('chevron.up.chevron.down', { size: 13 })),
            amtEl, warn,
            h('div.nl-xmemo', memoIn), chips,
            keypad(onKey),
            reviewBtn,
          ] });
        paint();
        return pg;

        function review() {
          const n = Number(amt || 0);
          if (!to) { pickPayee((id) => { to = id; paint(); }); return; }
          if (!n) { JC.ui.toast('Enter an amount', { icon: 'exclamationmark.circle.fill' }); return; }
          if (n > S().xferLimit) { JC.ui.alert({ title: 'Over your transfer limit', message: 'Your daily transfer limit is ' + M(S().xferLimit) + '. You can raise it in Cards → Spending limits.', buttons: [{ text: 'OK', style: 'cancel' }, { text: 'Change Limit', onTap: () => { tabs.select('cards', true); setTimeout(() => push(limitsPage()), 80); } }] }); return; }
          const p = D().PAYEES.find((x) => x.id === to) || { bank: 'Northland Pay', acct: '' };
          const sh = JC.ui.sheet({ title: 'Review', detent: 'large', left: { text: 'Cancel' }, content: () => [
            h('div.nl-rv', JC.ui.avatar(to, 64), h('div.nl-rv-to', 'To ' + JC.contacts.short(to)), h('div.nl-rv-amt', M(n)), memo ? h('div.nl-rv-memo', '“' + memo + '”') : null),
            kv([['To', p.bank + (p.acct ? ' · ' + p.acct : '')], ['From', 'Personal Current •••• 1111'], ['Arrives', 'Instantly'], ['Fee', M(0)], ['Balance after', M(B().balance() - n)]]),
            p.note ? h('div.nl-note', JC.icon('info.circle', { size: 15 }), p.note) : null,
            h('div.nl-cta.big', { onTap: () => send(sh, n) }, JC.icon('nl.faceid', { size: 20 }), 'Send ' + M(n)),
          ] });
        }
        function send(sh, n) {
          faceAuth().then(() => {
            const r = B().transfer({ to, amount: n, memo, app: 'northland' });
            if (!r.ok) {
              sh.close();
              JC.audio.play('error');
              if (r.reason === 'frozen') JC.ui.alert({ title: 'Card Frozen', message: 'Transfers from Personal Current are blocked while your card is frozen.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Unfreeze', style: 'default', onTap: () => { setFrozen(false); paint(); } }] });
              else JC.ui.alert({ title: 'Insufficient Funds', message: 'You have ' + M(B().balance()) + ' in Personal Current. Move money from Savings or send a smaller amount.', buttons: [{ text: 'OK', style: 'cancel' }, { text: 'Move Money', onTap: () => moveSheet('in') }] });
              paint();
              return;
            }
            JC.audio.play('success'); JC.audio.haptic(20);
            sh.body.innerHTML = '';
            sh.body.append(h('div.nl-done', h('div.nl-done-c', JC.icon('checkmark', { size: 40 })), h('b', M(n) + ' sent'), h('span', 'to ' + JC.contacts.short(to) + ' · arrived instantly'), h('small', 'Ref ' + (r.tx && r.tx.id ? String(r.tx.id).toUpperCase().slice(-8) : 'NBT')),
              h('div.nl-cta', { onTap: () => { sh.close(); nav().pop(); } }, 'Done'),
              h('div.nl-cta.ghost', { onTap: () => { sh.close(); if (r.tx) shareTx(r.tx); } }, 'Share receipt')));
            refresh();
          });
        }
      }
      function pickPayee(cb) {
        const sh = JC.ui.sheet({ title: 'Pay', detent: 'large', left: { text: 'Cancel' }, content: () => [
          JC.ui.list([{ header: 'Family', rows: D().PAYEES.filter((p) => p.fam).map((p) => ({ avatar: p.id, title: short(p.id), subtitle: p.bank + ' · ' + p.acct, onTap: () => { sh.close(); cb(p.id); } })) },
            { header: 'Friends & others', rows: D().PAYEES.filter((p) => !p.fam).map((p) => ({ avatar: p.id, title: short(p.id), subtitle: p.bank + ' · ' + p.acct, onTap: () => { sh.close(); cb(p.id); } })) }]),
        ] });
      }

      // ── move money between own accounts ────────────────────────────────────────────────────────────────────
      function moveSheet(dir) {
        // dir 'out' = Current → Savings, 'in' = Savings → Current
        let d = dir === 'in' ? 1 : 0;
        let amt = '';
        const amtEl = h('div.nl-xamt.sm');
        const info = h('div.nl-xwarn');
        const route = h('div.nl-route');
        const paint = () => {
          const n = Number(amt || 0);
          amtEl.textContent = M(n);
          amtEl.classList.toggle('empty', !n);
          const fromBal = d ? B().balance('kids') : B().balance();
          route.innerHTML = '';
          route.append(h('div', h('small', 'From'), h('b', d ? 'Savings — for the kids' : 'Personal Current'), h('span', M(fromBal))), JC.icon('arrow.right', { size: 18 }), h('div', h('small', 'To'), h('b', d ? 'Personal Current' : 'Savings — for the kids'), h('span', M(d ? B().balance() : B().balance('kids')))));
          info.textContent = d ? 'Locked account · Face ID required · withdrawals are reviewed by the Chairman’s office' : (B().frozen() ? 'Your card is frozen — payments out of Current are blocked' : 'Arrives instantly');
          info.classList.toggle('bad', n > fromBal || (!d && B().frozen()));
        };
        const sh = JC.ui.sheet({ title: 'Move Money', detent: 'large', left: { text: 'Cancel' }, cls: 'nl-movesheet', content: () => [
          h('div.nl-pad16', JC.ui.segmented({ items: ['To Savings', 'From Savings'], value: d, onChange: (i) => { d = i; paint(); } })),
          route, amtEl, info,
          keypad((k) => { if (k === 'del') amt = amt.slice(0, -1); else if ((amt + k).replace(/^0+/, '').length <= 7) amt = (amt + k).replace(/^0+/, ''); paint(); }),
          h('div.nl-cta', { onTap: () => go() }, 'Move'),
        ] });
        paint();
        function go() {
          const n = Number(amt || 0);
          if (!n) { JC.ui.toast('Enter an amount', { icon: 'exclamationmark.circle.fill' }); return; }
          if (d === 0) {
            const r = B().charge({ amount: n, merchant: 'To Savings — for the kids', cat: 'savings', note: 'Moved in Northland', app: 'northland', quiet: true });
            if (!r.ok) { JC.audio.play('error'); JC.ui.alert({ title: r.reason === 'frozen' ? 'Card Frozen' : 'Insufficient Funds', message: r.reason === 'frozen' ? 'Payments out of Personal Current are blocked while your card is frozen.' : 'You have ' + M(B().balance()) + ' in Personal Current.', buttons: [{ text: 'OK' }] }); return; }
            adjustKids(n);
            JC.store.add('tx', { card: 'kids', acct: 'kids', merchant: 'From Personal Current', amount: -n, t: now(), cat: 'savings', note: 'Moved in Northland' }, { front: true });
            done(n);
            return;
          }
          if (n > B().balance('kids')) { JC.audio.play('error'); JC.ui.alert({ title: 'Not enough in Savings', message: 'Savings — for the kids holds ' + M(B().balance('kids')) + '.', buttons: [{ text: 'OK' }] }); return; }
          JC.ui.alert({ title: 'Move money out of “for the kids”?', message: 'This account is locked. Moving ' + M(n) + ' to Personal Current needs Face ID, and withdrawals from protected savings are reported to the Office of the Chairman.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'destructive' }] }).then((r) => {
            if (r.index !== 1) return;
            faceAuth().then(() => {
              adjustKids(-n);
              JC.store.add('tx', { card: 'kids', acct: 'kids', merchant: 'To Personal Current', amount: n, t: now(), cat: 'savings', note: 'Withdrawal · approved with Face ID' }, { front: true });
              B().credit({ amount: n, merchant: 'From Savings — for the kids', cat: 'savings', note: 'Withdrawal from protected savings', app: 'northland', quiet: true });
              const s = S(); s.kidsMoves = (s.kidsMoves || 0) + 1; save();
              act('transfer', { to: 'current', from: 'kids', amount: n, memo: 'savings withdrawal' });
              inboxAdd({ id: 'm_kids_' + s.kidsMoves, kind: 'chairman', from: 'Office of the Chairman', t: now(), title: 'A withdrawal from “for the kids”', body: ['Dear Tartaglia,', M(n) + ' has just left the savings you keep for your brothers and sister. In two years you have never touched it. Not once.', 'I don’t pry. I only notice. And I notice that someone who would rather starve than take a coin from those children has just taken ' + M(n) + '.', 'Do tell me if something is wrong, dear boy. Or don’t — I will find out either way.\n\n— P.'] }, true);
              done(n);
            });
          });
        }
        function done(n) {
          JC.audio.play('success'); JC.audio.haptic(18);
          sh.body.innerHTML = '';
          sh.body.append(h('div.nl-done', h('div.nl-done-c', JC.icon('checkmark', { size: 40 })), h('b', M(n) + ' moved'), h('span', d ? 'Savings → Personal Current' : 'Personal Current → Savings'), h('div.nl-cta', { onTap: () => sh.close() }, 'Done')));
          refresh();
        }
      }
      function adjustKids(delta) {
        // there is no JC.bank API for internal moves yet (see docs/requests/N1.md): adjust the savings balance directly
        B().balance('kids');
        const bal = JC.state.d.bank && JC.state.d.bank.bal;
        if (bal) { bal.kids = Math.round(((bal.kids || 0) + delta) * 100) / 100; save(); JC.bus.emit('bank', { kind: 'move', balance: B().balance(), frozen: B().frozen() }); }
      }

      // ═══ CARDS ═══════════════════════════════════════════════════════════════════════════════════════════
      function cardArt(o) {
        o = o || {};
        const fr = B().frozen();
        const el = h('div.nl-cardart', { class: { frozen: fr, big: !!o.big } },
          h('div.nl-ca-brush'),
          h('div.nl-ca-top', h('div.nl-ca-brand', crest(20), h('span', 'NORTHLAND')), h('div.nl-ca-tier', 'BLACK')),
          h('div.nl-ca-chip'), h('div.nl-ca-cl', JC.icon('nl.contactless', { size: 20 })),
          h('div.nl-ca-num', o.reveal ? '4011 0720 2004 1111' : '•••• 1111'),
          h('div.nl-ca-bot', h('div', h('small', 'CARDHOLDER'), h('span', 'AJAX TARTAGLIA')), h('div', h('small', 'VALID THRU'), h('span', o.reveal ? '07/29' : '••/••')), h('div.nl-ca-net', 'DEBIT')),
          h('div.nl-frost', h('div.nl-frost-flakes', [[8, 18], [30, 62], [52, 24], [74, 70], [88, 30], [18, 80], [64, 48]].map(([x, y], i) => h('i', { style: { left: x + '%', top: y + '%', '--i': i } }, JC.icon('snowflake', { size: 12 + (i % 3) * 7 })))), h('div.nl-frost-l', JC.icon('snowflake', { size: 16 }), 'Frozen')));
        return el;
      }
      function cardsPage() {
        const pg = JC.ui.page({ title: 'Cards', large: true, bg: 'grouped', cls: 'nl-cards',
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'Show card details', icon: 'eye', onTap: () => revealSheet() },
            { text: 'View PIN', icon: 'key', onTap: () => pinSheet() },
            { text: 'Open in Wallet', icon: 'nl.wallet', onTap: () => JC.os.open('wallet', { card: 'nb' }) },
            '-',
            { text: 'Report lost or stolen', icon: 'exclamationmark.triangle.fill', destructive: true, onTap: () => lostFlow() },
          ]) })],
          content: () => {
            const fr = B().frozen();
            const s = S();
            const today = (() => { const d = new Date(now()); const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); return txs('current').filter((t) => t.t >= a && t.amount > 0 && catOf(t)).reduce((x, t) => x + t.amount, 0); })();
            const art = cardArt();
            JC.ui.contextMenu(art, () => ({ items: [{ text: 'Show Card Details', icon: 'eye', onTap: () => revealSheet() }, { text: fr ? 'Unfreeze' : 'Freeze', icon: 'snowflake', onTap: () => setFrozen(!fr) }, { text: 'Copy Last 4', icon: 'doc.on.doc', onTap: () => { U.copy('1111'); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }] }));
            art.addEventListener('click', () => revealSheet());
            art.__tap = true; art.classList.add('tap');
            const ftog = JC.ui.toggle({ on: fr, tint: '#5aa7e8', onChange: (on) => setFrozen(on) });
            return [
              h('div.nl-cardwrap', art),
              h('div.nl-cardcap', h('b', 'Northland Black'), h('span', 'Debit · •••• 1111 · Personal Current')),
              h('div.nl-freeze', { class: { on: fr }, onTap: (e) => { if (e.target.closest('.toggle')) return; setFrozen(!fr); } },
                h('div.nl-freeze-i', JC.icon('snowflake', { size: 24 })),
                h('div.nl-freeze-m', h('b', fr ? 'Card frozen' : 'Freeze card'), h('span', fr ? 'Since ' + (s.frozenAt ? hm(s.frozenAt) : 'earlier') + ' · payments, transfers and wires you authorise are blocked' : 'Instantly block card payments, transfers and outgoing wires')),
                ftog),
              h('div.nl-cbtns',
                bigBtn('eye', 'Details', () => revealSheet()),
                bigBtn('key', 'PIN', () => pinSheet()),
                bigBtn('slider.horizontal.3', 'Limits', () => push(limitsPage())),
                bigBtn('nl.wallet', 'Wallet', () => JC.os.open('wallet', { card: 'nb' }))),
              h('div.nl-card.nl-limitcard', { onTap: () => push(limitsPage()) }, h('div.nl-lim-h', h('span', 'Spent today'), h('b', M(today) + ' of ' + M(s.dailyLimit))), h('div.nl-goal', h('i', { style: { width: Math.min(100, today / s.dailyLimit * 100) + '%' } }))),
              JC.ui.list([{ header: 'Card controls', footer: 'Gambling blocks stay on for 48 hours after you turn them off. Northland Private card controls apply to Northland Black •••• 1111.', rows: [
                ctl('online', 'Online payments', 'nl.globe', '#1d5fa3'),
                ctl('contactless', 'Contactless', 'nl.contactless', '#0ca678'),
                ctl('abroad', 'Payments abroad', 'airplane', '#e8590c'),
                ctl('atm', 'ATM withdrawals', 'nl.banknote', '#2f9e44'),
                { icon: { glyph: 'nl.dice', bg: '#c92a2a' }, title: 'Gambling block', toggle: { on: s.gambling, onChange: (on) => { if (!on) { JC.ui.alert({ title: 'Turn off gambling block?', message: 'The block stays on for 48 hours before it lifts. (Beidou’s dice games still count.)', buttons: [{ text: 'Keep On', style: 'cancel', onTap: () => refresh() }, { text: 'Turn Off', style: 'destructive', onTap: () => { S().gambling = false; save(); refresh(); } }] }); } else { S().gambling = true; save(); refresh(); } } } },
              ] }, { rows: [
                { icon: { glyph: 'slider.horizontal.3', bg: '#5856d6' }, title: 'Spending limits', detail: M(s.dailyLimit) + '/day', chevron: true, onTap: () => push(limitsPage()) },
                { icon: { glyph: 'nl.wallet', bg: '#000' }, title: 'Apple Wallet', detail: 'Added', chevron: true, onTap: () => JC.os.open('wallet', { card: 'nb' }) },
                { title: 'Report lost or stolen', destructive: true, onTap: () => lostFlow() },
              ] }]),
            ];
          } });
        return reg(pg);
      }
      function ctl(key, title, glyph, bg) {
        return { icon: { glyph, bg }, title, subtitle: S()[key] ? null : 'Off · declined at the terminal', toggle: { on: !!S()[key], onChange: (on) => { S()[key] = on; save(); JC.ui.toast(title + (on ? ' on' : ' off'), { icon: on ? 'checkmark' : 'nosign' }); refresh(); } } };
      }
      function limitsPage() {
        const pg = JC.ui.page({ title: 'Spending Limits', bg: 'grouped', onClose: () => gone(pg), content: (p) => {
          const s = S();
          const lim = (key, label, min, max, step, foot) => {
            const val = h('b', M(s[key]));
            return h('div.nl-card.nl-limit', h('div.nl-lim-h', h('span', label), val),
              JC.ui.slider({ value: s[key], min, max, step, onInput: (v) => { val.textContent = M(v); }, onChange: (v) => { s[key] = v; save(); JC.ui.toast(label + ': ' + M(v), { icon: 'checkmark' }); } }),
              h('div.nl-lim-f', h('span', M(min)), h('span', foot), h('span', M(max))));
          };
          return [
            h('div.nl-pad16t', 'Limits reset at midnight, Liyue Harbor time.'),
            lim('dailyLimit', 'Daily card spending', 5000, 200000, 5000, 'card payments'),
            lim('atmLimit', 'Daily ATM withdrawals', 1000, 50000, 1000, 'cash'),
            lim('xferLimit', 'Daily transfers', 10000, 500000, 10000, 'Northland Pay'),
          ];
        } });
        return reg(pg);
      }
      function revealSheet() {
        faceAuth().then(() => {
          let left = 30;
          const cnt = h('span', String(left));
          const sh = JC.ui.sheet({ title: 'Card Details', detent: 'large', right: { text: 'Done' }, cls: 'nl-revealsheet', onClose: () => clearInterval(iv), content: () => [
            h('div.nl-cardwrap', cardArt({ reveal: true, big: true })),
            JC.ui.list([{ footer: h('span', 'Details hide automatically in ', cnt, ' s. Never share your card number, expiry or security code.'), rows: [
              ['Card number', '4011 0720 2004 1111'], ['Name on card', 'AJAX TARTAGLIA'], ['Expires', '07/29'], ['Security code', '211'], ['Billing address', 'Pier View Residences 2207, Liyue Harbor'],
            ].map(([k, v]) => ({ title: k, subtitle: v, cls: 'nl-revrow', right: h('div.nl-copy', { onTap: (e) => { e.stopPropagation(); U.copy(v); JC.ui.toast(k + ' copied', { icon: 'doc.on.doc' }); } }, JC.icon('doc.on.doc', { size: 18 })) })) }]),
          ] });
          const iv = setInterval(() => { left--; cnt.textContent = String(left); if (left <= 0) { clearInterval(iv); sh.close(); } }, 1000);
        });
      }
      function pinSheet() {
        faceAuth().then(() => {
          JC.ui.sheet({ title: 'Card PIN', detent: 'medium', right: { text: 'Done' }, content: () => [
            h('div.nl-pin', h('small', 'Northland Black •••• 1111'), h('div.nl-pin-d', ['0', '7', '2', '0'].map((d) => h('i', d))), h('span', 'Cover your screen. Shown after Face ID.')),
            JC.ui.list([{ rows: [{ title: 'Change PIN at any Northland ATM', subtitle: 'Liyue Branch · Harbor Road 1', chevron: true, onTap: () => JC.os.open('maps', { place: 'northland' }) }] }]),
          ] });
        });
      }
      function lostFlow() {
        JC.ui.actionSheet({ title: 'Report Northland Black •••• 1111', message: 'We’ll freeze the card straight away.', actions: [
          { text: 'I’ve lost my card', onTap: () => lost('lost') },
          { text: 'My card was stolen', style: 'destructive', onTap: () => lost('stolen') },
          { text: 'Call Northland Private (95511)', onTap: () => JC.os.open('phone', { call: 'nbank' }) },
        ] });
      }
      function lost(why) {
        setFrozen(true, { quiet: true });
        JC.ui.alert({ title: 'Card frozen', message: 'We’ve frozen •••• 1111. A replacement would change your card number, so Northland Private will confirm by phone before cancelling it. If it turns up, just unfreeze it in Cards.', buttons: [{ text: 'OK', style: 'cancel' }, { text: 'Call 95511', onTap: () => JC.os.open('phone', { call: 'nbank' }) }] });
        inboxAdd({ id: 'm_lost_' + Math.round(now() / 1000), kind: 'card', from: 'Northland Card Services', t: now(), title: 'Card reported ' + why, body: ['You reported Northland Black •••• 1111 as ' + why + ' at ' + hm(now()) + '. We froze the card immediately.', 'Northland Private will call to confirm a replacement.'] }, false);
      }

      // ═══ INBOX ═══════════════════════════════════════════════════════════════════════════════════════════
      const KIND = { fraud: ['nl.shield', '#e03131', 'Fraud'], security: ['nl.lock', '#1d5fa3', 'Security'], chairman: ['nl.crest', '#0c2b4f', 'Chairman'], corporate: ['building.2', '#495a6e', 'Corporate'], statement: ['nl.statement', '#2f9e44', 'Statement'], info: ['sparkles', '#b08d2c', 'News'], card: ['snowflake', '#5aa7e8', 'Card'] };
      function inboxPage() {
        let f = 0;
        const pg = JC.ui.page({ title: 'Inbox', large: true, bg: 'grouped', cls: 'nl-inbox',
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'Mark all as read', icon: 'envelope.open', onTap: () => { JC.store.all('nbinbox').forEach((m) => { if (!m.read) JC.store.update('nbinbox', m.id, { read: true }); }); refresh(); } },
            { text: 'Notification settings', icon: 'bell', onTap: () => profileSheet() },
          ]) })],
          content: (p) => {
            let list = inbox().filter((m) => !m.archived);
            if (f === 1) list = list.filter((m) => ['fraud', 'security', 'card'].includes(m.kind));
            if (f === 2) list = list.filter((m) => !['fraud', 'security', 'card'].includes(m.kind));
            return [
              h('div.nl-pad16', JC.ui.segmented({ items: ['All', 'Alerts', 'Messages'], value: f, onChange: (i) => { f = i; p.render(); } })),
              list.length ? JC.ui.list([{ rows: list.map((m) => {
                const k = KIND[m.kind] || KIND.info;
                return { cls: m.read ? 'nl-msgrow' : 'nl-unread', leading: h('div.nl-msgic', { style: { background: k[1] } }, JC.icon(k[0], { size: 18 })), title: m.title, subtitle: m.from + ' · ' + preview(m), clamp: true, detail: relStamp(m.t),
                  onTap: () => push(msgPage(m.id)),
                  swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.update('nbinbox', m.id, { archived: true }); JC.ui.toast('Deleted', { icon: 'trash' }); refresh(); } }],
                  lead: [{ text: m.read ? 'Unread' : 'Read', color: 'var(--blue)', icon: m.read ? 'envelope.fill' : 'envelope.open', onTap: () => { JC.store.update('nbinbox', m.id, { read: !m.read }); refresh(); } }] };
              }) }], { cls: 'nl-msglist' }) : JC.ui.empty({ icon: 'tray', title: 'No Messages', text: 'Secure messages from Northland appear here.' }),
            ];
          } });
        return reg(pg);
      }
      const preview = (m) => ((m.body || []).find((p) => !/^(Dear |Warmly|— )/.test(p)) || '').replace(/\n/g, ' ');
      function msgPage(id) {
        const m0 = JC.store.get('nbinbox', id);
        if (m0 && !m0.read) JC.store.update('nbinbox', id, { read: true });
        const pg = JC.ui.page({ title: '', bg: 'grouped', cls: 'nl-msgpage', onClose: () => gone(pg),
          right: [JC.ui.navBtn({ icon: 'trash', onTap: () => { JC.store.update('nbinbox', id, { archived: true }); nav().pop(); JC.ui.toast('Deleted', { icon: 'trash' }); } })],
          content: () => {
            const m = JC.store.get('nbinbox', id);
            if (!m) return [JC.ui.empty({ icon: 'tray', title: 'Message unavailable' })];
            const k = KIND[m.kind] || KIND.info;
            const btns = [];
            if (m.action) btns.push(h('div.nl-cta', { onTap: () => handleIntent(m.action.open) }, m.action.text));
            if (m.login && !S().loginReview) btns.push(h('div.nl-cta', { onTap: () => reviewLogin(true) }, 'This was me'), h('div.nl-cta.danger', { onTap: () => reviewLogin(false) }, 'Secure my account'));
            if (m.login && S().loginReview) btns.push(h('div.nl-resolved', JC.icon('checkmark.circle.fill', { size: 16 }), S().loginReview === 'me' ? 'You confirmed this sign-in' : 'Account secured'));
            if (m.confirm && !m.done) btns.push(h('div.nl-cta', { onTap: () => { JC.store.update('nbinbox', id, { done: 'yes' }); JC.ui.toast('Thanks for confirming', { icon: 'checkmark' }); } }, 'Yes, it was me'), h('div.nl-cta.danger', { onTap: () => { JC.store.update('nbinbox', id, { done: 'no' }); const t = JC.store.get('tx', m.confirm); if (t) dispute(t, 'fraud'); setFrozen(true); } }, 'No — freeze my card'));
            if (m.confirm && m.done) btns.push(h('div.nl-resolved', JC.icon('checkmark.circle.fill', { size: 16 }), m.done === 'yes' ? 'You confirmed this payment' : 'Card frozen · case opened'));
            if (m.kind === 'chairman') btns.push(h('div.nl-cta.ghost', { onTap: () => JC.ui.alert({ title: 'Reply to the Office of the Chairman?', message: 'Replies are read by Pantalone personally. He has asked that you “keep it brief, and honest, and about money”.', input: { placeholder: 'Your reply' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { JC.store.update('nbinbox', id, { reply: r.value }); JC.ui.toast('Reply sent', { icon: 'paperplane.fill' }); } }) }, m.reply ? 'Replied' : 'Reply'));
            return [
              h('div.nl-msghead', h('div.nl-msgic.big', { style: { background: k[1] } }, JC.icon(k[0], { size: 24 })), h('div', h('b', m.from), h('span', k[2] + ' · ' + DAY[new Date(m.t).getDay()] + ', ' + dmy(m.t) + ' at ' + hm(m.t)))),
              h('div.nl-msgbody', h('h2', m.title), (m.body || []).map((p) => h('p', p))),
              m.reply ? h('div.nl-msgreply', h('small', 'Your reply'), h('p', m.reply)) : null,
              btns.length ? h('div.nl-msgbtns', btns) : null,
              h('div.nl-msgfoot', JC.icon('nl.lock', { size: 12 }), 'Secure message · Northland will never ask for your passcode or one-time codes.'),
            ];
          } });
        return reg(pg);
      }

      // ── profile ───────────────────────────────────────────────────────────────────────────────────────────
      function profileSheet() {
        const sh = JC.ui.sheet({ title: 'Profile', detent: 'large', right: { text: 'Done' }, content: () => {
          const s = S();
          return [
            h('div.nl-prof', h('div.nl-me.big', 'A'), h('b', 'Ajax (Tartaglia)'), h('span', 'Northland Private · client since 2020'), h('small', 'Relationship manager: Office of the Chairman')),
            JC.ui.list([{ header: 'Security', footer: 'When on, Northland asks for Face ID every time you open the app or come back after a minute away.', rows: [
              { icon: { glyph: 'nl.faceid', bg: '#30d158' }, title: 'Require Face ID', toggle: { on: s.faceReq, onChange: (on) => { s.faceReq = on; save(); } } },
              { icon: { glyph: 'nl.lock', bg: '#0c2b4f' }, title: 'Lock Northland now', onTap: () => { sh.close(); setTimeout(() => gate.show(), 320); } },
              { icon: { glyph: 'iphone', bg: '#8e8e93' }, title: 'Trusted devices', detail: s.loginReview === 'me' ? '2' : '1', chevron: true, onTap: () => JC.ui.alert({ title: 'Trusted devices', message: 'iPhone 17 Pro — “Childe’s iPhone” (this device)\n' + (s.loginReview === 'me' ? 'iPhone — Pier 7, Liyue Harbor (added ' + hm((JC.store.get('nbinbox', 'm_login') || {}).t || now()) + ')\n' : '') + 'iPad — Pier View Residences', buttons: [{ text: 'OK' }] }) },
            ] }, { header: 'Notifications', rows: [
              { title: 'Payments & transfers', toggle: { on: s.notif.tx !== false, onChange: (on) => { s.notif.tx = on; save(); } } },
              { title: 'Security & fraud alerts', toggle: { on: s.notif.security !== false, onChange: (on) => { s.notif.security = on; save(); } } },
              { title: 'Offers & news', toggle: { on: !!s.notif.offers, onChange: (on) => { s.notif.offers = on; save(); } } },
            ] }, { header: 'Help', rows: [
              { icon: { glyph: 'phone.fill', bg: '#30d158' }, title: 'Call Northland Private', detail: '95511', onTap: () => JC.os.open('phone', { call: 'nbank' }) },
              { icon: { glyph: 'mappin', bg: '#ff3b30' }, title: 'Liyue Branch', subtitle: 'Harbor Road 1 · top floor: Special Collections', chevron: true, onTap: () => JC.os.open('maps', { place: 'northland' }) },
              { icon: { glyph: 'info.circle', bg: '#8e8e93' }, title: 'About Northland', detail: 'v26.10', onTap: () => JC.ui.alert({ title: 'Northland 26.10', message: 'Northland Bank Group plc, Zapolyarny Palace, Snezhnaya.\nLiyue Branch licence LY-FB-011.\n\n“Every Mora remembers.”', buttons: [{ text: 'OK' }] }) },
            ] }]),
          ];
        } });
      }

      // ═══ build ═══════════════════════════════════════════════════════════════════════════════════════════
      tabs = JC.ui.tabs(win.body, {
        tint: 'var(--nl-tint)',
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'accounts', title: 'Accounts', icon: 'building.2', root: () => accountsPage() },
          { id: 'pay', title: 'Payments', icon: 'nl.transfer', root: () => payPage() },
          { id: 'cards', title: 'Cards', icon: 'creditcard.fill', root: () => cardsPage() },
          { id: 'inbox', title: 'Inbox', icon: 'tray.fill', root: () => inboxPage() },
        ],
        onChange: () => setTimeout(updStatus, 0),
      });
      tabs.badge('inbox', unread());
      gate = buildGate();
      win.body.appendChild(gate.el);
      if (S().faceReq) gate.show(); else { gate.hideNow(); afterUnlock(); }

      // live updates
      if (B()) offs.push(B().on(() => refresh()));
      offs.push(JC.store.on('tx', () => refresh()));
      offs.push(JC.store.on('nbinbox', () => refresh()));
      offs.push(JC.bus.on('story:fx', () => refresh()));
      offs.push(JC.bus.on('story:chapter', () => refresh()));
      offs.push(JC.bus.on('bank', () => refresh()));
      offs.push(JC.bus.on('minute', () => { if (JC.os.isOpen('northland')) refresh(); }));
      offs.push(JC.bus.on('tick', () => {
        if (!JC.os.isOpen('northland')) return;
        const left = REL() - now();
        const els = win.body.querySelectorAll('.nl-count');
        els.forEach((e) => { e.textContent = countdown(left); });
        if (els.length && left <= 0) refresh();
      }));
      offs.push(JC.bus.on('lock', () => { if (S().faceReq) hiddenAt = -1; }));
      offs.push(JC.bus.on('unlock', () => { if (hiddenAt === -1 && JC.os.isOpen('northland')) { hiddenAt = 0; gate.show(); } }));

      function handleIntent(it) {
        if (!it) return;
        const go = (tab) => { tabs.select(tab); const n = nav(); for (let i = 0; i < 12 && n.depth() > 1; i++) n.pop({ instant: true }); };
        if (it.tab) go(it.tab === 'payments' ? 'pay' : it.tab);
        if (it.inbox) { go('inbox'); push(msgPage(it.inbox)); return; }
        if (it.statement === 'osial' || it.statement === 'travel') { go('accounts'); push(it.statement === 'osial' ? wirePage() : travelPage()); return; }
        if (it.stmt) { const [a, ym] = String(it.stmt).split(':'); go('accounts'); push(stmtDoc(a, ym)); return; }
        if (it.account) { go('accounts'); push(accountPage(it.account)); return; }
        if (it.move) { moveSheet(it.move); return; }
        if (it.transfer) { go('pay'); push(transferPage(it.transfer)); return; }
        const id = it.tx || it.id;
        if (id) { const t = txGet(id); if (t) { go('home'); openTx(t); } }
      }
      return {
        intent(it) { if (gateOn) pendingIntent = it; else handleIntent(it); },
        show() {
          if (S().faceReq && (hiddenAt === -1 || (hiddenAt && Date.now() - hiddenAt > 60000))) gate.show();
          hiddenAt = 0;
          refresh();
        },
        hide() { if (hiddenAt !== -1) hiddenAt = Date.now(); },
        back() { return false; },
        destroy() { offs.forEach((f) => { try { f && f(); } catch (e) { /* ignore */ } }); live.clear(); },
      };
    },
  });
})();
