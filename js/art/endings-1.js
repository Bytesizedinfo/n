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
})();
