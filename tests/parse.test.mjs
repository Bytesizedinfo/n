import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyse, guessCategory, tokenise } from '../js/engine/parse.js';
import { INCI } from './fixtures.mjs';

test('CeraVe-style cleanser list', () => {
  const r = analyse({ name: 'Foaming Cleanser', text: INCI.ceraveFoaming });
  for (const id of ['niacinamide', 'ceramides', 'ha', 'glycerin']) assert.ok(r.actives.includes(id), id);
  assert.ok(!r.actives.includes('laa'), 'citric acid is not vitamin C');
  assert.equal(r.cat, 'cleanser');
  assert.equal(r.flags.ff, true);
  assert.ok(!r.actives.includes('fragrance'));
});

test('vitamin C derivative is not pure vitamin C', () => {
  const r = analyse({ name: 'Brightening Serum', text: INCI.vitcSerum });
  assert.ok(r.actives.includes('vitc-deriv'));
  assert.ok(!r.actives.includes('laa'));
  assert.ok(r.actives.includes('antioxidants'));
  assert.equal(r.cat, 'serum');
});

test('sunscreen filters, alcohol and fragrance', () => {
  const r = analyse({ name: 'UV Essence SPF50+', text: INCI.sunscreen });
  assert.ok(r.actives.includes('spf-chemical'));
  assert.ok(!r.actives.includes('salicylic'), 'ethylhexyl salicylate is a UV filter, not BHA');
  assert.ok(r.actives.includes('alcohol'));
  assert.ok(r.actives.includes('fragrance'));
  assert.ok(r.actives.includes('fragrance-allergen'));
  assert.equal(r.flags.ff, false);
  assert.equal(r.cat, 'sunscreen');
  assert.equal(r.spf, 50);
});

test('cetearyl alcohol is not a drying alcohol', () => {
  const r = analyse({ text: 'Water, Cetearyl Alcohol, Glycerin, Benzyl Alcohol, Dimethicone' });
  assert.ok(!r.actives.includes('alcohol'));
});

test('pore cloggers, fungal triggers and essential oils', () => {
  const r = analyse({ name: 'Face Oil', text: INCI.oily });
  assert.ok(r.actives.includes('comedogenic'));
  assert.ok(r.actives.includes('eo'));
  assert.ok(r.actives.includes('squalane'));
  assert.ok(r.fungalTriggers.length >= 3, r.fungalTriggers.join(' | '));
  assert.ok(!r.fungalTriggers.some((t) => /caprylic/.test(t)), 'MCT is fungal-safe');
});

test('photo text: line-broken words and tea tree', () => {
  const r = analyse({ name: '', text: INCI.ocr });
  assert.ok(r.actives.includes('ha'), tokenise(INCI.ocr).join(' | '));
  assert.ok(r.actives.includes('salicylic'));
  assert.ok(r.actives.includes('teatree'));
  assert.ok(!r.actives.includes('eo'), 'tea tree is reported as itself');
});

test('names and strengths', () => {
  const a = analyse({ name: "Skin Perfecting 2% BHA Liquid Exfoliant" });
  assert.ok(a.actives.includes('salicylic'));
  assert.equal(a.strength.salicylic, 2);
  assert.equal(a.cat, 'exfoliant');
  const b = analyse({ name: 'Niacinamide 10% + Zinc 1%' });
  assert.equal(b.strength.niacinamide, 10);
  assert.equal(b.cat, 'serum');
  const c = analyse({ name: 'Retinol 0.5% in Squalane' });
  assert.equal(c.strength.retinol, 0.5);
  const d = analyse({ name: 'Glycolic Acid 7% Toning Solution', text: 'Aqua, Glycolic Acid, Rosa Damascena Flower Water, Glycerin' });
  assert.equal(d.cat, 'exfoliant');
  assert.equal(d.strength.glycolic, 7);
});

test('category guesses', () => {
  assert.equal(guessCategory('Deep Cleansing Oil'), 'oil-cleanser');
  assert.equal(guessCategory('Hydrating Facial Cleanser'), 'cleanser');
  assert.equal(guessCategory('Water Sleeping Mask'), 'mask');
  assert.equal(guessCategory('Acne Pimple Master Patch'), 'spot');
  assert.equal(guessCategory('Daily Moisturizing Lotion'), 'moisturizer');
  assert.equal(guessCategory('Watery Sun Gel SPF50+'), 'sunscreen');
});
