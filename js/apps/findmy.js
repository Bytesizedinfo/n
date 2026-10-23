/* Find My — People / Devices / Items / Me over the shared map (JC.mapview), with person, device and
   AirTag cards: Contact, Directions, Notifications, location sharing, Play Sound, Mark As Lost,
   Erase (Apple Account password → fails), Lost Mode for this iPhone. Acts: findmy_view, findmy_sound. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const MV = () => JC.mapview;

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    const cur = d.apps.findmy || (d.apps.findmy = {});
    const def = { sharingWith: ['ekat', 'lumine'], removed: [], favs: ['teucer'], rules: [], notify: { airpods: true, macbook: false, ipad: false, sirfang: true, unit3: false }, sharing: true, names: {}, pwTries: 0, sounds: {}, friendReq: true };
    Object.keys(def).forEach((k) => { if (!(k in cur)) cur[k] = def[k]; });
    return cur;
  }
  const save = () => JC.state.save();
  const F = () => (JC.state.d.flags || {});
  const T = (x) => JC.time.parse(x);
  const now = () => JC.time.now();
  const morning = () => !!(F().lost_mode || F().finale || JC.state.d.lost);
  const AGO = (ms) => { const m = Math.round((JC.time.now() - ms) / 60000); return m < 1 ? 'Now' : m < 60 ? m + ' min ago' : U.fmtTime(ms); };
  const PL = (id) => { try { const p = MV().place(id); return p ? [p.x, p.y] : MV().HOME.slice(); } catch (e) { return [234.4, 152.4]; } };
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const chapter = () => { try { const c = JC.story.currentChapter(); return c ? c.id : 'fri_night'; } catch (e) { return 'fri_night'; } };

  // where the kids are: in the air Friday night, then wherever the player (and the story) put them
  function kidsWhere() {
    const f = F();
    const dep = T('+0 23:50'), arr = T('+1 07:40'), home = T('+3 13:10'), homeArr = T('+3 21:00');
    const t = now();
    if (t < arr) {
      const k = Math.max(0, Math.min(1, (t - dep) / (arr - dep)));
      return { at: lerp([156, 0.6], PL('airport'), k), label: t < dep ? 'Zapolyarny Airport, Snezhnaya' : 'In flight · LA 711', place: t < dep ? 'zapolyarny' : null, t, moving: t >= dep };
    }
    if (t >= home) {
      const k = Math.max(0, Math.min(1, (t - home) / (homeArr - home)));
      return { at: lerp(PL('airport'), [156, 0.6], k), label: k >= 1 ? 'Zapolyarny Airport, Snezhnaya' : 'In flight · LA 712', place: null, t, moving: k < 1 };
    }
    let place = 'airport';
    if (t > arr + 50 * 60000) {
      if (f.fatui_pickup && !f.kids_rescued) place = 'liyue-grand';
      else if (f.kids_wangshu) place = 'wangshu';
      else if (f.kids_alcor) place = 'alcor';
      else if (f.kids_grand) place = 'liyue-grand';
      else if (f.kids_apartment) place = 'apartment';
      else if (f.kids_zl) place = 'wangsheng';
      else place = 'wangshu';
      if (chapter() === 'sat_noon' && (f.factory_zl || f.factory_bank)) place = f.factory_bank ? 'northland' : 'mingyun';
      if (chapter() === 'sun_rite') place = 'yujing';
    }
    const p = MV().place(place);
    return { at: PL(place), label: p ? (p.short || p.name) + ', ' + (p.city || 'Liyue Harbor') : 'Liyue Harbor', place, t: t - 120000 };
  }

  // ── what is where ─────────────────────────────────────────────────────
  function people() {
    const S = st();
    const list = [
      { id: 'teucer', kind: 'person', name: 'Teucer', contact: 'teucer', since: T('2024-12-24 10:00'), family: true,
        where: () => kidsWhere() },
      { id: 'lumine', kind: 'person', name: 'Lumine', contact: 'lumine', since: T('2026-05-02 18:00'),
        where: () => {
          const f = F(), c = chapter();
          if (f.lumine_pickup && c === 'sat_dawn') return { at: PL('airport'), label: 'Liyue Harbor International', place: 'airport', t: now() - 60000 };
          if (f.lumine_guard && (c === 'sun_rite' || c === 'sun_night')) { const k = kidsWhere(); return Object.assign({}, k, { t: now() - 60000 }); }
          if (c === 'sun_rite') return { at: PL('yujing'), label: 'Yujing Terrace, Liyue Harbor', place: 'yujing', t: now() - 300000 };
          if (c === 'fri_night') return { at: PL('wanmin-rest'), label: 'Wanmin Restaurant, Chihu Rock', place: 'wanmin-rest', t: now() - 60000 };
          return { at: PL('liuli'), label: 'Feiyun Slope, Liyue Harbor', place: 'liuli', t: now() - 600000 };
        } },
      { id: 'ekat', kind: 'person', name: 'Ekaterina', contact: 'ekat', since: T('2026-03-12 09:30'),
        where: () => (F().ekat_warned ? { at: PL('northland'), label: 'Location Not Available', place: null, t: T('+1 06:10'), last: true } : { at: PL('northland'), label: 'Northland Bank, Harbor Road', place: 'northland', t: now() - 180000 }) },
    ];
    return list.filter((p) => !S.removed.includes(p.id));
  }
  function devices() {
    const lost = JC.state.d.lost;
    return [
      { id: 'iphone', kind: 'device', name: 'Childe’s iPhone', glyph: 'iphone', model: 'iPhone 17 Pro', self: true, battery: () => JC.os.battery(), lost: !!lost,
        where: () => (chapter() === 'fri_night' ? { at: PL('pier7'), label: 'Pier 7, Liyue Harbor', place: 'pier7', t: now() } : { at: MV().HOME.slice(), label: 'Chihu Rock, Lane 3, Liyue Harbor', place: 'player-home', t: now() }) },
      { id: 'airpods', kind: 'device', name: 'Childe’s AirPods Pro', glyph: 'airpods', model: 'AirPods Pro (3rd generation)', battery: () => (now() >= T('+1 00:20') ? 38 : null),
        get offline() { return now() < T('+1 00:20'); },
        where: () => (now() < T('+1 00:20')
          ? { at: PL('pier7'), label: 'Pier 7, Liyue Harbor', place: 'pier7', t: T('+0 23:24'), last: true }
          : { at: PL('wangsheng'), label: 'Wangsheng Funeral Parlor, Feiyun Slope', place: 'wangsheng', t: now() - 90000 }) },
      { id: 'macbook', kind: 'device', name: 'Childe’s MacBook Pro', glyph: 'laptopcomputer', model: 'MacBook Pro 14-inch', battery: () => 64,
        where: () => ({ at: PL('apartment'), label: 'Pier View Residences, Liyue Harbor', place: 'apartment', t: now() - 240000 }) },
      { id: 'ipad', kind: 'device', name: 'Childe’s iPad', glyph: 'ipad', model: 'iPad Pro 13-inch', battery: () => 31,
        where: () => ({ at: PL('northland'), label: 'Northland Bank, Harbor Road', place: 'northland', t: now() - 3 * 3600000 }) },
    ];
  }
  function items() {
    return [
      { id: 'sirfang', kind: 'item', name: 'Sir Fang', emoji: '🐺', art: 'mk_sirfang', owner: 'mama', shared: true, desc: 'AirTag · Shared by Mama',
        where: () => kidsWhere() },
      { id: 'unit3', kind: 'item', name: 'U3 — G-17', emoji: '📡', desc: 'AirTag · “Unit 3”',
        where: () => ({ at: [284.2, 152.4], label: 'Guyun Stone Forest, Liyue Bay', place: 'guyun', t: now() - 30 * 60000 }) },
      { id: 'rod', kind: 'item', name: 'Rod (birthday)', emoji: '🎣', desc: 'AirTag · on the reel',
        where: () => ({ at: PL('pier7'), label: chapter() === 'fri_night' ? 'With You' : 'Pier 7, Liyue Harbor', place: 'pier7', t: now() - 60000 }) },
    ];
  }
  const all = () => people().concat(devices(), items());
  const find = (id) => all().find((x) => x.id === id) || null;
  const dname = (x) => st().names[x.id] || x.name;

  // ── sound for "Play Sound" on this iPhone ──
  function loudSound(sec) {
    const ac = JC.audio.ctx && JC.audio.ctx();
    if (!ac) return () => {};
    const out = JC.audio.out || ac.destination;
    const g = ac.createGain();
    g.gain.value = 0.9;
    g.connect(out);
    let stop = false;
    const t0 = ac.currentTime + 0.05;
    const notes = [1046.5, 1318.5, 1568, 2093];
    for (let k = 0; k < sec * 2; k++) {
      notes.forEach((f, i) => {
        const o = ac.createOscillator();
        const e = ac.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        const s = t0 + k * 0.5 + i * 0.09;
        e.gain.setValueAtTime(0, s);
        e.gain.linearRampToValueAtTime(0.5, s + 0.015);
        e.gain.exponentialRampToValueAtTime(0.001, s + 0.22);
        o.connect(e); e.connect(g);
        o.start(s); o.stop(s + 0.25);
      });
    }
    return () => { if (stop) return; stop = true; try { g.gain.setTargetAtTime(0, ac.currentTime, 0.02); setTimeout(() => g.disconnect(), 200); } catch (e) { /* ignore */ } };
  }

  JC.app({
    id: 'findmy',
    name: 'Find My',
    status: 'auto',
    launch(win, intent0) {
      const body = win.body;
      body.classList.add('app-findmy');
      const map = MV().create(body, { style: 'explore', zoom: 12, center: [176, 94], poiBoost: 1.4, cls: 'fm-map' });
      body._mv = map;
      let tab = 'people';
      let detail = null;
      const ctrls = h('div.mv-ctrls.fm-ctrls',
        h('div.mv-ctrl-group',
          h('div.mv-ctrl', { onTap: () => JC.ui.menu(ctrlsStyle, [
            { text: 'Standard', checked: map.style !== 'satellite' && map.style !== 'muted', onTap: () => map.setStyle('explore') },
            { text: 'Hybrid', checked: map.style === 'satellite', onTap: () => map.setStyle('satellite') },
            { text: 'Satellite', checked: false, onTap: () => { map.setStyle('satellite'); map.setLabels(false); setTimeout(() => map.setLabels(true), 20000); } },
          ]), attrs: { 'aria-label': 'Map' } }, JC.icon('map', { size: 21, weight: 2 })),
          h('div.mv-ctrl.blue', { onTap: () => { map.flyTo(MV().HOME, 60); }, attrs: { 'aria-label': 'My Location' } }, JC.icon('location', { size: 21, weight: 2 }))),
        h('div.mv-ctrl-group',
          h('div.mv-ctrl', { onTap: () => map.zoomIn(), attrs: { 'aria-label': 'Zoom In' } }, JC.icon('plus', { size: 19, weight: 2.4 })),
          h('div.mv-ctrl', { onTap: () => map.zoomOut(), attrs: { 'aria-label': 'Zoom Out' } }, JC.icon('minus', { size: 19, weight: 2.4 }))));
      const ctrlsStyle = ctrls.querySelector('.mv-ctrl');
      body.appendChild(ctrls);

      const head = h('div.fm-headslot');
      const sh = MV().sheet(body, { cls: 'fm-sheet', peek: 168, half: 0.47, initial: 'half',
        onChange: (d, vis) => { ctrls.style.opacity = d === 'full' ? '0' : ''; ctrls.style.pointerEvents = d === 'full' ? 'none' : ''; if (d !== 'full') map.setPadding({ bottom: Math.min(vis, (body.offsetHeight || 874) * 0.55), top: 40, right: 50 }); } });
      sh.head.appendChild(head);

      // tab bar (floating glass)
      const TABS = [['people', 'People', 'person.2.fill'], ['devices', 'Devices', 'laptopcomputer'], ['items', 'Items', 'airtag'], ['me', 'Me', 'person.crop.circle']];
      const tabItems = {};
      const tabbar = h('div.fm-tabbar', h('div.fm-tabgroup', TABS.map(([id, t, g]) => (tabItems[id] = h('div.fm-tab', { onTap: () => selectTab(id, true) }, JC.icon(g, { size: 22 }), h('span', t))))));
      body.appendChild(tabbar);

      function selectTab(id, user) {
        if (user && id === tab && !detail) { sh.set(sh.get() === 'full' ? 'half' : 'full'); return; }
        tab = id; detail = null;
        Object.keys(tabItems).forEach((k) => tabItems[k].classList.toggle('on', k === id));
        render();
        pins();
        if (id === 'me') map.flyTo(MV().HOME, 70);
        else fitTab();
        if (sh.get() === 'peek') sh.set('half');
      }
      function listFor(t) { return t === 'people' ? people() : t === 'devices' ? devices() : t === 'items' ? items() : []; }
      function fitTab() {
        const pts = listFor(tab).filter((x) => x.where).map((x) => x.where().at);
        if (tab === 'devices' || tab === 'people' || tab === 'items') pts.push(MV().HOME.slice());
        if (pts.length) map.fit(pts, { margin: 70, maxZoom: 60 });
      }

      // ── pins ──
      function pins() {
        map.clearPins();
        const sel = detail && detail.id;
        listFor(tab).forEach((x) => {
          if (!x.where) return;
          const w = x.where();
          if (x.self) return; // the blue dot is this iPhone
          let el;
          if (x.kind === 'person') el = MV().pinEl('avatar', { avatar: x.contact, selected: sel === x.id, label: sel === x.id ? x.name : null });
          else if (x.kind === 'device') { el = MV().pinEl('device', { glyph: x.glyph, selected: sel === x.id, label: sel === x.id ? dname(x) : null }); if (x.offline) el.classList.add('offline'); }
          else el = h('div.fm-itempin', { class: { sel: sel === x.id } }, h('div.fm-itemring', x.art && JC.art.has(x.art) ? JC.art.el(x.art, { cls: 'fm-itemart' }) : h('span', x.emoji)), sel === x.id ? h('div.mv-pin-label', dname(x)) : null);
          map.addPin('fm_' + x.id, { el, at: w.at, onTap: () => openDetail(x.id), z: sel === x.id ? 9 : 3, reserve: [52, 60] });
        });
      }

      // ── list views ──
      function render() {
        head.innerHTML = '';
        sh.body.innerHTML = '';
        if (detail) { renderDetail(); return; }
        const titles = { people: 'People', devices: 'Devices', items: 'Items', me: 'Me' };
        const plus = tab === 'me' ? null : h('button.fm-plus', { onTap: (e) => addMenu(e.currentTarget), attrs: { 'aria-label': 'Add' } }, JC.icon('plus', { size: 18, weight: 2.6 }));
        head.appendChild(h('div.fm-listhead', h('div.fm-title', titles[tab]), plus));
        let content;
        if (tab === 'people') content = peopleList();
        else if (tab === 'devices') content = deviceList();
        else if (tab === 'items') content = itemList();
        else content = meView();
        (Array.isArray(content) ? content : [content]).forEach((n) => n && sh.body.appendChild(n));
      }
      function distTo(w) { return MV().fmtDist(Math.hypot(w.at[0] - MV().HOME[0], w.at[1] - MV().HOME[1])); }
      function peopleList() {
        const ps = people();
        const S = st();
        if (!ps.length) return JC.ui.empty({ icon: 'person.2.fill', title: 'No People', text: 'Share your location with friends and family.' });
        return [JC.ui.list([{ rows: ps.map((p) => {
          if (p.noLocation) return { avatar: p.contact, avatarSize: 46, title: p.name, subtitle: S.sharingWith.includes(p.id) ? 'Can see your location' : 'Location not available', onTap: () => openDetail(p.id), chevron: true };
          const w = p.where();
          return { avatar: p.contact, avatarSize: 46, title: p.name + (S.favs.includes(p.id) ? ' ★' : ''), subtitle: w.label, subtitle2: AGO(w.t), detail: distTo(w), onTap: () => openDetail(p.id) };
        }) }], { cls: 'fm-list' }),
        h('div.fm-foot', 'Location sharing: ', h('b', S.sharing ? 'On' : 'Off'), ' · From This iPhone')];
      }
      function deviceList() {
        const lost = JC.state.d.lost;
        return [JC.ui.list([{ rows: devices().map((d) => {
          const w = d.where();
          const b = d.battery && d.battery();
          return {
            leading: h('div.fm-devic', { class: { lost: d.self && !!lost } }, JC.icon(d.glyph, { size: 24 })),
            title: dname(d),
            titleRight: d.self && lost ? h('span.fm-lostbadge', 'Lost Mode') : null,
            subtitle: d.self ? (lost ? 'Lost Mode · This iPhone' : 'This iPhone') : w.label,
            subtitle2: d.self ? w.label : (w.last ? 'Last seen ' + U.fmtTime(w.t) : AGO(w.t)) + (b != null ? ' · ' + b + '%' : ''),
            detail: d.self ? 'With You' : distTo(w),
            onTap: () => openDetail(d.id),
          };
        }) }], { cls: 'fm-list' }), h('div.fm-foot', 'Devices signed in with tartaglia@northland.sn')];
      }
      function itemList() {
        return [JC.ui.list([{ rows: items().map((it) => {
          const w = it.where();
          return { leading: h('div.fm-itemic', it.art && JC.art.has(it.art) ? JC.art.el(it.art, { cls: 'fm-itemart' }) : it.emoji), title: dname(it), subtitle: w.label, subtitle2: AGO(w.t) + (it.shared ? ' · Shared by Mama' : ''), detail: w.label === 'With You' ? 'With You' : distTo(w), onTap: () => openDetail(it.id) };
        }) }], { cls: 'fm-list' }),
        JC.ui.list([{ rows: [{ icon: { glyph: 'plus', bg: 'var(--green)' }, title: 'Add AirTag', onTap: () => addItem() }, { icon: { glyph: 'magnifyingglass', bg: 'var(--blue)' }, title: 'Identify Found Item', onTap: () => identifyItem() }] }], { cls: 'fm-list' })];
      }
      function meView() {
        const S = st();
        return [
          h('div.fm-me', h('div.fm-me-av', JC.ui.avatar('me', 64)), h('div.fm-me-n', 'Childe'), h('div.fm-me-l', JC.icon('location.fill', { size: 13 }), ' Chihu Rock, Lane 3, Liyue Harbor')),
          JC.ui.list([{ header: 'Location', rows: [
            { title: 'Share My Location', toggle: { on: S.sharing, onChange: (v) => { S.sharing = v; save(); JC.ui.toast(v ? 'Sharing location from This iPhone' : 'Location sharing off', { icon: 'location.fill' }); render(); } } },
            { title: 'Location', detail: 'This iPhone' },
            { title: 'Location Name', detail: S.locName || 'None', chevron: true, onTap: (e) => JC.ui.menu(e.currentTarget, ['Home', 'Work', 'School', 'Gym', 'None', 'Custom…'].map((n) => ({ text: n, checked: (S.locName || 'None') === n, onTap: () => { if (n === 'Custom…') JC.ui.alert({ title: 'Custom Label', input: { placeholder: 'Label' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Done', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { S.locName = r.value; save(); render(); } }); else { S.locName = n; save(); render(); if (n === 'Home') JC.ui.toast('“Home”? This is not Childe’s home. It’s yours.', { icon: 'house.fill' }); } } }))) },
          ], footer: 'Childe is sharing his location with ' + S.sharingWith.map((id) => JC.contacts.short(id)).join(' and ') + '.' },
          { header: 'Notifications', rows: [
            { title: 'Allow Friend Requests', toggle: { on: S.friendReq, onChange: (v) => { S.friendReq = v; save(); } } },
            { title: 'Receive Location Updates', toggle: { on: true, onChange: (v) => JC.ui.toast(v ? 'Location updates on' : 'Location updates off') } },
            { title: 'Customize Tracking Notifications', chevron: true, onTap: () => trackingSheet() },
          ] },
          { rows: [
            { title: 'Help a Friend', chevron: true, onTap: () => JC.ui.alert({ title: 'Help a Friend', message: 'A friend can sign in here to find their own lost device. Sign them in with their Apple Account — not Childe’s.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign In', style: 'default', onTap: () => signInFriend() }] }) },
            { title: 'Accessibility: Separation Alerts', chevron: true, onTap: () => trackingSheet() },
          ] }], { cls: 'fm-list' }),
        ];
      }

      // ── detail cards ──
      function openDetail(id) {
        const x = find(id);
        if (!x) return;
        if (x.kind === 'person') tab = 'people'; else if (x.kind === 'device') tab = 'devices'; else tab = 'items';
        Object.keys(tabItems).forEach((k) => tabItems[k].classList.toggle('on', k === tab));
        detail = x;
        JC.story.act('findmy_view', { id: x.id });
        render();
        pins();
        if (x.where) map.flyTo(x.where().at, x.self ? 90 : 110, { duration: 800 });
        sh.set('half');
      }
      function closeDetail() { detail = null; render(); pins(); fitTab(); }
      function dHead(x, sub, sub2) {
        return h('div.fm-dhead', h('div.fm-dmain', h('div.fm-dtitle', dname(x)), h('div.fm-dsub', sub), sub2 ? h('div.fm-dsub2', sub2) : null), h('button.fm-x', { onTap: () => closeDetail(), attrs: { 'aria-label': 'Close' } }, JC.icon('xmark', { size: 15, weight: 2.6 })));
      }
      function actBtn(glyph, label, onTap, o) {
        o = o || {};
        return h('div.fm-act', { class: { disabled: !!o.disabled, on: !!o.on }, onTap: o.disabled ? () => o.why && JC.ui.toast(o.why) : onTap }, h('div.fm-act-ic', { style: o.color ? { background: o.color, color: '#fff' } : null }, JC.icon(glyph, { size: 22 })), h('span', label), o.sub ? h('small', o.sub) : null);
      }
      function renderDetail() {
        const x = detail;
        if (x.kind === 'person') return personDetail(x);
        if (x.kind === 'device') return deviceDetail(x);
        return itemDetail(x);
      }
      function personDetail(p) {
        const S = st();
        const w = p.where ? p.where() : null;
        head.appendChild(dHead(p, w ? w.label : 'Location not available', w ? AGO(w.t) + ' · ' + distTo(w) : null));
        const sharingMine = S.sharingWith.includes(p.id);
        const acts = h('div.fm-acts',
          actBtn('person.crop.circle', 'Contact', () => contactSheet(p.contact)),
          actBtn('car.fill', 'Directions', () => JC.os.open('maps', { directions: w.place }), { disabled: !w, why: 'Location not available', sub: w ? MV().fmtMin((MV().route('me', w.place, 'drive') || { min: 0 }).min) : null }),
          actBtn('bell.fill', 'Notify', () => notifySheet(p), { disabled: !w, why: p.name + ' isn’t sharing a location with you' }));
        const rules = S.rules.filter((r) => r.who === p.id);
        const out = [acts];
        out.push(JC.ui.list([{ header: 'Notifications', rows: rules.map((r) => ({ title: r.text, swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { S.rules = S.rules.filter((q) => q.id !== r.id); save(); render(); } }] })).concat([{ title: 'Add…', tinted: true, onTap: () => notifySheet(p), cls: 'fm-tinted' }]) }], { cls: 'fm-list' }));
        const shareRows = [];
        if (p.started) shareRows.push({ title: 'Wei Wuxian started sharing location with you ' + (U.dayDiff(new Date(p.since), JC.time.date()) === 2 ? '2 days ago' : U.fmtRelative(p.since)) + '.', cls: 'fm-note' });
        shareRows.push({ title: sharingMine ? 'Stop Sharing My Location' : 'Share My Location', destructive: sharingMine, tinted: !sharingMine, onTap: () => (sharingMine ? stopSharing(p) : shareWith(p)) });
        out.push(JC.ui.list([{ rows: shareRows, footer: sharingMine ? p.name + ' can see your location.' : 'You are not sharing your location with ' + p.name + '.' }], { cls: 'fm-list' }));
        out.push(JC.ui.list([{ rows: [
          { title: S.favs.includes(p.id) ? 'Remove ' + p.name + ' from Favorites' : 'Add ' + p.name + ' to Favorites', tinted: true, onTap: () => { if (S.favs.includes(p.id)) S.favs = S.favs.filter((f) => f !== p.id); else S.favs.push(p.id); save(); render(); } },
          w ? { title: 'Edit Location Name', tinted: true, onTap: () => JC.ui.alert({ title: 'Edit Location Name', message: 'Only you will see this name for ' + p.name + '’s current location.', input: { placeholder: w.label.split(',')[0] }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) JC.ui.toast('Saved', { icon: 'checkmark' }); }) } : null,
          { title: 'Remove ' + p.name, destructive: true, onTap: () => JC.ui.alert({ title: 'Remove ' + p.name + '?', message: 'You’ll stop sharing your location with ' + p.name + ' and ' + p.name + ' will be removed from your list.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive' }] }).then((r) => { if (r.index === 1) { S.removed.push(p.id); S.sharingWith = S.sharingWith.filter((q) => q !== p.id); save(); closeDetail(); JC.ui.toast(p.name + ' removed'); } }) },
        ] }], { cls: 'fm-list' }));
        out.forEach((n) => sh.body.appendChild(n));
      }
      function contactSheet(cid) {
        JC.ui.actionSheet({ title: JC.contacts.name(cid), actions: [
          { text: 'Message', icon: 'message.fill', onTap: () => JC.os.open('messages', { thread: cid }) },
          { text: 'Call', icon: 'phone.fill', onTap: () => JC.story.dial(cid) },
          { text: 'FaceTime', icon: 'video.fill', onTap: () => JC.os.open('facetime', { call: cid }) },
          { text: 'Show Contact Card', icon: 'person.crop.circle', onTap: () => JC.os.open('contacts', { contact: cid }) },
        ] });
      }
      function notifySheet(p) {
        const S = st();
        let who = 0, when = 0, where = 0, freq = 0;
        const w = p.where();
        const locs = [w.label.split(',')[0], 'Northland Bank', 'Pier 7'];
        const s = JC.ui.sheet({
          title: 'Add Notification', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Add', onTap: () => {
            const verb = ['arrives at', 'leaves', 'is not at'][when];
            const text = who === 0 ? 'Notify me when ' + p.name + ' ' + verb + ' ' + locs[where] + (freq ? ' (every time)' : '') : 'Notify ' + p.name + ' when I ' + ['arrive at', 'leave', 'am not at'][when] + ' ' + locs[where];
            S.rules.push({ id: U.uid('r'), who: p.id, text });
            save();
            if (who === 1) JC.ui.alert({ title: p.name + ' Will Be Notified', message: p.name + ' will get a notification. From “Childe”.', buttons: [{ text: 'OK' }] });
            render();
          } },
          content: () => [
            h('div.fm-seg', JC.ui.segmented({ items: ['Notify Me', 'Notify ' + p.name.split(' ')[0]], value: who, onChange: (i) => { who = i; } })),
            JC.ui.list([{ header: 'When ' + p.name, rows: ['Arrives', 'Leaves', 'Is Not At'].map((t, i) => ({ title: t, check: when === i, onTap: () => { when = i; s.render(); } })) },
              { header: 'Location', rows: locs.map((t, i) => ({ title: t, subtitle: i === 0 ? 'Current location' : null, check: where === i, onTap: () => { where = i; s.render(); } })).concat([{ title: 'New Location…', tinted: true, onTap: () => JC.ui.toast('Pick a location on the map in Maps, then share it here.') }]) },
              { header: 'Frequency', rows: ['Only Once', 'Every Time'].map((t, i) => ({ title: t, check: freq === i, onTap: () => { freq = i; s.render(); } })) }]),
          ],
        });
      }
      function shareWith(p) {
        JC.ui.actionSheet({ title: 'Share My Location with ' + p.name, message: p.name + ' will be able to see where this iPhone is — right now, Chihu Rock, Liyue Harbor.', actions: [
          { text: 'Share for One Hour', onTap: () => doShare('for one hour') },
          { text: 'Share Until End of Day', onTap: () => doShare('until end of day') },
          { text: 'Share Indefinitely', onTap: () => doShare('indefinitely') },
        ] });
        function doShare(dur) {
          const S = st();
          if (!S.sharingWith.includes(p.id)) S.sharingWith.push(p.id);
          save();
          JC.story.act('findmy_share', { to: p.id, dur });
          JC.ui.toast('Sharing location with ' + p.name + ' ' + dur, { icon: 'location.fill' });
          render();
        }
      }
      function stopSharing(p) {
        JC.ui.alert({ title: 'Stop Sharing My Location?', message: p.name + ' won’t be notified, but will no longer see your location.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Stop Sharing', style: 'destructive' }] }).then((r) => {
          if (r.index !== 1) return;
          const S = st();
          S.sharingWith = S.sharingWith.filter((x) => x !== p.id);
          save();
          JC.story.act('findmy_unshare', { to: p.id });
          render();
        });
      }

      function deviceDetail(d) {
        const w = d.where();
        const lost = d.self && JC.state.d.lost;
        const b = d.battery && d.battery();
        head.appendChild(dHead(d, d.self ? 'This iPhone · ' + w.label : w.label, (w.last ? 'Last seen ' + U.fmtTime(w.t) : AGO(w.t)) + (b != null ? ' · ' + b + '% battery' : '') + (d.self ? '' : ' · ' + distTo(w))));
        const S = st();
        const playing = S.sounds[d.id] && S.sounds[d.id] > Date.now();
        const acts = h('div.fm-acts',
          actBtn('speaker.wave.2.fill', playing ? 'Playing…' : 'Play Sound', () => playSound(d), { on: playing, sub: d.offline ? 'Offline' : null }),
          actBtn('car.fill', 'Directions', () => (d.self ? JC.ui.toast('This iPhone is with you') : JC.os.open('maps', { directions: w.place })), { sub: d.self ? 'With You' : MV().fmtMin((MV().route('me', w.place, 'drive') || { min: 0 }).min) }),
          d.offline ? actBtn('bell.fill', 'Notify', () => { S.notify[d.id] = !S.notify[d.id]; save(); render(); JC.ui.toast(S.notify[d.id] ? 'You’ll be notified when it’s found' : 'Notification off', { icon: 'bell.fill' }); }, { on: S.notify[d.id] }) : null);
        const out = [acts];
        if (lost) {
          out.push(h('div.fm-lostcard',
            h('div.fm-lost-t', JC.icon('lock.fill', { size: 16 }), ' Lost Mode · Activated'),
            h('div.fm-lost-s', 'Activated from a Wangsheng Funeral Parlor computer. This iPhone is locked and shows this message:'),
            h('div.fm-lost-msg', JC.state.d.lost.message || 'This iPhone has been lost.'),
            h('div.fm-lost-call.tap', { onTap: () => JC.story.dial(JC.state.d.lost.contact || 'hq', JC.state.d.lost.phone ? { num: JC.state.d.lost.phone } : undefined) }, JC.icon('phone.fill', { size: 15 }), ' ' + (JC.state.d.lost.phone || 'Call Owner'))));
        }
        out.push(JC.ui.list([{ header: 'Notifications', rows: [
          d.offline ? { title: 'Notify When Found', toggle: { on: !!S.notify[d.id], onChange: (v) => { S.notify[d.id] = v; save(); } } } : { title: 'Notify When Left Behind', subtitle: d.self ? 'Not available for this iPhone' : null, toggle: { on: !!S.notify[d.id], disabled: d.self, onChange: (v) => { S.notify[d.id] = v; save(); if (v) JC.ui.toast('You’ll be notified if you leave it behind'); } } },
        ] }, { header: 'Mark As Lost', rows: [
          { title: lost ? 'Activated' : 'Activate', subtitle: lost ? 'Locked with a message on the Lock Screen' : 'Lock it and display a message with a phone number', tinted: !lost, onTap: () => markLost(d) },
        ] }, { rows: [
          { title: 'Rename This Device', tinted: true, onTap: () => JC.ui.alert({ title: 'Rename', input: { value: dname(d), placeholder: d.name }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { S.names[d.id] = r.value.slice(0, 32); save(); render(); pins(); } }) },
          { title: 'Erase This Device', destructive: true, onTap: () => eraseDevice(d) },
          d.offline ? { title: 'Remove This Device', destructive: true, onTap: () => needPassword('Remove ' + dname(d), 'Removing a device from Find My requires the Apple Account password for tartaglia@northland.sn.') } : null,
        ] }, { header: 'Details', rows: [
          { title: 'Model', detail: d.model },
          { title: 'Owner', detail: 'Childe' },
          d.self ? { title: 'Battery', detail: (b || 0) + '%' } : null,
        ] }], { cls: 'fm-list' }));
        out.forEach((n) => n && sh.body.appendChild(n));
      }
      function itemDetail(it) {
        const w = it.where();
        const S = st();
        head.appendChild(dHead(it, w.label, AGO(w.t) + ' · ' + (w.label === 'With You' ? 'With You' : distTo(w)) + (it.shared ? ' · Shared by Mama' : '')));
        const playing = S.sounds[it.id] && S.sounds[it.id] > Date.now();
        const acts = h('div.fm-acts',
          actBtn('speaker.wave.2.fill', playing ? 'Playing…' : 'Play Sound', () => playSound(it), { on: playing }),
          actBtn('location.north.fill', 'Find', () => precision(it), { color: 'var(--green)', sub: w.label === 'With You' ? 'Nearby' : null }),
          actBtn('car.fill', 'Directions', () => JC.os.open('maps', { directions: w.place }), { sub: w.label === 'With You' ? 'With You' : MV().fmtMin((MV().route('me', w.place, 'drive') || { min: 0 }).min) }));
        const out = [acts];
        out.push(JC.ui.list([{ header: 'Notifications', rows: [
          { title: 'Notify When Left Behind', toggle: { on: !!S.notify[it.id], onChange: (v) => { S.notify[it.id] = v; save(); } } },
          { title: 'Notify When Found', toggle: { on: false, disabled: true, onChange: () => {} }, subtitle: 'Available when the item is out of range' },
        ] }, { header: 'Share This AirTag', rows: it.shared ? [
          { avatar: 'mama', avatarSize: 34, title: 'Mama', subtitle: 'Owner' },
          { avatar: 'me', avatarSize: 34, title: 'Childe', subtitle: 'Shared with you · Dec 2024' },
        ] : [
          { avatar: 'me', avatarSize: 34, title: 'Childe', subtitle: 'Owner' },
          { title: 'Add Person…', tinted: true, onTap: () => JC.ui.alert({ title: 'Share “' + dname(it) + '”?', message: 'Share it with Ekaterina? She already knows where everything is, apparently.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Share', style: 'default', onTap: () => JC.ui.toast('Invitation sent to A-Ling', { icon: 'paperplane.fill' }) }] }) },
        ] }, { header: 'Lost Mode', rows: [
          { title: 'Enable', tinted: true, onTap: () => (it.shared ? JC.ui.alert({ title: 'Only the Owner Can Do This', message: 'Mama owns this AirTag. Only she can turn on Lost Mode for Sir Fang. (Sir Fang is not lost. Sir Fang is exactly where Teucer is.)', buttons: [{ text: 'OK' }] }) : needPassword('Lost Mode', 'Enable Lost Mode for “' + dname(it) + '”? Enter the Apple Account password for tartaglia@northland.sn.')) },
        ] }, { rows: [
          { title: 'Rename Item', tinted: true, onTap: () => (it.shared ? JC.ui.toast('Only Mama can rename Sir Fang') : JC.ui.alert({ title: 'Rename', input: { value: dname(it) }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { S.names[it.id] = r.value.slice(0, 24); save(); render(); pins(); } })) },
          { title: it.shared ? 'Remove Yourself' : 'Remove Item', destructive: true, onTap: () => (it.shared ? JC.ui.alert({ title: 'Remove Yourself?', message: 'You won’t be able to see Sir Fang’s location anymore. Mama would have to share it again — and she would ask why.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onTap: () => JC.ui.toast('Not now. Sir Fang needs supervision.') }] }) : needPassword('Remove Item', 'Removing an AirTag requires the Apple Account password.')) },
        ] }], { cls: 'fm-list' }));
        out.forEach((n) => sh.body.appendChild(n));
      }

      // ── actions ──
      function playSound(x) {
        const S = st();
        if (x.id === 'airpods') {
          JC.ui.alert({ title: 'Play Sound?', message: 'Make sure AirPods aren’t in anyone’s ears. The sound will gradually get louder.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Play', style: 'default', onTap: () => setTimeout(() => (x.offline ? JC.ui.alert({ title: 'AirPods Not Connected', message: 'Childe’s AirPods Pro are out of range. Last seen at Pier 7 at ' + U.fmtTime(JC.time.parse('+0 23:24')) + '. They’ll play a sound if they come back in range.', buttons: [{ text: 'OK' }] }) : JC.ui.toast('Playing Sound on Childe’s AirPods Pro… faint chirping, somewhere on Feiyun Slope.', { icon: 'airpods' })), 400) }] });
          JC.story.act('findmy_sound', { id: x.id });
          return;
        }
        JC.story.act('findmy_sound', { id: x.id });
        S.sounds[x.id] = Date.now() + 8000; save();
        render();
        setTimeout(() => { if (detail && detail.id === x.id) render(); }, 8200);
        if (x.self) {
          const stop = loudSound(6);
          const flash = h('div.fm-flash');
          const scr = document.getElementById('screen');
          (scr || body).appendChild(flash);
          JC.os.island.flash('Playing Sound', 'speaker.wave.2.fill', '#30d158');
          try { JC.audio.haptic(400); } catch (e) { /* ignore */ }
          const off = () => { stop(); flash.remove(); };
          JC.ui.onTap(flash, off);
          setTimeout(off, 6000);
          return;
        }
        const msgs = {
          macbook: ['Playing Sound on ' + dname(x) + '…', 'Sound played in Room 1808 at the Golden Peony. Somewhere a laptop chirped at a sleeping man.'],
          ipad: ['Playing Sound on ' + dname(x) + '…', 'Sound played at Lotus Pier Residence. Old Huang will want to know why the iPad is singing at midnight.'],
          sirfang: ['Playing Sound on Sir Fang…', 'Sir Fang is chirping inside a backpack. Somewhere, a small boy is delighted.'],
          unit3: ['Playing Sound on U3 — G-17…', 'Somewhere out at Guyun, a tag is chirping on a stone pillar. Nobody is there to hear it. (Probably.)'],
          rod: ['Playing Sound on Rod…', 'The rod chirps from the reel. It sounds lonely.'],
          airpods: ['Playing Sound on Childe’s AirPods Pro…', 'Faint chirping — from somewhere on Feiyun Slope. A building with very thick walls.'],
        };
        const m = msgs[x.id] || ['Playing Sound…', 'Sound played.'];
        JC.ui.toast(m[0], { icon: 'speaker.wave.2.fill' });
        setTimeout(() => JC.ui.toast(m[1], { icon: 'checkmark', ms: 3200 }), 2400);
      }
      function precision(it) {
        const w = it.where();
        if (w.label === 'With You') { precisionUI(it, 0.6); return; }
        JC.ui.alert({ title: 'Too Far Away', message: dname(it) + ' is ' + distTo(w) + ' away, near ' + w.label.split(',')[0] + '. Precision Finding works when you’re within about 10 metres. Get directions to go there?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Directions', style: 'default', onTap: () => JC.os.open('maps', { directions: w.place }) }] });
      }
      function precisionUI(it, m) {
        const layer = JC.ui.layer();
        const close = () => v.remove();
        const v = h('div.fm-precise', h('button.fm-pclose', { onTap: close }, JC.icon('xmark', { size: 16, weight: 2.6 })), h('div.fm-pname', dname(it)), h('div.fm-parrow', JC.icon('location.north.fill', { size: 120 })), h('div.fm-pdist', m.toFixed(1) + ' m'), h('div.fm-phint', 'nearby — look down'), h('div.fm-pbtn.tap', { onTap: () => playSound(it) }, JC.icon('speaker.wave.2.fill', { size: 20 }), ' Play Sound'));
        layer.appendChild(v);
      }
      function needPassword(title, message, onFail) {
        const S = st();
        return JC.ui.alert({ title, message, input: { placeholder: 'Apple Account password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return false;
          S.pwTries = (S.pwTries || 0) + 1; save();
          const pw = (r.value || '').trim();
          setTimeout(() => {
            if (pw === JC.world.passcode.code) JC.ui.alert({ title: 'Verification Failed', message: 'That’s the iPhone passcode, not the Apple Account password. Childe is not *that* careless. (Only with the passcode.)', buttons: [{ text: 'OK' }] });
            else if (S.pwTries >= 3) JC.ui.alert({ title: 'Verification Failed', message: 'The Apple Account password you entered is incorrect.\n\nForgot password? A reset code would be sent to Childe’s trusted devices — including his MacBook Pro, which is in Room 1808 with him.', buttons: [{ text: 'OK' }] });
            else JC.ui.alert({ title: 'Verification Failed', message: 'The Apple Account password you entered is incorrect.', buttons: [{ text: 'OK' }] });
            if (onFail) onFail();
          }, 900);
          return false;
        });
      }
      function markLost(d) {
        if (d.self && JC.state.d.lost) {
          JC.ui.alert({ title: 'Lost Mode Is On', message: 'This iPhone was marked as lost from a Wangsheng Funeral Parlor computer. To turn off Lost Mode, the owner has to unlock it — or you could just call him.', buttons: [{ text: 'Not Now', style: 'cancel' }, { text: 'Call Owner', style: 'default', onTap: () => JC.story.dial(JC.state.d.lost.contact || 'hq', JC.state.d.lost.phone ? { num: JC.state.d.lost.phone } : undefined) }] });
          return;
        }
        if (d.self) {
          JC.ui.alert({ title: 'Mark This iPhone As Lost?', message: 'You’re holding it. Lost Mode would lock this iPhone and show the owner’s phone number on the Lock Screen.\n\nIt is lost, though. His office — Northland Bank, Liyue Branch — has a very attentive receptionist.', stack: true, buttons: [{ text: 'Call Lotus Pier HQ', style: 'default', onTap: () => JC.story.dial('hq') }, { text: 'Continue Anyway', onTap: () => lostFlow(d) }, { text: 'Cancel', style: 'cancel' }] });
          return;
        }
        lostFlow(d);
      }
      function lostFlow(d) {
        let step = 0;
        let phone = '+86 555 0716 0000';
        let msg = 'This ' + (d.glyph === 'laptopcomputer' ? 'Mac' : d.glyph === 'ipad' ? 'iPad' : 'iPhone') + ' has been lost. Please call me.';
        const s = JC.ui.sheet({
          title: 'Mark As Lost', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Next', onTap: () => { step++; if (step > 2) { needPassword('Activate Mark As Lost', 'Enter the Apple Account password for tartaglia@northland.sn to lock ' + dname(d) + '.'); return true; } s.render(); s.setTitle(['Mark As Lost', 'Phone Number', 'Message'][step]); return false; } },
          content: () => {
            if (step === 0) return [h('div.fm-flow', h('div.fm-flow-ic', JC.icon('lock.fill', { size: 40 })), h('div.fm-flow-t', 'Mark As Lost'), h('div.fm-flow-s', 'Mark As Lost locks ' + dname(d) + ', displays a message and phone number on its screen, suspends Wallet cards, and keeps tracking its location.'))];
            if (step === 1) return [h('div.fm-flow-s2', 'Enter a phone number where you can be reached. It will be shown on the Lock Screen.'), JC.ui.list([{ rows: [{ custom: JC.ui.input({ value: phone, placeholder: 'Phone number', cls: 'form-field fm-field', kbType: 'num', onInput: (v) => { phone = v; } }) }] }])];
            return [h('div.fm-flow-s2', 'This message will be shown on the Lock Screen with the phone number ' + phone + '.'), JC.ui.list([{ rows: [{ custom: JC.ui.input({ value: msg, placeholder: 'Message', multiline: true, rows: 3, cls: 'form-field fm-field', onInput: (v) => { msg = v; } }) }] }])];
          },
        });
      }
      function eraseDevice(d) {
        JC.ui.alert({ title: 'Erase ' + dname(d) + '?', message: 'All content and settings will be erased. An erased device can’t be located or tracked.' + (d.self ? '\n\nYou would be erasing the iPhone in your hand. And everything on it. Everything.' : ''), buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Erase', style: 'destructive' }] }).then((r) => {
          if (r.index !== 1) return;
          needPassword('Apple Account Password', 'Enter the password for tartaglia@northland.sn to erase ' + dname(d) + '.');
        });
      }
      function addMenu(anchor) {
        if (tab === 'people') JC.ui.menu(anchor, [
          { text: 'Share My Location', icon: 'location.fill', onTap: () => JC.ui.actionSheet({ title: 'Share My Location', actions: ['zl', 'lumine', 'ht', 'mama', 'tonia'].map((cid) => ({ text: JC.contacts.short(cid), onTap: () => { const p = people().find((q) => q.id === cid) || { id: cid, name: JC.contacts.short(cid) }; shareWith(p); } })) }) },
          { text: 'Ask to Follow Location', icon: 'person.badge.plus', onTap: () => JC.ui.actionSheet({ title: 'Ask to Follow', message: 'They’ll get a request from “Childe”.', actions: ['zl', 'ht', 'paimon', 'wn'].map((cid) => ({ text: JC.contacts.short(cid), onTap: () => { JC.story.act('findmy_ask', { to: cid }); JC.ui.toast('Request sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' }); } })) }) },
        ]);
        else if (tab === 'devices') JC.ui.menu(anchor, [{ text: 'Add AirTag', icon: 'airtag', onTap: () => addItem() }, { text: 'Add Other Item', icon: 'plus', onTap: () => addItem() }, '-', { text: 'Identify Found Item', icon: 'magnifyingglass', onTap: () => identifyItem() }]);
        else JC.ui.menu(anchor, [{ text: 'Add AirTag', icon: 'airtag', onTap: () => addItem() }, { text: 'Add Other Item', icon: 'plus', onTap: () => addItem() }, '-', { text: 'Identify Found Item', icon: 'magnifyingglass', onTap: () => identifyItem() }]);
      }
      function addItem() {
        JC.ui.alert({ title: 'Looking for Items…', message: 'Hold an AirTag or a Find My accessory near this iPhone.', buttons: [{ text: 'Cancel', style: 'cancel' }] });
        setTimeout(() => { const a = document.querySelector('.alert'); if (a && /Looking for Items/.test(a.textContent)) { const b = a.querySelector('.alert-btn'); if (b) b.click(); JC.ui.alert({ title: 'No Items Found', message: 'Make sure the item is nearby and in pairing mode.', buttons: [{ text: 'OK' }] }); } }, 3200);
      }
      function identifyItem() {
        JC.ui.alert({ title: 'Identify Found Item', message: 'Hold the top of this iPhone near the item to learn about it.\n\n(Found something that isn’t yours? The kind thing is to return it. Like, say, a phone.)', buttons: [{ text: 'OK' }] });
      }
      function trackingSheet() {
        JC.ui.sheet({ title: 'Tracking Notifications', detent: 'medium', left: { text: 'Done' }, content: () => [JC.ui.list([{ rows: [
          { title: 'AirTag', toggle: { on: true, onChange: () => {} } },
          { title: 'AirPods', toggle: { on: true, onChange: () => {} } },
          { title: 'Other Find My Accessories', toggle: { on: true, onChange: () => {} } },
        ], footer: 'Get notified if an unknown item is found moving with you. (Sir Fang’s AirTag is known. Sir Fang is very known.)' }])] });
      }
      function signInFriend() {
        JC.ui.alert({ title: 'Sign In', message: 'Enter your Apple Account email.', input: { placeholder: 'email@example.com', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Next', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          JC.ui.alert({ title: 'Couldn’t Sign In', message: 'Your account’s devices would appear here. This is a stranger’s phone, though, so maybe don’t sign in to it.', buttons: [{ text: 'OK' }] });
        });
      }

      // live updates
      const offs = [JC.bus.on('lostmode', () => { render(); pins(); }), JC.bus.on('minute', () => { if (!detail) render(); })];

      function handle(it) {
        if (!it) return;
        if (it.id) { openDetail(it.id === 'this' ? 'iphone' : it.id); return; }
        if (it.tab) selectTab(it.tab);
      }
      selectTab('people');
      setTimeout(() => handle(intent0), 60);
      return {
        intent: handle,
        show() { map.resize(); if (!detail) render(); },
        back() { if (detail) { closeDetail(); return true; } return false; },
        destroy() { offs.forEach((f) => f()); map.destroy(); },
      };
    },
  });
})();
