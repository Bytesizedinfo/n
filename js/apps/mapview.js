/* JC.mapview — the shared map of Liyue (Liyue Harbor · Guyun Stone Forest · Jueyun Karst · Qingce · Wangshu · the Chasm).
   Geography + places seed, a road graph with turn-by-turn routing, a canvas renderer with
   pan / zoom / pinch / rotate, DOM pins, the pulsing user dot, a detent sheet, and static thumbnails.
   Used by Maps, Find My, Harbor Ride and Wanmin Go. World units are kilometres (x → east, y → south). */
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

  // ═══ Geography (Liyue: the harbor on the east coast, Guyun out at sea, Jueyun Karst to the west) ═══
  const WORLD = { w: 320, h: 240 };
  const METRO_CITY = 'Liyue Harbor';
  const SEA = chaikin([[262, -4], [324, -4], [324, 244], [222, 244], [228, 225], [238, 205], [247, 186], [251, 168], [245.5, 157], [242.5, 151], [244.2, 146], [243.6, 140], [242.4, 133], [241.6, 127], [243.8, 119], [247, 110], [251.4, 100], [258.6, 92], [256.2, 82], [251.6, 74], [255, 60], [262, 40], [258, 20]], 3, true);

  const LAKES = [
    { id: 'dihua', name: 'Dihua Marsh', lz: 3, label: [125.6, 147.6], size: 12, pts: chaikin(blob(125.6, 147.6, 5.4, 2.8, 12, 7, 0.22, 0.2), 2, true) },
    { id: 'luhua', name: 'Luhua Pool', lz: 4, label: [86.4, 73.6], size: 11, pts: chaikin(blob(86.4, 73.6, 2.4, 1.6, 12, 9, 0.2, -0.3), 2, true) },
    { id: 'guili', name: 'Guili Pond', lz: 8, label: [166.4, 160.4], size: 10, pts: chaikin(blob(166.4, 160.4, 1.6, 0.9, 10, 5, 0.15), 2, true) },
    { id: 'qingce-pond', name: 'Qingce Pond', lz: 14, label: [129.6, 66.6], size: 10, pts: chaikin(blob(129.6, 66.6, 0.6, 0.35, 9, 3, 0.1), 2, true) },
  ];
  const RIVERS = [
    { name: 'Bishui River', w: 0.5, lz: 3, pts: chaikin([[58, 104], [74, 108], [92, 112], [108, 120], [118, 134], [126, 146], [140, 152], [156, 158], [172, 164], [188, 170], [204, 174], [220, 174], [234, 170], [246, 166]], 3, false) },
    { name: 'Qingce Stream', w: 0.16, lz: 6, pts: chaikin([[129.6, 66.6], [128, 76], [124, 90], [120, 104], [116, 118], [118, 134]], 2, false) },
    { name: 'Tianheng Creek', w: 0.12, lz: 8, pts: chaikin([[192, 128], [198, 134], [206, 146], [214, 158], [222, 168], [228, 172]], 2, false) },
  ];
  const MOUNTAINS = [
    { name: 'Jueyun Karst', lz: 1.1, mist: true, peak: [72, 88], peakName: 'Mt. Aocang', ele: '1,840 m',
      pts: [[30, 92], [34, 74], [46, 60], [64, 54], [84, 58], [100, 70], [106, 88], [102, 104], [90, 116], [70, 120], [50, 116], [36, 106]] },
    { name: 'Mt. Tianheng', lz: 2, peak: [192, 128], peakName: 'Mt. Tianheng', ele: '1,020 m', pts: [[180, 128], [184, 116], [194, 110], [203, 114], [206, 126], [201, 140], [190, 146], [182, 140]] },
    { name: 'Mt. Hulao', lz: 2.4, peak: [178, 44], peakName: 'Mt. Hulao', ele: '860 m', pts: [[160, 44], [168, 32], [182, 28], [196, 36], [196, 50], [184, 58], [168, 56]] },
    { name: 'The Chasm', lz: 2.6, dark: true, peak: [112, 205], peakName: 'The Chasm', ele: '−900 m', pts: [[92, 206], [98, 192], [112, 186], [128, 192], [132, 206], [122, 220], [104, 222]] },
    { name: 'Lingju Hills', lz: 3, peak: [158, 196], peakName: 'Lingju Pass', ele: '540 m', pts: [[146, 198], [150, 188], [160, 184], [170, 190], [168, 202], [156, 206]] },
    { name: 'Guyun Stone Forest', lz: 2, peak: [282, 160], peakName: 'Guyun Stone Forest', ele: '312 m', pts: [[276, 156], [279, 151.6], [284, 151], [288, 154.6], [288.6, 160], [285, 165], [279.6, 165.4], [276.4, 161.6]] },
    { name: 'Guyun Stone Forest', lz: 6, peak: [292.4, 168.4], pts: blob(292.4, 168.4, 1.8, 1.4, 8, 31, 0.2) },
    { name: 'Guyun Stone Forest', lz: 6, peak: [272.6, 170.6], pts: blob(272.6, 170.6, 1.6, 1.2, 8, 32, 0.2) },
    { name: 'Guyun Stone Forest', lz: 6, peak: [289.4, 146.6], pts: blob(289.4, 146.6, 1.2, 1.0, 8, 33, 0.2) },
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
    { id: 'liyue', name: 'Liyue Harbor', rank: 1, sp: 0.36, ang: 0.12, label: [222.6, 131.4], seed: 11,
      pts: [[204, 120], [206, 112], [212, 106.6], [221, 104.6], [230, 105.6], [238, 108.6], [243, 114], [241.4, 122], [240.6, 130], [241.6, 138], [242.8, 146], [240.6, 152.6], [234, 156.4], [225, 157], [215, 154.4], [208, 148], [205.4, 140], [206.4, 130]] },
    { id: 'qingce', name: 'Qingce Village', rank: 3, sp: 0.3, ang: 0.2, label: [131.2, 61.4], seed: 12, pts: blob(131.2, 61.4, 2.2, 1.6, 12, 12, 0.2) },
    { id: 'wangshu', name: 'Wangshu', rank: 4, sp: 0.3, ang: -0.1, label: [121.6, 140.6], seed: 13, pts: blob(121.6, 140.6, 1.3, 1.0, 10, 13, 0.15) },
    { id: 'stonegate', name: 'Stone Gate', rank: 4, sp: 0.3, ang: 0.0, label: [151.4, 20.6], seed: 14, pts: blob(151.4, 20.6, 1.8, 1.2, 10, 14, 0.2) },
    { id: 'mingyun', name: 'Mingyun Village', rank: 4, sp: 0.3, ang: 0.1, label: [176.4, 214.6], seed: 15, pts: blob(176.4, 214.6, 1.9, 1.3, 10, 15, 0.2) },
    { id: 'airport', name: 'Airport Spit', rank: 4, sp: 0.4, ang: 0.6, label: [252.2, 85.4], seed: 16, pts: blob(252.2, 85.4, 2.6, 1.8, 10, 16, 0.12, 0.6) },
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
    { name: 'Yujing Terrace', lz: 8, pts: [[210.2, 136.2], [213.4, 135.4], [215.6, 137.2], [215, 140.2], [211.6, 141], [209.6, 139]] },
    { name: 'Harbor Promenade', lz: 9, pts: [[239.4, 124], [240.8, 124.6], [240.4, 132], [241.2, 140], [240.2, 140.4], [239.2, 132], [239, 126]] },
    { name: 'Feiyun Slope Gardens', lz: 10, pts: blob(219.6, 121.8, 1.4, 0.8, 10, 21, 0.15) },
    { name: 'Guili Plains', lz: 4, pts: blob(168, 160, 9, 5, 12, 22, 0.25) },
    { name: 'Wangshu Inn Grounds', lz: 12, pts: blob(122.2, 141.4, 0.6, 0.4, 10, 23, 0.12) },
    { name: 'Chihu Rock Park', lz: 12, pts: blob(238.6, 152, 0.9, 0.6, 10, 24, 0.12) },
  ].map((p) => Object.assign(p, { pts: chaikin(p.pts, 2, true) })).map((p) => Object.assign(p, { bb: bboxOf(p.pts), c: centroid(p.pts) }));

  const FORESTS = [
    [[34, 92], [40, 72], [56, 60], [78, 60], [96, 74], [100, 94], [88, 112], [64, 116], [44, 108]],
    [[160, 46], [168, 34], [184, 30], [194, 40], [190, 54], [172, 56]],
    [[182, 128], [186, 116], [198, 112], [204, 124], [198, 140], [186, 142]],
    [[96, 204], [104, 192], [120, 190], [128, 204], [118, 216], [102, 216]],
    [[146, 198], [154, 188], [166, 190], [166, 202], [154, 204]],
  ].map((p) => chaikin(p, 3, true));
  const FARMS = [
    [[118, 54], [128, 50], [142, 54], [146, 66], [138, 74], [122, 72], [114, 64]],
    [[140, 100], [158, 96], [172, 104], [170, 118], [152, 120], [140, 112]],
    [[150, 160], [170, 152], [190, 158], [186, 176], [164, 182], [148, 174]],
    [[160, 204], [176, 202], [188, 212], [178, 224], [162, 222]],
    [[208, 166], [222, 162], [232, 176], [222, 188], [208, 182]],
  ].map((p) => chaikin(p, 3, true));
  // glaze lily terraces at Qingce (drawn with the old "lotus" field style)
  const LOTUS = [
    [[124.6, 57.6], [128.4, 56.8], [131.2, 57.8], [130.6, 59.4], [127, 59.8], [124.8, 59.2]],
    [[133.4, 63.6], [136.4, 62.8], [138, 64.6], [136.6, 66.2], [133.6, 65.8]],
    [[125.6, 63.4], [127.6, 62.8], [128.4, 64.6], [126.4, 65.4]],
  ].map((p) => chaikin(p, 2, true));

  // ── roads (cls: hwy | ring | prov | art | mtn) ───────────────────────────
  const R = (name, cls, pts, o) => Object.assign({ name, cls, pts }, o || {});
  const ROADS_RAW = [
    // Liyue Harbor
    R('Harbor Ring Road', 'ring', [[208.4, 122], [212.6, 111.4], [221.4, 108.6], [231, 109.4], [238.4, 113], [239.4, 122], [238.6, 130], [239.2, 140], [238.6, 148.6], [233, 153.4], [224, 154.2], [214.6, 151], [209.4, 144.4], [207.8, 134]], { closed: true, ref: 'H1', smooth: 2 }),
    R('Harbor Road', 'art', [[231, 109.4], [236.6, 116], [238.2, 124], [238.6, 132], [239.2, 140], [238.6, 148.6]], { smooth: 2 }),
    R('Feiyun Slope', 'art', [[212.6, 117.6], [218.4, 120.4], [224.6, 123.2], [231.4, 125.6], [238.2, 126.2]], { smooth: 2 }),
    R('Lantern Street', 'art', [[208.4, 129.4], [216, 130.4], [224, 131.6], [231.6, 132.4], [238.6, 132.6]]),
    R('Yujing Terrace Road', 'mtn', [[224, 131.6], [219.4, 134], [215.4, 136.6], [212.4, 138.4], [209.4, 144.4]], { smooth: 2 }),
    R('Chihu Rock Lane', 'art', [[226.6, 142.4], [231, 145], [235.4, 148.4], [238.6, 151]], { smooth: 2 }),
    R('Jade Avenue', 'art', [[214.2, 108.8], [215.4, 120], [216.6, 132], [218, 144], [219.8, 153.6]]),
    R('Lane of Stone Lions', 'art', [[222.6, 110.4], [224.6, 123.2], [226.6, 142.4], [227.6, 154.4]]),
    R('Wanmin Street', 'art', [[231.6, 132.4], [233.6, 140], [235.4, 148.4]]),
    R('Crux Pier Road', 'art', [[238.6, 140.4], [242.2, 141]]),
    R('Pier 7 Boardwalk', 'art', [[238.6, 133.6], [241.4, 134.2]]),
    // regional
    R('Airport Expressway', 'hwy', [[231, 109.4], [238, 102], [244.6, 95], [250.4, 88.4], [252.2, 85.4]], { ref: 'E1', smooth: 2 }),
    R('Guili Highway', 'prov', [[207.8, 134], [196, 150], [182, 156], [166, 154], [148, 148], [134, 144], [122.4, 141.2]], { ref: 'G2', smooth: 2 }),
    R('Qingce Road', 'prov', [[148, 148], [146, 130], [142, 110], [138, 90], [134, 72], [131.2, 61.4]], { ref: 'G5', smooth: 2 }),
    R('Stone Gate Road', 'prov', [[212.6, 111.4], [204, 96], [190, 80], [176, 64], [164, 44], [156, 30], [151.4, 20.6]], { ref: 'G1', smooth: 2 }),
    R('Chasm Road', 'mtn', [[134, 144], [132, 160], [126, 176], [120, 190], [114, 200]], { smooth: 2 }),
    R('Mingyun Road', 'prov', [[219.8, 153.6], [212, 170], [200, 186], [188, 202], [176.4, 214.6]], { ref: 'G7', smooth: 2 }),
    R('Jueyun Trail', 'mtn', [[122.4, 141.2], [112, 128], [100, 112], [88, 98], [76, 90]], { smooth: 2 }),
    R('Qingce Village Road', 'art', [[130, 60.6], [133.4, 62.4]]),
  ];
  const ROADS = ROADS_RAW.map((r, i) => {
    let pts = r.pts.map((p) => p.slice());
    if (r.closed) pts.push(pts[0].slice());
    if (r.smooth) pts = r.closed ? chaikin(r.pts, r.smooth, true).concat([chaikin(r.pts, r.smooth, true)[0]]) : chaikin(pts, r.smooth, false);
    const cum = cumul(pts);
    return Object.assign({}, r, { i, pts, cum, len: cum[cum.length - 1], bb: bboxOf(pts) });
  });

  const RAIL = [
    { name: 'Northern Railway (Liyue–Snezhnaya)', pts: chaikin([[212.6, 112], [204, 96], [192, 80], [180, 62], [166, 40], [154, 22], [150, 4], [148, -4]], 2, false) },
    { name: 'Coastal Line', pts: chaikin([[212.6, 112], [226, 104], [240, 98], [250.4, 88.6]], 2, false) },
  ];
  const METRO = [
    { id: 'L1', name: 'Harbor Line', color: '#c8323c', st: [['Jade Avenue', 215.4, 120], ['Feiyun Slope', 224.6, 123.2], ['Northland', 231.4, 125.6], ['Harbor Road', 238.2, 126.2], ['Pier 7', 238.6, 133.6], ['Crux Pier', 238.9, 140.4], ['Chihu Rock', 236.6, 149.6]] },
    { id: 'L2', name: 'Terrace Line', color: '#e0a526', st: [['Liyue Harbor Station', 212.6, 112], ['Jade Avenue', 215.4, 120], ['Lantern Street', 216, 130.4], ['Yujing Terrace', 212.4, 138.4], ['Golden House', 218, 144], ['South Gate', 219.8, 153.6]] },
    { id: 'L3', name: 'Lantern Line', color: '#1f7fd0', st: [['Lantern Street', 216, 130.4], ['Wangsheng', 224, 131.6], ['Heyu', 228.6, 132], ['Pier 7', 238.6, 133.6]] },
  ];
  const RAIL_ST = [
    { name: 'Liyue Harbor Station', city: 'Liyue Harbor', at: [212.6, 112], place: 'liyue-station' },
    { name: 'Airport Station', city: 'Airport Spit', at: [250.4, 88.6], place: 'airport' },
    { name: 'Stone Gate Station', city: 'Stone Gate', at: [153, 22], place: null },
  ];

  const LABELS = [
    { t: 'Jueyun Karst', at: [62, 84], k: 'mtn', z0: 1.0, z1: 7, size: 13 },
    { t: 'Mt. Hulao', at: [178, 44], k: 'mtn', z0: 1.6, z1: 9, size: 12 },
    { t: 'Mt. Tianheng', at: [192, 126], k: 'mtn', z0: 1.6, z1: 9, size: 12 },
    { t: 'The Chasm', at: [112, 202], k: 'mtn', z0: 2, z1: 40, size: 12, dark: true },
    { t: 'Guyun Stone Forest', at: [282, 176], k: 'water', z0: 1.2, z1: 30, size: 11 },
    { t: 'Liyue Bay', at: [262, 128], k: 'water', z0: 1.0, z1: 14, size: 13 },
    { t: 'Guili Plains', at: [170, 168], k: 'pass', z0: 2, z1: 20, size: 11 },
    { t: 'Lingju Pass', at: [158, 194], k: 'pass', z0: 4, z1: 40, size: 11 },
    { t: 'FEIYUN SLOPE', at: [220, 121], k: 'dist', z0: 11, z1: 70 },
    { t: 'HARBOR', at: [236, 120], k: 'dist', z0: 11, z1: 70 },
    { t: 'CHIHU ROCK', at: [234, 151], k: 'dist', z0: 11, z1: 70 },
    { t: 'YUJING TERRACE', at: [211, 135.4], k: 'dist', z0: 11, z1: 70 },
    { t: 'JADE QUARTER', at: [212, 126], k: 'dist', z0: 12, z1: 70 },
    { t: 'LANTERN QUARTER', at: [226, 135.6], k: 'dist', z0: 12, z1: 70 },
  ];

  // ═══ Places (the `places` collection; Maps owns it) ═════════════════════
  const P = (id, name, city, x, y, cat, o) => Object.assign({ id, name, city, x, y, cat }, o);
  const LH = 'Liyue Harbor';
  const PLACES = [
    P('pier7', 'Pier 7', LH, 241.0, 134.2, 'landmark', { addr: 'Pier 7, Harbor Promenade, Liyue Harbor', hours: '24h', rating: 4.6, reviews: 1820, minZ: 6, look: 'lake', photos: ['p_pier7_rod', 'p_zl_pier', 'p_catch_1'], tags: ['pier', 'fishing', 'harbor', 'sea'],
      sub: 'Pier · Fishing Spot', desc: 'An old stone pier at the end of the Harbor Promenade, popular with night fishermen. Slack tide around 23:00. Signs ask visitors not to leave bait on the benches.' }),
    P('northland', 'Northland Bank, Liyue Branch', LH, 230.8, 118.6, 'business', { short: 'Northland Bank', addr: '1 Harbor Road, Liyue Harbor', phone: '(0761) 555 0110', contact: 'ekat', hours: 'Mon-Fri 09:00-17:00', rating: 3.1, reviews: 412, web: 'https://northland.sn/liyue', minZ: 6, look: 'street', photos: ['p_northland_lobby'], tags: ['bank', 'northland', 'snezhnaya', 'fatui', 'office'],
      sub: 'Bank · Snezhnayan', desc: 'Liyue branch of the Northland Bank Group. Ice-blue marble lobby, very polite staff, very large security guards. Reviews mention “an unsettling chandelier”.' }),
    P('wangsheng', 'Wangsheng Funeral Parlor', LH, 221.4, 129.6, 'business', { addr: '77 Feiyun Slope, Liyue Harbor', phone: '(0761) 555 0144', contact: 'ht', hours: '24h', rating: 4.9, reviews: 777, web: 'https://wangsheng.ly', minZ: 7, look: 'temple', photos: ['p_wangsheng_door', 'p_coffin4'], tags: ['funeral', 'parlor', 'hu tao', 'zhongli', 'coffin'],
      sub: 'Funeral Parlor · Since the 1st Director', desc: 'Seventy-seven generations of funerals. Currently running an autumn sale: second coffin half price. The consultant is available for historical questions at any hour.' }),
    P('liuli', 'Liuli Pavilion', LH, 226.4, 126.4, 'food', { addr: '18 Feiyun Slope, Liyue Harbor', phone: '(0761) 555 0410', hours: '11:00-23:00', rating: 4.9, reviews: 3410, price: 'ℳℳℳℳ', web: 'https://liuli.ly', minZ: 9, look: 'street', photos: ['p_liuli_dinner'], tags: ['restaurant', 'fine dining', 'liyue cuisine', 'tea'],
      sub: 'Fine Dining · Liyue Cuisine', desc: 'The harbor’s most exclusive restaurant, with private rooms over the water. Reservations essential. The river room is “always booked” on Fridays.' }),
    P('heyu', 'Heyu Tea House', LH, 228.6, 132.4, 'tea', { addr: '4 Lantern Street, Liyue Harbor', phone: '(0761) 555 0156', contact: 'yunjin', hours: '10:00-23:00', rating: 4.8, reviews: 2890, price: 'ℳℳ', minZ: 9, look: 'street', photos: ['p_heyu_stage'], tags: ['tea', 'opera', 'yun jin', 'theater'],
      sub: 'Tea House · Opera', desc: 'Tea house and opera stage, home of the Yun-Han Opera Troupe. Saturday matinee: Yun Jin in “The Divine Damsel” (sold out).' }),
    P('yujing', 'Yujing Terrace', LH, 212.6, 138.6, 'landmark', { addr: 'Yujing Terrace, Liyue Harbor', hours: '24h', rating: 4.9, reviews: 9100, minZ: 3, look: 'temple', photos: ['p_yujing_lanterns', 'p_cranes_yujing'], tags: ['terrace', 'rite', 'funeral', 'lanterns', 'cranes', 'rex lapis'],
      sub: 'Historic Terrace · Rite of Parting', desc: 'Stone terraces above the harbor where the Rite of Descension is held each year. This Sunday at 10:00: the Rite of Parting for Rex Lapis. Expect crowds and a thousand white lanterns.' }),
    P('jade', 'The Jade Chamber', LH, 214.4, 143.0, 'landmark', { addr: 'Above Yujing Terrace, Liyue Harbor', phone: '(0761) 555 0100', contact: 'ning', hours: 'by appointment', rating: 4.8, reviews: 2210, minZ: 4, look: 'temple', photos: ['p_jade_chamber'], tags: ['jade chamber', 'ningguang', 'qixing', 'tianquan'],
      sub: 'Residence · Office of the Tianquan', desc: 'The Tianquan’s jade palace, suspended above the harbor. Visits by appointment only. It is unclear how the stairs work.' }),
    P('golden-house', 'The Golden House', LH, 217.8, 144.6, 'landmark', { addr: 'Golden House Steps, Liyue Harbor', hours: 'Closed to the public', rating: 4.5, reviews: 1480, minZ: 6, look: 'temple', photos: ['p_golden_house'], tags: ['mint', 'vault', 'golden house', 'gnosis'],
      sub: 'Historic Mint & Vault', desc: 'Liyue’s old mint, where the first Mora was struck. Closed to the public; this Sunday at 16:00 it is “reserved for a private handover”.' }),
    P('wanmin-rest', 'Wanmin Restaurant', LH, 235.4, 147.6, 'food', { addr: '8 Chihu Rock Lane, Liyue Harbor', phone: '(0761) 555 0161', contact: 'xl', hours: '10:00-02:00', rating: 4.9, reviews: 6820, price: 'ℳℳ', web: 'https://wanmingo.ly/wanmin', minZ: 9, look: 'market', photos: ['p_wanmin_kitchen', 'food_hotpot', 'p_hotpot_crew'], tags: ['restaurant', 'hotpot', 'xiangling', 'chili', 'wanmin'],
      sub: 'Restaurant · Liyue Cuisine', desc: 'Chef Xiangling’s legendary kitchen, with the hottest hotpot in Liyue. Guoba the red panda is not a health code violation (he is a “sous chef”).' }),
    P('xinyue', 'Xinyue Kiosk', LH, 231.2, 138.2, 'food', { addr: '12 Wanmin Street, Liyue Harbor', phone: '(0761) 555 0170', hours: '11:00-22:00', rating: 4.6, reviews: 1200, price: 'ℳℳℳ', minZ: 11, look: 'street', tags: ['restaurant', 'liyue cuisine'], sub: 'Restaurant', desc: 'Elegant kiosk-style restaurant famous for its “one of everything” tasting menu.' }),
    P('third-round', 'Third-Round Knockout', LH, 236.6, 141.4, 'food', { addr: '2 Crux Pier Road, Liyue Harbor', phone: '(0761) 555 0172', hours: '17:00-03:00', rating: 4.4, reviews: 980, price: 'ℳ', minZ: 11, look: 'market', tags: ['diner', 'teahouse', 'late night', 'sailors'], sub: 'Teahouse & Diner', desc: 'Dockside teahouse-diner where Crux sailors settle bets. The punch card gives a free tea every ten visits.' }),
    P('alcor', 'The Alcor, Crux Pier', LH, 242.6, 141.2, 'landmark', { short: 'The Alcor', addr: 'Crux Pier, Liyue Harbor', phone: '(0761) 555 0190', contact: 'beidou', hours: 'when in port', rating: 4.9, reviews: 1530, minZ: 7, look: 'lake', photos: ['p_alcor_deck'], tags: ['ship', 'crux', 'beidou', 'fleet', 'rematch'],
      sub: 'Flagship · Crux Fleet', desc: 'Flagship of the Crux Fleet, moored at Crux Pier. Captain Beidou hosts “friendly” sparring nights on deck. Spectators welcome; bets discouraged; bets happen.' }),
    P('mingyun', 'Mingyun Toys & Games', LH, 226.2, 140.4, 'shopping', { addr: '30 Lane of Stone Lions, Liyue Harbor', phone: '(0761) 555 0177 2', hours: '09:00-21:00', rating: 4.8, reviews: 640, minZ: 11, look: 'street', tags: ['toys', 'glacier guardians', 'games', 'kids'], sub: 'Toy Store', desc: 'The harbor’s best toy shop. The Glacier Guardians Frost Fortress is back in stock. Staff will wrap anything, including elves.' }),
    P('wanwen', 'Wanwen Bookhouse', LH, 223.4, 121.4, 'shopping', { addr: '6 Feiyun Slope, Liyue Harbor', phone: '(0761) 555 0181 2', hours: '09:00-22:00', rating: 4.7, reviews: 520, minZ: 12, look: 'street', tags: ['books', 'bookshop', 'rocks'], sub: 'Bookshop', desc: 'Light novels downstairs, geology upstairs. Sold a 900-page book about rocks to a man in a gold-trimmed coat, who then gave it to someone else.' }),
    P('bubu', 'Bubu Pharmacy', LH, 217.2, 127.6, 'health', { addr: '21 Jade Avenue, Liyue Harbor', phone: '(0761) 555 0120', hours: '08:00-22:00', rating: 4.7, reviews: 860, minZ: 12, look: 'street', tags: ['pharmacy', 'medicine', 'doctor'], sub: 'Pharmacy', desc: 'Dr. Baizhu’s pharmacy. Ask about the herbal remedies; do not ask about the snake.' }),
    P('mingxing', 'Mingxing Jewelry', LH, 225.4, 133.6, 'shopping', { addr: '9 Lantern Street, Liyue Harbor', phone: '(0761) 555 0188', hours: '10:00-20:00', rating: 4.6, reviews: 310, minZ: 12, look: 'street', tags: ['jewelry', 'jade', 'gifts'], sub: 'Jeweler', desc: 'Fine jade and gold since the second century of the Exchange.' }),
    P('feiyun-guild', 'Feiyun Commerce Guild', LH, 222.0, 125.2, 'business', { addr: '1 Feiyun Slope, Liyue Harbor', phone: '(0761) 555 0763', hours: 'Mon-Sat 09:00-18:00', rating: 4.3, reviews: 450, minZ: 11, look: 'street', tags: ['feiyun', 'market', 'guild', 'auction'], sub: 'Trading House', desc: 'The trading house behind Feiyun Market. The auction floor closes at midnight; online lots run later.' }),
    P('millelith', 'Millelith Station, Harbor', LH, 224.6, 120.6, 'police', { addr: '3 Lane of Stone Lions, Liyue Harbor', phone: '110', hours: '24h', rating: 4.0, reviews: 140, minZ: 12, look: 'street', tags: ['police', 'millelith', 'lost property'], sub: 'Police Station', desc: 'Harbor station of the Millelith. Lost property is accepted at the front desk at any hour.' }),
    P('apartment', 'Pier View Residences', LH, 236.6, 121.6, 'home', { addr: '22 Harbor Road, Unit 2207, Liyue Harbor', minZ: 10, look: 'street', sub: 'Residential Tower', tags: ['home', 'apartment', 'childe'], desc: 'Glass residential tower on Harbor Road with views over Liyue Bay. Unit 2207. A black car has been parked opposite since Saturday.' }),
    P('player-home', 'Chihu Rock, Lane 3', LH, 234.4, 152.4, 'pin', { addr: 'Lane 3, Chihu Rock, Liyue Harbor', minZ: 14, look: 'street', sub: 'Residential Building', tags: ['address', 'home', 'chihu rock'], desc: 'A narrow walk-up by Chihu Rock Park. Your flat. The stairs smell of chili from Wanmin.' }),
    P('liyue-grand', 'Liyue Harbor Grand', LH, 232.6, 128.2, 'hotel', { addr: '40 Harbor Road, Liyue Harbor', phone: '(0761) 555 0450', hours: '24h', rating: 4.5, reviews: 2140, price: 'ℳℳℳℳ', minZ: 9, look: 'hotel', tags: ['hotel', 'northland', 'snezhnaya', 'suite'], sub: 'Hotel · ★★★★★ · Northland partner', desc: 'Grand harbor-front hotel owned by a Snezhnayan holding company. Excellent security. Some guests report that the security will not let them leave.' }),
    P('liyue-station', 'Liyue Harbor Station', LH, 212.6, 112, 'transit', { short: 'Harbor Station', addr: 'Station Square, Liyue Harbor', hours: '05:00-24:00', rating: 4.1, reviews: 8200, minZ: 5, look: 'station', tags: ['train', 'railway', 'station', 'snezhnaya'], sub: 'Railway Station', desc: 'Terminus of the Northern Railway to Snezhnaya (three days, two nights, excellent borscht).' }),
    P('airport', 'Liyue Harbor International (LHI)', 'Airport Spit', 252.2, 85.4, 'transit', { short: 'Liyue Harbor Intl', addr: 'Airport Spit, Liyue', phone: '95536', hours: '24h', rating: 4.2, reviews: 15800, minZ: 3, look: 'station', tags: ['airport', 'flights', 'liyue air', 'arrivals', 'la 711'], sub: 'International Airport', desc: 'Liyue’s international airport on the northern spit. Arrivals: Gate B. Unaccompanied minors are met by Liyue Air staff.' }),
    P('wangshu', 'Wangshu Inn', 'Wangshu', 122.2, 141.4, 'hotel', { addr: 'Dihua Marsh Road, Guili Plains', phone: '(0761) 555 0811', hours: '24h', rating: 4.8, reviews: 2600, price: 'ℳℳ', minZ: 3, look: 'mountain', tags: ['inn', 'hotel', 'almond tofu', 'quiet', 'safe'], sub: 'Inn · Countryside', desc: 'A tall inn over Dihua Marsh, an hour from the harbor. Famous for almond tofu and a quiet, watchful young man on the roof.' }),
    P('guyun', 'Guyun Stone Forest', 'Guyun Stone Forest', 282.0, 160.0, 'landmark', { addr: 'Guyun Stone Forest, Liyue Bay', hours: '—', rating: 4.7, reviews: 3300, minZ: 2, look: 'lake', photos: ['p_storm_guyun', 'p_bluefin', 'p_unit3'], tags: ['stone forest', 'pillars', 'sea', 'osial', 'fishing', 'bluefin'], sub: 'Natural Landmark', desc: 'Towering stone spears in the sea, said to have been thrown down by Rex Lapis to imprison a sea god. Excellent bluefin in autumn. Boats are advised to stay away from pillar G-17.' }),
    P('chasm', 'The Chasm', 'The Chasm', 112.0, 205.0, 'landmark', { addr: 'Chasm Road, Lingju Pass', hours: 'Closed — unsafe', rating: 3.9, reviews: 610, minZ: 2, look: 'mountain', tags: ['mine', 'chasm', 'abyss', 'closed', 'danger'], sub: 'Abandoned Mine · Closed', desc: 'A vast abandoned mine. Closed since “the incident”. Locals report lights below the third level at 3 AM. Do not go down.' }),
    P('qingce', 'Qingce Village', 'Qingce Village', 131.2, 61.4, 'farm', { addr: 'Qingce Village, Liyue', hours: '24h', rating: 4.9, reviews: 1900, minZ: 3, look: 'farm', photos: ['p_glaze_lily'], tags: ['village', 'glaze lily', 'terraces', 'flowers'], sub: 'Village · Glaze Lily Terraces', desc: 'Terraced fields of glaze lilies in the hills north-west of the harbor. Best at dawn.' }),
    P('stonegate', 'Stone Gate', 'Stone Gate', 151.4, 20.6, 'landmark', { addr: 'Stone Gate, Liyue', hours: '24h', rating: 4.3, reviews: 700, minZ: 3, look: 'mountain', tags: ['border', 'gate', 'snezhnaya road'], sub: 'Border Gate', desc: 'Liyue’s old northern gate, on the road and railway to Snezhnaya.' }),
    P('morepesok', 'Morepesok, Snezhnaya', 'Snezhnaya', 149.0, 1.0, 'home', { short: 'Morepesok', addr: '4 Pristan Lane, Morepesok, Snezhnaya', minZ: 1, look: 'mountain', tags: ['home', 'snezhnaya', 'family', 'village'], sub: 'Fishing Village · 2,400 km north', desc: 'A fishing village on the frozen northern sea, two days north by rail. Home.' }),
    P('zapolyarny', 'Zapolyarny Palace, Snezhnaya', 'Snezhnaya', 156.0, 0.6, 'landmark', { short: 'Zapolyarny Palace', addr: 'Zapolyarny Palace, Snezhnaya', minZ: 1, look: 'mountain', tags: ['snezhnaya', 'palace', 'northland bank', 'tsaritsa'], sub: 'Palace · Northland Bank Group HQ', desc: 'Seat of the Tsaritsa and headquarters of the Northland Bank Group. 2,600 km north.' }),
  ];
  PLACES.forEach((p) => { if (p.minZ == null) p.minZ = 12; });
  JC.store.seed('places', PLACES);

  const HOME = [234.4, 152.4]; // Chihu Rock, Lane 3 — the player's flat
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
    farm: { color: '#34a853', glyph: 'leaf.fill', label: 'Village' },
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
    return best ? best.n : METRO_CITY;
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
    if (cA === cB && cA === METRO_CITY) {
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
      if (cA === METRO_CITY) {
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
      else { legs.push({ kind: 'taxi', glyph: 'car.fill', color: '#8e8e93', text: 'Taxi or Harbor Ride to ' + (B.short || B.name), min: Math.round(km2 * 1.6) + 4, pts: [cur, [B.x, B.y]] }); t += Math.round(km2 * 1.6) + 4; }
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
    // city blocks: streets & buildings
    const streetZ = 30, bldZ = 42;
    if (z >= streetZ * 0.8) URBAN.forEach((u) => { if (vis(u.bb)) drawCity(ctx, u, vb, z, S, z >= bldZ, z >= streetZ); });
    // pier
    if (z > 40) { ctx.strokeStyle = S.pier; ctx.lineWidth = 0.05; line([[240.4, 134.2], [243.4, 134.2]]); ctx.stroke(); line([[243, 133.4], [243, 135]]); ctx.stroke(); line([[241.6, 141.2], [244.2, 141.2]]); ctx.stroke(); }
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
    // mist over Jueyun Karst
    if (o.style !== 'satellite' && z < 40) {
      const mistA = clamp(1 - z / 40, 0, 1);
      [[60, 80, 14], [80, 96, 10], [46, 98, 9], [88, 70, 11], [66, 64, 9], [74, 88, 4]].forEach(([x, y, r], i) => {
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
    liyue: ['Jade Lane', 'Lantern Lane', 'Feiyun Lane', 'Chihu Lane', 'Salt Street', 'Silk Lane', 'Crane Lane', 'Teahouse Lane', 'Glaze Lane', 'Mora Street', 'Porcelain Street', 'Opera Lane', 'Harbor Steps', 'Tide Lane', 'Ferry Street', 'Incense Lane', 'Abacus Street', 'Kite Lane'],
    qingce: ['Terrace Lane', 'Lily Path', 'Mill Lane', 'Field Street'],
    wangshu: ['Inn Road', 'Marsh Lane'],
    stonegate: ['Gate Street', 'Caravan Lane', 'North Lane'],
    mingyun: ['Ore Lane', 'Forge Street', 'Hill Lane'],
    airport: ['Terminal Road', 'Cargo Lane'],
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
    if (kind === 'mountain' || kind === 'jueyun') { s += hills('#9fb3a6', 300, 150, 0.8) + hills('#7f9a86', 330, 110) + `<rect y="200" width="${W}" height="200" fill="url(#mist)"/>`; }
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
    if (kind === 'mountain' || kind === 'jueyun') {
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
    'liuli': ['Liuli Pavilion, good evening.', 'Oh — Mr. Tartaglia? The river room is yours next Friday, as always. Shall we chill the osmanthus wine?', 'And… shall we bill you for the gentleman again? Of course. Of course we shall.'],
    'heyu': ['Heyu Tea House box office.', 'Saturday’s matinee is sold out. Box Two is reserved under Tartaglia, two seats.', 'Miss Yun Jin asks whether “the gentleman who quotes her lyrics” will be attending. She hopes so.'],
    'wanmin-rest': ['WANMIN!! Xiangling speaking!! Hotpot? Pickup? Is this about the pelmeni??', '…Oh, it’s the machine voice. Ugh. Use Wanmin Go! It’s faster! Guoba says hi!'],
    'liyue-grand': ['Liyue Harbor Grand, front desk.', 'Suite 1101 is prepared for the children, sir, as the Fifth Harbinger’s office requested. Our staff will escort them at all times.', 'At all times.'],
    'xinyue': ['Xinyue Kiosk. We are closed. The tasting menu returns tomorrow at eleven.'],
    'third-round': ['Third-Round Knockout! Open till three. If you’re calling about a bet, the captain says you lost.'],
    'mingyun': ['Mingyun Toys and Games! We’re closed, but the Frost Fortress is back in stock. Nine to nine!'],
    'wanwen': ['Wanwen Bookhouse. We are closed. If you are calling about the 900-page book about rocks — no, we don’t do returns.'],
    'bubu': ['Bubu Pharmacy. Qiqi… is… answering.', '…Qiqi forgot what Qiqi was saying. Come back tomorrow.'],
    'mingxing': ['Mingxing Jewelry. We are closed. Our jade is not.'],
    'feiyun-guild': ['Feiyun Commerce Guild. The auction floor is closed. Online lots continue in the Feiyun Market app.'],
    'millelith': ['Millelith, Harbor station, Guard Jiayi speaking.', 'Lost property? You can bring it to the front desk any time, day or night. Phones especially — people go frantic.'],
    'wangshu': ['Wangshu Inn, Verr Goldet speaking. We have rooms tonight. Quiet ones.', 'The young man on the roof? Don’t mind him. He keeps watch. Nothing gets past him.'],
    'liyue-station': ['Liyue Harbor Station. The Northern Railway departs daily at 18:40 for Snezhnaya. Tickets at the counter.'],
    'airport': ['Liyue Harbor International. For flight information, press one.', 'LA 711 from Zapolyarny is expected on time at 07:40, Gate B.'],
    'alcor': ['Crux Fleet, The Alcor. Captain’s busy. She says if this is the kid, “Saturday, ten, bring the water swords.”'],
    'jade': ['Office of the Tianquan. The Tianquan is unavailable. State your name, your business, and its value.'],
    'wangsheng': ['Wangsheng Funeral Parlor, Hu Tao speaking! How may we bury you today?', '…Oh! It’s you. No, there’s nobody in Coffin Four. Why would you ask that. Byeee~'],
    'northland': ['Northland Bank, Liyue Branch. Our offices are closed.', 'For card emergencies, freeze your card in the Northland app. For the Director of Special Collections… please hold.', '(The hold music is the corporate anthem. It does not end.)'],
  };

  /** Call a place: story contacts ring through the story engine; businesses answer in-world. */
  function callPlace(x) {
    const p = placeOf(x);
    if (!p) return;
    if (p.contact) {
      JC.ui.actionSheet({ title: p.short || p.name, actions: [{ text: 'Call ' + (p.phone || JC.contacts.name(p.contact)), onTap: () => JC.story.dial(p.contact, p.phone ? { num: p.phone } : undefined) }] });
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
    /** Harbor Ride fare estimate (ℳ) */
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
