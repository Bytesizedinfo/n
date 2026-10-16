/* Phone — classic iOS layout with a floating glass tab bar: Favorites, Recents, Contacts, Keypad, Voicemail.
   Seeds `calls`, `voicemails` and `phonefavs`. Calls go through JC.callui (JC.story.dial); the call screen
   itself is js/apps/callui.js. Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const P = (s) => JC.time.parse(s);
  const num = (cid, i) => { const c = JC.contacts.get(cid); return c && c.phones[i || 0] ? c.phones[i || 0].num : ''; };

  // ══ Seeds ════════════════════════════════════════════════════════
  JC.store.seed('calls', () => [
    { id: 'c_wwx_3', contact: 'wwx', num: num('wwx'), t: P('+0 23:12') + 52e3, dir: 'missed', dur: 0, seen: false },
    { id: 'c_wwx_2', contact: 'wwx', num: num('wwx'), t: P('+0 23:12') + 31e3, dir: 'missed', dur: 0, seen: false },
    { id: 'c_wwx_1', contact: 'wwx', num: num('wwx'), t: P('+0 23:12') + 4e3, dir: 'missed', dur: 0, seen: false },
    { id: 'c_jl_miss', contact: 'jl', num: num('jl'), t: P('+0 23:05'), dir: 'missed', dur: 0, seen: false },
    { id: 'c_hq_0', contact: 'hq', num: num('hq'), t: P('+0 18:20'), dir: 'out', dur: 192 },
    { id: 'c_huang_0', contact: 'huang', num: num('huang'), t: P('+0 10:15'), dir: 'in', dur: 108 },
    { id: 'c_ea_0', contact: 'ea', num: num('ea'), t: P('+0 09:02'), dir: 'in', dur: 250 },
    { id: 'c_school', contact: null, num: '+86 555 0418 6600', name: 'Lanling International School', label: 'office', t: P('-1 17:31'), dir: 'in', dur: 125 },
    { id: 'c_jl_1', contact: 'jl', num: num('jl'), t: P('-1 15:52'), dir: 'out', dur: 41 },
    { id: 'c_huang_1', contact: 'huang', num: num('huang'), t: P('-1 12:10'), dir: 'out', dur: 65 },
    { id: 'c_ea_1', contact: 'ea', num: num('ea'), t: P('-1 09:05'), dir: 'in', dur: 150 },
    { id: 'c_lxc_41', contact: 'lxc', num: num('lxc'), t: P('-2 22:05'), dir: 'out', dur: 2466 },
    { id: 'c_wwx_w', contact: 'wwx', num: num('wwx'), t: P('-2 20:52'), dir: 'missed', dur: 0, seen: true },
    { id: 'c_ea_2', contact: 'ea', num: num('ea'), t: P('-2 10:05'), dir: 'in', dur: 72 },
    { id: 'c_jl_ft', contact: 'jl', num: num('jl'), t: P('-3 18:30'), dir: 'in', dur: 724, video: true },
    { id: 'c_nhs', contact: 'nhs', num: num('nhs'), t: P('-3 11:33'), dir: 'out', dur: 0 },
    { id: 'c_qr', contact: 'qr', num: num('qr'), t: P('-3 08:04'), dir: 'missed', dur: 0, seen: true },
    { id: 'c_huang_m', contact: 'huang', num: num('huang'), t: P('-4 12:40'), dir: 'missed', dur: 0, seen: true },
    { id: 'c_ea_4', contact: 'ea', num: num('ea'), t: P('-4 08:20'), dir: 'out', dur: 405 },
    { id: 'c_wwx_ft', contact: 'wwx', num: num('wwx'), t: P('-5 22:10'), dir: 'missed', dur: 0, video: true, seen: true },
    { id: 'c_huang_5', contact: 'huang', num: num('huang'), t: P('-5 19:35'), dir: 'in', dur: 182 },
    { id: 'c_mian', contact: 'mian', num: num('mian'), t: P('-5 16:00'), dir: 'out', dur: 860, ft: true },
    { id: 'c_jl_ft2', contact: 'jl', num: num('jl'), t: P('-6 20:00'), dir: 'out', dur: 492, video: true },
    { id: 'c_liu_6', contact: 'liu', num: num('liu'), t: P('-6 11:10'), dir: 'in', dur: 220 },
    { id: 'c_hq_7', contact: 'hq', num: num('hq'), t: P('-7 09:30'), dir: 'out', dur: 80 },
    { id: 'c_liu_9', contact: 'liu', num: num('liu'), t: P('-9 09:40'), dir: 'in', dur: 120 },
    { id: 'c_lxc_oct4', contact: 'lxc', num: num('lxc'), t: P('2026-10-04 21:30'), dir: 'in', dur: 1427 },
    { id: 'c_lxc_sep27', contact: 'lxc', num: num('lxc'), t: P('2026-09-27 21:05'), dir: 'out', dur: 751 },
  ]);

  JC.store.seed('voicemails', () => [
    { id: 'vm_wwx', contact: 'wwx', num: num('wwx'), t: P('+0 23:13'), dur: 14, heard: false,
      text: "pick up! …ok voicemail. um. sunday. I'll bring the soup. I mean, if— okay bye" },
    { id: 'vm_qr', contact: 'qr', num: num('qr'), t: P('-3 08:05'), dur: 17, heard: true,
      text: 'Jiang Cheng. This is Lan Qiren. I have sent the board’s letter to your email. I am telephoning to inform you that I have sent it. By email. Kindly read it, and reply by email. That is all.' },
    { id: 'vm_huang', contact: 'huang', num: num('huang'), t: P('-4 12:41'), dur: 21, heard: true,
      text: 'Boss. Huang here. East gate camera broken again, I fix already. No need call back. Also canteen auntie say you don’t eat lunch again. Eat lunch. …Okay. Bye-bye.' },
    { id: 'vm_ajie', contact: 'ajie', num: num('ajie'), t: P('2009-09-12 16:20'), dur: 26, heard: true, vintage: true,
      text: "A-Cheng! It's A-Jie. A-Ling said his first word today… okay it was 'ba' but I'm telling everyone it was 'jiujiu'. (laughs) Come home early, I made soup. A-Ling, say bye to jiujiu — ba! …Close enough. We love you. Bye-bye.",
      parts: [
        { who: 'ajie', text: "A-Cheng! It's A-Jie. A-Ling said his first word today… okay it was 'ba' but I'm telling everyone it was 'jiujiu'. (laughs) Come home early, I made soup. A-Ling, say bye to jiujiu —" },
        { who: 'baby', text: 'ba!' },
        { who: 'ajie', text: '…Close enough. We love you. Bye-bye.' },
      ] },
    { id: 'vm_mom', contact: 'mom', num: num('mom'), t: P('2008-07-19 18:12'), dur: 20, heard: true, vintage: true,
      text: "A-Cheng. It's your mother. You left your phone on silent again. …Dinner is at six. Your sister made the soup. Bring Wei Ying, he's at the lake. And stand up straight when you come in. …I'll see you at dinner." },
    { id: 'vm_dad', contact: 'dad', num: num('dad'), t: P('2008-06-28 06:52'), dur: 18, heard: true, vintage: true,
      text: "A-Cheng, it's Dad. The first lotus opened on the east pond this morning. I wanted you to see it before your mother has it cut for the table. …Come down when you wake up. Bring your brother. That's all." },
  ]);

  JC.store.seed('phonefavs', () => [
    { id: 'fav_jl', contact: 'jl', kind: 'call', num: num('jl') },
    { id: 'fav_ea', contact: 'ea', kind: 'call', num: num('ea') },
    { id: 'fav_huang', contact: 'huang', kind: 'call', num: num('huang') },
    { id: 'fav_hq', contact: 'hq', kind: 'call', num: num('hq') },
  ]);

  const GREETING = { custom: 'Jiang Cheng. Leave a message.', dflt: 'Your call has been forwarded to an automatic voice message system. Plus eight six, five five five, zero seven one six, zero five one five, is not available. At the tone, please record your message.' };

  // ══ Badge ════════════════════════════════════════════════════════
  const badge = () => { try { JC.story.phoneBadge(); } catch (e) { /* ignore */ } };
  JC.store.on('calls', badge);
  JC.store.on('voicemails', badge);
  JC.bus.on('boot', badge);

  // ══ Helpers ══════════════════════════════════════════════════════
  const K = () => JC.ckit;
  const F = (n) => JC.callui.fmtNum(n);
  function nameFor(r) {
    if (r.contact) return K().name(r.contact);
    return r.name || F(r.num) || 'Unknown';
  }
  function kindLabel(r) {
    if (r.video) return 'FaceTime Video';
    if (r.ft) return 'FaceTime Audio';
    if (r.contact) return K().labelFor(r.contact, r.num);
    if (r.name) return r.label || 'Maybe: ' + r.name;
    return 'Unknown';
  }
  function stamp(t) {
    const d = new Date(t), n = JC.time.date();
    const dd = U.dayDiff(d, n);
    if (dd <= 0) return U.fmtTime(d);
    if (dd === 1) return 'Yesterday';
    if (dd < 7) return U.DAYS[d.getDay()];
    return U.fmtDate(d, 'short');
  }
  function callBack(r) {
    if (r.contact) JC.callui.dial(r.contact, { num: r.num, video: !!r.video, ft: !!r.ft });
    else if (r.num) JC.callui.dialNumber(r.num);
    else JC.ui.alert({ title: 'No Caller ID', message: 'This caller\u2019s number wasn\u2019t available, so you can\u2019t call them back.', buttons: [{ text: 'OK' }] });
  }
  function groups(list) {
    const out = [];
    list.forEach((r) => {
      const last = out[out.length - 1];
      const key = (r.contact || r.num) + '|' + (r.dir === 'missed') + '|' + !!r.video + '|' + !!r.ft;
      if (last && last.key === key && U.sameDay(new Date(last.items[0].t), new Date(r.t))) last.items.push(r);
      else out.push({ key, items: [r], r });
    });
    return out;
  }

  // ══ App ══════════════════════════════════════════════════════════
  let lastTab = 'recents';

  JC.app({
    id: 'phone',
    name: 'Phone',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-phone');
      const offs = [];
      const pages = {};
      let tabs = null;
      let shown = true;
      const visible = (id) => shown && JC.os.isOpen('phone') && tabs && tabs.current() === id && !(JC.callui && JC.callui.isOpen());

      // ── Favorites ──
      function favRoot(nav) {
        let editing = false;
        const page = JC.ui.page({
          title: 'Favorites', large: true, bg: 'plain', cls: 'ph-favs',
          left: [JC.ui.navBtn({ icon: 'plus', label: 'Add Favorite', onTap: () => addFav() })],
          right: [JC.ui.navBtn({ text: 'Edit', cls: 'ph-editbtn', onTap: () => toggleEdit() })],
          content: () => {
            const list = K().favs().filter((f) => JC.contacts.get(f.contact) && !K().isHidden(f.contact));
            if (!list.length) return [JC.ui.empty({ icon: 'star', title: 'No Favorites', text: 'Add people you call often.', action: { text: 'Add Favorite', onTap: () => addFav() } })];
            const el = h('div.ph-favlist', { class: { editing } }, list.map((f) => favRow(f)));
            return [el];
          },
        });
        function toggleEdit() {
          editing = !editing;
          const b = page.right.querySelector('.ph-editbtn span');
          if (b) b.textContent = editing ? 'Done' : 'Edit';
          page.right.querySelector('.ph-editbtn').classList.toggle('prominent', editing);
          page.render();
        }
        function favRow(f) {
          const c = JC.contacts.get(f.contact);
          const icon = f.kind === 'video' ? 'video.fill' : f.kind === 'message' ? 'message.fill' : f.kind === 'mail' ? 'envelope.fill' : 'phone.fill';
          const sub = f.kind === 'video' ? 'FaceTime' : f.kind === 'message' ? 'message' : f.kind === 'mail' ? 'mail' : K().labelFor(f.contact, f.num);
          const act = () => {
            if (editing) return;
            if (f.kind === 'video') K().facetime(f.contact);
            else if (f.kind === 'message') K().message(f.contact);
            else if (f.kind === 'mail') K().mail(f.num || (c.emails[0] && c.emails[0].addr));
            else JC.callui.dial(f.contact, { num: f.num });
          };
          const handle = h('div.ph-handle', JC.icon('line.3.horizontal', { size: 20 }));
          const row = h('div.ph-favrow', { data: { id: f.id } },
            h('div.ph-del', { onTap: () => { JC.store.remove('phonefavs', f.id); } }, JC.icon('minus.circle.fill', { size: 22 })),
            h('div.ph-favmain', { onTap: act },
              JC.ui.avatar(f.contact, 44),
              h('div.ph-favtext', h('div.ph-favname', K().name(f.contact)), h('div.ph-favsub', JC.icon(icon, { size: 12 }), h('span', sub)))),
            h('div.ph-info', { onTap: () => nav.push(K().cardPage(f.contact)) }, JC.icon('info.circle', { size: 22 })),
            handle);
          reorder(handle, row);
          JC.ui.contextMenu(row.querySelector('.ph-favmain'), () => ({ items: [
            { text: 'Call', icon: 'phone.fill', onTap: () => JC.callui.dial(f.contact, { num: f.num }) },
            { text: 'Message', icon: 'message.fill', onTap: () => K().message(f.contact) },
            { text: 'FaceTime', icon: 'video.fill', onTap: () => K().facetime(f.contact) },
            '-',
            { text: 'Remove from Favorites', icon: 'trash', destructive: true, onTap: () => JC.store.remove('phonefavs', f.id) },
          ] }));
          return row;
        }
        function reorder(handle, row) {
          let startIdx = 0, rows = [], rowH = 64;
          U.drag(handle, {
            axis: 'y', threshold: 2,
            start: () => {
              if (!editing) return false;
              rows = Array.from(row.parentNode.children);
              startIdx = rows.indexOf(row);
              rowH = row.offsetHeight;
              row.classList.add('lifted');
            },
            move: (e, p) => {
              row.style.transform = `translateY(${p.dy}px)`;
              const to = U.clamp(Math.round(startIdx + p.dy / rowH), 0, rows.length - 1);
              rows.forEach((r, i) => {
                if (r === row) return;
                let shift = 0;
                if (i > startIdx && i <= to) shift = -rowH;
                if (i < startIdx && i >= to) shift = rowH;
                r.style.transform = shift ? `translateY(${shift}px)` : '';
              });
            },
            end: (e, p) => {
              const to = U.clamp(Math.round(startIdx + p.dy / rowH), 0, rows.length - 1);
              rows.forEach((r) => { r.style.transform = ''; });
              row.classList.remove('lifted');
              if (to === startIdx) return;
              const ids = rows.map((r) => r.dataset.id);
              const [m] = ids.splice(startIdx, 1);
              ids.splice(to, 0, m);
              const all = JC.store.all('phonefavs');
              JC.store.set('phonefavs', ids.map((id) => all.find((x) => x.id === id)).filter(Boolean).concat(all.filter((x) => !ids.includes(x.id))));
              JC.audio.haptic(8);
            },
          });
        }
        function addFav() {
          K().picker({ title: 'Add Favorite', onPick: (cid) => {
            if (cid === 'me') { JC.ui.toast('You can’t favorite yourself', { icon: 'star' }); return; }
            const c = K().get(cid);
            const acts = [];
            (c.phones || []).forEach((p) => acts.push({ text: 'Call ' + p.label + ' · ' + F(p.num), onTap: () => K().addFav(cid, 'call', p.num) }));
            if ((c.phones || []).length) {
              acts.push({ text: 'Message', onTap: () => K().addFav(cid, 'message') });
              acts.push({ text: 'FaceTime Video', onTap: () => K().addFav(cid, 'video') });
            }
            if ((c.emails || []).length) acts.push({ text: 'Mail ' + c.emails[0].addr, onTap: () => K().addFav(cid, 'mail', c.emails[0].addr) });
            if (!acts.length) { JC.ui.toast('No phone number or email', { icon: 'star' }); return; }
            JC.ui.actionSheet({ title: K().name(cid), message: 'Add to Favorites as…', actions: acts });
          } });
        }
        K().live(() => page.el, ['phonefavs', 'contactedits', 'contactsextra'], () => page.render());
        return (pages.favorites = page);
      }

      // ── Recents ──
      function recRoot(nav) {
        let filter = 0;
        let editing = false;
        const seg = JC.ui.segmented({ items: ['All', 'Missed'], value: 0, cls: 'ph-seg', onChange: (i) => { filter = i; page.render(); } });
        const editBtn = JC.ui.navBtn({ text: 'Edit', cls: 'ph-editbtn', onTap: () => setEdit(!editing) });
        const clearBtn = JC.ui.navBtn({ text: 'Clear', cls: 'ph-clearbtn', onTap: () => clearAll() });
        const page = JC.ui.page({
          title: 'Recents', large: true, bg: 'plain', cls: 'ph-recents',
          left: [editBtn],
          right: [clearBtn],
          content: () => content(),
          onShow: () => markSeen(),
        });
        clearBtn.hidden = true;
        page.navbar.appendChild(h('div.ph-navseg', seg));
        function setEdit(on) {
          editing = on;
          editBtn.querySelector('span').textContent = on ? 'Done' : 'Edit';
          editBtn.classList.toggle('prominent', on);
          clearBtn.hidden = !on;
          page.render();
        }
        function clearAll() {
          JC.ui.actionSheet({ actions: [{ text: 'Clear All Recents', style: 'destructive', onTap: () => { JC.store.set('calls', []); setEdit(false); badge(); } }] });
        }
        function content() {
          const all = JC.store.all('calls').slice().sort((a, b) => b.t - a.t);
          const list = filter ? all.filter((r) => r.dir === 'missed') : all;
          if (!list.length) return [JC.ui.empty({ icon: filter ? 'phone.arrow.down.left' : 'clock', title: filter ? 'No Missed Calls' : 'No Recents' })];
          const rows = groups(list).map((g) => recRow(g));
          if (visible('recents')) setTimeout(markSeen, 0);
          return [JC.ui.list([{ rows }], { style: 'plain', cls: 'ph-reclist' + (editing ? ' editing' : '') })];
        }
        function delGroup(g) {
          const ids = g.items.map((x) => x.id);
          JC.store.set('calls', JC.store.all('calls').filter((x) => !ids.includes(x.id)));
          badge();
        }
        function info(g) {
          const ids = g.items.map((x) => x.id);
          if (g.r.contact && JC.contacts.get(g.r.contact)) nav.push(K().cardPage(g.r.contact, { calls: ids, num: g.r.num }));
          else nav.push(K().numberPage(g.r.num, { calls: ids, name: g.r.name, label: g.r.label }));
        }
        function recRow(g) {
          const r = g.r;
          const missed = r.dir === 'missed';
          const n = g.items.length;
          const title = h('span.ph-rname', { class: { missed } }, nameFor(r), n > 1 ? h('span.ph-count', ' (' + n + ')') : null);
          const lead = h('div.ph-rlead',
            editing ? h('div.ph-rdel', { onTap: (e) => { e.stopPropagation(); delGroup(g); } }, JC.icon('minus.circle.fill', { size: 22 })) : null,
            r.dir === 'out' && !editing ? JC.icon('phone.arrow.up.right', { size: 14, cls: 'ph-outic' }) : h('span.ph-outsp'),
            r.contact && JC.contacts.get(r.contact) ? JC.ui.avatar(r.contact, 38) : K().blankAvatar(38));
          return {
            leading: lead,
            title,
            subtitle: h('span.ph-rsub', r.video ? JC.icon('video.fill', { size: 12 }) : r.ft ? JC.icon('phone.fill', { size: 11 }) : null, kindLabel(r)),
            detail: stamp(r.t),
            info: () => info(g),
            cls: 'ph-rrow',
            onTap: () => { if (!editing) callBack(r); },
            swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => delGroup(g) }],
            menu: () => ({ items: [
              { text: r.video ? 'FaceTime Video' : 'Call', icon: r.video ? 'video.fill' : 'phone.fill', onTap: () => callBack(r) },
              r.contact ? { text: 'Send Message', icon: 'message.fill', onTap: () => K().message(r.contact) } : null,
              { text: 'Copy Number', icon: 'doc.on.doc', onTap: () => { U.copy(r.num || ''); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
              { text: 'Info', icon: 'info.circle', onTap: () => info(g) },
              '-',
              { text: 'Delete from Recents', icon: 'trash', destructive: true, onTap: () => delGroup(g) },
            ].filter(Boolean) }),
          };
        }
        K().live(() => page.el, ['calls', 'contactedits', 'contactsextra'], () => page.render());
        return (pages.recents = page);
      }
      function markSeen() {
        if (!visible('recents')) return;
        const all = JC.store.all('calls');
        if (!all.some((c) => c.dir === 'missed' && !c.seen)) return;
        JC.store.set('calls', all.map((c) => (c.dir === 'missed' && !c.seen ? Object.assign({}, c, { seen: true }) : c)));
        JC.notify.seen({ app: 'phone' });
        badge();
      }

      // ── Keypad ──
      let pad = { num: '', refresh: null };
      function padRoot(nav) {
        const display = h('div.ph-num');
        const under = h('div.ph-under');
        const L = { 1: '', 2: 'A B C', 3: 'D E F', 4: 'G H I', 5: 'J K L', 6: 'M N O', 7: 'P Q R S', 8: 'T U V', 9: 'W X Y Z', '*': '', 0: '+', '#': '' };
        function press(k) {
          if (pad.num.length >= 24) return;
          JC.audio.dtmf(k === '+' ? '0' : k);
          JC.audio.haptic(5);
          pad.num += k;
          paint();
        }
        function key(k) {
          const el = h('div.ph-key', { data: { k }, onTap: () => press(k) },
            h('div.ph-keyn', { class: { star: k === '*', hash: k === '#' } }, k),
            L[k] !== undefined ? h('div.ph-keyl', { class: { plus: k === '0' } }, L[k] || (k === '1' ? h('span.ph-vmglyph', JC.icon('recordingtape', { size: 13 })) : '')) : null);
          if (k === '0') U.longPress(el, () => press('+'), 450);
          if (k === '1') U.longPress(el, () => { JC.audio.haptic(10); tabs.select('voicemail'); JC.ui.toast('Calling Voicemail…', { icon: 'recordingtape' }); }, 600);
          return el;
        }
        const del = h('div.ph-delkey', { onTap: () => { pad.num = pad.num.slice(0, -1); JC.audio.play('key.delete'); paint(); } }, JC.icon('delete.left.fill', { size: 28 }));
        U.longPress(del, () => { pad.num = ''; paint(); }, 600);
        const callBtn = h('div.ph-callkey', { onTap: () => dialPad() }, JC.icon('phone.fill', { size: 34 }));
        function dialPad() {
          if (!pad.num) {
            const last = JC.store.all('calls').filter((r) => r.dir === 'out').sort((a, b) => b.t - a.t)[0];
            if (last) { pad.num = F(last.num).replace(/\s/g, '') || ''; paint(); JC.audio.play('tap'); }
            return;
          }
          const n = pad.num;
          if (JC.callui.dialNumber(n) !== false) { pad.num = ''; setTimeout(paint, 400); }
        }
        function paint() {
          display.textContent = F(pad.num);
          display.classList.toggle('long', pad.num.length > 13);
          del.classList.toggle('show', !!pad.num);
          under.innerHTML = '';
          if (!pad.num) return;
          const cid = K().findByNumber(pad.num);
          const biz = JC.callui.bizFor(pad.num);
          if (cid) under.appendChild(h('div.ph-match', { onTap: () => nav.push(K().cardPage(cid)) }, K().name(cid)));
          else if (biz) under.appendChild(h('div.ph-match', { onTap: () => nav.push(K().numberPage(pad.num)) }, biz.name));
          else under.appendChild(h('div.ph-addnum', { onTap: () => addNumber() }, 'Add Number'));
        }
        function addNumber() {
          const n = pad.num;
          JC.ui.actionSheet({ title: F(n), actions: [
            { text: 'Create New Contact', onTap: () => K().editor(null, { prefill: { phones: [{ label: 'mobile', num: F(n) }] }, onSave: (id) => nav.push(K().cardPage(id)) }) },
            { text: 'Add to Existing Contact', onTap: () => K().addToExisting(n, (id) => nav.push(K().cardPage(id))) },
          ] });
        }
        JC.ui.contextMenu(display, () => ({ items: [
          pad.num ? { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(pad.num); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } } : null,
          { text: 'Paste', icon: 'doc.on.clipboard', onTap: () => paste() },
        ].filter(Boolean) }));
        function paste() {
          const done = (t) => { const d = String(t || '').replace(/[^\d+*#]/g, ''); if (d) { pad.num = d.slice(0, 24); paint(); } else JC.ui.toast('Nothing to paste', { icon: 'doc.on.doc' }); };
          try { if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(done, () => done('')); else done(''); } catch (e) { done(''); }
        }
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key);
        const page = JC.ui.page({
          title: 'Keypad', navbar: false, bg: 'plain', cls: 'ph-keypad',
          content: () => [h('div.ph-pad',
            h('div.ph-numwrap', display, under),
            h('div.ph-keys', keys),
            h('div.ph-bottom', h('div.ph-side'), callBtn, h('div.ph-side', del)))],
        });
        pad.refresh = paint;
        paint();
        return (pages.keypad = page);
      }
      const onKey = (e) => {
        if (!visible('keypad') || JC.kb.visible || (JC.callui && JC.callui.isOpen())) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (/^[0-9*#+]$/.test(e.key)) { e.preventDefault(); const el = win.body.querySelector(`.ph-key[data-k="${e.key === '+' ? '0' : e.key}"]`); if (el) { el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 120); } if (pad.num.length < 24) { JC.audio.dtmf(e.key === '+' ? '0' : e.key); pad.num += e.key; pad.refresh && pad.refresh(); } }
        else if (e.key === 'Backspace') { e.preventDefault(); pad.num = pad.num.slice(0, -1); pad.refresh && pad.refresh(); }
        else if (e.key === 'Enter') { e.preventDefault(); const b = win.body.querySelector('.ph-callkey'); if (b) b.click(); }
      };
      window.addEventListener('keydown', onKey);

      // ── Voicemail ──
      let vmOpen = null; // expanded voicemail id
      let vmPlayer = null;
      let vmSpeaker = false;
      function stopVm() { if (vmPlayer) { vmPlayer.destroy(); vmPlayer = null; } }
      function vmName(v) { return v.contact ? K().name(v.contact) : F(v.num) || 'Unknown'; }
      function vmRoot(nav) {
        const page = JC.ui.page({
          title: 'Voicemail', large: true, bg: 'plain', cls: 'ph-vm',
          left: [JC.ui.navBtn({ text: 'Greeting', onTap: () => greeting() })],
          content: () => vmContent(nav, false),
          onHide: () => { stopVm(); },
        });
        K().live(() => page.el, ['voicemails', 'contactedits'], () => { if (!vmPlayer || !vmPlayer.playing) { stopVm(); page.render(); } else markRows(page); });
        return (pages.voicemail = page);
      }
      function markRows(page) {
        page.content.querySelectorAll('.ph-vmrow').forEach((r) => {
          const v = JC.store.get('voicemails', r.dataset.id);
          if (v) r.classList.toggle('unheard', !v.heard);
        });
      }
      function vmContent(nav, deleted) {
        const all = JC.store.all('voicemails').filter((v) => !!v.deleted === deleted).sort((a, b) => b.t - a.t);
        const out = [];
        if (!all.length) out.push(JC.ui.empty({ icon: 'recordingtape', title: deleted ? 'No Deleted Messages' : 'No Voicemail', text: deleted ? null : 'Voicemail you receive appears here.' }));
        else {
          const body = h('div.ph-vmlist');
          all.forEach((v) => body.appendChild(vmItem(v, nav, deleted)));
          out.push(body);
          if (!deleted) out.push(h('div.ph-vmfoot', 'Transcriptions are generated on iPhone and may not be accurate.'));
        }
        const delN = JC.store.all('voicemails').filter((v) => v.deleted).length;
        if (!deleted && delN) {
          out.push(JC.ui.list([{ rows: [{ title: 'Deleted Messages', detail: String(delN), chevron: true, onTap: () => nav.push(deletedPage(nav)) }] }], { style: 'plain', cls: 'ph-vmdel' }));
        }
        return out;
      }
      function deletedPage(nav) {
        const page = JC.ui.page({
          title: 'Deleted', bg: 'plain', cls: 'ph-vm ph-vmdeleted',
          right: [JC.ui.navBtn({ text: 'Clear All', onTap: () => JC.ui.actionSheet({ actions: [{ text: 'Clear All Deleted Messages', style: 'destructive', onTap: () => { stopVm(); JC.store.set('voicemails', JC.store.all('voicemails').filter((v) => !v.deleted)); } }] }) })],
          content: () => vmContent(nav, true),
          onHide: () => stopVm(),
        });
        K().live(() => page.el, ['voicemails'], () => { if (!vmPlayer || !vmPlayer.playing) { stopVm(); page.render(); } });
        return page;
      }
      function vmItem(v, nav, deleted) {
        const open = vmOpen === v.id;
        const wrap = h('div.ph-vmrow', { class: { open, unheard: !v.heard, family: !!v.vintage }, data: { id: v.id } });
        const head = JC.ui.row({
          leading: h('div.ph-vmdot'),
          title: h('span.ph-vmname', vmName(v)),
          subtitle: v.contact ? K().labelFor(v.contact, v.num) : 'unknown',
          right: h('div.ph-vmright', h('div.ph-vmdate', stamp(v.t)), h('div.ph-vmdur', U.fmtDur(v.dur))),
          info: () => (v.contact && JC.contacts.get(v.contact) ? nav.push(K().cardPage(v.contact)) : nav.push(K().numberPage(v.num))),
          onTap: () => toggleVm(v, wrap, nav, deleted),
          swipe: deleted ? [{ text: 'Undelete', color: 'var(--blue)', icon: 'arrow.uturn.left', onTap: () => undelete(v) }] : [{ text: 'Delete', color: 'var(--red)', icon: 'trash', onTap: () => delVm(v) }],
          cls: 'ph-vmhead',
        });
        wrap.appendChild(head);
        if (open) wrap.appendChild(vmPanel(v, nav, deleted));
        return wrap;
      }
      function toggleVm(v, wrap, nav, deleted) {
        const list = wrap.parentNode;
        const wasOpen = vmOpen === v.id;
        stopVm();
        list.querySelectorAll('.ph-vmrow.open').forEach((r) => {
          r.classList.remove('open');
          const pnl = r.querySelector('.ph-vmpanel');
          if (pnl) U.anim(pnl, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).then(() => pnl.remove());
        });
        vmOpen = wasOpen ? null : v.id;
        if (!wasOpen) {
          wrap.classList.add('open');
          const pnl = vmPanel(v, nav, deleted);
          wrap.appendChild(pnl);
          U.anim(pnl, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
        }
      }
      function vmPanel(v, nav, deleted) {
        const parts = v.parts || [{ who: v.contact || 'unknown', text: v.text || '' }];
        const words = h('div.ph-vmtext');
        const time0 = h('span.ph-t0', '0:00');
        const time1 = h('span.ph-t1', '-' + U.fmtDur(v.dur));
        let drag = false;
        const slider = JC.ui.slider({ value: 0, min: 0, max: v.dur, step: 0.1, cls: 'ph-vmslider',
          onInput: (t) => { drag = true; if (vmPlayer && vmPlayer.playing) { vmPlayer._resume = true; vmPlayer.pause(); } paintT(t); if (vmPlayer) vmPlayer.seek(t); },
          onChange: (t) => { drag = false; if (vmPlayer) { vmPlayer.seek(t); if (vmPlayer._resume) { vmPlayer._resume = false; vmPlayer.play(); setPlayIcon(); } } } });
        const playBtn = h('div.ph-vmplay', { onTap: () => togglePlay() }, JC.icon('play.fill', { size: 22 }));
        const spk = h('div.ph-vmbtn', { class: { on: vmSpeaker }, onTap: () => { vmSpeaker = !vmSpeaker; spk.classList.toggle('on', vmSpeaker); if (vmPlayer) vmPlayer.setGain(vmSpeaker ? 1 : 0.55); JC.ui.toast(vmSpeaker ? 'Speaker' : 'iPhone', { icon: vmSpeaker ? 'speaker.wave.2.fill' : 'iphone' }); } }, JC.icon('speaker.wave.2.fill', { size: 19 }), h('span', 'speaker'));
        const cb = h('div.ph-vmbtn', { onTap: () => { stopVm(); if (v.contact) JC.callui.dial(v.contact, { num: v.num }); else JC.callui.dialNumber(v.num); } }, JC.icon('phone.fill', { size: 18 }), h('span', 'call back'));
        const tr = deleted
          ? h('div.ph-vmbtn.blue', { onTap: () => undelete(v) }, JC.icon('arrow.uturn.left', { size: 18 }), h('span', 'undelete'))
          : h('div.ph-vmbtn.red', { onTap: () => delVm(v) }, JC.icon('trash', { size: 18 }), h('span', 'delete'));
        const shareB = h('div.ph-vmshare', { onTap: () => shareVm(v) }, JC.icon('square.and.arrow.up', { size: 19 }));
        function ensure() {
          if (vmPlayer && vmPlayer.vmId === v.id) return vmPlayer;
          stopVm();
          vmPlayer = JC.voiceBed.player({
            parts, dur: v.dur, seed: v.id, vintage: !!v.vintage,
            gain: vmSpeaker ? 1 : 0.55,
            onTick: (t) => { if (!drag) { slider.set(t); paintT(t); } },
            onEnd: () => { setPlayIcon(); paintT(v.dur); },
          });
          vmPlayer.vmId = v.id;
          drawWords(-1);
          return vmPlayer;
        }
        function togglePlay() {
          const p = ensure();
          if (p.playing) p.pause();
          else {
            p.play();
            if (!v.heard) {
              JC.store.update('voicemails', v.id, { heard: true });
              const row = playBtn.closest('.ph-vmrow');
              if (row) row.classList.remove('unheard');
            }
            JC.story.act('voicemail_play', { id: v.id });
          }
          setPlayIcon();
        }
        function setPlayIcon() {
          playBtn.innerHTML = '';
          playBtn.appendChild(JC.icon(vmPlayer && vmPlayer.playing ? 'pause.fill' : 'play.fill', { size: 22 }));
        }
        let lastW = -2;
        function drawWords(idx) {
          if (idx === lastW && words.childNodes.length) return;
          lastW = idx;
          if (!words.childNodes.length) {
            const tl = (vmPlayer && vmPlayer.vmId === v.id ? vmPlayer : ensureTl()).tl;
            tl.segs.forEach((sg) => words.appendChild(sg.br ? document.createTextNode(' ') : h('span', { class: { w: sg.wi != null || sg.pw >= 0, ev: !!sg.ev }, data: sg.wi != null ? { wi: sg.wi } : sg.pw >= 0 ? { wi: sg.pw } : undefined }, sg.s)));
          }
          words.querySelectorAll('span.w').forEach((s) => s.classList.toggle('on', +s.dataset.wi <= idx));
        }
        let tlOnly = null;
        function ensureTl() { if (!tlOnly) tlOnly = { tl: JC.voiceBed.timeline(parts, v.dur, v.id) }; return tlOnly; }
        function paintT(t) {
          time0.textContent = U.fmtDur(t);
          time1.textContent = '-' + U.fmtDur(Math.max(0, v.dur - t));
          if (vmPlayer && vmPlayer.vmId === v.id) drawWords(vmPlayer.wordAt(t));
        }
        drawWords(-1);
        const panel = h('div.ph-vmpanel',
          h('div.ph-vmtranscript', h('div.ph-vmtlabel', v.vintage ? 'Saved voicemail · from an older iPhone' : 'Transcription'), words),
          h('div.ph-vmplayer', playBtn, h('div.ph-vmscrub', slider, h('div.ph-vmtimes', time0, time1)), shareB),
          h('div.ph-vmbtns', spk, cb, tr));
        return panel;
      }
      function delVm(v, sure) {
        if (v.vintage && !sure) {
          JC.ui.alert({ title: 'Delete Voicemail?', message: 'This voicemail from ' + vmName(v) + ' was saved in ' + new Date(v.t).getFullYear() + '. It will move to Deleted Messages.', buttons: [{ text: 'Keep', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => delVm(v, true) }] });
          return;
        }
        if (vmOpen === v.id) { stopVm(); vmOpen = null; }
        JC.store.update('voicemails', v.id, { deleted: true, delAt: JC.time.now(), wasHeard: !!v.heard, heard: true });
        JC.ui.toast('Moved to Deleted Messages', { icon: 'trash' });
      }
      function undelete(v) {
        if (vmOpen === v.id) { stopVm(); vmOpen = null; }
        JC.store.update('voicemails', v.id, { deleted: false, heard: v.wasHeard !== false });
        JC.ui.toast('Voicemail restored', { icon: 'arrow.uturn.left' });
      }
      function shareVm(v) {
        JC.ui.share({
          title: 'Voicemail — ' + vmName(v), subtitle: U.fmtDur(v.dur) + ' · ' + U.fmtDate(v.t, 'medium'), icon: 'recordingtape',
          payload: { kind: 'text', text: v.text },
          onShareTo: (cid, th) => {
            JC.story.send(th, { voice: { dur: v.dur, text: v.text } });
            JC.audio.play('send');
            JC.ui.toast('Sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' });
          },
        });
      }
      function greeting() {
        const cur = (JC.store.get('vmgreeting', 'greeting') || { mode: 'custom' }).mode;
        let mode = cur;
        let gp = null;
        const s = JC.ui.sheet({
          title: 'Greeting', detent: 'medium', cls: 'ph-greet',
          left: { text: 'Cancel' },
          right: { text: 'Save', onTap: () => { JC.store.add('vmgreeting', { id: 'greeting', mode }); JC.ui.toast('Greeting saved', { icon: 'checkmark' }); } },
          onClose: () => gp && gp.destroy(),
          content: () => [
            JC.ui.list([{ rows: [
              { title: 'Default', check: mode === 'default', onTap: () => { mode = 'default'; s.render(); } },
              { title: 'Custom', check: mode === 'custom', onTap: () => { mode = 'custom'; s.render(); } },
            ] }]),
            mode === 'custom' ? h('div.ph-greetq', '“' + GREETING.custom + '”') : h('div.ph-greetq.dim', 'Default: callers hear your phone number.'),
            h('div.ph-greetbtns',
              h('div.ph-gbtn', { onTap: () => {
                if (gp) gp.destroy();
                gp = JC.voiceBed.player(mode === 'custom' ? { who: 'me', text: GREETING.custom, dur: 3.2, seed: 'greet' } : { who: 'sys', text: GREETING.dflt, dur: 11, seed: 'greetd' });
                gp.play(0);
              } }, JC.icon('play.fill', { size: 17 }), h('span', 'Play')),
              mode === 'custom' ? h('div.ph-gbtn.red', { onTap: () => JC.ui.alert({ title: 'Record a New Greeting?', message: 'Callers would hear your voice instead of Jiang Cheng’s.', buttons: [{ text: 'Keep His', style: 'cancel' }] }) }, JC.icon('record.circle', { size: 18 }), h('span', 'Record')) : null),
          ],
        });
      }

      // ── tabs ──
      tabs = JC.ui.tabs(win.body, {
        tabs: [
          { id: 'favorites', title: 'Favorites', icon: 'star.fill', root: favRoot },
          { id: 'recents', title: 'Recents', icon: 'clock.fill', root: recRoot },
          { id: 'contacts', title: 'Contacts', icon: 'person.crop.circle.fill', root: (nav) => (pages.contacts = K().listPage({ nav, title: 'Contacts', cls: 'ph-contacts' })) },
          { id: 'keypad', title: 'Keypad', icon: 'keypad', root: padRoot },
          { id: 'voicemail', title: 'Voicemail', icon: 'recordingtape', root: vmRoot },
        ],
        active: lastTab,
        onChange: (id) => {
          lastTab = id;
          if (id !== 'voicemail') stopVm();
          if (id === 'recents') setTimeout(markSeen, 0);
        },
      });
      function tabBadges() {
        const missed = JC.store.all('calls').filter((c) => c.dir === 'missed' && !c.seen).length;
        const vm = JC.store.all('voicemails').filter((v) => !v.heard && !v.deleted).length;
        tabs.badge('recents', missed);
        tabs.badge('voicemail', vm);
      }
      tabBadges();
      offs.push(JC.store.on('calls', tabBadges), JC.store.on('voicemails', tabBadges));
      offs.push(JC.bus.on('story:call', (c) => { if (c && c.phase === 'ended') setTimeout(markSeen, 1900); }));

      function selectTab(id) {
        if (!id) return;
        const map = { fav: 'favorites', favourites: 'favorites', recent: 'recents', calls: 'recents', keys: 'keypad', vm: 'voicemail' };
        id = map[id] || id;
        tabs.select(id);
        const n = tabs.nav(id);
        while (n && n.depth() > 1) n.pop({ instant: true });
      }
      function openVm(id) {
        selectTab('voicemail');
        vmOpen = id;
        if (pages.voicemail) pages.voicemail.render();
      }

      return {
        intent(i) {
          if (!i) return;
          if (i.tab) selectTab(i.tab);
          if (i.call) { selectTab('recents'); setTimeout(() => (JC.contacts.get(i.call) ? JC.callui.dial(i.call, { video: !!i.video }) : JC.callui.dialNumber(i.call)), 350); }
          if (i.number) { selectTab('keypad'); pad.num = String(i.number).replace(/[^\d+*#]/g, ''); pad.refresh && pad.refresh(); }
          if (i.contact) { selectTab('contacts'); tabs.nav('contacts').push(JC.contacts.get(i.contact) ? K().cardPage(i.contact) : K().numberPage(i.contact)); }
          if (i.id) {
            if (JC.store.get('voicemails', i.id)) openVm(i.id);
            else if (JC.store.get('calls', i.id)) selectTab('recents');
          }
        },
        show() {
          shown = true;
          if (tabs.current() === 'recents') setTimeout(markSeen, 0);
          if (pad.refresh) pad.refresh();
        },
        hide() { shown = false; stopVm(); },
        destroy() { stopVm(); offs.forEach((o) => o()); window.removeEventListener('keydown', onKey); },
      };
    },
  });

  JC.icon.add({
    'arrow.uturn.left': '<path d="M9 14 4.5 9.5 9 5"/><path d="M4.5 9.5h10a5 5 0 0 1 0 10H11"/>',
    'doc.on.clipboard': '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5v-.8c0-.6.4-1 1-1h4c.6 0 1 .4 1 1v.8M9 10h6M9 13.5h6M9 17h4"/>',
  });
})();
