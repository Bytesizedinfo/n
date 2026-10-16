/* Photos 2 — family, old photos, dogs, Lotus Pier. 1200×900 unless noted. */
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

  /* ---------- reusable subjects ---------- */
  // Sitting dog, front view. Ground at y=0, ~200 tall, centred on x=0.
  const dog = (o) => {
    const c1 = o.c1, c2 = o.c2, c3 = o.c3, rim = o.rim;
    const sd = o.seed || 1;
    const fa = o.fl == null ? 10 : o.fl;
    let g = '';
    const body = fluff(0, -82, 52, 74, 18, o.flBody == null ? fa : o.flBody, sd, 0.5);
    const head = fluff(0, -160, 46, 41, 20, o.flHead == null ? fa * 0.8 : o.flHead, sd + 1, 0.4);
    const hL = fluff(-40, -36, 34, 34, 10, fa * 0.7, sd + 2, 0.5), hR = fluff(40, -36, 34, 34, 10, fa * 0.7, sd + 3, 0.5);
    if (rim) g += `<g fill="${rim}" opacity="${o.rimOp || 0.8}" transform="translate(${o.rimX || -4} ${o.rimY || -4})"><path d="${body}"/><path d="${head}"/><path d="${hL}"/><path d="${hR}"/></g>`;
    g += `<path d="${hL}" fill="${c3}"/><path d="${hR}" fill="${c3}"/>`;
    g += `<ellipse cx="-60" cy="-6" rx="20" ry="9" fill="${c1}"/><ellipse cx="60" cy="-6" rx="20" ry="9" fill="${c1}"/>`;
    g += `<path d="${body}" fill="${c1}"/>`;
    if (o.chest) g += `<path d="${fluff(0, -96, 22, 36, 10, o.flChest == null ? fa * 0.6 : o.flChest, sd + 4, 0.5)}" fill="${o.chest}"/>`;
    g += `<path d="M-31-76Q-33-36-29-8H-9Q-7-40-9-76ZM9-76Q7-40 9-8H29Q33-36 31-76Z" fill="${c1}"/><path d="M-11-66Q-10-36-10-10M11-66Q10-36 10-10" stroke="${c3}" stroke-width="2.5" opacity=".5" fill="none"/>`;
    g += `<ellipse cx="-19" cy="-7" rx="16" ry="9" fill="${o.paw || c1}"/><ellipse cx="19" cy="-7" rx="16" ry="9" fill="${o.paw || c1}"/>`;
    g += `<path d="M-24-10v6M-14-10v6M14-10v6M24-10v6" stroke="${c3}" stroke-width="2" opacity=".7"/>`;
    if (o.collar) g += `<path d="M-32-126Q0-112 32-126L32-116Q0-102-32-116Z" fill="${o.collar}"/>` + (o.tag ? `<circle cx="10" cy="-106" r="7" fill="${o.tag}" stroke="#bbb" stroke-width="1.5"/>` : '');
    // head
    const tilt = o.tilt || 0;
    let hd = '';
    const ear = o.ear || 'flop';
    const earPath = (sx) =>
      ear === 'up'
        ? `M${sx * 18}-190Q${sx * 30}-216 ${sx * 40}-214Q${sx * 46}-196 ${sx * 44}-176Z`
        : ear === 'fold'
          ? `M${sx * 20}-192Q${sx * 50}-206${sx * 52}-178Q${sx * 46}-170${sx * 36}-176Z`
          : `M${sx * 30}-192Q${sx * 64}-196${sx * 62}-150Q${sx * 60}-118${sx * 44}-122Q${sx * 32}-140${sx * 28}-176Z`;
    if (ear === 'up') hd += `<path d="${earPath(-1)}" fill="${c3}"/><path d="${earPath(1)}" fill="${c3}"/><path d="M-24-190Q-32-206-38-206Q-42-194-40-182ZM24-190Q32-206 38-206Q42-194 40-182Z" fill="${o.earIn || '#e8a0a8'}" opacity=".7"/>`;
    hd += `<path d="${head}" fill="${c1}"/>`;
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
    if (o.pup) return `<g transform="translate(0 4) scale(.94 .78)">${g}</g><g transform="translate(0 30) rotate(${tilt} 0 -120) translate(0 -120) scale(1.32) translate(0 120)">${hd}</g>`;
    g += `<g transform="rotate(${tilt} 0 -120)">${hd}</g>`;
    return g;
  };

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


  // faded film look for 1999–2009 photos: warm cast, lifted blacks, vignette, optional light leak + print border
  const filmDefs = () => rad('fv', '.5 .5 .72', '#2a1404 .5 0|#2a1404 1 .6') + lin('leak', '0 0 1 0', '#ff8a3a 0 .5|#ff8a3a .28 0') + grainDef('fg', 0.95);
  const film = (w, h, border, leak, k) =>
    `<rect width="${w}" height="${h}" fill="#ff9a40" opacity="${f1(0.13 * (k || 1))}"/><rect width="${w}" height="${h}" fill="#f6e6c8" opacity="${f1(0.16 * (k || 1))}"/>` +
    (leak ? `<rect width="${w}" height="${h}" fill="url(#leak)"/>` : '') +
    `<rect width="${w}" height="${h}" fill="url(#fv)"/>` + grain('fg', w, h, 0.2) +
    (border
      ? `<path d="M0 0H${w}V${h}H0ZM${border} ${border}V${h - border}H${w - border}V${border}Z" fill="#f6f1e4" fill-rule="evenodd"/><path d="M${border} ${border}H${w - border}V${h - border}H${border}Z" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>`
      : '');

  // standing silhouettes, feet at y=0. types: man, woman (bun, long dress), girl (long hair, dress), boy, boyP (ponytail)
  const figure = (type, x, y, s) => {
    const P = {
      man: '<circle cx="0" cy="-168" r="12"/><path d="M-6-157H6L8-151Q22-149 25-141L29-97Q30-87 25-87L22-119L20-85L17-83L16 0H4L1-71H-1L-4 0H-16L-17-83L-20-85L-22-119L-25-87Q-30-87-29-97L-25-141Q-22-149-8-151Z"/>',
      woman: '<circle cx="0" cy="-158" r="11"/><circle cx="7" cy="-169" r="7"/><path d="M-5-148H5L7-143Q18-141 20-133L23-97Q24-89 20-89L17-113L15-91L28 0H-28L-15-91L-17-113L-20-89Q-24-89-23-97L-20-133Q-18-141-7-143Z"/>',
      girl: '<circle cx="0" cy="-154" r="11"/><path d="M-12-156Q-15-124-13-110H13Q15-124 12-156Z"/><path d="M-5-144H5L7-139Q17-137 19-129L22-95Q23-87 19-87L16-109L15-91L24-42H8L7 0H1V-42H-1V0H-7L-8-42H-24L-15-91L-16-109L-19-87Q-23-87-22-95L-19-129Q-17-137-7-139Z"/>',
      boy: '<circle cx="0" cy="-150" r="11"/><path d="M-5-140H5L7-135Q19-133 22-126L25-88Q26-80 22-80L19-108L17-76L15-74L14 0H4L1-62H-1L-4 0H-14L-15-74L-17-76L-19-108L-22-80Q-26-80-25-88L-22-126Q-19-133-7-135Z"/>',
    };
    P.boyP = P.boy + '<path d="M6-158Q22-160 21-142Q19-128 25-116Q11-124 8-140Z"/>';
    return `<g transform="translate(${x} ${y}) scale(${s})">${P[type]}</g>`;
  };

  /* =====================================================================
     p_puppies — three puppies (JC sends these to torment Wei Wuxian)
     ===================================================================== */
  def('p_puppies', {
    title: 'Three puppies', w: 1200, h: 900, tags: ['dog', 'puppies', 'wwx', 'cute'],
    svg: (w, h) => {
      const R = rng(3);
      const defs =
        lin('bg', '0 0 0 1', '#fde2d4 0|#f9cfc4 .6|#f3c2b6 1') +
        lin('bl', '0 0 0 1', '#fff7ec 0|#f0e2cc 1') +
        bokehDef('b1', '#ffffff') + bokehDef('b2', '#ffd9a8') +
        vig('vg', 0.3) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += bokeh(R, 18, 0, 0, w, 520, 30, 90, ['b1', 'b2'], 0.25, 0.6);
      b += `<path d="M0 600Q300 560 600 580T1200 570V900H0Z" fill="url(#bl)"/>`;
      let knit = '';
      for (let y = 610; y < 900; y += 22) knit += `M0 ${y}Q300 ${y - 18} 600 ${y - 4}T1200 ${y - 10}`;
      b += `<path d="${knit}" stroke="#e2d0b4" stroke-width="3" fill="none" opacity=".7"/>`;
      const P = [
        [300, 800, 1.7, { c1: '#f2d29a', c2: '#fbe8c4', c3: '#d9b070', muzzle: '#fff1d6', fl: 9, seed: 41, tongue: true, tilt: 8, eyeR: 7, pup: true, ear: 'flop' }],
        [600, 820, 1.8, { c1: '#2a2a30', c2: '#f4f2ee', c3: '#151518', muzzle: '#f4f2ee', chest: '#f4f2ee', blaze: '#f4f2ee', paw: '#f4f2ee', fl: 9, seed: 52, tilt: -6, eyeR: 7.5, pup: true, ear: 'flop' }],
        [900, 800, 1.7, { c1: '#c98a4a', c2: '#f6e2c4', c3: '#a86a32', muzzle: '#f6e2c4', chest: '#f6e2c4', fl: 6, seed: 63, tongue: true, tilt: 10, eyeR: 7, pup: true, ear: 'up', earIn: '#f0b0a0' }],
      ];
      for (const [x, y, s, o] of P) b += `<ellipse cx="${x}" cy="${y + 4}" rx="${110 * s / 1.7}" ry="16" fill="#b89a7a" opacity=".35"/><g transform="translate(${x} ${y}) scale(${s})">${dog(o)}</g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_dog_park — a golden retriever JC met in a park
     ===================================================================== */
  def('p_dog_park', {
    title: 'Golden retriever in the park', w: 1200, h: 900, tags: ['dog', 'park', 'day'],
    svg: (w, h) => {
      const R = rng(77);
      const defs =
        lin('sky', '0 0 0 1', '#bfe0f0 0|#e8f4e8 1') +
        lin('grass', '0 0 0 1', '#8cc65a 0|#5a9a3a .6|#3f7a2a 1') +
        bokehDef('b1', '#fff6c8') + bokehDef('b2', '#cfe8a0') + bokehDef('b3', '#7ab85a') +
        rad('sun', '.5 .5 .5', '#fffbe6 0 .9|#fff4c0 .4 .4|#fff4c0 1 0') +
        vig('vg', 0.35) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      // soft tree line + bench (out of focus)
      for (let i = 0; i < 16; i++) b += `<circle cx="${r0(R() * w)}" cy="${r0(150 + R() * 260)}" r="${r0(80 + R() * 120)}" fill="${['#6aa84f', '#86bd5f', '#5a9446', '#9cc870'][i % 4]}" opacity=".85"/>`;
      b += `<circle cx="1000" cy="80" r="420" fill="url(#sun)"/>`;
      b += bokeh(R, 26, 0, 60, w, 480, 16, 50, ['b1', 'b2'], 0.35, 0.8);
      b += `<path d="M0 470Q600 430 1200 470V520H0Z" fill="#d8c8a0" opacity=".8"/>`;
      b += `<g opacity=".6"><rect x="120" y="390" width="220" height="16" rx="6" fill="#8a5a3a"/><rect x="120" y="420" width="220" height="14" rx="6" fill="#8a5a3a"/><rect x="136" y="430" width="10" height="60" fill="#3a3a3a"/><rect x="314" y="430" width="10" height="60" fill="#3a3a3a"/></g>`;
      b += `<path d="M0 500Q600 460 1200 500V900H0Z" fill="url(#grass)"/>`;
      let bl = '';
      for (let i = 0; i < 260; i++) { const x = R() * w, y = 520 + R() * 380, l = 8 + R() * 18 * ((y - 480) / 400); bl += `M${r0(x)} ${r0(y)}l${f1((R() - 0.5) * 6)} ${r0(-l)}`; }
      b += `<path d="${bl}" stroke="#a8d870" stroke-width="2.5" opacity=".55" stroke-linecap="round"/>`;
      b += `<ellipse cx="640" cy="842" rx="210" ry="26" fill="#2a4a1a" opacity=".35"/>`;
      b += `<g transform="translate(640 840) scale(2.85)">${dog({ c1: '#d9a04e', c2: '#f2cf8c', c3: '#b47a34', muzzle: '#eec07a', chest: '#f0c47c', fl: 12, flHead: 3, flBody: 5, flChest: 11, seed: 88, tongue: true, tilt: 6, eyeR: 5.6, brow: '#a8702c', ear: 'flop' })}</g>`;
      b += `<circle cx="360" cy="820" r="36" fill="#e83a3a"/><path d="M330 808Q360 830 392 806" stroke="#fff" stroke-width="5" fill="none" opacity=".8"/><ellipse cx="348" cy="804" rx="10" ry="6" fill="#fff" opacity=".5"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_childhood_dogs — 1999: Jasmine, Princess and Love-Love on the dock
     ===================================================================== */
  def('p_childhood_dogs', {
    title: 'Jasmine, Princess, Love-Love (1999)', w: 1200, h: 900, tags: ['dog', 'puppies', 'old-photo', 'lotus-pier', '1999'],
    svg: (w, h) => {
      const R = rng(1999);
      const defs =
        lin('sky', '0 0 0 1', '#9cc4dc 0|#d8e6dc 1') +
        lin('lake', '0 0 0 1', '#7aa0a8 0|#4a7078 1') +
        lin('wood', '0 0 0 1', '#c8945a 0|#8a5a30 1') +
        filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<path d="M0 330Q200 290 420 316T800 300T1200 320V360H0Z" fill="#7a9a88"/>`;
      b += `<rect y="350" width="${w}" height="${h - 350}" fill="url(#lake)"/>`;
      for (let i = 0; i < 22; i++) { const x = R() * w, y = 370 + R() * 180, s = 0.3 + ((y - 360) / 200) * 0.6; b += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(60 * s)}" ry="${r0(14 * s)}" fill="#4f7a4a"/>`; }
      for (const [x, y] of [[180, 400], [1000, 380], [860, 430]]) b += `<path d="M${x} ${y}V${y - 40}" stroke="#4f7a4a" stroke-width="3"/><ellipse cx="${x}" cy="${y - 48}" rx="10" ry="14" fill="#f2a0b0"/>`;
      // dock planks (perspective)
      b += `<path d="M260 900L470 470H730L940 900Z" fill="url(#wood)"/>`;
      let pl = '';
      for (let i = 0; i < 12; i++) { const t = Math.pow(i / 11, 1.6); const y = 470 + t * 430; const hw = 130 + t * 340; pl += `M${r0(600 - hw)} ${r0(y)}H${r0(600 + hw)}`; }
      b += `<path d="${pl}" stroke="#6a4020" stroke-width="3" opacity=".7"/><path d="M600 470V900M535 470L430 900M665 470L770 900" stroke="#6a4020" stroke-width="2" opacity=".4"/>`;
      b += `<rect x="458" y="440" width="12" height="60" fill="#6a4020"/><rect x="730" y="440" width="12" height="60" fill="#6a4020"/>`;
      const P = [
        [440, 760, 1.25, { c1: '#f4ead6', c2: '#fffaf0', c3: '#d8c8a8', muzzle: '#fffaf0', fl: 9, seed: 5, tongue: true, tilt: 6, eyeR: 7, pup: true }],
        [610, 780, 1.3, { c1: '#a8683a', c2: '#d8a070', c3: '#7a4a24', muzzle: '#d8a070', fl: 7, seed: 6, tilt: -8, eyeR: 7, pup: true }],
        [780, 760, 1.22, { c1: '#26242a', c2: '#f2eee6', c3: '#141216', muzzle: '#f2eee6', chest: '#f2eee6', fl: 8, seed: 7, tongue: true, tilt: 10, eyeR: 7, pup: true, ear: 'fold' }],
      ];
      for (const [x, y, s, o] of P) b += `<ellipse cx="${x}" cy="${y + 4}" rx="${r0(80 * s)}" ry="12" fill="#3a2010" opacity=".35"/><g transform="translate(${x} ${y}) scale(${s})">${dog(o)}</g>`;
      b += film(w, h, 34, true);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_family_2007 — five silhouettes on the Lotus Pier dock, faded film
     ===================================================================== */
  def('p_family_2007', {
    title: 'Lotus Pier, 2007', w: 1200, h: 900, tags: ['family', 'old-photo', 'lotus-pier', 'sunset', '2007', 'ajie'],
    svg: (w, h) => {
      const R = rng(2007);
      const defs =
        lin('sky', '0 0 0 1', '#5a6a9a 0|#d88a7a .5|#f8c87a .8|#ffe0a0 1') +
        lin('lake', '0 0 0 1', '#f0b070 0|#a86a5a .4|#4a3a4a 1') +
        rad('sun', '.5 .5 .5', '#fff6d8 0 1|#ffd890 .3 .6|#ffb070 1 0') +
        filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="760" cy="500" r="380" fill="url(#sun)"/><circle cx="760" cy="520" r="54" fill="#fff4d0"/>`;
      b += `<path d="M0 520Q300 490 600 506T1200 500V540H0Z" fill="#6a4a5a"/>`;
      b += `<rect y="536" width="${w}" height="${h - 536}" fill="url(#lake)"/>`;
      for (let i = 0; i < 30; i++) { const t = i / 29, y = 540 + Math.pow(t, 1.5) * 330, hw = 10 + t * 90; b += `<rect x="${r0(760 - hw * (0.3 + R()))}" y="${r0(y)}" width="${r0(hw * (0.6 + R()))}" height="${f1(2 + t * 5)}" rx="2" fill="#fff0c0" opacity="${f1(0.7 - t * 0.5)}"/>`; }
      for (let i = 0; i < 26; i++) { const x = R() * w, y = 560 + R() * 300; if (Math.abs(x - 600) < 260 && y > 640) continue; const s = 0.3 + ((y - 540) / 340) * 1.3; b += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(60 * s)}" ry="${r0(13 * s)}" fill="#2a2a2a" opacity=".75"/>`; }
      // dock running from the foreground to the group
      b += `<path d="M380 900L470 646H880L960 900Z" fill="#2a1a18"/><path d="M470 646H880" stroke="#4a2a20" stroke-width="4"/>`;
      let pl = '';
      for (let i = 1; i < 8; i++) { const t = Math.pow(i / 8, 1.5); pl += `M${r0(470 - t * 90)} ${r0(646 + t * 254)}H${r0(880 + t * 80)}`; }
      b += `<path d="${pl}" stroke="#3a2420" stroke-width="3" opacity=".8"/>`;
      for (const x of [480, 600, 740, 868]) b += `<rect x="${x}" y="646" width="10" height="54" fill="#1a100e"/>`;
      // five silhouettes (left→right: father, mother, A-Jie, Wei Wuxian, Jiang Cheng)
      b += `<g fill="#1a1012">` +
        figure('man', 520, 650, 1.55) + figure('woman', 590, 650, 1.5) + figure('girl', 668, 650, 1.5) +
        figure('boyP', 748, 650, 1.5) + figure('boy', 806, 650, 1.5) +
        `<path d="M758 452Q786 440 818 450" stroke="#1a1012" stroke-width="11" fill="none" stroke-linecap="round"/></g>`;
      b += `<path d="M752 400q10-8 18 0" transform="translate(0 4)" stroke="#c0202a" stroke-width="6" fill="none" stroke-linecap="round"/>`;
      b += film(w, h, 34, true);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_kites — kids' kites over the lotus lake (old photo)
     ===================================================================== */
  def('p_kites', {
    title: 'Kites over the lake', w: 1200, h: 900, tags: ['kites', 'old-photo', 'lotus-pier', 'yunmeng-lake', 'childhood'],
    svg: (w, h) => {
      const R = rng(2003);
      const defs = lin('sky', '0 0 0 1', '#6aaedc 0|#a8d4ec .6|#e0eef0 1') + lin('lake', '0 0 0 1', '#8ab8c8 0|#5a8a98 1') + filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<g fill="#fff" opacity=".9"><ellipse cx="260" cy="160" rx="140" ry="40"/><ellipse cx="340" cy="136" rx="90" ry="44"/><ellipse cx="900" cy="220" rx="120" ry="30"/><ellipse cx="960" cy="200" rx="70" ry="34"/></g>`;
      b += `<path d="M0 600Q200 560 420 580T820 566T1200 584V620H0Z" fill="#6a9a7a"/>`;
      b += `<rect y="610" width="${w}" height="${h - 610}" fill="url(#lake)"/>`;
      for (let i = 0; i < 30; i++) { const x = R() * w, y = 630 + R() * 200, s = 0.4 + ((y - 620) / 220); b += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(56 * s)}" ry="${r0(14 * s)}" fill="#4f8a4a"/>`; }
      for (const [x, y] of [[300, 660], [700, 700], [1000, 650]]) b += `<path d="M${x} ${y}V${y - 34}" stroke="#4f7a4a" stroke-width="3"/><ellipse cx="${x}" cy="${y - 42}" rx="10" ry="13" fill="#f29ab0"/>`;
      // shore + kids
      b += `<path d="M0 900V760Q160 730 360 770Q420 790 460 900Z" fill="#7a9a5a"/><path d="M0 800Q180 770 380 800" stroke="#5a7a3a" stroke-width="4" fill="none"/>`;
      // three kids seen from behind: A-Jie (dress), Jiang Cheng (purple), Wei Wuxian (ponytail, red ribbon)
      const SK = '#e8c0a0';
      const kid = (x, y, s, c, pony) => `<g transform="translate(${x} ${y}) scale(${s})">` +
        `<rect x="-11" y="-36" width="9" height="34" rx="4" fill="${SK}"/><rect x="2" y="-36" width="9" height="34" rx="4" fill="${SK}"/><path d="M-12-2h11v4h-11zM1-2h11v4H1z" fill="#3a2a20"/>` +
        `<path d="M-17-44H17L16-28H-16Z" fill="#3a4a6a"/>` +
        `<path d="M-6-82H6V-74H-6Z" fill="${SK}"/><path d="M-18-72Q-19-78-10-79H10Q19-78 18-72L18-42H-18Z" fill="${c}"/>` +
        `<path d="M-16-72Q-24-60-24-44" stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="-24" cy="-42" r="5" fill="${SK}"/>` +
        `<path d="M15-72Q28-88 36-110" stroke="${c}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="37" cy="-113" r="5.5" fill="${SK}"/>` +
        `<ellipse cx="0" cy="-94" rx="13" ry="14" fill="#2a1a14"/>` +
        (pony ? '<path d="M4-104Q22-108 20-90Q18-78 24-70Q10-80 8-94Z" fill="#2a1a14"/><path d="M5-106q7-5 13 0" stroke="#d0202a" stroke-width="4" fill="none" stroke-linecap="round"/>' : '') + `</g>`;
      b += `<g transform="translate(108 796) scale(1.5)"><path d="M-11 0V-22H-3V0ZM3 0V-22H11V0Z" fill="${SK}"/><path d="M-12-86H12L24-20H-24Z" fill="#d88aa8"/><path d="M-12-86Q-20-70-22-50" stroke="#d88aa8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M12-86Q22-70 26-50" stroke="#d88aa8" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M-5-94H5V-86H-5Z" fill="${SK}"/><ellipse cx="0" cy="-104" rx="12" ry="13" fill="#2a1a14"/><path d="M-12-104Q-14-80-10-70H10Q14-80 12-104Z" fill="#2a1a14"/></g>`;
      b += kid(186, 800, 1.35, '#7a4aa8', false) + kid(262, 792, 1.35, '#f2eee6', true);
      // kite strings
      b += `<path d="M236 648Q500 500 620 250M312 640Q600 520 880 330M147 652Q200 430 330 300" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>`;
      // kites
      b += `<g transform="translate(620 250) rotate(-10)"><path d="M0-80L56 0L0 110L-56 0Z" fill="#7a4aa8"/><path d="M0-80L0 110M-56 0H56" stroke="#4a2a70" stroke-width="3"/><path d="M0 110q-20 30 0 50t0 50q20 30 0 50" stroke="#e8b84a" stroke-width="4" fill="none"/><path d="M-10 160l20-10M-10 210l20-10" stroke="#e8406a" stroke-width="6"/></g>`;
      b += `<g transform="translate(880 330) rotate(12)"><path d="M0-30Q40-60 100-40Q60-20 40 0Q60 30 90 70Q40 50 0 20Q-40 50-90 70Q-60 30-40 0Q-60-20-100-40Q-40-60 0-30Z" fill="#2a3a6a"/><path d="M-60-34Q0-10 60-34" stroke="#f2f0e8" stroke-width="5" fill="none"/><circle cx="0" cy="-14" r="8" fill="#d0202a"/></g>`;
      b += `<g transform="translate(330 300) rotate(-20)"><path d="M0-50C40-50 60-10 30 20C10 40 0 70 0 70C0 70-10 40-30 20C-60-10-40-50 0-50Z" fill="#ff8a3a"/><path d="M0 70q-10 20 0 40t0 40" stroke="#ff8a3a" stroke-width="4" fill="none"/><circle cx="-12" cy="-14" r="6" fill="#fff"/><circle cx="-12" cy="-14" r="3" fill="#000"/></g>`;
      b += film(w, h, 34, false);
      return wrap(w, h, defs, b);
    },
  });

  // little Jin Ling (age 6): round face, top knot, forehead mark. mood: blow | happy
  const kidHead = (mood) => {
    let g = `<path d="M-58 0C-64-60-30-80 0-80C30-80 64-60 58 0C56 20 48 30 44 34H-44C-48 30-56 20-58 0Z" fill="${HAIR}"/>`;
    g += `<path d="M-6-78Q0-104 14-100Q20-90 6-76Z" fill="${HAIR}"/><rect x="-6" y="-88" width="16" height="8" rx="3" fill="#e0b040"/>`;
    g += `<ellipse cx="-54" cy="8" rx="9" ry="12" fill="${SKIN}"/><ellipse cx="54" cy="8" rx="9" ry="12" fill="${SKIN}"/>`;
    g += `<path d="M-52-10C-52-58 52-58 52-10C52 30 30 56 0 58C-30 56-52 30-52-10Z" fill="${SKIN}"/>`;
    g += `<path d="M-54-14C-56-56-20-74 0-74C20-74 56-56 54-14C46-30 30-36 0-34C-30-36-46-30-54-14Z" fill="${HAIR}"/>`;
    g += `<circle cx="0" cy="-24" r="4" fill="#d0202e"/>`;
    if (mood === 'blow') {
      g += `<path d="M-30-4l12 6-12 6M30-4l-12 6 12 6" stroke="#2a1a14" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      g += `<circle cx="-30" cy="24" r="13" fill="#f6b4a4" opacity=".7"/><circle cx="30" cy="24" r="13" fill="#f6b4a4" opacity=".7"/>`;
      g += `<ellipse cx="0" cy="34" rx="7" ry="8" fill="#a0423a"/><ellipse cx="0" cy="34" rx="3.5" ry="4" fill="#5a1a18"/>`;
    } else {
      g += `<path d="M-32 2Q-22-8-12 2M12 2Q22-8 32 2" stroke="#2a1a14" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
      g += `<path d="M-12 26Q0 40 12 26Z" fill="#a0423a"/><ellipse cx="-30" cy="18" rx="9" ry="6" fill="#f08a8a" opacity=".35"/><ellipse cx="30" cy="18" rx="9" ry="6" fill="#f08a8a" opacity=".35"/>`;
    }
    return g;
  };

  /* =====================================================================
     p_jl_kid — Jin Ling at 6, gold outfit, birthday cake (old photo)
     ===================================================================== */
  def('p_jl_kid', {
    title: 'A-Ling turns 6', w: 1200, h: 900, tags: ['jinling', 'birthday', 'cake', 'old-photo', '2014'],
    svg: (w, h) => {
      const R = rng(2014);
      const defs =
        lin('wall', '0 0 0 1', '#c89a6a 0|#a8784a 1') +
        rad('flash', '.5 .45 .55', '#fff8ec 0 .22|#fff8ec .6 .06|#fff8ec 1 0') +
        lin('gold', '0 0 1 1', '#ffe08a 0|#f0b432 .5|#c88a1a 1') +
        lin('cloth', '0 0 0 1', '#fffaf2 0|#e8dccb 1') +
        lin('frost', '0 0 0 1', '#fffdf8 0|#f2e6dc 1') +
        rad('bal', '.35 .3 .7', '#fff6d0 0|#f0c040 .5|#b8861a 1') + rad('balW', '.35 .3 .7', '#ffffff 0|#f0ece4 .6|#c8c0b4 1') +
        glowDef('fl', '#ffcf73', 1) + filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      // bunting + balloons
      b += `<path d="M0 60Q300 130 600 80T1200 70" stroke="#8a5a2a" stroke-width="2" fill="none"/>`;
      for (let i = 0; i < 12; i++) { const x = 40 + i * 100, y = 60 + Math.sin(i * 0.9) * 14 + 30; b += `<path d="M${x - 26} ${r0(y - 10)}L${x + 26} ${r0(y - 6)}L${x} ${r0(y + 40)}Z" fill="${['#f0b432', '#ffffff', '#e86a7a'][i % 3]}" opacity=".9"/>`; }
      const balloon = (x, y, g) => `<path d="M${x} ${y + 70}q-10 60 10 120t-6 120" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><ellipse cx="${x}" cy="${y}" rx="58" ry="70" fill="url(#${g})"/><path d="M${x - 6} ${y + 70}h12l-6 10z" fill="#c8961a"/>`;
      b += balloon(140, 260, 'bal') + balloon(250, 200, 'balW') + balloon(1050, 240, 'bal') + balloon(960, 300, 'balW');
      // Jin Ling in his little gold jacket
      b += `<path d="M380 900C380 700 440 640 600 620C760 640 820 700 820 900Z" fill="url(#gold)"/>`;
      b += `<path d="M560 626L600 700L640 626" stroke="#b8781a" stroke-width="6" fill="none"/><path d="M600 700V900" stroke="#b8781a" stroke-width="5"/>`;
      for (const y of [730, 780, 830]) b += `<path d="M584 ${y}h32" stroke="#8a5a14" stroke-width="6" stroke-linecap="round"/><circle cx="600" cy="${y}" r="5" fill="#8a5a14"/>`;
      b += `<g transform="translate(600 486) scale(2.3)">${kidHead('blow')}</g>`;
      // table + cake
      b += `<path d="M0 700H1200V900H0Z" fill="url(#cloth)"/><path d="M0 700H1200" stroke="#d8c8b0" stroke-width="4"/>`;
      b += `<ellipse cx="600" cy="820" rx="250" ry="40" fill="#000" opacity=".12"/>`;
      b += `<path d="M380 720V800Q600 850 820 800V720Z" fill="url(#frost)"/><ellipse cx="600" cy="720" rx="220" ry="44" fill="#fffdf8"/>`;
      let deco = '';
      for (let i = 0; i < 11; i++) { const a = (i / 10) * Math.PI; const x = 600 - Math.cos(a) * 214, y = 722 + Math.sin(a) * 40; deco += `<circle cx="${r0(x)}" cy="${r0(y)}" r="9" fill="#f6a0b4"/>`; }
      b += deco + `<path d="M384 770Q490 800 600 802T816 770" stroke="#f0b432" stroke-width="8" fill="none"/>`;
      for (let i = 0; i < 6; i++) {
        const x = 500 + i * 40, y = 712 + (i % 2) * 10;
        b += `<rect x="${x - 5}" y="${y - 60}" width="10" height="60" rx="3" fill="${['#7ac0f0', '#f6a0b4', '#ffd24a'][i % 3]}"/><path d="M${x} ${y - 60}v-8" stroke="#3a2a1a" stroke-width="2"/>`;
        b += `<circle cx="${x + 6}" cy="${y - 80}" r="26" fill="url(#fl)"/><path d="M${x} ${y - 66}q-8-10 2-24q10 12 2 24z" fill="#ffd060" transform="rotate(25 ${x} ${y - 66})"/>`;
      }
      b += `<rect width="${w}" height="${h}" fill="url(#flash)"/>`;
      b += film(w, h, 0, false, 0.6);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_jl_graduation — middle-school graduation, scowling with flowers
     ===================================================================== */
  def('p_jl_graduation', {
    title: 'A-Ling graduates', w: 1200, h: 900, tags: ['jinling', 'graduation', 'school', 'flowers', 'day'],
    svg: (w, h) => {
      const R = rng(2023);
      const defs =
        lin('sky', '0 0 0 1', '#8ac4f0 0|#d8ecf8 1') +
        lin('bld', '0 0 0 1', '#f4efe6 0|#ddd4c4 1') +
        lin('blz', '0 0 1 1', '#2a3a6a 0|#1a2448 .6|#121a34 1') +
        lin('kraft', '0 0 1 1', '#e8cfa0 0|#c8a46a .6|#a8844a 1') +
        vig('vg', 0.3) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<path d="M60 160H1140V700H60Z" fill="url(#bld)"/><path d="M40 160H1160L1130 130H70Z" fill="#c8bca8"/>`;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) b += `<rect x="${110 + c * 116}" y="${200 + r * 130}" width="70" height="90" fill="#8ab0d0"/><rect x="${110 + c * 116}" y="${200 + r * 130}" width="70" height="8" fill="#c8bca8"/>`;
      b += `<path d="M150 150H1050V200H150Z" fill="#c8202e"/><path d="M150 150H1050" stroke="#e8c04a" stroke-width="4"/>`;
      // background classmates (soft)
      let kids = '';
      for (let i = 0; i < 10; i++) { const x = 60 + i * 120 + R() * 40; if (x > 360 && x < 840) continue; const s = 0.9 + R() * 0.3; kids += `<g transform="translate(${r0(x)} 720) scale(${f1(s)})"><circle cx="0" cy="-150" r="20" fill="#2a1a14"/><path d="M-30-128H30L36 0H-36Z" fill="${R() < 0.5 ? '#2a3a6a' : '#f4f4f8'}"/></g>`; }
      b += `<g opacity=".55">${kids}</g>`;
      b += `<path d="M0 700H1200V900H0Z" fill="#b8b0a4"/>`;
      // Jin Ling (14) in school blazer
      b += `<path d="M330 900C330 720 400 650 520 630L600 620L680 630C800 650 870 720 870 900Z" fill="url(#blz)"/>`;
      b += `<path d="M560 626L600 720L640 626Z" fill="#f6f6f8"/><path d="M592 640H608L612 760L600 776L588 760Z" fill="#c8202e"/>`;
      b += `<path d="M520 632L600 760L560 900H480L470 700Z" fill="#202c56"/><path d="M680 632L600 760L640 900H720L730 700Z" fill="#202c56"/>`;
      b += `<g transform="translate(704 700)"><path d="M-16-18H16V8Q0 22-16 8Z" fill="#e8c04a"/><path d="M-9-2q4-6 9 0t9 0M-9 6q4-6 9 0t9 0" stroke="#8a5a14" stroke-width="2.5" fill="none"/></g>`;
      b += `<g transform="translate(600 456) scale(2.2)">${jlHead('scowl')}</g>`;
      // bouquet (sunflowers, roses, baby's breath) in kraft paper
      let bq = `<g transform="translate(470 760) rotate(-12)">`;
      bq += `<path d="M-60 140L-150-90H150L60 140Z" fill="url(#kraft)"/><path d="M-150-90L-60 140M150-90L60 140" stroke="#a8844a" stroke-width="3"/>`;
      for (let i = 0; i < 40; i++) bq += `<circle cx="${r0(-140 + R() * 280)}" cy="${r0(-150 + R() * 70)}" r="${f1(4 + R() * 4)}" fill="#fff" opacity=".95"/>`;
      const sun = (x, y, r) => { let s = `<g transform="translate(${x} ${y})">`; for (let k = 0; k < 14; k++) s += `<ellipse cx="0" cy="${-r * 0.8}" rx="${r * 0.22}" ry="${r * 0.5}" fill="#ffc81e" transform="rotate(${k * 25.7})"/>`; return s + `<circle r="${r * 0.48}" fill="#6a3a14"/><circle r="${r * 0.3}" fill="#4a2a0e"/></g>`; };
      const rose = (x, y, r, c) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}"/><path d="M${-r * 0.6} 0A${r * 0.6} ${r * 0.6} 0 1 1 ${r * 0.3} ${r * 0.5}M${-r * 0.25} 0a${r * 0.28} ${r * 0.28} 0 1 1 ${r * 0.3} ${r * 0.2}" stroke="#000" stroke-opacity=".25" stroke-width="3" fill="none"/></g>`;
      bq += `<path d="M-120-120l-30-40M110-120l40-30M0-180v-20" stroke="#4a8a3a" stroke-width="6"/><g fill="#4f9a44"><ellipse cx="-150" cy="-110" rx="30" ry="12" transform="rotate(-30 -150 -110)"/><ellipse cx="150" cy="-120" rx="30" ry="12" transform="rotate(30 150 -120)"/><ellipse cx="-40" cy="-220" rx="26" ry="10" transform="rotate(-60 -40 -220)"/></g>`;
      bq += sun(-70, -140, 60) + sun(70, -150, 52) + rose(0, -190, 34, '#f06a8a') + rose(-130, -180, 28, '#fff2f4') + rose(130, -190, 30, '#f6a0b8') + sun(0, -110, 44);
      bq += `<path d="M-50 100Q0 120 50 100L40 130Q0 140-40 130Z" fill="#c8202e"/><path d="M-10 110l-40 50M10 110l40 50" stroke="#c8202e" stroke-width="10"/>`;
      b += bq + `</g>`;

      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_ajie_soup — 2008: soup pot on a warm-lit stove
     ===================================================================== */
  def('p_ajie_soup', {
    title: 'A-Jie’s soup (2008)', w: 1200, h: 900, tags: ['ajie', 'soup', 'kitchen', 'old-photo', '2008', 'lotus-root'],
    svg: (w, h) => {
      const R = rng(2008);
      const defs =
        lin('tile', '0 0 0 1', '#e8dcc6 0|#cdbb9c 1') +
        lin('sky', '0 0 0 1', '#f6a860 0|#f8d090 1') +
        lin('pot', '0 0 1 0', '#5a3a2a 0|#9a6a4a .4|#7a4a32 .7|#3a2418 1') +
        lin('lid', '0 0 1 0', '#6a4632 0|#b07e5a .45|#5a3826 1') +
        lin('ctr', '0 0 0 1', '#6a5040 0|#3a2a20 1') +
        lin('stove', '0 0 0 1', '#2a2a2e 0|#121214 1') +
        glowDef('lamp', '#ffcf80', 0.9) + glowDef('fl', '#5aa0ff', 0.9) +
        lin('steam', '0 1 0 0', '#fff 0 .5|#fff 1 0') +
        filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#tile)"/>`;
      let tl = '';
      for (let x = 0; x <= w; x += 80) tl += `M${x} 0V560`;
      for (let y = 0; y <= 560; y += 80) tl += `M0 ${y}H1200`;
      b += `<path d="${tl}" stroke="#b8a888" stroke-width="3"/>`;
      // window with evening light and blinds
      b += `<rect x="760" y="60" width="360" height="300" fill="url(#sky)"/><path d="M760 60H1120V360H760Z" fill="none" stroke="#6a4a2a" stroke-width="16"/><path d="M940 60V360M760 210H1120" stroke="#6a4a2a" stroke-width="10"/>`;
      let bl = '';
      for (let y = 70; y < 200; y += 14) bl += `M770 ${y}H1110`;
      b += `<path d="${bl}" stroke="#d8b878" stroke-width="7" opacity=".8"/>`;
      b += `<circle cx="300" cy="80" r="360" fill="url(#lamp)" opacity=".7"/><path d="M300 0V40" stroke="#3a2a1a" stroke-width="4"/><path d="M250 40H350L330 80H270Z" fill="#3a2a1a"/>`;
      // counter, stove, flame
      b += `<path d="M0 560H1200V900H0Z" fill="url(#ctr)"/><path d="M0 560H1200" stroke="#8a6a50" stroke-width="6"/>`;
      b += `<path d="M300 600H900L940 760H260Z" fill="url(#stove)"/><ellipse cx="600" cy="640" rx="150" ry="26" fill="#1a1a1c"/>`;
      b += `<circle cx="600" cy="640" r="120" fill="url(#fl)" opacity=".5"/>`;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const x = 600 + Math.cos(a) * 70, y = 642 + Math.sin(a) * 12; b += `<path d="M${r0(x - 6)} ${r0(y)}q6-22 12 0z" fill="#6ab0ff"/>`; }
      // clay pot + lid + steam
      b += `<ellipse cx="600" cy="630" rx="190" ry="34" fill="#000" opacity=".35"/>`;
      b += `<path d="M420 470Q410 600 470 628H730Q790 600 780 470Z" fill="url(#pot)"/>`;
      b += `<path d="M412 470h376" stroke="#3a2418" stroke-width="10" stroke-linecap="round"/><path d="M418 496q-34 0-34 22t34 22M782 496q34 0 34 22t-34 22" stroke="#5a3a2a" stroke-width="14" fill="none"/>`;
      b += `<g transform="rotate(-8 600 460)"><path d="M440 462Q600 400 760 462Q600 480 440 462Z" fill="url(#lid)"/><ellipse cx="600" cy="420" rx="26" ry="12" fill="#7a4a32"/></g>`;
      b += `<path d="M520 520Q600 540 690 520" stroke="#fff" stroke-width="6" opacity=".2" fill="none"/>`;
      for (const [x, d] of [[520, 'M0 0C-30-60 30-100 0-160S-20-260 10-300'], [600, 'M0 0C30-50-20-110 10-170S40-250 0-320'], [690, 'M0 0C-20-50 30-90 0-150S-30-230 0-270']]) b += `<path d="${d}" transform="translate(${x} 440)" stroke="url(#steam)" stroke-width="26" fill="none" stroke-linecap="round" opacity=".6"/>`;
      b += `<path d="M760 440L880 300" stroke="#c8c8cc" stroke-width="10" stroke-linecap="round"/><ellipse cx="884" cy="290" rx="22" ry="14" fill="#c8c8cc" transform="rotate(-50 884 290)"/>`;
      // cutting board with lotus root slices
      b += `<path d="M40 640L300 600L340 760L70 810Z" fill="#c89a5a"/><path d="M40 640L300 600L304 614L44 654Z" fill="#e0b878"/>`;
      const slice = (x, y, r) => { let s = `<g transform="translate(${x} ${y})"><ellipse rx="${r}" ry="${r * 0.8}" fill="#f2e2cc" stroke="#c8a888" stroke-width="3"/>`; for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; s += `<ellipse cx="${f1(Math.cos(a) * r * 0.55)}" cy="${f1(Math.sin(a) * r * 0.44)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.13)}" fill="#c8a888"/>`; } return s + `<ellipse rx="${f1(r * 0.14)}" ry="${f1(r * 0.11)}" fill="#c8a888"/></g>`; };
      b += slice(120, 690, 40) + slice(190, 670, 38) + slice(170, 740, 40) + slice(250, 720, 36);
      b += `<path d="M90 780L260 760L268 772L96 794Z" fill="#c8c8cc"/><rect x="260" y="756" width="70" height="20" rx="6" fill="#3a2418" transform="rotate(-7 260 756)"/>`;
      // bowl with spoon
      b += `<path d="M900 700Q920 790 1000 800Q1080 790 1100 700Z" fill="#f4f0e8"/><ellipse cx="1000" cy="700" rx="100" ry="22" fill="#e8dcc6"/><path d="M904 704Q1000 690 1096 704" stroke="#3a6a9a" stroke-width="5" fill="none"/>`;
      b += film(w, h, 0, false);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_ajie_wedding — 2007: red and gold, the bride's silhouette
     ===================================================================== */
  def('p_ajie_wedding', {
    title: 'A-Jie’s wedding (2007)', w: 1200, h: 900, tags: ['ajie', 'wedding', 'old-photo', '2007', 'jin'],
    svg: (w, h) => {
      const R = rng(2007);
      const defs =
        lin('wall', '0 0 0 1', '#8a1420 0|#6a0e18 1') +
        rad('win', '.5 .5 .5', '#fff8e0 0|#ffe6a0 .5|#f0b850 .85|#c8862a 1') +
        glowDef('wg', '#ffd27a', 0.8) +
        lin('lan', '0 0 1 0', '#a8101e 0|#ff4030 .5|#a8101e 1') +
        lin('gold', '0 0 1 1', '#fff0b0 0|#e0aa45 .5|#9a6a1a 1') +
        lin('drape', '0 0 1 0', '#a01828 0|#d02838 .5|#8a1220 1') +
        filmDefs();
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      // gold lattice pattern on the wall
      let lat = '';
      for (let x = -20; x < w; x += 60) for (let y = -20; y < h; y += 60) lat += `M${x} ${y + 30}L${x + 30} ${y}L${x + 60} ${y + 30}L${x + 30} ${y + 60}Z`;
      b += `<path d="${lat}" stroke="#d4a040" stroke-width="2" fill="none" opacity=".18"/>`;
      // round moon window, backlit
      b += `<circle cx="640" cy="420" r="400" fill="url(#wg)"/><circle cx="640" cy="420" r="270" fill="url(#win)"/><circle cx="640" cy="420" r="270" fill="none" stroke="#c8962a" stroke-width="18"/>`;
      let lattice = '<g stroke="#b07a1e" stroke-width="5" opacity=".55">';
      for (let k = -2; k <= 2; k++) lattice += `<path d="M${640 + k * 90} 160V680M380 ${420 + k * 90}H900"/>`;
      b += lattice + '</g>';
      // drapes
      b += `<path d="M0 0H260Q200 300 240 900H0Z" fill="url(#drape)"/><path d="M1200 0H960Q1020 300 980 900H1200Z" fill="url(#drape)"/>`;
      b += `<path d="M0 0H1200V60Q900 110 600 70T0 60Z" fill="#b01a2a"/><path d="M0 60Q300 100 600 70T1200 60" stroke="#e8b840" stroke-width="5" fill="none"/>`;
      // lanterns
      const lantern = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-130V-70" stroke="#3a1a10" stroke-width="3"/><rect x="-24" y="-74" width="48" height="12" rx="3" fill="url(#gold)"/><ellipse cx="0" cy="0" rx="70" ry="64" fill="url(#lan)"/><path d="M-40-50Q-56 0-40 50M0-64V64M40-50Q56 0 40 50" stroke="#7a0a14" stroke-width="3" fill="none"/><rect x="-24" y="60" width="48" height="12" rx="3" fill="url(#gold)"/><path d="M-10 72v60M0 72v70M10 72v60" stroke="#e8b840" stroke-width="3"/></g>`;
      b += lantern(150, 230, 1) + lantern(1050, 230, 1);
      // gold peony sprays (Jin family) at the bottom corners
      const pe = (x, y, r) => { let s = `<g transform="translate(${x} ${y})">`; for (let k = 0; k < 10; k++) s += `<ellipse cx="0" cy="${-r * 0.5}" rx="${r * 0.32}" ry="${r * 0.5}" fill="url(#gold)" transform="rotate(${k * 36})"/>`; for (let k = 0; k < 7; k++) s += `<ellipse cx="0" cy="${-r * 0.26}" rx="${r * 0.2}" ry="${r * 0.3}" fill="#fff2c0" transform="rotate(${k * 51 + 10})"/>`; return s + `</g>`; };
      b += pe(110, 820, 70) + pe(220, 860, 50) + pe(1090, 820, 70) + pe(980, 866, 46);
      // the bride: profile silhouette with phoenix crown, veil and fan, rim-lit in gold
      const bride =
        `<path d="M0-470C-20-470-34-452-32-432C-30-420-36-412-40-404L-30-402C-28-392-26-384-16-382L-10-366C-30-356-48-330-54-300L-80-120L-130 0H130L90-140L70-300C64-336 44-360 20-370L22-400C34-412 34-440 22-460C16-466 8-470 0-470Z"/>` +
        `<path d="M-40-444C-54-476-34-516 2-524C44-530 70-500 60-462C58-446 48-436 34-432Z"/><path d="M-30-500Q-70-520-84-500Q-60-498-44-480ZM50-500Q80-530 100-512Q76-504 60-484Z"/><path d="M-20-516L-34-556M0-524V-566M22-520L36-558M44-506L70-538" stroke-width="5"/>` +
        `<path d="M30-474C70-450 100-300 120-120L150 0H130L96-140Z" opacity=".75"/>` +
        `<path d="M-60-330C-90-320-110-300-110-280L-74-268Z"/><circle cx="-104" cy="-300" r="40"/><path d="M-104-262V-200" stroke-width="6"/>`;
      b += `<g transform="translate(660 820)"><g fill="#ffd27a" stroke="#ffd27a" opacity=".85" transform="translate(-6 -4)">${bride}</g><g fill="#4a0c14" stroke="#4a0c14">${bride}</g>` +
        `<path d="M-50-260q20 10 40 0t40 0M-70-180q30 14 60 0t60 0M-96-90q40 16 80 0t80 0M-118-24q50 14 100 0t100 0" stroke="#e8b840" stroke-width="3" fill="none" opacity=".45"/>` +
        `<path d="M-40-444v24M-30-448v30M-20-450v26" stroke="#e8b840" stroke-width="2"/><g fill="#e8b840"><circle cx="-40" cy="-418" r="3.5"/><circle cx="-30" cy="-416" r="3.5"/><circle cx="-20" cy="-422" r="3.5"/><circle cx="-34" cy="-556" r="5"/><circle cx="0" cy="-566" r="5"/><circle cx="36" cy="-558" r="5"/><circle cx="70" cy="-538" r="5"/></g></g>`;
      b += film(w, h, 34, true);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_lotus_pond_day — Lotus Pier pond in summer, pavilion
     ===================================================================== */
  def('p_lotus_pond_day', {
    title: 'Lotus Pier in summer', w: 1200, h: 900, tags: ['lotus-pier', 'lotus', 'summer', 'day', 'pavilion'],
    svg: (w, h) => {
      const R = rng(715);
      const HZ = 430;
      const defs =
        lotusDefs() + padDef('pd', '#d8f0a0') +
        lin('sky', '0 0 0 1', '#3a8ad8 0|#7ab8ec .6|#c8e2f4 1') +
        lin('lake', '0 0 0 1', '#7ab8c8 0|#3a8a98 1') +
        lin('lf', '0 0 0 1', '#6ab04a 0|#3a7a34 1') +
        lin('roof', '0 0 0 1', '#4a4e58 0|#2a2c34 1') +
        vig('vg', 0.3) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${HZ + 4}" fill="url(#sky)"/>`;
      const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><circle cx="0" cy="0" r="50"/><circle cx="50" cy="-20" r="60"/><circle cx="110" cy="0" r="46"/><circle cx="60" cy="20" r="44"/><rect x="0" y="0" width="110" height="46"/></g>`;
      b += cloud(140, 150, 1) + cloud(760, 100, 1.3) + cloud(1040, 220, 0.7);
      b += `<path d="M0 ${HZ}Q160 360 340 400T700 380T1200 400V${HZ + 4}H0Z" fill="#6a9aa0" opacity=".7"/><path d="M0 ${HZ}Q240 400 520 416T1200 410V${HZ + 4}H0Z" fill="#4a8a6a"/>`;
      b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#lake)"/>`;
      // pavilion (red pillars, dark roof) on the water + zigzag bridge
      const pav = `<g transform="translate(820 ${HZ + 70})">` +
        `<path d="M-130 0H130V18H-130Z" fill="#e8e4dc"/><path d="M-120-14H120V0H-120Z" fill="#c8302e"/>` +
        [-100, -40, 40, 100].map((x) => `<rect x="${x - 6}" y="-120" width="12" height="108" fill="#c8302e"/>`).join('') +
        `<path d="M-120-60H120V-52H-120Z" fill="#c8302e"/>` +
        `<path d="M-170-118Q-140-116-120-110H120Q140-116 170-118Q150-126 132-140L84-176H-84L-132-140Q-150-126-170-118Z" fill="url(#roof)"/>` +
        `<path d="M-170-118Q-140-116-120-110H120Q140-116 170-118" stroke="#8a8e98" stroke-width="3" fill="none"/>` +
        `<path d="M-84-176H84L74-192H-74Z" fill="#3a3c44"/><path d="M-92-184q-12-12-14-24q12 4 20 18zM92-184q12-12 14-24q-12 4-20 18z" fill="#3a3c44"/><circle cx="0" cy="-200" r="7" fill="#e0b040"/>` +
        `</g>`;
      b += pav + `<g transform="translate(820 ${HZ + 160}) scale(1 -.5)" opacity=".25">${pav.replace(`translate(820 ${HZ + 70})`, 'translate(0 0)')}</g>`;
      b += `<path d="M0 640L300 600L420 640L700 588L700 600L420 652L300 612L0 652Z" fill="#e8e0d0"/><path d="M0 640L300 600L420 640L700 588" stroke="#c8302e" stroke-width="5" fill="none"/>`;
      for (let x = 20; x < 700; x += 40) { const y = x < 300 ? 640 - (x / 300) * 40 : x < 420 ? 600 + ((x - 300) / 120) * 40 : 640 - ((x - 420) / 280) * 52; b += `<rect x="${x}" y="${r0(y - 18)}" width="4" height="18" fill="#c8302e"/>`; }
      // lotus field
      const pads = [];
      for (let i = 0; i < 60; i++) { const t = Math.pow(R(), 0.7); const y = HZ + 30 + t * 440; pads.push([y, R() * (w + 200) - 100, 0.15 + t * 1.2]); }
      pads.sort((a, c) => a[0] - c[0]);
      for (const [y, x, s] of pads) b += `<use href="#pd" transform="translate(${r0(x)} ${r0(y)}) rotate(${r0((R() - 0.5) * 40)}) scale(${f1(s)} ${f1(s * (0.22 + (y - HZ) / 1600))})" fill="url(#lf)"/>`;
      const UP = '#7ac05a', UN = '#3f7a3a', RIM = '#d8f0a0';
      for (const [x, y, s, r] of [[90, 600, 0.9, -6], [260, 560, 0.7, 4], [1040, 560, 0.9, 6], [1150, 640, 1.1, -4], [560, 540, 0.6, 2], [700, 690, 1, -6]]) b += stem(x, y + 200, x + 10, y + 46 * s, 10, 5, '#3f7a3a') + cupLeaf(x, y, s, r, UP, UN, RIM);
      for (const [x, y, s, r] of [[180, 520, 0.9, -4], [420, 560, 0.8, 6], [960, 500, 0.8, 4], [880, 640, 1.1, -6], [330, 700, 1.2, 4]]) b += stem(x, y + 220, x, y, 8, 4, '#3f7a3a') + lotusFlower(x, y, s, r);
      for (const [x, y, s] of [[640, 480, 0.5], [1100, 470, 0.5], [60, 480, 0.45]]) b += stem(x, y + 160, x, y, 4, 3, '#3f7a3a') + lotusBud(x, y, s, 0);
      b += cupLeaf(150, 860, 2.2, 8, UP, UN, RIM) + cupLeaf(1060, 880, 2, -8, UP, UN, RIM);
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.05);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_lotus_macro — close-up pink lotus with droplets
     ===================================================================== */
  def('p_lotus_macro', {
    title: 'Lotus, close up', w: 1200, h: 900, tags: ['lotus', 'macro', 'flower', 'lotus-pier'],
    svg: (w, h) => {
      const R = rng(9);
      const defs =
        lotusDefs() +
        rad('bg', '.5 .45 .8', '#5a8a4a 0|#2a4a2a .6|#14261a 1') +
        bokehDef('b1', '#a8d878') + bokehDef('b2', '#ffd0dc') + bokehDef('b3', '#e8f4c0') +
        rad('drop', '.35 .3 .7', '#ffffff 0 .9|#ffffff .25 .25|#ffe0ea .6 .1|#a0405a .9 .3|#ffffff 1 .6') +
        rad('pod', '.5 .4 .6', '#f2f0a0 0|#c8d060 .7|#90a040 1') +
        `<path id="vn" d="M0-4V-90M-4-8Q-12-44-7-80M4-8Q12-44 7-80M-8-14Q-19-40-12-66M8-14Q19-40 12-66" fill="none" stroke="#c2456f" stroke-opacity=".22" stroke-width=".9"/>` +
        vig('vg', 0.5) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      b += bokeh(R, 24, 0, 0, w, h, 30, 110, ['b1', 'b3', 'b2'], 0.15, 0.5);
      // big flower built directly from petals so droplets sit on them
      const P = (a, sx, sy, dx, dy, g) => `<g transform="translate(${dx} ${dy}) rotate(${a}) scale(${sx} ${sy})"><use href="#pt" fill="url(#${g})"/><use href="#vn"/></g>`;
      let f = `<g transform="translate(600 640) scale(4.4)" stroke="#b9426f" stroke-opacity=".3" stroke-width=".8">`;
      f += P(-44, 0.8, 0.95, -6, -8, 'pb') + P(44, 0.8, 0.95, 6, -8, 'pb') + P(-16, 0.82, 1.05, -3, -10, 'pb') + P(16, 0.82, 1.05, 3, -10, 'pb');
      // seed pod with holes + stamens
      f += `<path d="M-24-42Q0-50 24-42L18-28Q0-24-18-28Z" fill="#a8b04a" stroke="none"/><ellipse cx="0" cy="-42" rx="24" ry="7.5" fill="url(#pod)" stroke="none"/>`;
      for (const [x, y] of [[-12, -43], [-4, -45], [5, -45], [13, -42], [-8, -39], [2, -40], [10, -38], [-15, -40]]) f += `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="1" fill="#6a7a2a" stroke="none"/>`;
      let st = '';
      for (let i = 0; i < 22; i++) { const a = -1.35 + (2.7 * i) / 21; st += `M${f1(Math.sin(a) * 18)} ${f1(-34 + Math.abs(Math.sin(a)) * 4)}L${f1(Math.sin(a) * 30)} ${f1(-46 + Math.abs(a) * 7)}`; }
      f += `<path d="${st}" stroke="#ffd24d" stroke-opacity="1" stroke-width="1.4" stroke-linecap="round"/>`;
      f += P(-70, 0.9, 0.9, -8, 0, 'pa') + P(70, 0.9, 0.9, 8, 0, 'pa') + P(-100, 0.7, 0.74, -10, 6, 'pa') + P(100, 0.7, 0.74, 10, 6, 'pa');
      f += P(-32, 0.95, 0.66, -8, 6, 'pa') + P(32, 0.95, 0.66, 8, 6, 'pa') + P(0, 1.02, 0.5, 0, 8, 'pa');
      f += `</g>`;
      b += f;
      // droplets
      for (const [x, y, r] of [[470, 520, 22], [500, 470, 12], [760, 560, 28], [720, 610, 13], [600, 600, 18], [330, 600, 20], [900, 610, 17], [660, 330, 14], [430, 640, 11], [540, 300, 16], [810, 450, 12], [270, 560, 9], [380, 700, 15], [840, 700, 13]]) b += `<ellipse cx="${x + 3}" cy="${y + 6}" rx="${r}" ry="${f1(r * 0.85)}" fill="#8a2a4a" opacity=".22"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f1(r * 0.85)}" fill="url(#drop)"/><ellipse cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.35)}" rx="${f1(r * 0.24)}" ry="${f1(r * 0.16)}" fill="#fff"/><path d="M${f1(x + r * 0.2)} ${f1(y + r * 0.55)}q${f1(r * 0.3)}-${f1(r * 0.1)} ${f1(r * 0.45)}-${f1(r * 0.4)}" stroke="#fff" stroke-width="${f1(r * 0.1)}" fill="none" opacity=".7"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.05);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_sunrise_lake — sunrise over Yunmeng lake
     ===================================================================== */
  def('p_sunrise_lake', {
    title: 'Sunrise over Yunmeng lake', w: 1200, h: 900, tags: ['sunrise', 'lake', 'yunmeng', 'morning'],
    svg: (w, h) => {
      const R = rng(738);
      const HZ = 520;
      const defs =
        lin('sky', '0 0 0 1', '#3a3a7a 0|#8a5a9a .35|#e88a9a .62|#ffb070 .85|#ffd890 1') +
        lin('lake', '0 0 0 1', '#ffc890 0|#e08a8a .25|#7a5a8a .6|#2a2a4a 1') +
        rad('sun', '.5 .5 .5', '#fffbe8 0|#fff0c0 .8|#ffd890 1') + glowDef('sg', '#ffe0a0', 0.9) +
        lin('mist', '0 0 0 1', '#ffe8d0 0 0|#ffe8d0 .5 .55|#ffe8d0 1 0') +
        vig('vg', 0.4) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${HZ + 2}" fill="url(#sky)"/>`;
      b += `<circle cx="640" cy="${HZ}" r="520" fill="url(#sg)"/><circle cx="640" cy="${HZ - 14}" r="58" fill="url(#sun)"/>`;
      for (const [x, y, rx] of [[300, 300, 260], [880, 240, 300], [560, 380, 200], [1050, 360, 160]]) b += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${f1(rx * 0.06)}" fill="#ffc8a0" opacity=".55"/>`;
      b += `<path d="M0 ${HZ}Q120 470 260 492T520 488Q560 500 600 ${HZ}Z" fill="#6a4a7a"/><path d="M760 ${HZ}Q860 480 960 490T1200 470V${HZ}Z" fill="#6a4a7a"/>`;
      b += `<g transform="translate(980 ${HZ - 28}) scale(.35)" fill="#4a3060"><rect x="-6" y="-120" width="12" height="40"/><path d="M-80-80H80L60-100H-60Z"/><rect x="-60" y="-80" width="120" height="60"/><path d="M-100-20H100L80-40H-80Z"/><rect x="-80" y="-20" width="160" height="20"/></g>`;
      b += `<rect y="${HZ}" width="${w}" height="${h - HZ}" fill="url(#lake)"/>`;
      let gl = '';
      for (let i = 0; i < 34; i++) { const t = i / 33, y = HZ + 4 + Math.pow(t, 1.6) * 380, hw = 12 + t * 120; for (let k = 0; k < 1 + (t * 3) | 0; k++) { const ww = hw * (0.3 + R() * 0.8); gl += `<rect x="${r0(640 - hw + R() * (2 * hw - ww))}" y="${r0(y)}" width="${r0(ww)}" height="${f1(2 + t * 5)}" rx="2" opacity="${f1(0.85 - t * 0.6)}"/>`; } }
      b += `<g fill="#fff4d0">${gl}</g>`;
      b += `<rect y="${HZ - 30}" width="${w}" height="90" fill="url(#mist)"/><rect y="${HZ + 60}" width="${w}" height="70" fill="url(#mist)" opacity=".6"/>`;
      // boat with a fisherman
      b += `<g transform="translate(330 640)" fill="#241a30"><path d="M-110 0Q-40 16 60 12Q110 8 130-14L116 8Q50 26-50 24Q-96 20-110 0Z"/><path d="M10 4V-60M10-60Q40-40 60 10" stroke="#241a30" stroke-width="3" fill="none"/><circle cx="-10" cy="-48" r="9"/><path d="M-30-56Q-10-76 10-56Z"/><path d="M-20-40H0L4 6H-24Z"/></g>`;
      b += `<path d="M190 660H480" stroke="#ffd8b0" stroke-width="2" opacity=".5"/>`;
      // egrets
      for (const [x, y, s] of [[820, 300, 1], [870, 330, 0.8], [760, 340, 0.7]]) b += `<path d="M${x - 16 * s} ${y}q${8 * s}-${10 * s} ${16 * s} 0q${8 * s}-${10 * s} ${16 * s} 0" stroke="#3a2a4a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      // foreground lotus silhouettes
      const S = '#1e1428';
      b += `<g fill="${S}"><path d="M60 900Q80 780 70 700" stroke="${S}" stroke-width="7" fill="none"/><path d="M70 700C40 690 30 640 70 610C110 640 100 690 70 700Z"/>` +
        `<path d="M1100 900Q1080 760 1100 660" stroke="${S}" stroke-width="7" fill="none"/><path d="M1000 660Q1100 610 1200 650Q1180 690 1100 690Q1020 690 1000 660Z"/>` +
        `<path d="M200 900Q190 820 210 760" stroke="${S}" stroke-width="6" fill="none"/><path d="M130 760Q210 726 290 756Q270 786 210 786Q150 786 130 760Z"/>` +
        `<ellipse cx="380" cy="880" rx="200" ry="30"/><ellipse cx="900" cy="890" rx="240" ry="34"/></g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_silver_bell — Jiang clan silver bell with lotus engraving, purple velvet
     ===================================================================== */
  def('p_silver_bell', {
    title: 'The Jiang silver bell', w: 1200, h: 900, tags: ['bell', 'jiang', 'gift', 'jinling', 'ajie', 'lotus'],
    svg: (w, h) => {
      const R = rng(9);
      const defs =
        lin('vel', '0 0 1 1', '#3a1658 0|#5a2a82 .35|#2a0e44 .6|#4a2070 .8|#24103a 1') +
        lin('fold', '0 0 1 0', '#000 0 0|#000 .5 .35|#000 1 0') +
        lin('foldL', '0 0 1 0', '#fff 0 0|#d8b8ff .5 .22|#fff 1 0') +
        rad('silver', '.36 .3 .75', '#ffffff 0|#e4e4ec .25|#a8a8b8 .55|#6a6a7c .8|#c8c0dc 1') +
        lin('cap', '0 0 1 0', '#8a8a9a 0|#f4f4f8 .4|#9a9aaa 1') +
        lin('cord', '0 0 1 1', '#9a5ad8 0|#5a2a90 1') +
        rad('spot', '.5 .42 .6', '#fff 0 .2|#fff 1 0') +
        vig('vg', 0.65) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#vel)"/>`;
      for (const [d, g] of [['M-100 900C200 600 300 300 200-50L420-50C520 300 400 620 120 900Z', 'fold'], ['M600 950C760 700 980 600 1300 640V760C1000 740 820 820 760 950Z', 'fold'], ['M300 900C420 640 520 400 480-50L560-50C620 400 520 660 400 900Z', 'foldL'], ['M760 950C900 760 1060 700 1300 700V730C1060 740 920 800 820 950Z', 'foldL']]) b += `<path d="${d}" fill="url(#${g})"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#spot)"/>`;
      // cord + tassel lying on the velvet
      b += `<path d="M590 284C560 200 420 180 330 240C250 290 230 380 170 420" stroke="url(#cord)" stroke-width="14" fill="none" stroke-linecap="round"/>`;
      b += `<path d="M590 284C560 200 420 180 330 240C250 290 230 380 170 420" stroke="#d8b0ff" stroke-width="3" fill="none" opacity=".5" stroke-dasharray="6 10"/>`;
      let tas = '';
      for (let i = 0; i < 16; i++) tas += `M${150 + i * 3} 430Q${130 + i * 4} 520 ${110 + i * 6} ${600 + (i % 3) * 10}`;
      b += `<rect x="140" y="410" width="54" height="34" rx="10" fill="url(#cord)"/><path d="${tas}" stroke="#7a3ab8" stroke-width="4" fill="none"/><path d="${tas}" stroke="#c89aff" stroke-width="1.2" fill="none" opacity=".6"/>`;
      // bell shadow, body, slit, cap and loop
      b += `<ellipse cx="620" cy="760" rx="230" ry="40" fill="#0a0414" opacity=".55"/>`;
      b += `<circle cx="600" cy="306" r="26" fill="none" stroke="url(#cap)" stroke-width="13"/>`;
      b += `<path d="M560 330H640L652 362H548Z" fill="url(#cap)"/>`;
      b += `<circle cx="600" cy="540" r="200" fill="url(#silver)"/>`;
      b += `<path d="M470 676Q600 712 730 676" stroke="#4a4a5a" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M470 676Q600 712 730 676" stroke="#14141c" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      b += `<circle cx="466" cy="675" r="13" fill="#14141c" stroke="#5a5a6a" stroke-width="3"/><circle cx="734" cy="675" r="13" fill="#14141c" stroke="#5a5a6a" stroke-width="3"/>`;
      b += `<path d="M420 470Q600 420 780 470" stroke="#8a8a9a" stroke-width="3" fill="none" opacity=".7"/>`;
      // engraved nine-petal lotus
      let lot = '<g transform="translate(600 556) scale(1.45)"><circle cx="0" cy="-30" r="66"/>';
      for (let k = 0; k < 9; k++) lot += `<path d="M0 0C-16-22-13-50 0-60C13-50 16-22 0 0Z" transform="rotate(${-80 + k * 20}) scale(1 .9)"/>`;
      lot += '<path d="M-40 10Q0 26 40 10"/></g>';
      b += `<g fill="none" stroke="#3a3a48" stroke-width="3.2" opacity=".75">${lot}</g><g fill="none" stroke="#fff" stroke-width="1.6" opacity=".7" transform="translate(-1.5 -1.5)">${lot}</g>`;

      // highlights + purple reflection
      b += `<ellipse cx="520" cy="430" rx="60" ry="34" fill="#fff" opacity=".7" transform="rotate(-30 520 430)"/><ellipse cx="700" cy="660" rx="80" ry="30" fill="#b07ae0" opacity=".35" transform="rotate(-20 700 660)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.07);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_cake_lotus — lotus-seed-paste birthday cake, design sketch
     ===================================================================== */
  def('p_cake_lotus', {
    title: 'Cake sketch', w: 1200, h: 900, tags: ['cake', 'sketch', 'birthday', 'jinling', 'lotus'],
    svg: (w, h) => {
      const R = rng(1818);
      const defs =
        lin('desk', '0 0 1 1', '#8a6a4a 0|#6a4a32 1') +
        lin('paper', '0 0 0 1', '#fffdf6 0|#f4efe2 1') +
        lin('pen', '0 0 0 1', '#2a6a4a 0|#1a4a34 1') +
        vig('vg', 0.45) + grainDef('gr', 0.7);
      let b = `<rect width="${w}" height="${h}" fill="url(#desk)"/>`;
      // paper + spiral binding
      b += `<g transform="rotate(-3 600 450)"><rect x="150" y="70" width="900" height="800" rx="8" fill="#000" opacity=".3" transform="translate(12 16)"/><rect x="150" y="70" width="900" height="800" rx="8" fill="url(#paper)"/>`;
      let dots = '';
      for (let x = 190; x < 1040; x += 36) for (let y = 120; y < 850; y += 36) dots += `M${x} ${y}h1`;
      b += `<path d="${dots}" stroke="#c8d0dc" stroke-width="3" stroke-linecap="round"/>`;
      for (let x = 190; x < 1040; x += 52) b += `<ellipse cx="${x}" cy="72" rx="9" ry="20" fill="none" stroke="#9a9aa4" stroke-width="5"/>`;
      // sketchy lines: draw each path twice with a little jitter
      const sk = (d, c, wd, op) => `<path d="${d}" stroke="${c}" stroke-width="${wd}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/><path d="${d}" transform="translate(${f1((R() - 0.5) * 4)} ${f1((R() - 0.5) * 4)})" stroke="${c}" stroke-width="${f1(wd * 0.6)}" fill="none" stroke-linecap="round" opacity="${f1(op * 0.6)}"/>`;
      const G = '#5a5a62';
      // colour pencil fills (under the line work)
      let hatch = '';
      for (let i = 0; i < 40; i++) { const x = 400 + i * 10; hatch += `M${x} 660l26-120`; }
      b += `<path d="${hatch}" stroke="#f2d9a8" stroke-width="6" opacity=".55"/>`;
      let hatch2 = '';
      for (let i = 0; i < 28; i++) { const x = 470 + i * 10; hatch2 += `M${x} 520l20-90`; }
      b += `<path d="${hatch2}" stroke="#f2d9a8" stroke-width="6" opacity=".5"/>`;
      // two tiers
      b += sk('M390 540V660Q600 720 810 660V540', G, 3.5, 0.9) + sk('M390 540Q600 600 810 540Q600 480 390 540Z', G, 3.5, 0.9);
      b += sk('M470 430V520Q600 560 730 520V430', G, 3.2, 0.9) + sk('M470 430Q600 470 730 430Q600 390 470 430Z', G, 3.2, 0.9);
      // lotus leaves round the base + lotus on top
      for (const [x, y, s] of [[420, 640, 1], [520, 668, 0.9], [680, 668, 0.9], [780, 636, 1]]) b += `<path d="M${x - 40 * s} ${y}Q${x} ${y - 30 * s} ${x + 40 * s} ${y}Q${x} ${y + 20 * s} ${x - 40 * s} ${y}Z" fill="#9ccf7a" opacity=".55"/>` + sk(`M${x - 40 * s} ${y}Q${x} ${y - 30 * s} ${x + 40 * s} ${y}Q${x} ${y + 20 * s} ${x - 40 * s} ${y}ZM${x} ${y + 6 * s}V${y - 18 * s}`, '#4a7a3a', 2.4, 0.8);
      let lotus = '';
      for (const [a, s] of [[-50, 0.8], [-25, 0.95], [0, 1.05], [25, 0.95], [50, 0.8]]) lotus += `<path d="M0 0C-16-10-18-44 0-70C18-44 16-10 0 0Z" transform="translate(600 420) rotate(${a}) scale(${s})" fill="#f6a8c0" opacity=".6"/>`;
      b += lotus;
      for (const [a, s] of [[-50, 0.8], [-25, 0.95], [0, 1.05], [25, 0.95], [50, 0.8]]) b += `<g transform="translate(600 420) rotate(${a}) scale(${s})">${sk('M0 0C-16-10-18-44 0-70C18-44 16-10 0 0Z', '#c04a72', 2.6, 0.85)}</g>`;
      b += sk('M520 470q20 10 40 0t40 0t40 0t40 0', '#c04a72', 2.4, 0.7);
      // annotation arrows + scribbled notes
      const scrib = (x, y, n) => { let d = `M${x} ${y}`; for (let i = 0; i < n; i++) d += `q4 -${f1(6 + R() * 8)} 8 0t8 0`; return d; };
      b += sk('M830 600Q880 600 900 560', G, 2.6, 0.8) + sk('M892 572l8-14l6 16', G, 2.6, 0.8) + sk(scrib(860, 530, 9), '#4a4a52', 2.2, 0.75) + sk(scrib(860, 500, 6), '#4a4a52', 2.2, 0.75);
      b += sk('M640 360Q700 300 780 290', G, 2.6, 0.8) + sk('M766 282l16 8l-14 10', G, 2.6, 0.8) + sk(scrib(800, 286, 10), '#4a4a52', 2.2, 0.75) + sk(scrib(800, 256, 7), '#4a4a52', 2.2, 0.75);
      b += sk('M370 600Q300 600 280 650', G, 2.6, 0.8) + sk(scrib(220, 690, 8), '#4a4a52', 2.2, 0.75);
      b += `<g transform="translate(600 250) scale(.6)">` + sk('M0 0C-16-10-18-44 0-70C18-44 16-10 0 0ZM0 0C-30-4-46-24-44-44C-28-36-12-22 0 0ZM0 0C30-4 46-24 44-44C28-36 12-22 0 0Z', '#c04a72', 3.5, 0.75) + `</g>` + sk(scrib(560, 160, 6), '#4a4a52', 2.2, 0.7);
      // tiny Fairy doodle in the corner ("option B?")
      b += `<g transform="translate(940 760)">` + sk('M-30 0Q-36-34 0-40Q36-34 30 0Q20 16 0 16Q-20 16-30 0ZM-30-24Q-46-10-38 8M30-24Q46-10 38 8', '#2a2a30', 2.6, 0.85) + `<circle cx="-10" cy="-14" r="3"/><circle cx="10" cy="-14" r="3"/><ellipse cx="0" cy="-4" rx="5" ry="3.5"/>` + sk('M-2 2q2 10 6 12', '#e05a80', 3, 0.9) + `</g>`;
      b += `</g>`;
      // pencil + eraser
      b += `<g transform="translate(980 300) rotate(62)"><rect x="-200" y="-12" width="360" height="24" fill="#f2c230"/><path d="M-200-12V12M-200 0H160" stroke="#d8a820" stroke-width="2"/><path d="M160-12L210 0L160 12Z" fill="#f2dcb8"/><path d="M196-4L210 0L196 4Z" fill="#3a3a40"/><rect x="-236" y="-12" width="36" height="24" fill="#c0c0c8"/><rect x="-262" y="-12" width="28" height="24" rx="6" fill="#f08aa0"/></g>`;
      b += `<rect x="60" y="760" width="120" height="60" rx="10" fill="#fff" transform="rotate(-14 120 790)"/><rect x="60" y="760" width="40" height="60" rx="10" fill="#4a7ac8" transform="rotate(-14 120 790)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.07);
      return wrap(w, h, defs, b);
    },
  });
})();
