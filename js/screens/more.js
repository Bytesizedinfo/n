import { html, icon, toast, confirmDialog, openSheet, downloadFile, LOGO } from '../ui.js';
import { app } from '../app.js';
import { storeStatus, signIn, signOut, exportData, importData, resetAll } from '../store/index.js';
import { clearPhotos } from '../store/photos.js';
import { openReminders } from './common.js';
import { formatDate, todayStr } from '../engine/dates.js';
import { CONCERNS } from '../data/ingredients.js';
import { PRICES_CHECKED } from '../data/products.js';
import { applyTheme } from '../main.js';

const README = 'https://github.com/Bytesizedinfo/n/blob/skincare-app/README.md#turn-on-sync';
const SKIN = { oily: 'Oily', combination: 'Combination', normal: 'Normal', dry: 'Dry' };

export function render(view, { go }) {
  const st = storeStatus();
  const settings = app.settings();
  const routine = app.routine();
  const profile = app.profile();
  const history = app.history();

  const chip = html`<span class="chip ${st.status === 'error' ? 'danger' : 'sage'}"><span class="sync-dot ${st.status === 'error' ? 'err' : 'on'}"></span> ${st.status === 'syncing' ? 'Syncing…' : st.status === 'error' ? 'Sync problem' : 'Synced'}</span>`;
  const syncCard = st.provider === 'claude'
    ? (st.user
      ? html`<div class="card"><div class="row"><div class="card-title grow" style="margin:0">${icon('cloud')}<h3>Saved to your Claude account</h3></div>${chip}</div>
          <p class="small" style="margin:10px 0 0">Your routine, shelf, checklist and journal save automatically. Open this page on any phone or computer where you’re signed in to Claude and everything is there. Journal photos stay on the device they were taken on.</p>
          ${st.status === 'error' ? html`<p class="small" style="color:var(--danger);margin:8px 0 0">${st.error}</p>` : ''}</div>`
      : html`<div class="card"><div class="card-title">${icon('cloud')}<h3>${st.status === 'loading' ? 'Connecting to your Claude account…' : 'Saved on this device'}</h3></div>
          <p class="small" style="margin:0">${st.status === 'loading' ? 'One moment.' : 'Syncing isn’t available in this view, so your data stays in this browser. Open the page from your own Claude account to sync it.'}</p></div>`)
    : !st.configured
    ? html`<div class="card"><div class="card-title">${icon('cloud')}<h3>Sync is off</h3></div>
        <p class="small">Your data is saved on this device. To have it follow you to other phones and browsers, connect a free Firebase project (about 5 minutes).</p>
        <a class="btn small" href="${README}" target="_blank" rel="noopener">How to turn on sync</a></div>`
    : st.user
      ? html`<div class="card"><div class="row">
          <div class="icon-btn" style="background:var(--blush-soft);color:var(--blush-ink);border:0;font-weight:700">${(st.user.name || st.user.email || '?')[0].toUpperCase()}</div>
          <div class="grow"><b>${st.user.name || 'Signed in'}</b><div class="small muted">${st.user.email}</div></div>
          ${chip}
        </div>
        ${st.status === 'error' ? html`<p class="small" style="color:var(--danger);margin:10px 0 0">${st.error}</p>` : html`<p class="small muted" style="margin:10px 0 0">Changes save automatically and appear on your other devices.</p>`}
        <button class="btn small" data-signout style="margin-top:10px">Sign out</button></div>`
      : html`<div class="card"><div class="card-title">${icon('cloud')}<h3>Sync across devices</h3></div>
        <p class="small">Sign in with Google to save your routine, shelf, checklist and journal to your account and keep them in sync. Journal photos always stay on the device they were taken on.</p>
        ${st.status === 'error' ? html`<p class="small" style="color:var(--danger)">${st.error}</p>` : ''}
        <button class="btn primary block" data-signin ${st.status === 'loading' ? 'disabled' : ''}>${st.status === 'loading' ? 'Connecting…' : 'Sign in with Google'}</button></div>`;

  view.innerHTML = String(html`
    <div class="page-head"><div><div class="eyebrow">Settings</div><h1>More</h1></div></div>
    ${syncCard}

    ${profile ? html`<div class="section-title">Your skin</div>
      <div class="card">
        <div class="chips">
          <span class="chip blush">${SKIN[profile.skinType]} skin</span>
          ${profile.top ? html`<span class="chip sage">Focus: ${CONCERNS[profile.top]}</span>` : ''}
          ${profile.picked.filter((c) => c !== profile.top).map((c) => html`<span class="chip">${CONCERNS[c]}</span>`)}
          <span class="chip">${['Not sensitive', 'A little sensitive', 'Sensitive', 'Very sensitive'][profile.sensitivity]}</span>
        </div>
        <div class="row" style="margin-top:14px"><a class="btn small grow" href="#quiz" data-go="quiz" data-params='{"retake":"1"}'>${icon('refresh')} Retake the quiz</a></div>
        <p class="tiny faint" style="margin:10px 0 0">Retake it when the seasons change, when your skin changes, or every few months. You can compare the new routine with the old one.</p>
      </div>` : html`<div class="section-title">Your skin</div><a class="btn primary block" href="#quiz">Take the quiz</a>`}

    ${history.length ? html`<div class="section-title">History</div>
      <div class="card flat">${history.slice(0, 12).map((h, i) => html`<div class="row" style="padding:8px 0;${i ? 'border-top:1px solid var(--line)' : ''}">
        <div class="grow"><b class="small">${formatDate(h.date.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })}</b>
          <div class="tiny muted">${h.source === 'shelf' ? 'Built from shelf' : 'Quiz'}${h.routine && h.routine.summary && h.routine.summary.top ? ' · ' + CONCERNS[h.routine.summary.top] : ''}${routine && h.routine && h.routine.id === routine.id ? ' · current' : ''}</div></div>
        ${history.length >= 2 ? html`<a class="btn small ghost" href="#compare" data-go="compare" data-params='{"b":"${h.id}"}'>Compare</a>` : ''}
        <button class="icon-btn" style="border:0" data-hmenu="${h.id}" aria-label="More options">${icon('dots')}</button>
      </div>`)}</div>` : ''}

    ${routine ? html`<div class="section-title">Reminders</div>
      <div class="card">
        <div class="row">
          <div class="grow"><label class="field" for="amt">${icon('sun', 'inline')} Morning</label><input type="time" id="amt" value="${settings.amTime}"></div>
          <div class="grow"><label class="field" for="pmt">Night</label><input type="time" id="pmt" value="${settings.pmTime}"></div>
        </div>
        <button class="btn block" data-ics style="margin-top:12px">${icon('calendar')} Add reminders to my calendar</button>
        <p class="tiny faint" style="margin:10px 0 0">Adds repeating morning and night reminders, plus your weekly extras, to Google Calendar or your phone’s calendar.</p>
      </div>` : ''}

    <div class="section-title">Appearance</div>
    <div class="seg" role="group" aria-label="Theme">
      ${[['system', 'Match phone'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => html`<button data-theme="${k}" aria-pressed="${settings.theme === k}">${l}</button>`)}
    </div>

    <div class="section-title">Your data</div>
    <div class="card stack">
      <button class="btn block" data-export>${icon('download')} Export a backup</button>
      <label class="btn block">${icon('upload')} Import a backup<input type="file" id="imp" accept="application/json,.json" hidden></label>
      <button class="btn block danger" data-reset>${icon('trash')} Reset everything</button>
    </div>

    <div class="section-title">About</div>
    <div class="card flat">
      <div class="row"><div style="width:44px;height:44px">${LOGO}</div><div><b>Skin Ritual</b><div class="tiny muted">Rule-based routines, made for you</div></div></div>
      <p class="small" style="margin-top:12px">Recommendations come from built-in rules based on widely used dermatology guidance. Nothing you enter is sent to an AI.</p>
      <p class="small">Example products and prices are for Singapore and approximate (checked ${PRICES_CHECKED}).</p>
      <p class="small muted" style="margin:0">This is general guidance, not medical advice. For prescriptions, pregnancy, or skin problems that are severe or don’t improve, see a doctor or pharmacist.</p>
    </div>
  `);

  const on = (sel, ev, fn) => { const el = view.querySelector(sel); if (el) el.addEventListener(ev, fn); };
  on('[data-signin]', 'click', async () => { try { await signIn(); } catch (e) { toast(e.message || 'Sign-in failed'); } });
  on('[data-signout]', 'click', () => {
    const s = openSheet({ title: 'Sign out', content: html`<p>Your data stays safe in your account. Do you also want to remove it from this device?</p>
      <div class="stack" style="margin-top:14px"><button class="btn block" data-keep>Sign out, keep data here</button><button class="btn block danger" data-clear>Sign out and remove from this device</button></div>` });
    s.body.querySelector('[data-keep]').addEventListener('click', async () => { s.close(); await signOut(); toast('Signed out'); });
    s.body.querySelector('[data-clear]').addEventListener('click', async () => { s.close(); await signOut({ clearDevice: true }); await clearPhotos(); toast('Signed out and cleared this device'); go('welcome'); });
  });
  view.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => { app.saveSettings({ theme: b.dataset.theme }); applyTheme(); render(view, { go }); }));
  on('#amt', 'change', (e) => app.saveSettings({ amTime: e.target.value || '07:30' }));
  on('#pmt', 'change', (e) => app.saveSettings({ pmTime: e.target.value || '22:00' }));
  on('[data-ics]', 'click', () => openReminders(routine));
  on('[data-export]', 'click', async () => {
    try {
      const res = await downloadFile(`skin-ritual-backup-${todayStr()}.json`, JSON.stringify(exportData(), null, 1), 'application/json');
      if (res === 'saved') toast('Backup saved (photos aren’t included)');
    } catch (e) {
      toast(e.message);
    }
  });
  on('#imp', 'change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!(await confirmDialog('Importing replaces anything in this backup that’s also here. Continue?', { title: 'Import backup', ok: 'Import' }))) return;
      await importData(data);
      toast('Backup imported');
      go('today');
    } catch (err) {
      toast(err.message || 'Couldn’t read that file.');
    }
  });
  on('[data-reset]', 'click', async () => {
    if (!(await confirmDialog(`This deletes your quiz answers, routine, shelf, checklist, journal and photos${st.user ? (st.provider === 'claude' ? ' from this device and your Claude account' : ' from this device and your account') : ' on this device'}. It can’t be undone.`, { title: 'Reset everything?', ok: 'Delete everything', danger: true }))) return;
    await resetAll();
    await clearPhotos();
    toast('Everything has been reset');
    go('welcome');
  });
  view.querySelectorAll('[data-hmenu]').forEach((b) => b.addEventListener('click', () => {
    const h = history.find((x) => x.id === b.dataset.hmenu);
    const s = openSheet({ title: formatDate(h.date.slice(0, 10), { day: 'numeric', month: 'long', year: 'numeric' }), content: html`<div class="stack">
      <button class="btn block" data-use>${icon('refresh')} Use this routine again</button>
      <button class="btn block danger" data-del>${icon('trash')} Delete from history</button></div>` });
    s.body.querySelector('[data-use]').addEventListener('click', async () => {
      s.close();
      if (!(await confirmDialog('Switch to this routine? Its ramp-up starts again from today.', { title: 'Use this routine', ok: 'Switch' }))) return;
      app.restoreRoutine(h);
      go('routine', { new: '1' });
    });
    s.body.querySelector('[data-del]').addEventListener('click', () => { app.removeHistory(h.id); s.close(); render(view, { go }); });
  }));
}
