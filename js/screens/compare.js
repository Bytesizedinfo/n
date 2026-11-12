import { html, icon } from '../ui.js';
import { app } from '../app.js';
import { compareRoutines, compareAnswers } from '../engine/compare.js';
import { formatDate } from '../engine/dates.js';
import { freqLabel } from '../engine/scheduler.js';

const label = (h) => `${formatDate(h.date.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })} · ${h.source === 'shelf' ? 'shelf' : 'quiz'}`;

export function render(view, { params, go }) {
  const history = app.history();
  if (history.length < 2) {
    view.innerHTML = String(html`<div class="page-head"><h1>Compare</h1></div><div class="card soft"><p style="margin:0">Retake the quiz or build from your shelf to have something to compare with.</p></div><a class="btn block" href="#more" style="margin-top:14px">Back</a>`);
    return;
  }
  const b = history.find((h) => h.id === params.get('b')) || history[0];
  const a = history.find((h) => h.id === params.get('a') && h.id !== b.id) || history.find((h) => h.id !== b.id && h.date < b.date) || history.find((h) => h.id !== b.id);
  const diff = compareRoutines(a.routine, b.routine);
  const answers = compareAnswers(a.answers || {}, b.answers || {});
  const when = (s) => (s.routineSlot || s.slot) === 'am' ? 'Morning' : (s.slot === 'weekly' ? 'Weekly' : 'Night');
  const item = (s, extra = '') => html`<div class="note">${icon(when(s) === 'Morning' ? 'sun' : 'moon')}<div><b>${s.title}</b><div class="small muted">${when(s)}${s.base ? '' : ' · ' + freqLabel(s.freq, s.routineSlot || 'pm')}${extra}</div></div></div>`;

  view.innerHTML = String(html`
    <div class="page-head"><div><div class="eyebrow">History</div><h1>Compare routines</h1></div><a class="icon-btn" href="#more" aria-label="Back">${icon('x')}</a></div>
    <div class="card">
      <label class="field" for="ca">Before</label>
      <select id="ca">${history.filter((h) => h.id !== b.id).map((h) => html`<option value="${h.id}" ${h.id === a.id ? 'selected' : ''}>${label(h)}</option>`)}</select>
      <label class="field" for="cb" style="margin-top:12px">After</label>
      <select id="cb">${history.map((h) => html`<option value="${h.id}" ${h.id === b.id ? 'selected' : ''}>${label(h)}</option>`)}</select>
    </div>

    <div class="section-title">What changed in your answers</div>
    <div class="card flat">${answers.length ? answers.map((x) => html`<div style="padding:6px 0"><b class="small">${x.title}</b><div class="small"><span class="muted">${x.before}</span> → ${x.after}</div></div>`) : html`<p class="small muted" style="margin:0">Same answers.</p>`}</div>

    <div class="section-title">Added</div>
    <div class="card flat">${diff.added.length ? diff.added.map((s) => item(s)) : html`<p class="small muted" style="margin:0">Nothing new.</p>`}</div>
    <div class="section-title">Removed</div>
    <div class="card flat">${diff.removed.length ? diff.removed.map((s) => item(s)) : html`<p class="small muted" style="margin:0">Nothing removed.</p>`}</div>
    <div class="section-title">Changed</div>
    <div class="card flat">${diff.changed.length ? diff.changed.map((c) => html`<div class="note">${icon('compare')}<div><b>${c.after.title}</b><div class="small muted">${c.changes.join(' · ')}</div></div></div>`) : html`<p class="small muted" style="margin:0">No changes to shared steps.</p>`}</div>
    <p class="small muted" style="margin-top:12px">${diff.same.length} steps stayed the same.</p>
  `);
  view.querySelector('#ca').addEventListener('change', (e) => go('compare', { a: e.target.value, b: b.id }));
  view.querySelector('#cb').addEventListener('change', (e) => go('compare', { a: a.id, b: e.target.value }));
}
