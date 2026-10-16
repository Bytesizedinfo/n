/* JC.story — branching story engine: threads, scenes, choices, suspicion, calls, endings, rewind. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const U = JC.util;

  const defs = { threads: {}, scenes: {}, calls: {}, endings: {}, dial: [], susHooks: [], totalHooks: [] };
  const histCache = {};
  let openTh = null;
  let loopT = null;
  let lastTick = 0;
  let call = null; // live call state (not persisted)
  let callRun = null;
  let ringT = 0;
  let endT = null;
  const S = () => JC.state.d;

  // ── Authoring API ────────────────────────────────────────────────
  const story = {
    intro: [],
    lockNotifs: [],
    thread(def) {
      defs.threads[def.id] = Object.assign({ members: [def.id], group: false, service: 'imessage', history: [] }, def);
      defs.threads[def.id].group = !!(def.members && def.members.length > 1) || !!def.group;
      delete histCache[def.id];
      return def;
    },
    scene(def) { defs.scenes[def.id] = def; return def; },
    call(def) { defs.calls[def.id] = def; return def; },
    ending(def) { defs.endings[def.id] = def; return def; },
    dialScript(cid, callId, when) { defs.dial.push({ cid, callId, when }); },
    onSuspicion(cid, n, sceneId) { defs.susHooks.push({ cid, n, sceneId }); },
    onTotalSuspicion(n, sceneId) { defs.totalHooks.push({ n, sceneId }); },
    defs,
  };
  JC.story = story;

  // ── State helpers ────────────────────────────────────────────────
  function th(id) {
    const t = S().threads;
    if (!t[id]) t[id] = { live: [], unread: 0, pend: null };
    return t[id];
  }
  function tdef(id) {
    if (defs.threads[id]) return defs.threads[id];
    const st = S().threads[id];
    if (st && st.dyn) return { id, members: st.members || [id], group: (st.members || []).length > 1, name: st.name || null, service: 'imessage', history: [], dyn: true };
    const c = JC.contacts.get(id);
    if (c) return { id, members: [id], group: false, service: c.service ? 'sms' : 'imessage', history: [], dyn: true };
    return null;
  }
  story.threadDef = tdef;
  function threadName(id) {
    const d = tdef(id);
    const st = S().threads[id];
    if (st && st.rename) return st.rename;
    if (!d) return id;
    if (d.group) return d.name || d.members.map((m) => JC.contacts.short(m)).join(', ');
    return JC.contacts.name(d.members[0]);
  }
  story.threadName = threadName;
  function members(id) {
    const d = tdef(id);
    const st = S().threads[id];
    if (st && st.members) return st.members;
    return d ? d.members : [id];
  }

  function sApi() {
    const s = S();
    return {
      flags: s.flags, sus: s.sus, aff: s.aff, done: s.done, fin: s.fin, endings: s.endings,
      flag: (n) => s.flags[n], susTotal: () => story.susTotal(), now: JC.time.now(), eng: s.eng,
      count: (n) => s.flags[n] || 0,
    };
  }
  function evalFn(fn, fallback) {
    if (typeof fn !== 'function') return fallback;
    try { return fn(sApi()); } catch (e) { console.error('story condition error', e); return fallback; }
  }

  // ── History normalization ────────────────────────────────────────
  const EXTRA_KEYS = ['img', 'voice', 'link', 'loc', 'react', 'unsent', 'edited', 'fail', 'effect', 'sys', 'sticker', 'memo', 'u'];
  function normHist(id) {
    if (histCache[id]) return histCache[id];
    const d = defs.threads[id];
    const out = [];
    if (d && d.history) {
      d.history.forEach((row, i) => {
        if (!row) return;
        let m;
        if (Array.isArray(row)) {
          const [t, from, text, extra] = row;
          m = { id: id + ':h' + i, t: JC.time.parse(t), from: from || 'me', text: text || '' };
          if (extra) EXTRA_KEYS.forEach((k) => { if (extra[k] !== undefined) m[k] = extra[k]; });
          if (extra && extra.caption) m.caption = extra.caption;
        } else {
          m = Object.assign({ id: id + ':h' + i }, row, { t: JC.time.parse(row.t) });
        }
        if (m.react && !Array.isArray(m.react)) m.react = [m.react];
        m.hist = true;
        out.push(m);
      });
    }
    out.sort((a, b) => a.t - b.t);
    histCache[id] = out;
    return out;
  }

  function preview(m) {
    if (!m) return '';
    if (m.unsent) return (m.from === 'me' ? 'You' : JC.contacts.short(m.from)) + ' unsent a message';
    if (m.sys) return m.text;
    if (m.img) return m.text ? m.text : 'Photo';
    if (m.voice) return 'Audio Message';
    if (m.memo) return 'Audio Message';
    if (m.loc) return 'Location';
    if (m.link) return m.link.title || m.text || 'Link';
    if (m.effect === 'invisible') return 'Message sent with Invisible Ink';
    return m.text || '';
  }
  story.preview = preview;

  // ── Runtime: messages & threads ─────────────────────────────────
  story.messages = (id) => {
    const st = th(id);
    const hist = normHist(id);
    const all = hist.concat(st.live || []);
    // apply runtime reactions/unsends to history messages
    const mods = st.mods || {};
    const out = [];
    all.forEach((m) => {
      let o = m;
      if (mods[m.id]) o = Object.assign({}, m, mods[m.id]);
      if (o.hidden) return;
      if (o.from === 'me' && !o.status) o = Object.assign({}, o, { status: o.fail ? 'failed' : 'read' });
      out.push(o);
    });
    return out;
  };

  story.threads = () => {
    const ids = new Set(Object.keys(defs.threads));
    Object.keys(S().threads).forEach((k) => { if (S().threads[k].dyn || S().threads[k].live.length) ids.add(k); });
    const out = [];
    ids.forEach((id) => {
      const d = tdef(id);
      if (!d) return;
      const st = th(id);
      const msgs = story.messages(id);
      const last = msgs[msgs.length - 1] || null;
      if (st.removed && (!last || last.t <= st.removed)) return;
      if (!last && !st.dyn) return;
      out.push({
        id, name: threadName(id), members: members(id), group: !!d.group, service: d.service, fails: !!d.fails,
        pinned: st.pinned != null ? st.pinned : !!d.pinned, muted: st.muted != null ? st.muted : !!d.muted,
        unread: st.unread || 0, last, typing: st.typing || null, pending: !!st.pend, draft: st.draft || '',
      });
    });
    out.sort((a, b) => ((b.last ? b.last.t : 0) - (a.last ? a.last.t : 0)));
    return out;
  };

  story.pending = (id) => {
    const st = th(id);
    if (!st.pend) return null;
    const run = S().runs.find((r) => r.rid === st.pend.rid);
    if (!run) { st.pend = null; return null; }
    const step = stepAt(run);
    if (!step || !step.choice) return null;
    const opts = visibleOptions(step);
    return { options: opts.map((o, i) => ({ i, label: o.label || o.t, text: o.t, silent: !!o.silent })), timeout: step.timeout || 0, left: run.tleft > 0 ? run.tleft : 0 };
  };

  function visibleOptions(step) {
    return (step.choice || []).filter((o) => !o.if || evalFn(o.if, false));
  }

  story.typing = (id) => th(id).typing || null;
  story.openThread = () => openTh;
  story.setOpen = (id) => {
    openTh = id;
    if (id) story.markRead(id);
  };
  story.markRead = (id) => {
    const st = th(id);
    if (st.unread) { st.unread = 0; JC.state.save(); }
    JC.notify.seen({ thread: id });
    updateBadge();
    JC.bus.emit('story:threads');
  };
  story.pin = (id, on) => { th(id).pinned = !!on; JC.state.save(); JC.bus.emit('story:threads'); };
  story.mute = (id, on) => { th(id).muted = !!on; JC.state.save(); JC.bus.emit('story:threads'); JC.bus.emit('story:thread', { thread: id }); };
  story.remove = (id) => { th(id).removed = JC.time.now(); th(id).unread = 0; JC.state.save(); updateBadge(); JC.bus.emit('story:threads'); };
  story.rename = (id, name) => {
    th(id).rename = name || null;
    JC.state.save();
    if (name) deliver(id, { from: 'sys', sys: true, text: 'You named the conversation \u201C' + name + '\u201D.' }, { quiet: true });
    JC.bus.emit('story:threads');
    JC.bus.emit('story:thread', { thread: id });
  };
  story.restore = (id) => { delete th(id).removed; JC.state.save(); JC.bus.emit('story:threads'); };
  story.removed = () => Object.keys(S().threads).filter((k) => S().threads[k].removed).map((k) => ({ id: k, name: threadName(k), at: S().threads[k].removed }));
  story.hideMsg = (id, msgId) => applyMod(id, msgId, { hidden: true });
  story.markUnread = (id) => { th(id).unread = Math.max(1, th(id).unread || 0); JC.state.save(); updateBadge(); JC.bus.emit('story:threads'); };
  story.setDraft = (id, text) => { th(id).draft = text; JC.state.save(); };
  story.threadFor = (cid) => {
    if (defs.threads[cid]) return cid;
    const st = th(cid);
    if (!st.dyn) { st.dyn = true; st.members = [cid]; }
    return cid;
  };
  story.newGroup = (cids, name) => {
    const id = U.uid('g');
    const st = th(id);
    st.dyn = true;
    st.members = cids.slice();
    st.name = name || null;
    JC.state.save();
    return id;
  };
  story.canReply = (id) => {
    const d = tdef(id);
    if (!d) return false;
    if (d.fails) return false;
    return members(id).some((m) => { const c = JC.contacts.get(m); return c && !c.service && !['ajie', 'mom', 'dad', 'hq'].includes(m); });
  };

  story.react = (id, msgId, type) => {
    const st = th(id);
    st.mods = st.mods || {};
    const cur = story.messages(id).find((m) => m.id === msgId);
    if (!cur) return;
    let r = (cur.react || []).filter((x) => x.by !== 'me');
    const had = (cur.react || []).find((x) => x.by === 'me' && x.t === type);
    if (!had) r = r.concat({ by: 'me', t: type });
    applyMod(id, msgId, { react: r });
    story.act('tapback', { thread: id, msg: msgId, t: type });
  };
  function applyMod(id, msgId, patch) {
    const st = th(id);
    const live = st.live.find((m) => m.id === msgId);
    if (live) Object.assign(live, patch);
    else {
      st.mods = st.mods || {};
      st.mods[msgId] = Object.assign(st.mods[msgId] || {}, patch);
    }
    JC.state.save();
    JC.bus.emit('story:thread', { thread: id });
  }

  story.search = (q) => {
    q = (q || '').toLowerCase();
    if (!q) return [];
    const out = [];
    story.threads().forEach((t) => {
      story.messages(t.id).forEach((m) => {
        if (m.text && !m.unsent && m.text.toLowerCase().includes(q)) out.push({ thread: t.id, id: m.id, name: t.name, avatar: t.group ? t.members[0] : t.members[0], text: m.text, t: m.t, from: m.from });
      });
    });
    return out.sort((a, b) => b.t - a.t);
  };

  function updateBadge() {
    let n = 0;
    Object.keys(S().threads).forEach((k) => { n += S().threads[k].unread || 0; });
    JC.notify.badge('messages', n);
  }
  story.updateBadge = updateBadge;

  function lastMsg(id) {
    const st = th(id);
    if (st.live.length) return st.live[st.live.length - 1];
    const h = normHist(id);
    return h[h.length - 1];
  }

  /** deliver a message into a thread (live) */
  function deliver(id, m, opts) {
    opts = opts || {};
    const st = th(id);
    if (st.removed) delete st.removed;
    m.id = m.id || U.uid('m');
    m.t = m.t || JC.time.now();
    st.live.push(m);
    if (m.from !== 'me' && !m.sys) {
      // the contact has read everything "you" sent
      st.live.forEach((x) => { if (x.from === 'me' && x.status === 'delivered') { x.status = 'read'; x.readAt = m.t; } });
      const d = tdef(id);
      const viewing = openTh === id && JC.os.isOpen('messages') && !JC.os.locked;
      if (viewing) {
        JC.audio.play('receive');
      } else if (!opts.quiet) {
        st.unread = (st.unread || 0) + 1;
        const muted = st.muted != null ? st.muted : d && d.muted;
        JC.notify.push({
          app: 'messages',
          title: threadName(id),
          subtitle: d && d.group ? JC.contacts.short(m.from) : undefined,
          body: preview(m),
          avatar: m.from,
          group: d && d.group ? members(id) : undefined,
          thread: id,
          open: { app: 'messages', intent: { thread: id } },
          silent: !!muted,
          art: m.img || undefined,
        });
      }
      updateBadge();
    }
    JC.state.save();
    JC.bus.emit('story:thread', { thread: id, msg: m });
    JC.bus.emit('story:threads');
    return m;
  }
  story.incoming = (id, o) => {
    const d = tdef(id) || story.thread({ id, members: [id] });
    return deliver(id, Object.assign({ from: o.from || members(id)[0] }, o));
  };

  // ── Effects & suspicion ──────────────────────────────────────────
  function applyFx(fx) {
    if (!fx) return;
    const s = S();
    if (fx.set) Object.keys(fx.set).forEach((k) => { s.flags[k] = fx.set[k]; });
    if (fx.inc) Object.keys(fx.inc).forEach((k) => { s.flags[k] = (s.flags[k] || 0) + fx.inc[k]; });
    if (fx.aff) Object.keys(fx.aff).forEach((k) => { s.aff[k] = (s.aff[k] || 0) + fx.aff[k]; });
    if (fx.sus) Object.keys(fx.sus).forEach((k) => {
      const before = s.sus[k] || 0;
      s.sus[k] = Math.max(0, before + fx.sus[k]);
      if (s.sus[k] !== before) JC.bus.emit('story:sus', { cid: k, value: s.sus[k], delta: fx.sus[k] });
    });
    if (fx.log) story.log(fx.log);
    if (fx.hint) story.hint(fx.hint);
    JC.state.save();
    checkSuspicion();
  }
  story.applyFx = applyFx;

  /** Remember something the player did with the phone; the ending card lists these. `once` dedupes by key. */
  story.log = (text, o) => {
    if (!text) return;
    const s = S();
    s.trace = s.trace || [];
    const k = (o && o.once) || null;
    if (k && s.trace.some((x) => x.k === k)) return;
    s.trace.push({ t: JC.time.now(), text: String(text), k });
    if (s.trace.length > 80) s.trace.splice(0, s.trace.length - 80);
    JC.state.save();
  };
  story.trace = () => (S().trace || []).slice();
  /** A brief consequence cue in the Dynamic Island ("A-Ling will remember that."). Settings → Story Hints turns it off. */
  story.hint = (text, icon) => {
    if (!text || S().settings.storyHints === false || !JC.os.hint) return;
    JC.os.hint(String(text), icon);
  };
  function checkSuspicion() {
    const s = S();
    if (s.ended) return;
    defs.susHooks.forEach((hk) => { if ((s.sus[hk.cid] || 0) >= hk.n && !s.done[hk.sceneId]) startScene(hk.sceneId); });
    const tot = story.susTotal();
    defs.totalHooks.forEach((hk) => { if (tot >= hk.n && !s.done[hk.sceneId]) startScene(hk.sceneId); });
  }
  story.sus = (cid) => S().sus[cid] || 0;
  story.susTotal = () => Object.values(S().sus).reduce((a, b) => a + (b || 0), 0);
  story.susLevel = (cid) => U.clamp((S().sus[cid] || 0) / 10, 0, 1);
  story.flag = (n) => S().flags[n];
  story.aff = (cid) => S().aff[cid] || 0;

  // ── Scenes ───────────────────────────────────────────────────────
  function startScene(id, opts) {
    opts = opts || {};
    const def = defs.scenes[id];
    if (!def) { console.warn('[story] unknown scene', id); return null; }
    const s = S();
    if (s.ended) return null;
    if (s.done[id] && !opts.force) return null;
    s.done[id] = 1;
    const run = { rid: U.uid('r'), sc: id, kind: 'scene', node: 'start', i: 0, until: s.eng + (opts.delay || 0) * 1000, phase: null, th: opts.th || null, wait: null };
    s.runs.push(run);
    JC.state.save();
    return run;
  }
  story.start = (id, opts) => startScene(id, opts);

  function sceneOf(run) {
    if (run.kind === 'call') return defs.calls[run.sc] || (call && call.def && call.def.id === run.sc ? call.def : null);
    if (run.kind === 'aside') return { nodes: { start: run.steps }, thread: run.th };
    return defs.scenes[run.sc];
  }
  function stepAt(run) {
    const sc = sceneOf(run);
    if (!sc) return null;
    const nodes = sc.nodes || {};
    const arr = nodes[run.node];
    if (!arr) return null;
    return arr[run.i] || null;
  }
  // Scenes marked `polite` (app reactions) don't talk over another scene in the same thread: they wait while
  // someone else is typing there or the player has an open question there.
  function openQuestion(tid, run) {
    const p = th(tid).pend;
    return !!p && p.rid !== run.rid && S().runs.some((r) => r.rid === p.rid && r.wait === 'choice');
  }
  function politeWait(run, tid) {
    const sc = sceneOf(run);
    if (!sc || !sc.polite || !tid) return false;
    if (openQuestion(tid, run)) return true;
    return S().runs.some((r) => r !== run && r.phase === 'typing' && runThread(r, stepAt(r)) === tid);
  }

  function runThread(run, step) {
    if (step && step.th) return step.th;
    if (run.th) return run.th;
    const sc = sceneOf(run);
    return (sc && sc.thread) || null;
  }

  function finishRun(run) {
    const s = S();
    const i = s.runs.indexOf(run);
    if (i >= 0) s.runs.splice(i, 1);
    if (run.kind === 'scene') s.fin[run.sc] = s.eng || 1;
    // clear any pending choice belonging to this run
    Object.keys(s.threads).forEach((k) => { if (s.threads[k].pend && s.threads[k].pend.rid === run.rid) { s.threads[k].pend = null; JC.bus.emit('story:pending', { thread: k }); } });
    if (run.kind === 'call' && call && call.run === run.rid && call.phase === 'active') endCall('them');
    JC.state.save();
  }

  function speed() { return S().settings.speed || 1; }
  function typingMs(text) {
    const len = (text || '').length;
    return U.clamp(650 + len * 32, 900, 4200) / speed();
  }

  function ensureThread(id, from) {
    if (tdef(id)) return;
    const st = th(id);
    st.dyn = true;
    st.members = from ? [from] : [id];
  }

  function msgFromStep(step, from) {
    const m = { from, text: step.m != null ? step.m : step.me != null ? step.me : '' };
    ['img', 'voice', 'link', 'loc', 'effect', 'sticker', 'memo', 'caption'].forEach((k) => { if (step[k] !== undefined) m[k] = step[k]; });
    return m;
  }

  function addItem(spec) {
    const to = spec.to;
    const item = Object.assign({}, spec.item);
    if (to === 'photos' && !item.t) item.t = JC.time.now();
    if (to === 'posts' && !item.t) item.t = JC.time.now();
    if (to === 'mail' && !item.t) item.t = JC.time.now();
    const added = JC.store.add(to, item, { front: to === 'notes' || to === 'posts' || to === 'mail' });
    if (spec.notify) {
      const n = typeof spec.notify === 'object' ? spec.notify : null;
      const APP = { mail: 'mail', events: 'calendar', notes: 'notes', photos: 'photos', posts: 'wavelet', reminders: 'reminders', memos: 'voicememos', tx: 'wallet', orders: 'lotuseats', rides: 'swift', voicemails: 'phone', calls: 'phone' };
      const app = (n && n.app) || APP[to] || to;
      let title = (n && n.title) || '';
      let body = (n && n.body) || '';
      if (!n) {
        if (to === 'mail') { title = item.from ? item.from.name : 'Mail'; body = (item.subject || '') + (item.body ? '\n' + item.body.slice(0, 90) : ''); }
        else if (to === 'events') { title = 'Calendar'; body = (item.title || 'Event') + ' — ' + U.fmtDate(added.start, 'md') + (added.allDay ? '' : ' ' + U.fmtTime(added.start)); }
        else if (to === 'posts') { title = 'Wavelet'; body = '@' + (item.by || 'someone') + ': ' + (item.text || 'posted a photo'); }
        else if (to === 'photos') { title = 'Photos'; body = 'New photo saved'; }
        else if (to === 'voicemails') { title = 'Voicemail'; body = 'New voicemail from ' + JC.contacts.name(item.contact); }
        else { title = JC.notify.appName(app); body = item.title || item.text || ''; }
      }
      JC.notify.push({ app, title, body, art: to === 'photos' || to === 'posts' ? item.art : undefined, open: { app, intent: { id: added.id } } });
    }
    return added;
  }

  function memberAdd(id, cid) {
    const st = th(id);
    const cur = members(id).slice();
    if (!cur.includes(cid)) cur.push(cid);
    st.members = cur;
    JC.bus.emit('story:thread', { thread: id });
  }
  function memberRemove(id, cid) {
    const st = th(id);
    st.members = members(id).filter((m) => m !== cid);
    JC.bus.emit('story:thread', { thread: id });
  }

  /** run steps until something waits */
  function process(run) {
    const s = S();
    // story._ff (test harness only): schedule from when the step was due, not when the tick noticed it,
    // so fast-forwarded play time keeps messages and trigger delays in their real proportions.
    const at = (ms) => (story._ff && run.until && run.until <= s.eng ? run.until : s.eng) + ms;
    let guard = 0;
    while (guard++ < 200) {
      if (s.ended) return;
      if (!s.runs.includes(run)) return;
      if (run.wait) return;
      if (run.until && s.eng < run.until) return;
      const sc = sceneOf(run);
      if (!sc) { finishRun(run); return; }
      const arr = (sc.nodes || {})[run.node];
      if (!arr) { console.warn('[story] missing node', run.sc, run.node); finishRun(run); return; }
      if (run.i >= arr.length) { finishRun(run); return; }
      const step = arr[run.i];
      const tid = runThread(run, step);

      if (step.m != null || (step.img && step.m == null && step.me == null && !step.choice && !step.add)) {
        // NPC message
        if (!JC.os.online()) { run.until = s.eng + 1500; return; }
        const mem = tid ? members(tid) : [];
        const from = step.from || mem[0] || tid;
        if (tid) ensureThread(tid, from);
        if (run.phase !== 'typing' && politeWait(run, tid)) { run.until = s.eng + 1500; return; }
        if (run.phase !== 'typing') {
          run.phase = 'typing';
          if (tid) { th(tid).typing = from; JC.bus.emit('story:typing', { thread: tid, who: from }); }
          run.until = at(step.d != null ? step.d * 1000 / speed() : typingMs(step.m));
          return;
        }
        run.phase = null;
        if (tid) {
          th(tid).typing = null;
          JC.bus.emit('story:typing', { thread: tid, who: null });
          deliver(tid, msgFromStep(step, from));
        }
        run.i++;
        run.until = at((500 + Math.random() * 500) / speed());
        continue;
      }
      if (step.me != null) {
        if (tid) deliver(tid, Object.assign(msgFromStep(step, 'me'), { status: 'delivered' }));
        run.i++;
        continue;
      }
      if (step.say != null) {
        if (!call || call.run !== run.rid) { run.i++; continue; }
        if (run.phase !== 'say') {
          // a function computes the line from the story state; null/'' skips it
          const line = typeof step.say === 'function' ? evalFn(step.say, null) : step.say;
          if (!line) { run.i++; continue; }
          run.phase = 'say';
          call.lines.push({ who: step.from || call.cid, text: line });
          JC.bus.emit('story:call', call);
          run.until = at(U.clamp(1100 + String(line).length * 48, 1500, 6500) / speed());
          return;
        }
        run.phase = null;
        run.i++;
        continue;
      }
      if (step.hangup) {
        if (call && call.run === run.rid) {
          endCall(step.hangup === 'me' ? 'me' : 'them');
        }
        run.i++;
        continue;
      }
      if (step.choice) {
        if (run.kind === 'call') {
          if (!call || call.run !== run.rid) { finishRun(run); return; }
          call.pend = { options: visibleOptions(step).map((o, i) => ({ i, label: o.label || o.t, text: o.t, silent: !!o.silent })) };
          run.wait = 'choice';
          JC.bus.emit('story:call', call);
          return;
        }
        if (!tid) { run.i++; continue; }
        ensureThread(tid);
        if (openQuestion(tid, run)) { run.until = s.eng + 1500; return; }
        th(tid).pend = { rid: run.rid };
        run.wait = 'choice';
        run.waitTh = tid;
        run.tleft = step.timeout ? step.timeout * 1000 : 0;
        JC.state.save();
        JC.bus.emit('story:pending', { thread: tid });
        JC.bus.emit('story:thread', { thread: tid });
        return;
      }
      if (step.fx) { applyFx(step.fx); run.i++; continue; }
      if (step.if) {
        const ok = evalFn(step.if, false);
        if (ok && step.go) { run.node = step.go; run.i = 0; continue; }
        if (!ok && step.else) { run.node = step.else; run.i = 0; continue; }
        run.i++;
        continue;
      }
      if (step.go) { run.node = step.go; run.i = 0; continue; }
      if (step.start) { startScene(step.start, { delay: step.delay || 0, th: step.inThread || null }); run.i++; continue; }
      if (step.wait != null) {
        if (run.phase !== 'wait') { run.phase = 'wait'; run.until = at(step.wait * 1000 / speed()); return; }
        run.phase = null;
        run.i++;
        continue;
      }
      if (step.typing != null) {
        const from = step.from || (tid ? members(tid)[0] : null);
        if (run.phase !== 'typing') {
          run.phase = 'typing';
          if (tid) { th(tid).typing = from; JC.bus.emit('story:typing', { thread: tid, who: from }); }
          run.until = at(step.typing * 1000 / speed());
          return;
        }
        run.phase = null;
        if (tid) { th(tid).typing = null; JC.bus.emit('story:typing', { thread: tid, who: null }); }
        run.i++;
        run.until = at(700 / speed());
        continue;
      }
      if (step.react) {
        if (tid) {
          const msgs = story.messages(tid);
          const who = step.from || members(tid)[0];
          const onMe = (step.on || 'me') === 'me';
          const target = msgs.slice().reverse().find((m) => !m.sys && (onMe ? m.from === 'me' : m.from !== 'me'));
          if (target) {
            const r = (target.react || []).filter((x) => x.by !== who).concat({ by: who, t: step.react });
            applyMod(tid, target.id, { react: r });
          }
        }
        run.i++;
        continue;
      }
      if (step.unsend) {
        if (tid) {
          const who = step.from || members(tid)[0];
          const target = story.messages(tid).slice().reverse().find((m) => m.from === who && !m.sys);
          if (target) applyMod(tid, target.id, { unsent: true });
        }
        run.i++;
        continue;
      }
      if (step.sys != null) {
        if (tid) { ensureThread(tid); deliver(tid, { from: 'sys', sys: true, text: step.sys }, { quiet: true }); }
        run.i++;
        continue;
      }
      if (step.addMember) { if (tid) memberAdd(tid, step.addMember); run.i++; continue; }
      if (step.removeMember) { if (tid) memberRemove(tid, step.removeMember); run.i++; continue; }
      if (step.rename) { if (tid) { th(tid).rename = step.rename; JC.bus.emit('story:threads'); } run.i++; continue; }
      if (step.add) { try { addItem(step.add); } catch (e) { console.error('[story] add failed', e); } run.i++; continue; }
      if (step.log != null) { story.log(typeof step.log === 'function' ? evalFn(step.log, '') : step.log, step.once ? { once: step.once } : null); run.i++; continue; }
      if (step.hint != null) { story.hint(step.hint, step.icon); run.i++; continue; }
      if (step.notify) { JC.notify.push(Object.assign({}, step.notify)); run.i++; continue; }
      if (step.call) {
        if (call) { run.until = s.eng + 3000; return; } // wait for the line to be free
        if (step.delay && run.phase !== 'calldelay') { run.phase = 'calldelay'; run.until = s.eng + step.delay * 1000; return; }
        run.phase = null;
        incomingCall(step.call);
        run.i++;
        continue;
      }
      if (step.time) {
        const target = JC.time.resolve(step.time);
        if (step.card) {
          run.wait = 'cinema';
          JC.os.timeSkip({ to: target, text: step.card, lock: step.lock }).then(() => { run.wait = null; run.i++; JC.state.save(); });
          return;
        }
        JC.time.set(target);
        run.i++;
        continue;
      }
      if (step.run) {
        try { step.run(api()); } catch (e) { console.error('[story] run step failed', e); }
        run.i++;
        continue;
      }
      if (step.ending || step.endings) {
        let ids = step.endings ? (typeof step.endings === 'function' ? evalFn(step.endings, []) : step.endings) : [step.ending];
        ids = (ids || []).filter(Boolean);
        run.i++;
        if (ids.length) { finishGame(ids); return; }
        continue;
      }
      if (step.end) { finishRun(run); return; }
      // unknown step: skip
      console.warn('[story] unknown step', run.sc, run.node, step);
      run.i++;
    }
  }

  function api() {
    return { state: S(), os: JC.os, store: JC.store, story, notify: JC.notify, time: JC.time, contacts: JC.contacts, ui: JC.ui };
  }

  // ── Player input ─────────────────────────────────────────────────
  story.choose = (id, i) => {
    const st = th(id);
    if (!st.pend) return false;
    const run = S().runs.find((r) => r.rid === st.pend.rid);
    if (!run) { st.pend = null; return false; }
    const step = stepAt(run);
    const opts = visibleOptions(step || {});
    const opt = opts[i];
    if (!opt) return false;
    JC.state.snapshot('choice:' + id);
    if (!opt.silent) {
      const d = tdef(id);
      const st0 = (d && d.fails) || !JC.os.online() ? 'failed' : 'delivered';
      deliver(id, { from: 'me', text: opt.t, status: st0 });
      (opt.send || []).forEach((t) => deliver(id, typeof t === 'string' ? { from: 'me', text: t, status: st0 } : Object.assign({ from: 'me', status: st0 }, t)));
      JC.audio.play('send');
    }
    resolveChoice(run, id, opt);
    S().stats.choices++;
    return true;
  };

  function resolveChoice(run, id, opt) {
    const st = th(id);
    st.pend = null;
    applyFx(opt.fx);
    run.wait = null;
    if (opt.go) { run.node = opt.go; run.i = 0; } else run.i++;
    run.until = S().eng + 900 / speed();
    JC.state.save();
    JC.bus.emit('story:pending', { thread: id });
    JC.bus.emit('story:thread', { thread: id });
    tick(true);
  }

  const CONFESS = /(i'?m not|i am not|this (is ?n['’]?t|is not)|not)\s+(jiang ?cheng|wanyin|him|your (uncle|brother|boss|jiujiu)|ur (uncle|jiujiu))|found (this|his|the|a|your) (phone|iphone)|(this|his) phone (was|got) (lost|left)|lost (his|this) phone|i('?m| am) a stranger|i('?m| am) (just )?(the|a) (person|guy|girl) who found/i;

  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9一-鿿]+/g, ' ').trim(); }
  function similar(a, b) {
    a = norm(a); b = norm(b);
    if (!a || !b) return 0;
    if (a === b) return 1;
    const A = new Set(a.split(' ')), B = new Set(b.split(' '));
    let inter = 0;
    A.forEach((w) => { if (B.has(w)) inter++; });
    return (2 * inter) / (A.size + B.size);
  }

  story.send = (id, p) => {
    p = p || {};
    const d = tdef(id) || (ensureThread(id), tdef(id));
    const st = th(id);
    const m = { from: 'me', status: 'delivered' };
    if (p.text) m.text = p.text;
    if (p.img) m.img = p.img;
    if (p.voice) m.voice = p.voice;
    if (p.loc) m.loc = typeof p.loc === 'string' ? { place: p.loc } : p.loc;
    if (p.memo) { m.memo = p.memo; const mm = JC.store.hasSeed('memos') ? JC.store.get('memos', p.memo) : null; m.voice = { dur: mm ? mm.dur : 12, text: mm ? mm.text : '' }; }
    if (p.link) m.link = p.link;
    if (p.effect) m.effect = p.effect;
    const failed = (d && d.fails) || !JC.os.online() || members(id).some((c) => ['mom', 'dad', 'ajie'].includes(c));
    if (failed) m.status = 'failed';
    deliver(id, m);
    S().stats.sent++;
    const kind = m.memo ? 'memo' : m.voice ? 'voice' : m.img ? 'img' : m.loc ? 'loc' : m.link && !m.text ? 'link' : 'text';
    let armed = story.act('send', { thread: id, kind, text: m.text || '', art: m.img, memo: m.memo, link: m.link || null, loc: m.loc || null });
    if (m.memo) armed = armed.concat(story.act('memo_share', { id: m.memo, to: id }));
    if (failed) {
      if (id === 'ajie' || members(id).includes('ajie')) applyFx({ set: { ajie_wrote: true } });
      return m;
    }
    if (S().ended || !story.canReply(id)) {
      const c = JC.contacts.get(members(id)[0]);
      if (c && c.service) aside(id, [{ m: 'This number does not accept replies. Reply STOP to unsubscribe.', from: c.id, d: 0.6 }]);
      return m;
    }
    // confession?
    if (kind === 'text' && CONFESS.test(m.text || '')) { confess(id); return m; }
    // matches a pending option?
    if (st.pend && kind === 'text') {
      const run = S().runs.find((r) => r.rid === st.pend.rid);
      const step = run && stepAt(run);
      if (step && step.choice) {
        const opts = visibleOptions(step);
        let best = -1, bestS = 0;
        opts.forEach((o, i) => { if (o.silent) return; const sc = similar(o.t, m.text); if (sc > bestS) { bestS = sc; best = i; } });
        if (best >= 0 && bestS >= 0.72) {
          JC.state.snapshot('choice:' + id);
          S().stats.choices++;
          resolveChoice(run, id, opts[best]);
          return m;
        }
      }
      if (claimed(armed)) return m; // a reaction scene answers this one
      // off-script while they wait for an answer
      const who = pickMember(id);
      applyFx({ sus: { [who]: 1 } });
      aside(id, [{ m: flavor(who, 'confused', ['?', 'what', '…what does that mean']), from: who }]);
      return m;
    }
    if (claimed(armed)) return m; // a reaction scene answers this one
    // unprompted message
    const who = pickMember(id);
    st.free = (st.free || 0) + 1;
    let pool = 'idle';
    let bump = st.free <= 3 ? 1 : 0;
    if (kind === 'voice') { pool = 'voiceReact'; bump = 3; }
    else if (kind === 'img') {
      const meta = JC.art.meta(m.img);
      pool = meta && (meta.tags || []).includes('dog') ? 'dogReact' : 'imgReact';
      bump = 1;
    } else if (kind === 'loc') { pool = 'idle'; }
    if (bump) applyFx({ sus: { [who]: bump } });
    aside(id, [{ m: flavor(who, pool, ['?']), from: who }]);
    return m;
  };

  function pickMember(id) {
    const ms = members(id).filter((c) => { const x = JC.contacts.get(c); return x && !x.service; });
    return ms.length ? U.pick(ms) : members(id)[0];
  }
  const flavorIdx = {};
  function flavor(cid, pool, fallback) {
    const c = JC.contacts.get(cid);
    const arr = (c && c[pool] && c[pool].length ? c[pool] : null) || (fallback === null ? null : (c && c.idle && c.idle.length ? c.idle : null) || fallback);
    if (!arr) return null;
    const k = cid + ':' + pool;
    const i = flavorIdx[k] = ((flavorIdx[k] == null ? Math.floor(Math.random() * arr.length) : flavorIdx[k] + 1)) % arr.length;
    return arr[i];
  }
  story.flavor = flavor;

  /** a lightweight side-run for unscripted replies */
  function aside(id, steps, delay) {
    const expanded = [];
    steps.forEach((st) => {
      if (st.m != null && String(st.m).includes('\n')) String(st.m).split('\n').forEach((line) => expanded.push(Object.assign({}, st, { m: line })));
      else expanded.push(st);
    });
    const run = { rid: U.uid('a'), sc: 'aside', kind: 'aside', steps: expanded, node: 'start', i: 0, until: S().eng + (delay != null ? delay : 1200 + Math.random() * 1600), phase: null, th: id, wait: null };
    S().runs.push(run);
    JC.state.save();
    return run;
  }

  function defaultEnding(cid) {
    if (cid === 'nhs') return 'busted';
    if (cid === 'wn') return 'wen_ning';
    return 'honest';
  }
  function confess(id) {
    const d = tdef(id);
    const cid = d && !d.group ? members(id)[0] : null;
    S().flags.told_truth = true;
    if (cid && defs.scenes['confess_' + cid] && !S().done['confess_' + cid]) {
      // the confession scene takes over: drop any pending choice in this thread
      const st = th(id);
      if (st.pend) {
        const run = S().runs.find((r) => r.rid === st.pend.rid);
        if (run) finishRun(run);
        st.pend = null;
      }
      startScene('confess_' + cid, { th: id, delay: 1 });
      return;
    }
    if (!cid) {
      // group: everyone is confused, nobody believes you
      members(id).slice(0, 2).forEach((m) => applyFx({ sus: { [m]: 2 } }));
      aside(id, [{ m: flavor(members(id)[0], 'confused', ['?']), from: members(id)[0] }, { m: 'lol what', from: members(id)[1] || members(id)[0] }]);
      return;
    }
    aside(id, [{ m: flavor(cid, 'confess', ['…what?']), from: cid }, { wait: 1.2 }, { ending: defaultEnding(cid) }], 1500);
  }
  story.confess = confess;

  // ── Acts & triggers ──────────────────────────────────────────────
  story.act = (name, p) => {
    p = p || {};
    const s = S();
    JC.bus.emit('story:act', { name, p });
    // automatic flags
    if (name === 'memo_play' && p.id === 'memo14') s.flags.memo_heard = true;
    if (name === 'memo_share' && p.id === 'memo14' && (p.to === 'wwx' || (members(p.to || '') || []).includes('wwx'))) s.flags.memo_sent = true;
    if (name === 'open_thread' && p.thread === 'ajie') s.flags.ajie_read = true;
    if (name === 'game_score' && p.score > 1824) s.flags.beat_score = true;
    if (name === 'setting' && p.key === 'passcode') s.flags.changed_passcode = true;
    if (name === 'ride_report_lost') s.flags.reported_lost = true;
    // the ending card's "What you did with his phone"
    if (name === 'memo_share' && p.id === 'memo14' && p.to) story.log('Sent his voice memo “Untitled 14” to ' + threadName(p.to), { once: 'memo14:' + p.to });
    if (name === 'ride_report_lost') story.log('Reported the phone to Swift Ride as a found item', { once: 'ride_report' });
    if (name === 'setting' && p.key === 'passcode') story.log('Changed his passcode', { once: 'passcode' });
    if (name === 'game_score' && p.score > 1824) story.log('Beat A-Ling’s Lotus Leap high score with ' + p.score, { once: 'beat_score' });
    if (name === 'unlock' && p.first) s.unlockAt = s.eng;
    if (name === 'unlock' && s.unlockAt == null) s.unlockAt = s.eng;
    // arm act/open triggers
    s.armed = s.armed || {};
    const armed = [];
    Object.values(defs.scenes).forEach((sc) => {
      const t = sc.trigger;
      if (!t || s.done[sc.id] || s.armed[sc.id] != null) return;
      let hit = false;
      if (t.on === 'act' && t.act === name) hit = !t.match || !!evalMatch(t.match, p);
      if (t.on === 'open' && name === 'open_thread' && t.thread && t.thread === p.thread) hit = true;
      if (t.on === 'open' && name === 'open_app' && t.app && t.app === p.app) hit = true;
      if (hit) { s.armed[sc.id] = s.eng; armed.push(sc.id); }
    });
    JC.state.save();
    return armed;
  };
  /** true when one of the armed scenes will answer in person (so the generic "?" reply should stay quiet) */
  function claimed(ids) {
    return (ids || []).some((id) => { const sc = defs.scenes[id]; return sc && sc.claims !== false && (!sc.when || evalFn(sc.when, false)); });
  }
  function evalMatch(fn, p) { try { return fn(p, sApi()); } catch (e) { return false; } }

  function atMs(at) {
    const s = String(at);
    if (/\s/.test(s) || /-/.test(s)) return JC.time.parse(s);
    const hh = parseInt(s, 10);
    return JC.time.parse((hh < 12 ? '+1 ' : '+0 ') + s);
  }

  function checkTriggers() {
    const s = S();
    s.armed = s.armed || {};
    Object.values(defs.scenes).forEach((sc) => {
      const t = sc.trigger;
      if (!t || s.done[sc.id]) return;
      if (s.armed[sc.id] == null) {
        if (t.on === 'unlock' && s.unlockAt != null) s.armed[sc.id] = s.unlockAt;
        else if (t.on === 'scene' && s.fin[t.scene]) s.armed[sc.id] = s.fin[t.scene];
        else if (t.on === 'flag' && s.flags[t.flag]) s.armed[sc.id] = s.eng;
        else if (t.on === 'time' && JC.time.now() >= atMs(t.at)) s.armed[sc.id] = s.eng;
      }
      if (s.armed[sc.id] != null && s.eng >= s.armed[sc.id] + (t.delay || 0) * 1000) {
        if (sc.when && !evalFn(sc.when, true)) {
          if (sc.retry) return;
          s.done[sc.id] = 'skipped';
          return;
        }
        startScene(sc.id);
      }
    });
  }

  // ── Loop ─────────────────────────────────────────────────────────
  story._debug = () => ({ paused: paused(), started: S().started, ended: S().ended, frozen: JC.time.frozen, loop: !!loopT, tick: (() => { try { tick(false); return 'ok'; } catch (e) { return 'ERR ' + (e && e.stack || e); } })() });
  function paused() {
    const s = S();
    return !s.started || !!s.ended || JC.time.frozen;
  }
  function tick(force) {
    const now = performance.now();
    const dt = Math.min(1000, now - lastTick);
    lastTick = now;
    const s = S();
    if (paused() && !force) return;
    if (!force) s.eng += dt;
    // choice timeouts count only while the thread is on screen
    s.runs.forEach((r) => {
      if (r.wait === 'choice' && r.tleft > 0 && r.waitTh === openTh && JC.os.isOpen('messages')) {
        r.tleft -= dt;
        if (r.tleft <= 0) {
          const step = stepAt(r);
          if (step && step.onTimeout) {
            th(r.waitTh).pend = null;
            r.wait = null;
            r.node = step.onTimeout;
            r.i = 0;
            JC.bus.emit('story:pending', { thread: r.waitTh });
          }
        }
      }
    });
    checkTriggers();
    s.runs.slice().forEach((r) => process(r));
    if (call && call.phase === 'ringing' && call.dir === 'in' && s.eng > ringT) missCall();
  }

  // ── Calls ────────────────────────────────────────────────────────
  function callRecord(dir, dur) {
    if (!call) return;
    try {
      const c = JC.contacts.get(call.cid);
      JC.store.add('calls', { contact: c ? call.cid : null, num: call.num || (c && c.phones[0] ? c.phones[0].num : ''), t: call.t0, dir, dur: Math.round(dur || 0), video: !!call.video }, { front: true });
    } catch (e) { /* calls collection may not be seeded yet */ }
  }
  function incomingCall(callId) {
    const def = defs.calls[callId];
    if (!def) { console.warn('[story] unknown call', callId); return; }
    if (call) return;
    call = { id: callId, def, cid: def.from, video: !!def.video, dir: 'in', phase: 'ringing', t0: JC.time.now(), lines: [], pend: null, run: null, start: 0 };
    ringT = S().eng + (def.ring || 25) * 1000;
    if (JC.os.asleep) JC.os.wake();
    JC.audio.play('ring');
    JC.audio.haptic([400, 200, 400]);
    JC.bus.emit('story:call', call);
  }
  story.incomingCall = incomingCall;
  function missCall() {
    const def = call.def;
    JC.audio.ring(false);
    call.phase = 'ended';
    call.outcome = 'missed';
    callRecord('missed', 0);
    JC.bus.emit('story:call', call);
    const c = call;
    call = null;
    JC.notify.push({ app: 'phone', title: 'Missed Call', body: JC.contacts.name(c.cid), avatar: c.cid, open: { app: 'phone', intent: { tab: 'recents' } } });
    if (def.voicemail) {
      try { JC.store.add('voicemails', { contact: c.cid, num: (JC.contacts.get(c.cid) || { phones: [{}] }).phones[0].num, t: JC.time.now(), dur: Math.max(6, Math.round(def.voicemail.length / 14)), text: def.voicemail, heard: false }, { front: true }); } catch (e) { /* ignore */ }
      setTimeout(() => JC.notify.push({ app: 'phone', title: 'Voicemail', body: 'New voicemail from ' + JC.contacts.name(c.cid), avatar: c.cid, open: { app: 'phone', intent: { tab: 'voicemail' } } }), 2500);
    }
    if (def.missed && def.missed.length) {
      const run = { rid: U.uid('a'), sc: 'aside', kind: 'aside', steps: def.missed, node: 'start', i: 0, until: S().eng + 1500, th: def.thread || def.from, wait: null };
      S().runs.push(run);
    }
    JC.state.save();
    phoneBadge();
  }
  story.silenceRing = () => { JC.audio.ring(false); };
  /** JC.story.call(def) registers a call script; JC.story.call() returns the live call (or null) */
  story.call = (def) => {
    if (def && def.id) { defs.calls[def.id] = def; return def; }
    return call;
  };
  story.call.__dual = true;
  story.answer = () => {
    if (!call || call.phase !== 'ringing') return;
    JC.audio.ring(false);
    call.phase = 'active';
    call.start = Date.now();
    const run = { rid: U.uid('c'), sc: call.def.id, kind: 'call', node: 'start', i: 0, until: S().eng + 900, phase: null, th: call.def.thread || null, wait: null };
    call.run = run.rid;
    S().runs.push(run);
    story.act('call_start', { contact: call.cid, dir: call.dir });
    JC.bus.emit('story:call', call);
  };
  story.decline = () => {
    if (!call || call.phase !== 'ringing') return;
    if (call.dir === 'out') { endCall('me'); return; }
    ringT = 0;
    missCall();
  };
  story.callChoose = (i) => {
    if (!call || !call.pend) return;
    const run = S().runs.find((r) => r.rid === call.run);
    if (!run) return;
    const step = stepAt(run);
    const opts = visibleOptions(step || {});
    const opt = opts[i];
    if (!opt) return;
    JC.state.snapshot('call:' + call.cid);
    call.pend = null;
    if (!opt.silent) call.lines.push({ who: 'me', text: opt.t });
    applyFx(opt.fx);
    run.wait = null;
    if (opt.go) { run.node = opt.go; run.i = 0; } else run.i++;
    run.until = S().eng + 700;
    S().stats.choices++;
    JC.bus.emit('story:call', call);
  };
  function endCall(by) {
    if (!call) return;
    JC.audio.ring(false);
    JC.audio.ringback(false);
    const dur = call.start ? (Date.now() - call.start) / 1000 : 0;
    call.phase = 'ended';
    call.outcome = by === 'me' ? 'hungup' : 'ended';
    call.lines.push({ who: 'sys', text: 'Call ended' });
    callRecord(call.dir === 'out' ? 'out' : dur ? 'in' : 'missed', dur);
    const c = call;
    const run = S().runs.find((r) => r.rid === c.run);
    JC.bus.emit('story:call', c);
    call = null;
    if (run && by === 'me') {
      // player hung up: run the call's onHangup steps if any, then drop the run
      const idx = S().runs.indexOf(run);
      if (idx >= 0) S().runs.splice(idx, 1);
      if (c.def.onHangup && c.def.onHangup.length) {
        S().runs.push({ rid: U.uid('a'), sc: 'aside', kind: 'aside', steps: c.def.onHangup, node: 'start', i: 0, until: S().eng + 1200, th: c.def.thread || c.cid, wait: null });
      }
    }
    story.act('call_end', { contact: c.cid, dur, answered: dur > 0 });
    JC.state.save();
  }
  story.hangup = () => {
    if (!call) return;
    if (call.phase === 'ringing') { story.decline(); return; }
    endCall('me');
  };

  function phoneBadge() {
    try {
      const missed = JC.store.hasSeed('calls') ? JC.store.all('calls').filter((c) => c.dir === 'missed' && !c.seen).length : 0;
      const vm = JC.store.hasSeed('voicemails') ? JC.store.all('voicemails').filter((v) => !v.heard).length : 0;
      JC.notify.badge('phone', missed + vm);
    } catch (e) { /* ignore */ }
  }
  story.phoneBadge = phoneBadge;

  /** player places a call */
  story.dial = (cid, o) => {
    o = o || {};
    if (call) return;
    const c = JC.contacts.get(cid);
    let callId = null;
    for (let i = defs.dial.length - 1; i >= 0; i--) {
      const d = defs.dial[i];
      if (d.cid === cid && (!d.when || evalFn(d.when, false))) { callId = d.callId; break; }
    }
    const def = callId ? defs.calls[callId] : defaultCallDef(cid, o);
    if (!def) return;
    call = { id: def.id, def, cid, num: o.num || null, video: !!o.video || !!def.video, dir: 'out', phase: 'ringing', t0: JC.time.now(), lines: [], pend: null, run: null, start: 0 };
    JC.bus.emit('story:call', call);
    JC.audio.ringback(true);
    const ringFor = def.ringFor != null ? def.ringFor : (c && c.dial === 'voicemail' ? 7 : 3 + Math.random() * 2);
    const mine = call;
    setTimeout(() => {
      if (call !== mine || call.phase !== 'ringing') return;
      JC.audio.ringback(false);
      call.phase = 'active';
      call.start = Date.now();
      const run = { rid: U.uid('c'), sc: def.id, kind: 'call', node: 'start', i: 0, until: S().eng + 400, phase: null, th: def.thread || null, wait: null };
      call.run = run.rid;
      S().runs.push(run);
      JC.bus.emit('story:call', call);
    }, (def.noAnswer ? 0.5 : ringFor) * 1000);
    story.act('call_start', { contact: cid, dir: 'out' });
  };

  /** turn a texted line into something said aloud: drop sign-offs ("— Wen Ning"), join bubbles, drop emoji */
  function spoken(line) {
    return String(line || '')
      .split('\n').map((l) => l.trim()).filter((l) => l && !/^[—–-]\s*\S/.test(l)).join(' ')
      .replace(/\s*[—–]\s*[A-Z][\w .'-]*$/, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').replace(/\s{2,}/g, ' ').trim() || '…What?';
  }

  function defaultCallDef(cid, o) {
    const c = JC.contacts.get(cid) || { id: cid, display: cid, dial: 'voicemail' };
    const id = '_dial_' + cid;
    const name = JC.contacts.short(cid);
    let def;
    if (c.dial === 'disconnected') {
      def = { id, from: cid, ringFor: 1.5, nodes: { start: [{ say: 'The number you have dialed is no longer in service. Please check the number and try again.', from: 'sys' }, { fx: { set: cid === 'ajie' ? { ajie_called: true } : {} } }, { hangup: true }] } };
    } else if (c.dial === 'busy' || c.service) {
      def = { id, from: cid, ringFor: 1, nodes: { start: [{ say: 'This number does not accept incoming calls.', from: 'sys' }, { hangup: true }] } };
    } else if (cid === 'hq') {
      def = { id, from: cid, nodes: {
        start: [{ say: 'Yunmeng Jiang Group, Lotus Pier night desk. How can I help you?' }, { choice: [
          { t: '"Wrong number. Sorry."', go: 'wrong' },
          { t: 'Tell them you found Mr. Jiang’s phone', go: 'truth' },
          { t: '(Hang up)', go: 'hang' },
        ] }],
        wrong: [{ say: 'No problem. Good night.' }, { hangup: true }],
        hang: [{ hangup: 'me' }],
        truth: [{ say: 'You found the boss’s phone? Oh, thank heavens. Please — stay right there, I’m writing everything down…' }, { fx: { set: { told_truth: true } } }, { ending: 'honest' }],
      } };
    } else if (c.dial === 'voicemail') {
      def = { id, from: cid, ringFor: 7, nodes: {
        start: [{ say: c.voicemail || ('You’ve reached ' + name + '. Leave a message.'), from: 'sys' }, { say: '(Beep.)', from: 'sys' }, { choice: [
          { t: '(Hang up without a word)', go: 'hang' },
          { t: '(Leave a message: “It’s… me. Call me back.”)', go: 'msg', fx: { sus: { [cid]: 2 } } },
        ] }],
        hang: [{ hangup: 'me' }],
        msg: [{ say: 'Message saved.', from: 'sys' }, { hangup: true }],
      } };
    } else {
      def = { id, from: cid, nodes: {
        start: [{ say: (c.hello || (o.emergency ? 'Jiang Cheng? Why are you calling from your emergency screen??' : 'Hello? Jiang Cheng?')) }, { choice: [
          { t: '(Stay silent)', go: 'silent' },
          { t: '"…Mm."', go: 'mm' },
          { t: 'Tell the truth', go: 'truth' },
          { t: '(Hang up)', go: 'hang', fx: { sus: { [cid]: 1 } } },
        ] }],
        silent: [{ say: 'Hello?? …I can’t hear anything. You probably butt-dialed me.' }, { hangup: true }, { m: flavor(cid, 'idle', ['did you just butt-dial me?']), th: cid, from: cid }],
        mm: [{ say: '…That’s it? You called me to say “mm”? Are you okay?' }, { choice: [
          { t: '(Hang up)', go: 'hang', fx: { sus: { [cid]: 2 } } },
          { t: 'Tell the truth', go: 'truth' },
        ] }],
        hang: [{ hangup: 'me' }],
        truth: [{ say: spoken(flavor(cid, 'confessCall', null) || flavor(cid, 'confess', ['Wait. What? Who is this?'])) }, { fx: { set: { told_truth: true } } }, { wait: 1 }, { ending: defaultEnding(cid) }],
      } };
    }
    defs.calls[id] = def;
    return def;
  }

  // ── Endings ──────────────────────────────────────────────────────
  story.endingDef = (id) => defs.endings[id] || null;
  story.endings = () => Object.values(defs.endings).sort((a, b) => (a.n || 99) - (b.n || 99)).map((e) => Object.assign({}, e, { unlocked: !!S().endings[e.id], at: S().endings[e.id] ? S().endings[e.id].at : 0 }));
  function finishGame(ids) {
    const s = S();
    if (s.ended) return;
    ids.forEach((id) => { if (!s.endings[id]) s.endings[id] = { at: Date.now() }; });
    s.ended = ids[0];
    if (call) { JC.audio.ring(false); JC.audio.ringback(false); const c = call; c.phase = 'ended'; call = null; JC.bus.emit('story:call', c); }
    Object.keys(s.threads).forEach((k) => { s.threads[k].typing = null; s.threads[k].pend = null; });
    s.runs = [];
    JC.state.saveNow();
    JC.bus.emit('story:ending', { id: ids[0], also: ids.slice(1) });
    clearTimeout(endT);
    endT = setTimeout(() => { if (S().ended === ids[0]) JC.os.ending(ids[0], ids.slice(1)); }, 1600);
    if (JC.os.refreshWidgets) setTimeout(JC.os.refreshWidgets, 2000);
  }
  story.finish = finishGame;

  story.rewind = () => {
    clearTimeout(endT);
    if (!JC.state.rewind()) { JC.ui.toast('Nothing to rewind'); return; }
    call = null;
    JC.audio.ring(false);
    JC.os.rebuild();
    afterReset();
    setTimeout(() => JC.ui.toast('Rewound to your last choice', { icon: 'arrow.counterclockwise' }), 400);
  };
  story.restart = () => {
    clearTimeout(endT);
    JC.state.restart();
    call = null;
    JC.audio.ring(false);
    JC.time.set(JC.time.START);
    JC.os.rebuild();
    afterReset();
    story.begin();
  };
  function afterReset() {
    Object.keys(histCache).forEach((k) => delete histCache[k]);
    updateBadge();
    phoneBadge();
    JC.bus.emit('story:reset');
    JC.bus.emit('story:threads');
  }

  // ── Init ─────────────────────────────────────────────────────────
  function firstRunSetup() {
    const s = S();
    if (s.initDone) return;
    s.initDone = true;
    const notifs = [];
    Object.keys(defs.threads).forEach((id) => {
      const hist = normHist(id);
      let unread = 0;
      hist.forEach((m, idx) => {
        if (!m.u) return;
        unread++;
        const d = defs.threads[id];
        notifs.push({ app: 'messages', title: threadName(id), subtitle: d.group ? JC.contacts.short(m.from) : undefined, body: preview(m), avatar: m.from, group: d.group ? members(id) : undefined, thread: id, t: m.t, seq: idx, art: m.img, open: { app: 'messages', intent: { thread: id } } });
      });
      if (unread) th(id).unread = unread;
    });
    (story.lockNotifs || []).forEach((n) => notifs.push(Object.assign({}, n, { t: JC.time.parse(n.t) })));
    notifs.sort((a, b) => (b.t - a.t) || ((b.seq || 0) - (a.seq || 0)));
    s.notifs = notifs.map((n) => Object.assign({ id: U.uid('n') }, n));
    JC.state.save();
  }

  story.init = () => {
    firstRunSetup();
    // resume runs waiting on a cinema overlay
    S().runs.forEach((r) => { if (r.wait === 'cinema') { r.wait = null; r.i++; } if (r.kind === 'call') r.dead = true; });
    S().runs = S().runs.filter((r) => !r.dead);
    updateBadge();
    phoneBadge();
    lastTick = performance.now();
    if (!loopT) loopT = setInterval(() => tick(false), 200);
  };

  /** first boot: prologue then the lock screen */
  story.begin = () => {
    const s = S();
    firstRunSetup();
    updateBadge();
    JC.bus.emit('notifs');
    if (!s.started) {
      const lines = story.intro && story.intro.length ? story.intro : ['11:47 PM. Lanling.', 'A phone buzzes under your hand.'];
      JC.os.prologue(lines).then(() => { s.started = true; JC.state.save(); });
    }
  };
})();
