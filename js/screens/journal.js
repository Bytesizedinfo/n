import { html, icon, toast, debounce, confirmDialog } from '../ui.js';
import { app } from '../app.js';
import { RATINGS, TAGS, journalInsights } from '../engine/progress.js';
import { todayStr, addDays, formatDate } from '../engine/dates.js';
import { putPhoto, getPhoto, deletePhoto, photoDates, compressImage } from '../store/photos.js';
import { lineChart, chartTable } from './chart.js';

let jdate = null;
let showTable = false;
let compare = null;

const FEEL = ['Rough', 'Meh', 'Okay', 'Good', 'Great'];

export function render(view) {
  const today = todayStr();
  if (!jdate || jdate > today) jdate = today;
  const entry = app.journal(jdate) || { ratings: {}, tags: [], note: '' };
  const all = app.allJournal();
  const insights = journalInsights(all, { today, shelf: app.shelf() });
  const urls = [];

  const days30 = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29));
  const val = (d, k) => (all[d] && all[d].ratings && typeof all[d].ratings[k] === 'number' ? all[d].ratings[k] : null);
  const series = [
    { name: 'Breakouts', values: days30.map((d) => val(d, 'breakouts')) },
    { name: 'Redness', values: days30.map((d) => val(d, 'redness')) },
  ];
  const logged = days30.filter((d) => series.some((s) => s.values[days30.indexOf(d)] !== null)).length;

  view.innerHTML = String(html`
    <div class="page-head">
      <div><div class="eyebrow">Skin journal</div><h1>${jdate === today ? 'Today' : formatDate(jdate, { weekday: 'long', day: 'numeric', month: 'short' })}</h1></div>
      <div class="row">
        <button class="icon-btn" data-day="-1" aria-label="Previous day">${icon('left')}</button>
        <button class="icon-btn" data-day="1" aria-label="Next day" ${jdate >= today ? 'disabled' : ''}>${icon('right')}</button>
      </div>
    </div>

    <div class="card">
      <h3>How does your skin feel?</h3>
      <div class="rate" style="margin-top:10px" role="group" aria-label="Overall feel">
        ${FEEL.map((f, i) => html`<button data-feel="${i + 1}" aria-pressed="${entry.feel === i + 1}">${f}</button>`)}
      </div>
      ${RATINGS.map((r) => html`<div style="margin-top:16px">
        <div class="row spread"><b class="small">${r.label}</b></div>
        <div class="rate" style="margin-top:6px" role="group" aria-label="${r.label}, 0 to 4">
          ${[0, 1, 2, 3, 4].map((n) => html`<button data-rate="${r.key}" data-n="${n}" aria-pressed="${entry.ratings && entry.ratings[r.key] === n}">${n}</button>`)}
        </div>
        <div class="rate-labels"><span>${r.low}</span><span>${r.high}</span></div>
      </div>`)}
      <div style="margin-top:16px"><b class="small">Anything going on?</b>
        <div class="chips" style="margin-top:8px">${TAGS.map((t) => html`<button class="chip-btn" data-tag="${t}" aria-pressed="${(entry.tags || []).includes(t)}">${t}</button>`)}</div>
      </div>
      <label class="field" for="note" style="margin-top:16px">Notes</label>
      <textarea id="note" placeholder="New product, a flare-up, what helped…">${entry.note || ''}</textarea>
      <div class="photo-box" style="margin-top:14px" id="photoBox">
        <p class="small muted" style="margin:0 0 10px">Progress photo (stays on this device only)</p>
        <label class="btn small">${icon('camera')} ${entry.hasPhoto ? 'Replace photo' : 'Add photo'}<input type="file" id="photo" accept="image/*" capture="user" hidden></label>
        ${entry.hasPhoto ? html`<button class="btn small ghost danger" data-delphoto>Remove</button>` : ''}
      </div>
      <p class="tiny faint" id="saved" style="margin:10px 0 0;min-height:16px"></p>
    </div>

    <div class="section-title">Patterns</div>
    ${insights.length ? html`<div class="stack">${insights.map((i) => html`<div class="callout ${i.level === 'good' ? 'good' : i.level === 'warn' ? 'warn' : 'info'}">${icon(i.level === 'good' ? 'checkCircle' : i.level === 'warn' ? 'alert' : 'info')}<div class="t">${i.text}</div></div>`)}</div>`
      : html`<div class="card soft"><p class="small" style="margin:0">${Object.keys(all).length < 5 ? 'Log a few days and patterns will show up here: what makes your skin better or worse, and how new products are going.' : 'No clear patterns yet. Keep logging.'}</p></div>`}

    <div class="section-title">Last 30 days</div>
    <div class="card">
      ${logged >= 2 ? html`
        <div class="row spread" style="margin-bottom:6px"><h3>Breakouts and redness</h3><button class="link small" data-table>${showTable ? 'Show chart' : 'Show as table'}</button></div>
        <div id="chart" ${showTable ? 'hidden' : ''}></div>
        <div ${showTable ? '' : 'hidden'}>${chartTable(days30, series)}</div>
        <p class="tiny faint" style="margin:8px 0 0">0 = none, 4 = a lot. Gaps are days you didn’t log.</p>`
      : html`<p class="small muted" style="margin:0">Your trend chart appears after two days of check-ins.</p>`}
    </div>

    <div id="photoCompare"></div>
  `);

  if (logged >= 2 && !showTable) lineChart(view.querySelector('#chart'), { dates: days30, series });

  // photo preview + comparison
  (async () => {
    if (entry.hasPhoto) {
      const blob = await getPhoto(jdate);
      if (blob) {
        const url = URL.createObjectURL(blob); urls.push(url);
        const img = document.createElement('img');
        img.src = url; img.alt = `Skin photo, ${formatDate(jdate)}`;
        view.querySelector('#photoBox').prepend(img);
      }
    }
    const dates = (await photoDates()).sort();
    if (dates.length >= 2) {
      const a = compare && dates.includes(compare.a) ? compare.a : dates[0];
      const b = compare && dates.includes(compare.b) ? compare.b : dates[dates.length - 1];
      const box = view.querySelector('#photoCompare');
      if (!box) return;
      box.innerHTML = String(html`<div class="section-title">Compare photos</div><div class="card">
        <div class="row" style="margin-bottom:10px">
          <select id="pa" aria-label="First photo">${dates.map((d) => html`<option value="${d}" ${d === a ? 'selected' : ''}>${formatDate(d)}</option>`)}</select>
          <select id="pb" aria-label="Second photo">${dates.map((d) => html`<option value="${d}" ${d === b ? 'selected' : ''}>${formatDate(d)}</option>`)}</select>
        </div>
        <div class="photo-pair"><img id="ia" alt="Photo from ${formatDate(a)}"><img id="ib" alt="Photo from ${formatDate(b)}"></div></div>`);
      for (const [id, d] of [['ia', a], ['ib', b]]) {
        const blob = await getPhoto(d);
        if (blob) { const u = URL.createObjectURL(blob); urls.push(u); box.querySelector('#' + id).src = u; }
      }
      box.querySelectorAll('select').forEach((s) => s.addEventListener('change', () => { compare = { a: box.querySelector('#pa').value, b: box.querySelector('#pb').value }; render(view); }));
    }
  })();

  const savedEl = view.querySelector('#saved');
  const save = (patch) => {
    const cur = app.journal(jdate) || { ratings: {}, tags: [], note: '' };
    app.saveJournal(jdate, { ...cur, ...patch, updated: new Date().toISOString() });
    savedEl.textContent = 'Saved';
  };
  view.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { jdate = addDays(jdate, parseInt(b.dataset.day, 10)); render(view); }));
  view.querySelectorAll('[data-feel]').forEach((b) => b.addEventListener('click', () => {
    const n = parseInt(b.dataset.feel, 10);
    const cur = app.journal(jdate) || {};
    save({ feel: cur.feel === n ? null : n });
    render(view);
  }));
  view.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => {
    const cur = app.journal(jdate) || { ratings: {} };
    const n = parseInt(b.dataset.n, 10);
    const ratings = { ...(cur.ratings || {}) };
    if (ratings[b.dataset.rate] === n) delete ratings[b.dataset.rate]; else ratings[b.dataset.rate] = n;
    save({ ratings });
    render(view);
  }));
  view.querySelectorAll('[data-tag]').forEach((b) => b.addEventListener('click', () => {
    const cur = app.journal(jdate) || { tags: [] };
    const tags = new Set(cur.tags || []);
    if (tags.has(b.dataset.tag)) tags.delete(b.dataset.tag); else tags.add(b.dataset.tag);
    save({ tags: [...tags] });
    b.setAttribute('aria-pressed', String(tags.has(b.dataset.tag)));
  }));
  const note = view.querySelector('#note');
  const saveNote = debounce(() => save({ note: note.value }), 500);
  note.addEventListener('input', () => { savedEl.textContent = 'Saving…'; saveNote(); });
  note.addEventListener('blur', () => saveNote.flush());
  view.querySelector('#photo').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const blob = await compressImage(file);
      await putPhoto(jdate, blob);
      save({ hasPhoto: true });
      toast('Photo saved on this device');
      render(view);
    } catch {
      toast('Couldn’t save that photo.');
    }
  });
  const del = view.querySelector('[data-delphoto]');
  if (del) del.addEventListener('click', async () => {
    if (!(await confirmDialog('Delete this photo from this device?', { title: 'Remove photo', ok: 'Delete', danger: true }))) return;
    await deletePhoto(jdate);
    save({ hasPhoto: false });
    render(view);
  });
  const tbl = view.querySelector('[data-table]');
  if (tbl) tbl.addEventListener('click', () => { showTable = !showTable; render(view); });

  return () => { saveNote.flush && note.value !== (entry.note || '') && saveNote.flush(); urls.forEach((u) => URL.revokeObjectURL(u)); };
}
