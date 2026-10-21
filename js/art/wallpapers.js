/* Wallpapers (1206×2622) for the lock and home screens. The clock sits around y 350–660 and the lock-screen buttons
   below y 2270, so the top third stays calm and the bottom stays quiet. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---------- svg kit ----------
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
  const r0 = Math.round;
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const lgu = (id, s, x1, y1, x2, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const op = (o) => ` opacity="${o}"`;
  const tf = (t) => ` transform="${t}"`;
  const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
  const S = (d, c, w, o, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o != null ? op(o) : ''}${x}/>`;
  const C = (cx, cy, r, fill, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${x}/>`;
  const E = (cx, cy, rx, ry, fill, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${x}/>`;
  const Rr = (x, y, w, h, fill, x2 = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"${x2}/>`;
  const G = (t, s, x = '') => `<g transform="${t}"${x}>${s}</g>`;
  const use = (id, x, y, s = 1, x2 = '') => `<use href="#${id}" transform="translate(${f1(x)} ${f1(y)})${s !== 1 ? ` scale(${f1(s * 100) / 100})` : ''}"${x2}/>`;
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  const stars = (R, n, x0, y0, x1, y1, rmin, rmax, col, omax = 0.8) => {
    let s = '';
    for (let i = 0; i < n; i++) s += C(f1(x0 + R() * (x1 - x0)), f1(y0 + R() * R() * (y1 - y0)), f1(rmin + R() * R() * (rmax - rmin)), col, op(f1(0.15 + R() * (omax - 0.15))));
    return s;
  };
  // smooth ridge for mountains: bumps [{x, h, w, p}] over base, sampled every `step`
  const ridge = (W, base, bottom, bumps, seed, step, rough) => {
    const R = rng(seed);
    let d = `M0 ${bottom}`;
    let n1 = 0;
    for (let x = 0; x <= W + step; x += step) {
      let hgt = 0;
      for (const b of bumps) hgt = Math.max(hgt, b.h * Math.exp(-Math.pow(Math.abs(x - b.x) / b.w, b.p || 2)));
      n1 = n1 * 0.6 + (R() - 0.5) * (rough || 0);
      d += `L${Math.min(x, W)} ${f1(base - hgt + n1)}`;
    }
    return d + `L${W} ${bottom}Z`;
  };
  // shimmering light path on water: irregular dashes, wider toward the viewer
  const glitter = (R, cx, y0, len, maxHW, col, op0, op1, rows) => {
    let s = '';
    for (let i = 0; i < rows; i++) {
      const t = i / (rows - 1);
      const y = y0 + Math.pow(t, 1.5) * len;
      const hw = 10 + t * maxHW;
      const hh = 2 + t * 7 * (0.6 + R() * 0.6);
      const k = 1 + Math.floor(R() * (1 + t * 2.5));
      for (let j = 0; j < k; j++) {
        const ww = hw * (0.25 + R() * (j ? 0.5 : 1.2));
        const x = cx + (R() - 0.5) * 2 * (hw - ww * 0.5) - ww / 2;
        s += `<rect x="${r0(x)}" y="${r0(y)}" width="${r0(ww)}" height="${f1(hh)}" rx="${f1(hh / 2)}" fill="${col}" opacity="${f1((op0 + (op1 - op0) * t) * (0.55 + R() * 0.45))}"/>`;
      }
    }
    return s;
  };
  // tapered pole from a to b (half widths w0 → w1), bowed by `bend`
  const pole = (a, b, w0, w1, bend = 0) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const mx = (a[0] + b[0]) / 2 + nx * bend, my = (a[1] + b[1]) / 2 + ny * bend, wm = (w0 + w1) / 2;
    return `M${f1(a[0] + nx * w0)} ${f1(a[1] + ny * w0)}Q${f1(mx + nx * wm)} ${f1(my + ny * wm)} ${f1(b[0] + nx * w1)} ${f1(b[1] + ny * w1)}L${f1(b[0] - nx * w1)} ${f1(b[1] - ny * w1)}Q${f1(mx - nx * wm)} ${f1(my - ny * wm)} ${f1(a[0] - nx * w0)} ${f1(a[1] - ny * w0)}Z`;
  };

  /* =====================================================================
     wp_harbor_night (+ wp_harbor_night_fg: the same canvas, nearest elements only)
     ===================================================================== */
  // Liyue building: dark wood body with lit lattice windows, vermilion posts and a golden upturned roof
  function bld(x, base, w, h, rh, R) {
    const y0 = base - h;
    let s = Rr(x, y0, w, h, '#2e1e1e') + Rr(x, y0, 7, h, '#8a2a22') + Rr(x + w - 7, y0, 7, h, '#8a2a22');
    const n = Math.max(1, Math.floor((w - 20) / 38)), ww = (w - 20) / n;
    for (let i = 0; i < n; i++) if (R() > 0.18) s += Rr(x + 10 + i * ww + 4, y0 + h * 0.22, ww - 8, h * 0.46, R() > 0.5 ? '#ffcf7a' : '#ffb04a', op(f1(0.65 + R() * 0.35)));
    const ov = w * 0.14, t1 = [x - ov, y0 - 10], t2 = [x + w + ov, y0 - 10];
    s += P(`M${f1(t1[0])} ${t1[1]}Q${f1(x + w / 2)} ${y0 + 8} ${f1(t2[0])} ${t2[1]}Q${f1(x + w * 0.82)} ${f1(y0 - rh * 0.2)} ${f1(x + w * 0.76)} ${y0 - rh}H${f1(x + w * 0.24)}Q${f1(x + w * 0.18)} ${f1(y0 - rh * 0.2)} ${f1(t1[0])} ${t1[1]}Z`, 'url(#rf)') +
      S(`M${f1(x + w * 0.22)} ${y0 - rh}H${f1(x + w * 0.78)}`, '#ffe08a', 3, 0.7) +
      S(`M${f1(t1[0] + 6)} ${t1[1] + 5}Q${f1(x + w / 2)} ${y0 + 12} ${f1(t2[0] - 6)} ${t2[1] + 5}`, '#ffd27a', 3, 0.5);
    return s;
  }
  // big hanging lantern (foreground)
  const bigLantern = (x, y, s) => G(`translate(${x} ${y}) scale(${s})`,
    C(0, 0, 150, 'url(#lglow)') +
    S('M0-118V-70', '#2a1a14', 5) + Rr(-30, -76, 60, 12, '#3a2216') + Rr(-30, 64, 60, 12, '#3a2216') +
    E(0, 0, 56, 68, 'url(#lbody)') + S('M-30-62Q-46 0-30 62M0-68V68M30-62Q46 0 30 62', '#8a1c14', 3, 0.6) +
    S('M-8 76V122M0 76V128M8 76V122', '#c8323c', 4));

  function harbor(w, h, fgOnly) {
    // ---- nearest elements: pier railing with lantern posts, a fishing rod leaning on it, a cup of tea
    const posts = [40, 330, 620, 910, 1180];
    let fg = '';
    fg += Rr(0, 2390, w, h - 2390, 'url(#deck)');
    for (let i = 0; i < 9; i++) fg += S(`M${603 + (i - 4) * 70} 2392L${603 + (i - 4) * 300} ${h}`, '#05080c', 4, 0.5);
    fg += Rr(0, 2384, w, 14, '#3a2a22');
    posts.forEach((x) => { fg += Rr(x - 20, 2140, 40, 260, 'url(#post)') + Rr(x - 26, 2128, 52, 18, '#4a3428'); });
    fg += Rr(0, 2150, w, 30, 'url(#rail)') + S('M0 2152H1206', '#ffbf6a', 3, 0.55) + Rr(0, 2268, w, 18, 'url(#rail)') + S('M0 2270H1206', '#ffbf6a', 2, 0.35);
    // lantern posts
    fg += Rr(28, 1760, 24, 400, 'url(#post)') + P('M40 1772H170V1786H52Z', '#3a2a22') + bigLantern(150, 1930, 0.95);
    fg += Rr(1168, 1820, 24, 340, 'url(#post)') + P('M1180 1832H1060V1846H1168Z', '#3a2a22') + bigLantern(1070, 1980, 0.8);
    // the cup of osmanthus tea on the rail
    fg += G('translate(800 2150)', P('M-24-40H24L18-4Q0 2-18-4Z', '#f2ece0') + E(0, -40, 24, 6, '#c8a058') + S('M24-30Q38-28 34-16Q30-8 20-10', '#f2ece0', 5) + E(0, -1, 30, 5, '#e8e0d0'));
    // the rod: cork grip, reel, guides, line
    const A = [196, 2600], B = [1040, 470];
    fg += P(pole(A, B, 10, 2.2, 14), 'url(#rod)') + P(pole(A, [A[0] + 66, A[1] - 166], 11, 9.5, 0), '#b8895a') +
      S(`M${A[0] + 4} ${A[1] - 40}l60 -150`, '#8a6440', 2, 0.6) +
      G(`translate(${A[0] + 88} ${A[1] - 226}) rotate(22)`, Rr(-4, 0, 8, 26, '#5a5e66') + C(-26, 28, 26, '#3a3e46') + C(-26, 28, 15, '#7a808a') + C(-26, 28, 5, '#c8cdd4'));
    [0.32, 0.5, 0.66, 0.8, 0.91].forEach((t) => { const x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t; fg += C(f1(x + 9), f1(y + 4), 6, 'none', ' stroke="#9aa2ac" stroke-width="2.5"'); });
    fg += S(`M${B[0]} ${B[1]}Q1160 1100 1128 1880`, '#e8eef6', 2, 0.55);
    if (fgOnly) return wrap(w, h, harborFgDefs(), fg);

    const R = rng(7);
    let s = Rr(0, 0, w, 1640, 'url(#sky)') + E(260, 1560, 700, 260, 'url(#warm)');
    s += stars(R, 70, 0, 0, w, 1300, 0.8, 2.8, '#fff', 0.75);
    // moon, halo, wisps
    s += C(840, 1040, 560, 'url(#halo)') + C(840, 1040, 168, 'url(#moon)') +
      E(800, 990, 30, 22, '#d8c8a0', op(0.25)) + E(880, 1090, 44, 30, '#d8c8a0', op(0.2)) + E(780, 1110, 18, 14, '#d8c8a0', op(0.22)) +
      E(720, 1150, 300, 12, '#9aaccc', op(0.22)) + E(980, 1000, 220, 9, '#9aaccc', op(0.16)) + E(500, 1240, 360, 14, '#8aa0c0', op(0.12));
    // karst peaks in mist
    s += P(ridge(w, 1580, 1640, [{ x: 560, h: 170, w: 60 }, { x: 690, h: 300, w: 52 }, { x: 800, h: 230, w: 46 }, { x: 960, h: 360, w: 56 }, { x: 1090, h: 270, w: 50 }, { x: 1200, h: 330, w: 60 }], 3, 12, 6), 'url(#mt1)') +
      P(ridge(w, 1590, 1640, [{ x: 620, h: 110, w: 50 }, { x: 760, h: 150, w: 60 }, { x: 900, h: 120, w: 44 }, { x: 1030, h: 180, w: 60 }, { x: 1160, h: 120, w: 50 }], 5, 12, 5), 'url(#mt2)');
    // distant town along the far shore
    let town = '';
    for (let x = 520; x < w; x += 26 + R() * 40) {
      const bw = 24 + R() * 46, bh = 18 + R() * 56;
      town += Rr(x, 1586 - bh, bw, bh + 6, '#0c141e') + P(`M${f1(x - 6)} ${f1(1588 - bh)}L${f1(x + bw / 2)} ${f1(1576 - bh)}L${f1(x + bw + 6)} ${f1(1588 - bh)}Z`, '#6a4a22');
      if (R() > 0.3) town += Rr(x + bw * 0.3, 1590 - bh * 0.6, 5, 5, '#ffc46a', op(0.9));
      if (R() > 0.5) town += C(f1(x + bw * 0.7), f1(1586 - bh * 0.3), 3, '#ffb04a');
    }
    s += town;
    // sea
    s += Rr(0, 1588, w, h - 1588, 'url(#sea)') + Rr(0, 1588, w, 3, '#ffd28a', op(0.25));
    s += glitter(R, 840, 1596, 620, 150, '#fff2c8', 0.75, 0.25, 34);
    // lantern reflections under the far shore
    for (let i = 0; i < 16; i++) { const x = 540 + R() * 660; s += Rr(x, 1596 + R() * 10, 3 + R() * 6, 50 + R() * 90, 'url(#refl)', op(f1(0.3 + R() * 0.4))); }
    // left cliff with terraces
    s += P('M0 1100C60 1090 110 1092 150 1104H384C430 1124 452 1176 456 1240L472 1266C500 1300 520 1350 526 1400L548 1426C580 1466 600 1530 612 1580L660 1606L0 1640Z', 'url(#rk)') +
      S('M392 1150Q420 1190 430 1240M480 1300Q500 1340 506 1390M560 1470Q580 1510 590 1560', '#5a6a78', 4, 0.3);
    // pagoda (Yujing Terrace) on top
    s += bld(160, 1112, 180, 84, 50, R) + bld(185, 978, 130, 62, 44, R) + bld(210, 872, 80, 50, 38, R) +
      P('M246 784H254V734L250 726L246 734Z', '#e8b24a') + C(250, 730, 6, '#ffd27a') +
      bld(20, 1112, 110, 64, 40, R) + bld(372, 1112, 52, 48, 30, R);
    // terraces
    s += Rr(0, 1280, 474, 20, '#2a3640') + bld(14, 1280, 140, 84, 50, R) + bld(178, 1280, 110, 72, 44, R) + bld(312, 1280, 128, 88, 52, R);
    s += Rr(0, 1436, 552, 20, '#2a3640') + bld(4, 1436, 160, 92, 56, R) + bld(190, 1436, 124, 78, 48, R) + bld(340, 1436, 170, 98, 60, R);
    s += Rr(0, 1600, 664, 24, '#34404a') + bld(30, 1600, 130, 74, 46, R) + bld(186, 1600, 176, 88, 56, R) + bld(392, 1600, 140, 76, 48, R);
    // lantern garlands along the terraces
    const garland = (x0, x1, y, sag, n, sc) => {
      let g = S(`M${x0} ${y}Q${(x0 + x1) / 2} ${y + sag * 2} ${x1} ${y}`, '#1a1210', 2, 0.8);
      for (let i = 1; i < n; i++) { const t = i / n; g += use('L', x0 + (x1 - x0) * t, y + 4 * sag * t * (1 - t) + 14, sc); }
      return g;
    };
    s += garland(0, 470, 1180, 26, 8, 0.8) + garland(0, 548, 1336, 28, 9, 0.9) + garland(0, 660, 1494, 30, 10, 1) + garland(150, 350, 1012, 14, 4, 0.7);
    // lights on the water below the harbor front
    for (let i = 0; i < 18; i++) { const x = 20 + R() * 620; s += Rr(x, 1626, 5 + R() * 8, 90 + R() * 200, 'url(#refl)', op(f1(0.35 + R() * 0.4))); }
    // boats: a junk with lanterns and two sampans
    const junk = G('translate(700 1772)',
      P('M-60-14L-72-236Q-20-222 22-204L16-14Z', '#3a2a2e') + P('M30-16L26-196Q64-186 92-170L88-16Z', '#33262a') + P('M-120-12L-124-150Q-96-142-74-132L-76-12Z', '#33262a') +
      S('M-70-200L18-184M-68-160L19-150M-66-118L19-112M-64-76L18-72M-62-40L17-38M28-160L90-146M28-120L89-112M28-80L88-76', '#5a464a', 3, 0.7) +
      S('M-72-236L-60-14M26-196L30-16', '#c8b090', 2, 0.35) +
      P('M-170 0Q-140 44-70 50H110Q160 42 190-16L130-6H-130Z', '#120c0c') + Rr(-70, -26, 70, 26, '#1e1414') + Rr(-56, -20, 16, 12, '#ffc46a') + Rr(-30, -20, 16, 12, '#ffb04a') +
      use('L', -150, -20, 1.2) + use('L', 170, -40, 1.2) + use('L', 70, -6, 0.9)) +
      Rr(560, 1826, 6, 120, 'url(#refl)', op(0.6)) + Rr(860, 1806, 6, 120, 'url(#refl)', op(0.6)) + E(700, 1830, 200, 10, '#000', op(0.3));
    const sampan = (x, y, sc) => G(`translate(${x} ${y}) scale(${sc})`, P('M-80 0Q-40 26 40 22Q70 18 90-8Q20 4-80 0Z', '#0e0a0a') + P('M-40-2Q-20-40 20-40Q40-38 50-4Z', '#1e1616') + S('M-10-40V-70', '#1e1616', 3) + use('L', -10, -76, 1) + Rr(-12, 26, 5, 80, 'url(#refl)', op(0.55)));
    s += junk + sampan(330, 1700, 0.8) + sampan(1060, 1690, 0.7) + sampan(980, 1960, 1.1);
    // floating lanterns rising over the harbor
    s += use('L', 420, 980, 0.7) + use('L', 520, 900, 0.5) + use('L', 600, 1060, 0.6) + use('L', 360, 860, 0.45);
    return wrap(w, h, harborDefs() + harborFgDefs(), s + `<rect width="${w}" height="${h}" fill="url(#vig)"/>` + fg);
  }
  const harborFgDefs = () =>
    lg('post', [[0, '#5a3a28'], [0.4, '#3a2618'], [1, '#1a100a']], 0, 0, 1, 0) + lg('rail', [[0, '#5a3e2c'], [1, '#22160e']]) +
    lgu('deck', [[0, '#24180f'], [1, '#0a0705']], 0, 2390, 0, 2622) + lg('rod', [[0, '#2a2e36'], [0.5, '#5a606c'], [1, '#14161a']], 0, 0, 1, 0) +
    rg('lglow', [[0, '#ffb34a', 0.55], [0.4, '#ff7a2a', 0.18], [1, '#ff7a2a', 0]]) + rg('lbody', [[0, '#ffe08a'], [0.35, '#ff8a3a'], [0.8, '#d8322a'], [1, '#8a1612']], 0.45, 0.4, 0.6);
  const harborDefs = () =>
    lgu('sky', [[0, '#050c1e'], [0.3, '#0b1834'], [0.62, '#18304e'], [0.86, '#33465c'], [1, '#5a5054']], 0, 0, 0, 1640) +
    rg('warm', [[0, '#ffb060', 0.35], [1, '#ffb060', 0]]) + rg('halo', [[0, '#ffeec8', 0.45], [0.3, '#ffe0a8', 0.12], [1, '#ffe0a8', 0]]) +
    rg('moon', [[0, '#fffdf2'], [0.75, '#fbefcc'], [1, '#ecd9a6']], 0.42, 0.4, 0.62) +
    lgu('mt1', [[0, '#1c2d46'], [1, '#33435a']], 0, 1220, 0, 1600) + lgu('mt2', [[0, '#132036'], [1, '#22324a']], 0, 1400, 0, 1600) +
    lgu('sea', [[0, '#1c3448'], [0.3, '#0f2236'], [1, '#04101c']], 0, 1588, 0, 2622) +
    lgu('rk', [[0, '#1a2632'], [1, '#0a1118']], 0, 1100, 0, 1640) + lg('rf', [[0, '#f6c75a'], [0.6, '#c8902e'], [1, '#6a4416']]) +
    lg('refl', [[0, '#ffc46a', 0.9], [1, '#ffc46a', 0]]) +
    rg('vig', [[0, '#000', 0], [0.7, '#000', 0], [1, '#000', 0.45]], 0.5, 0.5, 0.75) +
    `<g id="L">${C(0, 0, 34, 'url(#lglow)')}${E(0, 0, 9, 11, '#e8452a')}${E(0, 0, 5, 7, '#ffd27a')}</g>`;

  def('wp_harbor_night', { title: 'Liyue Harbor at night', w: 1206, h: 2622, tags: ['wallpaper', 'liyue', 'night', 'default'], svg: (w, h) => harbor(w, h, false) });
  def('wp_harbor_night_fg', { title: 'Liyue Harbor at night (depth layer)', w: 1206, h: 2622, tags: ['wallpaper', 'depth'], svg: (w, h) => harbor(w, h, true) });

  /* =====================================================================
     wp_morepesok_snow: a fishing village by the frozen sea at dusk
     ===================================================================== */
  // wooden house with a snow-heavy gable roof, warm windows and a chimney
  function house(x, base, s, wall, R, smoke) {
    const w = 180 * s, hh = 112 * s, rh = 100 * s, y0 = base - hh;
    let o = Rr(x, y0, w, hh, wall) + Rr(x, y0, w, hh, 'url(#wsh)');
    o += S(`M${f1(x)} ${f1(y0 + hh * 0.33)}H${f1(x + w)}M${f1(x)} ${f1(y0 + hh * 0.66)}H${f1(x + w)}`, '#000', 2 * s, 0.15);
    const win = (wx) => C(f1(wx + 18 * s), f1(y0 + hh * 0.45), f1(46 * s), 'url(#wglow)') + Rr(wx, y0 + hh * 0.3, 36 * s, 34 * s, '#ffcf6a') + S(`M${f1(wx + 18 * s)} ${f1(y0 + hh * 0.3)}v${f1(34 * s)}M${f1(wx)} ${f1(y0 + hh * 0.3 + 17 * s)}h${f1(36 * s)}`, '#6a3a1a', 3 * s);
    o += win(x + 24 * s) + (R() > 0.3 ? win(x + w - 60 * s) : Rr(x + w - 56 * s, y0 + hh * 0.4, 30 * s, hh * 0.6, '#3a2418'));
    // chimney + smoke
    const cx = x + w * 0.7;
    o += Rr(cx, y0 - rh * 0.75, 20 * s, rh * 0.6, '#4a3a3a') + Rr(cx - 3 * s, y0 - rh * 0.8, 26 * s, 10 * s, '#f4f6ff');
    if (smoke) o += S(`M${f1(cx + 10 * s)} ${f1(y0 - rh * 0.85)}c${f1(-30 * s)} ${f1(-40 * s)} ${f1(30 * s)} ${f1(-70 * s)} 0 ${f1(-120 * s)}s${f1(30 * s)} ${f1(-60 * s)} ${f1(-10 * s)} ${f1(-110 * s)}`, '#e8e0f0', 14 * s, 0.35);
    // roof with a thick snow cap
    o += P(`M${f1(x - 16 * s)} ${f1(y0 + 4 * s)}L${f1(x + w / 2)} ${f1(y0 - rh)}L${f1(x + w + 16 * s)} ${f1(y0 + 4 * s)}Z`, '#3a2a2e') +
      P(`M${f1(x - 26 * s)} ${f1(y0 + 2 * s)}Q${f1(x - 30 * s)} ${f1(y0 - 14 * s)} ${f1(x - 10 * s)} ${f1(y0 - 16 * s)}L${f1(x + w / 2)} ${f1(y0 - rh - 14 * s)}L${f1(x + w + 10 * s)} ${f1(y0 - 16 * s)}Q${f1(x + w + 30 * s)} ${f1(y0 - 14 * s)} ${f1(x + w + 26 * s)} ${f1(y0 + 2 * s)}Q${f1(x + w * 0.75)} ${f1(y0 - 8 * s)} ${f1(x + w / 2)} ${f1(y0 - rh + 20 * s)}Q${f1(x + w * 0.25)} ${f1(y0 - 8 * s)} ${f1(x - 26 * s)} ${f1(y0 + 2 * s)}Z`, 'url(#snowr)');
    o += P(`M${f1(x - 10 * s)} ${f1(base)}Q${f1(x + w / 2)} ${f1(base - 26 * s)} ${f1(x + w + 10 * s)} ${f1(base)}Z`, '#eef0fa');
    return o;
  }
  const pine = (x, base, s) => {
    let o = Rr(x - 6 * s, base - 30 * s, 12 * s, 34 * s, '#2a1e1e');
    for (let i = 0; i < 4; i++) {
      const y = base - 24 * s - i * 50 * s, ww = (70 - i * 14) * s;
      o += P(`M${f1(x - ww)} ${f1(y)}L${f1(x)} ${f1(y - 80 * s)}L${f1(x + ww)} ${f1(y)}Z`, '#1e3440') +
        P(`M${f1(x - ww)} ${f1(y)}Q${f1(x - ww * 0.4)} ${f1(y - 16 * s)} ${f1(x)} ${f1(y - 10 * s)}Q${f1(x + ww * 0.5)} ${f1(y - 20 * s)} ${f1(x + ww)} ${f1(y)}Q${f1(x)} ${f1(y - 4 * s)} ${f1(x - ww)} ${f1(y)}Z`, '#f2f4fc');
    }
    return o + P(`M${f1(x - 14 * s)} ${f1(base - 214 * s)}L${f1(x)} ${f1(base - 244 * s)}L${f1(x + 14 * s)} ${f1(base - 214 * s)}Z`, '#f2f4fc');
  };
  def('wp_morepesok_snow', {
    title: 'Morepesok in the snow', w: 1206, h: 2622, tags: ['wallpaper', 'snezhnaya', 'snow', 'morepesok'],
    svg: (w, h) => {
      const R = rng(23);
      let s = Rr(0, 0, w, 1500, 'url(#sky)') + E(420, 1470, 760, 300, 'url(#sun)');
      s += stars(R, 34, 0, 0, w, 700, 0.8, 2.4, '#fff', 0.7) + C(930, 300, 34, '#fff6e8', op(0.9)) + C(946, 290, 30, '#2e3c74');
      // far mountains
      s += P(ridge(w, 1480, 1530, [{ x: 120, h: 120, w: 160 }, { x: 420, h: 70, w: 120 }, { x: 760, h: 150, w: 180 }, { x: 1100, h: 110, w: 150 }], 41, 12, 5), '#a898c4') +
        P(ridge(w, 1480, 1530, [{ x: 120, h: 120, w: 160 }, { x: 760, h: 150, w: 180 }, { x: 1100, h: 110, w: 150 }], 41, 12, 5), 'url(#mts)');
      // frozen sea
      s += Rr(0, 1478, w, 560, 'url(#ice)');
      for (let i = 0; i < 14; i++) { const y = 1500 + R() * 440, x = R() * w; s += S(`M${f1(x)} ${f1(y)}l${f1(60 + R() * 120)} ${f1(R() * 14 - 7)}l${f1(40 + R() * 80)} ${f1(R() * 20 - 10)}`, '#fff', 2.5, f1(0.3 + R() * 0.4)); }
      for (let i = 0; i < 10; i++) { const y = 1520 + R() * 400, x = R() * w; s += E(f1(x), f1(y), f1(40 + R() * 120), f1(4 + R() * 8), '#fdfcff', op(f1(0.4 + R() * 0.4))); }
      s += E(420, 1520, 300, 26, '#ffd8c0', op(0.35));
      // lighthouse on the point
      s += P('M860 1640Q960 1560 1206 1580V1680H840Z', '#e8ecf8') + P('M900 1600Q980 1572 1060 1590', 'none') +
        P('M1012 1600L1022 1390H1066L1076 1600Z', '#f4f4f8') + P('M1015 1540H1073L1071 1500H1017ZM1019 1460H1069L1067 1424H1021Z', '#c8323c') +
        Rr(1014, 1366, 60, 26, '#2a2a3a') + Rr(1024, 1370, 40, 18, '#ffe08a') + P('M1008 1366L1044 1340L1080 1366Z', '#c8323c') +
        C(1044, 1380, 120, 'url(#wglow)') + P('M1044 1376L700 1300L700 1440Z', '#fff2c0', op(0.12));
      // frozen-in boats
      const boat = (x, y, sc, f) => G(`translate(${x} ${y}) scale(${sc * f} ${sc})`, P('M-90-10Q-60 30 40 26Q80 20 100-24L70-14H-80Z', '#5a3a34') + P('M-86-12Q-40-30 40-26Q76-24 96-26L70-14H-80Z', '#f6f8ff') + S('M-10-24V-140', '#3a2a28', 5) + S('M-10-140L60-30', '#3a2a28', 2, 0.6) + E(0, 30, 120, 10, '#c8d0ec', op(0.6)));
      s += boat(540, 1700, 0.9, 1) + boat(250, 1620, 0.6, -1);
      // village: far row, middle row, near row
      s += P('M0 1760Q300 1640 700 1700Q900 1730 1206 1700V2622H0Z', '#dfe3f4');
      s += house(40, 1740, 0.55, '#7a3a34', R, true) + house(170, 1726, 0.5, '#3a5a6a', R, false) + house(300, 1736, 0.52, '#8a6a3a', R, true) + house(700, 1742, 0.5, '#5a3a4a', R, false) + house(830, 1752, 0.55, '#7a3a34', R, true);
      s += pine(470, 1760, 0.6) + pine(640, 1770, 0.5) + pine(1150, 1740, 0.7);
      s += P('M0 1990Q400 1880 760 1930Q1000 1960 1206 1900V2622H0Z', '#e8ebf8');
      s += house(-20, 1990, 0.85, '#8a3a32', R, true) + house(220, 1960, 0.8, '#3d5f72', R, true) + house(820, 1980, 0.85, '#6a4a2e', R, true) + house(1040, 1950, 0.75, '#7a3a44', R, false);
      s += pine(500, 1990, 0.9) + pine(620, 2010, 0.75);
      // jetty into the ice
      s += P('M420 1960L520 1820H560L500 1960Z', '#4a3a3a') + S('M470 1900L540 1830', '#f4f6ff', 6, 0.9);
      // near snow bank, fence, footprints
      s += P('M0 2190Q300 2110 640 2150Q920 2180 1206 2120V2622H0Z', 'url(#snow)');
      for (let i = 0; i < 9; i++) { const x = 60 + i * 64, y = 2168 - i * 2; s += Rr(x, y - 70, 12, 76, '#5a4642') + Rr(x - 2, y - 76, 16, 8, '#fff'); }
      s += S('M60 2120Q300 2096 580 2110M60 2146Q300 2122 580 2136', '#5a4642', 5, 0.9);
      for (let i = 0; i < 8; i++) { const t = i / 8; s += E(f1(760 + t * 160 + (i % 2) * 22), f1(2560 - t * 380), f1(10 - t * 5), f1(6 - t * 3), '#b8c0dc', op(0.7)); }
      s += pine(1120, 2230, 1.2);
      // falling snow
      for (let i = 0; i < 90; i++) s += C(f1(R() * w), f1(R() * h), f1(1.5 + R() * R() * 5), '#fff', op(f1(0.35 + R() * 0.55)));
      return wrap(w, h,
        lgu('sky', [[0, '#1b2754'], [0.3, '#36478a'], [0.55, '#8a7ab4'], [0.78, '#e4a8b8'], [0.92, '#ffcfa8'], [1, '#ffe2c0']], 0, 0, 0, 1500) +
        rg('sun', [[0, '#fff0d0', 0.8], [1, '#ffd0a8', 0]]) + lgu('mts', [[0, '#c8b8e0', 0], [1, '#f4d6dc', 0.9]], 0, 1330, 0, 1500) +
        lgu('ice', [[0, '#e8c8d0'], [0.25, '#c4c6e4'], [1, '#9fb2dc']], 0, 1478, 0, 2040) + lg('wsh', [[0, '#000', 0], [1, '#000', 0.35]]) +
        rg('wglow', [[0, '#ffc860', 0.6], [1, '#ffc860', 0]]) + lg('snowr', [[0, '#ffffff'], [1, '#c8d0ec']]) +
        lgu('snow', [[0, '#f6f7fd'], [1, '#c4cbe6']], 0, 2100, 0, 2622),
        s);
    },
  });

  /* =====================================================================
     wp_glaze_lily: glaze lilies at dawn over Qingce's terraced fields
     ===================================================================== */
  def('wp_glaze_lily', {
    title: 'Glaze lilies at dawn', w: 1206, h: 2622, tags: ['wallpaper', 'liyue', 'flowers', 'qingce', 'dawn'],
    svg: (w, h) => {
      const R = rng(5);
      let s = Rr(0, 0, w, 1500, 'url(#sky)') + C(760, 1330, 700, 'url(#sun)') + C(760, 1330, 60, '#fffbea', op(0.95));
      s += E(380, 820, 340, 30, '#fff', op(0.18)) + E(900, 960, 300, 22, '#fff', op(0.16));
      // karst pinnacles in three misty layers
      s += P(ridge(w, 1360, 1500, [{ x: 60, h: 300, w: 50 }, { x: 200, h: 420, w: 46 }, { x: 330, h: 260, w: 40 }, { x: 480, h: 380, w: 44 }, { x: 640, h: 220, w: 50 }, { x: 900, h: 400, w: 46 }, { x: 1040, h: 300, w: 40 }, { x: 1170, h: 440, w: 50 }], 8, 10, 4), 'url(#m1)');
      s += P(ridge(w, 1420, 1520, [{ x: 0, h: 220, w: 80 }, { x: 150, h: 260, w: 50 }, { x: 390, h: 300, w: 50 }, { x: 560, h: 170, w: 60 }, { x: 980, h: 250, w: 46 }, { x: 1110, h: 200, w: 60 }], 9, 10, 4), 'url(#m2)');
      s += E(603, 1450, 800, 60, '#fff4ec', op(0.5));
      // terraced hillside: water-filled paddies mirroring the dawn sky
      s += P('M0 1500Q300 1440 620 1480Q900 1510 1206 1460V2622H0Z', '#5f8c58');
      let ty = 1500;
      for (let i = 0; i < 12; i++) {
        const gap = 34 + i * 12, bow = 30 + i * 6, tilt = (i % 2 ? -1 : 1) * (20 + i * 3);
        const y1 = ty + gap * 0.62;
        s += P(`M-20 ${f1(ty + tilt)}Q603 ${f1(ty - bow)} 1226 ${f1(ty - tilt)}L1226 ${f1(y1 - tilt)}Q603 ${f1(y1 - bow)} -20 ${f1(y1 + tilt)}Z`, 'url(#pad)', op(f1(0.95 - i * 0.03))) +
          S(`M-20 ${f1(y1 + tilt)}Q603 ${f1(y1 - bow)} 1226 ${f1(y1 - tilt)}`, '#3f6a3e', f1(4 + i * 0.8), 0.9) +
          S(`M-20 ${f1(ty + tilt + 2)}Q603 ${f1(ty - bow + 2)} 1226 ${f1(ty - tilt + 2)}`, '#fff6dc', 2, 0.6);
        ty += gap;
      }
      // Qingce: windwheel and a pavilion on the left hill, the old tree on the right
      s += P('M0 1500Q120 1420 280 1450Q330 1470 360 1500Z', '#4a7a4c') +
        P('M204 1460L214 1330H226L236 1460Z', '#6a5040') + G('translate(220 1334)', S('M-62-40L62 40M-62 40L62-40', '#7a5a40', 6) + P('M0 0L-58-60L-40-66ZM0 0L58 60L40 66ZM0 0L58-60L66-40ZM0 0L-58 60L-66 40Z', '#f2ead8', op(0.9)) + C(0, 0, 8, '#4a3428')) +
        P('M86 1466H156V1440H86Z', '#5a2a24') + P('M72 1442Q120 1424 170 1442L150 1420H92Z', '#c8402c');
      s += P('M930 1470Q1060 1420 1206 1440V1500H900Z', '#4a7a4c') + Rr(1030, 1340, 18, 120, '#4a3428') +
        C(1040, 1320, 70, '#3e6a42') + C(990, 1350, 46, '#4a7a4c') + C(1090, 1346, 50, '#4a7a4c') + C(1040, 1290, 44, '#5a8a54');
      // light motes
      for (let i = 0; i < 30; i++) s += C(f1(R() * w), f1(1100 + R() * 1200), f1(1.5 + R() * 3.5), '#fff8e0', op(f1(0.3 + R() * 0.5)));
      // glaze lilies in the foreground
      const lily = (x, y, sc, rot) => `<use href="#lily" transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"/>`;
      const stem = (d, wd) => S(d, '#3e6a44', wd);
      const leaf = (x, y, len, rot, flip) => G(`translate(${x} ${y}) rotate(${rot}) scale(${flip} 1)`, P(`M0 0Q24-${len * 0.5} 6-${len}Q-8-${len * 0.5} 0 0Z`, 'url(#leaf)'));
      s += C(240, 1840, 260, 'url(#lglow)') + C(980, 1980, 220, 'url(#lglow)');
      s += leaf(110, 2622, 640, -8, 1) + leaf(170, 2622, 520, 10, -1) + leaf(60, 2622, 420, -20, 1) + leaf(1110, 2622, 560, 12, -1) + leaf(1040, 2622, 460, -6, 1) + leaf(1170, 2622, 380, 22, 1);
      s += stem('M140 2622Q120 2200 230 1700', 12) + stem('M230 1700Q270 1660 300 1700', 6) + stem('M196 1920Q140 1880 108 1920', 6) + stem('M168 2160Q230 2120 268 2150', 6);
      s += lily(300, 1700, 1.15, -6) + lily(230, 1700, 0.95, 18) + lily(108, 1920, 1.05, 8) + lily(268, 2150, 0.9, -10);
      s += stem('M1080 2622Q1110 2240 990 1860', 11) + stem('M990 1860Q950 1830 920 1870', 6) + stem('M1050 2120Q1110 2090 1140 2120', 6);
      s += lily(920, 1870, 1.1, 10) + lily(995, 1862, 0.85, -14) + lily(1140, 2120, 0.95, -6);
      // dew sparkles
      [[330, 1840], [140, 2060], [960, 2010], [1150, 2260]].forEach(([x, y]) => { s += P(`M${x} ${y - 16}Q${x} ${y} ${x + 16} ${y}Q${x} ${y} ${x} ${y + 16}Q${x} ${y} ${x - 16} ${y}Q${x} ${y} ${x} ${y - 16}Z`, '#fff', op(0.85)); });
      const lilyDef =
        `<g id="lily">` +
        S('M0-30Q0-10 0 0', '#3e6a44', 5) +
        P('M0 0C-34 6-62 66-74 126Q-58 112-46 130Q-26 100-2 112Q22 100 44 130Q56 112 74 126C62 66 34 6 0 0Z', 'url(#pb)') +
        P('M0 4C-24 18-40 80-38 128Q-22 114-10 138Q0 122 10 138Q22 114 38 128C40 80 24 18 0 4Z', 'url(#pf)') +
        S('M-12 26Q-22 70-24 118M12 26Q22 70 24 118', '#fff', 2.5, 0.6) +
        S('M-6 112L-12 150M0 114V158M6 112L12 150', '#f2e2a0', 2.5) + C(-12, 150, 4, '#ffe9a0') + C(0, 158, 4, '#ffe9a0') + C(12, 150, 4, '#ffe9a0') +
        P('M-12-2Q0 18 12-2Q0 6-12-2Z', '#5a8a5a') + `</g>`;
      return wrap(w, h,
        lgu('sky', [[0, '#5070b0'], [0.28, '#7f98cc'], [0.52, '#c4b6da'], [0.72, '#f4c4c4'], [0.88, '#ffd9b0'], [1, '#fff0cc']], 0, 0, 0, 1500) +
        rg('sun', [[0, '#fff8e0', 0.9], [0.25, '#ffe8c0', 0.45], [1, '#ffd8c0', 0]]) +
        lgu('m1', [[0, '#a0a4d4'], [1, '#e8cad4']], 0, 940, 0, 1500) + lgu('m2', [[0, '#8890c4'], [1, '#d8c4d4']], 0, 1160, 0, 1520) +
        lg('pad', [[0, '#ffe2c0'], [0.5, '#f4c8c8'], [1, '#b8c4e4']]) + lg('leaf', [[0, '#7aa86a'], [1, '#2f5a38']]) +
        lg('pb', [[0, '#cfe2f8'], [0.6, '#9cc0ea'], [1, '#e8f2ff']]) + lg('pf', [[0, '#ffffff'], [0.6, '#e4f0ff'], [1, '#bcd6f4']]) +
        rg('lglow', [[0, '#eaf4ff', 0.55], [1, '#eaf4ff', 0]]) + lilyDef,
        s);
    },
  });

  /* =====================================================================
     wp_hydro: abstract deep-blue water swirl with light caustics
     ===================================================================== */
  def('wp_hydro', {
    title: 'Hydro', w: 1206, h: 2622, tags: ['wallpaper', 'abstract', 'hydro', 'blue'],
    svg: (w, h) => {
      const R = rng(31);
      const cx = 603, cy = 1640;
      let s = Rr(0, 0, w, h, 'url(#bg)') + C(cx, cy, 900, 'url(#core)');
      // light rays from the surface
      [[200, 120, -0.18], [520, 160, -0.08], [820, 110, 0.06], [1050, 140, 0.16]].forEach(([x, wd, k]) => {
        s += P(`M${x - wd / 2} 0H${x + wd / 2}L${f1(x + wd * 1.6 + k * 2600)} 2622H${f1(x - wd * 1.6 + k * 2600)}Z`, 'url(#ray)');
      });
      // spiral arms
      const arm = (a0, k, r0s, turns, width, col, o) => {
        let d = '';
        const n = Math.round(turns * 16);
        for (let i = 0; i <= n; i++) {
          const th = (i / n) * turns * Math.PI * 2;
          const r = r0s * Math.exp(k * th);
          const x = cx + Math.cos(th + a0) * r, y = cy + Math.sin(th + a0) * r * 0.86;
          d += (i ? 'L' : 'M') + f1(x) + ' ' + f1(y);
        }
        return S(d, col, width, o);
      };
      for (let i = 0; i < 6; i++) {
        const a0 = (i / 6) * Math.PI * 2;
        s += arm(a0, 0.2, 34, 2.3, 70, 'url(#sw)', 0.28) + arm(a0 + 0.12, 0.2, 34, 2.3, 18, '#9be3ff', 0.22) + arm(a0 - 0.2, 0.2, 30, 2.1, 6, '#e2f8ff', 0.3);
      }
      s += C(cx, cy, 120, 'url(#glow)') + C(cx, cy, 26, '#e8fbff', op(0.9));
      // caustic net near the surface, fading with depth
      s += `<rect width="${w}" height="1500" fill="url(#cau)" mask="url(#fade)"/>`;
      // bubbles
      for (let i = 0; i < 26; i++) {
        const x = 880 + R() * 220 + Math.sin(i) * 30, y = 900 + R() * 1500, r = 4 + R() * R() * 22;
        s += C(f1(x), f1(y), f1(r), '#bfefff', op(0.12) + ` stroke="#bfefff" stroke-width="2" stroke-opacity=".55"`) + C(f1(x - r * 0.35), f1(y - r * 0.35), f1(r * 0.25), '#fff', op(0.7));
      }
      for (let i = 0; i < 40; i++) s += C(f1(R() * w), f1(600 + R() * 2000), f1(1 + R() * 2.5), '#cfefff', op(f1(0.2 + R() * 0.5)));
      // caustic tile: soft cells whose rims make the light web
      const T = 300;
      let cells = '';
      const pts = [];
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) pts.push([i * 100 + 50 + (R() - 0.5) * 40, j * 100 + 50 + (R() - 0.5) * 40]);
      pts.forEach(([x, y]) => {
        let d = '';
        const n = 6;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2 + R() * 0.3, rr = 40 + R() * 16;
          const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
          d += (i ? 'L' : 'M') + f1(px) + ' ' + f1(py);
        }
        cells += S(d + 'Z', '#bff4ff', f1(3 + R() * 4), 0.6);
      });
      return wrap(w, h,
        lgu('bg', [[0, '#020c1e'], [0.35, '#04234e'], [0.7, '#0a3f80'], [1, '#05224a']], 0, 0, 0, 2622) +
        rg('core', [[0, '#3aa0e6', 0.55], [0.45, '#1d5fa8', 0.25], [1, '#1d5fa8', 0]]) +
        rg('glow', [[0, '#e8fbff', 0.9], [0.4, '#7fd4ff', 0.4], [1, '#3aa0e6', 0]]) +
        `<radialGradient id="sw" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="760">${stops([[0, '#c9f2ff'], [0.4, '#3aa0e6'], [1, '#1d5fa8', 0]])}</radialGradient>` +
        lg('ray', [[0, '#bfefff', 0.16], [0.6, '#bfefff', 0.04], [1, '#bfefff', 0]]) +
        `<pattern id="cau" width="${T}" height="${T}" patternUnits="userSpaceOnUse" patternTransform="scale(1.6 1) rotate(-8)">${cells}</pattern>` +
        `<mask id="fade"><rect width="${w}" height="1500" fill="url(#fm)"/></mask>` +
        lgu('fm', [[0, '#fff', 0.35], [0.45, '#fff', 0.6], [1, '#fff', 0]], 0, 0, 0, 1500),
        s);
    },
  });

  /* =====================================================================
     wp_teucer_drawing: Teucer's crayon drawing of his big brother
     ===================================================================== */
  // stroke font for the letters a child would print (box 60 × 100)
  const GLYPH = {
    M: 'M0 100L4 0L30 62L56 0L60 100', Y: 'M0 0L30 48L60 0M30 48V100', B: 'M2 0V100M2 0H34Q58 2 58 24Q58 46 32 48H2M32 48Q62 50 62 74Q62 100 34 100H2',
    R: 'M2 100V0H34Q60 2 60 26Q60 50 32 50H2M28 50L60 100', O: 'M30 0C70 0 70 100 30 100C-10 100-10 0 30 0Z', T: 'M0 2H60M30 2V100',
    H: 'M2 0V100M58 0V100M2 50H58', E: 'M58 2H2V100H58M2 50H44', S: 'M58 14Q50 0 30 0Q2 0 2 24Q2 46 30 50Q60 54 60 78Q60 100 30 100Q8 100 0 86',
    L: 'M2 0V100H56', U: 'M2 0V70Q2 100 30 100Q58 100 58 70V0', C: 'M58 16Q50 0 30 0Q0 0 0 50Q0 100 30 100Q50 100 58 84',
  };
  function word(str, x, y, size, cols, R, mirror = -1) {
    let s = '';
    const k = size / 100;
    [...str].forEach((ch, i) => {
      if (ch === ' ') { x += 50 * k; return; }
      const rot = f1((R() - 0.5) * 16), dy = f1((R() - 0.5) * 18 * k), sc = f1(k * (0.92 + R() * 0.16) * 100) / 100;
      const flip = i === mirror ? ' scale(-1 1) translate(-60 0)' : '';
      s += `<path d="${GLYPH[ch]}" fill="none" stroke="${cols[i % cols.length]}" stroke-width="${f1(15 / sc)}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${f1(x)} ${f1(y + dy)}) rotate(${rot} 30 50) scale(${sc})${flip}"/>`;
      x += 84 * k;
    });
    return s;
  }
  def('wp_teucer_drawing', {
    title: "Teucer's drawing", w: 1206, h: 2622, tags: ['wallpaper', 'teucer', 'drawing', 'family'],
    svg: (w, h) => {
      const R = rng(8);
      const crayon = (d, c, wd, o = 0.9) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
      const scrib = (x0, y0, x1, y1, step, c, wd, o) => {
        let d = `M${x0} ${y0}`;
        for (let y = y0, i = 0; y < y1; y += step, i++) d += `L${f1((i % 2 ? x0 : x1) + (R() - 0.5) * 30)} ${f1(y + step * 0.5 + (R() - 0.5) * 8)}`;
        return crayon(d, c, wd, o);
      };
      let paper = Rr(0, 0, w, h, '#fbf6ea') + Rr(0, 0, w, h, 'url(#pv)') + S('M0 1310Q603 1300 1206 1316', '#d8cfbc', 3, 0.5);
      let d = '';
      // sky coloured in blue, with the sun in the corner
      d += scrib(-10, -10, 1216, 820, 30, '#4a86dc', 46, 0.85) + scrib(-10, 20, 1216, 760, 44, '#6aa0ec', 30, 0.5);
      d += `<circle cx="1050" cy="200" r="118" fill="#ffd23a"/>` + scrib(950, 110, 1150, 300, 22, '#ffb21a', 22, 0.8) + crayon('M1050 200m-118 0a118 118 0 1 0 236 0a118 118 0 1 0 -236 0', '#ff9a1a', 12);
      for (let i = 0; i < 9; i++) { const a = (90 + i * 22) * Math.PI / 180; d += crayon(`M${f1(1050 + Math.cos(a) * 140)} ${f1(200 + Math.sin(a) * 140)}L${f1(1050 + Math.cos(a) * 210)} ${f1(200 + Math.sin(a) * 210)}`, '#ffb21a', 14); }
      d += C(1016, 180, 10, '#7a4a1a') + C(1084, 180, 10, '#7a4a1a') + crayon('M1010 228Q1050 262 1090 228', '#d8502a', 9);
      // the words
      d += word('MY BROTHER', 120, 930, 108, ['#e2302a', '#ff8a1a', '#2a7ad8', '#2aa04a', '#8a3ac8'], R) + word('SELLS TOYS', 150, 1100, 108, ['#2a7ad8', '#e2302a', '#2aa04a', '#ff8a1a', '#8a3ac8'], R, 9);
      // big brother: orange hair, red scarf, blue eyes, big smile
      const hx = 520, hy = 1450;
      d += `<circle cx="${hx}" cy="${hy}" r="104" fill="#ffd8b8" opacity=".9"/>` + crayon(`M${hx} ${hy}m-104 0a104 104 0 1 0 208 0a104 104 0 1 0 -208 0`, '#7a4a2a', 9);
      d += P(`M${hx - 120} ${hy - 20}L${hx - 110} ${hy - 90}L${hx - 80} ${hy - 70}L${hx - 70} ${hy - 140}L${hx - 30} ${hy - 96}L${hx} ${hy - 160}L${hx + 30} ${hy - 100}L${hx + 74} ${hy - 146}L${hx + 84} ${hy - 80}L${hx + 124} ${hy - 96}L${hx + 116} ${hy - 30}Q${hx} ${hy - 110} ${hx - 120} ${hy - 20}Z`, '#ff7a1a', op(0.9)) +
        scrib(hx - 110, hy - 140, hx + 116, hy - 50, 16, '#e8601a', 12, 0.7);
      d += C(hx - 38, hy + 6, 15, '#2a6ad8') + C(hx + 38, hy + 6, 15, '#2a6ad8') + crayon(`M${hx - 52} ${hy + 46}Q${hx} ${hy + 96} ${hx + 52} ${hy + 46}`, '#c8302a', 10) +
        C(hx - 66, hy + 40, 14, '#ff8a8a', op(0.6)) + C(hx + 66, hy + 40, 14, '#ff8a8a', op(0.6));
      d += crayon(`M${hx} ${hy + 104}V${hy + 430}`, '#4a4a5a', 14) + crayon(`M${hx - 60} ${hy + 120}Q${hx} ${hy + 150} ${hx + 60} ${hy + 120}M${hx + 40} ${hy + 130}L${hx + 80} ${hy + 230}`, '#e2302a', 22);
      d += crayon(`M${hx} ${hy + 210}L${hx - 170} ${hy + 120}M${hx} ${hy + 210}L${hx + 200} ${hy + 290}`, '#4a4a5a', 13) +
        crayon(`M${hx} ${hy + 430}L${hx - 110} ${hy + 640}M${hx} ${hy + 430}L${hx + 100} ${hy + 640}`, '#4a4a5a', 13) + crayon(`M${hx - 140} ${hy + 640}H${hx - 90}M${hx + 80} ${hy + 640}H${hx + 130}`, '#2a2a3a', 18);
      // fishing rod in his hand, with a fish on the line
      d += crayon(`M${hx - 170} ${hy + 120}L${hx - 330} ${hy - 140}`, '#8a5a2a', 10) + crayon(`M${hx - 330} ${hy - 140}Q${hx - 380} ${hy - 40} ${hx - 360} ${hy + 30}`, '#555', 4);
      // Teucer (ME) holding his hand
      const tx = 830, ty = 1780;
      d += `<circle cx="${tx}" cy="${ty}" r="64" fill="#ffd8b8" opacity=".9"/>` + crayon(`M${tx} ${ty}m-64 0a64 64 0 1 0 128 0a64 64 0 1 0 -128 0`, '#7a4a2a', 8) +
        P(`M${tx - 70} ${ty - 14}Q${tx - 70} ${ty - 96} ${tx} ${ty - 98}Q${tx + 70} ${ty - 96} ${tx + 70} ${ty - 14}Z`, '#2a6ad8', op(0.9)) + C(tx, ty - 104, 18, '#fff', ' stroke="#2a6ad8" stroke-width="6"') +
        C(tx - 22, ty + 4, 9, '#2a6ad8') + C(tx + 22, ty + 4, 9, '#2a6ad8') + crayon(`M${tx - 26} ${ty + 30}Q${tx} ${ty + 54} ${tx + 26} ${ty + 30}`, '#c8302a', 8) +
        crayon(`M${tx} ${ty + 64}V${ty + 250}M${tx} ${ty + 120}L${hx + 200 + 4} ${hy + 290}M${tx} ${ty + 120}L${tx + 110} ${ty + 60}M${tx} ${ty + 250}L${tx - 60} ${ty + 380}M${tx} ${ty + 250}L${tx + 60} ${ty + 380}`, '#4a4a5a', 11);
      d += word('ME', tx - 40, ty - 300, 64, ['#8a3ac8'], R) + crayon(`M${tx} ${ty - 214}L${tx} ${ty - 140}M${tx - 20} ${ty - 164}L${tx} ${ty - 136}L${tx + 20} ${ty - 164}`, '#8a3ac8', 8);
      // heart between them
      d += P('M700 1580C700 1540 650 1530 640 1570C630 1530 580 1540 580 1580C580 1630 640 1660 640 1680C640 1660 700 1630 700 1580Z', '#e2302a', op(0.9));
      // toys: Sir Fang the ice wolf, a toy boat, a robot, a ball
      d += G('translate(210 1880)', `<ellipse cx="0" cy="0" rx="110" ry="60" fill="#cfe4ff"/>` + crayon('M-110 0a110 60 0 1 0 220 0a110 60 0 1 0 -220 0', '#2a6ad8', 8) + `<circle cx="96" cy="-60" r="48" fill="#cfe4ff"/>` + crayon('M96-60m-48 0a48 48 0 1 0 96 0a48 48 0 1 0 -96 0', '#2a6ad8', 8) +
        crayon('M64-96L70-150L98-104M110-102L136-146L140-92', '#2a6ad8', 8) + C(84, -64, 7, '#1a1a2a') + C(112, -64, 7, '#1a1a2a') + crayon('M-108-10Q-170-60-150-110', '#2a6ad8', 12) + crayon('M-70 50V96M-30 54V96M40 54V96M80 50V96', '#2a6ad8', 10)) +
        word('SIR FANG', 90, 2040, 40, ['#2a6ad8'], R);
      d += G('translate(190 1330)', P('M-90 0H90L60 50H-60Z', '#e2302a', op(0.85)) + crayon('M0 0V-130', '#7a4a2a', 8) + P('M6-126L80-20H6Z', '#ffd23a', op(0.9)) + crayon('M-120 70Q-60 50 0 70T120 70', '#4a86dc', 8));
      d += G('translate(990 1400)', `<rect x="-60" y="-40" width="120" height="130" fill="#b8c4d8" opacity=".9"/>` + crayon('M-60-40H60V90H-60Z', '#5a5a7a', 8) + `<rect x="-44" y="-130" width="88" height="80" fill="#b8c4d8" opacity=".9"/>` + crayon('M-44-130H44V-50H-44Z', '#5a5a7a', 8) +
        C(-18, -94, 9, '#e2302a') + C(18, -94, 9, '#e2302a') + crayon('M0-130V-170M-60 0L-110 40M60 0L110-40M-30 90V140M30 90V140', '#5a5a7a', 8) + C(0, -176, 10, '#ffd23a') + C(0, 20, 16, '#2aa04a'));
      d += `<circle cx="1000" cy="2010" r="56" fill="#ffd23a" opacity=".9"/>` + crayon('M944 2010a56 56 0 1 0 112 0a56 56 0 1 0 -112 0M948 1990Q1000 2030 1052 1990M1000 1954V2066', '#e2302a', 8);
      // fish
      const fish = (x, y, s, c, flip) => G(`translate(${x} ${y}) scale(${s * flip} ${s})`, P('M-60 0Q-20-44 40-14L80-40V40L40 14Q-20 44-60 0Z', c, op(0.88)) + crayon('M-60 0Q-20-44 40-14L80-40V40L40 14Q-20 44-60 0Z', '#3a3a4a', 6) + C(-32, -6, 7, '#1a1a2a'));
      d += fish(hx - 360, hy + 70, 0.8, '#ff8a1a', 1) + fish(120, 1620, 0.9, '#2aa04a', -1) + fish(1080, 1640, 0.9, '#ff8a1a', 1) + fish(700, 2140, 1, '#2a86e8', -1) + fish(380, 2180, 0.8, '#e2302a', 1);
      // grass
      let gr = 'M20 2112';
      for (let x = 20; x < 1190; x += 34) gr += `L${x + 17} ${2070 + R() * 20}L${x + 34} ${2112 + R() * 10}`;
      d += crayon(gr, '#2aa04a', 9, 0.85);
      // signature
      d += word('TEUCER', 820, 2210, 48, ['#e2302a', '#ff8a1a', '#2a7ad8'], R);
      const tape = (x, y, r) => `<rect x="${x - 90}" y="${y - 28}" width="180" height="56" fill="#f4e8c0" opacity=".7" transform="rotate(${r} ${x} ${y})"/>`;
      return wrap(w, h,
        rg('pv', [[0, '#fff', 0], [0.75, '#e8dcc4', 0.25], [1, '#c8b896', 0.6]], 0.5, 0.5, 0.75) +
        `<filter id="cr" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="2" seed="4" result="n"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
        `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 2.3" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>`,
        paper + `<g filter="url(#cr)">${d}</g>` + tape(110, 50, -14) + tape(1100, 60, 12));
    },
  });

  /* =====================================================================
     wp_guyun_storm: Guyun Stone Forest in a storm; something vast beneath
     ===================================================================== */
  function pillar(x, top, wd, base, col, rim, R) {
    const l = [], r = [];
    for (let y = top; y <= base; y += 70) {
      const t = (y - top) / (base - top);
      l.push([f1(x - wd / 2 - t * wd * 0.12 + (R() - 0.5) * wd * 0.08), y]);
      r.push([f1(x + wd / 2 + t * wd * 0.1 + (R() - 0.5) * wd * 0.08), y]);
    }
    l.push([f1(x - wd * 0.6), base]); r.push([f1(x + wd * 0.6), base]);
    const d = 'M' + l.map((p) => p.join(' ')).join('L') + 'L' + r.reverse().map((p) => p.join(' ')).join('L') + 'Z';
    let s = P(d, col);
    s += P(`M${f1(x - wd / 2)} ${top}Q${x} ${top - wd * 0.18} ${f1(x + wd / 2)} ${top}Q${x} ${top + 10} ${f1(x - wd / 2)} ${top}Z`, '#2a3a30');
    s += S(`M${f1(x + wd * 0.38)} ${top + 10}L${f1(x + wd * 0.44)} ${base}`, rim, f1(wd * 0.08), 0.55);
    for (let i = 0; i < 3; i++) s += S(`M${f1(x - wd * 0.3 + i * wd * 0.25)} ${f1(top + 40 + R() * 80)}V${f1(base - R() * 200)}`, '#000', 3, 0.25);
    return s;
  }
  def('wp_guyun_storm', {
    title: 'Guyun Stone Forest, storm', w: 1206, h: 2622, tags: ['wallpaper', 'liyue', 'storm', 'guyun', 'osial'],
    svg: (w, h) => {
      const R = rng(13);
      let s = Rr(0, 0, w, 1720, 'url(#sky)') + C(760, 980, 700, 'url(#flash)');
      // heavy clouds
      for (let i = 0; i < 26; i++) { const x = R() * w, y = 600 + R() * 760, rx = 140 + R() * 260; s += E(f1(x), f1(y), f1(rx), f1(rx * 0.34), i % 3 ? '#1a2632' : '#26364a', op(f1(0.5 + R() * 0.4))); }
      s += E(740, 900, 300, 70, '#5a6a8e', op(0.35)) + E(820, 960, 200, 40, '#8a9ac0', op(0.3));
      // lightning
      const bolt = 'M720 860L760 980L726 1000L800 1130L770 1146L850 1300';
      const fork = 'M760 980L700 1090L716 1100L680 1180M800 1130L870 1180';
      s += S(bolt, '#a8b8ff', 40, 0.12) + S(bolt, '#c8d4ff', 16, 0.35) + S(fork, '#c8d4ff', 8, 0.3) + S(bolt, '#fff', 5) + S(fork, '#f0f4ff', 2.5);
      // far pillars in rain haze
      s += P(ridge(w, 1720, 1760, [{ x: 70, h: 260, w: 26, p: 6 }, { x: 260, h: 180, w: 22, p: 6 }, { x: 470, h: 300, w: 28, p: 6 }, { x: 640, h: 200, w: 20, p: 6 }, { x: 980, h: 240, w: 24, p: 6 }, { x: 1120, h: 170, w: 22, p: 6 }], 2, 6, 3), '#24323e');
      // the sea
      s += Rr(0, 1700, w, h - 1700, 'url(#sea)');
      // something vast beneath the surface
      s += `<g filter="url(#bl)" opacity=".85"><path d="M-100 2560C100 2380 220 2180 420 2120C640 2050 820 2200 900 2360C960 2480 1100 2520 1300 2440V2622H-100Z" fill="#010304"/>` +
        `<path d="M260 2150C330 2080 470 2060 560 2100L520 2140C440 2120 350 2140 300 2190Z" fill="#000"/></g>` +
        E(470, 2160, 64, 11, 'url(#eye)') + E(470, 2160, 8, 9, '#000') +
        E(470, 2160, 200, 26, 'none', ' stroke="#8ab0b0" stroke-width="2" opacity=".18"') + E(470, 2160, 300, 40, 'none', ' stroke="#8ab0b0" stroke-width="2" opacity=".1"');
      // waves
      for (let i = 0; i < 70; i++) {
        const y = 1720 + Math.pow(R(), 1.4) * 860, x = R() * w, l = 30 + (y - 1700) * 0.12 * (0.6 + R());
        s += S(`M${f1(x)} ${f1(y)}q${f1(l / 2)} ${f1(-l * 0.16)} ${f1(l)} 0`, '#c8d4dc', f1(1.5 + (y - 1700) / 260), f1(0.15 + R() * 0.35));
      }
      // mid pillars
      s += pillar(360, 1440, 110, 1760, '#18222c', '#5a6a8a', R) + pillar(860, 1300, 150, 1790, '#141e28', '#9aaad8', R) + pillar(1010, 1520, 80, 1760, '#1a2430', '#5a6a8a', R);
      // near pillars framing the view
      s += pillar(70, 1040, 230, 1900, '#0c1218', '#6a7a9a', R) + pillar(1150, 1180, 200, 1900, '#0a1016', '#8a9ac0', R);
      s += E(70, 1900, 220, 26, '#d4e0e8', op(0.35)) + E(1150, 1900, 200, 22, '#d4e0e8', op(0.35)) + E(860, 1790, 150, 14, '#d4e0e8', op(0.3));
      // rain
      let rain = '';
      for (let i = 0; i < 110; i++) { const x = R() * (w + 300) - 150, y = R() * h, l = 50 + R() * 90; rain += `M${f1(x)} ${f1(y)}l${f1(-l * 0.22)} ${f1(l)}`; }
      s += S(rain, '#c8d8e8', 2, 0.22);
      return wrap(w, h,
        lgu('sky', [[0, '#04070c'], [0.35, '#0a121a'], [0.62, '#16202c'], [0.86, '#24303c'], [1, '#1e2a34']], 0, 0, 0, 1720) +
        rg('flash', [[0, '#9aa8d8', 0.45], [0.35, '#4a5a8a', 0.18], [1, '#4a5a8a', 0]]) +
        lgu('sea', [[0, '#22323e'], [0.25, '#121e28'], [1, '#04080c']], 0, 1700, 0, 2622) +
        rg('eye', [[0, '#ffe9a0'], [0.4, '#f0a030'], [1, '#6a3a10', 0]]) +
        `<filter id="bl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22"/></filter>`,
        s);
    },
  });
})();
