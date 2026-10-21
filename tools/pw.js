/* Playwright helpers for driving the phone in headless Chromium.
   Usage (node): const T = require('./tools/pw'); const { page, done } = await T.open({ mobile: false }); ... await done(); */
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(__dirname, '..');

async function open(o = {}) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const viewport = o.mobile ? { width: 390, height: 844 } : (o.viewport || { width: 1440, height: 940 });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.mobile, colorScheme: o.dark ? 'dark' : 'light' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack || e.message)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  // block remote fonts quickly (no network in CI) so tests don't hang
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const file = o.file || (o.bundle ? 'dist/standalone.html' : 'index.html');
  if (o.fresh !== false) {
    await page.addInitScript(() => { try { if (!sessionStorage.getItem('__kept')) { localStorage.clear(); sessionStorage.setItem('__kept', '1'); } } catch (e) {} });
  }
  await page.goto('file://' + path.join(ROOT, file) + (o.hash || ''));
  await page.waitForFunction(() => window.JC && JC.os && JC.os.ready, null, { timeout: 15000 });
  const done = async () => { await browser.close(); return errors; };
  return { browser, ctx, page, errors, done };
}

/** skip the prologue and unlock with the passcode */
async function skipIntro(page) {
  await page.evaluate(() => { const s = document.querySelector('.pro-skip'); if (s) s.click(); });
  await page.waitForTimeout(1200);
}
async function unlock(page) {
  await page.evaluate(() => JC.os.unlockThen(() => {}));
  await page.waitForTimeout(1300);
  const code = await page.evaluate(() => String((JC.state.d.settings && JC.state.d.settings.passcode) || JC.world.passcode.code));
  for (const d of code) {
    await page.evaluate((d) => {
      const keys = Array.from(document.querySelectorAll('.passcode .pc-key'));
      const k = keys.find((x) => x.querySelector('.pc-num') && x.querySelector('.pc-num').textContent === d);
      if (k) k.click();
    }, d);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1000);
}
async function shot(page, name, o = {}) {
  const dir = o.dir || process.env.SHOTS || path.join(ROOT, '..', 'shots');
  require('fs').mkdirSync(dir, { recursive: true });
  const file = path.join(dir, name + '.png');
  if (o.full) await page.screenshot({ path: file });
  else {
    const el = await page.$('#device');
    await el.screenshot({ path: file });
  }
  return file;
}

module.exports = { open, skipIntro, unlock, shot, ROOT };
