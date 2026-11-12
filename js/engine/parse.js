// Read an ingredient list (pasted or from a photo) and work out the actives and flags.

import { INGREDIENTS, BY_ID, FUNGAL_TRIGGER_PATTERNS } from '../data/ingredients.js';

const ESC = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Precompiled alias matchers, longest first.
const MATCHERS = INGREDIENTS.flatMap((ing) => ing.aliases.map((alias) => ({
  id: ing.id,
  alias,
  exact: (ing.exact || []).includes(alias),
  re: new RegExp('(^|[^a-z0-9])' + ESC(alias) + '(?=$|[^a-z0-9])', 'g'),
}))).sort((a, b) => b.alias.length - a.alias.length);

// Abbreviations that appear in product names and marketing text.
const ABBREV = [
  { re: /\bbha\b/, id: 'salicylic' },
  { re: /\baha\b/, id: 'aha' },
  { re: /\bpha\b/, id: 'pha' },
  { re: /\bvit(?:amin)?\.?\s*c\b/, id: 'laa' },
  { re: /\bvit(?:amin)?\.?\s*b3\b/, id: 'niacinamide' },
  { re: /\bvit(?:amin)?\.?\s*b5\b/, id: 'panthenol' },
  { re: /\bcica\b/, id: 'centella' },
  { re: /\bbp\b|\bbenzoyl\b/, id: 'bpo' },
  { re: /\bretinoid\b/, id: 'retinol' },
  { re: /\bceramides?\b/, id: 'ceramides' },
  { re: /\bhyaluronic\b/, id: 'ha' },
  { re: /\btxa\b/, id: 'tranexamic' },
];

export function normalise(text) {
  return (text || '')
    .replace(/-\s*\n\s*/g, '') // words split across lines by OCR
    .replace(/\r/g, '')
    .replace(/^[\s\S]*?\b(ingredients|composition|inci)\s*[:：]/i, '') // drop text before "Ingredients:"
    .toLowerCase();
}

export function tokenise(text) {
  return normalise(text)
    .split(/[,;•·•\n|]+|\.\s+(?=[a-z])/)
    .map((t) => t.replace(/[*†‡]+/g, '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 1);
}

function variants(token) {
  const v = new Set([token]);
  const noParens = token.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  v.add(noParens);
  const m = token.match(/^(.*?)\(([^)]+)\)\s*(.*)$/);
  if (m) v.add((m[2] + ' ' + m[3]).trim()); // "cocos nucifera (coconut) oil" -> "coconut oil"
  return [...v];
}

// All non-overlapping alias hits in a piece of text, preferring longer aliases.
function hitsIn(text) {
  const hits = [];
  const taken = [];
  for (const m of MATCHERS) {
    if (m.exact) {
      if (text === m.alias) hits.push({ id: m.id, alias: m.alias, start: 0, end: text.length });
      continue;
    }
    m.re.lastIndex = 0;
    let r;
    while ((r = m.re.exec(text))) {
      const start = r.index + r[1].length;
      const end = start + m.alias.length;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      hits.push({ id: m.id, alias: m.alias, start, end });
    }
  }
  return hits;
}

function strengths(text) {
  const out = {};
  const t = normalise(text);
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*%\s*([a-z][a-z0-9\- ]{1,40})/g,
    /([a-z][a-z0-9\- ]{1,40}?)\s*(\d+(?:[.,]\d+)?)\s*%/g,
  ];
  patterns.forEach((re, i) => {
    let m;
    while ((m = re.exec(t))) {
      const pct = parseFloat((i === 0 ? m[1] : m[2]).replace(',', '.'));
      const name = (i === 0 ? m[2] : m[1]).trim();
      const ids = hitsIn(name).map((h) => h.id).concat(ABBREV.filter((a) => a.re.test(name)).map((a) => a.id));
      const id = i === 0 ? ids[0] : ids[ids.length - 1];
      if (id && !isNaN(pct) && pct > 0 && pct <= 100 && out[id] === undefined) out[id] = pct;
    }
  });
  return out;
}

export function guessCategory(name = '', actives = []) {
  const n = name.toLowerCase();
  const hasGroup = (g) => actives.some((a) => BY_ID[a] && BY_ID[a].group === g);
  if (/\bspf\b|sunscreen|sun ?cream|sun ?serum|sun ?gel|sun ?milk|sun ?stick|\buv\b|anthelios/.test(n)) return 'sunscreen';
  if (/cleansing (oil|balm|water)|micellar|make-?up remover|clean it zero/.test(n)) return 'oil-cleanser';
  if (/cleanser|face ?wash|facial (wash|foam)|foaming|cleansing (gel|foam)|\bwash\b|whip/.test(n)) return 'cleanser';
  if (/\bmask|masque|peeling solution|sleeping/.test(n)) return 'mask';
  if (/patch/.test(n)) return 'spot';
  if (/drying lotion|spot (treatment|gel|corrector)/.test(n)) return 'spot';
  if ((/toner|liquid|exfoliant|exfoliating|solution|peel/.test(n)) && hasGroup('exfoliant')) return 'exfoliant';
  if (/toner|essence|\blotion\b.*(hydrat|moist)|softener/.test(n) && !/body/.test(n)) return 'toner';
  if (/serum|ampoule|booster|drops|solution|concentrate|suspension/.test(n)) return hasGroup('retinoid') || hasGroup('bpo') ? 'treatment' : 'serum';
  if (/cream|moisturi[sz]|emulsion|lotion|balm|gel/.test(n)) return hasGroup('retinoid') || hasGroup('bpo') ? 'treatment' : 'moisturizer';
  if (actives.includes('spf-mineral') || actives.includes('spf-chemical')) return 'sunscreen';
  if (hasGroup('exfoliant')) return 'exfoliant';
  if (hasGroup('retinoid') || hasGroup('bpo') || hasGroup('azelaic')) return 'treatment';
  return 'serum';
}

// Main entry: analyse a product from its name and/or ingredient text.
export function analyse({ name = '', text = '' } = {}) {
  const tokens = tokenise(text);
  const found = [];
  for (const tok of tokens) {
    const seen = new Set();
    for (const v of variants(tok)) {
      for (const h of hitsIn(v)) {
        if (seen.has(h.id)) continue;
        seen.add(h.id);
        found.push({ id: h.id, alias: h.alias, token: tok });
      }
    }
  }
  const nameLower = name.toLowerCase();
  for (const h of hitsIn(nameLower)) {
    if (!found.some((f) => f.id === h.id)) found.push({ id: h.id, alias: h.alias, token: '(name)' });
  }
  for (const a of ABBREV) {
    if (a.re.test(nameLower) && !found.some((f) => f.id === a.id || (BY_ID[f.id] && BY_ID[a.id] && BY_ID[f.id].group === BY_ID[a.id].group && a.id !== 'ceramides'))) {
      found.push({ id: a.id, alias: a.re.source, token: '(name)' });
    }
  }

  const actives = [...new Set(found.map((f) => f.id))];
  const strength = { ...strengths(name), ...strengths(text) };
  for (const id of Object.keys(strength)) if (!actives.includes(id)) actives.push(id);

  const fungal = tokens.filter((t) => FUNGAL_TRIGGER_PATTERNS.some((re) => re.test(t)));
  const comedogenic = found.filter((f) => f.id === 'comedogenic').map((f) => f.token);
  const hasInci = tokens.length >= 4;
  const spfMatch = (name + ' ' + text).toLowerCase().match(/spf\s*(\d{2})/);

  const flags = {
    ff: hasInci ? !actives.includes('fragrance') : null,
    eo: actives.includes('eo') || actives.includes('teatree'),
    alcohol: actives.includes('alcohol'),
  };
  return {
    name: name.trim(),
    cat: guessCategory(name, actives),
    actives,
    strength,
    flags,
    fungalTriggers: fungal.slice(0, 8),
    comedogenicHits: comedogenic,
    spf: spfMatch ? parseInt(spfMatch[1], 10) : null,
    tokens,
    found,
    unknownCount: tokens.filter((t) => !found.some((f) => f.token === t)).length,
  };
}

// Which of the person's "avoid" words appear in an ingredient list.
export function avoidWordHits(text, words) {
  const t = normalise(text);
  return (words || []).filter((w) => w && t.includes(w));
}
