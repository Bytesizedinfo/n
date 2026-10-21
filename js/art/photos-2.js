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
  // eyes: t = open | happy | shut | half ; iris colours [base, dark]
  const eyes = (t, ir, o = {}) => {
    const y = o.y == null ? 8 : o.y, sep = o.sep || 17, gx = o.gx || 0, gy = o.gy || 0;
    let s = '';
    for (const sd of [-1, 1]) {
      const cx = sd * sep;
      const P = (dx, dy) => `${f1(cx + sd * dx)} ${f1(y + dy)}`;
      if (t === 'happy') { s += `<path d="M${P(-10, 3)}Q${P(0, -9)} ${P(10, 3)}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round"/>`; continue; }
      if (t === 'shut') { s += `<path d="M${P(-9, 1)}Q${P(0, 7)} ${P(10, 0)}M${P(8, 2)}l${sd * 3} 3" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`; continue; }
      const top = t === 'half' ? -3 : -9;
      s += `<path d="M${P(-10, -1)}Q${P(-8, top)} ${P(0, top)}Q${P(9, top)} ${P(11, -3)}Q${P(8, 9)} ${P(0, 9)}Q${P(-8, 8)} ${P(-10, -1)}Z" fill="#fff"/>`;
      s += `<ellipse cx="${f1(cx + gx)}" cy="${f1(y + 1 + gy)}" rx="6.6" ry="${t === 'half' ? 6.5 : 8.2}" fill="${ir[0]}"/>`;
      s += `<ellipse cx="${f1(cx + gx)}" cy="${f1(y - 2.5 + gy)}" rx="6.6" ry="4.4" fill="${ir[1]}" opacity=".75"/>`;
      s += `<ellipse cx="${f1(cx + gx)}" cy="${f1(y + 1 + gy)}" rx="3" ry="4" fill="${INK}"/>`;
      s += `<circle cx="${f1(cx + gx + 2.6)}" cy="${f1(y - 2 + gy)}" r="${o.dim ? 1.8 : 2.4}" fill="#fff" opacity="${o.dim ? 0.55 : 1}"/>`;
      if (!o.dim) s += `<circle cx="${f1(cx + gx - 2.4)}" cy="${f1(y + 5 + gy)}" r="1.1" fill="#fff" opacity=".8"/>`;
      s += `<path d="M${P(-11, 0)}Q${P(-8, top - 1.5)} ${P(0, top - 1)}Q${P(9, top - 1)} ${P(12, -4)}l${sd * 3}-3" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M${P(-4, 9.5)}Q${P(4, 10)} ${P(8, 6)}" fill="none" stroke="${INK}" stroke-width="1.3" opacity=".45" stroke-linecap="round"/>`;
    }
    return s;
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
    `<path d="${front}" fill="${k[3]}" opacity=".35" transform="translate(2 6)" clip-path="url(#cf${kid ? 'K' : 'A'})"/>` +
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
    return `<path d="M-46-20C-50 0-46 14-42 22H42C46 14 50 0 46-20Z" fill="#9c6a4c"/>` + neck(k, 15, 28) + face(k, false, 'sk', 0.18) +
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

  def('zz_lineup', {
    title: 'lineup (temp)', w: 1200, h: 900, tags: [],
    svg: (w, h) => wrap(w, h, skinDef(SK.fair) + lg('skT', [[0, SK.tan[0]], [1, SK.tan[2]]]) + peopleDefs(),
      `<rect width="1200" height="900" fill="#cfd8e0"/>` +
      at(150, 200, 1.6, childeHead()) + at(400, 200, 1.6, teucerHead()) + at(650, 200, 1.6, toniaHead()) + at(900, 200, 1.6, anthonHead({ headset: true })) +
      at(150, 600, 1.6, mamaHead()) + at(400, 600, 1.6, papaHead().replace(/url\(#sk\)/g, 'url(#skT)')) + at(650, 600, 1.6, xianglingHead()) + at(900, 600, 1.6, teucerHead({ eyes: 'happy', mouth: 'laugh' })) + at(1100, 600, 1.6, toniaHead({ eyes: 'shut', mouth: 'soft' }))),
  });

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
        dots(3, 60, 0, 0, 1200, 220, 0.6, 1.8, '#fff', 0.3, 0.9) +
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
        dots(11, 110, 0, 0, 1200, 900, 1, 3.4, '#fff', 0.45, 0.95) +
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
        dots(29, 70, 0, 0, 1200, 900, 1.5, 4, '#fff', 0.5, 0.9) +
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
      at(400, 640, 3.4,
        `<path d="M-30 52C-80 56-118 84-128 140L-140 260H140L128 140C118 84 80 56 30 52Z" fill="url(#hood)"/><path d="M-40 52Q0 90 40 52" stroke="#9b3f1c" stroke-width="5" fill="none"/>` +
        `<path d="M-10 70v40M10 70v40" stroke="#fff" stroke-width="3"/>` +
        teucerHead({ mouth: 'gap', eyes: 'open', brows: 'up', gx: 1 }), -5) +
      `<path d="M0 880Q150 860 250 950Q290 1060 230 1200H0Z" fill="#e57a3e"/><path d="M60 930Q170 940 220 1040M30 1010Q120 1030 160 1120" stroke="#b9531f" stroke-width="5" fill="none" opacity=".6"/>` +
      // phone-screen glow on his face
      `<circle cx="380" cy="760" r="300" fill="url(#scr)" style="mix-blend-mode:screen"/>` +
      vig(w, h) + grain(w, h, 0.3)
    ),
  });
})();
