// My Shelf: check owned products against each other and the profile, and build a routine from them.

import { BY_ID, SINGLE_GROUPS } from '../data/ingredients.js';
import { conflictsBetween } from '../data/interactions.js';
import { buildProfile } from './profile.js';
import { scoreActive, chooseActives, maxActives, helpsText } from './select.js';
import { productIssues, pickExamples } from './examples.js';
import { assemble, itemForActive } from './routine.js';
import { avoidWordHits } from './parse.js';

// Attach hits for the person's own "avoid" words (from pasted ingredient lists).
function prep(products, profile) {
  if (!profile.avoidWords || !profile.avoidWords.length) return products;
  return products.map((p) => (p.inci ? { ...p, wordHits: avoidWordHits(p.inci, profile.avoidWords) } : p));
}

const PRIORITY = [
  'tretinoin', 'retinal', 'adapalene', 'retinol', 'hpr', 'retinyl', 'bakuchiol', 'hydroquinone',
  'bpo', 'peel', 'glycolic', 'salicylic', 'lactic', 'mandelic', 'lha', 'betaine-sal', 'aha', 'pha', 'enzyme',
  'laa', 'azelaic', 'tranexamic', 'arbutin', 'melasyl', 'kojic', 'vitc-deriv', 'sulfur', 'zpt', 'copper', 'niacinamide',
  'peptides', 'potassium-azeloyl', 'ceramides', 'centella', 'ha', 'panthenol', 'allantoin', 'urea', 'squalane', 'antioxidants', 'licorice', 'zinc-pca', 'glycerin', 'clay',
];
const STRONG = ['retinoid', 'retinoid-alt', 'exfoliant', 'bpo', 'vitc', 'brightener', 'azelaic', 'sulfur', 'copper', 'hq'];

export function realActives(product) {
  return (product.actives || []).filter((a) => BY_ID[a] && ['active', 'support'].includes(BY_ID[a].kind));
}

export function primaryActive(product) {
  const acts = product.actives || [];
  return PRIORITY.find((id) => acts.includes(id)) || null;
}

export function productIrritation(product) {
  const acts = realActives(product);
  let max = 0;
  let strongCount = 0;
  for (const a of acts) {
    let irr = BY_ID[a].irritation;
    const pct = product.strength && product.strength[a];
    if (pct !== undefined) {
      if (a === 'retinol') irr = pct <= 0.2 ? 1.8 : pct >= 1 ? 3.2 : 2.5;
      if (a === 'glycolic') irr = pct >= 10 ? 3 : pct <= 5 ? 2 : 2.5;
      if (a === 'bpo') irr = pct >= 5 ? 3 : 2.5;
      if (a === 'salicylic') irr = pct <= 0.5 ? 1.2 : 2;
      if (a === 'laa') irr = pct <= 5 ? 0.8 : pct >= 20 ? 2 : 1.5;
    }
    if (irr >= 1) strongCount++;
    max = Math.max(max, irr);
  }
  if (product.actives && product.actives.includes('peel')) max = Math.max(max, 4);
  return Math.round((max + Math.max(0, strongCount - 1) * 0.3) * 10) / 10;
}

export function roleOf(product) {
  const prim = primaryActive(product);
  const g = prim && BY_ID[prim] ? BY_ID[prim].group : null;
  switch (product.cat) {
    case 'cleanser': return prim === 'zpt' ? 'wash' : 'cleanse';
    case 'oil-cleanser': return 'oilcleanse';
    case 'sunscreen': return 'spf';
    case 'mask': return 'mask';
    case 'spot': return 'spot';
    case 'toner': return g && STRONG.includes(g) ? 'treat' : 'toner';
    case 'moisturizer': return g && STRONG.includes(g) ? 'treat' : 'moisturize';
    default: return 'treat';
  }
}

function maskTypeOf(product) {
  if (product.maskType) return product.maskType;
  const a = product.actives || [];
  if (a.includes('peel')) return 'peel';
  if (a.includes('clay')) return 'clay';
  return 'hydrating';
}

// ---------- analysis ----------

export function analyseShelf(products, answersOrProfile) {
  const profile = answersOrProfile && answersOrProfile.concerns && answersOrProfile.avoid ? answersOrProfile : buildProfile(answersOrProfile || {});
  products = prep(products, profile);
  const perProduct = {};
  for (const p of products) {
    perProduct[p.id] = { issues: productIssues(p, profile), role: roleOf(p), primary: primaryActive(p), irritation: productIrritation(p) };
  }

  const clashes = [];
  const reassurances = [];
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const A = products[i];
      const B = products[j];
      if (A.cat === 'cleanser' || B.cat === 'cleanser' || A.cat === 'oil-cleanser' || B.cat === 'oil-cleanser') continue; // rinse-off
      const list = conflictsBetween(realActives(A).concat((A.actives || []).filter((x) => x === 'peel')), realActives(B).concat((B.actives || []).filter((x) => x === 'peel')), profile.sensitivity);
      const bad = list.filter((c) => ['avoid', 'separate', 'caution'].includes(c.level));
      if (bad.length) {
        const rank = { avoid: 3, separate: 2, caution: 1 };
        const worst = bad.reduce((m, c) => (rank[c.level] > rank[m.level] ? c : m), bad[0]);
        const whys = [...new Set(bad.map((c) => c.why))];
        clashes.push({ a: A.id, b: B.id, level: worst.level, why: whys, pairs: bad.map((c) => [c.a, c.b]) });
      } else if (list.some((c) => c.level === 'fine')) {
        reassurances.push({ a: A.id, b: B.id, why: list.find((c) => c.level === 'fine').why });
      }
    }
  }

  // Duplicates by job.
  const duplicates = [];
  const byGroup = {};
  for (const p of products) {
    const role = perProduct[p.id].role;
    if (role === 'treat') {
      const prim = perProduct[p.id].primary;
      let g = prim && BY_ID[prim] ? BY_ID[prim].group : 'other';
      if (g === 'retinoid-alt') g = 'retinoid';
      (byGroup[g] = byGroup[g] || []).push(p.id);
    } else {
      (byGroup['role:' + role] = byGroup['role:' + role] || []).push(p.id);
    }
  }
  const label = { retinoid: 'retinoids', exfoliant: 'exfoliants', vitc: 'vitamin C products', bpo: 'benzoyl peroxide products', brightener: 'pigment brighteners' };
  for (const [g, ids] of Object.entries(byGroup)) {
    if (g === 'retinoid' && ids.length >= 2) duplicates.push({ group: g, ids, level: 'avoid', text: `${ids.length} retinoids: use only one at a time. The plan keeps the best fit and benches the rest.` });
    else if (g === 'exfoliant' && ids.length >= 2) duplicates.push({ group: g, ids, level: ids.length >= 3 ? 'warn' : 'info', text: `${ids.length} exfoliants: you only need one. The plan uses the best fit; save the others for when it runs out.` });
    else if (SINGLE_GROUPS.includes(g) && ids.length >= 2) duplicates.push({ group: g, ids, level: 'info', text: `${ids.length} ${label[g] || g + ' products'} doing the same job: one is enough.` });
    else if (g === 'role:cleanse' && ids.length >= 3) duplicates.push({ group: g, ids, level: 'info', text: `${ids.length} cleansers: you only need one (plus an oil cleanser if you wear makeup).` });
    else if (g === 'role:spf' && ids.length >= 3) duplicates.push({ group: g, ids, level: 'info', text: `${ids.length} sunscreens: great to have backups for your bag and the gym.` });
  }

  const treat = products.filter((p) => perProduct[p.id].role === 'treat');
  const total = treat.reduce((s, p) => s + perProduct[p.id].irritation, 0);
  const overload = total > profile.tolerance * 1.5 && treat.length >= 2
    ? { total: Math.round(total * 10) / 10, tolerance: profile.tolerance, text: 'Using all your actives every day would be too much for your skin. Build a routine from your shelf to spread them across the week.' }
    : null;

  return { perProduct, clashes, reassurances, duplicates, overload, profile };
}

// ---------- build ----------

function pickBest(list, profile, prefer = () => 0) {
  return list
    .map((p) => {
      const issues = productIssues(p, profile);
      let s = -issues.filter((i) => i.level === 'warn').length * 2 - issues.filter((i) => i.level === 'info').length * 0.3;
      if (p.types && p.types.includes(profile.skinType)) s += 1;
      if (p.sensitive && profile.sensitivity >= 2) s += 0.5;
      s += prefer(p);
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}

export function buildFromShelf(products, answers, opts = {}) {
  const profile = buildProfile(answers || {});
  products = prep(products, profile);
  const analysis = analyseShelf(products, profile);
  const unused = [];
  const gaps = [];
  const bench = (p, reason) => unused.push({ id: p.id, name: p.name, reason });

  const usable = [];
  for (const p of products) {
    const unsafe = analysis.perProduct[p.id].issues.filter((i) => i.level === 'unsafe');
    if (unsafe.length) bench(p, unsafe[0].text);
    else usable.push(p);
  }
  const byRole = (r) => usable.filter((p) => analysis.perProduct[p.id].role === r);
  const strongIn = (p) => realActives(p).some((a) => STRONG.includes(BY_ID[a].group));

  // Essentials
  const chosenBase = {};
  const cleansers = pickBest(byRole('cleanse'), profile, (p) => (strongIn(p) ? -1 : 0));
  if (cleansers.length) { chosenBase.cleanse = cleansers[0]; cleansers.slice(1).forEach((p) => bench(p, `You’re using ${cleansers[0].name} as your cleanser.`)); }
  else gaps.push({ key: 'cleanse', title: 'A gentle cleanser', examples: pickExamples({ cats: ['cleanser'], excludeStrong: true }, profile) });

  const oilers = pickBest(byRole('oilcleanse'), profile);
  if (profile.doubleCleanse) {
    if (oilers.length) { chosenBase.oilcleanse = oilers[0]; oilers.slice(1).forEach((p) => bench(p, `You’re using ${oilers[0].name} for your first cleanse.`)); }
    else gaps.push({ key: 'oilcleanse', title: 'An oil cleanser or micellar water for makeup and sunscreen', examples: pickExamples({ cats: ['oil-cleanser'] }, profile) });
  } else {
    oilers.forEach((p) => bench(p, 'Only needed on days you wear heavy makeup or water-resistant sunscreen.'));
  }

  const moist = pickBest(byRole('moisturize'), profile);
  if (moist.length) {
    const light = ['gel', 'fluid', 'lotion', 'water', 'serum', 'essence'];
    const am = pickBest(moist, profile, (p) => (light.includes(p.texture) ? 0.6 : 0))[0];
    const pm = moist.length > 1 ? pickBest(moist.filter((p) => p !== am), profile, (p) => (['cream', 'rich', 'balm'].includes(p.texture) ? 0.6 : 0))[0] : am;
    chosenBase.amMoist = am;
    chosenBase.pmMoist = pm;
    moist.filter((p) => p !== am && p !== pm).forEach((p) => bench(p, 'You already have your day and night moisturisers covered.'));
  } else {
    gaps.push({ key: 'moisturize', title: 'A moisturiser', examples: pickExamples({ cats: ['moisturizer'], excludeStrong: true }, profile) });
  }

  const spfs = pickBest(byRole('spf'), profile, (p) => (profile.prefs.has('mineral') && !(p.actives || []).includes('spf-chemical') ? 1 : 0));
  if (spfs.length) { chosenBase.spf = spfs[0]; spfs.slice(1).forEach((p) => bench(p, 'A good backup: keep it in your bag or gym kit for reapplying.')); }
  else gaps.push({ key: 'spf', title: 'A daily sunscreen (SPF 50+, PA++++)', examples: pickExamples({ cats: ['sunscreen'], lighter: true }, profile) });

  const toners = pickBest(byRole('toner'), profile);
  if (toners.length && profile.steps !== 'minimal') chosenBase.toner = toners[0];
  toners.filter((p) => p !== chosenBase.toner).forEach((p) => bench(p, profile.steps === 'minimal' ? 'Skipped to keep your routine to 3 steps.' : 'One toner is enough.'));

  // Treatments
  const treat = byRole('treat').map((p) => {
    const acts = realActives(p);
    let best = { score: -Infinity, helps: [] };
    for (const a of acts) {
      const s = scoreActive(a, profile);
      if (s.score > best.score) best = s;
    }
    const warns = analysis.perProduct[p.id].issues.filter((i) => i.level === 'warn').length;
    return { p, primary: primaryActive(p), score: (best.score === -Infinity ? 0 : best.score) - warns, helps: best.helps };
  }).sort((a, b) => b.score - a.score);

  const limit = maxActives(profile);
  const usedGroups = new Set();
  const chosenTreat = [];
  for (const t of treat) {
    const g0 = t.primary && BY_ID[t.primary] ? BY_ID[t.primary].group : 'other';
    const g = g0 === 'retinoid-alt' ? 'retinoid' : g0;
    const isStrongGroup = SINGLE_GROUPS.includes(g) || g === 'retinoid';
    if (t.score < 1) { bench(t.p, 'Doesn’t target your concerns much; fine to use up, but not needed.'); continue; }
    if (isStrongGroup && usedGroups.has(g)) {
      const winner = chosenTreat.find((c) => (BY_ID[c.primary] && (BY_ID[c.primary].group === g || (g === 'retinoid' && BY_ID[c.primary].group === 'retinoid-alt'))));
      bench(t.p, `${winner ? winner.p.name : 'Another product'} already does this job. Keep this one for when it runs out.`);
      continue;
    }
    if (chosenTreat.length >= limit) { bench(t.p, 'Your routine is full at your chosen number of steps.'); continue; }
    usedGroups.add(g);
    chosenTreat.push(t);
  }

  // Is the top concern covered?
  if (profile.top && !chosenTreat.some((t) => realActives(t.p).some((a) => (BY_ID[a].concerns[profile.top] || 0) >= 2))) {
    const rec = chooseActives(profile).chosen.find((c) => (BY_ID[c.id].concerns[profile.top] || 0) >= 2);
    if (rec) {
      gaps.push({
        key: 'treat-' + rec.id,
        title: `Something for your ${helpsText([profile.top])}: ${BY_ID[rec.id].name.toLowerCase()}`,
        why: BY_ID[rec.id].does,
        examples: pickExamples({ cats: ['serum', 'treatment', 'exfoliant', 'toner', 'moisturizer'], requireAny: [rec.id], treatment: true }, profile),
      });
    }
  }

  const items = chosenTreat.map((t) => itemForActive(t.primary || 'niacinamide', profile, {
    productId: t.p.id,
    title: t.p.name,
    actives: realActives(t.p).concat((t.p.actives || []).filter((x) => x === 'peel')),
    irritation: productIrritation(t.p),
    helps: t.helps,
    score: t.score,
  }));

  // Owned masks and washes become weekly extras.
  const extras = [];
  for (const p of byRole('mask')) {
    const mt = maskTypeOf(p);
    const oilyish = profile.skinType === 'oily' || profile.skinType === 'combination';
    if (mt === 'clay' && !oilyish) { bench(p, 'Clay masks can over-dry your skin type; use only on an oily T-zone.'); continue; }
    if (mt === 'peel' && (profile.sensitivity >= 2 || profile.tolerance < 3)) { bench(p, 'Too strong for your skin right now.'); continue; }
    extras.push({ key: 'p:' + p.id, kind: 'mask', maskType: mt, productId: p.id, title: p.name, actives: realActives(p).concat((p.actives || []).filter((x) => x === 'peel')),
      slots: ['pm'], freq: mt === 'hydrating' && profile.skinType === 'dry' ? 2 : 1, minFreq: 1, irritation: mt === 'peel' ? 2.5 : 0.3, extra: true, order: mt === 'hydrating' ? 85 : 26, helps: [] });
  }
  const fungal = profile.acneTypes.includes('fungal') || profile.conditions.includes('fungal') || profile.conditions.includes('sebderm');
  for (const p of byRole('wash')) {
    if (!fungal) { bench(p, 'Only useful for fungal acne or flaky redness.'); continue; }
    extras.push({ ...itemForActive('zpt', profile, { productId: p.id, title: p.name }), extra: true, kind: 'wash', order: 24 });
  }

  const routine = assemble(profile, items, { source: 'shelf', extras, gaps, unused, startDate: opts.startDate });

  // Point the base steps at the owned products.
  const link = { 'am-cleanse': chosenBase.cleanse, 'pm-cleanse': chosenBase.cleanse, 'pm-oilcleanse': chosenBase.oilcleanse,
    'am-moisturize': chosenBase.amMoist, 'pm-moisturize': chosenBase.pmMoist, 'am-spf': chosenBase.spf };
  for (const s of routine.steps) {
    const p = link[s.key];
    if (p) { s.productId = p.id; s.examples = []; }
    else if (s.base && ['am-cleanse', 'pm-cleanse', 'am-moisturize', 'pm-moisturize', 'am-spf', 'pm-oilcleanse'].includes(s.key)) s.gap = true;
    if (s.kind === 'spot') {
      const owned = byRole('spot')[0];
      if (owned) { s.productId = owned.id; s.examples = []; }
    }
  }
  if (chosenBase.toner) {
    const t = chosenBase.toner;
    for (const slot of ['am', 'pm']) {
      if (!routine.steps.some((s) => s.key === slot + '-toner')) {
        routine.steps.push({ key: slot + '-toner', slot, kind: 'toner', base: true, optional: true, order: 28, title: 'Toner / essence', freq: 7,
          days: [0, 1, 2, 3, 4, 5, 6], actives: [], productId: t.id, examples: [], why: ['From your shelf. Pat in after cleansing.'], lookFor: '' });
      } else {
        const s = routine.steps.find((x) => x.key === slot + '-toner');
        s.productId = t.id; s.examples = [];
      }
    }
  }
  byRole('spot').slice(1).forEach((p) => bench(p, 'Keep for spots as needed.'));
  routine.analysis = { clashes: analysis.clashes, duplicates: analysis.duplicates, overload: analysis.overload };
  return routine;
}
