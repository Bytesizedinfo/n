/* Notes — iOS 26: folders (Quick Notes, Notes, Personal, Work, Recently Deleted, + new), tags, list & gallery views,
   pinned notes, search, sort/group menu, editor with checklists, formatting (Aa), tables, attachments, sketches,
   find in note, pin, lock (passcode), move, share, delete. Body text is plain; the first line is the title. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;

  // ── Seed notes (Childe's voice) ─────────────────────────────────────────────
  const N = (id, folder, title, body, t, created, o) => {
    const it = Object.assign({ id, folder, title, body, t, created, pinned: false, locked: false }, o || {});
    if (typeof it.deleted === 'string') it.deleted = JC.time.parse(it.deleted);
    return it;
  };
  JC.store.seed('notes', [
    N('n_teucer', 'personal', 'Things Teucer believes about my job', [
      '(keep this updated. he cross-examines.)',
      '',
      '1. I sell toys for "Northland Toys". Head office is in a mountain.',
      '2. The elves are unionised. Their rep is called Boris. (true, kind of)',
      '3. I personally test every yo-yo before it ships.',
      '4. Sir Fang was a prototype. There are only three in the world.',
      '5. My boss is "the Head of Accounts". She likes ice and hates fun.',
      '6. Christmas is our busy season, which is why I miss it.',
      '7. I can get any toy, any time. (I can. That part is true.)',
      '8. I have never been in a fight. (lol)',
      '',
      'Tonia believes none of this. Tonia is fifteen and terrifying.',
    ].join('\n'), '-2 23:10', '2023-01-04 02:12', { pinned: true }),
    N('n_ledger', 'personal', 'Ledger — what xiansheng owes me', [
      'he never carries money. on purpose. i know.',
      '',
      '| when | what | ℳ |',
      '| Apr 22 | gala consult dinner ("consult") | 2,400 |',
      '| Apr 29 | Xinyue Kiosk — "one of each" | 4,150 |',
      '| May | Third-Round Knockout ×8 | 2,430 |',
      '| May 18 | birdcage (antique, for a thrush) | 3,300 |',
      '| Jun | Heyu Tea House tab | 3,320 |',
      '| Jun 30 | "tea" | 40,000 (??) |',
      '| Jul | jade chess set (he lost on purpose) | 4,700 |',
      '| Aug | osmanthus wine ×6 | 1,450 |',
      '| Sep 3 | a book about rocks. 900 pages | 380 |',
      '| Sep 21 | umbrella he gave to a stranger | 75 |',
      '| Oct 2 | opera box — Yun Jin, Sat | 3,600 |',
      '| Oct 4 | Liuli Pavilion (+ osmanthus wine) | 6,900 |',
      '| Oct 16 | Liuli Pavilion ("other coat") | 8,800 |',
      '',
      'total: ℳ81,505',
      'paid back so far: ℳ0',
      '(+ one very long story about salt. does that count. it was a good story)',
      '',
      '- [ ] ask about the "tea"',
      '- [ ] actually ask him to pay, once',
      '- [x] pay anyway',
      '',
      '— he\'s worth it. don\'t tell him.',
    ].join('\n'), '+0 22:31', '2026-04-22 23:40', { locked: true, pinned: true }),
    N('n_osial', 'work', 'Osial — read once', [
      'Authorization (Phase III, signatory only):',
      'OSL-0918-ΛΣ',
      '',
      'I pitched this. August. Bored, angry, three glasses in. "Wake the thing under the stone forest and the god has to come out." I thought it was a fight. It\'s not a fight. It\'s a harbor full of people.',
      '',
      'Pulled it 9 Oct. Signora: "Your name is already on every document."',
      'Revision 3 had a countersignature. Revision 4 doesn\'t. Ask E. if she kept a copy of rev 3.',
      '',
      'Unit 1 — G-4. Unit 2 — G-9. Unit 3 — G-17 (the tall one, outer ring).',
      'Release on the signatory\'s code only. Wire releases Sun 23:00 unless the card is frozen.',
      '',
      'If anything happens: Ekaterina knows. Ekaterina knows everything.',
      'Don\'t let the kids anywhere near this.',
    ].join('\n'), '-7 03:14', '2026-08-19 01:02', { locked: true }),
    N('n_fishing', 'personal', 'Fishing log', [
      '#fish',
      '',
      '3 Jan — BLUEFIN. 41 kg. Guyun outer pillars, dawn. Named him Scaramouche. Sent the photo to Scaramouche. Blocked for a week. Worth it.',
      '[photo: p_bluefin]',
      '14 Mar — sea bass ×3, Pier 7. xiansheng watched, said nothing for two hours, said "that was very restful". best date of my life (NOT A DATE)',
      '22 Jul — Teucer\'s first fish (2023, rewatching the video for his birthday).',
      '2 Aug — something from the deep with too many teeth. released it. it looked at me like Dottore.',
      '9 Sep — nothing. Beidou says the fish heard I was coming.',
      '16 Oct — Pier 7 tonight. new rod (his gift). slack tide 23:00.',
    ].join('\n'), '+0 22:50', '2026-01-03 07:20'),
    N('n_logins', 'work', 'wifi + logins', [
      'Pier View wifi: PierView-2207 / fishfishfish',
      'Branch guest wifi: NB-Liyue-Guest / ask Ekaterina',
      '',
      'Northland intranet — intranet.northland.sn',
      'user: nb-liyue',
      'pass: Tsaritsa\'sOwn11',
      '(Ekaterina says change it. Ekaterina is right. later.)',
      '',
      'Ripple (private): @ajax.fishes',
      'Feiyun Market: same as always',
    ].join('\n'), '-30 10:15', '2026-03-12 09:40'),
    N('n_gifts', 'personal', 'Gift ideas: T / T / A', [
      '- [ ] Teucer — Glacier Guardians FROST FORTRESS (Feiyun has it!!) or Sir Fang XL (he already has Sir Fang. a second Sir Fang?? a cousin)',
      '- [ ] Tonia — a real fountain pen. SNEZHNAYA Atelier. she writes letters like it\'s 1900',
      '- [ ] Anthon — headset that "doesn\'t sound like a fridge"',
      '- [x] Mama — the good tea (sent)',
      '- [ ] Papa — ??? (a new net. he\'ll say no. he\'ll use it)',
      '- [ ] xiansheng — the celadon set?? he\'ll pretend he doesn\'t want it',
    ].join('\n'), '-3 22:40', '2026-09-28 21:00'),
    N('n_visit', 'personal', 'kids\' visit?? (if Mama means it)', [
      '- [ ] clean apartment (hide the masks)',
      '- [ ] tell Ekaterina',
      '- [ ] "factory tour" — think of something. elves.',
      '- [ ] DON\'T let Pulcinella arrange anything',
      '- [ ] fishing with T. at dawn',
      '- [ ] introduce them to xiansheng?? (as what)',
    ].join('\n'), '-2 01:15', '-2 01:15'),
    N('n_rematch', 'personal', 'Rematch notes — Beidou', [
      'she drops her left shoulder before the overhead swing',
      'stay inside her reach',
      'do NOT laugh mid-fight',
      'Kazuha will "referee" (he will write a poem about it)',
      'score: Beidou 3, me 2 (the 2nd one counts, I don\'t care what Kazuha says)',
    ].join('\n'), '-20 01:10', '-20 01:10'),
    N('n_phrases', 'personal', 'Liyue phrases xiansheng taught me', [
      'tap two fingers when someone pours your tea (thank you)',
      'never give a clock as a gift',
      '"the mountains are high and the emperor is far away" — he laughed when I said it. why did he laugh',
      '"a contract is a promise that has decided to be brave"',
      'how to say "I\'m paying" — he made me practise it. suspicious',
    ].join('\n'), '-9 23:30', '2026-05-02 22:15'),
    N('n_collections', 'work', 'Q4 — collections (Liyue)', [
      'Jade Chamber loan review — Ningguang wants the terms in writing. Of course she does.',
      'Feiyun Commerce Guild — paid early. suspicious.',
      'Crux Shipping — "we\'ll pay after the storm season." Beidou. no.',
      'Wangsheng Holdings — Hu Tao offered to pay in "coupons". no.',
      '',
      'Pantalone wants numbers by Monday. Pantalone always wants numbers by Monday.',
    ].join('\n'), '-4 09:30', '2026-10-01 09:00'),
    N('n_draft_zl', 'notes', 'xiansheng —', [
      'xiansheng —',
      '',
      'I',
    ].join('\n'), '+0 22:44', '+0 22:41', { deleted: '+0 22:46' }),
  ]);
  JC.store.seed('notefolders', [
    { id: 'personal', title: 'Personal' },
    { id: 'work', title: 'Work' },
  ]);

  JC.icon.add({
    'nt.checklist': '<circle cx="5.5" cy="7" r="2.2"/><circle cx="5.5" cy="16.5" r="2.2"/><path d="M10.5 7h10M10.5 16.5h10"/>',
    'nt.table': '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M3.5 14.5h17M9.2 9.5v10M14.8 9.5v10"/>',
    'nt.markup': '<path d="M15.6 4.4 19.6 8.4 9 19H5v-4z"/><path d="M13.2 6.8l4 4"/>',
    'nt.aa': '<path d="M3 18 7.5 6 12 18M4.6 14h5.8"/><path d="M14 18l3.3-8.6L20.6 18M15.1 15.2h4.4"/>',
    'nt.kbdown': '<rect x="3" y="4" width="18" height="11" rx="2"/><path d="M6.5 7.5h1M9.5 7.5h1M12.5 7.5h1M15.5 7.5h1M8 11.5h8M9 18l3 2.5 3-2.5"/>',
    'nt.folder.plus': '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
    'nt.quick': '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M8 8.5h8M8 12h5"/><path d="M15.5 14.5l3 3-3 3"/>',
    'nt.gallery': '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    'nt.lines': '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 9h17M3.5 14.5h17"/>',
    'nt.find': '<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/><path d="M8 10.5h5" />',
    'nt.tag': '<path d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16"/>',
    'nt.bold': '<path d="M7 4.5h6a3.5 3.5 0 0 1 0 7H7zM7 11.5h7a4 4 0 0 1 0 8H7z" stroke-width="2.4"/>',
    'nt.italic': '<path d="M10 4.5h8M6 19.5h8M14.5 4.5l-5 15"/>',
    'nt.underline': '<path d="M7 4v7a5 5 0 0 0 10 0V4M5.5 20h13"/>',
    'nt.strike': '<path d="M4 12h16M16.5 7.5c0-1.7-1.9-3-4.5-3S7.5 5.6 7.5 7.4c0 4.6 9.3 3 9.3 8.4 0 2-2 3.7-4.8 3.7-2.7 0-4.8-1.4-4.8-3.4"/>',
    'nt.bullets': '<circle cx="5" cy="7" r="1.3" fill="currentColor"/><circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="5" cy="17" r="1.3" fill="currentColor"/><path d="M9 7h11M9 12h11M9 17h11"/>',
    'nt.dashes': '<path d="M3.5 7h3M3.5 12h3M3.5 17h3M9 7h11M9 12h11M9 17h11"/>',
    'nt.numbers': '<path d="M4 5.5 5.5 4.5v5M4 9.5h3M3.8 14.3c.4-.9 2.6-1 2.6.3 0 1.1-2.6 1.8-2.6 3.4h2.8M9.5 7h10.5M9.5 16h10.5"/>',
    'nt.quote': '<path d="M4 5v14M8 7.5h12M8 12h12M8 16.5h8"/>',
    'nt.indent': '<path d="M4 6h16M10 10.5h10M10 15h10M4 19.5h16M4 9.5l3 3-3 3"/>',
    'nt.outdent': '<path d="M4 6h16M10 10.5h10M10 15h10M4 19.5h16M7 9.5l-3 3 3 3"/>',
    'nt.mono': '<path d="M8 7 3.5 12 8 17M16 7l4.5 5-4.5 5M13.5 5l-3 14"/>',
  });

  const PASS = () => (JC.state.d.settings && JC.state.d.settings.passcode) || JC.world.passcode.code;
  const SYS = { quick: 'Quick Notes', notes: 'Notes', all: 'All iCloud', deleted: 'Recently Deleted' };
  const st = { view: 'list', sort: 'edited', group: true, unlocked: {}, showCount: true };

  // ── helpers ────────────────────────────────────────────────────────────────
  const all = () => JC.store.all('notes');
  const live = () => all().filter((n) => !n.deleted);
  const folders = () => JC.store.all('notefolders');
  function folderName(id) { if (SYS[id]) return SYS[id]; if (id && id[0] === '#') return id === '#all' ? 'All Tags' : id; const f = JC.store.get('notefolders', id); return f ? f.title : 'Notes'; }
  function inFolder(fid) {
    if (fid === 'deleted') return all().filter((n) => n.deleted);
    if (fid === 'all') return live().filter((n) => n.folder !== 'quick' || true);
    if (fid && fid.startsWith('#')) return live().filter((n) => tagsOf(n).includes(fid));
    return live().filter((n) => (n.folder || 'notes') === fid);
  }
  function fullText(n) {
    const title = n.title || '';
    const body = n.body || '';
    if (!title) return body;
    if (body === title || body.startsWith(title + '\n')) return body;
    return title + (body ? '\n' + body : '');
  }
  function splitText(txt) {
    const lines = txt.split('\n');
    const first = (lines[0] || '').replace(/^#{1,3}\s+/, '').trim();
    return { title: first, body: lines.slice(1).join('\n') };
  }
  function plain(s) {
    return s.replace(/^- \[[ x]\] /gm, '').replace(/^#{1,3}\s+/gm, '').replace(/\*\*|__|~~/g, '').replace(/\[(photo|sketch): [^\]]+\]/g, '').replace(/^\|.*\|$/gm, '').replace(/\s+/g, ' ').trim();
  }
  function preview(n) {
    if (n.locked) return 'Locked';
    const b = (n.body || '').split('\n').map((l) => plain(l)).filter(Boolean)[0];
    return b || (hasAttach(n) ? '1 attachment' : 'No additional text');
  }
  function tagsOf(n) { if (n.locked) return []; return Array.from(new Set(((n.body || '') + ' ' + (n.title || '')).match(/(^|\s)#[a-z][\w-]*/gi) || [])).map((t) => t.trim().toLowerCase()); }
  function attachments(n) { if (n.locked) return []; const out = []; (n.body || '').replace(/\[(photo|sketch): ([^\]]+)\]/g, (m, k, v) => { out.push({ kind: k, v: v.trim() }); return m; }); return out; }
  function hasAttach(n) { return attachments(n).length > 0; }
  function isChecklist(n) { return !n.locked && /^- \[[ x]\] /m.test(n.body || ''); }
  function stampShort(t) {
    const d = new Date(t), now = JC.time.date(), diff = U.dayDiff(d, now);
    if (diff <= 0) return U.fmtTime(t);
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(t, 'short');
  }
  function groupKey(t) {
    const d = new Date(t), now = JC.time.date(), diff = U.dayDiff(d, now);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return 'Previous 7 Days';
    if (diff < 30) return 'Previous 30 Days';
    if (d.getFullYear() === now.getFullYear()) return U.MONTHS[d.getMonth()];
    return String(d.getFullYear());
  }
  function sortNotes(list) {
    const l = list.slice();
    if (st.sort === 'title') l.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    else if (st.sort === 'created') l.sort((a, b) => (b.created || b.t) - (a.created || a.t));
    else l.sort((a, b) => b.t - a.t);
    return l;
  }
  function esc(s) { return U.esc(s); }
  function inline(s, q) {
    let x = esc(s);
    x = x.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/~~(.+?)~~/g, '<s>$1</s>').replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,!?]|$)/g, '$1<i>$2</i>');
    x = x.replace(/(^|\s)(#[a-z][\w-]*)/gi, '$1<span class="nt-tag">$2</span>');
    x = x.replace(/(https?:\/\/[^\s<]+)/g, '<span class="nt-link">$1</span>');
    if (q) {
      const re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![^<]*>)', 'gi');
      x = x.replace(re, '<mark class="nt-mark">$1</mark>');
    }
    return x;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'notes',
    name: 'Notes',
    status: 'auto',
    launch(win, intent0) {
      win.body.classList.add('app-notes');
      const livePages = new Set();
      const keep = (pg) => { livePages.add(pg); return pg; };
      let editor = null;
      const glass = (o) => ui.navBtn(o);
      const rerender = () => livePages.forEach((pg) => { if (pg.el.isConnected) { if (pg !== (editor && editor.page)) pg.render(); } else livePages.delete(pg); });
      const nav = ui.nav(win.body, () => foldersPage());
      const off1 = JC.store.on('notes', () => requestAnimationFrame(rerender));
      const off2 = JC.store.on('notefolders', () => requestAnimationFrame(rerender));

      // ═══ FOLDERS ════════════════════════════════════════════════════════
      function foldersPage() {
        let editing = false;
        let q = '';
        const editBtn = glass({ text: 'Edit', onTap: () => { editing = !editing; editBtn.querySelector('span').textContent = editing ? 'Done' : 'Edit'; page.render(); } });
        const page = keep(ui.page({
          title: 'Folders', large: true, bg: 'grouped', cls: 'nt-folders', tint: 'var(--nt-tint)',
          right: [editBtn],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          toolbar: [
            glass({ icon: 'nt.folder.plus', onTap: () => newFolder() }),
            ui.spacer(),
            glass({ icon: 'square.and.pencil', onTap: () => compose('notes') }),
          ],
          content: (pg) => {
            if (q.trim()) return searchResults(q);
            const count = (fid) => inFolder(fid).length;
            const row = (fid, icon, extra) => Object.assign({
              icon: { node: h('div.nt-ficon', JC.icon(icon, { size: 22 })) },
              title: folderName(fid), detail: String(count(fid)), chevron: true,
              onTap: () => nav.push(listPage(fid)),
            }, extra || {});
            const userRows = folders().map((f) => row(f.id, 'folder', {
              swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => deleteFolder(f.id) }],
              lead: [{ text: 'Rename', color: 'var(--blue)', icon: 'pencil', onTap: () => renameFolder(f.id) }],
              menu: () => ({ items: [
                { text: 'Rename', icon: 'pencil', onTap: () => renameFolder(f.id) },
                { text: 'Move', icon: 'folder', onTap: () => ui.toast('Folders can only be moved inside iCloud') },
                { text: 'Delete', icon: 'trash', destructive: true, onTap: () => deleteFolder(f.id) },
              ] }),
              info: editing ? () => renameFolder(f.id) : undefined,
            }));
            const tags = Array.from(new Set(live().flatMap(tagsOf))).sort();
            return [
              ui.list([{ rows: [row('quick', 'nt.quick')] }]),
              ui.list([{ header: 'iCloud', bigHeader: true, rows: [row('all', 'folder'), row('notes', 'folder')].concat(userRows, [row('deleted', 'trash')]) }]),
              tags.length ? ui.list([{ header: 'Tags', bigHeader: true, rows: [{ custom: h('div.nt-tags', h('div.nt-tagchip', { onTap: () => nav.push(listPage('#all')) }, 'All Tags'), tags.map((t) => h('div.nt-tagchip', { onTap: () => nav.push(listPage(t)) }, t))) }] }]) : null,
            ];
          },
        }));
        return page;
      }
      function searchResults(q) {
        const s = q.toLowerCase();
        const res = sortNotes(live().filter((n) => ((n.title || '') + ' ' + (n.locked ? '' : n.body || '')).toLowerCase().includes(s)));
        if (!res.length) return [ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Check the spelling or try a new search.' })];
        return [ui.list([{ header: 'Top Hits', rows: res.map((n) => noteRow(n, { folderLabel: true, q })) }])];
      }
      function newFolder() {
        ui.alert({ title: 'New Folder', message: 'Enter a name for this folder.', input: { placeholder: 'Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          const t = (r.value || '').trim() || 'New Folder';
          JC.store.add('notefolders', { id: U.uid('nf'), title: t });
          ui.toast('Folder “' + t + '” created', { icon: 'folder.fill' });
        });
      }
      function renameFolder(id) {
        const f = JC.store.get('notefolders', id);
        if (!f) return;
        ui.alert({ title: 'Rename Folder', input: { value: f.title, placeholder: 'Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index === 1 && (r.value || '').trim()) JC.store.update('notefolders', id, { title: r.value.trim() });
        });
      }
      function deleteFolder(id) {
        const f = JC.store.get('notefolders', id);
        if (!f) return;
        const n = inFolder(id).length;
        ui.actionSheet({ title: 'Delete Folder?', message: n ? 'The ' + n + ' notes in “' + f.title + '” will be moved to Recently Deleted.' : 'This folder is empty.', actions: [{ text: 'Delete Folder', style: 'destructive', onTap: () => {
          inFolder(id).forEach((x) => JC.store.update('notes', x.id, { deleted: JC.time.now() }));
          JC.store.remove('notefolders', id);
        } }] });
      }

      // ═══ NOTE LIST ══════════════════════════════════════════════════════
      function noteRow(n, o) {
        o = o || {};
        const isDel = !!n.deleted;
        const att = attachments(n).find((a) => a.kind === 'photo');
        const sub = h('span.nt-row-sub', h('span.nt-row-time', stampShort(n.t)), n.locked ? h('span.nt-row-lock', JC.icon('lock.fill', { size: 11 }), ' Locked') : h('span', '  ' + preview(n)));
        const row = {
          title: n.locked && !st.unlocked[n.id] ? (n.title || 'Locked Note') : (n.title || 'New Note'),
          titleRight: n.pinned && o.showPin ? h('span.nt-pin', JC.icon('pin.fill', { size: 11 })) : null,
          subtitle: sub,
          subtitle2: o.folderLabel ? h('span.nt-row-folder', JC.icon('folder', { size: 13 }), ' ' + folderName(n.folder || 'notes')) : null,
          right: att ? JC.art.el(att.v, { cls: 'nt-row-thumb' }) : n.locked ? h('div.nt-row-lockic', JC.icon('lock.fill', { size: 15 })) : null,
          onTap: () => { if (o.onTap) o.onTap(n); else openNote(n.id); },
          cls: 'nt-row',
          swipe: isDel ? [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => deleteForever(n.id) }, { text: 'Recover', color: 'var(--blue)', icon: 'arrow.counterclockwise', onTap: () => recover(n.id) }]
            : [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => trash(n.id) }, { text: 'Move', color: 'var(--purple)', icon: 'folder.fill', onTap: () => moveSheet([n.id]) }, { text: 'Share', color: 'var(--blue)', icon: 'square.and.arrow.up', onTap: () => shareNote(n) }],
          lead: isDel ? null : [{ text: n.pinned ? 'Unpin' : 'Pin', color: 'var(--orange)', icon: n.pinned ? 'pin.slash' : 'pin.fill', onTap: () => JC.store.update('notes', n.id, { pinned: !n.pinned }) }],
          menu: isDel ? null : () => ({ items: noteMenu(n) }),
        };
        return row;
      }
      function noteMenu(n) {
        return [
          { text: n.pinned ? 'Unpin Note' : 'Pin Note', icon: n.pinned ? 'pin.slash' : 'pin.fill', onTap: () => JC.store.update('notes', n.id, { pinned: !n.pinned }) },
          { text: n.locked ? 'Remove Lock' : 'Lock Note', icon: n.locked ? 'lock.open.fill' : 'lock.fill', onTap: () => toggleLock(n.id) },
          { text: 'Share Note', icon: 'square.and.arrow.up', onTap: () => withUnlock(n, () => shareNote(n)) },
          { text: 'Send a Copy', icon: 'paperplane.fill', onTap: () => withUnlock(n, () => JC.os.open('messages', { compose: { text: plain(fullText(n)).slice(0, 400) } })) },
          { text: 'Move', icon: 'folder', onTap: () => moveSheet([n.id]) },
          '-',
          { text: 'Delete', icon: 'trash', destructive: true, onTap: () => trash(n.id) },
        ];
      }
      function listPage(fid) {
        let q = '';
        let selecting = false;
        const sel = new Set();
        const isDel = fid === 'deleted';
        const title = fid === '#all' ? 'All Tags' : folderName(fid);
        const countLbl = h('div.tb-label', '');
        const more = glass({ icon: 'ellipsis', onTap: (e) => listMenu(e.currentTarget) });
        const page = keep(ui.page({
          title, large: true, bg: 'grouped', cls: 'nt-list', tint: 'var(--nt-tint)',
          right: [more],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          toolbar: isDel ? [ui.spacer(), countLbl, ui.spacer()] : [ui.spacer(), countLbl, glass({ icon: 'square.and.pencil', onTap: () => compose(fid) })],
          content: (pg) => {
            let list = fid === '#all' ? live().filter((n) => tagsOf(n).length) : inFolder(fid);
            if (q.trim()) { const s = q.toLowerCase(); list = list.filter((n) => ((n.title || '') + ' ' + (n.locked ? '' : n.body || '')).toLowerCase().includes(s)); }
            list = sortNotes(list);
            countLbl.textContent = selecting ? (sel.size ? sel.size + ' Selected' : 'Select Notes') : (list.length ? U.plural(list.length, 'Note') : 'No Notes');
            if (selecting) pg.setToolbar([
              ui.btn({ text: 'Move', kind: 'glass', size: 'm', onTap: () => { if (sel.size) moveSheet(Array.from(sel), () => setSel(false)); } }),
              ui.spacer(), countLbl, ui.spacer(),
              ui.btn({ text: isDel ? 'Delete' : 'Delete', kind: 'glass', size: 'm', onTap: () => { if (!sel.size) return; if (isDel) { ui.actionSheet({ actions: [{ text: 'Delete ' + U.plural(sel.size, 'Note'), style: 'destructive', onTap: () => { sel.forEach((id) => JC.store.remove('notes', id)); setSel(false); } }] }); } else { sel.forEach((id) => trash(id, true)); setSel(false); } } }),
            ]);
            else if (!isDel) pg.setToolbar([ui.spacer(), countLbl, glass({ icon: 'square.and.pencil', onTap: () => compose(fid) })]);
            else pg.setToolbar([ui.spacer(), countLbl, ui.spacer()]);
            if (!list.length) return [ui.empty({ icon: isDel ? 'trash' : 'doc.text', title: isDel ? 'No Notes' : 'No Notes', text: isDel ? 'Notes are available here for 30 days. After that, they’ll be permanently deleted.' : 'Tap the compose button to create a note.' })];
            const out = [];
            if (isDel) out.push(h('div.nt-delnote', 'Notes are available here for 30 days. After that time, notes will be permanently deleted. This may take up to 40 days.'));
            const rowFor = (n) => {
              if (selecting) return { title: n.title || 'New Note', subtitle: h('span.nt-row-sub', h('span.nt-row-time', stampShort(n.t)), h('span', '  ' + preview(n))), leading: h('div.nt-selcirc', { class: { on: sel.has(n.id) } }, JC.icon('checkmark', { size: 13, weight: 3 })), onTap: () => { if (sel.has(n.id)) sel.delete(n.id); else sel.add(n.id); page.render(); }, cls: 'nt-row' };
              return noteRow(n, { folderLabel: fid === 'all' || fid.startsWith('#'), onTap: isDel ? (x) => openDeleted(x) : null });
            };
            if (st.view === 'gallery' && !selecting) {
              const pinned = list.filter((n) => n.pinned && !isDel);
              const rest = list.filter((n) => !n.pinned || isDel);
              if (pinned.length) out.push(h('div.nt-ghead', 'Pinned'), gallery(pinned));
              if (rest.length) out.push(pinned.length ? h('div.nt-ghead', 'Notes') : null, gallery(rest));
              return out;
            }
            const pinned = isDel ? [] : list.filter((n) => n.pinned);
            const rest = isDel ? list : list.filter((n) => !n.pinned);
            const sections = [];
            if (pinned.length) sections.push({ header: h('span.nt-sechead', JC.icon('pin.fill', { size: 13 }), ' Pinned'), rows: pinned.map(rowFor) });
            if (st.group && st.sort !== 'title') {
              const groups = [];
              const map = {};
              rest.forEach((n) => { const k = groupKey(st.sort === 'created' ? (n.created || n.t) : n.t); if (!map[k]) { map[k] = []; groups.push(k); } map[k].push(n); });
              groups.forEach((k) => sections.push({ header: k, rows: map[k].map(rowFor) }));
            } else if (rest.length) sections.push({ header: pinned.length ? 'Notes' : null, rows: rest.map(rowFor) });
            out.push(ui.list(sections, { cls: 'nt-sections' }));
            return out;
          },
        }));
        function gallery(list) {
          return h('div.nt-gallery', list.map((n) => {
            const card = h('div.nt-gcard', { onTap: () => (isDel ? openDeleted(n) : openNote(n.id)) },
              h('div.nt-gthumb', n.locked ? h('div.nt-glock', JC.icon('lock.fill', { size: 26 })) : renderMini(n)),
              h('div.nt-gtitle', n.title || 'New Note'), h('div.nt-gdate', stampShort(n.t)));
            if (!isDel) ui.contextMenu(card, () => ({ items: noteMenu(n) }));
            return card;
          }));
        }
        function setSel(on) { selecting = on; sel.clear(); page.render(); }
        page.cancelSelect = () => { if (selecting) { setSel(false); return true; } return false; };
        function listMenu(anchor) {
          const items = [];
          if (!isDel) {
            items.push({ text: st.view === 'list' ? 'View as Gallery' : 'View as List', icon: st.view === 'list' ? 'nt.gallery' : 'list.bullet', onTap: () => { st.view = st.view === 'list' ? 'gallery' : 'list'; rerender(); } });
          }
          items.push({ text: selecting ? 'Done Selecting' : 'Select Notes', icon: 'checkmark.circle.fill', onTap: () => setSel(!selecting) });
          items.push('-');
          items.push({ text: 'Sort By', sub: { edited: 'Date Edited', created: 'Date Created', title: 'Title' }[st.sort], icon: 'arrow.up.arrow.down', onTap: () => ui.menu(anchor, [
            { text: 'Date Edited', checked: st.sort === 'edited', onTap: () => { st.sort = 'edited'; rerender(); } },
            { text: 'Date Created', checked: st.sort === 'created', onTap: () => { st.sort = 'created'; rerender(); } },
            { text: 'Title', checked: st.sort === 'title', onTap: () => { st.sort = 'title'; rerender(); } },
          ]) });
          items.push({ text: 'Group By Date', sub: st.group ? 'On' : 'Off', icon: 'calendar', onTap: () => { st.group = !st.group; rerender(); } });
          if (!isDel) items.push({ text: 'View Attachments', icon: 'paperclip', onTap: () => nav.push(attachPage(fid)) });
          if (isDel) {
            items.push('-');
            items.push({ text: 'Recover All', icon: 'arrow.counterclockwise', onTap: () => inFolder('deleted').forEach((n) => recover(n.id, true)) });
            items.push({ text: 'Delete All', icon: 'trash', destructive: true, onTap: () => ui.actionSheet({ message: 'These notes will be deleted. This action can’t be undone.', actions: [{ text: 'Delete All', style: 'destructive', onTap: () => inFolder('deleted').forEach((n) => JC.store.remove('notes', n.id)) }] }) });
          } else if (JC.store.get('notefolders', fid)) {
            items.push('-');
            items.push({ text: 'Rename Folder', icon: 'pencil', onTap: () => renameFolder(fid) });
            items.push({ text: 'Delete Folder', icon: 'trash', destructive: true, onTap: () => { deleteFolder(fid); } });
          }
          ui.menu(anchor, items);
        }
        return page;
      }
      function renderMini(n) {
        const lines = fullText(n).split('\n').slice(0, 12);
        return h('div.nt-mini', lines.map((l, i) => {
          if (/^\[photo: /.test(l)) return JC.art.el(l.slice(8, -1).trim(), { cls: 'nt-mini-img' });
          const m = l.match(/^- \[([ x])\] (.*)$/);
          if (m) return h('div.nt-mini-l', h('span.nt-mini-c', { class: { on: m[1] === 'x' } }), plain(m[2]));
          return h('div.nt-mini-l', { class: { t: i === 0 } }, plain(l) || ' ');
        }));
      }
      function attachPage(fid) {
        return ui.page({
          title: 'Attachments', large: false, cls: 'nt-attpage',
          content: () => {
            const items = [];
            (fid === 'all' || fid.startsWith('#') ? live() : inFolder(fid)).forEach((n) => attachments(n).forEach((a) => items.push({ n, a })));
            if (!items.length) return [ui.empty({ icon: 'paperclip', title: 'No Attachments', text: 'Photos, scans and sketches in your notes will appear here.' })];
            return [h('div.nt-attgrid', items.map(({ n, a }) => h('div.nt-attcell', { onTap: () => openNote(n.id) }, a.kind === 'photo' ? JC.art.el(a.v, { cls: 'nt-att-img' }) : h('div.nt-att-img', { style: { backgroundImage: `url("${(n.sketches || {})[a.v] || ''}")` } }), h('div.nt-att-t', n.title || 'Note'))))];
          },
        });
      }

      // ═══ ACTIONS ════════════════════════════════════════════════════════
      function trash(id, quiet) {
        const n = JC.store.get('notes', id);
        if (!n) return;
        JC.store.update('notes', id, { deleted: JC.time.now(), pinned: false });
        if (!quiet) ui.toast('Moved to Recently Deleted', { icon: 'trash' });
      }
      function recover(id, quiet) {
        const n = JC.store.get('notes', id);
        if (!n) return;
        const f = n.folder && (SYS[n.folder] || JC.store.get('notefolders', n.folder)) ? n.folder : 'notes';
        JC.store.update('notes', id, { deleted: null, folder: f });
        if (!quiet) ui.toast('Recovered to “' + folderName(f) + '”', { icon: 'arrow.counterclockwise' });
      }
      function deleteForever(id) {
        ui.actionSheet({ message: 'This note will be deleted. This action can’t be undone.', actions: [{ text: 'Delete Note', style: 'destructive', onTap: () => JC.store.remove('notes', id) }] });
      }
      function moveSheet(ids, after) {
        const s = ui.sheet({
          title: ids.length === 1 ? 'Move Note' : 'Move ' + ids.length + ' Notes', detent: 'large', left: { text: 'Cancel' },
          content: () => {
            const opts = ['quick', 'notes'].concat(folders().map((f) => f.id));
            return [ui.list([{ header: 'iCloud', rows: opts.map((fid) => ({
              icon: { node: h('div.nt-ficon', JC.icon(fid === 'quick' ? 'nt.quick' : 'folder', { size: 22 })) },
              title: folderName(fid), detail: String(inFolder(fid).length),
              onTap: () => { ids.forEach((id) => JC.store.update('notes', id, { folder: fid, deleted: null })); s.close(); ui.toast('Moved to “' + folderName(fid) + '”', { icon: 'folder.fill' }); after && after(); },
            })).concat([{ icon: { node: h('div.nt-ficon', JC.icon('nt.folder.plus', { size: 22 })) }, title: 'New Folder…', tinted: true, onTap: () => { s.close(); newFolder(); } }]) }])];
          },
        });
      }
      function shareNote(n) {
        ui.share({
          title: n.title || 'Note', subtitle: 'Notes · ' + stampShort(n.t), icon: 'doc.text',
          payload: { kind: 'text', text: plain(fullText(n).split('\n').join(' \n ')).slice(0, 600) },
          actions: [
            { text: 'Collaborate', icon: 'person.2.fill', onTap: () => ui.alert({ title: 'Collaborate', message: 'Invite people to edit “' + (n.title || 'Note') + '”? Everyone you invite will see every edit — including the ones you delete.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Not Now' }] }) },
            { text: 'Move Note', icon: 'folder', onTap: () => moveSheet([n.id]) },
          ],
        });
      }
      function toggleLock(id) {
        const n = JC.store.get('notes', id);
        if (!n) return;
        if (n.locked) {
          passSheet('Remove Lock', () => { JC.store.update('notes', id, { locked: false }); delete st.unlocked[id]; ui.toast('Lock Removed', { icon: 'lock.open.fill' }); });
        } else {
          ui.alert({ title: 'Lock Note?', message: 'Locked notes use your iPhone passcode. Anyone who knows the passcode can open them.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Lock', style: 'default', onTap: () => { JC.store.update('notes', id, { locked: true, pinned: n.pinned }); st.unlocked[id] = true; ui.toast('Note Locked', { icon: 'lock.fill' }); } }] });
        }
      }
      function withUnlock(n, fn) { if (!n.locked || st.unlocked[n.id]) fn(); else passSheet('View Note', () => { st.unlocked[n.id] = true; fn(); }); }
      function compose(fid, o) {
        o = o || {};
        const folder = fid && fid !== 'all' && fid !== 'deleted' && !fid.startsWith('#') ? fid : 'notes';
        const n = JC.store.add('notes', { id: U.uid('note'), folder, title: o.title || '', body: o.body || '', t: JC.time.now(), created: JC.time.now(), pinned: false, locked: false, fresh: true }, { front: true });
        openNote(n.id, { edit: true, caretEnd: true });
        return n;
      }

      // ═══ PASSCODE ════════════════════════════════════════════════════════
      function passSheet(title, ok) {
        if (JC.state.d.settings.faceAlt) {
          const fl = h('div.nt-faceok', JC.icon('checkmark.circle.fill', { size: 54 }), h('div', 'Face ID'));
          win.overlays.appendChild(fl);
          setTimeout(() => { fl.remove(); ok(); }, 650);
          return;
        }
        let entry = '';
        const dots = h('div.nt-pc-dots', [0, 1, 2, 3, 4, 5].map(() => h('div.nt-pc-dot')));
        const msg = h('div.nt-pc-msg', 'Face ID Not Recognized');
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
          if (entry === PASS()) { s.close(); setTimeout(ok, 220); return; }
          JC.audio.play('error');
          msg.textContent = 'Wrong Passcode';
          U.anim(dots, [{ transform: 'translateX(0)' }, { transform: 'translateX(-12px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }], { duration: 380 });
          setTimeout(() => { entry = ''; paint(); }, 300);
        };
        const L = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
        const keys = h('div.nt-pc-keys', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) => {
          if (!k) return h('div.nt-pc-key.ghost');
          if (k === 'del') return h('div.nt-pc-key.fn', { onTap: () => press('del') }, JC.icon('delete.left', { size: 26 }));
          return h('div.nt-pc-key', { onTap: () => press(k) }, h('div.nt-pc-num', k), L[k] ? h('div.nt-pc-let', L[k]) : null);
        }));
        const onKey = (e) => { if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); };
        window.addEventListener('keydown', onKey);
        const s = ui.sheet({
          detent: 'large', cls: 'nt-pc-sheet', left: { text: 'Cancel' }, onClose: () => window.removeEventListener('keydown', onKey),
          content: () => [h('div.nt-pc', h('div.nt-pc-lock', JC.icon('lock.fill', { size: 26 })), h('div.nt-pc-title', 'Enter iPhone Passcode for “Notes”'), h('div.nt-pc-sub', title), msg, dots, keys)],
        });
        setTimeout(() => { if (!s.closed) msg.textContent = 'Enter iPhone Passcode'; }, 1300);
      }

      // ═══ EDITOR ═════════════════════════════════════════════════════════
      function openDeleted(n) {
        const page = ui.page({
          title: '', cls: 'nt-editor nt-readonly', tint: 'var(--nt-tint)',
          right: [glass({ icon: 'ellipsis', onTap: (e) => ui.menu(e.currentTarget, [
            { text: 'Recover', icon: 'arrow.counterclockwise', onTap: () => { recover(n.id); nav.pop(); } },
            { text: 'Delete', icon: 'trash', destructive: true, onTap: () => { JC.store.remove('notes', n.id); nav.pop(); } },
          ]) })],
          content: () => [h('div.nt-delbanner', 'Recently deleted notes can’t be edited.', ui.btn({ text: 'Recover', kind: 'tinted', size: 's', onTap: () => { recover(n.id); nav.pop(); } })), renderNote(n, { readonly: true })],
        });
        nav.push(page);
      }
      function openNote(id, o) {
        o = o || {};
        const n = JC.store.get('notes', id);
        if (!n) { ui.toast('Note not found'); return; }
        if (n.deleted) { openDeleted(n); return; }
        // pop back to a sensible parent
        if (editor) { nav.pop({ instant: true }); }
        const page = editorPage(n.id, o);
        nav.push(page);
      }
      function editorPage(id, o) {
        let n = JC.store.get('notes', id);
        let editing = false;
        let findQ = '';
        let findIdx = 0;
        const view = h('div.nt-view');
        const ta = ui.input({ multiline: true, cls: 'nt-ta', value: fullText(n), cap: 'sentences', onInput: () => onType() });
        ta.setAttribute('spellcheck', 'false');
        const taWrap = h('div.nt-tawrap', { hidden: true }, ta);
        const lockScreen = h('div.nt-locked', { hidden: true });
        const findBar = h('div.nt-find', { hidden: true });
        const shareB = glass({ icon: 'square.and.arrow.up', onTap: () => withUnlock(cur(), () => shareNote(cur())) });
        const moreB = glass({ icon: 'ellipsis', onTap: (e) => editorMenu(e.currentTarget) });
        const doneB = glass({ icon: 'checkmark', prominent: true, onTap: () => setEditing(false) });
        const lockB = glass({ icon: 'lock.open.fill', onTap: () => { delete st.unlocked[id]; paint(); ui.toast('Locked', { icon: 'lock.fill' }); } });
        const page = keep(ui.page({
          title: '', cls: 'nt-editor', tint: 'var(--nt-tint)',
          right: [shareB, moreB],
          content: [findBar, lockScreen, view],
          footer: taWrap,
          toolbar: [],
          onShow: () => { if (o.edit && !editing) { setEditing(true, o.caretEnd); o.edit = false; } },
          onClose: () => finish(),
        }));
        page.render = () => { if (!editing) paint(); return page; };
        const cur = () => JC.store.get('notes', id) || n;
        editor = { page, id, back: () => { if (!findBar.hidden) { closeFind(); return true; } if (editing) { setEditing(false); return true; } return false; } };

        const save = U.debounce(() => {
          const txt = ta.value;
          const sp = splitText(txt);
          if (!JC.store.get('notes', id)) return;
          JC.store.update('notes', id, { title: sp.title, body: sp.body, t: JC.time.now(), fresh: false });
          JC.story.act('note_edit', { id });
        }, 350);
        function onType() { save(); }
        function locked() { const x = cur(); return x.locked && !st.unlocked[id]; }
        function paint() {
          n = cur();
          const lk = locked();
          lockScreen.hidden = !lk;
          view.hidden = lk || editing;
          lockScreen.innerHTML = '';
          if (lk) {
            lockScreen.append(
              h('div.nt-locked-ic', JC.icon('lock.fill', { size: 44 })),
              h('div.nt-locked-t', 'This note is locked.'),
              h('div.nt-locked-s', 'Enter your iPhone passcode to view this note.'),
              ui.btn({ text: 'View Note', kind: 'tinted', size: 'm', onTap: () => passSheet('View Note', () => { st.unlocked[id] = true; paint(); JC.story.act('note_unlock', { id }); JC.story.act('note_open', { id, locked: true }); }) }));
          } else {
            view.innerHTML = '';
            view.appendChild(renderNote(n, { q: findQ, idx: findIdx, onToggle: (li) => toggleLine(li), onTapLine: (li) => { setEditing(true); placeCaret(li); } }));
            view.classList.toggle('lines', n.paper === 'lines');
            view.classList.toggle('grid', n.paper === 'grid');
          }
          page.setRight(editing ? [doneB] : [lk ? null : (n.locked ? lockB : null), shareB, moreB].filter(Boolean));
          page.setToolbar(editing ? editTools() : viewTools(lk));
        }
        function viewTools(lk) {
          if (lk) return [ui.spacer(), glass({ icon: 'square.and.pencil', onTap: () => compose(cur().folder) })];
          return [
            glass({ icon: 'nt.checklist', onTap: () => { setEditing(true, true); insertLine('- [ ] '); } }),
            glass({ icon: 'paperclip', onTap: () => attachMenu() }),
            glass({ icon: 'nt.markup', onTap: () => sketch() }),
            ui.spacer(),
            glass({ icon: 'square.and.pencil', onTap: () => compose(cur().folder) }),
          ];
        }
        function editTools() {
          return [h('div.nt-kbbar',
            h('div.nt-kb', { onTap: () => formatSheet() }, JC.icon('nt.aa', { size: 23 })),
            h('div.nt-kb', { onTap: () => toggleChecklist() }, JC.icon('nt.checklist', { size: 22 })),
            h('div.nt-kb', { onTap: () => insertTable() }, JC.icon('nt.table', { size: 22 })),
            h('div.nt-kb', { onTap: () => attachMenu() }, JC.icon('paperclip', { size: 22 })),
            h('div.nt-kb', { onTap: () => sketch() }, JC.icon('nt.markup', { size: 22 })),
            h('div.nt-kb', { onTap: () => setEditing(false) }, JC.icon('xmark', { size: 20, weight: 2.2 })))];
        }
        function setEditing(on, caretEnd) {
          if (on && locked()) return;
          editing = on;
          page.el.classList.toggle('editing', on);
          if (on) {
            ta.value = fullText(cur()) + (cur().fresh && cur().title && !cur().body ? '\n' : '');
            taWrap.hidden = false;
            view.hidden = true;
            setTimeout(() => { ta.focus(); if (caretEnd) { ta.selectionStart = ta.selectionEnd = ta.value.length; ta.scrollTop = ta.scrollHeight; } }, 30);
          } else {
            save.flush ? save.flush() : null;
            const sp = splitText(ta.value);
            if (JC.store.get('notes', id)) JC.store.update('notes', id, { title: sp.title, body: sp.body });
            ta.blur();
            JC.kb.hide();
            taWrap.hidden = true;
          }
          paint();
        }
        function placeCaret(li) {
          setTimeout(() => {
            const lines = ta.value.split('\n');
            let pos = 0;
            for (let i = 0; i < Math.min(li, lines.length); i++) pos += lines[i].length + 1;
            pos += Math.min((lines[li] || '').length, 999);
            ta.selectionStart = ta.selectionEnd = pos;
            const lh = 24;
            ta.scrollTop = Math.max(0, li * lh - 120);
          }, 50);
        }
        function curLine() {
          const v = ta.value, p = ta.selectionStart;
          const s = v.lastIndexOf('\n', p - 1) + 1;
          let e = v.indexOf('\n', p);
          if (e < 0) e = v.length;
          return { s, e, text: v.slice(s, e) };
        }
        function replaceLine(fn) {
          const L = curLine();
          const nt = fn(L.text);
          ta.setRangeText(nt, L.s, L.e, 'end');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
        }
        function insertLine(prefix) {
          const v = ta.value;
          const atEnd = !v.endsWith('\n') && v.length ? '\n' : '';
          ta.focus();
          ta.selectionStart = ta.selectionEnd = v.length;
          ta.setRangeText(atEnd + prefix, v.length, v.length, 'end');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
        function toggleChecklist() {
          replaceLine((t) => (/^- \[[ x]\] /.test(t) ? t.replace(/^- \[[ x]\] /, '') : '- [ ] ' + t.replace(/^([-•–] |\d+\. )/, '')));
        }
        function insertTable() {
          const L = curLine();
          const tbl = '\n| Column 1 | Column 2 |\n| --- | --- |\n|  |  |\n';
          ta.setRangeText(tbl, L.e, L.e, 'end');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
          ui.toast('Table inserted', { icon: 'nt.table' });
        }
        function wrapSel(mark) {
          const s = ta.selectionStart, e = ta.selectionEnd;
          const v = ta.value;
          if (s === e) { replaceLine((t) => (t.startsWith(mark) && t.endsWith(mark) ? t.slice(mark.length, -mark.length) : mark + t + mark)); return; }
          ta.setRangeText(mark + v.slice(s, e) + mark, s, e, 'end');
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.focus();
        }
        function setStyle(kind) {
          replaceLine((t) => {
            const bare = t.replace(/^(#{1,3} |> |`)/, '').replace(/`$/, '');
            if (kind === 'title') return '# ' + bare;
            if (kind === 'heading') return '## ' + bare;
            if (kind === 'subheading') return '### ' + bare;
            if (kind === 'mono') return '`' + bare + '`';
            if (kind === 'quote') return '> ' + bare;
            return bare;
          });
        }
        function setList(kind) {
          replaceLine((t) => {
            const bare = t.replace(/^(- \[[ x]\] |[-•–] |\d+\. )/, '');
            const cur0 = t.match(/^(- \[[ x]\] |[-•–] |\d+\. )/);
            const want = kind === 'bullet' ? '• ' : kind === 'dash' ? '– ' : '1. ';
            if (cur0 && cur0[0] === want) return bare;
            return want + bare;
          });
        }
        function formatSheet() {
          const s = ui.sheet({
            title: 'Format', detent: 'medium', cls: 'nt-fmt-sheet', right: { text: 'Done', onTap: () => { setTimeout(() => ta.focus(), 50); } },
            content: () => [
              h('div.nt-fmt-styles.hscroll', [['title', 'Title'], ['heading', 'Heading'], ['subheading', 'Subheading'], ['body', 'Body'], ['mono', 'Monostyled']].map(([k, t]) => h('div.nt-fmt-style.' + k, { onTap: () => { setStyle(k); s.close(); setTimeout(() => ta.focus(), 50); } }, t))),
              h('div.nt-fmt-row',
                h('div.nt-fmt-btn', { onTap: () => { wrapSel('**'); s.close(); } }, JC.icon('nt.bold', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { wrapSel('*'); s.close(); } }, JC.icon('nt.italic', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { wrapSel('__'); s.close(); } }, JC.icon('nt.underline', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { wrapSel('~~'); s.close(); } }, JC.icon('nt.strike', { size: 20 }))),
              h('div.nt-fmt-row',
                h('div.nt-fmt-btn', { onTap: () => { setList('bullet'); s.close(); } }, JC.icon('nt.bullets', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { setList('dash'); s.close(); } }, JC.icon('nt.dashes', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { setList('number'); s.close(); } }, JC.icon('nt.numbers', { size: 20 })),
                h('div.nt-fmt-btn', { onTap: () => { setStyle('quote'); s.close(); } }, JC.icon('nt.quote', { size: 20 }))),
              h('div.nt-fmt-row',
                h('div.nt-fmt-btn.wide', { onTap: () => { replaceLine((t) => t.replace(/^ {1,4}/, '')); s.close(); } }, JC.icon('nt.outdent', { size: 20 })),
                h('div.nt-fmt-btn.wide', { onTap: () => { replaceLine((t) => '    ' + t); s.close(); } }, JC.icon('nt.indent', { size: 20 }))),
            ],
          });
        }
        function toggleLine(li) {
          const txt = fullText(cur());
          const lines = txt.split('\n');
          const l = lines[li];
          if (!l) return;
          lines[li] = /^- \[x\] /.test(l) ? l.replace(/^- \[x\] /, '- [ ] ') : l.replace(/^- \[ \] /, '- [x] ');
          const sp = splitText(lines.join('\n'));
          JC.store.update('notes', id, { title: sp.title, body: sp.body, t: JC.time.now() });
          JC.audio.haptic(6);
          JC.story.act('note_edit', { id });
          paint();
        }
        function attachMenu() {
          ui.actionSheet({ actions: [
            { text: 'Choose Photo or Video', icon: 'photo.on.rectangle', onTap: () => pickPhoto() },
            { text: 'Take Photo', icon: 'camera', onTap: () => takePhoto() },
            { text: 'Scan Documents', icon: 'doc.text', onTap: () => ui.alert({ title: 'Scan Documents', message: 'Position your document in view.\n\nIt’s too dark here to find the edges of a page.', buttons: [{ text: 'OK' }] }) },
            { text: 'Attach File', icon: 'folder', onTap: () => ui.alert({ title: 'Files Unavailable', message: '' + JC.world.device.files + '', buttons: [{ text: 'OK' }] }) },
          ] });
        }
        function addLine(text) {
          const txt = editing ? ta.value : fullText(cur());
          const nt = txt + (txt.endsWith('\n') || !txt ? '' : '\n') + text;
          if (editing) { ta.value = nt; ta.dispatchEvent(new Event('input', { bubbles: true })); }
          const sp = splitText(nt);
          JC.store.update('notes', id, { title: sp.title, body: sp.body, t: JC.time.now() });
          JC.story.act('note_edit', { id });
          paint();
        }
        function pickPhoto() {
          const lib = JC.photoKit ? JC.photoKit.library().slice().reverse() : [];
          const s = ui.sheet({
            title: 'Photos', detent: 'large', left: { text: 'Cancel' },
            content: () => [lib.length ? h('div.nt-pick', lib.map((p) => h('div.nt-pick-cell', { onTap: () => { s.close(); addLine('[photo: ' + p.art + ']'); ui.toast('Photo attached', { icon: 'paperclip' }); } }, JC.photoKit.box(p, 1, 'nt-pick-img'), p.kind === 'video' ? h('div.nt-pick-dur', JC.photoKit.dur(p.dur)) : null))) : ui.empty({ icon: 'photo', title: 'No Photos' })],
          });
        }
        function takePhoto() {
          const hr = JC.time.date().getHours();
          const art = hr >= 6 && hr < 18 ? 'cam_morning' : 'p_moon_street';
          JC.audio.play('shutter');
          if (JC.photoKit) JC.photoKit.add({ art, t: JC.time.now(), kind: 'photo', src: 'ip17', place: 'Liyue Harbor', city: 'liyue' });
          addLine('[photo: ' + art + ']');
          ui.toast('Photo taken and attached', { icon: 'camera.fill' });
        }
        function sketch() {
          const cv = h('canvas.nt-canvas');
          cv.width = 720; cv.height = 540;
          const ctx = cv.getContext('2d');
          let color = JC.os.dark ? '#ffffff' : '#000000';
          let width = 4;
          let drawing = false;
          const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height]; };
          cv.addEventListener('pointerdown', (e) => { drawing = true; cv.setPointerCapture(e.pointerId); const [x, y] = pos(e); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.1, y + 0.1); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); });
          cv.addEventListener('pointermove', (e) => { if (!drawing) return; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); });
          cv.addEventListener('pointerup', () => { drawing = false; });
          cv.__tap = true;
          const pens = [['#000000', 'Black'], ['#0a84ff', 'Blue'], ['#ff3b30', 'Red'], ['#ffcc00', 'Yellow'], ['#34c759', 'Green']];
          if (JC.os.dark) pens[0] = ['#ffffff', 'White'];
          const s = ui.sheet({
            title: 'Sketch', detent: 'large', cls: 'nt-sketch-sheet', left: { text: 'Cancel' },
            right: { text: 'Done', onTap: () => {
              const key = 's' + Date.now().toString(36);
              const small = document.createElement('canvas');
              small.width = 360; small.height = 270;
              small.getContext('2d').drawImage(cv, 0, 0, 360, 270);
              const data = small.toDataURL('image/png');
              const sk = Object.assign({}, cur().sketches || {}, { [key]: data });
              JC.store.update('notes', id, { sketches: sk });
              addLine('[sketch: ' + key + ']');
            } },
            content: () => [h('div.nt-sketch', cv), h('div.nt-pens', pens.map(([c, nm]) => h('div.nt-pen', { class: { on: c === color }, style: { '--c': c }, attrs: { 'aria-label': nm }, onTap: (e) => { color = c; s.body.querySelectorAll('.nt-pen').forEach((p) => p.classList.remove('on')); e.currentTarget.classList.add('on'); } })),
              h('div.nt-pen.size', { onTap: (e) => { width = width === 4 ? 10 : width === 10 ? 2 : 4; e.currentTarget.textContent = width + 'pt'; } }, '4pt'),
              h('div.nt-pen.clear', { onTap: () => ctx.clearRect(0, 0, cv.width, cv.height) }, JC.icon('trash', { size: 18 })))],
          });
        }
        function editorMenu(anchor) {
          const x = cur();
          ui.menu(anchor, [
            { text: 'Find in Note', icon: 'magnifyingglass', onTap: () => openFind() },
            { text: 'Move Note', icon: 'folder', onTap: () => moveSheet([id]) },
            { text: x.pinned ? 'Unpin Note' : 'Pin Note', icon: x.pinned ? 'pin.slash' : 'pin.fill', onTap: () => { JC.store.update('notes', id, { pinned: !x.pinned }); ui.toast(x.pinned ? 'Unpinned' : 'Pinned', { icon: 'pin.fill' }); } },
            { text: x.locked ? 'Remove Lock' : 'Lock Note', icon: x.locked ? 'lock.open.fill' : 'lock.fill', onTap: () => { toggleLock(id); setTimeout(paint, 400); } },
            { text: 'Lines & Grids', sub: x.paper === 'lines' ? 'Lines' : x.paper === 'grid' ? 'Grid' : 'None', icon: 'nt.lines', onTap: () => ui.menu(anchor, [
              { text: 'None', checked: !x.paper, onTap: () => { JC.store.update('notes', id, { paper: null }); paint(); } },
              { text: 'Lines', checked: x.paper === 'lines', onTap: () => { JC.store.update('notes', id, { paper: 'lines' }); paint(); } },
              { text: 'Grid', checked: x.paper === 'grid', onTap: () => { JC.store.update('notes', id, { paper: 'grid' }); paint(); } },
            ]) },
            { text: 'Send a Copy', icon: 'paperplane.fill', onTap: () => JC.os.open('messages', { compose: { text: plain(fullText(x)).slice(0, 400) } }) },
            '-',
            { text: 'Delete', icon: 'trash', destructive: true, onTap: () => { trash(id); nav.pop(); } },
          ]);
        }
        function openFind() {
          findBar.hidden = false;
          findBar.innerHTML = '';
          const cnt = h('span.nt-find-n', '');
          const inp = ui.input({ placeholder: 'Find in Note', cls: 'nt-find-in', enterkey: 'search', cap: 'none', onInput: (v) => { findQ = v; findIdx = 0; paint(); upd(); }, onSubmit: () => step(1) });
          const step = (d) => { const n2 = countMatches(); if (!n2) return; findIdx = (findIdx + d + n2) % n2; paint(); upd(); };
          const upd = () => { const n2 = countMatches(); cnt.textContent = findQ ? (n2 ? (findIdx + 1) + ' of ' + n2 : 'Not Found') : ''; const m = view.querySelectorAll('.nt-mark')[findIdx]; if (m) m.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
          findBar.append(h('div.nt-find-field', JC.icon('magnifyingglass', { size: 16 }), inp, cnt),
            h('div.nt-find-btn', { onTap: () => step(-1) }, JC.icon('chevron.up', { size: 16, weight: 2.4 })),
            h('div.nt-find-btn', { onTap: () => step(1) }, JC.icon('chevron.down', { size: 16, weight: 2.4 })),
            h('div.nt-find-done', { onTap: () => closeFind() }, 'Done'));
          setTimeout(() => inp.focus(), 60);
        }
        function countMatches() { if (!findQ) return 0; const s = fullText(cur()).toLowerCase(); let c = 0, i = 0; const q = findQ.toLowerCase(); while ((i = s.indexOf(q, i)) >= 0) { c++; i += q.length; } return c; }
        function closeFind() { findQ = ''; findBar.hidden = true; JC.kb.hide(); paint(); }
        function finish() {
          if (editor && editor.page === page) editor = null;
          const x = JC.store.get('notes', id);
          if (!x) return;
          if (editing) { const sp = splitText(ta.value); JC.store.update('notes', id, { title: sp.title, body: sp.body }); }
          const y = JC.store.get('notes', id);
          if (y && !y.title.trim() && !y.body.trim()) JC.store.remove('notes', id);
          else if (y && y.fresh) JC.store.update('notes', id, { fresh: false });
        }
        paint();
        if (!locked()) JC.story.act('note_open', { id });
        return page;
      }

      // ── renderer (view mode) ────────────────────────────────────────────
      function renderNote(n, o) {
        o = o || {};
        const lines = fullText(n).split('\n');
        const wrap = h('div.nt-doc');
        let mi = 0;
        const markIdx = () => { const out = []; return out; };
        markIdx();
        let i = 0;
        let num = 0;
        while (i < lines.length) {
          const raw = lines[i];
          const li = i;
          if (i === 0) {
            const t = raw.replace(/^#{1,3}\s+/, '');
            wrap.appendChild(h('div.nt-l.nt-title', { html: inline(t || 'New Note', o.q), data: { li } }));
            i++; continue;
          }
          if (/^\|.*\|\s*$/.test(raw)) {
            const rows = [];
            while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) { rows.push(lines[i]); i++; }
            const tbl = h('table.nt-table');
            rows.filter((r) => !/^\|\s*-{2,}/.test(r)).forEach((r, ri) => {
              const cells = r.trim().replace(/^\||\|$/g, '').split('|');
              tbl.appendChild(h('tr', cells.map((c) => h(ri === 0 ? 'th' : 'td', { html: inline(c.trim(), o.q) || '&nbsp;' }))));
            });
            wrap.appendChild(h('div.nt-tablewrap', { data: { li } }, tbl));
            continue;
          }
          let el;
          let m;
          if ((m = raw.match(/^\[photo: ([^\]]+)\]$/))) {
            const art = m[1].trim();
            const a = JC.art.meta(art);
            el = h('div.nt-att', { data: { li } }, JC.art.el(art, { cls: 'nt-att-art' }));
            el.firstChild.style.aspectRatio = (a.w || 4) + ' / ' + (a.h || 3);
            ui.contextMenu(el, () => ({ items: [
              { text: 'Save to Photos', icon: 'square.and.arrow.down', onTap: () => { if (JC.photoKit) JC.photoKit.add({ art, t: JC.time.now(), kind: 'photo', src: 'msg', caption: '' }); ui.toast('Saved to Photos', { icon: 'photo' }); } },
              { text: 'Share', icon: 'square.and.arrow.up', onTap: () => ui.share({ title: a.title || 'Photo', subtitle: 'From Notes', art, payload: { kind: 'photo', art } }) },
              { text: 'Remove', icon: 'trash', destructive: true, onTap: () => { const L2 = fullText(JC.store.get('notes', n.id)).split('\n'); L2.splice(li, 1); const sp = splitText(L2.join('\n')); JC.store.update('notes', n.id, { title: sp.title, body: sp.body }); } },
            ] }));
            ui.onTap(el, () => { if (JC.photoKit) { const p = JC.photoKit.library().find((x) => x.art === art); if (p) { JC.os.open('photos', { id: p.id }); return; } } ui.toast(a.title || 'Attachment'); });
          } else if ((m = raw.match(/^\[sketch: ([^\]]+)\]$/))) {
            const src = (n.sketches || {})[m[1].trim()];
            el = h('div.nt-att.sketch', { data: { li } }, src ? h('img.nt-sketch-img', { src, alt: 'Sketch' }) : h('div.nt-missing', 'Sketch unavailable'));
          } else if ((m = raw.match(/^- \[([ x])\] (.*)$/))) {
            const on = m[1] === 'x';
            el = h('div.nt-l.nt-check', { class: { done: on }, data: { li } },
              h('div.nt-circ', { class: { on }, onTap: (e) => { e.stopPropagation(); if (!o.readonly && o.onToggle) o.onToggle(li); } }, on ? JC.icon('checkmark', { size: 13, weight: 3 }) : null),
              h('div.nt-ctext', { html: inline(m[2], o.q) }));
          } else if ((m = raw.match(/^### (.*)$/))) el = h('div.nt-l.nt-h3', { html: inline(m[1], o.q), data: { li } });
          else if ((m = raw.match(/^## (.*)$/))) el = h('div.nt-l.nt-h2', { html: inline(m[1], o.q), data: { li } });
          else if ((m = raw.match(/^# (.*)$/))) el = h('div.nt-l.nt-h1', { html: inline(m[1], o.q), data: { li } });
          else if ((m = raw.match(/^> (.*)$/))) el = h('div.nt-l.nt-quote', { html: inline(m[1], o.q), data: { li } });
          else if ((m = raw.match(/^`(.*)`$/))) el = h('div.nt-l.nt-mono', { html: inline(m[1], o.q), data: { li } });
          else if ((m = raw.match(/^( *)([-•–]) (.*)$/))) el = h('div.nt-l.nt-li', { style: { paddingLeft: 22 + m[1].length * 6 + 'px' }, data: { li } }, h('span.nt-bullet', m[2] === '–' ? '–' : '•'), h('span', { html: inline(m[3], o.q) }));
          else if ((m = raw.match(/^(\d+)\. (.*)$/))) { num = parseInt(m[1], 10) === 1 && !/^\d+\. /.test(lines[i - 1] || '') ? 1 : num + 1; el = h('div.nt-l.nt-li', { data: { li } }, h('span.nt-bullet.num', num + '.'), h('span', { html: inline(m[2], o.q) })); }
          else if (!raw.trim()) el = h('div.nt-l.nt-blank', { data: { li } }, ' ');
          else el = h('div.nt-l', { html: inline(raw.replace(/^ {4}/, ' '), o.q), data: { li } });
          wrap.appendChild(el);
          i++;
        }
        if (o.q) {
          const marks = wrap.querySelectorAll('.nt-mark');
          marks.forEach((mk, k) => mk.classList.toggle('cur', k === o.idx));
        }
        if (!o.readonly) {
          wrap.addEventListener('click', (e) => {
            if (U._suppress && performance.now() - U._suppress < 80) return;
            if (e.target.closest('.nt-circ, .nt-att')) return;
            const line = e.target.closest('[data-li]');
            if (o.onTapLine) o.onTapLine(line ? parseInt(line.dataset.li, 10) : lines.length - 1);
          });
          wrap.__tap = true;
          wrap.classList.add('tap');
        }
        void mi;
        return wrap;
      }

      // ═══ INTENTS ════════════════════════════════════════════════════════
      function handle(it) {
        if (!it) return;
        const nid = it.id || it.note;
        if (nid) {
          while (nav.depth() > 1) nav.pop({ instant: true });
          const n = JC.store.get('notes', nid);
          if (!n) { ui.toast('Note not found'); return; }
          nav.push(listPage(n.deleted ? 'deleted' : (n.folder || 'notes')), { instant: true });
          openNote(nid);
          return;
        }
        if (it.compose) {
          while (nav.depth() > 1) nav.pop({ instant: true });
          nav.push(listPage('notes'), { instant: true });
          const title = it.title || (typeof it.compose === 'object' && it.compose.title) || '';
          const body = (typeof it.compose === 'object' && it.compose.body) || '';
          compose('notes', { title, body: title ? (body ? body : '') : body });
          return;
        }
        if (it.folder) {
          while (nav.depth() > 1) nav.pop({ instant: true });
          nav.push(listPage(it.folder), { instant: true });
        }
      }
      if (intent0) setTimeout(() => handle(intent0), 0);

      return {
        intent: handle,
        show() { rerender(); },
        hide() {
          // relock unlocked notes when leaving the app (like iOS)
          const had = Object.keys(st.unlocked).length;
          st.unlocked = {};
          if (had && editor) { const x = JC.store.get('notes', editor.id); if (x && x.locked) editor.page.render(); }
        },
        back() {
          if (editor && editor.back()) return true;
          const t = nav.top();
          if (t && t.cancelSelect && t.cancelSelect()) return true;
          return false;
        },
        destroy() { off1(); off2(); },
      };
    },
  });
})();
