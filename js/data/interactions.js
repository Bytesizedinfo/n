// Rules for pairs of ingredients.
// a / b match an ingredient id, a group ("retinoid") or a group:sub ("exfoliant:aha").
// level:
//   'avoid'    don't use both; pick one
//   'separate' never in the same routine (put one AM and one PM, or on different nights)
//   'caution'  OK together if your skin is happy; treated as 'separate' for sensitive skin
//   'good'     works well together
//   'fine'     fine together (a common myth says otherwise)

import { BY_ID } from './ingredients.js';

export const LEVEL_RANK = { avoid: 4, separate: 3, caution: 2, fine: 1, good: 0 };

export const RULES = [
  { a: 'retinoid', b: 'retinoid', level: 'avoid',
    why: 'Two retinoids add irritation without adding benefit. Use one.' },
  { a: 'retinoid', b: 'exfoliant:aha', level: 'separate',
    why: 'Both speed up skin turnover. Together they often cause peeling and stinging, so use them on different nights.' },
  { a: 'retinoid', b: 'exfoliant:bha', level: 'separate',
    why: 'Both are strong. Layering them is a fast way to irritate your skin, so alternate nights.' },
  { a: 'retinoid', b: 'exfoliant:peel', level: 'separate',
    why: 'Skip your retinoid the night before and after a strong peel.' },
  { a: 'retinoid', b: 'exfoliant:pha', level: 'caution',
    why: 'PHA is gentle, but stacking it with a retinoid can still be too much for some skin.' },
  { a: 'retinoid', b: 'bpo', level: 'separate',
    why: 'Benzoyl peroxide can break down retinol and tretinoin, and both are drying. Benzoyl peroxide in the morning, retinoid at night.' },
  { a: 'retinoid', b: 'laa', level: 'separate',
    why: 'Pure vitamin C works best in the morning under sunscreen; retinoids belong at night. Keeping them apart also lowers irritation.' },
  { a: 'retinoid', b: 'enzyme', level: 'caution', why: 'Enzymes add more exfoliation on top of a retinoid.' },
  { a: 'retinoid', b: 'sulfur', level: 'caution', why: 'Both are drying. Fine for oily skin, too much for dry or sensitive skin.' },
  { a: 'retinoid', b: 'hq', level: 'caution', why: 'Only combine these if your doctor prescribed them together.' },
  { a: 'retinoid', b: 'niacinamide', level: 'good', why: 'Niacinamide supports the barrier and makes retinoids easier to tolerate.' },
  { a: 'retinoid', b: 'barrier', level: 'good', why: 'Ceramides cushion the dryness retinoids can cause.' },
  { a: 'retinoid', b: 'peptides', level: 'good', why: 'Peptides and retinoids both support firmness without clashing.' },

  { a: 'exfoliant:aha', b: 'exfoliant:bha', level: 'caution',
    why: 'Layering separate AHA and BHA products can over-exfoliate. One exfoliant per night is plenty.' },
  { a: 'exfoliant', b: 'exfoliant', level: 'caution',
    why: 'Two exfoliating products in one routine is a common cause of a damaged barrier.' },
  { a: 'exfoliant', b: 'enzyme', level: 'caution', why: 'Doubling up on exfoliation.' },
  { a: 'exfoliant:peel', b: 'exfoliant', level: 'separate', why: 'Never layer exfoliants with a strong peel.' },

  { a: 'laa', b: 'exfoliant:aha', level: 'separate',
    why: 'Both are acidic; layering them raises irritation. Vitamin C in the morning, acids at night.' },
  { a: 'laa', b: 'exfoliant:bha', level: 'separate',
    why: 'Both are acidic; layering them raises irritation. Vitamin C in the morning, acids at night.' },
  { a: 'laa', b: 'bpo', level: 'separate', why: 'Benzoyl peroxide oxidises vitamin C, so neither works as well.' },
  { a: 'laa', b: 'copper', level: 'separate', why: 'Copper can oxidise pure vitamin C. Vitamin C in the AM, copper peptides at night.' },
  { a: 'vitc', b: 'niacinamide', level: 'fine',
    why: 'The old warning about niacinamide and vitamin C is a myth with modern formulas; they are fine together.' },
  { a: 'vitc', b: 'spf', level: 'good', why: 'Vitamin C under sunscreen adds protection from UV and pollution.' },

  { a: 'copper', b: 'exfoliant', level: 'separate', why: 'Acids can break down copper peptides, and both can irritate together.' },

  { a: 'bpo', b: 'exfoliant', level: 'caution', why: 'Both are drying; together they can over-dry and irritate.' },
  { a: 'bpo', b: 'hq', level: 'separate', why: 'Benzoyl peroxide with hydroquinone can temporarily stain the skin.' },
  { a: 'bpo', b: 'sulfur', level: 'caution', why: 'Both are drying.' },
  { a: 'hq', b: 'exfoliant', level: 'caution', why: 'Only stack exfoliants with hydroquinone if your doctor said so.' },

  { a: 'azelaic', b: 'exfoliant:aha', level: 'caution', why: 'Azelaic acid plus an AHA can sting sensitive skin.' },
  { a: 'azelaic', b: 'niacinamide', level: 'good', why: 'A calming pair for redness and marks.' },
];

export function keysFor(id) {
  const ing = BY_ID[id];
  if (!ing) return [id];
  const keys = [id, ing.group];
  if (ing.sub) keys.push(ing.group + ':' + ing.sub);
  return keys;
}

function matches(ruleKey, keys) {
  return keys.includes(ruleKey);
}

// The most severe rule between two single ingredients (or null).
export function pairRule(idA, idB) {
  if (idA === idB) {
    const g = BY_ID[idA] && BY_ID[idA].group;
    if (g === 'retinoid') return { level: 'avoid', why: 'The same retinoid twice adds irritation without adding benefit.' };
    if (g === 'exfoliant') return { level: 'caution', why: 'The same acid twice in one routine doubles the exfoliation.' };
    return null;
  }
  const ka = keysFor(idA);
  const kb = keysFor(idB);
  let best = null;
  for (const r of RULES) {
    const hit = (matches(r.a, ka) && matches(r.b, kb)) || (matches(r.a, kb) && matches(r.b, ka));
    if (!hit) continue;
    if (!best || LEVEL_RANK[r.level] > LEVEL_RANK[best.level]) best = r;
  }
  return best;
}

// caution becomes separate for sensitive skin (sensitivity 0–3)
export function effectiveLevel(level, sensitivity = 0) {
  if (level === 'caution' && sensitivity >= 2) return 'separate';
  return level;
}

// All rules between two lists of ingredient ids.
export function conflictsBetween(listA, listB, sensitivity = 0) {
  const out = [];
  for (const a of listA) {
    for (const b of listB) {
      const r = pairRule(a, b);
      if (!r) continue;
      out.push({ a, b, level: effectiveLevel(r.level, sensitivity), baseLevel: r.level, why: r.why });
    }
  }
  return out;
}

// True when two items (lists of actives) must not share a routine.
export function mustSeparate(listA, listB, sensitivity = 0) {
  return conflictsBetween(listA, listB, sensitivity).some((c) => c.level === 'avoid' || c.level === 'separate');
}
