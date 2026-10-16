/* Reminders — iOS 26: smart lists (Today, Scheduled, All, Flagged, Completed), My Lists (+ Groceries sections),
   list screens with animated completion circles, inline add & edit, swipe delete/flag, details sheet, search. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;

  JC.store.seed('remlists', [
    { id: 'reminders', title: 'Reminders', color: '#0a84ff', icon: 'list.bullet' },
    { id: 'groceries', title: 'Groceries', color: '#34c759', icon: 'cart.fill', kind: 'groceries' },
    { id: 'aling', title: 'A-Ling', color: '#af52de', icon: 'gift.fill' },
    { id: 'work', title: 'Work', color: '#ff9500', icon: 'briefcase.fill' },
  ]);
  const R = (id, list, title, o) => {
    const it = Object.assign({ id, list, title, done: false, due: null, notes: '', flagged: false, priority: 0, created: '-20 09:00' }, o || {});
    if (typeof it.doneAt === 'string') it.doneAt = JC.time.parse(it.doneAt); // not one of JC.store's normalised time keys
    return it;
  };
  JC.store.seed('reminders', [
    R('r_wwx', 'reminders', 'Reply to Wei Wuxian (Sunday)', { due: '+0 22:00', flagged: true, priority: 2, notes: 'Dinner. Soup. Lotus Pier. Yes or no.', created: '-2 08:10' }),
    R('r_tea', 'reminders', 'Book tea?', { due: '+1 10:00', notes: 'Cloud Recesses Tea Shop — the tin with the crane. Or just go. (He said three.)', created: '-2 23:01' }),
    R('r_huang', 'reminders', 'Call Old Huang — the gate, Sunday', { due: '+1 09:00', notes: 'If he comes: let him in. Don’t make him wait at the gate again.', created: '-3 21:40' }),
    R('r_thanks', 'reminders', 'Thank-you note — Jin Group (gala)', { due: '+3 12:00' }),
    R('r_liver', 'reminders', 'Fast from midnight (liver panel)', { due: '+10 22:00', notes: 'Hepatology follow-up Tue 09:30. Yunmeng People’s Hospital.' }),
    R('r_sandu', 'reminders', 'Sandu — service before winter', { due: '+12 09:00', notes: 'Front-left rattle.' }),
    R('r_passport', 'reminders', 'Renew passport', { due: '2026-11-20 09:00' }),
    R('r_clean', 'reminders', 'Pick up dry cleaning (black suit)', { done: true, doneAt: '-2 18:05' }),
    R('r_refill', 'reminders', 'Tacrolimus refill', { done: true, doneAt: '-6 10:00' }),
    R('a_bell', 'aling', 'Jin Ling’s birthday: the bell — polish ✓', { done: true, doneAt: '-4 14:30', notes: 'Lotus Pier silversmith. Purple velvet box.' }),
    R('a_card', 'aling', 'Birthday card — write something. Not a speech.', { due: '+1 20:00', priority: 1 }),
    R('a_cake', 'aling', 'Cake — lotus seed paste (Sizhui knows the bakery)', { due: '+2 17:00', notes: 'Pick up at 17:00. Not gold.' }),
    R('a_sandu', 'aling', 'Do NOT let him drive Sandu', { flagged: true, priority: 3, notes: 'Not before the test. Not after the test. Not ever.' }),
    R('a_permit', 'aling', 'Learner permit: 50 supervised hours (he has 14)', { notes: 'He says sitting in the car with the engine off counts. It doesn’t.' }),
    R('a_string', 'aling', 'Archery — new bowstring before regionals', { due: '+10 18:00' }),
    R('a_uni', 'aling', 'University applications — ask. Gently.', { due: '+20 20:00' }),
    R('a_form', 'aling', 'Sign field trip form', { done: true, doneAt: '-3 08:00' }),
    R('w_dog', 'work', 'Decide: Bring Your Dog to Work Friday', { due: '+0 23:59', flagged: true, notes: 'Liu Qian. Tonight. She will ask.' }),
    R('w_qr', 'work', 'Reply to Lan Qiren (board letter)', { due: '-3 17:00', priority: 1, notes: 'Be polite. Be brief. Mostly brief.' }),
    R('w_deck', 'work', 'Board Q4 deck — review Tang Mei’s draft', { due: '+2 20:00' }),
    R('w_contract', 'work', 'Sign cold-chain contract', { due: '+4 11:00' }),
    R('w_interview', 'work', 'Interview prep — Head of Cold Chain', { due: '+5 14:00' }),
    R('w_soup', 'work', 'Canteen soup week — order lotus root (40 kg)', { done: true, doneAt: '-6 11:00', notes: 'A-Bai placed the order.' }),
    R('g_lotus', 'groceries', 'Lotus root — 2 sections', { notes: 'For home. The canteen has its own problems.' }),
    R('g_ribs', 'groceries', 'Pork ribs — 1 jin'),
    R('g_peony', 'groceries', 'White peony tea (the crane tin)'),
    R('g_treats', 'groceries', 'Dog treats — duck, not chicken (Fairy)'),
    R('g_ginger', 'groceries', 'Ginger'),
    R('g_dates', 'groceries', 'Red dates'),
    R('g_goji', 'groceries', 'Goji berries'),
    R('g_rice', 'groceries', 'Rice — 5 kg'),
    R('g_milktea', 'groceries', 'Brown sugar milk tea powder (A-Ling)'),
    R('g_wine', 'groceries', 'Shaoxing wine'),
    R('g_eggs', 'groceries', 'Eggs', { done: true, doneAt: '-2 08:20' }),
    R('g_scallion', 'groceries', 'Scallions', { done: true, doneAt: '-2 08:21' }),
  ]);

  const GROC = [
    ['Produce', /lotus root|ginger|scallion|radish|cabbage|garlic|onion|fruit|apple|pomelo/i],
    ['Meat', /rib|pork|beef|chicken(?! \()|duck(?! ,)|fish/i],
    ['Pantry', /rice|dates|goji|wine|soy|vinegar|noodle|flour|sugar|powder/i],
    ['Dairy & Eggs', /egg|milk(?! tea)|yogurt|cheese/i],
    ['Tea & Drinks', /tea|coffee|juice|water/i],
    ['Pets', /dog|cat|treat|fairy/i],
  ];
  function grocCat(t) { if (/dog|treat|fairy/i.test(t)) return 'Pets'; if (/tea/i.test(t) && !/milk tea powder/i.test(t)) return 'Tea & Drinks'; const m = GROC.find(([, re]) => re.test(t)); return m ? m[0] : 'Other'; }

  // ── helpers ────────────────────────────────────────────────────────────────
  const lists = () => JC.store.all('remlists');
  const rems = () => JC.store.all('reminders');
  const listById = (id) => JC.store.get('remlists', id) || { id, title: 'Reminders', color: '#0a84ff', icon: 'list.bullet' };
  const sod = (t) => { const d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const now = () => JC.time.now();
  const isOverdue = (r) => !r.done && r.due && (r.allDay ? sod(r.due) < sod(now()) : r.due < now());
  const isToday = (r) => !r.done && r.due && sod(r.due) <= sod(now());
  function dueLabel(r) {
    if (!r.due) return '';
    const d = new Date(r.due), n = JC.time.date(), diff = U.dayDiff(n, d);
    let s = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : diff > 1 && diff < 7 ? U.DAYS[d.getDay()] : U.fmtDate(r.due, 'short');
    if (!r.allDay) s += ', ' + U.fmtTime(r.due);
    if (r.repeat) s += ' · ' + { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[r.repeat];
    return s;
  }
  const SMART = {
    today: { title: 'Today', color: '#0a84ff', icon: 'calendar', test: (r) => isToday(r) },
    scheduled: { title: 'Scheduled', color: '#ff3b30', icon: 'calendar.badge.plus', test: (r) => !r.done && !!r.due },
    all: { title: 'All', color: '#48484a', icon: 'tray.fill', test: (r) => !r.done },
    flagged: { title: 'Flagged', color: '#ff9500', icon: 'flag.fill', test: (r) => !r.done && r.flagged },
    completed: { title: 'Completed', color: '#8e8e93', icon: 'checkmark', test: (r) => r.done },
  };
  function badgeCount() { return rems().filter((r) => isToday(r)).length; }

  // due notifications while the phone runs
  let lastCheck = 0;
  function checkDue() {
    const t = now();
    const from = lastCheck || t - 60e3;
    lastCheck = t;
    JC.notify.badge('reminders', badgeCount());
    if (t - from > 6 * 3600e3) return;
    rems().forEach((r) => {
      if (r.done || !r.due || r.allDay || r.notified) return;
      if (r.due > from && r.due <= t) {
        JC.store.update('reminders', r.id, { notified: true });
        JC.notify.push({ app: 'reminders', title: r.title, body: (r.notes ? r.notes + '\n' : '') + 'Today, ' + U.fmtTime(r.due), open: { app: 'reminders', intent: { id: r.id } } });
      }
    });
  }
  JC.bus.on('boot', () => {
    lastCheck = now();
    JC.notify.badge('reminders', badgeCount());
    JC.bus.on('minute', checkDue);
    JC.store.on('reminders', () => JC.notify.badge('reminders', badgeCount()));
  });

  JC.icon.add({
    'rm.plus': '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4"/>',
  });
  const ICONS = ['list.bullet', 'cart.fill', 'gift.fill', 'briefcase.fill', 'house.fill', 'heart.fill', 'star.fill', 'pawprint.fill', 'car.fill', 'book.fill', 'leaf.fill', 'flame.fill', 'airplane', 'lotus.fill', 'music.note', 'bell.fill', 'bag.fill', 'creditcard.fill'];
  const COLORS = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#5ac8fa', '#0a84ff', '#5856d6', '#af52de', '#ff2d55', '#a2845e', '#8e8e93', '#30b0c7'];

  /** ui.wheel workaround (see docs/REQUESTS.md + reminders.css) */
  function tameWheel(w) {
    w.querySelectorAll('.wheel-col').forEach((c) => {
      let t = null;
      c.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { const i = Math.round(c.scrollTop / 34); if (Math.abs(c.scrollTop - i * 34) > 0.5) c.scrollTo({ top: i * 34, behavior: 'smooth' }); }, 160); }, { passive: true });
    });
    return w;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'reminders',
    name: 'Reminders',
    status: 'auto',
    launch(win, intent0) {
      win.body.classList.add('app-reminders');
      const live = new Set();
      const keep = (pg) => { live.add(pg); return pg; };
      const glass = (o) => ui.navBtn(o);
      let editingId = null;
      const rerender = () => live.forEach((pg) => { if (pg.el.isConnected) { if (!pg.el.contains(document.activeElement) || document.activeElement === document.body) pg.render(); } else live.delete(pg); });
      const pendingDone = new Set();

      // ═══ ROOT ════════════════════════════════════════════════════════════
      function rootPage() {
        let q = '';
        let editLists = false;
        const page = keep(ui.page({
          title: '', cls: 'rm-root', bg: 'grouped', navbar: true,
          right: [glass({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            { text: editLists ? 'Done Editing' : 'Edit Lists', icon: 'pencil', onTap: () => { editLists = !editLists; page.render(); } },
            { text: 'Templates', icon: 'square.on.square', onTap: () => ui.alert({ title: 'Templates', message: 'Save a list as a template to reuse it. (You have none. You make the same grocery list every week.)', buttons: [{ text: 'OK' }] }) },
            { text: 'Show Completed', icon: 'checkmark.circle.fill', onTap: () => nav.push(smartPage('completed')) },
          ]) })],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          toolbar: [
            h('div.rm-newbtn', { onTap: () => quickNew() }, JC.icon('rm.plus', { size: 24 }), h('span', 'New Reminder')),
            ui.spacer(),
            h('div.rm-addlist', { onTap: () => listSheet(null) }, 'Add List'),
          ],
          content: () => {
            if (q.trim()) return searchResults(q);
            const tiles = Object.keys(SMART).map((k) => {
              const s = SMART[k];
              const n = rems().filter(s.test).length;
              return h('div.rm-tile', { class: k, onTap: () => nav.push(smartPage(k)) },
                h('div.rm-tile-top', h('div.rm-tile-ic', { style: { background: s.color } }, JC.icon(s.icon, { size: 17, weight: 2.2 })), k === 'completed' ? null : h('div.rm-tile-n', String(n))),
                h('div.rm-tile-t', s.title));
            });
            return [
              h('div.rm-tiles', tiles),
              ui.list([{ header: 'My Lists', bigHeader: true, rows: lists().map((l) => ({
                icon: { node: h('div.rm-licon', { style: { background: l.color } }, JC.icon(l.icon || 'list.bullet', { size: 16, weight: 2.2 })) },
                title: l.title,
                detail: String(rems().filter((r) => r.list === l.id && !r.done).length),
                chevron: true,
                info: editLists ? () => listSheet(l) : undefined,
                onTap: () => nav.push(listPage(l.id)),
                swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => deleteList(l) }, { text: 'Info', color: 'var(--gray)', icon: 'info.circle', onTap: () => listSheet(l) }],
                menu: () => ({ items: [
                  { text: 'Show List Info', icon: 'info.circle', onTap: () => listSheet(l) },
                  { text: 'Share List', icon: 'square.and.arrow.up', onTap: () => shareList(l) },
                  { text: 'Delete List', icon: 'trash', destructive: true, onTap: () => deleteList(l) },
                ] }),
              })) }]),
            ];
          },
        }));
        return page;
      }
      function searchResults(q) {
        const s = q.toLowerCase();
        const res = rems().filter((r) => (r.title + ' ' + (r.notes || '')).toLowerCase().includes(s));
        if (!res.length) return [ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'No reminders match “' + q + '”.' })];
        const groups = {};
        res.forEach((r) => { (groups[r.list] = groups[r.list] || []).push(r); });
        return Object.keys(groups).map((lid) => h('div.rm-group', h('div.rm-ghead', { style: { color: listById(lid).color } }, listById(lid).title), h('div.rm-card', groups[lid].map((r) => remRow(r, { showList: false })))));
      }
      function quickNew() {
        const l = lists()[0];
        if (!l) { listSheet(null); return; }
        nav.push(listPage(l.id, { add: true }));
      }

      // ═══ LIST / SMART PAGES ══════════════════════════════════════════════
      function listPage(lid, o) {
        o = o || {};
        let showDone = false;
        let selecting = false;
        let sort = 'manual';
        const sel = new Set();
        const L = () => listById(lid);
        const addRow = h('div.rm-addrow');
        const page = keep(ui.page({
          title: L().title, large: true, cls: 'rm-list', bg: 'grouped', tint: L().color,
          right: [glass({ icon: 'ellipsis', onTap: (e) => listMenu(e.currentTarget) })],
          toolbar: [h('div.rm-newbtn', { onTap: () => startAdd() }, JC.icon('rm.plus', { size: 24 }), h('span', 'New Reminder')), ui.spacer()],
          content: (pg) => {
            const l = L();
            pg.setTitle(l.title);
            pg.el.style.setProperty('--tint', l.color);
            pg.el.style.setProperty('--rm-c', l.color);
            let items = rems().filter((r) => r.list === lid);
            const doneN = items.filter((r) => r.done && !pendingDone.has(r.id)).length;
            items = items.filter((r) => showDone || !r.done || pendingDone.has(r.id));
            items = sorted(items, sort);
            const out = [];
            out.push(h('div.rm-doneline', h('span', doneN + ' Completed'), h('span.rm-dot', '•'), h('span.rm-link', { onTap: () => clearDone(lid) }, 'Clear'), h('span.rm-link.r', { onTap: () => { showDone = !showDone; page.render(); } }, showDone ? 'Hide' : 'Show')));
            if (!items.length && !o.add) out.push(h('div.rm-emptyl', 'No Reminders'));
            if (l.kind === 'groceries') {
              const cats = {};
              items.forEach((r) => { const c = grocCat(r.title); (cats[c] = cats[c] || []).push(r); });
              ['Produce', 'Meat', 'Pantry', 'Dairy & Eggs', 'Tea & Drinks', 'Pets', 'Other'].forEach((c) => { if (cats[c]) out.push(h('div.rm-group', h('div.rm-ghead', c), h('div.rm-card', cats[c].map((r) => remRow(r, { sel: selecting ? sel : null, page: pg }))))); });
            } else if (items.length) out.push(h('div.rm-card', items.map((r) => remRow(r, { sel: selecting ? sel : null, page: pg }))));
            out.push(addRow);
            return out;
          },
          onShow: () => { if (o.add) { o.add = false; startAdd(); } },
        }));
        function startAdd() {
          addRow.innerHTML = '';
          const inp = ui.input({ placeholder: 'New Reminder', cls: 'rm-addin', enterkey: 'next', onSubmit: (v) => {
            const t = (v || '').trim();
            if (!t) { inp.blur(); return; }
            JC.store.add('reminders', { id: U.uid('rem'), list: lid, title: t, done: false, due: null, notes: '', flagged: false, priority: 0, created: now() });
            inp.value = '';
            setTimeout(() => { page.render(); startAdd(); }, 30);
          } });
          inp.addEventListener('blur', () => { setTimeout(() => { const t = (inp.value || '').trim(); if (t) { JC.store.add('reminders', { id: U.uid('rem'), list: lid, title: t, done: false, due: null, notes: '', flagged: false, priority: 0, created: now() }); } if (!addRow.contains(document.activeElement)) { addRow.innerHTML = ''; page.render(); } }, 120); });
          addRow.append(h('div.rm-circ.new'), inp);
          if (!addRow.isConnected) page.content.appendChild(addRow);
          setTimeout(() => { inp.focus(); page.scrollBottom(true); }, 60);
        }
        page.startAdd = startAdd;
        function listMenu(anchor) {
          const l = L();
          ui.menu(anchor, [
            { text: 'Show List Info', icon: 'info.circle', onTap: () => listSheet(l) },
            { text: selecting ? 'Done Selecting' : 'Select Reminders', icon: 'checkmark.circle.fill', onTap: () => { selecting = !selecting; sel.clear(); setSelBar(); page.render(); } },
            { text: 'Sort By', sub: { manual: 'Manual', due: 'Due Date', created: 'Creation Date', priority: 'Priority', title: 'Title' }[sort], icon: 'arrow.up.arrow.down', onTap: () => ui.menu(anchor, ['manual', 'due', 'created', 'priority', 'title'].map((k) => ({ text: { manual: 'Manual', due: 'Due Date', created: 'Creation Date', priority: 'Priority', title: 'Title' }[k], checked: sort === k, onTap: () => { sort = k; page.render(); } }))) },
            { text: showDone ? 'Hide Completed' : 'Show Completed', icon: 'eye', onTap: () => { showDone = !showDone; page.render(); } },
            { text: 'Share List', icon: 'square.and.arrow.up', onTap: () => shareList(l) },
            { text: 'Print', icon: 'printer', onTap: () => ui.alert({ title: 'No AirPrint Printers Found', message: 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }) },
            '-',
            { text: 'Delete List', icon: 'trash', destructive: true, onTap: () => deleteList(l, () => nav.pop()) },
          ]);
        }
        function setSelBar() {
          if (!selecting) { page.setToolbar([h('div.rm-newbtn', { onTap: () => startAdd() }, JC.icon('rm.plus', { size: 24 }), h('span', 'New Reminder')), ui.spacer()]); return; }
          page.setToolbar([
            ui.btn({ text: 'Complete', kind: 'glass', size: 'm', onTap: () => { sel.forEach((id) => JC.store.update('reminders', id, { done: true, doneAt: now() })); selecting = false; sel.clear(); setSelBar(); page.render(); } }),
            ui.spacer(),
            ui.btn({ text: 'Flag', kind: 'glass', size: 'm', onTap: () => { sel.forEach((id) => JC.store.update('reminders', id, { flagged: true })); selecting = false; sel.clear(); setSelBar(); page.render(); } }),
            ui.btn({ text: 'Delete', kind: 'glass', size: 'm', cls: 'rm-red', onTap: () => { sel.forEach((id) => JC.store.remove('reminders', id)); selecting = false; sel.clear(); setSelBar(); page.render(); } }),
          ]);
        }
        page.cancelSelect = () => { if (selecting) { selecting = false; sel.clear(); setSelBar(); page.render(); return true; } return false; };
        return page;
      }
      function smartPage(k) {
        const S = SMART[k];
        const page = keep(ui.page({
          title: S.title, large: true, cls: 'rm-list rm-smart', bg: 'grouped', tint: S.color,
          right: [glass({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            k === 'completed' ? { text: 'Clear All Completed', icon: 'trash', destructive: true, onTap: () => ui.actionSheet({ title: 'Delete all completed reminders?', actions: [{ text: 'Delete All', style: 'destructive', onTap: () => rems().filter((r) => r.done).forEach((r) => JC.store.remove('reminders', r.id)) }] }) } : { text: 'Show Completed', icon: 'eye', onTap: () => nav.push(smartPage('completed')) },
            { text: 'Print', icon: 'printer', onTap: () => ui.alert({ title: 'No AirPrint Printers Found', message: 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }) },
          ]) })],
          toolbar: k === 'completed' ? null : [h('div.rm-newbtn', { onTap: () => { const l = lists()[0]; nav.push(listPage(l.id, { add: true })); } }, JC.icon('rm.plus', { size: 24 }), h('span', 'New Reminder')), ui.spacer()],
          content: (pg) => {
            pg.el.style.setProperty('--rm-c', S.color);
            const items = rems().filter((r) => S.test(r) || pendingDone.has(r.id));
            if (!items.length) return [ui.empty({ icon: S.icon, title: k === 'today' ? 'Nothing Due Today' : 'No Reminders', text: k === 'flagged' ? 'Flag reminders to see them here.' : '' })];
            if (k === 'today') {
              const over = items.filter((r) => r.due && sod(r.due) < sod(now()));
              const rest = items.filter((r) => !over.includes(r));
              const out = [];
              if (over.length) out.push(h('div.rm-group', h('div.rm-ghead.red', 'Overdue'), h('div.rm-card', over.sort((a, b) => a.due - b.due).map((r) => remRow(r, { showList: true, page: pg })))));
              const parts = [['Morning', 0, 12], ['Afternoon', 12, 18], ['Tonight', 18, 24]];
              parts.forEach(([t, a, b]) => { const l = rest.filter((r) => { const hr = new Date(r.due).getHours(); return hr >= a && hr < b; }); if (l.length) out.push(h('div.rm-group', h('div.rm-ghead', t), h('div.rm-card', l.sort((x, y) => x.due - y.due).map((r) => remRow(r, { showList: true, page: pg }))))); });
              return out;
            }
            if (k === 'scheduled') {
              const groups = {};
              items.sort((a, b) => a.due - b.due).forEach((r) => { const d = sod(r.due); const n = sod(now()); const key = d < n ? 'Past Due' : d === n ? 'Today' : d === n + 86400e3 ? 'Tomorrow' : U.fmtDate(d, 'full'); (groups[key] = groups[key] || []).push(r); });
              return Object.keys(groups).map((key) => h('div.rm-group', h('div.rm-ghead', { class: { red: key === 'Past Due' } }, key), h('div.rm-card', groups[key].map((r) => remRow(r, { showList: true, page: pg })))));
            }
            if (k === 'completed') {
              const sortedDone = items.slice().sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
              return [h('div.rm-card', sortedDone.map((r) => remRow(r, { showList: true, page: pg })))];
            }
            const groups = {};
            items.forEach((r) => { (groups[r.list] = groups[r.list] || []).push(r); });
            return lists().filter((l) => groups[l.id]).map((l) => h('div.rm-group', h('div.rm-ghead', { style: { color: l.color } }, l.title), h('div.rm-card', groups[l.id].map((r) => remRow(r, { showList: false, page: pg })))));
          },
        }));
        return page;
      }
      function sorted(items, sort) {
        const l = items.slice();
        if (sort === 'due') l.sort((a, b) => (a.due || 9e15) - (b.due || 9e15));
        else if (sort === 'created') l.sort((a, b) => (b.created || 0) - (a.created || 0));
        else if (sort === 'priority') l.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        else if (sort === 'title') l.sort((a, b) => a.title.localeCompare(b.title));
        return l;
      }

      // ── a reminder row ────────────────────────────────────────────────────
      function remRow(r, o) {
        o = o || {};
        const l = listById(r.list);
        const c = l.color;
        const circ = h('div.rm-circ', { class: { on: r.done }, style: { '--c': c }, onTap: (e) => { e.stopPropagation(); toggle(r, circ, row); } }, h('i'));
        if (o.sel) {
          circ.classList.add('sel');
          circ.classList.toggle('on', o.sel.has(r.id));
        }
        const prio = r.priority ? h('span.rm-prio', { style: { color: c } }, '!'.repeat(r.priority) + ' ') : null;
        const titleEl = h('div.rm-title', { class: { done: r.done } }, prio, r.title);
        const meta = [];
        if (r.notes) meta.push(h('div.rm-notes', r.notes));
        const sub = [];
        if (r.due) sub.push(h('span', { class: { red: isOverdue(r) } }, dueLabel(r)));
        if (o.showList) sub.push(h('span.rm-inlist', l.title));
        if (r.msg) sub.push(h('span', 'When messaging ' + JC.contacts.short(r.msg)));
        if (r.subtasks && r.subtasks.length) sub.push(h('span', r.subtasks.filter((x) => x.done).length + '/' + r.subtasks.length + ' subtasks'));
        const main = h('div.rm-main', titleEl, meta, sub.length ? h('div.rm-sub', sub) : null);
        const right = h('div.rm-right', r.flagged ? h('span.rm-flag', JC.icon('flag.fill', { size: 14 })) : null, h('div.rm-info', { onTap: (e) => { e.stopPropagation(); if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); JC.kb.hide(); setTimeout(() => detailSheet(r.id), 180); } }, JC.icon('info.circle', { size: 22 })));
        const row = ui.row({
          custom: null,
          leading: circ,
          title: main,
          right,
          cls: 'rm-row',
          onTap: () => {
            if (o.sel) { if (o.sel.has(r.id)) o.sel.delete(r.id); else o.sel.add(r.id); circ.classList.toggle('on', o.sel.has(r.id)); return; }
            inlineEdit(r, main, row);
          },
          swipe: [
            { text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('reminders', r.id); } },
            { text: r.flagged ? 'Unflag' : 'Flag', color: 'var(--orange)', icon: 'flag.fill', onTap: () => JC.store.update('reminders', r.id, { flagged: !r.flagged }) },
            { text: 'Details', color: 'var(--gray)', icon: 'info.circle', onTap: () => detailSheet(r.id) },
          ],
        });
        row.dataset.id = r.id;
        ui.contextMenu(row, () => ({ items: [
          { text: r.flagged ? 'Unflag' : 'Flag', icon: 'flag.fill', onTap: () => JC.store.update('reminders', r.id, { flagged: !r.flagged }) },
          { text: 'Show Details', icon: 'info.circle', onTap: () => detailSheet(r.id) },
          { text: 'Move to List', icon: 'list.bullet', onTap: (e) => moveSheet(r) },
          { text: 'Delete', icon: 'trash', destructive: true, onTap: () => JC.store.remove('reminders', r.id) },
        ] }));
        return row;
      }
      function toggle(r, circ, row) {
        const cur = JC.store.get('reminders', r.id);
        if (!cur) return;
        const on = !cur.done;
        circ.classList.toggle('on', on);
        circ.classList.add('pop');
        setTimeout(() => circ.classList.remove('pop'), 300);
        row.querySelector('.rm-title').classList.toggle('done', on);
        JC.audio.play(on ? 'tink' : 'tap');
        JC.audio.haptic(8);
        if (on) {
          pendingDone.add(r.id);
          JC.store.update('reminders', r.id, { done: true, doneAt: now() });
          if (cur.repeat && cur.due) {
            const step = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[cur.repeat] || 1;
            JC.store.add('reminders', Object.assign({}, cur, { id: U.uid('rem'), done: false, doneAt: null, notified: false, due: cur.due + step * 86400e3 }));
          }
          JC.story.act('reminder_done', { id: r.id });
          setTimeout(() => {
            pendingDone.delete(r.id);
            const x = JC.store.get('reminders', r.id);
            if (x && x.done) { U.anim(row, [{ opacity: 1, maxHeight: row.offsetHeight + 'px' }, { opacity: 0, maxHeight: '0px' }], { duration: 300 }).then(() => rerender()); }
          }, 1300);
        } else {
          pendingDone.delete(r.id);
          JC.store.update('reminders', r.id, { done: false, doneAt: null });
        }
      }
      function inlineEdit(r, main, row) {
        if (editingId === r.id) return;
        editingId = r.id;
        const inp = ui.input({ value: r.title, cls: 'rm-editin', multiline: true, send: true, autoGrow: true, maxHeight: 160, rows: 1, enterkey: 'done', onSubmit: () => inp.blur() });
        const notes = ui.input({ value: r.notes || '', placeholder: 'Notes', cls: 'rm-editnotes', enterkey: 'done', onSubmit: () => notes.blur() });
        const dateChips = h('div.rm-editchips',
          h('span.rm-chip', { onTap: (e) => { e.stopPropagation(); quickDate(r, 0); } }, JC.icon('calendar', { size: 14 }), 'Today'),
          h('span.rm-chip', { onTap: (e) => { e.stopPropagation(); quickDate(r, 1); } }, 'Tomorrow'),
          h('span.rm-chip', { onTap: (e) => { e.stopPropagation(); detailSheet(r.id); } }, JC.icon('clock', { size: 14 }), 'Custom'),
          h('span.rm-chip', { onTap: (e) => { e.stopPropagation(); JC.store.update('reminders', r.id, { flagged: !(JC.store.get('reminders', r.id) || {}).flagged }); } }, JC.icon('flag.fill', { size: 13 })));
        main.innerHTML = '';
        main.append(inp, notes, dateChips);
        row.classList.add('editing');
        const finish = () => setTimeout(() => {
          if (main.contains(document.activeElement)) return;
          const t = inp.value.trim();
          editingId = null;
          if (!t) JC.store.remove('reminders', r.id);
          else JC.store.update('reminders', r.id, { title: t, notes: notes.value });
          rerender();
        }, 150);
        inp.addEventListener('blur', finish);
        notes.addEventListener('blur', finish);
        setTimeout(() => { inp.focus(); inp.selectionStart = inp.selectionEnd = inp.value.length; inp.style.height = 'auto'; inp.style.height = Math.min(160, inp.scrollHeight) + 'px'; }, 30);
      }
      function quickDate(r, days) {
        const t = new Date(now());
        t.setDate(t.getDate() + days);
        t.setHours(days === 0 ? Math.min(23, new Date(now()).getHours() + 1) : 9, 0, 0, 0);
        JC.store.update('reminders', r.id, { due: t.getTime(), allDay: false, notified: false });
        ui.toast(days === 0 ? 'Due Today' : 'Due Tomorrow', { icon: 'calendar' });
      }
      function clearDone(lid) {
        const done = rems().filter((r) => r.list === lid && r.done);
        if (!done.length) { ui.toast('No completed reminders'); return; }
        ui.actionSheet({ title: 'Clear ' + done.length + ' Completed Reminder' + (done.length === 1 ? '' : 's') + '?', actions: [{ text: 'Clear', style: 'destructive', onTap: () => done.forEach((r) => JC.store.remove('reminders', r.id)) }] });
      }
      function moveSheet(r) {
        const s = ui.sheet({
          title: 'Move to List', detent: 'medium', left: { text: 'Cancel' },
          content: () => [ui.list([{ rows: lists().map((l) => ({ icon: { node: h('div.rm-licon', { style: { background: l.color } }, JC.icon(l.icon || 'list.bullet', { size: 16, weight: 2.2 })) }, title: l.title, check: l.id === r.list, onTap: () => { JC.store.update('reminders', r.id, { list: l.id }); s.close(); ui.toast('Moved to ' + l.title, { icon: 'list.bullet' }); } })) }])],
        });
      }
      function shareList(l) {
        const items = rems().filter((r) => r.list === l.id && !r.done);
        ui.share({ title: l.title, subtitle: U.plural(items.length, 'Reminder'), icon: 'list.bullet', payload: { kind: 'text', text: l.title + ':\n' + items.map((r) => '◦ ' + r.title).join('\n') } });
      }
      function deleteList(l, after) {
        const n = rems().filter((r) => r.list === l.id).length;
        ui.actionSheet({ title: 'Delete “' + l.title + '”?', message: 'This will delete all ' + n + ' reminders in this list.', actions: [{ text: 'Delete List', style: 'destructive', onTap: () => { rems().filter((r) => r.list === l.id).forEach((r) => JC.store.remove('reminders', r.id)); JC.store.remove('remlists', l.id); after && after(); } }] });
      }

      // ═══ SHEETS ══════════════════════════════════════════════════════════
      function listSheet(l) {
        const isNew = !l;
        const d = l ? Object.assign({}, l) : { title: '', color: COLORS[5], icon: 'list.bullet', kind: null };
        const name = ui.input({ placeholder: 'List Name', value: d.title, cls: 'rm-lname', onInput: (v) => { d.title = v; } });
        const s = ui.sheet({
          title: isNew ? 'New List' : 'Show List Info', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => {
            const t = (d.title || '').trim() || 'New List';
            if (isNew) { const nl = JC.store.add('remlists', { id: U.uid('rl'), title: t, color: d.color, icon: d.icon, kind: d.kind }); setTimeout(() => nav.push(listPage(nl.id, { add: true })), 300); }
            else JC.store.update('remlists', l.id, { title: t, color: d.color, icon: d.icon, kind: d.kind });
          } },
          content: (sh) => [
            h('div.rm-lhead', h('div.rm-lbig', { style: { background: d.color } }, JC.icon(d.icon, { size: 44, weight: 2 })), name),
            ui.list([{ rows: [{ title: 'List Type', detail: d.kind === 'groceries' ? 'Groceries' : 'Standard', chevron: true, onTap: (e) => ui.menu(e.currentTarget, [{ text: 'Standard', checked: d.kind !== 'groceries', onTap: () => { d.kind = null; sh.render(); } }, { text: 'Groceries', sub: 'Items are sorted into sections', checked: d.kind === 'groceries', onTap: () => { d.kind = 'groceries'; sh.render(); } }]) }] }]),
            h('div.rm-swatches', COLORS.map((c) => h('div.rm-swatch', { class: { on: c === d.color }, style: { background: c }, onTap: () => { d.color = c; sh.render(); } }))),
            h('div.rm-icons', ICONS.map((ic) => h('div.rm-iconpick', { class: { on: ic === d.icon }, onTap: () => { d.icon = ic; sh.render(); } }, JC.icon(ic, { size: 20, weight: 2 })))),
          ],
        });
        void s;
        if (isNew) setTimeout(() => name.focus(), 450);
      }
      function detailSheet(id) {
        const r0 = JC.store.get('reminders', id);
        if (!r0) return;
        const d = JSON.parse(JSON.stringify(r0));
        let openW = null;
        const title = ui.input({ value: d.title, placeholder: 'Title', cls: 'rm-df title', onInput: (v) => { d.title = v; } });
        const notes = ui.input({ value: d.notes || '', placeholder: 'Notes', cls: 'rm-df', multiline: true, rows: 2, onInput: (v) => { d.notes = v; } });
        const url = ui.input({ value: d.url || '', placeholder: 'URL', cls: 'rm-df', cap: 'none', onInput: (v) => { d.url = v; } });
        const s = ui.sheet({
          title: 'Details', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => { const t = (d.title || '').trim(); JC.store.update('reminders', id, Object.assign({}, d, { title: t || r0.title, notified: d.due !== r0.due ? false : r0.notified })); } },
          content: (sh) => {
            const hasDate = d.due != null;
            const hasTime = hasDate && !d.allDay;
            const rows1 = [
              { icon: { glyph: 'calendar', bg: '#ff3b30' }, title: 'Date', subtitle: hasDate ? dueLabel(Object.assign({}, d, { allDay: true, repeat: null })) : null, toggle: { on: hasDate, onChange: (v) => { if (v) { const t = new Date(now()); t.setDate(t.getDate() + 1); t.setHours(9, 0, 0, 0); d.due = t.getTime(); d.allDay = true; openW = 'date'; } else { d.due = null; openW = null; } sh.render(); } }, onTap: hasDate ? () => { openW = openW === 'date' ? null : 'date'; sh.render(); } : null },
            ];
            if (openW === 'date' && hasDate) rows1.push({ custom: dateWheel(d, sh) });
            rows1.push({ icon: { glyph: 'clock.fill', bg: '#0a84ff' }, title: 'Time', subtitle: hasTime ? U.fmtTime(d.due) : null, toggle: { on: hasTime, onChange: (v) => { if (v) { if (d.due == null) { const t = new Date(now()); t.setHours(t.getHours() + 1, 0, 0, 0); d.due = t.getTime(); } else { const t = new Date(d.due); t.setHours(9, 0, 0, 0); d.due = t.getTime(); } d.allDay = false; openW = 'time'; } else { d.allDay = true; openW = null; } sh.render(); } }, onTap: hasTime ? () => { openW = openW === 'time' ? null : 'time'; sh.render(); } : null });
            if (openW === 'time' && hasTime) rows1.push({ custom: timeWheel(d, sh) });
            rows1.push({ icon: { glyph: 'alarm.fill', bg: '#ff9500' }, title: 'Urgent', subtitle: 'Alarm will sound', toggle: { on: !!d.urgent, onChange: (v) => { d.urgent = v; } } });
            const rep = { null: 'Never', daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
            return [
              ui.list([{ rows: [{ custom: title }, { custom: notes }, { custom: url }] }]),
              ui.list([{ rows: rows1.concat(hasDate ? [{ icon: { glyph: 'arrow.clockwise', bg: '#8e8e93' }, title: 'Repeat', detail: rep[d.repeat || null], chevron: true, onTap: (e) => ui.menu(e.currentTarget, Object.keys(rep).map((k) => ({ text: rep[k], checked: (d.repeat || 'null') === k, onTap: () => { d.repeat = k === 'null' ? null : k; sh.render(); } }))) }] : []) }]),
              ui.list([{ rows: [
                { icon: { glyph: 'number', bg: '#8e8e93' }, title: 'Tags', detail: (d.tags || []).join(' ') || '', chevron: true, onTap: () => ui.alert({ title: 'Add Tag', input: { placeholder: 'tag' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Add', style: 'default' }] }).then((x) => { if (x.index === 1 && x.value) { d.tags = (d.tags || []).concat('#' + x.value.replace(/^#/, '').replace(/\s+/g, '')); sh.render(); } }) },
              ] }]),
              ui.list([{ rows: [
                { icon: { glyph: 'location.fill', bg: '#0a84ff' }, title: 'Location', toggle: { on: !!d.where, onChange: (v) => { if (v) { d.where = 'Arriving: Lotus Pier'; ui.toast('Reminds you when arriving at Lotus Pier', { icon: 'location.fill' }); } else d.where = null; sh.render(); } }, subtitle: d.where || null },
                { icon: { glyph: 'message.fill', bg: '#34c759' }, title: 'When Messaging', subtitle: d.msg ? JC.contacts.name(d.msg) : null, toggle: { on: !!d.msg, onChange: (v) => { if (v) pickContact((cid) => { d.msg = cid; sh.render(); }, () => sh.render()); else { d.msg = null; sh.render(); } } } },
              ] }]),
              ui.list([{ rows: [
                { icon: { glyph: 'flag.fill', bg: '#ff9500' }, title: 'Flag', toggle: { on: !!d.flagged, onChange: (v) => { d.flagged = v; } } },
                { icon: { glyph: 'exclamationmark.circle.fill', bg: '#ff3b30' }, title: 'Priority', detail: ['None', 'Low', 'Medium', 'High'][d.priority || 0], chevron: true, onTap: (e) => ui.menu(e.currentTarget, ['None', 'Low', 'Medium', 'High'].map((t, i) => ({ text: t, sub: i ? '!'.repeat(i) : '', checked: (d.priority || 0) === i, onTap: () => { d.priority = i; sh.render(); } }))) },
                { icon: { node: h('div.rm-licon', { style: { background: listById(d.list).color } }, JC.icon(listById(d.list).icon || 'list.bullet', { size: 16, weight: 2.2 })) }, title: 'List', detail: listById(d.list).title, chevron: true, onTap: (e) => ui.menu(e.currentTarget, lists().map((l) => ({ text: l.title, checked: l.id === d.list, onTap: () => { d.list = l.id; sh.render(); } }))) },
                { icon: { glyph: 'list.bullet', bg: '#8e8e93' }, title: 'Subtasks', detail: String((d.subtasks || []).length), chevron: true, onTap: () => ui.alert({ title: 'Add Subtask', input: { placeholder: 'Subtask' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Add', style: 'default' }] }).then((x) => { if (x.index === 1 && x.value) { d.subtasks = (d.subtasks || []).concat({ t: x.value, done: false }); sh.render(); } }) },
              ] }]),
              (d.subtasks || []).length ? ui.list([{ header: 'Subtasks', rows: d.subtasks.map((st2, i) => ({ leading: h('div.rm-circ', { class: { on: st2.done }, style: { '--c': listById(d.list).color }, onTap: (e) => { e.stopPropagation(); st2.done = !st2.done; sh.render(); } }, h('i')), title: st2.t, swipe: [{ text: 'Delete', color: 'var(--red)', onTap: () => { d.subtasks.splice(i, 1); sh.render(); } }] })) }]) : null,
              ui.list([{ rows: [{ icon: { glyph: 'photo', bg: '#5856d6' }, title: d.img ? 'Image attached' : 'Add Image', tinted: !d.img, onTap: () => { const p = JC.photoKit ? JC.photoKit.latest() : null; if (p) { d.img = p.art; ui.toast('Attached the latest photo', { icon: 'photo' }); sh.render(); } } }] }]),
              d.img ? h('div.rm-img', JC.art.el(d.img, { cls: 'rm-img-art' })) : null,
              ui.list([{ rows: [{ title: 'Delete Reminder', destructive: true, center: true, onTap: () => { s.close(); JC.store.remove('reminders', id); } }] }]),
            ];
          },
        });
      }
      function dateWheel(d, sh) {
        const base = new Date(now());
        base.setHours(0, 0, 0, 0);
        const items = [];
        for (let i = -30; i <= 400; i++) { const t = new Date(base); t.setDate(t.getDate() + i); items.push({ label: i === 0 ? 'Today' : U.DAYS[t.getDay()].slice(0, 3) + ' ' + U.fmtDate(t, 'md') + (t.getFullYear() !== base.getFullYear() ? ' ' + t.getFullYear() : ''), value: t.getTime() }); }
        return h('div.rm-wheel', tameWheel(ui.wheel({ cols: [{ items, value: sod(d.due) }], onChange: (v) => { const t = new Date(v[0]); const old = new Date(d.due); t.setHours(old.getHours(), old.getMinutes(), 0, 0); d.due = t.getTime(); const sub = sh.body.querySelector('.row .row-subtitle'); if (sub) sub.textContent = dueLabel(Object.assign({}, d, { allDay: true, repeat: null })); } })));
      }
      function timeWheel(d, sh) {
        const cd = new Date(d.due);
        return h('div.rm-wheel', tameWheel(ui.wheel({ cols: [
          { items: Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1 })), value: cd.getHours() % 12 || 12 },
          { items: Array.from({ length: 12 }, (_, i) => ({ label: String(i * 5).padStart(2, '0'), value: i * 5 })), value: Math.round(cd.getMinutes() / 5) * 5 % 60 },
          { items: ['AM', 'PM'], value: cd.getHours() >= 12 ? 'PM' : 'AM' },
        ], onChange: (v) => { const t = new Date(d.due); let hr = v[0] % 12; if (v[2] === 'PM') hr += 12; t.setHours(hr, v[1], 0, 0); d.due = t.getTime(); } })));
      }
      function pickContact(cb, cancel) {
        let picked = false;
        const s = ui.sheet({
          title: 'Choose Person', detent: 'large', left: { text: 'Cancel', onTap: () => { if (!picked) cancel(); } },
          content: () => [ui.list([{ rows: JC.contacts.people().filter((c) => !['ajie', 'mom', 'dad'].includes(c.id)).map((c) => ({ avatar: c.id, avatarSize: 34, title: c.display, onTap: () => { picked = true; s.close(); cb(c.id); } })) }])],
          onClose: () => { if (!picked) cancel(); },
        });
      }

      const nav = ui.nav(win.body, () => rootPage());
      const off1 = JC.store.on('reminders', () => requestAnimationFrame(rerender));
      const off2 = JC.store.on('remlists', () => requestAnimationFrame(rerender));

      function handle(it) {
        if (!it) return;
        if (it.id) {
          const r = JC.store.get('reminders', it.id);
          if (!r) { ui.toast('Reminder not found'); return; }
          while (nav.depth() > 1) nav.pop({ instant: true });
          nav.push(listPage(r.list), { instant: true });
          setTimeout(() => detailSheet(r.id), 350);
          return;
        }
        if (it.list) {
          while (nav.depth() > 1) nav.pop({ instant: true });
          if (SMART[it.list]) nav.push(smartPage(it.list), { instant: true });
          else if (JC.store.get('remlists', it.list)) nav.push(listPage(it.list), { instant: true });
          return;
        }
        if (it.create || it.compose) quickNew();
      }
      if (intent0) setTimeout(() => handle(intent0), 0);
      return {
        intent: handle,
        show() { rerender(); },
        back() { const t = nav.top(); if (t && t.cancelSelect && t.cancelSelect()) return true; return false; },
        destroy() { off1(); off2(); },
      };
    },
  });
})();
