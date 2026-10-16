/* Contacts — the Contacts app and the shared contacts kit (JC.ckit) used by Phone, FaceTime and Mail:
   alphabetical list with an A–Z index scrubber, My Card, search, Lists, contact cards (iOS 17+ posters,
   quick actions, phones/emails/address/birthday/notes/related), editor, new contacts, picker.
   Edits persist in the `contactedits` collection and new contacts in `contactsextra`; both are
   applied to JC.contacts so every app shows the saved names. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;

  JC.icon.add({
    'person.text.rectangle': '<rect x="2.5" y="5" width="19" height="14" rx="3"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5.2 16.2c.6-1.6 1.8-2.4 3.3-2.4s2.7.8 3.3 2.4M14.5 9.5h4.5M14.5 12.5h4.5"/>',
    'location.circle': '<circle cx="12" cy="12" r="9"/><path d="m8 11.6 8-3.6-3.6 8-1-3.4z" fill="currentColor"/>',
    'staroflife': '<path d="M12 3.5v17M4.6 7.75l14.8 8.5M19.4 7.75 4.6 16.25" stroke-width="3" />',
    'hand.raised.slash': '<path d="M8 13.5V6.8a1.4 1.4 0 0 1 2.8 0V11M10.8 10V5.3a1.4 1.4 0 0 1 2.8 0V11M13.6 10V6.3a1.4 1.4 0 0 1 2.8 0v6.2M16.4 10.8a1.4 1.4 0 0 1 2.8 0v3.4c0 3.6-2.6 6.3-6.1 6.3h-.6c-2.2 0-3.6-.9-4.8-2.6L5.3 14.4a1.4 1.4 0 0 1 2.2-1.6L8 13.5"/><path d="M3.5 3.5l17 17"/>',
    'list.bullet.rectangle': '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M10 9h7M10 12h7M10 15h7"/><circle cx="7" cy="9" r=".9" fill="currentColor"/><circle cx="7" cy="12" r=".9" fill="currentColor"/><circle cx="7" cy="15" r=".9" fill="currentColor"/>',
    'birthday.cake': '<path d="M4 20.5h16M5 20.5v-6.2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6.2M5 16c1.2 1 2.4 1 3.5 0s2.4-1 3.5 0 2.4 1 3.5 0 2.3-1 3.5 0M12 12.3V9M12 6.8c-.9-.8-.9-1.8 0-3 .9 1.2.9 2.2 0 3z"/>',
  });

  // ══ Data layer ═══════════════════════════════════════════════════
  const FIELDS = ['first', 'last', 'display', 'company', 'title', 'phones', 'emails', 'bday', 'address', 'notes', 'avatar'];
  const ORIG = {};
  const copy = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
  function snap(c) {
    if (ORIG[c.id]) return;
    const o = {};
    FIELDS.forEach((f) => { o[f] = c[f] === undefined ? undefined : copy(c[f]); });
    ORIG[c.id] = o;
  }
  JC.contacts.all().forEach(snap);
  snap(JC.me);
  const registered = new Set(); // extra contact ids registered with JC.contacts
  const has = (col) => JC.state && JC.state.d && JC.state.d.store;

  function edits() { return has() ? JC.store.all('contactedits') : []; }
  function extras() { return has() ? JC.store.all('contactsextra') : []; }
  function editOf(cid) { return edits().find((e) => e.id === cid) || null; }

  function restoreBase(c) {
    const o = ORIG[c.id];
    if (!o) return;
    FIELDS.forEach((f) => { if (o[f] === undefined) delete c[f]; else c[f] = copy(o[f]); });
  }
  function applyAll() {
    try {
      JC.contacts.all().forEach((c) => { if (!registered.has(c.id)) restoreBase(c); });
      restoreBase(JC.me);
      const ex = extras();
      ex.forEach((x) => {
        let c = JC.contacts.get(x.id);
        if (!c) { c = JC.contacts.def(Object.assign({}, copy(x), { dial: 'voicemail', extra: true })); registered.add(x.id); }
        FIELDS.forEach((f) => { if (x[f] !== undefined) c[f] = copy(x[f]); });
        c.display = displayFrom(c);
        c.avatar = x.avatar ? copy(x.avatar) : autoAvatar(c);
      });
      edits().forEach((e) => {
        const c = e.id === 'me' ? JC.me : JC.contacts.get(e.id);
        if (!c || registered.has(e.id)) return;
        FIELDS.forEach((f) => { if (e[f] !== undefined) c[f] = copy(e[f]); });
        if (!c.display) c.display = [c.first, c.last].filter(Boolean).join(' ') || (c.phones[0] && c.phones[0].num) || 'No Name';
      });
    } catch (err) { console.error('[contacts] apply edits failed', err); }
  }
  function displayFrom(c) { return c.nickname || c.display || [c.first, c.last].filter(Boolean).join(' ') || c.company || (c.phones && c.phones[0] && c.phones[0].num) || 'No Name'; }
  const GRADS = [['#a5abb9', '#858994'], ['#ffd8a8', '#ff922b'], ['#d0ebff', '#4dabf7'], ['#d3f9d8', '#40c057'], ['#e5dbff', '#845ef7'], ['#ffdeeb', '#f06595'], ['#c5f6fa', '#15aabf']];
  function autoAvatar(c) {
    const ini = ((c.first || '')[0] || '') + ((c.last || '')[0] || '');
    const n = JC.voiceBed ? JC.voiceBed.hash(c.id) : 0;
    return { initials: ini || ((c.display || c.company || '#')[0]), grad: GRADS[n % GRADS.length] };
  }

  const isGhost = (cid) => registered.has(cid) && !extras().some((x) => x.id === cid);
  const isHidden = (cid) => { const e = editOf(cid); return !!(e && e.hidden) || isGhost(cid); };
  function get(cid) { if (cid === 'me') return JC.me; return JC.contacts.get(cid); }
  function people(o) {
    o = o || {};
    return JC.contacts.all().filter((c) => !c.service && (o.hidden ? isHidden(c.id) && !isGhost(c.id) : !isHidden(c.id)));
  }
  function name(cid) {
    if (!cid) return 'Unknown';
    if (cid === 'me') return JC.me.display || 'Jiang Cheng';
    const c = JC.contacts.get(cid);
    if (!c) return cid;
    if (isHidden(cid)) return c.phones && c.phones[0] ? JC.callui.fmtNum(c.phones[0].num) : 'Unknown';
    return c.display;
  }
  function findByNumber(num) {
    const k = JC.callui.core(num);
    if (!k || k.length < 5) return null;
    const hit = JC.contacts.all().find((c) => !isHidden(c.id) && (c.phones || []).some((p) => JC.callui.core(p.num) === k));
    return hit ? hit.id : null;
  }
  function labelFor(cid, num) {
    const c = get(cid);
    if (!c || !c.phones) return 'mobile';
    const p = num ? c.phones.find((x) => JC.callui.core(x.num) === JC.callui.core(num)) : c.phones[0];
    return (p && p.label) || (c.phones[0] && c.phones[0].label) || 'mobile';
  }
  function sortKey(c) {
    const s = (c.display || '').replace(/^[^A-Za-z0-9一-鿿]+/, '');
    return s || c.display || '';
  }
  function letterOf(c) {
    const k = sortKey(c);
    const ch = (k[0] || '#').toUpperCase();
    if (/[A-Z]/.test(ch) && /^[A-Za-z]/.test(c.display || '')) return ch;
    return '#';
  }
  function sorted(list) {
    return list.slice().sort((a, b) => {
      const la = letterOf(a), lb = letterOf(b);
      if (la !== lb) return la === '#' ? 1 : lb === '#' ? -1 : la.localeCompare(lb);
      return sortKey(a).localeCompare(sortKey(b), 'en', { sensitivity: 'base' });
    });
  }
  function matches(c, q) {
    q = q.toLowerCase().trim();
    if (!q) return true;
    const hay = [c.display, c.first, c.last, [c.first, c.last].join(' '), [c.last, c.first].join(' '), c.real, c.nick, c.company, c.title, (c.emails || []).map((e) => e.addr).join(' ')].filter(Boolean).join(' ').toLowerCase();
    if (hay.includes(q)) return true;
    const qd = q.replace(/\D/g, '');
    return qd.length >= 3 && (c.phones || []).some((p) => p.num.replace(/\D/g, '').includes(qd));
  }

  // favorites (collection seeded by the Phone app)
  function favs() { return has() ? JC.store.all('phonefavs') : []; }
  function isFav(cid) { return favs().some((f) => f.contact === cid); }
  function addFav(cid, kind, num) {
    JC.store.add('phonefavs', { contact: cid, kind: kind || 'call', num: num || ((get(cid) || {}).phones || [{}])[0].num || '' });
    JC.ui.toast('Added to Favorites', { icon: 'star.fill' });
  }
  function removeFav(cid) {
    favs().filter((f) => f.contact === cid).forEach((f) => JC.store.remove('phonefavs', f.id));
    JC.ui.toast('Removed from Favorites', { icon: 'star' });
  }

  // ── relation labels (data stores "what they are to me" when id === 'me') ──
  const INVERT = { nephew: 'uncle', niece: 'uncle', mother: 'son', father: 'son', sister: 'brother', brother: 'brother', 'brother-in-law': 'brother-in-law', son: 'father', daughter: 'father', spouse: 'spouse' };
  function relations(c) {
    return (c.related || []).map((r) => ({ label: r.id === 'me' ? (INVERT[r.label] || r.label) : r.label, id: r.id }));
  }

  const PLACES = [[/jingshi/i, 'jingshi'], [/hanshi/i, 'hanshi'], [/cloud recesses/i, 'cloud-recesses'], [/koi tower/i, 'koi-tower'], [/unclean realm/i, 'unclean-realm'], [/lotus pier residence/i, 'lp-residence'], [/lotus pier/i, 'lotus-pier'], [/golden peony/i, 'golden-peony'], [/jinxing/i, 'player-home'], [/radish/i, 'radish-farm'], [/lanling international/i, 'lanling-intl'], [/guanyin/i, 'guanyin-temple']];
  function placeFor(addr) { const m = PLACES.find(([re]) => re.test(addr || '')); return m ? m[1] : null; }
  function openMaps(addr) {
    const place = placeFor(addr);
    JC.os.open('maps', place ? { place } : { search: addr });
  }

  function fmtBday(s) {
    if (!s) return '';
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return s;
    return U.MONTHS[+m[2] - 1] + ' ' + +m[3] + ', ' + m[1];
  }
  function nextBday(s) {
    const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const now = JC.time.date();
    let d = new Date(now.getFullYear(), +m[2] - 1, +m[3]);
    if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d = new Date(now.getFullYear() + 1, +m[2] - 1, +m[3]);
    return d.getTime();
  }

  // ══ Actions ══════════════════════════════════════════════════════
  function call(cid, o) {
    o = o || {};
    const c = get(cid);
    if (!c || !c.phones || !c.phones.length) { JC.ui.toast('No phone number', { icon: 'phone.fill' }); return; }
    JC.callui.dial(cid, { num: o.num || c.phones[0].num, video: !!o.video, ft: !!o.ft });
  }
  function callMenu(cid, anchor, o) {
    o = o || {};
    const c = get(cid);
    if (!c || !c.phones || !c.phones.length) { JC.ui.toast('No phone number', { icon: 'phone.fill' }); return; }
    if (c.phones.length === 1 && !o.always) { call(cid, { num: c.phones[0].num, video: o.video }); return; }
    const items = c.phones.map((p) => ({ text: p.label, sub: JC.callui.fmtNum(p.num), icon: 'phone.fill', onTap: () => call(cid, { num: p.num }) }));
    items.push('-', { text: 'FaceTime Audio', icon: 'phone.fill', onTap: () => call(cid, { ft: true }) });
    JC.ui.menu(anchor, items, { title: o.title });
  }
  function message(cid) {
    if (cid === 'me') { JC.ui.toast('You can’t message yourself', { icon: 'message.fill' }); return; }
    JC.os.open('messages', { thread: JC.story.threadFor(cid) });
  }
  function mail(addr, o) {
    JC.os.open('mail', { compose: Object.assign({ to: addr }, o || {}) });
  }
  function facetime(cid, audio) { call(cid, audio ? { ft: true } : { video: true }); }
  function share(cid) {
    const c = get(cid);
    if (!c) return;
    const lines = [name(cid)].concat((c.phones || []).map((p) => p.label + ': ' + p.num), (c.emails || []).map((e) => e.label + ': ' + e.addr));
    JC.ui.share({ title: name(cid), subtitle: 'Contact Card', icon: 'person.text.rectangle', payload: { kind: 'text', text: lines.join('\n') } });
  }
  function block(cid) {
    const nm = name(cid);
    JC.ui.alert({
      title: 'Block ' + nm + '?',
      message: 'You will not receive phone calls, messages, or FaceTime from people on the block list.',
      buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Block Contact', style: 'destructive' }],
    }).then((r) => {
      if (r.index !== 1) return;
      try { JC.story.act('contact_block', { id: cid, name: nm }); } catch (e) { /* ignore */ }
      setTimeout(() => JC.ui.alert({
        title: 'Couldn’t Block Contact',
        message: (cid === 'wwx'
          ? 'This contact has been blocked and unblocked 14 times since March 2023. '
          : '') + 'Blocking is restricted on this iPhone by Yunmeng Jiang Group. Contact your IT department (Tang Mei).',
        buttons: [{ text: 'OK' }],
      }), 280);
    });
  }
  function favMenu(cid, anchor) {
    const c = get(cid);
    if (isFav(cid)) { removeFav(cid); return; }
    const items = [];
    (c.phones || []).forEach((p) => items.push({ text: 'Call', sub: p.label + ' · ' + JC.callui.fmtNum(p.num), icon: 'phone.fill', onTap: () => addFav(cid, 'call', p.num) }));
    if ((c.phones || []).length) {
      items.push({ text: 'Message', icon: 'message.fill', onTap: () => addFav(cid, 'message') });
      items.push({ text: 'FaceTime Video', icon: 'video.fill', onTap: () => addFav(cid, 'video') });
    }
    if ((c.emails || []).length) items.push({ text: 'Mail', icon: 'envelope.fill', onTap: () => addFav(cid, 'mail', c.emails[0].addr) });
    if (!items.length) { JC.ui.toast('Nothing to add', { icon: 'star' }); return; }
    JC.ui.menu(anchor, items, { title: 'Add to Favorites' });
  }

  // auto-unsubscribing store listener bound to a page/sheet element
  function live(elFn, cols, fn) {
    const offs = [];
    const run = () => {
      const el = elFn();
      if (el && !el.isConnected) { offs.forEach((o) => o()); return; }
      fn();
    };
    cols.forEach((c) => offs.push(c.startsWith('bus:') ? JC.bus.on(c.slice(4), run) : JC.store.on(c, run)));
    return () => offs.forEach((o) => o());
  }

  // ══ List page ════════════════════════════════════════════════════
  const LISTS = [
    { id: 'all', title: 'All Contacts', icon: 'person.2.fill' },
    { id: 'family', title: 'Family', icon: 'house.fill', ids: ['wwx', 'jl', 'ajie', 'mom', 'dad', 'lwj'] },
    { id: 'friends', title: 'Friends', icon: 'person.2.fill', ids: ['nhs', 'wn', 'mian', 'lxc', 'sz', 'jy'] },
    { id: 'work', title: 'Yunmeng Jiang Group', icon: 'briefcase.fill', ids: ['ea', 'huang', 'liu', 'bai', 'hq'] },
    { id: 'gusu', title: 'Gusu', icon: 'leaf.fill', ids: ['lxc', 'lwj', 'sz', 'jy', 'qr'] },
  ];

  /** contacts list page. o: { title, nav, me, picker, onPick, left, right, footer } */
  function listPage(o) {
    o = o || {};
    let q = '';
    let listId = 'all';
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
    const index = h('div.ct-index', LETTERS.map((l) => h('div.ct-ix', { data: { l } }, l)));
    const right = o.right || [JC.ui.navBtn({ icon: 'plus', label: 'New Contact', onTap: () => editor(null, { onSave: (id) => page.nav && page.nav.push(cardPage(id)) }) })];
    const left = o.left || [JC.ui.navBtn({ text: 'Lists', onTap: () => listsSheet() })];
    const page = JC.ui.page({
      title: o.title || 'Contacts',
      large: true,
      bg: 'plain',
      cls: 'ct-listpage' + (o.cls ? ' ' + o.cls : ''),
      left,
      right,
      search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); }, onCancel: () => { q = ''; page.render(); } },
      content: () => content(),
      onShow: () => page.render(),
    });
    page.el.appendChild(index);
    function base() {
      let list = people();
      const L = LISTS.find((x) => x.id === listId);
      if (L && L.ids) list = list.filter((c) => L.ids.includes(c.id));
      if (listId === 'deleted') list = people({ hidden: true });
      return list;
    }
    function row(c) {
      return {
        title: h('span.ct-rowname', nameNode(c)),
        cls: 'ct-row',
        onTap: () => (o.onPick ? o.onPick(c.id) : page.nav.push(cardPage(c.id))),
        menu: o.onPick ? null : () => ({ items: [
          { text: 'Call', icon: 'phone.fill', onTap: () => call(c.id) },
          { text: 'Message', icon: 'message.fill', onTap: () => message(c.id) },
          { text: 'FaceTime', icon: 'video.fill', onTap: () => facetime(c.id) },
          '-',
          { text: 'Share Contact', icon: 'square.and.arrow.up', onTap: () => share(c.id) },
          { text: isFav(c.id) ? 'Remove from Favorites' : 'Add to Favorites', icon: 'star', onTap: () => (isFav(c.id) ? removeFav(c.id) : addFav(c.id, 'call')) },
        ] }),
      };
    }
    function content() {
      const out = [];
      const list = sorted(base().filter((c) => matches(c, q)));
      index.hidden = !!q || list.length < 8;
      if (q) {
        if (!list.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'No contacts match “' + q + '”.' })];
        return [h('div.ct-tophits', 'Top Name Matches'), JC.ui.list([{ rows: list.map(row) }], { style: 'plain', cls: 'ct-plain' })];
      }
      if (o.me !== false && listId === 'all') {
        out.push(h('div.ct-me', { onTap: () => (o.onPick ? o.onPick('me') : page.nav.push(cardPage('me'))) },
          JC.ui.avatar('me', 64),
          h('div.ct-me-main', h('div.ct-me-name', name('me')), h('div.ct-me-sub', 'My Card'))));
      }
      if (listId !== 'all') {
        const L = LISTS.find((x) => x.id === listId) || { title: 'Recently Deleted' };
        out.push(h('div.ct-listbanner', JC.icon(L.icon || 'trash', { size: 15 }), h('span', L.title), h('span.ct-listx', { onTap: () => { listId = 'all'; page.setTitle(o.title || 'Contacts'); page.render(); } }, 'Show All')));
      }
      if (listId === 'deleted') {
        if (!list.length) out.push(JC.ui.empty({ icon: 'trash', title: 'No Recently Deleted Contacts' }));
        else out.push(JC.ui.list([{ footer: 'Deleted contacts can be recovered here.', rows: list.map((c) => ({ title: c.display, cls: 'ct-row', onTap: () => {
          JC.ui.actionSheet({ title: c.display, actions: [{ text: 'Recover Contact', onTap: () => { JC.store.update('contactedits', c.id, { hidden: false }); JC.ui.toast('Contact recovered', { icon: 'checkmark' }); } }] });
        } })) }], { style: 'plain', cls: 'ct-plain' }));
        return out;
      }
      const groups = {};
      list.forEach((c) => { const l = letterOf(c); (groups[l] = groups[l] || []).push(c); });
      const secs = LETTERS.filter((l) => groups[l]).map((l) => ({ header: l, cls: 'ct-sec', rows: groups[l].map(row) }));
      const lst = JC.ui.list(secs, { style: 'plain', cls: 'ct-plain' });
      Array.from(lst.querySelectorAll('.section')).forEach((s, i) => { s.dataset.l = secs[i].header; });
      out.push(lst);
      out.push(h('div.ct-count', list.length + (list.length === 1 ? ' Contact' : ' Contacts')));
      index.querySelectorAll('.ct-ix').forEach((x) => x.classList.toggle('dim', !groups[x.dataset.l]));
      return out;
    }
    // A–Z scrubber
    let lastL = null;
    const jump = (clientY) => {
      const kids = Array.from(index.children);
      let hit = null;
      kids.forEach((k) => { const r = k.getBoundingClientRect(); if (clientY >= r.top - 1 && clientY <= r.bottom + 1) hit = k; });
      if (!hit) {
        const first = kids[0].getBoundingClientRect(), last = kids[kids.length - 1].getBoundingClientRect();
        hit = clientY < first.top ? kids[0] : clientY > last.bottom ? kids[kids.length - 1] : null;
      }
      if (!hit) return;
      const l = hit.dataset.l;
      if (l === lastL) return;
      lastL = l;
      let i = LETTERS.indexOf(l);
      let sec = null;
      for (let k = i; k < LETTERS.length && !sec; k++) sec = page.content.querySelector(`.section[data-l="${LETTERS[k]}"]`);
      for (let k = i; k >= 0 && !sec; k--) sec = page.content.querySelector(`.section[data-l="${LETTERS[k]}"]`);
      if (!sec) return;
      const sc = JC.os.scale || 1;
      const top = (sec.getBoundingClientRect().top - page.scroll.getBoundingClientRect().top) / sc + page.scroll.scrollTop - 106;
      page.scroll.scrollTop = Math.max(0, top);
      JC.audio.haptic(4);
      JC.audio.play('tap');
      index.querySelectorAll('.ct-ix').forEach((x) => x.classList.toggle('on', x === hit));
    };
    index.__tap = true;
    index.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      lastL = null;
      index.classList.add('active');
      jump(e.clientY);
      const mv = (ev) => jump(ev.clientY);
      const up = () => {
        index.classList.remove('active');
        index.querySelectorAll('.ct-ix.on').forEach((x) => x.classList.remove('on'));
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
    });
    function listsSheet() {
      const hiddenN = people({ hidden: true }).length;
      const s = JC.ui.sheet({
        title: 'Lists', detent: 'large', cls: 'ct-sheet', left: { text: 'Done' },
        right: { icon: 'plus', bold: false, onTap: () => { JC.ui.alert({ title: 'New List', message: 'Lists are synced with Jiang Cheng’s iCloud account and can only be created on his Mac.', buttons: [{ text: 'OK' }] }); return false; } },
        content: () => [JC.ui.list([
          { header: 'iCloud', rows: LISTS.map((L) => ({
            icon: { glyph: L.icon, bg: L.id === 'all' ? 'var(--gray)' : L.id === 'family' ? 'var(--orange)' : L.id === 'work' ? 'var(--indigo)' : L.id === 'gusu' ? 'var(--teal)' : 'var(--blue)' },
            title: L.title, detail: String(L.ids ? people().filter((c) => L.ids.includes(c.id)).length : people().length), check: listId === L.id,
            onTap: () => { listId = L.id; page.setTitle(L.id === 'all' ? (o.title || 'Contacts') : L.title); page.render(); s.close(); },
          })) },
          { rows: [{ icon: { glyph: 'trash', bg: 'var(--red)' }, title: 'Recently Deleted', detail: String(hiddenN), check: listId === 'deleted', onTap: () => { listId = 'deleted'; page.setTitle('Recently Deleted'); page.render(); s.close(); } }] },
        ])],
      });
    }
    live(() => page.el, ['contactedits', 'contactsextra', 'phonefavs'], () => page.render());
    page.reset = () => { q = ''; listId = 'all'; page.setTitle(o.title || 'Contacts'); page.render(); };
    return page;
  }
  function nameNode(c) {
    // bold the surname when the saved name is "First Last" (iOS sort-by-last-name look)
    const full = [c.first, c.last].filter(Boolean).join(' ');
    if (c.last && c.display === full) return [h('span', c.first + ' '), h('b', c.last)];
    if (c.last && c.display === c.last + ' ' + c.first) return [h('b', c.last), h('span', ' ' + c.first)];
    return [h('b', c.display)];
  }

  // ══ Contact card ═════════════════════════════════════════════════
  function hero(cid, c, o) {
    const sp = c.avatar || {};
    const art = sp.art && JC.art.has(sp.art);
    const g = sp.grad || ['#a5abb9', '#858994'];
    const title = name(cid);
    const subBits = [];
    const full = cid === 'me' ? '' : (editOf(cid) || c.extra ? [c.first, c.last].filter(Boolean).join(' ') : (c.real || [c.first, c.last].filter(Boolean).join(' ')));
    if (full && full !== title && !isHidden(cid)) subBits.push(full + (c.nick && c.nick !== title ? ' · ' + c.nick : ''));
    if (c.title || c.company) subBits.push([c.title, c.company].filter(Boolean).join(' — '));
    const qa = quickActions(cid, c, false);
    const el = h('div.ct-herowrap', { class: { art }, style: { '--g0': g[0], '--g1': g[1] } },
      art ? null : h('div.ct-hero-wash'),
      h('div.ct-hero', { class: { art } },
        art ? JC.art.el(sp.art, { cls: 'ct-hero-art' }) : null,
        art ? h('div.ct-hero-fade') : null,
        h('div.ct-hero-in',
          art ? null : JC.ui.avatar(cid === 'me' ? 'me' : cid, 108),
          h('div.ct-hero-name', title),
          subBits.length ? h('div.ct-hero-sub', subBits.map((b) => h('div', b))) : null)),
      qa);
    return el;
  }
  function quickActions(cid, c, glass) {
    const phones = (c.phones || []).length;
    const emails = (c.emails || []).length;
    const b = (icon, label, ok, fn) => h('div.ct-qa', { class: { off: !ok, glass }, onTap: (e) => { if (!ok) { JC.audio.play('tap'); return; } fn(e); } }, JC.icon(icon, { size: 20 }), h('div.ct-qa-l', label));
    if (cid === 'me') {
      return h('div.ct-qas',
        b('message.fill', 'message', false, () => {}),
        b('phone.fill', 'call', false, () => {}),
        b('video.fill', 'video', false, () => {}),
        b('envelope.fill', 'mail', emails > 0, () => mail(c.emails[0].addr)));
    }
    return h('div.ct-qas',
      b('message.fill', 'message', phones > 0, () => message(cid)),
      b('phone.fill', 'call', phones > 0, (e) => callMenu(cid, e.currentTarget)),
      b('video.fill', 'video', phones > 0, (e) => {
        if (phones > 1) JC.ui.menu(e.currentTarget, [{ text: 'FaceTime Video', icon: 'video.fill', onTap: () => facetime(cid) }, { text: 'FaceTime Audio', icon: 'phone.fill', onTap: () => facetime(cid, true) }]);
        else facetime(cid);
      }),
      b('envelope.fill', 'mail', emails > 0, (e) => {
        if (emails > 1) JC.ui.menu(e.currentTarget, c.emails.map((m) => ({ text: m.label, sub: m.addr, icon: 'envelope.fill', onTap: () => mail(m.addr) })));
        else mail(c.emails[0].addr);
      }));
  }
  function field(label, value, o) {
    o = o || {};
    const node = h('div.ct-field', { class: { tint: !!o.tint, multi: !!o.multi } },
      h('div.ct-fmain', h('div.ct-flabel', label), h('div.ct-fvalue', value)),
      o.right || null);
    if (o.onTap) JC.ui.onTap(node, o.onTap);
    if (o.menu) JC.ui.contextMenu(node, o.menu);
    return { custom: node };
  }
  function callWord(r) {
    if (r.dir === 'missed') return r.video ? 'Missed FaceTime' : 'Missed Call';
    if (r.dir === 'out') return (r.video ? 'Outgoing FaceTime' : r.ft ? 'FaceTime Audio' : 'Outgoing Call') + (r.dur ? '' : ' · No Answer');
    return r.video ? 'Incoming FaceTime' : r.ft ? 'FaceTime Audio' : 'Incoming Call';
  }
  function durWords(sec) {
    if (!sec) return '';
    if (sec < 60) return sec + (sec === 1 ? ' second' : ' seconds');
    const m = Math.round(sec / 60);
    if (m < 60) return m + (m === 1 ? ' minute' : ' minutes');
    const hh = Math.floor(m / 60), mm = m % 60;
    return hh + (hh === 1 ? ' hour' : ' hours') + (mm ? ' ' + mm + ' min' : '');
  }
  function historySection(o) {
    if (!o.calls || !o.calls.length) return null;
    const all = JC.store.all('calls');
    const rs = o.calls.map((id) => all.find((x) => x.id === id)).filter(Boolean).sort((a, b) => b.t - a.t);
    if (!rs.length) return null;
    const d = new Date(rs[0].t);
    const n = JC.time.date();
    const head = U.sameDay(d, n) ? 'Today' : U.dayDiff(d, n) === 1 ? 'Yesterday' : U.fmtDate(d, 'long');
    return { header: head, cls: 'ct-hist', rows: rs.map((r) => ({ custom: h('div.ct-hrow', h('div.ct-htime', U.fmtTime(r.t)), h('div.ct-hkind', { class: { missed: r.dir === 'missed' } }, callWord(r)), h('div.ct-hdur', durWords(r.dur))) })) };
  }

  /** contact card. o: { calls: [callIds], num } */
  function cardPage(cid, o) {
    o = o || {};
    let page;
    const isMe = cid === 'me';
    page = JC.ui.page({
      title: '',
      bg: 'grouped',
      cls: 'ct-cardpage',
      right: [JC.ui.navBtn({ text: 'Edit', onTap: () => editor(cid, {}) })],
      onScroll: (y, p) => { p.setTitle(y > 230 ? name(cid) : ''); p.el.classList.toggle('scrolled', y > 230); },
      content: (pg) => {
        const c = get(cid);
        if (!c) return [JC.ui.empty({ icon: 'person.crop.circle', title: 'Contact Not Found' })];
        pg.el.classList.toggle('art', !!(c.avatar && c.avatar.art && JC.art.has(c.avatar.art)));
        const secs = [];
        const hist = historySection(o);
        if (hist) secs.push(hist);
        if (isMe) secs.push({ rows: [{ icon: { glyph: 'person.crop.circle.fill', bg: 'var(--purple)' }, title: 'Contact Photo & Poster', chevron: true, onTap: () => posterSheet() }] });
        const phones = c.phones || [];
        if (phones.length) secs.push({ rows: phones.map((p) => field(p.label || 'phone', JC.callui.fmtNum(p.num), {
          tint: !isMe,
          onTap: isMe ? null : () => call(cid, { num: p.num }),
          menu: () => ({ items: [
            !isMe ? { text: 'Call', icon: 'phone.fill', onTap: () => call(cid, { num: p.num }) } : null,
            !isMe ? { text: 'Send Message', icon: 'message.fill', onTap: () => message(cid) } : null,
            !isMe ? { text: 'FaceTime', icon: 'video.fill', onTap: () => facetime(cid) } : null,
            { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(p.num); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
          ] }),
        })) });
        if (!isMe && phones.length) secs.push({ rows: [{ custom: h('div.ct-field.ft', h('div.ct-fmain', h('div.ct-fvalue.plain', 'FaceTime')),
          h('div.ct-ftbtns',
            h('div.ct-ftb', { onTap: () => facetime(cid), attrs: { 'aria-label': 'FaceTime Video' } }, JC.icon('video.fill', { size: 20 })),
            h('div.ct-ftb', { onTap: () => facetime(cid, true), attrs: { 'aria-label': 'FaceTime Audio' } }, JC.icon('phone.fill', { size: 19 })))) }] });
        const emails = c.emails || [];
        if (emails.length) secs.push({ rows: emails.map((m) => field(m.label || 'email', m.addr, { tint: true, onTap: () => mail(m.addr), menu: () => ({ items: [{ text: 'New Message', icon: 'envelope.fill', onTap: () => mail(m.addr) }, { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(m.addr); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }] }) })) });
        const addr = c.address || (isMe ? 'Lotus Pier Residence, Yunmeng' : null);
        if (addr) secs.push({ rows: [field(isMe ? 'home' : 'home', addr, { tint: true, multi: true, onTap: () => openMaps(addr), right: h('div.ct-mapthumb', JC.icon('map.fill', { size: 20 })) })] });
        if (c.bday) secs.push({ rows: [field('birthday', fmtBday(c.bday), { onTap: () => { const t = nextBday(c.bday); JC.os.open('calendar', t ? { date: t } : {}); } })] });
        if (c.notes) secs.push({ rows: [field('Notes', c.notes, { multi: true, onTap: () => editor(cid, { focus: 'notes' }) })] });
        const rel = relations(c);
        if (rel.length) secs.push({ rows: rel.map((r) => field(r.label, name(r.id), { tint: true, onTap: () => page.nav.push(cardPage(r.id)) })) });
        if (isMe) {
          secs.push({ rows: [
            { title: 'Share Contact', tinted: true, onTap: () => share('me') },
            { title: 'Medical ID', tinted: true, onTap: () => medicalSheet() },
          ] });
        } else {
          secs.push({ rows: [
            { title: 'Send Message', tinted: true, onTap: () => message(cid) },
            { title: 'Share Contact', tinted: true, onTap: () => share(cid) },
            { title: isFav(cid) ? 'Remove from Favorites' : 'Add to Favorites', tinted: true, onTap: (e) => favMenu(cid, e.currentTarget) },
            { title: 'Add to Emergency Contacts', tinted: true, onTap: () => emergency(cid) },
            { title: 'Share My Location', tinted: true, onTap: () => JC.ui.alert({ title: 'Share My Location', message: 'Location sharing for this iPhone is managed in Find My.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Find My', style: 'default', onTap: () => JC.os.open('findmy', { tab: 'people' }) }] }) },
          ] });
          secs.push({ rows: [{ title: 'Block this Caller', destructive: true, onTap: () => block(cid) }] });
          if (c.extra) secs.push({ rows: [{ title: 'Delete Contact', destructive: true, onTap: () => del(cid, page) }] });
        }
        return [hero(cid, c, o), JC.ui.list(secs, { cls: 'ct-cardlist' })];
      },
    });
    live(() => page.el, ['contactedits', 'contactsextra', 'phonefavs', 'calls'], () => page.render());
    return page;
  }

  function emergency(cid) {
    if (cid === 'ajie' || cid === 'jl') {
      JC.ui.alert({ title: name(cid), message: 'Already an emergency contact in Medical ID.', buttons: [{ text: 'OK' }] });
      return;
    }
    JC.ui.alert({ title: 'Add to Emergency Contacts', message: 'Emergency contacts are kept in Medical ID, in the Health app.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Health', style: 'default', onTap: () => JC.os.open('health') }] });
  }
  function del(cid, page) {
    JC.ui.actionSheet({
      title: 'Delete “' + name(cid) + '”?',
      actions: [{ text: 'Delete Contact', style: 'destructive', onTap: () => {
        if (registered.has(cid) && extras().some((x) => x.id === cid)) JC.store.remove('contactsextra', cid);
        else JC.store.add('contactedits', Object.assign({ id: cid }, editOf(cid) || {}, { hidden: true }));
        favs().filter((f) => f.contact === cid).forEach((f) => JC.store.remove('phonefavs', f.id));
        const was = name(cid);
        applyAll();
        if (page && page.nav) page.nav.pop();
        try { JC.story.act('contact_delete', { id: cid, name: was }); } catch (e) { /* ignore */ }
        JC.ui.toast('Contact deleted', { icon: 'trash' });
      } }],
    });
  }
  function posterSheet() {
    JC.ui.sheet({
      title: 'Contact Photo & Poster', detent: 'medium', cls: 'ct-sheet', left: { text: 'Done' },
      content: () => [h('div.ct-posterprev', JC.ui.avatar('me', 92), h('div.ct-pp-name', 'Jiang Cheng'), h('div.ct-pp-t', 'Name & Photo Sharing: Contacts Only')),
        JC.ui.list([{ footer: 'Jiang Cheng chose this poster in 2023 and has never changed it.', rows: [
          { title: 'Edit', tinted: true, onTap: () => JC.ui.alert({ title: 'Edit Poster', message: 'You’d be changing how Jiang Cheng appears on everyone’s phone. Better not.', buttons: [{ text: 'Leave It' }] }) },
        ] }])],
    });
  }
  function medicalSheet() {
    const row = (k, v) => h('div.ct-mid-row', h('div.ct-mid-k', k), h('div.ct-mid-v', v));
    JC.ui.sheet({
      title: 'Medical ID', detent: 'large', cls: 'ct-sheet ct-medsheet', left: { text: 'Done' },
      content: () => [
        h('div.ct-mid-person', JC.ui.avatar('me', 60), h('div', h('div.ct-mid-name', 'Jiang Cheng'), h('div.ct-mid-age', '15 May 1992 (34 years)'))),
        h('div.ct-mid-card',
          row('Medical Conditions', 'Liver transplant recipient (2008).'),
          row('Medical Notes', 'Immunosuppressed. Do not give him alcohol. (He will not listen.) — A-Ling'),
          row('Medications', 'Tacrolimus 2 mg, twice daily.'),
          row('Blood Type', 'O+'),
          row('Organ Donor', 'Yes')),
        h('div.ct-mid-sec', 'Emergency Contacts'),
        h('div.ct-mid-card',
          row('sister', 'A-Jie 🪷'),
          row('nephew', 'A-Ling')),
        h('div.ct-mid-foot', 'Medical ID is visible while iPhone is locked.'),
      ],
    });
  }

  /** card for a number that isn't in Contacts. o: { calls, name, label } */
  function numberPage(num, o) {
    o = o || {};
    const fmt = JC.callui.fmtNum(num);
    const biz = JC.callui.bizFor(num);
    const title = o.name || (biz && biz.name) || fmt;
    const page = JC.ui.page({
      title: '', bg: 'grouped', cls: 'ct-cardpage',
      onScroll: (y, p) => p.setTitle(y > 200 ? title : ''),
      content: () => {
        const qa = h('div.ct-qas',
          h('div.ct-qa.off', JC.icon('message.fill', { size: 20 }), h('div.ct-qa-l', 'message')),
          h('div.ct-qa', { onTap: () => JC.callui.dialNumber(num) }, JC.icon('phone.fill', { size: 20 }), h('div.ct-qa-l', 'call')),
          h('div.ct-qa.off', JC.icon('video.fill', { size: 20 }), h('div.ct-qa-l', 'video')),
          h('div.ct-qa.off', JC.icon('envelope.fill', { size: 20 }), h('div.ct-qa-l', 'mail')));
        const top = h('div.ct-herowrap', { style: { '--g0': '#b5b5bd', '--g1': '#8e8e96' } }, h('div.ct-hero-wash'),
          h('div.ct-hero', h('div.ct-hero-in', blankAvatar(108), h('div.ct-hero-name', title), biz || o.name ? h('div.ct-hero-sub', h('div', 'Maybe: ' + title + ' · found in Mail')) : null)),
          qa);
        const secs = [];
        const hist = historySection(o);
        if (hist) secs.push(hist);
        secs.push({ rows: [field(o.label || (biz && biz.label) || 'phone', fmt, { tint: true, onTap: () => JC.callui.dialNumber(num), menu: () => ({ items: [{ text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(fmt); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }] }) })] });
        secs.push({ rows: [
          { title: 'Create New Contact', tinted: true, onTap: () => editor(null, { prefill: { first: biz ? biz.name : '', phones: [{ label: biz ? 'work' : 'mobile', num: fmt }] }, onSave: (id) => page.nav.replace(cardPage(id)) }) },
          { title: 'Add to Existing Contact', tinted: true, onTap: () => addToExisting(num, (id) => page.nav.replace(cardPage(id))) },
          { title: 'Share Contact', tinted: true, onTap: () => JC.ui.share({ title, subtitle: fmt, icon: 'person.text.rectangle', payload: { kind: 'text', text: title + '\n' + fmt } }) },
        ] });
        secs.push({ rows: [{ title: 'Block this Caller', destructive: true, onTap: () => JC.ui.alert({ title: 'Couldn’t Block Caller', message: 'Blocking is restricted on this iPhone by Yunmeng Jiang Group. Contact your IT department (Tang Mei).', buttons: [{ text: 'OK' }] }) }] });
        return [top, JC.ui.list(secs, { cls: 'ct-cardlist' })];
      },
    });
    live(() => page.el, ['calls'], () => page.render());
    return page;
  }
  function addToExisting(num, done) {
    picker({ title: 'Add to Contact', onPick: (cid) => {
      const c = get(cid);
      if (!c) return;
      editor(cid, { addPhone: { label: 'other', num: JC.callui.fmtNum(num) }, onSave: done });
    } });
  }

  // ══ Picker ═══════════════════════════════════════════════════════
  /** o: { title, onPick(cid), filter(c), detail(c) } */
  function picker(o) {
    o = o || {};
    let q = '';
    const s = JC.ui.sheet({
      title: o.title || 'Contacts', detent: 'large', cls: 'ct-sheet ct-picker', left: { text: 'Cancel' },
      content: () => {
        const search = JC.ui.search({ placeholder: 'Search', onInput: (v) => { q = v; draw(); } });
        const body = h('div.ct-pickbody');
        function draw() {
          const l2 = sorted(people().filter((c) => (!o.filter || o.filter(c)) && matches(c, q)));
          body.innerHTML = '';
          if (!l2.length) { body.appendChild(JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results' })); return; }
          const groups = {};
          l2.forEach((c) => { const l = q ? ' ' : letterOf(c); (groups[l] = groups[l] || []).push(c); });
          body.appendChild(JC.ui.list(Object.keys(groups).map((l) => ({ header: l.trim() || null, rows: groups[l].map((c) => ({
            title: h('span.ct-rowname', nameNode(c)), subtitle: o.detail ? o.detail(c) : null, cls: 'ct-row',
            onTap: () => { s.close(); setTimeout(() => o.onPick && o.onPick(c.id), 120); },
          })) })), { style: 'plain', cls: 'ct-plain' }));
        }
        draw();
        return [h('div.ct-picksearch', search), body];
      },
    });
    return s;
  }

  // ══ Editor ═══════════════════════════════════════════════════════
  const PHONE_LABELS = ['mobile', 'iPhone', 'home', 'work', 'main', 'school', 'other'];
  const EMAIL_LABELS = ['home', 'work', 'school', 'iCloud', 'other'];

  /** edit (cid) or create (cid null). o: { prefill, addPhone, focus, onSave(cid) } */
  function editor(cid, o) {
    o = o || {};
    const isNew = !cid;
    const c = isNew ? null : get(cid);
    if (!isNew && !c) return null;
    const base = c || {};
    const full = [base.first, base.last].filter(Boolean).join(' ');
    // what the card said when the editor opened (the contact object itself is updated in place on save)
    const was = { display: base.display, first: base.first, last: base.last, company: base.company, title: base.title, notes: base.notes, bday: base.bday, address: base.address };
    const m = {
      first: base.first || '', last: base.last || '',
      nickname: base.display && base.display !== full ? base.display : '',
      company: base.company || '', title: base.title || '',
      phones: copy(base.phones || []), emails: copy(base.emails || []),
      address: base.address || '', bday: base.bday || '', notes: base.notes || '',
      avatar: copy(base.avatar || null),
    };
    if (o.prefill) Object.assign(m, copy(o.prefill));
    if (o.addPhone) m.phones.push(copy(o.addPhone));
    if (isNew && !m.phones.length) m.phones = [];
    let s;
    const input = (key, ph, extra) => JC.ui.input(Object.assign({ placeholder: ph, value: m[key] || '', cls: 'ct-in', onInput: (v) => { m[key] = v; validate(); } }, extra || {}));
    function validate() {
      const ok = !!(m.first.trim() || m.last.trim() || m.nickname.trim() || m.company.trim() || m.phones.some((p) => p.num.trim()));
      s && s.setRightDisabled(!ok);
    }
    function multi(kind) {
      const arr = m[kind];
      const labels = kind === 'phones' ? PHONE_LABELS : EMAIL_LABELS;
      const rows = arr.map((it, i) => h('div.ct-erow',
        h('div.ct-eminus', { onTap: () => { arr.splice(i, 1); s.render(); validate(); } }, JC.icon('minus.circle.fill', { size: 22 })),
        h('div.ct-elabel', { onTap: (e) => JC.ui.menu(e.currentTarget, labels.map((l) => ({ text: l, checked: it.label === l, onTap: () => { it.label = l; s.render(); } }))) }, it.label || labels[0], JC.icon('chevron.right', { size: 11, weight: 2.6 })),
        JC.ui.input({ value: kind === 'phones' ? it.num : it.addr, placeholder: kind === 'phones' ? 'Phone' : 'Email', cls: 'ct-in', kbType: kind === 'phones' ? 'num' : undefined, cap: 'none', onInput: (v) => { if (kind === 'phones') it.num = v; else it.addr = v; validate(); } })));
      rows.push(h('div.ct-erow.add', { onTap: () => { arr.push(kind === 'phones' ? { label: arr.length ? 'home' : 'mobile', num: '' } : { label: arr.length ? 'work' : 'home', addr: '' }); s.render(); const ins = s.body.querySelectorAll('.ct-egroup.' + kind + ' input'); if (ins.length) setTimeout(() => ins[ins.length - 1].focus(), 60); } },
        h('div.ct-eplus', JC.icon('plus.circle.fill', { size: 22 })), h('div.ct-eaddt', kind === 'phones' ? 'add phone' : 'add email')));
      return h('div.ct-egroup.' + kind, rows);
    }
    function photo() {
      JC.ui.actionSheet({
        title: 'Contact Photo',
        actions: [
          { text: 'Choose Photo', onTap: () => photoPicker() },
          { text: 'Monogram', onTap: () => { m.avatar = { initials: ((m.first[0] || '') + (m.last[0] || '')) || (m.nickname[0] || '?'), grad: GRADS[(JC.voiceBed.hash(m.first + m.last) % (GRADS.length - 1)) + 1] }; s.render(); } },
          m.avatar && (m.avatar.art || m.avatar.emoji) ? { text: 'Remove Photo', style: 'destructive', onTap: () => { m.avatar = null; s.render(); } } : null,
        ].filter(Boolean),
      });
    }
    function photoPicker() {
      const arts = ['av_fairy', 'p_lotus_macro', 'p_puppies', 'p_dog_park', 'p_radishes', 'p_kites', 'p_moon_street', 'p_sunrise_lake', 'p_lotus_pond_day', 'p_cloud_recesses', 'av_jl', 'av_lxc', 'av_nhs', 'av_huang', 'av_mian'].filter((a) => JC.art.has(a));
      const ps = JC.ui.sheet({ title: 'Choose Photo', detent: 'large', cls: 'ct-sheet', left: { text: 'Cancel' },
        content: () => [h('div.ct-photogrid', arts.map((a) => h('div.ct-photo', { onTap: () => { m.avatar = { art: a, initials: (m.first[0] || '?'), grad: ['#888', '#666'] }; ps.close(); s.render(); } }, JC.art.el(a, { cls: 'ct-photo-art' }))))] });
    }
    function bdayPicker() {
      const now = JC.time.date();
      const cur = (m.bday || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
      let val = cur ? [+cur[2], +cur[3], +cur[1]] : [now.getMonth() + 1, now.getDate(), 1990];
      const years = [];
      for (let y = now.getFullYear(); y >= 1930; y--) years.push(y);
      const bs = JC.ui.sheet({
        title: 'Birthday', detent: 'medium', cls: 'ct-sheet', left: { text: 'Cancel' },
        right: { text: 'Done', onTap: () => { m.bday = val[2] + '-' + String(val[0]).padStart(2, '0') + '-' + String(val[1]).padStart(2, '0'); s.render(); } },
        content: () => [h('div.ct-wheel', JC.ui.wheel({ cols: [
          { items: U.MONTHS.map((mm, i) => ({ label: mm, value: i + 1 })), value: val[0], align: 'right' },
          { items: Array.from({ length: 31 }, (_, i) => i + 1), value: val[1], width: 70 },
          { items: years, value: val[2], width: 90 },
        ], onChange: (v) => { val = v; } }))],
      });
      void bs;
    }
    function save() {
      const clean = {
        first: m.first.trim(), last: m.last.trim(), company: m.company.trim(), title: m.title.trim(),
        phones: m.phones.filter((p) => p.num && p.num.trim()).map((p) => ({ label: p.label || 'mobile', num: p.num.trim() })),
        emails: m.emails.filter((e) => e.addr && e.addr.trim()).map((e) => ({ label: e.label || 'home', addr: e.addr.trim() })),
        address: m.address.trim() || undefined, bday: m.bday || undefined, notes: m.notes.trim() || undefined,
      };
      const display = m.nickname.trim() || [clean.first, clean.last].filter(Boolean).join(' ') || clean.company || (clean.phones[0] && clean.phones[0].num) || 'No Name';
      let id = cid;
      if (isNew) {
        id = U.uid('x');
        const av = m.avatar || { initials: ((clean.first[0] || '') + (clean.last[0] || '')) || display[0], grad: GRADS[JC.voiceBed.hash(id) % GRADS.length] };
        JC.store.add('contactsextra', Object.assign({ id, display, nickname: m.nickname.trim() || undefined, avatar: av, related: [] }, clean), { front: false });
      } else if (registered.has(cid)) {
        JC.store.update('contactsextra', cid, Object.assign({ display, nickname: m.nickname.trim() || undefined, avatar: m.avatar || undefined }, clean));
      } else {
        const e = Object.assign({ id: cid }, editOf(cid) || {}, clean, { display, avatar: m.avatar || (ORIG[cid] && ORIG[cid].avatar) });
        JC.store.add('contactedits', e);
      }
      applyAll();
      JC.bus.emit('contacts:changed', { id });
      JC.bus.emit('story:threads');
      // the story hears about edits to existing contacts, one act per changed field (display = the saved name)
      if (!isNew) {
        const after = get(id) || {};
        Object.keys(was).forEach((field) => {
          const b = String(was[field] || '').trim(), v = String(after[field] || '').trim();
          if (b !== v) { try { JC.story.act('contact_edit', { id, field, value: v, before: b }); } catch (e) { /* ignore */ } }
        });
      }
      if (o.onSave) setTimeout(() => o.onSave(id), 320);
    }
    s = JC.ui.sheet({
      title: isNew ? 'New Contact' : '',
      detent: 'large',
      cls: 'ct-sheet ct-editor',
      left: { text: 'Cancel' },
      right: { text: 'Done', onTap: () => save() },
      content: () => {
        const av = m.avatar || { initials: ((m.first[0] || '') + (m.last[0] || '')).toUpperCase() || '', grad: ['#c7c7cc', '#aeaeb2'] };
        return [
          h('div.ct-ehead', JC.ui.avatar(av, 112), h('div.ct-ephoto', { onTap: photo }, m.avatar ? 'Edit' : 'Add Photo')),
          h('div.ct-egroup.names',
            h('div.ct-erow', input('first', 'First name')),
            h('div.ct-erow', input('last', 'Last name')),
            h('div.ct-erow', input('nickname', 'Nickname (shown name)')),
            h('div.ct-erow', input('company', 'Company')),
            h('div.ct-erow', input('title', 'Job title'))),
          multi('phones'),
          multi('emails'),
          h('div.ct-egroup', h('div.ct-erow', h('div.ct-elabel.static', 'home'), input('address', 'Address'))),
          h('div.ct-egroup', m.bday
            ? h('div.ct-erow', h('div.ct-eminus', { onTap: () => { m.bday = ''; s.render(); } }, JC.icon('minus.circle.fill', { size: 22 })), h('div.ct-elabel.static', 'birthday'), h('div.ct-evalue', { onTap: bdayPicker }, fmtBday(m.bday)))
            : h('div.ct-erow.add', { onTap: bdayPicker }, h('div.ct-eplus', JC.icon('plus.circle.fill', { size: 22 })), h('div.ct-eaddt', 'add birthday'))),
          h('div.ct-egroup.notes', h('div.ct-enotes-l', 'Notes'), JC.ui.input({ multiline: true, value: m.notes, placeholder: '', cls: 'ct-in ct-notes', rows: 3, onInput: (v) => { m.notes = v; } })),
          !isNew ? h('div.ct-egroup', h('div.ct-erow.del', { onTap: () => { s.close(); setTimeout(() => del(cid, null), 300); } }, 'Delete Contact')) : null,
        ];
      },
    });
    validate();
    if (o.focus === 'notes') setTimeout(() => { const n = s.body.querySelector('.ct-notes'); if (n) { n.focus(); s.body.scrollTop = s.body.scrollHeight; } }, 450);
    else if (isNew) setTimeout(() => { const n = s.body.querySelector('input'); if (n) n.focus(); }, 450);
    return s;
  }

  /** gray "unknown caller" avatar with a person glyph */
  function blankAvatar(size) {
    const el = JC.ui.avatar({ initials: ' ', grad: ['#b9b9c0', '#8e8e96'] }, size);
    el.innerHTML = '';
    el.appendChild(JC.icon('person.fill', { size: Math.round(size * 0.56), cls: 'ct-blankic' }));
    return el;
  }

  // ══ Kit export ═══════════════════════════════════════════════════
  JC.ckit = {
    blankAvatar,
    get, people, name, findByNumber, labelFor, isHidden, sorted, letterOf, matches,
    favs, isFav, addFav, removeFav, relations, placeFor, openMaps, fmtBday,
    call, callMenu, message, mail, facetime, share, block, live, callWord, durWords,
    listPage, cardPage, numberPage, picker, editor, addToExisting, applyAll,
  };

  JC.bus.on('boot', applyAll);
  JC.bus.on('story:reset', applyAll);
  JC.store.on('contactedits', () => applyAll());
  JC.store.on('contactsextra', () => applyAll());

  // ══ The Contacts app ═════════════════════════════════════════════
  JC.app({
    id: 'contacts',
    name: 'Contacts',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-contacts');
      let root = null;
      const nav = JC.ui.nav(win.body, (n) => (root = listPage({ nav: n, title: 'Contacts' })));
      function openCard(cid) {
        if (!cid) return;
        while (nav.depth() > 1) nav.pop({ instant: true });
        nav.push(cid === 'me' || get(cid) ? cardPage(cid) : numberPage(cid));
      }
      return {
        intent(i) {
          if (!i) return;
          if (i.contact || i.id) openCard(i.contact || i.id);
          else if (i.create || i.new) editor(null, { prefill: i.prefill, onSave: (id) => nav.push(cardPage(id)) });
        },
        show() { if (root && nav.depth() === 1) root.render(); },
      };
    },
  });
})();
