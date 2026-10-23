/* JC.story — branching story engine: threads, scenes, choices, suspicion, calls, endings, rewind. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const U = JC.util;
  const W = () => JC.world || {};
  const WC = () => W().contacts || {};

  const defs = { threads: {}, scenes: {}, calls: {}, endings: {}, dial: [], susHooks: [], totalHooks: [], actRules: [], chapters: [], aftermath: [], gossip: [] };
  const histCache = {};
  let openTh = null;
  let loopT = null;
  let lastTick = 0;
  let call = null; // live call state (not persisted)
  let callRun = null;
  let ringT = 0;
  let endT = null;
  let userPaused = false; // JC.story.pause()
  let chapBusy = false; // a chapter transition is running
  let chapTok = 0; // invalidates transitions interrupted by rewind / restart
  let ruleN = 0;
  const S = () => JC.state.d;
  const SCALES = [1, 2, 4, 8];
  const scale = () => { const n = S().settings.timeScale; return SCALES.includes(n) ? n : 1; };

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
    /** repeatable, payload-aware reaction to an app act: { id, act, match(p, s), fx, start, delay, notify, once } */
    onAct(rule) {
      if (!rule || !rule.act) { console.warn('[story] onAct needs an act', rule); return rule; }
      if (!rule.id) rule.id = 'rule' + (++ruleN);
      const i = defs.actRules.findIndex((r) => r.id === rule.id);
      if (i >= 0) defs.actRules[i] = rule; else defs.actRules.push(rule);
      return rule;
    },
    /** chapters, registered in play order: { id, n, title, label, at, card, settle(s, dflt), maxWait, clockRate, until, settleDelay } */
    chapter(def) {
      const i = defs.chapters.findIndex((c) => c.id === def.id);
      if (i >= 0) defs.chapters[i] = def; else defs.chapters.push(def);
      return def;
    },
    /** per-chat outcomes for the "Where everyone ended up" page: [{ id, name, avatar, outcomes: [{ id, when(s), line }] }] */
    aftermath(list) {
      (Array.isArray(list) ? list : [list]).forEach((c) => {
        if (!c || !c.id) return;
        const i = defs.aftermath.findIndex((x) => x.id === c.id);
        if (i >= 0) defs.aftermath[i] = c; else defs.aftermath.push(c);
      });
      return list;
    },
    /** suspicion spreading along relationships: [{ from, to, share }] */
    gossip(edges) {
      (Array.isArray(edges) ? edges : [edges]).forEach((e) => { if (e && e.from && e.to) defs.gossip.push({ from: e.from, to: e.to, share: e.share == null ? 0.5 : e.share }); });
      return edges;
    },
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
  story.members = (id) => members(id).slice();
  function members(id) {
    const d = tdef(id);
    const st = S().threads[id];
    if (st && st.members) return st.members;
    return d ? d.members : [id];
  }

  function sApi() {
    const s = S();
    const api = {
      flags: s.flags, sus: s.sus, aff: s.aff, done: s.done, fin: s.fin, endings: s.endings,
      flag: (n) => s.flags[n], susTotal: () => story.susTotal(), now: JC.time.now(), eng: s.eng,
      count: (n) => s.flags[n] || 0,
      acted: (n) => (s.acts && s.acts[n]) || 0,
      chapter: s.chap ? s.chap.id : null,
      balance: () => (JC.bank ? JC.bank.balance() : 0),
    };
    // story tests record which flags a condition reads (tools/storytest.js --lint); story._ctxArc = the arc reading
    if (story._watchFlags) {
      const fl = story._watchFlags(s.flags, '');
      api.flags = fl;
      api.flag = (n) => fl[n];
      api.count = (n) => fl[n] || 0;
      api.aff = story._watchFlags(s.aff, 'aff.');
      api.sus = story._watchFlags(s.sus, 'sus.');
      const ac = story._watchFlags(s.acts || {}, 'act.');
      api.acted = (n) => ac[n] || 0;
    }
    return api;
  }
  story.api = sApi;
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
    const opts = visibleOptions(step, run);
    return { options: opts.map((o, i) => ({ i, label: o.label || o.t, text: o.t, silent: !!o.silent })), timeout: step.timeout || 0, left: run.tleft > 0 ? run.tleft : 0 };
  };

  function visibleOptions(step, run) {
    const prev = story._ctxArc;
    if (run) { const sc = sceneOf(run); story._ctxArc = (sc && sc.arc) || null; }
    try { return (step.choice || []).filter((o) => !o.if || evalFn(o.if, false)); } finally { story._ctxArc = prev; }
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
    const no = WC().noReply || [];
    return members(id).some((m) => { const c = JC.contacts.get(m); return c && !c.service && !no.includes(m); });
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
  /** apply effects. ctx.thread: the thread the suspicion was raised in (group threads share it with the other members) */
  function applyFx(fx, ctx) {
    if (!fx || typeof fx !== 'object') return;
    ctx = ctx || {};
    const s = S();
    if (fx.set) Object.keys(fx.set).forEach((k) => { s.flags[k] = fx.set[k]; });
    if (fx.inc) Object.keys(fx.inc).forEach((k) => { s.flags[k] = (s.flags[k] || 0) + fx.inc[k]; });
    if (fx.aff) Object.keys(fx.aff).forEach((k) => { s.aff[k] = (s.aff[k] || 0) + fx.aff[k]; });
    if (fx.sus) Object.keys(fx.sus).forEach((k) => raiseSus(k, fx.sus[k], ctx.thread));
    JC.state.save();
    JC.bus.emit('story:fx', fx);
    checkSuspicion();
  }
  story.applyFx = applyFx;
  function addSus(k, n, via) {
    const s = S();
    const before = s.sus[k] || 0;
    const v = Math.max(0, Math.round((before + n) * 100) / 100);
    s.sus[k] = v;
    if (v !== before) JC.bus.emit('story:sus', { who: k, by: Math.round((v - before) * 100) / 100, via: via || null, cid: k, value: v, delta: n });
  }
  /** suspicion of `k` changes by n; a rise spreads one hop along gossip edges and to the other members of a group thread */
  function raiseSus(k, n, tid) {
    addSus(k, n, null);
    if (!(n > 0)) return;
    defs.gossip.forEach((e) => { if (e.from === k && e.to !== k && e.share > 0) addSus(e.to, n * e.share, k); });
    if (tid) {
      const d = tdef(tid);
      const share = W().groupShare != null ? W().groupShare : 0.5;
      if (d && d.group && share > 0) {
        members(tid).forEach((m) => {
          const c = JC.contacts.get(m);
          if (m !== k && m !== 'me' && c && !c.service) addSus(m, n * share, 'group:' + tid);
        });
      }
    }
  }
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
        else if (to === 'posts') { title = JC.notify.appName('wavelet'); body = '@' + (item.by || 'someone') + ': ' + (item.text || 'posted a photo'); }
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
    const sc0 = sceneOf(run);
    const prevArc = story._ctxArc;
    story._ctxArc = (sc0 && sc0.arc) || null;
    try { processRun(run); } finally { story._ctxArc = prevArc; }
  }
  function processRun(run) {
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

      if (run.instant) {
        // a chapter is expiring this scene: deliver its closing lines now, skip anything that would wait
        if (step.wait != null || step.typing != null || step.say != null || step.call || step.time || step.hangup) { run.i++; continue; }
        if (step.choice) { console.warn('[story] choice in an expire node', run.sc, run.node); finishRun(run); return; }
      }

      if (step.m != null || (step.img && step.m == null && step.me == null && !step.choice && !step.add)) {
        // NPC message
        const mem = tid ? members(tid) : [];
        const from = step.from || mem[0] || tid;
        if (run.instant) {
          if (tid) { ensureThread(tid, from); th(tid).typing = null; deliver(tid, msgFromStep(step, from)); }
          run.i++;
          continue;
        }
        if (!JC.os.online()) { run.until = s.eng + 1500; return; }
        if (tid) ensureThread(tid, from);
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
          run.phase = 'say';
          call.lines.push({ who: step.from || call.cid, text: step.say });
          JC.bus.emit('story:call', call);
          run.until = at(U.clamp(1100 + step.say.length * 48, 1500, 6500) / speed());
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
          call.pend = { options: visibleOptions(step, run).map((o, i) => ({ i, label: o.label || o.t, text: o.t, silent: !!o.silent })) };
          run.wait = 'choice';
          JC.bus.emit('story:call', call);
          return;
        }
        if (!tid) { run.i++; continue; }
        ensureThread(tid);
        th(tid).pend = { rid: run.rid };
        run.wait = 'choice';
        run.waitTh = tid;
        run.tleft = step.timeout ? step.timeout * 1000 : 0;
        JC.state.save();
        JC.bus.emit('story:pending', { thread: tid });
        JC.bus.emit('story:thread', { thread: tid });
        return;
      }
      if (step.fx) { applyFx(step.fx, { thread: tid }); run.i++; continue; }
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
        let ids;
        if (step.endings === 'finale') ids = story.qualifying().map((e) => e.id);
        else ids = step.endings ? (typeof step.endings === 'function' ? evalFn(step.endings, []) : step.endings) : [step.ending];
        ids = (ids || []).filter(Boolean);
        if (!ids.length && step.endings === 'finale') console.warn('[story] no finale ending qualifies');
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
    const opts = visibleOptions(step || {}, run);
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
    applyFx(opt.fx, { thread: id });
    run.wait = null;
    if (opt.go) { run.node = opt.go; run.i = 0; } else run.i++;
    run.until = S().eng + 900 / speed();
    JC.state.save();
    JC.bus.emit('story:pending', { thread: id });
    JC.bus.emit('story:thread', { thread: id });
    tick(true);
  }

  const CONFESS = () => (W().confess && W().confess.re) || /\bfound (this|the|your) phone\b/i;

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
    const failTo = WC().failSend || [];
    const failed = (d && d.fails) || !JC.os.online() || members(id).some((c) => failTo.includes(c));
    if (failed) m.status = 'failed';
    deliver(id, m);
    S().stats.sent++;
    const kind = m.memo ? 'memo' : m.voice ? 'voice' : m.img ? 'img' : m.loc ? 'loc' : 'text';
    story.act('send', { thread: id, kind, text: m.text || '', art: m.img, memo: m.memo });
    if (m.memo) story.act('memo_share', { id: m.memo, to: id });
    if (failed) return m;
    if (S().ended || !story.canReply(id)) {
      const c = JC.contacts.get(members(id)[0]);
      if (c && c.service) aside(id, [{ m: 'This number does not accept replies. Reply STOP to unsubscribe.', from: c.id, d: 0.6 }]);
      return m;
    }
    // confession?
    if (kind === 'text' && CONFESS().test(m.text || '')) { confess(id); return m; }
    // matches a pending option?
    if (st.pend && kind === 'text') {
      const run = S().runs.find((r) => r.rid === st.pend.rid);
      const step = run && stepAt(run);
      if (step && step.choice) {
        const opts = visibleOptions(step, run);
        let best = -1, bestS = 0;
        opts.forEach((o, i) => { if (o.silent) return; const sc = similar(o.t, m.text); if (sc > bestS) { bestS = sc; best = i; } });
        if (best >= 0 && bestS >= 0.72) {
          JC.state.snapshot('choice:' + id);
          S().stats.choices++;
          resolveChoice(run, id, opts[best]);
          return m;
        }
      }
      // off-script while they wait for an answer
      const who = pickMember(id);
      applyFx({ sus: { [who]: 1 } }, { thread: id });
      aside(id, [{ m: flavor(who, 'confused', ['?', 'what', '…what does that mean']), from: who }]);
      return m;
    }
    // unprompted message
    const who = pickMember(id);
    st.free = (st.free || 0) + 1;
    let pool = 'idle';
    let bump = st.free <= 3 ? 1 : 0;
    if (kind === 'voice') { pool = 'voiceReact'; bump = 3; }
    else if (kind === 'img') {
      const meta = JC.art.meta(m.img);
      const pools = W().imgPools || {};
      const tag = meta ? (meta.tags || []).find((t) => pools[t]) : null;
      pool = tag ? pools[tag] : 'imgReact';
      bump = 1;
    } else if (kind === 'loc') { pool = 'idle'; }
    if (bump) applyFx({ sus: { [who]: bump } }, { thread: id });
    aside(id, [{ m: flavor(who, pool, ['?']), from: who }]);
    return m;
  };

  function pickMember(id) {
    const ms = members(id).filter((c) => { const x = JC.contacts.get(c); return x && !x.service; });
    return ms.length ? U.pick(ms) : members(id)[0];
  }
  const flavorIdx = {};
  /** reply pools may mix plain strings with { text, when(s) } lines; matching conditional lines win 60% of the time */
  function flavorLines(c, pool) {
    const raw = c && c[pool] && c[pool].length ? c[pool] : null;
    if (!raw) return null;
    const plain = [];
    const cond = [];
    raw.forEach((x) => {
      if (x == null) return;
      if (typeof x === 'string') plain.push(x);
      else if (typeof x === 'object' && x.text != null && (!x.when || evalFn(x.when, false))) cond.push(String(x.text));
    });
    if (!plain.length && !cond.length) return null;
    return { plain, cond };
  }
  function rotate(k, arr) {
    const i = flavorIdx[k] = ((flavorIdx[k] == null ? Math.floor(Math.random() * arr.length) : flavorIdx[k] + 1)) % arr.length;
    return arr[i];
  }
  function flavor(cid, pool, fallback) {
    const c = JC.contacts.get(cid);
    let which = pool;
    let L = flavorLines(c, pool);
    if (!L && fallback !== null) { which = 'idle'; L = flavorLines(c, 'idle'); }
    if (!L) return fallback == null || !fallback.length ? null : rotate(cid + ':fallback', fallback);
    const useCond = L.cond.length && (!L.plain.length || Math.random() < 0.6);
    return useCond ? rotate(cid + ':' + which + ':when', L.cond) : rotate(cid + ':' + which, L.plain);
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
    const C = W().confess || {};
    return (C.endings && C.endings[cid]) || C.fallback || Object.keys(defs.endings)[0];
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
      members(id).slice(0, 2).forEach((m) => applyFx({ sus: { [m]: 2 } }, { thread: id }));
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
    s.acts = s.acts || {};
    s.acts[name] = (s.acts[name] || 0) + 1;
    JC.bus.emit('story:act', { name, p });
    if (name === 'unlock' && p.first) s.unlockAt = s.eng;
    if (name === 'unlock' && s.unlockAt == null) s.unlockAt = s.eng;
    if (!s.ended) runActRules(name, p);
    // arm act/open triggers
    s.due = s.due || {};
    Object.values(defs.scenes).forEach((sc) => {
      if (s.done[sc.id] || !chapterOk(sc)) return;
      trigList(sc).forEach((t) => {
        let hit = false;
        if (t.on === 'act' && actMatches(t.act, name)) hit = !t.match || !!evalMatch(t.match, p);
        if (t.on === 'open' && name === 'open_thread' && t.thread && t.thread === p.thread) hit = true;
        if (t.on === 'open' && name === 'open_app' && t.app && t.app === p.app) hit = true;
        if (hit) arm(sc.id, s.eng + (t.delay || 0) * 1000);
      });
    });
    JC.state.save();
  };
  function evalMatch(fn, p) { try { return fn(p, sApi()); } catch (e) { return false; } }
  function actMatches(spec, name) { return Array.isArray(spec) ? spec.includes(name) : spec === name || spec === '*'; }

  /** onAct rules (JC.world.acts are registered at init) */
  function runActRules(name, p) {
    const s = S();
    s.actOnce = s.actOnce || {};
    defs.actRules.slice().forEach((r) => {
      if (!actMatches(r.act, name)) return;
      if (r.once && s.actOnce[r.id]) return;
      story._ctxArc = r.arc || null;
      const hit = !r.match || evalMatch(r.match, p);
      story._ctxArc = null;
      if (!hit) return;
      s.actOnce[r.id] = (s.actOnce[r.id] || 0) + 1;
      story._ctxArc = r.arc || null;
      let fx = r.fx;
      if (typeof fx === 'function') { try { fx = fx(p, sApi()); } catch (e) { console.error('[story] onAct fx failed', r.id, e); fx = null; } }
      if (fx) applyFx(fx, { thread: p.thread || null });
      if (r.start) startScene(r.start, { delay: r.delay || 0 });
      if (r.notify) {
        if (r.delay) aside(null, [{ notify: Object.assign({}, r.notify) }], r.delay * 1000);
        else JC.notify.push(Object.assign({}, r.notify));
      }
      story._ctxArc = null;
    });
  }

  /** absolute in-game ms for a time trigger: '+N HH:MM', 'YYYY-MM-DD HH:MM', or 'HH:MM' (before noon = the next day) */
  function atMs(at) {
    const s = String(at);
    if (/\s/.test(s) || /-/.test(s)) return JC.time.parse(s);
    const hh = parseInt(s, 10);
    return JC.time.parse((hh < 12 ? '+1 ' : '+0 ') + s);
  }
  function trigList(sc) {
    const t = sc.trigger;
    return !t ? [] : Array.isArray(t) ? t.filter(Boolean) : [t];
  }
  /** a scene that belongs to a chapter only arms while that chapter is current */
  function chapterOk(sc) {
    if (!sc.ch || !defs.chapters.length) return true;
    const c = S().chap;
    return !!(c && c.id === sc.ch);
  }
  /** arm a scene to start at play time `at` (any-of triggers: the earliest wins) */
  function arm(id, at) {
    const s = S();
    s.due = s.due || {};
    if (s.due[id] == null || at < s.due[id]) s.due[id] = at;
  }
  function susOf(who) { return who === 'total' ? story.susTotal() : (S().sus[who] || 0); }

  function checkTriggers() {
    const s = S();
    s.due = s.due || {};
    Object.values(defs.scenes).forEach((sc) => {
      if (s.done[sc.id] || !chapterOk(sc)) return;
      trigList(sc).forEach((t) => {
        const d = (t.delay || 0) * 1000;
        if (t.on === 'unlock' && s.unlockAt != null) arm(sc.id, s.unlockAt + d);
        else if (t.on === 'scene' && s.fin[t.scene]) arm(sc.id, s.fin[t.scene] + d);
        else if (t.on === 'flag' && s.flags[t.flag]) arm(sc.id, s.eng + d);
        else if (t.on === 'time' && JC.time.now() >= atMs(t.at)) arm(sc.id, s.eng + d);
        else if (t.on === 'chapter' && s.chapAt && s.chapAt[t.ch] != null) arm(sc.id, s.chapAt[t.ch] + d);
        else if (t.on === 'sus' && t.who && susOf(t.who) >= (t.at || 0)) arm(sc.id, s.eng + d);
      });
      if (s.due[sc.id] != null && s.eng >= s.due[sc.id]) {
        story._ctxArc = sc.arc || null;
        const pass = !sc.when || evalFn(sc.when, true);
        story._ctxArc = null;
        if (!pass) {
          if (sc.retry) return;
          s.done[sc.id] = 'skipped';
          return;
        }
        startScene(sc.id);
      }
    });
  }

  // ── Loop ─────────────────────────────────────────────────────────
  story._debug = () => ({ halted: halted(), started: S().started, ended: S().ended, frozen: JC.time.frozen, loop: !!loopT, chapter: S().chap, tick: (() => { try { tick(false); return 'ok'; } catch (e) { return 'ERR ' + (e && e.stack || e); } })() });
  function halted() {
    const s = S();
    return !s.started || !!s.ended || JC.time.frozen;
  }
  function tick(force) {
    const now = performance.now();
    const raw = Math.min(1000, now - lastTick);
    const dt = raw * scale();
    lastTick = now;
    const s = S();
    // the call timer (Date.now() - call.start) counts play time: faster with timeScale, stopped while paused
    if (call && call.start && call.phase === 'active' && !force) call.start -= halted() ? -raw : dt - raw;
    if (halted() && !force) return;
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
    checkChapter();
  }

  // ── Chapters ─────────────────────────────────────────────────────
  const chapterDef = (id) => defs.chapters.find((c) => c.id === id) || null;
  const chapterIndex = (id) => defs.chapters.findIndex((c) => c.id === id);
  function nextChapterDef() {
    const c = S().chap;
    if (!c) return defs.chapters[0] || null;
    return defs.chapters[chapterIndex(c.id) + 1] || null;
  }
  function chapterScenes(chId) { return Object.values(defs.scenes).filter((sc) => sc.ch === chId); }
  /** default settle: the chapter's required scenes are all finished / skipped, and none of its scenes is mid-conversation */
  function defaultSettle(ch) {
    const s = S();
    const list = chapterScenes(ch.id);
    const req = list.filter((sc) => sc.required);
    if (!req.length) return false;
    if (!req.every((sc) => s.fin[sc.id] || s.done[sc.id] === 'skipped' || s.done[sc.id] === 'expired')) return false;
    const ids = new Set(list.map((sc) => sc.id));
    return !s.runs.some((r) => r.kind === 'scene' && ids.has(r.sc) && (r.wait === 'choice' || r.wait === 'cinema' || r.phase !== 'wait'));
  }
  function settled(ch) {
    if (typeof ch.settle === 'function') {
      try { return !!ch.settle(sApi(), () => defaultSettle(ch)); } catch (e) { console.error('[story] chapter settle failed', ch.id, e); return false; }
    }
    return defaultSettle(ch);
  }
  function startChapter(i, at) {
    const s = S();
    const c = defs.chapters[i];
    if (!c) return;
    s.chap = { id: c.id, at, clock: JC.time.now() };
    s.chapAt = s.chapAt || {};
    s.chapAt[c.id] = at;
    JC.state.save();
    JC.bus.emit('story:chapter', { id: c.id, n: c.n, title: c.title, label: c.label, index: i });
    checkTriggers();
  }
  function checkChapter() {
    const s = S();
    if (!defs.chapters.length || s.ended || chapBusy) return;
    if (!s.chap) { if (s.unlockAt != null) startChapter(0, s.unlockAt); return; }
    const cur = chapterDef(s.chap.id);
    if (!cur || !nextChapterDef() || call) return;
    if (settled(cur)) {
      if (s.chap.settledAt == null) s.chap.settledAt = s.eng;
      if (s.eng - s.chap.settledAt >= (cur.settleDelay != null ? cur.settleDelay : 8) * 1000) advanceChapter('settled');
      return;
    }
    s.chap.settledAt = null;
    if (cur.maxWait && s.eng - s.chap.at >= cur.maxWait * 1000) advanceChapter('maxWait');
  }
  /** end the current chapter's scenes: cancel pending choices, run `expire` nodes instantly, mark unstarted scenes expired */
  function expireChapter(ch) {
    const s = S();
    const list = chapterScenes(ch.id);
    const ids = new Set(list.map((sc) => sc.id));
    s.runs.filter((r) => r.kind === 'scene' && ids.has(r.sc)).forEach((r) => {
      const sc = defs.scenes[r.sc];
      Object.keys(s.threads).forEach((k) => {
        const t = s.threads[k];
        if (t.pend && t.pend.rid === r.rid) { t.pend = null; JC.bus.emit('story:pending', { thread: k }); }
      });
      const tid = runThread(r, stepAt(r));
      if (tid && th(tid).typing) { th(tid).typing = null; JC.bus.emit('story:typing', { thread: tid, who: null }); }
      if (typeof sc.expire === 'string' && sc.nodes && sc.nodes[sc.expire]) {
        Object.assign(r, { node: sc.expire, i: 0, wait: null, phase: null, until: s.eng, instant: true });
        process(r);
        if (s.runs.includes(r)) finishRun(r);
      } else finishRun(r);
    });
    list.forEach((sc) => { if (!s.done[sc.id]) s.done[sc.id] = 'expired'; if (s.due) delete s.due[sc.id]; });
  }
  function advanceChapter(why) {
    const s = S();
    const cur = s.chap && chapterDef(s.chap.id);
    const next = nextChapterDef();
    if (!cur || !next || chapBusy || s.ended) return false;
    chapBusy = true;
    const tok = ++chapTok;
    expireChapter(cur);
    const fromT = JC.time.now();
    const to = Math.max(next.at ? JC.time.parse(next.at) : fromT, fromT);
    s.chapGo = { id: next.id, to };
    JC.state.save();
    JC.bus.emit('story:chapter:end', { id: cur.id, next: next.id, why });
    const finish = () => {
      if (tok !== chapTok) return;
      chapBusy = false;
      s.chapGo = null;
      if (JC.time.now() < to) JC.time.set(to);
      if (new Date(fromT).toDateString() !== new Date(to).toDateString() && JC.os.setBattery) JC.os.setBattery(100);
      startChapter(chapterIndex(next.id), s.eng);
    };
    if (story._ff || !JC.os.timeSkip) { JC.time.set(to); finish(); } else JC.os.timeSkip({ to, text: next.card || '', lock: next.lock }).then(finish);
    return true;
  }
  story.chapters = () => defs.chapters.map((c, i) => Object.assign({}, c, { index: i, started: S().chapAt ? S().chapAt[c.id] : undefined }));
  story.currentChapter = () => {
    const s = S();
    if (!s.chap) return null;
    const c = chapterDef(s.chap.id);
    return c ? Object.assign({}, c, { index: chapterIndex(c.id), startedAt: s.chap.at, day: U.DAYS[JC.time.date().getDay()] }) : null;
  };
  story.nextChapter = () => { const n = nextChapterDef(); return S().chap ? n : null; };
  story.canLater = () => {
    const s = S();
    if (!defs.chapters.length || !s.chap || s.ended || chapBusy || call || !s.started) return false;
    if (!nextChapterDef()) return false;
    return !s.runs.some((r) => r.wait === 'cinema' || (r.wait === 'choice' && r.tleft > 0));
  };
  story.later = () => (story.canLater() ? advanceChapter('later') : false);
  /** in-game clock pace for the current chapter (in-game seconds per play second, before timeScale) */
  function clockRate() {
    const s = S();
    if (!s.chap || s.ended || chapBusy) return 1;
    const c = chapterDef(s.chap.id);
    return c && c.clockRate > 0 ? c.clockRate : 1;
  }
  function clockCap() {
    const s = S();
    if (!s.chap || chapBusy) return null;
    const c = chapterDef(s.chap.id);
    return c && c.until ? JC.time.parse(c.until) : null;
  }
  story.clockRate = clockRate;
  JC.time.rate = () => scale() * clockRate();
  JC.time.cap = clockCap;

  // ── Time controls ────────────────────────────────────────────────
  story.timeScale = () => scale();
  story.setTimeScale = (n) => {
    n = Number(n);
    if (!SCALES.includes(n)) n = SCALES.reduce((a, b) => (Math.abs(b - n) < Math.abs(a - n) ? b : a), 1);
    JC.state.setting('timeScale', n);
    JC.bus.emit('story:time', { scale: n, paused: userPaused });
    return n;
  };
  story.paused = () => userPaused;
  story.pause = (on) => {
    on = !!on;
    if (on === userPaused) return on;
    userPaused = on;
    JC.time.freeze(on);
    lastTick = performance.now();
    JC.bus.emit('story:time', { scale: scale(), paused: on });
    return on;
  };
  /** play-ms until the next scheduled thing: a run's next step, an armed trigger, or an in-game time trigger */
  function nextEvent() {
    const s = S();
    let best = null;
    const consider = (d, kind, at) => { if (d == null || isNaN(d)) return; d = Math.max(0, d); if (!best || d < best.d) best = { d, kind, at }; };
    s.runs.forEach((r) => { if (!r.wait && r.until != null) consider(r.until - s.eng, 'step'); });
    Object.keys(s.due || {}).forEach((id) => { if (!s.done[id]) consider(s.due[id] - s.eng, 'trigger'); });
    const now = JC.time.now();
    const cap = clockCap();
    const rate = clockRate();
    Object.values(defs.scenes).forEach((sc) => {
      if (s.done[sc.id] || !chapterOk(sc)) return;
      trigList(sc).forEach((t) => {
        if (t.on !== 'time') return;
        const at = atMs(t.at);
        if (at <= now || (cap != null && at > cap)) return;
        consider((at - now) / rate + (t.delay || 0) * 1000, 'time', at);
      });
    });
    return best;
  }
  story.nextEvent = () => { const e = nextEvent(); return e ? { in: e.d, kind: e.kind } : null; };
  story.skipNext = () => {
    const s = S();
    if (!s.started || s.ended || chapBusy) return false;
    const e = nextEvent();
    if (!e) {
      if (story.canLater()) { story.later(); return 'later'; }
      return false;
    }
    s.eng += e.d;
    if (e.kind === 'time') JC.time.set(Math.max(JC.time.now(), e.at));
    else {
      const cap = clockCap();
      let t = JC.time.now() + e.d * clockRate();
      if (cap != null) t = Math.min(t, Math.max(JC.time.now(), cap));
      JC.time.set(t);
    }
    lastTick = performance.now();
    tick(true);
    JC.state.save();
    JC.bus.emit('story:skip', { kind: e.kind, ms: e.d });
    return e.kind;
  };
  /** tests: fast-forward play time by ms and move the clock with it (× the chapter's clockRate, never past `until`) */
  story._advance = (ms) => {
    const s = S();
    s.eng += ms;
    const cap = clockCap();
    let t = JC.time.now() + ms * clockRate();
    if (cap != null) t = Math.min(t, Math.max(JC.time.now(), cap));
    if (t > JC.time.now()) JC.time.set(t);
  };
  /** the contact typing in this thread finishes right now */
  story.hurry = (tid) => {
    const s = S();
    if (!th(tid).typing) return false;
    const run = s.runs.find((r) => r.phase === 'typing' && !r.wait && runThread(r, stepAt(r)) === tid);
    if (!run) return false;
    run.until = s.eng;
    tick(true);
    return true;
  };

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
    const opts = visibleOptions(step || {}, run);
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
    }, ((def.noAnswer ? 0.5 : ringFor) * 1000) / scale());
    story.act('call_start', { contact: cid, dir: 'out' });
  };

  /** turn a texted line into something said aloud: drop sign-offs ("— Zhongli"), join bubbles, drop emoji */
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
      def = { id, from: cid, ringFor: 1.5, nodes: { start: [{ say: 'The number you have dialed is no longer in service. Please check the number and try again.', from: 'sys' }, { hangup: true }] } };
    } else if (c.dial === 'busy' || c.service) {
      def = { id, from: cid, ringFor: 1, nodes: { start: [{ say: 'This number does not accept incoming calls.', from: 'sys' }, { hangup: true }] } };
    } else if (cid === WC().ownerLine && WC().ownerLineCall) {
      def = Object.assign({ from: cid }, WC().ownerLineCall, { id });
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
        start: [{ say: (c.hello || (o.emergency ? (WC().hello || {}).emergency : (WC().hello || {}).normal) || 'Hello?') }, { choice: [
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
  /** finale endings ({ finale: true }) whose `when` passes, best first (lower priority number first; no `when` = always) */
  story.qualifying = () => Object.values(defs.endings)
    .filter((e) => e.finale && (!e.when || evalFn(e.when, false)))
    .sort((a, b) => (a.priority != null ? a.priority : 999) - (b.priority != null ? b.priority : 999) || (a.n || 99) - (b.n || 99));

  // ── Aftermath ────────────────────────────────────────────────────
  /** where every chat ended up right now: [{ id, name, avatar, outcome, line, total }] (chats with no matching outcome are left out) */
  story.aftermathResult = () => {
    const out = [];
    defs.aftermath.forEach((c) => {
      const o = (c.outcomes || []).find((x) => !x.when || evalFn(x.when, false));
      if (!o) return;
      out.push({ id: c.id, name: c.name || (c.avatar ? JC.contacts.short(c.avatar) : c.id), avatar: c.avatar || null, outcome: o.id, line: o.line || '', total: (c.outcomes || []).length });
    });
    return out;
  };
  /** the aftermath shown with the last ending (frozen when the game ended) */
  story.aftermathLast = () => S().afterLast || null;
  /** every chat with its outcomes, and which were found in any playthrough: [{ id, name, avatar, outcomes: [{ id, line, found, at }], found, total }] */
  story.aftermathFound = () => {
    const F = S().afterFound || {};
    return defs.aftermath.map((c) => {
      const got = F[c.id] || {};
      const outcomes = (c.outcomes || []).map((o) => ({ id: o.id, line: o.line || '', found: !!got[o.id], at: got[o.id] || 0 }));
      return { id: c.id, name: c.name || (c.avatar ? JC.contacts.short(c.avatar) : c.id), avatar: c.avatar || null, outcomes, found: outcomes.filter((o) => o.found).length, total: outcomes.length };
    });
  };
  story.aftermathDefs = () => defs.aftermath.slice();

  function finishGame(ids) {
    const s = S();
    if (s.ended) return;
    ids.forEach((id) => { if (!s.endings[id]) s.endings[id] = { at: Date.now() }; });
    // per-chat outcomes, computed before anything else changes
    try {
      const res = story.aftermathResult();
      s.afterLast = { ending: ids[0], list: res };
      s.afterFound = s.afterFound || {};
      res.forEach((r) => { const m = s.afterFound[r.id] = s.afterFound[r.id] || {}; if (!m[r.outcome]) m[r.outcome] = Date.now(); });
    } catch (e) { console.error('[story] aftermath failed', e); }
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
    chapTok++;
    chapBusy = false;
    if (userPaused) { userPaused = false; JC.bus.emit('story:time', { scale: scale(), paused: false }); }
    if (S().chapGo) resumeChapter();
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

  /** a chapter transition was interrupted (reload, rewind): land in the next chapter now */
  function resumeChapter() {
    const s = S();
    const go = s.chapGo;
    s.chapGo = null;
    if (!go || chapterIndex(go.id) < 0) return;
    if (JC.time.now() < go.to) JC.time.set(go.to);
    startChapter(chapterIndex(go.id), s.eng);
  }
  let initDone = false;
  story.init = () => {
    if (!initDone) {
      initDone = true;
      (W().acts || []).forEach((r) => story.onAct(Object.assign({}, r)));
      story.gossip(W().gossip || []);
    }
    firstRunSetup();
    const s = S();
    // older saves kept arm times in s.armed (+ trigger delay)
    s.due = s.due || {};
    if (s.armed) {
      Object.keys(s.armed).forEach((id) => { const sc = defs.scenes[id]; if (sc && !s.done[id] && s.due[id] == null) s.due[id] = s.armed[id] + ((trigList(sc)[0] || {}).delay || 0) * 1000; });
      delete s.armed;
    }
    if (s.chapGo) resumeChapter();
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
      const lines = story.intro && story.intro.length ? story.intro : (W().introFallback || ['A phone buzzes under your hand.']);
      JC.os.prologue(lines).then(() => { s.started = true; JC.state.save(); });
    }
  };
})();
