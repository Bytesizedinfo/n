/* Lotus Eats — fictional food delivery (coral red). Home · Browse · Orders · Account + Search.
   Restaurants live on the shared map (JC.mapview places): hours, distances and cities agree with Maps, and a
   restaurant only delivers inside its own city. Menus → item sheets with options → cart → checkout (address,
   drop-off, note to rider, anonymous gift, tip, Wallet Pay) → live tracking (rider on a map, Dynamic Island,
   notifications + SMS) → order history with receipts and reorder.
   Acts: order { rest, total, to, id, items, names, qty, anon, note, sched, card } · order_delivered { id, rest, to }. Intents: { id } (order) · { rest } (restaurant or map place id) · { search }. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;
  const D = () => JC.lotusEatsData;
  const TINT = '#ff4d5e';
  const ISL = 'lotuseats-order';

  const yen = (n) => '¥' + (Math.round(n * 100) / 100).toFixed(2);
  const yen0 = (n) => '¥' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(2));
  const CARDS = [
    { id: 'ycb', name: 'Yunmeng Commercial Bank', short: 'YCB', last: '4417', color: 'linear-gradient(135deg,#2a1f3d,#0d0b12)' },
    { id: 'ymj', name: 'YMJ Corporate', short: 'YMJ', last: '1992', color: 'linear-gradient(135deg,#6f4cc3,#3b2a74)' },
  ];
  const cardOf = (id) => CARDS.find((c) => c.id === id) || CARDS[0];
  // the kit appends content arrays one level deep — flatten nested sections first
  const flatten = (f) => (typeof f === 'function' ? (x) => { const r = f(x); return Array.isArray(r) ? r.flat(Infinity).filter(Boolean) : r; } : f);
  const PAGE = (o) => JC.ui.page(Object.assign({}, o, { content: flatten(o.content) }));
  const SHEET = (o) => JC.ui.sheet(Object.assign({}, o, { content: flatten(o.content) }));

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.lotuseats || (d.apps.lotuseats = {});
    const def = { addr: 'here', cart: null, favs: ['night-owl-ll', 'lotus-root-kitchen'], recent: ['congee', 'lotus root soup', 'brown sugar milk tea'], addrs: [], card: 'ycb', notif: { orders: true, promos: false }, promo: null, rated: {} };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();

  // ── catalogue helpers ──
  const rest = (id) => D().RESTS.find((r) => r.id === id) || null;
  const restPlace = (r) => MV().place(r.place);
  const cityOfRest = (r) => { const p = restPlace(r); return p ? p.city : 'Lanling'; };
  const restName = (r) => r.name + (r.branch ? ' · ' + r.branch : '');
  function addrs() { return D().ADDRS.concat(st().addrs || []); }
  function addrOf(id) { return addrs().find((a) => a.id === id) || D().ADDRS[0]; }
  const addrName = (a) => (a.id === 'here' ? 'Jinxing Road 27' : a.label);
  function hoursOf(r) {
    const p = restPlace(r);
    const spec = r.hours ? { hours: r.hours } : p;
    return MV().hoursInfo(spec) || { open: true, text: 'Open', short: 'Open' };
  }
  function nextOpen(r) {
    const spec = r.hours ? { hours: r.hours } : restPlace(r);
    const t0 = JC.time.now();
    for (let k = 1; k < 4 * 24 * 4; k++) {
      const t = t0 + k * 15 * 60000;
      const i = MV().hoursInfo(spec, t);
      if (i && i.open) { const d = new Date(t + 30 * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0); return d.getTime(); }
    }
    return t0 + 12 * 3600000;
  }
  const routeCache = new Map();
  function legFor(r, a) {
    const k = r.id + '>' + a.id;
    if (routeCache.has(k)) return routeCache.get(k);
    let leg = null;
    const P = restPlace(r), Q = MV().place(a.place);
    if (P && Q && P.city === a.city) {
      try { const rt = MV().route(P.id, Q.id, 'drive'); if (rt) leg = { km: rt.km, min: rt.min, pts: rt.pts }; } catch (e) { leg = null; }
      if (!leg) { const km = Math.hypot(P.x - Q.x, P.y - Q.y) * 1.3; leg = { km, min: km * 2.4, pts: [[P.x, P.y], [Q.x, Q.y]] }; }
    }
    routeCache.set(k, leg);
    return leg;
  }
  function delivery(r, a) {
    const leg = legFor(r, a || addrOf(st().addr));
    if (!leg) return null;
    const fee = Math.max(3, Math.min(15, Math.round(3 + leg.km * 0.7)));
    const eta = r.prep + Math.round(leg.min * 1.25) + 4;
    return { fee, eta, km: leg.km, range: Math.max(10, eta - 4) + '–' + (eta + 6) + ' min' };
  }
  function itemById(r, id) { for (const c of r.menu) for (const it of c.items) if (it.id === id) return it; return null; }

  // ── cart ──
  function cart() { return st().cart; }
  function cartCount() { const c = cart(); return c ? c.items.reduce((a, b) => a + b.q, 0) : 0; }
  function cartSub() { const c = cart(); return c ? c.items.reduce((a, b) => a + b.p * b.q, 0) : 0; }
  function cartChanged() { save(); JC.bus.emit('lotuseats:cart'); }

  JC.app({
    id: 'lotuseats',
    name: 'Lotus Eats',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-lotuseats');
      win.el.style.setProperty('--tint', TINT);
      const offs = [];
      const tabs = JC.ui.tabs(body, {
        tint: TINT,
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'browse', title: 'Browse', icon: 'square.grid.2x2.fill', root: () => browsePage() },
          { id: 'orders', title: 'Orders', icon: 'bag.fill', root: () => ordersPage() },
          { id: 'account', title: 'Account', icon: 'person.crop.circle', root: () => accountPage() },
        ],
        search: { id: 'search', title: 'Search', icon: 'magnifyingglass', root: () => searchPage() },
        active: 'home',
      });
      const refreshTop = (ids) => (ids || ['home', 'browse', 'orders', 'account', 'search']).forEach((id) => { const n = tabs.nav(id); if (n && n.top()) n.top().render(); });
      offs.push(JC.bus.on('lotuseats:cart', () => { updateBars(); }));
      offs.push(JC.bus.on('store:orders', () => { badge(); const hn = tabs.nav('home'); if (hn && hn.depth() === 1 && hn.top() && hn.top().el.isConnected) hn.top().render(); }));
      function badge() { tabs.badge('orders', JC.store.all('orders').filter((o) => o.status === 'active').length || 0); }
      badge();

      // ═══ shared bits ═══
      function cartBtn() {
        const n = cartCount();
        return h('div.le-iconbtn.le-cartbtn', { onTap: () => openCart() }, JC.icon('bag.fill', { size: 20 }), n ? h('span.le-cbadge', String(n)) : null);
      }
      function cartBar() {
        const el = h('div.le-cartbar');
        fillBar(el);
        return el;
      }
      function fillBar(el) {
        const c = cart();
        el.innerHTML = '';
        el.classList.toggle('on', !!(c && c.items.length));
        if (!c || !c.items.length) return;
        const r = rest(c.rest);
        el.append(h('div.le-cartbar-in', { onTap: () => openCart() }, h('span.le-cartbar-n', String(cartCount())), h('div.le-cartbar-m', h('b', 'View cart'), h('span', r ? r.name : '')), h('span.le-cartbar-p', yen(cartSub()))));
      }
      function updateBars() {
        body.querySelectorAll('.le-cartbar').forEach(fillBar);
        body.querySelectorAll('.le-cartbtn').forEach((b) => { const nb = cartBtn(); b.replaceWith(nb); });
      }
      function heart(r, cls) {
        const on = st().favs.includes(r.id);
        return h('div.le-heart' + (cls || ''), { class: { on }, onTap: (e) => { e.stopPropagation(); toggleFav(r); const el = e.currentTarget; el.classList.toggle('on', st().favs.includes(r.id)); el.innerHTML = ''; el.appendChild(JC.icon(st().favs.includes(r.id) ? 'heart.fill' : 'heart', { size: 18, weight: 2.2 })); } }, JC.icon(on ? 'heart.fill' : 'heart', { size: 18, weight: 2.2 }));
      }
      function toggleFav(r) {
        const S = st();
        const i = S.favs.indexOf(r.id);
        if (i >= 0) S.favs.splice(i, 1); else S.favs.push(r.id);
        save();
        JC.ui.toast(i >= 0 ? 'Removed from Favourites' : 'Saved to Favourites', { icon: i >= 0 ? 'heart' : 'heart.fill' });
      }
      function heroEl(r, cls) {
        if (r.art) return JC.art.el(r.art, { cls: 'le-hero-img' + (cls ? ' ' + cls : '') });
        return h('div.le-hero-img.le-hero-' + (r.hero || 'plain') + (cls ? '.' + cls : ''), JC.icon(r.shop ? 'pawprint.fill' : 'bag.fill', { size: 44 }));
      }
      function restCard(r, o) {
        o = o || {};
        const hi = hoursOf(r);
        const dv = delivery(r);
        const card = h('div.le-rcard', { class: { closed: !hi.open, mini: !!o.mini }, onTap: () => openRest(r.id) },
          h('div.le-rcard-img', heroEl(r), !hi.open ? h('div.le-closed', h('b', 'Closed'), h('span', hi.text.replace('Closed · ', ''))) : null,
            r.promo && hi.open ? h('div.le-promo-badge', JC.icon('tag.fill', { size: 11 }), ' ' + r.promo) : null, o.mini ? null : heart(r)),
          h('div.le-rcard-m',
            h('div.le-rcard-t', h('span', r.name + (r.branch && !o.mini ? ' (' + r.branch + ')' : '')), h('span.le-rate', JC.icon('star.fill', { size: 11 }), ' ' + r.rating.toFixed(1))),
            h('div.le-rcard-s', dv ? (hi.open ? dv.range : 'Schedule') + ' · ' + yen0(dv.fee) + ' delivery · ' + MV().fmtDist(dv.km) : r.cuisine + ' · ' + cityOfRest(r) + ' only')));
        return card;
      }
      function sectionH(t, right) { return h('div.le-h', h('span', t), right || null); }

      // ═══ HOME ═══
      function homePage() {
        const page = PAGE({
          navbar: false, cls: 'le-home',
          footer: cartBar(),
          content: () => {
            const S = st();
            const a = addrOf(S.addr);
            const list = D().RESTS.filter((r) => cityOfRest(r) === a.city);
            const open = list.filter((r) => hoursOf(r).open);
            const closed = list.filter((r) => !hoursOf(r).open);
            const pastRests = [];
            JC.store.all('orders').slice().sort((x, y) => y.t - x.t).forEach((o) => { if (!pastRests.includes(o.rest) && rest(o.rest)) pastRests.push(o.rest); });
            const favs = S.favs.map(rest).filter(Boolean);
            const active = JC.store.all('orders').find((o) => o.status === 'active');
            return [
              h('div.le-top',
                h('div.le-addr', { onTap: () => addrSheet(() => page.render()) }, h('small', 'Deliver now'), h('b', h('span', a.id === 'here' ? 'Jinxing Road 27' : a.label), JC.icon('chevron.down', { size: 12, weight: 3 }))),
                h('div.le-topbtns', h('div.le-iconbtn', { onTap: () => notifSheet() }, JC.icon('bell.fill', { size: 19 })), cartBtn())),
              h('div.le-search', { onTap: () => tabs.select('search', true) }, JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), h('span', 'Dishes, restaurants or cuisines')),
              active ? h('div.le-live', { onTap: () => openOrder(active.id) }, h('div.le-live-ic', JC.icon('scooter', { size: 22 })), h('div', h('b', phaseTitle(active)), h('span', restName(rest(active.rest) || { name: '' }) + ' · ' + phaseSub(active))), JC.icon('chevron.right', { size: 14, weight: 2.6 })) : null,
              h('div.le-cats.hscroll', D().CATS.map((c) => h('div.le-cat', { onTap: () => tabs.nav().push(catPage(c)) }, h('div.le-cat-ic', c.art ? JC.art.el(c.art, { cls: 'le-cat-art' }) : JC.icon(c.icon, { size: 26 })), h('span', c.n)))),
              h('div.le-promos.hscroll',
                promoCard('20% off hotpot', 'This weekend only · Laoma Hotpot, Gusu', 'food_hotpot', '#c8102e', () => openRest('laoma-hotpot')),
                promoCard('Up late?', 'Congee, skewers and dumplings — open now near you', 'food_congee', '#2b2340', () => tabs.nav().push(catPage(D().CATS[0]))),
                promoCard('Send a little care', 'Add a handwritten get-well note to soup orders', 'food_soup', '#2f7d5b', () => openRest('auntie-lu'))),
              pastRests.length ? [sectionH('Order again'), h('div.le-again.hscroll', pastRests.map((id) => { const r = rest(id); return h('div.le-again-c', { onTap: () => openRest(id) }, h('div.le-again-img', heroEl(r)), h('b', r.name), h('span', r.branch || cityOfRest(r))); }))] : null,
              favs.length ? [sectionH('Your favourites'), h('div.le-favs.hscroll', favs.map((r) => restCard(r, { mini: true })))] : null,
              sectionH(open.length ? 'Open now near you' : 'Nothing open nearby', h('span.le-hsub', a.city)),
              open.length ? h('div.le-rlist', open.map((r) => restCard(r))) : h('div.le-empty', 'Everything near ' + a.label + ' is closed right now. You can still schedule an order.'),
              closed.length ? [sectionH('Opening later'), h('div.le-rlist', closed.map((r) => restCard(r)))] : null,
              h('div.le-foot', h('span', 'Lotus Eats · Delivering in Lanling, Gusu, Yunmeng'), h('span.tap', { onTap: () => JC.os.open('safari', { search: 'lotus eats help' }) }, 'Help')),
            ];
          },
        });
        return page;
      }
      function promoCard(t, s, art, c, fn) { return h('div.le-promo', { style: { '--c': c }, onTap: fn }, h('div.le-promo-m', h('b', t), h('span', s), h('span.le-promo-go', 'Order now')), JC.art.el(art, { cls: 'le-promo-art' })); }

      // ═══ BROWSE ═══
      function browsePage() {
        return PAGE({
          title: 'Browse', large: true, cls: 'le-browse', footer: cartBar(),
          content: () => [
            h('div.le-grid', D().CATS.map((c) => h('div.le-tile', { onTap: (e) => { void e; tabs.nav('browse').push(catPage(c)); } }, h('div.le-tile-img', c.art ? JC.art.el(c.art, { cls: 'le-tile-art' }) : h('div.le-tile-ic', JC.icon(c.icon, { size: 34 }))), h('span', c.n)))),
            sectionH('All restaurants'),
            h('div.le-rlist', D().RESTS.slice().sort((a, b) => (cityOfRest(a) === addrOf(st().addr).city ? 0 : 1) - (cityOfRest(b) === addrOf(st().addr).city ? 0 : 1)).map((r) => restCard(r))),
          ],
        });
      }
      function matchRest(r, words) {
        const hay = [r.name, r.branch || '', r.cuisine, cityOfRest(r), (r.tags || []).join(' '), r.menu.map((c) => c.items.map((i) => i.n).join(' ')).join(' ')].join(' ').toLowerCase();
        return words.some((w) => hay.includes(w));
      }
      function catPage(c) {
        return PAGE({
          title: c.n, cls: 'le-catpage', footer: cartBar(),
          content: () => {
            const a = addrOf(st().addr);
            const all = D().RESTS.filter((r) => matchRest(r, c.q));
            const near = all.filter((r) => cityOfRest(r) === a.city);
            const far = all.filter((r) => cityOfRest(r) !== a.city);
            return [
              h('div.le-catbanner', c.art ? JC.art.el(c.art, { cls: 'le-catbanner-art' }) : h('div.le-catbanner-ic', JC.icon(c.icon, { size: 40 })), h('div', h('b', c.n), h('span', near.length + ' near ' + (a.id === 'here' ? 'you' : a.label)))),
              near.length ? h('div.le-rlist', near.map((r) => restCard(r))) : h('div.le-empty', 'No ' + c.n.toLowerCase() + ' delivers to ' + a.label + ' yet.'),
              far.length ? [sectionH('In other cities'), h('div.le-rlist', far.map((r) => restCard(r)))] : null,
            ];
          },
        });
      }

      // ═══ SEARCH ═══
      function searchPage() {
        let q = '';
        const page = PAGE({
          title: 'Search', large: true, cls: 'le-searchp', footer: cartBar(),
          search: { placeholder: 'Dishes, restaurants or cuisines', onInput: (v) => { q = v; page.render(); }, onSubmit: (v) => { addRecent(v); page.render(); } },
          content: () => {
            const S = st();
            const qq = q.trim().toLowerCase();
            if (!qq) {
              return [
                S.recent.length ? [sectionH('Recent searches', h('span.le-hlink.tap', { onTap: () => { S.recent = []; save(); page.render(); } }, 'Clear')), JC.ui.list([{ rows: S.recent.map((t) => ({ leading: h('div.le-sric', JC.icon('clock.fill', { size: 15 })), title: t, onTap: () => { page.searchEl.querySelector('.search').setValue(t); q = t; page.render(); } })) }], { cls: 'le-list' })] : null,
                sectionH('Top categories'),
                h('div.le-chips', D().CATS.map((c) => h('span.le-chip.tap', { onTap: () => tabs.nav('search').push(catPage(c)) }, c.n))),
              ];
            }
            const words = qq.split(/\s+/).filter(Boolean);
            const rs = D().RESTS.filter((r) => words.every((w) => matchRest(r, [w])));
            const dishes = [];
            D().RESTS.forEach((r) => r.menu.forEach((c) => c.items.forEach((it) => { if (words.every((w) => (it.n + ' ' + it.d).toLowerCase().includes(w)) && !dishes.some((d) => d.r === r && d.it.id === it.id)) dishes.push({ r, it }); })));
            return [
              rs.length ? [sectionH('Restaurants'), h('div.le-rlist', rs.map((r) => restCard(r)))] : null,
              dishes.length ? [sectionH('Dishes'), JC.ui.list([{ rows: dishes.slice(0, 12).map(({ r, it }) => ({ leading: it.art ? JC.art.el(it.art, { cls: 'le-dish-art' }) : h('div.le-dish-ph', JC.icon('fork.knife', { size: 18 })), title: it.n, subtitle: restName(r) + ' · ' + yen0(it.p), chevron: true, onTap: () => { addRecent(q); openRest(r.id, it.id); } })) }], { cls: 'le-list' })] : null,
              !rs.length && !dishes.length ? JC.ui.empty({ icon: 'magnifyingglass', title: 'No results for “' + q.trim() + '”', text: 'Try “congee”, “soup” or “hotpot”.' }) : null,
            ];
          },
        });
        return page;
      }
      function addRecent(v) { v = String(v || '').trim(); if (!v) return; const S = st(); S.recent = [v].concat(S.recent.filter((x) => x.toLowerCase() !== v.toLowerCase())).slice(0, 6); save(); }

      // ═══ RESTAURANT ═══
      function openRest(id, itemId) {
        let r = rest(id);
        if (!r) {
          // a map place id that isn't on Lotus Eats (or one that's hosted under another listing)
          const p = MV().place(id);
          r = D().RESTS.find((x) => x.place === id) || null;
          if (!r) { JC.ui.alert({ title: p ? (p.short || p.name) + ' isn’t on Lotus Eats' : 'Restaurant Not Found', message: p ? 'They don’t deliver through Lotus Eats yet. Try calling them, or browse what’s open near you.' : 'This restaurant may have closed.', buttons: [{ text: 'OK' }] }); return; }
        }
        const nav = tabs.nav();
        const pg = restPage(r);
        nav.push(pg);
        if (itemId) { const it = itemById(r, itemId); if (it) setTimeout(() => itemSheet(r, it), 520); }
      }
      function restPage(r) {
        let menuSec = null;
        const page = PAGE({
          title: r.name, cls: 'le-restp', footer: cartBar(),
          right: [JC.ui.navBtn({ icon: 'magnifyingglass', label: 'Search menu', onTap: () => menuSearch(r) }), JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share', onTap: () => JC.ui.share({ title: r.name, subtitle: 'Lotus Eats · ' + r.cuisine, icon: 'bag.fill', payload: { kind: 'link', url: 'https://lotuseats.app/r/' + r.id, text: r.name + ' on Lotus Eats' } }) }), JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: st().favs.includes(r.id) ? 'Remove from Favourites' : 'Add to Favourites', icon: 'heart', onTap: () => { toggleFav(r); } }, { text: 'Show on Map', icon: 'map', onTap: () => JC.os.open('maps', { place: r.place }) }, { text: 'Call Restaurant', icon: 'phone.fill', onTap: () => MV().callPlace(r.place) }, '-', { text: 'Report a Problem', icon: 'exclamationmark.bubble', onTap: () => JC.ui.alert({ title: 'Report a Problem', message: 'What’s wrong with this listing?', input: { placeholder: 'Wrong hours, menu, photos…' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default' }] }).then((x) => { if (x.index === 1) JC.ui.toast('Thanks — we’ll take a look', { icon: 'checkmark' }); }) }]) })],
          onScroll: (y) => { page.el.classList.toggle('le-solid', y > 170); if (menuSec) { const chips = page.el.querySelector('.le-menutabs'); if (chips) chips.classList.toggle('stuck', y > 330); } },
          content: () => {
            const a = addrOf(st().addr);
            const hi = hoursOf(r);
            const dv = delivery(r, a);
            const P = restPlace(r);
            menuSec = h('div.le-menu', r.menu.map((c, ci) => h('div.le-msec', { data: { ci: String(ci) } }, h('div.le-msec-t', c.cat), c.items.map((it) => itemRow(r, it)))));
            return [
              h('div.le-rhero', heroEl(r, 'le-rhero-img'), h('div.le-rhero-fade')),
              h('div.le-rinfo',
                h('div.le-rname', r.name), r.branch ? h('div.le-rbranch', r.branch) : null,
                h('div.le-rmeta', h('span.le-rate', JC.icon('star.fill', { size: 12 }), ' ' + r.rating.toFixed(1)), h('span', ' (' + r.reviews + ' ratings) · ' + r.cuisine + ' · ' + r.price)),
                h('div.le-rmeta2', h('span', { class: { 'le-open': hi.open, 'le-shut': !hi.open } }, hi.text), P ? h('span', ' · ' + P.addr.split(',')[0]) : null),
                r.away && !hi.open ? h('div.le-away', h('div.le-away-av', JC.ui.avatar('wwx', 30)), h('span', r.away)) : null,
                h('div.le-rstats',
                  h('div', h('b', dv ? (hi.open ? dv.range.replace(' min', '') : 'Later') : '—'), h('span', dv ? (hi.open ? 'min' : 'schedule') : 'out of range')),
                  h('div', h('b', dv ? yen0(dv.fee) : '—'), h('span', 'delivery')),
                  h('div', h('b', dv ? MV().fmtDist(dv.km) : cityOfRest(r)), h('span', dv ? 'away' : 'only')),
                  h('div.tap', { onTap: () => reviewsSheet(r) }, h('b', r.rating.toFixed(1) + ' ★'), h('span', 'reviews'))),
                !dv ? h('div.le-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' ' + r.name + ' only delivers within ' + cityOfRest(r) + '. Your address (' + a.label + ') is in ' + a.city + '.', h('span.tap', { onTap: () => addrSheet(() => page.render()) }, ' Change')) : null,
                r.promo ? h('div.le-offer', JC.icon('tag.fill', { size: 14 }), ' ' + r.promo) : null,
                r.note ? h('div.le-rnote', r.note) : null),
              h('div.le-menutabs.hscroll', r.menu.map((c, ci) => h('span.le-mtab.tap', { onTap: () => { const sec = page.el.querySelector('.le-msec[data-ci="' + ci + '"]'); if (sec) page.scroll.scrollTo({ top: sec.offsetTop - 120, behavior: 'smooth' }); } }, c.cat))),
              menuSec,
              h('div.le-rfoot', P ? P.addr : '', h('br'), 'Prices on Lotus Eats may be higher than in the restaurant.'),
            ];
          },
        });
        return page;
      }
      function itemRow(r, it) {
        const inCart = cart() && cart().rest === r.id ? cart().items.filter((x) => x.id === it.id).reduce((a, b) => a + b.q, 0) : 0;
        return h('div.le-item', { onTap: () => itemSheet(r, it) },
          h('div.le-item-m', h('div.le-item-n', inCart ? h('span.le-qbadge', inCart + '×') : null, it.n), it.tag ? h('div.le-item-tag', it.tag) : null, h('div.le-item-d', it.d), h('div.le-item-p', yen0(it.p))),
          h('div.le-item-r', it.art ? JC.art.el(it.art, { cls: 'le-item-art' }) : null, h('div.le-add', { onTap: (e) => { e.stopPropagation(); if (it.opts && it.opts.some((g) => g.req)) itemSheet(r, it); else quickAdd(r, it); } }, JC.icon('plus', { size: 16, weight: 2.8 }))));
      }
      function quickAdd(r, it) { addToCart(r, { id: it.id, n: it.n, p: it.p, q: 1, opts: '' }); }
      function addToCart(r, line) {
        const S = st();
        const go = () => {
          if (!S.cart || S.cart.rest !== r.id) S.cart = { rest: r.id, items: [], utensils: false };
          const key = line.id + '|' + (line.opts || '') + '|' + (line.note || '');
          const ex = S.cart.items.find((x) => x.key === key);
          if (ex) ex.q += line.q; else S.cart.items.push(Object.assign({ key }, line));
          cartChanged();
          JC.audio.play('tap');
          JC.ui.toast('Added to cart · ' + line.n, { icon: 'bag.fill' });
          refreshItems();
        };
        if (S.cart && S.cart.items.length && S.cart.rest !== r.id) {
          const old = rest(S.cart.rest);
          JC.ui.alert({ title: 'Start a New Cart?', message: 'Your cart has items from ' + (old ? old.name : 'another restaurant') + '. Start a new cart with ' + r.name + ' instead?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'New Cart', style: 'destructive', onTap: go }] });
          return;
        }
        go();
      }
      function refreshItems() {
        const n = tabs.nav();
        const top = n && n.top();
        if (top && top.el.classList.contains('le-restp')) top.render();
      }
      function itemSheet(r, it) {
        const sel = (it.opts || []).map((g) => (g.one ? new Set([g.ch[0][0]]) : new Set()));
        let q = 1, note = '';
        const unit = () => it.p + (it.opts || []).reduce((acc, g, gi) => acc + g.ch.filter((c) => sel[gi].has(c[0])).reduce((a, c) => a + c[1], 0), 0);
        const s = SHEET({
          detent: 'large', cls: 'le-isheet', left: { icon: 'xmark' }, title: '',
          content: () => [
            it.art ? JC.art.el(it.art, { cls: 'le-isheet-art' }) : null,
            h('div.le-isheet-m', h('div.le-isheet-n', it.n), h('div.le-isheet-p', yen0(it.p)), h('div.le-isheet-d', it.d), it.alcohol ? h('div.le-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' 18+ only. The rider will check ID on delivery.') : null),
            (it.opts || []).map((g, gi) => h('div.le-og',
              h('div.le-og-h', h('b', g.n), h('span.le-og-req', { class: { req: !!g.req } }, g.req ? 'Required' : 'Optional')),
              g.ch.map(([label, add]) => h('div.le-oc', { onTap: () => { if (g.one) { sel[gi].clear(); sel[gi].add(label); } else if (sel[gi].has(label)) sel[gi].delete(label); else sel[gi].add(label); s.render(); } },
                h('span.le-oc-mark', { class: { on: sel[gi].has(label), radio: !!g.one } }, sel[gi].has(label) ? JC.icon('checkmark', { size: 13, weight: 3 }) : null),
                h('span.le-oc-l', label), add ? h('span.le-oc-p', '+' + yen0(add)) : null)))),
            h('div.le-og', h('div.le-og-h', h('b', 'Special instructions'), h('span.le-og-req', 'Optional')),
              JC.ui.input({ value: note, placeholder: r.id === 'peony-bakery' ? 'Message on cake, e.g. “Happy 18th, A-Ling”' : 'e.g. no scallion, extra napkins', cls: 'le-note-in', multiline: true, rows: 2, onInput: (v) => { note = v; } })),
            h('div.le-isheet-foot',
              h('div.le-qty', h('div.le-qbtn', { class: { off: q <= 1 }, onTap: () => { if (q > 1) { q--; s.render(); } } }, JC.icon('minus', { size: 16, weight: 2.8 })), h('b', String(q)), h('div.le-qbtn', { onTap: () => { q = Math.min(99, q + 1); s.render(); } }, JC.icon('plus', { size: 16, weight: 2.8 }))),
              JC.ui.btn({ text: 'Add ' + q + ' to cart · ' + yen(unit() * q), kind: 'filled', size: 'l', cls: 'le-addbtn', onTap: () => {
                const optText = (it.opts || []).map((g, gi) => [...sel[gi]].join(', ')).filter(Boolean).join(' · ');
                s.close();
                addToCart(r, { id: it.id, n: it.n, p: unit(), q, opts: optText, note: note.trim() });
              } })),
          ],
        });
        return s;
      }
      function menuSearch(r) {
        let q = '';
        const s = SHEET({ title: 'Search ' + r.name, detent: 'large', left: { text: 'Done' }, content: () => {
          const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
          const hits = [];
          r.menu.forEach((c) => c.items.forEach((it) => { if (!words.length || words.every((w) => (it.n + ' ' + it.d).toLowerCase().includes(w))) hits.push(it); }));
          return [h('div.le-msearch', JC.ui.search({ placeholder: 'Search menu', onInput: (v) => { q = v; const list = s.body.querySelector('.le-mresults'); if (list) list.replaceWith(results()); } })), results()];
          function results() { return h('div.le-mresults', hits.length || !words.length ? h('div.le-menu', (words.length ? hits.filter((it) => words.every((w) => (it.n + ' ' + it.d).toLowerCase().includes(w))) : hits).map((it) => itemRow(r, it))) : JC.ui.empty({ icon: 'fork.knife', title: 'No matching dishes' })); }
        } });
        void s;
      }
      function reviewsSheet(r) {
        const RV = {
          'yiling-popup': [['lan zhan', 5, 'Mn.'], ['A-Yuan', 5, 'Best radish cake in Lanling. My dad made me write this. It’s also true.'], ['anonymous', 4, 'The salad is spicier than the description. The description says “Yiling”. I should have listened.']],
          'auntie-lu': [['Gusu student', 5, 'Tastes like someone cares about you.'], ['Hanshi regular', 5, 'Gentle and warming. 🙂'], ['W.', 5, 'someone sent me this when i had the flu and won’t admit it. 10/10 soup. 10/10 brother']],
          'night-owl-ll': [['Jinxing night shift', 5, 'The only thing open at 3 a.m. that loves you back.'], ['Ms. Q', 4, 'Baozi a little small. Congee perfect.']],
          'laoma-hotpot': [['Brother Nie', 5, 'Hehe~ the reunion table was the best night 🙈'], ['A.', 4, 'Too spicy for the Lan family. Perfect for everyone else.']],
        }[r.id] || [['Lotus Eats customer', 5, 'Fast delivery, still hot.'], ['Regular', 4, 'Reliable. Would order again.'], ['Night owl', 5, 'Exactly what I needed.']];
        SHEET({ title: 'Ratings & reviews', detent: 'large', left: { text: 'Done' }, content: () => [
          h('div.le-rvhead', h('b', r.rating.toFixed(1)), h('div', h('div.le-stars', '★★★★★'.slice(0, Math.round(r.rating))), h('span', r.reviews + ' ratings'))),
          JC.ui.list([{ rows: RV.map(([who, n, t]) => ({ title: who, subtitle: t, clamp: false, detail: '★'.repeat(n) })) }], { cls: 'le-list le-rvlist' }),
        ] });
      }

      // ═══ CART & CHECKOUT ═══
      function openCart() {
        const c = cart();
        const nav = tabs.nav();
        if (!c || !c.items.length) {
          JC.ui.alert({ title: 'Your Cart Is Empty', message: 'Add something from a restaurant to get started.', buttons: [{ text: 'OK' }] });
          return;
        }
        const top = nav.top();
        if (top && (top.el.classList.contains('le-cartp') || top.el.classList.contains('le-checkout'))) return;
        nav.push(cartPage());
      }
      function cartPage() {
        const page = PAGE({
          title: 'Cart', cls: 'le-cartp', bg: 'grouped',
          onShow: () => tabs.hideBar(true), onHide: () => tabs.hideBar(false), onClose: () => tabs.hideBar(false),
          right: [JC.ui.navBtn({ text: 'Clear', onTap: () => JC.ui.alert({ title: 'Clear Cart?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onTap: () => { st().cart = null; cartChanged(); page.nav.pop(); } }] }) })],
          content: () => {
            const c = cart();
            if (!c || !c.items.length) return [JC.ui.empty({ icon: 'bag.fill', title: 'Your cart is empty', action: { text: 'Browse restaurants', onTap: () => page.nav.popToRoot() } })];
            const r = rest(c.rest);
            return [
              h('div.le-cart-rest', { onTap: () => page.nav.pop() }, h('div.le-cart-rimg', heroEl(r)), h('div', h('b', r.name), h('span', r.branch || cityOfRest(r))), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
              JC.ui.list([{ rows: c.items.map((x) => ({ custom: h('div.le-cline',
                h('div.le-cline-m', h('b', x.n), x.opts ? h('span', x.opts) : null, x.note ? h('span.le-cline-note', '“' + x.note + '”') : null, h('span.le-cline-p', yen(x.p * x.q))),
                h('div.le-qty.sm', h('div.le-qbtn', { onTap: () => { x.q -= 1; if (x.q <= 0) c.items.splice(c.items.indexOf(x), 1); if (!c.items.length) st().cart = null; cartChanged(); page.render(); if (!cart()) setTimeout(() => page.nav.pop(), 250); } }, JC.icon(x.q <= 1 ? 'trash' : 'minus', { size: 15, weight: 2.6 })), h('b', String(x.q)), h('div.le-qbtn', { onTap: () => { x.q = Math.min(99, x.q + 1); cartChanged(); page.render(); } }, JC.icon('plus', { size: 15, weight: 2.8 })))) })) },
              { rows: [{ title: 'Add more items', tinted: true, onTap: () => page.nav.pop() }, { title: 'Utensils & napkins', subtitle: 'Only ask for them if you need them', toggle: { on: !!c.utensils, onChange: (v) => { c.utensils = v; cartChanged(); } } }] }], { cls: 'le-list' }),
              h('div.le-sum', h('div', h('span', 'Subtotal'), h('b', yen(cartSub())))),
              h('div.le-cta-wrap', JC.ui.btn({ text: 'Go to checkout', kind: 'filled', size: 'l', cls: 'le-cta', onTap: () => page.nav.push(checkoutPage()) })),
            ];
          },
        });
        return page;
      }
      function checkoutPage() {
        const S = st();
        const ck = { drop: 'Hand it to me', note: '', anon: false, tip: 3, when: null, promo: null };
        const page = PAGE({
          title: 'Checkout', cls: 'le-checkout', bg: 'grouped',
          onShow: () => tabs.hideBar(true), onHide: () => tabs.hideBar(false), onClose: () => tabs.hideBar(false),
          content: () => {
            const c = cart();
            if (!c) return [JC.ui.empty({ icon: 'bag.fill', title: 'Your cart is empty' })];
            const r = rest(c.rest);
            const a = addrOf(S.addr);
            const hi = hoursOf(r);
            const dv = delivery(r, a);
            if (!hi.open && !ck.when) ck.when = nextOpen(r);
            const T = totals(r, c, dv, ck);
            const card = cardOf(S.card);
            return [
              JC.ui.list([{ header: 'Deliver to', rows: [
                { icon: { glyph: a.icon || 'mappin', bg: TINT }, title: a.label, subtitle: a.line + ', ' + a.city, chevron: true, onTap: () => addrSheet(() => page.render()) },
                { icon: { glyph: 'hand.raised', bg: '#8e8e93' }, title: 'Drop-off', detail: ck.drop, chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Drop-off options', actions: ['Hand it to me', 'Leave at the door', 'Meet outside', 'Leave at reception'].map((t) => ({ text: t, onTap: () => { ck.drop = t; page.render(); } })) }) },
                { icon: { glyph: 'clock.fill', bg: '#30b0c7' }, title: hi.open ? (ck.when ? 'Scheduled' : 'Standard') : 'Scheduled', subtitle: ck.when ? U.fmtDate(ck.when, 'day') + ' · ' + U.fmtTime(ck.when) + (hi.open ? '' : ' · ' + r.name + ' is closed now') : (dv ? dv.range : ''), detail: hi.open ? (ck.when ? 'Change' : 'ASAP') : 'Change', chevron: true, onTap: () => whenSheet(r, ck, () => page.render()) },
              ] }], { cls: 'le-list' }),
              !dv ? h('div.le-warn.block', JC.icon('exclamationmark.triangle.fill', { size: 15 }), ' ' + r.name + ' doesn’t deliver to ' + a.city + '. Choose an address in ' + cityOfRest(r) + '.') : null,
              JC.ui.list([{ header: 'Note to rider', footer: ck.anon ? 'Sent as a gift: the receipt and the rider won’t show your name.' : null, rows: [
                { custom: JC.ui.input({ value: ck.note, placeholder: 'Gate code, landmarks, anything else…', cls: 'le-field', multiline: true, rows: 2, onInput: (v) => { ck.note = v; } }) },
                { custom: h('div.le-qchips.hscroll', ['Leave it at the door', 'Call when you arrive', 'Don’t say who it’s from.', 'Tell him to eat the vegetables.'].map((t) => h('span.le-chip.tap', { onTap: () => { ck.note = t; if (/who it’s from/.test(t)) ck.anon = true; page.render(); } }, t))) },
                { title: 'Send as a gift (hide my name)', toggle: { on: ck.anon, onChange: (v) => { ck.anon = v; page.render(); } } },
              ] }], { cls: 'le-list' }),
              JC.ui.list([{ header: 'Payment', rows: [
                { leading: h('div.le-cardic', { style: { background: card.color } }), title: 'Wallet Pay · ' + card.short + ' •• ' + card.last, subtitle: card.name, chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Pay with', actions: CARDS.map((cc) => ({ text: cc.name + ' •• ' + cc.last, onTap: () => { S.card = cc.id; save(); page.render(); } })) }) },
                { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promo code', detail: T.discount ? '−' + yen(T.discount) : (ck.promo || 'Add'), chevron: true, onTap: () => promoAlert(r, ck, () => page.render()) },
              ] }], { cls: 'le-list' }),
              h('div.le-tipbox', h('div.le-tip-h', h('b', 'Tip your rider'), h('span', '100% goes to the rider')), h('div.le-tips', [0, 3, 5, 8, 12].map((t) => h('span.le-tip.tap', { class: { on: ck.tip === t }, onTap: () => { ck.tip = t; page.render(); } }, t ? yen0(t) : 'Not now')))),
              h('div.le-sum',
                h('div', h('span', 'Subtotal'), h('span', yen(T.sub))),
                h('div', h('span', 'Delivery fee'), h('span', dv ? yen(T.fee) : '—')),
                h('div', h('span', 'Service fee'), h('span', yen(T.service))),
                T.small ? h('div', h('span', 'Small order fee'), h('span', yen(T.small))) : null,
                T.discount ? h('div.le-disc', h('span', T.discountLabel), h('span', '−' + yen(T.discount))) : null,
                h('div', h('span', 'Rider tip'), h('span', yen(T.tip))),
                h('div.le-total', h('b', 'Total'), h('b', yen(T.total)))),
              h('div.le-cta-wrap', JC.ui.btn({ text: (ck.when ? 'Schedule order · ' : 'Place order · ') + yen(T.total), kind: 'filled', size: 'l', cls: 'le-cta', disabled: !dv, onTap: () => placeOrder(r, a, ck, T) }),
                h('div.le-legal', 'By placing your order you agree to the Lotus Eats terms. ' + (ck.when ? 'You won’t be charged until the restaurant accepts.' : ''))),
            ];
          },
        });
        return page;
      }
      function totals(r, c, dv, ck) {
        const sub = c.items.reduce((a, b) => a + b.p * b.q, 0);
        const fee = dv ? dv.fee : 0;
        const service = Math.min(10, Math.max(1, Math.round(sub * 0.03)));
        const small = sub < 20 ? 3 : 0;
        let discount = 0, discountLabel = '';
        if (r.hotpot && JC.time.date().getDay() !== 1) { discount = Math.round(sub * 0.2 * 100) / 100; discountLabel = 'Hotpot weekend −20%'; }
        else if (ck.promo === 'SOUPCARE' && /soup/i.test(c.items.map((x) => x.n).join(' '))) { discount = Math.min(15, Math.round(sub * 0.1)); discountLabel = 'SOUPCARE'; }
        const tip = ck.tip || 0;
        return { sub, fee, service, small, discount, discountLabel, tip, total: Math.round((sub + fee + service + small - discount + tip) * 100) / 100 };
      }
      function promoAlert(r, ck, done) {
        JC.ui.alert({ title: 'Promo Code', message: r.hotpot ? 'The hotpot weekend discount is already applied.' : 'Enter a code from a Lotus Eats message or email.', input: { placeholder: 'Code', cap: 'characters' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Apply', style: 'default' }] }).then((x) => {
          if (x.index !== 1) return;
          const v = String(x.value || '').trim().toUpperCase();
          if (!v) return;
          if (v === 'SOUPCARE') { ck.promo = v; JC.ui.toast('SOUPCARE applied — 10% off soup', { icon: 'checkmark' }); done(); }
          else if (v === 'HOTPOT20') JC.ui.alert({ title: 'Hotpot Only', message: 'HOTPOT20 applies to hotpot restaurants and is added automatically.', buttons: [{ text: 'OK' }] });
          else JC.ui.alert({ title: 'Invalid Code', message: '“' + v + '” isn’t a valid promo code.', buttons: [{ text: 'OK' }] });
        });
      }
      function whenSheet(r, ck, done) {
        const hi = hoursOf(r);
        const base = hi.open ? JC.time.now() + 45 * 60000 : nextOpen(r);
        const slots = [];
        const d0 = new Date(base); d0.setMinutes(Math.ceil(d0.getMinutes() / 15) * 15, 0, 0);
        for (let i = 0; i < 10; i++) slots.push(d0.getTime() + i * 30 * 60000);
        SHEET({ title: 'Delivery time', detent: 'medium', left: { text: 'Cancel' }, content: (s) => [JC.ui.list([{ rows: (hi.open ? [{ title: 'As soon as possible', subtitle: delivery(r) ? delivery(r).range : '', check: !ck.when, onTap: () => { ck.when = null; s.close(); done(); } }] : []).concat(slots.map((t) => ({ title: U.fmtDate(t, 'day') + ' · ' + U.fmtTime(t), subtitle: (new Date(t).getDate() !== JC.time.date().getDate() ? 'Tomorrow' : 'Tonight') + ' · 30-minute window', check: ck.when === t, onTap: () => { ck.when = t; s.close(); done(); } }))) }], { cls: 'le-list' })] });
      }
      function addrSheet(done) {
        const S = st();
        const s = SHEET({ title: 'Delivery address', detent: 'large', left: { text: 'Done' }, content: () => [
          JC.ui.list([{ rows: addrs().map((a) => ({ icon: { glyph: a.icon || 'mappin.fill', bg: a.id === S.addr ? TINT : '#8e8e93' }, title: a.label, subtitle: a.line + ', ' + a.city, check: a.id === S.addr, onTap: () => { S.addr = a.id; save(); s.close(); if (done) done(); refreshTop(['home', 'browse']); }, swipe: a.custom ? [{ text: 'Delete', color: '#ff3b30', onTap: () => { S.addrs = S.addrs.filter((x) => x.id !== a.id); if (S.addr === a.id) S.addr = 'here'; save(); s.render(); } }] : null })) },
            { rows: [{ title: 'Add a new address', tinted: true, onTap: () => newAddress(() => s.render()) }] }], { cls: 'le-list' }),
        ] });
      }
      function newAddress(done) {
        JC.ui.alert({ title: 'New Address', message: 'Street, building and city', input: { placeholder: 'e.g. 5 Peony Boulevard, Lanling' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((x) => {
          if (x.index !== 1 || !String(x.value || '').trim()) return;
          const v = String(x.value).trim();
          const city = /gusu|cloud recesses/i.test(v) ? 'Gusu' : /yunmeng|lotus pier/i.test(v) ? 'Yunmeng' : /qinghe/i.test(v) ? 'Qinghe' : /yiling/i.test(v) ? 'Yiling' : 'Lanling';
          const anchor = { Gusu: 'auntie-lu', Yunmeng: 'lp-residence', Qinghe: 'unclean-realm', Yiling: 'radish-farm', Lanling: 'player-home' }[city];
          const P = MV().place(anchor) || { x: MV().HOME[0], y: MV().HOME[1] };
          const pl = JC.store.add('places', { name: v.split(',')[0], city, x: P.x + 0.7, y: P.y - 0.5, cat: 'pin', addr: v, minZ: 99, sub: 'Saved address' });
          const S = st();
          const a = { id: 'a_' + Date.now().toString(36), label: v.split(',')[0], line: v, city, place: pl.id, icon: 'mappin.fill', custom: true };
          S.addrs.push(a); S.addr = a.id; save();
          JC.ui.toast('Address saved', { icon: 'checkmark' });
          done && done();
        });
      }

      // ── payment & order creation ──
      function placeOrder(r, a, ck, T) {
        const S = st();
        const c = cart();
        if (!c) return;
        if (c.items.some((x) => { const it = itemById(r, x.id); return it && it.alcohol; }) && !ck.when) {
          const H = JC.time.date().getHours();
          if (H >= 2 && H < 8) { JC.ui.alert({ title: 'Alcohol Not Available', message: 'Alcohol can’t be delivered between 2 and 8 a.m.', buttons: [{ text: 'OK' }] }); return; }
        }
        const pay = JC.wallet && JC.wallet.pay
          ? JC.wallet.pay({ merchant: 'Lotus Eats', sub: r.name, amount: T.total, card: S.card, cat: 'food', place: r.place, note: restName(r) + ' → ' + a.label, sms: 'LOTUS EATS' })
          : JC.ui.alert({ title: 'Confirm Order', message: yen(T.total) + ' will be charged to ' + cardOf(S.card).name + '.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Pay', style: 'default' }] }).then((x) => ({ ok: x.index === 1, card: S.card }));
        pay.then((res) => {
          if (!res || !res.ok) return;
          const rider = D().RIDERS[Math.floor(Math.random() * D().RIDERS.length)];
          const o = JC.store.add('orders', {
            rest: r.id, to: a.id, toLabel: addrName(a), toLine: a.line, t: JC.time.now(), status: ck.when ? 'scheduled' : 'active', phase: ck.when ? 'scheduled' : 'placed', sched: ck.when || null,
            items: c.items.map((x) => ({ id: x.id, n: x.n, q: x.q, p: x.p, opts: x.opts || '', note: x.note || '' })), sub: T.sub, fee: T.fee, service: T.service, small: T.small, discount: T.discount, tip: T.tip, total: T.total,
            card: res.card || S.card, note: ck.note.trim(), anon: ck.anon, drop: ck.drop, utensils: !!c.utensils, eta: delivery(r, a) ? delivery(r, a).eta : 30,
            rider: { name: rider[0], rating: rider[1], vehicle: rider[2] },
          }, { front: true });
          S.cart = null; cartChanged();
          try { JC.story.log(orderLog(o, r, a), { once: 'order:' + o.id }); } catch (e) { /* story not loaded */ }
          JC.story.act('order', { rest: r.id, total: T.total, to: a.id, id: o.id, items: o.items.map((x) => x.id), names: o.items.map((x) => x.n), qty: o.items.reduce((n, x) => n + x.q, 0), anon: !!ck.anon, note: o.note, sched: ck.when || null, card: o.card });
          sms('[Lotus Eats] Order confirmed: ' + r.name + ' (' + cityOfRest(r) + ') → ' + addrName(a) + '. ' + o.items.map((x) => x.q + ' × ' + x.n).slice(0, 2).join(', ') + (o.items.length > 2 ? '…' : '') + (o.note ? '. Note to rider: "' + o.note + '"' : '') + (ck.when ? '. Scheduled for ' + U.fmtDate(ck.when, 'day') + ' ' + U.fmtTime(ck.when) + '.' : '. Estimated arrival ' + U.fmtTime(JC.time.now() + o.eta * 60000) + '.'));
          const nav = tabs.nav();
          tabs.hideBar(false);
          while (nav.depth() > 1 && nav.pop({ instant: true })) { /* unwind */ }
          openOrder(o.id);
          if (!ck.when) startSim(o.id);
        });
      }
      function sms(text) { try { JC.story.incoming('eats', { from: 'eats', text }); } catch (e) { /* story thread missing */ } }
      // The ending card's "What you did with his phone" (the story reactions log what happened next).
      function orderLog(o, r, a) {
        const n = o.items.reduce((k, x) => k + x.q, 0);
        const one = o.items.length === 1 ? o.items[0] : null;
        const low = (t) => (/^[A-Z][a-z]+/.test(t) && !/^[A-Z][a-z]*[A-Z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);
        const dish = one ? (one.q > 1 ? one.q + ' × ' : '') + low(one.n) : n + ' things';
        const from = ' from ' + r.name;
        const soup = o.items.some((x) => x.id === 'al1' || x.id === 'lr1');
        switch (a.id) {
          case 'here': return 'Bought yourself ' + dish + from + ' on his card (' + yen(o.total) + ')';
          case 'gp': return 'Sent ' + dish + from + ' to Room 1808, where Jiang Cheng was asleep';
          case 'koires':
            if (r.id === 'pet-kingdom') return 'Ordered Fairy ' + dish + ' from Pet Kingdom';
            if (r.id === 'peony-bakery') return 'Ordered A-Ling a cake from Peony Bakery, two days early';
            return 'Sent A-Ling ' + dish + from;
          case 'lp': return 'Sent ' + dish + from + ' to Lotus Pier, where nobody was home except Old Huang';
          case 'ymj': return 'Ordered ' + dish + from + ' for the Lotus Pier night desk';
          case 'wh': return 'Ordered ' + dish + from + ' for the Warehouse B night shift';
          case 'jingshi':
            if (soup) return 'Sent Auntie Lu’s lotus root & pork rib soup to the Jingshi' + (o.anon ? ', anonymously. Again.' : ', with his name on it');
            return 'Sent ' + dish + from + ' to the Jingshi';
          default: return 'Ordered ' + dish + from + ' to ' + a.label + ' on his card (' + yen(o.total) + ')';
        }
      }

      // ═══ LIVE ORDER SIMULATION ═══
      const PHASES = ['placed', 'preparing', 'pickup', 'delivering', 'arrived', 'delivered'];
      const sims = {};
      function phaseTitle(o) {
        if (o.status === 'scheduled') return 'Scheduled · ' + U.fmtDate(o.sched, 'day') + ' ' + U.fmtTime(o.sched);
        return { placed: 'Order received', preparing: 'Preparing your order', pickup: 'Rider at the restaurant', delivering: 'On the way', arrived: 'Your rider is here', delivered: 'Delivered' }[o.phase] || 'Order';
      }
      function phaseSub(o) {
        const r = rest(o.rest);
        if (o.status === 'scheduled') return r ? r.name + ' opens later' : '';
        const left = remaining(o);
        return { placed: (r ? r.name : 'The restaurant') + ' is confirming your order', preparing: 'Arriving in about ' + left + ' min', pickup: o.rider.name + ' is collecting your food', delivering: 'Arriving in ' + Math.max(1, left) + ' min', arrived: o.drop === 'Leave at the door' ? 'Left at your door' : o.rider.name + ' is outside', delivered: 'Enjoy your meal' }[o.phase] || '';
      }
      function remaining(o) {
        const sm = sims[o.id];
        const k = sm ? sm.k : 0;
        const idx = PHASES.indexOf(o.phase);
        const frac = Math.min(1, (idx + k) / 4);
        return Math.max(0, Math.round(o.eta * (1 - frac)));
      }
      function arriveAt(o) { return o.t + o.eta * 60000; }
      function startSim(id) {
        const o0 = JC.store.get('orders', id);
        if (!o0 || o0.status !== 'active' || sims[id]) return;
        const r = rest(o0.rest), a = addrOf(o0.to);
        const leg = r && a ? legFor(r, a) : null;
        const sm = sims[id] = { k: 0, phase: o0.phase, timer: null, raf: null, pos: null, leg };
        const dur = { placed: 5000, preparing: 14000, pickup: 4500, delivering: Math.max(16000, Math.min(42000, (leg ? leg.min : 15) * 1400)), arrived: 5000 };
        islandStart(id);
        const run = () => {
          const o = JC.store.get('orders', id);
          if (!o || o.status !== 'active') { stopSim(id); return; }
          const ph = o.phase;
          const t0 = performance.now();
          const step = () => {
            const oo = JC.store.get('orders', id);
            if (!oo || oo.status !== 'active') { stopSim(id); return; }
            sm.k = Math.min(1, (performance.now() - t0) / dur[ph]);
            if (ph === 'delivering' && leg) { const p = MV().along(leg.pts, leg.km * sm.k); sm.pos = [p.x, p.y]; sm.rot = (p.a * 180) / Math.PI + 90; }
            else if (ph === 'pickup' || ph === 'preparing' || ph === 'placed') sm.pos = leg ? leg.pts[0] : null;
            else if (leg) sm.pos = leg.pts[leg.pts.length - 1];
            JC.bus.emit('lotuseats:tick', { id });
            if (sm.k >= 1) {
              const next = PHASES[PHASES.indexOf(ph) + 1];
              advance(id, next);
              if (next !== 'delivered') run();
              return;
            }
            sm.raf = requestAnimationFrame(step);
          };
          sm.raf = requestAnimationFrame(step);
        };
        run();
      }
      function stopSim(id) { const sm = sims[id]; if (sm) { cancelAnimationFrame(sm.raf); delete sims[id]; } JC.os.island.stop(ISL); }
      function advance(id, phase) {
        const o = JC.store.get('orders', id);
        if (!o) return;
        const r = rest(o.rest);
        const patch = { phase };
        if (phase === 'delivered') { patch.status = 'delivered'; patch.end = JC.time.now(); }
        JC.store.update('orders', id, patch);
        const n = { app: 'lotuseats', open: { app: 'lotuseats', intent: { id } } };
        if (phase === 'preparing') JC.notify.push(Object.assign({ title: (r ? r.name : 'Restaurant') + ' accepted your order', body: 'Preparing now · arriving around ' + U.fmtTime(arriveAt(o)) }, n));
        if (phase === 'pickup') JC.notify.push(Object.assign({ title: 'Your rider is at the restaurant', body: o.rider.name + ' is picking up your order.' }, n));
        if (phase === 'delivering') JC.notify.push(Object.assign({ title: 'Your order is on the way', body: o.rider.name + ' · ' + o.rider.vehicle + ' · arriving in ' + Math.max(1, remaining(JC.store.get('orders', id))) + ' min' }, n));
        if (phase === 'arrived') { JC.audio.play('tink'); JC.notify.push(Object.assign({ title: 'Your rider has arrived', body: o.drop === 'Leave at the door' ? 'Your order was left at the door.' : o.rider.name + ' is outside ' + (o.toLabel || 'your address') + '.' }, n)); }
        if (phase === 'delivered') {
          stopSim(id);
          JC.audio.play('success');
          sms('[Lotus Eats] Delivered! Your order from ' + (r ? r.name : 'the restaurant') + ' has arrived at ' + (o.toLabel || 'your address') + '. Enjoy your meal!');
          try { JC.story.act('order_delivered', { id, rest: o.rest, to: o.to }); } catch (e) { /* story not loaded */ }
        }
        if (JC.os.island.has(ISL)) JC.os.island.update(ISL);
      }
      function islandStart(id) {
        JC.os.island.start(ISL, {
          priority: 2, width: 220,
          compact: () => { const o = JC.store.get('orders', id); return { left: h('span.le-isl-l', JC.icon('bag.fill', { size: 16 })), right: h('span.le-isl-r', !o ? '' : o.phase === 'arrived' ? 'Here' : o.phase === 'placed' || o.phase === 'preparing' ? remaining(o) + ' min' : Math.max(1, remaining(o)) + ' min') }; },
          expanded: (el) => {
            const o = JC.store.get('orders', id);
            if (!o) return;
            const r = rest(o.rest);
            const idx = PHASES.indexOf(o.phase);
            el.append(h('div.le-isl-x', h('div.le-isl-top', h('span.le-isl-l.big', JC.icon('bag.fill', { size: 22 })), h('div', h('b', phaseTitle(o)), h('span', (r ? r.name : '') + ' · arriving ' + U.fmtTime(arriveAt(o))))), h('div.le-isl-steps', [0, 1, 2, 3].map((i) => h('i', { class: { on: i < idx || (i === idx && o.phase !== 'placed'), cur: i === Math.min(3, idx) } })))));
          },
          onTap: () => { JC.os.open('lotuseats', { id }); },
        });
      }

      // ═══ ORDERS ═══
      function openOrder(id) {
        const o = JC.store.get('orders', id);
        if (!o) return;
        tabs.select('orders');
        const n = tabs.nav('orders');
        const go = (tries) => {
          while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ }
          if (n.depth() > 1) { if (tries < 12) setTimeout(() => go(tries + 1), 120); return; }
          n.push(o.status === 'active' ? trackPage(id) : orderPage(id));
        };
        go(0);
      }
      function ordersPage() {
        const page = PAGE({
          title: 'Orders', large: true, cls: 'le-orders', refreshOnShow: true,
          onShow: () => page.render(),
          content: () => {
            const all = JC.store.all('orders').slice().sort((a, b) => b.t - a.t);
            const live = all.filter((o) => o.status === 'active' || o.status === 'scheduled');
            const past = all.filter((o) => o.status !== 'active' && o.status !== 'scheduled');
            return [
              live.length ? [sectionH('In progress'), h('div.le-olist', live.map((o) => orderCard(o, true)))] : null,
              sectionH('Past orders'),
              past.length ? h('div.le-olist', past.map((o) => orderCard(o))) : JC.ui.empty({ icon: 'bag.fill', title: 'No orders yet' }),
            ];
          },
        });
        offs.push(JC.bus.on('store:orders', () => { if (page.el.isConnected) page.render(); }));
        return page;
      }
      function orderCard(o, live) {
        const r = rest(o.rest);
        if (!r) return null;
        const d = new Date(o.t);
        return h('div.le-ocard', { class: { live: !!live }, onTap: () => openOrder(o.id) },
          h('div.le-ocard-img', heroEl(r)),
          h('div.le-ocard-m',
            h('b', r.name + (r.branch ? ' · ' + r.branch : '')),
            h('span', live ? phaseTitle(o) : (o.status === 'cancelled' ? 'Cancelled · ' : '') + U.fmtDate(o.t, 'md') + (d.getFullYear() !== JC.time.date().getFullYear() ? ', ' + d.getFullYear() : '') + ' · ' + U.fmtTime(o.t)),
            h('span', o.items.reduce((a, b) => a + b.q, 0) + ' item' + (o.items.reduce((a, b) => a + b.q, 0) === 1 ? '' : 's') + ' · ' + yen(o.total) + ' · to ' + (o.toLabel || addrName(addrOf(o.to))))),
          live ? JC.icon('chevron.right', { size: 14, weight: 2.6 }) : h('div.le-reorder', { onTap: (e) => { e.stopPropagation(); reorder(o); } }, 'Reorder'));
      }
      function reorder(o) {
        const r = rest(o.rest);
        if (!r) return;
        const S = st();
        const go = () => {
          S.cart = { rest: r.id, items: o.items.map((x) => ({ key: x.id + '|' + (x.opts || '') + '|', id: x.id, n: x.n, p: x.p, q: x.q, opts: x.opts || '' })), utensils: false };
          if (cityOfRest(r) !== addrOf(S.addr).city) { const m = addrs().find((a) => a.id === o.to); if (m) S.addr = m.id; }
          cartChanged();
          tabs.select('orders');
          tabs.nav('orders').push(cartPage());
        };
        if (S.cart && S.cart.items.length) JC.ui.alert({ title: 'Replace Your Cart?', message: 'Reordering replaces what’s in your cart now.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Replace', style: 'destructive', onTap: go }] });
        else go();
      }
      function orderPage(id) {
        const page = PAGE({
          title: 'Order details', cls: 'le-opage', bg: 'grouped',
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share receipt', onTap: () => { const o = JC.store.get('orders', id); const r = rest(o.rest); JC.ui.share({ title: 'Lotus Eats receipt', subtitle: r.name + ' · ' + yen(o.total), icon: 'bag.fill', payload: { kind: 'text', text: 'Lotus Eats · ' + r.name + ' → ' + (o.anon ? '(gift)' : addrOf(o.to).label) + ' · ' + U.fmtDate(o.t, 'medium') + ' · ' + yen(o.total) } }); } })],
          content: () => {
            const o = JC.store.get('orders', id);
            if (!o) return [JC.ui.empty({ icon: 'bag.fill', title: 'Order not found' })];
            const r = rest(o.rest);
            const a = addrOf(o.to);
            const P = restPlace(r), Q = MV().place(a.place);
            const leg = legFor(r, a);
            const card = cardOf(o.card);
            return [
              P && Q ? h('div.le-omap', MV().thumb(a.place, { w: 370, h: 150, style: 'explore', fit: [[P.x, P.y], [Q.x, Q.y]], routes: leg ? [{ pts: leg.pts, color: TINT, width: 4 }] : [], marker: false, dots: [{ at: [P.x, P.y], color: TINT }, { at: [Q.x, Q.y], color: '#1c1c1e' }] })) : null,
              h('div.le-ohead', h('div.le-ohead-img', heroEl(r)), h('div', h('b', r.name), h('span', (o.status === 'cancelled' ? 'Cancelled' : o.status === 'scheduled' ? 'Scheduled for ' + U.fmtDate(o.sched, 'day') + ' ' + U.fmtTime(o.sched) : 'Delivered ' + U.fmtDate(o.end || o.t, 'full') + ' · ' + U.fmtTime(o.end || o.t))))),
              JC.ui.list([{ header: 'Delivered to', rows: [{ icon: { glyph: a.icon || 'mappin.fill', bg: TINT }, title: a.label, subtitle: a.line + ', ' + a.city }, o.note ? { icon: { glyph: 'text.bubble', bg: '#8e8e93' }, title: '“' + o.note + '”', subtitle: 'Note to rider' + (o.anon ? ' · sent as a gift, sender hidden' : '') } : null, o.rider ? { avatar: { initials: o.rider.name.split(' ').map((w) => w[0]).join(''), grad: ['#ff8a80', TINT] }, avatarSize: 36, title: o.rider.name, subtitle: o.rider.vehicle, detail: '★ ' + o.rider.rating.toFixed(2) } : null].filter(Boolean) },
                { header: 'Items', rows: o.items.map((x) => ({ title: x.q + ' × ' + x.n, subtitle: [x.opts, x.note ? '“' + x.note + '”' : ''].filter(Boolean).join(' · ') || null, detail: yen(x.p * x.q) })) }], { cls: 'le-list' }),
              h('div.le-sum',
                h('div', h('span', 'Subtotal'), h('span', yen(o.sub))), h('div', h('span', 'Delivery fee'), h('span', yen(o.fee))), h('div', h('span', 'Service fee'), h('span', yen(o.service))),
                o.small ? h('div', h('span', 'Small order fee'), h('span', yen(o.small))) : null, o.discount ? h('div.le-disc', h('span', 'Discount'), h('span', '−' + yen(o.discount))) : null,
                h('div', h('span', 'Rider tip'), h('span', yen(o.tip || 0))), h('div.le-total', h('b', 'Total'), h('b', yen(o.total))),
                h('div.le-paid', JC.icon('creditcard.fill', { size: 14 }), ' Paid with ' + card.name + ' •• ' + card.last)),
              JC.ui.list([{ rows: [
                o.status === 'delivered' ? { title: 'Reorder', icon: { glyph: 'arrow.clockwise', bg: TINT }, chevron: true, onTap: () => reorder(o) } : null,
                o.status === 'delivered' ? { title: (st().rated[o.id] || o.rated) ? 'You rated this order ' + '★'.repeat(st().rated[o.id] || o.rated) : 'Rate this order', icon: { glyph: 'star.fill', bg: '#ff9f0a' }, chevron: !(st().rated[o.id] || o.rated), onTap: (st().rated[o.id] || o.rated) ? null : () => rateSheet(o, () => page.render()) } : null,
                o.status === 'scheduled' ? { title: 'Cancel scheduled order', destructive: true, onTap: () => cancelOrder(o, () => page.render()) } : null,
                { title: 'Get help with this order', icon: { glyph: 'questionmark.circle', bg: '#30b0c7' }, chevron: true, onTap: () => helpSheet(o) },
                { title: 'View restaurant', icon: { glyph: 'storefront.fill', bg: '#8e8e93' }, chevron: true, onTap: () => page.nav.push(restPage(r)) },
              ].filter(Boolean) }], { cls: 'le-list' }),
              h('div.le-ofoot', 'Order #LE' + String(Math.abs(hashStr(o.id)) % 100000000).padStart(8, '0') + ' · ' + U.fmtDate(o.t, 'medium') + ' ' + U.fmtTime(o.t)),
            ];
          },
        });
        return page;
      }
      function hashStr(s) { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return x; }
      function rateSheet(o, after) {
        let stars = 5;
        const s = SHEET({ title: 'Rate your order', detent: 'medium', left: { text: 'Cancel' }, right: { text: 'Submit', onTap: () => { st().rated[o.id] = stars; save(); JC.ui.toast('Thanks for the feedback', { icon: 'star.fill' }); if (after) after(); } },
          content: () => [h('div.le-ratebox', h('div.le-rate-q', 'How was ' + (rest(o.rest) || {}).name + '?'), h('div.le-rate-stars', [1, 2, 3, 4, 5].map((n) => h('span.tap', { class: { on: n <= stars }, onTap: () => { stars = n; s.render(); } }, '★'))), h('div.le-rate-s', ['', 'Not good', 'Could be better', 'Okay', 'Good', 'Excellent'][stars]))] });
      }
      function helpSheet(o) {
        JC.ui.actionSheet({ title: 'What went wrong?', actions: [
          { text: 'Missing or incorrect items', onTap: () => JC.ui.alert({ title: 'We’re Sorry', message: 'A refund for missing items goes back to your card in 1–3 business days. Which items were missing?', input: { placeholder: 'Items' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Submit', style: 'default' }] }).then((x) => { if (x.index === 1) JC.ui.toast('Report sent', { icon: 'checkmark' }); }) },
          { text: 'Order arrived late or cold', onTap: () => JC.ui.alert({ title: 'Thanks for Telling Us', message: 'We’ve added a ¥10 credit to your account for next time.', buttons: [{ text: 'OK' }] }) },
          { text: 'Contact the rider', onTap: () => callRider(o) },
          { text: 'Chat with support', onTap: () => JC.ui.alert({ title: 'Support Chat', message: 'All agents are busy. Average wait: 26 minutes. (It’s ' + U.fmtTime(JC.time.now()) + '.)', buttons: [{ text: 'OK' }] }) },
        ] });
      }
      function cancelOrder(o, done) {
        JC.ui.alert({ title: 'Cancel Order?', message: o.status === 'scheduled' ? 'You won’t be charged.' : 'The restaurant hasn’t started cooking yet, so you’ll get a full refund.', buttons: [{ text: 'Keep Order', style: 'cancel' }, { text: 'Cancel Order', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          stopSim(o.id);
          JC.store.update('orders', o.id, { status: 'cancelled', phase: 'cancelled' });
          if (JC.wallet && JC.wallet.refund) JC.wallet.refund({ card: o.card, merchant: 'Lotus Eats', amount: o.total, note: 'Refund · ' + ((rest(o.rest) || {}).name || '') });
          sms('[Lotus Eats] Your order from ' + ((rest(o.rest) || {}).name || 'the restaurant') + ' was cancelled. A refund of ' + yen(o.total) + ' is on its way.');
          JC.ui.toast('Order cancelled', { icon: 'xmark' });
          done && done();
        });
      }
      function callRider(o) {
        const lines = o.status === 'active'
          ? (o.phase === 'delivering' ? ['Wei? Lotus Eats. I’m on my way, about ' + Math.max(1, remaining(o)) + ' minutes.', 'Which gate? …OK, OK. See you soon.'] : o.phase === 'arrived' ? ['I’m downstairs! Food’s still hot.', 'I’ll wait two minutes.'] : ['Hello? I haven’t picked up the food yet — the kitchen is busy.', 'I’ll call you when I’m close.'])
          : ['The number you dialed is a Lotus Eats privacy line and has expired.'];
        MV().fakeCall({ name: o.rider ? o.rider.name : 'Rider', num: 'Lotus Eats privacy line', avatar: o.rider ? { initials: o.rider.name.split(' ').map((w) => w[0]).join(''), grad: ['#ff8a80', TINT] } : null, glyph: 'scooter', lines });
      }
      function chatRider(o) {
        const log = [];
        const s = SHEET({ title: o.rider.name, detent: 'large', left: { text: 'Done' }, cls: 'le-chat',
          content: () => [h('div.le-msgs', log.length ? log.map((m) => h('div.le-msg', { class: { me: m.me } }, m.t)) : h('div.le-muted', 'Messages are private and auto-translated.')),
            h('div.le-qr', ['Please leave it at the door', 'Call me when you’re here', 'Which way are you coming?', 'Thank you!'].map((t) => h('span.tap', { onTap: () => send(t) }, t))),
            h('div.le-msgin', JC.ui.input({ placeholder: 'Message your rider', enterkey: 'send', cls: 'le-chatin', onSubmit: (v, el) => { if (v.trim()) { send(v.trim()); el.value = ''; } } }))] });
        function send(t) {
          log.push({ me: true, t }); s.render(); JC.audio.play('send');
          const reply = /door/i.test(t) ? 'OK 👍 will leave it at the door and send a photo.' : /call/i.test(t) ? 'Sure, I’ll call.' : /which way|where/i.test(t) ? 'Coming down Jinxing Road, past Pet Kingdom.' : /thank/i.test(t) ? '😊 enjoy!' : 'OK 👍';
          setTimeout(() => { log.push({ me: false, t: reply }); if (!s.closed) s.render(); JC.audio.play('receive'); }, 1300);
        }
      }

      // ═══ TRACKING ═══
      function trackPage(id) {
        let map = null, lastKey = '', dead = false;
        const box = h('div.le-tmap');
        const card = h('div.le-tcard');
        const cleanup = () => { if (dead) return; dead = true; off1(); off2(); if (map) { map.destroy(); map = null; } };
        const page = PAGE({
          title: '', cls: 'le-track', transparentNav: true,
          right: [JC.ui.navBtn({ icon: 'questionmark.circle', label: 'Help', onTap: () => { const o = JC.store.get('orders', id); if (o) helpSheet(o); } })],
          onClose: () => cleanup(),
          content: () => [box, card],
        });
        const draw = (full) => {
          if (dead) return;
          const o = JC.store.get('orders', id);
          if (!o) return;
          if (o.status !== 'active') {
            if (page.nav && page.nav.top() === page) { cleanup(); page.nav.replace(orderPage(id)); }
            return;
          }
          const r = rest(o.rest), a = addrOf(o.to);
          const P = restPlace(r), Q = MV().place(a.place);
          const leg = legFor(r, a);
          if (!map) {
            map = MV().create(box, { style: 'explore', user: a.id === 'here', center: P ? [P.x, P.y] : null, zoom: 60, pois: true, poiLabelMinZ: 140, cls: 'le-trackmap' });
            if (P) map.addPin('rest', { place: r.place, cat: 'food', label: r.name });
            if (Q && a.id !== 'here') map.addPin('dest', { kind: 'dot', at: [Q.x, Q.y], color: '#1c1c1e', square: true, anchor: 'center', label: a.label });
            if (leg) map.setRoute('leg', { pts: leg.pts, color: TINT, width: 5 });
            setTimeout(() => { if (!map) return; map.resize(); if (leg) map.fit(leg.pts, { margin: 46, maxZoom: 120, animate: false }); }, 80);
          }
          const sm = sims[id];
          if (sm && sm.pos && (o.phase === 'pickup' || o.phase === 'delivering' || o.phase === 'arrived')) {
            if (!map._riderOn) { map.addPin('rider', { kind: 'rider', at: sm.pos, anchor: 'center', z: 9 }); map._riderOn = true; }
            else map.movePin('rider', sm.pos);
            if (o.phase === 'delivering' && leg) map.setRoute('leg', { pts: leg.pts, color: TINT, width: 5, progress: sm.k });
          }
          const key = o.phase + '|' + o.status;
          if (full || key !== lastKey) { lastKey = key; renderCard(o, r, a); }
          else {
            const sub = card.querySelector('.le-tsub'); if (sub) sub.textContent = tsub(o);
            const msg = card.querySelector('.le-tmsg'); if (msg) msg.textContent = phaseSub(o);
            const bar = card.querySelector('.le-step.cur i'); if (bar && sm) bar.style.width = Math.round((sm.k || 0) * 100) + '%';
          }
        };
        const tsub = (o) => { const left = remaining(o); return phaseTitle(o) + (o.phase === 'arrived' ? '' : ' · ' + (left <= 1 ? 'any minute' : left + ' min')); };
        function renderCard(o, r, a) {
          const idx = PHASES.indexOf(o.phase);
          card.innerHTML = '';
          card.append(
            h('div.le-tgrab'),
            h('div.le-teta', o.phase === 'arrived' ? 'Your rider is here' : 'Arriving at ' + U.fmtTime(arriveAt(o))),
            h('div.le-tsub', tsub(o)),
            h('div.le-steps', [0, 1, 2, 3].map((i) => h('div.le-step', { class: { done: i < Math.min(3, idx) || (idx >= 4), cur: i === Math.min(3, idx) && idx < 4 } }, h('i', i === Math.min(3, idx) && sims[o.id] ? { style: { width: Math.round((sims[o.id].k || 0) * 100) + '%' } } : null)))),
            h('div.le-tmsg', phaseSub(o)),
            idx >= 2 ? h('div.le-rider',
              JC.ui.avatar({ initials: o.rider.name.split(' ').map((w) => w[0]).join(''), grad: ['#ff8a80', TINT] }, 46),
              h('div.le-rider-m', h('b', o.rider.name), h('span', '★ ' + o.rider.rating.toFixed(2) + ' · ' + o.rider.vehicle)),
              h('div.le-rbtn', { onTap: () => chatRider(o) }, JC.icon('message.fill', { size: 19 })),
              h('div.le-rbtn', { onTap: () => callRider(o) }, JC.icon('phone.fill', { size: 19 }))) : h('div.le-tresto', h('div.le-tresto-img', heroEl(r)), h('div', h('b', r.name), h('span', idx === 0 ? 'Confirming your order…' : 'Cooking · ' + o.items.reduce((x, y) => x + y.q, 0) + ' item' + (o.items.reduce((x, y) => x + y.q, 0) === 1 ? '' : 's')))),
            JC.ui.list([{ rows: [
              { icon: { glyph: a.icon || 'mappin.fill', bg: TINT }, title: a.label, subtitle: o.drop + (o.note ? ' · “' + o.note + '”' : '') },
              { icon: { glyph: 'bag.fill', bg: '#8e8e93' }, title: o.items.map((x) => x.q + '× ' + x.n).join(', '), subtitle: yen(o.total) + ' · ' + cardOf(o.card).short + ' •• ' + cardOf(o.card).last, chevron: true, onTap: () => page.nav.push(orderPage(id)) },
            ] }], { cls: 'le-list' }),
            idx <= 1 ? h('div.le-tcancel.tap', { onTap: () => cancelOrder(o, () => draw(true)) }, 'Cancel order') : h('div.le-tcancel.muted', 'Too late to cancel — your food is on its way'));
        }
        const off1 = JC.bus.on('lotuseats:tick', (e) => { if (e.id === id && page.el.isConnected) draw(); });
        const off2 = JC.bus.on('store:orders', () => { if (page.el.isConnected) draw(true); });
        offs.push(cleanup);
        setTimeout(() => draw(true), 0);
        return page;
      }

      // ═══ ACCOUNT ═══
      function accountPage() {
        return PAGE({
          title: 'Account', large: true, cls: 'le-account', bg: 'grouped',
          content: (page) => {
            const S = st();
            const n = JC.store.all('orders').filter((o) => o.status === 'delivered').length;
            return [
              h('div.le-prof', JC.ui.avatar('me', 64), h('div', h('b', 'Jiang Cheng'), h('span', n + ' orders · member since 2021'))),
              h('div.le-quick', [['Favourites', 'heart.fill', () => page.nav.push(favPage())], ['Wallet', 'creditcard.fill', () => page.nav.push(payPage())], ['Orders', 'bag.fill', () => tabs.select('orders', true)]].map(([t, g, fn]) => h('div.le-q', { onTap: fn }, JC.icon(g, { size: 22 }), h('span', t)))),
              JC.ui.list([{ rows: [
                { icon: { glyph: 'mappin.fill', bg: TINT }, title: 'Addresses', detail: String(addrs().length), chevron: true, onTap: () => addrSheet(() => page.render()) },
                { icon: { glyph: 'creditcard.fill', bg: '#1c1c1e' }, title: 'Payment', detail: cardOf(S.card).short + ' •• ' + cardOf(S.card).last, chevron: true, onTap: () => page.nav.push(payPage()) },
                { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promotions', chevron: true, onTap: () => JC.ui.alert({ title: 'Your Promotions', message: '• Hotpot weekend: 20% off hotpot until Sunday (automatic)\n• SOUPCARE: 10% off soup orders', buttons: [{ text: 'OK' }] }) },
                { icon: { glyph: 'gift.fill', bg: '#af52de' }, title: 'Send a gift card', chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Send a Lotus Eats gift card to…', actions: ['jl', 'wwx', 'lxc', 'nhs'].map((c) => ({ text: JC.contacts.short(c), onTap: () => JC.ui.alert({ title: 'Gift Card', message: 'Gift cards are paused for this account. (Tang Mei set a spending alert after the 38 milk teas.)', buttons: [{ text: 'OK' }] }) })) }) },
              ] }, { rows: [
                { icon: { glyph: 'bell.fill', bg: '#ff3b30' }, title: 'Notifications', chevron: true, onTap: () => notifSheet() },
                { icon: { glyph: 'questionmark.circle', bg: '#30b0c7' }, title: 'Help', chevron: true, onTap: () => JC.os.open('safari', { search: 'lotus eats help' }) },
                { icon: { glyph: 'lock.fill', bg: '#8e8e93' }, title: 'Privacy', chevron: true, onTap: () => JC.ui.alert({ title: 'Privacy', message: 'Riders see your first name and drop-off note. Gift orders hide your name completely.', buttons: [{ text: 'OK' }] }) },
                { icon: { glyph: 'info.circle', bg: '#5ac8fa' }, title: 'About Lotus Eats', detail: '6.4.1', chevron: true, onTap: () => JC.ui.alert({ title: 'Lotus Eats 6.4.1', message: 'Delivering happiness across Lanling, Gusu and Yunmeng since 2019.', buttons: [{ text: 'OK' }] }) },
              ] }, { rows: [{ title: 'Sign Out', destructive: true, center: true, onTap: () => JC.ui.alert({ title: 'Sign Out?', message: 'Enter the account password to sign out.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'That’s not Jiang Cheng’s Lotus Eats password.', buttons: [{ text: 'OK' }] }), 400); }) }] }], { cls: 'le-list' }),
            ];
          },
        });
      }
      function favPage() {
        return PAGE({ title: 'Favourites', cls: 'le-favp', content: () => { const f = st().favs.map(rest).filter(Boolean); return f.length ? [h('div.le-rlist', f.map((r) => restCard(r)))] : [JC.ui.empty({ icon: 'heart', title: 'No favourites yet', text: 'Tap the heart on a restaurant to save it.' })]; } });
      }
      function payPage() {
        const page = PAGE({ title: 'Payment', bg: 'grouped', content: () => [JC.ui.list([{ header: 'Wallet Pay', footer: 'Payments are confirmed with Face ID or the iPhone passcode.', rows: CARDS.map((c) => ({ leading: h('div.le-cardic', { style: { background: c.color } }), title: c.name, subtitle: '•• ' + c.last, check: st().card === c.id, onTap: () => { st().card = c.id; save(); page.render(); } })).concat([{ title: 'Open Wallet', tinted: true, onTap: () => JC.os.open('wallet') }]) },
          { header: 'Lotus Eats credit', rows: [{ title: 'Balance', detail: '¥0.00' }] }], { cls: 'le-list' })] });
        return page;
      }
      function notifSheet() {
        const S = st();
        SHEET({ title: 'Notifications', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [{ title: 'Order updates', subtitle: 'Rider and delivery status', toggle: { on: S.notif.orders, onChange: (v) => { S.notif.orders = v; save(); } } }, { title: 'Offers & promotions', toggle: { on: S.notif.promos, onChange: (v) => { S.notif.promos = v; save(); } } }] }], { cls: 'le-list' })] });
      }

      // ═══ intents & lifecycle ═══
      function handle(it) {
        if (!it) return;
        if (it.id) { openOrder(it.id); return; }
        if (it.rest) {
          tabs.select('home');
          const n = tabs.nav('home');
          while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ }
          openRest(it.rest, it.item);
          return;
        }
        if (it.search) {
          tabs.select('search');
          const pg = tabs.nav('search').top();
          if (pg && pg.searchEl) { const s = pg.searchEl.querySelector('.search'); if (s && s.setValue) s.setValue(it.search); if (s && s.input) s.input.dispatchEvent(new Event('input')); }
        }
      }
      // resume live orders after a reload
      JC.store.all('orders').filter((o) => o.status === 'active').forEach((o) => startSim(o.id));
      setTimeout(() => handle(intent0), 40);
      return {
        intent: handle,
        show() { refreshTop(['home']); badge(); },
        back() {
          const n = tabs.nav();
          if (n && n.depth() > 1) { n.pop(); return true; }
          return false;
        },
        destroy() { offs.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); Object.keys(sims).forEach(stopSim); },
      };
    },
  });
})();
