/* Safari — iOS 26 compact layout: glass bottom bar (back · address · more), address editing with
   suggestions, tabs overview (incl. locked Private Browsing), start page, bookmarks / reading list /
   history, reader mode, find on page, page menu, link previews. Web content comes from JC.web
   (safari-pages.js). Act: visit {url}. Intents: {url} {search} {newTab}. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const W = () => JC.web;
  const SRCH = (q) => 'https://irminsul.net/search?q=' + encodeURIComponent(q).replace(/%20/g, '+');

  // ── seeds ────────────────────────────────────────────────────────────────
  JC.store.seed('history', [
    { id: 'hs1', url: SRCH('is it normal to want to pay for every dinner'), title: 'is it normal to want to pay for every dinner — Irminsul', t: '+0 22:36' },
    { id: 'hs2', url: 'https://askteyvat.com/q/is-it-normal-to-want-to-pay-for-every-dinner', title: 'Is it normal to want to pay for every dinner? — AskTeyvat', t: '+0 22:37' },
    { id: 'hs3', url: SRCH('guizhong era celadon value'), title: 'guizhong era celadon value — Irminsul', t: '+0 22:44' },
    { id: 'hs4', url: 'https://feiyun.ly/item/lot_teaset', title: 'Lot 1016 · Guizhong-era celadon tea set — Feiyun Market', t: '+0 22:45' },
    { id: 'hs5', url: 'https://liyueair.ly/flight/LA711', title: 'LA 711 flight status — Liyue Air', t: '+0 21:04' },
    { id: 'hs6', url: SRCH('glaze lily meaning'), title: 'glaze lily meaning — Irminsul', t: '+0 17:20' },
    { id: 'hs7', url: 'https://akasha.wiki/wiki/Glaze_lily', title: 'Glaze lily — Akasha', t: '+0 17:21' },
    { id: 'hs8', url: 'https://tianheng.ly/guyun', title: 'Guyun Stone Forest (marine) Weather — Tianheng Observatory', t: '+0 16:02' },
    { id: 'hs9', url: 'https://liyueherald.ly/2026/10/15/guyun-tremors', title: 'Fishermen report “humming” near Guyun Stone Forest — The Liyue Herald', t: '-1 07:12' },
    { id: 'hs10', url: SRCH('osial myth'), title: 'osial myth — Irminsul', t: '-1 01:40' },
    { id: 'hs11', url: 'https://akasha.wiki/wiki/Osial', title: 'Osial — Akasha', t: '-1 01:41' },
    { id: 'hs12', url: 'https://intranet.northland.sn/', title: 'Northland Intranet — Sign in', t: '-1 01:52' },
    { id: 'hs13', url: SRCH('how long can a person stay in a coffin'), title: 'how long can a person stay in a coffin — Irminsul', t: '-2 13:10' },
    { id: 'hs14', url: SRCH('how to tell your siblings what you do for work'), title: 'how to tell your siblings what you do for work — Irminsul', t: '-2 23:58' },
    { id: 'hs15', url: 'https://askteyvat.com/q/how-do-i-tell-my-little-siblings-what-i-really-do-for-work', title: 'How do I tell my little siblings what I really do for work? — AskTeyvat', t: '-2 23:59' },
    { id: 'hs16', url: 'https://mingyun.ly/frost-fortress', title: 'Glacier Guardians Frost Fortress — Mingyun Toys & Games', t: '-3 12:30' },
    { id: 'hs17', url: 'https://heyu.ly/troupe', title: 'Yun Jin Troupe at Heyu Tea House', t: '-14 11:02' },
    { id: 'hs18', url: 'https://liyueherald.ly/2026/10/12/yun-jin-divine-damsel', title: 'Review: Yun Jin’s “Divine Damsel” is the season’s finest — The Liyue Herald', t: '-4 08:40' },
    { id: 'hs19', url: SRCH('rex lapis real photo'), title: 'rex lapis real photo — Irminsul', t: '2026-10-01 10:20' },
    { id: 'hs20', url: 'https://liyueherald.ly/2026/10/01/rex-lapis', title: 'Liyue mourns: Qixing announce the death of Rex Lapis — The Liyue Herald', t: '2026-10-01 10:11' },
    { id: 'hs21', url: 'https://crux.ly/', title: 'The Crux Fleet — Captain Beidou', t: '-6 23:15' },
    { id: 'hs22', url: 'https://reelrush.games/', title: 'Reel Rush — Cast. Reel. Brag.', t: '-1 22:31' },
    { id: 'hs23', url: SRCH('bluefin tuna from a pier possible'), title: 'bluefin tuna from a pier possible — Irminsul', t: '-7 05:10' },
    { id: 'hs24', url: SRCH('how to win an arm wrestle against a pirate'), title: 'how to win an arm wrestle against a pirate — Irminsul', t: '-6 22:58' },
  ]);
  JC.store.seed('safari_bm', [
    { id: 'bm1', folder: 'fav', title: 'Northland Intranet', url: 'https://intranet.northland.sn/' },
    { id: 'bm2', folder: 'fav', title: 'Liyue Archives', url: 'https://archives.ly/' },
    { id: 'bm3', folder: 'fav', title: 'The Liyue Herald', url: 'https://liyueherald.ly/' },
    { id: 'bm4', folder: 'fav', title: 'The Steambird', url: 'https://steambird.fon/' },
    { id: 'bm5', folder: 'fav', title: 'Yun Jin Troupe', url: 'https://heyu.ly/troupe' },
    { id: 'bm6', folder: 'fav', title: 'Tianheng Weather', url: 'https://tianheng.ly/liyue' },
    { id: 'bm7', folder: 'work', title: 'Northland Bank · Liyue', url: 'https://northland.sn/liyue' },
    { id: 'bm8', folder: 'work', title: 'The Executive Board', url: 'https://northland.sn/about/board' },
    { id: 'bm9', folder: 'work', title: 'Security — never share your code', url: 'https://northland.sn/security' },
    { id: 'bm10', folder: 'kids', title: 'LA 711 flight status', url: 'https://liyueair.ly/flight/LA711' },
    { id: 'bm11', folder: 'kids', title: 'Frost Fortress (Teucer!!)', url: 'https://mingyun.ly/frost-fortress' },
    { id: 'bm12', folder: 'kids', title: 'Unaccompanied minors', url: 'https://liyueair.ly/help/unaccompanied-minors' },
    { id: 'bm13', folder: 'xs', title: 'Glaze lily', url: 'https://akasha.wiki/wiki/Glaze_lily' },
    { id: 'bm14', folder: 'xs', title: 'Wangsheng — the Rite', url: 'https://wangsheng.ly/rite' },
    { id: 'bm15', folder: 'xs', title: 'he forgot his wallet again', url: 'https://wishbuzz.com/life/he-forgot-his-wallet-again' },
    { id: 'bm16', folder: 'root', title: 'The Crux Fleet', url: 'https://crux.ly/' },
  ]);
  JC.store.seed('safari_rl', [
    { id: 'rl1', url: 'https://liyueherald.ly/2026/10/16/rite-of-parting-sunday', title: 'Rite of Parting: what to know for Sunday', site: 'The Liyue Herald', t: '+0 18:40', read: false, art: 'p_yujing_lanterns' },
    { id: 'rl2', url: 'https://steambird.fon/world/project-o', title: '“Project O”: what is Northland Bank building in Liyue?', site: 'The Steambird', t: '-2 07:02', read: true },
    { id: 'rl3', url: 'https://liyueherald.ly/2026/10/10/crux-returns', title: 'The Crux returns to port — and Captain Beidou wants a rematch', site: 'The Liyue Herald', t: '-6 09:15', read: true, art: 'p_alcor_deck' },
    { id: 'rl4', url: 'https://wishbuzz.com/life/signs-you-are-the-favourite-big-sibling', title: '14 Signs You’re the Favourite Big Sibling', site: 'Wishbuzz', t: '-3 00:20', read: false },
    { id: 'rl5', url: 'https://wishbuzz.com/life/gifts-for-a-man-who-has-lived-a-long-time', title: '11 Gifts for the Man Who Has Seen Everything', site: 'Wishbuzz', t: '-9 23:40', read: true },
  ]);
  const FOLDERS = [['fav', 'Favorites', 'star'], ['work', 'Work', 'folder'], ['kids', 'Kids', 'folder'], ['xs', 'xiansheng', 'folder']];
  const SHARED = [
    ['https://wangsheng.ly/coffins', 'Coffins — Wangsheng Funeral Parlor (“2nd half price!!”)', 'ht'],
    ['https://mingyun.ly/frost-fortress', 'Glacier Guardians Frost Fortress', 'teucer'],
    ['https://liyueherald.ly/2026/10/01/rex-lapis', 'Liyue mourns: Qixing announce the death of Rex Lapis', 'zl'],
    ['https://liyueherald.ly/2026/10/10/crux-returns', 'The Crux returns to port — and Captain Beidou wants a rematch', 'beidou'],
  ];

  function st() {
    const d = JC.state.d;
    d.apps = d.apps || {};
    if (!d.apps.safari) {
      d.apps.safari = {
        tabs: [
          { id: 't1', url: 'https://liyueair.ly/flight/LA711', title: 'LA 711 flight status — Liyue Air', hist: ['https://liyueair.ly/', 'https://liyueair.ly/flight/LA711'], pos: 1 },
          { id: 't2', url: 'https://tianheng.ly/guyun', title: 'Guyun Stone Forest (marine) Weather — Tianheng Observatory', hist: ['https://tianheng.ly/guyun'], pos: 0 },
          { id: 't3', url: 'https://intranet.northland.sn/', title: 'Northland Intranet — Sign in', hist: ['https://intranet.northland.sn/'], pos: 0 },
          { id: 't4', url: 'https://feiyun.ly/item/lot_teaset', title: 'Lot 1016 · Guizhong-era celadon tea set — Feiyun Market', hist: [SRCH('guizhong era celadon value'), 'https://feiyun.ly/item/lot_teaset'], pos: 1 },
          { id: 'p1', priv: true, url: SRCH('is it weird to write a voice memo you never send'), title: 'is it weird to write a voice memo you never send — Irminsul', hist: [SRCH('is it weird to write a voice memo you never send')], pos: 0 },
          { id: 'p2', priv: true, url: 'https://wishbuzz.com/life/he-forgot-his-wallet-again', title: 'He “Forgot His Wallet” Again — Wishbuzz', hist: ['https://wishbuzz.com/life/he-forgot-his-wallet-again'], pos: 0 },
        ],
        cur: 't4', curPriv: 'p1', priv: false, privLocked: true, zoom: 100, desktop: false, closed: [],
        start: { favs: true, freq: true, shared: true, privacy: true, reading: true, closed: true },
      };
    }
    return d.apps.safari;
  }
  const save = () => JC.state.save();

  JC.icon.add({
    'textformat.size': '<path d="M3 18 7.5 6l4.5 12M4.6 14h5.8"/><path d="M13.5 18l3.6-9.5 3.6 9.5M14.8 15h4.6"/>',
    'eyeglasses': '<circle cx="6.5" cy="14" r="3.6"/><circle cx="17.5" cy="14" r="3.6"/><path d="M10.1 13.4c1.2-.8 2.6-.8 3.8 0M2.9 13 4.6 7M21.1 13 19.4 7"/>',
    'book.open': '<path d="M12 6.5C9.6 5 6.6 4.5 3.5 5v13c3.1-.5 6.1 0 8.5 1.5 2.4-1.5 5.4-2 8.5-1.5V5c-3.1-.5-6.1 0-8.5 1.5zM12 6.5v13"/>',
    'doc.text.magnifyingglass': '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h4M14 3.5l5 5V11M14 3.5v5h5M8.5 9.5h3M8.5 13h4"/><circle cx="16.5" cy="16.5" r="3"/><path d="m18.7 18.7 2.3 2.3"/>',
    'shield.lefthalf.filled': '<path d="M12 2.6 4.4 5.5v5.7c0 4.7 3.2 8.6 7.6 10.2 4.4-1.6 7.6-5.5 7.6-10.2V5.5z"/><path d="M12 2.6v18.8c-4.4-1.6-7.6-5.5-7.6-10.2V5.5z" fill="currentColor" stroke="none"/>',
    'square.on.square.dashed': '<rect x="3.5" y="7.5" width="13" height="13" rx="2.5"/><path d="M8 4.5c0-.6.4-1 1-1h10.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1" stroke-dasharray="2.4 2.4"/>',
    'hand.raised.slash': '<path d="M8 12.5V5.8a1.4 1.4 0 0 1 2.8 0v5M10.8 10.5V4.4a1.4 1.4 0 0 1 2.8 0v6M13.6 10.5V5.6a1.4 1.4 0 0 1 2.8 0v6.8M16.4 12.5V9.3a1.4 1.4 0 0 1 2.8 0v5.2a7 7 0 0 1-7 7h-.6a6.4 6.4 0 0 1-5.2-2.7L4 15.5a1.4 1.4 0 0 1 2.2-1.7L8 15.8M3 3l18 18"/>',
    'desktopcomputer': '<rect x="3" y="4" width="18" height="12" rx="1.8"/><path d="M9 20h6M12 16v4"/>',
    'character.bubble': '<path d="M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z"/><path d="M9 14.5 12 8l3 6.5M10 12.5h4"/>',
    'headphones': '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/>',
    'plus.square.on.square': '<rect x="3.5" y="7.5" width="13" height="13" rx="2.5"/><path d="M8 4.5c0-.6.4-1 1-1h10.5a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1M10 11v6M7 14h6"/>',
    'arrow.forward': '<path d="M9 4.5 16.5 12 9 19.5"/>',
    'xmark.square': '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="m9 9 6 6M15 9l-6 6"/>',
  });

  JC.app({
    id: 'safari',
    name: 'Safari',
    status: 'auto',
    launch(win, intent0) {
      const S = st();
      const body = win.body;
      body.classList.add('app-safari');
      const view = h('div.sf-view.scroll');
      const holder = h('div.sf-holder');
      view.appendChild(holder);
      const topBand = h('div.sf-band');
      const progress = h('div.sf-progress');
      const backBtn = h('button.sf-cbtn.sf-back', { onTap: () => goBack(), attrs: { 'aria-label': 'Back' } }, JC.icon('chevron.left', { size: 21, weight: 2.4 }));
      const moreBtn = h('button.sf-cbtn.sf-more', { onTap: (e) => moreMenu(e.currentTarget), attrs: { 'aria-label': 'More' } }, JC.icon('ellipsis', { size: 20, weight: 2.6 }));
      const hostEl = h('span.sf-host');
      const lockEl = h('span.sf-lock');
      const aaBtn = h('span.sf-aa.tap', { onTap: (e) => { e.stopPropagation(); pageMenu(e.currentTarget); }, attrs: { 'aria-label': 'Page Menu' } }, JC.icon('textformat.size', { size: 19, weight: 2 }));
      const reloadBtn = h('span.sf-reload.tap', { onTap: (e) => { e.stopPropagation(); reload(); }, attrs: { 'aria-label': 'Reload' } }, JC.icon('arrow.clockwise', { size: 16, weight: 2.4 }));
      const pill = h('div.sf-pill', { onTap: () => openEdit() }, aaBtn, h('span.sf-hostwrap', lockEl, hostEl), reloadBtn, progress);
      const bar = h('div.sf-bar', backBtn, pill, moreBtn);
      body.append(view, topBand, bar);
      let reader = null;
      let findUI = null;
      let edit = null;
      let tabsUI = null;
      let current = null; // loaded spec
      let compact = false;

      // ── tabs ──
      const tabs = () => S.tabs.filter((t) => !!t.priv === !!S.priv);
      const curTab = () => S.tabs.find((t) => t.id === (S.priv ? S.curPriv : S.cur)) || null;
      function setCur(id) { if (S.priv) S.curPriv = id; else S.cur = id; save(); }
      function newTab(url, o) {
        o = o || {};
        const t = { id: U.uid('tab'), url: url || 'about:start', title: url ? '' : 'Start Page', hist: [url || 'about:start'], pos: 0, priv: !!S.priv };
        S.tabs.push(t);
        if (!o.background) setCur(t.id);
        save();
        if (!o.background) show(t.url, { noHist: true });
        return t;
      }
      function closeTab(id) {
        const i = S.tabs.findIndex((t) => t.id === id);
        if (i < 0) return;
        const t = S.tabs[i];
        S.closed.unshift({ url: t.url, title: t.title, t: JC.time.now() });
        S.closed = S.closed.slice(0, 8);
        S.tabs.splice(i, 1);
        const left = tabs();
        if ((S.priv ? S.curPriv : S.cur) === id) setCur(left.length ? left[Math.min(i, left.length - 1)].id : null);
        save();
      }

      // ── navigation ──
      function navigate(input, o) {
        o = o || {};
        const url = W().normalize(input);
        if (o.newTab) return newTab(url, o);
        let t = curTab();
        if (!t) { newTab(url); return; }
        if (!o.noHist) { t.hist = t.hist.slice(0, t.pos + 1); t.hist.push(url); t.pos = t.hist.length - 1; }
        t.url = url;
        save();
        show(url);
      }
      function goBack() {
        const t = curTab();
        if (reader) { closeReader(); return; }
        if (!t || t.pos <= 0) { if (t && t.url !== 'about:start') { t.pos = 0; } JC.ui.toast('No previous page', { icon: 'chevron.left' }); return; }
        t.pos--; t.url = t.hist[t.pos]; save(); show(t.url, { anim: 'back' });
      }
      function goForward() {
        const t = curTab();
        if (!t || t.pos >= t.hist.length - 1) { JC.ui.toast('No next page', { icon: 'chevron.right' }); return; }
        t.pos++; t.url = t.hist[t.pos]; save(); show(t.url, { anim: 'fwd' });
      }
      function reload() { const t = curTab(); if (t) show(t.url, { reload: true }); }
      let loadT = null;
      function show(url, o) {
        o = o || {};
        closeReader(true);
        if (findUI) closeFind();
        clearTimeout(loadT);
        const t = curTab();
        progress.style.transition = 'none'; progress.style.width = '0%'; progress.style.opacity = '1';
        requestAnimationFrame(() => { progress.style.transition = 'width .35s ease-out'; progress.style.width = '65%'; });
        const spec = W().load(url, {});
        current = spec;
        const delay = spec.start || o.instant ? 0 : 160 + (JC.util.pick ? Math.random() * 220 : 200);
        hostEl.textContent = spec.start ? 'Search or enter website' : hostLabel(spec.host);
        lockEl.innerHTML = '';
        if (!spec.start && /^https/.test(spec.url || url)) lockEl.appendChild(JC.icon('lock.fill', { size: 11 }));
        loadT = setTimeout(() => {
          holder.innerHTML = '';
          holder.className = 'sf-holder' + (S.desktop && !spec.start ? ' desktop' : '');
          const pageEl = h('div.sf-page');
          if (S.zoom !== 100) pageEl.style.zoom = String(S.zoom / 100);
          pageEl.appendChild(spec.start ? startPage() : spec.node);
          holder.appendChild(pageEl);
          if (o.anim) U.anim(pageEl, [{ transform: `translateX(${o.anim === 'back' ? -40 : 40}px)`, opacity: 0.4 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 260 });
          view.scrollTop = 0;
          progress.style.transition = 'width .2s ease-out, opacity .3s .25s'; progress.style.width = '100%'; progress.style.opacity = '0';
          if (t) { t.title = spec.title || t.title; t.url = spec.url || url; save(); }
          updateChrome();
          if (!spec.start) {
            JC.story.act('visit', { url: spec.url || url, host: spec.host || '' });
            const sq = /irminsul\.net\/(search|images|news|videos|maps)\?q=([^&]*)/.exec(spec.url || url);
            if (sq) JC.story.act('search', { q: decodeURIComponent(sq[2].replace(/\+/g, ' ')) });
            if (!S.priv && !o.restore) {
              const last = JC.store.all('history')[0];
              if (!last || last.url !== spec.url) JC.store.add('history', { url: spec.url, title: spec.title, t: JC.time.now() }, { front: true });
            }
            const rl = JC.store.all('safari_rl').find((r) => r.url === spec.url && !r.read);
            if (rl) JC.store.update('safari_rl', rl.id, { read: true });
          }
        }, delay);
      }
      const hostLabel = (host) => host.replace(/^www\./, '');
      function updateChrome() {
        const t = curTab();
        backBtn.classList.toggle('dim', !t || t.pos <= 0);
        body.classList.toggle('sf-private', !!S.priv);
        // status-bar band: colour of the site header
        const bandColor = current && !current.start ? bandFor(current.host) : null;
        topBand.style.background = bandColor || '';
        win.setStatus(bandColor ? (lum(bandColor) > 0.55 ? 'dark' : 'light') : 'auto');
        aaBtn.classList.toggle('reader', !!(current && current.reader));
      }
      const BANDS = { 'liyueherald.ly': '#ffffff', 'lhnews.ly': '#ffffff', 'archives.ly': '#2b2418', 'northland.sn': '#0f2740', 'northlandbank.sn': '#0f2740', 'intranet.northland.sn': '#0b1b2c', 'liyueair.ly': '#b3261e', 'wangsheng.ly': '#3b1d18', 'millelith.ly': '#5a3d12', 'heyu.ly': '#6d1f2f', 'crux.ly': '#1f2d4d', 'cruxshipping.ly': '#1f2d4d', 'steambird.fon': '#f4ecd8', 'jadechamber.ly': '#0f3b33', 'tianheng.ly': '#3b8de8', 'askteyvat.com': '#ffffff', 'wishbuzz.com': '#ffcc00', 'akasha.wiki': '#ffffff', 'harborride.ly': '#0d6e6e', 'wanmingo.ly': '#e8590c', 'feiyun.ly': '#c2410c', 'feiyun.market': '#c2410c', 'mingyun.ly': '#2b8a3e', 'reelrush.games': '#0b4f7c' };
      function bandFor(host) { if (BANDS[host]) return BANDS[host]; if (host === 'irminsul.net') return null; return W().sites[host] ? '#ffffff' : '#f4f5f8'; }
      function lum(hex) { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }

      // links inside pages
      let lpTimer = null, lpFired = false;
      holder.addEventListener('click', (e) => {
        const a = e.target.closest('[data-href]');
        if (!a) return;
        e.preventDefault();
        if (lpFired) { lpFired = false; return; }
        navigate(a.dataset.href);
      });
      holder.addEventListener('pointerdown', (e) => {
        const a = e.target.closest('[data-href]');
        if (!a) return;
        lpFired = false;
        clearTimeout(lpTimer);
        const x = e.clientX, y = e.clientY;
        lpTimer = setTimeout(() => { lpFired = true; linkMenu(a); }, 520);
        const cancel = (ev) => { if (ev.type === 'pointermove' && Math.hypot(ev.clientX - x, ev.clientY - y) < 8) return; clearTimeout(lpTimer); a.removeEventListener('pointermove', cancel); a.removeEventListener('pointerup', cancel); };
        a.addEventListener('pointermove', cancel);
        a.addEventListener('pointerup', cancel);
      });
      holder.addEventListener('webgo', (e) => navigate(e.detail));
      function linkMenu(a) {
        const url = a.dataset.href;
        JC.audio.haptic && JC.audio.haptic(10);
        JC.ui.menu(a, [
          { text: 'Open in New Tab', icon: 'plus.square.on.square', onTap: () => navigate(url, { newTab: true }) },
          { text: 'Open in Background', icon: 'square.on.square', onTap: () => { newTab(url, { background: true }); JC.ui.toast('Opened in background', { icon: 'square.on.square' }); } },
          { text: 'Add to Reading List', icon: 'eyeglasses', onTap: () => addReading(url, a.textContent.trim()) },
          '-',
          { text: 'Copy Link', icon: 'doc.on.doc', onTap: () => { U.copy(url); JC.ui.toast('Link copied', { icon: 'doc.on.doc' }); } },
          { text: 'Share…', icon: 'square.and.arrow.up', onTap: () => share(url, a.textContent.trim()) },
        ], { title: url.replace(/^https?:\/\//, '').slice(0, 60) });
      }

      // ── minimizing bar on scroll ──
      let lastY = 0;
      view.addEventListener('scroll', () => {
        const y = view.scrollTop;
        if (y > lastY + 8 && y > 80 && !compact) { compact = true; bar.classList.add('mini'); }
        else if ((y < lastY - 12 || y < 40) && compact) { compact = false; bar.classList.remove('mini'); }
        lastY = y;
      }, { passive: true });
      bar.addEventListener('click', () => { if (compact) { compact = false; bar.classList.remove('mini'); } }, true);

      // edge swipe back / forward
      U.drag(view, {
        axis: 'x',
        filter: (e) => { const r = view.getBoundingClientRect(); const k = view.offsetWidth / (r.width || 1); const x = (e.clientX - r.left) * k; return x < 22 || x > view.offsetWidth - 22; },
        move: (e, p) => { holder.style.transform = `translateX(${p.dx * 0.6}px)`; },
        end: (e, p) => { holder.style.transform = ''; if (p.dx > 90) goBack(); else if (p.dx < -90) goForward(); },
      });

      // ═══ start page ═══
      function favTile(b) {
        let host = '';
        try { host = new URL(b.url).hostname; } catch (e) { host = b.url; }
        const ic = W().icon(host);
        return h('div.sf-fav', { onTap: () => navigate(b.url) }, h('div.sf-fav-ic', { style: { background: ic.bg, color: ic.fg } }, ic.letter), h('div.sf-fav-t', b.title));
      }
      function startPage() {
        const P = S.start;
        const favs = JC.store.all('safari_bm').filter((b) => b.folder === 'fav');
        const hist = JC.store.all('history');
        const freq = {};
        hist.forEach((x) => { try { const hst = new URL(x.url).hostname; if (hst === 'irminsul.net') return; freq[hst] = freq[hst] || { n: 0, url: x.url, title: x.title }; freq[hst].n++; } catch (e) { /* ignore */ } });
        const freqList = Object.keys(freq).sort((a, b) => freq[b].n - freq[a].n).slice(0, 8);
        const rl = JC.store.all('safari_rl').slice(0, 3);
        const wrap = h('div.sf-start', { class: { priv: !!S.priv } });
        if (S.priv) {
          wrap.append(h('div.sf-privhero', JC.icon('hand.raised.slash', { size: 44 }), h('div.sf-privt', 'Private Browsing'), h('div.sf-privs', 'Safari won’t remember the pages you visit, your search history or your AutoFill information after you close a tab. Private tabs lock when not in use.')));
        }
        if (P.favs) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Favorites', h('span.sf-sec-more.tap', { onTap: () => openLibrary('bm', 'fav') }, 'Show All')), h('div.sf-favs', favs.slice(0, 8).map(favTile))));
        if (!S.priv && P.freq && freqList.length) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Frequently Visited'), h('div.sf-favs', freqList.map((k) => favTile({ url: freq[k].url, title: W().siteName(k) })))));
        if (!S.priv && P.shared) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Shared with You'), h('div.sf-shared.hscroll', SHARED.map(([u, t, by]) => h('div.sf-sh-card', { onTap: () => navigate(u) }, h('div.sf-sh-top', { style: { background: W().icon(new URL(u).hostname).bg } }, h('span', W().icon(new URL(u).hostname).letter)), h('div.sf-sh-t', t), h('div.sf-sh-by', JC.ui.avatar(by, 18), h('span', 'From ' + JC.contacts.short(by))))))));
        if (!S.priv && P.privacy) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Privacy Report'), h('div.sf-privacy.tap', { onTap: () => privacyReport() }, JC.icon('shield.lefthalf.filled', { size: 26 }), h('div', h('b', '38'), h('span', ' In the last seven days, Safari has prevented 38 trackers from profiling you.')))));
        if (!S.priv && P.reading && rl.length) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Reading List', h('span.sf-sec-more.tap', { onTap: () => openLibrary('rl') }, 'Show All')), h('div.sf-rl', rl.map((r) => h('div.sf-rl-i', { onTap: () => navigate(r.url) }, r.art ? JC.art.el(r.art, { cls: 'sf-rl-art' }) : h('div.sf-rl-art.ic', { style: { background: W().icon(new URL(r.url).hostname).bg, color: '#fff' } }, W().icon(new URL(r.url).hostname).letter), h('div.sf-rl-m', h('div.sf-rl-t', r.title), h('div.sf-rl-s', r.site + (r.read ? '' : ' · Unread'))))))));
        if (P.closed && S.closed.length) wrap.append(h('div.sf-sec', h('div.sf-sec-h', 'Recently Closed Tabs'), h('div.sf-rl', S.closed.slice(0, 4).map((c) => h('div.sf-rl-i', { onTap: () => navigate(c.url) }, h('div.sf-rl-art.ic', { style: { background: 'var(--fill3)', color: 'var(--label2)' } }, JC.icon('clock', { size: 18 })), h('div.sf-rl-m', h('div.sf-rl-t', c.title || c.url), h('div.sf-rl-s', U.fmtRelative(c.t))))))));
        wrap.append(h('div.sf-edit-start', JC.ui.btn({ text: 'Edit', kind: 'gray', size: 's', onTap: () => editStart() })));
        return wrap;
      }
      function editStart() {
        const P = S.start;
        const rows = [['favs', 'Favorites'], ['freq', 'Frequently Visited'], ['shared', 'Shared with You'], ['privacy', 'Privacy Report'], ['reading', 'Reading List'], ['closed', 'Recently Closed Tabs']].map(([k, t]) => ({ title: t, toggle: { on: !!P[k], onChange: (v) => { P[k] = v; save(); if (current && current.start) show('about:start', { instant: true }); } } }));
        JC.ui.sheet({ title: 'Customize Start Page', detent: 'medium', right: { text: 'Done' }, content: () => [JC.ui.list([{ rows }, { rows: [{ title: 'Use Start Page on All Devices', toggle: { on: true, onChange: () => {} } }, { title: 'Background Image', toggle: { on: false, onChange: (v) => JC.ui.toast(v ? 'Background: Harbor at night' : 'No background') } }] }])] });
      }
      function privacyReport() {
        JC.ui.sheet({ title: 'Privacy Report', detent: 'large', left: { text: 'Done' }, content: () => [
          h('div.sf-pr-top', JC.icon('shield.lefthalf.filled', { size: 40 }), h('div', h('div.sf-pr-n', '38'), h('div.sf-pr-s', 'trackers prevented from profiling you'))),
          JC.ui.list([{ header: 'Websites That Contacted Trackers', rows: [['wishbuzz.com', 14], ['liyueherald.ly', 9], ['askteyvat.com', 7], ['steambird.fon', 4], ['mingyun.ly', 4]].map(([s, n]) => ({ title: s, detail: n + ' trackers' })) },
            { header: 'Most Contacted Tracker', rows: [{ title: 'ads.wishbuzz.com', subtitle: 'Seen on 4 websites' }] }]),
        ] });
      }

      // ═══ address editing ═══
      function openEdit() {
        if (edit) return;
        const t = curTab();
        const curUrl = current && !current.start ? (current.url || '') : '';
        const isSearch = /irminsul\.net\/search\?q=/.test(curUrl);
        const initial = isSearch ? decodeURIComponent((curUrl.split('q=')[1] || '').split('&')[0].replace(/\+/g, ' ')) : curUrl;
        const list = h('div.sf-sugg.scroll');
        const input = JC.ui.input({ value: initial, placeholder: 'Search or enter website', enterkey: 'go', cap: 'none', cls: 'sf-urlin', onInput: (v) => fill(v), onSubmit: (v) => { if (!v.trim()) return; closeEdit(); navigate(v.trim()); } });
        const clear = h('span.sf-urlx.tap', { onTap: () => { input.value = ''; fill(''); input.focus(); } }, JC.icon('xmark.circle.fill', { size: 18 }));
        const field = h('div.sf-urlfield', JC.icon(S.priv ? 'hand.raised.slash' : 'magnifyingglass', { size: 17, weight: 2.2 }), input, clear);
        const cancel = h('div.sf-urlcancel.tap', { onTap: () => closeEdit() }, 'Cancel');
        edit = h('div.sf-editov', list, h('div.sf-urlrow', field, cancel));
        body.appendChild(edit);
        bar.classList.add('hidden');
        U.anim(edit, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
        setTimeout(() => { input.focus(); input.select && input.select(); }, 60);
        fill('');
        function fill(q) {
          list.innerHTML = '';
          const ql = q.trim().toLowerCase();
          if (!ql || ql === initial.toLowerCase()) {
            const favs = JC.store.all('safari_bm').filter((b) => b.folder === 'fav');
            list.append(h('div.sf-sec', h('div.sf-sec-h', 'Favorites'), h('div.sf-favs', favs.map((b) => { const el = favTile(b); el.addEventListener('click', () => closeEdit(true), true); return el; }))));
            const recent = JC.store.all('history').slice(0, 5);
            list.append(h('div.sf-sec', h('div.sf-sec-h', 'Recently Visited'), JC.ui.list([{ rows: recent.map((x) => histRow(x, () => { closeEdit(); navigate(x.url); })) }], { cls: 'sf-list' })));
            return;
          }
          const sugg = completions(ql);
          const rows = [];
          const hits = JC.store.all('history').concat(JC.store.all('safari_bm')).filter((x) => (x.title + ' ' + x.url).toLowerCase().includes(ql));
          const uniq = []; const seen = new Set();
          hits.forEach((x) => { if (!seen.has(x.url)) { seen.add(x.url); uniq.push(x); } });
          if (uniq[0]) rows.push({ header: 'Top Hit', rows: [histRow(uniq[0], () => { closeEdit(); navigate(uniq[0].url); })] });
          rows.push({ header: 'Irminsul Search', rows: sugg.map((s) => ({ leading: h('div.sf-sg-ic', JC.icon('magnifyingglass', { size: 15, weight: 2.4 })), title: s, onTap: () => { closeEdit(); navigate(SRCH(s)); }, right: h('span.sf-sg-fill.tap', { onTap: (e) => { e.stopPropagation(); input.value = s + ' '; fill(input.value); input.focus(); } }, JC.icon('arrow.up.left', { size: 15 })) })) });
          const tabHits = S.tabs.filter((tb) => !tb.priv === !S.priv && (tb.title + tb.url).toLowerCase().includes(ql) && tb.id !== (t && t.id));
          if (tabHits.length) rows.push({ header: 'Switch to Tab', rows: tabHits.map((tb) => ({ leading: h('div.sf-sg-ic', JC.icon('square.on.square', { size: 15 })), title: tb.title || tb.url, subtitle: tb.url.replace(/^https?:\/\//, ''), onTap: () => { closeEdit(); setCur(tb.id); show(tb.url); } })) });
          if (uniq.length > 1) rows.push({ header: 'Bookmarks and History', rows: uniq.slice(1, 5).map((x) => histRow(x, () => { closeEdit(); navigate(x.url); })) });
          if (current && !current.start) {
            const n = countMatches(ql);
            rows.push({ header: 'On This Page', rows: [{ leading: h('div.sf-sg-ic', JC.icon('doc.text.magnifyingglass', { size: 15 })), title: n ? 'Find “' + q.trim() + '”' : 'No matches for “' + q.trim() + '”', detail: n ? String(n) : '', onTap: n ? () => { closeEdit(); openFind(q.trim()); } : null }] });
          }
          list.append(JC.ui.list(rows, { cls: 'sf-list' }));
        }
      }
      function closeEdit(keep) {
        if (!edit) return;
        const e = edit;
        edit = null;
        JC.kb.hide();
        bar.classList.remove('hidden');
        U.anim(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).then(() => e.remove());
        void keep;
      }
      function completions(q) {
        const base = ['liyue weather', 'liyue herald', 'rite of parting', 'rex lapis photo', 'osial', 'guyun stone forest', 'glaze lily meaning', 'la 711 flight status', 'yun jin divine damsel', 'wangsheng funeral parlor', 'northland intranet', 'harbor ride lost item', 'what to do if you find a lost phone', 'millelith lost and found', 'frost fortress', 'crux rematch', 'bluefin tuna', 'reel rush high score', 'how to tell your siblings what you do for work', 'guizhong era celadon value'];
        const out = [q];
        base.forEach((b) => { if (b.startsWith(q) && b !== q) out.push(b); });
        base.forEach((b) => { if (!b.startsWith(q) && b.includes(q) && out.length < 5) out.push(b); });
        if (out.length < 4) { out.push(q + ' liyue', q + ' meaning', 'how to ' + q); }
        return out.slice(0, 5);
      }
      function histRow(x, onTap) {
        let host = '';
        try { host = new URL(x.url).hostname; } catch (e) { host = ''; }
        const ic = W().icon(host);
        return { leading: h('div.sf-hic', { style: { background: ic.bg, color: ic.fg } }, ic.letter), title: x.title || x.url, subtitle: x.url.replace(/^https?:\/\//, ''), onTap };
      }

      // ═══ menus ═══
      function moreMenu(anchor) {
        const t = curTab();
        const url = current && !current.start ? current.url : null;
        const isFav = url && JC.store.all('safari_bm').some((b) => b.url === url && b.folder === 'fav');
        JC.ui.menu(anchor, [
          url ? { text: 'Share', icon: 'square.and.arrow.up', onTap: () => share(url, current.title) } : null,
          url ? { text: isFav ? 'Remove from Favorites' : 'Add to Favorites', icon: 'star', onTap: () => toggleFav(url, current.title) } : null,
          url ? { text: 'Add Bookmark', icon: 'book', onTap: () => addBookmark(url, current.title) } : null,
          url ? { text: 'Add to Reading List', icon: 'eyeglasses', onTap: () => addReading(url, current.title) } : null,
          url ? { text: 'Find on Page', icon: 'doc.text.magnifyingglass', onTap: () => openFind('') } : null,
          '-',
          { text: 'Forward', icon: 'arrow.forward', disabled: !t || t.pos >= t.hist.length - 1, onTap: () => goForward() },
          url ? { text: 'Reload', icon: 'arrow.clockwise', onTap: () => reload() } : null,
          '-',
          { text: 'New Tab', icon: 'plus.square.on.square', onTap: () => { if (S.priv) { S.priv = false; save(); } newTab(); } },
          { text: 'New Private Tab', icon: 'hand.raised.slash', onTap: () => openPrivate(true) },
          { text: 'All Tabs', icon: 'square.on.square', sub: tabs().length + ' open', onTap: () => openTabs() },
          '-',
          { text: 'Bookmarks', icon: 'book', onTap: () => openLibrary('bm') },
          { text: 'Reading List', icon: 'eyeglasses', onTap: () => openLibrary('rl') },
          { text: 'History', icon: 'clock', onTap: () => openLibrary('hist') },
        ]);
      }
      function pageMenu(anchor) {
        const url = current && !current.start ? current.url : null;
        JC.ui.menu(anchor, [
          { text: 'Text Size', sub: S.zoom + '%', icon: 'textformat.size', onTap: () => zoomSheet() },
          current && current.reader ? { text: reader ? 'Hide Reader' : 'Show Reader', icon: 'doc.text', onTap: () => (reader ? closeReader() : openReader()) } : { text: 'Reader Not Available', icon: 'doc.text', disabled: true },
          { text: 'Hide Toolbar', icon: 'arrow.down', onTap: () => { compact = true; bar.classList.add('mini'); } },
          url ? { text: S.desktop ? 'Request Mobile Website' : 'Request Desktop Website', icon: 'desktopcomputer', onTap: () => { S.desktop = !S.desktop; save(); show(curTab().url, { instant: true }); } } : null,
          '-',
          url ? { text: 'Translate', icon: 'character.bubble', onTap: () => JC.ui.alert({ title: 'Translation Unavailable', message: 'This page is already in English. (Most of it.)', buttons: [{ text: 'OK' }] }) } : null,
          url ? { text: 'Listen to Page', icon: 'headphones', onTap: () => listen() } : null,
          url ? { text: 'Website Settings', icon: 'gear', onTap: () => siteSettings() } : null,
          { text: 'Privacy Report', icon: 'shield.lefthalf.filled', onTap: () => privacyReport() },
          url ? { text: 'Turn Off Content Blockers', icon: 'hand.raised', onTap: () => { JC.ui.toast('Content blockers off for this site'); reload(); } } : null,
        ]);
      }
      function zoomSheet() {
        const s = JC.ui.sheet({ title: 'Text Size', detent: 'medium', left: { text: 'Done' }, content: () => [h('div.sf-zoom', JC.ui.btn({ icon: 'minus', kind: 'gray', onTap: () => setZoom(-15) }), h('div.sf-zoom-v', S.zoom + '%'), JC.ui.btn({ icon: 'plus', kind: 'gray', onTap: () => setZoom(15) })), h('div.sf-zoom-r', JC.ui.btn({ text: 'Reset', kind: 'plain', onTap: () => setZoom(0, true) }))] });
        function setZoom(d, reset) { S.zoom = reset ? 100 : Math.max(50, Math.min(300, S.zoom + d)); save(); const pg = holder.querySelector('.sf-page'); if (pg) pg.style.zoom = String(S.zoom / 100); s.render(); }
      }
      function siteSettings() {
        const host = current.host;
        JC.ui.sheet({ title: host, detent: 'medium', right: { text: 'Done' }, content: () => [JC.ui.list([{ header: 'Settings for ' + host, rows: [
          { title: 'Request Desktop Website', toggle: { on: !!S.desktop, onChange: (v) => { S.desktop = v; save(); show(curTab().url, { instant: true }); } } },
          { title: 'Use Reader Automatically', toggle: { on: false, onChange: () => {} } },
          { title: 'Use Content Blockers', toggle: { on: true, onChange: () => {} } },
          { title: 'Camera', detail: 'Ask' }, { title: 'Microphone', detail: 'Ask' }, { title: 'Location', detail: 'Deny' },
        ] }])] });
      }
      let listening = null;
      function listen() {
        if (listening) { stopListen(); return; }
        const txt = (current.reader ? current.reader.paras.join(' ') : holder.textContent || '').slice(0, 2000);
        listening = true;
        JC.os.island.start('safari-listen', { priority: 1, width: 200, compact: () => ({ left: h('span.sf-isl', JC.icon('headphones', { size: 16 })), right: h('span.sf-isl-r', 'Listening') }), onTap: () => stopListen() });
        try {
          if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(txt); u.rate = 1.05; u.onend = () => stopListen(); window.speechSynthesis.speak(u); }
          else setTimeout(stopListen, 8000);
        } catch (e) { setTimeout(stopListen, 8000); }
        JC.ui.toast('Listening to page — tap the Dynamic Island to stop', { icon: 'headphones' });
      }
      function stopListen() { listening = null; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } JC.os.island.stop('safari-listen'); }

      function share(url, title) { JC.ui.share({ title: title || url, subtitle: url.replace(/^https?:\/\//, '').split('/')[0], icon: 'globe', payload: { kind: 'link', url, text: (title || '') + ' ' + url } }); }
      function toggleFav(url, title) {
        const b = JC.store.all('safari_bm').find((x) => x.url === url && x.folder === 'fav');
        if (b) { JC.store.remove('safari_bm', b.id); JC.ui.toast('Removed from Favorites', { icon: 'star' }); }
        else { JC.store.add('safari_bm', { folder: 'fav', title: (title || url).split(' — ')[0].slice(0, 40), url }); JC.ui.toast('Added to Favorites', { icon: 'star.fill' }); }
      }
      function addBookmark(url, title) {
        let folder = 'root';
        let name = (title || url).split(' — ')[0];
        const s = JC.ui.sheet({ title: 'Add Bookmark', detent: 'large', left: { text: 'Cancel' }, right: { text: 'Save', onTap: () => { JC.store.add('safari_bm', { folder, title: name || url, url }); JC.ui.toast('Bookmark saved', { icon: 'book' }); } },
          content: () => [JC.ui.list([{ rows: [{ custom: JC.ui.input({ value: name, cls: 'form-field sf-field', onInput: (v) => { name = v; } }) }, { title: url.replace(/^https?:\/\//, ''), subtitle: 'Address' }] }, { header: 'Location', rows: [['root', 'Bookmarks', 'book']].concat(FOLDERS).map(([k, t]) => ({ title: t, icon: { glyph: k === 'fav' ? 'star.fill' : k === 'root' ? 'book.fill' : 'folder.fill', bg: k === 'fav' ? 'var(--yellow)' : 'var(--blue)' }, check: folder === k, onTap: () => { folder = k; s.render(); } })) }])] });
      }
      function addReading(url, title) {
        if (JC.store.all('safari_rl').some((r) => r.url === url)) { JC.ui.toast('Already in Reading List', { icon: 'eyeglasses' }); return; }
        let host = '';
        try { host = new URL(url).hostname; } catch (e) { host = url; }
        JC.store.add('safari_rl', { url, title: (title || url).split(' — ')[0], site: W().siteName(host), t: JC.time.now(), read: false }, { front: true });
        JC.ui.toast('Added to Reading List', { icon: 'eyeglasses' });
      }

      // ═══ library sheet (bookmarks / reading list / history) ═══
      function openLibrary(which, folder0) {
        let tab = which || 'bm';
        let folder = folder0 || null;
        let editing = false;
        let q = '';
        let unreadOnly = false;
        const s = JC.ui.sheet({
          title: '', detent: 'large', cls: 'sf-lib', left: { text: 'Done' },
          content: () => {
            const seg = JC.ui.segmented({ items: ['Bookmarks', 'Reading List', 'History'], value: ['bm', 'rl', 'hist'].indexOf(tab), onChange: (i) => { tab = ['bm', 'rl', 'hist'][i]; folder = null; editing = false; q = ''; s.render(); } });
            const out = [h('div.sf-lib-seg', seg)];
            if (tab === 'bm') {
              const all = JC.store.all('safari_bm');
              if (!folder) {
                out.push(JC.ui.list([{ rows: FOLDERS.map(([k, t, g]) => ({ icon: { glyph: k === 'fav' ? 'star.fill' : 'folder.fill', bg: k === 'fav' ? 'var(--yellow)' : 'var(--blue)' }, title: t, detail: String(all.filter((b) => b.folder === k).length), chevron: true, onTap: () => { folder = k; s.render(); } })).concat(all.filter((b) => b.folder === 'root').map((b) => bmRow(b))) }], { cls: 'sf-list' }));
              } else {
                const F = FOLDERS.find((f) => f[0] === folder);
                const items = all.filter((b) => b.folder === folder);
                out.push(h('div.sf-lib-crumb', h('span.tap', { onTap: () => { folder = null; s.render(); } }, JC.icon('chevron.left', { size: 15, weight: 2.6 }), ' Bookmarks'), h('b', F ? F[1] : folder)));
                out.push(items.length ? JC.ui.list([{ rows: items.map((b) => bmRow(b)) }], { cls: 'sf-list' }) : JC.ui.empty({ icon: 'book', title: 'No Bookmarks', text: 'Add bookmarks from the ··· menu.' }));
              }
              out.push(h('div.sf-lib-foot', h('span.tap', { onTap: () => JC.ui.alert({ title: 'New Folder', input: { placeholder: 'Title' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) { FOLDERS.push([U.uid('f'), r.value, 'folder']); s.render(); } }) }, 'New Folder'), h('span.tap', { onTap: () => { editing = !editing; s.render(); } }, editing ? 'Done' : 'Edit')));
            } else if (tab === 'rl') {
              const items = JC.store.all('safari_rl').filter((r) => !unreadOnly || !r.read);
              out.push(items.length ? JC.ui.list([{ rows: items.map((r) => ({ leading: r.art ? JC.art.el(r.art, { cls: 'sf-rl-art' }) : h('div.sf-rl-art.ic', { style: { background: W().icon(new URL(r.url).hostname).bg, color: '#fff' } }, W().icon(new URL(r.url).hostname).letter), title: r.title, subtitle: r.site + ' · ' + U.fmtRelative(r.t), titleRight: r.read ? null : h('span.sf-unread'), onTap: () => { s.close(); navigate(r.url); }, swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('safari_rl', r.id); s.render(); } }], lead: [{ text: r.read ? 'Unread' : 'Read', color: 'var(--blue)', onTap: () => { JC.store.update('safari_rl', r.id, { read: !r.read }); s.render(); } }] })) }], { cls: 'sf-list' }) : JC.ui.empty({ icon: 'eyeglasses', title: unreadOnly ? 'No Unread Items' : 'No Items', text: 'Save pages to read later, even offline.' }));
              out.push(h('div.sf-lib-foot', h('span.tap', { onTap: () => { unreadOnly = !unreadOnly; s.render(); } }, unreadOnly ? 'Show All' : 'Show Unread'), h('span.tap', { onTap: () => { JC.store.all('safari_rl').forEach((r) => JC.store.update('safari_rl', r.id, { read: true })); s.render(); } }, 'Mark All Read')));
            } else {
              const srch = JC.ui.search({ placeholder: 'Search History', onInput: (v) => { q = v.toLowerCase(); renderHist(); } });
              if (q) srch.setValue(q);
              const box = h('div.sf-histbox');
              out.push(h('div.sf-lib-search', srch), box);
              const renderHist = () => {
                box.innerHTML = '';
                const items = JC.store.all('history').filter((x) => !q || (x.title + x.url).toLowerCase().includes(q)).sort((a, b) => b.t - a.t);
                if (!items.length) { box.appendChild(JC.ui.empty({ icon: 'clock', title: q ? 'No Results' : 'No History', text: q ? '' : 'Pages you visit appear here.' })); return; }
                const groups = [];
                const map = {};
                items.forEach((x) => { const k = dayLabel(x.t); if (!map[k]) { map[k] = []; groups.push(k); } map[k].push(x); });
                box.appendChild(JC.ui.list(groups.map((k) => ({ header: k, rows: map[k].map((x) => Object.assign(histRow(x, () => { s.close(); navigate(x.url); }), { detail: U.fmtTime(x.t), swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('history', x.id); renderHist(); } }] })) })), { cls: 'sf-list' }));
              };
              renderHist();
              out.push(h('div.sf-lib-foot', h('span.tap.destructive', { onTap: () => clearHistory(() => s.render()) }, 'Clear'), h('span', '')));
            }
            return out;
          },
        });
        function bmRow(b) {
          const r = histRow(b, () => { s.close(); navigate(b.url); });
          r.subtitle = b.url.replace(/^https?:\/\//, '');
          if (editing) r.right = h('span.sf-bm-del.tap', { onTap: (e) => { e.stopPropagation(); JC.store.remove('safari_bm', b.id); s.render(); } }, JC.icon('minus.circle.fill', { size: 22 }));
          r.swipe = [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('safari_bm', b.id); s.render(); } }];
          r.menu = () => ({ items: [{ text: 'Open in New Tab', icon: 'plus.square.on.square', onTap: () => { s.close(); navigate(b.url, { newTab: true }); } }, { text: 'Copy Link', icon: 'doc.on.doc', onTap: () => { U.copy(b.url); JC.ui.toast('Copied'); } }, { text: 'Rename', icon: 'pencil', onTap: () => JC.ui.alert({ title: 'Rename Bookmark', input: { value: b.title }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((x) => { if (x.index === 1 && x.value) { JC.store.update('safari_bm', b.id, { title: x.value }); s.render(); } }) }, '-', { text: 'Delete', icon: 'trash', destructive: true, onTap: () => { JC.store.remove('safari_bm', b.id); s.render(); } }] });
          return r;
        }
      }
      function dayLabel(t) {
        const d = new Date(t), n = JC.time.date();
        const diff = U.dayDiff(d, n);
        if (diff <= 0) return d.getHours() >= 17 ? 'This Evening' : 'Today';
        if (diff === 1) return 'Yesterday';
        if (diff < 7) return U.DAYS[d.getDay()];
        if (d.getFullYear() === n.getFullYear()) return U.fmtDate(t, 'long').split(', ').slice(1).join(', ') || U.fmtDate(t, 'md');
        return U.MONTHS[d.getMonth()] + ' ' + d.getFullYear();
      }
      function clearHistory(after) {
        JC.ui.actionSheet({ title: 'Clear History', message: 'Clearing will remove related cookies and other website data. (It will also look very suspicious if he checks.)', actions: [
          { text: 'The Last Hour', style: 'destructive', onTap: () => wipe(3600e3) },
          { text: 'Today', style: 'destructive', onTap: () => wipe((JC.time.date().getHours() * 60 + JC.time.date().getMinutes()) * 60e3) },
          { text: 'Today and Yesterday', style: 'destructive', onTap: () => wipe(86400e3 + (JC.time.date().getHours() * 60 + JC.time.date().getMinutes()) * 60e3) },
          { text: 'All History', style: 'destructive', onTap: () => wipe(Infinity) },
        ] });
        function wipe(ms) {
          const cut = JC.time.now() - ms;
          JC.store.all('history').filter((x) => x.t >= cut).map((x) => x.id).forEach((id) => JC.store.remove('history', id));
          JC.story.act('safari_clear', { ms: ms === Infinity ? 'all' : ms });
          JC.ui.toast('History cleared', { icon: 'trash' });
          if (after) after();
        }
      }

      // ═══ reader ═══
      function openReader() {
        if (!current || !current.reader) return;
        const R = current.reader;
        const prefs = S.reader = S.reader || { theme: 'white', size: 19, font: 'serif' };
        const box = h('div.sf-reader', { class: ['t-' + prefs.theme, 'f-' + prefs.font], style: { '--rs': prefs.size + 'px' } },
          h('div.sf-rd-site', R.site || current.host),
          h('h1.sf-rd-t', R.title),
          R.byline ? h('div.sf-rd-by', R.byline) : null,
          R.hero ? JC.art.el(R.hero, { cls: 'sf-rd-img' }) : null,
          (R.paras || []).map((p) => h('p', p)),
          h('div.sf-rd-end', '—'));
        reader = h('div.sf-reader-wrap.scroll', box);
        body.insertBefore(reader, bar);
        aaBtn.classList.add('on');
        U.anim(reader, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280 });
        JC.ui.toast('Reader · tap “aA” for text options', { icon: 'doc.text' });
        aaBtn.onclick = null;
      }
      function readerMenu(anchor) {
        const p = S.reader;
        JC.ui.menu(anchor, [
          { text: 'Hide Reader', icon: 'doc.text', onTap: () => closeReader() },
          '-',
          { text: 'Larger Text', icon: 'plus', onTap: () => { p.size = Math.min(30, p.size + 2); applyReader(); } },
          { text: 'Smaller Text', icon: 'minus', onTap: () => { p.size = Math.max(14, p.size - 2); applyReader(); } },
          '-',
          ...['white', 'sepia', 'gray', 'night'].map((t) => ({ text: t[0].toUpperCase() + t.slice(1), checked: p.theme === t, onTap: () => { p.theme = t; applyReader(); } })),
          '-',
          ...[['serif', 'Serif'], ['sans', 'Sans Serif']].map(([k, t]) => ({ text: t, checked: p.font === k, onTap: () => { p.font = k; applyReader(); } })),
        ]);
      }
      function applyReader() {
        save();
        const box = reader && reader.querySelector('.sf-reader');
        if (!box) return;
        box.className = 'sf-reader t-' + S.reader.theme + ' f-' + S.reader.font;
        box.style.setProperty('--rs', S.reader.size + 'px');
      }
      function closeReader(silent) {
        if (!reader) return;
        const r = reader;
        reader = null;
        aaBtn.classList.remove('on');
        if (silent) r.remove(); else U.anim(r, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => r.remove());
      }
      // the aA button opens reader options while in Reader
      aaBtn.addEventListener('click', (e) => { if (reader) { e.stopImmediatePropagation(); readerMenu(aaBtn); } }, true);

      // ═══ find on page ═══
      function countMatches(q) { if (!q) return 0; const txt = (holder.textContent || '').toLowerCase(); let n = 0, i = 0; while ((i = txt.indexOf(q, i)) >= 0) { n++; i += q.length; } return n; }
      function clearMarks() { holder.querySelectorAll('mark.sf-hit').forEach((m) => { const t = document.createTextNode(m.textContent); m.replaceWith(t); t.parentNode && t.parentNode.normalize(); }); }
      function openFind(q0) {
        if (findUI) closeFind();
        let hits = [], idx = 0;
        const count = h('span.sf-find-n', '');
        const input = JC.ui.input({ value: q0 || '', placeholder: 'Find on Page', enterkey: 'search', cap: 'none', cls: 'sf-find-in', onInput: (v) => run(v), onSubmit: () => step(1) });
        findUI = h('div.sf-find', h('div.sf-find-field', JC.icon('magnifyingglass', { size: 15, weight: 2.4 }), input, count),
          h('span.sf-find-b.tap', { onTap: () => step(-1) }, JC.icon('chevron.up', { size: 17, weight: 2.6 })),
          h('span.sf-find-b.tap', { onTap: () => step(1) }, JC.icon('chevron.down', { size: 17, weight: 2.6 })),
          h('span.sf-find-done.tap', { onTap: () => closeFind() }, 'Done'));
        body.appendChild(findUI);
        bar.classList.add('hidden');
        setTimeout(() => input.focus(), 60);
        if (q0) run(q0);
        function run(q) {
          clearMarks();
          hits = []; idx = 0;
          q = (q || '').trim();
          if (!q) { count.textContent = ''; return; }
          const walker = document.createTreeWalker(holder, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentNode && !/^(SCRIPT|STYLE|INPUT|TEXTAREA)$/.test(n.parentNode.nodeName) && n.nodeValue.toLowerCase().includes(q.toLowerCase()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
          const nodes = [];
          while (walker.nextNode()) nodes.push(walker.currentNode);
          nodes.forEach((n) => {
            const txt = n.nodeValue;
            const lower = txt.toLowerCase();
            const frag = document.createDocumentFragment();
            let i = 0, j;
            while ((j = lower.indexOf(q.toLowerCase(), i)) >= 0) {
              frag.appendChild(document.createTextNode(txt.slice(i, j)));
              const m = document.createElement('mark');
              m.className = 'sf-hit';
              m.textContent = txt.slice(j, j + q.length);
              frag.appendChild(m);
              hits.push(m);
              i = j + q.length;
            }
            frag.appendChild(document.createTextNode(txt.slice(i)));
            n.replaceWith(frag);
          });
          step(0);
        }
        function step(d) {
          if (!hits.length) { count.textContent = input.value ? '0 of 0' : ''; return; }
          hits.forEach((m) => m.classList.remove('cur'));
          idx = (idx + d + hits.length) % hits.length;
          hits[idx].classList.add('cur');
          hits[idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
          count.textContent = (idx + 1) + ' of ' + hits.length;
        }
      }
      function closeFind() { if (!findUI) return; clearMarks(); findUI.remove(); findUI = null; JC.kb.hide(); bar.classList.remove('hidden'); }

      // ═══ tabs overview ═══
      function openTabs() {
        if (tabsUI) return;
        closeEdit();
        tabsUI = h('div.sf-tabs');
        body.appendChild(tabsUI);
        renderTabs();
        U.anim(tabsUI, [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300 });
      }
      function closeTabs() { if (!tabsUI) return; const t = tabsUI; tabsUI = null; U.anim(t, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 220 }).then(() => t.remove()); }
      function renderTabs() {
        if (!tabsUI) return;
        tabsUI.innerHTML = '';
        tabsUI.classList.toggle('priv', !!S.priv);
        const list = tabs();
        let grid;
        if (S.priv && S.privLocked) {
          grid = h('div.sf-privlock', JC.icon('lock.fill', { size: 40 }), h('div.sf-pl-t', 'Private Browsing Is Locked'), h('div.sf-pl-s', 'Unlock to see your Private Browsing tabs.'), JC.ui.btn({ text: 'Unlock', kind: 'filled', size: 'm', onTap: () => unlockPrivate() }));
        } else if (!list.length) {
          grid = h('div.sf-privlock', JC.icon('square.on.square', { size: 40 }), h('div.sf-pl-t', S.priv ? 'Private Browsing' : 'No Tabs'), h('div.sf-pl-s', S.priv ? 'Safari won’t remember the pages you visit.' : 'Tap + to open a new tab.'));
        } else {
          grid = h('div.sf-tabgrid', list.map((t) => tabCard(t)));
        }
        const groupBtn = h('div.sf-tg.tap', { onTap: (e) => JC.ui.menu(e.currentTarget, [
          { text: tabs().length + ' Tabs', checked: !S.priv, onTap: () => { S.priv = false; save(); renderTabs(); } },
          { text: 'Private', checked: !!S.priv, icon: 'hand.raised.slash', onTap: () => openPrivate() },
          '-',
          { text: 'New Empty Tab Group', icon: 'plus.square.on.square', onTap: () => JC.ui.alert({ title: 'New Tab Group', input: { placeholder: 'Untitled' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1) JC.ui.toast('Tab group “' + (r.value || 'Untitled') + '” created'); }) },
          { text: 'Close All ' + tabs().length + ' Tabs', icon: 'xmark', destructive: true, onTap: () => { tabs().map((t) => t.id).forEach(closeTab); renderTabs(); } },
        ]) }, h('span', S.priv ? 'Private' : list.length + ' Tabs'), JC.icon('chevron.down', { size: 12, weight: 3 }));
        tabsUI.append(h('div.sf-tabs-top', h('div.sf-tabs-title', S.priv ? 'Private' : 'Tabs')), grid,
          h('div.sf-tabs-bar',
            h('div.sf-tb-btn.tap', { onTap: () => (S.priv ? (S.priv = false, save(), renderTabs()) : openPrivate()) }, JC.icon(S.priv ? 'square.on.square' : 'hand.raised.slash', { size: 20 })),
            groupBtn,
            h('div.sf-tb-btn.tap', { onTap: () => { if (S.priv && S.privLocked) { unlockPrivate(); return; } closeTabs(); newTab(); } }, JC.icon('plus', { size: 22, weight: 2.4 })),
            h('div.sf-tb-done.tap', { onTap: () => { closeTabs(); const t = curTab(); if (t) show(t.url, { instant: true }); else newTab(); } }, 'Done')));
      }
      function tabCard(t) {
        const cur = t.id === (S.priv ? S.curPriv : S.cur);
        let host = '';
        try { host = new URL(t.url).hostname; } catch (e) { host = ''; }
        const ic = W().icon(host);
        const shot = h('div.sf-tc-shot');
        try {
          const spec = W().load(t.url, {});
          const inner = h('div.sf-tc-inner', spec.start ? h('div.sf-tc-blank', 'Start Page') : spec.node);
          shot.appendChild(inner);
        } catch (e) { shot.appendChild(h('div.sf-tc-blank', host)); }
        const card = h('div.sf-tc', { class: { cur } },
          h('div.sf-tc-frame', shot, h('div.sf-tc-x.tap', { onTap: (e) => { e.stopPropagation(); closeTab(t.id); renderTabs(); } }, JC.icon('xmark', { size: 12, weight: 3 }))),
          h('div.sf-tc-title', h('span.sf-tc-fav', { style: { background: ic.bg, color: ic.fg } }, ic.letter), h('span', (t.title || t.url || 'Start Page').split(' — ')[0])));
        JC.ui.onTap(card, () => { setCur(t.id); closeTabs(); show(t.url, { instant: true }); });
        JC.ui.contextMenu(card, () => ({ items: [
          { text: 'Copy Link', icon: 'doc.on.doc', onTap: () => { U.copy(t.url); JC.ui.toast('Copied'); } },
          { text: 'Share', icon: 'square.and.arrow.up', onTap: () => share(t.url, t.title) },
          '-',
          { text: 'Close Tab', icon: 'xmark', destructive: true, onTap: () => { closeTab(t.id); renderTabs(); } },
          { text: 'Close Other Tabs', icon: 'xmark.square', destructive: true, onTap: () => { tabs().filter((x) => x.id !== t.id).map((x) => x.id).forEach(closeTab); renderTabs(); } },
        ] }));
        U.drag(card, { axis: 'x', move: (e, p) => { card.style.transform = `translateX(${Math.min(0, p.dx)}px)`; card.style.opacity = String(1 + Math.min(0, p.dx) / 300); }, end: (e, p) => { if (p.dx < -110) { closeTab(t.id); renderTabs(); } else { card.style.transform = ''; card.style.opacity = ''; } } });
        return card;
      }
      function openPrivate(newOne) {
        S.priv = true; save();
        if (S.privLocked) { if (!tabsUI) openTabs(); else renderTabs(); unlockPrivate(newOne); return; }
        if (newOne) { closeTabs(); newTab(); return; }
        if (!tabsUI) openTabs(); else renderTabs();
      }
      function unlockPrivate(thenNew) {
        // Face ID (fails) → passcode
        const ov = h('div.sf-faceid', h('div.sf-fid-glyph', JC.icon('lock.fill', { size: 30 })), h('div.sf-fid-t', 'Face ID'));
        body.appendChild(ov);
        setTimeout(() => {
          ov.classList.add('fail');
          ov.querySelector('.sf-fid-t').textContent = 'Not Recognized';
          JC.audio.play('error');
          setTimeout(() => {
            ov.remove();
            JC.ui.alert({ title: 'Unlock Private Browsing', message: 'Enter iPhone Passcode', input: { placeholder: 'Passcode', type: 'password', kbType: 'num', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Unlock', style: 'default' }] }).then((r) => {
              if (r.index !== 1) { S.priv = false; save(); renderTabs(); return; }
              if ((r.value || '').trim() === (JC.state.d.settings.passcode || JC.world.passcode.code)) {
                S.privLocked = false; save();
                JC.audio.play('unlock');
                JC.story.act('safari_private', {});
                if (thenNew) { closeTabs(); newTab(); } else renderTabs();
              } else { JC.audio.play('error'); JC.ui.alert({ title: 'Incorrect Passcode', buttons: [{ text: 'OK' }] }); S.priv = false; save(); renderTabs(); }
            });
          }, 900);
        }, 900);
      }

      // ═══ intents & lifecycle ═══
      function handle(it) {
        if (!it) return;
        closeEdit(); closeTabs();
        if (it.url) { if (S.priv) { S.priv = false; save(); } navigate(it.url, { newTab: !!it.newTab || (curTab() && curTab().url !== 'about:start') }); }
        else if (it.search) { if (S.priv) { S.priv = false; save(); } navigate(SRCH(it.search), { newTab: !(curTab() && curTab().url === 'about:start') }); }
        else if (it.newTab) { S.priv = false; save(); newTab(); setTimeout(openEdit, 300); }
      }
      // first load
      if (S.priv && S.privLocked) S.priv = false;
      const t0 = curTab();
      if (t0) show(t0.url, { instant: true, restore: true }); else newTab();
      setTimeout(() => handle(intent0), 30);
      const offStore = JC.store.on('safari_bm', () => { if (current && current.start) show('about:start', { instant: true }); });
      return {
        intent: handle,
        show() { updateChrome(); },
        hide() { if (S.priv && !S.privLocked) { S.privLocked = true; save(); } stopListen(); },
        back() {
          if (edit) { closeEdit(); return true; }
          if (findUI) { closeFind(); return true; }
          if (tabsUI) { closeTabs(); return true; }
          if (reader) { closeReader(); return true; }
          const t = curTab();
          if (t && t.pos > 0) { goBack(); return true; }
          return false;
        },
        destroy() { offStore(); stopListen(); },
      };
    },
  });
})();
