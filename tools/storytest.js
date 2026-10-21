#!/usr/bin/env node
/* Story validator + automated playthroughs, run in headless Chromium against the real engine.
   node tools/storytest.js [runs=30] [--verbose] [--routes] [--route name] [--lint] [--scale 1|2|4|8]
   1) static checks over every scene / call / thread / ending / chapter (+ the act vocabulary, JC.world.actVocab)
   2) N randomized playthroughs (fast-forwarding play time with JC.story._ff so pacing stays proportional; with chapters
      the clock moves with play time via JC.story._advance) → endings reached, chapters reached, Aftermath outcomes, stuck runs
   --routes   play every scripted route in tools/routes/*.js and assert each lands on its `expect` ending
              (random runs are skipped unless a run count is given; --route <name> plays one)
   --lint     interconnection lint: which arc reads which arc's flags (scenes declare `arc`); fails when a finale
              ending reads fewer than 2 arcs, or an arc's flags are never read by another arc
   --scale N  play at timeScale N (1, 2, 4, 8)
   --inject f run script file f in the page before testing (stub content while a story is being written)
   Exit code 1 on any error, stuck run, failed route, lint failure or page error. */
const fs = require('fs');
const path = require('path');
const T = require('./pw');

const argv = process.argv.slice(2);
const has = (n) => argv.includes(n);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const valued = new Set(['--scale', '--route', '--inject']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && valued.has(argv[i - 1])));
const runsGiven = positional.length > 0;
const verbose = has('--verbose');
const routesMode = has('--routes') || !!val('--route');
const lintMode = has('--lint');
const scale = parseInt(val('--scale') || '1', 10);
const runs = runsGiven ? parseInt(positional[0], 10) : routesMode ? 0 : 30;
let failed = false;
const fail = () => { failed = true; };

// ── 1. static checks (runs in the page) ─────────────────────────────
function staticCheck() {
  const S = JC.story;
  const d = S.defs;
  const errors = [];
  const warns = [];
  const contacts = new Set(JC.contacts.all().map((c) => c.id));
  const threads = new Set(Object.keys(d.threads));
  const chapters = new Set((d.chapters || []).map((c) => c.id));
  const KNOWN = ['m', 'me', 'choice', 'fx', 'go', 'if', 'start', 'wait', 'typing', 'react', 'unsend', 'sys', 'add', 'notify', 'call', 'time', 'run', 'ending', 'endings', 'end', 'say', 'hangup', 'addMember', 'removeMember', 'rename', 'img'];
  const TRIG = ['unlock', 'scene', 'flag', 'act', 'open', 'time', 'manual', 'chapter', 'sus'];
  const WT = (JC.world && JC.world.test) || {};
  const setFlags = new Set(['told_truth', 'card_frozen'].concat(WT.flags || []));
  const trigs = (sc) => (!sc.trigger ? [] : Array.isArray(sc.trigger) ? sc.trigger : [sc.trigger]);
  const actsOf = (a) => (Array.isArray(a) ? a : [a]);
  // flags set by onAct rules (JC.world.acts are registered at init) with static fx
  (d.actRules || []).forEach((r) => { if (r.fx && typeof r.fx === 'object') { if (r.fx.set) Object.keys(r.fx.set).forEach((k) => setFlags.add(k)); if (r.fx.inc) Object.keys(r.fx.inc).forEach((k) => setFlags.add(k)); } });
  const usedFlags = new Map();
  const startedScenes = new Set();
  const calledCalls = new Set();
  function collectFx(fx) {
    if (!fx || typeof fx !== 'object') return;
    if (fx.set) Object.keys(fx.set).forEach((k) => setFlags.add(k));
    if (fx.inc) Object.keys(fx.inc).forEach((k) => setFlags.add(k));
    ['sus', 'aff'].forEach((key) => { if (fx[key]) Object.keys(fx[key]).forEach((c) => { if (!contacts.has(c)) errors.push(`fx.${key} unknown contact ${c}`); }); });
  }
  function checkGraph(kind, id, def) {
    const nodes = def.nodes || {};
    if (!nodes.start) errors.push(`${kind} ${id}: no start node`);
    const reach = new Set();
    const queue = ['start'];
    if (typeof def.expire === 'string') { if (!nodes[def.expire]) errors.push(`${kind} ${id}: expire node "${def.expire}" missing`); else queue.push(def.expire); }
    while (queue.length) {
      const n = queue.shift();
      if (reach.has(n) || !nodes[n]) continue;
      reach.add(n);
      nodes[n].forEach((st, i) => {
        const where = `${kind} ${id}.${n}[${i}]`;
        const keys = Object.keys(st);
        if (!keys.some((k) => KNOWN.includes(k))) errors.push(`${where}: unknown step ${JSON.stringify(st).slice(0, 80)}`);
        const tgt = (t) => { if (t && !nodes[t]) errors.push(`${where}: missing node "${t}"`); else if (t) queue.push(t); };
        tgt(st.go); tgt(st.else);
        if (st.choice) {
          if (!st.choice.length) errors.push(`${where}: empty choice`);
          st.choice.forEach((o, j) => { tgt(o.go); collectFx(o.fx); if (!o.t && !o.label) errors.push(`${where} opt ${j}: no text`); });
          tgt(st.onTimeout);
          if (n === def.expire) warns.push(`${where}: choice inside an expire node (skipped when the chapter ends)`);
        }
        collectFx(st.fx);
        if (st.start) { startedScenes.add(st.start); if (!d.scenes[st.start]) errors.push(`${where}: start unknown scene ${st.start}`); }
        if (st.call) { calledCalls.add(st.call); if (!d.calls[st.call]) errors.push(`${where}: unknown call ${st.call}`); }
        if (st.ending && !d.endings[st.ending]) errors.push(`${where}: unknown ending ${st.ending}`);
        if (Array.isArray(st.endings)) st.endings.forEach((e) => { if (!d.endings[e]) errors.push(`${where}: unknown ending ${e}`); });
        if (typeof st.endings === 'string' && st.endings !== 'finale') errors.push(`${where}: endings must be an array, a function or 'finale'`);
        const th = st.th || def.thread;
        if ((st.m != null || st.me != null || st.choice || st.sys) && kind === 'scene' && !th && !id.startsWith('confess_')) errors.push(`${where}: no thread`);
        if (th && !threads.has(th) && !contacts.has(th)) warns.push(`${where}: thread "${th}" not defined (dynamic)`);
        if (st.m != null && th) {
          const td = d.threads[th];
          const mem = td ? td.members : [th];
          if (mem.length > 1 && !st.from) errors.push(`${where}: group message without from`);
          if (st.from && !contacts.has(st.from) && st.from !== 'sys') errors.push(`${where}: unknown from ${st.from}`);
          if (st.from && td && mem.length > 1 && !mem.includes(st.from)) warns.push(`${where}: ${st.from} not a member of ${th}`);
        }
        if (st.img && !JC.art.has(st.img)) warns.push(`${where}: art ${st.img} not drawn yet`);
        if (st.if && typeof st.if !== 'function') errors.push(`${where}: if must be a function`);
      });
    }
    Object.keys(nodes).forEach((n) => { if (!reach.has(n)) warns.push(`${kind} ${id}: node "${n}" unreachable`); });
  }
  Object.entries(d.scenes).forEach(([id, sc]) => {
    checkGraph('scene', id, sc);
    if (sc.ch && !chapters.has(sc.ch)) errors.push(`scene ${id}: unknown chapter ${sc.ch}`);
    if (sc.required && !sc.ch) warns.push(`scene ${id}: required but has no ch`);
    const ts = trigs(sc);
    if (!ts.length) warns.push(`scene ${id}: no trigger`);
    ts.forEach((t) => {
      if (!TRIG.includes(t.on)) errors.push(`scene ${id}: unknown trigger on:"${t.on}"`);
      else if (t.on === 'scene' && !d.scenes[t.scene]) errors.push(`scene ${id}: trigger scene ${t.scene} unknown`);
      else if (t.on === 'flag') usedFlags.set(t.flag, id);
      else if (t.on === 'chapter' && !chapters.has(t.ch)) errors.push(`scene ${id}: trigger chapter ${t.ch} unknown`);
      else if (t.on === 'sus' && t.who !== 'total' && !contacts.has(t.who)) errors.push(`scene ${id}: trigger sus who ${t.who} unknown`);
      else if (t.on === 'act' && !t.act) errors.push(`scene ${id}: act trigger without act`);
    });
  });
  Object.entries(d.calls).forEach(([id, c]) => { if (!id.startsWith('_dial_')) checkGraph('call', id, c); if (c.from && !contacts.has(c.from)) errors.push(`call ${id}: unknown from ${c.from}`); });
  d.dial.forEach((x) => { if (!x.cid.startsWith('_') && !d.calls[x.callId]) errors.push(`dialScript ${x.cid}: unknown call ${x.callId}`); });
  d.susHooks.forEach((x) => { if (!d.scenes[x.sceneId]) errors.push(`onSuspicion ${x.cid}: unknown scene ${x.sceneId}`); });
  d.totalHooks.forEach((x) => { if (!d.scenes[x.sceneId]) errors.push(`onTotalSuspicion: unknown scene ${x.sceneId}`); });
  (d.actRules || []).forEach((r) => {
    if (r.start && !d.scenes[r.start]) errors.push(`onAct ${r.id}: start unknown scene ${r.start}`);
    if (r.fx && typeof r.fx === 'object') collectFx(r.fx);
  });
  (d.gossip || []).forEach((e) => { if (!contacts.has(e.from) || !contacts.has(e.to)) errors.push(`gossip ${e.from} → ${e.to}: unknown contact`); });
  usedFlags.forEach((sid, f) => { if (!setFlags.has(f)) warns.push(`scene ${sid}: trigger flag "${f}" is never set by a static fx`); });
  Object.entries(d.scenes).forEach(([id, sc]) => {
    const manualOnly = trigs(sc).length && trigs(sc).every((t) => t.on === 'manual');
    if (manualOnly && !startedScenes.has(id) && !(d.actRules || []).some((r) => r.start === id) && !d.susHooks.some((x) => x.sceneId === id) && !d.totalHooks.some((x) => x.sceneId === id) && !id.startsWith('confess_')) warns.push(`scene ${id}: manual trigger but never started`);
  });
  // act vocabulary (JC.world.actVocab)
  const vocab = JC.world && Array.isArray(JC.world.actVocab) ? new Set(JC.world.actVocab.concat(['unlock', 'open_app', 'open_thread', 'send', 'tapback', 'memo_share', 'call_start', 'call_end', 'setting', 'charge', 'decline', 'transfer', 'card_freeze', 'wallpaper'])) : null;
  const actsUsed = new Map();
  Object.entries(d.scenes).forEach(([id, sc]) => trigs(sc).forEach((t) => { if (t.on === 'act') actsOf(t.act).forEach((a) => actsUsed.set(a, 'scene ' + id)); }));
  (d.actRules || []).forEach((r) => actsOf(r.act).forEach((a) => actsUsed.set(a, 'onAct ' + r.id)));
  if (vocab) actsUsed.forEach((where, a) => { if (a !== '*' && !vocab.has(a)) warns.push(`${where}: act "${a}" is not in JC.world.actVocab`); });
  // threads
  Object.entries(d.threads).forEach(([id, t]) => {
    let last = 0;
    (t.history || []).forEach((row, i) => {
      if (!Array.isArray(row)) return;
      const [time, from, , extra] = row;
      const ms = JC.time.parse(time);
      if (ms < last) errors.push(`thread ${id}[${i}]: not chronological (${time})`);
      last = ms;
      if (ms > JC.time.START) errors.push(`thread ${id}[${i}]: after the story start (${time})`);
      if (from !== 'me' && from !== 'sys' && !contacts.has(from)) errors.push(`thread ${id}[${i}]: unknown from ${from}`);
      if (from !== 'me' && from !== 'sys' && t.members && !t.members.includes(from) && !(extra && extra.sys)) warns.push(`thread ${id}[${i}]: ${from} not a member`);
      if (extra && extra.img && !JC.art.has(extra.img)) warns.push(`thread ${id}[${i}]: art ${extra.img} not drawn yet`);
    });
  });
  // endings
  const ends = Object.values(d.endings);
  const want = (JC.world && JC.world.endings) || 0;
  if (want && ends.length !== want) errors.push(`expected ${want} endings (JC.world.endings), found ${ends.length}`);
  ends.forEach((e) => {
    if (!e.title || !e.text || !e.text.length) errors.push(`ending ${e.id}: missing title/text`);
    if (!e.jc || !e.jc.length) warns.push(`ending ${e.id}: no jc epilogue`);
    if (!e.hint) warns.push(`ending ${e.id}: no hint`);
    if (!JC.art.has(e.art || 'end_' + e.id)) warns.push(`ending ${e.id}: art not drawn yet`);
    if (e.when && typeof e.when !== 'function') errors.push(`ending ${e.id}: when must be a function`);
  });
  const finale = ends.filter((e) => e.finale);
  if (finale.length && !finale.some((e) => !e.when)) warns.push('finale endings: none without `when` (a fallback ending), so { endings: \'finale\' } can find nothing');
  // chapters
  (d.chapters || []).forEach((c, i) => {
    const list = Object.values(d.scenes).filter((sc) => sc.ch === c.id);
    if (!list.length) warns.push(`chapter ${c.id}: arms no scenes (no scene has ch: '${c.id}')`);
    if (!list.some((sc) => sc.required) && !c.maxWait && !c.settle && i < d.chapters.length - 1) warns.push(`chapter ${c.id}: never settles on its own (no required scenes, no settle, no maxWait) — only Later… moves on`);
    if (i > 0 && !c.at) warns.push(`chapter ${c.id}: no at (the clock will not jump)`);
    if (c.until && c.at && JC.time.parse(c.until) <= JC.time.parse(c.at)) errors.push(`chapter ${c.id}: until is not after at`);
  });
  // aftermath
  (S.aftermathDefs ? S.aftermathDefs() : []).forEach((c) => {
    if (!c.outcomes || !c.outcomes.length) errors.push(`aftermath ${c.id}: no outcomes`);
    else if (!c.outcomes.some((o) => !o.when)) warns.push(`aftermath ${c.id}: no outcome without \`when\` (the chat may be left out)`);
    if (c.avatar && !contacts.has(c.avatar)) errors.push(`aftermath ${c.id}: unknown avatar contact ${c.avatar}`);
  });
  const msgCount = Object.values(d.threads).reduce((a, t) => a + (t.history || []).length, 0);
  let choiceCount = 0;
  Object.values(d.scenes).concat(Object.values(d.calls)).forEach((sc) => Object.values(sc.nodes || {}).forEach((arr) => arr.forEach((st) => { if (st.choice) choiceCount++; })));
  return { errors, warns, stats: { threads: threads.size, messages: msgCount, scenes: Object.keys(d.scenes).length, calls: Object.keys(d.calls).filter((k) => !k.startsWith('_')).length, choices: choiceCount, endings: ends.length, chapters: (d.chapters || []).length, aftermath: (S.aftermathDefs ? S.aftermathDefs() : []).length, actRules: (d.actRules || []).length } };
}

// ── shared page helpers (installed once) ───────────────────────────
function installHelpers(opts) {
  const H = (window.__st = {});
  H.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  H.chapters = () => (JC.story.chapters ? JC.story.chapters().length : 0);
  /** fast-forward play time (and, with chapters, the clock: clockRate + until) */
  H.advance = (ms) => { if (H.chapters() && JC.story._advance) JC.story._advance(ms); else JC.state.d.eng += ms; };
  H.chapterEnds = [];
  JC.bus.on('story:chapter:end', (e) => H.chapterEnds.push(e.id + ':' + e.why));
  H.reset = async (scale) => {
    let ev = null;
    const off = JC.bus.on('story:ending', (e) => { ev = e; });
    JC.story.restart();
    await H.sleep(100);
    const sk = document.querySelector('.pro-skip');
    if (sk) sk.click();
    await H.sleep(1000);
    JC.story._ff = true;
    JC.state.setting('speed', 1);
    JC.state.setting('timeScale', scale || 1);
    JC.state.setting('faceAlt', true);
    JC.state.d.unlocked = true;
    JC.os.unlockThen(() => {});
    await H.sleep(900);
    H.chapterEnds.length = 0;
    return () => { off(); return ev; };
  };
  H.summary = () => {
    const st = JC.state.d;
    const al = st.afterLast;
    return { chapters: Object.keys(st.chapAt || {}), chapterEnds: H.chapterEnds.slice(), aftermath: al && al.list ? al.list.map((r) => r.id + ':' + r.outcome) : [] };
  };
  // interconnection lint: record which keys conditions read, per arc (JC.story._ctxArc)
  if (opts.lint) {
    window.__reads = {};
    JC.story._watchFlags = (obj, prefix) => new Proxy(obj || {}, {
      get(t, k) {
        if (typeof k === 'string') {
          const arc = JC.story._ctxArc || '?';
          const r = (window.__reads[arc] = window.__reads[arc] || {});
          r[(prefix || '') + k] = (r[(prefix || '') + k] || 0) + 1;
        }
        return t[k];
      },
    });
  }
}

// ── 2. randomized playthroughs ──────────────────────────────────────
async function playthrough(page, seed, strategy) {
  return page.evaluate(async ({ seed, strategy, scale }) => {
    const H = window.__st;
    let s = seed;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const pick = (n) => Math.floor(rnd() * n);
    const endEv = await H.reset(scale);
    const log = [];
    const did = {};
    const TA = (JC.world && JC.world.test && JC.world.test.actions) || [];
    const TT = { act: (n, p) => JC.story.act(n, p), send: (cid, m) => JC.story.send(JC.story.threadFor(cid), m), rnd, pick: (arr) => arr[pick(arr.length)], log: (t) => log.push(t) };
    let quiet = 0;
    for (let it = 0; it < 2600; it++) {
      const st = JC.state.d;
      if (st.ended) { const ev = endEv(); return Object.assign({ ending: st.ended, also: (ev && ev.also) || [], it, log: log.slice(-12) }, H.summary()); }
      // occasional optional actions that open branches (JC.world.test.actions)
      for (const a of TA) {
        if (a.only && !a.only.includes(strategy)) continue;
        if (a.not && a.not.includes(strategy)) continue;
        if (!a.repeat && did[a.id]) continue;
        if (a.after && it <= a.after) continue;
        if (rnd() >= (a.p || 0)) continue;
        did[a.id] = 1;
        try { a.run(TT); } catch (e) { log.push('action ' + a.id + ' failed: ' + e.message); }
      }
      // calls
      const c = JC.story.call();
      if (c && c.phase === 'ringing' && c.dir === 'in') { if (strategy === 'decline' && rnd() < 0.7) { JC.story.decline(); log.push('decline ' + c.cid); } else { JC.story.answer(); log.push('answer ' + c.cid); } }
      if (c && c.pend) { const i = pick(c.pend.options.length); log.push('call ' + c.cid + ': ' + c.pend.options[i].label); JC.story.callChoose(i); }
      // pending choices
      let chose = false;
      for (const t of JC.story.threads()) {
        const p = JC.story.pending(t.id);
        if (p && p.options.length) {
          let i = pick(p.options.length);
          if (strategy === 'first') i = 0;
          if (strategy === 'last') i = p.options.length - 1;
          log.push(t.id + ': ' + p.options[i].label);
          JC.story.choose(t.id, i);
          chose = true;
          break;
        }
      }
      // chapters: skip ahead with Later… now and then once things are quiet
      quiet = chose || c ? 0 : quiet + 1;
      if (JC.story.canLater && JC.story.canLater() && quiet > (strategy === 'minimal' ? 20 : 60) && rnd() < 0.15) { log.push('later'); JC.story.later(); quiet = 0; }
      // fast-forward play time
      if (!JC.time.frozen) H.advance(4000);
      await H.sleep(25);
    }
    const st = JC.state.d;
    const c = JC.story.call();
    const dbg = JC.story._debug ? JC.story._debug() : null;
    return Object.assign({ dbg, ending: null, stuck: true, log: log.slice(-15), runs: st.runs.map((r) => r.sc + '.' + r.node + '[' + r.i + ']' + (r.wait ? ' wait:' + r.wait : '') + (r.phase ? ' phase:' + r.phase : '') + ' until+' + Math.round((r.until || 0) - st.eng)), frozen: JC.time.frozen, cinema: document.getElementById('cinema').className, call: c ? c.id + ':' + c.phase + ':' + c.dir + (c.pend ? ':pend' : '') : null, eng: Math.round(st.eng), clock: new Date(JC.time.now()).toString().slice(0, 24) }, H.summary());
  }, { seed, strategy, scale });
}

// ── 3. scripted routes (tools/routes/*.js) ──────────────────────────
/** RegExp → { __re, flags } so steps survive page.evaluate */
function ser(x) {
  if (x instanceof RegExp) return { __re: x.source, flags: x.flags };
  if (Array.isArray(x)) return x.map(ser);
  if (x && typeof x === 'object') { const o = {}; Object.keys(x).forEach((k) => { o[k] = ser(x[k]); }); return o; }
  if (typeof x === 'function') return { __fn: x.toString() };
  return x;
}
function loadRoutes(only) {
  const dir = path.join(__dirname, 'routes');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_')).sort().map((f) => {
    const r = require(path.join(dir, f));
    return Object.assign({ file: f }, r);
  }).filter((r) => !only || r.name === only || r.file === only || r.file === only + '.js');
}
async function playRoute(page, route) {
  return page.evaluate(async ({ route, scale }) => {
    const H = window.__st;
    const de = (x) => {
      if (Array.isArray(x)) return x.map(de);
      if (x && typeof x === 'object') {
        if (x.__re != null) return new RegExp(x.__re, x.flags);
        if (x.__fn != null) return (0, eval)('(' + x.__fn + ')'); // eslint-disable-line no-eval
        const o = {}; Object.keys(x).forEach((k) => { o[k] = de(x[k]); }); return o;
      }
      return x;
    };
    const R = de(route);
    const endEv = await H.reset(R.scale || scale);
    const log = [];
    const match = (m, text) => (m instanceof RegExp ? m.test(text) : String(text).toLowerCase().includes(String(m).toLowerCase()));
    const callPolicy = R.calls || 'decline';
    /** fast-forward until cond() (checked before every step of play time); handles calls not addressed by the route */
    const until = async (cond, maxSec, opts) => {
      opts = opts || {};
      for (let t = 0; t <= maxSec * 1000; t += 4000) {
        if (JC.state.d.ended && !opts.allowEnd) return false;
        const v = cond();
        if (v) return v;
        const c = JC.story.call();
        if (c && !opts.keepCall) {
          if (c.phase === 'ringing' && c.dir === 'in') { if (callPolicy === 'answer') { JC.story.answer(); log.push('answer ' + c.cid); } else { JC.story.decline(); log.push('decline ' + c.cid); } }
          else if (c.pend) { log.push('call ' + c.cid + ': ' + c.pend.options[0].label); JC.story.callChoose(0); }
        }
        if (!JC.time.frozen) H.advance(4000);
        await H.sleep(20);
      }
      return false;
    };
    const fail = (i, msg) => ({ ok: false, name: R.name, step: i, msg, ended: JC.state.d.ended, log: log.slice(-12), flags: JC.state.d.flags });
    const steps = R.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const st = steps[i];
      const max = st.within || 3600;
      if (st.choose) {
        const want = st.choose;
        const got = await until(() => { const p = JC.story.pending(want.thread); if (!p) return null; const o = p.options.find((x) => match(want.match, x.label) || match(want.match, x.text || '')); return o ? { o } : null; }, max);
        if (!got) return fail(i, 'choice never offered in ' + want.thread + ': ' + want.match);
        log.push(want.thread + ': ' + got.o.label);
        JC.story.choose(want.thread, got.o.i);
      } else if (st.act) {
        const [name, payload] = Array.isArray(st.act) ? st.act : [st.act, {}];
        JC.story.act(name, payload || {});
        log.push('act ' + name);
      } else if (st.later) {
        const ok = await until(() => JC.story.canLater(), max);
        if (!ok) return fail(i, 'Later… never became available');
        JC.story.later();
        log.push('later');
        await H.sleep(200);
      } else if (st.wait != null) {
        await until(() => false, st.wait);
        log.push('wait ' + st.wait);
      } else if (st.dial) {
        const ok = await until(() => !JC.story.call(), max);
        if (!ok) return fail(i, 'line never free to dial ' + st.dial);
        JC.story.dial(st.dial, st.video ? { video: true } : undefined);
        log.push('dial ' + st.dial);
        await H.sleep(Math.round(8000 / ((JC.state.d.settings.timeScale) || 1)));
      } else if (st.answer) {
        const ok = await until(() => { const c = JC.story.call(); return c && c.phase === 'ringing' && c.dir === 'in' && (st.answer === true || c.cid === st.answer); }, max, { keepCall: true });
        if (!ok) return fail(i, 'no incoming call' + (st.answer === true ? '' : ' from ' + st.answer));
        JC.story.answer();
        log.push('answer');
      } else if (st.callChoose) {
        const want = st.callChoose;
        const got = await until(() => { const c = JC.story.call(); if (!c || !c.pend) return null; const o = c.pend.options.find((x) => match(want.match, x.label)); return o ? { o } : null; }, max, { keepCall: true });
        if (!got) return fail(i, 'call option never offered: ' + want.match);
        log.push('call: ' + got.o.label);
        JC.story.callChoose(got.o.i);
      } else if (st.hangup) {
        JC.story.hangup();
      } else if (st.send) {
        const [th, text] = Array.isArray(st.send) ? st.send : [st.send.thread, st.send.text];
        JC.story.send(JC.story.threadFor(th), typeof text === 'string' ? { text } : text);
        log.push('send ' + th);
      } else if (st.open) {
        JC.story.act('open_thread', { thread: st.open });
      } else if (st.app) {
        JC.story.act('open_app', { app: st.app });
      } else if (st.assert) {
        let ok = false;
        try { ok = typeof st.assert === 'function' ? !!st.assert(JC.story.api()) : !!new Function('s', 'return (' + st.assert + ');')(JC.story.api()); } catch (e) { ok = false; }
        if (!ok) return fail(i, 'assert failed: ' + st.assert);
      } else if (st.until) {
        const ok = await until(() => { try { return typeof st.until === 'function' ? st.until(JC.story.api()) : new Function('s', 'return (' + st.until + ');')(JC.story.api()); } catch (e) { return false; } }, max);
        if (!ok) return fail(i, 'until never true: ' + st.until);
      } else return fail(i, 'unknown route step ' + JSON.stringify(st));
    }
    await until(() => JC.state.d.ended, R.maxSec || 4 * 3600, { allowEnd: true });
    const ev = endEv();
    const ended = JC.state.d.ended;
    return Object.assign({ ok: ended === R.expect, name: R.name, expect: R.expect, ended, also: (ev && ev.also) || [], log: log.slice(-12) }, H.summary());
  }, { route: ser(route), scale });
}

// ── 4. interconnection lint ─────────────────────────────────────────
function lintCollect() {
  const d = JC.story.defs;
  const owner = {}; // key → Set(arcs) that write it
  const own = (key, arc) => { (owner[key] = owner[key] || new Set()).add(arc); };
  const fxKeys = (fx) => {
    const out = [];
    if (!fx || typeof fx !== 'object') return out;
    ['set', 'inc'].forEach((k) => { if (fx[k]) Object.keys(fx[k]).forEach((f) => out.push(f)); });
    ['aff', 'sus'].forEach((k) => { if (fx[k]) Object.keys(fx[k]).forEach((c) => out.push(k + '.' + c)); });
    return out;
  };
  const staticReads = {}; // arc → Set(keys)
  const SRC = [/flags\.([A-Za-z_$][\w$]*)/g, /flags\[['"]([^'"]+)['"]\]/g, /\bflag\(\s*['"]([^'"]+)['"]\s*\)/g, /\bcount\(\s*['"]([^'"]+)['"]\s*\)/g, /\bF\(s\)\.([A-Za-z_$][\w$]*)/g];
  const scan = (fn, arc, into) => {
    if (typeof fn !== 'function') return;
    const src = fn.toString();
    const set = (into[arc] = into[arc] || new Set());
    SRC.forEach((re) => { re.lastIndex = 0; let m; while ((m = re.exec(src))) set.add(m[1]); });
    let m; const ra = /\baff\.([a-z_][\w]*)|\baff\[['"]([^'"]+)/g; while ((m = ra.exec(src))) set.add('aff.' + (m[1] || m[2]));
    const rs = /\bsus\.([a-z_][\w]*)|\bsus\[['"]([^'"]+)/g; while ((m = rs.exec(src))) set.add('sus.' + (m[1] || m[2]));
    const rc = /\bacted\(\s*['"]([^'"]+)/g; while ((m = rc.exec(src))) set.add('act.' + m[1]);
  };
  const arcs = new Set();
  Object.values(d.scenes).forEach((sc) => {
    if (!sc.arc) return;
    arcs.add(sc.arc);
    scan(sc.when, sc.arc, staticReads);
    Object.values(sc.nodes || {}).forEach((arr) => arr.forEach((st) => {
      fxKeys(st.fx).forEach((k) => own(k, sc.arc));
      if (st.choice) st.choice.forEach((o) => { fxKeys(o.fx).forEach((k) => own(k, sc.arc)); scan(o.if, sc.arc, staticReads); });
      scan(st.if, sc.arc, staticReads);
    }));
  });
  (d.actRules || []).forEach((r) => { if (r.arc) { arcs.add(r.arc); fxKeys(r.fx).forEach((k) => own(k, r.arc)); scan(r.match, r.arc, staticReads); } });
  // finale endings: record reads with all-true and all-false proxies (short-circuits), plus the source
  const endReads = {};
  Object.values(d.endings).filter((e) => e.finale && typeof e.when === 'function').forEach((e) => {
    const keys = new Set();
    [true, false].forEach((v) => {
      const P = (prefix) => new Proxy({}, { get(t, k) { if (typeof k === 'string') keys.add(prefix + k); return v ? 1 : 0; } });
      const fl = P('');
      const api = Object.assign({}, JC.story.api(), { flags: fl, flag: (n) => fl[n], count: (n) => fl[n], aff: P('aff.'), sus: P('sus.'), acted: (n) => { keys.add('act.' + n); return v ? 1 : 0; }, susTotal: () => (v ? 0 : 99) });
      try { e.when(api); } catch (err) { /* partial reads still count */ }
    });
    const tmp = {};
    scan(e.when, 'x', tmp);
    (tmp.x || []).forEach((k) => keys.add(k));
    endReads[e.id] = { keys: Array.from(keys), arcs: e.arcs || [] };
  });
  const ownerOut = {};
  Object.keys(owner).forEach((k) => { ownerOut[k] = Array.from(owner[k]); });
  const sr = {};
  Object.keys(staticReads).forEach((a) => { sr[a] = Array.from(staticReads[a]); });
  return { arcs: Array.from(arcs), owner: ownerOut, staticReads: sr, runtimeReads: window.__reads || {}, endReads };
}
function lintReport(L) {
  console.log('\nINTERCONNECTION LINT');
  if (!L.arcs.length) { console.log('  warn  no scenes declare `arc`: interconnection lint skipped'); return true; }
  const arcs = L.arcs.slice().sort();
  const ownersOf = (k) => L.owner[k] || [];
  // reads[reader][owner] = Set(keys)
  const reads = {};
  const add = (reader, key) => {
    ownersOf(key).forEach((o) => { if (o === reader) return; const r = (reads[reader] = reads[reader] || {}); (r[o] = r[o] || new Set()).add(key); });
  };
  Object.entries(L.staticReads).forEach(([arc, keys]) => keys.forEach((k) => add(arc, k)));
  Object.entries(L.runtimeReads).forEach(([arc, keys]) => { if (arc !== '?') Object.keys(keys).forEach((k) => add(arc, k)); });
  const w = Math.max(6, ...arcs.map((a) => a.length));
  console.log('  reader \\ writer  (distinct keys read)');
  console.log('  ' + ''.padEnd(w) + ' ' + arcs.map((a) => a.slice(0, 6).padStart(6)).join(' '));
  arcs.forEach((r) => console.log('  ' + r.padEnd(w) + ' ' + arcs.map((o) => (r === o ? '·' : String((reads[r] && reads[r][o] ? reads[r][o].size : 0) || '')).padStart(6)).join(' ')));
  let ok = true;
  // every arc's flags must be read by another arc
  arcs.forEach((a) => {
    const owned = Object.keys(L.owner).filter((k) => L.owner[k].includes(a));
    if (!owned.length) return;
    const readByOther = arcs.some((r) => r !== a && reads[r] && reads[r][a] && reads[r][a].size);
    if (!readByOther) { ok = false; console.log(`  FAIL  arc ${a}: none of its ${owned.length} flags is read by another arc`); }
  });
  // finale endings must read at least two arcs
  Object.entries(L.endReads).forEach(([id, e]) => {
    const got = new Set();
    e.keys.forEach((k) => ownersOf(k).forEach((o) => got.add(o)));
    const list = Array.from(got).sort();
    if (list.length < 2) { ok = false; console.log(`  FAIL  ending ${id}: reads ${list.length} arc${list.length === 1 ? '' : 's'} (${list.join(', ') || 'none'}); declared arcs: ${(e.arcs || []).join(', ') || '—'}`); }
    else console.log(`  ok    ending ${id}: reads ${list.join(', ')}`);
  });
  return ok;
}

(async () => {
  const { page, done } = await T.open({});
  if (val('--inject')) await page.evaluate(fs.readFileSync(path.resolve(val('--inject')), 'utf8'));
  await T.skipIntro(page);
  const res = await page.evaluate(staticCheck);
  console.log('STATS', JSON.stringify(res.stats));
  console.log(`STATIC: ${res.errors.length} errors, ${res.warns.length} warnings`);
  if (res.errors.length) fail();
  res.errors.forEach((e) => console.log('  ERROR ' + e));
  (verbose ? res.warns : res.warns.slice(0, 25)).forEach((w) => console.log('  warn  ' + w));
  if (!verbose && res.warns.length > 25) console.log(`  … ${res.warns.length - 25} more warnings (--verbose)`);
  await page.evaluate(installHelpers, { lint: lintMode });
  if (scale !== 1) console.log('TIME SCALE', scale + '×');
  const tally = {};
  const unlocked = {};
  const chapters = {};
  const chapterEnds = {};
  const after = {};
  const tallyRun = (r) => {
    (r.chapters || []).forEach((c) => { chapters[c] = (chapters[c] || 0) + 1; });
    (r.chapterEnds || []).forEach((c) => { chapterEnds[c] = (chapterEnds[c] || 0) + 1; });
    (r.aftermath || []).forEach((x) => { after[x] = (after[x] || 0) + 1; });
  };
  const strategies = ['random', 'first', 'last', 'chaos', 'decline', 'minimal'];
  let stuck = 0;
  for (let k = 0; k < runs; k++) {
    const strategy = strategies[k % strategies.length];
    const r = await playthrough(page, 1000 + k * 7919, strategy);
    const key = r.ending || 'STUCK';
    if (!r.ending) stuck++;
    tally[key] = (tally[key] || 0) + 1;
    [key].concat(r.also || []).forEach((id) => { unlocked[id] = (unlocked[id] || 0) + 1; });
    tallyRun(r);
    if (!r.ending || verbose) console.log(`run ${k} [${strategy}] → ${key}${r.chapters && r.chapters.length ? ' (chapters ' + r.chapters.join(',') + ')' : ''}${r.stuck ? '\n   runs: ' + JSON.stringify(r.runs) + '\n   last: ' + JSON.stringify(r.log) + '\n   state: ' + JSON.stringify({ frozen: r.frozen, cinema: r.cinema, call: r.call, eng: r.eng, clock: r.clock }) + '\n   dbg: ' + JSON.stringify(r.dbg) : ''}`);
  }
  if (runs) {
    console.log('ENDINGS', JSON.stringify(tally));
    console.log('UNLOCKED (primary + also)', JSON.stringify(unlocked));
    const allEnds = await page.evaluate(() => JC.story.endings().map((e) => e.id));
    const never = allEnds.filter((id) => !unlocked[id]);
    console.log(`ENDINGS REACHED: ${allEnds.length - never.length} of ${allEnds.length}` + (never.length ? ' · never: ' + never.join(', ') : ''));
    if (stuck) { fail(); console.log('STUCK RUNS: ' + stuck); }
  }
  // routes
  if (routesMode) {
    const routes = loadRoutes(val('--route'));
    console.log(`\nROUTES: ${routes.length}`);
    if (!routes.length) { console.log('  (no routes in tools/routes)'); if (val('--route')) fail(); }
    for (const route of routes) {
      const r = await playRoute(page, route);
      tallyRun(r);
      if (r.ended) unlocked[r.ended] = (unlocked[r.ended] || 0) + 1;
      if (r.ok) console.log(`  PASS  ${route.name} → ${r.ended}${r.chapters && r.chapters.length ? ' (chapters ' + r.chapters.join(',') + ')' : ''}`);
      else { fail(); console.log(`  FAIL  ${route.name}: ${r.msg || 'ended ' + r.ended + ', expected ' + route.expect}${r.step != null ? ' (step ' + r.step + ')' : ''}\n        last: ${JSON.stringify(r.log)}`); }
    }
  }
  // chapters & aftermath
  const meta = await page.evaluate(() => ({ chapters: JC.story.chapters().map((c) => c.id), after: JC.story.aftermathDefs().map((c) => ({ id: c.id, outcomes: (c.outcomes || []).map((o) => o.id) })) }));
  if (meta.chapters.length) {
    console.log('\nCHAPTERS reached (runs): ' + meta.chapters.map((c) => c + ' ' + (chapters[c] || 0)).join(' · '));
    console.log('CHAPTER ENDS (chapter:why): ' + JSON.stringify(chapterEnds));
    const never = meta.chapters.filter((c) => !chapters[c]);
    if (never.length && (runs || routesMode)) console.log('  warn  chapters never reached: ' + never.join(', '));
  }
  if (meta.after.length) {
    console.log('\nAFTERMATH outcomes reached:');
    meta.after.forEach((c) => console.log('  ' + c.id + ': ' + c.outcomes.map((o) => o + ' ' + (after[c.id + ':' + o] || 0)).join(' · ')));
    const missing = [];
    meta.after.forEach((c) => c.outcomes.forEach((o) => { if (!after[c.id + ':' + o]) missing.push(c.id + ':' + o); }));
    if (missing.length && (runs || routesMode)) console.log('  never reached: ' + missing.join(', '));
  }
  if (lintMode) {
    const L = await page.evaluate(lintCollect);
    if (!lintReport(L)) fail();
  }
  const errs = await done();
  const real = errs.filter((e) => !e.includes('ERR_FAILED'));
  console.log('PAGE ERRORS:', real.length ? '\n' + real.slice(0, 20).join('\n') : 'none');
  if (real.length) fail();
  process.exitCode = failed ? 1 : 0;
})();
