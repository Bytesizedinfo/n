/* Album covers (1000×1000). Fictional titles and artists only. */
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
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .9 0 0 0 -.5" result="l"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.9 0 0 0 .4" result="d"/>` +
    `<feMerge><feMergeNode in="l"/><feMergeNode in="d"/></feMerge></filter>`;
  const svg = (defs, body, g = 0.55) =>
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1000 1000"><defs>${GRAIN}${defs}</defs>${body}<rect width="1000" height="1000" filter="url(#grain)" opacity="${g}"/></svg>`;

  const SERIF = `Didot, 'Bodoni 72', 'Bodoni MT', Baskerville, 'Times New Roman', serif`;
  const SANS = `-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const HEAVY = `'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const CJK = `'Kaiti SC', STKaiti, KaiTi, 'Songti SC', serif`;
  const text = (x, y, s, o) =>
    `<text x="${x}" y="${y}" font-family="${o.font || SANS}" font-size="${o.size}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.italic ? ' font-style="italic"' : ''}` +
    `${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''} fill="${o.fill || '#fff'}"${o.op != null ? ` opacity="${o.op}"` : ''}${o.extra || ''}>${s}</text>`;

  // Glow dot (fireflies, bokeh)
  const dots = (n, x0, x1, y0, y1, r0, r2) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const r = rr(r0, r2), x = rr(x0, x1), y = rr(y0, y1);
      d += `M${f(x + r)} ${f(y)}a${r1(r)} ${r1(r)} 0 1 0 .1 0`;
    }
    return d;
  };

  // A lotus bloom (petals fanned from a base point), front view.
  function lotus(x, y, s, c1, c2, pod) {
    const pet = (a, L, W) =>
      `<path transform="rotate(${a})" d="M0 0C${W} ${-L * 0.25} ${W * 0.7} ${-L * 0.85} 0 ${-L}C${-W * 0.7} ${-L * 0.85} ${-W} ${-L * 0.25} 0 0Z" fill="url(#${c1})" stroke="${c2}" stroke-width="1.5"/>`;
    let p = '';
    for (const a of [-80, 80, -62, 62]) p += pet(a, 120, 44);
    for (const a of [-40, 40, -20, 20]) p += pet(a, 150, 46);
    p += pod ? `<path d="M-40-40C-30-70 30-70 40-40C30-30-30-30-40-40Z" fill="#e2cf5c"/><path d="M-26-50h4M-10-56h4M8-56h4M22-50h4" stroke="#9a8a2a" stroke-width="5" stroke-linecap="round"/>` : '';
    for (const a of [-8, 8]) p += pet(a, 160, 42);
    return `<g transform="translate(${x} ${y}) scale(${s})">${p}</g>`;
  }

  // ---- Lotus Nocturnes --------------------------------------------------------------------
  def('cover_lotus_nocturnes', {
    title: 'Lotus Nocturnes',
    w: 1000, h: 1000, tags: ['cover', 'guqin', 'night'],
    svg: () => {
      seed(4);
      const hui = [1 / 8, 1 / 6, 1 / 5, 1 / 4, 1 / 3, 2 / 5, 1 / 2, 3 / 5, 2 / 3, 3 / 4, 4 / 5, 5 / 6, 7 / 8];
      let strings = '';
      for (let i = 0; i < 7; i++) strings += `M60 ${-42 + i * 14}L860 ${r1(-30 + i * 10)}`;
      const huiDots = hui.map((t) => `<circle cx="${f(60 + 800 * t)}" cy="${r1(-55 + 9 * t)}" r="5.5"/>`).join('');
      let refl = '';
      for (let i = 0; i < 22; i++) {
        const y = 566 + i * 7 + rr(-2, 2), wd = (130 - i * 4.5) * rr(0.3, 1), x = 720 + rr(-50, 50) * (0.3 + i / 30);
        refl += `M${f(x - wd / 2)} ${f(y)}h${f(wd)}`;
      }
      const leaf = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0f3b3a"/><path d="M${x} ${y}L${x + rx * 0.6} ${y - ry * 0.7}" stroke="#05201f" stroke-width="5"/><ellipse cx="${x}" cy="${y - 3}" rx="${rx - 6}" ry="${ry - 5}" fill="none" stroke="#2f6b5e" stroke-width="2" opacity=".6"/>`;
      const GQ = 'M18-72H140Q150-62 162-62Q172-62 180-70L640-60Q652-50 664-50Q676-50 684-58L890-54Q902-54 902-40V40Q902 54 890 54L684 58Q676 50 664 50Q652 50 640 60L180 70Q172 62 162 62Q150 62 140 72H18Q0 72 0 54V-54Q0-72 18-72Z';
      return svg(
        lg('sky', [[0, '#060d22'], [0.45, '#0f2140'], [0.62, '#1d4658']]) +
        lg('pond', [[0, '#123440'], [1, '#04121a']]) +
        rg('halo', [[0, '#fff3cf', 0.45], [0.35, '#ffe9b0', 0.12], [1, '#ffe9b0', 0]]) +
        lg('lacq', [[0, '#5a3626'], [0.3, '#2b1711'], [1, '#0e0605']]) +
        lg('deck', [[0, '#261a14'], [1, '#0c0807']]) +
        lg('pk', [[0, '#fff4f6'], [1, '#f08aaa']], 0, 1, 0, 0) +
        rg('ff', [[0, '#f4ff9a', 0.9], [0.3, '#d8ff6a', 0.35], [1, '#d8ff6a', 0]]),
        `<rect width="1000" height="1000" fill="url(#sky)"/>` +
        `<path d="${dots(46, 0, 1000, 0, 470, 0.8, 2.4)}" fill="#fff" opacity=".7"/>` +
        `<circle cx="720" cy="250" r="330" fill="url(#halo)"/>` +
        `<circle cx="720" cy="250" r="92" fill="#fbf2d7"/><circle cx="694" cy="232" r="16" fill="#efe3c0" opacity=".7"/><circle cx="748" cy="282" r="11" fill="#efe3c0" opacity=".6"/>` +
        // far hills with Cloud Recesses roofs
        `<path d="M0 520C80 470 160 440 260 470C330 430 420 420 500 470C580 440 660 450 740 490C820 470 920 470 1000 500V560H0Z" fill="#0c2233"/>` +
        `<path d="M170 452L210 436L250 452H236V466H184V452Z" fill="#081926"/><path d="M590 452L630 438L670 452H656V466H604V452Z" fill="#081926"/>` +
        `<rect y="540" width="1000" height="460" fill="url(#pond)"/>` +
        `<path d="${refl}" stroke="#fff3cf" stroke-width="4" stroke-linecap="round" opacity=".5"/>` +
        leaf(140, 620, 110, 26) + leaf(420, 600, 80, 18) + leaf(900, 640, 120, 28) + leaf(600, 680, 90, 20) +
        `<path d="M300 640C296 600 300 570 306 540M860 660C858 630 862 610 866 590" stroke="#1d5a4a" stroke-width="5" fill="none"/>` +
        `<path d="M306 540C290 520 296 492 306 480C318 494 322 520 306 540Z" fill="url(#pk)" opacity=".85"/>` +
        lotus(866, 600, 0.42, 'pk', '#d77d98', true) +
        `<path d="${dots(14, 40, 980, 420, 760, 3, 5)}" fill="#efff9a"/>` +
        [[120, 470], [360, 520], [520, 430], [930, 480], [240, 700], [800, 560]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="url(#ff)"/>`).join('') +
        // deck + guqin
        `<path d="M0 740L1000 680V1000H0Z" fill="url(#deck)"/>` +
        `<path d="M0 790L1000 730M0 856L1000 796M0 930L1000 870" stroke="#3a2a20" stroke-width="3" opacity=".6"/>` +
        `<g transform="translate(46 880) rotate(-10)">` +
        `<path d="${GQ}" fill="#000" opacity=".5" transform="translate(14 26)"/>` +
        `<path d="${GQ}" fill="url(#lacq)"/>` +
        `<path d="M20-62H140M190-60L640-52" stroke="#b07a52" stroke-width="3" opacity=".45"/>` +
        `<rect x="54" y="-50" width="10" height="100" rx="3" fill="#d9c08a" opacity=".8"/><rect x="858" y="-46" width="8" height="92" rx="3" fill="#d9c08a" opacity=".7"/>` +
        `<path d="${strings}" stroke="#efe4c8" stroke-width="2.2" opacity=".85"/>` +
        `<g fill="#f6f1e2">${huiDots}</g>` +
        `<path d="M10 40C-20 70-30 110-20 150M24 46C4 80 0 120 10 160" stroke="#c8243a" stroke-width="4" fill="none"/>` +
        `<path d="M-30 150l-8 46h30l-4-46ZM2 160l-6 46h28l-6-46Z" fill="#c8243a"/><circle cx="-20" cy="150" r="8" fill="#e8b84a"/><circle cx="10" cy="160" r="8" fill="#e8b84a"/>` +
        `</g>` +
        // a lotus resting on the deck
        lotus(880, 940, 0.4, 'pk', '#d77d98', false) +
        // type
        text(70, 150, 'Lotus', { font: SERIF, size: 104, fill: '#f4ead2', ls: 2 }) +
        text(70, 250, 'Nocturnes', { font: SERIF, size: 104, fill: '#f4ead2', ls: 2, italic: true }) +
        `<path d="M74 292H360" stroke="#c9b98f" stroke-width="2" opacity=".7"/>` +
        text(74, 332, 'GUQIN · NIGHT RECORDINGS', { size: 22, fill: '#c9b98f', ls: 6 }) +
        `<rect x="372" y="86" width="46" height="46" rx="4" fill="#b8202f"/>` + text(395, 121, '荷', { font: CJK, size: 33, fill: '#fbeee0', anchor: 'middle' })
      , 0.5);
    },
  });

  // ---- Cloud ambient ----------------------------------------------------------------------
  def('cover_cloud_ambient', {
    title: 'Cloud Recesses Ambient',
    w: 1000, h: 1000, tags: ['cover', 'cloud', 'ambient'],
    svg: () => {
      seed(8);
      const ridge = (y0, amp, n, ph) => {
        let d = `M0 ${y0}`;
        for (let i = 0; i <= n; i++) {
          const x = (i / n) * 1000, y = y0 - Math.abs(Math.sin(i * 1.7 + ph)) * amp - rr(0, amp * 0.3);
          d += `Q${f(x - 500 / n)} ${f(y - amp * 0.35)} ${f(x)} ${f(y)}`;
        }
        return d + 'V1000H0Z';
      };
      const band = (y, op) => `<path d="M-50 ${y}C200 ${y - 40} 400 ${y + 20} 620 ${y - 10}S900 ${y - 30} 1050 ${y}V${y + 60}H-50Z" fill="url(#mist)" opacity="${op}"/>`;
      return svg(
        lg('sky', [[0, '#c9daf2'], [0.55, '#f4f2f1'], [1, '#e4def0']]) +
        rg('sun', [[0, '#fff', 1], [0.25, '#fff', 0.7], [1, '#fff', 0]]) +
        lg('m1', [[0, '#c7d2ea'], [1, '#c7d2ea', 0]]) +
        lg('m2', [[0, '#a9b9dc'], [1, '#a9b9dc', 0]]) +
        lg('m3', [[0, '#8b9fcc'], [1, '#e8e6f2', 0.2]]) +
        lg('m4', [[0, '#6d84b8'], [1, '#d8d6ea', 0.4]]) +
        lg('mist', [[0, '#fff', 0], [0.5, '#fff', 0.9], [1, '#fff', 0]]),
        `<rect width="1000" height="1000" fill="url(#sky)"/>` +
        `<circle cx="640" cy="330" r="260" fill="url(#sun)"/><circle cx="640" cy="330" r="64" fill="#fff"/>` +
        `<path d="${ridge(560, 220, 6, 0.4)}" fill="url(#m1)"/>` + band(470, 0.9) +
        `<path d="${ridge(650, 200, 5, 2.1)}" fill="url(#m2)"/>` + band(560, 0.85) +
        // pavilion on a peak
        `<path d="M266 452L300 436L334 452L322 452V470H278V452Z" fill="#7d8fb8"/><path d="M262 454L300 440L338 454" stroke="#7d8fb8" stroke-width="5" fill="none"/>` +
        `<path d="${ridge(780, 210, 4, 3.3)}" fill="url(#m3)"/>` + band(680, 0.8) +
        `<path d="${ridge(930, 160, 5, 5.2)}" fill="url(#m4)"/>` + band(820, 0.7) +
        // crane
        `<g transform="translate(400 250) rotate(-8)"><path d="M0 0C30-40 70-60 110-56C80-40 60-20 40 0C70-6 100 6 120 24C90 22 60 18 30 12Z" fill="#fff"/><path d="M96-58C104-58 112-56 118-52L104-46ZM112 22L122 26L108 30Z" fill="#2a3048"/><path d="M0 0L-26 4M-26 4l-8-4" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="-30" cy="2" r="3" fill="#c8243a"/></g>` +
        `<g transform="translate(520 200) scale(.5) rotate(4)"><path d="M0 0C30-40 70-60 110-56C80-40 60-20 40 0C70-6 100 6 120 24C90 22 60 18 30 12Z" fill="#fff" opacity=".85"/></g>` +
        text(64, 930, 'cloud', { size: 150, weight: 200, fill: '#4e5f88', ls: 22, op: 0.9 }) +
        text(70, 970, 'AMBIENT WORKS FOR STILL MORNINGS', { size: 20, fill: '#4e5f88', ls: 8, op: 0.75 })
      , 0.4);
    },
  });

  // ---- Yiling Laozu & the Radishes -------------------------------------------------------
  def('cover_yiling_flute', {
    title: 'Yiling Laozu & the Radishes',
    w: 1000, h: 1000, tags: ['cover', 'band', 'radish', 'flute'],
    svg: () => {
      seed(12);
      let rays = '';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, b = a + Math.PI / 24;
        rays += `M500 540L${f(500 + 900 * Math.cos(a))} ${f(540 + 900 * Math.sin(a))}L${f(500 + 900 * Math.cos(b))} ${f(540 + 900 * Math.sin(b))}Z`;
      }
      return svg(
        rg('bg', [[0, '#fbf3df'], [1, '#e9d7b4']], 0.5, 0.55, 0.7) +
        lg('rad', [[0, '#ffffff'], [0.7, '#f6eef0'], [1, '#f2c9d6']], 0, 0, 1, 1) +
        lg('leafG', [[0, '#79c04a'], [1, '#2f7d32']]) +
        `<pattern id="ht" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="7" cy="7" r="3" fill="#151515"/></pattern>` +
        `<path id="arc" d="M150 470A350 350 0 0 1 850 470"/>` +
        rg('htm', [[0.6, '#fff', 0], [1, '#fff', 1]]) +
        `<mask id="hm"><rect width="1000" height="1000" fill="url(#htm)"/></mask>`,
        `<rect width="1000" height="1000" fill="url(#bg)"/>` +
        `<path d="${rays}" fill="#d83a2e" opacity=".9"/>` +
        `<rect width="1000" height="1000" fill="url(#ht)" mask="url(#hm)" opacity=".35"/>` +
        `<circle cx="500" cy="560" r="250" fill="#151515"/><circle cx="500" cy="560" r="236" fill="#f6ead0"/><circle cx="500" cy="560" r="214" fill="#d83a2e"/>` +
        // flute (dizi) with red tassel, behind the radish
        `<g transform="translate(500 560) rotate(-32)">` +
        `<rect x="-380" y="-22" width="760" height="44" rx="22" fill="#151515"/><rect x="-370" y="-14" width="740" height="8" rx="4" fill="#5a5a5a"/>` +
        `<path d="M-300-22v44M-250-22v44M300-22v44M340-22v44" stroke="#c9a24a" stroke-width="8"/>` +
        `<g fill="#f6ead0"><circle cx="-180" r="7"/><circle cx="60" r="7"/><circle cx="110" r="7"/><circle cx="160" r="7"/><circle cx="210" r="7"/><circle cx="260" r="7"/></g>` +
        `<path d="M-376 10C-392 40-396 80-384 120" stroke="#d83a2e" stroke-width="6" fill="none"/><path d="M-398 120h30l10 90h-50Z" fill="#d83a2e"/><circle cx="-384" cy="118" r="11" fill="#151515"/>` +
        `</g>` +
        // radish mascot
        `<g transform="translate(500 590)">` +
        `<path d="M-30-150C-90-230-60-300-20-300C-10-250 0-210-6-160Z" fill="url(#leafG)" stroke="#151515" stroke-width="7" stroke-linejoin="round"/>` +
        `<path d="M10-160C30-240 90-280 130-250C100-220 60-190 20-150Z" fill="url(#leafG)" stroke="#151515" stroke-width="7" stroke-linejoin="round"/>` +
        `<path d="M-10-156C-20-250 20-320 60-310C50-260 30-200 6-150Z" fill="#5aa83e" stroke="#151515" stroke-width="7" stroke-linejoin="round"/>` +
        `<path d="M-120-50C-130-150-40-176 0-176C40-176 130-150 120-50C110 40 40 110 6 190C2 200-4 200-6 190C-40 110-110 40-120-50Z" fill="url(#rad)" stroke="#151515" stroke-width="8" stroke-linejoin="round"/>` +
        `<path d="M-80-110C-60-140-20-150 10-150" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        `<path d="M-90 0h24M70 30h20M-60 70h16" stroke="#e2b9c6" stroke-width="5" stroke-linecap="round"/>` +
        // red ribbon bow on the leaves
        `<path d="M-6-164C-50-200-80-170-60-150C-40-138-20-150-6-164ZM-6-164C40-200 74-176 56-152C38-140 14-150-6-164Z" fill="#e0242f" stroke="#151515" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M-14-160L-46-110M2-160L26-108" stroke="#e0242f" stroke-width="12" stroke-linecap="round"/><circle cx="-6" cy="-162" r="12" fill="#e0242f" stroke="#151515" stroke-width="6"/>` +
        // face: wink + grin
        `<path d="M-64-46Q-46-62-28-46" stroke="#151515" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="44" cy="-48" rx="15" ry="19" fill="#151515"/><circle cx="49" cy="-54" r="5" fill="#fff"/>` +
        `<path d="M-50 0Q0 56 56 -4Q2 22-50 0Z" fill="#151515"/><path d="M-30 10Q0 26 36 6L30 14Q0 30-26 18Z" fill="#fff"/>` +
        `<ellipse cx="-82" cy="-6" rx="20" ry="11" fill="#f39ab0" opacity=".7"/><ellipse cx="88" cy="-10" rx="20" ry="11" fill="#f39ab0" opacity=".7"/>` +
        `</g>` +
        // type
        `<text font-family="${HEAVY}" font-size="88" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#d83a2e" transform="translate(6 6)"><textPath href="#arc" xlink:href="#arc" startOffset="50%">YILING LAOZU</textPath></text>` +
        `<text font-family="${HEAVY}" font-size="88" font-weight="900" letter-spacing="3" text-anchor="middle" fill="#151515"><textPath href="#arc" xlink:href="#arc" startOffset="50%">YILING LAOZU</textPath></text>` +
        `<path d="M150 850L200 820L800 820L850 850L800 880H200Z" fill="#151515" transform="translate(0 30)"/>` +
        `<path d="M110 850L180 810H820L890 850L820 890H180Z" fill="#d83a2e" stroke="#151515" stroke-width="7" stroke-linejoin="round"/>` +
        text(500, 872, '&amp; THE RADISHES', { font: HEAVY, size: 56, weight: 900, fill: '#fbf3df', ls: 5, anchor: 'middle' })
      , 0.6);
    },
  });

  // ---- Gym (Jiang Cheng's playlist) -------------------------------------------------------
  def('cover_gym', {
    title: 'Gym',
    w: 1000, h: 1000, tags: ['cover', 'gym', 'lightning', 'purple'],
    svg: () => {
      seed(21);
      const bolt = (x0, y0, x1, y1, n, jit) => {
        let d = `M${x0} ${y0}`;
        for (let i = 1; i <= n; i++) {
          const t = i / n, x = x0 + (x1 - x0) * t + (i < n ? rr(-jit, jit) : 0), y = y0 + (y1 - y0) * t + (i < n ? rr(-jit * 0.3, jit * 0.3) : 0);
          d += `L${f(x)} ${f(y)}`;
        }
        return d;
      };
      const main = bolt(640, -20, 360, 1020, 14, 70);
      const br = bolt(560, 240, 860, 420, 6, 40) + bolt(470, 600, 140, 760, 7, 40) + bolt(420, 820, 600, 1000, 5, 30) + bolt(600, 120, 330, 40, 5, 30);
      const zap = (d, k) =>
        `<path d="${d}" stroke="#8a3dff" stroke-width="${46 * k}" opacity=".16"/><path d="${d}" stroke="#b77cff" stroke-width="${18 * k}" opacity=".5"/><path d="${d}" stroke="#fbf6ff" stroke-width="${5 * k}"/>`;
      return svg(
        rg('bg', [[0, '#3a1166'], [0.45, '#170828'], [1, '#050208']], 0.5, 0.5, 0.75) +
        lg('txt', [[0, '#ffffff'], [0.45, '#efdcff'], [1, '#a35cff']]) +
        rg('glow', [[0, '#b77cff', 0.55], [1, '#b77cff', 0]]),
        `<rect width="1000" height="1000" fill="url(#bg)"/>` +
        text(500, 640, '紫电', { font: CJK, size: 560, fill: '#b77cff', op: 0.07, anchor: 'middle' }) +
        `<circle cx="500" cy="560" r="420" fill="url(#glow)"/>` +
        `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${zap(main, 1)}${zap(br, 0.55)}</g>` +
        `<path d="${dots(40, 80, 920, 80, 920, 1, 3.5)}" fill="#e9d6ff" opacity=".8"/>` +
        // GYM
        `<g transform="skewX(-10)">` +
        text(612, 660, 'GYM', { font: HEAVY, size: 330, weight: 900, fill: '#12041f', ls: -6, anchor: 'middle', extra: ' transform="translate(16 16)"' }) +
        text(612, 660, 'GYM', { font: HEAVY, size: 330, weight: 900, fill: 'url(#txt)', ls: -6, anchor: 'middle', extra: ' stroke="#3b0f6e" stroke-width="10" paint-order="stroke"' }) +
        `</g>` +
        `<path d="M300 700L700 700" stroke="#b77cff" stroke-width="4" opacity=".6"/>` +
        text(500, 768, 'DO NOT TALK TO ME', { font: HEAVY, size: 34, weight: 900, fill: '#d9b8ff', ls: 10, anchor: 'middle' }) +
        `<path d="M486 820L470 860H496L482 900L530 846H504L518 820Z" fill="#fbf6ff"/>`
      , 0.6);
    },
  });

  // ---- A-Ling's mix (chaotic teen playlist) -----------------------------------------------
  def('cover_aling_mix', {
    title: "A-Ling's mix",
    w: 1000, h: 1000, tags: ['cover', 'jl', 'playlist'],
    svg: () => {
      seed(18);
      // marker-drawn lowercase letters (x-height 90, baseline 90)
      const G = {
        a: ['M70 20C55 0 10 5 8 50C6 90 50 100 70 60M72 10C70 40 70 70 78 92', 92],
        '-': ['M6 52H50', 64],
        l: ['M20-50C18 0 16 50 24 92', 46],
        i: ['M20 14C20 40 18 70 22 92M20-24v2', 44],
        n: ['M10 6C12 40 10 70 10 92M10 40C20 0 70-5 72 40C74 60 72 80 74 92', 92],
        g: ['M70 20C55 0 10 5 8 45C6 80 50 85 70 50M72 10C72 60 74 110 60 128C40 150 10 135 6 120', 92],
        "'": ['M16-44L8-10', 34],
        s: ['M62 14C50-2 10 2 12 26C14 50 66 40 66 66C66 96 20 98 6 80', 82],
        m: ['M10 6V92M10 40C16 4 50-4 52 40V92M52 40C58 4 92-4 94 40C96 60 94 80 96 92', 116],
        x: ['M6 6L76 92M74 4L8 92', 90],
      };
      const word = (str) => {
        let x = 0, out = '';
        for (const ch of str) {
          const [p, adv] = G[ch];
          out += `<path d="${p}"${x ? ` transform="translate(${x} 0)"` : ''}/>`;
          x += adv;
        }
        return out;
      };
      const sticker = (inner, tx) => `<g transform="${tx}"><g transform="translate(6 8)" opacity=".25">${inner.replace(/fill="[^"]+"/g, 'fill="#000"').replace(/stroke="[^"]+"/g, 'stroke="#000"')}</g>${inner}</g>`;
      let doodles = '';
      for (let i = 0; i < 10; i++) {
        const x = rr(60, 940), y = rr(60, 940);
        if (y > 380 && y < 640) continue;
        doodles += i % 2 ? `M${f(x)} ${f(y - 16)}l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1Z` : `M${f(x)} ${f(y)}c-10-14-30-4-18 10l18 16 18-16c12-14-8-24-18-10Z`;
      }
      return svg(
        lg('bg', [[0, '#ffd84a'], [1, '#ffb52e']], 0, 0, 1, 1) +
        `<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(-4)"><path d="M40 0H0V40" fill="none" stroke="#c98a00" stroke-width="1.5" opacity=".35"/></pattern>` +
        `<pattern id="tape" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="40" height="40" fill="#151515"/><rect width="20" height="40" fill="#ffd84a"/></pattern>` +
        lg('wash', [[0, '#ff9ec7'], [1, '#ff7ab3']]),
        `<rect width="1000" height="1000" fill="url(#bg)"/><rect width="1000" height="1000" fill="url(#grid)"/>` +
        `<path d="${doodles}" fill="none" stroke="#151515" stroke-width="5" stroke-linejoin="round" opacity=".55"/>` +
        // washi tape + caution tape
        `<rect x="-40" y="60" width="380" height="64" fill="url(#wash)" opacity=".85" transform="rotate(-16 150 92)"/>` +
        `<path d="M-40 60h380M-40 124h380" stroke="#fff" stroke-width="4" stroke-dasharray="10 10" opacity=".6" transform="rotate(-16 150 92)"/>` +
        `<g transform="translate(600 900) rotate(-24)"><rect x="-460" y="-38" width="920" height="76" fill="url(#tape)"/><rect x="-220" y="-26" width="440" height="52" fill="#151515"/>` +
        text(0, 16, 'DO NOT TOUCH', { font: HEAVY, size: 40, weight: 900, fill: '#ffd84a', ls: 6, anchor: 'middle' }) + `</g>` +
        // Fairy sticker
        sticker(`<circle r="112" fill="#fff"/><path d="M-70-40L-80-120L-20-70ZM70-40L80-120L20-70Z" fill="#1c1c24"/><circle r="92" fill="#1c1c24"/><ellipse cy="34" rx="46" ry="34" fill="#3a3b4c"/>` +
          `<circle cx="-34" cy="-14" r="13" fill="#c98a3e"/><circle cx="34" cy="-14" r="13" fill="#c98a3e"/><circle cx="-31" cy="-17" r="4" fill="#fff"/><circle cx="37" cy="-17" r="4" fill="#fff"/>` +
          `<ellipse cy="18" rx="16" ry="11" fill="#08080c"/><path d="M-10 40Q0 34 10 40V62C10 74-10 74-10 62Z" fill="#ff7f9c"/>`, 'translate(190 250) rotate(-12)') +
        // peony sticker
        sticker(`<circle r="104" fill="#fff"/><circle r="86" fill="#f78fb0"/><circle cx="-24" cy="-20" r="46" fill="#fbb6cc"/><circle cx="28" cy="-14" r="44" fill="#f57aa2"/><circle cx="0" cy="26" r="44" fill="#f9a5c0"/><circle r="22" fill="#ffd84a"/>`, 'translate(820 230) rotate(10)') +
        // lightning sticker (jiujiu's colour)
        sticker(`<path d="M10-120L-70 20H-10L-30 120L70-30H10L40-120Z" fill="#8a4dff" stroke="#fff" stroke-width="16" stroke-linejoin="round"/>`, 'translate(850 720) rotate(12)') +
        // 18 star
        sticker(`<path d="M0-110L26-40L100-50L46 4L80 72L10 44L-40 100L-34 30L-104 10L-36-24Z" fill="#ff5a3a" stroke="#fff" stroke-width="12" stroke-linejoin="round" transform="scale(1.25)"/>` + text(0, 22, '18!', { font: HEAVY, size: 54, weight: 900, fill: '#fff', anchor: 'middle' }), 'translate(180 770) rotate(-10)') +
        // paper strip with the title
        `<g transform="translate(500 500) rotate(-5)">` +
        `<path d="M-390-150L380-160L392-120L384-80L394-40L386 0L396 40L388 80L396 120L386 158L-384 168L-394 130L-386 90L-396 50L-388 10L-398-30L-388-70L-396-110Z" fill="#000" opacity=".22" transform="translate(10 14)"/>` +
        `<path d="M-390-150L380-160L392-120L384-80L394-40L386 0L396 40L388 80L396 120L386 158L-384 168L-394 130L-386 90L-396 50L-388 10L-398-30L-388-70L-396-110Z" fill="#fffdf6"/>` +
        `<path d="M-340-90H340M-340-30H340M-340 30H340M-340 90H340" stroke="#9cc3ff" stroke-width="2" opacity=".6"/><path d="M-300-150V160" stroke="#ff8fa8" stroke-width="2" opacity=".6"/>` +
        `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
        `<g transform="translate(-300 -120) scale(.92)" stroke="#ff4f9a" stroke-width="15" opacity=".9">${word("a-ling's")}</g>` +
        `<g transform="translate(-306 -126) scale(.92)" stroke="#151515" stroke-width="15">${word("a-ling's")}</g>` +
        `<g transform="translate(-10 0) scale(1.25)" stroke="#ff4f9a" stroke-width="13">${word('mix')}</g>` +
        `<g transform="translate(-16 -6) scale(1.25)" stroke="#151515" stroke-width="13">${word('mix')}</g>` +
        `<path d="M300-96c-8-14-28-6-18 8l18 16 18-16c10-14-10-22-18-8Z" stroke="#ff4f9a" stroke-width="6"/>` +
        `</g>` +
        text(-300, 140, '(no skips. jiujiu stop.)', { font: `'Marker Felt', 'Chalkboard SE', 'Comic Sans MS', ${SANS}`, size: 30, fill: '#d6336c', italic: false }) +
        `</g>` +
        // crown doodle above the title
        `<path d="M-52 20l20-40 26 26 6-36 6 36 26-26 20 40Z" fill="#ffd84a" stroke="#151515" stroke-width="6" stroke-linejoin="round" transform="translate(172 128) rotate(-12)"/>`
      , 0.45);
    },
  });

  // ---- Shijie (soft, nostalgic) -----------------------------------------------------------
  def('cover_shijie', {
    title: 'Shijie',
    w: 1000, h: 1000, tags: ['cover', 'lotus', 'nostalgic'],
    svg: () => {
      seed(2);
      let rip = '';
      for (let i = 0; i < 6; i++) rip += `<ellipse cx="500" cy="700" rx="${160 + i * 70}" ry="${24 + i * 10}" fill="none" stroke="#fff" stroke-width="3" opacity="${r1(0.32 - i * 0.04)}"/>`;
      return svg(
        lg('ph', [[0, '#f6d6c2'], [0.5, '#efc0c4'], [0.62, '#d8b7b9'], [1, '#93aea7']]) +
        rg('leak', [[0, '#ff8a4a', 0.55], [0.5, '#ffb37a', 0.2], [1, '#ffb37a', 0]]) +
        lg('pk', [[0, '#fff6f4'], [0.55, '#fbd5dc'], [1, '#ec90ac']], 0, 1, 0, 0) +
        rg('leaf', [[0, '#a9c3a0'], [1, '#6f8f73']], 0.5, 0.4, 0.6) +
        rg('soft', [[0, '#fff', 0.6], [1, '#fff', 0]]) +
        `<clipPath id="pc"><rect x="70" y="70" width="860" height="720" rx="6"/></clipPath>`,
        `<rect width="1000" height="1000" fill="#f3ebde"/>` +
        `<rect x="70" y="70" width="860" height="720" rx="6" fill="#000" opacity=".12" transform="translate(4 6)"/>` +
        `<g clip-path="url(#pc)">` +
        `<rect x="70" y="70" width="860" height="720" fill="url(#ph)"/>` +
        `<circle cx="500" cy="420" r="380" fill="url(#soft)"/>` +
        rip +
        `<ellipse cx="250" cy="760" rx="260" ry="80" fill="url(#leaf)" opacity=".85"/><ellipse cx="820" cy="720" rx="200" ry="60" fill="url(#leaf)" opacity=".7"/>` +
        `<path d="M500 700C496 640 498 600 500 560" stroke="#7d9a7a" stroke-width="10" fill="none"/>` +
        lotus(500, 560, 1.55, 'pk', '#e7a9b9', true) +
        `<path d="M760 480C730 440 744 400 770 380C792 404 796 444 760 480Z" fill="url(#pk)" opacity=".8"/><path d="M760 480C758 560 760 640 764 700" stroke="#7d9a7a" stroke-width="6" fill="none" opacity=".8"/>` +
        `<circle cx="880" cy="110" r="420" fill="url(#leak)"/>` +
        `<rect x="70" y="70" width="860" height="720" fill="#fff3e6" opacity=".14"/>` +
        `</g>` +
        // date stamp
        text(900, 760, "'08 2 12", { font: `'Courier New', Courier, monospace`, size: 40, weight: 700, fill: '#ff8a3a', anchor: 'end', ls: 2, op: 0.9, extra: ' stroke="#ffb27a" stroke-width="1"' }) +
        // caption
        text(500, 900, 'shijie', { font: `Baskerville, Georgia, 'Times New Roman', serif`, size: 76, fill: '#6b5650', italic: true, anchor: 'middle', ls: 2 }) +
        `<path d="M590 880c6-10 20-10 22 2c2-12 18-12 20-2c2 14-20 24-21 28c-1-4-23-14-21-28Z" fill="#e48aa4" opacity=".9"/>`
      , 0.75);
    },
  });

  // ---- Koi Records ------------------------------------------------------------------------
  def('cover_koi_records', {
    title: 'Koi Records',
    w: 1000, h: 1000, tags: ['cover', 'koi', 'label'],
    svg: () => {
      seed(30);
      // Koi outline (head +x), bent so both ends curve the same way.
      const bend = (x, y) => [x, y + 0.0017 * x * x];
      const P = (x, y) => bend(x, y).map(f).join(' ');
      const KOI =
        `M${P(190, 0)}C${P(184, -44)} ${P(130, -64)} ${P(40, -62)}C${P(-40, -58)} ${P(-110, -32)} ${P(-160, -12)}` +
        `C${P(-196, -36)} ${P(-246, -66)} ${P(-276, -50)}C${P(-252, -18)} ${P(-252, 18)} ${P(-276, 50)}C${P(-246, 66)} ${P(-196, 36)} ${P(-160, 12)}` +
        `C${P(-110, 32)} ${P(-40, 58)} ${P(40, 62)}C${P(130, 64)} ${P(184, 44)} ${P(190, 0)}Z`;
      const FIN = `M${P(90, -50)}C${P(70, -110)} ${P(130, -140)} ${P(150, -100)}C${P(140, -80)} ${P(118, -62)} ${P(106, -54)}Z` + `M${P(90, 50)}C${P(70, 110)} ${P(130, 140)} ${P(150, 100)}C${P(140, 80)} ${P(118, 62)} ${P(106, 54)}Z`;
      const koi = (tx, body, patches, pc, fc) =>
        `<g transform="${tx}">` +
        `<path d="${FIN}" fill="${fc}" opacity=".6"/>` +
        `<path d="${KOI}" fill="#000" opacity=".35" transform="translate(14 22)"/>` +
        `<path d="${KOI}" fill="${body}"/>` +
        `<g clip-path="url(#kc)" fill="${pc}">${patches}</g>` +
        `<path d="M${P(150, 0)}C${P(60, -4)} ${P(-60, -2)} ${P(-150, 0)}" stroke="#fff" stroke-width="5" opacity=".35" fill="none"/>` +
        `<circle cx="${bend(158, -24)[0]}" cy="${f(bend(158, -24)[1])}" r="7" fill="#151515"/><circle cx="${bend(158, 24)[0]}" cy="${f(bend(158, 24)[1])}" r="7" fill="#151515"/>` +
        `</g>`;
      let rings = '';
      for (let i = 1; i < 9; i++) rings += `<circle cx="500" cy="440" r="${i * 70}" fill="none" stroke="#2c5286" stroke-width="2" opacity="${r1(0.4 - i * 0.04)}"/>`;
      let caust = '';
      for (let i = 0; i < 14; i++) {
        const x = rr(0, 1000), y = rr(0, 1000);
        caust += `M${f(x)} ${f(y)}c${f(rr(20, 40))} ${f(rr(-20, 20))} ${f(rr(50, 80))} ${f(rr(-10, 10))} ${f(rr(90, 130))} ${f(rr(-20, 20))}`;
      }
      return svg(
        rg('water', [[0, '#16345e'], [0.6, '#0b1d3a'], [1, '#050c1a']], 0.5, 0.42, 0.75) +
        lg('gold', [[0, '#f8dc94'], [0.5, '#e2b65a'], [1, '#b8862e']]) +
        lg('kgold', [[0, '#ffcf5a'], [1, '#f08a1c']], 0, 0, 1, 1) +
        `<clipPath id="kc"><path d="${KOI}"/></clipPath>`,
        `<rect width="1000" height="1000" fill="url(#water)"/>` +
        rings +
        `<path d="${caust}" stroke="#6fa8e8" stroke-width="3" fill="none" opacity=".18" stroke-linecap="round"/>` +
        koi('translate(530 300) rotate(10)', '#fbf7f0', `<ellipse cx="60" cy="-30" rx="70" ry="40"/><ellipse cx="-80" cy="20" rx="60" ry="46"/><ellipse cx="160" cy="0" rx="34" ry="30"/>`, '#e8452c', '#f6efe6') +
        koi('translate(470 600) rotate(190)', 'url(#kgold)', `<ellipse cx="20" cy="30" rx="80" ry="36"/><ellipse cx="-140" cy="-10" rx="40" ry="30"/>`, '#fff6e6', '#ffc85a') +
        `<path d="${dots(16, 120, 880, 150, 760, 3, 7)}" fill="none" stroke="#9cc8ff" stroke-width="2" opacity=".5"/>` +
        `<path d="M250 820H750" stroke="url(#gold)" stroke-width="2"/>` +
        text(500, 900, 'KOI RECORDS', { size: 70, weight: 300, fill: 'url(#gold)', ls: 22, anchor: 'middle' }) +
        text(500, 948, 'LANLING · EST. 1998', { size: 20, fill: '#c8a85e', ls: 10, anchor: 'middle', op: 0.8 }) +
        `<rect x="862" y="70" width="70" height="140" rx="6" fill="#b8202f"/>` +
        text(897, 130, '锦', { font: CJK, size: 46, fill: '#fbeee0', anchor: 'middle' }) + text(897, 186, '鲤', { font: CJK, size: 46, fill: '#fbeee0', anchor: 'middle' })
      , 0.5);
    },
  });

  // ---- Rain -------------------------------------------------------------------------------
  def('cover_rain', {
    title: 'Rain',
    w: 1000, h: 1000, tags: ['cover', 'rain', 'night'],
    svg: () => {
      seed(16);
      const cols = ['#ffb36b', '#6bc7ff', '#ff7aa8', '#ffe2a8', '#9fd2ff'];
      let bok = '';
      for (let i = 0; i < 30; i++) {
        const r = rr(16, 84), c = cols[i % 5], o = rr(0.1, 0.32);
        bok += `<circle cx="${f(rr(-40, 1040))}" cy="${f(rr(300, 1000))}" r="${f(r)}" fill="${c}" fill-opacity="${r1(o)}" stroke="${c}" stroke-opacity="${r1(o * 1.6)}" stroke-width="2"/>`;
      }
      let streaks = '';
      for (let i = 0; i < 70; i++) {
        const x = rr(0, 1080), y = rr(-50, 1000), L = rr(40, 140);
        streaks += `M${f(x)} ${f(y)}l${f(-L * 0.18)} ${f(L)}`;
      }
      let drops = '';
      for (let i = 0; i < 80; i++) drops += `<use href="#dr" transform="translate(${f(rr(0, 1000))} ${f(rr(0, 1000))}) scale(${r1(rr(0.25, 1.1))})"/>`;
      let drips = '';
      for (let i = 0; i < 6; i++) {
        const x = rr(80, 920), y = rr(60, 500), L = rr(160, 380);
        drips += `M${f(x)} ${f(y)}c${f(rr(-6, 6))} ${f(L * 0.3)} ${f(rr(-10, 10))} ${f(L * 0.6)} ${f(rr(-6, 6))} ${f(L)}`;
      }
      return svg(
        lg('bg', [[0, '#0b1626'], [0.5, '#16263a'], [1, '#0a121e']]) +
        rg('dg', [[0, '#0b1626', 0.5], [0.7, '#0b1626', 0.15], [1, '#dbeeff', 0.75]], 0.5, 0.35, 0.6) +
        lg('city', [[0, '#ff9a5a', 0], [1, '#ff9a5a', 0.18]]) +
        `<g id="dr"><circle r="12" fill="url(#dg)"/><path d="M-8 6A10 10 0 0 0 8 6" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/><circle cx="-4" cy="-5" r="2.5" fill="#fff" opacity=".9"/></g>`,
        `<rect width="1000" height="1000" fill="url(#bg)"/>` +
        bok +
        `<rect y="500" width="1000" height="500" fill="url(#city)"/>` +
        `<path d="${streaks}" stroke="#cfe6ff" stroke-width="2" opacity=".22" stroke-linecap="round"/>` +
        `<path d="${drips}" stroke="#dbeeff" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>` +
        drops +
        text(64, 912, 'rain', { size: 132, weight: 200, fill: '#e6f0ff', ls: 8, op: 0.92 }) +
        text(70, 956, 'SOUNDS FOR 4 A.M.', { size: 22, fill: '#9fb6d6', ls: 8 })
      , 0.6);
    },
  });
})();
