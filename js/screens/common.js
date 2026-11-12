// Pieces shared by several screens.

import { html, icon, productCard, openSheet, toast, downloadFile, inClaude } from '../ui.js';
import { app } from '../app.js';
import { buildIcs, googleCalendarLinks } from '../engine/ics.js';
import { zipFiles } from '../zip.js';
import { PRODUCT_BY_ID, PRICES_CHECKED } from '../data/products.js';
import { productIssues } from '../engine/examples.js';
import { daysLabel } from '../engine/scheduler.js';

export function shelfById(shelf) {
  return Object.fromEntries((shelf || []).map((p) => [p.id, p]));
}

export function stepName(step, shelfMap) {
  const p = step.productId && shelfMap[step.productId];
  return p ? p.name : step.title;
}

export function stepSub(step, shelfMap) {
  const parts = [];
  const p = step.productId && shelfMap[step.productId];
  if (p) parts.push(step.title !== p.name ? step.title : 'From your shelf');
  else if (step.examples && step.examples.length && step.base) {
    const ex = PRODUCT_BY_ID[step.examples[0]];
    if (ex) parts.push(`e.g. ${ex.brand} ${ex.name}`);
  }
  if (!step.base && step.days && step.days.length && step.days.length < 7) parts.push(daysLabel(step.days));
  if (step.optional) parts.push('optional');
  if (step.gap) parts.push('not on your shelf yet');
  return parts.join(' · ');
}

export function stepDetail(step, { shelfMap = {}, profile = null } = {}) {
  const owned = step.productId && shelfMap[step.productId];
  const examples = (step.examples || []).map((id) => PRODUCT_BY_ID[id]).filter(Boolean);
  return html`
    ${step.why && step.why.length ? html`<ul>${step.why.map((w) => html`<li>${w}</li>`)}</ul>` : ''}
    ${step.lookFor && !owned ? html`<div class="lookfor"><b>Look for:</b> ${step.lookFor}</div>` : ''}
    ${owned ? html`<div class="small muted" style="margin:6px 0">From your shelf</div>${productCard(owned, { owned: true, issues: profile ? productIssues(owned, profile).filter((i) => i.level !== 'info') : [] })}` : ''}
    ${!owned && examples.length ? html`<div class="small muted" style="margin:6px 0">Examples in Singapore</div>${examples.map((p) => productCard(p))}
      <p class="tiny faint" style="margin-top:8px">Approximate prices (${PRICES_CHECKED}); promotions change them often.</p>` : ''}
  `;
}

export function ringSVG(done, total, size = 54) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 0;
  return html`<svg class="ring" viewBox="0 0 ${size} ${size}" role="img" aria-label="${done} of ${total} done">
    <circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
    <circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${done}/${total}</text>
  </svg>`;
}

// Reminders: Google Calendar links for each repeating reminder, plus a calendar file for other apps.
export function openReminders(routine) {
  const s = app.settings();
  const appUrl = inClaude() ? '' : location.href.split('#')[0];
  const links = googleCalendarLinks(routine, { amTime: s.amTime, pmTime: s.pmTime, appUrl });
  const sheet = openSheet({ title: 'Add reminders', content: html`
    <p class="small muted" style="margin-top:0">Morning at ${s.amTime}, night at ${s.pmTime}. Change the times under More → Reminders.</p>
    <div class="section-title" style="margin-top:14px">Google Calendar</div>
    <div class="stack">${links.map((l) => html`<a class="btn block" style="justify-content:flex-start" href="${l.url}" target="_blank" rel="noopener">${icon('calendar')}<span class="grow" style="text-align:left">${l.label}<span class="small muted" style="display:block;font-weight:500">${l.when}</span></span>${icon('right')}</a>`)}</div>
    <div class="section-title">Apple Calendar and others</div>
    <button class="btn block" data-file>${icon('download')} ${inClaude() ? 'Save calendar file (.zip)' : 'Download calendar file (.ics)'}</button>
    <p class="tiny faint" style="margin-top:8px">${inClaude() ? 'On iPhone: open the .zip in Files to unzip it, then tap the .ics file to add all reminders at once.' : 'Open the downloaded file to add all reminders at once.'}</p>` });
  sheet.body.querySelector('[data-file]').addEventListener('click', async () => {
    const ics = buildIcs(routine, { amTime: s.amTime, pmTime: s.pmTime, appUrl });
    try {
      const res = inClaude()
        ? await downloadFile('skin-ritual-reminders.zip', new Blob([zipFiles([{ name: 'skin-ritual-reminders.ics', data: ics }])], { type: 'application/zip' }))
        : await downloadFile('skin-ritual-reminders.ics', ics, 'text/calendar');
      if (res === 'saved') toast('Calendar file saved');
    } catch (e) {
      toast(e.message);
    }
  });
}
