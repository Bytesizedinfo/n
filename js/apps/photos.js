/* Photos — iOS 26: Library (Years / Months / All), Collections (albums, people & pets, memories, places, media
   types, utilities), Search, full-screen viewer with Info + Edit, memory slideshows with synthesized music. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;
  const K = () => JC.photoKit;

  JC.icon.add({
    'ph.live': '<circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="9.2" stroke-dasharray="1.4 2.2"/>',
    'ph.dial': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4v3M12 17.6v3M3.4 12h3M17.6 12h3M5.9 5.9l2.1 2.1M16 16l2.1 2.1M5.9 18.1 8 16M16 8l2.1-2.1"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>',
    'ph.filters': '<circle cx="9" cy="9" r="5.2"/><circle cx="15" cy="9" r="5.2"/><circle cx="12" cy="14.6" r="5.2"/>',
    'ph.rotate': '<path d="M5.5 9.5h9a2 2 0 0 1 2 2v8.5h-11z"/><path d="M11 3.5c3.6 0 6.5 2.4 7.2 5.6"/><path d="m19.8 6.6-1.6 2.6-2.7-1.4"/>',
    'ph.flip': '<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M9.5 6.5 3.5 18h6zM14.5 6.5l6 11.5h-6z"/>',
    'ph.aspect': '<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M7 9.5v-1h2M17 14.5v1h-2"/>',
    'ph.exposure': '<circle cx="12" cy="12" r="8.6"/><path d="M5.9 18.1 18.1 5.9"/><path d="M7.5 9.5h4M9.5 7.5v4M13 15.5h4"/>',
    'ph.brilliance': '<circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 0 10z" fill="currentColor" stroke="none"/><path d="M12 2.8v1.8M12 19.4v1.8M2.8 12h1.8M19.4 12h1.8M5.5 5.5l1.3 1.3M17.2 17.2l1.3 1.3M5.5 18.5l1.3-1.3M17.2 6.8l1.3-1.3"/>',
    'ph.highlights': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor" stroke="none" opacity=".35"/><path d="M12 6v12M14.5 7.5v9M17 9.5v5"/>',
    'ph.shadows': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 0 0 17.2z" fill="currentColor" stroke="none"/>',
    'ph.contrast': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 1 0 17.2z" fill="currentColor" stroke="none"/>',
    'ph.brightness': '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5"/>',
    'ph.blackpoint': '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.4" fill="currentColor" stroke="none"/>',
    'ph.saturation': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4v17.2M3.4 12h17.2" opacity=".5"/><circle cx="12" cy="12" r="3.6" fill="currentColor" stroke="none"/>',
    'ph.vibrance': '<path d="M12 3.5 20.5 19h-17z"/><path d="M12 9.5 16 17H8z" fill="currentColor" stroke="none"/>',
    'ph.warmth': '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 8.5v8" stroke-width="2.6"/>',
    'ph.tint': '<path d="M12 3.5c3.4 4 5.5 7.1 5.5 10a5.5 5.5 0 0 1-11 0c0-2.9 2.1-6 5.5-10z"/><path d="M12 19.5a5.5 5.5 0 0 0 5.5-5.5H12z" fill="currentColor" stroke="none"/>',
    'ph.sharpness': '<path d="M12 3.5 20.5 19h-17z"/><path d="M12 3.5V19" />',
    'ph.definition': '<path d="M12 3.5 20.5 19h-17z"/><path d="M12 3.5 20.5 19H12z" fill="currentColor" stroke="none"/>',
    'ph.noise': '<circle cx="7" cy="7" r="1.3" fill="currentColor"/><circle cx="12" cy="9" r="1.3" fill="currentColor"/><circle cx="17" cy="6" r="1.3" fill="currentColor"/><circle cx="8" cy="13" r="1.3" fill="currentColor"/><circle cx="15" cy="13" r="1.3" fill="currentColor"/><circle cx="6" cy="18" r="1.3" fill="currentColor"/><circle cx="12" cy="17" r="1.3" fill="currentColor"/><circle cx="18" cy="18" r="1.3" fill="currentColor"/>',
    'ph.vignette': '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" opacity=".3"/>',
    'ph.lookup': '<circle cx="11" cy="11" r="7"/><path d="m16 16 4.5 4.5"/><path d="M11 7.4l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z" fill="currentColor" stroke="none"/>',
    'ph.selfie': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="10" r="3"/><path d="M6.8 18.2c1-2.4 3-3.6 5.2-3.6s4.2 1.2 5.2 3.6"/>',
    'ph.shot': '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><rect x="8.5" y="7" width="7" height="10" rx="1.4"/>',
    'ph.pano': '<path d="M3 7c6 1.6 12 1.6 18 0v10c-6-1.6-12-1.6-18 0z"/>',
    'ph.aperture': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4 15.4 9.6M20.3 9.6l-6.9 1.6M17.6 18.6l-4.4-5.2M7 19.2l1.9-6.6M3.7 9.4l6.7 2.4M14.8 3.9 9.4 8.6"/>',
    'ph.slomo': '<circle cx="12" cy="12" r="8.6" stroke-dasharray="1.2 2.6"/><circle cx="12" cy="12" r="4.6"/>',
    'ph.receipt': '<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    'ph.memories': '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M10.2 9.2v5.6l4.6-2.8z" fill="currentColor" stroke="none"/>',
    'ph.album.add': '<rect x="3.5" y="7.5" width="13" height="13" rx="2.5"/><path d="M6.5 4.5h11a2.5 2.5 0 0 1 2.5 2.5v10M10 11v6M7 14h6"/>',
    'ph.map.pin': '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
    'ph.duplicate': '<rect x="8" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M16 5.5V5a1.5 1.5 0 0 0-1.5-1.5h-9A1.5 1.5 0 0 0 4 5v9a1.5 1.5 0 0 0 1.5 1.5H6M14.2 11.5v5.5M11.5 14.2h5.5"/>',
    'ph.loop': '<path d="M4 12a5 5 0 0 1 5-5h9l-3-3M20 12a5 5 0 0 1-5 5H6l3 3"/>',
  });

  const MONTHS = U.MONTHS;
  const st = {
    zoom: 'all', cols: 3, aspectGrid: false, showShots: true, filter: 'all', sort: 'captured',
    unlocked: false, peopleNames: {}, favPeople: {}, hiddenSections: {},
  };

  // ── formatting ─────────────────────────────────────────────────────────────
  const fmtMD = (t) => { const d = new Date(t); return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate(); };
  const fmtMDY = (t) => { const d = new Date(t); return MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getDate() + ', ' + d.getFullYear(); };
  function viewerTitle(t) {
    const d = new Date(t), n = JC.time.date(), diff = U.dayDiff(d, n);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff > 1 && diff < 7) return U.DAYS[d.getDay()];
    return MONTHS[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== n.getFullYear() ? ', ' + d.getFullYear() : '');
  }
  function counts(list) {
    const v = list.filter((p) => p.kind === 'video').length;
    const ph = list.length - v;
    const parts = [];
    if (ph || !v) parts.push(U.plural(ph, 'Photo'));
    if (v) parts.push(U.plural(v, 'Video'));
    return parts.join(', ');
  }
  function placeName(p) { return p.place || (K().cityOf(p) ? K().CITIES[K().cityOf(p)].name : ''); }
  function personName(id) {
    if (st.peopleNames[id]) return st.peopleNames[id];
    const pp = K().PEOPLE.find((x) => x.id === id);
    return pp ? pp.name : JC.contacts.short(id);
  }

  // ── collections (smart albums) ───────────────────────────────────────────────
  const lib = () => K().library();
  const allP = () => K().all();
  const libFiltered = () => lib().filter((p) => st.showShots || p.kind !== 'screenshot');
  const SMART = {
    recents: { title: 'Recents', icon: 'photo.on.rectangle', list: () => lib() },
    favorites: { title: 'Favorites', icon: 'heart', list: () => lib().filter((p) => p.fav) },
    saved: { title: 'Recently Saved', icon: 'square.and.arrow.down', list: () => lib().filter((p) => ['msg', 'web', 'shot'].includes(p.src) || p.kind === 'screenshot').slice(-30) },
    videos: { title: 'Videos', icon: 'video', list: () => lib().filter((p) => p.kind === 'video') },
    selfies: { title: 'Selfies', icon: 'ph.selfie', list: () => lib().filter((p) => p.mode === 'selfie') },
    live: { title: 'Live Photos', icon: 'ph.live', list: () => lib().filter((p) => p.kind === 'live') },
    portrait: { title: 'Portrait', icon: 'ph.aperture', list: () => lib().filter((p) => p.mode === 'portrait') },
    panoramas: { title: 'Panoramas', icon: 'ph.pano', list: () => lib().filter((p) => p.mode === 'pano') },
    slomo: { title: 'Slo-mo', icon: 'ph.slomo', list: () => lib().filter((p) => p.mode === 'slomo') },
    screenshots: { title: 'Screenshots', icon: 'ph.shot', list: () => lib().filter((p) => p.kind === 'screenshot') },
    receipts: { title: 'Receipts', icon: 'ph.receipt', list: () => lib().filter((p) => ['p_receipt', 'p_shot_bank'].includes(p.art)) },
    duplicates: { title: 'Duplicates', icon: 'ph.duplicate', list: () => { const seen = {}; const out = []; lib().forEach((p) => { if (p.kind === 'video') return; const k = p.art + '|' + JSON.stringify(p.crop || null); if (seen[k]) out.push(seen[k], p); else seen[k] = p; }); return Array.from(new Set(out)); } },
    hidden: { title: 'Hidden', icon: 'eye.slash', locked: true, list: () => allP().filter((p) => p.hidden && !p.deleted).sort(K().byT) },
    deleted: { title: 'Recently Deleted', icon: 'trash', locked: true, list: () => allP().filter((p) => p.deleted).sort((a, b) => b.deleted - a.deleted) },
  };
  const userAlbums = () => JC.store.all('albums');
  function albumList(id) {
    if (SMART[id]) return SMART[id].list();
    return lib().filter((p) => (p.albums || []).includes(id));
  }
  function albumTitle(id) { if (SMART[id]) return SMART[id].title; const a = JC.store.get('albums', id); return a ? a.title : 'Album'; }
  function albumCover(id) {
    const list = albumList(id);
    if (!SMART[id]) {
      const a = JC.store.get('albums', id);
      if (a && a.cover) {
        const byId = JC.store.get('photos', a.cover);
        if (byId && !byId.deleted && !byId.hidden) return byId;
        if (JC.art.has(a.cover)) return { id: 'cover_' + id, art: a.cover };
      }
    }
    return list[list.length - 1] || null;
  }

  // ── memories ───────────────────────────────────────────────────────────────
  const yr = (p) => new Date(p.t).getFullYear();
  const MEMORIES = [
    { id: 'lotus-pier-2007', title: 'Lotus Pier, 2007', sub: 'Summer · 2007', key: 'ph_fam07', mood: 'sentimental', list: () => lib().filter((p) => (p.albums || []).includes('old-photos')) },
    { id: 'fairy-years', title: 'Fairy Through the Years', sub: '2018 – 2026', key: 'ph_fairy23', mood: 'uplifting', list: () => lib().filter((p) => K().peopleOf(p).includes('fairy') || p.art === 'p_receipt' || p.art === 'p_fairy_roof') },
    { id: 'best-aling', title: 'Best of A-Ling', sub: '2014 – 2026', key: 'ph_permit26', mood: 'gentle', list: () => lib().filter((p) => K().peopleOf(p).includes('jl') || (p.albums || []).includes('aling')) },
    { id: 'gala-night', title: 'Koi Tower Gala', sub: 'Oct 16, 2026', key: 'ph_moon', mood: 'gentle', list: () => lib().filter((p) => (p.albums || []).includes('gala-2026') || (U.sameDay(new Date(p.t), new Date(JC.time.parse('+0 20:00'))) && /koi tower/i.test(p.place || ''))) },
    { id: 'good-dogs', title: 'Good Dogs', sub: '1999 – 2026', key: 'ph_dogs99', mood: 'uplifting', list: () => lib().filter((p) => (p.albums || []).includes('dogs') && p.art !== 'p_receipt') },
  ];
  const memById = (id) => MEMORIES.find((m) => m.id === id);
  function memKey(m) { return JC.store.get('photos', m.key) || m.list()[0]; }

  // ── shared bits ─────────────────────────────────────────────────────────────
  function cell(p, o) {
    o = o || {};
    const c = h('div.ph-cell', { data: { id: p.id } });
    const inner = K().box(p, o.aspect ? null : 1, 'ph-cell-img');
    if (o.aspect) { inner.classList.add('fitted'); fitInto(inner, p); }
    c.appendChild(inner);
    if (p.kind === 'video') c.appendChild(h('div.ph-cell-dur', K().dur(p.dur)));
    if (p.fav && !o.noFav) c.appendChild(h('div.ph-cell-fav', JC.icon('heart.fill', { size: 13 })));
    if (o.deleted) c.appendChild(h('div.ph-cell-days', daysLeft(p)));
    if (o.sel) c.appendChild(h('div.ph-cell-check', { class: { on: o.sel.has(p.id) } }, JC.icon('checkmark', { size: 12, weight: 3 })));
    return c;
  }
  function fitInto(el, p) {
    // aspect-ratio grid: letterbox the photo inside a square cell
    const a = K().aspectOf(p);
    el.style.width = a >= 1 ? '100%' : (a * 100).toFixed(2) + '%';
    el.style.height = a >= 1 ? (100 / a).toFixed(2) + '%' : '100%';
    K().paint(el, p, a);
  }
  function daysLeft(p) {
    const left = Math.max(1, 30 - Math.floor((JC.time.now() - p.deleted) / 86400e3));
    return left + (left === 1 ? ' day' : ' days');
  }
  const glassBtn = (o) => ui.navBtn(o);

  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'photos',
    name: 'Photos',
    status: 'auto',
    launch(win, intent0) {
      win.body.classList.add('app-photos');
      const livePages = new Set();
      let viewer = null;
      let editor = null;
      let memory = null;
      let lastLibScroll = null;

      const rerender = () => {
        livePages.forEach((pg) => { if (pg.el.isConnected) pg.render(); else livePages.delete(pg); });
        if (viewer) viewer.refresh();
      };
      const offStore = JC.store.on('photos', () => requestAnimationFrame(rerender));
      const offAlbums = JC.store.on('albums', () => requestAnimationFrame(rerender));
      const live = (pg) => { livePages.add(pg); return pg; };
      const push = (pg) => tabs.nav().push(pg);

      const tabs = ui.tabs(win.body, {
        tabs: [
          { id: 'library', title: 'Library', icon: 'photo.on.rectangle', root: () => libraryPage() },
          { id: 'collections', title: 'Collections', icon: 'rectangle.stack', root: () => collectionsPage() },
        ],
        search: { id: 'search', title: 'Search', root: () => searchPage() },
        active: 'library',
      });


      // ═══ LIBRARY ═════════════════════════════════════════════════════════
      function libraryPage() {
        let selecting = false;
        const sel = new Set();
        const title = h('div.ph-lib-title', 'Library');
        const sub = h('div.ph-lib-sub', '');
        const selBtn = glassBtn({ text: 'Select', onTap: () => setSelecting(!selecting) });
        const moreBtn = glassBtn({ icon: 'ellipsis', onTap: (e) => libMenu(e.currentTarget) });
        const head = h('div.ph-lib-head', h('div.ph-lib-titles', title, sub), h('div.ph-lib-btns', selBtn, moreBtn));
        const seg = ui.segmented({ items: ['Years', 'Months', 'All'], value: 2, onChange: (i) => setZoom(['years', 'months', 'all'][i]) });
        const zoomBar = h('div.ph-zoombar', seg);
        const filterChip = h('div.ph-filterchip', { hidden: true, onTap: () => { st.filter = 'all'; page.render(); } });
        const selCount = h('div.ph-sel-count', 'Select Items');
        const selBar = h('div.ph-selbar', { hidden: true },
          glassBtn({ icon: 'square.and.arrow.up', onTap: () => shareMany(Array.from(sel)) }),
          h('div.ph-sel-mid', selCount),
          glassBtn({ icon: 'heart', onTap: () => { favMany(Array.from(sel)); setSelecting(false); } }),
          glassBtn({ icon: 'trash', onTap: () => deleteMany(Array.from(sel), () => setSelecting(false)) }),
          glassBtn({ icon: 'ellipsis', onTap: (e) => moreMany(e.currentTarget, Array.from(sel), () => setSelecting(false)) }));

        const page = live(ui.page({
          navbar: false,
          cls: 'ph-lib',
          content: () => renderLib(),
          footer: h('div.ph-lib-over', head, filterChip, zoomBar, selBar),
          onShow: () => { if (st.zoom === 'all' && lastLibScroll == null) scrollBottom(); },
        }));
        page.scroll.addEventListener('scroll', U.throttle(updateSub, 120), { passive: true });
        function scrollBottom() { requestAnimationFrame(() => { page.scroll.scrollTop = page.scroll.scrollHeight; updateSub(); }); }
        page.scrollToEnd = scrollBottom;
        page.getZoom = () => st.zoom;

        function items() {
          let l = libFiltered();
          if (st.filter === 'favorites') l = l.filter((p) => p.fav);
          else if (st.filter === 'edited') l = l.filter((p) => K().isEdited(p));
          else if (st.filter === 'photos') l = l.filter((p) => p.kind !== 'video');
          else if (st.filter === 'videos') l = l.filter((p) => p.kind === 'video');
          else if (st.filter === 'screenshots') l = l.filter((p) => p.kind === 'screenshot');
          if (st.sort === 'added') l = l.slice().sort((a, b) => (a.added || a.t) - (b.added || b.t));
          return l;
        }
        function renderLib() {
          const list = items();
          const filters = { favorites: 'Favorites', edited: 'Edited', photos: 'Photos', videos: 'Videos', screenshots: 'Screenshots' };
          filterChip.hidden = st.filter === 'all';
          filterChip.innerHTML = '';
          if (st.filter !== 'all') filterChip.append(JC.icon('line.3.horizontal.decrease', { size: 14 }), h('span', 'Filtered: ' + filters[st.filter]), JC.icon('xmark', { size: 11, weight: 2.6 }));
          seg.set(['years', 'months', 'all'].indexOf(st.zoom));
          const out = [h('div.ph-lib-top')];
          if (!list.length) {
            out.push(ui.empty({ icon: 'photo', title: 'No Photos', text: st.filter === 'all' ? 'Photos and videos you take will appear here.' : 'No items match this filter.' }));
            return out;
          }
          if (st.zoom === 'years') out.push(yearsView(list));
          else if (st.zoom === 'months') out.push(monthsView(list));
          else {
            out.push(gridEl(list, { sel: selecting ? sel : null, cols: st.cols, aspect: st.aspectGrid, onSelect: toggleSel, ctxList: list }));
            out.push(h('div.ph-lib-count', counts(list)), h('div.ph-lib-count2', 'Synced with iCloud Just Now'));
          }
          out.push(h('div.ph-lib-bottom'));
          setTimeout(updateSub, 0);
          return out;
        }
        function updateSub() {
          const list = items();
          if (!list.length) { sub.textContent = ''; return; }
          if (st.zoom !== 'all') { sub.textContent = yr(list[0]) + ' – ' + yr(list[list.length - 1]); return; }
          const cells = page.content.querySelectorAll('.ph-cell');
          if (!cells.length) return;
          const top = page.scroll.scrollTop + 120;
          let firstVis = cells[0];
          for (const c of cells) { if (c.offsetTop + c.offsetHeight > top) { firstVis = c; break; } }
          const p = JC.store.get('photos', firstVis.dataset.id);
          lastLibScroll = page.scroll.scrollTop;
          if (p) sub.textContent = fmtMDY(p.t);
        }
        function toggleSel(p, c) {
          if (sel.has(p.id)) sel.delete(p.id); else sel.add(p.id);
          c.querySelector('.ph-cell-check').classList.toggle('on', sel.has(p.id));
          selCount.textContent = sel.size ? U.plural(sel.size, 'Item') + ' Selected' : 'Select Items';
        }
        function setSelecting(on) {
          selecting = on;
          sel.clear();
          selCount.textContent = 'Select Items';
          selBtn.querySelector('span').textContent = on ? 'Cancel' : 'Select';
          selBar.hidden = !on;
          zoomBar.hidden = on;
          tabs.hideBar(on);
          if (on && st.zoom !== 'all') { st.zoom = 'all'; }
          page.render();
        }
        page.cancelSelect = () => { if (selecting) { setSelecting(false); return true; } return false; };
        function setZoom(z) {
          if (st.zoom === z) return;
          st.zoom = z;
          page.render();
          if (z === 'all') scrollBottom(); else page.scrollTop();
        }
        function yearsView(list) {
          const years = {};
          list.forEach((p) => { const y = yr(p); (years[y] = years[y] || []).push(p); });
          return h('div.ph-years', Object.keys(years).sort().map((y) => {
            const ps = years[y];
            const key = ps.find((p) => p.fav && p.kind !== 'screenshot') || ps[Math.floor(ps.length / 2)];
            const card = h('div.ph-ycard', { onTap: () => { st.zoom = 'months'; page.render(); requestAnimationFrame(() => { const t = page.content.querySelector(`[data-year="${y}"]`); if (t) page.scroll.scrollTop = t.offsetTop - 110; }); } },
              K().box(key, 362 / 236, 'ph-ycard-img'), h('div.ph-ycard-shade'),
              h('div.ph-ycard-label', h('div.ph-ycard-y', y), h('div.ph-ycard-n', counts(ps))));
            return card;
          }));
        }
        function monthsView(list) {
          const months = [];
          const map = {};
          list.forEach((p) => { const d = new Date(p.t); const k = d.getFullYear() + '-' + d.getMonth(); if (!map[k]) { map[k] = []; months.push(k); } map[k].push(p); });
          let lastY = null;
          return h('div.ph-months', months.map((k) => {
            const ps = map[k];
            const [y, m] = k.split('-').map(Number);
            const places = Array.from(new Set(ps.map((p) => K().cityOf(p)).filter(Boolean))).map((c) => K().CITIES[c].name);
            const key = ps.find((p) => p.fav) || ps[ps.length - 1];
            const yh = y !== lastY ? h('div.ph-mon-year', { data: { year: y } }, String(y)) : null;
            lastY = y;
            const card = h('div.ph-mcard', { onTap: () => { st.zoom = 'all'; page.render(); requestAnimationFrame(() => { const c = page.content.querySelector(`.ph-cell[data-id="${ps[0].id}"]`); if (c) page.scroll.scrollTop = c.offsetTop - 120; updateSub(); }); } },
              K().box(key, 362 / 260, 'ph-mcard-img'), h('div.ph-ycard-shade'),
              h('div.ph-mcard-label', h('div.ph-mcard-m', MONTHS[m] + (y !== JC.time.date().getFullYear() ? ' ' + y : '')), places.length ? h('div.ph-mcard-p', places.join(' & ')) : null),
              ps.length > 1 ? h('div.ph-mcard-n', String(ps.length)) : null);
            return [yh, card];
          }));
        }
        function libMenu(anchor) {
          ui.menu(anchor, [
            { text: 'Sort by Recently Added', checked: st.sort === 'added', onTap: () => { st.sort = 'added'; page.render(); } },
            { text: 'Sort by Date Captured', checked: st.sort === 'captured', onTap: () => { st.sort = 'captured'; page.render(); } },
            '-',
            { text: 'All Items', checked: st.filter === 'all', onTap: () => { st.filter = 'all'; page.render(); scrollBottom(); } },
            { text: 'Favorites', icon: 'heart', checked: st.filter === 'favorites', onTap: () => { st.filter = 'favorites'; page.render(); scrollBottom(); } },
            { text: 'Edited', icon: 'slider.horizontal.3', checked: st.filter === 'edited', onTap: () => { st.filter = 'edited'; page.render(); scrollBottom(); } },
            { text: 'Photos', icon: 'photo', checked: st.filter === 'photos', onTap: () => { st.filter = 'photos'; page.render(); scrollBottom(); } },
            { text: 'Videos', icon: 'video', checked: st.filter === 'videos', onTap: () => { st.filter = 'videos'; page.render(); scrollBottom(); } },
            { text: 'Screenshots', icon: 'ph.shot', checked: st.filter === 'screenshots', onTap: () => { st.filter = 'screenshots'; page.render(); scrollBottom(); } },
            '-',
            { text: st.cols === 3 ? 'Zoom Out' : 'Zoom In', icon: 'magnifyingglass', onTap: () => { st.cols = st.cols === 3 ? 5 : 3; st.zoom = 'all'; page.render(); scrollBottom(); } },
            { text: 'Aspect Ratio Grid', icon: 'ph.aspect', checked: st.aspectGrid, onTap: () => { st.aspectGrid = !st.aspectGrid; page.render(); } },
            { text: 'Show Screenshots', icon: 'ph.shot', checked: st.showShots, onTap: () => { st.showShots = !st.showShots; page.render(); } },
            { text: 'Slideshow', icon: 'play.fill', onTap: () => playMemory({ id: 'library', title: 'Library', sub: 'All Photos', mood: 'gentle', list: () => items().filter((p) => p.kind !== 'screenshot').slice(-24) }) },
          ]);
        }
        return page;
      }

      // generic grid (3 or 5 columns); taps open the viewer with ctxList
      function gridEl(list, o) {
        o = o || {};
        const g = h('div.ph-grid', { style: { '--cols': o.cols || 3 } });
        list.forEach((p, i) => {
          const c = cell(p, { sel: o.sel, aspect: o.aspect, deleted: o.deleted });
          ui.onTap(c, () => {
            if (o.sel) { o.onSelect && o.onSelect(p, c); return; }
            openViewer(o.ctxList || list, i, c, o.viewer);
          });
          if (!o.sel) ui.contextMenu(c, () => ({ items: photoMenuItems(p, o), preview: previewEl(p) }));
          g.appendChild(c);
        });
        return g;
      }
      function previewEl(p) {
        const a = K().aspectOf(p);
        const w = 370, hh = Math.min(440, w / a);
        const b = K().box(p, w / hh, 'ph-ctx-prev');
        b.style.height = hh + 'px';
        return b;
      }
      function photoMenuItems(p, o) {
        o = o || {};
        if (p.deleted) {
          return [
            { text: 'Recover', icon: 'arrow.counterclockwise', onTap: () => recover([p.id]) },
            { text: 'Delete', icon: 'trash', destructive: true, onTap: () => deleteForever([p.id]) },
          ];
        }
        return [
          { text: 'Share…', icon: 'square.and.arrow.up', onTap: () => sharePhoto(p) },
          { text: 'Copy', icon: 'doc.on.doc', onTap: () => ui.toast('Copied', { icon: 'doc.on.doc' }) },
          { text: 'Duplicate', icon: 'ph.duplicate', onTap: () => duplicate(p) },
          { text: p.hidden ? 'Unhide' : 'Hide', icon: 'eye.slash', onTap: () => hideMany([p.id], !p.hidden) },
          '-',
          { text: p.fav ? 'Unfavorite' : 'Favorite', icon: p.fav ? 'heart.fill' : 'heart', onTap: () => toggleFav(p) },
          { text: 'Add to Album', icon: 'ph.album.add', onTap: () => addToAlbum([p.id]) },
          o.albumId && !SMART[o.albumId] ? { text: 'Remove from Album', icon: 'minus.circle.fill', onTap: () => { const al = (p.albums || []).filter((x) => x !== o.albumId); JC.store.update('photos', p.id, { albums: al }); } } : null,
          '-',
          { text: 'Delete', icon: 'trash', destructive: true, onTap: () => deleteMany([p.id]) },
        ];
      }

      // ═══ COLLECTIONS ═════════════════════════════════════════════════════
      function secHead(title, onTap, extra) {
        return h('div.ph-sec-h', { onTap }, h('span', title), onTap ? JC.icon('chevron.right', { size: 15, weight: 2.6 }) : null, extra || null);
      }
      function collectionsPage() {
        const prof = h('div.ph-prof', { onTap: () => accountSheet() }, ui.avatar('me', 34));
        const page = live(ui.page({
          title: 'Collections', large: true, cls: 'ph-coll',
          right: [prof],
          content: (pg) => collectionsContent(pg),
        }));
        return page;
      }
      function collectionsContent(page) {
        const S = [];
        const hiddenSec = st.hiddenSections;
        // Pinned
        const pins = [
          { title: 'Favorites', list: SMART.favorites.list(), icon: 'heart.fill', onTap: () => push(albumPage('favorites')) },
          { title: 'Recently Saved', list: SMART.saved.list(), icon: 'square.and.arrow.down', onTap: () => push(albumPage('saved')) },
          { title: 'Map', map: true, onTap: () => push(placesPage()) },
          { title: 'Videos', list: SMART.videos.list(), icon: 'video.fill', onTap: () => push(albumPage('videos')) },
          { title: 'Screenshots', list: SMART.screenshots.list(), icon: 'ph.shot', onTap: () => push(albumPage('screenshots')) },
        ];
        if (!hiddenSec.pinned) S.push(h('div.ph-sec', secHead('Pinned', null, h('span.ph-sec-btn', { onTap: (e) => { e.stopPropagation(); customizeSheet(page); } }, 'Modify')),
          h('div.ph-hs.hscroll', pins.map((pn) => {
            const last = pn.list && pn.list[pn.list.length - 1];
            const tile = h('div.ph-pin', { onTap: pn.onTap },
              h('div.ph-pin-img', pn.map ? miniMap() : last ? K().box(last, 1, 'ph-pin-box') : h('div.ph-pin-empty', JC.icon(pn.icon, { size: 30 })),
                !pn.map ? h('div.ph-pin-ic', JC.icon(pn.icon, { size: 14 })) : null),
              h('div.ph-pin-t', pn.title));
            return tile;
          }))));
        // Albums
        const alIds = ['recents', 'favorites'].concat(userAlbums().map((a) => a.id)).concat(['screenshots']);
        if (!hiddenSec.albums) S.push(h('div.ph-sec', secHead('Albums', () => push(albumsPage())),
          h('div.ph-albums.hscroll', alIds.map((id) => albumCard(id)))));
        // People & Pets
        if (!hiddenSec.people) {
          const ppl = peopleList().slice(0, 8);
          S.push(h('div.ph-sec', secHead('People & Pets', () => push(peoplePage())),
            h('div.ph-ppl.hscroll', ppl.map((pp) => personCircle(pp, 84)))));
        }
        // Memories
        if (!hiddenSec.memories) S.push(h('div.ph-sec', secHead('Memories', () => push(memoriesPage())),
          h('div.ph-mems.hscroll', MEMORIES.map((m) => memCard(m, 260, 330)))));
        // Recent Days
        if (!hiddenSec.days) S.push(h('div.ph-sec', secHead('Recent Days', () => push(daysPage())), h('div.ph-days.hscroll', recentDays().slice(0, 8).map((d) => dayCard(d)))));
        // Trips
        if (!hiddenSec.trips) S.push(h('div.ph-sec', secHead('Trips', null), h('div.ph-days.hscroll', TRIPS.map((t) => tripCard(t)))));
        // Featured
        if (!hiddenSec.featured) {
          const feat = featured();
          S.push(h('div.ph-sec', secHead('Featured Photos', () => push(gridPage({ title: 'Featured Photos', list: () => featured() }))),
            h('div.ph-feat.hscroll', feat.map((p, i) => { const c = h('div.ph-featcard', { onTap: (e) => openViewer(feat, i, e.currentTarget) }, K().box(p, 0.82, 'ph-feat-img')); ui.contextMenu(c, () => ({ items: photoMenuItems(p), preview: previewEl(p) })); return c; }))));
        }
        // Places
        if (!hiddenSec.places) S.push(h('div.ph-sec', secHead('Places', () => push(placesPage())), h('div.ph-placecard', { onTap: () => push(placesPage()) }, mapEl(true))));
        // Media types
        const media = ['videos', 'selfies', 'live', 'portrait', 'panoramas', 'slomo', 'screenshots'];
        S.push(h('div.ph-sec', secHead('Media Types', null), ui.list([{ rows: media.map((id) => ({ icon: { node: h('div.ph-row-ic', JC.icon(SMART[id].icon, { size: 22 })) }, title: SMART[id].title, detail: String(SMART[id].list().length), chevron: true, onTap: () => push(albumPage(id)) })) }])));
        // Utilities
        const utils = ['hidden', 'deleted', 'duplicates', 'receipts'];
        S.push(h('div.ph-sec', secHead('Utilities', null), ui.list([{ rows: utils.map((id) => ({ icon: { node: h('div.ph-row-ic', JC.icon(SMART[id].icon, { size: 22 })) }, title: SMART[id].title, right: SMART[id].locked ? h('div.ph-row-lock', JC.icon(st.unlocked ? 'lock.open.fill' : 'lock.fill', { size: 15 })) : h('div.row-detail', String(SMART[id].list().length)), chevron: true, onTap: () => push(albumPage(id)) })) }])));
        S.push(h('div.ph-customize', ui.btn({ text: 'Customize & Reorder', kind: 'gray', size: 'm', onTap: () => customizeSheet(page) })));
        return S;
      }
      function albumCard(id, big) {
        const list = albumList(id);
        const cov = albumCover(id);
        const locked = SMART[id] && SMART[id].locked;
        const c = h('div.ph-acard' + (big ? '.big' : ''), { onTap: () => push(albumPage(id)) },
          h('div.ph-acard-img', locked ? h('div.ph-pin-empty', JC.icon(SMART[id].icon, { size: 34 })) : cov ? K().box(cov, 1, 'ph-acard-box') : h('div.ph-pin-empty', JC.icon('photo', { size: 34 }))),
          h('div.ph-acard-t', albumTitle(id)),
          h('div.ph-acard-n', locked ? '' : String(list.length)));
        if (!SMART[id]) ui.contextMenu(c, () => ({ items: [
          { text: 'Share Album', icon: 'square.and.arrow.up', onTap: () => cov && ui.share({ title: albumTitle(id), subtitle: counts(list), art: cov.art, payload: { kind: 'photo', art: cov.art } }) },
          { text: 'Rename Album', icon: 'pencil', onTap: () => renameAlbum(id) },
          { text: 'Delete Album', icon: 'trash', destructive: true, onTap: () => deleteAlbum(id) },
        ] }));
        return c;
      }
      function albumsPage() {
        const page = live(ui.page({
          title: 'Albums', large: true, cls: 'ph-albums-page',
          right: [glassBtn({ icon: 'plus', onTap: () => newAlbum() }), glassBtn({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            { text: 'New Album', icon: 'ph.album.add', onTap: () => newAlbum() },
            { text: 'Sort: Custom Order', checked: true, onTap: () => ui.toast('Albums sorted by custom order') },
            { text: 'Sort: Title', checked: false, onTap: () => { const arr = userAlbums().slice().sort((a, b) => a.title.localeCompare(b.title)); JC.store.set('albums', arr); } },
          ]) })],
          content: () => {
            const ids = ['recents', 'favorites'].concat(userAlbums().map((a) => a.id));
            return [
              h('div.ph-agrid', ids.map((id) => albumCard(id, true))),
              h('div.ph-subhead', 'Media Types'),
              ui.list([{ rows: ['videos', 'selfies', 'live', 'portrait', 'panoramas', 'slomo', 'screenshots'].map((id) => ({ icon: { node: h('div.ph-row-ic', JC.icon(SMART[id].icon, { size: 22 })) }, title: SMART[id].title, detail: String(SMART[id].list().length), chevron: true, onTap: () => push(albumPage(id)) })) }]),
              h('div.ph-subhead', 'Utilities'),
              ui.list([{ rows: ['hidden', 'deleted', 'duplicates', 'receipts'].map((id) => ({ icon: { node: h('div.ph-row-ic', JC.icon(SMART[id].icon, { size: 22 })) }, title: SMART[id].title, right: SMART[id].locked ? h('div.ph-row-lock', JC.icon(st.unlocked ? 'lock.open.fill' : 'lock.fill', { size: 15 })) : h('div.row-detail', String(SMART[id].list().length)), chevron: true, onTap: () => push(albumPage(id)) })) }]),
            ];
          },
        }));
        return page;
      }
      function newAlbum(cb) {
        ui.alert({ title: 'New Album', message: 'Enter a name for this album.', input: { placeholder: 'Title' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          const t = (r.value || '').trim() || 'Untitled Album';
          const a = JC.store.add('albums', { id: U.uid('al'), title: t, cover: null });
          ui.toast('Album “' + t + '” created', { icon: 'ph.album.add' });
          if (cb) cb(a); else push(albumPage(a.id));
        });
      }
      function renameAlbum(id) {
        const a = JC.store.get('albums', id);
        if (!a) return;
        ui.alert({ title: 'Rename Album', input: { value: a.title, placeholder: 'Title' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index === 1 && (r.value || '').trim()) JC.store.update('albums', id, { title: r.value.trim() });
        });
      }
      function deleteAlbum(id, after) {
        const a = JC.store.get('albums', id);
        if (!a) return;
        ui.actionSheet({ title: 'Delete “' + a.title + '”?', message: 'The photos will stay in your library.', actions: [{ text: 'Delete Album', style: 'destructive', onTap: () => {
          JC.store.remove('albums', id);
          allP().filter((p) => (p.albums || []).includes(id)).forEach((p) => JC.store.update('photos', p.id, { albums: p.albums.filter((x) => x !== id) }));
          after && after();
        } }] });
      }

      // album / smart-album page
      function albumPage(id) {
        const smart = SMART[id];
        if (smart && smart.locked && !st.unlocked) return lockedPage(id);
        let selecting = false;
        const sel = new Set();
        const selBtn = glassBtn({ text: 'Select', onTap: () => setSel(!selecting) });
        const more = glassBtn({ icon: 'ellipsis', onTap: (e) => albumMenu(e.currentTarget) });
        const selCount = h('div.ph-sel-count', 'Select Items');
        const isDel = id === 'deleted';
        const selBar = h('div.ph-selbar.inpage', { hidden: true },
          isDel ? ui.btn({ text: 'Delete', kind: 'glass', onTap: () => { if (sel.size) deleteForever(Array.from(sel), () => setSel(false)); } }) : glassBtn({ icon: 'square.and.arrow.up', onTap: () => shareMany(Array.from(sel)) }),
          h('div.ph-sel-mid', selCount),
          isDel ? ui.btn({ text: 'Recover', kind: 'glass', onTap: () => { if (sel.size) { recover(Array.from(sel)); setSel(false); } } }) : glassBtn({ icon: 'trash', onTap: () => deleteMany(Array.from(sel), () => setSel(false)) }),
          !isDel ? glassBtn({ icon: 'ellipsis', onTap: (e) => moreMany(e.currentTarget, Array.from(sel), () => setSel(false), id) }) : null);
        const page = live(ui.page({
          title: albumTitle(id), large: true, cls: 'ph-album',
          right: [selBtn, more],
          footer: selBar,
          content: (pg) => {
            const list = albumList(id);
            pg.setTitle(albumTitle(id));
            const out = [];
            if (isDel) out.push(h('div.ph-note', 'Photos and videos show the days remaining before deletion. After that time, items will be permanently deleted. This may take up to 40 days.'));
            if (id === 'hidden') out.push(h('div.ph-note', 'Hidden photos don’t appear in your Library, in Search, or in Memories.'));
            if (!list.length) {
              out.push(ui.empty(id === 'duplicates' ? { icon: 'ph.duplicate', title: 'No Duplicates Found', text: 'Photos checks your library for duplicates when your iPhone is locked and connected to power.' } : { icon: smart ? smart.icon : 'photo', title: 'No Photos or Videos', text: smart ? 'Nothing here yet.' : 'Add photos to this album from your Library.', action: !smart ? { text: 'Add Photos', onTap: () => pickPhotos((ids) => { ids.forEach((pid) => { const p = JC.store.get('photos', pid); if (p && !(p.albums || []).includes(id)) JC.store.update('photos', pid, { albums: (p.albums || []).concat(id) }); }); }) } : null }));
              return out;
            }
            out.push(gridEl(list, { sel: selecting ? sel : null, onSelect: (p, c) => { if (sel.has(p.id)) sel.delete(p.id); else sel.add(p.id); c.querySelector('.ph-cell-check').classList.toggle('on', sel.has(p.id)); selCount.textContent = sel.size ? U.plural(sel.size, 'Item') + ' Selected' : 'Select Items'; }, deleted: isDel, albumId: id, viewer: { albumId: id } }));
            out.push(h('div.ph-lib-count', counts(list)));
            return out;
          },
        }));
        function setSel(on) {
          selecting = on;
          sel.clear();
          selCount.textContent = 'Select Items';
          selBtn.querySelector('span').textContent = on ? 'Cancel' : 'Select';
          selBar.hidden = !on;
          tabs.hideBar(on);
          page.render();
        }
        page.cancelSelect = () => { if (selecting) { setSel(false); return true; } return false; };
        page.opts.onHide = () => { if (selecting) setSel(false); };
        function albumMenu(anchor) {
          const list = albumList(id);
          const items = [
            { text: 'Slideshow', icon: 'play.fill', onTap: () => playMemory({ id: 'album-' + id, title: albumTitle(id), sub: counts(list), mood: 'gentle', list: () => albumList(id).filter((p) => p.kind !== 'screenshot') }) },
          ];
          if (!smart) {
            items.push({ text: 'Add Photos', icon: 'plus', onTap: () => pickPhotos((ids) => { ids.forEach((pid) => { const p = JC.store.get('photos', pid); if (p && !(p.albums || []).includes(id)) JC.store.update('photos', pid, { albums: (p.albums || []).concat(id) }); }); }) });
            items.push({ text: 'Rename Album', icon: 'pencil', onTap: () => renameAlbum(id) });
            items.push({ text: 'Share Album', icon: 'square.and.arrow.up', onTap: () => { const c = albumCover(id); if (c) ui.share({ title: albumTitle(id), subtitle: counts(list), art: c.art, payload: { kind: 'photo', art: c.art } }); } });
            items.push('-');
            items.push({ text: 'Delete Album', icon: 'trash', destructive: true, onTap: () => deleteAlbum(id, () => tabs.nav().pop()) });
          }
          if (isDel) {
            items.length = 0;
            items.push({ text: 'Recover All', icon: 'arrow.counterclockwise', onTap: () => recover(list.map((p) => p.id)) });
            items.push({ text: 'Delete All', icon: 'trash', destructive: true, onTap: () => deleteForever(list.map((p) => p.id)) });
          }
          if (id === 'hidden') items.push({ text: 'Unhide All', icon: 'eye', onTap: () => hideMany(list.map((p) => p.id), false) });
          if (smart && smart.locked) items.push({ text: 'Lock Album', icon: 'lock.fill', onTap: () => { st.unlocked = false; tabs.nav().pop(); ui.toast('Locked', { icon: 'lock.fill' }); } });
          ui.menu(anchor, items);
        }
        return page;
      }
      function gridPage(o) {
        const page = live(ui.page({
          title: o.title, subtitle: o.subtitle, large: !o.small, cls: 'ph-album',
          right: [glassBtn({ icon: 'play.fill', onTap: () => playMemory({ id: 'grid', title: o.title, sub: o.subtitle || '', mood: o.mood || 'gentle', list: () => o.list().filter((p) => p.kind !== 'screenshot') }) })],
          content: () => {
            const list = o.list();
            if (o.header) return [o.header(), list.length ? gridEl(list) : ui.empty({ icon: 'photo', title: 'No Photos' }), h('div.ph-lib-count', counts(list))];
            return [list.length ? gridEl(list) : ui.empty({ icon: 'photo', title: 'No Photos' }), list.length ? h('div.ph-lib-count', counts(list)) : null];
          },
        }));
        return page;
      }
      function lockedPage(id) {
        const page = ui.page({
          title: SMART[id].title, large: false, cls: 'ph-locked-page',
          content: () => [h('div.ph-locked',
            h('div.ph-locked-ic', JC.icon('lock.fill', { size: 46 })),
            h('div.ph-locked-t', SMART[id].title + ' is Locked'),
            h('div.ph-locked-s', 'Use Face ID to view this album.'),
            ui.btn({ text: 'View Album', kind: 'tinted', size: 'm', onTap: () => unlockAlbum(() => { tabs.nav().replace(albumPage(id)); }) }))],
        });
        return page;
      }
      function unlockAlbum(ok) {
        if (st.unlocked) { ok(); return; }
        passSheet({
          title: 'Photos',
          onOk: () => { st.unlocked = true; ok(); rerender(); },
        });
      }

      // ── people ────────────────────────────────────────────────────────────
      function peopleList() {
        const counted = K().PEOPLE.filter((pp) => !pp.noFace || JC.art.has(pp.face.art)).map((pp) => Object.assign({}, pp, { n: lib().filter((p) => K().peopleOf(p).includes(pp.id)).length })).filter((pp) => pp.n > 0);
        return counted.sort((a, b) => ((st.favPeople[b.id] ? 1 : 0) - (st.favPeople[a.id] ? 1 : 0)) || b.n - a.n);
      }
      function faceEl(pp, size) {
        const f = (pp.face && JC.art.has(pp.face.art)) ? pp.face : (pp.fallback || pp.face);
        const el = h('div.ph-face', { style: { width: size + 'px', height: size + 'px' } });
        el.style.backgroundImage = `url("${JC.art.url(f.art)}")`;
        el.style.backgroundSize = f.size || 'cover';
        el.style.backgroundPosition = f.pos || 'center';
        return el;
      }
      function personCircle(pp, size) {
        const el = h('div.ph-person', { onTap: () => push(personPage(pp.id)) }, h('div.ph-face-wrap', faceEl(pp, size), st.favPeople[pp.id] ? h('div.ph-face-fav', JC.icon('heart.fill', { size: 11 })) : null), h('div.ph-person-n', personName(pp.id)));
        ui.contextMenu(el, () => ({ items: personMenu(pp.id) }));
        return el;
      }
      function personMenu(id) {
        return [
          { text: st.favPeople[id] ? 'Unfavorite' : 'Favorite', icon: st.favPeople[id] ? 'heart.fill' : 'heart', onTap: () => { st.favPeople[id] = !st.favPeople[id]; rerender(); } },
          { text: 'Rename', icon: 'pencil', onTap: () => ui.alert({ title: 'Rename', input: { value: personName(id), placeholder: 'Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Done', style: 'default' }] }).then((r) => { if (r.index === 1 && (r.value || '').trim()) { st.peopleNames[id] = r.value.trim(); rerender(); } }) },
          { text: 'Play Memory Movie', icon: 'ph.memories', onTap: () => playMemory({ id: 'person-' + id, title: personName(id), sub: 'Through the Years', mood: id === 'fairy' ? 'uplifting' : 'gentle', list: () => lib().filter((p) => K().peopleOf(p).includes(id)) }) },
          { text: 'Feature Less', icon: 'hand.thumbsup.fill', onTap: () => ui.toast('You’ll see ' + personName(id) + ' less in Memories') },
        ];
      }
      function peoplePage() {
        return live(ui.page({
          title: 'People & Pets', large: true, cls: 'ph-people-page',
          right: [glassBtn({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            { text: 'Sort by Name', onTap: () => ui.toast('Sorted by name') },
            { text: 'Add People', icon: 'person.badge.plus', onTap: () => ui.alert({ title: 'Add People', message: 'Photos is still scanning your library for faces. Keep iPhone connected to power while it’s locked.', buttons: [{ text: 'OK' }] }) },
          ]) })],
          content: () => {
            const ppl = peopleList();
            const people = ppl.filter((p) => !p.pet), pets = ppl.filter((p) => p.pet);
            return [
              h('div.ph-ppl-grid', people.map((pp) => personCircle(pp, 108)), h('div.ph-person.unnamed', { onTap: () => ui.alert({ title: 'Add Name', message: 'This face appears in 1 photo from Koi Tower tonight — at the edge of the frame, mostly sleeve.', input: { placeholder: 'Add Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Done', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) ui.toast('Named “' + r.value + '”', { icon: 'person.crop.circle' }); }) }, h('div.ph-face-wrap', h('div.ph-face.unknown', { style: { width: '108px', height: '108px' } }, JC.icon('person.fill', { size: 46 }))), h('div.ph-person-n', 'Add Name'))),
              pets.length ? h('div.ph-subhead', 'Pets') : null,
              pets.length ? h('div.ph-ppl-grid', pets.map((pp) => personCircle(pp, 108))) : null,
            ];
          },
        }));
      }
      function personPage(id) {
        const pp = K().PEOPLE.find((x) => x.id === id);
        const list = () => lib().filter((p) => K().peopleOf(p).includes(id));
        return live(ui.page({
          title: personName(id), large: false, cls: 'ph-album',
          right: [glassBtn({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, personMenu(id)) })],
          content: () => {
            const l = list();
            const c = JC.contacts.get(id);
            return [
              h('div.ph-person-head', faceEl(pp, 120), h('div.ph-person-big', personName(id)), h('div.ph-person-sub', counts(l)),
                h('div.ph-person-acts',
                  ui.btn({ text: 'Play', icon: 'play.fill', kind: 'gray', size: 's', onTap: () => playMemory({ id: 'person-' + id, title: personName(id), sub: 'Through the Years', mood: id === 'fairy' ? 'uplifting' : 'gentle', list }) }),
                  c ? ui.btn({ text: 'Contact', icon: 'person.crop.circle', kind: 'gray', size: 's', onTap: () => JC.os.open('contacts', { contact: id }) }) : null)),
              gridEl(l),
              h('div.ph-lib-count', counts(l)),
            ];
          },
        }));
      }

      // ── memories ──────────────────────────────────────────────────────────
      function memCard(m, w, hh) {
        const key = memKey(m);
        const el = h('div.ph-memcard', { style: { width: w + 'px', height: hh + 'px' }, onTap: () => playMemory(m) },
          key ? K().box(key, w / hh, 'ph-memcard-img') : h('div.ph-pin-empty'),
          h('div.ph-memcard-shade'),
          h('div.ph-memcard-t', m.title), h('div.ph-memcard-s', m.sub),
          h('div.ph-memcard-play', JC.icon('play.fill', { size: 14 })));
        ui.contextMenu(el, () => ({ items: [
          { text: 'Play Memory', icon: 'play.fill', onTap: () => playMemory(m) },
          { text: 'Share Memory', icon: 'square.and.arrow.up', onTap: () => key && ui.share({ title: m.title, subtitle: 'Memory', art: key.art, payload: { kind: 'photo', art: key.art } }) },
          { text: 'Favorite Memory', icon: 'heart', onTap: () => ui.toast('Added to Favorite Memories', { icon: 'heart.fill' }) },
        ] }));
        return el;
      }
      function memoriesPage() {
        return live(ui.page({
          title: 'Memories', large: true, cls: 'ph-mem-page',
          right: [glassBtn({ icon: 'plus', onTap: () => ui.alert({ title: 'Create Memory Movie', message: 'Describe a story you want to see, like “A-Ling learning to drive”.', input: { placeholder: 'Describe a memory…' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Create', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) makeMemory(r.value); }) })],
          content: () => [h('div.ph-mem-list', MEMORIES.map((m) => memCard(m, 370, 300)))],
        }));
      }
      function makeMemory(q) {
        const res = searchPhotos(q).filter((p) => p.kind !== 'screenshot');
        if (!res.length) { ui.alert({ title: 'Couldn’t Create Memory', message: 'Photos couldn’t find enough photos for “' + q + '”. Try describing people, places or things in your library.', buttons: [{ text: 'OK' }] }); return; }
        playMemory({ id: 'custom', title: q.replace(/^\w/, (c) => c.toUpperCase()), sub: counts(res), mood: 'gentle', list: () => res });
      }

      // ── days, trips, featured ─────────────────────────────────────────────
      function recentDays() {
        const days = [];
        const map = {};
        lib().slice().reverse().forEach((p) => { const d = new Date(p.t); const k = d.toDateString(); if (!map[k]) { map[k] = { t: p.t, list: [] }; days.push(map[k]); } map[k].list.unshift(p); });
        return days;
      }
      function dayLabel(t) { const d = new Date(t); const diff = U.dayDiff(d, JC.time.date()); return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : diff < 7 ? U.DAYS[d.getDay()] : fmtMDY(t); }
      function dayCard(d) {
        const key = d.list.find((p) => p.kind !== 'screenshot') || d.list[0];
        return h('div.ph-daycard', { onTap: () => push(gridPage({ title: dayLabel(d.t), subtitle: fmtMDY(d.t), small: true, list: () => lib().filter((p) => U.sameDay(new Date(p.t), new Date(d.t))) })) },
          K().box(key, 180 / 220, 'ph-day-img'), h('div.ph-memcard-shade'),
          h('div.ph-day-t', dayLabel(d.t)), h('div.ph-day-s', d.list.length + (d.list.length === 1 ? ' item' : ' items')));
      }
      function daysPage() {
        return live(ui.page({ title: 'Recent Days', large: true, cls: 'ph-days-page', content: () => [h('div.ph-days-grid', recentDays().map((d) => dayCard(d)))] }));
      }
      const TRIPS = [
        { title: 'Lanling', sub: 'Oct 15 – 16, 2026', key: 'ph_hall', list: () => lib().filter((p) => K().cityOf(p) === 'lanling' && p.t >= JC.time.parse('-1 00:00')) },
        { title: 'Gusu', sub: 'Summer 2007', key: 'ph_hotpot07', list: () => lib().filter((p) => K().cityOf(p) === 'gusu' && yr(p) === 2007) },
        { title: 'Gusu', sub: 'April 2024', key: 'ph_hotpot24', list: () => lib().filter((p) => K().cityOf(p) === 'gusu' && yr(p) === 2024) },
      ];
      function tripCard(t) {
        const key = JC.store.get('photos', t.key) || t.list()[0];
        if (!key) return null;
        return h('div.ph-daycard.trip', { onTap: () => push(gridPage({ title: t.title, subtitle: t.sub, list: t.list })) },
          K().box(key, 180 / 220, 'ph-day-img'), h('div.ph-memcard-shade'), h('div.ph-day-t', t.title), h('div.ph-day-s', t.sub));
      }
      function featured() {
        const ids = ['ph_moon', 'ph_pond26', 'ph_fam07', 'ph_selfie', 'ph_park25', 'ph_dawn09', 'ph_fairy18', 'ph_lotus19'];
        return ids.map((id) => JC.store.get('photos', id)).filter((p) => p && !p.deleted && !p.hidden);
      }

      // ── places (stylised map) ────────────────────────────────────────────
      function mapSvg() {
        return `<svg viewBox="0 0 400 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="520" class="phm-sea"/>
          <path class="phm-land" d="M0 0h400v360c-20 10-40 40-34 80 4 30-10 60-40 80H0z"/>
          <path class="phm-park" d="M20 180c40-20 70 0 80 30s-20 60-60 56-46-70-20-86zM300 290c30-14 70 0 76 30 4 30-30 50-60 40s-40-60-16-70z"/>
          <path class="phm-mtn" d="M300 300l18-34 18 34zM322 312l22-40 22 40zM350 296l14-26 14 26zM40 200l16-30 16 30zM62 210l18-34 18 34z"/>
          <path class="phm-lake" d="M150 300c30-26 90-30 120-6 26 20 22 60-8 76-34 18-96 14-120-10-18-18-12-44 8-60z"/>
          <path class="phm-river" d="M0 250c50 0 70 20 110 30s50 20 60 30M270 330c30 10 50 40 80 50s40 30 50 60M160 0c10 40 0 80 20 110s60 60 70 100"/>
          <path class="phm-road" d="M168 74 C200 120 260 150 280 172 M280 172 C300 230 330 280 332 322 M280 172 C240 220 210 260 188 332 M188 332 C130 300 100 270 68 244 M168 74 C120 140 90 190 68 244"/>
          <path class="phm-road2" d="M188 332c40 0 100-10 144-10"/>
        </svg>`;
      }
      function cityGroups() {
        const g = {};
        lib().forEach((p) => { const c = K().cityOf(p); if (c) (g[c] = g[c] || []).push(p); });
        return g;
      }
      function mapEl(mini) {
        const wrap = h('div.ph-map' + (mini ? '.mini' : ''), { html: mapSvg() });
        const groups = cityGroups();
        Object.keys(K().CITIES).forEach((k) => {
          const c = K().CITIES[k];
          const ps = groups[k] || [];
          wrap.appendChild(h('div.ph-map-label', { style: { left: c.x * 100 + '%', top: c.y * 100 + '%' } }, c.name));
          if (!ps.length) return;
          const key = ps.slice().reverse().find((p) => p.kind !== 'screenshot') || ps[ps.length - 1];
          const pin = h('div.ph-map-pin', { style: { left: c.x * 100 + '%', top: c.y * 100 + '%' }, onTap: (e) => { if (mini) return; e.stopPropagation(); push(gridPage({ title: c.name, subtitle: counts(ps), list: () => lib().filter((p) => K().cityOf(p) === k) })); } },
            K().box(key, 1, 'ph-map-pin-img'), h('div.ph-map-pin-n', String(ps.length)));
          wrap.appendChild(pin);
        });
        return wrap;
      }
      function miniMap() { return h('div.ph-minimap', mapEl(true)); }
      function placesPage() {
        let mode = 0;
        const page = live(ui.page({
          title: 'Places', large: false, cls: 'ph-places',
          right: [glassBtn({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            { text: 'Map', checked: mode === 0, onTap: () => { mode = 0; page.render(); } },
            { text: 'Grid', checked: mode === 1, onTap: () => { mode = 1; page.render(); } },
            '-',
            { text: 'Open in Maps', icon: 'map', onTap: () => JC.os.open('maps', { place: 'lotus-pier' }) },
          ]) })],
          content: () => {
            if (mode === 1) {
              const groups = cityGroups();
              return [ui.list(Object.keys(groups).map((k) => ({ header: K().CITIES[k].name, rows: [{ custom: gridEl(groups[k]) }] })))];
            }
            const groups = cityGroups();
            return [mapEl(false), ui.list([{ header: 'Places', rows: Object.keys(groups).map((k) => ({ leading: K().box(groups[k][groups[k].length - 1], 1, 'ph-place-thumb'), title: K().CITIES[k].name, subtitle: counts(groups[k]), chevron: true, onTap: () => push(gridPage({ title: K().CITIES[k].name, subtitle: counts(groups[k]), list: () => lib().filter((p) => K().cityOf(p) === k) })) })) }])];
          },
        }));
        return page;
      }

      // ═══ SEARCH ═══════════════════════════════════════════════════════════
      const KEYWORDS = {
        p_fairy_roof: 'dog car pond night koi', p_koi_pond_car: 'car pond koi fish night', p_gala_hall: 'gala party chandelier peony hall', p_balcony_moon: 'moon night city balcony sky lights sleeve',
        p_jl_selfie_gala: 'selfie tuxedo peony', p_shot_gossip: 'balconygate gossip wavelet tea spiller', p_shot_bank: 'bank transfer allowance money', p_receipt: 'receipt dog food pet kingdom',
        p_taxi_night: 'taxi car rain night window', p_hotel_lobby: 'hotel lobby golden peony', p_car_keys: 'keys car sandu keychain', p_jl_learner: 'driving license permit car',
        p_puppies: 'dog dogs puppies puppy', p_dog_park: 'dog park golden retriever grass', p_childhood_dogs: 'dog dogs puppies jasmine princess love-love dock',
        p_family_2007: 'family dock sunset lake', p_kites: 'kites kite lake children', p_jl_kid: 'birthday cake child candles', p_jl_graduation: 'graduation flowers school',
        p_ajie_soup: 'soup pot stove kitchen food', p_ajie_wedding: 'wedding red bride', p_lotus_pond_day: 'lotus pond pavilion summer lake flowers', p_lotus_macro: 'lotus flower pink water',
        p_sunrise_lake: 'sunrise lake boat dawn', p_silver_bell: 'bell silver gift velvet', p_cake_lotus: 'cake sketch drawing birthday', p_tea_hanshi: 'tea cup steam window bamboo',
        p_lotus_root_soup: 'soup lotus root pork ribs food bowl', p_soup_fail: 'soup burnt smoke pot', p_radishes: 'radish radishes vegetables farm', p_hotpot_alumni: 'hotpot food restaurant laoma dinner chopsticks',
        p_cloud_recesses: 'gate mist mountains academy', p_rules_wall: 'wall rules stone', p_ops_meeting: 'whiteboard meeting office dog doodle', p_dogfriday_poster: 'poster dog sign',
        p_flute: 'flute tassel instrument', p_radish_cake: 'radish cake food plate', food_hotpot: 'hotpot food restaurant dinner laoma', food_congee: 'congee breakfast food',
        food_baozi: 'baozi buns food breakfast', food_milktea: 'milk tea bubble boba drink', food_lotus_cake: 'cake pastry dessert birthday lotus',
        av_fairy: 'dog black', wp_fairy: 'dog black', ph_fairy_puppy: 'dog puppy gift box birthday bow', ph_fairy_bath: 'dog bath bubbles tub', ph_fairy_office: 'dog office desk sleeping',
        p_moon_street: 'moon street rain night city', cam_selfie_dark: 'selfie hoodie dark night', cam_morning: 'morning window', p_gusu_moon: 'moon mist night rooftops',
      };
      function haystack(p) {
        const d = new Date(p.t);
        const parts = [p.caption, p.place, K().cityOf(p) ? K().CITIES[K().cityOf(p)].name : '', (p.albums || []).map((a) => albumTitle(a)).join(' '),
          K().peopleOf(p).map((id) => personName(id) + ' ' + (JC.contacts.get(id) ? JC.contacts.get(id).display + ' ' + (JC.contacts.get(id).nick || '') : '')).join(' '),
          JC.art.meta(p.art).title || '', (JC.art.meta(p.art).tags || []).join(' '), KEYWORDS[p.art] || '',
          String(d.getFullYear()), MONTHS[d.getMonth()], U.DAYS[d.getDay()],
          p.kind === 'video' ? 'video videos' : p.kind === 'screenshot' ? 'screenshot screenshots' : p.kind === 'live' ? 'live photo' : 'photo',
          p.mode || '', p.fav ? 'favorite favorites' : ''];
        return parts.join(' ').toLowerCase();
      }
      function searchPhotos(q) {
        const words = q.toLowerCase().split(/\s+/).filter(Boolean).map((w) => w.replace(/s$/, ''));
        if (!words.length) return [];
        return lib().filter((p) => { const hs = haystack(p); return words.every((w) => hs.includes(w)); });
      }
      function searchPage() {
        let q = '';
        const recent = ['hotpot', 'Fairy', 'Lotus Pier'];
        const page = live(ui.page({
          title: 'Search', large: true, cls: 'ph-search',
          search: { placeholder: 'Photos, People, Places…', onInput: (v) => { q = v; page.render(); }, onSubmit: (v) => { if (v && !recent.includes(v)) recent.unshift(v); } },
          content: () => {
            if (!q.trim()) {
              const ppl = peopleList();
              const groups = cityGroups();
              return [
                h('div.ph-subhead', 'People & Pets'),
                h('div.ph-ppl.hscroll.pad', ppl.map((pp) => h('div.ph-person', { onTap: () => setQ(personName(pp.id)) }, h('div.ph-face-wrap', faceEl(pp, 70)), h('div.ph-person-n', personName(pp.id))))),
                h('div.ph-subhead', 'Places'),
                h('div.ph-chips', Object.keys(groups).map((k) => h('div.ph-chip', { onTap: () => setQ(K().CITIES[k].name) }, JC.icon('ph.map.pin', { size: 15 }), K().CITIES[k].name))),
                h('div.ph-subhead', 'Categories'),
                h('div.ph-cats', [['Dogs', 'dog', 'ph_park25'], ['Food', 'food', 'ph_hotpot24'], ['Moon', 'moon', 'ph_moon'], ['Lotus', 'lotus flower', 'ph_lotus19'], ['Night', 'night', 'ph_taxi'], ['Cake', 'cake', 'ph_bday26'], ['Kites', 'kite', 'ph_kites03'], ['Videos', 'video', 'ph_lotus19']].map(([t, k, key]) => {
                  const r = searchPhotos(k);
                  const kp = JC.store.get('photos', key);
                  const cover = kp && !kp.deleted && !kp.hidden ? kp : r[r.length - 1];
                  return h('div.ph-cat', { onTap: () => setQ(k) }, cover ? K().box(cover, 1.6, 'ph-cat-img') : null, h('div.ph-memcard-shade'), h('div.ph-cat-t', t));
                })),
                h('div.ph-subhead', 'Recent Searches'),
                ui.list([{ rows: recent.slice(0, 5).map((r) => ({ icon: { node: h('div.ph-row-ic', JC.icon('clock', { size: 18 })) }, title: r, onTap: () => setQ(r) })) }]),
              ];
            }
            const res = searchPhotos(q);
            const ppl = peopleList().filter((pp) => personName(pp.id).toLowerCase().includes(q.toLowerCase()));
            const albums = userAlbums().filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));
            const out = [];
            if (ppl.length) out.push(h('div.ph-subhead', 'People & Pets'), h('div.ph-ppl.hscroll.pad', ppl.map((pp) => personCircle(pp, 70))));
            if (albums.length) out.push(h('div.ph-subhead', 'Albums'), h('div.ph-albums.hscroll', albums.map((a) => albumCard(a.id))));
            out.push(h('div.ph-subhead', res.length ? U.plural(res.length, 'Result') : 'No Results'));
            if (res.length) out.push(gridEl(res));
            else out.push(h('div.ph-noresult', 'No results for “' + q + '”. Try searching for people, places, or things like “dog” or “hotpot”.'));
            return out;
          },
        }));
        function setQ(v) { q = v; if (page.searchEl) { const s = page.searchEl.querySelector('.search'); if (s && s.setValue) s.setValue(v); } page.render(); }
        return page;
      }

      // ═══ ACTIONS ═══════════════════════════════════════════════════════════
      function toggleFav(p, quiet) {
        const on = !p.fav;
        JC.store.update('photos', p.id, { fav: on });
        JC.story.act('photo_fav', { id: p.id, on });
        if (!quiet) JC.audio.haptic(8);
        return on;
      }
      function favMany(ids) {
        if (!ids.length) return;
        const anyOff = ids.some((id) => { const p = JC.store.get('photos', id); return p && !p.fav; });
        ids.forEach((id) => { JC.store.update('photos', id, { fav: anyOff }); JC.story.act('photo_fav', { id, on: anyOff }); });
        ui.toast(anyOff ? 'Added to Favorites' : 'Removed from Favorites', { icon: anyOff ? 'heart.fill' : 'heart' });
      }
      function deleteMany(ids, after) {
        if (!ids.length) return;
        const n = ids.length;
        ui.actionSheet({
          message: n === 1 ? 'This photo will be deleted from iCloud Photos on all your devices. It will be in Recently Deleted for 30 days.' : 'These ' + n + ' items will be deleted from iCloud Photos on all your devices. They will be in Recently Deleted for 30 days.',
          actions: [{ text: n === 1 ? 'Delete Photo' : 'Delete ' + n + ' Items', style: 'destructive', onTap: () => {
            ids.forEach((id) => { JC.store.update('photos', id, { deleted: JC.time.now() }); JC.story.act('photo_delete', { id }); });
            after && after();
          } }],
        });
      }
      function recover(ids) {
        ids.forEach((id) => JC.store.update('photos', id, { deleted: null }));
        ui.toast(ids.length === 1 ? 'Recovered' : U.plural(ids.length, 'Item') + ' Recovered', { icon: 'arrow.counterclockwise' });
      }
      function deleteForever(ids, after) {
        ui.actionSheet({ message: 'This action can’t be undone.', actions: [{ text: ids.length === 1 ? 'Delete Photo' : 'Delete ' + ids.length + ' Items', style: 'destructive', onTap: () => { ids.forEach((id) => JC.store.remove('photos', id)); after && after(); } }] });
      }
      function hideMany(ids, on) {
        if (on) {
          ui.actionSheet({ message: ids.length === 1 ? 'This photo will be hidden, but can be found in the Hidden album.' : 'These items will be hidden, but can be found in the Hidden album.', actions: [{ text: ids.length === 1 ? 'Hide Photo' : 'Hide ' + ids.length + ' Items', onTap: () => { ids.forEach((id) => JC.store.update('photos', id, { hidden: true })); ui.toast('Hidden', { icon: 'eye.slash' }); } }] });
        } else {
          ids.forEach((id) => JC.store.update('photos', id, { hidden: false }));
          ui.toast('Unhidden', { icon: 'eye' });
        }
      }
      function duplicate(p) {
        const c = Object.assign({}, p, { id: U.uid('ph'), added: JC.time.now() });
        K().add(c);
        ui.toast('Duplicated', { icon: 'ph.duplicate' });
      }
      function addToAlbum(ids) {
        const s = ui.sheet({
          title: 'Add to Album', detent: 'large', left: { text: 'Cancel' },
          content: () => [
            h('div.ph-addalbum-new', { onTap: () => { s.close(); newAlbum((a) => { addIds(a.id); }); } }, h('div.ph-addalbum-plus', JC.icon('plus', { size: 30 })), h('div', 'New Album…')),
            h('div.ph-agrid', userAlbums().map((a) => {
              const cov = albumCover(a.id);
              return h('div.ph-acard.big', { onTap: () => { addIds(a.id); s.close(); } }, h('div.ph-acard-img', cov ? K().box(cov, 1, 'ph-acard-box') : h('div.ph-pin-empty', JC.icon('photo', { size: 30 }))), h('div.ph-acard-t', a.title), h('div.ph-acard-n', String(albumList(a.id).length)));
            })),
          ],
        });
        function addIds(aid) {
          ids.forEach((id) => { const p = JC.store.get('photos', id); if (p && !(p.albums || []).includes(aid)) JC.store.update('photos', id, { albums: (p.albums || []).concat(aid) }); });
          ui.toast('Added to “' + albumTitle(aid) + '”', { icon: 'ph.album.add' });
        }
      }
      function moreMany(anchor, ids, after, albumId) {
        if (!ids.length) { ui.toast('Select some items first'); return; }
        ui.menu(anchor, [
          { text: 'Add to Album', icon: 'ph.album.add', onTap: () => { addToAlbum(ids); after && after(); } },
          { text: 'Duplicate', icon: 'ph.duplicate', onTap: () => { ids.forEach((id) => { const p = JC.store.get('photos', id); if (p) duplicate(p); }); after && after(); } },
          { text: albumId === 'hidden' ? 'Unhide' : 'Hide', icon: 'eye.slash', onTap: () => { hideMany(ids, albumId !== 'hidden'); after && after(); } },
          { text: 'Slideshow', icon: 'play.fill', onTap: () => { const l = ids.map((id) => JC.store.get('photos', id)).filter(Boolean); playMemory({ id: 'sel', title: 'Slideshow', sub: counts(l), mood: 'gentle', list: () => l }); } },
          albumId && !SMART[albumId] ? { text: 'Remove from Album', icon: 'minus.circle.fill', onTap: () => { ids.forEach((id) => { const p = JC.store.get('photos', id); if (p) JC.store.update('photos', id, { albums: (p.albums || []).filter((x) => x !== albumId) }); }); after && after(); } } : null,
        ]);
      }
      function sharePhoto(p) {
        ui.share({
          title: p.caption ? p.caption : (p.kind === 'video' ? 'Video' : 'Photo'),
          subtitle: fmtMDY(p.t) + (placeName(p) ? ' · ' + placeName(p) : ''),
          art: p.art,
          payload: { kind: 'photo', art: p.art, text: p.caption || '' },
          actions: [
            { text: 'Add to Album', icon: 'ph.album.add', onTap: () => addToAlbum([p.id]) },
            { text: 'Duplicate', icon: 'ph.duplicate', onTap: () => duplicate(p) },
            { text: p.hidden ? 'Unhide' : 'Hide', icon: 'eye.slash', onTap: () => hideMany([p.id], !p.hidden) },
            { text: 'Use as Wallpaper', icon: 'iphone', onTap: () => useAsWallpaper(p) },
            { text: 'Slideshow', icon: 'play.fill', onTap: () => playMemory({ id: 'one', title: 'Slideshow', sub: '', mood: 'gentle', list: () => lib().filter((x) => x.kind !== 'screenshot').slice(-20) }) },
          ],
        });
      }
      function shareMany(ids) {
        const ps = ids.map((id) => JC.store.get('photos', id)).filter(Boolean);
        if (!ps.length) { ui.toast('Select some items first'); return; }
        ui.share({
          title: U.plural(ps.length, 'Item') + ' Selected', subtitle: counts(ps), art: ps[0].art,
          payload: { kind: 'photo', art: ps[0].art },
          onShareTo: (cid, th) => { ps.forEach((p) => JC.story.send(th, { img: p.art })); JC.audio.play('send'); ui.toast('Sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' }); },
        });
      }
      function useAsWallpaper(p) {
        ui.alert({ title: 'Use as Wallpaper?', message: 'Set this photo as the Lock Screen and Home Screen wallpaper.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Set', style: 'default', onTap: () => { JC.os.setWallpaper(p.art); ui.toast('Wallpaper Set', { icon: 'iphone' }); } }] });
      }
      function pickPhotos(cb) {
        const chosen = new Set();
        const s = ui.sheet({
          title: 'Add Photos', detent: 'large', left: { text: 'Cancel' }, right: { text: 'Add', onTap: () => { cb(Array.from(chosen)); } },
          content: () => {
            const list = lib();
            return [gridEl(list, { sel: chosen, onSelect: (p, c) => { if (chosen.has(p.id)) chosen.delete(p.id); else chosen.add(p.id); c.querySelector('.ph-cell-check').classList.toggle('on', chosen.has(p.id)); s.setTitle(chosen.size ? U.plural(chosen.size, 'Item') + ' Selected' : 'Add Photos'); } })];
          },
        });
        requestAnimationFrame(() => { s.body.scrollTop = s.body.scrollHeight; });
      }
      function accountSheet() {
        ui.sheet({
          title: 'Account', detent: 'large', right: { text: 'Done' },
          content: () => [
            h('div.ph-acct', ui.avatar('me', 76), h('div.ph-acct-n', 'Jiang Cheng'), h('div.ph-acct-e', 'jiang.cheng@lotuspier.yunmeng')),
            ui.list([
              { rows: [
                { icon: { glyph: 'cloud.fill', bg: 'var(--blue)' }, title: 'iCloud Photos', subtitle: 'Synced with iCloud Just Now', toggle: { on: true, onChange: (v) => { if (!v) { ui.alert({ title: 'Can’t Turn Off iCloud Photos', message: 'This iPhone is managed by Yunmeng Jiang Group. Contact your IT department. (Tang Mei.)', buttons: [{ text: 'OK' }] }); rerender(); } } } },
                { title: 'Optimize iPhone Storage', check: true, onTap: () => ui.toast('Optimizing storage') },
                { title: 'iCloud Storage', detail: '46.2 GB of 200 GB', onTap: () => ui.alert({ title: 'iCloud+ 200 GB', message: 'Photos 41.7 GB · Backups 3.1 GB · Messages 1.4 GB\n\nShared with: nobody. (A-Ling has his own. He made a point of it.)', buttons: [{ text: 'OK' }] }) },
              ] },
              { header: 'Sharing', rows: [
                { icon: { glyph: 'person.2.fill', bg: 'var(--orange)' }, title: 'Shared Library', detail: 'Off', chevron: true, onTap: () => ui.alert({ title: 'Shared Library', message: 'Jin Ling declined your Shared Library invitation. Twice. (“jiujiu i am NOT sharing my camera roll with u”)', buttons: [{ text: 'OK' }] }) },
                { icon: { glyph: 'rectangle.stack', bg: 'var(--blue)' }, title: 'Shared Albums', detail: 'On', chevron: true, onTap: () => ui.alert({ title: 'Shared Albums', message: '“A-Ling’s 18th 🎂” — 0 photos. Lan Jingyi has been invited and has not posted anything yet. Thankfully.', buttons: [{ text: 'OK' }] }) },
              ] },
              { header: 'Privacy', rows: [
                { title: 'Use Face ID', toggle: { on: true, onChange: () => ui.toast('Hidden and Recently Deleted albums are locked') } },
                { title: 'Show Hidden Album', toggle: { on: true, onChange: () => ui.toast('Hidden album visibility changed') } },
              ] },
            ]),
          ],
        });
      }
      function customizeSheet(page) {
        const names = { pinned: 'Pinned', albums: 'Albums', people: 'People & Pets', memories: 'Memories', days: 'Recent Days', trips: 'Trips', featured: 'Featured Photos', places: 'Places' };
        ui.sheet({
          title: 'Customize & Reorder', detent: 'large', right: { text: 'Done', onTap: () => { page.render(); } },
          content: () => [ui.list([{ footer: 'Choose which collections appear. Media Types and Utilities are always shown.', rows: Object.keys(names).map((k) => ({ title: names[k], toggle: { on: !st.hiddenSections[k], onChange: (v) => { st.hiddenSections[k] = !v; page.render(); } } })) }])],
        });
      }

      // ═══ PASSCODE ══════════════════════════════════════════════════════════
      function passSheet(o) {
        const settings = JC.state.d.settings || {};
        const code = settings.passcode || '181008';
        if (settings.faceAlt) {
          const fl = h('div.ph-faceok', JC.icon('checkmark.circle.fill', { size: 54 }), h('div', 'Face ID'));
          win.overlays.appendChild(fl);
          U.anim(fl, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 260 });
          setTimeout(() => { fl.remove(); o.onOk(); }, 700);
          return;
        }
        let entry = '';
        const dots = h('div.ph-pc-dots', [0, 1, 2, 3, 4, 5].map(() => h('div.ph-pc-dot')));
        const msg = h('div.ph-pc-msg', 'Face ID Not Recognized');
        const paint = () => Array.from(dots.children).forEach((d, i) => d.classList.toggle('on', i < entry.length));
        const press = (k) => {
          if (k === 'del') { entry = entry.slice(0, -1); paint(); return; }
          if (entry.length >= 6) return;
          JC.audio.play('key');
          entry += k;
          paint();
          if (entry.length === 6) setTimeout(check, 140);
        };
        const check = () => {
          if (entry === code) { s.close(); setTimeout(o.onOk, 200); return; }
          JC.audio.play('error');
          msg.textContent = 'Wrong Passcode — Try Again';
          U.anim(dots, [{ transform: 'translateX(0)' }, { transform: 'translateX(-12px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }], { duration: 380 });
          setTimeout(() => { entry = ''; paint(); }, 300);
        };
        const L = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
        const keys = h('div.ph-pc-keys', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) => {
          if (!k) return h('div.ph-pc-key.ghost');
          if (k === 'del') return h('div.ph-pc-key.fn', { onTap: () => press('del') }, JC.icon('delete.left', { size: 26 }));
          return h('div.ph-pc-key', { onTap: () => press(k) }, h('div.ph-pc-num', k), L[k] ? h('div.ph-pc-let', L[k]) : null);
        }));
        const onKey = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
        window.addEventListener('keydown', onKey);
        const s = ui.sheet({
          detent: 'large', cls: 'ph-pc-sheet', left: { text: 'Cancel' },
          onClose: () => window.removeEventListener('keydown', onKey),
          content: () => [h('div.ph-pc', h('div.ph-pc-lock', JC.icon('lock.fill', { size: 26 })), h('div.ph-pc-title', 'Enter iPhone Passcode for “' + o.title + '”'), msg, dots, keys)],
        });
        setTimeout(() => { if (!s.closed) msg.textContent = 'Enter iPhone Passcode'; }, 1400);
      }

      // ═══ VIEWER ═══════════════════════════════════════════════════════════
      function openViewer(list, index, fromEl, o) {
        if (viewer) viewer.close(true);
        viewer = Viewer(list.map((p) => p.id), index, fromEl, o || {});
      }
      function Viewer(ids, idx, fromEl, o) {
        const H = () => (JC.os.H || 874);
        let chrome = true, info = false, zoom = 1, panX = 0, panY = 0, playing = null;
        const el = h('div.ph-viewer');
        const track = h('div.ph-v-track');
        const slides = [h('div.ph-v-slide'), h('div.ph-v-slide'), h('div.ph-v-slide')];
        track.append(...slides);
        const tTitle = h('div.ph-v-t1'), tSub = h('div.ph-v-t2');
        const backBtn = glassBtn({ icon: 'chevron.left', cls: 'back', onTap: () => close() });
        const moreBtn = glassBtn({ icon: 'ellipsis', onTap: (e) => viewerMenu(e.currentTarget) });
        const liveBadge = h('div.ph-v-live', { hidden: true, onTap: (e) => liveMenu(e.currentTarget) }, JC.icon('ph.live', { size: 15 }), h('span', 'LIVE'), JC.icon('chevron.down', { size: 10, weight: 2.6 }));
        const top = h('div.ph-v-top', backBtn, h('div.ph-v-titles', tTitle, tSub), moreBtn);
        const strip = h('div.ph-v-strip.hscroll');
        const favBtn = h('div.ph-v-tb', { onTap: () => { const p = cur(); if (p && !p.deleted) { const on = toggleFav(p); favBtn.innerHTML = ''; favBtn.appendChild(JC.icon(on ? 'heart.fill' : 'heart', { size: 22 })); favBtn.classList.toggle('on', on); U.anim(favBtn, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320 }); } } });
        const infoBtn = h('div.ph-v-tb', { onTap: () => setInfo(!info) });
        const tools = h('div.ph-v-tools');
        const bottom = h('div.ph-v-bottom', strip, tools);
        const infoPanel = h('div.ph-v-info.scroll');
        const videoUI = h('div.ph-v-video', { hidden: true });
        el.append(track, top, liveBadge, videoUI, bottom, infoPanel);
        win.body.appendChild(el);
        win.setStatus(JC.os.dark ? 'light' : 'dark');

        const get = (i) => (i >= 0 && i < ids.length ? JC.store.get('photos', ids[i]) : null);
        const cur = () => get(idx);

        function photoArea() {
          // available stage for the photo
          if (info) return { top: 104, h: Math.max(180, H() * 0.42 - 112) };
          return { top: 0, h: H() };
        }
        function fill(slide, p, isCur) {
          slide.innerHTML = '';
          if (!p) return;
          const a = K().aspectOf(p);
          const ar = photoArea();
          let w = 402, hh = w / a;
          if (hh > ar.h) { hh = ar.h; w = hh * a; }
          const b = K().box(p, a, 'ph-v-photo');
          b.style.width = w + 'px';
          b.style.height = hh + 'px';
          b.style.top = (ar.top + (ar.h - hh) / 2) + 'px';
          b.style.left = ((402 - w) / 2) + 'px';
          slide.appendChild(b);
          if (p.kind === 'video' && isCur) slide.appendChild(h('div.ph-v-playbig', { style: { top: (ar.top + ar.h / 2 - 34) + 'px' }, onTap: (e) => { e.stopPropagation(); playVideo(); } }, JC.icon('play.fill', { size: 30 })));
        }
        function layout() {
          fill(slides[0], get(idx - 1));
          fill(slides[1], cur(), true);
          fill(slides[2], get(idx + 1));
          track.style.transform = 'translateX(-402px)';
          zoom = 1; panX = panY = 0;
        }
        function chromeRender() {
          const p = cur();
          if (!p) return;
          tTitle.textContent = p.deleted ? daysLeft(p) + ' left' : viewerTitle(p.t);
          tSub.textContent = p.deleted ? 'Recently Deleted' : U.fmtTime(p.t);
          liveBadge.hidden = p.kind !== 'live';
          liveBadge.classList.toggle('off', !!p.liveOff);
          // tools
          tools.innerHTML = '';
          if (p.deleted) {
            tools.append(
              h('div.ph-v-tb.text.red', { onTap: () => deleteForever([p.id], () => afterRemove()) }, 'Delete'),
              h('div.ph-v-tb.text', { onTap: () => { recover([p.id]); afterRemove(); } }, 'Recover'));
          } else {
            favBtn.innerHTML = '';
            favBtn.appendChild(JC.icon(p.fav ? 'heart.fill' : 'heart', { size: 22 }));
            favBtn.classList.toggle('on', !!p.fav);
            infoBtn.innerHTML = '';
            infoBtn.appendChild(JC.icon('info.circle', { size: 22 }));
            infoBtn.classList.toggle('on', info);
            tools.append(
              h('div.ph-v-tb', { onTap: () => sharePhoto(p) }, JC.icon('square.and.arrow.up', { size: 22 })),
              favBtn, infoBtn,
              h('div.ph-v-tb', { onTap: () => openEditor(p) }, JC.icon('slider.horizontal.3', { size: 22 })),
              h('div.ph-v-tb', { onTap: () => deleteMany([p.id], () => afterRemove()) }, JC.icon('trash', { size: 22 })));
          }
          // filmstrip
          strip.innerHTML = '';
          if (ids.length > 1) {
            ids.forEach((id, i) => {
              const q = JC.store.get('photos', id);
              if (!q) return;
              const t = h('div.ph-v-thumb', { class: { on: i === idx }, onTap: () => go(i - idx, true) }, K().box(q, i === idx ? K().aspectOf(q) : 0.62, 'ph-v-thumb-img'));
              strip.appendChild(t);
            });
            requestAnimationFrame(() => { const on = strip.querySelector('.ph-v-thumb.on'); if (on) strip.scrollLeft = on.offsetLeft - 201 + on.offsetWidth / 2; });
          }
          if (info) renderInfo();
          stopVideo();
          videoUI.hidden = true;
        }
        function render() { layout(); chromeRender(); }
        function afterRemove() {
          const p = cur();
          if (p && ((o.albumId === 'deleted' && p.deleted) || (o.albumId !== 'deleted' && !p.deleted && !(p.hidden && o.albumId !== 'hidden')))) { render(); return; }
          ids.splice(idx, 1);
          if (!ids.length) { close(); return; }
          if (idx >= ids.length) idx = ids.length - 1;
          render();
          act();
        }
        function act() { const p = cur(); if (p) JC.story.act('photo_view', { id: p.id }); }
        function go(d, instant) {
          const ni = idx + d;
          if (ni < 0 || ni >= ids.length || d === 0) { snap(); return; }
          if (instant || Math.abs(d) > 1) { idx = ni; render(); act(); return; }
          const to = d > 0 ? -804 : 0;
          U.anim(track, [{ transform: track.style.transform }, { transform: `translateX(${to}px)` }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' }).then(() => {
            track.getAnimations().forEach((a) => a.cancel());
            idx = ni;
            render();
            act();
          });
        }
        function snap() { U.anim(track, [{ transform: track.style.transform }, { transform: 'translateX(-402px)' }], { duration: 220 }).then(() => { track.getAnimations().forEach((a) => a.cancel()); track.style.transform = 'translateX(-402px)'; }); }
        function setChrome(on) {
          chrome = on;
          el.classList.toggle('bare', !on);
          win.setStatus(!on || JC.os.dark ? 'light' : 'dark');
        }
        function setInfo(on) {
          info = on;
          el.classList.toggle('info', on);
          if (on) { setChrome(true); renderInfo(); }
          layout();
          infoBtn.classList.toggle('on', on);
        }
        function renderInfo() {
          const p = cur();
          if (!p) return;
          const K_ = K();
          const dev = K_.devOf(p);
          const ex = K_.exifOf(p);
          const d = new Date(p.t);
          const cap = ui.input({ placeholder: 'Add a Caption', value: p.caption || '', cls: 'ph-cap', enterkey: 'done', onSubmit: (v, inp) => inp.blur() });
          cap.addEventListener('change', () => JC.store.update('photos', p.id, { caption: cap.value }));
          cap.addEventListener('blur', () => { if ((p.caption || '') !== cap.value) JC.store.update('photos', p.id, { caption: cap.value }); });
          const city = K_.cityOf(p);
          const ppl = K_.peopleOf(p).filter((id) => K_.PEOPLE.find((x) => x.id === id));
          const look = LOOKUP[p.art];
          infoPanel.innerHTML = '';
          [
            h('div.ph-i-grab', { onTap: () => setInfo(false) }),
            cap,
            h('div.ph-i-date', h('span', U.DAYS[d.getDay()] + ' • ' + fmtMDY(p.t) + ' • ' + U.fmtTime(p.t)), h('span.ph-i-adj', { onTap: () => adjustDate(p) }, 'Adjust')),
            p.from ? h('div.ph-i-from', JC.icon('message.fill', { size: 14 }), h('span', 'From ' + JC.contacts.name(p.from) + ' in Messages')) : null,
            h('div.ph-i-card',
              h('div.ph-i-dev', h('span', dev.dev), dev.fmt ? h('span.ph-i-fmt', dev.fmt) : null),
              h('div.ph-i-rows',
                dev.lens ? h('div', dev.lens) : null,
                h('div', [dev.mp, dev.res, dev.size].filter(Boolean).join(' • ') + (p.kind === 'video' ? ' • ' + K_.dur(p.dur) : '')),
                p.mode ? h('div', { class: 'ph-i-mode' }, { portrait: 'Portrait', selfie: 'Selfie', pano: 'Panorama', slomo: 'Slo-mo', cinematic: 'Cinematic', timelapse: 'Time-lapse' }[p.mode] || '') : null),
              ex ? h('div.ph-i-exif', [ex.iso, ex.mm, ex.ev, ex.f, ex.sh].map((x) => h('span', x))) : null),
            look ? h('div.ph-i-look', { onTap: () => lookUp(p, look) }, JC.icon('ph.lookup', { size: 20 }), h('div', h('div.ph-i-look-t', 'Look Up – ' + look.kind), h('div.ph-i-look-s', look.name)), JC.icon('chevron.right', { size: 13, weight: 2.4 })) : null,
            ppl.length ? h('div.ph-i-sec', 'People') : null,
            ppl.length ? h('div.ph-i-ppl', ppl.map((id) => { const pp = K_.PEOPLE.find((x) => x.id === id); return h('div.ph-person.sm', { onTap: () => { close(); tabs.select('collections'); tabs.nav().push(personPage(id)); } }, h('div.ph-face-wrap', faceEl(pp, 46)), h('div.ph-person-n', personName(id))); })) : null,
            city ? h('div.ph-i-map', { onTap: () => { close(); tabs.select('collections'); tabs.nav().push(gridPage({ title: K_.CITIES[city].name, list: () => lib().filter((q) => K_.cityOf(q) === city) })); } }, h('div.ph-i-mapbox', mapEl(true)), h('div.ph-i-place', h('div.ph-i-place-t', placeName(p)), h('div.ph-i-place-s', 'Show nearby photos'))) : h('div.ph-i-noloc', { onTap: () => adjustLocation(p) }, JC.icon('location', { size: 16 }), 'Add a Location'),
            city ? h('div.ph-i-adjloc', { onTap: () => adjustLocation(p) }, 'Adjust Location') : null,
            (p.albums || []).length ? h('div.ph-i-sec', 'Albums') : null,
            (p.albums || []).length ? h('div.ph-i-albums', p.albums.map((a) => h('div.ph-chip', { onTap: () => { close(); tabs.select('collections'); tabs.nav().push(albumPage(a)); } }, albumTitle(a)))) : null,
          ].forEach((n) => { if (n) infoPanel.appendChild(n); });
        }
        function adjustDate(p) {
          const d = new Date(p.t);
          let v = [d.getMonth(), d.getDate(), d.getFullYear(), d.getHours(), d.getMinutes()];
          const years = []; for (let y = 1995; y <= 2026; y++) years.push(y);
          ui.sheet({
            title: 'Adjust Date & Time', detent: 'medium', left: { text: 'Cancel' },
            right: { text: 'Adjust', onTap: () => { const nd = new Date(v[2], v[0], Math.min(v[1], 28 + 3), v[3], v[4]); JC.store.update('photos', p.id, { t: nd.getTime() }); ui.toast('Date Adjusted', { icon: 'calendar' }); } },
            content: () => [h('div.ph-wheelwrap', ui.wheel({ cols: [
              { items: MONTHS.map((m, i) => ({ label: m.slice(0, 3), value: i })), value: v[0] },
              { items: Array.from({ length: 31 }, (_, i) => i + 1), value: v[1], width: 50 },
              { items: years, value: v[2], width: 70 },
              { items: Array.from({ length: 24 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), value: v[3], width: 50 },
              { items: Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: i })), value: v[4], width: 50 },
            ], onChange: (vals) => { v = vals; } })), h('div.ph-wheel-note', 'Original: ' + fmtMDY(p.t) + ' at ' + U.fmtTime(p.t))],
          });
        }
        function adjustLocation(p) {
          const opts = ['Koi Tower, Lanling', 'Golden Peony Hotel, Lanling', 'Lanling', 'Lotus Pier, Yunmeng', 'Lotus Pier HQ, Yunmeng', 'Yunmeng Lake, Yunmeng', 'Cloud Recesses, Gusu', 'The Hanshi, Gusu', 'Laoma Hotpot (老妈火锅), Gusu', 'The Unclean Realm, Qinghe', 'Yiling Radish Co., Yiling'];
          const s = ui.sheet({
            title: 'Adjust Location', detent: 'large', left: { text: 'Cancel' },
            content: () => [ui.list([{ rows: opts.map((o2) => ({ icon: { node: h('div.ph-row-ic', JC.icon('ph.map.pin', { size: 20 })) }, title: o2, check: o2 === p.place, onTap: () => { JC.store.update('photos', p.id, { place: o2, city: K().cityOf({ place: o2 }) }); s.close(); } })) }, { rows: [{ title: 'No Location', destructive: true, onTap: () => { JC.store.update('photos', p.id, { place: '', city: null }); s.close(); } }] }])],
          });
        }
        function viewerMenu(anchor) {
          const p = cur();
          if (!p) return;
          if (p.deleted) { ui.menu(anchor, [{ text: 'Recover', icon: 'arrow.counterclockwise', onTap: () => { recover([p.id]); afterRemove(); } }, { text: 'Delete', icon: 'trash', destructive: true, onTap: () => deleteForever([p.id], afterRemove) }]); return; }
          ui.menu(anchor, [
            { text: 'Copy', icon: 'doc.on.doc', onTap: () => ui.toast('Copied', { icon: 'doc.on.doc' }) },
            { text: 'Duplicate', icon: 'ph.duplicate', onTap: () => duplicate(p) },
            { text: p.hidden ? 'Unhide' : 'Hide', icon: 'eye.slash', onTap: () => { if (p.hidden) { hideMany([p.id], false); afterRemove(); } else hideMany([p.id], true); } },
            { text: 'Slideshow', icon: 'play.fill', onTap: () => { const l = ids.map((id) => JC.store.get('photos', id)).filter((q) => q && q.kind !== 'screenshot'); playMemory({ id: 'viewer', title: 'Slideshow', sub: '', mood: 'gentle', list: () => l, start: Math.max(0, l.indexOf(p)) }); } },
            '-',
            { text: 'Add to Album', icon: 'ph.album.add', onTap: () => addToAlbum([p.id]) },
            { text: 'Adjust Date & Time', icon: 'calendar', onTap: () => adjustDate(p) },
            { text: 'Adjust Location', icon: 'location', onTap: () => adjustLocation(p) },
            '-',
            { text: 'Use as Wallpaper', icon: 'iphone', onTap: () => useAsWallpaper(p) },
            K().isEdited(p) ? { text: 'Revert to Original', icon: 'arrow.counterclockwise', onTap: () => { JC.store.update('photos', p.id, { edit: null }); ui.toast('Reverted to Original'); } } : null,
            { text: 'Save to Files', icon: 'folder', onTap: () => ui.alert({ title: 'Files Unavailable', message: 'iCloud Drive is managed by Yunmeng Jiang Group IT. Ask Tang Mei.', buttons: [{ text: 'OK' }] }) },
          ]);
        }
        function liveMenu(anchor) {
          const p = cur();
          ui.menu(anchor, [
            { text: 'Live', icon: 'ph.live', checked: !p.liveOff && !p.loop, onTap: () => { JC.store.update('photos', p.id, { liveOff: false, loop: null }); playLive(); } },
            { text: 'Loop', icon: 'ph.loop', checked: p.loop === 'loop', onTap: () => { JC.store.update('photos', p.id, { loop: 'loop', liveOff: false }); playLive(true); } },
            { text: 'Bounce', icon: 'arrow.left', checked: p.loop === 'bounce', onTap: () => { JC.store.update('photos', p.id, { loop: 'bounce', liveOff: false }); playLive(true); } },
            { text: 'Long Exposure', icon: 'ph.slomo', checked: p.loop === 'long', onTap: () => { JC.store.update('photos', p.id, { loop: 'long', liveOff: false }); ui.toast('Long Exposure'); } },
            { text: 'Off', icon: 'nosign', checked: !!p.liveOff, onTap: () => JC.store.update('photos', p.id, { liveOff: true }) },
          ]);
        }
        function playLive(loop) {
          const p = cur();
          if (!p || p.kind !== 'live' || p.liveOff) return;
          const b = slides[1].querySelector('.ph-v-photo');
          if (!b) return;
          JC.audio.play('swoosh');
          U.anim(b, [{ transform: 'scale(1)', filter: 'blur(0)' }, { transform: 'scale(1.05)', filter: 'blur(1.2px)', offset: 0.2 }, { transform: 'scale(1.03) translateX(-4px)', filter: 'blur(0)' }, { transform: 'scale(1)' }], { duration: loop ? 2400 : 1500, iterations: loop ? 2 : 1, fill: 'none' });
        }
        // video playback (Ken Burns over the frame + timeline)
        let vAudio = null;
        function playVideo() {
          const p = cur();
          if (!p || p.kind !== 'video') return;
          const b = slides[1].querySelector('.ph-v-photo');
          const big = slides[1].querySelector('.ph-v-playbig');
          if (big) big.remove();
          const dur = Math.max(3, p.dur || 10);
          let muted = false;
          const t0 = performance.now();
          let paused = false, pausedAt = 0, offset = 0;
          const bar = h('div.ph-vid-fill');
          const timeL = h('span.ph-vid-time', '0:00'), timeR = h('span.ph-vid-time', '-' + K().dur(dur));
          const ppBtn = h('div.ph-vid-btn', { onTap: () => { paused = !paused; if (paused) { pausedAt = performance.now(); anim && anim.pause(); } else { offset += performance.now() - pausedAt; anim && anim.play(); } ppBtn.innerHTML = ''; ppBtn.appendChild(JC.icon(paused ? 'play.fill' : 'pause.fill', { size: 18 })); vAudioSet(); } }, JC.icon('pause.fill', { size: 18 }));
          const muteBtn = h('div.ph-vid-btn', { onTap: () => { muted = !muted; muteBtn.innerHTML = ''; muteBtn.appendChild(JC.icon(muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill', { size: 17 })); vAudioSet(); } }, JC.icon('speaker.wave.2.fill', { size: 17 }));
          videoUI.innerHTML = '';
          videoUI.append(ppBtn, timeL, h('div.ph-vid-track', bar), timeR, muteBtn);
          videoUI.hidden = false;
          const anim = b ? b.animate([{ transform: 'scale(1) translate(0,0)' }, { transform: `scale(${p.mode === 'slomo' ? 1.06 : 1.14}) translate(${(K().hash(p.id) % 2 ? -1 : 1) * 10}px, -6px)` }], { duration: dur * 1000, easing: 'linear', fill: 'forwards' }) : null;
          vAudio = videoNoise(p);
          const vAudioSet = () => { if (vAudio) vAudio.gain(paused || muted ? 0 : 1); };
          vAudioSet();
          playing = setInterval(() => {
            if (paused) return;
            const el2 = (performance.now() - t0 - offset) / 1000;
            const k = Math.min(1, el2 / dur);
            bar.style.width = k * 100 + '%';
            timeL.textContent = K().dur(el2);
            timeR.textContent = '-' + K().dur(Math.max(0, dur - el2));
            if (k >= 1) { stopVideo(); if (anim) anim.cancel(); fill(slides[1], cur(), true); videoUI.hidden = true; }
          }, 200);
        }
        function stopVideo() {
          clearInterval(playing);
          playing = null;
          if (vAudio) { vAudio.stop(); vAudio = null; }
        }
        // double-tap zoom & pan
        let tapT = null;
        ui.onTap(track, (e) => {
          if (tapT) {
            clearTimeout(tapT); tapT = null;
            const b = slides[1].querySelector('.ph-v-photo');
            if (!b) return;
            if (zoom > 1) { zoom = 1; panX = panY = 0; b.style.transform = ''; return; }
            const r = ui.toLocal(b.getBoundingClientRect());
            const pt = ui.toLocal({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
            b.style.transformOrigin = `${pt.x - r.x}px ${pt.y - r.y}px`;
            zoom = 2.4;
            b.style.transition = 'transform .3s cubic-bezier(.2,.8,.2,1)';
            b.style.transform = `scale(${zoom})`;
            setTimeout(() => { b.style.transition = ''; }, 320);
            return;
          }
          tapT = setTimeout(() => { tapT = null; if (info) setInfo(false); else setChrome(!chrome); }, 240);
        });
        U.longPress(track, () => playLive(), 420);
        U.drag(track, {
          start: (e, p) => { if (zoom > 1) { track._pan = [panX, panY]; return true; } return true; },
          move: (e, p) => {
            if (zoom > 1) {
              const b = slides[1].querySelector('.ph-v-photo');
              panX = track._pan[0] + p.dx; panY = track._pan[1] + p.dy;
              if (b) b.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
              return;
            }
            if (p.axis === 'x') {
              let dx = p.dx;
              if ((idx === 0 && dx > 0) || (idx === ids.length - 1 && dx < 0)) dx /= 3;
              track.style.transform = `translateX(${-402 + dx}px)`;
            } else if (p.dy > 0 && !info) {
              const k = Math.min(1, p.dy / 400);
              slides[1].style.transform = `translate(${p.dx * 0.6}px, ${p.dy}px) scale(${1 - k * 0.3})`;
              el.style.setProperty('--bgA', String(1 - k));
              el.classList.add('dragging');
            } else if (p.dy < 0 && !info) {
              slides[1].style.transform = `translateY(${p.dy / 3}px)`;
            } else if (info && p.dy > 0) {
              infoPanel.style.transform = `translateY(${p.dy}px)`;
            }
          },
          end: (e, p) => {
            if (zoom > 1) return;
            el.classList.remove('dragging');
            if (p.axis === 'x') {
              if (p.dx < -70 || p.vx < -0.45) go(1);
              else if (p.dx > 70 || p.vx > 0.45) go(-1);
              else snap();
              return;
            }
            slides[1].style.transform = '';
            infoPanel.style.transform = '';
            el.style.removeProperty('--bgA');
            if (info) { if (p.dy > 80) setInfo(false); return; }
            if (p.dy > 110 || p.vy > 0.6) close();
            else if (p.dy < -60) setInfo(true);
          },
        });
        const onKey = (e) => {
          if (!JC.os.isOpen('photos') || editor || memory) return;
          if (e.key === 'ArrowRight') go(1, false);
          else if (e.key === 'ArrowLeft') go(-1, false);
          else if (e.key === 'ArrowUp') setInfo(true);
          else if (e.key === 'ArrowDown') { if (info) setInfo(false); }
        };
        window.addEventListener('keydown', onKey);

        function close(instant) {
          stopVideo();
          window.removeEventListener('keydown', onKey);
          if (viewer === api) viewer = null;
          win.setStatus('auto');
          const fin = () => el.remove();
          if (instant) { fin(); return; }
          U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).then(fin);
          const b = slides[1].querySelector('.ph-v-photo');
          if (b) U.anim(b, [{ transform: b.style.transform || 'scale(1)' }, { transform: 'scale(.86)' }], { duration: 220 });
        }
        const api = {
          close,
          back() { if (info) { setInfo(false); return true; } close(); return true; },
          refresh() {
            const p = cur();
            if (!p) { afterRemove(); return; }
            chromeRender();
            fill(slides[1], p, true);
          },
          go,
        };
        render();
        act();
        // opening animation from the thumbnail
        const b = slides[1].querySelector('.ph-v-photo');
        if (fromEl && b) {
          const r = ui.toLocal(fromEl.getBoundingClientRect());
          const br = ui.toLocal(b.getBoundingClientRect());
          const sx = r.w / br.w;
          U.anim(b, [{ transform: `translate(${r.x + r.w / 2 - (br.x + br.w / 2)}px, ${r.y + r.h / 2 - (br.y + br.h / 2)}px) scale(${sx})`, opacity: 0.6 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'none' });
        }
        U.anim(el, [{ '--bgA': 0, opacity: 0.2 }, { opacity: 1 }], { duration: 260, fill: 'none' });
        return api;
      }
      function videoNoise(p) {
        try {
          const ctx = JC.audio.ctx();
          if (!ctx || ctx.state !== 'running') return null;
          const len = ctx.sampleRate * 2;
          const buf = ctx.createBuffer(1, len, ctx.sampleRate);
          const d = buf.getChannelData(0);
          let last = 0;
          for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
          const src = ctx.createBufferSource();
          src.buffer = buf; src.loop = true;
          const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = p.art === 'p_kites' ? 900 : 500;
          const g = ctx.createGain(); g.gain.value = 0;
          src.connect(f); f.connect(g); g.connect(JC.audio.out || ctx.destination);
          src.start();
          return {
            gain(v) { g.gain.setTargetAtTime(v * 0.18, ctx.currentTime, 0.15); },
            stop() { g.gain.setTargetAtTime(0, ctx.currentTime, 0.1); setTimeout(() => { try { src.stop(); } catch (e) { /* ignore */ } }, 400); },
          };
        } catch (e) { return null; }
      }
      const LOOKUP = {
        p_fairy_roof: { kind: 'Dog', name: 'Newfoundland (possible mix)', text: 'Newfoundlands are giant working dogs known for their calm temperament and love of water. They are not known for their love of koi ponds. Possible mix: Tibetan Mastiff, “unknown, very large”.' },
        av_fairy: { kind: 'Dog', name: 'Newfoundland (possible mix)', text: 'A giant, gentle breed with a thick black coat. Sheds enormously. Excellent swimmer.' },
        wp_fairy: { kind: 'Dog', name: 'Newfoundland (possible mix)', text: 'A giant, gentle breed with a thick black coat. Sheds enormously. Excellent swimmer.' },
        ph_fairy_puppy: { kind: 'Dog', name: 'Newfoundland puppy', text: 'Newfoundland puppies grow to 45–70 kg. Plan accordingly.' },
        ph_fairy_bath: { kind: 'Dog', name: 'Newfoundland (wet)', text: 'Newfoundlands have water-resistant double coats. Most enjoy baths. Results may vary.' },
        ph_fairy_office: { kind: 'Dog', name: 'Newfoundland', text: 'A giant, gentle breed. Often found asleep under desks.' },
        p_dog_park: { kind: 'Dog', name: 'Golden Retriever', text: 'Friendly, intelligent and devoted. Golden Retrievers are among the most popular family dogs.' },
        p_childhood_dogs: { kind: 'Dog', name: 'Mixed-breed puppies', text: 'Three puppies, approximately 8–10 weeks old.' },
        p_puppies: { kind: 'Dog', name: 'Puppies', text: 'Shiba Inu, Border Collie and Golden Retriever puppies. Studies show puppy photos reduce stress in most people.' },
        p_lotus_macro: { kind: 'Plant', name: 'Sacred Lotus (Nelumbo nucifera)', text: 'An aquatic perennial native to Asia. Its seeds can remain viable for centuries. Flowers open in the early morning.' },
        p_lotus_pond_day: { kind: 'Plant', name: 'Sacred Lotus (Nelumbo nucifera)', text: 'Lotus blooms peak in July and August in the Yunmeng lake region.' },
        p_gala_hall: { kind: 'Landmark', name: 'Koi Tower, Lanling', text: 'Headquarters of the Jin Group. Its forecourt koi pond is one of Lanling’s most photographed sights.' },
        p_cloud_recesses: { kind: 'Landmark', name: 'Cloud Recesses, Gusu', text: 'Campus of Gusu Lan Academy, known for its mountain mist and a wall of three thousand rules.' },
        p_rules_wall: { kind: 'Landmark', name: 'Wall of Rules, Cloud Recesses', text: 'Over 3,000 rules carved in stone. Rule 1,412: No running.' },
        p_balcony_moon: { kind: 'Landmark', name: 'Lanling skyline', text: 'Viewed from Koi Tower’s east balcony.' },
        p_hotpot_alumni: { kind: 'Food', name: 'Chongqing hotpot', text: 'Laoma Hotpot (老妈火锅), Gusu — a spicy beef-tallow broth with tripe, duck intestine and lotus root. Rated 4.6.' },
        food_hotpot: { kind: 'Food', name: 'Hotpot', text: 'A simmering pot of broth shared at the table. This one: Laoma Hotpot (老妈火锅), Gusu.' },
        p_lotus_root_soup: { kind: 'Food', name: 'Lotus root & pork rib soup', text: 'A Hubei classic, simmered for hours until the lotus root turns pink and the strands stretch when bitten.' },
        p_ajie_soup: { kind: 'Food', name: 'Lotus root & pork rib soup', text: 'A Hubei classic, simmered for hours until the lotus root turns pink.' },
        p_radishes: { kind: 'Plant', name: 'White radish (daikon)', text: 'A mild winter radish. These ones are unusually large.' },
        p_flute: { kind: 'Art', name: 'Dizi (bamboo flute)', text: 'A traditional Chinese transverse flute. This one is black, with a red tassel.' },
        p_silver_bell: { kind: 'Art', name: 'Silver bell, lotus motif', text: 'Hand-engraved silver with a nine-petal lotus. Likely a family heirloom.' },
      };
      function lookUp(p, look) {
        ui.sheet({
          title: 'Look Up', detent: 'medium', right: { text: 'Done' },
          content: () => [h('div.ph-lookup', K().box(p, 1.5, 'ph-lookup-img'), h('div.ph-lookup-k', look.kind), h('div.ph-lookup-t', look.name), h('div.ph-lookup-x', look.text),
            ui.btn({ text: 'Search the Web', icon: 'safari', kind: 'gray', size: 'm', onTap: () => JC.os.open('safari', { search: look.name }) }))],
        });
      }

      // ═══ EDITOR ═══════════════════════════════════════════════════════════
      function openEditor(p) {
        if (editor) return;
        const orig = JSON.parse(JSON.stringify(p.edit || {}));
        const e = JSON.parse(JSON.stringify(p.edit || {}));
        e.adj = e.adj || {};
        let tab = 'adjust';
        let tool = 'exposure';
        const el = h('div.ph-editor');
        const stage = h('div.ph-e-stage');
        const photo = h('div.ph-e-photo');
        stage.appendChild(photo);
        const toolLabel = h('div.ph-e-tool');
        const panel = h('div.ph-e-panel');
        const tabsEl = h('div.ph-e-tabs');
        const revert = h('div.ph-e-revert', { onTap: () => { Object.keys(e).forEach((k) => delete e[k]); e.adj = {}; draw(); renderPanel(); } }, 'Revert');
        const top = h('div.ph-e-top',
          glassBtn({ text: 'Cancel', onTap: () => cancel() }),
          h('div.ph-e-mid', toolLabel, revert),
          glassBtn({ icon: 'checkmark', prominent: true, cls: 'ph-e-done', onTap: () => done() }));
        el.append(top, stage, panel, tabsEl);
        win.body.appendChild(el);
        win.setStatus('light');
        editor = { back: () => { cancel(); return true; } };
        U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });

        function changed() { return JSON.stringify(clean(e)) !== JSON.stringify(clean(orig)); }
        function clean(x) { const c = JSON.parse(JSON.stringify(x || {})); if (c.adj) { Object.keys(c.adj).forEach((k) => { if (!c.adj[k]) delete c.adj[k]; }); if (!Object.keys(c.adj).length) delete c.adj; } Object.keys(c).forEach((k) => { if (c[k] === 0 || c[k] === false || c[k] === null || c[k] === 'none') delete c[k]; }); return c; }
        function draw() {
          const a = K().aspectOf(p, e);
          let w = 370, hh = w / a;
          const maxH = (JC.os.H || 874) - 380;
          if (hh > maxH) { hh = maxH; w = hh * a; }
          photo.style.width = w + 'px';
          photo.style.height = hh + 'px';
          K().paint(photo, p, a, e);
          revert.hidden = !K().isEdited({ edit: clean(e) });
        }
        function ruler(o) {
          // iOS-style scrubbing ruler. o: {value, min, max, onInput}
          let v = o.value || 0;
          const val = h('div.ph-r-val');
          const ticks = h('div.ph-r-ticks');
          const el2 = h('div.ph-ruler', val, h('div.ph-r-window', ticks, h('div.ph-r-mark')));
          const paintR = () => { ticks.style.transform = `translateX(${-v * 2.2}px)`; val.textContent = String(Math.round(v)); val.classList.toggle('zero', !Math.round(v)); };
          U.drag(el2, {
            axis: 'x', threshold: 2,
            start: () => { el2._v = v; },
            move: (ev, pp) => { v = U.clamp(el2._v - pp.dx / 2.2, o.min, o.max); if (Math.abs(v) < 2) v = 0; paintR(); o.onInput(Math.round(v)); },
          });
          ui.onTap(el2, () => {});
          el2.addEventListener('dblclick', () => { v = 0; paintR(); o.onInput(0); });
          paintR();
          return el2;
        }
        function renderPanel() {
          panel.innerHTML = '';
          tabsEl.innerHTML = '';
          [['adjust', 'Adjust', 'ph.dial'], ['filters', 'Filters', 'ph.filters'], ['crop', 'Crop', 'crop.rotate']].forEach(([id, t, ic]) => tabsEl.appendChild(h('div.ph-e-tab', { class: { on: tab === id }, onTap: () => { tab = id; renderPanel(); } }, JC.icon(ic, { size: 22 }), h('span', t))));
          if (tab === 'adjust') {
            const cur = K().ADJ.find((a) => a.id === tool);
            toolLabel.textContent = tool === 'auto' ? 'AUTO' : cur.name.toUpperCase();
            const value = tool === 'auto' ? null : (e.adj[tool] || 0);
            panel.appendChild(tool === 'auto' ? h('div.ph-e-autohint', e.auto ? 'Auto-Enhance is on. Tap again to turn it off.' : 'Tap Auto to enhance automatically.') : ruler({ value, min: -100, max: 100, onInput: (v) => { e.adj[tool] = v; draw(); const ring = panel.querySelector(`.ph-e-tool-btn[data-t="${tool}"]`); if (ring) ring.style.setProperty('--v', Math.abs(v)); } }));
            const row = h('div.ph-e-tools.hscroll');
            const mk = (id, ic, name) => {
              const v = id === 'auto' ? (e.auto ? 100 : 0) : (e.adj[id] || 0);
              return h('div.ph-e-tool-btn', { data: { t: id }, class: { on: tool === id, set: !!v }, style: { '--v': Math.abs(v) }, onTap: () => { if (id === 'auto') { e.auto = !e.auto; tool = 'auto'; draw(); } else tool = id; renderPanel(); } }, JC.icon(ic, { size: 22 }), h('span.ph-e-tool-n', name));
            };
            row.appendChild(mk('auto', 'wand.and.stars', 'Auto'));
            K().ADJ.forEach((a) => row.appendChild(mk(a.id, 'ph.' + (a.id === 'noise' ? 'noise' : a.id), a.name)));
            panel.appendChild(row);
            requestAnimationFrame(() => { const on = row.querySelector('.on'); if (on) row.scrollLeft = on.offsetLeft - 180; });
          } else if (tab === 'filters') {
            toolLabel.textContent = 'FILTERS';
            const fname = (K().FILTERS.find((f) => f.id === (e.f || 'none')) || {}).name || 'Original';
            panel.appendChild(h('div.ph-e-fname', fname.toUpperCase()));
            const row = h('div.ph-e-filters.hscroll');
            K().FILTERS.forEach((f) => {
              const fe = Object.assign({}, e, { f: f.id });
              const th = h('div.ph-e-filter', { class: { on: (e.f || 'none') === f.id }, onTap: () => { e.f = f.id === 'none' ? null : f.id; draw(); renderPanel(); } }, K().paint(h('div.ph-e-filter-img'), p, 1, fe), h('span', f.name));
              row.appendChild(th);
            });
            panel.appendChild(row);
            requestAnimationFrame(() => { const on = row.querySelector('.on'); if (on) row.scrollLeft = on.offsetLeft - 160; });
          } else {
            toolLabel.textContent = 'CROP';
            panel.appendChild(ruler({ value: e.straighten || 0, min: -45, max: 45, onInput: (v) => { e.straighten = v; draw(); } }));
            const ratios = [['Original', null], ['Square', 1], ['16:9', 16 / 9], ['4:3', 4 / 3], ['3:2', 3 / 2], ['9:16', 9 / 16], ['3:4', 3 / 4]];
            panel.appendChild(h('div.ph-e-crops',
              h('div.ph-e-cropbtn', { onTap: () => { e.rot = ((e.rot || 0) - 90 + 360) % 360; draw(); } }, JC.icon('ph.rotate', { size: 22 })),
              h('div.ph-e-cropbtn', { onTap: () => { e.flip = !e.flip; draw(); } }, JC.icon('ph.flip', { size: 22 })),
              h('div.ph-e-ratios.hscroll', ratios.map(([t, r]) => h('div.ph-e-ratio', { class: { on: (e.ratio || 'Original') === t }, onTap: () => {
                e.ratio = r ? t : null;
                if (!r) e.crop = null;
                else {
                  const base = K().compose(p.crop || K().FULL, K().FULL);
                  const aa = (base.w / base.h) * K().artAspect(p.art);
                  const c = K().cover(K().FULL, aa, r);
                  e.crop = c;
                }
                draw(); renderPanel();
              } }, t)))));
          }
        }
        function finish() {
          editor = null;
          win.setStatus(viewer ? 'light' : 'auto');
          U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => el.remove());
        }
        function cancel() {
          if (!changed()) { finish(); return; }
          ui.actionSheet({ actions: [{ text: 'Discard Changes', style: 'destructive', onTap: finish }] });
        }
        function done() {
          const c = clean(e);
          JC.store.update('photos', p.id, { edit: Object.keys(c).length ? c : null });
          finish();
        }
        draw();
        renderPanel();
      }

      // ═══ MEMORIES PLAYER ══════════════════════════════════════════════════
      function playMemory(m, o) {
        let items = m.list().filter((p) => p && p.art);
        const keyP = m.key && items.find((p) => p.id === m.key);
        if (keyP && m.start == null) items = [keyP].concat(items.filter((p) => p !== keyP));
        if (!items.length) { ui.alert({ title: 'Nothing to Play', message: 'There are no photos in this memory yet.', buttons: [{ text: 'OK' }] }); return; }
        if (memory) memory.close(true);
        const H = JC.os.H || 874;
        const el = h('div.ph-mem');
        const stageEl = h('div.ph-mem-stage');
        const titleCard = h('div.ph-mem-title', h('div.ph-mem-tt', m.title), h('div.ph-mem-ts', m.sub || ''));
        const prog = h('div.ph-mem-prog', items.map(() => h('div.ph-mem-seg', h('div.ph-mem-segfill'))));
        let mood = m.mood || 'gentle';
        let music = Music(mood);
        let muted = false, paused = false;
        let i = (m.start || 0) % items.length;
        let slideT = null, slideStart = 0, remaining = 0;
        const SLIDE = 4300;
        const ppBtn = h('div.ph-mem-btn', { onTap: (ev) => { ev.stopPropagation(); togglePause(); } }, JC.icon('pause.fill', { size: 22 }));
        const muteBtn = h('div.ph-mem-btn', { onTap: (ev) => { ev.stopPropagation(); muted = !muted; if (music) music.mute(muted); muteBtn.innerHTML = ''; muteBtn.appendChild(JC.icon(muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill', { size: 20 })); } }, JC.icon('speaker.wave.2.fill', { size: 20 }));
        const moodBtn = h('div.ph-mem-btn', { onTap: (ev) => { ev.stopPropagation(); ui.menu(ev.currentTarget, [
          { text: 'Gentle', icon: 'music.note', checked: mood === 'gentle', onTap: () => setMood('gentle') },
          { text: 'Sentimental', icon: 'music.note', checked: mood === 'sentimental', onTap: () => setMood('sentimental') },
          { text: 'Uplifting', icon: 'music.note', checked: mood === 'uplifting', onTap: () => setMood('uplifting') },
          '-',
          { text: 'Share Memory', icon: 'square.and.arrow.up', onTap: () => ui.share({ title: m.title, subtitle: 'Memory · ' + counts(items), art: items[0].art, payload: { kind: 'photo', art: items[0].art } }) },
          { text: 'Favorite Memory', icon: 'heart', onTap: () => ui.toast('Added to Favorite Memories', { icon: 'heart.fill' }) },
        ]); } }, JC.icon('music.note.list', { size: 20 }));
        const top = h('div.ph-mem-top', glassBtn({ icon: 'xmark', onTap: (ev) => { ev.stopPropagation(); close(); } }), h('div.ph-mem-name', m.title), glassBtn({ icon: 'square.and.arrow.up', onTap: (ev) => { ev.stopPropagation(); ui.share({ title: m.title, subtitle: 'Memory', art: items[0].art, payload: { kind: 'photo', art: items[0].art } }); } }));
        const ctrls = h('div.ph-mem-ctrls', h('div.ph-mem-btn', { onTap: (ev) => { ev.stopPropagation(); step(-1); } }, JC.icon('backward.fill', { size: 20 })), ppBtn, h('div.ph-mem-btn', { onTap: (ev) => { ev.stopPropagation(); step(1); } }, JC.icon('forward.fill', { size: 20 })), muteBtn, moodBtn);
        el.append(stageEl, prog, titleCard, top, ctrls);
        win.body.appendChild(el);
        win.setStatus('light');
        el.classList.add('chrome');
        setTimeout(() => el.classList.remove('chrome'), 2600);
        ui.onTap(el, () => togglePause());

        function slideEl(p) {
          const a = 402 / H;
          const wrap = h('div.ph-mem-slide');
          const b = K().box(p, a, 'ph-mem-img');
          wrap.appendChild(b);
          const dir = K().hash(p.id + i) % 4;
          const from = ['scale(1.02) translate(0,0)', 'scale(1.16) translate(-12px, 8px)', 'scale(1.04) translate(10px,-6px)', 'scale(1.18) translate(6px, 10px)'][dir];
          const to = ['scale(1.16) translate(-10px,-8px)', 'scale(1.02) translate(8px,-4px)', 'scale(1.18) translate(-8px, 10px)', 'scale(1.03) translate(-6px,-8px)'][dir];
          b._kb = b.animate([{ transform: from }, { transform: to }], { duration: SLIDE + 1600, easing: 'linear', fill: 'forwards' });
          return wrap;
        }
        function show(n, first) {
          const old = stageEl.lastChild;
          const s = slideEl(items[n]);
          stageEl.appendChild(s);
          if (!first) U.anim(s, [{ opacity: 0 }, { opacity: 1 }], { duration: 1100, fill: 'none' });
          if (old) setTimeout(() => old.remove(), 1150);
          Array.from(prog.children).forEach((seg, k) => {
            const f = seg.firstChild;
            f.getAnimations().forEach((a) => a.cancel());
            f.style.width = k < n ? '100%' : '0%';
            if (k === n) { f._a = f.animate([{ width: '0%' }, { width: '100%' }], { duration: SLIDE, easing: 'linear', fill: 'forwards' }); if (paused) f._a.pause(); }
          });
          if (n === 0) { titleCard.classList.add('on'); setTimeout(() => titleCard.classList.remove('on'), 3600); }
          schedule(SLIDE);
        }
        function schedule(ms) {
          clearTimeout(slideT);
          remaining = ms;
          slideStart = performance.now();
          if (!paused) slideT = setTimeout(next, ms);
        }
        function next() {
          if (i + 1 >= items.length) { endCard(); return; }
          i++;
          show(i);
        }
        function step(d) {
          i = U.clamp(i + d, 0, items.length - 1);
          if (paused) togglePause();
          show(i);
        }
        function togglePause() {
          paused = !paused;
          el.classList.toggle('paused', paused);
          el.classList.toggle('chrome', paused);
          ppBtn.innerHTML = '';
          ppBtn.appendChild(JC.icon(paused ? 'play.fill' : 'pause.fill', { size: 22 }));
          const anims = [];
          stageEl.querySelectorAll('.ph-mem-img').forEach((b) => b._kb && anims.push(b._kb));
          prog.querySelectorAll('.ph-mem-segfill').forEach((f) => f._a && anims.push(f._a));
          if (paused) {
            clearTimeout(slideT);
            remaining = Math.max(300, remaining - (performance.now() - slideStart));
            anims.forEach((a) => a.pause());
            if (music) music.pause();
          } else {
            anims.forEach((a) => a.play());
            if (music) music.resume();
            schedule(remaining);
          }
        }
        function setMood(md) {
          mood = md;
          if (music) music.stop();
          music = Music(md);
          if (music) { music.start(); if (muted) music.mute(true); if (paused) music.pause(); }
          ui.toast('Music: ' + md.replace(/^\w/, (c) => c.toUpperCase()), { icon: 'music.note' });
        }
        function endCard() {
          clearTimeout(slideT);
          const card = h('div.ph-mem-end',
            h('div.ph-mem-tt', m.title), h('div.ph-mem-ts', counts(items)),
            h('div.ph-mem-endbtns',
              ui.btn({ text: 'Play Again', icon: 'arrow.counterclockwise', kind: 'glass', size: 'm', onTap: (ev) => { ev.stopPropagation(); card.remove(); i = 0; show(0); } }),
              ui.btn({ text: 'Done', kind: 'glass', size: 'm', onTap: (ev) => { ev.stopPropagation(); close(); } })));
          el.appendChild(card);
          if (music) music.fade();
        }
        function close(instant) {
          clearTimeout(slideT);
          if (music) music.stop();
          music = null;
          memory = null;
          win.setStatus(viewer ? 'light' : 'auto');
          if (instant) { el.remove(); return; }
          U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => el.remove());
        }
        memory = { close, back() { close(); return true; }, pause: () => { if (!paused) togglePause(); } };
        show(i, true);
        U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
        if (music) music.start();
      }

      // Synthesized soft memory music (WebAudio). Moods: gentle / sentimental / uplifting.
      function Music(mood) {
        let ctx;
        try { ctx = JC.audio.ctx(); } catch (e) { ctx = null; }
        if (!ctx) return null;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const MOODS = {
          gentle: { bpm: 68, prog: [[50, 62, 66, 69, 73], [47, 59, 62, 66, 69], [43, 55, 59, 62, 66], [45, 57, 61, 64, 69]], arp: [1, 2, 3, 4, 3, 2, 3, 4] },
          sentimental: { bpm: 58, prog: [[45, 57, 60, 64, 67], [41, 53, 57, 60, 64], [48, 55, 60, 64, 67], [43, 55, 59, 62, 67]], arp: [1, 3, 2, 4, 3, 2, 4, 3] },
          uplifting: { bpm: 84, prog: [[48, 60, 64, 67, 72], [43, 55, 59, 62, 67], [45, 57, 60, 64, 69], [41, 53, 57, 60, 65]], arp: [1, 2, 3, 4, 1, 2, 3, 4] },
        };
        const M = MOODS[mood] || MOODS.gentle;
        const eighth = 60 / M.bpm / 2;
        const out = JC.audio.out || ctx.destination;
        const master = ctx.createGain(); master.gain.value = 0.0001; master.connect(out);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400; lp.connect(master);
        const dly = ctx.createDelay(1.5); dly.delayTime.value = eighth * 3;
        const fb = ctx.createGain(); fb.gain.value = 0.38;
        const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 1600;
        dly.connect(dlp); dlp.connect(fb); fb.connect(dly); dlp.connect(master);
        const send = ctx.createGain(); send.gain.value = 0.45; send.connect(dly);
        const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);
        function voice(m, t, dur, gain, type, attack, toSend) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = type || 'sine';
          o.frequency.setValueAtTime(freq(m), t);
          o.detune.setValueAtTime((Math.random() - 0.5) * 8, t);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(gain, t + (attack || 0.01));
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g); g.connect(lp);
          if (toSend) g.connect(send);
          o.start(t); o.stop(t + dur + 0.05);
        }
        let step = 0, nextT = 0, timer = null, muted = false, running = false;
        function tick() {
          while (nextT < ctx.currentTime + 0.3) {
            const bar = Math.floor(step / 8) % M.prog.length;
            const ch = M.prog[bar];
            const s = step % 8;
            if (s === 0) {
              voice(ch[0] - 12, nextT, eighth * 8.5, 0.07, 'sine', 0.05);
              ch.slice(1, 4).forEach((n) => voice(n, nextT, eighth * 8.8, 0.016, 'triangle', 0.9, true));
            }
            const n = ch[M.arp[s]] + 12;
            voice(n, nextT, eighth * 3.2, s % 4 === 0 ? 0.045 : 0.03, 'sine', 0.008, true);
            voice(n + 12, nextT, eighth * 1.2, 0.006, 'sine', 0.005);
            if (s === 6 && Math.random() < 0.5) voice(ch[1 + Math.floor(Math.random() * 4)] + 24, nextT + eighth * 0.5, eighth * 2.5, 0.02, 'sine', 0.01, true);
            nextT += eighth;
            step++;
          }
        }
        return {
          start() { nextT = ctx.currentTime + 0.12; running = true; master.gain.setTargetAtTime(muted ? 0.0001 : 0.9, ctx.currentTime, 0.7); timer = setInterval(tick, 60); tick(); },
          pause() { running = false; clearInterval(timer); master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2); },
          resume() { if (running) return; running = true; nextT = ctx.currentTime + 0.1; master.gain.setTargetAtTime(muted ? 0.0001 : 0.9, ctx.currentTime, 0.4); timer = setInterval(tick, 60); },
          mute(on) { muted = on; master.gain.setTargetAtTime(on || !running ? 0.0001 : 0.9, ctx.currentTime, 0.15); },
          fade() { master.gain.setTargetAtTime(0.0001, ctx.currentTime, 1.4); setTimeout(() => clearInterval(timer), 4000); },
          stop() { clearInterval(timer); running = false; master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); setTimeout(() => { try { master.disconnect(); } catch (e) { /* ignore */ } }, 1500); },
        };
      }

      // ═══ INTENTS ══════════════════════════════════════════════════════════
      function handle(it) {
        if (!it) return;
        if (memory) memory.close(true);
        if (editor) { editor = null; win.body.querySelectorAll('.ph-editor').forEach((x) => x.remove()); }
        const pid = it.id || it.photo;
        if (pid) {
          const p = JC.store.get('photos', pid);
          if (!p) { ui.toast('This photo is no longer available'); return; }
          if (p.deleted) { tabs.select('collections'); if (!st.unlocked) { unlockAlbum(() => openIn('deleted', p)); return; } openIn('deleted', p); return; }
          if (p.hidden) { tabs.select('collections'); if (!st.unlocked) { unlockAlbum(() => openIn('hidden', p)); return; } openIn('hidden', p); return; }
          tabs.select('library');
          const list = lib();
          setTimeout(() => openViewer(list, Math.max(0, list.findIndex((x) => x.id === p.id)), null, {}), 60);
          return;
        }
        if (it.album) {
          tabs.select('collections');
          const n = tabs.nav();
          while (n.depth() > 1) n.pop({ instant: true });
          const id = it.album === 'favourites' ? 'favorites' : it.album;
          if (SMART[id] || JC.store.get('albums', id)) n.push(albumPage(id), { instant: true });
          return;
        }
        if (it.memory) {
          const m = memById(it.memory) || MEMORIES[0];
          setTimeout(() => playMemory(m), 120);
          return;
        }
        if (it.tab) tabs.select(it.tab === 'search' ? 'search' : it.tab);
      }
      function openIn(album, p) {
        const n = tabs.nav();
        while (n.depth() > 1) n.pop({ instant: true });
        n.push(albumPage(album), { instant: true });
        const list = albumList(album);
        setTimeout(() => openViewer(list, Math.max(0, list.findIndex((x) => x.id === p.id)), null, { albumId: album }), 60);
      }
      if (intent0) setTimeout(() => handle(intent0), 0);
      else setTimeout(() => { const n = tabs.nav('library'); if (n && n.top() && n.top().scrollToEnd) n.top().scrollToEnd(); }, 0);

      return {
        intent: handle,
        show() { rerender(); },
        hide() {
          if (memory) memory.pause();
          st.unlocked = false;
          if (viewer) viewer.close(true);
          // relock: if a locked album is open, pop back
          const n = tabs.nav('collections');
          if (n) { const t = n.top(); if (t && /Hidden|Recently Deleted/.test(t.title || '') && n.depth() > 1) n.popToRoot(); }
        },
        back() {
          if (memory) { memory.back(); return true; }
          if (editor) { editor.back(); return true; }
          if (viewer) { viewer.back(); return true; }
          const n = tabs.nav();
          const t = n && n.top();
          if (t && t.cancelSelect && t.cancelSelect()) return true;
          return false;
        },
        destroy() { offStore(); offAlbums(); if (memory) memory.close(true); if (viewer) viewer.close(true); },
      };
    },
  });
})();
