/* Messages — secondary screens: conversation details, new message, search results, Recently Deleted,
   shared photos/links/locations, Name & Photo, group Name & Photo. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const M = (JC.msgApp = JC.msgApp || {});

  // ── engine workarounds (see docs/REQUESTS.md) ──────────────────────────────
  function stThread(tid) {
    const t = JC.state.d.threads;
    if (!t[tid]) t[tid] = { live: [], unread: 0, pend: null };
    return t[tid];
  }
  M.rename = (tid, name) => {
    const st = stThread(tid);
    if (name) st.rename = name; else delete st.rename;
    JC.state.save();
    M.invalidate();
    JC.story.incoming(tid, { from: 'sys', sys: true, text: name ? 'You named the conversation “' + name + '”.' : 'You removed the name from the conversation.' });
    JC.bus.emit('story:threads');
  };
  M.restore = (tid) => {
    const st = stThread(tid);
    delete st.removed;
    JC.state.save();
    M.prefSet('deleted', tid, null);
    M.invalidate();
    JC.bus.emit('story:threads');
  };
  M.deleteThread = (tid) => {
    M.prefSet('deleted', tid, JC.time.now());
    JC.story.remove(tid);
    M.invalidate();
  };
  M.confirmDelete = (tid, then) => {
    JC.ui.alert({
      title: 'Delete Conversation?',
      message: 'This conversation will be moved to Recently Deleted. You can recover it there for up to 30 days.',
      buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { M.deleteThread(tid); if (then) then(); } }],
    });
  };

  /** shared items extracted from a thread */
  M.shared = (tid) => {
    const hidden = M.prefMap('hidden:' + tid);
    const msgs = JC.story.messages(tid).filter((m) => !m.unsent && !hidden[m.id]);
    return {
      photos: msgs.filter((m) => m.img).reverse(),
      links: msgs.filter((m) => m.link).reverse(),
      locs: msgs.filter((m) => m.loc).reverse(),
      audio: msgs.filter((m) => m.voice || m.memo).reverse(),
    };
  };

  function sharedSections(app, tid, sh, close) {
    const secs = [];
    if (sh.photos.length) {
      secs.push(h('div.msg-dt-sec',
        h('div.msg-dt-sech', h('span', 'Photos'), sh.photos.length > 6 ? h('span.msg-dt-all', { onTap: () => M.sharedPage(app, 'photos', tid) }, 'See All') : null),
        h('div.msg-dt-photos', sh.photos.slice(0, 6).map((m) => h('div.msg-dt-ph', { style: { backgroundImage: `url("${JC.art.url(m.img)}")` }, onTap: () => { if (close) close(); setTimeout(() => M.viewer(app, tid, m.id, app.currentConv && app.currentConv()), close ? 320 : 0); } })))));
    }
    if (sh.links.length) {
      secs.push(JC.ui.list([{ header: 'Links', rows: sh.links.slice(0, 5).map((m) => ({
        leading: m.link.art ? JC.art.el(m.link.art, { cls: 'msg-dt-linkart' }) : h('div.msg-dt-linkart.ico', JC.icon('link', { size: 18 })),
        title: m.link.title || m.link.url, subtitle: (m.link.site || m.link.url) + ' · ' + (m.from === 'me' ? 'You' : M.short(m.from)),
        onTap: () => JC.os.open('safari', { url: m.link.url }),
      })) }]));
    }
    if (sh.locs.length) {
      secs.push(JC.ui.list([{ header: 'Locations', rows: sh.locs.slice(0, 5).map((m) => {
        const p = M.place(m.loc);
        return { leading: h('div.msg-dt-locmap', M.miniMap(p.id, { w: 88, h: 88 })), title: p.name, subtitle: (p.city ? p.city + ' · ' : '') + U.fmtDate(m.t, 'medium'), onTap: () => JC.os.open('maps', { place: p.id }) };
      }) }]));
    }
    return secs;
  }

  // ── conversation details ───────────────────────────────────────────────────
  M.details = (app, tid, conv) => {
    const group = M.isGroup(tid);
    const dead = M.isDead(tid);
    const s = JC.ui.sheet({
      title: '', detent: 'large', cls: 'msg-details', right: { text: 'Done' },
      content: (sh) => build(sh),
    });
    const off = [JC.bus.on('story:threads', () => { if (!s.closed) s.render(); })];
    const oc = s.close;
    s.close = () => { off.forEach((f) => f()); oc(); };
    function quick(icon, label, fn, disabled) {
      return h('div.msg-dt-q', { class: { off: !!disabled }, onTap: fn }, JC.icon(icon, { size: 21 }), h('span', label));
    }
    function build() {
      const t = M.thread(tid) || { muted: false };
      const members = M.members(tid);
      const cid = M.peer(tid);
      const c = cid ? JC.contacts.get(cid) : null;
      const out = [];
      out.push(h('div.msg-dt-top',
        h('div.msg-dt-av', M.avatar(tid, 104)),
        h('div.msg-dt-name', M.name(tid)),
        group ? h('div.msg-dt-sub', members.length + ' People') : (c && c.phones[0] ? h('div.msg-dt-sub', c.phones[0].num) : null)));
      const call = () => {
        if (group) return conv ? conv.pickMember('Call…', (x) => JC.story.dial(x)) : null;
        JC.story.dial(cid);
      };
      const video = () => {
        if (group) return conv ? conv.pickMember('FaceTime…', (x) => JC.story.dial(x, { video: true })) : null;
        JC.story.dial(cid, { video: true });
      };
      const emails = members.map((m) => (JC.contacts.get(m) || { emails: [] }).emails[0]).filter(Boolean);
      const mail = () => {
        if (!emails.length) { JC.ui.alert({ title: 'No Email Address', message: (group ? 'No one in this conversation has' : M.short(cid) + ' doesn’t have') + ' an email address saved.', buttons: [{ text: 'OK' }] }); return; }
        s.close();
        JC.os.open('mail', { compose: { to: emails.map((e) => e.addr).join(', ') } });
      };
      const info = () => {
        if (group) { JC.ui.actionSheet({ title: 'Contact Info', actions: members.map((m) => ({ text: JC.contacts.name(m), onTap: () => JC.os.open('contacts', { contact: m }) })) }); return; }
        s.close();
        JC.os.open('contacts', { contact: cid });
      };
      out.push(h('div.msg-dt-quick', quick('phone.fill', 'call', call), quick('video.fill', 'video', video), quick('envelope.fill', 'mail', mail, !emails.length), quick('person.crop.circle', 'info', info)));

      if (group) {
        out.push(JC.ui.list([{ header: members.length + ' People', rows: members.map((m) => ({
          avatar: m, avatarSize: 34, title: JC.contacts.name(m), subtitle: JC.contacts.full(m) !== JC.contacts.name(m) ? JC.contacts.full(m) : '',
          chevron: true, onTap: () => { s.close(); JC.os.open('contacts', { contact: m }); },
        })).concat([{ icon: { node: h('div.msg-dt-add', JC.icon('plus', { size: 16, weight: 2.4 })) }, title: 'Add Member', tinted: true, onTap: () => JC.ui.alert({ title: 'Add Member', message: 'Wei Wuxian made this group, and Wei Wuxian decides who’s in it. (He told everyone. Twice.)', buttons: [{ text: 'OK' }] }) }]) }]));
        out.push(JC.ui.list([{ rows: [{ title: 'Change Name and Photo', tinted: true, onTap: () => M.groupNamePhoto(tid) }] }]));
      }

      out.push(JC.ui.list([{ rows: [
        { icon: { glyph: 'bell.slash.fill', bg: 'var(--indigo)' }, title: 'Hide Alerts', toggle: { on: !!t.muted, onChange: (v) => JC.story.mute(tid, v) } },
        !group && !dead ? { icon: { glyph: 'checkmark', bg: 'var(--blue)' }, title: 'Send Read Receipts', toggle: { on: M.prefMap('receipts')[tid] !== 0, onChange: (v) => M.prefSet('receipts', tid, v ? null : 0) } } : null,
        !group && !dead ? { icon: { glyph: 'moon.fill', bg: 'var(--purple)' }, title: 'Share Focus Status', toggle: { on: M.prefMap('focusShare')[tid] !== 0, onChange: (v) => M.prefSet('focusShare', tid, v ? null : 0) } } : null,
      ].filter(Boolean), footer: !group && !dead ? 'When this is on, people are notified when you have read their messages.' : null }]));

      const sharing = M.prefMap('sharing')[tid];
      out.push(JC.ui.list([{ rows: [
        { title: 'Send My Current Location', tinted: true, onTap: () => { s.close(); setTimeout(() => { if (app.currentConv && app.currentConv() && app.currentConv().tid === tid) app.currentConv().send({ loc: 'player-home' }); else JC.story.send(tid, { loc: 'player-home' }); }, 300); } },
        sharing
          ? { title: 'Stop Sharing My Location', destructive: true, onTap: () => { M.prefSet('sharing', tid, null); JC.story.incoming(tid, { from: 'sys', sys: true, text: 'You stopped sharing location.' }); s.render(); } }
          : { title: 'Share My Location', tinted: true, onTap: () => { M.shareLocation(tid); setTimeout(() => s.render(), 600); } },
      ], footer: sharing ? 'Sharing ' + sharing.label + '.' : null }]));

      const sh = M.shared(tid);
      sharedSections(app, tid, sh, () => s.close()).forEach((n) => out.push(n));

      const tail = [];
      if (group) tail.push({ title: 'Leave this Conversation', destructive: true, onTap: () => JC.ui.alert({ title: 'You can’t leave this conversation.', message: 'Jiang Cheng has threatened to leave this chat forty-seven times. He has never once actually left. It would be noticed.', buttons: [{ text: 'Fine', style: 'cancel' }] }) });
      tail.push({ title: 'Delete Conversation', destructive: true, onTap: () => M.confirmDelete(tid, () => { s.close(); setTimeout(() => app.popToList(), 250); }) });
      out.push(JC.ui.list([{ rows: tail }]));
      return out;
    }
    return s;
  };

  M.groupNamePhoto = (tid) => {
    const cur = M.prefMap('gphoto')[tid] || null;
    let name = (JC.state.d.threads[tid] && JC.state.d.threads[tid].rename) || M.def(tid).name || '';
    let emoji = cur ? cur.emoji : null;
    let grad = cur ? cur.grad : M.GROUP_COLORS[0];
    let clearPhoto = false;
    const EMOJI = ['🪷', '🎂', '🐶', '🍲', '🧧', '🎓', '🔔', '🏮', '🚗', '🐟', '🪭', '💜', '🎉', '⚔️', '🍵', '🌕'];
    const s = JC.ui.sheet({
      title: 'Name and Photo', detent: 'large', cls: 'msg-np', left: { text: 'Cancel' },
      right: { text: 'Done', onTap: () => {
        const oldName = (JC.state.d.threads[tid] && JC.state.d.threads[tid].rename) || M.def(tid).name || '';
        if (name.trim() !== oldName) M.rename(tid, name.trim());
        if (clearPhoto) M.prefSet('gphoto', tid, null);
        else if (emoji) M.prefSet('gphoto', tid, { emoji, grad });
        M.invalidate();
        JC.bus.emit('story:threads');
      } },
      content: () => {
        const prev = h('div.msg-np-prev');
        const draw = () => {
          prev.innerHTML = '';
          prev.appendChild(emoji && !clearPhoto ? JC.ui.avatar({ emoji, grad }, 112) : JC.ui.groupAvatar(M.members(tid), 112));
        };
        draw();
        const input = JC.ui.input({ placeholder: 'Group Name', value: name, enterkey: 'done', onInput: (v) => { name = v; } });
        input.classList.add('msg-np-field');
        const colors = h('div.msg-np-colors', M.GROUP_COLORS.map((g) => h('div.msg-np-color', { style: { background: `linear-gradient(180deg, ${g[0]}, ${g[1]})` }, onTap: () => { grad = g; clearPhoto = false; if (!emoji) emoji = '🪷'; draw(); } })));
        const emojis = h('div.msg-np-emojis', EMOJI.map((e) => h('div.msg-np-emoji', { onTap: () => { emoji = e; clearPhoto = false; draw(); } }, e)));
        return [
          prev,
          h('div.msg-np-fieldwrap', input, h('div.msg-np-clear', { onTap: () => { input.value = ''; name = ''; } }, JC.icon('xmark.circle.fill', { size: 18 }))),
          h('div.msg-np-k', 'COLOR'), colors,
          h('div.msg-np-k', 'EMOJI'), emojis,
          JC.ui.list([{ rows: [{ title: 'Use Member Photos', tinted: true, onTap: () => { clearPhoto = true; emoji = null; draw(); } }] }]),
          h('div.msg-np-note', 'The group name and photo are visible to everyone in this conversation.'),
        ];
      },
    });
    return s;
  };

  /** Jiang Cheng's own "Name & Photo" sharing sheet (in-world prefs) */
  M.namePhoto = () => {
    const share = M.pref('npShare') !== false;
    JC.ui.sheet({
      title: 'Name & Photo', detent: 'large', cls: 'msg-np', right: { text: 'Done' },
      content: (s) => [
        h('div.msg-np-prev', JC.ui.avatar('me', 112)),
        h('div.msg-np-me', 'Jiang Cheng'),
        h('div.msg-np-sub', 'Wanyin · Yunmeng Jiang Group'),
        JC.ui.list([{ rows: [
          { title: 'Name & Photo Sharing', toggle: { on: share, onChange: (v) => { M.pref('npShare', v); s.render(); } } },
        ], footer: 'Your name and photo will be shared with people you message. (Your name is Jiang Cheng. Your photo is a lotus. Nobody is allowed to change either.)' }]),
        share ? JC.ui.list([{ header: 'Share Automatically', rows: [
          { title: 'Contacts Only', check: M.pref('npWho') !== 'ask', onTap: () => { M.pref('npWho', 'contacts'); s.render(); } },
          { title: 'Always Ask', check: M.pref('npWho') === 'ask', onTap: () => { M.pref('npWho', 'ask'); s.render(); } },
        ] }]) : null,
        JC.ui.list([{ rows: [{ title: 'Edit Photo', tinted: true, onTap: () => JC.ui.alert({ title: 'Edit Photo', message: 'Tang Mei chose this photo in 2017. Jiang Cheng has never changed it. Neither will you.', buttons: [{ text: 'OK' }] }) }] }]),
      ],
    });
  };

  // ── New Message ──────────────────────────────────────────────────────────
  M.compose = (app, prefill) => {
    prefill = prefill || {};
    const recips = [];
    let query = '';
    let attach = null;
    if (prefill.img) attach = { kind: 'img', payload: { img: prefill.img } };
    else if (prefill.memo) { let mm = null; try { mm = JC.store.get('memos', prefill.memo); } catch (e) { mm = null; } attach = { kind: 'memo', title: mm ? mm.title : 'Voice Memo', payload: { memo: prefill.memo } }; }
    else if (prefill.loc) attach = { kind: 'loc', payload: { loc: prefill.loc } };
    else if (prefill.link) attach = { kind: 'link', payload: { link: prefill.link } };

    const tokens = h('div.msg-to-tokens');
    const toField = JC.ui.input({ placeholder: '', enterkey: 'next', cap: 'none', onInput: (v) => { query = v; renderSugg(); }, onSubmit: () => { const first = matches()[0]; if (first) add(first.id); } });
    toField.classList.add('msg-to-field');
    toField.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !toField.value && recips.length) { recips.pop(); renderTokens(); renderSugg(); } });
    const addBtn = h('div.msg-to-add', { onTap: () => pickContact() }, JC.icon('plus.circle.fill', { size: 24 }));
    const toRow = h('div.msg-to', h('span.msg-to-k', 'To:'), tokens, toField, addBtn);
    const sugg = h('div.msg-to-sugg.scroll');
    const body = h('div.msg-cmp-body', sugg);
    const field = JC.ui.input({ multiline: true, rows: 1, autoGrow: true, maxHeight: 120, send: true, enterkey: 'send', placeholder: 'iMessage', onInput: () => wrap.classList.toggle('has', !!field.value.trim() || !!attach), onSubmit: () => send() });
    field.classList.add('msg-field');
    if (prefill.text) field.value = prefill.text;
    const attBox = h('div.msg-attach');
    const sendBtn = h('div.msg-send', { onTap: () => send() }, JC.icon('arrow.up', { size: 17, weight: 2.8 }));
    const wrap = h('div.msg-fieldwrap', attBox, h('div.msg-fieldrow', field, h('div.msg-mic', { onTap: () => JC.ui.toast('Dictation is off — that isn’t Jiang Cheng’s voice', { icon: 'mic.slash.fill' }) }, JC.icon('mic', { size: 20 })), sendBtn));
    const comp = h('div.msg-composer.cmp', h('div.msg-plus', { attrs: { role: 'button', 'aria-label': 'Add Photo' }, onTap: () => attachPhoto() }, JC.icon('plus', { size: 22, weight: 2.1 })), wrap);

    function drawAttach() {
      attBox.innerHTML = '';
      attBox.hidden = !attach;
      if (!attach) { wrap.classList.toggle('has', !!field.value.trim()); return; }
      let chip;
      if (attach.kind === 'img') chip = h('div.msg-att-img', { style: { backgroundImage: `url("${JC.art.url(attach.payload.img)}")` } });
      else if (attach.kind === 'memo') chip = h('div.msg-att-file', h('div.msg-att-ic', JC.icon('waveform', { size: 18, weight: 2 })), h('div', h('div.msg-att-t', attach.title), h('div.msg-att-s', 'Voice Memo')));
      else if (attach.kind === 'loc') chip = h('div.msg-att-loc', M.miniMap(attach.payload.loc, { w: 150, h: 84 }), h('div.msg-att-s', M.place(attach.payload.loc).name));
      else chip = h('div.msg-att-file', h('div.msg-att-ic', JC.icon('link', { size: 18 })), h('div', h('div.msg-att-t', attach.payload.link.title || 'Link'), h('div.msg-att-s', attach.payload.link.site || attach.payload.link.url)));
      attBox.appendChild(h('div.msg-att', chip, h('div.msg-att-x', { onTap: () => { attach = null; drawAttach(); } }, JC.icon('xmark', { size: 11, weight: 3 }))));
      wrap.classList.add('has');
    }
    drawAttach();

    const s = JC.ui.sheet({
      title: 'New Message', detent: 'large', cls: 'msg-compose', left: { text: 'Cancel' },
      content: () => h('div.msg-cmp', toRow, body, comp),
    });
    setTimeout(() => { if (!s.closed) (prefill.to ? field : toField).focus(); }, 480);

    function people() { return JC.contacts.people().filter((c) => !M.DEAD.includes(c.id) || true); }
    function matches() {
      const q = query.trim().toLowerCase();
      return people().filter((c) => !recips.includes(c.id) && (!q || (c.display + ' ' + JC.contacts.full(c.id) + ' ' + (c.nick || '') + ' ' + (c.phones[0] ? c.phones[0].num : '')).toLowerCase().includes(q)));
    }
    function add(cid) {
      if (!recips.includes(cid)) recips.push(cid);
      toField.value = '';
      query = '';
      renderTokens();
      renderSugg();
      toField.focus();
    }
    function renderTokens() {
      tokens.innerHTML = '';
      recips.forEach((cid) => tokens.appendChild(h('div.msg-token', { onTap: () => JC.ui.menu(null, [{ text: JC.contacts.name(cid), sub: (JC.contacts.get(cid).phones[0] || {}).num, disabled: true }, { text: 'Remove', icon: 'xmark', destructive: true, onTap: () => { recips.splice(recips.indexOf(cid), 1); renderTokens(); renderSugg(); } }]) }, JC.contacts.name(cid))));
      const n = recips.length;
      field.placeholder = n && recips.every((c) => (JC.contacts.get(c) || {}).service) ? 'Text Message • SMS' : 'iMessage';
    }
    function renderSugg() {
      sugg.innerHTML = '';
      const q = query.trim();
      const arr = matches();
      if (!q && recips.length) return;
      if (!arr.length) { sugg.appendChild(h('div.msg-to-none', q ? 'No contacts match “' + q + '”' : '')); return; }
      sugg.appendChild(JC.ui.list([{ header: q ? null : 'Suggested', rows: arr.slice(0, 30).map((c) => ({
        avatar: c.id, avatarSize: 38, title: c.display, subtitle: (c.phones[0] ? c.phones[0].label + ' ' + c.phones[0].num : ''),
        onTap: () => add(c.id),
      })) }], { style: 'plain' }));
    }
    function pickContact() {
      const ps = JC.ui.sheet({
        title: 'Contacts', detent: 'large', right: { text: 'Cancel', bold: false },
        content: () => JC.ui.list([{ rows: people().map((c) => ({ avatar: c.id, avatarSize: 34, title: c.display, check: recips.includes(c.id), onTap: () => { ps.close(); add(c.id); } })) }]),
      });
    }
    function attachPhoto() {
      const photos = M.photos();
      const ps = JC.ui.sheet({
        title: 'Photos', detent: 'large', cls: 'msg-photos-sheet', left: { text: 'Cancel' },
        content: () => h('div.msg-ph-grid', photos.map((p) => h('div.msg-ph-cell', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { ps.close(); attach = { kind: 'img', payload: { img: p.art } }; drawAttach(); } }))),
      });
    }
    function send() {
      const text = field.value.trim();
      if (!text && !attach) return;
      if (!recips.length) {
        if (query.trim()) {
          const m = matches();
          if (m.length === 1) { add(m[0].id); }
          else {
            JC.ui.alert({ title: 'Not Delivered', message: '“' + query.trim() + '” isn’t a contact or a phone number Jiang Cheng has saved.', buttons: [{ text: 'OK' }] });
            return;
          }
        } else {
          JC.ui.alert({ title: 'No Recipients', message: 'Add at least one person in the To: field.', buttons: [{ text: 'OK' }] });
          return;
        }
      }
      let tid;
      if (recips.length === 1) tid = JC.story.threadFor(recips[0]);
      else {
        const key = recips.slice().sort().join(',');
        const ex = M.threads().find((t) => t.group && t.members.slice().sort().join(',') === key);
        tid = ex ? ex.id : JC.story.newGroup(recips.slice());
      }
      const payloads = [];
      if (attach) payloads.push(attach.payload);
      if (text) payloads.push({ text });
      s.close();
      M.invalidate();
      setTimeout(() => app.openThread(tid, { send: payloads, instantPop: true }), 260);
    }
    renderTokens();
    renderSugg();
    if (prefill.to) (Array.isArray(prefill.to) ? prefill.to : [prefill.to]).forEach((c) => { if (JC.contacts.get(c)) recips.push(c); });
    renderTokens();
    renderSugg();
    return s;
  };

  // ── search results ───────────────────────────────────────────────────────
  function hl(text, q) {
    const s = String(text || '');
    const i = s.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0 || !q) return s.length > 120 ? s.slice(0, 120) + '…' : s;
    const start = Math.max(0, i - 40);
    return [(start ? '…' : '') + s.slice(start, i), h('b', s.slice(i, i + q.length)), s.slice(i + q.length, i + q.length + 80)];
  }
  M.searchResults = (app, q) => {
    q = q.trim();
    const out = [];
    const lq = q.toLowerCase();
    const threads = M.threads();
    const convs = threads.filter((t) => t.name.toLowerCase().includes(lq) || t.members.some((m) => (JC.contacts.name(m) + ' ' + JC.contacts.full(m) + ' ' + ((JC.contacts.get(m) || {}).nick || '')).toLowerCase().includes(lq)));
    if (convs.length) {
      out.push(h('div.msg-sr-h', 'Conversations'));
      out.push(h('div.msg-sr-convs.hscroll', convs.slice(0, 12).map((t) => h('div.msg-sr-conv', { onTap: () => app.openThread(t.id) }, M.avatar(t.id, 58), h('div.msg-sr-cn', t.name)))));
    }
    const res = JC.story.search(q).filter((r) => !M.prefMap('hidden:' + r.thread)[r.id] && threads.some((t) => t.id === r.thread));
    if (res.length) {
      out.push(h('div.msg-sr-h', 'Messages', h('span', res.length + (res.length === 1 ? ' result' : ' results'))));
      out.push(JC.ui.list([{ rows: res.slice(0, 60).map((r) => ({
        cls: 'msg-sr-row',
        leading: M.avatar(r.thread, 40),
        title: h('span.msg-sr-name', r.name),
        titleRight: h('span.msg-sr-time', M.relTime(r.t)),
        subtitle: h('span', r.from === 'me' ? h('span.msg-sr-you', 'You: ') : (M.isGroup(r.thread) ? h('span.msg-sr-you', M.short(r.from) + ': ') : null), hl(r.text, q)),
        clamp: true,
        onTap: () => app.openThread(r.thread, { msg: r.id }),
      })) }], { style: 'plain', cls: 'msg-sr-list' }));
    }
    // links & photos by title
    const links = [];
    threads.forEach((t) => JC.story.messages(t.id).forEach((m) => { if (m.link && ((m.link.title || '') + ' ' + (m.link.site || '') + ' ' + m.link.url).toLowerCase().includes(lq)) links.push({ t, m }); }));
    if (links.length) {
      out.push(h('div.msg-sr-h', 'Links'));
      out.push(JC.ui.list([{ rows: links.slice(0, 8).map(({ t, m }) => ({ leading: h('div.msg-dt-linkart.ico', JC.icon('link', { size: 18 })), title: m.link.title || m.link.url, subtitle: (m.link.site || '') + ' · ' + t.name, onTap: () => JC.os.open('safari', { url: m.link.url }) })) }], { style: 'plain', cls: 'msg-sr-list' }));
    }
    if (!out.length) out.push(JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Check the spelling or try a new search.' }));
    return out;
  };

  /** search field focused, empty: suggestions */
  M.searchSuggest = (app) => {
    const threads = M.threads().filter((t) => !t.group && !M.isService(t.id) && !M.isDead(t.id)).slice(0, 8);
    const all = { photos: [], links: [], locs: [] };
    M.threads().forEach((t) => { const sh = M.shared(t.id); all.photos.push(...sh.photos); all.links.push(...sh.links); all.locs.push(...sh.locs); });
    return [
      h('div.msg-sr-h', 'Recent'),
      h('div.msg-sr-convs.hscroll', threads.map((t) => h('div.msg-sr-conv', { onTap: () => app.openThread(t.id) }, M.avatar(t.id, 58), h('div.msg-sr-cn', JC.contacts.short(t.members[0]))))),
      h('div.msg-sr-h', 'Shared with You'),
      h('div.msg-sr-cats',
        h('div.msg-sr-cat', { onTap: () => M.sharedPage(app, 'photos') }, h('div.msg-sr-cat-ic.photos', JC.icon('photo.on.rectangle', { size: 22 })), h('div.msg-sr-cat-t', 'Photos'), h('div.msg-sr-cat-n', String(all.photos.length))),
        h('div.msg-sr-cat', { onTap: () => M.sharedPage(app, 'links') }, h('div.msg-sr-cat-ic.links', JC.icon('link', { size: 22 })), h('div.msg-sr-cat-t', 'Links'), h('div.msg-sr-cat-n', String(all.links.length))),
        h('div.msg-sr-cat', { onTap: () => M.sharedPage(app, 'locs') }, h('div.msg-sr-cat-ic.locs', JC.icon('location.fill', { size: 22 })), h('div.msg-sr-cat-t', 'Locations'), h('div.msg-sr-cat-n', String(all.locs.length)))),
    ];
  };

  /** "See All" pages: shared photos/links/locations (one thread or all) */
  M.sharedPage = (app, kind, tid) => {
    const ths = tid ? [M.thread(tid) || { id: tid, name: M.name(tid) }] : M.threads();
    const items = [];
    ths.forEach((t) => { const sh = M.shared(t.id); sh[kind].forEach((m) => items.push({ t, m })); });
    items.sort((a, b) => b.m.t - a.m.t);
    const title = { photos: 'Photos', links: 'Links', locs: 'Locations' }[kind];
    const page = JC.ui.page({
      title, large: true, bg: kind === 'photos' ? 'plain' : 'grouped', cls: 'msg-shared',
      content: () => {
        if (!items.length) return JC.ui.empty({ icon: kind === 'photos' ? 'photo' : kind === 'links' ? 'link' : 'location', title: 'No ' + title, text: title + ' shared in Messages will appear here.' });
        if (kind === 'photos') return h('div.msg-ph-grid.page', items.map(({ t, m }) => h('div.msg-ph-cell', { style: { backgroundImage: `url("${JC.art.url(m.img)}")` }, onTap: () => M.viewer(app, t.id, m.id, null) })));
        if (kind === 'links') return JC.ui.list([{ rows: items.map(({ t, m }) => ({ leading: m.link.art ? JC.art.el(m.link.art, { cls: 'msg-dt-linkart' }) : h('div.msg-dt-linkart.ico', JC.icon('link', { size: 18 })), title: m.link.title || m.link.url, subtitle: (m.link.site || m.link.url) + ' · from ' + (m.from === 'me' ? 'You' : M.short(m.from)), onTap: () => JC.os.open('safari', { url: m.link.url }), menu: () => ({ items: [{ text: 'Show in Conversation', icon: 'message', onTap: () => app.openThread(t.id, { msg: m.id }) }, { text: 'Copy Link', icon: 'doc.on.doc', onTap: () => { U.copy(m.link.url); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }] }) })) }]);
        return JC.ui.list([{ rows: items.map(({ t, m }) => { const p = M.place(m.loc); return { leading: h('div.msg-dt-locmap', M.miniMap(p.id, { w: 88, h: 88 })), title: p.name, subtitle: (p.city ? p.city + ' · ' : '') + 'from ' + (m.from === 'me' ? 'You' : M.short(m.from)) + ' · ' + U.fmtDate(m.t, 'medium'), onTap: () => JC.os.open('maps', { place: p.id }), menu: () => ({ items: [{ text: 'Show in Conversation', icon: 'message', onTap: () => app.openThread(t.id, { msg: m.id }) }] }) }; }) }]);
      },
    });
    app.nav.push(page);
  };

  // ── Recently Deleted ─────────────────────────────────────────────────────
  M.recentlyDeleted = (app) => {
    const page = JC.ui.page({
      title: 'Recently Deleted', large: true, bg: 'grouped', cls: 'msg-rd',
      content: (p) => {
        const del = M.prefMap('deleted');
        const ids = Object.keys(del).filter((tid) => JC.story.threadDef(tid)).sort((a, b) => del[b] - del[a]);
        if (!ids.length) return JC.ui.empty({ icon: 'trash', title: 'No Recently Deleted Messages', text: 'Conversations you delete stay here for 30 days.' });
        return [
          h('div.msg-rd-note', 'Messages will be permanently deleted after 30 days. This may take up to 40 days.'),
          JC.ui.list([{ rows: ids.map((tid) => {
            const msgs = JC.story.messages(tid);
            const last = msgs[msgs.length - 1];
            return {
              leading: M.avatar(tid, 42), title: M.name(tid), subtitle: last ? JC.story.preview(last) : '', clamp: true,
              detail: '30 days',
              onTap: () => JC.ui.actionSheet({ title: M.name(tid), actions: [
                { text: 'Recover', onTap: () => { M.restore(tid); JC.ui.toast('Conversation recovered', { icon: 'arrow.counterclockwise' }); p.render(); } },
                { text: 'Delete Permanently', style: 'destructive', onTap: () => { M.prefSet('deleted', tid, null); M.prefSet('purged', tid, JC.time.now()); p.render(); } },
              ] }),
            };
          }) }]),
        ];
      },
      toolbar: [
        h('div.msg-rd-tb', { onTap: () => { const del = M.prefMap('deleted'); Object.keys(del).forEach((tid) => { M.prefSet('deleted', tid, null); M.prefSet('purged', tid, JC.time.now()); }); page.render(); } }, 'Delete All'),
        JC.ui.spacer(),
        h('div.msg-rd-tb', { onTap: () => { const del = M.prefMap('deleted'); Object.keys(del).forEach((tid) => M.restore(tid)); page.render(); JC.ui.toast('Recovered', { icon: 'arrow.counterclockwise' }); } }, 'Recover All'),
      ],
    });
    app.nav.push(page);
    return page;
  };
})();
