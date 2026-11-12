// Firestore sync (loaded only when js/firebase-config.js has a config).
// Values are stored as JSON strings so any shape (nested arrays, undefined) round-trips safely.

const V = '13.1.0';
const BASE = `https://www.gstatic.com/firebasejs/${V}`;

let fb = null; // { app, auth, db, mod: { ...functions } }

export async function initCloud(config) {
  if (fb) return fb;
  const [appMod, authMod, fsMod] = await Promise.all([
    import(`${BASE}/firebase-app.js`),
    import(`${BASE}/firebase-auth.js`),
    import(`${BASE}/firebase-firestore.js`),
  ]);
  const app = appMod.initializeApp(config);
  const auth = authMod.getAuth(app);
  let db;
  try {
    db = fsMod.initializeFirestore(app, { localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() }) });
  } catch {
    db = fsMod.getFirestore(app);
  }
  fb = { app, auth, db, a: authMod, f: fsMod };
  authMod.getRedirectResult(auth).catch(() => {});
  return fb;
}

export function onAuth(cb) {
  return fb.a.onAuthStateChanged(fb.auth, (u) => cb(u ? { uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || '' } : null));
}

export async function signIn() {
  const provider = new fb.a.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await fb.a.signInWithPopup(fb.auth, provider);
  } catch (e) {
    const code = e && e.code;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment' || code === 'auth/web-storage-unsupported') {
      await fb.a.signInWithRedirect(fb.auth, provider);
      return;
    }
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
    throw e;
  }
}

export async function signOutCloud() {
  await fb.a.signOut(fb.auth);
}

const enc = (value, updatedAt) => ({ json: JSON.stringify(value === undefined ? null : value), updatedAt });
const dec = (x) => {
  try { return { value: JSON.parse(x.json), updatedAt: x.updatedAt || '' }; } catch { return null; }
};

function refs(uid) {
  const { doc, collection } = fb.f;
  return {
    user: doc(fb.db, 'users', uid),
    days: collection(fb.db, 'users', uid, 'days'),
    day: (col, date) => doc(fb.db, 'users', uid, 'days', `${col}_${date}`),
    history: collection(fb.db, 'users', uid, 'history'),
    hist: (id) => doc(fb.db, 'users', uid, 'history', id),
  };
}

function snapFrom(userData, daysDocs, histDocs) {
  const s = { docs: {}, days: { checklist: {}, journal: {} }, history: {} };
  for (const [name, raw] of Object.entries(userData || {})) {
    if (raw && typeof raw === 'object' && 'json' in raw) {
      const v = dec(raw);
      if (v) s.docs[name] = v;
    }
  }
  for (const d of daysDocs) {
    const data = d.data();
    const v = dec(data);
    if (!v || !data.col || !data.date) continue;
    (s.days[data.col] = s.days[data.col] || {})[data.date] = v;
  }
  for (const d of histDocs) {
    const v = dec(d.data());
    if (v) s.history[d.id] = v;
  }
  return s;
}

export async function loadCloud(uid) {
  const r = refs(uid);
  const { getDoc, getDocs } = fb.f;
  const [u, days, hist] = await Promise.all([getDoc(r.user), getDocs(r.days), getDocs(r.history)]);
  return snapFrom(u.exists() ? u.data() : {}, days.docs, hist.docs);
}

export async function writeDoc(uid, name, entry) {
  await fb.f.setDoc(refs(uid).user, { [name]: enc(entry.value, entry.updatedAt) }, { merge: true });
}

export async function writeDay(uid, col, date, entry) {
  await fb.f.setDoc(refs(uid).day(col, date), { col, date, ...enc(entry.value, entry.updatedAt) });
}

export async function writeHistory(uid, id, entry) {
  if (!entry) return fb.f.deleteDoc(refs(uid).hist(id));
  return fb.f.setDoc(refs(uid).hist(id), enc(entry.value, entry.updatedAt));
}

export async function uploadAll(uid, snapshot, uploads) {
  const { writeBatch } = fb.f;
  const r = refs(uid);
  const ops = [];
  if (uploads.docs.length) {
    const data = {};
    for (const n of uploads.docs) data[n] = enc(snapshot.docs[n].value, snapshot.docs[n].updatedAt);
    ops.push((b) => b.set(r.user, data, { merge: true }));
  }
  for (const [col, date] of uploads.days) {
    const e = snapshot.days[col][date];
    ops.push((b) => b.set(r.day(col, date), { col, date, ...enc(e.value, e.updatedAt) }));
  }
  for (const id of uploads.history) {
    const e = snapshot.history[id];
    ops.push((b) => b.set(r.hist(id), enc(e.value, e.updatedAt)));
  }
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(fb.db);
    ops.slice(i, i + 400).forEach((op) => op(batch));
    await batch.commit();
  }
}

// Live updates from other devices.
export function listen(uid, onChange) {
  const r = refs(uid);
  const { onSnapshot } = fb.f;
  const unsubs = [];
  unsubs.push(onSnapshot(r.user, (snap) => {
    if (snap.metadata.hasPendingWrites || !snap.exists()) return;
    onChange(snapFrom(snap.data(), [], []), 'docs');
  }));
  unsubs.push(onSnapshot(r.days, (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    onChange(snapFrom({}, snap.docs, []), 'days');
  }));
  unsubs.push(onSnapshot(r.history, (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    onChange(snapFrom({}, [], snap.docs), 'history');
  }));
  return () => unsubs.forEach((u) => u());
}
