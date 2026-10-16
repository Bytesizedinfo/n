/* Messages — the conversation screen: header, bubbles (incremental), typing, story reply tray, composer,
   attachments, effects, tapbacks, select mode, image viewer. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const M = (JC.msgApp = JC.msgApp || {});

  JC.icon.add({
    'msg.sticker': '<path d="M14.5 20.5H8a4.5 4.5 0 0 1-4.5-4.5V8A4.5 4.5 0 0 1 8 3.5h8A4.5 4.5 0 0 1 20.5 8v6.5z"/><path d="M20.5 14.5h-3a3 3 0 0 0-3 3v3"/><circle cx="9.3" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14.7" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M9 14c.8.8 1.8 1.2 3 1.2"/>',
    'msg.clock.send': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    'msg.hand.thumbsdown': '<path d="M7 13.5V4.5"/>',
  });

  const HINTS = {
    nhs: 'He notices everything. Reply like Jiang Cheng would: short, blunt, no emoji. Never guess at shared history.',
    wwx: 'He expects to be insulted. Kindness all at once is the fastest way to get caught. Threats are love.',
    jl: 'Threaten his legs. Never call him sweetie. Never use an emoji.',
    lxc: 'He is perceptive, but too kind to accuse you. Gentle and brief is safe here.',
    lwj: 'Lan Wangji says little and misses nothing. Say less.',
    wn: 'Wen Ning is too frightened to accuse anyone — but a phone call would give you away.',
    sz: 'Polite, warm, a little stern. Jiang Cheng is never unkind to Sizhui.',
    jy: 'Jingyi expects to be yelled at. Oblige him.',
    mian: 'An old friend who reads between the lines. Dry is good.',
    ea: 'Nine years as his assistant. Brief and decisive — he never says please.',
    huang: 'He has known Jiang Cheng since he was a boy. Short replies. A thumbs-up is not his style.',
    liu: 'Work voice: brief, decisive, no "please".',
    bai: 'He is already terrified. Jiang Cheng is curt, not cruel.',
    qr: 'Formal, curt, correct punctuation.',
  };
  const LEVELS = [
    [0, 'suspects nothing.'], [2, 'hasn’t noticed anything.'], [4, 'is starting to wonder…'],
    [6, 'is getting suspicious.'], [8, 'is very suspicious.'], [10, 'is onto you.'],
  ];
  M.susText = (cid) => {
    const v = JC.story.sus(cid);
    let t = LEVELS[0][1];
    LEVELS.forEach(([n, s]) => { if (v >= n) t = s; });
    return { v, title: JC.contacts.short(cid) + ' ' + t, hint: HINTS[cid] || 'Reply like Jiang Cheng would: short, blunt, no emoji.' };
  };

  function parseLabel(label, text) {
    label = label || text || '';
    const m = label.match(/^(.*?)\s*\[([^\]]+)\]\s*(.*)$/);
    if (!m) return { main: label.trim(), hint: '' };
    return { main: (m[1] + ' ' + m[3]).trim(), hint: m[2].trim() };
  }
  function silentIcon(s) {
    if (/on read|ignore|say nothing|silent|don.t reply|no reply/i.test(s)) return 'eye.slash';
    if (/close|leave|exit/i.test(s)) return 'xmark';
    if (/phone|face down/i.test(s)) return 'iphone';
    if (/photo|picture|send/i.test(s)) return 'photo';
    if (/remove|kick/i.test(s)) return 'person.2.fill';
    return 'hand.raised';
  }

  /**
   * Build a conversation. app = { nav, win, isVisible(), openDetails(tid), openCompose(prefill), openThread(tid, o), layer() }
   */
  M.conversation = (app, tid, opts) => {
    opts = opts || {};
    const conv = { tid, destroyed: false, shown: false };
    const group = M.isGroup(tid);
    const dead = M.isDead(tid);
    const sms = M.isSMS(tid) || dead;
    const nodes = new Map();
    let rendered = false;
    let stick = true;
    const sendingUntil = {};
    const openTranscripts = new Set();
    let selected = null;
    let attachment = null;
    let replyTo = null;
    let picking = false;
    let trayKey = null;
    let trayCollapsed = false;
    let timerInt = 0;
    let petalsShown = false;

    // ── page ───────────────────────────────────────────────────────────────
    const page = JC.ui.page({
      cls: 'msg-conv' + (sms ? ' sms' : '') + (dead ? ' dead' : ''),
      navbar: false,
      bg: 'plain',
      onShow: () => conv.onShow(),
      onHide: () => conv.onHide(),
      onClose: () => conv.destroy(),
    });
    conv.page = page;
    const scroller = page.scroll;
    scroller.classList.add('msg-scroll');
    const list = h('div.msg-list');
    const after = h('div.msg-after');
    page.content.append(list, after);

    // header
    const backCount = h('span.msg-back-n');
    const backBtn = JC.ui.navBtn({ icon: 'chevron.left', cls: 'back msg-back', weight: 2.4, iconSize: 20, label: 'Back', onTap: () => app.nav.pop() });
    backBtn.appendChild(backCount);
    const headAv = h('div.msg-head-av');
    const headName = h('span.msg-head-nm');
    const susWrap = h('div.msg-sus-wrap');
    const center = h('div.msg-head-center', { onTap: () => app.openDetails(tid, conv) },
      headAv, h('div.msg-head-name', headName, JC.icon('chevron.right', { size: 10, weight: 2.8 })), susWrap);
    const videoBtn = JC.ui.navBtn({ icon: 'video', iconSize: 21, label: 'FaceTime', onTap: (e) => faceTime(e) });
    const cancelSel = JC.ui.navBtn({ text: 'Cancel', cls: 'msg-selcancel', onTap: () => exitSelect() });
    const progress = h('div.msg-progress', h('i'));
    const head = h('div.msg-head', h('div.msg-head-bg'), h('div.msg-head-l', backBtn), center, h('div.msg-head-r', videoBtn, cancelSel), progress);

    // typing indicator
    const typingAv = h('div.msg-av-slot');
    const typingRow = h('div.msg-typing-row', { hidden: true }, typingAv, h('div.msg-typing', h('i'), h('i'), h('i')));
    after.appendChild(typingRow);

    // new-message pill
    const newPill = h('div.msg-newpill', { hidden: true, onTap: () => { toBottom(true); newPill.hidden = true; } }, JC.icon('arrow.down', { size: 14, weight: 2.4 }), h('span', 'New Message'));

    // ── composer ───────────────────────────────────────────────────────────
    const tray = h('div.msg-tray', { hidden: true });
    const replyBox = h('div.msg-replyctx', { hidden: true });
    const attachBox = h('div.msg-attach', { hidden: true });
    const field = JC.ui.input({
      multiline: true, rows: 1, send: true, enterkey: 'send', autoGrow: true, maxHeight: 128,
      placeholder: dead || M.isSMS(tid) ? 'Text Message • SMS' : 'iMessage',
      onInput: () => onFieldInput(),
      onSubmit: () => doSend(),
      onFocus: () => { setTimeout(kbSuggest, 0); if (stick) setTimeout(() => toBottom(false), 60); },
    });
    field.classList.add('msg-field');
    const micBtn = h('div.msg-mic', { onTap: () => JC.ui.toast('Dictation is off — that isn’t Jiang Cheng’s voice', { icon: 'mic.slash.fill' }) }, JC.icon('mic', { size: 20, weight: 1.9 }));
    const sendBtn = h('div.msg-send', { onTap: () => doSend() }, JC.icon('arrow.up', { size: 17, weight: 2.8 }));
    U.longPress(sendBtn, () => { if (field.value.trim()) openEffects(); });
    const fieldRow = h('div.msg-fieldrow', field, micBtn, sendBtn);
    const fieldWrap = h('div.msg-fieldwrap', replyBox, attachBox, fieldRow);
    const plusBtn = h('div.msg-plus', { attrs: { role: 'button', 'aria-label': 'Apps' }, onTap: () => openPlus() }, JC.icon('plus', { size: 22, weight: 2.1 }));
    const composer = h('div.msg-composer', plusBtn, fieldWrap);
    const selBar = h('div.msg-selbar', { hidden: true });
    const bottom = h('div.msg-bottom', tray, composer, selBar);
    page.el.append(head, bottom, newPill);
    conv.field = field;

    // ── header content ─────────────────────────────────────────────────────
    function renderHead() {
      headAv.innerHTML = '';
      headAv.appendChild(M.avatar(tid, 50));
      headName.textContent = M.name(tid);
      const n = M.unreadTotal(tid);
      backCount.textContent = n ? (n > 99 ? '99+' : String(n)) : '';
      backBtn.classList.toggle('cap', !!n);
      backBtn.classList.toggle('circ', !n);
      renderSus();
    }
    let susEl = null;
    function renderSus() {
      const cid = M.peer(tid);
      const want = !!JC.state.d.settings.showSus && !!cid && !dead && !M.isService(tid) && JC.story.canReply(tid);
      if (want && susEl && susEl.isConnected) { updateSus(); return; }
      susWrap.innerHTML = '';
      susEl = null;
      if (!want) return;
      const segs = [0, 1, 2, 3, 4].map(() => h('i'));
      susEl = h('div.msg-sus', { onTap: (e) => { e.stopPropagation(); susPopover(cid); } }, JC.icon('eye', { size: 12, weight: 2.2 }), h('div.msg-sus-segs', segs));
      susEl._segs = segs;
      susWrap.appendChild(susEl);
      updateSus();
    }
    function updateSus() {
      if (!susEl) return;
      const v = JC.story.sus(M.peer(tid));
      const n = Math.min(5, Math.ceil(v / 2));
      susEl._segs.forEach((s, i) => s.classList.toggle('on', i < n));
      susEl.dataset.lv = String(n);
    }
    function susPopover(cid) {
      const info = M.susText(cid);
      const layer = page.el;
      const back = h('div.msg-pop-back', { onTap: () => close() });
      const pop = h('div.msg-pop',
        h('div.msg-pop-arrow'),
        h('div.msg-pop-k', JC.icon('eye', { size: 13, weight: 2.2 }), 'SUSPICION ', h('b', info.v + ' / 10')),
        h('div.msg-pop-t', info.title),
        h('div.msg-pop-s', info.hint),
        h('div.msg-pop-meter', h('i', { style: { width: Math.min(100, info.v * 10) + '%' } })));
      layer.append(back, pop);
      U.anim(pop, [{ opacity: 0, transform: 'translateX(-50%) scale(.7)' }, { opacity: 1, transform: 'translateX(-50%) scale(1)' }], { duration: 300, easing: U.SPRING });
      function close() { back.remove(); U.anim(pop, [{ opacity: 1 }, { opacity: 0 }], { duration: 150 }).then(() => pop.remove()); }
      conv._closePop = close;
    }
    conv.onSus = (p) => {
      if (!susEl || p.cid !== M.peer(tid)) return;
      updateSus();
      if (p.delta > 0) {
        susEl.classList.remove('flash');
        void susEl.offsetWidth;
        susEl.classList.add('flash');
        JC.audio.haptic([15, 40, 15]);
        setTimeout(() => susEl && susEl.classList.remove('flash'), 1600);
      }
    };

    function faceTime(e) {
      if (!group) {
        const cid = M.peer(tid);
        const c = JC.contacts.get(cid);
        if (c && c.service) { JC.ui.alert({ title: 'FaceTime Unavailable', message: JC.contacts.name(cid) + ' is not available on FaceTime.', buttons: [{ text: 'OK' }] }); return; }
        JC.story.dial(cid, { video: true });
        return;
      }
      JC.ui.menu(e.currentTarget, [
        { text: 'FaceTime Video', icon: 'video.fill', onTap: () => pickMember('Start FaceTime with…', (cid) => JC.story.dial(cid, { video: true })) },
        { text: 'FaceTime Audio', icon: 'phone.fill', onTap: () => pickMember('Call…', (cid) => JC.story.dial(cid)) },
      ]);
    }
    function pickMember(title, fn) {
      JC.ui.actionSheet({ title, actions: M.members(tid).map((cid) => ({ text: JC.contacts.name(cid), onTap: () => fn(cid) })) });
    }
    conv.pickMember = pickMember;

    // ── model ──────────────────────────────────────────────────────────────
    function model() {
      const hidden = M.prefMap('hidden:' + tid);
      const quotes = M.prefMap('quotes');
      const msgs = JC.story.messages(tid).filter((m) => !hidden[m.id]);
      const ids = new Set(msgs.map((m) => m.id));
      const replies = {};
      msgs.forEach((m) => { const q = quotes[m.id]; if (q && ids.has(q)) (replies[q] = replies[q] || []).push(m.id); });
      const items = [];
      let prev = null;
      msgs.forEach((m) => {
        let stamp = false;
        if (!prev || m.t - prev.t > 3600e3 || !U.sameDay(new Date(m.t), new Date(prev.t))) {
          items.push({ kind: 'stamp', key: 'ts:' + m.id, t: m.t, sig: 'ts' + U.fmtStamp(m.t) });
          stamp = true;
        }
        if (m.sys) { items.push({ kind: 'sys', key: m.id, m, sig: 'sys' + m.text }); prev = m; return; }
        if (m.unsent) { items.push({ kind: 'unsent', key: m.id, m, sig: 'uns' + m.from }); prev = m; return; }
        const out = m.from === 'me';
        const first = stamp || !prev || !!prev.sys || !!prev.unsent || prev.from !== m.from;
        const failed = out && (m.status === 'failed' || dead);
        items.push({ kind: 'msg', key: m.id, m, out, first, failed, sending: !!sendingUntil[m.id], quote: quotes[m.id] && ids.has(quotes[m.id]) ? quotes[m.id] : null, replies: replies[m.id] || null });
        prev = m;
      });
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind !== 'msg') continue;
        const nx = items[i + 1];
        it.last = !nx || nx.kind !== 'msg' || nx.first;
      }
      // read receipt under the very last message when it is ours
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (it.kind !== 'msg') continue;
        if (it.out && !it.failed && !it.sending && !M.isSMS(tid)) {
          const m = it.m;
          if (group) it.receipt = ['Delivered', ''];
          else if (m.status === 'read') it.receipt = ['Read', M.readLabel(m.readAt || m.t + 60000)];
          else if (m.status === 'sent') it.receipt = ['Sent', ''];
          else it.receipt = ['Delivered', ''];
        }
        break;
      }
      items.forEach((it) => {
        if (it.kind !== 'msg') return;
        const m = it.m;
        it.sig = JSON.stringify([m.text, m.img, m.voice && m.voice.dur, m.memo, m.link && m.link.url, m.loc, m.sticker, m.react, m.edited, m.effect, m.status,
          it.first, it.last, it.failed, it.sending, it.receipt, it.quote, it.replies && it.replies.length, openTranscripts.has(m.id), group && M.short(m.from)]);
      });
      return items;
    }

    // ── builders ───────────────────────────────────────────────────────────
    function build(it) {
      if (it.kind === 'stamp') return h('div.msg-item.msg-stamp', M.stampNode(it.t));
      if (it.kind === 'sys') return h('div.msg-item.msg-sys', it.m.text);
      if (it.kind === 'unsent') return h('div.msg-item.msg-sys.unsent', (it.m.from === 'me' ? 'You' : M.short(it.m.from)) + ' unsent a message');
      return buildMsg(it);
    }

    function buildMsg(it) {
      const m = it.m, out = it.out;
      const el = h('div.msg-item.msg-m', { class: { out, in: !out, first: it.first, last: it.last, grp: group && !out, failed: it.failed && !it.sending }, data: { id: m.id } });
      el.appendChild(h('div.msg-check', JC.icon('checkmark', { size: 13, weight: 3 })));
      if (group && !out && it.first) el.appendChild(h('div.msg-sender', M.short(m.from)));
      const line = h('div.msg-line');
      if (group && !out) {
        line.appendChild(it.last ? h('div.msg-av-slot', { onTap: (e) => { e.stopPropagation(); JC.os.open('contacts', { contact: m.from }); } }, JC.ui.avatar(m.from, 28)) : h('div.msg-av-slot'));
      }
      const col = h('div.msg-col');
      if (it.quote) col.appendChild(quoteEl(it.quote));
      const parts = buildParts(it);
      const reacts = (m.react || []).filter(Boolean);
      parts.forEach((p, i) => {
        if (i === 0 && reacts.length) {
          col.appendChild(h('div.msg-pw', p, h('div.msg-reacts', { onTap: (e) => { e.stopPropagation(); reactionsSheet(m); } },
            reacts.slice(-3).map((r) => h('div.msg-react', { class: { mine: r.by === 'me' } }, M.tbGlyph(r.t, 15))))));
        } else col.appendChild(p);
      });
      line.appendChild(col);
      if (it.failed && !it.sending) line.appendChild(h('div.msg-fail', { onTap: (e) => { e.stopPropagation(); failSheet(m); } }, JC.icon('exclamationmark.circle.fill', { size: 25 })));
      el.appendChild(line);
      // under-labels
      const unders = [];
      if (it.failed && !it.sending) unders.push(h('div.msg-under.fail', 'Not Delivered'));
      if (m.edited) unders.push(h('div.msg-under.edited', { onTap: () => JC.ui.toast('Edit history is only on Jiang Cheng’s other devices', { icon: 'pencil' }) }, 'Edited'));
      if (m.effect && m.effect !== 'invisible') unders.push(h('div.msg-under.fx', { onTap: () => replayFx(el, m) }, JC.icon('arrow.clockwise', { size: 11, weight: 2.4 }), ' Replay'));
      if (it.replies) unders.push(h('div.msg-under.replies', { onTap: () => conv.scrollToMsg(it.replies[it.replies.length - 1]) }, it.replies.length === 1 ? '1 Reply' : it.replies.length + ' Replies'));
      if (it.receipt) unders.push(h('div.msg-under.rcpt', h('b', it.receipt[0]), it.receipt[1] ? ' ' + it.receipt[1] : ''));
      if (unders.length) el.appendChild(h('div.msg-unders', unders));
      // long press anywhere on the bubble column
      U.longPress(col, () => { if (!selected) openLP(m, col, it); });
      return el;
    }

    function bubble(cls, kids, o) {
      return h('div.msg-b' + (cls ? '.' + cls : ''), o || {}, kids);
    }

    function buildParts(it) {
      const m = it.m;
      const arr = [];
      if (m.img) arr.push(imgPart(m));
      if (m.link) arr.push(linkPart(m));
      if (m.loc) arr.push(locPart(m));
      if (m.voice || m.memo) arr.push(voicePart(m, it));
      if (m.sticker) arr.push(h('div.msg-sticker', m.sticker));
      const txt = m.text && !(m.link && m.text.trim() === m.link.url) ? m.text : '';
      if (txt) {
        const big = M.bigEmoji(txt);
        if (big && m.effect !== 'invisible') arr.push(h('div.msg-emoji', { class: 'n' + big }, txt));
        else {
          const b = bubble('msg-text', M.richText(txt));
          if (m.effect === 'invisible') M.ink(b, { color: it.out ? '#ffffff' : (JC.os.dark ? '#ffffff' : '#3a3a3c') });
          arr.push(b);
        }
      }
      if (!arr.length) arr.push(bubble('msg-text', ' '));
      const lastP = arr[arr.length - 1];
      if (it.last && lastP.classList.contains('msg-b')) lastP.classList.add('tail');
      return arr;
    }

    function imgPart(m) {
      const ratio = JC.art.ratio(m.img) || 4 / 3;
      const w = ratio >= 1 ? 236 : 186;
      const hh = Math.min(300, Math.round(w / ratio));
      return h('div.msg-img', {
        style: { width: w + 'px', height: hh + 'px', backgroundImage: `url("${JC.art.url(m.img)}")` },
        attrs: { role: 'img', 'aria-label': (JC.art.meta(m.img).title || 'Photo') },
        onTap: () => { if (!selected) M.viewer(app, tid, m.id, conv); },
      });
    }

    function hostOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url || ''; } }
    function linkPart(m) {
      const L = m.link;
      const site = L.site || hostOf(L.url);
      return bubble('msg-linkcard' + (L.art ? '.has-art' : ''), [
        L.art ? h('div.msg-link-art', { style: { backgroundImage: `url("${JC.art.url(L.art)}")` } }) : null,
        h('div.msg-link-meta',
          h('div.msg-link-txt', h('div.msg-link-title', L.title || L.url), h('div.msg-link-site', site)),
          L.art ? null : h('div.msg-link-ico', { style: { background: `hsl(${M.hash(site) % 360} 55% 52%)` } }, (site[0] || '?').toUpperCase())),
      ], { onTap: () => { if (!selected) JC.os.open('safari', { url: L.url }); } });
    }

    function locPart(m) {
      const p = M.place(m.loc);
      return bubble('msg-loccard', [
        M.miniMap(p.id, { dot: p.id === 'player-home' }),
        h('div.msg-loc-meta', h('div.msg-loc-name', p.name), h('div.msg-loc-sub', p.city || 'Shared Location')),
      ], { onTap: () => { if (!selected) JC.os.open('maps', { place: p.id }); } });
    }

    function voicePart(m, it) {
      const v = m.voice || { dur: 8, text: '' };
      let memo = null;
      if (m.memo) { try { memo = JC.store.get('memos', m.memo); } catch (e) { memo = null; } }
      const dur = (memo && memo.dur) || v.dur || 8;
      const text = v.text || (memo && memo.text) || '';
      const n = U.clamp(Math.round(dur * 1.5), 18, 32);
      const bars = M.wave(m.id, n).map((x) => h('i', { style: { height: Math.round(4 + x * 19) + 'px' } }));
      const durEl = h('div.msg-vdur', U.fmtDur(dur));
      const playBtn = h('div.msg-vplay', JC.icon('play.fill', { size: 14 }));
      const played = M.prefMap('played');
      const dot = !it.out && !played[m.id] ? h('i.msg-vdot') : null;
      const kids = [];
      if (m.memo) kids.push(h('div.msg-memo-title', JC.icon('waveform', { size: 14, weight: 2 }), h('span', memo ? memo.title : 'Voice Memo')));
      kids.push(h('div.msg-vrow', playBtn, h('div.msg-wave', bars), durEl, dot));
      if (text) {
        const open = openTranscripts.has(m.id);
        kids.push(h('div.msg-trans', { class: { open } },
          h('div.msg-trans-tg', { onTap: (e) => { e.stopPropagation(); if (openTranscripts.has(m.id)) openTranscripts.delete(m.id); else openTranscripts.add(m.id); refresh(); } },
            h('span', open ? 'Hide Transcript' : 'View Transcript'), JC.icon(open ? 'chevron.up' : 'chevron.down', { size: 10, weight: 2.6 })),
          open ? h('div.msg-trans-t', text) : null));
      }
      const el = bubble('msg-voice' + (m.memo ? '.memo' : ''), kids);
      el._setProgress = (p) => {
        const k = Math.round(p * bars.length);
        bars.forEach((b, i) => b.classList.toggle('on', i < k));
        durEl.textContent = p > 0 ? U.fmtDur(dur * p) : U.fmtDur(dur);
      };
      el._setPlaying = (b) => {
        playBtn.innerHTML = '';
        playBtn.appendChild(JC.icon(b ? 'pause.fill' : 'play.fill', { size: 14 }));
        el.classList.toggle('playing', b);
      };
      const toggle = (e) => {
        if (e) e.stopPropagation();
        if (selected) return;
        const started = M.toggleVoice(m.id, dur, el, { low: m.from === 'huang', silent: false });
        if (started) {
          if (dot) dot.remove();
          M.prefSet('played', m.id, 1);
          if (m.memo) JC.story.act('memo_play', { id: m.memo });
        }
      };
      JC.ui.onTap(playBtn, toggle);
      JC.ui.onTap(el, toggle);
      M.attachPlayer(m.id, el);
      return el;
    }

    function quoteEl(qid) {
      const q = JC.story.messages(tid).find((x) => x.id === qid);
      const txt = q ? (q.text || JC.story.preview(q)) : 'Message';
      return h('div.msg-quote', { onTap: (e) => { e.stopPropagation(); conv.scrollToMsg(qid); } }, h('div.msg-quote-b', txt), h('div.msg-quote-line'));
    }

    // ── reconcile ──────────────────────────────────────────────────────────
    function isAtBottom() { return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 70; }
    function toBottom(smooth) {
      scroller.scrollTo({ top: scroller.scrollHeight + 1000, behavior: smooth ? 'smooth' : 'auto' });
      stick = true;
      newPill.hidden = true;
    }
    conv.toBottom = toBottom;

    function refresh(evt) {
      if (conv.destroyed) return;
      const wasBottom = !rendered || stick || isAtBottom();
      const items = model();
      const keep = new Set();
      const added = [];
      let cursor = list.firstChild;
      items.forEach((it) => {
        keep.add(it.key);
        const rec = nodes.get(it.key);
        if (!rec || rec.sig !== it.sig) {
          const el = build(it);
          if (rec) { if (rec.el === cursor) cursor = cursor.nextSibling; rec.el.remove(); }
          list.insertBefore(el, cursor);
          nodes.set(it.key, { el, sig: it.sig, it });
          if (!rec) added.push({ it, el });
        } else {
          rec.it = it;
          if (rec.el === cursor) cursor = cursor.nextSibling;
          else list.insertBefore(rec.el, cursor);
        }
      });
      nodes.forEach((rec, key) => { if (!keep.has(key)) { rec.el.remove(); nodes.delete(key); } });
      if (selected) list.querySelectorAll('.msg-m').forEach((el) => el.classList.toggle('sel', selected.has(el.dataset.id)));

      if (!rendered) {
        rendered = true;
        return;
      }
      // arrivals
      let incoming = false, outgoing = false;
      const fresh = evt && evt.msg ? evt.msg.id : null;
      added.forEach(({ it, el }) => {
        if (it.kind !== 'msg' && it.kind !== 'sys') return;
        const isNew = fresh ? it.key === fresh || (it.m && it.m.t >= JC.time.now() - 5000) : true;
        if (!isNew) return;
        if (it.kind === 'sys') { U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); return; }
        if (it.out) {
          outgoing = true;
          U.anim(el, [{ transform: 'translateY(26px) scale(.94)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: U.SPRING, fill: 'none' });
          if (dead && !it.m.hist) startSending(it.m.id);
          else flashProgress(650);
        } else {
          incoming = true;
          U.anim(el, [{ transform: 'scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 360, easing: U.SPRING, fill: 'none' });
        }
        const m = it.m;
        if (m && m.effect && m.effect !== 'invisible') setTimeout(() => replayFx(el, m), 60);
      });
      if (outgoing || wasBottom) requestAnimationFrame(() => toBottom(true));
      else if (incoming) newPill.hidden = false;
    }
    conv.refresh = refresh;

    function replayFx(el, m) {
      if (M.isScreenFx(m.effect)) {
        const r = el.getBoundingClientRect();
        const pr = page.el.getBoundingClientRect();
        const sc = JC.os.scale || 1;
        M.screenFx(page.el, m.effect, { x: (r.left - pr.left + r.width / 2) / sc, y: (r.top - pr.top) / sc, text: m.text, color: m.from === 'me' ? (sms ? '#34c759' : '#0b84fe') : '#8e8e93' });
      } else M.bubbleFx(el.querySelector('.msg-col') || el, m.effect, list);
    }

    function flashProgress(ms, then) {
      const bar = progress.firstChild;
      progress.classList.add('on');
      bar.getAnimations().forEach((a) => a.cancel());
      U.anim(bar, [{ width: '0%' }, { width: '78%', offset: 0.7 }, { width: '100%' }], { duration: ms, easing: 'ease-in-out' }).then(() => {
        progress.classList.remove('on');
        if (then) then();
      });
    }
    function startSending(id) {
      sendingUntil[id] = 1;
      refresh();
      flashProgress(2600, () => {
        delete sendingUntil[id];
        refresh();
        JC.audio.haptic([10, 60, 10]);
        const rec = nodes.get(id);
        if (rec) {
          rec.el.classList.add('justfailed');
          if (stick) toBottom(true);
        }
        if (M.members(tid).includes('ajie') && !petalsShown) {
          petalsShown = true;
          setTimeout(() => { if (!conv.destroyed) M.screenFx(page.el, 'petals'); }, 900);
        }
      });
    }

    conv.scrollToMsg = (id, flash) => {
      const rec = nodes.get(id);
      if (!rec) return;
      const r = rec.el.offsetTop - scroller.clientHeight / 2 + rec.el.offsetHeight / 2;
      scroller.scrollTo({ top: Math.max(0, r), behavior: rendered ? 'smooth' : 'auto' });
      stick = false;
      if (flash !== false) {
        rec.el.classList.remove('flashing');
        void rec.el.offsetWidth;
        rec.el.classList.add('flashing');
        setTimeout(() => rec.el.classList.remove('flashing'), 1800);
      }
    };

    // typing
    conv.onTyping = () => {
      const who = JC.story.typing(tid);
      const show = !!who && !dead;
      if (show === !typingRow.hidden && typingRow._who === who) return;
      const wasBottom = stick || isAtBottom();
      typingRow._who = who;
      typingAv.innerHTML = '';
      if (show && group) typingAv.appendChild(JC.ui.avatar(who, 28));
      typingRow.classList.toggle('grp', group);
      typingRow.hidden = !show;
      if (show) U.anim(typingRow.lastChild, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: U.SPRING });
      if (wasBottom) requestAnimationFrame(() => toBottom(true));
    };

    // ── scroll & layout ────────────────────────────────────────────────────
    scroller.addEventListener('scroll', () => {
      stick = isAtBottom();
      if (stick) newPill.hidden = true;
      head.classList.toggle('scrolled', scroller.scrollTop > 4);
    }, { passive: true });
    const ro = window.ResizeObserver ? new ResizeObserver(() => {
      const hgt = bottom.offsetHeight;
      scroller.style.paddingBottom = hgt + 14 + 'px';
      newPill.style.bottom = hgt + 10 + 'px';
      if (stick) toBottom(false);
    }) : null;
    if (ro) { ro.observe(bottom); ro.observe(scroller); }

    // ── reply tray (story choices) ─────────────────────────────────────────
    function renderTray() {
      if (conv.destroyed) return;
      const p = selected ? null : JC.story.pending(tid);
      const key = p ? JSON.stringify(p.options) : '';
      if (key === trayKey && !(p && tray.hidden && !picking)) { kbSuggest(); return; }
      trayKey = key;
      clearInterval(timerInt);
      tray.innerHTML = '';
      if (!p || !p.options.length || picking) {
        if (!tray.hidden && !picking) U.anim(tray, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(16px)' }], { duration: 180 }).then(() => { if (!JC.story.pending(tid)) tray.hidden = true; });
        else tray.hidden = true;
        kbSuggest();
        return;
      }
      const peer = M.peer(tid);
      const label = dead ? 'Write to ' + M.short(peer) + '…' : 'Reply as Jiang Cheng…';
      const timer = h('div.msg-tray-timer', h('i'));
      timer.hidden = true;
      const count = h('span.msg-tray-count', p.options.length + ' replies');
      const head = h('div.msg-tray-head', { onTap: () => { trayCollapsed = !trayCollapsed; tray.classList.toggle('collapsed', trayCollapsed); } },
        h('div.msg-tray-ic', JC.icon(dead ? 'lotus' : 'person.crop.circle.fill', { size: 15 })),
        h('span.msg-tray-lb', label), count,
        h('div.msg-tray-chev', JC.icon('chevron.down', { size: 12, weight: 2.6 })));
      const optsEl = h('div.msg-tray-opts', p.options.map((o) => optEl(o)));
      tray.append(head, timer, optsEl);
      tray.classList.toggle('collapsed', trayCollapsed);
      tray.classList.remove('picked');
      tray.getAnimations().forEach((a) => a.cancel());
      const wasHidden = tray.hidden;
      tray.hidden = false;
      if (wasHidden) {
        U.anim(tray, [{ opacity: 0, transform: 'translateY(24px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: U.SPRING, fill: 'none' });
        Array.from(optsEl.children).forEach((c, i) => U.anim(c, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 80 + i * 55, easing: U.SPRING, fill: 'backwards' }));
        JC.audio.haptic(6);
      }
      if (p.timeout) {
        const tick = () => {
          const run = (JC.state.d.runs || []).find((r) => r.wait === 'choice' && r.waitTh === tid);
          if (!run || !(run.tleft > 0)) { timer.hidden = true; return; }
          timer.hidden = false;
          const k = U.clamp(run.tleft / (p.timeout * 1000), 0, 1);
          timer.firstChild.style.width = k * 100 + '%';
          timer.classList.toggle('low', k < 0.25);
        };
        tick();
        timerInt = setInterval(tick, 250);
      }
      kbSuggest();
    }
    conv.renderTray = renderTray;

    function optEl(o) {
      const pl = parseLabel(o.label, o.text);
      const action = o.silent || !pl.main;
      if (action) {
        const t = pl.hint || pl.main || o.label;
        return h('div.msg-opt.action', { onTap: () => pick(o) }, JC.icon(silentIcon(t), { size: 15, weight: 2 }), h('span.msg-opt-t', t));
      }
      return h('div.msg-opt', { onTap: () => pick(o) }, h('span.msg-opt-t', pl.main), pl.hint ? h('span.msg-opt-hint', pl.hint) : null);
    }

    async function pick(o) {
      if (picking || conv.destroyed) return;
      const p = JC.story.pending(tid);
      if (!p || !p.options[o.i] || p.options[o.i].label !== o.label) { trayKey = null; renderTray(); return; }
      picking = true;
      JC.audio.haptic(8);
      const chosen = Array.from(tray.querySelectorAll('.msg-opt'))[o.i];
      if (chosen) chosen.classList.add('chosen');
      tray.classList.add('picked');
      await U.wait(170);
      if (o.silent) {
        const pl = parseLabel(o.label, o.text);
        const t = pl.hint || pl.main || o.label;
        U.anim(tray, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(14px)' }], { duration: 200 }).then(() => { tray.hidden = true; tray.classList.remove('picked'); });
        JC.story.choose(tid, o.i);
        picking = false;
        trayKey = null;
        silentVisual(t);
        setTimeout(renderTray, 260);
        return;
      }
      U.anim(tray, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(14px)' }], { duration: 180 }).then(() => { tray.hidden = true; tray.classList.remove('picked'); });
      const text = o.text || o.label;
      field.value = '';
      onFieldInput(true);
      const chars = Array.from(text);
      const per = U.clamp(chars.length * 34, 480, 1300) / chars.length;
      for (let i = 0; i < chars.length; i++) {
        if (conv.destroyed) return;
        field.value += chars[i];
        autoGrow();
        if (i % 2 === 0) JC.audio.play('key');
        onFieldInput(true);
        await U.wait(per);
      }
      await U.wait(200);
      if (conv.destroyed) return;
      U.anim(sendBtn, [{ transform: 'scale(1)' }, { transform: 'scale(.82)' }, { transform: 'scale(1)' }], { duration: 220 });
      const quote = replyTo;
      field.value = '';
      autoGrow();
      onFieldInput();
      const ok = JC.story.choose(tid, o.i);
      picking = false;
      trayKey = null;
      if (!ok) {
        field.value = text;
        autoGrow();
        onFieldInput();
        JC.ui.toast('That moment has passed', { icon: 'clock' });
      } else if (quote) {
        setReply(null);
        const mine = JC.story.messages(tid).filter((x) => x.from === 'me');
        const last = mine[mine.length - 1];
        if (last) M.prefSet('quotes', last.id, quote);
      }
      renderTray();
    }

    function silentVisual(text) {
      if (/close the thread/i.test(text)) { setTimeout(() => app.nav.pop(), 350); return; }
      if (/face down|turn the phone/i.test(text)) {
        const dim = h('div.msg-facedown');
        page.el.appendChild(dim);
        U.anim(dim, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 2600 }).then(() => dim.remove());
        return;
      }
      const cap = h('div.msg-silent', JC.icon(silentIcon(text), { size: 13, weight: 2.2 }), h('span', /on read/i.test(text) ? 'Left on read' : text));
      after.appendChild(cap);
      if (stick) toBottom(true);
      U.anim(cap, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none', offset: 0.12 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 3200 }).then(() => cap.remove());
    }

    function kbSuggest() {
      if (!JC.kb.visible || JC.kb.target !== field) return;
      const p = selected ? null : JC.story.pending(tid);
      if (p && p.options.length && !field.value && !picking) {
        JC.kb.suggest(p.options.map((o) => {
          const pl = parseLabel(o.label, o.text);
          let t = o.silent || !pl.main ? (pl.hint || o.label).replace(/^\[|\]$/g, '') : pl.main;
          if (t.length > 15) t = t.slice(0, 14).trim() + '…';
          return { text: t, onTap: () => pick(o) };
        }));
      } else JC.kb.suggest(null);
    }
    conv.kbSuggest = kbSuggest;

    // ── composer behaviour ─────────────────────────────────────────────────
    function autoGrow() {
      field.style.height = 'auto';
      field.style.height = Math.min(128, field.scrollHeight) + 'px';
    }
    const saveDraft = U.debounce(() => { if (!conv.destroyed) M.setDraft(tid, field.value); }, 500);
    function onFieldInput(silent) {
      const has = !!field.value.trim() || !!attachment;
      fieldWrap.classList.toggle('has', has);
      if (!silent) saveDraft();
      kbSuggest();
    }
    function clearComposer() {
      field.value = '';
      autoGrow();
      setAttachment(null);
      setReply(null);
      fieldWrap.classList.remove('has');
      M.setDraft(tid, '');
    }

    function doSend(effect) {
      if (conv.recording) return;
      const text = field.value.trim();
      const att = attachment;
      if (!text && !att) return;
      const quote = replyTo;
      clearComposer();
      let last = null;
      if (att) last = JC.story.send(tid, att.payload) || last;
      if (text) last = JC.story.send(tid, effect ? { text, effect } : { text }) || last;
      JC.audio.play('send');
      if (quote && last && last.id) M.prefSet('quotes', last.id, quote);
      kbSuggest();
    }
    conv.send = (payload) => { const m = JC.story.send(tid, payload); JC.audio.play('send'); return m; };

    function setAttachment(a) {
      attachment = a;
      attachBox.innerHTML = '';
      attachBox.hidden = !a;
      if (a) {
        let chip;
        if (a.kind === 'img') chip = h('div.msg-att-img', { style: { backgroundImage: `url("${JC.art.url(a.payload.img)}")` } });
        else if (a.kind === 'memo') chip = h('div.msg-att-file', h('div.msg-att-ic', JC.icon('waveform', { size: 18, weight: 2 })), h('div', h('div.msg-att-t', a.title), h('div.msg-att-s', 'Voice Memo · ' + U.fmtDur(a.dur || 0))));
        else if (a.kind === 'loc') chip = h('div.msg-att-loc', M.miniMap('player-home', { w: 150, h: 84, dot: true }), h('div.msg-att-s', 'Current Location'));
        attachBox.appendChild(h('div.msg-att', chip, h('div.msg-att-x', { onTap: () => { setAttachment(null); onFieldInput(); } }, JC.icon('xmark', { size: 11, weight: 3 }))));
      }
      fieldWrap.classList.toggle('has', !!field.value.trim() || !!a);
    }
    conv.setAttachment = setAttachment;

    conv.setReply = (m) => setReply(m);
    function setReply(m) {
      replyTo = m ? m.id : null;
      replyBox.innerHTML = '';
      replyBox.hidden = !m;
      if (m) {
        replyBox.append(h('div.msg-rc-bar'), h('div.msg-rc-main', h('div.msg-rc-k', 'Reply to ' + (m.from === 'me' ? 'yourself' : M.short(m.from))), h('div.msg-rc-t', m.text || JC.story.preview(m))),
          h('div.msg-rc-x', { onTap: () => setReply(null) }, JC.icon('xmark.circle.fill', { size: 18 })));
      }
    }

    // ── plus menu & attachment pickers ─────────────────────────────────────
    function openPlus() {
      if (conv.recording) return;
      field.blur();
      const items = [
        { label: 'Camera', node: h('div.msg-pm-ic.cam', JC.icon('camera.fill', { size: 22 })), fn: () => JC.os.open('camera') },
        { label: 'Photos', node: h('div.msg-pm-ic.app', JC.appIcon('photos')), fn: photosSheet },
        { label: 'Stickers', node: h('div.msg-pm-ic.stk', JC.icon('msg.sticker', { size: 24, weight: 1.9 })), fn: stickersSheet },
        { label: 'Audio', node: h('div.msg-pm-ic.aud', JC.icon('waveform', { size: 22, weight: 2.2 })), fn: startRecorder },
        { label: 'Location', node: h('div.msg-pm-ic.loc', JC.icon('location.fill', { size: 20 })), fn: locationSheet },
        { label: 'Voice Memos', node: h('div.msg-pm-ic.app', JC.appIcon('voicememos')), fn: memosSheet },
        { label: 'Send Later', node: h('div.msg-pm-ic.later', JC.icon('msg.clock.send', { size: 23, weight: 2 })), fn: sendLater },
      ];
      const back = h('div.msg-pm-back');
      const listEl = h('div.msg-pm-list', items.map((it) => h('div.msg-pm-item', { onTap: () => { close(); setTimeout(it.fn, 180); } }, it.node, h('span', it.label))));
      const x = h('div.msg-pm-x', { onTap: () => close() }, JC.icon('xmark', { size: 18, weight: 2.4 }));
      const wrap = h('div.msg-pm', back, listEl, x);
      JC.ui.onTap(back, () => close());
      page.el.appendChild(wrap);
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
      Array.from(listEl.children).forEach((c, i) => U.anim(c, [{ opacity: 0, transform: 'translate(-24px, 40px) scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: (items.length - 1 - i) * 22, easing: U.SPRING, fill: 'backwards' }));
      U.anim(x, [{ transform: 'rotate(-90deg) scale(.6)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: U.SPRING });
      function close() {
        conv._closePlus = null;
        U.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => wrap.remove());
      }
      conv._closePlus = close;
    }

    function photosSheet() {
      const photos = M.photos();
      const grid = h('div.msg-ph-grid');
      const s = JC.ui.sheet({
        title: 'Photos', detent: 'large', cls: 'msg-photos-sheet', left: { text: 'Cancel' },
        content: () => [
          h('div.msg-ph-seg', JC.ui.segmented({ items: ['Recents', 'Favorites', 'Screenshots'], value: 0, onChange: (i) => { grid.innerHTML = ''; fill(i); } })),
          grid,
        ],
      });
      function fill(i) {
        let arr = photos;
        if (i === 1) arr = photos.filter((p) => p.fav);
        if (i === 2) arr = photos.filter((p) => p.kind === 'screenshot' || /^p_shot_/.test(p.art));
        if (!arr.length) { grid.appendChild(h('div.msg-ph-empty', i === 1 ? 'No Favorites' : 'No Screenshots')); return; }
        arr.forEach((p) => grid.appendChild(h('div.msg-ph-cell', {
          style: { backgroundImage: `url("${JC.art.url(p.art)}")` },
          onTap: () => { s.close(); setAttachment({ kind: 'img', payload: { img: p.art } }); onFieldInput(); },
        }, p.kind === 'video' ? h('span.msg-ph-dur', U.fmtDur(p.dur || 0)) : null)));
      }
      fill(0);
    }

    const STICKERS = ['🐶', '🪷', '😤', '🙄', '😒', '😂', '😭', '🥺', '🙏', '👍', '👀', '💜', '🔥', '🎂', '🍲', '🥟', '🍵', '🌕', '🚗', '🐟', '🪭', '🔔', '🎁', '💀', '😡', '🫡', '🤦‍♂️', '🙈', '🐕', '🦮', '🐩', '😌', '🥹', '❤️', '✨', '🎉'];
    function stickersSheet() {
      const s = JC.ui.sheet({
        title: 'Stickers', detent: 'medium', cls: 'msg-stk-sheet', right: { text: 'Done', bold: false },
        content: () => h('div.msg-stk-grid', STICKERS.map((e) => h('div.msg-stk', { onTap: () => { s.close(); conv.send({ text: e }); } }, e))),
      });
    }

    function locationSheet() {
      const place = M.place('player-home');
      const s = JC.ui.sheet({
        title: 'Location', detent: 'medium', cls: 'msg-loc-sheet', left: { text: 'Cancel' },
        content: () => [
          h('div.msg-ls-map', M.miniMap('player-home', { w: 360, h: 200, dot: true }), h('div.msg-ls-acc', JC.icon('location.fill', { size: 12 }), ' Accurate to 12 m')),
          h('div.msg-ls-addr', h('b', place.name), h('span', place.city + ' · Your current location')),
          h('div.msg-ls-btns',
            JC.ui.btn({ text: 'Send Pin', kind: 'filled', size: 'l', onTap: () => { s.close(); setAttachment({ kind: 'loc', payload: { loc: 'player-home' } }); onFieldInput(); } }),
            JC.ui.btn({ text: 'Share My Location', kind: 'gray', size: 'l', onTap: () => { s.close(); M.shareLocation(tid); } })),
        ],
      });
    }

    function memosSheet() {
      const memos = M.memos();
      const s = JC.ui.sheet({
        title: 'Voice Memos', detent: 'large', cls: 'msg-memo-sheet', left: { text: 'Cancel' },
        content: () => memos.length ? JC.ui.list([{ header: 'All Recordings', rows: memos.map((mm) => ({
          icon: { node: h('div.msg-memo-ic', JC.icon('waveform', { size: 18, weight: 2 })) },
          title: mm.title || 'New Recording',
          subtitle: U.fmtDate(mm.t, 'medium') + (mm.place ? ' · ' + mm.place : ''),
          detail: U.fmtDur(mm.dur || 0),
          onTap: () => { s.close(); setAttachment({ kind: 'memo', title: mm.title || 'New Recording', dur: mm.dur, payload: { memo: mm.id } }); onFieldInput(); },
        })) }]) : JC.ui.empty({ icon: 'waveform', title: 'No Recordings', text: 'Recordings from Voice Memos will appear here.' }),
      });
    }

    function sendLater() {
      JC.ui.alert({
        title: 'Send Later',
        message: 'Scheduled messages are sent from this iPhone.\n\nBy the time this one goes out, the phone might not be in your hands anymore.',
        buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Send Now Instead', style: 'default', onTap: () => setTimeout(() => field.focus(), 200) }],
      });
    }

    // ── audio recorder (hold to record) ────────────────────────────────────
    function startRecorder() {
      conv.recording = true;
      composer.classList.add('rec');
      const rec = h('div.msg-rec');
      const timeEl = h('div.msg-rec-time', '0:00');
      const waveEl = h('div.msg-rec-wave');
      const hint = h('div.msg-rec-hint', 'Hold to record');
      const trash = h('div.msg-rec-x', { onTap: () => stopRecorder() }, JC.icon('xmark', { size: 16, weight: 2.6 }));
      const holdBtn = h('div.msg-rec-btn', JC.icon('mic.fill', { size: 22 }));
      rec.append(trash, h('div.msg-rec-mid', timeEl, waveEl, hint), holdBtn);
      fieldWrap.hidden = true;
      composer.appendChild(rec);
      let t0 = 0, raf = 0, levels = [], recorded = 0;
      const draw = () => {
        const el = (performance.now() - t0) / 1000;
        timeEl.textContent = U.fmtDur(el);
        if (levels.length < 400) levels.push(0.15 + Math.random() * 0.85 * (0.4 + 0.6 * Math.abs(Math.sin(el * 3.1))));
        waveEl.innerHTML = '';
        levels.slice(-34).forEach((v) => waveEl.appendChild(h('i', { style: { height: Math.round(3 + v * 22) + 'px' } })));
        raf = requestAnimationFrame(draw);
      };
      holdBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (rec.classList.contains('review')) return;
        t0 = performance.now();
        levels = [];
        rec.classList.add('on');
        hint.textContent = 'Release to stop';
        JC.audio.play('tink');
        JC.audio.haptic(12);
        draw();
        const up = () => {
          window.removeEventListener('pointerup', up);
          window.removeEventListener('pointercancel', up);
          cancelAnimationFrame(raf);
          rec.classList.remove('on');
          recorded = Math.max(0, Math.round((performance.now() - t0) / 1000));
          if (recorded < 1) { hint.textContent = 'Hold to record'; timeEl.textContent = '0:00'; waveEl.innerHTML = ''; JC.ui.toast('Hold to record, release to stop', { icon: 'mic.fill' }); return; }
          review();
        };
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
      });
      holdBtn.__tap = true;
      holdBtn.classList.add('tap');
      function review() {
        rec.classList.add('review');
        hint.textContent = '';
        const bars = Array.from(waveEl.children);
        const play = h('div.msg-rec-play', JC.icon('play.fill', { size: 14 }));
        const fake = { _setProgress: (p) => { const k = Math.round(p * bars.length); bars.forEach((b, i) => b.classList.toggle('on', i < k)); }, _setPlaying: (b) => { play.innerHTML = ''; play.appendChild(JC.icon(b ? 'pause.fill' : 'play.fill', { size: 14 })); } };
        JC.ui.onTap(play, () => M.toggleVoice('rec_preview', recorded, fake, { silent: false }));
        timeEl.replaceWith(play);
        hint.replaceWith(h('div.msg-rec-time', U.fmtDur(recorded)));
        const send = h('div.msg-rec-send', { onTap: () => { M.stopVoice(); stopRecorder(); conv.send({ voice: { dur: recorded, text: '(an unfamiliar voice)' } }); } }, JC.icon('arrow.up', { size: 17, weight: 2.8 }));
        holdBtn.replaceWith(send);
      }
      function stopRecorder() {
        cancelAnimationFrame(raf);
        M.stopVoice();
        conv.recording = false;
        composer.classList.remove('rec');
        rec.remove();
        fieldWrap.hidden = false;
      }
      conv._stopRecorder = stopRecorder;
    }

    // ── send-with-effect picker ────────────────────────────────────────────
    function openEffects() {
      const text = field.value.trim();
      if (!text) return;
      field.blur();
      let tab = 0, sel = null, screenIdx = 0, fxT = 0, fxCanvas = null;
      const wrap = h('div.msg-fx');
      const back = h('div.msg-fx-back');
      const title = h('div.msg-fx-title', 'Send with Effect');
      const seg = JC.ui.segmented({ items: ['Bubble', 'Screen'], value: 0, onChange: (i) => { tab = i; sel = null; render(); } });
      const body = h('div.msg-fx-body');
      const x = h('div.msg-fx-x', { onTap: () => close() }, JC.icon('xmark', { size: 17, weight: 2.6 }));
      wrap.append(back, h('div.msg-fx-top', title, seg), body, x);
      page.el.appendChild(wrap);
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
      U.anim(wrap.querySelector('.msg-fx-top'), [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 260 });
      function prev(effect) {
        const b = h('div.msg-fx-bubble', { class: { sms } }, text);
        if (effect === 'invisible') setTimeout(() => M.ink(b, { color: '#fff' }), 0);
        return b;
      }
      function render() {
        body.innerHTML = '';
        if (fxCanvas) { fxCanvas.remove(); fxCanvas = null; }
        if (tab === 0) {
          const pv = h('div.msg-fx-prev', prev(sel));
          const listEl = h('div.msg-fx-list', M.BUBBLE_FX.map((f) => h('div.msg-fx-opt', { class: { on: sel === f.id }, onTap: () => { sel = f.id; render(); } },
            h('span.msg-fx-lbl', f.label),
            sel === f.id ? h('div.msg-fx-go', { class: { sms }, onTap: (e) => { e.stopPropagation(); go(f.id); } }, JC.icon('arrow.up', { size: 16, weight: 2.8 })) : h('div.msg-fx-dot'))));
          body.append(listEl, pv);
          if (sel) setTimeout(() => M.bubbleFx(pv.firstChild, sel), 30);
        } else {
          const f = M.SCREEN_FX[screenIdx];
          const pv = h('div.msg-fx-screen', prev(null));
          const dots = h('div.msg-fx-dots', M.SCREEN_FX.map((_, i) => h('i', { class: { on: i === screenIdx } })));
          const nav = h('div.msg-fx-nav',
            h('div.msg-fx-arrow', { onTap: () => { screenIdx = (screenIdx + M.SCREEN_FX.length - 1) % M.SCREEN_FX.length; render(); } }, JC.icon('chevron.left', { size: 18, weight: 2.4 })),
            h('div.msg-fx-name', f.label),
            h('div.msg-fx-arrow', { onTap: () => { screenIdx = (screenIdx + 1) % M.SCREEN_FX.length; render(); } }, JC.icon('chevron.right', { size: 18, weight: 2.4 })));
          const goBtn = h('div.msg-fx-go.big', { class: { sms }, onTap: () => go(f.id) }, JC.icon('arrow.up', { size: 18, weight: 2.8 }));
          body.append(pv, nav, dots, goBtn);
          U.drag(body, { axis: 'x', end: (e, p) => { if (p.dx < -40) screenIdx = (screenIdx + 1) % M.SCREEN_FX.length; else if (p.dx > 40) screenIdx = (screenIdx + M.SCREEN_FX.length - 1) % M.SCREEN_FX.length; else return; render(); } });
          clearTimeout(fxT);
          fxT = setTimeout(() => {
            if (fxCanvas) fxCanvas.remove();
            const r = pv.firstChild.getBoundingClientRect(), wr = wrap.getBoundingClientRect(), sc = JC.os.scale || 1;
            fxCanvas = M.screenFx(wrap, f.id, { x: (r.left - wr.left + r.width / 2) / sc, y: (r.top - wr.top) / sc, text, color: sms ? '#34c759' : '#0b84fe' });
          }, 80);
        }
      }
      function go(effect) { close(); doSend(effect); }
      function close() { conv._closeFx = null; U.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).then(() => wrap.remove()); }
      conv._closeFx = close;
      render();
    }

    // ── long-press: tapbacks + menu ────────────────────────────────────────
    function openLP(m, anchor, it) {
      JC.audio.haptic(12);
      field.blur();
      const layer = page.el;
      const lr = JC.ui.toLocal(layer.getBoundingClientRect());
      const r = JC.ui.toLocal(anchor.getBoundingClientRect());
      const wrap = h('div.msg-lp');
      const back = h('div.msg-lp-back');
      const out = m.from === 'me';
      const inner = anchor.cloneNode(true);
      inner.querySelectorAll('canvas').forEach((c) => c.remove());
      const clone = h('div.msg-lp-clone.msg-m', { class: { out, in: !out } }, inner);
      const scale = r.h > 360 ? 360 / r.h : 1;
      const mine = (m.react || []).find((x) => x.by === 'me');
      const bar = h('div.msg-lp-bar', M.TAPBACKS.map((tb) => h('div.msg-lp-tb', {
        class: { on: mine && mine.t === tb.t },
        attrs: { 'aria-label': tb.label },
        onTap: () => { JC.audio.play('pop'); JC.story.react(tid, m.id, tb.t); close(); },
      }, M.tbGlyph(tb.t, 21))));
      const items = [];
      items.push({ text: 'Reply', icon: 'arrowshape.turn.up.left', onTap: () => { setReply(m); setTimeout(() => field.focus(), 120); } });
      if (m.text) items.push({ text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(m.text); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } });
      if (m.img) {
        items.push({ text: 'Copy', icon: 'doc.on.doc', onTap: () => JC.ui.toast('Photo copied', { icon: 'doc.on.doc' }) });
        items.push({ text: 'Save to Photos', icon: 'square.and.arrow.down', onTap: () => M.savePhoto(m.img) });
        items.push({ text: 'Share…', icon: 'square.and.arrow.up', onTap: () => JC.ui.share({ title: JC.art.meta(m.img).title || 'Photo', subtitle: 'Photo', art: m.img, payload: { kind: 'photo', art: m.img } }) });
      }
      if (m.link) items.push({ text: 'Open Link', icon: 'link', onTap: () => JC.os.open('safari', { url: m.link.url }) });
      if (m.loc) items.push({ text: 'Open in Maps', icon: 'map', onTap: () => JC.os.open('maps', { place: M.place(m.loc).id }) });
      if (m.text) items.push({ text: 'Translate', icon: 'globe', onTap: () => M.translate(m) });
      items.push('-');
      items.push({ text: 'More…', icon: 'ellipsis.circle', onTap: () => enterSelect(m.id) });
      const menu = h('div.pmenu.msg-lp-menu');
      let grp = h('div.pmenu-group');
      menu.appendChild(grp);
      items.forEach((itm) => {
        if (itm === '-') { grp = h('div.pmenu-group'); menu.appendChild(grp); return; }
        grp.appendChild(h('div.pmenu-item', { onTap: () => { close(); setTimeout(() => itm.onTap(), 160); } }, h('span.pmenu-text', itm.text), JC.icon(itm.icon, { size: 19 })));
      });
      wrap.append(back, clone, bar, menu);
      layer.appendChild(wrap);
      const H = lr.h;
      const ch = r.h * scale;
      const mh = menu.offsetHeight || 240;
      let top = r.y - lr.y;
      const minTop = 120;
      const maxTop = H - 40 - mh - 14 - ch;
      if (top > maxTop) top = Math.max(minTop, maxTop);
      if (top < minTop) top = minTop;
      clone.style.left = r.x - lr.x + 'px';
      clone.style.top = top + 'px';
      clone.style.width = r.w + 'px';
      if (scale < 1) { clone.style.transformOrigin = out ? '100% 0' : '0 0'; clone.style.transform = `scale(${scale})`; }
      const bw = 300;
      const bx = out ? Math.max(12, Math.min(402 - bw - 12, r.x - lr.x + r.w - bw)) : Math.max(12, Math.min(402 - bw - 12, r.x - lr.x));
      bar.style.left = bx + 'px';
      bar.style.top = top - 58 + 'px';
      menu.style.top = top + ch + 12 + 'px';
      const mx = out ? Math.max(12, r.x - lr.x + r.w - 250) : Math.max(12, Math.min(402 - 262, r.x - lr.x));
      menu.style.left = mx + 'px';
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
      U.anim(clone, [{ transform: (scale < 1 ? `scale(${scale}) ` : '') + `translateY(${r.y - lr.y - top}px)` }, { transform: scale < 1 ? `scale(${scale})` : 'none' }], { duration: 300, easing: U.SPRING });
      U.anim(bar, [{ opacity: 0, transform: 'scale(.5) translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: U.SPRING });
      U.anim(menu, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: U.SPRING });
      JC.ui.onTap(back, () => close());
      function close() {
        conv._closeLP = null;
        U.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 170 }).then(() => wrap.remove());
      }
      conv._closeLP = close;
    }

    function reactionsSheet(m) {
      const reacts = m.react || [];
      JC.ui.sheet({
        title: 'Reactions', detent: 'medium', cls: 'msg-react-sheet', right: { text: 'Done', bold: false },
        content: () => JC.ui.list([{ rows: reacts.map((r) => ({
          avatar: r.by === 'me' ? 'me' : r.by, avatarSize: 34,
          title: r.by === 'me' ? 'You' : JC.contacts.name(r.by),
          subtitle: M.tbVerb[r.t] + ' this message',
          right: h('div.msg-react.big', { class: { mine: r.by === 'me' } }, M.tbGlyph(r.t, 17)),
          onTap: r.by !== 'me' ? () => JC.os.open('contacts', { contact: r.by }) : undefined,
        })) }]),
      });
    }

    function failSheet(m) {
      JC.audio.haptic(8);
      JC.ui.actionSheet({
        title: 'Your message was not delivered.',
        message: dead ? 'The number you are texting is no longer in service.' : (!JC.os.online() ? 'This iPhone is not connected to the internet.' : ''),
        actions: [
          { text: 'Try Again', onTap: () => retry(m) },
          { text: 'Delete Message', style: 'destructive', onTap: () => { M.prefSet('hidden:' + tid, m.id, 1); refresh(); } },
        ],
      });
    }
    function retry(m) {
      if (dead || !JC.os.online()) {
        const rec = nodes.get(m.id);
        if (rec) { sendingUntil[m.id] = 1; refresh(); }
        flashProgress(dead ? 2600 : 1400, () => { delete sendingUntil[m.id]; refresh(); JC.audio.haptic([10, 60, 10]); const r2 = nodes.get(m.id); if (r2) r2.el.classList.add('justfailed'); });
        return;
      }
      M.prefSet('hidden:' + tid, m.id, 1);
      const p = {};
      ['text', 'img', 'voice', 'loc', 'link', 'effect'].forEach((k) => { if (m[k]) p[k] = m[k]; });
      if (m.memo) { delete p.voice; p.memo = m.memo; }
      conv.send(p);
    }

    // ── select mode ("More…") ──────────────────────────────────────────────
    function enterSelect(firstId) {
      selected = new Set(firstId ? [firstId] : []);
      page.el.classList.add('selecting');
      composer.hidden = true;
      tray.hidden = true;
      selBar.hidden = false;
      renderSelBar();
      list.querySelectorAll('.msg-m').forEach((el) => el.classList.toggle('sel', selected.has(el.dataset.id)));
    }
    function exitSelect() {
      selected = null;
      page.el.classList.remove('selecting');
      composer.hidden = false;
      selBar.hidden = true;
      list.querySelectorAll('.msg-m.sel').forEach((el) => el.classList.remove('sel'));
      trayKey = null;
      renderTray();
    }
    function renderSelBar() {
      selBar.innerHTML = '';
      const n = selected ? selected.size : 0;
      selBar.append(
        h('div.msg-sel-btn', { class: { off: !n }, onTap: () => {
          if (!n) return;
          JC.ui.actionSheet({ actions: [{ text: n === 1 ? 'Delete Message' : 'Delete ' + n + ' Messages', style: 'destructive', onTap: () => { selected.forEach((id) => M.prefSet('hidden:' + tid, id, 1)); exitSelect(); refresh(); } }] });
        } }, JC.icon('trash', { size: 22 })),
        h('div.msg-sel-n', n ? n + ' Selected' : 'Select Messages'),
        h('div.msg-sel-btn', { class: { off: !n }, onTap: () => {
          if (!n) return;
          const msgs = JC.story.messages(tid).filter((x) => selected.has(x.id));
          exitSelect();
          if (msgs.length === 1 && msgs[0].img) JC.ui.share({ title: JC.art.meta(msgs[0].img).title || 'Photo', subtitle: 'Photo', art: msgs[0].img, payload: { kind: 'photo', art: msgs[0].img } });
          else app.openCompose({ text: msgs.map((x) => x.text || JC.story.preview(x)).join('\n') });
        } }, JC.icon('arrowshape.turn.up.right', { size: 22 })));
    }
    list.addEventListener('click', (e) => {
      if (!selected) return;
      const el = e.target.closest('.msg-m');
      e.stopPropagation();
      e.preventDefault();
      if (!el) return;
      const id = el.dataset.id;
      if (selected.has(id)) selected.delete(id); else selected.add(id);
      el.classList.toggle('sel', selected.has(id));
      JC.audio.haptic(5);
      renderSelBar();
    }, true);

    // ── lifecycle ──────────────────────────────────────────────────────────
    conv.isTop = () => app.nav.top() === page;
    conv.onShow = () => {
      if (conv.destroyed) return;
      conv.shown = true;
      if (app.isVisible()) {
        JC.story.setOpen(tid);
      }
      renderHead();
      refresh();
      conv.onTyping();
      trayKey = null;
      renderTray();
    };
    conv.onHide = () => {
      conv.shown = false;
      if (JC.story.openThread && JC.story.openThread() === tid) JC.story.setOpen(null);
      if (JC.kb.target === field) { JC.kb.suggest(null); field.blur(); }
      clearInterval(timerInt);
      M.stopVoice();
    };
    conv.appHidden = () => {
      if (JC.story.openThread && JC.story.openThread() === tid) JC.story.setOpen(null);
      clearInterval(timerInt);
      M.stopVoice();
      if (conv.recording && conv._stopRecorder) conv._stopRecorder();
    };
    conv.appShown = () => {
      if (!conv.isTop()) return;
      JC.story.setOpen(tid);
      renderHead();
      refresh();
      conv.onTyping();
      trayKey = null;
      renderTray();
    };
    conv.onThread = (evt) => {
      refresh(evt);
      if (conv.isTop() && app.isVisible()) {
        const t = M.thread(tid);
        if (t && t.unread) JC.story.markRead(tid);
      }
    };
    conv.onThreads = () => renderHead();
    conv.onPending = () => { if (!picking) { trayKey = null; renderTray(); } };
    conv.closeOverlays = () => {
      for (const k of ['_closeLP', '_closeFx', '_closePlus', '_closePop']) if (conv[k]) { conv[k](); conv[k] = null; return true; }
      if (conv._closeViewer) { conv._closeViewer(); return true; }
      if (selected) { exitSelect(); return true; }
      if (conv.recording && conv._stopRecorder) { conv._stopRecorder(); return true; }
      return false;
    };
    conv.destroy = () => {
      if (conv.destroyed) return;
      conv.destroyed = true;
      clearInterval(timerInt);
      if (ro) ro.disconnect();
      if (JC.story.openThread && JC.story.openThread() === tid) JC.story.setOpen(null);
      M.stopVoice();
      if (app.onConvClosed) app.onConvClosed(conv);
    };

    // ── initial render ─────────────────────────────────────────────────────
    const t0 = M.thread(tid);
    if (t0 && t0.draft) { field.value = t0.draft; setTimeout(autoGrow, 0); fieldWrap.classList.add('has'); }
    renderHead();
    refresh();
    conv.onTyping();
    renderTray();
    if (opts.compose) {
      const c = opts.compose;
      if (c.text) { field.value = c.text; setTimeout(autoGrow, 0); }
      if (c.img) setAttachment({ kind: 'img', payload: { img: c.img } });
      else if (c.memo) { let mm = null; try { mm = JC.store.get('memos', c.memo); } catch (e) { mm = null; } setAttachment({ kind: 'memo', title: mm ? mm.title : 'Voice Memo', dur: mm ? mm.dur : 0, payload: { memo: c.memo } }); }
      else if (c.loc) setAttachment({ kind: 'loc', payload: { loc: c.loc } });
      onFieldInput();
    }
    requestAnimationFrame(() => {
      if (opts.msg && nodes.get(opts.msg)) conv.scrollToMsg(opts.msg);
      else toBottom(false);
    });
    return conv;
  };

  // ── image viewer ─────────────────────────────────────────────────────────
  M.viewer = (app, tid, msgId, conv) => {
    const hidden = M.prefMap('hidden:' + tid);
    const imgs = JC.story.messages(tid).filter((m) => m.img && !m.unsent && !hidden[m.id]);
    let idx = Math.max(0, imgs.findIndex((m) => m.id === msgId));
    const layer = JC.ui.layer();
    const stage = h('div.msg-vw-stage');
    const titleT = h('div.msg-vw-t');
    const titleS = h('div.msg-vw-s');
    const heartBtn = h('div.msg-vw-btn', { onTap: () => tapbackPick() }, JC.icon('heart', { size: 23 }));
    const top = h('div.msg-vw-top',
      JC.ui.navBtn({ icon: 'chevron.left', weight: 2.4, iconSize: 20, label: 'Back', onTap: () => close() }),
      h('div.msg-vw-title', titleT, titleS),
      JC.ui.navBtn({ icon: 'square.grid.2x2', iconSize: 19, label: 'All Photos', onTap: () => grid() }));
    const bottomBar = h('div.msg-vw-bottom',
      h('div.msg-vw-btn', { onTap: () => { const m = imgs[idx]; JC.ui.share({ title: JC.art.meta(m.img).title || 'Photo', subtitle: 'Photo', art: m.img, payload: { kind: 'photo', art: m.img } }); } }, JC.icon('square.and.arrow.up', { size: 23 })),
      heartBtn,
      h('div.msg-vw-btn', { onTap: () => { const m = imgs[idx]; close(); if (conv && conv.setReply) { conv.setReply(m); setTimeout(() => conv.field.focus(), 280); } } }, JC.icon('arrowshape.turn.up.left', { size: 23 })),
      h('div.msg-vw-btn', { onTap: () => M.savePhoto(imgs[idx].img) }, JC.icon('square.and.arrow.down', { size: 23 })));
    const el = h('div.msg-viewer', stage, top, bottomBar);
    layer.appendChild(el);
    let zoom = 1;
    let lastTap = 0;
    function render() {
      const m = imgs[idx];
      if (!m) return;
      stage.innerHTML = '';
      const img = JC.art.img(m.img, { cls: 'msg-vw-img' });
      stage.appendChild(img);
      zoom = 1;
      titleT.textContent = m.from === 'me' ? 'You' : JC.contacts.short(m.from);
      titleS.textContent = U.fmtStamp(m.t);
      const mine = (m.react || []).find((r) => r.by === 'me');
      heartBtn.innerHTML = '';
      heartBtn.appendChild(JC.icon(mine ? 'heart.fill' : 'heart', { size: 23 }));
      heartBtn.classList.toggle('on', !!mine);
      JC.story.act('photo_view', { id: m.img, from: 'messages' });
    }
    function go(d) {
      const n = idx + d;
      if (n < 0 || n >= imgs.length) {
        U.anim(stage, [{ transform: 'translateX(0)' }, { transform: `translateX(${-d * 30}px)` }, { transform: 'translateX(0)' }], { duration: 260, fill: 'none' });
        return;
      }
      idx = n;
      render();
      U.anim(stage, [{ transform: `translateX(${d * 60}px)`, opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 260, fill: 'none' });
    }
    function tapbackPick() {
      const m = imgs[idx];
      const bar = h('div.msg-lp-bar.msg-vw-tb', M.TAPBACKS.map((tb) => h('div.msg-lp-tb', { onTap: () => { JC.audio.play('pop'); JC.story.react(tid, m.id, tb.t); bar.remove(); imgs[idx] = JC.story.messages(tid).find((x) => x.id === m.id) || m; render(); } }, M.tbGlyph(tb.t, 21))));
      el.appendChild(bar);
      U.anim(bar, [{ opacity: 0, transform: 'translateX(-50%) scale(.6)' }, { opacity: 1, transform: 'translateX(-50%) scale(1)' }], { duration: 300, easing: U.SPRING });
      setTimeout(() => { if (bar.isConnected) bar.remove(); }, 5000);
    }
    function grid() {
      const s = JC.ui.sheet({
        title: imgs.length + ' Photos', detent: 'large', cls: 'msg-photos-sheet', right: { text: 'Done', bold: false },
        content: () => h('div.msg-ph-grid', imgs.map((m, i) => h('div.msg-ph-cell', { style: { backgroundImage: `url("${JC.art.url(m.img)}")` }, onTap: () => { s.close(); idx = i; render(); } }))),
      });
    }
    U.drag(stage, {
      move: (e, p) => {
        if (zoom > 1) return;
        if (p.axis === 'y' && p.dy > 0) {
          stage.style.transform = `translateY(${p.dy}px) scale(${1 - Math.min(0.3, p.dy / 1200)})`;
          el.style.setProperty('--vw-a', String(1 - Math.min(1, p.dy / 400)));
        } else if (p.axis === 'x') stage.style.transform = `translateX(${p.dx}px)`;
      },
      end: (e, p) => {
        stage.style.transform = '';
        el.style.removeProperty('--vw-a');
        if (zoom > 1) return;
        if (p.axis === 'y' && (p.dy > 120 || p.vy > 0.6)) { close(); return; }
        if (p.axis === 'x' && (p.dx < -70 || p.vx < -0.5)) go(1);
        else if (p.axis === 'x' && (p.dx > 70 || p.vx > 0.5)) go(-1);
      },
      tap: () => {
        const n = performance.now();
        if (n - lastTap < 300) {
          zoom = zoom > 1 ? 1 : 2.2;
          const img = stage.querySelector('.msg-vw-img');
          if (img) img.style.transform = `scale(${zoom})`;
          lastTap = 0;
          return;
        }
        lastTap = n;
        setTimeout(() => { if (lastTap === n) el.classList.toggle('immersive'); }, 310);
      },
    });
    function close() {
      if (conv) conv._closeViewer = null;
      U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => el.remove());
    }
    if (conv) conv._closeViewer = close;
    render();
    U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    U.anim(stage, [{ transform: 'scale(.85)' }, { transform: 'scale(1)' }], { duration: 320, easing: U.SPRING, fill: 'none' });
    return { close };
  };

  /** Share My Location (alert with durations) */
  M.shareLocation = (tid) => {
    const who = M.isGroup(tid) ? 'this conversation' : JC.contacts.short(M.peer(tid));
    JC.ui.alert({
      title: 'Share Location',
      message: 'Share your location with ' + who + '?',
      stack: true,
      buttons: [
        { text: 'Share for One Hour', onTap: () => start('for one hour', 3600e3) },
        { text: 'Share Until End of Day', onTap: () => start('until the end of the day', 0) },
        { text: 'Share Indefinitely', onTap: () => start('indefinitely', -1) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
    function start(label, ms) {
      M.prefSet('sharing', tid, { label, until: ms > 0 ? JC.time.now() + ms : ms });
      JC.story.incoming(tid, { from: 'sys', sys: true, text: 'You started sharing location with ' + (M.isGroup(tid) ? 'the group' : JC.contacts.short(M.peer(tid))) + '.' });
      JC.ui.toast('Sharing location ' + label, { icon: 'location.fill' });
    }
  };
})();
