/* JC.mapview — the shared map of the region (Yunmeng · Lanling · Gusu · Qinghe · Yiling).
   Geography + places seed, a road graph with turn-by-turn routing, a canvas renderer with
   pan / zoom / pinch / rotate, DOM pins, the pulsing user dot, a detent sheet, and static thumbnails.
   Used by Maps, Find My, Swift Ride and Lotus Eats. World units are kilometres (x → east, y → south). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const TAU = Math.PI * 2;

  // ── extra glyphs shared by the map apps ─────────────────────────────────
  const FL = 'fill="currentColor" stroke="none"';
  JC.icon.add({
    'fork.knife': '<path d="M7 3v7.2a2 2 0 0 0 2 2V21M5 3v6M9 3v6"/><path d="M17.5 21V3c-2.4 1.2-3.4 4-3.4 7.2v3.6h3.4"/>',
    'cup.and.saucer.fill': `<path d="M5 8.5h11.5v4.8a4.7 4.7 0 0 1-4.7 4.7H9.7A4.7 4.7 0 0 1 5 13.3z" ${FL}/><path d="M16.5 10h1.3a2.3 2.3 0 0 1 0 4.6h-1.3M3.5 20.5h15.5M8.6 2.8c-.7.9-.7 1.8 0 2.7M12.1 2.8c-.7.9-.7 1.8 0 2.7"/>`,
    'building.columns.fill': `<path d="M12 2.8 3.2 7.4v1.8h17.6V7.4z" ${FL}/><path d="M5.6 11.2v6.4M9.9 11.2v6.4M14.1 11.2v6.4M18.4 11.2v6.4" stroke-width="2.3"/><path d="M3.2 20.2h17.6" stroke-width="2.4"/>`,
    'graduationcap.fill': `<path d="M12 4 2.3 8.9 12 13.8l9.7-4.9z" ${FL}/><path d="M6.4 11.3v4.4c0 1.6 2.5 3.1 5.6 3.1s5.6-1.5 5.6-3.1v-4.4M21.3 9.2v5.2"/>`,
    'tree.fill': `<path d="M12 2.6c-3.1 0-5.4 2.4-5.4 5.3a4.4 4.4 0 0 0 1.8 8.4h7.2a4.4 4.4 0 0 0 1.8-8.4c0-2.9-2.3-5.3-5.4-5.3z" ${FL}/><path d="M12 12.2v9" stroke-width="2.4"/>`,
    'tram.fill': `<rect x="5.8" y="4.2" width="12.4" height="13" rx="3" ${FL}/><path d="M8.3 20.6 9.8 17.2M15.7 20.6l-1.5-3.4M10 2.4h4"/><path d="M8.6 8.2h6.8" style="stroke:var(--knock,#fff)"/><circle cx="9.1" cy="13.6" r="1.1" style="fill:var(--knock,#fff)" stroke="none"/><circle cx="14.9" cy="13.6" r="1.1" style="fill:var(--knock,#fff)" stroke="none"/>`,
    'shield.fill': `<path d="M12 2.6 4.4 5.5v5.7c0 4.7 3.2 8.6 7.6 10.2 4.4-1.6 7.6-5.5 7.6-10.2V5.5z" ${FL}/>`,
    'binoculars.fill': `<path d="M4 15.6 6.2 6.4A2.1 2.1 0 0 1 8.2 4.8h.5a1.8 1.8 0 0 1 1.8 1.8V9h3V6.6a1.8 1.8 0 0 1 1.8-1.8h.5a2.1 2.1 0 0 1 2 1.6L20 15.6"/><circle cx="6.8" cy="16.3" r="3.7" ${FL}/><circle cx="17.2" cy="16.3" r="3.7" ${FL}/><path d="M10.5 12.2h3"/>`,
    'location.north.fill': `<path d="M12 2.4 19.6 20.6 12 16.7 4.4 20.6z" ${FL}/>`,
    'location.north.line': '<path d="M12 2.6 19.4 20.4 12 16.6 4.6 20.4z"/>',
    'square.3.layers': `<path d="M12 3.4 21 8l-9 4.6L3 8z" ${FL}/><path d="m3 12.2 9 4.6 9-4.6M3 16.4 12 21l9-4.6"/>`,
    'arrow.turn.up.left': '<path d="M17 21v-7.2a4 4 0 0 0-4-4H5.2"/><path d="m9.2 5.8-4 4 4 4"/>',
    'arrow.turn.up.right': '<path d="M7 21v-7.2a4 4 0 0 1 4-4h7.8"/><path d="m14.8 5.8 4 4-4 4"/>',
    'arrow.slight.left': '<path d="M15.5 21v-6.4c0-1.8-.7-3.5-2-4.8L7.6 4.4"/><path d="M7.2 10V4.2h5.8"/>',
    'arrow.slight.right': '<path d="M8.5 21v-6.4c0-1.8.7-3.5 2-4.8l5.9-5.4"/><path d="M16.8 10V4.2H11"/>',
    'arrow.uturn.left': '<path d="M16.5 21V9.4a5 5 0 0 0-10 0V14"/><path d="m3.2 10.8 3.3 3.6 3.3-3.6"/>',
    'arrow.straight': '<path d="M12 21V4"/><path d="m6.5 9.5 5.5-5.5 5.5 5.5"/>',
    'flag.checkered': `<path d="M5 21V3.6"/><path d="M5 4h14l-2.6 4.2L19 12.4H5" ${FL}/>`,
    'bicycle': '<circle cx="6" cy="15.6" r="3.6"/><circle cx="18" cy="15.6" r="3.6"/><path d="M6 15.6 9.6 8h6.2L18 15.6M9.6 8l2.6 7.6H6M14 4.8h2.6l-.8 3.2"/>',
    'airtag': `<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="3.2" ${FL}/>`,
    'storefront.fill': `<path d="M4 9.4 5.6 4h12.8L20 9.4"/><path d="M4 9.4c0 1.4 1.2 2.6 2.7 2.6s2.6-1.2 2.6-2.6c0 1.4 1.2 2.6 2.7 2.6s2.7-1.2 2.7-2.6c0 1.4 1.1 2.6 2.6 2.6S20 10.8 20 9.4z" ${FL}/><path d="M5.6 12.6V20h12.8v-7.4M10 20v-4.4h4V20"/>`,
    'mountain.2.fill': `<path d="M2 20 9 7.2l4 7 2.2-3.2L22 20z" ${FL}/>`,
    'water.waves': '<path d="M3 8c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 13c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0M3 18c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/>',
    'scooter': '<circle cx="6" cy="17.4" r="2.6"/><circle cx="18.4" cy="17.4" r="2.6"/><path d="M6 17.4h7.6l2-9H18M15.6 8.4 14.2 5h-3M8.6 17.4c0-2.5 1.6-4.6 4.6-4.6"/>',
    'figure.walk.motion': '<circle cx="13" cy="4.4" r="1.9" fill="currentColor" stroke="none"/><path d="m9.5 21 2.2-6 2.6 2.4V21M8 11.6l2.4-3.5 3-.4 2.4 3.2 2.6 1M11.7 8l-.4 6.4"/>',
    'car.top': `<rect x="7" y="2.8" width="10" height="18.4" rx="4" ${FL}/>`,
    'person.2.wave': '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.5-3.2 2.8-5.2 5.5-5.2s5 2 5.5 5.2"/><path d="M16.5 5.5a3 3 0 0 1 0 5.6M18.5 13.6c1.4.8 2.3 2.4 2.6 4.4"/>',
    'pencil.line': '<path d="M14.8 4.6 19.4 9.2 9 19.6l-5 1 1-5z"/><path d="M13 20.6h7.5"/>',
    'arrow.triangle.swap': '<path d="M7 20V5M3.5 8.5 7 5l3.5 3.5M17 4v15M13.5 15.5 17 19l3.5-3.5"/>',
    'list.dash': '<path d="M9 6h11.5M9 12h11.5M9 18h11.5M4 6h1.5M4 12h1.5M4 18h1.5"/>',
    'exclamationmark.bubble': '<path d="M12 4.2c-4.8 0-8.5 3.1-8.5 7 0 2.2 1.2 4.2 3.1 5.5-.2 1.2-.8 2.3-1.7 3.1 1.9 0 3.6-.7 4.8-1.7.7.1 1.5.2 2.3.2 4.8 0 8.5-3.1 8.5-7S16.8 4.2 12 4.2z"/><path d="M12 8v4.2M12 15h.01"/>',
    'cube.box': '<path d="M12 2.8 20.4 7.4v9.2L12 21.2l-8.4-4.6V7.4z"/><path d="M3.6 7.4 12 12l8.4-4.6M12 12v9.2"/>',
    'parkingsign': '<rect x="4" y="3.5" width="16" height="17" rx="3.4"/><path d="M9.6 17V7.6h3.2a2.8 2.8 0 0 1 0 5.6H9.6"/>',
    'fuelpump': '<rect x="4" y="3.5" width="9.5" height="17" rx="1.6"/><path d="M6.4 8h4.6M13.5 10.5h2.2a1.6 1.6 0 0 1 1.6 1.6v4.6a1.4 1.4 0 0 0 2.8 0V8.2L17.6 6"/>',
  });

  // ── small geometry helpers ───────────────────────────────────────────────
  function chaikin(pts, iters, closed) {
    let p = pts;
    for (let k = 0; k < iters; k++) {
      const out = [];
      const n = p.length;
      const m = closed ? n : n - 1;
      for (let i = 0; i < m; i++) {
        const a = p[i], b = p[(i + 1) % n];
        out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      if (!closed) { out.unshift(p[0].slice()); out.push(p[n - 1].slice()); }
      p = out;
    }
    return p;
  }
  function blob(cx, cy, rx, ry, n, seed, jit, rot) {
    n = n || 14; jit = jit == null ? 0.18 : jit; rot = rot || 0;
    const r = rng(seed || Math.round(cx * 131 + cy * 17));
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const k = 1 + (r() - 0.5) * 2 * jit;
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return pts;
  }
  function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function cumul(pts) { const c = [0]; for (let i = 1; i < pts.length; i++) c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return c; }
  function pip(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function bboxOf(pts) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1]; }
    return { x0, y0, x1, y1 };
  }
  function centroid(pts) { let x = 0, y = 0; pts.forEach((p) => { x += p[0]; y += p[1]; }); return [x / pts.length, y / pts.length]; }
  function segInt(a, b, c, d) {
    const r1 = b[0] - a[0], r2 = b[1] - a[1], s1 = d[0] - c[0], s2 = d[1] - c[1];
    const den = r1 * s2 - r2 * s1;
    if (Math.abs(den) < 1e-12) return null;
    const t = ((c[0] - a[0]) * s2 - (c[1] - a[1]) * s1) / den;
    const u = ((c[0] - a[0]) * r2 - (c[1] - a[1]) * r1) / den;
    if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
    return { t: clamp(t, 0, 1), u: clamp(u, 0, 1), x: a[0] + r1 * t, y: a[1] + r2 * t };
  }
  function projSeg(px, py, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L2 = dx * dx + dy * dy;
    let t = L2 ? ((px - a[0]) * dx + (py - a[1]) * dy) / L2 : 0;
    t = clamp(t, 0, 1);
    const x = a[0] + dx * t, y = a[1] + dy * t;
    return { t, x, y, d: Math.hypot(px - x, py - y) };
  }
  /** point & heading at distance s along a polyline (with its cumulative lengths) */
  function along(pts, cum, s) {
    if (s <= 0) return { x: pts[0][0], y: pts[0][1], a: Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0]), i: 0 };
    const L = cum[cum.length - 1];
    if (s >= L) { const n = pts.length; return { x: pts[n - 1][0], y: pts[n - 1][1], a: Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]), i: n - 2 }; }
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
    const seg = cum[lo + 1] - cum[lo] || 1e-9;
    const t = (s - cum[lo]) / seg;
    const a = pts[lo], b = pts[lo + 1];
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, a: Math.atan2(b[1] - a[1], b[0] - a[0]), i: lo };
  }
  function subLine(pts, cum, s0, s1) {
    const rev = s1 < s0;
    if (rev) { const t = s0; s0 = s1; s1 = t; }
    const out = [];
    const p0 = along(pts, cum, s0);
    out.push([p0.x, p0.y]);
    for (let i = 0; i < pts.length; i++) if (cum[i] > s0 + 1e-6 && cum[i] < s1 - 1e-6) out.push(pts[i].slice());
    const p1 = along(pts, cum, s1);
    out.push([p1.x, p1.y]);
    return rev ? out.reverse() : out;
  }
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hash2(i, j, k) {
    let x = (Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul((k || 0) | 0, 1442695041)) | 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  const normA = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };

  // ═══ Geography ═══════════════════════════════════════════════════════════
  const WORLD = { w: 320, h: 240 };
  const SEA = chaikin([[309, -4], [324, -4], [324, 244], [300, 244], [302.5, 224], [308, 208], [305, 191], [310, 172], [306.4, 156], [311, 138], [307, 120], [312, 101], [308, 83], [313, 64], [309, 46], [314, 27], [310, 12]], 3, true);

  const LAKES = [
    { id: 'yunmeng', name: 'Yunmeng Lake', lz: 1.1, label: [262, 171], size: 15,
      pts: chaikin([[233, 165], [235, 157.5], [238.6, 152.2], [243, 149], [248.4, 147.4], [253.2, 147.6], [257.4, 148.3], [261.6, 149.1], [267, 149.9], [273, 151.4], [279, 154.6], [284.5, 159.6], [287.6, 165.6], [287, 172], [283.4, 178.6], [277.4, 184], [270, 187.6], [261.4, 189.2], [252.4, 188.6], [244.4, 186], [238.4, 181], [234.8, 174]], 3, true) },
    { id: 'peony', name: 'Peony Lake', lz: 26, label: [176.7, 86.3], size: 11, pts: chaikin(blob(176.7, 86.3, 1.25, 0.62, 10, 7, 0.12), 2, true) },
    { id: 'koi', name: 'Koi Pond', lz: 180, label: [171.28, 90.42], size: 10, pts: chaikin(blob(171.28, 90.42, 0.11, 0.07, 9, 3, 0.1), 2, true) },
    { id: 'cold', name: 'Cold Spring', lz: 60, label: [50.4, 62.2], size: 10, pts: chaikin(blob(50.4, 62.2, 0.34, 0.2, 9, 11, 0.15), 2, true) },
    { id: 'qinghe-res', name: 'Qinghe Reservoir', lz: 5, label: [160.5, 40.5], size: 11, pts: chaikin(blob(160.5, 40.5, 3.6, 1.7, 12, 5, 0.25, -0.3), 2, true) },
    { id: 'caiyi', name: 'Caiyi Lake', lz: 5, label: [88.5, 73.4], size: 11, pts: chaikin(blob(88.5, 73.4, 2.6, 1.3, 12, 9, 0.22, 0.2), 2, true) },
    { id: 'bihu', name: 'Lotus Bay', lz: 99, label: [266, 196], size: 10, pts: chaikin(blob(299.5, 230, 3, 2, 10, 4, 0.2), 2, true) },
  ];
  const RIVERS = [
    { name: 'Great River', w: 0.55, lz: 3, pts: chaikin([[-4, 95], [12, 93.5], [24, 96], [36, 94.5], [48, 97.5], [58, 96], [68, 93.2], [76, 93.2], [86, 98], [98, 101.5], [110, 100], [122, 103.5], [134, 102], [146, 103], [154, 101.2], [162, 100.4], [170, 100.8], [176, 100.2], [181, 99.4], [186, 100.6], [191, 103.6], [198, 109], [207, 115], [216, 121], [224, 128], [230, 136.4], [233.6, 145], [234.6, 153.4], [234.2, 159]], 3, false) },
    { name: 'Great River', w: 0.5, lz: 3, pts: chaikin([[287.2, 166.5], [293, 164.6], [299, 167.6], [304, 166.2], [312, 168.4]], 2, false) },
    { name: 'Cold Spring River', w: 0.13, lz: 6, pts: chaikin([[45.6, 51.4], [48.4, 56.6], [50.4, 62.2], [53.8, 67.4], [57.8, 71.4], [61.8, 74.8], [65.2, 78.6], [67.4, 82.4], [70.4, 87], [73.4, 90.8], [76, 93.2]], 2, false) },
    { name: 'Qing River', w: 0.22, lz: 4, pts: chaikin([[178, -4], [177.4, 10], [176.4, 18], [177.8, 27], [180, 36], [181.6, 48], [183.2, 60], [185.2, 72], [187.6, 84], [188.8, 93], [189.4, 99], [190.6, 102.8]], 2, false) },
  ];
  const MOUNTAINS = [
    { name: 'Gusu Mountains', lz: 1.1, mist: true, peak: [37, 37], peakName: 'Mount Gusu', ele: '1,620 m',
      pts: [[6, 44], [9, 31], [19, 19], [35, 13], [52, 17], [66, 26], [75, 39], [74.5, 51], [67.5, 61], [60, 66], [49, 67.5], [36, 67], [22, 62], [11, 54]] },
    { name: 'Cloud Peak', lz: 99, peak: [47.8, 57.6], peakName: 'Cloud Peak', ele: '1,104 m', pts: [[43, 60], [46, 54], [51, 53], [54.5, 57], [53, 61.5], [47.5, 62.4]] },
    { name: 'Qishan Hills', lz: 2, peak: [120, 25], peakName: 'Qishan', ele: '980 m', pts: [[92, 25], [100, 12], [118, 8], [136, 13], [146, 26], [142, 40], [128, 47], [110, 47], [97, 39]] },
    { name: 'Qiongqi Hills', lz: 2.5, peak: [136.6, 145], peakName: 'Qiongqi Pass', ele: '640 m', pts: [[118, 150], [123, 137], [136, 130], [149, 136], [150, 150], [142, 161], [128, 165]] },
    { name: 'Burial Mounds', lz: 3, dark: true, peak: [89.4, 179.6], peakName: 'Burial Mounds', ele: '412 m', pts: [[80, 182], [83, 174.5], [90, 171], [97, 174.5], [99.5, 182], [95, 189], [86.5, 190]] },
    { name: 'Guanyin Hill', lz: 6, peak: [288.6, 123.6], pts: [[283.4, 123], [287, 119.4], [292, 120.4], [294, 125.4], [290, 129], [285, 128.2]] },
    { name: 'Beiling Hills', lz: 2.5, peak: [182, 9], pts: [[158, 6], [170, 1.5], [192, 3], [201, 11], [195, 17], [181, 14.6], [166, 15]] },
  ];
  MOUNTAINS.forEach((m) => {
    const c = centroid(m.pts);
    m.layers = [1, 0.74, 0.5, 0.28].map((k, i) => chaikin(m.pts.map((p, j) => {
      const jit = 1 + (hash2(j, i, 9) - 0.5) * 0.16 * (i ? 1 : 0);
      return [c[0] + (p[0] - c[0]) * k * jit + (m.peak[0] - c[0]) * (1 - k), c[1] + (p[1] - c[1]) * k * jit + (m.peak[1] - c[1]) * (1 - k)];
    }), 3, true));
    m.bb = bboxOf(m.layers[0]);
  });

  const URBAN = [
    { id: 'lanling', name: 'Lanling', rank: 1, sp: 0.42, ang: 0.0, label: [170.4, 92.6], seed: 11,
      pts: [[148, 95], [149.5, 87], [155, 80], [163, 75.5], [172, 73.8], [181, 75], [189, 78.5], [195, 85], [197, 93], [195.5, 101], [191, 107.5], [183.5, 111.5], [174, 112.5], [164, 111], [156, 106.5], [150.5, 101.5]] },
    { id: 'yunmeng', name: 'Yunmeng', rank: 1, sp: 0.38, ang: -0.12, label: [274.6, 137.4], seed: 12,
      pts: [[253.4, 145.6], [256.5, 138], [262, 131.5], [270, 127.5], [279, 127.5], [286, 131], [290, 137.5], [288.5, 144.5], [282, 149.6], [273, 150.6], [264, 148.6]] },
    { id: 'gusu', name: 'Gusu', rank: 2, sp: 0.3, ang: 0.08, label: [71.4, 80.4], seed: 13, canals: true,
      pts: [[61, 82], [62.5, 76.5], [67, 73.5], [73, 74], [77.5, 78.5], [78, 85], [74.5, 90.5], [68, 91], [62.5, 88]] },
    { id: 'qinghe', name: 'Qinghe', rank: 2, sp: 0.38, ang: 0.2, label: [179.2, 31.4], seed: 14,
      pts: [[167, 29], [169, 22.5], [174.5, 18.8], [181.5, 19], [186.5, 24.5], [187, 32], [182, 37.5], [174, 38.5], [168.5, 35]] },
    { id: 'yiling', name: 'Yiling', rank: 3, sp: 0.34, ang: -0.06, label: [105.2, 189.2], seed: 15,
      pts: [[97, 190], [99.5, 185.5], [105, 184.5], [109.5, 187.5], [110, 193], [106, 197], [99.5, 196.5]] },
    { id: 'caiyi', name: 'Caiyi Town', rank: 4, sp: 0.28, ang: 0.3, label: [84.8, 78.2], seed: 16, pts: blob(84.8, 78.2, 2.1, 1.5, 12, 16, 0.2) },
    { id: 'qishan', name: 'Qishan', rank: 4, sp: 0.32, ang: -0.2, label: [121.4, 53.2], seed: 17, pts: blob(121.4, 53.2, 2.5, 1.7, 12, 17, 0.2) },
    { id: 'baling', name: 'Baling', rank: 4, sp: 0.32, ang: 0.1, label: [214.2, 62.4], seed: 18, pts: blob(214.2, 62.4, 2.3, 1.7, 12, 18, 0.2) },
    { id: 'lotus-bay', name: 'Lotus Bay', rank: 4, sp: 0.3, ang: 0.0, label: [266.4, 194.6], seed: 19, pts: blob(266.4, 194.6, 2.1, 1.3, 12, 19, 0.2) },
  ];
  URBAN.forEach((u) => {
    u.pts = chaikin(u.pts, 3, true);
    u.bb = bboxOf(u.pts);
    u.ox = u.bb.x0; u.oy = u.bb.y0;
    u.cos = Math.cos(u.ang); u.sin = Math.sin(u.ang);
    u.gpts = u.pts.map((p) => toGrid(u, p[0], p[1]));
    u.gbb = bboxOf(u.gpts);
    u.lineCache = {};
  });
  function toGrid(u, x, y) { const dx = x - u.ox, dy = y - u.oy; return [dx * u.cos + dy * u.sin, -dx * u.sin + dy * u.cos]; }

  const PARKS = [
    { name: 'Peony Park', lz: 6, pts: [[173.6, 84.4], [176, 83.4], [179.2, 83.8], [180.4, 86.2], [179.4, 88.4], [176.4, 88.9], [173.8, 87.6]] },
    { name: 'Riverside Park', lz: 10, pts: [[160, 99.9], [166, 99.5], [172, 99.8], [177, 99.3], [181, 98.7], [185, 99.6], [185, 100.1], [181, 99.2], [177, 99.85], [172, 100.35], [166, 100.05], [160, 100.45]] },
    { name: 'Koi Tower Plaza', lz: 60, pts: blob(171.3, 90.38, 0.3, 0.2, 12, 4, 0.05) },
    { name: 'Lotus Pier Gardens', lz: 7, pts: [[254.4, 146.6], [255.6, 145.2], [258.2, 145.0], [260.4, 146.0], [260.4, 147.6], [257.2, 148.0], [255, 147.8]] },
    { name: 'Yunmeng Wetland Park', lz: 5, pts: [[244, 187.4], [252, 189.8], [258, 191.6], [250, 193.8], [242, 191.2]] },
    { name: 'Lanling Botanical Garden', lz: 7, pts: blob(157.2, 82.6, 1.5, 0.9, 12, 22, 0.15) },
    { name: 'Old Town Garden', lz: 18, pts: blob(70.4, 80.4, 0.5, 0.32, 10, 23, 0.12) },
    { name: 'Qinghe Hill Park', lz: 8, pts: blob(178.8, 20.6, 1.2, 0.7, 10, 24, 0.15) },
    { name: 'Lakeside Promenade', lz: 9, pts: [[239.6, 149.4], [242.6, 147.6], [246.8, 146.8], [247, 147.4], [243, 148.4], [240.4, 150.4]] },
    { name: 'Guanyin Temple Grounds', lz: 12, pts: blob(288.5, 123.9, 0.6, 0.4, 10, 25, 0.12) },
    { name: 'Yiling Hill Cemetery', lz: 14, pts: blob(107.6, 195.2, 0.5, 0.3, 10, 26, 0.12) },
    { name: 'Archery Fields', lz: 16, pts: blob(158.4, 85.4, 0.45, 0.3, 10, 27, 0.1) },
  ].map((p) => Object.assign(p, { pts: chaikin(p.pts, 2, true) })).map((p) => Object.assign(p, { bb: bboxOf(p.pts), c: centroid(p.pts) }));

  const FORESTS = [
    [[10, 46], [16, 32], [30, 21], [46, 20], [62, 30], [70, 44], [66, 58], [52, 62], [34, 62], [20, 58]],
    [[44, 58], [52, 56.5], [58, 60], [59, 66.6], [55, 69.2], [49.4, 68.4], [45.6, 63]],
    [[96, 30], [104, 16], [120, 12], [136, 18], [140, 32], [126, 42], [108, 42]],
    [[122, 148], [128, 138], [142, 136], [146, 148], [138, 158], [126, 160]],
    [[82, 182], [86, 175], [93, 174], [97, 180], [93, 187], [85, 188]],
    [[162, 7], [176, 4], [194, 6], [196, 12], [180, 12], [166, 12]],
    [[284, 122.4], [289, 120.4], [292.6, 124.6], [289, 127.6], [285.4, 126.6]],
  ].map((p) => chaikin(p, 3, true));
  const FARMS = [
    [[86, 160], [100, 152], [118, 158], [132, 170], [128, 188], [116, 200], [100, 206], [84, 200], [78, 182]],
    [[94, 82], [112, 80], [134, 84], [146, 88], [140, 92], [118, 90], [98, 88]],
    [[198, 86], [214, 82], [232, 92], [240, 110], [226, 116], [208, 104], [198, 96]],
    [[148, 48], [166, 46], [172, 56], [168, 68], [152, 70], [144, 58]],
    [[196, 128], [212, 126], [224, 138], [220, 156], [204, 160], [194, 146]],
    [[74, 108], [90, 104], [100, 118], [96, 138], [80, 140], [70, 124]],
    [[226, 194], [240, 196], [246, 210], [232, 220], [218, 212]],
    [[292, 96], [304, 92], [306, 112], [296, 118], [288, 108]],
  ].map((p) => chaikin(p, 3, true));
  const LOTUS = [
    [[247.4, 148.0], [251, 147.5], [253.6, 147.9], [256.2, 148.4], [255.8, 149.6], [252.6, 150.4], [248.6, 150.0]],
    [[236.4, 157.6], [238.2, 153.6], [240.6, 151], [241.8, 153.4], [239.6, 158.2], [237.2, 161]],
    [[262, 150.0], [266.4, 150.5], [268, 151.8], [265, 152.6], [261.6, 151.6]],
    [[252, 186.5], [258, 187.6], [256, 189], [250.4, 188.2]],
  ].map((p) => chaikin(p, 2, true));

  // ── roads (cls: hwy | ring | prov | art | mtn) ───────────────────────────
  const R = (name, cls, pts, o) => Object.assign({ name, cls, pts }, o || {});
  const ROADS_RAW = [
    // Lanling
    R('Lanling Ring Expressway', 'ring', [[158.5, 80.2], [166, 77.2], [172.6, 76.4], [180, 77.6], [187, 80.8], [191.6, 86.2], [193.4, 92.8], [192.4, 99.6], [188.4, 105.6], [181.4, 109.2], [172.6, 110], [164.2, 108.8], [157.4, 104.6], [153.6, 98], [153.4, 90.6], [155.2, 84.6]], { closed: true, ref: 'R2', smooth: 2 }),
    R('Jinlin Avenue', 'art', [[151, 90.6], [195.6, 90.6]]),
    R('Koi Road', 'art', [[152.6, 84.3], [192.2, 84.3]]),
    R('Jinxing Road', 'art', [[176.2, 94.6], [196.6, 94.6]]),
    R('Station Road', 'art', [[158, 104.6], [189.2, 104.6]]),
    R('Riverside Drive', 'art', [[150.6, 101.2], [156, 99.6], [162, 98.9], [168, 99.1], [173, 99.3], [177, 98.9], [181, 98.2], [185, 98.9], [189, 101], [192.6, 104.2]], { smooth: 2 }),
    R('Peony Boulevard', 'art', [[172.6, 74.6], [172.6, 111.6]]),
    R('Fangfei Road', 'art', [[161.8, 77], [161.8, 108.6]]),
    R('Lantern Street', 'art', [[167.4, 80.6], [167.4, 99.1]]),
    R('Golden Gate Avenue', 'art', [[181.4, 76], [181.4, 108.6]]),
    R('Yaotai Road', 'art', [[191.8, 81], [191.8, 99.6]]),
    R('Phoenix Road', 'art', [[150.6, 96.4], [176.2, 96.4]]),
    // expressways out of Lanling
    R('Gusu–Lanling Expressway', 'hwy', [[153.5, 94.2], [146, 95.2], [136, 94.6], [124, 93.2], [112, 91.8], [100, 90.6], [90, 88.6], [82, 87.2], [77.2, 86.4]], { ref: 'G50', smooth: 2 }),
    R('Lanling–Yunmeng Expressway', 'hwy', [[193.1, 96.4], [200, 100.8], [208, 106.4], [216, 113.2], [224, 119.6], [232, 125.6], [240, 130.4], [248, 133.6], [256, 135.8], [260, 136.6]], { ref: 'G42', smooth: 2 }),
    R('Qinghe Expressway', 'hwy', [[172.6, 76.4], [173.2, 68], [174.2, 58], [175.2, 48], [176.2, 38.6]], { ref: 'S12', smooth: 2 }),
    R('Lanling–Yiling Expressway', 'hwy', [[157.4, 104.6], [151, 112], [144, 122], [137, 133], [131, 143], [127.6, 152], [122, 161], [115, 171], [109, 180], [104.4, 185]], { ref: 'G56', smooth: 2 }),
    R('Gusu–Yiling Road', 'prov', [[68.6, 91], [73, 100], [76, 112], [80, 126], [86, 140], [92, 154], [97, 168], [100.6, 178], [104.4, 185]], { ref: 'S7', smooth: 2 }),
    R('Qinghe–Yunmeng Road', 'prov', [[186.4, 27.6], [196, 36], [208, 46], [220, 58], [232, 74], [244, 92], [254, 108], [262, 120], [268.6, 125.6], [272.4, 127.6]], { ref: 'S20', smooth: 2 }),
    R('Baling Road', 'prov', [[214.4, 52.4], [214.2, 62.4]], {}),
    R('Gusu–Qishan Road', 'prov', [[68.6, 73.8], [72, 68], [80, 61], [92, 56.5], [106, 54.2], [121.4, 53.2]], { ref: 'S3', smooth: 2 }),
    // Yunmeng
    R('Lotus Pier Road', 'art', [[253.6, 145.8], [258, 145.7], [262, 144.4], [266, 143], [272, 141.6], [280, 141.4], [288.4, 142.2]], { smooth: 1 }),
    R('Yunmeng Avenue', 'art', [[272.4, 127.6], [272.4, 151]]),
    R('Station Road', 'art', [[260, 136.6], [268, 136.2], [276, 136], [288, 136.6]], { smooth: 1 }),
    R('Guanyin Temple Road', 'mtn', [[279.6, 136.1], [283, 131.6], [286.2, 127.6], [288.2, 124.6]], { smooth: 1 }),
    R('Warehouse Road', 'art', [[258.4, 140.4], [262.4, 137.2], [264.4, 136.4]]),
    R('Lakeside Road', 'art', [[240.8, 150.6], [244.4, 148], [249, 146.4], [253.6, 145.8]], { smooth: 1 }),
    R('Lake Ring Road', 'prov', [[288.4, 142.2], [290, 150], [291.4, 160], [290.6, 172], [286, 182], [278, 188.6], [268, 192], [257, 193], [246, 190.8], [237.6, 185.4], [232, 177], [230.2, 167], [231.6, 158.2], [235.6, 152.6], [240.8, 150.6]], { smooth: 2 }),
    // Gusu
    R('Gusu Main Street', 'art', [[61.6, 82.6], [77.4, 82.6]]),
    R('Canal Road', 'art', [[68.6, 73.8], [68.6, 91]]),
    R('Gusu East Road', 'art', [[77.2, 78], [77.2, 90.4]]),
    R('Canal Street', 'art', [[63, 85.4], [77.2, 85.4]]),
    R('Cloud Recesses Road', 'mtn', [[68.6, 75.2], [66.2, 74], [63.6, 72.6], [61.2, 71], [59, 70.2], [57.4, 68.8], [56, 67.6], [54.6, 66.8], [53.6, 65.6], [52.9, 64.8]], { smooth: 2 }),
    R('Station Link', 'art', [[68.6, 77.6], [72.4, 77.2]]),
    R('Caiyi Road', 'prov', [[77.2, 80], [81, 78.6], [84.8, 78.2]], { smooth: 1 }),
    // Qinghe
    R('Qinghe Avenue', 'art', [[176.2, 19.2], [176.2, 38.6]]),
    R('Nie Road', 'art', [[168, 27.6], [186.4, 27.6]]),
    R('Unclean Realm Road', 'mtn', [[176.2, 24.6], [177.4, 23.4], [178.2, 22.6]]),
    R('Station Link', 'art', [[176.2, 30.4], [184.4, 30.4]]),
    // Yiling
    R('Yiling Main Road', 'art', [[98, 190.8], [109.6, 190.8]]),
    R('Yiling Avenue', 'art', [[104.4, 185], [104.4, 196.4]]),
    R('Burial Mounds Road', 'mtn', [[98, 190.8], [95.6, 188.6], [93.4, 186], [91.8, 183.6], [90.4, 181.6]], { smooth: 2 }),
    R('Cemetery Lane', 'mtn', [[104.4, 193.6], [106.4, 194.6], [107.4, 195.2]]),
  ];
  const ROADS = ROADS_RAW.map((r, i) => {
    let pts = r.pts.map((p) => p.slice());
    if (r.closed) pts.push(pts[0].slice());
    if (r.smooth) pts = r.closed ? chaikin(r.pts, r.smooth, true).concat([chaikin(r.pts, r.smooth, true)[0]]) : chaikin(pts, r.smooth, false);
    const cum = cumul(pts);
    return Object.assign({}, r, { i, pts, cum, len: cum[cum.length - 1], bb: bboxOf(pts) });
  });

  const RAIL = [
    { name: 'Gusu–Lanling–Yunmeng High-Speed Railway', pts: chaikin([[72.6, 76.6], [84, 80.4], [100, 84.6], [120, 90], [140, 96], [156, 101.8], [166, 103.6], [173.6, 104.2], [186, 105.4], [200, 112], [220, 124], [240, 132.4], [256, 136.4], [264.4, 138.6]], 2, false) },
    { name: 'Lanling–Qinghe Railway', pts: chaikin([[173.6, 104.2], [176.8, 96], [178.6, 86], [180.6, 74], [183, 58], [184.2, 44], [184.6, 30.2]], 2, false) },
    { name: 'Gusu–Yiling Railway', pts: chaikin([[72.6, 76.6], [78, 92], [84, 116], [92, 140], [100, 166], [106.6, 186.6]], 2, false) },
  ];
  const METRO = [
    { id: 'L1', name: 'Line 1', color: '#e5383b', st: [['Fangfei West', 156.2, 90.6], ['Fangfei Road', 161.8, 90.6], ['Lantern Street', 167.4, 90.6], ['Koi Tower', 172.6, 90.6], ['Lanling Mall', 177.2, 90.6], ['Golden Gate', 181.4, 90.6], ['Jinxing North', 186.2, 90.6], ['Yaotai Road', 191.8, 90.6]] },
    { id: 'L2', name: 'Line 2', color: '#f0a202', st: [['Koi Road', 172.6, 84.3], ['Koi Tower', 172.6, 90.6], ['Night Market', 172.6, 95.4], ['Riverside', 172.6, 99.2], ['Lanling South Railway Station', 173.6, 104.2]] },
    { id: 'L3', name: 'Line 3', color: '#14a89a', st: [['Lanling International', 164.2, 84.3], ['Koi Road', 172.6, 84.3], ['Peony Park', 177.4, 84.3], ['Golden Gate North', 181.4, 84.3], ['Golden Gate', 181.4, 90.6], ['Golden Peony', 181.2, 97.6], ['Jinxing Middle', 185.4, 95.2], ['Jinxing East', 189.6, 94.8]] },
  ];
  const RAIL_ST = [
    { name: 'Gusu North Station', city: 'Gusu', at: [72.6, 76.6], place: 'gusu-north' },
    { name: 'Lanling South Railway Station', city: 'Lanling', at: [173.6, 104.2], place: 'lanling-south' },
    { name: 'Yunmeng Station', city: 'Yunmeng', at: [264.4, 138.6], place: 'yunmeng-station' },
    { name: 'Qinghe East Station', city: 'Qinghe', at: [184.6, 30.2], place: 'qinghe-east' },
    { name: 'Yiling Station', city: 'Yiling', at: [106.6, 186.6], place: null },
  ];

  const LABELS = [
    { t: 'Gusu Mountains', at: [30, 44], k: 'mtn', z0: 1.0, z1: 7, size: 13 },
    { t: 'Qishan Hills', at: [118, 30], k: 'mtn', z0: 1.4, z1: 9, size: 12 },
    { t: 'Qiongqi Hills', at: [136, 150], k: 'mtn', z0: 1.8, z1: 9, size: 12 },
    { t: 'Beiling Hills', at: [182, 9], k: 'mtn', z0: 2.2, z1: 10, size: 11 },
    { t: 'Burial Mounds', at: [89.4, 177], k: 'mtn', z0: 2.6, z1: 40, size: 12, dark: true },
    { t: 'Qiongqi Pass', at: [127.6, 152], k: 'pass', z0: 4, z1: 40, size: 11 },
    { t: 'East Sea', at: [316, 120], k: 'water', z0: 1.0, z1: 12, size: 13 },
    { t: 'JINLIN', at: [168.6, 88.2], k: 'dist', z0: 11, z1: 70 },
    { t: 'PEONY HILL', at: [178.6, 80.4], k: 'dist', z0: 11, z1: 70 },
    { t: 'FANGFEI', at: [158.8, 93.6], k: 'dist', z0: 11, z1: 70 },
    { t: 'RIVERSIDE', at: [176.8, 97.4], k: 'dist', z0: 11, z1: 70 },
    { t: 'JINXING', at: [187.4, 92.4], k: 'dist', z0: 11, z1: 70 },
    { t: 'LANLING SOUTH', at: [176, 107.6], k: 'dist', z0: 11, z1: 70 },
    { t: 'ACADEMY', at: [163, 81], k: 'dist', z0: 13, z1: 70 },
    { t: 'OLD TOWN', at: [66.4, 84], k: 'dist', z0: 14, z1: 90 },
    { t: 'LOTUS PIER', at: [256.4, 143.8], k: 'dist', z0: 9, z1: 60 },
    { t: 'OLD TOWN', at: [276.6, 140.2], k: 'dist', z0: 11, z1: 70 },
    { t: 'LOGISTICS PARK', at: [261.6, 135], k: 'dist', z0: 12, z1: 70 },
    { t: 'CLOUD RECESSES', at: [51.6, 61.4], k: 'dist', z0: 16, z1: 90 },
  ];

  // ═══ Places (the `places` collection; Maps owns it) ═════════════════════
  const P = (id, name, city, x, y, cat, o) => Object.assign({ id, name, city, x, y, cat }, o);
  const PLACES = [
    P('lotus-pier', 'Lotus Pier', 'Yunmeng', 258.6, 146.6, 'landmark', { addr: '1 Lotus Pier Road, Yunmeng', phone: '+86 555 0716 0000', hours: '24h', rating: 4.8, reviews: 1240, contact: 'hq', web: 'https://lotuspier.yunmeng', minZ: 1.4, look: 'lake', photos: ['p_lotus_pond_day', 'p_sunrise_lake', 'p_lotus_macro'], tags: ['ymj', 'yunmeng jiang group', 'headquarters', 'hq', 'work', 'lotus'],
      sub: 'Headquarters · Historic Estate', desc: 'Lakeside estate of the Jiang family and headquarters of the Yunmeng Jiang Group (YMJ). The night desk at the main gate is staffed around the clock; the public lotus gardens open on summer weekends. Look for the nine-petal lotus over the gate.' }),
    P('lp-residence', 'Lotus Pier Residence', 'Yunmeng', 256.9, 146.2, 'home', { addr: '3 Lotus Pier Road, Lotus Pier Estate, Yunmeng', minZ: 10, look: 'lake', sub: 'Private Residence', tags: ['home', 'house'], desc: 'Private residence on the Lotus Pier estate, overlooking the lotus ponds.' }),
    P('koi-tower', 'Koi Tower', 'Lanling', 171.5, 90.0, 'landmark', { addr: '88 Jinlin Avenue, Jinlin District, Lanling', phone: '+86 555 0518 0001', hours: '07:00-24:00', rating: 4.7, reviews: 8400, web: 'https://koitower.lanling', minZ: 1.4, look: 'koi', photos: ['p_gala_hall', 'p_balcony_moon'], tags: ['jin group', 'gala', 'tower', 'skyscraper', 'koi'],
      sub: 'Skyscraper · Jin Group Headquarters', desc: 'Headquarters of the Jin Group and Lanling’s tallest tower, crowned in gold. Tonight: Jin Group Autumn Charity Gala, Grand Hall (19:00). The koi pond in the forecourt is home to 88 koi, some older than the tower.' }),
    P('golden-peony', 'Golden Peony Hotel', 'Lanling', 180.6, 97.9, 'hotel', { addr: '16 Riverside Drive, Riverside, Lanling', phone: '+86 555 0880 1808', hours: '24h', rating: 4.8, reviews: 3120, price: '¥¥¥¥', web: 'https://goldenpeony.lanling', minZ: 7, look: 'hotel', photos: ['p_hotel_lobby'], tags: ['hotel', 'room 1808', 'bar', 'riverside'],
      sub: 'Hotel · ★★★★★', desc: 'Five-star riverside hotel known for its peony-filled lobby and the Silk Moon rooftop bar over the Great River. Valet parking; pets by arrangement (yes, even very large ones).' }),
    P('player-home', 'Jinxing Road 27', 'Lanling', 185.6, 94.1, 'pin', { addr: '27 Jinxing Road, Jinxing District, Lanling', minZ: 14, look: 'street', sub: 'Residential Building', tags: ['address', 'jinxing'], desc: 'Twelve-storey residential building between the Qing River and Pet Kingdom. Convenience store on the ground floor.' }),
    P('cloud-recesses', 'Cloud Recesses', 'Gusu', 52.2, 63.8, 'school', { addr: 'Cloud Recesses, Mount Gusu, Gusu', phone: '+86 555 0512 0000', hours: '09:00-17:00', rating: 4.9, reviews: 6010, web: 'https://cloudrecesses.gusu', minZ: 1.4, look: 'mountain', photos: ['p_cloud_recesses', 'p_rules_wall', 'p_gusu_moon'], tags: ['gusu lan academy', 'academy', 'campus', 'rules', 'lan'],
      sub: 'University Campus · Gusu Lan Academy', desc: 'Hillside campus of Gusu Lan Academy, wrapped in mist most mornings. The Wall of Discipline lists some 3,000 rules; visitors are kindly asked to observe them (yes, all of them). Quiet hours 21:00–05:00.' }),
    P('hanshi', 'The Hanshi', 'Gusu', 51.4, 63.0, 'tea', { addr: 'The Hanshi, Cloud Recesses, Gusu', phone: '+86 555 0512 0001', contact: 'lxc', hours: 'invite', minZ: 11, look: 'mountain', photos: ['p_tea_hanshi'], tags: ['tea', 'tea house', 'chancellor', 'zewu-jun', 'lan xichen'],
      sub: 'Tea House · Private Residence', desc: 'Tea house and residence of the Chancellor of Gusu Lan Academy, among gentians at the quiet end of the campus. Visits by invitation.' }),
    P('jingshi', 'The Jingshi', 'Gusu', 52.9, 63.1, 'home', { addr: 'The Jingshi, Cloud Recesses, Gusu', minZ: 11, look: 'mountain', tags: ['home', 'wei wuxian', 'lan wangji'], sub: 'Private Residence', desc: 'Private residence inside Cloud Recesses. A radish planter by the door; a rabbit hutch round the back.' }),
    P('unclean-realm', 'The Unclean Realm', 'Qinghe', 178.4, 22.3, 'landmark', { addr: '1 Nie Road, Qinghe', phone: '+86 555 0225 0000', hours: 'Mon-Fri 09:00-18:00', rating: 4.3, reviews: 2210, web: 'https://niecorp.qinghe', minZ: 1.4, look: 'fortress', tags: ['nie corp', 'headquarters', 'fortress', 'fans'],
      sub: 'Headquarters · Nie Corp', desc: 'Fortress-like headquarters of Nie Corp on Qinghe’s north hill. The gift shop sells hand-painted fans from Huaisang Fans.' }),
    P('radish-farm', 'Yiling Radish Co.', 'Yiling', 90.0, 181.2, 'farm', { addr: 'Burial Mounds Hill, Yiling', phone: '+86 555 1031 0031', contact: 'wwx', hours: 'Sat-Sun 10:00-16:00', rating: 4.9, reviews: 318, web: 'https://radish.yiling', minZ: 3, look: 'farm', photos: ['p_radishes', 'p_radish_cake'], tags: ['radish', 'farm', 'farm stand', 'wei wuxian'],
      sub: 'Farm · Farm Stand', desc: 'Tiny radish farm on the slope of Burial Mounds hill. Weekend farm stand and the occasional pop-up. “Radishes so good you’ll cry” (the owner, probably).' }),
    P('laoma-hotpot', 'Laoma Hotpot (老妈火锅)', 'Gusu', 66.4, 85.0, 'food', { short: 'Laoma Hotpot', addr: '36 Canal Street, Old Town, Gusu', phone: '+86 555 0512 6688', hours: '11:00-02:00', rating: 4.6, reviews: 2930, price: '¥¥', web: 'https://laomahotpot.gusu', minZ: 9, look: 'gusu', photos: ['p_hotpot_alumni', 'food_hotpot'], tags: ['hotpot', 'restaurant', 'mala', 'food', 'dinner', 'laoma'],
      sub: 'Hotpot Restaurant · ¥¥', desc: 'Gusu’s loudest hotpot since 1998: bone broth or numbing mala, hand-cut lamb, and a red sign you can see from the canal. A favourite with students after exams.' }),
    P('lanling-intl', 'Lanling International School', 'Lanling', 164.2, 83.2, 'school', { addr: '2 Academy Road, Academy District, Lanling', phone: '+86 555 0418 6600', hours: 'Mon-Fri 07:30-17:30', rating: 4.5, reviews: 640, web: 'https://lanling-intl.lanling', minZ: 9, look: 'campus', tags: ['school', 'archery', 'jin ling', 'high school'],
      sub: 'Private School', desc: 'Private K–12 school with an IB programme. Home of the regional champion archery team.' }),
    P('guanyin-temple', 'Guanyin Temple', 'Yunmeng', 288.6, 124.0, 'temple', { addr: 'Guanyin Temple Road, Yunmeng', phone: '+86 555 0716 8888', hours: '06:00-18:00', rating: 4.7, reviews: 1930, minZ: 3, look: 'temple', tags: ['temple', 'shrine', 'guanyin'],
      sub: 'Buddhist Temple', desc: 'Quiet hilltop temple on the road out of Yunmeng. The evening bell carries across the lake.' }),
    P('yunmeng-lake', 'Yunmeng Lake Pavilion', 'Yunmeng', 240.6, 150.2, 'park', { addr: 'Lakeside Road, Yunmeng', hours: '24h', rating: 4.8, reviews: 4610, minZ: 5, look: 'lake', photos: ['p_kites', 'p_sunrise_lake', 'p_lotus_macro'], tags: ['park', 'pavilion', 'kites', 'lake', 'lotus'],
      sub: 'Park · Scenic Lookout', desc: 'Old pavilion on the west shore of Yunmeng Lake, with a railing by Mianmian Studio. The best kite wind in the province, according to every child who grew up here.' }),
    P('pet-kingdom', 'Pet Kingdom', 'Lanling', 182.9, 95.1, 'pet', { addr: '118 Jinxing Road, Jinxing District, Lanling', phone: '+86 555 0601 3300', hours: '09:00-21:00', rating: 4.4, reviews: 870, web: 'https://petkingdom.lanling', minZ: 11, look: 'street', photos: ['p_receipt'], tags: ['pet store', 'dog food', 'pets', 'grooming', 'dog'],
      sub: 'Pet Store', desc: 'Pet superstore: giant-breed food, grooming, a self-service dog wash and the Platinum Paw membership desk.' }),
    // extras used by the apps
    P('koi-residences', 'Koi Tower Residences', 'Lanling', 172.7, 88.9, 'home', { addr: '90 Jinlin Avenue, Jinlin District, Lanling', phone: '+86 555 0888 0090', hours: '24h', minZ: 12, look: 'koi', tags: ['apartments', 'residence', 'jin ling'], sub: 'Residential Tower', desc: 'Residential tower beside Koi Tower with a 24-hour concierge (and a strict “dogs under 30 kg” rule that has never once been enforced).' }),
    P('koi-pond', 'Koi Tower Koi Pond', 'Lanling', 171.28, 90.42, 'park', { short: 'Koi Pond', addr: 'Koi Tower Forecourt, 88 Jinlin Avenue, Lanling', hours: '24h', rating: 4.6, reviews: 2380, minZ: 40, look: 'koi', tags: ['pond', 'koi', 'fish'], sub: 'Water Garden', desc: 'Eighty-eight koi, three stone bridges and a strict no-wading policy. The oldest koi, Old Gold, is 41.' }),
    P('lanling-south', 'Lanling South Railway Station', 'Lanling', 173.6, 104.2, 'transit', { short: 'Lanling South Station', addr: 'Station Road, Lanling South', hours: '05:30-24:00', rating: 4.1, reviews: 9800, minZ: 5, look: 'station', tags: ['train', 'railway', 'station', 'metro', 'high-speed'], sub: 'Railway Station', desc: 'High-speed trains to Gusu North, Yunmeng and Qinghe East. Metro Line 2.' }),
    P('yunmeng-station', 'Yunmeng Station', 'Yunmeng', 264.4, 138.6, 'transit', { addr: 'Station Road, Yunmeng', hours: '05:30-23:30', rating: 4.2, reviews: 3400, minZ: 5, look: 'station', tags: ['train', 'railway', 'station'], sub: 'Railway Station', desc: 'High-speed trains to Lanling South and Gusu North.' }),
    P('gusu-north', 'Gusu North Station', 'Gusu', 72.6, 76.6, 'transit', { addr: 'Station Link, Gusu', hours: '05:30-23:30', rating: 4.3, reviews: 2900, minZ: 5, look: 'station', tags: ['train', 'railway', 'station'], sub: 'Railway Station', desc: 'High-speed trains to Lanling South and Yunmeng; regional trains to Yiling. Shuttle bus to Cloud Recesses (not after 21:00 — quiet hours).' }),
    P('qinghe-east', 'Qinghe East Station', 'Qinghe', 184.6, 30.2, 'transit', { addr: 'Station Link, Qinghe', hours: '05:30-23:30', rating: 4.0, reviews: 1500, minZ: 5, look: 'station', tags: ['train', 'railway', 'station'], sub: 'Railway Station', desc: 'Trains to Lanling South.' }),
    P('ymj-warehouse', 'YMJ Warehouse B', 'Yunmeng', 261.2, 139.0, 'business', { addr: '6 Warehouse Road, Logistics Park, Yunmeng', phone: '+86 555 0716 0000', contact: 'hq', hours: '24h', minZ: 11, look: 'warehouse', tags: ['warehouse', 'ymj', 'logistics', 'lotus root'], sub: 'Warehouse · Yunmeng Jiang Group', desc: 'Cold-chain warehouse and canteen of the Yunmeng Jiang Group. New roof (2026) by Mianmian Studio. Currently holding a great deal of lotus root.' }),
    P('night-market', 'Lanling Night Market', 'Lanling', 175.6, 96.0, 'food', { addr: 'Riverside Lane, Riverside, Lanling', hours: '18:00-02:00', rating: 4.5, reviews: 5200, minZ: 9, look: 'market', tags: ['night market', 'street food', 'skewers', 'snacks', 'food', 'pop-up'], sub: 'Night Market · ¥', desc: 'Two hundred stalls between Phoenix Road and the river: skewers, stinky tofu, sugar-painted koi. This weekend: a radish pop-up from Yiling.' }),
    P('auntie-lu', 'Auntie Lu’s Soup Kitchen', 'Gusu', 67.6, 84.2, 'food', { addr: '12 Canal Road, Old Town, Gusu', phone: '+86 555 0512 3366', hours: '10:00-21:00', rating: 4.8, reviews: 1460, price: '¥', minZ: 13, look: 'gusu', photos: ['food_soup'], tags: ['soup', 'restaurant', 'lotus root soup', 'food'], sub: 'Soup Restaurant · ¥', desc: 'Slow-simmered soups since 1987. The lotus root & pork rib soup sells out by noon.' }),
    P('grandma-qin', 'Grandma Qin’s Kitchen', 'Lanling', 168.8, 93.2, 'food', { addr: '41 Lantern Street, Jinlin, Lanling', phone: '+86 555 0888 4410', hours: '10:30-22:00', rating: 4.7, reviews: 2100, price: '¥¥', minZ: 13, look: 'street', photos: ['food_dumplings', 'food_noodles'], tags: ['home cooking', 'restaurant', 'vegetables', 'food'], sub: 'Home-style Restaurant · ¥¥', desc: 'Home-style cooking with an unreasonable number of vegetable dishes.' }),
    P('night-owl', 'Night Owl Congee', 'Yunmeng', 273.4, 139.6, 'food', { addr: '9 Yunmeng Avenue, Old Town, Yunmeng', phone: '+86 555 0716 2424', hours: '24h', rating: 4.6, reviews: 1880, price: '¥', minZ: 13, look: 'street', photos: ['food_congee'], tags: ['congee', 'late night', '24 hours', 'food'], sub: 'Congee · 24 hours', desc: 'Congee, youtiao and salted duck egg, all night. Popular with logistics shift workers and one particular CEO.' }),
    P('night-owl-ll', 'Night Owl Congee (Jinxing)', 'Lanling', 184.3, 95.3, 'food', { addr: '60 Jinxing Road, Jinxing District, Lanling', phone: '+86 555 0888 2424', hours: '24h', rating: 4.5, reviews: 960, price: '¥', minZ: 13, look: 'street', photos: ['food_congee'], tags: ['congee', 'late night', '24 hours', 'food'], sub: 'Congee · 24 hours', desc: 'The Lanling branch of the all-night congee shop.' }),
    P('tea-leaf', 'Tea Leaf Milk Tea', 'Yunmeng', 270.8, 139.4, 'cafe', { addr: '21 Lotus Pier Road, Yunmeng', phone: '+86 555 0716 3838', hours: '10:00-22:00', rating: 4.4, reviews: 760, price: '¥', minZ: 14, look: 'street', photos: ['food_milktea'], tags: ['milk tea', 'bubble tea', 'drinks', 'cafe'], sub: 'Milk Tea Shop', desc: 'Brown sugar milk tea; bulk orders welcome (38 is a perfectly normal number).' }),
    P('cr-tea-shop', 'Cloud Recesses Tea Shop', 'Gusu', 53.8, 65.6, 'tea', { addr: 'Main Gate, Cloud Recesses, Gusu', phone: '+86 555 0512 2000', hours: '08:00-17:00', rating: 4.9, reviews: 880, price: '¥¥¥', web: 'https://tea.cloudrecesses.gusu', minZ: 12, look: 'mountain', photos: ['p_tea_hanshi'], tags: ['tea', 'white peony', 'tea shop', 'gift'], sub: 'Tea Shop', desc: 'Mountain-grown white peony and Cloud Mist green from the Academy’s own terraces. Delivery to campus residences on request.' }),
    P('cr-guesthouse', 'Cloud Recesses Guesthouse', 'Gusu', 54.6, 66.4, 'hotel', { addr: 'Main Gate, Cloud Recesses, Gusu', phone: '+86 555 0512 0066', hours: '24h', rating: 4.6, reviews: 540, price: '¥¥', minZ: 13, look: 'mountain', tags: ['hotel', 'guesthouse'], sub: 'Guesthouse', desc: 'Simple rooms at the foot of the Academy stairs. Lights out at 21:00. Really.' }),
    P('gusu-teahouse', 'Gusu Tea House', 'Gusu', 70.8, 82.0, 'tea', { addr: '3 Gusu Main Street, Old Town, Gusu', phone: '+86 555 0512 2211', hours: '09:00-21:00', rating: 4.6, reviews: 1320, price: '¥¥', minZ: 13, look: 'gusu', photos: ['p_tea_hanshi'], tags: ['tea', 'tea house', 'snacks'], sub: 'Tea House', desc: 'Canal-side tea house with a pingtan singer on weekends.' }),
    P('lanling-vet', 'Lanling Pet Hospital', 'Lanling', 167.0, 88.0, 'health', { addr: '5 Lantern Street, Jinlin, Lanling', phone: '+86 555 0888 1200', hours: '24h', rating: 4.8, reviews: 690, minZ: 13, look: 'street', tags: ['vet', 'veterinarian', 'animal hospital', 'dog', 'dr fang'], sub: 'Veterinary Hospital · 24 hours', desc: '24-hour animal hospital. Dr. Fang has treated Fairy for nine years and has stopped asking how.' }),
    P('lanling-mall', 'Lanling Mall', 'Lanling', 177.2, 91.4, 'shopping', { addr: '200 Jinlin Avenue, Lanling', phone: '+86 555 0888 5000', hours: '10:00-22:00', rating: 4.4, reviews: 7200, minZ: 10, look: 'street', tags: ['mall', 'shopping', 'sneaker palace', 'sneakers', 'cinema'], sub: 'Shopping Mall', desc: 'Six floors of shops including Sneaker Palace, Koi Records and a rooftop cinema.' }),
    P('lanling-motors', 'Lanling Motors', 'Lanling', 160.6, 96.9, 'auto', { addr: '77 Phoenix Road, Fangfei, Lanling', phone: '+86 555 0888 6600', hours: '09:00-19:00', rating: 4.2, reviews: 410, minZ: 13, look: 'street', tags: ['car dealer', 'cars', 'dealership'], sub: 'Car Dealership', desc: 'New and used cars. Deposits refundable within 24 hours (one customer has tested this).' }),
    P('silver-lotus', 'Silver Lotus Jewelers', 'Yunmeng', 271.2, 141.2, 'shopping', { addr: '30 Lotus Pier Road, Yunmeng', phone: '+86 555 0716 6060', hours: '10:00-19:00', rating: 4.9, reviews: 230, minZ: 14, look: 'street', tags: ['jeweler', 'silver', 'restoration', 'bell'], sub: 'Jeweler · Silver Restoration', desc: 'Silversmiths since 1952. Restoration of heirloom silver; engraving while you wait.' }),
    P('peony-park', 'Peony Park', 'Lanling', 176.8, 85.2, 'park', { addr: 'Koi Road, Peony Hill, Lanling', hours: '05:00-23:00', rating: 4.7, reviews: 6400, minZ: 8, look: 'park', tags: ['park', 'dog run', 'lake', 'peonies'], sub: 'Park', desc: 'Lanling’s favourite park: peony gardens, Peony Lake and an off-leash dog run that Fairy treats as her personal property.' }),
    P('jinxing-police', 'Jinxing Road Police Station', 'Lanling', 187.2, 95.2, 'police', { addr: '140 Jinxing Road, Jinxing District, Lanling', phone: '+86 555 0888 0110', hours: '24h', rating: 4.1, reviews: 120, minZ: 13, look: 'street', tags: ['police', 'lost and found', 'lost property', 'found phone'], sub: 'Police Station · Lost & Found', desc: 'Neighbourhood police station. The Lost & Found desk is open 24 hours: found items can be handed in at any time, and the owner is contacted for you.' }),
    P('yiling-ems', 'Yiling Emergency Medical Station', 'Yiling', 105.4, 191.6, 'health', { addr: '8 Yiling Main Road, Yiling', phone: '+86 555 0611 0120', hours: '24h', rating: 4.9, reviews: 210, minZ: 13, look: 'street', tags: ['ambulance', 'ems', 'paramedic', 'wen ning'], sub: 'Ambulance Station', desc: 'Emergency medical station serving Yiling and the Burial Mounds villages.' }),
    P('koi-cafe', 'Koi Tower Café', 'Lanling', 171.9, 89.7, 'cafe', { addr: 'Lobby, Koi Tower, 88 Jinlin Avenue, Lanling', hours: '07:00-24:00', rating: 4.3, reviews: 1500, price: '¥¥', minZ: 15, look: 'koi', photos: ['food_lotus_cake', 'food_milktea'], tags: ['cafe', 'coffee', 'cake', 'milk tea'], sub: 'Café', desc: 'Lobby café with a view of the koi pond. Gold-leaf lotus cake for the brave.' }),
    P('lotus-root-kitchen', 'Lotus Root Kitchen', 'Lanling', 176.6, 93.0, 'food', { addr: '12 Golden Lane, Riverside, Lanling', phone: '+86 555 0888 7171', hours: '11:00-01:00', rating: 4.7, reviews: 1730, price: '¥¥', minZ: 13, look: 'street', photos: ['food_soup', 'food_lotus_cake'], tags: ['yunmeng food', 'soup', 'lotus root', 'restaurant'], sub: 'Yunmeng Cuisine · ¥¥', desc: 'Yunmeng home cooking in Lanling: lotus root and pork rib soup, sweet osmanthus lotus root, lake fish.' }),
    P('golden-dumpling', 'Golden Dumpling House', 'Lanling', 179.0, 93.6, 'food', { addr: '8 Golden Gate Avenue, Lanling', phone: '+86 555 0888 8686', hours: '10:00-02:00', rating: 4.5, reviews: 2600, price: '¥', minZ: 13, look: 'street', photos: ['food_dumplings', 'food_baozi'], tags: ['dumplings', 'baozi', 'restaurant', 'late night'], sub: 'Dumplings · ¥', desc: 'Pleated by hand, eighteen folds each, until 2 AM.' }),
    P('peony-bakery', 'Peony Bakery', 'Lanling', 174.4, 92.2, 'cafe', { addr: '3 Peony Boulevard, Lanling', phone: '+86 555 0888 2018', hours: '08:00-21:00', rating: 4.8, reviews: 1980, price: '¥¥', minZ: 14, look: 'street', photos: ['food_lotus_cake', 'p_cake_lotus'], tags: ['bakery', 'cake', 'birthday cake', 'lotus seed paste'], sub: 'Bakery', desc: 'Custom celebration cakes; lotus seed paste is the house speciality. Order 48 hours ahead.' }),
    P('lanling-archery', 'Lanling Archery Club', 'Lanling', 158.4, 85.4, 'sports', { addr: '18 Koi Road, Academy District, Lanling', phone: '+86 555 0888 3390', hours: '08:00-21:00', rating: 4.6, reviews: 280, minZ: 13, look: 'campus', tags: ['archery', 'sports', 'club'], sub: 'Archery Range', desc: 'Indoor and outdoor ranges; home ground of the Lanling International team.' }),
    P('yiling-cemetery', 'Yiling Hill Cemetery', 'Yiling', 107.6, 195.2, 'park', { addr: 'Cemetery Lane, Yiling', hours: '06:00-18:00', minZ: 14, look: 'farm', tags: ['cemetery', 'camphor tree'], sub: 'Cemetery', desc: 'Small hillside cemetery behind the old clinic, shaded by an old camphor tree.' }),
  ];
  PLACES.forEach((p) => { if (p.minZ == null) p.minZ = 12; });
  JC.store.seed('places', PLACES);

  const HOME = [185.6, 94.1]; // Jinxing Road 27 — where the taxi dropped the player
  const CATS = {
    landmark: { color: '#a07b52', glyph: 'building.columns.fill', label: 'Landmark' },
    hotel: { color: '#a95ce0', glyph: 'bed.double.fill', label: 'Hotel' },
    food: { color: '#ff8a00', glyph: 'fork.knife', label: 'Restaurant' },
    cafe: { color: '#b07a45', glyph: 'cup.and.saucer.fill', label: 'Café' },
    tea: { color: '#2fa36b', glyph: 'leaf.fill', label: 'Tea' },
    school: { color: '#8a6d4b', glyph: 'graduationcap.fill', label: 'School' },
    park: { color: '#2fb350', glyph: 'tree.fill', label: 'Park' },
    temple: { color: '#8e8e93', glyph: 'building.columns.fill', label: 'Temple' },
    home: { color: '#0a84ff', glyph: 'house.fill', label: 'Residence' },
    pin: { color: '#ff3b30', glyph: 'mappin', label: 'Address' },
    transit: { color: '#147efb', glyph: 'tram.fill', label: 'Station' },
    pet: { color: '#ff9f0a', glyph: 'pawprint.fill', label: 'Pet Store' },
    farm: { color: '#34a853', glyph: 'leaf.fill', label: 'Farm' },
    business: { color: '#7d7d84', glyph: 'building.2', label: 'Business' },
    shopping: { color: '#f2a600', glyph: 'bag.fill', label: 'Shopping' },
    health: { color: '#ff375f', glyph: 'cross.case.fill', label: 'Health' },
    police: { color: '#4f6d8f', glyph: 'shield.fill', label: 'Police' },
    auto: { color: '#5b7da6', glyph: 'car.fill', label: 'Automotive' },
    sports: { color: '#00a3d1', glyph: 'figure.run', label: 'Sports' },
  };

  // ═══ Road graph & routing ════════════════════════════════════════════════
  let GRAPH = null;
  function graph() {
    if (GRAPH) return GRAPH;
    const nodes = [];
    const hashN = {};
    const key = (x, y) => Math.round(x / 0.06) + ',' + Math.round(y / 0.06);
    function nodeAt(x, y) {
      const kx = Math.round(x / 0.06), ky = Math.round(y / 0.06);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const list = hashN[(kx + dx) + ',' + (ky + dy)];
        if (list) for (const id of list) if (Math.hypot(nodes[id].x - x, nodes[id].y - y) < 0.05) return id;
      }
      const id = nodes.length;
      nodes.push({ id, x, y, adj: [] });
      (hashN[key(x, y)] = hashN[key(x, y)] || []).push(id);
      return id;
    }
    const cuts = ROADS.map((r) => [0, r.len]);
    // intersections between different roads
    for (let i = 0; i < ROADS.length; i++) {
      const A = ROADS[i];
      for (let j = i + 1; j < ROADS.length; j++) {
        const B = ROADS[j];
        if (A.bb.x1 < B.bb.x0 - 0.01 || B.bb.x1 < A.bb.x0 - 0.01 || A.bb.y1 < B.bb.y0 - 0.01 || B.bb.y1 < A.bb.y0 - 0.01) continue;
        for (let a = 0; a < A.pts.length - 1; a++) {
          for (let b = 0; b < B.pts.length - 1; b++) {
            const r = segInt(A.pts[a], A.pts[a + 1], B.pts[b], B.pts[b + 1]);
            if (!r) continue;
            cuts[i].push(A.cum[a] + (A.cum[a + 1] - A.cum[a]) * r.t);
            cuts[j].push(B.cum[b] + (B.cum[b + 1] - B.cum[b]) * r.u);
          }
        }
      }
    }
    // T-junctions: dangling endpoints snap onto the nearest other road
    const links = [];
    ROADS.forEach((A, i) => {
      if (A.closed) return;
      [0, A.len].forEach((s) => {
        const p = along(A.pts, A.cum, s);
        let best = null;
        ROADS.forEach((B, j) => {
          if (j === i) return;
          if (p.x < B.bb.x0 - 1.6 || p.x > B.bb.x1 + 1.6 || p.y < B.bb.y0 - 1.6 || p.y > B.bb.y1 + 1.6) return;
          for (let b = 0; b < B.pts.length - 1; b++) {
            const q = projSeg(p.x, p.y, B.pts[b], B.pts[b + 1]);
            if (!best || q.d < best.d) best = { d: q.d, j, s: B.cum[b] + (B.cum[b + 1] - B.cum[b]) * q.t, x: q.x, y: q.y };
          }
        });
        if (best && best.d < 1.6) {
          cuts[best.j].push(best.s);
          if (best.d > 0.05) links.push({ a: [p.x, p.y], b: [best.x, best.y], name: A.name, cls: A.cls === 'hwy' ? 'hwy' : 'art' });
        }
      });
    });
    const edges = [];
    function addEdge(a, b, pts, road, cls, name, ref) {
      if (a === b) return;
      const len = plen(pts);
      const e = { id: edges.length, a, b, pts, cum: cumul(pts), len, road, cls, name, ref };
      edges.push(e);
      nodes[a].adj.push({ e: e.id, to: b, dir: 1 });
      nodes[b].adj.push({ e: e.id, to: a, dir: -1 });
    }
    ROADS.forEach((r, i) => {
      const cs = cuts[i].sort((x, y) => x - y).filter((s, k, arr) => k === 0 || s - arr[k - 1] > 0.02);
      for (let k = 0; k < cs.length - 1; k++) {
        const p0 = along(r.pts, r.cum, cs[k]), p1 = along(r.pts, r.cum, cs[k + 1]);
        addEdge(nodeAt(p0.x, p0.y), nodeAt(p1.x, p1.y), subLine(r.pts, r.cum, cs[k], cs[k + 1]), i, r.cls, r.name, r.ref);
      }
    });
    links.forEach((l) => addEdge(nodeAt(l.a[0], l.a[1]), nodeAt(l.b[0], l.b[1]), [l.a, l.b], -1, 'link', l.name, null));
    GRAPH = { nodes, edges };
    return GRAPH;
  }

  const SPEED = {
    drive: { hwy: 98, ring: 84, prov: 72, art: 62, mtn: 34, link: 44 },
    walk: { prov: 4.8, art: 4.8, mtn: 4.2, link: 4.8 },
    cycle: { prov: 16, art: 15, mtn: 10, link: 14 },
  };
  function snapTo(x, y, mode) {
    const G = graph();
    let best = null;
    for (const e of G.edges) {
      if (e.cls === 'hwy' || e.cls === 'ring' || e.cls === 'link' && mode !== 'drive') continue;
      if (mode !== 'drive' && !SPEED[mode][e.cls]) continue;
      for (let k = 0; k < e.pts.length - 1; k++) {
        const q = projSeg(x, y, e.pts[k], e.pts[k + 1]);
        if (!best || q.d < best.d) best = { d: q.d, e, s: e.cum[k] + (e.cum[k + 1] - e.cum[k]) * q.t, x: q.x, y: q.y };
      }
    }
    return best;
  }
  function edgeMin(e, mode, avoid) {
    const sp = SPEED[mode][e.cls];
    if (!sp) return Infinity;
    if (avoid && avoid.hwy && (e.cls === 'hwy' || e.cls === 'ring')) return Infinity;
    return (e.len / sp) * 60;
  }
  function shortest(src, dst, mode, opt) {
    const G = graph();
    const N = G.nodes.length;
    const dist = new Float64Array(N).fill(Infinity);
    const prev = new Int32Array(N).fill(-1);
    const prevE = new Int32Array(N).fill(-1);
    const done = new Uint8Array(N);
    const pen = opt.penalty || {};
    const sp = SPEED[mode];
    const accessMin = (d) => (d / (mode === 'drive' ? 18 : sp.art)) * 60;
    // virtual source: from src.e at s to both endpoints
    const se = src.e, de = dst.e;
    const sMin = accessMin(src.d);
    const eMinS = edgeMin(se, mode, opt.avoid) / (se.len || 1);
    dist[se.a] = sMin + src.s * eMinS; prev[se.a] = -2;
    dist[se.b] = Math.min(dist[se.b], sMin + (se.len - src.s) * eMinS); if (dist[se.b] === sMin + (se.len - src.s) * eMinS) prev[se.b] = -2;
    for (;;) {
      let u = -1, best = Infinity;
      for (let i = 0; i < N; i++) if (!done[i] && dist[i] < best) { best = dist[i]; u = i; }
      if (u < 0) break;
      done[u] = 1;
      for (const a of G.nodes[u].adj) {
        const e = G.edges[a.e];
        let c = edgeMin(e, mode, opt.avoid);
        if (!isFinite(c)) continue;
        if (pen[e.id]) c *= pen[e.id];
        const nd = dist[u] + c;
        if (nd < dist[a.to] - 1e-9) { dist[a.to] = nd; prev[a.to] = u; prevE[a.to] = a.e; }
      }
    }
    const eMinD = edgeMin(de, mode, opt.avoid) / (de.len || 1);
    const dMin = accessMin(dst.d);
    const viaA = dist[de.a] + dst.s * eMinD + dMin;
    const viaB = dist[de.b] + (de.len - dst.s) * eMinD + dMin;
    let direct = Infinity;
    if (se.id === de.id) direct = sMin + Math.abs(dst.s - src.s) * eMinS + dMin;
    const total = Math.min(viaA, viaB, direct);
    if (!isFinite(total)) return null;
    // reconstruct as a list of pieces {pts, name, cls, ref}
    const pieces = [];
    if (total === direct) {
      pieces.push({ pts: subLine(se.pts, se.cum, src.s, dst.s), name: se.name, cls: se.cls, ref: se.ref, e: se.id });
    } else {
      const end = viaA <= viaB ? de.a : de.b;
      const chain = [];
      let n = end;
      while (prev[n] >= 0) { chain.unshift(prevE[n]); n = prev[n]; }
      const startNode = n;
      // first partial: src point → startNode along se
      pieces.push({ pts: subLine(se.pts, se.cum, src.s, startNode === se.a ? 0 : se.len), name: se.name, cls: se.cls, ref: se.ref, e: se.id });
      let cur = startNode;
      chain.forEach((eid) => {
        const e = G.edges[eid];
        const fwd = e.a === cur;
        pieces.push({ pts: fwd ? e.pts : e.pts.slice().reverse(), name: e.name, cls: e.cls, ref: e.ref, e: e.id });
        cur = fwd ? e.b : e.a;
      });
      pieces.push({ pts: subLine(de.pts, de.cum, end === de.a ? 0 : de.len, dst.s), name: de.name, cls: de.cls, ref: de.ref, e: de.id });
    }
    return { minutes: total, pieces };
  }

  function placeOf(x) {
    if (!x) return null;
    if (typeof x === 'string') {
      if (x === 'me' || x === 'user') return userPlace();
      const p = JC.store.get('places', x);
      return p ? p : null;
    }
    if (Array.isArray(x)) return { id: null, name: 'Dropped Pin', x: x[0], y: x[1], cat: 'pin' };
    if (x.x != null) return x;
    if (x.place) return placeOf(x.place);
    return null;
  }
  function userPlace() {
    const p = JC.store.get('places', 'player-home');
    const u = mv.userPos();
    return Object.assign({}, p || {}, { id: 'player-home', name: 'My Location', x: u[0], y: u[1], cat: 'pin', isUser: true });
  }

  const cardinal = (a) => { const d = ((a * 180) / Math.PI + 450) % 360; return ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'][Math.round(d / 45) % 8]; };
  // a = atan2(dy, dx) with y pointing south: 0 = east, π/2 = south; 'north' = -π/2. Fix mapping:
  function compass(a) {
    const deg = ((90 + (a * 180) / Math.PI) % 360 + 360) % 360; // 0 = north, clockwise
    return ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'][Math.round(deg / 45) % 8];
  }
  void cardinal;
  const roadLabel = (pc) => (pc.ref && (pc.cls === 'hwy' || pc.cls === 'ring') ? pc.ref + ' ' + pc.name : pc.name);
  const isFast = (c) => c === 'hwy' || c === 'ring';

  function buildRoute(from, to, mode, res, opt) {
    const pieces = res.pieces.filter((pc) => pc.pts.length > 1 && plen(pc.pts) > 0.001);
    const pts = [[from.x, from.y]];
    pieces.forEach((pc) => pc.pts.forEach((p) => { const l = pts[pts.length - 1]; if (Math.hypot(l[0] - p[0], l[1] - p[1]) > 1e-4) pts.push(p.slice()); }));
    pts.push([to.x, to.y]);
    const km = plen(pts);
    // merge consecutive pieces of the same road into legs
    const legs = [];
    pieces.forEach((pc) => {
      const last = legs[legs.length - 1];
      const nm = roadLabel(pc);
      if (last && last.name === nm) { last.pts = last.pts.concat(pc.pts.slice(1)); last.km += plen(pc.pts); }
      else legs.push({ name: nm, road: pc.name, cls: pc.cls, ref: pc.ref, pts: pc.pts.slice(), km: plen(pc.pts) });
    });
    // fold tiny legs (< 60 m) into neighbours
    for (let i = legs.length - 1; i >= 0; i--) if (legs.length > 1 && legs[i].km < 0.06) { const n = legs[i - 1] || legs[i + 1]; n.km += legs[i].km; legs.splice(i, 1); }
    const steps = [];
    const headAt = (p, end) => {
      const n = p.length;
      if (n < 2) return 0;
      if (end) { let i = n - 2; while (i > 0 && Math.hypot(p[n - 1][0] - p[i][0], p[n - 1][1] - p[i][1]) < 0.05) i--; return Math.atan2(p[n - 1][1] - p[i][1], p[n - 1][0] - p[i][0]); }
      let i = 1; while (i < n - 1 && Math.hypot(p[i][0] - p[0][0], p[i][1] - p[0][1]) < 0.05) i++; return Math.atan2(p[i][1] - p[0][1], p[i][0] - p[0][0]);
    };
    const walk = mode !== 'drive';
    if (legs.length) {
      const first = legs[0];
      steps.push({ glyph: 'location.north.fill', kind: 'start', text: (walk ? 'Walk ' : 'Head ') + compass(headAt(first.pts)) + ' on ' + first.name, road: first.name, km: first.km, at: first.pts[0] });
    }
    for (let i = 1; i < legs.length; i++) {
      const A = legs[i - 1], B = legs[i];
      const d = (normA(headAt(B.pts) - headAt(A.pts, true)) * 180) / Math.PI;
      const side = d > 0 ? 'right' : 'left';
      let text, glyph;
      if (!isFast(A.cls) && isFast(B.cls)) { text = 'Take the ramp onto ' + B.name; glyph = d > 0 ? 'arrow.slight.right' : 'arrow.slight.left'; }
      else if (isFast(A.cls) && !isFast(B.cls)) { text = 'Take the exit toward ' + B.name; glyph = d > 0 ? 'arrow.slight.right' : 'arrow.slight.left'; }
      else if (isFast(A.cls) && isFast(B.cls)) { text = 'Keep ' + side + ' to continue onto ' + B.name; glyph = d > 0 ? 'arrow.slight.right' : 'arrow.slight.left'; }
      else if (Math.abs(d) < 22) { text = 'Continue onto ' + B.name; glyph = 'arrow.straight'; }
      else if (Math.abs(d) < 60) { text = 'Slight ' + side + ' onto ' + B.name; glyph = d > 0 ? 'arrow.slight.right' : 'arrow.slight.left'; }
      else if (Math.abs(d) < 150) { text = 'Turn ' + side + ' onto ' + B.name; glyph = d > 0 ? 'arrow.turn.up.right' : 'arrow.turn.up.left'; }
      else { text = 'Make a U-turn onto ' + B.name; glyph = 'arrow.uturn.left'; }
      steps.push({ glyph, kind: 'turn', text, road: B.name, km: B.km, at: B.pts[0] });
    }
    // arrival side
    const lastLeg = legs[legs.length - 1];
    let sideTxt = '';
    if (lastLeg) {
      const hd = headAt(lastLeg.pts, true);
      const lp = lastLeg.pts[lastLeg.pts.length - 1];
      const cross = Math.cos(hd) * (to.y - lp[1]) - Math.sin(hd) * (to.x - lp[0]);
      sideTxt = Math.hypot(to.x - lp[0], to.y - lp[1]) > 0.01 ? (cross > 0 ? ', on the right' : ', on the left') : '';
    }
    steps.push({ glyph: 'flag.checkered', kind: 'arrive', text: 'Arrive at ' + (to.short || to.name) + sideTxt, road: to.addr || '', km: 0, at: [to.x, to.y] });
    // main road for the summary
    let main = null;
    legs.forEach((l) => { if (!main || l.km > main.km) main = l; });
    const minutes = Math.max(1, Math.round(res.minutes + (mode === 'drive' ? 1 : 0)));
    const usesHwy = legs.some((l) => isFast(l.cls));
    return { mode, from, to, pts, km, min: minutes, steps, via: main ? main.name : '', hwy: usesHwy, edges: pieces.map((p) => p.e), opt };
  }

  const routeCache = {};
  /** routes(from, to, mode) → up to 3 alternatives, fastest first */
  function routes(from, to, mode, opt) {
    mode = mode || 'drive';
    opt = opt || {};
    const A = placeOf(from), B = placeOf(to);
    if (!A || !B) return [];
    const ck = [A.x.toFixed(3), A.y.toFixed(3), B.x.toFixed(3), B.y.toFixed(3), mode, JSON.stringify(opt.avoid || {})].join('|');
    if (routeCache[ck]) return routeCache[ck];
    const m = mode === 'transit' || mode === 'ride' ? 'drive' : mode;
    const src = snapTo(A.x, A.y, m), dst = snapTo(B.x, B.y, m);
    if (!src || !dst) return [];
    const out = [];
    const r1 = shortest(src, dst, m, { avoid: opt.avoid });
    if (!r1) return [];
    const best = buildRoute(A, B, m, r1, opt);
    out.push(best);
    if (m === 'drive' || A && B && dist(A, B) > 1) {
      const pen = {};
      best.edges.forEach((id) => { pen[id] = 2.2; });
      const r2 = shortest(src, dst, m, { avoid: opt.avoid, penalty: pen });
      if (r2) {
        const alt = buildRoute(A, B, m, r2, opt);
        // recompute true minutes (without the penalty)
        alt.min = Math.max(1, Math.round(trueMin(alt, m)));
        const shared = alt.edges.filter((id) => best.edges.includes(id)).length / Math.max(1, alt.edges.length);
        if (shared < 0.8 && alt.min < best.min * 1.6 + 3 && alt.via !== best.via) out.push(alt);
      }
      if (m === 'drive' && best.hwy && !(opt.avoid && opt.avoid.hwy)) {
        const r3 = shortest(src, dst, m, { avoid: { hwy: true } });
        if (r3) {
          const alt = buildRoute(A, B, m, r3, opt);
          alt.noHwy = true;
          if (!out.some((o) => o.via === alt.via) && alt.min < best.min * 2.4 + 5) out.push(alt);
        }
      }
    }
    routeCache[ck] = out;
    return out;
  }
  function trueMin(r, mode) {
    const G = graph();
    let m = 0;
    r.edges.forEach((id) => { const e = G.edges[id]; if (e) m += edgeMin(e, mode); });
    return m * 0.92 + 1;
  }
  function route(from, to, mode, opt) { return routes(from, to, mode, opt)[0] || null; }

  // ── transit itineraries ──
  function nearestStation(x, y) {
    let best = null;
    METRO.forEach((L) => L.st.forEach((s, i) => { const d = Math.hypot(s[1] - x, s[2] - y); if (!best || d < best.d) best = { d, line: L, i, name: s[0], x: s[1], y: s[2] }; }));
    return best;
  }
  function cityOf(x, y) {
    for (const u of URBAN) if (u.rank <= 3 && x >= u.bb.x0 && x <= u.bb.x1 && y >= u.bb.y0 && y <= u.bb.y1 && pip(x, y, u.pts)) return u.name;
    let best = null;
    URBAN.forEach((u) => { if (u.rank > 3) return; const d = Math.hypot(u.label[0] - x, u.label[1] - y); if (!best || d < best.d) best = { d, n: u.name }; });
    return best ? best.n : 'Lanling';
  }
  function railStation(city) { return RAIL_ST.find((s) => s.city === city) || null; }
  function nextDeparture(t, open, close, every) {
    // t: minutes since midnight today (may exceed 1440); service open..close every N minutes
    const day = Math.floor(t / 1440) * 1440;
    const m = t - day;
    if (m >= open && m <= close) return day + Math.ceil(m / every) * every;
    if (m < open) return day + open;
    return day + 1440 + open;
  }
  function railPath(a, b) {
    for (const r of RAIL) {
      let ia = -1, ib = -1, da = 2, db = 2;
      r.pts.forEach((p, i) => { const d1 = Math.hypot(p[0] - a[0], p[1] - a[1]), d2 = Math.hypot(p[0] - b[0], p[1] - b[1]); if (d1 < da) { da = d1; ia = i; } if (d2 < db) { db = d2; ib = i; } });
      if (ia >= 0 && ib >= 0) { const seg = ia <= ib ? r.pts.slice(ia, ib + 1) : r.pts.slice(ib, ia + 1).reverse(); return [a].concat(seg, [b]); }
    }
    return [a, b];
  }
  function transit(from, to) {
    const A = placeOf(from), B = placeOf(to);
    if (!A || !B) return null;
    const now = new Date(JC.time.now());
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const cA = cityOf(A.x, A.y), cB = cityOf(B.x, B.y);
    const legs = [];
    let t = nowMin;
    let cur = [A.x, A.y];
    const walkLeg = (txt, km, to) => { const m = Math.max(1, Math.round((km * 1.3 / 4.8) * 60)); legs.push({ kind: 'walk', glyph: 'figure.walk', text: txt, min: m, km, pts: [cur, to] }); cur = to; t += m; };
    const stAt = (line, name) => { const s = line.st.find((q) => q[0] === name); return s ? [s[1], s[2]] : cur; };
    const metroRide = (sa, sb) => {
      // same line, or one transfer at a shared station
      const lines = [];
      if (sa.line === sb.line) lines.push([sa.line, sa.name, sb.name, Math.abs(sa.i - sb.i), sa.i, sb.i]);
      else {
        const xf = sa.line.st.map((s) => s[0]).find((n) => sb.line.st.some((q) => q[0] === n));
        if (xf) {
          const ia = sa.line.st.findIndex((s) => s[0] === xf), ib = sb.line.st.findIndex((s) => s[0] === xf);
          lines.push([sa.line, sa.name, xf, Math.abs(sa.i - ia), sa.i, ia], [sb.line, xf, sb.name, Math.abs(sb.i - ib), ib, sb.i]);
        } else lines.push([sa.line, sa.name, sb.name, 4, sa.i, sb.i]);
      }
      lines.forEach((l, k) => {
        const dep = nextDeparture(t + 2, 6 * 60, 23 * 60 + 30, 6);
        const ride = Math.max(2, l[3] * 2 + 1);
        const L = l[0];
        const i0 = l[4], i1 = l[5];
        const seq = (i0 <= i1 ? L.st.slice(i0, i1 + 1) : L.st.slice(i1, i0 + 1).reverse()).map((q) => [q[1], q[2]]);
        const toward = i1 >= i0 ? L.st[L.st.length - 1][0] : L.st[0][0];
        legs.push({ kind: 'metro', glyph: 'tram.fill', color: L.color, line: L.id, text: L.name + ' toward ' + toward, from: l[1], to: l[2], stops: l[3], dep, min: (dep - t) + ride, pts: seq });
        cur = seq[seq.length - 1] || cur;
        t = dep + ride + (k < lines.length - 1 ? 3 : 0);
      });
    };
    if (cA === cB && cA === 'Lanling') {
      const sa = nearestStation(A.x, A.y), sb = nearestStation(B.x, B.y);
      if (sa.name === sb.name || Math.hypot(A.x - B.x, A.y - B.y) < 1.2) walkLeg('Walk to ' + (B.short || B.name), Math.hypot(A.x - B.x, A.y - B.y), [B.x, B.y]);
      else { walkLeg('Walk to ' + sa.name + ' Station', sa.d, [sa.x, sa.y]); metroRide(sa, sb); walkLeg('Walk to ' + (B.short || B.name), sb.d, [B.x, B.y]); }
    } else if (cA === cB) {
      const km = Math.hypot(A.x - B.x, A.y - B.y);
      if (km < 1.4) walkLeg('Walk to ' + (B.short || B.name), km, [B.x, B.y]);
      else {
        walkLeg('Walk to bus stop', 0.25, [A.x + (B.x - A.x) * 0.05, A.y + (B.y - A.y) * 0.05]);
        const dep = nextDeparture(t + 4, 6 * 60, 22 * 60, 12);
        const m = Math.round(km * 3.2) + 4;
        const end = [B.x - (B.x - A.x) * 0.05, B.y - (B.y - A.y) * 0.05];
        legs.push({ kind: 'bus', glyph: 'tram.fill', color: '#30a46c', line: 'Bus ' + (2 + Math.floor(hash2(Math.round(A.x), Math.round(B.y), 3) * 30)), text: cA + ' City Bus', dep, min: (dep - t) + m, pts: [cur, end] });
        cur = end;
        t = dep + m;
        walkLeg('Walk to ' + (B.short || B.name), 0.3, [B.x, B.y]);
      }
    } else {
      const ra = railStation(cA), rb = railStation(cB);
      if (!ra || !rb) return null;
      if (cA === 'Lanling') {
        const sa = nearestStation(A.x, A.y), sb = nearestStation(ra.at[0], ra.at[1]);
        if (sa.name !== sb.name) { walkLeg('Walk to ' + sa.name + ' Station', sa.d, [sa.x, sa.y]); metroRide(sa, sb); } else walkLeg('Walk to ' + ra.name, Math.hypot(A.x - ra.at[0], A.y - ra.at[1]), ra.at.slice());
      } else {
        const km = Math.hypot(A.x - ra.at[0], A.y - ra.at[1]);
        if (km < 1.5) walkLeg('Walk to ' + ra.name, km, ra.at.slice());
        else { const m = Math.round(km * 2.6) + 3; const dep = nextDeparture(t + 3, 6 * 60, 22 * 60, 15); legs.push({ kind: 'bus', glyph: 'tram.fill', color: '#30a46c', line: 'Bus 1', text: 'Bus to ' + ra.name, dep, min: (dep - t) + m, pts: [cur, ra.at.slice()] }); cur = ra.at.slice(); t = dep + m; }
      }
      const km = Math.hypot(ra.at[0] - rb.at[0], ra.at[1] - rb.at[1]) * 1.15;
      const ride = Math.round(km / 230 * 60) + 9;
      const dep = nextDeparture(t + 12, 6 * 60 + 30, 22 * 60 + 30, 30);
      const trainNo = 'G' + (1000 + Math.floor(hash2(Math.round(ra.at[0]), Math.round(rb.at[0]), 7) * 8000));
      legs.push({ kind: 'rail', glyph: 'tram.fill', color: '#5e5ce6', line: trainNo, text: 'High-speed train ' + trainNo + ' to ' + rb.name, from: ra.name, to: rb.name, dep, min: (dep - t) + ride, pts: railPath(ra.at.slice(), rb.at.slice()) });
      cur = rb.at.slice();
      t = dep + ride;
      const km2 = Math.hypot(B.x - rb.at[0], B.y - rb.at[1]);
      if (km2 < 1.5) walkLeg('Walk to ' + (B.short || B.name), km2, [B.x, B.y]);
      else { legs.push({ kind: 'taxi', glyph: 'car.fill', color: '#8e8e93', text: 'Taxi or Swift Ride to ' + (B.short || B.name), min: Math.round(km2 * 1.6) + 4, pts: [cur, [B.x, B.y]] }); t += Math.round(km2 * 1.6) + 4; }
    }
    const first = legs.find((l) => l.dep != null);
    return { legs, min: t - nowMin, depart: first ? first.dep : nowMin, nowMin, tomorrow: first ? first.dep >= 1440 || first.dep - nowMin > 180 : false };
  }

  // ═══ formatting ═══════════════════════════════════════════════════════════
  const dist = (a, b) => { const A = placeOf(a) || { x: a[0], y: a[1] }, B = placeOf(b) || { x: b[0], y: b[1] }; return Math.hypot(A.x - B.x, A.y - B.y); };
  const fmtDist = (km) => (km < 1 ? Math.max(10, Math.round(km * 100) * 10) + ' m' : km < 10 ? km.toFixed(1) + ' km' : Math.round(km) + ' km');
  const fmtMin = (m) => { m = Math.round(m); if (m < 60) return m + ' min'; const hh = Math.floor(m / 60), mm = m % 60; return hh + ' hr' + (mm ? ' ' + mm + ' min' : ''); };
  function fmtClockMin(min) {
    const d = new Date(JC.time.now());
    d.setHours(0, 0, 0, 0);
    return JC.util.fmtTime(d.getTime() + min * 60000);
  }
  /** opening hours → { open, text, color } */
  function hoursInfo(p, t) {
    const hrs = p && p.hours;
    if (!hrs) return null;
    if (hrs === '24h') return { open: true, text: 'Open 24 hours', short: 'Open 24 hours' };
    if (hrs === 'invite') return { open: false, text: 'By invitation', short: 'By invitation', neutral: true };
    const d = new Date(t || JC.time.now());
    const day = d.getDay();
    let spec = hrs;
    let days = null;
    const m = /^(Mon|Sat)-(Fri|Sun)\s+(.*)$/.exec(hrs);
    if (m) { days = m[1] === 'Mon' ? [1, 2, 3, 4, 5] : [6, 0]; spec = m[3]; }
    const r = /^(\d\d):(\d\d)-(\d\d):(\d\d)$/.exec(spec);
    if (!r) return { open: true, text: hrs, short: hrs };
    const o = +r[1] * 60 + +r[2];
    let c = +r[3] * 60 + +r[4];
    if (c <= o) c += 1440;
    let n = d.getHours() * 60 + d.getMinutes();
    const fmt = (mins) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return JC.util.fmtTime(x.getTime() + (mins % 1440) * 60000).replace(':00', ''); };
    const dayOk = (dd) => !days || days.includes((dd + 7) % 7);
    let open = false;
    if (dayOk(day) && n >= o && n < c) open = true;
    if (!open && c > 1440 && dayOk(day - 1) && n + 1440 < c) { open = true; n += 1440; }
    if (open) {
      const soon = c - n <= 60;
      return { open: true, soon, text: (soon ? 'Closes soon · ' : 'Open · Closes ') + fmt(c), short: soon ? 'Closes soon' : 'Open' };
    }
    let next = 'tomorrow';
    if (dayOk(day) && n < o) next = fmt(o);
    else if (days) { for (let k = 1; k < 8; k++) if (dayOk(day + k)) { next = k === 1 ? fmt(o) + ' tomorrow' : JC.util.DAYS[(day + k) % 7].slice(0, 3) + ' ' + fmt(o); break; } }
    else next = fmt(o);
    return { open: false, text: 'Closed · Opens ' + next, short: 'Closed' };
  }
  function nearestRoadName(x, y) {
    const G = graph();
    let best = null;
    G.edges.forEach((e) => { if (e.cls === 'link') return; for (let k = 0; k < e.pts.length - 1; k++) { const q = projSeg(x, y, e.pts[k], e.pts[k + 1]); if (!best || q.d < best.d) best = { d: q.d, n: e.name }; } });
    return best && best.d < 3 ? best.n : null;
  }
  function address(x, y) {
    const city = cityOf(x, y);
    const road = nearestRoadName(x, y);
    const num = 1 + Math.floor(hash2(Math.round(x * 10), Math.round(y * 10), 5) * 180);
    return road ? num + ' ' + road + ', ' + city : 'Near ' + city;
  }
  function search(q, o) {
    o = o || {};
    q = String(q || '').trim().toLowerCase();
    const all = JC.store.all('places').filter((p) => p.id !== 'player-home' || o.includeHome);
    if (!q) return [];
    const words = q.split(/\s+/).filter(Boolean);
    const CATW = { restaurant: 'food', restaurants: 'food', food: 'food', eat: 'food', dinner: 'food', lunch: 'food', coffee: 'cafe', cafe: 'cafe', café: 'cafe', hotel: 'hotel', hotels: 'hotel', stay: 'hotel', park: 'park', parks: 'park', school: 'school', police: 'police', vet: 'health', hospital: 'health', train: 'transit', station: 'transit', metro: 'transit', tea: 'tea', pet: 'pet', dog: 'pet', shop: 'shopping', shopping: 'shopping', temple: 'temple', farm: 'farm', home: 'home' };
    const scored = all.map((p) => {
      const name = (p.name + ' ' + (p.short || '')).toLowerCase();
      const hay = [p.addr, p.city, p.sub, (p.tags || []).join(' '), (CATS[p.cat] || {}).label].join(' ').toLowerCase();
      let s = 0;
      if (name.startsWith(q)) s += 10;
      else if (name.includes(q)) s += 6;
      words.forEach((w) => {
        if (name.split(/[\s(（]+/).some((t) => t.startsWith(w))) s += 3;
        else if (hay.includes(w)) s += 1.6;
        if (CATW[w] && CATW[w] === p.cat) s += 2.5;
      });
      if (!s) return null;
      s -= Math.min(2, dist(p, HOME) / 120);
      return { p, s };
    }).filter(Boolean).sort((a, b) => b.s - a.s);
    return scored.map((x) => x.p);
  }

  // ═══ Styles ══════════════════════════════════════════════════════════════
  const ST = {
    explore: {
      light: { land: '#f4f1ea', urban: '#ece8e0', park: '#c8e6b2', forest: '#cfe5bc', farm: '#eef1dc', lotus: '#d6e8c0', lotusFlower: '#f3a5c4', mtn: ['#e6e8d6', '#dbe0c8', '#d0d8bb', '#c6cfb0'], mtnShade: 'rgba(100,110,80,.10)', water: '#9fd0f2', waterEdge: '#8cc4ec', waterLabel: '#3b82b8', bld: '#e3dfd6', bldEdge: '#d6d0c6', street: '#ffffff', streetCase: '#e2ddd4', art: '#ffffff', artCase: '#d4cec4', prov: '#fff3cf', provCase: '#e6cf8f', hwy: '#f8cb6a', hwyCase: '#dfa449', rail: '#b8b2a8', label: '#232326', label2: '#6e6e74', halo: 'rgba(255,255,255,.94)', shield: '#1f8f4e', mist: 'rgba(255,255,255,.55)', dist: '#8a8a90', mtnLabel: '#6d7a52', sea: '#9fd0f2', pier: '#cfc6b8' },
      dark: { land: '#1d1e21', urban: '#25262a', park: '#1d3424', forest: '#1c2e22', farm: '#212620', lotus: '#20302a', lotusFlower: '#b0577c', mtn: ['#222520', '#262a23', '#2a2f26', '#2e3429'], mtnShade: 'rgba(0,0,0,.25)', water: '#13304a', waterEdge: '#173a58', waterLabel: '#6aa2d6', bld: '#2e2f34', bldEdge: '#38393f', street: '#3c3d42', streetCase: '#2b2c30', art: '#4b4c52', artCase: '#2f3034', prov: '#5a5236', provCase: '#3f3926', hwy: '#7d6633', hwyCase: '#4d3f22', rail: '#4d4d52', label: '#ececf0', label2: '#a0a0a6', halo: 'rgba(22,22,24,.92)', shield: '#1e7a46', mist: 'rgba(140,150,170,.14)', dist: '#8e8e94', mtnLabel: '#97a383', sea: '#13304a', pier: '#55524c' },
    },
    muted: {
      light: { land: '#eef0f3', urban: '#e7e9ed', park: '#d7e8d1', forest: '#dbe8d4', farm: '#eceee8', lotus: '#d9e6d4', lotusFlower: '#f0b8cf', mtn: ['#e5e8e2', '#dde1da', '#d6dbd2', '#cfd5cb'], mtnShade: 'rgba(90,100,90,.08)', water: '#bcd7ee', waterEdge: '#aecbe4', waterLabel: '#6a8fb0', bld: '#e1e3e8', bldEdge: '#d6d9df', street: '#ffffff', streetCase: '#dfe2e7', art: '#ffffff', artCase: '#d2d5db', prov: '#ffffff', provCase: '#cfd2d8', hwy: '#ffffff', hwyCase: '#c3c7ce', rail: '#c2c5cb', label: '#3a3b40', label2: '#7d8088', halo: 'rgba(255,255,255,.94)', shield: '#5b6270', mist: 'rgba(255,255,255,.4)', dist: '#9a9da4', mtnLabel: '#80887a', sea: '#bcd7ee', pier: '#cfd2d8' },
      dark: { land: '#16171a', urban: '#1c1d21', park: '#192620', forest: '#18231d', farm: '#1a1c1a', lotus: '#1b2521', lotusFlower: '#8d4b67', mtn: ['#1b1d1b', '#1e211e', '#212521', '#242924'], mtnShade: 'rgba(0,0,0,.25)', water: '#0f2235', waterEdge: '#132a40', waterLabel: '#5d86ad', bld: '#24262b', bldEdge: '#2c2e33', street: '#30323a', streetCase: '#222329', art: '#3c3e46', artCase: '#25262c', prov: '#43454e', provCase: '#2a2b31', hwy: '#4c4f5a', hwyCase: '#2d2f36', rail: '#3f4148', label: '#e3e4e8', label2: '#8f939b', halo: 'rgba(16,17,20,.92)', shield: '#4c5260', mist: 'rgba(140,150,170,.1)', dist: '#7f838b', mtnLabel: '#7f8a78', sea: '#0f2235', pier: '#3a3b40' },
    },
    satellite: {
      any: { roofs: ['#a9a49a', '#8f8b82', '#b5ab9a', '#7d7a73', '#c2b8a6', '#6f6c66', '#9a8f80', '#b9b3a8'], land: '#4b5a37', urban: '#827c70', park: '#3f5a2e', forest: '#344a27', farm: '#7d8048', lotus: '#3f6a46', lotusFlower: '#d98aa8', mtn: ['#405231', '#394a2b', '#334326', '#2c3a21'], mtnShade: 'rgba(0,0,0,.22)', water: '#18394d', waterEdge: '#1d4559', waterLabel: '#bfe3ff', bld: '#9c958a', bldEdge: '#857e73', street: 'rgba(235,232,225,.55)', streetCase: 'rgba(0,0,0,0)', art: 'rgba(250,248,240,.8)', artCase: 'rgba(0,0,0,.25)', prov: 'rgba(255,236,170,.75)', provCase: 'rgba(0,0,0,.25)', hwy: 'rgba(255,214,120,.9)', hwyCase: 'rgba(0,0,0,.3)', rail: 'rgba(220,220,220,.5)', label: '#ffffff', label2: '#f0f0f0', halo: 'rgba(0,0,0,.65)', shield: '#1f8f4e', mist: 'rgba(255,255,255,.22)', dist: '#f2f2f2', mtnLabel: '#f4f4f4', sea: '#132f42', pier: '#a59d90' },
    },
  };
  function palette(style, dark) {
    if (style === 'satellite') return ST.satellite.any;
    const base = style === 'muted' ? ST.muted : ST.explore;
    const p = Object.assign({}, dark ? base.dark : base.light);
    if (style === 'transit') {
      Object.assign(p, dark ? { hwy: '#4a4b52', hwyCase: '#2c2d31', prov: '#44454b', provCase: '#2c2d31', art: '#45464c' } : { hwy: '#ffffff', hwyCase: '#d0ccc5', prov: '#ffffff', provCase: '#d6d1c9' });
    }
    if (style === 'driving') {
      Object.assign(p, dark ? { hwy: '#9a7a33', hwyCase: '#5a4823', art: '#5a5b62' } : { hwy: '#f6bf4a', hwyCase: '#d4902c', artCase: '#c2bcb1', land: '#f1eee7' });
    }
    return p;
  }
  let FONT = '-apple-system, "SF Pro Text", Inter, "Helvetica Neue", Arial, sans-serif';
  function grabFont() {
    try { const s = document.getElementById('screen'); if (s) { const f = getComputedStyle(s).fontFamily; if (f) FONT = f; } } catch (e) { /* ignore */ }
  }

  // satellite texture
  let SAT = null;
  function satTex() {
    if (SAT) return SAT;
    const mk = (size, seed, scale, alpha) => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const x = c.getContext('2d');
      const img = x.createImageData(size, size);
      const r = rng(seed);
      const grid = [];
      const G = 16;
      for (let i = 0; i <= G; i++) { grid[i] = []; for (let j = 0; j <= G; j++) grid[i][j] = r(); }
      for (let i = 0; i <= G; i++) { grid[i][G] = grid[i][0]; grid[G][i] = grid[0][i]; }
      for (let y = 0; y < size; y++) for (let xx = 0; xx < size; xx++) {
        const gx = (xx / size) * G, gy = (y / size) * G;
        const i0 = Math.floor(gx), j0 = Math.floor(gy), fx = gx - i0, fy = gy - j0;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const v = grid[i0][j0] * (1 - sx) * (1 - sy) + grid[i0 + 1][j0] * sx * (1 - sy) + grid[i0][j0 + 1] * (1 - sx) * sy + grid[i0 + 1][j0 + 1] * sx * sy;
        const n = (v * 0.7 + r() * 0.3) * scale;
        const k = (y * size + xx) * 4;
        const lum = n > 0.5 ? 255 : 0;
        img.data[k] = lum; img.data[k + 1] = lum; img.data[k + 2] = lum;
        img.data[k + 3] = Math.abs(n - 0.5) * 2 * 255 * alpha;
      }
      x.putImageData(img, 0, 0);
      return c;
    };
    SAT = { coarse: mk(128, 7, 1, 0.5), fine: mk(128, 13, 1, 0.42) };
    return SAT;
  }

  // POI icons rendered as images (white glyph on category colour)
  const ICON_IMG = {};
  function poiIcon(cat, ring) {
    const k = cat + (ring ? ':r' : '');
    if (ICON_IMG[k]) return ICON_IMG[k];
    const c = CATS[cat] || CATS.pin;
    const inner = JC.icon.svg(c.glyph, 26, 2.2).replace('<svg ', '<svg x="11" y="11" ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" color="#fff"><circle cx="24" cy="24" r="21" fill="${c.color}" stroke="${ring || '#ffffff'}" stroke-width="3"/>${inner}</svg>`;
    const img = new Image();
    img.onload = () => { img.ready = true; JC.bus.emit('mapview:icons'); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    ICON_IMG[k] = img;
    return img;
  }
  function preloadIcons() { Object.keys(CATS).forEach((k) => { poiIcon(k); poiIcon(k, '#1c1c1e'); }); }

  // ═══ Renderer ═════════════════════════════════════════════════════════════
  /** Draws the map into ctx. V = { cx, cy, z, b, w, h, sx, sy, ratio }; o = options. Returns hit targets. */
  function drawMap(ctx, V, o) {
    const S = palette(o.style, o.dark);
    const { w, h, z } = V;
    const cosb = Math.cos(V.b), sinb = Math.sin(V.b);
    const proj = (x, y) => { const dx = (x - V.cx) * z, dy = (y - V.cy) * z; return [V.sx + dx * cosb + dy * sinb, V.sy - dx * sinb + dy * cosb]; };
    const unproj = (sx, sy) => { const dx = (sx - V.sx) / z, dy = (sy - V.sy) / z; return [V.cx + dx * cosb - dy * sinb, V.cy + dx * sinb + dy * cosb]; };
    const corners = [unproj(0, 0), unproj(w, 0), unproj(0, h), unproj(w, h)];
    const vb = bboxOf(corners);
    const pad = 40 / z;
    vb.x0 -= pad; vb.y0 -= pad; vb.x1 += pad; vb.y1 += pad;
    const vis = (bb) => !(bb.x1 < vb.x0 || bb.x0 > vb.x1 || bb.y1 < vb.y0 || bb.y0 > vb.y1);
    const sat = o.style === 'satellite';

    ctx.setTransform(V.ratio, 0, 0, V.ratio, 0, 0);
    ctx.fillStyle = S.land;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(V.sx, V.sy);
    ctx.rotate(-V.b);
    ctx.scale(z, z);
    ctx.translate(-V.cx, -V.cy);
    const px = 1 / z;
    const poly = (pts, close) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close !== false) ctx.closePath(); };
    const line = (pts) => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); };

    if (sat) {
      const T = satTex();
      ctx.save();
      const pc = ctx.createPattern(T.coarse, 'repeat');
      pc.setTransform(new DOMMatrix().scale(0.12));
      ctx.fillStyle = pc; ctx.globalAlpha = 0.5;
      ctx.fillRect(vb.x0, vb.y0, vb.x1 - vb.x0, vb.y1 - vb.y0);
      if (z > 30) { const pf = ctx.createPattern(T.fine, 'repeat'); pf.setTransform(new DOMMatrix().scale(0.006)); ctx.fillStyle = pf; ctx.globalAlpha = 0.45; ctx.fillRect(vb.x0, vb.y0, vb.x1 - vb.x0, vb.y1 - vb.y0); }
      ctx.restore();
    }
    // farmland
    ctx.fillStyle = S.farm;
    FARMS.forEach((f) => { poly(f); ctx.fill(); });
    if (sat && z > 5) drawFields(ctx, vb, z);
    // forests
    ctx.fillStyle = S.forest;
    FORESTS.forEach((f) => { poly(f); ctx.fill(); });
    // mountains (layered relief)
    MOUNTAINS.forEach((m) => {
      if (!vis(m.bb)) return;
      m.layers.forEach((L, i) => {
        if (i > 0) { ctx.save(); ctx.translate(0.5 * (i), 0.7 * (i)); ctx.fillStyle = S.mtnShade; poly(L); ctx.fill(); ctx.restore(); }
        ctx.fillStyle = m.dark ? (o.dark || sat ? '#1f241c' : ['#d7dccb', '#c9d0bb', '#bcc5ab', '#aeb99c'][i]) : S.mtn[i];
        poly(L); ctx.fill();
      });
    });
    // urban
    URBAN.forEach((u) => { if (!vis(u.bb)) return; ctx.fillStyle = S.urban; poly(u.pts); ctx.fill(); });
    // parks
    PARKS.forEach((p) => { if (!vis(p.bb) || z < 0.5 * (p.lz || 1)) return; ctx.fillStyle = S.park; poly(p.pts); ctx.fill(); });
    // water
    ctx.fillStyle = S.water;
    poly(SEA); ctx.fill();
    LAKES.forEach((l) => { if (!l.bb) l.bb = bboxOf(l.pts); if (!vis(l.bb)) return; poly(l.pts); ctx.fill(); });
    ctx.strokeStyle = S.water;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    RIVERS.forEach((r) => {
      if (!r.bb) r.bb = bboxOf(r.pts);
      if (!vis(r.bb)) return;
      ctx.lineWidth = Math.max(r.w, (r.w > 0.3 ? 1.6 : 0.9) * px * (z < 2 ? 1 : 1.3));
      line(r.pts); ctx.stroke();
    });
    // lotus fields
    LOTUS.forEach((L) => { ctx.fillStyle = S.lotus; poly(L); ctx.fill(); });
    if (z > 70) drawLotusPads(ctx, vb, S);
    // canals (Gusu)
    // city blocks: streets & buildings
    const streetZ = 30, bldZ = 42;
    if (z >= streetZ * 0.8) URBAN.forEach((u) => { if (vis(u.bb)) drawCity(ctx, u, vb, z, S, z >= bldZ, z >= streetZ); });
    // pier
    if (z > 40) { ctx.strokeStyle = S.pier; ctx.lineWidth = 0.035; line([[258.7, 147.3], [258.9, 148.9]]); ctx.stroke(); line([[258.3, 148.5], [259.4, 148.5]]); ctx.stroke(); }
    // rail
    if (z > 1.3) {
      RAIL.forEach((r) => {
        if (!r.bb) r.bb = bboxOf(r.pts);
        if (!vis(r.bb)) return;
        ctx.strokeStyle = S.rail; ctx.lineWidth = (z > 20 ? 3 : 1.6) * px; ctx.setLineDash([]); line(r.pts); ctx.stroke();
        if (z > 6 && !sat) { ctx.strokeStyle = o.dark ? '#2a2b2f' : '#ffffff'; ctx.lineWidth = (z > 20 ? 1.4 : 0.8) * px; ctx.setLineDash([6 * px, 6 * px]); line(r.pts); ctx.stroke(); ctx.setLineDash([]); }
      });
    }
    // roads
    const W = {
      hwy: clamp(1.3 * Math.pow(z, 0.36), 1.4, 11),
      ring: clamp(1.15 * Math.pow(z, 0.36), 1.2, 10),
      prov: clamp(0.8 * Math.pow(z, 0.42), 0.9, 9),
      art: clamp(0.5 * Math.pow(z, 0.56), 0.7, 10),
      mtn: clamp(0.4 * Math.pow(z, 0.54), 0.7, 7.5),
    };
    const showCls = (c) => (c === 'hwy' ? true : c === 'ring' ? z > 1.6 : c === 'prov' ? z > 1.4 : c === 'mtn' ? z > 2.5 : z > 3.2);
    const fillOf = (c) => (c === 'hwy' || c === 'ring' ? S.hwy : c === 'prov' ? S.prov : S.art);
    const caseOf = (c) => (c === 'hwy' || c === 'ring' ? S.hwyCase : c === 'prov' ? S.provCase : S.artCase);
    const order = ['mtn', 'art', 'prov', 'ring', 'hwy'];
    const casing = z > 5;
    order.forEach((cls) => {
      if (!showCls(cls)) return;
      const list = ROADS.filter((r) => r.cls === cls && vis(r.bb));
      if (casing) { ctx.strokeStyle = caseOf(cls); ctx.lineWidth = (W[cls] + (cls === 'art' ? 1.4 : 1.8)) * px; list.forEach((r) => { line(r.pts); ctx.stroke(); }); }
      ctx.strokeStyle = fillOf(cls); ctx.lineWidth = W[cls] * px; list.forEach((r) => { line(r.pts); ctx.stroke(); });
    });
    // traffic
    if (o.traffic && z > 3) drawTraffic(ctx, vb, z, W, px);
    // transit overlay
    if (o.style === 'transit' && z > 3) {
      METRO.forEach((L) => {
        const pts = L.st.map((s) => [s[1], s[2]]);
        ctx.strokeStyle = o.dark ? '#000' : '#fff'; ctx.lineWidth = (z > 30 ? 8 : 5.5) * px; line(pts); ctx.stroke();
        ctx.strokeStyle = L.color; ctx.lineWidth = (z > 30 ? 5 : 3.4) * px; line(pts); ctx.stroke();
      });
      RAIL.forEach((r) => { ctx.strokeStyle = '#5e5ce6'; ctx.lineWidth = 2.6 * px; ctx.setLineDash([]); line(r.pts); ctx.stroke(); });
      if (z > 8) METRO.forEach((L) => L.st.forEach((s) => { ctx.beginPath(); ctx.arc(s[1], s[2], (z > 30 ? 5 : 3.6) * px, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 1.6 * px; ctx.strokeStyle = L.color; ctx.stroke(); }));
    }
    // routes
    (o.routes || []).slice().sort((a, b) => (a.alt ? 0 : 1) - (b.alt ? 0 : 1)).forEach((r) => {
      if (!r.pts || r.pts.length < 2) return;
      const wpx = r.width || (r.alt ? 6 : 7.5);
      if (r.dotted) {
        ctx.fillStyle = r.color || '#0a84ff';
        const cum = cumul(r.pts);
        const L = cum[cum.length - 1];
        const stepK = 11 * px;
        for (let s = 0; s <= L; s += stepK) { const p = along(r.pts, cum, s); ctx.beginPath(); ctx.arc(p.x, p.y, 2.6 * px, 0, TAU); ctx.fill(); }
        return;
      }
      ctx.strokeStyle = r.alt ? (o.dark ? '#26445f' : '#9cc4ef') : (o.dark ? '#08305c' : '#ffffff');
      if (!r.alt) { ctx.lineWidth = (wpx + 3) * px; line(r.pts); ctx.stroke(); }
      ctx.strokeStyle = r.alt ? (o.dark ? '#3c6c9b' : '#7fb0e6') : (r.color || '#0a84ff');
      ctx.lineWidth = wpx * px;
      if (r.dash) ctx.setLineDash([r.dash[0] * px, r.dash[1] * px]);
      line(r.pts); ctx.stroke(); ctx.setLineDash([]);
      if (r.progress != null && r.progress > 0) {
        // travelled part greyed out
        const cum = cumul(r.pts);
        const part = subLine(r.pts, cum, 0, r.progress * cum[cum.length - 1]);
        ctx.strokeStyle = o.dark ? '#5b6670' : '#a9b4bf'; ctx.lineWidth = wpx * px; line(part); ctx.stroke();
      }
    });
    // mist over Gusu
    if (o.style !== 'satellite' && z < 40) {
      const mistA = clamp(1 - z / 40, 0, 1);
      [[30, 30, 14], [50, 50, 10], [22, 52, 9], [60, 36, 11], [44, 22, 9], [52, 62, 4]].forEach(([x, y, r], i) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, S.mist.replace(/[\d.]+\)$/, (m) => (parseFloat(m) * mistA * (i === 5 ? 0.9 : 1)) + ')'));
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      });
    }
    ctx.restore();

    // ── labels (screen space) ──
    const boxes = (o.reserve || []).slice();
    const hits = [];
    const collide = (b) => { if (b.x < 2 || b.y < 0 || b.x + b.w > w - 2 || b.y + b.h > h) return true; for (const q of boxes) if (b.x < q.x + q.w && b.x + b.w > q.x && b.y < q.y + q.h && b.y + b.h > q.y) return true; return false; };
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    const text = (t, x, y, font, color, halo, align, ls) => {
      ctx.font = font;
      ctx.letterSpacing = ls || '0px';
      ctx.textAlign = align || 'center';
      if (halo) { ctx.strokeStyle = halo; ctx.lineWidth = 3.2; ctx.strokeText(t, x, y); }
      ctx.fillStyle = color; ctx.fillText(t, x, y);
    };
    const measure = (t, font, ls) => { ctx.font = font; ctx.letterSpacing = ls || '0px'; return ctx.measureText(t).width; };
    const tryLabel = (t, x, y, font, color, ls, padX) => {
      const tw = measure(t, font, ls);
      const fh = parseFloat(/(\d+(\.\d+)?)px/.exec(font)[1]);
      const b = { x: x - tw / 2 - (padX || 3), y: y - fh / 2 - 2, w: tw + (padX || 3) * 2, h: fh + 4 };
      if (collide(b)) return false;
      boxes.push(b);
      text(t, x, y, font, color, S.halo, 'center', ls);
      return true;
    };
    if (o.labels !== false) {
      // cities
      URBAN.slice().sort((a, b) => a.rank - b.rank).forEach((u) => {
        const z0 = u.rank === 1 ? 0 : u.rank === 2 ? 0 : u.rank === 3 ? 0.9 : 2.2;
        const z1 = u.rank === 1 ? 26 : u.rank === 2 ? 40 : 60;
        if (z < z0 || z > z1) return;
        const [x, y] = proj(u.label[0], u.label[1]);
        const size = u.rank === 1 ? (z < 3 ? 15.5 : 18) : u.rank === 2 ? 14.5 : u.rank === 3 ? 13 : 11.5;
        tryLabel(u.name, x, y, `${u.rank <= 2 ? 700 : 600} ${size}px ${FONT}`, S.label, '0.2px');
      });
      // POIs
      const sel = o.selected;
      const plist = (o.places || JC.store.all('places')).filter((p) => o.pois !== false && z >= (p.minZ || 12) * (o.poiBoost || 1) && p.id !== sel && !(o.hidePlaces && o.hidePlaces.includes(p.id)) && (!o.poiFilter || o.poiFilter(p)));
      plist.sort((a, b) => (a.minZ || 12) - (b.minZ || 12));
      plist.forEach((p) => {
        if (p.x < vb.x0 || p.x > vb.x1 || p.y < vb.y0 || p.y > vb.y1) return;
        const [x, y] = proj(p.x, p.y);
        const r = z > 25 ? 11 : 9;
        const name = p.short || p.name;
        const font = `600 ${z > 25 ? 12 : 11}px ${FONT}`;
        const tw = measure(name, font);
        const ib = { x: x - r - 1, y: y - r - 1, w: r * 2 + 2, h: r * 2 + 2 };
        const lb = { x: x + r + 3, y: y - 8, w: tw + 6, h: 16 };
        if (collide(ib)) return;
        const showLabel = !collide(lb) && (!o.poiLabelMinZ || z >= o.poiLabelMinZ);
        boxes.push(ib);
        const img = poiIcon(p.cat);
        if (img.ready) ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
        else { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = (CATS[p.cat] || CATS.pin).color; ctx.fill(); }
        if (showLabel) {
          boxes.push(lb);
          const col = sat ? '#fff' : o.dark ? lighten((CATS[p.cat] || CATS.pin).color) : darken((CATS[p.cat] || CATS.pin).color);
          text(name, x + r + 4, y, font, col, S.halo, 'left');
        }
        hits.push({ id: p.id, x, y, r: r + 6, lb: showLabel ? lb : null });
      });
      // towns already in URBAN; mountain & water labels
      LAKES.forEach((l) => {
        if (z < l.lz || z > (l.lz < 2 ? 40 : 400)) return;
        const [x, y] = proj(l.label[0], l.label[1]);
        tryLabel(l.name, x, y, `italic 500 ${l.size + (z > 4 && l.lz < 2 ? 2 : 0)}px ${FONT}`, S.waterLabel, '0.4px');
      });
      LABELS.forEach((L) => {
        if (z < L.z0 || z > L.z1) return;
        const [x, y] = proj(L.at[0], L.at[1]);
        if (L.k === 'dist') tryLabel(L.t, x, y, `600 ${z > 30 ? 11 : 10}px ${FONT}`, S.dist, '1.6px');
        else if (L.k === 'water') tryLabel(L.t, x, y, `italic 500 ${L.size}px ${FONT}`, S.waterLabel, '0.5px');
        else tryLabel(L.t, x, y, `${L.k === 'pass' ? 600 : 600} ${L.size}px ${FONT}`, L.dark && !o.dark && !sat ? '#4e4a44' : S.mtnLabel, '0.6px');
      });
      // peaks
      if (z > 3 && z < 60) MOUNTAINS.forEach((m) => {
        if (!m.peakName || m.peakName === 'Qiongqi Pass' || m.peakName === 'Burial Mounds') return;
        const [x, y] = proj(m.peak[0], m.peak[1]);
        if (x < 0 || x > w || y < 0 || y > h) return;
        const t = '▲ ' + m.peakName + (m.ele && z > 6 ? '  ' + m.ele : '');
        tryLabel(t, x, y, `500 10.5px ${FONT}`, S.mtnLabel);
      });
      // rivers
      if (z > 3) RIVERS.forEach((r, ri) => {
        if (z < r.lz) return;
        const cum = r.cum || (r.cum = cumul(r.pts));
        const L = cum[cum.length - 1];
        // sample a visible point near the middle of the visible stretch
        const visS = [];
        for (let s = 0; s < L; s += Math.max(0.3, 40 / z)) { const p = along(r.pts, cum, s); const q = proj(p.x, p.y); if (q[0] > 30 && q[0] < w - 30 && q[1] > 40 && q[1] < h - 40) visS.push(s); }
        if (!visS.length) return;
        const s = visS[Math.floor(visS.length * (ri % 2 ? 0.35 : 0.6))];
        drawAlong(r.name, r.pts, cum, s, `italic 500 11px ${FONT}`, S.waterLabel, '0.6px');
      });
      // road names & shields
      if (z > 6) {
        ROADS.forEach((r) => {
          if (!vis(r.bb) || !showCls(r.cls)) return;
          if ((r.cls === 'art' || r.cls === 'mtn') && z < 13) return;
          if ((r.cls === 'prov') && z < 9) return;
          const visS = [];
          for (let s = 0; s < r.len; s += Math.max(0.1, 30 / z)) { const p = along(r.pts, r.cum, s); const q = proj(p.x, p.y); if (q[0] > 40 && q[0] < w - 40 && q[1] > 60 && q[1] < h - 60) visS.push(s); }
          if (!visS.length) return;
          const s = visS[Math.floor(visS.length / 2)];
          if ((r.cls === 'hwy' || r.cls === 'ring') && r.ref && z < 30) {
            const p = along(r.pts, r.cum, s); const [x, y] = proj(p.x, p.y);
            shield(r.ref, x, y);
          } else drawAlong(r.name, r.pts, r.cum, s, `500 ${z > 60 ? 11.5 : 10.5}px ${FONT}`, S.label2);
        });
      } else if (z > 1.6) {
        ROADS.forEach((r) => {
          if (!r.ref || !vis(r.bb) || !(r.cls === 'hwy')) return;
          const p = along(r.pts, r.cum, r.len * 0.5); const [x, y] = proj(p.x, p.y);
          shield(r.ref, x, y);
        });
      }
      // streets
      if (z > 110) URBAN.forEach((u) => { if (vis(u.bb)) streetLabels(u, vb); });
      if (o.style === 'transit' && z > 10) METRO.forEach((L) => L.st.forEach((s) => { const [x, y] = proj(s[1], s[2]); tryLabel(s[0], x, y + 12, `600 10.5px ${FONT}`, S.label); }));
    }
    function lighten(c) { return mix(c, '#ffffff', 0.25); }
    function darken(c) { return mix(c, '#000000', 0.12); }
    function shield(ref, x, y) {
      const font = `700 10px ${FONT}`;
      const tw = measure(ref, font);
      const b = { x: x - tw / 2 - 5, y: y - 8, w: tw + 10, h: 16 };
      if (collide(b)) return;
      boxes.push(b);
      ctx.fillStyle = S.shield;
      roundRect(ctx, b.x, b.y, b.w, b.h, 4); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; roundRect(ctx, b.x + 1.5, b.y + 1.5, b.w - 3, b.h - 3, 3); ctx.stroke();
      ctx.font = font; ctx.letterSpacing = '0px'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText(ref, x, y + 0.5);
    }
    function drawAlong(t, pts, cum, s, font, color, ls) {
      const tw = measure(t, font, ls);
      const half = tw / 2 / z;
      const p0 = along(pts, cum, s - half), p1 = along(pts, cum, s + half), pm = along(pts, cum, s);
      const a = proj(p0.x, p0.y), b = proj(p1.x, p1.y), m = proj(pm.x, pm.y);
      let ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
      const cw = Math.abs(Math.cos(ang)) * tw + Math.abs(Math.sin(ang)) * 12;
      const ch = Math.abs(Math.sin(ang)) * tw + Math.abs(Math.cos(ang)) * 12;
      const bx = { x: m[0] - cw / 2, y: m[1] - ch / 2, w: cw, h: ch };
      if (collide(bx)) return;
      boxes.push(bx);
      ctx.save(); ctx.translate(m[0], m[1]); ctx.rotate(ang);
      text(t, 0, 0, font, color, S.halo, 'center', ls);
      ctx.restore();
    }
    function streetLabels(u, vbb) {
      const g = [toGrid(u, vbb.x0, vbb.y0), toGrid(u, vbb.x1, vbb.y0), toGrid(u, vbb.x0, vbb.y1), toGrid(u, vbb.x1, vbb.y1)];
      const gb = bboxOf(g);
      const i0 = Math.floor(gb.x0 / u.sp), i1 = Math.ceil(gb.x1 / u.sp), j0 = Math.floor(gb.y0 / u.sp), j1 = Math.ceil(gb.y1 / u.sp);
      if ((i1 - i0) * (j1 - j0) > 900) return;
      const font = `500 10px ${FONT}`;
      for (let i = i0; i <= i1; i++) {
        if (!streetOn(u, 'u', i)) continue;
        const v = ((j0 + j1) / 2 + (hash2(i, u.seed, 4) - 0.5) * 2) * u.sp;
        const wx = u.ox + i * u.sp * u.cos - v * u.sin, wy = u.oy + i * u.sp * u.sin + v * u.cos;
        if (!pip(wx, wy, u.pts)) continue;
        const [x, y] = proj(wx, wy);
        const nm = streetName(u, 'u', i);
        const tw = measure(nm, font);
        let ang = Math.PI / 2 + u.ang - V.b;
        ang = normA(ang); if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
        const cw = Math.abs(Math.cos(ang)) * tw + 12 * Math.abs(Math.sin(ang)), ch = Math.abs(Math.sin(ang)) * tw + 12 * Math.abs(Math.cos(ang));
        const bx = { x: x - cw / 2, y: y - ch / 2, w: cw, h: ch };
        if (collide(bx)) continue;
        boxes.push(bx);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); text(nm, 0, 0, font, S.label2, S.halo); ctx.restore();
      }
      for (let j = j0; j <= j1; j++) {
        if (!streetOn(u, 'v', j)) continue;
        const uu = ((i0 + i1) / 2 + (hash2(j, u.seed, 6) - 0.5) * 2) * u.sp;
        const wx = u.ox + uu * u.cos - j * u.sp * u.sin, wy = u.oy + uu * u.sin + j * u.sp * u.cos;
        if (!pip(wx, wy, u.pts)) continue;
        const [x, y] = proj(wx, wy);
        const nm = streetName(u, 'v', j);
        const tw = measure(nm, font);
        let ang = normA(u.ang - V.b); if (ang > Math.PI / 2) ang -= Math.PI; else if (ang < -Math.PI / 2) ang += Math.PI;
        const cw = Math.abs(Math.cos(ang)) * tw + 12 * Math.abs(Math.sin(ang)), ch = Math.abs(Math.sin(ang)) * tw + 12 * Math.abs(Math.cos(ang));
        const bx = { x: x - cw / 2, y: y - ch / 2, w: cw, h: ch };
        if (collide(bx)) continue;
        boxes.push(bx);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); text(nm, 0, 0, font, S.label2, S.halo); ctx.restore();
      }
    }
    return { hits, boxes };
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t), g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t), bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }

  // procedural streets / buildings inside urban areas (drawn in grid space)
  const STREET_NAMES = {
    lanling: ['Golden Lane', 'Peony Lane', 'Lantern Lane', 'Plum Street', 'Silk Street', 'Crane Lane', 'Jade Street', 'Koi Lane', 'Willow Street', 'Phoenix Lane', 'Pearl Street', 'Orchid Lane', 'Bell Street', 'Brocade Lane', 'Gate Street', 'Tower Lane', 'Amber Street', 'Banner Lane'],
    yunmeng: ['Lotus Lane', 'Lake Street', 'Reed Lane', 'Boat Street', 'Pier Lane', 'Lotus Seed Lane', 'Heron Street', 'Willow Lane', 'Kite Lane', 'Oar Street', 'Pavilion Lane', 'Lantern Street'],
    gusu: ['Canal Lane', 'Gentian Lane', 'Cloud Lane', 'Bridge Street', 'Mist Lane', 'Pine Street', 'Rabbit Lane', 'Silk Lane', 'Tea Lane', 'Stone Street'],
    qinghe: ['Saber Lane', 'Fan Street', 'North Lane', 'Iron Street', 'Hill Lane', 'Gate Lane', 'Banner Street', 'Market Lane'],
    yiling: ['Radish Lane', 'Hill Street', 'Clinic Lane', 'Camphor Lane', 'Field Street', 'Flute Lane'],
  };
  function streetName(u, ax, i) {
    const list = STREET_NAMES[u.id] || ['Lane', 'Street'];
    const k = Math.floor(hash2(i, u.seed, ax === 'u' ? 21 : 22) * list.length);
    const n = list[k];
    const num = 1 + Math.floor(hash2(i, u.seed, ax === 'u' ? 23 : 24) * 9);
    return hash2(i, u.seed, 25) < 0.35 ? n + ' ' + ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][num - 1] : n;
  }
  function streetOn(u, ax, i) { return (i % 4 === 0) || hash2(i, u.seed, ax === 'u' ? 31 : 32) > 0.16; }
  function clipLine(u, ax, i) {
    const key = ax + i;
    if (u.lineCache[key]) return u.lineCache[key];
    const c = i * u.sp;
    const xs = [];
    const P = u.gpts;
    for (let k = 0, m = P.length - 1; k < P.length; m = k++) {
      const a = P[m], b = P[k];
      const A = ax === 'u' ? a[0] : a[1], B = ax === 'u' ? b[0] : b[1];
      if ((A <= c && B > c) || (B <= c && A > c)) {
        const t = (c - A) / (B - A);
        xs.push(ax === 'u' ? a[1] + (b[1] - a[1]) * t : a[0] + (b[0] - a[0]) * t);
      }
    }
    xs.sort((a, b) => a - b);
    const segs = [];
    for (let k = 0; k + 1 < xs.length; k += 2) segs.push([xs[k], xs[k + 1]]);
    u.lineCache[key] = segs;
    return segs;
  }
  function drawCity(ctx, u, vb, z, S, bld, streets) {
    const g = [toGrid(u, vb.x0, vb.y0), toGrid(u, vb.x1, vb.y0), toGrid(u, vb.x0, vb.y1), toGrid(u, vb.x1, vb.y1)];
    const gb = bboxOf(g);
    const i0 = Math.max(Math.floor(gb.x0 / u.sp), Math.floor(u.gbb.x0 / u.sp) - 1), i1 = Math.min(Math.ceil(gb.x1 / u.sp), Math.ceil(u.gbb.x1 / u.sp) + 1);
    const j0 = Math.max(Math.floor(gb.y0 / u.sp), Math.floor(u.gbb.y0 / u.sp) - 1), j1 = Math.min(Math.ceil(gb.y1 / u.sp), Math.ceil(u.gbb.y1 / u.sp) + 1);
    if (i1 < i0 || j1 < j0) return;
    ctx.save();
    ctx.translate(u.ox, u.oy);
    ctx.rotate(u.ang);
    const sp = u.sp;
    const px = 1 / z;
    if ((bld || (S.roofs && z > 20)) && (i1 - i0 + 1) * (j1 - j0 + 1) < 2600) {
      ctx.fillStyle = S.bld;
      ctx.strokeStyle = S.bldEdge;
      ctx.lineWidth = 0.6 * px;
      ctx.globalAlpha = S.roofs ? 1 : clamp((z - 36) / 40, 0.3, 1);
      const m = sp * 0.13;
      for (let i = i0; i < i1; i++) for (let j = j0; j < j1; j++) {
        const cx = (i + 0.5) * sp, cy = (j + 0.5) * sp;
        const wx = u.ox + cx * u.cos - cy * u.sin, wy = u.oy + cx * u.sin + cy * u.cos;
        if (!pip(cx, cy, u.gpts)) continue;
        if (inWaterOrPark(wx, wy)) continue;
        const r = hash2(i, j, u.seed);
        if (r < 0.08) continue;
        const x0 = i * sp + m, y0 = j * sp + m, W2 = sp - 2 * m;
        const layout = Math.floor(r * 5);
        const rects = [];
        if (layout === 0) rects.push([x0, y0, W2, W2]);
        else if (layout === 1) { rects.push([x0, y0, W2 * 0.46, W2], [x0 + W2 * 0.54, y0, W2 * 0.46, W2 * 0.7]); }
        else if (layout === 2) { const a = W2 * 0.46; rects.push([x0, y0, a, a], [x0 + W2 - a, y0, a, a * 1.1], [x0, y0 + W2 - a * 0.9, a * 1.05, a * 0.9], [x0 + W2 - a * 0.8, y0 + W2 - a, a * 0.8, a]); }
        else if (layout === 3) { rects.push([x0, y0, W2, W2 * 0.32], [x0, y0 + W2 * 0.4, W2 * 0.3, W2 * 0.6], [x0 + W2 * 0.42, y0 + W2 * 0.46, W2 * 0.58, W2 * 0.54]); }
        else rects.push([x0 + W2 * 0.1, y0 + W2 * 0.1, W2 * 0.8, W2 * 0.8]);
        if (S.roofs) ctx.fillStyle = S.roofs[Math.floor(r * 97) % S.roofs.length];
        rects.forEach((q) => { ctx.fillRect(q[0], q[1], q[2], q[3]); if (z > 120) ctx.strokeRect(q[0], q[1], q[2], q[3]); });
      }
      ctx.globalAlpha = 1;
    }
    if (streets) {
      const wst = clamp(0.12 * Math.pow(z, 0.64), 0.6, 7.5);
      const cw = u.canals ? 0.035 : 0;
      for (let pass = 0; pass < 2; pass++) {
        if (pass === 0 && z < 60) continue;
        ctx.strokeStyle = pass === 0 ? S.streetCase : S.street;
        ctx.lineWidth = (pass === 0 ? wst + 1.2 : wst) * px;
        ctx.beginPath();
        const minor = z >= 64;
        for (let i = i0; i <= i1; i++) {
          if (!streetOn(u, 'u', i)) continue;
          if (!minor && i % 2) continue;
          if (u.canals && ((i % 5) + 5) % 5 === 2) continue;
          clipLine(u, 'u', i).forEach((sg) => { const a = Math.max(sg[0], gb.y0 - 1), b = Math.min(sg[1], gb.y1 + 1); if (b > a) { ctx.moveTo(i * sp, a); ctx.lineTo(i * sp, b); } });
        }
        for (let j = j0; j <= j1; j++) {
          if (!streetOn(u, 'v', j)) continue;
          if (!minor && j % 2) continue;
          clipLine(u, 'v', j).forEach((sg) => { const a = Math.max(sg[0], gb.x0 - 1), b = Math.min(sg[1], gb.x1 + 1); if (b > a) { ctx.moveTo(a, j * sp); ctx.lineTo(b, j * sp); } });
        }
        ctx.stroke();
      }
      if (u.canals) {
        ctx.strokeStyle = S.water; ctx.lineWidth = Math.max(cw, 1.4 * px);
        ctx.beginPath();
        for (let i = i0; i <= i1; i++) {
          if (((i % 5) + 5) % 5 !== 2) continue;
          clipLine(u, 'u', i).forEach((sg) => { ctx.moveTo(i * sp, sg[0]); ctx.lineTo(i * sp, sg[1]); });
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  function inWaterOrPark(x, y) {
    for (const l of LAKES) { if (!l.bb) l.bb = bboxOf(l.pts); if (x >= l.bb.x0 && x <= l.bb.x1 && y >= l.bb.y0 && y <= l.bb.y1 && pip(x, y, l.pts)) return true; }
    for (const p of PARKS) if (x >= p.bb.x0 && x <= p.bb.x1 && y >= p.bb.y0 && y <= p.bb.y1 && pip(x, y, p.pts)) return true;
    for (const r of RIVERS) {
      if (!r.bb) r.bb = bboxOf(r.pts);
      if (x < r.bb.x0 - 0.5 || x > r.bb.x1 + 0.5 || y < r.bb.y0 - 0.5 || y > r.bb.y1 + 0.5) continue;
      for (let k = 0; k < r.pts.length - 1; k++) if (projSeg(x, y, r.pts[k], r.pts[k + 1]).d < r.w * 0.5 + 0.18) return true;
    }
    return false;
  }
  let PADS = null;
  function drawLotusPads(ctx, vb, S) {
    if (!PADS) {
      PADS = [];
      const r = rng(77);
      LOTUS.forEach((L) => {
        const bb = bboxOf(L);
        const n = Math.round((bb.x1 - bb.x0) * (bb.y1 - bb.y0) * 90);
        for (let k = 0; k < n; k++) { const x = bb.x0 + r() * (bb.x1 - bb.x0), y = bb.y0 + r() * (bb.y1 - bb.y0); if (pip(x, y, L)) PADS.push([x, y, 0.012 + r() * 0.02, r() < 0.28]); }
      });
    }
    ctx.fillStyle = mix(S.lotus.length === 7 ? S.lotus : '#6aa75f', '#3d7d3a', 0.45);
    PADS.forEach((p) => { if (p[0] < vb.x0 || p[0] > vb.x1 || p[1] < vb.y0 || p[1] > vb.y1) return; ctx.beginPath(); ctx.arc(p[0], p[1], p[2], 0.3, TAU - 0.2); ctx.lineTo(p[0], p[1]); ctx.fill(); });
    ctx.fillStyle = S.lotusFlower;
    PADS.forEach((p) => { if (!p[3] || p[0] < vb.x0 || p[0] > vb.x1 || p[1] < vb.y0 || p[1] > vb.y1) return; ctx.beginPath(); ctx.arc(p[0] + 0.006, p[1] - 0.004, 0.007, 0, TAU); ctx.fill(); });
  }
  let FIELDS = null;
  function drawFields(ctx, vb, z) {
    if (!FIELDS) {
      FIELDS = [];
      const r = rng(55);
      FARMS.forEach((F) => {
        const bb = bboxOf(F);
        for (let x = bb.x0; x < bb.x1; x += 0.55) for (let y = bb.y0; y < bb.y1; y += 0.45) {
          if (!pip(x + 0.27, y + 0.22, F)) continue;
          const tone = ['#7c7f45', '#8a8a4e', '#6f7a3f', '#958d58', '#66733c', '#a09160'][Math.floor(r() * 6)];
          FIELDS.push([x + 0.02, y + 0.02, 0.5 - r() * 0.1, 0.4 - r() * 0.08, tone]);
        }
      });
    }
    FIELDS.forEach((f) => { if (f[0] > vb.x1 || f[0] + f[2] < vb.x0 || f[1] > vb.y1 || f[1] + f[3] < vb.y0) return; ctx.fillStyle = f[4]; ctx.fillRect(f[0], f[1], f[2], f[3]); });
    void z;
  }
  function drawTraffic(ctx, vb, z, W, px) {
    const bucket = Math.floor(JC.time.now() / 600000);
    const G = graph();
    G.edges.forEach((e) => {
      if (!(e.cls === 'hwy' || e.cls === 'ring' || (e.cls === 'art' && z > 9) || e.cls === 'prov')) return;
      const bb = e.bb || (e.bb = bboxOf(e.pts));
      if (bb.x1 < vb.x0 || bb.x0 > vb.x1 || bb.y1 < vb.y0 || bb.y0 > vb.y1) return;
      const r = hash2(e.id, bucket, 41);
      const col = r < 0.06 ? '#ff3b30' : r < 0.2 ? '#ff9f0a' : '#30c759';
      ctx.strokeStyle = col;
      ctx.lineWidth = Math.max(1.4, W[e.cls === 'link' ? 'art' : e.cls] * 0.55) * px;
      ctx.beginPath(); ctx.moveTo(e.pts[0][0], e.pts[0][1]); for (let i = 1; i < e.pts.length; i++) ctx.lineTo(e.pts[i][0], e.pts[i][1]); ctx.stroke();
    });
  }

  // ═══ Live map view ════════════════════════════════════════════════════════
  const ZMIN = 1.05, ZMAX = 420;
  function create(container, o) {
    o = Object.assign({ style: 'explore', user: true, interactive: true, pois: true, labels: true, rotate: true, traffic: false }, o || {});
    grabFont();
    const root = h('div.mv', { class: o.cls });
    const canvas = h('canvas.mv-canvas');
    const pinLayer = h('div.mv-pins');
    root.append(canvas, pinLayer);
    container.appendChild(root);
    const ctx = canvas.getContext('2d');
    const start = o.center ? (typeof o.center === 'string' ? placeOf(o.center) : { x: o.center[0], y: o.center[1] }) : { x: HOME[0], y: HOME[1] };
    const V = { cx: start.x, cy: start.y, z: o.zoom || 40, b: o.bearing || 0, w: 0, h: 0, sx: 0, sy: 0, ratio: 1 };
    const pad = Object.assign({ top: 0, bottom: 0, left: 0, right: 0 }, o.padding || {});
    const pins = new Map();
    const routesL = new Map();
    const handlers = {};
    let user = o.userPos ? o.userPos.slice() : HOME.slice();
    let heading = null;
    let hits = [];
    let raf = 0;
    let anim = null;
    let destroyed = false;
    let styleK = o.style;
    let selected = null;
    const opts = { traffic: !!o.traffic, labels: o.labels !== false, pois: o.pois };

    const userEl = h('div.mv-user', h('div.mv-user-cone'), h('div.mv-user-pulse'), h('div.mv-user-dot'));
    if (o.user) pinLayer.appendChild(userEl);
    if (o.userTap) JC.ui.onTap(userEl, (e) => { e.stopPropagation(); o.userTap(); });

    function emit(n, p) { (handlers[n] || []).forEach((f) => { try { f(p); } catch (e) { console.error(e); } }); }
    function measure() {
      const r = root.getBoundingClientRect();
      const W = root.offsetWidth, H = root.offsetHeight;
      if (!W || !H) { if (V.w) { V.sx = pad.left + (V.w - pad.left - pad.right) / 2; V.sy = pad.top + (V.h - pad.top - pad.bottom) / 2; } return false; }
      const scale = r.width / W || 1;
      const ratio = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * scale));
      if (W !== V.w || H !== V.h || ratio !== V.ratio) {
        V.w = W; V.h = H; V.ratio = ratio;
        canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      }
      V.sx = pad.left + (W - pad.left - pad.right) / 2;
      V.sy = pad.top + (H - pad.top - pad.bottom) / 2;
      return true;
    }
    function project(x, y) { const dx = (x - V.cx) * V.z, dy = (y - V.cy) * V.z, c = Math.cos(V.b), s = Math.sin(V.b); return [V.sx + dx * c + dy * s, V.sy - dx * s + dy * c]; }
    function unproject(sx, sy) { const dx = (sx - V.sx) / V.z, dy = (sy - V.sy) / V.z, c = Math.cos(V.b), s = Math.sin(V.b); return [V.cx + dx * c - dy * s, V.cy + dx * s + dy * c]; }
    function invalidate() { if (!raf && !destroyed) raf = requestAnimationFrame(frame); }
    function frame() {
      raf = 0;
      if (anim) { const done = anim(); if (!done) invalidate(); }
      if (!measure()) return;
      // reserve DOM pin areas so canvas labels avoid them
      const reserve = [];
      pins.forEach((p) => {
        if (p.hidden) return;
        const [x, y] = project(p.at[0], p.at[1]);
        p.sx = x; p.sy = y;
        if (p.reserve) reserve.push({ x: x - p.reserve[0] / 2, y: y - (p.anchor === 'center' ? p.reserve[1] / 2 : p.reserve[1]), w: p.reserve[0], h: p.reserve[1] + (p.reserve[2] || 0) });
      });
      const routes = [];
      routesL.forEach((r) => routes.push(r));
      const res = drawMap(ctx, V, { style: styleK, dark: isDark(), traffic: opts.traffic, labels: opts.labels, pois: opts.pois, selected, routes, reserve, poiFilter: o.poiFilter, hidePlaces: (o.hidePlaces || []).concat(o.user ? ['player-home'] : []), poiBoost: o.poiBoost, poiLabelMinZ: o.poiLabelMinZ });
      hits = res.hits;
      // pins
      pins.forEach((p) => {
        if (p.hidden) { p.el.style.display = 'none'; return; }
        const x = p.sx, y = p.sy;
        const off = x < -80 || x > V.w + 80 || y < -80 || y > V.h + 120;
        p.el.style.display = off ? 'none' : '';
        if (off) return;
        const rot = p.rotate != null ? ` rotate(${p.rotate - (V.b * 180) / Math.PI}deg)` : '';
        p.el.style.transform = `translate(${x}px, ${y}px)${p.anchor === 'center' ? ' translate(-50%, -50%)' : ' translate(-50%, -100%)'}${rot}`;
        p.el.style.zIndex = String(p.z || 1);
      });
      if (o.user) {
        const [x, y] = project(user[0], user[1]);
        userEl.style.transform = `translate(${x}px, ${y}px)`;
        userEl.classList.toggle('has-heading', heading != null);
        if (heading != null) userEl.querySelector('.mv-user-cone').style.transform = `translate(-50%, -100%) rotate(${heading - (V.b * 180) / Math.PI}deg)`;
      }
      emit('move', api.view());
    }
    const isDark = () => (o.dark != null ? o.dark : !!(JC.os && JC.os.dark));

    function setView(t, ao) {
      ao = ao || {};
      const target = { cx: t.cx != null ? t.cx : t.center ? t.center[0] : V.cx, cy: t.cy != null ? t.cy : t.center ? t.center[1] : V.cy, z: clamp(t.z != null ? t.z : t.zoom != null ? t.zoom : V.z, ZMIN, ZMAX), b: t.b != null ? t.b : t.bearing != null ? t.bearing : V.b };
      if (!ao.animate) { anim = null; Object.assign(V, target); invalidate(); return Promise.resolve(); }
      const from = { cx: V.cx, cy: V.cy, z: V.z, b: V.b };
      const dur = ao.duration || 700;
      const t0 = performance.now();
      const d = Math.hypot(target.cx - from.cx, target.cy - from.cy);
      const minZ = Math.min(from.z, target.z);
      const bump = clamp(Math.log((d * minZ) / (V.w || 400)) * 0.55, 0, 3.2);
      const db = normA(target.b - from.b);
      return new Promise((res) => {
        anim = () => {
          const k = clamp((performance.now() - t0) / dur, 0, 1);
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          V.cx = from.cx + (target.cx - from.cx) * e;
          V.cy = from.cy + (target.cy - from.cy) * e;
          V.z = Math.exp(Math.log(from.z) + (Math.log(target.z) - Math.log(from.z)) * e - bump * Math.sin(Math.PI * e));
          V.b = from.b + db * e;
          if (k >= 1) { anim = null; res(); return true; }
          return false;
        };
        invalidate();
      });
    }
    function fit(points, fo) {
      fo = fo || {};
      const pts = points.map((p) => (Array.isArray(p) ? p : placeOf(p) ? [placeOf(p).x, placeOf(p).y] : null)).filter(Boolean);
      if (!pts.length) return Promise.resolve();
      measure();
      const bb = bboxOf(pts);
      const m = fo.margin != null ? fo.margin : 60;
      const W = Math.max(60, V.w - pad.left - pad.right - m * 2), H = Math.max(60, V.h - pad.top - pad.bottom - m * 2);
      let z = Math.min(W / Math.max(0.05, bb.x1 - bb.x0), H / Math.max(0.05, bb.y1 - bb.y0));
      z = clamp(z, ZMIN, fo.maxZoom || 160);
      return setView({ cx: (bb.x0 + bb.x1) / 2, cy: (bb.y0 + bb.y1) / 2, z, b: fo.bearing != null ? fo.bearing : 0 }, { animate: fo.animate !== false, duration: fo.duration });
    }

    // ── gestures ──
    const ptrs = new Map();
    let gest = null;
    let lastTap = 0, lastTapPos = null;
    let lpTimer = null;
    let inertia = null;
    function local(e) {
      const r = root.getBoundingClientRect();
      const k = root.offsetWidth / (r.width || 1);
      return [(e.clientX - r.left) * k, (e.clientY - r.top) * k];
    }
    if (o.interactive) {
      root.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.mv-pin, .mv-user') && !e.target.closest('.mv-pin.passthru')) return;
        if (e.button !== 0 && e.pointerType === 'mouse' && e.button !== 2) return;
        try { root.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
        anim = null; inertia = null;
        ptrs.set(e.pointerId, local(e));
        const pts = [...ptrs.values()];
        if (pts.length === 1) {
          gest = { kind: 'pan', start: pts[0], last: pts[0], t: performance.now(), moved: 0, vx: 0, vy: 0, rotate: e.altKey || e.shiftKey || e.button === 2 };
          clearTimeout(lpTimer);
          lpTimer = setTimeout(() => { if (gest && gest.moved < 8 && ptrs.size === 1) { gest.long = true; const w = unproject(gest.start[0], gest.start[1]); JC.audio.haptic && JC.audio.haptic(10); emit('longpress', { world: w, screen: gest.start }); } }, 560);
        } else if (pts.length === 2) {
          clearTimeout(lpTimer);
          const [a, b] = pts;
          const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          gest = { kind: 'pinch', d0: Math.hypot(b[0] - a[0], b[1] - a[1]), a0: Math.atan2(b[1] - a[1], b[0] - a[0]), z0: V.z, b0: V.b, world: unproject(mid[0], mid[1]), rot: false, moved: 99 };
        }
      });
      root.addEventListener('pointermove', (e) => {
        if (!ptrs.has(e.pointerId)) return;
        const p = local(e);
        ptrs.set(e.pointerId, p);
        if (!gest) return;
        if (gest.kind === 'pan' && ptrs.size === 1) {
          const dx = p[0] - gest.last[0], dy = p[1] - gest.last[1];
          gest.moved += Math.abs(dx) + Math.abs(dy);
          if (gest.moved < 4) return;
          clearTimeout(lpTimer);
          const now = performance.now();
          const dt = Math.max(1, now - gest.t);
          if (gest.rotate && o.rotate) {
            V.b = normA(V.b + dx * 0.008);
          } else {
            const c = Math.cos(V.b), s = Math.sin(V.b);
            V.cx -= (dx * c - dy * s) / V.z;
            V.cy -= (dx * s + dy * c) / V.z;
            gest.vx = dx / dt; gest.vy = dy / dt;
          }
          gest.last = p; gest.t = now;
          emit('drag', api.view());
          invalidate();
        } else if (gest.kind === 'pinch' && ptrs.size >= 2) {
          const [a, b] = [...ptrs.values()];
          const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          V.z = clamp(gest.z0 * (d / gest.d0), ZMIN, ZMAX);
          const da = normA(ang - gest.a0);
          if (o.rotate && (gest.rot || Math.abs(da) > 0.2)) { gest.rot = true; V.b = normA(gest.b0 - da); }
          // keep the world point under the midpoint
          const c = Math.cos(V.b), s = Math.sin(V.b);
          const dx = (mid[0] - V.sx) / V.z, dy = (mid[1] - V.sy) / V.z;
          V.cx = gest.world[0] - (dx * c - dy * s);
          V.cy = gest.world[1] - (dx * s + dy * c);
          emit('drag', api.view());
          invalidate();
        }
      });
      const up = (e) => {
        if (!ptrs.has(e.pointerId)) return;
        ptrs.delete(e.pointerId);
        clearTimeout(lpTimer);
        if (!gest) return;
        if (gest.kind === 'pan' && ptrs.size === 0) {
          if (gest.long) { gest = null; return; }
          if (gest.moved < 6) {
            const p = gest.start;
            const now = performance.now();
            if (now - lastTap < 320 && lastTapPos && Math.hypot(p[0] - lastTapPos[0], p[1] - lastTapPos[1]) < 30) {
              lastTap = 0;
              zoomAt(p, e.pointerType === 'mouse' && (e.shiftKey || e.altKey) ? 0.5 : 2);
            } else {
              lastTap = now; lastTapPos = p;
              tapAt(p);
            }
          } else if (!gest.rotate && Math.hypot(gest.vx, gest.vy) > 0.15 && performance.now() - gest.t < 80) {
            let vx = gest.vx, vy = gest.vy;
            let lt = performance.now();
            inertia = true;
            anim = () => {
              if (!inertia) return true;
              const n = performance.now(); const dt = n - lt; lt = n;
              const c = Math.cos(V.b), s = Math.sin(V.b);
              V.cx -= (vx * dt * c - vy * dt * s) / V.z;
              V.cy -= (vx * dt * s + vy * dt * c) / V.z;
              const f = Math.pow(0.994, dt);
              vx *= f; vy *= f;
              if (Math.hypot(vx, vy) < 0.02) { inertia = null; emit('settle', api.view()); return true; }
              return false;
            };
            invalidate();
          } else emit('settle', api.view());
          gest = null;
        } else if (gest.kind === 'pinch' && ptrs.size < 2) {
          if (ptrs.size === 1) { const p = [...ptrs.values()][0]; gest = { kind: 'pan', start: p, last: p, t: performance.now(), moved: 99, vx: 0, vy: 0 }; }
          else { gest = null; emit('settle', api.view()); }
        }
      };
      root.addEventListener('pointerup', up);
      root.addEventListener('pointercancel', up);
      root.addEventListener('contextmenu', (e) => e.preventDefault());
      root.addEventListener('wheel', (e) => {
        e.preventDefault();
        anim = null;
        const p = local(e);
        if (e.shiftKey && o.rotate && Math.abs(e.deltaX) + Math.abs(e.deltaY) > 0) { V.b = normA(V.b + (e.deltaY || e.deltaX) * 0.004); invalidate(); return; }
        const k = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0022));
        zoomBy(p, k, false);
        clearTimeout(root._wt); root._wt = setTimeout(() => emit('settle', api.view()), 160);
      }, { passive: false });
    }
    function zoomBy(p, k, animate) {
      const w0 = unproject(p[0], p[1]);
      const nz = clamp(V.z * k, ZMIN, ZMAX);
      if (!animate) {
        V.z = nz;
        const c = Math.cos(V.b), s = Math.sin(V.b);
        const dx = (p[0] - V.sx) / V.z, dy = (p[1] - V.sy) / V.z;
        V.cx = w0[0] - (dx * c - dy * s); V.cy = w0[1] - (dx * s + dy * c);
        invalidate();
        emit('zoom', api.view());
        return;
      }
      const c = Math.cos(V.b), s = Math.sin(V.b);
      const dx = (p[0] - V.sx) / nz, dy = (p[1] - V.sy) / nz;
      setView({ cx: w0[0] - (dx * c - dy * s), cy: w0[1] - (dx * s + dy * c), z: nz }, { animate: true, duration: 320 }).then(() => emit('settle', api.view()));
    }
    function zoomAt(p, k) { zoomBy(p, k, true); }
    function tapAt(p) {
      // pins first are handled by their own listeners; canvas POIs next
      let best = null;
      hits.forEach((ht) => {
        const d = Math.hypot(ht.x - p[0], ht.y - p[1]);
        let ok = d < ht.r;
        if (!ok && ht.lb && p[0] >= ht.lb.x && p[0] <= ht.lb.x + ht.lb.w && p[1] >= ht.lb.y - 2 && p[1] <= ht.lb.y + ht.lb.h + 2) ok = true;
        if (ok && (!best || d < best.d)) best = { id: ht.id, d };
      });
      if (best) { emit('place', best.id); return; }
      emit('tap', { world: unproject(p[0], p[1]), screen: p });
    }

    const ro = new ResizeObserver(() => invalidate());
    ro.observe(root);
    const offs = [JC.bus.on('appearance', () => invalidate()), JC.bus.on('mapview:icons', () => invalidate()), JC.bus.on('store:places', () => invalidate()), JC.bus.on('layout', () => invalidate())];

    const api = {
      el: root, canvas, pinLayer,
      view: () => ({ cx: V.cx, cy: V.cy, z: V.z, b: V.b, w: V.w, h: V.h }),
      get zoom() { return V.z; },
      get bearing() { return V.b; },
      setView, fit,
      flyTo(target, z, ao) { const p = placeOf(target) || (Array.isArray(target) ? { x: target[0], y: target[1] } : null); if (!p) return Promise.resolve(); return setView({ cx: p.x, cy: p.y, z: z || Math.max(V.z, 60), b: ao && ao.bearing != null ? ao.bearing : V.b }, Object.assign({ animate: true, duration: 900 }, ao || {})); },
      zoomIn() { measure(); zoomAt([V.sx, V.sy], 2); },
      zoomOut() { measure(); zoomAt([V.sx, V.sy], 0.5); },
      resetNorth() { setView({ b: 0 }, { animate: true, duration: 380 }); },
      project, unproject,
      setPadding(p, ao) {
        const ok = measure();
        const old = [V.sx, V.sy];
        Object.assign(pad, p);
        measure();
        if (ok && !(ao && ao.recenter)) {
          // keep the map still: the world point now under the new visual centre becomes the centre
          const dx = (V.sx - old[0]) / V.z, dy = (V.sy - old[1]) / V.z, c = Math.cos(V.b), s = Math.sin(V.b);
          V.cx += dx * c - dy * s; V.cy += dx * s + dy * c;
        }
        invalidate();
      },
      get padding() { return Object.assign({}, pad); },
      setStyle(s) { styleK = s; invalidate(); },
      get style() { return styleK; },
      setTraffic(on) { opts.traffic = !!on; invalidate(); },
      setLabels(on) { opts.labels = !!on; invalidate(); },
      setPois(on) { opts.pois = on; invalidate(); },
      setSelected(id) { selected = id; invalidate(); },
      setUser(pos, hd) { if (pos) user = pos.slice(); heading = hd == null ? null : hd; invalidate(); },
      userPos: () => user.slice(),
      addPin(id, spec) {
        const old = pins.get(id);
        if (old) old.el.remove();
        const at = spec.at ? spec.at : placeOf(spec.place) ? [placeOf(spec.place).x, placeOf(spec.place).y] : HOME;
        const el = spec.el || pinEl(spec.kind || 'place', spec);
        el.classList.add('mv-pin');
        if (spec.onTap) JC.ui.onTap(el, (e) => { e.stopPropagation(); spec.onTap(e); });
        const p = { id, at: at.slice(), el, anchor: spec.anchor || (spec.kind === 'dot' || spec.kind === 'car' || spec.kind === 'rider' || spec.kind === 'avatar-c' ? 'center' : 'bottom'), z: spec.z, rotate: spec.rotate, reserve: spec.reserve || (spec.label ? [Math.max(60, spec.label.length * 7.4), 56, 20] : [46, 56]), hidden: false };
        pins.set(id, p);
        pinLayer.appendChild(el);
        invalidate();
        return el;
      },
      movePin(id, at, rot) { const p = pins.get(id); if (!p) return; p.at = at.slice(); if (rot != null) p.rotate = rot; invalidate(); },
      pinVisible(id, on) { const p = pins.get(id); if (p) { p.hidden = !on; invalidate(); } },
      removePin(id) { const p = pins.get(id); if (p) { p.el.remove(); pins.delete(id); invalidate(); } },
      clearPins(filter) { [...pins.keys()].forEach((k) => { if (!filter || filter(k)) api.removePin(k); }); },
      hasPin: (id) => pins.has(id),
      pin: (id) => (pins.get(id) || {}).el || null,
      setRoute(id, r) { if (!r) routesL.delete(id); else routesL.set(id, r); invalidate(); },
      removeRoute(id) { routesL.delete(id); invalidate(); },
      clearRoutes() { routesL.clear(); invalidate(); },
      on(n, f) { (handlers[n] = handlers[n] || []).push(f); return () => { handlers[n] = (handlers[n] || []).filter((x) => x !== f); }; },
      render: () => invalidate(),
      resize: () => invalidate(),
      destroy() { destroyed = true; ro.disconnect(); offs.forEach((f) => f()); root.remove(); },
      opts: o,
    };
    invalidate();
    return api;
  }

  /** helper to build standard pin elements */
  function pinEl(kind, s) {
    s = s || {};
    if (kind === 'place') {
      const c = CATS[s.cat] || CATS.pin;
      const el = h('div.mv-pin-place', { style: { '--c': s.color || c.color } },
        h('div.mv-balloon', JC.icon(s.glyph || c.glyph, { size: 22, weight: 2.2 })),
        s.label ? h('div.mv-pin-label', s.label) : null);
      return el;
    }
    if (kind === 'avatar') {
      const el = h('div.mv-pin-avatar', { class: { sel: !!s.selected } }, h('div.mv-av-ring', s.avatarEl || JC.ui.avatar(s.avatar, 40)), s.label ? h('div.mv-pin-label', s.label) : null);
      return el;
    }
    if (kind === 'device') return h('div.mv-pin-device', { class: { sel: !!s.selected } }, h('div.mv-dev-ring', JC.icon(s.glyph || 'iphone', { size: 20, weight: 2 })), s.label ? h('div.mv-pin-label', s.label) : null);
    if (kind === 'car') return h('div.mv-pin-car', { style: s.color ? { '--c': s.color } : null }, carSvg(s.color));
    if (kind === 'rider') return h('div.mv-pin-rider', JC.icon('scooter', { size: 18, weight: 2.2 }));
    if (kind === 'dot') return h('div.mv-pin-dot', { style: { '--c': s.color || '#1c1c1e' }, class: { square: !!s.square } }, s.label ? h('div.mv-pin-dotlabel', s.label) : null);
    if (kind === 'drop') return h('div.mv-pin-drop', h('div.mv-drop-head'), h('div.mv-drop-stick'));
    return h('div');
  }
  function carSvg(color) {
    const s = document.createElement('span');
    s.className = 'mv-car-svg';
    const c = color || '#1c1c1e';
    s.innerHTML = `<svg viewBox="0 0 24 44" width="18" height="33"><rect x="2" y="3" width="20" height="38" rx="8" fill="${c}" stroke="#fff" stroke-width="1.6"/><rect x="5" y="10" width="14" height="8" rx="2.5" fill="rgba(255,255,255,.55)"/><rect x="5.5" y="29" width="13" height="6" rx="2" fill="rgba(255,255,255,.4)"/><rect x="4" y="3.6" width="5" height="2.4" rx="1" fill="#ffe680"/><rect x="15" y="3.6" width="5" height="2.4" rx="1" fill="#ffe680"/></svg>`;
    return s;
  }

  // ═══ Detent sheet (non-modal, for map apps) ═══════════════════════════════
  function sheet(parent, o) {
    o = Object.assign({ peek: 116, half: 0.48, top: 58, initial: 'half', detents: ['peek', 'half', 'full'] }, o || {});
    const grab = h('div.mvs-grab');
    const head = h('div.mvs-head', grab);
    const body = h('div.mvs-body');
    const el = h('div.mvs', { class: o.cls }, head, body);
    parent.appendChild(el);
    let det = o.initial;
    let H = 0;
    let dragging = false;
    const ctl = { el, head, body };
    const heights = () => {
      H = parent.offsetHeight || 874;
      const r = { peek: o.peek, half: Math.round(H * o.half), full: H - o.top };
      if (o.custom) Object.assign(r, o.custom(H));
      return r;
    };
    function apply(anim) {
      const hs = heights();
      const vis = hs[det] || hs.half;
      el.style.height = (H - o.top) + 'px';
      el.style.transition = anim ? '' : 'none';
      el.style.transform = `translateY(${H - o.top - vis}px)`;
      el.classList.toggle('full', det === 'full');
      el.classList.toggle('peek', det === 'peek');
      el.dataset.detent = det;
      if (!anim) { el.offsetHeight; el.style.transition = ''; }
      if (o.onChange) o.onChange(det, vis);
    }
    ctl.set = (d, anim) => { if (!o.detents.includes(d)) return; det = d; apply(anim !== false); };
    ctl.get = () => det;
    ctl.visible = () => (heights()[det] || 0);
    ctl.heights = heights;
    ctl.setDetents = (list) => { o.detents = list; if (!list.includes(det)) ctl.set(list[list.length - 1]); };
    ctl.refresh = () => apply(false);
    JC.util.drag(el, {
      axis: 'y',
      filter: (e) => {
        if (e.target.closest('input, textarea, .mvs-nodrag')) return false;
        if (head.contains(e.target)) return true;
        return det !== 'full' || (body.scrollTop <= 0 && e.pointerType !== 'mouse');
      },
      start: (e, p) => {
        if (det === 'full' && !head.contains(e.target) && (p.dy < 0 || body.scrollTop > 0)) return false;
        dragging = true;
        el.style.transition = 'none';
        el._base = H - o.top - (heights()[det] || 0);
      },
      move: (e, p) => {
        const hs = heights();
        const minT = H - o.top - hs.full, maxT = H - o.top - Math.min(...o.detents.map((d) => hs[d]));
        let t = el._base + p.dy;
        if (t < minT) t = minT - (minT - t) * 0.25;
        if (t > maxT) t = maxT + (t - maxT) * 0.25;
        el.style.transform = `translateY(${t}px)`;
        if (o.onDrag) o.onDrag(H - o.top - t);
      },
      end: (e, p) => {
        dragging = false;
        el.style.transition = '';
        const hs = heights();
        const cur = H - o.top - (el._base + p.dy);
        let best = det, bd = Infinity;
        const proj = cur - p.vy * 180;
        o.detents.forEach((d) => { const dd = Math.abs(hs[d] - proj); if (dd < bd) { bd = dd; best = d; } });
        det = best;
        apply(true);
      },
    });
    el.addEventListener('wheel', (e) => {
      if (dragging) return;
      const i = o.detents.indexOf(det);
      if (det !== 'full' && e.deltaY > 12 && i < o.detents.length - 1) { e.preventDefault(); ctl.set(o.detents[i + 1]); }
      else if (det === 'full' && body.scrollTop <= 0 && e.deltaY < -40 && i > 0) { ctl.set(o.detents[i - 1]); }
    }, { passive: false });
    JC.ui.onTap(grab, () => { const i = o.detents.indexOf(det); ctl.set(o.detents[(i + 1) % o.detents.length]); });
    const ro = new ResizeObserver(() => { if (!dragging) apply(false); });
    ro.observe(parent);
    requestAnimationFrame(() => apply(false));
    return ctl;
  }

  // ═══ Static thumbnail ═════════════════════════════════════════════════════
  function thumb(target, o) {
    o = Object.assign({ w: 300, h: 160, zoom: 40, style: 'explore', marker: true }, o || {});
    grabFont();
    const p = Array.isArray(target) ? { x: target[0], y: target[1], cat: 'pin' } : placeOf(target);
    const img = new Image();
    img.className = 'mv-thumb' + (o.cls ? ' ' + o.cls : '');
    img.alt = p ? (p.name || 'Map') : 'Map';
    img.draggable = false;
    const render = () => {
      const c = document.createElement('canvas');
      const ratio = 2;
      c.width = o.w * ratio; c.height = o.h * ratio;
      const ctx = c.getContext('2d');
      const ce = o.center || (p ? [p.x, p.y] : HOME);
      const V = { cx: ce[0], cy: ce[1], z: o.zoom, b: 0, w: o.w, h: o.h, sx: o.w / 2, sy: o.h / 2, ratio };
      if (o.fit && o.fit.length) {
        const bb = bboxOf(o.fit);
        V.cx = (bb.x0 + bb.x1) / 2; V.cy = (bb.y0 + bb.y1) / 2;
        V.z = clamp(Math.min((o.w - 50) / Math.max(0.05, bb.x1 - bb.x0), (o.h - 50) / Math.max(0.05, bb.y1 - bb.y0)), ZMIN, o.maxZoom || 120);
      }
      const dark = o.dark != null ? o.dark : !!(JC.os && JC.os.dark);
      drawMap(ctx, V, { style: o.style, dark, routes: o.routes || [], pois: o.pois !== false, labels: o.labels !== false, selected: p && p.id, places: o.places });
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      (o.dots || []).forEach((d) => {
        const dx = (d.at[0] - V.cx) * V.z + V.sx, dy = (d.at[1] - V.cy) * V.z + V.sy;
        ctx.beginPath(); ctx.arc(dx, dy, d.r || 6, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.beginPath(); ctx.arc(dx, dy, (d.r || 6) - 2, 0, TAU); ctx.fillStyle = d.color || '#0a84ff'; ctx.fill();
      });
      if (o.marker && p && !o.fit) {
        const c2 = (CATS[p.cat] || CATS.pin).color;
        const x = o.w / 2, y = o.h / 2;
        ctx.beginPath(); ctx.arc(x, y - 16, 15, 0, TAU); ctx.fillStyle = c2; ctx.fill();
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#fff'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 5, y - 4); ctx.lineTo(x, y + 3); ctx.lineTo(x + 5, y - 4); ctx.fillStyle = c2; ctx.fill();
        const ic = poiIcon(p.cat);
        if (ic.ready) ctx.drawImage(ic, x - 13, y - 29, 26, 26);
      }
      img.src = c.toDataURL('image/png');
    };
    try { render(); } catch (e) { console.error('thumb', e); }
    if (!ICON_IMG.pin || !ICON_IMG.pin.ready) JC.bus.once('mapview:icons', () => { try { render(); } catch (e) { /* ignore */ } });
    return img;
  }

  // ═══ Look Around (procedural street-level panorama) ═══════════════════════
  function lookSvg(p) {
    const kind = (p && p.look) || 'street';
    const r = rng(Math.round((p ? p.x * 97 + p.y * 13 : 7)));
    const W = 2400, H = 600;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>` +
      '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc3f0"/><stop offset=".6" stop-color="#cfe5f7"/><stop offset="1" stop-color="#eef5fb"/></linearGradient>' +
      '<linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e8f93"/><stop offset="1" stop-color="#5d5e63"/></linearGradient>' +
      '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b7862b"/><stop offset=".5" stop-color="#f4d27a"/><stop offset="1" stop-color="#a87822"/></linearGradient>' +
      '<linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb4d9"/><stop offset="1" stop-color="#3f7fae"/></linearGradient>' +
      '<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".85"/></linearGradient></defs>';
    s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
    for (let i = 0; i < 7; i++) { const cx = r() * W, cy = 40 + r() * 120; s += `<ellipse cx="${cx}" cy="${cy}" rx="${70 + r() * 90}" ry="${14 + r() * 12}" fill="#fff" opacity=".7"/>`; }
    const horizon = 360;
    const hills = (col, base, amp, op) => { let d = `M0 ${base}`; for (let x = 0; x <= W; x += 80) d += ` L${x} ${base - amp * (0.5 + 0.5 * Math.sin(x / 210 + r() * 0.6)) - r() * amp * 0.4}`; d += ` L${W} ${H} L0 ${H}Z`; return `<path d="${d}" fill="${col}" opacity="${op || 1}"/>`; };
    if (kind === 'mountain' || kind === 'gusu') { s += hills('#9fb3a6', 300, 150, 0.8) + hills('#7f9a86', 330, 110) + `<rect y="200" width="${W}" height="200" fill="url(#mist)"/>`; }
    else s += hills('#b8c6c9', horizon - 10, 40, 0.7);
    if (kind === 'lake') {
      s += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#lake)"/>`;
      for (let i = 0; i < 60; i++) { const x = r() * W, y = horizon + 20 + r() * 200; s += `<ellipse cx="${x}" cy="${y}" rx="${10 + r() * 16}" ry="${3 + r() * 4}" fill="#4f8d4a"/>`; if (r() < 0.35) s += `<circle cx="${x + 4}" cy="${y - 6}" r="4" fill="#f39abd"/>`; }
      s += `<path d="M300 ${horizon - 80} l120 -40 l120 40 z" fill="#5a3d2b"/><rect x="330" y="${horizon - 80}" width="180" height="70" fill="#7b5236"/><rect x="0" y="${horizon + 70}" width="900" height="16" fill="#8a6a4a"/>`;
      s += `<rect x="1500" y="${horizon - 120}" width="420" height="110" fill="#e9e1d2"/><path d="M1470 ${horizon - 120} l240 -60 l240 60 z" fill="#4b3a5c"/><text x="1710" y="${horizon - 52}" font-size="34" text-anchor="middle" fill="#6b4ea0" font-family="serif">✿</text>`;
    } else if (kind === 'farm') {
      s += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="#8aa45a"/>`;
      for (let i = 0; i < 14; i++) s += `<rect x="${i * 180}" y="${horizon + 10}" width="170" height="${H}" fill="${i % 2 ? '#7c9a4e' : '#94ae63'}"/>`;
      for (let i = 0; i < 80; i++) { const x = r() * W, y = horizon + 40 + r() * 200; s += `<path d="M${x} ${y} q8 -26 0 -40 q-8 14 0 40" fill="#4f8a3a"/><ellipse cx="${x}" cy="${y + 4}" rx="7" ry="4" fill="#f2efe7"/>`; }
      s += `<rect x="900" y="${horizon - 90}" width="260" height="90" fill="#c9b18a"/><path d="M880 ${horizon - 90} l150 -50 l150 50z" fill="#7a5a3a"/><text x="1030" y="${horizon - 36}" font-size="28" text-anchor="middle" fill="#fff" font-family="Arial" font-weight="700">RADISHES</text>`;
    } else {
      // street scene with buildings
      const tall = kind === 'koi' || kind === 'hotel' ? 1.6 : kind === 'street' || kind === 'market' ? 1.0 : 0.8;
      for (let x = -40; x < W; x += 120 + r() * 80) {
        const bw = 110 + r() * 90, bh = (90 + r() * 170) * tall;
        const col = ['#d9d4cb', '#c7cdd3', '#e6ddd0', '#b9c1c8', '#d2c6b6'][Math.floor(r() * 5)];
        s += `<rect x="${x}" y="${horizon - bh}" width="${bw}" height="${bh}" fill="${col}"/>`;
        for (let wy = horizon - bh + 16; wy < horizon - 20; wy += 26) for (let wx = x + 12; wx < x + bw - 16; wx += 24) s += `<rect x="${wx}" y="${wy}" width="12" height="14" fill="#9fb4c8" opacity=".75"/>`;
      }
      if (kind === 'koi') { s += `<rect x="1060" y="20" width="200" height="${horizon - 20}" fill="url(#gold)"/><path d="M1060 20 l100 -40 l100 40z" fill="#e7c25e"/>`; for (let wy = 50; wy < horizon - 10; wy += 22) s += `<rect x="1076" y="${wy}" width="168" height="8" fill="#fff3c4" opacity=".55"/>`; s += `<ellipse cx="1160" cy="${horizon + 70}" rx="260" ry="34" fill="#4f93c4"/><path d="M1080 ${horizon + 66} q14 -8 28 0 q-14 8 -28 0" fill="#ff8c3a"/><path d="M1200 ${horizon + 74} q14 -8 28 0 q-14 8 -28 0" fill="#fff" /><path d="M1240 ${horizon + 62} q12 -7 24 0 q-12 7 -24 0" fill="#ff6a2a"/>`; }
      if (kind === 'hotel') s += `<rect x="1000" y="120" width="380" height="${horizon - 120}" fill="#efe5d2"/><rect x="1060" y="${horizon - 90}" width="260" height="90" fill="#6b4b2b"/><text x="1190" y="170" font-size="40" text-anchor="middle" fill="#b0822e" font-family="serif" font-weight="700">GOLDEN PEONY</text>`;
      if (kind === 'station') s += `<rect x="700" y="${horizon - 160}" width="1000" height="160" fill="#dfe3e7"/><path d="M680 ${horizon - 160} q520 -120 1040 0z" fill="#9aa7b4"/><text x="1200" y="${horizon - 110}" font-size="36" text-anchor="middle" fill="#2c3e50" font-family="Arial" font-weight="700">STATION</text>`;
      if (kind === 'market') for (let i = 0; i < 18; i++) s += `<rect x="${i * 130 + 10}" y="${horizon - 50}" width="110" height="50" fill="${['#e2483d', '#f0a202', '#14a89a'][i % 3]}"/><circle cx="${i * 130 + 65}" cy="${horizon - 66}" r="12" fill="#ffcf5a"/>`;
      if (kind === 'temple' || kind === 'fortress') s += `<path d="M900 ${horizon - 60} l300 -110 l300 110z" fill="${kind === 'temple' ? '#8d3b2f' : '#3e3e44'}"/><rect x="960" y="${horizon - 60}" width="480" height="60" fill="${kind === 'temple' ? '#d9b382' : '#6d6d74'}"/>`;
      s += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="url(#road)"/>`;
      for (let x = 0; x < W; x += 160) s += `<rect x="${x}" y="${horizon + 110}" width="80" height="8" fill="#f5f5f5" opacity=".85"/>`;
      s += `<rect y="${horizon}" width="${W}" height="26" fill="#c9c5bd"/>`;
      for (let x = 60; x < W; x += 300) s += `<rect x="${x}" y="${horizon - 120}" width="6" height="122" fill="#55565b"/><circle cx="${x + 3}" cy="${horizon - 124}" r="9" fill="#f4f1e6"/>`;
      for (let x = 160; x < W; x += 260) s += `<circle cx="${x}" cy="${horizon - 40}" r="${34 + r() * 14}" fill="#5f9a4e"/><rect x="${x - 4}" y="${horizon - 14}" width="8" height="18" fill="#6b4a2f"/>`;
    }
    if (kind === 'mountain' || kind === 'gusu') {
      s += `<rect y="${horizon}" width="${W}" height="${H - horizon}" fill="#8c8a84"/><path d="M800 ${horizon - 20} l250 -80 l250 80z" fill="#3e4a55"/><rect x="860" y="${horizon - 20}" width="380" height="80" fill="#f1efe9"/><rect x="1020" y="${horizon + 10}" width="60" height="50" fill="#3e4a55"/>`;
      for (let i = 0; i < 12; i++) s += `<rect x="${200 + i * 30}" y="${horizon + 20 + i * 12}" width="600" height="10" fill="#a8a59d"/>`;
      s += `<rect y="${horizon - 140}" width="${W}" height="220" fill="url(#mist)" opacity=".6"/>`;
    }
    s += '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }
  function lookAround(place, o) {
    o = o || {};
    const p = placeOf(place) || { name: 'Look Around', x: HOME[0], y: HOME[1], look: 'street' };
    const url = lookSvg(p);
    const layer = JC.ui.layer();
    let px = -600;
    const pano = h('div.mv-look-pano', { style: { backgroundImage: `url("${url}")`, backgroundPosition: px + 'px 50%' } });
    const d = new Date(2026, 4, 12 + Math.floor(hash2(Math.round(p.x), Math.round(p.y), 3) * 20));
    const close = () => { JC.util.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).then(() => wrap.remove()); };
    const wrap = h('div.mv-look',
      pano,
      h('div.mv-look-top',
        h('button.mv-look-btn', { onTap: close, attrs: { 'aria-label': 'Close' } }, JC.icon('xmark', { size: 17, weight: 2.6 })),
        h('div.mv-look-title', h('b', p.short || p.name), h('span', (p.addr || cityOf(p.x, p.y)))),
        h('button.mv-look-btn', { onTap: () => JC.ui.share({ title: (p.short || p.name) + ' — Look Around', subtitle: 'Maps', icon: 'binoculars.fill', payload: { kind: 'location', place: p.id, text: 'Look Around: ' + p.name } }), attrs: { 'aria-label': 'Share' } }, JC.icon('square.and.arrow.up', { size: 17, weight: 2.2 }))),
      h('div.mv-look-hint', JC.icon('hand.raised', { size: 15 }), h('span', 'Drag to look around')),
      h('div.mv-look-foot', h('span', 'Imagery captured ' + JC.util.MONTHS[d.getMonth()] + ' ' + d.getFullYear()), h('span.mv-look-dot', '·'), h('span.tap', { onTap: () => JC.ui.alert({ title: 'Report an Issue', message: 'Thanks. Faces and licence plates in Look Around are blurred automatically. (The koi in the pond are not blurred. They did not consent, but nobody asked them.)', buttons: [{ text: 'OK' }] }) }, 'Report an Issue')));
    JC.util.drag(pano, {
      move: (e, q) => { pano.style.backgroundPosition = (px + q.dx) + 'px 50%'; },
      end: (e, q) => { px += q.dx; },
    });
    layer.appendChild(wrap);
    JC.util.anim(wrap, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320 });
    return { close };
  }

  const CALL_LINES = {
    'golden-peony': ['Golden Peony Hotel, good evening. This is the front desk.', '…Mr. Jiang? Is that you? Your room has been made up — and the white peony tea you asked for is in the room.', 'Shall I send someone up with anything else? …Hello?'],
    'koi-tower': ['Koi Tower security, night desk.', 'The gala has ended, sir. Guests have left the Grand Hall.', 'If this is about the forecourt — we are aware. We are… very aware. Good night.'],
    'laoma-hotpot': ['LAOMA HOTPOT!! WHAT? SPEAK UP!', 'TABLE FOR HOW MANY? …HELLO? WE’RE OPEN TILL TWO!', '(the line fills with the sound of a hundred people eating)'],
    'cloud-recesses': ['You have reached Gusu Lan Academy.', 'Quiet hours are in effect from 21:00 to 05:00. Please call again during office hours.', 'Rule 4 of the Wall of Discipline: no loud voices. Thank you for your understanding.'],
    'unclean-realm': ['Nie Corp. Our offices are closed.', 'For enquiries about Huaisang Fans, please visit our website. The Chairman does not know anything about anything.', '(beep)'],
    'lanling-intl': ['Thank you for calling Lanling International School. The office is closed.', 'If you are calling about the chemistry laboratory incident, the matter has been resolved. Eyebrows grow back.'],
    'pet-kingdom': ['Thank you for calling Pet Kingdom! Our store is now closed. Our hours are 9 AM to 10 PM.', 'For giant-breed food deliveries, please use the Lotus Eats app. Woof!'],
    'guanyin-temple': ['The temple is closed for the night. Morning prayers begin at six.', '(a recorded bell rings, very softly)'],
    'jinxing-police': ['Jinxing Road Police Station, Officer Liang speaking.', 'Lost property? If you’ve found something — a phone, a wallet — you can bring it to the front desk any time, day or night. We’ll contact the owner for you.', 'Do you want to give me your name and what you found? …Hello?'],
    'lanling-vet': ['Lanling Pet Hospital, emergency line. Is your pet injured?', 'If it’s the big black dog again — Dr. Fang says she’s fine and to stop feeding her socks.'],
    'auntie-lu': ['Auntie Lu’s! We’re closed now, come tomorrow, the soup starts at six in the morning.', 'You want lotus root and pork rib? Large? Same as last time, to the mountain? Hah. I remember you.'],
    'grandma-qin': ['Grandma Qin’s Kitchen, we’re closed! Eat your vegetables!'],
    'night-owl': ['Night Owl Congee, still open! What can I get you?', 'Salted duck egg congee? Youtiao? We deliver through Lotus Eats too.'],
    'night-owl-ll': ['Night Owl Jinxing! Open all night. Order through Lotus Eats, it’s faster!'],
    'golden-dumpling': ['Golden Dumpling, we close at two. Pickup or Lotus Eats only after midnight.'],
    'lanling-mall': ['Lanling Mall is now closed. Our opening hours are 10 AM to 10 PM. Goodbye.'],
    'lanling-motors': ['Lanling Motors. Our showroom is closed. If you are calling about a refund, refunds are processed within 24 hours. We have learned this.'],
    'silver-lotus': ['Silver Lotus Jewelers. We are closed. If you are collecting the silver bell — it is ready, polished, in its velvet box.'],
    'yiling-ems': ['Yiling Emergency Medical Station. Is this an emergency?', '…If not, please hang up and call back in the morning. Thank you. — sorry. Thank you.'],
    'cr-tea-shop': ['Cloud Recesses Tea Shop. We are closed for quiet hours.', 'Orders of white peony can be placed online and delivered to residences on campus.'],
    'koi-residences': ['Koi Tower Residences, concierge. Good evening.', 'Young Master Jin is not in his apartment at present, sir. Nor is the dog. Good night.'],
    'peony-bakery': ['Peony Bakery is closed. For celebration cakes please order 48 hours in advance. Lotus seed paste is our speciality!'],
  };

  /** Call a place: story contacts ring through the story engine; businesses answer in-world. */
  function callPlace(x) {
    const p = placeOf(x);
    if (!p) return;
    if (p.contact) {
      JC.ui.actionSheet({ title: p.short || p.name, actions: [{ text: 'Call ' + (p.phone || JC.contacts.name(p.contact)), onTap: () => JC.story.dial(p.contact) }] });
      return;
    }
    if (!p.phone) { JC.ui.toast('No phone number for ' + (p.short || p.name)); return; }
    // businesses with a scripted line (Phone app registry) ring through the real call screen
    if (JC.callui && JC.callui.bizFor && JC.callui.bizFor(p.phone)) {
      JC.ui.actionSheet({ title: p.short || p.name, actions: [{ text: 'Call ' + p.phone, onTap: () => JC.callui.dialNumber(p.phone) }] });
      return;
    }
    JC.ui.actionSheet({ title: p.short || p.name, actions: [{ text: 'Call ' + p.phone, onTap: () => {
      const hi = hoursInfo(p);
      const lines = CALL_LINES[p.id] || (hi && !hi.open ? ['Thank you for calling ' + (p.short || p.name) + '. We are closed right now. ' + hi.text.replace('Closed · ', '') + '.', '(beep)'] : ['Good evening, ' + (p.short || p.name) + '.', '…Hello? I can’t hear you. Hello?']);
      fakeCall({ name: p.short || p.name, num: p.phone, glyph: (CATS[p.cat] || CATS.pin).glyph, lines });
    } }] });
  }

  // ═══ In-world phone call (businesses, drivers, riders — not story contacts) ══
  /** fakeCall({ name, sub, num, avatar, lines: [string | {t, who}], onEnd }) */
  function fakeCall(o) {
    o = o || {};
    const layer = JC.ui.layer();
    const lines = (o.lines || []).map((l) => (typeof l === 'string' ? { t: l } : l));
    let sec = 0, timer = null, ended = false;
    const status = h('div.mv-call-status', 'calling…');
    const caps = h('div.mv-call-caps');
    const av = o.avatar instanceof Node ? o.avatar : o.avatar ? JC.ui.avatar(o.avatar, 92) : h('div.mv-call-av', JC.icon(o.glyph || 'phone.fill', { size: 40 }));
    const mute = h('div.mv-call-btn', { onTap: () => mute.classList.toggle('on') }, h('div.mv-call-c', JC.icon('mic.slash.fill', { size: 26 })), h('span', 'mute'));
    const spk = h('div.mv-call-btn', { onTap: () => spk.classList.toggle('on') }, h('div.mv-call-c', JC.icon('speaker.wave.2.fill', { size: 26 })), h('span', 'speaker'));
    const keys = h('div.mv-call-btn', { onTap: () => JC.ui.toast('Press 1 for… no. There is no menu.', { icon: 'number' }) }, h('div.mv-call-c', JC.icon('number', { size: 26 })), h('span', 'keypad'));
    const end = h('div.mv-call-end', { onTap: () => finish(true) }, JC.icon('phone.down.fill', { size: 32 }));
    const wrap = h('div.mv-call', h('div.mv-call-top', av, h('div.mv-call-name', o.name || 'Unknown'), o.num ? h('div.mv-call-num', o.num) : null, status), caps, h('div.mv-call-grid', spk, keys, mute), end);
    layer.appendChild(wrap);
    JC.util.anim(wrap, [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320 });
    try { JC.audio.ringback && JC.audio.ringback(true); } catch (e) { /* ignore */ }
    let i = 0;
    const ring = setTimeout(() => {
      try { JC.audio.ringback && JC.audio.ringback(false); } catch (e) { /* ignore */ }
      if (ended) return;
      timer = setInterval(() => { sec++; status.textContent = JC.util.fmtDur(sec); }, 1000);
      status.textContent = '0:00';
      const next = () => {
        if (ended) return;
        if (i >= lines.length) { setTimeout(() => finish(false), 1600); return; }
        const l = lines[i++];
        const b = h('div.mv-call-cap', { class: { me: l.who === 'me' } }, l.t);
        caps.appendChild(b);
        caps.scrollTop = caps.scrollHeight;
        setTimeout(next, Math.max(1500, l.t.length * 48));
      };
      next();
    }, o.ring || 2200);
    function finish(user) {
      if (ended) return;
      ended = true;
      clearTimeout(ring); clearInterval(timer);
      try { JC.audio.ringback && JC.audio.ringback(false); } catch (e) { /* ignore */ }
      status.textContent = 'Call Ended';
      wrap.classList.add('ended');
      setTimeout(() => JC.util.anim(wrap, [{ opacity: 1 }, { opacity: 0 }], { duration: 260 }).then(() => wrap.remove()), user ? 350 : 900);
      if (o.onEnd) o.onEnd({ user, sec });
    }
    return { end: () => finish(true) };
  }

  // ═══ export ═══════════════════════════════════════════════════════════════
  const mv = {
    fakeCall, callPlace,
    HOME, WORLD, CATS,
    create, sheet, thumb, pinEl, lookAround, lookUrl: (p) => lookSvg(placeOf(p)),
    places: () => JC.store.all('places'),
    place: (id) => placeOf(id),
    userPos: () => HOME.slice(),
    route, routes, transit, search, address, cityOf, hoursInfo, nearestRoadName,
    dist, fmtDist, fmtMin, fmtClockMin,
    graph, metro: METRO, railStations: RAIL_ST,
    cat: (c) => CATS[c] || CATS.pin,
    /** distance from the player's location */
    fromUser(p) { const q = placeOf(p); return q ? Math.hypot(q.x - HOME[0], q.y - HOME[1]) : 0; },
    /** a moving point along a route polyline */
    along(pts, s) { const cum = pts._cum || (pts._cum = cumul(pts)); return along(pts, cum, s); },
    length: plen,
    /** Swift-style fare estimate (¥) */
    fare(r, tier, t) {
      const hr = new Date(t || JC.time.now()).getHours();
      const night = hr >= 22 || hr < 7;
      const mult = { go: 1, comfort: 1.38, xl: 1.72, pet: 1.55, black: 2.45 }[tier || 'go'] || 1;
      const base = (10 + 1.95 * r.km + 0.5 * r.min) * (night ? 1.15 : 1) * mult;
      return Math.round(base);
    },
  };
  mv.userPlace = userPlace;
  JC.mapview = mv;
  JC.bus.on('boot', () => { try { preloadIcons(); } catch (e) { /* ignore */ } });
  // debug handle
  mv._debug = { ROADS, URBAN, PLACES, drawMap };
})();
