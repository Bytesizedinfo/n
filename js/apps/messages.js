/* Messages — iOS 26 Messages: conversation list (pins, rows, swipe, context menus, filters, search, edit modes),
   app lifecycle, intents and story-engine wiring. Conversation screen: messages-conv.js. More screens: messages-more.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const M = (JC.msgApp = JC.msgApp || {});

  const FILTERS = { all: 'Messages', known: 'Known Senders', unknown: 'Unknown Senders', unread: 'Unread Messages' };

  function normCompose(c) {
    if (!c || c === true) return {};
    const o = {};
    if (c.text) o.text = c.text;
    if (c.img || (c.kind === 'photo' && c.art)) o.img = c.img || c.art;
    if (c.memo || (c.kind === 'memo' && c.id)) o.memo = c.memo || c.id;
    if (c.loc || (c.kind === 'location' && c.place)) o.loc = c.loc || c.place;
    if (c.url && !o.img) {
      let site = c.site || '';
      try { site = site || new URL(c.url).hostname.replace(/^www\./, ''); } catch (e) { site = site || c.url; }
      o.link = { title: c.title || c.text || c.url, url: c.url, site, art: c.art };
      delete o.text; // a shared link travels as one preview bubble
    }
    if (c.to) o.to = c.to;
    if (c.thread) o.thread = c.thread;
    return o;
  }

  JC.app({
    id: 'messages',
    name: 'Messages',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-messages');
      win.el.classList.add('msgapp');
      const launchedAt = performance.now();
      const app = { win, visible: true };
      let conv = null;
      let listCtl = null;

      app.isVisible = () => app.visible && JC.os.isOpen('messages');
      app.currentConv = () => conv;
      app.onConvClosed = (c) => { if (conv === c) conv = null; };
      app.openDetails = (tid, c) => M.details(app, tid, c);
      app.openCompose = (pre) => {
        const c = normCompose(pre);
        if (c.thread) { app.openThread(c.thread, { compose: c }); return; }
        if (c.to && !Array.isArray(c.to) && JC.contacts.get(c.to) && (c.text || c.img || c.memo || c.loc || c.link)) {
          app.openThread(JC.story.threadFor(c.to), { compose: c });
          return;
        }
        M.compose(app, c);
      };
      app.popToList = () => {
        let guard = 6;
        while (app.nav.depth() > 1 && guard-- > 0) { if (!app.nav.pop({ instant: true })) break; }
      };

      app.openThread = (tid, o) => {
        o = o || {};
        M.invalidate();
        if (!JC.story.threadDef(tid)) { JC.ui.toast('Conversation not found'); return null; }
        if (conv && conv.tid === tid && app.nav.top() === conv.page) {
          if (o.msg) conv.scrollToMsg(o.msg);
          if (o.compose) { if (o.compose.text) { conv.field.value = o.compose.text; conv.field.dispatchEvent(new Event('input')); } }
          (o.send || []).forEach((p) => conv.send(p));
          return conv;
        }
        app.popToList();
        if (app.nav.depth() > 1) { setTimeout(() => app.openThread(tid, o), 500); return null; }
        const c = M.conversation(app, tid, { msg: o.msg, compose: o.compose });
        const instant = o.instant || !app.isVisible() || performance.now() - launchedAt < 900;
        conv = c;
        app.nav.push(c.page, { instant });
        if (app.nav.top() !== c.page) { c.destroy(); conv = null; setTimeout(() => app.openThread(tid, o), 520); return null; }
        JC.story.act('open_thread', { thread: tid });
        if (instant && app.isVisible()) JC.story.setOpen(tid);
        if (o.send && o.send.length) setTimeout(() => { if (!c.destroyed) o.send.forEach((p) => c.send(p)); }, instant ? 150 : 560);
        return c;
      };

      // ── list page ───────────────────────────────────────────────────────
      function listPage() {
        let filter = 'all';
        let query = '';
        let searching = false;
        let mode = null; // null | 'select' | 'pins'
        const selected = new Set();
        const editBtn = JC.ui.navBtn({ text: 'Edit', cls: 'msg-edit', onTap: (e) => { if (mode) exitMode(); else editMenu(e); } });
        const filterBtn = JC.ui.navBtn({ icon: 'line.3.horizontal.decrease', iconSize: 20, label: 'Filter', onTap: (e) => filterMenu(e) });
        const composeBtn = JC.ui.navBtn({ icon: 'square.and.pencil', iconSize: 20, label: 'Compose', onTap: () => app.openCompose() });
        const pinsHost = h('div.msg-pins-host');
        const rowsHost = h('div.msg-rows-host');
        const selBar = h('div.msg-list-selbar', { hidden: true });
        const page = JC.ui.page({
          title: 'Messages', large: true, bg: 'plain', cls: 'msg-listpage',
          left: [editBtn],
          right: [JC.ui.glassGroup(filterBtn, composeBtn)],
          search: {
            placeholder: 'Search',
            onInput: (q) => { query = q; page.render(); },
            onFocus: () => { searching = true; if (mode) exitMode(); page.render(); },
            onCancel: () => { searching = false; query = ''; page.render(); },
          },
          content: () => content(),
          onShow: () => { M.invalidate(); page.render(); },
        });
        page.el.appendChild(selBar);

        function content() {
          if (query.trim()) return M.searchResults(app, query);
          if (searching) return M.searchSuggest(app);
          renderPins();
          renderRows();
          return [pinsHost, rowsHost];
        }

        function visibleThreads() {
          const all = M.threads();
          if (filter === 'known') return all.filter((t) => !M.isService(t.id));
          if (filter === 'unknown') return all.filter((t) => M.isService(t.id));
          if (filter === 'unread') return all.filter((t) => t.unread > 0);
          return all;
        }

        function renderPins() {
          pinsHost.innerHTML = '';
          if (filter !== 'all') return;
          const pins = M.threads().filter((t) => t.pinned);
          if (!pins.length) return;
          pinsHost.appendChild(h('div.msg-pins', { class: { editing: mode === 'pins', few: pins.length < 3 } }, pins.map((t) => pinEl(t))));
        }

        function pinEl(t) {
          const typing = t.typing && !M.isDead(t.id);
          const showBubble = !typing && t.unread > 0 && t.last && t.last.from !== 'me' && !t.last.sys;
          const el = h('div.msg-pin', {
            class: { unread: t.unread > 0 },
            onTap: () => { if (mode === 'pins') { JC.story.pin(t.id, false); return; } if (mode) return; app.openThread(t.id); },
          },
          h('div.msg-pin-avw',
            t.unread > 0 ? h('div.msg-pin-dot') : null,
            M.avatar(t.id, 84),
            mode === 'pins' ? h('div.msg-pin-minus', JC.icon('minus', { size: 14, weight: 3.2 })) : null,
            typing ? h('div.msg-pin-bub.typing', h('i'), h('i'), h('i')) : null,
            showBubble ? h('div.msg-pin-bub', JC.story.preview(t.last)) : null),
          h('div.msg-pin-name', t.name));
          JC.ui.contextMenu(el, () => (mode ? null : { items: ctxItems(t), preview: convPreview(t.id) }));
          return el;
        }

        function renderRows() {
          rowsHost.innerHTML = '';
          const arr = visibleThreads().filter((t) => !(filter === 'all' && t.pinned));
          if (!arr.length && !(filter === 'all' && M.threads().some((t) => t.pinned))) {
            rowsHost.appendChild(JC.ui.empty({ icon: 'message', title: filter === 'unread' ? 'No Unread Messages' : 'No Messages', text: filter === 'all' ? 'Start a conversation with the compose button.' : 'Nothing here right now.' }));
            return;
          }
          rowsHost.appendChild(JC.ui.list([{ rows: arr.map(rowFor) }], { style: 'plain', cls: 'msg-rows' + (mode ? ' mode-' + mode : '') }));
        }

        function rowFor(t) {
          const sel = mode === 'select';
          const preview = t.last ? JC.story.preview(t.last) : (t.draft ? t.draft : '');
          const lead = h('div.msg-row-lead',
            sel ? h('div.msg-row-check', { class: { on: selected.has(t.id) } }, JC.icon('checkmark', { size: 13, weight: 3.2 })) : h('div.msg-row-dot', { class: { on: t.unread > 0 } }),
            M.avatar(t.id, 50));
          const row = JC.ui.row({
            cls: 'msg-row',
            leading: lead,
            iconInset: sel ? 120 : 86,
            title: h('span.msg-row-name', t.name),
            titleRight: h('span.msg-row-meta',
              t.muted ? JC.icon('bell.slash.fill', { size: 12, cls: 'msg-row-muted' }) : null,
              h('span', t.last ? M.relTime(t.last.t) : ''),
              mode === 'pins' ? null : JC.icon('chevron.right', { size: 12, weight: 2.6 })),
            right: mode === 'pins' ? h('div.msg-row-pinbtn', { onTap: (e) => { e.stopPropagation(); JC.story.pin(t.id, true); } }, JC.icon('pin.fill', { size: 15 })) : null,
            subtitle: t.draft && !t.typing ? h('span', h('span.msg-row-draft', 'Draft: '), t.draft) : (preview || ' '),
            clamp: true,
            onTap: () => {
              if (mode === 'select') { if (selected.has(t.id)) selected.delete(t.id); else selected.add(t.id); JC.audio.haptic(5); renderRows(); renderSelBar(); return; }
              if (mode === 'pins') { JC.story.pin(t.id, true); return; }
              app.openThread(t.id);
            },
            lead: mode ? null : [
              { text: 'Pin', color: 'var(--yellow)', icon: 'pin.fill', onTap: () => JC.story.pin(t.id, true) },
              { text: t.unread ? 'Read' : 'Unread', color: 'var(--blue)', icon: 'message.fill', onTap: () => (t.unread ? JC.story.markRead(t.id) : JC.story.markUnread(t.id)) },
            ],
            swipe: mode ? null : [
              { text: t.muted ? 'Show Alerts' : 'Hide Alerts', color: 'var(--indigo)', icon: t.muted ? 'bell.fill' : 'bell.slash.fill', onTap: () => JC.story.mute(t.id, !t.muted) },
              { text: 'Delete', color: 'var(--red)', icon: 'trash.fill', onTap: () => M.confirmDelete(t.id) },
            ],
            menu: mode ? null : () => ({ items: ctxItems(t), preview: convPreview(t.id) }),
          });
          if (t.unread) row.classList.add('unread');
          row.dataset.tid = t.id;
          return row;
        }

        function ctxItems(t) {
          return [
            { text: t.pinned ? 'Unpin' : 'Pin', icon: t.pinned ? 'pin.slash' : 'pin', onTap: () => JC.story.pin(t.id, !t.pinned) },
            { text: t.unread ? 'Mark as Read' : 'Mark as Unread', icon: t.unread ? 'message' : 'message.fill', onTap: () => (t.unread ? JC.story.markRead(t.id) : JC.story.markUnread(t.id)) },
            { text: t.muted ? 'Show Alerts' : 'Hide Alerts', icon: t.muted ? 'bell' : 'bell.slash.fill', onTap: () => JC.story.mute(t.id, !t.muted) },
            '-',
            { text: 'Delete', icon: 'trash', destructive: true, onTap: () => M.confirmDelete(t.id) },
          ];
        }

        function convPreview(tid) {
          const msgs = JC.story.messages(tid).filter((m) => !m.sys && !m.unsent).slice(-8);
          const group = M.isGroup(tid);
          const sms = M.isSMS(tid) || M.isDead(tid);
          return h('div.msg-cprev', { class: { sms } },
            h('div.msg-cprev-head', M.avatar(tid, 34), h('span', M.name(tid))),
            h('div.msg-cprev-list', msgs.map((m) => h('div.msg-cprev-m', { class: { out: m.from === 'me' } },
              group && m.from !== 'me' ? h('div.msg-cprev-who', M.short(m.from)) : null,
              m.img ? h('div.msg-cprev-img', { style: { backgroundImage: `url("${JC.art.url(m.img)}")` } }) : h('div.msg-cprev-b', JC.story.preview(m))))));
        }

        // modes
        function editMenu(e) {
          JC.ui.menu(e.currentTarget, [
            { text: 'Select Messages', icon: 'checkmark.circle.fill', onTap: () => enterMode('select') },
            { text: 'Edit Pins', icon: 'pin', onTap: () => enterMode('pins') },
            { text: 'Set Up Name & Photo', icon: 'person.crop.circle', onTap: () => M.namePhoto() },
            '-',
            { text: 'Show Recently Deleted', icon: 'trash', onTap: () => M.recentlyDeleted(app) },
          ]);
        }
        function enterMode(m) {
          mode = m;
          selected.clear();
          editBtn.querySelector('span').textContent = 'Done';
          editBtn.classList.add('prominent');
          page.el.classList.add('mode-' + m);
          if (m === 'select') { selBar.hidden = false; renderSelBar(); }
          page.render();
        }
        function exitMode() {
          page.el.classList.remove('mode-' + mode);
          mode = null;
          selected.clear();
          editBtn.querySelector('span').textContent = 'Edit';
          editBtn.classList.remove('prominent');
          selBar.hidden = true;
          page.render();
        }
        function renderSelBar() {
          selBar.innerHTML = '';
          const n = selected.size;
          selBar.append(
            h('div.msg-lsb-btn', { onTap: () => {
              const ids = n ? Array.from(selected) : M.threads().map((t) => t.id);
              ids.forEach((id) => JC.story.markRead(id));
              exitMode();
            } }, n ? 'Read' : 'Read All'),
            h('div.msg-lsb-n', n ? n + ' Selected' : ''),
            h('div.msg-lsb-btn.del', { class: { off: !n }, onTap: () => {
              if (!n) return;
              JC.ui.alert({ title: 'Delete ' + (n === 1 ? 'Conversation' : n + ' Conversations') + '?', message: 'They will be moved to Recently Deleted.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { Array.from(selected).forEach((id) => M.deleteThread(id)); exitMode(); } }] });
            } }, 'Delete'));
        }

        function filterMenu(e) {
          JC.ui.menu(e.currentTarget, [
            { text: 'All Messages', icon: 'message', checked: filter === 'all', onTap: () => setFilter('all') },
            { text: 'Known Senders', icon: 'person.crop.circle', checked: filter === 'known', onTap: () => setFilter('known') },
            { text: 'Unknown Senders', icon: 'questionmark.circle', checked: filter === 'unknown', onTap: () => setFilter('unknown') },
            { text: 'Unread Messages', icon: 'message.fill', checked: filter === 'unread', onTap: () => setFilter('unread') },
            '-',
            { text: 'Recently Deleted', icon: 'trash', onTap: () => M.recentlyDeleted(app) },
          ], { title: 'Filter by' });
        }
        function setFilter(f) {
          filter = f;
          page.setTitle(FILTERS[f]);
          filterBtn.classList.toggle('msg-filter-on', f !== 'all');
          page.render();
          page.scrollTop(false);
        }

        const ctl = {
          page,
          refresh() {
            if (query.trim() || searching) return;
            if (page.el.querySelector('.row.swiped') || document.querySelector('.ctx-back')) { scheduleList(600); return; }
            renderPins();
            renderRows();
            if (mode === 'select') renderSelBar();
          },
          refreshPins() { if (!query.trim() && !searching) renderPins(); },
        };
        listCtl = ctl;
        return page;
      }

      let listT = 0;
      function scheduleList(ms) {
        clearTimeout(listT);
        listT = setTimeout(() => { M.invalidate(); if (listCtl) listCtl.refresh(); }, ms || 140);
      }
      let pinsT = 0;
      function schedulePins() {
        clearTimeout(pinsT);
        pinsT = setTimeout(() => { M.invalidate(); if (listCtl) listCtl.refreshPins(); }, 60);
      }

      app.nav = JC.ui.nav(win.body, () => listPage());

      // ── story bus wiring ────────────────────────────────────────────────
      const offs = [];
      const on = (ev, fn) => offs.push(JC.bus.on(ev, fn));
      on('story:thread', (p) => { if (conv && p && p.thread === conv.tid) conv.onThread(p); scheduleList(); });
      on('story:threads', () => { if (conv) conv.onThreads(); scheduleList(); });
      on('story:typing', (p) => { if (conv && p && p.thread === conv.tid) conv.onTyping(); schedulePins(); });
      on('story:pending', (p) => { if (conv && p && p.thread === conv.tid) conv.onPending(); });
      on('story:sus', (p) => { if (conv) conv.onSus(p); });
      on('kb', (k) => { if (conv && k.open) setTimeout(() => conv && conv.kbSuggest(), 0); });
      on('unlock', () => { if (app.isVisible() && conv && conv.isTop()) conv.appShown(); });
      on('lock', () => { if (conv) conv.appHidden(); });
      on('setting', (s) => { if (s && s.key === 'showSus' && conv) conv.onThreads(); });
      on('store:msgprefs', () => scheduleList(300));

      function closeTopOverlay() {
        const ov = win.overlays;
        const pick = (sel) => { const all = ov.querySelectorAll(sel); return all.length ? all[all.length - 1] : null; };
        const b = pick('.ctx-back') || pick('.pmenu-back') || pick('.sheet-back');
        if (b) { b.click(); return true; }
        return false;
      }

      return {
        intent(it) {
          if (!it) return;
          if (it.compose) { app.openCompose(it.compose); return; }
          const tid = it.thread || it.id;
          if (tid) app.openThread(tid, { msg: it.msg });
        },
        show() {
          app.visible = true;
          if (conv && conv.isTop()) conv.appShown();
          scheduleList(30);
        },
        hide() {
          app.visible = false;
          if (conv) conv.appHidden();
          if (JC.kb.visible) JC.kb.suggest(null);
        },
        back() {
          if (closeTopOverlay()) return true;
          if (conv && conv.isTop() && conv.closeOverlays()) return true;
          return false;
        },
        destroy() {
          offs.forEach((f) => f());
          clearTimeout(listT);
          clearTimeout(pinsT);
          if (conv) conv.destroy();
          JC.story.setOpen(null);
          M.stopVoice();
        },
      };
    },
  });
})();
