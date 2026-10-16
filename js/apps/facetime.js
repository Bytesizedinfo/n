/* FaceTime — iOS 26 landing page: Create Link / New FaceTime, upcoming links, recent calls as contact-poster tiles.
   Recents come from the shared `calls` collection (video or FaceTime Audio). Calls go through JC.callui. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const K = () => JC.ckit;

  JC.icon.add({ 'video.badge.plus': '<rect x="2.5" y="6.5" width="13" height="11" rx="2.6"/><path d="M15.5 10.5 21 7.5v9l-5.5-3"/><path d="M9 9.5v5M6.5 12h5"/>' });

  function ftCalls() {
    return JC.store.all('calls').filter((r) => r.video || r.ft).slice().sort((a, b) => b.t - a.t);
  }
  function stamp(t) {
    const d = new Date(t), n = JC.time.date();
    const dd = U.dayDiff(d, n);
    if (dd <= 0) return U.fmtTime(d);
    if (dd === 1) return 'Yesterday';
    if (dd < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(d, 'short');
  }
  function linkUrl(id) { return 'https://facetime.apple.com/join#v=1&p=' + id.replace(/[^a-z0-9]/gi, '').slice(-10) + 'jc&k=' + (JC.voiceBed ? JC.voiceBed.hash(id).toString(36) : 'x'); }

  JC.app({
    id: 'facetime',
    name: 'FaceTime',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-facetime');
      let editing = false;
      let nav;
      const editBtn = JC.ui.navBtn({ text: 'Edit', onTap: () => { editing = !editing; editBtn.querySelector('span').textContent = editing ? 'Done' : 'Edit'; editBtn.classList.toggle('prominent', editing); root.render(); } });
      const root = JC.ui.page({
        title: 'FaceTime', large: true, bg: 'plain', cls: 'ft-root',
        right: [editBtn],
        content: () => content(),
      });
      nav = JC.ui.nav(win.body, root);

      function call(r, audio) {
        if (r.contact) K().call(r.contact, audio ? { ft: true } : { video: true });
        else JC.callui.dialNumber(r.num, { video: !audio });
      }
      function remove(r) {
        const key = (r.contact || r.num);
        JC.store.set('calls', JC.store.all('calls').filter((x) => !((x.video || x.ft) && (x.contact || x.num) === key)));
      }
      function info(r) {
        const ids = ftCalls().filter((x) => (x.contact || x.num) === (r.contact || r.num)).map((x) => x.id);
        if (r.contact && JC.contacts.get(r.contact)) nav.push(K().cardPage(r.contact, { calls: ids }));
        else nav.push(K().numberPage(r.num, { calls: ids, name: r.name }));
      }
      function tile(r) {
        const cid = r.contact && JC.contacts.get(r.contact) ? r.contact : null;
        const c = cid ? JC.contacts.get(cid) : null;
        const sp = (c && c.avatar) || { initials: '', grad: ['#9a9aa2', '#6c6c74'] };
        const art = sp.art && JC.art.has(sp.art);
        const g = sp.grad || ['#9a9aa2', '#6c6c74'];
        const missed = r.dir === 'missed';
        const el = h('div.ft-tile', { class: { art, missed }, style: { '--g0': g[0], '--g1': g[1] } },
          art ? JC.art.el(sp.art, { cls: 'ft-tile-art' }) : h('div.ft-tile-mono', sp.emoji ? h('span.ft-emoji', sp.emoji) : (sp.initials || JC.icon('person.fill', { size: 54 }))),
          h('div.ft-tile-shade'),
          h('div.ft-tile-info', { onTap: (e) => { e.stopPropagation(); info(r); }, attrs: { 'aria-label': 'Info' } }, JC.icon('info.circle', { size: 20 })),
          editing ? h('div.ft-tile-del', { onTap: (e) => { e.stopPropagation(); remove(r); } }, JC.icon('minus.circle.fill', { size: 24 })) : null,
          h('div.ft-tile-meta',
            h('div.ft-tile-name', cid ? K().name(cid) : (r.name || JC.callui.fmtNum(r.num))),
            h('div.ft-tile-sub', JC.icon(r.video ? 'video.fill' : 'phone.fill', { size: 11 }), h('span', (missed ? 'Missed · ' : r.dir === 'out' ? '' : '') + (r.video ? 'Video' : 'Audio') + ' · ' + stamp(r.t)))));
        JC.ui.onTap(el, () => { if (!editing) call(r, !r.video); });
        JC.ui.contextMenu(el, () => ({ items: [
          { text: 'FaceTime Video', icon: 'video.fill', onTap: () => call(r, false) },
          { text: 'FaceTime Audio', icon: 'phone.fill', onTap: () => call(r, true) },
          cid ? { text: 'Send Message', icon: 'message.fill', onTap: () => K().message(cid) } : null,
          { text: 'Info', icon: 'info.circle', onTap: () => info(r) },
          '-',
          { text: 'Remove from Recents', icon: 'trash', destructive: true, onTap: () => remove(r) },
        ].filter(Boolean) }));
        return el;
      }
      function linkRow(l) {
        return {
          icon: { glyph: 'link', bg: 'var(--green)' },
          title: 'FaceTime Link',
          subtitle: 'Created ' + stamp(l.t),
          right: h('div.ft-join', { onTap: (e) => { e.stopPropagation(); join(l); } }, 'Join'),
          onTap: () => linkSheet(l),
          swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => JC.store.remove('ftlinks', l.id) }],
        };
      }
      function join(l) {
        JC.ui.alert({ title: 'Waiting for Others', message: 'You’re the only one here. Share the link so people can join.\n' + l.url, buttons: [{ text: 'Leave', style: 'cancel' }, { text: 'Share Link', style: 'default', onTap: () => shareLink(l) }] });
      }
      function linkSheet(l) {
        JC.ui.actionSheet({ title: 'FaceTime Link', message: l.url, actions: [
          { text: 'Share Link', onTap: () => shareLink(l) },
          { text: 'Copy Link', onTap: () => { U.copy(l.url); JC.ui.toast('Link copied', { icon: 'link' }); } },
          { text: 'Join', onTap: () => join(l) },
          { text: 'Delete Link', style: 'destructive', onTap: () => JC.store.remove('ftlinks', l.id) },
        ] });
      }
      function shareLink(l) {
        JC.ui.share({ title: 'FaceTime Link', subtitle: 'facetime.apple.com', icon: 'video.fill', payload: { kind: 'link', url: l.url, text: 'Join my FaceTime: ' + l.url } });
      }
      function createLink() {
        const id = U.uid('ftl');
        const l = JC.store.add('ftlinks', { id, t: JC.time.now(), url: linkUrl(id) }, { front: true });
        shareLink(l);
      }
      function newFaceTime() {
        let q = '';
        const s = JC.ui.sheet({
          title: 'New FaceTime', detent: 'large', cls: 'ft-new', left: { text: 'Cancel' },
          content: () => {
            const field = JC.ui.input({ placeholder: 'Name, email or number', cls: 'ft-to', cap: 'none', onInput: (v) => { q = v; draw(); }, onSubmit: (v) => { if (/\d{5,}/.test(v.replace(/\D/g, ''))) { s.close(); JC.callui.dialNumber(v, { video: true }); } } });
            const list = h('div.ft-newlist');
            function draw() {
              list.innerHTML = '';
              const people = K().sorted(K().people().filter((c) => (c.phones || []).length && K().matches(c, q)));
              const digits = q.replace(/[^\d+]/g, '');
              const rows = [];
              if (digits.length >= 5 && !people.length) rows.push({ icon: { glyph: 'phone.fill', bg: 'var(--green)' }, title: JC.callui.fmtNum(digits), subtitle: 'FaceTime this number', onTap: () => { s.close(); JC.callui.dialNumber(digits, { video: true }); } });
              people.forEach((c) => rows.push({
                avatar: c.id, avatarSize: 40, title: K().name(c.id), subtitle: JC.callui.fmtNum(c.phones[0].num),
                right: h('div.ft-newbtns',
                  h('div.ft-nb', { onTap: (e) => { e.stopPropagation(); s.close(); K().facetime(c.id, true); } }, JC.icon('phone.fill', { size: 17 })),
                  h('div.ft-nb.v', { onTap: (e) => { e.stopPropagation(); s.close(); K().facetime(c.id); } }, JC.icon('video.fill', { size: 18 }))),
                onTap: () => { s.close(); K().facetime(c.id); },
              }));
              if (!rows.length) { list.appendChild(JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results' })); return; }
              list.appendChild(JC.ui.list([{ header: q ? null : 'Suggested', rows }], { style: 'inset' }));
            }
            draw();
            setTimeout(() => field.focus(), 420);
            return [h('div.ft-tobar', h('span.ft-tolabel', 'To:'), field), list];
          },
        });
      }
      function content() {
        const out = [];
        out.push(h('div.ft-actions',
          h('div.ft-act.gray', { onTap: () => createLink() }, JC.icon('link', { size: 19 }), h('span', 'Create Link')),
          h('div.ft-act.green', { onTap: () => newFaceTime() }, JC.icon('video.fill', { size: 19 }), h('span', 'New FaceTime'))));
        const links = JC.store.all('ftlinks');
        if (links.length) out.push(JC.ui.list([{ header: 'Upcoming', rows: links.map(linkRow) }], { style: 'inset', cls: 'ft-links' }));
        const seen = new Set();
        const recents = ftCalls().filter((r) => { const k = (r.contact || r.num) + '|' + (r.video ? 'v' : 'a'); if (seen.has(k)) return false; seen.add(k); return true; });
        if (!recents.length) {
          out.push(JC.ui.empty({ icon: 'video.fill', title: 'No Recent FaceTime Calls', text: 'Start a call with New FaceTime.' }));
          return out;
        }
        const today = recents.filter((r) => U.dayDiff(new Date(r.t), JC.time.date()) <= 6);
        const older = recents.filter((r) => U.dayDiff(new Date(r.t), JC.time.date()) > 6);
        if (today.length) out.push(h('div.ft-h', 'Recents'), h('div.ft-grid', today.map(tile)));
        if (older.length) out.push(h('div.ft-h', 'Earlier'), h('div.ft-grid', older.map(tile)));
        out.push(h('div.ft-foot', 'FaceTime calls use Wi-Fi or cellular data. Your camera turns off when this iPhone isn’t yours.'));
        return out;
      }
      const offs = [JC.store.on('calls', () => root.render()), JC.store.on('ftlinks', () => root.render()), JC.store.on('contactedits', () => root.render())];
      return {
        intent(i) {
          if (!i) return;
          while (nav.depth() > 1) nav.pop({ instant: true });
          if (i.call) setTimeout(() => (JC.contacts.get(i.call) ? K().call(i.call, i.audio ? { ft: true } : { video: true }) : JC.callui.dialNumber(i.call, { video: true })), 300);
          if (i.new || i.compose) newFaceTime();
          if (i.link) createLink();
        },
        destroy() { offs.forEach((o) => o()); },
      };
    },
  });
})();
