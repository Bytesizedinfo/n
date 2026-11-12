// One storage API for the app. Data always lives on the device; when Firebase is configured and you
// sign in, it is merged with your cloud copy and kept in sync live across devices.

import { firebaseConfig } from '../firebase-config.js';
import { loadLocal, saveLocal, clearLocal, flushLocal } from './local.js';
import { mergeSnapshots, emptySnapshot, stampAll } from './merge.js';

const listeners = new Set();
let snap = loadLocal();
let mode = 'local';
let user = null;
let cloud = null;
let unlisten = null;
let status = 'loading';
if (!firebaseConfig && !(typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function')) status = 'not-configured';
let lastError = '';

const now = () => new Date().toISOString();

function emit(kind) {
  listeners.forEach((fn) => {
    try { fn(kind); } catch (e) { console.error(e); }
  });
}

function onWriteError(e) {
  status = 'error';
  lastError = (e && e.message) || String(e);
  emit('status');
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function storeStatus() {
  const provider = user ? user.provider : (firebaseConfig ? 'firebase' : (claudeHost() ? 'claude' : null));
  return { configured: !!firebaseConfig || provider === 'claude', provider, mode, status, user, error: lastError };
}

function claudeHost() {
  return typeof window !== 'undefined' && !!window.claude && typeof window.claude.use === 'function';
}

// Merge this device's data with the account copy, upload what's newer here, then listen for changes.
async function connect(u) {
  user = u;
  status = 'syncing';
  emit('auth');
  try {
    const remote = await cloud.loadCloud(u.uid);
    const { merged, uploads } = mergeSnapshots(snap, remote);
    snap = merged;
    saveLocal(snap);
    mode = 'cloud';
    emit('data');
    await cloud.uploadAll(u.uid, snap, uploads);
    status = 'synced';
    lastError = '';
    emit('status');
    unlisten = cloud.listen(u.uid, applyRemote);
  } catch (e) {
    console.error(e);
    onWriteError(e);
  }
}

export async function initStore() {
  if (!firebaseConfig) {
    // Opened as a claude.ai page: sync through the page's own private storage.
    if (!claudeHost()) return;
    status = 'loading';
    emit('status');
    try {
      cloud = await import('./claudedb.js');
      const u = await cloud.initClaude(onWriteError);
      if (!u) { status = 'not-configured'; cloud = null; emit('status'); return; }
      await connect(u);
    } catch (e) {
      console.error(e);
      status = 'not-configured';
      cloud = null;
      emit('status');
    }
    return;
  }
  try {
    cloud = await import('./cloud.js');
    await cloud.initCloud(firebaseConfig);
  } catch (e) {
    status = 'error';
    lastError = 'Couldn’t load sync. You can keep using the app on this device.';
    console.error(e);
    emit('status');
    return;
  }
  cloud.onAuth(async (u) => {
    if (unlisten) { unlisten(); unlisten = null; }
    if (!u) {
      user = null;
      mode = 'local';
      status = 'signed-out';
      emit('auth');
      return;
    }
    await connect({ ...u, provider: 'firebase' });
  });
}

function applyRemote(part, kind) {
  const before = JSON.stringify(snap[kind]);
  if (kind === 'history') {
    snap.history = part.history;
  } else {
    const { merged } = mergeSnapshots({ ...emptySnapshot(), [kind]: snap[kind] }, part);
    snap[kind] = merged[kind];
  }
  if (JSON.stringify(snap[kind]) === before) return;
  saveLocal(snap);
  emit('data');
}

export async function signIn() {
  if (!cloud || !cloud.signIn) throw new Error('Sync isn’t set up yet.');
  await cloud.signIn();
}

export async function signOut({ clearDevice = false } = {}) {
  if (unlisten) { unlisten(); unlisten = null; }
  if (cloud && cloud.signOutCloud) await cloud.signOutCloud();
  mode = 'local';
  user = null;
  if (clearDevice) {
    snap = emptySnapshot();
    clearLocal();
  }
  emit('data');
}

// ---------- documents ----------

export function getDoc(name) {
  const e = snap.docs[name];
  return e ? e.value : null;
}

export function setDoc(name, value) {
  const e = { value, updatedAt: now() };
  snap.docs[name] = e;
  saveLocal(snap);
  if (mode === 'cloud' && user) cloud.writeDoc(user.uid, name, e).catch(onWriteError);
}

// ---------- days (checklist, journal) ----------

export function getDay(col, date) {
  const e = snap.days[col] && snap.days[col][date];
  return e ? e.value : null;
}

export function setDay(col, date, value) {
  const e = { value, updatedAt: now() };
  (snap.days[col] = snap.days[col] || {})[date] = e;
  saveLocal(snap);
  if (mode === 'cloud' && user) cloud.writeDay(user.uid, col, date, e).catch(onWriteError);
}

export function days(col) {
  const out = {};
  for (const [d, e] of Object.entries(snap.days[col] || {})) if (e && e.value) out[d] = e.value;
  return out;
}

// ---------- history (past quiz results + routines) ----------

export function historyList() {
  return Object.entries(snap.history)
    .filter(([, e]) => e && e.value)
    .map(([, e]) => e.value)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

export function addHistory(entry) {
  const e = { value: entry, updatedAt: now() };
  snap.history[entry.id] = e;
  saveLocal(snap);
  if (mode === 'cloud' && user) cloud.writeHistory(user.uid, entry.id, e).catch(onWriteError);
}

export function removeHistory(id) {
  delete snap.history[id];
  saveLocal(snap);
  if (mode === 'cloud' && user) cloud.writeHistory(user.uid, id, null).catch(onWriteError);
}

// ---------- backup ----------

export function exportData() {
  flushLocal();
  return { app: 'skin-ritual', version: 1, exportedAt: now(), snapshot: snap };
}

export async function importData(obj) {
  if (!obj || obj.app !== 'skin-ritual' || !obj.snapshot) throw new Error('That file isn’t a Skin Ritual backup.');
  const incoming = stampAll(obj.snapshot);
  const { merged, uploads } = mergeSnapshots(incoming, snap);
  snap = merged;
  saveLocal(snap);
  flushLocal();
  if (mode === 'cloud' && user) await cloud.uploadAll(user.uid, snap, uploads);
  emit('data');
}

export async function resetAll() {
  if (mode === 'cloud' && user) {
    for (const name of Object.keys(snap.docs)) setDoc(name, null);
    for (const [col, list] of Object.entries(snap.days)) for (const d of Object.keys(list)) setDay(col, d, null);
    for (const id of Object.keys(snap.history)) removeHistory(id);
  }
  snap = emptySnapshot();
  clearLocal();
  emit('data');
}
