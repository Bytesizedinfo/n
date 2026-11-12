// Sync through the page's own storage when the app is opened as a claude.ai page.
// Each person's data lives under their private data/users/<id> collection, which only they can read.
// Same function shapes as cloud.js, so store/index.js can use either.

let col = null;
let onError = () => {};
const queues = new Map();

export async function initClaude(errorHandler) {
  if (typeof window === 'undefined' || !window.claude || typeof window.claude.use !== 'function') return null;
  onError = errorHandler || onError;
  const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
  if (!db || !user) return null;
  const id = await user.id();
  if (!id) return null;
  let name = '';
  try { name = (await user.name()) || ''; } catch { /* optional */ }
  col = db.collection('data/users/' + id);
  return { uid: id, name, email: '', photo: '', provider: 'claude' };
}

const keyDoc = (name) => 'doc-' + name;
const keyDay = (c, date) => 'day-' + c + '-' + date;
const keyHist = (id) => 'hist-' + id;
const enc = (meta, entry) => ({ ...meta, json: JSON.stringify(entry.value === undefined ? null : entry.value), updatedAt: entry.updatedAt });

function snapFrom(docs) {
  const s = { docs: {}, days: { checklist: {}, journal: {} }, history: {} };
  for (const d of docs) {
    const b = d.data();
    if (!b || typeof b.json !== 'string') continue;
    let value;
    try { value = JSON.parse(b.json); } catch { continue; }
    const e = { value, updatedAt: b.updatedAt || '' };
    if (b.kind === 'doc') s.docs[b.name] = e;
    else if (b.kind === 'day') (s.days[b.col] = s.days[b.col] || {})[b.date] = e;
    else if (b.kind === 'hist') s.history[b.id] = e;
  }
  return s;
}

// One write at a time per document; a burst collapses into the latest value.
function write(key, body) {
  let q = queues.get(key);
  if (!q) { q = { busy: false, next: undefined }; queues.set(key, q); }
  q.next = body;
  if (!q.busy) pump(key, q);
}

async function pump(key, q) {
  q.busy = true;
  while (q.next !== undefined) {
    const body = q.next;
    q.next = undefined;
    try {
      if (body === null) await col.doc(key).delete();
      else await col.doc(key).set(body);
    } catch (e) {
      if (e && e.code === 'unavailable') {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 800));
        if (q.next === undefined) q.next = body;
      } else {
        onError(new Error(e && e.code === 'quota_exceeded' ? 'Your saved data is full. Delete some old journal entries or history.' : 'Couldn’t save to your Claude account. Changes are kept on this device.'));
      }
    }
  }
  q.busy = false;
}

export async function loadCloud() {
  const snap = await col.get();
  return snapFrom(snap.docs);
}

export async function writeDoc(_uid, name, entry) { write(keyDoc(name), enc({ kind: 'doc', name }, entry)); }
export async function writeDay(_uid, c, date, entry) { write(keyDay(c, date), enc({ kind: 'day', col: c, date }, entry)); }
export async function writeHistory(_uid, id, entry) { write(keyHist(id), entry ? enc({ kind: 'hist', id }, entry) : null); }

export async function uploadAll(_uid, snapshot, uploads) {
  for (const n of uploads.docs) writeDoc(null, n, snapshot.docs[n]);
  for (const [c, date] of uploads.days) writeDay(null, c, date, snapshot.days[c][date]);
  for (const id of uploads.history) writeHistory(null, id, snapshot.history[id]);
}

// Live updates from your other devices.
export function listen(_uid, onChange) {
  let last = '';
  const unsub = col.onSnapshot((snap) => {
    if (snap.metadata.hasPendingWrites || snap.metadata.fromCache) return;
    const s = snapFrom(snap.docs);
    const sig = JSON.stringify(s);
    if (sig === last) return;
    last = sig;
    onChange({ docs: s.docs, days: {}, history: {} }, 'docs');
    onChange({ docs: {}, days: s.days, history: {} }, 'days');
    onChange({ docs: {}, days: {}, history: s.history }, 'history');
  }, () => onError(new Error('Live sync stopped. Reload the page to reconnect.')));
  return unsub;
}
