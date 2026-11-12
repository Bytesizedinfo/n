// Build a full routine (AM, PM, weekly, ramp-up, reasons, example products).

import { BY_ID, CONCERN_SHORT } from '../data/ingredients.js';
import { buildProfile, stepCaps } from './profile.js';
import { chooseActives, helpsText } from './select.js';
import { schedule, freqLabel } from './scheduler.js';
import { rampPlan, phasesFrom, weekLabel } from './rampup.js';
import { pickExamples } from './examples.js';
import { todayStr, daysBetween, weekdayMon0 } from './dates.js';

export const ROUTINE_VERSION = 1;

const ORDER = {
  oilcleanse: 10, cleanse: 20, wash: 24, maskrinse: 26, toner: 28,
  exfoliant: 30, laa: 40, 'vitc-deriv': 42, niacinamide: 50, brightener: 52, peptides: 54, copper: 55,
  azelaic: 60, bpo: 62, retinoid: 64, 'retinoid-alt': 66, sulfur: 26, hq: 63, rx: 61,
  moisturize: 80, sleepmask: 85, spf: 90, spot: 95,
};

const TITLES = {
  tretinoin: 'Tretinoin (your prescription)',
  adapalene: 'Adapalene 0.1% gel', retinal: 'Retinal serum', retinol: 'Retinol serum', hpr: 'Gentle retinoid (HPR)', retinyl: 'Retinyl serum',
  bakuchiol: 'Bakuchiol serum', salicylic: 'BHA exfoliant (salicylic acid)', glycolic: 'AHA exfoliant (glycolic acid)',
  lactic: 'AHA exfoliant (lactic acid)', mandelic: 'Mandelic acid exfoliant', pha: 'PHA exfoliating toner', bpo: 'Benzoyl peroxide 2.5%',
  laa: 'Vitamin C serum', 'vitc-deriv': 'Gentle vitamin C serum', azelaic: 'Azelaic acid', niacinamide: 'Niacinamide serum',
  tranexamic: 'Tranexamic acid serum', arbutin: 'Alpha arbutin serum', sulfur: 'Sulfur mask (10 minutes)', peptides: 'Peptide serum',
  copper: 'Copper peptide serum', zpt: 'Anti-fungal wash (5-minute mask)', hydroquinone: 'Hydroquinone (your prescription)',
};

const LOOK_FOR = {
  adapalene: 'Adapalene 0.1% gel (Differin); ask the pharmacist',
  retinal: 'Retinal (retinaldehyde) 0.05–0.1%',
  hpr: 'Hydroxypinacolone retinoate (HPR / granactive) 2%',
  bakuchiol: 'Bakuchiol 0.5–1%',
  salicylic: 'Salicylic acid 2%, leave-on liquid or gel',
  glycolic: 'Glycolic acid 5–8% toner or serum',
  lactic: 'Lactic acid 5–10%',
  mandelic: 'Mandelic acid 5–10%',
  pha: 'Gluconolactone or lactobionic acid (PHA) toner',
  bpo: 'Benzoyl peroxide 2.5% gel (higher strengths irritate more without working better)',
  'vitc-deriv': 'Ascorbyl glucoside, sodium ascorbyl phosphate or ethyl ascorbic acid',
  azelaic: 'Azelaic acid 10% (15–20% needs a prescription)',
  niacinamide: 'Niacinamide 4–10% (higher can irritate)',
  tranexamic: 'Tranexamic acid 2–5%',
  arbutin: 'Alpha arbutin 1–2%',
  sulfur: 'Sulfur 3–10% mask or spot treatment',
  peptides: 'Multi-peptide serum (e.g. matrixyl, argireline)',
  copper: 'Copper peptide (GHK-Cu) serum',
  zpt: '2% ketoconazole or zinc pyrithione wash/shampoo',
};

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function uid() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }

// ---------- treatment items ----------

function slotsFor(id, p) {
  const g = BY_ID[id].group;
  if (g === 'retinoid' || id === 'copper' || id === 'sulfur' || id === 'hydroquinone') return ['pm'];
  if (g === 'exfoliant') {
    if (id === 'pha' || ((id === 'salicylic' || id === 'betaine-sal') && (p.skinType === 'oily' || p.skinType === 'combination'))) return ['pm', 'am'];
    return ['pm'];
  }
  if (id === 'bpo' || id === 'laa' || id === 'vitc-deriv') return ['am', 'pm'];
  if (id === 'peptides' || id === 'bakuchiol' || id === 'zpt') return ['pm', 'am'];
  return ['am', 'pm'];
}

function targetFreq(id, p) {
  const t = p.tolerance;
  switch (id) {
    case 'tretinoin': return 7;
    case 'hydroquinone': return 7;
    case 'adapalene': case 'retinol': return t >= 3.2 ? 7 : t >= 2.4 ? 5 : t >= 1.8 ? 4 : 3;
    case 'retinal': return t >= 3.5 ? 7 : t >= 2.6 ? 5 : t >= 2 ? 4 : 3;
    case 'hpr': return t >= 2 ? 7 : 5;
    case 'retinyl': return 7;
    case 'bakuchiol': return 7;
    case 'salicylic': case 'betaine-sal': case 'lha':
      return (p.skinType === 'oily' || p.skinType === 'combination') && p.acneProne ? (t >= 3 ? 4 : t >= 2 ? 3 : 2) : 2;
    case 'glycolic': case 'aha': return t >= 3 ? 3 : t >= 2 ? 2 : 1;
    case 'lactic': return t >= 2.5 ? 3 : 2;
    case 'mandelic': return t >= 2 ? 3 : 2;
    case 'pha': return t >= 2 ? 4 : 3;
    case 'bpo': return p.sensitivity >= 2 ? 4 : 7;
    case 'sulfur': return 3;
    case 'copper': return 4;
    case 'zpt': return 3;
    default: return 7;
  }
}

function minFreqFor(id) {
  const g = BY_ID[id] ? BY_ID[id].group : '';
  if (g === 'retinoid') return 2;
  if (g === 'exfoliant' || id === 'sulfur' || id === 'zpt' || id === 'copper') return 1;
  return 3;
}

function rampTypeFor(id, p) {
  const ing = BY_ID[id];
  if (!ing) return null;
  if (['adapalene', 'retinol', 'retinal'].includes(id)) return 'retinoid';
  if (id === 'hpr') return 'retinoid-gentle';
  if (ing.group === 'exfoliant') return id === 'pha' ? (p.sensitivity >= 2 ? 'gentle-start' : null) : 'exfoliant';
  if (id === 'bpo') return 'bpo';
  if (id === 'laa' && p.sensitivity >= 1) return 'gentle-start';
  if (id === 'azelaic' && p.sensitivity >= 2) return 'gentle-start';
  return null;
}

function orderFor(id) {
  const ing = BY_ID[id];
  if (!ing) return 60;
  if (ORDER[id] !== undefined) return ORDER[id];
  if (ORDER[ing.group] !== undefined) return ORDER[ing.group];
  return 56;
}

export function itemForActive(id, profile, extra = {}) {
  const ing = BY_ID[id];
  return {
    key: extra.productId ? 'p:' + extra.productId : id,
    kind: 'treat',
    primary: id,
    actives: extra.actives || [id],
    productId: extra.productId || null,
    title: extra.title || TITLES[id] || ing.name,
    slots: extra.slots || slotsFor(id, profile),
    freq: extra.freq || targetFreq(id, profile),
    minFreq: minFreqFor(id),
    irritation: extra.irritation ?? ing.irritation,
    ramp: extra.fixed ? null : rampTypeFor(id, profile),
    mergeable: !extra.productId && !!ing.mergeable,
    order: orderFor(id),
    helps: extra.helps || [],
    score: extra.score || 0,
    fixed: !!extra.fixed,
    extra: id === 'sulfur' || !!extra.extra,
  };
}

function prescriptionItems(profile) {
  const out = [];
  if (profile.rx.includes('tretinoin')) out.push(itemForActive('tretinoin', profile, { fixed: true, score: 99 }));
  if (profile.rx.includes('hq')) out.push(itemForActive('hydroquinone', profile, { fixed: true, score: 98 }));
  if (profile.rx.includes('clindamycin')) {
    out.push({ key: 'rx-clinda', kind: 'treat', primary: null, actives: [], title: 'Clindamycin (your prescription)', slots: ['am', 'pm'],
      freq: 7, minFreq: 7, irritation: 0.3, ramp: null, order: ORDER.rx, helps: ['acne'], score: 97, fixed: true });
  }
  return out;
}

function extraItems(profile, chosenIds) {
  const out = [];
  const p = profile;
  const oilyish = p.skinType === 'oily' || p.skinType === 'combination';
  if ((p.acneTypes.includes('fungal') || p.conditions.includes('fungal') || p.conditions.includes('sebderm') || p.rednessTypes.includes('patches'))
    && !p.avoid.has('zpt')) {
    out.push({ ...itemForActive('zpt', p), extra: true, order: ORDER.wash, kind: 'wash' });
  }
  if (oilyish && (p.concerns.oiliness || p.concerns.pores || p.concerns.acne) && p.sensitivity <= 2 && !p.conditions.includes('eczema')) {
    out.push({ key: 'mask-clay', kind: 'mask', maskType: 'clay', title: 'Clay mask (10 minutes, then rinse)', actives: ['clay'], slots: ['pm'], freq: 1,
      minFreq: 1, irritation: 0.3, extra: true, order: ORDER.maskrinse, helps: ['oiliness', 'pores'] });
  }
  if (p.skinType === 'dry' || p.dehydrated || p.env.includes('aircon') || p.concerns.redness || p.barrierDamaged) {
    out.push({ key: 'mask-hydrating', kind: 'mask', maskType: 'hydrating', title: 'Hydrating overnight mask', actives: [], slots: ['pm'],
      freq: p.skinType === 'dry' || p.barrierDamaged ? 2 : 1, minFreq: 1, irritation: 0, extra: true, order: ORDER.sleepmask, helps: ['dryness'] });
  }
  const peelOk = p.steps === 'full' && p.tolerance >= 3.5 && (p.concerns.texture || p.concerns.dullness || p.concerns.pores)
    && !p.pregnancy && !p.rx.length && !p.conditions.length && p.sensitivity === 0 && !p.avoid.has('peel')
    && !chosenIds.some((id) => BY_ID[id].group === 'retinoid');
  if (peelOk) {
    out.push({ key: 'mask-peel', kind: 'mask', maskType: 'peel', title: 'Strong acid peel (max 10 minutes)', actives: ['peel'], slots: ['pm'], freq: 1,
      minFreq: 1, irritation: 2.5, extra: true, order: ORDER.maskrinse, helps: ['texture', 'dullness'] });
  }
  return out;
}

function sortForScheduling(items) {
  const strong = (it) => (it.ramp && it.ramp !== 'gentle-start' ? 1 : 0);
  const plainExtra = (it) => (it.extra && !it.score ? 1 : 0);
  return items.slice().sort((a, b) =>
    (b.fixed ? 1 : 0) - (a.fixed ? 1 : 0)
    || plainExtra(a) - plainExtra(b)
    || Math.round(((b.score || 0) - (a.score || 0)) * 2) / 2
    || strong(b) - strong(a)
    || a.key.localeCompare(b.key));
}

// ---------- public API ----------

export function buildRoutine(answers, opts = {}) {
  const profile = buildProfile(answers);
  const { chosen, excluded } = chooseActives(profile);
  const items = chosen.map((c) => itemForActive(c.id, profile, { score: c.score, helps: c.helps }));
  return assemble(profile, items, { ...opts, source: 'quiz', excluded });
}

// profile: from buildProfile; treatItems: items from itemForActive (or shelf products)
export function assemble(profile, treatItems, opts = {}) {
  const caps = stepCaps(profile);
  const amBase = 3;
  const pmBase = 2 + (profile.doubleCleanse ? 1 : 0);
  const capsT = { am: Math.max(0, caps.am - amBase), pm: Math.max(1, caps.pm - pmBase) };
  const sched = { caps: capsT, tolerance: profile.tolerance, sensitivity: profile.sensitivity };

  let items = prescriptionItems(profile).concat(treatItems);
  // Prescriptions replace the same active from the treatment list.
  const rxPrimaries = new Set(items.filter((i) => i.fixed).map((i) => i.primary));
  items = items.filter((i) => i.fixed || !rxPrimaries.has(i.primary));
  if (capsT.am === 0) items = items.map((it) => (it.slots.includes('pm') && !it.fixed ? { ...it, slots: it.slots.filter((s) => s !== 'am') } : it));
  items = items.concat(opts.extras || extraItems(profile, items.map((i) => i.primary).filter(Boolean)));

  const merged = { am: null, pm: null };
  const warnings = [];
  let ordered = sortForScheduling(items);
  let final = schedule(ordered, sched);

  // Mergeable actives that didn't fit ride along in a moisturiser instead.
  const mergeTargets = ordered.filter((it) => it.mergeable && (!final.placed[it.key] || final.notes.some((n) => n.key === it.key && n.type === 'reduced')));
  if (mergeTargets.length) {
    for (const it of mergeTargets) {
      if (!merged.am) merged.am = it.primary;
      else if (!merged.pm) merged.pm = it.primary;
      else continue;
      ordered = ordered.filter((x) => x.key !== it.key);
    }
    final = schedule(ordered, sched);
  }

  for (const n of final.notes) {
    const it = ordered.find((x) => x.key === n.key);
    if (!it) continue;
    if (n.type === 'dropped') warnings.push(`${it.title} didn’t fit without clashing or overloading your skin, so it’s left out for now.`);
    else if (n.type === 'reduced') warnings.push(`${it.title} is limited to ${n.to}× a week so it stays apart from clashing products and your routine doesn’t get too crowded or irritating.`);
  }

  // Lock each item to the slot it got, with its real frequency.
  const scheduled = ordered.filter((it) => final.placed[it.key]).map((it) => ({
    ...it, slots: [final.placed[it.key].slot], freq: final.placed[it.key].days.length,
  }));

  // Ramp-up phases.
  const plan = rampPlan(scheduled, profile);
  const phaseDefs = phasesFrom(plan);
  const phases = phaseDefs.map((ph) => {
    const phaseItems = scheduled.map((it) => ({ ...it, freq: ph.freqs[it.key] ?? 0 }));
    const res = ph.toWeek === null ? final : schedule(phaseItems, sched);
    return { fromWeek: ph.fromWeek, toWeek: ph.toWeek, label: weekLabel(ph.fromWeek, ph.toWeek), grid: res.grid };
  });
  // The open-ended phase must be the final schedule.
  phases[phases.length - 1].grid = final.grid;

  // ---------- steps ----------
  const steps = [];
  const baseSteps = baseStepsFor(profile, merged, scheduled);
  steps.push(...baseSteps);
  for (const it of scheduled) {
    const placement = final.placed[it.key];
    const isExtra = !!it.extra;
    steps.push({
      key: it.key,
      slot: isExtra ? 'weekly' : placement.slot,
      routineSlot: placement.slot,
      kind: it.kind,
      title: it.title,
      actives: it.actives,
      primary: it.primary,
      productId: it.productId || null,
      order: it.order,
      freq: placement.days.length,
      days: placement.days,
      fixed: !!it.fixed,
      ramp: !!(plan.plans[it.key] && plan.plans[it.key].ladder.length > 1) || (plan.plans[it.key] && plan.plans[it.key].start > 1),
      maskType: it.maskType,
      helps: it.helps || [],
    });
  }
  if (profile.acneProne || profile.picked.includes('acne')) {
    steps.push({ key: 'spot-patch', slot: 'asneeded', kind: 'spot', title: 'Pimple patch on a spot (as needed)', actives: [], order: ORDER.spot, freq: 0, days: [] });
  }

  const photosens = scheduled.some((it) => it.actives.some((a) => BY_ID[a] && BY_ID[a].photosens));
  for (const s of steps) {
    s.why = whyFor(s, profile, { merged, photosens, scheduled });
    s.lookFor = lookForStep(s, profile, merged);
    s.examples = s.productId ? [] : examplesForStep(s, profile, merged);
  }

  // ---------- ramp summary ----------
  const ramp = [];
  for (const it of scheduled) {
    const p = plan.plans[it.key];
    if (!p || (p.ladder.length <= 1 && p.start <= 1)) continue;
    const rows = [];
    if (p.start > 1) rows.push({ label: weekLabel(1, p.start - 1), perWeek: 0, text: plan.repairWeeks && p.start === plan.repairWeeks + 1 ? 'Not yet (barrier repair first)' : 'Not yet: let your skin settle with the previous step first' });
    phases.forEach((ph) => {
      if (ph.toWeek !== null && ph.toWeek < p.start) return;
      const count = ph.grid.reduce((n, cell) => n + (cell[it.slots[0]].includes(it.key) ? 1 : 0), 0);
      const last = rows[rows.length - 1];
      if (last && last.perWeek === count) { last.to = ph.toWeek; last.label = weekLabel(last.from, ph.toWeek); return; }
      rows.push({ from: Math.max(ph.fromWeek, p.start), to: ph.toWeek, perWeek: count, label: weekLabel(Math.max(ph.fromWeek, p.start), ph.toWeek) });
    });
    rows.forEach((r) => { if (!r.text) r.text = r.perWeek ? freqLabel(r.perWeek, it.slots[0]) : 'Not yet'; });
    ramp.push({ key: it.key, title: it.title, rows });
  }

  const notes = globalNotes(profile, scheduled, opts.excluded || [], plan);

  return {
    version: ROUTINE_VERSION,
    id: uid(),
    createdAt: new Date().toISOString(),
    source: opts.source || 'quiz',
    startDate: opts.startDate || todayStr(),
    summary: {
      skinType: profile.skinType, top: profile.top, picked: profile.picked, sensitivity: profile.sensitivity,
      tolerance: profile.tolerance, pregnancy: profile.pregnancy, steps: profile.steps,
    },
    merged,
    steps,
    phases,
    ramp,
    repairWeeks: plan.repairWeeks,
    notes,
    warnings: warnings.concat(opts.warnings || []),
    referrals: profile.referrals,
    excluded: (opts.excluded || []).map((e) => ({ id: e.id, name: BY_ID[e.id].name, reason: e.reason })),
    gaps: opts.gaps || [],
    unused: opts.unused || [],
  };
}

// ---------- base steps ----------

function baseStepsFor(p, merged, scheduled) {
  const steps = [];
  const waterRinse = (p.skinType === 'dry' || (p.skinType === 'normal' && p.sensitivity >= 2)) && !scheduled.some((s) => s.primary === 'bpo' && s.slots[0] === 'am');
  steps.push({ key: 'am-cleanse', slot: 'am', kind: 'cleanse', base: true, order: ORDER.cleanse,
    title: waterRinse ? 'Rinse with water (or a gentle cream cleanser)' : 'Gentle cleanser' });
  if (p.steps === 'full' && (p.skinType === 'dry' || p.dehydrated || p.env.includes('aircon'))) {
    steps.push({ key: 'am-toner', slot: 'am', kind: 'toner', base: true, optional: true, order: ORDER.toner, title: 'Hydrating toner (optional)' });
  }
  steps.push({ key: 'am-moisturize', slot: 'am', kind: 'moisturize', base: true, order: ORDER.moisturize,
    title: (p.skinType === 'oily' || p.climate === 'tropical' && p.skinType !== 'dry' ? 'Light moisturiser' : 'Moisturiser') + (merged.am ? ` with ${BY_ID[merged.am].name.toLowerCase()}` : '') });
  steps.push({ key: 'am-spf', slot: 'am', kind: 'spf', base: true, order: ORDER.spf, title: 'Sunscreen SPF 50+, PA++++' });
  if (p.doubleCleanse) steps.push({ key: 'pm-oilcleanse', slot: 'pm', kind: 'oilcleanse', base: true, order: ORDER.oilcleanse, title: 'First cleanse: oil, balm or micellar water' });
  steps.push({ key: 'pm-cleanse', slot: 'pm', kind: 'cleanse', base: true, order: ORDER.cleanse, title: p.doubleCleanse ? 'Second cleanse: gentle cleanser' : 'Gentle cleanser' });
  if (p.steps === 'full' && (p.skinType === 'dry' || p.dehydrated || p.env.includes('aircon'))) {
    steps.push({ key: 'pm-toner', slot: 'pm', kind: 'toner', base: true, optional: true, order: ORDER.toner, title: 'Hydrating toner (optional)' });
  }
  const pmRich = p.skinType === 'dry' || p.barrierDamaged || scheduled.some((s) => BY_ID[s.primary] && BY_ID[s.primary].group === 'retinoid');
  steps.push({ key: 'pm-moisturize', slot: 'pm', kind: 'moisturize', base: true, order: ORDER.moisturize,
    title: (pmRich && p.skinType !== 'oily' ? 'Nourishing moisturiser' : 'Moisturiser') + (merged.pm ? ` with ${BY_ID[merged.pm].name.toLowerCase()}` : '') });
  return steps.map((s) => ({ ...s, freq: 7, days: [0, 1, 2, 3, 4, 5, 6], actives: [] }));
}

// ---------- reasons ----------

function whyFor(step, p, ctx) {
  const why = [];
  const oily = p.skinType === 'oily' || p.skinType === 'combination';
  switch (step.key) {
    case 'am-cleanse':
      why.push(step.title.startsWith('Rinse')
        ? 'Your skin isn’t oily, so a water rinse (or a gentle cream cleanser) is enough in the morning and protects your barrier.'
        : 'Clears overnight oil and sweat so your sunscreen sits well.');
      if (oily && p.acneProne) why.push('Use a gentle, low-pH gel; harsh foams strip oily skin and make it oilier.');
      return why;
    case 'pm-oilcleanse':
      why.push('Sunscreen and makeup need an oil, balm or micellar first cleanse to dissolve them. The second cleanse then gets your skin properly clean.');
      if (p.acneProne) why.push('Rinse the oil off thoroughly; it emulsifies with water.');
      return why;
    case 'pm-cleanse':
      why.push('Removes the day’s sunscreen, sweat and grime so your treatments can work.');
      if (p.skinType === 'dry' || p.sensitivity >= 2) why.push('Use a creamy, non-foaming cleanser.');
      else if (oily) why.push('A gentle gel is enough; you shouldn’t feel squeaky or tight afterwards.');
      return why;
    case 'am-toner': case 'pm-toner':
      why.push('Adds a layer of water before moisturiser; helpful after long hours in air-con.');
      return why;
    case 'am-moisturize':
      if (p.climate === 'tropical' && p.skinType !== 'dry') why.push('Singapore’s humidity means a light gel or lotion is plenty.');
      else if (p.skinType === 'dry') why.push('Locks in water and supports your barrier, especially in air-con.');
      else why.push('Keeps your barrier comfortable and gives sunscreen a smooth base.');
      if (ctx.merged.am) why.push(`Pick one with ${BY_ID[ctx.merged.am].name.toLowerCase()} to get its benefits without an extra step.`);
      if (p.rx.includes('isotretinoin')) why.push('Isotretinoin dries skin a lot: choose a richer cream than usual and use lip balm many times a day.');
      return why;
    case 'pm-moisturize': {
      const strong = ctx.scheduled.some((s) => BY_ID[s.primary] && ['retinoid', 'exfoliant', 'bpo'].includes(BY_ID[s.primary].group));
      why.push(strong ? 'Cushions your treatments and repairs the barrier overnight.' : 'Repairs and hydrates while you sleep.');
      if (p.barrierDamaged) why.push('Look for ceramides and panthenol to rebuild your barrier.');
      if (p.skinType === 'dry') why.push('A richer cream works well at night.');
      if (ctx.merged.pm) why.push(`Pick one with ${BY_ID[ctx.merged.pm].name.toLowerCase()} to save a step.`);
      return why;
    }
    case 'am-spf':
      why.push('The most important anti-pigment and anti-ageing step. Use two finger-lengths for face and neck, as the last step every morning.');
      if (p.climate === 'tropical') why.push('Singapore’s UV index is very high to extreme most days, even when it’s cloudy.');
      if (p.env.includes('outdoors')) why.push('Reapply every 2 hours outdoors; an SPF stick or powder over makeup makes it easy.');
      if (p.env.includes('sweat') || p.env.includes('swim')) why.push('Choose a water-resistant one for sport and swimming.');
      if (p.concerns.pigment || p.concerns.melasma) why.push('Without daily sunscreen, dark spots won’t fade. For melasma, a tinted one (with iron oxides) also blocks visible light.');
      if (ctx.photosens) why.push('Your retinoid or acids make skin more sun-sensitive.');
      if (p.rx.includes('oral-abx')) why.push('Doxycycline-type antibiotics make you burn more easily.');
      if (p.spfHabit === 'rarely' || p.spfHabit === 'never') why.push('If you build just one new habit, make it this one.');
      return why;
    case 'spot-patch':
      why.push('Hydrocolloid patches flatten whiteheads overnight and stop you picking, which prevents marks.');
      return why;
    default:
      break;
  }
  if (step.kind === 'mask') {
    if (step.maskType === 'clay') why.push('Soaks up excess oil and helps keep pores clear. Do it on a night without a retinoid or exfoliant.');
    if (step.maskType === 'hydrating') why.push('An extra layer of moisture: replaces your night moisturiser on these nights.');
    if (step.maskType === 'peel') why.push('A strong weekly resurfacing boost for texture and glow. Max 10 minutes; skip it if your skin feels sensitive.');
    return why;
  }
  // treatments
  const ing = BY_ID[step.primary];
  if (step.fixed) {
    why.push('Follow your doctor’s instructions for how often to use it; the app plans the rest of your routine around it.');
    if (step.primary === 'tretinoin') why.push('No other retinoids or exfoliating acids alongside it unless your doctor says so.');
    if (step.key === 'rx-clinda') why.push('Clindamycin works best paired with benzoyl peroxide, which stops bacteria becoming resistant. Ask your doctor.');
    return why;
  }
  if (ing) {
    why.push(`${cap(ing.does)}.`);
    const h = helpsText(step.helps || []);
    if (h) why.push(`Chosen for your ${h}.`);
  }
  switch (step.primary) {
    case 'adapalene': case 'retinol': case 'retinal': case 'hpr':
      why.push('Use a pea-sized amount on dry skin for your whole face, avoiding eyes and the corners of your nose and mouth.');
      if (step.primary !== 'hpr') why.push('A little dryness or a few extra breakouts in the first weeks (purging) is normal and settles.');
      if (p.sensitivity >= 1) why.push('If it stings, sandwich it: moisturiser, then retinoid, then moisturiser again.');
      if (step.primary === 'adapalene') why.push('In Singapore it’s sold behind the pharmacy counter: ask the pharmacist for adapalene 0.1% (Differin).');
      break;
    case 'bakuchiol':
      if (p.pregnancy) why.push('A retinol alternative with a better safety profile for pregnancy (still check with your doctor).');
      break;
    case 'bpo':
      why.push('2.5% works as well as 10% with much less irritation.');
      if (p.sensitivity >= 1) why.push('Use it as a short-contact treatment: apply to clean skin and rinse off after 2–5 minutes.');
      why.push('It bleaches fabric, so use white pillowcases and towels. Sold at pharmacies.');
      break;
    case 'salicylic': case 'betaine-sal':
      why.push('Apply to dry skin after cleansing; no need to rinse. Focus on your T-zone and breakout areas.');
      break;
    case 'glycolic': case 'lactic': case 'mandelic': case 'pha':
      why.push('Apply after cleansing; follow with moisturiser. Mild tingling is fine, burning is not.');
      break;
    case 'laa':
      why.push('Apply in the morning before moisturiser and sunscreen. Store it away from light and toss it if it turns dark orange.');
      break;
    case 'vitc-deriv':
      why.push('Gentler and more stable than pure vitamin C; good for sensitive skin.');
      break;
    case 'azelaic':
      why.push('It may tingle for the first week or two; that’s normal and fades.');
      if (p.pregnancy) why.push('Safe in pregnancy, which makes it this routine’s main treatment.');
      break;
    case 'niacinamide':
      why.push('Plays well with everything else in your routine.');
      break;
    case 'tranexamic':
      why.push('Works slowly over 8–12 weeks. Best for melasma alongside strict sunscreen.');
      break;
    case 'sulfur':
      why.push('Leave on as a 10-minute mask, or dab onto spots overnight.');
      break;
    case 'zpt':
      why.push('In the shower, lather onto affected areas, leave 3–5 minutes, rinse. It targets the yeast behind fungal acne and flaky redness.');
      break;
    case 'copper':
      why.push('Kept on separate nights from vitamin C and acids, which break it down.');
      break;
    default:
  }
  if (step.productId) why.push('From your shelf.');
  return why;
}

function lookForStep(step, p, merged) {
  const ff = p.wantsFragranceFree ? ', fragrance-free' : '';
  const oily = p.skinType === 'oily' || p.skinType === 'combination';
  switch (step.kind) {
    case 'cleanse': return (oily ? 'Gentle, low-pH gel cleanser' : 'Creamy, non-foaming cleanser') + ff;
    case 'oilcleanse': return p.acneProne ? 'Micellar water or a light cleansing oil that rinses clean' : 'Cleansing oil, balm or micellar water';
    case 'toner': return 'Hydrating toner with hyaluronic acid or glycerin, no alcohol';
    case 'moisturize': {
      const base = step.slot === 'am' && oily ? 'Light gel or lotion' : (p.skinType === 'dry' ? 'Cream with ceramides' : 'Lotion with ceramides or glycerin');
      const m = step.slot === 'am' ? merged.am : merged.pm;
      return base + (m ? ` containing ${BY_ID[m].name.toLowerCase()}` : '') + ff;
    }
    case 'spf': return 'SPF 50+, PA++++, broad-spectrum' + (p.prefs.has('mineral') ? ', mineral (zinc oxide)' : '') + (oily ? ', light fluid or gel' : '') + ((p.concerns.melasma) ? '; tinted if you can' : '');
    case 'mask': return step.maskType === 'clay' ? 'Kaolin or bentonite clay mask' : step.maskType === 'peel' ? 'AHA 30% + BHA 2% peel' : 'Hydrating sleeping mask or a thick layer of your moisturiser';
    case 'spot': return 'Hydrocolloid pimple patches';
    default: break;
  }
  if (step.primary === 'retinol') {
    const beginner = p.retinoidExp === 'never' || p.retinoidExp === 'irritated' || p.sensitivity >= 2;
    return beginner ? 'Retinol 0.2–0.3% to start' : 'Retinol 0.3–0.5%';
  }
  if (step.primary === 'laa') return p.sensitivity >= 1 ? 'L-ascorbic acid 5–10% in an opaque, airtight bottle' : 'L-ascorbic acid 10–15% in an opaque, airtight bottle';
  return LOOK_FOR[step.primary] || '';
}

function examplesForStep(step, p, merged) {
  switch (step.kind) {
    case 'cleanse': return step.title.startsWith('Rinse') ? pickExamples({ cats: ['cleanser'], excludeStrong: true, richer: true }, p, 2) : pickExamples({ cats: ['cleanser'], excludeStrong: true }, p);
    case 'oilcleanse': return pickExamples({ cats: ['oil-cleanser'] }, p);
    case 'toner': return pickExamples({ cats: ['toner'], excludeStrong: true }, p);
    case 'moisturize': {
      const m = step.slot === 'am' ? merged.am : merged.pm;
      return pickExamples({ cats: ['moisturizer'], excludeStrong: true, requireAny: m ? [m] : null, lighter: step.slot === 'am', richer: step.slot === 'pm' && p.skinType === 'dry' }, p);
    }
    case 'spf': return pickExamples({ cats: ['sunscreen'], lighter: true }, p);
    case 'mask': return pickExamples({ cats: ['mask'], maskType: step.maskType }, p, 2);
    case 'spot': return pickExamples({ cats: ['spot'], requireAny: null, exclude: ['mb-drying'] }, p, 1);
    case 'wash': return pickExamples({ cats: ['cleanser'], requireAny: ['zpt'], treatment: true }, p, 1);
    default: break;
  }
  if (!step.primary || step.fixed) return [];
  const cats = step.primary === 'bpo' ? ['treatment', 'cleanser']
    : step.primary === 'sulfur' ? ['spot', 'mask', 'treatment']
      : ['serum', 'treatment', 'exfoliant', 'toner', 'moisturizer'];
  return pickExamples({ cats, requireAny: [step.primary], treatment: true }, p);
}

// ---------- notes ----------

function globalNotes(p, scheduled, excluded, plan) {
  const notes = [];
  const groups = scheduled.map((s) => BY_ID[s.primary] && BY_ID[s.primary].group);
  if (plan.repairWeeks) notes.push(`Repair first: for ${plan.repairWeeks} weeks it’s just cleanser, moisturiser and sunscreen (plus gentle extras) so your barrier can heal before any strong actives.`);
  notes.push('Patch-test each new product on your jaw or behind your ear for 3 nights before using it all over.');
  if (scheduled.some((s) => s.ramp)) notes.push('Strong actives start slowly and one at a time. The Today screen follows the ramp-up for you.');
  if (groups.includes('retinoid') || groups.includes('exfoliant')) notes.push('Extra breakouts in your usual spots during the first 2–6 weeks can be “purging”. Breakouts in new places, or burning, mean stop and simplify.');
  const timeline = { acne: '8–12 weeks', pores: '8–12 weeks', pigment: '8–16 weeks', melasma: '3–6 months', lines: '3–6 months', firmness: '3–6 months', texture: '6–8 weeks', dullness: '4–6 weeks', redness: '4–8 weeks', dryness: '2–4 weeks', oiliness: '4–8 weeks' };
  if (p.top && timeline[p.top]) notes.push(`Give it ${timeline[p.top]} before judging results for ${CONCERN_SHORT[p.top]}.`);
  for (const e of excluded.slice(0, 3)) notes.push(`${BY_ID[e.id].name} is left out: ${e.reason}`);
  if (p.pregnancy) notes.push('This routine avoids retinoids and actives with limited pregnancy data. Show it to your doctor or pharmacist to be sure.');
  if (p.rx.includes('isotretinoin')) notes.push('While on isotretinoin: gentle cleanser, rich moisturiser, lip balm many times a day, and SPF. No actives, waxing or peels until 6 months after you finish.');
  if (p.rx.includes('hq')) notes.push('Use hydroquinone exactly as prescribed, usually in courses of no more than 3 months.');
  if (p.acneTypes.includes('fungal') || p.conditions.includes('fungal')) notes.push('Fungal acne feeds on many plant oils and fatty esters. The Shelf checker flags products that contain them.');
  if (p.env.includes('aircon')) notes.push('Air-con dries skin out; keep a hydrating mist or your moisturiser handy.');
  if (p.env.includes('mask')) notes.push('Under a face mask, use a lighter moisturiser and wash cloth masks daily.');
  if (p.env.includes('swim')) notes.push('Rinse off chlorine straight after swimming and moisturise.');
  if (p.env.includes('sweat')) notes.push('Rinse or cleanse after workouts so sweat doesn’t sit on your skin.');
  if (p.acneProne) notes.push('Change your pillowcase twice a week and wipe your phone screen; both touch your face for hours.');
  if (p.lifestyle.includes('picking')) notes.push('Picking leaves marks that outlast the spot. Pimple patches help keep hands off.');
  if (p.lifestyle.includes('sleep')) notes.push('Short sleep shows up as dullness and slower healing. Even 30 minutes more helps.');
  if (p.lifestyle.includes('stress')) notes.push('Stress can trigger breakouts and flare-ups; keep the routine simple on bad weeks.');
  if (p.lifestyle.includes('smoking')) notes.push('Smoking breaks down collagen and dulls skin faster than any product can fix.');
  return notes;
}

// ---------- daily view ----------

export function phaseForDate(routine, dateStr) {
  const week = Math.max(1, Math.floor(daysBetween(routine.startDate, dateStr) / 7) + 1);
  const phase = routine.phases.find((ph) => week >= ph.fromWeek && (ph.toWeek === null || ph.toWeek === undefined || week <= ph.toWeek))
    || routine.phases[routine.phases.length - 1];
  return { week, phase };
}

export function stepsForDay(routine, dateStr) {
  const { week, phase } = phaseForDate(routine, dateStr);
  const d = weekdayMon0(dateStr);
  const cell = phase.grid[d] || { am: [], pm: [] };
  const byKey = Object.fromEntries(routine.steps.map((s) => [s.key, s]));
  const pick = (slot) => routine.steps.filter((s) => s.base && s.slot === slot)
    .concat(cell[slot].map((k) => byKey[k]).filter(Boolean))
    .sort((a, b) => a.order - b.order);
  const am = pick('am');
  const pm = pick('pm');
  const strongTonight = pm.some((s) => s.primary && BY_ID[s.primary] && BY_ID[s.primary].irritation >= 1.2);
  const hasTreat = pm.some((s) => !s.base && s.kind !== 'mask');
  return { week, phase, am, pm, recovery: !strongTonight && !hasTreat, isFinalPhase: phase.toWeek === null };
}

// Which keys are due for a routine on a date (for checklist completion).
export function dueKeys(routine, dateStr, slot) {
  const day = stepsForDay(routine, dateStr);
  return day[slot].filter((s) => !s.optional).map((s) => s.key);
}
