// Merge two stored snapshots: the newer value (by updatedAt) wins, item by item.
// Snapshot shape:
// { docs: { name: { value, updatedAt } },
//   days: { col: { 'YYYY-MM-DD': { value, updatedAt } } },
//   history: { id: { value, updatedAt } } }

export function emptySnapshot() {
  return { docs: {}, days: { checklist: {}, journal: {} }, history: {} };
}

const newer = (a, b) => (a && (!b || (a.updatedAt || '') > (b.updatedAt || '')));

export function mergeSnapshots(local, cloud) {
  local = local || emptySnapshot();
  cloud = cloud || emptySnapshot();
  const merged = emptySnapshot();
  const uploads = { docs: [], days: [], history: [] };

  for (const name of new Set([...Object.keys(local.docs || {}), ...Object.keys(cloud.docs || {})])) {
    const l = local.docs[name];
    const c = cloud.docs[name];
    if (newer(l, c)) { merged.docs[name] = l; uploads.docs.push(name); } else if (c) merged.docs[name] = c;
  }
  const cols = new Set([...Object.keys(local.days || {}), ...Object.keys(cloud.days || {})]);
  for (const col of cols) {
    merged.days[col] = {};
    const ld = (local.days && local.days[col]) || {};
    const cd = (cloud.days && cloud.days[col]) || {};
    for (const date of new Set([...Object.keys(ld), ...Object.keys(cd)])) {
      if (newer(ld[date], cd[date])) { merged.days[col][date] = ld[date]; uploads.days.push([col, date]); } else if (cd[date]) merged.days[col][date] = cd[date];
    }
  }
  for (const id of new Set([...Object.keys(local.history || {}), ...Object.keys(cloud.history || {})])) {
    const l = local.history[id];
    const c = cloud.history[id];
    if (newer(l, c)) { merged.history[id] = l; uploads.history.push(id); } else if (c) merged.history[id] = c;
  }
  return { merged, uploads };
}

// Imported backups win over what's stored (they are re-stamped as new).
export function stampAll(snapshot, when = new Date().toISOString()) {
  const out = emptySnapshot();
  for (const [k, v] of Object.entries(snapshot.docs || {})) out.docs[k] = { value: v.value, updatedAt: when };
  for (const [col, days] of Object.entries(snapshot.days || {})) {
    out.days[col] = {};
    for (const [d, v] of Object.entries(days)) out.days[col][d] = { value: v.value, updatedAt: when };
  }
  for (const [id, v] of Object.entries(snapshot.history || {})) out.history[id] = { value: v.value, updatedAt: when };
  return out;
}
