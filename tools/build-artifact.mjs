// Package the app as a claude.ai page (Artifact) in build/artifact/.
// - index.html: page content without <html>/<head>/<body> (claude.ai adds those)
// - css/, js/: copied as-is
// - vendor/tesseract/: the photo reader's files, because claude.ai pages can't fetch them from a CDN at run time
// - _preview.html: the same page wrapped like claude.ai does, for local testing (not published)
// Usage: node tools/build-artifact.mjs

import { mkdirSync, rmSync, cpSync, writeFileSync, existsSync, readdirSync, statSync, copyFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'build', 'artifact');
const cache = path.join(root, 'build', '.vendor-cache');

const VENDOR = {
  'tesseract.min.js': 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js',
  'worker.min.js': 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js',
  'tesseract-core-lstm.wasm.js': 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js': 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm.js': 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/tesseract-core-relaxedsimd-lstm.wasm.js',
  'lang/eng.traineddata.gz': 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int/eng.traineddata.gz',
};

const BODY = `<div id="app" class="app">
  <main id="view" class="view" tabindex="-1"><div class="boot">Loading…</div></main>
  <nav id="tabs" class="tabs" aria-label="Main" hidden></nav>
</div>
<div id="toast" class="toast" role="status" aria-live="polite"></div>
<script type="module" src="js/main.js"></script>`;

const HEAD = `<title>Skin Ritual</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="css/app.css">
<style>
  /* claude.ai already pads the page by the top safe-area inset */
  :root { --safe-t: 0px; }
</style>`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(path.join(root, 'css'), path.join(out, 'css'), { recursive: true });
cpSync(path.join(root, 'js'), path.join(out, 'js'), { recursive: true });

for (const [name, url] of Object.entries(VENDOR)) {
  const cached = path.join(cache, name);
  if (!existsSync(cached)) {
    mkdirSync(path.dirname(cached), { recursive: true });
    console.log('downloading', name);
    execFileSync('curl', ['-sSfL', '-o', cached, url]);
  }
  const dest = path.join(out, 'vendor', 'tesseract', name);
  mkdirSync(path.dirname(dest), { recursive: true });
  // claude.ai doesn't serve .gz files, so the language data ships as base64 text.
  if (name.endsWith('.gz')) writeFileSync(dest + '.txt', readFileSync(cached).toString('base64'));
  else copyFileSync(cached, dest);
}

// Worker wrapper: answers the reader's request for eng.traineddata.gz from the base64 .txt copy.
writeFileSync(path.join(out, 'vendor', 'tesseract', 'worker-wrap.js'), `const realFetch = self.fetch.bind(self);
self.fetch = async (url, opts) => {
  const u = String(url);
  if (u.endsWith('.traineddata.gz')) {
    const res = await realFetch(u + '.txt');
    if (!res.ok) return res;
    const bin = atob((await res.text()).trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(bytes, { status: 200 });
  }
  return realFetch(url, opts);
};
importScripts('worker.min.js');
`);

writeFileSync(path.join(out, 'index.html'), HEAD + '\n' + BODY + '\n');
writeFileSync(path.join(out, '_preview.html'),
  '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>'
  + '</head><body>' + HEAD + '\n' + BODY + '\n</body></html>');

// Print the files to publish beside index.html.
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(path.relative(out, p));
  }
})(out);
const publish = files.filter((f) => f !== 'index.html' && f !== '_preview.html').sort();
writeFileSync(path.join(root, 'build', 'artifact-files.json'), JSON.stringify(publish, null, 1));
const size = publish.reduce((s, f) => s + statSync(path.join(out, f)).size, 0);
console.log(`${publish.length} files, ${(size / 1e6).toFixed(1)} MB → build/artifact`);
