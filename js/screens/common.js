// Pieces shared by several screens.

import { html, icon, productCard } from '../ui.js';
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
