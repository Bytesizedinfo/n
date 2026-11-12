// Read an ingredients label from a photo, on the device (Tesseract.js, loaded only when needed).

import { loadBitmap } from './store/photos.js';

const CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
// On claude.ai the page can't fetch from CDNs at run time, so the reader's files are published with it.
const LOCAL = 'vendor/tesseract/';
const useLocal = () => typeof window !== 'undefined' && !!window.claude;
const abs = (p) => new URL(p, location.href).href;
let loading = null;

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = useLocal() ? LOCAL + 'tesseract.min.js' : CDN;
      s.async = true;
      s.onload = () => resolve(window.Tesseract);
      s.onerror = () => { loading = null; reject(new Error('Couldn’t load the text reader. Check your connection and try again.')); };
      document.head.append(s);
    });
  }
  return loading;
}

// Grayscale, stretch contrast and scale so small label text is readable.
async function prepare(file) {
  const bmp = await loadBitmap(file);
  const long = Math.max(bmp.width, bmp.height);
  const scale = Math.min(2, 2200 / long);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  let min = 255;
  let max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = y;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < d.length; i += 4) {
    const v = ((d[i] - min) / range) * 255;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export async function readLabel(file, onProgress = () => {}) {
  onProgress(0, 'Loading the text reader…');
  const T = await loadTesseract();
  const canvas = await prepare(file);
  // worker-wrap.js (made by tools/build-artifact.mjs) serves the language data from a base64 .txt file.
  const local = useLocal() ? { workerPath: abs(LOCAL + 'worker-wrap.js'), corePath: abs(LOCAL), langPath: abs(LOCAL + 'lang'), workerBlobURL: false } : {};
  const worker = await T.createWorker('eng', 1, {
    ...local,
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress(m.progress, 'Reading the label…');
      else onProgress(null, 'Getting ready…');
    },
  });
  try {
    const { data } = await worker.recognize(canvas);
    return (data && data.text) || '';
  } finally {
    await worker.terminate();
  }
}
