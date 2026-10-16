/* Ending key art (1200×900). Cinematic cards; subjects kept in the centre band so portrait crops still read. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- helpers ----------------------------------------------------------------------------
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const f = Math.round;
  const r1 = (n) => Math.round(n * 10) / 10;
  let S = 1;
  const seed = (n) => { S = n; };
  const rnd = () => (S = (S * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();

  const GRAIN =
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .9 0 0 0 -.5" result="l"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.9 0 0 0 .4" result="d"/>` +
    `<feMerge><feMergeNode in="l"/><feMergeNode in="d"/></feMerge></filter>`;
  const VIG = rg('vig', [[0.5, '#000', 0], [1, '#000', 0.55]], 0.5, 0.5, 0.78);
  const svg = (defs, body, g = 0.55, v = 1) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs>${GRAIN}${VIG}${defs}</defs>${body}` +
    `<rect width="1200" height="900" fill="url(#vig)" opacity="${v}"/><rect width="1200" height="900" filter="url(#grain)" opacity="${g}"/></svg>`;
  const SANS = `-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const text = (x, y, s, o) =>
    `<text x="${x}" y="${y}" font-family="${o.font || SANS}" font-size="${o.size}"${o.weight ? ` font-weight="${o.weight}"` : ''}` +
    `${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''} fill="${o.fill || '#fff'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;

  // Many small circles in one path
  const dots = (n, x0, x1, y0, y1, r0, r2) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const r = rr(r0, r2), x = rr(x0, x1), y = rr(y0, y1);
      d += `M${f(x + r)} ${f(y)}a${r1(r)} ${r1(r)} 0 1 0 .1 0`;
    }
    return d;
  };
  // Soft steam / smoke wisp
  const wisp = (x, y, hgt, sway, o = 1, c = '#fff') => {
    const d = `M${x} ${y}C${x - sway} ${y - hgt * 0.25} ${x + sway} ${y - hgt * 0.45} ${x} ${y - hgt * 0.62}S${x - sway * 0.8} ${y - hgt * 0.9} ${x + sway * 0.3} ${y - hgt}`;
    return `<g fill="none" stroke="${c}" stroke-linecap="round" opacity="${o}"><path d="${d}" stroke-width="44" opacity=".05"/><path d="${d}" stroke-width="24" opacity=".09"/><path d="${d}" stroke-width="9" opacity=".16"/></g>`;
  };
  // Fluffy/spiky edge along an ellipse arc (deg; 0 = right, 90 = down)
  function fluff(cx, cy, rx, ry, a0, a1, n, amp, cmd, lean = 0.3) {
    const P = (a, r) => [cx + (rx + r) * Math.cos((a * Math.PI) / 180), cy + (ry + r) * Math.sin((a * Math.PI) / 180)];
    const st = (a1 - a0) / n;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = a0 + st * i;
      const [x, y] = P(a, 0);
      if (i === 0) { d += (cmd || 'M') + f(x) + ' ' + f(y); continue; }
      const k = amp * rr(0.6, 1.3);
      const [c1x, c1y] = P(a - st * 0.85, k * 0.4), [tx, ty] = P(a - st * lean, k), [c2x, c2y] = P(a - st * 0.1, k * 0.2);
      d += `Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)}Q${f(c2x)} ${f(c2y)} ${f(x)} ${f(y)}`;
    }
    return d;
  }
  // Lotus bloom, front view, base at (x,y)
  function lotus(x, y, s, fill, line) {
    const pet = (a, L, W) => `<path transform="rotate(${a})" d="M0 0C${W} ${-L * 0.25} ${W * 0.7} ${-L * 0.85} 0 ${-L}C${-W * 0.7} ${-L * 0.85} ${-W} ${-L * 0.25} 0 0Z" fill="${fill}" stroke="${line}" stroke-width="2"/>`;
    let p = '';
    for (const a of [-78, 78, -58, 58]) p += pet(a, 110, 42);
    for (const a of [-36, 36, -16, 16]) p += pet(a, 140, 44);
    for (const a of [-5, 5]) p += pet(a, 150, 40);
    return `<g transform="translate(${x} ${y}) scale(${s})">${p}</g>`;
  }
  const leaf = (x, y, rx, ry, fill, rim) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>` +
    (rim ? `<path d="M${x - rx} ${y}A${rx} ${ry} 0 0 1 ${x + rx} ${y}" fill="none" stroke="${rim}" stroke-width="4" opacity=".8"/>` : '') +
    `<path d="M${x} ${y}L${f(x + rx * 0.7)} ${f(y - ry * 0.6)}" stroke="#000" stroke-width="5" opacity=".35"/>`;
  // Tiny standing figure silhouette (feet at x,y)
  const person = (x, y, h, c) =>
    `<g transform="translate(${x} ${y}) scale(${r1(h / 100)})" fill="${c}"><circle cx="0" cy="-88" r="11"/><path d="M-14-74H14L18-30L12 0H4L0-24L-4 0H-12L-18-30Z"/></g>`;

  // ---- 1. The Honest Stranger -------------------------------------------------------------
  def('end_honest', {
    title: 'The Honest Stranger',
    w: 1200, h: 900, tags: ['ending'],
    svg: () => {
      seed(1);
      const SK = '#f1c7a4', SKD = '#d79f7c';
      let rays = '';
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + 0.1, b = a + 0.09;
        rays += `M600 420L${f(600 + 1100 * Math.cos(a))} ${f(420 + 1100 * Math.sin(a))}L${f(600 + 1100 * Math.cos(b))} ${f(420 + 1100 * Math.sin(b))}Z`;
      }
      const finger = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${SK}" stroke="${SKD}" stroke-width="3"/>`;
      return svg(
        lg('sky', [[0, '#8fb7de'], [0.5, '#f6dcc4'], [1, '#f1a882']]) +
        rg('sun', [[0, '#fffaf0', 1], [0.25, '#fff1cc', 0.8], [1, '#ffd9a0', 0]]) +
        lg('case', [[0, '#7a5ccc'], [0.5, '#5b3fa6'], [1, '#3a2470']], 0, 0, 1, 1) +
        lg('suit', [[0, '#3a3a44'], [1, '#18181e']], 0, 0, 1, 1) +
        lg('jean', [[0, '#7d8f9f'], [1, '#4f6070']], 0, 0, 1, 1) +
        rg('lens', [[0, '#4a5a8a'], [0.6, '#10121c'], [1, '#05060a']], 0.35, 0.35, 0.7),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<path d="${rays}" fill="#fff" opacity=".12"/>` +
        `<circle cx="600" cy="420" r="560" fill="url(#sun)"/>` +
        `<path d="${dots(26, 0, 1200, 0, 900, 8, 34)}" fill="#fff" opacity=".18"/>` +
        // city line far away
        `<path d="M0 760H90V700H150V730H220V660H280V720H360V690H430V740H770V680H830V720H900V650H960V700H1040V670H1110V720H1200V900H0Z" fill="#e7a98a" opacity=".55"/>` +
        `<g transform="translate(600 430) rotate(-8)">` +
        // receiver: suit sleeve from top right, palm behind the phone
        `<path d="M250-70L520-330L640-210L360 40Z" fill="url(#suit)"/>` +
        `<path d="M240-58L330-150L392-86L300 6Z" fill="#f4f1ea"/><rect x="318" y="-92" width="18" height="18" rx="4" fill="#8a4dff" transform="rotate(45 327 -83)"/>` +
        `<path d="M140-70C170-110 230-120 270-90C300-60 300-10 270 30C240 70 170 80 140 50Z" fill="${SK}" stroke="${SKD}" stroke-width="3"/>` +
        // giver: denim sleeve from bottom left, palm behind the phone
        `<path d="M-250 70L-520 330L-640 210L-360-40Z" fill="url(#jean)"/>` +
        `<path d="M-250 70L-330 150L-392 86L-310 6Z" fill="#5d6e7e"/>` +
        `<path d="M-140 70C-170 110-230 120-270 90C-300 60-300 10-270-30C-240-70-170-80-140-50Z" fill="${SK}" stroke="${SKD}" stroke-width="3"/>` +
        // fingers behind (peeking below)
        finger(92, 70, 34, 64) + finger(130, 74, 34, 66) + finger(168, 70, 32, 58) +
        finger(-196, 70, 34, 60) + finger(-158, 76, 34, 64) + finger(-120, 72, 32, 58) +
        // the phone (back, purple case)
        `<rect x="-206" y="-106" width="412" height="212" rx="38" fill="#000" opacity=".2" transform="translate(10 16)"/>` +
        `<rect x="-206" y="-106" width="412" height="212" rx="38" fill="url(#case)"/>` +
        `<rect x="-200" y="-100" width="400" height="200" rx="34" fill="none" stroke="#a58ae8" stroke-width="3" opacity=".6"/>` +
        `<rect x="-176" y="-82" width="96" height="96" rx="24" fill="#2e1d5a"/>` +
        `<circle cx="-150" cy="-56" r="18" fill="url(#lens)" stroke="#5a4a8a" stroke-width="3"/><circle cx="-106" cy="-56" r="18" fill="url(#lens)" stroke="#5a4a8a" stroke-width="3"/><circle cx="-150" cy="-12" r="18" fill="url(#lens)" stroke="#5a4a8a" stroke-width="3"/><circle cx="-106" cy="-14" r="6" fill="#ffe9b0"/>` +
        `<path d="M-190-60C-120-104 60-110 180-80" stroke="#fff" stroke-width="6" fill="none" opacity=".25" stroke-linecap="round"/>` +
        // thumbs on the case
        `<path d="M222-20C200-40 168-58 140-62C124-64 116-48 128-38C150-22 180-4 206 8Z" fill="${SK}" stroke="${SKD}" stroke-width="3"/><path d="M140-60C130-58 126-48 132-42" fill="#fde6d6" stroke="${SKD}" stroke-width="2"/>` +
        `<path d="M-222 20C-200 40-168 58-140 62C-124 64-116 48-128 38C-150 22-180 4-206-8Z" fill="${SK}" stroke="${SKD}" stroke-width="3"/><path d="M-140 60C-130 58-126 48-132 42" fill="#fde6d6" stroke="${SKD}" stroke-width="2"/>` +
        `</g>` +
        `<path d="${dots(16, 380, 820, 220, 640, 2, 5)}" fill="#fff" opacity=".7"/>`
      , 0.45, 0.8);
    },
  });

  // ---- 2. Wen Ning Saw Nothing ------------------------------------------------------------
  def('end_wen_ning', {
    title: 'Wen Ning Saw Nothing',
    w: 1200, h: 900, tags: ['ending', 'van', 'dawn'],
    svg: () => {
      seed(2);
      let poles = '';
      for (let i = 0; i < 5; i++) {
        const x = 80 + i * 280, hgt = 200 - i * 10;
        poles += `M${x} 640V${640 - hgt}M${x - 26} ${648 - hgt}H${x + 26}`;
      }
      return svg(
        lg('sky', [[0, '#1b2557'], [0.35, '#57508c'], [0.58, '#e48ba0'], [0.74, '#ffb07a'], [0.82, '#ffd79a']]) +
        rg('sun', [[0, '#fff6d8', 1], [0.12, '#ffe7a8', 0.9], [0.4, '#ffb47a', 0.35], [1, '#ff9a7a', 0]]) +
        lg('glass', [[0, '#ffd2a8'], [0.6, '#e58aa0'], [1, '#6a5a9a']]) +
        lg('cream', [[0, '#f6ecd8'], [1, '#d9c7a6']]) +
        lg('teal', [[0, '#6aa8a0'], [1, '#3f7570']]) +
        lg('beam', [[0, '#fff2c8', 0.55], [1, '#fff2c8', 0]], 0, 0, 1, 0) +
        lg('road', [[0, '#3a2f52'], [1, '#1a1428']]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<path d="${dots(30, 0, 1200, 0, 260, 0.8, 2)}" fill="#fff" opacity=".6"/>` +
        `<circle cx="930" cy="620" r="520" fill="url(#sun)"/>` +
        `<circle cx="930" cy="618" r="64" fill="#fff8e0"/>` +
        `<path d="M0 600C120 560 260 540 380 570C500 520 640 530 760 580C860 560 1000 550 1200 590V660H0Z" fill="#7a5a8a" opacity=".55"/>` +
        `<path d="M0 640C160 610 300 600 460 630C600 610 760 615 900 640C1000 630 1100 630 1200 645V700H0Z" fill="#3c2f58"/>` +
        `<path d="${poles}" stroke="#2a2040" stroke-width="7"/>` +
        `<path d="M80 448Q220 470 360 458Q500 470 640 466Q780 474 920 470Q1060 476 1200 472" stroke="#2a2040" stroke-width="2" fill="none"/>` +
        `<path d="M0 680H1200V900H0Z" fill="url(#road)"/>` +
        `<path d="M0 700H1200" stroke="#5a4a78" stroke-width="3"/><path d="M40 760H1160" stroke="#f2d49a" stroke-width="6" stroke-dasharray="60 50" opacity=".55"/>` +
        // headlight beam
        `<path d="M810 600L1200 520V720Z" fill="url(#beam)"/>` +
        // van
        `<g transform="translate(0 20)">` +
        `<ellipse cx="610" cy="672" rx="260" ry="18" fill="#000" opacity=".35"/>` +
        `<path d="M400 560V630Q400 652 424 652H800Q822 652 822 630V560Z" fill="url(#teal)"/>` +
        `<path d="M400 560V494Q400 462 434 460H716Q760 462 792 516L822 560Z" fill="url(#cream)"/>` +
        `<path d="M400 562H822" stroke="#a89a7c" stroke-width="5"/><path d="M400 572H822" stroke="#e9dfc8" stroke-width="3" opacity=".6"/>` +
        `<g fill="url(#glass)"><rect x="430" y="480" width="86" height="58" rx="10"/><rect x="530" y="480" width="86" height="58" rx="10"/><rect x="630" y="480" width="70" height="58" rx="10"/><path d="M714 480H752Q772 482 786 516L796 538H714Z"/></g>` +
        `<path d="M732 500C744 496 754 504 752 516C750 528 744 538 734 538H726C722 520 722 506 732 500Z" fill="#2a2040" opacity=".75"/>` +
        `<path d="M440 486L470 486M540 486L560 486" stroke="#fff" stroke-width="4" opacity=".5"/>` +
        `<rect x="430" y="448" width="270" height="12" rx="4" fill="#5a4e46"/><path d="M450 448V430M680 448V430" stroke="#5a4e46" stroke-width="6"/>` +
        `<g fill="none" stroke="#e8a83a" stroke-width="8"><ellipse cx="560" cy="434" rx="52" ry="14"/><ellipse cx="560" cy="428" rx="40" ry="10"/></g>` +
        `<rect x="392" y="618" width="20" height="30" rx="6" fill="#d8402e"/><circle cx="812" cy="588" r="16" fill="#fff6d8"/><circle cx="812" cy="588" r="34" fill="#fff6d8" opacity=".25"/>` +
        `<rect x="386" y="640" width="60" height="16" rx="6" fill="#2a2a30"/><rect x="780" y="640" width="54" height="16" rx="6" fill="#2a2a30"/>` +
        `<g fill="#8a6a4a" opacity=".5"><ellipse cx="452" cy="636" rx="14" ry="6"/><ellipse cx="768" cy="624" rx="10" ry="5"/></g>` +
        // painted sign
        `<g transform="translate(478 610)"><path d="M0-22C-14-22-18-6-8 6C-2 14 0 22 0 26C0 22 2 14 8 6C18-6 14-22 0-22Z" fill="#fff6f0"/><path d="M0-22C-6-34-14-36-18-30M0-22C4-36 12-38 16-30" stroke="#6ab04c" stroke-width="5" fill="none" stroke-linecap="round"/></g>` +
        text(506, 622, 'Yiling Radish Co.', { font: `'Marker Felt', 'Chalkboard SE', 'Trebuchet MS', ${SANS}`, size: 34, weight: 700, fill: '#fbf2e2' }) +
        `<circle cx="500" cy="650" r="42" fill="#1a1a1e"/><circle cx="500" cy="650" r="22" fill="#c9c6c0"/><circle cx="500" cy="650" r="8" fill="#7a7670"/>` +
        `<circle cx="730" cy="650" r="42" fill="#1a1a1e"/><circle cx="730" cy="650" r="22" fill="#c9c6c0"/><circle cx="730" cy="650" r="8" fill="#7a7670"/>` +
        `<path d="M410 500Q410 470 436 468" stroke="#fff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>` +
        `</g>` +
        `<path d="M300 300l14-8 14 8M340 330l10-6 10 6M960 260l12-7 12 7" stroke="#2a2040" stroke-width="4" fill="none" stroke-linecap="round"/>`
      , 0.5, 0.85);
    },
  });

  // ---- 3. I Know Nothing ------------------------------------------------------------------
  def('end_busted', {
    title: 'I Know Nothing',
    w: 1200, h: 900, tags: ['ending', 'nhs', 'fan'],
    svg: () => {
      seed(3);
      const P = [600, 960], R = 500, r0 = 140, N = 18, A = 62;
      const pt = (deg, rad) => [P[0] + rad * Math.sin((deg * Math.PI) / 180), P[1] - rad * Math.cos((deg * Math.PI) / 180)];
      let folds = '', ribs = '';
      for (let i = 0; i < N; i++) {
        const a0 = -A + (2 * A * i) / N, a1 = -A + (2 * A * (i + 1)) / N;
        const q = [pt(a0, R), pt(a1, R), pt(a1, r0), pt(a0, r0)].map((p) => p.map(f).join(' '));
        folds += `<path d="M${q[0]}L${q[1]}L${q[2]}L${q[3]}Z" fill="${i % 2 ? '#ece1c9' : '#faf4e6'}"/>`;
      }
      for (let i = 0; i <= N; i++) {
        const [x0, y0] = pt(-A + (2 * A * i) / N, r0 + 4), [x1, y1] = pt(-A + (2 * A * i) / N, 30);
        ribs += `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
      }
      const [ex0, ey0] = pt(-A, R), [ex1, ey1] = pt(A, R);
      const FAN = `M${P[0]} ${P[1]}L${f(ex0)} ${f(ey0)}A${R} ${R} 0 0 1 ${f(ex1)} ${f(ey1)}Z`;
      const eye = (cx, cy, flip) =>
        `<g transform="translate(${cx} ${cy})${flip ? ' scale(-1 1)' : ''}">` +
        `<path d="M-62 6C-40-30 40-34 64-2C40 10-36 16-62 6Z" fill="#fff8f2"/>` +
        `<clipPath id="ec${flip ? 1 : 0}"><path d="M-62 6C-40-30 40-34 64-2C40 10-36 16-62 6Z"/></clipPath>` +
        `<g clip-path="url(#ec${flip ? 1 : 0})"><circle cx="${flip ? -6 : 6}" cy="-6" r="26" fill="url(#iris)"/><circle cx="${flip ? -6 : 6}" cy="-6" r="13" fill="#120a08"/><circle cx="${flip ? -14 : 16}" cy="-16" r="7" fill="#fff"/></g>` +
        `<path d="M-66 8C-44-34 42-40 68-2" fill="none" stroke="#1c1214" stroke-width="10" stroke-linecap="round"/>` +
        `<path d="M68-2L84-14" stroke="#1c1214" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M-50 22C-20 34 30 30 56 12" fill="none" stroke="#c98a72" stroke-width="5" stroke-linecap="round"/>` +
        `</g>`;
      return svg(
        rg('bg', [[0, '#3b7a5a'], [0.5, '#163a2b'], [1, '#07130d']], 0.45, 0.3, 0.8) +
        lg('skin', [[0, '#ffe6d4'], [0.6, '#f7cfb3'], [1, '#d9a184']], 0, 0, 1, 1) +
        lg('hair', [[0, '#3a2a26'], [0.5, '#1c1414'], [1, '#0c0909']], 0, 0, 1, 1) +
        rg('iris', [[0, '#8a5a34'], [0.7, '#3e2414'], [1, '#1a0e08']], 0.4, 0.4, 0.6) +
        rg('spot', [[0, '#fff', 0.25], [1, '#fff', 0]]) +
        `<clipPath id="fc"><path d="${FAN}"/></clipPath>`,
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<circle cx="420" cy="200" r="420" fill="url(#spot)"/>` +
        // hair back + bun
        `<circle cx="600" cy="130" r="70" fill="url(#hair)"/><path d="M500 80L720 150" stroke="#2f8a58" stroke-width="12" stroke-linecap="round"/><circle cx="500" cy="80" r="13" fill="#7fe0a8"/>` +
        `<path d="M340 520C300 300 400 150 600 146C800 150 900 300 860 520C870 600 880 680 900 760H300C320 680 330 600 340 520Z" fill="url(#hair)"/>` +
        // face
        `<path d="M600 200C730 200 790 290 790 410C790 520 740 610 670 660C640 680 620 690 600 690C580 690 560 680 530 660C460 610 410 520 410 410C410 290 470 200 600 200Z" fill="url(#skin)"/>` +
        `<path d="M790 410C790 520 740 610 670 660C640 680 620 690 600 690C680 640 744 540 760 410Z" fill="#c98a6e" opacity=".35"/>` +
        `<ellipse cx="480" cy="470" rx="54" ry="26" fill="#ff8a8a" opacity=".3"/><ellipse cx="720" cy="470" rx="54" ry="26" fill="#ff8a8a" opacity=".3"/>` +
        // fringe
        `<path d="M400 420C380 260 470 180 600 176C730 180 820 260 800 420C786 340 760 300 720 280C726 320 714 350 694 368C686 330 662 302 624 288C622 320 604 346 578 360C578 330 566 308 540 300C500 330 420 360 400 420Z" fill="url(#hair)"/>` +
        `<path d="M490 210C540 186 650 186 710 214" stroke="#5a4640" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/>` +
        // brows (one raised) + eyes
        `<path d="M432 330C462 296 520 290 556 306" stroke="#1c1214" stroke-width="13" fill="none" stroke-linecap="round"/>` +
        `<path d="M648 318C684 306 736 310 766 330" stroke="#1c1214" stroke-width="13" fill="none" stroke-linecap="round"/>` +
        eye(500, 410, false) + eye(700, 410, true) +
        `<path d="M846 360l8 22 22 8-22 8-8 22-8-22-22-8 22-8Z" fill="#fff8d6"/>` +
        // fan
        `<path d="${FAN}" fill="#000" opacity=".35" transform="translate(16 22)"/>` +
        `<path d="${ribs}" stroke="#7a4e2a" stroke-width="12" stroke-linecap="round"/>` +
        `<g clip-path="url(#fc)">${folds}` +
        `<path d="M60 760L200 600L280 660L400 520L520 640L600 560L700 650L800 540L900 640L1000 580L1140 760Z" fill="#9cc2ad" opacity=".55"/>` +
        `<path d="M80 800L240 680L330 720L450 620L560 700L680 640L800 700L940 640L1120 800Z" fill="#4e8a6c" opacity=".6"/>` +
        `<circle cx="840" cy="560" r="40" fill="#e9705e" opacity=".85"/>` +
        `<path d="M300 520C360 540 410 580 430 640M340 540l-16-30M384 576l26-18M408 610l-22 10" fill="none" stroke="#4a2e20" stroke-width="7" stroke-linecap="round"/>` +
        `<g fill="#f39ab4"><circle cx="320" cy="512" r="12"/><circle cx="350" cy="540" r="10"/><circle cx="392" cy="570" r="12"/><circle cx="420" cy="612" r="10"/><circle cx="376" cy="540" r="7"/></g>` +
        `<path d="M940 620v80M960 630v40M944 690h18" stroke="#2a2a2a" stroke-width="6" stroke-linecap="round" opacity=".7"/><rect x="926" y="720" width="34" height="34" fill="#c8302c"/>` +
        `</g>` +
        `<path d="M${f(ex0)} ${f(ey0)}A${R} ${R} 0 0 1 ${f(ex1)} ${f(ey1)}" fill="none" stroke="#7a4e2a" stroke-width="8"/>`
      , 0.5, 0.9);
    },
  });

  // ---- 4. Zidian Is Waiting ---------------------------------------------------------------
  def('end_zidian', {
    title: 'Zidian Is Waiting',
    w: 1200, h: 900, tags: ['ending', 'lightning', 'door'],
    svg: () => {
      seed(4);
      const bolt = (x0, y0, x1, y1, n, jit) => {
        let d = `M${x0} ${y0}`;
        for (let i = 1; i <= n; i++) {
          const t = i / n;
          d += `L${f(x0 + (x1 - x0) * t + (i < n ? rr(-jit, jit) : 0))} ${f(y0 + (y1 - y0) * t + (i < n ? rr(-jit, jit) * 0.5 : 0))}`;
        }
        return d;
      };
      const zap = (d, k) => `<path d="${d}" stroke="#8a3dff" stroke-width="${36 * k}" opacity=".18"/><path d="${d}" stroke="#c18aff" stroke-width="${12 * k}" opacity=".55"/><path d="${d}" stroke="#fbf6ff" stroke-width="${4 * k}"/>`;
      const arcs = bolt(500, 560, 330, 640, 6, 30) + bolt(500, 560, 420, 820, 6, 30) + bolt(505, 556, 560, 700, 4, 24);
      const sky = bolt(470, 140, 300, 0, 5, 30) + bolt(730, 150, 940, 0, 5, 30) + bolt(740, 300, 1000, 380, 6, 40) + bolt(460, 380, 160, 300, 6, 40);
      const MAN = 'M600 222C622 222 636 238 636 262C636 276 630 290 620 296L626 312C660 318 694 330 704 352L716 470C718 500 714 520 702 528L700 620C708 680 716 740 712 790H664L636 640H564L536 790H488C484 740 492 680 500 620L498 528C486 520 482 500 484 470L496 352C506 330 540 318 574 312L580 296C570 290 564 276 564 262C564 238 578 222 600 222Z';
      return svg(
        rg('room', [[0, '#2a1446'], [0.5, '#120a20'], [1, '#050308']], 0.5, 0.5, 0.8) +
        rg('door', [[0, '#ffffff'], [0.35, '#efdcff'], [0.75, '#b77cff'], [1, '#6a2fd0']], 0.5, 0.45, 0.7) +
        lg('spill', [[0, '#d9b8ff', 0.75], [1, '#8a3dff', 0]]) +
        rg('halo', [[0, '#c18aff', 0.6], [1, '#c18aff', 0]]) +
        lg('panel', [[0, '#1a1028'], [1, '#2a1a40']], 0, 0, 1, 0),
        `<rect width="1200" height="900" fill="url(#room)"/>` +
        `<path d="M0 820H1200" stroke="#2a1a40" stroke-width="3"/>` +
        // light spill on the floor + long shadow
        `<path d="M444 820H756L1100 900H100Z" fill="url(#spill)"/>` +
        `<path d="M560 820H640L700 900H500Z" fill="#050308" opacity=".85"/>` +
        // door frame, light, open door panel
        `<rect x="420" y="96" width="360" height="728" fill="#0d0816"/>` +
        `<rect x="444" y="120" width="312" height="700" fill="url(#door)"/>` +
        `<circle cx="600" cy="460" r="420" fill="url(#halo)"/>` +
        `<path d="M444 120L330 70V880L444 820Z" fill="url(#panel)"/><circle cx="356" cy="480" r="9" fill="#8a6ab8"/>` +
        `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${zap(sky, 0.7)}</g>` +
        // the silhouette, rim-lit
        `<path d="${MAN}" fill="#0b0612" stroke="#e7d2ff" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M704 352L716 470C718 500 714 520 702 528" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>` +
        // phone glowing in his hand (Find My)
        `<rect x="690" y="470" width="34" height="62" rx="7" fill="#d9f2ff" transform="rotate(10 707 501)"/><circle cx="708" cy="498" r="6" fill="#ff3b30"/>` +
        // fist crackling
        `<circle cx="500" cy="556" r="26" fill="#0b0612" stroke="#e7d2ff" stroke-width="4"/><circle cx="500" cy="556" r="10" fill="#b77cff"/>` +
        `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${zap(arcs, 0.6)}</g>` +
        `<path d="${dots(30, 300, 900, 120, 860, 1.5, 4)}" fill="#e7d2ff" opacity=".8"/>`
      , 0.55, 1);
    },
  });

  // ---- 5. Burned Bridges ------------------------------------------------------------------
  def('end_burned', {
    title: 'Burned Bridges',
    w: 1200, h: 900, tags: ['ending', 'chat', 'cold'],
    svg: () => {
      seed(5);
      const B = 'M330 250H870Q930 250 930 310V470Q930 530 870 530H400Q370 560 320 572Q350 540 340 512Q300 500 300 470V310Q300 250 360 250Z';
      return svg(
        lg('bg', [[0, '#070c1c'], [0.55, '#11223e'], [0.8, '#1b3656'], [0.92, '#2c4a66'], [1, '#e8a274']]) +
        lg('bub', [[0, '#9fc2ff', 0.16], [1, '#9fc2ff', 0.04]], 0, 0, 1, 1) +
        rg('dawn', [[0, '#ffc08a', 0.8], [1, '#ffc08a', 0]]) +
        rg('cold', [[0, '#8fb6ff', 0.25], [1, '#8fb6ff', 0]]),
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<circle cx="600" cy="390" r="460" fill="url(#cold)"/>` +
        `<path d="${dots(90, 0, 1200, 0, 760, 1, 3)}" fill="#cfe0ff" opacity=".35"/>` +
        // the empty bubble
        `<path d="${B}" fill="#000" opacity=".25" transform="translate(12 18)"/>` +
        `<path d="${B}" fill="url(#bub)" stroke="#a9c8ff" stroke-width="4" stroke-opacity=".55"/>` +
        `<path d="M340 300Q340 280 366 280H600" stroke="#fff" stroke-width="5" opacity=".2" stroke-linecap="round" fill="none"/>` +
        `<g fill="#cfe0ff"><circle cx="560" cy="390" r="16" opacity=".22"/><circle cx="615" cy="390" r="16" opacity=".12"/><circle cx="670" cy="390" r="16" opacity=".05"/></g>` +
        text(930, 580, 'Read 2:14 AM', { size: 26, fill: '#8fa6c8', anchor: 'end', op: 0.7 }) +
        // far horizon at dawn, Gusu hills, a car leaving
        `<ellipse cx="600" cy="800" rx="700" ry="120" fill="url(#dawn)" opacity=".7"/>` +
        `<path d="M0 790C120 760 220 740 330 770C430 720 520 730 620 770C720 730 830 720 930 760C1020 740 1110 750 1200 770V900H0Z" fill="#0d1a2c"/>` +
        `<path d="M0 820C300 800 900 800 1200 820V900H0Z" fill="#081220"/>` +
        `<path d="M600 812L1200 860" stroke="#3a5272" stroke-width="3" opacity=".7"/>` +
        `<circle cx="760" cy="826" r="4" fill="#fff2c8"/><circle cx="772" cy="827" r="4" fill="#fff2c8"/><path d="M776 827L900 812V842Z" fill="#fff2c8" opacity=".25"/>`
      , 0.55, 1);
    },
  });

  // ---- 6. #KoiPondGate --------------------------------------------------------------------
  def('end_koigate', {
    title: '#KoiPondGate',
    w: 1200, h: 900, tags: ['ending', 'koi', 'trending'],
    svg: () => {
      seed(6);
      const bend = (x, y) => [x, y + 0.0016 * x * x];
      const P = (x, y) => bend(x, y).map(f).join(' ');
      const KOI = `M${P(110, 0)}C${P(106, -26)} ${P(76, -38)} ${P(24, -36)}C${P(-24, -34)} ${P(-64, -18)} ${P(-94, -6)}C${P(-114, -22)} ${P(-142, -38)} ${P(-160, -28)}C${P(-146, -10)} ${P(-146, 10)} ${P(-160, 28)}C${P(-142, 38)} ${P(-114, 22)} ${P(-94, 6)}C${P(-64, 18)} ${P(-24, 34)} ${P(24, 36)}C${P(76, 38)} ${P(106, 26)} ${P(110, 0)}Z`;
      const koi = (x, y, a, body, spot) =>
        `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${KOI}" fill="#000" opacity=".3" transform="translate(10 16)"/><path d="${KOI}" fill="${body}"/>` +
        (spot ? `<ellipse cx="30" cy="-6" rx="34" ry="20" fill="${spot}"/><ellipse cx="-50" cy="8" rx="26" ry="16" fill="${spot}"/>` : '') +
        `<circle cx="${bend(88, -14)[0]}" cy="${f(bend(88, -14)[1])}" r="4" fill="#151515"/><circle cx="${bend(88, 14)[0]}" cy="${f(bend(88, 14)[1])}" r="4" fill="#151515"/></g>`;
      let ripples = '';
      for (let i = 1; i < 6; i++) ripples += `<ellipse cx="600" cy="640" rx="${170 + i * 60}" ry="${110 + i * 40}" fill="none" stroke="#9fd8ff" stroke-width="3" opacity="${r1(0.32 - i * 0.05)}"/>`;
      let gold = '';
      for (let i = 0; i < 26; i++) {
        const x = rr(0, 1200), y = rr(0, 900), L = rr(30, 120);
        gold += `M${f(x)} ${f(y)}q${f(L / 4)} -6 ${f(L / 2)} 0t${f(L / 2)} 0`;
      }
      const flame = 'M0-34C14-18 22-4 18 10C14 24 4 30-6 30C-18 28-24 16-20 2C-18-6-12-10-10-18C-6-10-2-6 2-6C4-16 2-24 0-34Z';
      return svg(
        rg('water', [[0, '#14505e'], [0.6, '#0a2a36'], [1, '#03121a']], 0.5, 0.6, 0.8) +
        lg('car', [[0, '#5b3fa6'], [1, '#2a1a55']], 0, 0, 1, 1) +
        lg('glass', [[0, '#3a4a6a'], [1, '#121a2a']], 0, 0, 1, 1) +
        lg('kg', [[0, '#ffd36a'], [1, '#f08a1c']], 0, 0, 1, 1) +
        lg('fl', [[0, '#ffd54a'], [1, '#ff4a1c']]) +
        lg('card', [[0, '#ffffff', 0.2], [1, '#ffffff', 0.1]]),
        `<rect width="1200" height="900" fill="url(#water)"/>` +
        `<path d="${gold}" stroke="#ffcf6a" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>` +
        ripples +
        // sunken car roof
        `<g transform="translate(600 640) rotate(-12)">` +
        `<rect x="-220" y="-120" width="440" height="240" rx="70" fill="#000" opacity=".35" transform="translate(14 20)"/>` +
        `<rect x="-220" y="-120" width="440" height="240" rx="70" fill="url(#car)"/>` +
        `<path d="M-200-60Q-170-110-110-112H-60V112H-110Q-170 110-200 60Z" fill="url(#glass)"/><path d="M200-50Q186-100 140-108H110V108H140Q186 100 200 50Z" fill="url(#glass)"/>` +
        `<rect x="-20" y="-60" width="100" height="120" rx="14" fill="#1a1238"/><path d="M-180-50Q-150-90-100-96" stroke="#fff" stroke-width="6" fill="none" opacity=".35" stroke-linecap="round"/>` +
        `<path d="M-230 40C-160 70-40 90 60 80S200 40 240 30V140H-230Z" fill="#0a2a36" opacity=".55"/>` +
        `</g>` +
        // Fairy's paw prints? no — the koi, unbothered
        koi(250, 560, -30, '#fbf7f0', '#e8452c') + koi(940, 720, 160, 'url(#kg)', '') + koi(330, 800, 20, '#ff8a2a', '#fff2e0') + koi(1000, 420, -150, '#fbf7f0', '#151515') + koi(170, 330, 60, 'url(#kg)', '#fff6e6') +
        `<path d="${dots(20, 100, 1100, 300, 880, 3, 7)}" fill="none" stroke="#bfe6ff" stroke-width="2" opacity=".5"/>` +
        // trending card
        `<g transform="translate(600 170)">` +
        `<rect x="-330" y="-96" width="660" height="192" rx="36" fill="#000" opacity=".25" transform="translate(0 12)"/>` +
        `<rect x="-330" y="-96" width="660" height="192" rx="36" fill="url(#card)" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>` +
        `<circle cx="-246" cy="0" r="56" fill="#fff" opacity=".12"/><path d="${flame}" fill="url(#fl)" transform="translate(-246 0) scale(1.5)"/>` +
        text(-170, -34, 'TRENDING IN LANLING · #1', { size: 24, fill: '#cfe6f0', ls: 3, weight: 600 }) +
        text(-172, 30, '#KoiPondGate', { size: 66, fill: '#ffffff', weight: 800 }) +
        text(-170, 72, '1.2M posts', { size: 24, fill: '#cfe6f0', op: 0.85 }) +
        `<path d="M-26 64l14-16 14 16" stroke="#7dff9a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        `</g>` +
        // floating reactions
        `<g fill="#ff4a6a"><path d="M1040 260c-12-18-40-6-26 14l26 22 26-22c14-20-14-32-26-14Z" opacity=".9"/><path d="M150 210c-8-12-26-4-17 9l17 15 17-15c9-13-9-21-17-9Z" opacity=".7"/></g>` +
        `<g fill="#fff"><path d="M1080 330l6 14 14 6-14 6-6 14-6-14-14-6 14-6Z" opacity=".8"/><path d="M110 120l5 12 12 5-12 5-5 12-5-12-12-5 12-5Z" opacity=".7"/></g>`
      , 0.5, 0.95);
    },
  });

  // ---- 7. Fairy's New Favorite ------------------------------------------------------------
  def('end_fairy', {
    title: "Fairy's New Favorite",
    w: 1200, h: 900, tags: ['ending', 'dog', 'fairy', 'rain'],
    svg: () => {
      seed(7);
      let drops = '', spray = '', rain = '';
      for (let i = 0; i < 30; i++) {
        const a = rr(-3.1, 0.1), r = rr(330, 470), x = 600 + Math.cos(a) * r * 1.1, y = 460 + Math.sin(a) * r * 0.8;
        spray += `M${f(x)} ${f(y)}l${f(Math.cos(a) * 26)} ${f(Math.sin(a) * 26)}`;
      }
      for (let i = 0; i < 26; i++) {
        const x = rr(380, 820), y = rr(560, 760);
        drops += `M${f(x)} ${f(y)}c-6 10-6 16 0 18c6-2 6-8 0-18Z`;
      }
      for (let i = 0; i < 60; i++) {
        const x = rr(0, 1240), y = rr(-40, 900);
        rain += `M${f(x)} ${f(y)}l-10 46`;
      }
      return svg(
        lg('bg', [[0, '#1a1a3a'], [0.6, '#2a2240'], [1, '#120f1e']]) +
        rg('lamp', [[0, '#ffd68a', 0.75], [0.4, '#ffb45a', 0.25], [1, '#ffb45a', 0]]) +
        lg('fur', [[0, '#3a3c52'], [0.5, '#1c1c28'], [1, '#0e0e14']], 0.2, 0, 0.8, 1) +
        lg('ground', [[0, '#2a2236'], [1, '#0e0b14']]) +
        rg('iris', [[0, '#e2a456'], [0.7, '#94591f'], [1, '#4a2a0e']]) +
        lg('gold', [[0, '#ffd45a'], [1, '#c98206']]) +
        lg('sleeve', [[0, '#26262c'], [1, '#0c0c10']]),
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<circle cx="980" cy="60" r="620" fill="url(#lamp)"/>` +
        `<path d="M960 0V40" stroke="#3a3048" stroke-width="10"/><rect x="930" y="40" width="60" height="22" rx="8" fill="#3a3048"/><ellipse cx="960" cy="64" rx="24" ry="8" fill="#fff4d6"/>` +
        `<path d="M0 700H1200V900H0Z" fill="url(#ground)"/>` +
        `<path d="M760 720C860 716 1000 730 1100 760" stroke="#ffcf7a" stroke-width="8" opacity=".25" fill="none" stroke-linecap="round"/><path d="M820 780C900 776 1000 790 1080 812" stroke="#ffcf7a" stroke-width="5" opacity=".2" fill="none" stroke-linecap="round"/>` +
        `<path d="${rain}" stroke="#c9d6ff" stroke-width="2" opacity=".25"/>` +
        `<ellipse cx="600" cy="760" rx="330" ry="40" fill="#000" opacity=".45"/>` +
        // body (sitting), wet spiky fur
        `<path d="M300 800${fluff(600, 640, 300, 230, 180, 360, 30, 34, 'L', 0.5)}L900 800Z" fill="url(#fur)"/>` +
        `<path d="M380 560C420 600 470 640 520 660M820 560C780 600 730 640 680 660M470 700L480 760M730 700L720 760" stroke="#7f87b0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>` +
        // drooping wet ears
        `<path d="M420 300C370 300 330 340 320 400C318 440 340 470 360 460C380 420 410 380 450 360Z" fill="url(#fur)"/>` +
        `<path d="M780 300C830 300 870 340 880 400C882 440 860 470 840 460C820 420 790 380 750 360Z" fill="url(#fur)"/>` +
        // head
        `<path d="${fluff(600, 390, 200, 170, 185, -5, 20, 26, 'M', 0.5)}C800 250 720 200 600 200C480 200 400 250 400 380Z" fill="url(#fur)"/>` +
        `<path d="M500 240C540 222 600 220 660 232" stroke="#9aa2cc" stroke-width="8" fill="none" stroke-linecap="round" opacity=".55"/>` +
        `<path d="M430 320l-10 30M460 300l-6 34M760 320l10 30M740 300l6 34" stroke="#8a92bc" stroke-width="5" stroke-linecap="round" opacity=".5"/>` +
        // collar + tag
        `<path d="M430 540Q600 620 770 540L776 572Q600 656 424 572Z" fill="url(#gold)"/><circle cx="600" cy="620" r="26" fill="#f4f4f8"/><circle cx="600" cy="620" r="17" fill="#e2e2ea"/>` +
        // leash to a tuxedo sleeve
        `<path d="M590 600C480 640 330 660 170 620" stroke="#d6a21a" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<path d="M-40 520L170 580L150 680L-60 640Z" fill="url(#sleeve)"/><path d="M150 576L190 586L172 690L134 682Z" fill="#f4f1ea"/><rect x="156" y="616" width="14" height="14" rx="3" fill="#e2b33a"/>` +
        `<path d="M186 600C220 596 240 612 236 640C232 668 210 686 182 684Z" fill="#f2cbb0"/>` +
        // muzzle, tongue, nose, eyes
        `<ellipse cx="600" cy="440" rx="96" ry="70" fill="#2c2d3c"/>` +
        `<path d="M552 470Q600 520 648 470Q636 506 600 510Q564 506 552 470Z" fill="#3b0e1c"/><path d="M576 486Q600 478 624 486L626 540C626 566 574 566 574 540Z" fill="#ff7f9c"/><path d="M600 490V546" stroke="#e05a7a" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M560 412C560 392 640 392 640 412C640 434 618 448 600 448C582 448 560 434 560 412Z" fill="#08080c"/><ellipse cx="586" cy="404" rx="14" ry="7" fill="#8a8fae"/>` +
        `<circle cx="526" cy="350" r="30" fill="url(#iris)"/><circle cx="528" cy="352" r="18" fill="#0c0806"/><circle cx="536" cy="340" r="10" fill="#fff"/><circle cx="518" cy="362" r="4" fill="#fff"/>` +
        `<circle cx="674" cy="350" r="30" fill="url(#iris)"/><circle cx="676" cy="352" r="18" fill="#0c0806"/><circle cx="684" cy="340" r="10" fill="#fff"/><circle cx="666" cy="362" r="4" fill="#fff"/>` +
        `<path d="M492 304C506 292 528 290 546 296M708 304C694 292 672 290 654 296" stroke="#7d84aa" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>` +
        // water: drips and spray
        `<path d="${drops}" fill="#bcd6ff" opacity=".8"/>` +
        `<path d="${spray}" stroke="#d6e6ff" stroke-width="6" stroke-linecap="round" opacity=".6"/>` +
        `<path d="${dots(40, 220, 980, 120, 700, 3, 8)}" fill="#d6e6ff" opacity=".65"/>`
      , 0.5, 0.95);
    },
  });

  // ---- 8. Unsent --------------------------------------------------------------------------
  def('end_unsent', {
    title: 'Unsent',
    w: 1200, h: 900, tags: ['ending', 'memo', 'light'],
    svg: () => {
      seed(8);
      let bars = '', parts = '';
      const N = 64;
      let prev = 0.3;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1), env = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.8 + 0.2;
        prev = prev * 0.45 + rr(0.15, 1) * 0.55;
        const hgt = 24 + prev * env * 300, x = 150 + i * 14.2;
        if (t < 0.72) bars += `M${f(x)} ${f(450 - hgt / 2)}V${f(450 + hgt / 2)}`;
        else {
          const k = (t - 0.72) / 0.28;
          for (let j = 0; j < 5; j++) {
            const yy = 450 + rr(-hgt / 2, hgt / 2) - k * rr(40, 260), xx = x + k * rr(10, 120);
            parts += `M${f(xx)} ${f(yy)}a${r1(4 - k * 2.5)} ${r1(4 - k * 2.5)} 0 1 0 .1 0`;
          }
        }
      }
      return svg(
        lg('bg', [[0, '#0e0a24'], [0.55, '#2a1c44'], [0.85, '#6a3a5a'], [1, '#f2a46a']], 0, 0, 1, 0) +
        rg('sun', [[0, '#fff3d0', 1], [0.25, '#ffd08a', 0.6], [1, '#ff9a6a', 0]]) +
        `<linearGradient id="wave" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="1060" y2="0">${stops([[0, '#6a5a96'], [0.45, '#b49ad6'], [0.75, '#ffe6c0'], [1, '#fff8e8']])}</linearGradient>`,
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<circle cx="1180" cy="440" r="560" fill="url(#sun)"/>` +
        `<path d="M1180 440L-20 300V580Z" fill="#ffe6c0" opacity=".05"/><path d="M1180 440L-20 140V260Z" fill="#ffe6c0" opacity=".04"/>` +
        `<path d="M150 450H1060" stroke="#fff" stroke-width="2" opacity=".12"/>` +
        `<path d="${bars}" stroke="url(#wave)" stroke-width="8.5" stroke-linecap="round"/>` +
        `<path d="${parts}" fill="#fff6e0" opacity=".85"/>` +
        `<path d="M430 220V680" stroke="#ff6b6b" stroke-width="3" opacity=".85"/><circle cx="430" cy="214" r="9" fill="#ff6b6b"/>` +
        text(150, 760, 'Untitled 14', { size: 34, fill: '#fff', op: 0.82, weight: 600 }) +
        text(150, 800, 'Guanyin Temple Rd · 1:12', { size: 24, fill: '#cbb8e8', op: 0.75 })
      , 0.5, 0.9);
    },
  });

  // ---- 9. Lotus Pier, Reunited ------------------------------------------------------------
  def('end_reunited', {
    title: 'Lotus Pier, Reunited',
    w: 1200, h: 900, tags: ['ending', 'soup', 'lotus-pier'],
    svg: () => {
      seed(9);
      const bowl = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        `<ellipse cx="6" cy="62" rx="92" ry="20" fill="#000" opacity=".35"/>` +
        `<path d="M-84 0C-80 50-40 74 0 74C40 74 80 50 84 0Z" fill="url(#bw)"/>` +
        `<path d="M-74 22C-60 50-30 62 0 62" stroke="#3f6fb0" stroke-width="4" fill="none" opacity=".7"/>` +
        `<ellipse rx="84" ry="24" fill="#f6f1e8"/><ellipse rx="74" ry="19" fill="url(#soup)"/>` +
        `<ellipse cx="-16" cy="2" rx="24" ry="9" fill="#efd8c6"/><g fill="#c49470"><circle cx="-24" cy="1" r="3"/><circle cx="-12" cy="0" r="3"/><circle cx="-16" cy="5" r="3"/></g>` +
        `<ellipse cx="22" cy="-2" rx="20" ry="8" fill="#b77a5e"/><circle cx="40" cy="6" r="4" fill="#d93a22"/><circle cx="-40" cy="-6" r="3" fill="#6fae3c"/>` +
        `</g>` + wisp(x, y - 10 * s, 150 * s, 14 * s, 0.9);
      let lanterns = '';
      for (const [x, y] of [[180, 120], [440, 150], [760, 150], [1020, 120]]) {
        lanterns += `<path d="M${x} 0V${y - 40}" stroke="#2a1410" stroke-width="3"/><circle cx="${x}" cy="${y}" r="120" fill="url(#lglow)"/>` +
          `<ellipse cx="${x}" cy="${y}" rx="34" ry="42" fill="url(#lant)"/><rect x="${x - 18}" y="${y - 50}" width="36" height="10" rx="3" fill="#3a1a10"/><rect x="${x - 18}" y="${y + 40}" width="36" height="10" rx="3" fill="#3a1a10"/><path d="M${x} ${y + 50}v26" stroke="#e8b84a" stroke-width="4"/>`;
      }
      let balust = '';
      for (let x = 30; x < 1200; x += 60) balust += `M${x} 560V620`;
      return svg(
        lg('sky', [[0, '#3a3576'], [0.35, '#b46a8a'], [0.6, '#f2a05e'], [0.75, '#ffd28a']]) +
        lg('lake', [[0, '#f0b27a'], [0.4, '#b57a7a'], [1, '#4a3a5a']]) +
        rg('lglow', [[0, '#ffb44a', 0.5], [1, '#ffb44a', 0]]) +
        rg('lant', [[0, '#ffd27a'], [0.6, '#e8482a'], [1, '#a81e14']], 0.4, 0.4, 0.6) +
        lg('table', [[0, '#9a6440'], [1, '#6a3e24']]) +
        lg('edge', [[0, '#5a321e'], [1, '#2e180c']]) +
        lg('bw', [[0, '#ffffff'], [1, '#d8d2c8']], 0, 0, 1, 0) +
        rg('soup', [[0, '#f6cf8a'], [1, '#d9944a']], 0.45, 0.4, 0.6) +
        lg('pot', [[0, '#6a4a3a'], [1, '#2e1e16']], 0, 0, 1, 0) +
        lg('pk', [[0, '#fff2f4'], [1, '#f08aaa']], 0, 1, 0, 0),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<circle cx="600" cy="440" r="70" fill="#fff0c8" opacity=".9"/>` +
        `<path d="M0 450C160 430 300 420 420 440C560 410 700 412 820 440C960 420 1080 425 1200 445V480H0Z" fill="#7a4a6a" opacity=".6"/>` +
        `<rect y="470" width="1200" height="200" fill="url(#lake)"/>` +
        `<path d="M560 486h80M540 504h120M570 522h60" stroke="#fff3c8" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
        leaf(120, 520, 90, 18, '#3a5a3a', '#f2c08a') + leaf(330, 540, 70, 14, '#34503a', '#f2c08a') + leaf(880, 530, 90, 18, '#3a5a3a', '#f2c08a') + leaf(1090, 545, 80, 16, '#34503a', '#f2c08a') +
        lotus(250, 520, 0.28, 'url(#pk)', '#d9839c') + lotus(980, 520, 0.3, 'url(#pk)', '#d9839c') +
        // railing
        `<path d="M0 556H1200M0 616H1200" stroke="#4a2418" stroke-width="12"/><path d="${balust}" stroke="#4a2418" stroke-width="10"/>` +
        // table
        `<ellipse cx="600" cy="760" rx="520" ry="170" fill="url(#edge)"/>` +
        `<ellipse cx="600" cy="730" rx="520" ry="170" fill="url(#table)"/>` +
        `<path d="M160 700C300 640 500 620 700 626" stroke="#c48a5a" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/>` +
        // pot
        `<ellipse cx="600" cy="676" rx="110" ry="30" fill="#000" opacity=".3"/>` +
        `<path d="M500 600C500 660 540 690 600 690C660 690 700 660 700 600Z" fill="url(#pot)"/><ellipse cx="600" cy="600" rx="100" ry="26" fill="#3a2418"/><ellipse cx="600" cy="602" rx="88" ry="20" fill="url(#soup)"/>` +
        wisp(600, 590, 260, 24) +
        // five bowls
        bowl(380, 660, 0.85) + bowl(820, 660, 0.85) + bowl(300, 770, 1.05) + bowl(900, 770, 1.05) + bowl(600, 820, 1.2) +
        `<path d="M700 870L860 820M712 880L872 830" stroke="#2a1a12" stroke-width="7" stroke-linecap="round"/>` +
        // pavilion frame
        `<path d="M0 0H1200V40H0Z" fill="#3a1a10"/><rect x="0" y="0" width="60" height="900" fill="#4a2014"/><rect x="1140" y="0" width="60" height="900" fill="#4a2014"/>` +
        lanterns
      , 0.5, 0.95);
    },
  });

  // ---- 10. Tea at the Hanshi --------------------------------------------------------------
  def('end_tea', {
    title: 'Tea at the Hanshi',
    w: 1200, h: 900, tags: ['ending', 'tea', 'lxc'],
    svg: () => {
      seed(10);
      let lattice = '';
      for (let x = 120; x <= 1080; x += 80) lattice += `M${x} 40V520`;
      for (let y = 40; y <= 520; y += 80) lattice += `M120 ${y}H1080`;
      let bamboo = '';
      for (let i = 0; i < 9; i++) {
        const x = 140 + i * 120 + rr(-30, 30);
        bamboo += `<path d="M${f(x)} 40V520" stroke="#9cbf8a" stroke-width="${f(rr(14, 22))}" opacity=".55"/><path d="M${f(x - 12)} ${f(rr(120, 200))}H${f(x + 12)}M${f(x - 12)} ${f(rr(300, 400))}H${f(x + 12)}" stroke="#86ab76" stroke-width="4" opacity=".6"/>`;
      }
      let leaves = '';
      for (let i = 0; i < 16; i++) {
        const x = rr(140, 1060), y = rr(60, 480), a = rr(-60, 60);
        leaves += `<path d="M0 0C20-10 60-10 90 0C60 10 20 10 0 0Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"/>`;
      }
      const cup = (x, y) =>
        `<g transform="translate(${x} ${y})"><ellipse cx="10" cy="118" rx="130" ry="22" fill="#000" opacity=".35"/>` +
        `<path d="M-104 0C-100 74-60 118 0 118C60 118 100 74 104 0Z" fill="url(#cup)"/>` +
        `<path d="M-90 30C-80 70-50 98-10 104" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>` +
        `<ellipse rx="104" ry="26" fill="#eef4f0"/><ellipse rx="92" ry="20" fill="url(#tea)"/><ellipse cx="-24" cy="-4" rx="30" ry="6" fill="#fff" opacity=".35"/></g>`;
      // two steam ribbons twining into each other
      const s1 = 'M490 620C470 540 560 500 600 440C640 380 560 330 600 270C630 220 700 200 690 140';
      const s2 = 'M710 620C730 540 640 500 600 440C560 380 640 330 600 270C570 220 500 200 510 140';
      const soft = (d) => `<path d="${d}" stroke-width="54" opacity=".05"/><path d="${d}" stroke-width="28" opacity=".1"/><path d="${d}" stroke-width="10" opacity=".25"/>`;
      return svg(
        lg('wall', [[0, '#e9efe0'], [1, '#c9d6bc']]) +
        lg('frame', [[0, '#5a3a26'], [1, '#3a2416']]) +
        lg('wood', [[0, '#5a3828'], [0.4, '#3e2418'], [1, '#22130c']]) +
        lg('cup', [[0, '#ffffff'], [0.6, '#e8efe8'], [1, '#bccbc0']], 0, 0, 1, 0) +
        rg('tea', [[0, '#e8d48a'], [1, '#b99a3a']], 0.45, 0.4, 0.6) +
        lg('beam', [[0, '#fff8e0', 0.45], [1, '#fff8e0', 0]], 0, 0, 1, 1) +
        lg('pot', [[0, '#9a5a3a'], [1, '#5a2e1a']], 0, 0, 1, 0) +
        lg('pet', [[0, '#ffffff'], [1, '#f6e4e0']], 0, 1, 0, 0),
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        bamboo + `<g fill="#86ab76" opacity=".55">${leaves}</g>` +
        `<path d="${lattice}" stroke="url(#frame)" stroke-width="10"/>` +
        `<rect x="110" y="30" width="980" height="500" fill="none" stroke="url(#frame)" stroke-width="22"/>` +
        `<path d="M0 0H1200V30H0ZM0 530H1200V560H0Z" fill="#4a2e1e"/>` +
        `<path d="M200 30L520 30L980 900L520 900ZM620 30L700 30L1120 900L1020 900Z" fill="url(#beam)"/>` +
        `<path d="M0 560H1200V900H0Z" fill="url(#wood)"/>` +
        `<path d="M0 600C300 590 700 596 1200 610M0 700C400 690 800 700 1200 716M0 810C400 800 800 812 1200 826" stroke="#6a4430" stroke-width="3" fill="none" opacity=".5"/>` +
        // teapot (left edge) and peony (right)
        `<g transform="translate(110 660)"><ellipse cx="10" cy="120" rx="150" ry="24" fill="#000" opacity=".35"/><path d="M-120 20C-130 90-80 124 0 124C80 124 130 90 120 20C110-30 60-50 0-50C-60-50-110-30-120 20Z" fill="url(#pot)"/><path d="M120 30C160 10 180-10 196-40" stroke="#7a4228" stroke-width="20" fill="none" stroke-linecap="round"/><ellipse cy="-50" rx="50" ry="14" fill="#6a3620"/><circle cy="-66" r="12" fill="#6a3620"/></g>` +
        `<g transform="translate(1080 640)"><path d="M-40 140C-50 60-30 20 0 0C30 20 50 60 40 140Z" fill="#dfe8e2"/><path d="M0 0C-10-40-20-60-30-90M0 0C10-30 30-50 50-60" stroke="#5a8a4a" stroke-width="6" fill="none"/>` +
        lotus(-28, -96, 0.5, 'url(#pet)', '#e2c8c4') + `<circle cx="-28" cy="-150" r="10" fill="#f6d36a"/></g>` +
        cup(490, 660) + cup(710, 660) +
        `<g fill="none" stroke="#fff" stroke-linecap="round">${soft(s1)}${soft(s2)}</g>`
      , 0.45, 0.85);
    },
  });

  // ---- 11. Jiujiu of the Year -------------------------------------------------------------
  def('end_jl_hero', {
    title: 'Jiujiu of the Year',
    w: 1200, h: 900, tags: ['ending', 'birthday', 'bell'],
    svg: () => {
      seed(11);
      let bok = '';
      for (let i = 0; i < 26; i++) bok += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 520))}" r="${f(rr(20, 70))}" fill="#ffc86a" opacity="${r1(rr(0.06, 0.22))}"/>`;
      const flame = (x, y, s) =>
        `<g transform="translate(${x} ${y}) scale(${s})"><circle r="70" fill="url(#cglow)"/><path d="M0-40C14-22 18-6 12 6C8 14 4 16 0 16C-4 16-8 14-12 6C-18-6-14-22 0-40Z" fill="url(#flame)"/><path d="M0-14C5-6 6 2 0 8C-6 2-5-6 0-14Z" fill="#fff"/></g>`;
      let thin = '';
      for (const [x, y] of [[470, 396], [520, 380], [680, 380], [730, 396], [430, 420], [770, 420]]) thin += `<rect x="${x - 5}" y="${y - 60}" width="10" height="60" rx="3" fill="#f3e6ff"/><path d="M${x - 5} ${y - 50}l10-8M${x - 5} ${y - 30}l10-8" stroke="#b07ae8" stroke-width="3"/>` + flame(x, y - 66, 0.55);
      let eng = '';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        eng += `<path transform="rotate(${f((a * 180) / Math.PI)})" d="M0-8C10-30 10-48 0-58C-10-48-10-30 0-8Z"/>`;
      }
      return svg(
        rg('bg', [[0, '#5a3418'], [0.5, '#2a160c'], [1, '#0e0705']], 0.5, 0.3, 0.8) +
        rg('cglow', [[0, '#ffe2a0', 0.65], [1, '#ffb44a', 0]]) +
        lg('flame', [[0, '#ffb43a'], [0.6, '#ffe28a'], [1, '#fff6d8']], 0, 1, 0, 0) +
        lg('cake', [[0, '#fbefd2'], [1, '#e6c98e']], 0, 0, 1, 0) +
        lg('top', [[0, '#fff7e6'], [1, '#f2dfb2']]) +
        lg('num', [[0, '#fff1b8'], [0.5, '#f2c14e'], [1, '#c98a1c']], 0, 0, 1, 0) +
        rg('silver', [[0, '#ffffff'], [0.35, '#dfe3ea'], [0.75, '#9aa2b0'], [1, '#5a6070']], 0.35, 0.3, 0.75) +
        lg('vel', [[0, '#5b2d8a'], [1, '#2a1240']]) +
        lg('pk', [[0, '#fff2f4'], [1, '#f08aaa']], 0, 1, 0, 0),
        `<rect width="1200" height="900" fill="url(#bg)"/>` + bok +
        // velvet
        `<path d="M0 700C200 660 400 690 600 670C800 650 1000 680 1200 660V900H0Z" fill="url(#vel)"/>` +
        `<path d="M100 760C300 720 420 780 600 740M640 780C800 740 960 790 1140 750" stroke="#8a5ac0" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/>` +
        // cake (two tiers)
        `<ellipse cx="600" cy="660" rx="290" ry="60" fill="#000" opacity=".35"/>` +
        `<path d="M330 520V630C330 664 450 690 600 690C750 690 870 664 870 630V520Z" fill="url(#cake)"/>` +
        `<ellipse cx="600" cy="520" rx="270" ry="56" fill="url(#top)"/>` +
        `<path d="M330 560C380 580 420 560 460 584C500 604 540 578 600 596C660 612 700 584 740 600C790 618 830 586 870 566" stroke="#f6e3b4" stroke-width="16" fill="none" stroke-linecap="round"/>` +
        `<path d="M420 430V510C420 530 500 546 600 546C700 546 780 530 780 510V430Z" fill="url(#cake)"/><ellipse cx="600" cy="430" rx="180" ry="38" fill="url(#top)"/>` +
        lotus(600, 440, 0.42, 'url(#pk)', '#d9839c') +
        `<g fill="#fff7e6">${[360, 420, 480, 540, 600, 660, 720, 780, 840].map((x) => `<circle cx="${x}" cy="${f(552 - Math.abs(x - 600) * 0.06)}" r="9"/>`).join('')}</g>` +
        thin +
        // number candles 1 8
        `<g transform="translate(560 330)"><path d="M-14-60L14-80V40H-14Z" fill="url(#num)"/></g>` + flame(564, 228, 0.9) +
        `<g transform="translate(640 330)"><path d="M0-80C30-80 40-62 40-46C40-34 34-26 24-20C38-14 46-2 46 14C46 34 30 44 0 44C-30 44-46 34-46 14C-46-2-38-14-24-20C-34-26-40-34-40-46C-40-62-30-80 0-80ZM0-62C-12-62-16-54-16-46C-16-36-8-30 0-30C8-30 16-36 16-46C16-54 12-62 0-62ZM0-10C-14-10-22-2-22 10C-22 20-14 26 0 26C14 26 22 20 22 10C22-2 14-10 0-10Z" fill="url(#num)" fill-rule="evenodd"/></g>` + flame(640, 228, 0.9) +
        // silver bell + purple tassel
        `<g transform="translate(600 770)">` +
        `<ellipse cx="10" cy="72" rx="110" ry="18" fill="#000" opacity=".45"/>` +
        `<path d="M70-60C110-40 140 0 150 60M84-56C130-30 170 10 186 70" stroke="#7a3ac8" stroke-width="7" fill="none"/>` +
        `<path d="M136 56L120 140H200L172 56Z" fill="#7a3ac8"/><path d="M136 70L128 140M152 70L150 140M168 70L174 140M184 70L192 140" stroke="#a87ae8" stroke-width="3"/><rect x="132" y="48" width="46" height="18" rx="6" fill="#e2b33a"/>` +
        `<circle cy="-92" r="22" fill="none" stroke="url(#silver)" stroke-width="12"/>` +
        `<circle r="86" fill="url(#silver)"/>` +
        `<path d="M-70 20C-30 34 30 34 70 20" stroke="#5a6070" stroke-width="8" fill="none" stroke-linecap="round"/><circle cy="40" r="10" fill="#2a2e38"/><path d="M0 40V64" stroke="#2a2e38" stroke-width="8" stroke-linecap="round"/>` +
        `<g transform="translate(0 -24) scale(.7)" fill="none" stroke="#8a92a2" stroke-width="5">${eng}</g>` +
        `<ellipse cx="-30" cy="-40" rx="26" ry="14" fill="#fff" opacity=".7"/><ellipse cx="40" cy="-10" rx="10" ry="18" fill="#ffd27a" opacity=".45"/>` +
        `</g>` +
        `<path d="${dots(30, 200, 1000, 120, 640, 1.5, 3.5)}" fill="#ffe8b0" opacity=".8"/>`
      , 0.5, 0.9);
    },
  });

  // ---- 12. Group Chat Legend --------------------------------------------------------------
  def('end_legend', {
    title: 'Group Chat Legend',
    w: 1200, h: 900, tags: ['ending', 'chat', 'dogs'],
    svg: () => {
      seed(12);
      const bub = (x, y, w, h, blue, rot, inner) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(h / 2, 40)}" fill="#000" opacity=".2" transform="translate(6 10)"/>` +
        `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(h / 2, 40)}" fill="${blue ? 'url(#blue)' : '#ecebf2'}"/>` +
        `<path d="${blue ? `M${w / 2 - 30} ${h / 2 - 16}q20 18 36 18q-14-10-12-30` : `M${-w / 2 + 30} ${h / 2 - 16}q-20 18-36 18q14-10 12-30`}" fill="${blue ? '#2f7cf6' : '#ecebf2'}"/>${inner}</g>`;
      const thumb = `<path d="M-30 18C-32 2-30-10-20-18C-14-24-12-32-12-42C-12-52 0-54 4-46C8-38 6-28 2-20H24C34-20 36-10 30-4C38-2 38 8 30 12C36 16 34 26 28 28C32 34 28 42 20 42H-14C-24 42-28 32-30 18Z" fill="#ffc83a" stroke="#c98a14" stroke-width="3"/><rect x="-46" y="-8" width="16" height="50" rx="4" fill="#ffc83a" stroke="#c98a14" stroke-width="3"/>`;
      let rain = '', conf = '';
      const falls = [[90, 120, 0.9, -18], [300, 60, 0.7, 12], [520, 200, 0.6, -6], [1100, 90, 0.9, 20], [880, 230, 0.7, -14], [160, 520, 0.8, 16], [1040, 540, 1, -20], [420, 760, 0.7, 8], [780, 800, 0.8, -10], [980, 380, 0.55, 30], [250, 330, 0.55, -30], [640, 60, 0.5, 4], [60, 760, 0.7, 24], [1150, 780, 0.6, -8]];
      for (const [x, y, s, r] of falls) rain += `<path d="M${x} ${y - 70 * s}v-${f(90 * s)}" stroke="#fff" stroke-width="4" opacity=".25" stroke-linecap="round"/><use href="#${(x + y) % 3 ? 'dog' : 'fairy'}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})"/>`;
      const cc = ['#ffd84a', '#ff6aa8', '#7dd8ff', '#b79cff', '#7dff9a'];
      for (let i = 0; i < 46; i++) conf += `<rect x="${f(rr(0, 1200))}" y="${f(rr(0, 900))}" width="${f(rr(8, 16))}" height="${f(rr(14, 26))}" rx="3" fill="${cc[i % 5]}" transform="rotate(${f(rr(0, 180))} ${f(rr(0, 1200))} ${f(rr(0, 900))})" opacity=".85"/>`;
      return svg(
        lg('bg', [[0, '#2a1b5e'], [0.55, '#5b3fa6'], [1, '#d96aa8']], 0, 0, 1, 1) +
        lg('blue', [[0, '#4a94ff'], [1, '#2a6ef0']]) +
        rg('burst', [[0, '#fff', 0.35], [1, '#fff', 0]]) +
        `<g id="dog"><circle r="60" fill="#f2c27a"/><path d="M-52-20C-80-10-84 40-62 54C-50 40-46 10-40-10ZM52-20C80-10 84 40 62 54C50 40 46 10 40-10Z" fill="#a8682e"/><ellipse cy="22" rx="32" ry="24" fill="#fff4e2"/>` +
        `<circle cx="-22" cy="-10" r="8" fill="#2a1a10"/><circle cx="22" cy="-10" r="8" fill="#2a1a10"/><circle cx="-19" cy="-13" r="3" fill="#fff"/><circle cx="25" cy="-13" r="3" fill="#fff"/><ellipse cy="10" rx="12" ry="8" fill="#2a1a10"/><path d="M-6 26Q0 22 6 26V40C6 48-6 48-6 40Z" fill="#ff7f9c"/></g>` +
        `<g id="fairy"><path d="M-46-30L-56-84L-14-50ZM46-30L56-84L14-50Z" fill="#1c1c26"/><circle r="60" fill="#1c1c26"/><ellipse cy="24" rx="30" ry="22" fill="#3a3b4c"/>` +
        `<circle cx="-22" cy="-10" r="9" fill="#c98a3e"/><circle cx="22" cy="-10" r="9" fill="#c98a3e"/><circle cx="-19" cy="-13" r="3" fill="#fff"/><circle cx="25" cy="-13" r="3" fill="#fff"/><ellipse cy="12" rx="12" ry="8" fill="#08080c"/><path d="M-6 28Q0 24 6 28V44C6 52-6 52-6 44Z" fill="#ff7f9c"/></g>`,
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<circle cx="600" cy="450" r="520" fill="url(#burst)"/>` +
        conf + rain +
        bub(330, 300, 300, 92, false, -8, text(0, 12, '400 KG?!', { size: 40, weight: 800, fill: '#1c1c22', anchor: 'middle' })) +
        bub(870, 280, 330, 92, true, 7, text(0, 13, 'SOUP FOR ALL', { size: 38, weight: 800, fill: '#fff', anchor: 'middle' })) +
        bub(600, 470, 420, 190, true, -3, `<use href="#fairy" transform="translate(-90 0) scale(1.05)"/><g transform="translate(90 0) scale(1.4)">${thumb}</g>`) +
        bub(350, 650, 330, 92, false, 6, text(0, 13, 'Dog Friday!!', { size: 38, weight: 800, fill: '#1c1c22', anchor: 'middle' })) +
        bub(860, 660, 300, 92, true, -7, `<g transform="translate(-60 0) scale(.6)">${thumb}</g><g transform="translate(10 0) scale(.6)">${thumb}</g><g transform="translate(80 0) scale(.6)">${thumb}</g>`)
      , 0.4, 0.8);
    },
  });

  // ---- 13. Good Samaritan, Truly ----------------------------------------------------------
  def('end_true', {
    title: 'Good Samaritan, Truly',
    w: 1200, h: 900, tags: ['ending', 'sunrise', 'lotus'],
    svg: () => {
      seed(13);
      let rays = '';
      for (let i = 0; i < 22; i++) {
        const a = Math.PI + (i / 21) * Math.PI, b = a + 0.035;
        rays += `M600 500L${f(600 + 1300 * Math.cos(a))} ${f(500 + 1300 * Math.sin(a))}L${f(600 + 1300 * Math.cos(b))} ${f(500 + 1300 * Math.sin(b))}Z`;
      }
      let glit = '';
      for (let i = 0; i < 46; i++) {
        const y = 520 + Math.pow(rnd(), 1.4) * 380, spread = 40 + (y - 520) * 0.9, wd = rr(10, 40 + (y - 520) * 0.2);
        glit += `M${f(600 + rr(-spread, spread) - wd / 2)} ${f(y)}h${f(wd)}`;
      }
      const kite = (x, y, s, c, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0-40L28 0L0 50L-28 0Z" fill="${c}"/><path d="M0-40V50M-28 0H28" stroke="#fff" stroke-width="2" opacity=".6"/><path d="M0 50C-20 80 20 100 0 130C-20 160 10 180 0 200" stroke="${c}" stroke-width="3" fill="none"/></g>`;
      return svg(
        lg('sky', [[0, '#26245e'], [0.28, '#6a4a8e'], [0.46, '#e07a7e'], [0.56, '#ffb468'], [0.6, '#ffe0a0']]) +
        lg('water', [[0, '#ffcf8a'], [0.2, '#d98a6a'], [0.55, '#6a4a7a'], [1, '#221a3a']]) +
        rg('sun', [[0, '#fffbe8', 1], [0.08, '#fff2c0', 1], [0.25, '#ffd27a', 0.5], [1, '#ff9a5a', 0]]) +
        lg('ray', [[0, '#fff2c0', 0.3], [1, '#fff2c0', 0]]) +
        lg('pk', [[0, '#fff2e8'], [0.6, '#ffc0b8'], [1, '#f07a9a']], 0, 1, 0, 0) +
        lg('lf', [[0, '#3a3a3a'], [1, '#141420']]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<path d="${rays}" fill="#fff2c0" opacity=".12"/>` +
        `<circle cx="600" cy="500" r="760" fill="url(#sun)"/>` +
        `<path d="M120 300C300 286 420 296 520 310M700 270C820 260 960 268 1080 286M200 380C320 372 420 378 480 386" stroke="#ffd9a8" stroke-width="10" opacity=".45" fill="none" stroke-linecap="round"/>` +
        kite(930, 170, 0.9, '#8a5ad8', 12) + kite(1010, 220, 0.6, '#e8483a', -8) +
        `<path d="M300 190l12-7 12 7M330 214l9-5 9 5M760 150l10-6 10 6" stroke="#3a2a4a" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
        `<circle cx="600" cy="500" r="96" fill="#fffbe8"/>` +
        // far shore with Lotus Pier pavilion and dock
        `<path d="M0 492C90 482 170 478 250 484L250 520H0Z" fill="#5a3a5a" opacity=".85"/>` +
        `<path d="M120 420L210 404L300 420L284 424V470H136V424Z" fill="#3a2440"/><path d="M100 424Q210 380 320 424" stroke="#3a2440" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M150 470V500M270 470V500" stroke="#3a2440" stroke-width="8"/>` +
        `<path d="M840 500C940 486 1060 484 1200 494V520H840Z" fill="#5a3a5a" opacity=".7"/>` +
        `<rect y="500" width="1200" height="400" fill="url(#water)"/>` +
        `<path d="${glit}" stroke="#fff3c8" stroke-width="5" stroke-linecap="round" opacity=".75"/>` +
        `<path d="M240 512H560" stroke="#2e1e36" stroke-width="12"/><path d="M270 512v18M340 512v18M410 512v18M480 512v18M550 512v18" stroke="#2e1e36" stroke-width="5"/>` +
        person(456, 506, 34, '#2e1e36') + person(476, 506, 36, '#2e1e36') + person(498, 506, 35, '#2e1e36') + person(520, 506, 30, '#2e1e36') + person(540, 506, 34, '#2e1e36') +
        `<path d="M556 506c4-10 14-12 20-6l6-6 2 10c4 4 2 8-2 8h-24Z" fill="#2e1e36"/>` +
        // foreground lotus, backlit
        `<path d="M90 900C100 820 130 760 160 720M1040 900C1050 830 1070 780 1100 740M220 900C226 840 240 800 262 770" stroke="#1a1a24" stroke-width="8" fill="none"/>` +
        leaf(150, 760, 170, 46, 'url(#lf)', '#ffcf8a') + leaf(1080, 790, 190, 50, 'url(#lf)', '#ffcf8a') + leaf(330, 860, 150, 36, 'url(#lf)', '#ffb87a') + leaf(880, 870, 160, 38, 'url(#lf)', '#ffb87a') +
        lotus(160, 720, 0.7, 'url(#pk)', '#ffd9c8') + lotus(1100, 740, 0.62, 'url(#pk)', '#ffd9c8') +
        `<path d="M262 770C252 740 262 714 276 700C288 716 290 744 262 770Z" fill="url(#pk)"/>` +
        `<path d="${dots(26, 100, 1100, 420, 860, 1.5, 3.5)}" fill="#fff3c8" opacity=".75"/>`
      , 0.45, 0.85);
    },
  });
})();
