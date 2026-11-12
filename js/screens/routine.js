import { html, icon, productCard, confirmDialog } from '../ui.js';
import { app } from '../app.js';
import { BY_ID, CONCERNS } from '../data/ingredients.js';
import { PRODUCT_BY_ID } from '../data/products.js';
import { phaseForDate } from '../engine/routine.js';
import { DAY_NAMES, daysLabel, freqLabel } from '../engine/scheduler.js';
import { todayStr, formatDate } from '../engine/dates.js';
import { shelfById, stepName, stepDetail, openReminders } from './common.js';

const SHORT = {
  tretinoin: 'Tretinoin', adapalene: 'Adapalene', retinal: 'Retinal', retinol: 'Retinol', hpr: 'Retinoid', retinyl: 'Retinyl', bakuchiol: 'Bakuchiol',
  salicylic: 'BHA', 'betaine-sal': 'BHA', lha: 'BHA', glycolic: 'AHA', lactic: 'Lactic', mandelic: 'Mandelic', aha: 'AHA', pha: 'PHA', peel: 'Peel',
  bpo: 'BPO', laa: 'Vit C', 'vitc-deriv': 'Vit C', azelaic: 'Azelaic', niacinamide: 'Niacin.', tranexamic: 'TXA', arbutin: 'Arbutin',
  sulfur: 'Sulfur', peptides: 'Peptides', copper: 'Copper', zpt: 'Anti-fungal', hydroquinone: 'HQ', centella: 'Cica', ha: 'HA', ceramides: 'Ceramide',
};
const SKIN = { oily: 'Oily', combination: 'Combination', normal: 'Normal', dry: 'Dry' };

function shortLabel(step) {
  if (step.kind === 'mask') return { clay: 'Clay mask', hydrating: 'Hydra mask', peel: 'Peel' }[step.maskType] || 'Mask';
  if (step.key === 'rx-clinda') return 'Clinda';
  return SHORT[step.primary] || step.title.split(' ')[0];
}

function pillClass(step) {
  const g = BY_ID[step.primary] && BY_ID[step.primary].group;
  if (step.kind === 'mask') return 'mask';
  if (g === 'retinoid' || g === 'retinoid-alt') return 'retinoid';
  if (g === 'exfoliant' || g === 'bpo') return 'exfoliant';
  return '';
}

export function render(view, { params, go }) {
  const routine = app.routine();
  const shelf = app.shelf();
  const shelfMap = shelfById(shelf);
  const profile = app.profile();
  const tab = params.get('tab') || 'am';
  const isNew = params.get('new') === '1';
  const history = app.history();
  const { week, phase } = phaseForDate(routine, todayStr());
  const byKey = Object.fromEntries(routine.steps.map((s) => [s.key, s]));
  const sum = routine.summary || {};

  const slotSteps = (slot) => routine.steps.filter((s) => s.slot === slot).sort((a, b) => a.order - b.order);
  const stepCard = (s, i) => {
    const freq = s.base ? '' : s.slot === 'weekly' ? freqLabel(s.freq, 'pm').replace('night', 'time').replace('nights', 'times') : (s.days.length === 7 ? (s.slot === 'am' ? 'Every morning' : 'Every night') : daysLabel(s.days));
    const sub = [s.productId && shelfMap[s.productId] && s.title !== shelfMap[s.productId].name ? s.title : '', freq, s.ramp ? 'starts slowly' : '', s.optional ? 'optional' : '', s.gap ? 'not on your shelf' : ''].filter(Boolean).join(' · ');
    return html`<details class="card step-card" ${i === 0 && isNew ? 'open' : ''}>
      <summary class="step-head"><span class="n">${i + 1}</span><span class="grow"><span class="check-title" style="display:block">${stepName(s, shelfMap)}</span>${sub ? html`<span class="check-sub" style="display:block">${sub}</span>` : ''}</span>${icon('right', 'chev')}</summary>
      <div class="step-body">${stepDetail(s, { shelfMap, profile })}</div>
    </details>`;
  };

  const TABS = [['am', 'Morning', 'sun'], ['pm', 'Night', 'moon'], ['weekly', 'Week', 'calendar'], ['ramp', 'Ramp-up', 'clock'], ['notes', 'Notes', 'info']];
  const finalGrid = routine.phases[routine.phases.length - 1].grid;

  let body = '';
  if (tab === 'am' || tab === 'pm') {
    body = html`<div class="stack">${slotSteps(tab).map(stepCard)}</div>
      <p class="small muted" style="margin-top:12px">Steps go from thinnest to thickest. Treatments that rotate show which days they’re on; the Today tab always shows exactly what to do.</p>`;
  } else if (tab === 'weekly') {
    const extras = routine.steps.filter((s) => s.slot === 'weekly');
    const asNeeded = routine.steps.filter((s) => s.slot === 'asneeded');
    const cell = (keys) => (keys.length ? keys.map((k) => byKey[k]).filter(Boolean).map((s) => html`<span class="pill ${pillClass(s)}" title="${s.title}">${shortLabel(s)}</span>`) : html`<span class="pill rest">Basics</span>`);
    const todayIdx = (new Date().getDay() + 6) % 7;
    body = html`
      <div class="card">
        <div class="card-title"><h3>Your week</h3><span class="chip">After ramp-up</span></div>
        <div class="week-list" role="table" aria-label="Weekly schedule">
          <div class="wl-row wl-head" role="row"><span role="columnheader"></span><span role="columnheader">${icon('sun', 'inline')} Morning</span><span role="columnheader">${icon('moon', 'inline')} Night</span></div>
          ${finalGrid.map((c, d) => html`<div class="wl-row ${d === todayIdx ? 'today' : ''}" role="row"><span class="wl-day" role="rowheader">${DAY_NAMES[d]}</span><span role="cell">${cell(c.am)}</span><span role="cell">${cell(c.pm)}</span></div>`)}
        </div>
        <p class="tiny faint" style="margin-top:10px">“Basics” = cleanse and moisturise (plus sunscreen in the morning).${phase.toWeek !== null ? ' You’re still ramping up, so this week is lighter: the Today tab shows exactly what to do.' : ''}</p>
      </div>
      <div class="section-title">Weekly extras</div>
      ${extras.length ? html`<div class="stack">${extras.map(stepCard)}</div>` : html`<p class="muted small">No weekly extras needed.</p>`}
      ${asNeeded.length ? html`<div class="section-title">As needed</div><div class="stack">${asNeeded.map(stepCard)}</div>` : ''}`;
  } else if (tab === 'ramp') {
    body = routine.ramp.length ? html`
      <p class="muted">Strong actives come in one at a time, starting a few nights a week. If your skin stings, peels or feels tight, stay on the current step for another week or two before moving up.</p>
      ${routine.repairWeeks ? html`<div class="callout info" style="margin:12px 0">${icon('heart')}<div class="t"><b>Barrier repair first.</b> Weeks 1–${routine.repairWeeks}: only gentle cleanser, moisturiser and sunscreen.</div></div>` : ''}
      <div class="stack" style="margin-top:12px">${routine.ramp.map((r) => {
        const s = byKey[r.key];
        return html`<div class="card">
          <h3 style="margin-bottom:6px">${s ? stepName(s, shelfMap) : r.title}</h3>
          ${r.rows.map((row) => {
            const now = week >= (row.from || 1) && (row.to === null || row.to === undefined || week <= row.to);
            return html`<div class="ramp-row ${now ? 'now' : ''}"><span class="w">${row.label}</span><span class="grow">${row.text}${now ? html` <span class="chip blush">you are here</span>` : ''}</span></div>`;
          })}
        </div>`;
      })}</div>
      <p class="small muted" style="margin-top:12px">You’re in week ${week} (started ${formatDate(routine.startDate)}).</p>`
      : html`<div class="card soft"><p style="margin:0">No ramp-up needed: everything in your routine is gentle enough to start straight away.</p></div>`;
  } else {
    body = html`
      ${routine.referrals.length ? html`<div class="callout danger">${icon('shield')}<div class="t"><b>Worth seeing a doctor about</b><ul style="margin:6px 0 0;padding-left:18px">${routine.referrals.map((r) => html`<li>${r}</li>`)}</ul></div></div>` : ''}
      ${routine.warnings.length ? html`<div class="callout warn" style="margin-top:12px">${icon('alert')}<div class="t">${routine.warnings.map((w) => html`<div>${w}</div>`)}</div></div>` : ''}
      ${routine.gaps && routine.gaps.length ? html`<div class="section-title">Missing from your shelf</div><div class="stack">${routine.gaps.map((g) => html`<div class="card"><h3>${g.title}</h3>${g.why ? html`<p class="small muted" style="margin-top:4px">${g.why}</p>` : ''}<div style="margin-top:10px">${g.examples.map((id) => PRODUCT_BY_ID[id]).filter(Boolean).map((p) => productCard(p))}</div></div>`)}</div>` : ''}
      ${routine.unused && routine.unused.length ? html`<div class="section-title">On your shelf, not in this routine</div><div class="card flat">${routine.unused.map((u) => html`<div class="note">${icon('bottle')}<div><b>${u.name}</b><div class="small muted">${u.reason}</div></div></div>`)}</div>` : ''}
      <div class="section-title">Good to know</div>
      <div class="card flat">${routine.notes.map((n) => html`<div class="note">${icon('leaf')}<div>${n}</div></div>`)}</div>
      <p class="tiny faint" style="margin-top:14px">Skin Ritual gives general skincare guidance based on common dermatology advice. It isn’t medical advice; check with a doctor or pharmacist about prescriptions, pregnancy or anything persistent.</p>`;
  }

  view.innerHTML = String(html`
    <div class="page-head"><div><div class="eyebrow">${routine.source === 'shelf' ? 'Built from your shelf' : 'Built from your quiz'} · started ${formatDate(routine.startDate)}</div><h1>Your routine</h1></div></div>
    <div class="chips" style="margin-bottom:14px">
      ${sum.skinType ? html`<span class="chip blush">${SKIN[sum.skinType]} skin</span>` : ''}
      ${sum.top ? html`<span class="chip sage">Focus: ${CONCERNS[sum.top]}</span>` : ''}
      ${sum.sensitivity >= 2 ? html`<span class="chip">Sensitive</span>` : ''}
      ${sum.pregnancy ? html`<span class="chip info">Pregnancy-safe picks</span>` : ''}
    </div>
    ${isNew ? html`<div class="callout good" style="margin-bottom:14px">${icon('sparkles')}<div class="t"><b>Your routine is ready.</b> Tap any step to see why it’s there and products to try. ${routine.ramp.length ? 'Strong actives start slowly; the Today tab keeps track for you.' : ''}
      ${history.length >= 2 ? html`<div style="margin-top:6px"><a href="#compare">Compare with your previous routine</a></div>` : ''}</div></div>` : ''}
    <div class="seg scroll" role="tablist" aria-label="Routine sections">
      ${TABS.map(([k, label, ic]) => html`<button role="tab" data-tab="${k}" aria-selected="${tab === k}">${icon(ic)} ${label}</button>`)}
    </div>
    <div style="margin-top:16px">${body}</div>
    <div class="section-title">Actions</div>
    <div class="stack">
      <button class="btn block" data-ics>${icon('calendar')} Add reminders to my calendar</button>
      ${routine.source === 'shelf'
        ? html`<button class="btn block" data-quiz-routine>${icon('sparkles')} Switch to the quiz-recommended routine</button>`
        : shelf.length ? html`<button class="btn block" data-shelf-routine>${icon('shelf')} Build from my shelf instead</button>` : ''}
      <a class="btn block" href="#quiz" data-go="quiz" data-params='{"retake":"1"}'>${icon('refresh')} Retake the quiz</a>
      ${history.length >= 2 ? html`<a class="btn block" href="#compare">${icon('compare')} Compare with a previous routine</a>` : ''}
    </div>
  `);

  view.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => go('routine', { tab: b.dataset.tab })));
  view.querySelector('[data-ics]').addEventListener('click', () => openReminders(routine));
  const sr = view.querySelector('[data-shelf-routine]');
  if (sr) sr.addEventListener('click', async () => {
    if (!(await confirmDialog('This replaces your current routine with one built from the products on your shelf. Your current one stays in your history.', { title: 'Build from your shelf?', ok: 'Build it' }))) return;
    app.useShelfRoutine();
    go('routine', { new: '1', tab: 'notes' });
  });
  const qr = view.querySelector('[data-quiz-routine]');
  if (qr) qr.addEventListener('click', async () => {
    if (!(await confirmDialog('Switch back to the routine recommended from your quiz answers? Your shelf routine stays in your history.', { title: 'Use the quiz routine?', ok: 'Switch' }))) return;
    app.useQuizRoutine();
    go('routine', { new: '1' });
  });
}
