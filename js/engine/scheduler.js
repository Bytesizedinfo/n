// Weekly scheduler: places treatment items into a 7-day AM/PM grid.
// - clashing items never share a routine
// - each routine stays under its step cap (extras like masks don't count)
// - a routine's total irritation stays within the person's tolerance
// - days are spread as evenly as possible
// Days: 0 = Monday … 6 = Sunday.

import { mustSeparate } from '../data/interactions.js';

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SUBSETS = (() => {
  const bySize = Array.from({ length: 8 }, () => []);
  for (let mask = 0; mask < 128; mask++) {
    const days = [];
    for (let d = 0; d < 7; d++) if (mask & (1 << d)) days.push(d);
    bySize[days.length].push(days);
  }
  return bySize;
})();

// Preferred patterns, so schedules look familiar (Mon/Wed/Fri etc.).
const PREFERRED = {
  1: [[5], [2]],
  2: [[1, 4], [0, 3], [2, 5]],
  3: [[0, 2, 4], [1, 3, 5], [0, 3, 5]],
  4: [[0, 2, 4, 6], [1, 3, 5, 6]],
  5: [[0, 1, 3, 4, 6], [0, 2, 3, 4, 6]],
  6: [[0, 1, 2, 3, 4, 5]],
};

function evenness(days) {
  const k = days.length;
  if (k <= 1 || k === 7) return 0;
  const ideal = 7 / k;
  let cost = 0;
  for (let i = 0; i < k; i++) {
    const a = days[i];
    const b = i + 1 < k ? days[i + 1] : days[0] + 7;
    cost += (b - a - ideal) ** 2;
  }
  return cost;
}

function isPreferred(days) {
  const list = PREFERRED[days.length] || [];
  return list.findIndex((p) => p.join() === days.join());
}

export function schedule(items, { caps = { am: 3, pm: 3 }, tolerance = 3, sensitivity = 0 } = {}) {
  const grid = Array.from({ length: 7 }, () => ({ am: [], pm: [] }));
  const placed = {};
  const notes = [];
  const byKey = {};

  for (const item of items) {
    byKey[item.key] = item;
    const freq = Math.min(7, item.freq || 0);
    if (freq <= 0) continue;
    const minFreq = Math.min(freq, item.minFreq ?? 1);
    let best = null;
    for (const slot of item.slots) {
      for (let k = freq; k >= minFreq; k--) {
        const days = bestDays(item, slot, k, grid, byKey, caps, tolerance, sensitivity);
        if (days) {
          if (!best || k > best.k) best = { slot, k, days };
          break;
        }
      }
      if (best && best.k === freq) break;
    }
    if (!best) {
      notes.push({ key: item.key, type: 'dropped' });
      continue;
    }
    if (best.k < freq) notes.push({ key: item.key, type: 'reduced', from: freq, to: best.k, slot: best.slot });
    for (const d of best.days) grid[d][best.slot].push(item.key);
    placed[item.key] = { slot: best.slot, days: best.days };
  }
  return { grid, placed, notes };
}

function dayState(grid, d, slot, byKey) {
  const keys = grid[d][slot];
  let count = 0;
  let irritation = 0;
  for (const k of keys) {
    const it = byKey[k];
    if (!it.extra) count++;
    irritation += it.irritation || 0;
  }
  return { keys, count, irritation };
}

function bestDays(item, slot, k, grid, byKey, caps, tolerance, sensitivity) {
  let best = null;
  let bestCost = Infinity;
  for (const days of SUBSETS[k]) {
    let ok = true;
    let load = 0;
    for (const d of days) {
      const st = dayState(grid, d, slot, byKey);
      if (!item.extra && st.count >= (caps[slot] ?? 3)) { ok = false; break; }
      if (st.keys.some((key) => key === item.key)) { ok = false; break; }
      if (st.keys.some((key) => mustSeparate(item.actives || [], byKey[key].actives || [], sensitivity))) { ok = false; break; }
      const total = st.irritation + (item.irritation || 0);
      if (st.keys.length > 0 && total > tolerance + 1e-9) { ok = false; break; }
      // Whole-day limit (AM + PM), so strong mornings and strong nights don't pile up.
      const other = dayState(grid, d, slot === 'am' ? 'pm' : 'am', byKey).irritation;
      if (other > 0 && other + total > tolerance * 1.75 + 1e-9) { ok = false; break; }
      // Strong items on consecutive nights add up; prefer gaps.
      const prev = (d + 6) % 7;
      const prevIrr = dayState(grid, prev, slot, byKey).irritation;
      load += st.irritation * 2 + st.count + (item.irritation >= 1.5 ? prevIrr * 0.3 : 0);
    }
    if (!ok) continue;
    const pref = isPreferred(days);
    const cost = evenness(days) * 3 + load * (item.extra ? 3 : 1) + (pref >= 0 ? -0.5 + pref * 0.1 : 0);
    if (cost < bestCost - 1e-9) {
      bestCost = cost;
      best = days;
    }
  }
  return best;
}

export function daysLabel(days) {
  if (!days || !days.length) return '';
  if (days.length === 7) return 'Every day';
  return days.map((d) => DAY_NAMES[d]).join(' · ');
}

export function freqLabel(n, slot) {
  const when = slot === 'am' ? 'morning' : 'night';
  if (n >= 7) return slot === 'am' ? 'Every morning' : 'Every night';
  if (n === 1) return `1 ${when} a week`;
  return `${n} ${when}s a week`;
}
