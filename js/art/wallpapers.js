/* Wallpapers (1206×2622). Hand-written SVG registered with JC.art.def. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- tiny kit (each art file is self-contained) ---------- */
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const f1 = (v) => Math.round(v * 10) / 10;
  const stops = (s) =>
    s.split('|').map((t) => {
      const [c, o, a] = t.trim().split(/\s+/);
      return `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`;
    }).join('');
  const lin = (id, v, s, ex) => {
    const [x1, y1, x2, y2] = v.split(' ');
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${ex || ''}>${stops(s)}</linearGradient>`;
  };
  const rad = (id, v, s, ex) => {
    const [cx, cy, r, fx, fy] = v.split(' ');
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}${ex || ''}>${stops(s)}</radialGradient>`;
  };
  const US = ' gradientUnits="userSpaceOnUse"';
  const grainDef = (id, fr) =>
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr || 0.8}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const grain = (id, w, h, op) => `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  const stars = (R, n, x0, y0, x1, y1, rmin, rmax, col, bias) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const yy = bias ? Math.pow(R(), bias) : R();
      s += `<circle cx="${f1(x0 + R() * (x1 - x0))}" cy="${f1(y0 + yy * (y1 - y0))}" r="${f1(rmin + R() * R() * (rmax - rmin))}" fill="${col}" opacity="${f1(0.2 + R() * 0.8)}"/>`;
    }
    return s;
  };
  // fluffy outline around an ellipse (fur): n tufts of length ~amp, droop pulls tips down
  const fluff = (cx, cy, rx, ry, n, amp, seed, droop, a0, a1) => {
    const R = rng(seed);
    droop = droop == null ? 0.35 : droop;
    a0 = a0 == null ? 0 : a0;
    a1 = a1 == null ? Math.PI * 2 : a1;
    const pt = (t, k) => [cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k];
    const ws = [];
    let acc = 0;
    for (let i = 0; i < n; i++) { const v = 0.55 + R() * 0.9; ws.push(v); acc += v; }
    let t0 = a0;
    let p = pt(a0, 1);
    let d = `M${f1(p[0])} ${f1(p[1])}`;
    const mr = (rx + ry) / 2;
    for (const v of ws) {
      const t1 = t0 + ((a1 - a0) * v) / acc;
      const tm = t0 + (t1 - t0) * (0.6 + R() * 0.25);
      const len = amp * (0.3 + R() * 0.95);
      const ex = len / mr;
      const tip = pt(tm, 1 + ex);
      tip[1] += len * droop * (0.4 + R() * 0.8);
      const c1 = pt(t0 + (tm - t0) * 0.45, 1 + ex * 0.75);
      const c2 = pt(t1 - (t1 - tm) * 0.25, 1 + ex * 0.12);
      p = pt(t1, 1);
      d += `Q${f1(c1[0])} ${f1(c1[1])} ${f1(tip[0])} ${f1(tip[1])}Q${f1(c2[0])} ${f1(c2[1])} ${f1(p[0])} ${f1(p[1])}`;
      t0 = t1;
    }
    return d + 'Z';
  };
  // shimmering light path on water (sun / moon): irregular dashes, wider toward the viewer
  const glitter = (R, cx, y0, len, maxHW, col, op0, op1, rows) => {
    let s = '';
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1);
      const y = y0 + Math.pow(t, 1.6) * len + R() * 4;
      const hw = 8 + t * maxHW;
      const hh = 1.6 + t * 7 * (0.6 + R() * 0.6);
      const k = 1 + Math.floor(R() * (1 + t * 3));
      for (let j = 0; j < k; j++) {
        const ww = hw * (0.25 + R() * (j ? 0.5 : 1.3));
        const x = cx + (R() - 0.5) * 2 * (hw - ww * 0.5) - ww / 2;
        s += `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(ww)}" height="${f1(hh)}" rx="${f1(hh / 2)}" fill="${col}" opacity="${f1((op0 + (op1 - op0) * t) * (0.55 + R() * 0.45))}"/>`;
      }
    }
    return s;
  };
  // smooth ridge line for mountains: bumps [{x, h, w, p}] over base y, sampled every `step`
  const ridge = (W, base, bottom, bumps, seed, step, rough) => {
    const R = rng(seed);
    let d = `M0 ${bottom}`;
    let n1 = 0;
    for (let x = 0; x <= W + step; x += step) {
      let hgt = 0;
      for (const b of bumps) {
        const u = Math.abs(x - b.x) / b.w;
        hgt = Math.max(hgt, b.h * Math.exp(-Math.pow(u, b.p || 2)));
      }
      n1 = n1 * 0.6 + (R() - 0.5) * (rough || 0);
      d += `L${Math.min(x, W)} ${f1(base - hgt + n1)}`;
    }
    return d + `L${W} ${bottom}Z`;
  };

  /* =====================================================================
     wp_lotus_dusk  (+ wp_lotus_dusk_fg: same canvas, nearest elements only)
     ===================================================================== */
  const PETAL = 'M0 0C-22-12-27-50-15-77C-9-88-4-95 0-100C4-95 9-88 15-77C27-50 22-12 0 0Z';
  const lotusDefs = () =>
    `<path id="pt" d="${PETAL}"/>` + `<g id="fl">${flowerBody()}</g><g id="bd">${budBody()}</g>` +
    lin('pa', '0 1 0 0', '#fff1ec 0|#ffd4dc .4|#f58fb0 .78|#de5a8c 1') +
    lin('pb', '0 1 0 0', '#ffdfe4 0|#f5a3bd .45|#d4547f .85|#b8406d 1') +
    lin('pbud', '0 1 0 0', '#d8e6b8 0|#f6c9d2 .35|#ef7fa4 .75|#d24c7f 1') +
    lin('stem', '0 0 1 0', '#2c4636 0|#4d6f52 .5|#2a4033 1');
  const lotusFlower = (x, y, s, rot) => `<use href="#fl" transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})"/>`;
  const lotusBud = (x, y, s, rot) => `<use href="#bd" transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})"/>`;
  const flowerBody = () => {
    const P = (a, sx, sy, dx, dy, g) => `<use href="#pt" transform="translate(${dx} ${dy}) rotate(${a}) scale(${sx} ${sy})" fill="url(#${g})"/>`;
    let st = '';
    for (let i = 0; i < 13; i++) {
      const a = -1.2 + (2.4 * i) / 12;
      st += `M${f1(Math.sin(a) * 9)} ${f1(-36 + Math.abs(Math.sin(a)) * 3)}L${f1(Math.sin(a) * 22)} ${f1(-50 + Math.abs(a) * 6)}`;
    }
    return (
      `<g stroke="#b9426f" stroke-opacity=".35" stroke-width="1.4">` +
      P(-40, 0.74, 0.9, -6, -8, 'pb') + P(40, 0.74, 0.9, 6, -8, 'pb') + P(-14, 0.78, 1, -3, -10, 'pb') + P(14, 0.78, 1, 3, -10, 'pb') +
      `<path d="M-20-40Q0-47 20-40L15-29Q0-25-15-29Z" fill="#c7b54e" stroke="none"/><ellipse cx="0" cy="-40" rx="20" ry="6" fill="#e5d773" stroke="none"/>` +
      `<path d="${st}" stroke="#ffd24d" stroke-opacity="1" stroke-width="2.4" stroke-linecap="round"/>` +
      P(-66, 0.84, 0.86, -8, 0, 'pa') + P(66, 0.84, 0.86, 8, 0, 'pa') + P(-96, 0.66, 0.7, -10, 6, 'pa') + P(96, 0.66, 0.7, 10, 6, 'pa') +
      P(-30, 0.9, 0.66, -8, 6, 'pa') + P(30, 0.9, 0.66, 8, 6, 'pa') + P(0, 0.98, 0.5, 0, 8, 'pa') +
      `<path d="M-30 8Q0 18 30 8" stroke="#c9577e" stroke-opacity=".25" stroke-width="2" fill="none"/>` +
      `</g>`
    );
  };
  const budBody = () =>
    `<g>` +
    `<use href="#pt" transform="scale(1.05 1.15)" fill="url(#pbud)"/>` +
    `<use href="#pt" transform="translate(-5 2) rotate(-7) scale(.72 1.05)" fill="url(#pbud)" opacity=".9"/>` +
    `<use href="#pt" transform="translate(6 2) rotate(8) scale(.66 1)" fill="url(#pbud)" opacity=".85"/>` +
    `<path d="M0-6Q-3-60 0-108" stroke="#c94a78" stroke-opacity=".3" stroke-width="2" fill="none"/></g>`;
  // floating pad seen in perspective
  const padDef = (id, rim) =>
    `<g id="${id}"><path d="M0 0L-9-100A100 100 0 1 0 9-100Z"/>` +
    `<path d="M0 0L0 98M0 0L-70 70M0 0L70 70M0 0L-98 0M0 0L98 0M0 0L-70-70M0 0L70-70M0 0L-38 92M0 0L38 92M0 0L-92 38M0 0L92 38M0 0L-92-38M0 0L92-38" stroke="#a9d0a0" stroke-opacity=".22" stroke-width="3" fill="none"/>` +
    `<path d="M-99 4A100 100 0 0 1-12-99M12-99A100 100 0 0 1 99 4" stroke="${rim}" stroke-opacity=".45" stroke-width="5" fill="none"/></g>`;
  // cupped (emergent) leaf, side view, stem attach at (0, 46)
  const cupLeaf = (x, y, s, rot, top, under, rim) =>
    `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})">` +
    `<path d="M-100 0Q-62 44 0 48Q62 44 100 0Q78 6 52 10Q26 4 0 14Q-28 4-54 10Q-80 6-100 0Z" fill="${under}"/>` +
    `<path d="M-100 0Q-50-16-4-12Q50-18 100 0Q78 6 52 10Q26 4 0 14Q-28 4-54 10Q-80 6-100 0Z" fill="${top}"/>` +
    `<path d="M0 46L-92 4M0 46L-62 9M0 46L-30 10M0 46L0 14M0 46L30 9M0 46L62 9M0 46L92 4" stroke="${rim}" stroke-opacity=".28" stroke-width="2" fill="none"/>` +
    `<path d="M-100 0Q-50-16-4-12Q50-18 100 0" stroke="${rim}" stroke-opacity=".7" stroke-width="3" fill="none"/></g>`;
  const stem = (x0, y0, x1, y1, bend, wdt, col) =>
    `<path d="M${x0} ${y0}Q${f1((x0 + x1) / 2 + bend)} ${f1((y0 + y1) / 2)} ${x1} ${y1}" stroke="${col || 'url(#stem)'}" stroke-width="${wdt}" fill="none" stroke-linecap="round"/>`;

  const pavilion = (fill, win) =>
    `<g fill="${fill}">` +
    `<path d="M-104 0H104L98-8H-98Z"/><path d="M-90-8h180v-3h-180z"/>` +
    `<path d="M-84-11h6v-52h-6zM-38-11h6v-52h-6zM32-11h6v-52h-6zM78-11h6v-52h-6z"/>` +
    `<path d="M-90-22h180v-3h-180z"/>` +
    `<path d="M-126-66Q-104-64-92-60H92Q104-64 126-66Q112-70 98-80L62-98H-62L-98-80Q-112-70-126-66Z"/>` +
    `<path d="M-52-98h104v-32h-104z"/>` +
    `<path d="M-86-128Q-72-126-62-124H62Q72-126 86-128Q76-134 64-142L30-162H-30L-64-142Q-76-134-86-128Z"/>` +
    `<path d="M-34-162h68l4-6h-76z"/><path d="M-38-166q-6-6-10-14q8 2 14 10zM38-166q6-6 10-14q-8 2-14 10z"/>` +
    `<path d="M-2-168h4v-14h-4z"/><circle cx="0" cy="-186" r="5"/></g>` +
    `<g fill="${win}"><rect x="-74" y="-56" width="34" height="30" rx="2"/><rect x="-28" y="-56" width="56" height="30" rx="2" opacity=".85"/>` +
    `<rect x="42" y="-56" width="34" height="30" rx="2" opacity=".9"/><rect x="-42" y="-124" width="84" height="20" rx="2" opacity=".8"/></g>`;

  function lotusDusk(w, h, fgOnly) {
    // ---- foreground (nearest) elements, shared by both layers ----
    const fg =
      // big foreground pads, bottom
      `<use href="#pdF" transform="translate(150 2560) scale(3.6 .92)" fill="url(#lfF)"/>` +
      `<use href="#pdF" transform="translate(1060 2600) rotate(-6) scale(3.2 .8)" fill="url(#lfF)"/>` +
      // left: tall cupped leaf and a bud
      stem(250, 2622, 196, 1716, 40, 13, '#1f3229') +
      cupLeaf(196, 1672, 2.6, -8, '#3f6650', '#1f3328', '#ffc9a6') +
      stem(110, 2622, 236, 1220, -70, 10, '#22382c') +
      lotusBud(236, 1226, 1.62, 8) +
      // right: tall open lotus rising into the clock zone + a leaf
      stem(1150, 2622, 1010, 1960, 30, 12, '#1f3229') +
      cupLeaf(1010, 1920, 2.1, 10, '#3f6650', '#1f3328', '#ffc9a6') +
      stem(960, 2622, 862, 850, 120, 14, '#25392d') +
      lotusFlower(862, 856, 2.5, -6);
    if (fgOnly) {
      return wrap(w, h, lotusDefs() + padDef('pdF', '#ffc9a6') + lin('lfF', '0 0 0 1', '#2f4b3d 0|#1a2b22 1'), fg);
    }
    const R = rng(77);
    let defs =
      lotusDefs() +
      lin('sky', '0 0 0 1', '#1b1440 0|#2b1d58 .26|#53337a .5|#8f4e8a .7|#d27486 .84|#f8a682 .93|#ffd2a2 1') +
      lin('lake', '0 0 0 1', '#f8c09a 0|#e3939a .07|#a35e8c .24|#64407b .5|#382a62 .78|#211a46 1') +
      rad('sun', '.5 .5 .5', '#fffbe9 0|#ffe7b8 .7|#ffcf96 1') +
      rad('sunG', '.5 .5 .5', '#ffdcae 0 .85|#ffb7a0 .35 .35|#ff9fa0 1 0') +
      rad('halo', '.5 .5 .5', '#ffd9c6 0 .2|#ffd9c6 1 0') +
      rad('lamp', '.5 .5 .5', '#ffe2a6 0 1|#ffb35c .4 .5|#ffb35c 1 0') +
      lin('cl', '0 0 0 1', '#6e4787 0 .0|#9a5d8f .5 .7|#ffb08e 1 .9') +
      lin('fade', '0 0 0 1', '#000 0 0|#000 1 .35') +
      padDef('pd', '#ffc6a2') + padDef('pdF', '#ffc9a6') +
      lin('lf', '0 0 0 1', '#4d6c5c 0|#2f4a40 1') +
      lin('lfF', '0 0 0 1', '#2f4b3d 0|#1a2b22 1') +
      grainDef('gr', 0.9);
    const HZ = 1546;
    let b = `<rect width="${w}" height="${HZ + 4}" fill="url(#sky)"/>`;
    b += stars(R, 34, 0, 0, w, 760, 0.8, 2.6, '#fff', 1.7);
    b += `<circle cx="430" cy="1470" r="760" fill="url(#sunG)"/>`;
    // dusk clouds (lit from below)
    const clouds = [[180, 1190, 300, 16], [520, 1260, 380, 14], [930, 1150, 260, 12], [820, 1330, 420, 18], [300, 1380, 340, 11], [1080, 1400, 220, 9]];
    for (const [cx, cy, rx, ry] of clouds) b += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#cl)" opacity=".8"/>`;
    b += `<circle cx="430" cy="1500" r="64" fill="url(#sun)"/>`;
    // hills
    b += `<path d="${ridge(w, HZ, HZ + 2, [{ x: 40, h: 120, w: 260 }, { x: 330, h: 70, w: 200 }, { x: 760, h: 150, w: 300 }, { x: 1160, h: 110, w: 220 }], 5, 24, 3)}" fill="#a3638e" opacity=".75"/>`;
    b += `<path d="${ridge(w, HZ, HZ + 2, [{ x: 0, h: 70, w: 200 }, { x: 560, h: 34, w: 160 }, { x: 980, h: 88, w: 240 }], 9, 20, 4)}" fill="#6a3f74"/>`;
    b += `<path d="${ridge(w, HZ, HZ + 3, [{ x: 600, h: 10, w: 2000 }], 12, 14, 7)}" fill="#3b2550"/>`;
    // pier + pavilion
    b += `<rect x="470" y="${HZ - 9}" width="300" height="5" fill="#2e1d42"/>`;
    for (let x = 480; x < 770; x += 24) b += `<rect x="${x}" y="${HZ - 9}" width="3" height="12" fill="#2e1d42"/>`;
    for (const x of [500, 560, 620, 680]) {
      b += `<circle cx="${x}" cy="${HZ - 22}" r="26" fill="url(#lamp)"/><circle cx="${x}" cy="${HZ - 22}" r="3.5" fill="#fff0c8"/>`;
      b += `<rect x="${x - 2}" y="${HZ + 6}" width="4" height="${60 + (x % 7) * 6}" fill="#ffd394" opacity=".35"/>`;
    }
    b += `<g transform="translate(860 ${HZ}) scale(.72)">${pavilion('#2d1c40', '#ffc874')}</g>`;
    b += `<circle cx="860" cy="${HZ - 40}" r="120" fill="url(#lamp)" opacity=".45"/>`;
    // lake
    b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#lake)"/>`;
    b += `<g transform="translate(860 ${HZ + 2}) scale(.72 -.6)" opacity=".28">${pavilion('#2d1c40', '#ffc874')}</g>`;
    // sun glitter path
    b += glitter(R, 430, HZ + 3, 1000, 170, '#ffe3b6', 0.95, 0.3, 46);
    // ripples
    for (let i = 0; i < 32; i++) {
      const t = i / 31;
      const y = HZ + 8 + Math.pow(t, 1.8) * 1060;
      const x = R() * w - 100;
      b += `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(120 + R() * 520)}" height="${f1(1.5 + t * 4)}" rx="2" fill="#ffd2b8" opacity="${f1(0.05 + R() * 0.12)}"/>`;
    }
    // midground pads (perspective)
    const pads = [];
    for (let i = 0; i < 54; i++) {
      const t = Math.pow(R(), 0.8);
      const y = 1640 + t * 900;
      const s = 0.12 + t * 1.25 + R() * 0.15;
      let x = R() * (w + 200) - 100;
      if (y < 1900 && x > 340 && x < 520) x += 260; // keep the glitter path open in the distance
      pads.push([y, x, s]);
    }
    pads.sort((a, b2) => a[0] - b2[0]);
    for (const [y, x, s] of pads) {
      const flat = 0.16 + ((y - 1640) / 900) * 0.16;
      b += `<use href="#pd" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1((R() - 0.5) * 30)}) scale(${f1(s)} ${f1(s * flat)})" fill="url(#lf)"/>`;
    }
    // midground lotus: stems, cupped leaves, flowers and buds
    b += stem(640, 2140, 610, 1830, 20, 5) + cupLeaf(610, 1812, 0.75, -4, '#5d8063', '#2c4636', '#ffc6a2');
    b += stem(318, 2060, 336, 1760, -14, 4) + cupLeaf(336, 1744, 0.55, 6, '#5d8063', '#2c4636', '#ffc6a2');
    b += stem(980, 2120, 1000, 1800, 18, 4) + cupLeaf(1000, 1784, 0.6, 3, '#5d8063', '#2c4636', '#ffc6a2');
    b += stem(760, 2300, 730, 1960, -20, 6) + `<circle cx="730" cy="1925" r="90" fill="url(#halo)"/>` + lotusFlower(730, 1966, 0.86, 4);
    b += stem(450, 2260, 470, 2010, 14, 5) + lotusFlower(470, 2016, 0.6, -6);
    b += stem(1100, 2000, 1090, 1790, 10, 3) + lotusFlower(1090, 1794, 0.4, 3);
    b += stem(560, 2000, 552, 1780, -8, 3) + lotusBud(552, 1784, 0.5, -4);
    b += stem(880, 2010, 900, 1840, 10, 3) + lotusBud(900, 1844, 0.42, 6);
    b += stem(160, 1960, 150, 1700, -6, 3) + lotusFlower(150, 1704, 0.38, -4);
    b += stem(1000, 2420, 960, 2150, -10, 6) + cupLeaf(960, 2128, 1.05, -6, '#4f7457', '#24392d', '#ffc6a2');
    // atmosphere darkening toward bottom, then the foreground
    b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#fade)"/>`;
    b += `<circle cx="862" cy="720" r="300" fill="url(#halo)"/>`;
    b += fg;
    b += grain('gr', w, h, 0.07);
    return wrap(w, h, defs, b);
  }
  def('wp_lotus_dusk', {
    title: 'Lotus Pier at dusk', w: 1206, h: 2622, tags: ['wallpaper', 'lotus-pier', 'lotus', 'dusk', 'lake'],
    svg: (w, h) => lotusDusk(w, h, false),
  });
  def('wp_lotus_dusk_fg', {
    title: 'Lotus Pier at dusk (depth layer)', w: 1206, h: 2622, tags: ['wallpaper', 'depth', 'lotus'],
    svg: (w, h) => lotusDusk(w, h, true),
  });


  /* =====================================================================
     wp_night_lake
     ===================================================================== */
  def('wp_night_lake', {
    title: 'Night lake', w: 1206, h: 2622, tags: ['wallpaper', 'night', 'moon', 'lake', 'yunmeng'],
    svg: (w, h) => {
      const R = rng(4242);
      const HZ = 1650;
      const defs =
        lin('sk', '0 0 0 1', '#03071a 0|#071233 .38|#0f2656 .72|#1c4379 .93|#2b5a8e 1') +
        lin('wt', '0 0 0 1', '#21436f 0|#11274d .35|#08132c .75|#050b1d 1') +
        rad('mn', '.42 .38 .7', '#fffef8 0|#f4efdc .7|#ddd5ba 1') +
        rad('mg', '.5 .5 .5', '#a9c6ff 0 .42|#7ea3e6 .35 .16|#7ea3e6 1 0') +
        rad('lan', '.5 .5 .5', '#ffd08a 0 1|#ff9d4a .35 .45|#ff9d4a 1 0') +
        lin('wisp', '0 0 1 0', '#9ab3dd 0 0|#c7d7f2 .5 .5|#9ab3dd 1 0') +
        lin('rd', '0 0 0 1', '#0a1530 0|#02050f 1') +
        padDef('np', '#8fb2e8') +
        lin('npf', '0 0 0 1', '#16304a 0|#071322 1') +
        grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${HZ + 2}" fill="url(#sk)"/>`;
      b += stars(R, 140, 0, 0, w, 1500, 0.6, 2.4, '#e9f0ff', 1.5);
      for (let i = 0; i < 7; i++) {
        const x = f1(60 + R() * 1080), y = f1(60 + R() * 900);
        b += `<circle cx="${x}" cy="${y}" r="9" fill="url(#mg)"/><path d="M${x - 10} ${y}H${x + 10}M${x} ${y - 10}V${y + 10}" stroke="#fff" stroke-width="1.2" opacity=".7"/><circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/>`;
      }
      b += `<circle cx="800" cy="1190" r="520" fill="url(#mg)"/><circle cx="800" cy="1190" r="200" fill="url(#mg)"/>`;
      b += `<circle cx="800" cy="1190" r="92" fill="url(#mn)"/>`;
      b += `<g fill="#cfc6a8" opacity=".28"><circle cx="772" cy="1168" r="17"/><circle cx="822" cy="1214" r="12"/><circle cx="832" cy="1160" r="8"/><circle cx="780" cy="1224" r="7"/><ellipse cx="758" cy="1198" rx="10" ry="7"/></g>`;
      b += `<ellipse cx="640" cy="1290" rx="430" ry="16" fill="url(#wisp)"/><ellipse cx="960" cy="1330" rx="300" ry="11" fill="url(#wisp)"/><ellipse cx="500" cy="1360" rx="260" ry="9" fill="url(#wisp)" opacity=".6"/>`;
      // mountains + reflections
      const far = ridge(w, HZ, HZ + 2, [{ x: 120, h: 230, w: 220, p: 1.6 }, { x: 420, h: 150, w: 200 }, { x: 760, h: 110, w: 260 }, { x: 1080, h: 260, w: 210, p: 1.6 }], 3, 12, 6);
      const near = ridge(w, HZ, HZ + 2, [{ x: -40, h: 150, w: 240 }, { x: 300, h: 60, w: 160 }, { x: 1240, h: 170, w: 260 }, { x: 980, h: 60, w: 140 }], 8, 10, 5);
      b += `<path d="${far}" fill="#17345f"/><path d="${near}" fill="#0b1c3b"/>`;
      // a few lit windows on the far shore
      for (const [x, y] of [[262, 1630], [278, 1634], [930, 1626], [946, 1630], [1010, 1622]]) b += `<rect x="${x}" y="${y}" width="6" height="5" fill="#ffcf85" opacity=".85"/>`;
      b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#wt)"/>`;
      b += `<g transform="translate(0 ${2 * HZ}) scale(1 -1)" opacity=".5"><path d="${far}" fill="#122a4f"/><path d="${near}" fill="#081733"/></g>`;
      b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#wt)" opacity=".55"/>`;
      b += glitter(R, 800, HZ + 3, 960, 150, '#e6efff', 0.9, 0.28, 62);
      for (let i = 0; i < 40; i++) {
        const t = i / 39;
        b += `<rect x="${f1(R() * w - 80)}" y="${f1(HZ + 10 + Math.pow(t, 1.8) * 950)}" width="${f1(100 + R() * 420)}" height="${f1(1.2 + t * 3)}" rx="2" fill="#9fbdf0" opacity="${f1(0.05 + R() * 0.12)}"/>`;
      }
      // sampan with lantern
      let refl = '';
      for (let i = 0; i < 9; i++) refl += `<rect x="${f1(50 - 6 - i * 2 + (R() - 0.5) * 14)}" y="${30 + i * 13}" width="${f1(14 + i * 4)}" height="4" rx="2" fill="#ffc06a" opacity="${f1(0.6 - i * 0.06)}"/>`;
      b += `<g transform="translate(330 1905)"><circle cx="58" cy="-58" r="90" fill="url(#lan)" opacity=".75"/>` +
        `<path d="M-120-6Q-40 10 60 6Q120 2 150-22L132 4Q60 22-40 20Q-100 16-120-6Z" fill="#050a18"/>` +
        `<path d="M-60-6Q-20-56 30-56Q70-50 90-8Z" fill="#081127"/><path d="M58-58V-30" stroke="#050a18" stroke-width="3"/>` +
        `<rect x="50" y="-74" width="16" height="20" rx="6" fill="#ffcf85"/><path d="M-150 22H190" stroke="#8fb2e8" stroke-opacity=".25" stroke-width="2"/>` +
        refl + `</g>`;
      // foreground pads, reeds and cattails
      b += `<use href="#np" transform="translate(260 2520) scale(2.8 .6)" fill="url(#npf)"/><use href="#np" transform="translate(980 2440) rotate(8) scale(2.2 .46)" fill="url(#npf)"/><use href="#np" transform="translate(640 2600) scale(2 .4)" fill="url(#npf)"/>`;
      let reeds = '', rim = '', tails = '';
      const reed = (x, len, lean, wdt) => {
        const tx = x + lean, ty = h - len;
        reeds += `<path d="M${f1(x - wdt)} ${h}Q${f1(x + lean * 0.2)} ${f1(h - len * 0.6)} ${f1(tx)} ${f1(ty)}Q${f1(x + lean * 0.25 + wdt)} ${f1(h - len * 0.55)} ${f1(x + wdt)} ${h}Z"/>`;
        rim += `M${f1(tx)} ${f1(ty)}Q${f1(x + lean * 0.25 + wdt)} ${f1(h - len * 0.55)} ${f1(x + wdt)} ${h}`;
      };
      const cattail = (x, len, lean) => {
        const tx = x + lean, ty = h - len;
        const a = (Math.atan2(lean, len) * 180) / Math.PI;
        tails += `<path d="M${x} ${h}Q${f1(x + lean * 0.15)} ${f1(h - len * 0.5)} ${f1(tx)} ${f1(ty)}" stroke="#03060f" stroke-width="5" fill="none"/>` +
          `<g transform="translate(${f1(tx)} ${f1(ty)}) rotate(${f1(a)})"><rect x="-9" y="-10" width="18" height="78" rx="9" fill="#060b1c"/><path d="M0-10V-46" stroke="#03060f" stroke-width="3"/><path d="M-6 0V56" stroke="#8fb2e8" stroke-opacity=".3" stroke-width="2"/></g>`;
      };
      for (let i = 0; i < 16; i++) reed(20 + R() * 200, 300 + R() * 520, (R() - 0.3) * 160, 5 + R() * 6);
      for (let i = 0; i < 13; i++) reed(990 + R() * 220, 260 + R() * 480, (R() - 0.7) * 160, 5 + R() * 6);
      cattail(110, 640, 30);
      cattail(170, 560, 60);
      cattail(1120, 600, -40);
      b += `<g fill="url(#rd)">${reeds}</g><path d="${rim}" stroke="#8fb2e8" stroke-opacity=".35" stroke-width="1.6" fill="none"/>` + tails;
      b += grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     wp_fairy — Fairy portrait (huge, fluffy, black, goofy)
     ===================================================================== */
  def('wp_fairy', {
    title: 'Fairy', w: 1206, h: 2622, tags: ['wallpaper', 'dog', 'fairy'],
    svg: (w, h) => {
      const R = rng(808);
      const defs =
        lin('bg', '0 0 0 1', '#9f93d8 0|#c3a6dc .28|#efbfc4 .52|#ffd6a8 .72|#d9b47e .9|#a88c5a 1') +
        rad('sunG', '.5 .5 .5', '#fff6dc 0 .95|#ffe2b0 .3 .5|#ffd1a0 1 0') +
        rad('bk', '.5 .5 .5', '#fff3d8 0 .5|#fff3d8 .8 .6|#fff3d8 1 0') +
        rad('bkg', '.5 .5 .5', '#c7d98c 0 .55|#c7d98c .8 .5|#c7d98c 1 0') +
        lin('fur', '0 0 1 1', '#30344a 0|#15161f .45|#0b0b11 1') +
        lin('fur2', '0 0 1 1', '#3a3e52 0|#1d1f2a .6|#121219 1') +
        lin('tg', '0 0 0 1', '#ff9fbb 0|#f27aa0 .55|#d9567f 1') +
        rad('ns', '.42 .3 .8', '#555b72 0|#1a1b24 .45|#060609 1') +
        rad('eye', '.4 .35 .6', '#8a5532 0|#4a2614 .6|#1c0d06 1') +
        lin('gold', '0 0 0 1', '#ffe39a 0|#e0aa45 .55|#9e6d1f 1') +
        lin('mz', '0 0 0 1', '#2a2c3a 0|#14151d 1') +
        grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += `<circle cx="210" cy="1080" r="980" fill="url(#sunG)"/>`;
      for (let i = 0; i < 26; i++) {
        const y = 900 + R() * 1100, r = 30 + R() * 110;
        b += `<circle cx="${f1(R() * w)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#bk)" opacity="${f1(0.15 + R() * 0.35)}"/>`;
      }
      for (let i = 0; i < 18; i++) b += `<circle cx="${f1(R() * w)}" cy="${f1(1950 + R() * 600)}" r="${f1(60 + R() * 140)}" fill="url(#bkg)" opacity="${f1(0.2 + R() * 0.3)}"/>`;
      const RIM = '#ffd3a8';
      // body / chest with rim light
      const body = fluff(603, 2470, 600, 560, 40, 70, 11, 0.55);
      b += `<path d="${body}" fill="${RIM}" opacity=".7" transform="translate(-10 -10)"/><path d="${body}" fill="url(#fur)"/>`;
      let tufts = '';
      for (let i = 0; i < 70; i++) {
        const x = 120 + R() * 960, y = 2040 + R() * 580, l = 30 + R() * 60, a = (x - 603) / 900;
        tufts += `M${f1(x)} ${f1(y)}q${f1(a * 20)} ${f1(l * 0.5)} ${f1(a * 30 + (R() - 0.5) * 16)} ${f1(l)}`;
      }
      b += `<path d="${tufts}" stroke="#383c50" stroke-width="5" stroke-linecap="round" fill="none" opacity=".75"/>`;
      // collar
      b += `<path d="M300 1930Q603 2060 906 1930L912 1990Q603 2120 294 1990Z" fill="url(#gold)"/>`;
      // head group (tilted, goofy)
      let hd = '';
      const earL = fluff(290, 1700, 120, 270, 16, 40, 21, 0.7);
      const earR = fluff(916, 1690, 120, 270, 16, 40, 22, 0.7);
      hd += `<g transform="rotate(14 290 1700)"><path d="${earL}" fill="${RIM}" opacity=".45" transform="translate(-9 -2)"/><path d="${earL}" fill="url(#fur2)"/></g>`;
      hd += `<g transform="rotate(-10 916 1690)"><path d="${earR}" fill="${RIM}" opacity=".35" transform="translate(-6 -8)"/><path d="${earR}" fill="url(#fur2)"/></g>`;
      const head = fluff(603, 1590, 345, 320, 44, 48, 31, 0.45);
      hd += `<path d="${head}" fill="${RIM}" opacity=".8" transform="translate(-9 -11)"/><path d="${head}" fill="url(#fur)"/>`;
      hd += `<path d="${fluff(560, 1440, 200, 120, 22, 26, 41, 0.6)}" fill="#272a39" opacity=".85"/>`;
      // fur strokes on head
      let fs = '';
      for (let i = 0; i < 100; i++) {
        const a = R() * Math.PI * 2, rr = 0.42 + R() * 0.52;
        const x = 603 + Math.cos(a) * 320 * rr, y = 1590 + Math.sin(a) * 290 * rr;
        if (y > 1620 && Math.abs(x - 603) < 210) continue;
        if (Math.abs(y - 1536) < 60 && (Math.abs(x - 484) < 60 || Math.abs(x - 724) < 60)) continue;
        const l = 22 + R() * 30;
        fs += `M${f1(x)} ${f1(y)}q${f1(Math.cos(a) * l * 0.5)} ${f1(Math.sin(a) * l * 0.5 + 8)} ${f1(Math.cos(a) * l)} ${f1(Math.sin(a) * l + 14)}`;
      }
      hd += `<path d="${fs}" stroke="#3d4258" stroke-width="5" stroke-linecap="round" fill="none" opacity=".6"/>`;
      // brows (goofy, raised)
      hd += `<path d="M420 1468Q478 1418 540 1458" stroke="#4a4f66" stroke-width="16" stroke-linecap="round" fill="none"/><path d="M666 1452Q728 1404 790 1446" stroke="#4a4f66" stroke-width="16" stroke-linecap="round" fill="none"/>`;
      const eye = (x, y, r, lx, ly) =>
        `<circle cx="${x}" cy="${y}" r="${r + 7}" fill="#07070b"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#eye)"/>` +
        `<circle cx="${x + lx}" cy="${y + ly}" r="${r * 0.62}" fill="#0a0503"/>` +
        `<circle cx="${x + lx - r * 0.3}" cy="${y + ly - r * 0.32}" r="${r * 0.3}" fill="#fff"/><circle cx="${x + lx + r * 0.28}" cy="${y + ly + r * 0.25}" r="${r * 0.12}" fill="#fff" opacity=".8"/>`;
      hd += eye(484, 1540, 36, -6, -6) + eye(724, 1532, 33, 4, -8);
      // muzzle
      hd += `<path d="${fluff(603, 1730, 175, 130, 26, 18, 51, 0.4)}" fill="url(#mz)"/>`;
      hd += `<path d="M603 1700V1752" stroke="#07070b" stroke-width="7" stroke-linecap="round"/>`;
      // mouth + tongue
      hd += `<path d="M468 1742Q536 1792 603 1756Q672 1792 740 1740Q718 1862 603 1878Q490 1862 468 1742Z" fill="#2c0b17"/>`;
      hd += `<path d="M492 1760l14 30l12-26zM714 1758l-14 30l-12-26z" fill="#f4f0e8"/>`;
      hd += `<path d="M530 1784Q606 1756 690 1786Q712 1910 676 2010Q646 2078 600 2066Q548 2050 546 1940Q538 1858 530 1784Z" fill="url(#tg)"/>`;
      hd += `<path d="M612 1796Q624 1900 610 2018" stroke="#c4426c" stroke-width="7" stroke-linecap="round" fill="none" opacity=".6"/>`;
      hd += `<ellipse cx="576" cy="1850" rx="18" ry="46" fill="#ffd0dc" opacity=".55"/>`;
      hd += `<path d="M468 1742Q536 1792 603 1756Q672 1792 740 1740" stroke="#07070b" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      // nose
      hd += `<path d="M538 1656Q603 1622 668 1656Q676 1690 640 1712Q603 1730 566 1712Q530 1690 538 1656Z" fill="url(#ns)"/>`;
      hd += `<path d="M566 1684q12-8 22 2M618 1686q12-10 22-2" stroke="#000" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      hd += `<ellipse cx="590" cy="1650" rx="30" ry="9" fill="#9aa2bd" opacity=".55"/>`;
      hd += `<g fill="#3a3e52"><circle cx="520" cy="1730" r="4"/><circle cx="508" cy="1714" r="4"/><circle cx="690" cy="1730" r="4"/><circle cx="702" cy="1714" r="4"/></g>`;
      b += `<g transform="rotate(-6 603 1760)">${hd}</g>`;
      // AirTag on collar
      b += `<g transform="translate(830 2036)"><circle r="46" fill="url(#gold)"/><circle r="36" fill="#f5f5f7"/><circle r="36" fill="none" stroke="#c9cad3" stroke-width="3"/><ellipse cx="-10" cy="-12" rx="16" ry="9" fill="#fff"/></g>`;
      b += grain('gr', w, h, 0.07);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     wp_purple — liquid purple glass (abstract, iOS 26 mood)
     ===================================================================== */
  def('wp_purple', {
    title: 'Purple glass', w: 1206, h: 2622, tags: ['wallpaper', 'abstract', 'purple'],
    svg: (w, h) => {
      // folded glass ribbons: a centre bezier, offset both ways; width pinches where the ribbon twists
      const bez = (p, t) => {
        const u = 1 - t;
        return [0, 1].map((k) => u * u * u * p[k] + 3 * u * u * t * p[2 + k] + 3 * u * t * t * p[4 + k] + t * t * t * p[6 + k]);
      };
      let defs =
        lin('bg', '0 0 0 1', '#0a0520 0|#170a40 .4|#25105a .65|#10062a 1') +
        rad('g1', '.5 .5 .5', '#ff4fcf 0 .55|#ff4fcf 1 0') +
        rad('g2', '.5 .5 .5', '#4f63ff 0 .5|#4f63ff 1 0') +
        rad('g3', '.5 .5 .5', '#a46bff 0 .42|#a46bff 1 0') +
        grainDef('gr', 0.95);
      let gid = 0;
      const ribbon = (p, W, twist, phase, col, op) => {
        const N = 90, C = [], Nn = [], Wd = [];
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          const a = bez(p, Math.max(0, t - 0.002)), c = bez(p, Math.min(1, t + 0.002));
          const dx = c[0] - a[0], dy = c[1] - a[1], l = Math.hypot(dx, dy) || 1;
          C.push(bez(p, t));
          Nn.push([-dy / l, dx / l]);
          Wd.push(W * (0.1 + 0.9 * Math.abs(Math.cos(Math.PI * twist * t + phase))));
        }
        let out = '', seg = [0];
        for (let i = 1; i < N; i++) if (Wd[i] < Wd[i - 1] && Wd[i] < Wd[i + 1]) seg.push(i);
        seg.push(N);
        for (let s = 0; s < seg.length - 1; s++) {
          const i0 = seg[s], i1 = seg[s + 1], im = Math.round((i0 + i1) / 2);
          const front = (Math.floor((Math.PI * twist * (im / N) + phase) / Math.PI + 0.5) % 2 === 0);
          const top = [], bot = [];
          for (let i = i0; i <= i1; i++) {
            top.push(`${f1(C[i][0] + Nn[i][0] * Wd[i] / 2)} ${f1(C[i][1] + Nn[i][1] * Wd[i] / 2)}`);
            bot.push(`${f1(C[i][0] - Nn[i][0] * Wd[i] / 2)} ${f1(C[i][1] - Nn[i][1] * Wd[i] / 2)}`);
          }
          const id = 'rb' + gid++;
          const [cx, cy] = C[im], [nx, ny] = Nn[im], hw = Wd[im] / 2;
          defs += lin(id, `${f1(cx + nx * hw)} ${f1(cy + ny * hw)} ${f1(cx - nx * hw)} ${f1(cy - ny * hw)}`,
            front ? `${col[0]} 0|${col[1]} .3|${col[2]} .48|${col[1]} .62|${col[0]} 1` : `${col[3]} 0|${col[0]} .35|${col[1]} .6|${col[0]} .8|${col[3]} 1`, US);
          out += `<path d="M${top.join('L')}L${bot.reverse().join('L')}Z" fill="url(#${id})" opacity="${op}"/>`;
          out += `<path d="M${bot.join('L')}" stroke="#fff" stroke-opacity=".25" stroke-width="2" fill="none"/>`;
          if (front) {
            const hl = [];
            for (let i = i0; i <= i1; i++) hl.push(`${f1(C[i][0] + Nn[i][0] * Wd[i] * 0.3)} ${f1(C[i][1] + Nn[i][1] * Wd[i] * 0.3)}`);
            out += `<path d="M${hl.join('L')}" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`;
            out += `<path d="M${top.join('L')}" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none"/>`;
          }
        }
        return out;
      };
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += `<circle cx="1050" cy="2250" r="1000" fill="url(#g1)"/><circle cx="40" cy="1600" r="900" fill="url(#g2)"/><circle cx="1000" cy="560" r="820" fill="url(#g3)"/><circle cx="260" cy="260" r="560" fill="url(#g2)" opacity=".35"/>`;
      b += ribbon([-160, 2060, 360, 1560, 860, 2360, 1360, 1300], 340, 1.8, 2.6, ['#4a1db0', '#9a5cff', '#f2e2ff', '#240b60'], 0.9);
      b += ribbon([-160, 1240, 380, 900, 760, 2080, 1360, 1940], 240, 2.2, 0.3, ['#2a2fb8', '#6a7bff', '#e4e8ff', '#151968'], 0.82);
      b += ribbon([-160, 2560, 360, 2200, 820, 2800, 1360, 2300], 300, 2.4, 1.2, ['#8a1a8c', '#f04fc0', '#ffe4f6', '#4a0a4e'], 0.9);
      b += grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     wp_cloud — misty Gusu mountains
     ===================================================================== */
  def('wp_cloud', {
    title: 'Gusu mist', w: 1206, h: 2622, tags: ['wallpaper', 'gusu', 'mountains', 'mist'],
    svg: (w, h) => {
      const R = rng(1313);
      const defs =
        lin('sk', '0 0 0 1', '#bfd0d6 0|#d9e3e2 .4|#efefe8 .75|#f7f3ea 1') +
        rad('sun', '.5 .5 .5', '#fffdf6 0 1|#fff8e8 .45 .5|#fff8e8 1 0') +
        lin('mist', '0 0 0 1', '#f3f2ec 0 0|#f3f2ec .3 .8|#f3f2ec 1 .92') +
        lin('m1', '0 0 0 1', '#a9bcc2 0|#c9d4d4 1') +
        lin('m2', '0 0 0 1', '#8aa3aa 0|#b9c7c7 1') +
        lin('m3', '0 0 0 1', '#6a878e 0|#a3b5b6 1') +
        lin('m4', '0 0 0 1', '#4b6a70 0|#8ba0a0 1') +
        lin('m5', '0 0 0 1', '#2c4446 0|#22383a 1') +
        lin('wsp', '0 0 1 0', '#fff 0 0|#fff .5 .5|#fff 1 0') +
        lin('mist2', '0 0 0 1', '#f3f2ec 0 0|#f3f2ec .5 .8|#f3f2ec 1 0') +
        grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sk)"/>`;
      b += `<circle cx="820" cy="980" r="380" fill="url(#sun)"/><circle cx="820" cy="980" r="62" fill="#fffdf4" opacity=".9"/>`;
      const layer = (base, bumps, seed, g, rough) =>
        `<path d="${ridge(w, base, h, bumps, seed, 8, rough)}" fill="url(#${g})"/><rect y="${base - 150}" width="${w}" height="${h - base + 150}" fill="url(#mist)"/>`;
      b += layer(1500, [{ x: 160, h: 430, w: 110, p: 1.3 }, { x: 260, h: 300, w: 90, p: 1.4 }, { x: 420, h: 240, w: 110, p: 1.5 }, { x: 700, h: 370, w: 120, p: 1.3 }, { x: 800, h: 250, w: 90, p: 1.5 }, { x: 1010, h: 470, w: 105, p: 1.3 }, { x: 1180, h: 290, w: 110 }], 1, 'm1', 7);
      b += layer(1760, [{ x: 40, h: 390, w: 120, p: 1.4 }, { x: 330, h: 250, w: 100, p: 1.4 }, { x: 440, h: 310, w: 100, p: 1.3 }, { x: 620, h: 180, w: 140 }, { x: 900, h: 350, w: 100, p: 1.4 }, { x: 1100, h: 220, w: 120 }], 2, 'm2', 7);
      // Cloud Recesses roofs on the third ridge
      let roofs = '';
      for (const [x, y, s] of [[640, 1820, 1], [760, 1846, 0.8], [540, 1858, 0.7], [860, 1876, 0.6]]) {
        roofs += `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-10" width="120" height="44" fill="#e8ecea"/><path d="M-92-6Q-70-8-58-22L-30-40H30L58-22Q70-8 92-6Q60 0 0 0Q-60 0-92-6Z" fill="#4d5f63"/><rect x="-40" y="4" width="16" height="30" fill="#5d6f72"/><rect x="24" y="4" width="16" height="30" fill="#5d6f72"/></g>`;
      }
      b += layer(2020, [{ x: 640, h: 230, w: 260, p: 2.2 }, { x: 180, h: 300, w: 120, p: 1.4 }, { x: 290, h: 200, w: 90 }, { x: 1150, h: 270, w: 130, p: 1.5 }], 3, 'm3', 6);
      b += roofs + `<rect y="1860" width="${w}" height="220" fill="url(#mist2)" opacity=".6"/>`;
      b += layer(2300, [{ x: 980, h: 290, w: 170, p: 1.6 }, { x: 860, h: 180, w: 120 }, { x: 420, h: 160, w: 220 }], 4, 'm4', 6);
      for (const [x, y, rx] of [[300, 1420, 380], [900, 1650, 340], [520, 1960, 420], [1000, 2200, 300], [200, 2420, 280]]) b += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx * 0.03)}" fill="url(#wsp)"/>`;
      // near cliff with pines
      b += `<path d="M-10 2622V2240Q40 2190 100 2232Q150 2196 210 2250Q270 2262 300 2330Q340 2380 380 2440Q440 2520 540 2622Z" fill="url(#m5)"/>`;
      b += `<path d="M30 2300q40 30 30 90M160 2290q30 50 10 120M250 2330q30 40 20 90M320 2420q20 40 10 80" stroke="#476062" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`;
      const pad = (x, y, rx) => `<path d="M${x - rx} ${y}Q${f1(x - rx * 0.8)} ${f1(y - rx * 0.32)} ${f1(x - rx * 0.4)} ${f1(y - rx * 0.3)}Q${x} ${f1(y - rx * 0.5)} ${f1(x + rx * 0.4)} ${f1(y - rx * 0.3)}Q${f1(x + rx * 0.85)} ${f1(y - rx * 0.3)} ${x + rx} ${y}Z"/>`;
      const pine = (x, y, s, flip) => {
        const P = [[14, -250, 70], [-46, -196, 84], [60, -176, 74], [-14, -132, 96], [74, -104, 60], [-70, -86, 64]];
        let g = `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-8 0Q-14-90 8-160Q20-210 6-262" stroke="#1d2f30" stroke-width="12" fill="none" stroke-linecap="round"/>`;
        g += `<path d="${P.map(([px, py]) => `M${px > 0 ? 6 : -4} ${py + 30}Q${px * 0.5} ${py + 10} ${px} ${py}`).join('')}" stroke="#1d2f30" stroke-width="5" fill="none"/>`;
        g += `<g fill="#1b2c2d">${P.map(([px, py, rx]) => pad(px, py, rx)).join('')}</g>`;
        g += `<g fill="#3b5352" opacity=".7">${P.map(([px, py, rx]) => pad(px, py - rx * 0.12, rx * 0.6)).join('')}</g>`;
        return g + '</g>';
      };
      b += pine(120, 2262, 1.3) + pine(300, 2350, 0.9, true);
      let birds = '';
      for (let i = 0; i < 6; i++) {
        const x = 600 + i * 46 + R() * 30, y = 880 + R() * 120, s = 8 + R() * 6;
        birds += `M${f1(x - s)} ${f1(y - s * 0.3)}q${f1(s * 0.5)} ${f1(-s * 0.3)} ${f1(s)} ${f1(s * 0.3)}q${f1(s * 0.5)} ${f1(-s * 0.6)} ${f1(s)} ${f1(-s * 0.3)}`;
      }
      b += `<path d="${birds}" stroke="#4d5f63" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      b += grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     wp_peony — gold peony pattern on deep red
     ===================================================================== */
  def('wp_peony', {
    title: 'Gold peony', w: 1206, h: 2622, tags: ['wallpaper', 'peony', 'jin', 'pattern'],
    svg: (w, h) => {
      const R = rng(99);
      const peony = (s) => {
        let p = `<g transform="scale(${s})">`;
        const ring = (n, r, sc, off, g) => {
          for (let i = 0; i < n; i++) {
            const a = (360 / n) * i + off + (R() - 0.5) * 14;
            p += `<use href="#pp" transform="rotate(${f1(a)}) translate(0 ${-r}) scale(${f1(sc * (0.88 + R() * 0.24))})" fill="url(#${g})"/>`;
          }
        };
        ring(8, 16, 1.5, 0, 'gA');
        ring(8, 12, 1.15, 22, 'gB');
        ring(7, 7, 0.85, 6, 'gA');
        ring(5, 2, 0.6, 30, 'gB');
        p += `<circle r="8" fill="#f8e1a0"/>`;
        for (let i = 0; i < 9; i++) p += `<circle cx="${f1(Math.cos(i * 0.7) * 5)}" cy="${f1(Math.sin(i * 0.7) * 5)}" r="1.4" fill="#a87420"/>`;
        return p + '</g>';
      };
      const leaf = (x, y, a, s, g) => `<use href="#lf" transform="translate(${x} ${y}) rotate(${a}) scale(${s})" fill="url(#${g || 'gL'})"/>`;
      const bud = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0Q-4-14 0-22" stroke="url(#gL)" stroke-width="4" fill="none"/>${leaf(0, -16, -50, 0.45)}${leaf(0, -16, 50, 0.45)}<path d="M0-56C-14-54-18-34-12-24Q0-18 12-24C18-34 14-54 0-56Z" fill="url(#gA)" stroke="#6e440c" stroke-opacity=".6" stroke-width="1.3"/><path d="M-6-28Q0-50 6-28" stroke="#6e440c" stroke-opacity=".5" fill="none"/></g>`;
      const TW = 402, TH = 437;
      // one period of an entwined-branch scroll (缠枝) with two flowers
      const motif =
        `<path d="M201 0C261 0 321 50 321 109S261 218 201 218S81 268 81 328S141 437 201 437" stroke="url(#gV)" stroke-width="7" fill="none"/>` +
        `<path d="M250 190q40 10 46 40q2 22-18 24q-14-2-10-14M150 410q-40-6-48 26q0 20 18 20q14-4 8-16M262 12q-30 30-10 56M140 240q30-24 6-56" stroke="url(#gV)" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        leaf(262, 18, 60, 1.05) + leaf(300, 196, 120, 1.1, 'gL2') + leaf(236, 226, -80, 0.9) + leaf(140, 236, -110, 1.05) + leaf(100, 420, -60, 1.1, 'gL2') + leaf(170, 410, 100, 0.85) +
        leaf(318, 30, 20, 0.8, 'gL2') + leaf(84, 250, 200, 0.8, 'gL2') +
        bud(302, 268, 150) + bud(100, 168, -30) +
        `<g transform="translate(321 109) rotate(15)">${peony(1.05)}</g><g transform="translate(81 328) rotate(-20)">${peony(1.05)}</g>`;
      let tile = '';
      for (const dx of [-TW, 0, TW]) for (const dy of [-TH, 0, TH]) tile += `<use href="#mo" transform="translate(${dx} ${dy})"/>`;
      tile += `<g fill="#f1cf7c" opacity=".7"><circle cx="40" cy="40" r="3"/><circle cx="360" cy="400" r="3"/><circle cx="380" cy="230" r="2"/><circle cx="20" cy="210" r="2"/><circle cx="200" cy="330" r="2.4"/><circle cx="200" cy="105" r="2.4"/></g>`;
      const defs =
        lin('bg', '0 0 1 1', '#4a0611 0|#7a0e1f .45|#8c1525 .55|#4a0611 1') +
        lin('gA', '0 1 0 0', '#a8741f 0|#e2b85c .5|#fbe7a6 1') +
        lin('gB', '0 1 0 0', '#8a5c16 0|#d4a44c .6|#f3d68a 1') +
        lin('gL', '0 1 0 0', '#7c5214 0|#c99a45 .6|#ebcd80 1') +
        lin('gL2', '0 1 0 0', '#6a4510 0|#a87a30 .6|#d2ae5e 1') +
        lin('gV', '0 0 1 1', '#b88838 0|#f0d488 .5|#b88838 1') +
        `<path id="pp" d="M0 0C-12-4-26-18-27-34Q-27-44-19-44Q-17-53-8-50Q-3-58 4-51Q12-56 17-47Q26-45 25-34C24-18 12-4 0 0Z" stroke="#6e440c" stroke-width="1.3" stroke-opacity=".55"/>` +
        `<g id="lf"><path d="M0 0C16-8 26-30 16-52Q10-60 2-70Q-2-58-10-50C-22-34-16-10 0 0Z"/><path d="M0-2Q6-30 2-64" stroke="#6e440c" stroke-opacity=".55" stroke-width="1.6" fill="none"/></g>` +
        `<g id="mo">${motif}</g>` +
        `<pattern id="pt" width="${TW}" height="${TH}" patternUnits="userSpaceOnUse">${tile}</pattern>` +
        rad('vg', '.5 .45 .75', '#000 .5 0|#000 1 .5') +
        lin('sheen', '0 0 1 1', '#fff 0 0|#fff .45 .1|#fff .55 0|#fff 1 0') +
        lin('top', '0 0 0 1', '#2a0208 0 .6|#2a0208 .36 .3|#2a0208 .5 0') +
        grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#pt)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#top)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#sheen)"/><rect width="${w}" height="${h}" fill="url(#vg)"/>`;
      b += grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });
})();
