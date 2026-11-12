// Ramp-up plan: bring strong actives in slowly, one at a time.
// Each item may have item.ramp: 'retinoid' | 'retinoid-gentle' | 'exfoliant' | 'bpo' | 'gentle-start' | null
// item.fixed (prescriptions) are never ramped by the app: your doctor's plan applies.

export function phaseLength(profile) {
  return { gentle: 3, balanced: 2, fast: 1 }[profile.pace] || 2;
}

export function repairWeeks(profile) {
  if (!profile.barrierDamaged) return 0;
  return { gentle: 4, balanced: 3, fast: 2 }[profile.pace] || 3;
}

function ladder(type, target) {
  let rungs = [];
  if (type === 'retinoid') rungs = [2, 3, 4, 5];
  else if (type === 'retinoid-gentle') rungs = [3, 5];
  else if (type === 'exfoliant') rungs = [1, 2, 3];
  else if (type === 'bpo') rungs = [3, 5];
  else if (type === 'gentle-start') rungs = [4];
  rungs = rungs.filter((r) => r < target);
  return rungs.concat([target]);
}

export function rampPlan(items, profile) {
  const len = phaseLength(profile);
  const repair = repairWeeks(profile);
  const plans = {};
  let nextStrongStart = repair + 1;
  for (const item of items) {
    const target = item.freq || 0;
    if (!target) continue;
    const gentleEnough = (item.irritation || 0) <= 0.5 && !item.ramp;
    const start = item.fixed || gentleEnough ? 1 : (item.ramp && item.ramp !== 'gentle-start' ? nextStrongStart : repair + 1);
    const rungs = item.fixed ? [target] : ladder(item.ramp, target);
    plans[item.key] = {
      start,
      ladder: rungs.map((perWeek, i) => ({ fromWeek: start + i * len, perWeek })),
    };
    if (item.ramp && item.ramp !== 'gentle-start' && !item.fixed) nextStrongStart = start + len * 2;
  }
  return { phaseLen: len, repairWeeks: repair, plans };
}

export function freqsForWeek(plan, week) {
  const out = {};
  for (const [key, p] of Object.entries(plan.plans)) {
    let f = 0;
    for (const rung of p.ladder) if (week >= rung.fromWeek) f = rung.perWeek;
    out[key] = f;
  }
  return out;
}

// Group weeks with identical frequencies into phases. The last phase is open-ended (toWeek: null).
export function phasesFrom(plan) {
  let last = 1;
  for (const p of Object.values(plan.plans)) for (const r of p.ladder) last = Math.max(last, r.fromWeek);
  const phases = [];
  for (let w = 1; w <= last; w++) {
    const freqs = freqsForWeek(plan, w);
    const prev = phases[phases.length - 1];
    if (prev && JSON.stringify(prev.freqs) === JSON.stringify(freqs)) {
      prev.toWeek = w;
    } else {
      if (prev) prev.toWeek = w - 1;
      phases.push({ fromWeek: w, toWeek: w, freqs });
    }
  }
  phases[phases.length - 1].toWeek = null;
  return phases;
}

export function weekLabel(from, to) {
  if (to === null || to === undefined) return `Week ${from} onwards`;
  if (from === to) return `Week ${from}`;
  return `Weeks ${from}–${to}`;
}
