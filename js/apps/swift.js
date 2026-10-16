/* Swift Ride — fictional ride-hailing (black + yellow). Home / Services / Activity / Account; booking flow
   (where to → ride options → matching → driver card → Dynamic Island ETA → trip → rating → receipt),
   trip history with route maps and receipts, Help → Report a lost item (act ride_report_lost).
   Acts: ride_view {id}, ride_report_lost {}. Intents: {id} {to, tier} {report}. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;

  JC.store.seed('rides', [
    { id: 'ride_tonight', from: 'koi-tower', to: 'golden-peony', t: '+0 23:21', end: '+0 23:36', price: 64, tier: 'go', km: 6.8, min: 15, card: 'ycb', status: 'completed', rated: 0, ref: 'SR-1016-2321', fare: { base: 10, dist: 37.4, time: 10.6, night: 6 },
      driver: { name: 'Master Wu Lihua', car: 'BYD Han EV · Grey', plate: '云A·9X277', rating: 4.97, trips: 8214, since: 2019 } },
    { id: 'ride_oct8', from: 'lotus-pier', to: 'yunmeng-station', t: '-8 06:41', end: '-8 06:58', price: 41, tier: 'go', km: 9.4, card: 'ycb', status: 'completed', rated: 5,
      driver: { name: 'Master Zhao Peng', car: 'Geely Galaxy E8 · White', plate: '云Y·27L84', rating: 4.93, trips: 5120, since: 2021 } },
    { id: 'ride_sep23', from: 'lanling-south', to: 'koi-residences', t: '2026-09-23 21:56', end: '2026-09-23 22:14', price: 38, tier: 'go', km: 8.1, card: 'ycb', status: 'completed', rated: 4,
      driver: { name: 'Master Lin Xiaoyu', car: 'Toyama Camry · Silver', plate: '云A·5QK02', rating: 4.88, trips: 3302, since: 2022 } },
    { id: 'ride_wedding', from: 'cloud-recesses', to: 'gusu-north', t: '2025-05-20 15:08', end: '2025-05-20 15:41', price: 86, tier: 'comfort', km: 21.4, card: 'ycb', status: 'completed', rated: 5, note: 'Left before the toasts.',
      driver: { name: 'Master Lan Yi', car: 'Hongqi E-QM5 · Grey', plate: '苏E·88A31', rating: 4.99, trips: 9050, since: 2018 } },
    { id: 'ride_guanyin', from: 'guanyin-temple', to: 'lp-residence', t: '2024-06-21 23:44', end: '2024-06-22 00:13', price: 92, tier: 'go', km: 34.8, card: 'ycb', status: 'completed', rated: 0,
      driver: { name: 'Master Qian Hong', car: 'BYD Qin · Blue', plate: '云Y·81C55', rating: 4.81, trips: 2210, since: 2020 } },
    { id: 'ride_reunion', from: 'laoma-hotpot', to: 'cr-guesthouse', t: '2024-04-13 22:46', end: '2024-04-13 23:19', price: 58, tier: 'go', km: 20.2, card: 'ycb', status: 'completed', rated: 5,
      driver: { name: 'Master Su Ming', car: 'Wuling Starlight · White', plate: '苏E·3P9L1', rating: 4.9, trips: 6800, since: 2017 } },
  ]);

  const TIERS = {
    go: { name: 'Swift Go', seats: 4, desc: 'Affordable, everyday rides', eta: 4, icon: 'car.fill' },
    comfort: { name: 'Comfort', seats: 4, desc: 'Newer cars, extra legroom', eta: 6, icon: 'car.fill' },
    xl: { name: 'Swift XL', seats: 6, desc: 'Rides for groups up to 6', eta: 9, icon: 'car.fill' },
    pet: { name: 'Swift Pet', seats: 4, desc: 'For very large dogs. Seat covers included.', eta: 11, icon: 'pawprint.fill' },
    black: { name: 'Black', seats: 4, desc: 'Premium rides in luxury cars', eta: 7, icon: 'car.fill' },
  };
  const DRIVERS = [
    ['Master Chen Jie', 'BYD Seal · Midnight Blue', '云A·7H3K9', 4.95], ['Master Fang Rui', 'Xpeng P7 · White', '云A·2M8D4', 4.91], ['Master Guo Lan', 'Zeekr 001 · Grey', '云A·6T1V8', 4.98],
    ['Master He Yong', 'Geely Preface · Black', '云A·9B2N5', 4.87], ['Master Kong Wei', 'Nio ET5 · Silver', '云A·4R7P1', 4.93], ['Master Bai Xue', 'Li Auto L7 · Green', '云A·3C6F2', 4.96],
  ];
  const CARDS = [{ id: 'ycb', name: 'Yunmeng Commercial Bank', last: '4417', color: '#1c1c1e' }, { id: 'ymj', name: 'YMJ Corporate', last: '1992', color: '#5b3fa6' }, { id: 'cash', name: 'Swift Cash', last: '¥120.50', color: '#ffd60a' }];
  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    d.apps.swift = Object.assign({ card: 'ycb', saved: { home: 'lp-residence', work: 'lotus-pier' }, safety: { check: true, pin: false, share: true }, notif: { trips: true, promos: false }, promo: null, reports: [] }, d.apps.swift || {});
    return d.apps.swift;
  }
  const save = () => JC.state.save();
  const SUPPORT = '+86 555 0101 8888';
  function callSupport() {
    if (JC.callui && JC.callui.dialNumber) { JC.callui.dialNumber(SUPPORT); return; }
    MV().fakeCall({ name: 'Swift Ride Customer Care', num: SUPPORT, glyph: 'questionmark.circle', lines: ['Thank you for calling Swift Ride. To report a lost item, please use Report a Lost Item in the app — it reaches your driver fastest.'] });
  }
  const placeName = (id) => { const p = MV().place(id); return p ? (p.short || p.name) : String(id || '—'); };
  const fmtY = (n) => '¥' + Number(n).toFixed(2);
  const ink = () => (JC.os && JC.os.dark ? '#ffd60a' : '#111214');
  const ink2 = () => (JC.os && JC.os.dark ? '#f2f2f7' : '#111214');

  JC.app({
    id: 'swift',
    name: 'Swift Ride',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-swift');
      let active = null; // current booking
      const tabs = JC.ui.tabs(body, {
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'services', title: 'Services', icon: 'square.grid.2x2.fill', root: () => servicesPage() },
          { id: 'activity', title: 'Activity', icon: 'list.bullet', root: () => activityPage() },
          { id: 'account', title: 'Account', icon: 'person.crop.circle', root: () => accountPage() },
        ],
        active: 'home',
      });

      // ═══ HOME ═══
      function homePage() {
        return JC.ui.page({
          navbar: false, cls: 'sw-home',
          content: () => {
            const S = st();
            const recent = [];
            JC.store.all('rides').slice().sort((a, b) => b.t - a.t).forEach((r) => { if (!recent.includes(r.to) && recent.length < 4) recent.push(r.to); });
            return [
              h('div.sw-hero',
                h('div.sw-top', h('div.sw-logo', 'Swift'), h('div.sw-av', { onTap: () => tabs.select('account', true) }, JC.ui.avatar('me', 36))),
                h('div.sw-where', { onTap: () => startBooking() }, JC.icon('magnifyingglass', { size: 20, weight: 2.4 }), h('span.sw-where-t', 'Where to?'), h('span.sw-now', { onTap: (e) => { e.stopPropagation(); reserve(); } }, JC.icon('clock.fill', { size: 14 }), 'Now', JC.icon('chevron.down', { size: 11, weight: 3 }))),
                h('div.sw-saved', [['home', 'house.fill', 'Home'], ['work', 'briefcase.fill', 'Work']].map(([k, g, t]) => h('div.sw-chip', { onTap: () => startBooking({ to: S.saved[k] }) }, JC.icon(g, { size: 15 }), h('span', t))), h('div.sw-chip', { onTap: () => startBooking({ to: 'golden-peony' }) }, JC.icon('bed.double.fill', { size: 15 }), h('span', 'Hotel')))),
              h('div.sw-sec', JC.ui.list([{ rows: recent.map((id) => { const p = MV().place(id); return p ? { leading: h('div.sw-recic', JC.icon('clock.fill', { size: 16 })), title: p.short || p.name, subtitle: p.addr || p.city, onTap: () => startBooking({ to: id }) } : null; }) }], { cls: 'sw-list' })),
              h('div.sw-sec', h('div.sw-h', 'Suggestions', h('span.tap', { onTap: () => tabs.select('services', true) }, 'See all')),
                h('div.sw-sugg', [['go', 'Ride', 'car.fill'], ['reserve', 'Reserve', 'calendar'], ['pet', 'Pet', 'pawprint.fill'], ['xl', 'XL', 'person.2.fill']].map(([k, t, g]) => h('div.sw-tile', { onTap: () => (k === 'reserve' ? reserve() : startBooking({ tier: k })) }, h('div.sw-tile-ic', JC.icon(g, { size: 26 })), h('span', t))))),
              h('div.sw-sec', h('div.sw-h', 'Ways to save'), h('div.sw-promos.hscroll',
                promo('Night Owl Pass', '10% off rides after 11 PM. You’re up anyway.', '#1c1c1e', () => promoSheet('NIGHTOWL')),
                promo('Swift Pet is here', 'Room for very large dogs, now in Lanling.', '#ff9f0a', () => startBooking({ tier: 'pet' })),
                promo('Refer a friend', 'Give ¥20, get ¥20. Jiang Cheng has referred nobody.', '#30b0c7', () => JC.ui.share({ title: 'Swift Ride — ¥20 off your first ride', subtitle: 'Invite code JIANGC88', icon: 'car.fill', payload: { kind: 'text', text: 'Get ¥20 off your first Swift Ride with code JIANGC88.' } })))),
              h('div.sw-sec', h('div.sw-h', 'Around you'), h('div.sw-mapcard', { onTap: () => startBooking() }, MV().thumb('player-home', { w: 370, h: 150, zoom: 26, style: 'muted', marker: false, center: [MV().HOME[0] - 0.6, MV().HOME[1] + 0.4], dots: [[1.1, -0.7], [-1.9, 0.9], [-0.6, -1.3], [2.2, 1.0], [-2.8, -0.2], [0.4, 1.5]].map(([dx, dy]) => ({ at: [MV().HOME[0] + dx, MV().HOME[1] + dy], color: '#ffc800', r: 5 })).concat([{ at: MV().HOME, color: '#0a84ff', r: 7 }]) }), h('div.sw-mapcap', JC.icon('location.fill', { size: 13 }), ' Jinxing Road 27, Lanling · 6 cars nearby'))),
              h('div.sw-foot', 'Swift Ride · Lanling · ', h('span.tap', { onTap: () => JC.os.open('safari', { url: 'https://help.swiftride.lanling/lost-items' }) }, 'Help Center')),
            ];
          },
        });
      }
      function promo(t, s, c, fn) { return h('div.sw-promo', { style: { '--c': c }, onTap: fn }, h('b', t), h('span', s), h('span.sw-promo-go', 'Learn more ›')); }
      function promoSheet(code) {
        JC.ui.sheet({ title: 'Night Owl Pass', detent: 'medium', left: { text: 'Close' }, content: () => [h('div.sw-sheetpad', h('div.sw-big', '10% off'), h('p', 'Rides that start between 23:00 and 05:00 are 10% off for Night Owl Pass members. Applies automatically.'), JC.ui.btn({ text: st().promo === code ? 'Applied ✓' : 'Apply to my account', kind: 'filled', size: 'l', onTap: () => { st().promo = code; save(); JC.ui.toast('Night Owl Pass applied', { icon: 'checkmark' }); } }))] });
      }
      function reserve() {
        let when = [1, 7, 30];
        const s = JC.ui.sheet({ title: 'Reserve a ride', detent: 'medium', left: { text: 'Cancel' }, right: { text: 'Next', onTap: () => { startBooking({ reserve: when }); } },
          content: () => [h('div.sw-sheetpad', h('p.sw-muted', 'Choose a pickup time up to 30 days ahead. Your driver is confirmed an hour before.')), JC.ui.wheel({ cols: [{ items: [{ label: 'Tomorrow', value: 1 }, { label: 'Sun 18 Oct', value: 2 }, { label: 'Mon 19 Oct', value: 3 }], value: 1 }, { items: Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), value: 7 }, { items: [0, 15, 30, 45].map((m) => ({ label: String(m).padStart(2, '0'), value: m })), value: 30 }], onChange: (v) => { when = v; } })] });
        void s;
      }

      // ═══ SERVICES ═══
      function servicesPage() {
        return JC.ui.page({
          title: 'Services', large: true, cls: 'sw-services',
          content: () => [
            h('div.sw-svcgrid', [['go', 'Ride', 'car.fill', 'Go anywhere'], ['comfort', 'Comfort', 'car.fill', 'Extra legroom'], ['xl', 'XL', 'person.2.fill', 'Up to 6 seats'], ['pet', 'Pet', 'pawprint.fill', 'Very large dogs'], ['black', 'Black', 'star.fill', 'Premium'], ['reserve', 'Reserve', 'calendar', 'Plan ahead'], ['package', 'Package', 'cube.box', 'Send items'], ['hourly', 'Hourly', 'clock.fill', 'Keep the car']].map(([k, t, g, s]) => h('div.sw-svc', { onTap: () => svc(k) }, h('div.sw-svc-ic', JC.icon(g, { size: 30 })), h('b', t), h('span', s)))),
            JC.ui.list([{ header: 'For business', rows: [{ icon: { glyph: 'briefcase.fill', bg: '#5b3fa6' }, title: 'YMJ Business Profile', subtitle: 'Rides billed to Yunmeng Jiang Group · managed by Tang Mei', chevron: true, onTap: () => businessSheet() }] }], { cls: 'sw-list' }),
          ],
        });
      }
      function svc(k) {
        if (k === 'reserve') return reserve();
        if (k === 'package') return JC.ui.alert({ title: 'Package', message: 'Package delivery runs 07:00–22:00. It’s ' + U.fmtTime(JC.time.now()) + '. Even packages sleep.', buttons: [{ text: 'OK' }] });
        if (k === 'hourly') return JC.ui.alert({ title: 'Hourly', message: 'Keep a car and driver for 2–12 hours. Minimum booking: 2 hours, starting from 07:00.', buttons: [{ text: 'OK' }] });
        startBooking({ tier: k });
      }
      function businessSheet() {
        JC.ui.sheet({ title: 'YMJ Business Profile', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [{ title: 'Company', detail: 'Yunmeng Jiang Group' }, { title: 'Admin', detail: 'Tang Mei (EA)' }, { title: 'Payment', detail: 'YMJ Corporate •• 1992' }, { title: 'Expense reports', detail: 'Monthly' }] }, { rows: [{ title: 'Use for personal rides', toggle: { on: false, onChange: (v) => { if (v) JC.ui.alert({ title: 'Are you sure?', message: 'Tang Mei reviews every business ride. She would ask about a midnight trip to a residential street in Jinxing.', buttons: [{ text: 'OK' }] }); } } }] }])] });
      }

      // ═══ ACTIVITY ═══
      const routeCache = new Map();
      function rideRoute(r) {
        const k = r.from + '>' + r.to;
        if (!routeCache.has(k)) { let rt = null; try { rt = MV().place(r.from) && MV().place(r.to) ? MV().route(r.from, r.to, 'drive') : null; } catch (e) { rt = null; } routeCache.set(k, rt); }
        return routeCache.get(k);
      }
      function rideRow(r) {
        const live = r.status === 'active';
        const A = MV().place(r.from), B = MV().place(r.to);
        const rt = rideRoute(r);
        const thumb = MV().thumb(r.to, { w: 96, h: 72, zoom: 18, style: 'muted', marker: false, labels: false, pois: false, fit: rt ? rt.pts : [A, B].filter(Boolean).map((p) => [p.x, p.y]), routes: rt ? [{ pts: rt.pts, color: ink(), width: 2.5 }] : [], dots: [A ? { at: [A.x, A.y], color: '#30d158', r: 4 } : null, B ? { at: [B.x, B.y], color: ink2(), r: 4 } : null].filter(Boolean) });
        return h('div.sw-trip', { onTap: () => tabs.nav('activity').push(tripPage(r.id)) },
          h('div.sw-trip-map', thumb),
          h('div.sw-trip-m', h('div.sw-trip-t', placeName(r.to)), h('div.sw-trip-s', U.fmtDate(r.t, 'md') + (new Date(r.t).getFullYear() !== 2026 ? ', ' + new Date(r.t).getFullYear() : '') + ' · ' + U.fmtTime(r.t)), h('div.sw-trip-s', live ? 'In progress' : r.status === 'cancelled' ? 'Cancelled' : fmtY(r.price))),
          h('div.sw-trip-go', JC.icon('chevron.right', { size: 14, weight: 2.6 })));
      }
      function activityPage() {
        return JC.ui.page({
          title: 'Activity', large: true, cls: 'sw-activity', refreshOnShow: true,
          content: () => {
            const rides = JC.store.all('rides').slice().sort((a, b) => b.t - a.t);
            const upcoming = active ? [h('div.sw-h', 'Current'), h('div.sw-trip.cur', { onTap: () => openFlow() }, h('div.sw-trip-ic', JC.icon('car.fill', { size: 22 })), h('div.sw-trip-m', h('div.sw-trip-t', 'Ride to ' + placeName(active.to)), h('div.sw-trip-s', flowStatus())), h('div.sw-trip-go', JC.icon('chevron.right', { size: 14, weight: 2.6 })))] : [];
            return [h('div.sw-acts', upcoming, h('div.sw-h', 'Past'), rides.map(rideRow))];
          },
        });
      }
      function tripPage(id) {
        const r = JC.store.get('rides', id);
        if (!r) return JC.ui.page({ title: 'Trip', content: () => JC.ui.empty({ icon: 'car.fill', title: 'Trip not found' }) });
        JC.story.act('ride_view', { id });
        const A = MV().place(r.from), B = MV().place(r.to);
        const route = A && B ? rideRoute(r) : null;
        const page = JC.ui.page({
          title: 'Trip details', cls: 'sw-tripdetail', bg: 'grouped',
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: 'Swift Ride receipt', subtitle: placeName(r.from) + ' → ' + placeName(r.to), icon: 'car.fill', payload: { kind: 'text', text: 'Swift Ride · ' + placeName(r.from) + ' → ' + placeName(r.to) + ' · ' + U.fmtDate(r.t, 'medium') + ' · ' + fmtY(r.price) } }) })],
          content: () => {
            const fresh = JC.store.get('rides', id) || r;
            return [
              h('div.sw-tmap', route ? MV().thumb(r.to, { w: 370, h: 190, style: 'muted', fit: [[A.x, A.y], [B.x, B.y]], routes: [{ pts: route.pts, color: ink(), width: 4 }], marker: false, dots: [{ at: [A.x, A.y], color: '#30d158' }, { at: [B.x, B.y], color: ink2() }] }) : null),
              h('div.sw-tsum', h('div.sw-tsum-t', (TIERS[fresh.tier] || TIERS.go).name + ' · ' + U.fmtDate(fresh.t, 'medium')), h('div.sw-tsum-p', fmtY(fresh.price)), fresh.note ? h('div.sw-tsum-n', fresh.note) : null),
              h('div.sw-legs', h('div.sw-leg', h('span.sw-dot.g'), h('div', h('b', placeName(fresh.from)), h('span', U.fmtTime(fresh.t)))), h('div.sw-leg-line'), h('div.sw-leg', h('span.sw-dot.b'), h('div', h('b', placeName(fresh.to)), h('span', fresh.end ? U.fmtTime(fresh.end) : '—')))),
              JC.ui.list([{ rows: [
                { avatar: { initials: initials(fresh.driver.name), grad: ['#3a3a3c', '#1c1c1e'] }, avatarSize: 44, title: fresh.driver.name, subtitle: fresh.driver.car + ' · ' + fresh.driver.plate, detail: '★ ' + Number(fresh.driver.rating).toFixed(2), onTap: () => driverSheet(fresh.driver) },
              ] }, { rows: [
                { title: 'Receipt', icon: { glyph: 'doc.text', bg: 'var(--sw-ink)' }, chevron: true, onTap: () => receipt(fresh) },
                { title: 'Help', subtitle: 'Lost items, fare review, safety', icon: { glyph: 'questionmark.circle', bg: '#ffb300' }, chevron: true, onTap: () => page.nav.push(helpPage(fresh)) },
                { title: 'Ride again', icon: { glyph: 'arrow.clockwise', bg: '#30d158' }, chevron: true, onTap: () => startBooking({ from: fresh.from === 'player-home' ? null : fresh.from, to: fresh.to }) },
                { title: fresh.rated ? 'You rated ' + '★'.repeat(fresh.rated) : 'Rate your driver', icon: { glyph: 'star.fill', bg: '#ff9f0a' }, chevron: !fresh.rated, onTap: fresh.rated ? null : () => rateSheet(fresh, () => page.render()) },
              ] }], { cls: 'sw-list' }),
            ];
          },
        });
        return page;
      }
      function initials(n) { const w = String(n).replace(/^Master\s+/, '').split(/\s+/); return (w[0] || '?')[0] + ((w[1] || '')[0] || ''); }
      function driverSheet(d) {
        JC.ui.sheet({ title: '', detent: 'medium', left: { text: 'Close' }, content: () => [h('div.sw-drv', JC.ui.avatar({ initials: initials(d.name), grad: ['#3a3a3c', '#1c1c1e'] }, 74), h('div.sw-drv-n', d.name), h('div.sw-drv-s', '★ ' + Number(d.rating).toFixed(2) + ' · ' + (d.trips || 4200).toLocaleString('en-US') + ' trips · since ' + (d.since || 2020)), h('div.sw-plate', d.plate), h('div.sw-drv-s', d.car)),
          JC.ui.list([{ rows: [{ title: 'Compliments', detail: '“Great conversation” ×212' }, { title: 'Languages', detail: 'Mandarin, Lanling dialect' }] }])] });
      }
      function fareOf(r) {
        if (r.fare) return r.fare;
        const hr = new Date(r.t).getHours();
        const night = hr >= 22 || hr < 7 ? Math.round(r.price * 6 / 64 * 100) / 100 : 0;
        const rest = r.price - night;
        const base = Math.min(10, rest);
        const time = Math.round(rest * 0.16 * 100) / 100;
        return { base, dist: Math.round((rest - base - time) * 100) / 100, time, night };
      }
      function receipt(r) {
        const F = fareOf(r);
        const mins = r.min || (r.end ? Math.max(1, Math.round((r.end - r.t) / 60000)) : 0);
        JC.ui.sheet({ title: 'Receipt', detent: 'large', left: { text: 'Done' }, right: { text: 'Email', bold: false, onTap: () => { JC.ui.toast('Receipt sent to jiang.cheng@lotuspier.yunmeng', { icon: 'envelope.fill' }); return false; } },
          content: () => [h('div.sw-rcpt',
            h('div.sw-rcpt-logo', 'Swift'), h('div.sw-rcpt-t', 'Thanks for riding, Jiang Cheng'), h('div.sw-rcpt-d', U.fmtDate(r.t, 'full') + ' · ' + U.fmtTime(r.t)),
            h('div.sw-rcpt-total', h('span', 'Total'), h('b', fmtY(r.price))),
            [['Base fare', F.base], ['Distance (' + Number(r.km || 0).toFixed(1) + ' km)', F.dist], ['Time' + (mins ? ' (' + mins + ' min)' : ''), F.time], F.night ? ['Night surcharge (22:00–07:00)', F.night] : null].filter(Boolean).map(([k, v]) => h('div.sw-rcpt-row', h('span', k), h('span', fmtY(v)))),
            h('div.sw-rcpt-row.pay', h('span', 'Paid with ' + (CARDS.find((c) => c.id === (r.card || 'ycb')) || CARDS[0]).name + ' •• ' + (CARDS.find((c) => c.id === (r.card || 'ycb')) || CARDS[0]).last), h('span', fmtY(r.price))),
            h('div.sw-rcpt-trip', h('div', h('span.sw-dot.g'), ' ', placeName(r.from), ' · ', U.fmtTime(r.t)), h('div', h('span.sw-dot.b'), ' ', placeName(r.to), ' · ', r.end ? U.fmtTime(r.end) : '—')),
            h('div.sw-rcpt-drv', 'Your driver: ' + r.driver.name + ' · ' + r.driver.plate),
            h('div.sw-rcpt-foot', (r.ref ? 'Receipt ' + r.ref + ' · ' : '') + 'Swift Ride Technology (Lanling) Co., Ltd. · Fapiao available in the app for 180 days.'))] });
      }
      function rateSheet(r, after) {
        let stars = 5, tip = 0;
        const comps = new Set();
        const s = JC.ui.sheet({ title: 'Rate your trip', detent: 'large', left: { text: 'Skip' }, right: { text: 'Done', onTap: () => {
          JC.store.update('rides', r.id, { rated: stars, tip, compliments: [...comps] });
          if (tip) { JC.store.add('tx', { card: r.card || 'ycb', merchant: 'Swift Ride — Tip', amount: tip, t: JC.time.now(), cat: 'transport', note: 'Tip for ' + r.driver.name }, { front: true }); }
          JC.ui.toast('Thanks for your rating', { icon: 'star.fill' });
          if (after) after();
        } },
          content: () => [h('div.sw-rate', JC.ui.avatar({ initials: initials(r.driver.name), grad: ['#3a3a3c', '#1c1c1e'] }, 64), h('div.sw-rate-q', 'How was your ride with ' + r.driver.name + '?'),
            h('div.sw-stars', [1, 2, 3, 4, 5].map((n) => h('span.tap', { class: { on: n <= stars }, onTap: () => { stars = n; s.render(); } }, '★'))),
            h('div.sw-rate-h', 'Give a compliment'), h('div.sw-comps', ['Great music', 'Clean car', 'Expert navigation', 'Great conversation', 'Quiet ride', 'Dog-friendly'].map((c) => h('span.sw-comp.tap', { class: { on: comps.has(c) }, onTap: () => { if (comps.has(c)) comps.delete(c); else comps.add(c); s.render(); } }, c))),
            h('div.sw-rate-h', 'Add a tip'), h('div.sw-tips', [0, 5, 10, 20].map((t) => h('span.sw-tip.tap', { class: { on: tip === t }, onTap: () => { tip = t; s.render(); } }, t ? '¥' + t : 'No tip'))))] });
      }

      // ── help & lost items ──
      function helpPage(r) {
        return JC.ui.page({
          title: 'Help', bg: 'grouped', cls: 'sw-help',
          content: (page) => [
            h('div.sw-helptrip', h('b', placeName(r.from) + ' → ' + placeName(r.to)), h('span', U.fmtDate(r.t, 'medium') + ' · ' + U.fmtTime(r.t) + ' · ' + r.driver.name)),
            JC.ui.list([{ header: 'Trip issues', rows: [
              { title: 'Report a lost item', subtitle: 'Something left behind — or found', icon: { glyph: 'magnifyingglass', bg: '#ffb300' }, chevron: true, onTap: () => page.nav.push(lostIntro(r)) },
              { title: 'Review my fare or fees', icon: { glyph: 'creditcard.fill', bg: '#30b0c7' }, chevron: true, onTap: () => issue('Review my fare', 'Tell us what looks wrong with this fare.') },
              { title: 'My driver was unprofessional', icon: { glyph: 'exclamationmark.bubble', bg: '#ff9f0a' }, chevron: true, onTap: () => issue('Driver feedback', 'What happened? We read every report.') },
              { title: 'I was involved in an accident', icon: { glyph: 'car.fill', bg: '#ff3b30' }, chevron: true, onTap: () => JC.ui.alert({ title: 'Are you safe?', message: 'If anyone is hurt, call 120 now. For everything else our safety team is available 24/7.', buttons: [{ text: 'Call Safety Line', onTap: () => MV().fakeCall({ name: 'Swift Safety', num: '400 811 0101', glyph: 'shield.fill', lines: ['Swift Ride safety line. Is everyone safe?', '…If you’re okay, we’ll follow up by email. Take care.'] }) }, { text: 'I’m OK', style: 'cancel' }] }) },
            ] }, { header: 'Account', rows: [
              { title: 'Payment methods', chevron: true, onTap: () => { tabs.select('account', true); tabs.nav('account').push(walletPage()); } },
              { title: 'Contact support', subtitle: 'Customer Care · ' + SUPPORT, chevron: true, onTap: () => callSupport() },
            ] }], { cls: 'sw-list' }),
          ],
        });
      }
      function issue(title, msg) {
        JC.ui.alert({ title, message: msg, input: { placeholder: 'Describe the issue', multiline: false }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit', style: 'default' }] }).then((x) => { if (x.index === 1) JC.ui.alert({ title: 'Report Received', message: 'Our support team will reply by email within 24 hours.', buttons: [{ text: 'OK' }] }); });
      }
      function lostIntro(r) {
        return JC.ui.page({
          title: 'Lost & found', bg: 'grouped', cls: 'sw-lost',
          content: (page) => [
            h('div.sw-lost-hero', h('div.sw-lost-ic', JC.icon('magnifyingglass', { size: 34, weight: 2.2 })), h('div.sw-lost-t', 'Report a lost item'), h('div.sw-lost-s', 'Left something in this ride — or found something that isn’t yours? Tell us and we’ll contact the people on this trip.')),
            h('div.sw-lost-opts',
              h('div.sw-lost-opt', { onTap: () => page.nav.push(lostForm(r, 'found')) }, h('div.sw-lost-oic.found', JC.icon('hand.raised', { size: 24 })), h('div', h('b', 'I found an item'), h('span', 'Someone left something in this car and I have it')), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
              h('div.sw-lost-opt', { onTap: () => page.nav.push(lostForm(r, 'lost')) }, h('div.sw-lost-oic', JC.icon('questionmark.circle', { size: 24 })), h('div', h('b', 'I lost an item'), h('span', 'I left something behind on this trip')), JC.icon('chevron.right', { size: 14, weight: 2.6 }))),
            h('div.sw-lost-note', JC.icon('shield.fill', { size: 14 }), ' Your number stays private. Calls are connected through Swift.'),
          ],
        });
      }
      function lostForm(r, kind) {
        const f = { item: 'Phone', where: 'With me', msg: kind === 'found' ? 'I found a phone in a purple case in the back seat. It’s safe — I’d like to return it.' : '', contact: '', color: 'Purple case' };
        const page = JC.ui.page({
          title: kind === 'found' ? 'Report a found item' : 'Report a lost item', bg: 'grouped', cls: 'sw-lost',
          content: () => [
            JC.ui.list([{ header: kind === 'found' ? 'What did you find?' : 'What did you lose?', rows: ['Phone', 'Wallet', 'Keys', 'Bag', 'Other'].map((t) => ({ title: t, check: f.item === t, onTap: () => { f.item = t; page.render(); } })) },
              { header: 'Description', rows: [{ custom: JC.ui.input({ value: f.color, placeholder: 'Colour, brand, anything distinctive', cls: 'form-field sw-field', onInput: (v) => { f.color = v; } }) }] },
              kind === 'found' ? { header: 'Where is it now?', rows: ['With me', 'I gave it to the driver', 'I took it to the police'].map((t) => ({ title: t, check: f.where === t, onTap: () => { f.where = t; page.render(); } })) } : null,
              { header: kind === 'found' ? 'Message to the owner' : 'Message to your driver', rows: [{ custom: JC.ui.input({ value: f.msg, multiline: true, rows: 3, placeholder: kind === 'found' ? 'Let them know how to get it back' : 'Describe where you think you left it', cls: 'form-field sw-field', onInput: (v) => { f.msg = v; } }) }] },
              { header: 'How can we reach you?', footer: kind === 'lost' && f.item === 'Phone' ? 'If you lost your phone, enter another number — we can’t call the phone you lost. (You are, of course, using it right now.)' : 'Optional. We’ll only use this to arrange the return.', rows: [{ custom: JC.ui.input({ value: f.contact, placeholder: 'Phone number or email', cap: 'none', cls: 'form-field sw-field', onInput: (v) => { f.contact = v; } }) }] },
            ].filter(Boolean), { cls: 'sw-list' }),
            h('div.sw-submit', JC.ui.btn({ text: 'Submit report', kind: 'filled', size: 'l', onTap: () => submit() })),
          ],
        });
        function submit() {
          if (kind === 'lost' && r.id === 'ride_tonight' && f.item === 'Phone') {
            JC.ui.alert({ title: 'Lost Your Phone?', message: 'This report is coming from the phone that was on this trip. If you found this phone, report it as a found item so Swift can reach its owner.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Report as Found', style: 'default', onTap: () => page.nav.replace(lostForm(r, 'found')) }] });
            return;
          }
          const who = kind === 'found' ? 'the account holder for this trip and the driver (' + r.driver.name + ')' : 'your driver, ' + r.driver.name;
          JC.ui.alert({ title: 'Submit report?', message: 'Swift Ride will notify ' + who + ' and help arrange the return.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit', style: 'default' }] }).then((x) => {
            if (x.index !== 1) return;
            const S = st();
            const d = new Date(r.t);
            const no = r.id === 'ride_tonight' && kind === 'found' ? 'SR-1016-2347' : 'SR-' + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + (1000 + Math.floor(Math.random() * 8999));
            S.reports.push({ no, kind, item: f.item, t: JC.time.now(), ride: r.id });
            save();
            if (r.id === 'ride_tonight' && kind === 'found') JC.story.act('ride_report_lost', { kind, item: f.item, ride: r.id, no });
            page.nav.replace(lostDone(r, kind, no, f));
          });
        }
        return page;
      }
      function lostDone(r, kind, no, f) {
        return JC.ui.page({
          title: 'Report sent', bg: 'grouped', cls: 'sw-lost', noBack: true,
          right: [JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => tabs.nav('activity').popToRoot() })],
          content: () => [
            h('div.sw-lost-hero.done', h('div.sw-lost-ic.ok', JC.icon('checkmark', { size: 36, weight: 3 })), h('div.sw-lost-t', kind === 'found' ? 'We’ve notified the owner' : 'We’ve notified your driver'), h('div.sw-lost-s', 'Report ' + no + ' · ' + f.item + (f.color ? ' (' + f.color + ')' : ''))),
            JC.ui.list([{ header: 'What happens next', rows: (kind === 'found' ? [
              { title: 'The owner gets an email and a call from Swift', subtitle: 'Sent to the account holder for this trip' },
              { title: r.driver.name + ' has been told too', subtitle: 'In case the owner contacts the driver first' },
              { title: 'Keep the item safe', subtitle: 'Found items are held for 48 hours. We’ll text you a hand-over time and place.' },
            ] : [
              { title: 'Your driver has been notified', subtitle: r.driver.name + ' · ' + r.driver.plate },
              { title: 'We’ll connect you by phone', subtitle: f.contact ? 'At ' + f.contact : 'Add a contact number to speed this up' },
              { title: 'Return fee', subtitle: 'Drivers may charge up to ¥30 for a return trip' },
            ]).map((x) => Object.assign(x, { icon: { glyph: 'checkmark', bg: '#30d158' } })) }], { cls: 'sw-list' }),
          ],
        });
      }

      // ═══ ACCOUNT ═══
      function accountPage() {
        return JC.ui.page({
          title: 'Account', large: true, cls: 'sw-account', bg: 'grouped',
          content: (page) => [
            h('div.sw-prof', JC.ui.avatar('me', 66), h('div', h('div.sw-prof-n', 'Jiang Cheng'), h('div.sw-prof-s', JC.icon('star.fill', { size: 12 }), ' 4.71 · Swift Gold'))),
            h('div.sw-quick', [['Help', 'questionmark.circle', () => JC.os.open('safari', { url: 'https://help.swiftride.lanling/lost-items' })], ['Wallet', 'creditcard.fill', () => page.nav.push(walletPage())], ['Activity', 'list.bullet', () => tabs.select('activity', true)]].map(([t, g, fn]) => h('div.sw-q', { onTap: fn }, JC.icon(g, { size: 22 }), h('span', t)))),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'creditcard.fill', bg: 'var(--sw-ink)' }, title: 'Wallet', detail: (CARDS.find((c) => c.id === st().card) || CARDS[0]).name.split(' ')[0] + ' •• ' + (CARDS.find((c) => c.id === st().card) || CARDS[0]).last, chevron: true, onTap: () => page.nav.push(walletPage()) },
              { icon: { glyph: 'house.fill', bg: '#0a84ff' }, title: 'Saved places', chevron: true, onTap: () => page.nav.push(savedPage()) },
              { icon: { glyph: 'shield.fill', bg: '#30d158' }, title: 'Safety', chevron: true, onTap: () => page.nav.push(safetyPage()) },
              { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promotions', detail: st().promo ? '1 active' : '', chevron: true, onTap: () => promosSheet() },
              { icon: { glyph: 'briefcase.fill', bg: '#5b3fa6' }, title: 'Business profile', detail: 'YMJ', chevron: true, onTap: () => businessSheet() },
            ] }, { rows: [
              { icon: { glyph: 'bell.fill', bg: '#ff3b30' }, title: 'Notifications', chevron: true, onTap: () => notifSheet() },
              { icon: { glyph: 'lock.fill', bg: '#8e8e93' }, title: 'Privacy', chevron: true, onTap: () => JC.ui.alert({ title: 'Privacy', message: 'Swift Ride uses your location only during trips. Trip history is kept for 3 years.', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'info.circle', bg: '#30b0c7' }, title: 'About', detail: 'v 8.12.0', chevron: true, onTap: () => JC.ui.alert({ title: 'Swift Ride 8.12.0', message: 'Made in Lanling. Drive safe.', buttons: [{ text: 'OK' }] }) },
            ] }, { rows: [{ title: 'Sign out', destructive: true, center: true, onTap: () => JC.ui.alert({ title: 'Sign out?', message: 'You’ll need Jiang Cheng’s password to sign back in.', input: { placeholder: 'Password to confirm', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'For your security, you can’t sign out without confirming the account password.', buttons: [{ text: 'OK' }] }), 500); }) }] }], { cls: 'sw-list' }),
          ],
        });
      }
      function walletPage() {
        const page = JC.ui.page({
          title: 'Wallet', bg: 'grouped', cls: 'sw-walletp',
          content: () => [
            h('div.sw-cash', h('div', h('small', 'Swift Cash'), h('b', '¥120.50')), JC.ui.btn({ text: 'Add funds', kind: 'filled', size: 's', onTap: () => JC.ui.actionSheet({ title: 'Add to Swift Cash', actions: [50, 100, 200].map((n) => ({ text: '¥' + n, onTap: () => JC.ui.alert({ title: 'Confirm with Face ID', message: 'Face not recognised.', buttons: [{ text: 'OK' }] }) })) }) })),
            JC.ui.list([{ header: 'Payment methods', rows: CARDS.map((c) => ({ leading: h('div.sw-cardic', { style: { background: c.color } }, c.id === 'cash' ? '¥' : ''), title: c.name, subtitle: c.id === 'cash' ? 'Balance ' + c.last : '•• ' + c.last, check: st().card === c.id, onTap: () => { st().card = c.id; save(); page.render(); } })).concat([{ title: 'Add payment method', tinted: true, onTap: () => JC.ui.alert({ title: 'Add Card', message: 'Adding a card needs the cardholder’s name to match the account: Jiang Cheng.', buttons: [{ text: 'OK' }] }) }]) },
            { header: 'Vouchers', rows: [{ title: 'Night Owl Pass', subtitle: st().promo === 'NIGHTOWL' ? 'Active · 10% off after 23:00' : 'Not active', onTap: () => promoSheet('NIGHTOWL') }] }], { cls: 'sw-list' }),
          ],
        });
        return page;
      }
      function savedPage() {
        const page = JC.ui.page({
          title: 'Saved places', bg: 'grouped',
          content: () => {
            const S = st();
            return [JC.ui.list([{ rows: [['home', 'house.fill', 'Home'], ['work', 'briefcase.fill', 'Work']].map(([k, g, t]) => ({ icon: { glyph: g, bg: 'var(--sw-ink)' }, title: t, subtitle: placeName(S.saved[k]), chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Set ' + t, actions: ['lp-residence', 'lotus-pier', 'golden-peony', 'koi-residences'].map((id) => ({ text: placeName(id), onTap: () => { S.saved[k] = id; save(); page.render(); } })) }) })).concat([{ title: 'Add saved place', tinted: true, onTap: () => JC.ui.alert({ title: 'Add Place', input: { placeholder: 'Search for an address' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((x) => { if (x.index === 1 && x.value) JC.ui.toast('Saved “' + x.value + '”', { icon: 'checkmark' }); }) }]) }], { cls: 'sw-list' })];
          },
        });
        return page;
      }
      function safetyPage() {
        return JC.ui.page({
          title: 'Safety', bg: 'grouped',
          content: () => {
            const S = st();
            return [JC.ui.list([{ header: 'Trusted contacts', rows: [{ avatar: 'ea', avatarSize: 34, title: 'Tang Mei (EA)', subtitle: 'Gets your trip status on business rides' }, { title: 'Add contact', tinted: true, onTap: () => JC.ui.actionSheet({ title: 'Add trusted contact', actions: ['jl', 'huang', 'wwx'].map((c) => ({ text: JC.contacts.short(c), onTap: () => JC.ui.toast(JC.contacts.short(c) + ' added', { icon: 'checkmark' }) })) }) }] },
              { header: 'Ride features', rows: [
                { title: 'RideCheck', subtitle: 'Checks in if a trip stops unexpectedly', toggle: { on: S.safety.check, onChange: (v) => { S.safety.check = v; save(); } } },
                { title: 'PIN verification', subtitle: 'Confirm your driver with a 4-digit PIN', toggle: { on: S.safety.pin, onChange: (v) => { S.safety.pin = v; save(); } } },
                { title: 'Share trip status automatically', toggle: { on: S.safety.share, onChange: (v) => { S.safety.share = v; save(); } } },
              ] }], { cls: 'sw-list' })];
          },
        });
      }
      function promosSheet() {
        JC.ui.sheet({ title: 'Promotions', detent: 'medium', left: { text: 'Done' }, content: () => [h('div.sw-sheetpad', JC.ui.input({ placeholder: 'Enter promo code', cap: 'characters', cls: 'sw-promoin', enterkey: 'done', onSubmit: (v) => { v = v.trim().toUpperCase(); if (!v) return; if (v === 'NIGHTOWL') { st().promo = v; save(); JC.ui.toast('Night Owl Pass applied', { icon: 'checkmark' }); } else JC.ui.alert({ title: 'Invalid Code', message: '“' + v + '” isn’t a valid promo code.', buttons: [{ text: 'OK' }] }); } }), h('p.sw-muted', 'Try codes from Swift emails. (Hint: you’re a night owl.)'))] });
      }
      function notifSheet() {
        const S = st();
        JC.ui.sheet({ title: 'Notifications', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [{ title: 'Trip updates', toggle: { on: S.notif.trips, onChange: (v) => { S.notif.trips = v; save(); } } }, { title: 'Offers & promotions', toggle: { on: S.notif.promos, onChange: (v) => { S.notif.promos = v; save(); } } }] }])] });
      }

      // ═══ BOOKING FLOW ═══
      let flow = null;
      function startBooking(o) {
        o = o || {};
        if (active) { openFlow(); return; }
        const fromId = o.from && MV().place(o.from) ? o.from : null;
        active = { phase: 'search', from: fromId || 'player-home', fromLabel: fromId ? placeName(fromId) : 'Current location', to: o.to || null, tier: o.tier && TIERS[o.tier] ? o.tier : 'go', reserve: o.reserve || null };
        openFlow();
        if (active.to) toOptions();
        else renderPanel();
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
        if (active && (active.phase === 'search' || active.phase === 'options' || cancelBooking)) { stopSim(); active = null; JC.os.island.stop('swift-ride'); }
        flow.map.destroy();
        flow.el.remove();
        flow = null;
        refreshTabs();
      }
      function refreshTabs() { ['home', 'activity'].forEach((id) => { const n = tabs.nav(id); if (n && n.top()) n.top().render(); }); }
      function render() {
        if (!flow || !active) return;
        renderPanel();
        drawMap();
      }
      function drawMap() {
        const { map } = flow;
        map.clearPins(); map.clearRoutes();
        const A = MV().place(active.from);
        const B = active.to ? MV().place(active.to) : null;
        if (A && active.from !== 'player-home') map.addPin('pickup', { kind: 'dot', at: [A.x, A.y], color: '#30d158', anchor: 'center', label: 'Pickup' });
        else map.addPin('pickup', { kind: 'dot', at: MV().HOME, color: '#30d158', anchor: 'center', label: active.phase === 'search' ? null : 'Pickup' });
        if (B) map.addPin('drop', { kind: 'dot', at: [B.x, B.y], color: '#ffffff', square: true, anchor: 'center', label: B.short || B.name });
        if (active.route) map.setRoute('main', { pts: active.route.pts, color: '#ffd60a', width: 5.5, progress: active.prog || 0 });
        if (active.approach && (active.phase === 'enroute')) map.setRoute('approach', { pts: active.approach.pts, color: '#ffffff', width: 3.5, dotted: true });
        if (active.car) map.addPin('car', { kind: 'car', at: active.car.at, rotate: active.car.rot, color: '#ffd60a', anchor: 'center', z: 8 });
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
        const fill = () => {
          list.innerHTML = '';
          const S = st();
          const res = q.trim() ? MV().search(q).slice(0, 8) : ['golden-peony', 'koi-tower', S.saved.home, S.saved.work, 'lanling-south', 'koi-residences', 'night-market'].map((id) => MV().place(id)).filter(Boolean);
          list.appendChild(JC.ui.list([{ rows: res.map((p) => ({ leading: h('div.sw-recic', JC.icon(q ? 'mappin' : 'clock.fill', { size: 16 })), title: p.short || p.name, subtitle: (p.addr || p.city) + ' · ' + MV().fmtDist(MV().fromUser(p)), onTap: () => { active.to = p.id; JC.kb.hide(); toOptions(); } })).concat(q ? [] : [{ leading: h('div.sw-recic', JC.icon('map', { size: 16 })), title: 'Set location on map', subtitle: 'Choose a spot by dragging the map', onTap: () => mapPick() }]) }], { cls: 'sw-list' }));
        };
        const input = JC.ui.input({ placeholder: 'Where to?', enterkey: 'search', cap: 'none', cls: 'sw-in', onInput: (v) => { q = v; fill(); }, onSubmit: () => { const r = MV().search(q)[0]; if (r) { active.to = r.id; JC.kb.hide(); toOptions(); } } });
        fill();
        setTimeout(() => input.focus(), 300);
        return h('div.sw-search',
          h('div.sw-ph', h('div.sw-pt', 'Plan your ride'), h('span.sw-now.dark', { onTap: () => reserve() }, JC.icon('clock.fill', { size: 13 }), active.reserve ? 'Later' : 'Pickup now', JC.icon('chevron.down', { size: 11, weight: 3 }))),
          h('div.sw-fields', h('div.sw-fdots', h('span.sw-dot.g'), h('span.sw-fline'), h('span.sw-dot.b')),
            h('div.sw-fcol', h('div.sw-f.from', { onTap: () => JC.ui.actionSheet({ title: 'Pickup', actions: [{ text: 'Current location — Jinxing Road 27', onTap: () => { active.from = 'player-home'; active.fromLabel = 'Current location'; renderPanel(); } }, { text: 'Golden Peony Hotel', onTap: () => { active.from = 'golden-peony'; active.fromLabel = 'Golden Peony Hotel'; renderPanel(); drawMap(); } }, { text: 'Koi Tower', onTap: () => { active.from = 'koi-tower'; active.fromLabel = 'Koi Tower'; renderPanel(); drawMap(); } }] }) }, active.fromLabel), h('div.sw-f.to', input))),
          list);
      }
      function mapPick() {
        const v = flow.map.view();
        JC.ui.alert({ title: 'Set Destination Here?', message: MV().address(v.cx, v.cy), buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Confirm', style: 'default', onTap: () => {
          const pl = JC.store.add('places', { name: MV().address(v.cx, v.cy).replace(/^\d+\s/, ''), city: MV().cityOf(v.cx, v.cy), x: v.cx, y: v.cy, cat: 'pin', addr: MV().address(v.cx, v.cy), minZ: 99, sub: 'Dropped Pin' });
          active.to = pl.id; toOptions();
        } }] });
      }
      function toOptions() {
        active.phase = 'options';
        active.route = MV().route(active.from, active.to, 'drive');
        if (!active.route) { JC.ui.alert({ title: 'No Route', message: 'Swift can’t find a route there.', buttons: [{ text: 'OK' }] }); active.phase = 'search'; }
        if (!flow) openFlow(); else render();
      }
      function priceFor(tier) {
        const r = active.route;
        let p = MV().fare(r, tier);
        if (st().promo === 'NIGHTOWL') { const hr = JC.time.date().getHours(); if (hr >= 23 || hr < 5) p = Math.round(p * 0.9); }
        return p;
      }
      function optionsPanel() {
        const r = active.route;
        const now = JC.time.date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const card = CARDS.find((c) => c.id === st().card) || CARDS[0];
        const B = MV().place(active.to);
        const far = r.km > 60;
        return h('div.sw-opts',
          h('div.sw-ph', h('div.sw-pt', 'Choose a ride'), h('span.sw-trip-meta', MV().fmtDist(r.km) + ' · ' + MV().fmtMin(r.min))),
          far ? h('div.sw-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' Long trip to ' + (B.city || '') + '. Drivers may decline trips over 60 km at night.') : null,
          h('div.sw-tiers', Object.keys(TIERS).map((k) => {
            const T = TIERS[k];
            return h('div.sw-tier', { class: { on: active.tier === k }, onTap: () => { active.tier = k; renderPanel(); } },
              h('div.sw-tier-ic', { class: 't-' + k }, JC.icon(T.icon, { size: 26 })),
              h('div.sw-tier-m', h('div.sw-tier-n', T.name, h('span.sw-seats', JC.icon('person.fill', { size: 11 }), T.seats)), h('div.sw-tier-s', MV().fmtClockMin(nowMin + T.eta + r.min) + ' drop-off · ' + T.eta + ' min away'), active.tier === k ? h('div.sw-tier-d', T.desc) : null),
              h('div.sw-tier-p', '¥' + priceFor(k)));
          })),
          h('div.sw-payrow',
            h('div.sw-pay', { onTap: () => JC.ui.actionSheet({ title: 'Pay with', actions: CARDS.map((c) => ({ text: c.name + (c.id === 'cash' ? ' (' + c.last + ')' : ' •• ' + c.last), onTap: () => { st().card = c.id; save(); renderPanel(); } })) }) }, h('span.sw-cardic.mini', { style: { background: card.color } }), h('span.sw-pay-t', card.name.split(' ')[0] + (card.id === 'cash' ? '' : ' •• ' + card.last)), JC.icon('chevron.down', { size: 11, weight: 3 })),
            h('div.sw-pay', { onTap: () => promosSheet() }, JC.icon('tag.fill', { size: 14 }), h('span', st().promo ? 'Night Owl −10%' : 'Promo'))),
          JC.ui.btn({ text: (active.reserve ? 'Reserve ' : 'Choose ') + TIERS[active.tier].name, kind: 'filled', size: 'l', cls: 'sw-cta', onTap: () => request() }));
      }
      function request() {
        if (active.reserve) {
          JC.ui.alert({ title: 'Ride Reserved', message: TIERS[active.tier].name + ' to ' + placeName(active.to) + '. We’ll confirm your driver an hour before pickup.', buttons: [{ text: 'OK' }] });
          closeFlow(true);
          return;
        }
        active.phase = 'matching';
        active.price = priceFor(active.tier);
        render();
        JC.audio.play('send');
        const R = active;
        setTimeout(() => { if (active !== R || R.phase !== 'matching') return; assignDriver(); }, 3600);
      }
      function matchingPanel() {
        return h('div.sw-match', h('div.sw-radar', h('span'), h('span'), h('span'), JC.icon('car.fill', { size: 26 })), h('div.sw-pt', 'Finding your driver…'), h('div.sw-muted', TIERS[active.tier].name + ' · ¥' + active.price + ' · to ' + placeName(active.to)), h('div.sw-bar', h('div')), JC.ui.btn({ text: 'Cancel request', kind: 'gray', size: 'l', onTap: () => { active.phase = 'options'; render(); } }));
      }
      function assignDriver() {
        const d = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
        active.driver = { name: d[0], car: d[1], plate: d[2], rating: d[3], trips: 2000 + Math.floor(Math.random() * 7000), since: 2016 + Math.floor(Math.random() * 8) };
        if (active.tier === 'pet') active.driver.car = 'Li Auto L9 · Black (seat covers on)';
        if (active.tier === 'xl') active.driver.car = 'Buick GL8 · Silver';
        const P0 = MV().place(active.from);
        const start = [P0.x + 1.6, P0.y - 1.2];
        const approach = MV().route({ x: start[0], y: start[1], name: 'driver' }, active.from, 'drive');
        active.approach = approach;
        active.phase = 'enroute';
        active.car = { at: start, rot: 0 };
        active.eta = TIERS[active.tier].eta;
        JC.audio.play('receive');
        JC.notify.push({ app: 'swift', title: 'Your driver is on the way', body: active.driver.name + ' · ' + active.driver.car + ' · ' + active.driver.plate, open: { app: 'swift' } });
        islandStart();
        render();
        flow && flow.map.fit([start, [P0.x, P0.y]], { margin: 80, maxZoom: 120 });
        simulate(approach, 12, () => { active.phase = 'arrived'; active.eta = 0; JC.audio.play('tink'); JC.notify.push({ app: 'swift', title: 'Your driver has arrived', body: active.driver.name + ' is waiting at the pickup point. ' + active.driver.plate, open: { app: 'swift' } }); islandUpdate(); if (flow) renderPanel(); setTimeout(startTrip, 5000); });
      }
      let simT = null;
      function stopSim() { cancelAnimationFrame(simT); simT = null; }
      function simulate(route, secs, done) {
        stopSim();
        if (!route) { done(); return; }
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
            if (R.phase === 'trip') flow.map.setUser(R.car.at);
            if (R.phase === 'trip') flow.map.setRoute('main', { pts: R.route.pts, color: '#ffd60a', width: 5.5, progress: k });
            const e = flow.panel.querySelector('.sw-eta-n');
            if (e) e.textContent = R.phase === 'trip' ? MV().fmtClockMin(new Date(JC.time.now()).getHours() * 60 + new Date(JC.time.now()).getMinutes() + R.eta) : (R.eta <= 1 ? '1' : R.eta);
          }
          if ((performance.now() - t0) % 900 < 20) islandUpdate();
          if (k >= 1) { done(); return; }
          simT = requestAnimationFrame(step);
        };
        simT = requestAnimationFrame(step);
      }
      function startTrip() {
        if (!active || active.phase !== 'arrived') return;
        active.phase = 'trip';
        active.tripStart = JC.time.now();
        JC.notify.push({ app: 'swift', title: 'Trip started', body: 'On the way to ' + placeName(active.to) + '. Share your trip status any time.', open: { app: 'swift' } });
        if (flow) { renderPanel(); drawMap(); flow.map.fit(active.route.pts, { margin: 60, maxZoom: 100 }); }
        islandUpdate();
        const secs = Math.max(16, Math.min(70, active.route.min * 1.1));
        simulate(active.route, secs, finishTrip);
      }
      function driverPanel() {
        const d = active.driver;
        const ph = active.phase;
        const head = ph === 'enroute' ? ['Meet at the pickup point', h('div.sw-eta', h('b.sw-eta-n', String(active.eta || 1)), h('span', 'min'))]
          : ph === 'arrived' ? ['Your driver has arrived', h('div.sw-eta.arr', h('b', 'Now'))]
            : ['Heading to ' + placeName(active.to), h('div.sw-eta.trip', h('small', 'Arrive'), h('b.sw-eta-n', MV().fmtClockMin(new Date(JC.time.now()).getHours() * 60 + new Date(JC.time.now()).getMinutes() + (active.eta || active.route.min))))];
        return h('div.sw-drvp',
          h('div.sw-ph', h('div.sw-pt', head[0]), head[1]),
          ph === 'arrived' ? h('div.sw-hint', JC.icon('location.fill', { size: 13 }), ' ' + carDesc(d.car) + ' · ' + d.plate + ' — waiting at ' + (active.from === 'player-home' ? 'Jinxing Road 27' : placeName(active.from))) : null,
          h('div.sw-dcard',
            h('div.sw-dcard-l', JC.ui.avatar({ initials: initials(d.name), grad: ['#3a3a3c', '#1c1c1e'] }, 52), h('div', h('div.sw-dn', d.name), h('div.sw-ds', '★ ' + d.rating.toFixed(2) + ' · ' + d.trips.toLocaleString('en-US') + ' trips'))),
            h('div.sw-dcard-r', h('div.sw-plate.sm', d.plate), h('div.sw-ds', d.car))),
          h('div.sw-dacts',
            h('div.sw-dact', { onTap: () => callDriver() }, JC.icon('phone.fill', { size: 20 }), h('span', 'Call')),
            h('div.sw-dact', { onTap: () => messageDriver() }, JC.icon('message.fill', { size: 20 }), h('span', 'Message')),
            h('div.sw-dact', { onTap: () => JC.ui.share({ title: 'My Swift Ride trip', subtitle: 'Live trip status', icon: 'car.fill', payload: { kind: 'text', text: 'I’m in a Swift Ride to ' + placeName(active.to) + ' — ' + d.car + ', ' + d.plate + '. Follow my trip: swift.ride/t/' + Math.random().toString(36).slice(2, 8) } }) }, JC.icon('square.and.arrow.up', { size: 20 }), h('span', 'Share')),
            h('div.sw-dact', { onTap: () => safetySheet() }, JC.icon('shield.fill', { size: 20 }), h('span', 'Safety'))),
          h('div.sw-tripline', h('span.sw-dot.g'), h('span', active.fromLabel), h('span.sw-arrow', '→'), h('span.sw-dot.b'), h('span', placeName(active.to)), h('b', '¥' + active.price)),
          ph !== 'trip' ? h('div.sw-cancel.tap', { onTap: () => cancelRide() }, 'Cancel ride') : h('div.sw-cancel.muted', 'Trip in progress · ' + (CARDS.find((c) => c.id === st().card) || CARDS[0]).name.split(' ')[0] + ' will be charged'));
      }
      function carDesc(car) { const [model, col] = String(car).split(' · '); return ((col || '').replace(/\s*\(.*\)/, '') + ' ' + (model || '')).trim(); }
      function callDriver() {
        const d = active.driver;
        MV().fakeCall({ name: d.name, num: 'Swift private line', avatar: { initials: initials(d.name), grad: ['#3a3a3c', '#1c1c1e'] }, lines: active.phase === 'enroute' ? ['Wei? I’m about ' + Math.max(1, active.eta || 2) + ' minutes away.', 'Jinxing Road 27, right? I see the convenience store on the map. Wait at the door, I’ll flash my lights.'] : active.phase === 'arrived' ? ['I’m outside! ' + d.car.split(' · ')[1] + ' car, plate ending ' + d.plate.slice(-3) + '.', 'Take your time.'] : ['…You’re in my car. You can just talk to me.', '(the driver turns around and waves)'] });
      }
      function messageDriver() {
        const d = active.driver;
        const log = [];
        const s = JC.ui.sheet({ title: d.name, detent: 'large', left: { text: 'Done' }, cls: 'sw-chat',
          content: () => [h('div.sw-msgs', log.length ? log.map((m) => h('div.sw-msg', { class: { me: m.me } }, m.t)) : h('div.sw-muted.center', 'Messages are translated automatically and kept private.')),
            h('div.sw-qr', ['I’m on my way down', 'Where are you?', 'I have a very large dog', 'Please wait 2 minutes'].map((t) => h('span.tap', { onTap: () => send(t) }, t))),
            h('div.sw-msgin', (() => { const inp = JC.ui.input({ placeholder: 'Message your driver', enterkey: 'send', cls: 'sw-in', onSubmit: (v) => { if (v.trim()) { send(v.trim()); inp.value = ''; } } }); return inp; })())] });
        function send(t) {
          log.push({ me: true, t });
          s.render();
          JC.audio.play('send');
          const reply = /dog/i.test(t) ? (active.tier === 'pet' ? 'No problem, seat covers are on 👍' : 'How large?? …ok I have a blanket.') : /where/i.test(t) ? 'Coming down Jinxing Road now. Black car, hazard lights on.' : /wait/i.test(t) ? 'Ok, no rush.' : 'Ok 👍';
          setTimeout(() => { log.push({ me: false, t: reply }); if (!s.closed) s.render(); JC.audio.play('receive'); }, 1400);
        }
      }
      function safetySheet() {
        JC.ui.sheet({ title: 'Safety toolkit', detent: 'medium', left: { text: 'Close' }, content: () => [JC.ui.list([{ rows: [
          { icon: { glyph: 'square.and.arrow.up', bg: '#0a84ff' }, title: 'Share my trip', onTap: () => JC.ui.share({ title: 'My Swift trip', subtitle: 'Live status', icon: 'car.fill', payload: { kind: 'text', text: 'Following my Swift Ride to ' + placeName(active.to) } }) },
          { icon: { glyph: 'shield.fill', bg: '#30d158' }, title: 'RideCheck', detail: st().safety.check ? 'On' : 'Off' },
          { icon: { glyph: 'sos', bg: '#ff3b30' }, title: 'Emergency assistance', subtitle: 'Calls 110 and shares your location', onTap: () => JC.ui.alert({ title: 'Call 110?', message: 'Only call in a real emergency.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Call', style: 'destructive', onTap: () => JC.ui.toast('Call cancelled — not an emergency') }] }) },
        ] }])] });
      }
      function cancelRide() {
        const fee = active.phase === 'arrived' ? 8 : 0;
        JC.ui.alert({ title: 'Cancel your ride?', message: fee ? 'Your driver is already waiting. A ¥' + fee + ' cancellation fee applies.' : 'Your driver is on the way. You won’t be charged if you cancel now.', buttons: [{ text: 'Keep Ride', style: 'cancel' }, { text: 'Cancel Ride', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          if (fee) JC.store.add('tx', { card: st().card, merchant: 'Swift Ride — Cancellation fee', amount: fee, t: JC.time.now(), cat: 'transport' }, { front: true });
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
        const ride = JC.store.add('rides', { from: R.from, to: R.to, t: R.tripStart || JC.time.now(), end: JC.time.now() + Math.round(R.route.min * 60000), price: R.price, tier: R.tier, km: Math.round(R.route.km * 10) / 10, card: st().card, status: 'completed', driver: R.driver, rated: 0 }, { front: true });
        R.rideId = ride.id;
        JC.store.add('tx', { card: st().card === 'cash' ? 'cash' : st().card, merchant: 'Swift Ride', amount: R.price, t: JC.time.now(), cat: 'transport', note: placeName(R.from === 'player-home' ? 'player-home' : R.from) + ' → ' + placeName(R.to) }, { front: true });
        JC.audio.play('success');
        JC.notify.push({ app: 'swift', title: 'You’ve arrived', body: 'Thanks for riding with ' + R.driver.name + '. ¥' + R.price + ' charged to ' + (CARDS.find((c) => c.id === st().card) || CARDS[0]).name + '.', open: { app: 'swift', intent: { id: ride.id } } });
        JC.os.island.stop('swift-ride');
        if (flow) renderPanel(); else openFlow();
      }
      function donePanel() {
        const R = active;
        let stars = 5, tip = 0;
        const box = h('div.sw-done');
        const draw = () => {
          box.innerHTML = '';
          box.append(h('div.sw-done-ic', JC.icon('flag.checkered', { size: 30 })), h('div.sw-pt', 'You’ve arrived at ' + placeName(R.to)), h('div.sw-muted', '¥' + R.price + ' · ' + MV().fmtDist(R.route.km) + ' · ' + R.driver.name),
            h('div.sw-stars', [1, 2, 3, 4, 5].map((n) => h('span.tap', { class: { on: n <= stars }, onTap: () => { stars = n; draw(); } }, '★'))),
            h('div.sw-tips', [0, 5, 10, 20].map((t) => h('span.sw-tip.tap', { class: { on: tip === t }, onTap: () => { tip = t; draw(); } }, t ? '¥' + t : 'No tip'))),
            JC.ui.btn({ text: 'Done', kind: 'filled', size: 'l', cls: 'sw-cta', onTap: () => {
              JC.store.update('rides', R.rideId, { rated: stars, tip });
              if (tip) JC.store.add('tx', { card: st().card, merchant: 'Swift Ride — Tip', amount: tip, t: JC.time.now(), cat: 'transport', note: 'Tip for ' + R.driver.name }, { front: true });
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
        return { search: 'Choosing destination', options: 'Choosing a ride', matching: 'Finding your driver…', enroute: active.driver ? active.driver.name + ' arriving in ' + Math.max(1, active.eta || 1) + ' min' : '', arrived: 'Your driver has arrived', trip: 'On the way · arrive ' + MV().fmtClockMin(new Date(JC.time.now()).getHours() * 60 + new Date(JC.time.now()).getMinutes() + (active.eta || 0)), done: 'Arrived' }[active.phase] || '';
      }
      function islandStart() {
        JC.os.island.start('swift-ride', {
          priority: 2, width: 220,
          compact: () => ({ left: h('span.sw-isl-l', JC.icon('car.fill', { size: 17 })), right: h('span.sw-isl-r', !active ? '' : active.phase === 'arrived' ? 'Here' : active.phase === 'trip' ? (active.eta || 1) + ' min' : Math.max(1, active.eta || 1) + ' min') }),
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
      /** show pages on a tab's stack, retrying while a push/pop animation is still running */
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
        if (it.report) {
          const r = JC.store.get('rides', it.ride || 'ride_tonight') || JC.store.all('rides')[0];
          if (r) { if (flow && active && active.phase !== 'trip') closeFlow(); openPages('activity', () => [tripPage(r.id), helpPage(r), lostIntro(r)]); }
          return;
        }
        if (it.id) {
          const r = JC.store.get('rides', it.id);
          if (r) { if (flow && active && (active.phase === 'search' || active.phase === 'options')) closeFlow(); else if (flow && (!active || active.phase === 'done')) closeFlow(); openPages('activity', () => [tripPage(r.id)]); }
          return;
        }
        if (it.to || it.tier) { tabs.select('home'); startBooking({ to: it.to, tier: it.tier, from: it.from }); }
      }
      setTimeout(() => handle(intent0), 50);
      return {
        intent: handle,
        show() { if (flow) flow.map.resize(); },
        back() { if (flow) { if (active && active.phase === 'options') { active.phase = 'search'; active.route = null; render(); return true; } closeFlow(); return true; } return false; },
        destroy() { stopSim(); JC.os.island.stop('swift-ride'); if (flow) flow.map.destroy(); },
      };
    },
  });
})();
