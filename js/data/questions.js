// Adaptive quiz. `when(answers)` decides whether a question is shown.
// type: 'single' | 'multi' | 'text'
// exclusive: option values that clear the others when picked (e.g. 'none').

import { CONCERNS } from './ingredients.js';

const has = (a, key, value) => Array.isArray(a[key]) && a[key].includes(value);

export const SECTIONS = {
  skin: 'Your skin',
  concerns: 'Concerns',
  sensitivity: 'Sensitivity',
  health: 'Health',
  life: 'Lifestyle',
  routine: 'Your routine now',
  prefs: 'Preferences',
};

export const QUESTIONS = [
  { id: 'skinType', section: 'skin', type: 'single',
    title: 'By midday, with nothing on, how does your skin feel?',
    options: [
      { value: 'oily', label: 'Shiny all over' },
      { value: 'combination', label: 'Shiny T-zone, normal or dry cheeks' },
      { value: 'normal', label: 'Comfortable: not oily, not tight' },
      { value: 'dry', label: 'Tight, rough or flaky' },
    ] },
  { id: 'dehydrated', section: 'skin', type: 'single',
    title: 'Does it ever feel tight or look dull even while it’s oily?',
    help: 'Oily skin can still be short on water (dehydrated).',
    when: (a) => a.skinType === 'oily' || a.skinType === 'combination',
    options: [
      { value: 'yes', label: 'Yes, often' },
      { value: 'sometimes', label: 'Sometimes, e.g. after washing or in air-con' },
      { value: 'no', label: 'No' },
    ] },
  { id: 'age', section: 'skin', type: 'single',
    title: 'Your age range',
    options: [
      { value: 'teen', label: 'Under 20' },
      { value: '20s', label: '20–29' },
      { value: '30s', label: '30–39' },
      { value: '40s', label: '40–49' },
      { value: '50+', label: '50+' },
    ] },

  { id: 'concerns', section: 'concerns', type: 'multi', max: 5,
    title: 'What would you like to improve?',
    help: 'Pick up to 5.',
    options: Object.entries(CONCERNS).map(([value, label]) => ({ value, label }))
      .concat([{ value: 'maintain', label: 'Nothing specific: healthy, simple skincare' }]),
    exclusive: ['maintain'] },
  { id: 'topConcern', section: 'concerns', type: 'single',
    title: 'Which one matters most right now?',
    help: 'Your routine will put this first.',
    when: (a) => Array.isArray(a.concerns) && a.concerns.filter((c) => c !== 'maintain').length > 1,
    optionsFrom: (a) => a.concerns.filter((c) => c !== 'maintain').map((c) => ({ value: c, label: CONCERNS[c] })) },
  { id: 'acneType', section: 'concerns', type: 'multi',
    title: 'What do your breakouts look like?',
    when: (a) => has(a, 'concerns', 'acne'),
    options: [
      { value: 'comedonal', label: 'Blackheads and whiteheads' },
      { value: 'inflamed', label: 'Red, tender spots' },
      { value: 'cystic', label: 'Deep, painful lumps that last weeks' },
      { value: 'hormonal', label: 'Mostly jaw and chin; flares with my cycle' },
      { value: 'fungal', label: 'Tiny, itchy, same-size bumps on forehead, hairline or chest' },
    ] },
  { id: 'acneSeverity', section: 'concerns', type: 'single',
    title: 'How many, usually?',
    when: (a) => has(a, 'concerns', 'acne'),
    options: [
      { value: 'few', label: 'A few spots now and then' },
      { value: 'some', label: 'Several most weeks' },
      { value: 'many', label: 'Lots, most of the time' },
      { value: 'scarring', label: 'Painful, and leaving scars or pits' },
    ] },
  { id: 'pigmentType', section: 'concerns', type: 'multi',
    title: 'What kind of dark marks?',
    when: (a) => has(a, 'concerns', 'pigment') || has(a, 'concerns', 'melasma'),
    options: [
      { value: 'pih', label: 'Marks left behind after spots' },
      { value: 'sun', label: 'Sun spots or freckles that darkened over time' },
      { value: 'melasma', label: 'Symmetrical brown patches (cheeks, forehead, upper lip)' },
      { value: 'unsure', label: 'Not sure' },
    ] },
  { id: 'rednessType', section: 'concerns', type: 'multi',
    title: 'What is your redness like?',
    when: (a) => has(a, 'concerns', 'redness'),
    options: [
      { value: 'flush', label: 'Flushes with heat, spicy food, alcohol or exercise' },
      { value: 'reactive', label: 'Goes red or stings after products' },
      { value: 'persistent', label: 'Always there, or tiny visible veins' },
      { value: 'patches', label: 'Red, flaky patches (sides of nose, brows, hairline)' },
    ] },

  { id: 'sensitivity', section: 'sensitivity', type: 'single',
    title: 'How often do products sting, burn or turn you red?',
    options: [
      { value: '0', label: 'Never' },
      { value: '1', label: 'Only with strong products' },
      { value: '2', label: 'Often' },
      { value: '3', label: 'Almost everything does' },
    ] },
  { id: 'barrier', section: 'sensitivity', type: 'single',
    title: 'Right now, is your skin…',
    options: [
      { value: 'ok', label: 'Fine overall' },
      { value: 'damaged', label: 'Stinging, tight, flaky or raw, even with gentle products' },
    ] },
  { id: 'triggers', section: 'sensitivity', type: 'multi',
    title: 'Has anything given you a reaction before?',
    options: [
      { value: 'fragrance', label: 'Fragrance' },
      { value: 'eo', label: 'Essential oils' },
      { value: 'alcohol', label: 'Alcohol-heavy products' },
      { value: 'acids', label: 'Exfoliating acids (AHA/BHA)' },
      { value: 'retinoids', label: 'Retinol or other retinoids' },
      { value: 'bpo', label: 'Benzoyl peroxide' },
      { value: 'vitc', label: 'Vitamin C' },
      { value: 'niacinamide', label: 'Niacinamide' },
      { value: 'none', label: 'Nothing I know of' },
    ],
    exclusive: ['none'] },
  { id: 'avoidText', section: 'sensitivity', type: 'text', optional: true,
    title: 'Any other ingredients you avoid?',
    help: 'Optional. Separate with commas, e.g. “coconut oil, lanolin”.' },

  { id: 'pregnancy', section: 'health', type: 'single',
    title: 'Are you pregnant, trying, or breastfeeding?',
    help: 'Some actives (like retinoids) aren’t recommended then.',
    options: [
      { value: 'none', label: 'No / not applicable' },
      { value: 'ttc', label: 'Trying to conceive' },
      { value: 'pregnant', label: 'Pregnant' },
      { value: 'breastfeeding', label: 'Breastfeeding' },
    ] },
  { id: 'rx', section: 'health', type: 'multi',
    title: 'Are you using any of these from a doctor?',
    options: [
      { value: 'tretinoin', label: 'Prescription retinoid cream (tretinoin, e.g. Stieva-A)' },
      { value: 'isotretinoin', label: 'Oral isotretinoin (Roaccutane, Oratane)' },
      { value: 'clindamycin', label: 'Antibiotic gel or lotion (clindamycin)' },
      { value: 'oral-abx', label: 'Oral antibiotics for acne (doxycycline etc.)' },
      { value: 'hq', label: 'Prescription pigment cream (hydroquinone / triple cream)' },
      { value: 'hormonal', label: 'Hormonal acne treatment (pill, spironolactone)' },
      { value: 'steroid', label: 'Steroid cream on the face' },
      { value: 'none', label: 'None' },
    ],
    exclusive: ['none'] },
  { id: 'conditions', section: 'health', type: 'multi',
    title: 'Any of these skin conditions?',
    help: 'Diagnosed or strongly suspected.',
    options: [
      { value: 'rosacea', label: 'Rosacea' },
      { value: 'eczema', label: 'Eczema' },
      { value: 'sebderm', label: 'Seborrhoeic dermatitis' },
      { value: 'perioral', label: 'Perioral dermatitis' },
      { value: 'psoriasis', label: 'Psoriasis' },
      { value: 'fungal', label: 'Fungal acne' },
      { value: 'none', label: 'None' },
    ],
    exclusive: ['none'] },

  { id: 'climate', section: 'life', type: 'single',
    title: 'Where do you spend most of the year?',
    options: [
      { value: 'tropical', label: 'Hot and humid (e.g. Singapore)' },
      { value: 'temperate', label: 'Mild with seasons' },
      { value: 'dry', label: 'Cold or dry' },
    ] },
  { id: 'environment', section: 'life', type: 'multi', optional: true,
    title: 'Which of these are true for you?',
    options: [
      { value: 'aircon', label: 'Long hours in air-con' },
      { value: 'outdoors', label: 'Outdoors in the sun a lot' },
      { value: 'sweat', label: 'Exercise or sweat most days' },
      { value: 'mask', label: 'Wear a face mask often' },
      { value: 'swim', label: 'Swim in chlorinated pools' },
    ] },
  { id: 'lifestyle', section: 'life', type: 'multi', optional: true,
    title: 'Any of these? (for tips only)',
    options: [
      { value: 'sleep', label: 'Often under 6 hours’ sleep' },
      { value: 'stress', label: 'High stress' },
      { value: 'picking', label: 'I touch or pick at my face' },
      { value: 'smoking', label: 'Smoking or vaping' },
    ] },
  { id: 'makeup', section: 'life', type: 'single',
    title: 'Makeup on a typical day?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'light', label: 'Light: tinted sunscreen, concealer, brows' },
      { value: 'full', label: 'Foundation most days' },
      { value: 'longwear', label: 'Long-wear or waterproof' },
    ] },
  { id: 'spfHabit', section: 'life', type: 'single',
    title: 'How often do you wear sunscreen now?',
    options: [
      { value: 'daily', label: 'Every day' },
      { value: 'sometimes', label: 'Some days' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'never', label: 'Never' },
    ] },

  { id: 'currentActives', section: 'routine', type: 'multi',
    title: 'Which actives are you using now?',
    options: [
      { value: 'retinoid', label: 'Retinol / retinoid' },
      { value: 'aha', label: 'AHA (glycolic, lactic, mandelic)' },
      { value: 'bha', label: 'BHA (salicylic acid)' },
      { value: 'vitc', label: 'Vitamin C' },
      { value: 'niacinamide', label: 'Niacinamide' },
      { value: 'bpo', label: 'Benzoyl peroxide' },
      { value: 'azelaic', label: 'Azelaic acid' },
      { value: 'none', label: 'None / not sure' },
    ],
    exclusive: ['none'] },
  { id: 'retinoidExp', section: 'routine', type: 'single',
    title: 'Your experience with retinoids?',
    when: (a) => a.pregnancy === 'none' || !a.pregnancy,
    options: [
      { value: 'never', label: 'Never tried one' },
      { value: 'tolerated', label: 'Used one; my skin was fine' },
      { value: 'irritated', label: 'Used one; it irritated me' },
      { value: 'current', label: 'Using one now, no problems' },
    ] },
  { id: 'steps', section: 'routine', type: 'single',
    title: 'How much routine will you really do?',
    options: [
      { value: 'minimal', label: 'Minimal: 3 steps, about 2 minutes' },
      { value: 'moderate', label: 'Moderate: 4–5 steps, about 5 minutes' },
      { value: 'full', label: 'Full: up to 7 steps, 10 minutes or more' },
    ] },
  { id: 'pace', section: 'routine', type: 'single',
    title: 'How fast should we bring in strong actives?',
    options: [
      { value: 'gentle', label: 'Slow and gentle: fewer side effects' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'fast', label: 'Faster: my skin is tough' },
    ] },

  { id: 'budget', section: 'prefs', type: 'single',
    title: 'Budget per product?',
    options: [
      { value: 'budget', label: 'Under S$25' },
      { value: 'mid', label: 'S$25–60' },
      { value: 'splurge', label: 'S$60+ is fine' },
      { value: 'mix', label: 'Save on basics, spend on treatments' },
    ] },
  { id: 'texture', section: 'prefs', type: 'single',
    title: 'Textures you like?',
    options: [
      { value: 'light', label: 'Lightweight gels and fluids' },
      { value: 'rich', label: 'Creamy and nourishing' },
      { value: 'any', label: 'No preference' },
    ] },
  { id: 'prefs', section: 'prefs', type: 'multi', optional: true,
    title: 'Anything else that matters?',
    options: [
      { value: 'ff', label: 'Fragrance-free' },
      { value: 'alcoholfree', label: 'No drying alcohol' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'cf', label: 'Cruelty-free' },
      { value: 'mineral', label: 'Mineral sunscreen only' },
    ] },
];

export const Q_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));

export function visibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.when || q.when(answers));
}

export function optionsFor(q, answers) {
  return q.optionsFrom ? q.optionsFrom(answers) : q.options;
}

export function isAnswered(q, answers) {
  const v = answers[q.id];
  if (q.optional) return true;
  if (q.type === 'multi') return Array.isArray(v) && v.length > 0;
  if (q.type === 'text') return true;
  return v !== undefined && v !== null && v !== '';
}

export function isComplete(answers) {
  return visibleQuestions(answers).every((q) => isAnswered(q, answers));
}

// Remove answers to questions that are now hidden (e.g. acne follow-ups after un-ticking acne).
export function pruneAnswers(answers) {
  const out = { ...answers };
  for (const q of QUESTIONS) {
    if (q.when && !q.when(out)) delete out[q.id];
  }
  if (out.topConcern && Array.isArray(out.concerns) && !out.concerns.includes(out.topConcern)) delete out.topConcern;
  return out;
}
