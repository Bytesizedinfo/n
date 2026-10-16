/* Photos 1 — tonight in Lanling (Koi Tower, the gala, the taxi, screenshots). 1200×900 unless noted. */
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
  const r0 = Math.round;
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
  const FONT = '-apple-system, Helvetica, Arial, sans-serif';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const grainDef = (id, fr) =>
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr || 0.8}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const grain = (id, w, h, op) => `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  const vig = (id, op) => rad(id, '.5 .5 .75', `#000 .55 0|#000 1 ${op}`);
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  // soft bokeh discs
  const bokeh = (R, n, x0, y0, x1, y1, rmin, rmax, ids, omin, omax) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const id = ids[Math.floor(R() * ids.length)];
      s += `<circle cx="${r0(x0 + R() * (x1 - x0))}" cy="${r0(y0 + R() * (y1 - y0))}" r="${r0(rmin + R() * (rmax - rmin))}" fill="url(#${id})" opacity="${f1(omin + R() * (omax - omin))}"/>`;
    }
    return s;
  };
  const bokehDef = (id, c) => rad(id, '.5 .5 .5', `${c} 0 .6|${c} .78 .55|${c} .9 .3|${c} 1 0`);
  const glowDef = (id, c, a) => rad(id, '.5 .5 .5', `${c} 0 ${a == null ? 0.9 : a}|${c} .35 ${f1((a == null ? 0.9 : a) * 0.4)}|${c} 1 0`);
  // fluffy outline around an ellipse (fur)
  const fluff = (cx, cy, rx, ry, n, amp, seed, droop) => {
    const R = rng(seed);
    droop = droop == null ? 0.35 : droop;
    const pt = (t, k) => [cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k];
    const ws = [];
    let acc = 0;
    for (let i = 0; i < n; i++) { const v = 0.55 + R() * 0.9; ws.push(v); acc += v; }
    let t0 = 0;
    let p = pt(0, 1);
    let d = `M${f1(p[0])} ${f1(p[1])}`;
    const mr = (rx + ry) / 2;
    for (const v of ws) {
      const t1 = t0 + (Math.PI * 2 * v) / acc;
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
  // status bar for 900px-wide phone screenshots
  const statusBar = (time, dark) => {
    const c = dark ? '#fff' : '#000';
    return `<text x="96" y="78" font-family="${FONT}" font-size="38" font-weight="600" fill="${c}" text-anchor="middle">${time}</text>` +
      `<g fill="${c}"><rect x="664" y="62" width="8" height="12" rx="2"/><rect x="677" y="56" width="8" height="18" rx="2"/><rect x="690" y="50" width="8" height="24" rx="2"/><rect x="703" y="44" width="8" height="30" rx="2"/></g>` +
      `<path d="M730 56a30 30 0 0 1 40 0l-5 6a22 22 0 0 0-30 0zM738 64a18 18 0 0 1 24 0l-5 6a10 10 0 0 0-14 0zM746 72l4-4 4 4-4 4z" fill="${c}"/>` +
      `<rect x="790" y="49" width="56" height="27" rx="8" fill="none" stroke="${c}" stroke-opacity=".4" stroke-width="2.5"/><rect x="795" y="54" width="40" height="17" rx="4" fill="${c}"/><rect x="849" y="58" width="4" height="9" rx="2" fill="${c}" opacity=".4"/>` +
      `<rect x="330" y="26" width="240" height="70" rx="35" fill="#000"/>`;
  };

  /* ---------- reusable subjects ---------- */
  // Sitting dog, front view. Ground at y=0, ~200 tall, centred on x=0.
  const dog = (o) => {
    const c1 = o.c1, c2 = o.c2, c3 = o.c3, rim = o.rim;
    const sd = o.seed || 1;
    const fa = o.fl == null ? 10 : o.fl;
    let g = '';
    const body = fluff(0, -82, 52, 74, 18, fa, sd, 0.5);
    const head = fluff(0, -160, 46, 41, 20, fa * 0.8, sd + 1, 0.4);
    const hL = fluff(-40, -36, 34, 34, 10, fa * 0.7, sd + 2, 0.5), hR = fluff(40, -36, 34, 34, 10, fa * 0.7, sd + 3, 0.5);
    const P = (k, d) => (rim ? `<use href="#d${sd}${k}"` : `<path d="${d}"`);
    if (rim) {
      g += `<defs><path id="d${sd}b" d="${body}"/><path id="d${sd}h" d="${head}"/><path id="d${sd}l" d="${hL}"/><path id="d${sd}r" d="${hR}"/></defs>`;
      g += `<g fill="${rim}" opacity="${o.rimOp || 0.8}" transform="translate(${o.rimX || -4} ${o.rimY || -4})"><use href="#d${sd}b"/><use href="#d${sd}h"/><use href="#d${sd}l"/><use href="#d${sd}r"/></g>`;
    }
    g += `${P('l', hL)} fill="${c3}"/>${P('r', hR)} fill="${c3}"/>`;
    g += `<ellipse cx="-60" cy="-6" rx="20" ry="9" fill="${c1}"/><ellipse cx="60" cy="-6" rx="20" ry="9" fill="${c1}"/>`;
    g += `${P('b', body)} fill="${c1}"/>`;
    if (o.chest) g += `<path d="${fluff(0, -96, 22, 36, 10, fa * 0.6, sd + 4, 0.5)}" fill="${o.chest}"/>`;
    g += `<path d="M-30-74h22v66h-22zM8-74h22v66h-22z" fill="${c1}"/><path d="M-10-70v62M10-70v62" stroke="${c3}" stroke-width="3" opacity=".6"/>`;
    g += `<ellipse cx="-19" cy="-7" rx="16" ry="9" fill="${o.paw || c1}"/><ellipse cx="19" cy="-7" rx="16" ry="9" fill="${o.paw || c1}"/>`;
    g += `<path d="M-24-10v6M-14-10v6M14-10v6M24-10v6" stroke="${c3}" stroke-width="2" opacity=".7"/>`;
    if (o.collar) g += `<path d="M-32-126Q0-112 32-126L32-116Q0-102-32-116Z" fill="${o.collar}"/>` + (o.tag ? `<circle cx="10" cy="-106" r="7" fill="${o.tag}" stroke="#bbb" stroke-width="1.5"/>` : '');
    // head
    const tilt = o.tilt || 0;
    let hd = '';
    const ear = o.ear || 'flop';
    const earPath = (sx) =>
      ear === 'up'
        ? `M${sx * 18}-188L${sx * 40}-222L${sx * 46}-172Z`
        : ear === 'fold'
          ? `M${sx * 20}-192Q${sx * 50}-206${sx * 52}-178Q${sx * 46}-170${sx * 36}-176Z`
          : `M${sx * 30}-192Q${sx * 64}-196${sx * 62}-150Q${sx * 60}-118${sx * 44}-122Q${sx * 32}-140${sx * 28}-176Z`;
    if (ear === 'up') hd += `<path d="${earPath(-1)}" fill="${c3}"/><path d="${earPath(1)}" fill="${c3}"/><path d="M-22-190L-38-212L-40-182ZM22-190L38-212L40-182Z" fill="${o.earIn || '#e8a0a8'}" opacity=".7"/>`;
    hd += `${P('h', head)} fill="${c1}"/>`;
    if (o.blaze) hd += `<path d="M-6-196Q0-200 6-196L12-150H-12Z" fill="${o.blaze}"/>`;
    hd += `<ellipse cx="0" cy="-140" rx="24" ry="17" fill="${o.muzzle || c2}"/>`;
    if (ear === 'flop' && fa > 8) {
      hd += `<path d="${fluff(-46, -160, 15, 30, 9, fa * 0.6, sd + 5, 0.6)}" fill="${c3}" transform="rotate(14 -46 -160)"/><path d="${fluff(46, -160, 15, 30, 9, fa * 0.6, sd + 6, 0.6)}" fill="${c3}" transform="rotate(-14 46 -160)"/>`;
    } else if (ear !== 'up') hd += `<path d="${earPath(-1)}" fill="${c3}"/><path d="${earPath(1)}" fill="${c3}"/>`;
    const er = o.eyeR || 5.5;
    hd += `<circle cx="-16" cy="-166" r="${er}" fill="#1a0f08"/><circle cx="16" cy="-166" r="${er}" fill="#1a0f08"/>`;
    hd += `<circle cx="${f1(-17.5 + (o.look || 0))}" cy="${f1(-167.5)}" r="${f1(er * 0.36)}" fill="#fff"/><circle cx="${f1(14.5 + (o.look || 0))}" cy="-167.5" r="${f1(er * 0.36)}" fill="#fff"/>`;
    if (o.brow) hd += `<path d="M-24-178q8-6 15-1M24-178q-8-6-15-1" stroke="${o.brow}" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
    hd += `<path d="M-8-152Q0-157 8-152Q8-145 0-142Q-8-145-8-152Z" fill="${o.nose || '#15100e'}"/><ellipse cx="-2" cy="-152" rx="3" ry="1.5" fill="#fff" opacity=".5"/>`;
    if (o.tongue) {
      hd += `<path d="M-14-136Q0-128 14-136Q12-124 0-122Q-12-124-14-136Z" fill="#3a1018"/>`;
      hd += `<path d="M-7-132Q0-128 8-132Q10-116 3-110Q-4-108-6-116Z" fill="#f07a9a"/><path d="M0-130V-114" stroke="#c94a72" stroke-width="1.4"/>`;
      hd += `<path d="M0-142V-134M-14-136Q-7-130 0-134Q7-130 14-136" stroke="#1a0f0c" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    } else {
      hd += `<path d="M0-142V-136M-9-133Q-4-130 0-135Q4-130 9-133" stroke="#1a0f0c" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
    g += `<g transform="rotate(${tilt} 0 -120)">${hd}</g>`;
    return g;
  };

  // Dark purple sedan, side view facing right. Wheels touch y=0; x 0..420.
  const sedanDefs = () =>
    lin('cb', '0 0 0 1', '#7a5a9a 0|#4a2c63 .28|#331c48 .6|#1b0f28 1') +
    lin('cg', '0 0 1 0', '#120c1c 0|#2b2240 .45|#120c1c 1') +
    rad('crim', '.5 .5 .5', '#9a96a8 0|#4a4658 .7|#232030 1');
  const sedan = (refl) =>
    `<path d="M14-40C6-40 4-52 6-66L12-84C40-88 80-90 112-92C128-96 140-116 160-126C190-138 250-140 278-132C300-124 318-104 336-96C370-92 398-88 412-80C420-74 422-60 418-46L412-38H382A42 42 0 0 0 298-38H130A42 42 0 0 0 46-38Z" fill="url(#cb)"/>` +
    `<path d="M134-98C148-112 162-122 180-126C210-132 250-133 270-128C290-122 306-108 318-98Z" fill="url(#cg)"/>` +
    `<path d="M224-131h7v34h-7z" fill="#1b0f28"/>` +
    `<path d="M150-96V-44M232-96V-44M312-96V-46" stroke="#1b0f28" stroke-width="2" opacity=".8"/>` +
    `<path d="M20-86C150-94 300-94 410-80" stroke="#b9a2d8" stroke-width="2" opacity=".5" fill="none"/>` +
    `<rect x="168" y="-84" width="20" height="5" rx="2.5" fill="#b9a2d8" opacity=".6"/><rect x="250" y="-84" width="20" height="5" rx="2.5" fill="#b9a2d8" opacity=".6"/>` +
    `<path d="M316-100q10-6 18 0v8h-16z" fill="#2a1840"/>` +
    `<path d="M398-74q14 0 18 8q-8 4-20 2z" fill="#fff3d0"/><path d="M6-74q6-2 10 0v10q-6 0-10-2z" fill="#c8102e"/>` +
    (refl || '') +
    [88, 340].map((x) => `<circle cx="${x}" cy="-32" r="32" fill="#0d0b12"/><circle cx="${x}" cy="-32" r="20" fill="url(#crim)"/><path d="M${x}-50v36M${x - 18}-32h36M${x - 13}-45l26 26M${x + 13}-45l-26 26" stroke="#1d1a26" stroke-width="3"/><circle cx="${x}" cy="-32" r="5" fill="#2a2733"/>`).join('');

  // Koi seen from above, pointing +x, ~70 long
  const koi = (x, y, a, s, body, spots, op) =>
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})" opacity="${op || 0.85}">` +
    `<path d="M-26 0L-44-11Q-38 0-44 11Z" fill="${body}" opacity=".8"/>` +
    `<ellipse cx="2" cy="-9" rx="7" ry="3" fill="${body}" opacity=".8" transform="rotate(-30 2 -9)"/><ellipse cx="2" cy="9" rx="7" ry="3" fill="${body}" opacity=".8" transform="rotate(30 2 9)"/>` +
    `<path d="M30 0C26-8 10-10-6-6C-16-4-22-2-28 0C-22 2-16 4-6 6C10 10 26 8 30 0Z" fill="${body}"/>` +
    (spots ? `<path d="${spots}" fill="#fff8ee"/>` : '') +
    `</g>`;
  const KOI_SPOTS = ['M18-4C12-6 6-4 4 0C8 3 14 3 18-4Z', 'M-4-5C-10-4-14 0-12 3C-6 4-2 0-4-5Z', 'M24 0C20-6 14-5 14 0C16 4 22 4 24 0Z'];

  /* =====================================================================
     p_fairy_roof — Fairy on the roof of the sunk sedan, Koi Tower behind
     ===================================================================== */
  const koiTower = (cx, base, R) => {
    // tiered tower with flared, gold-lit eaves; runs off the top of the frame
    let t = '', win = '', win2 = '';
    let y = base, wd = 400;
    for (let i = 0; i < 9 && y > -120; i++) {
      const fh = 74 - i * 3;
      t += `<rect x="${cx - wd / 2 + 18}" y="${y - fh}" width="${wd - 36}" height="${fh}" fill="#1a1230"/>`;
      for (let k = 0; k < Math.floor((wd - 60) / 26); k++) {
        if (R() < 0.85) (R() < 0.5 ? (win += `M${r0(cx - wd / 2 + 34 + k * 26)} ${r0(y - fh + 18)}h14v${r0(fh - 34)}h-14z`) : (win2 += `M${r0(cx - wd / 2 + 34 + k * 26)} ${r0(y - fh + 18)}h14v${r0(fh - 34)}h-14z`));
      }
      const e = wd / 2 + 34, ey = y - fh;
      t += `<path d="M${cx - e} ${ey - 6}Q${cx - e + 30} ${ey + 2} ${cx - wd / 2 + 10} ${ey + 4}H${cx + wd / 2 - 10}Q${cx + e - 30} ${ey + 2} ${cx + e} ${ey - 6}Q${cx + e - 26} ${ey - 10} ${cx + wd / 2 - 20} ${ey - 22}H${cx - wd / 2 + 20}Q${cx - e + 26} ${ey - 10} ${cx - e} ${ey - 6}Z" fill="#241739"/>`;
      t += `<path d="M${cx - e} ${ey - 6}Q${cx - e + 30} ${ey + 2} ${cx - wd / 2 + 10} ${ey + 4}H${cx + wd / 2 - 10}Q${cx + e - 30} ${ey + 2} ${cx + e} ${ey - 6}" stroke="#ffcf6b" stroke-width="3" fill="none"/>`;
      y = ey - 22;
      wd -= 34;
    }
    return t + `<path d="${win}" fill="#ffc861"/><path d="${win2}" fill="#ffc861" opacity=".65"/>`;
  };

  def('p_fairy_roof', {
    title: 'Fairy on the roof', w: 1200, h: 900, tags: ['dog', 'fairy', 'jinling', 'night', 'car', 'koi-tower'],
    svg: (w, h) => {
      const R = rng(2026);
      const WL = 652; // water line
      const defs =
        sedanDefs() +
        lin('sky', '0 0 0 1', '#0b0a22 0|#1d1640 .55|#3a2448 1') +
        glowDef('tg', '#ffcf73', 0.75) + glowDef('lg', '#ffd88a', 1) +
        bokehDef('b1', '#ffd27a') + bokehDef('b2', '#ffb35c') + bokehDef('b3', '#fff0c8') +
        lin('wt', '0 0 0 1', '#2a2140 0 .55|#120e22 .5 .9|#0a0816 1 .96') +
        lin('rimS', '0 0 0 1', '#5e5468 0|#3a3344 1') +
        lin('hl', '0 0 1 0', '#ffd27a 0 0|#ffd27a .5 .9|#ffd27a 1 0') +
        vig('vg', 0.6) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="600" cy="360" r="560" fill="url(#tg)"/>`;
      b += koiTower(600, 560, R);
      b += `<circle cx="600" cy="420" r="300" fill="url(#tg)" opacity=".55"/>`;
      // forecourt + far pond rim, lamp posts
      b += `<rect y="548" width="${w}" height="40" fill="#2b2035"/>`;
      for (const x of [90, 330, 870, 1110]) {
        b += `<rect x="${x - 3}" y="470" width="6" height="90" fill="#140f1c"/><circle cx="${x}" cy="466" r="60" fill="url(#lg)" opacity=".7"/><circle cx="${x}" cy="466" r="11" fill="#fff4d6"/>`;
      }
      // distant people (staff) silhouettes
      for (const [x, s] of [[200, 1], [232, 0.92], [960, 1], [1000, 0.95]]) b += `<g transform="translate(${x} 556) scale(${s})" fill="#120c1a"><circle cx="0" cy="-58" r="7"/><path d="M-9-50h18l3 30h-4l-2 20h-12l-2-20h-4z"/></g>`;
      b += bokeh(R, 26, 0, 380, w, 560, 8, 30, ['b1', 'b2', 'b3'], 0.25, 0.7);
      b += `<path d="M0 576Q300 566 600 570T1200 574V600H0Z" fill="url(#rimS)"/>`;
      for (let x = 0; x < w; x += 46) b += `<path d="M${x} 576q23-8 46 0" stroke="#7a6e84" stroke-width="2" fill="none" opacity=".6"/>`;
      // water body
      b += `<rect y="592" width="${w}" height="${h - 592}" fill="#140f24"/>`;
      // reflection of tower glow on water
      for (let i = 0; i < 26; i++) {
        const y = 600 + i * 11 + R() * 6, wd = 60 + R() * 260;
        b += `<rect x="${r0(600 - wd / 2 + (R() - 0.5) * 300)}" y="${r0(y)}" width="${r0(wd)}" height="${f1(2 + R() * 3)}" rx="2" fill="#ffc861" opacity="${f1(0.15 + R() * 0.35)}"/>`;
      }
      // the car (tilted, nose down) + Fairy on the roof
      const car = sedan(`<path d="M150-100L176-124M166-100L196-128M250-100L276-130M262-100L284-124" stroke="#ffd27a" stroke-width="3" opacity=".35"/><path d="M140-118C190-136 250-138 280-130" stroke="url(#hl)" stroke-width="4" fill="none"/><path d="M340-92C372-90 398-86 412-80" stroke="#ffd27a" stroke-width="3" opacity=".7" fill="none"/><path d="M20-84C60-88 90-90 112-92" stroke="#ffd27a" stroke-width="2.5" opacity=".6" fill="none"/>`);
      b += `<g transform="translate(290 ${WL + 52}) rotate(3) scale(1.45)">${car}` +
        `<g transform="translate(222 -132) scale(.7)">${dog({ c1: '#141420', c2: '#2a2b38', c3: '#0a0a12', muzzle: '#22232e', rim: '#ffd27a', rimOp: 0.9, rimX: 0, rimY: -3, fl: 13, seed: 7, tongue: true, tilt: -8, collar: '#d9a640', tag: '#f2f2f4', brow: '#4a4f66', eyeR: 6.5, look: 1 })}` +
        `<path d="M-30-60q2 10 0 18M26-50q2 10-1 16M-44-20q2 8 0 12" stroke="#9fb4d8" stroke-width="2" opacity=".55" fill="none" stroke-linecap="round"/></g></g>`;
      // water in front of the car (covers the lower body), with ripples
      b += `<path d="M0 ${WL}Q300 ${WL - 4} 600 ${WL}T1200 ${WL}V${h}H0Z" fill="url(#wt)"/>`;
      for (const [rx, op] of [[330, 0.5], [380, 0.35], [440, 0.22]]) b += `<ellipse cx="600" cy="${WL + 4}" rx="${rx}" ry="${f1(rx * 0.06)}" fill="none" stroke="#ffd9a0" stroke-width="2.5" opacity="${op}"/>`;
      // faint reflection of the car body
      b += `<g transform="translate(290 ${WL - 8}) scale(1.45 -.5)" opacity=".18"><path d="M14-40C6-40 4-52 6-66L12-84C40-88 80-90 112-92C128-96 140-116 160-126C190-138 250-140 278-132C300-124 318-104 336-96C370-92 398-88 412-80C420-74 422-60 418-46L412-38H14Z" fill="#7a5a9a"/></g>`;
      // koi, lily pads, near rim
      b += koi(180, 760, 20, 1.2, '#ff7a2f', KOI_SPOTS[0], 0.75) + koi(980, 720, 160, 1.1, '#fff1e2', 'M10-4C4-6 0-2 2 2C6 4 12 2 10-4Z', 0.7) + koi(860, 820, -30, 1.3, '#f05a22', KOI_SPOTS[1], 0.7) + koi(330, 830, 200, 1, '#ffb347', '', 0.65);
      for (const [x, y, s] of [[90, 700, 1], [1090, 780, 1.2], [470, 860, 0.9]]) b += `<g transform="translate(${x} ${y}) scale(${s} ${f1(s * 0.4)})"><path d="M0 0L-6-50A50 50 0 1 0 6-50Z" fill="#2f5a3a"/><path d="M0 0L-6-50A50 50 0 1 0 6-50Z" fill="none" stroke="#ffd27a" stroke-opacity=".35" stroke-width="3"/></g>`;
      b += `<path d="M0 900V872Q200 858 420 866T820 862T1200 868V900Z" fill="#3d3446"/><path d="M0 872Q200 858 420 866T820 862T1200 868" stroke="#8a7d92" stroke-width="2" fill="none" opacity=".6"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.1);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_koi_pond_car — wide, high-angle: the car in the koi pond, koi circling
     ===================================================================== */
  def('p_koi_pond_car', {
    title: 'Car in the koi pond', w: 1200, h: 900, tags: ['car', 'koi-tower', 'night', 'koi', 'fairy'],
    svg: (w, h) => {
      const R = rng(18);
      const defs =
        lin('pv', '0 0 0 1', '#3b3040 0|#5a4c5c 1') +
        rad('pond', '.5 .45 .6', '#1d3a4a 0|#13283a .6|#0a1624 1') +
        glowDef('lg', '#ffd88a', 0.85) +
        lin('roof', '0 0 1 1', '#6a4a8a 0|#3a2050 .5|#24123a 1') +
        lin('gl', '0 0 1 1', '#3a3350 0|#141022 .6|#2a2440 1') +
        vig('vg', 0.65) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#pv)"/>`;
      // paving pattern (perspective-ish rows)
      for (let i = 0; i < 16; i++) {
        const y = f1(i * i * 3.6);
        b += `<path d="M0 ${y}H1200" stroke="#2a2030" stroke-width="${f1(1 + i * 0.2)}" opacity=".7"/>`;
      }
      for (let i = -12; i <= 12; i++) b += `<path d="M${600 + i * 30} 0L${600 + i * 120} 900" stroke="#2a2030" stroke-width="1.5" opacity=".6"/>`;
      // lamp pools
      for (const [x, y] of [[120, 140], [1080, 150], [70, 760], [1130, 780]]) b += `<ellipse cx="${x}" cy="${y}" rx="220" ry="150" fill="url(#lg)" opacity=".55"/>`;
      // pond
      const pondD = 'M150 330C150 200 400 150 620 160C860 170 1080 220 1060 380C1040 560 1000 760 640 790C300 810 130 640 150 330Z';
      b += `<path d="${pondD}" fill="#6e6272" transform="translate(0 10)"/>`;
      b += `<path d="${pondD}" fill="url(#pond)" stroke="#8c7f8e" stroke-width="22"/>`;
      let stones = '';
      for (let i = 0; i < 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        const x = 605 + Math.cos(a) * 455 * (1 + (R() - 0.5) * 0.02), y = 475 + Math.sin(a) * 310;
        stones += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(14 + R() * 10)}" ry="${r0(8 + R() * 5)}" transform="rotate(${r0((a * 180) / Math.PI + 90)} ${r0(x)} ${r0(y)})"/>`;
      }
      b += `<g fill="#9b8f9c" opacity=".55">${stones}</g>`;
      // light reflections on the water
      for (let i = 0; i < 30; i++) b += `<rect x="${r0(250 + R() * 700)}" y="${r0(220 + R() * 520)}" width="${r0(30 + R() * 90)}" height="3" rx="1.5" fill="#ffd27a" opacity="${f1(0.1 + R() * 0.3)}"/>`;
      // lily pads
      for (const [x, y, s, a] of [[300, 300, 1, 10], [340, 330, 0.7, 80], [880, 640, 1.1, 200], [930, 610, 0.7, 30], [760, 250, 0.8, 120]]) b += `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s} ${f1(s * 0.8)})"><path d="M0 0L-5-34A34 34 0 1 0 5-34Z" fill="#2f6040"/><path d="M0 0L0 30M0 0L-24 22M0 0L24 22" stroke="#4f8a5a" stroke-width="2"/></g>`;
      // koi circling
      const kc = ['#ff7a2f', '#f05a22', '#fff1e2', '#ffb347', '#e8401c', '#fff1e2'];
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2 + R() * 0.3;
        const rr = 0.68 + R() * 0.22;
        const x = 600 + Math.cos(a) * 360 * rr, y = 480 + Math.sin(a) * 240 * rr;
        b += koi(r0(x), r0(y), r0((a * 180) / Math.PI + 100), f1(0.9 + R() * 0.4), kc[i % kc.length], KOI_SPOTS[i % 3], 0.8);
      }
      // ripples around the car
      for (const [rx, op] of [[250, 0.5], [300, 0.3], [356, 0.18]]) b += `<ellipse cx="610" cy="470" rx="${rx}" ry="${f1(rx * 0.55)}" fill="none" stroke="#bcd8e6" stroke-width="3" opacity="${op}" transform="rotate(-18 610 470)"/>`;
      // the car (top view, tilted), partially under water
      const BODY = 'M-196-40Q-200-78-160-82L120-84Q182-82 196-46Q204 0 196 46Q182 82 120 84L-160 82Q-200 78-196 40Z';
      b += `<g transform="translate(610 470) rotate(-18)">` +
        `<path d="${BODY}" fill="#1e1030" opacity=".6" transform="scale(1.06 1.12)"/>` +
        `<path d="${BODY}" fill="url(#roof)"/>` +
        `<ellipse cx="62" cy="-92" rx="12" ry="7" fill="#3a2050"/><ellipse cx="62" cy="92" rx="12" ry="7" fill="#3a2050"/>` +
        `<path d="M40-64L100-70Q114 0 100 70L40 64Q32 0 40-64Z" fill="url(#gl)"/>` +
        `<path d="M58-50L90-54M54-30L92-34" stroke="#ffd27a" stroke-width="3" opacity=".45"/>` +
        `<path d="M-80-60L40-64Q32 0 40 64L-80 60Q-88 0-80-60Z" fill="#4a2c66"/>` +
        `<path d="M-132-56L-80-60Q-88 0-80 60L-132 56Q-140 0-132-56Z" fill="url(#gl)"/>` +
        `<path d="M120-30Q160-20 186-26M120 30Q160 20 186 26" stroke="#8a6aaa" stroke-width="2" opacity=".6" fill="none"/>` +
        `<ellipse cx="184" cy="-58" rx="10" ry="16" fill="#fff3d0" transform="rotate(30 184 -58)"/><ellipse cx="184" cy="58" rx="10" ry="16" fill="#fff3d0" transform="rotate(-30 184 58)"/>` +
        `<circle cx="220" cy="-60" r="40" fill="url(#lg)" opacity=".5"/><circle cx="220" cy="60" r="40" fill="url(#lg)" opacity=".5"/>` +
        `<path d="M-190-66Q-198-50-196-36M-190 66Q-198 50-196 36" stroke="#ff3050" stroke-width="7" stroke-linecap="round" fill="none"/>` +
        // Fairy on the roof, seen from above, looking up at the camera
        `<g transform="translate(-28 0)"><path d="${fluff(-88, 22, 22, 10, 8, 8, 9, 0)}" fill="#101018"/>` +
        `<path d="${fluff(-24, 0, 46, 38, 16, 9, 3, 0)}" fill="#111119"/><path d="${fluff(-30, -8, 30, 22, 10, 6, 5, 0)}" fill="#1f2030"/>` +
        `<path d="${fluff(24, 0, 28, 27, 12, 7, 4, 0)}" fill="#171822"/>` +
        `<ellipse cx="18" cy="-28" rx="16" ry="9" fill="#0a0a10" transform="rotate(-20 18 -28)"/><ellipse cx="18" cy="28" rx="16" ry="9" fill="#0a0a10" transform="rotate(20 18 28)"/>` +
        `<circle cx="34" cy="-10" r="3.6" fill="#2b1608"/><circle cx="34" cy="10" r="3.6" fill="#2b1608"/><circle cx="33" cy="-11" r="1.3" fill="#fff"/><circle cx="33" cy="9" r="1.3" fill="#fff"/>` +
        `<ellipse cx="46" cy="0" rx="5" ry="6" fill="#08080c"/><ellipse cx="55" cy="2" rx="7" ry="5" fill="#f07a9a"/>` +
        `<path d="M0-22Q6 0 0 22" stroke="#d9a640" stroke-width="4" fill="none"/></g>` +
        `</g>`;
      // water line wash over the car edges
      b += `<ellipse cx="610" cy="470" rx="216" ry="100" fill="none" stroke="#16304a" stroke-width="14" opacity=".55" transform="rotate(-18 610 470)"/>`;
      // lamp posts tops (seen from above) + onlookers
      for (const [x, y] of [[120, 140], [1080, 150], [70, 760], [1130, 780]]) b += `<circle cx="${x}" cy="${y}" r="16" fill="#fff4d6"/><circle cx="${x}" cy="${y}" r="40" fill="url(#lg)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.1);
      return wrap(w, h, defs, b);
    },
  });

  /* ---------- people helpers ---------- */
  const SKIN = '#f1cdb2', SKIN_S = '#d9a98c', HAIR = '#1c1513';
  // Jin Ling's head, front view, face centre (0,0), face ~92 wide. mood: smirk | grin | proud | scowl
  const jlHead = (mood) => {
    let g = '';
    g += `<path d="M24-80C64-112 102-84 90-40C84-16 80 8 86 40C64 20 58-14 48-40Z" fill="${HAIR}"/>`;
    g += `<path d="M-54-6C-62-70-22-98 4-96C40-96 64-72 56-6C54 12 50 24 46 32H-46C-50 22-54 8-54-6Z" fill="${HAIR}"/>`;
    g += `<path d="M-15 38L-14 80H14L15 38Z" fill="${SKIN_S}"/>`;
    g += `<path d="M-15 40Q0 60 15 40V54Q0 70-15 54Z" fill="#b8866a" opacity=".55"/>`;
    g += `<ellipse cx="-47" cy="0" rx="8" ry="12" fill="${SKIN}"/><ellipse cx="47" cy="0" rx="8" ry="12" fill="${SKIN}"/>`;
    g += `<path d="M-46-26C-46-66 46-66 46-26C46 12 34 44 0 56C-34 44-46 12-46-26Z" fill="${SKIN}"/>`;
    g += `<path d="M30 30C40 10 44-10 46-26C46 12 34 44 0 56C14 50 24 42 30 30Z" fill="${SKIN_S}" opacity=".5"/>`;
    // centre-parted bangs (leave the forehead mark visible)
    g += `<path d="M-54-4C-62-62-30-96 0-96L-4-64C-10-52-16-44-22-38C-24-46-27-51-30-55C-34-42-42-32-47-26C-49-34-51-42-51-46Z" fill="${HAIR}"/>`;
    g += `<path d="M54-4C62-62 30-96 0-96L4-64C10-52 16-44 22-38C24-46 27-51 30-55C34-42 42-32 47-26C49-34 51-42 51-46Z" fill="${HAIR}"/>`;
    g += `<path d="M-30-84Q-10-94 10-90M24-88Q38-84 44-72" stroke="#5a4a44" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
    g += `<rect x="38" y="-96" width="16" height="10" rx="3" fill="#e0b040" transform="rotate(40 46 -91)"/>`;
    g += `<circle cx="0" cy="-40" r="3.8" fill="#d0202e"/>`;
    const eye = (x, open) =>
      open
        ? `<path d="M${x - 12}-8Q${x}-17 ${x + 12}-8Q${x}-2 ${x - 12}-8Z" fill="#2a1c16"/><circle cx="${x + 3}" cy="-10" r="2.2" fill="#fff"/><path d="M${x - 13}-8Q${x}-18 ${x + 13}-9" stroke="#140c0a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
        : `<path d="M${x - 11}-7Q${x}-15 ${x + 11}-7" stroke="#140c0a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if (mood === 'proud') g += eye(-18, false) + eye(18, false);
    else g += eye(-18, true) + eye(18, true);
    const brows = {
      smirk: 'M-30-26Q-18-34-7-27M7-24Q18-26 30-24',
      grin: 'M-30-24Q-18-31-7-26M7-26Q18-31 30-24',
      proud: 'M-30-27Q-18-33-7-28M7-28Q18-33 30-27',
      scowl: 'M-30-30Q-18-26-6-20M6-20Q18-26 30-30',
    }[mood];
    g += `<path d="${brows}" stroke="${HAIR}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    g += `<path d="M2 4Q5 14-1 17" stroke="${SKIN_S}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    g += {
      smirk: `<path d="M-10 30Q4 34 15 24" stroke="#9a5446" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
      grin: `<path d="M-15 26Q0 42 15 26Z" fill="#7a2e2a"/><path d="M-12 27Q0 31 12 27L11 30Q0 33-11 30Z" fill="#fff"/>`,
      proud: `<path d="M-14 26Q0 40 14 26Q0 31-14 26Z" fill="#7a2e2a"/><path d="M-11 27Q0 30 11 27L10 29Q0 32-10 29Z" fill="#fff"/>`,
      scowl: `<path d="M-11 31Q0 27 11 31" stroke="#9a5446" stroke-width="3.2" fill="none" stroke-linecap="round"/>`,
    }[mood];
    g += `<ellipse cx="-28" cy="14" rx="9" ry="5" fill="#f08a8a" opacity=".16"/><ellipse cx="28" cy="14" rx="9" ry="5" fill="#f08a8a" opacity=".16"/>`;
    return g;
  };
  // round-ish peony bloom (side view) for arrangements; bloomDefs() registers 4 palettes as symbols
  const BLOOMS = { bP: ['#e8789a', '#f6b4c8', '#ffe2ea'], bR: ['#c8304e', '#e86078', '#ffb0bc'], bW: ['#e9e2d8', '#ffffff', '#fff6e0'], bL: ['#f29ab0', '#ffd0dc', '#fff0f4'] };
  const bloomDefs = () => Object.entries(BLOOMS).map(([id, c]) => `<g id="${id}">${bloomBody(0, 0, 50, c[0], c[1], c[2])}</g>`).join('');
  const bloomUse = (id, x, y, r) => `<use href="#${id}" transform="translate(${r0(x)} ${r0(y)}) scale(${f1(r / 50)})"/>`;
  const bloomBody = (x, y, r, c1, c2, c3) => {
    let s = `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c1}"/>`;
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * Math.PI * 2;
      s += `<ellipse cx="${f1(Math.cos(a) * r * 0.5)}" cy="${f1(Math.sin(a) * r * 0.42 + r * 0.08)}" rx="${f1(r * 0.52)}" ry="${f1(r * 0.36)}" transform="rotate(${r0((a * 180) / Math.PI)} ${f1(Math.cos(a) * r * 0.5)} ${f1(Math.sin(a) * r * 0.42 + r * 0.08)})" fill="${c2}" opacity=".85"/>`;
    }
    s += `<ellipse cx="0" cy="${f1(-r * 0.1)}" rx="${f1(r * 0.5)}" ry="${f1(r * 0.36)}" fill="${c3}"/><path d="M${f1(-r * 0.4)} ${f1(-r * 0.05)}Q0 ${f1(-r * 0.5)} ${f1(r * 0.4)} ${f1(-r * 0.05)}" stroke="${c1}" stroke-width="${f1(r * 0.06)}" fill="none" opacity=".6"/></g>`;
    return s;
  };
  const arrangement = (x, y, s, R) => {
    let a = `<g transform="translate(${x} ${y}) scale(${s})">`;
    a += `<path d="M-60-40Q-120-120-150-100M60-40Q130-120 160-90M0-60Q-20-160-60-180M20-60Q60-150 90-170" stroke="#2f5a2e" stroke-width="8" fill="none"/>`;
    for (const [lx, ly, la] of [[-130, -100, -30], [140, -90, 40], [-50, -170, -60], [80, -160, 50], [-100, -40, -10], [110, -40, 20]]) a += `<ellipse cx="${lx}" cy="${ly}" rx="34" ry="13" fill="#3d6b38" transform="rotate(${la} ${lx} ${ly})"/>`;
    const ids = Object.keys(BLOOMS);
    for (const [bx, by, br] of [[-90, -90, 46], [0, -120, 54], [90, -86, 48], [-40, -40, 44], [50, -40, 46], [-130, -30, 34], [140, -24, 36], [10, -190, 38], [-70, -160, 36], [80, -160, 34]]) {
      a += bloomUse(ids[Math.floor(R() * ids.length)], bx, by, br);
    }
    a += `<path d="M-80 0H80L64 120Q0 140-64 120Z" fill="url(#vase)"/><path d="M-84-6H84V8H-84Z" fill="#c99a3c"/>`;
    return a + '</g>';
  };

  const tableBody = () => {
    let t = '';
    for (const dx of [-90, -40, 40, 90]) t += `<rect x="${dx - 9}" y="-70" width="18" height="70" rx="8" fill="#c8963c" opacity=".9"/>`;
    t += `<path d="M-110 0Q-112 60-100 70H100Q112 60 110 0Z" fill="url(#cloth)"/><ellipse cx="0" cy="0" rx="110" ry="26" fill="#fffaf0"/>`;
    t += `<circle cx="0" cy="-30" r="70" fill="url(#cand)" opacity=".5"/>`;
    return t + bloomUse('bP', -20, -26, 20) + bloomUse('bR', 18, -24, 18) + bloomUse('bW', 0, -40, 17);
  };
  const chandBody = () => {
    let c = `<path d="M0-400V-60" stroke="#c8963c" stroke-width="3"/><circle r="170" fill="url(#cg)" opacity=".75"/>`;
    let drops = '';
    for (const [ry, rx] of [[-40, 60], [0, 110], [40, 150], [80, 90]]) {
      c += `<ellipse cx="0" cy="${ry}" rx="${rx}" ry="${f1(rx * 0.16)}" fill="none" stroke="#e8b84a" stroke-width="5"/>`;
      const n = Math.floor(rx / 14);
      for (let k = 0; k <= n; k++) drops += `M${r0(-rx + (k * 2 * rx) / n)} ${ry}l-4 18l4 10l4-10z`;
    }
    c += `<path d="${drops}" fill="#fff6dc" opacity=".9"/>`;
    for (const [cx, cy] of [[-100, -6], [-50, -10], [0, -12], [50, -10], [100, -6], [-130, 34], [130, 34], [0, 32]]) c += `<circle cx="${cx}" cy="${cy}" r="9" fill="#fff8e0"/>`;
    return c + `<path d="M-30 100Q0 140 30 100" stroke="#e8b84a" stroke-width="5" fill="none"/>`;
  };

  /* =====================================================================
     p_gala_hall — Koi Tower gala hall, gold chandeliers, peonies
     ===================================================================== */
  def('p_gala_hall', {
    title: 'Koi Tower gala hall', w: 1200, h: 900, tags: ['gala', 'koi-tower', 'jin', 'night'],
    svg: (w, h) => {
      const R = rng(1016);
      const VX = 600, VY = 400;
      const BX0 = 330, BX1 = 870, BY0 = 170, BY1 = 470;
      const px = (bx, z) => VX + (bx - VX) / z;
      const py = (by, z) => VY + (by - VY) / z;
      const defs =
        lin('wall', '0 0 0 1', '#3a2416 0|#5a3a20 1') +
        lin('back', '0 0 0 1', '#6a4320 0|#c88a3c .6|#8a5a28 1') +
        lin('ceil', '0 0 0 1', '#140c08 0|#2a1a10 1') +
        lin('floor', '0 0 0 1', '#3a2618 0|#1c120c 1') +
        lin('win', '0 0 0 1', '#1a2238 0|#2c3050 1') +
        lin('cloth', '0 0 0 1', '#fffaf0 0|#e6dccb 1') +
        lin('vase', '0 0 1 0', '#8a6020 0|#f4d27a .45|#a87828 1') +
        glowDef('cg', '#ffd27a', 0.95) + glowDef('cand', '#ffcf73', 1) + glowDef('fl', '#ffcf73', 0.5) +
        bokehDef('b1', '#ffd27a') + bokehDef('b2', '#ffb860') +
        vig('vg', 0.55) + grainDef('gr', 0.9) + bloomDefs() + `<g id="tb">${tableBody()}</g><g id="ch">${chandBody()}</g>`;
      let b = `<rect width="${w}" height="${h}" fill="url(#floor)"/>`;
      // ceiling + walls
      b += `<path d="M0 0H1200L${BX1} ${BY0}H${BX0}Z" fill="url(#ceil)"/>`;
      for (let i = 1; i < 8; i++) {
        const z = 1 / (1 + i * 0.25);
        b += `<path d="M${r0(px(BX0, z))} ${r0(py(BY0, z))}H${r0(px(BX1, z))}" stroke="#4a3018" stroke-width="${f1(2 / z)}" opacity=".7"/>`;
      }
      for (let i = 0; i <= 8; i++) {
        const bx = BX0 + ((BX1 - BX0) * i) / 8;
        b += `<path d="M${r0(bx)} ${BY0}L${r0(px(bx, 0.3))} ${r0(py(BY0, 0.3))}" stroke="#4a3018" stroke-width="2" opacity=".6"/>`;
      }
      b += `<path d="M0 0L${BX0} ${BY0}V${BY1}L0 ${r0(py(BY1, 0.45))}Z" fill="url(#wall)"/><path d="M1200 0L${BX1} ${BY0}V${BY1}L1200 ${r0(py(BY1, 0.45))}Z" fill="url(#wall)"/>`;
      // tall windows + gold pilasters on side walls
      for (const [za, zb] of [[0.92, 0.82], [0.74, 0.64], [0.58, 0.5]]) {
        for (const side of [-1, 1]) {
          const ex = side < 0 ? BX0 : BX1;
          const xa = px(ex, za), xb = px(ex, zb);
          const ya0 = py(BY1 - 60, za), ya1 = py(BY0 + 40, za), yb0 = py(BY1 - 60, zb), yb1 = py(BY0 + 40, zb);
          b += `<path d="M${r0(xa)} ${r0(ya0)}L${r0(xa)} ${r0(ya1)}L${r0(xb)} ${r0(yb1)}L${r0(xb)} ${r0(yb0)}Z" fill="url(#win)" stroke="#d9a64a" stroke-width="${f1(3 / zb)}"/>`;
          const xm = (xa + xb) / 2;
          b += `<path d="M${r0(xm)} ${r0((ya0 + yb0) / 2)}V${r0((ya1 + yb1) / 2)}" stroke="#d9a64a" stroke-width="${f1(1.5 / zb)}" opacity=".6"/>`;
          const zc = zb - 0.04, xc = px(ex, zc);
          b += `<path d="M${r0(xc)} ${r0(py(BY1, zc))}V${r0(py(BY0, zc))}" stroke="#c8963c" stroke-width="${f1(10 / zc)}" opacity=".85"/>`;
        }
      }
      // back wall with stage and peony medallion
      b += `<rect x="${BX0}" y="${BY0}" width="${BX1 - BX0}" height="${BY1 - BY0}" fill="url(#back)"/>`;
      b += `<rect x="${BX0}" y="${BY1 - 40}" width="${BX1 - BX0}" height="40" fill="#2a1a10"/><rect x="${BX0}" y="${BY1 - 42}" width="${BX1 - BX0}" height="4" fill="#ffd27a" opacity=".8"/>`;
      let med = `<g transform="translate(600 300)"><circle r="92" fill="#f6dc9a" opacity=".35"/><circle r="80" fill="none" stroke="#fff2c8" stroke-width="4" opacity=".8"/>`;
      for (let k = 0; k < 8; k++) med += `<ellipse cx="0" cy="-38" rx="20" ry="36" fill="#fff8e6" opacity=".85" transform="rotate(${k * 45})"/>`;
      b += med + `<circle r="16" fill="#e8b84a"/></g>`;
      for (const x of [380, 470, 730, 820]) b += `<rect x="${x}" y="${BY0}" width="20" height="${BY1 - BY0 - 42}" fill="#9a2a2a" opacity=".55"/>`;
      // floor: red carpet aisle + soft reflections of the chandeliers
      b += `<path d="M560 470H640L760 900H440Z" fill="#6a1420" opacity=".55"/>`;
      for (const [x, y, rx] of [[600, 560, 260], [380, 520, 170], [820, 520, 170], [600, 800, 380]]) b += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx * 0.35)}" fill="url(#fl)"/>`;
      // tables (back to front)
      const table = (x, z) => `<use href="#tb" transform="translate(${r0(px(x, z))} ${r0(py(BY1 + 26, z))}) scale(${f1(0.42 / z)})"/>`;
      const people = (x, z, c, gown) => {
        const cx = px(x, z), cy = py(BY1 + 30, z), s = f1(0.42 / z);
        return `<g transform="translate(${r0(cx)} ${r0(cy)}) scale(${s})" fill="${c}"><circle cx="0" cy="-158" r="17"/>` +
          (gown ? `<path d="M-18-138H18L24-90L44 0H-44L-24-90Z"/>` : `<path d="M-24-138H24L28-60H18L16 0H-16L-18-60H-28Z"/><path d="M-6-138L0-120L6-138Z" fill="#f4f0ea"/>`) + `</g>`;
      };
      for (const z of [0.95, 0.85]) for (const x of [420, 600, 780]) b += table(x, z);
      b += people(500, 0.9, '#1a1210') + people(530, 0.9, '#d9a640', true) + people(700, 0.88, '#141010') + people(690, 0.86, '#f0ebe0', true);
      for (const x of [300, 600, 900]) b += table(x, 0.72);
      b += people(450, 0.75, '#120c0a') + people(480, 0.76, '#8a1a2a', true) + people(760, 0.74, '#0f0b0a') + people(800, 0.73, '#121010');
      for (const x of [240, 960]) b += table(x, 0.6);
      b += people(380, 0.62, '#0f0a08') + people(410, 0.63, '#e8c050', true) + people(860, 0.6, '#100b09');
      // chandeliers
      const chand = (x, y, s) => `<use href="#ch" transform="translate(${x} ${y}) scale(${s})"/>`;
      b += chand(600, 214, 0.42) + chand(380, 150, 0.6) + chand(820, 150, 0.6) + chand(600, 60, 1);
      // foreground arrangement, bokeh
      b += arrangement(120, 790, 1.1, R) + arrangement(1110, 820, 0.9, R);
      b += bokeh(R, 26, 0, 0, w, 360, 14, 46, ['b1', 'b2'], 0.2, 0.55);
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.09);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_balcony_moon — moon over Lanling from the balcony; a white sleeve
     ===================================================================== */
  def('p_balcony_moon', {
    title: 'Moon from the balcony', w: 1200, h: 900, tags: ['moon', 'night', 'koi-tower', 'lanling', 'gala', 'xichen'],
    svg: (w, h) => {
      const R = rng(2247);
      const defs =
        lin('sky', '0 0 0 1', '#070d26 0|#14214a .5|#3a3a66 .8|#6a4a5e 1') +
        rad('mn', '.45 .4 .6', '#ffffff 0|#fbf6e8 .75|#e8e0c8 1') +
        glowDef('mg', '#cfe0ff', 0.5) +
        bokehDef('b1', '#ffcf7a') + bokehDef('b2', '#ff9f6a') + bokehDef('b3', '#bcd4ff') + bokehDef('b4', '#ff6a8a') +
        lin('stone', '0 0 0 1', '#b89c80 0|#7a6250 .5|#3a2c24 1') +
        lin('sl', '0 0 1 0', '#d6dbe6 0|#ffffff .45|#eef1f6 .7|#c8ceda 1') +
        lin('cuff', '0 0 1 0', '#9cc0e8 0|#c8def6 1') +
        vig('vg', 0.6) + grainDef('gr', 0.95);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="850" cy="230" r="330" fill="url(#mg)"/><circle cx="850" cy="230" r="120" fill="url(#mg)"/>`;
      b += `<circle cx="850" cy="230" r="66" fill="url(#mn)"/><g fill="#d8cfb4" opacity=".2"><circle cx="830" cy="214" r="12"/><circle cx="868" cy="246" r="8"/><circle cx="858" cy="208" r="5"/></g>`;
      b += `<ellipse cx="700" cy="300" rx="260" ry="10" fill="#8aa0c8" opacity=".25"/><ellipse cx="960" cy="330" rx="200" ry="8" fill="#8aa0c8" opacity=".2"/>`;
      // skyline layers
      const skyline = (base, hmin, hmax, wmin, wmax, col, winC, wp, seed) => {
        const Rs = rng(seed);
        let s = '', win = '';
        for (let x = -20; x < w + 20;) {
          const bw = wmin + Rs() * (wmax - wmin), bh = hmin + Rs() * (hmax - hmin);
          s += `<rect x="${r0(x)}" y="${r0(base - bh)}" width="${r0(bw)}" height="${r0(bh + 200)}"/>`;
          if (Rs() < 0.25) s += `<path d="M${r0(x + bw / 2 - 2)} ${r0(base - bh)}v-30h4v30z"/>`;
          for (let yy = base - bh + 10; yy < base; yy += 14) for (let xx = x + 6; xx < x + bw - 6; xx += 12) if (Rs() < wp) win += `<rect x="${r0(xx)}" y="${r0(yy)}" width="5" height="6"/>`;
          x += bw + 2;
        }
        return `<g fill="${col}">${s}</g><g fill="${winC}" opacity=".85">${win}</g>`;
      };
      b += skyline(640, 60, 200, 40, 90, '#26284a', '#9fb4e0', 0.18, 3);
      b += skyline(690, 40, 160, 50, 110, '#161830', '#ffcf7a', 0.22, 5);
      b += `<circle cx="300" cy="420" r="4" fill="#ff3040"/><circle cx="300" cy="420" r="14" fill="url(#b4)"/>`;
      b += `<rect y="640" width="${w}" height="80" fill="#ff9f6a" opacity=".12"/>`;
      b += bokeh(R, 40, 0, 560, w, 760, 10, 34, ['b1', 'b2', 'b3', 'b4'], 0.3, 0.75);
      // balustrade
      b += `<rect y="735" width="${w}" height="${h - 735}" fill="#2a2018"/>`;
      let bal = '';
      for (let x = 30; x < w; x += 70) bal += `<path d="M${x - 16} 900V880Q${x - 22} 850 ${x - 8} 828Q${x - 20} 800 ${x - 12} 790H${x + 12}Q${x + 20} 800 ${x + 8} 828Q${x + 22} 850 ${x + 16} 880V900Z"/>`;
      b += `<g fill="url(#stone)">${bal}</g>`;
      b += `<path d="M0 742H1200V790H0Z" fill="url(#stone)"/><path d="M0 742H1200" stroke="#e8cfa8" stroke-width="3" opacity=".6"/>`;
      // a white sleeve at the left edge: forearm resting on the rail, the long sleeve draping over it
      b += `<path d="M-20 650C40 690 120 730 196 758L212 900H-20Z" fill="url(#sl)"/>`;
      b += `<path d="M30 700C40 760 36 840 40 900M90 726C104 780 100 850 108 900M150 748C160 800 158 860 166 900" stroke="#b9c1d0" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`;
      b += `<path d="M-20 900V880Q40 868 90 884T212 880V900Z" fill="#dfe4ec"/>`;
      b += `<path d="M-20 548C70 584 150 650 214 724L226 768C150 744 70 704-20 676Z" fill="url(#sl)"/>`;
      b += `<path d="M40 584Q60 620 52 660M100 618Q118 650 110 690M150 652Q164 680 158 714" stroke="#c4cbd8" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>`;
      b += `<path d="M196 704L214 724L226 768L206 762Z" fill="url(#cuff)"/><path d="M204 724q6-6 10 2t8 6M206 744q6-6 10 2" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/>`;
      b += `<path d="M216 726Q252 724 286 736Q300 742 290 750Q270 756 250 752Q236 760 226 766Z" fill="#f0d2bc"/><path d="M252 738q14 0 30 6M246 748q14 2 26 2" stroke="#c9a28a" stroke-width="2" fill="none"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.11);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_jl_selfie_gala — Jin Ling selfie in a tux with a peony pin (3:4)
     ===================================================================== */
  def('p_jl_selfie_gala', {
    title: 'A-Ling at the gala', w: 900, h: 1200, tags: ['jinling', 'selfie', 'gala', 'koi-tower', 'portrait'],
    svg: (w, h) => {
      const R = rng(1810);
      const defs =
        lin('bg', '0 0 0 1', '#2a1810 0|#5a3418 .5|#2a1810 1') +
        bokehDef('b1', '#ffd27a') + bokehDef('b2', '#ffb35c') + bokehDef('b3', '#fff0c8') + glowDef('cg', '#ffd27a', 0.8) +
        lin('tux', '0 0 1 1', '#2a2a30 0|#0e0e12 .6|#050507 1') +
        lin('lap', '0 0 1 0', '#3a3a44 0|#121216 .6|#2a2a32 1') +
        lin('gold', '0 0 1 1', '#fff0b0 0|#e0aa45 .5|#8a5a18 1') +
        vig('vg', 0.5) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += `<circle cx="180" cy="180" r="260" fill="url(#cg)" opacity=".7"/>`;
      b += bokeh(R, 34, 0, 0, w, 760, 26, 80, ['b1', 'b2', 'b3'], 0.2, 0.6);
      // a blurred guest in the background
      b += `<ellipse cx="770" cy="560" rx="110" ry="260" fill="#1a0f0a" opacity=".3"/><circle cx="770" cy="330" r="46" fill="#1a0f0a" opacity=".3"/>`;
      // shoulders / tux (camera arm goes off the right edge)
      b += `<g transform="translate(0 -120)">`;
      b += `<path d="M90 1340C100 1000 170 900 300 860L450 830L600 850C720 870 800 900 900 840V1340Z" fill="url(#tux)"/>`;
      b += `<path d="M600 850C700 840 800 800 900 700V900C820 940 700 930 600 900Z" fill="#141418"/>`;
      b += `<path d="M380 840L450 1340H520L560 850L470 880Z" fill="#f4f2ee"/>`;
      b += `<path d="M300 860L380 840L470 1000L420 1340H330Z" fill="url(#lap)"/><path d="M600 850L560 850L520 1000L560 1340H640L620 900Z" fill="url(#lap)"/>`;
      b += `<path d="M420 880L470 900L520 880L524 916L470 904L416 916Z" fill="#0a0a0c"/><circle cx="470" cy="900" r="10" fill="#141418"/>`;
      // peony pin on the lapel
      let pin = '<g transform="translate(590 960)">';
      for (let k = 0; k < 8; k++) pin += `<ellipse cx="0" cy="-14" rx="10" ry="15" fill="url(#gold)" transform="rotate(${k * 45})"/>`;
      for (let k = 0; k < 6; k++) pin += `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="#fff2c4" transform="rotate(${k * 60 + 20})"/>`;
      b += pin + `<circle r="5" fill="#c88a2a"/></g></g>`;
      // head
      b += `<g transform="translate(456 486) rotate(-4) scale(3.2)">${jlHead('smirk')}</g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_shot_gossip — Wavelet screenshot: @teaspiller_qh #BalconyGate (9:19.5)
     ===================================================================== */
  def('p_shot_gossip', {
    title: '#BalconyGate', w: 900, h: 1950, tags: ['screenshot', 'wavelet', 'gossip', 'nhs', 'xichen'],
    svg: (w, h) => {
      const T = (x, y, s, c, txt, wt, anchor) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${s}" fill="${c}"${wt ? ` font-weight="${wt}"` : ''}${anchor ? ` text-anchor="${anchor}"` : ''}>${txt}</text>`;
      const BLUE = '#0a84c8';
      const defs =
        lin('av', '0 0 1 1', '#3cc8b4 0|#0a84c8 1') +
        lin('ph', '0 0 0 1', '#0c1430 0|#1c2448 .6|#3a2a3a 1') +
        glowDef('door', '#ffd27a', 0.9) + bokehDef('pb', '#ffcf7a') + bokehDef('pc', '#9fb4ff');
      let b = `<rect width="${w}" height="${h}" fill="#fff"/>`;
      b += statusBar('11:33', false);
      b += `<path d="M58 168l-22 22 22 22" stroke="#111" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      b += T(450, 204, 40, '#111', 'Post', 700, 'middle');
      b += `<g fill="#111"><circle cx="812" cy="190" r="5"/><circle cx="832" cy="190" r="5"/><circle cx="852" cy="190" r="5"/></g>`;
      b += `<rect y="246" width="${w}" height="2" fill="#e8e8ec"/>`;
      // author
      b += `<circle cx="100" cy="330" r="48" fill="url(#av)"/><path d="M72 318h50v10q0 22-25 22t-25-22z" fill="#fff"/><path d="M122 322q14 0 12 12t-14 8" stroke="#fff" stroke-width="5" fill="none"/><path d="M84 306q4-10 0-18M98 306q4-10 0-18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      b += T(170, 320, 36, '#111', 'Tea Spiller', 700) + T(374, 320, 34, '#111', '\u{1FAD6}') + T(170, 366, 31, '#7a7a84', '@teaspiller_qh · 12m');
      b += `<rect x="690" y="296" width="150" height="62" rx="31" fill="#111"/>` + T(765, 338, 30, '#fff', 'Follow', 600, 'middle');
      const lines = [
        'Spotted at the Jin Group gala tonight \u{1F440}',
        'a certain CEO in purple and a certain',
        'Chancellor in white, ALONE on the Koi',
        'Tower balcony for twenty (20) minutes.',
        'The CEO left at 11:15 looking like he',
        'had seen a ghost. Thoughts? \u{1FAD6}',
      ];
      lines.forEach((l, i) => (b += T(56, 452 + i * 52, 36, '#111', esc(l))));
      b += T(56, 764, 36, BLUE, '#BalconyGate  #KoiTower  #JinGala', 500);
      // attached photo: long-lens shot of the balcony
      b += `<clipPath id="pc"><rect x="56" y="806" width="788" height="470" rx="28"/></clipPath>`;
      let ph = `<rect x="56" y="806" width="788" height="470" fill="url(#ph)"/>`;
      ph += `<rect x="330" y="880" width="260" height="300" fill="#2a2030"/><rect x="380" y="900" width="160" height="270" fill="#ffd27a" opacity=".85"/><circle cx="460" cy="1030" r="220" fill="url(#door)" opacity=".6"/>`;
      ph += `<path d="M56 1150H844V1180H56Z" fill="#6a5a50"/>`;
      for (let x = 70; x < 844; x += 36) ph += `<rect x="${x}" y="1180" width="14" height="100" fill="#4a3c36"/>`;
      ph += `<g transform="translate(420 1150)"><circle cx="0" cy="-118" r="13" fill="#140c10"/><path d="M-16-104H16L20-50L14 0H-14L-20-50Z" fill="#5a2d82"/></g>`;
      ph += `<g transform="translate(500 1150)"><circle cx="0" cy="-122" r="13" fill="#140c10"/><path d="M-17-108H17L26 0H-26Z" fill="#f2f2f6"/><path d="M-26 0Q0-10 26 0" stroke="#9cc0e8" stroke-width="4" fill="none"/></g>`;
      for (const [x, y, r] of [[120, 900, 30], [780, 880, 40], [700, 1000, 24], [180, 1040, 34]]) ph += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#pb)" opacity=".6"/>`;
      ph += `<g fill="#0e1a10" opacity=".8"><ellipse cx="110" cy="1230" rx="90" ry="26" transform="rotate(-35 110 1230)"/><ellipse cx="170" cy="1260" rx="80" ry="22" transform="rotate(-15 170 1260)"/><ellipse cx="790" cy="1220" rx="90" ry="24" transform="rotate(40 790 1220)"/><ellipse cx="740" cy="1262" rx="70" ry="20" transform="rotate(10 740 1262)"/></g>`;
      ph += `<rect x="56" y="806" width="788" height="470" fill="#000" opacity=".12"/>`;
      b += `<g clip-path="url(#pc)">${ph}</g>`;
      b += T(56, 1330, 28, '#7a7a84', '11:21 PM · Oct 16, 2026 · 48.2K views');
      b += `<rect x="56" y="1360" width="788" height="2" fill="#ececf0"/>`;
      // engagement row
      const icon = {
        reply: '<path d="M0 0h34a10 10 0 0 1 10 10v18a10 10 0 0 1-10 10H16l-10 9v-9H0a10 10 0 0 1-10-10V10A10 10 0 0 1 0 0z" fill="none" stroke="#555" stroke-width="3.5"/>',
        rewave: '<path d="M-6 14q10-16 24-12t22 0M-6 24q10-16 24-12t22 0" stroke="#555" stroke-width="3.5" fill="none" stroke-linecap="round"/>',
        like: '<path d="M16 40C-14 20-8 0 4 0q8 0 12 8q4-8 12-8c12 0 18 20-12 40z" fill="#ff3b5c"/>',
        share: '<path d="M14 2v28M2 14l12-12 12 12M-2 24v14h32V24" stroke="#555" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      };
      b += `<g transform="translate(80 1394)">${icon.reply}</g>` + T(140, 1428, 30, '#555', '318');
      b += `<g transform="translate(290 1398)">${icon.rewave}</g>` + T(346, 1428, 30, '#555', '1.1K');
      b += `<g transform="translate(500 1394)">${icon.like}</g>` + T(552, 1428, 30, '#ff3b5c', '2.4K', 600);
      b += `<g transform="translate(760 1392)">${icon.share}</g>`;
      b += `<rect y="1470" width="${w}" height="2" fill="#ececf0"/>`;
      // replies
      const reply = (y, c, handle, t, txt) =>
        `<circle cx="96" cy="${y + 30}" r="36" fill="${c}"/>` + T(150, y + 22, 30, '#111', handle, 700) + T(844, y + 22, 28, '#8a8a92', t, 0, 'end') + T(150, y + 66, 32, '#222', esc(txt));
      b += reply(1500, '#f59f00', '@jingyi_lan', '9m', 'WAIT. WHAT \u{1F480}\u{1F480}\u{1F480}');
      b += reply(1610, '#f76707', '@yiling_radish_king', '8m', 'chengcheng??? \u{1F440}\u{1F440}');
      b += reply(1720, '#2f9e44', '@huaisang_fans', '6m', 'I don’t know anything!! \u{1FAAD}\u{1F648}');
      b += `<rect y="1820" width="${w}" height="130" fill="#fafafa"/><rect x="40" y="1840" width="820" height="60" rx="30" fill="#efeff3"/>` + T(80, 1880, 30, '#9a9aa2', 'Post your reply');
      b += `<rect x="310" y="1920" width="280" height="10" rx="5" fill="#111"/>`;
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_shot_bank — Yunmeng Commercial Bank: allowance to Jin Ling (9:19.5)
     ===================================================================== */
  def('p_shot_bank', {
    title: 'Allowance transfer', w: 900, h: 1950, tags: ['screenshot', 'bank', 'jinling', 'allowance'],
    svg: (w, h) => {
      const T = (x, y, s, c, txt, wt, anchor) => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${s}" fill="${c}"${wt ? ` font-weight="${wt}"` : ''}${anchor ? ` text-anchor="${anchor}"` : ''}>${txt}</text>`;
      const TEAL = '#0d6e74';
      const defs = lin('hd', '0 0 1 1', '#0b5a68 0|#13857c 1') + lin('ok', '0 0 0 1', '#3ad07a 0|#1fa85a 1');
      let b = `<rect width="${w}" height="${h}" fill="#f1f2f6"/>`;
      b += `<path d="M0 0H900V470Q450 520 0 470Z" fill="url(#hd)"/>`;
      b += statusBar('08:01', true);
      b += `<path d="M58 168l-22 22 22 22" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      b += T(450, 204, 40, '#fff', 'Transfer Details', 700, 'middle');
      // bank mark: three wave-petals in a ring
      b += `<g transform="translate(262 286)"><circle r="26" fill="none" stroke="#fff" stroke-width="3.5"/><path d="M-14 6q7-12 14 0t14 0M-14-4q7-12 14 0t14 0" stroke="#fff" stroke-width="3.5" fill="none"/></g>`;
      b += T(302, 297, 30, '#e6fbf8', 'Yunmeng Commercial Bank', 600);
      // receipt card
      b += `<rect x="40" y="350" width="820" height="520" rx="36" fill="#fff"/>`;
      b += `<circle cx="450" cy="480" r="66" fill="url(#ok)"/><path d="M420 482l22 22 40-44" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      b += T(450, 610, 38, '#1a1a1e', 'Transfer Successful', 700, 'middle');
      b += T(450, 720, 84, '#1a1a1e', '¥3,000.00', 700, 'middle');
      b += T(450, 790, 32, '#6a6a72', 'To Jin Ling (金凌)', 400, 'middle');
      // details
      b += `<rect x="40" y="900" width="820" height="700" rx="36" fill="#fff"/>`;
      const rows = [
        ['Payee', 'Jin Ling 金凌'],
        ['Payee account', 'Yunmeng Comm. ···· 1018'],
        ['From', 'Debit Card ···· 0515'],
        ['Note', 'Allowance (Oct). Not for dog toys.'],
        ['Time', '2026-10-01 08:00:47'],
        ['Fee', '¥0.00'],
        ['Reference', 'YC2026100108004731'],
      ];
      rows.forEach(([k, v], i) => {
        const y = 980 + i * 88;
        b += T(84, y, 31, '#8a8a92', k) + T(816, y, 31, '#1a1a1e', esc(v), 500, 'end');
        if (i < rows.length - 1) b += `<rect x="84" y="${y + 36}" width="732" height="2" fill="#f0f0f4"/>`;
      });
      b += `<rect x="40" y="1650" width="390" height="104" rx="52" fill="#fff" stroke="${TEAL}" stroke-width="3"/>` + T(235, 1714, 34, TEAL, 'Transfer Again', 600, 'middle');
      b += `<rect x="470" y="1650" width="390" height="104" rx="52" fill="${TEAL}"/>` + T(665, 1714, 34, '#fff', 'Done', 600, 'middle');
      b += `<rect x="310" y="1920" width="280" height="10" rx="5" fill="#111"/>`;
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_receipt — Pet Kingdom receipt: dog food 20 kg
     ===================================================================== */
  def('p_receipt', {
    title: 'Pet Kingdom receipt', w: 1200, h: 900, tags: ['receipt', 'fairy', 'pet-kingdom', 'dog'],
    svg: (w, h) => {
      const MONO = "Menlo, 'Courier New', Courier, monospace";
      const T = (x, y, s, txt, wt, anchor, c) => `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${s}" fill="${c || '#3a3a3e'}"${wt ? ` font-weight="${wt}"` : ''}${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(txt)}</text>`;
      const defs =
        lin('wd', '0 0 1 1', '#4a2e1c 0|#6a442a .5|#3a2416 1') +
        lin('pp', '0 0 0 1', '#fbfaf6 0|#f2f0ea .7|#e2dfd6 1') +
        rad('lt', '.35 .3 .8', '#fff4e0 0 .35|#fff4e0 1 0') +
        vig('vg', 0.55) + grainDef('gr', 0.8);
      let b = `<rect width="${w}" height="${h}" fill="url(#wd)"/>`;
      const R = rng(5);
      let grainL = '';
      for (let i = 0; i < 26; i++) {
        const y = R() * 900;
        grainL += `M0 ${r0(y)}C300 ${r0(y + (R() - 0.5) * 40)} 800 ${r0(y + (R() - 0.5) * 40)} 1200 ${r0(y + (R() - 0.5) * 30)}`;
      }
      b += `<path d="${grainL}" stroke="#2a180c" stroke-width="2" fill="none" opacity=".35"/>`;
      // pen
      b += `<g transform="translate(960 640) rotate(-28)"><rect x="-200" y="-11" width="360" height="22" rx="11" fill="#1d1d24"/><rect x="100" y="-11" width="70" height="22" fill="#c9a64a"/><path d="M160-11L210 0L160 11Z" fill="#c9c4b8"/><rect x="-170" y="-16" width="90" height="6" rx="3" fill="#c9a64a"/></g>`;
      // receipt
      let zig = '';
      for (let x = 0; x <= 440; x += 20) zig += `L${x} ${x % 40 ? 8 : 0}`;
      const paper = `M0 0${zig}L440 1000L0 1000Z`;
      let r = `<path d="${paper}" fill="#000" opacity=".35" transform="translate(14 18)"/><path d="${paper}" fill="url(#pp)"/>`;
      r += T(220, 70, 34, 'PET KINGDOM', 700, 'middle');
      r += T(220, 104, 18, 'Lanling Flagship Store', 0, 'middle') + T(220, 130, 18, 'Tel 0571-6018 8899', 0, 'middle');
      r += T(30, 176, 18, '2026-10-10 18:42   #0042117');
      r += T(30, 204, 18, '--------------------------------');
      const items = [['Large Breed Adult', ''], ['  Dog Food 20 kg  x1', '689.00'], ['Salmon Treats 500g x2', '96.00'], ['Chew Rope XL     x1', '59.00'], ['(indestructible)', '']];
      items.forEach(([a, p], i) => {
        r += T(30, 238 + i * 30, 19, a, i === 1 ? 700 : 0) + (p ? T(410, 238 + i * 30, 19, p, i === 1 ? 700 : 0, 'end') : '');
      });
      r += T(30, 394, 18, '--------------------------------');
      r += T(30, 428, 19, 'SUBTOTAL') + T(410, 428, 19, '844.00', 0, 'end');
      r += T(30, 458, 19, 'MEMBER -5%') + T(410, 458, 19, '-42.20', 0, 'end');
      r += T(30, 500, 26, 'TOTAL', 700) + T(410, 500, 26, '¥801.80', 700, 'end');
      r += T(30, 540, 18, 'PAID  DEBIT ****0515');
      r += T(30, 570, 18, 'MEMBER: JIANG W.Y.');
      r += T(30, 600, 18, 'PET ON FILE: FAIRY (XL)');
      r += T(220, 650, 20, '* THANK YOU! WOOF! *', 700, 'middle');
      let bars = '';
      for (let x = 60, i = 0; x < 380; i++) { const bw = 2 + ((i * 7) % 5); bars += `<rect x="${x}" y="680" width="${bw}" height="70"/>`; x += bw + 2 + ((i * 3) % 4); }
      r += `<g fill="#2a2a2e">${bars}</g>` + T(220, 776, 16, '6 901234 567892', 0, 'middle');
      r += `<path d="M30 260H410" stroke="#e0b030" stroke-width="22" opacity=".0"/>`;
      b += `<g transform="translate(330 46) rotate(-5)">${r}</g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#lt)"/><rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_wn_van — Wen Ning's old van, "Yiling Radish Co.", tow rope ready
     ===================================================================== */
  def('p_wn_van', {
    title: 'Yiling Radish Co. van', w: 1200, h: 900, tags: ['van', 'wen-ning', 'wwx', 'night', 'tow'],
    svg: (w, h) => {
      const R = rng(33);
      const defs =
        lin('sky', '0 0 0 1', '#0b1026 0|#1c1d3c .7|#3a2a3c 1') +
        lin('road', '0 0 0 1', '#2a2a36 0|#15151d 1') +
        glowDef('lamp', '#ffd890', 0.9) + glowDef('tg', '#ffcf73', 0.6) +
        rad('pool', '.5 .5 .5', '#ffd890 0 .45|#ffd890 1 0') +
        lin('paint', '0 0 0 1', '#f6efd6 0|#e6dcb8 .7|#cfc39c 1') +
        lin('band', '0 0 0 1', '#4f9e64 0|#2f7444 1') +
        lin('glass', '0 0 1 1', '#3a4660 0|#151a28 .6|#2a3248 1') +
        rad('hub', '.4 .4 .6', '#f4f4f6 0|#a8aab4 .6|#5a5c66 1') +
        lin('rope', '0 0 1 0', '#ffb020 0|#ffd040 .5|#e88a10 1') +
        lin('shade', '1 0 0 0', '#000 0 .45|#000 .5 .1|#000 1 0') +
        bokehDef('b1', '#ffcf7a') + bokehDef('b2', '#ff9f6a') +
        vig('vg', 0.6) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="120" cy="300" r="420" fill="url(#tg)"/>`;
      // background buildings + Koi Tower edge
      let bl = '', win = '';
      for (let x = 240; x < w; x += 0) {
        const bw = 80 + R() * 120, bh = 120 + R() * 200;
        bl += `<rect x="${r0(x)}" y="${r0(560 - bh)}" width="${r0(bw)}" height="${r0(bh)}"/>`;
        for (let yy = 570 - bh; yy < 540; yy += 22) for (let xx = x + 10; xx < x + bw - 10; xx += 20) if (R() < 0.3) win += `<rect x="${r0(xx)}" y="${r0(yy)}" width="8" height="10"/>`;
        x += bw + 6;
      }
      b += `<g fill="#141428">${bl}</g><g fill="#ffcf7a" opacity=".6">${win}</g>`;
      b += `<path d="M0 120H200V560H0Z" fill="#1c1430"/><path d="M-20 120H230L210 100H0Z" fill="#2a1d40"/><path d="M-20 120H230" stroke="#ffcf6b" stroke-width="3"/><path d="M0 300H230L210 280H0ZM0 470H230L210 450H0Z" fill="#2a1d40"/><path d="M0 300H230M0 470H230" stroke="#ffcf6b" stroke-width="3"/>`;
      for (let y = 140; y < 540; y += 40) for (let x = 20; x < 190; x += 34) if (R() < 0.8) b += `<rect x="${x}" y="${y}" width="14" height="22" fill="#ffc861" opacity="${f1(0.5 + R() * 0.5)}"/>`;
      b += bokeh(R, 14, 220, 400, w, 560, 8, 22, ['b1', 'b2'], 0.3, 0.7);
      // road
      b += `<rect y="560" width="${w}" height="340" fill="url(#road)"/>`;
      b += `<ellipse cx="760" cy="760" rx="520" ry="120" fill="url(#pool)"/>`;
      b += `<path d="M0 850H1200" stroke="#e8e4d0" stroke-width="10" stroke-dasharray="80 60" opacity=".55"/>`;
      // lamp post
      b += `<rect x="1080" y="70" width="14" height="640" fill="#14141c"/><path d="M1087 76Q1060 40 990 50" stroke="#14141c" stroke-width="10" fill="none"/><path d="M960 50h70l-10 18h-50z" fill="#1d1d26"/>`;
      b += `<circle cx="995" cy="72" r="190" fill="url(#lamp)" opacity=".8"/><ellipse cx="995" cy="70" rx="26" ry="8" fill="#fff6d8"/>`;
      // van (facing left), ground at y=738
      let v = `<g transform="translate(170 738)">`;
      v += `<ellipse cx="400" cy="6" rx="420" ry="24" fill="#000" opacity=".45"/>`;
      const BODY = 'M22-50L20-190Q22-230 60-250L150-350Q166-366 200-368H726Q756-368 758-338L762-60Q762-44 746-44H690A62 62 0 0 0 566-44H236A62 62 0 0 0 112-44H40Q22-44 22-50Z';
      v += `<path d="${BODY}" fill="url(#paint)"/>`;
      v += `<path d="M22-130H762V-60Q762-44 746-44H690A62 62 0 0 0 566-44H236A62 62 0 0 0 112-44H40Q22-44 22-50Z" fill="url(#band)"/>`;
      v += `<path d="M22-136H762" stroke="#f6efd6" stroke-width="4"/>`;
      // rust + dents
      v += `<g fill="#9a5a2a" opacity=".55"><path d="M120-60q10-14 26-6q8 10-6 14q-14 2-20-8z"/><path d="M590-62q12-10 24-2q4 8-8 10z"/><path d="M700-300q10-6 16 2q-2 8-12 6z"/><circle cx="40" cy="-200" r="5"/></g>`;
      // windows
      v += `<path d="M66-246L152-340Q164-352 186-352H232V-246Z" fill="url(#glass)"/>`;
      v += `<path d="M250-352H420V-246H250Z" fill="url(#glass)"/><path d="M440-352H720Q740-352 740-332V-246H440Z" fill="url(#glass)"/>`;
      v += `<path d="M100-262L170-338M270-262L320-344M470-262L520-344M600-262L650-344" stroke="#9fb4d8" stroke-width="5" opacity=".25"/>`;
      v += `<path d="M240-368V-44M430-368V-44" stroke="#8a8068" stroke-width="3" opacity=".6"/><path d="M432-200H760" stroke="#8a8068" stroke-width="3" opacity=".5"/>`;
      v += `<rect x="200" y="-226" width="26" height="8" rx="4" fill="#5a5444"/><rect x="450" y="-226" width="26" height="8" rx="4" fill="#5a5444"/>`;
      // mirror, light, bumper
      v += `<path d="M58-246q-26-4-30 14l4 18h22z" fill="#2a2a30"/>`;
      v += `<circle cx="34" cy="-112" r="16" fill="#fff6d8"/><circle cx="34" cy="-112" r="40" fill="url(#lamp)" opacity=".6"/>`;
      v += `<rect x="10" y="-80" width="60" height="22" rx="8" fill="#8a8a92"/><rect x="730" y="-80" width="44" height="22" rx="8" fill="#8a8a92"/><rect x="744" y="-150" width="16" height="34" rx="4" fill="#c8202e"/>`;
      // roof rack with a crate of radishes
      v += `<path d="M260-368V-384M700-368V-384M240-384H720" stroke="#3a3a40" stroke-width="6"/>`;
      v += `<rect x="420" y="-440" width="200" height="56" fill="#b07a40"/><path d="M420-420H620M420-402H620" stroke="#8a5a2a" stroke-width="3"/>`;
      for (const x of [440, 474, 510, 548, 584]) v += `<path d="M${x}-440q-14-40-2-60q10 26 4 60zM${x + 8}-440q10-44 30-50q-12 30-22 50z" fill="#4f9e44"/>`;
      // radish logo + lettering
      v += `<g transform="translate(300 -196) rotate(-14)"><path d="M0-40C22-40 30-14 22 10C14 40 4 60 0 76C-4 60-14 40-22 10C-30-14-22-40 0-40Z" fill="#fbf8f0" stroke="#2f7444" stroke-width="4"/><path d="M-2-40q-24-30-12-56q10 24 14 56zM2-40q6-36 30-46q-12 26-26 46z" fill="#4f9e44"/><path d="M-10 6h10M-6 26h8" stroke="#cfc6b0" stroke-width="3"/></g>`;
      v += `<text x="352" y="-176" font-family="'Arial Rounded MT Bold', 'Chalkboard SE', ${FONT}" font-size="58" font-weight="800" fill="#2f7444" stroke="#f6efd6" stroke-width="2" textLength="384" lengthAdjust="spacingAndGlyphs">Yiling Radish Co.</text>`;
      // wheels
      for (const x of [174, 628]) v += `<circle cx="${x}" cy="-44" r="52" fill="#121216"/><circle cx="${x}" cy="-44" r="30" fill="url(#hub)"/><circle cx="${x}" cy="-44" r="10" fill="#6a6c76"/>`;
      // tow rope from the rear hook, coiled on the ground and running off-frame
      v += `<path d="M770-62Q800-40 790-6Q780 30 860 36Q960 40 1100 20" stroke="url(#rope)" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      v += `<ellipse cx="880" cy="40" rx="70" ry="18" fill="none" stroke="#ffc030" stroke-width="12"/><ellipse cx="880" cy="34" rx="54" ry="13" fill="none" stroke="#e8a018" stroke-width="10"/>`;
      v += `<path d="M762-66h20v12h-20z" fill="#3a3a40"/><path d="M780-60q10-10 6-22" stroke="#9a9aa4" stroke-width="5" fill="none"/>`;
      v += `<path d="${BODY}" fill="url(#shade)"/>`;
      b += v + `</g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.1);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_taxi_night — back seat of the taxi, rain on the window
     ===================================================================== */
  def('p_taxi_night', {
    title: 'Taxi, rain', w: 1200, h: 900, tags: ['taxi', 'night', 'rain', 'swift-ride', 'lanling'],
    svg: (w, h) => {
      const R = rng(2321);
      const defs =
        lin('out', '0 0 0 1', '#0d1430 0|#1b2148 .5|#2a2240 1') +
        bokehDef('b1', '#ffb347') + bokehDef('b2', '#ff4d5e') + bokehDef('b3', '#5fd0d8') + bokehDef('b4', '#fff0c8') + bokehDef('b5', '#c87bff') +
        lin('door', '0 0 0 1', '#24242c 0|#141418 1') +
        lin('seat', '0 0 1 1', '#3a3a44 0|#1c1c22 .6|#101014 1') +
        lin('streak', '0 0 1 0', '#ffb35c 0 0|#ffb35c .5 .22|#ffb35c 1 0') +
        rad('drop', '.38 .32 .7', '#ffffff 0 .55|#c8d8ff .3 .18|#0b1020 .85 .35|#ffffff 1 .5') +
        glowDef('dash', '#4fc8ff', 0.5) +
        vig('vg', 0.65) + grainDef('gr', 0.95);
      let b = `<rect width="${w}" height="${h}" fill="#0c0c10"/>`;
      // window (outside view)
      const WIN = 'M70 120Q80 70 140 66H760Q820 70 830 130L860 560Q862 610 810 612H120Q70 610 66 560Z';
      b += `<clipPath id="wc"><path d="${WIN}"/></clipPath>`;
      let o = `<rect x="40" y="40" width="860" height="600" fill="url(#out)"/>`;
      o += `<rect x="40" y="420" width="860" height="220" fill="#2a1a2a" opacity=".6"/>`;
      o += bokeh(R, 34, 60, 160, 880, 620, 16, 64, ['b1', 'b2', 'b3', 'b4', 'b5'], 0.25, 0.75);
      // rain drops and streaks
      for (let i = 0; i < 150; i++) {
        const x = 70 + R() * 800, y = 70 + R() * 550, r = 3 + R() * R() * 16;
        o += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f1(r)}" ry="${f1(r * 1.15)}" fill="url(#drop)"/>`;
      }
      let st = '';
      for (let i = 0; i < 22; i++) {
        const x = 90 + R() * 760, y = 80 + R() * 380, l = 60 + R() * 160;
        st += `M${r0(x)} ${r0(y)}q${f1((R() - 0.5) * 10)} ${r0(l / 2)} ${f1((R() - 0.5) * 16)} ${r0(l)}`;
      }
      o += `<path d="${st}" stroke="#cfe0ff" stroke-width="2.5" opacity=".35" fill="none" stroke-linecap="round"/>`;
      b += `<g clip-path="url(#wc)">${o}</g>`;
      b += `<path d="${WIN}" fill="none" stroke="#08080a" stroke-width="22"/>`;
      // door panel
      b += `<path d="M0 0H900L860 130L890 640Q880 680 840 690H0Z" fill="none"/>`;
      b += `<path d="M0 640H900Q930 660 920 900H0Z" fill="url(#door)"/>`;
      b += `<path d="M120 700H560Q600 700 600 730V760Q600 780 570 780H130Q100 780 100 750V720Q100 700 120 700Z" fill="#1c1c22" stroke="#2c2c34" stroke-width="3"/>`;
      b += `<path d="M640 720H820Q840 720 840 740V744Q840 760 820 760H640Z" fill="#3a3a44"/><path d="M650 732H810" stroke="#6a6a74" stroke-width="4" stroke-linecap="round"/>`;
      let grille = '';
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) grille += `<circle cx="${180 + i * 18}" cy="${830 + j * 14}" r="3.4"/>`;
      b += `<g fill="#0a0a0c">${grille}</g>`;
      b += `<path d="M0 0H60V900H0Z" fill="#141418"/><path d="M0 0H1200V60H0Z" fill="#101014"/>`;
      // front seat back + headrest (right)
      b += `<path d="M900 900C890 700 900 470 960 380Q1000 340 1080 336H1200V900Z" fill="url(#seat)"/>`;
      b += `<path d="M1010 290v56M1120 290v56" stroke="#9a9aa4" stroke-width="8" stroke-linecap="round"/><path d="M990 296Q980 190 1040 170H1150Q1200 174 1200 220V296Z" fill="url(#seat)"/>`;
      b += `<path d="M960 520Q1080 500 1200 510" stroke="#2a2a32" stroke-width="4" fill="none"/><path d="M940 700Q1080 690 1200 700" stroke="#2a2a32" stroke-width="4" fill="none"/>`;
      b += `<circle cx="1180" cy="120" r="140" fill="url(#dash)"/>`;
      // passing street-light streak across the cabin
      b += `<path d="M0 520L1200 280V360L0 620Z" fill="url(#streak)" opacity=".6"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.13);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_hotel_lobby — Golden Peony Hotel lobby
     ===================================================================== */
  def('p_hotel_lobby', {
    title: 'Golden Peony lobby', w: 1200, h: 900, tags: ['hotel', 'golden-peony', 'night', 'lanling'],
    svg: (w, h) => {
      const R = rng(1808);
      const defs =
        lin('wall', '0 0 0 1', '#5a3a1c 0|#a8763a .55|#6a4420 1') +
        lin('panel', '0 0 0 1', '#e8c070 0|#c8903c .5|#8a5a20 1') +
        lin('floor', '0 0 0 1', '#e8dccb 0|#b8a890 .5|#6a5a48 1') +
        lin('col', '0 0 1 0', '#d8ccb8 0|#f6f0e4 .4|#b8ab96 1') +
        lin('desk', '0 0 0 1', '#2a221c 0|#14100c 1') +
        lin('cloth', '0 0 0 1', '#fffaf0 0|#e6dccb 1') +
        lin('vase', '0 0 1 0', '#8a6020 0|#f4d27a .45|#a87828 1') +
        glowDef('cg', '#ffd27a', 0.9) + glowDef('cand', '#ffcf73', 1) + glowDef('wl', '#ffd890', 0.6) +
        vig('vg', 0.5) + grainDef('gr', 0.85) + bloomDefs() + `<g id="ch">${chandBody()}</g>`;
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      // back wall gold panels with a peony relief
      b += `<rect x="300" y="120" width="600" height="420" fill="url(#panel)"/>`;
      for (let x = 300; x <= 900; x += 120) b += `<path d="M${x} 120V540" stroke="#7a4e1c" stroke-width="3" opacity=".6"/>`;
      let relief = '<g transform="translate(600 300)" fill="none" stroke="#fff1c8" stroke-width="5" opacity=".75">';
      for (let k = 0; k < 10; k++) relief += `<path d="M0 0C-30-30-26-80 0-96C26-80 30-30 0 0" transform="rotate(${k * 36})"/>`;
      b += relief + `<circle r="22" fill="#fff1c8" stroke="none"/></g>`;
      b += `<circle cx="600" cy="300" r="260" fill="url(#wl)"/>`;
      // floor (marble, perspective tiles, reflections)
      b += `<path d="M0 560H1200V900H0Z" fill="url(#floor)"/>`;
      let tiles = '';
      for (let i = -14; i <= 14; i++) tiles += `M${600 + i * 50} 560L${600 + i * 210} 900`;
      for (let i = 0; i < 9; i++) { const y = r0(560 + Math.pow(i / 8, 1.7) * 340); tiles += `M0 ${y}H1200`; }
      b += `<path d="${tiles}" stroke="#8a7a64" stroke-width="2" opacity=".45"/>`;
      b += `<ellipse cx="600" cy="640" rx="380" ry="60" fill="#fff4d8" opacity=".25"/><rect x="560" y="560" width="80" height="340" fill="#ffd27a" opacity=".12"/>`;
      // reception desk + staff
      b += `<path d="M360 470H840V560H360Z" fill="url(#desk)"/><path d="M360 470H840" stroke="#e8c070" stroke-width="5"/><path d="M360 548H840" stroke="#e8c070" stroke-width="2" opacity=".6"/>`;
      for (const x of [470, 720]) b += `<g transform="translate(${x} 470)" fill="#1a120c"><circle cx="0" cy="-58" r="14"/><path d="M-20-44H20L24 0H-24Z"/><path d="M-6-44L0-34L6-44Z" fill="#e8c070"/></g>`;
      // columns
      const column = (x, y0, y1, wd) => `<rect x="${x - wd / 2}" y="${y0}" width="${wd}" height="${y1 - y0}" fill="url(#col)"/><rect x="${x - wd / 2 - 10}" y="${y0}" width="${wd + 20}" height="26" fill="#e8c070"/><rect x="${x - wd / 2 - 10}" y="${y1 - 22}" width="${wd + 20}" height="22" fill="#c8963c"/><path d="M${x - wd / 4} ${y0 + 40}V${y1 - 30}M${x + wd / 4} ${y0 + 40}V${y1 - 30}" stroke="#a89880" stroke-width="2" opacity=".5"/>`;
      b += column(250, 60, 600, 60) + column(950, 60, 600, 60) + column(80, 0, 760, 110) + column(1120, 0, 760, 110);
      // sofa (left) and luggage cart + bellhop (right)
      b += `<path d="M150 640Q150 600 190 600H330Q370 600 370 640V700H150Z" fill="#5a2a5e"/><path d="M140 660H380V720H140Z" fill="#6a3470"/><rect x="146" y="716" width="10" height="20" fill="#c8963c"/><rect x="364" y="716" width="10" height="20" fill="#c8963c"/>`;
      b += `<g transform="translate(900 760)"><path d="M-80 0V-200M80 0V-200M-90-200Q0-260 90-200" stroke="#e0b050" stroke-width="7" fill="none"/><rect x="-90" y="-10" width="180" height="14" fill="#c8963c"/><rect x="-70" y="-80" width="70" height="70" rx="6" fill="#2a3a5a"/><rect x="4" y="-110" width="60" height="100" rx="6" fill="#7a2a2a"/><rect x="-60" y="-130" width="50" height="50" rx="5" fill="#c8a070"/><circle cx="-70" cy="10" r="12" fill="#1a1a1a"/><circle cx="70" cy="10" r="12" fill="#1a1a1a"/></g>`;
      b += `<g transform="translate(1030 760)" fill="#1c140e"><circle cx="0" cy="-150" r="15"/><rect x="-14" y="-172" width="28" height="10" rx="3" fill="#7a1a24"/><path d="M-22-134H22L26-60H16L14 0H-14L-16-60H-26Z"/><path d="M-22-134H22V-120H-22Z" fill="#7a1a24"/></g>`;
      // centre table with the big peony arrangement + chandelier
      b += `<use href="#ch" transform="translate(600 40) scale(.8)"/>`;
      b += `<ellipse cx="600" cy="790" rx="150" ry="30" fill="#000" opacity=".25"/><path d="M470 700H730L700 790H500Z" fill="#2a1e14"/><ellipse cx="600" cy="700" rx="140" ry="26" fill="#3a2a1c" stroke="#e8c070" stroke-width="4"/>`;
      b += arrangement(600, 690, 1.15, R);
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_moon_street — moon over a rainy Lanling street (player's camera)
     ===================================================================== */
  def('p_moon_street', {
    title: 'Moon over a rainy street', w: 1200, h: 900, tags: ['moon', 'night', 'rain', 'lanling', 'street'],
    svg: (w, h) => {
      const R = rng(1047);
      const VX = 600, VY = 520;
      const defs =
        lin('sky', '0 0 0 1', '#060a1e 0|#121a3a .6|#2a2440 1') +
        rad('mn', '.45 .4 .6', '#ffffff 0|#f6f0dc .8|#e2d8bc 1') + glowDef('mg', '#c8d8ff', 0.5) +
        lin('road', '0 0 0 1', '#141822 0|#0a0c12 1') +
        lin('bl', '1 0 0 0', '#0e1020 0|#1c1c34 1') + lin('br', '0 0 1 0', '#0e1020 0|#1c1c34 1') +
        glowDef('n1', '#ff4d7a', 0.8) + glowDef('n2', '#3fe0d0', 0.8) + glowDef('n3', '#ffb347', 0.9) + glowDef('n4', '#b07bff', 0.8) + glowDef('red', '#ff2a3a', 0.9) +
        lin('rf1', '0 0 0 1', '#ff4d7a 0 .5|#ff4d7a 1 0') + lin('rf2', '0 0 0 1', '#3fe0d0 0 .5|#3fe0d0 1 0') + lin('rf3', '0 0 0 1', '#ffb347 0 .55|#ffb347 1 0') + lin('rf4', '0 0 0 1', '#b07bff 0 .5|#b07bff 1 0') +
        vig('vg', 0.6) + grainDef('gr', 1);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="600" cy="170" r="260" fill="url(#mg)"/><circle cx="600" cy="170" r="54" fill="url(#mn)"/>`;
      b += `<ellipse cx="520" cy="210" rx="180" ry="10" fill="#6a7aa8" opacity=".3"/>`;
      // buildings (left and right walls in perspective)
      b += `<path d="M0 0H420L470 470L0 620Z" fill="url(#bl)"/><path d="M1200 0H780L730 470L1200 620Z" fill="url(#br)"/>`;
      let win = '';
      for (let i = 0; i < 9; i++) {
        const t = i / 9;
        for (let j = 0; j < 7; j++) {
          if (R() < 0.45) continue;
          const xL = 20 + t * 400, yT = 40 + j * 64 - t * 0, hh = 30 * (1 - t * 0.6), ww = 26 * (1 - t * 0.6);
          win += `<rect x="${r0(xL)}" y="${r0(yT + t * j * 18)}" width="${r0(ww)}" height="${r0(hh)}"/>`;
          if (R() < 0.6) win += `<rect x="${r0(1200 - xL - ww)}" y="${r0(yT + t * j * 18 + 10)}" width="${r0(ww)}" height="${r0(hh)}"/>`;
        }
      }
      b += `<g fill="#ffcf85" opacity=".55">${win}</g>`;
      // neon signs (no lettering) and their glows
      const neon = [[120, 330, 'n1', 120, 46], [300, 260, 'n2', 70, 70], [930, 300, 'n3', 110, 40], [1080, 380, 'n4', 80, 80], [420, 420, 'n3', 40, 30], [770, 410, 'n1', 40, 34]];
      for (const [x, y, g, ww, hh] of neon) b += `<circle cx="${x}" cy="${y}" r="${ww}" fill="url(#${g})" opacity=".7"/><rect x="${x - ww / 2}" y="${y - hh / 2}" width="${ww}" height="${hh}" rx="10" fill="none" stroke="#fff" stroke-width="4" opacity=".85"/>`;
      b += `<path d="M285 260a15 15 0 0 0 30 0z" fill="none" stroke="#fff" stroke-width="4"/><circle cx="1080" cy="380" r="22" fill="none" stroke="#fff" stroke-width="4"/>`;
      // shopfronts + awnings at street level
      b += `<path d="M0 520L460 462V500L0 620Z" fill="#ffcf85" opacity=".35"/><path d="M1200 520L740 462V500L1200 620Z" fill="#9fe0ff" opacity=".3"/>`;
      b += `<path d="M0 500L300 466V478L0 520Z" fill="#7a1a2a"/><path d="M1200 500L900 466V478L1200 520Z" fill="#1a4a5a"/>`;
      for (const [x, y, s] of [[180, 560, 1], [380, 500, 0.6], [1020, 560, 1], [820, 500, 0.6]]) b += `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-260" width="8" height="260" fill="#05060c"/><path d="M0-260q${x < 600 ? 40 : -40}-10 ${x < 600 ? 60 : -60} 0" stroke="#05060c" stroke-width="6" fill="none"/><circle cx="${x < 600 ? 60 : -60}" cy="-252" r="70" fill="url(#n3)" opacity=".55"/><circle cx="${x < 600 ? 60 : -60}" cy="-252" r="8" fill="#fff4d8"/></g>`;
      // road + crosswalk + reflections
      b += `<path d="M0 620L470 470H730L1200 620V900H0Z" fill="url(#road)"/>`;
      let cw = '';
      for (let i = -5; i <= 5; i++) cw += `<path d="M${600 + i * 60 - 22} 700L${600 + i * 60 + 22} 700L${600 + i * 76 + 26} 760L${600 + i * 76 - 26} 760Z"/>`;
      b += `<g fill="#d8dce8" opacity=".35">${cw}</g>`;
      b += `<path d="M600 480V700M600 770V900" stroke="#e8c060" stroke-width="6" stroke-dasharray="30 30" opacity=".5"/>`;
      const NC = { n1: '#ff4d7a', n2: '#3fe0d0', n3: '#ffb347', n4: '#b07bff' };
      for (const [x, , g] of neon) {
        b += `<rect x="${x - 26}" y="630" width="52" height="270" fill="url(#rf${{ n1: 1, n2: 2, n3: 3, n4: 4 }[g]})" opacity=".35"/>`;
        let d = '';
        for (let y = 636; y < 900; y += 9 + R() * 8) { const ww = 10 + R() * 40; d += `M${r0(x - ww / 2 + (R() - 0.5) * 14)} ${r0(y)}h${r0(ww)}`; }
        b += `<path d="${d}" stroke="${NC[g]}" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
      }
      b += `<rect x="560" y="480" width="80" height="420" fill="#c8d8ff" opacity=".07"/>`;
      // car tail lights in the distance
      b += `<circle cx="560" cy="500" r="40" fill="url(#red)"/><circle cx="640" cy="500" r="40" fill="url(#red)"/><rect x="548" y="496" width="20" height="8" rx="4" fill="#ff6a6a"/><rect x="632" y="496" width="20" height="8" rx="4" fill="#ff6a6a"/>`;
      let tl = '';
      for (let y = 512; y < 680; y += 8 + R() * 6) for (const x of [558, 642]) { const ww = 6 + R() * 14; tl += `M${r0(x - ww / 2)} ${r0(y)}h${r0(ww)}`; }
      b += `<path d="${tl}" stroke="#ff4050" stroke-width="2.5" opacity=".45" stroke-linecap="round"/>`;
      // pedestrian with umbrella
      b += `<g transform="translate(820 640)" fill="#07080e"><path d="M-60-110Q0-160 60-110Z"/><path d="M0-112V-60" stroke="#07080e" stroke-width="3"/><circle cx="0" cy="-92" r="11"/><path d="M-14-80H14L18-20H10L8 30H-8L-10-20H-18Z"/></g>`;
      // rain
      let rn = '';
      for (let i = 0; i < 160; i++) { const x = R() * 1260, y = R() * 900, l = 20 + R() * 30; rn += `M${r0(x)} ${r0(y)}l${f1(-l * 0.18)} ${r0(l)}`; }
      b += `<path d="${rn}" stroke="#c8d8ff" stroke-width="1.6" opacity=".35"/>`;
      let rip = '';
      for (let i = 0; i < 30; i++) { const x = R() * 1200, y = 640 + R() * 260, r = 6 + R() * 16; rip += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${f1(r)}" ry="${f1(r * 0.3)}"/>`; }
      b += `<g fill="none" stroke="#9fb4e0" stroke-width="1.5" opacity=".35">${rip}</g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.14);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_car_keys — Sandu's key with a purple keychain
     ===================================================================== */
  def('p_car_keys', {
    title: 'Sandu keys', w: 1200, h: 900, tags: ['keys', 'sandu', 'car', 'purple'],
    svg: (w, h) => {
      const R = rng(3);
      const defs =
        rad('mb', '.35 .3 .9', '#3a3a42 0|#1a1a20 .6|#0c0c10 1') +
        lin('fob', '0 0 1 1', '#4a4a54 0|#16161a .45|#08080a 1') +
        lin('steel', '0 0 1 1', '#f4f4f8 0|#9a9aa6 .5|#e8e8f0 .7|#6a6a74 1') +
        lin('lea', '0 0 1 1', '#7a4aa8 0|#4b2a6a .5|#2e1840 1') +
        rad('spot', '.4 .35 .55', '#fff 0 .18|#fff 1 0') +
        vig('vg', 0.55) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#mb)"/>`;
      let veins = '';
      for (let i = 0; i < 9; i++) { const y = R() * 900; veins += `M-20 ${r0(y)}C300 ${r0(y + (R() - 0.5) * 300)} 700 ${r0(y + (R() - 0.5) * 300)} 1220 ${r0(y + (R() - 0.5) * 200)}`; }
      b += `<path d="${veins}" stroke="#8a8a96" stroke-width="2" fill="none" opacity=".18"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#spot)"/>`;
      b += `<g transform="translate(130 -70)">`;
      // key fob (left), angled
      let f = `<g transform="translate(400 470) rotate(-22)">`;
      f += `<rect x="-150" y="-62" width="300" height="140" rx="62" fill="#000" opacity=".5" transform="translate(14 22)"/>`;
      f += `<rect x="-150" y="-70" width="300" height="140" rx="62" fill="url(#fob)"/>`;
      f += `<rect x="-140" y="-62" width="280" height="40" rx="20" fill="#fff" opacity=".08"/>`;
      f += `<circle cx="-80" cy="0" r="24" fill="#202026" stroke="#3a3a44" stroke-width="2"/><circle cx="-10" cy="0" r="24" fill="#202026" stroke="#3a3a44" stroke-width="2"/><circle cx="60" cy="0" r="24" fill="#202026" stroke="#3a3a44" stroke-width="2"/>`;
      f += `<path d="M-89 2v-6a9 9 0 0 1 18 0v6" stroke="#aaa" stroke-width="3" fill="none"/><rect x="-92" y="1" width="24" height="16" rx="3" fill="#aaa"/>`;
      f += `<path d="M-19 2v-6a9 9 0 0 1 16-5" stroke="#aaa" stroke-width="3" fill="none"/><rect x="-22" y="1" width="24" height="16" rx="3" fill="#aaa"/>`;
      f += `<path d="M48 10h24l-4-14h-16z" fill="none" stroke="#aaa" stroke-width="3"/>`;
      f += `<circle cx="-118" cy="0" r="12" fill="#0a0a0c" stroke="url(#steel)" stroke-width="5"/>`;
      f += `</g>`;
      // ring + tag
      b += `<circle cx="248" cy="530" r="52" fill="none" stroke="#000" stroke-width="10" opacity=".4" transform="translate(8 14)"/><circle cx="248" cy="530" r="52" fill="none" stroke="url(#steel)" stroke-width="9"/>`;
      b += f;
      let t = `<g transform="translate(560 650) rotate(14)">`;
      t += `<path d="M-300-70H160Q200-70 200-30V30Q200 70 160 70H-300Q-340 70-340 30V-30Q-340-70-300-70Z" fill="#000" opacity=".45" transform="translate(14 20)"/>`;
      t += `<path d="M-300-70H160Q200-70 200-30V30Q200 70 160 70H-300Q-340 70-340 30V-30Q-340-70-300-70Z" fill="url(#lea)"/>`;
      t += `<path d="M-298-56H158Q186-56 186-28V28Q186 56 158 56H-298Q-326 56-326 28V-28Q-326-56-298-56Z" fill="none" stroke="#c9b0e8" stroke-width="3" stroke-dasharray="10 8" opacity=".7"/>`;
      t += `<circle cx="-290" cy="0" r="18" fill="#1a0e26" stroke="url(#steel)" stroke-width="6"/>`;
      t += `<text x="-40" y="30" font-family="Didot, 'Bodoni 72', Georgia, 'Times New Roman', serif" font-size="96" font-style="italic" fill="#1c0e2a" text-anchor="middle" opacity=".8" transform="translate(2 3)">Sandu</text>`;
      t += `<text x="-40" y="30" font-family="Didot, 'Bodoni 72', Georgia, 'Times New Roman', serif" font-size="96" font-style="italic" fill="#e6e0f0" text-anchor="middle">Sandu</text>`;
      t += `<path d="M-300-60H150" stroke="#fff" stroke-width="3" opacity=".15"/>`;
      t += `</g>`;
      b += `<path d="M262 568Q262 610 252 628" stroke="url(#steel)" stroke-width="8" fill="none"/>` + t;
      // small silver lotus charm
      b += `<g transform="translate(196 600) rotate(10)"><path d="M0-30Q-8-50 0-60Q8-50 0-30" stroke="url(#steel)" stroke-width="4" fill="none"/><path d="M0 0C-10-10-12-26 0-36C12-26 10-10 0 0ZM0 0C-16-4-28-14-26-26C-14-24-4-14 0 0ZM0 0C16-4 28-14 26-26C14-24 4-14 0 0Z" fill="url(#steel)"/></g></g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_jl_learner — Jin Ling proudly holding his learner permit
     ===================================================================== */
  def('p_jl_learner', {
    title: 'A-Ling’s learner permit', w: 1200, h: 900, tags: ['jinling', 'permit', 'car', 'day'],
    svg: (w, h) => {
      const R = rng(1810);
      const defs =
        lin('sky', '0 0 0 1', '#5aa8e8 0|#a8d4f4 .7|#dceefa 1') +
        lin('bld', '0 0 0 1', '#f0ece4 0|#d4cdc0 1') +
        lin('hood', '0 0 1 1', '#ffd24a 0|#f0a820 .6|#c8841a 1') +
        lin('card', '0 0 1 1', '#ffffff 0|#eef4fa 1') +
        sedanDefs() +
        rad('sun', '.5 .5 .5', '#fff 0 .9|#fff8e0 1 0') +
        vig('vg', 0.35) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="1050" cy="90" r="220" fill="url(#sun)"/>`;
      b += `<g fill="#fff" opacity=".85"><ellipse cx="300" cy="120" rx="120" ry="34"/><ellipse cx="380" cy="100" rx="80" ry="40"/><ellipse cx="820" cy="170" rx="100" ry="26"/></g>`;
      // administration building with columns
      b += `<path d="M120 250H1100V640H120Z" fill="url(#bld)"/><path d="M90 250H1130L1100 210H120Z" fill="#c8c0b2"/><rect x="90" y="246" width="1040" height="14" fill="#b8b0a2"/>`;
      for (let x = 170; x < 1100; x += 110) b += `<rect x="${x}" y="270" width="40" height="370" fill="#fbf8f2"/><rect x="${x - 6}" y="270" width="52" height="12" fill="#e2dbd0"/>`;
      b += `<rect x="560" y="420" width="140" height="220" fill="#6a7a8a"/><rect x="568" y="428" width="60" height="212" fill="#9ab4c8" opacity=".6"/><rect x="632" y="428" width="60" height="212" fill="#9ab4c8" opacity=".6"/>`;
      b += `<path d="M0 640H1200V900H0Z" fill="#c8c2b6"/><path d="M0 640H1200" stroke="#a8a294" stroke-width="4"/>`;
      // trees
      for (const [x, s] of [[60, 1.2], [1150, 1]]) b += `<g transform="translate(${x} 640) scale(${s})"><rect x="-10" y="-160" width="20" height="160" fill="#6a4a2a"/><circle cx="0" cy="-200" r="80" fill="#4f9a4a"/><circle cx="-40" cy="-170" r="54" fill="#5aa852"/><circle cx="44" cy="-176" r="58" fill="#3f8a42"/></g>`;
      // Sandu parked behind
      b += `<g transform="translate(700 700) scale(1.05)">${sedan('<path d="M140-118C190-136 250-138 280-130" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>')}</g>`;
      // Jin Ling, waist up, in a gold hoodie
      let p = `<g transform="translate(470 520)">`;
      p += `<path d="M-200 380C-210 220-170 150-80 120L0 108L80 120C170 150 210 220 200 380Z" fill="url(#hood)"/>`;
      p += `<path d="M-70 118Q0 170 70 118Q40 150 0 156Q-40 150-70 118Z" fill="#c8841a"/><path d="M-20 150V250M20 150V250" stroke="#fff6dc" stroke-width="5" stroke-linecap="round"/>`;
      p += `<path d="M-100 250Q0 236 100 250L110 330Q0 344-110 330Z" fill="#e8a020" opacity=".55"/>`;
      p += `<g transform="translate(0 -22) scale(1.75)">${jlHead('proud')}</g>`;
      // raised arm holding the permit
      p += `<path d="M150 170C220 120 270 40 280-70L330-60C330 50 280 170 200 240Z" fill="url(#hood)"/><path d="M276-74L332-62L330-48L274-60Z" fill="#c8841a"/>`;
      p += `</g>`;
      b += p;
      // permit card
      let c = `<g transform="translate(790 330) rotate(8)">`;
      c += `<rect x="-150" y="-96" width="300" height="192" rx="16" fill="#000" opacity=".25" transform="translate(8 12)"/>`;
      c += `<rect x="-150" y="-96" width="300" height="192" rx="16" fill="url(#card)" stroke="#c8d4e0" stroke-width="2"/>`;
      c += `<path d="M-150-80Q-150-96-134-96H134Q150-96 150-80V-56H-150Z" fill="#2a6ab8"/><rect x="-150" y="-56" width="300" height="8" fill="#d8202e"/>`;
      c += `<rect x="-130" y="-34" width="86" height="106" rx="6" fill="#dfe8f2"/><circle cx="-87" cy="2" r="22" fill="${SKIN}"/><path d="M-110-6Q-108-30-87-30Q-64-30-64-6Q-74-20-87-18Q-100-20-110-6Z" fill="${HAIR}"/><path d="M-118 70Q-114 34-87 32Q-60 34-56 70Z" fill="#e8a020"/><circle cx="-87" cy="-12" r="2" fill="#d0202e"/>`;
      c += `<g fill="#b8c4d2"><rect x="-26" y="-30" width="150" height="12" rx="6"/><rect x="-26" y="-6" width="120" height="10" rx="5"/><rect x="-26" y="14" width="140" height="10" rx="5"/><rect x="-26" y="34" width="90" height="10" rx="5"/></g>`;
      c += `<circle cx="104" cy="56" r="24" fill="#f4d27a" opacity=".85"/><circle cx="104" cy="56" r="16" fill="none" stroke="#c8963c" stroke-width="3"/>`;
      c += `<path d="M-150 40Q-150 96-110 96" fill="none"/>`;
      c += `</g>`;
      b += c;
      // hand gripping the card
      b += `<path d="M748 418Q740 380 760 370Q780 366 790 380L800 420Q806 450 780 456Q756 458 748 418Z" fill="${SKIN}"/><path d="M760 372Q770 350 786 356Q796 362 792 384" fill="${SKIN}" stroke="${SKIN_S}" stroke-width="2"/><path d="M752 400h30M754 420h30" stroke="${SKIN_S}" stroke-width="2"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });
})();
