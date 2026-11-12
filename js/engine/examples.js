// Pick example products from the catalogue for a routine step, and check products against a profile.

import { PRODUCTS } from '../data/products.js';
import { BY_ID } from '../data/ingredients.js';
import { eligibility } from './select.js';

const WASH_OFF = ['cleanser', 'oil-cleanser', 'mask'];
const STRONG_GROUPS = ['retinoid', 'exfoliant', 'bpo', 'vitc', 'sulfur', 'antifungal', 'brightener', 'azelaic', 'retinoid-alt', 'copper', 'hq'];

// Problems a product has for this person. level: 'unsafe' | 'warn' | 'info'
export function productIssues(product, profile) {
  const issues = [];
  const washOff = WASH_OFF.includes(product.cat);
  const actives = product.actives || [];
  for (const id of actives) {
    const el = eligibility(id, profile, { washOff });
    if (!el.ok) issues.push({ level: 'unsafe', active: id, text: `${BY_ID[id] ? BY_ID[id].name : id}: ${el.reason}` });
  }
  const f = product.flags || {};
  const hasFragrance = f.ff === false || actives.includes('fragrance') || actives.includes('fragrance-allergen');
  const hasEO = f.eo || actives.includes('eo') || actives.includes('teatree');
  const hasAlcohol = f.alcohol || actives.includes('alcohol');
  if (hasFragrance && profile.wantsFragranceFree) issues.push({ level: 'warn', text: 'Contains fragrance, a common trigger for reactive skin.' });
  if (hasEO && profile.avoidsEO) issues.push({ level: 'warn', text: 'Contains essential oils, which often irritate sensitive skin.' });
  if (hasAlcohol && profile.avoidsAlcohol) issues.push({ level: 'warn', text: 'Contains drying alcohol.' });
  if (actives.includes('comedogenic') && profile.acneProne) issues.push({ level: 'warn', text: 'Has ingredients that may clog pores for acne-prone skin.' });
  if (product.fungalTriggers && product.fungalTriggers.length && (profile.conditions.includes('fungal') || profile.acneTypes.includes('fungal'))) {
    issues.push({ level: 'warn', text: 'Has oils or esters that can feed fungal acne.' });
  }
  if (product.wordHits && product.wordHits.length) issues.push({ level: 'unsafe', text: `Contains something you avoid: ${product.wordHits.join(', ')}.` });
  if (product.types && profile.skinType && !product.types.includes(profile.skinType)) {
    issues.push({ level: 'info', text: `Made more for ${product.types.join('/')} skin.` });
  }
  if (product.rx === 'pharmacist') issues.push({ level: 'info', text: 'Sold behind the pharmacy counter: ask the pharmacist.' });
  if (profile.prefs && profile.prefs.has('mineral') && product.cat === 'sunscreen' && actives.includes('spf-chemical')) {
    issues.push({ level: 'warn', text: 'Uses chemical UV filters (you prefer mineral).' });
  }
  return issues;
}

function tierOrder(profile, isTreatment) {
  switch (profile.budget) {
    case 'budget': return ['budget', 'mid', 'splurge'];
    case 'splurge': return ['splurge', 'mid', 'budget'];
    case 'mix': return isTreatment ? ['mid', 'splurge', 'budget'] : ['budget', 'mid', 'splurge'];
    default: return ['mid', 'budget', 'splurge'];
  }
}

const LIGHT = ['gel', 'fluid', 'water', 'lotion', 'serum', 'liquid', 'essence', 'foam'];
const RICH = ['cream', 'rich', 'balm'];

function rank(product, profile, spec) {
  let s = 0;
  const f = product.flags || {};
  if (product.types && product.types.includes(profile.skinType)) s += 1;
  if (product.sensitive && profile.sensitivity >= 2) s += 0.8;
  if (profile.wantsFragranceFree) s += f.ff === true ? 0.5 : -0.3;
  const tex = product.texture;
  const wantLight = profile.texture === 'light' || (spec.lighter && profile.texture !== 'rich');
  if (wantLight) s += LIGHT.includes(tex) ? 0.5 : RICH.includes(tex) ? -0.5 : 0;
  if (profile.texture === 'rich' || spec.richer) s += RICH.includes(tex) ? 0.5 : 0;
  if (profile.climate === 'tropical' && RICH.includes(tex) && profile.skinType !== 'dry' && !spec.richer) s -= 0.4;
  if (profile.prefs.has('vegan')) s += f.vegan ? 0.6 : -0.2;
  if (profile.prefs.has('cf')) s += f.cf ? 0.6 : -0.2;
  if (spec.cats.includes('sunscreen') && (profile.env.includes('sweat') || profile.env.includes('outdoors') || profile.env.includes('swim')) && product.id === 'anessa-milk') s += 1.2;
  // Strength fit for retinol
  const st = product.strength || {};
  if (st.retinol !== undefined) {
    const beginner = profile.retinoidExp === 'never' || profile.retinoidExp === 'irritated' || profile.sensitivity >= 2;
    if (beginner) s += st.retinol <= 0.3 ? 0.6 : -0.4;
    else s += st.retinol >= 0.3 ? 0.4 : 0;
  }
  // Extra strong actives the step didn't ask for add complexity.
  const required = spec.requireAny || [];
  for (const a of product.actives || []) {
    const g = BY_ID[a] && BY_ID[a].group;
    if (STRONG_GROUPS.includes(g) && !required.includes(a)) s -= 0.5;
  }
  return s;
}

// spec: { cats, requireAny?, excludeStrong?, maskType?, lighter?, richer?, treatment? , exclude? }
export function pickExamples(spec, profile, max = 3) {
  const order = tierOrder(profile, !!spec.treatment);
  let list = PRODUCTS.filter((p) => spec.cats.includes(p.cat));
  if (spec.maskType) list = list.filter((p) => p.maskType === spec.maskType);
  if (spec.requireAny && spec.requireAny.length) list = list.filter((p) => p.actives.some((a) => spec.requireAny.includes(a)));
  if (spec.excludeStrong) {
    list = list.filter((p) => !p.actives.some((a) => STRONG_GROUPS.includes(BY_ID[a] && BY_ID[a].group) && !(spec.requireAny || []).includes(a)));
  }
  if (spec.exclude) list = list.filter((p) => !spec.exclude.includes(p.id));
  if (profile.prefs.has('mineral') && spec.cats.includes('sunscreen')) list = list.filter((p) => !p.actives.includes('spf-chemical'));
  list = list.filter((p) => !productIssues(p, profile).some((i) => i.level === 'unsafe' || i.level === 'warn'));
  const scored = list.map((p) => ({ p, s: rank(p, profile, spec) }))
    .sort((a, b) => b.s - a.s || order.indexOf(a.p.tier) - order.indexOf(b.p.tier) || a.p.price - b.p.price);
  const picked = [];
  for (const tier of order) {
    const hit = scored.find((x) => x.p.tier === tier && !picked.includes(x.p));
    if (hit && hit.s >= (scored[0] ? scored[0].s - 2 : 0)) picked.push(hit.p);
    if (picked.length >= max) break;
  }
  for (const x of scored) {
    if (picked.length >= max) break;
    if (!picked.includes(x.p)) picked.push(x.p);
  }
  picked.sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));
  return picked.slice(0, max).map((p) => p.id);
}
