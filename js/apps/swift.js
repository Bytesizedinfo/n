/* Harbor Ride — Liyue ride-hailing (harbor teal). Home / Services / Activity / Account; booking flow
   (where to → ride options → matching → driver card → Dynamic Island ETA → trip → rating → receipt), scheduled
   rides (Reserve, Airport meet & greet), trip history with route maps and receipts, Help → Report a lost item.
   Acts: ride_view { id } · ride_book { id, from, to, then, at, note, tier, riders } · ride_report_lost { id, kind, item }.
   Intents: { id } { to, tier } { report } { reserve }. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;
  const R7 = () => JC.r7;
  const T = (s) => JC.time.parse(s);
  const M = (n) => U.fmtMoney(Math.round(n));
  const TEAL = '#0e9f9a';

  JC.appIcon.add('swift', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#19c2b4"/><stop offset="1" stop-color="#0a6f7a"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M12 33.5c0-1.3.9-2.4 2.2-2.7l3.6-.8 4-6.6c.8-1.3 2.2-2.1 3.7-2.1h9.6c1.6 0 3.1.9 3.9 2.3l3.2 6.2 3 .7c1.3.3 2.2 1.4 2.2 2.7V39H12z" fill="#fff"/><path d="M24.5 24.5h11.8l2.7 5.6H21.3z" fill="#0b6e78" fill-opacity=".85"/><circle cx="19.5" cy="39" r="3.8" fill="#0b6e78" stroke="#fff" stroke-width="2.2"/><circle cx="40.5" cy="39" r="3.8" fill="#0b6e78" stroke="#fff" stroke-width="2.2"/><path d="M6 46.5c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".95"/><path d="M10 52.5c4-3 8-3 12 0s8 3 12 0 8-3 12 0" fill="none" stroke="#bff3ec" stroke-width="2.2" stroke-linecap="round" opacity=".7"/></svg>`);

  // ═══ seeded trips (agree with STORY.md, the bank statement and the `ride` SMS thread) ═══
  const FANG = { name: 'Mr. Fang', car: 'Jueyun M6 · Slate grey', plate: '璃A·07F16', rating: 4.96, trips: 9412, since: 2019, langs: 'Liyue dialect, some Snezhnayan' };
  JC.store.seed('rides', [
    { id: 'ride_1016_2258', from: 'liuli', to: 'pier7', t: '+0 22:58', end: '+0 23:09', price: 46, tier: 'go', km: 3.4, min: 11, card: 'nb', status: 'completed', rated: 0, ref: 'HR-1016-2258',
      pax: 2, guests: [{ name: 'Z.', note: 'added as a guest at pickup' }], pickupNote: 'Liuli Pavilion, east gate', fare: { base: 13, dist: 15.6, time: 11, night: 6.4 }, driver: FANG },
    { id: 'ride_1016_1938', from: 'northland', to: 'liuli', t: '+0 19:38', end: '+0 19:51', price: 38, tier: 'comfort', km: 2.6, min: 13, card: 'nb', status: 'completed', rated: 5, ref: 'HR-1016-1938',
      driver: { name: 'Ms. Huixin', car: 'Guili Mira EV · Pearl white', plate: '璃A·31K82', rating: 4.94, trips: 5120, since: 2021 } },
    { id: 'ride_1015_0702', from: 'apartment', to: 'northland', t: '-1 07:02', end: '-1 07:11', price: 22, tier: 'go', km: 1.6, min: 9, card: 'nb', status: 'completed', rated: 5, ref: 'HR-1015-0702',
      driver: { name: 'Uncle Gao', car: 'Qixing Sedan · Black', plate: '璃B·66213', rating: 4.91, trips: 14020, since: 2012 } },
    { id: 'ride_1013_2341', from: 'third-round', to: 'apartment', t: '-3 23:41', end: '-3 23:52', price: 31, tier: 'go', km: 2.1, min: 11, card: 'nb', status: 'completed', rated: 5, ref: 'HR-1013-2341', note: 'Passenger had a black eye and was very cheerful about it.',
      driver: { name: 'Mr. Changshun', car: 'Dihua EV · Silver', plate: '璃A·52Q90', rating: 4.88, trips: 3302, since: 2022 } },
    { id: 'ride_1011_1402', from: 'apartment', to: 'wangsheng', t: '-5 14:02', end: '-5 14:18', price: 34, tier: 'go', km: 3.0, min: 16, card: 'nb', status: 'completed', rated: 4, ref: 'HR-1011-1402',
      driver: { name: 'Ms. Jinglan', car: 'Guili Mira EV · Jade green', plate: '璃A·88J04', rating: 4.97, trips: 7210, since: 2020 } },
    { id: 'ride_1009_2215', from: 'northland', to: 'pier7', t: '-7 22:15', end: '-7 22:24', price: 28, tier: 'go', km: 1.9, min: 9, card: 'nb', status: 'completed', rated: 0, ref: 'HR-1009-2215',
      driver: { name: 'Mr. Tian', car: 'Jueyun M6 · White', plate: '璃A·19T77', rating: 4.86, trips: 2210, since: 2023 } },
    { id: 'ride_1004_2351', from: 'liuli', to: 'apartment', t: '2026-10-04 23:51', end: '2026-10-05 00:14', price: 52, tier: 'go', km: 4.6, min: 23, card: 'nb', status: 'completed', rated: 5, ref: 'HR-1004-2351', compliments: ['Great conversation'],
      pax: 2, guests: [{ name: 'Z.', note: 'got out at Feiyun Slope' }], stops: ['wangsheng'], driver: FANG },
    { id: 'ride_0925_1830', from: 'northland', to: 'jade', t: '2026-09-25 18:30', end: '2026-09-25 18:44', price: 41, tier: 'black', km: 3.9, min: 14, card: 'corp', business: true, status: 'completed', rated: 5, ref: 'HR-0925-1830', note: 'Business · meeting at the Jade Chamber',
      driver: { name: 'Mr. Bolai', car: 'Qixing Tianquan S · Black', plate: '璃A·00Q71', rating: 4.99, trips: 9050, since: 2018 } },
    { id: 'ride_0905_1130', from: 'apartment', to: 'alcor', t: '2026-09-05 11:30', end: '2026-09-05 11:41', price: 24, tier: 'go', km: 1.9, min: 11, card: 'nb', status: 'completed', rated: 5, ref: 'HR-0905-1130',
      driver: { name: 'Uncle Gao', car: 'Qixing Sedan · Black', plate: '璃B·66213', rating: 4.91, trips: 13880, since: 2012 } },
    { id: 'ride_0720_2318', from: 'wanmin-rest', to: 'apartment', t: '2026-07-20 23:18', end: '2026-07-20 23:27', price: 19, tier: 'go', km: 1.4, min: 9, card: 'nb', status: 'completed', rated: 5, ref: 'HR-0720-2318', note: 'Birthday. Passenger carried a fishing rod with a ribbon on it.',
      driver: { name: 'Ms. Huixin', car: 'Guili Mira EV · Pearl white', plate: '璃A·31K82', rating: 4.93, trips: 4400, since: 2021 } },
    { id: 'ride_0312_1405', from: 'airport', to: 'liyue-grand', t: '2026-03-12 14:05', end: '2026-03-12 14:41', price: 142, tier: 'black', km: 13.8, min: 36, card: 'corp', business: true, status: 'completed', rated: 5, ref: 'HR-0312-1405', note: 'Business · first day in Liyue',
      driver: { name: 'Mr. Bolai', car: 'Qixing Tianquan S · Black', plate: '璃A·00Q71', rating: 4.99, trips: 8210, since: 2018 } },
  ]);

  const TIERS = {
    go: { name: 'Harbor Go', seats: 4, desc: 'Affordable, everyday rides', eta: 4, icon: 'car.fill', mult: 1 },
    comfort: { name: 'Comfort', seats: 4, desc: 'Newer cars, quiet drivers, extra legroom', eta: 6, icon: 'car.fill', mult: 1.35 },
    xl: { name: 'Harbor XL', seats: 6, desc: 'Rides for groups up to 6 — and luggage', eta: 8, icon: 'person.2.fill', mult: 1.7 },
    black: { name: 'Black', seats: 4, desc: 'Premium cars with top-rated drivers', eta: 7, icon: 'star.fill', mult: 2.4 },
    sampan: { name: 'Sampan', seats: 6, desc: 'Water taxi across the harbor · waterfront pickups only', eta: 9, icon: 'water.waves', mult: 1.2, water: true },
  };
  const DRIVERS = [
    ['Ms. Jinglan', 'Guili Mira EV · Jade green', '璃A·88J04', 4.97], ['Mr. Changshun', 'Dihua EV · Silver', '璃A·52Q90', 4.88], ['Uncle Gao', 'Qixing Sedan · Black', '璃B·66213', 4.91],
    ['Ms. Huixin', 'Guili Mira EV · Pearl white', '璃A·31K82', 4.94], ['Mr. Tian', 'Jueyun M6 · White', '璃A·19T77', 4.86], ['Ms. Shiyan', 'Jueyun M6 · Copper', '璃A·64S28', 4.95],
  ];
  const BOATMEN = [['Old Man Yu', 'Sampan “Lucky Catch” · Red sail', 'LH-W·117', 4.98], ['Ms. Qiao', 'Sampan “Morning Tide” · Teal hull', 'LH-W·042', 4.95]];
  const PAYS = [
    { id: 'nb', name: 'Northland Black', short: 'Northland', last: '1111', color: 'linear-gradient(135deg,#1c2b45,#0a1222)', bank: true },
    { id: 'corp', name: 'Northland Bank Group', short: 'Business', last: '0011', color: 'linear-gradient(135deg,#7b1e24,#3a0c10)', business: true },
    { id: 'cash', name: 'Harbor Cash', short: 'Harbor Cash', last: '', color: 'linear-gradient(135deg,#19c2b4,#0a6f7a)' },
  ];
  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.swift || (d.apps.swift = {});
    const def = { cash: 86, card: 'nb', saved: { home: 'apartment', work: 'northland' }, safety: { check: true, pin: false, share: true }, notif: { trips: true, promos: false }, promo: null, promoLeft: 0, reports: [], bizPersonal: false };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();
  const SUPPORT = '(0761) 555 0162';
  const payOf = (id) => PAYS.find((p) => p.id === (id || 'nb')) || PAYS[0];
  const payLabel = (id) => { const c = payOf(id); return c.id === 'cash' ? 'Harbor Cash' : c.name + ' •• ' + c.last; };
  const cashText = () => M(st().cash);
  const placeName = (id) => R7().name(id);
  const placeFull = (id) => R7().fullName(id);
  const coords = (id) => { const p = R7().place(id); return p ? [p.x, p.y] : (MV() ? MV().HOME : [0, 0]); };
  function sms(text) { try { JC.story.incoming('ride', { from: 'ride', text }); } catch (e) { /* no thread */ } }
  const flag = (k) => { try { return !!JC.story.flag(k); } catch (e) { return false; } };
  const chapter = () => { try { return (JC.story.api() || {}).chapter || null; } catch (e) { return null; } };

  /** charge a payment method (Harbor Cash is the app's own balance; cards go through JC.bank) */
  function charge(o) {
    const S = st();
    if (S.card === 'cash') { S.cash = Math.round((S.cash - o.amount) * 100) / 100; save(); return { ok: true }; }
    const r = JC.bank.charge({ card: S.card, merchant: o.merchant, amount: o.amount, app: 'swift', cat: 'ride', note: o.note || '', place: o.place || null, sms: 'HARBOR RIDE' });
    if (!r.ok) declined(r.reason, o.after);
    return r;
  }
  function declined(reason, after) {
    JC.ui.alert({ title: reason === 'frozen' ? 'Card Frozen' : 'Payment Declined', message: JC.bank.reasonText(reason) + (after ? ' ' + after : ''), buttons: [{ text: 'OK' }] });
  }
  function canPay(amount) {
    const S = st();
    if (S.card === 'cash') return S.cash >= amount ? { ok: true } : { ok: false, reason: 'funds' };
    return JC.bank.check({ card: S.card, amount });
  }
  function fareFor(leg, tier, t) {
    const hr = new Date(t || JC.time.now()).getHours();
    const night = hr >= 22 || hr < 6;
    let p = (13 + 4.6 * leg.km + 1.0 * leg.min) * (night ? 1.15 : 1) * ((TIERS[tier] || TIERS.go).mult);
    if (st().promo === 'TARTAGLIA11' && st().promoLeft > 0) p *= 0.89;
    return Math.max(15, Math.round(p));
  }
  const isWater = (id) => { const p = R7().place(id); return !!(p && p.water); };

  // ═══ scheduled rides run even while the app is closed ═══
  function tickScheduled() {
    const now = JC.time.now();
    JC.store.all('rides').filter((r) => r.status === 'scheduled').forEach((r) => {
      const meet = r.then && r.to === 'airport';
      if (!r.notified && now >= r.at - 20 * 60000) {
        JC.store.update('rides', r.id, { notified: true });
        JC.notify.push({ app: 'swift', title: 'Your Harbor Ride is on the way', body: r.driver.name + ' · ' + r.driver.car + ' · ' + r.driver.plate + (meet ? ' · heading to Arrivals' : ''), open: { app: 'swift', intent: { id: r.id } } });
      }
      if (!r.arrived && now >= r.at) {
        JC.store.update('rides', r.id, { arrived: true });
        sms('[Harbor Ride] ' + r.driver.name + ' (' + r.driver.plate + ') ' + (meet ? 'is waiting at Arrivals, ' + placeName('airport') + (r.note ? ' — “' + r.note + '”' : '') + '.' : 'has arrived at ' + placeName(r.from) + '.'));
      }
      const dur = (r.min || 20) * 60000 + (meet ? 35 * 60000 : 0);
      if (now >= r.at + dur) {
        const S = st();
        const prev = S.card;
        S.card = r.card || prev;
        const res = r.card === 'cash' ? (S.cash >= r.price ? charge({ merchant: 'Harbor Ride', amount: r.price }) : { ok: false }) : JC.bank.charge({ card: r.card || 'nb', merchant: 'Harbor Ride', amount: r.price, app: 'swift', cat: 'ride', note: placeName(r.from) + ' → ' + placeName(r.then || r.to), sms: 'HARBOR RIDE' });
        S.card = prev; save();
        JC.store.update('rides', r.id, { status: res.ok ? 'completed' : 'unpaid', t: r.at, end: r.at + dur, rated: 0 });
        sms('[Harbor Ride] Trip complete · ' + placeName(r.from) + ' → ' + (r.then ? placeName('airport') + ' → ' + placeName(r.then) : placeName(r.to)) + ' · ' + M(r.price) + (res.ok ? '.' : ' — payment failed, fare outstanding.'));
      }
    });
  }
  JC.bus.on('minute', () => { try { tickScheduled(); } catch (e) { console.error('[harbor ride] schedule', e); } });

  JC.app({
    id: 'swift',
    name: 'Harbor Ride',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-swift');
      let active = null; // current on-demand booking
      const tabs = JC.ui.tabs(body, {
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'services', title: 'Services', icon: 'square.grid.2x2.fill', root: () => servicesPage() },
          { id: 'activity', title: 'Activity', icon: 'list.bullet', root: () => activityPage() },
          { id: 'account', title: 'Account', icon: 'person.crop.circle', root: () => accountPage() },
        ],
        active: 'home',
      });
      const offs = [];
      offs.push(JC.store.on('rides', () => refreshTabs()));
      offs.push(JC.bus.on('story:fx', () => refreshTabs()));
      offs.push(JC.bus.on('story:chapter', () => refreshTabs()));

      function banner() {
        if (flag('osial_sent') && JC.time.now() >= T('+2 23:00')) return h('div.sw-alert.dark', JC.icon('bolt.fill', { size: 16 }), h('div', h('b', 'Harbor blackout'), h('span', 'Traffic lights are out along the docks. Sampan service suspended. Expect delays.')));
        if (chapter() === 'sun_rite') return h('div.sw-alert', JC.icon('flame.fill', { size: 16 }), h('div', h('b', 'Rite of Parting · road closures'), h('span', 'No cars on Yujing Terrace until 18:00. Pickups moved to Feiyun Slope.')));
        if (JC.bank.frozen() && st().card === 'nb') return h('div.sw-alert.warn', JC.icon('lock.fill', { size: 16 }), h('div', h('b', 'Card frozen'), h('span', 'Northland Black is frozen. Pick Harbor Cash or Business to ride.')));
        return null;
      }

      // ═══ HOME ═══
      function homePage() {
        return JC.ui.page({
          navbar: false, cls: 'sw-home',
          content: () => {
            const S = st();
            const recent = [];
            JC.store.all('rides').filter((r) => r.status !== 'scheduled').slice().sort((a, b) => b.t - a.t).forEach((r) => { if (!recent.includes(r.to) && recent.length < 4) recent.push(r.to); });
            const up = JC.store.all('rides').filter((r) => r.status === 'scheduled').sort((a, b) => a.at - b.at)[0];
            return [
              h('div.sw-hero',
                h('div.sw-top', h('div.sw-logo', h('span.sw-logo-mark'), 'Harbor Ride'), h('div.sw-av', { onTap: () => tabs.select('account', true) }, JC.ui.avatar('me', 36))),
                h('div.sw-where', { onTap: () => startBooking() }, JC.icon('magnifyingglass', { size: 20, weight: 2.4 }), h('span.sw-where-t', 'Where to?'), h('span.sw-now', { onTap: (e) => { e.stopPropagation(); reserve(); } }, JC.icon('clock', { size: 14 }), 'Later', JC.icon('chevron.down', { size: 11, weight: 3 }))),
                h('div.sw-saved', [['home', 'house.fill', 'Home'], ['work', 'briefcase.fill', 'Work']].map(([k, g, t]) => h('div.sw-chip', { onTap: () => startBooking({ to: S.saved[k] }) }, JC.icon(g, { size: 15 }), h('span', t))), h('div.sw-chip', { onTap: () => startBooking({ to: 'pier7' }) }, JC.icon('water.waves', { size: 15 }), h('span', 'Pier 7')))),
              banner(),
              up ? h('div.sw-sec', h('div.sw-h', 'Upcoming'), h('div.sw-upc', { onTap: () => { tabs.select('activity', true); tabs.nav('activity').push(tripPage(up.id)); } }, h('div.sw-upc-ic', JC.icon(up.to === 'airport' ? 'airplane' : 'calendar', { size: 22 })), h('div', h('b', (up.then ? 'Airport pickup' : 'Ride to ' + placeName(up.to))), h('span', U.fmtDate(up.at, 'day') + ' · ' + U.fmtTime(up.at) + ' · ' + up.driver.name)), JC.icon('chevron.right', { size: 14, weight: 2.6 }))) : null,
              h('div.sw-sec', JC.ui.list([{ rows: recent.map((id) => { const p = R7().place(id); return p ? { leading: h('div.sw-recic', JC.icon('clock', { size: 16 })), title: p.short || p.name, subtitle: p.addr, onTap: () => startBooking({ to: id }) } : null; }).filter(Boolean) }], { cls: 'sw-list' })),
              h('div.sw-sec', h('div.sw-h', 'Suggestions', h('span.tap', { onTap: () => tabs.select('services', true) }, 'See all')),
                h('div.sw-sugg', [['go', 'Ride', 'car.fill'], ['reserve', 'Reserve', 'calendar'], ['airport', 'Airport', 'airplane'], ['sampan', 'Sampan', 'water.waves']].map(([k, t, g]) => h('div.sw-tile', { onTap: () => svc(k) }, h('div.sw-tile-ic', JC.icon(g, { size: 26 })), h('span', t))))),
              h('div.sw-sec', h('div.sw-h', 'Ways to ride'), h('div.sw-promos.hscroll',
                promo('Meet & greet', 'A driver waits at LHI Arrivals with a name sign.', '#0b4f5c', () => airportBooking()),
                promo('Cross the harbor', 'Sampan water taxis between the piers. Mind the spray.', '#c0392b', () => startBooking({ tier: 'sampan', from: 'pier7', to: 'alcor' })),
                promo('Got a code?', S.promo ? S.promo + ' · ' + S.promoLeft + ' rides left' : 'Add a promo code to your account.', '#2b2d42', () => promosSheet()))),
              h('div.sw-sec', h('div.sw-h', 'Around you'), h('div.sw-mapcard', { onTap: () => startBooking() }, MV().thumb(MV().HOME, { w: 370, h: 150, zoom: 26, style: 'muted', marker: false, center: [MV().HOME[0] - 0.6, MV().HOME[1] + 0.4], dots: [[1.1, -0.7], [-1.9, 0.9], [-0.6, -1.3], [2.2, 1.0], [-2.8, -0.2], [0.4, 1.5]].map(([dx, dy]) => ({ at: [MV().HOME[0] + dx, MV().HOME[1] + dy], color: TEAL, r: 5 })).concat([{ at: MV().HOME, color: '#0a84ff', r: 7 }]) }), h('div.sw-mapcap', JC.icon('location.fill', { size: 13 }), ' ' + R7().place('player-home').addr + ' · 6 cars nearby'))),
              h('div.sw-foot', 'Harbor Ride · Liyue Harbor · ', h('span.tap', { onTap: () => helpCenter() }, 'Help Center')),
            ];
          },
        });
      }
      function promo(t, s, c, fn) { return h('div.sw-promo', { style: { '--c': c }, onTap: fn }, h('b', t), h('span', s), h('span.sw-promo-go', 'Learn more ›')); }
      function helpCenter() {
        JC.ui.actionSheet({ title: 'Harbor Ride Help', actions: [
          { text: 'Report a lost item', onTap: () => { const r = JC.store.all('rides').filter((x) => x.status === 'completed').sort((a, b) => b.t - a.t)[0]; if (r) openPages('activity', () => [tripPage(r.id), helpPage(r), lostIntro(r)]); } },
          { text: 'Review a fare', onTap: () => tabs.select('activity', true) },
          { text: 'Call Customer Care', onTap: () => callSupport() },
        ] });
      }
      function callSupport() {
        MV().fakeCall({ name: 'Harbor Ride Customer Care', num: SUPPORT, glyph: 'questionmark.circle', lines: ['Thank you for calling Harbor Ride. For lost items, please use Report a Lost Item on the trip in the app — it reaches the driver fastest.', 'For safety emergencies, call the Millelith on 110.'] });
      }

      // ═══ SERVICES ═══
      function servicesPage() {
        return JC.ui.page({
          title: 'Services', large: true, cls: 'sw-services',
          content: () => [
            h('div.sw-svcgrid', [['go', 'Ride', 'car.fill', 'Go anywhere in the harbor'], ['comfort', 'Comfort', 'car.fill', 'Quiet, extra legroom'], ['xl', 'XL', 'person.2.fill', 'Up to 6 seats'], ['black', 'Black', 'star.fill', 'Premium'], ['reserve', 'Reserve', 'calendar', 'Plan ahead'], ['airport', 'Airport', 'airplane', 'Meet & greet'], ['sampan', 'Sampan', 'water.waves', 'Water taxi'], ['hourly', 'Hourly', 'clock', 'Keep the car']].map(([k, t, g, s]) => h('div.sw-svc', { onTap: () => svc(k) }, h('div.sw-svc-ic', JC.icon(g, { size: 28 })), h('b', t), h('span', s)))),
            JC.ui.list([{ header: 'For business', rows: [{ icon: { glyph: 'briefcase.fill', bg: '#7b1e24' }, title: 'Northland Bank Group', subtitle: 'Business profile · Special Collections (Liyue)', chevron: true, onTap: () => businessSheet() }] }], { cls: 'sw-list' }),
          ],
        });
      }
      function svc(k) {
        if (k === 'reserve') return reserve();
        if (k === 'airport') return airportBooking();
        if (k === 'hourly') return JC.ui.alert({ title: 'Hourly', message: 'Keep a car and driver for 2–12 hours. Popular for weddings, funerals and very long goodbyes. Minimum booking: 2 hours, from 07:00.', buttons: [{ text: 'OK' }] });
        startBooking({ tier: k, from: k === 'sampan' ? 'pier7' : undefined });
      }
      function businessSheet() {
        const S = st();
        JC.ui.sheet({ title: 'Business profile', detent: 'large', left: { text: 'Done' }, content: (sh) => [
          h('div.sw-biz', h('div.sw-biz-logo', 'N'), h('div', h('b', 'Northland Bank Group'), h('span', 'Special Collections (Liyue) · Harbor Road 1'))),
          JC.ui.list([{ rows: [{ title: 'Payment', detail: 'Corporate •• 0011' }, { title: 'Expense reports', detail: 'Monthly' }, { title: 'Approver', detail: 'Office of the Ninth' }, { title: 'Rides this month', detail: String(JC.store.all('rides').filter((r) => r.business).length) }] },
            { footer: 'Rides between 22:00 and 06:00 billed to Business need a reason. Every line is reviewed by Pantalone’s office.', rows: [{ title: 'Default to Business for all rides', toggle: { on: S.card === 'corp', onChange: (v) => { S.card = v ? 'corp' : 'nb'; save(); sh.render(); if (v) JC.ui.toast('Rides will be billed to Northland Bank Group', { icon: 'briefcase.fill' }); } } }] }], { cls: 'sw-list' })] });
      }

      // ═══ ACTIVITY ═══
      const routeCache = new Map();
      function rideLeg(r) {
        const k = r.from + '>' + (r.stops || []).join('>') + '>' + r.to;
        if (!routeCache.has(k)) {
          const seq = [r.from].concat(r.stops || [], [r.to], r.then ? [r.then] : []);
          let pts = [], km = 0, min = 0;
          for (let i = 0; i < seq.length - 1; i++) { const l = R7().leg(seq[i], seq[i + 1]); if (!l) { pts = null; break; } pts = pts.concat(l.pts); km += l.km; min += l.min; }
          routeCache.set(k, pts ? { pts, km, min } : null);
        }
        return routeCache.get(k);
      }
      const ink = () => (JC.os && JC.os.dark ? '#5fe0d2' : '#0b4f5c');
      const yr = (t) => (new Date(t).getFullYear() !== JC.time.date().getFullYear() ? ', ' + new Date(t).getFullYear() : '');
      function rideRow(r) {
        const A = coords(r.from), B = coords(r.then || r.to);
        const leg = rideLeg(r);
        const thumb = MV().thumb(B, { w: 96, h: 72, zoom: 18, style: 'muted', marker: false, labels: false, pois: false, fit: leg ? leg.pts : [A, B], routes: leg ? [{ pts: leg.pts, color: ink(), width: 2.5 }] : [], dots: [{ at: A, color: '#30d158', r: 4 }, { at: B, color: ink(), r: 4 }] });
        const sched = r.status === 'scheduled';
        return h('div.sw-trip', { class: { sched }, onTap: () => tabs.nav('activity').push(tripPage(r.id)) },
          h('div.sw-trip-map', thumb),
          h('div.sw-trip-m', h('div.sw-trip-t', r.then ? 'Airport pickup → ' + placeName(r.then) : placeName(r.to)),
            h('div.sw-trip-s', U.fmtDate(sched ? r.at : r.t, 'md') + yr(sched ? r.at : r.t) + ' · ' + U.fmtTime(sched ? r.at : r.t) + (r.pax > 1 ? ' · ' + r.pax + ' riders' : '')),
            h('div.sw-trip-s', sched ? 'Scheduled · ' + (TIERS[r.tier] || TIERS.go).name : r.status === 'cancelled' ? 'Cancelled' + (r.price ? ' · ' + M(r.price) : '') : r.status === 'unpaid' ? 'Payment failed · ' + M(r.price) : M(r.price) + (r.business ? ' · Business' : ''))),
          h('div.sw-trip-go', JC.icon('chevron.right', { size: 14, weight: 2.6 })));
      }
      function activityPage() {
        return JC.ui.page({
          title: 'Activity', large: true, cls: 'sw-activity', refreshOnShow: true,
          content: () => {
            const all = JC.store.all('rides');
            const upcoming = all.filter((r) => r.status === 'scheduled').sort((a, b) => a.at - b.at);
            const past = all.filter((r) => r.status !== 'scheduled').sort((a, b) => b.t - a.t);
            const cur = active && active.phase !== 'done' ? [h('div.sw-h', 'Current'), h('div.sw-trip.cur', { onTap: () => openFlow() }, h('div.sw-trip-ic', JC.icon(active.tier === 'sampan' ? 'water.waves' : 'car.fill', { size: 22 })), h('div.sw-trip-m', h('div.sw-trip-t', 'Ride to ' + placeName(active.to)), h('div.sw-trip-s', flowStatus())), h('div.sw-trip-go', JC.icon('chevron.right', { size: 14, weight: 2.6 })))] : [];
            return [h('div.sw-acts', cur, upcoming.length ? [h('div.sw-h', 'Upcoming')].concat(upcoming.map(rideRow)) : [], h('div.sw-h', 'Past'), past.map(rideRow))];
          },
        });
      }
      function tripPage(id) {
        const r0 = JC.store.get('rides', id);
        if (!r0) return JC.ui.page({ title: 'Trip', content: () => JC.ui.empty({ icon: 'car.fill', title: 'Trip not found' }) });
        JC.story.act('ride_view', { id });
        const page = JC.ui.page({
          title: r0.status === 'scheduled' ? 'Scheduled ride' : 'Trip details', cls: 'sw-tripdetail', bg: 'grouped',
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share', onTap: () => { const r = JC.store.get('rides', id) || r0; JC.ui.share({ title: 'Harbor Ride receipt', subtitle: placeName(r.from) + ' → ' + placeName(r.to), icon: 'car.fill', payload: { kind: 'text', text: 'Harbor Ride · ' + placeName(r.from) + ' → ' + placeName(r.then || r.to) + ' · ' + U.fmtDate(r.t || r.at, 'medium') + ' · ' + M(r.price) } }); } })],
          content: () => {
            const r = JC.store.get('rides', id) || r0;
            const sched = r.status === 'scheduled';
            const A = coords(r.from), B = coords(r.then || r.to);
            const leg = rideLeg(r);
            const seq = [r.from].concat(r.stops || [], [r.to], r.then ? [r.then] : []);
            const times = sched ? [r.at] : [r.t];
            return [
              h('div.sw-tmap', MV().thumb(B, { w: 370, h: 190, style: 'muted', fit: leg ? leg.pts : [A, B], routes: leg ? [{ pts: leg.pts, color: ink(), width: 4 }] : [], marker: false, dots: [{ at: A, color: '#30d158' }].concat((r.stops || []).map((s) => ({ at: coords(s), color: '#ff9f0a' })), r.then ? [{ at: coords(r.to), color: '#ff9f0a' }] : [], [{ at: B, color: ink() }]) })),
              h('div.sw-tsum', h('div.sw-tsum-t', (TIERS[r.tier] || TIERS.go).name + ' · ' + U.fmtDate(sched ? r.at : r.t, 'medium') + (r.pax > 1 ? ' · ' + r.pax + ' riders' : '')), h('div.sw-tsum-p', M(r.price)), sched ? h('div.sw-badge', JC.icon('calendar', { size: 13 }), ' Scheduled · driver confirmed') : null, r.note ? h('div.sw-tsum-n', r.note) : null),
              h('div.sw-legs', seq.map((pid, i) => legRow(r, seq, pid, i)).flat()),
              (r.guests || []).length || (r.riders || []).length ? JC.ui.list([{ header: 'Riders', rows: [{ avatar: 'me', avatarSize: 36, title: 'Childe', subtitle: 'Account holder' }].filter(() => !(r.riders || []).length).concat((r.guests || []).map((g) => ({ avatar: { initials: g.name.replace(/\W/g, '').slice(0, 1), grad: ['#c9b37a', '#8a6d2f'] }, avatarSize: 36, title: g.name, subtitle: 'Guest · ' + g.note }))).concat((r.riders || []).map((cid) => ({ avatar: cid, avatarSize: 36, title: JC.contacts.short(cid), subtitle: 'Riding for you' }))) }], { cls: 'sw-list' }) : null,
              JC.ui.list([{ rows: [
                { avatar: { initials: initials(r.driver.name), grad: ['#2f6f73', '#0b4f5c'] }, avatarSize: 44, title: r.driver.name, subtitle: r.driver.car + ' · ' + r.driver.plate, detail: '★ ' + Number(r.driver.rating).toFixed(2), onTap: () => driverSheet(r.driver) },
              ] }, { rows: sched ? [
                r.note ? { title: 'Note for driver', subtitle: '“' + r.note + '”', icon: { glyph: 'text.bubble', bg: '#8e8e93' } } : null,
                { title: 'Payment', detail: payLabel(r.card), icon: { glyph: 'creditcard.fill', bg: '#1c2b45' } },
                { title: 'Cancel scheduled ride', destructive: true, center: true, onTap: () => cancelScheduled(r, () => page.nav.pop()) },
              ].filter(Boolean) : [
                { title: 'Receipt', icon: { glyph: 'doc.text', bg: TEAL }, chevron: true, onTap: () => receipt(r) },
                { title: 'Help', subtitle: 'Lost items, fare review, safety', icon: { glyph: 'questionmark.circle', bg: '#ff9f0a' }, chevron: true, onTap: () => page.nav.push(helpPage(r)) },
                { title: 'Ride again', icon: { glyph: 'arrow.clockwise', bg: '#30d158' }, chevron: true, onTap: () => startBooking({ from: r.from, to: r.to, tier: r.tier === 'sampan' ? 'sampan' : undefined }) },
                r.status === 'completed' ? { title: r.rated ? 'You rated ' + '★'.repeat(r.rated) : 'Rate your driver', icon: { glyph: 'star.fill', bg: '#ffb300' }, chevron: !r.rated, onTap: r.rated ? null : () => rateSheet(r, () => page.render()) } : null,
              ].filter(Boolean) }], { cls: 'sw-list' }),
            ];
          },
        });
        return page;
      }
      function legRow(r, seq, pid, i) {
        const sched = r.status === 'scheduled';
        const last = i === seq.length - 1;
        let sub;
        if (i === 0) sub = (sched ? 'Pickup ' + U.fmtTime(r.at) : U.fmtTime(r.t)) + (r.pickupNote ? ' · ' + r.pickupNote : '');
        else if (last) sub = r.end ? U.fmtTime(r.end) : sched ? 'Drop-off' : '—';
        else if (pid === 'airport' && r.then) sub = 'Arrivals · meet & greet';
        else sub = 'Stop' + ((r.guests || []).length ? ' · ' + r.guests[0].name + ' got out' : '');
        return [
          i ? h('div.sw-leg-line') : null,
          h('div.sw-leg', h('span.sw-dot', { class: { g: i === 0, b: last, s: i > 0 && !last } }), h('div', h('b', placeFull(pid)), h('span', sub))),
        ];
      }
      function cancelScheduled(r, done) {
        JC.ui.alert({ title: 'Cancel this ride?', message: 'You won’t be charged — it’s more than an hour before pickup.', buttons: [{ text: 'Keep Ride', style: 'cancel' }, { text: 'Cancel Ride', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          JC.store.update('rides', r.id, { status: 'cancelled', price: 0, t: r.at });
          sms('[Harbor Ride] Your scheduled ride for ' + U.fmtDate(r.at, 'day') + ' ' + U.fmtTime(r.at) + ' was cancelled. You were not charged.');
          JC.ui.toast('Ride cancelled', { icon: 'xmark' });
          done && done();
        });
      }
      function initials(n) { const w = String(n).replace(/^(Mr\.|Ms\.|Uncle|Old Man)\s+/, '').split(/\s+/); return (w[0] || '?')[0] + ((w[1] || '')[0] || ''); }
      function driverSheet(d) {
        JC.ui.sheet({ title: '', detent: 'medium', left: { text: 'Close' }, content: () => [h('div.sw-drv', JC.ui.avatar({ initials: initials(d.name), grad: ['#2f6f73', '#0b4f5c'] }, 74), h('div.sw-drv-n', d.name), h('div.sw-drv-s', '★ ' + Number(d.rating).toFixed(2) + ' · ' + (d.trips || 4200).toLocaleString('en-US') + ' trips · since ' + (d.since || 2020)), h('div.sw-plate', d.plate), h('div.sw-drv-s', d.car)),
          JC.ui.list([{ rows: [{ title: 'Compliments', detail: d === FANG || d.name === 'Mr. Fang' ? '“Discreet” ×88' : '“Great conversation” ×212' }, { title: 'Languages', detail: d.langs || 'Liyue dialect' }] }])] });
      }
      function fareOf(r) {
        if (r.fare) return r.fare;
        const hr = new Date(r.t).getHours();
        const night = hr >= 22 || hr < 6 ? Math.round(r.price * 0.13) : 0;
        const rest = r.price - night;
        const base = Math.min(13, rest);
        const time = Math.round(rest * 0.22);
        return { base, dist: rest - base - time, time, night };
      }
      function receipt(r) {
        const F = fareOf(r);
        const mins = r.min || (r.end ? Math.max(1, Math.round((r.end - r.t) / 60000)) : 0);
        JC.ui.sheet({ title: 'Receipt', detent: 'large', left: { text: 'Done' }, right: { text: 'Email', bold: false, onTap: () => { JC.ui.toast('Receipt sent to the account email', { icon: 'envelope.fill' }); return false; } },
          content: () => [h('div.sw-rcpt',
            h('div.sw-rcpt-logo', h('span.sw-logo-mark'), 'Harbor Ride'), h('div.sw-rcpt-t', 'Thanks for riding, Childe'), h('div.sw-rcpt-d', U.fmtDate(r.t, 'full') + ' · ' + U.fmtTime(r.t)),
            h('div.sw-rcpt-total', h('span', 'Total'), h('b', M(r.price))),
            [['Base fare', F.base], ['Distance (' + Number(r.km || 0).toFixed(1) + ' km)', F.dist], ['Time' + (mins ? ' (' + mins + ' min)' : ''), F.time], F.night ? ['Night fare (22:00–06:00)', F.night] : null].filter(Boolean).map(([k, v]) => h('div.sw-rcpt-row', h('span', k), h('span', M(v)))),
            r.pax > 1 ? h('div.sw-rcpt-row', h('span', 'Riders'), h('span', r.pax + ' (you + ' + (r.guests || []).map((g) => g.name).join(', ') + ')')) : null,
            h('div.sw-rcpt-row.pay', h('span', 'Paid with ' + payLabel(r.card)), h('span', M(r.price))),
            h('div.sw-rcpt-trip', [r.from].concat(r.stops || [], [r.to], r.then ? [r.then] : []).map((pid, i, arr) => h('div', h('span.sw-dot', { class: { g: i === 0, b: i === arr.length - 1, s: i > 0 && i < arr.length - 1 } }), ' ', placeFull(pid), i === 0 ? ' · ' + U.fmtTime(r.t) : i === arr.length - 1 && r.end ? ' · ' + U.fmtTime(r.end) : ''))),
            (r.guests || []).length ? h('div.sw-rcpt-guest', JC.icon('person.2.fill', { size: 14 }), ' ' + r.guests.map((g) => g.name + ' ' + g.note).join(' · ')) : null,
            h('div.sw-rcpt-drv', 'You rode with ' + r.driver.name + ' · ' + r.driver.car + ' · ' + r.driver.plate),
            h('div.sw-rcpt-foot', (r.ref ? 'Receipt ' + r.ref + ' · ' : '') + 'Harbor Ride Mobility (Liyue) Ltd. · Harbor Road 60, Liyue Harbor. VAT invoice available in the app for 180 days.'))] });
      }
      function rateSheet(r, after) {
        let stars = 5, tip = 0;
        const comps = new Set();
        const s = JC.ui.sheet({ title: 'Rate your trip', detent: 'large', left: { text: 'Skip' }, right: { text: 'Done', onTap: () => {
          JC.store.update('rides', r.id, { rated: stars, tip, compliments: [...comps] });
          if (tip) charge({ merchant: 'Harbor Ride — Tip', amount: tip, note: 'Tip for ' + r.driver.name });
          JC.ui.toast('Thanks for your rating', { icon: 'star.fill' });
          if (after) after();
        } },
          content: () => [h('div.sw-rate', JC.ui.avatar({ initials: initials(r.driver.name), grad: ['#2f6f73', '#0b4f5c'] }, 64), h('div.sw-rate-q', 'How was your ride with ' + r.driver.name + '?'),
            h('div.sw-stars', [1, 2, 3, 4, 5].map((n) => h('span.tap', { class: { on: n <= stars }, onTap: () => { stars = n; s.render(); } }, '★'))),
            h('div.sw-rate-h', 'Give a compliment'), h('div.sw-comps', ['Discreet', 'Clean car', 'Expert navigation', 'Great conversation', 'Quiet ride', 'Smells like the sea'].map((c) => h('span.sw-comp.tap', { class: { on: comps.has(c) }, onTap: () => { if (comps.has(c)) comps.delete(c); else comps.add(c); s.render(); } }, c))),
            h('div.sw-rate-h', 'Add a tip'), h('div.sw-tips', [0, 5, 10, 20].map((t) => h('span.sw-tip.tap', { class: { on: tip === t }, onTap: () => { tip = t; s.render(); } }, t ? M(t) : 'No tip'))))] });
      }

      // ── help & lost items ──
      function helpPage(r) {
        return JC.ui.page({
          title: 'Help', bg: 'grouped', cls: 'sw-help',
          content: (page) => [
            h('div.sw-helptrip', h('b', placeName(r.from) + ' → ' + placeName(r.then || r.to)), h('span', U.fmtDate(r.t, 'medium') + ' · ' + U.fmtTime(r.t) + ' · ' + r.driver.name)),
            JC.ui.list([{ header: 'Trip issues', rows: [
              { title: 'Report a lost item', subtitle: 'Something left behind — or found', icon: { glyph: 'magnifyingglass', bg: '#ff9f0a' }, chevron: true, onTap: () => page.nav.push(lostIntro(r)) },
              { title: 'Review my fare or fees', icon: { glyph: 'creditcard.fill', bg: '#30b0c7' }, chevron: true, onTap: () => issue('Review my fare', 'Tell us what looks wrong with this fare.') },
              { title: 'My driver was unprofessional', icon: { glyph: 'exclamationmark.bubble', bg: '#ff9f0a' }, chevron: true, onTap: () => issue('Driver feedback', 'What happened? We read every report.') },
              { title: 'I was involved in an accident', icon: { glyph: 'car.fill', bg: '#ff3b30' }, chevron: true, onTap: () => JC.ui.alert({ title: 'Are you safe?', message: 'If anyone is hurt, call 120 now. For everything else our safety team is available 24/7.', buttons: [{ text: 'Call Safety Line', onTap: () => MV().fakeCall({ name: 'Harbor Ride Safety', num: '(0761) 555 0163', glyph: 'shield.fill', lines: ['Harbor Ride safety line. Is everyone safe?', '…If you’re okay, we’ll follow up by email. Take care.'] }) }, { text: 'I’m OK', style: 'cancel' }] }) },
            ] }, { header: 'Account', rows: [
              { title: 'Payment methods', chevron: true, onTap: () => { tabs.select('account', true); tabs.nav('account').push(walletPage()); } },
              { title: 'Contact support', subtitle: 'Customer Care · ' + SUPPORT, chevron: true, onTap: () => callSupport() },
            ] }], { cls: 'sw-list' }),
          ],
        });
      }
      function issue(title, msg) {
        JC.ui.alert({ title, message: msg, input: { placeholder: 'Describe the issue' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit', style: 'default' }] }).then((x) => { if (x.index === 1) JC.ui.alert({ title: 'Report Received', message: 'Our support team will reply by email within 24 hours.', buttons: [{ text: 'OK' }] }); });
      }
      function lostIntro(r) {
        return JC.ui.page({
          title: 'Lost & found', bg: 'grouped', cls: 'sw-lost',
          content: (page) => [
            h('div.sw-lost-hero', h('div.sw-lost-ic', JC.icon('magnifyingglass', { size: 34, weight: 2.2 })), h('div.sw-lost-t', 'Report a lost item'), h('div.sw-lost-s', 'Left something on this trip — or found something that isn’t yours? Tell us and we’ll contact the people who were on it.')),
            h('div.sw-lost-opts',
              h('div.sw-lost-opt', { onTap: () => page.nav.push(lostForm(r, 'found')) }, h('div.sw-lost-oic.found', JC.icon('hand.raised', { size: 24 })), h('div', h('b', 'I found an item'), h('span', 'Someone left something and I have it')), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
              h('div.sw-lost-opt', { onTap: () => page.nav.push(lostForm(r, 'lost')) }, h('div.sw-lost-oic', JC.icon('questionmark.circle', { size: 24 })), h('div', h('b', 'I lost an item'), h('span', 'I left something behind on this trip')), JC.icon('chevron.right', { size: 14, weight: 2.6 }))),
            h('div.sw-lost-note', JC.icon('shield.fill', { size: 14 }), ' Numbers stay private. Calls are connected through Harbor Ride.'),
          ],
        });
      }
      function lostForm(r, kind) {
        const f = { item: 'Phone', where: 'With me', msg: kind === 'found' ? 'I have a phone in a blue case with a red fish charm. It’s safe. I’d like to give it back.' : '', contact: '', color: kind === 'found' ? 'Blue case, red fish charm, “World’s Best Big Brother” sticker' : '' };
        const page = JC.ui.page({
          title: kind === 'found' ? 'Report a found item' : 'Report a lost item', bg: 'grouped', cls: 'sw-lost',
          content: () => [
            JC.ui.list([{ header: kind === 'found' ? 'What did you find?' : 'What did you lose?', rows: ['Phone', 'Wallet', 'Keys', 'Fishing rod', 'Other'].map((t) => ({ title: t, check: f.item === t, onTap: () => { f.item = t; page.render(); } })) },
              { header: 'Description', rows: [{ custom: JC.ui.input({ value: f.color, placeholder: 'Colour, brand, anything distinctive', cls: 'form-field sw-field', onInput: (v) => { f.color = v; } }) }] },
              kind === 'found' ? { header: 'Where is it now?', rows: ['With me', 'I gave it to the driver', 'I took it to the Millelith'].map((t) => ({ title: t, check: f.where === t, onTap: () => { f.where = t; page.render(); } })) } : null,
              { header: kind === 'found' ? 'Message to the owner' : 'Message to your driver', rows: [{ custom: JC.ui.input({ value: f.msg, multiline: true, rows: 3, placeholder: kind === 'found' ? 'Let them know how to get it back' : 'Describe where you think you left it', cls: 'form-field sw-field', onInput: (v) => { f.msg = v; } }) }] },
              { header: 'How can we reach you?', footer: kind === 'lost' && f.item === 'Phone' ? 'If you lost your phone, enter another number — we can’t call the phone you lost. (You are, of course, using it right now.)' : 'Optional. We’ll only use this to arrange the return.', rows: [{ custom: JC.ui.input({ value: f.contact, placeholder: 'Phone number or email', cap: 'none', cls: 'form-field sw-field', onInput: (v) => { f.contact = v; } }) }] },
            ].filter(Boolean), { cls: 'sw-list' }),
            h('div.sw-submit', JC.ui.btn({ text: 'Submit report', kind: 'filled', size: 'l', onTap: () => submit() })),
          ],
        });
        function submit() {
          JC.ui.alert({
            title: 'Send to Harbor Ride Support?',
            message: (kind === 'found'
              ? 'Support will phone the account holder for this trip — Childe — and ' + r.driver.name + ', and arrange a hand-over.'
              : 'Support will contact ' + r.driver.name + ' and then phone the account holder to confirm.') + ' This report is sent from this phone, so whoever answers will know where it is.',
            buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit Report', style: 'destructive' }],
          }).then((x) => {
            if (x.index !== 1) return;
            const S = st();
            const d = new Date(r.t);
            const no = 'HR-L' + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + (1000 + Math.floor(Math.random() * 8999));
            S.reports.push({ no, kind, item: f.item, t: JC.time.now(), ride: r.id });
            save();
            sms('[Harbor Ride] Lost & found report ' + no + ' received (' + f.item + '). Support will call the account holder shortly.');
            page.nav.replace(lostDone(r, kind, no, f));
            JC.story.act('ride_report_lost', { id: r.id, kind, item: f.item, no });
          });
        }
        return page;
      }
      function lostDone(r, kind, no, f) {
        return JC.ui.page({
          title: 'Report sent', bg: 'grouped', cls: 'sw-lost', noBack: true,
          right: [JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => tabs.nav('activity').popToRoot() })],
          content: () => [
            h('div.sw-lost-hero.done', h('div.sw-lost-ic.ok', JC.icon('checkmark', { size: 36, weight: 3 })), h('div.sw-lost-t', kind === 'found' ? 'We’re contacting the owner' : 'We’ve notified your driver'), h('div.sw-lost-s', 'Report ' + no + ' · ' + f.item + (f.color ? ' (' + f.color + ')' : ''))),
            JC.ui.list([{ header: 'What happens next', rows: (kind === 'found' ? [
              { title: 'Support calls the account holder', subtitle: 'The number on this trip’s account' },
              { title: r.driver.name + ' has been told too', subtitle: 'In case the owner contacts the driver first' },
              { title: 'Keep the item safe', subtitle: 'We’ll text a hand-over time and place.' },
            ] : [
              { title: 'Your driver has been notified', subtitle: r.driver.name + ' · ' + r.driver.plate },
              { title: 'We’ll connect you by phone', subtitle: f.contact ? 'At ' + f.contact : 'Add a contact number to speed this up' },
              { title: 'Return fee', subtitle: 'Drivers may charge up to ℳ30 for a return trip' },
            ]).map((x) => Object.assign(x, { icon: { glyph: 'checkmark', bg: '#30d158' } })) }], { cls: 'sw-list' }),
          ],
        });
      }

      // ═══ ACCOUNT ═══
      function accountPage() {
        return JC.ui.page({
          title: 'Account', large: true, cls: 'sw-account', bg: 'grouped',
          content: (page) => [
            h('div.sw-prof', JC.ui.avatar('me', 66), h('div', h('div.sw-prof-n', 'Childe'), h('div.sw-prof-s', JC.icon('star.fill', { size: 12 }), ' 4.91 · Harbor Gold · ' + JC.store.all('rides').filter((r) => r.status === 'completed').length + ' trips'))),
            h('div.sw-quick', [['Help', 'questionmark.circle', () => helpCenter()], ['Wallet', 'creditcard.fill', () => page.nav.push(walletPage())], ['Activity', 'list.bullet', () => tabs.select('activity', true)]].map(([t, g, fn]) => h('div.sw-q', { onTap: fn }, JC.icon(g, { size: 22 }), h('span', t)))),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'creditcard.fill', bg: '#1c2b45' }, title: 'Wallet', detail: payOf(st().card).short + (payOf(st().card).last ? ' •• ' + payOf(st().card).last : ''), chevron: true, onTap: () => page.nav.push(walletPage()) },
              { icon: { glyph: 'house.fill', bg: '#0a84ff' }, title: 'Saved places', chevron: true, onTap: () => page.nav.push(savedPage()) },
              { icon: { glyph: 'shield.fill', bg: '#30d158' }, title: 'Safety', chevron: true, onTap: () => page.nav.push(safetyPage()) },
              { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promotions', detail: st().promo && st().promoLeft ? st().promoLeft + ' rides left' : '', chevron: true, onTap: () => promosSheet() },
              { icon: { glyph: 'briefcase.fill', bg: '#7b1e24' }, title: 'Business profile', detail: 'Northland', chevron: true, onTap: () => businessSheet() },
            ] }, { rows: [
              { icon: { glyph: 'bell.fill', bg: '#ff3b30' }, title: 'Notifications', chevron: true, onTap: () => notifSheet() },
              { icon: { glyph: 'lock.fill', bg: '#8e8e93' }, title: 'Privacy', chevron: true, onTap: () => JC.ui.alert({ title: 'Privacy', message: 'Harbor Ride uses your location only during trips. Guests you add see the driver and the route, not your name.', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'info.circle', bg: '#30b0c7' }, title: 'About', detail: 'v 5.6.2', chevron: true, onTap: () => JC.ui.alert({ title: 'Harbor Ride 5.6.2', message: 'Cars and sampans across Liyue Harbor since 2019.', buttons: [{ text: 'OK' }] }) },
            ] }, { rows: [{ title: 'Sign out', destructive: true, center: true, onTap: () => JC.ui.alert({ title: 'Sign out?', message: 'You’ll need the account password to sign back in.', input: { placeholder: 'Password to confirm', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'For your security, you can’t sign out without the account password.', buttons: [{ text: 'OK' }] }), 500); }) }] }], { cls: 'sw-list' }),
          ],
        });
      }
      function walletPage() {
        const page = JC.ui.page({
          title: 'Wallet', bg: 'grouped', cls: 'sw-walletp',
          content: () => [
            h('div.sw-cash', h('div', h('small', 'Harbor Cash'), h('b', cashText())), JC.ui.btn({ text: 'Add funds', kind: 'filled', size: 's', onTap: () => JC.ui.actionSheet({ title: 'Add to Harbor Cash', actions: [50, 100, 200].map((n) => ({ text: M(n), onTap: () => topUp(n, () => page.render()) })) }) })),
            JC.ui.list([{ header: 'Payment methods', rows: PAYS.map((c) => ({ leading: h('div.sw-cardic', { style: { background: c.color } }), title: c.name, subtitle: c.id === 'cash' ? 'Balance ' + cashText() : '•• ' + c.last + (c.bank && JC.bank.frozen() ? ' · Frozen' : '') + (c.business ? ' · Business' : ''), check: st().card === c.id, onTap: () => { st().card = c.id; save(); page.render(); } })).concat([{ title: 'Add payment method', tinted: true, onTap: () => JC.ui.alert({ title: 'Add Card', message: 'The cardholder’s name must match the account: Childe (A.). Use the Northland app to add a card.', buttons: [{ text: 'OK' }] }) }]) },
              { header: 'Vouchers', rows: [{ title: 'TARTAGLIA11', subtitle: st().promo === 'TARTAGLIA11' ? 'Active · 11% off · ' + st().promoLeft + ' rides left' : 'Not added', onTap: () => promosSheet() }] }], { cls: 'sw-list' }),
          ],
        });
        return page;
      }
      function topUp(n, done) {
        const go = () => { const r = JC.bank.charge({ card: 'nb', merchant: 'Harbor Ride', amount: n, app: 'swift', cat: 'ride', note: 'Harbor Cash top-up', sms: 'HARBOR RIDE' }); if (!r.ok) { declined(r.reason); return; } st().cash = Math.round((st().cash + n) * 100) / 100; save(); done(); JC.ui.toast(M(n) + ' added to Harbor Cash', { icon: 'checkmark' }); };
        if (JC.wallet && JC.wallet.pay) JC.wallet.pay({ merchant: 'Harbor Ride', sub: 'Harbor Cash top-up', amount: n, card: 'nb', cat: 'ride', app: 'swift', record: false }).then((r) => { if (r && r.reason) { declined(r.reason); return; } if (r && r.ok) go(); });
        else go();
      }
      function savedPage() {
        const page = JC.ui.page({
          title: 'Saved places', bg: 'grouped',
          content: () => {
            const S = st();
            return [JC.ui.list([{ rows: [['home', 'house.fill', 'Home'], ['work', 'briefcase.fill', 'Work']].map(([k, g, t]) => ({ icon: { glyph: g, bg: TEAL }, title: t, subtitle: placeFull(S.saved[k]), chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Set ' + t, actions: ['apartment', 'northland', 'wangsheng', 'pier7', 'liyue-grand'].map((id) => ({ text: placeFull(id), onTap: () => { S.saved[k] = id; save(); page.render(); } })) }) }))
              .concat([{ icon: { glyph: 'water.waves', bg: '#0b4f5c' }, title: 'Pier 7', subtitle: 'Fishing spot', onTap: () => startBooking({ to: 'pier7' }) }, { title: 'Add saved place', tinted: true, onTap: () => JC.ui.alert({ title: 'Add Place', input: { placeholder: 'Search for an address' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((x) => { if (x.index === 1 && x.value) JC.ui.toast('Saved “' + x.value + '”', { icon: 'checkmark' }); }) }]) }], { cls: 'sw-list' })];
          },
        });
        return page;
      }
      function safetyPage() {
        return JC.ui.page({
          title: 'Safety', bg: 'grouped',
          content: () => {
            const S = st();
            return [JC.ui.list([{ header: 'Trusted contacts', rows: [{ avatar: 'ekat', avatarSize: 34, title: 'Ekaterina', subtitle: 'Gets your trip status on business rides' }, { title: 'Add contact', tinted: true, onTap: () => JC.ui.actionSheet({ title: 'Add trusted contact', actions: ['zl', 'lumine', 'tonia'].map((c) => ({ text: JC.contacts.short(c), onTap: () => JC.ui.toast(JC.contacts.short(c) + ' added', { icon: 'checkmark' }) })) }) }] },
              { header: 'Ride features', rows: [
                { title: 'RideCheck', subtitle: 'Checks in if a trip stops unexpectedly', toggle: { on: S.safety.check, onChange: (v) => { S.safety.check = v; save(); } } },
                { title: 'PIN verification', subtitle: 'Confirm your driver with a 4-digit PIN', toggle: { on: S.safety.pin, onChange: (v) => { S.safety.pin = v; save(); } } },
                { title: 'Share trip status automatically', toggle: { on: S.safety.share, onChange: (v) => { S.safety.share = v; save(); } } },
              ] }], { cls: 'sw-list' })];
          },
        });
      }
      function promosSheet() {
        const s = JC.ui.sheet({ title: 'Promotions', detent: 'medium', left: { text: 'Done' }, content: () => [h('div.sw-sheetpad',
          st().promo ? h('div.sw-promo-on', h('b', st().promo), h('span', st().promoLeft > 0 ? '11% off · ' + st().promoLeft + ' of 11 rides left' : 'All 11 rides used')) : null,
          JC.ui.input({ placeholder: 'Enter promo code', cap: 'characters', cls: 'sw-promoin', enterkey: 'done', onSubmit: (v) => apply(v) }),
          h('p.sw-muted', 'Codes come from Harbor Ride emails and partners.'))] });
        function apply(v) {
          v = String(v || '').trim().toUpperCase();
          if (!v) return;
          if (v === 'TARTAGLIA11') {
            if (st().promo === v) { JC.ui.toast('Already applied', { icon: 'checkmark' }); return; }
            st().promo = v; st().promoLeft = 11; save(); s.render(); JC.audio.play('success');
            JC.ui.alert({ title: '11% off your next 11 rides', message: 'A gift from a friend of Harbor Ride. Applied automatically at checkout.', buttons: [{ text: 'Nice' }] });
          } else JC.ui.alert({ title: 'Invalid Code', message: '“' + v + '” isn’t a valid promo code.', buttons: [{ text: 'OK' }] });
        }
      }
      function notifSheet() {
        const S = st();
        JC.ui.sheet({ title: 'Notifications', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [{ title: 'Trip updates', toggle: { on: S.notif.trips, onChange: (v) => { S.notif.trips = v; save(); } } }, { title: 'Offers & promotions', toggle: { on: S.notif.promos, onChange: (v) => { S.notif.promos = v; save(); } } }] }])] });
      }

      // ═══ SCHEDULED RIDES (Reserve · Airport meet & greet) ═══
      const DAY0 = () => { const d = new Date(JC.time.now()); d.setHours(0, 0, 0, 0); return d.getTime(); };
      function reserve(pre) {
        pre = pre || {};
        const now = JC.time.date();
        const days = [0, 1, 2, 3].map((k) => { const t = DAY0() + k * 86400e3; return { label: k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : U.fmtDate(t, 'day'), value: k }; });
        const f = Object.assign({ day: 1, hh: 7, mm: 15, from: 'player-home', to: null, note: '', tier: 'go', riders: [] }, pre);
        if (!pre.to) { const nx = new Date(now.getTime() + 75 * 60000); if (nx.getDate() === now.getDate()) { f.day = 0; f.hh = nx.getHours(); f.mm = Math.ceil(nx.getMinutes() / 15) * 15 % 60; } }
        const s = JC.ui.sheet({ title: pre.meet ? 'Airport meet & greet' : 'Reserve a ride', detent: 'large', cls: 'sw-resv', left: { text: 'Cancel' }, right: { text: 'Next', bold: true, onTap: () => { confirm(); return false; } },
          content: (sh) => {
            const at = DAY0() + f.day * 86400e3 + (f.hh * 60 + f.mm) * 60000;
            const airport = f.to === 'airport' || f.from === 'airport' || pre.meet;
            return [
              h('div.sw-sheetpad', h('p.sw-muted', pre.meet ? 'Your driver goes to Arrivals, waits with a name sign, and brings your guests to their destination.' : 'Choose a pickup time up to 30 days ahead. Your driver is confirmed an hour before.')),
              JC.ui.wheel({ cols: [{ items: days, value: f.day }, { items: Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), value: f.hh }, { items: [0, 15, 30, 45].map((m) => ({ label: String(m).padStart(2, '0'), value: m })), value: f.mm }], onChange: (v) => { f.day = v[0]; f.hh = v[1]; f.mm = v[2]; } }),
              JC.ui.list([{ rows: [
                pre.meet ? { icon: { glyph: 'airplane', bg: '#0b4f5c' }, title: 'Meet at', subtitle: placeFull('airport') + ' · Arrivals' }
                  : { icon: { glyph: 'circle.fill', bg: '#30d158' }, title: 'Pickup', subtitle: f.from === 'player-home' ? 'Current location · ' + R7().place('player-home').addr : placeFull(f.from), chevron: true, onTap: () => pickPlace('Pickup', (id) => { f.from = id; sh.render(); }) },
                { icon: { glyph: 'mappin.fill', bg: '#0b4f5c' }, title: pre.meet ? 'Then drive them to' : 'Drop-off', subtitle: f.to ? placeFull(f.to) : 'Choose a destination', chevron: true, onTap: () => pickPlace(pre.meet ? 'Then drive them to' : 'Drop-off', (id) => { f.to = id; sh.render(); }) },
                { icon: { glyph: 'car.fill', bg: TEAL }, title: 'Ride', detail: (TIERS[f.tier] || TIERS.go).name, chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Ride type', actions: ['go', 'comfort', 'xl', 'black'].map((k) => ({ text: TIERS[k].name + ' · ' + TIERS[k].seats + ' seats', onTap: () => { f.tier = k; sh.render(); } })) }) },
                { icon: { glyph: 'person.2.fill', bg: '#5856d6' }, title: 'Who’s riding?', detail: f.riders.length ? f.riders.map((c) => JC.contacts.short(c)).join(' & ') : 'Me', chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Who’s riding?', actions: [{ text: 'Me', onTap: () => { f.riders = []; sh.render(); } }, { text: 'Tonia & Teucer', onTap: () => { f.riders = ['tonia', 'teucer']; sh.render(); } }, { text: 'Zhongli', onTap: () => { f.riders = ['zl']; sh.render(); } }, { text: 'Lumine & Paimon', onTap: () => { f.riders = ['lumine', 'paimon']; sh.render(); } }] }) },
              ] }, { header: 'Note for driver', footer: airport ? 'Flight LA 711 from Snezhnaya lands at 07:40 on Saturday. Drivers track the flight and wait 45 minutes free.' : null, rows: [
                { custom: JC.ui.input({ value: f.note, placeholder: airport ? 'e.g. Waiting at arrivals with a sign' : 'Gate, landmark, anything else', cls: 'form-field sw-field', onInput: (v) => { f.note = v; } }) },
                { custom: h('div.sw-qchips.hscroll', (airport ? ['Waiting at arrivals with a sign', 'Sign: TEUCER & TONIA 🐟', 'Two kids, one big suitcase', 'Please be gentle, they’re tired'] : ['Call when you arrive', 'I’ll be at the gate', 'Quiet ride please']).map((t) => h('span.sw-chip2.tap', { onTap: () => { f.note = f.note && !airport ? f.note : (f.note && f.note !== t ? f.note + ' · ' + t : t); sh.render(); } }, t))) },
              ] }], { cls: 'sw-list' }),
              h('div.sw-resv-sum', JC.icon('calendar', { size: 15 }), ' ' + U.fmtDate(at, 'day') + ' · ' + U.fmtTime(at) + (f.to ? ' · ' + (pre.meet ? 'Arrivals → ' : '') + placeName(f.to) : '')),
            ];
          } });
        function confirm() {
          const at = DAY0() + f.day * 86400e3 + (f.hh * 60 + f.mm) * 60000;
          if (at < JC.time.now() + 30 * 60000) { JC.ui.alert({ title: 'Too Soon', message: 'Reserved rides need at least 30 minutes’ notice. For a ride now, use Where to?', buttons: [{ text: 'OK' }] }); return; }
          if (!f.to) { JC.ui.alert({ title: 'Where To?', message: pre.meet ? 'Choose where the driver should take your guests after the airport.' : 'Choose a drop-off.', buttons: [{ text: 'OK' }] }); return; }
          const meet = !!pre.meet || f.from === 'airport';
          const from = meet ? 'player-home' : f.from;
          const to = meet ? 'airport' : f.to;
          const then = meet ? f.to : null;
          const leg = rideLeg({ from, to, then, stops: [] });
          if (!leg) { JC.ui.alert({ title: 'No Route', message: 'Harbor Ride can’t drive there.', buttons: [{ text: 'OK' }] }); return; }
          const price = fareFor(leg, f.tier, at) + (meet ? 30 : 0);
          JC.ui.alert({ title: meet ? 'Book airport meet & greet?' : 'Reserve this ride?', message: U.fmtDate(at, 'day') + ' at ' + U.fmtTime(at) + '\n' + (meet ? 'Arrivals, ' + placeName('airport') + ' → ' + placeName(then) : placeName(from) + ' → ' + placeName(to)) + '\n' + (TIERS[f.tier] || TIERS.go).name + ' · about ' + M(price) + (meet ? ' (incl. ℳ30 meet & greet)' : '') + '\nCharged to ' + payLabel(st().card) + ' after the trip.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reserve', style: 'default' }] }).then((x) => {
            if (x.index !== 1) return;
            const d = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
            const ride = JC.store.add('rides', { from, to, then, at, t: at, end: null, price, tier: f.tier, km: Math.round(leg.km * 10) / 10, min: Math.round(leg.min), card: st().card, status: 'scheduled', note: f.note.trim(), riders: f.riders.slice(), meet, ref: 'HR-R' + Math.floor(100000 + Math.random() * 899999),
              driver: { name: d[0], car: d[1], plate: d[2], rating: d[3], trips: 3000 + Math.floor(Math.random() * 7000), since: 2016 + Math.floor(Math.random() * 8) } }, { front: true });
            JC.story.act('ride_book', { id: ride.id, from, to, then, at, note: ride.note, tier: f.tier, riders: ride.riders, meet, scheduled: true });
            sms('[Harbor Ride] Ride reserved for ' + U.fmtDate(at, 'day') + ' ' + U.fmtTime(at) + ': ' + (meet ? 'meet & greet at Arrivals, ' + placeName('airport') + ' → ' + placeName(then) : placeName(from) + ' → ' + placeName(to)) + '. Driver: ' + ride.driver.name + ', ' + ride.driver.plate + (ride.note ? '. Note: “' + ride.note + '”' : '') + '.');
            JC.audio.play('success');
            s.close();
            tabs.select('activity', true);
            setTimeout(() => tabs.nav('activity').push(tripPage(ride.id)), 350);
          });
        }
      }
      function airportBooking() {
        const sat = T('+1 07:15');
        const k = Math.round((DAY0() + 0 - DAY0()) / 86400e3);
        void k;
        const day = Math.max(0, Math.round((new Date(sat).setHours(0, 0, 0, 0) - DAY0()) / 86400e3));
        const before = JC.time.now() < sat - 30 * 60000;
        reserve(before ? { meet: true, day, hh: 7, mm: 15, note: 'Waiting at arrivals with a sign', riders: ['tonia', 'teucer'] } : { meet: true });
      }
      function pickPlace(title, cb) {
        let q = '';
        const s = JC.ui.sheet({ title, detent: 'large', left: { text: 'Cancel' }, content: () => {
          const list = h('div');
          const fill = () => { list.innerHTML = ''; list.appendChild(placeList(q, (id) => { s.close(); cb(id); })); };
          fill();
          return [h('div.sw-sheetpad', JC.ui.search({ placeholder: 'Search Liyue Harbor', onInput: (v) => { q = v; fill(); } })), list];
        } });
      }
      function placeList(q, cb) {
        const qq = String(q || '').trim().toLowerCase();
        const ids = R7().ids().filter((id) => { const p = R7().place(id); return p && !p.abroad && !p.offshore && (!qq || (p.name + ' ' + p.addr).toLowerCase().includes(qq)); });
        const first = ['pier7', 'apartment', 'northland', 'wangsheng', 'airport', 'liuli', 'heyu', 'alcor', 'wangshu', 'liyue-grand', 'yujing'];
        ids.sort((a, b) => (first.indexOf(a) < 0 ? 99 : first.indexOf(a)) - (first.indexOf(b) < 0 ? 99 : first.indexOf(b)));
        const far = R7().ids().filter((id) => { const p = R7().place(id); return p && (p.abroad || p.offshore) && qq && (p.name + ' ' + p.addr).toLowerCase().includes(qq); });
        const rows = ids.map((id) => { const p = R7().place(id); return { leading: h('div.sw-recic', JC.icon(id === 'airport' ? 'airplane' : p.water ? 'water.waves' : qq ? 'mappin' : 'clock', { size: 16 })), title: p.short || p.name, subtitle: p.addr + ' · ' + MV().fmtDist(Math.hypot(p.x - MV().HOME[0], p.y - MV().HOME[1])), onTap: () => cb(id) }; })
          .concat(far.map((id) => { const p = R7().place(id); return { leading: h('div.sw-recic', JC.icon(p.abroad ? 'globe' : 'water.waves', { size: 16 })), title: p.short, subtitle: p.abroad ? 'Outside the service area' : 'No road access', onTap: () => JC.ui.alert({ title: 'Can’t Ride There', message: p.abroad ? 'Harbor Ride operates in Liyue only. ' + p.short + ' is a long way north.' : p.short + ' is offshore. Not even a sampan goes out there right now.', buttons: [{ text: 'OK' }] }) }; }));
        if (!rows.length) return JC.ui.empty({ icon: 'magnifyingglass', title: 'No places found', text: 'Try “pier”, “bank” or “airport”.' });
        return JC.ui.list([{ rows }], { cls: 'sw-list' });
      }

      // ═══ BOOKING FLOW (ride now) ═══
      let flow = null;
      function startBooking(o) {
        o = o || {};
        if (active && active.phase !== 'done') { openFlow(); return; }
        const fromId = o.from && R7().place(o.from) && o.from !== 'player-home' ? o.from : null;
        active = { phase: 'search', from: fromId || 'player-home', fromLabel: fromId ? placeName(fromId) : 'Current location', to: o.to || null, tier: o.tier && TIERS[o.tier] ? o.tier : 'go' };
        openFlow();
        if (active.to) toOptions(); else renderPanel();
      }
      function openFlow() {
        if (flow) { flow.el.style.display = ''; render(); return; }
        const el = h('div.sw-flow');
        const map = MV().create(el, { style: 'muted', dark: true, zoom: 60, center: MV().HOME, pois: true, poiBoost: 1.5, poiLabelMinZ: 90, cls: 'sw-map' });
        const panel = h('div.sw-panel');
        const close = h('button.sw-close', { onTap: () => closeFlow(), attrs: { 'aria-label': 'Close' } }, JC.icon('chevron.down', { size: 20, weight: 2.6 }));
        el.append(panel, close);
        body.appendChild(el);
        flow = { el, map, panel, close };
        render();
      }
      function closeFlow(cancelBooking) {
        if (!flow) return;
        if (active && (active.phase === 'search' || active.phase === 'options' || active.phase === 'done' || cancelBooking)) { stopSim(); active = null; JC.os.island.stop('swift-ride'); }
        flow.map.destroy();
        flow.el.remove();
        flow = null;
        refreshTabs();
      }
      function refreshTabs() { ['home', 'activity'].forEach((id) => { const n = tabs.nav(id); if (n && n.top() && n.depth() === 1) n.top().render(); }); }
      function render() { if (!flow || !active) return; renderPanel(); drawMap(); }
      function drawMap() {
        const { map } = flow;
        map.clearPins(); map.clearRoutes();
        const A = active.from === 'player-home' ? MV().HOME : coords(active.from);
        const B = active.to ? coords(active.to) : null;
        map.addPin('pickup', { kind: 'dot', at: A, color: '#30d158', anchor: 'center', label: active.phase === 'search' ? null : 'Pickup' });
        if (B) map.addPin('drop', { kind: 'dot', at: B, color: '#ffffff', square: true, anchor: 'center', label: placeName(active.to) });
        if (active.route) map.setRoute('main', { pts: active.route.pts, color: '#2fd6c6', width: 5.5, progress: active.prog || 0 });
        if (active.approach && active.phase === 'enroute') map.setRoute('approach', { pts: active.approach.pts, color: '#ffffff', width: 3.5, dotted: true });
        if (active.car) map.addPin('car', { kind: 'car', at: active.car.at, rotate: active.car.rot, color: '#2fd6c6', anchor: 'center', z: 8 });
        if (active.phase !== 'trip') map.setUser(MV().HOME);
        const H = body.offsetHeight || 874;
        map.setPadding({ top: 70, bottom: Math.min(H - 240, (flow.panel.offsetHeight || 380) - 20) }, { recenter: true });
        if (active.phase === 'search') map.setView({ cx: MV().HOME[0], cy: MV().HOME[1], z: 90 }, { animate: true });
        else if (active.route && (active.phase === 'options' || active.phase === 'matching')) map.fit(active.route.pts, { margin: 50, maxZoom: 110 });
      }
      function renderPanel() {
        const P = flow.panel;
        P.innerHTML = '';
        const ph = active.phase;
        if (ph === 'search') P.appendChild(searchPanel());
        else if (ph === 'options') P.appendChild(optionsPanel());
        else if (ph === 'matching') P.appendChild(matchingPanel());
        else if (ph === 'enroute' || ph === 'arrived' || ph === 'trip') P.appendChild(driverPanel());
        else if (ph === 'done') P.appendChild(donePanel());
        flow.close.style.display = ph === 'done' ? 'none' : '';
      }
      function searchPanel() {
        let q = '';
        const list = h('div.sw-res');
        const fill = () => { list.innerHTML = ''; list.appendChild(placeList(q, (id) => { active.to = id; JC.kb.hide(); toOptions(); })); };
        const input = JC.ui.input({ placeholder: 'Where to?', enterkey: 'search', cap: 'none', cls: 'sw-in', onInput: (v) => { q = v; fill(); }, onSubmit: () => { const first = list.querySelector('.row'); if (first) first.click(); } });
        fill();
        setTimeout(() => input.focus(), 300);
        return h('div.sw-search',
          h('div.sw-ph', h('div.sw-pt', 'Plan your ride'), h('span.sw-now.dark', { onTap: () => { closeFlow(true); reserve(); } }, JC.icon('clock', { size: 13 }), 'Pickup now', JC.icon('chevron.down', { size: 11, weight: 3 }))),
          h('div.sw-fields', h('div.sw-fdots', h('span.sw-dot.g'), h('span.sw-fline'), h('span.sw-dot.b')),
            h('div.sw-fcol', h('div.sw-f.from', { onTap: () => pickPlace('Pickup', (id) => { active.from = id; active.fromLabel = id === 'player-home' ? 'Current location' : placeName(id); renderPanel(); drawMap(); }) }, active.fromLabel), h('div.sw-f.to', input))),
          list);
      }
      function toOptions() {
        active.phase = 'options';
        const A = active.from === 'player-home' ? { x: MV().HOME[0], y: MV().HOME[1], name: 'Current location' } : R7().place(active.from);
        const B = R7().place(active.to);
        let rt = null;
        try { rt = A && B ? MV().route(A, B, 'drive') : null; } catch (e) { rt = null; }
        active.route = rt && rt.pts ? rt : R7().leg(active.from, active.to);
        if (!active.route) { JC.ui.alert({ title: 'No Route', message: 'Harbor Ride can’t find a route there.', buttons: [{ text: 'OK' }] }); active.phase = 'search'; }
        if (active.tier === 'sampan' && !(isWater(active.from) && isWater(active.to))) active.tier = 'go';
        if (!flow) openFlow(); else render();
      }
      const priceFor = (tier) => fareFor(active.route, tier);
      function optionsPanel() {
        const r = active.route;
        const now = JC.time.date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const pay = payOf(st().card);
        const waterOK = isWater(active.from) && isWater(active.to) && !(flag('osial_sent') && JC.time.now() >= T('+2 23:00'));
        return h('div.sw-opts',
          h('div.sw-ph', h('div.sw-pt', 'Choose a ride'), h('span.sw-trip-meta', MV().fmtDist(r.km) + ' · ' + MV().fmtMin(r.min))),
          r.km > 12 ? h('div.sw-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' Long trip. Drivers may decline trips over 12 km at night.') : null,
          h('div.sw-tiers', Object.keys(TIERS).map((k) => {
            const Tt = TIERS[k];
            const off = Tt.water && !waterOK;
            return h('div.sw-tier', { class: { on: active.tier === k, off }, onTap: () => { if (off) { JC.ui.toast(flag('osial_sent') ? 'Sampans are suspended tonight' : 'Sampan: both ends must be on the waterfront', { icon: 'water.waves' }); return; } active.tier = k; renderPanel(); } },
              h('div.sw-tier-ic', { class: 't-' + k }, JC.icon(Tt.icon, { size: 24 })),
              h('div.sw-tier-m', h('div.sw-tier-n', Tt.name, h('span.sw-seats', JC.icon('person.fill', { size: 11 }), Tt.seats)), h('div.sw-tier-s', off ? 'Not available for this trip' : MV().fmtClockMin(nowMin + Tt.eta + r.min) + ' drop-off · ' + Tt.eta + ' min away'), active.tier === k ? h('div.sw-tier-d', Tt.desc) : null),
              h('div.sw-tier-p', off ? '—' : M(priceFor(k))));
          })),
          h('div.sw-payrow',
            h('div.sw-pay', { onTap: () => JC.ui.actionSheet({ title: 'Pay with', actions: PAYS.map((c) => ({ text: c.name + (c.id === 'cash' ? ' (' + cashText() + ')' : ' •• ' + c.last) + (c.bank && JC.bank.frozen() ? ' — frozen' : ''), onTap: () => { st().card = c.id; save(); renderPanel(); } })) }) }, h('span.sw-cardic.mini', { style: { background: pay.color } }), h('span.sw-pay-t', pay.short + (pay.id === 'cash' ? ' ' + cashText() : ' •• ' + pay.last)), JC.icon('chevron.down', { size: 11, weight: 3 })),
            h('div.sw-pay', { onTap: () => promosSheet() }, JC.icon('tag.fill', { size: 14 }), h('span', st().promo && st().promoLeft > 0 ? '−11%' : 'Promo'))),
          JC.ui.btn({ text: 'Choose ' + TIERS[active.tier].name, kind: 'filled', size: 'l', cls: 'sw-cta', onTap: () => request() }));
      }
      function request() {
        const price = priceFor(active.tier);
        const chk = canPay(price);
        if (!chk.ok) {
          if (st().card === 'cash') JC.ui.alert({ title: 'Not Enough Harbor Cash', message: 'Your Harbor Cash balance is ' + cashText() + '. Add funds or pick a card.', buttons: [{ text: 'OK' }] });
          else { JC.bank.charge({ card: st().card, merchant: 'Harbor Ride', amount: price, app: 'swift', quiet: true }); declined(chk.reason, 'Pick another payment method to request a ride.'); }
          return;
        }
        active.phase = 'matching';
        active.price = price;
        render();
        JC.audio.play('send');
        JC.story.act('ride_book', { from: active.from, to: active.to, at: JC.time.now(), note: '', tier: active.tier, scheduled: false });
        const R = active;
        setTimeout(() => { if (active !== R || R.phase !== 'matching') return; assignDriver(); }, 3600);
      }
      function matchingPanel() {
        return h('div.sw-match', h('div.sw-radar', h('span'), h('span'), h('span'), JC.icon(active.tier === 'sampan' ? 'water.waves' : 'car.fill', { size: 26 })), h('div.sw-pt', active.tier === 'sampan' ? 'Finding a boatman…' : 'Finding your driver…'), h('div.sw-muted', TIERS[active.tier].name + ' · ' + M(active.price) + ' · to ' + placeName(active.to)), h('div.sw-bar', h('div')), JC.ui.btn({ text: 'Cancel request', kind: 'gray', size: 'l', onTap: () => { active.phase = 'options'; render(); } }));
      }
      function assignDriver() {
        const pool = active.tier === 'sampan' ? BOATMEN : DRIVERS;
        const d = pool[Math.floor(Math.random() * pool.length)];
        active.driver = { name: d[0], car: d[1], plate: d[2], rating: d[3], trips: 2000 + Math.floor(Math.random() * 7000), since: 2014 + Math.floor(Math.random() * 10) };
        if (active.tier === 'xl') active.driver.car = 'Jueyun Voyager · Silver';
        if (active.tier === 'black') active.driver.car = 'Qixing Tianquan S · Black';
        const P0 = active.from === 'player-home' ? MV().HOME : coords(active.from);
        const start = [P0[0] + 1.4, P0[1] - 1.0];
        let approach = null;
        try { approach = MV().route({ x: start[0], y: start[1], name: 'driver' }, { x: P0[0], y: P0[1], name: 'pickup' }, 'drive'); } catch (e) { approach = null; }
        active.approach = approach;
        active.phase = 'enroute';
        active.car = { at: start, rot: 0 };
        active.eta = TIERS[active.tier].eta;
        JC.audio.play('receive');
        JC.notify.push({ app: 'swift', title: 'Your ' + (active.tier === 'sampan' ? 'boat' : 'driver') + ' is on the way', body: active.driver.name + ' · ' + active.driver.car + ' · ' + active.driver.plate, open: { app: 'swift' } });
        islandStart();
        render();
        flow && flow.map.fit([start, P0], { margin: 80, maxZoom: 120 });
        simulate(approach, 12, () => { active.phase = 'arrived'; active.eta = 0; JC.audio.play('tink'); JC.notify.push({ app: 'swift', title: 'Your driver has arrived', body: active.driver.name + ' is waiting at the pickup point. ' + active.driver.plate, open: { app: 'swift' } }); islandUpdate(); if (flow) renderPanel(); setTimeout(startTrip, 5000); });
      }
      let simT = null;
      function stopSim() { cancelAnimationFrame(simT); simT = null; }
      function simulate(route, secs, done) {
        stopSim();
        if (!route || !route.pts) { setTimeout(done, secs * 400); return; }
        const t0 = performance.now();
        const total = route.km;
        const R = active;
        const step = () => {
          if (active !== R) return;
          const k = Math.min(1, (performance.now() - t0) / (secs * 1000));
          const p = MV().along(route.pts, total * k);
          R.car = { at: [p.x, p.y], rot: (p.a * 180) / Math.PI + 90 };
          R.prog = R.phase === 'trip' ? k : 0;
          R.eta = Math.max(0, Math.round((R.phase === 'trip' ? route.min : TIERS[R.tier].eta) * (1 - k)));
          if (flow) {
            flow.map.movePin('car', R.car.at, R.car.rot);
            if (R.phase === 'trip') { flow.map.setUser(R.car.at); flow.map.setRoute('main', { pts: R.route.pts, color: '#2fd6c6', width: 5.5, progress: k }); }
            const e = flow.panel.querySelector('.sw-eta-n');
            if (e) e.textContent = R.phase === 'trip' ? clockIn(R.eta) : (R.eta <= 1 ? '1' : R.eta);
          }
          if ((performance.now() - t0) % 900 < 20) islandUpdate();
          if (k >= 1) { done(); return; }
          simT = requestAnimationFrame(step);
        };
        simT = requestAnimationFrame(step);
      }
      const clockIn = (min) => { const d = JC.time.date(); return MV().fmtClockMin(d.getHours() * 60 + d.getMinutes() + min); };
      function startTrip() {
        if (!active || active.phase !== 'arrived') return;
        active.phase = 'trip';
        active.tripStart = JC.time.now();
        sms('[Harbor Ride] ' + active.driver.name + ' (' + active.driver.plate + ') picked you up at ' + (active.from === 'player-home' ? R7().place('player-home').addr : placeName(active.from)) + '. Trip started.');
        JC.notify.push({ app: 'swift', title: 'Trip started', body: 'On the way to ' + placeName(active.to) + '. Share your trip status any time.', open: { app: 'swift' } });
        if (flow) { renderPanel(); drawMap(); flow.map.fit(active.route.pts, { margin: 60, maxZoom: 100 }); }
        islandUpdate();
        simulate(active.route, Math.max(16, Math.min(70, active.route.min * 1.1)), finishTrip);
      }
      function driverPanel() {
        const d = active.driver;
        const ph = active.phase;
        const head = ph === 'enroute' ? ['Meet at the pickup point', h('div.sw-eta', h('b.sw-eta-n', String(active.eta || 1)), h('span', 'min'))]
          : ph === 'arrived' ? ['Your ' + (active.tier === 'sampan' ? 'boat' : 'driver') + ' has arrived', h('div.sw-eta.arr', h('b', 'Now'))]
            : ['Heading to ' + placeName(active.to), h('div.sw-eta.trip', h('small', 'Arrive'), h('b.sw-eta-n', clockIn(active.eta || active.route.min)))];
        return h('div.sw-drvp',
          h('div.sw-ph', h('div.sw-pt', head[0]), head[1]),
          ph === 'arrived' ? h('div.sw-hint', JC.icon('location.fill', { size: 13 }), ' ' + carDesc(d.car) + ' · ' + d.plate + ' — waiting at ' + (active.from === 'player-home' ? R7().place('player-home').addr : placeName(active.from))) : null,
          h('div.sw-dcard',
            h('div.sw-dcard-l', JC.ui.avatar({ initials: initials(d.name), grad: ['#2f6f73', '#0b4f5c'] }, 52), h('div', h('div.sw-dn', d.name), h('div.sw-ds', '★ ' + d.rating.toFixed(2) + ' · ' + d.trips.toLocaleString('en-US') + ' trips'))),
            h('div.sw-dcard-r', h('div.sw-plate.sm', d.plate), h('div.sw-ds', d.car))),
          h('div.sw-dacts',
            h('div.sw-dact', { onTap: () => callDriver() }, JC.icon('phone.fill', { size: 20 }), h('span', 'Call')),
            h('div.sw-dact', { onTap: () => messageDriver() }, JC.icon('message.fill', { size: 20 }), h('span', 'Message')),
            h('div.sw-dact', { onTap: () => JC.ui.share({ title: 'My Harbor Ride trip', subtitle: 'Live trip status', icon: 'car.fill', payload: { kind: 'text', text: 'I’m in a Harbor Ride to ' + placeName(active.to) + ' — ' + d.car + ', ' + d.plate + '. Follow my trip: harbor.ride/t/' + Math.random().toString(36).slice(2, 8) } }) }, JC.icon('square.and.arrow.up', { size: 20 }), h('span', 'Share')),
            h('div.sw-dact', { onTap: () => safetySheet() }, JC.icon('shield.fill', { size: 20 }), h('span', 'Safety'))),
          h('div.sw-tripline', h('span.sw-dot.g'), h('span', active.fromLabel), h('span.sw-arrow', '→'), h('span.sw-dot.b'), h('span', placeName(active.to)), h('b', M(active.price))),
          ph !== 'trip' ? h('div.sw-cancel.tap', { onTap: () => cancelRide() }, 'Cancel ride') : h('div.sw-cancel.muted', 'Trip in progress · ' + payOf(st().card).short + ' will be charged'));
      }
      function carDesc(car) { const [model, col] = String(car).split(' · '); return ((col || '').replace(/\s*\(.*\)/, '') + ' ' + (model || '')).trim(); }
      function callDriver() {
        const d = active.driver;
        MV().fakeCall({ name: d.name, num: 'Harbor Ride private line', avatar: { initials: initials(d.name), grad: ['#2f6f73', '#0b4f5c'] }, lines: active.phase === 'enroute' ? ['Hello? I’m about ' + Math.max(1, active.eta || 2) + ' minutes away.', 'I see you on the map. Wait by the steps, I’ll flash my lights.'] : active.phase === 'arrived' ? ['I’m here! ' + carDesc(d.car) + ', plate ending ' + d.plate.slice(-3) + '.', 'Take your time.'] : ['…You’re in my car. You can just talk to me.', '(the driver turns around and waves)'] });
      }
      function messageDriver() {
        const d = active.driver;
        const log = [];
        const s = JC.ui.sheet({ title: d.name, detent: 'large', left: { text: 'Done' }, cls: 'sw-chat',
          content: () => [h('div.sw-msgs', log.length ? log.map((m) => h('div.sw-msg', { class: { me: m.me } }, m.t)) : h('div.sw-muted.center', 'Messages are private and go through Harbor Ride.')),
            h('div.sw-qr', ['I’m on my way down', 'Where are you?', 'I have a fishing rod', 'Please wait 2 minutes'].map((t) => h('span.tap', { onTap: () => send(t) }, t))),
            h('div.sw-msgin', (() => { const inp = JC.ui.input({ placeholder: 'Message your driver', enterkey: 'send', cls: 'sw-in', onSubmit: (v) => { if (v.trim()) { send(v.trim()); inp.value = ''; } } }); return inp; })())] });
        function send(t) {
          log.push({ me: true, t }); s.render(); JC.audio.play('send');
          const reply = /rod/i.test(t) ? 'No problem, it goes in the back. Just don’t bring the fish 😄' : /where/i.test(t) ? 'Coming down the hill now. Teal light on the roof.' : /wait/i.test(t) ? 'Ok, no rush.' : 'Ok 👍';
          setTimeout(() => { log.push({ me: false, t: reply }); if (!s.closed) s.render(); JC.audio.play('receive'); }, 1400);
        }
      }
      function safetySheet() {
        JC.ui.sheet({ title: 'Safety toolkit', detent: 'medium', left: { text: 'Close' }, content: () => [JC.ui.list([{ rows: [
          { icon: { glyph: 'square.and.arrow.up', bg: '#0a84ff' }, title: 'Share my trip', onTap: () => JC.ui.share({ title: 'My Harbor Ride trip', subtitle: 'Live status', icon: 'car.fill', payload: { kind: 'text', text: 'Following my Harbor Ride to ' + placeName(active.to) } }) },
          { icon: { glyph: 'shield.fill', bg: '#30d158' }, title: 'RideCheck', detail: st().safety.check ? 'On' : 'Off' },
          { icon: { glyph: 'sos', bg: '#ff3b30' }, title: 'Emergency assistance', subtitle: 'Calls the Millelith (110) and shares your location', onTap: () => JC.ui.alert({ title: 'Call 110?', message: 'Only call in a real emergency.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', style: 'destructive', onTap: () => JC.ui.toast('Call cancelled — not an emergency') }] }) },
        ] }])] });
      }
      function cancelRide() {
        const fee = active.phase === 'arrived' ? 12 : 0;
        JC.ui.alert({ title: 'Cancel your ride?', message: fee ? 'Your driver is already waiting. A ' + M(fee) + ' cancellation fee applies.' : 'Your driver is on the way. You won’t be charged if you cancel now.', buttons: [{ text: 'Keep Ride', style: 'cancel' }, { text: 'Cancel Ride', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          if (fee) charge({ merchant: 'Harbor Ride — Cancellation fee', amount: fee, note: 'Driver was waiting' });
          JC.store.add('rides', { from: active.from, to: active.to, t: JC.time.now(), end: null, price: fee, tier: active.tier, card: st().card, status: 'cancelled', driver: active.driver, km: 0 }, { front: true });
          stopSim();
          active = null;
          JC.os.island.stop('swift-ride');
          closeFlow(true);
          JC.ui.toast('Ride cancelled', { icon: 'xmark' });
        });
      }
      function finishTrip() {
        const R = active;
        if (!R) return;
        R.phase = 'done';
        const ride = JC.store.add('rides', { from: R.from, to: R.to, t: R.tripStart || JC.time.now(), end: JC.time.now() + Math.round(R.route.min * 60000), price: R.price, tier: R.tier, km: Math.round(R.route.km * 10) / 10, min: Math.round(R.route.min), card: st().card, business: st().card === 'corp', status: 'completed', driver: R.driver, rated: 0, ref: 'HR-' + Math.floor(100000 + Math.random() * 899999) }, { front: true });
        R.rideId = ride.id;
        const paid = charge({ merchant: 'Harbor Ride', amount: R.price, note: placeName(R.from) + ' → ' + placeName(R.to), place: R.from, after: 'The fare is still owed to Harbor Ride.' });
        if (paid && !paid.ok) JC.store.update('rides', ride.id, { status: 'unpaid' });
        if (st().promo === 'TARTAGLIA11' && st().promoLeft > 0) { st().promoLeft -= 1; save(); }
        sms('[Harbor Ride] Trip complete · ' + placeName(R.from) + ' → ' + placeName(R.to) + ' · ' + Math.max(1, Math.round(R.route.min)) + ' min · ' + M(R.price) + '. Left something behind? Use Report a Lost Item in the app.');
        JC.audio.play('success');
        JC.notify.push({ app: 'swift', title: 'You’ve arrived', body: 'Thanks for riding with ' + R.driver.name + '. ' + M(R.price) + ' charged to ' + payOf(st().card).name + '.', open: { app: 'swift', intent: { id: ride.id } } });
        JC.os.island.stop('swift-ride');
        if (flow) renderPanel(); else openFlow();
      }
      function donePanel() {
        const R = active;
        let stars = 5, tip = 0;
        const box = h('div.sw-done');
        const draw = () => {
          box.innerHTML = '';
          box.append(h('div.sw-done-ic', JC.icon('flag.checkered', { size: 30 })), h('div.sw-pt', 'You’ve arrived at ' + placeName(R.to)), h('div.sw-muted', M(R.price) + ' · ' + MV().fmtDist(R.route.km) + ' · ' + R.driver.name),
            h('div.sw-stars', [1, 2, 3, 4, 5].map((n) => h('span.tap', { class: { on: n <= stars }, onTap: () => { stars = n; draw(); } }, '★'))),
            h('div.sw-tips', [0, 5, 10, 20].map((t) => h('span.sw-tip.tap', { class: { on: tip === t }, onTap: () => { tip = t; draw(); } }, t ? M(t) : 'No tip'))),
            JC.ui.btn({ text: 'Done', kind: 'filled', size: 'l', cls: 'sw-cta', onTap: () => {
              JC.store.update('rides', R.rideId, { rated: stars, tip });
              if (tip) charge({ merchant: 'Harbor Ride — Tip', amount: tip, note: 'Tip for ' + R.driver.name });
              const rr = JC.store.get('rides', R.rideId);
              active = null;
              closeFlow();
              tabs.select('activity', true);
              if (rr) { tabs.nav('activity').push(tripPage(rr.id)); setTimeout(() => receipt(rr), 500); }
            } }));
        };
        draw();
        return box;
      }
      function flowStatus() {
        if (!active) return '';
        return { search: 'Choosing destination', options: 'Choosing a ride', matching: 'Finding your driver…', enroute: active.driver ? active.driver.name + ' arriving in ' + Math.max(1, active.eta || 1) + ' min' : '', arrived: 'Your driver has arrived', trip: 'On the way · arrive ' + clockIn(active.eta || 0), done: 'Arrived' }[active.phase] || '';
      }
      function islandStart() {
        JC.os.island.start('swift-ride', {
          priority: 2, width: 220,
          compact: () => ({ left: h('span.sw-isl-l', JC.icon(active && active.tier === 'sampan' ? 'water.waves' : 'car.fill', { size: 17 })), right: h('span.sw-isl-r', !active ? '' : active.phase === 'arrived' ? 'Here' : Math.max(1, active.eta || 1) + ' min') }),
          expanded: (el) => {
            if (!active) return;
            const k = active.phase === 'trip' ? (active.prog || 0) : active.phase === 'arrived' ? 1 : 1 - (active.eta || 0) / Math.max(1, TIERS[active.tier].eta);
            el.append(h('div.sw-isl-x', h('div.sw-isl-top', h('span.sw-isl-l', JC.icon('car.fill', { size: 22 })), h('div', h('b', flowStatus()), h('span', active.driver ? active.driver.car + ' · ' + active.driver.plate : ''))), h('div.sw-isl-bar', h('div', { style: { width: Math.round(k * 100) + '%' } }))));
          },
          onTap: () => { JC.os.open('swift'); setTimeout(openFlow, 200); },
        });
      }
      function islandUpdate() { if (active && JC.os.island.has('swift-ride')) JC.os.island.update('swift-ride'); }

      // ═══ intents ═══
      function openPages(tabId, make, tries) {
        tabs.select(tabId);
        const n = tabs.nav(tabId);
        while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ }
        if (n.depth() > 1) { if ((tries || 0) < 12) setTimeout(() => openPages(tabId, make, (tries || 0) + 1), 120); return; }
        const pages = make();
        pages.forEach((pg, i) => n.push(pg, { instant: i < pages.length - 1 }));
      }
      function handle(it) {
        if (!it) return;
        const away = () => { if (flow && (!active || active.phase === 'search' || active.phase === 'options' || active.phase === 'done')) closeFlow(); else if (flow) flow.el.style.display = 'none'; };
        if (it.report) {
          const r = JC.store.get('rides', it.ride || 'ride_1016_2258') || JC.store.all('rides')[0];
          if (r) { away(); openPages('activity', () => [tripPage(r.id), helpPage(r), lostIntro(r)]); }
          return;
        }
        if (it.id) { const r = JC.store.get('rides', it.id); if (r) { away(); openPages('activity', () => [tripPage(r.id)]); } return; }
        if (it.reserve) { tabs.select('home'); if (it.reserve === 'airport') airportBooking(); else reserve(); return; }
        if (it.to || it.tier) { tabs.select('home'); startBooking({ to: it.to, tier: it.tier, from: it.from }); }
      }
      tickScheduled();
      setTimeout(() => handle(intent0), 50);
      return {
        intent: handle,
        show() { if (flow) flow.map.resize(); tickScheduled(); },
        back() { const ov = win.overlays && win.overlays.querySelectorAll('.ctx-back, .pmenu-back, .sheet-back'); if (ov && ov.length) { ov[ov.length - 1].click(); return true; } if (flow && flow.el.style.display !== 'none') { if (active && active.phase === 'options') { active.phase = 'search'; active.route = null; render(); return true; } closeFlow(); return true; } return false; },
        destroy() { stopSim(); offs.forEach((f) => f()); JC.os.island.stop('swift-ride'); if (flow) flow.map.destroy(); },
      };
    },
  });
})();
