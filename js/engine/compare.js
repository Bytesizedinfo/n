// Compare two saved routines (and the answers behind them).

import { QUESTIONS, optionsFor } from '../data/questions.js';
import { freqLabel } from './scheduler.js';

function identity(s) {
  if (s.base) return s.key;
  return s.kind + ':' + (s.primary || s.title);
}

export function compareRoutines(before, after) {
  const a = new Map((before.steps || []).filter((s) => s.slot !== 'asneeded').map((s) => [identity(s), s]));
  const b = new Map((after.steps || []).filter((s) => s.slot !== 'asneeded').map((s) => [identity(s), s]));
  const added = [];
  const removed = [];
  const changed = [];
  const same = [];
  for (const [id, s] of b) {
    if (!a.has(id)) { added.push(s); continue; }
    const old = a.get(id);
    const changes = [];
    if (old.title !== s.title) changes.push(`“${old.title}” → “${s.title}”`);
    const os = old.routineSlot || old.slot;
    const ns = s.routineSlot || s.slot;
    if (os !== ns) changes.push(`moved from ${os === 'am' ? 'morning' : 'night'} to ${ns === 'am' ? 'morning' : 'night'}`);
    if ((old.freq || 0) !== (s.freq || 0) && !s.base) changes.push(`${freqLabel(old.freq, os)} → ${freqLabel(s.freq, ns)}`);
    if (changes.length) changed.push({ before: old, after: s, changes });
    else same.push(s);
  }
  for (const [id, s] of a) if (!b.has(id)) removed.push(s);
  return { added, removed, changed, same };
}

function answerText(q, value, answers) {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) return '—';
  if (q.type === 'text') return value;
  const opts = optionsFor(q, answers) || [];
  const label = (v) => (opts.find((o) => o.value === v) || { label: v }).label;
  return Array.isArray(value) ? value.map(label).join(', ') : label(value);
}

export function compareAnswers(before = {}, after = {}) {
  const out = [];
  for (const q of QUESTIONS) {
    const x = before[q.id];
    const y = after[q.id];
    if (JSON.stringify(x ?? null) === JSON.stringify(y ?? null)) continue;
    out.push({ id: q.id, title: q.title, before: answerText(q, x, before), after: answerText(q, y, after) });
  }
  return out;
}
