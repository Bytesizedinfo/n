/* Wanmin Go — Liyue food delivery (Wanmin red). Home · Browse · Orders · Account + Search.
   Restaurants sit on the Liyue map (JC.r7 places, Maps when available): hours, distance and delivery range agree
   with Maps. Menus → item sheet with options → cart → checkout (deliver to a place or send to a friend, drop-off, note
   to courier, gift, tip, Wallet Pay + JC.bank) → live tracking (courier on a mini map, Dynamic Island, notifications,
   SMS into the `wanmin` thread) → order history with receipts, reorder and ratings.
   Act: order { id, rest, items:[{name, qty, price}], total, to, for }. Intents: { id } (order) · { rest } · { search }. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;
  const R7 = () => JC.r7;
  const D = () => JC.lotusEatsData;
  const TINT = '#d6332c';
  const ISL = 'lotuseats-order';
  const M = (n) => U.fmtMoney(Math.round(n));
  const flag = (k) => { try { return !!JC.story.flag(k); } catch (e) { return false; } };
  const chapter = () => { try { return (JC.story.api() || {}).chapter || null; } catch (e) { return null; } };

  JC.appIcon.add('lotuseats', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ec4a3c"/><stop offset="1" stop-color="#b3201b"/></linearGradient><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#f2b33d"/></linearGradient></defs><rect width="60" height="60" fill="url(#a)"/><path d="M8 29h44c-1.2 10.5-10.4 17.5-22 17.5S9.2 39.5 8 29z" fill="#fff"/><path d="M8 29h44" stroke="url(#g)" stroke-width="3" stroke-linecap="round"/><path d="M52 29.5 58 25" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M15 33.5c4 3.4 26 3.4 30 0" fill="none" stroke="#e8c8c3" stroke-width="1.6" stroke-linecap="round"/><path d="M21 25c-1.5-2.5 2-3.6.5-6.4M29.5 25c-1.5-2.5 2-3.6.5-6.4M38 25c-1.5-2.5 2-3.6.5-6.4" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.2" stroke-linecap="round"/><path d="M24 46.5h12" stroke="url(#g)" stroke-width="3.2" stroke-linecap="round"/><circle cx="47" cy="12" r="4.6" fill="url(#g)"/><path d="M45 12h4M47 10v4" stroke="#b3201b" stroke-width="1.4"/></svg>`);

  // the kit appends content arrays one level deep — flatten nested sections first
  const flatten = (f) => (typeof f === 'function' ? (x) => { const r = f(x); return Array.isArray(r) ? r.flat(Infinity).filter(Boolean) : r; } : f);
  const PAGE = (o) => JC.ui.page(Object.assign({}, o, { content: flatten(o.content) }));
  const SHEET = (o) => JC.ui.sheet(Object.assign({}, o, { content: flatten(o.content) }));

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.lotuseats || (d.apps.lotuseats = {});
    const def = { dest: { kind: 'place', id: 'player-home' }, cart: null, favs: ['wanmin', 'northern', 'heyu'], recent: ['pelmeni', 'oolong', 'mapo tofu'], notif: { orders: true, promos: false }, promo: null, rated: {}, stamps: 9, reward: false };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();
  const card = () => (JC.bank.cards()[0] || { id: 'nb', name: 'Northland Black', last: '1111' });
  const cardLabel = () => card().name + ' •• ' + card().last;

  // ── catalogue helpers ──
  const rest = (id) => D().RESTS.find((r) => r.id === id) || null;
  const restName = (r) => r.name + (r.branch ? ' · ' + r.branch : '');
  const restPlace = (r) => R7().place(r.place);
  function hoursOf(r) {
    const i = MV() && MV().hoursInfo ? MV().hoursInfo({ hours: r.hours }) : null;
    return i || { open: true, text: 'Open', short: 'Open' };
  }
  function nextOpen(r) {
    const t0 = JC.time.now();
    for (let k = 1; k < 4 * 24 * 4; k++) {
      const t = t0 + k * 15 * 60000;
      const i = MV().hoursInfo({ hours: r.hours }, t);
      if (i && i.open) { const d = new Date(t + 30 * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0); return d.getTime(); }
    }
    return t0 + 12 * 3600000;
  }
  function itemById(r, id) { for (const c of menuOf(r)) for (const it of c.items) if (it.id === id) return it; return null; }
  /** the menu, with story-driven additions (Mama's pelmeni once the recipe reached Xiangling) */
  function menuOf(r) {
    if (r.id !== 'wanmin' || !flag('recipe')) return r.menu;
    const extra = { cat: 'New this weekend', items: [{ id: 'wm_pelmeni', n: 'Morepesok Pelmeni', d: 'A regular’s mother sent us her recipe from Snezhnaya. Xiangling added Jueyun chili to the dipping sauce. (Sorry, Mama.)', p: 78, art: 'food_pelmeni', tag: 'NEW · family recipe' }] };
    return [r.menu[0], extra].concat(r.menu.slice(1));
  }

  // ── destinations: a place id, or a friend ──
  const kidsPlace = () => (flag('kids_wangshu') ? ['wangshu', 'Wangshu Inn'] : flag('kids_alcor') ? ['alcor', 'The Alcor, Crux Pier'] : flag('kids_apartment') ? ['apartment', 'Your apartment'] : flag('kids_grand') ? ['liyue-grand', 'Liyue Harbor Grand Hotel'] : flag('kids_zl') ? ['wangsheng', 'With Mr. Zhongli'] : null);
  const kidsLanded = () => JC.time.now() >= JC.time.parse('+1 07:40');
  function friendInfo(f) {
    const s = (() => { try { return JC.story.api(); } catch (e) { return {}; } })();
    const name = f.name || (JC.contacts.get(f.id) ? JC.contacts.short(f.id) : f.id);
    const avatar = f.avatar || f.id;
    if (f.abroad) return { name, avatar, off: 'Wanmin Go doesn’t deliver to ' + f.abroad.split(',')[1].trim() + '.', sub: f.abroad };
    if (f.kids) {
      if (!kidsLanded()) return { name, avatar, off: 'In the air · LA 711 lands 07:40 Saturday', sub: 'LA 711' };
      const kp = kidsPlace();
      if (!kp) return { name, avatar, off: 'You haven’t sorted out where they’re staying.', sub: 'Address unknown' };
      return { name, avatar, sub: kp[1], to: kp[0], place: kp[0] };
    }
    const to = typeof f.to === 'function' ? f.to(s) : f.to;
    const sub = typeof f.sub === 'function' ? f.sub(s) : f.sub;
    const isPlace = !!R7().PLACES[to];
    return { name, avatar, sub, to, place: isPlace ? to : 'moonchase', shares: !isPlace };
  }
  /** resolve a destination → { to, for, label, line, place, icon, avatar, friend } */
  function resolve(dest) {
    dest = dest || st().dest;
    if (dest.kind === 'friend') {
      const f = D().FRIENDS.find((x) => x.id === dest.cid);
      const fi = f ? friendInfo(f) : null;
      if (fi && !fi.off) return { to: fi.to, for: f.id, label: fi.name, line: fi.shares ? 'Shares a drop-off pin with the courier' : fi.sub, place: fi.place, icon: 'gift.fill', avatar: fi.avatar, friend: true };
    }
    const id = dest.kind === 'place' ? dest.id : 'player-home';
    const a = D().ADDRS.find((x) => x.id === id) || D().ADDRS[0];
    return { to: a.id, for: null, label: a.label, line: a.line, place: a.id, icon: a.icon, friend: false };
  }
  const destShort = (d) => (d.friend ? 'Gift for ' + d.label : d.id === 'player-home' || d.to === 'player-home' ? 'Chihu Rock, Lane 3' : d.label);
  const routeCache = new Map();
  function legFor(r, placeId) {
    const k = r.id + '>' + placeId;
    if (!routeCache.has(k)) routeCache.set(k, R7().leg(r.place, placeId));
    return routeCache.get(k);
  }
  /** delivery estimate or null when out of range */
  function delivery(r, dest) {
    const d = dest || resolve();
    const leg = legFor(r, d.place);
    if (!leg) return null;
    if (r.local) { const P = restPlace(r), Q = R7().place(d.place); if (!P || !Q || Math.hypot(P.x - Q.x, P.y - Q.y) > r.local) return null; }
    else if (leg.km > 14) return null;
    const fee = Math.max(8, Math.min(28, Math.round(7 + leg.km * 2.2)));
    const eta = r.prep + Math.round(leg.min * 1.3) + 5;
    return { fee, eta, km: leg.km, range: Math.max(12, eta - 4) + '–' + (eta + 6) + ' min' };
  }
  const fmtKm = (km) => (MV() && MV().fmtDist ? MV().fmtDist(km) : km.toFixed(1) + ' km');

  // ── cart ──
  const cart = () => st().cart;
  const cartCount = () => { const c = cart(); return c ? c.items.reduce((a, b) => a + b.q, 0) : 0; };
  const cartSub = () => { const c = cart(); return c ? c.items.reduce((a, b) => a + b.p * b.q, 0) : 0; };
  function cartChanged() { save(); JC.bus.emit('lotuseats:cart'); }
  function sms(text) { try { JC.story.incoming('wanmin', { from: 'wanmin', text }); } catch (e) { /* thread missing */ } }

  JC.app({
    id: 'lotuseats',
    name: 'Wanmin Go',
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
      offs.push(JC.bus.on('lotuseats:cart', () => updateBars()));
      offs.push(JC.bus.on('store:orders', () => { badge(); const hn = tabs.nav('home'); if (hn && hn.depth() === 1 && hn.top() && hn.top().el.isConnected) hn.top().render(); }));
      offs.push(JC.bus.on('story:fx', () => refreshTop(['home'])));
      offs.push(JC.bus.on('story:chapter', () => refreshTop(['home'])));
      function badge() { tabs.badge('orders', JC.store.all('orders').filter((o) => o.status === 'active').length || 0); }
      badge();

      // ═══ shared bits ═══
      function cartBtn() {
        const n = cartCount();
        return h('div.le-iconbtn.le-cartbtn', { onTap: () => openCart() }, JC.icon('bag.fill', { size: 20 }), n ? h('span.le-cbadge', String(n)) : null);
      }
      function cartBar() { const el = h('div.le-cartbar'); fillBar(el); return el; }
      function fillBar(el) {
        const c = cart();
        el.innerHTML = '';
        el.classList.toggle('on', !!(c && c.items.length));
        if (!c || !c.items.length) return;
        const r = rest(c.rest);
        el.append(h('div.le-cartbar-in', { onTap: () => openCart() }, h('span.le-cartbar-n', String(cartCount())), h('div.le-cartbar-m', h('b', 'View cart'), h('span', r ? r.name : '')), h('span.le-cartbar-p', M(cartSub()))));
      }
      function updateBars() {
        body.querySelectorAll('.le-cartbar').forEach(fillBar);
        body.querySelectorAll('.le-cartbtn').forEach((b) => b.replaceWith(cartBtn()));
      }
      function heart(r) {
        const on = st().favs.includes(r.id);
        return h('div.le-heart', { class: { on }, onTap: (e) => { e.stopPropagation(); toggleFav(r); const el = e.currentTarget; const now = st().favs.includes(r.id); el.classList.toggle('on', now); el.innerHTML = ''; el.appendChild(JC.icon(now ? 'heart.fill' : 'heart', { size: 18, weight: 2.2 })); } }, JC.icon(on ? 'heart.fill' : 'heart', { size: 18, weight: 2.2 }));
      }
      function toggleFav(r) {
        const S = st();
        const i = S.favs.indexOf(r.id);
        if (i >= 0) S.favs.splice(i, 1); else S.favs.push(r.id);
        save();
        JC.audio.haptic && JC.audio.haptic(6);
        JC.ui.toast(i >= 0 ? 'Removed from Saved' : 'Saved', { icon: i >= 0 ? 'heart' : 'heart.fill' });
      }
      function heroEl(r, cls) {
        const art = r.art || (r.hero === 'bakery' ? 'wm_hero_bakery' : r.hero === 'pharmacy' ? 'wm_hero_pharmacy' : null);
        if (art) return JC.art.el(art, { cls: 'le-hero-img' + (cls ? ' ' + cls : '') });
        return h('div.le-hero-img.le-hero-plain' + (cls ? '.' + cls : ''), JC.icon('fork.knife', { size: 44 }));
      }
      function restCard(r, o) {
        o = o || {};
        const hi = hoursOf(r);
        const dv = delivery(r);
        return h('div.le-rcard', { class: { closed: !hi.open, mini: !!o.mini }, onTap: () => openRest(r.id) },
          h('div.le-rcard-img', heroEl(r), !hi.open ? h('div.le-closed', h('b', 'Closed'), h('span', hi.text.replace('Closed · ', ''))) : null,
            r.promo && hi.open ? h('div.le-promo-badge', JC.icon('tag.fill', { size: 11 }), ' ' + r.promo) : null, o.mini ? null : heart(r)),
          h('div.le-rcard-m',
            h('div.le-rcard-t', h('span', r.name + (r.branch && !o.mini ? ' (' + r.branch + ')' : '')), h('span.le-rate', JC.icon('star.fill', { size: 11 }), ' ' + r.rating.toFixed(1))),
            h('div.le-rcard-s', dv ? (hi.open ? dv.range : 'Schedule') + ' · ' + M(dv.fee) + ' delivery · ' + fmtKm(dv.km) : r.cuisine + ' · out of delivery range')));
      }
      function sectionH(t, right) { return h('div.le-h', h('span', t), right || null); }
      function banner() {
        const ch = chapter();
        if (flag('osial_sent') && JC.time.now() >= JC.time.parse('+2 23:00')) return h('div.le-alert.dark', JC.icon('bolt.fill', { size: 16 }), h('div', h('b', 'Harbor blackout'), h('span', 'Power is out along the docks. Some restaurants are offline and couriers are using torches. Please be kind.')));
        if (ch === 'sun_rite') return h('div.le-alert', JC.icon('flame.fill', { size: 16 }), h('div', h('b', 'Rite of Parting'), h('span', 'Roads around Yujing Terrace are closed until 18:00. Deliveries on Feiyun Slope may take longer.')));
        if (JC.bank.frozen()) return h('div.le-alert.warn', JC.icon('lock.fill', { size: 16 }), h('div', h('b', 'Payment method frozen'), h('span', 'Your Northland Black card is frozen. Unfreeze it in the Northland app to order.')));
        return null;
      }

      // ═══ HOME ═══
      function homePage() {
        const page = PAGE({
          navbar: false, cls: 'le-home', footer: cartBar(),
          content: () => {
            const S = st();
            const d = resolve();
            const list = D().RESTS.slice().sort((a, b) => (delivery(a) ? 0 : 1) - (delivery(b) ? 0 : 1));
            const open = list.filter((r) => hoursOf(r).open && delivery(r));
            const closed = list.filter((r) => !hoursOf(r).open && delivery(r));
            const far = list.filter((r) => !delivery(r));
            const pastRests = [];
            JC.store.all('orders').slice().sort((x, y) => y.t - x.t).forEach((o) => { if (!pastRests.includes(o.rest) && rest(o.rest)) pastRests.push(o.rest); });
            const favs = S.favs.map(rest).filter(Boolean);
            const active = JC.store.all('orders').find((o) => o.status === 'active');
            const late = JC.time.date().getHours() >= 22 || JC.time.date().getHours() < 5;
            return [
              h('div.le-top',
                h('div.le-addr', { onTap: () => destSheet(() => page.render()) }, h('small', d.friend ? 'Sending a gift to' : 'Deliver now'), h('b', h('span', destShort(d)), JC.icon('chevron.down', { size: 12, weight: 3 }))),
                h('div.le-topbtns', h('div.le-iconbtn', { onTap: () => notifSheet() }, JC.icon('bell.fill', { size: 19 })), cartBtn())),
              h('div.le-search', { onTap: () => tabs.select('search', true) }, JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), h('span', 'Dishes, restaurants, pharmacy…')),
              banner(),
              active ? h('div.le-live', { onTap: () => openOrder(active.id) }, h('div.le-live-ic', JC.icon('scooter', { size: 22 })), h('div', h('b', phaseTitle(active)), h('span', restName(rest(active.rest) || { name: '' }) + ' · ' + phaseSub(active))), JC.icon('chevron.right', { size: 14, weight: 2.6 })) : null,
              h('div.le-cats.hscroll', D().CATS.map((c) => h('div.le-cat', { onTap: () => tabs.nav().push(catPage(c)) }, h('div.le-cat-ic', c.art ? JC.art.el(c.art, { cls: 'le-cat-art' }) : JC.icon(c.icon, { size: 26 })), h('span', c.n)))),
              h('div.le-promos.hscroll',
                promoCard('Hotpot for four', 'Wanmin’s signature set · burner included', 'food_hotpot', '#b3201b', () => openRest('wanmin', 'wm_hotpot4')),
                late ? promoCard('Night shift?', 'Northern Kitchen: 60 pelmeni, borscht for six, free tea', 'food_pelmeni', '#1c3d63', () => openRest('northern', 'nk_shiftbox'))
                  : promoCard('Tea at the opera', 'Heyu Tea House delivers to the boxes', 'food_almond_tofu', '#7a4b1f', () => openRest('heyu')),
                promoCard('Send a meal', 'Order for a friend — they share the drop-off pin', 'food_jade_parcels', '#2f6b4f', () => destSheet(() => page.render(), true))),
              pastRests.length ? [sectionH('Order again'), h('div.le-again.hscroll', pastRests.map((id) => { const r = rest(id); return h('div.le-again-c', { onTap: () => openRest(id) }, h('div.le-again-img', heroEl(r)), h('b', r.name), h('span', r.cuisine.split(' · ')[0])); }))] : null,
              favs.length ? [sectionH('Saved'), h('div.le-favs.hscroll', favs.map((r) => restCard(r, { mini: true })))] : null,
              sectionH(open.length ? 'Open now near you' : 'Nothing open nearby', h('span.le-hsub', d.friend ? 'to ' + d.label : 'Liyue Harbor')),
              open.length ? h('div.le-rlist', open.map((r) => restCard(r))) : h('div.le-empty', 'Everything that delivers here is closed right now. You can still schedule an order.'),
              closed.length ? [sectionH('Opening later'), h('div.le-rlist', closed.map((r) => restCard(r)))] : null,
              far.length ? [sectionH('Out of range', h('span.le-hsub', 'from this address')), h('div.le-rlist', far.map((r) => restCard(r)))] : null,
              h('div.le-foot', h('span', 'Wanmin Go · Liyue Harbor'), h('span.tap', { onTap: () => helpCenter() }, 'Help')),
            ];
          },
        });
        return page;
      }
      function promoCard(t, s, art, c, fn) { return h('div.le-promo', { style: { '--c': c }, onTap: fn }, h('div.le-promo-m', h('b', t), h('span', s), h('span.le-promo-go', 'Order now')), JC.art.el(art, { cls: 'le-promo-art' })); }
      function helpCenter() {
        JC.ui.actionSheet({ title: 'Wanmin Go Help', actions: [
          { text: 'Where is my order?', onTap: () => { const a = JC.store.all('orders').find((o) => o.status === 'active'); if (a) openOrder(a.id); else JC.ui.alert({ title: 'No Active Orders', message: 'You don’t have an order on the way right now.', buttons: [{ text: 'OK' }] }); } },
          { text: 'Sending food to a friend', onTap: () => JC.ui.alert({ title: 'Gift Orders', message: 'Choose “Send to a friend” under Deliver to. Your friend gets a text and shares a drop-off pin; the courier never sees your name if you hide it.', buttons: [{ text: 'OK' }] }) },
          { text: 'Call Wanmin Go support', onTap: () => MV().fakeCall({ name: 'Wanmin Go Support', num: '10655 0761', glyph: 'questionmark.circle', lines: ['Thank you for calling Wanmin Go. All our agents are helping other hungry customers.', 'For the fastest help, open the order in the app and tap Get Help.'] }) },
        ] });
      }

      // ═══ BROWSE ═══
      function browsePage() {
        return PAGE({
          title: 'Browse', large: true, cls: 'le-browse', footer: cartBar(),
          content: () => [
            h('div.le-grid', D().CATS.map((c) => h('div.le-tile', { onTap: () => tabs.nav('browse').push(catPage(c)) }, h('div.le-tile-img', c.art ? JC.art.el(c.art, { cls: 'le-tile-art' }) : h('div.le-tile-ic', JC.icon(c.icon, { size: 34 }))), h('span', c.n)))),
            sectionH('All restaurants', h('span.le-hsub', D().RESTS.length + ' in Liyue Harbor')),
            h('div.le-rlist', D().RESTS.slice().sort((a, b) => (delivery(a) ? 0 : 1) - (delivery(b) ? 0 : 1) || b.rating - a.rating).map((r) => restCard(r))),
          ],
        });
      }
      function matchRest(r, words) {
        const hay = [r.name, r.branch || '', r.cuisine, (r.tags || []).join(' '), menuOf(r).map((c) => c.items.map((i) => i.n).join(' ')).join(' ')].join(' ').toLowerCase();
        return words.some((w) => hay.includes(w));
      }
      function catPage(c) {
        return PAGE({
          title: c.n, cls: 'le-catpage', footer: cartBar(),
          content: () => {
            const all = D().RESTS.filter((r) => matchRest(r, c.q));
            const near = all.filter((r) => delivery(r));
            const far = all.filter((r) => !delivery(r));
            return [
              h('div.le-catbanner', c.art ? JC.art.el(c.art, { cls: 'le-catbanner-art' }) : h('div.le-catbanner-ic', JC.icon(c.icon, { size: 40 })), h('div', h('b', c.n), h('span', near.length + (near.length === 1 ? ' place delivers' : ' places deliver') + ' to ' + destShort(resolve())))),
              near.length ? h('div.le-rlist', near.map((r) => restCard(r))) : h('div.le-empty', 'Nothing in ' + c.n.toLowerCase() + ' delivers to this address yet.'),
              far.length ? [sectionH('Out of range'), h('div.le-rlist', far.map((r) => restCard(r)))] : null,
            ];
          },
        });
      }

      // ═══ SEARCH ═══
      function searchPage() {
        let q = '';
        const page = PAGE({
          title: 'Search', large: true, cls: 'le-searchp', footer: cartBar(),
          search: { placeholder: 'Dishes, restaurants, pharmacy…', onInput: (v) => { q = v; page.render(); }, onSubmit: (v) => { addRecent(v); page.render(); } },
          content: () => {
            const S = st();
            const qq = q.trim().toLowerCase();
            if (!qq) {
              return [
                S.recent.length ? [sectionH('Recent searches', h('span.le-hlink.tap', { onTap: () => { S.recent = []; save(); page.render(); } }, 'Clear')), JC.ui.list([{ rows: S.recent.map((t) => ({ leading: h('div.le-sric', JC.icon('clock.fill', { size: 15 })), title: t, onTap: () => setQuery(t) })) }], { cls: 'le-list' })] : null,
                sectionH('Popular in Liyue Harbor'),
                h('div.le-chips', ['pelmeni', 'mapo tofu', 'hotpot', 'almond tofu', 'oolong', 'borscht', 'bandages', 'sweet madame', 'fish-shaped buns'].map((t) => h('span.le-chip.tap', { onTap: () => setQuery(t) }, t))),
                sectionH('Categories'),
                h('div.le-chips', D().CATS.map((c) => h('span.le-chip.tap', { onTap: () => tabs.nav('search').push(catPage(c)) }, c.n))),
              ];
            }
            const words = qq.split(/\s+/).filter(Boolean);
            const rs = D().RESTS.filter((r) => words.every((w) => matchRest(r, [w])));
            const dishes = [];
            D().RESTS.forEach((r) => menuOf(r).forEach((c) => c.items.forEach((it) => { if (words.every((w) => (it.n + ' ' + it.d).toLowerCase().includes(w)) && !dishes.some((d) => d.r === r && d.it.id === it.id)) dishes.push({ r, it }); })));
            return [
              rs.length ? [sectionH('Restaurants'), h('div.le-rlist', rs.map((r) => restCard(r)))] : null,
              dishes.length ? [sectionH('Dishes'), JC.ui.list([{ rows: dishes.slice(0, 14).map(({ r, it }) => ({ leading: it.art ? JC.art.el(it.art, { cls: 'le-dish-art' }) : h('div.le-dish-ph', JC.icon('fork.knife', { size: 18 })), title: it.n, subtitle: restName(r) + ' · ' + M(it.p), chevron: true, onTap: () => { addRecent(q); openRest(r.id, it.id); } })) }], { cls: 'le-list' })] : null,
              !rs.length && !dishes.length ? JC.ui.empty({ icon: 'magnifyingglass', title: 'No results for “' + q.trim() + '”', text: 'Try “pelmeni”, “tea” or “hotpot”.' }) : null,
            ];
          },
        });
        function setQuery(t) { const s = page.searchEl && page.searchEl.querySelector('.search'); if (s && s.setValue) s.setValue(t); q = t; page.render(); }
        return page;
      }
      function addRecent(v) { v = String(v || '').trim(); if (!v) return; const S = st(); S.recent = [v].concat(S.recent.filter((x) => x.toLowerCase() !== v.toLowerCase())).slice(0, 6); save(); }

      // ═══ RESTAURANT ═══
      function openRest(id, itemId) {
        let r = rest(id);
        if (!r) r = D().RESTS.find((x) => x.place === id) || null;
        if (!r) { const p = R7().place(id); JC.ui.alert({ title: p ? p.name + ' isn’t on Wanmin Go' : 'Restaurant Not Found', message: p ? 'They don’t deliver through Wanmin Go yet. Try calling them, or browse what’s open near you.' : 'This restaurant may have closed.', buttons: [{ text: 'OK' }] }); return; }
        tabs.nav().push(restPage(r));
        if (itemId) { const it = itemById(r, itemId); if (it) setTimeout(() => itemSheet(r, it), 520); }
      }
      function restPage(r) {
        const page = PAGE({
          title: r.name, cls: 'le-restp', footer: cartBar(),
          right: [JC.ui.navBtn({ icon: 'magnifyingglass', label: 'Search menu', onTap: () => menuSearch(r) }), JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share', onTap: () => JC.ui.share({ title: r.name, subtitle: 'Wanmin Go · ' + r.cuisine, icon: 'bag.fill', payload: { kind: 'link', url: 'https://wanmingo.ly/r/' + r.id, text: r.name + ' on Wanmin Go' } }) }),
            JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: st().favs.includes(r.id) ? 'Remove from Saved' : 'Save', icon: 'heart', onTap: () => toggleFav(r) }, { text: 'Show on Map', icon: 'map', onTap: () => JC.os.open('maps', { place: r.place }) }, { text: 'Call Restaurant', icon: 'phone.fill', onTap: () => callRest(r) }, '-', { text: 'Report a Problem', icon: 'exclamationmark.bubble', onTap: () => JC.ui.alert({ title: 'Report a Problem', message: 'What’s wrong with this listing?', input: { placeholder: 'Wrong hours, menu, photos…' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default' }] }).then((x) => { if (x.index === 1) JC.ui.toast('Thanks — we’ll take a look', { icon: 'checkmark' }); }) }]) })],
          onScroll: (y) => { page.el.classList.toggle('le-solid', y > 170); },
          content: () => {
            const d = resolve();
            const hi = hoursOf(r);
            const dv = delivery(r, d);
            const P = restPlace(r);
            const menu = menuOf(r);
            return [
              h('div.le-rhero', heroEl(r, 'le-rhero-img'), h('div.le-rhero-fade')),
              h('div.le-rinfo',
                h('div.le-rname', r.name), r.branch ? h('div.le-rbranch', r.branch) : null,
                h('div.le-rmeta', h('span.le-rate', JC.icon('star.fill', { size: 12 }), ' ' + r.rating.toFixed(1)), h('span', ' (' + r.reviews + ' ratings) · ' + r.cuisine + ' · ' + r.price)),
                h('div.le-rmeta2', h('span', { class: { 'le-open': hi.open, 'le-shut': !hi.open } }, hi.text), P ? h('span', ' · ' + P.addr) : null),
                h('div.le-rstats',
                  h('div', h('b', dv ? (hi.open ? dv.range.replace(' min', '') : 'Later') : '—'), h('span', dv ? (hi.open ? 'min' : 'schedule') : 'out of range')),
                  h('div', h('b', dv ? M(dv.fee) : '—'), h('span', 'delivery')),
                  h('div', h('b', dv ? fmtKm(dv.km) : '—'), h('span', 'away')),
                  h('div.tap', { onTap: () => reviewsSheet(r) }, h('b', r.rating.toFixed(1) + ' ★'), h('span', 'reviews'))),
                !dv ? h('div.le-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' ' + r.name + (r.local ? ' only delivers along Dihua Marsh Road.' : ' doesn’t deliver that far.') + ' You’re sending to ' + destShort(d) + '.', h('span.tap', { onTap: () => destSheet(() => page.render()) }, ' Change')) : null,
                r.stamp ? h('div.le-offer.tap', { onTap: () => stampSheet() }, JC.icon('star.fill', { size: 14 }), ' Stamp card · ' + Math.min(10, st().stamps) + ' of 10' + (st().reward ? ' · free Mapo Tofu ready' : '')) : r.promo ? h('div.le-offer', JC.icon('tag.fill', { size: 14 }), ' ' + r.promo) : null,
                r.note ? h('div.le-rnote', r.note) : null),
              h('div.le-menutabs.hscroll', menu.map((c, ci) => h('span.le-mtab.tap', { onTap: () => { const sec = page.el.querySelector('.le-msec[data-ci="' + ci + '"]'); if (sec) page.scroll.scrollTo({ top: sec.offsetTop - 120, behavior: 'smooth' }); } }, c.cat))),
              h('div.le-menu', menu.map((c, ci) => h('div.le-msec', { data: { ci: String(ci) } }, h('div.le-msec-t', c.cat), c.items.map((it) => itemRow(r, it))))),
              h('div.le-rfoot', P ? P.name + ' · ' + P.addr : '', h('br'), 'Prices on Wanmin Go may be higher than in the restaurant. Allergies? Call the restaurant before ordering.'),
            ];
          },
        });
        return page;
      }
      function callRest(r) {
        const lines = {
          wanmin: ['Wanmin Restaurant! Xiangling speaking — oh! It’s you! Do you want the usual?', '…Guoba says hi. Okay, I have to go, the wok is on fire. On purpose!'],
          northern: ['Northern Kitchen, good evening. …Yes, we are open late. The pelmeni do not sleep.'],
          heyu: ['Heyu Tea House. If you are calling about the matinee, Box 2 is reserved under the name of the Northland Bank.'],
          bubu: ['Bubu Pharmacy, Qiqi speaking. …What was I going to say? …Oh. Do you need medicine?'],
        }[r.id] || [r.name + ', good evening. How can we help?', 'For orders, please use Wanmin Go. Thank you!'];
        MV().fakeCall({ name: r.name, num: '(0761) 555 01' + (10 + D().RESTS.indexOf(r)), glyph: 'fork.knife', lines });
      }
      function itemRow(r, it) {
        const inCart = cart() && cart().rest === r.id ? cart().items.filter((x) => x.id === it.id).reduce((a, b) => a + b.q, 0) : 0;
        return h('div.le-item', { onTap: () => itemSheet(r, it) },
          h('div.le-item-m', h('div.le-item-n', inCart ? h('span.le-qbadge', inCart + '×') : null, it.n), it.tag ? h('div.le-item-tag', it.tag) : null, h('div.le-item-d', it.d), h('div.le-item-p', M(it.p))),
          h('div.le-item-r', it.art ? JC.art.el(it.art, { cls: 'le-item-art' }) : null, h('div.le-add', { onTap: (e) => { e.stopPropagation(); if (it.opts && it.opts.some((g) => g.req)) itemSheet(r, it); else addToCart(r, { id: it.id, n: it.n, p: it.p, q: 1, opts: '' }); } }, JC.icon('plus', { size: 16, weight: 2.8 }))));
      }
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
          const top = tabs.nav() && tabs.nav().top();
          if (top && top.el.classList.contains('le-restp')) top.render();
        };
        if (S.cart && S.cart.items.length && S.cart.rest !== r.id) {
          const old = rest(S.cart.rest);
          JC.ui.alert({ title: 'Start a New Cart?', message: 'Your cart has items from ' + (old ? old.name : 'another restaurant') + '. Start a new cart with ' + r.name + ' instead?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'New Cart', style: 'destructive', onTap: go }] });
          return;
        }
        go();
      }
      function itemSheet(r, it) {
        const sel = (it.opts || []).map((g) => (g.one ? new Set([g.ch[0][0]]) : new Set()));
        let q = 1, note = '';
        const unit = () => it.p + (it.opts || []).reduce((acc, g, gi) => acc + g.ch.filter((c) => sel[gi].has(c[0])).reduce((a, c) => a + c[1], 0), 0);
        const s = SHEET({
          detent: 'large', cls: 'le-isheet', left: { icon: 'xmark' }, title: '',
          content: () => [
            it.art ? JC.art.el(it.art, { cls: 'le-isheet-art' }) : null,
            h('div.le-isheet-m', h('div.le-isheet-n', it.n), h('div.le-isheet-p', M(it.p)), h('div.le-isheet-d', it.d), it.alcohol ? h('div.le-warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), ' 18+ only. The courier will check ID on delivery.') : null),
            (it.opts || []).map((g, gi) => h('div.le-og',
              h('div.le-og-h', h('b', g.n), h('span.le-og-req', { class: { req: !!g.req } }, g.req ? 'Required' : 'Optional')),
              g.ch.map(([label, add]) => h('div.le-oc', { onTap: () => { if (g.one) { sel[gi].clear(); sel[gi].add(label); } else if (sel[gi].has(label)) sel[gi].delete(label); else sel[gi].add(label); s.render(); } },
                h('span.le-oc-mark', { class: { on: sel[gi].has(label), radio: !!g.one } }, sel[gi].has(label) ? JC.icon('checkmark', { size: 13, weight: 3 }) : null),
                h('span.le-oc-l', label), add ? h('span.le-oc-p', '+' + M(add)) : null)))),
            h('div.le-og', h('div.le-og-h', h('b', 'Special instructions'), h('span.le-og-req', 'Optional')),
              JC.ui.input({ value: note, placeholder: r.id === 'moonchase' ? 'Message on the cake, e.g. “WELCOME TO LIYUE, TEUCER”' : 'e.g. no scallion, extra chili, extra napkins', cls: 'le-note-in', multiline: true, rows: 2, onInput: (v) => { note = v; } })),
            h('div.le-isheet-foot',
              h('div.le-qty', h('div.le-qbtn', { class: { off: q <= 1 }, onTap: () => { if (q > 1) { q--; s.render(); } } }, JC.icon('minus', { size: 16, weight: 2.8 })), h('b', String(q)), h('div.le-qbtn', { onTap: () => { q = Math.min(99, q + 1); s.render(); } }, JC.icon('plus', { size: 16, weight: 2.8 }))),
              JC.ui.btn({ text: 'Add ' + q + ' to cart · ' + M(unit() * q), kind: 'filled', size: 'l', cls: 'le-addbtn', onTap: () => {
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
          const all = [];
          menuOf(r).forEach((c) => c.items.forEach((it) => all.push(it)));
          const results = () => {
            const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
            const hits = all.filter((it) => !words.length || words.every((w) => (it.n + ' ' + it.d).toLowerCase().includes(w)));
            return h('div.le-mresults', hits.length ? h('div.le-menu', h('div.le-msec', hits.map((it) => itemRow(r, it)))) : JC.ui.empty({ icon: 'fork.knife', title: 'No matching dishes' }));
          };
          return [h('div.le-msearch', JC.ui.search({ placeholder: 'Search menu', onInput: (v) => { q = v; const list = s.body.querySelector('.le-mresults'); if (list) list.replaceWith(results()); } })), results()];
        } });
        void s;
      }
      const REVIEWS = {
        wanmin: [['Xiao Jie', 5, 'The mapo tofu made me cry and then order more mapo tofu.'], ['Hungry traveler', 5, 'I ordered “a bit spicy”. I can now see through time.'], ['P. (Emergency Food)', 5, 'PAIMON GIVES THIS RESTAURANT A MILLION STARS. the courier was scared of Paimon. rude.'], ['Dockworker Gao', 4, 'Mora meat still crispy after twenty minutes on a bike. Witchcraft.']],
        northern: [['Night desk, Harbor Road', 5, 'Sixty pelmeni arrived at 22:20 and were gone by 22:24. Morale restored.'], ['Snezhnayan abroad', 5, 'Tastes like Morepesok. I had to sit down for a moment.'], ['L.', 4, 'Borscht excellent. Please do not freeze the leftovers, it ruins the texture. (I learned this.)']],
        heyu: [['Opera regular', 5, 'Tea arrived at the interval, silently, like a well-trained ghost.'], ['Z.', 5, 'The oolong was correctly roasted and served at a respectful temperature. I am grateful to whoever sent it.'], ['Box 2', 5, 'Sunflower seeds: essential. Cracking them during the aria: forbidden.']],
        bubu: [['Anonymous', 5, 'Bandages at 23:40, no questions asked. Exactly what I needed.'], ['Mother of three', 5, 'Qiqi forgot the receipt but remembered the lozenges. Fair trade.'], ['Feiyun Slope resident', 4, 'Dr. Baizhu’s tonic is miraculous. Tastes like a forest floor.']],
        goodhunter: [['P. (Emergency Food)', 5, '38 SWEET MADAMES. ALL PERFECT. Paimon is not sorry.'], ['Mondstadt expat', 4, 'Close to the original. The cider made me homesick.']],
        'third-round': [['T.', 5, 'The special is the only meal that has ever made me lose a fight to sleep.'], ['Crux deckhand', 5, 'Captain says the loser buys. The loser is very generous lately.']],
        liuli: [['Business dinner', 5, 'The tasting box is a banquet in two boxes. Worth every Mora (I was not paying).'], ['A.', 5, 'Somebody always forgets their wallet here. It isn’t me.']],
        moonchase: [['Teacher Lin', 5, 'Fish-shaped buns are a hit with the class.'], ['Night owl', 4, 'Osmanthus cake sold out by noon. Tragic.']],
        wangshu: [['Traveler', 5, 'Quiet, kind, excellent almond tofu.'], ['Guest, room 3', 5, 'The breakfast set and the view of the marsh are worth the drive.']],
        xinyue: [['Merchant guild', 5, 'Closed a deal over Prosperous Peace. Delivered in style.'], ['Ms. Q', 4, 'Golden crab a bit salty, still the best on Feiyun Slope.']],
      };
      function reviewsSheet(r) {
        const RV = REVIEWS[r.id] || [['Wanmin Go customer', 5, 'Fast delivery, still hot.'], ['Regular', 4, 'Reliable. Would order again.']];
        SHEET({ title: 'Ratings & reviews', detent: 'large', left: { text: 'Done' }, content: () => [
          h('div.le-rvhead', h('b', r.rating.toFixed(1)), h('div', h('div.le-stars', '★★★★★'.slice(0, Math.round(r.rating))), h('span', r.reviews + ' ratings'))),
          JC.ui.list([{ rows: RV.map(([who, n, t]) => ({ title: who, subtitle: t, clamp: false, detail: '★'.repeat(n) })) }], { cls: 'le-list le-rvlist' }),
        ] });
      }
      function stampSheet() {
        const S = st();
        const n = Math.min(10, S.stamps);
        SHEET({ title: 'Wanmin stamp card', detent: 'medium', left: { text: 'Done' }, content: () => [
          h('div.le-stamps', Array.from({ length: 10 }, (_, i) => h('span.le-stamp', { class: { on: i < n } }, i < n ? JC.icon('flame.fill', { size: 18 }) : String(i + 1)))),
          h('div.le-stamp-t', S.reward ? 'Your free Mapo Tofu is ready. Add one to your next Wanmin Restaurant order.' : 'Every Wanmin Restaurant order earns a stamp. Ten stamps: one Mapo Tofu on the house.'),
          h('div.le-stamp-s', 'The same card is in Wallet.'),
        ] });
      }

      // ═══ CART & CHECKOUT ═══
      function openCart() {
        const c = cart();
        const nav = tabs.nav();
        if (!c || !c.items.length) { JC.ui.alert({ title: 'Your Cart Is Empty', message: 'Add something from a restaurant to get started.', buttons: [{ text: 'OK' }] }); return; }
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
              h('div.le-cart-rest', { onTap: () => page.nav.pop() }, h('div.le-cart-rimg', heroEl(r)), h('div', h('b', r.name), h('span', r.cuisine)), JC.icon('chevron.right', { size: 14, weight: 2.6 })),
              JC.ui.list([{ rows: c.items.map((x) => ({ custom: h('div.le-cline',
                h('div.le-cline-m', h('b', x.n), x.opts ? h('span', x.opts) : null, x.note ? h('span.le-cline-note', '“' + x.note + '”') : null, h('span.le-cline-p', M(x.p * x.q))),
                h('div.le-qty.sm', h('div.le-qbtn', { onTap: () => { x.q -= 1; if (x.q <= 0) c.items.splice(c.items.indexOf(x), 1); if (!c.items.length) st().cart = null; cartChanged(); page.render(); if (!cart()) setTimeout(() => page.nav.pop(), 250); } }, JC.icon(x.q <= 1 ? 'trash' : 'minus', { size: 15, weight: 2.6 })), h('b', String(x.q)), h('div.le-qbtn', { onTap: () => { x.q = Math.min(99, x.q + 1); cartChanged(); page.render(); } }, JC.icon('plus', { size: 15, weight: 2.8 })))) })) },
              { rows: [{ title: 'Add more items', tinted: true, onTap: () => page.nav.pop() }, { title: 'Chopsticks & napkins', subtitle: 'Only ask for them if you need them', toggle: { on: !!c.utensils, onChange: (v) => { c.utensils = v; cartChanged(); } } }] }], { cls: 'le-list' }),
              h('div.le-sum', h('div', h('span', 'Subtotal'), h('b', M(cartSub())))),
              h('div.le-cta-wrap', JC.ui.btn({ text: 'Go to checkout', kind: 'filled', size: 'l', cls: 'le-cta', onTap: () => page.nav.push(checkoutPage()) })),
            ];
          },
        });
        return page;
      }
      function checkoutPage() {
        const S = st();
        const ck = { drop: 'Hand it to me', note: '', anon: false, tip: 10, when: null };
        const page = PAGE({
          title: 'Checkout', cls: 'le-checkout', bg: 'grouped',
          onShow: () => tabs.hideBar(true), onHide: () => tabs.hideBar(false), onClose: () => tabs.hideBar(false),
          content: () => {
            const c = cart();
            if (!c) return [JC.ui.empty({ icon: 'bag.fill', title: 'Your cart is empty' })];
            const r = rest(c.rest);
            const d = resolve();
            const hi = hoursOf(r);
            const dv = delivery(r, d);
            if (!hi.open && !ck.when) ck.when = nextOpen(r);
            if (d.friend && !ck._giftSet) { ck._giftSet = true; ck.drop = 'Hand it to them'; }
            const T = totals(r, c, dv);
            const frozen = JC.bank.frozen();
            return [
              JC.ui.list([{ header: d.friend ? 'Sending to' : 'Deliver to', rows: [
                d.friend ? { avatar: d.avatar, avatarSize: 36, title: d.label, subtitle: d.line, chevron: true, onTap: () => destSheet(() => page.render()) }
                  : { icon: { glyph: d.icon || 'mappin', bg: TINT }, title: d.label, subtitle: d.line, chevron: true, onTap: () => destSheet(() => page.render()) },
                { icon: { glyph: 'hand.raised', bg: '#8e8e93' }, title: 'Drop-off', detail: ck.drop, chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Drop-off options', actions: (d.friend ? ['Hand it to them', 'Leave it at the door', 'Leave it at reception'] : ['Hand it to me', 'Leave it at the door', 'Meet outside', 'Leave it at reception']).map((t) => ({ text: t, onTap: () => { ck.drop = t; page.render(); } })) }) },
                { icon: { glyph: 'clock', bg: '#30b0c7' }, title: hi.open ? (ck.when ? 'Scheduled' : 'Standard') : 'Scheduled', subtitle: ck.when ? U.fmtDate(ck.when, 'day') + ' · ' + U.fmtTime(ck.when) + (hi.open ? '' : ' · ' + r.name + ' is closed now') : (dv ? dv.range : ''), detail: hi.open ? (ck.when ? 'Change' : 'ASAP') : 'Change', chevron: true, onTap: () => whenSheet(r, ck, () => page.render()) },
              ] }], { cls: 'le-list' }),
              !dv ? h('div.le-warn.block', JC.icon('exclamationmark.triangle.fill', { size: 15 }), ' ' + r.name + ' doesn’t deliver to ' + destShort(d) + '. Choose another address or restaurant.') : null,
              JC.ui.list([{ header: d.friend ? 'Note for the courier' : 'Note to courier', footer: ck.anon ? 'Sent as a gift: the courier and the receipt won’t show your name.' : (d.friend ? 'Your name shows on the gift card: “From Childe”.' : null), rows: [
                { custom: JC.ui.input({ value: ck.note, placeholder: 'Gate code, landmarks, anything else…', cls: 'le-field', multiline: true, rows: 2, onInput: (v) => { ck.note = v; } }) },
                { custom: h('div.le-qchips.hscroll', (d.friend ? ['Eat while it’s hot!', 'From your favourite Harbinger 😁', 'Don’t say who it’s from.', 'Share with the others.'] : ['Leave it at the door', 'Call when you arrive', 'Tell security it’s for the director']).map((t) => h('span.le-chip.tap', { onTap: () => { ck.note = t; if (/who it’s from/.test(t)) ck.anon = true; page.render(); } }, t))) },
                { title: 'Send as a gift (hide my name)', toggle: { on: ck.anon, onChange: (v) => { ck.anon = v; page.render(); } } },
              ] }], { cls: 'le-list' }),
              JC.ui.list([{ header: 'Payment', rows: [
                { leading: h('div.le-cardic'), title: cardLabel(), subtitle: frozen ? 'Frozen · unfreeze it in Northland to pay' : 'Wallet Pay · Northland Bank', detail: frozen ? 'Frozen' : null, chevron: true, onTap: () => payInfo() },
                { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promo code', detail: T.discount ? '−' + M(T.discount) : (S.promo || 'Add'), chevron: true, onTap: () => promoAlert(() => page.render()) },
              ] }], { cls: 'le-list' }),
              h('div.le-tipbox', h('div.le-tip-h', h('b', 'Tip your courier'), h('span', '100% goes to the courier')), h('div.le-tips', [0, 5, 10, 20, 50].map((t) => h('span.le-tip.tap', { class: { on: ck.tip === t }, onTap: () => { ck.tip = t; page.render(); } }, t ? M(t) : 'Not now')))),
              h('div.le-sum',
                h('div', h('span', 'Subtotal'), h('span', M(T.sub))),
                h('div', h('span', 'Delivery fee'), h('span', dv ? M(T.fee) : '—')),
                h('div', h('span', 'Service fee'), h('span', M(T.service))),
                T.small ? h('div', h('span', 'Small order fee'), h('span', M(T.small))) : null,
                T.discount ? h('div.le-disc', h('span', T.discountLabel), h('span', '−' + M(T.discount))) : null,
                h('div', h('span', 'Courier tip'), h('span', M(ck.tip))),
                h('div.le-total', h('b', 'Total'), h('b', M(T.total + ck.tip)))),
              h('div.le-cta-wrap', JC.ui.btn({ text: (ck.when ? 'Schedule order · ' : d.friend ? 'Send gift · ' : 'Place order · ') + M(T.total + ck.tip), kind: 'filled', size: 'l', cls: 'le-cta', disabled: !dv, onTap: () => placeOrder(r, d, ck, Object.assign({}, T, { tip: ck.tip, total: T.total + ck.tip })) }),
                h('div.le-legal', 'By placing your order you agree to the Wanmin Go terms. ' + (ck.when ? 'You’ll be charged now; cancel any time before the kitchen starts.' : ''))),
            ];
          },
        });
        return page;
      }
      function payInfo() {
        JC.ui.actionSheet({ title: 'Pay with', message: 'Wanmin Go uses the card in your Wallet.', actions: [
          { text: cardLabel() + (JC.bank.frozen() ? ' (frozen)' : ''), onTap: () => {} },
          { text: 'Open Northland', onTap: () => JC.os.open('northland') },
        ] });
      }
      function totals(r, c, dv) {
        const S = st();
        const sub = c.items.reduce((a, b) => a + b.p * b.q, 0);
        const late = JC.time.date().getHours() >= 22 || JC.time.date().getHours() < 5;
        let fee = dv ? dv.fee : 0;
        const service = Math.min(60, Math.max(4, Math.round(sub * 0.04)));
        const small = sub < 40 ? 6 : 0;
        let discount = 0, discountLabel = '';
        const mapo = c.items.find((x) => x.id === 'wm_mapo');
        if (r.id === 'wanmin' && S.reward && mapo) { discount = mapo.p; discountLabel = 'Stamp card: free Mapo Tofu'; }
        else if (S.promo === 'XIANGLING' && r.id === 'wanmin') { discount = Math.round(sub * 0.1); discountLabel = 'XIANGLING −10%'; }
        else if (S.promo === 'NIGHTSHIFT' && late) { discount = fee; discountLabel = 'NIGHTSHIFT · free delivery'; }
        else if (S.promo === 'NORTHWIND' && r.id === 'northern') { discount = Math.min(80, Math.round(sub * 0.15)); discountLabel = 'NORTHWIND −15%'; }
        return { sub, fee, service, small, discount, discountLabel, total: Math.max(0, sub + fee + service + small - discount) };
      }
      function promoAlert(done) {
        JC.ui.alert({ title: 'Promo Code', message: 'Enter a code from a Wanmin Go message or email.', input: { placeholder: 'Code', cap: 'characters' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Apply', style: 'default' }] }).then((x) => {
          if (x.index !== 1) return;
          const v = String(x.value || '').trim().toUpperCase();
          if (!v) return;
          const ok = { XIANGLING: '10% off Wanmin Restaurant', NIGHTSHIFT: 'Free delivery after 22:00', NORTHWIND: '15% off Northern Kitchen' }[v];
          if (ok) { st().promo = v; save(); JC.ui.toast(v + ' applied — ' + ok, { icon: 'checkmark' }); done(); }
          else if (v === 'TARTAGLIA11') JC.ui.alert({ title: 'Wrong App', message: 'TARTAGLIA11 is a Harbor Ride code. Nice try.', buttons: [{ text: 'OK' }] });
          else JC.ui.alert({ title: 'Invalid Code', message: '“' + v + '” isn’t a valid promo code.', buttons: [{ text: 'OK' }] });
        });
      }
      function whenSheet(r, ck, done) {
        const hi = hoursOf(r);
        const base = hi.open ? JC.time.now() + 45 * 60000 : nextOpen(r);
        const slots = [];
        const d0 = new Date(base); d0.setMinutes(Math.ceil(d0.getMinutes() / 15) * 15, 0, 0);
        for (let i = 0; i < 10; i++) slots.push(d0.getTime() + i * 30 * 60000);
        SHEET({ title: 'Delivery time', detent: 'medium', left: { text: 'Cancel' }, content: (s) => [JC.ui.list([{ rows: (hi.open ? [{ title: 'As soon as possible', subtitle: delivery(r) ? delivery(r).range : '', check: !ck.when, onTap: () => { ck.when = null; s.close(); done(); } }] : []).concat(slots.map((t) => ({ title: U.fmtDate(t, 'day') + ' · ' + U.fmtTime(t), subtitle: (new Date(t).getDate() !== JC.time.date().getDate() ? 'Tomorrow' : 'Today') + ' · 30-minute window', check: ck.when === t, onTap: () => { ck.when = t; s.close(); done(); } }))) }], { cls: 'le-list' })] });
      }
      /** Deliver-to picker: saved places + Send to a friend */
      function destSheet(done, friendsFirst) {
        const S = st();
        const cur = S.dest;
        const s = SHEET({ title: 'Deliver to', detent: 'large', left: { text: 'Done' }, cls: 'le-destsheet', content: () => {
          const places = { header: 'Your places', rows: D().ADDRS.map((a) => ({ icon: { glyph: a.icon, bg: cur.kind === 'place' && cur.id === a.id ? TINT : '#8e8e93' }, title: a.label, subtitle: a.line, check: cur.kind === 'place' && cur.id === a.id, onTap: () => pick({ kind: 'place', id: a.id }) })) };
          const friends = { header: 'Send to a friend', footer: 'They get a text from Wanmin Go and share a drop-off pin. You pay; they eat.', rows: D().FRIENDS.map((f) => {
            const fi = friendInfo(f);
            return { avatar: fi.avatar, avatarSize: 36, title: fi.name, subtitle: fi.off || fi.sub, check: cur.kind === 'friend' && cur.cid === f.id, cls: fi.off ? 'le-off' : '', onTap: () => { if (fi.off) { JC.ui.alert({ title: 'Can’t Deliver', message: fi.off, buttons: [{ text: 'OK' }] }); return; } pick({ kind: 'friend', cid: f.id }); } };
          }) };
          return [JC.ui.list(friendsFirst ? [friends, places] : [places, friends], { cls: 'le-list' })];
        } });
        function pick(dest) { S.dest = dest; save(); s.close(); if (done) done(); refreshTop(['home', 'browse']); }
      }

      // ── payment & order creation ──
      function placeOrder(r, d, ck, T) {
        const S = st();
        const c = cart();
        if (!c) return;
        if (c.items.some((x) => { const it = itemById(r, x.id); return it && it.alcohol; }) && !ck.when) {
          const H = JC.time.date().getHours();
          if (H >= 2 && H < 8) { JC.ui.alert({ title: 'Alcohol Not Available', message: 'Alcohol can’t be delivered between 2 and 8 a.m.', buttons: [{ text: 'OK' }] }); return; }
        }
        const declined = (reason) => JC.ui.alert({ title: reason === 'frozen' ? 'Card Frozen' : 'Payment Declined', message: JC.bank.reasonText(reason) + ' Your order wasn’t placed.', buttons: [{ text: 'OK' }] });
        const note = restName(r) + ' → ' + (d.friend ? 'gift for ' + d.label : d.label);
        const pay = JC.wallet && JC.wallet.pay
          ? JC.wallet.pay({ merchant: 'Wanmin Go', sub: r.name, amount: T.total, card: card().id, cat: 'food', place: r.place, note, sms: 'WANMIN GO', app: 'lotuseats', record: false })
          : JC.ui.alert({ title: 'Confirm Order', message: M(T.total) + ' will be charged to ' + cardLabel() + '.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Pay', style: 'default' }] }).then((x) => ({ ok: x.index === 1 }));
        pay.then((res) => {
          if (res && !res.ok && res.reason) { declined(res.reason); return; }
          if (!res || !res.ok) return;
          const paid = JC.bank.charge({ amount: T.total, merchant: 'Wanmin Go', app: 'lotuseats', cat: 'food', card: card().id, place: r.place, note, sms: 'WANMIN GO', contact: d.for && JC.contacts.get(d.for) ? d.for : undefined });
          if (!paid.ok) { declined(paid.reason); return; }
          const cr = D().COURIERS[Math.floor(Math.random() * D().COURIERS.length)];
          const dv = delivery(r, d);
          const o = JC.store.add('orders', {
            rest: r.id, to: d.to, for: d.for || null, toLabel: d.friend ? d.label : d.label, toLine: d.line, place: d.place, friend: !!d.friend,
            t: JC.time.now(), status: ck.when ? 'scheduled' : 'active', phase: ck.when ? 'scheduled' : 'placed', sched: ck.when || null,
            items: c.items.map((x) => ({ id: x.id, name: x.n, qty: x.q, price: x.p, opts: x.opts || '', note: x.note || '' })), sub: T.sub, fee: T.fee, service: T.service, small: T.small, discount: T.discount, discountLabel: T.discountLabel, tip: T.tip, total: T.total,
            card: card().id, tx: paid.tx && paid.tx.id, note: ck.note.trim(), anon: ck.anon, drop: ck.drop, utensils: !!c.utensils, eta: dv ? dv.eta : 30,
            courier: { name: cr[0], rating: cr[1], vehicle: cr[2] },
          }, { front: true });
          if (r.id === 'wanmin') {
            if (T.discountLabel && /Stamp card/.test(T.discountLabel)) { S.reward = false; S.stamps = 0; }
            S.stamps = (S.stamps || 0) + 1;
            if (S.stamps >= 10 && !S.reward) { S.reward = true; setTimeout(() => JC.ui.toast('Stamp card full — a free Mapo Tofu is waiting', { icon: 'star.fill' }), 1600); }
          }
          S.cart = null; cartChanged();
          JC.story.act('order', { id: o.id, rest: r.id, items: o.items.map((x) => ({ name: x.name, qty: x.qty, price: x.price })), total: T.total, to: d.to, for: d.for || null, app: 'lotuseats', sched: ck.when || null });
          sms('[Wanmin Go] Order confirmed: ' + r.name + ' → ' + (d.friend ? d.label + ' (gift)' : d.label) + '. ' + o.items.map((x) => x.qty + ' × ' + x.name).slice(0, 2).join(', ') + (o.items.length > 2 ? '…' : '') + ' · ' + M(T.total) + (ck.when ? '. Scheduled for ' + U.fmtDate(ck.when, 'day') + ' ' + U.fmtTime(ck.when) + '.' : '. Arriving around ' + U.fmtTime(JC.time.now() + o.eta * 60000) + '.'));
          const nav = tabs.nav();
          tabs.hideBar(false);
          while (nav.depth() > 1 && nav.pop({ instant: true })) { /* unwind */ }
          openOrder(o.id);
          if (!ck.when) startSim(o.id);
        });
      }

      // ═══ LIVE ORDER SIMULATION ═══
      const PHASES = ['placed', 'preparing', 'pickup', 'delivering', 'arrived', 'delivered'];
      const sims = {};
      const toWho = (o) => (o.friend ? o.toLabel : 'you');
      function phaseTitle(o) {
        if (o.status === 'scheduled') return 'Scheduled · ' + U.fmtDate(o.sched, 'day') + ' ' + U.fmtTime(o.sched);
        return { placed: 'Order received', preparing: 'Preparing the order', pickup: 'Courier at the restaurant', delivering: 'On the way', arrived: 'Courier has arrived', delivered: 'Delivered' }[o.phase] || 'Order';
      }
      function phaseSub(o) {
        const r = rest(o.rest);
        if (o.status === 'scheduled') return r ? r.name + ' will start at ' + U.fmtTime(o.sched) : '';
        const left = remaining(o);
        return { placed: (r ? r.name : 'The restaurant') + ' is confirming the order', preparing: 'Arriving in about ' + left + ' min', pickup: o.courier.name + ' is collecting the food', delivering: 'Arriving in ' + Math.max(1, left) + ' min', arrived: /door|reception/i.test(o.drop) ? 'Left as requested' : o.courier.name + ' is with ' + toWho(o), delivered: o.friend ? 'Delivered to ' + o.toLabel : 'Enjoy your meal' }[o.phase] || '';
      }
      function remaining(o) {
        const sm = sims[o.id];
        const k = sm ? sm.k : 0;
        const idx = PHASES.indexOf(o.phase);
        const frac = Math.min(1, (idx + k) / 4);
        return Math.max(0, Math.round(o.eta * (1 - frac)));
      }
      const arriveAt = (o) => o.t + o.eta * 60000;
      function startSim(id) {
        const o0 = JC.store.get('orders', id);
        if (!o0 || o0.status !== 'active' || sims[id]) return;
        const r = rest(o0.rest);
        const leg = r ? legFor(r, o0.place || o0.to) : null;
        const sm = sims[id] = { k: 0, raf: null, pos: null, leg };
        const dur = { placed: 5000, preparing: 14000, pickup: 4500, delivering: Math.max(16000, Math.min(42000, (leg ? leg.min : 15) * 1600)), arrived: 5000 };
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
            if (ph === 'delivering' && leg) { const p = MV().along(leg.pts, leg.km * sm.k); sm.pos = [p.x, p.y]; }
            else if (ph === 'pickup' || ph === 'preparing' || ph === 'placed') sm.pos = leg ? leg.pts[0] : null;
            else if (leg) sm.pos = leg.pts[leg.pts.length - 1];
            JC.bus.emit('lotuseats:tick', { id });
            if (sm.k >= 1) { const next = PHASES[PHASES.indexOf(ph) + 1]; advance(id, next); if (next !== 'delivered') run(); return; }
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
        if (!st().notif.orders && phase !== 'delivered') { if (JC.os.island.has(ISL)) JC.os.island.update(ISL); return; }
        if (phase === 'preparing') JC.notify.push(Object.assign({ title: (r ? r.name : 'Restaurant') + ' accepted the order', body: 'Cooking now · arriving around ' + U.fmtTime(arriveAt(o)) }, n));
        if (phase === 'pickup') JC.notify.push(Object.assign({ title: 'Courier at the restaurant', body: o.courier.name + ' is picking up the order.' }, n));
        if (phase === 'delivering') JC.notify.push(Object.assign({ title: 'On the way' + (o.friend ? ' to ' + o.toLabel : ''), body: o.courier.name + ' · ' + o.courier.vehicle + ' · ' + Math.max(1, remaining(JC.store.get('orders', id))) + ' min' }, n));
        if (phase === 'arrived') { JC.audio.play('tink'); JC.notify.push(Object.assign({ title: 'Courier has arrived', body: o.friend ? o.courier.name + ' is handing the gift to ' + o.toLabel + '.' : /door|reception/i.test(o.drop) ? 'Your order was left as requested.' : o.courier.name + ' is outside ' + (o.toLabel || 'your address') + '.' }, n)); }
        if (phase === 'delivered') {
          stopSim(id);
          JC.audio.play('success');
          sms('[Wanmin Go] Delivered! ' + (r ? r.name : 'Your order') + ' → ' + (o.friend ? o.toLabel + '. They’ve got it.' : (o.toLabel || 'your address') + '. Enjoy!') + ' Rate ' + o.courier.name + ' in the app.');
        }
        if (JC.os.island.has(ISL)) JC.os.island.update(ISL);
      }
      function islandStart(id) {
        JC.os.island.start(ISL, {
          priority: 2, width: 220,
          compact: () => { const o = JC.store.get('orders', id); return { left: h('span.le-isl-l', JC.icon('bag.fill', { size: 16 })), right: h('span.le-isl-r', !o ? '' : o.phase === 'arrived' ? 'Here' : Math.max(1, remaining(o)) + ' min') }; },
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
            const spent = past.filter((o) => o.status === 'delivered' && JC.time.now() - o.t < 30 * 86400e3).reduce((a, o) => a + o.total, 0);
            return [
              live.length ? [sectionH('In progress'), h('div.le-olist', live.map((o) => orderCard(o, true)))] : null,
              sectionH('Past orders', h('span.le-hsub', M(spent) + ' this month')),
              past.length ? h('div.le-olist', past.map((o) => orderCard(o))) : JC.ui.empty({ icon: 'bag.fill', title: 'No orders yet' }),
            ];
          },
        });
        offs.push(JC.bus.on('store:orders', () => { if (page.el.isConnected) page.render(); }));
        return page;
      }
      const qtyOf = (o) => o.items.reduce((a, b) => a + b.qty, 0);
      function destLabelOf(o) {
        if (o.toLabel) return o.toLabel;
        if (o.for && (JC.contacts.get(o.for) || o.for === 'ops')) return o.for === 'ops' ? 'Night shift' : JC.contacts.short(o.for);
        const a = D().ADDRS.find((x) => x.id === o.to);
        return a ? a.label : R7().name(o.to);
      }
      function orderCard(o, live) {
        const r = rest(o.rest);
        if (!r) return null;
        const d = new Date(o.t);
        return h('div.le-ocard', { class: { live: !!live }, onTap: () => openOrder(o.id) },
          h('div.le-ocard-img', heroEl(r)),
          h('div.le-ocard-m',
            h('b', restName(r)),
            h('span', live ? phaseTitle(o) : (o.status === 'cancelled' ? 'Cancelled · ' : '') + U.fmtDate(o.t, 'md') + (d.getFullYear() !== JC.time.date().getFullYear() ? ', ' + d.getFullYear() : '') + ' · ' + U.fmtTime(o.t)),
            h('span', qtyOf(o) + ' item' + (qtyOf(o) === 1 ? '' : 's') + ' · ' + M(o.total) + ' · ' + (o.pickup ? 'pickup' : (o.for ? 'for ' : 'to ') + destLabelOf(o)))),
          live ? JC.icon('chevron.right', { size: 14, weight: 2.6 }) : h('div.le-reorder', { onTap: (e) => { e.stopPropagation(); reorder(o); } }, 'Reorder'));
      }
      function reorder(o) {
        const r = rest(o.rest);
        if (!r) return;
        const S = st();
        const go = () => {
          S.cart = { rest: r.id, items: o.items.map((x) => ({ key: x.id + '|' + (x.opts || '') + '|', id: x.id, n: x.name, p: x.price, q: x.qty, opts: x.opts || '' })), utensils: false };
          if (o.for && D().FRIENDS.some((f) => f.id === o.for) && !friendInfo(D().FRIENDS.find((f) => f.id === o.for)).off) S.dest = { kind: 'friend', cid: o.for };
          else if (D().ADDRS.some((a) => a.id === o.to)) S.dest = { kind: 'place', id: o.to };
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
          right: [JC.ui.navBtn({ icon: 'square.and.arrow.up', label: 'Share receipt', onTap: () => { const o = JC.store.get('orders', id); const r = rest(o.rest); JC.ui.share({ title: 'Wanmin Go receipt', subtitle: r.name + ' · ' + M(o.total), icon: 'bag.fill', payload: { kind: 'text', text: 'Wanmin Go · ' + r.name + ' → ' + (o.anon ? '(gift)' : destLabelOf(o)) + ' · ' + U.fmtDate(o.t, 'medium') + ' · ' + M(o.total) } }); } })],
          content: () => {
            const o = JC.store.get('orders', id);
            if (!o) return [JC.ui.empty({ icon: 'bag.fill', title: 'Order not found' })];
            const r = rest(o.rest);
            const P = restPlace(r), Q = R7().place(o.place || (R7().PLACES[o.to] ? o.to : 'moonchase'));
            const leg = o.pickup ? null : legFor(r, Q ? Q.id : o.to);
            const rated = st().rated[o.id] || o.rated;
            const forName = o.for ? (o.for === 'ops' ? 'Liyue Branch night shift' : JC.contacts.short(o.for)) : null;
            return [
              P && Q && leg ? h('div.le-omap', MV().thumb([Q.x, Q.y], { w: 370, h: 150, style: 'explore', fit: [[P.x, P.y], [Q.x, Q.y]], routes: [{ pts: leg.pts, color: TINT, width: 4 }], marker: false, dots: [{ at: [P.x, P.y], color: TINT }, { at: [Q.x, Q.y], color: '#1c1c1e' }] })) : null,
              h('div.le-ohead', h('div.le-ohead-img', heroEl(r)), h('div', h('b', r.name), h('span', o.status === 'cancelled' ? 'Cancelled' : o.status === 'scheduled' ? 'Scheduled for ' + U.fmtDate(o.sched, 'day') + ' ' + U.fmtTime(o.sched) : o.pickup ? 'Picked up ' + U.fmtDate(o.t, 'full') : 'Delivered ' + U.fmtDate(o.end || o.t, 'full') + ' · ' + U.fmtTime(o.end || o.t)))),
              JC.ui.list([{ header: o.pickup ? 'Pickup' : forName ? 'Sent to' : 'Delivered to', rows: [
                forName ? { avatar: o.for === 'ops' ? { emoji: '🐟', grad: ['#a5d8ff', '#1c4f82'] } : o.for, avatarSize: 36, title: forName, subtitle: (Q ? Q.name : '') + (o.anon ? ' · sent anonymously' : ' · gift from you') }
                  : { icon: { glyph: (D().ADDRS.find((a) => a.id === o.to) || {}).icon || 'mappin.fill', bg: TINT }, title: destLabelOf(o), subtitle: Q ? Q.name + ' · ' + Q.addr : '' },
                o.note ? { icon: { glyph: 'text.bubble', bg: '#8e8e93' }, title: '“' + o.note + '”', subtitle: 'Note to courier' + (o.anon ? ' · sender hidden' : '') } : null,
                o.courier ? { avatar: { initials: o.courier.name.slice(0, 2), grad: ['#ff8a80', TINT] }, avatarSize: 36, title: o.courier.name, subtitle: o.courier.vehicle, detail: '★ ' + o.courier.rating.toFixed(2) } : null].filter(Boolean) },
                { header: 'Items', rows: o.items.map((x) => ({ title: x.qty + ' × ' + x.name, subtitle: [x.opts, x.note ? '“' + x.note + '”' : ''].filter(Boolean).join(' · ') || null, detail: M(x.price * x.qty) })) }], { cls: 'le-list' }),
              h('div.le-sum',
                h('div', h('span', 'Subtotal'), h('span', M(o.sub))), o.pickup ? null : h('div', h('span', 'Delivery fee'), h('span', M(o.fee))), h('div', h('span', 'Service fee'), h('span', M(o.service))),
                o.small ? h('div', h('span', 'Small order fee'), h('span', M(o.small))) : null, o.discount ? h('div.le-disc', h('span', o.discountLabel || 'Discount'), h('span', '−' + M(o.discount))) : null,
                o.tip ? h('div', h('span', 'Courier tip'), h('span', M(o.tip))) : null, h('div.le-total', h('b', 'Total'), h('b', M(o.total))),
                h('div.le-paid', JC.icon('creditcard.fill', { size: 14 }), ' Paid with ' + cardLabel())),
              JC.ui.list([{ rows: [
                o.status === 'delivered' ? { title: 'Reorder', icon: { glyph: 'arrow.clockwise', bg: TINT }, chevron: true, onTap: () => reorder(o) } : null,
                o.status === 'delivered' ? { title: rated ? 'You rated this order ' + '★'.repeat(rated) : 'Rate this order', icon: { glyph: 'star.fill', bg: '#ff9f0a' }, chevron: !rated, onTap: rated ? null : () => rateSheet(o, () => page.render()) } : null,
                o.status === 'scheduled' ? { title: 'Cancel scheduled order', destructive: true, onTap: () => cancelOrder(o, () => page.render()) } : null,
                { title: 'Get help with this order', icon: { glyph: 'questionmark.circle', bg: '#30b0c7' }, chevron: true, onTap: () => helpSheet(o) },
                { title: 'View restaurant', icon: { glyph: 'storefront.fill', bg: '#8e8e93' }, chevron: true, onTap: () => page.nav.push(restPage(r)) },
              ].filter(Boolean) }], { cls: 'le-list' }),
              h('div.le-ofoot', 'Order #WG' + String(Math.abs(hashStr(o.id)) % 100000000).padStart(8, '0') + ' · ' + U.fmtDate(o.t, 'medium') + ' ' + U.fmtTime(o.t)),
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
          { text: 'Order arrived late or cold', onTap: () => JC.ui.alert({ title: 'Thanks for Telling Us', message: 'We’ve added ℳ20 of Wanmin Go credit to your account for next time.', buttons: [{ text: 'OK' }] }) },
          { text: 'Contact the courier', onTap: () => callCourier(o) },
          { text: 'Chat with support', onTap: () => JC.ui.alert({ title: 'Support Chat', message: 'All agents are busy. Average wait: 26 minutes. (It’s ' + U.fmtTime(JC.time.now()) + '.)', buttons: [{ text: 'OK' }] }) },
        ] });
      }
      function cancelOrder(o, done) {
        JC.ui.alert({ title: 'Cancel Order?', message: o.status === 'scheduled' ? 'You’ll get a full refund.' : 'The kitchen hasn’t started cooking yet, so you’ll get a full refund.', buttons: [{ text: 'Keep Order', style: 'cancel' }, { text: 'Cancel Order', style: 'destructive' }] }).then((x) => {
          if (x.index !== 1) return;
          stopSim(o.id);
          JC.store.update('orders', o.id, { status: 'cancelled', phase: 'cancelled' });
          JC.bank.credit({ amount: o.total, merchant: 'Wanmin Go', app: 'lotuseats', cat: 'food', card: o.card, note: 'Refund · ' + ((rest(o.rest) || {}).name || ''), sms: 'WANMIN GO' });
          sms('[Wanmin Go] Your order from ' + ((rest(o.rest) || {}).name || 'the restaurant') + ' was cancelled. A refund of ' + M(o.total) + ' is on its way.');
          JC.ui.toast('Order cancelled', { icon: 'xmark' });
          done && done();
        });
      }
      function callCourier(o) {
        const lines = o.status === 'active'
          ? (o.phase === 'delivering' ? ['Wanmin Go courier! I’m on my way, about ' + Math.max(1, remaining(o)) + ' minutes.', 'The stairs on Chihu Rock are a lot. I’ll be there. Promise.'] : o.phase === 'arrived' ? ['I’m outside! Food’s still hot.', 'I’ll wait two minutes.'] : ['Hello? I haven’t picked up the food yet — the kitchen is busy.', 'I’ll call when I’m close.'])
          : ['The number you dialed is a Wanmin Go privacy line and has expired.'];
        MV().fakeCall({ name: o.courier ? o.courier.name : 'Courier', num: 'Wanmin Go privacy line', avatar: o.courier ? { initials: o.courier.name.slice(0, 2), grad: ['#ff8a80', TINT] } : null, glyph: 'scooter', lines });
      }
      function chatCourier(o) {
        const log = [];
        const s = SHEET({ title: o.courier.name, detent: 'large', left: { text: 'Done' }, cls: 'le-chat',
          content: () => [h('div.le-msgs', log.length ? log.map((m) => h('div.le-msg', { class: { me: m.me } }, m.t)) : h('div.le-muted', 'Messages are private and go through Wanmin Go.')),
            h('div.le-qr', ['Please leave it at the door', 'Call me when you’re here', 'Which way are you coming?', 'Thank you!'].map((t) => h('span.tap', { onTap: () => send(t) }, t))),
            h('div.le-msgin', JC.ui.input({ placeholder: 'Message your courier', enterkey: 'send', cls: 'le-chatin', onSubmit: (v, el) => { if (v.trim()) { send(v.trim()); el.value = ''; } } }))] });
        function send(t) {
          log.push({ me: true, t }); s.render(); JC.audio.play('send');
          const reply = /door/i.test(t) ? 'OK 👍 I’ll leave it at the door and send a photo.' : /call/i.test(t) ? 'Sure, I’ll call.' : /which way|where/i.test(t) ? 'Coming up the Chihu Rock stairs. All of them.' : /thank/i.test(t) ? '😊 enjoy!' : 'OK 👍';
          setTimeout(() => { log.push({ me: false, t: reply }); if (!s.closed) s.render(); JC.audio.play('receive'); }, 1300);
        }
      }

      // ═══ TRACKING ═══
      function trackPage(id) {
        let map = null, lastKey = '', dead = false;
        const box = h('div.le-tmap');
        const cardEl = h('div.le-tcard');
        const cleanup = () => { if (dead) return; dead = true; off1(); off2(); if (map) { map.destroy(); map = null; } };
        const page = PAGE({
          title: '', cls: 'le-track', transparentNav: true,
          right: [JC.ui.navBtn({ icon: 'questionmark.circle', label: 'Help', onTap: () => { const o = JC.store.get('orders', id); if (o) helpSheet(o); } })],
          onClose: () => cleanup(),
          content: () => [box, cardEl],
        });
        const draw = (full) => {
          if (dead) return;
          const o = JC.store.get('orders', id);
          if (!o) return;
          if (o.status !== 'active') { if (page.nav && page.nav.top() === page) { cleanup(); page.nav.replace(orderPage(id)); } return; }
          const r = rest(o.rest);
          const P = restPlace(r), Q = R7().place(o.place || 'moonchase');
          const leg = legFor(r, Q ? Q.id : o.to);
          if (!map) {
            map = MV().create(box, { style: 'explore', user: o.to === 'player-home', center: P ? [P.x, P.y] : null, zoom: 60, pois: true, poiLabelMinZ: 140, cls: 'le-trackmap' });
            if (P) map.addPin('rest', { kind: 'dot', at: [P.x, P.y], color: TINT, anchor: 'center', label: r.name });
            if (Q && o.to !== 'player-home') map.addPin('dest', { kind: 'dot', at: [Q.x, Q.y], color: '#1c1c1e', square: true, anchor: 'center', label: o.friend ? o.toLabel : (Q.short || Q.name) });
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
          if (full || key !== lastKey) { lastKey = key; renderCard(o, r); }
          else {
            const sub = cardEl.querySelector('.le-tsub'); if (sub) sub.textContent = tsub(o);
            const msg = cardEl.querySelector('.le-tmsg'); if (msg) msg.textContent = phaseSub(o);
            const bar = cardEl.querySelector('.le-step.cur i'); if (bar && sm) bar.style.width = Math.round((sm.k || 0) * 100) + '%';
          }
        };
        const tsub = (o) => { const left = remaining(o); return phaseTitle(o) + (o.phase === 'arrived' ? '' : ' · ' + (left <= 1 ? 'any minute' : left + ' min')); };
        function renderCard(o, r) {
          const idx = PHASES.indexOf(o.phase);
          cardEl.innerHTML = '';
          cardEl.append(
            h('div.le-tgrab'),
            h('div.le-teta', o.phase === 'arrived' ? (o.friend ? 'Handing it to ' + o.toLabel : 'Your courier is here') : 'Arriving at ' + U.fmtTime(arriveAt(o))),
            h('div.le-tsub', tsub(o)),
            h('div.le-steps', [0, 1, 2, 3].map((i) => h('div.le-step', { class: { done: i < Math.min(3, idx) || idx >= 4, cur: i === Math.min(3, idx) && idx < 4 } }, h('i', i === Math.min(3, idx) && sims[o.id] ? { style: { width: Math.round((sims[o.id].k || 0) * 100) + '%' } } : null)))),
            h('div.le-tmsg', phaseSub(o)),
            idx >= 2 ? h('div.le-rider',
              JC.ui.avatar({ initials: o.courier.name.slice(0, 2), grad: ['#ff8a80', TINT] }, 46),
              h('div.le-rider-m', h('b', o.courier.name), h('span', '★ ' + o.courier.rating.toFixed(2) + ' · ' + o.courier.vehicle)),
              h('div.le-rbtn', { onTap: () => chatCourier(o) }, JC.icon('message.fill', { size: 19 })),
              h('div.le-rbtn', { onTap: () => callCourier(o) }, JC.icon('phone.fill', { size: 19 }))) : h('div.le-tresto', h('div.le-tresto-img', heroEl(r)), h('div', h('b', r.name), h('span', idx === 0 ? 'Confirming the order…' : 'Cooking · ' + qtyOf(o) + ' item' + (qtyOf(o) === 1 ? '' : 's')))),
            JC.ui.list([{ rows: [
              o.friend ? { avatar: o.for === 'ops' ? { emoji: '🐟', grad: ['#a5d8ff', '#1c4f82'] } : o.for, avatarSize: 30, title: 'Gift for ' + o.toLabel, subtitle: o.drop + (o.note ? ' · “' + o.note + '”' : '') }
                : { icon: { glyph: (D().ADDRS.find((a) => a.id === o.to) || {}).icon || 'mappin.fill', bg: TINT }, title: o.toLabel, subtitle: o.drop + (o.note ? ' · “' + o.note + '”' : '') },
              { icon: { glyph: 'bag.fill', bg: '#8e8e93' }, title: o.items.map((x) => x.qty + '× ' + x.name).join(', '), subtitle: M(o.total) + ' · ' + cardLabel(), chevron: true, onTap: () => page.nav.push(orderPage(id)) },
            ] }], { cls: 'le-list' }),
            idx <= 1 ? h('div.le-tcancel.tap', { onTap: () => cancelOrder(o, () => draw(true)) }, 'Cancel order') : h('div.le-tcancel.muted', 'Too late to cancel — the food is on its way'));
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
              h('div.le-prof', JC.ui.avatar('me', 64), h('div', h('b', 'Childe'), h('span', n + ' orders · Wanmin Go Gold since 2026'))),
              h('div.le-quick', [['Saved', 'heart.fill', () => page.nav.push(favPage())], ['Wallet', 'creditcard.fill', () => page.nav.push(payPage())], ['Stamps', 'star.fill', () => stampSheet()]].map(([t, g, fn]) => h('div.le-q', { onTap: fn }, JC.icon(g, { size: 22 }), h('span', t)))),
              JC.ui.list([{ rows: [
                { icon: { glyph: 'mappin.fill', bg: TINT }, title: 'Delivery addresses', detail: String(D().ADDRS.length), chevron: true, onTap: () => destSheet(() => page.render()) },
                { icon: { glyph: 'creditcard.fill', bg: '#1c2b45' }, title: 'Payment', detail: (JC.bank.frozen() ? 'Frozen · ' : '') + '•• ' + card().last, chevron: true, onTap: () => page.nav.push(payPage()) },
                { icon: { glyph: 'tag.fill', bg: '#ff9f0a' }, title: 'Promotions', detail: S.promo || '', chevron: true, onTap: () => JC.ui.alert({ title: 'Your Promotions', message: '• Stamp card: ' + Math.min(10, S.stamps) + ' of 10 at Wanmin Restaurant\n• XIANGLING: 10% off Wanmin Restaurant\n• NIGHTSHIFT: free delivery after 22:00\n• NORTHWIND: 15% off Northern Kitchen' + (S.promo ? '\n\nApplied: ' + S.promo : ''), buttons: [{ text: 'Enter a Code', style: 'default', onTap: () => promoAlert(() => page.render()) }, { text: 'OK', style: 'cancel' }] }) },
                { icon: { glyph: 'gift.fill', bg: '#af52de' }, title: 'Send a meal to a friend', chevron: true, onTap: () => destSheet(() => page.render(), true) },
                { icon: { glyph: 'briefcase.fill', bg: '#1c4f82' }, title: 'Business account', detail: 'Northland Bank', chevron: true, onTap: () => JC.ui.alert({ title: 'Northland Bank Group', message: 'Business orders are billed to Special Collections (Liyue) and reviewed monthly by the Office of the Ninth. Personal orders are not. (Pantalone reads every line.)', buttons: [{ text: 'OK' }] }) },
              ] }, { rows: [
                { icon: { glyph: 'bell.fill', bg: '#ff3b30' }, title: 'Notifications', chevron: true, onTap: () => notifSheet() },
                { icon: { glyph: 'questionmark.circle', bg: '#30b0c7' }, title: 'Help', chevron: true, onTap: () => helpCenter() },
                { icon: { glyph: 'lock.fill', bg: '#8e8e93' }, title: 'Privacy', chevron: true, onTap: () => JC.ui.alert({ title: 'Privacy', message: 'Couriers see your first name and the drop-off note. Gift orders can hide your name completely.', buttons: [{ text: 'OK' }] }) },
                { icon: { glyph: 'info.circle', bg: '#5ac8fa' }, title: 'About Wanmin Go', detail: '3.11.0', chevron: true, onTap: () => JC.ui.alert({ title: 'Wanmin Go 3.11.0', message: 'Started as one wok in Chihu Rock. Now delivering all over Liyue Harbor. Guoba is our chief taste officer.', buttons: [{ text: 'OK' }] }) },
              ] }, { rows: [{ title: 'Sign Out', destructive: true, center: true, onTap: () => JC.ui.alert({ title: 'Sign Out?', message: 'Enter the account password to sign out.', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive' }] }).then((x) => { if (x.index === 1) setTimeout(() => JC.ui.alert({ title: 'Incorrect Password', message: 'That’s not this account’s Wanmin Go password.', buttons: [{ text: 'OK' }] }), 400); }) }] }], { cls: 'le-list' }),
            ];
          },
        });
      }
      function favPage() {
        return PAGE({ title: 'Saved', cls: 'le-favp', content: () => { const f = st().favs.map(rest).filter(Boolean); return f.length ? [h('div.le-rlist', f.map((r) => restCard(r)))] : [JC.ui.empty({ icon: 'heart', title: 'Nothing saved yet', text: 'Tap the heart on a restaurant to save it.' })]; } });
      }
      function payPage() {
        return PAGE({ title: 'Payment', bg: 'grouped', content: () => [JC.ui.list([
          { header: 'Wallet Pay', footer: 'Payments are confirmed with Face ID or the iPhone passcode.', rows: [{ leading: h('div.le-cardic'), title: card().name, subtitle: '•• ' + card().last + ' · Northland Bank', detail: JC.bank.frozen() ? 'Frozen' : null, check: true }, { title: 'Open Wallet', tinted: true, onTap: () => JC.os.open('wallet') }, { title: 'Manage card in Northland', tinted: true, onTap: () => JC.os.open('northland') }] },
          { header: 'Wanmin Go credit', rows: [{ title: 'Balance', detail: M(0) }] }], { cls: 'le-list' })] });
      }
      function notifSheet() {
        const S = st();
        SHEET({ title: 'Notifications', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [{ title: 'Order updates', subtitle: 'Courier and delivery status', toggle: { on: S.notif.orders, onChange: (v) => { S.notif.orders = v; save(); } } }, { title: 'Offers & promotions', toggle: { on: S.notif.promos, onChange: (v) => { S.notif.promos = v; save(); } } }] }], { cls: 'le-list' })] });
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
        if (it.to || it.for) { st().dest = it.for ? { kind: 'friend', cid: it.for } : { kind: 'place', id: it.to }; save(); refreshTop(['home']); return; }
        if (it.search) {
          tabs.select('search');
          const pg = tabs.nav('search').top();
          if (pg && pg.searchEl) { const s = pg.searchEl.querySelector('.search'); if (s && s.setValue) s.setValue(it.search); if (s && s.input) s.input.dispatchEvent(new Event('input')); }
        }
      }
      JC.store.all('orders').filter((o) => o.status === 'active').forEach((o) => startSim(o.id));
      setTimeout(() => handle(intent0), 40);
      return {
        intent: handle,
        show() { refreshTop(['home']); badge(); },
        back() { const ov = win.overlays && win.overlays.querySelectorAll('.ctx-back, .pmenu-back, .sheet-back'); if (ov && ov.length) { ov[ov.length - 1].click(); return true; } const n = tabs.nav(); if (n && n.depth() > 1) { n.pop(); return true; } return false; },
        destroy() { offs.forEach((f) => { try { f(); } catch (e) { /* ignore */ } }); Object.keys(sims).forEach(stopSim); },
      };
    },
  });
})();
