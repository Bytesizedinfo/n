import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERSONAS } from './fixtures.mjs';
import { buildRoutine, stepsForDay } from '../js/engine/routine.js';
import { buildProfile, stepCaps } from '../js/engine/profile.js';
import { mustSeparate } from '../js/data/interactions.js';
import { BY_ID } from '../js/data/ingredients.js';
import { PRODUCT_BY_ID, PRODUCTS } from '../js/data/products.js';
import { analyseShelf, buildFromShelf } from '../js/engine/shelf.js';
import { buildIcs } from '../js/engine/ics.js';
import { compareRoutines, compareAnswers } from '../js/engine/compare.js';
import { streak, journalInsights } from '../js/engine/progress.js';
import { addDays } from '../js/engine/dates.js';
import { QUESTIONS, visibleQuestions, isComplete, pruneAnswers } from '../js/data/questions.js';

const START = '2026-11-09'; // a Monday

function stepMap(r) { return Object.fromEntries(r.steps.map((s) => [s.key, s])); }

// Shared invariants for any routine.
function checkInvariants(name, r, answers) {
  const profile = buildProfile(answers);
  const caps = stepCaps(profile);
  const steps = stepMap(r);
  for (const ph of r.phases) {
    ph.grid.forEach((cell, d) => {
      for (const slot of ['am', 'pm']) {
        const keys = cell[slot];
        for (let i = 0; i < keys.length; i++) {
          for (let j = i + 1; j < keys.length; j++) {
            const a = steps[keys[i]]; const b = steps[keys[j]];
            assert.ok(a && b, `${name}: unknown key in grid`);
            assert.ok(!mustSeparate(a.actives, b.actives, profile.sensitivity),
              `${name}: ${a.title} and ${b.title} share ${slot} on day ${d} (${ph.label})`);
          }
        }
        const treat = keys.filter((k) => !['weekly'].includes(steps[k].slot));
        const baseCount = r.steps.filter((s) => s.base && s.slot === slot && !s.optional).length;
        const limit = Math.max(caps[slot], baseCount + (slot === 'pm' ? 1 : 0));
        assert.ok(baseCount + treat.length <= limit, `${name}: ${slot} day ${d} has ${baseCount + treat.length} steps > ${limit}`);
        const irritation = keys.reduce((s, k) => s + (steps[k].actives || []).reduce((m, a) => Math.max(m, BY_ID[a] ? BY_ID[a].irritation : 0), 0), 0);
        if (keys.length > 1) assert.ok(irritation <= profile.tolerance + 1.6, `${name}: ${slot} day ${d} irritation ${irritation} way over tolerance ${profile.tolerance}`);
      }
    });
  }
  // Every routine has the essentials.
  for (const k of ['am-cleanse', 'am-moisturize', 'am-spf', 'pm-cleanse', 'pm-moisturize']) assert.ok(steps[k], `${name}: missing ${k}`);
  // Examples never contain something unsafe for this person.
  for (const s of r.steps) {
    for (const id of s.examples || []) {
      assert.ok(PRODUCT_BY_ID[id], `${name}: unknown example ${id}`);
    }
    assert.ok(Array.isArray(s.why), `${name}: ${s.key} has no reasons`);
  }
  // Last phase is open-ended.
  assert.equal(r.phases[r.phases.length - 1].toWeek, null);
}

for (const [name, answers] of Object.entries(PERSONAS)) {
  test(`invariants: ${name}`, () => {
    const r = buildRoutine(answers, { startDate: START });
    checkInvariants(name, r, answers);
  });
}

test('oily acne-prone gets a pore/acne treatment, ramped, with SPF', () => {
  const r = buildRoutine(PERSONAS.oilyAcne, { startDate: START });
  const prim = r.steps.map((s) => s.primary).filter(Boolean);
  assert.ok(prim.some((p) => ['adapalene', 'salicylic', 'bpo', 'retinol'].includes(p)), 'has an acne active: ' + prim);
  const retinoid = r.steps.find((s) => BY_ID[s.primary] && BY_ID[s.primary].group === 'retinoid');
  assert.ok(retinoid, 'has a retinoid');
  const ramp = r.ramp.find((x) => x.key === retinoid.key);
  assert.ok(ramp && ramp.rows[0].perWeek < retinoid.freq, 'retinoid ramps up');
  assert.ok(r.steps.find((s) => s.key === 'spot-patch'), 'pimple patch suggested');
});

test('every strong active has a ramp-up plan', () => {
  for (const [name, answers] of Object.entries(PERSONAS)) {
    const r = buildRoutine(answers, { startDate: START });
    for (const s of r.steps) {
      const g = BY_ID[s.primary] && BY_ID[s.primary].group;
      const strong = ['adapalene', 'retinol', 'retinal'].includes(s.primary) || (g === 'exfoliant' && s.primary !== 'pha') || s.primary === 'bpo';
      if (!strong || s.fixed || s.slot === 'weekly') continue;
      const plan = r.ramp.find((x) => x.key === s.key);
      assert.ok(plan, `${name}: ${s.title} has no ramp-up`);
      const firstUse = plan.rows.find((row) => row.perWeek > 0);
      assert.ok(plan.rows[0].perWeek === 0 || firstUse.perWeek <= s.freq, `${name}: ${s.title} ramp`);
      if (s.freq > 2) assert.ok(firstUse.perWeek < s.freq, `${name}: ${s.title} starts below target`);
    }
  }
});

test('pregnancy: no retinoids or caution actives in steps or examples', () => {
  const r = buildRoutine(PERSONAS.pregnant, { startDate: START });
  for (const s of r.steps) {
    for (const a of s.actives || []) {
      assert.notEqual(BY_ID[a] && BY_ID[a].pregnancy, 'avoid', `step ${s.title} has ${a}`);
    }
    for (const id of s.examples || []) {
      const p = PRODUCT_BY_ID[id];
      const washOff = ['cleanser', 'oil-cleanser', 'mask'].includes(p.cat);
      for (const a of p.actives) {
        const preg = BY_ID[a] && BY_ID[a].pregnancy;
        assert.ok(preg !== 'avoid' && (washOff || preg !== 'caution'), `example ${p.name} has ${a}`);
      }
    }
  }
  assert.ok(r.steps.some((s) => s.primary === 'azelaic'), 'azelaic acid steps in for acne');
  assert.ok(r.notes.some((n) => /pregnan/i.test(n)));
});

test('tretinoin: no second retinoid or AHA/BHA, prescription step is fixed', () => {
  const r = buildRoutine(PERSONAS.tretinoin, { startDate: START });
  const tret = r.steps.find((s) => s.primary === 'tretinoin');
  assert.ok(tret && tret.fixed);
  for (const s of r.steps) {
    if (s === tret) continue;
    const ing = BY_ID[s.primary];
    if (!ing) continue;
    assert.notEqual(ing.group, 'retinoid', s.title);
    assert.ok(!(ing.group === 'exfoliant' && ing.sub !== 'pha'), s.title);
  }
});

test('isotretinoin: gentle routine only', () => {
  const r = buildRoutine(PERSONAS.isotretinoin, { startDate: START });
  for (const s of r.steps) {
    const g = BY_ID[s.primary] && BY_ID[s.primary].group;
    assert.ok(!['retinoid', 'exfoliant', 'bpo', 'sulfur'].includes(g), s.title);
  }
  assert.ok(r.referrals.length > 0, 'refers cystic acne to a doctor');
});

test('rosacea + very sensitive: no harsh actives, azelaic first', () => {
  const r = buildRoutine(PERSONAS.sensitiveRedness, { startDate: START });
  const prim = r.steps.map((s) => s.primary).filter(Boolean);
  for (const bad of ['glycolic', 'salicylic', 'bpo', 'adapalene', 'retinol', 'retinal', 'laa']) assert.ok(!prim.includes(bad), bad);
  assert.ok(prim.includes('azelaic'));
  for (const s of r.steps) for (const id of s.examples) assert.notEqual(PRODUCT_BY_ID[id].flags.ff, false, `${id} has fragrance`);
});

test('melasma: targeted brightener + strict sunscreen advice', () => {
  const r = buildRoutine(PERSONAS.melasma, { startDate: START });
  const prim = r.steps.map((s) => s.primary);
  assert.ok(prim.includes('tranexamic') || prim.includes('azelaic'));
  const spf = r.steps.find((s) => s.key === 'am-spf');
  assert.ok(spf.why.some((w) => /tinted/.test(w)));
});

test('barrier repair: first phase has no strong actives', () => {
  const r = buildRoutine(PERSONAS.barrier, { startDate: START });
  assert.ok(r.repairWeeks > 0);
  const steps = stepMap(r);
  const first = r.phases[0];
  for (const cell of first.grid) for (const k of cell.am.concat(cell.pm)) {
    const irr = Math.max(0, ...steps[k].actives.map((a) => BY_ID[a] ? BY_ID[a].irritation : 0));
    assert.ok(irr <= 0.5, `${steps[k].title} during repair`);
  }
});

test('minimal: 3 steps in the morning', () => {
  const r = buildRoutine(PERSONAS.minimal3, { startDate: START });
  const day = stepsForDay(r, '2026-12-30');
  assert.ok(day.am.length <= 3, day.am.map((s) => s.title).join(', '));
  assert.ok(r.steps.find((s) => s.key === 'pm-oilcleanse'), 'double cleanse for full makeup');
});

test('fungal acne: anti-fungal wash and sulfur', () => {
  const r = buildRoutine(PERSONAS.fungal, { startDate: START });
  const prim = r.steps.map((s) => s.primary);
  assert.ok(prim.includes('zpt'));
  assert.ok(prim.includes('sulfur'));
  assert.ok(!prim.includes('bpo'));
});

test('stepsForDay follows the ramp and the week', () => {
  const r = buildRoutine(PERSONAS.oilyAcne, { startDate: START });
  const w1 = stepsForDay(r, START);
  assert.equal(w1.week, 1);
  const w20 = stepsForDay(r, addDays(START, 7 * 19));
  assert.equal(w20.week, 20);
  assert.ok(w20.isFinalPhase);
});

// ---------- shelf ----------

function shelfFrom(ids) {
  return ids.map((id) => ({ ...PRODUCT_BY_ID[id], catalogueId: id, addedAt: '2026-11-01' }));
}

test('shelf: flags clashing products and fills the SPF gap', () => {
  const shelf = shelfFrom(['cerave-foaming', 'to-retinol05', 'pc-bha', 'melano-cc', 'benzac-ac', 'cerave-pm']);
  const a = analyseShelf(shelf, PERSONAS.oilyAcne);
  const pair = (x, y) => a.clashes.find((c) => (c.a === x && c.b === y) || (c.a === y && c.b === x));
  assert.equal(pair('to-retinol05', 'pc-bha').level, 'separate');
  assert.equal(pair('to-retinol05', 'benzac-ac').level, 'separate');
  assert.equal(pair('melano-cc', 'benzac-ac').level, 'separate');
  assert.ok(a.overload, 'flags overload');

  const r = buildFromShelf(shelf, PERSONAS.oilyAcne, { startDate: START });
  assert.ok(r.gaps.some((g) => g.key === 'spf'), 'no sunscreen → gap');
  checkInvariants('shelf', r, PERSONAS.oilyAcne);
  const ids = r.steps.map((s) => s.productId).filter(Boolean);
  assert.ok(ids.includes('cerave-foaming'));
});

test('shelf: two retinoids → one benched', () => {
  const shelf = shelfFrom(['to-retinol02', 'cerave-retinol', 'cerave-pm', 'biore-aqua', 'cerave-hydrating']);
  const a = analyseShelf(shelf, PERSONAS.matureDry);
  assert.ok(a.duplicates.some((d) => d.group === 'retinoid'));
  const r = buildFromShelf(shelf, PERSONAS.matureDry, { startDate: START });
  const used = r.steps.filter((s) => s.productId && ['to-retinol02', 'cerave-retinol'].includes(s.productId));
  assert.equal(used.length, 1);
  assert.ok(r.unused.some((u) => ['to-retinol02', 'cerave-retinol'].includes(u.id)));
});

test('shelf: pregnancy benches a retinol', () => {
  const shelf = shelfFrom(['to-retinol05', 'to-azelaic', 'cerave-hydrating', 'cerave-cream', 'lrp-uvmune']);
  const r = buildFromShelf(shelf, PERSONAS.pregnant, { startDate: START });
  assert.ok(r.unused.find((u) => u.id === 'to-retinol05'));
  assert.ok(r.steps.some((s) => s.productId === 'to-azelaic'));
});

test('catalogue: every product has valid fields', () => {
  const cats = ['oil-cleanser', 'cleanser', 'toner', 'exfoliant', 'serum', 'treatment', 'spot', 'moisturizer', 'sunscreen', 'mask'];
  const ids = new Set();
  for (const p of PRODUCTS) {
    assert.ok(!ids.has(p.id), 'duplicate ' + p.id); ids.add(p.id);
    assert.ok(cats.includes(p.cat), p.id + ' cat');
    assert.ok(['budget', 'mid', 'splurge'].includes(p.tier), p.id + ' tier');
    assert.ok(p.price > 0, p.id + ' price');
    for (const a of p.actives) assert.ok(BY_ID[a], `${p.id}: unknown active ${a}`);
  }
});

// ---------- other ----------

test('calendar file', () => {
  const r = buildRoutine(PERSONAS.oilyAcne, { startDate: START });
  const ics = buildIcs(r, { amTime: '07:30', pmTime: '22:00' });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
  assert.equal((ics.match(/RRULE:FREQ=DAILY/g) || []).length, 2);
  assert.ok(/RRULE:FREQ=WEEKLY;BYDAY=/.test(ics));
  assert.ok(/DTSTART:20261109T073000/.test(ics));
  for (const line of ics.split('\r\n')) assert.ok(line.length <= 75, 'line too long: ' + line);
});

test('compare routines and answers', () => {
  const a = buildRoutine(PERSONAS.oilyAcne, { startDate: START });
  const b = buildRoutine({ ...PERSONAS.oilyAcne, pregnancy: 'pregnant' }, { startDate: START });
  const diff = compareRoutines(a, b);
  assert.ok(diff.removed.some((s) => s.primary === 'adapalene'));
  const ans = compareAnswers(PERSONAS.oilyAcne, { ...PERSONAS.oilyAcne, pregnancy: 'pregnant' });
  assert.equal(ans.length, 1);
  assert.equal(ans[0].after, 'Pregnant');
});

test('streak counts complete days', () => {
  const r = buildRoutine(PERSONAS.minimal3, { startDate: START });
  const checklist = {};
  const today = '2026-11-20';
  for (let i = 0; i < 4; i++) {
    const d = addDays(today, -i);
    const day = stepsForDay(r, d);
    checklist[d] = { am: Object.fromEntries(day.am.map((s) => [s.key, true])), pm: Object.fromEntries(day.pm.map((s) => [s.key, true])) };
  }
  assert.equal(streak(r, checklist, today), 4);
  delete checklist[today].pm[Object.keys(checklist[today].pm)[0]];
  assert.equal(streak(r, checklist, today), 3, 'today unfinished → count from yesterday');
});

test('journal insight: product added before a flare', () => {
  const entries = {};
  const added = '2026-11-15';
  for (let i = -10; i <= 10; i++) {
    const d = addDays(added, i);
    entries[d] = { ratings: { breakouts: i < 0 ? 0 : 3, redness: 1 }, tags: [] };
  }
  const out = journalInsights(entries, { today: addDays(added, 10), shelf: [{ name: 'Test Serum', addedAt: added }] });
  assert.ok(out.some((x) => /Test Serum/.test(x.text)));
});

test('quiz: adaptive questions and pruning', () => {
  const a = { concerns: ['dullness'] };
  assert.ok(!visibleQuestions(a).some((q) => q.id === 'acneType'));
  const b = { concerns: ['acne', 'pigment'] };
  const ids = visibleQuestions(b).map((q) => q.id);
  assert.ok(ids.includes('acneType') && ids.includes('pigmentType') && ids.includes('topConcern'));
  const pruned = pruneAnswers({ concerns: ['dullness'], acneType: ['inflamed'], topConcern: 'acne' });
  assert.equal(pruned.acneType, undefined);
  assert.equal(pruned.topConcern, undefined);
  assert.ok(isComplete(PERSONAS.oilyAcne), 'fixture answers every visible question');
  assert.ok(QUESTIONS.length >= 20);
});
