// End-to-end smoke test in a phone-sized Chromium.
// Usage: node tests/smoke.mjs            (OCR=1 also tests reading a photographed label; needs internet)
// ARTIFACT=1 tests the claude.ai package from build/artifact (run tools/build-artifact.mjs first),
// with a stand-in window.claude so the claude.ai-only code paths run.
// Screenshots go to ./shots (or $SHOTS).

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.env.SHOTS || path.join(root, 'shots');
mkdirSync(SHOTS, { recursive: true });
const PORT = 8000 + Math.floor(Math.random() * 900);
const ARTIFACT = !!process.env.ARTIFACT;
const SERVE_DIR = ARTIFACT ? path.join(root, 'build', 'artifact') : root;
const BASE = `http://127.0.0.1:${PORT}/` + (ARTIFACT ? '_preview.html' : '');

const ANSWERS = {
  skinType: 'oily', dehydrated: 'sometimes', age: '20s', concerns: ['acne', 'pores', 'pigment'], topConcern: 'acne',
  acneType: ['comedonal', 'inflamed'], acneSeverity: 'some', pigmentType: ['pih'], sensitivity: '1', barrier: 'ok',
  triggers: ['none'], pregnancy: 'none', rx: ['none'], conditions: ['none'], climate: 'tropical', environment: ['aircon'],
  makeup: 'light', spfHabit: 'daily', currentActives: ['niacinamide'], retinoidExp: 'never', steps: 'moderate', pace: 'balanced',
  budget: 'budget', texture: 'light', prefs: ['ff'],
};

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: SERVE_DIR, stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const errors = [];
let step = 'start';
const log = (s) => { step = s; console.log('•', s); };

async function shot(page, name) {
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
}

async function answerQuiz(page) {
  for (let guard = 0; guard < 60; guard++) {
    await page.waitForTimeout(250);
    if (page.url().includes('#routine')) return;
    const h = page.locator('h1[data-q]');
    if (!(await h.count())) { await page.waitForTimeout(400); continue; }
    const qid = await h.getAttribute('data-q');
    const want = ANSWERS[qid];
    const isMulti = (await page.locator('.opt.multi').count()) > 0;
    const isText = (await page.locator('#qtext').count()) > 0;
    if (isText) { await page.click('[data-next]'); continue; }
    if (isMulti) {
      const values = Array.isArray(want) ? want : [];
      for (const v of values) {
        const opt = page.locator(`.opt[data-v="${v}"]`);
        if ((await opt.getAttribute('aria-checked')) !== 'true') await opt.click();
      }
      if (!values.length && (await page.locator('[data-skip]').count())) await page.click('[data-skip]');
      else await page.click('[data-next]');
      continue;
    }
    const opt = page.locator(`.opt[data-v="${want}"]`);
    if ((await opt.getAttribute('aria-checked')) === 'true') await page.click('[data-next]');
    else await opt.click();
    await page.waitForTimeout(250);
  }
  throw new Error('quiz did not finish');
}

let browser = null;
try {
  await sleep(700);
  browser = await chromium.launch();
  const context = await browser.newContext({ ...devices['iPhone 13'], acceptDownloads: true });
  // Stand-in for claude.ai: capabilities resolve null, as they do when a view can't run them.
  if (ARTIFACT) await context.addInitScript(() => { window.claude = { use: async () => null }; });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${step}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${step}] ${e.message}`));

  log('welcome');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await shot(page, '01-welcome');
  await page.click('[data-start]');

  log('quiz');
  await page.waitForSelector('h1[data-q]');
  await shot(page, '02-quiz');
  await answerQuiz(page);

  log('routine');
  await page.waitForSelector('text=Your routine is ready');
  await shot(page, '03-routine-am');
  const amSteps = await page.locator('details.step-card').count();
  assert.ok(amSteps >= 3, 'morning steps shown');
  await page.click('[data-tab="pm"]');
  await page.waitForSelector('[data-tab="pm"][aria-selected="true"]');
  assert.ok(await page.locator('text=Adapalene').count(), 'night routine has a retinoid');
  await page.locator('details.step-card summary').first().click();
  await shot(page, '04-routine-pm');
  await page.click('[data-tab="weekly"]');
  await page.waitForSelector('.week-list');
  await shot(page, '05-routine-week');
  await page.click('[data-tab="ramp"]');
  await page.waitForSelector('text=you are here');
  await shot(page, '06-routine-ramp');
  await page.click('[data-tab="notes"]');
  await shot(page, '07-routine-notes');

  log('calendar');
  await page.click('[data-ics]');
  await page.waitForSelector('.sheet a[href^="https://calendar.google.com/"]');
  assert.ok((await page.locator('.sheet a[href*="RRULE%3AFREQ%3DDAILY"]').count()) === 2, 'two daily Google Calendar links');
  const [ics] = await Promise.all([page.waitForEvent('download'), page.click('.sheet [data-file]')]);
  const icsText = readFileSync(await ics.path(), 'latin1');
  if (ARTIFACT) assert.ok(icsText.startsWith('PK') && ics.suggestedFilename().endsWith('.zip'), 'calendar file is zipped on claude.ai');
  assert.ok(icsText.includes('BEGIN:VCALENDAR') && icsText.includes('RRULE:FREQ=DAILY'));
  await page.click('.sheet [data-close]');
  await page.waitForTimeout(300);

  log('today');
  await page.click('a.tab[href="#today"]');
  await page.waitForSelector('.checklist');
  const rows = page.locator('.check-row');
  const n = await rows.count();
  for (let i = 0; i < n; i++) await rows.nth(i).click();
  await page.waitForSelector('text=routine done');
  await shot(page, '08-today');
  await page.locator('[data-info]').first().click();
  await page.waitForSelector('.sheet.show');
  await shot(page, '09-step-sheet');
  await page.click('.sheet [data-close]');
  await page.waitForTimeout(300);

  log('shelf: catalogue');
  await page.click('a.tab[href="#shelf"]');
  await page.click('[data-add]');
  await page.waitForSelector('#q');
  for (const term of ['Retinol 0.5%', 'BHA Liquid Exfoliant', 'Benzac', 'Foaming Cleanser']) {
    await page.fill('#q', term);
    await page.locator('.cat-item:not([disabled])').first().click();
    await page.waitForTimeout(150);
  }
  await shot(page, '10-shelf-add');

  log('shelf: paste');
  await page.click('[data-mode="paste"]');
  await page.fill('#pn', 'Vitamin C Glow Serum');
  await page.fill('#pt', 'Aqua, Ascorbic Acid, Propylene Glycol, Ferulic Acid, Tocopherol, Parfum, Limonene');
  await page.click('#check');
  await page.waitForSelector('#addIt');
  assert.ok(await page.locator('.sheet >> text=Vitamin C (L-ascorbic acid)').count(), 'paste detected vitamin C');
  await shot(page, '11-shelf-paste');
  await page.click('#addIt');
  await page.waitForTimeout(400);

  log('shelf: tick');
  await page.click('[data-add]');
  await page.click('[data-mode="tick"]');
  await page.fill('#tn', 'Gel moisturiser');
  await page.selectOption('#tc', 'moisturizer');
  await page.check('.tick input[value="ha"]');
  await page.check('.tick input[value="ceramides"]');
  await page.click('#addT');
  await page.waitForTimeout(400);
  assert.ok(await page.locator('text=Use at different times').count(), 'clash flagged');
  await shot(page, '12-shelf');

  if (process.env.OCR) {
    log('shelf: photo (OCR)');
    const label = await browser.newPage({ viewport: { width: 900, height: 360 } });
    await label.setContent('<body style="margin:0;background:#fff"><p style="font:28px/1.5 Arial;padding:24px;color:#111">INGREDIENTS: Water, Glycerin, Niacinamide, Salicylic Acid, Sodium Hyaluronate, Butylene Glycol, Panthenol, Phenoxyethanol</p></body>');
    const labelPath = path.join(SHOTS, 'label.png');
    await label.screenshot({ path: labelPath });
    await label.close();
    await page.click('[data-add]');
    await page.click('[data-mode="photo"]');
    await page.setInputFiles('#ph', labelPath);
    await page.waitForSelector('#pt', { timeout: 120000 });
    const text = await page.inputValue('#pt');
    console.log('  OCR read:', text.replace(/\s+/g, ' ').slice(0, 120));
    await page.fill('#pn', 'Photo test serum');
    await page.click('#check');
    await page.waitForSelector('#addIt');
    for (const name of ['Niacinamide', 'Salicylic acid (BHA)', 'Hyaluronic acid']) {
      assert.ok(await page.locator(`.sheet .chip:has-text("${name}")`).count(), `OCR found ${name}`);
    }
    await shot(page, '12b-ocr');
    await page.click('.sheet [data-close]');
    await page.waitForTimeout(300);
  }

  log('build from shelf');
  await page.click('[data-build]');
  await page.click('.sheet [data-yes]');
  await page.waitForSelector('text=Built from your shelf');
  await page.waitForTimeout(400);
  assert.ok(await page.locator('text=Missing from your shelf').count(), 'gap shown (no sunscreen)');
  await shot(page, '13-shelf-routine');

  log('journal');
  await page.click('a.tab[href="#journal"]');
  await page.click('[data-feel="4"]');
  await page.click('[data-rate="breakouts"][data-n="2"]');
  await page.click('[data-rate="redness"][data-n="1"]');
  await page.click('[data-tag="poor sleep"]');
  await page.fill('#note', 'Started the new BHA.');
  await page.setInputFiles('#photo', path.join(root, 'icons/icon-512.png'));
  await page.waitForSelector('#photoBox img');
  await page.click('[data-day="-1"]');
  await page.click('[data-rate="breakouts"][data-n="3"]');
  await page.click('[data-rate="redness"][data-n="2"]');
  await page.click('[data-day="1"]');
  await page.waitForSelector('#chart svg');
  await page.locator('#chart svg').hover({ position: { x: 300, y: 60 } });
  await page.waitForTimeout(200);
  await shot(page, '14-journal');

  log('reload keeps data');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#note');
  assert.equal(await page.inputValue('#note'), 'Started the new BHA.');
  await page.click('a.tab[href="#shelf"]');
  await page.waitForSelector('text=Vitamin C Glow Serum');

  log('more + compare');
  await page.click('a.tab[href="#more"]');
  await page.waitForSelector(ARTIFACT ? 'text=Saved on this device' : 'text=Sync is off');
  await shot(page, '15-more');
  await page.locator('a[href^="#compare"]').first().click();
  await page.waitForSelector('text=Compare routines');
  await shot(page, '16-compare');

  log('dark mode');
  await page.click('a.tab[href="#more"]');
  await page.click('[data-theme="dark"]');
  await page.click('a.tab[href="#today"]');
  await shot(page, '17-today-dark');
  await page.click('a.tab[href="#routine"]');
  await shot(page, '18-routine-dark');
  await page.click('a.tab[href="#journal"]');
  await page.waitForSelector('#chart svg');
  await shot(page, '19-journal-dark');

  log('narrow phone');
  await page.setViewportSize({ width: 320, height: 640 });
  await page.click('a.tab[href="#routine"]');
  await page.click('[data-tab="weekly"]');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `no sideways scroll at 320px (overflow ${overflow}px)`);
  await shot(page, '20-week-320');

  log('export backup');
  await page.click('a.tab[href="#more"]');
  const [backup] = await Promise.all([page.waitForEvent('download'), page.click('[data-export]')]);
  const data = JSON.parse(readFileSync(await backup.path(), 'utf8'));
  assert.equal(data.app, 'skin-ritual');
  assert.ok(data.snapshot.docs.routine && data.snapshot.docs.shelf);

  await browser.close();
  browser = null;
  if (errors.length) {
    console.error('\nConsole errors:\n' + errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('\nSmoke test passed. Screenshots in', SHOTS);
  }
} catch (e) {
  console.error(`\nFailed at step "${step}":`, e.message);
  if (errors.length) console.error('Console errors:\n' + errors.join('\n'));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.kill();
}
