// Turn raw quiz answers into a profile the engine can reason about.

import { CONCERNS, INGREDIENTS } from '../data/ingredients.js';

const arr = (v) => (Array.isArray(v) ? v.filter((x) => x !== 'none') : []);

export function buildProfile(answers = {}) {
  const a = answers;
  const skinType = a.skinType || 'normal';
  const sensitivity = clamp(parseInt(a.sensitivity ?? '1', 10) || 0, 0, 3);
  const conditions = arr(a.conditions);
  const rx = arr(a.rx);
  const triggers = arr(a.triggers);
  const prefs = new Set(arr(a.prefs));
  const env = arr(a.environment);
  const lifestyle = arr(a.lifestyle);

  // ----- concerns, weighted -----
  const picked = arr(a.concerns).filter((c) => c !== 'maintain' && CONCERNS[c]);
  const top = a.topConcern && picked.includes(a.topConcern) ? a.topConcern : picked[0] || null;
  const concerns = {};
  for (const c of picked) concerns[c] = c === top ? 3 : 1.5;
  // Skin type adds a gentle background weight.
  if (skinType === 'oily') concerns.oiliness = Math.max(concerns.oiliness || 0, 0.8);
  if (skinType === 'dry') concerns.dryness = Math.max(concerns.dryness || 0, 1);
  if (a.dehydrated === 'yes') concerns.dryness = Math.max(concerns.dryness || 0, 1);
  if (arr(a.pigmentType).includes('melasma')) concerns.melasma = Math.max(concerns.melasma || 0, concerns.pigment || 1.5);
  if (sensitivity >= 2 || conditions.includes('rosacea')) concerns.redness = Math.max(concerns.redness || 0, 1);

  const acneTypes = arr(a.acneType);
  const acneSeverity = { few: 0, some: 1, many: 2, scarring: 3 }[a.acneSeverity] ?? 0;

  // ----- safety -----
  const pregnancy = a.pregnancy && a.pregnancy !== 'none' ? a.pregnancy : null;
  const barrierDamaged = a.barrier === 'damaged';

  // ----- tolerance: how much irritation one routine can carry -----
  let tolerance = [4, 3, 2.1, 1.4][sensitivity];
  if (a.pace === 'gentle') tolerance -= 0.4;
  if (a.pace === 'fast') tolerance += 0.5;
  if (a.retinoidExp === 'irritated') tolerance -= 0.3;
  if (skinType === 'dry') tolerance -= 0.2;
  if (conditions.includes('rosacea') || conditions.includes('eczema') || conditions.includes('perioral')) tolerance = Math.min(tolerance, 2);
  if (rx.includes('isotretinoin')) tolerance = Math.min(tolerance, 1);
  if (a.age === 'teen') tolerance = Math.min(tolerance, 3);
  tolerance = Math.max(1, round1(tolerance));

  // ----- ingredients to avoid (ids or groups) -----
  const avoid = new Set();
  const triggerMap = {
    fragrance: ['fragrance', 'fragrance-allergen'], eo: ['eo', 'teatree'], alcohol: ['alcohol'],
    acids: ['glycolic', 'lactic', 'mandelic', 'aha', 'salicylic', 'betaine-sal', 'lha', 'peel'],
    retinoids: ['tretinoin', 'adapalene', 'retinal', 'retinol', 'hpr', 'retinyl'],
    bpo: ['bpo'], vitc: ['laa'], niacinamide: ['niacinamide'],
  };
  for (const t of triggers) (triggerMap[t] || []).forEach((id) => avoid.add(id));
  const avoidText = (a.avoidText || '').toLowerCase().split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  for (const word of avoidText) {
    for (const ing of INGREDIENTS) {
      if (ing.name.toLowerCase().includes(word) || ing.aliases.some((al) => al === word || al.includes(word))) avoid.add(ing.id);
    }
  }
  const avoidWords = avoidText; // matched against pasted ingredient lists too

  const steps = a.steps || 'moderate';
  const makeup = a.makeup || 'none';
  const doubleCleanse = makeup === 'full' || makeup === 'longwear' || (env.includes('outdoors') && a.spfHabit === 'daily') || env.includes('sweat') && makeup !== 'none';

  const referrals = [];
  if (acneTypes.includes('cystic') || acneSeverity >= 3) referrals.push('Deep, painful or scarring acne responds best to prescription treatment. A GP or dermatologist can help, and starting early prevents scars.');
  else if (acneSeverity >= 2) referrals.push('If your breakouts haven’t improved after 12 weeks on this routine, see a GP or dermatologist; prescription options work well.');
  if (acneTypes.includes('hormonal')) referrals.push('Jawline acne that tracks your cycle may respond to hormonal treatment. Worth asking a doctor if topical care isn’t enough.');
  if (arr(a.rednessType).includes('persistent')) referrals.push('Constant redness or visible veins often need laser or prescription care (e.g. for rosacea). A dermatologist can confirm.');
  if (arr(a.rednessType).includes('flush') && !conditions.includes('rosacea')) referrals.push('Frequent flushing can be early rosacea. Consider having a doctor take a look.');
  if (arr(a.pigmentType).includes('melasma')) referrals.push('Melasma is stubborn; if it hasn’t improved in 3 months, a dermatologist can add prescription options.');
  if (conditions.includes('psoriasis')) referrals.push('Facial psoriasis should be managed with your doctor; this routine keeps things gentle around it.');
  if (rx.includes('steroid')) referrals.push('Long-term steroid cream on the face can thin the skin and cause perioral dermatitis. Check with your doctor about how long to use it.');
  if (barrierDamaged) referrals.push('If your skin still stings after 4 weeks of the gentle repair phase, see a doctor to rule out eczema or dermatitis.');

  return {
    answers: a,
    skinType,
    dehydrated: a.dehydrated === 'yes' || a.dehydrated === 'sometimes',
    age: a.age || '20s',
    concerns,
    top,
    picked,
    acneTypes,
    acneSeverity,
    pigmentTypes: arr(a.pigmentType),
    rednessTypes: arr(a.rednessType),
    sensitivity,
    barrierDamaged,
    tolerance,
    pace: a.pace || 'balanced',
    pregnancy,
    rx,
    conditions,
    triggers,
    avoid,
    avoidWords,
    climate: a.climate || 'tropical',
    env,
    lifestyle,
    makeup,
    spfHabit: a.spfHabit || 'sometimes',
    doubleCleanse,
    steps,
    budget: a.budget || 'mid',
    texture: a.texture || 'any',
    prefs,
    retinoidExp: a.retinoidExp || 'never',
    currentActives: arr(a.currentActives),
    referrals,
    wantsFragranceFree: prefs.has('ff') || sensitivity >= 2 || triggers.includes('fragrance') || conditions.includes('rosacea') || conditions.includes('eczema'),
    avoidsEO: triggers.includes('eo') || sensitivity >= 2 || conditions.includes('rosacea') || conditions.includes('eczema') || conditions.includes('perioral'),
    avoidsAlcohol: prefs.has('alcoholfree') || triggers.includes('alcohol') || skinType === 'dry' || sensitivity >= 2 || conditions.includes('rosacea') || conditions.includes('eczema'),
    acneProne: picked.includes('acne') || picked.includes('pores'),
  };
}

function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
function round1(n) { return Math.round(n * 10) / 10; }

// Step budget per routine.
export function stepCaps(profile) {
  const caps = { minimal: { am: 3, pm: 3 }, moderate: { am: 4, pm: 5 }, full: { am: 6, pm: 7 } }[profile.steps] || { am: 4, pm: 5 };
  return { ...caps };
}
