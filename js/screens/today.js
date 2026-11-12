import { html, icon, openSheet } from '../ui.js';
import { app } from '../app.js';
import { stepsForDay } from '../engine/routine.js';
import { streak, slotDone } from '../engine/progress.js';
import { todayStr, addDays, weekdayMon0, formatDate, isMorning } from '../engine/dates.js';
import { DAY_NAMES } from '../engine/scheduler.js';
import { shelfById, stepName, stepSub, stepDetail, ringSVG } from './common.js';

let slotChoice = null;

export function render(view) {
  const routine = app.routine();
  const today = todayStr();
  const shelfMap = shelfById(app.shelf());
  const profile = app.profile();
  const day = stepsForDay(routine, today);
  const slot = slotChoice || (isMorning() ? 'am' : 'pm');
  const rec = app.checklist(today);
  const steps = day[slot];
  const required = steps.filter((s) => !s.optional);
  const doneCount = required.filter((s) => rec[slot] && rec[slot][s.key]).length;
  const allDone = required.length > 0 && doneCount === required.length;
  const checklist = app.allChecklist();
  const st = streak(routine, checklist, today);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const mon = addDays(today, -weekdayMon0(today));
  const hasJournal = !!app.journal(today);
  const extrasTonight = day.pm.filter((s) => s.slot === 'weekly');

  view.innerHTML = String(html`
    <div class="page-head">
      <div><div class="eyebrow">${formatDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}</div><div class="hello">${greet}</div></div>
    </div>
    <div class="stat-row">
      <div class="stat"><div class="k">${icon('flame', 'inline')} Streak</div><div class="v">${st} ${st === 1 ? 'day' : 'days'}</div></div>
      <div class="stat"><div class="k">${day.isFinalPhase ? 'Routine' : 'Ramp-up'}</div><div class="v">${day.isFinalPhase ? 'Full plan' : `Week ${day.week}`}</div></div>
    </div>
    <div class="seg" role="tablist" aria-label="Routine">
      <button role="tab" data-slot="am" aria-selected="${slot === 'am'}">${icon('sun')} Morning</button>
      <button role="tab" data-slot="pm" aria-selected="${slot === 'pm'}">${icon('moon')} Night</button>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="row" style="margin-bottom:6px">
        ${ringSVG(doneCount, required.length)}
        <div class="grow">
          <h2>${slot === 'am' ? 'Morning routine' : 'Night routine'}</h2>
          <div class="small muted">${slot === 'pm' && day.recovery ? 'Recovery night: just cleanse and moisturise.' : `${steps.length} steps`}${slot === 'pm' && extrasTonight.length ? ` · ${extrasTonight.map((s) => s.title.split(' (')[0]).join(', ')} tonight` : ''}</div>
        </div>
      </div>
      <ul class="checklist">
        ${steps.map((s, i) => {
          const on = !!(rec[slot] && rec[slot][s.key]);
          const sub = stepSub(s, shelfMap);
          return html`<li class="check-item">
            <button class="check-row" role="checkbox" aria-checked="${on}" data-key="${s.key}">
              <span class="check-box">${icon('check')}</span>
              <span class="grow"><span class="check-title">${stepName(s, shelfMap)}</span>${sub ? html`<span class="check-sub" style="display:block">${sub}</span>` : ''}</span>
            </button>
            <button class="icon-btn" style="border:0;margin-top:6px" data-info="${s.key}" aria-label="About ${s.title}">${icon('info')}</button>
          </li>`;
        })}
      </ul>
      ${allDone ? html`<div class="callout good" style="margin-top:10px">${icon('checkCircle')}<div class="t"><b>${slot === 'am' ? 'Morning' : 'Night'} routine done.</b> ${slot === 'am' ? 'Sunscreen on, you’re set.' : 'Sleep well.'}</div></div>` : ''}
    </div>

    <div class="section-title">This week</div>
    <div class="card flat">
      <div class="week-strip">
        ${DAY_NAMES.map((n, i) => {
          const d = addDays(mon, i);
          const r = checklist[d];
          const future = d > today;
          return html`<div><div class="d ${d === today ? 'today' : ''}">${n}</div>
            <div class="dot2" title="${formatDate(d)}" aria-label="${formatDate(d)}: ${future ? 'upcoming' : `${slotDone(routine, d, r, 'am') ? 'morning done' : 'morning not done'}, ${slotDone(routine, d, r, 'pm') ? 'night done' : 'night not done'}`}">
              <span class="${!future && slotDone(routine, d, r, 'am') ? 'on' : ''}"></span><span class="${!future && slotDone(routine, d, r, 'pm') ? 'on' : ''}"></span></div></div>`;
        })}
      </div>
      <p class="tiny faint center" style="margin:10px 0 0">Top half: morning · bottom half: night</p>
    </div>

    ${!hasJournal ? html`<a class="card sage row" style="margin-top:14px;text-decoration:none;color:inherit" href="#/journal">${icon('book')}<div class="grow"><b>How’s your skin today?</b><div class="small muted">A 20-second check-in helps spot patterns.</div></div>${icon('right')}</a>` : ''}
    ${profile && profile.referrals.length ? html`<a class="card soft row" style="margin-top:14px;text-decoration:none;color:inherit" href="#/routine?tab=notes">${icon('shield')}<div class="grow small">Worth checking with a doctor: see the notes on your routine.</div>${icon('right')}</a>` : ''}
  `);

  view.querySelectorAll('[data-slot]').forEach((b) => b.addEventListener('click', () => { slotChoice = b.dataset.slot; render(view); }));
  view.querySelectorAll('.check-row').forEach((b) => b.addEventListener('click', () => {
    app.toggleStep(today, slot, b.dataset.key);
    render(view);
    const again = view.querySelector(`.check-row[data-key="${CSS.escape(b.dataset.key)}"]`);
    if (again) again.focus();
  }));
  view.querySelectorAll('[data-info]').forEach((b) => b.addEventListener('click', () => {
    const s = steps.find((x) => x.key === b.dataset.info);
    openSheet({ title: stepName(s, shelfMap), content: html`<div class="step-body" style="padding:0">${stepDetail(s, { shelfMap, profile })}</div>` });
  }));
}
