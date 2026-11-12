// Which actives are safe for this person, and how well each fits their concerns.

import { BY_ID, CANDIDATES, CONCERN_SHORT, SINGLE_GROUPS } from '../data/ingredients.js';

const RETINOID_FAMILY = ['retinoid', 'retinoid-alt'];

// Is one ingredient OK for this profile? opts.washOff: the ingredient is in a rinse-off cleanser.
export function eligibility(id, profile, opts = {}) {
  const ing = BY_ID[id];
  if (!ing) return { ok: true };
  const g = ing.group;
  const p = profile;
  const no = (reason) => ({ ok: false, reason });

  if (p.avoid.has(id)) return no('You’ve reacted to this before, or asked to avoid it.');
  if (ing.rx === 'doctor' && !(id === 'tretinoin' && p.rx.includes('tretinoin')) && !(id === 'hydroquinone' && p.rx.includes('hq'))) {
    return no('Prescription-only in Singapore; only use it if your doctor prescribed it.');
  }
  if (p.pregnancy) {
    if (ing.pregnancy === 'avoid') return no('Not recommended while pregnant, trying to conceive or breastfeeding.');
    if (ing.pregnancy === 'caution' && !opts.washOff) return no('Limited safety data in pregnancy, so it’s left out to be safe (check with your doctor).');
  }
  if (p.rx.includes('isotretinoin') && (RETINOID_FAMILY.includes(g) || ['exfoliant', 'bpo', 'sulfur', 'enzyme'].includes(g) || id === 'laa')) {
    return no('Oral isotretinoin already does the heavy lifting and makes skin fragile; keep everything else gentle.');
  }
  if (p.rx.includes('tretinoin')) {
    if (g === 'retinoid' && id !== 'tretinoin') return no('You already use prescription tretinoin, so no second retinoid.');
    if (g === 'retinoid-alt') return no('Not needed alongside your tretinoin.');
    if (g === 'exfoliant' && ing.sub !== 'pha' && !opts.washOff) return no('Tretinoin already exfoliates; adding acids is usually too much (ask your doctor first).');
  }
  const c = p.conditions;
  if (c.includes('rosacea')) {
    if (g === 'exfoliant' && !['pha'].includes(ing.sub) && !opts.washOff) return no('Exfoliating acids often flare rosacea.');
    if (id === 'bpo') return no('Benzoyl peroxide often flares rosacea.');
    if (g === 'retinoid' && id !== 'hpr' && id !== 'tretinoin') return no('Strong retinoids often flare rosacea; a gentle one may be OK later.');
    if (id === 'laa' && p.sensitivity >= 2) return no('Pure vitamin C stings rosacea-prone skin; a gentle derivative is used instead.');
  }
  if (c.includes('eczema')) {
    if (g === 'exfoliant' && ing.sub !== 'pha' && !opts.washOff) return no('Acids tend to aggravate eczema.');
    if (['bpo', 'sulfur'].includes(g)) return no('Too drying for eczema-prone skin.');
    if (g === 'retinoid' && id !== 'hpr' && id !== 'tretinoin') return no('Strong retinoids tend to aggravate eczema.');
    if (id === 'laa') return no('Pure vitamin C often stings eczema-prone skin.');
  }
  if (c.includes('perioral')) {
    if (RETINOID_FAMILY.includes(g) && id !== 'tretinoin') return no('Retinoids can aggravate perioral dermatitis; keep things minimal until it settles.');
    if (g === 'exfoliant' || g === 'bpo') return no('Keep perioral dermatitis calm: no exfoliants for now.');
  }
  if (p.sensitivity >= 3 && ['glycolic', 'peel', 'retinal', 'adapalene'].includes(id)) {
    return no('Too strong for very reactive skin.');
  }
  if (p.age === 'teen' && ['retinal', 'copper'].includes(id)) return no('Not needed at your age.');
  return { ok: true };
}

const ADJUST = [
  // [condition(profile) => bool, { id: delta }]
  [(p) => p.acneTypes.includes('comedonal'), { salicylic: 2, adapalene: 2, retinol: 1, retinal: 1, hpr: 0.8 }],
  [(p) => p.acneTypes.includes('inflamed'), { bpo: 2, azelaic: 1, adapalene: 1 }],
  [(p) => p.acneTypes.includes('hormonal'), { adapalene: 1, retinol: 0.5, azelaic: 1, bpo: 0.5 }],
  [(p) => p.acneTypes.includes('fungal') || p.conditions.includes('fungal'), { sulfur: 3, salicylic: 1, bpo: -2, adapalene: -0.5, retinol: -0.5 }],
  [(p) => p.acneTypes.length > 0 && p.acneTypes.every((t) => t === 'fungal'), { adapalene: -3, retinol: -2, retinal: -2, bpo: -1 }],
  [(p) => p.acneSeverity >= 2, { bpo: 0.7, adapalene: 0.7 }],
  [(p) => p.pigmentTypes.includes('pih'), { azelaic: 1, niacinamide: 0.5, mandelic: 0.7, adapalene: 0.3 }],
  [(p) => p.pigmentTypes.includes('sun'), { laa: 1, retinol: 0.5, retinal: 0.5, glycolic: 0.5 }],
  [(p) => p.pigmentTypes.includes('melasma'), { tranexamic: 2, azelaic: 1.5, arbutin: 0.5, 'vitc-deriv': 0.5 }],
  [(p) => p.rednessTypes.includes('flush') || p.conditions.includes('rosacea'), { azelaic: 2, niacinamide: 0.5, sulfur: 0.3 }],
  [(p) => p.rednessTypes.includes('patches') || p.conditions.includes('sebderm'), { azelaic: 1, sulfur: 0.5 }],
  [(p) => p.skinType === 'dry', { lactic: 0.7, pha: 0.5, salicylic: -0.7, bpo: -0.5, sulfur: -0.5, glycolic: -0.3 }],
  [(p) => p.skinType === 'oily', { salicylic: 0.7, niacinamide: 0.5, lactic: -0.3 }],
  [(p) => ['tolerated', 'current'].includes(p.retinoidExp), { retinal: 0.8, adapalene: 0.3, retinol: 0.2 }],
  [(p) => p.retinoidExp === 'never', { retinol: 0.3, retinal: -0.5 }],
  [(p) => p.retinoidExp === 'irritated', { hpr: 1.2, retinol: -0.6, retinal: -1, adapalene: -0.8 }],
  [(p) => p.sensitivity >= 2, { hpr: 0.6, mandelic: 0.5, pha: 0.5, 'vitc-deriv': 0.6, laa: -0.4 }],
  [(p) => ['30s', '40s', '50+'].includes(p.age) && (p.concerns.lines || p.concerns.firmness), { retinal: 0.3, peptides: 0.3 }],
  [(p) => ['teen', '20s'].includes(p.age) && p.top === 'acne', { adapalene: 0.8 }],
  [(p) => !!p.pregnancy, { bakuchiol: 1, azelaic: 1 }],
  [(p) => p.currentActives.includes('bha'), { salicylic: 0.3 }],
  [(p) => p.currentActives.includes('aha'), { glycolic: 0.2, lactic: 0.2 }],
  [(p) => p.currentActives.includes('vitc'), { laa: 0.3 }],
  [(p) => p.currentActives.includes('azelaic'), { azelaic: 0.3 }],
];

// How well one active fits; higher is better. Returns { score, helps: [concern keys] }.
export function scoreActive(id, profile) {
  const ing = BY_ID[id];
  if (!ing) return { score: 0, helps: [] };
  const contributions = [];
  let score = 0;
  for (const [c, w] of Object.entries(profile.concerns)) {
    const v = ing.concerns[c] || 0;
    if (!v) continue;
    score += w * v;
    contributions.push([c, w * v]);
  }
  for (const [cond, deltas] of ADJUST) {
    if (deltas[id] !== undefined && cond(profile)) score += deltas[id];
  }
  const melasma = profile.pigmentTypes.includes('melasma') || profile.concerns.melasma;
  const penaltyRate = (0.15 + profile.sensitivity * 0.35) * (melasma ? 1.5 : 1) * (profile.pace === 'gentle' ? 1.2 : 1);
  score -= ing.irritation * penaltyRate;
  if (ing.irritation > profile.tolerance + 0.01) score -= 3;
  contributions.sort((a, b) => b[1] - a[1]);
  return { score: Math.round(score * 100) / 100, helps: contributions.slice(0, 3).map((x) => x[0]) };
}

export function maxActives(profile) {
  return { minimal: 2, moderate: 3, full: 5 }[profile.steps] || 3;
}

// Pick the actives for a routine.
export function chooseActives(profile) {
  const ranked = [];
  const excluded = [];
  for (const id of CANDIDATES) {
    const el = eligibility(id, profile);
    const s = scoreActive(id, profile);
    if (!el.ok) {
      if (s.score >= 3) excluded.push({ id, reason: el.reason, score: s.score });
      continue;
    }
    ranked.push({ id, ...s });
  }
  ranked.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const limit = maxActives(profile);
  const threshold = profile.picked.length ? 2 : 1;
  const usedGroups = new Set();
  const chosen = [];
  let freeMerge = 1; // one mergeable active can ride along in a moisturiser
  for (const r of ranked) {
    if (r.score < threshold) break;
    const g = BY_ID[r.id].group;
    const family = RETINOID_FAMILY.includes(g) ? 'retinoid' : g;
    if (SINGLE_GROUPS.includes(family) || family === 'retinoid') {
      if (usedGroups.has(family)) continue;
    }
    if (chosen.length >= limit) {
      if (BY_ID[r.id].mergeable && freeMerge > 0) { freeMerge--; } else continue;
    }
    usedGroups.add(family);
    chosen.push(r);
  }

  // Make sure the top concern is actually treated.
  if (profile.top && !chosen.some((c) => (BY_ID[c.id].concerns[profile.top] || 0) >= 2)) {
    const best = ranked.find((r) => (BY_ID[r.id].concerns[profile.top] || 0) >= 2 && !chosen.includes(r)
      && !usedGroups.has(RETINOID_FAMILY.includes(BY_ID[r.id].group) ? 'retinoid' : BY_ID[r.id].group));
    if (best) {
      if (chosen.length >= limit) chosen.pop();
      chosen.push(best);
    }
  }
  chosen.sort((a, b) => b.score - a.score);
  return { chosen, ranked, excluded };
}

export function helpsText(helps) {
  const names = helps.map((c) => CONCERN_SHORT[c]).filter(Boolean);
  if (!names.length) return '';
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
}
