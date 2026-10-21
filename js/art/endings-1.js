/* Ending key art, part 1 (1200×900): the mid-story endings and the Zhongli finales. Cinematic cards. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- helpers ----------------------------------------------------------------------------
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const f = Math.round;
  let S = 1;
  const seed = (n) => { S = n; };
  const rnd = () => (S = (S * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';

  const GRAIN =
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .8 0 0 0 -.45"/></filter>`;
  // defs, body, grain opacity, vignette opacity
  const svg = (defs, body, g = 0.07, v = 0.7) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs>${GRAIN}${rg('vig', [[0.55, '#000', 0], [1, '#000', 0.75]], 0.5, 0.5, 0.75)}${defs}</defs>${body}` +
    `<rect width="1200" height="900" fill="url(#vig)" opacity="${v}"/><rect width="1200" height="900" filter="url(#grain)" opacity="${g}"/></svg>`;
  const text = (x, y, s, o) =>
    `<text x="${x}" y="${y}" font-family="${o.font || FONT}" font-size="${o.size}"${o.weight ? ` font-weight="${o.weight}"` : ''}` +
    `${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''} fill="${o.fill || '#fff'}"${o.op != null ? ` opacity="${o.op}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}>${s}</text>`;
  // many small circles in one path
  const dots = (n, x0, x1, y0, y1, r0, r2) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const r = rr(r0, r2), x = rr(x0, x1), y = rr(y0, y1);
      d += `M${f(x + r)} ${f(y)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 .1 0`;
    }
    return d;
  };
  // butterfly, centred, wings spread (Wangsheng ghost-fire)
  const BF = 'M0 2C-6-18-30-34-42-22C-50-12-38 2-8 4C-30 10-34 28-20 32C-10 34-3 20 0 8C3 20 10 34 20 32C34 28 30 10 8 4C38 2 50-12 42-22C30-34 6-18 0 2Z';
  const bfly = (x, y, s, rot, fill, op = 1, glow) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" opacity="${op}">` +
    (glow ? `<circle r="70" fill="${glow}"/>` : '') +
    `<path d="${BF}" fill="${fill}"/><path d="M0-8V24" stroke="${fill}" stroke-width="4" stroke-linecap="round"/></g>`;
  // Liyue roof silhouette; eave at y, width w, roof height h
  const roof = (x, y, w, h, c, body = 0) => {
    const a = x - w / 2, b = x + w / 2;
    return `<path d="M${f(a - w * 0.06)} ${f(y - h * 0.35)}Q${f(a + w * 0.12)} ${f(y + h * 0.05)} ${f(a + w * 0.2)} ${f(y - h * 0.3)}L${f(x - w * 0.26)} ${f(y - h)}H${f(x + w * 0.26)}L${f(b - w * 0.2)} ${f(y - h * 0.3)}Q${f(b - w * 0.12)} ${f(y + h * 0.05)} ${f(b + w * 0.06)} ${f(y - h * 0.35)}Z` +
      (body ? `M${f(a + w * 0.12)} ${f(y - 2)}H${f(b - w * 0.12)}V${f(y + body)}H${f(a + w * 0.12)}Z` : '') + `" fill="${c}"/>`;
  };
  // tapered, curved lock of hair from (x,y) toward angle a (deg)
  const lock = (x, y, a, len, w, bend) => {
    const r = (a * Math.PI) / 180, dx = Math.cos(r), dy = Math.sin(r), nx = -dy, ny = dx;
    const P = (u, v) => `${f(x + dx * u + nx * v)} ${f(y + dy * u + ny * v)}`;
    return `M${P(0, w / 2)}C${P(len * 0.35, w * 0.62)} ${P(len * 0.72, w * 0.32 + bend * 0.8)} ${P(len, bend)}C${P(len * 0.68, -w * 0.12 + bend * 0.6)} ${P(len * 0.35, -w * 0.58)} ${P(0, -w / 2)}Z`;
  };
  // locks sprouting outward around an ellipse arc
  const tufts = (cx, cy, rx, ry, a0, a1, n, len, w, bend) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / Math.max(1, n - 1) + rr(-5, 5), r = (a * Math.PI) / 180;
      d += lock(cx + rx * Math.cos(r), cy + ry * Math.sin(r), a + rr(-12, 12), len * rr(0.75, 1.25), w * rr(0.85, 1.15), bend * rr(0.6, 1.2));
    }
    return d;
  };
  // Childe's head seen from behind (radius r, rotated rot); needs #chh in defs
  const MASK = (c = '#c8323c') => `<path d="M-30-4C-20-15-8-12 0-6C8-12 20-15 30-4C26 7 17 11 8 8L0 4L-8 8C-17 11-26 7-30-4Z" fill="${c}"/><path d="M-20-4Q-13-9-6-3Q-13 1-20-4ZM20-4Q13-9 6-3Q13 1 20-4Z" fill="#2a1416"/><path d="M-30-4L-40-13M30-4L40-13" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M-26-6C-19-13-9-11 0-5" stroke="#f07a80" stroke-width="2" fill="none"/>`;
  const chBack = (cx, cy, r, rot) => {
    const L = (x, y, a, len, w, b) => lock(cx + x * r, cy + y * r, a, len * r, w * r, b * r);
    const locks = (k) => L(-0.3, -0.92, -125, 0.5 * k, 0.6, -0.18) + L(0.25, -0.98, -68, 0.45 * k, 0.6, 0.18) + L(-0.95, -0.25, 168, 0.36 * k, 0.6, -0.2) +
      L(-0.88, 0.38, 125, 0.45 * k, 0.6, -0.15) + L(0.95, -0.25, 12, 0.36 * k, 0.6, 0.2) + L(0.88, 0.38, 55, 0.45 * k, 0.6, 0.15) +
      L(-0.5, 0.9, 106, 0.5 * k, 0.6, -0.12) + L(0.05, 1.0, 90, 0.55 * k, 0.65, 0.06) + L(0.55, 0.9, 74, 0.5 * k, 0.6, 0.12);
    const P = (x, y) => `${f(cx + x * r)} ${f(cy + y * r)}`;
    return `<g transform="rotate(${rot} ${cx} ${cy})">` +
      `<path d="${locks(1.15)}" fill="${CH.hair2}"/><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${f(r * 1.1)}" fill="url(#chh)"/><path d="${locks(1)}" fill="${CH.hair}"/>` +
      `<path d="M${P(-0.6, -0.4)}Q${P(-0.1, -0.75)} ${P(0.55, -0.45)}M${P(-0.7, 0.2)}Q${P(0, -0.2)} ${P(0.7, 0.15)}M${P(-0.35, 0.65)}Q${P(0.05, 0.4)} ${P(0.4, 0.7)}" stroke="${CH.hair2}" stroke-width="${(r * 0.07).toFixed(1)}" fill="none" opacity=".55" stroke-linecap="round"/>` +
      `<path d="M${P(-0.5, -0.7)}Q${P(0, -0.98)} ${P(0.45, -0.75)}" stroke="${CH.hi}" stroke-width="${(r * 0.1).toFixed(1)}" fill="none" opacity=".8" stroke-linecap="round"/>` +
      `<g transform="translate(${P(-0.62, -0.62).replace(' ', ' ')}) rotate(-35) scale(${(r / 38).toFixed(2)})">${MASK()}</g></g>`;
  };
  // fur-collar shape between two shoulder points (bumpy top edge)
  const fluffEdge = (x0, y0, x1, y1) => {
    const n = 8, w = (x1 - x0) / n;
    let d = `M${x0 - 10} ${y0 + 30}`;
    for (let i = 0; i <= n; i++) d += `Q${f(x0 + w * (i - 0.5))} ${f(y0 - 22)} ${f(x0 + w * i)} ${f(y0 - 6 + (i % 2) * 6)}`;
    return d + `L${x1 + 10} ${y1 + 30}Q${f((x0 + x1) / 2)} ${y1 + 50} ${x0 - 10} ${y0 + 30}Z`;
  };
  // soft steam
  const steam = (x, y, h, c = '#fff', o = 0.5) => {
    const d = `M${x} ${y}c-14 ${-h * 0.25} 14 ${-h * 0.45} 0 ${-h * 0.65}s-12 ${-h * 0.25} 4 ${-h * 0.35}`;
    return `<g fill="none" stroke="${c}" stroke-linecap="round" opacity="${o}"><path d="${d}" stroke-width="16" opacity=".15"/><path d="${d}" stroke-width="5" opacity=".5"/></g>`;
  };
  // crane in flight
  const crane = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-40 6Q-20-18 0 0Q22-22 44-10Q20-6 6 4L30 8L4 10Q-2 16-10 10Q-24 4-40 6Z" fill="${c}"/>`;
  // phone (front), centred at 0,0 local; w,h; screen content
  const phoneFront = (w, h, screen, frame = '#1a1c22') =>
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${f(w * 0.16)}" fill="${frame}"/>` +
    `<rect x="${-w / 2 + 6}" y="${-h / 2 + 6}" width="${w - 12}" height="${h - 12}" rx="${f(w * 0.13)}" fill="#000"/>` + screen +
    `<rect x="${-w * 0.16}" y="${-h / 2 + 14}" width="${f(w * 0.32)}" height="${f(w * 0.08)}" rx="${f(w * 0.04)}" fill="#000"/>`;

  // Skin tones
  const SK = { hi: '#ffe6d4', base: '#f6cfb4', sh: '#e2a98a', deep: '#c98468' };
  const ZL = { hair: '#3a2419', hair2: '#24160f', tip: '#e0a548', coat: '#3b281e', coat2: '#251810', gold: '#d9aa55', eye: '#e8a33a' };
  const CH = { hair: '#c8642f', hair2: '#8f3c1c', hi: '#ef9758', jacket: '#6c7280', jacket2: '#43474f', scarf: '#c8323c', mask: '#c8323c', eye: '#2f6fb8' };

  // ==== A Contract Renewed =================================================================
  def('end_contract', {
    title: 'A Contract Renewed',
    w: 1200, h: 900, tags: ['ending', 'zl', 'me'],
    svg: () => {
      seed(7);
      let rays = '';
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + (i / 15) * Math.PI, b = a + 0.05;
        rays += `M600 470L${f(600 + 1300 * Math.cos(a))} ${f(470 + 1300 * Math.sin(a))}L${f(600 + 1300 * Math.cos(b))} ${f(470 + 1300 * Math.sin(b))}Z`;
      }
      return svg(
        lg('sky', [[0, '#3e4f86'], [0.32, '#b4718a'], [0.58, '#f4a65e'], [0.75, '#ffd98c'], [1, '#fff1c4']]) +
        rg('sun', [[0, '#fffbe9'], [0.08, '#fff3c6'], [0.3, '#ffcf7a', 0.55], [1, '#ff9a4a', 0]]) +
        lg('sea', [[0, '#f6c27a'], [0.4, '#b9786a'], [1, '#4d4064']]) +
        lg('mtnA', [[0, '#8e6a8c'], [1, '#c48a86']]) +
        lg('mtnB', [[0, '#5c4569'], [1, '#7c5a72']]) +
        lg('rail', [[0, '#fbe7c8'], [0.35, '#e7c9a4'], [1, '#8f7468']]) +
        lg('post', [[0, '#c7a68a'], [1, '#6a5258']], 0, 0, 1, 0) +
        lg('zc', [[0, ZL.coat], [1, ZL.coat2]]) +
        lg('zh', [[0, '#4a2f20'], [1, ZL.hair2]], 0, 0, 1, 1) +
        lg('zp', [[0, ZL.hair2], [0.55, ZL.hair], [0.8, '#8a5426'], [1, ZL.tip]]) +
        lg('cj', [[0, CH.jacket], [1, CH.jacket2]]) +
        lg('chh', [[0, CH.hi], [0.5, CH.hair], [1, CH.hair2]], 0, 0, 0.4, 1) +
        lg('sk', [[0, SK.hi], [1, SK.base]], 0, 0, 1, 1) +
        rg('rim', [[0, '#fff2c4', 0.9], [1, '#ffcf7a', 0]]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<path d="${rays}" fill="#fff6d8" opacity=".09"/>` +
        `<circle cx="600" cy="470" r="420" fill="url(#sun)"/>` +
        // clouds
        `<path d="M0 214C80 196 150 220 240 206S420 214 470 230H0Z" fill="#f7b98a" opacity=".35"/>` +
        `<path d="M760 262C840 244 920 258 1010 246S1150 252 1200 264V280H740Z" fill="#ffd2a0" opacity=".4"/>` +
        `<path d="M120 330C220 318 300 336 380 328" stroke="#ffe0b0" stroke-width="6" fill="none" opacity=".45" stroke-linecap="round"/>` +
        `<path d="M820 360C900 350 980 362 1060 354" stroke="#ffe0b0" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>` +
        // far mountains & karst pillars
        `<path d="M0 470C60 440 120 452 180 430C240 410 300 448 360 452C420 456 470 462 520 470H0Z" fill="url(#mtnA)" opacity=".75"/>` +
        `<path d="M700 470C760 450 830 452 900 428C960 410 1040 440 1110 436C1150 434 1180 442 1200 446V470Z" fill="url(#mtnA)" opacity=".75"/>` +
        `<path d="M0 520V250C14 226 40 220 58 238C70 210 104 204 118 236C126 290 120 380 132 470L150 520Z" fill="url(#mtnB)"/>` +
        `<path d="M1200 520V200C1186 180 1158 178 1142 198C1128 176 1096 180 1090 210C1084 300 1092 400 1076 520Z" fill="url(#mtnB)"/>` +
        `<path d="M1010 520C1016 440 1008 360 1018 320C1028 300 1052 300 1058 322C1066 380 1058 460 1066 520Z" fill="#6e5270" opacity=".85"/>` +
        `<path d="M58 238C70 210 104 204 118 236M1142 198C1128 176 1096 180 1090 210" stroke="#ffcf8a" stroke-width="4" fill="none" opacity=".6"/>` +
        // sea + glitter
        `<rect y="468" width="1200" height="432" fill="url(#sea)"/>` +
        `<path d="M600 470L520 900H680Z" fill="#fff1c4" opacity=".22"/>` +
        `<path d="${dots(70, 520, 680, 476, 640, 1.5, 4)}" fill="#fff8de" opacity=".8"/>` +
        `<path d="M300 520H420M760 540H900M200 580H330M840 600H1000M460 560H520M680 590H740" stroke="#ffe3a8" stroke-width="3" opacity=".35" stroke-linecap="round"/>` +
        // harbour roofs below the terrace
        `<g opacity=".9">${roof(250, 600, 170, 46, '#6b4a5c', 60)}${roof(380, 616, 120, 34, '#77526a', 50)}${roof(150, 628, 140, 40, '#5e4254', 60)}` +
        `${roof(960, 604, 180, 48, '#6b4a5c', 60)}${roof(1090, 624, 150, 40, '#5e4254', 60)}${roof(840, 626, 110, 30, '#77526a', 50)}</g>` +
        `<path d="M246 556L254 556M956 558L964 558" stroke="#ffd27a" stroke-width="6"/>` +
        `<path d="${dots(16, 120, 420, 610, 650, 2, 3.5)}${dots(16, 800, 1140, 610, 650, 2, 3.5)}" fill="#ffd27a" opacity=".85"/>` +
        // cranes
        crane(330, 300, 0.9, '#5a3f5c') + crane(392, 268, 0.6, '#6a4c68') + crane(870, 236, 0.7, '#5a3f5c') +
        // balustrade
        `<rect y="626" width="1200" height="274" fill="#6e5660"/>` +
        `<path d="${[40, 150, 260, 370, 480, 590, 700, 810, 920, 1030, 1140].map((x) => `M${x - 18} 672h36v228h-36z`).join('')}" fill="url(#post)"/>` +
        `<rect y="648" width="1200" height="22" fill="#9a7f7c"/><rect y="668" width="1200" height="8" fill="#4e3c46" opacity=".6"/>` +
        `<rect y="596" width="1200" height="34" fill="url(#rail)"/>` +
        `<rect y="626" width="1200" height="24" fill="#b89a8c"/>` +
        `<path d="M0 597H1200" stroke="#fff6dc" stroke-width="3" opacity=".85"/>` +
        // contract + cups on the rail, in the gap of light
        `<path d="M548 604L652 598L666 622L538 628Z" fill="#000" opacity=".1" transform="translate(4 4)"/>` +
        `<path d="M548 602L652 596L666 620L538 626Z" fill="#fcf4e2"/><path d="M538 626L548 602L551 603L542 626Z" fill="#d8c3a0"/>` +
        `<path d="M562 606L622 603M558 611L630 607M555 616L604 613" stroke="#8a7766" stroke-width="1.6" opacity=".7"/>` +
        `<path d="M630 610l14-1 2 9-15 1z" fill="#c8323c"/>` +
        `<path d="M562 621c5-4 10 2 15-2s8 1 12-1" stroke="#3a2419" stroke-width="1.6" fill="none"/><path d="M604 619c4-3 8 2 13-1" stroke="#2f6fb8" stroke-width="1.6" fill="none"/>` +
        `<g transform="translate(512 610)"><ellipse cx="0" cy="3" rx="19" ry="5" fill="#000" opacity=".15"/><path d="M-16-20H16L12 0Q0 5-12 0Z" fill="#b9d7c4"/><ellipse cx="0" cy="-20" rx="16" ry="4.5" fill="#e3f0e6"/><ellipse cx="0" cy="-19.5" rx="13" ry="3" fill="#c99a52"/></g>` +
        steam(512, 584, 70, '#fff', 0.55) +
        `<g transform="translate(690 608)"><ellipse cx="0" cy="3" rx="19" ry="5" fill="#000" opacity=".15"/><path d="M-16-20H16L12 0Q0 5-12 0Z" fill="#b9d7c4"/><ellipse cx="0" cy="-20" rx="16" ry="4.5" fill="#e3f0e6"/><ellipse cx="0" cy="-19.5" rx="13" ry="3" fill="#c99a52"/></g>` +
        steam(690, 582, 60, '#fff', 0.5) +
        // ---- Zhongli (left, from behind, head turned toward Childe) ----
        `<path d="M376 362C346 368 314 378 300 402C290 422 288 452 292 490C296 520 306 545 318 565C310 650 296 770 280 900H516C504 770 488 650 478 565C492 540 504 510 506 470C508 440 504 418 500 404C488 380 452 368 414 362Z" fill="url(#zc)"/>` +
        `<path d="M300 402C290 422 288 452 292 490C296 520 306 545 318 565C310 650 296 770 280 900H330C328 780 330 660 336 580C330 520 316 450 300 402Z" fill="#140c08" opacity=".35"/>` +
        `<path d="M398 640L384 900H414Z" fill="#140c08"/><path d="M398 640L384 900M398 640L414 900" stroke="${ZL.gold}" stroke-width="3"/>` +
        `<path d="M346 700C350 780 344 840 338 900M452 700C452 780 458 840 464 900" stroke="#140c08" stroke-width="4" fill="none" opacity=".35"/>` +
        // right arm to the contract, gloved hand
        `<path d="M492 398C512 408 522 440 530 478L546 532C554 558 562 580 568 600L542 608C534 586 520 560 512 536L494 482Z" fill="#33231a"/>` +
        `<path d="M540 598L566 590" stroke="${ZL.gold}" stroke-width="7"/>` +
        `<path d="M542 604C548 596 562 592 574 594C586 596 596 600 600 606C594 610 578 612 562 612C552 612 544 610 542 604Z" fill="#17121a"/>` +
        `<path d="M574 596C584 598 592 602 598 606" stroke="#3a3346" stroke-width="2" fill="none"/>` +
        // trims
        `<path d="M300 404C318 384 350 372 380 368M500 404C488 384 456 372 418 368" stroke="${ZL.gold}" stroke-width="5" fill="none"/>` +
        `<path d="M316 566H480" stroke="#1c120c" stroke-width="22"/><path d="M316 556H480M314 576H482" stroke="${ZL.gold}" stroke-width="3"/>` +
        `<path d="M372 578C368 680 362 790 356 900M424 578C428 680 434 790 440 900" stroke="${ZL.gold}" stroke-width="2.5" fill="none" opacity=".6"/>` +
        `<path d="M398 460l14 18-14 18-14-18z" fill="none" stroke="${ZL.gold}" stroke-width="3" opacity=".7"/>` +
        // stand collar
        `<path d="M372 336V368Q398 376 424 368V336Z" fill="#2a1b13"/><path d="M372 338Q398 332 424 338" stroke="${ZL.gold}" stroke-width="4" fill="none"/>` +
        // face (lost profile, right)
        `<path d="M426 266C440 264 449 274 452 286L453 292C455 300 458 306 460 312L453 316C455 322 453 330 449 336C443 344 433 347 422 344Z" fill="url(#sk)"/>` +
        `<path d="M453 316C450 318 450 320 454 322" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
        `<path d="M442 293L454 291" stroke="#2a1810" stroke-width="2.8" stroke-linecap="round"/><path d="M441 298Q447 300 452 298" stroke="#c8323c" stroke-width="1.8" fill="none" opacity=".8"/>` +
        `<path d="M452 324Q448 326 445 325" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
        // hair: cranium, bangs, ponytail
        `<path d="M398 236C432 232 454 254 454 282C448 274 440 270 432 272C430 296 424 320 416 342C404 352 380 350 366 340C352 322 346 296 350 272C356 248 374 238 398 236Z" fill="url(#zh)"/>` +
        `<path d="M440 260C452 268 456 282 452 296C446 286 440 278 432 274Z" fill="${ZL.hair2}"/>` +
        `<path d="M444 276C448 300 446 326 440 352C438 358 436 362 434 366C436 340 436 316 434 292Z" fill="${ZL.hair2}"/>` +
        `<path d="M441 344C439 352 437 360 434 366C438 360 442 352 444 342Z" fill="${ZL.tip}"/>` +
        `<path d="M386 344C380 400 374 470 380 540C384 590 394 630 392 668C406 630 414 590 414 540C414 470 410 400 410 344Z" fill="url(#zp)"/>` +
        `<rect x="384" y="348" width="28" height="10" rx="3" fill="${ZL.gold}"/>` +
        `<path d="M366 262C380 248 404 244 424 252M360 290C366 300 372 320 380 340M380 270C384 296 392 320 396 346" stroke="#6a4632" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>` +
        // ear + tassel earring
        `<path d="M424 296C432 292 438 300 436 310C434 318 428 322 422 318Z" fill="${SK.sh}"/><path d="M428 302Q432 306 429 312" stroke="${SK.deep}" stroke-width="1.5" fill="none"/>` +
        `<circle cx="427" cy="323" r="3.5" fill="${ZL.gold}"/><path d="M427 326V342" stroke="${ZL.gold}" stroke-width="2.5"/>` +
        `<path d="M423 342H431L434 380H420Z" fill="#e2b25e"/><path d="M421 348H433" stroke="#a0702c" stroke-width="2"/>` +
        // rim light (Zhongli's sunward edge)
        `<path d="M398 236C432 232 454 254 454 282M500 404C512 432 512 488 500 520M530 478L546 532C554 558 562 580 568 600" stroke="#ffe3a0" stroke-width="3.5" fill="none" opacity=".85" stroke-linecap="round"/>` +
        // ---- Childe (right, from behind, head turned toward Zhongli) ----
        `<path d="M722 640L716 900H796L802 700L808 900H886L880 640Z" fill="#2b2c35"/><path d="M802 700V900" stroke="#17181e" stroke-width="5"/>` +
        `<path d="M770 384C740 388 714 400 704 422C694 444 692 474 696 510C700 540 710 560 718 584L714 660C750 670 852 670 888 660L884 584C892 560 902 540 906 510C910 474 906 444 896 422C886 400 862 388 836 384Z" fill="url(#cj)"/>` +
        `<path d="M896 422C904 444 910 474 906 510C902 540 892 560 884 584L888 660H858C860 600 864 540 872 500C878 470 886 440 896 422Z" fill="#2a2d34" opacity=".35"/>` +
        `<path d="M712 470C750 450 850 450 890 470" stroke="#3a3d45" stroke-width="8" fill="none" opacity=".5"/>` +
        // left arm to the contract, bare hand reaching for Zhongli's
        `<path d="M710 418C690 430 680 460 672 494L656 548C648 570 640 586 634 600L660 608C668 588 680 564 690 540L708 486Z" fill="#5b606b"/>` +
        `<path d="M634 600L662 606" stroke="#33363d" stroke-width="10"/><path d="M634 594L664 600" stroke="#c8323c" stroke-width="3"/>` +
        `<path d="M660 610C652 600 638 596 628 598C618 600 610 604 608 610C614 614 628 616 640 616C650 616 658 614 660 610Z" fill="url(#sk)"/>` +
        `<path d="M616 606Q622 604 628 606" stroke="${SK.sh}" stroke-width="2" fill="none"/>` +
        // red sash + Hydro Vision at the hip
        `<path d="M716 600H886" stroke="#2c2f36" stroke-width="16"/><path d="M716 594H886" stroke="#c8323c" stroke-width="4"/>` +
        `<g transform="translate(734 630)"><path d="M0-14V-26" stroke="${ZL.gold}" stroke-width="3"/><path d="M0-14L16 4L0 22L-16 4Z" fill="#8a6a2e"/><path d="M0-8L10 4L0 16L-10 4Z" fill="#3aa0e6"/><path d="M0-8L5 0L0 4Z" fill="#d6f2ff"/></g>` +
        // red scarf: knot at the neck, tail down the back
        `<path d="M768 362C786 352 828 352 850 362C858 374 856 388 848 396C820 388 790 390 772 398C762 388 760 372 768 362Z" fill="${CH.scarf}"/>` +
        `<path d="M770 368C796 360 826 360 848 366" stroke="#ec6a70" stroke-width="3" fill="none"/>` +
        `<path d="M800 392C794 440 788 490 792 548L826 552C822 500 828 444 834 394Z" fill="#a82730"/>` +
        `<path d="M792 548L786 572L800 556L808 576L816 556L828 570L826 552Z" fill="#a82730"/>` +
        `<path d="M806 400C802 440 800 480 804 530" stroke="#d24850" stroke-width="3" fill="none" opacity=".7"/>` +
        // face sliver (lost profile, left)
        `<path d="M784 290C772 292 764 302 762 314L760 322C756 328 752 332 750 336L756 340C754 346 756 354 760 360C766 366 774 370 784 368Z" fill="url(#sk)"/>` +
        `<path d="M756 340C759 342 759 344 755 346" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
        `<path d="M766 317L756 315" stroke="#5a2a18" stroke-width="2.6" stroke-linecap="round"/>` +
        `<path d="M758 350Q763 353 767 351" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
        `<ellipse cx="770" cy="338" rx="7" ry="4" fill="#ff8a8a" opacity=".35"/>` +
        // ear
        `<path d="M784 316C776 312 770 320 772 330C774 340 780 344 786 340Z" fill="${SK.sh}"/>` +
        // messy ginger hair (soft locks)
        `<path d="M804 262C838 262 858 290 856 324C854 346 844 362 828 372C812 376 796 370 788 356C786 330 780 310 768 300C772 278 786 264 804 262Z" fill="url(#chh)"/>` +
        `<path d="${lock(780, 270, -150, 22, 30, -8)}${lock(800, 262, -105, 20, 34, 10)}${lock(830, 268, -60, 22, 34, 12)}${lock(850, 292, -20, 20, 34, 12)}${lock(856, 326, 20, 18, 32, 10)}${lock(846, 352, 60, 20, 30, 8)}" fill="${CH.hair2}"/>` +
        `<path d="${lock(782, 274, -140, 18, 28, -7)}${lock(804, 266, -100, 16, 30, 9)}${lock(832, 272, -58, 18, 30, 10)}${lock(850, 296, -18, 16, 30, 10)}${lock(852, 330, 22, 14, 28, 8)}${lock(838, 356, 70, 18, 30, 6)}${lock(816, 366, 95, 18, 28, 5)}${lock(796, 360, 108, 16, 22, -4)}" fill="${CH.hair}"/>` +
        `<path d="${lock(788, 284, 150, 30, 22, -7)}${lock(782, 294, 125, 26, 16, -5)}" fill="${CH.hair}"/>` +
        `<path d="M794 284C808 276 830 280 842 294M798 312C812 304 832 310 846 324M806 340C818 336 832 342 840 354" stroke="${CH.hair2}" stroke-width="3.5" fill="none" opacity=".5" stroke-linecap="round"/>` +
        `<path d="M796 274C810 268 826 272 838 282" stroke="${CH.hi}" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>` +
        // Fatui mask pushed up on the left side of his head
        `<g transform="translate(784 280) rotate(-32) scale(1.2)"><path d="M-30-4C-20-15-8-12 0-6C8-12 20-15 30-4C26 7 17 11 8 8L0 4L-8 8C-17 11-26 7-30-4Z" fill="${CH.mask}"/>` +
        `<path d="M-20-4Q-13-9-6-3Q-13 1-20-4ZM20-4Q13-9 6-3Q13 1 20-4Z" fill="#2a1416"/><path d="M-30-4L-40-13M30-4L40-13" stroke="${CH.mask}" stroke-width="4" stroke-linecap="round"/>` +
        `<path d="M-26-6C-19-13-9-11 0-5" stroke="#f07a80" stroke-width="2" fill="none"/></g>` +
        // rim light (Childe's sunward edge)
        `<path d="M766 262C778 258 790 260 802 262M762 314L760 322M704 422C694 444 692 474 694 512M672 494L656 548C648 570 640 586 634 600" stroke="#ffe3a0" stroke-width="3.5" fill="none" opacity=".85" stroke-linecap="round"/>` +
        // light spilling through the gap
        `<path d="M600 455L470 900H730Z" fill="#fff0c0" opacity=".08"/>` +
        // warm haze + motes
        `<rect width="1200" height="900" fill="#ffb060" opacity=".06"/>` +
        `<path d="${dots(12, 500, 700, 200, 520, 2, 6)}" fill="#fff4cc" opacity=".35"/>`,
        0.06, 0.6);
    },
  });

  // shared: lantern (hanging), centred at x,y
  const lantern = (x, y, s, glow = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + (glow ? `<circle r="60" fill="url(#lglow)"/>` : '') +
    `<path d="M0-40V-30" stroke="#3a2a20" stroke-width="3"/><rect x="-12" y="-32" width="24" height="7" rx="2" fill="#d9aa55"/>` +
    `<path d="M-22-25C-30-10-30 10-22 25H22C30 10 30-10 22-25Z" fill="#e0453c"/><path d="M-8-25C-12-8-12 8-8 25M8-25C12-8 12 8 8 25" stroke="#ff9a6a" stroke-width="2" fill="none" opacity=".7"/>` +
    `<rect x="-12" y="25" width="24" height="6" rx="2" fill="#d9aa55"/><path d="M0 31V48" stroke="#d9aa55" stroke-width="3"/></g>`;
  const LGLOW = rg('lglow', [[0, '#ffb35a', 0.55], [1, '#ff8a3a', 0]]);
  // Liyue skyline (city on a hill) between x0..x1 with base y; returns path + lights
  const skyline = (x0, x1, y, hmax, c, lights) => {
    let d = `M${x0} ${y}`, x = x0;
    while (x < x1) {
      const w = rr(24, 60), h = hmax * (0.35 + 0.65 * Math.sin(((x - x0) / (x1 - x0)) * Math.PI)) * rr(0.6, 1);
      d += `V${f(y - h)}h${f(w * 0.15)}l${f(w * 0.1)} ${-f(rr(6, 14))}h${f(w * 0.5)}l${f(w * 0.1)} ${f(rr(6, 14))}h${f(w * 0.15)}`;
      x += w;
    }
    d += `V${y}Z`;
    return `<path d="${d}" fill="${c}"/>` + (lights ? `<path d="${dots(lights, x0 + 10, x1 - 10, y - hmax * 0.8, y - 4, 1.2, 2.6)}" fill="#ffd27a"/>` : '');
  };

  // ==== Northbound ==========================================================================
  def('end_northbound', {
    title: 'Northbound',
    w: 1200, h: 900, tags: ['ending', 'zl', 'me'],
    svg: () => {
      seed(21);
      const H = 470;
      let posts = '';
      for (let x = 30; x < 1200; x += 96) posts += `M${x - 6} 588h12v232h-12z`;
      let planks = '';
      for (let i = -8; i <= 8; i++) planks += `M${600 + i * 30} ${H}L${600 + i * 220} 900`;
      return svg(
        lg('sky', [[0, '#25295a'], [0.35, '#6e4880'], [0.62, '#d86f6e'], [0.82, '#f6a458'], [1, '#ffdc94']]) +
        rg('sun', [[0, '#fffbe6'], [0.1, '#ffe7a8'], [0.35, '#ffb067', 0.5], [1, '#ff7a4a', 0]]) +
        lg('sea', [[0, '#e99a6c'], [0.18, '#a86a78'], [0.5, '#4a4a74'], [1, '#1c2c48']]) +
        lg('rail', [[0, '#8a5a3a'], [1, '#4a2e22']]) +
        lg('zc', [[0, ZL.coat], [1, ZL.coat2]]) +
        lg('zp', [[0, ZL.hair2], [0.55, ZL.hair], [0.82, '#8a5426'], [1, ZL.tip]]) +
        lg('cj', [[0, CH.jacket], [1, CH.jacket2]]) +
        lg('chh', [[0, CH.hi], [0.5, CH.hair], [1, CH.hair2]], 0, 0, 0.4, 1) +
        lg('deck', [[0, '#6a4a3e'], [1, '#2e2024']]) + LGLOW,
        `<rect width="1200" height="${H}" fill="url(#sky)"/>` +
        `<circle cx="960" cy="${H - 14}" r="440" fill="url(#sun)"/>` +
        `<circle cx="960" cy="${H - 6}" r="44" fill="#fff4cf"/>` +
        // clouds
        `<path d="M700 330C780 314 860 326 940 318S1110 322 1200 312V338C1100 346 1000 344 920 348S760 344 700 330Z" fill="#ffc28a" opacity=".55"/>` +
        `<path d="M760 410C840 398 920 404 1010 400S1150 404 1200 398V414C1120 420 1010 418 930 422S810 420 760 410Z" fill="#ffd8a0" opacity=".55"/>` +
        `<path d="M0 180C120 160 260 176 380 166S600 170 660 184C560 196 400 190 280 196S80 194 0 200Z" fill="#9a5a86" opacity=".5"/>` +
        `<path d="M0 260C90 248 200 258 300 252" stroke="#e78a86" stroke-width="5" fill="none" opacity=".5"/>` +
        // far coast + Liyue Harbor
        `<path d="M0 ${H}V420C40 400 70 404 100 386C130 368 160 380 190 372L250 ${H}Z" fill="#6a4470" opacity=".7"/>` +
        skyline(60, 470, H, 70, '#55365e', 70) +
        `<path d="M150 ${H}V300C150 290 160 282 170 282C180 282 190 290 190 300V${H}Z" fill="#4a2e55"/>` +
        roof(170, 300, 64, 22, '#4a2e55') + roof(170, 336, 74, 22, '#4a2e55') +
        `<path d="M160 312h20M156 350h28" stroke="#ffcf6a" stroke-width="3" opacity=".8"/>` +
        `<path d="M60 ${H}H470" stroke="#ffcf6a" stroke-width="3" opacity=".6"/>` +
        // sky lanterns over the harbour
        `<g fill="#ffc46a">${[[120, 250, 5], [196, 214, 4], [262, 268, 6], [330, 226, 3.5], [380, 296, 4], [90, 330, 3], [230, 170, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 3}" opacity=".18"/><ellipse cx="${x}" cy="${y}" rx="${r * 0.8}" ry="${r}"/>`).join('')}</g>` +
        // sea, glitter, wake
        `<rect y="${H}" width="1200" height="${900 - H}" fill="url(#sea)"/>` +
        `<path d="M960 ${H}L860 900H1100Z" fill="#ffe0a0" opacity=".16"/>` +
        `<path d="${dots(60, 860, 1080, H + 4, 640, 1.2, 3.5)}" fill="#fff0c0" opacity=".85"/>` +
        `<path d="M300 ${H + 2}C360 520 420 580 380 900H880C780 620 420 520 300 ${H + 2}Z" fill="#cfe2ea" opacity=".14"/>` +
        `<path d="M300 ${H + 2}C380 540 470 640 520 900M300 ${H + 2}C420 520 620 620 820 900" stroke="#f4f0ea" stroke-width="4" fill="none" opacity=".3"/>` +
        `<path d="M320 486C380 520 440 560 470 620C430 580 370 530 320 486ZM330 484C420 510 520 560 600 640C520 590 420 530 330 484Z" fill="#fff" opacity=".18"/>` +
        `<path d="${dots(40, 380, 760, 560, 800, 2, 6)}" fill="#f4f0ea" opacity=".18"/>` +
        `<path d="M500 900C540 820 640 780 760 900Z" fill="#e6f0f2" opacity=".18"/>` +
        // gulls
        `<path d="M880 260q12-10 22 0q10-10 22 0M932 232q8-7 15 0q7-7 15 0" stroke="#3a2a40" stroke-width="3" fill="none"/>` +
        // ---- stern rail ----
        `<path d="${posts}" fill="url(#rail)"/>` +
        `<rect y="660" width="1200" height="8" fill="#5a3a2a"/><rect y="740" width="1200" height="8" fill="#5a3a2a"/>` +
        `<rect y="800" width="1200" height="60" fill="#e8e2d6"/><rect y="800" width="1200" height="8" fill="#b44a3c"/><rect y="852" width="1200" height="8" fill="#9a9086"/>` +
        `<rect y="574" width="1200" height="18" rx="4" fill="url(#rail)"/><path d="M0 576H1200" stroke="#f3b27a" stroke-width="3" opacity=".7"/>` +
        `<rect y="858" width="1200" height="42" fill="url(#deck)"/>` +
        // flag at the stern corner
        `<path d="M1120 100V860" stroke="#d9c6a8" stroke-width="7"/><circle cx="1120" cy="98" r="7" fill="#d9aa55"/>` +
        `<path d="M1116 110C1070 104 1030 124 990 118C1000 140 996 158 990 178C1030 184 1070 164 1116 170Z" fill="#1f6a6a"/><path d="M1060 132l10 12-10 12-10-12z" fill="#d9aa55"/>` +
        // trunk at Zhongli's feet
        `<g transform="translate(470 790)"><rect x="-60" y="0" width="120" height="76" rx="8" fill="#6b3e24"/><rect x="-60" y="0" width="120" height="16" rx="6" fill="#4a2a18"/>` +
        `<path d="M-30 0V76M30 0V76" stroke="#d9aa55" stroke-width="5"/><rect x="-12" y="-14" width="24" height="12" rx="4" fill="none" stroke="#3a2416" stroke-width="5"/>` +
        `<rect x="34" y="22" width="22" height="30" rx="3" fill="#f2ead8" transform="rotate(8 45 37)"/><path d="M40 30h12M40 36h10" stroke="#3aa0e6" stroke-width="2" transform="rotate(8 45 37)"/></g>` +
        // ---- Zhongli (from behind) ----
        `<path d="M586 860L590 820H646L652 860Z" fill="#1c1410"/>` +
        `<path d="M600 478C582 480 568 486 562 500C556 516 556 540 560 566C564 586 572 600 580 612C576 680 572 760 572 830H664C664 760 660 680 656 612C664 600 672 586 676 566C680 540 680 516 674 500C668 486 652 480 636 478Z" fill="url(#zc)"/>` +
        `<path d="M562 500C556 516 556 540 560 566C564 586 572 600 580 612C576 680 572 760 572 830H594C590 740 590 640 594 590C580 560 570 530 562 500Z" fill="#120a06" opacity=".4"/>` +
        `<path d="M578 612H658" stroke="#1c120c" stroke-width="12"/><path d="M578 606H658M578 618H658" stroke="${ZL.gold}" stroke-width="2"/>` +
        `<path d="M618 620L610 830H626Z" fill="#140c08"/><path d="M618 620L610 830M618 620L626 830" stroke="${ZL.gold}" stroke-width="2"/>` +
        `<path d="M562 500C574 488 592 482 606 482M674 500C664 488 646 482 630 482" stroke="${ZL.gold}" stroke-width="3.5" fill="none"/>` +
        // left arm resting on the rail
        `<path d="M562 504C550 520 544 548 544 578L566 580C566 560 568 540 572 522Z" fill="#2e1f17"/><path d="M542 576h26" stroke="${ZL.gold}" stroke-width="3"/><path d="M542 580C540 588 546 594 556 594C564 594 570 588 568 580Z" fill="#141014"/>` +
        `<path d="M604 448V480Q618 486 632 480V448Z" fill="#2a1b13"/><path d="M604 450Q618 446 632 450" stroke="${ZL.gold}" stroke-width="3" fill="none"/>` +
        `<path d="M618 404C640 404 652 422 650 444C648 458 642 466 634 470C622 474 610 474 600 468C590 458 586 444 588 430C590 414 602 404 618 404Z" fill="#3a2419"/>` +
        `<path d="M600 418C610 410 628 410 640 418M594 440C598 452 604 460 612 466" stroke="#6a4632" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>` +
        `<path d="M610 466C606 520 602 580 610 640C620 600 628 540 626 466Z" fill="url(#zp)"/>` +
        `<rect x="606" y="464" width="22" height="7" rx="2" fill="${ZL.gold}"/>` +
        `<path d="M588 438C584 440 584 452 590 454" stroke="#e8b898" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M586 456V488" stroke="${ZL.gold}" stroke-width="2.5"/><path d="M583 474h6l2 18h-10z" fill="#e2b25e"/>` +
        // ---- Childe (from behind, head on Zhongli's shoulder) ----
        `<path d="M662 860L664 700H758L762 860Z" fill="#2b2c35"/><path d="M710 720V860" stroke="#17181e" stroke-width="4"/>` +
        `<path d="M690 512C672 516 660 526 656 542C652 560 654 584 660 606C664 620 668 636 668 652L666 708H760L758 652C758 636 762 620 766 606C772 584 772 560 768 542C764 526 750 516 734 512Z" fill="url(#cj)"/>` +
        `<path d="M768 542C772 560 772 584 766 606C762 620 758 636 758 652L760 708H738C740 660 744 610 752 576C756 560 762 548 768 542Z" fill="#2a2d34" opacity=".4"/>` +
        `<path d="M666 664H760" stroke="#2c2f36" stroke-width="10"/><path d="M666 660H760" stroke="#c8323c" stroke-width="3"/>` +
        `<g transform="translate(676 684)"><path d="M0-8L9 2L0 12L-9 2Z" fill="#8a6a2e"/><path d="M0-4L5 2L0 8L-5 2Z" fill="#3aa0e6"/></g>` +
        // right arm on the rail
        `<path d="M766 546C778 560 784 572 786 584L768 590C764 580 760 570 756 560Z" fill="#5b606b"/><path d="M764 584h26v8h-26z" fill="#f2c8ab"/>` +
        // scarf, tail fluttering in the wind
        `<path d="M684 494C700 486 728 488 742 498C746 508 744 518 738 522C718 516 700 516 688 522C680 514 680 502 684 494Z" fill="${CH.scarf}"/>` +
        `<path d="M732 512C760 520 790 512 820 520C840 526 860 520 878 512C866 530 846 540 822 538C796 536 770 540 744 528Z" fill="#b02a34"/>` +
        `<path d="M878 512L896 504L884 522L900 526L872 534Z" fill="#b02a34"/>` +
        // head tilted onto Zhongli's shoulder
                chBack(694, 470, 33, -22) +
        // rim light from the sunset (right edges)
        `<path d="M650 444C648 458 642 466 634 470M674 500C680 516 680 540 676 566M768 542C772 560 772 584 766 606" stroke="#ffd79a" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>` +
        // ferry lanterns overhead (foreground)
        `<path d="M-20 60Q300 200 640 150T1240 40" stroke="#2a1a1a" stroke-width="3" fill="none"/>` +
        lantern(150, 150, 1.3) + lantern(400, 196, 1.15) + lantern(860, 110, 1.2) +
        `<rect width="1200" height="900" fill="#ff8a4a" opacity=".05"/>`,
        0.06, 0.65);
    },
  });

  // Childe in profile facing left; ear at (0,0), head ~160 tall. mood: 0 calm/sad
  const chProfile = (skin = 'url(#sk)') =>
    // neck
    `<path d="M-30 56L-34 130H20L16 36Z" fill="${SK.sh}"/>` +
    // face
    `<path d="M-58-72C-66-60-70-48-71-36C-73-28-75-22-74-16C-80-6-88 4-92 12C-90 16-84 18-79 20C-79 24-81 28-80 31C-78 33-76 35-77 37C-79 39-79 42-77 44C-74 47-73 52-72 58C-70 64-64 70-54 72C-40 74-22 70-8 62L14 30L30-60Z" fill="${skin}"/>` +
    `<path d="M-82 15Q-80 18-83 19" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
    `<path d="M-78 33Q-75 34-73 33" stroke="#c46a62" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-50" cy="22" rx="14" ry="8" fill="#ff8a8a" opacity=".25"/>` +
    // eye (half-lidded, looking back)
    `<path d="M-70-10C-66-15-56-16-49-12C-54-6-62-4-70-6Z" fill="#fff"/>` +
    `<ellipse cx="-63" cy="-9" rx="5" ry="6.5" fill="${CH.eye}"/><circle cx="-64" cy="-11" r="1.6" fill="#c9e2f5" opacity=".7"/>` +
    `<path d="M-73-12C-66-18-56-19-46-14" stroke="#3a1a10" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    `<path d="M-70-5Q-62-2-52-6" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
    `<path d="M-76-27Q-62-31-46-28" stroke="#8f3c1c" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    // ear
    `<path d="M-8-14C4-20 14-10 12 6C10 20 2 26-8 22Z" fill="${SK.sh}"/><path d="M-2-8C6-8 8 4 2 12" stroke="${SK.deep}" stroke-width="2.5" fill="none"/>`;
  // Childe's hair in profile (facing left), wind pushing locks to the left
  const chProfileHair = () =>
    `<path d="M-64-56C-60-92-20-112 20-104C56-96 76-64 70-24C66 6 50 30 30 48C22 38 16 26 12 14C10-6 2-20-10-24C-30-30-46-40-56-50Z" fill="url(#chh)"/>` +
    `<path d="${lock(-40, -84, 190, 50, 34, -14)}${lock(-56, -64, 165, 40, 30, -10)}${lock(-60, -50, 140, 34, 22, -8)}${lock(-24, -60, 150, 50, 22, -10)}${lock(-2, -40, 115, 52, 22, -8)}${lock(-6, -96, 205, 46, 30, -10)}${lock(36, -98, 220, 40, 34, -12)}${lock(62, -60, 250, 30, 34, -10)}${lock(64, -10, 180, 26, 30, 10)}${lock(40, 36, 140, 36, 30, 8)}${lock(24, 44, 115, 32, 22, 6)}" fill="${CH.hair}"/>` +
    `<path d="M-30-90C-10-98 20-98 40-88M-36-70C-16-80 14-82 40-72M10-40C26-46 44-44 56-34" stroke="${CH.hair2}" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>` +
    `<path d="M-24-98C-4-106 22-104 40-94" stroke="${CH.hi}" stroke-width="6" fill="none" opacity=".8" stroke-linecap="round"/>` +
    `<g transform="translate(6 -72) rotate(-18) scale(1.25)">${MASK()}</g>`;
  // glaze lily bloom
  const lily = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="40" fill="url(#lilyglow)"/>` +
    `<path d="M0 0C-4-12-2-22 0-28C2-22 4-12 0 0ZM0 0C-12-6-20-4-26 2C-18 4-10 4 0 0ZM0 0C12-6 20-4 26 2C18 4 10 4 0 0ZM0 0C-8 6-10 14-10 20C-4 14 0 8 0 0ZM0 0C8 6 10 14 10 20C4 14 0 8 0 0Z" fill="#e8f6ff"/>` +
    `<circle r="3" fill="#9fd4ff"/><path d="M0 4V40" stroke="#6fae9a" stroke-width="2.5"/></g>`;

  // ==== Contract Fulfilled ==================================================================
  def('end_fulfilled', {
    title: 'Contract Fulfilled',
    w: 1200, h: 900, tags: ['ending', 'me', 'zl'],
    svg: () => {
      seed(33);
      const H = 560;
      let posts = '';
      for (let x = 20; x < 1200; x += 110) posts += `M${x - 7} 712h14v190h-14z`;
      return svg(
        lg('sky', [[0, '#1b2048'], [0.4, '#3d3a72'], [0.7, '#8a5a8e'], [0.88, '#d98a8a'], [1, '#f2b48e']]) +
        lg('sea', [[0, '#a87a96'], [0.12, '#5d5a86'], [0.5, '#2c3a62'], [1, '#141c34']]) +
        lg('chh', [[0, CH.hi], [0.5, CH.hair], [1, CH.hair2]], 0, 0, 0.4, 1) +
        lg('sk', [[0, '#f4d6c6'], [1, '#e2b6a4']], 0, 0, 1, 1) +
        lg('cj', [[0, '#6a6f80'], [1, '#3c404c']], 0, 0, 1, 1) +
        lg('rail', [[0, '#7a5240'], [1, '#3a241c']]) +
        rg('lamp', [[0, '#ffd28a', 0.85], [0.3, '#ffb060', 0.35], [1, '#ff9040', 0]]) +
        rg('lilyglow', [[0, '#d8f0ff', 0.95], [0.35, '#9fd4ff', 0.4], [1, '#9fd4ff', 0]]),
        `<rect width="1200" height="${H}" fill="url(#sky)"/>` +
        `<path d="${dots(50, 0, 1200, 0, 300, 0.8, 1.8)}" fill="#fff" opacity=".7"/>` +
        `<path d="M232 120a34 34 0 1 0 30 50a28 28 0 1 1-30-50z" fill="#fff4dc" opacity=".9"/>` +
        `<path d="M0 420C200 400 420 418 640 404S1000 410 1200 398V430C1000 440 820 432 640 440S240 440 0 450Z" fill="#c07a8e" opacity=".35"/>` +
        // far shore: Liyue at dusk
        `<path d="M0 ${H}V470C60 440 120 446 180 420C230 400 280 430 330 440C380 450 420 470 470 ${H}Z" fill="#3e3460"/>` +
        skyline(0, 480, H, 60, '#2e2850', 60) +
        roof(110, 470, 70, 24, '#2e2850') + `<path d="M96 ${H}V470H124V${H}Z" fill="#2e2850"/>` +
        `<path d="M480 ${H}C560 548 640 552 720 546S900 550 1000 556L1200 ${H}Z" fill="#4a3d6a" opacity=".6"/>` +
        // sea
        `<rect y="${H}" width="1200" height="${900 - H}" fill="url(#sea)"/>` +
        `<path d="${dots(40, 0, 520, H + 4, 640, 1, 2.4)}" fill="#ffcf8a" opacity=".55"/>` +
        `<path d="M200 ${H + 6}H340M60 ${H + 16}H200M380 ${H + 20}H460M600 590H760M820 620H980" stroke="#e8b0a8" stroke-width="2.5" opacity=".35" stroke-linecap="round"/>` +
        // the pier reaching out from the shore; the small figure with the lily at its end
        `<path d="M300 ${H - 3}L600 ${H + 9}V${H + 17}L300 ${H + 7}Z" fill="#241c34"/>` +
        `<path d="${[330, 390, 450, 510, 570, 596].map((x) => `M${x} ${f(H + 5 + (x - 300) * 0.04)}v24`).join('')}" stroke="#241c34" stroke-width="5"/>` +
        `<path d="${[340, 440, 540].map((x) => `M${x} ${f(H - 2 + (x - 300) * 0.04)}v-22`).join('')}" stroke="#241c34" stroke-width="3"/>` +
        `<g fill="#ffcf7a">${[340, 440, 540].map((x) => `<circle cx="${x}" cy="${f(H - 26 + (x - 300) * 0.04)}" r="4"/><circle cx="${x}" cy="${f(H - 26 + (x - 300) * 0.04)}" r="12" opacity=".25"/>`).join('')}</g>` +
        `<path d="M340 596v40M440 600v36M540 604v34" stroke="#ffcf7a" stroke-width="3" opacity=".25"/>` +
        `<g transform="translate(578 571) scale(1.3)"><path d="M-7-44C-3-48 3-48 6-44C8-40 7-35 4-33L9-30C12-20 12-8 11 0H-11C-12-8-11-22-8-30L-4-33C-7-35-8-40-7-44Z" fill="#1a1426"/>` +
        `<path d="M-5-38C-10-30-11-18-9-8" stroke="#1a1426" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M-9-14l-1 6" stroke="#c98a40" stroke-width="2.5" stroke-linecap="round"/></g>` +
        lily(596, 524, 0.6) +
        `<path d="M592 596V680" stroke="#bfe4ff" stroke-width="6" opacity=".22"/><path d="M586 606H598M584 626H600M588 648H596" stroke="#d8f0ff" stroke-width="2" opacity=".4"/>` +
        // wake back toward the pier
        `<path d="M640 586C720 620 800 700 860 900H700C700 780 680 660 640 586Z" fill="#d9e4f2" opacity=".06"/>` +
        `<path d="${dots(30, 640, 860, 640, 900, 1.5, 3)}" fill="#e8eef6" opacity=".15"/>` +
        // deck lamp (warm, behind Childe)
        `<circle cx="1110" cy="330" r="300" fill="url(#lamp)"/>` +
        `<path d="M1110 340V900" stroke="#2a1c1a" stroke-width="10"/><rect x="1090" y="296" width="40" height="52" rx="8" fill="#ffd28a"/><path d="M1086 296h48l-8-14h-32z" fill="#2a1c1a"/>` +
        // ---- Childe ----
        // torso + near arm on the rail
        `<path d="M846 486C870 478 900 478 922 488C952 500 976 524 988 560C1000 600 1002 680 1000 760L1004 900H790L806 760C800 700 806 620 820 560C826 530 834 504 846 486Z" fill="url(#cj)"/>` +
        `<path d="M978 540C996 580 1002 660 1000 740L1004 900H962C964 800 968 700 966 620C966 590 972 560 978 540Z" fill="#ffb878" opacity=".2"/>` +
        `<path d="M846 486C834 504 826 530 820 560C812 600 806 650 806 700" stroke="#2c2f3a" stroke-width="10" fill="none" opacity=".4"/>` +
        `<path d="M934 520C950 560 946 610 918 650C896 676 862 690 818 694L770 698C754 690 758 668 776 664L812 660C846 648 870 630 880 600C890 570 896 540 900 520Z" fill="#5a5f6e"/>` +
        `<path d="M900 520C896 540 890 570 880 600C870 630 846 648 812 660" stroke="#3a3e4a" stroke-width="5" fill="none" opacity=".6"/>` +
        `<path d="M934 520C950 560 946 610 918 650" stroke="#ffcf8a" stroke-width="3" fill="none" opacity=".5"/>` +
        `<path d="M770 700C748 702 734 694 736 682C738 670 752 666 770 668L798 670L796 696Z" fill="#e8b8a2"/><path d="M748 672Q756 670 764 674" stroke="#c98a76" stroke-width="2" fill="none"/>` +
        `<path d="M790 668L794 698" stroke="#c8323c" stroke-width="6"/>` +
        // rail in front of the arm
        `<rect y="704" width="1200" height="20" rx="4" fill="url(#rail)"/><path d="M0 706H1200" stroke="#d99a7a" stroke-width="2.5" opacity=".6"/>` +
        `<path d="${posts}" fill="url(#rail)"/><rect y="800" width="1200" height="8" fill="#3a241c"/>` +
        // scarf streaming toward the pier
        `<path d="M830 460C860 450 900 454 920 470C924 486 918 500 906 506C880 498 852 500 832 508C822 494 822 476 830 460Z" fill="#c8323c"/>` +
        `<path d="M832 476C800 470 770 486 730 478C700 472 680 486 650 482C670 500 700 504 730 500C770 496 800 504 836 496Z" fill="#b02a34"/>` +
        `<path d="M650 482L630 470L646 490L626 498L654 498Z" fill="#b02a34"/>` +
        // head
        `<g transform="translate(888 372)">${chProfile()}${chProfileHair()}</g>` +
        // warm rim on hair & shoulder
        `<path d="M928 270C964 282 970 320 958 360M960 530C984 556 996 610 1000 680" stroke="#ffcf8a" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>` +
        // cool sky light on the face side
        `<rect width="1200" height="900" fill="#3a3a80" opacity=".08"/>`,
        0.06, 0.7);
    },
  });

  // Zhongli in profile facing left; ear at (0,0). Needs #sk, #zh, #zp in defs.
  const zlProfile = () =>
    // ponytail down the back (behind everything)
    `<path d="M30 50C44 120 50 220 40 320C36 360 30 390 24 410C50 380 72 330 76 260C80 180 70 110 54 50Z" fill="url(#zp)"/>` +
    // face
    `<path d="M-56-72C-64-60-68-48-69-36C-71-28-73-22-72-16C-77-6-84 4-88 12C-86 16-81 18-77 20C-77 24-79 28-78 31C-76 33-74 35-75 37C-77 39-77 42-75 45C-72 50-71 56-70 62C-68 70-60 76-48 78C-34 79-18 72-6 62L14 30L30-60Z" fill="url(#sk)"/>` +
    `<path d="M-80 15Q-78 18-81 19" stroke="${SK.deep}" stroke-width="1.6" fill="none"/>` +
    `<path d="M-76 33Q-73 34-71 33" stroke="#b46a5e" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    // eye: narrow, amber, lowered, red-tinted liner
    `<path d="M-68-8C-62-13-52-13-45-9C-50-4-58-3-68-5Z" fill="#fff6ea"/>` +
    `<ellipse cx="-61" cy="-7" rx="4.5" ry="5" fill="${ZL.eye}"/><ellipse cx="-61" cy="-6" rx="2" ry="3" fill="#7a3a10"/>` +
    `<path d="M-71-10C-63-15-52-15-43-10L-38-12" stroke="#2a160e" stroke-width="3.6" fill="none" stroke-linecap="round"/>` +
    `<path d="M-60-4Q-50-3-42-8L-37-12" stroke="#c8323c" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>` +
    `<path d="M-74-26Q-60-29-44-27" stroke="#2a160e" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    // ear + tassel earring
    `<path d="M-8-14C4-20 14-10 12 6C10 20 2 26-8 22Z" fill="${SK.sh}"/><path d="M-2-8C6-8 8 4 2 12" stroke="${SK.deep}" stroke-width="2.5" fill="none"/>` +
    `<circle cx="0" cy="26" r="4" fill="${ZL.gold}"/><path d="M0 30V52" stroke="${ZL.gold}" stroke-width="2.5"/><circle cx="0" cy="54" r="4" fill="#3aa08a"/>` +
    `<path d="M-4 58H4L7 104H-7Z" fill="#e2b25e"/><path d="M-2 64V102M2 64V102" stroke="#a8782e" stroke-width="1.5"/>` +
    // hair: skull, bangs, long side lock with amber tip
    `<path d="M-60-62C-58-96-20-114 20-108C58-100 76-66 70-26C66 4 56 30 40 52L22 40C18 20 14 4 10-8C2-22-12-28-26-30C-40-36-52-48-60-62Z" fill="url(#zh)"/>` +
    `<path d="M-62-60C-70-46-76-34-78-18C-70-30-64-40-58-46C-60-34-62-24-60-14C-52-30-46-42-40-50C-30-54-20-56-12-56Z" fill="${ZL.hair}"/>` +
    `<path d="M-18-44C-22-14-22 18-18 50C-16 66-12 80-8 90C-4 66-4 36-6 10C-8-10-10-28-8-44Z" fill="url(#zs)"/>` +
    `<path d="M-30-92C-10-100 18-100 40-90M10-60C30-64 50-56 60-40" stroke="#6a4632" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>` +
    `<rect x="28" y="42" width="30" height="12" rx="4" fill="${ZL.gold}" transform="rotate(-20 43 48)"/>`;

  // ==== Unspoken ============================================================================
  def('end_unspoken', {
    title: 'Unspoken',
    w: 1200, h: 900, tags: ['ending', 'zl'],
    svg: () => {
      seed(44);
      const H = 556;
      let posts = '';
      for (let x = 40; x < 1200; x += 130) posts += `M${x - 8} 706h16v200h-16z`;
      return svg(
        lg('sky', [[0, '#0d1430'], [0.45, '#1e2d5a'], [0.75, '#3e4a7e'], [0.9, '#a86a7a'], [1, '#e89a72']]) +
        lg('sea', [[0, '#5a5a80'], [0.1, '#2c3c64'], [0.6, '#16254a'], [1, '#0b1428']]) +
        lg('sk', [[0, '#f2d2bc'], [1, '#d4a894']], 0, 0, 1, 1) +
        lg('zh', [[0, '#3c271c'], [1, '#1e130d']], 0, 0, 1, 1) +
        lg('zp', [[0, ZL.hair2], [0.6, ZL.hair], [0.85, '#8a5426'], [1, ZL.tip]]) +
        lg('zs', [[0, ZL.hair2], [0.7, '#5a3420'], [1, ZL.tip]]) +
        lg('zc', [[0, '#3e2b20'], [1, '#1e140e']], 0, 0, 1, 1) +
        lg('rail', [[0, '#6a4a3a'], [1, '#2a1c18']]) +
        rg('lamp', [[0, '#ffd28a', 0.8], [0.3, '#ffa860', 0.3], [1, '#ff9040', 0]]),
        `<rect width="1200" height="${H}" fill="url(#sky)"/>` +
        `<path d="${dots(70, 0, 1200, 0, 380, 0.8, 2)}" fill="#fff" opacity=".75"/>` +
        `<path d="M0 470C160 456 320 466 480 458S820 462 1000 452 1200 460 1200 460V476C1000 482 820 476 640 482S200 484 0 486Z" fill="#c07a86" opacity=".3"/>` +
        `<path d="M80 400C240 390 400 398 560 392" stroke="#7a6a9e" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/>` +
        // far headland (left) and the open horizon
        `<path d="M0 ${H}V520C40 506 80 510 120 500C150 494 170 506 190 ${H}Z" fill="#1c2244"/>` +
        `<path d="${dots(6, 10, 160, 520, 552, 1.2, 2)}" fill="#ffcf7a" opacity=".8"/>` +
        `<rect y="${H}" width="1200" height="${900 - H}" fill="url(#sea)"/>` +
        `<path d="M300 ${H + 6}H520M640 ${H + 14}H820M120 580H300M420 600H600M760 620H940M200 650H380" stroke="#8a90c0" stroke-width="2" opacity=".25" stroke-linecap="round"/>` +
        // the ferry: a tiny light on the horizon
        `<path d="M372 ${H - 1}h34l-4 5h-27z" fill="#0b1026"/><path d="M380 ${H - 7}h14v6h-14z" fill="#0b1026"/>` +
        `<circle cx="390" cy="${H - 6}" r="14" fill="#ffd28a" opacity=".22"/><circle cx="390" cy="${H - 6}" r="3" fill="#ffe2a8"/><circle cx="382" cy="${H - 3}" r="1.5" fill="#ffe2a8"/><circle cx="398" cy="${H - 3}" r="1.5" fill="#ffe2a8"/>` +
        `<path d="M384 ${H + 8}h12M380 ${H + 20}h20M386 ${H + 34}h8M378 ${H + 52}h24M386 ${H + 76}h10" stroke="#ffd28a" stroke-width="3" opacity=".4" stroke-linecap="round"/>` +
        // lamp at the end of Pier 7 (behind Zhongli)
        `<circle cx="1080" cy="300" r="320" fill="url(#lamp)"/>` +
        `<path d="M1080 330V900" stroke="#1a1214" stroke-width="12"/>` +
        lantern(1080, 300, 1.25, 0) +
        `<path d="M1080 ${H + 10}V900" stroke="#ffb060" stroke-width="18" opacity=".12"/><path d="M1070 600h20M1066 640h28M1072 690h16" stroke="#ffc070" stroke-width="3" opacity=".35"/>` +
        // ---- Zhongli ----
        `<path d="M836 470C866 462 896 464 920 476C950 492 972 520 984 560C996 610 998 690 996 760L1000 900H790L800 760C794 690 798 610 810 560C816 530 824 494 836 470Z" fill="url(#zc)"/>` +
        `<path d="M970 530C990 580 996 660 996 740L1000 900H962C964 800 966 700 962 620C960 580 962 550 970 530Z" fill="#ffb070" opacity=".16"/>` +
        `<path d="M836 470C824 494 816 530 810 560C800 610 794 690 800 760" stroke="${ZL.gold}" stroke-width="5" fill="none"/>` +
        `<path d="M818 600H990M816 612H992" stroke="${ZL.gold}" stroke-width="2" opacity=".5"/>` +
        // near arm, gloved hand on the rail
        `<path d="M930 510C946 560 940 610 912 648C890 674 858 688 816 692L768 696C752 688 756 666 774 662L810 658C842 646 864 628 874 598C884 568 890 540 894 512Z" fill="#33231a"/>` +
        `<path d="M894 512C890 540 884 568 874 598C864 628 842 646 810 658" stroke="#1a110b" stroke-width="5" fill="none" opacity=".7"/>` +
        `<path d="M806 656L812 692" stroke="${ZL.gold}" stroke-width="6"/>` +
        `<path d="M768 698C746 700 732 692 734 680C736 668 750 664 768 666L804 668L802 694Z" fill="#141018"/><path d="M742 676Q750 672 760 676M738 686Q748 682 758 686" stroke="#4a4256" stroke-width="2" fill="none"/>` +
        // high collar
        `<path d="M836 416C850 420 880 422 908 416L912 474C886 480 856 480 832 474Z" fill="#2a1b13"/>` +
        `<path d="M836 418C860 424 886 424 908 418" stroke="${ZL.gold}" stroke-width="4" fill="none"/><path d="M832 474C858 480 886 480 912 474" stroke="${ZL.gold}" stroke-width="3" fill="none"/>` +
        // head
        `<g transform="translate(886 352)">${zlProfile()}</g>` +
        // collar front overlaps the ponytail top? (ponytail stays behind)
        `<path d="M906 245C944 250 966 280 958 326" stroke="#ffc888" stroke-width="4" fill="none" opacity=".55" stroke-linecap="round"/>` +
        // rail
        `<rect y="698" width="1200" height="20" rx="4" fill="url(#rail)"/><path d="M0 700H1200" stroke="#c89a7a" stroke-width="2.5" opacity=".5"/>` +
        `<path d="${posts}" fill="url(#rail)"/><rect y="800" width="1200" height="8" fill="#2a1c18"/>` +
        // the cold cup of tea (no steam), an osmanthus flower floating
        `<g transform="translate(640 700)"><ellipse cx="0" cy="0" rx="24" ry="6" fill="#000" opacity=".3"/><path d="M-21-30H21L15 0Q0 6-15 0Z" fill="#9fc4b4"/><path d="M-21-30H21L19-22H-19Z" fill="#c2dccf"/>` +
        `<ellipse cx="0" cy="-30" rx="21" ry="5.5" fill="#d8eae0"/><ellipse cx="0" cy="-29.5" rx="17" ry="3.6" fill="#8a6a3a"/>` +
        `<g fill="#ffb84a"><circle cx="-4" cy="-30" r="2"/><circle cx="-1" cy="-31.5" r="2"/><circle cx="2" cy="-30" r="2"/><circle cx="-1" cy="-28.5" r="2"/></g></g>` +
        `<rect width="1200" height="900" fill="#1a2a6a" opacity=".1"/>`,
        0.07, 0.75);
    },
  });

  // Childe's phone from the back: matte Hydro-blue case, camera, child's sticker. Needs PHONE_DEFS.
  const PHONE_DEFS = lg('case', [[0, '#4fb2ee'], [0.5, '#3aa0e6'], [1, '#1d5fa8']], 0, 0, 1, 1) + rg('lens', [[0, '#5a6a9a'], [0.55, '#10121c'], [1, '#05060a']], 0.35, 0.35, 0.7);
  const phoneBack = (w, h, sticker = 1) => {
    const x = -w / 2, y = -h / 2, m = w * 0.4;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${f(w * 0.17)}" fill="url(#case)"/>` +
      `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="${f(w * 0.15)}" fill="none" stroke="#9fd8ff" stroke-width="2" opacity=".5"/>` +
      `<rect x="${f(x + w * 0.08)}" y="${f(y + w * 0.08)}" width="${f(m)}" height="${f(m)}" rx="${f(m * 0.26)}" fill="#1e5a96"/>` +
      [[0.27, 0.27], [0.27, 0.62], [0.62, 0.45]].map(([u, v]) => `<circle cx="${f(x + w * 0.08 + m * u)}" cy="${f(y + w * 0.08 + m * v)}" r="${f(m * 0.17)}" fill="url(#lens)" stroke="#5a8ac0" stroke-width="2"/>`).join('') +
      `<circle cx="${f(x + w * 0.08 + m * 0.75)}" cy="${f(y + w * 0.08 + m * 0.18)}" r="${f(m * 0.06)}" fill="#fff4d0"/>` +
      (sticker ? `<g transform="translate(${f(w * 0.06)} ${f(h * 0.14)}) rotate(-7)"><rect x="${f(-w * 0.36)}" y="${f(-w * 0.15)}" width="${f(w * 0.72)}" height="${f(w * 0.3)}" rx="${f(w * 0.06)}" fill="#fffaf0" stroke="#ffd25a" stroke-width="3"/>` +
        `<path d="M${f(-w * 0.29)} ${f(-w * 0.09)}l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#ffc83a"/>` +
        text(f(w * 0.04), f(-w * 0.02), "WORLD'S BEST", { size: f(w * 0.075), weight: 800, anchor: 'middle', fill: '#e0453c' }) +
        text(f(w * 0.04), f(w * 0.08), 'BIG BROTHER', { size: f(w * 0.075), weight: 800, anchor: 'middle', fill: '#2f6fb8' }) + `</g>` : '') +
      `<path d="M${x + 10} ${y + h * 0.3}C${x + 30} ${y + h * 0.1} ${x + w * 0.5} ${y + 8} ${x + w - 20} ${y + 6}" stroke="#fff" stroke-width="5" fill="none" opacity=".18" stroke-linecap="round"/>`;
  };
  // red fish charm hanging from (0,0)
  const fishCharm = (len = 40, s = 1) =>
    `<path d="M0 0C3 ${len * 0.4}-3 ${len * 0.7} 0 ${len}" stroke="#3a2a2a" stroke-width="2.5" fill="none"/><circle cx="0" cy="${len}" r="5" fill="none" stroke="#d9aa55" stroke-width="3"/>` +
    `<g transform="translate(0 ${len + 30}) scale(${s}) rotate(80)"><path d="M-24 0C-16-14 8-16 18-4L30-14L28 0L30 14L18 4C8 16-16 14-24 0Z" fill="#c8323c"/>` +
    `<path d="M-8-9C-4-3-4 3-8 9M0-10C4-3 4 3 0 10" stroke="#ff8a7a" stroke-width="2" fill="none"/><circle cx="-15" cy="-2" r="3" fill="#fff"/><circle cx="-15" cy="-2" r="1.4" fill="#2a1416"/>` +
    `<path d="M-14-10C-6-14 4-14 10-10" stroke="#ffb0a0" stroke-width="2" fill="none" opacity=".8"/></g>`;

  // ==== Return to Sender ====================================================================
  def('end_honest', {
    title: 'Return to Sender',
    w: 1200, h: 900, tags: ['ending', 'me', 'wangsheng'],
    svg: () => {
      seed(5);
      let beams = '';
      for (const [a, b] of [[60, 150], [190, 260], [300, 400], [440, 500]]) beams += `M${a} 60L${b} 60L${b + 760} 900L${a + 640} 900Z`;
      let lat = '';
      for (let i = 0; i <= 6; i++) lat += `M${70 + i * 66} 40V430M60 ${50 + i * 62}H470`;
      return svg(
        lg('wall', [[0, '#4a2a22'], [1, '#2a1612']]) +
        lg('win', [[0, '#fff8e2'], [1, '#ffdca0']]) +
        lg('beam', [[0, '#fff2c8', 0.55], [1, '#fff2c8', 0]], 0, 0, 0.6, 1) +
        lg('pillar', [[0, '#8a1e1e'], [0.4, '#c23a2e'], [1, '#6a1414']], 0, 0, 1, 0) +
        lg('ctr', [[0, '#5a2e1e'], [1, '#2e160e']]) +
        lg('ctop', [[0, '#8a4a2e'], [1, '#4a2416']]) +
        lg('sleeve', [[0, '#e6dccb'], [1, '#b8aa94']], 0, 0, 1, 1) +
        lg('skin', [[0, '#f8dcc6'], [1, '#e2b296']], 0, 0, 1, 1) +
        lg('coat', [[0, '#4a3226'], [1, '#22150e']], 0, 0, 1, 1) +
        lg('glove', [[0, '#3a3440'], [1, '#0e0c12']], 0, 0, 1, 1) +
        rg('bglow', [[0, '#ffb04a', 0.7], [1, '#ff7a2a', 0]]) + rg('pglow', [[0, '#ffe2a8', 0.45], [1, '#ffe2a8', 0]]) + PHONE_DEFS,
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        // lattice window, morning light
        `<rect x="60" y="40" width="410" height="390" fill="url(#win)"/>` +
        `<path d="${lat}" stroke="#4a2a1e" stroke-width="10"/>` +
        `<path d="M60 40h410v390H60z" fill="none" stroke="#3a1e14" stroke-width="18"/>` +
        `<path d="M120 100l40 40-40 40-40-40zM380 280l40 40-40 40-40-40z" fill="none" stroke="#4a2a1e" stroke-width="6"/>` +
        // vermilion pillar + plaque
        `<rect x="1040" y="0" width="110" height="900" fill="url(#pillar)"/><rect x="1030" y="0" width="130" height="30" fill="#d9aa55"/>` +
        `<rect x="600" y="70" width="380" height="120" rx="6" fill="#1a0e0c" stroke="#d9aa55" stroke-width="6"/>` +
        text(790, 156, '往生堂', { size: 70, weight: 700, anchor: 'middle', fill: '#e8c070', font: 'serif', ls: 16 }) +
        `<path d="M620 40V70M960 40V70" stroke="#3a2a20" stroke-width="4"/>` +
        // shelves with urns
        `<rect x="620" y="300" width="380" height="10" fill="#2a1410"/><rect x="620" y="420" width="380" height="10" fill="#2a1410"/>` +
        `<g fill="#3e221a">${[650, 720, 800, 880, 950].map((x, i) => `<path d="M${x - 18} 300C${x - 24} 270 ${x - 14} 250 ${x - 8} 246H${x + 8}C${x + 14} 250 ${x + 24} 270 ${x + 18} 300Z"/>`).join('')}</g>` +
        `<g fill="#4a2a20">${[680, 760, 900].map((x) => `<rect x="${x - 22}" y="370" width="44" height="50" rx="6"/>`).join('')}</g>` +
        // light beams
        `<path d="${beams}" fill="url(#beam)" opacity=".7"/>` +
        `<path d="${dots(40, 100, 900, 100, 700, 1.2, 3)}" fill="#fff6dc" opacity=".55"/>` +
        // counter
        `<path d="M0 640H1200V700H0Z" fill="url(#ctop)"/><path d="M0 640H1200" stroke="#d99a6a" stroke-width="3" opacity=".6"/>` +
        `<rect y="700" width="1200" height="200" fill="url(#ctr)"/><path d="M0 704H1200" stroke="#d9aa55" stroke-width="5"/>` +
        `<path d="${[100, 400, 700, 1000].map((x) => `M${x} 740h220v130h-220z`).join('')}" fill="none" stroke="#7a3e26" stroke-width="5"/>` +
        `<path d="${[210, 510, 810, 1110].map((x) => `M${x} 770l36 36-36 36-36-36z`).join('')}" fill="none" stroke="#d9aa55" stroke-width="3" opacity=".6"/>` +
        // bell + incense on the counter
        `<g transform="translate(820 652)"><ellipse cx="0" cy="0" rx="40" ry="8" fill="#000" opacity=".25"/><path d="M-30 0C-30-30-18-44 0-44C18-44 30-30 30 0Z" fill="#c99a40"/><circle cx="0" cy="-48" r="7" fill="#e8c070"/><path d="M-20-30C-14-38-6-40 4-40" stroke="#fff2c0" stroke-width="4" fill="none" opacity=".7"/></g>` +
        `<g transform="translate(960 652)"><ellipse cx="0" cy="0" rx="46" ry="9" fill="#000" opacity=".25"/><path d="M-38-30H38L30 0H-30Z" fill="#2e2a2a"/><rect x="-42" y="-36" width="84" height="8" rx="3" fill="#4a4040"/><path d="M-8-36V-90M6-36V-80" stroke="#8a5a3a" stroke-width="3"/><circle cx="-8" cy="-92" r="3" fill="#ff7a3a"/><circle cx="6" cy="-82" r="3" fill="#ff7a3a"/></g>` +
        steam(952, -0 + 560, 160, '#e8dccc', 0.5) +
        // shadow of the hands on the counter
        `<ellipse cx="610" cy="672" rx="300" ry="20" fill="#1a0a06" opacity=".35"/>` +
        `<circle cx="600" cy="420" r="300" fill="url(#pglow)"/>` +
        // ---- the handover (phone group, tilted) ----
        `<g transform="translate(600 420) rotate(-9)">` +
        // giver's arm (knit cardigan) from the left
        `<path d="M-232 36C-360 44-520 70-700 110V270C-520 236-360 200-226 182Z" fill="url(#sleeve)"/>` +
        `<path d="M-480 76C-420 110-380 140-330 186M-600 112C-520 150-470 186-420 222" stroke="#b8aa94" stroke-width="4" fill="none" opacity=".6"/>` +
        `<path d="M-252 34L-226 30L-214 184L-240 190Z" fill="#cfc2ac"/><path d="M-246 34L-234 188M-236 32L-224 186" stroke="#a8987e" stroke-width="3"/>` +
        // receiver's arm (coat) from the right
        `<path d="M232-150C380-164 520-184 700-206V-30C520-14 380 0 236 4Z" fill="url(#coat)"/>` +
        `<path d="M420-150C440-100 450-40 440 20" stroke="#140c08" stroke-width="5" fill="none" opacity=".5"/>` +
        `<path d="M214-152L240-154L246 6L220 8Z" fill="#2a1a12"/><path d="M214-150L222 8M238-152L246 6" stroke="#d9aa55" stroke-width="4"/>` +
        // gloved hand behind the phone's right edge
        `<path d="M86-150C120-162 170-164 214-150L222 6C180 16 130 18 88 10Z" fill="url(#glove)"/>` +
        `<path d="M120-120C150-128 180-128 210-120M118-70C150-76 182-74 214-66M118-24C150-28 184-26 216-20" stroke="#55505e" stroke-width="2.5" fill="none" opacity=".7"/>` +
        `<path d="M90-150C130-160 176-160 214-150" stroke="#7a7486" stroke-width="3" fill="none" opacity=".8"/>` +
        // giver's hand behind the phone's left edge
        `<path d="M-84 22C-120 14-180 22-232 36L-226 182C-180 178-130 168-86 150Z" fill="url(#skin)"/>` +
        `<path d="M-150 60C-130 90-126 120-130 160M-200 70C-184 100-182 130-186 170" stroke="#d29a7e" stroke-width="3" fill="none" opacity=".5"/>` +
        // the phone
        phoneBack(180, 350) +
        // gloved thumb on the case
        `<path d="M104-108C86-122 62-134 40-140C24-144 16-128 26-120C46-104 74-90 98-78Z" fill="url(#glove)"/>` +
        `<path d="M36-138C52-134 72-124 94-110" stroke="#8a8496" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<path d="M98-78C106-90 108-100 104-108" stroke="#0a080c" stroke-width="3" fill="none"/>` +
        // fingertip curling over the right edge
        `<path d="M92-40C80-44 74-36 78-28C82-20 92-20 98-24Z" fill="#1c1822"/>` +
        // giver's thumb on the case
        `<path d="M-100 76C-84 54-62 36-40 26C-24 20-14 34-24 44C-44 58-70 76-88 96Z" fill="url(#skin)"/>` +
        `<path d="M-38 26C-28 22-20 28-24 38C-32 38-38 34-38 26Z" fill="#fde8dc"/>` +
        `<path d="M-100 76C-92 82-88 90-88 96" stroke="#d29a7e" stroke-width="3" fill="none"/>` +
        // fingertip curling over the left edge
        `<path d="M-94 110C-80 106-74 114-78 122C-82 130-92 130-98 126Z" fill="#f2c8ac"/>` +
        // fish charm swinging from the bottom corner
        `<g transform="translate(-50 172) rotate(14)">${fishCharm(36, 1.1)}</g>` +
        `</g>` +
        // ghost-fire butterflies in the light
        bfly(330, 250, 0.9, -20, '#ff8a3a', 0.95, 'url(#bglow)') + bfly(860, 260, 0.7, 15, '#ff7a2a', 0.9, 'url(#bglow)') +
        bfly(980, 470, 0.55, -10, '#ffb04a', 0.8, 'url(#bglow)') + bfly(240, 470, 0.5, 25, '#fff0c8', 0.8) + bfly(520, 170, 0.45, 5, '#fff0c8', 0.7) +
        `<rect width="1200" height="900" fill="#ffcf8a" opacity=".05"/>`,
        0.06, 0.6);
    },
  });

  // chat bubble (right = outgoing)
  const bubble = (x, y, w, h, c, txt, o) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${f(Math.min(h / 2, 22))}" fill="${c}"/>` + text(x + 16, y + h / 2 + (o.size * 0.36), txt, o);

  // ==== The Balladeer's Gossip ==============================================================
  def('end_caught_scara', {
    title: "The Balladeer's Gossip",
    w: 1200, h: 900, tags: ['ending', 'scara'],
    svg: () => {
      seed(66);
      const FACE = 'M0-130C70-130 108-82 108-16C108 40 88 80 54 106C36 120 18 127 0 127C-18 127-36 120-54 106C-88 80-108 40-108-16C-108-82-70-130 0-130Z';
      let bolts = '';
      for (const [x, y, k] of [[150, 120, 1], [1060, 200, -1], [1000, 620, 1], [120, 560, -1]]) bolts += `M${x} ${y}l${30 * k} 50l${-18 * k} 6l${34 * k} 60`;
      const screen =
        `<rect x="-109" y="-229" width="218" height="458" rx="30" fill="url(#scr)"/>` +
        `<rect x="-109" y="-229" width="218" height="74" rx="30" fill="#1c1a26"/><rect x="-109" y="-170" width="218" height="15" fill="#1c1a26"/>` +
        `<circle cx="0" cy="-196" r="17" fill="#c8642f"/><path d="M-12-202C-6-214 10-214 14-200C8-206-4-206-12-202Z" fill="#8f3c1c"/>` +
        text(0, -164, 'Tartaglia', { size: 12, weight: 600, anchor: 'middle', fill: '#d8d4e8' }) +
        bubble(-96, -130, 150, 40, '#2a2836', "it's me lol", { size: 15, fill: '#e8e4f4' }) +
        bubble(-96, -80, 168, 40, '#2a2836', 'who else would it be', { size: 15, fill: '#e8e4f4' }) +
        bubble(-34, -10, 130, 54, '#8a4fd8', 'who is this.', { size: 22, weight: 700, fill: '#fff' }) +
        text(94, 64, 'Read 00:14', { size: 11, anchor: 'end', fill: '#8a86a0' }) +
        `<rect x="-96" y="180" width="192" height="30" rx="15" fill="none" stroke="#3a3848" stroke-width="2"/>` + text(-80, 200, 'iMessage', { size: 12, fill: '#5a5670' });
      return svg(
        rg('bg', [[0, '#3a2160'], [0.6, '#1c1030'], [1, '#0a0614']], 0.55, 0.45, 0.75) +
        lg('hat', [[0, '#5a3a8a'], [1, '#22123e']]) +
        lg('brim', [[0, '#3e2466'], [0.5, '#2a1648'], [1, '#160a26']]) +
        lg('veil', [[0, '#c8b8f0', 0.5], [1, '#c8b8f0', 0.08]]) +
        lg('face', [[0, '#2a1e40'], [0.35, '#5a4672'], [0.7, '#b8a4cc'], [1, '#efe4f8']]) +
        lg('hair', [[0, '#1e1a3e'], [1, '#2e2a62']]) +
        lg('scr', [[0, '#0e0d14'], [1, '#14121c']]) +
        rg('sglow', [[0, '#c8b0ff', 0.55], [1, '#8a4fd8', 0]]) +
        lg('hand', [[0, '#d8c8e8'], [1, '#9a84b4']], 0, 0, 1, 1),
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<path d="${bolts}" stroke="#b07aff" stroke-width="4" fill="none" opacity=".35" stroke-linejoin="bevel"/>` +
        `<circle cx="690" cy="430" r="330" fill="none" stroke="#8a4fd8" stroke-width="2" opacity=".25"/><circle cx="690" cy="430" r="300" fill="none" stroke="#8a4fd8" stroke-width="1" opacity=".2" stroke-dasharray="4 10"/>` +
        // veil (behind), hanging from the brim all around
        `<path d="M290 270C280 420 300 580 340 700C420 740 500 700 560 660L600 330ZM1090 270C1100 420 1080 580 1040 700C960 740 880 700 820 660L780 330Z" fill="url(#veil)"/>` +
        `<path d="M320 300C318 450 330 580 356 690M370 310C366 450 376 560 400 680M1060 300C1062 450 1050 580 1024 690M1010 310C1014 450 1004 560 980 680" stroke="#e8dcff" stroke-width="2.5" fill="none" opacity=".22"/>` +
        // body: dark coat, purple cord
        `<path d="M420 900C440 740 530 640 610 616H770C850 640 940 740 960 900Z" fill="#14101e"/>` +
        `<path d="M610 616C640 676 670 716 690 736C710 716 740 676 770 616Z" fill="#e8e0f0" opacity=".85"/><path d="M650 644C670 682 710 682 730 644" stroke="#8a4fd8" stroke-width="8" fill="none"/>` +
        `<circle cx="690" cy="688" r="10" fill="#8a4fd8"/><path d="M690 698L676 766M690 698L704 766" stroke="#8a4fd8" stroke-width="6"/>` +
        // neck
        `<path d="M658 520V626Q690 640 722 626V520Z" fill="#6a5280"/><path d="M658 560Q690 580 722 560" stroke="#3a2a52" stroke-width="10" fill="none" opacity=".5"/>` +
        // hair back: short bob ending at the jaw
        `<path d="M556 360C556 280 616 236 690 236C764 236 824 280 824 360C826 420 830 480 838 540C820 530 806 520 796 500L788 540C776 520 770 500 768 470H612C610 500 604 520 592 540L584 500C574 520 560 530 542 540C550 480 554 420 556 360Z" fill="url(#hair)"/>` +
        // face
        `<g transform="translate(690 418)"><path d="${FACE}" fill="url(#face)"/>` +
        // eyes: half-lidded, smug, with red marks at the outer corners
        `<path d="M-74-6Q-48-20-22-8Q-48 0-74-6Z" fill="#e8e0f0" opacity=".9"/><path d="M22-8Q48-20 74-6Q48 0 22-8Z" fill="#e8e0f0" opacity=".9"/>` +
        `<ellipse cx="-44" cy="-8" rx="13" ry="11" fill="#4a3aa8"/><ellipse cx="46" cy="-8" rx="13" ry="11" fill="#4a3aa8"/>` +
        `<ellipse cx="-44" cy="-7" rx="6" ry="7" fill="#140c2e"/><ellipse cx="46" cy="-7" rx="6" ry="7" fill="#140c2e"/>` +
        `<circle cx="-39" cy="-11" r="3.4" fill="#e0d4ff"/><circle cx="51" cy="-11" r="3.4" fill="#e0d4ff"/>` +
        `<path d="M-78-12Q-50-24-20-14L-22-6Q-50-14-76-4ZM20-14Q50-24 78-12L76-4Q50-14 22-6Z" fill="#1a1030" opacity=".55"/>` +
        `<path d="M-80-8Q-50-26-18-12M18-12Q50-26 80-8" stroke="#120a1e" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        `<path d="M-80-6C-90-4-96 2-98 10C-88 6-80 4-72 2ZM80-6C90-4 96 2 98 10C88 6 80 4 72 2Z" fill="#e0303c"/>` +
        `<path d="M-74 4Q-58 10-40 6M74 4Q58 10 40 6" stroke="#e0303c" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>` +
        // nose + smirk
        `<path d="M2 18Q-4 34 6 40" stroke="#8a6a9a" stroke-width="3" fill="none"/>` +
        `<path d="M-30 72Q4 80 34 64Q42 58 46 50" stroke="#4a2a4a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M44 52Q50 56 48 62" stroke="#4a2a4a" stroke-width="3" fill="none"/>` +
        `</g>` +
        // bangs and side locks
        `<path d="M568 350C576 290 626 258 690 258C756 258 804 290 812 350C760 320 620 320 568 350Z" fill="url(#hair)"/>` +
        `<path d="${[[592, 106, 84], [622, 100, 80], [652, 95, 72], [684, 90, 84], [714, 85, 70], [744, 80, 80], [774, 74, 82]].map(([x, a, l]) => lock(x, 316, a, l, 44, a < 90 ? 6 : -6)).join('')}" fill="url(#hair)"/>` +
        `<path d="${lock(574, 340, 96, 200, 34, -10)}${lock(806, 340, 84, 200, 34, 10)}" fill="#22204a"/>` +
        `<path d="M620 300C650 288 700 286 740 296" stroke="#4a4890" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>` +
        // hat: low cone crown, wide brim
        `<path d="M604 254C616 196 654 152 690 140C726 152 764 196 776 254Z" fill="url(#hat)"/>` +
        `<path d="M606 236C650 246 730 246 774 236L778 260C730 270 650 270 602 260Z" fill="#8a4fd8" opacity=".75"/>` +
        `<ellipse cx="690" cy="264" rx="420" ry="72" fill="url(#brim)"/>` +
        `<path d="M270 264C300 302 500 336 690 336C880 336 1080 302 1110 264C1080 290 880 318 690 318C500 318 300 290 270 264Z" fill="#0c0618" opacity=".6"/>` +
        `<path d="M300 236C400 206 560 192 690 192C820 192 980 206 1080 236" stroke="#7a54b8" stroke-width="3" fill="none" opacity=".5"/>` +
        `<g fill="#d9aa55">${[[300, 300], [1080, 300], [460, 326], [920, 326]].map(([x, y]) => `<path d="M${x} ${y}V${y + 40}" stroke="#d9aa55" stroke-width="2"/><circle cx="${x}" cy="${y + 46}" r="7"/>`).join('')}</g>` +
        // the phone, turned toward us
        `<circle cx="400" cy="640" r="300" fill="url(#sglow)"/>` +
        `<g transform="translate(410 650) rotate(-8)">${phoneFront(232, 472, screen, '#2a2836')}` +
        // fingers wrapping the phone
        `<path d="M114 50C130 46 144 52 144 64C144 74 132 80 116 78ZM114 100C132 96 146 102 146 114C146 124 132 130 114 128ZM112 150C128 148 140 154 140 164C140 174 128 178 112 176Z" fill="url(#hand)"/>` +
        `<path d="M126 52Q136 54 138 62M126 102Q138 104 140 112" stroke="#7a6494" stroke-width="2" fill="none"/>` +
        `<path d="M-116 70C-140 80-156 110-152 160C-148 200-130 230-104 240L-114 150Z" fill="url(#hand)"/><path d="M-124 110C-136 130-138 160-130 190" stroke="#7a6494" stroke-width="2" fill="none"/>` +
        `<path d="M-140 240C-120 260-60 280 0 290L-20 360H-200Z" fill="#14101e"/>` +
        `</g>` +
        `<path d="${dots(30, 0, 1200, 0, 900, 1, 2.5)}" fill="#c8a8ff" opacity=".35"/>`,
        0.08, 0.8);
    },
  });

  // lock-screen notification card (local, centred on x)
  const notif = (y, w, app, title, body, c = '#c8323c') =>
    `<rect x="${-w / 2}" y="${y}" width="${w}" height="74" rx="18" fill="#ffffff" opacity=".2"/>` +
    `<rect x="${-w / 2 + 12}" y="${y + 14}" width="26" height="26" rx="7" fill="${c}"/>` +
    text(-w / 2 + 48, y + 26, app, { size: 11, fill: '#fff', op: 0.75 }) + text(w / 2 - 12, y + 26, 'now', { size: 11, anchor: 'end', fill: '#fff', op: 0.7 }) +
    text(-w / 2 + 48, y + 46, title, { size: 14, weight: 700, fill: '#fff' }) + text(-w / 2 + 48, y + 64, body, { size: 14, fill: '#fff' });

  // ==== Fatui Hospitality ===================================================================
  def('end_caught_fatui', {
    title: 'Fatui Hospitality',
    w: 1200, h: 900, tags: ['ending', 'fatui'],
    svg: () => {
      seed(77);
      const DK = '#0b121f', RIM = '#cfeeff';
      const mask = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-18-22C-8-28 8-28 18-22C22-6 18 14 8 28L0 34L-8 28C-18 14-22-6-18-22Z" fill="#c9d8e6"/>` +
        `<path d="M-14-8L-4-4L-14-1ZM14-8L4-4L14-1Z" fill="#7ad0ff"/><path d="M0-26V30" stroke="#8aa0b8" stroke-width="2"/><path d="M-18-22C-8-28 8-28 18-22" stroke="#fff" stroke-width="2" fill="none"/></g>`;
      const screen =
        `<rect x="-89" y="-189" width="178" height="378" rx="26" fill="url(#lock)"/>` +
        text(0, -112, '23:58', { size: 52, weight: 300, anchor: 'middle', fill: '#fff' }) +
        text(0, -154, 'Friday 16 October', { size: 12, anchor: 'middle', fill: '#fff', op: 0.85 }) +
        `<g transform="translate(0 0)">${notif(-74, 164, 'MESSAGES', 'La Signora', "Don't run.")}</g>` +
        `<g transform="translate(0 0)">${notif(10, 164, 'NORTHLAND', 'Security alert', 'Device located.', '#2f6fb8')}</g>`;
      return svg(
        lg('hall', [[0, '#e8f6ff'], [0.5, '#9fd2f2'], [1, '#5a94c4']]) +
        lg('hallFloor', [[0, '#7ab0d8'], [1, '#c8e8fa']]) +
        lg('spill', [[0, '#a8daf8', 0.55], [1, '#a8daf8', 0.05]]) +
        lg('room', [[0, '#141a26'], [1, '#07090f']]) +
        lg('door', [[0, '#2a2420'], [1, '#141010']], 0, 0, 1, 0) +
        lg('lock', [[0, '#2a3a6a'], [0.5, '#1a2a4e'], [1, '#3a1a2e']]) +
        rg('pglow', [[0, '#d8e8ff', 0.5], [1, '#d8e8ff', 0]]) +
        lg('skin', [[0, '#e8c8b4'], [1, '#b08a7a']], 0, 0, 1, 1) +
        rg('cic', [[0, '#e8f8ff'], [0.4, '#8ad8ff', 0.6], [1, '#8ad8ff', 0]]),
        `<rect width="1200" height="900" fill="url(#room)"/>` +
        // hallway seen through the door
        `<rect x="420" y="140" width="360" height="560" fill="url(#hall)"/>` +
        `<path d="M420 140L530 250H670L780 140Z" fill="#f4fbff"/><path d="M560 196H640" stroke="#fff" stroke-width="10"/><rect x="540" y="190" width="120" height="12" rx="6" fill="#fff"/>` +
        `<path d="M420 700L530 560H670L780 700Z" fill="url(#hallFloor)"/>` +
        `<path d="M530 250V560M670 250V560" stroke="#7aa8cc" stroke-width="3"/>` +
        `<path d="M440 290L500 320V540L440 590ZM760 290L700 320V540L760 590Z" fill="#6a9cc4" opacity=".7"/>` +
        // door frame + open door
        `<path d="M410 130H790V710H410Z" fill="none" stroke="#1c1612" stroke-width="22"/>` +
        `<path d="M410 130L250 70V790L410 710Z" fill="url(#door)"/><circle cx="275" cy="440" r="9" fill="#8a7a5a"/><path d="M262 120V740" stroke="#000" stroke-width="3" opacity=".4"/>` +
        `<path d="M250 70L410 130V710L250 790" stroke="${RIM}" stroke-width="2" fill="none" opacity=".25"/>` +
        // light spilling into the dark room
        `<path d="M420 710H780L1120 900H80Z" fill="url(#spill)"/>` +
        // long shadows of the three agents
        `<path d="M440 710L300 900H420L510 710ZM540 710L520 900H680L660 710ZM700 710L840 900H1000L790 710Z" fill="${DK}" opacity=".75"/>` +
        // frost creeping in
        `<path d="M420 712C460 730 500 720 540 740C580 756 640 744 680 760C720 772 760 756 800 770" stroke="#e8f8ff" stroke-width="3" fill="none" opacity=".35"/>` +
        `<path d="${dots(30, 420, 820, 700, 780, 1, 3)}" fill="#e8f8ff" opacity=".5"/>` +
        // ---- agents (backlit) ----
        // left: Cryo Cicin mage, pointed hood, lantern staff
        `<path d="M468 244C450 248 442 270 444 292L428 306C418 386 416 520 410 700H528C524 560 520 420 510 316L496 294C500 268 490 244 468 244Z" fill="${DK}"/>` +
        `<path d="M452 256C456 228 468 210 492 196C486 214 488 232 494 262Z" fill="${DK}"/><circle cx="494" cy="196" r="6" fill="#7ad0ff"/>` +
        `<path d="M444 292C428 306 418 386 416 520M496 294C510 316 520 420 524 560M452 256C456 228 468 210 492 196" stroke="${RIM}" stroke-width="2.5" fill="none" opacity=".7"/>` +
        mask(470, 280, 0.66) +
        `<path d="M410 330L392 700" stroke="#1a2232" stroke-width="7"/><path d="M386 300h14l4 34h-22z" fill="#1a2232"/><circle cx="394" cy="318" r="9" fill="#bfeaff"/><circle cx="394" cy="318" r="30" fill="url(#cic)"/>` +
        // right: heavy agent, ushanka, broad
        `<path d="M716 226C688 226 674 246 676 266L640 286C612 306 600 370 600 430L596 700H800L796 430C796 370 786 306 760 286L756 266C758 246 744 226 716 226Z" fill="${DK}"/>` +
        `<path d="M676 252C672 220 692 200 716 200C740 200 760 220 756 252L766 296C760 300 752 298 748 292L748 262C728 254 704 254 684 262L684 292C680 298 672 300 666 296Z" fill="#1c2638"/>` +
        `<path d="M676 252C672 220 692 200 716 200C740 200 760 220 756 252" stroke="${RIM}" stroke-width="3" fill="none" opacity=".8"/>` +
        `<path d="M760 286C786 306 796 370 796 430L800 700M640 286C612 306 600 370 600 430" stroke="${RIM}" stroke-width="2.5" fill="none" opacity=".7"/>` +
        mask(716, 280, 0.8) +
        // centre: agent in a fur-ringed hood, long coat, reaching for the phone
        `<path d="M600 192C570 192 552 216 552 244C552 262 558 276 568 286L534 306C522 366 520 520 524 700H676C680 520 678 366 666 306L632 286C642 276 648 262 648 244C648 216 630 192 600 192Z" fill="#0f1828"/>` +
        `<path d="M600 204C578 204 566 222 566 246C566 268 580 284 600 288C620 284 634 268 634 246C634 222 622 204 600 204Z" fill="none" stroke="#3a4a62" stroke-width="12"/>` +
        `<path d="M600 204C578 204 566 222 566 246C566 268 580 284 600 288C620 284 634 268 634 246C634 222 622 204 600 204Z" fill="none" stroke="${RIM}" stroke-width="3" stroke-dasharray="3 5" opacity=".7"/>` +
        `<path d="M552 244C552 216 570 192 600 192C630 192 648 216 648 244" stroke="${RIM}" stroke-width="3" fill="none" opacity=".8"/>` +
        `<path d="M534 306C522 366 520 520 524 700M666 306C678 366 680 520 676 700" stroke="${RIM}" stroke-width="2.5" fill="none" opacity=".6"/>` +
        `<path d="M540 310Q600 340 660 310" stroke="#2e3c54" stroke-width="14" fill="none"/>` +
        `<path d="M530 470H670" stroke="#24304a" stroke-width="10"/><rect x="590" y="462" width="20" height="16" fill="#8aa0b8"/>` +
        mask(600, 248, 0.92) +
        // a gloved hand held out, palm up
        `<path d="M656 380C690 390 716 398 738 402L742 428C716 430 682 424 650 416Z" fill="#0f1828"/>` +
        `<path d="M738 398C756 396 774 402 782 412C776 424 758 428 742 430Z" fill="#1c2436"/><path d="M742 398C756 396 772 402 782 412" stroke="${RIM}" stroke-width="2" fill="none" opacity=".7"/>` +
        // cicins (little ice butterflies) around the mage
        `<g>${[[530, 350, 1], [440, 420, 0.8], [360, 260, 0.6], [450, 540, 0.7]].map(([x, y, k]) => `<circle cx="${x}" cy="${y}" r="${f(26 * k)}" fill="url(#cic)"/>` + bfly(x, y, 0.28 * k, 20, '#f0fbff', 0.95)).join('')}</g>` +
        // cold breath mist in the doorway
        `<path d="M420 640C500 620 560 650 640 630S760 640 780 620V700H420Z" fill="#e8f6ff" opacity=".18"/>` +
        // ---- your hand + the phone ----
        `<circle cx="990" cy="640" r="320" fill="url(#pglow)"/>` +
        `<g transform="translate(990 650) rotate(7)">${phoneFront(190, 390, screen, '#22262e')}` +
        `<path d="M96 40C116 36 128 46 126 58C124 68 112 72 96 70ZM96 90C118 86 130 96 128 108C126 118 112 122 96 120ZM94 140C114 138 124 146 122 158C120 168 108 170 94 168Z" fill="url(#skin)"/>` +
        `<path d="M-96 80C-120 90-134 120-130 160C-126 200-110 226-88 236L-96 140Z" fill="url(#skin)"/>` +
        `<path d="M-96 190C-90 230-60 250-20 256C20 260 60 250 96 230L110 320C60 340 0 350-60 340Z" fill="url(#skin)"/>` +
        `<path d="M-70 330C-10 344 60 336 116 310L130 420H-80Z" fill="#2a2e3e"/>` +
        `</g>` +
        // dark room details (coat hook, shoes)
        `<path d="M120 200h70M140 200v40M170 200v40" stroke="#1a2030" stroke-width="8"/><path d="M128 240C110 300 120 400 140 430H190C200 380 200 300 180 240Z" fill="#141a26"/>` +
        `<path d="M130 760h80l10 20h-90zM230 770h80l10 20h-90z" fill="#141a26"/>`,
        0.08, 0.85);
    },
  });

  // anime face outline (front), scaled from the avatar face
  const FACE_F = 'M0-130C70-130 108-82 108-16C108 40 88 80 54 106C36 120 18 127 0 127C-18 127-36 120-54 106C-88 80-108 40-108-16C-108-82-70-130 0-130Z';
  // plum-blossom pupil
  const plum = (r, c) => {
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      d += `M0 0Q${f(Math.cos(a - 0.5) * r * 1.3)} ${f(Math.sin(a - 0.5) * r * 1.3)} ${f(Math.cos(a) * r)} ${f(Math.sin(a) * r)}Q${f(Math.cos(a + 0.5) * r * 1.3)} ${f(Math.sin(a + 0.5) * r * 1.3)} 0 0Z`;
    }
    return `<path d="${d}" fill="${c}"/>`;
  };
  // coffin, side view, foot at left (x,y = bottom-left)
  const coffin = (x, y, w, h, c, c2) =>
    `<path d="M${x} ${y}L${x + w * 0.04} ${y - h * 0.7}Q${x + w * 0.5} ${y - h * 0.82} ${x + w} ${y - h}L${x + w * 0.98} ${y}Z" fill="${c}"/>` +
    `<path d="M${x + w * 0.04} ${y - h * 0.7}Q${x + w * 0.5} ${y - h * 0.82} ${x + w} ${y - h}L${x + w} ${y - h * 0.82}Q${x + w * 0.5} ${y - h * 0.64} ${x + w * 0.05} ${y - h * 0.54}Z" fill="${c2}"/>` +
    `<path d="M${x + w * 0.1} ${y - h * 0.2}H${x + w * 0.9}" stroke="#d9aa55" stroke-width="3" opacity=".7"/>`;

  // ==== Wangsheng Is Hiring =================================================================
  def('end_wangsheng', {
    title: 'Wangsheng Is Hiring',
    w: 1200, h: 900, tags: ['ending', 'ht', 'comedy'],
    svg: () => {
      seed(88);
      const HT = { hair: '#3a221e', hair2: '#24140f', coat: '#4a2a1e', red: '#b02a2a' };
      return svg(
        lg('wall', [[0, '#3a1612'], [1, '#1e0a08']]) +
        lg('floor', [[0, '#4a2418'], [1, '#1e0c08']]) +
        lg('sk', [[0, '#fff0e4'], [1, '#f2ccb4']], 0, 0, 1, 1) +
        lg('hth', [[0, HT.hair], [0.75, HT.hair2], [1, '#5a1e1a']]) +
        lg('coat', [[0, '#3e2a22'], [1, '#1e1410']]) +
        lg('pcoat', [[0, '#2e2420'], [1, '#141010']]) +
        rg('bglow', [[0, '#ffb04a', 0.75], [1, '#ff6a2a', 0]]) +
        rg('warm', [[0, '#ff9a4a', 0.35], [1, '#ff6a2a', 0]]) +
        rg('iris', [[0, '#ff6a5a'], [0.6, '#c8202a'], [1, '#6a0e14']], 0.5, 0.35, 0.6),
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        `<rect y="600" width="1200" height="300" fill="url(#floor)"/>` +
        `<circle cx="600" cy="420" r="560" fill="url(#warm)"/>` +
        // banner
        `<path d="M160 60H1040V150C900 170 300 170 160 150Z" fill="#c8323c"/><path d="M160 60H1040" stroke="#d9aa55" stroke-width="8"/>` +
        text(600, 128, 'WELCOME, NEW HIRE!', { size: 54, weight: 800, anchor: 'middle', fill: '#fff4dc', ls: 4 }) +
        `<g transform="translate(200 108) scale(.5)"><path d="M-30 30C-34 0-26-30 0-30C26-30 34 0 30 30L20 22L10 32L0 22L-10 32L-20 22Z" fill="#fff4dc"/><circle cx="-9" cy="-4" r="4" fill="#c8323c"/><circle cx="9" cy="-4" r="4" fill="#c8323c"/></g>` +
        `<g transform="translate(1000 108) scale(.5)"><path d="M-30 30C-34 0-26-30 0-30C26-30 34 0 30 30L20 22L10 32L0 22L-10 32L-20 22Z" fill="#fff4dc"/><circle cx="-9" cy="-4" r="4" fill="#c8323c"/><circle cx="9" cy="-4" r="4" fill="#c8323c"/></g>` +
        // paper lanterns
        `<g fill="#f2e6d0">${[100, 1100].map((x) => `<path d="M${x} 180v30" stroke="#3a2a20" stroke-width="3"/><ellipse cx="${x}" cy="260" rx="40" ry="54"/><circle cx="${x}" cy="260" r="90" fill="url(#bglow)" opacity=".5"/>`).join('')}</g>` +
        text(100, 276, '奠', { size: 44, anchor: 'middle', fill: '#3a1a14', font: 'serif' }) + text(1100, 276, '奠', { size: 44, anchor: 'middle', fill: '#3a1a14', font: 'serif' }) +
        // coffins in rows
        coffin(40, 600, 300, 120, '#2a120e', '#4a2018') + coffin(880, 590, 300, 120, '#2a120e', '#4a2018') +
        coffin(-40, 700, 380, 150, '#3a1610', '#5e2a1e') + coffin(830, 720, 400, 160, '#3a1610', '#5e2a1e') +
        // sale tag on the right coffin
        `<g transform="translate(110 640) rotate(-6)"><path d="M-80-30H60L80 0L60 30H-80Z" fill="#fff4dc"/><circle cx="64" cy="0" r="6" fill="#3a1a14"/>` +
        text(-8, -6, '2nd COFFIN', { size: 18, weight: 800, anchor: 'middle', fill: '#c8323c' }) + text(-8, 18, '50% OFF!', { size: 20, weight: 900, anchor: 'middle', fill: '#3a1a14' }) + `</g>` +
        // candles
        `<g>${[[360, 610], [400, 616], [1150, 600]].map(([x, y]) => `<rect x="${x - 6}" y="${y - 40}" width="12" height="40" fill="#f2e6d0"/><path d="M${x} ${y - 40}c-6-8 0-18 0-22c0 4 6 14 0 22z" fill="#ffc04a"/><circle cx="${x}" cy="${y - 50}" r="24" fill="url(#bglow)"/>`).join('')}</g>` +
        // ---- you, from behind, in the uniform ----
        `<path d="M220 900C230 720 260 560 330 520C370 500 470 500 510 520C580 560 610 720 620 900Z" fill="url(#pcoat)"/>` +
        `<path d="M300 560C340 600 340 700 330 900M540 560C500 600 500 700 510 900" stroke="#0e0a08" stroke-width="5" fill="none" opacity=".6"/>` +
        `<path d="M372 470V520Q420 536 468 520V470Z" fill="#1e1612"/><path d="M372 474Q420 466 468 474" stroke="#d9aa55" stroke-width="4" fill="none"/>` +
        `<path d="M330 520C370 506 470 506 510 520" stroke="#d9aa55" stroke-width="4" fill="none"/>` +
        // butterfly emblem on the back
        `<g transform="translate(420 680) scale(1.2)"><circle r="44" fill="none" stroke="#d9aa55" stroke-width="3"/><path d="${BF}" fill="#d9aa55"/></g>` +
        // head: short dark hair, borrowed pork-pie hat, talisman stuck on the back
        `<path d="M420 330C468 330 494 366 492 408C490 440 476 466 450 480H390C364 466 350 440 348 408C346 366 372 330 420 330Z" fill="#221a24"/>` +
        `<path d="M372 360C390 350 450 350 470 362M360 410C380 400 460 400 482 412" stroke="#3a3040" stroke-width="4" fill="none"/>` +
        `<path d="${lock(380, 470, 100, 22, 26, 4)}${lock(420, 476, 90, 20, 26, 0)}${lock(458, 470, 80, 22, 26, -4)}" fill="#221a24"/>` +
        `<g transform="rotate(-8 420 330)"><ellipse cx="420" cy="336" rx="92" ry="20" fill="#141014"/><path d="M366 334V286C366 276 380 270 420 270C460 270 474 276 474 286V334Z" fill="#1c181c"/><path d="M366 312H474" stroke="#6a2a2a" stroke-width="10"/>` +
        `<circle cx="470" cy="300" r="10" fill="#e04a5a"/><circle cx="458" cy="294" r="7" fill="#f07080"/></g>` +
        `<g transform="rotate(4 420 352)"><path d="M398 352H442V452L420 444L398 452Z" fill="#f2d870"/><path d="M412 366L428 376L412 388L428 400L412 412L426 424" stroke="#c8323c" stroke-width="4" fill="none"/></g>` +
        // ---- Hu Tao ----
        // twin tails (behind)
        `<path d="M640 330C600 420 590 560 610 700C620 780 640 860 650 900H700C680 800 666 680 670 560C674 460 690 380 700 340Z" fill="url(#hth)"/>` +
        `<path d="M880 330C920 420 930 560 910 700C900 780 880 860 870 900H820C840 800 854 680 850 560C846 460 830 380 820 340Z" fill="url(#hth)"/>` +
        `<path d="M672 380Q660 390 668 404M848 380Q860 390 852 404" stroke="#c8323c" stroke-width="10" stroke-linecap="round"/>` +
        // body: brown coat
        `<path d="M640 900C650 740 680 620 716 590H804C840 620 870 740 880 900Z" fill="url(#coat)"/>` +
        `<path d="M728 590L760 670L792 590Z" fill="#1a1010"/><path d="M746 604H774" stroke="${HT.red}" stroke-width="8"/>` +
        `<path d="M680 720C700 760 740 780 760 790C780 780 820 760 840 720" stroke="#d9aa55" stroke-width="3" fill="none" opacity=".6"/>` +
        `<circle cx="760" cy="740" r="6" fill="#d9aa55"/><circle cx="760" cy="790" r="6" fill="#d9aa55"/>` +
        // neck + face
        `<path d="M738 540V600Q760 610 782 600V540Z" fill="#ecc0a6"/>` +
        `<g transform="translate(760 450) scale(.82)"><path d="${FACE_F}" fill="url(#sk)"/>` +
        // wink (left) + plum-blossom eye (right)
        `<path d="M-78 2Q-50-26-22 2" stroke="#2a1416" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<path d="M-80-14L-90-24M-66-22L-70-34" stroke="#2a1416" stroke-width="5" stroke-linecap="round"/>` +
        `<ellipse cx="48" cy="-2" rx="27" ry="33" fill="url(#iris)"/><g transform="translate(48 2)">${plum(13, '#3a0608')}</g>` +
        `<circle cx="58" cy="-16" r="8" fill="#fff"/><circle cx="38" cy="14" r="3.5" fill="#fff" opacity=".8"/>` +
        `<path d="M14-30Q48-50 84-30" stroke="#2a1416" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M84-30L96-38" stroke="#2a1416" stroke-width="6" stroke-linecap="round"/>` +
        `<ellipse cx="-58" cy="40" rx="24" ry="12" fill="#ff8a8a" opacity=".45"/><ellipse cx="62" cy="44" rx="24" ry="12" fill="#ff8a8a" opacity=".45"/>` +
        // big grin with a fang
        `<path d="M-40 56Q0 62 40 52Q30 100 0 104Q-30 100-40 56Z" fill="#8a1e2a"/><path d="M-32 60Q0 64 34 56L32 66Q0 72-30 68Z" fill="#fff"/>` +
        `<path d="M20 64L26 78L30 62Z" fill="#fff"/><path d="M-16 96Q0 88 16 96Q8 102 0 102Q-8 102-16 96Z" fill="#e85a6a"/>` +
        `</g>` +
        // bangs
        `<path d="M672 396C664 330 702 288 760 286C818 288 856 330 848 396C800 360 720 360 672 396Z" fill="url(#hth)"/>` +
        `<path d="${[[690, 112, 70], [712, 104, 76], [736, 96, 66], [760, 90, 74], [784, 84, 64], [808, 78, 72], [830, 70, 64]].map(([x, a, l]) => lock(x, 340, a, l, 36, a < 90 ? 7 : -7)).join('')}" fill="${HT.hair}"/>` +
        `<path d="${lock(684, 380, 100, 150, 30, -10)}${lock(836, 380, 80, 150, 30, 10)}" fill="${HT.hair}"/>` +
        `<path d="M700 316C730 300 790 300 820 318" stroke="#6a3a30" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>` +
        // pork-pie hat, plum blossoms, talisman
        `<g transform="rotate(12 770 290)"><ellipse cx="770" cy="292" rx="86" ry="20" fill="#141014"/><path d="M712 290V244C712 234 732 228 770 228C808 228 828 234 828 244V290Z" fill="#1c181c"/><path d="M712 268H828" stroke="#6a2a2a" stroke-width="10"/>` +
        `<path d="M820 262C840 244 852 224 856 204" stroke="#3a2418" stroke-width="5" fill="none"/>` +
        `<g fill="#e04a5a">${[[826, 256, 10], [842, 236, 9], [856, 212, 8], [810, 266, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/><circle cx="${x}" cy="${y}" r="${f(r / 3)}" fill="#ffd25a"/>`).join('')}</g>` +
        `<path d="M716 292L700 380L726 374L740 296Z" fill="#f2d870"/><path d="M718 310L708 362" stroke="#c8323c" stroke-width="4"/></g>` +
        // peace sign
        `<g transform="translate(900 470) rotate(-14)"><path d="M-30 30C-34 10-30-4-20-8L-20-60C-20-70-6-70-6-60L-4-14L4-14L10-62C12-72 26-70 24-60L18-6C30-2 34 14 30 30C26 46 10 52-6 50C-20 48-28 42-30 30Z" fill="url(#sk)"/><circle cx="-4" cy="22" r="6" fill="#d9aa55"/></g>` +
        `<path d="M830 560C850 540 870 520 886 500L912 520C890 550 866 576 840 596Z" fill="url(#coat)"/>` +
        // contract held up
        `<g transform="translate(980 640) rotate(10)"><rect x="-70" y="-90" width="140" height="180" rx="4" fill="#f6ecd4"/>` +
        text(0, -62, 'EMPLOYMENT', { size: 15, weight: 800, anchor: 'middle', fill: '#3a1a14' }) + text(0, -44, 'CONTRACT', { size: 15, weight: 800, anchor: 'middle', fill: '#3a1a14' }) +
        `<path d="M-50-24H50M-50-10H40M-50 4H50M-50 18H30" stroke="#a89878" stroke-width="3"/>` +
        `<circle cx="34" cy="56" r="20" fill="#c8323c" opacity=".9"/>` + text(34, 62, '胡', { size: 18, anchor: 'middle', fill: '#fff', font: 'serif' }) +
        `<path d="M-50 64H10" stroke="#3a1a14" stroke-width="2"/>` + text(-50, 58, 'sign here ✕', { size: 11, fill: '#c8323c' }) +
        `<path d="M-60 90C-70 80-76 60-66 50L-50 54Z" fill="url(#sk)"/></g>` +
        // Boo Tao
        `<g transform="translate(600 300) rotate(-10)"><path d="M-36 40C-40 0-30-36 0-36C30-36 40 0 36 40L24 30L12 42L0 30L-12 42L-24 30Z" fill="#fff4ec" opacity=".92"/>` +
        `<ellipse cx="-11" cy="-6" rx="5" ry="7" fill="#3a1a14"/><ellipse cx="11" cy="-6" rx="5" ry="7" fill="#3a1a14"/><path d="M-8 10Q0 16 8 10" stroke="#3a1a14" stroke-width="3" fill="none"/>` +
        `<rect x="-14" y="-50" width="28" height="16" rx="3" fill="#1c181c"/><ellipse cx="0" cy="-36" rx="22" ry="5" fill="#1c181c"/></g>` +
        // ghost-fire butterflies
        bfly(540, 230, 0.8, -15, '#ff8a3a', 1, 'url(#bglow)') + bfly(980, 300, 0.9, 20, '#ff7a2a', 1, 'url(#bglow)') + bfly(260, 330, 0.6, 10, '#ffb04a', 0.9, 'url(#bglow)') +
        bfly(700, 820, 0.6, -25, '#ff8a3a', 0.9, 'url(#bglow)') + bfly(1100, 460, 0.5, 0, '#ffb04a', 0.85, 'url(#bglow)') + bfly(140, 520, 0.55, 30, '#ff7a2a', 0.85, 'url(#bglow)'),
        0.06, 0.6);
    },
  });

  // cheering crew silhouette: x = feet centre, y = feet, h = height, arms up variant
  const cheer = (x, y, h, c, v = 0) => {
    const k = h / 200;
    const arms = v === 0 ? 'M-18-130L-40-200M18-130L40-200' : v === 1 ? 'M-18-130L-50-190M18-130L44-150L60-190' : 'M-18-130L-30-200M18-130L50-110';
    return `<g transform="translate(${x} ${y}) scale(${k.toFixed(2)})" fill="${c}"><circle cx="0" cy="-168" r="20"/><path d="M-22-146H22L28-60L18 0H6L0-50L-6 0H-18L-28-60Z"/>` +
      `<path d="${arms}" stroke="${c}" stroke-width="14" stroke-linecap="round"/>` + (v === 1 ? `<rect x="50" y="-212" width="22" height="26" rx="4"/>` : '') + `</g>`;
  };

  // ==== Third-Round Knockout ================================================================
  def('end_rematch', {
    title: 'Third-Round Knockout',
    w: 1200, h: 900, tags: ['ending', 'beidou', 'comedy'],
    svg: () => {
      seed(99);
      const SKB = { base: '#e8b894', sh: '#c98e6c' };
      let planks = '';
      for (let i = -10; i <= 10; i++) planks += `M${600 + i * 26} 560L${600 + i * 150} 900`;
      return svg(
        lg('sky', [[0, '#0a1430'], [0.6, '#1c2c58'], [1, '#2e3e6a']]) +
        lg('sea', [[0, '#1e2e52'], [1, '#0a1226']]) +
        lg('deck', [[0, '#5a3a28'], [1, '#2e1a12']]) +
        lg('bsk', [[0, '#f4cca8'], [1, '#d6a07c']], 0, 0, 1, 1) +
        lg('bcoat', [[0, '#b02a2a'], [1, '#5a1010']]) +
        lg('bhair', [[0, '#3a2a2a'], [1, '#1a1214']]) +
        rg('lglow', [[0, '#ffb35a', 0.55], [1, '#ff8a3a', 0]]) +
        rg('pool', [[0, '#ffb35a', 0.35], [1, '#ffb35a', 0]]),
        `<rect width="1200" height="560" fill="url(#sky)"/>` +
        `<path d="${dots(70, 0, 1200, 0, 380, 0.8, 2)}" fill="#fff" opacity=".7"/>` +
        `<circle cx="980" cy="120" r="46" fill="#fff6dc"/><circle cx="980" cy="120" r="110" fill="#fff6dc" opacity=".08"/>` +
        `<rect y="470" width="1200" height="90" fill="url(#sea)"/><path d="M940 480L900 560H1060Z" fill="#fff6dc" opacity=".1"/>` +
        // mast, furled sail, rigging
        `<path d="M200 0V560" stroke="#3a2418" stroke-width="26"/><path d="M60 90H340" stroke="#3a2418" stroke-width="12"/>` +
        `<path d="M70 96C120 120 280 120 330 96V120C280 140 120 140 70 120Z" fill="#c8b8a0"/>` +
        `<path d="M200 0L-40 560M200 0L480 560M60 90L0 560M340 90L520 560" stroke="#1a1210" stroke-width="3" opacity=".7"/>` +
        `<path d="M1180 520L1180 30" stroke="#3a2418" stroke-width="18"/><path d="M1180 40L900 560M1180 120L1040 560" stroke="#1a1210" stroke-width="3" opacity=".7"/>` +
        // Crux flag
        `<path d="M200 0H120Q140 20 120 44H200Z" fill="#c8323c"/>` +
        // rail + crew behind it
        cheer(110, 520, 170, '#120c14', 0) + cheer(300, 520, 190, '#120c14', 1) + cheer(420, 520, 150, '#120c14', 2) +
        cheer(940, 520, 180, '#120c14', 1) + cheer(1050, 520, 160, '#120c14', 0) + cheer(1140, 520, 175, '#120c14', 2) +
        // Kazuha on a barrel (white hair, red streak)
        `<g transform="translate(860 520)"><rect x="-26" y="-50" width="52" height="50" rx="8" fill="#2a1a12"/><path d="M-26-30H26M-26-14H26" stroke="#6a4a2a" stroke-width="3"/>` +
        `<path d="M-14-50L-18-100H18L14-50Z" fill="#120c14"/><circle cx="0" cy="-116" r="16" fill="#e8e4e0"/><path d="M8-120C18-114 22-100 18-88" stroke="#c8323c" stroke-width="5" fill="none"/></g>` +
        `<rect y="512" width="1200" height="16" fill="#4a2e1e"/><rect y="526" width="1200" height="40" fill="#2e1c14"/>` +
        `<path d="${[60, 220, 380, 540, 700, 860, 1020, 1160].map((x) => `M${x} 512v54`).join('')}" stroke="#5a3a28" stroke-width="10"/>` +
        // deck
        `<path d="M0 560H1200V900H0Z" fill="url(#deck)"/><path d="${planks}" stroke="#1e120c" stroke-width="3" opacity=".6"/>` +
        `<ellipse cx="640" cy="760" rx="460" ry="120" fill="url(#pool)"/>` +
        // lanterns
        `<path d="M-20 160Q300 300 600 230T1240 200" stroke="#1a1010" stroke-width="3" fill="none"/>` +
        `<g>${[[140, 222], [380, 270], [620, 228], [840, 214], [1080, 214]].map(([x, y]) => `<circle cx="${x}" cy="${y + 30}" r="80" fill="url(#lglow)"/>` + lantern(x, y + 30, 0.9, 0)).join('')}</g>` +
        // tally board
        `<g transform="translate(1010 650) rotate(4)"><rect x="-90" y="-60" width="180" height="120" rx="6" fill="#1e2a22" stroke="#6a4a2a" stroke-width="10"/>` +
        text(0, -22, 'BEIDOU', { size: 22, weight: 800, anchor: 'middle', fill: '#f4f0e0' }) + `<path d="M-40 0V30M-26 0V30M-12 0V30" stroke="#f4f0e0" stroke-width="5"/>` +
        text(36, 26, '0', { size: 30, weight: 800, anchor: 'middle', fill: '#e8a0a0' }) + text(36, 46, 'kid', { size: 12, anchor: 'middle', fill: '#f4f0e0' }) + `</g>` +
        // ---- Beidou ----
        // coat cape behind
        `<path d="M620 330C570 360 540 460 530 600C524 680 520 740 520 760H900C900 740 896 680 890 600C880 460 850 360 800 330Z" fill="url(#bcoat)"/>` +
        `<path d="M530 600C524 680 520 740 520 760H560C560 700 566 620 580 540Z" fill="#3a0808" opacity=".5"/>` +
        `<path d="M620 330C570 360 540 460 530 600M800 330C850 360 880 460 890 600" stroke="#d9aa55" stroke-width="4" fill="none"/>` +
        // long hair behind
        `<path d="M650 200C620 260 616 360 630 460C640 520 660 560 680 580H740C760 560 780 520 790 460C804 360 800 260 770 200Z" fill="url(#bhair)"/>` +
        // body (black dress, red accents), legs planted
        `<path d="M640 336C630 380 640 440 674 500C664 530 660 560 664 580L650 760H700L712 600H724L736 760H786L768 580C770 560 766 530 756 500C786 440 794 380 784 336C760 324 664 324 640 336Z" fill="#141014"/>` +
        `<path d="M672 500H758" stroke="#c8323c" stroke-width="12"/><path d="M690 340L712 430L734 340" stroke="#d9aa55" stroke-width="3" fill="none"/><circle cx="712" cy="436" r="6" fill="#d9aa55"/>` +
        `<path d="M664 580L650 760M768 580L786 760" stroke="#3a2a3a" stroke-width="3" fill="none"/>` +
        `<path d="M646 760H704V780H636ZM732 760H790L800 780H732Z" fill="#0a0808"/>` +
        // neck + head thrown back laughing
        `<path d="M694 290V340H730V290Z" fill="#d6a07c"/>` +
        `<g transform="translate(712 226) rotate(-8) scale(.62)"><path d="${FACE_F}" fill="url(#bsk)"/>` +
        `<path d="M-108-40L108-70" stroke="#141014" stroke-width="10"/><path d="M-80-42C-80-60-20-62-14-40C-14-12-30 4-50 4C-70 4-80-20-80-42Z" fill="#141014"/>` +
        `<path d="M24 -10Q48-34 74-12" stroke="#2a1416" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30-40Q52-54 78-44" stroke="#2a1416" stroke-width="8" fill="none" stroke-linecap="round"/>` +
        `<path d="M-48 40Q0 30 50 40Q46 110 0 116Q-44 110-48 40Z" fill="#7a1a20"/><path d="M-42 44Q0 36 44 44L42 56Q0 50-40 56Z" fill="#fff"/><path d="M-24 100Q0 86 24 100Q12 112 0 112Q-12 112-24 100Z" fill="#e85a6a"/>` +
        `<ellipse cx="66" cy="30" rx="20" ry="10" fill="#ff7a6a" opacity=".4"/>` +
        `</g>` +
        // hair top + bangs
        `<path d="M640 216C630 150 676 130 712 130C756 130 792 160 782 222C768 194 746 178 724 176C698 182 670 198 640 216Z" fill="url(#bhair)"/>` +
        `<path d="${lock(698, 160, 112, 78, 28, -10)}${lock(744, 164, 70, 66, 26, 10)}${lock(768, 184, 80, 100, 24, 8)}" fill="#2a1e1e"/>` +
        `<path d="M756 142l14-16 6 20z" fill="#d9aa55"/><circle cx="774" cy="138" r="7" fill="#c8323c"/>` +
        // arms + fists up
        `<path d="M648 340C624 350 612 380 616 410L644 402C646 382 654 368 668 362Z" fill="#141014"/>` +
        `<path d="M624 404C616 380 600 330 610 300L640 304C640 330 648 370 650 398Z" fill="url(#bsk)"/>` +
        `<path d="M600 300C596 280 610 266 628 266C644 266 652 280 648 298C644 312 630 316 616 314C606 312 600 306 600 300Z" fill="url(#bsk)"/><path d="M606 284H644M606 296H644" stroke="${SKB.sh}" stroke-width="2.5"/>` +
        `<path d="M774 340C798 350 808 376 804 404L778 398C776 380 768 368 756 362Z" fill="#141014"/>` +
        `<path d="M798 400C810 376 826 330 816 296L786 300C786 328 778 366 774 394Z" fill="url(#bsk)"/>` +
        `<path d="M826 296C830 276 816 262 798 262C782 262 774 276 778 294C782 308 796 312 810 310C820 308 826 302 826 296Z" fill="url(#bsk)"/><path d="M782 280H820M782 292H820" stroke="${SKB.sh}" stroke-width="2.5"/>` +
        // ---- you, KO'd on the deck ----
        `<g transform="translate(360 800) rotate(-6)">` +
        `<path d="M-30-20L-300 10L-310 60L-30 40Z" fill="#3a4a6a"/><path d="M-300 10L-380-30L-396 0L-310 60Z" fill="#2a3448"/><path d="M-300 40L-390 70L-380 100L-300 60Z" fill="#2a3448"/>` +
        `<path d="M-396 0l-24 4 6 22 24-6zM-380 100l-26 2 2 20 26-4z" fill="#141014"/>` +
        `<path d="M-20-40C-60-50-150-40-180-30L-176 50C-140 60-60 60-20 50Z" fill="#c9b89a"/>` +
        `<path d="M-160-30L-210-90L-196-104L-140-40ZM-160 46L-220 110L-204 120L-140 56Z" fill="#c9b89a"/>` +
        `<circle cx="-216" cy="-100" r="14" fill="#f2d2bc"/><circle cx="-214" cy="118" r="14" fill="#f2d2bc"/>` +
        `<circle cx="40" cy="4" r="54" fill="#f2d2bc"/><path d="M90-10C96-50 60-70 20-60C0-54-14-40-14-30C10-40 40-44 60-36C76-30 86-20 90-10Z" fill="#221a24"/>` +
        `<path d="M70 16C66 4 54 4 52 14C50 24 62 28 66 20C68 14 62 12 60 16M30 16C26 4 14 4 12 14C10 24 22 28 26 20C28 14 22 12 20 16" stroke="#2a1416" stroke-width="3" fill="none"/>` +
        `<path d="M30 40Q42 48 54 40" stroke="#2a1416" stroke-width="3" fill="none"/>` +
        `</g>` +
        // dizzy stars
        `<g fill="#ffd25a">${[[300, 690], [380, 666], [460, 690], [430, 726]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-12L3-4L12-3L5 3L7 12L0 7L-7 12L-5 3L-12-3L-3-4Z"/>`).join('')}</g>` +
        `<ellipse cx="380" cy="700" rx="90" ry="26" fill="none" stroke="#ffd25a" stroke-width="2" opacity=".5" stroke-dasharray="6 8"/>` +
        // impact lines
        `<path d="M520 640L560 620M520 680L570 680M510 720L550 744" stroke="#fff4dc" stroke-width="5" stroke-linecap="round" opacity=".7"/>`,
        0.06, 0.65);
    },
  });

  // takeout food pieces
  const carton = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-40-50H40L32 30H-32Z" fill="#fbf6ee"/><path d="M-40-50L-30-70H30L40-50Z" fill="#e8e0d2"/><path d="M-40-50L-46-62L-30-70ZM40-50L46-62L30-70Z" fill="#f2ece2"/>` +
    `<path d="M-24-70C-24-96 24-96 24-70" stroke="#9a9a9a" stroke-width="3" fill="none"/><circle cx="0" cy="-12" r="16" fill="#c8323c"/>` + text(0, -6, 'W', { size: 18, weight: 900, anchor: 'middle', fill: '#fff' }) + `</g>`;
  const steamer = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0V34C-60 48 60 48 60 34V0Z" fill="#c99a5a"/><path d="M-60 12C-60 26 60 26 60 12M-60 24C-60 38 60 38 60 24" stroke="#a87a40" stroke-width="3" fill="none"/><ellipse cx="0" cy="0" rx="60" ry="16" fill="#e2b874"/><ellipse cx="0" cy="0" rx="48" ry="11" fill="#d6a862"/></g>`;
  const wbag = (x, y, s, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M-50-60H50L56 60H-56Z" fill="#c8323c"/><path d="M-50-60L-40-74H40L50-60Z" fill="#a82730"/><path d="M-20-74C-20-100 20-100 20-74" stroke="#a82730" stroke-width="6" fill="none"/>` +
    text(0, 4, 'WANMIN', { size: 18, weight: 900, anchor: 'middle', fill: '#fff' }) + text(0, 26, 'GO', { size: 18, weight: 900, anchor: 'middle', fill: '#ffd25a' }) + `</g>`;
  const bowl = (x, y, s, c = '#f2c46a') => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="56" ry="14" fill="${c}"/><path d="M-30-4C-20-12-10 4 0-4S20-12 30-4" stroke="#fff2c4" stroke-width="5" fill="none"/><path d="M-56 0C-52 40-20 52 0 52S52 40 56 0C40 10-40 10-56 0Z" fill="#f4f0ea"/><path d="M-50 18C-30 30 30 30 50 18" stroke="#2f6fb8" stroke-width="4" fill="none"/></g>`;

  // ==== Emergency Food ======================================================================
  def('end_paimon', {
    title: 'Emergency Food',
    w: 1200, h: 900, tags: ['ending', 'paimon', 'comedy'],
    svg: () => {
      seed(111);
      let pile = '';
      // bottom row → top
      pile += wbag(250, 790, 1.3, -8) + steamer(420, 800, 1.2) + carton(560, 800, 1.3, 4) + wbag(720, 790, 1.25, 6) + steamer(880, 800, 1.1) + carton(1010, 800, 1.1, -6) + carton(140, 820, 1, 10);
      pile += steamer(330, 690, 1.05) + carton(470, 690, 1.15, -8) + bowl(620, 690, 1.1) + wbag(770, 680, 1.1, -4) + carton(900, 700, 1.05, 8);
      pile += carton(400, 590, 1, 6) + steamer(530, 600, 1) + wbag(670, 580, 1, 8) + bowl(800, 600, 0.95, '#c8642f');
      pile += steamer(480, 505, 0.9) + carton(600, 500, 0.95, -4) + steamer(720, 505, 0.85);
      pile += steamer(600, 425, 0.95);
      const mound = `<path d="M60 880C120 760 220 700 320 640C400 590 470 520 520 470C560 430 580 410 600 404C620 410 650 430 690 470C740 520 820 590 900 640C1000 700 1100 780 1160 880Z" fill="#7a3418"/><path d="M200 760C300 700 420 640 520 560M1000 760C900 700 780 640 680 560" stroke="#5a2410" stroke-width="6" fill="none" opacity=".5"/>`;
      pile = mound + carton(300, 740, 0.9, -14) + bowl(940, 760, 0.9) + wbag(370, 640, 0.85, -10) + carton(840, 640, 0.9, 12) + steamer(640, 740, 0.9) + carton(560, 620, 0.8, 10) + pile.replace(/^/, '');
      const screen =
        `<rect x="-94" y="-199" width="188" height="398" rx="28" fill="#f4f4f6"/>` +
        text(0, -150, 'Northland Pay', { size: 13, weight: 600, anchor: 'middle', fill: '#555' }) +
        `<rect x="-76" y="-130" width="152" height="94" rx="10" fill="#141418"/><path d="M-76-60C-20-100 40-110 76-120V-130H-76Z" fill="#2a2a32"/>` +
        text(-64, -108, 'NORTHLAND', { size: 11, weight: 700, fill: '#d9c9a0', ls: 1 }) + text(-64, -48, '•••• 1111', { size: 12, fill: '#d9c9a0' }) +
        `<rect x="40" y="-112" width="22" height="16" rx="3" fill="#d9aa55"/>` +
        `<circle cx="0" cy="18" r="30" fill="#ff3b30"/><path d="M-12 6L12 30M12 6L-12 30" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` +
        text(0, 84, 'CARD', { size: 26, weight: 900, anchor: 'middle', fill: '#ff3b30' }) + text(0, 114, 'DECLINED', { size: 26, weight: 900, anchor: 'middle', fill: '#ff3b30' }) +
        text(0, 140, 'Daily limit reached', { size: 12, anchor: 'middle', fill: '#777' }) +
        `<rect x="-76" y="156" width="152" height="30" rx="15" fill="#e4e4ea"/>` + text(0, 176, 'Try another card', { size: 12, weight: 600, anchor: 'middle', fill: '#2f6fb8' });
      return svg(
        rg('bg', [[0, '#ffe2a8'], [0.5, '#f4a65a'], [1, '#a8442a']], 0.5, 0.35, 0.8) +
        rg('rays', [[0, '#fff6d8', 0.9], [1, '#fff6d8', 0]]) +
        lg('pskin', [[0, '#fff2ea'], [1, '#f6d6c6']], 0, 0, 1, 1) +
        lg('phair', [[0, '#ffffff'], [1, '#d8d2ea']], 0, 0, 0.6, 1) +
        lg('cape', [[0, '#26306a'], [1, '#0e1236']]) +
        lg('hand', [[0, '#f2d2bc'], [1, '#d4a68c']], 0, 0, 1, 1),
        `<rect width="1200" height="900" fill="url(#bg)"/>` +
        `<path d="${Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2, b = a + 0.12; return `M600 260L${f(600 + 1100 * Math.cos(a))} ${f(260 + 1100 * Math.sin(a))}L${f(600 + 1100 * Math.cos(b))} ${f(260 + 1100 * Math.sin(b))}Z`; }).join('')}" fill="#fff4d0" opacity=".22"/>` +
        `<circle cx="600" cy="260" r="300" fill="url(#rays)"/>` +
        `<path d="${dots(40, 0, 1200, 0, 900, 2, 6)}" fill="#fff8e0" opacity=".6"/>` +
        // receipt ribbon
        `<path d="M80 900C140 760 120 640 200 560C260 500 300 520 340 470L366 484C330 540 290 528 236 590C170 660 190 780 132 900Z" fill="#fffdf6"/>` +
        `<path d="M150 860L180 850M162 800L196 792M186 700L216 696M220 620L250 610M272 548L300 532" stroke="#999" stroke-width="3"/>` +
        text(0, 0, 'TOTAL 20,480', { size: 14, weight: 800, fill: '#c8323c', tr: 'translate(176 752) rotate(-66)' }) +
        `<ellipse cx="600" cy="880" rx="560" ry="40" fill="#5a1e10" opacity=".35"/>` +
        pile +
        // ---- Paimon on top, in bliss ----
        `<g transform="translate(600 300)">` +
        // cape spread behind
        `<path d="M-40-20C-90 0-120 60-110 120L-40 90L0 110L40 90L110 120C120 60 90 0 40-20Z" fill="url(#cape)"/>` +
        `<path d="${dots(14, -100, 100, 10, 110, 1.5, 3)}" fill="#fff" opacity=".85"/>` +
        // legs dangling
        `<path d="M-30 70L-46 120L-30 124L-16 76ZM30 70L46 120L30 124L16 76Z" fill="#fff"/><path d="M-50 116h24v14h-26zM26 116h24l2 14h-26z" fill="#2a2a4a"/>` +
        // body: white dress
        `<path d="M-30-24C-44-10-50 30-50 70C-20 82 20 82 50 70C50 30 44-10 30-24Z" fill="#fbfbff"/><path d="M-50 70C-20 82 20 82 50 70" stroke="#d9aa55" stroke-width="4" fill="none"/>` +
        `<path d="M-14-20L0 4L14-20" stroke="#d9aa55" stroke-width="3" fill="none"/><circle cx="0" cy="10" r="7" fill="#3aa0e6"/>` +
        // head
        `<g transform="translate(0 -120) scale(.66)">` +
        `<path d="M-120-40C-130-120-70-170 0-170C70-170 130-120 120-40C126 20 120 60 110 90L80 60L60 100H-60L-80 60L-110 90C-120 60-126 20-120-40Z" fill="url(#phair)"/>` +
        `<path d="${FACE_F}" fill="url(#pskin)" transform="scale(.92)"/>` +
        // bangs
        `<path d="M-104-40C-104-120-50-150 0-150C50-150 104-120 104-40C80-70 60-80 40-84L30-40L12-86L-6-36L-24-86L-40-42L-48-84C-70-78-90-64-104-40Z" fill="url(#phair)"/>` +
        // blissful closed eyes, blush, open smile, drool
        `<path d="M-70 4Q-44-22-18 4M18 4Q44-22 70 4" stroke="#3a2a4a" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        `<path d="M-72 0L-82-8M72 0L82-8" stroke="#3a2a4a" stroke-width="6" stroke-linecap="round"/>` +
        `<ellipse cx="-62" cy="36" rx="22" ry="12" fill="#ff8aa0" opacity=".55"/><ellipse cx="62" cy="36" rx="22" ry="12" fill="#ff8aa0" opacity=".55"/>` +
        `<path d="M-26 48Q0 46 26 48Q22 86 0 88Q-22 86-26 48Z" fill="#9a2a40"/><path d="M-14 76Q0 68 14 76Q8 86 0 86Q-8 86-14 76Z" fill="#ff7a90"/>` +
        `<path d="M22 66C26 76 26 86 22 92C18 86 18 76 22 66Z" fill="#bfe8ff"/>` +
        `</g>` +
        // star halo/crown
        `<g transform="translate(14 -248) rotate(-12)"><path d="M0-34L9-11L34-11L14 4L22 30L0 15L-22 30L-14 4L-34-11L-9-11Z" fill="#1c2254"/><path d="M0-34L9-11L34-11L14 4L22 30L0 15L-22 30L-14 4L-34-11L-9-11Z" fill="none" stroke="#6a78d8" stroke-width="2"/></g>` +
        // drumstick hug
        `<g transform="translate(-6 -10) rotate(-30)"><path d="M-20-6C-46-30-40-62-10-62C20-62 30-34 12-10L40 30C50 30 56 40 48 46C46 54 34 54 32 44Z" fill="#c8742a"/><path d="M-26-40C-20-54-4-58 8-52" stroke="#f0b060" stroke-width="5" fill="none"/><path d="M36 34l14-6 4 10-12 6z" fill="#fff4e0"/></g>` +
        `<path d="M-46-14C-56 0-50 16-34 18L-20 0ZM46-14C56 0 50 16 34 18L20 0Z" fill="url(#pskin)"/>` +
        `</g>` +
        // hearts + sparkles
        `<g fill="#ff5a7a">${[[470, 130, 1], [760, 110, 0.8], [800, 220, 0.6]].map(([x, y, k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 10C-20-6-16-24-4-22C0-21 0-18 0-16C0-18 0-21 4-22C16-24 20-6 0 10Z"/>`).join('')}</g>` +
        `<g fill="#fff">${[[420, 210], [790, 300], [370, 380]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-16L4-4L16 0L4 4L0 16L-4 4L-16 0L-4-4Z"/>`).join('')}</g>` +
        // ---- the phone: CARD DECLINED ----
        `<g transform="translate(1010 640) rotate(10)">` +
        `<rect x="-120" y="-220" width="240" height="440" rx="40" fill="#000" opacity=".25" transform="translate(12 14)"/>` +
        phoneFront(200, 410, screen, '#2a2a30') +
        `<path d="M100 40C120 36 132 46 130 58C128 68 116 72 100 70ZM100 90C122 86 134 96 132 108C130 118 116 122 100 120ZM98 140C118 138 128 146 126 158C124 168 112 170 98 168Z" fill="url(#hand)"/>` +
        `<path d="M-100 80C-124 90-138 120-134 160C-130 200-114 226-92 236L-100 140Z" fill="url(#hand)"/>` +
        `<path d="M-96 190C-90 230-60 250-20 256C20 260 60 250 100 230L114 330C60 350 0 360-60 350Z" fill="url(#hand)"/>` +
        `<path d="M-70 340C-10 354 60 346 120 320L134 430H-80Z" fill="#3a5a8a"/>` +
        `</g>` +
        `<g fill="#ff3b30" opacity=".9">${[[880, 380], [1150, 420], [860, 470]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M-3-14h6v16h-6zM-3 6h6v6h-6z"/>`).join('')}</g>`,
        0.05, 0.5);
    },
  });
})();
