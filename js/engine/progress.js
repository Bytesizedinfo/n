// Checklist completion, streaks and journal insights.

import { dueKeys } from './routine.js';
import { addDays, daysBetween, formatDate } from './dates.js';

// record: { am: { key: true }, pm: { key: true } }
export function slotDone(routine, dateStr, record, slot) {
  const keys = dueKeys(routine, dateStr, slot);
  const done = (record && record[slot]) || {};
  return keys.length > 0 && keys.every((k) => done[k]);
}

export function dayDone(routine, dateStr, record) {
  return slotDone(routine, dateStr, record, 'am') && slotDone(routine, dateStr, record, 'pm');
}

// Consecutive complete days ending today (or yesterday if today isn't finished yet).
export function streak(routine, checklist, today) {
  if (!routine) return 0;
  let d = today;
  if (!dayDone(routine, d, checklist[d])) d = addDays(d, -1);
  let n = 0;
  while (n < 3650 && dayDone(routine, d, checklist[d])) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function completionRate(routine, checklist, today, days = 14) {
  let done = 0;
  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(today, -i);
    if (routine.startDate && daysBetween(routine.startDate, d) < 0) break;
    for (const slot of ['am', 'pm']) {
      total++;
      if (slotDone(routine, d, checklist[d], slot)) done++;
    }
  }
  return total ? done / total : 0;
}

export const RATINGS = [
  { key: 'breakouts', label: 'Breakouts', low: 'None', high: 'Lots' },
  { key: 'redness', label: 'Redness / irritation', low: 'Calm', high: 'Very red' },
  { key: 'dryness', label: 'Dryness / tightness', low: 'Comfortable', high: 'Very dry' },
  { key: 'oiliness', label: 'Oiliness', low: 'Matte', high: 'Very shiny' },
];

export const TAGS = ['period', 'poor sleep', 'stressed', 'new product', 'lots of sun', 'workout', 'travel', 'alcohol', 'sweets', 'picked a spot'];

function avg(list) {
  return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
}

// entries: { 'YYYY-MM-DD': { ratings: { breakouts: 0–4 … }, tags: [], note } }
export function journalInsights(entries, { today, shelf = [] } = {}) {
  const out = [];
  const dates = Object.keys(entries).sort();
  if (dates.length < 3) return out;
  const val = (d, k) => (entries[d] && entries[d].ratings && typeof entries[d].ratings[k] === 'number' ? entries[d].ratings[k] : null);
  const inRange = (from, to) => dates.filter((d) => d >= from && d <= to);

  // Week-on-week trend
  const last7 = inRange(addDays(today, -6), today);
  const prev7 = inRange(addDays(today, -13), addDays(today, -7));
  if (last7.length >= 3 && prev7.length >= 3) {
    for (const r of RATINGS) {
      const a = avg(prev7.map((d) => val(d, r.key)).filter((x) => x !== null));
      const b = avg(last7.map((d) => val(d, r.key)).filter((x) => x !== null));
      if (a === null || b === null) continue;
      const diff = b - a;
      if (Math.abs(diff) >= 0.5) {
        out.push({ level: diff < 0 ? 'good' : 'warn', text: `${r.label} ${diff < 0 ? 'down' : 'up'} this week (${a.toFixed(1)} → ${b.toFixed(1)} out of 4).` });
      }
    }
  }

  // Tags vs breakouts / redness (same day and the next two days)
  for (const tag of TAGS) {
    const tagged = dates.filter((d) => (entries[d].tags || []).includes(tag));
    if (tagged.length < 3) continue;
    const near = new Set();
    tagged.forEach((d) => [0, 1, 2].forEach((i) => near.add(addDays(d, i))));
    for (const key of ['breakouts', 'redness']) {
      const inside = avg(dates.filter((d) => near.has(d)).map((d) => val(d, key)).filter((x) => x !== null));
      const outside = avg(dates.filter((d) => !near.has(d)).map((d) => val(d, key)).filter((x) => x !== null));
      if (inside !== null && outside !== null && inside - outside >= 0.7) {
        out.push({ level: 'info', text: `${key === 'breakouts' ? 'Breakouts' : 'Redness'} tend to be higher in the days around “${tag}” (${inside.toFixed(1)} vs ${outside.toFixed(1)}).` });
      }
    }
  }

  // Products added to the shelf
  for (const p of shelf) {
    if (!p.addedAt) continue;
    const added = p.addedAt.slice(0, 10);
    const before = inRange(addDays(added, -14), addDays(added, -1));
    const after = inRange(added, addDays(added, 14));
    if (before.length < 4 || after.length < 4) continue;
    for (const key of ['breakouts', 'redness']) {
      const a = avg(before.map((d) => val(d, key)).filter((x) => x !== null));
      const b = avg(after.map((d) => val(d, key)).filter((x) => x !== null));
      if (a !== null && b !== null && b - a >= 0.8) {
        out.push({ level: 'warn', text: `${key === 'breakouts' ? 'Breakouts' : 'Redness'} went up after you added ${p.name} on ${formatDate(added)}. Unless it’s a retinoid or acid in its first weeks (purging), consider pausing it.` });
      }
    }
  }
  return out;
}
