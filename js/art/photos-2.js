/* Photos 2 — Childe's family, fishing, Liyue kitchens and decks. 1200×900 unless noted. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- tiny kit (self-contained) ---------- */
  const f1 = (v) => Math.round(v * 10) / 10;
  const R0 = Math.round;
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
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1, ex = '') => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${ex}>${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5, ex = '') => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${ex}>${stops(s)}</radialGradient>`;
  const US = ' gradientUnits="userSpaceOnUse"';
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  // one light grain per image
  const grainDef = (fr = 0.85) => `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 1.4 -.55"/></filter>`;
  const grain = (w, h, op = 0.18) => `<rect width="${w}" height="${h}" filter="url(#gr)" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  const vigDef = (op = 0.5, c = '#000', inner = 0.55) => rg('vg', [[0, c, 0], [inner, c, 0], [1, c, op]], 0.5, 0.5, 0.75);
  const vig = (w, h) => `<rect width="${w}" height="${h}" fill="url(#vg)"/>`;
  const glow = (id, c, a = 0.9) => rg(id, [[0, c, a], [0.35, c, f1(a * 0.45)], [1, c, 0]]);
  // scattered dots (snow, sparkle, bokeh) as two compact paths at two opacities
  const dots = (seed, n, x0, y0, x1, y1, r0, r1, fill, o0 = 0.4, o1 = 0.9) => {
    const R = rng(seed);
    const d = ['', ''];
    for (let i = 0; i < n; i++) {
      const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = f1(r0 + R() * (r1 - r0));
      d[i % 2] += `M${R0(x - r)} ${R0(y)}a${r} ${r} 0 1 0 ${f1(2 * r)} 0a${r} ${r} 0 1 0 ${f1(-2 * r)} 0`;
    }
    return `<path d="${d[0]}" fill="${fill}" opacity="${o0}"/><path d="${d[1]}" fill="${fill}" opacity="${o1}"/>`;
  };
  /* ---------- hand lettering: single-stroke caps in a 10×14 box ---------- */
  const GL = {
    A: 'M0 14L5 0L10 14M2 9H8', B: 'M0 0V14M0 0H5Q9 0 9 3.5T5 7H0M5 7Q10 7 10 10.5T5 14H0', C: 'M10 2Q8 0 5 0Q0 0 0 7T5 14Q8 14 10 12',
    E: 'M10 0H0V14H10M0 7H7', H: 'M0 0V14M10 0V14M0 7H10', J: 'M3 0H10M8 0V10Q8 14 4 14Q1 14 0 11', L: 'M0 0V14H9',
    M: 'M0 14V0L5 8L10 0V14', N: 'M0 14V0L10 14V0', O: 'M5 0Q0 0 0 7T5 14T10 7T5 0Z', R: 'M0 14V0H5Q9 0 9 3.5T5 7H0M5 7L10 14',
    S: 'M10 2Q8 0 5 0Q0 0 0 3.5Q0 6.5 5 7Q10 7.5 10 10.5Q10 14 5 14Q2 14 0 12', T: 'M0 0H10M5 0V14', U: 'M0 0V9Q0 14 5 14T10 9V0',
    Y: 'M0 0L5 7L10 0M5 7V14', 3: 'M1 1Q3 0 5 0Q9 0 9 3.5T5 7Q10 7 10 10.5T5 14Q2 14 0 13', I: 'M5 0V14', 8: 'M5 7Q1 6.5 1 3.5T5 0T9 3.5T5 7Q0 7.5 0 10.5T5 14T10 10.5T5 7Z',
    a: 'M8 6Q7 5 4.5 5Q0 5 0 9.5T4.5 14Q8 14 8 9.5M8 5V14', n: 'M0 5V14M0 8Q1 5 4.5 5Q8 5 8 8.5V14',
  };
  // o: {sz, col, w (stroke in px), seed, jit (deg), wob (px), crayon}
  const scribe = (str, x, y, o) => {
    const R = rng(o.seed || 7);
    const k = o.sz / 14;
    const jit = o.jit == null ? 5 : o.jit, wob = o.wob == null ? 2 : o.wob;
    let cx = x, s = '';
    for (const ch of str) {
      if (ch === ' ') { cx += 8 * k; continue; }
      const d = GL[ch];
      const wd = /[an]/.test(ch) ? 8 : 10;
      if (d) {
        const r = f1((R() - 0.5) * 2 * jit), dy = f1((R() - 0.5) * 2 * wob), sc = f1(k * (1 + (R() - 0.5) * (o.crayon ? 0.18 : 0.06)) * 100) / 100;
        s += `<path transform="translate(${f1(cx)} ${f1(y + dy)}) rotate(${r} ${wd / 2} 7) scale(${sc})" d="${d}" stroke-width="${f1(o.w / sc)}"/>`;
      }
      cx += (wd + 3.4) * k;
    }
    return `<g fill="none" stroke="${o.col}" stroke-linecap="round" stroke-linejoin="round"${o.op ? ` opacity="${o.op}"` : ''}>${s}</g>`;
  };
  const textW = (str, sz) => [...str].reduce((a, ch) => a + (ch === ' ' ? 8 : (/[an]/.test(ch) ? 8 : 10) + 3.4), 0) * (sz / 14);

  /* ---------- people kit: heads in a local frame (face centre 0,0, ~84 wide, chin at y≈50) ---------- */
  const INK = '#2a1a1e';
  // LITE: drop the finest details (fringe shadows, lower lashes) for crowded images
  let LITE = false;
  const lite = (fn) => { LITE = true; try { return fn(); } finally { LITE = false; } };
  const SK = {
    fair: ['#ffeadc', '#f8d3ba', '#e8ae8f', '#cc8a6b'],
    tan: ['#f6d0b0', '#e6ae88', '#c98d68', '#a66b4c'],
  };
  const skinDef = (k, id = 'sk') => lg(id, [[0, k[0]], [0.55, k[1]], [1, k[2]]], 0.3, 0, 0.75, 1);
  const FA = 'M-40-6C-41-40-22-54 0-54C22-54 41-40 40-6C39 16 30 34 14 45Q6 50 0 50Q-6 50-14 45C-30 34-39 16-40-6Z';
  const FA_SH = 'M40-6C39 16 30 34 14 45Q6 50 0 50Q20 38 28 16Q33 2 32-14Z';
  const FK = 'M-42 0C-43-36-22-50 0-50C22-50 43-36 42 0C41 24 28 42 12 47Q6 49 0 49Q-6 49-12 47C-28 42-41 24-42 0Z';
  const FK_SH = 'M42 0C41 24 28 42 12 47Q6 49 0 49Q24 38 31 14Q34 4 33-10Z';
  const face = (k, kid, sk = 'sk', blush = 0.35) =>
    `<ellipse cx="-39" cy="8" rx="7.5" ry="10.5" fill="${k[1]}"/><ellipse cx="39" cy="8" rx="7.5" ry="10.5" fill="${k[2]}"/>` +
    `<path d="M-36 6q-4 2-2 8M36 6q4 2 2 8" stroke="${k[3]}" stroke-width="2" fill="none" opacity=".6"/>` +
    `<path d="${kid ? FK : FA}" fill="url(#${sk})"/><path d="${kid ? FK_SH : FA_SH}" fill="${k[2]}" opacity=".45"/>` +
    (blush ? `<ellipse cx="-23" cy="23" rx="9" ry="5" fill="#ff7f7a" opacity="${blush}"/><ellipse cx="23" cy="23" rx="9" ry="5" fill="#ff7f7a" opacity="${blush}"/>` : '');
  const neck = (k, w = 14, h = 34) => `<path d="M-${w} 30V${30 + h}Q0 ${36 + h} ${w} ${30 + h}V30Z" fill="${k[2]}"/><path d="M-${w} 34Q0 48 ${w} 34V44Q0 56-${w} 44Z" fill="${k[3]}" opacity=".4"/>`;
  // eyes: t = open | happy | shut | half ; iris colours [base, dark]. Both eyes share paths to stay small.
  const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}a${rx} ${ry} 0 1 0 ${f1(2 * rx)} 0a${rx} ${ry} 0 1 0 ${f1(-2 * rx)} 0`;
  const eyes = (t, ir, o = {}) => {
    const y = o.y == null ? 8 : o.y, sep = o.sep || 17, gx = o.gx || 0, gy = o.gy || 0;
    const top = t === 'half' ? -3 : -9;
    let wh = '', irs = '', drk = '', pup = '', hl = '', hl2 = '', lash = '', low = '', ln = '';
    for (const sd of [-1, 1]) {
      const cx = sd * sep;
      const P = (dx, dy) => `${f1(cx + sd * dx)} ${f1(y + dy)}`;
      if (t === 'happy') { ln += `M${P(-10, 3)}Q${P(0, -9)} ${P(10, 3)}`; continue; }
      if (t === 'shut') { ln += `M${P(-9, 1)}Q${P(0, 7)} ${P(10, 0)}M${P(8, 2)}l${sd * 3} 3`; continue; }
      const ix = cx + gx, iy = y + 1 + gy;
      wh += `M${P(-10, -1)}Q${P(-8, top)} ${P(0, top)}Q${P(9, top)} ${P(11, -3)}Q${P(8, 9)} ${P(0, 9)}Q${P(-8, 8)} ${P(-10, -1)}Z`;
      irs += ell(ix, iy, 6.6, t === 'half' ? 6.5 : 8.2);
      drk += ell(ix, iy - 3.5, 6.6, 4.4);
      pup += ell(ix, iy, 3, 4);
      hl += ell(ix + 2.6, iy - 3, o.dim ? 1.8 : 2.4, o.dim ? 1.8 : 2.4);
      hl2 += ell(ix - 2.4, iy + 4, 1.1, 1.1);
      lash += `M${P(-11, 0)}Q${P(-8, top - 1.5)} ${P(0, top - 1)}Q${P(9, top - 1)} ${P(12, -4)}l${sd * 3}-3`;
      low += `M${P(-4, 9.5)}Q${P(4, 10)} ${P(8, 6)}`;
    }
    if (ln) return `<path d="${ln}" fill="none" stroke="${INK}" stroke-width="${t === 'happy' ? 3.6 : 2.6}" stroke-linecap="round"/>`;
    return `<path d="${wh}" fill="#fff"/><path d="${irs}" fill="${ir[0]}"/><path d="${drk}" fill="${ir[1]}" opacity=".75"/><path d="${pup}" fill="${INK}"/>` +
      `<path d="${hl}" fill="#fff" opacity="${o.dim ? 0.55 : 1}"/>` + (o.dim || LITE ? '' : `<path d="${hl2}" fill="#fff" opacity=".8"/>`) +
      `<path d="${lash}" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>` +
      (LITE ? '' : `<path d="${low}" fill="none" stroke="${INK}" stroke-width="1.3" opacity=".45" stroke-linecap="round"/>`);
  };
  const brows = (c, t = 'n', y = -10) => {
    const d = {
      n: `M-27 ${y}Q-18 ${y - 5}-8 ${y - 2}M27 ${y}Q18 ${y - 5} 8 ${y - 2}`,
      up: `M-27 ${y - 2}Q-18 ${y - 9}-8 ${y - 5}M27 ${y - 2}Q18 ${y - 9} 8 ${y - 5}`,
      sad: `M-27 ${y - 1}Q-18 ${y - 2}-8 ${y - 6}M27 ${y - 1}Q18 ${y - 2} 8 ${y - 6}`,
      cocky: `M-27 ${y - 1}Q-18 ${y - 7}-8 ${y - 3}M27 ${y - 5}Q18 ${y - 9} 8 ${y - 2}`,
    }[t];
    return `<path d="${d}" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`;
  };
  const nose = (k) => `<path d="M1 17Q-1.5 21 2 23" fill="none" stroke="${k[3]}" stroke-width="2" stroke-linecap="round"/>`;
  // mouth: grin | gap | laugh | smile | soft | flat | o
  const mouth = (t, y = 32) => {
    if (t === 'smile') return `<path d="M-9 ${y - 2}Q0 ${y + 5} 9 ${y - 2}" fill="none" stroke="#9a3f45" stroke-width="2.6" stroke-linecap="round"/>`;
    if (t === 'soft') return `<path d="M-6 ${y}Q0 ${y + 3} 6 ${y}" fill="none" stroke="#9a3f45" stroke-width="2.4" stroke-linecap="round"/>`;
    if (t === 'flat') return `<path d="M-6 ${y + 1}Q0 ${y + 1.5} 6 ${y}" fill="none" stroke="#9a3f45" stroke-width="2.4" stroke-linecap="round"/>`;
    if (t === 'o') return `<ellipse cx="0" cy="${y + 2}" rx="3.5" ry="2.6" fill="#7a2a33"/>`;
    const big = t === 'laugh' ? 1.25 : 1;
    const w = 14 * big, d = 14 * big;
    let s = `<path d="M-${w} ${y - 4}Q0 ${y + 1} ${w} ${y - 4}Q${w * 0.7} ${y + d} 0 ${y + d}Q-${w * 0.7} ${y + d}-${w} ${y - 4}Z" fill="#7a2430"/>`;
    s += `<path d="M-${w * 0.55} ${y + d * 0.78}Q0 ${y + d * 0.45} ${w * 0.55} ${y + d * 0.78}Q0 ${y + d * 1.05}-${w * 0.55} ${y + d * 0.78}Z" fill="#e8737e"/>`;
    s += `<path d="M-${w - 2} ${y - 3}Q0 ${y + 2} ${w - 2} ${y - 3}L${w - 3} ${y + 1}Q0 ${y + 6}-${w - 3} ${y + 1}Z" fill="#fff"/>`;
    if (t === 'gap') s += `<rect x="-1.6" y="${y - 2}" width="3.6" height="7" fill="#7a2430"/>`;
    return s;
  };
  const freckles = (c = '#c9734f') => `<g fill="${c}" opacity=".7"><circle cx="-27" cy="17" r="1.3"/><circle cx="-21" cy="20" r="1.2"/><circle cx="-16" cy="16" r="1.1"/><circle cx="-24" cy="23" r="1"/><circle cx="27" cy="17" r="1.3"/><circle cx="21" cy="20" r="1.2"/><circle cx="16" cy="16" r="1.1"/><circle cx="24" cy="23" r="1"/></g>`;
  const at = (x, y, s, body, rot = 0) => `<g transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${rot})` : ''} scale(${s})">${body}</g>`;

  // Ginger hair (Childe/Ajax and siblings). c = [light, base, dark]
  const GINGER = ['#ec8a4f', '#c45a2c', '#8a3519'];
  const GINGER_KID = ['#f59a58', '#d76a30', '#9c4019'];
  const hairDef = (c, id = 'hr') => lg(id, [[0, c[0]], [0.45, c[1]], [1, c[2]]], 0.2, 0, 0.8, 1);
  // a single tapered lock of hair from root (rx,ry) to tip (tx,ty), width w, bend b
  const lock = (rx, ry, tx, ty, w, b = 0) => {
    const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, h = w / 2;
    const mx = rx + dx * 0.5 + nx * b, my = ry + dy * 0.5 + ny * b;
    return `M${R0(rx - nx * h)} ${R0(ry - ny * h)}Q${R0(mx - nx * h * 0.7)} ${R0(my - ny * h * 0.7)} ${R0(tx)} ${R0(ty)}Q${R0(mx + nx * h * 0.7)} ${R0(my + ny * h * 0.7)} ${R0(rx + nx * h)} ${R0(ry + ny * h)}Z`;
  };
  const locks = (arr) => arr.map((a) => lock(...a)).join('');
  // Childe's messy ginger hair, split into back (behind face) and front (over it)
  const CH_FRONT = locks([
    [-36, -38, -50, 18, 22, -5], [-28, -46, -36, 4, 22, 4], [-16, -52, -22, -4, 22, 5], [-4, -54, -4, 2, 20, 5],
    [8, -54, 14, -6, 20, -4], [20, -50, 30, -2, 22, -5], [32, -42, 44, 8, 20, -6], [40, -30, 50, 20, 16, -4],
    [-20, -60, -34, -74, 16, 5], [0, -64, 6, -80, 14, -5], [16, -60, 32, -74, 14, -4], [36, -48, 54, -48, 14, -4], [-36, -46, -54, -40, 14, 4],
  ]);
  const CH_BACK = 'M-48 10C-56-32-34-68 2-68C38-68 56-32 48 10Z' + locks([[-40, -24, -58, 26, 26, -5], [40, -24, 58, 24, 26, 5], [-34, 0, -46, 42, 20, -3], [34, 0, 44, 42, 20, 3]]);
  const CH_CAP = 'M-46 2C-50-36-28-64 2-64C34-64 52-38 46 2Q34-34 2-38Q-30-34-46 2Z';
  const CH_HL = 'M-22-56Q-10-61 2-60M10-58Q20-56 28-50M-34-36Q-32-44-26-50M-10-46Q-14-30-16-18M18-42Q24-30 26-18';
  // clip paths so fringe shadows fall only on the face
  const faceClips = () => `<clipPath id="cfA"><path d="${FA}"/></clipPath><clipPath id="cfK"><path d="${FK}"/></clipPath>`;
  const hair = (front, cap, back, c, k, kid, hl) => [
    `<path d="${back}" fill="${c[2]}"/>`,
    (LITE ? '' : `<path d="${front}" fill="${k[3]}" opacity=".35" transform="translate(2 6)" clip-path="url(#cf${kid ? 'K' : 'A'})"/>`) +
      `<path d="${cap}${front}" fill="url(#hr)"/>` +
      (hl ? `<path d="${hl}" fill="none" stroke="${c[0]}" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>` : ''),
  ];
  // Fatui half-mask pushed up on the side of the head
  const mask = () =>
    `<g transform="translate(40 -50) rotate(58) scale(1.05)"><path d="M-30-2L-22-12Q-10-15 0-8Q10-15 22-12L30-2Q24 10 12 10Q4 10 0 4Q-4 10-12 10Q-24 10-30-2Z" fill="#c8323c"/>` +
    `<path d="M-30-2Q-22 4-12 5Q-3 5 0 1Q3 5 12 5Q22 4 30-2Q24 10 12 10Q4 10 0 4Q-4 10-12 10Q-24 10-30-2Z" fill="#7e1720"/>` +
    `<path d="M-20-3Q-14-8-6-4Q-10 2-20-3ZM20-3Q14-8 6-4Q10 2 20-3Z" fill="#1c0709"/>` +
    `<path d="M-26-6Q-14-14-2-8" fill="none" stroke="#ff8a8f" stroke-width="2" opacity=".75"/></g>`;
  // Childe head (adult). mood: grin | smile | soft
  const childeHead = (o = {}) => {
    const k = o.k || SK.fair;
    const [hb, hf] = hair(CH_FRONT, CH_CAP, CH_BACK, GINGER, k, false, CH_HL);
    return hb + neck(k, 15, 30) + face(k, false, 'sk', 0.28) +
      eyes(o.eyes || 'open', ['#2f63a8', '#13284f'], { dim: true, gx: o.gx || 0 }) +
      brows('#7a2e18', o.brows || 'n') + nose(k) + mouth(o.mouth || 'grin') + hf + (o.mask === false ? '' : mask());
  };

  // Winter beanie with pompom (Teucer)
  const beanie = (c1, c2) =>
    `<path d="M-49-22C-52-64-26-84 2-84C30-84 54-64 49-22Z" fill="${c1}"/>` +
    `<path d="M-30-70Q-34-50-34-30M-12-78Q-14-54-14-34M8-80Q8-56 8-36M28-74Q30-54 30-32" stroke="${c2}" stroke-width="3" opacity=".4" fill="none"/>` +
    `<path d="M-53-31Q0-47 53-31L54-12Q0-28-54-12Z" fill="${c2}"/>` +
    `<path d="M-40-32v15M-26-36v15M-12-38v15M2-39v15M16-38v15M30-36v15M44-32v15" stroke="${c1}" stroke-width="3" opacity=".55"/>` +
    `<path d="M-16-58l6-6 6 6-6 6zM14-58l6-6 6 6-6 6z" fill="#fff" opacity=".85"/>` +
    `<circle cx="4" cy="-88" r="14" fill="#eef1f7"/><circle cx="-1" cy="-92" r="6" fill="#fff"/>`;
  const TE_FRONT = locks([[-36, -22, -46, 10, 16, -3], [-23, -24, -28, -2, 16, 3], [-9, -26, -10, -4, 16, 3], [5, -26, 9, -5, 16, -3], [19, -24, 27, -3, 16, -3], [34, -22, 45, 10, 16, 3]]);
  // Teucer (8): ginger, round face, freckles, gap tooth, beanie
  const teucerHead = (o = {}) => {
    const k = SK.fair;
    return `<path d="M-48-14C-52 8-46 24-40 30H40C46 24 52 8 48-14Z" fill="${GINGER_KID[2]}"/>` + (o.neck === false ? '' : neck(k, 13, 28)) + face(k, true, 'sk', 0.45) + freckles() +
      eyes(o.eyes || 'open', ['#3d8ad8', '#174a85'], { sep: 18, gx: o.gx || 0, gy: o.gy || 0 }) + brows('#b0521f', o.brows || 'up', -14) + nose(k) + mouth(o.mouth || 'gap', 30) +
      `<path d="${TE_FRONT}" fill="url(#hrK)"/>` + beanie(o.hat || '#2f6fb7', o.hat2 || '#21528c');
  };
  // Tonia (15): ginger, side-swept fringe, braid over the shoulder
  const TO_FRONT = locks([[10, -56, -30, -14, 28, 10], [16, -54, -10, -12, 24, 8], [22, -52, 12, -14, 20, 4], [30, -46, 38, -6, 18, -5], [38, -36, 48, 14, 16, -4], [-30, -44, -46, 8, 20, -5]]);
  const TO_CAP = 'M-46 2C-50-36-28-64 2-64C34-64 52-38 46 2Q34-34 2-38Q-30-34-46 2Z';
  const braid = (x0, y0, x1, y1, n, w, c) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t, ww = w * (1 - t * 0.35);
      s += `<ellipse cx="${R0(x)}" cy="${R0(y)}" rx="${R0(ww * 0.62)}" ry="${R0(ww * 0.42)}" transform="rotate(${i % 2 ? 28 : -28} ${R0(x)} ${R0(y)})" fill="${i % 2 ? c[1] : c[0]}" stroke="${c[2]}" stroke-width="2"/>`;
    }
    return s;
  };
  const toniaHead = (o = {}) => {
    const k = SK.fair, c = GINGER, bl = o.blen || 130;
    const [hb, hf] = hair(TO_FRONT, TO_CAP, 'M-48 8C-56-34-32-68 2-68C36-68 56-34 48 8Z', c, k, false, 'M-20-56Q0-62 22-54M-30-40Q-24-50-12-54');
    return hb + (o.braid === false ? '' : braid(-36, 22, -52, bl, o.bn || 7, 24, c) + `<rect x="-60" y="${bl + 6}" width="16" height="8" rx="3" fill="#3aa0e6"/><path d="M-52 ${bl + 14}l-8 16h16z" fill="${c[1]}"/>`) +
      neck(k, 13, 30) + face(k, false, 'sk', 0.35) + freckles('#d08a66') +
      eyes(o.eyes || 'open', ['#3a7fca', '#163e74'], { gx: o.gx || 0 }) + brows('#9a4420', o.brows || 'n') + nose(k) + mouth(o.mouth || 'smile') + hf;
  };
  // Anthon (12): short ginger hair, optional gaming headset
  const AN_FRONT = locks([[-34, -36, -46, 10, 20, -4], [-22, -46, -30, -4, 20, 4], [-8, -50, -12, -6, 20, 4], [6, -50, 8, -8, 20, -3], [20, -46, 28, -4, 20, -4], [34, -36, 46, 10, 18, -4], [0, -60, -12, -76, 14, 4], [14, -58, 26, -72, 12, -3]]);
  const anthonHead = (o = {}) => {
    const k = SK.fair;
    const [hb, hf] = hair(AN_FRONT, 'M-46 2C-50-36-28-64 2-64C34-64 52-38 46 2Q34-34 2-38Q-30-34-46 2Z', 'M-48 6C-56-34-34-68 2-68C38-68 56-34 48 6Z', GINGER_KID, k, true);
    return hb + neck(k, 13, 28) + face(k, true, 'sk', 0.35) + freckles() +
      eyes(o.eyes || 'open', ['#3d8ad8', '#174a85'], { sep: 18, gx: o.gx || 0 }) + brows('#b0521f', o.brows || 'n', -12) + nose(k) + mouth(o.mouth || 'smile', 31) + hf.replace('url(#hr)', 'url(#hrK)') +
      (o.headset ? `<path d="M-50 4C-56-60 56-60 50 4" fill="none" stroke="#24272e" stroke-width="8"/><rect x="-60" y="-8" width="18" height="30" rx="7" fill="#2b2f38"/><rect x="42" y="-8" width="18" height="30" rx="7" fill="#2b2f38"/><circle cx="51" cy="7" r="4" fill="#4de0a0"/>` : '');
  };
  // Mama: kind eyes, ginger-brown hair in a bun, warm headscarf
  const MAMA_HAIR = ['#c97a4c', '#a0562f', '#6e381e'];
  const mamaHead = (o = {}) => {
    const k = SK.fair, c = MAMA_HAIR;
    return `<ellipse cx="0" cy="-58" rx="28" ry="20" fill="${c[2]}"/>` + neck(k, 13, 30) + face(k, false, 'sk', 0.3) +
      `<path d="M-40-4C-42-34-24-44 0-44C24-44 42-34 40-4Q32-30 2-32Q-30-30-40-4Z" fill="url(#hrM)"/><path d="M0-44Q-3-38 0-32" stroke="${c[2]}" stroke-width="2"/>` +
      eyes(o.eyes || 'happy', ['#4a7fb3', '#1f4573'], { y: 9 }) + brows(c[2], 'sad', -12) + nose(k) + mouth(o.mouth || 'smile') +
      `<path d="M-30 30q4 4 8 2M30 30q-4 4-8 2" stroke="${k[3]}" stroke-width="1.6" fill="none" opacity=".7"/>` +
      `<path d="M-54 6C-60-48-30-80 2-80C36-80 62-48 54 6C50-14 46-28 40-36Q20-48 0-48Q-20-48-40-36C-46-28-50-14-54 6Z" fill="url(#scarfM)"/>` +
      `<path d="M-40-36Q-20-48 0-48Q20-48 40-36" fill="none" stroke="#f3c96a" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round"/>` +
      `<g fill="#f3c96a" opacity=".85"><circle cx="-24" cy="-62" r="4"/><circle cx="6" cy="-68" r="4"/><circle cx="32" cy="-58" r="4"/><circle cx="-40" cy="-30" r="3"/><circle cx="44" cy="-24" r="3"/></g>`;
  };
  // Papa: greying ginger beard, fisherman's cap, weathered
  const papaHead = (o = {}) => {
    const k = SK.tan;
    return `<path d="M-46-20C-50 0-46 14-42 22H42C46 14 50 0 46-20Z" fill="#9c6a4c"/>` + neck(k, 15, 28) + face(k, false, o.sk || 'sk', 0.18) +
      eyes(o.eyes || 'happy', ['#4a74a0', '#1f3f63'], { y: 6 }) + brows('#c9b6a4', o.brows || 'up', -12) +
      `<path d="M-30 4l-6-3M-30 9l-6 1M30 4l6-3M30 9l6 1M-14-24q14-4 28 0M-10-30q10-3 20 0" stroke="${k[3]}" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>` +
      `<path d="M2 12Q-3 20 3 24" fill="none" stroke="${k[3]}" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M-41-2C-42 30-26 62 0 64C26 62 42 30 41-2C36 14 30 24 20 26Q8 22 0 24Q-8 22-20 26C-30 24-36 14-41-2Z" fill="url(#brd)"/>` +
      `<path d="M-26 34q2 12 6 20M-6 44q0 10 2 16M14 40q0 12-2 18M28 32q0 10-4 18" stroke="#e8e1d8" stroke-width="2" fill="none" opacity=".55"/>` +
      mouth(o.mouth || 'grin', 34) +
      `<path d="M-20 28Q-10 20 0 25Q10 20 20 28Q10 32 0 29Q-10 32-20 28Z" fill="#a8704a"/>` +
      `<path d="M-50-26C-52-60-26-74 2-74C32-74 56-60 50-26Z" fill="#2c3550"/><path d="M-30-66Q-4-76 26-68" stroke="#4a5677" stroke-width="3" fill="none"/>` +
      `<path d="M-52-30Q0-42 52-30L52-20Q0-32-52-20Z" fill="#1d2335"/>` +
      `<path d="M-46-22Q0-34 46-22Q30-8-4-10Q-34-10-46-22Z" fill="#111521"/><path d="M-36-18Q0-28 34-18" stroke="#5a6684" stroke-width="2" fill="none" opacity=".7"/>`;
  };
  // Xiangling: navy hair with ring-braided buns, amber eyes
  const XL = ['#4a5f9e', '#283766', '#151d3d'];
  const XL_FRONT = locks([[-30, -44, -42, 6, 22, -4], [-16, -52, -22, -8, 20, 4], [-2, -54, -4, -10, 18, 3], [12, -54, 16, -8, 18, -3], [26, -48, 36, -4, 20, -4], [38, -36, 46, 14, 16, -3]]);
  const xianglingHead = (o = {}) => {
    const k = SK.fair, c = XL;
    const bun = (x) => `<ellipse cx="${x * 1.2}" cy="-30" rx="10" ry="22" fill="none" stroke="${c[0]}" stroke-width="6" stroke-dasharray="5 2"/><circle cx="${x}" cy="-62" r="15" fill="${c[1]}"/><path d="M${x - 10} -70q10-8 20 0" fill="none" stroke="#7d8fd0" stroke-width="2.5" opacity=".8"/>`;
    return `<path d="M-48 8C-56-34-34-66 2-66C38-66 56-34 48 8L46 30H-46Z" fill="${c[2]}"/>` + bun(-34) + bun(34) + neck(k, 13, 28) + face(k, false, 'sk', 0.4) +
      eyes(o.eyes || 'open', ['#eaa53c', '#9a5a14'], { gx: o.gx || 0 }) + brows(c[2], 'up') + nose(k) + mouth(o.mouth || 'grin') +
      `<path d="M-46 2C-50-36-28-62 2-62C34-62 52-38 46 2Q34-34 2-38Q-30-34-46 2Z${XL_FRONT}" fill="url(#hrX)"/>` +
      `<path d="M-20-54Q0-60 20-54" fill="none" stroke="#7d8fd0" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`;
  };
  const peopleDefs = () => hairDef(GINGER) + hairDef(GINGER_KID, 'hrK') + hairDef(MAMA_HAIR, 'hrM') + hairDef(XL, 'hrX') + faceClips() +
    lg('scarfM', [[0, '#d2603a'], [1, '#9c2f22']], 0, 0, 1, 1) + lg('brd', [[0, '#c98a5c'], [0.6, '#a87250'], [1, '#8c8178']]);

  // scalloped blob (fur, snow mounds, steam, clouds)
  const fluffP = (cx, cy, rx, ry, n, amp, seed) => {
    const R = rng(seed);
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * Math.PI * 2, x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry;
      if (!i) { d = `M${R0(x)} ${R0(y)}`; continue; }
      const tm = ((i - 0.5) / n) * Math.PI * 2, k = 1 + (amp * (0.6 + R() * 0.8)) / ((rx + ry) / 2);
      d += `Q${R0(cx + Math.cos(tm) * rx * k)} ${R0(cy + Math.sin(tm) * ry * k)} ${R0(x)} ${R0(y)}`;
    }
    return d + 'Z';
  };
  // Snezhnayan wooden house (izba): x,y = front bottom-left
  const izba = (x, y, w, h, wall, o = {}) => {
    const rh = h * 0.62, sd = o.sd == null ? w * 0.42 : o.sd, sk = sd * 0.32, cx = x + w / 2;
    let s = '';
    s += `<path d="M${x + w} ${y}l${R0(sd)} ${-R0(sk)}v${-h}l${-R0(sd)} ${R0(sk)}Z" fill="${wall}"/><path d="M${x + w} ${y}l${R0(sd)} ${-R0(sk)}v${-h}l${-R0(sd)} ${R0(sk)}Z" fill="#0b1030" opacity=".45"/>`;
    s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${wall}"/>`;
    s += `<path d="M${x} ${y - h * 0.66}h${w}M${x} ${y - h * 0.33}h${w}" stroke="#000" stroke-width="2" opacity=".18"/>`;
    s += `<path d="M${cx} ${y - h - rh}l${R0(sd)} ${-R0(sk)}l${R0(w / 2 + 12)} ${R0(rh + 10)}l${-R0(sd)} ${R0(sk)}Z" fill="#e9eef8"/>`;
    s += `<path d="M${cx} ${y - h - rh}l${R0(sd)} ${-R0(sk)}l${R0(w / 2 + 12)} ${R0(rh + 10)}l${-R0(sd)} ${R0(sk)}Z" fill="#9aa7d0" opacity=".35" transform="translate(0 6)"/>`;
    s += `<path d="M${x - 12} ${y - h + 10}L${cx} ${y - h - rh}L${x + w + 12} ${y - h + 10}Z" fill="${wall}"/><path d="M${x - 12} ${y - h + 10}L${cx} ${y - h - rh}L${x + w + 12} ${y - h + 10}" fill="none" stroke="#f4f7ff" stroke-width="7" stroke-linejoin="round"/>`;
    s += `<path d="M${x - 12} ${y - h + 10}L${cx} ${y - h - rh}L${x + w + 12} ${y - h + 10}Z" fill="#000" opacity=".12"/>`;
    // windows with carved trims
    const wins = o.wins || [[cx - 10, y - h * 0.62]];
    for (const [wx, wy] of wins) {
      const ww = Math.max(14, w * 0.17), wh = ww * 1.3;
      s += `<circle cx="${R0(wx + ww / 2)}" cy="${R0(wy + wh / 2)}" r="${R0(ww * 2.4)}" fill="url(#wg)"/>`;
      s += `<path d="M${R0(wx - 5)} ${R0(wy - 4)}l${R0(ww / 2 + 5)} -9l${R0(ww / 2 + 5)} 9z" fill="#eef2fb"/>`;
      s += `<rect x="${R0(wx - 4)}" y="${R0(wy - 3)}" width="${R0(ww + 8)}" height="${R0(wh + 6)}" fill="#eef2fb"/><rect x="${R0(wx)}" y="${R0(wy)}" width="${R0(ww)}" height="${R0(wh)}" fill="url(#win)"/>`;
      s += `<path d="M${R0(wx + ww / 2)} ${R0(wy)}v${R0(wh)}M${R0(wx)} ${R0(wy + wh * 0.42)}h${R0(ww)}" stroke="#7a4a2a" stroke-width="2"/>`;
    }
    if (o.door) s += `<rect x="${R0(x + w * 0.66)}" y="${R0(y - h * 0.56)}" width="${R0(w * 0.18)}" height="${R0(h * 0.56)}" fill="#3a2418"/>`;
    s += `<path d="M${x - 4} ${y + 2}Q${cx} ${y - 12} ${x + w + sd} ${y - sk}V${y + 10}H${x - 4}Z" fill="#e6ecf8"/>`;
    if (o.chim) s += `<rect x="${R0(cx + sd * 0.55)}" y="${R0(y - h - rh * 0.7 - sk)}" width="14" height="${R0(rh * 0.5)}" fill="#5a3a34"/><rect x="${R0(cx + sd * 0.55 - 2)}" y="${R0(y - h - rh * 0.7 - sk - 4)}" width="18" height="6" rx="3" fill="#f2f5ff"/>` +
      `<path d="M${R0(cx + sd * 0.55 + 7)} ${R0(y - h - rh * 0.7 - sk - 8)}q-14-24 4-44t-6-50" fill="none" stroke="#cfd3e6" stroke-width="10" stroke-linecap="round" opacity=".35"/>`;
    return s;
  };

  /* =====================================================================================
     FISHING
     ===================================================================================== */

  // ---- Childe and the bluefin "Scaramouche" ----
  def('p_bluefin', {
    title: 'Scaramouche the bluefin',
    w: 1200, h: 900, tags: ['fishing', 'childe', 'clue_bluefin', 'sea', 'day'],
    svg: (w, h) => {
      const R = rng(31);
      let sparkle = '';
      for (let i = 0; i < 46; i++) {
        const x = 700 + (R() - 0.3) * 640, y = 440 + Math.pow(R(), 1.6) * 300;
        sparkle += `<path d="M${R0(x - 10 - R() * 14)} ${R0(y)}h${R0(20 + R() * 28)}" stroke="#fff" stroke-width="${f1(1.5 + R() * 2.5)}" opacity="${f1(0.35 + R() * 0.6)}" stroke-linecap="round"/>`;
      }
      let finlets = '';
      for (let i = 0; i < 7; i++) {
        const x = 840 + i * 21, t = 470 + i * 8.4, b = 612 - i * 9;
        finlets += `M${x} ${t + 4}l9-14l6 ${14 + i * 0.6}ZM${x} ${b - 4}l9 14l6-${14 + i * 0.6}Z`;
      }
      const tw = textW('SCARAMOUCHE', 34) + 64 + textW('3 Jan', 34);
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.38) + skinDef(SK.fair) + hairDef(GINGER) + faceClips() +
        lg('sky', [[0, '#2f96df'], [0.55, '#7cc4f0'], [1, '#c9ebfb']]) +
        lg('sea', [[0, '#3c9fd4'], [0.25, '#1f78b5'], [1, '#0f4a80']]) +
        glow('sun', '#fffbe6', 1) + rg('warm', [[0, '#ffd27a', 0.45], [0.5, '#ffb35c', 0.08], [1, '#ffb35c', 0]], 0.9, 0.05, 0.9) +
        lg('isl', [[0, '#8fb9c9'], [1, '#a9cfda']]) +
        lg('jk', [[0, '#7b828f'], [0.6, '#5b6270'], [1, '#434955']], 0, 0, 1, 1) +
        lg('scf', [[0, '#e04650'], [1, '#a81f2b']], 0, 0, 1, 1) +
        lg('tuna', [[0, '#101d3d'], [0.3, '#1b3b78'], [0.42, '#4f7fb8'], [0.52, '#a9bfd6'], [0.66, '#e9eef4'], [0.9, '#f4f7fa'], [1, '#c3ccd7']], 0, 425, 0, 655, US) +
        lg('tail', [[0, '#13254a'], [1, '#22457f']], 0, 0, 1, 0) +
        lg('rail', [[0, '#ffffff'], [0.5, '#c9d3dc'], [1, '#7f8b97']]) +
        lg('stk', [[0, '#ffffff'], [1, '#f1ece3']]),
        // sky, sun, clouds
        `<rect width="1200" height="450" fill="url(#sky)"/>` +
        `<circle cx="1060" cy="70" r="300" fill="url(#sun)"/>` +
        `<g fill="#fff" opacity=".85"><ellipse cx="260" cy="250" rx="120" ry="26"/><ellipse cx="330" cy="236" rx="70" ry="30"/><ellipse cx="190" cy="258" rx="60" ry="18"/>` +
        `<ellipse cx="880" cy="300" rx="140" ry="20" opacity=".7"/><ellipse cx="940" cy="288" rx="60" ry="22" opacity=".7"/></g>` +
        // far Liyue karst islands
        `<path d="M0 452V408Q20 380 38 404Q52 346 74 398Q92 372 110 410Q140 394 170 452ZM890 452Q910 420 930 432Q948 396 968 430Q990 410 1010 452Z" fill="url(#isl)"/>` +
        // sea
        `<rect y="448" width="1200" height="452" fill="url(#sea)"/>` +
        `<path d="M0 448H1200" stroke="#e8f6fd" stroke-width="2" opacity=".7"/>` + sparkle +
        // boat gunwale + rail behind him
        `<path d="M0 700L1200 676V900H0Z" fill="#eef3f5"/><path d="M0 700L1200 676V690L0 714Z" fill="#2a8bb0"/>` +
        `<path d="M0 640L1200 616" stroke="url(#rail)" stroke-width="10" stroke-linecap="round"/><path d="M120 638V704M1080 619V682" stroke="#a7b3bd" stroke-width="9"/>` +
        // rod in holder (right)
        `<path d="M1150 700L1010 150" stroke="#1d2530" stroke-width="7" stroke-linecap="round"/><path d="M1010 150Q900 330 760 450" stroke="#fff" stroke-width="1.4" opacity=".7" fill="none"/><circle cx="1120" cy="585" r="16" fill="#c8323c"/><circle cx="1120" cy="585" r="6" fill="#ddd"/>` +
        // ---- Childe ----
        at(566, 232, 2.65, childeHead({ mouth: 'grin', brows: 'up' })) +
        // jacket: shoulders, collar, scarf
        `<path d="M486 396C420 404 360 420 334 452C306 486 300 540 298 600L292 900H842L836 600C834 540 828 486 800 452C774 420 714 404 646 396Z" fill="url(#jk)"/>` +
        `<path d="M334 452C350 500 352 560 346 640M800 452C786 500 784 560 790 640" fill="none" stroke="#3b404a" stroke-width="4" opacity=".5"/>` +
        `<path d="M486 396L520 470L566 430L612 470L646 396L626 388Q566 410 506 388Z" fill="#3a3e48"/>` +
        `<path d="M520 470L566 430L612 470L566 560Z" fill="#23262d"/>` +
        `<path d="M506 356Q566 386 626 356L652 410Q566 466 480 410Z" fill="url(#scf)"/>` +
        `<path d="M484 386Q566 432 648 386M480 410Q566 466 652 410" fill="none" stroke="#8e1a24" stroke-width="4"/>` +
        `<path d="M500 420Q470 470 486 560L540 552Q520 480 540 436Z" fill="#b8242f"/><path d="M506 444Q494 500 506 552" stroke="#e45a62" stroke-width="3" fill="none" opacity=".7"/>` +
        `<path d="M552 436l14-18 14 18-14 20Z" fill="#3aa0e6" stroke="#d9f0ff" stroke-width="2.5"/><path d="M558 434l8-8 4 6Z" fill="#fff" opacity=".7"/>` +
        // arm reaching for the tail
        `<path d="M760 434C836 460 884 504 912 546L880 604C842 566 790 546 736 530Z" fill="url(#jk)"/><path d="M786 452C840 476 874 506 898 544" fill="none" stroke="#9aa1ad" stroke-width="4" opacity=".6"/>` +
        `<path d="M420 800Q566 826 712 800L720 900H412Z" fill="#2a2e38"/><path d="M566 560V820" stroke="#2a2e38" stroke-width="4"/>` +
        `<path d="M298 770Q566 806 836 770V812Q566 848 298 812Z" fill="#a8212c"/><path d="M298 782Q566 818 836 782" stroke="#d8434d" stroke-width="3" fill="none" opacity=".7"/><rect x="544" y="788" width="44" height="34" rx="6" fill="#c9a24a" stroke="#7d6122" stroke-width="3"/>` +
        `<g transform="translate(0 50)">` +
        // ---- the bluefin ----
        `<path d="M300 600Q560 700 836 600V700Q560 760 300 700Z" fill="#1d2230" opacity=".35"/>` +
        `<path d="M990 528C1030 500 1070 446 1112 404C1094 466 1084 508 1062 541C1084 574 1094 616 1112 678C1070 636 1030 582 990 554Z" fill="url(#tail)"/>` +
        `<path d="M470 432L516 374L566 428ZM738 450L786 392L812 456ZM738 636L786 694L810 628Z" fill="#203a68"/>` +
        `<path d="${finlets}" fill="#e7c13a"/>` +
        `<path d="M138 548C196 462 330 425 520 425C720 425 880 470 990 527V555C880 612 720 655 520 655C330 655 196 622 138 548Z" fill="url(#tuna)"/>` +
        `<path d="M330 470C520 452 760 470 960 532" fill="none" stroke="#7fa6d6" stroke-width="5" opacity=".5"/>` +
        `<path d="M320 508C540 500 760 512 980 541" fill="none" stroke="#fff" stroke-width="2" opacity=".4"/>` +
        `<path d="M300 455C338 500 340 600 296 642" fill="none" stroke="#8796ab" stroke-width="4" opacity=".75"/>` +
        `<path d="M330 548C380 556 430 572 480 600C430 592 376 584 332 568Z" fill="#283f6b"/>` +
        `<circle cx="226" cy="518" r="17" fill="#b9c3cf" stroke="#44536a" stroke-width="3"/><circle cx="228" cy="519" r="11" fill="#0b0f1a"/><circle cx="232" cy="514" r="3.2" fill="#fff"/>` +
        `<path d="M140 548Q170 560 204 558" stroke="#4a5568" stroke-width="3" fill="none"/>` +
        `<path d="M300 446C420 432 560 432 700 446" fill="none" stroke="#fff" stroke-width="6" opacity=".18" stroke-linecap="round"/>` +
        // hands
        `<path d="M884 498C904 486 930 488 940 504C946 518 940 540 926 548C922 530 910 520 892 524Z" fill="#f2c5a6"/><path d="M902 494Q914 506 914 524M918 492Q930 504 930 520" stroke="#cc8a6b" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
        `<path d="M280 668C276 644 296 630 326 636C348 640 360 652 356 668Z" fill="#f2c5a6"/><path d="M296 640Q298 652 292 664M314 638Q316 652 312 666M332 640Q336 654 332 666" stroke="#cc8a6b" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
        `<path d="M276 668Q300 690 356 672L380 712Q330 730 292 712Z" fill="#4a505c"/>` + `</g>` +
        // sticker
        `<g transform="translate(40 776) rotate(-4)"><rect x="6" y="8" width="${R0(tw + 56)}" height="84" rx="20" fill="#000" opacity=".22"/>` +
        `<rect width="${R0(tw + 56)}" height="84" rx="20" fill="url(#stk)"/>` +
        scribe('SCARAMOUCHE', 28, 25, { sz: 34, col: '#4a2a70', w: 5.5, seed: 9, jit: 4, wob: 2 }) +
        `<g transform="translate(${R0(28 + textW('SCARAMOUCHE', 34) + 6)} 42)"><path d="M0 0Q14-14 34-6L46-14L44 0L46 14L34 6Q14 14 0 0Z" fill="#3aa0e6"/><circle cx="9" cy="-2" r="2.6" fill="#0d2a44"/></g>` +
        scribe('3 Jan', R0(28 + textW('SCARAMOUCHE', 34) + 64), 25, { sz: 34, col: '#4a2a70', w: 5.5, seed: 4, jit: 4, wob: 2 }) + `</g>` +
        `<rect width="1200" height="900" fill="url(#warm)" style="mix-blend-mode:screen"/>` +
        vig(w, h) + grain(w, h, 0.16)
      );
    },
  });
  /* =====================================================================================
     FAMILY
     ===================================================================================== */

  // ---- Morepesok at dusk ----
  def('p_morepesok', {
    title: 'Morepesok',
    w: 1200, h: 900, tags: ['family', 'morepesok', 'snow', 'dusk', 'village'],
    svg: (w, h) => {
      const R = rng(5);
      let tr = '', tt = '';
      for (let i = 0; i < 34; i++) {
        const x = 470 + i * 22 + R() * 14, base = 470 - (x - 470) * 0.09 + R() * 8, th = 34 + R() * 34;
        tr += `M${R0(x)} ${R0(base - th)}l${R0(th * 0.32)} ${R0(th)}h${-R0(th * 0.64)}z`;
        tt += `M${R0(x)} ${R0(base - th)}l${R0(th * 0.14)} ${R0(th * 0.4)}h${-R0(th * 0.28)}z`;
      }
      const trees = `<path d="${tr}" fill="#232a4d"/><path d="${tt}" fill="#dfe6f6" opacity=".8"/>`;
      let cracks = '';
      for (let i = 0; i < 9; i++) {
        const x = R() * 700, y = 470 + R() * 400;
        cracks += `M${R0(x)} ${R0(y)}l${R0(40 + R() * 80)} ${R0((R() - 0.5) * 30)}l${R0(20 + R() * 60)} ${R0((R() - 0.3) * 40)}`;
      }
      const boat = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
        `<path d="M-70-6Q-60 22-20 26H50Q76 18 84-12Z" fill="#3b2a2a"/><path d="M-70-6H84" stroke="#8a4f2e" stroke-width="5"/>` +
        `<path d="M-60-8Q0-22 80-14L84-12H-70Z" fill="#eef3fc"/>` +
        `<rect x="6" y="-44" width="40" height="34" fill="#4a5d7c"/><rect x="12" y="-38" width="12" height="10" fill="#ffd27a"/><path d="M0-46h52" stroke="#eef3fc" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-30-8V-80" stroke="#2a1f22" stroke-width="4"/><path d="M-30-80L30-12" stroke="#2a1f22" stroke-width="1.5"/>` +
        `<path d="M-80 22Q0 34 96 16Q100 28 60 36H-60Q-90 32-80 22Z" fill="#e3e9f7"/></g>`;
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.55, '#0a0820') +
        lg('sky', [[0, '#151a40'], [0.38, '#3d3a6e'], [0.66, '#9a6a8e'], [0.86, '#e8a080'], [1, '#f7c890']], 0, 0, 0, 430, US) +
        lg('mtn', [[0, '#5a5c8a'], [1, '#7b7aa2']]) +
        lg('ice', [[0, '#e3b9a8'], [0.12, '#b9b6d6'], [0.5, '#8e98c4'], [1, '#5f6c9e']], 0, 430, 0, 900, US) +
        lg('snw', [[0, '#e8ecf8'], [1, '#aab5da']]) +
        lg('win', [[0, '#fff1b8'], [1, '#ffb347']]) + glow('wg', '#ffc766', 0.55) + glow('lmp', '#ffd98a', 0.8) + glow('moon', '#fff6dc', 0.5),
        `<rect width="1200" height="440" fill="url(#sky)"/>` +
        dots(3, 40, 0, 0, 1200, 220, 0.6, 1.8, '#fff', 0.3, 0.9) +
        `<circle cx="300" cy="110" r="90" fill="url(#moon)"/><path d="M300 78a32 32 0 1 0 24 56a26 26 0 1 1-24-56z" fill="#fff4d6"/>` +
        `<path d="M0 440L60 404L120 418L210 370L300 410L380 388L470 430L560 396L660 426L760 380L860 412L960 372L1060 404L1200 384V470H0Z" fill="url(#mtn)" opacity=".85"/>` +
        `<path d="M210 370l-24 18 16-2 10 8 12-10 16 4ZM760 380l-26 20 14-2 12 8 10-12 18 6ZM960 372l-22 18 14-2 10 6 10-8 14 4Z" fill="#eef0fb" opacity=".8"/>` +
        // frozen sea
        `<rect y="436" width="1200" height="464" fill="url(#ice)"/>` +
        `<path d="M0 436H1200" stroke="#ffd9b0" stroke-width="2" opacity=".6"/>` +
        `<path d="${cracks}" fill="none" stroke="#4a5384" stroke-width="2" opacity=".55"/>` +
        `<path d="M0 560L60 548L90 556L160 540L220 556L280 546L330 560Q160 580 0 580ZM0 720L80 700L130 712L210 694L300 716Q150 740 0 742Z" fill="#dfe5f6" opacity=".75"/>` +
        `<ellipse cx="300" cy="600" rx="260" ry="26" fill="#fff" opacity=".12"/>` +
        // shore + trees
        trees +
        `<path d="M440 486Q700 450 1200 440V900H700Q600 700 440 486Z" fill="url(#snw)"/>` +
        // houses (back to front)
        izba(560, 500, 70, 46, '#7a3a34', { sd: 24 }) + izba(660, 492, 80, 52, '#3f5a7d', { sd: 26, chim: 1 }) +
        izba(790, 484, 74, 50, '#9a6a33', { sd: 24 }) + izba(900, 478, 96, 58, '#6a3d3b', { sd: 30, chim: 1, wins: [[920, 444], [956, 444]] }) +
        izba(1050, 470, 90, 56, '#3d5f55', { sd: 28 }) +
        izba(640, 600, 120, 74, '#86372e', { chim: 1, door: 1, wins: [[662, 548]] }) +
        izba(840, 630, 150, 92, '#355276', { wins: [[862, 566], [906, 566]], door: 1 }) +
        izba(1040, 676, 140, 100, '#9b6430', { chim: 1, wins: [[1060, 604], [1102, 604]] }) +
        // pier into the ice
        `<path d="M600 620L140 840L196 860L640 634Z" fill="#5a3d33"/><path d="M600 616L136 836L150 842L610 622Z" fill="#eef2fb"/>` +
        `<path d="M520 664v26M420 712v30M320 760v34M220 808v38" stroke="#3a2620" stroke-width="8"/>` +
        // lamps
        `<circle cx="560" cy="560" r="60" fill="url(#lmp)"/><path d="M560 566v60" stroke="#2a2232" stroke-width="4"/><circle cx="560" cy="562" r="6" fill="#fff3c4"/>` +
        `<circle cx="790" cy="600" r="70" fill="url(#lmp)"/><path d="M790 606v70" stroke="#2a2232" stroke-width="4"/><circle cx="790" cy="602" r="7" fill="#fff3c4"/>` +
        // warm reflections on the ice
        `<ellipse cx="520" cy="640" rx="90" ry="10" fill="#ffc766" opacity=".18"/><ellipse cx="420" cy="700" rx="60" ry="7" fill="#ffc766" opacity=".14"/>` +
        // boats frozen in
        boat(250, 560, 0.9, -4) + boat(470, 520, 0.6, 3) + boat(150, 690, 1.25, 6) +
        // foreground snowbank + footprints
        `<path d="M760 900Q900 800 1200 780V900Z" fill="#eef2fb"/><path d="M820 900Q960 820 1200 806" fill="none" stroke="#b9c3e3" stroke-width="3"/>` +
        `<g fill="#aeb8dc" opacity=".8"><ellipse cx="960" cy="860" rx="10" ry="5"/><ellipse cx="990" cy="846" rx="9" ry="4.5"/><ellipse cx="1016" cy="834" rx="8" ry="4"/><ellipse cx="1046" cy="822" rx="8" ry="4"/></g>` +
        dots(11, 90, 0, 0, 1200, 900, 1, 3.4, '#fff', 0.45, 0.95) +
        vig(w, h) + grain(w, h, 0.2)
      );
    },
  });

  // ---- An old photo: four ginger kids in the snow (2019) ----
  def('p_siblings_snow', {
    title: 'Four of us in the snow (2019)',
    w: 1200, h: 900, tags: ['family', 'old', 'snow', 'teucer', 'tonia', 'anthon', 'childe'],
    svg: (w, h) => {
      const R = rng(19);
      let birch = '', bm = '';
      for (let i = 0; i < 9; i++) {
        const x = 40 + i * 140 + R() * 60, wd = 10 + R() * 12;
        birch += `<rect x="${R0(x)}" y="0" width="${R0(wd)}" height="${R0(520 + R() * 60)}" fill="#eceae2" opacity="${f1(0.55 + R() * 0.35)}"/>`;
        for (let j = 0; j < 6; j++) bm += `M${R0(x)} ${R0(40 + R() * 460)}h${R0(wd * (0.4 + R() * 0.6))}`;
      }
      birch += `<path d="${bm}" stroke="#4a4440" stroke-width="3" opacity=".6"/>`;
      let pines = '';
      for (let i = 0; i < 14; i++) {
        const x = i * 92 + R() * 40, th = 160 + R() * 140, b = 540;
        pines += `<path d="M${R0(x)} ${R0(b - th)}l${R0(th * 0.28)} ${R0(th)}h${-R0(th * 0.56)}z" fill="#5d6f6a" opacity=".55"/>`;
      }
      const coat = (c1, c2, wide = 1) => `<path d="M-22 56C-70 58-${R0(96 * wide)} 86-${R0(102 * wide)} 140L-${R0(110 * wide)} 300H${R0(110 * wide)}L${R0(102 * wide)} 140C${R0(96 * wide)} 86 70 58 22 56Z" fill="${c1}"/>` +
        `<path d="M-${R0(98 * wide)} 120Q0 140 ${R0(98 * wide)} 120M-${R0(104 * wide)} 190Q0 212 ${R0(104 * wide)} 190" stroke="${c2}" stroke-width="5" fill="none" opacity=".6"/><path d="M0 70V300" stroke="${c2}" stroke-width="4"/>`;
      return wrap(w, h,
        grainDef(1.1) + vigDef(0.5, '#3a2a1a', 0.45) + skinDef(SK.fair) + peopleDefs() +
        lg('sky', [[0, '#cfd6d8'], [1, '#eef0ea']]) + lg('snow', [[0, '#f4f4ef'], [1, '#d6dbe0']]) +
        lg('fade', [[0, '#ffe2b0'], [1, '#c8e0e8']], 0, 0, 1, 1),
        `<rect width="1200" height="900" fill="url(#sky)"/>` + pines + birch +
        `<path d="M0 520Q300 480 600 510T1200 500V900H0Z" fill="url(#snow)"/>` +
        `<path d="${fluffP(140, 640, 160, 60, 14, 14, 3)}" fill="#f7f7f2"/><path d="${fluffP(1080, 660, 180, 70, 14, 16, 4)}" fill="#f2f3ee"/>` +
        `<g transform="translate(-40 40) scale(1.1)">` +
        // Tonia (8)
        at(300, 420, 1.35, coat('#d9667a', '#a8455a', 0.9) + `<path d="M-40 52Q0 80 40 52L44 76Q0 104-44 76Z" fill="#f2c94c"/><path d="M28 70l10 70h20l-6-74Z" fill="#e6b53c"/>` +
          `<path d="M-80 120Q-130 60-118 10L-96 6Q-100 50-60 100Z" fill="#d9667a"/><circle cx="-110" cy="4" r="14" fill="#f5c0a6"/>` + toniaHead({ eyes: 'happy', mouth: 'laugh', blen: 110, bn: 6 })) +
        // Ajax (teen) holding Teucer
        at(660, 330, 1.6, coat('#3b4a63', '#26324a', 1.1) + `<path d="M-44 50Q0 82 44 50L48 76Q0 108-48 76Z" fill="#c8323c"/>` + childeHead({ eyes: 'happy', mouth: 'laugh', mask: false })) +
        // toddler Teucer on his arm
        at(840, 470, 1.0, `<path d="${fluffP(0, 120, 74, 90, 12, 8, 8)}" fill="#e2463c"/><path d="M-60 130Q0 150 60 130" stroke="#b02e2a" stroke-width="5" fill="none"/>` +
          `<path d="M-30 40Q0 54 30 40" stroke="#fff" stroke-width="10" fill="none"/>` + teucerHead({ eyes: 'happy', mouth: 'laugh', hat: '#e2463c', hat2: '#b02e2a', neck: false })) +
        `<path d="M700 640Q760 600 820 640L830 690Q760 700 700 680Z" fill="#3b4a63"/><ellipse cx="830" cy="650" rx="22" ry="16" fill="#f2c5a6"/>` +
        // Anthon (5), waist deep, throwing snow
        at(470, 556, 1.15, coat('#4f8a5a', '#356842', 0.85) + anthonHead({ eyes: 'happy', mouth: 'laugh' }) + beanie('#3f7d4c', '#2c5e38')) +
        `<path d="M-100 690Q300 650 600 696T1300 676V900H-100Z" fill="#f4f4ef"/><path d="${fluffP(470, 700, 190, 40, 16, 10, 6)}" fill="#f7f7f3"/><path d="M80 740Q300 712 520 750" stroke="#dfe3e4" stroke-width="4" fill="none"/>` +
        dots(23, 50, 330, 470, 620, 640, 3, 10, '#fff', 0.7, 1) + `<circle cx="560" cy="480" r="18" fill="#fff"/><circle cx="555" cy="476" r="18" fill="#e6ebef" opacity=".5"/></g>` +
        dots(29, 50, 0, 0, 1200, 900, 1.5, 4, '#fff', 0.5, 0.9) +
        // faded film look
        `<rect width="1200" height="900" fill="url(#fade)" opacity=".3" style="mix-blend-mode:multiply"/>` +
        `<rect width="1200" height="900" fill="#fff" opacity=".1"/>` +
        `<rect x="-40" y="-40" width="300" height="980" fill="#ff9a50" opacity=".1" transform="rotate(8)"/>` +
        `<text x="1150" y="860" text-anchor="end" font-family="${FONT}" font-size="34" font-weight="700" fill="#ff8a2a" opacity=".85" letter-spacing="3">12 01 '19</text>` +
        vig(w, h) + grain(w, h, 0.32)
      );
    },
  });

  // ---- Teucer's window-seat selfie on LA 711 ----
  def('p_teucer_plane', {
    title: 'Window seat selfie',
    w: 900, h: 1200, tags: ['family', 'teucer', 'tonia', 'plane', 'night', 'selfie'],
    svg: (w, h) => wrap(w, h,
      grainDef(1) + vigDef(0.7, '#02040c', 0.4) + skinDef(SK.fair) + peopleDefs() +
      lg('cab', [[0, '#1d2433'], [1, '#0d111b']]) +
      lg('nite', [[0, '#05070f'], [0.7, '#0e1a33'], [1, '#2a3550']]) +
      lg('seat', [[0, '#3a4e6e'], [1, '#26354f']], 0, 0, 1, 1) +
      lg('hood', [[0, '#f0874a'], [1, '#c4562a']], 0, 0, 1, 1) +
      glow('red', '#ff3b3b', 1) + glow('lamp', '#ffd59a', 0.6) + glow('scr', '#9ec8ff', 0.5),
      `<rect width="900" height="1200" fill="url(#cab)"/>` +
      // cabin wall + window
      `<path d="M0 0H360Q300 300 330 1200H0Z" fill="#cfd3dc" opacity=".14"/>` +
      `<rect x="40" y="170" width="260" height="360" rx="120" fill="#c9ccd4" opacity=".55"/><rect x="62" y="194" width="216" height="312" rx="104" fill="url(#nite)"/>` +
      dots(41, 26, 80, 210, 260, 330, 0.6, 1.6, '#fff', 0.3, 0.9) +
      `<path d="M62 420L278 360V430L62 470Z" fill="#3c4456"/><path d="M62 420L278 360" stroke="#7e889c" stroke-width="3"/>` +
      `<circle cx="256" cy="368" r="40" fill="url(#red)"/><circle cx="256" cy="368" r="5" fill="#ffd0d0"/>` +
      dots(43, 30, 70, 440, 270, 500, 0.8, 2, '#ffb44d', 0.4, 1) +
      `<path d="M70 196H270" stroke="#fff" stroke-width="10" opacity=".07"/>` +
      // overhead reading light
      `<circle cx="760" cy="40" r="300" fill="url(#lamp)"/>` +
      // Tonia's seat + Tonia asleep
      `<path d="M560 330Q720 290 880 330L900 1200H560Z" fill="url(#seat)"/><path d="M590 340Q720 312 860 344V420Q720 392 590 420Z" fill="#e8ecf3" opacity=".85"/>` +
      `<text x="725" y="392" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="#b8323a" letter-spacing="2">LIYUE AIR</text>` +
      at(720, 600, 2.1, `<path d="M-90 80Q0 50 90 80L110 300H-110Z" fill="#6a7b97"/><path d="M-46 50Q0 76 46 50L52 82Q0 116-52 82Z" fill="#e7d3a8"/><path d="M-40 60l84 4M-44 72l90 4" stroke="#b9a072" stroke-width="3"/>` +
        toniaHead({ eyes: 'shut', mouth: 'soft', blen: 110, bn: 6 }), 14) +
      `<path d="M540 840Q720 780 900 820V1200H540Z" fill="#8a5a8c"/><path d="M560 880Q720 830 900 860" stroke="#a97aab" stroke-width="6" fill="none"/>` +
      // Teucer's seat back
      `<path d="M170 420Q380 360 600 420L640 1200H140Z" fill="url(#seat)"/>` +
      // Teucer: hoodie + selfie arm
      at(420, 630, 3.6,
        `<path d="M-30 52C-80 56-118 84-128 140L-140 260H140L128 140C118 84 80 56 30 52Z" fill="url(#hood)"/><path d="M-40 52Q0 90 40 52" stroke="#9b3f1c" stroke-width="5" fill="none"/>` +
        `<path d="M-10 70v40M10 70v40" stroke="#fff" stroke-width="3"/>` +
        teucerHead({ mouth: 'gap', eyes: 'open', brows: 'up', gx: 1 }), -8) +
      `<path d="M0 860Q160 840 262 940Q300 1060 236 1200H0Z" fill="#c9622a"/><path d="M0 860Q160 840 262 940Q300 1060 236 1200" stroke="#8e3a16" stroke-width="5" fill="none"/><path d="M20 890Q150 880 230 960Q262 1040 230 1120" stroke="#f0a070" stroke-width="10" fill="none" opacity=".5" stroke-linecap="round"/>` +
      `<path d="M40 1000Q120 990 170 1060M20 1080Q90 1080 130 1150" stroke="#8e3a16" stroke-width="4" fill="none" opacity=".6"/>` +
      // phone-screen glow on his face
      `<circle cx="380" cy="760" r="300" fill="url(#scr)" style="mix-blend-mode:screen"/>` +
      vig(w, h) + grain(w, h, 0.3)
    ),
  });
  // ---- Sir Fang on Teucer's bed ----
  def('p_teucer_sirfang', {
    title: 'Sir Fang',
    w: 1200, h: 900, tags: ['family', 'teucer', 'sirfang', 'toy', 'bed'],
    svg: (w, h) => {
      const fur = (cx, cy, rx, ry, n, amp, sd, fill = 'url(#fur)') => `<path d="${fluffP(cx, cy, rx, ry, n, amp, sd)}" fill="${fill}"/>`;
      const paw = (x, y) => fur(x, y, 52, 40, 10, 7, x) + `<ellipse cx="${x}" cy="${y + 8}" rx="22" ry="16" fill="#9cc3ea"/>` +
        `<circle cx="${x - 26}" cy="${y - 14}" r="8" fill="#9cc3ea"/><circle cx="${x}" cy="${y - 22}" r="8" fill="#9cc3ea"/><circle cx="${x + 26}" cy="${y - 14}" r="8" fill="#9cc3ea"/>`;
      let fish = '';
      const R = rng(12);
      for (let i = 0; i < 9; i++) {
        const x = 60 + (i % 5) * 250 + R() * 60, y = 700 + Math.floor(i / 5) * 120 + R() * 40;
        fish += `M${R0(x)} ${R0(y)}q20-16 44-4l12-9v18l-12-9q-24 12-44-4z`;
      }
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.55, '#140a04') +
        `<pattern id="wp" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#a9c2dc"/><path d="M18 14l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#d7e5f3"/><circle cx="52" cy="50" r="3" fill="#d7e5f3"/></pattern>` +
        lg('fur', [[0, '#ffffff'], [0.55, '#e3eef9'], [1, '#a6c3e3']], 0.2, 0, 0.8, 1) +
        lg('quilt', [[0, '#3f77bd'], [1, '#2a5490']]) + lg('wood', [[0, '#d7a86c'], [1, '#a8743e']]) +
        lg('scf', [[0, '#e0434d'], [1, '#a91f2a']], 0, 0, 1, 1) + lg('night', [[0, '#1b2b52'], [1, '#3b5384']]) +
        glow('lamp', '#ffcf7a', 0.75) + rg('eye', [[0, '#7cc4ff'], [0.55, '#1f5fa8'], [1, '#0b2246']], 0.4, 0.35, 0.65),
        `<rect width="1200" height="900" fill="url(#wp)"/>` +
        // window with snowy night
        `<rect x="40" y="40" width="250" height="280" fill="#f2ead8"/><rect x="58" y="58" width="214" height="244" fill="url(#night)"/>` +
        dots(5, 30, 60, 60, 270, 300, 1.5, 4, '#fff', 0.5, 0.9) + `<path d="M165 58v244M58 180h214" stroke="#f2ead8" stroke-width="10"/>` +
        `<path d="M58 302q30-24 60-10t60-8 94 10v8H58z" fill="#e8eef8"/>` +
        // Glacier Guardians poster
        `<g transform="rotate(3 1000 160)"><rect x="880" y="10" width="250" height="290" fill="#123a6b"/><path d="M1005 40l44 56-44 104-44-104z" fill="#7fd0ff"/><path d="M1005 40l16 56-16 104-16-104z" fill="#fff" opacity=".6"/>` +
        `<text x="1005" y="236" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="800" fill="#fff" letter-spacing="1">GLACIER</text><text x="1005" y="264" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="700" fill="#7fd0ff" letter-spacing="3">GUARDIANS</text></g>` +
        `<circle cx="1120" cy="420" r="380" fill="url(#lamp)"/>` +
        // headboard + pillow
        `<path d="M120 470V330Q600 250 1080 330V470Z" fill="url(#wood)"/><path d="M150 340Q600 268 1050 340" stroke="#f0c992" stroke-width="5" fill="none" opacity=".7"/>` +
        `<path d="M360 470Q600 380 900 440L930 540Q600 520 330 560Z" fill="#f4f1ea"/><path d="M380 480Q620 420 880 456M372 510Q620 456 900 488" stroke="#9cc3ea" stroke-width="8" fill="none" opacity=".7"/>` +
        // quilt
        `<path d="M0 560Q600 470 1200 560V900H0Z" fill="url(#quilt)"/>` +
        `<path d="M0 680Q600 600 1200 680M0 800Q600 730 1200 800M300 540V900M600 520V900M900 540V900" stroke="#1f437a" stroke-width="4" stroke-dasharray="10 8" fill="none" opacity=".6"/>` +
        `<path d="${fish}" fill="#f29a4a" opacity=".85"/>` +
        // Sir Fang: tail, body, legs, head
        `<ellipse cx="600" cy="790" rx="250" ry="40" fill="#0d1d3a" opacity=".35"/><ellipse cx="640" cy="440" rx="220" ry="170" fill="#2a1a10" opacity=".12"/>` +
        `<path d="M720 740Q880 760 900 640Q910 580 860 560Q870 640 800 680Q760 700 700 690Z" fill="url(#fur)"/><path d="M880 590Q890 620 870 650" stroke="#6fa3d8" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        fur(600, 620, 160, 150, 18, 14, 3) + fur(600, 600, 80, 100, 12, 10, 4, '#ffffff') +
        paw(470, 750) + paw(730, 750) +
        `<path d="M548 600Q540 690 552 760M652 600Q660 690 648 760" stroke="#c5d8ee" stroke-width="5" fill="none"/>` +
        fur(552, 770, 46, 30, 9, 6, 8) + fur(648, 770, 46, 30, 9, 6, 9) +
        // ears
        `<path d="M480 330L462 170Q520 200 560 290Z" fill="url(#fur)"/><path d="M490 312L478 202Q516 228 540 290Z" fill="#9cc3ea"/><path d="M462 170L470 220L490 200Z" fill="#4f8fd6"/>` +
        `<path d="M720 330L738 170Q680 200 640 290Z" fill="url(#fur)"/><path d="M710 312L722 202Q684 228 660 290Z" fill="#9cc3ea"/><path d="M738 170L730 220L710 200Z" fill="#4f8fd6"/>` +
        `<g transform="rotate(-14 740 250)"><rect x="736" y="236" width="90" height="40" rx="6" fill="#fff" stroke="#c7d3e0" stroke-width="2"/><circle cx="748" cy="256" r="5" fill="#c7d3e0"/><text x="790" y="262" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="800" fill="#c8323c">SIR FANG</text></g>` +
        fur(600, 390, 150, 130, 20, 13, 6) +
        `<path d="M600 290l14 26-14 26-14-26z" fill="#4f8fd6"/><path d="M600 300l6 16-6 16-6-16z" fill="#bfe2ff"/>` +
        `<path d="M478 400l28 6M484 424l26 0M722 400l-28 6M716 424l-26 0" stroke="#6fa3d8" stroke-width="7" stroke-linecap="round"/>` +
        `<ellipse cx="600" cy="452" rx="70" ry="50" fill="#fff"/><path d="M600 462v18M600 480q-14 12-28 2M600 480q14 12 28 2" stroke="#1d2b4a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M576 430Q600 418 624 430Q620 452 600 456Q580 452 576 430Z" fill="#1d2b4a"/><ellipse cx="592" cy="432" rx="7" ry="4" fill="#fff" opacity=".6"/>` +
        `<path d="M590 494q10 14 20 0z" fill="#e8737e"/>` +
        `<circle cx="540" cy="384" r="26" fill="url(#eye)"/><circle cx="660" cy="384" r="26" fill="url(#eye)"/><circle cx="532" cy="374" r="9" fill="#fff"/><circle cx="652" cy="374" r="9" fill="#fff"/><circle cx="548" cy="394" r="4" fill="#fff" opacity=".7"/><circle cx="668" cy="394" r="4" fill="#fff" opacity=".7"/>` +
        `<path d="M512 352q26-16 50-4M688 352q-26-16-50-4" stroke="#6fa3d8" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<path d="M600 280V300M600 342V420" stroke="#c5d8ee" stroke-width="3" stroke-dasharray="6 6"/>` +
        // red scarf
        `<path d="M470 500Q600 560 730 500L740 548Q600 610 460 548Z" fill="url(#scf)"/><path d="M480 520Q600 574 724 520" stroke="#ff7a80" stroke-width="3" fill="none" stroke-dasharray="14 10" opacity=".7"/>` +
        `<path d="M672 548Q700 600 690 680L736 672Q742 600 708 540Z" fill="#c22a35"/><path d="M690 680l6 16M702 678l6 16M716 676l6 16M728 674l6 16" stroke="#c22a35" stroke-width="4"/>` +
        `<ellipse cx="690" cy="548" rx="26" ry="20" fill="#d7323d"/>` +
        vig(w, h) + grain(w, h, 0.22)
      );
    },
  });

  // ---- The Northland letter on the kitchen table (Tonia) ----
  def('p_tonia_letter', {
    title: 'The letter',
    w: 1200, h: 900, tags: ['family', 'tonia', 'letter', 'northland', 'clue'],
    svg: (w, h) => {
      let planks = '', grainL = '';
      const R = rng(8);
      for (let i = 0; i < 6; i++) planks += `<rect y="${i * 160}" width="1200" height="156" fill="${['#b98552', '#c99360', '#b07a48'][i % 3]}"/>`;
      for (let i = 0; i < 30; i++) { const y = R() * 900; grainL += `M0 ${R0(y)}Q${R0(300 + R() * 300)} ${R0(y + (R() - 0.5) * 30)} 1200 ${R0(y + (R() - 0.5) * 20)}`; }
      const bars = (x, y, ws) => ws.map((ww, i) => `<rect x="${x}" y="${y + i * 26}" width="${ww}" height="9" rx="4" fill="#8a909c" opacity=".55"/>`).join('');
      const logo = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1f2d4f"/><path d="M${x} ${y - r * 0.7}V${y + r * 0.7}M${x - r * 0.6} ${y - r * 0.35}L${x + r * 0.6} ${y + r * 0.35}M${x - r * 0.6} ${y + r * 0.35}L${x + r * 0.6} ${y - r * 0.35}" stroke="#cfe4ff" stroke-width="${f1(r * 0.16)}" stroke-linecap="round"/>`;
      return wrap(w, h,
        grainDef(0.8) + vigDef(0.5, '#1a0d04') + lg('sun', [[0, '#fff6dc', 0.5], [1, '#fff6dc', 0]], 0, 0, 1, 1) +
        rg('tea', [[0, '#e8a050'], [0.7, '#b0581c'], [1, '#7a3410']]) + lg('slv', [[0, '#5aa0b8'], [1, '#2f6f88']], 0, 0, 1, 1) +
        lg('skn', [[0, '#fbdcc6'], [1, '#e8b495']], 0, 0, 1, 1),
        planks + `<path d="${grainL}" stroke="#7a4e2a" stroke-width="2" fill="none" opacity=".35"/>` +
        `<path d="M0 0H700L300 900H0Z" fill="url(#sun)"/>` +
        // tea: glass in a metal holder, saucer, lemon, spoon
        `<ellipse cx="200" cy="190" rx="132" ry="128" fill="#000" opacity=".2" transform="translate(16 18)"/><circle cx="200" cy="190" r="130" fill="#f4f1ea"/><circle cx="200" cy="190" r="100" fill="none" stroke="#3a6aa8" stroke-width="5" opacity=".6"/>` +
        `<circle cx="200" cy="190" r="78" fill="#b9b1a0"/><circle cx="200" cy="190" r="70" fill="url(#tea)"/><ellipse cx="176" cy="166" rx="30" ry="14" fill="#fff" opacity=".35" transform="rotate(-30 176 166)"/>` +
        `<circle cx="226" cy="214" r="24" fill="#f6e27a"/><circle cx="226" cy="214" r="18" fill="#f9ec9f"/><path d="M226 196v36M208 214h36M213 201l26 26M213 227l26-26" stroke="#f6e27a" stroke-width="2"/>` +
        `<path d="M270 130L392 40" stroke="#c9ccd3" stroke-width="10" stroke-linecap="round"/><path d="M200 70q-30-40 6-70M240 80q-20-40 10-80" stroke="#fff" stroke-width="12" fill="none" opacity=".2" stroke-linecap="round"/>` +
        // envelope
        `<g transform="translate(860 250) rotate(9)"><rect x="-236" y="-140" width="480" height="290" fill="#000" opacity=".18" transform="translate(10 14)"/>` +
        `<path d="M-236-140H244V150H-236Z" fill="#f3efe6"/><path d="M-236-140L-200-128L-170-138L-130-126L-90-139L-40-127L0-138L50-128L100-139L150-127L200-137L244-128V-140Z" fill="#d9d2c2"/>` +
        logo(-196, -88, 18) + `<text x="-170" y="-82" font-family="${FONT}" font-size="15" font-weight="800" fill="#1f2d4f" letter-spacing="2">NORTHLAND BANK GROUP</text>` +
        `<rect x="150" y="-112" width="66" height="80" fill="#c8323c"/><rect x="156" y="-106" width="54" height="68" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/><path d="M183-92l14 22h-28z" fill="#fff"/>` +
        `<circle cx="140" cy="-40" r="40" fill="none" stroke="#3b3b55" stroke-width="3" opacity=".5"/><path d="M80-50q30-10 60 0t60 0M80-36q30-10 60 0t60 0" stroke="#3b3b55" stroke-width="3" fill="none" opacity=".5"/>` +
        `<text x="-100" y="30" font-family="${FONT}" font-size="24" font-weight="600" fill="#1d2233">Harbinger Tartaglia (Ajax)</text>` +
        `<text x="-100" y="62" font-family="${FONT}" font-size="20" fill="#3a3f52">4 Pristan Lane</text><text x="-100" y="91" font-family="${FONT}" font-size="20" fill="#3a3f52">Morepesok, Snezhnaya</text>` +
        `<text x="-210" y="128" font-family="${FONT}" font-size="13" font-weight="700" fill="#c8323c" letter-spacing="2">PERSONAL · BY HAND OF THE PALACE</text></g>` +
        // letter
        `<g transform="translate(470 560) rotate(-7)"><rect x="-290" y="-380" width="560" height="760" fill="#000" opacity=".2" transform="translate(12 16)"/>` +
        `<rect x="-290" y="-380" width="560" height="760" fill="#fbfaf6"/><path d="M-290-20H270" stroke="#d8d4ca" stroke-width="3"/><rect x="-290" y="-20" width="560" height="400" fill="#000" opacity=".03"/>` +
        logo(-238, -320, 28) + `<text x="-196" y="-322" font-family="${FONT}" font-size="25" font-weight="800" fill="#1f2d4f" letter-spacing="3">NORTHLAND BANK GROUP</text>` +
        `<text x="-196" y="-298" font-family="${FONT}" font-size="14" fill="#5a6074" letter-spacing="1">Zapolyarny Palace · Office of the Harbingers</text>` +
        `<path d="M-250-270H230" stroke="#c8323c" stroke-width="2"/>` +
        `<text x="-250" y="-232" font-family="${FONT}" font-size="17" fill="#3a3f52">To: Harbinger Tartaglia, Liyue Branch</text>` +
        `<text x="-250" y="-204" font-family="${FONT}" font-size="17" fill="#3a3f52">Re: Special Collections — Q3 review</text>` +
        `<text x="-250" y="-160" font-family="${FONT}" font-size="18" font-weight="600" fill="#1d2233">Dear Harbinger,</text>` +
        bars(-250, -136, [460, 420, 470, 300]) + `<text x="-250" y="-14" font-family="${FONT}" font-size="17" fill="#3a3f52" opacity=".8">your status as the Eleventh …</text>` +
        bars(-250, 10, [440, 470, 380, 450, 240]) + bars(-250, 170, [400, 460, 200]) +
        `<path d="M40 300q20-30 40-6t40-10 30 10" stroke="#1f2d4f" stroke-width="3" fill="none"/></g>` +
        // girl's hand holding the corner (knit sleeve)
        `<path d="M0 730Q80 690 150 700L210 830L110 900H0Z" fill="url(#slv)"/><path d="M30 726l40 130M70 712l40 130M110 702l40 130" stroke="#244f62" stroke-width="5" opacity=".45"/><path d="M150 700L210 830" stroke="#244f62" stroke-width="14" opacity=".5"/>` +
        `<g stroke="url(#skn)" stroke-linecap="round" fill="none"><path d="M236 734L312 706" stroke-width="30"/><path d="M240 760L330 744" stroke-width="30"/><path d="M236 786L318 784" stroke-width="28"/><path d="M226 808L292 818" stroke-width="24"/><path d="M196 728L238 690" stroke-width="30"/></g>` +
        `<path d="M160 712Q220 700 250 724Q262 770 240 810Q200 836 168 808Z" fill="#f5c9ae"/>` +
        `<g fill="#fde9dc"><ellipse cx="318" cy="704" rx="8" ry="6"/><ellipse cx="336" cy="743" rx="8" ry="6"/><ellipse cx="324" cy="784" rx="7" ry="6"/><ellipse cx="298" cy="819" rx="6" ry="5"/><ellipse cx="240" cy="688" rx="7" ry="6"/></g>` +
        `<path d="M276 726q8-4 10 2M286 754q8-2 10 4M276 782q8 0 8 6" stroke="#cf9476" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
        // braid tip at the edge
        `<g transform="translate(1236 470) rotate(38)">` + braid(0, 0, 10, 250, 7, 50, GINGER) + `<rect x="-6" y="262" width="34" height="16" rx="5" fill="#3aa0e6"/><path d="M10 276l-18 40h40z" fill="#c45a2c"/></g>` +
        vig(w, h) + grain(w, h, 0.2)
      );
    },
  });

  // ---- Mama's pelmeni ----
  def('p_mama_pelmeni', {
    title: "Mama's pelmeni",
    w: 1200, h: 900, tags: ['family', 'mama', 'food', 'pelmeni', 'kitchen'],
    svg: (w, h) => {
      const R = rng(21);
      const dump = (x, y, s, r) => `<use href="#pm" transform="translate(${R0(x)} ${R0(y)}) rotate(${R0(r)}) scale(${f1(s)})"/>`;
      let bowl = '';
      const pts = [];
      for (let i = 0; i < 44; i++) {
        const a = R() * Math.PI * 2, rr = Math.sqrt(R());
        pts.push([620 + Math.cos(a) * rr * 215, 546 + Math.sin(a) * rr * 50 - (1 - rr) * 26]);
      }
      pts.sort((p, q) => p[1] - q[1]);
      for (const [x, y] of pts) bowl += dump(x, y, 1.15 + R() * 0.3, (R() - 0.5) * 70);
      let raw = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) raw += dump(150 + c * 58 + r * 24, 720 + r * 42, 0.95, -10);
      let dill = '';
      for (let i = 0; i < 60; i++) { const x = 470 + R() * 300, y = 500 + R() * 70; dill += `M${R0(x)} ${R0(y)}l${R0((R() - 0.5) * 14)} ${R0((R() - 0.5) * 8)}`; }
      const gz = (x, y) => `<path d="M${x} ${y}q-12-14 0-26q12 12 0 26zM${x} ${y}q-18-2-22 12q16 4 22-12zM${x} ${y}q18-2 22 12q-16 4-22-12z" fill="#2c5ea8"/>`;
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.55, '#1a0c04') +
        lg('wall', [[0, '#3b2f2a'], [1, '#6b4f3c']]) + lg('cloth', [[0, '#f3ece0'], [1, '#e2d6c2']]) +
        lg('dgh', [[0, '#fffaf0'], [1, '#e9d8b4']]) + lg('bwl', [[0, '#ffffff'], [1, '#d7dce6']]) + lg('brd', [[0, '#d8a865'], [1, '#b07a3e']]) +
        `<g id="pm"><path d="M-26 4Q-28-18 0-20Q28-18 26 4Q14 16 0 14Q-14 16-26 4Z" fill="url(#dgh)" stroke="#d6c08f" stroke-width="1.5"/><path d="M-20 0Q0 8 20 0" stroke="#d9c39a" stroke-width="2.5" fill="none"/><ellipse cx="-6" cy="-10" rx="10" ry="4" fill="#fff" opacity=".6"/></g>` +
        glow('lamp', '#ffd590', 0.8) + lg('win', [[0, '#26345e'], [1, '#6a7fae']]),
        `<rect width="1200" height="420" fill="url(#wall)"/>` +
        `<rect x="60" y="40" width="300" height="300" fill="#e9dcc4" opacity=".8"/><rect x="78" y="58" width="264" height="264" fill="url(#win)"/><path d="M210 58v264M78 190h264" stroke="#e9dcc4" stroke-width="10"/>` +
        `<path d="M78 58h70q-50 20-70 70zM342 58h-60q40 16 60 60z" fill="#fff" opacity=".55"/>` + dots(2, 18, 80, 60, 340, 320, 1.5, 3.5, '#fff', 0.5, 0.9) +
        `<path d="M500 0v80" stroke="#2a1d16" stroke-width="3"/><path d="M440 120Q500 60 560 120Z" fill="#c8323c"/><circle cx="500" cy="150" r="300" fill="url(#lamp)"/><ellipse cx="500" cy="122" rx="22" ry="8" fill="#fff4cc"/>` +
        `<rect x="820" y="80" width="320" height="16" fill="#4a3426"/><rect x="840" y="30" width="44" height="50" rx="6" fill="#c97a3c" opacity=".8"/><rect x="900" y="40" width="40" height="40" rx="6" fill="#7aa36a" opacity=".8"/><rect x="960" y="24" width="50" height="56" rx="8" fill="#e8d7b0" opacity=".8"/><circle cx="1080" cy="56" r="26" fill="#3a6aa8" opacity=".8"/>` +
        `<path d="M900 300q0-60 60-60h40q60 0 60 60v40H900z" fill="#8c9aa8" opacity=".7"/><rect x="964" y="226" width="32" height="14" rx="6" fill="#2a2a30" opacity=".7"/><path d="M900 290l-40-26v14l34 30z" fill="#8c9aa8" opacity=".7"/><path d="M0 330h1200M0 370h1200M100 330v80M260 330v80M420 330v80M580 330v80M740 330v80M900 330v80M1060 330v80" stroke="#7d6450" stroke-width="2" opacity=".35"/><path d="M1060 270q40 0 40 30" stroke="#8c9aa8" stroke-width="10" fill="none" opacity=".7"/>` +
        // table + tablecloth
        `<path d="M0 410H1200V900H0Z" fill="url(#cloth)"/><path d="M0 860H1200" stroke="#c8323c" stroke-width="16"/><path d="M0 836H1200" stroke="#c8323c" stroke-width="5" stroke-dasharray="14 10"/>` +
        `<path d="M0 820l20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14 20-14 20 14" stroke="#c8323c" stroke-width="3" fill="none"/>` +
        // board with flour, raw pelmeni, rolling pin
        `<path d="M70 640L560 620L600 880L20 900Z" fill="url(#brd)"/><path d="M60 896L600 878" stroke="#8a5a2a" stroke-width="6"/>` +
        `<path d="${fluffP(330, 760, 220, 90, 18, 12, 4)}" fill="#fff" opacity=".45"/>` + dots(9, 40, 80, 650, 560, 880, 1, 3, '#fff', 0.5, 0.8) + raw +
        `<path d="M110 650L560 600" stroke="#c9945a" stroke-width="30" stroke-linecap="round"/><path d="M110 650L560 600" stroke="#e8b878" stroke-width="10" stroke-linecap="round" opacity=".7"/><path d="M60 656L110 650M560 600L610 594" stroke="#a46d36" stroke-width="18" stroke-linecap="round"/>` +
        `<ellipse cx="500" cy="800" rx="44" ry="20" fill="#d8eef4" opacity=".7" stroke="#fff" stroke-width="3"/>` +
        // big bowl
        `<ellipse cx="620" cy="722" rx="240" ry="30" fill="#3a2a1a" opacity=".22"/>` +
        `<path d="M350 540Q360 700 520 728H720Q880 700 890 540Z" fill="url(#bwl)"/>` +
        gz(470, 640) + gz(560, 670) + gz(680, 670) + gz(770, 640) + `<path d="M380 600Q620 660 860 600" stroke="#2c5ea8" stroke-width="5" fill="none"/>` +
        `<ellipse cx="620" cy="540" rx="270" ry="72" fill="#f3f4f8"/><ellipse cx="620" cy="546" rx="244" ry="58" fill="#efe2c2"/>` + bowl +
        `<path d="${fluffP(624, 520, 64, 30, 12, 6, 7)}" fill="#fffef8"/><ellipse cx="610" cy="510" rx="30" ry="10" fill="#fff"/>` +
        `<path d="${dill}" stroke="#3f8a3a" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M560 460q-30-50 10-90t0-80M640 450q-20-40 14-80t-4-90M720 470q-30-40 6-80" stroke="#fff" stroke-width="16" fill="none" opacity=".18" stroke-linecap="round"/>` +
        // sour cream pot, spoon, dill bunch, bread
        `<path d="M940 640Q944 720 1010 724Q1076 720 1080 640Z" fill="#c95f3a"/><ellipse cx="1010" cy="640" rx="70" ry="20" fill="#fffdf6"/><path d="M1040 630L1130 560" stroke="#c9ccd3" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M880 820l140-40M900 830l130-60M890 816l150-10" stroke="#4a9a3a" stroke-width="5" stroke-linecap="round"/><path d="M1020 780q20-10 30 4M1030 770q24-4 26 14M1040 806q20 0 22 14" stroke="#5aaa48" stroke-width="4" fill="none"/>` +
        `<path d="M1060 790q10-50 60-50t60 50l-6 70h-108z" fill="#3a2216"/><path d="M1072 792q8-38 48-38t48 38l-5 60h-86z" fill="#6b4630"/>` + dots(17, 14, 1080, 770, 1160, 850, 1, 2.2, '#3a2216', 0.6, 0.8) +
        vig(w, h) + grain(w, h, 0.22)
      );
    },
  });

  // ---- Papa on the boat with a cod ----
  def('p_papa_boat', {
    title: 'Papa and the cod',
    w: 1200, h: 900, tags: ['family', 'papa', 'fishing', 'sea', 'boat'],
    svg: (w, h) => {
      const R = rng(4);
      let waves = '';
      for (let i = 0; i < 40; i++) { const x = R() * 1200, y = 380 + Math.pow(R(), 1.3) * 520, l = 20 + (y - 360) * 0.18; waves += `M${R0(x)} ${R0(y)}q${R0(l / 2)}-${R0(l / 6)} ${R0(l)} 0`; }
      return wrap(w, h,
        grainDef(1) + vigDef(0.5, '#0a1014') + skinDef(SK.tan) + peopleDefs() +
        lg('sky', [[0, '#7f8c98'], [1, '#c9d0d3']]) + lg('sea', [[0, '#6f8189'], [0.4, '#4a5d66'], [1, '#2a3a42']]) +
        lg('oil', [[0, '#f0c24a'], [1, '#c48f1e']], 0, 0, 1, 1) + lg('cod', [[0, '#6b6a3e'], [0.5, '#a39a62'], [1, '#efe9d6']], 0, 0, 1, 0) +
        lg('hull', [[0, '#8c5c3a'], [1, '#5e3a22']]),
        `<rect width="1200" height="380" fill="url(#sky)"/>` +
        `<path d="${fluffP(300, 120, 260, 50, 12, 20, 2)}" fill="#e6e9eb" opacity=".35"/><path d="${fluffP(950, 180, 300, 40, 12, 18, 3)}" fill="#dfe3e6" opacity=".3"/>` +
        `<path d="M0 372Q120 320 260 350T520 340Q640 316 760 346T1040 330Q1120 320 1200 340V384H0Z" fill="#8e9aa2"/><path d="M0 372Q120 330 260 356L300 368Q160 362 0 380ZM700 344Q800 330 900 350L760 360Z" fill="#f2f4f5"/>` +
        `<rect y="380" width="1200" height="520" fill="url(#sea)"/><path d="${waves}" stroke="#dfe6ea" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>` +
        `<path d="M840 140q14-12 26 0q12-12 26 0M920 100q10-9 20 0q10-9 20 0M760 190q8-7 16 0q8-7 16 0" stroke="#2f3a42" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        // boat interior seen from the stern
        `<path d="M-60 900L560 470H660L1260 900Z" fill="url(#hull)"/>` +
        `<path d="M60 900L590 500M1140 900L630 500M330 900L600 520M870 900L620 520" stroke="#4a2c18" stroke-width="3" opacity=".5"/>` +
        `<path d="M-60 900L560 470H660L1260 900" fill="none" stroke="#2e6b9a" stroke-width="22"/><path d="M-60 886L560 462H660L1260 886" fill="none" stroke="#e8eef2" stroke-width="6"/>` +
        // Papa
        at(600, 330, 2.2, `<path d="M-30 52C-90 58-128 90-140 150L-150 300H150L140 150C128 90 90 58 30 52Z" fill="url(#oil)"/>` +
          `<path d="M0 60V300M-90 120Q-60 160-70 260M90 120Q60 160 70 260" stroke="#a87414" stroke-width="4" fill="none" opacity=".6"/>` +
          `<path d="M-30 50Q0 70 30 50L36 70Q0 90-36 70Z" fill="#3c4a5c"/>` +
          `<path d="M110 120Q150 170 146 260L112 266Q116 190 90 150Z" fill="url(#oil)"/>` +
          papaHead({ mouth: 'grin', eyes: 'happy' })) +
        `<path d="M176 796H1024L1200 900H0Z" fill="#4e3020"/><path d="M300 900L420 796M600 900V796M900 900L780 796" stroke="#3a2214" stroke-width="3"/><path d="M176 796H1024L1060 830H140Z" fill="#000" opacity=".3"/>` +
        `<path d="M196 748H1004L1024 772H176Z" fill="#a8774c"/><path d="M176 772H1024V796H176Z" fill="#5e3a22"/>` +
        // raised arm + cod
        `<path d="M410 560Q350 480 360 330L420 320Q420 450 470 520Z" fill="url(#oil)"/>` +
        `<g transform="translate(372 296) rotate(-8)"><path d="M-62 150L-104 220L-60 250ZM62 130L104 196L62 230ZM60 270L94 330L52 340Z" fill="#8a8350"/><path d="M0 0Q-66 30-64 170Q-60 320 0 440Q60 320 64 170Q66 30 0 0Z" fill="url(#cod)"/>` +
        `<path d="M0 436L-56 510Q0 494 56 510Z" fill="#7a7448"/><path d="M-30 30Q-40 60-36 90" stroke="#5a5630" stroke-width="3" fill="none" opacity=".6"/>` +
        `<path d="M-2 40Q-10 200 0 400" stroke="#f4f0e2" stroke-width="3" fill="none" opacity=".8"/>` + dots(14, 40, -44, 70, 44, 400, 2, 4.5, '#4a4626', 0.5, 0.7) +
        `<circle cx="-24" cy="46" r="11" fill="#e9e2c4"/><circle cx="-24" cy="46" r="6" fill="#111"/><path d="M-12 0Q0 22 12 0" stroke="#3a3820" stroke-width="3" fill="none"/><path d="M2 16q-2 14-10 22" stroke="#3a3820" stroke-width="3" fill="none"/></g>` +
        `<ellipse cx="380" cy="320" rx="30" ry="24" fill="#e0aa84"/><path d="M360 306q10 14 6 30M376 302q10 14 6 30M392 304q8 12 4 26" stroke="#a66b4c" stroke-width="2.5" fill="none"/>` +
        // gear in the boat
        `<circle cx="1000" cy="800" r="44" fill="#e2542f"/><path d="M970 790q30-20 60 0" stroke="#fff" stroke-width="6" fill="none"/>` +
        `<ellipse cx="200" cy="830" rx="90" ry="34" fill="none" stroke="#c9b48a" stroke-width="10"/><ellipse cx="200" cy="826" rx="60" ry="22" fill="none" stroke="#b39b6a" stroke-width="8"/>` +
        dots(31, 40, 0, 380, 1200, 600, 1, 2.5, '#fff', 0.3, 0.6) +
        vig(w, h) + grain(w, h, 0.25)
      );
    },
  });
  // ---- Teucer's crayon drawing ----
  const cray = (d, col, w, op = 0.88) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f1(w * 0.4)}" stroke-linecap="round" opacity=".45" transform="translate(2.5 2)"/>`;
  const hatchE = (cx, cy, rx, ry, n, seed) => {
    const R = rng(seed);
    let d = '';
    for (let i = 0; i <= n; i++) {
      const y = -ry + (2 * ry * i) / n, hw = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)) * 0.92;
      d += (i ? 'L' : 'M') + R0(cx + (i % 2 ? hw : -hw) + (R() - 0.5) * 6) + ' ' + R0(cy + y + (R() - 0.5) * 4);
    }
    return d;
  };
  const star5 = (x, y, r) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + R0(x + Math.cos(a) * rr) + ' ' + R0(y + Math.sin(a) * rr); }
    return d + 'Z';
  };
  const kidFish = (x, y, s, col, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">` + cray('M-40 0Q-10-30 26-6L48-24V24L26 6Q-10 30-40 0Z', col, 6) + cray(hatchE(-6, 0, 26, 12, 7, x), col, 5, 0.5) + `<circle cx="-24" cy="-4" r="4" fill="#222"/></g>`;
  def('p_teucer_drawing', {
    title: '"My brother sells toys"',
    w: 900, h: 1200, tags: ['family', 'teucer', 'drawing', 'crayon'],
    svg: (w, h) => {
      const t1 = 'MY BROTHER', t2 = 'SELLS TOYS', sz = 62;
      return wrap(w, h,
        grainDef(0.75) + vigDef(0.45, '#2a1405') + lg('tbl', [[0, '#a8743f'], [1, '#7d5129']]) + lg('ppr', [[0, '#fffdf6'], [1, '#efe8d8']], 0, 0, 1, 1) +
        lg('lt', [[0, '#fff', 0.25], [1, '#fff', 0]], 0, 0, 1, 1),
        `<rect width="900" height="1200" fill="url(#tbl)"/><path d="M0 300H900M0 640H900M0 980H900" stroke="#5e3a1c" stroke-width="3" opacity=".5"/>` +
        `<g transform="rotate(-2 450 600)"><rect x="56" y="72" width="800" height="1080" fill="#000" opacity=".25" transform="translate(10 14)"/><rect x="56" y="72" width="800" height="1080" fill="url(#ppr)"/>` +
        `<rect x="56" y="72" width="800" height="1080" filter="url(#gr)" opacity=".18" style="mix-blend-mode:multiply"/>` +
        // title
        scribe(t1, R0(456 - textW(t1, sz) / 2), 110, { sz, col: '#d8332f', w: 8, seed: 3, jit: 9, wob: 7, crayon: 1, op: 0.9 }) +
        scribe(t2, R0(456 - textW(t2, sz) / 2), 200, { sz, col: '#2a6fd0', w: 8, seed: 5, jit: 9, wob: 7, crayon: 1, op: 0.9 }) +
        // sun, stars, heart
        cray('M780 330m-34 0a34 34 0 1 0 68 0a34 34 0 1 0-68 0', '#f2b81f', 7) + cray(hatchE(780, 330, 30, 30, 8, 2), '#f6c836', 6, 0.6) +
        cray('M780 280v-20M780 380v20M730 330h-20M830 330h20M745 295l-14-14M815 365l14 14M815 295l14-14M745 365l-14 14', '#f2b81f', 6) +
        cray(star5(130, 330, 28), '#f2b81f', 6) + cray(star5(640, 300, 22), '#f2b81f', 6) + cray(star5(120, 820, 24), '#f2b81f', 6) + cray(star5(800, 800, 26), '#f2b81f', 6) + cray(star5(300, 1080, 20), '#f2b81f', 6) +
        cray('M636 470q-26-30-46-8q-18 24 46 64q64-40 46-64q-20-22-46 8z', '#e2352f', 7) + cray(hatchE(636, 490, 30, 22, 8, 9), '#e2352f', 6, 0.6) +
        // big brother
        cray('M420 640L330 900H560L480 640Z', '#6a6f78', 7) + cray('M352 860L400 700L420 880L440 690L470 880L500 700L540 870', '#6a6f78', 9, 0.55) +
        cray('M400 900L390 1010M520 900L530 1010', '#3a3a44', 9) + cray('M366 1012h40M514 1012h40', '#3a3a44', 11) +
        cray('M370 690L230 740M530 690L668 728', '#6a6f78', 9) +
        cray('M412 626q40 22 86 0l6 22q-46 28-98 0z', '#e2352f', 9) + cray('M480 646l18 70', '#e2352f', 9) +
        cray('M456 610m-94 0a94 88 0 1 0 188 0a94 88 0 1 0-188 0'.replace('610', '520'), '#e9a77c', 6) + cray(hatchE(456, 520, 86, 78, 12, 4), '#f2bf9a', 7, 0.55) +
        cray('M370 480L380 420L400 462L414 400L432 452L452 396L468 450L488 400L500 456L522 410L530 466L548 440L544 490', '#f07a1a', 10) + cray(hatchE(456, 456, 74, 26, 7, 6), '#f07a1a', 8, 0.65) +
        cray('M520 432q16-24 40-10q-4 24-34 24z', '#d8332f', 6) +
        `<circle cx="424" cy="520" r="11" fill="#2a6fd0"/><circle cx="490" cy="520" r="11" fill="#2a6fd0"/>` + cray('M410 562q46 40 94 0', '#c0392b', 6) +
        // teddy bear (left hand)
        cray('M190 760m-46 0a46 50 0 1 0 92 0a46 50 0 1 0-92 0', '#8a5a2b', 6) + cray(hatchE(190, 760, 40, 44, 9, 7), '#a8743f', 7, 0.55) +
        cray('M190 690m-30 0a30 28 0 1 0 60 0a30 28 0 1 0-60 0', '#8a5a2b', 6) + cray('M166 664m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0M214 664m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0', '#8a5a2b', 5) +
        `<circle cx="180" cy="686" r="4" fill="#222"/><circle cx="200" cy="686" r="4" fill="#222"/>` +
        // fish (right hand) + more fish
        kidFish(700, 720, 1.1, '#2a6fd0') + kidFish(170, 560, 0.9, '#f07a1a', 1) + kidFish(730, 560, 0.8, '#18a37a') + kidFish(700, 980, 0.9, '#f07a1a', 1) +
        // robot, ball, Sir Fang
        cray('M690 860h80v80h-80zM706 820h48v40h-48z', '#2a6fd0', 6) + `<circle cx="720" cy="838" r="5" fill="#222"/><circle cx="740" cy="838" r="5" fill="#222"/>` + cray('M730 820v-20M690 890h-20M770 890h20', '#2a6fd0', 5) +
        cray('M200 960m-44 0a44 44 0 1 0 88 0a44 44 0 1 0-88 0', '#d8332f', 6) + cray('M160 950q40 20 80 0M170 985q30 14 60 0', '#f2b81f', 7) +
        cray('M150 420l40-70 40 70zM170 420v34M210 420v34', '#9a4fd0', 6) + cray('M180 380h20', '#9a4fd0', 5) +
        // grass + signature
        cray('M80 1110l20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30', '#3aa84a', 6) +
        scribe('TEUCER 8', 580, 1032, { sz: 30, col: '#2a6fd0', w: 5, seed: 8, jit: 8, wob: 4, crayon: 1 }) + `</g>` +
        // crayons on the table
        `<g transform="translate(700 1150) rotate(-24)"><rect width="150" height="22" rx="4" fill="#f07a1a"/><path d="M150 0l26 11-26 11z" fill="#c95d10"/><rect x="20" width="70" height="22" fill="#fff" opacity=".35"/></g>` +
        `<g transform="translate(560 1180) rotate(-8)"><rect width="140" height="22" rx="4" fill="#2a6fd0"/><path d="M140 0l26 11-26 11z" fill="#1a4f9c"/><rect x="20" width="70" height="22" fill="#fff" opacity=".35"/></g>` +
        `<rect width="900" height="1200" fill="url(#lt)"/>` + vig(w, h)
      );
    },
  });

  // ---- Family photo, 2019 ----
  def('p_family_2019', {
    title: 'Family, 2019',
    w: 1200, h: 900, tags: ['family', 'old', 'childe', 'mama', 'papa', 'tonia', 'anthon', 'teucer'],
    svg: (w, h) => lite(() => wrap(w, h,
      grainDef(1) + vigDef(0.6, '#2a1606', 0.45) + skinDef(SK.fair) + skinDef(SK.tan, 'skT') + peopleDefs() +
      `<pattern id="logs" width="1200" height="48" patternUnits="userSpaceOnUse"><rect width="1200" height="48" fill="#8a5a32"/><rect y="6" width="1200" height="30" fill="#a8723f"/><rect y="12" width="1200" height="10" fill="#bd8650" opacity=".7"/><path d="M0 46H1200" stroke="#4a2c14" stroke-width="4"/></pattern>` +
      lg('win', [[0, '#3a4f80'], [1, '#8fa6cf']]) + glow('lamp', '#ffcf80', 0.75) + lg('cold', [[0, '#9fc0ff', 0.35], [1, '#9fc0ff', 0]], 1, 0, 0, 0) +
      lg('coat', [[0, '#8b919b'], [1, '#5f6570']], 0, 0, 1, 1) + lg('rugG', [[0, '#7a1f26'], [1, '#5a1419']]),
      `<rect width="1200" height="900" fill="url(#logs)"/>` +
      // wall rug
      `<rect x="200" y="40" width="560" height="380" fill="url(#rugG)"/><rect x="216" y="56" width="528" height="348" fill="none" stroke="#d9a441" stroke-width="6" stroke-dasharray="18 8"/>` +
      `<path d="M480 90L640 230L480 370L320 230Z" fill="#2a4a6a"/><path d="M480 130L594 230L480 330L366 230Z" fill="#d9a441"/><path d="M480 170L548 230L480 290L412 230Z" fill="#7a1f26"/><circle cx="480" cy="230" r="14" fill="#f3e3c0"/>` +
      `<path d="M240 90l40 40-40 40M720 90l-40 40 40 40M240 290l40 40-40 40M720 290l-40 40 40 40" stroke="#d9a441" stroke-width="5" fill="none"/>` +
      // window, Ajax's side
      `<rect x="880" y="90" width="270" height="390" fill="#e8dcc4"/><rect x="898" y="108" width="234" height="354" fill="url(#win)"/>` + dots(6, 14, 900, 110, 1130, 460, 1.5, 3.5, '#fff', 0.5, 0.9) +
      `<path d="M1015 108v354M898 280h234" stroke="#e8dcc4" stroke-width="10"/><path d="M898 108h60q-40 30-60 90zM1132 108h-50q40 26 50 70z" fill="#fff" opacity=".6"/>` +
      `<path d="M870 80q-30 200 10 420h40q-40-210-10-420z" fill="#f3efe6" opacity=".7"/>` +
      `<rect x="760" y="0" width="440" height="900" fill="url(#cold)"/>` +
      // lamp
      `<path d="M470 0v40" stroke="#2a1a10" stroke-width="3"/><path d="M420 80Q470 30 520 80Z" fill="#e0823a"/><circle cx="470" cy="90" r="360" fill="url(#lamp)"/>` +
      // floor + sofa
      `<rect y="740" width="1200" height="160" fill="#6b4426"/><path d="M0 780H1200M0 830H1200" stroke="#4a2c14" stroke-width="3"/>` +
      `<path d="M230 560Q480 520 760 560V780H230Z" fill="#3e5a48"/><rect x="210" y="620" width="44" height="160" rx="18" fill="#34503f"/><rect x="740" y="620" width="44" height="160" rx="18" fill="#34503f"/>` +
      // Tonia (8) behind the sofa
      at(500, 410, 0.92, `<path d="M-24 48C-60 52-80 70-84 110L-86 200H86L84 110C80 70 60 52 24 48Z" fill="#d9667a"/><path d="M-30 50Q0 70 30 50" stroke="#fff" stroke-width="8" fill="none"/>` + toniaHead({ eyes: 'open', mouth: 'smile', blen: 90, bn: 5 })) +
      // Papa (seated)
      at(370, 470, 1.18, `<path d="M-30 52C-84 58-112 84-118 140L-122 250H122L118 140C112 84 84 58 30 52Z" fill="#4d5e4a"/><path d="M-80 100v140M-40 80v170M0 80v170M40 80v170M80 100v140" stroke="#3b4a39" stroke-width="3" opacity=".6"/>` +
        `<path d="M-120 250H120L130 320H-130Z" fill="#33343e"/><ellipse cx="-70" cy="252" rx="20" ry="15" fill="#e0aa84"/><ellipse cx="70" cy="252" rx="20" ry="15" fill="#e0aa84"/>` + papaHead({ mouth: 'smile', eyes: 'open', brows: 'n', sk: 'skT' })) +
      // Mama (seated) with baby Teucer
      at(610, 480, 1.12, `<path d="M-30 52C-84 58-112 84-118 140L-124 250H124L118 140C112 84 84 58 30 52Z" fill="#8a4a5a"/><path d="M-20 56L0 120L20 56" stroke="#f3e3c0" stroke-width="5" fill="none"/>` +
        `<path d="M-124 250H124L134 320H-134Z" fill="#6a3442"/>` + mamaHead({ mouth: 'smile' })) +
      at(610, 650, 0.62, `<path d="${fluffP(0, 120, 80, 90, 12, 6, 8)}" fill="#f3efe6"/><path d="M-60 120Q0 140 60 120" stroke="#cfc6b4" stroke-width="5" fill="none"/>` +
        teucerHead({ eyes: 'open', mouth: 'o', hat: '#e2463c', hat2: '#b02e2a', neck: false })) +
      `<ellipse cx="560" cy="736" rx="22" ry="16" fill="#f2c5a6"/><ellipse cx="664" cy="736" rx="22" ry="16" fill="#f2c5a6"/>` +
      // Anthon (5) standing by Papa's knee
      at(190, 600, 0.9, `<path d="M-24 50C-62 54-80 74-84 120L-88 220H88L84 120C80 74 62 54 24 50Z" fill="#3f7d9c"/><path d="M-80 150H80" stroke="#f3e3c0" stroke-width="10"/><path d="M-70 220H70L66 320H-66Z" fill="#33343e"/>` +
        anthonHead({ eyes: 'open', mouth: 'smile', gx: 1 })) +
      // Ajax, apart, in the academy coat
      at(960, 330, 1.3, `<path d="M-60 300Q-70 360-64 470H64Q70 360 60 300Z" fill="#3a3e48"/>` +
        `<path d="M-26 54C-62 60-86 84-90 140L-96 470H96L90 140C86 84 62 60 26 54Z" fill="url(#coat)"/>` +
        `<path d="M-30 44L-36 78Q0 96 36 78L30 44Q0 58-30 44Z" fill="#4a4f5a"/><path d="M0 70V470" stroke="#3a3e48" stroke-width="5"/><path d="M-92 210H92" stroke="#2a2d34" stroke-width="16"/><rect x="-14" y="200" width="28" height="22" rx="4" fill="#c9a24a"/>` +
        `<path d="M-12 90v100M12 90v100" stroke="#c8323c" stroke-width="3"/><g fill="#c9a24a"><circle cx="-12" cy="110" r="4"/><circle cx="-12" cy="150" r="4"/><circle cx="12" cy="110" r="4"/><circle cx="12" cy="150" r="4"/></g>` +
        `<path d="M-88 84Q-72 70-56 66L-52 84ZM88 84Q72 70 56 66L52 84Z" fill="#c8323c"/>` +
        `<path d="M-90 140L-108 330Q-104 350-86 346L-74 160ZM90 140L108 330Q104 350 86 346L74 160Z" fill="#6f7580"/><path d="M-74 160L-84 340M74 160L84 340" stroke="#4f5560" stroke-width="3"/><ellipse cx="-97" cy="350" rx="13" ry="15" fill="#f2c5a6"/><ellipse cx="97" cy="350" rx="13" ry="15" fill="#f2c5a6"/>` +
        childeHead({ mouth: 'flat', brows: 'sad', mask: false, gx: -2 })) +
      // faded print look
      `<rect width="1200" height="900" fill="#ffd9a0" opacity=".14" style="mix-blend-mode:multiply"/><rect width="1200" height="900" fill="#fff" opacity=".06"/>` +
      vig(w, h) + grain(w, h, 0.28)
    )),
  });
  /* =====================================================================================
     FISHING LOG
     ===================================================================================== */

  // ---- Sea bass on the wet pier at dawn ----
  def('p_catch_1', {
    title: 'Sea bass at dawn',
    w: 1200, h: 900, tags: ['fishing', 'dawn', 'pier', 'liyue'],
    svg: (w, h) => {
      let planks = '';
      for (let i = 1; i < 16; i++) {
        const t = Math.pow(i / 16, 1.8), y = 430 + 470 * t, xl = 430 - 430 * t, xr = 700 + 500 * t;
        planks += `M${R0(xl)} ${R0(y)}H${R0(xr)}`;
      }
      let glit = '';
      const R = rng(17);
      for (let i = 0; i < 40; i++) { const y = 404 + Math.pow(R(), 1.5) * 40, x = 760 + (R() - 0.5) * (40 + (y - 400) * 4); glit += `M${R0(x - 8)} ${R0(y)}h${R0(10 + R() * 20)}`; }
      let scales = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) scales += `M${-150 + c * 34 + (r % 2) * 17} ${-18 + r * 16}q8 8 16 0`;
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.5, '#1a0c18') +
        lg('sky', [[0, '#26386a'], [0.45, '#6a5f98'], [0.78, '#e88f7c'], [1, '#ffd49a']], 0, 0, 0, 410, US) +
        lg('sea', [[0, '#c98d8a'], [0.08, '#4f6a8c'], [1, '#1d3150']], 0, 400, 0, 900, US) + glow('sun', '#ffe2a0', 1) +
        lg('pier', [[0, '#6b5a6a'], [0.4, '#7a5f58'], [1, '#4a342c']], 0, 430, 0, 900, US) + lg('wet', [[0, '#ffd49a', 0], [0.5, '#ffd49a', 0.45], [1, '#ffd49a', 0]], 0, 0, 1, 0) +
        lg('bass', [[0, '#3c4c5e'], [0.35, '#7f93a6'], [0.6, '#d9e2ea'], [1, '#f6f8fa']]) + lg('rod', [[0, '#1b2230'], [1, '#3a4658']], 0, 0, 1, 0),
        `<rect width="1200" height="410" fill="url(#sky)"/><circle cx="760" cy="400" r="260" fill="url(#sun)"/><circle cx="760" cy="404" r="40" fill="#fff4d6"/>` +
        `<path d="${fluffP(300, 200, 220, 24, 10, 12, 4)}" fill="#f7b49a" opacity=".45"/><path d="${fluffP(1000, 150, 200, 20, 10, 10, 5)}" fill="#f3a8a0" opacity=".35"/>` +
        `<path d="M0 404V300Q20 250 44 300Q60 210 90 296Q110 260 130 310Q160 230 190 320Q220 300 250 404ZM980 404Q1000 330 1030 350Q1050 260 1080 340Q1110 300 1130 350Q1160 290 1200 330V404Z" fill="#6c5f8e" opacity=".8"/>` +
        `<rect y="396" width="1200" height="20" fill="#f7c7a0" opacity=".25"/>` +
        `<rect y="402" width="1200" height="498" fill="url(#sea)"/><path d="${glit}" stroke="#ffe7b4" stroke-width="3" opacity=".8" stroke-linecap="round"/>` +
        // pier
        `<path d="M430 430H700L1200 900H0Z" fill="url(#pier)"/><path d="${planks}" stroke="#2e1f1c" stroke-width="3" opacity=".7"/>` +
        `<path d="M560 430L520 900M600 430L760 900" stroke="#2e1f1c" stroke-width="2" opacity=".35"/>` +
        `<path d="M640 430Q720 600 760 900H560Q620 600 640 430Z" fill="url(#wet)"/>` +
        `<path d="M430 430V380M700 430V380M340 520V420M790 520V420M200 650V480M940 650V480" stroke="#2a1d1a" stroke-width="12" stroke-linecap="round"/><path d="M430 384L200 484M700 384L940 484" stroke="#2a1d1a" stroke-width="6"/>` +
        dots(8, 40, 100, 600, 1100, 890, 1.5, 4, '#ffe9cc', 0.4, 0.8) +
        // rod lying beside
        `<path d="M40 880L1120 520" stroke="url(#rod)" stroke-width="7" stroke-linecap="round"/><path d="M40 880L250 810" stroke="#b98a52" stroke-width="18" stroke-linecap="round"/><path d="M1120 520Q900 640 760 650" stroke="#fff" stroke-width="1.4" fill="none" opacity=".6"/>` +
        `<g transform="translate(270 820) rotate(-18)"><rect x="-10" y="0" width="20" height="26" fill="#9aa4b0"/><circle cx="0" cy="44" r="32" fill="#c9d0d8"/><circle cx="0" cy="44" r="22" fill="#7d8896"/><circle cx="0" cy="44" r="6" fill="#e9eef3"/><path d="M0 44l34 18" stroke="#2a313c" stroke-width="5"/></g>` +
        // sea bass
        `<g transform="translate(600 690) rotate(-10)"><ellipse cx="10" cy="70" rx="250" ry="30" fill="#140c0c" opacity=".35"/>` +
        `<path d="M-60-58L-30-104L-10-62L10-98L30-60L50-92L60-58ZM60-56Q100-90 150-56Z" fill="#4f5d6e"/><path d="M50 56L90 92L120 54Z" fill="#7f8ea0"/>` +
        `<path d="M230 0L290-60Q280 0 290 60Z" fill="#5a6878"/>` +
        `<path d="M-230 6Q-200-56-80-62Q80-66 236-10V12Q80 66-80 64Q-200 60-230 6Z" fill="url(#bass)"/>` +
        `<path d="${scales}" stroke="#2c3a4a" stroke-width="2" fill="none" opacity=".35"/>` +
        `<path d="M-150 0Q20-14 230 2" stroke="#3c4c5e" stroke-width="3" fill="none" opacity=".6"/>` +
        `<path d="M-150-48Q-128 0-152 50" stroke="#55677a" stroke-width="4" fill="none"/><path d="M-142-36q8 12 2 26" stroke="#2c3440" stroke-width="6" fill="none" opacity=".6"/>` +
        `<circle cx="-188" cy="-14" r="11" fill="#c9b98a" stroke="#4a5568" stroke-width="2"/><circle cx="-187" cy="-14" r="7" fill="#0d1218"/><circle cx="-185" cy="-16" r="2" fill="#fff"/>` +
        `<path d="M-232 6L-200 14L-226 22" fill="#4a3a3a" stroke="#2c3a4a" stroke-width="3"/>` +
        `<path d="M-90-44Q40-56 180-24" stroke="#fff" stroke-width="6" opacity=".45" fill="none" stroke-linecap="round"/><path d="M-120 34Q0 46 140 26" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>` +
        `<path d="M-96 10L-50 30L-90 40Z" fill="#9fb0c0"/></g>` +
        vig(w, h) + grain(w, h, 0.2)
      );
    },
  });

  // ---- A weird deep-sea fish under the lantern ----
  def('p_catch_2', {
    title: 'Something from the deep',
    w: 1200, h: 900, tags: ['fishing', 'night', 'lantern', 'weird'],
    svg: (w, h) => {
      let teeth = '';
      for (let i = 0; i < 11; i++) { const x = 470 + i * 26; teeth += `M${x} ${R0(560 - Math.sin(i / 10 * Math.PI) * 30)}l8 ${R0(38 + (i % 3) * 10)}l8-${R0(38 + (i % 3) * 10)}`; }
      let low = '';
      for (let i = 0; i < 10; i++) { const x = 480 + i * 26; low += `M${x} ${R0(690 + Math.sin(i / 9 * Math.PI) * 26)}l8-${R0(34 + (i % 2) * 14)}l8 ${R0(34 + (i % 2) * 14)}`; }
      return wrap(w, h,
        grainDef(1) + vigDef(0.75, '#000', 0.4) +
        rg('bg', [[0, '#2a1d14'], [0.5, '#0d0c12'], [1, '#04050a']], 0.2, 0.15, 0.9) + glow('lan', '#ffb85a', 0.9) + glow('lure', '#7ff6ff', 1) +
        lg('skin', [[0, '#5a3f5c'], [0.5, '#2e2032'], [1, '#160f18']], 0, 0, 1, 1) + lg('glv', [[0, '#f58a3a'], [1, '#c4561a']], 0, 0, 1, 1) +
        lg('fin', [[0, '#6a4e70', 0.8], [1, '#6a4e70', 0.15]]),
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        // sea and rail
        `<path d="M0 640H1200V900H0Z" fill="#06080e"/><path d="M60 700h120M90 730h160M40 770h200M120 810h140" stroke="#ffb85a" stroke-width="3" opacity=".35"/>` +
        `<path d="M0 600H1200" stroke="#2a2024" stroke-width="14"/><path d="M0 594H1200" stroke="#6a4a36" stroke-width="3" opacity=".7"/>` +
        // lantern
        `<circle cx="200" cy="200" r="420" fill="url(#lan)"/><path d="M200 0V70" stroke="#3a2a1a" stroke-width="5"/>` +
        `<path d="M160 90h80l-10 20h-60z" fill="#8a6a2a"/><rect x="164" y="110" width="72" height="110" rx="8" fill="#ffd796" opacity=".9"/><path d="M164 110v110M200 110v110M236 110v110" stroke="#6a4a1a" stroke-width="6"/>` +
        `<path d="M200 140q-14 30 0 50q14-20 0-50z" fill="#fff2c4"/><path d="M156 220h88l-14 18h-60z" fill="#8a6a2a"/><circle cx="200" cy="82" r="10" fill="none" stroke="#8a6a2a" stroke-width="5"/>` +
        // the fish
        `<path d="M840 600Q960 520 1010 430Q1000 560 1060 640Q980 650 900 700Z" fill="url(#fin)"/><path d="M620 470Q660 380 720 400Q700 440 700 480Z" fill="url(#fin)"/>` +
        `<path d="M420 600Q420 440 560 420Q720 400 860 520Q920 580 880 660Q820 760 640 760Q470 760 430 680Z" fill="url(#skin)"/>` +
        dots(4, 30, 560, 450, 860, 720, 2, 6, '#7a5c80', 0.4, 0.7) +
        `<path d="M440 590Q560 520 740 560Q760 640 740 700Q600 740 450 690Z" fill="#12070c"/>` +
        `<path d="${teeth}" fill="#efe6cf" stroke="#b9ad90" stroke-width="1"/><path d="${low}" fill="#e6dcc2" stroke="#b9ad90" stroke-width="1"/>` +
        `<path d="M560 630q30-10 60 4" stroke="#3a1420" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>` +
        `<circle cx="640" cy="482" r="15" fill="#b9c9c6"/><circle cx="641" cy="483" r="8" fill="#5f6f72"/><circle cx="636" cy="477" r="4" fill="#fff" opacity=".9"/><path d="M618 474q22-22 44 0" stroke="#160f18" stroke-width="5" fill="none"/>` +
        `<path d="M424 600Q420 440 560 420Q700 404 820 480" stroke="#ffb85a" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>` +
        `<path d="M600 430Q560 300 470 300Q420 302 410 340" stroke="#3a2a40" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        `<circle cx="410" cy="350" r="110" fill="url(#lure)"/><circle cx="410" cy="350" r="18" fill="#cffcff"/><circle cx="404" cy="344" r="6" fill="#fff"/>` +
        `<path d="M520 450Q640 420 800 470" stroke="#fff" stroke-width="8" opacity=".25" fill="none" stroke-linecap="round"/><path d="M760 520q40 10 60 40" stroke="#fff" stroke-width="5" opacity=".2" fill="none" stroke-linecap="round"/>` +
        // gloved hand from below-right
        `<path d="M1200 900L1200 760Q1080 760 980 800L1000 900Z" fill="#1d242e"/>` +
        `<path d="M990 800Q900 780 820 760Q760 740 720 750Q690 770 720 790Q680 800 690 820Q660 840 700 856Q690 880 730 884Q800 896 880 880Q960 870 1010 860Z" fill="url(#glv)"/>` +
        `<path d="M720 790Q780 790 820 800M700 820Q760 826 820 828M710 856Q770 860 830 856" stroke="#a8461a" stroke-width="4" fill="none"/><path d="M760 744Q800 700 820 730Q810 760 790 770" fill="url(#glv)"/>` +
        `<path d="M840 770q40 0 70 20" stroke="#ffc08a" stroke-width="5" fill="none" opacity=".7"/>` +
        vig(w, h) + grain(w, h, 0.3)
      );
    },
  });

  // ---- The birthday rod from Zhongli ----
  def('p_rod_gift', {
    title: 'The birthday rod',
    w: 1200, h: 900, tags: ['fishing', 'zhongli', 'gift', 'rod', 'birthday'],
    svg: (w, h) => {
      let grainL = '';
      const R = rng(6);
      for (let i = 0; i < 26; i++) { const y = R() * 900; grainL += `M0 ${R0(y)}Q${R0(400 + R() * 400)} ${R0(y + (R() - 0.5) * 40)} 1200 ${R0(y + (R() - 0.5) * 30)}`; }
      // rod axis from (130,800) to (1200,170)
      const ax = (t) => [130 + 1070 * t, 800 - 630 * t];
      let bands = '', guides = '';
      for (const t of [0.42, 0.55, 0.68, 0.8, 0.9]) {
        const [x, y] = ax(t);
        bands += `M${R0(x - 5)} ${R0(y - 9)}l10 18`;
        guides += `<circle cx="${R0(x + 6)}" cy="${R0(y + 12)}" r="${R0(9 - t * 5)}" fill="none" stroke="#c9a24a" stroke-width="3"/>`;
      }
      const [hx, hy] = ax(0.3);
      return wrap(w, h,
        grainDef(0.85) + vigDef(0.55, '#140603') +
        lg('tbl', [[0, '#5a2a1a'], [1, '#3a170e']]) + lg('rod', [[0, '#2a1410'], [0.5, '#5a2a1e'], [1, '#2a1410']], 0, 0, 0, 1) +
        lg('rat', [[0, '#e3c48c'], [1, '#b08a52']]) + lg('rib', [[0, '#e5434c'], [1, '#a81f2b']], 0, 0, 1, 1) + lg('card', [[0, '#fbf6e8'], [1, '#efe4c8']], 0, 0, 1, 1) +
        rg('brass', [[0, '#ffe7a0'], [0.6, '#c9a24a'], [1, '#8a6a22']], 0.4, 0.4, 0.6) + lg('cel', [[0, '#cfe3cf'], [1, '#8fb49a']]) +
        `<pattern id="lat" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(-24) skewX(-20) scale(1.6)"><path d="M0 0h120v120H0z" fill="#ffcf8a" opacity=".2"/><path d="M60 0v120M0 60h120M30 30h60v60H30z" stroke="#000" stroke-width="16" fill="none"/></pattern>` +
        rg('lm', [[0, '#fff'], [0.55, '#fff', 0.8], [1, '#fff', 0]], 0.7, 0.25, 0.65) + `<mask id="lmk"><rect width="1200" height="900" fill="url(#lm)"/></mask>`,
        `<rect width="1200" height="900" fill="url(#tbl)"/><path d="${grainL}" stroke="#2a0e06" stroke-width="2" fill="none" opacity=".5"/>` +
        `<rect width="1200" height="900" fill="url(#lat)" mask="url(#lmk)" style="mix-blend-mode:screen"/>` +
        // teacup + osmanthus
        `<ellipse cx="210" cy="240" rx="120" ry="70" fill="#000" opacity=".3" transform="translate(14 16)"/><ellipse cx="210" cy="240" rx="120" ry="70" fill="url(#cel)"/><ellipse cx="210" cy="226" rx="84" ry="44" fill="#a7c7ad"/><ellipse cx="210" cy="226" rx="70" ry="34" fill="#c98a3a"/><ellipse cx="190" cy="216" rx="24" ry="8" fill="#fff" opacity=".35"/>` +
        `<path d="M380 120q60 40 120 30" stroke="#5a3a1a" stroke-width="5" fill="none"/>` + dots(9, 14, 390, 100, 520, 170, 4, 7, '#f6b93b', 0.85, 1) +
        // rod shadow, blank, bands, guides
        `<path d="M150 830L1200 210" stroke="#000" stroke-width="22" opacity=".3" stroke-linecap="round"/>` +
        `<path d="M${R0(hx)} ${R0(hy)}L1200 170" stroke="url(#rod)" stroke-width="13" stroke-linecap="round"/><path d="M${R0(hx)} ${R0(hy - 4)}L1200 166" stroke="#c46a50" stroke-width="2" opacity=".6"/>` +
        `<path d="${bands}" stroke="#d8b25a" stroke-width="5"/>` + guides +
        // handle: rattan wrap, jade cap, gold ferrules
        `<path d="M130 800L${R0(hx)} ${R0(hy)}" stroke="url(#rat)" stroke-width="34" stroke-linecap="butt"/>` +
        `<path d="M130 800L${R0(hx)} ${R0(hy)}" stroke="#7a5a2a" stroke-width="34" stroke-dasharray="3 9" opacity=".45"/>` +
        `<circle cx="122" cy="806" r="26" fill="#3f9a72"/><circle cx="116" cy="800" r="9" fill="#9fe0c0" opacity=".7"/>` +
        `<path d="M${R0(hx - 10)} ${R0(hy - 14)}l14 22M150 772l14 22" stroke="#d8b25a" stroke-width="8"/>` +
        // reel
        `<g transform="translate(300 720) rotate(-30)"><rect x="-14" y="-40" width="28" height="30" fill="#8a6a22"/><circle r="56" fill="url(#brass)" stroke="#6a4e18" stroke-width="4"/>` +
        `<circle r="36" fill="none" stroke="#8a6a22" stroke-width="3"/><path d="M-24 6q8-16 22-6q12-14 26 4M-20 18q10-8 20 0q10-8 20 0" stroke="#6a4e18" stroke-width="3" fill="none"/>` +
        `<circle r="8" fill="#6a4e18"/><path d="M0 0l48 34" stroke="#6a4e18" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="36" r="10" fill="#2a1410"/></g>` +
        // ribbon + bow + card
        `<path d="M410 640L470 600L500 650L440 690Z" fill="url(#rib)"/>` +
        `<path d="M470 640Q520 560 580 600Q560 650 470 640ZM470 640Q440 560 380 560Q390 620 470 640Z" fill="url(#rib)"/><path d="M470 640Q520 560 580 600M470 640Q440 560 380 560" stroke="#7a121a" stroke-width="3" fill="none"/>` +
        `<path d="M470 640Q500 720 470 800L500 790Q520 720 486 642ZM466 644Q420 720 430 780L400 770Q400 700 462 640Z" fill="#c22a35"/>` +
        `<ellipse cx="470" cy="640" rx="18" ry="14" fill="#d7323d"/>` +
        `<g transform="translate(560 690) rotate(-6)"><rect x="6" y="10" width="330" height="170" fill="#000" opacity=".3"/><rect width="330" height="170" fill="url(#card)"/><rect x="10" y="10" width="310" height="150" fill="none" stroke="#c9a24a" stroke-width="2.5"/>` +
        `<path d="M24 24h18M24 24v18M306 146h-18M306 146v-18" stroke="#c9a24a" stroke-width="3"/>` +
        `<text x="165" y="78" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="31" fill="#3a2a1a">For your birthday.</text>` +
        `<text x="296" y="132" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="31" fill="#3a2a1a">— Z.</text></g>` +
        `<path d="M600 700q-40-40-90-50" stroke="#c22a35" stroke-width="6" fill="none"/>` +
        vig(w, h) + grain(w, h, 0.2)
      );
    },
  });

  /* =====================================================================================
     LIYUE
     ===================================================================================== */

  // ---- Wanmin Restaurant kitchen ----
  def('p_wanmin_kitchen', {
    title: 'Wanmin kitchen',
    w: 1200, h: 900, tags: ['liyue', 'wanmin', 'xiangling', 'guoba', 'kitchen', 'fire'],
    svg: (w, h) => {
      const flame = (x, y, s, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0Q-60-40-30-120Q-20-80 0-90Q-10-150 30-200Q20-120 60-100Q70-140 60-170Q110-100 70 0Z" fill="url(#fl1)"/><path d="M10 0Q-20-40 0-90Q10-60 30-70Q30-100 40-120Q70-60 50 0Z" fill="url(#fl2)"/></g>`;
      let chili = '';
      for (let i = 0; i < 9; i++) chili += `M${1040 + (i % 2) * 14} ${110 + i * 30}q-12 10-6 28`;
      let tiles = '';
      for (let x = 0; x <= 1200; x += 60) tiles += `M${x} 420V640`;
      for (let y = 420; y <= 640; y += 60) tiles += `M0 ${y}H1200`;
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.6, '#120402') + skinDef(SK.fair) + peopleDefs() +
        lg('wall', [[0, '#2a120c'], [1, '#4a2216']]) + glow('lan', '#ff9a4a', 0.7) + glow('fire', '#ffb347', 0.85) +
        lg('fl1', [[0, '#ff4a1a'], [0.6, '#ff9a2a'], [1, '#ffd25a']], 0, 1, 0, 0) + lg('fl2', [[0, '#ffd25a'], [1, '#fff6c4']], 0, 1, 0, 0) +
        rg('stm', [[0, '#fff6ea', 0.6], [0.55, '#ffeedd', 0.3], [1, '#ffeedd', 0]]) + lg('top', [[0, '#e0503a'], [1, '#a8281e']], 0, 0, 1, 1) + lg('gb', [[0, '#ff8a4a'], [1, '#d4501e']], 0, 0, 1, 1) + lg('wok', [[0, '#1a1a1e'], [1, '#3a3a44']]),
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        `<rect y="420" width="1200" height="220" fill="#d9c7a6" opacity=".22"/><path d="${tiles}" stroke="#1a0a06" stroke-width="3" opacity=".4"/>` +
        // shelves, jars, lanterns, chilies
        `<rect x="40" y="250" width="320" height="14" fill="#5a2e1a"/><rect x="60" y="196" width="50" height="54" rx="8" fill="#c97a3c"/><rect x="124" y="206" width="44" height="44" rx="6" fill="#7aa36a"/><rect x="182" y="190" width="56" height="60" rx="10" fill="#d9c7a6"/><rect x="252" y="210" width="40" height="40" rx="6" fill="#a8281e"/>` +
        `<circle cx="150" cy="80" r="200" fill="url(#lan)"/><path d="M150 0v30" stroke="#2a120c" stroke-width="4"/><ellipse cx="150" cy="80" rx="40" ry="50" fill="#d8322a"/><path d="M130 34h40M130 126h40" stroke="#c9a24a" stroke-width="8"/><path d="M150 130v40" stroke="#c9a24a" stroke-width="4"/>` +
        `<path d="${chili}" stroke="#d8322a" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M1047 90v290" stroke="#5a3a1a" stroke-width="3"/>` +
        // sign
        `<rect x="470" y="40" width="260" height="100" rx="8" fill="#a8281e" stroke="#c9a24a" stroke-width="6"/><text x="600" y="120" text-anchor="middle" font-family="serif" font-size="74" font-weight="700" fill="#f2c94c">万民</text>` +
        // order tickets
        `<path d="M780 200H980" stroke="#8a8a8a" stroke-width="5"/><g fill="#f5efe0"><rect x="790" y="204" width="44" height="66" transform="rotate(-4 812 204)"/><rect x="846" y="204" width="44" height="74"/><rect x="902" y="204" width="44" height="60" transform="rotate(5 924 204)"/></g>` +
        `<g transform="translate(-70 0)">` +
        // stove + fire glow
        `<circle cx="470" cy="600" r="420" fill="url(#fire)"/>` +
        `<path d="M200 700H760V900H200Z" fill="#26201e"/><path d="M200 700H760" stroke="#5a4a44" stroke-width="10"/>` +
        flame(380, 700, 1.1, -10) + flame(470, 710, 1.4) + flame(560, 700, 1.05, 12) +
        // wok + flying food
        `<path d="M300 600Q470 720 640 600Z" fill="url(#wok)"/><path d="M290 598H650" stroke="#55555f" stroke-width="10" stroke-linecap="round"/><path d="M640 604L690 592" stroke="#2a1a14" stroke-width="16" stroke-linecap="round"/>` +
        `<g fill="#ff8a4a"><path d="M420 470q20-20 40 0q-10 20-30 10z"/><path d="M520 430q20-24 44-6q-12 22-34 14z"/><path d="M470 380q16-18 34-2q-10 16-26 10z"/></g>` +
        `<g fill="#3aa84a"><rect x="380" y="430" width="22" height="10" rx="4" transform="rotate(-30 390 435)"/><rect x="560" y="500" width="22" height="10" rx="4" transform="rotate(40 570 505)"/></g><g fill="#e8322a"><circle cx="440" cy="530" r="8"/><circle cx="600" cy="420" r="7"/><circle cx="500" cy="500" r="6"/></g>` +
        `<path d="M380 520q40-80 120-100M560 540q20-60-10-110" stroke="#ffe7b4" stroke-width="3" fill="none" opacity=".6" stroke-dasharray="12 10"/>` +
        // steam
        `<g fill="url(#stm)"><path d="${fluffP(480, 300, 170, 80, 12, 22, 3)}"/><path d="${fluffP(540, 180, 130, 60, 10, 18, 4)}" opacity=".7"/><path d="${fluffP(430, 380, 100, 46, 9, 12, 5)}"/></g></g>` +
        // Xiangling
        at(870, 380, 1.8,
          `<path d="M-30 52C-84 58-110 84-116 140L-120 300H120L116 140C110 84 84 58 30 52Z" fill="url(#top)"/><path d="M-60 100Q0 130 60 100L70 300H-70Z" fill="#f4efe6"/><path d="M-30 52Q0 72 30 52" stroke="#1d2242" stroke-width="8" fill="none"/>` +
          `<path d="M-100 100Q-130 112-148 118L-142 146Q-120 146-90 140Z" fill="url(#top)"/><circle cx="-150" cy="130" r="15" fill="#f8d3ba"/>` +
          `<path d="M100 100Q140 40 150-10L176 0Q166 70 116 130Z" fill="url(#top)"/><circle cx="162" cy="-12" r="15" fill="#f8d3ba"/><path d="M162-12L190-80" stroke="#8a8a90" stroke-width="7" stroke-linecap="round"/><ellipse cx="194" cy="-92" rx="18" ry="10" fill="#b0b0b8" transform="rotate(-20 194 -92)"/>` +
          xianglingHead({ mouth: 'grin', gx: -2 })) +
        // Guoba
        `<g transform="translate(150 560)"><path d="M70 120Q150 110 160 40Q150 0 120 10Q130 60 70 80Z" fill="url(#gb)"/><path d="M128 20l20 6M142 60l16-4M120 96l14 8" stroke="#7a2a10" stroke-width="10"/>` +
          `<ellipse cx="40" cy="110" rx="70" ry="80" fill="url(#gb)"/><ellipse cx="40" cy="126" rx="40" ry="50" fill="#5a2a14"/>` +
          `<path d="M-14 170h30v28h-30zM64 170h30v28h-30z" fill="#4a1e0c"/><path d="M-20 80Q-50 60-60 40" stroke="#4a1e0c" stroke-width="22" stroke-linecap="round"/><path d="M100 80Q130 50 150 50" stroke="#4a1e0c" stroke-width="22" stroke-linecap="round"/>` +
          `<circle cx="-30" cy="-20" r="22" fill="#d4501e"/><circle cx="110" cy="-20" r="22" fill="#d4501e"/><circle cx="-30" cy="-20" r="11" fill="#3a1408"/><circle cx="110" cy="-20" r="11" fill="#3a1408"/>` +
          `<ellipse cx="40" cy="20" rx="66" ry="56" fill="url(#gb)"/><path d="M0 26q14-22 30 0q-8 18-30 0zM50 26q14-22 30 0q-8 18-30 0z" fill="#fff4e8"/>` +
          `<circle cx="16" cy="22" r="6" fill="#1a0a04"/><circle cx="64" cy="22" r="6" fill="#1a0a04"/><circle cx="18" cy="20" r="2" fill="#fff"/><circle cx="66" cy="20" r="2" fill="#fff"/>` +
          `<ellipse cx="40" cy="50" rx="22" ry="14" fill="#fff4e8"/><ellipse cx="40" cy="44" rx="8" ry="5" fill="#1a0a04"/><path d="M40 50v6M32 58q8 6 16 0" stroke="#1a0a04" stroke-width="3" fill="none"/>` +
          `<path d="M40-30q-14-20 0-50q6 20 16 10q4 24-16 40z" fill="url(#fl1)"/></g>` +
        `<path d="M260 610q40-30 70-10" stroke="#ffd25a" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>` +
        // counter edge with chopped chilies
        `<path d="M0 820H1200V900H0Z" fill="#6b3a1e"/><path d="M0 820H1200" stroke="#8a5230" stroke-width="8"/><rect x="860" y="760" width="240" height="70" rx="10" fill="#c9945a"/>` + dots(13, 26, 880, 770, 1080, 816, 4, 8, '#e8322a', 0.9, 1) +
        `<ellipse cx="90" cy="806" rx="70" ry="22" fill="#e9e2d6"/><ellipse cx="90" cy="800" rx="52" ry="14" fill="#f2c94c"/>` +
        vig(w, h) + grain(w, h, 0.22)
      );
    },
  });

  // ---- The Alcor's deck at night, ring cleared for a duel ----
  def('p_alcor_deck', {
    title: 'The Alcor, rematch night',
    w: 1200, h: 900, tags: ['liyue', 'alcor', 'beidou', 'night', 'ship', 'rematch'],
    svg: (w, h) => {
      const R = rng(27);
      let city = '', wins = '', refl = '';
      for (let i = 0; i < 22; i++) {
        const x = i * 56 + R() * 20, bw = 30 + R() * 40, bh = 30 + R() * 110, y = 430 - bh;
        city += `M${R0(x)} 430V${R0(y)}h${R0(bw)}V430Z`;
        for (let j = 0; j < 3; j++) wins += `M${R0(x + 6 + R() * (bw - 12))} ${R0(y + 8 + R() * (bh - 16))}h5v4h-5z`;
        refl += `M${R0(x + bw / 2)} ${R0(440 + R() * 20)}v${R0(20 + R() * 40)}`;
      }
      // crew silhouettes around the ring (x, y, scale, arms up?)
      const crew = [[330, 590, 0.62, 1, 1], [410, 560, 0.55, 2], [500, 545, 0.52, 1], [600, 540, 0.5, 0, 2], [700, 545, 0.52, 2, 1], [790, 560, 0.55, 1], [870, 590, 0.62, 0, 2],
        [250, 660, 0.85, 2], [950, 660, 0.85, 1, 1], [160, 800, 1.3, 0, 2], [1040, 800, 1.3, 2], [380, 900, 1.6, 1], [820, 900, 1.6, 0, 1]];
      const fig = ([x, y, s, pose, hat]) => {
        const arms = pose === 1 ? 'M-40-116Q-54-80-52-36M40-116Q62-150 66-200' : pose === 2 ? 'M-40-116Q-74-92-50-62M40-116Q74-92 50-62' : 'M-40-116Q-54-80-52-36M40-116Q54-80 52-36';
        return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${arms}" stroke="#140f18" stroke-width="17" stroke-linecap="round" fill="none"/>` +
          `<path d="M-36-128Q-46-122-46-104L-44-40Q-44 0-36 0H36Q44 0 44-40L46-104Q46-122 36-128Q0-138-36-128Z" fill="#140f18"/><rect x="-8" y="-140" width="16" height="14" fill="#140f18"/><circle cy="-156" r="21" fill="#140f18"/>` +
          (hat === 1 ? `<path d="M-24-164Q0-186 24-164Q30-158 34-150L22-156Q0-168-22-156L-34-150Q-30-158-24-164Z" fill="#140f18"/>` : hat === 2 ? `<path d="M-22-166Q0-182 22-166L30-152Q0-160-30-152Z" fill="#7a1f26"/>` : '') +
          `<path d="M-19-166q12-14 30-4M-44-104L-44-40M36-128Q44-124 46-104" stroke="#ffb45a" stroke-width="3.5" fill="none" opacity=".8"/></g>`;
      };
      const lantern = (x, y) => `<circle cx="${x}" cy="${y}" r="40" fill="url(#lg)"/><rect x="${x - 8}" y="${y - 11}" width="16" height="22" rx="6" fill="#ffcc6e"/>`;
      let lans = '';
      for (let i = 0; i <= 8; i++) { const t = i / 8, x = 120 + t * 640, y = 260 + Math.sin(t * Math.PI) * 70 - t * 120; lans += lantern(R0(x), R0(y)); }
      for (let i = 1; i <= 5; i++) { const t = i / 6, x = 760 + t * 440, y = 140 + Math.sin(t * Math.PI) * 50 + t * 100; lans += lantern(R0(x), R0(y)); }
      let planks = '';
      for (let i = -12; i <= 12; i++) planks += `M${600 + i * 18} 520L${600 + i * 110} 900`;
      return wrap(w, h,
        grainDef(0.9) + vigDef(0.65, '#02030a', 0.45) +
        lg('sky', [[0, '#05081a'], [0.6, '#16204a'], [1, '#3a3462']], 0, 0, 0, 440, US) + glow('lg', '#ffb04a', 0.75) + glow('moon', '#fff3d0', 0.6) +
        lg('deck', [[0, '#5a3a24'], [1, '#2e1c12']], 0, 520, 0, 900, US) + glow('pool', '#ffb45a', 0.55) + lg('sea', [[0, '#1a2448'], [1, '#070a18']]),
        `<rect width="1200" height="440" fill="url(#sky)"/>` + dots(9, 60, 0, 0, 1200, 300, 0.6, 1.6, '#fff', 0.35, 0.9) +
        `<circle cx="980" cy="90" r="120" fill="url(#moon)"/><circle cx="980" cy="90" r="30" fill="#fff5d8"/>` +
        // Liyue harbor across the water
        `<path d="M0 430L0 300Q120 260 240 330L380 280Q460 240 560 300L700 250Q800 220 900 290L1040 260Q1120 250 1200 290V430Z" fill="#141a33"/>` +
        `<path d="M700 250l-30 18h60zM560 300l-26 14h52zM640 236h120l-60-30z" fill="#2a2040"/>` +
        `<path d="${city}" fill="#0e1228"/><path d="${wins}" fill="#ffc66e" opacity=".85"/>` +
        `<g fill="#0e1228"><path d="M180 430V330h60v100zM150 336q60-30 120 0l-14 6q-46-18-92 0zM160 300q50-24 100 0l-12 6q-38-16-76 0zM196 300v-24h28v24z"/><path d="M880 430V300h70v130zM846 306q70-34 140 0l-16 8q-54-22-108 0zM860 268q56-28 112 0l-14 8q-42-18-84 0z"/></g>` +
        `<path d="M150 336q60-30 120 0M160 300q50-24 100 0M846 306q70-34 140 0M860 268q56-28 112 0" stroke="#e8b84a" stroke-width="3" fill="none" opacity=".75"/>` +
        `<g fill="#ff5a3a"><circle cx="160" cy="350" r="6"/><circle cx="260" cy="350" r="6"/><circle cx="858" cy="322" r="7"/><circle cx="974" cy="322" r="7"/></g>` +
        `<rect y="430" width="1200" height="120" fill="url(#sea)"/><path d="${refl}" stroke="#ffb45a" stroke-width="4" opacity=".4"/>` +
        // masts, rigging, sails
        `<path d="M760 0V560" stroke="#2a1a12" stroke-width="26"/><path d="M640 120H900M660 260H880" stroke="#2a1a12" stroke-width="12"/>` +
        `<path d="M650 112Q770 150 890 112L890 126Q770 170 650 126Z M666 252Q770 284 874 252L874 266Q770 300 666 266Z" fill="#e8dcc0"/>` +
        `<path d="M760 20L80 520M760 20L1180 520M760 140L240 520M760 140L1060 520" stroke="#3a2a20" stroke-width="3" opacity=".8"/>` +
        `<path d="M770 30h90l-10 26 10 26h-90z" fill="#1d2a4a"/><path d="M800 44l10 12 14-6-6 14 10 10-14 2-4 14-6-14-14 0 10-10z" fill="#e8b84a"/>` +
        `<path d="M120 260Q440 420 760 140M760 140Q980 300 1200 240" stroke="#3a2a20" stroke-width="2" fill="none"/>` + lans +
        // deck
        `<path d="M0 520H1200V900H0Z" fill="url(#deck)"/><path d="${planks}" stroke="#1d120c" stroke-width="3" opacity=".7"/>` +
        `<path d="M0 520H1200" stroke="#6a4a30" stroke-width="10"/><path d="M0 505H1200" stroke="#4a3020" stroke-width="16"/>` +
        `<ellipse cx="600" cy="700" rx="420" ry="150" fill="url(#pool)"/>` +
        `<ellipse cx="600" cy="690" rx="300" ry="90" fill="none" stroke="#e8dcc0" stroke-width="10" opacity=".85"/><ellipse cx="600" cy="690" rx="300" ry="90" fill="none" stroke="#b9a37a" stroke-width="10" stroke-dasharray="6 14" opacity=".9"/>` +
        crew.map(fig).join('') +
        // lifebuoy with the ship's name
        `<g transform="translate(1100 440)"><circle r="54" fill="none" stroke="#e8dcc0" stroke-width="30"/><path d="M-54 0a54 54 0 0 1 54-54M54 0a54 54 0 0 1-54 54" fill="none" stroke="#c8323c" stroke-width="30"/>` +
        `<text y="5" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="800" fill="#1d2a4a" letter-spacing="1">ALCOR</text></g>` +
        `<text x="1176" y="540" text-anchor="end" font-family="serif" font-size="22" font-weight="700" fill="#e8b84a" letter-spacing="3" opacity=".9">THE ALCOR</text>` +
        vig(w, h) + grain(w, h, 0.25)
      );
    },
  });
})();
