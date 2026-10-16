#!/usr/bin/env node
/* Story validator + automated playthroughs, run in headless Chromium against the real engine.
   node tools/storytest.js [runs=30] [--verbose]
   1) static checks over every scene / call / thread / ending
   2) N randomized playthroughs (fast-forwarding play time) → which endings are reached, which runs get stuck */
const T = require('./pw');

const runs = parseInt(process.argv[2] || '30', 10);
const verbose = process.argv.includes('--verbose');

function staticCheck() {
  const S = JC.story;
  const d = S.defs;
  const errors = [];
  const warns = [];
  const contacts = new Set(JC.contacts.all().map((c) => c.id));
  const threads = new Set(Object.keys(d.threads));
  const KNOWN = ['m', 'me', 'choice', 'fx', 'go', 'if', 'start', 'wait', 'typing', 'react', 'unsend', 'sys', 'add', 'notify', 'call', 'time', 'run', 'ending', 'endings', 'end', 'say', 'hangup', 'addMember', 'removeMember', 'rename', 'img'];
  const setFlags = new Set(['memo_heard', 'memo_sent', 'ajie_read', 'ajie_wrote', 'beat_score', 'changed_passcode', 'reported_lost', 'told_truth', 'ajie_called']);
  const usedFlags = new Map();
  const startedScenes = new Set();
  const calledCalls = new Set();
  function collectFx(fx) {
    if (!fx) return;
    if (fx.set) Object.keys(fx.set).forEach((k) => setFlags.add(k));
    if (fx.inc) Object.keys(fx.inc).forEach((k) => setFlags.add(k));
    ['sus', 'aff'].forEach((key) => { if (fx[key]) Object.keys(fx[key]).forEach((c) => { if (!contacts.has(c)) errors.push(`fx.${key} unknown contact ${c}`); }); });
  }
  function checkGraph(kind, id, def) {
    const nodes = def.nodes || {};
    if (!nodes.start) errors.push(`${kind} ${id}: no start node`);
    const reach = new Set();
    const queue = ['start'];
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
        }
        collectFx(st.fx);
        if (st.start) { startedScenes.add(st.start); if (!d.scenes[st.start]) errors.push(`${where}: start unknown scene ${st.start}`); }
        if (st.call) { calledCalls.add(st.call); if (!d.calls[st.call]) errors.push(`${where}: unknown call ${st.call}`); }
        if (st.ending && !d.endings[st.ending]) errors.push(`${where}: unknown ending ${st.ending}`);
        if (Array.isArray(st.endings)) st.endings.forEach((e) => { if (!d.endings[e]) errors.push(`${where}: unknown ending ${e}`); });
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
    const t = sc.trigger;
    if (!t) warns.push(`scene ${id}: no trigger`);
    else if (t.on === 'scene' && !d.scenes[t.scene]) errors.push(`scene ${id}: trigger scene ${t.scene} unknown`);
    else if (t.on === 'flag') usedFlags.set(t.flag, id);
  });
  Object.entries(d.calls).forEach(([id, c]) => { if (!id.startsWith('_dial_')) checkGraph('call', id, c); if (c.from && !contacts.has(c.from)) errors.push(`call ${id}: unknown from ${c.from}`); });
  d.dial.forEach((x) => { if (!d.calls[x.callId]) errors.push(`dialScript ${x.cid}: unknown call ${x.callId}`); });
  d.susHooks.forEach((x) => { if (!d.scenes[x.sceneId]) errors.push(`onSuspicion ${x.cid}: unknown scene ${x.sceneId}`); });
  d.totalHooks.forEach((x) => { if (!d.scenes[x.sceneId]) errors.push(`onTotalSuspicion: unknown scene ${x.sceneId}`); });
  usedFlags.forEach((sid, f) => { if (!setFlags.has(f)) warns.push(`scene ${sid}: trigger flag "${f}" is never set by a static fx`); });
  Object.entries(d.scenes).forEach(([id, sc]) => {
    if (sc.trigger && sc.trigger.on === 'manual' && !startedScenes.has(id) && !d.susHooks.some((x) => x.sceneId === id) && !d.totalHooks.some((x) => x.sceneId === id) && !id.startsWith('confess_')) warns.push(`scene ${id}: manual trigger but never started`);
  });
  // threads
  Object.entries(d.threads).forEach(([id, t]) => {
    let last = 0;
    (t.history || []).forEach((row, i) => {
      if (!Array.isArray(row)) return;
      const [time, from, , extra] = row;
      const ms = JC.time.parse(time);
      if (ms < last) errors.push(`thread ${id}[${i}]: not chronological (${time})`);
      last = ms;
      if (ms > JC.time.START) errors.push(`thread ${id}[${i}]: after 23:47 (${time})`);
      if (from !== 'me' && from !== 'sys' && !contacts.has(from)) errors.push(`thread ${id}[${i}]: unknown from ${from}`);
      if (from !== 'me' && from !== 'sys' && t.members && !t.members.includes(from) && !(extra && extra.sys)) warns.push(`thread ${id}[${i}]: ${from} not a member`);
      if (extra && extra.img && !JC.art.has(extra.img)) warns.push(`thread ${id}[${i}]: art ${extra.img} not drawn yet`);
    });
  });
  const ends = Object.values(d.endings);
  if (ends.length !== 13) errors.push(`expected 13 endings, found ${ends.length}`);
  ends.forEach((e) => {
    if (!e.title || !e.text || !e.text.length) errors.push(`ending ${e.id}: missing title/text`);
    if (!e.jc || !e.jc.length) warns.push(`ending ${e.id}: no jc epilogue`);
    if (!e.hint) warns.push(`ending ${e.id}: no hint`);
    if (!JC.art.has(e.art || 'end_' + e.id)) warns.push(`ending ${e.id}: art not drawn yet`);
  });
  const msgCount = Object.values(d.threads).reduce((a, t) => a + (t.history || []).length, 0);
  let choiceCount = 0;
  Object.values(d.scenes).concat(Object.values(d.calls)).forEach((sc) => Object.values(sc.nodes || {}).forEach((arr) => arr.forEach((st) => { if (st.choice) choiceCount++; })));
  return { errors, warns, stats: { threads: threads.size, messages: msgCount, scenes: Object.keys(d.scenes).length, calls: Object.keys(d.calls).filter((k) => !k.startsWith('_')).length, choices: choiceCount, endings: ends.length } };
}

async function playthrough(page, seed, strategy) {
  return page.evaluate(async ({ seed, strategy }) => {
    let s = seed;
    const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const pick = (n) => Math.floor(rnd() * n);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    // reset and skip intro
    JC.story.restart();
    await sleep(100);
    const sk = document.querySelector('.pro-skip');
    if (sk) sk.click();
    await sleep(1000);
    JC.state.setting('speed', 40);
    JC.state.setting('faceAlt', true);
    JC.state.d.unlocked = true;
    JC.os.unlockThen(() => {});
    await sleep(900);
    const log = [];
    const did = {};
    for (let it = 0; it < 900; it++) {
      const st = JC.state.d;
      if (st.ended) return { ending: st.ended, it, log: log.slice(-12), flags: st.flags, sus: st.sus, aff: st.aff };
      // occasional optional actions that open branches
      if (strategy !== 'minimal' && !did.memo && it > 30 && rnd() < 0.02) { did.memo = 1; JC.story.act('memo_play', { id: 'memo14' }); log.push('memo_play'); if (rnd() < 0.6) { JC.story.send(JC.story.threadFor('wwx'), { memo: 'memo14' }); log.push('memo_share'); } }
      if (strategy !== 'minimal' && !did.ajie && rnd() < 0.01) { did.ajie = 1; JC.story.act('open_thread', { thread: 'ajie' }); log.push('open ajie'); }
      if (strategy === 'chaos' && !did.game && rnd() < 0.01) { did.game = 1; JC.story.act('game_score', { score: 2000 }); log.push('game 2000'); }
      if (strategy === 'chaos' && rnd() < 0.004) { JC.story.send(JC.story.threadFor(['jl', 'wwx', 'nhs', 'lxc'][pick(4)]), { text: 'hello' }); log.push('free text'); }
      // calls
      const c = JC.story.call();
      if (c && c.phase === 'ringing' && c.dir === 'in') { if (strategy === 'decline' && rnd() < 0.7) { JC.story.decline(); log.push('decline ' + c.cid); } else { JC.story.answer(); log.push('answer ' + c.cid); } }
      if (c && c.pend) { const i = pick(c.pend.options.length); log.push('call ' + c.cid + ': ' + c.pend.options[i].label); JC.story.callChoose(i); }
      // pending choices
      for (const t of JC.story.threads()) {
        const p = JC.story.pending(t.id);
        if (p && p.options.length) {
          let i = pick(p.options.length);
          if (strategy === 'first') i = 0;
          if (strategy === 'last') i = p.options.length - 1;
          log.push(t.id + ': ' + p.options[i].label);
          JC.story.choose(t.id, i);
          break;
        }
      }
      // fast-forward play time
      if (!JC.time.frozen) st.eng += 4000;
      await sleep(25);
    }
    const st = JC.state.d;
    return { ending: null, stuck: true, log: log.slice(-15), runs: st.runs.map((r) => r.sc + '.' + r.node + '[' + r.i + ']' + (r.wait ? ' wait:' + r.wait : '')), done: Object.keys(st.done), flags: st.flags };
  }, { seed, strategy });
}

(async () => {
  const { page, done } = await T.open({});
  await T.skipIntro(page);
  const res = await page.evaluate(staticCheck);
  console.log('STATS', JSON.stringify(res.stats));
  console.log(`STATIC: ${res.errors.length} errors, ${res.warns.length} warnings`);
  res.errors.forEach((e) => console.log('  ERROR ' + e));
  (verbose ? res.warns : res.warns.slice(0, 25)).forEach((w) => console.log('  warn  ' + w));
  if (!verbose && res.warns.length > 25) console.log(`  … ${res.warns.length - 25} more warnings (--verbose)`);
  const tally = {};
  const strategies = ['random', 'first', 'last', 'chaos', 'decline', 'minimal'];
  for (let k = 0; k < runs; k++) {
    const strategy = strategies[k % strategies.length];
    const r = await playthrough(page, 1000 + k * 7919, strategy);
    const key = r.ending || 'STUCK';
    tally[key] = (tally[key] || 0) + 1;
    if (!r.ending || verbose) console.log(`run ${k} [${strategy}] → ${key}${r.stuck ? '\n   runs: ' + JSON.stringify(r.runs) + '\n   last: ' + JSON.stringify(r.log) : ''}`);
  }
  console.log('ENDINGS', JSON.stringify(tally));
  const errs = await done();
  const real = errs.filter((e) => !e.includes('ERR_FAILED'));
  console.log('PAGE ERRORS:', real.length ? '\n' + real.slice(0, 20).join('\n') : 'none');
})();
