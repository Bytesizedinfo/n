/* Feiyun Market product shots (900×900). Clean e-commerce studio look: soft sweep backdrop, gentle key light,
   natural contact shadows. A couple of them are flat-lay or lifestyle shots. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- helpers ----------------------------------------------------------------------------
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const svg = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  const f = (n) => Math.round(n * 10) / 10;
  let S = 1;
  const seed = (n) => { S = n; };
  const rnd = () => (S = (S * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = "Georgia, 'Times New Roman', serif";
  const T = (x, y, s, size, o = {}) =>
    `<text x="${x}" y="${y}" font-family="${o.serif ? SERIF : FONT}" font-size="${size}" font-weight="${o.w || 400}" fill="${o.fill || '#fff'}" text-anchor="${o.a || 'middle'}"` +
    `${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.it ? ' font-style="italic"' : ''}${o.x || ''}>${s}</text>`;

  // Seamless studio sweep: wall gradient into a floor gradient (continuous at the horizon), key light, vignette.
  function studio(wallT, wallB, floorN, hz, key = [0.3, 0.16]) {
    return {
      defs:
        lg('sW', [[0, wallT], [1, wallB]]) + lg('sF', [[0, wallB], [1, floorN]]) +
        rg('sK', [[0, '#fff', 0.55], [1, '#fff', 0]], key[0], key[1], 0.62) +
        rg('sV', [[0.62, '#000', 0], [1, '#000', 0.16]], 0.5, 0.46, 0.78) +
        rg('sh', [[0, '#000', 0.5], [0.45, '#000', 0.24], [1, '#000', 0]]),
      back: `<rect width="900" height="${hz}" fill="url(#sW)"/><rect y="${hz}" width="900" height="${900 - hz}" fill="url(#sF)"/><rect width="900" height="900" fill="url(#sK)"/>`,
      front: `<rect width="900" height="900" fill="url(#sV)"/>`,
    };
  }
  const shadow = (cx, cy, rx, ry, o = 1) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sh)" opacity="${o}"/>`;
  const blur = (id, d) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${d}"/></filter>`;

  // Fluffy edge along an ellipse (angles in degrees, 0 = right, 90 = down), closed.
  function fluff(cx, cy, rx, ry, n, amp, rot = 0) {
    const a0 = rot, st = 360 / n;
    const P = (a, r) => [cx + (rx + r) * Math.cos((a * Math.PI) / 180), cy + (ry + r) * Math.sin((a * Math.PI) / 180)];
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = a0 + st * i;
      const [x, y] = P(a, 0);
      if (i === 0) { d += `M${f(x)} ${f(y)}`; continue; }
      const [tx, ty] = P(a - st * 0.45, amp);
      d += `Q${f(tx)} ${f(ty)} ${f(x)} ${f(y)}`;
    }
    return d + 'Z';
  }

  // Knit (stockinette) overlay pattern: columns of little V stitches.
  const knit = (id, rot = 0, sc = 1) =>
    `<pattern id="${id}" width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(${rot}) scale(${sc})">` +
    `<path d="M0 0V12" stroke="#000" stroke-opacity=".22" stroke-width="2"/>` +
    `<path d="M1.5 1L7 9.5 12.5 1" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M2.5 3.5L6.5 9M11.5 3.5L7.5 9" stroke="#fff" stroke-opacity=".16" stroke-width="1.6" stroke-linecap="round"/></pattern>`;

  // ---- Celadon tea set ---------------------------------------------------------------------
  def('mk_teaset', {
    title: 'Guizhong-era celadon tea set',
    w: 900, h: 900, tags: ['market', 'product', 'teaset', 'zl'],
    svg: (w, h) => {
      const st = studio('#f2ede4', '#ddd4c5', '#ebe4d8', 520);
      const cup = (cx, fy, s, tea) => {
        const rx = 60 * s, ry = 15 * s, ty = f(fy - 64 * s), fw = 27 * s;
        return shadow(cx + 12, fy + 3, rx * 1.2, 13 * s, 0.8) +
          `<ellipse cx="${cx}" cy="${ty}" rx="${rx}" ry="${ry}" fill="url(#ci)"/>` +
          (tea ? `<ellipse cx="${cx}" cy="${f(ty + 4 * s)}" rx="${f(rx * 0.8)}" ry="${f(ry * 0.62)}" fill="url(#tea)"/><ellipse cx="${f(cx - 14 * s)}" cy="${f(ty + 2 * s)}" rx="${f(14 * s)}" ry="${f(3 * s)}" fill="#fff" opacity=".35"/>` : '') +
          `<path d="M${f(cx - fw)} ${f(fy - 5 * s)}V${fy}H${f(cx + fw)}V${f(fy - 5 * s)}Z" fill="#a08a66"/>` +
          `<path d="M${f(cx - rx)} ${ty}C${f(cx - rx)} ${f(fy - 28 * s)} ${f(cx - fw - 6 * s)} ${f(fy - 7 * s)} ${f(cx - fw)} ${f(fy - 5 * s)}H${f(cx + fw)}C${f(cx + fw + 6 * s)} ${f(fy - 7 * s)} ${f(cx + rx)} ${f(fy - 28 * s)} ${f(cx + rx)} ${ty}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx - rx)} ${ty}Z" fill="url(#cb)"/>` +
          `<path d="M${f(cx - rx * 0.74)} ${f(ty + 13 * s)}C${f(cx - rx * 0.7)} ${f(ty + 30 * s)} ${f(cx - rx * 0.52)} ${f(ty + 44 * s)} ${f(cx - rx * 0.36)} ${f(ty + 51 * s)}" stroke="#fff" stroke-opacity=".6" stroke-width="${f(6 * s)}" fill="none" stroke-linecap="round"/>` +
          `<ellipse cx="${cx}" cy="${ty}" rx="${f(rx)}" ry="${f(ry)}" fill="none" stroke="#eef6ea" stroke-width="2.5"/>`;
      };
      const petals = [0, 72, 144, 216, 288].map((a) => `<ellipse rx="4.5" ry="9" cy="-8.5" transform="rotate(${a})"/>`).join('');
      return svg(w, h,
        st.defs +
        lg('cb', [[0, '#8fb399'], [0.22, '#d8e9d4'], [0.5, '#b6d2b7'], [1, '#6f957c']], 0, 0, 1, 0) +
        lg('ci', [[0, '#7aa086'], [1, '#d4e6d0']]) +
        rg('tea', [[0, '#e0aa52'], [1, '#a5661c']]) +
        rg('pb', [[0, '#f6fbf2'], [0.28, '#d3e6cf'], [0.62, '#a8c9ad'], [0.9, '#7ca48a'], [1, '#6a917a']], 0.36, 0.3, 0.75) +
        lg('sp', [[0, '#e6f2e2'], [1, '#82a88d']], 0, 0, 1, 1) +
        lg('hd', [[0, '#d2e5ce'], [1, '#78a085']]) +
        lg('wd', [[0, '#4e2f1d'], [1, '#7a4d30']]) +
        rg('gl', [[0, '#fff', 0.85], [1, '#fff', 0]]),
        st.back +
        `<g transform="translate(-54 -50) scale(1.12)">` +
        shadow(450, 812, 410, 20, 0.7) +
        // walnut tray
        `<path d="M172 546Q160 546 156 558L92 760Q88 778 106 778H794Q812 778 808 760L744 558Q740 546 728 546Z" fill="#3a2315"/>` +
        `<path d="M188 562L120 764H780L712 562Z" fill="url(#wd)"/>` +
        `<path d="M200 590Q450 576 706 596M176 650Q430 632 726 660M150 712Q470 694 752 722M140 744Q400 736 768 748" fill="none" stroke="#9a6a45" stroke-opacity=".35" stroke-width="2"/>` +
        `<path d="M106 778H794Q808 778 808 790V794Q808 808 794 808H106Q92 808 92 794V790Q92 778 106 778Z" fill="#26150b"/>` +
        `<path d="M188 562H712" stroke="#2a180d" stroke-width="3"/>` +
        shadow(468, 646, 175, 26, 0.95) +
        // handle
        `<path d="M586 456C694 430 714 602 588 614" fill="none" stroke="url(#hd)" stroke-width="26" stroke-linecap="round"/>` +
        `<path d="M602 450C668 446 690 530 650 582" fill="none" stroke="#f4faf0" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>` +
        // foot (iron-brown unglazed ring)
        `<path d="M362 622L366 642Q450 654 534 642L538 622Z" fill="#8a6a4e"/>` +
        // spout
        `<path d="M324 482C282 470 242 438 214 386L194 396C220 460 252 552 320 582Z" fill="url(#sp)"/>` +
        `<ellipse cx="204" cy="391" rx="11.5" ry="5" transform="rotate(-27 204 391)" fill="#5d8a72"/>` +
        `<path d="M226 410C246 446 262 480 290 512" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        // body
        `<path d="M300 525C300 440 370 404 450 404C530 404 600 440 600 525C600 600 540 640 450 640C360 640 300 600 300 525Z" fill="url(#pb)"/>` +
        `<path d="M322 470Q450 512 578 470" fill="none" stroke="#6f9a80" stroke-width="2"/><path d="M322 475Q450 517 578 475" fill="none" stroke="#f3faef" stroke-opacity=".7" stroke-width="1.5"/>` +
        `<path d="M596 500C604 560 576 616 512 634" fill="none" stroke="#eef7ea" stroke-opacity=".6" stroke-width="3"/>` +
        `<ellipse cx="380" cy="462" rx="52" ry="26" transform="rotate(-28 380 462)" fill="url(#gl)"/>` +
        // crackle in the glaze
        `<path d="M342 560l22-14 10 18 24-8M520 590l18-16 4 22 22-6M420 610l14-10 16 8M560 520l14 10-6 16" fill="none" stroke="#f4fbf1" stroke-opacity=".22" stroke-width="1"/>` +
        // floral glaze mark
        `<g transform="translate(450 566)" fill="#4b8069" opacity=".8">${petals}<circle r="3.6" fill="#d9c58e"/></g>` +
        `<path d="M434 588q16 8 32 0" fill="none" stroke="#4b8069" stroke-opacity=".6" stroke-width="2"/>` +
        // neck, lid, knob
        `<ellipse cx="450" cy="410" rx="76" ry="16" fill="#7fa58b"/>` +
        `<path d="M384 410C386 381 418 368 450 368C482 368 514 381 516 410A66 12 0 0 1 384 410Z" fill="url(#pb)"/>` +
        `<path d="M400 396C410 382 428 376 446 375" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>` +
        `<rect x="442" y="356" width="16" height="16" fill="#9bbea4"/><circle cx="450" cy="352" r="17" fill="url(#pb)"/>` +
        cup(200, 662, 0.9, false) + cup(712, 662, 0.9, true) + cup(336, 748, 1, true) + cup(566, 748, 1, false) +
        `</g>` + st.front
      );
    },
  });

  // ---- Glaze lily bouquet ------------------------------------------------------------------
  def('mk_lilies', {
    title: 'Glaze lily bouquet',
    w: 900, h: 900, tags: ['market', 'product', 'flowers', 'zl'],
    svg: (w, h) => {
      const st = studio('#f3f5f7', '#e0e6eb', '#edf1f4', 720);
      const lily = (x, y, s, r) =>
        `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">` +
        `<ellipse cy="48" rx="56" ry="60" fill="url(#lgw)"/>` +
        `<path d="M-6 4C-27 8-33 30-31 52Q-41 63-54 63Q-40 75-22 70Q-12 85 0 89Q12 85 22 70Q40 75 54 63Q41 63 31 52C33 30 27 8 6 4Z" fill="url(#lb)" stroke="#a6c8e8" stroke-width="1.2"/>` +
        `<path d="M-31 52Q-20 60-22 70Q-8 64 0 66Q8 64 22 70Q20 60 31 52Q0 62-31 52Z" fill="#cfe3f6"/>` +
        `<path d="M-4 10C-14 26-20 48-22 69M4 10C14 26 20 48 22 69M0 12V64" fill="none" stroke="#a9cdee" stroke-width="1.6" opacity=".7"/>` +
        `<path d="M-3 74L-7 102M0 76V106M3 74L8 101" stroke="#e7efd2" stroke-width="1.5"/>` +
        `<circle cx="-7" cy="103" r="2.6" fill="#f2d27a"/><circle cy="107" r="2.6" fill="#f2d27a"/><circle cx="8" cy="102" r="2.6" fill="#f2d27a"/>` +
        `<path d="M-7 -2Q0 -9 7 -2L6 7Q0 10-6 7Z" fill="#6fae84"/></g>`;
      const stem = (x, y, r, sw = 4.5) => {
        const a = (r * Math.PI) / 180, tx = f(x + 13 * Math.sin(a)), ty = f(y - 13 * Math.cos(a)), sg = Math.sign(r || 1);
        return `<path d="M450 730C${f(450 + (x - 450) * 0.15)} 620 ${f(x + (450 - x) * 0.1 + 24 * sg)} ${f(y - 40)} ${f(tx + 20 * sg)} ${f(y - 40)}Q${f(tx + 6 * sg)} ${f(y - 36)} ${tx} ${ty}" fill="none" stroke="#5f9e72" stroke-width="${sw}" stroke-linecap="round"/>`;
      };
      const leaf = (a, L, wd) =>
        `<g transform="translate(450 720) rotate(${a})"><path d="M0 0C${wd} ${-L * 0.3} ${wd * 0.8} ${-L * 0.75} 0 ${-L}C${-wd * 0.6} ${-L * 0.7} ${-wd * 0.7} ${-L * 0.3} 0 0Z" fill="url(#lf)"/>` +
        `<path d="M0 0Q${wd * 0.15} ${-L * 0.5} 0 ${-L * 0.96}" stroke="#2f7458" stroke-width="1.6" fill="none" opacity=".6"/></g>`;
      const bud = (x, y, r) =>
        `<path d="M450 730Q${f((x + 450) / 2 + (x < 450 ? 30 : -30))} ${f(y + 150)} ${x} ${y}" fill="none" stroke="#6aa97c" stroke-width="3.5"/>` +
        `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0C-13 7-15 28 0 44C15 28 13 7 0 0Z" fill="url(#bd)"/><path d="M0 4V40" stroke="#b9d6c6" stroke-width="1.2"/><path d="M-6 -2Q0 -8 6 -2L5 6Q0 8-5 6Z" fill="#6fae84"/></g>`;
      const euc = (a, L) => {
        let s = `<g transform="translate(450 720) rotate(${a})"><path d="M0 0Q8 ${-L * 0.5} 0 ${-L}" stroke="#7d9a8c" stroke-width="2.5" fill="none"/>`;
        for (let i = 0; i < 6; i++) {
          const y = -L * (0.45 + i * 0.1), side = i % 2 ? 1 : -1, r = 17 - i * 1.6;
          s += `<ellipse cx="${f(side * r * 0.9 + 4)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.86)}" fill="${i % 2 ? '#9dbcad' : '#88ab9b'}"/>`;
        }
        return s + `</g>`;
      };
      const FL = [[244, 288, 1.22, 26], [656, 286, 1.22, -26], [330, 186, 1.32, 14], [572, 184, 1.32, -14], [450, 128, 1.42, -3], [312, 360, 1.18, 16], [590, 360, 1.18, -16], [388, 286, 1.34, 6], [516, 276, 1.38, -6]];
      let stems = '', fl = '';
      for (const [x, y, s, r] of FL) { stems += stem(x, y, r); fl += lily(x, y, s, r); }
      return svg(w, h,
        st.defs +
        lg('lb', [[0, '#ffffff'], [0.55, '#eef6ff'], [1, '#b7d6f3']]) +
        rg('lgw', [[0, '#cfe6ff', 0.7], [1, '#cfe6ff', 0]]) +
        lg('bd', [[0, '#f6fbf4'], [1, '#c4e0cc']]) +
        lg('lf', [[0, '#2f8a66'], [1, '#7cc49a']], 0, 1, 0, 0) +
        lg('pk', [[0, '#a9cdb9'], [1, '#d6eadf']], 0, 0, 1, 1) +
        lg('pw', [[0, '#fbf8f1'], [0.6, '#efe8da'], [1, '#d9cfbc']], 0, 0, 1, 0) +
        lg('pw2', [[0, '#e8dfcd'], [1, '#fffdf7']], 0, 0, 1, 0.4) +
        lg('rb', [[0, '#3fb390'], [0.5, '#25876b'], [1, '#17624e']]) +
        blur('bl', 22),
        st.back +
        `<ellipse cx="496" cy="500" rx="270" ry="330" fill="#7a8a99" opacity=".18" filter="url(#bl)"/>` +
        shadow(462, 884, 130, 18, 0.8) +
        // back wrap: jade paper sheets
        `<path d="M450 740L118 330Q180 236 286 196L452 290L614 190Q730 230 784 330Z" fill="url(#pk)"/>` +
        `<path d="M450 740L286 196M614 190L450 740" fill="none" stroke="#93b9a5" stroke-width="2"/>` +
        `<path d="M450 730L170 380L232 300L352 290L452 360L556 282L676 300L730 386Z" fill="#fbfcfb"/>` +
        euc(-40, 360) + euc(38, 350) + euc(-12, 470) +
        leaf(-44, 360, 34) + leaf(46, 350, 34) + leaf(-24, 440, 30) + leaf(24, 450, 30) + leaf(4, 500, 26) +
        bud(214, 196, -26) + bud(690, 190, 26) + bud(372, 96, -10) + bud(540, 92, 12) +
        stems + euc(-30, 300) + euc(32, 290) + fl +
        // front wrap
        `<path d="M222 478Q300 508 452 502Q600 496 684 456L486 756H416Z" fill="url(#pw)"/>` +
        `<path d="M222 478Q300 508 452 502L556 500L460 756H416Z" fill="url(#pw2)"/>` +
        `<path d="M306 496L432 752M452 502L446 752M606 484L476 754" stroke="#c9bda6" stroke-width="2" opacity=".5"/>` +
        `<path d="M222 478Q300 508 452 502Q600 496 684 456" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>` +
        `<path d="M416 756L394 872Q450 884 510 872L486 756Z" fill="url(#pw)"/>` +
        `<path d="M450 760L452 880" stroke="#c9bda6" stroke-width="2" opacity=".5"/>` +
        // jade ribbon bow
        `<path d="M410 732Q450 746 492 732L496 760Q450 774 406 760Z" fill="url(#rb)"/>` +
        `<path d="M446 748C418 768 406 826 376 862L396 870C424 834 440 790 452 756Z" fill="#1d6f58"/>` +
        `<path d="M454 748C472 774 494 816 530 844L514 856C484 826 464 790 448 756Z" fill="#23856a"/>` +
        `<path d="M446 746C404 696 336 704 344 742C352 776 418 766 446 752Z" fill="url(#rb)"/>` +
        `<path d="M454 746C496 696 564 704 556 742C548 776 482 766 454 752Z" fill="url(#rb)"/>` +
        `<path d="M358 730Q392 716 438 744M542 730Q508 716 462 744" fill="none" stroke="#8be0c2" stroke-width="2.5" opacity=".7"/>` +
        `<ellipse cx="450" cy="749" rx="16" ry="14" fill="#1b7a5f"/><ellipse cx="446" cy="745" rx="6" ry="4" fill="#9ae6cb" opacity=".6"/>` +
        st.front
      );
    },
  });

  // ---- Sir Fang plush ----------------------------------------------------------------------
  def('mk_sirfang', {
    title: 'Sir Fang plush XL',
    w: 900, h: 900, tags: ['market', 'product', 'toy', 'teucer'],
    svg: (w, h) => {
      const st = studio('#eaf0fa', '#d2dcef', '#e8eef8', 610);
      const NAVY = '#16294d';
      const eye = (cx, cy) =>
        `<ellipse cx="${cx}" cy="${cy}" rx="34" ry="39" fill="url(#ey)"/>` +
        `<ellipse cx="${cx}" cy="${cy + 2}" rx="24" ry="28" fill="none" stroke="#4f8fd6" stroke-width="3" opacity=".55"/>` +
        `<circle cx="${cx + 11}" cy="${cy - 14}" r="12" fill="#fff"/><circle cx="${cx - 11}" cy="${cy + 13}" r="5.5" fill="#fff" opacity=".9"/>` +
        `<path d="M${cx - 26} ${cy + 18}Q${cx} ${cy + 40} ${cx + 26} ${cy + 18}" fill="none" stroke="#9ec9f2" stroke-width="2.5" opacity=".6"/>`;
      return svg(w, h,
        st.defs +
        rg('fur', [[0, '#ffffff'], [0.6, '#f1f6fc'], [1, '#c8d6e8']], 0.4, 0.32, 0.7) +
        rg('fur2', [[0, '#ffffff'], [0.7, '#eef4fb'], [1, '#d4e0ee']], 0.45, 0.35, 0.7) +
        lg('ice', [[0, '#a9d6f5'], [1, '#5b9fd8']]) +
        lg('tl', [[0, '#7fb8ea'], [0.35, '#d7ebfa'], [1, '#ffffff']]) +
        rg('ey', [[0, '#3c78bf'], [0.55, '#1c3a6c'], [1, NAVY]], 0.5, 0.68, 0.6) +
        lg('scf', [[0, '#d8434b'], [1, '#a4232c']]) +
        knit('kn', 0, 0.8) + knit('kn2', 12, 0.8) + `<clipPath id="hc"><path d="${fluff(450, 362, 182, 148, 32, 11)}"/></clipPath>`,
        st.back +
        shadow(462, 812, 270, 38) +
        // tail
        `<g transform="rotate(32 650 640)"><path d="${fluff(650, 640, 64, 150, 18, 16)}" fill="url(#tl)"/></g>` +
        // body
        `<path d="${fluff(450, 640, 168, 152, 30, 13)}" fill="url(#fur)"/>` +
        `<path d="${fluff(450, 668, 92, 104, 18, 9)}" fill="#fff"/>` +
        `<path d="M450 580V770" stroke="#c6d4e6" stroke-width="2.5" stroke-dasharray="7 7"/>` +
        // arms
        `<g transform="rotate(14 336 652)"><path d="${fluff(336, 652, 44, 82, 14, 9)}" fill="url(#fur2)"/></g>` +
        `<g transform="rotate(-14 564 652)"><path d="${fluff(564, 652, 44, 82, 14, 9)}" fill="url(#fur2)"/></g>` +
        // feet with paw pads
        [370, 530].map((x) =>
          `<ellipse cx="${x}" cy="768" rx="62" ry="50" fill="url(#fur2)"/>` +
          `<ellipse cx="${x}" cy="782" rx="24" ry="19" fill="url(#ice)"/>` +
          [-26, 0, 26].map((d) => `<ellipse cx="${x + d}" cy="${d ? 753 : 746}" rx="10" ry="12" fill="url(#ice)"/>`).join('')
        ).join('') +
        // scarf band + tail
        `<path d="M298 478Q450 548 602 478L610 522Q450 600 290 522Z" fill="url(#scf)"/><path d="M298 478Q450 548 602 478L610 522Q450 600 290 522Z" fill="url(#kn)"/>` +
        `<path d="M352 520L400 532L398 700L338 694Z" fill="url(#scf)"/><path d="M352 520L400 532L398 700L338 694Z" fill="url(#kn2)"/>` +
        `<path d="M341 696V722M351 697V726M361 698V722M371 698V727M381 699V722M391 700V725" stroke="#b92d36" stroke-width="6" stroke-linecap="round"/>` +
        `<ellipse cx="376" cy="532" rx="34" ry="26" fill="#b52a33"/><ellipse cx="376" cy="532" rx="34" ry="26" fill="url(#kn)"/><path d="M350 520Q376 508 402 522" fill="none" stroke="#e46a70" stroke-width="3" opacity=".7"/>` +
        // ears (behind head)
        `<path d="M296 316Q278 204 316 132Q328 122 342 132Q392 196 410 258Z" fill="url(#ice)"/>` +
        `<path d="M316 290Q306 214 326 160Q366 212 384 262Z" fill="#fde8ef"/>` +
        `<path d="M604 316Q622 204 584 132Q572 122 558 132Q508 196 490 258Z" fill="url(#ice)"/>` +
        `<path d="M584 290Q594 214 574 160Q534 212 516 262Z" fill="#fde8ef"/>` +
        // head + cheek ruff
        `<path d="${fluff(318, 418, 70, 56, 12, 14, 90)}" fill="url(#fur2)"/><path d="${fluff(582, 418, 70, 56, 12, 14, 90)}" fill="url(#fur2)"/>` +
        `<path d="${fluff(450, 362, 182, 148, 32, 11)}" fill="url(#fur2)"/>` +
        // ice-blue crown marking + snowflake
        `<path clip-path="url(#hc)" d="M290 300Q300 180 450 180Q600 180 610 300Q546 286 506 304Q470 318 450 344Q430 318 394 304Q354 286 290 300Z" fill="url(#ice)"/>` +
        `<g transform="translate(450 266)" stroke="#fff" stroke-width="4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -16V16" transform="rotate(${a})"/>`).join('')}</g>` +
        `<path d="M450 216V250M450 470V500" stroke="#c6d4e6" stroke-width="2.5" stroke-dasharray="7 7"/>` +
        // blush, eyes
        `<ellipse cx="322" cy="436" rx="30" ry="16" fill="#ffb3c4" opacity=".45"/><ellipse cx="578" cy="436" rx="30" ry="16" fill="#ffb3c4" opacity=".45"/>` +
        eye(380, 376) + eye(520, 376) +
        // muzzle, nose, mouth, fang
        `<path d="${fluff(450, 446, 80, 54, 16, 6)}" fill="#fff"/>` +
        `<path d="M424 414Q450 402 476 414Q474 436 450 444Q426 436 424 414Z" fill="${NAVY}"/><ellipse cx="441" cy="414" rx="9" ry="4.5" fill="#6d8fc4"/>` +
        `<path d="M450 444V456M416 452Q433 472 450 457Q467 472 484 452" fill="none" stroke="${NAVY}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<path d="M462 463L468 478L474 462Z" fill="#fff" stroke="#c9d6e6" stroke-width="1.5" stroke-linejoin="round"/>` +
        // hang tag on the right ear
        `<path d="M560 196C600 210 640 252 660 300" fill="none" stroke="#c8323c" stroke-width="3"/>` +
        `<g transform="rotate(10 700 360)"><rect x="618" y="298" width="178" height="112" rx="14" fill="#fff" stroke="#d5dfeb" stroke-width="2"/>` +
        `<path d="M618 340V312Q618 298 632 298H782Q796 298 796 312V340Z" fill="#2f7fd0"/>` +
        `<circle cx="644" cy="318" r="7" fill="#d2dcef"/>` +
        T(726, 326, 'GLACIER GUARDIANS', 10, { w: 700, ls: 1 }) +
        T(707, 378, 'SIR FANG', 30, { w: 900, fill: NAVY, ls: 0.5 }) +
        `<rect x="684" y="386" width="46" height="18" rx="9" fill="#c8323c"/>` + T(707, 400, 'XL', 14, { w: 800 }) + `</g>` +
        st.front
      );
    },
  });

  // ---- Glacier Guardians: Frost Fortress (boxed set) ---------------------------------------
  def('mk_frost_fortress', {
    title: 'Glacier Guardians: Frost Fortress set',
    w: 900, h: 900, tags: ['market', 'product', 'toy', 'teucer'],
    svg: (w, h) => {
      const st = studio('#f5f0e7', '#e3dacb', '#efe8dc', 700);
      const tower = (x, y, wd, ht, sp, flag = 1) =>
        `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="url(#ic)"/>` +
        `<path d="M${x + wd * 0.55} ${y}V${y + ht}" stroke="#fff" stroke-width="2" opacity=".5"/>` +
        `<path d="M${x - 7} ${y}L${x + wd / 2} ${y - sp}V${y}Z" fill="#f4fcff"/><path d="M${x + wd + 7} ${y}L${x + wd / 2} ${y - sp}V${y}Z" fill="#8fcff8"/>` +
        `<path d="M${x - 7} ${y}L${x + wd / 2} ${y - sp * 0.55}L${x + wd + 7} ${y}" fill="none" stroke="#6fb6ea" stroke-width="1.5" opacity=".6"/>` +
        `<rect x="${x - 5}" y="${y}" width="${wd + 10}" height="10" fill="#e6f6ff"/>` +
        (flag ? `<path d="M${x + wd / 2} ${y - sp}V${y - sp - 26}" stroke="#2a3f7a" stroke-width="2.5"/><path d="M${x + wd / 2} ${y - sp - 26}l24 7-24 7Z" fill="#e8434c"/>` : '') +
        `<path d="M${x + wd / 2 - 9} ${y + 46}v-8a9 9 0 0 1 18 0v8Z" fill="#ffd45e"/><path d="M${x + wd / 2 - 7} ${y + 96}v-6a7 7 0 0 1 14 0v6Z" fill="#ffd45e" opacity=".85"/>`;
      const shard = (x, b, ht, wd) => `<path d="M${x - wd} ${b}L${x} ${b - ht}V${b}Z" fill="#effaff"/><path d="M${x + wd} ${b}L${x} ${b - ht}V${b}Z" fill="#7cc4f4"/>`;
      const guard = (x, y, s, c) =>
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        `<path d="M-22 0L-30 62H30L22 0Z" fill="${c}"/>` +
        `<path d="M-24 6Q0 18 24 6L22 0H-22Z" fill="#e8f4ff" opacity=".7"/>` +
        `<rect x="-24" y="62" width="20" height="20" rx="4" fill="#3b4f86"/><rect x="4" y="62" width="20" height="20" rx="4" fill="#3b4f86"/>` +
        `<path d="M34 -50V84" stroke="#e7d6a8" stroke-width="5"/><path d="M34 -66l8 18h-16Z" fill="#dfeffd"/>` +
        `<rect x="-26" y="-50" width="52" height="50" rx="20" fill="#dbeaf8"/><rect x="-18" y="-30" width="36" height="9" rx="4" fill="#16294d"/>` +
        `<path d="M0 -50Q-4 -74 18 -80Q8 -64 6 -50Z" fill="#e8434c"/>` +
        `<circle cx="-30" cy="30" r="22" fill="#2f7fd0" stroke="#dbeaf8" stroke-width="5"/>` +
        `<g transform="translate(-30 30)" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M0 -12V12M-10 -6L10 6M-10 6L10 -6"/></g></g>`;
      let rays = '';
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const a2 = a + 0.09;
        rays += `M415 520L${f(415 + Math.cos(a) * 700)} ${f(520 + Math.sin(a) * 700)}L${f(415 + Math.cos(a2) * 700)} ${f(520 + Math.sin(a2) * 700)}Z`;
      }
      let star = '';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, r = i % 2 ? 44 : 60;
        star += (i ? 'L' : 'M') + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r);
      }
      return svg(w, h,
        st.defs +
        lg('bx', [[0, '#14246e'], [0.5, '#2c5ad4'], [1, '#78c4ff']]) +
        lg('ic', [[0, '#c9ecff'], [0.5, '#8fd1ff'], [1, '#4d9ae6']], 0, 0, 1, 0) +
        lg('ic2', [[0, '#ffffff'], [1, '#7cc2f5']], 0, 0, 1, 1) +
        lg('sn', [[0, '#ffffff'], [1, '#bcdcf5']]) +
        lg('lt', [[0, '#ffffff'], [0.5, '#d9f1ff'], [1, '#7fd0ff']]) +
        lg('sd', [[0, '#1f3f9a'], [1, '#0f2463']]) +
        lg('tp', [[0, '#5a8ff0'], [1, '#3a6fe0']]) +
        lg('gls', [[0, '#fff', 0], [0.5, '#fff', 0.22], [1, '#fff', 0]], 0, 0, 1, 0.3) + blur('bl', 12) +
        `<clipPath id="fc"><rect x="175" y="175" width="480" height="630"/></clipPath>`,
        st.back +
        shadow(500, 808, 360, 30) +
        `<path d="M190 800H660L752 748L830 770L700 826H200Z" fill="#3a2a10" opacity=".25" filter="url(#bl)"/>` +
        // top + side faces
        `<path d="M175 175L270 120H750L655 175Z" fill="url(#tp)"/>` +
        `<path d="M175 175L270 120H750" fill="none" stroke="#a9c8ff" stroke-width="2"/>` +
        `<g transform="matrix(1 -.5789 0 1 655 175)"><rect width="95" height="630" fill="url(#sd)"/>` +
        `<text transform="translate(58 315) rotate(90)" font-family="${FONT}" font-size="30" font-weight="900" fill="#fff" text-anchor="middle" letter-spacing="2">FROST FORTRESS</text>` +
        `<rect x="14" y="560" width="66" height="44" rx="6" fill="#fff"/><path d="M22 570v24M28 570v24M33 570v24M40 570v24M44 570v24M52 570v24M57 570v24M64 570v24M70 570v24" stroke="#222" stroke-width="2.5"/></g>` +
        // front face
        `<g clip-path="url(#fc)"><rect x="175" y="175" width="480" height="630" fill="url(#bx)"/>` +
        `<path d="${rays}" fill="#fff" opacity=".08"/>` +
        `<circle cx="415" cy="520" r="170" fill="#bfe8ff" opacity=".25"/>` +
        `<path d="M232 210l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM612 260l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM560 200l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff"/>` +
        // castle
        `<path d="M260 576h310v90H260z" fill="url(#ic)"/>` +
        `<path d="M260 576v-16h22v16h20v-16h22v16h20v-16h22v16h88v-16h22v16h20v-16h22v16h20v-16h22v16Z" fill="url(#ic)"/>` +
        `<path d="M260 590H570" stroke="#e6f6ff" stroke-width="5"/>` +
        tower(272, 476, 58, 184, 70) + tower(498, 462, 58, 198, 76) + tower(372, 448, 86, 212, 74, 0) +
        shard(250, 668, 64, 18) + shard(274, 668, 40, 13) + shard(586, 668, 74, 20) + shard(560, 668, 42, 14) + shard(352, 668, 34, 12) + shard(478, 668, 38, 13) +
        `<path d="M385 664v-56a30 30 0 0 1 60 0v56Z" fill="#1d3a8f"/><path d="M393 664v-52a22 22 0 0 1 44 0v52" fill="none" stroke="#9fdcff" stroke-width="3"/>` +
        `<path d="M175 676Q300 640 420 660Q560 680 655 650V805H175Z" fill="url(#sn)"/>` +
        guard(262, 694, 1, '#7fa8d8') + guard(566, 694, 1, '#7fa8d8') + guard(415, 704, 1.2, '#5d8fd0') +
        // logo
        `<g font-family="${FONT}" font-weight="900" text-anchor="middle" stroke="#0e1d55" stroke-linejoin="round" paint-order="stroke">` +
        `<text x="415" y="256" font-size="70" fill="url(#lt)" stroke-width="12" letter-spacing="1">GLACIER</text>` +
        `<text x="415" y="312" font-size="52" fill="url(#lt)" stroke-width="11" letter-spacing="1">GUARDIANS</text></g>` +
        `<path d="M232 326H598L584 345L598 364H232L246 345Z" fill="#e8434c"/><path d="M232 364H598" stroke="#9a1c2c" stroke-width="3"/>` + T(415, 355, 'FROST FORTRESS', 24, { w: 900, ls: 3 }) +
        `<g transform="translate(596 440) rotate(-12)"><path d="${star}Z" fill="#ffd23f" stroke="#fff" stroke-width="4"/>` +
        T(0, -4, 'LIGHTS', 18, { w: 900, fill: '#c8233c' }) + T(0, 17, 'UP!', 20, { w: 900, fill: '#c8233c' }) + `</g>` +
        `<rect x="175" y="768" width="480" height="37" fill="#0e1d55" opacity=".85"/>` + T(415, 793, '4 FIGURES · TOWER LIGHTS · SNOW CANNON', 15, { w: 700, ls: 1 }) +
        `<circle cx="222" cy="726" r="30" fill="#ffd23f" stroke="#fff" stroke-width="3"/>` + T(222, 722, 'AGES', 10, { w: 800, fill: '#14246e' }) + T(222, 742, '6+', 20, { w: 900, fill: '#14246e' }) +
        `<path d="M175 175H655V805H175Z" fill="url(#gls)"/></g>` +
        `<path d="M175 175H655V805H175ZM655 175L750 120V750L655 805" fill="none" stroke="#0b1a4d" stroke-opacity=".35" stroke-width="2"/>` +
        st.front
      );
    },
  });

  // ---- Snezhnayan fountain pen in a gift box (flat lay) ------------------------------------
  def('mk_pen', {
    title: 'Snezhnayan fountain pen, gift box',
    w: 900, h: 900, tags: ['market', 'product', 'pen', 'tonia'],
    svg: (w, h) => {
      const flake = (cx, cy, r, sw) => {
        let p = '';
        for (let i = 0; i < 6; i++) {
          const a = i * 60;
          p += `<g transform="rotate(${a})"><path d="M0 0V${-r}M0 ${f(-r * 0.55)}l${f(r * 0.24)} ${f(-r * 0.22)}M0 ${f(-r * 0.55)}l${f(-r * 0.24)} ${f(-r * 0.22)}M0 ${f(-r * 0.8)}l${f(r * 0.14)} ${f(-r * 0.13)}M0 ${f(-r * 0.8)}l${f(-r * 0.14)} ${f(-r * 0.13)}"/></g>`;
        }
        return `<g transform="translate(${cx} ${cy})" stroke-width="${sw}" stroke-linecap="round" fill="none">${p}</g>`;
      };
      return svg(w, h,
        lg('bg', [[0, '#f1eee9'], [1, '#d8d2c8']], 0, 0, 1, 1) +
        rg('kl', [[0, '#fff', 0.6], [1, '#fff', 0]], 0.25, 0.2, 0.7) +
        rg('vg', [[0.6, '#000', 0], [1, '#000', 0.18]], 0.5, 0.5, 0.75) +
        lg('lid', [[0, '#22345c'], [1, '#121d38']], 0, 0, 1, 1) +
        lg('box', [[0, '#1d2c50'], [1, '#0f1830']]) +
        lg('wall', [[0, '#0b1226'], [1, '#2a3a62']]) +
        lg('silk', [[0, '#f6f2ea'], [0.3, '#fffdf8'], [0.55, '#ebe3d4'], [0.8, '#f8f3ea'], [1, '#e4dbca']], 0, 0, 1, 1) +
        lg('slot', [[0, '#cfc4b0'], [0.45, '#e9e1d2'], [1, '#f7f2e9']]) +
        lg('lac', [[0, '#0d1834'], [0.22, '#3d5a9a'], [0.34, '#9bb6e6'], [0.46, '#2c4785'], [0.85, '#101c3c'], [1, '#08102a']]) +
        lg('sil', [[0, '#7d8794'], [0.3, '#f4f7fa'], [0.55, '#aeb7c2'], [1, '#5f6874']]) +
        lg('blk', [[0, '#05070c'], [0.3, '#4a5160'], [0.5, '#151922'], [1, '#020306']]) +
        lg('nib', [[0, '#e8edf2'], [0.5, '#b9c2cc'], [1, '#8a94a0']]) +
        lg('rbn', [[0, '#c9d3e0'], [0.5, '#f4f7fb'], [1, '#aab6c6']]) +
        blur('bl', 14),
        `<rect width="900" height="900" fill="url(#bg)"/><rect width="900" height="900" fill="url(#kl)"/>` +
        // lid underneath, peeking out
        `<g transform="rotate(-16 430 300)"><rect x="150" y="128" width="620" height="330" rx="14" fill="#000" opacity=".25" filter="url(#bl)" transform="translate(10 16)"/>` +
        `<rect x="150" y="128" width="620" height="330" rx="14" fill="url(#lid)"/>` +
        `<rect x="164" y="142" width="592" height="302" rx="8" fill="none" stroke="#c9d3e0" stroke-opacity=".35" stroke-width="2"/>` +
        `<g stroke="#d9e2ee" opacity=".9">${flake(250, 214, 32, 3)}</g>` +
        T(478, 224, 'SNEZHNAYA', 30, { serif: 1, fill: '#d9e2ee', ls: 9 }) + T(478, 252, 'ATELIER · EST. 1801', 12, { fill: '#aab8cc', ls: 5 }) + `</g>` +
        // box base
        `<g transform="rotate(-7 450 520)">` +
        `<rect x="104" y="350" width="692" height="350" rx="16" fill="#000" opacity=".32" filter="url(#bl)" transform="translate(14 22)"/>` +
        `<rect x="104" y="350" width="692" height="350" rx="16" fill="url(#box)"/>` +
        `<rect x="124" y="370" width="652" height="310" rx="8" fill="url(#wall)"/>` +
        `<rect x="134" y="384" width="632" height="290" rx="6" fill="url(#silk)"/>` +
        `<path d="M134 470Q300 440 470 476T766 450M134 600Q330 620 520 590T766 610" stroke="#fff" stroke-width="10" opacity=".45" fill="none"/>` +
        `<rect x="150" y="452" width="600" height="58" rx="29" fill="url(#slot)"/>` +
        `<rect x="420" y="560" width="300" height="64" rx="32" fill="url(#slot)"/>` +
        // pen (uncapped)
        `<g transform="translate(0 481)">` +
        `<path d="M168 -17Q156 -17 156 0Q156 17 168 17H194V-17Z" fill="url(#sil)"/>` +
        `<path d="M194 -19H520V19H194Z" fill="url(#lac)"/>` +
        `<rect x="246" y="-19" width="6" height="38" fill="url(#sil)"/>` +
        `<path d="M520 -20H534V20H520Z" fill="url(#sil)"/>` +
        `<path d="M534 -15L590 -12V12L534 15Z" fill="url(#blk)"/>` +
        `<path d="M590 -11Q630 -11 690 0Q630 11 590 11Z" fill="url(#nib)"/>` +
        `<path d="M598 -10Q600 0 598 10" fill="none" stroke="#8a6a2e" stroke-width="2"/>` +
        `<path d="M628 0H690" stroke="#4b5260" stroke-width="1.5"/><circle cx="628" cy="0" r="3.2" fill="#4b5260"/>` +
        `<path d="M604 -6Q614 -4 618 0Q614 4 604 6" fill="none" stroke="#6f7884" stroke-width="1.2"/></g>` +
        // cap (snowflake engraved)
        `<g transform="translate(0 592)">` +
        `<path d="M436 -21H672Q690 -21 690 0Q690 21 672 21H436Z" fill="url(#lac)"/>` +
        `<path d="M436 -22H462V22H436Z" fill="url(#sil)"/>` +
        `<path d="M444 -22V22M452 -22V22" stroke="#6f7884" stroke-width="1"/>` +
        `<g stroke="#e4ecf7" opacity=".95">${flake(560, 0, 17, 2.2)}</g>` +
        `<g stroke="#c4d2e6" opacity=".6">${flake(512, -9, 7, 1.4)}${flake(606, 10, 6, 1.3)}${flake(640, -10, 5, 1.2)}</g>` +
        `<path d="M486 -25H680Q690 -25 690 -17V-12H496Z" fill="url(#sil)"/></g>` +
        `</g>` +
        // satin ribbon
        `<path d="M560 930C640 820 740 900 930 740" fill="none" stroke="#000" stroke-width="44" opacity=".2" filter="url(#bl)" transform="translate(6 12)"/>` +
        `<path d="M560 930C640 820 740 900 930 740" fill="none" stroke="#9e1f2a" stroke-width="54"/>` +
        `<path d="M566 916C644 812 744 890 930 728" fill="none" stroke="#d9545c" stroke-width="8" opacity=".75"/>` +
        `<path d="M556 944C636 834 736 914 930 756" fill="none" stroke="#6e1018" stroke-width="5" opacity=".6"/>` +
        `<rect width="900" height="900" fill="url(#vg)"/>`
      );
    },
  });

  // ---- Carbon fishing rod + spinning reel (flat lay) ---------------------------------------
  def('mk_rod', {
    title: 'Carbon fishing rod and reel',
    w: 900, h: 900, tags: ['market', 'product', 'fishing'],
    svg: (w, h) => {
      const G = [[492, 16], [590, 12.5], [690, 10], [780, 8.5], [860, 7], [930, 6], [990, 5], [1040, 4.4]];
      const half = (x) => 6.5 - ((x - 368) / (1080 - 368)) * 5.2;
      let guides = '', line = 'M312 96';
      for (const [x, r] of G) {
        const t = half(x), cy = f(t + r * 1.9);
        guides +=
          `<rect x="${f(x - r * 2.2)}" y="${f(-t - 0.5)}" width="${f(r * 2.8)}" height="${f(t * 2 + 1)}" fill="#1d5fa8"/>` +
          `<path d="M${f(x - r * 1.9)} ${f(t)}L${f(x - r * 0.3)} ${f(cy + r * 0.7)}M${f(x + r * 0.2)} ${f(t)}L${f(x)} ${f(cy - r)}" stroke="#aab4bf" stroke-width="2"/>` +
          `<ellipse cx="${x}" cy="${cy}" rx="${f(r * 0.38)}" ry="${r}" fill="none" stroke="#d7dde4" stroke-width="2.4"/>` +
          `<ellipse cx="${x}" cy="${cy}" rx="${f(r * 0.22)}" ry="${f(r * 0.7)}" fill="none" stroke="#2b2f36" stroke-width="1.6"/>`;
        line += `L${x} ${cy}`;
      }
      line += 'L1082 0';
      seed(3);
      let cork = '';
      for (let i = 0; i < 90; i++) {
        const x = rr(22, 360), y = rr(-12, 12);
        if (x > 206 && x < 304) continue;
        cork += `M${f(x)} ${f(y)}h${f(rr(1.5, 4))}`;
      }
      const body =
        // butt + rear grip
        `<path d="M18 -15H8Q0 -15 0 0Q0 15 8 15H18Z" fill="#1c1f24"/>` +
        `<path d="M18 -15C80 -16 150 -14 210 -12V12C150 14 80 16 18 15Z" fill="url(#crk)"/>` +
        // reel seat
        `<path d="M206 -12H300V12H206Z" fill="url(#seat)"/>` +
        `<path d="M268 -13H300V13H268Z" fill="url(#seat2)"/><path d="M272 -13V13M277 -13V13M282 -13V13M287 -13V13M292 -13V13M297 -13V13" stroke="#123d73" stroke-width="1.4"/>` +
        `<path d="M206 -13H218V13H206Z" fill="url(#chr)"/>` +
        // fore grip
        `<path d="M300 -11C320 -11 340 -10 362 -9V9C340 10 320 11 300 11Z" fill="url(#crk)"/>` +
        `<path d="${cork}" stroke="#7a5532" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>` +
        `<path d="M362 -9.5H372V9.5H362Z" fill="url(#chr)"/>` +
        // blank
        `<path d="M372 -6.5L1080 -1.3V1.3L372 6.5Z" fill="url(#cw)"/>` +
        `<path d="M372 -6.5L1080 -1.3V1.3L372 6.5Z" fill="url(#bk)"/>` +
        `<text x="382" y="2.4" font-family="${FONT}" font-size="6.5" font-weight="700" fill="#e7c46a" letter-spacing="1">HYDRO·CARBON</text>` +
        guides +
        `<path d="${line}" fill="none" stroke="#5fe0f0" stroke-width="1.2" opacity=".9"/>` +
        `<circle cx="1082" cy="0" r="3" fill="none" stroke="#d7dde4" stroke-width="1.6"/>` +
        // spinning reel (hangs below the seat)
        `<path d="M226 11H286L280 18H232Z" fill="#2a2f37"/>` +
        `<path d="M246 18H266L272 60H246Z" fill="url(#gun)"/>` +
        `<path d="M216 96C216 66 236 54 262 54C292 54 304 70 304 96C304 126 286 140 260 140C232 140 216 124 216 96Z" fill="url(#gun2)"/>` +
        `<path d="M226 96C226 74 242 64 262 64" fill="none" stroke="#9aa6b4" stroke-width="2" opacity=".6"/>` +
        `<circle cx="258" cy="98" r="15" fill="#1d5fa8"/><circle cx="258" cy="98" r="7" fill="#c9d3de"/>` +
        `<path d="M258 98L214 152" stroke="url(#chr)" stroke-width="7" stroke-linecap="round"/>` +
        `<ellipse cx="208" cy="160" rx="11" ry="17" transform="rotate(38 208 160)" fill="#1c1f24"/><ellipse cx="204" cy="155" rx="3" ry="7" transform="rotate(38 204 155)" fill="#5a6270"/>` +
        `<path d="M300 66H312V128H300Z" fill="url(#gun)"/>` +
        `<path d="M312 74H356V120H312Z" fill="url(#spl)"/>` +
        `<path d="M314 80H354M314 88H354M314 96H354M314 104H354M314 112H354" stroke="#2c9fb8" stroke-width="1.2" opacity=".7"/>` +
        `<ellipse cx="356" cy="97" rx="9" ry="25" fill="url(#chr)"/><ellipse cx="358" cy="97" rx="4" ry="10" fill="#1d5fa8"/>` +
        `<path d="M304 64C362 50 380 136 306 130" fill="none" stroke="#e1e6ec" stroke-width="3.5" stroke-linecap="round"/>` +
        '';
      return svg(w, h,
        lg('bg', [[0, '#f4f5f6'], [1, '#d9dde2']], 0, 0, 1, 1) +
        rg('kl', [[0, '#fff', 0.7], [1, '#fff', 0]], 0.2, 0.15, 0.7) +
        rg('vg', [[0.6, '#000', 0], [1, '#000', 0.14]], 0.5, 0.5, 0.75) +
        lg('crk', [[0, '#a87e52'], [0.3, '#e9cfa6'], [0.6, '#cfa774'], [1, '#8a6038']]) +
        lg('seat', [[0, '#9fd6fa'], [0.35, '#3aa0e6'], [1, '#174d8c']]) +
        lg('seat2', [[0, '#6ab6ee'], [0.4, '#2a82cc'], [1, '#123d73']]) +
        lg('chr', [[0, '#6b7480'], [0.35, '#f2f5f8'], [1, '#59626e']]) +
        lg('bk', [[0, '#fff', 0], [0.25, '#fff', 0.35], [0.5, '#fff', 0], [1, '#000', 0.4]]) +
        lg('gun', [[0, '#3a414b'], [0.4, '#7c8794'], [1, '#22272e']], 0, 0, 1, 0) +
        rg('gun2', [[0, '#6c7682'], [0.6, '#2c323a'], [1, '#16191e']], 0.4, 0.35, 0.7) +
        lg('spl', [[0, '#7de3f0'], [0.4, '#c9f6fb'], [1, '#2b98b5']]) +
        `<pattern id="cw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#1d2025"/><path d="M0 0h3v3H0zM3 3h3v3H3z" fill="#3a3f48"/></pattern>` +
        blur('bl', 6),
        `<rect width="900" height="900" fill="url(#bg)"/><rect width="900" height="900" fill="url(#kl)"/>` +
        `<path d="M0 0" />` +
        `<g transform="translate(108 828) rotate(-40.5)">` +
        `<g transform="translate(9 20)" opacity=".28" filter="url(#bl)"><path d="M0 -14H210V12H300V-10L1080 -1V1L362 9H300V12H206L216 96C216 130 240 140 262 140C290 140 304 126 304 112H356V74H300V12H210V15H0Z" fill="#000"/></g>` +
        body + `</g>` +
        `<rect width="900" height="900" fill="url(#vg)"/>`
      );
    },
  });

  // ---- Antique bamboo birdcage (lifestyle) -------------------------------------------------
  def('mk_birdcage', {
    title: 'Antique bamboo birdcage',
    w: 900, h: 900, tags: ['market', 'product', 'birds', 'zl'],
    svg: (w, h) => {
      const CX = 450, R = 172, RY = 34, TOP = 300, BOT = 690, AP = 168, N = 22;
      let back = '', front = '';
      for (let i = 0; i < N; i++) {
        const t = ((i + 0.5) / N) * Math.PI * 2;
        const x = f(CX + R * Math.cos(t)), s = Math.sin(t);
        const yt = f(TOP + RY * s), yb = f(BOT + RY * s);
        const dome = `M${x} ${yt}C${x} ${f(yt - 92)} ${f(CX + (x - CX) * 0.42)} ${AP + 4} ${CX} ${AP}`;
        if (s < 0) {
          back += `<path d="M${x} ${yt}V${yb}${dome.replace('M' + x + ' ' + yt, '')}" stroke="#9b7444" stroke-width="5" fill="none" opacity=".55"/>`;
        } else {
          const nodes = [420, 560].map((y) => `M${x - 4} ${f(y + RY * s)}h8`).join('');
          front +=
            `<path d="M${x} ${yt}V${yb}${dome.replace('M' + x + ' ' + yt, '')}" stroke="#c99a5a" stroke-width="7" fill="none"/>` +
            `<path d="M${f(x - 1.6)} ${yt + 6}V${yb - 4}" stroke="#f3d7a2" stroke-width="1.6" opacity=".8"/>` +
            `<path d="${nodes}" stroke="#7d5428" stroke-width="2.5"/>`;
        }
      }
      const ringB = (y, wd, c) => `<path d="M${CX - R} ${y}A${R} ${RY} 0 0 1 ${CX + R} ${y}" fill="none" stroke="${c}" stroke-width="${wd}"/>`;
      const ringF = (y, wd, c) => `<path d="M${CX - R} ${y}A${R} ${RY} 0 0 0 ${CX + R} ${y}" fill="none" stroke="${c}" stroke-width="${wd}"/>`;
      const cupP = (x, y) =>
        `<path d="M${x - 16} ${y}V${y + 22}Q${x} ${y + 30} ${x + 16} ${y + 22}V${y}Z" fill="#f4f6fa"/><path d="M${x - 16} ${y + 8}Q${x} ${y + 14} ${x + 16} ${y + 8}V${y + 14}Q${x} ${y + 20} ${x - 16} ${y + 14}Z" fill="#2f5fa8"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="16" ry="5" fill="#dfe6f0" stroke="#2f5fa8" stroke-width="1.5"/>`;
      let lattice = '';
      for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) lattice += `M${f(560 + i * 64 + j * 18)} ${f(40 + j * 92)}h52l18 80h-52Z`;
      return svg(w, h,
        lg('wl', [[0, '#efe2cc'], [1, '#d9c4a2']]) +
        lg('tb', [[0, '#5a3820'], [1, '#2e1b0f']]) +
        lg('dr', [[0, '#4a2c16'], [0.35, '#8a5a32'], [0.6, '#6a4222'], [1, '#2e1a0c']], 0, 0, 1, 0) +
        rg('fl', [[0, '#9a6c3c'], [1, '#6a4524']]) +
        rg('kl', [[0, '#fff3d6', 0.6], [1, '#fff3d6', 0]], 0.75, 0.25, 0.6) +
        rg('vg', [[0.55, '#000', 0], [1, '#000', 0.3]], 0.5, 0.45, 0.75) +
        rg('sh', [[0, '#000', 0.6], [0.5, '#000', 0.3], [1, '#000', 0]]) +
        lg('brs', [[0, '#f3d27e'], [1, '#a5741e']], 0, 0, 1, 1) +
        blur('bl', 10),
        `<rect width="900" height="700" fill="url(#wl)"/><rect width="900" height="900" fill="url(#kl)"/>` +
        `<path d="${lattice}" fill="#fff8e6" opacity=".35" filter="url(#bl)"/>` +
        `<rect y="680" width="900" height="220" fill="url(#tb)"/><path d="M0 680H900" stroke="#7a5232" stroke-width="3"/>` +
        `<path d="M0 760Q450 748 900 768M0 840Q450 826 900 846" stroke="#6a4428" stroke-width="2" opacity=".6" fill="none"/>` +
        shadow(462, 760, 250, 30) +
        // hook + finial
        `<path d="M450 140V104C450 72 488 70 488 98" fill="none" stroke="url(#brs)" stroke-width="7" stroke-linecap="round"/>` +
        `<circle cx="450" cy="134" r="9" fill="none" stroke="url(#brs)" stroke-width="5"/>` +
        // cage floor + back
        `<ellipse cx="${CX}" cy="${BOT}" rx="${R}" ry="${RY}" fill="url(#fl)"/>` +
        ringB(TOP, 6, '#a07a48') + ringB(430, 4, '#a07a48') + ringB(620, 4, '#a07a48') + back +
        // interior: perch + porcelain cups
        `<path d="M300 604L604 566" stroke="#b88a4e" stroke-width="9" stroke-linecap="round"/><path d="M300 601L604 563" stroke="#efd29a" stroke-width="2" opacity=".7"/>` +
        cupP(330, 640) + cupP(578, 628) +
        front +
        ringF(TOP, 8, '#b5874a') + ringF(430, 5, '#b5874a') + ringF(620, 5, '#b5874a') +
        `<ellipse cx="${CX}" cy="${TOP}" rx="${R}" ry="${RY}" fill="none" stroke="#e8c58a" stroke-width="2" opacity=".6"/>` +
        `<ellipse cx="450" cy="170" rx="34" ry="11" fill="#8a5a32"/><path d="M432 168Q434 140 450 138Q466 140 468 168Z" fill="url(#dr)"/><circle cx="450" cy="136" r="7" fill="url(#brs)"/>` +
        // base drum
        `<path d="M${CX - R - 8} ${BOT}A${R + 8} ${RY + 2} 0 0 0 ${CX + R + 8} ${BOT}V${BOT + 54}A${R + 8} ${RY + 2} 0 0 1 ${CX - R - 8} ${BOT + 54}Z" fill="url(#dr)"/>` +
        `<path d="M${CX - R - 8} ${BOT}A${R + 8} ${RY + 2} 0 0 0 ${CX + R + 8} ${BOT}" fill="none" stroke="#c99a5a" stroke-width="4"/>` +
        [340, 410, 490, 560].map((x) => `<rect x="${x - 22}" y="${BOT + 30}" width="44" height="26" rx="5" fill="none" stroke="#c08a52" stroke-width="2" opacity=".75"/>`).join('') +
        // red silk tassel
        `<path d="M548 ${BOT + 52}V${BOT + 74}" stroke="#a51f2a" stroke-width="3"/><circle cx="548" cy="${BOT + 76}" r="7" fill="#c8323c"/>` +
        `<path d="M541 ${BOT + 80}L536 ${BOT + 130}H560L555 ${BOT + 80}Z" fill="#c8323c"/><path d="M542 ${BOT + 96}V${BOT + 128}M548 ${BOT + 96}V${BOT + 130}M554 ${BOT + 96}V${BOT + 128}" stroke="#8e1822" stroke-width="1.5"/>` +
        `<rect width="900" height="900" fill="url(#vg)"/>`
      );
    },
  });

  // ---- Liyue tea tin -----------------------------------------------------------------------
  def('mk_tea_tin', {
    title: 'Premium Liyue tea tin',
    w: 900, h: 900, tags: ['market', 'product', 'tea'],
    svg: (w, h) => {
      const st = studio('#eff1e7', '#dcdfcf', '#ebece2', 660);
      seed(11);
      let leaves = '', dish = '';
      for (let i = 0; i < 34; i++) {
        const a = rr(0, Math.PI * 2), d = Math.sqrt(rnd()), x = 700 + Math.cos(a) * d * 76, y = 800 + Math.sin(a) * d * 17 - (1 - d) * 8, r = rr(7, 10);
        dish += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.7)}" transform="rotate(${f(rr(0, 180))} ${f(x)} ${f(y)})" fill="${rnd() > 0.5 ? '#3b5a2c' : '#2b4320'}"/>`;
      }
      for (let i = 0; i < 26; i++) {
        const x = i < 18 ? rr(160, 340) : rr(560, 820), y = i < 18 ? rr(770, 845) : rr(850, 876), r = rr(6, 11);
        leaves += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.72)}" transform="rotate(${f(rr(0, 180))} ${f(x)} ${f(y)})" fill="${rnd() > 0.5 ? '#3b5a2c' : '#2b4320'}"/><ellipse cx="${f(x - 2)}" cy="${f(y - 2)}" rx="${f(r * 0.4)}" ry="${f(r * 0.22)}" fill="#8aa868" opacity=".5"/>`;
      }
      const peaks = (pts, base, c) => {
        let d = `M300 ${base}`;
        for (const [x, y, wd] of pts) d += `L${x - wd} ${base}C${x - wd} ${y + 20} ${x - wd * 0.6} ${y} ${x} ${y}C${x + wd * 0.6} ${y} ${x + wd} ${y + 20} ${x + wd} ${base}`;
        return `<path d="${d}L600 ${base}V700H300Z" fill="${c}"/>`;
      };
      return svg(w, h,
        st.defs +
        lg('tn', [[0, '#082624'], [0.16, '#1f6a63'], [0.3, '#5fb3a3'], [0.42, '#237167'], [0.8, '#0f4440'], [1, '#061d1b']], 0, 0, 1, 0) +
        lg('gd', [[0, '#5e420f'], [0.18, '#c99a3e'], [0.32, '#f8e6a8'], [0.48, '#c4923a'], [0.85, '#8a6420'], [1, '#4a330b']], 0, 0, 1, 0) +
        rg('gt', [[0, '#f6e2a4'], [0.7, '#cf9f45'], [1, '#9b7022']], 0.4, 0.4, 0.7) +
        lg('lb', [[0, '#c3b391'], [0.22, '#f1e6cc'], [0.45, '#fbf4e2'], [0.78, '#e6d8ba'], [1, '#b6a482']], 0, 0, 1, 0) +
        lg('mist', [[0, '#fbf4e2', 0], [1, '#fbf4e2', 0.95]]) +
        lg('sc', [[0, '#c9a46a'], [1, '#8f6a36']]) +
        `<clipPath id="lc"><path d="M302 392A165 30 0 0 0 598 392V702A165 30 0 0 1 302 702Z"/></clipPath>`,
        st.back +
        shadow(468, 748, 230, 34) +
        // body
        `<path d="M285 330V740A165 30 0 0 0 615 740V330Z" fill="url(#tn)"/>` +
        // label
        `<g clip-path="url(#lc)"><rect x="300" y="360" width="300" height="360" fill="url(#lb)"/>` +
        `<circle cx="552" cy="540" r="20" fill="#c8323c" opacity=".85"/>` +
        peaks([[340, 520, 26], [392, 500, 22], [470, 530, 30], [560, 506, 24]], 640, '#a9c2b9') +
        `<rect x="300" y="560" width="300" height="90" fill="url(#mist)"/>` +
        peaks([[322, 560, 22], [368, 540, 20], [428, 576, 28], [500, 552, 22], [580, 568, 26]], 660, '#5e8b82') +
        `<rect x="300" y="610" width="300" height="60" fill="url(#mist)"/>` +
        peaks([[350, 610, 30], [450, 626, 40], [560, 600, 30]], 700, '#2c5953') +
        `<rect x="300" y="384" width="300" height="2" fill="#b8913e"/><rect x="300" y="690" width="300" height="2" fill="#b8913e"/>` +
        T(450, 424, 'LIYUE', 14, { w: 700, fill: '#a07a2c', ls: 7 }) +
        T(450, 474, 'JUEYUN', 46, { serif: 1, w: 700, fill: '#173f3b', ls: 2 }) +
        `<path d="M372 488H528" stroke="#b8913e" stroke-width="1.5"/>` +
        T(450, 506, 'PREMIUM OOLONG', 12, { w: 600, fill: '#5c6f68', ls: 4 }) +
        `<rect x="556" y="404" width="24" height="24" rx="3" fill="#c8323c"/>` +
        `<text x="568" y="422" font-family="${SERIF}" font-size="17" fill="#fbf4e2" text-anchor="middle">茶</text>` +
        T(450, 682, '100 g · HIGH MOUNTAIN', 11, { w: 600, fill: '#e9f0ec', ls: 2.5 }) +
        `<rect x="348" y="360" width="24" height="360" fill="#fff" opacity=".22"/></g>` +
        `<path d="M302 392A165 30 0 0 0 598 392M302 702A165 30 0 0 0 598 702" fill="none" stroke="#b8913e" stroke-width="2"/>` +
        // lid
        `<path d="M280 258V330A170 31 0 0 0 620 330V258Z" fill="url(#gd)"/>` +
        `<path d="M280 318A170 31 0 0 0 620 318" fill="none" stroke="#7a5714" stroke-width="2" opacity=".6"/>` +
        `<path d="M285 336A165 30 0 0 0 615 336" fill="none" stroke="#04110f" stroke-width="5" opacity=".6"/>` +
        `<ellipse cx="450" cy="258" rx="170" ry="31" fill="url(#gt)"/>` +
        `<ellipse cx="450" cy="258" rx="140" ry="24" fill="none" stroke="#a87c26" stroke-width="2"/><ellipse cx="450" cy="258" rx="134" ry="22" fill="none" stroke="#fff3c9" stroke-width="1.5" opacity=".7"/>` +
        `<rect x="336" y="258" width="18" height="72" fill="#fff" opacity=".28"/>` +
        // scoop + leaves
        shadow(704, 826, 120, 20) +
        `<path d="M594 800Q600 842 700 846Q800 842 806 800Z" fill="url(#sc)"/>` +
        `<ellipse cx="700" cy="800" rx="106" ry="30" fill="#b48a52"/><ellipse cx="700" cy="802" rx="92" ry="23" fill="#7a5530"/>` +
        dish +
        leaves +
        st.front
      );
    },
  });

  // ---- Power bank (white) ------------------------------------------------------------------
  def('mk_charger', {
    title: 'Power bank 20,000 mAh, white',
    w: 900, h: 900, tags: ['market', 'product', 'tech'],
    svg: (w, h) => {
      const st = studio('#e6edf5', '#cdd8e5', '#e3e9f1', 640);
      let ext = '';
      for (let i = 10; i >= 1; i--) {
        const k = i / 10;
        const c = Math.round(196 + (1 - k) * 22);
        ext += `<rect x="${f(318 + 30 * k)}" y="${f(172 - 34 * k)}" width="264" height="516" rx="48" fill="rgb(${c},${c + 5},${c + 12})"/>`;
      }
      const port = (x, wd) => `<g transform="matrix(1 0 -.88 1 ${x} 172)"><rect x="0" y="-26" width="${wd}" height="11" rx="5" fill="#2b3038"/><rect x="${wd * 0.2}" y="-22.5" width="${wd * 0.6}" height="4" rx="2" fill="#8d96a3"/></g>`;
      return svg(w, h,
        st.defs +
        rg('fc', [[0, '#ffffff'], [0.55, '#f3f5f8'], [1, '#dde2e9']], 0.3, 0.2, 0.9) +
        lg('rf', [[0, '#fff', 0.55], [1, '#fff', 0]]) +
        lg('cb', [[0, '#ffffff'], [1, '#e2e7ee']]) +
        rg('led', [[0, '#bfe6ff'], [0.4, '#3aa0e6'], [1, '#3aa0e6', 0]]),
        st.back +
        shadow(470, 692, 210, 22) +
        `<path d="M366 692H534Q582 692 582 740V830H318V740Q318 692 366 692Z" fill="url(#rf)" opacity=".7"/>` +
        ext +
        `<rect x="318" y="172" width="264" height="516" rx="48" fill="url(#fc)"/>` +
        `<rect x="321" y="175" width="258" height="510" rx="45" fill="none" stroke="#fff" stroke-width="3"/>` +
        `<rect x="318" y="172" width="264" height="516" rx="48" fill="none" stroke="#c8cfd9" stroke-width="1.5"/>` +
        port(398, 40) + port(470, 50) +
        // side button
        `<rect x="${600}" y="300" width="7" height="40" rx="3.5" transform="skewY(-48)" transform-origin="603 320" fill="#cfd6df"/>` +
        // logo + LEDs
        `<path d="M462 362L432 418H456L444 466L484 402H458L472 362Z" fill="none" stroke="#c9d0da" stroke-width="3" stroke-linejoin="round"/>` +
        T(450, 586, '20 000 mAh', 16, { w: 500, fill: '#9aa3ae', ls: 3 }) +
        [405, 435, 465, 495].map((x, i) => i < 3 ? `<circle cx="${x}" cy="628" r="14" fill="url(#led)"/><circle cx="${x}" cy="628" r="4.5" fill="#e6f5ff"/>` : `<circle cx="${x}" cy="628" r="4.5" fill="#cfd6df"/>`).join('') +
        // cable: plug in the top port, arcing down to a coil on the floor
        `<path d="M504 98L506 74H520L522 98Z" fill="#e3e8ef"/><rect x="497" y="94" width="32" height="58" rx="9" fill="url(#cb)" stroke="#c4ccd7" stroke-width="1.5"/><path d="M503 104V144" stroke="#fff" stroke-width="3" opacity=".9"/>` +
        `<path d="M513 76C513 6 700 0 720 160C736 300 690 560 700 700C706 780 800 800 820 760C840 720 760 700 700 730C640 760 680 830 760 836C830 840 860 800 840 780" fill="none" stroke="#c9d1dc" stroke-width="15" stroke-linecap="round"/>` +
        `<path d="M513 76C513 6 700 0 720 160C736 300 690 560 700 700C706 780 800 800 820 760C840 720 760 700 700 730C640 760 680 830 760 836C830 840 860 800 840 780" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" transform="translate(-3 -3)"/>` +
        st.front
      );
    },
  });

  // ---- Red knitted scarf (flat lay on pale wood) -------------------------------------------
  def('mk_scarf', {
    title: 'Red knitted scarf',
    w: 900, h: 900, tags: ['market', 'product', 'scarf'],
    svg: (w, h) => {
      let planks = '';
      for (let i = 1; i < 6; i++) planks += `M${i * 160 - 20} 0V900`;
      let fringe = '';
      for (let i = 0; i < 15; i++) {
        const x = -126 + i * 18;
        fringe += `M${x} 268q${(i % 3) - 1} 34 ${(i % 4) - 2} 66`;
      }
      // soft, slightly wavy knitted layer with garter-stitch borders
      const lay = (x, y, wd, ht, r = 30) =>
        `M${x + r} ${y}Q${x + wd / 2} ${y - 7} ${x + wd - r} ${y}Q${x + wd} ${y} ${x + wd} ${y + r}Q${x + wd + 6} ${y + ht / 2} ${x + wd} ${y + ht - r}Q${x + wd} ${y + ht} ${x + wd - r} ${y + ht}` +
        `Q${x + wd / 2} ${y + ht + 7} ${x + r} ${y + ht}Q${x} ${y + ht} ${x} ${y + ht - r}Q${x - 6} ${y + ht / 2} ${x} ${y + r}Q${x} ${y} ${x + r} ${y}Z`;
      const band = (x, y, wd, ht, k, r = 30) => {
        const d = lay(x, y, wd, ht, r);
        return `<path d="${d}" fill="url(#rd)"/><path d="${d}" fill="url(#kn)"/>` +
          `<rect x="${x + 3}" y="${y + 12}" width="20" height="${ht - 24}" fill="url(#gt)"/><rect x="${x + wd - 23}" y="${y + 12}" width="20" height="${ht - 24}" fill="url(#gt)"/>` +
          `<path d="${d}" fill="url(#roll)"/>` + (k ? `<path d="${d}" fill="#2a0508" opacity="${k}"/>` : '');
      };
      let pine = '';
      for (let x = 12; x < 250; x += 8) {
        const L = 20 + (x % 3) * 3 - (x > 200 ? (x - 200) * 0.25 : 0);
        pine += `M${x} 0l${f(L * 0.55)} ${f(-L)}M${x} 0l${f(L * 0.55)} ${f(L)}`;
      }
      return svg(w, h,
        lg('wd', [[0, '#f1e8dc'], [1, '#dfd1bd']], 0, 0, 1, 1) +
        rg('kl', [[0, '#fff', 0.55], [1, '#fff', 0]], 0.25, 0.2, 0.7) +
        rg('vg', [[0.6, '#000', 0], [1, '#000', 0.16]], 0.5, 0.5, 0.75) +
        lg('rd', [[0, '#801920'], [0.12, '#c0303a'], [0.5, '#d8434b'], [0.88, '#bd2d36'], [1, '#78161c']], 0, 0, 1, 0) +
        lg('roll', [[0, '#3a0508', 0.5], [0.05, '#fff', 0.22], [0.12, '#fff', 0], [0.88, '#000', 0], [0.95, '#000', 0.14], [1, '#3a0508', 0.45]]) +
        `<pattern id="kn" width="13" height="11" patternUnits="userSpaceOnUse" patternTransform="scale(1.6)">` +
        `<ellipse cx="3.9" cy="5.5" rx="2.9" ry="6" transform="rotate(-30 3.9 5.5)" fill="#fff" fill-opacity=".13" stroke="#3a0508" stroke-opacity=".32" stroke-width="1.1"/>` +
        `<ellipse cx="9.1" cy="5.5" rx="2.9" ry="6" transform="rotate(30 9.1 5.5)" fill="#fff" fill-opacity=".13" stroke="#3a0508" stroke-opacity=".32" stroke-width="1.1"/></pattern>` +
        `<pattern id="gt" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 2H10" stroke="#5a0c12" stroke-opacity=".35" stroke-width="2.6"/><path d="M0 5H10" stroke="#fff" stroke-opacity=".14" stroke-width="2"/></pattern>` +
        blur('bl', 12),
        `<rect width="900" height="900" fill="url(#wd)"/><path d="${planks}" stroke="#c9b79e" stroke-width="2" opacity=".6"/>` +
        `<path d="M40 120Q60 300 30 520M300 60Q320 200 290 380M620 140Q640 380 600 560M780 420Q800 620 770 860" stroke="#d8c8b0" stroke-width="1.5" fill="none" opacity=".7"/>` +
        `<rect width="900" height="900" fill="url(#kl)"/>` +
        // fir sprig with berries
        `<g transform="translate(676 168) rotate(-30)"><path d="M0 0H262" stroke="#6b4a2e" stroke-width="4.5"/>` +
        `<path d="${pine}" stroke="#2f5a3c" stroke-width="3.4" stroke-linecap="round"/><path d="${pine}" stroke="#5f9468" stroke-width="1.2" stroke-linecap="round" transform="translate(1 -1)"/></g>` +
        `<circle cx="694" cy="196" r="12" fill="#b8202b"/><circle cx="716" cy="208" r="11" fill="#c8323c"/><circle cx="690" cy="220" r="10" fill="#a51b26"/><circle cx="690" cy="191" r="3.5" fill="#fff" opacity=".6"/><circle cx="712" cy="203" r="3" fill="#fff" opacity=".5"/>` +
        // shadow
        `<path d="M300 190H624V560L700 800L480 850L380 560H300Z" fill="#3a2410" opacity=".3" filter="url(#bl)" transform="translate(14 18)"/>` +
        `<g transform="rotate(-5 460 380)">` +
        // tail end (under the stack)
        `<g transform="translate(470 520) rotate(-17)">` + band(-136, -80, 272, 348, 0, 6) +
        `<rect x="-130" y="248" width="260" height="20" fill="#000" opacity=".1"/>` +
        `<path d="${fringe}" stroke="#a82630" stroke-width="9" stroke-linecap="round" fill="none"/><path d="${fringe}" stroke="#e8666c" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".55" transform="translate(-2 0)"/></g>` +
        // folded stack
        band(312, 206, 320, 360, 0.3) + band(306, 193, 320, 360, 0.15) + band(300, 180, 320, 360, 0) +
        // woven label
        `<rect x="514" y="504" width="92" height="34" rx="3" fill="#f7f2e8"/><rect x="518" y="508" width="84" height="26" fill="none" stroke="#c8323c" stroke-width="1"/>` +
        T(560, 519, 'HAND KNIT', 9.5, { w: 800, fill: '#7e171d', ls: 1.5 }) + T(560, 530, '100% WOOL', 8, { w: 600, fill: '#7e171d', ls: 1.2 }) +
        `</g>` +
        `<rect width="900" height="900" fill="url(#vg)"/>`
      );
    },
  });
})();
