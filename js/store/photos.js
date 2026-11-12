// Journal photos: kept on this device only (IndexedDB), never uploaded.

const DB = 'skin-ritual-photos';
const STORE = 'photos';

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('No IndexedDB')); return; }
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const result = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(result && 'result' in result ? result.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export async function putPhoto(date, blob) {
  await tx('readwrite', (s) => s.put(blob, date));
}

export async function getPhoto(date) {
  try { return await tx('readonly', (s) => s.get(date)); } catch { return null; }
}

export async function deletePhoto(date) {
  try { await tx('readwrite', (s) => s.delete(date)); } catch { /* ignore */ }
}

export async function photoDates() {
  try { return (await tx('readonly', (s) => s.getAllKeys())) || []; } catch { return []; }
}

export async function clearPhotos() {
  try { await tx('readwrite', (s) => s.clear()); } catch { /* ignore */ }
}

// Shrink a camera photo to a small JPEG before storing it.
export async function compressImage(file, maxSide = 900, quality = 0.8) {
  const bitmap = await loadBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', quality));
}

export async function loadBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* fall back */ }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
