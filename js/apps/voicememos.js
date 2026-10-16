/* Voice Memos — iOS 18 Voice Memos: folders (All Recordings / Favorites / Recently Deleted), expanding rows with
   waveform, scrubber, ±15 s, synthesized playback with a progressive transcript, more menu (rename, trim, share,
   duplicate, favorite, delete) and a live recorder with a Dynamic Island activity.
   "Untitled 14" (memo14) is Jiang Cheng's never-sent thank-you. Facts: docs/STORY.md. Acts: memo_play, memo_delete. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;

  const MEMO14 = "Wei Wuxian. …I know. About the— I know what you did. Wen Ning told me. Tonight. Why didn't you— Tch. You idiot. You absolute… (long pause) Thank you. That's all. Thank you. Don't make it a thing. …Delete this. I'm not sending this.";
  const JIUJIU = [
    { who: 'me', text: 'A-Ling. Look here. Look at jiujiu. Say it. Jiu-jiu.' },
    { who: 'baby', text: 'ba!' },
    { who: 'me', text: 'Not ba. Jiu-jiu.' },
    { who: 'baby', text: '…jiu?' },
    { who: 'me', text: 'Jiujiu.' },
    { who: 'baby', text: 'JIUJIU! jiujiu!' },
    { who: 'me', text: '(laughs) …A-Jie. He said it. You were right. He said it.' },
  ];

  JC.store.seed('memos', [
    { id: 'memo_speech', title: 'Gala — toast (do not give)', t: '-1 23:10', dur: 48, place: 'Golden Peony Hotel', fav: false,
      text: "Thank you for coming. The Jin Group— (sigh) A-Ling is turning eighteen. He's… he's better than all of us. He took a stupid dog and a stupid uncle and a stupid name and he— (pause) That's the speech. …Too short. Fine. I'm not giving it." },
    { id: 'memo_hanshi', title: 'Hanshi — directions', t: '-2 22:58', dur: 41, place: 'Lotus Pier Residence', fav: false,
      text: "Gusu. Two hours by train. Cloud Recesses, east gate. Past the wall of rules, left at the bamboo. The tea house with the white peony bush. …Three o'clock. (pause) Not going. Just in case." },
    { id: 'memo_board', title: 'Board talking points', t: '-4 05:40', dur: 134, place: 'Lotus Pier Residence', fav: false,
      text: "Q4. One: shipping volume up eleven percent — don't let them talk over that. Two: the Lanling cold chain. Jin Group signs Monday or we walk. Three: slide seven. Slide seven is wrong. …Tang Mei says it's fine. It's not fine. Four: soup week. Why is soup week on the board agenda. (pause) Keep soup week. Morale. Five: Dog Friday. …No. (pause) Maybe. Don't write that down." },
    { id: 'memo_sandu', title: 'Sandu — rattle, left rear', t: '-12 08:15', dur: 22, place: 'Lotus Pier Residence', fav: false,
      text: "(engine) Hear that? That rattle. Left rear. Tell the mechanic it's the left rear, not the right. …I'm talking to my phone. Fine." },
    { id: 'memo14', title: 'Untitled 14', t: '2024-06-21 23:48', dur: 72, place: 'Guanyin Temple Rd', fav: false, text: MEMO14, ambient: 'wind' },
    { id: 'memo13', title: 'Untitled 13', t: '2024-06-21 23:41', dur: 6, place: 'Guanyin Temple Rd', fav: false, text: 'Wei Wu— …No.', ambient: 'wind' },
    { id: 'memo_rain', title: 'Lotus Pier — rain on the lake', t: '2023-07-09 05:12', dur: 185, place: 'Lotus Pier', fav: false, text: '', ambient: 'rain' },
    { id: 'memo_jiujiu', title: "A-Ling — 'jiujiu' (2010)", t: '2010-03-14 18:20', dur: 38, place: 'Lotus Pier', fav: true,
      text: JIUJIU.map((p) => p.text).join(' '), parts: JIUJIU },
  ]);

  JC.icon.add({
    'waveform.badge.mic': '<path d="M3 11v2M6 8v8M9 5v14M12 9v6"/><rect x="15.5" y="4" width="4.5" height="8.5" rx="2.25"/><path d="M14 10.5a3.8 3.8 0 0 0 7.5 0M17.75 14.3v2.2"/>',
    'plus.square.on.square': '<rect x="8" y="8" width="12.5" height="12.5" rx="2.6"/><path d="M5.5 15.5h-.3A1.7 1.7 0 0 1 3.5 13.8V5.2c0-.9.8-1.7 1.7-1.7h8.6c.9 0 1.7.8 1.7 1.7v.3M14.25 11.5v5.5M11.5 14.25H17"/>',
    'folder.badge.plus': '<path d="M3 7.5V17a2.5 2.5 0 0 0 2.5 2.5h13A2.5 2.5 0 0 0 21 17V9.5A2.5 2.5 0 0 0 18.5 7h-7L9.5 4.5h-4A2.5 2.5 0 0 0 3 7z"/><path d="M12 10.5v6M9 13.5h6"/>',
    'pause.circle.fill': '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M10 8.5v7M14 8.5v7" stroke-width="2.2" style="stroke:var(--knock,#fff)"/>',
  });

  const all = () => JC.store.all('memos');
  const live = () => all().filter((m) => !m.deleted).sort((a, b) => b.t - a.t);
  const deleted = () => all().filter((m) => m.deleted).sort((a, b) => (b.delAt || 0) - (a.delAt || 0));
  const srcOf = (m) => m.src || m.id;
  function partsOf(m) { return m.parts && m.parts.length ? m.parts : [{ who: 'me', text: m.text || '' }]; }
  function stamp(t) {
    const d = new Date(t), n = JC.time.date();
    const dd = U.dayDiff(d, n);
    if (dd <= 0) return U.fmtTime(d);
    if (dd === 1) return 'Yesterday';
    if (dd < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(d, 'medium');
  }
  function fmtLong(sec) { return U.fmtDur(sec); }
  function nextName() {
    const n = all().filter((m) => /^New Recording( \d+)?$/.test(m.title || '')).length;
    return 'New Recording ' + (n + 1);
  }

  // ══ Recording (lives outside the app window so it survives backgrounding) ══
  const rec = { on: false, paused: false, t0: 0, acc: 0, timer: null, bars: [], listeners: new Set() };
  function recElapsed() { return rec.acc + (rec.on && !rec.paused ? (performance.now() - rec.t0) / 1000 : 0); }
  function recStart() {
    if (JC.story.call() && JC.story.call().phase !== 'ended') { JC.ui.toast('Can’t record during a call', { icon: 'phone.fill' }); return false; }
    rec.on = true; rec.paused = false; rec.acc = 0; rec.t0 = performance.now(); rec.bars = []; rec.name = nextName();
    JC.audio.haptic(12);
    clearInterval(rec.timer);
    rec.timer = setInterval(() => {
      if (!rec.paused) {
        const k = rec.bars.length;
        const burst = Math.sin(k / 7) > 0.65 ? 0.4 + Math.random() * 0.5 : 0;
        rec.bars.push(U.clamp(0.06 + Math.random() * 0.16 + burst * Math.random(), 0.04, 1));
      }
      rec.listeners.forEach((fn) => fn());
    }, 70);
    JC.os.island.start('voicememo', {
      priority: 8, width: 200,
      compact: () => ({ left: h('span.vmo-isl', JC.icon('waveform', { size: 16 })), right: h('span.vmo-isl.t', fmtLong(recElapsed())) }),
      expanded: (ex) => {
        const t = h('div.vmo-iex-t', fmtLong(recElapsed()));
        const iv = setInterval(() => { if (!t.isConnected) { clearInterval(iv); return; } t.textContent = fmtLong(recElapsed()); }, 250);
        ex.append(h('div.vmo-iex',
          h('div.vmo-iex-main', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); JC.os.open('voicememos'); } }, h('div.vmo-iex-dot'), h('div', h('div.vmo-iex-n', rec.name), t)),
          h('div.vmo-iex-btns',
            h('div.vmo-iex-b', { onTap: (e) => { e.stopPropagation(); recPause(); JC.os.island.collapse(); } }, JC.icon(rec.paused ? 'record.circle' : 'pause.fill', { size: 20 })),
            h('div.vmo-iex-b.red', { onTap: (e) => { e.stopPropagation(); JC.os.island.collapse(); recStop(true); } }, JC.icon('stop.fill', { size: 18 })))));
      },
      onTap: () => JC.os.open('voicememos'),
    });
    return true;
  }
  function recPause() {
    if (!rec.on) return;
    if (rec.paused) { rec.paused = false; rec.t0 = performance.now(); }
    else { rec.acc = recElapsed(); rec.paused = true; }
    rec.listeners.forEach((fn) => fn());
  }
  function recStop(save) {
    if (!rec.on) return null;
    const dur = Math.max(1, Math.round(recElapsed()));
    rec.on = false;
    clearInterval(rec.timer);
    JC.os.island.stop('voicememo');
    rec.listeners.forEach((fn) => fn());
    if (!save) return null;
    const m = JC.store.add('memos', { title: rec.name, t: JC.time.now(), dur, place: 'Jinxing Rd', fav: false, text: '', ambient: 'room', mine: true }, { front: true });
    JC.ui.toast('Saved “' + m.title + '”', { icon: 'waveform' });
    return m;
  }
  JC.bus.on('story:reset', () => { if (rec.on) recStop(false); });

  /** scroll the expanded row into view inside the page only (scrollIntoView would also scroll the stage) */
  function reveal(page, center) {
    const row = page && page.content.querySelector('.vmo-row.open');
    if (!row) return;
    const sc = page.scroll;
    const k = JC.os.scale || 1;
    const top = (row.getBoundingClientRect().top - sc.getBoundingClientRect().top) / k + sc.scrollTop;
    const bottom = top + row.offsetHeight;
    const viewTop = sc.scrollTop + 110, viewBottom = sc.scrollTop + sc.clientHeight - 190;
    let to = null;
    if (center) to = top - (sc.clientHeight - row.offsetHeight) / 2;
    else if (bottom > viewBottom) to = sc.scrollTop + (bottom - viewBottom);
    else if (top < viewTop) to = top - 110;
    if (to != null) sc.scrollTo({ top: Math.max(0, to), behavior: center ? 'auto' : 'smooth' });
  }

  // ══ App ══════════════════════════════════════════════════════════
  JC.app({
    id: 'voicememos',
    name: 'Voice Memos',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-voicememos');
      const offs = [];
      let open = null; // expanded memo id
      let player = null;
      let showText = true;
      let nav;
      function stop() { if (player) { player.destroy(); player = null; } }

      // ── folders ──
      const foldersPage = JC.ui.page({
        title: 'Voice Memos', large: true, bg: 'grouped', cls: 'vmo-folders',
        right: [JC.ui.navBtn({ text: 'Edit', onTap: () => JC.ui.toast('Nothing to rearrange yet', { icon: 'folder' }) })],
        content: () => {
          const folders = JC.store.all('memofolders');
          return [
            JC.ui.list([{ rows: [
              { icon: { node: h('div.vmo-fic', JC.icon('waveform', { size: 22 })) }, title: 'All Recordings', detail: String(live().length), chevron: true, onTap: () => nav.push(listPage('all')) },
              { icon: { node: h('div.vmo-fic', JC.icon('heart', { size: 22 })) }, title: 'Favorites', detail: String(live().filter((m) => m.fav).length), chevron: true, onTap: () => nav.push(listPage('fav')) },
              { icon: { node: h('div.vmo-fic', JC.icon('trash', { size: 22 })) }, title: 'Recently Deleted', detail: String(deleted().length), chevron: true, onTap: () => nav.push(listPage('deleted')) },
            ] }]),
            folders.length ? JC.ui.list([{ header: 'My Folders', rows: folders.map((f) => ({ icon: { node: h('div.vmo-fic', JC.icon('folder', { size: 22 })) }, title: f.title, detail: String(live().filter((m) => m.folder === f.id).length), chevron: true, onTap: () => nav.push(listPage(f.id)), swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => JC.store.remove('memofolders', f.id) }] })) }]) : null,
          ];
        },
        toolbar: [JC.ui.spacer(), JC.ui.navBtn({ icon: 'folder.badge.plus', label: 'New Folder', onTap: () => newFolder() })],
      });
      function newFolder(cb) {
        JC.ui.alert({ title: 'New Folder', input: { placeholder: 'Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index !== 1 || !r.value || !r.value.trim()) return;
          const f = JC.store.add('memofolders', { id: U.uid('mf'), title: r.value.trim() });
          if (cb) cb(f);
        });
      }

      // ── list ──
      function listPage(kind) {
        let q = '';
        let editing = false;
        const sel = new Set();
        const folder = JC.store.all('memofolders').find((f) => f.id === kind);
        const title = kind === 'all' ? 'All Recordings' : kind === 'fav' ? 'Favorites' : kind === 'deleted' ? 'Recently Deleted' : (folder ? folder.title : 'Folder');
        const editBtn = JC.ui.navBtn({ text: 'Edit', onTap: () => setEdit(!editing) });
        const page = JC.ui.page({
          title, large: true, bg: 'plain', cls: 'vmo-list' + (kind === 'deleted' ? ' vmo-deleted' : ''),
          right: kind === 'deleted' ? [] : [editBtn],
          search: kind === 'deleted' ? null : { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          content: (pg) => content(pg),
          onHide: () => stop(),
          footer: kind === 'deleted' ? null : dock((mm) => { open = mm.id; stop(); page.render(); page.scrollTop(true); }),
        });
        function setEdit(on) {
          editing = on;
          sel.clear();
          editBtn.querySelector('span').textContent = on ? 'Done' : 'Edit';
          editBtn.classList.toggle('prominent', on);
          stop();
          open = null;
          page.render();
          paintTools();
        }
        function items() {
          if (kind === 'deleted') return deleted();
          let L = live();
          if (kind === 'fav') L = L.filter((m) => m.fav);
          else if (kind !== 'all') L = L.filter((m) => m.folder === kind);
          if (q) L = L.filter((m) => ((m.title || '') + ' ' + (m.text || '') + ' ' + (m.place || '')).toLowerCase().includes(q.toLowerCase()));
          return L;
        }
        function content(pg) {
          pg = pg || page;
          const L = items();
          if (!L.length) return [JC.ui.empty({ icon: kind === 'deleted' ? 'trash' : 'waveform', title: q ? 'No Results' : kind === 'deleted' ? 'No Recently Deleted' : kind === 'fav' ? 'No Favorites' : 'No Recordings', text: kind === 'deleted' ? 'Recordings you delete stay here for 30 days.' : kind === 'all' && !q ? 'Tap the Record button to start a Voice Memo.' : null })];
          const box = h('div.vmo-rows', { class: { editing } });
          L.forEach((m) => box.appendChild(memoRow(m, pg, kind, editing, sel)));
          return [box, kind === 'deleted' ? h('div.vmo-delfoot', 'Recordings are permanently deleted after 30 days.') : null];
        }
        function paintTools() {
          if (kind === 'deleted') {
            page.setToolbar([
              h('div.vmo-tbtext', { onTap: () => { const ids = new Set(deleted().map((m) => m.id)); if (!ids.size) return; JC.store.set('memos', all().map((m) => (ids.has(m.id) ? Object.assign({}, m, { deleted: false }) : m))); JC.ui.toast('Recovered', { icon: 'arrow.uturn.left' }); } }, 'Recover All'),
              JC.ui.spacer(),
              h('div.vmo-tbtext.red', { onTap: () => { if (!deleted().length) { JC.ui.toast('Recently Deleted is empty', { icon: 'trash' }); return; } JC.ui.alert({ title: 'Delete All?', message: 'These recordings will be deleted. You can’t undo this action.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete All', style: 'destructive', onTap: () => JC.store.set('memos', all().filter((m) => !m.deleted)) }] }); } }, 'Delete All'),
            ]);
            return;
          }
          if (!editing) { page.setToolbar([]); page.el.classList.remove('has-toolbar'); return; }
          page.el.classList.add('has-toolbar');
          page.setToolbar([
            h('div.vmo-tbtext', { class: { off: !sel.size }, onTap: () => { if (!sel.size) return; const ids = new Set(sel); JC.store.set('memos', all().map((m) => (ids.has(m.id) ? Object.assign({}, m, { fav: true }) : m))); setEdit(false); } }, 'Favorite'),
            JC.ui.spacer(),
            h('div.vmo-tbtext', { class: { off: !sel.size }, onTap: () => { if (!sel.size) return; moveTo(Array.from(sel), () => setEdit(false)); } }, 'Move'),
            JC.ui.spacer(),
            h('div.vmo-tbtext.red', { class: { off: !sel.size }, onTap: () => { if (!sel.size) return; const ids = Array.from(sel); ids.forEach((id) => del(JC.store.get('memos', id), true)); setEdit(false); JC.ui.toast(ids.length + ' moved to Recently Deleted', { icon: 'trash' }); } }, 'Delete'),
          ]);
        }
        page.selChanged = paintTools;
        paintTools();
        offs.push(JC.store.on('memos', () => {
          if (!page.el.isConnected) return;
          if (player && player.playing) return;
          stop();
          page.render();
          paintTools();
        }));
        return page;
      }

      // ── one row ──
      function memoRow(m, page, kind, editing, sel) {
        const isOpen = open === m.id && !editing;
        const row = h('div.vmo-row', { class: { open: isOpen, checked: sel.has(m.id) }, data: { id: m.id } });
        const head = h('div.vmo-head',
          editing ? h('div.vmo-check', { class: { on: sel.has(m.id) } }, sel.has(m.id) ? JC.icon('checkmark', { size: 14, weight: 3 }) : null) : null,
          h('div.vmo-hmain',
            h('div.vmo-title', m.fav ? h('span.vmo-favic', JC.icon('heart.fill', { size: 12 })) : null, m.title || 'New Recording'),
            h('div.vmo-sub', h('span', isOpen ? (m.place || '') : stamp(m.t)), h('span.vmo-dur', isOpen ? stamp(m.t) : (kind === 'deleted' ? daysLeft(m) : fmtLong(m.dur))))),
          isOpen ? h('div.vmo-more', { onTap: (e) => { e.stopPropagation(); more(m, e.currentTarget, page); } }, JC.icon('ellipsis.circle', { size: 24 })) : null);
        JC.ui.onTap(head, () => {
          if (editing) { if (sel.has(m.id)) sel.delete(m.id); else sel.add(m.id); page.render(); page.selChanged && page.selChanged(); return; }
          if (kind === 'deleted') { deletedActions(m); return; }
          stop();
          open = open === m.id ? null : m.id;
          page.render();
          if (open) setTimeout(() => reveal(page, false), 60);
        });
        if (!editing && kind !== 'deleted') {
          JC.ui.contextMenu(head, () => ({ items: [
            { text: 'Play', icon: 'play.fill', onTap: () => { open = m.id; page.render(); setTimeout(() => { const b = page.content.querySelector('.vmo-row.open .vmo-play'); if (b) b.click(); }, 50); } },
            { text: 'Share', icon: 'square.and.arrow.up', onTap: () => share(m) },
            { text: m.fav ? 'Unfavorite' : 'Favorite', icon: m.fav ? 'heart.fill' : 'heart', onTap: () => JC.store.update('memos', m.id, { fav: !m.fav }) },
            { text: 'Rename', icon: 'pencil', onTap: () => rename(m) },
            '-',
            { text: 'Delete', icon: 'trash', destructive: true, onTap: () => del(m) },
          ] }));
        }
        row.appendChild(head);
        if (isOpen) row.appendChild(panel(m));
        return row;
      }
      function daysLeft(m) {
        const d = 30 - Math.floor((JC.time.now() - (m.delAt || JC.time.now())) / 86400e3);
        return Math.max(1, d) + ' days';
      }
      function deletedActions(m) {
        JC.ui.actionSheet({ title: m.title, actions: [
          { text: 'Recover', onTap: () => { JC.store.update('memos', m.id, { deleted: false }); JC.ui.toast('Recovered “' + m.title + '”', { icon: 'arrow.uturn.left' }); } },
          { text: 'Delete Forever', style: 'destructive', onTap: () => JC.store.remove('memos', m.id) },
        ] });
      }

      // ── expanded panel: waveform, scrubber, transport, transcript ──
      function panel(m) {
        const trim = m.trim || null;
        const offset = trim ? trim.start : 0;
        const full = m.fullDur || m.dur;
        const N = 72;
        const barsAll = JC.voiceBed.bars({ parts: partsOf(m), dur: full, seed: srcOf(m), ambient: m.ambient }, Math.round((N * full) / m.dur));
        const i0 = Math.round((offset / full) * barsAll.length);
        const bars = barsAll.slice(i0, i0 + N);
        const svg = (cls) => {
          const w = N * 5;
          return `<svg class="${cls}" viewBox="0 0 ${w} 48" preserveAspectRatio="none">` + bars.map((b, i) => { const hh = Math.max(2, b * 44); return `<rect x="${i * 5 + 0.8}" y="${24 - hh / 2}" width="3" height="${hh}" rx="1.5"/>`; }).join('') + '</svg>';
        };
        const wf = h('div.vmo-wf', { html: svg('base') + svg('played') }, h('div.vmo-head-line'));
        const t0 = h('span', '0:00'), t1 = h('span', '-' + fmtLong(m.dur));
        const playBtn = h('div.vmo-play', { onTap: () => toggle() }, JC.icon('play.fill', { size: 30 }));
        const words = h('div.vmo-text');
        let tl = null;
        function ensure() {
          if (player && player.memoId === m.id) return player;
          stop();
          player = JC.voiceBed.player({
            parts: partsOf(m), dur: m.dur, fullDur: full, offset, seed: srcOf(m), ambient: m.ambient, ambientLevel: 0.6, gain: 0.9,
            onTick: (t) => paint(t),
            onEnd: () => { setIcon(); paint(m.dur); },
          });
          player.memoId = m.id;
          return player;
        }
        function toggle() {
          const p = ensure();
          if (p.playing) p.pause();
          else { p.play(); JC.story.act('memo_play', { id: srcOf(m) }); }
          setIcon();
        }
        function setIcon() { playBtn.innerHTML = ''; playBtn.appendChild(JC.icon(player && player.playing ? 'pause.fill' : 'play.fill', { size: 30 })); }
        function paint(t) {
          const f = U.clamp(t / m.dur, 0, 1);
          const pl = wf.querySelector('svg.played');
          if (pl) pl.style.clipPath = `inset(0 ${100 - f * 100}% 0 0)`;
          wf.querySelector('.vmo-head-line').style.left = f * 100 + '%';
          t0.textContent = fmtLong(t);
          t1.textContent = '-' + fmtLong(Math.max(0, m.dur - t));
          if (player && tl) {
            const wi = player.wordAt(t);
            words.querySelectorAll('span.w').forEach((s) => { const i = +s.dataset.wi; s.classList.toggle('on', i <= wi); s.classList.toggle('cur', i === wi && s.classList.contains('word')); });
          }
        }
        // transcript
        if ((m.text || '').trim()) {
          tl = JC.voiceBed.timeline(partsOf(m), full, srcOf(m));
          const lo = offset, hi = offset + m.dur;
          let lastPart = 0;
          tl.segs.forEach((sg) => {
            if (sg.br) { words.appendChild(h('br')); lastPart = sg.part; return; }
            const ix = sg.wi != null ? sg.wi : sg.pw >= 0 ? sg.pw : null;
            const w = ix != null ? tl.words[ix] : null;
            const outside = w && (w.t1 < lo || w.t0 > hi);
            words.appendChild(h('span', { class: { w: ix != null, word: sg.wi != null, ev: !!sg.ev, cut: !!outside }, data: ix != null ? { wi: ix } : undefined }, sg.s));
          });
          void lastPart;
        }
        // seek by dragging on the waveform
        U.drag(wf, { axis: 'x', threshold: 1,
          start: () => { if (player && player.playing) { player._resume = true; player.pause(); } },
          move: (e, p) => seekAt(e.clientX),
          end: () => { if (player && player._resume) { player._resume = false; player.play(); setIcon(); } } });
        JC.ui.onTap(wf, (e) => seekAt(e.clientX));
        function seekAt(clientX) {
          const r = wf.getBoundingClientRect();
          const f = U.clamp((clientX - r.left) / r.width, 0, 1);
          ensure().seek(f * m.dur);
          paint(f * m.dur);
        }
        const skip = (d) => { const p = ensure(); p.seek(U.clamp(p.pos() + d, 0, m.dur)); paint(p.pos()); };
        const el = h('div.vmo-panel',
          wf,
          h('div.vmo-times', t0, t1),
          h('div.vmo-ctrls',
            h('div.vmo-cbtn', { class: { on: showText && !!tl }, onTap: () => { if (!tl) { JC.ui.toast('No speech detected', { icon: 'quote.bubble' }); return; } showText = !showText; words.hidden = !showText; el.querySelector('.vmo-cbtn').classList.toggle('on', showText); } }, JC.icon('quote.bubble', { size: 22 })),
            h('div.vmo-cbtn', { onTap: () => skip(-15) }, JC.icon('gobackward.15', { size: 26 })),
            playBtn,
            h('div.vmo-cbtn', { onTap: () => skip(15) }, JC.icon('goforward.15', { size: 26 })),
            h('div.vmo-cbtn.blue', { onTap: () => del(m) }, JC.icon('trash', { size: 22 }))),
          words);
        words.hidden = !showText || !tl;
        return el;
      }

      // ── actions ──
      function more(m, anchor, page) {
        JC.ui.menu(anchor, [
          { text: 'Rename', icon: 'pencil', onTap: () => rename(m) },
          { text: 'Edit Recording', icon: 'waveform', onTap: () => trimSheet(m) },
          { text: 'Share', icon: 'square.and.arrow.up', onTap: () => share(m) },
          { text: 'Duplicate', icon: 'plus.square.on.square', onTap: () => duplicate(m) },
          { text: m.fav ? 'Unfavorite' : 'Favorite', icon: m.fav ? 'heart.fill' : 'heart', onTap: () => JC.store.update('memos', m.id, { fav: !m.fav }) },
          { text: 'Copy Transcript', icon: 'doc.on.doc', onTap: () => { if (!(m.text || '').trim()) { JC.ui.toast('No speech detected', { icon: 'quote.bubble' }); return; } U.copy(m.text); JC.ui.toast('Transcript copied', { icon: 'doc.on.doc' }); } },
          { text: 'Move to Folder', icon: 'folder', onTap: () => moveTo([m.id]) },
          '-',
          { text: 'Delete', icon: 'trash', destructive: true, onTap: () => del(m) },
        ]);
        void page;
      }
      function rename(m) {
        JC.ui.alert({ title: 'Rename Recording', input: { value: m.title, placeholder: 'Title' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] })
          .then((r) => { if (r.index === 1 && r.value && r.value.trim()) JC.store.update('memos', m.id, { title: r.value.trim() }); });
      }
      function share(m) {
        JC.ui.share({ title: m.title, subtitle: fmtLong(m.dur) + (m.place ? ' · ' + m.place : ''), icon: 'waveform', payload: { kind: 'memo', id: srcOf(m), memo: srcOf(m) } });
      }
      function duplicate(m) {
        const copy = Object.assign({}, m, { id: U.uid('memo'), title: m.title + ' copy', src: srcOf(m), t: m.t + 1000, fav: false });
        const arr = all().slice();
        const i = arr.findIndex((x) => x.id === m.id);
        arr.splice(i, 0, copy);
        JC.store.set('memos', arr);
        JC.ui.toast('Duplicated', { icon: 'plus.square.on.square' });
      }
      function del(m, quiet) {
        if (!m) return;
        if (player && player.memoId === m.id) stop();
        if (open === m.id) open = null;
        JC.store.update('memos', m.id, { deleted: true, delAt: JC.time.now() });
        JC.story.act('memo_delete', { id: srcOf(m) });
        if (!quiet) JC.ui.toast('Moved to Recently Deleted', { icon: 'trash' });
      }
      function moveTo(ids, done) {
        const folders = JC.store.all('memofolders');
        const s = JC.ui.sheet({
          title: 'Move to Folder', detent: 'medium', cls: 'vmo-sheet', left: { text: 'Cancel' },
          content: () => [JC.ui.list([{ rows: [{ title: 'All Recordings (no folder)', onTap: () => apply(null) }].concat(folders.map((f) => ({ icon: { glyph: 'folder', bg: 'var(--blue)' }, title: f.title, onTap: () => apply(f.id) })), [{ title: 'New Folder…', tinted: true, onTap: () => newFolder((f) => apply(f.id)) }]) }])],
        });
        function apply(fid) {
          const set = new Set(ids);
          JC.store.set('memos', all().map((m) => (set.has(m.id) ? Object.assign({}, m, { folder: fid }) : m)));
          s.close();
          JC.ui.toast(fid ? 'Moved' : 'Removed from folder', { icon: 'folder' });
          if (done) done();
        }
      }
      function trimSheet(m) {
        stop();
        const full = m.fullDur || m.dur;
        const cur = m.trim || { start: 0, end: full };
        let a = cur.start / full, b = cur.end / full;
        const N = 90;
        const bars = JC.voiceBed.bars({ parts: partsOf(m), dur: full, seed: srcOf(m), ambient: m.ambient }, N);
        let prev = null;
        const s = JC.ui.sheet({
          title: 'Edit Recording', detent: 'large', cls: 'vmo-trim', left: { text: 'Cancel' },
          right: { text: 'Save', onTap: () => {
            const st = Math.round(a * full * 10) / 10, en = Math.round(b * full * 10) / 10;
            if (en - st < 1) { JC.ui.toast('Recording too short', { icon: 'scissors' }); return false; }
            JC.store.update('memos', m.id, { fullDur: full, trim: st <= 0.05 && en >= full - 0.05 ? null : { start: st, end: en }, dur: Math.max(1, Math.round(en - st)) });
            JC.ui.toast('Recording trimmed', { icon: 'scissors' });
          } },
          onClose: () => { if (prev) prev.destroy(); },
          content: () => {
            const wf = h('div.vmo-twf', { html: `<svg viewBox="0 0 ${N * 5} 60" preserveAspectRatio="none">` + bars.map((v, i) => { const hh = Math.max(2, v * 54); return `<rect x="${i * 5 + 0.8}" y="${30 - hh / 2}" width="3" height="${hh}" rx="1.5"/>`; }).join('') + '</svg>' });
            const shadeL = h('div.vmo-tshade.l'), shadeR = h('div.vmo-tshade.r');
            const box = h('div.vmo-tbox');
            const hl = h('div.vmo-thandle.l'), hr = h('div.vmo-thandle.r');
            const lab = h('div.vmo-tlabel');
            const area = h('div.vmo-tarea', wf, shadeL, shadeR, box, hl, hr);
            function draw() {
              shadeL.style.width = a * 100 + '%';
              shadeR.style.width = (1 - b) * 100 + '%';
              box.style.left = a * 100 + '%';
              box.style.right = (1 - b) * 100 + '%';
              hl.style.left = a * 100 + '%';
              hr.style.left = b * 100 + '%';
              lab.textContent = fmtLong(a * full) + ' – ' + fmtLong(b * full) + '  ·  ' + fmtLong((b - a) * full);
            }
            const dragH = (el, side) => U.drag(el, { threshold: 1,
              start: () => { el._x = side === 'l' ? a : b; },
              move: (e, p) => {
                const w = area.getBoundingClientRect().width / (JC.os.scale || 1);
                const v = U.clamp(el._x + p.dx / w, 0, 1);
                if (side === 'l') a = Math.min(v, b - 0.03); else b = Math.max(v, a + 0.03);
                draw();
              } });
            dragH(hl, 'l');
            dragH(hr, 'r');
            draw();
            return [
              h('div.vmo-ttitle', m.title),
              h('div.vmo-tsub', 'Drag the yellow handles to choose what to keep.'),
              area,
              lab,
              h('div.vmo-tbtns',
                h('div.vmo-tbtn', { onTap: () => { if (prev) prev.destroy(); prev = JC.voiceBed.player({ parts: partsOf(m), dur: (b - a) * full, fullDur: full, offset: a * full, seed: srcOf(m), ambient: m.ambient }); prev.play(0); } }, JC.icon('play.fill', { size: 18 }), h('span', 'Preview')),
                h('div.vmo-tbtn', { onTap: () => { a = 0; b = 1; s.render(); } }, JC.icon('arrow.uturn.left', { size: 18 }), h('span', 'Revert'))),
            ];
          },
        });
      }

      // ── record dock ──
      function dock(onSaved) {
        const el = h('div.vmo-dock');
        const draw = () => {
          el.innerHTML = '';
          el.classList.toggle('recording', rec.on);
          if (!rec.on) {
            el.append(h('div.vmo-recbtn', { onTap: () => { if (recStart()) { stop(); draw(); } }, attrs: { 'aria-label': 'Record' } }, h('div.vmo-recdot')));
            return;
          }
          const bars = h('div.vmo-live');
          const time = h('div.vmo-rtime', fmtTimer(recElapsed()));
          el.append(
            h('div.vmo-rname', rec.name),
            time,
            bars,
            h('div.vmo-rctrls',
              h('div.vmo-rside', { onTap: () => { recPause(); draw(); } }, rec.paused ? 'Resume' : 'Pause'),
              h('div.vmo-stopbtn', { onTap: () => { const mm = recStop(true); draw(); if (mm && onSaved) onSaved(mm); }, attrs: { 'aria-label': 'Stop' } }, h('div.vmo-stopsq')),
              h('div.vmo-rside', { onTap: () => { const mm = recStop(true); draw(); if (mm && onSaved) onSaved(mm); } }, 'Done')));
          const paintLive = () => {
            if (!bars.isConnected) { rec.listeners.delete(paintLive); return; }
            time.textContent = fmtTimer(recElapsed());
            const last = rec.bars.slice(-60);
            bars.innerHTML = last.map((v) => `<i style="height:${Math.max(3, v * 56)}px"></i>`).join('');
            time.classList.toggle('paused', rec.paused);
          };
          paintLive();
          rec.listeners.add(paintLive);
        };
        const sync = () => {
          if (!el.isConnected) { if (el.__seen) rec.listeners.delete(sync); return; }
          el.__seen = true;
          if (rec.on !== el.classList.contains('recording')) draw();
        };
        rec.listeners.add(sync);
        draw();
        return el;
      }
      function fmtTimer(s) {
        const m = Math.floor(s / 60), sec = Math.floor(s % 60), cs = Math.floor((s * 100) % 100);
        return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + '.' + String(cs).padStart(2, '0');
      }

      // ── boot ──
      nav = JC.ui.nav(win.body, foldersPage);
      let allPage = listPage('all');
      nav.push(allPage, { instant: true });
      offs.push(JC.store.on('memos', () => foldersPage.render()), JC.store.on('memofolders', () => foldersPage.render()));
      return {
        intent(i) {
          if (!i) return;
          const id = i.id || i.memo;
          if (id && JC.store.get('memos', id)) {
            while (nav.depth() > 1) nav.pop({ instant: true });
            open = id;
            const m = JC.store.get('memos', id);
            allPage = listPage(m.deleted ? 'deleted' : 'all');
            nav.push(allPage, { instant: true });
            setTimeout(() => reveal(allPage, true), 80);
          }
          if (i.record && !rec.on) { recStart(); allPage.render(); }
        },
        hide() { stop(); },
        destroy() { stop(); offs.forEach((o) => o()); },
      };
    },
  });
})();
