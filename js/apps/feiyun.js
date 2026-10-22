/* Feiyun Market — Liyue's marketplace, run by the Feiyun Commerce Guild (warm amber + vermilion).
   Home (banners, categories, ending-soon auctions, picks) · Watching · Cart · Orders + Search.
   Product pages (carousel, seller card, reviews, Q&A), live auctions with proxy bidding and bid history,
   checkout sheet (address picker, gift note, Wallet Pay → JC.bank), order tracking that follows the in-game clock,
   seller messages with canned replies, notices, account.
   The celadon tea-set lot (lot_teaset) closes at Sat 00:30 in-game whether or not the app is open; the rival
   jade_connoisseur_88 bids automatically up to ℳ11,800, so any bid ≥ ℳ12,000 wins.
   Acts: item_view { id } · bid { id, amount, price, leading } · auction_won { id, total, to } ·
   auction_lost { id, bid, price, winner, reason? } · purchase { id, total, to, qty, note, order } ·
   delivered { id, order, to } (proposed, see docs/requests/N2.md).
   Intents: { id } (listing) · { order } · { chat } · { search } · { tab } · { collection }. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const D = () => JC.feiyunData;
  const TINT = '#e8432e';
  const ISL = 'feiyun-lot';
  const tp = (x) => JC.time.parse(x);
  const now = () => JC.time.now();
  const money = (n) => U.fmtMoney(Math.round(n));
  const act = (name, p) => { try { JC.story.act(name, p); } catch (e) { console.error('[feiyun] act failed', name, e); } };
  const flag = (k) => { try { return !!JC.story.flag(k); } catch (e) { return false; } };

  // ═══ glyphs ═══════════════════════════════════════════════════════════════════════════════════
  JC.icon.add({
    'fy.vase': '<path d="M9.5 3.5h5"/><path d="M10 3.5v2.2c0 1-3.6 2.6-3.6 7.2 0 4.2 2.4 7.6 5.6 7.6s5.6-3.4 5.6-7.6c0-4.6-3.6-6.2-3.6-7.2V3.5"/><path d="M7 11h10"/>',
    'fy.toy': '<circle cx="12" cy="13.2" r="6.6"/><circle cx="6.4" cy="6.9" r="2.4"/><circle cx="17.6" cy="6.9" r="2.4"/><circle cx="9.6" cy="12.2" r=".7" fill="currentColor"/><circle cx="14.4" cy="12.2" r=".7" fill="currentColor"/><path d="M10.4 15.6c1 .9 2.2.9 3.2 0"/>',
    'fy.flower': '<path d="M12 21v-7"/><path d="M12 14c-4 0-6.5-3-6.5-7 2.5 0 4.6 1.2 5.6 3.2M12 14c4 0 6.5-3 6.5-7-2.5 0-4.6 1.2-5.6 3.2M12 13.5c-1.8-1.6-2.4-4.2-1.4-7.5h2.8c1 3.3.4 5.9-1.4 7.5z"/><path d="M12 18c-2-1.6-4-1.6-5.5-.5"/>',
    'fy.fish': '<path d="M2.8 12c2.6-4.1 7.2-6 11.2-4.4 2 .8 3.4 2.3 4.4 4.4-1 2.1-2.4 3.6-4.4 4.4C10 18 5.4 16.1 2.8 12z"/><path d="M18.4 12 21.4 8.8v6.4z"/><circle cx="7.2" cy="11.2" r=".8" fill="currentColor"/>',
    'fy.cup': '<path d="M4 9h13v3.5c0 3.6-2.9 6.5-6.5 6.5S4 16.1 4 12.5z"/><path d="M17 10.5h1.4a2.4 2.4 0 0 1 0 4.8H16.4"/><path d="M8 3.5c-.8 1 .8 2-.1 3M11.5 3.5c-.8 1 .8 2-.1 3"/><path d="M5 21h11"/>',
    'fy.pen': '<path d="M15 3.8 20.2 9 10.4 18.8l-5.6 1.4 1.4-5.6z"/><path d="m13.4 5.4 5.2 5.2"/><circle cx="10.6" cy="13.4" r="1.3"/><path d="m4.8 20.2 4.8-4.8"/>',
    'fy.shirt': '<path d="M8.5 3.5 4 6l1.8 4.2 2.2-1V20.5h8V9.2l2.2 1L20 6l-4.5-2.5c-.5 1.6-1.9 2.6-3.5 2.6S9 5.1 8.5 3.5z"/>',
    'fy.bowl': '<path d="M3.5 11.5h17c0 4.4-3.8 8-8.5 8s-8.5-3.6-8.5-8z"/><path d="M8.5 19.5h7"/><path d="M13.6 9.2 19.4 3.4M16 10.2l5-5"/>',
    'fy.gavel': '<path d="m14.4 3.4 6.2 6.2-2.6 2.6-6.2-6.2z"/><path d="m13.1 8.6-8.3 8.3a1.8 1.8 0 0 0 2.5 2.5l8.3-8.3"/><path d="M12.5 21h8"/>',
    'fy.lantern': '<path d="M12 2.5v2"/><rect x="7" y="4.5" width="10" height="2" rx="1"/><path d="M8 6.5c-1.5 1.6-2 3.4-2 5.5s.5 3.9 2 5.5h8c1.5-1.6 2-3.4 2-5.5s-.5-3.9-2-5.5"/><rect x="7" y="17.5" width="10" height="2" rx="1"/><path d="M12 19.5v2M12 6.5v11"/>',
    'fy.cage': '<path d="M12 2.5v2.4"/><path d="M5 20v-8a7 7 0 0 1 14 0v8"/><path d="M3.8 20h16.4"/><path d="M9.6 5.7V20M14.4 5.7V20M5 13.5h14"/>',
    'fy.coin': '<circle cx="12" cy="12" r="8.6"/><rect x="9.4" y="9.4" width="5.2" height="5.2" rx=".6"/>',
    'fy.truck': '<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 9.5h4l3 3.2v2.8h-7"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
    'fy.box': '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/><path d="m7.8 5.5 8.5 4"/>',
    'fy.store': '<path d="M3.5 9.5 5 4.5h14l1.5 5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5c0 1.4-1.1 2.5-2.5 2.5h-2c-1.4 0-2.5-1.1-2.5-2.5 0 1.4-1.1 2.5-2.5 2.5S3.5 10.9 3.5 9.5z"/><path d="M5 12v8h14v-8"/><path d="M10 20v-4.5h4V20"/>',
    'fy.cloud': '<path d="M7.5 17.5H4.6c-1.7 0-3.1-1.3-3.1-3s1.4-3 3.1-3h.3c.4-2.6 2.6-4.5 5.2-4.5 2 0 3.7 1.1 4.6 2.7.5-.2 1-.3 1.6-.3 2.3 0 4.2 1.8 4.3 4.1 1.1.4 1.9 1.4 1.9 2.6 0 1.5-1.2 2.6-2.7 2.6"/><path d="M8.5 20.5c-1.7 0-2.9-1.1-2.9-2.5s1.1-2.4 2.4-2.4 2.2.9 2.2 2"/>',
    'fy.timer': '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.6 2M9.5 2.5h5M12 2.5v3"/>',
  });

  // ═══ app icon: amber → vermilion, a cream market bag with a Liyue cloud ═══════════════════════
  JC.appIcon.add('feiyun', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffbf47"/><stop offset=".55" stop-color="#f7762f"/><stop offset="1" stop-color="#d9311f"/></linearGradient><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffe6bf"/></linearGradient></defs>` +
    `<rect width="60" height="60" fill="url(#a)"/>` +
    `<path d="M4 14c3-2.6 6.8-2.6 9 .2 2.6-3 7.6-2.4 8.6 1.4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M38 50c3 2.4 7 2.2 9-.6 2.4 2.6 7 2 8-1.4" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.8" stroke-linecap="round"/>` +
    `<path d="M23.5 21v-2.6a6.5 6.5 0 0 1 13 0V21" fill="none" stroke="#fffaf0" stroke-width="2.8" stroke-linecap="round"/>` +
    `<path d="M15.5 21.5h29l-2.2 23.2a2.6 2.6 0 0 1-2.6 2.3H20.3a2.6 2.6 0 0 1-2.6-2.3z" fill="url(#b)"/>` +
    `<path d="M22.4 38.6c-2 0-3.3-1.3-3.3-2.9s1.3-2.9 3-2.9c.4-2.9 2.8-4.9 5.6-4.9 2.1 0 4 1.2 4.9 3 .6-.3 1.2-.4 1.9-.4 2.5 0 4.4 1.9 4.6 4.3 1.3.4 2.2 1.4 2.2 2.8 0 1.6-1.3 2.9-3 2.9" fill="none" stroke="#e3402a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M26 41.8c-1.7 0-2.9-1.1-2.9-2.5s1.1-2.4 2.4-2.4 2.2.9 2.2 2" fill="none" stroke="#e3402a" stroke-width="2.4" stroke-linecap="round"/>` +
    `<circle cx="33.6" cy="41.4" r="1.6" fill="#f5a524"/></svg>`);

  // ═══ persistent state ═════════════════════════════════════════════════════════════════════════
  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const s = d.apps.feiyun || (d.apps.feiyun = {});
    if (!s.v) {
      Object.assign(s, {
        v: 1,
        watch: ['lot_teaset', 'toy_sirfang', 'pen_tonia', 'powerbank'],
        cart: [{ id: 'fish_lures', qty: 1, opt: 'Mixed', on: true }, { id: 'food_pelmeni', qty: 2, opt: '', on: false }],
        recent: D().RECENT.slice(),
        viewed: ['lot_teaset', 'fish_line', 'toy_frost_fortress'],
        lots: {}, chats: null, notices: null, follow: ['hydro', 'mingyun'],
        prefs: { outbid: true, ending: true, orders: true, promos: false },
        addr: 'apartment', extra: [], out: false, gridView: true,
      });
    }
    return s;
  }
  const save = () => JC.state.save();

  // ═══ catalogue ════════════════════════════════════════════════════════════════════════════════
  const prod = (id) => D().P.find((p) => p.id === id) || null;
  const seller = (id) => D().SELLERS[id] || { name: 'Feiyun seller', handle: id, glyph: 'fy.store', bg: ['#8e8e93', '#aeaeb2'], pos: 99, ratings: 0, followers: '0', reply: '', about: '', loc: 'Liyue Harbor', since: 2020 };
  const catOf = (id) => D().CATS.find((c) => c.id === id) || null;
  const isLot = (p) => !!(p && p.kind === 'auction');
  const fee = (p) => (isLot(p) || p.price >= 99 || p.snezh ? 0 : 8);
  const lotEnd = (p) => tp(p.lot.end);
  const watched = (id) => st().watch.includes(id);
  function addr(id) {
    const a = D().ADDRS.find((x) => x.id === id) || st().extra.find((x) => x.id === id);
    if (a) return a;
    const sig = D().SIGNER[id];
    return { id, label: id === 'morepesok' ? '4 Pristan Lane, Morepesok' : id, name: '', line: id === 'morepesok' ? 'Morepesok, Snezhnaya' : '', city: '', icon: 'mappin.fill', sig };
  }
  const addrList = () => D().ADDRS.filter((a) => !a.hidden || st().extra.some((x) => x.id === a.id));
  function hash(s) { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; }
  const fmtK = (n) => (n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, '') + 'k' : String(n));
  const day3 = (t) => U.DAYS[new Date(t).getDay()].slice(0, 3);
  const whenShort = (t) => day3(t) + ' ' + U.fmtTime(t);
  /** time left: 2d 4h · 3h 12m · 42m 13s · 38s */
  function left(ms) {
    if (ms <= 0) return 'Ended';
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), hh = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (d) return d + 'd ' + hh + 'h';
    if (hh) return hh + 'h ' + m + 'm';
    if (m) return m + 'm ' + String(sec).padStart(2, '0') + 's';
    return sec + 's';
  }
  /** 42:13 (minutes:seconds) under an hour, else 1h 12m */
  function clock(ms) { if (ms <= 0) return 'Ended'; if (ms >= 3600e3) return left(ms); const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  /** "today by 8:15 AM" · "tomorrow by 11:10 AM" · "Mon, Oct 19" */
  function arrive(t) {
    const dd = U.dayDiff(JC.time.date(), new Date(t));
    if (dd <= 0) return 'today by ' + U.fmtTime(t);
    if (dd === 1) return 'tomorrow by ' + U.fmtTime(t);
    return U.fmtDate(t, 'day').slice(0, 3) + ', ' + U.fmtDate(t, 'md');
  }

  // ═══ delivery schedule (in-game clock) ═══════════════════════════════════════════════════════
  function nextOpen(t, open, close) {
    const d = new Date(t);
    const hr = d.getHours() + d.getMinutes() / 60;
    if (hr >= open && hr < close) return t;
    const n = new Date(t);
    if (hr >= close) n.setDate(n.getDate() + 1);
    n.setHours(Math.floor(open), Math.round((open % 1) * 60), 0, 0);
    return n.getTime();
  }
  /** [paid, packed, out for delivery, delivered] */
  function schedule(t0, kind, to) {
    const S = D().SHIP[kind] || D().SHIP.local;
    const packed = nextOpen(t0 + S.pack * 60e3, S.open, S.close);
    let out = nextOpen(packed + S.toCourier * 60e3, S.open, S.close - S.ride / 60);
    if (S.days) out = nextOpen(out + S.days * 86400e3, S.open, S.close - S.ride / 60);
    if (addr(to).far) out = nextOpen(new Date(out).setHours(23, 59) + 60e3, S.open, S.close);
    return [t0, packed, out, out + S.ride * 60e3];
  }
  const stageOf = (o, t) => { const n = t == null ? now() : t; let s = -1; o.steps.forEach((x, i) => { if (n >= x) s = i; }); return Math.max(0, s); };
  const STAGES = ['Paid', 'Packed', 'Out for delivery', 'Delivered'];
  const COURIERS = ['Courier Lin', 'Courier Guo', 'Courier Zhou', 'Courier Bai', 'Courier Tang', 'Courier Wen'];

  JC.store.seed('fy_orders', () => D().ORDERS.map((o) => Object.assign({}, o, {
    t: tp(o.t), steps: o.steps.map(tp), kind: 'buy', seen: 3, ship: o.ship || 0,
    toLabel: o.toLabel || null, courier: COURIERS[hash(o.id) % COURIERS.length],
  })));

  // ═══ notices (the "Feiyun Notices" inbox) + push + SMS ═══════════════════════════════════════
  function notices() {
    const s = st();
    if (!s.notices) {
      s.notices = [
        { id: 'nt_watch', t: tp('-0 22:43'), title: 'Added to Watching', body: 'Guizhong-era celadon tea set · bidding ends Sat 00:30', art: 'mk_teaset', target: { id: 'lot_teaset' }, read: true },
        { id: 'nt_line', t: tp('-1 12:02'), title: 'Delivered', body: 'HYDRO·CARBON braided line ×2 — left with the concierge, Pier View Residences.', art: 'fy_line', target: { order: 'fo_1015_line' }, read: true },
        { id: 'nt_snezh', t: tp('-5 09:00'), title: 'Snezhnaya imports week', body: 'Free delivery on pens, wool, pelmeni and more from the north. Ends Thu 22 Oct.', art: 'fy_banner_snezh', target: { collection: 'snezh' }, read: true },
      ];
    }
    return s.notices;
  }
  function sms(text) { try { JC.story.incoming('market', { from: 'market', text }); } catch (e) { /* no market thread */ } }
  /** an app notice: always in the inbox; pushed when the pref allows; optional SMS */
  function notice(n, o) {
    o = o || {};
    const item = Object.assign({ id: U.uid('nt'), t: now(), read: false }, n);
    notices().unshift(item);
    if (notices().length > 60) notices().length = 60;
    save();
    if (o.push !== false) JC.notify.push({ app: 'feiyun', title: n.title, body: n.body, art: n.art, open: { app: 'feiyun', intent: n.target || {} } });
    if (o.sms) sms(o.sms);
    badge();
    JC.bus.emit('feiyun:notices');
    return item;
  }
  function unreadCount() {
    const s = st();
    let n = notices().filter((x) => !x.read).length;
    Object.values(chats()).forEach((c) => { n += c.unread || 0; });
    return n;
  }
  function badge() { try { JC.notify.badge('feiyun', unreadCount()); } catch (e) { /* notify not ready */ } }

  // ═══ seller chats ═════════════════════════════════════════════════════════════════════════════
  function chats() {
    const s = st();
    if (!s.chats) {
      s.chats = {};
      D().CHATS.forEach((c) => { s.chats[c.id] = { id: c.id, seller: c.seller, product: c.product || null, unread: 0, msgs: c.msgs.map(([t, from, text, x]) => Object.assign({ t: tp(t), from, text }, x || {})) }; });
    }
    return s.chats;
  }
  function chatFor(sid, pid) {
    const c = chats();
    if (!c[sid]) c[sid] = { id: sid, seller: sid, product: pid || null, unread: 0, msgs: [] };
    if (pid && !c[sid].product) c[sid].product = pid;
    return c[sid];
  }
  let chatOpen = null; // chat id on screen
  function sellerSays(cid, m, o) {
    const c = chats()[cid];
    if (!c) return;
    c.msgs.push(Object.assign({ t: now(), from: 'seller' }, m));
    c.typing = false;
    const viewing = chatOpen === cid && JC.os.isOpen('feiyun');
    if (!viewing) {
      c.unread = (c.unread || 0) + 1;
      if (!(o && o.quiet)) JC.notify.push({ app: 'feiyun', title: seller(c.seller).name, body: m.img ? 'Sent a photo' + (m.text ? ': ' + m.text : '') : m.text, art: m.img, open: { app: 'feiyun', intent: { chat: cid } } });
    } else JC.audio.play('receive');
    save();
    badge();
    JC.bus.emit('feiyun:chat', { id: cid });
  }
  function replyFor(sid, text) {
    const R = D().REPLIES[sid];
    const ctx = { won: (lotSt('lot_teaset') || {}).result === 'won' };
    if (R) {
      for (const [re, ans] of R.rules) if (re.test(text)) return typeof ans === 'function' ? ans(ctx) : ans;
      return R.fallback;
    }
    return D().DEFAULT_REPLY;
  }
  function sendChat(cid, text) {
    const c = chats()[cid];
    if (!c || !text.trim()) return;
    c.msgs.push({ t: now(), from: 'me', text: text.trim() });
    save();
    JC.bus.emit('feiyun:chat', { id: cid });
    const answered = c.msgs.filter((m) => m.from === 'me').length;
    const sc = Math.max(1, JC.story.timeScale ? JC.story.timeScale() : 1);
    setTimeout(() => { c.typing = true; JC.bus.emit('feiyun:chat', { id: cid }); }, 900 / sc);
    setTimeout(() => sellerSays(cid, { text: replyFor(c.seller, text) }), (2600 + Math.min(4, answered) * 300) / sc);
  }

  // ═══ auctions (proxy bidding, runs on the in-game clock) ═══════════════════════════════════════
  function lotSt(id) {
    const L = D().LOTS[id];
    if (!L) return null;
    const s = st();
    if (!s.lots[id]) {
      const b = {};
      Object.keys(L.bidders).forEach((k) => { b[k] = { max: L.bidders[k].max, t: tp(L.bidders[k].t), score: L.bidders[k].score }; });
      s.lots[id] = { price: L.price, leader: L.leader, bidders: b, hist: L.hist.map(([t, who, amt, auto]) => ({ t: tp(t), who, amt, auto: !!auto })), ev: {}, closed: false, result: null, myMax: 0, warned: {}, to: 'apartment', seenBase: false };
    }
    return s.lots[id];
  }
  const minBid = (id) => { const S = lotSt(id), p = prod(id); return S.leader ? S.price + p.lot.inc : p.lot.start; };
  const bidCount = (id) => lotSt(id).hist.length;
  const bidders = (id) => new Set(lotSt(id).hist.map((x) => x.who)).size;
  const lotOpen = (id) => { const S = lotSt(id); return !S.closed && now() < lotEnd(prod(id)); };
  function scoreOf(id, who) { const b = lotSt(id).bidders[who]; return b && b.score; }

  /** a proxy bid: `max` is the bidder's ceiling; the price moves just enough to keep the leader ahead */
  function placeBid(id, who, max, t) {
    const p = prod(id), S = lotSt(id);
    t = t == null ? now() : t;
    if (S.closed || t >= lotEnd(p)) return { ok: false, reason: 'ended' };
    const prev = S.leader;
    if (who === prev) {
      if (max <= S.bidders[who].max) return { ok: false, reason: 'low', min: S.bidders[who].max + 1 };
      S.bidders[who].max = max; S.bidders[who].t = t;
      if (who === 'me') S.myMax = max;
      save(); JC.bus.emit('feiyun:lot', { id });
      return { ok: true, leading: true, price: S.price, raised: true };
    }
    const min = minBid(id);
    if (max < min) return { ok: false, reason: 'low', min };
    const wasMe = prev === 'me';
    S.bidders[who] = Object.assign(S.bidders[who] || {}, { max, t });
    if (who === 'me') S.myMax = max;
    const Lm = prev ? S.bidders[prev].max : 0;
    if (!prev) { S.leader = who; S.price = p.lot.start; S.hist.push({ t, who, amt: S.price }); }
    else if (max > Lm) {
      if (Lm > S.price) S.hist.push({ t, who: prev, amt: Lm, auto: true });
      S.price = Math.min(max, Lm + p.lot.inc); S.leader = who; S.hist.push({ t, who, amt: S.price });
    } else {
      S.hist.push({ t, who, amt: max });
      S.price = Math.min(Lm, max + p.lot.inc);
      S.hist.push({ t: t + 1, who: prev, amt: S.price, auto: true });
    }
    save();
    JC.bus.emit('feiyun:lot', { id });
    if (wasMe && S.leader !== 'me') outbid(id, who);
    islandSync();
    return { ok: true, leading: S.leader === 'me', price: S.price, leader: S.leader };
  }
  function outbid(id, by) {
    const p = prod(id), S = lotSt(id);
    notice({ title: 'You’ve been outbid', body: p.short + ' — ' + by + ' bid ' + money(S.price) + '. Ends ' + whenShort(lotEnd(p)) + '.', art: p.art[0], target: { id } },
      { push: st().prefs.outbid, sms: '[Feiyun Market] You’ve been outbid on “' + p.short + '”. Current bid ' + money(S.price) + '. Bidding ends ' + whenShort(lotEnd(p)) + '. feiyun.ly/l/' + p.lot.no.slice(-4) });
  }
  /** the lot closes: the leader pays (JC.bank) or loses it to the runner-up */
  function closeLot(id) {
    const p = prod(id), S = lotSt(id);
    if (!S || S.closed) return;
    S.closed = true;
    S.closedAt = lotEnd(p);
    const mine = S.myMax > 0;
    if (S.leader === 'me') {
      const r = JC.bank.charge({ amount: S.price, merchant: 'Feiyun Market', app: 'feiyun', cat: 'shopping', note: 'Auction ' + p.lot.no + ' · ' + p.short, sms: 'FEIYUN MARKET' });
      if (r.ok) {
        S.result = 'won'; S.finalPrice = S.price; S.winner = 'me';
        const o = JC.store.add('fy_orders', {
          id: 'fo_' + id, seller: p.seller, items: [{ pid: id, title: p.title, qty: 1, price: S.price, art: p.art[0] }], total: S.price, ship: 0, t: now(), to: S.to,
          steps: schedule(Math.max(now(), S.closedAt), p.ship, S.to), carrier: D().SHIP[p.ship].courier, track: 'FS ' + (1000 + (hash(id) % 9000)) + ' ' + p.lot.no.slice(-4) + ' 30', kind: 'auction', seen: 0, courier: COURIERS[hash(id) % COURIERS.length], tx: r.tx && r.tx.id,
        }, { front: true });
        save();
        act('auction_won', { id, total: S.price, to: S.to, order: o.id });
        notice({ title: 'You won! 🎉', body: p.short + ' — ' + money(S.price) + ', paid with Northland Black ••1111. The seller has been notified.', art: p.art[0], target: { id } },
          { sms: '[Feiyun Market] Congratulations! You won lot ' + p.lot.no + ' “' + p.short + '” for ' + money(S.price) + '. Payment received. Track: feiyun.ly/o/' + o.id.slice(-6) });
        mailReceipt(o, 'You won: ' + p.short);
        if (id === 'lot_teaset') {
          const c = chatFor('linlang', id);
          const sc = Math.max(1, JC.story.timeScale ? JC.story.timeScale() : 1);
          setTimeout(() => {
            c.msgs.push({ t: now(), from: 'seller', text: 'Congratulations. As promised, the base of the teapot — I kept it out of the listing.', img: 'fy_teaset_base' });
            sellerSays('linlang', { text: 'The mark is under the glaze, so it is as old as the pot. It reads “for Morax — G.” I don’t ask what that means. I suspect you will.' });
          }, 6000 / sc);
        }
      } else {
        // payment failed: second-chance offer to the runner-up at their maximum
        const others = Object.keys(S.bidders).filter((k) => k !== 'me').sort((a, b) => S.bidders[b].max - S.bidders[a].max);
        const ru = others[0];
        S.result = 'failed'; S.failReason = r.reason; S.winner = ru; S.finalPrice = ru ? Math.min(S.bidders[ru].max, S.price) : 0;
        save();
        act('auction_lost', { id, bid: S.myMax, price: S.finalPrice, winner: ru || null, reason: r.reason });
        notice({ title: 'Payment failed — lot lost', body: p.short + ': your payment was declined (' + (r.reason === 'frozen' ? 'card frozen' : 'insufficient funds') + '). The lot went to ' + (ru || 'the runner-up') + '.', art: p.art[0], target: { id } },
          { sms: '[Feiyun Market] Payment for lot ' + p.lot.no + ' was declined. The item has been offered to the next highest bidder.' });
        if (JC.os.isOpen('feiyun')) JC.ui.alert({ title: r.reason === 'frozen' ? 'Card Frozen' : 'Payment Declined', message: JC.bank.reasonText(r.reason) + ' You won “' + p.short + '”, but the payment failed, so the lot went to ' + (ru || 'the runner-up') + '.', buttons: [{ text: 'OK' }] });
      }
    } else {
      S.result = 'lost'; S.winner = S.leader; S.finalPrice = S.price;
      save();
      if (mine || id === 'lot_teaset') act('auction_lost', { id, bid: S.myMax || 0, price: S.price, winner: S.leader });
      if (mine) notice({ title: 'Bidding ended — you didn’t win', body: p.short + ' sold for ' + money(S.price) + ' to ' + S.leader + '.', art: p.art[0], target: { id } }, { sms: '[Feiyun Market] Lot ' + p.lot.no + ' has ended. You were outbid: sold for ' + money(S.price) + '.' });
      else if (watched(id)) notice({ title: 'Ended', body: p.short + ' sold for ' + money(S.price) + '.', art: p.art[0], target: { id } }, { push: st().prefs.ending });
    }
    JC.bus.emit('feiyun:lot', { id });
    islandSync();
  }
  function checkLots() {
    if (!JC.state.d.started) return;
    const t = now();
    D().P.forEach((p) => {
      if (!isLot(p)) return;
      const S = lotSt(p.id);
      if (S.closed) return;
      const end = lotEnd(p);
      (D().LOTS[p.id].events || []).forEach((e, i) => {
        const at = tp(e.at);
        if (S.ev[i] || t < at) return;
        S.ev[i] = 1;
        S.bidders[e.who] = S.bidders[e.who] || { max: 0, t: at, score: e.score };
        S.bidders[e.who].score = e.score;
        if (at < end && e.max >= minBid(p.id) && S.leader !== e.who) placeBid(p.id, e.who, e.max, at);
        save();
      });
      if (t >= end) { closeLot(p.id); return; }
      if (!(watched(p.id) || S.myMax > 0) || !st().prefs.ending) return;
      const rem = end - t;
      [[15, 5], [5, 0]].forEach(([m, below]) => {
        if (S.warned[m] || rem > m * 60e3) return;
        S.warned[m] = 1; save();
        if (rem <= below * 60e3) return;
        const st8 = S.leader === 'me' ? 'You’re the highest bidder at ' + money(S.price) + '.' : S.myMax ? 'You’ve been outbid — current bid ' + money(S.price) + '.' : 'Current bid ' + money(S.price) + ' · ' + bidCount(p.id) + ' bids.';
        notice({ title: 'Ending in ' + Math.ceil(rem / 60e3) + ' minutes', body: p.short + '. ' + st8, art: p.art[0], target: { id: p.id } });
      });
    });
  }
  // the Dynamic Island shows the countdown while you're bidding on a lot that ends within the hour
  let islLot = null;
  function islandSync() {
    if (!JC.os || !JC.os.island) return;
    const t = now();
    const live = D().P.filter((p) => isLot(p) && lotSt(p.id).myMax > 0 && !lotSt(p.id).closed && lotEnd(p) > t && lotEnd(p) - t < 3600e3).sort((a, b) => lotEnd(a) - lotEnd(b))[0];
    if (!live) { if (islLot) { JC.os.island.stop(ISL); islLot = null; } return; }
    if (islLot === live.id && JC.os.island.has(ISL)) return;
    islLot = live.id;
    const id = live.id;
    JC.os.island.start(ISL, {
      priority: 1, width: 228,
      compact: () => {
        const S = lotSt(id), lead = S.leader === 'me';
        return { left: h('span.fy-isl-l', { class: { lead } }, JC.icon('fy.gavel', { size: 16 })), right: h('span.fy-isl-r', { class: { lead } }, clock(lotEnd(prod(id)) - now())) };
      },
      expanded: (el) => {
        const S = lotSt(id), p = prod(id), lead = S.leader === 'me';
        el.append(h('div.fy-isl-x',
          JC.art.el(p.art[0], { cls: 'fy-isl-img' }),
          h('div.fy-isl-m', h('b', p.short), h('span', (lead ? 'Highest bidder · ' : 'Outbid · ') + money(S.price)), h('span.fy-isl-t', 'Ends in ' + left(lotEnd(p) - now()))),
          h('div.fy-isl-btn', { class: { lead }, onTap: () => JC.os.open('feiyun', { id }) }, lead ? 'View' : 'Bid')));
      },
      onTap: () => JC.os.open('feiyun', { id }),
    });
  }

  // ═══ orders: tracking follows the clock ═══════════════════════════════════════════════════════
  function checkOrders() {
    if (!JC.state.d.started) return;
    JC.store.all('fy_orders').slice().forEach((o) => {
      const s = stageOf(o);
      if (s <= (o.seen || 0)) return;
      JC.store.update('fy_orders', o.id, { seen: s });
      const it = o.items[0], a = addr(o.to), more = o.items.length > 1 ? ' and ' + (o.items.length - 1) + ' more' : '';
      const gift = !!o.note;
      const P = st().prefs.orders;
      if (s === 1) notice({ title: 'Packed', body: seller(o.seller).name + ' packed ' + it.title + more + (gift ? ' (gift-wrapped with your note).' : '.'), art: it.art, target: { order: o.id } }, { push: false });
      if (s === 2) notice({ title: 'Out for delivery', body: it.title + more + ' is on its way to ' + (o.toLabel || a.label) + ' with ' + (o.courier || 'the courier') + '. Arriving ' + arrive(o.steps[3]) + '.', art: it.art, target: { order: o.id } }, { push: P });
      if (s === 3) {
        JC.audio.play('tink');
        const sig = D().SIGNER[o.to] || 'Delivered';
        notice({ title: gift ? 'Your gift was delivered 🎁' : 'Delivered', body: it.title + more + ' — ' + sig.replace(/^./, (c) => c.toLowerCase()) + '.', art: it.art, target: { order: o.id } },
          { push: P, sms: '[Feiyun Market] Delivered: ' + it.title + more + ' to ' + (o.toLabel || a.label) + '. ' + sig + '. Rate your order: feiyun.ly/o/' + o.id.slice(-6) });
        o.items.forEach((x) => act('delivered', { id: x.pid, order: o.id, to: o.to }));
      }
    });
  }
  function mailReceipt(o, subject) {
    try {
      const a = addr(o.to);
      const lines = o.items.map((x) => x.qty + ' × ' + x.title + (x.opt ? ' (' + x.opt + ')' : '') + ' — ' + money(x.price * x.qty));
      JC.store.add('mail', {
        box: 'inbox', from: { name: 'Feiyun Market', addr: 'orders@feiyun.ly' }, to: [{ name: 'Childe', addr: 'ajax.fishes@ripple.mail' }], subject, t: now(), read: false, flagged: false,
        body: 'Hi Childe,\n\nThank you for shopping on Feiyun Market. Order ' + o.id.toUpperCase().replace(/_/g, '-') + '\n\n' + lines.join('\n') + '\nDelivery: ' + (o.ship ? money(o.ship) : 'Free') + '\nTotal paid: ' + money(o.total) + ' (Northland Black ••1111)\n\nDeliver to: ' + (o.toLabel || a.label) + (a.line ? ', ' + a.line : '') + '\nEstimated delivery: ' + U.fmtDate(o.steps[3], 'long') + ', ' + U.fmtTime(o.steps[3]) + (o.note ? '\nGift note: “' + o.note + '”' : '') + '\n\nTrack your order in the Feiyun Market app.\n— Feiyun Commerce Guild, Liyue Harbor',
      }, { front: true });
    } catch (e) { /* mail collection unavailable */ }
  }

  // ═══ clock & boot hooks (the market runs whether or not the app is open) ══════════════════════
  JC.bus.on('tick', () => { try { checkLots(); } catch (e) { console.error('[feiyun] lots', e); } });
  JC.bus.on('minute', () => { try { checkOrders(); islandSync(); } catch (e) { console.error('[feiyun] orders', e); } });
  JC.bus.on('boot', () => { try { checkLots(); checkOrders(); islandSync(); badge(); } catch (e) { console.error('[feiyun] boot', e); } });
  JC.bus.on('story:reset', () => { if (JC.os.island && JC.os.island.has(ISL)) JC.os.island.stop(ISL); islLot = null; setTimeout(() => { badge(); islandSync(); }, 50); });

  // shared with tests and other apps
  JC.feiyun = { lot: lotSt, placeBid, closeLot, checkLots, checkOrders, schedule, prod, minBid, state: st, sendChat, chats, notices };

  // ═══ the app ═══════════════════════════════════════════════════════════════════════════════════
  const flatten = (f) => (typeof f === 'function' ? (x) => { const r = f(x); return Array.isArray(r) ? r.flat(Infinity).filter(Boolean) : r; } : f);
  let picksOrder = null;

  JC.app({
    id: 'feiyun',
    name: 'Feiyun Market',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-feiyun');
      win.el.classList.add('fyw');
      win.el.style.setProperty('--tint', TINT);
      const offs = [];
      const on = (ev, fn) => offs.push(JC.bus.on(ev, fn));
      const timers = [];
      const PAGE = (o) => {
        const pg = JC.ui.page(Object.assign({}, o, {
          content: flatten(o.content),
          onShow: (q) => { syncBar(q); if (o.onShow) o.onShow(q); },
        }));
        if (o.navHidden) pg.navbar.classList.remove('always-title');
        if (o.footer) pg.el.classList.add('fy-has-bar');
        return pg;
      };
      const SHEET = (o) => JC.ui.sheet(Object.assign({}, o, { content: flatten(o.content), cls: 'fy-sheet ' + (o.cls || '') }));

      // live countdowns (in-game seconds)
      const live = new Set();
      function cd(end, fmt, cls) {
        const el = h('span.fy-cd', { class: cls });
        const x = { el, end, fmt: fmt || left };
        paintCd(x);
        live.add(x);
        return el;
      }
      function paintCd(x) {
        const ms = x.end - now();
        x.el.textContent = x.fmt(ms);
        x.el.classList.toggle('urgent', ms > 0 && ms < 3600e3);
        x.el.classList.toggle('ended', ms <= 0);
      }
      on('tick', () => { live.forEach((x) => { if (!x.el.isConnected) { live.delete(x); return; } paintCd(x); }); });

      let tabs = null;
      function syncBar(pg) { if (tabs && pg && tabs.nav() && tabs.nav().top() === pg) tabs.hideBar(!!pg.opts.noTabs); }
      function push(pg) { if (!pg) return; const n = tabs.nav(); n.push(pg); tabs.hideBar(!!pg.opts.noTabs); }
      function tabBadges() {
        tabs.badge('cart', st().cart.reduce((a, b) => a + b.qty, 0) || 0);
        tabs.badge('orders', JC.store.all('fy_orders').filter((o) => stageOf(o) < 3).length || 0);
      }

      // ═══ shared bits ═══
      function priceEl(n, cls) { return h('span.fy-price', { class: cls }, h('small', 'ℳ'), Math.round(n).toLocaleString('en-US')); }
      function stars(r, size) { return h('span.fy-stars', [1, 2, 3, 4, 5].map((i) => JC.icon(r >= i - 0.25 ? 'star.fill' : 'star', { size: size || 12 }))); }
      function logo(sid, size) {
        const s = seller(sid);
        size = size || 40;
        return h('div.fy-logo', { style: { width: size + 'px', height: size + 'px', background: 'linear-gradient(135deg,' + s.bg[0] + ',' + s.bg[1] + ')' } }, JC.icon(s.glyph, { size: Math.round(size * 0.5) }));
      }
      function priceOf(p) { return isLot(p) ? lotSt(p.id).price : p.price; }
      function heart(id, cls) {
        const el = h('div.fy-heart', { class: [cls, { on: watched(id) }], onTap: (e) => { e.stopPropagation(); toggleWatch(id); el.classList.toggle('on', watched(id)); el.innerHTML = ''; el.appendChild(JC.icon(watched(id) ? 'heart.fill' : 'heart', { size: 16 })); } }, JC.icon(watched(id) ? 'heart.fill' : 'heart', { size: 16 }));
        return el;
      }
      function toggleWatch(id) {
        const s = st();
        const p = prod(id);
        if (watched(id)) { s.watch = s.watch.filter((x) => x !== id); JC.ui.toast('Removed from Watching', { icon: 'heart' }); }
        else { s.watch.unshift(id); JC.audio.haptic(10); JC.ui.toast('Added to Watching', { icon: 'heart.fill' }); }
        save();
        JC.bus.emit('feiyun:watch', { id, on: watched(id), title: p && p.short });
      }
      function addToCart(id, qty, opt) {
        const s = st();
        const p = prod(id);
        const ex = s.cart.find((x) => x.id === id && (x.opt || '') === (opt || ''));
        if (ex) ex.qty = Math.min(9, ex.qty + (qty || 1));
        else s.cart.unshift({ id, qty: qty || 1, opt: opt || '', on: true });
        save();
        tabBadges();
        JC.audio.play('tink');
        JC.ui.toast('Added to cart · ' + p.short, { icon: 'cart.fill' });
        JC.bus.emit('feiyun:cart');
      }
      function share(p) {
        JC.ui.share({ title: p.title, subtitle: 'Feiyun Market · ' + money(priceOf(p)), art: p.art[0], payload: { kind: 'link', text: p.title + ' — ' + money(priceOf(p)) + ' on Feiyun Market', url: 'https://feiyun.ly/item/' + p.id, art: p.art[0] } });
      }
      function cardMenu(p) {
        return { items: [
          { text: watched(p.id) ? 'Unwatch' : 'Watch', icon: watched(p.id) ? 'heart.fill' : 'heart', onTap: () => toggleWatch(p.id) },
          !isLot(p) ? { text: 'Add to Cart', icon: 'cart.fill', onTap: () => addToCart(p.id, 1, p.opts ? p.opts.list[0] : '') } : null,
          { text: 'Share', icon: 'square.and.arrow.up', onTap: () => share(p) },
          { text: 'Visit Store', icon: 'fy.store', onTap: () => push(sellerPage(p.seller)) },
        ].filter(Boolean) };
      }
      function card(p) {
        const pct = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
        const el = h('div.fy-card', { onTap: () => openItem(p.id) },
          h('div.fy-card-img', JC.art.el(p.art[0], { cls: 'fy-fill' }),
            isLot(p) ? h('span.fy-tag.auc', JC.icon('fy.gavel', { size: 11 }), lotOpen(p.id) ? cd(lotEnd(p)) : 'Ended') : pct ? h('span.fy-tag.deal', '−' + pct + '%') : p.snezh ? h('span.fy-tag.snz', JC.icon('snowflake', { size: 10 }), 'Imports') : null,
            heart(p.id, 'fy-card-heart')),
          h('div.fy-card-b',
            h('div.fy-card-t', seller(p.seller).official ? h('span.fy-off', 'Official') : null, p.title),
            h('div.fy-card-p', priceOf(p) ? priceEl(priceOf(p)) : null, isLot(p) ? h('span.fy-card-sub', bidCount(p.id) + ' bids') : p.was ? h('s.fy-was', money(p.was)) : null),
            h('div.fy-card-m', isLot(p) ? [h('span', lotOpen(p.id) ? (lotSt(p.id).leader === 'me' ? 'You’re winning' : lotSt(p.id).myMax ? 'Outbid' : bidders(p.id) + ' bidders') : lotSt(p.id).result === 'won' ? 'You won' : 'Sold')] : [JC.icon('star.fill', { size: 10 }), ' ' + p.rating.toFixed(1) + ' · ' + fmtK(p.sold) + ' sold']),
            fee(p) === 0 && !isLot(p) ? h('div.fy-card-ship', 'Free delivery') : null));
        JC.ui.contextMenu(el, () => cardMenu(p));
        return el;
      }
      const grid = (list) => h('div.fy-grid', list.map(card));
      function row(p, o) {
        o = o || {};
        const S = isLot(p) ? lotSt(p.id) : null;
        return {
          leading: h('div.fy-thumb', JC.art.el(p.art[0], { cls: 'fy-fill' })),
          title: p.short,
          subtitle: isLot(p) ? h('span.fy-rowsub', money(S.price) + ' · ' + bidCount(p.id) + ' bids · ', lotOpen(p.id) ? cd(lotEnd(p)) : h('span', S.result === 'won' ? 'You won' : 'Ended')) : money(p.price) + (fee(p) ? ' + ' + money(fee(p)) + ' delivery' : ' · Free delivery'),
          subtitle2: o.sub || null,
          onTap: () => openItem(p.id),
          swipe: o.swipe, menu: () => cardMenu(p), cls: 'fy-prow',
        };
      }
      function sectionH(t, more, fn) {
        return h('div.fy-sh', h('span', t), more ? h('span.fy-sh-more', { onTap: fn }, more, JC.icon('chevron.right', { size: 12, weight: 2.6 })) : null);
      }
      function openItem(id) { const p = prod(id); if (!p) { JC.ui.toast('This listing is no longer available', { icon: 'exclamationmark.circle.fill' }); return; } push(itemPage(id)); }
      function chatBtn() {
        const n = unreadCount();
        return JC.ui.navBtn({ icon: 'message', label: 'Messages', badge: n || null, onTap: () => push(inboxPage()) });
      }
      function meBtn() {
        const b = h('div.fy-mebtn', { onTap: () => push(accountPage()) }, JC.ui.avatar('me', 36));
        return b;
      }

      // pull to refresh on a page's scroller
      function pullToRefresh(pg, fn) {
        const sp = h('div.fy-ptr', h('div.fy-ptr-spin'));
        pg.el.appendChild(sp);
        let pull = 0;
        U.drag(pg.scroll, {
          axis: 'y',
          filter: () => pg.scroll.scrollTop <= 0,
          start: (e, p) => (p.dy > 0 ? undefined : false),
          move: (e, p) => {
            pull = Math.max(0, p.dy) * 0.5;
            pg.content.style.transform = 'translateY(' + Math.min(110, pull) + 'px)';
            sp.style.opacity = String(Math.min(1, pull / 70));
            sp.style.transform = 'translateX(-50%) rotate(' + pull * 4 + 'deg)';
          },
          end: () => {
            const go = pull > 70;
            pg.content.style.transition = 'transform .35s var(--ease)';
            if (go) {
              pg.content.style.transform = 'translateY(56px)';
              sp.classList.add('spin');
              JC.audio.haptic(12);
              setTimeout(() => { fn(); sp.classList.remove('spin'); sp.style.opacity = '0'; pg.content.style.transform = ''; setTimeout(() => { pg.content.style.transition = ''; }, 380); }, 900);
            } else { pg.content.style.transform = ''; sp.style.opacity = '0'; setTimeout(() => { pg.content.style.transition = ''; }, 380); }
            pull = 0;
          },
        });
      }

      // ═══ HOME ═══
      function bannerDefs() {
        const t = now();
        const riteA = tp('+2 00:00'), riteB = tp('+2 20:00');
        const tea = prod('lot_teaset');
        const rite = t < riteA ? { kicker: 'Sun 18 Oct · Yujing Terrace', title: 'Rite of Parting — memorial lanterns', sub: 'Lanterns, glaze lilies and tributes. Order by Sat 18:00.' }
          : t < riteB ? { kicker: 'Today · Yujing Terrace', title: 'Rite of Parting — memorial lanterns', sub: 'The founder’s lanterns rise at dusk. Same-day delivery until 18:00.' }
            : { kicker: 'In memoriam', title: 'Thank you, Liyue', sub: 'Lanterns and tributes from the Rite of Parting.' };
        return [
          Object.assign({ id: 'rite', art: 'fy_banner_rite', cta: 'Shop the Rite', dark: true }, rite),
          { id: 'snezh', art: 'fy_banner_snezh', kicker: 'Until Thu 22 Oct', title: 'Snezhnaya imports week', sub: 'Pens, wool, spoons and pelmeni — free delivery from the north.', cta: 'Explore' },
          { id: 'auctions', art: 'fy_banner_auction', dark: true, kicker: 'Feiyun Auctions', title: 'Antiques night', sub: lotOpen('lot_teaset') ? 'Celadon tea set closes ' + whenShort(lotEnd(tea)) + '.' : 'Jade, prints and porcelain.', cta: 'See lots', cd: lotOpen('lot_teaset') ? lotEnd(tea) : null },
        ];
      }
      let bannerTimer = null;
      function banners() {
        const B = bannerDefs();
        const dots = h('div.fy-dots', B.map((b, i) => h('i', { class: { on: i === 0 } })));
        const track = h('div.fy-bn-track', B.map((b) => h('div.fy-bn', { class: { dark: !!b.dark }, onTap: () => push(collectionPage(b.id)) },
          JC.art.el(b.art, { cls: 'fy-fill' }),
          h('div.fy-bn-txt', h('span.fy-bn-k', b.kicker), h('b', b.title), h('span.fy-bn-s', b.sub), h('span.fy-bn-cta', b.cta, b.cd ? [' · ', cd(b.cd)] : null, JC.icon('chevron.right', { size: 11, weight: 2.8 }))))));
        let idx = 0;
        track.addEventListener('scroll', () => {
          const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          if (i !== idx) { idx = i; Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i)); }
        }, { passive: true });
        clearInterval(bannerTimer);
        bannerTimer = setInterval(() => {
          if (!track.isConnected) { clearInterval(bannerTimer); return; }
          if (!JC.os.isOpen('feiyun') || tabs.current() !== 'home' || tabs.nav('home').depth() > 1) return;
          const n = (idx + 1) % B.length;
          track.scrollTo({ left: n * track.clientWidth, behavior: 'smooth' });
        }, 5200);
        timers.push(() => clearInterval(bannerTimer));
        return h('div.fy-banners', track, dots);
      }
      function catsGrid() {
        return h('div.fy-cats', D().CATS.map((c) => h('div.fy-cat', { onTap: () => push(c.id === 'auctions' ? collectionPage('auctions') : categoryPage(c.id)) },
          h('div.fy-cat-ic', { style: { '--c': c.c } }, JC.icon(c.glyph, { size: 24 })), h('span', c.name))));
      }
      function endingSoon() {
        const lots = D().P.filter((p) => isLot(p) && lotOpen(p.id)).sort((a, b) => lotEnd(a) - lotEnd(b));
        if (!lots.length) return null;
        return [sectionH('Ending soon', 'See all', () => push(collectionPage('auctions'))),
          h('div.fy-hs', lots.map((p) => {
            const S = lotSt(p.id);
            return h('div.fy-es', { onTap: () => openItem(p.id) },
              h('div.fy-es-img', JC.art.el(p.art[0], { cls: 'fy-fill' }), h('span.fy-tag.auc', JC.icon('fy.timer', { size: 11 }), cd(lotEnd(p)))),
              h('div.fy-es-t', p.short),
              h('div.fy-es-p', priceEl(S.price), h('span', bidCount(p.id) + ' bids')),
              S.myMax ? h('div.fy-es-st', { class: { lead: S.leader === 'me' } }, S.leader === 'me' ? 'Highest bidder' : 'Outbid') : h('div.fy-es-st.muted', bidders(p.id) + ' bidders'));
          }))];
      }
      function recentStrip() {
        const ids = st().viewed.filter((id) => prod(id)).slice(0, 10);
        if (!ids.length) return null;
        return [sectionH('Recently viewed', 'Clear', () => { st().viewed = []; save(); const n = tabs.nav('home'); if (n && n.top()) n.top().render(); }),
          h('div.fy-hs.small', ids.map((id) => { const p = prod(id); return h('div.fy-rv', { onTap: () => openItem(id) }, h('div.fy-rv-img', JC.art.el(p.art[0], { cls: 'fy-fill' })), priceEl(priceOf(p), 'sm')); }))];
      }
      function picks() {
        if (!picksOrder) picksOrder = D().PICKS.slice();
        const list = picksOrder.map(prod).filter(Boolean);
        return [sectionH('Picks for you'), h('div.fy-sh-sub', 'Guild Picks · from your fishing, gifts and tea'), grid(list), h('div.fy-end', JC.icon('fy.cloud', { size: 18 }), 'You’re all caught up · pull down to refresh')];
      }
      function notices2() {
        const out = [];
        if (flag('osial_sent')) out.push(h('div.fy-alert', JC.icon('exclamationmark.triangle.fill', { size: 16 }), 'Storm warning at sea: harbor couriers are running late.'));
        if (flag('card_frozen')) out.push(h('div.fy-alert.cold', { onTap: () => push(accountPage()) }, JC.icon('snowflake', { size: 16 }), 'Your Northland card is frozen. Purchases and auction payments will be declined.'));
        return out;
      }
      function homePage() {
        const pg = PAGE({
          title: 'Feiyun Market', cls: 'fy-home', navHidden: true,
          right: [chatBtn(), meBtn()],
          onScroll: (y, q) => q.navbar.classList.toggle('show-title', y > 70),
          onShow: (q) => { q.setRight([chatBtn(), meBtn()]); q.render(); },
          content: () => [
            h('div.fy-hero',
              h('div.fy-brand', h('span.fy-brand-mark', JC.icon('fy.cloud', { size: 20, weight: 2.2 })), h('span.fy-brand-cn', '飞云'), h('span.fy-brand-en', 'Feiyun Market')),
              h('div.fy-sp', { onTap: () => tabs.select('search', true) }, JC.icon('magnifyingglass', { size: 17, weight: 2.2 }), h('span', 'celadon, glaze lilies, Frost Fortress…'), h('span.fy-sp-btn', 'Search')),
              h('div.fy-quick', [['Rite of Parting', 'fy.lantern', () => push(collectionPage('rite'))], ['Snezhnaya week', 'snowflake', () => push(collectionPage('snezh'))], ['Auctions', 'fy.gavel', () => push(collectionPage('auctions'))], ['Gifts', 'gift.fill', () => push(collectionPage('gifts'))], ['Free delivery', 'fy.truck', () => push(collectionPage('free'))]].map(([t, ic, fn]) => h('div.fy-chip', { onTap: fn }, JC.icon(ic, { size: 14 }), t)))),
            notices2(), banners(), catsGrid(), endingSoon(), recentStrip(), picks(),
          ],
        });
        pullToRefresh(pg, () => { picksOrder = U.shuffle(D().PICKS); pg.render(); JC.ui.toast('Updated your picks', { icon: 'arrow.clockwise' }); });
        on('feiyun:notices', () => { if (pg.el.isConnected) pg.setRight([chatBtn(), meBtn()]); });
        on('feiyun:chat', () => { if (pg.el.isConnected) pg.setRight([chatBtn(), meBtn()]); });
        return pg;
      }

      // ═══ SEARCH ═══
      function score(p, toks) {
        const t = p.title.toLowerCase(), g = (p.tags || '').toLowerCase(), sn = seller(p.seller).name.toLowerCase(), c = (catOf(p.cat) || {}).name || '';
        let total = 0, all = true;
        toks.forEach((k) => {
          let s = 0;
          if (t.includes(k)) s += 3;
          if (g.includes(k)) s += 2;
          if (sn.includes(k)) s += 1;
          if (c.toLowerCase().includes(k)) s += 1;
          if (!s) all = false;
          total += s;
        });
        return all ? total : total * 0.25;
      }
      function find(q) {
        const toks = q.toLowerCase().split(/[\s,]+/).filter((x) => x.length > 1 || /\d/.test(x));
        if (!toks.length) return [];
        return D().P.map((p) => ({ p, s: score(p, toks) })).filter((x) => x.s >= 1).sort((a, b) => b.s - a.s || (b.p.sold || 0) - (a.p.sold || 0)).map((x) => x.p);
      }
      const SORTS = [['best', 'Best Match'], ['ending', 'Ending Soonest'], ['low', 'Price: Lowest First'], ['high', 'Price: Highest First'], ['rating', 'Top Rated']];
      function applyFilters(list, F) {
        let out = list.filter((p) => (F.type === 'all' || (F.type === 'auction' ? isLot(p) : !isLot(p))) && (!F.free || fee(p) === 0) && (!F.cat || p.cat === F.cat) && (F.min == null || priceOf(p) >= F.min) && (F.max == null || priceOf(p) <= F.max) && (!F.open || !isLot(p) || lotOpen(p.id)));
        if (F.sort === 'low') out = out.slice().sort((a, b) => priceOf(a) - priceOf(b));
        if (F.sort === 'high') out = out.slice().sort((a, b) => priceOf(b) - priceOf(a));
        if (F.sort === 'rating') out = out.slice().sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
        if (F.sort === 'ending') out = out.slice().sort((a, b) => (isLot(b) - isLot(a)) || (isLot(a) ? lotEnd(a) - lotEnd(b) : 0));
        return out;
      }
      function filterBar(F, rerender, count) {
        const chip = (t, onv, fn, ic) => h('div.fy-fchip', { class: { on: onv }, onTap: fn }, ic ? JC.icon(ic, { size: 13 }) : null, t);
        const sortChip = h('div.fy-fchip.menu', { onTap: (e) => JC.ui.menu(e.currentTarget, SORTS.map(([k, t]) => ({ text: t, checked: F.sort === k, onTap: () => { F.sort = k; rerender(); } }))) }, JC.icon('arrow.up.arrow.down', { size: 13 }), (SORTS.find((x) => x[0] === F.sort) || SORTS[0])[1], JC.icon('chevron.down', { size: 11, weight: 2.6 }));
        return h('div.fy-fbar',
          h('div.fy-fbar-row', sortChip,
            chip('Auctions', F.type === 'auction', () => { F.type = F.type === 'auction' ? 'all' : 'auction'; rerender(); }),
            chip('Buy It Now', F.type === 'buy', () => { F.type = F.type === 'buy' ? 'all' : 'buy'; rerender(); }),
            chip('Free delivery', F.free, () => { F.free = !F.free; rerender(); }),
            chip('Filters' + (F.min != null || F.max != null || F.cat ? ' •' : ''), F.min != null || F.max != null || !!F.cat, () => filterSheet(F, rerender), 'slider.horizontal.3')),
          h('div.fy-fbar-count', h('span', U.plural(count, 'result')), h('span.fy-view', { onTap: () => { st().gridView = !st().gridView; save(); rerender(); } }, JC.icon(st().gridView ? 'list.bullet' : 'square.grid.2x2', { size: 18 }))));
      }
      function filterSheet(F, rerender) {
        const T = { min: F.min, max: F.max, cat: F.cat };
        const s = SHEET({
          title: 'Filters', detent: 'large', left: { text: 'Reset', onTap: () => { F.min = null; F.max = null; F.cat = null; F.type = 'all'; F.free = false; rerender(); } }, right: { text: 'Show results', onTap: () => { F.min = T.min; F.max = T.max; F.cat = T.cat; rerender(); } },
          content: () => [
            JC.ui.list([{ header: 'Price (ℳ)', rows: [{ custom: h('div.fy-range', JC.ui.input({ placeholder: 'Min', value: T.min != null ? String(T.min) : '', kbType: 'num', cls: 'fy-in', onInput: (v) => { T.min = v.trim() ? Number(v.replace(/[^\d]/g, '')) : null; } }), h('span', '—'), JC.ui.input({ placeholder: 'Max', value: T.max != null ? String(T.max) : '', kbType: 'num', cls: 'fy-in', onInput: (v) => { T.max = v.trim() ? Number(v.replace(/[^\d]/g, '')) : null; } })) }] },
              { header: 'Category', rows: [{ title: 'All categories', check: !T.cat, onTap: () => { T.cat = null; s.render(); } }].concat(D().CATS.filter((c) => c.id !== 'auctions').map((c) => ({ title: c.name, icon: { glyph: c.glyph, bg: c.c }, check: T.cat === c.id, onTap: () => { T.cat = c.id; s.render(); } }))) }]),
          ],
        });
      }
      function results(list, F, rerender) {
        const out = applyFilters(list, F);
        return [filterBar(F, rerender, out.length),
          out.length ? (st().gridView ? grid(out) : JC.ui.list([{ rows: out.map((p) => row(p)) }], { cls: 'fy-list' }))
            : JC.ui.empty({ icon: 'magnifyingglass', title: 'No exact matches', text: 'Try fewer filters or a different word. Popular right now: memorial lanterns, glaze lilies, Frost Fortress.' })];
      }
      function searchPage() {
        const S = { q: '', sub: '', F: { sort: 'best', type: 'all', free: false, cat: null, min: null, max: null } };
        const submit = (q) => {
          q = String(q || '').trim();
          if (!q) return;
          S.q = q; S.sub = q;
          const s = st();
          s.recent = [q].concat(s.recent.filter((x) => x.toLowerCase() !== q.toLowerCase())).slice(0, 8);
          save();
          const box = pg.searchEl && pg.searchEl.querySelector('.search');
          if (box && box.setValue) box.setValue(q);
          if (box && box.input) box.input.blur();
          pg.render();
          pg.scrollTop();
        };
        const hl = (text, q) => {
          const i = text.toLowerCase().indexOf(q.toLowerCase());
          return i < 0 ? text : [text.slice(0, i), h('b', text.slice(i, i + q.length)), text.slice(i + q.length)];
        };
        const pg = PAGE({
          title: 'Search', large: true, cls: 'fy-search',
          search: { placeholder: 'Search Feiyun Market', onInput: (v) => { S.q = v; S.sub = ''; pg.render(); }, onSubmit: (v) => submit(v), onCancel: () => { S.q = ''; S.sub = ''; pg.render(); } },
          content: (q) => {
            if (S.sub) return [h('div.fy-res-h', 'Results for “' + S.sub + '”'), results(find(S.sub), S.F, () => q.render())];
            if (S.q.trim()) {
              const v = S.q.trim().toLowerCase();
              const words = new Set();
              D().P.forEach((p) => { (p.tags + ' ' + p.short.toLowerCase()).split(/\s+/).forEach((w) => { if (w.startsWith(v) && w.length > 2) words.add(w); }); });
              D().TRENDING.concat(st().recent).forEach((t) => { if (t.toLowerCase().includes(v)) words.add(t.toLowerCase()); });
              const sugg = Array.from(words).slice(0, 6);
              const hits = find(S.q).slice(0, 4);
              const cats = D().CATS.filter((c) => c.name.toLowerCase().startsWith(v));
              return [
                JC.ui.list([{ rows: sugg.map((w) => ({ icon: { node: h('span.fy-sg-ic', JC.icon('magnifyingglass', { size: 16 })) }, title: h('span', hl(w, v)), onTap: () => submit(w), right: h('span.fy-sg-fill', { onTap: (e) => { e.stopPropagation(); const box = pg.searchEl.querySelector('.search'); box.setValue(w + ' '); S.q = w + ' '; box.input.focus(); pg.render(); } }, JC.icon('arrow.up.right', { size: 15 })) }))
                  .concat(cats.map((c) => ({ icon: { glyph: c.glyph, bg: c.c }, title: c.name, subtitle: 'Browse category', onTap: () => push(c.id === 'auctions' ? collectionPage('auctions') : categoryPage(c.id)) }))) }], { cls: 'fy-list' }),
                hits.length ? [sectionH('Listings'), JC.ui.list([{ rows: hits.map((p) => row(p)) }], { cls: 'fy-list' })] : h('div.fy-nohit', 'Press Search to look for “' + S.q.trim() + '”'),
              ];
            }
            const s = st();
            return [
              s.recent.length ? [sectionH('Recent searches', 'Clear', () => { s.recent = []; save(); q.render(); }), h('div.fy-chips', s.recent.map((r) => h('div.fy-chip.plain', { onTap: () => submit(r) }, JC.icon('clock', { size: 13 }), r)))] : null,
              sectionH('Trending in Liyue Harbor'),
              h('div.fy-trend', D().TRENDING.map((t, i) => h('div.fy-tr', { onTap: () => submit(t) }, h('span.fy-tr-n', { class: { top: i < 3 } }, String(i + 1)), h('span.fy-tr-t', t), i === 0 ? h('span.fy-hot', 'HOT') : i < 3 ? JC.icon('flame.fill', { size: 13, cls: 'fy-tr-f' }) : null))),
              sectionH('Browse categories'),
              JC.ui.list([{ rows: D().CATS.map((c) => ({ icon: { glyph: c.glyph, bg: c.c }, title: c.name, chevron: true, onTap: () => push(c.id === 'auctions' ? collectionPage('auctions') : categoryPage(c.id)) })) }], { cls: 'fy-list' }),
            ];
          },
        });
        pg.submit = submit;
        return pg;
      }

      // ═══ CATEGORY & COLLECTIONS ═══
      function categoryPage(cid) {
        const c = catOf(cid);
        const F = { sort: 'best', type: 'all', free: false, cat: null, min: null, max: null };
        const list = D().P.filter((p) => p.cat === cid);
        const pg = PAGE({
          title: c.name, large: true, cls: 'fy-catpage', noTabs: false,
          right: [JC.ui.navBtn({ icon: 'magnifyingglass', label: 'Search', onTap: () => tabs.select('search', true) })],
          content: (q) => [h('div.fy-cat-hero', { style: { '--c': c.c } }, h('div.fy-cat-ic.big', { style: { '--c': c.c } }, JC.icon(c.glyph, { size: 30 })), h('div', h('b', U.plural(list.length, 'listing')), h('span', catBlurb(cid)))), results(list, F, () => q.render())],
        });
        return pg;
      }
      function catBlurb(cid) {
        return ({ antiques: 'Porcelain, jade and curios — some with stories.', toys: 'Glacier Guardians, plush and more. Free gift wrap.', flowers: 'Glaze lilies and tributes for the Rite of Parting.', fishing: 'Rods, line and lures tested off Pier 7.', tea: 'Single-garden teas from the Jueyun foothills.', stationery: 'Pens, notebooks, postcards.', electronics: 'Chargers and cases from Fontaine.', apparel: 'Wool from the north shore.', food: 'Pelmeni, borscht and Wanmin hotpot.' })[cid] || '';
      }
      function collectionPage(key) {
        const B = bannerDefs().find((b) => b.id === key);
        const defs = {
          rite: { title: 'Rite of Parting', ids: ['rite_lanterns', 'lilies_wangsheng', 'flowers_lily6', 'coin_rite', 'tea_tin', 'stat_postcards'] },
          snezh: { title: 'Snezhnaya imports week', ids: D().P.filter((p) => p.snezh).map((p) => p.id).concat(['toy_frost_fortress']) },
          auctions: { title: 'Feiyun Auctions', ids: D().P.filter(isLot).sort((a, b) => (lotOpen(b.id) - lotOpen(a.id)) || lotEnd(a) - lotEnd(b)).map((p) => p.id) },
          gifts: { title: 'Gifts', ids: D().P.filter((p) => p.gift).map((p) => p.id) },
          free: { title: 'Free delivery', ids: D().P.filter((p) => !isLot(p) && fee(p) === 0).map((p) => p.id) },
        };
        const C = defs[key] || defs.gifts;
        const F = { sort: key === 'auctions' ? 'ending' : 'best', type: 'all', free: false, cat: null, min: null, max: null };
        const pg = PAGE({
          title: C.title, cls: 'fy-coll', navHidden: !!B, noTabs: false,
          onScroll: (y, q) => { if (B) q.navbar.classList.toggle('show-title', y > 150); },
          content: (q) => [
            B ? h('div.fy-coll-hero', { class: { dark: !!B.dark } }, JC.art.el(B.art, { cls: 'fy-fill' }), h('div.fy-bn-txt', h('span.fy-bn-k', B.kicker), h('b', B.title), h('span.fy-bn-s', B.sub), B.cd ? h('span.fy-bn-cta', 'Closes in ', cd(B.cd)) : null)) : h('div.fy-coll-plain', h('b', C.title)),
            results(C.ids.map(prod).filter(Boolean), F, () => q.render()),
          ],
        });
        return pg;
      }

      // ═══ ITEM PAGE ═══
      function carousel(p, arts, onOpen) {
        const counter = h('span.fy-car-n', '1 / ' + arts.length);
        const dots = h('div.fy-dots.dark', arts.map((a, i) => h('i', { class: { on: i === 0 } })));
        const track = h('div.fy-car-track', arts.map((a, i) => {
          const wide = JC.art.ratio(a) > 1.1;
          return h('div.fy-car-slide', { class: { wide, fresh: a === 'fy_teaset_base' }, onTap: () => onOpen(i) }, JC.art.el(a, { cls: 'fy-fill', fit: wide ? 'contain' : 'cover' }), a === 'fy_teaset_base' ? h('span.fy-tag.new', 'NEW · from the seller') : null);
        }));
        track.addEventListener('scroll', () => {
          const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          counter.textContent = (i + 1) + ' / ' + arts.length;
          Array.from(dots.children).forEach((d, k) => d.classList.toggle('on', k === i));
        }, { passive: true });
        return h('div.fy-car', track, arts.length > 1 ? dots : null, counter);
      }
      function viewer(arts, i0, onSee) {
        const layer = JC.ui.layer();
        let i = i0 || 0;
        const img = h('div.fy-vw-img');
        const cap = h('div.fy-vw-cap');
        const n = h('div.fy-vw-n');
        const paint = () => {
          img.innerHTML = '';
          img.appendChild(JC.art.el(arts[i], { cls: 'fy-fill', fit: 'contain' }));
          n.textContent = (i + 1) + ' of ' + arts.length;
          cap.textContent = arts[i] === 'fy_teaset_base' ? '“for Morax — G.” — incised under the glaze. Photo: Linlang Curios.' : JC.art.meta(arts[i]).title || '';
          if (onSee) onSee(arts[i]);
        };
        const el = h('div.fy-vw', h('div.fy-vw-top', h('div.fy-vw-x', { onTap: () => close() }, JC.icon('xmark', { size: 17, weight: 2.6 })), n, h('div.fy-vw-x', { onTap: () => share(prodByArt(arts[i])) }, JC.icon('square.and.arrow.up', { size: 17 }))), img, cap,
          arts.length > 1 ? h('div.fy-vw-nav', h('div.fy-vw-b', { onTap: () => { i = (i + arts.length - 1) % arts.length; paint(); } }, JC.icon('chevron.left', { size: 20 })), h('div.fy-vw-b', { onTap: () => { i = (i + 1) % arts.length; paint(); } }, JC.icon('chevron.right', { size: 20 }))) : null);
        U.drag(img, { axis: 'x', end: (e, p) => { if (p.dx < -50) i = (i + 1) % arts.length; else if (p.dx > 50) i = (i + arts.length - 1) % arts.length; else return; paint(); } });
        U.drag(el, { axis: 'y', end: (e, p) => { if (p.dy > 90) close(); } });
        function close() { U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => el.remove()); }
        layer.appendChild(el);
        U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
        paint();
      }
      const prodByArt = (a) => D().P.find((p) => p.art.includes(a)) || prod('lot_teaset');
      function deliveryCard(p, onChange) {
        const to = p.fixedTo || (isLot(p) ? lotSt(p.id).to : st().addr);
        const a = addr(to);
        const eta = schedule(isLot(p) ? Math.max(now(), lotEnd(p)) : now(), p.ship, to)[3];
        const frozen = JC.bank.frozen();
        return h('div.fy-box',
          h('div.fy-drow', { class: { tap: !p.fixedTo }, onTap: () => { if (p.fixedTo) { JC.ui.toast('Tribute bouquets go to the parlor only', { icon: 'lock.fill' }); return; } addressPicker(to, (id) => { if (isLot(p)) lotSt(p.id).to = id; else st().addr = id; save(); onChange(); }); } },
            JC.icon(p.fixedTo ? 'lock.fill' : 'mappin.fill', { size: 16 }), h('div.fy-drow-m', h('b', 'Deliver to ' + a.label), h('span', a.name + (a.line ? ' · ' + a.line : ''))), p.fixedTo ? null : JC.icon('chevron.right', { size: 13, weight: 2.6 })),
          h('div.fy-drow', JC.icon('fy.truck', { size: 16 }), h('div.fy-drow-m', h('b', (isLot(p) ? 'If you win, arrives ' : 'Arrives ') + arrive(eta)), h('span', D().SHIP[p.ship].label + ' · ' + (fee(p) ? money(fee(p)) + ' delivery' : 'Free delivery')))),
          h('div.fy-drow', JC.icon('checkmark.circle.fill', { size: 16 }), h('div.fy-drow-m', h('b', isLot(p) ? 'No returns · Feiyun Buyer Protection' : 'Free returns within 7 days'), h('span', isLot(p) ? 'Covered if it doesn’t arrive or isn’t as described.' : 'Unopened items, collected from your door.'))),
          h('div.fy-drow', { class: { bad: frozen } }, JC.icon('creditcard.fill', { size: 16 }), h('div.fy-drow-m', h('b', 'Northland Black •••• 1111'), h('span', frozen ? 'Card frozen — payments will be declined' : isLot(p) ? 'Charged automatically if you win' : 'Pay with Face ID'))));
      }
      function sellerCard(sid) {
        const s = seller(sid);
        const fol = st().follow.includes(sid);
        return h('div.fy-box.fy-seller',
          h('div.fy-seller-top', { onTap: () => push(sellerPage(sid)) }, logo(sid, 46), h('div.fy-seller-m', h('b', s.name, s.official ? h('span.fy-off', 'Official') : null), h('span', s.pos + '% positive · ' + fmtK(s.ratings) + ' ratings · ' + s.loc)), JC.icon('chevron.right', { size: 13, weight: 2.6 })),
          h('div.fy-seller-btns',
            JC.ui.btn({ text: 'Contact seller', icon: 'message', kind: 'gray', size: 's', onTap: () => push(chatPage(chatFor(sid).id)) }),
            JC.ui.btn({ text: fol ? 'Following' : 'Follow', icon: fol ? 'checkmark' : 'plus', kind: fol ? 'gray' : 'tinted', size: 's', onTap: () => { toggleFollow(sid); const top = tabs.nav().top(); if (top) top.render(); } }),
            JC.ui.btn({ text: 'Store', icon: 'fy.store', kind: 'gray', size: 's', onTap: () => push(sellerPage(sid)) })));
      }
      function toggleFollow(sid) {
        const s = st();
        if (s.follow.includes(sid)) s.follow = s.follow.filter((x) => x !== sid);
        else { s.follow.push(sid); JC.ui.toast('Following ' + seller(sid).name, { icon: 'checkmark' }); }
        save();
      }
      function reviewEl(r) {
        const [n, by, ago, text, variant] = r;
        return h('div.fy-rev', h('div.fy-rev-h', h('span.fy-rev-av', by[0].toUpperCase()), h('b', by), stars(n, 11), h('span.fy-rev-t', U.fmtDate(now() - ago * 86400e3, 'medium'))), variant ? h('div.fy-rev-v', 'Variant: ' + variant) : null, h('div.fy-rev-x', text));
      }
      function qaEl(q) { return h('div.fy-qa', h('div', h('span.fy-qa-q', 'Q'), q[0]), h('div', h('span.fy-qa-a', 'A'), q[1], h('span.fy-qa-t', ' · seller, ' + q[2] + 'd ago'))); }

      function itemPage(id) {
        const p = prod(id);
        const isA = isLot(p);
        const s = st();
        s.viewed = [id].concat(s.viewed.filter((x) => x !== id)).slice(0, 20);
        save();
        act('item_view', { id });
        let opt = p.opts ? p.opts.list[0] : '';
        let qty = 1;
        let sawBase = isA && lotSt(id).result === 'won';
        const bar = h('div.fy-bar');
        const arts = () => p.art.concat(id === 'lot_teaset' && lotSt(id).result === 'won' ? ['fy_teaset_base'] : []);
        const seeBase = () => { if (sawBase) return; sawBase = true; lotSt(id).seenBase = true; save(); act('item_view', { id, photo: 'base' }); };
        const pg = PAGE({
          title: p.short, cls: 'fy-item', noTabs: true, navHidden: true, footer: bar,
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share', onTap: () => share(p) }), cartNav()],
          onScroll: (y, q) => q.navbar.classList.toggle('show-title', y > 330),
          onShow: (q) => { q.render(); fillBar(); },
          content: (q) => {
            const S = isA ? lotSt(id) : null;
            const won = S && S.result === 'won';
            if (won && id === 'lot_teaset' && !sawBase) { sawBase = true; S.seenBase = true; save(); setTimeout(() => act('item_view', { id }), 0); }
            return [
              carousel(p, arts(), (i) => viewer(arts(), i, (a) => { if (a === 'fy_teaset_base') seeBase(); })),
              h('div.fy-info',
                isA ? auctionHead(p, S) : buyHead(p),
                h('div.fy-title', p.title),
                isA ? h('div.fy-meta', h('span', p.cond), ' · ', h('span', p.lot.watchers + st().watch.includes(id) * 1 + ' watching'), ' · ', h('span', 'Lot ' + p.lot.no))
                  : h('div.fy-meta.tap', { onTap: () => push(reviewsPage(id)) }, stars(p.rating, 12), h('b', ' ' + p.rating.toFixed(1)), ' (' + fmtK(p.nrev) + ') · ' + fmtK(p.sold) + ' sold · ' + p.cond, JC.icon('chevron.right', { size: 11, weight: 2.6 })),
                p.snezh ? h('div.fy-promo', JC.icon('snowflake', { size: 13 }), 'Snezhnaya imports week · free delivery from the north') : null,
                id === 'lilies_wangsheng' ? h('div.fy-promo.rite', JC.icon('fy.lantern', { size: 13 }), 'For the Rite of Parting · delivered to Wangsheng every morning from 06:30') : null),
              won && id === 'lot_teaset' ? baseMark() : null,
              p.opts ? h('div.fy-box', h('div.fy-box-h', p.opts.name), h('div.fy-opts', p.opts.list.map((o) => h('div.fy-opt', { class: { on: o === opt }, onTap: () => { opt = o; q.render(); } }, o)))) : null,
              deliveryCard(p, () => q.render()),
              sellerCard(p.seller),
              isA ? h('div.fy-box', h('div.fy-box-h.tap', { onTap: () => push(historyPage(id)) }, h('span', 'Bid history'), h('span.fy-box-more', bidCount(id) + ' bids · ' + bidders(id) + ' bidders', JC.icon('chevron.right', { size: 12, weight: 2.6 }))),
                lotSt(id).hist.slice(-3).reverse().map((b) => histRow(id, b)))
                : h('div.fy-box', h('div.fy-box-h.tap', { onTap: () => push(reviewsPage(id)) }, h('span', 'Reviews (' + fmtK(p.nrev) + ')'), h('span.fy-box-more', 'See all', JC.icon('chevron.right', { size: 12, weight: 2.6 }))), (p.reviews || []).slice(0, 2).map(reviewEl)),
              h('div.fy-box', h('div.fy-box-h.tap', { onTap: () => push(qaPage(id)) }, h('span', 'Questions & answers'), h('span.fy-box-more', (p.qa || []).length ? (p.qa.length + ' answered') : 'Ask', JC.icon('chevron.right', { size: 12, weight: 2.6 }))),
                (p.qa || []).slice(0, 2).map(qaEl), h('div.fy-ask', { onTap: () => askSeller(p) }, JC.icon('message', { size: 15 }), 'Ask the seller a question')),
              h('div.fy-box', h('div.fy-box-h', 'About this item'), h('div.fy-specs', p.specs.map(([k, v]) => h('div.fy-spec', h('span', k), h('b', v)))), h('div.fy-desc', p.desc.map((t) => h('p', t)))),
              similar(p),
            ];
          },
        });
        function cartNav() {
          const n = st().cart.reduce((a, b) => a + b.qty, 0);
          return JC.ui.navBtn({ icon: 'cart.fill', label: 'Cart', badge: n || null, onTap: () => { tabs.select('cart', true); } });
        }
        function baseMark() {
          return h('div.fy-box.fy-basemark',
            h('div.fy-box-h', h('span', 'From the seller · base of the teapot'), h('span.fy-tag.new.inline', 'Winner only')),
            h('div.fy-bm-img', { onTap: () => { const a = arts(); viewer(a, a.indexOf('fy_teaset_base'), (x) => { if (x === 'fy_teaset_base') seeBase(); }); } }, JC.art.el('fy_teaset_base', { cls: 'fy-fill' })),
            h('div.fy-bm-cap', '“for Morax — G.”'),
            h('div.fy-bm-note', 'Photographed for the winning bidder, as promised. The mark is incised under the glaze, so it is as old as the pot. — Linlang'));
        }
        function auctionHead(p, S) {
          const open = lotOpen(id);
          let banner = null;
          if (S.result === 'won') banner = h('div.fy-status.good', JC.icon('checkmark.circle.fill', { size: 18 }), h('div', h('b', 'You won this item'), h('span', 'Paid ' + money(S.finalPrice) + ' · Northland Black ••1111')), h('span.fy-status-btn', { onTap: () => openOrder('fo_' + id) }, 'Order'));
          else if (S.result === 'failed') banner = h('div.fy-status.bad', JC.icon('exclamationmark.circle.fill', { size: 18 }), h('div', h('b', 'Payment failed — lot lost'), h('span', 'Sold to ' + S.winner + ' for ' + money(S.finalPrice))));
          else if (S.closed) banner = h('div.fy-status', { class: { bad: S.myMax > 0 } }, JC.icon('fy.gavel', { size: 18 }), h('div', h('b', S.myMax ? 'You were outbid' : 'Bidding ended'), h('span', 'Sold for ' + money(S.finalPrice || S.price) + ' to ' + (S.winner || S.leader))));
          else if (S.leader === 'me') banner = h('div.fy-status.good', JC.icon('checkmark.circle.fill', { size: 18 }), h('div', h('b', 'You’re the highest bidder'), h('span', 'Your max bid: ' + money(S.myMax) + ' · kept private')));
          else if (S.myMax) banner = h('div.fy-status.bad', JC.icon('exclamationmark.circle.fill', { size: 18 }), h('div', h('b', 'You’ve been outbid'), h('span', 'Another bidder’s maximum is higher. Bid ' + money(minBid(id)) + ' or more.')), h('span.fy-status-btn', { onTap: () => bidSheet(id) }, 'Bid'));
          return [banner,
            h('div.fy-ahead',
              h('div', h('span.fy-lbl', open ? 'Current bid' : 'Winning bid'), priceEl(S.closed ? (S.finalPrice || S.price) : S.price, 'big'), h('span.fy-bids.tap', { onTap: () => push(historyPage(id)) }, bidCount(id) + ' bids')),
              h('div.fy-ends', h('span.fy-lbl', open ? 'Ends in' : 'Ended'), open ? cd(lotEnd(p), null, 'big') : h('span.fy-cd.big.ended', whenShort(lotEnd(p))), h('span.fy-ends-at', whenShort(lotEnd(p))))),
            h('div.fy-ainfo', 'Starting bid ' + money(p.lot.start) + ' · increment ' + money(p.lot.inc) + ' · hard close, no extensions')];
        }
        function buyHead(p) {
          const pct = p.was ? Math.round((1 - p.price / p.was) * 100) : 0;
          return h('div.fy-bhead', priceEl(p.price, 'big'), p.was ? [h('s.fy-was', money(p.was)), h('span.fy-tag.deal.inline', '−' + pct + '%')] : null, h('span.fy-bh-r', fmtK(p.sold) + ' sold'));
        }
        function fillBar() {
          bar.innerHTML = '';
          const icb = (ic, t, fn, cls) => h('div.fy-bar-ic', { class: cls, onTap: fn }, JC.icon(ic, { size: 21 }), h('span', t));
          const wbtn = icb(watched(id) ? 'heart.fill' : 'heart', watched(id) ? 'Watching' : 'Watch', () => { toggleWatch(id); fillBar(); }, { on: watched(id) });
          if (!isA) {
            bar.append(icb('fy.store', 'Store', () => push(sellerPage(p.seller))), icb('message', 'Chat', () => push(chatPage(chatFor(p.seller, id).id))), wbtn,
              h('div.fy-bar-btns', h('div.fy-bbtn.cart', { onTap: () => addToCart(id, qty, opt) }, 'Add to cart'), h('div.fy-bbtn.buy', { onTap: () => checkout([{ id, qty, opt }], { fromItem: true }) }, 'Buy now')));
            return;
          }
          const S = lotSt(id);
          if (lotOpen(id)) bar.append(wbtn, h('div.fy-bar-btns', h('div.fy-bbtn.buy.wide', { onTap: () => bidSheet(id) }, h('b', S.leader === 'me' ? 'Raise max bid' : 'Place bid'), h('small', S.leader === 'me' ? 'You’re winning at ' + money(S.price) : 'Bid ' + money(minBid(id)) + ' or more'))));
          else if (S.result === 'won') bar.append(wbtn, h('div.fy-bar-btns', h('div.fy-bbtn.cart.wide', { onTap: () => openOrder('fo_' + id) }, h('b', 'Track your order'), h('small', 'Paid ' + money(S.finalPrice)))));
          else bar.append(wbtn, h('div.fy-bar-btns', h('div.fy-bbtn.off.wide', { onTap: () => push(collectionPage('auctions')) }, h('b', 'Bidding ended'), h('small', 'See other lots'))));
        }
        fillBar();
        on('feiyun:lot', (e) => { if (e.id === id && pg.el.isConnected) { pg.render(); fillBar(); } });
        on('feiyun:cart', () => { if (pg.el.isConnected) pg.setRight([JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share', onTap: () => share(p) }), cartNav()]); });
        on('feiyun:watch', (e) => { if (e.id === id && pg.el.isConnected) fillBar(); });
        on('bank', () => { if (pg.el.isConnected) pg.render(); });
        return pg;
      }
      function similar(p) {
        const list = D().P.filter((x) => x.id !== p.id && (x.cat === p.cat || x.seller === p.seller)).slice(0, 4);
        if (list.length < 2) return null;
        return [sectionH('Similar items'), grid(list)];
      }
      function histRow(id, b) {
        const me = b.who === 'me';
        const sc = !me && scoreOf(id, b.who);
        return h('div.fy-hrow', { class: { auto: b.auto, me } }, h('div.fy-hrow-who', h('span', me ? 'You' : b.who), (sc || b.auto) ? h('small', [sc ? fmtK(sc) + ' feedback' : '', sc && b.auto ? ' · ' : '', b.auto ? 'automatic bid' : ''].join('')) : null), h('b', money(b.amt)), h('span.fy-hrow-t', whenShort(b.t)));
      }
      function historyPage(id) {
        const p = prod(id);
        const pg = PAGE({
          title: 'Bid history', cls: 'fy-hist', noTabs: true,
          content: () => {
            const S = lotSt(id);
            return [h('div.fy-box', h('div.fy-hsum', h('div', h('b', String(bidCount(id))), h('span', 'bids')), h('div', h('b', String(bidders(id))), h('span', 'bidders')), h('div', lotOpen(id) ? cd(lotEnd(p)) : h('b', 'Ended'), h('span', whenShort(lotEnd(p))))),
              h('div.fy-hnote', 'Feiyun bids automatically for each bidder, just enough to keep them in the lead, up to their private maximum. Automatic bids are shown in grey. If two maximums are equal, the earlier bid wins.')),
            h('div.fy-box', S.hist.slice().reverse().map((b) => histRow(id, b)), h('div.fy-hrow.start', h('span.fy-hrow-who', 'Starting price'), h('b', money(p.lot.start)), h('span.fy-hrow-t', whenShort(S.hist[0].t))))];
          },
        });
        on('feiyun:lot', (e) => { if (e.id === id && pg.el.isConnected) pg.render(); });
        return pg;
      }
      function reviewsPage(id) {
        const p = prod(id);
        const dist = [0.86, 0.09, 0.03, 0.01, 0.01].map((x, i) => (p.rating >= 4.9 ? x : [0.74, 0.17, 0.05, 0.02, 0.02][i]));
        return PAGE({
          title: 'Reviews', cls: 'fy-reviews', noTabs: true,
          content: () => [h('div.fy-box.fy-rsum', h('div.fy-rsum-l', h('b', p.rating.toFixed(1)), stars(p.rating, 14), h('span', fmtK(p.nrev) + ' ratings')),
            h('div.fy-rsum-r', dist.map((x, i) => h('div.fy-rbar', h('span', String(5 - i)), h('i', h('em', { style: { width: Math.round(x * 100) + '%' } })))))),
          h('div.fy-box', (p.reviews || []).map(reviewEl), h('div.fy-more-note', 'Showing the most helpful reviews · ' + fmtK(p.nrev - (p.reviews || []).length) + ' more ratings without text'))],
        });
      }
      function qaPage(id) {
        const p = prod(id);
        return PAGE({
          title: 'Questions & answers', cls: 'fy-qapage', noTabs: true,
          content: () => [h('div.fy-box', (p.qa || []).length ? p.qa.map(qaEl) : h('div.fy-more-note', 'No questions yet.')), h('div.fy-pad', JC.ui.btn({ text: 'Ask the seller', icon: 'message', kind: 'filled', size: 'l', onTap: () => askSeller(p) }))],
        });
      }
      function askSeller(p) {
        const c = chatFor(p.seller, p.id);
        c.product = p.id;
        save();
        push(chatPage(c.id));
      }
      function sellerPage(sid) {
        const s = seller(sid);
        let seg = 0;
        const list = D().P.filter((p) => p.seller === sid);
        const pg = PAGE({
          title: s.name, cls: 'fy-store', noTabs: true,
          right: [JC.ui.navBtn({ icon: 'message', label: 'Contact', onTap: () => push(chatPage(chatFor(sid).id)) })],
          content: (q) => {
            const fol = st().follow.includes(sid);
            return [h('div.fy-store-hero', { style: { background: 'linear-gradient(135deg,' + s.bg[0] + ',' + s.bg[1] + ')' } },
              h('div.fy-store-row', logo(sid, 60), h('div', h('b', s.name), h('span', '@' + s.handle + ' · ' + s.loc), h('span', s.pos + '% positive · ' + s.followers + ' followers'))),
              h('div.fy-store-btns', h('div.fy-store-btn', { class: { on: fol }, onTap: () => { toggleFollow(sid); q.render(); } }, JC.icon(fol ? 'checkmark' : 'plus', { size: 14, weight: 2.6 }), fol ? 'Following' : 'Follow'), h('div.fy-store-btn', { onTap: () => push(chatPage(chatFor(sid).id)) }, JC.icon('message', { size: 14 }), 'Message'))),
            h('div.fy-pad', JC.ui.segmented({ items: ['Items (' + list.length + ')', 'About'], value: seg, onChange: (i) => { seg = i; q.render(); } })),
            seg === 0 ? (list.length ? grid(list) : JC.ui.empty({ icon: 'fy.store', title: 'No listings right now' }))
              : JC.ui.list([{ rows: [{ title: 'About', subtitle: s.about, clamp: false }, { title: 'Location', detail: s.loc }, { title: 'Member since', detail: String(s.since) }, { title: 'Positive feedback', detail: s.pos + '%' }, { title: 'Ratings', detail: fmtK(s.ratings) }, { title: 'Response time', detail: s.reply.replace('Usually replies ', '') }] }], { cls: 'fy-list' })];
          },
        });
        return pg;
      }

      // ═══ BID SHEET ═══
      function bidSheet(id) {
        const p = prod(id);
        if (!lotOpen(id)) { JC.ui.toast('Bidding has ended', { icon: 'fy.gavel' }); return; }
        if (st().out) { signInFirst(); return; }
        const V = { step: 'pick', amount: 0, typed: '', res: null };
        const sheet = SHEET({
          title: 'Place a bid', detent: 'large', cls: 'fy-bidsheet', left: { text: 'Cancel' },
          content: (sh) => {
            const S = lotSt(id);
            const head = h('div.fy-bs-head', h('div.fy-thumb.lg', JC.art.el(p.art[0], { cls: 'fy-fill' })), h('div', h('b', p.short), h('span', 'Current bid ' + money(S.price) + ' · ' + bidCount(id) + ' bids'), h('span.fy-bs-cd', JC.icon('fy.timer', { size: 13 }), lotOpen(id) ? cd(lotEnd(p)) : 'Ended', ' · ends ' + whenShort(lotEnd(p)))));
            if (!lotOpen(id)) return [head, JC.ui.empty({ icon: 'fy.gavel', title: 'Bidding has ended', text: 'This lot closed at ' + whenShort(lotEnd(p)) + '.' })];
            if (V.step === 'placing') return [head, h('div.fy-bs-wait', h('div.fy-spin'), h('b', 'Placing your bid…'))];
            if (V.step === 'result') {
              const r = V.res;
              if (!r.ok) return [head, h('div.fy-bs-res.bad', JC.icon('exclamationmark.circle.fill', { size: 48 }), h('b', r.reason === 'ended' ? 'Bidding has ended' : 'Bid too low'), h('span', r.reason === 'ended' ? 'Your bid arrived after the lot closed.' : 'Enter ' + money(r.min) + ' or more.')), JC.ui.btn({ text: 'OK', kind: 'gray', size: 'l', onTap: () => sh.close() })];
              if (r.leading) return [head, h('div.fy-bs-res.good', JC.icon('checkmark.circle.fill', { size: 52 }), h('b', r.raised ? 'Maximum bid raised' : 'You’re the highest bidder'), h('span', 'Current bid ' + money(S.price) + ' · your max ' + money(S.myMax) + '. We’ll bid for you up to your max and tell you if you’re outbid.')),
                h('div.fy-bs-tip', JC.icon('creditcard.fill', { size: 15 }), 'If you win, ' + money(S.price) + ' or more is charged to Northland Black ••1111 at ' + whenShort(lotEnd(p)) + '.'),
                JC.ui.btn({ text: 'Done', kind: 'filled', size: 'l', onTap: () => sh.close() })];
              return [head, h('div.fy-bs-res.bad', JC.icon('exclamationmark.circle.fill', { size: 52 }), h('b', 'You’ve been outbid'), h('span', S.leader + ' had a higher maximum, so an automatic bid was placed for them. Current bid ' + money(S.price) + '.')),
                h('div.fy-bs-btns', JC.ui.btn({ text: 'Bid ' + money(minBid(id)), kind: 'filled', size: 'l', onTap: () => { V.step = 'pick'; V.typed = ''; sh.render(); } }), JC.ui.btn({ text: 'Not now', kind: 'gray', size: 'l', onTap: () => sh.close() }))];
            }
            const min = S.leader === 'me' ? S.myMax + p.lot.inc : minBid(id);
            if (V.step === 'confirm') {
              const bal = JC.bank.balance(), frozen = JC.bank.frozen();
              return [head,
                h('div.fy-bs-conf', h('span', 'Your maximum bid'), priceEl(V.amount, 'big'), h('small', 'Feiyun will bid for you only as much as needed to keep you in the lead.')),
                frozen ? h('div.fy-warn', JC.icon('snowflake', { size: 15 }), 'Your card is frozen. If it’s still frozen when the lot closes, the payment will fail and the lot goes to the runner-up.') : V.amount > bal ? h('div.fy-warn', JC.icon('exclamationmark.triangle.fill', { size: 15 }), 'Your balance is ' + money(bal) + '. If it’s lower than the winning price at close, the payment will fail.') : null,
                JC.ui.list([{ rows: [
                  { title: 'Deliver to', detail: addr(S.to).label, chevron: true, onTap: () => addressPicker(S.to, (to) => { S.to = to; save(); sh.render(); }) },
                  { title: 'Pay with', detail: 'Northland Black ••1111' },
                  { title: 'Delivery', detail: 'Free, insured' },
                ] }], { cls: 'fy-list tight' }),
                h('div.fy-bs-legal', 'By confirming, you commit to buy this item if you’re the winning bidder. The winning price is charged automatically when bidding ends at ' + whenShort(lotEnd(p)) + '.'),
                h('div.fy-bs-btns', JC.ui.btn({ text: 'Confirm bid', kind: 'filled', size: 'l', onTap: () => confirmBid(sh) }), JC.ui.btn({ text: 'Back', kind: 'gray', size: 'l', onTap: () => { V.step = 'pick'; sh.render(); } }))];
            }
            const sugg = Array.from(new Set([min, min + p.lot.inc * 2, Math.max(min, Math.ceil((min + 1) / 1000) * 1000)])).sort((a, b) => a - b);
            const field = JC.ui.input({ placeholder: money(min) + ' or more', value: V.typed, kbType: 'num', enterkey: 'done', cls: 'fy-bid-in', onInput: (v) => { V.typed = v; const n = Number(String(v).replace(/[^\d]/g, '')); go.disabled = !(n >= min); go.classList.toggle('dis', !(n >= min)); }, onSubmit: () => go.click() });
            const go = h('div.fy-bid-go', { class: { dis: !(Number(V.typed) >= min) }, onTap: () => { const n = Number(String(V.typed).replace(/[^\d]/g, '')); if (!(n >= min)) { JC.audio.play('error'); JC.ui.toast('Enter ' + money(min) + ' or more', { icon: 'exclamationmark.circle.fill' }); return; } V.amount = n; V.step = 'confirm'; sh.render(); } }, 'Review');
            return [head,
              S.leader === 'me' ? h('div.fy-bs-note.good', JC.icon('checkmark.circle.fill', { size: 15 }), 'You’re winning. Your max is ' + money(S.myMax) + ' — raise it to stay ahead.') : S.myMax ? h('div.fy-bs-note.bad', JC.icon('exclamationmark.circle.fill', { size: 15 }), 'You’ve been outbid.') : null,
              h('div.fy-bs-lbl', S.leader === 'me' ? 'Raise your maximum' : 'Quick bids'),
              h('div.fy-qbids', sugg.map((n) => h('div.fy-qbid', { onTap: () => { V.amount = n; V.step = 'confirm'; sh.render(); } }, h('b', 'Bid ' + money(n)), h('span', n === min ? 'Minimum' : n % 1000 === 0 ? 'Round number' : '+' + money(n - min))))),
              h('div.fy-bs-lbl', 'Or set your max bid'),
              h('div.fy-bid-row', h('span.fy-bid-cur', 'ℳ'), field, go),
              h('div.fy-bs-tip', JC.icon('info.circle', { size: 15 }), 'Your max bid stays private. Increment ' + money(p.lot.inc) + '. Bidding closes at ' + whenShort(lotEnd(p)) + ' sharp.')];
          },
        });
        const offT = JC.bus.on('feiyun:lot', (e) => { if (e.id === id && !sheet.closed && V.step === 'pick' && !(document.activeElement && document.activeElement.classList.contains('fy-bid-in'))) sheet.render(); });
        const offC = JC.bus.on('tick', () => { if (sheet.closed) { offT(); offC(); return; } if (!lotOpen(id) && !sheet._ended) { sheet._ended = true; sheet.render(); } });
        function confirmBid(sh) {
          V.step = 'placing';
          sh.render();
          setTimeout(() => {
            const r = placeBid(id, 'me', V.amount);
            V.res = r; V.step = 'result';
            if (r.ok) act('bid', { id, amount: V.amount, price: lotSt(id).price, leading: !!r.leading });
            if (r.ok && r.leading) { JC.audio.play('success'); JC.audio.haptic(20); }
            else { JC.audio.play('error'); JC.audio.haptic(30); }
            if (r.ok && !r.leading) {
              const S = lotSt(id);
              notice({ title: 'You’ve been outbid', body: p.short + ' — an automatic bid by ' + S.leader + ' raised the price to ' + money(S.price) + '.', art: p.art[0], target: { id } }, { push: st().prefs.outbid });
            }
            if (!sh.closed) sh.render();
          }, 1100);
        }
      }

      // ═══ CHECKOUT ═══
      function addressPicker(cur, onPick, o) {
        o = o || {};
        const s = SHEET({
          title: 'Deliver to', detent: 'large', left: { text: 'Close' },
          content: (sh) => {
            const sel = (a) => ({ leading: h('div.fy-addr-ic', JC.icon(a.icon, { size: 17 })), title: a.label, subtitle: a.name + (a.line ? ' · ' + a.line : ''), subtitle2: a.far ? 'Countryside · next-day delivery' : null, check: a.id === cur, onTap: () => { cur = a.id; onPick(a.id); sh.close(); } });
            const list = addrList();
            return [JC.ui.list([
              { header: 'Saved addresses', rows: list.filter((a) => a.saved || st().extra.some((x) => x.id === a.id)).map(sel) },
              { header: 'Hotels & pickup points', footer: 'Parcels are held at the front desk or parcel counter for 7 days.', rows: list.filter((a) => a.point).map(sel) },
              { rows: [{ icon: { glyph: 'plus', bg: TINT }, title: 'Add a new address', onTap: () => newAddress(() => sh.render()) }] },
            ], { cls: 'fy-list' })];
          },
        });
        return s;
      }
      function newAddress(done) {
        JC.ui.actionSheet({
          title: 'Add an address', message: 'Suggestions near you',
          actions: [
            { text: 'Chihu Rock, Lane 3', onTap: () => { const s = st(); if (!s.extra.some((x) => x.id === 'player-home')) s.extra.push({ id: 'player-home', label: 'Chihu Rock, Lane 3', name: 'Resident', line: 'Chihu Rock, Lane 3', city: 'Liyue Harbor', icon: 'mappin.fill', saved: true }); save(); JC.ui.toast('Address saved', { icon: 'checkmark' }); done && done(); } },
            { text: 'Enter address manually…', onTap: () => JC.ui.alert({ title: 'Delivery outside Liyue Harbor', message: 'Feiyun Swift only delivers to verified addresses. Use one of the suggestions or a pickup point.', buttons: [{ text: 'OK' }] }) },
          ],
        });
      }
      /** lines: [{ id, qty, opt }] */
      function checkout(lines, o) {
        o = o || {};
        if (st().out) { signInFirst(); return; }
        lines = lines.filter((l) => prod(l.id));
        if (!lines.length) return;
        const C = { to: (lines.map((l) => prod(l.id).fixedTo).find(Boolean)) || st().addr, gift: lines.some((l) => prod(l.id).card), note: '', hide: true, busy: false, done: null };
        const fixed = lines.map((l) => prod(l.id).fixedTo).find(Boolean);
        const sheet = SHEET({
          title: 'Checkout', detent: 'large', cls: 'fy-checkout', left: { text: 'Cancel' },
          content: (sh) => {
            if (C.done) return doneView(sh);
            const a = addr(C.to);
            const groups = {};
            lines.forEach((l) => { const p = prod(l.id); (groups[p.seller] = groups[p.seller] || []).push(l); });
            const sub = lines.reduce((x, l) => x + prod(l.id).price * l.qty, 0);
            const ship = Object.keys(groups).reduce((x, sid) => x + Math.max(...groups[sid].map((l) => fee(prod(l.id)))), 0);
            const total = sub + ship;
            const frozen = JC.bank.frozen();
            const noteBox = JC.ui.input({ placeholder: lines.some((l) => l.id === 'lilies_wangsheng') ? 'Card message, e.g. “For the Rite. — C.”' : 'Gift note (printed on a card)', value: C.note, multiline: true, rows: 3, max: 200, cls: 'fy-note-in', onInput: (v) => { C.note = v; cnt.textContent = v.length + ' / 200'; } });
            const cnt = h('span.fy-note-cnt', C.note.length + ' / 200');
            return [
              h('div.fy-co-sec', h('div.fy-co-h', 'Delivery address'),
                h('div.fy-co-addr', { class: { tap: !fixed }, onTap: () => { if (fixed) { JC.ui.toast('This item is delivered to ' + addr(fixed).label + ' only', { icon: 'lock.fill' }); return; } addressPicker(C.to, (id) => { C.to = id; st().addr = id; save(); sh.render(); }); } },
                  h('div.fy-addr-ic.big', JC.icon(fixed ? 'lock.fill' : a.icon, { size: 19 })), h('div.fy-co-addr-m', h('b', a.label), h('span', a.name), h('span', a.line + (a.city ? ', ' + a.city : ''))), fixed ? null : JC.icon('chevron.right', { size: 13, weight: 2.6 })),
                fixed ? h('div.fy-co-foot', 'Tribute bouquets are delivered straight to the parlor for the Rite of Parting.') : null),
              Object.keys(groups).map((sid) => {
                const eta = Math.max(...groups[sid].map((l) => schedule(now(), prod(l.id).ship, C.to)[3]));
                return h('div.fy-co-sec', h('div.fy-co-h', logo(sid, 22), seller(sid).name),
                  groups[sid].map((l) => {
                    const p = prod(l.id);
                    return h('div.fy-co-item', h('div.fy-thumb', JC.art.el(p.art[0], { cls: 'fy-fill' })), h('div.fy-co-item-m', h('b', p.title), l.opt ? h('span', l.opt) : null, h('div.fy-co-q', priceEl(p.price, 'sm'),
                      p.fixedTo || p.kind === 'auction' ? h('span.fy-qty', '× ' + l.qty) : h('div.fy-qstep', h('span', { onTap: () => { if (l.qty > 1) { l.qty--; sh.render(); } } }, '−'), h('b', String(l.qty)), h('span', { onTap: () => { if (l.qty < 9) { l.qty++; sh.render(); } } }, '+')))));
                  }),
                  h('div.fy-co-eta', JC.icon('fy.truck', { size: 14 }), 'Arrives ' + arrive(eta) + ' · ' + D().SHIP[prod(groups[sid][0].id).ship].courier));
              }),
              h('div.fy-co-sec', h('div.fy-co-h', 'Gift options'),
                JC.ui.list([{ rows: [{ title: 'This is a gift', subtitle: 'Add a card · hide prices on the packing slip', toggle: { on: C.gift, onChange: (v) => { C.gift = v; sh.render(); } } }] }], { cls: 'fy-list tight' }),
                C.gift ? h('div.fy-note', noteBox, cnt) : null),
              h('div.fy-co-sec', h('div.fy-co-h', 'Payment'),
                h('div.fy-co-pay', { class: { bad: frozen }, onTap: () => payInfo() }, h('div.fy-cardmini', 'NB'), h('div.fy-co-addr-m', h('b', 'Northland Black •••• 1111'), h('span', frozen ? 'Frozen — unfreeze it in the Northland app' : 'Available ' + money(JC.bank.balance()))), JC.icon('chevron.right', { size: 13, weight: 2.6 }))),
              h('div.fy-co-sec', h('div.fy-sum', h('span', 'Items (' + lines.reduce((x, l) => x + l.qty, 0) + ')'), h('b', money(sub))), h('div.fy-sum', h('span', 'Delivery'), h('b', ship ? money(ship) : 'Free')), h('div.fy-sum', h('span', 'Feiyun points earned'), h('b', '+' + Math.floor(total / 10))), h('div.fy-sum.tot', h('span', 'Total'), priceEl(total, 'big'))),
              h('div.fy-co-legal', 'By placing your order you agree to Feiyun Market’s terms. Sold by the sellers shown; Feiyun Commerce Guild Buyer Protection applies.'),
              h('div.fy-co-bar', h('div', h('span', 'Total'), priceEl(total)), h('div.fy-bbtn.buy', { class: { off: C.busy }, onTap: () => pay(sh, total, ship, groups) }, C.busy ? 'Processing…' : 'Pay ' + money(total))),
            ];
          },
        });
        function payInfo() {
          JC.ui.actionSheet({ title: 'Payment method', message: 'Northland Black •••• 1111 is the only card on this account. Northland Bank Group devices can’t add outside cards.', actions: [{ text: 'Open Northland', onTap: () => JC.os.open('northland') }] });
        }
        function pay(sh, total, ship, groups) {
          if (C.busy) return;
          C.busy = true;
          sh.render();
          const a = addr(C.to);
          const declined = (reason) => JC.ui.alert({ title: reason === 'frozen' ? 'Card Frozen' : 'Payment Declined', message: JC.bank.reasonText(reason) + ' Your order wasn’t placed.', buttons: [{ text: 'OK' }] });
          const card = JC.bank.mainCard();
          const conf = JC.wallet && JC.wallet.pay
            ? JC.wallet.pay({ merchant: 'Feiyun Market', sub: lines.length === 1 ? prod(lines[0].id).short : lines.length + ' items', amount: total, card, cat: 'shopping', note: 'Feiyun Market → ' + a.label, sms: 'FEIYUN MARKET', app: 'feiyun', record: false })
            : JC.ui.alert({ title: 'Confirm purchase', message: money(total) + ' will be charged to Northland Black ••1111.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Pay', style: 'default' }] }).then((x) => ({ ok: x.index === 1 }));
          conf.then((res) => {
            C.busy = false;
            if (res && !res.ok && res.reason) { if (!sh.closed) sh.render(); declined(res.reason); return; }
            if (!res || !res.ok) { if (!sh.closed) sh.render(); return; }
            const paid = JC.bank.charge({ amount: total, merchant: 'Feiyun Market', app: 'feiyun', cat: 'shopping', card, note: lines.map((l) => prod(l.id).short).join(', ') + ' → ' + a.label, sms: 'FEIYUN MARKET' });
            if (!paid.ok) { if (!sh.closed) sh.render(); declined(paid.reason); return; }
            const note = C.gift ? C.note.trim() : '';
            const made = [];
            Object.keys(groups).forEach((sid) => {
              const gl = groups[sid];
              const fees = Math.max(...gl.map((l) => fee(prod(l.id))));
              const items = gl.map((l) => { const p = prod(l.id); return { pid: p.id, title: p.title, qty: l.qty, price: p.price, art: p.art[0], opt: l.opt || '' }; });
              const steps = gl.map((l) => schedule(now(), prod(l.id).ship, C.to)).sort((x, y) => y[3] - x[3])[0];
              const o2 = JC.store.add('fy_orders', {
                id: U.uid('fo'), seller: sid, items, total: items.reduce((x, i) => x + i.price * i.qty, 0) + fees, ship: fees, t: now(), to: C.to, note, gift: C.gift, steps,
                carrier: D().SHIP[prod(gl[0].id).ship].courier, track: 'FS ' + String(1000 + Math.floor(Math.random() * 8999)) + ' ' + String(1000 + Math.floor(Math.random() * 8999)) + ' ' + String(10 + Math.floor(Math.random() * 89)), kind: 'buy', seen: 0, courier: U.pick(COURIERS), tx: paid.tx && paid.tx.id,
              }, { front: true });
              made.push(o2);
              items.forEach((i) => act('purchase', { id: i.pid, total: i.price * i.qty, to: C.to, qty: i.qty, note, order: o2.id }));
              mailReceipt(o2, 'Order confirmed: ' + (items.length === 1 ? prod(items[0].pid).short : items.length + ' items from ' + seller(sid).name));
            });
            // remove bought lines from the cart
            const s = st();
            if (!o.fromItem) s.cart = s.cart.filter((c) => !lines.some((l) => l.id === c.id && (l.opt || '') === (c.opt || '')));
            save();
            tabBadges();
            JC.bus.emit('feiyun:cart');
            JC.audio.play('success');
            C.done = { orders: made, total, to: C.to };
            if (!sh.closed) sh.render();
          });
        }
        function doneView(sh) {
          const d = C.done;
          const eta = Math.max(...d.orders.map((x) => x.steps[3]));
          return [h('div.fy-done', h('div.fy-done-ic', JC.icon('checkmark', { size: 40, weight: 3 })), h('b', 'Order placed'), h('span', money(d.total) + ' paid · arriving ' + arrive(eta)), h('span', 'to ' + addr(d.to).label)),
            JC.ui.list([{ rows: d.orders.map((x) => ({ leading: h('div.fy-thumb', JC.art.el(x.items[0].art, { cls: 'fy-fill' })), title: seller(x.seller).name, subtitle: x.items.map((i) => i.qty + ' × ' + prod(i.pid).short).join(', '), detail: money(x.total), onTap: () => { sh.close(); openOrder(x.id); } })) }], { cls: 'fy-list' }),
            h('div.fy-bs-btns', JC.ui.btn({ text: 'Track order', kind: 'filled', size: 'l', onTap: () => { sh.close(); openOrder(d.orders[0].id); } }), JC.ui.btn({ text: 'Continue shopping', kind: 'gray', size: 'l', onTap: () => sh.close() }))];
        }
        return sheet;
      }
      function signInFirst() {
        JC.ui.alert({ title: 'Sign in to Feiyun Market', message: 'You’re signed out. Sign in to bid and buy.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign In', style: 'default', onTap: () => signIn() }] });
      }
      function signIn() { st().out = false; save(); JC.ui.toast('Signed in as Childe', { icon: 'person.crop.circle.fill' }); refreshAll(); }

      // ═══ WATCHING ═══
      function watchPage() {
        let seg = 0;
        const pg = PAGE({
          title: 'Watching', large: true, cls: 'fy-watch',
          right: [JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Remove ended items', icon: 'trash', onTap: () => { st().watch = st().watch.filter((id) => !(isLot(prod(id)) && !lotOpen(id))); save(); pg.render(); } }, { text: 'Notification settings', icon: 'bell', onTap: () => prefsSheet() }]) })],
          onShow: (q) => q.render(),
          content: (q) => {
            const ids = st().watch.filter((id) => prod(id));
            const sets = [ids, ids.filter((id) => isLot(prod(id)) && lotOpen(id)), ids.filter((id) => !isLot(prod(id))), ids.filter((id) => isLot(prod(id)) && !lotOpen(id))];
            const list = sets[seg];
            return [h('div.fy-pad', JC.ui.segmented({ items: ['All', 'Bidding', 'Buy now', 'Ended'], value: seg, onChange: (i) => { seg = i; q.render(); } })),
              list.length ? JC.ui.list([{ rows: list.map((id) => { const p = prod(id); const S = isLot(p) ? lotSt(id) : null; return row(p, { sub: S ? (S.result === 'won' ? h('span.fy-pill.good', 'You won') : S.leader === 'me' && !S.closed ? h('span.fy-pill.good', 'Highest bidder') : S.myMax && !S.closed ? h('span.fy-pill.bad', 'Outbid') : S.closed ? h('span.fy-pill', 'Ended') : h('span.fy-pill', 'Watching')) : p.was ? h('span.fy-pill.deal', 'Price drop −' + Math.round((1 - p.price / p.was) * 100) + '%') : h('span.fy-pill', seller(p.seller).name), swipe: [{ text: 'Unwatch', color: 'var(--red)', icon: 'heart', onTap: () => { toggleWatch(id); q.render(); } }].concat(isLot(p) ? [] : [{ text: 'Cart', color: '#f5a524', icon: 'cart.fill', onTap: () => addToCart(id, 1, p.opts ? p.opts.list[0] : '') }]) }); }) }], { cls: 'fy-list' })
                : JC.ui.empty({ icon: 'heart', title: seg === 3 ? 'Nothing ended yet' : 'Nothing here yet', text: 'Tap the heart on any listing to watch it. We’ll tell you about price drops and when auctions are ending.', action: { text: 'Discover', onTap: () => tabs.select('home', true) } })];
          },
        });
        on('feiyun:watch', () => { if (pg.el.isConnected) pg.render(); });
        on('feiyun:lot', () => { if (pg.el.isConnected && tabs.current() === 'watch') pg.render(); });
        return pg;
      }

      // ═══ CART ═══
      function cartPage() {
        const cbar = h('div.fy-cartbar');
        const pg = PAGE({
          title: 'Cart', large: true, cls: 'fy-cart', footer: cbar,
          right: [JC.ui.navBtn({ text: 'Edit', onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Select all', icon: 'checkmark.circle.fill', onTap: () => { st().cart.forEach((c) => { c.on = true; }); save(); pg.render(); } }, { text: 'Remove selected', icon: 'trash', destructive: true, onTap: () => { st().cart = st().cart.filter((c) => !c.on); save(); tabBadges(); pg.render(); } }]) })],
          onShow: (q) => q.render(),
          content: (q) => {
            const s = st();
            const lines = s.cart.filter((c) => prod(c.id));
            cbar.hidden = !lines.length;
            if (!lines.length) return [JC.ui.empty({ icon: 'cart', title: 'Your cart is empty', text: 'Glaze lilies, Glacier Guardians and Jueyun oolong are a tap away.', action: { text: 'Start shopping', onTap: () => tabs.select('home', true) } })];
            const groups = {};
            lines.forEach((c) => { const p = prod(c.id); (groups[p.seller] = groups[p.seller] || []).push(c); });
            const sel = lines.filter((c) => c.on);
            const total = sel.reduce((x, c) => x + prod(c.id).price * c.qty, 0);
            const chk = (onv, fn) => h('div.fy-chk', { class: { on: onv }, onTap: (e) => { e.stopPropagation(); fn(); } }, onv ? JC.icon('checkmark', { size: 13, weight: 3 }) : null);
            return [
              Object.keys(groups).map((sid) => {
                const gl = groups[sid];
                const all = gl.every((c) => c.on);
                return h('div.fy-cart-g', h('div.fy-cart-gh', chk(all, () => { gl.forEach((c) => { c.on = !all; }); save(); q.render(); }), h('div.fy-cart-gn', { onTap: () => push(sellerPage(sid)) }, logo(sid, 22), h('b', seller(sid).name), JC.icon('chevron.right', { size: 11, weight: 2.6 })), h('span.fy-cart-free', gl.some((c) => fee(prod(c.id)) === 0) ? 'Free delivery' : '')),
                  JC.ui.list([{ rows: gl.map((c) => {
                    const p = prod(c.id);
                    return { leading: h('div.fy-cart-lead', chk(c.on, () => { c.on = !c.on; save(); q.render(); }), h('div.fy-thumb.cartimg', { onTap: (e) => { e.stopPropagation(); openItem(p.id); } }, JC.art.el(p.art[0], { cls: 'fy-fill' }))), title: h('span.fy-cart-t', { onTap: (e) => { e.stopPropagation(); openItem(p.id); } }, p.title), subtitle: h('div.fy-cart-sub', c.opt ? h('span.fy-cart-opt', c.opt) : null, h('div.fy-cart-pr', priceEl(p.price), h('div.fy-qstep', h('span', { onTap: (e) => { e.stopPropagation(); if (c.qty > 1) { c.qty--; save(); tabBadges(); q.render(); } else removeLine(c, q); } }, '−'), h('b', String(c.qty)), h('span', { onTap: (e) => { e.stopPropagation(); if (c.qty < 9) { c.qty++; save(); tabBadges(); q.render(); } } }, '+')))),
                      swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => removeLine(c, q) }, { text: 'Watch', color: '#f5a524', icon: 'heart', onTap: () => { if (!watched(p.id)) toggleWatch(p.id); removeLine(c, q); } }], cls: 'fy-cart-row' };
                  }) }], { cls: 'fy-list' }));
              }),
              fillCbar(chk(sel.length === lines.length, () => { const v = sel.length !== lines.length; lines.forEach((c) => { c.on = v; }); save(); q.render(); }), h('span.fy-cb-all', 'All'), h('div.fy-cb-tot', h('span', 'Total'), priceEl(total)), h('div.fy-bbtn.buy', { class: { off: !sel.length }, onTap: () => { if (!sel.length) { JC.ui.toast('Select items to check out', { icon: 'cart' }); return; } checkout(sel.map((c) => ({ id: c.id, qty: c.qty, opt: c.opt }))); } }, 'Checkout (' + sel.reduce((x, c) => x + c.qty, 0) + ')')),
            ];
            function fillCbar(...kids) { cbar.innerHTML = ''; kids.forEach((k) => k && cbar.appendChild(k)); return null; }
          },
        });
        on('feiyun:cart', () => { if (pg.el.isConnected) pg.render(); });
        return pg;
      }
      function removeLine(c, q) { const s = st(); s.cart = s.cart.filter((x) => x !== c); save(); tabBadges(); JC.ui.toast('Removed from cart', { icon: 'trash' }); q.render(); }

      // ═══ ORDERS ═══
      function statusText(o) {
        const s = stageOf(o);
        if (s === 3) return { t: 'Delivered', sub: U.fmtDate(o.steps[3], 'md') + (new Date(o.steps[3]).getFullYear() !== JC.time.date().getFullYear() ? ', ' + new Date(o.steps[3]).getFullYear() : '') + ' · ' + U.fmtTime(o.steps[3]), cls: 'good' };
        if (s === 2) return { t: 'Out for delivery', sub: 'Arriving ' + arrive(o.steps[3]), cls: 'go' };
        if (s === 1) return { t: o.intl ? 'In transit' : 'Packed', sub: 'Arriving ' + arrive(o.steps[3]), cls: 'go' };
        return { t: 'Paid · preparing', sub: 'Arriving ' + arrive(o.steps[3]), cls: 'go' };
      }
      function progress(o) {
        const s = stageOf(o);
        return h('div.fy-prog', STAGES.map((t, i) => h('div.fy-prog-s', { class: { on: i <= s, cur: i === s } }, h('i'), h('span', t))));
      }
      function orderCard(o) {
        const S = statusText(o);
        return h('div.fy-ocard', { onTap: () => openOrder(o.id) },
          h('div.fy-ocard-h', logo(o.seller, 22), h('b', seller(o.seller).name), h('span.fy-pill', { class: S.cls }, S.t)),
          o.items.map((i) => h('div.fy-ocard-i', h('div.fy-thumb', JC.art.el(i.art, { cls: 'fy-fill' })), h('div.fy-ocard-m', h('span', i.title), h('small', (i.opt ? i.opt + ' · ' : '') + '× ' + i.qty)), priceEl(i.price, 'sm'))),
          h('div.fy-ocard-f', h('span', JC.icon(stageOf(o) === 3 ? 'checkmark.circle.fill' : 'fy.truck', { size: 14 }), S.sub), h('span', 'Total ', h('b', money(o.total)))),
          stageOf(o) < 3 ? progress(o) : null);
      }
      function ordersPage() {
        let seg = 0;
        const pg = PAGE({
          title: 'Orders', large: true, cls: 'fy-orders',
          right: [JC.ui.navBtn({ icon: 'message', label: 'Messages', onTap: () => push(inboxPage()) })],
          onShow: (q) => q.render(),
          content: (q) => {
            const all = JC.store.all('fy_orders').slice().sort((a, b) => b.t - a.t);
            const sets = [all, all.filter((o) => stageOf(o) < 3), all.filter((o) => stageOf(o) === 3)];
            const list = sets[seg];
            const lots = D().P.filter((p) => isLot(p) && lotSt(p.id).myMax > 0 && lotOpen(p.id));
            return [
              flag('osial_sent') ? h('div.fy-alert', JC.icon('exclamationmark.triangle.fill', { size: 16 }), 'Storm warning at sea — some harbor deliveries are delayed.') : null,
              lots.length ? h('div.fy-box.fy-bidding', h('div.fy-box-h', 'Bidding now'), lots.map((p) => { const S = lotSt(p.id); return h('div.fy-bid-r', { onTap: () => openItem(p.id) }, h('div.fy-thumb', JC.art.el(p.art[0], { cls: 'fy-fill' })), h('div.fy-ocard-m', h('span', p.short), h('small', money(S.price) + ' · ', cd(lotEnd(p)))), h('span.fy-pill', { class: S.leader === 'me' ? 'good' : 'bad' }, S.leader === 'me' ? 'Winning' : 'Outbid')); })) : null,
              h('div.fy-pad', JC.ui.segmented({ items: ['All', 'In progress', 'Delivered'], value: seg, onChange: (i) => { seg = i; q.render(); } })),
              list.length ? h('div.fy-olist', list.map(orderCard)) : JC.ui.empty({ icon: 'bag', title: seg === 1 ? 'Nothing on the way' : 'No orders yet', text: 'Your Feiyun Market orders and tracking show up here.' }),
            ];
          },
        });
        on('store:fy_orders', () => { tabBadges(); if (pg.el.isConnected) pg.render(); });
        on('minute', () => { if (pg.el.isConnected && JC.os.isOpen('feiyun') && tabs.current() === 'orders') pg.render(); });
        return pg;
      }
      function openOrder(oid) {
        if (!JC.store.get('fy_orders', oid)) { JC.ui.toast('Order not found', { icon: 'exclamationmark.circle.fill' }); return; }
        tabs.select('orders');
        const n = tabs.nav('orders');
        while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ }
        const pg = orderPage(oid);
        n.push(pg);
        tabs.hideBar(true);
      }
      function trackLog(o) {
        const S = stageOf(o), sel = seller(o.seller), a = addr(o.to);
        const ev = [[o.steps[0], 'Order placed', o.kind === 'auction' ? 'Winning bid charged to Northland Black ••1111' : 'Paid with Northland Black ••1111']];
        ev.push([o.steps[1], 'Packed', sel.name + ' packed your order' + (o.note ? ', gift-wrapped with your card' : '') + '.']);
        const mid = o.steps[1] + (o.steps[2] - o.steps[1]) * 0.55;
        if (o.intl) {
          ev.push([o.steps[1] + 3600e3 * 5, 'In transit', 'Departed Liyue Harbor sorting centre on a Crux Shipping freighter.']);
          ev.push([o.steps[1] + 86400e3 * 9, 'In transit', 'Arrived at Snezhnaya Post, Morepesok district. Customs cleared.']);
        } else ev.push([mid, 'Picked up', 'Collected by ' + o.carrier + ' · ' + (o.to === 'wangshu' ? 'Liyue countryside hub' : 'Chihu Rock hub') + '.']);
        ev.push([o.steps[2], 'Out for delivery', (o.courier || 'Your courier') + ' is bringing it to ' + (o.toLabel || a.label) + '.']);
        ev.push([o.steps[3], 'Delivered', D().SIGNER[o.to] || 'Delivered.']);
        const n = now();
        return ev.filter((e) => e[0] <= n).reverse();
      }
      function orderPage(oid) {
        const pg = PAGE({
          title: 'Order details', cls: 'fy-order', noTabs: true,
          right: [JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => { const o = JC.store.get('fy_orders', oid); JC.ui.menu(e.currentTarget, [{ text: 'Copy tracking number', icon: 'doc.on.doc', onTap: () => { U.copy(o.track); JC.ui.toast('Tracking number copied', { icon: 'doc.on.doc' }); } }, { text: 'Contact seller', icon: 'message', onTap: () => push(chatPage(chatFor(o.seller).id)) }, { text: 'Get help', icon: 'questionmark.circle', onTap: () => push(helpPage()) }]); } })],
          content: (q) => {
            const o = JC.store.get('fy_orders', oid);
            if (!o) return JC.ui.empty({ icon: 'bag', title: 'Order not found' });
            const S = statusText(o), a = addr(o.to), s = stageOf(o);
            const log = trackLog(o);
            return [
              h('div.fy-ohero', { class: S.cls }, h('div.fy-ohero-ic', JC.icon(s === 3 ? 'checkmark.circle.fill' : s === 2 ? 'fy.truck' : 'fy.box', { size: 28 })), h('div', h('b', S.t), h('span', S.sub))),
              h('div.fy-box', progress(o), h('div.fy-trk', h('span', o.carrier + ' · ' + o.track), h('span.fy-copy', { onTap: () => { U.copy(o.track); JC.ui.toast('Tracking number copied', { icon: 'doc.on.doc' }); } }, 'Copy'))),
              h('div.fy-box', h('div.fy-box-h', 'Tracking'), h('div.fy-tl', log.map((e, i) => h('div.fy-tl-e', { class: { cur: i === 0 } }, h('i'), h('div', h('b', e[1]), h('span', e[2]), h('small', U.fmtDate(e[0], 'md') + ' · ' + U.fmtTime(e[0]))))),
                s < 3 ? h('div.fy-tl-e.next', h('i'), h('div', h('b', 'Estimated delivery'), h('span', U.fmtDate(o.steps[3], 'long') + ', by ' + U.fmtTime(o.steps[3])))) : null),
                s === 3 ? h('div.fy-proof', JC.art.el(o.items[0].art, { cls: 'fy-fill' }), h('span', JC.icon('camera.fill', { size: 12 }), 'Delivery photo')) : null),
              h('div.fy-box', h('div.fy-box-h', 'Delivery address'), h('div.fy-drow', JC.icon(a.icon || 'mappin.fill', { size: 16 }), h('div.fy-drow-m', h('b', o.toLabel || a.label), h('span', (a.name ? a.name + ' · ' : '') + (a.line || ''))))),
              o.note ? h('div.fy-box.fy-gift', h('div.fy-box-h', JC.icon('gift.fill', { size: 14 }), ' Gift card'), h('div.fy-gift-note', '“' + o.note + '”')) : null,
              h('div.fy-box', h('div.fy-box-h.tap', { onTap: () => push(sellerPage(o.seller)) }, h('span', seller(o.seller).name), JC.icon('chevron.right', { size: 12, weight: 2.6 })),
                o.items.map((i) => h('div.fy-ocard-i.tap', { onTap: () => openItem(i.pid) }, h('div.fy-thumb', JC.art.el(i.art, { cls: 'fy-fill' })), h('div.fy-ocard-m', h('span', i.title), h('small', (i.opt ? i.opt + ' · ' : '') + '× ' + i.qty)), priceEl(i.price, 'sm')))),
              h('div.fy-box', h('div.fy-sum', h('span', 'Order number'), h('b', o.id.toUpperCase().replace(/_/g, '-'))), h('div.fy-sum', h('span', 'Placed'), h('b', U.fmtDate(o.t, 'medium') + ', ' + U.fmtTime(o.t))), o.device ? h('div.fy-sum', h('span', 'Device'), h('b', o.device.replace('Ordered from: ', ''))) : null, h('div.fy-sum', h('span', 'Delivery'), h('b', o.ship ? money(o.ship) : 'Free')), h('div.fy-sum.tot', h('span', 'Total paid'), priceEl(o.total)), h('div.fy-sum', h('span', 'Payment'), h('b', 'Northland Black ••1111'))),
              h('div.fy-obtns',
                JC.ui.btn({ text: 'Contact seller', icon: 'message', kind: 'gray', size: 'm', onTap: () => push(chatPage(chatFor(o.seller).id)) }),
                s === 3 ? JC.ui.btn({ text: o.reviewed ? 'Reviewed ' + '★'.repeat(o.reviewed) : 'Leave feedback', icon: 'star.fill', kind: 'tinted', size: 'm', onTap: () => reviewSheet(o, () => q.render()) }) : JC.ui.btn({ text: 'Share tracking', icon: 'square.and.arrow.up', kind: 'tinted', size: 'm', onTap: () => JC.ui.share({ title: 'Tracking ' + o.track, subtitle: o.carrier, art: o.items[0].art, payload: { kind: 'link', text: 'Track my Feiyun parcel: ' + o.track, url: 'https://feiyun.ly/t/' + o.track.replace(/\s/g, '') } }) }),
                o.kind !== 'auction' && prod(o.items[0].pid) ? JC.ui.btn({ text: 'Buy again', icon: 'arrow.clockwise', kind: 'gray', size: 'm', onTap: () => { o.items.forEach((i) => { if (prod(i.pid)) addToCart(i.pid, i.qty, i.opt); }); } }) : null),
            ];
          },
        });
        on('minute', () => { if (pg.el.isConnected) pg.render(); });
        on('store:fy_orders', () => { if (pg.el.isConnected) pg.render(); });
        return pg;
      }
      function reviewSheet(o, done) {
        let n = o.reviewed || 5;
        let text = '';
        SHEET({
          title: 'Leave feedback', detent: 'medium', left: { text: 'Cancel' }, right: { text: 'Submit', onTap: () => { JC.store.update('fy_orders', o.id, { reviewed: n, reviewText: text }); JC.ui.toast('Thanks for your feedback', { icon: 'star.fill' }); done && done(); } },
          content: (sh) => [h('div.fy-rate', h('b', seller(o.seller).name), h('div.fy-rate-stars', [1, 2, 3, 4, 5].map((i) => h('span', { class: { on: i <= n }, onTap: () => { n = i; JC.audio.haptic(6); sh.render(); } }, JC.icon(i <= n ? 'star.fill' : 'star', { size: 34 })))), h('span', ['', 'Poor', 'Not great', 'Okay', 'Good', 'Excellent'][n])),
            h('div.fy-note', JC.ui.input({ placeholder: 'Tell other buyers about your experience', multiline: true, rows: 3, value: text, onInput: (v) => { text = v; } }))],
        });
      }

      // ═══ MESSAGES ═══
      function inboxPage() {
        const pg = PAGE({
          title: 'Messages', large: true, cls: 'fy-inbox', noTabs: true,
          right: [JC.ui.navBtn({ text: 'Read all', onTap: () => { notices().forEach((x) => { x.read = true; }); Object.values(chats()).forEach((c) => { c.unread = 0; }); save(); badge(); pg.render(); } })],
          onShow: (q) => q.render(),
          content: () => {
            const ns = notices();
            const nUn = ns.filter((x) => !x.read).length;
            const cs = Object.values(chats()).filter((c) => c.msgs.length && !c.hidden).sort((a, b) => b.msgs[b.msgs.length - 1].t - a.msgs[a.msgs.length - 1].t);
            return [JC.ui.list([
              { rows: [{ leading: h('div.fy-logo.sys', JC.icon('bell.fill', { size: 20 })), title: 'Feiyun Notices', subtitle: ns[0] ? ns[0].title + ' · ' + ns[0].body : 'Nothing yet', clamp: true, detail: ns[0] ? U.fmtRelative(ns[0].t) : '', badge: nUn || null, onTap: () => push(noticesPage()) }] },
              { header: 'Sellers', rows: cs.map((c) => { const m = c.msgs[c.msgs.length - 1]; return { leading: logo(c.seller, 44), title: seller(c.seller).name, subtitle: (m.from === 'me' ? 'You: ' : '') + (m.img && !m.text ? 'Photo' : m.text), clamp: true, detail: U.fmtRelative(m.t), badge: c.unread || null, onTap: () => push(chatPage(c.id)), swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { c.hidden = true; c.unread = 0; save(); badge(); pg.render(); } }], lead: c.unread ? [{ text: 'Read', color: 'var(--blue)', onTap: () => { c.unread = 0; save(); badge(); pg.render(); } }] : null }; }) },
            ], { cls: 'fy-list fy-inbox-list' })];
          },
        });
        on('feiyun:chat', () => { if (pg.el.isConnected) pg.render(); });
        on('feiyun:notices', () => { if (pg.el.isConnected) pg.render(); });
        return pg;
      }
      function noticesPage() {
        const pg = PAGE({
          title: 'Feiyun Notices', cls: 'fy-notices', noTabs: true,
          onShow: () => { notices().forEach((x) => { x.read = true; }); save(); badge(); },
          content: () => {
            const ns = notices();
            return ns.length ? h('div.fy-nlist', ns.map((n) => h('div.fy-ncard', { class: { unread: !n.read }, onTap: () => goTarget(n.target) }, h('div.fy-ncard-img', JC.art.el(n.art || 'mk_teaset', { cls: 'fy-fill' })), h('div.fy-ncard-m', h('b', n.title), h('span', n.body), h('small', U.fmtStamp(n.t)))))) : JC.ui.empty({ icon: 'bell', title: 'No notices' });
          },
        });
        on('feiyun:notices', () => { if (pg.el.isConnected) pg.render(); });
        return pg;
      }
      function goTarget(t) {
        if (!t) return;
        if (t.id) openItem(t.id);
        else if (t.order) openOrder(t.order);
        else if (t.collection) push(collectionPage(t.collection));
        else if (t.chat) push(chatPage(t.chat));
      }
      function chatPage(cid) {
        const c = chats()[cid] || chatFor(cid);
        c.hidden = false;
        const sl = seller(c.seller);
        const input = JC.ui.input({ placeholder: 'Message ' + sl.name, enterkey: 'send', send: true, cls: 'fy-chat-in', onSubmit: () => send() });
        function send(text) {
          const v = text != null ? text : input.value;
          if (!v.trim()) return;
          if (text == null) input.value = '';
          JC.audio.play('send');
          sendChat(cid, v);
        }
        const bar = h('div.fy-chat-bar', h('div.fy-chat-quick', (D().QUICK[c.seller] || D().QUICK._).map((q) => h('div.fy-chip.plain', { onTap: () => send(q) }, q))), h('div.fy-chat-row', input, h('div.fy-chat-send', { onTap: () => send() }, JC.icon('arrow.up', { size: 18, weight: 2.6 }))));
        const pg = PAGE({
          title: sl.name, subtitle: sl.reply, cls: 'fy-chat', noTabs: true, footer: bar,
          right: [JC.ui.navBtn({ icon: 'fy.store', label: 'Store', onTap: () => push(sellerPage(c.seller)) })],
          onShow: (q) => { chatOpen = cid; c.unread = 0; save(); badge(); q.scrollBottom(); },
          onHide: () => { if (chatOpen === cid) chatOpen = null; },
          content: () => {
            const p = c.product ? prod(c.product) : null;
            let last = 0;
            return [p ? h('div.fy-chat-prod', { onTap: () => openItem(p.id) }, h('div.fy-thumb', JC.art.el(p.art[0], { cls: 'fy-fill' })), h('div.fy-ocard-m', h('span', p.short), h('small', isLot(p) ? 'Current bid ' + money(lotSt(p.id).price) : money(p.price))), JC.icon('chevron.right', { size: 12, weight: 2.6 })) : null,
              h('div.fy-msgs', c.msgs.map((m) => {
                const stamp = m.t - last > 3600e3 ? h('div.fy-msg-stamp', U.fmtStamp(m.t)) : null;
                last = m.t;
                return [stamp, h('div.fy-msg', { class: m.from === 'me' ? 'me' : 'them' }, m.img ? h('div.fy-msg-img', { onTap: () => viewer([m.img], 0, (a) => { if (a === 'fy_teaset_base') { lotSt('lot_teaset').seenBase = true; save(); act('item_view', { id: 'lot_teaset', photo: 'base' }); } }) }, JC.art.el(m.img, { cls: 'fy-fill' })) : null, m.text ? h('div.fy-bub', m.text) : null)];
              }), c.typing ? h('div.fy-msg.them', h('div.fy-bub.typing', h('i'), h('i'), h('i'))) : null)];
          },
        });
        on('feiyun:chat', (e) => { if (e.id === cid && pg.el.isConnected) { pg.render(); pg.scrollBottom(true); if (chatOpen === cid) { c.unread = 0; save(); badge(); } } });
        return pg;
      }

      // ═══ ACCOUNT ═══
      function accountPage() {
        const pg = PAGE({
          title: 'My Feiyun', cls: 'fy-account', noTabs: true,
          onShow: (q) => q.render(),
          content: (q) => {
            const s = st();
            if (s.out) return [h('div.fy-signin', h('div.fy-brand-mark.big', JC.icon('fy.cloud', { size: 40 })), h('b', 'Sign in to Feiyun Market'), h('span', 'Bid on lots, track orders and message sellers.'), JC.ui.btn({ text: 'Continue as Childe', icon: 'person.crop.circle.fill', kind: 'filled', size: 'l', onTap: () => { signIn(); q.render(); } }))];
            const frozen = JC.bank.frozen();
            const orders = JC.store.all('fy_orders');
            return [
              h('div.fy-acct', JC.ui.avatar('me', 64), h('div', h('b', 'Childe'), h('span', '@eleventh.angler · Member since 2024'), h('span.fy-gold', JC.icon('star.fill', { size: 11 }), 'Gold member · ' + (4120 + orders.filter((o) => o.t > tp('+0 23:47')).reduce((x, o) => x + Math.floor(o.total / 10), 0)).toLocaleString('en-US') + ' points'))),
              h('div.fy-acct-stats', [[String(st().watch.length), 'Watching', () => tabs.select('watch', true)], [String(orders.length), 'Orders', () => tabs.select('orders', true)], [String(s.follow.length), 'Following', () => followingSheet()], [String(s.viewed.length), 'Viewed', () => viewedSheet()]].map(([n, t, fn]) => h('div.tap', { onTap: fn }, h('b', n), h('span', t)))),
              JC.ui.list([
                { rows: [
                  { icon: { glyph: 'message.fill', bg: TINT }, title: 'Messages', badge: unreadCount() || null, chevron: true, onTap: () => push(inboxPage()) },
                  { icon: { glyph: 'bag.fill', bg: '#f5a524' }, title: 'Purchases', chevron: true, onTap: () => tabs.select('orders', true) },
                  { icon: { glyph: 'fy.gavel', bg: '#a0522d' }, title: 'Bids & offers', detail: String(D().P.filter((p) => isLot(p) && lotSt(p.id).myMax > 0).length), chevron: true, onTap: () => push(collectionPage('auctions')) },
                ] },
                { header: 'Account', rows: [
                  { icon: { glyph: 'mappin.fill', bg: '#2f9e6f' }, title: 'Addresses', detail: addr(s.addr).label, chevron: true, onTap: () => addressPicker(s.addr, (id) => { s.addr = id; save(); q.render(); }) },
                  { icon: { glyph: 'creditcard.fill', bg: '#14213d' }, title: 'Payment', subtitle: 'Northland Black •••• 1111', detail: frozen ? 'Frozen' : money(JC.bank.balance()), chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Northland Black •••• 1111', message: frozen ? 'This card is frozen. Purchases and auction payments will be declined until you unfreeze it.' : 'Available balance ' + money(JC.bank.balance()) + '. Auction wins are charged automatically.', actions: [{ text: 'Open Northland', onTap: () => JC.os.open('northland') }] }) },
                  { icon: { glyph: 'bell.fill', bg: '#ff9500' }, title: 'Notifications', chevron: true, onTap: () => prefsSheet() },
                ] },
                { rows: [
                  { icon: { glyph: 'checkmark.circle.fill', bg: '#34c759' }, title: 'Buyer Protection & help', chevron: true, onTap: () => push(helpPage()) },
                  { icon: { glyph: 'info.circle', bg: '#8e8e93' }, title: 'About Feiyun Market', chevron: true, onTap: () => push(aboutPage()) },
                ] },
                { rows: [{ title: 'Sign Out', destructive: true, center: true, onTap: () => JC.ui.alert({ title: 'Sign out of Feiyun Market?', message: 'You’ll stop getting outbid alerts and delivery updates on this iPhone.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onTap: () => { s.out = true; save(); q.render(); } }] }) }] },
              ], { cls: 'fy-list' }),
            ];
          },
        });
        return pg;
      }
      function followingSheet() {
        SHEET({ title: 'Following', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: st().follow.map((sid) => ({ leading: logo(sid, 34), title: seller(sid).name, subtitle: seller(sid).loc, chevron: true, onTap: () => push(sellerPage(sid)) })) }], { cls: 'fy-list' })] });
      }
      function viewedSheet() {
        SHEET({ title: 'Recently viewed', detent: 'large', left: { text: 'Done' }, right: { text: 'Clear', bold: false, onTap: () => { st().viewed = []; save(); } }, content: () => [st().viewed.length ? JC.ui.list([{ rows: st().viewed.map(prod).filter(Boolean).map((p) => row(p)) }], { cls: 'fy-list' }) : JC.ui.empty({ icon: 'clock', title: 'Nothing viewed yet' })] });
      }
      function prefsSheet() {
        const P = st().prefs;
        SHEET({
          title: 'Notifications', detent: 'medium', left: { text: 'Done' },
          content: () => [JC.ui.list([{ footer: 'Feiyun also texts you about auction results and deliveries.', rows: [
            { title: 'Outbid alerts', toggle: { on: P.outbid, onChange: (v) => { P.outbid = v; save(); } } },
            { title: 'Auctions ending soon', toggle: { on: P.ending, onChange: (v) => { P.ending = v; save(); } } },
            { title: 'Order & delivery updates', toggle: { on: P.orders, onChange: (v) => { P.orders = v; save(); } } },
            { title: 'Deals & promotions', toggle: { on: P.promos, onChange: (v) => { P.promos = v; save(); } } },
          ] }], { cls: 'fy-list' })],
        });
      }
      function helpPage() {
        return PAGE({
          title: 'Help', cls: 'fy-help', noTabs: true,
          content: () => [JC.ui.list([
            { header: 'Feiyun Buyer Protection', footer: 'Every order is covered by the Feiyun Commerce Guild: if it doesn’t arrive or isn’t as described, you get your Mora back.', rows: [
              { title: 'Item didn’t arrive', chevron: true, onTap: () => JC.ui.alert({ title: 'Item didn’t arrive', message: 'Open the order and check the tracking first. If the courier marks it delivered and you can’t find it, report it within 30 days.', buttons: [{ text: 'OK' }] }) },
              { title: 'Not as described', chevron: true, onTap: () => JC.ui.alert({ title: 'Not as described', message: 'Message the seller first. If you can’t agree within 3 days, the Guild steps in. Auction lots are covered too.', buttons: [{ text: 'OK' }] }) },
              { title: 'How auctions work', chevron: true, onTap: () => JC.ui.alert({ title: 'How auctions work', message: 'Enter the most you’re willing to pay. Feiyun bids for you, just enough to keep you ahead, up to that maximum. Ties go to the earlier bid. The winning price is charged automatically when the lot closes; if the payment fails, the lot goes to the runner-up.', buttons: [{ text: 'Got it' }] }) },
            ] },
            { rows: [{ title: 'Call the Guild helpline', subtitle: 'Open 09:00–21:00', chevron: true, onTap: () => { const hr = JC.time.date().getHours(); JC.ui.alert({ title: hr >= 9 && hr < 21 ? 'Call (0761) 555 0188?' : 'Helpline closed', message: hr >= 9 && hr < 21 ? 'Feiyun Commerce Guild buyer support.' : 'The Guild helpline opens at 09:00. It’s ' + U.fmtTime(now()) + '. Message a seller or check your order’s tracking instead.', buttons: hr >= 9 && hr < 21 ? [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', style: 'default', onTap: () => JC.ui.toast('All agents are busy (it’s the Rite week)', { icon: 'phone.fill' }) }] : [{ text: 'OK' }] }); } }] },
          ], { cls: 'fy-list' })],
        });
      }
      function aboutPage() {
        return PAGE({
          title: 'About', cls: 'fy-about', noTabs: true,
          content: () => [h('div.fy-about-hero', h('div.fy-about-icon', JC.appIcon('feiyun')), h('b', 'Feiyun Market'), h('span', 'Version 26.10 (1018)'), h('span', 'Operated by the Feiyun Commerce Guild, Liyue Harbor. Est. by the Fei family; trading since the days of the Qixing.')),
            JC.ui.list([{ rows: [{ title: 'Terms of service', chevron: true, onTap: () => JC.ui.alert({ title: 'Terms of service', message: 'All contracts made on Feiyun Market are binding. (The Guild was very clear about this. So, reportedly, was someone else.)', buttons: [{ text: 'OK' }] }) }, { title: 'Privacy', chevron: true, onTap: () => JC.ui.alert({ title: 'Privacy', message: 'We never sell your data. We do occasionally auction it. (That was a joke from the second son of the Guild. Legal asked us to remove it. We didn’t.)', buttons: [{ text: 'OK' }] }) }, { title: 'Rate Feiyun Market', chevron: true, onTap: () => JC.ui.toast('Thanks! ★★★★★', { icon: 'star.fill' }) }] }], { cls: 'fy-list' })],
        });
      }

      // ═══ intents & lifecycle ═══
      function refreshAll() { ['home', 'watch', 'cart', 'orders', 'search'].forEach((t) => { const n = tabs.nav(t); if (n && n.top() && n.top().el.isConnected) n.top().render(); }); tabBadges(); }
      function handle(it) {
        if (!it) return;
        if (it.id) {
          tabs.select('home');
          const n = tabs.nav('home');
          while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ }
          openItem(it.id);
          return;
        }
        if (it.order) { openOrder(it.order); return; }
        if (it.chat) { tabs.select('home'); push(chatPage(it.chat)); return; }
        if (it.collection) { tabs.select('home'); push(collectionPage(it.collection)); return; }
        if (it.search) {
          tabs.select('search');
          const pg = tabs.nav('search').top();
          if (pg && pg.submit) pg.submit(it.search);
          return;
        }
        if (it.tab) tabs.select(it.tab === 'watching' ? 'watch' : it.tab);
      }
      tabs = JC.ui.tabs(body, {
        tint: TINT,
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'watch', title: 'Watching', icon: 'heart.fill', root: () => watchPage() },
          { id: 'cart', title: 'Cart', icon: 'cart.fill', root: () => cartPage() },
          { id: 'orders', title: 'Orders', icon: 'bag.fill', root: () => ordersPage() },
        ],
        search: { id: 'search', title: 'Search', icon: 'magnifyingglass', root: () => searchPage() },
        active: 'home',
        onChange: () => { const n = tabs && tabs.nav(); if (n && n.top()) syncBar(n.top()); },
      });
      tabBadges();
      on('feiyun:lot', () => tabBadges());
      on('store:fy_orders', () => tabBadges());
      on('bank', () => { const n = tabs.nav(); if (n && n.top() && /fy-(home|account)/.test(n.top().el.className)) n.top().render(); });
      setTimeout(() => handle(intent0), 40);
      return {
        intent: handle,
        show() { refreshAll(); badge(); },
        back() {
          const vw = win.overlays.querySelector('.fy-vw');
          if (vw) { vw.remove(); return true; }
          const n = tabs.nav();
          if (n && n.depth() > 1) { n.pop(); return true; }
          return false;
        },
        destroy() { offs.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); timers.forEach((f) => f()); live.clear(); chatOpen = null; },
      };
    },
  });
})();
