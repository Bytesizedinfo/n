/* Maps — iOS 26 Maps: full-screen map, glass search sheet (peek / half / full), favorites, recents,
   guides, visited places, place cards, directions (drive / walk / transit / cycle / ride), turn-by-turn
   navigation with a Dynamic Island activity, map styles, Look Around. Map engine: JC.mapview. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;

  // ── seeds ────────────────────────────────────────────────────────────────
  JC.store.seed('maps_favs', [
    { id: 'home', kind: 'home', place: 'lp-residence', label: 'Home' },
    { id: 'work', kind: 'work', place: 'lotus-pier', label: 'Work' },
    { id: 'fav_aling', kind: 'person', place: 'koi-residences', label: 'A-Ling', contact: 'jl' },
    { id: 'fav_tea', kind: 'star', place: 'hanshi', label: 'Tea' },
  ]);
  JC.store.seed('maps_recents', [
    { id: 'rc1', kind: 'place', place: 'koi-tower', t: '+0 18:31', note: 'Directions from Golden Peony Hotel' },
    { id: 'rc2', kind: 'place', place: 'lanling-intl', t: '-1 15:34' },
    { id: 'rc3', kind: 'place', place: 'golden-peony', t: '-1 12:05', note: 'Directions from Lotus Pier' },
    { id: 'rc4', kind: 'place', place: 'hanshi', t: '-2 22:52' },
    { id: 'rc5', kind: 'search', q: 'lotus seed paste cake', t: '-3 21:16' },
    { id: 'rc6', kind: 'place', place: 'pet-kingdom', t: '-6 18:11' },
    { id: 'rc7', kind: 'place', place: 'silver-lotus', t: '-9 10:40' },
  ]);
  JC.store.seed('maps_guides', [
    { id: 'g_aling', title: 'A-Ling', icon: 'graduationcap.fill', color: '#e8a400', places: ['lanling-intl', 'koi-residences', 'lanling-archery', 'peony-bakery'], notes: { 'peony-bakery': 'Lotus seed paste. Order 48 h ahead. Sunday.', 'lanling-archery': 'Bow restring — ask for Coach Ma.' } },
    { id: 'g_fairy', title: 'Fairy', icon: 'pawprint.fill', color: '#3a3a3c', places: ['pet-kingdom', 'lanling-vet', 'peony-park'], notes: { 'pet-kingdom': 'Giant breed, 20 kg. Platinum Paw card in Wallet.', 'lanling-vet': 'Dr. Fang. Do not mention the sock incident.' } },
    { id: 'g_gusu', title: 'Gusu', icon: 'leaf.fill', color: '#2fa36b', places: ['laoma-hotpot', 'cr-tea-shop', 'auntie-lu', 'gusu-teahouse'], notes: { 'laoma-hotpot': 'Summer ’07 — after the exams. Reunion Apr 2024 (I paid).', 'cr-tea-shop': 'White peony. The good tin.', 'auntie-lu': 'Lotus root & pork rib. Large. Delivers to Cloud Recesses.' } },
  ]);
  JC.store.seed('maps_visits', [
    { id: 'v1', place: 'golden-peony', t: '-1 15:20', end: '+0 23:36', note: 'Hotel · since Thursday' },
    { id: 'v2', place: 'koi-tower', t: '+0 18:44', end: '+0 23:15' },
    { id: 'v3', place: 'lanling-intl', t: '-1 15:52', end: '-1 17:10' },
    { id: 'v4', place: 'pet-kingdom', t: '-6 18:20', end: '-6 18:48' },
    { id: 'v5', place: 'ymj-warehouse', t: '-2 13:40', end: '-2 14:30' },
    { id: 'v6', place: 'lotus-pier', t: '-1 07:30', end: '-1 11:40', note: 'Work' },
    { id: 'v7', place: 'silver-lotus', t: '-9 10:55', end: '-9 11:25' },
    { id: 'v8', place: 'yiling-cemetery', t: '2026-04-05 09:10', end: '2026-04-05 09:52' },
    { id: 'v9', place: 'laoma-hotpot', t: '2024-04-13 18:40', end: '2024-04-13 22:41' },
  ]);

  const REVIEWS = {
    'laoma-hotpot': [['huaisang_fans', 5, 'The best hotpot of my youth!!! We came here after the summer exams in 2007 and again for our reunion hehe~ 🪭'], ['mianmian', 5, 'Loud, red, perfect. Someone always pays for everyone and pretends he didn’t.'], ['gusu_local', 4, 'Mala is properly numbing. The lamb is hand-cut. Expect a queue after 9 PM.']],
    'koi-tower': [['lanling_walks', 5, 'The gold at sunset is ridiculous. The koi pond in the forecourt is the best free attraction in Lanling.'], ['koi_enjoyer', 4, 'Old Gold (the big koi) looked at me with contempt. 10/10.'], ['gala_guest', 5, 'Charity gala was beautiful. The balcony on 52 has the best moon view in the city.']],
    'golden-peony': [['travel_with_tea', 5, 'Silk Moon rooftop bar has the best view of the river. Room service at 2 AM was perfect.'], ['business_trip', 5, 'Staff remembered my name and my tea. Slightly unsettling, very good.'], ['petparent', 4, 'They allowed our dog. Our very large dog. Bless them.']],
    'cloud-recesses': [['mist_hiker', 5, 'Breathtaking at dawn. I was told off for walking too fast.'], ['student_2019', 3, 'Rule 1,882: no fun. Rule 1,883: see rule 1,882.'], ['tea_tourist', 5, 'Buy the white peony at the gate shop. Thank me later.']],
    'pet-kingdom': [['fairy_fan', 5, 'Saw the biggest black dog of my life here. She ate a sample bag whole.'], ['catperson', 4, 'Good selection. Self-service dog wash is great.']],
    'radish-farm': [['radish_reviewer', 5, 'The owner gave a 20-minute speech about radishes. Worth it. The radish cake is incredible.'], ['lanling_foodie', 5, 'Very spicy chili oil. VERY. Spicy.'], ['someone', 4, 'Owner screamed when my dog arrived. Radishes excellent though.']],
    'lotus-pier': [['lake_photos', 5, 'The lotus gardens in July are unreal. Security guard (Mr. Huang?) gave us tea.'], ['history_buff', 5, 'Rebuilt beautifully after 2008. The nine-petal gate is stunning.']],
    'yunmeng-lake': [['kite_dad', 5, 'Best kite wind anywhere. Bring two kites; one will end up in the lotus.'], ['sunrise_runner', 5, 'Sunrise over the lake from the pavilion — no words.']],
    'guanyin-temple': [['quiet_mind', 5, 'Very peaceful. The bell at dusk carries across the whole lake.']],
    'jinxing-police': [['honest_citizen', 5, 'Handed in a wallet I found at 2 AM. The officer called the owner right away. Easy.'], ['lanling_res', 4, 'Helpful lost & found desk, open all night.']],
    'night-market': [['snackhunter', 5, 'The radish pop-up this weekend is run by a very loud man who teaches flute. Get the radish cake.'], ['skewer_king', 4, 'Lamb skewers at stall 41. Trust me.']],
  };
  // ── prefs (persisted in the game state) ──
  function prefs() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    d.apps.maps = Object.assign({ style: 'explore', traffic: false, labels: true, avoidHwy: false, avoidTolls: false, voice: 'normal', pois: true }, d.apps.maps || {});
    return d.apps.maps;
  }
  function setPref(k, v) { prefs()[k] = v; JC.state.save(); }

  const xBtn = (glyph, onTap, label, cls) => h('button.maps-xbtn', { class: cls, onTap, attrs: { 'aria-label': label || glyph } }, JC.icon(glyph, { size: 15, weight: 2.6 }));
  const catIcon = (cat, size) => {
    const c = MV().cat(cat);
    return h('div.maps-caticon', { style: { background: c.color, width: (size || 32) + 'px', height: (size || 32) + 'px' } }, JC.icon(c.glyph, { size: Math.round((size || 32) * 0.55), weight: 2.2 }));
  };

  JC.app({
    id: 'maps',
    name: 'Maps',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-maps');
      const P = prefs();
      const map = MV().create(body, { style: P.style, traffic: P.traffic || P.style === 'driving', zoom: 46, center: MV().HOME, userTap: () => openMe(), cls: 'maps-map' });
      body._mv = map;
      map.setLabels(P.labels !== false);
      map.setPois(P.pois !== false);
      let follow = 0; // 0 none, 1 follow, 2 heading
      let navState = null;

      // ── floating controls ──
      const compass = h('div.mv-compass.hide', { onTap: () => map.resetNorth() }, h('span.mv-compass-n', 'N'), h('div.mv-compass-needle'));
      const locIcon = h('span.maps-locicon', JC.icon('location', { size: 21, weight: 2 }));
      const btnLoc = h('div.mv-ctrl.blue', { onTap: () => cycleFollow(), attrs: { 'aria-label': 'Current Location' } }, locIcon);
      const btnStyle = h('div.mv-ctrl', { onTap: () => openStyles(), attrs: { 'aria-label': 'Map Modes' } }, JC.icon('map', { size: 21, weight: 2 }));
      const lookBtn = h('div.mv-ctrl-group.maps-look.hide', h('div.mv-ctrl', { onTap: () => look(), attrs: { 'aria-label': 'Look Around' } }, JC.icon('binoculars.fill', { size: 21 })));
      const zoomGrp = h('div.mv-ctrl-group.maps-zoomgrp',
        h('div.mv-ctrl', { onTap: () => map.zoomIn(), attrs: { 'aria-label': 'Zoom In' } }, JC.icon('plus', { size: 19, weight: 2.4 })),
        h('div.mv-ctrl', { onTap: () => map.zoomOut(), attrs: { 'aria-label': 'Zoom Out' } }, JC.icon('minus', { size: 19, weight: 2.4 })));
      const ctrls = h('div.mv-ctrls.maps-ctrls', h('div.mv-ctrl-group', btnStyle, btnLoc), lookBtn, compass, zoomGrp);
      const wx = h('div.maps-wx', { onTap: () => JC.os.open('weather', { city: MV().cityOf(map.view().cx, map.view().cy) }) }, JC.icon('cloud.fill', { size: 15 }), h('span', '14°'), h('span.maps-aqi', 'AQI 41'));
      body.append(ctrls, wx);

      map.on('move', (v) => {
        compass.classList.toggle('hide', Math.abs(v.b) < 0.02 && !navState);
        compass.querySelector('.mv-compass-needle').style.transform = `rotate(${(-v.b * 180) / Math.PI}deg)`;
        compass.querySelector('.mv-compass-n').style.transform = `translateX(-50%) rotate(0deg)`;
        lookBtn.classList.toggle('hide', !(v.z > 55 && inCity(v.cx, v.cy)) || !!navState);
      });
      map.on('drag', () => { if (follow && !navState) setFollow(0); });
      map.on('place', (id) => { if (!navState) openPlace(id); });
      map.on('longpress', (ev) => { if (!navState) dropPin(ev.world); });
      map.on('tap', () => {
        if (navState) return;
        const c = top();
        if (c && (c.kind === 'place' || c.kind === 'pin')) back();
      });
      function inCity(x, y) { const c = MV().cityOf(x, y); const pl = MV().places().find((p) => p.city === c && Math.hypot(p.x - x, p.y - y) < 12); return !!pl; }

      // ── sheet ──
      const headSlot = h('div.maps-headslot');
      const sh = MV().sheet(body, {
        cls: 'maps-sheet', peek: 100, half: 0.46, initial: 'half',
        onChange: (d, vis) => onSheet(d, vis),
        onDrag: (vis) => { ctrls.style.transform = vis > (body.offsetHeight * 0.62) ? 'translateY(-8px)' : ''; ctrls.style.opacity = vis > body.offsetHeight * 0.7 ? '0' : ''; wx.style.opacity = vis > body.offsetHeight * 0.7 ? '0' : ''; },
      });
      sh.head.appendChild(headSlot);
      function onSheet(d, vis) {
        const H = body.offsetHeight || 874;
        const full = d === 'full';
        ctrls.style.opacity = full ? '0' : '';
        ctrls.style.pointerEvents = full ? 'none' : '';
        wx.style.opacity = full ? '0' : '';
        if (!full) map.setPadding({ bottom: Math.min(vis, H * 0.55), top: 50, right: 52 });
      }

      // ── card stack ──
      const stack = [];
      const top = () => stack[stack.length - 1];
      function show(card, o) {
        o = o || {};
        const prev = top();
        if (prev && prev.leave && !o.keepPrev) prev.leave();
        if (o.replace) stack.pop();
        stack.push(card);
        render();
        if (card.detent) sh.set(card.detent);
        if (card.enter) card.enter();
      }
      function back() {
        if (stack.length < 2) return false;
        const c = stack.pop();
        c.leave && c.leave();
        render();
        const t = top();
        if (t && t.restore) t.restore();
        if (t && t.detent && !t.keepDetent) sh.set(t.detent === 'full' ? 'half' : t.detent);
        return true;
      }
      function home() { while (stack.length > 1) { const c = stack.pop(); c.leave && c.leave(); } render(); sh.set('half'); }
      function render() {
        const c = top();
        headSlot.innerHTML = '';
        sh.body.innerHTML = '';
        if (!c) return;
        const hd = c.head && c.head();
        if (hd) headSlot.appendChild(hd);
        const bd = c.body && c.body();
        (Array.isArray(bd) ? bd : [bd]).forEach((n) => n && sh.body.appendChild(n));
        sh.body.scrollTop = 0;
      }
      function refresh() {
        const c = top();
        if (!c) return;
        const st = sh.body.scrollTop;
        sh.body.innerHTML = '';
        const bd = c.body && c.body();
        (Array.isArray(bd) ? bd : [bd]).forEach((n) => n && sh.body.appendChild(n));
        sh.body.scrollTop = st;
      }

      // ═══ HOME CARD ═══
      function searchRow(o) {
        o = o || {};
        const input = JC.ui.input({ placeholder: 'Search Maps', enterkey: 'search', cap: 'none', value: o.value || '', onInput: (v) => o.onInput && o.onInput(v), onSubmit: (v) => o.onSubmit && o.onSubmit(v) });
        input.classList.add('maps-search-input');
        const clear = h('div.maps-search-clear', { hidden: !o.value, onTap: () => { input.value = ''; clear.hidden = true; o.onInput && o.onInput(''); input.focus(); } }, JC.icon('xmark.circle.fill', { size: 17 }));
        input.addEventListener('input', () => { clear.hidden = !input.value; });
        const field = h('div.maps-search', JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), input, clear,
          h('div.maps-search-mic', { onTap: () => JC.ui.toast('Siri can’t recognise your voice. (It isn’t his.)', { icon: 'mic.slash.fill' }) }, JC.icon('mic.fill', { size: 18 })));
        if (o.onFocus) input.addEventListener('focus', o.onFocus);
        const right = o.cancel
          ? h('div.maps-cancel', { onTap: () => { input.blur(); o.cancel(); } }, 'Cancel')
          : h('div.maps-avatar', { onTap: () => openAccount() }, JC.ui.avatar('me', 38));
        const row = h('div.maps-searchrow', field, right);
        row.input = input;
        return row;
      }
      const homeCard = {
        kind: 'home',
        detent: 'half',
        head: () => h('div.maps-searchrow',
          h('div.maps-search.fake', { onTap: () => show(searchCard(''), { keepPrev: true }) }, JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), h('span.maps-search-ph', 'Search Maps'),
            h('div.maps-search-mic', { onTap: (e) => { e.stopPropagation(); JC.ui.toast('Siri can’t recognise your voice. (It isn’t his.)', { icon: 'mic.slash.fill' }); } }, JC.icon('mic.fill', { size: 18 }))),
          h('div.maps-avatar', { onTap: () => openAccount() }, JC.ui.avatar('me', 38))),
        body: () => {
          const favs = JC.store.all('maps_favs');
          const recents = JC.store.all('maps_recents').slice().sort((a, b) => b.t - a.t);
          const guides = JC.store.all('maps_guides');
          const favEl = h('div.maps-favs.hscroll',
            favs.map((f) => {
              const p = MV().place(f.place);
              const km = p ? MV().fromUser(p) : 0;
              const ic = f.kind === 'person' && f.contact ? JC.ui.avatar(f.contact, 58) : h('div.maps-favic', { class: 'k-' + f.kind }, JC.icon(f.kind === 'home' ? 'house.fill' : f.kind === 'work' ? 'briefcase.fill' : f.kind === 'star' ? 'star.fill' : 'mappin', { size: 26 }));
              const el = h('div.maps-fav', { onTap: () => openPlace(f.place, { fav: f }) }, h('div.maps-favwrap', ic), h('div.maps-favname', f.label), h('div.maps-favsub', p ? MV().fmtDist(km) : ''));
              JC.ui.contextMenu(el, () => ({ items: [
                { text: 'Directions', icon: 'arrow.triangle.turn.up.right.diamond.fill', onTap: () => directions(f.place) },
                { text: 'Share', icon: 'square.and.arrow.up', onTap: () => sharePlace(f.place) },
                { text: 'Rename', icon: 'pencil', onTap: () => renameFav(f) },
                '-',
                { text: 'Remove from Favorites', icon: 'trash', destructive: true, onTap: () => { if (f.id === 'home' || f.id === 'work') JC.ui.alert({ title: 'Can’t Remove ' + f.label, message: f.label + ' comes from Jiang Cheng’s contact card. Edit it in Contacts.', buttons: [{ text: 'OK' }] }); else { JC.store.remove('maps_favs', f.id); refresh(); } } },
              ] }));
              return el;
            }),
            h('div.maps-fav', { onTap: () => show(searchCard('', { mode: 'fav' }), { keepPrev: true }) }, h('div.maps-favwrap', h('div.maps-favic.k-add', JC.icon('plus', { size: 26, weight: 2.4 }))), h('div.maps-favname', 'Add'), h('div.maps-favsub', '')));
          const recentRows = recents.slice(0, 5).map((r) => recentRow(r));
          return [
            h('div.maps-sec', h('div.maps-sec-h', h('span', 'Places'), h('span.maps-more', { onTap: () => show(libraryCard()) }, 'More')), favEl),
            h('div.maps-sec', h('div.maps-sec-h', h('span', 'Recents'), h('span.maps-more', { onTap: () => show(recentsCard()) }, 'More')), recentRows.length ? JC.ui.list([{ rows: recentRows }], { cls: 'maps-list' }) : h('div.maps-empty', 'No Recents')),
            h('div.maps-sec', h('div.maps-sec-h', h('span', 'My Guides'), h('span.maps-more', { onTap: () => newGuide() }, 'New')),
              h('div.maps-guides.hscroll', guides.map((g) => guideTile(g)), h('div.maps-guide.add', { onTap: () => newGuide() }, h('div.maps-guide-art', JC.icon('plus', { size: 30, weight: 2 })), h('div.maps-guide-t', 'New Guide'), h('div.maps-guide-s', 'Collect places')))),
            h('div.maps-sec', h('div.maps-sec-h', h('span', 'Guides We Love')), h('div.maps-guides.hscroll', EDITORIAL.map((g) => guideTile(g, true)))),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'clock.fill', bg: 'var(--purple)' }, title: 'Visited Places', subtitle: JC.store.all('maps_visits').length + ' places · On this iPhone', chevron: true, onTap: () => show(visitsCard()) },
              { icon: { glyph: 'square.and.arrow.down', bg: 'var(--green)' }, title: 'Offline Maps', subtitle: 'Yunmeng & Lanling · 1.2 GB', chevron: true, onTap: () => offlineMaps() },
              { icon: { glyph: 'exclamationmark.bubble', bg: 'var(--orange)' }, title: 'Report an Issue', chevron: true, onTap: () => reportIssue() },
            ] }], { cls: 'maps-list' }),
            h('div.maps-terms', h('span.tap', { onTap: () => JC.ui.alert({ title: 'Terms & Conditions', message: 'Map data © 2026 Wavemaps and its licensors. Look Around imagery is captured from public roads. Lotus fields are not shown to scale.', buttons: [{ text: 'OK' }] }) }, 'Terms & Conditions'), h('span', ' · '), h('span.tap', { onTap: () => JC.ui.alert({ title: 'Privacy', message: 'Maps is designed to protect your privacy. Your searches and places stay on this iPhone — which, to be clear, is not yours.', buttons: [{ text: 'OK' }] }) }, 'Privacy')),
          ];
        },
      };
      const EDITORIAL = [
        { id: 'ed_night', title: 'Lanling After Dark', icon: 'moon.fill', color: '#3a3a9c', places: ['night-market', 'golden-dumpling', 'night-owl-ll', 'koi-cafe', 'lotus-root-kitchen'], by: 'Lanling Daily', notes: {} },
        { id: 'ed_mist', title: 'Mist & Tea in Gusu', icon: 'cup.and.saucer.fill', color: '#2f7d5b', places: ['cloud-recesses', 'cr-tea-shop', 'gusu-teahouse', 'auntie-lu', 'laoma-hotpot'], by: 'Gusu Tourism', notes: {} },
        { id: 'ed_lake', title: 'Lotus Season, Yunmeng', icon: 'lotus.fill', color: '#c2456e', places: ['lotus-pier', 'yunmeng-lake', 'guanyin-temple', 'night-owl'], by: 'Wavemaps', notes: {} },
      ];
      function guideTile(g, editorial) {
        const p0 = MV().place(g.places[0]);
        const art = p0 && p0.photos && p0.photos[0];
        return h('div.maps-guide', { onTap: () => show(guideCard(g, editorial)) },
          h('div.maps-guide-art', { style: { background: g.color } }, art ? JC.art.el(art, { cls: 'maps-guide-img' }) : null, h('div.maps-guide-badge', JC.icon(g.icon || 'star.fill', { size: 16 }))),
          h('div.maps-guide-t', g.title), h('div.maps-guide-s', (editorial ? g.by + ' · ' : '') + U.plural(g.places.length, 'place')));
      }
      function recentRow(r) {
        if (r.kind === 'search') return { leading: h('div.maps-recic', JC.icon('magnifyingglass', { size: 16, weight: 2.4 })), title: r.q, subtitle: 'Search · ' + U.fmtRelative(r.t), onTap: () => show(searchCard(r.q), { keepPrev: true }), swipe: [{ text: 'Remove', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('maps_recents', r.id); refresh(); } }] };
        const p = MV().place(r.place);
        if (!p) return null;
        return { leading: catIcon(p.cat, 34), title: p.short || p.name, subtitle: (r.note ? r.note : p.city + ' · ' + MV().fmtDist(MV().fromUser(p))), detail: U.fmtRelative(r.t), onTap: () => openPlace(p.id), swipe: [{ text: 'Remove', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('maps_recents', r.id); refresh(); } }] };
      }
      function addRecent(o) {
        const all = JC.store.all('maps_recents');
        const dup = all.find((r) => (o.place && r.place === o.place) || (o.q && r.q === o.q));
        if (dup) JC.store.remove('maps_recents', dup.id);
        JC.store.add('maps_recents', Object.assign({ t: JC.time.now() }, o), { front: true });
      }

      // ═══ SEARCH ═══
      function searchCard(q0, so) {
        so = so || {};
        let q = q0 || '';
        let row;
        const card = {
          kind: 'search',
          detent: 'full',
          head: () => {
            row = searchRow({ value: q, cancel: () => back(), onInput: (v) => { q = v; refresh(); }, onSubmit: (v) => { if (v.trim()) { addRecent({ kind: 'search', q: v.trim() }); showResults(v.trim(), so); } } });
            setTimeout(() => { if (top() === card) row.input.focus(); }, 380);
            return row;
          },
          body: () => {
            if (!q.trim()) {
              const cats = [['Restaurants', 'fork.knife', '#ff8a00', 'food'], ['Coffee & Tea', 'cup.and.saucer.fill', '#b07a45', 'cafe tea'], ['Hotels', 'bed.double.fill', '#a95ce0', 'hotel'], ['Parks', 'tree.fill', '#2fb350', 'park'], ['Transit', 'tram.fill', '#147efb', 'transit'], ['Pets', 'pawprint.fill', '#ff9f0a', 'pet'], ['Shopping', 'bag.fill', '#f2a600', 'shopping'], ['Police', 'shield.fill', '#4f6d8f', 'police']];
              const recents = JC.store.all('maps_recents').slice().sort((a, b) => b.t - a.t).slice(0, 6).map(recentRow).filter(Boolean);
              return [
                so.mode === 'fav' ? h('div.maps-hint', 'Choose a place to add to your Places.') : so.mode === 'stop' ? h('div.maps-hint', 'Choose a stop to add to your route.') : so.mode === 'guide' ? h('div.maps-hint', 'Choose a place to add to “' + so.guide.title + '”.') : null,
                so.mode === 'from' ? JC.ui.list([{ rows: [{ leading: h('div.maps-recic.blue', JC.icon('location.fill', { size: 16 })), title: 'My Location', subtitle: 'Jinxing Road 27, Lanling', onTap: () => { back(); so.onPick(MV().userPlace()); } }] }], { cls: 'maps-list' }) : null,
                h('div.maps-sec', h('div.maps-sec-h', h('span', 'Find Nearby')), h('div.maps-cats', cats.map(([t, g, c, k]) => h('div.maps-cat', { onTap: () => showCategory(t, k.split(' '), so) }, h('div.maps-cat-ic', { style: { background: c } }, JC.icon(g, { size: 20, weight: 2.2 })), h('span', t))))),
                recents.length ? h('div.maps-sec', h('div.maps-sec-h', h('span', 'Recently Viewed')), JC.ui.list([{ rows: recents }], { cls: 'maps-list' })) : null,
              ];
            }
            const res = MV().search(q, { includeHome: true }).slice(0, 12);
            const rows = res.map((p) => placeRow(p, () => pickFromSearch(p, so)));
            const sugg = ['restaurants', 'hotels', 'coffee', 'tea', 'parks'].filter((s) => s.startsWith(q.toLowerCase()) && s !== q.toLowerCase()).map((s) => ({ leading: h('div.maps-recic', JC.icon('magnifyingglass', { size: 16, weight: 2.4 })), title: s[0].toUpperCase() + s.slice(1) + ' Nearby', onTap: () => showCategory(s[0].toUpperCase() + s.slice(1), [{ restaurants: 'food', hotels: 'hotel', coffee: 'cafe', tea: 'tea', parks: 'park' }[s]], so) }));
            if (!rows.length && !sugg.length) return h('div.maps-noresults', JC.icon('magnifyingglass', { size: 36, weight: 1.6 }), h('div.maps-nr-t', 'No Results'), h('div.maps-nr-s', 'Wavemaps couldn’t find “' + q + '” in Yunmeng, Lanling, Gusu, Qinghe or Yiling.'), h('div.maps-nr-a.tap', { onTap: () => JC.os.open('safari', { search: q }) }, 'Search the web for “' + q + '”'));
            return JC.ui.list([{ rows: sugg.concat(rows) }], { cls: 'maps-list' });
          },
        };
        return card;
      }
      function placeRow(p, onTap, extra) {
        const hi = MV().hoursInfo(p);
        return Object.assign({ leading: catIcon(p.cat, 34), title: p.short || p.name, subtitle: [p.sub || MV().cat(p.cat).label, MV().fmtDist(MV().fromUser(p)), p.city].filter(Boolean).join(' · '), subtitle2: hi ? hi.short + (p.rating ? '  ·  ★ ' + p.rating.toFixed(1) : '') : null, onTap }, extra || {});
      }
      function pickFromSearch(p, so) {
        JC.kb.hide();
        if (so.mode === 'fav') {
          const all = JC.store.all('maps_favs');
          if (all.some((f) => f.place === p.id)) JC.ui.toast('Already in Places', { icon: 'star.fill' });
          else { JC.store.add('maps_favs', { kind: 'star', place: p.id, label: p.short || p.name }); JC.ui.toast('Added to Places', { icon: 'star.fill' }); }
          home();
          return;
        }
        if (so.mode === 'stop' && so.onPick) { back(); so.onPick(p); return; }
        if (so.mode === 'guide' && so.guide) { addToGuide(so.guide, p.id); back(); return; }
        if (so.mode === 'from' && so.onPick) { back(); so.onPick(p); return; }
        addRecent({ kind: 'place', place: p.id });
        openPlace(p.id, { replace: true });
      }
      function showResults(q, so) {
        const res = MV().search(q, { includeHome: true });
        if (res.length === 1) return pickFromSearch(res[0], so || {});
        showList(q, res, so);
      }
      function showCategory(title, cats, so) {
        const res = MV().places().filter((p) => cats.includes(p.cat) || (p.tags || []).some((t) => cats.includes(t))).sort((a, b) => MV().fromUser(a) - MV().fromUser(b));
        showList(title, res, so);
      }
      function showList(title, res, so) {
        JC.kb.hide();
        const card = {
          kind: 'list', detent: 'half',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', title), h('div.maps-ch-sub', U.plural(res.length, 'result'))), xBtn('xmark', () => back(), 'Close')),
          body: () => res.length ? JC.ui.list([{ rows: res.map((p) => placeRow(p, () => pickFromSearch(p, so || {}))) }], { cls: 'maps-list' }) : h('div.maps-noresults', h('div.maps-nr-t', 'No Results')),
          enter() {},
          leave() { map.clearPins((k) => k.startsWith('res_')); },
          restore() { pinsFor(res); },
        };
        show(card, { replace: top() && top().kind === 'search' });
        pinsFor(res);
        function pinsFor(list) {
          map.clearPins((k) => k.startsWith('res_'));
          list.slice(0, 30).forEach((p) => map.addPin('res_' + p.id, { kind: 'place', place: p.id, cat: p.cat, label: p.short || p.name, onTap: () => openPlace(p.id) }));
          if (list.length) map.fit(list.map((p) => [p.x, p.y]), { maxZoom: 90 });
        }
      }

      // ═══ PLACE CARD ═══
      let selPin = null;
      function selectOnMap(p, o) {
        if (selPin) map.removePin(selPin);
        selPin = 'sel';
        if (p.isUser) { map.setSelected(null); map.removePin('sel'); selPin = null; }
        else {
          map.addPin('sel', { kind: p.cat === 'pin' && !p.id ? 'drop' : 'place', at: [p.x, p.y], cat: p.cat, label: p.short || p.name, z: 10, reserve: [130, 74] });
          map.setSelected(p.id || null);
        }
        if (!(o && o.noFly)) {
          const z = Math.max(map.zoom, p.minZ ? Math.min(140, Math.max(p.minZ * 3, 30)) : 60);
          map.flyTo([p.x, p.y], Math.min(z, 150));
        }
      }
      function clearSel() { if (selPin) map.removePin(selPin); selPin = null; map.setSelected(null); }
      function openPlace(id, o) {
        o = o || {};
        const p = typeof id === 'object' ? id : MV().place(id);
        if (!p) return;
        if (p.id === 'player-home' && o.me) return openMe();
        JC.story.act('place_view', { place: p.id });
        if (p.id) addRecent({ kind: 'place', place: p.id });
        const card = placeCard(p, o);
        const t = top();
        show(card, { replace: o.replace || (t && (t.kind === 'place' || t.kind === 'pin')) });
        sh.set('half');
        selectOnMap(p);
      }
      function placeCard(p, o) {
        const card = {
          kind: p.id ? 'place' : 'pin',
          detent: 'half',
          head: () => h('div.maps-cardhead',
            h('div.maps-ch-main', h('div.maps-ch-title', p.short || p.name), h('div.maps-ch-sub', [p.sub || MV().cat(p.cat).label, p.city].filter(Boolean).join(' · '))),
            xBtn('square.and.arrow.up', () => sharePlace(p), 'Share'), xBtn('xmark', () => back(), 'Close')),
          body: () => placeBody(p, o),
          leave() { clearSel(); },
          restore() { selectOnMap(p, { noFly: true }); },
        };
        return card;
      }
      function placeBody(p) {
        const hi = MV().hoursInfo(p);
        const r1 = p.id ? MV().route('me', p.id, 'drive') : MV().route('me', [p.x, p.y], 'drive');
        const km = MV().fromUser(p);
        const fav = JC.store.all('maps_favs').find((f) => f.place === p.id);
        const actions = h('div.maps-actions',
          h('div.maps-act.primary', { onTap: () => directions(p.id || [p.x, p.y]) }, JC.icon(r1 && r1.km > 60 ? 'car.fill' : 'car.fill', { size: 20 }), h('span', r1 ? MV().fmtMin(r1.min) : 'Directions')),
          p.phone || p.contact ? h('div.maps-act', { onTap: () => callPlace(p) }, JC.icon('phone.fill', { size: 20 }), h('span', 'Call')) : null,
          p.web ? h('div.maps-act', { onTap: () => JC.os.open('safari', { url: p.web }) }, JC.icon('globe', { size: 20 }), h('span', 'Website')) : null,
          h('div.maps-act', { onTap: (e) => moreMenu(e.currentTarget, p) }, JC.icon('ellipsis', { size: 20 }), h('span', 'More')));
        const info = h('div.maps-info.hscroll',
          hi ? h('div.maps-info-i', { onTap: () => hoursSheet(p) }, h('div.maps-info-k', 'Hours'), h('div.maps-info-v', { class: hi.neutral ? '' : hi.open ? (hi.soon ? 'soon' : 'open') : 'closed' }, hi.short)) : null,
          p.rating ? h('div.maps-info-i', { onTap: () => ratingsSheet(p) }, h('div.maps-info-k', U.plural(p.reviews || 0, 'Rating').replace(/^(\d+)/, (m) => (+m >= 1000 ? (m / 1000).toFixed(1) + 'K' : m))), h('div.maps-info-v', JC.icon('star.fill', { size: 13 }), ' ' + p.rating.toFixed(1))) : null,
          h('div.maps-info-i', h('div.maps-info-k', 'Distance'), h('div.maps-info-v', JC.icon('location.fill', { size: 12 }), ' ' + MV().fmtDist(km))),
          p.price ? h('div.maps-info-i', h('div.maps-info-k', 'Cost'), h('div.maps-info-v', p.price)) : null);
        const photos = (p.photos || []).slice(0, 4);
        const gallery = h('div.maps-photos.hscroll',
          h('div.maps-lookthumb', { onTap: () => MV().lookAround(p) }, h('img', { src: MV().lookUrl(p), alt: 'Look Around' }), h('div.maps-look-lbl', JC.icon('binoculars.fill', { size: 14 }), 'Look Around')),
          photos.map((a) => h('div.maps-photo', { onTap: () => viewPhoto(a, p) }, JC.art.el(a, { cls: 'maps-photo-img' }))));
        const rows = [];
        if (hi) rows.push({ title: 'Hours', subtitle: hi.text, onTap: () => hoursSheet(p), chevron: true });
        if (p.phone) rows.push({ title: 'Phone', subtitle: p.phone, onTap: () => callPlace(p), cls: 'maps-linkrow' });
        if (p.web) rows.push({ title: 'Website', subtitle: p.web.replace(/^https?:\/\//, ''), onTap: () => JC.os.open('safari', { url: p.web }), cls: 'maps-linkrow' });
        rows.push({ title: 'Address', subtitle: (p.addr || MV().address(p.x, p.y)), onTap: (e) => JC.ui.actionSheet({ title: p.addr || '', actions: [{ text: 'Copy Address', onTap: () => { U.copy(p.addr || ''); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }, { text: 'Share…', onTap: () => sharePlace(p) }] }) });
        rows.push({ title: 'Coordinates', subtitle: coords(p) });
        const guides = JC.store.all('maps_guides').filter((g) => g.places.includes(p.id));
        const note = guides.map((g) => g.notes && g.notes[p.id]).find(Boolean);
        return [
          actions,
          info,
          gallery,
          note ? h('div.maps-note', JC.icon('pencil.line', { size: 15 }), h('div', h('b', 'Your note'), h('span', note))) : null,
          p.desc ? h('div.maps-about', h('div.maps-sec-h', h('span', 'About')), h('div.maps-about-t', p.desc)) : null,
          REVIEWS[p.id] ? h('div.maps-sec', h('div.maps-sec-h', h('span', 'Ratings & Reviews'), h('span.maps-more', { onTap: () => ratingsSheet(p) }, 'See All')), h('div.maps-reviews.hscroll', REVIEWS[p.id].map((rv) => reviewCard(rv)))) : null,
          h('div.maps-sec', h('div.maps-sec-h', h('span', 'Details')), JC.ui.list([{ rows }], { cls: 'maps-list maps-details' })),
          JC.ui.list([{ rows: [
            { icon: { glyph: fav ? 'star.fill' : 'star', bg: 'var(--yellow)' }, title: fav ? 'Remove from Places' : 'Add to Places', onTap: () => { if (fav) { if (fav.id === 'home' || fav.id === 'work') { JC.ui.toast(fav.label + ' can’t be removed'); return; } JC.store.remove('maps_favs', fav.id); JC.ui.toast('Removed from Places'); } else { JC.store.add('maps_favs', { kind: 'star', place: p.id, label: p.short || p.name }); JC.ui.toast('Added to Places', { icon: 'star.fill' }); } refresh(); } },
            { icon: { glyph: 'plus', bg: 'var(--blue)' }, title: guides.length ? 'In ' + guides.map((g) => g.title).join(', ') : 'Add to Guide', onTap: () => pickGuide(p) },
            { icon: { glyph: 'square.and.arrow.up', bg: 'var(--indigo)' }, title: 'Share', onTap: () => sharePlace(p) },
            { icon: { glyph: 'exclamationmark.bubble', bg: 'var(--orange)' }, title: 'Report an Issue', onTap: () => reportIssue(p) },
          ] }], { cls: 'maps-list' }),
          h('div.maps-terms', 'Information provided by Wavemaps and local businesses.'),
        ];
      }
      function coords(p) {
        // fictional lat/long from world coords
        const lat = 31.9 - p.y * 0.009, lon = 112.1 + p.x * 0.0105;
        return lat.toFixed(4) + '° N, ' + lon.toFixed(4) + '° E';
      }
      function reviewCard(rv) {
        return h('div.maps-review', h('div.maps-rv-top', h('span.maps-rv-stars', '★★★★★'.slice(0, rv[1]) + '☆☆☆☆☆'.slice(0, 5 - rv[1])), h('span.maps-rv-by', '@' + rv[0])), h('div.maps-rv-t', rv[2]));
      }
      function ratingsSheet(p) {
        const rv = REVIEWS[p.id] || [];
        JC.ui.sheet({
          title: 'Ratings & Reviews', detent: 'large', left: { text: 'Done' },
          content: () => [
            h('div.maps-rate-big', h('div.maps-rate-n', (p.rating || 4.5).toFixed(1)), h('div', h('div.maps-rv-stars.big', '★★★★★'), h('div.maps-rate-c', (p.reviews || 0).toLocaleString('en-US') + ' ratings on Wavemaps'))),
            h('div.maps-rate-bars', [5, 4, 3, 2, 1].map((s, i) => h('div.maps-rate-row', h('span', s), h('div.maps-rate-bar', h('div', { style: { width: [72, 18, 6, 2, 2][i] * ((p.rating || 4.5) / 4.6) + '%' } }))))),
            rv.length ? h('div.maps-rv-list', rv.map((r) => reviewCard(r))) : h('div.maps-empty', 'No written reviews yet.'),
            h('div.maps-rate-you', h('div', 'Rate this place'), h('div.maps-rate-pick', [1, 2, 3, 4, 5].map((n) => h('span.tap', { onTap: (e) => { const sp = e.currentTarget.parentNode.children; for (let k = 0; k < 5; k++) sp[k].classList.toggle('on', k < n); JC.ui.toast('Thanks! Your rating was saved as “Jiang Cheng”.', { icon: 'star.fill' }); } }, '★')))),
          ],
        });
      }
      function hoursSheet(p) {
        const hi = MV().hoursInfo(p);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const spec = (d) => {
          const hrs = p.hours;
          if (hrs === '24h') return 'Open 24 hours';
          if (hrs === 'invite') return 'By invitation';
          const m = /^(Mon|Sat)-(Fri|Sun)\s+(.*)$/.exec(hrs || '');
          if (m) { const wk = m[1] === 'Mon'; const isWk = d < 5; return (wk === isWk) ? m[3].replace('-', ' – ') : 'Closed'; }
          return (hrs || '').replace('-', ' – ');
        };
        const today = (JC.time.date().getDay() + 6) % 7;
        JC.ui.sheet({ title: 'Hours', detent: 'medium', left: { text: 'Done' }, content: () => [hi ? h('div.maps-hours-now', { class: hi.open ? 'open' : 'closed' }, hi.text) : null, JC.ui.list([{ rows: days.map((d, i) => ({ title: d, detail: spec(i), cls: i === today ? 'maps-today' : '' })) }])] });
      }
      function viewPhoto(a, p) {
        const layer = JC.ui.layer();
        const close = () => U.anim(v, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => v.remove());
        const v = h('div.maps-photoview', { onTap: close }, JC.art.el(a, { cls: 'maps-pv-img', fit: 'contain' }), h('div.maps-pv-cap', (p.short || p.name) + ' · ' + (JC.art.meta(a).title || 'Photo')), h('button.maps-pv-x', { onTap: close }, JC.icon('xmark', { size: 16, weight: 2.6 })));
        layer.appendChild(v);
        U.anim(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
      }
      function moreMenu(anchor, p) {
        const fav = JC.store.all('maps_favs').find((f) => f.place === p.id);
        JC.ui.menu(anchor, [
          { text: 'Look Around', icon: 'binoculars.fill', onTap: () => MV().lookAround(p) },
          { text: 'Share', icon: 'square.and.arrow.up', onTap: () => sharePlace(p) },
          { text: fav ? 'Remove from Places' : 'Add to Places', icon: fav ? 'star.fill' : 'star', onTap: () => { if (fav && fav.id !== 'home' && fav.id !== 'work') JC.store.remove('maps_favs', fav.id); else if (!fav) JC.store.add('maps_favs', { kind: 'star', place: p.id, label: p.short || p.name }); JC.ui.toast(fav ? 'Removed from Places' : 'Added to Places', { icon: 'star.fill' }); refresh(); } },
          { text: 'Add to Guide', icon: 'plus', onTap: () => pickGuide(p) },
          '-',
          { text: 'Copy Address', icon: 'doc.on.doc', onTap: () => { U.copy(p.addr || ''); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
          { text: 'Ride with Swift Ride', icon: 'car.fill', onTap: () => JC.os.open('swift', { to: p.id }) },
          p.cat === 'food' || p.cat === 'cafe' || p.cat === 'tea' ? { text: 'Order on Lotus Eats', icon: 'bag.fill', onTap: () => JC.os.open('lotuseats', { rest: p.id }) } : null,
          { text: 'Report an Issue', icon: 'exclamationmark.bubble', onTap: () => reportIssue(p) },
        ]);
      }
      function callPlace(p) { MV().callPlace(p); }
      function sharePlace(p) {
        p = typeof p === 'string' ? MV().place(p) : p;
        if (!p) return;
        JC.ui.share({ title: p.short || p.name, subtitle: p.addr || p.city, icon: 'map.fill', payload: { kind: 'location', place: p.id || 'player-home', text: (p.short || p.name) + ' — ' + (p.addr || ''), url: 'https://maps.wave/?q=' + encodeURIComponent(p.name) } });
      }
      function reportIssue(p) {
        JC.ui.actionSheet({ title: 'Report an Issue', message: p ? (p.short || p.name) : 'Choose what you’d like to report', actions: [
          { text: 'Wrong Address or Location', onTap: thanks },
          { text: 'Wrong Hours or Phone', onTap: thanks },
          { text: 'Place Has Closed', onTap: thanks },
          { text: 'Something Else…', onTap: () => JC.ui.alert({ title: 'Describe the Issue', input: { placeholder: 'e.g. “There is a car in the koi pond.”' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default' }] }).then((r) => { if (r.index === 1) thanks(); }) },
        ] });
        function thanks() { JC.ui.alert({ title: 'Thank You', message: 'Wavemaps will review your report. You’ll get a notification when it’s resolved (on Jiang Cheng’s phone).', buttons: [{ text: 'OK' }] }); }
      }
      function renameFav(f) {
        JC.ui.alert({ title: 'Rename', input: { placeholder: f.label, value: f.label }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value && r.value.trim()) { JC.store.update('maps_favs', f.id, { label: r.value.trim().slice(0, 18) }); refresh(); } });
      }

      // ── guides ──
      function guideCard(g, editorial) {
        return {
          kind: 'guide', detent: 'half',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', g.title), h('div.maps-ch-sub', (editorial ? 'Guide by ' + g.by : 'My Guide') + ' · ' + U.plural(g.places.length, 'place'))),
            editorial ? null : xBtn('ellipsis', (e) => JC.ui.menu(e.currentTarget, [
              { text: 'Add Place', icon: 'plus', onTap: () => show(searchCard('', { mode: 'guide', guide: g }), { keepPrev: true }) },
              { text: 'Rename Guide', icon: 'pencil', onTap: () => JC.ui.alert({ title: 'Rename Guide', input: { value: g.title, placeholder: 'Guide name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { JC.store.update('maps_guides', g.id, { title: r.value }); g.title = r.value; render(); } }) },
              { text: 'Share Guide', icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: g.title + ' — Guide', subtitle: U.plural(g.places.length, 'place'), icon: 'map.fill', payload: { kind: 'text', text: g.title + ': ' + g.places.map((id) => (MV().place(id) || {}).name).join(', ') } }) },
              '-',
              { text: 'Delete Guide', icon: 'trash', destructive: true, onTap: () => JC.ui.alert({ title: 'Delete “' + g.title + '”?', message: 'The places stay on the map.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }] }).then((r) => { if (r.index === 1) { JC.store.remove('maps_guides', g.id); home(); } }) },
            ]), 'More'),
            xBtn('xmark', () => back(), 'Close')),
          body: () => {
            const gg = editorial ? g : (JC.store.get('maps_guides', g.id) || g);
            return gg.places.length ? JC.ui.list([{ rows: gg.places.map((id) => { const p = MV().place(id); if (!p) return null; const note = gg.notes && gg.notes[id]; return placeRow(p, () => openPlace(id), note ? { subtitle2: '“' + note + '”' } : editorial ? null : { swipe: [{ text: 'Remove', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.update('maps_guides', gg.id, { places: gg.places.filter((x) => x !== id) }); refresh(); } }] }); }).filter(Boolean) }], { cls: 'maps-list' }) : JC.ui.empty({ icon: 'map', title: 'No Places Yet', text: 'Add places to this guide from any place card.' });
          },
          enter() { pins(); },
          leave() { map.clearPins((k) => k.startsWith('g_')); },
          restore() { pins(); },
        };
        function pins() {
          map.clearPins((k) => k.startsWith('g_'));
          g.places.forEach((id) => { const p = MV().place(id); if (p) map.addPin('g_' + id, { kind: 'place', place: id, cat: p.cat, label: p.short || p.name, onTap: () => openPlace(id) }); });
          map.fit(g.places.map((id) => MV().place(id)).filter(Boolean).map((p) => [p.x, p.y]), { maxZoom: 80 });
        }
      }
      function newGuide(withPlace) {
        JC.ui.alert({ title: 'New Guide', message: 'Give your guide a name.', input: { placeholder: 'e.g. Sunday dinner' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Create', style: 'default' }] }).then((r) => {
          if (r.index !== 1 || !r.value || !r.value.trim()) return;
          const g = JC.store.add('maps_guides', { title: r.value.trim().slice(0, 24), icon: 'star.fill', color: ['#5e5ce6', '#ff9f0a', '#30b0c7', '#ff375f'][Math.floor(Math.random() * 4)], places: withPlace ? [withPlace] : [], notes: {} });
          JC.ui.toast('Guide created', { icon: 'checkmark' });
          if (!withPlace) show(guideCard(g)); else refresh();
        });
      }
      function pickGuide(p) {
        const gs = JC.store.all('maps_guides');
        JC.ui.actionSheet({ title: 'Add to Guide', message: p.short || p.name, actions: gs.map((g) => ({ text: (g.places.includes(p.id) ? '✓ ' : '') + g.title, onTap: () => addToGuide(g, p.id) })).concat([{ text: 'New Guide…', onTap: () => newGuide(p.id) }]) });
      }
      function addToGuide(g, id) {
        const cur = JC.store.get('maps_guides', g.id);
        if (!cur) return;
        if (cur.places.includes(id)) { JC.ui.toast('Already in ' + cur.title); return; }
        JC.store.update('maps_guides', g.id, { places: cur.places.concat(id) });
        JC.ui.toast('Added to ' + cur.title, { icon: 'checkmark' });
        refresh();
      }

      // ── library / recents / visits ──
      function libraryCard() {
        return {
          kind: 'library', detent: 'full',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', 'Places')), xBtn('xmark', () => back(), 'Close')),
          body: () => {
            const favs = JC.store.all('maps_favs');
            return [
              JC.ui.list([{ rows: favs.map((f) => { const p = MV().place(f.place); return p ? { leading: f.contact ? JC.ui.avatar(f.contact, 34) : catIcon(f.kind === 'home' ? 'home' : f.kind === 'work' ? 'business' : p.cat, 34), title: f.label, subtitle: (p.short || p.name) + ' · ' + MV().fmtDist(MV().fromUser(p)), onTap: () => openPlace(p.id), swipe: f.id === 'home' || f.id === 'work' ? null : [{ text: 'Remove', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('maps_favs', f.id); refresh(); } }] } : null; }).filter(Boolean) }], { cls: 'maps-list' }),
              JC.ui.list([{ rows: [{ icon: { glyph: 'plus', bg: 'var(--blue)' }, title: 'Add a Place', onTap: () => show(searchCard('', { mode: 'fav' }), { keepPrev: true }) }] }], { cls: 'maps-list' }),
            ];
          },
        };
      }
      function recentsCard() {
        return {
          kind: 'recents', detent: 'full',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', 'Recents')), h('div.maps-clear', { onTap: () => JC.ui.alert({ title: 'Clear Recents?', message: 'This clears your recent places and searches on this iPhone.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive' }] }).then((r) => { if (r.index === 1) { JC.store.set('maps_recents', []); refresh(); } }) }, 'Clear'), xBtn('xmark', () => back(), 'Close')),
          body: () => { const rows = JC.store.all('maps_recents').slice().sort((a, b) => b.t - a.t).map(recentRow).filter(Boolean); return rows.length ? JC.ui.list([{ rows }], { cls: 'maps-list' }) : JC.ui.empty({ icon: 'clock', title: 'No Recents', text: 'Places you view and search for appear here.' }); },
        };
      }
      function visitsCard() {
        return {
          kind: 'visits', detent: 'full',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', 'Visited Places'), h('div.maps-ch-sub', 'Detected on this iPhone · End-to-end encrypted')), xBtn('ellipsis', (e) => JC.ui.menu(e.currentTarget, [{ text: 'Clear History…', icon: 'trash', destructive: true, onTap: () => JC.ui.alert({ title: 'Clear Visited Places?', message: 'You’d be deleting Jiang Cheng’s history. On Jiang Cheng’s phone. Are you sure?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive' }] }).then((r) => { if (r.index === 1) { JC.store.set('maps_visits', []); refresh(); } }) }, { text: 'Visited Places Settings', icon: 'gear', onTap: () => JC.ui.toast('Settings › Privacy › Location Services › System Services') }]), 'More'), xBtn('xmark', () => back(), 'Close')),
          body: () => {
            const vs = JC.store.all('maps_visits').slice().sort((a, b) => b.t - a.t);
            if (!vs.length) return JC.ui.empty({ icon: 'clock', title: 'No Visited Places', text: 'Places you visit will appear here.' });
            const groups = {};
            vs.forEach((v) => { const d = new Date(v.t); const k = d.getFullYear() === 2026 ? U.MONTHS[d.getMonth()] : String(d.getFullYear()); (groups[k] = groups[k] || []).push(v); });
            return JC.ui.list(Object.keys(groups).map((k) => ({ header: k, rows: groups[k].map((v) => { const p = MV().place(v.place); if (!p) return null; return { leading: catIcon(p.cat, 34), title: p.short || p.name, subtitle: U.fmtDate(v.t, 'md') + (new Date(v.t).getFullYear() !== 2026 ? ', ' + new Date(v.t).getFullYear() : '') + ' · ' + U.fmtTime(v.t) + (v.end ? '–' + U.fmtTime(v.end) : '') + (v.note ? ' · ' + v.note : ''), onTap: () => openPlace(p.id) }; }).filter(Boolean) })), { cls: 'maps-list' });
          },
        };
      }
      function offlineMaps() {
        JC.ui.sheet({ title: 'Offline Maps', detent: 'medium', left: { text: 'Done' }, content: () => [
          JC.ui.list([{ header: 'Downloaded', rows: [
            { title: 'Yunmeng & Lanling', subtitle: '1.2 GB · Updated Oct 2', detail: '' },
            { title: 'Gusu', subtitle: '410 MB · Updated Sep 25', detail: '' },
          ] }, { rows: [
            { title: 'Download New Map', onTap: () => JC.ui.alert({ title: 'Not Enough Storage', message: '256 GB used of 256 GB. (Most of it is photos of one dog.)', buttons: [{ text: 'OK' }] }), cls: 'maps-linkrow' },
            { title: 'Automatic Updates', toggle: { on: true, onChange: () => {} } },
            { title: 'Only Use Offline Maps', toggle: { on: false, onChange: (v) => JC.ui.toast(v ? 'Using offline maps only' : 'Using online maps') } },
          ] }]),
        ] });
      }

      // ═══ ME / DROPPED PIN ═══
      function openMe() {
        const me = MV().userPlace();
        const card = {
          kind: 'me', detent: 'half',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', 'My Location'), h('div.maps-ch-sub', 'Jinxing Road 27, Lanling')), xBtn('square.and.arrow.up', () => sharePlace(me), 'Share'), xBtn('xmark', () => back(), 'Close')),
          body: () => [
            h('div.maps-actions',
              h('div.maps-act.primary', { onTap: () => sharePlace(me) }, JC.icon('square.and.arrow.up', { size: 20 }), h('span', 'Share')),
              h('div.maps-act', { onTap: () => dropPin([me.x + 0.01, me.y - 0.01], 'Marked Location') }, JC.icon('mappin', { size: 20 }), h('span', 'Mark')),
              h('div.maps-act', { onTap: () => MV().lookAround('player-home') }, JC.icon('binoculars.fill', { size: 20 }), h('span', 'Look Around'))),
            h('div.maps-me-info', h('div.maps-me-row', JC.icon('location.fill', { size: 14 }), h('span', 'Accuracy: 5 m · Jinxing District')), h('div.maps-me-row', JC.icon('building.2', { size: 14 }), h('span', '27 Jinxing Road, Jinxing District, Lanling')), h('div.maps-me-row', JC.icon('mountain.2.fill', { size: 14 }), h('span', 'Elevation 21 m'))),
            JC.ui.list([{ header: 'Nearby', rows: MV().places().filter((p) => p.id !== 'player-home' && MV().fromUser(p) < 3).sort((a, b) => MV().fromUser(a) - MV().fromUser(b)).map((p) => placeRow(p, () => openPlace(p.id))) }], { cls: 'maps-list' }),
          ],
          leave() {},
        };
        show(card, { replace: top() && (top().kind === 'me' || top().kind === 'place' || top().kind === 'pin') });
        map.flyTo(map.userPos(), Math.max(map.zoom, 80));
      }
      function dropPin(w, name) {
        const addr = MV().address(w[0], w[1]);
        const p = { id: null, name: name || 'Dropped Pin', x: w[0], y: w[1], cat: 'pin', addr, city: MV().cityOf(w[0], w[1]), sub: addr };
        try { JC.audio.play('tink'); } catch (e) { /* ignore */ }
        const card = placeCard(p);
        card.body = () => [
          h('div.maps-actions',
            h('div.maps-act.primary', { onTap: () => directions([p.x, p.y], p) }, JC.icon('car.fill', { size: 20 }), h('span', 'Directions')),
            h('div.maps-act', { onTap: () => MV().lookAround(p) }, JC.icon('binoculars.fill', { size: 20 }), h('span', 'Look Around')),
            h('div.maps-act', { onTap: () => { JC.store.add('maps_favs', { kind: 'pin', place: savePin(p), label: 'Marked' }); JC.ui.toast('Added to Places', { icon: 'star.fill' }); } }, JC.icon('star', { size: 20 }), h('span', 'Add'))),
          JC.ui.list([{ rows: [
            { title: 'Address', subtitle: addr },
            { title: 'Coordinates', subtitle: coords(p) },
            { title: 'Distance', subtitle: MV().fmtDist(MV().fromUser(p)) + ' from your location' },
          ] }, { rows: [
            { title: 'Remove Pin', destructive: true, onTap: () => back() },
            { title: 'Share', onTap: () => JC.ui.share({ title: p.name, subtitle: addr, icon: 'mappin', payload: { kind: 'text', text: p.name + ' — ' + addr } }) },
          ] }], { cls: 'maps-list' }),
        ];
        show(card, { replace: top() && (top().kind === 'place' || top().kind === 'pin') });
        sh.set('half');
        selectOnMap(p, { noFly: true });
      }
      function savePin(p) {
        const it = JC.store.add('places', { name: 'Marked Location', city: p.city, x: p.x, y: p.y, cat: 'pin', addr: p.addr, minZ: 10, sub: 'Marked Location', desc: 'A location you marked in Maps.' });
        return it.id;
      }

      // ═══ DIRECTIONS ═══
      function directions(dest, destPlace, o) {
        o = o || {};
        const to = destPlace || MV().place(dest);
        if (!to) return;
        if (to.id) JC.story.act('directions', { place: to.id });
        let from = o.from ? MV().place(o.from) : MV().userPlace();
        let mode = o.mode || (MV().dist(from, to) < 1.2 ? 'walk' : 'drive');
        let sel = 0;
        let stop = null;
        let showSteps = false;
        const st = { avoidHwy: prefs().avoidHwy };
        const card = {
          kind: 'dir', detent: 'half',
          head: () => h('div.maps-cardhead', h('div.maps-ch-main', h('div.maps-ch-title', 'Directions'), h('div.maps-ch-sub', 'to ' + (toRef.isUser ? 'My Location' : toRef.short || toRef.name))), xBtn('xmark', () => back(), 'Close')),
          body: () => {
            const legsBox = h('div.maps-ft',
              h('div.maps-ft-dots', h('span.maps-ft-a'), h('span.maps-ft-line'), stop ? h('span.maps-ft-s') : null, stop ? h('span.maps-ft-line') : null, h('span.maps-ft-b', JC.icon('mappin', { size: 12, weight: 2.4 }))),
              h('div.maps-ft-fields',
                h('div.maps-ft-f.tap', { onTap: () => show(searchCard('', { mode: 'from', onPick: (p) => { from = p; card.restore(); refresh(); } }), { keepPrev: true }) }, h('span.maps-ft-k', 'From'), h('span', from.isUser ? 'My Location' : from.short || from.name)),
                stop ? h('div.maps-ft-f', h('span.maps-ft-k', 'Stop'), h('span', stop.short || stop.name), h('span.maps-ft-rm.tap', { onTap: () => { stop = null; card.restore(); refresh(); } }, JC.icon('minus.circle.fill', { size: 18 }))) : null,
                h('div.maps-ft-f.tap', { onTap: () => show(searchCard('', { mode: 'from', onPick: (p) => { toRef = p; card.restore(); refresh(); } }), { keepPrev: true }) }, h('span.maps-ft-k', 'To'), h('span', toRef.isUser ? 'My Location' : toRef.short || toRef.name)),
                h('div.maps-ft-add.tap', { onTap: () => show(searchCard('', { mode: 'stop', onPick: (p) => { stop = p; card.restore(); refresh(); } }), { keepPrev: true }) }, JC.icon('plus', { size: 14, weight: 2.6 }), 'Add Stop')),
              h('div.maps-ft-swap.tap', { onTap: () => { const t = from; from = toRef; toRef = t; card.restore(); refresh(); } }, JC.icon('arrow.triangle.swap', { size: 18, weight: 2.2 })));
            const modes = [['drive', 'car.fill', 'Drive'], ['walk', 'figure.walk', 'Walk'], ['transit', 'tram.fill', 'Transit'], ['cycle', 'bicycle', 'Cycle'], ['ride', 'person.2.wave', 'Ride']];
            const modeBar = h('div.maps-modes', modes.map(([k, g, t]) => h('div.maps-mode', { class: { on: mode === k }, onTap: () => { mode = k; sel = 0; showSteps = false; card.restore(); refresh(); } }, JC.icon(g, { size: 19, weight: 2 }), h('span', t))));
            const opts = h('div.maps-dir-opts',
              h('span.maps-chip', { onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Leave Now', checked: true, onTap: () => {} }, { text: 'Leave Later…', onTap: () => JC.ui.toast('Scheduling is for people who sleep.', { icon: 'clock' }) }, { text: 'Arrive By…', onTap: () => JC.ui.toast('Scheduling is for people who sleep.', { icon: 'clock' }) }]) }, 'Now', JC.icon('chevron.down', { size: 11, weight: 3 })),
              mode === 'drive' ? h('span.maps-chip', { onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Avoid Highways', checked: !!st.avoidHwy, onTap: () => { st.avoidHwy = !st.avoidHwy; setPref('avoidHwy', st.avoidHwy); card.restore(); refresh(); } }, { text: 'Avoid Tolls', checked: !!prefs().avoidTolls, onTap: () => { setPref('avoidTolls', !prefs().avoidTolls); st.avoidHwy = prefs().avoidTolls || st.avoidHwy; card.restore(); refresh(); } }]) }, 'Avoid', JC.icon('chevron.down', { size: 11, weight: 3 })) : null);
            const content = [legsBox, modeBar, opts];
            if (mode === 'transit') content.push(transitView());
            else if (mode === 'ride') content.push(rideView());
            else content.push(routesView());
            return content;
          },
          enter() { draw(); },
          leave() { map.clearRoutes(); map.removePin('dir_to'); map.removePin('dir_from'); map.removePin('dir_stop'); },
          restore() { draw(); },
        };
        let toRef = to;
        const ref = (p) => (p.isUser ? 'me' : p.id || p);
        function cur() { return { a: from, b: toRef }; }
        function compute() {
          const { a, b } = cur();
          const m = mode === 'ride' ? 'drive' : mode;
          const avoid = st.avoidHwy ? { hwy: true } : null;
          if (stop) {
            const r1 = MV().route(ref(a), stop.id || stop, m, { avoid }), r2 = MV().route(stop.id || stop, ref(b), m, { avoid });
            if (!r1 || !r2) return [];
            return [{ mode: m, from: a, to: b, pts: r1.pts.concat(r2.pts.slice(1)), km: r1.km + r2.km, min: r1.min + r2.min + 2, steps: r1.steps.slice(0, -1).concat([{ glyph: 'mappin', kind: 'stop', text: 'Stop at ' + (stop.short || stop.name), km: 0, at: [stop.x, stop.y] }]).concat(r2.steps), via: 'via ' + (stop.short || stop.name), hwy: r1.hwy || r2.hwy }];
          }
          return MV().routes(ref(a), ref(b), m, { avoid });
        }
        function draw() {
          map.clearRoutes();
          const { a, b } = cur();
          if (!b.isUser) map.addPin('dir_to', { kind: 'place', at: [b.x, b.y], cat: b.cat || 'pin', label: b.short || b.name, z: 9 }); else map.removePin('dir_to');
          if (!a.isUser) map.addPin('dir_from', { kind: 'dot', at: [a.x, a.y], color: '#0a84ff', anchor: 'center' }); else map.removePin('dir_from');
          if (stop) map.addPin('dir_stop', { kind: 'place', at: [stop.x, stop.y], cat: stop.cat, label: stop.short || stop.name }); else map.removePin('dir_stop');
          if (mode === 'transit') {
            const t = MV().transit(ref(a), ref(b));
            if (t) {
              const all = [];
              t.legs.forEach((l, i) => { if (!l.pts) return; all.push(...l.pts); map.setRoute('t' + i, l.kind === 'walk' ? { pts: l.pts, dotted: true, color: '#8e8e93' } : { pts: l.pts, color: l.color, width: 6 }); });
              if (all.length) map.fit(all, { margin: 50, maxZoom: 120 });
            }
            return;
          }
          const rs = compute();
          rs.forEach((r, i) => { if (i !== sel) map.setRoute('alt' + i, { pts: r.pts, alt: true }); });
          if (rs[sel]) {
            map.setRoute('main', { pts: rs[sel].pts, dotted: mode === 'walk' || mode === 'cycle' ? mode === 'walk' : false, color: mode === 'cycle' ? '#30b24e' : '#0a84ff' });
            map.fit(rs[sel].pts.concat(rs.flatMap((r) => [r.pts[Math.floor(r.pts.length / 2)]])), { margin: 46, maxZoom: 120 });
          }
        }
        function routesView() {
          const rs = compute();
          if (!rs.length) return h('div.maps-noresults', h('div.maps-nr-t', 'Directions Not Available'), h('div.maps-nr-s', mode === 'walk' || mode === 'cycle' ? 'Route too far to ' + (mode === 'walk' ? 'walk' : 'cycle') + '. Try driving or transit.' : 'No route found.'));
          const too = (mode === 'walk' && rs[0].min > 600) || (mode === 'cycle' && rs[0].min > 600);
          const wrap = h('div.maps-routes');
          if (too) wrap.appendChild(h('div.maps-hint.warn', JC.icon('exclamationmark.triangle.fill', { size: 14 }), mode === 'walk' ? ' This walk is ' + MV().fmtMin(rs[0].min) + '. Maybe don’t.' : ' This ride is ' + MV().fmtMin(rs[0].min) + '. Bring snacks.'));
          rs.forEach((r, i) => {
            const eta = MV().fmtClockMin(new Date(JC.time.now()).getHours() * 60 + new Date(JC.time.now()).getMinutes() + r.min);
            wrap.appendChild(h('div.maps-route', { class: { on: i === sel }, onTap: () => { sel = i; draw(); refresh(); } },
              h('div.maps-route-main',
                h('div.maps-route-t', MV().fmtMin(r.min)),
                h('div.maps-route-s', MV().fmtDist(r.km) + ' · ' + (r.via ? (r.via.startsWith('via') ? r.via : 'via ' + r.via) : '') ),
                h('div.maps-route-s2', i === 0 ? (r.noHwy ? 'Avoids highways' : 'Fastest route') + ' · Arrive ' + eta : (r.noHwy ? 'No highways · ' : '') + 'Arrive ' + eta + (r.hwy && mode === 'drive' ? ' · Tolls' : ''))),
              h('button.maps-go', { onTap: (e) => { e.stopPropagation(); startNav(r); } }, 'GO')));
          });
          const r = rs[sel];
          wrap.appendChild(h('div.maps-steps-toggle.tap', { onTap: () => { showSteps = !showSteps; refresh(); } }, showSteps ? 'Hide Steps' : 'Show Steps', JC.icon(showSteps ? 'chevron.up' : 'chevron.down', { size: 12, weight: 3 })));
          if (showSteps) wrap.appendChild(stepsList(r));
          wrap.appendChild(JC.ui.list([{ rows: [
            { icon: { glyph: 'square.and.arrow.up', bg: 'var(--indigo)' }, title: 'Share Route', onTap: () => JC.ui.share({ title: 'Directions to ' + (toRef.short || toRef.name), subtitle: MV().fmtMin(r.min) + ' · ' + MV().fmtDist(r.km), icon: 'arrow.triangle.turn.up.right.diamond.fill', payload: { kind: 'location', place: toRef.id || 'player-home', text: 'Directions to ' + (toRef.short || toRef.name) + ': ' + MV().fmtMin(r.min) } }) },
            { icon: { glyph: 'exclamationmark.bubble', bg: 'var(--orange)' }, title: 'Report an Issue', onTap: () => reportIssue(toRef) },
          ] }], { cls: 'maps-list' }));
          return wrap;
        }
        function transitView() {
          const { a, b } = cur();
          const t = MV().transit(ref(a), ref(b));
          if (!t) return h('div.maps-noresults', h('div.maps-nr-t', 'Transit Not Available'), h('div.maps-nr-s', 'Wavemaps doesn’t have transit information for this trip.'));
          const leaveAt = MV().fmtClockMin(Math.max(t.nowMin, t.depart - (t.legs[0] && t.legs[0].kind === 'walk' ? t.legs[0].min : 0)));
          const arrive = MV().fmtClockMin(t.nowMin + t.min);
          const chips = h('div.maps-tchips', t.legs.map((l, i) => [i ? h('span.maps-tchev', '›') : null, l.kind === 'walk' ? h('span.maps-twalk', JC.icon('figure.walk', { size: 15 }), h('small', l.min + '')) : l.kind === 'taxi' ? h('span.maps-twalk', JC.icon('car.fill', { size: 15 })) : h('span.maps-tline', { style: { background: l.color } }, l.line)]));
          return h('div.maps-routes',
            t.tomorrow ? h('div.maps-hint.warn', JC.icon('moon.fill', { size: 14 }), ' Service has ended for tonight. Showing the first trips tomorrow morning.') : null,
            h('div.maps-route.on',
              h('div.maps-route-main', h('div.maps-route-t', MV().fmtMin(t.min)), chips, h('div.maps-route-s2', (t.tomorrow ? 'Leave at ' + leaveAt + ' · ' : 'Leave now · ') + 'Arrive ' + arrive)),
              h('button.maps-go', { onTap: () => JC.ui.alert({ title: t.tomorrow ? 'First Departure: ' + MV().fmtClockMin(t.depart) : 'Transit Guidance', message: t.tomorrow ? 'Trains and buses start again in the morning. Want a ride instead? It’s ' + U.fmtTime(JC.time.now()) + '.' : 'Follow the steps below. Wavemaps will notify you before your stop.', buttons: [{ text: 'Swift Ride', onTap: () => JC.os.open('swift', { to: toRef.id }) }, { text: 'OK', style: 'default' }] }) }, 'GO')),
            h('div.maps-tlegs', t.legs.map((l) => h('div.maps-tleg',
              h('div.maps-tleg-ic', { style: { background: l.kind === 'walk' ? 'var(--fill3)' : l.color, color: l.kind === 'walk' ? 'var(--label)' : '#fff' } }, JC.icon(l.glyph, { size: 16 })),
              h('div.maps-tleg-m', h('div.maps-tleg-t', l.text), h('div.maps-tleg-s', l.kind === 'walk' ? MV().fmtMin(l.min) + ' · ' + MV().fmtDist(l.km) : l.dep != null ? 'Departs ' + MV().fmtClockMin(l.dep) + (l.from ? ' from ' + l.from : '') + (l.stops ? ' · ' + U.plural(l.stops, 'stop') : '') : MV().fmtMin(l.min)))))));
        }
        function rideView() {
          const { a, b } = cur();
          const r = MV().route(ref(a), ref(b), 'drive');
          if (!r) return h('div.maps-noresults', h('div.maps-nr-t', 'No Rides Available'));
          const tiers = [['go', 'Swift Go', 'Affordable rides', 4], ['comfort', 'Swift Comfort', 'Newer cars, extra legroom', 6], ['xl', 'Swift XL', 'Up to 6 seats', 9], ['pet', 'Swift Pet', 'For very large dogs', 11]];
          return h('div.maps-routes',
            h('div.maps-ride-brand', h('div.maps-ride-logo', JC.appIcon('swift')), h('div', h('b', 'Swift Ride'), h('span', 'Booked in the Swift Ride app'))),
            tiers.map(([k, n, d, wait]) => h('div.maps-route.ride', { onTap: () => JC.os.open('swift', { to: b.id, tier: k, from: a.isUser ? null : a.id }) },
              h('div.maps-route-main', h('div.maps-route-t', n), h('div.maps-route-s', d + ' · ' + wait + ' min away'), h('div.maps-route-s2', 'Drop-off ' + MV().fmtClockMin(new Date(JC.time.now()).getHours() * 60 + new Date(JC.time.now()).getMinutes() + wait + r.min))),
              h('div.maps-ride-price', '¥' + MV().fare(r, k)))),
            h('div.maps-hint', 'Prices are estimates and include the night surcharge (22:00–07:00).'));
        }
        show(card, { replace: o.replace || (top() && (top().kind === 'dir')) });
        sh.set('half');
      }
      function stepsList(r) {
        let acc = 0;
        return h('div.maps-steps', r.steps.map((s) => {
          const el = h('div.maps-step', h('div.maps-step-ic', JC.icon(s.glyph, { size: 20, weight: 2.2 })), h('div.maps-step-m', h('div.maps-step-d', s.kind === 'arrive' ? '' : MV().fmtDist(acc)), h('div.maps-step-t', s.text)));
          acc += s.km;
          return el;
        }));
      }

      // ═══ NAVIGATION ═══
      const navUI = h('div.maps-nav');
      body.appendChild(navUI);
      function startNav(r) {
        if (navState) endNav(true);
        const walk = r.mode === 'walk' || r.mode === 'cycle';
        const cum = [0];
        for (let i = 1; i < r.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]));
        const total = cum[cum.length - 1];
        // where along the route each step starts
        const starts = r.steps.map((s) => {
          let best = 0, bd = Infinity;
          for (let i = 0; i < r.pts.length; i++) { const d = Math.hypot(r.pts[i][0] - s.at[0], r.pts[i][1] - s.at[1]); if (d < bd) { bd = d; best = cum[i]; } }
          return s.kind === 'arrive' ? total : best;
        });
        for (let i = 1; i < starts.length; i++) if (starts[i] < starts[i - 1]) starts[i] = starts[i - 1];
        const simSec = clampN(total * (walk ? 14 : 3.2), 26, 95);
        navState = { r, cum, total, starts, s: 0, t0: performance.now(), simSec, walk, voice: prefs().voice, arrived: false, paused: false };
        sh.el.classList.add('maps-hidden');
        ctrls.classList.add('maps-hidden');
        wx.classList.add('maps-hidden');
        map.clearRoutes();
        map.setRoute('main', { pts: r.pts, dotted: r.mode === 'walk', color: r.mode === 'cycle' ? '#30b24e' : '#0a84ff', progress: 0 });
        map.setPadding({ top: 250, bottom: 150, right: 0 }, { recenter: true });
        buildNavUI();
        JC.os.island.start('maps-nav', {
          priority: 3, width: 210,
          compact: () => { const n = navState && nextStep(); return { left: h('span.maps-isl-l', JC.icon(n ? n.step.glyph : 'location.north.fill', { size: 18, weight: 2.4 })), right: h('span.maps-isl-r', n ? MV().fmtDist(Math.max(0, n.dist)) : '') }; },
          expanded: (el) => { const n = navState && nextStep(); el.append(h('div.maps-isl-x', h('div.maps-isl-xi', JC.icon(n ? n.step.glyph : 'location.north.fill', { size: 34, weight: 2.4 })), h('div.maps-isl-xm', h('div.maps-isl-xd', n ? MV().fmtDist(Math.max(0, n.dist)) : ''), h('div.maps-isl-xt', n ? n.step.text : 'Arrived')), h('div.maps-isl-end.tap', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); endNav(); } }, 'End'))); },
          onTap: () => JC.os.open('maps'),
        });
        JC.audio.play('tink');
        let last = performance.now();
        const tick = () => {
          if (!navState) return;
          const now = performance.now();
          const dt = (now - last) / 1000; last = now;
          if (!navState.paused && !navState.arrived) {
            navState.s = Math.min(total, navState.s + (total / simSec) * dt);
            const p = MV().along(r.pts, navState.s);
            const hd = p.a + Math.PI / 2;
            map.setUser([p.x, p.y], (hd * 180) / Math.PI);
            map.setView({ cx: p.x, cy: p.y, z: walk ? 240 : 115, b: navState.overview ? 0 : smoothB(map.bearing, hd) });
            map.setRoute('main', { pts: r.pts, dotted: r.mode === 'walk', color: r.mode === 'cycle' ? '#30b24e' : '#0a84ff', progress: navState.s / total });
            updateNavUI();
            if (navState.s >= total - 0.001) arrive();
          }
          navState.raf = requestAnimationFrame(tick);
        };
        navState.raf = requestAnimationFrame(tick);
      }
      function clampN(v, a, b) { return Math.max(a, Math.min(b, v)); }
      function smoothB(cur, target) { let d = target - cur; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return cur + d * 0.08; }
      function nextStep() {
        const n = navState;
        for (let i = 1; i < n.r.steps.length; i++) if (n.starts[i] > n.s + 0.005) return { i, step: n.r.steps[i], dist: n.starts[i] - n.s, then: n.r.steps[i + 1] };
        return null;
      }
      let navEls = {};
      function buildNavUI() {
        navUI.innerHTML = '';
        navEls = {
          gi: h('div.maps-nav-gi'), dist: h('div.maps-nav-dist'), txt: h('div.maps-nav-txt'), then: h('div.maps-nav-then'),
          eta: h('div.maps-nav-eta'), mins: h('div.maps-nav-min'), km: h('div.maps-nav-km'),
        };
        const banner = h('div.maps-nav-banner', { onTap: () => stepsSheet() }, h('div.maps-nav-row', navEls.gi, h('div.maps-nav-main', navEls.dist, navEls.txt)), navEls.then);
        const audio = h('div.maps-nav-btn', { onTap: (e) => JC.ui.menu(e.currentTarget, [
          { text: 'Loud Voice', checked: navState.voice === 'loud', onTap: () => setVoice('loud') },
          { text: 'Normal Voice', checked: navState.voice === 'normal', onTap: () => setVoice('normal') },
          { text: 'Soft Voice', checked: navState.voice === 'soft', onTap: () => setVoice('soft') },
          { text: 'No Voice', checked: navState.voice === 'none', onTap: () => setVoice('none') },
        ]) }, JC.icon(prefs().voice === 'none' ? 'speaker.slash.fill' : 'speaker.wave.2.fill', { size: 18 }));
        const overview = h('div.maps-nav-btn', { onTap: () => { navState.overview = !navState.overview; overview.classList.toggle('on', navState.overview); if (navState.overview) { navState.paused = true; map.setPadding({ top: 200, bottom: 160 }, { recenter: true }); map.fit(navState.r.pts, { margin: 40 }).then(() => {}); } else { navState.paused = false; } } }, JC.icon('arrow.up.arrow.down', { size: 18 }));
        const card = h('div.maps-nav-card',
          h('div.maps-nav-stats', h('div.maps-nav-stat', navEls.eta, h('span', 'arrival')), h('div.maps-nav-stat', navEls.mins, h('span', 'min')), h('div.maps-nav-stat', navEls.km, h('span', 'km'))),
          h('div.maps-nav-acts', audio, overview,
            h('div.maps-nav-btn', { onTap: () => JC.ui.actionSheet({ title: 'Report', actions: [{ text: 'Crash', onTap: () => JC.ui.toast('Reported. Drive safely.', { icon: 'checkmark' }) }, { text: 'Speed Check', onTap: () => JC.ui.toast('Reported', { icon: 'checkmark' }) }, { text: 'Hazard', onTap: () => JC.ui.toast('Reported: hazard (possibly a car in a pond)', { icon: 'checkmark' }) }] }) }, JC.icon('exclamationmark.bubble', { size: 18 })),
            h('div.maps-nav-btn', { onTap: () => JC.ui.share({ title: 'My ETA: ' + (navState.r.to.short || navState.r.to.name), subtitle: 'Arriving ' + navEls.eta.textContent, icon: 'location.fill', payload: { kind: 'text', text: 'On my way to ' + (navState.r.to.short || navState.r.to.name) + '. ETA ' + navEls.eta.textContent + '.' } }) }, JC.icon('square.and.arrow.up', { size: 18 })),
            h('button.maps-nav-end', { onTap: () => endNav() }, 'End')));
        navUI.append(banner, card);
        navUI.classList.add('on');
        updateNavUI();
      }
      function setVoice(v) { setPref('voice', v); navState.voice = v; buildNavUI(); JC.ui.toast(v === 'none' ? 'Voice guidance off' : v[0].toUpperCase() + v.slice(1) + ' voice', { icon: v === 'none' ? 'speaker.slash.fill' : 'speaker.wave.2.fill' }); }
      function updateNavUI() {
        const n = navState;
        if (!n) return;
        const ns = nextStep();
        const remainKm = n.total - n.s;
        const remainMin = Math.max(0, Math.round(n.r.min * (remainKm / Math.max(0.01, n.total))));
        const now = new Date(JC.time.now());
        navEls.eta.textContent = MV().fmtClockMin(now.getHours() * 60 + now.getMinutes() + remainMin).replace(/ (AM|PM)$/, '');
        navEls.mins.textContent = String(remainMin);
        navEls.km.textContent = remainKm < 10 ? remainKm.toFixed(1) : String(Math.round(remainKm));
        if (ns) {
          navEls.gi.innerHTML = ''; navEls.gi.appendChild(JC.icon(ns.step.glyph, { size: 40, weight: 2.6 }));
          navEls.dist.textContent = MV().fmtDist(Math.max(0, ns.dist));
          navEls.txt.textContent = ns.step.kind === 'arrive' ? ns.step.text : (ns.step.road || ns.step.text);
          navEls.then.innerHTML = '';
          if (ns.then && ns.dist < 1.2) navEls.then.append(h('span', 'Then'), JC.icon(ns.then.glyph, { size: 16, weight: 2.4 }));
          navEls.then.style.display = ns.then && ns.dist < 1.2 ? '' : 'none';
          if (n.lastStep !== ns.i) { n.lastStep = ns.i; if (n.voice !== 'none' && n.s > 0.01) JC.audio.play('tink'); JC.os.island.update('maps-nav'); }
        }
        if (Math.round(n.s * 20) !== n._isl) { n._isl = Math.round(n.s * 20); JC.os.island.update('maps-nav'); }
      }
      function arrive() {
        const n = navState;
        n.arrived = true;
        JC.audio.play('success');
        navEls.gi.innerHTML = ''; navEls.gi.appendChild(JC.icon('flag.checkered', { size: 40, weight: 2.4 }));
        navEls.dist.textContent = 'Arrived';
        navEls.txt.textContent = n.r.to.short || n.r.to.name;
        navEls.then.style.display = 'none';
        JC.os.island.update('maps-nav', { compact: () => ({ left: h('span.maps-isl-l', JC.icon('flag.checkered', { size: 18 })), right: h('span.maps-isl-r', 'Arrived') }) });
        JC.notify.push({ app: 'maps', title: 'Arrived', body: 'You have arrived at ' + (n.r.to.short || n.r.to.name) + '.', open: { app: 'maps' } });
        setTimeout(() => { if (navState === n) endNav(); }, 4200);
      }
      function stepsSheet() {
        if (!navState) return;
        JC.ui.sheet({ title: 'Steps', detent: 'large', left: { text: 'Done' }, content: () => stepsList(navState.r) });
      }
      function endNav(silent) {
        const n = navState;
        if (!n) return;
        cancelAnimationFrame(n.raf);
        navState = null;
        JC.os.island.stop('maps-nav');
        navUI.classList.remove('on');
        navUI.innerHTML = '';
        sh.el.classList.remove('maps-hidden');
        ctrls.classList.remove('maps-hidden');
        wx.classList.remove('maps-hidden');
        map.setUser(MV().HOME, null);
        map.setPadding({ top: 50, right: 52, bottom: Math.min(sh.visible(), (body.offsetHeight || 874) * 0.55) }, { recenter: true });
        map.setView({ b: 0 });
        if (!silent) {
          const c = top();
          if (c && c.kind === 'dir') c.restore();
          else map.flyTo(MV().HOME, 60);
        }
      }

      // ═══ STYLES, FOLLOW, LOOK AROUND, ACCOUNT ═══
      function openStyles() {
        const cur = prefs().style;
        const v = map.view();
        const s = JC.ui.sheet({
          title: 'Choose Map', detent: 'medium', left: { icon: 'xmark', text: '' }, cls: 'maps-styles',
          content: () => [
            h('div.maps-style-grid', [['explore', 'Explore'], ['driving', 'Driving'], ['transit', 'Transit'], ['satellite', 'Satellite']].map(([k, t]) => h('div.maps-style', { class: { on: cur === k }, onTap: () => { setStyle(k); s.close(); } },
              h('div.maps-style-img', MV().thumb([v.cx, v.cy], { w: 150, h: 96, zoom: Math.min(30, Math.max(3, v.z * 0.3)), style: k, marker: false, pois: k !== 'driving' })), h('span', t)))),
            JC.ui.list([{ rows: [
              { title: 'Traffic', toggle: { on: !!prefs().traffic || cur === 'driving', onChange: (on) => { setPref('traffic', on); map.setTraffic(on || prefs().style === 'driving'); } } },
              { title: 'Labels', toggle: { on: prefs().labels !== false, onChange: (on) => { setPref('labels', on); map.setLabels(on); } } },
              { title: 'Points of Interest', toggle: { on: prefs().pois !== false, onChange: (on) => { setPref('pois', on); map.setPois(on); } } },
              { title: '3D Map', toggle: { on: false, onChange: () => JC.ui.alert({ title: '3D Not Available', message: '3D buildings aren’t available for Lanling yet. Koi Tower is, however, very tall. Trust us.', buttons: [{ text: 'OK' }] }) } },
            ] }]),
          ],
        });
      }
      function setStyle(k) {
        setPref('style', k);
        map.setStyle(k === 'driving' ? 'driving' : k);
        map.setTraffic(k === 'driving' || !!prefs().traffic);
        body.classList.toggle('maps-sat', k === 'satellite');
      }
      body.classList.toggle('maps-sat', P.style === 'satellite');
      function setFollow(n) {
        follow = n;
        locIcon.innerHTML = '';
        locIcon.appendChild(JC.icon(n === 0 ? 'location' : n === 1 ? 'location.fill' : 'location.north.line', { size: 21, weight: 2 }));
        if (n === 2) { map.setUser(MV().HOME, 38); map.setView({ cx: MV().HOME[0], cy: MV().HOME[1], b: (38 * Math.PI) / 180, z: Math.max(map.zoom, 90) }, { animate: true, duration: 500 }); }
        else if (n === 1) { map.setUser(MV().HOME, null); map.setView({ cx: MV().HOME[0], cy: MV().HOME[1], b: 0, z: Math.max(map.zoom, 70) }, { animate: true, duration: 700 }); }
        else map.setUser(MV().HOME, null);
      }
      function cycleFollow() { setFollow((follow + 1) % 3); }
      function look() {
        const v = map.view();
        let best = null;
        MV().places().forEach((p) => { const d = Math.hypot(p.x - v.cx, p.y - v.cy); if (d < 1.2 && (!best || d < best.d)) best = { d, p }; });
        MV().lookAround(best ? best.p : { name: MV().address(v.cx, v.cy).replace(/^\d+ /, ''), x: v.cx, y: v.cy, look: 'street', addr: MV().address(v.cx, v.cy) });
      }
      function openAccount() {
        const s = JC.ui.sheet({
          title: '', detent: 'large', left: { text: 'Done' },
          content: () => [
            h('div.maps-acct', JC.ui.avatar('me', 72), h('div.maps-acct-n', 'Jiang Cheng'), h('div.maps-acct-e', 'jiang.cheng@lotuspier.yunmeng')),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'star.fill', bg: 'var(--yellow)' }, title: 'Places', detail: String(JC.store.all('maps_favs').length), chevron: true, onTap: () => { closeTop(); show(libraryCard()); } },
              { icon: { glyph: 'map.fill', bg: 'var(--blue)' }, title: 'Guides', detail: String(JC.store.all('maps_guides').length), chevron: true, onTap: () => { closeTop(); show(guideCard(JC.store.all('maps_guides')[0])); } },
              { icon: { glyph: 'clock.fill', bg: 'var(--purple)' }, title: 'Visited Places', chevron: true, onTap: () => { closeTop(); show(visitsCard()); } },
              { icon: { glyph: 'star', bg: 'var(--orange)' }, title: 'Ratings & Photos', detail: '0', chevron: true, onTap: () => JC.ui.toast('Jiang Cheng has never rated anything. Of course he hasn’t.') },
              { icon: { glyph: 'exclamationmark.bubble', bg: 'var(--red)' }, title: 'Reports', detail: '1', chevron: true, onTap: () => JC.ui.alert({ title: 'Your Reports', message: '“Lotus Pier gate shown on the wrong side of the road.” — Fixed, March 2026.', buttons: [{ text: 'OK' }] }) },
            ] }, { header: 'Preferences', rows: [
              { title: 'Avoid Highways', toggle: { on: !!prefs().avoidHwy, onChange: (v) => setPref('avoidHwy', v) } },
              { title: 'Avoid Tolls', toggle: { on: !!prefs().avoidTolls, onChange: (v) => setPref('avoidTolls', v) } },
              { title: 'Preferred Transport', detail: 'Driving', onTap: () => JC.ui.toast('Jiang Cheng drives. Or is driven. Never cycles.') },
              { title: 'Distances', detail: 'Kilometres' },
              { title: 'Voice Volume', detail: { loud: 'Loud', normal: 'Normal', soft: 'Soft', none: 'No Voice' }[prefs().voice] || 'Normal', onTap: (e) => JC.ui.menu(e.currentTarget, ['loud', 'normal', 'soft', 'none'].map((k) => ({ text: { loud: 'Loud', normal: 'Normal', soft: 'Soft', none: 'No Voice' }[k], checked: prefs().voice === k, onTap: () => setPref('voice', k) }))) },
            ] }, { rows: [
              { title: 'Offline Maps', chevron: true, onTap: () => offlineMaps() },
              { title: 'Share ETA Contacts', detail: 'Tang Mei', chevron: true, onTap: () => JC.ui.alert({ title: 'Share ETA', message: 'When Jiang Cheng starts navigating to Work, his ETA is shared automatically with Tang Mei (EA).', buttons: [{ text: 'OK' }] }) },
              { title: 'Privacy & Data', chevron: true, onTap: () => JC.ui.alert({ title: 'Your Data', message: 'Maps doesn’t associate your data with your Apple Account. Wavemaps doesn’t know who you are. Nobody here does.', buttons: [{ text: 'OK' }] }) },
            ] }]),
          ],
        });
        function closeTop() { s.close(); }
      }

      // ═══ intents ═══
      function handle(it) {
        if (!it) return;
        if (navState && (it.place || it.directions)) endNav(true);
        if (it.place) {
          const p = MV().place(it.place);
          if (p && it.place === 'player-home') { openMe(); return; }
          if (p) { home(); openPlace(it.place); }
        } else if (it.directions) {
          const d = it.directions;
          home();
          if (typeof d === 'object' && !Array.isArray(d)) directions(d.to, null, { from: d.from, mode: d.mode });
          else directions(d);
        } else if (it.share) {
          const p = MV().place(it.share === true ? 'player-home' : it.share);
          if (p) { if (p.id !== 'player-home') { home(); openPlace(p.id); } setTimeout(() => sharePlace(it.share === true || it.share === 'player-home' ? MV().userPlace() : p), 450); }
        } else if (it.search) {
          home(); show(searchCard(it.search), { keepPrev: true });
        } else if (it.id) handle({ place: it.id });
      }

      show(homeCard);
      setTimeout(() => { if (intent0) handle(intent0); }, 60);
      win.setStatus && win.setStatus('auto');

      return {
        intent: handle,
        show() { map.resize(); },
        hide() {},
        back() { if (navState) return false; return back(); },
        destroy() { if (navState) endNav(true); map.destroy(); },
      };
    },
  });
})();
