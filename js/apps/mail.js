/* Mail — iOS 18/26 Mail: mailboxes, inbox categories, rows with swipe actions, search, select mode,
   message view (details, links, phone numbers, attachments), reply/forward, compose with suggestions,
   drafts. Seed data: js/apps/mail-data.js. Story acts: mail_open, mail_send. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ME = { name: 'Jiang Cheng', addr: 'jiang.cheng@lotuspier.yunmeng' };

  JC.icon.add({
    'megaphone.fill': '<path d="M4 10.2v3.6c0 .6.4 1 1 1h2.2l7.8 4.2c.7.4 1.5-.1 1.5-.9V5.9c0-.8-.8-1.3-1.5-.9L7.2 9.2H5c-.6 0-1 .4-1 1z" fill="currentColor" stroke="none"/><path d="M7.5 15l1.3 4.3c.2.6.7.9 1.3.9h.6c.7 0 1.2-.7 1-1.4l-1-3.8M19 9.5c.9.7 1.4 1.6 1.4 2.5s-.5 1.8-1.4 2.5"/>',
    'xmark.bin': '<path d="M3.5 7.5h17v10a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3z"/><path d="M2.5 4.5h19v3h-19z"/><path d="m9.5 11.5 5 5M14.5 11.5l-5 5"/>',
    'arrowshape.turn.up.left.2': '<path d="M12.5 8.5V5L6.5 10.5l6 5.5v-3.5c3.5 0 6 1.2 8 4.5-.6-4.8-3-8-8-8z"/><path d="M8 5 2 10.5 8 16"/>',
    'tray.and.arrow.down': '<path d="M3.5 13.5h4.6a3.9 3.9 0 0 0 7.8 0h4.6V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18z"/><path d="M12 3.5v8.5M8.5 8.5 12 12l3.5-3.5"/>',
    'line.3.horizontal.decrease.circle': '<circle cx="12" cy="12" r="9"/><path d="M7.5 9h9M9.5 12.5h5M11 16h2"/>',
    'line.3.horizontal.decrease.circle.fill': '<circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none"/><path d="M7.5 9h9M9.5 12.5h5M11 16h2" style="stroke:var(--knock,#fff)" stroke-width="1.9"/>',
    'chevron.up.circle': '<circle cx="12" cy="12" r="9"/><path d="m8 13.5 4-4 4 4"/>',
    'chevron.down.circle': '<circle cx="12" cy="12" r="9"/><path d="m8 10.5 4 4 4-4"/>',
    'envelope.badge': '<rect x="2.5" y="5.5" width="16" height="12.5" rx="2.4"/><path d="m3.5 7 7.5 6 7.5-6"/><circle cx="19" cy="5.5" r="3" fill="currentColor"/>',
  });

  const BOXES = [
    { id: 'inbox', title: 'Inbox', icon: 'tray.fill' },
    { id: 'vip', title: 'VIP', icon: 'star.fill', smart: true },
    { id: 'flagged', title: 'Flagged', icon: 'flag.fill', smart: true },
    { id: 'drafts', title: 'Drafts', icon: 'doc.text' },
    { id: 'sent', title: 'Sent', icon: 'paperplane.fill' },
    { id: 'junk', title: 'Junk', icon: 'xmark.bin' },
    { id: 'trash', title: 'Trash', icon: 'trash' },
    { id: 'archive', title: 'Archive', icon: 'archivebox' },
  ];
  const CATS = [
    { id: 'primary', title: 'Primary', icon: 'person.fill', color: 'var(--blue)' },
    { id: 'transactions', title: 'Transactions', icon: 'cart.fill', color: 'var(--green)' },
    { id: 'updates', title: 'Updates', icon: 'megaphone.fill', color: 'var(--purple)' },
    { id: 'promotions', title: 'Promotions', icon: 'tag.fill', color: 'var(--pink)' },
    { id: 'all', title: 'All Mail', icon: 'tray.fill', color: 'var(--gray)' },
  ];

  // ══ Data helpers ═════════════════════════════════════════════════
  const all = () => JC.store.all('mail');
  const vips = () => JC.store.all('mailvip');
  const isVip = (addr) => vips().some((v) => v.id === (addr || '').toLowerCase());
  function customBoxes() { return JC.store.all('mailboxes'); }
  function boxDef(id) { return BOXES.find((b) => b.id === id) || customBoxes().map((b) => ({ id: b.id, title: b.title, icon: 'folder' })).find((b) => b.id === id) || BOXES[0]; }
  function inBox(m, id) {
    if (id === 'vip') return m.box === 'inbox' && isVip(m.from && m.from.addr);
    if (id === 'flagged') return !!m.flagged && m.box !== 'trash' && m.box !== 'junk';
    return m.box === id;
  }
  function list(id) { return all().filter((m) => inBox(m, id)).sort((a, b) => b.t - a.t); }
  function catOf(m) {
    if (m.cat) return m.cat;
    const a = (m.from && m.from.addr) || '';
    if (contactFor(a)) return 'primary';
    if (/receipt|order|trip|statement|invoice|payment/i.test(m.subject || '')) return 'transactions';
    if (/% off|sale|offer|deal|new release/i.test(m.subject || '')) return 'promotions';
    return 'updates';
  }
  function unreadInbox() { return all().filter((m) => m.box === 'inbox' && !m.read).length; }
  function badge() { try { JC.notify.badge('mail', unreadInbox()); } catch (e) { /* ignore */ } }
  JC.store.on('mail', badge);
  JC.bus.on('boot', badge);
  JC.bus.on('story:reset', badge);

  function contactFor(addr) {
    addr = (addr || '').toLowerCase();
    if (!addr) return null;
    const c = JC.contacts.all().find((x) => (x.emails || []).some((e) => e.addr.toLowerCase() === addr));
    return c ? c.id : addr === ME.addr ? 'me' : null;
  }
  const BRAND = { 'swiftride.app': 'swift', 'lotuseats.app': 'eats', 'ymcb.yunmeng': 'bank' };
  const GR = [['#74c0fc', '#1c7ed6'], ['#ffa94d', '#e8590c'], ['#b197fc', '#7048e8'], ['#63e6be', '#0ca678'], ['#ffa8a8', '#e03131'], ['#ffd43b', '#f08c00'], ['#a5d8ff', '#4dabf7'], ['#ced4da', '#868e96']];
  function senderAvatar(p, size) {
    const cid = contactFor(p && p.addr);
    if (cid) return JC.ui.avatar(cid, size);
    const dom = ((p && p.addr) || '').split('@')[1] || '';
    if (BRAND[dom] && JC.contacts.get(BRAND[dom])) return JC.ui.avatar(BRAND[dom], size);
    const nm = (p && (p.name || p.addr)) || '?';
    const ini = nm.replace(/^[^A-Za-z0-9]+/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '@';
    return JC.ui.avatar({ initials: ini, grad: GR[JC.voiceBed.hash(nm) % GR.length] }, size);
  }
  function who(p) {
    if (!p) return '';
    const cid = contactFor(p.addr);
    if (cid && cid !== 'me') return JC.ckit.name(cid);
    if (cid === 'me') return 'Jiang Cheng';
    return p.name || p.addr;
  }
  function stamp(t) {
    const d = new Date(t), n = JC.time.date();
    const dd = U.dayDiff(d, n);
    if (dd <= 0) return U.fmtTime(d);
    if (dd === 1) return 'Yesterday';
    if (dd < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(d, 'short');
  }
  function preview(m) { return (m.body || '').replace(/\s+/g, ' ').trim().slice(0, 180) || 'This message has no content.'; }
  function parseAddrs(s) {
    return String(s || '').split(/[,;]+/).map((x) => x.trim()).filter(Boolean).map((x) => {
      const m = x.match(/^(.*?)<([^>]+)>$/);
      const addr = (m ? m[2] : x).trim();
      const cid = contactFor(addr);
      const name = m && m[1].trim() ? m[1].trim().replace(/^"|"$/g, '') : cid ? JC.ckit.name(cid) : '';
      return { name: name || addr, addr };
    });
  }
  function fmtAddrs(arr) { return (arr || []).map((a) => (a.name && a.name !== a.addr ? a.name + ' <' + a.addr + '>' : a.addr)).join(', '); }
  function setRead(m, read) { if (m && !!m.read !== !!read) JC.store.update('mail', m.id, { read: !!read }); }

  // linkify a text block: urls, app links, emails, phone numbers
  const TOKEN = /(https?:\/\/[^\s)]+|[a-z]+:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\+86[\d ]{11,16}\d|\b95588\b)/g;
  function rich(text) {
    const out = [];
    let last = 0;
    String(text).replace(TOKEN, (m, _g, idx) => {
      if (idx > last) out.push(document.createTextNode(text.slice(last, idx)));
      out.push(tokenEl(m.replace(/[.,]$/, '')));
      if (/[.,]$/.test(m)) out.push(document.createTextNode(m.slice(-1)));
      last = idx + m.length;
      return m;
    });
    if (last < text.length) out.push(document.createTextNode(text.slice(last)));
    return out;
  }
  function tokenEl(tok) {
    if (/^https?:\/\//.test(tok)) {
      const el = h('span.ml-link', { onTap: () => JC.os.open('safari', { url: tok }) }, tok);
      JC.ui.contextMenu(el, () => ({ items: [{ text: 'Open Link', icon: 'safari', onTap: () => JC.os.open('safari', { url: tok }) }, { text: 'Copy Link', icon: 'doc.on.doc', onTap: () => { U.copy(tok); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }, { text: 'Share…', icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: tok, subtitle: 'Link', icon: 'link', payload: { kind: 'link', url: tok } }) }] }));
      return el;
    }
    if (/^[a-z]+:\/\//.test(tok)) {
      const app = tok.startsWith('swiftride') ? 'swift' : tok.startsWith('wavelet') ? 'wavelet' : null;
      const intent = app === 'wavelet' ? { user: 'teaspiller_qh' } : app === 'swift' && /lost/.test(tok) ? { report: true } : {};
      return h('span.ml-link', { onTap: () => (app ? JC.os.open(app, intent) : JC.ui.toast('No app can open this link', { icon: 'link' })) }, tok);
    }
    if (tok.includes('@')) return h('span.ml-link', { onTap: () => compose({ to: tok }) }, tok);
    const el = h('span.ml-link', { onTap: () => JC.callui.dialNumber(tok) }, tok);
    JC.ui.contextMenu(el, () => ({ items: [
      { text: 'Call ' + tok, icon: 'phone.fill', onTap: () => JC.callui.dialNumber(tok) },
      { text: 'Add to Contacts', icon: 'person.badge.plus', onTap: () => JC.ckit.editor(null, { prefill: { phones: [{ label: 'work', num: tok }] } }) },
      { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(tok); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
    ] }));
    return el;
  }

  // ══ Compose ══════════════════════════════════════════════════════
  /** o: { to, cc, subject, body, draftId, quote } */
  function compose(o) {
    o = o || {};
    const st = { to: o.to || '', cc: o.cc || '', subject: o.subject || '', body: o.body || '', showCc: !!o.cc };
    const orig = JSON.stringify(st);
    let s;
    let toField, sugg;
    const dirty = () => JSON.stringify(st) !== orig;
    function suggestions(q) {
      sugg.innerHTML = '';
      const tok = (q.split(/[,;]/).pop() || '').trim().toLowerCase();
      if (!tok) { sugg.hidden = true; return; }
      const seen = new Set();
      const items = [];
      JC.contacts.all().forEach((c) => (c.emails || []).forEach((e) => {
        const nm = JC.ckit.name(c.id);
        if ((nm + ' ' + (c.real || '') + ' ' + e.addr).toLowerCase().includes(tok) && !seen.has(e.addr)) { seen.add(e.addr); items.push({ cid: c.id, name: nm, addr: e.addr, label: e.label }); }
      }));
      all().forEach((m) => [m.from].concat(m.to || []).forEach((p) => {
        if (p && p.addr && p.addr !== ME.addr && !seen.has(p.addr) && (p.name + ' ' + p.addr).toLowerCase().includes(tok)) { seen.add(p.addr); items.push({ name: p.name || p.addr, addr: p.addr, p }); }
      }));
      if (!items.length) { sugg.hidden = true; return; }
      sugg.hidden = false;
      items.slice(0, 6).forEach((it) => sugg.appendChild(h('div.ml-sug', { onTap: () => pick(it) },
        it.cid ? JC.ui.avatar(it.cid, 34) : senderAvatar(it.p || it, 34),
        h('div.ml-sugt', h('div.ml-sugn', it.name), h('div.ml-suga', (it.label ? it.label + ' ' : '') + it.addr)))));
    }
    function pick(it) {
      const parts = st.to.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
      parts.pop();
      parts.push(it.addr);
      st.to = parts.join(', ') + ', ';
      toField.value = st.to;
      sugg.hidden = true;
      toField.focus();
    }
    function send() {
      const rcpts = parseAddrs(st.to);
      if (!rcpts.length) { JC.ui.alert({ title: 'Missing Recipient', message: 'Please specify at least one recipient.', buttons: [{ text: 'OK' }] }); return; }
      const bad = rcpts.find((r) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.addr));
      if (bad) { JC.ui.alert({ title: 'Invalid Address', message: '“' + bad.addr + '” does not appear to be a valid email address. Verify the address and try again.', buttons: [{ text: 'OK' }] }); return; }
      const go = () => {
        const cc = parseAddrs(st.cc);
        JC.store.add('mail', { box: 'sent', cat: 'primary', from: ME, to: rcpts, cc, subject: st.subject.trim(), body: st.body, t: JC.time.now(), read: true, flagged: false }, { front: true });
        if (o.draftId) JC.store.remove('mail', o.draftId);
        JC.audio.play('sent.mail');
        JC.story.act('mail_send', { to: rcpts.map((r) => r.addr).join(', '), contacts: rcpts.map((r) => contactFor(r.addr)).filter(Boolean), subject: st.subject.trim(), body: st.body, draft: o.draftId || null });
        s.close();
        setTimeout(() => JC.ui.toast('Message Sent', { icon: 'paperplane.fill' }), 300);
      };
      if (!st.subject.trim()) {
        JC.ui.alert({ title: 'Empty Subject', message: 'This message has no subject. Do you want to send it anyway?', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send', style: 'default', onTap: () => setTimeout(go, 200) }] });
        return;
      }
      go();
    }
    function cancel() {
      if (!dirty()) { s.close(); return; }
      JC.ui.actionSheet({ actions: [
        { text: 'Delete Draft', style: 'destructive', onTap: () => { if (o.draftId) JC.store.remove('mail', o.draftId); s.close(); } },
        { text: 'Save Draft', onTap: () => {
          const item = { box: 'drafts', cat: 'primary', from: ME, to: parseAddrs(st.to), cc: parseAddrs(st.cc), subject: st.subject, body: st.body, t: JC.time.now(), read: true, flagged: false };
          if (o.draftId) JC.store.update('mail', o.draftId, item);
          else JC.store.add('mail', item, { front: true });
          s.close();
          JC.ui.toast('Draft saved', { icon: 'doc.text' });
        } },
      ] });
    }
    s = JC.ui.sheet({
      title: st.subject || 'New Message', detent: 'large', cls: 'ml-compose', modal: true,
      left: { text: 'Cancel', onTap: () => { cancel(); return false; } },
      right: { icon: 'arrow.up', onTap: () => { send(); return false; } },
      content: () => {
        toField = JC.ui.input({ value: st.to, cls: 'ml-cin', cap: 'none', onInput: (v) => { st.to = v; suggestions(v); } });
        sugg = h('div.ml-suggs', { hidden: true });
        const ccRow = st.showCc
          ? [h('div.ml-crow', h('span.ml-cl', 'Cc:'), JC.ui.input({ value: st.cc, cls: 'ml-cin', cap: 'none', onInput: (v) => { st.cc = v; } })),
            h('div.ml-crow', h('span.ml-cl', 'From:'), h('span.ml-from', ME.addr))]
          : [h('div.ml-crow.tap', { onTap: () => { st.showCc = true; s.render(); } }, h('span.ml-cl', 'Cc/Bcc, From:'), h('span.ml-from', ME.addr))];
        const subj = JC.ui.input({ value: st.subject, cls: 'ml-cin', onInput: (v) => { st.subject = v; s.setTitle(v || 'New Message'); } });
        const body = JC.ui.input({ multiline: true, value: st.body, cls: 'ml-cbody', rows: 12, autoGrow: true, maxHeight: 6000, onInput: (v) => { st.body = v; } });
        setTimeout(() => { body.style.height = 'auto'; body.style.height = Math.max(240, body.scrollHeight) + 'px'; }, 0);
        return [
          h('div.ml-crow', h('span.ml-cl', 'To:'), toField, h('div.ml-cadd', { onTap: () => JC.ckit.picker({ title: 'Choose Contact', filter: (c) => (c.emails || []).length, detail: (c) => c.emails[0].addr, onPick: (cid) => {
            const c = JC.ckit.get(cid);
            if (!c || !(c.emails || []).length) { JC.ui.toast('No email address', { icon: 'envelope' }); return; }
            const parts = st.to.split(/[,;]/).map((x) => x.trim()).filter(Boolean);
            parts.push(c.emails[0].addr);
            st.to = parts.join(', ') + ', ';
            s.render();
          } }) }, JC.icon('plus.circle', { size: 22 }))),
          sugg,
          ccRow,
          h('div.ml-crow', h('span.ml-cl', 'Subject:'), subj),
          body,
          h('div.ml-csig', 'Sent from my iPhone'),
        ].flat();
      },
    });
    setTimeout(() => {
      const f = st.to ? s.body.querySelector('.ml-cbody') : toField;
      if (!f) return;
      f.focus();
      if (f.setSelectionRange && st.to) { f.setSelectionRange(0, 0); f.scrollTop = 0; s.body.scrollTop = 0; }
    }, 460);
    return s;
  }
  JC.icon.add({ 'plus.circle': '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>' });

  function quoteOf(m) {
    const d = new Date(m.t);
    return '\n\n\nOn ' + U.fmtDate(d, 'medium') + ', at ' + U.fmtTime(d) + ', ' + (m.from.name || m.from.addr) + ' <' + m.from.addr + '> wrote:\n\n' + (m.body || '').split('\n').map((l) => '> ' + l).join('\n');
  }
  function reply(m, mode) {
    const subj = (m.subject || '').replace(/^(re|fwd?):\s*/i, '');
    if (mode === 'fwd') { compose({ subject: 'Fwd: ' + subj, body: '\n\n\nBegin forwarded message:\n\nFrom: ' + fmtAddrs([m.from]) + '\nSubject: ' + (m.subject || '') + '\nDate: ' + U.fmtDate(m.t, 'full') + ' at ' + U.fmtTime(m.t) + '\nTo: ' + fmtAddrs(m.to) + '\n\n' + (m.body || '') }); return; }
    const toList = m.box === 'sent' || m.box === 'drafts' ? m.to : [m.from];
    const cc = mode === 'all' ? (m.to || []).concat(m.cc || []).filter((p) => p.addr !== ME.addr && !toList.some((x) => x.addr === p.addr)) : [];
    compose({ to: fmtAddrs(toList), cc: fmtAddrs(cc), subject: 'Re: ' + subj, body: quoteOf(m) });
  }

  // ══ App ══════════════════════════════════════════════════════════
  JC.app({
    id: 'mail',
    name: 'Mail',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-mail');
      const offs = [];
      let nav;
      let editingBoxes = false;
      const pages = {};

      // ── Mailboxes ──
      const editBox = JC.ui.navBtn({ text: 'Edit', onTap: () => { editingBoxes = !editingBoxes; editBox.querySelector('span').textContent = editingBoxes ? 'Done' : 'Edit'; editBox.classList.toggle('prominent', editingBoxes); boxesPage.render(); } });
      const boxesPage = JC.ui.page({
        title: 'Mailboxes', large: true, bg: 'grouped', cls: 'ml-boxes',
        right: [editBox],
        content: () => {
          const rows = BOXES.map((b) => {
            const n = b.id === 'inbox' ? unreadInbox() : b.id === 'vip' ? list('vip').filter((m) => !m.read).length : b.id === 'drafts' ? list('drafts').length : b.id === 'junk' ? list('junk').filter((m) => !m.read).length : b.id === 'flagged' ? list('flagged').length : 0;
            return {
              icon: { node: h('div.ml-boxic', { class: b.id }, JC.icon(b.icon, { size: 22 })) },
              title: b.title,
              detail: n ? String(n) : '',
              chevron: true,
              info: b.id === 'vip' ? () => vipSheet() : null,
              onTap: () => nav.push(boxPage(b.id)),
            };
          });
          const custom = customBoxes().map((b) => ({
            icon: { node: h('div.ml-boxic', JC.icon('folder', { size: 22 })) },
            title: b.title, detail: String(list(b.id).length || ''), chevron: true,
            onTap: () => nav.push(boxPage(b.id)),
            swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => delBox(b) }],
          }));
          const secs = [{ header: 'Lotus Pier (Exchange)', rows: rows.concat(custom) }];
          if (editingBoxes) secs.push({ rows: [{ title: 'New Mailbox', tinted: true, center: true, onTap: () => newBox() }] });
          return [JC.ui.list(secs, { cls: 'ml-boxlist' })];
        },
        toolbar: [h('div.ml-tbspace'), h('div.tb-label.ml-tbl', h('div', 'Updated Just Now'), h('div.ml-tbsub', unreadInbox() + ' Unread')), JC.ui.navBtn({ icon: 'square.and.pencil', label: 'Compose', onTap: () => compose({}) })],
      });
      function newBox(cb) {
        JC.ui.alert({ title: 'New Mailbox', message: 'Enter a name for this mailbox.', input: { placeholder: 'Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => {
          if (r.index !== 1 || !r.value || !r.value.trim()) return;
          const b = JC.store.add('mailboxes', { id: U.uid('mb'), title: r.value.trim() });
          if (cb) cb(b);
        });
      }
      function delBox(b) {
        JC.ui.alert({ title: 'Delete “' + b.title + '”?', message: 'Messages in this mailbox will be moved to the Trash.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => {
          JC.store.set('mail', all().map((m) => (m.box === b.id ? Object.assign({}, m, { box: 'trash' }) : m)));
          JC.store.remove('mailboxes', b.id);
        } }] });
      }
      function vipSheet() {
        const s = JC.ui.sheet({
          title: 'VIP', detent: 'large', cls: 'ml-sheet', left: { text: 'Done' },
          content: () => [JC.ui.list([{ footer: 'Mail from VIPs appears in the VIP mailbox.', rows: vips().map((v) => ({
            avatar: contactFor(v.id) || { initials: (v.name || '?')[0], grad: ['#ffd43b', '#f08c00'] }, avatarSize: 36, title: v.name, subtitle: v.id,
            swipe: [{ text: 'Remove', color: 'var(--red)', icon: 'trash', onTap: () => { JC.store.remove('mailvip', v.id); s.render(); } }],
          })).concat([{ title: 'Add VIP…', tinted: true, onTap: () => JC.ckit.picker({ title: 'Add VIP', filter: (c) => (c.emails || []).length, detail: (c) => c.emails[0].addr, onPick: (cid) => {
            const c = JC.ckit.get(cid);
            if (c && c.emails && c.emails.length) { JC.store.add('mailvip', { id: c.emails[0].addr.toLowerCase(), name: JC.ckit.name(cid) }); s.render(); }
          } }) }]) }])],
        });
      }

      // ── Message list ──
      function boxPage(boxId) {
        const def = boxDef(boxId);
        let cat = 'primary';
        let catMode = boxId === 'inbox';
        let q = '';
        let scopeAll = true;
        let filter = null; // 'unread' | 'flagged' | 'attach' | 'tome'
        let selecting = false;
        const sel = new Set();
        const moreBtn = JC.ui.navBtn({ icon: 'ellipsis', label: 'More', onTap: (e) => moreMenu(e.currentTarget) });
        const doneBtn = JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => setSelect(false) });
        const allBtn = JC.ui.navBtn({ text: 'Select All', onTap: () => { const ids = visible().map((m) => m.id); if (sel.size === ids.length) sel.clear(); else ids.forEach((id) => sel.add(id)); page.render(); paintToolbar(); } });
        const page = JC.ui.page({
          title: def.title, large: true, bg: 'plain', cls: 'ml-listpage',
          right: [moreBtn],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); }, onCancel: () => { q = ''; page.render(); } },
          content: () => content(),
          toolbar: [],
          onShow: () => { paintToolbar(); if (boxId === 'inbox') JC.notify.seen({ app: 'mail' }); },
        });
        const backBtn = () => page.left.querySelector('.navbtn.back');
        function setSelect(on) {
          selecting = on;
          sel.clear();
          page.setRight(on ? [doneBtn] : [moreBtn]);
          const bb = backBtn();
          if (bb) bb.hidden = on;
          if (on) page.left.appendChild(allBtn); else allBtn.remove();
          page.render();
          paintToolbar();
        }
        function moreMenu(anchor) {
          const items = [
            { text: 'Select Messages', icon: 'checkmark.circle.fill', onTap: () => setSelect(true) },
          ];
          if (boxId === 'inbox') items.push({ text: catMode ? 'List View' : 'Categories', icon: catMode ? 'list.bullet' : 'square.grid.2x2', onTap: () => { catMode = !catMode; page.render(); } });
          items.push({ text: 'Mark All as Read', icon: 'envelope.open', onTap: () => {
            const ids = new Set(visible().map((m) => m.id));
            JC.store.set('mail', all().map((m) => (ids.has(m.id) && !m.read ? Object.assign({}, m, { read: true }) : m)));
          } });
          items.push('-', { text: filter ? 'Remove Filter' : 'Filter by Unread', icon: 'line.3.horizontal.decrease.circle', onTap: () => { filter = filter ? null : 'unread'; page.render(); paintToolbar(); } });
          if (boxId === 'trash' || boxId === 'junk') items.push({ text: 'Empty ' + def.title, icon: 'trash', destructive: true, onTap: () => {
            JC.ui.alert({ title: 'Empty ' + def.title + '?', message: 'All messages in ' + def.title + ' will be permanently deleted.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete All', style: 'destructive', onTap: () => JC.store.set('mail', all().filter((m) => m.box !== boxId)) }] });
          } });
          JC.ui.menu(anchor, items);
        }
        function base() {
          let L = q && scopeAll ? all().slice().sort((a, b) => b.t - a.t) : list(boxId);
          if (catMode && !q && cat !== 'all') L = L.filter((m) => catOf(m) === cat);
          if (filter === 'unread') L = L.filter((m) => !m.read);
          if (filter === 'flagged') L = L.filter((m) => m.flagged);
          if (filter === 'attach') L = L.filter((m) => (m.attach || []).length);
          if (filter === 'tome') L = L.filter((m) => (m.to || []).some((p) => p.addr === ME.addr));
          if (q) {
            const s = q.toLowerCase();
            L = L.filter((m) => [m.subject, m.body, m.from && m.from.name, m.from && m.from.addr, fmtAddrs(m.to)].join(' ').toLowerCase().includes(s));
          }
          return L;
        }
        function visible() { return base(); }
        function catBar() {
          const counts = {};
          list('inbox').forEach((m) => { if (!m.read) counts[catOf(m)] = (counts[catOf(m)] || 0) + 1; });
          return h('div.ml-cats', CATS.map((c) => h('div.ml-cat', {
            class: { on: cat === c.id },
            style: { '--cc': c.color },
            onTap: () => { if (cat === c.id) return; cat = c.id; page.render(); JC.audio.haptic(6); },
          }, JC.icon(c.icon, { size: 18 }), cat === c.id ? h('span.ml-catl', c.title) : null, cat !== c.id && counts[c.id] ? h('span.ml-catdot') : null)));
        }
        function row(m) {
          const draft = m.box === 'drafts';
          const outgoing = m.box === 'sent' || draft;
          const name = outgoing ? (m.to && m.to.length ? m.to.map(who).join(', ') : 'No Recipients') : who(m.from);
          const att = (m.attach || []).length;
          const checked = sel.has(m.id);
          const lead = h('div.ml-lead',
            selecting ? h('div.ml-check', { class: { on: checked } }, checked ? JC.icon('checkmark', { size: 14, weight: 3 }) : null) : h('div.ml-dot', { class: { on: !m.read } }),
            outgoing ? senderAvatar(m.to && m.to[0], 40) : senderAvatar(m.from, 40));
          const top = h('div.ml-rtop',
            h('div.ml-rname', draft ? h('span.ml-draftl', 'Draft ') : null, name),
            h('div.ml-rmeta', att ? JC.icon('paperclip', { size: 13 }) : null, m.flagged ? h('span.ml-flag', JC.icon('flag.fill', { size: 12 })) : null, h('span', stamp(m.t)), JC.icon('chevron.right', { size: 11, weight: 2.6 })));
          const custom = h('div.ml-row', { class: { unread: !m.read, checked } },
            lead,
            h('div.ml-rmain', top, h('div.ml-rsubj', m.subject || '(No Subject)'), h('div.ml-rprev', preview(m))));
          return {
            leading: custom,
            cls: 'ml-rowwrap',
            title: '',
            onTap: () => {
              if (selecting) { if (sel.has(m.id)) sel.delete(m.id); else sel.add(m.id); page.render(); paintToolbar(); return; }
              if (draft) { JC.story.act('mail_open', { id: m.id, draft: true }); compose({ to: fmtAddrs(m.to), cc: fmtAddrs(m.cc), subject: m.subject, body: m.body, draftId: m.id }); }
              else openMsg(m, page);
            },
            lead: selecting ? null : [{ text: m.read ? 'Unread' : 'Read', color: 'var(--blue)', icon: m.read ? 'envelope.badge' : 'envelope.open', onTap: () => setRead(m, !m.read) }],
            swipe: selecting ? null : [
              { text: m.flagged ? 'Unflag' : 'Flag', color: 'var(--orange)', icon: 'flag.fill', onTap: () => JC.store.update('mail', m.id, { flagged: !m.flagged }) },
              m.box === 'archive' || m.box === 'trash'
                ? { text: m.box === 'trash' ? 'Delete' : 'Inbox', color: m.box === 'trash' ? 'var(--red)' : 'var(--blue)', icon: m.box === 'trash' ? 'trash' : 'tray.fill', onTap: () => (m.box === 'trash' ? JC.store.remove('mail', m.id) : JC.store.update('mail', m.id, { box: 'inbox' })) }
                : { text: 'Archive', color: 'var(--purple)', icon: 'archivebox', onTap: () => { JC.store.update('mail', m.id, { box: 'archive', prevBox: m.box }); JC.ui.toast('Archived', { icon: 'archivebox' }); } },
              m.box !== 'trash' ? { text: 'Trash', color: 'var(--red)', icon: 'trash', onTap: () => trash(m) } : null,
            ].filter(Boolean),
            menu: selecting ? null : () => ({ items: [
              { text: 'Reply', icon: 'arrowshape.turn.up.left', onTap: () => reply(m) },
              { text: 'Reply All', icon: 'arrowshape.turn.up.left.2', onTap: () => reply(m, 'all') },
              { text: 'Forward', icon: 'arrowshape.turn.up.right', onTap: () => reply(m, 'fwd') },
              '-',
              { text: m.read ? 'Mark as Unread' : 'Mark as Read', icon: 'envelope.badge', onTap: () => setRead(m, !m.read) },
              { text: m.flagged ? 'Unflag' : 'Flag', icon: 'flag.fill', onTap: () => JC.store.update('mail', m.id, { flagged: !m.flagged }) },
              { text: 'Move Message…', icon: 'folder', onTap: () => movePicker([m]) },
              '-',
              { text: 'Trash Message', icon: 'trash', destructive: true, onTap: () => trash(m) },
            ] }),
          };
        }
        function content() {
          const out = [];
          if (q) {
            out.push(h('div.ml-scope', JC.ui.segmented({ items: ['All Mailboxes', def.title], value: scopeAll ? 0 : 1, onChange: (i) => { scopeAll = i === 0; page.render(); } })));
          } else if (catMode && !selecting) out.push(catBar());
          if (filter) out.push(h('div.ml-filterbar', JC.icon('line.3.horizontal.decrease.circle.fill', { size: 16 }), h('span', 'Filtered by: ' + ({ unread: 'Unread', flagged: 'Flagged', attach: 'Attachments', tome: 'To: Me' })[filter]), h('span.ml-filterx', { onTap: () => { filter = null; page.render(); paintToolbar(); } }, 'Clear')));
          const L = base();
          if (!L.length) {
            out.push(JC.ui.empty({ icon: q ? 'magnifyingglass' : def.icon, title: q ? 'No Results' : filter ? 'No Messages' : catMode && cat !== 'all' ? 'No ' + CATS.find((c) => c.id === cat).title + ' Mail' : 'No Mail', text: catMode && !q && cat === 'promotions' ? 'Promotions are quiet tonight.' : null }));
            return out;
          }
          out.push(JC.ui.list([{ rows: L.map(row) }], { style: 'plain', cls: 'ml-list' + (selecting ? ' selecting' : '') }));
          return out;
        }
        function paintToolbar() {
          if (selecting) {
            const ms = all().filter((m) => sel.has(m.id));
            page.setToolbar([
              h('div.ml-tbtext', { class: { off: !ms.length }, onTap: (e) => ms.length && JC.ui.menu(e.currentTarget, [
                { text: 'Mark as Read', icon: 'envelope.open', onTap: () => bulk(ms, { read: true }) },
                { text: 'Mark as Unread', icon: 'envelope.badge', onTap: () => bulk(ms, { read: false }) },
                { text: 'Flag', icon: 'flag.fill', onTap: () => bulk(ms, { flagged: true }) },
                { text: 'Unflag', icon: 'flag', onTap: () => bulk(ms, { flagged: false }) },
                { text: 'Move to Junk', icon: 'xmark.bin', onTap: () => bulk(ms, { box: 'junk' }) },
              ]) }, 'Mark'),
              JC.ui.spacer(),
              h('div.ml-tbtext', { class: { off: !ms.length }, onTap: () => ms.length && movePicker(ms, () => setSelect(false)) }, 'Move'),
              JC.ui.spacer(),
              h('div.ml-tbtext.red', { class: { off: !ms.length }, onTap: () => { if (!ms.length) return; ms.forEach((m) => trash(m, true)); setSelect(false); JC.ui.toast(ms.length + ' moved to Trash', { icon: 'trash' }); } }, boxId === 'trash' ? 'Delete' : 'Trash'),
            ]);
            return;
          }
          const unread = list(boxId).filter((m) => !m.read).length;
          page.setToolbar([
            JC.ui.navBtn({ icon: filter ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle', label: 'Filter', cls: filter ? 'ml-filteron' : '', onTap: (e) => {
              if (filter) { filter = null; page.render(); paintToolbar(); return; }
              JC.ui.menu(e.currentTarget, [
                { text: 'Unread', icon: 'envelope.badge', onTap: () => { filter = 'unread'; page.render(); paintToolbar(); } },
                { text: 'Flagged', icon: 'flag.fill', onTap: () => { filter = 'flagged'; page.render(); paintToolbar(); } },
                { text: 'To: Me', icon: 'person.fill', onTap: () => { filter = 'tome'; page.render(); paintToolbar(); } },
                { text: 'Only Mail with Attachments', icon: 'paperclip', onTap: () => { filter = 'attach'; page.render(); paintToolbar(); } },
              ], { title: 'Filter by' });
            } }),
            h('div.tb-label.ml-tbl', h('div', filter ? 'Filtered' : 'Updated Just Now'), h('div.ml-tbsub', unread ? unread + ' Unread' : list(boxId).length + ' Messages')),
            JC.ui.navBtn({ icon: 'square.and.pencil', label: 'Compose', onTap: () => compose({}) }),
          ]);
        }
        function bulk(ms, patch) {
          const ids = new Set(ms.map((m) => m.id));
          JC.store.set('mail', all().map((m) => (ids.has(m.id) ? Object.assign({}, m, patch) : m)));
          setSelect(false);
        }
        page.order = () => base().map((m) => m.id);
        paintToolbar();
        offs.push(JC.store.on('mail', () => { if (page.el.isConnected) { page.render(); paintToolbar(); } }));
        offs.push(JC.store.on('mailvip', () => { if (page.el.isConnected) page.render(); }));
        pages[boxId] = page;
        return page;
      }

      function trash(m, quiet) {
        if (m.box === 'trash') {
          JC.store.remove('mail', m.id);
          if (!quiet) JC.ui.toast('Deleted', { icon: 'trash' });
          return;
        }
        JC.store.update('mail', m.id, { box: 'trash', prevBox: m.box });
        if (!quiet) JC.ui.toast('Moved to Trash', { icon: 'trash' });
      }
      function movePicker(ms, done) {
        const s = JC.ui.sheet({
          title: ms.length === 1 ? 'Move Message' : 'Move ' + ms.length + ' Messages', detent: 'large', cls: 'ml-sheet', left: { text: 'Cancel' },
          content: () => [
            ms.length === 1 ? h('div.ml-movehead', senderAvatar(ms[0].from, 36), h('div', h('div.ml-movesub', ms[0].subject || '(No Subject)'), h('div.ml-movefrom', who(ms[0].from)))) : null,
            JC.ui.list([{ header: 'Lotus Pier (Exchange)', rows: BOXES.filter((b) => !b.smart && b.id !== 'drafts' && b.id !== 'sent').concat(customBoxes().map((b) => ({ id: b.id, title: b.title, icon: 'folder' }))).map((b) => ({
              icon: { node: h('div.ml-boxic', { class: b.id }, JC.icon(b.icon, { size: 22 })) }, title: b.title,
              detail: ms.every((m) => m.box === b.id) ? 'Current' : '',
              onTap: () => {
                const ids = new Set(ms.map((m) => m.id));
                JC.store.set('mail', all().map((m) => (ids.has(m.id) ? Object.assign({}, m, { box: b.id, prevBox: m.box }) : m)));
                s.close();
                JC.ui.toast('Moved to ' + b.title, { icon: 'folder' });
                if (done) done();
              },
            })).concat([{ title: 'New Mailbox…', tinted: true, onTap: () => newBox(() => s.render()) }]) }]),
          ],
        });
      }

      // ── Message view ──
      function openMsg(m, listPage) {
        setRead(m, true);
        JC.story.act('mail_open', { id: m.id });
        nav.push(msgPage(m.id, listPage));
      }
      function msgPage(id, listPage) {
        let details = false;
        const up = h('div.ml-ud', { onTap: () => step(-1) }, JC.icon('chevron.up', { size: 18, weight: 2.4 }));
        const down = h('div.ml-ud', { onTap: () => step(1) }, JC.icon('chevron.down', { size: 18, weight: 2.4 }));
        function step(dir) {
          const ids = orderIds();
          const i = ids.indexOf(id);
          const nid = ids[i + dir];
          if (!nid) { JC.audio.play('tap'); return; }
          const nm = JC.store.get('mail', nid);
          setRead(nm, true);
          JC.story.act('mail_open', { id: nid });
          nav.replace(msgPage(nid, listPage));
        }
        function orderIds() {
          const m = JC.store.get('mail', id);
          if (!m) return [];
          const ids = listPage && listPage.order ? listPage.order() : [];
          return ids.includes(id) ? ids : list(m.box).map((x) => x.id);
        }
        const page = JC.ui.page({
          title: '', bg: 'plain', cls: 'ml-msg',
          right: [h('div.glass-group.ml-updown', up, down)],
          content: () => {
            const m = JC.store.get('mail', id);
            if (!m) return [JC.ui.empty({ icon: 'envelope', title: 'No Message Selected' })];
            const ids = orderIds();
            up.classList.toggle('off', ids.indexOf(id) <= 0);
            down.classList.toggle('off', ids.indexOf(id) >= ids.length - 1);
            const outgoing = m.box === 'sent';
            const head = h('div.ml-head',
              senderAvatar(m.from, 44),
              h('div.ml-hmain',
                h('div.ml-hrow', h('div.ml-hfrom', who(m.from), isVip(m.from.addr) ? h('span.ml-vip', JC.icon('star.fill', { size: 12 })) : null), h('div.ml-hdate', stamp(m.t))),
                details
                  ? h('div.ml-details',
                    h('div.ml-drow', h('span.ml-dk', 'From:'), h('span.ml-dv.ml-link', { onTap: () => addrMenu(m.from) }, fmtAddrs([m.from]))),
                    h('div.ml-drow', h('span.ml-dk', 'To:'), h('span.ml-dv', (m.to || []).map((p, i) => [i ? ', ' : '', h('span.ml-link', { onTap: () => addrMenu(p) }, p.name && p.name !== p.addr ? p.name : p.addr)]))),
                    (m.cc || []).length ? h('div.ml-drow', h('span.ml-dk', 'Cc:'), h('span.ml-dv', fmtAddrs(m.cc))) : null,
                    h('div.ml-drow', h('span.ml-dk', ''), h('span.ml-dv.dim', U.fmtDate(m.t, 'full') + ' at ' + U.fmtTime(m.t))),
                    h('div.ml-hide', { onTap: () => { details = false; page.render(); } }, 'Hide'))
                  : h('div.ml-hto', { onTap: () => { details = true; page.render(); } }, (outgoing ? 'To: ' + (m.to || []).map(who).join(', ') : 'To: ' + ((m.to || []).some((p) => p.addr === ME.addr) ? 'Jiang Cheng' : (m.to || []).map(who).join(', '))), JC.icon('chevron.right', { size: 11, weight: 2.6 }))));
            const subj = h('div.ml-subj', m.flagged ? h('span.ml-flagbig', JC.icon('flag.fill', { size: 16 })) : null, m.subject || '(No Subject)');
            const body = h('div.ml-body', String(m.body || '').split(/\n{2,}/).map((p) => h('p', p.split('\n').map((ln, i) => [i ? h('br') : null, rich(ln)]))));
            const att = (m.attach || []).length ? h('div.ml-atts', m.attach.map((a) => h('div.ml-att', { onTap: () => previewAtt(a, m) },
              JC.art.el(a.art, { cls: 'ml-attimg' }),
              h('div.ml-attmeta', h('div.ml-attname', a.name), h('div.ml-attsize', a.size || 'Attachment'))))) : null;
            const junk = m.box === 'junk' ? h('div.ml-junkbar', JC.icon('xmark.bin', { size: 16 }), h('span', 'This message is in Junk.'), h('span.ml-junkmv', { onTap: () => { JC.store.update('mail', m.id, { box: 'inbox' }); JC.ui.toast('Moved to Inbox', { icon: 'tray.fill' }); } }, 'Move to Inbox')) : null;
            return [junk, head, subj, body, att];
          },
          toolbar: [],
        });
        function addrMenu(p) {
          const cid = contactFor(p.addr);
          const items = [
            { text: 'New Message', icon: 'envelope.fill', onTap: () => compose({ to: p.addr }) },
            { text: 'Copy Address', icon: 'doc.on.doc', onTap: () => { U.copy(p.addr); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
            { text: isVip(p.addr) ? 'Remove from VIP' : 'Add to VIP', icon: 'star.fill', onTap: () => (isVip(p.addr) ? JC.store.remove('mailvip', p.addr.toLowerCase()) : JC.store.add('mailvip', { id: p.addr.toLowerCase(), name: p.name || p.addr })) },
          ];
          if (cid && cid !== 'me') items.push({ text: 'Open Contact', icon: 'person.crop.circle', onTap: () => nav.push(JC.ckit.cardPage(cid)) });
          else if (!cid) items.push({ text: 'Create New Contact', icon: 'person.badge.plus', onTap: () => JC.ckit.editor(null, { prefill: { first: p.name || '', emails: [{ label: 'work', addr: p.addr }] } }) });
          JC.ui.actionSheet({ title: p.name || p.addr, message: p.addr, actions: items.map((it) => ({ text: it.text, onTap: it.onTap })) });
        }
        function bar() {
          const m = JC.store.get('mail', id);
          if (!m) { page.setToolbar([]); return; }
          page.setToolbar([
            JC.ui.navBtn({ icon: m.flagged ? 'flag.fill' : 'flag', label: 'Flag', cls: m.flagged ? 'ml-flagon' : '', onTap: () => JC.store.update('mail', id, { flagged: !m.flagged }) }),
            JC.ui.spacer(),
            JC.ui.navBtn({ icon: 'folder', label: 'Move', onTap: () => movePicker([m]) }),
            JC.ui.spacer(),
            JC.ui.navBtn({ icon: 'trash', label: 'Trash', onTap: () => { trash(m); nav.pop(); } }),
            JC.ui.spacer(),
            JC.ui.navBtn({ icon: 'arrowshape.turn.up.left', label: 'Reply', onTap: (e) => JC.ui.menu(e.currentTarget, [
              { text: 'Reply', icon: 'arrowshape.turn.up.left', onTap: () => reply(m) },
              { text: 'Reply All', icon: 'arrowshape.turn.up.left.2', onTap: () => reply(m, 'all') },
              { text: 'Forward', icon: 'arrowshape.turn.up.right', onTap: () => reply(m, 'fwd') },
              '-',
              { text: 'Mark as Unread', icon: 'envelope.badge', onTap: () => { setRead(m, false); nav.pop(); } },
              { text: m.box === 'archive' ? 'Move to Inbox' : 'Archive', icon: 'archivebox', onTap: () => { JC.store.update('mail', id, { box: m.box === 'archive' ? 'inbox' : 'archive', prevBox: m.box }); if (m.box !== 'archive') nav.pop(); JC.ui.toast(m.box === 'archive' ? 'Moved to Inbox' : 'Archived', { icon: 'archivebox' }); } },
              { text: m.box === 'junk' ? 'Not Junk' : 'Move to Junk', icon: 'xmark.bin', onTap: () => { JC.store.update('mail', id, { box: m.box === 'junk' ? 'inbox' : 'junk' }); nav.pop(); } },
              { text: 'Print', icon: 'printer', onTap: () => JC.ui.alert({ title: 'No AirPrint Printers Found', message: 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }) },
            ]) }),
            JC.ui.spacer(),
            JC.ui.navBtn({ icon: 'square.and.pencil', label: 'Compose', onTap: () => compose({}) }),
          ]);
        }
        bar();
        offs.push(JC.store.on('mail', () => { if (page.el.isConnected) { page.render(); bar(); } }));
        return page;
      }

      function previewAtt(a, m) {
        const s = JC.ui.sheet({
          title: a.name, detent: 'large', cls: 'ml-preview', left: { text: 'Done' },
          right: { icon: 'square.and.arrow.up', bold: false, onTap: () => { JC.ui.share({ title: a.name, subtitle: 'From ' + (m.from.name || m.from.addr), art: a.art, payload: { kind: 'photo', art: a.art } }); return false; } },
          content: () => [
            h('div.ml-pvwrap', JC.art.el(a.art, { cls: 'ml-pvimg', fit: 'contain' })),
            h('div.ml-pvbar',
              h('div.ml-pvbtn', { onTap: () => {
                try { JC.store.add('photos', { art: a.art, t: JC.time.now(), albums: [], fav: false, people: [], place: '', caption: a.name, kind: 'screenshot' }, { front: true }); } catch (e) { /* ignore */ }
                JC.ui.toast('Saved to Photos', { icon: 'photo' });
              } }, JC.icon('square.and.arrow.down', { size: 20 }), h('span', 'Save to Photos')),
              h('div.ml-pvbtn', { onTap: () => JC.ui.toast('Markup needs Apple Pencil — or Jiang Cheng’s patience', { icon: 'pencil' }) }, JC.icon('pencil', { size: 20 }), h('span', 'Markup'))),
          ],
        });
        void s;
      }

      // ── boot the stack ──
      nav = JC.ui.nav(win.body, boxesPage);
      nav.push(boxPage('inbox'), { instant: true });
      offs.push(JC.store.on('mail', () => { if (boxesPage.el.isConnected) { boxesPage.render(); const t = boxesPage.toolbar && boxesPage.toolbar.querySelector('.ml-tbsub'); if (t) t.textContent = unreadInbox() + ' Unread'; } }));
      offs.push(JC.store.on('mailboxes', () => boxesPage.render()));

      function openId(mid) {
        const m = JC.store.get('mail', mid);
        if (!m) return;
        while (nav.depth() > 1) nav.pop({ instant: true });
        const lp = boxPage(m.box === 'drafts' ? 'drafts' : m.box);
        nav.push(lp, { instant: true });
        if (m.box === 'drafts') { JC.story.act('mail_open', { id: m.id, draft: true }); compose({ to: fmtAddrs(m.to), cc: fmtAddrs(m.cc), subject: m.subject, body: m.body, draftId: m.id }); }
        else openMsg(m, lp);
      }
      return {
        intent(i) {
          if (!i) return;
          if (i.id) openId(i.id);
          else if (i.box) { while (nav.depth() > 1) nav.pop({ instant: true }); nav.push(boxPage(i.box), { instant: true }); }
          if (i.compose) compose(typeof i.compose === 'object' ? i.compose : {});
        },
        destroy() { offs.forEach((o) => o()); },
      };
    },
  });
})();
