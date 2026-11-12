// Device storage (localStorage). Also used as an instant cache in cloud mode.

import { emptySnapshot } from './merge.js';

const KEY = 'skin-ritual:v1';

function safeGet() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}
function safeSet(v) {
  try { localStorage.setItem(KEY, v); return true; } catch { return false; }
}

export function loadLocal() {
  const raw = safeGet();
  if (!raw) return emptySnapshot();
  try {
    const s = JSON.parse(raw);
    const base = emptySnapshot();
    return { docs: s.docs || {}, days: { ...base.days, ...(s.days || {}) }, history: s.history || {} };
  } catch {
    return emptySnapshot();
  }
}

let timer = null;
let pending = null;
// Writes are batched so ticking several steps quickly costs one write.
export function saveLocal(snapshot) {
  pending = snapshot;
  if (timer) return;
  timer = setTimeout(flushLocal, 150);
}

export function flushLocal() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!pending) return;
  safeSet(JSON.stringify(pending));
  pending = null;
}

export function clearLocal() {
  pending = null;
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushLocal);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushLocal(); });
}
