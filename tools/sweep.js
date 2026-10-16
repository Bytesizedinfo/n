#!/usr/bin/env node
/* Click-sweep: opens every app and clicks visible controls at random (real mouse clicks), recording
   - page errors, - tappable elements with no handler (audit), - clicks that changed nothing ("no-op").
   node tools/sweep.js [clicksPerApp=80] [appId,appId…] */
const T = require('./pw');

const per = parseInt(process.argv[2] || '80', 10);
const only = (process.argv[3] || '').split(',').filter(Boolean);

(async () => {
  const { page, done, errors } = await T.open({});
  await T.skipIntro(page);
  await T.unlock(page);
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    document.querySelectorAll('.alert-btn').forEach((b) => { if (b.textContent === 'Not Now') b.click(); });
    JC.state.d.ended = 'sweep'; // pause the story so scenes don't interfere
    window.__mut = 0;
    new MutationObserver((m) => { window.__mut += m.length; }).observe(document.getElementById('screen'), { subtree: true, childList: true, attributes: true, characterData: true });
    window.__acts = 0;
    JC.bus.on('story:act', () => { window.__acts++; });
  });
  const apps = await page.evaluate(() => Object.keys(JC.apps));
  const report = {};
  for (const id of apps) {
    if (only.length && !only.includes(id)) continue;
    const r = { clicks: 0, noop: {}, errors: 0, audit: [] };
    const errBefore = errors.length;
    await page.evaluate((id) => { JC.os.home(); }, id);
    await page.waitForTimeout(600);
    await page.evaluate((id) => JC.os.open(id), id);
    await page.waitForTimeout(900);
    r.audit = await page.evaluate(() => JC.ui.audit().slice(0, 10).map((e) => e.className + ' "' + (e.textContent || '').trim().slice(0, 24) + '"'));
    const seen = {};
    for (let k = 0; k < per; k++) {
      const st0 = await page.evaluate((id) => ({ open: JC.os.isOpen(id), locked: JC.os.locked }), id);
      if (st0.locked) await T.unlock(page);
      if (!st0.open) { await page.evaluate((id) => JC.os.open(id), id); await page.waitForTimeout(700); }
      const target = await page.evaluate(({ id, seenKeys }) => {
        const win = JC.os.activeWin();
        const roots = [document.getElementById('sys-overlays'), document.getElementById('call-layer'), win ? win.overlays : null, win ? win.body : null].filter(Boolean);
        const sr = document.getElementById('screen').getBoundingClientRect();
        let cands = [];
        for (const root of roots) {
          root.querySelectorAll('.tap, button, input, textarea, [role="button"], .toggle').forEach((el) => {
            const b = el.getBoundingClientRect();
            if (b.width < 4 || b.height < 4) return;
            if (b.right < sr.left + 2 || b.left > sr.right - 2 || b.bottom < sr.top + 50 || b.top > sr.bottom - 36) return;
            const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
            const topEl = document.elementFromPoint(cx, cy);
            if (!topEl || !(el === topEl || el.contains(topEl) || topEl.contains(el))) return;
            const key = (el.className && el.className.baseVal === undefined ? el.className : el.tagName) + '|' + (el.textContent || '').trim().slice(0, 20);
            cands.push({ x: cx, y: cy, key });
          });
          if (cands.length && root !== (win && win.body)) break; // overlays take priority
        }
        if (!cands.length) return null;
        const fresh = cands.filter((c) => !seenKeys.includes(c.key));
        const pool = fresh.length ? fresh : cands;
        return pool[Math.floor(Math.random() * pool.length)];
      }, { id, seenKeys: Object.keys(seen) });
      if (!target) { await page.evaluate(() => { if (!JC.os.back()) { const b = document.querySelector('.backdrop, .sheet-back, .pmenu-back, .ctx-back'); if (b) b.click(); } }); await page.waitForTimeout(300); continue; }
      seen[target.key] = (seen[target.key] || 0) + 1;
      const before = await page.evaluate(() => ({ m: window.__mut, a: window.__acts }));
      await page.mouse.click(target.x, target.y);
      await page.waitForTimeout(380);
      const after = await page.evaluate(() => ({ m: window.__mut, a: window.__acts }));
      r.clicks++;
      if (after.m === before.m && after.a === before.a) r.noop[target.key] = (r.noop[target.key] || 0) + 1;
      // recovery
      const state = await page.evaluate((id) => ({ open: JC.os.isOpen(id), locked: JC.os.locked, cinema: document.getElementById('cinema').classList.contains('on') }), id);
      if (state.locked) { await T.unlock(page); }
      if (state.cinema) { await page.evaluate(() => { const b = document.querySelector('#cinema .end-btn, #cinema .pro-skip'); if (b) b.click(); }); await page.waitForTimeout(600); }
      if (!state.open) { await page.evaluate((id) => JC.os.open(id), id); await page.waitForTimeout(700); }
      else if (Math.random() < 0.15) {
        await page.evaluate(() => {
          const b = document.querySelector('#sys-overlays .backdrop, .win.active .win-overlays .backdrop, .win.active .win-overlays .pmenu-back, .ctx-back, #sys-overlays .pmenu-back');
          if (b) b.click(); else JC.os.back();
        });
        await page.waitForTimeout(350);
      }
    }
    r.errors = errors.length - errBefore;
    report[id] = r;
    const noops = Object.entries(r.noop).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `${k} ×${n}`);
    console.log(`${id}: ${r.clicks} clicks, ${Object.keys(seen).length} distinct, errors ${r.errors}${r.audit.length ? ', AUDIT: ' + r.audit.join('; ') : ''}${noops.length ? '\n   no-op: ' + noops.join(' · ') : ''}`);
    if (r.errors) console.log('   ' + errors.slice(errBefore, errBefore + 5).join('\n   '));
  }
  const all = await done();
  console.log('TOTAL page errors:', all.filter((e) => !e.includes('ERR_FAILED')).length);
})();
