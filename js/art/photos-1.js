/* Photos 1 — the camera roll on Childe's phone: tonight, Zhongli, Liyue. 1200×900 unless noted. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- kit ---------- */
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const r0 = Math.round;
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
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  // one light grain per image, blended over everything
  const grainDef = (fr = 0.9) =>
    `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const grain = (w, h, op = 0.1) => `<rect width="${w}" height="${h}" filter="url(#gr)" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  const vigDef = (a = 0.55, inner = 0.55) => rg('vg', [[inner, '#000', 0], [1, '#000', a]], 0.5, 0.5, 0.75);
  const vig = (w, h) => `<rect width="${w}" height="${h}" fill="url(#vg)"/>`;
  const glowDef = (id, c, a = 0.9) => rg(id, [[0, c, a], [0.35, c, a * 0.38], [1, c, 0]]);
  const bokehDef = (id, c) => rg(id, [[0, c, 0.55], [0.8, c, 0.5], [0.92, c, 0.3], [1, c, 0]]);
  const disc = (x, y, r, fill, op = 1) => `<circle cx="${r0(x)}" cy="${r0(y)}" r="${r0(r)}" fill="${fill}"${op !== 1 ? ` opacity="${op}"` : ''}/>`;
  const ell = (x, y, rx, ry, fill, ex = '') => `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(rx)}" ry="${r0(ry)}" fill="${fill}"${ex}/>`;
  const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}"${ex}/>`;
  const S = (d, c, w, ex = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${ex.includes('linecap') ? '' : ' stroke-linecap="round" stroke-linejoin="round"'}${ex}/>`;
  const T = (x, y, s, size, fill, ex = '') => `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" fill="${fill}"${ex}>${s}</text>`;
  // camera tilt: rotate + overscale so no corner shows
  const tilt = (deg, s, body, cx = 600, cy = 450) => `<g transform="translate(${cx} ${cy}) rotate(${deg}) scale(${s}) translate(${-cx} ${-cy})">${body}</g>`;
  // Liyue curved roof: eave line at y, ridge at y-h, width w, upturned corners
  const roof = (cx, y, w, h, fill, edge) => {
    const a = w / 2;
    return P(`M${r0(cx - a - w * 0.06)} ${r0(y - h * 0.32)}Q${r0(cx - a * 0.7)} ${r0(y + h * 0.05)} ${r0(cx - a * 0.3)} ${r0(y - h * 0.55)}L${r0(cx - a * 0.18)} ${r0(y - h)}H${r0(cx + a * 0.18)}L${r0(cx + a * 0.3)} ${r0(y - h * 0.55)}Q${r0(cx + a * 0.7)} ${r0(y + h * 0.05)} ${r0(cx + a + w * 0.06)} ${r0(y - h * 0.32)}Q${r0(cx + a * 0.6)} ${r0(y - h * 0.12)} ${r0(cx)} ${r0(y - h * 0.18)}Q${r0(cx - a * 0.6)} ${r0(y - h * 0.12)} ${r0(cx - a - w * 0.06)} ${r0(y - h * 0.32)}Z`, fill) +
      (edge ? S(`M${r0(cx - a - w * 0.06)} ${r0(y - h * 0.32)}Q${r0(cx - a * 0.7)} ${r0(y + h * 0.05)} ${r0(cx - a * 0.3)} ${r0(y - h * 0.55)}M${r0(cx + a + w * 0.06)} ${r0(y - h * 0.32)}Q${r0(cx + a * 0.7)} ${r0(y + h * 0.05)} ${r0(cx + a * 0.3)} ${r0(y - h * 0.55)}`, edge, Math.max(1.5, h * 0.06)) : '');
  };
  // simple Liyue roof with a straighter profile (main halls): eave y, width, height
  const hall = (cx, y, w, h, fill, edge) => {
    const a = w / 2;
    return P(`M${r0(cx - a)} ${r0(y - h * 0.15)}Q${r0(cx - a * 0.55)} ${r0(y)} ${r0(cx - a * 0.42)} ${r0(y - h * 0.62)}L${r0(cx - a * 0.3)} ${r0(y - h)}H${r0(cx + a * 0.3)}L${r0(cx + a * 0.42)} ${r0(y - h * 0.62)}Q${r0(cx + a * 0.55)} ${r0(y)} ${r0(cx + a)} ${r0(y - h * 0.15)}Q${r0(cx)} ${r0(y - h * 0.2)} ${r0(cx - a)} ${r0(y - h * 0.15)}Z`, fill) +
      (edge ? S(`M${r0(cx - a)} ${r0(y - h * 0.15)}Q${r0(cx)} ${r0(y - h * 0.2)} ${r0(cx + a)} ${r0(y - h * 0.15)}`, edge, Math.max(1.5, h * 0.07)) : '');
  };

  /* ---------- Zhongli (shared look) ---------- */
  const ZL = {
    sk: ['#fcebdf', '#f4d8c4', '#e4b99e', '#c4917a'],
    hair: '#3a2519', hairD: '#21140d', hairL: '#6b4630', tip: '#cf9445', tipL: '#f1c873',
    eye: '#e8a838', eyeD: '#8f5312', liner: '#b4432c', lash: '#2b170e', lip: '#b56e62',
    coat: '#3d2b20', coatD: '#22170f', coatL: '#5c4231', trim: '#d8b05a', trimD: '#9a7432', glove: '#141010', inner: '#e9dcc4',
  };
  // sepia twin for the archive photo
  const ZS = {
    sk: ['#efe0c4', '#e2cba6', '#c9ad84', '#a68a63'],
    hair: '#3d2c1c', hairD: '#2a1e13', hairL: '#5e4630', tip: '#a58459', tipL: '#c8aa7c',
    eye: '#a07f52', eyeD: '#5a4128', liner: '#6e5032', lash: '#2a1e13', lip: '#8f7151',
    coat: '#3f2f20', coatD: '#2a1f15', coatL: '#5d4732', trim: '#bca077', trimD: '#7d6545', glove: '#21180f', inner: '#d9c6a3',
  };
  // gradients used by zlHead (ids are local to each SVG)
  const zlDefs = (Z) =>
    lg('zsk', [[0, Z.sk[0]], [0.6, Z.sk[1]], [1, Z.sk[2]]], 0.2, 0, 0.8, 1) +
    lg('zhr', [[0, Z.hairL], [0.35, Z.hair], [1, Z.hairD]], 0, 0, 0.4, 1) +
    lg('ztp', [[0, Z.hair], [0.55, Z.hair], [0.8, Z.tip], [1, Z.tipL]]) +
    rg('zir', [[0, Z.tipL], [0.55, Z.eye], [1, Z.eyeD]], 0.5, 0.62, 0.6);
  // Front head, face centre at 0,0, face half-width ~88. closed = sleeping eyes.
  const zlHead = (Z, closed) => {
    const eye = (s) => {
      const x = 40 * s, y = 6;
      if (closed) {
        return S(`M${x - 25 * s} ${y - 3}Q${x} ${y + 9} ${x + 26 * s} ${y - 4}`, Z.lash, 4.5) +
          S(`M${x + 14 * s} ${y + 1}Q${x + 26 * s} ${y - 4} ${x + 36 * s} ${y - 9}`, Z.liner, 6, ' opacity=".55"') +
          S(`M${x + 20 * s} ${y + 2}l${5 * s} 6M${x + 9 * s} ${y + 5}l${3 * s} 6`, Z.lash, 2.2);
      }
      return P(`M${x - 27 * s} ${y + 1}Q${x - 6 * s} ${y - 17} ${x + 25 * s} ${y - 5}Q${x + 12 * s} ${y + 15} ${x - 27 * s} ${y + 1}Z`, '#fffaf4') +
        `<circle cx="${x + 1 * s}" cy="${y + 1}" r="11.5" fill="url(#zir)"/>` +
        ell(x + 1 * s, y + 2, 4, 6, Z.eyeD) +
        P(`M${x - 11 * s} ${y - 5}Q${x + 1 * s} ${y - 13} ${x + 13 * s} ${y - 5}V${y - 1}Q${x + 1 * s} ${y - 8} ${x - 11 * s} ${y - 1}Z`, Z.eyeD, ' opacity=".6"') +
        disc(x + 5 * s, y - 3, 3.4, '#fff') + disc(x - 3 * s, y + 6, 1.6, '#fff', 0.8) +
        S(`M${x - 28 * s} ${y + 1}Q${x - 6 * s} ${y - 18} ${x + 26 * s} ${y - 6}`, Z.lash, 5) +
        S(`M${x + 12 * s} ${y - 9}Q${x + 26 * s} ${y - 8} ${x + 36 * s} ${y - 13}`, Z.liner, 6, ' opacity=".7"') +
        S(`M${x + 14 * s} ${y + 8}Q${x + 22 * s} ${y + 5} ${x + 27 * s} ${y - 2}`, Z.liner, 2.5, ' opacity=".7"');
    };
    return (
      // back hair mass (sides fall to the collar)
      P('M-106 -36C-122 -126 -60 -176 2 -176C66 -176 124 -126 108 -36C114 30 118 96 110 156L74 150L60 60H-60L-74 150L-112 156C-120 96 -116 30 -106 -36Z', 'url(#zhr)') +
      // neck + high collar
      P('M-34 92L-37 200H37L34 92Z', Z.sk[2]) + P('M-34 120Q0 146 34 120V140Q0 160 -34 140Z', Z.sk[3], ' opacity=".5"') +
      P('M-66 222L-60 132Q0 158 60 132L66 222Z', Z.coat) + S('M-60 132Q0 158 60 132', Z.trim, 5) +
      P('M-60 132L-30 222H-66Z', Z.coatD, ' opacity=".6"') + S('M0 150V222', Z.trimD, 3) +
      `<rect x="-8" y="164" width="16" height="16" rx="3" transform="rotate(45 0 172)" fill="${Z.tip}" stroke="${Z.trim}" stroke-width="2"/>` +
      // ears
      P('M-90 -4C-104 -12 -110 8 -106 26C-102 42 -94 46 -86 40Z', Z.sk[1]) + P('M90 -4C104 -12 110 8 106 26C102 42 94 46 86 40Z', Z.sk[2]) +
      // face
      P('M-90 -52C-92 10 -84 60 -62 94C-42 122 -18 136 0 138C18 136 42 122 62 94C84 60 92 10 90 -52Z', 'url(#zsk)') +
      P('M90 -40C92 10 84 60 62 94C42 122 18 136 0 138C30 120 64 78 70 -30Z', Z.sk[2], ' opacity=".45"') +
      // brows, eyes, nose, mouth
      S('M-66 -24Q-42 -34 -16 -26M16 -26Q42 -34 66 -24', Z.hairD, 4.5) +
      eye(-1) + eye(1) +
      S('M5 40Q10 56 1 61', Z.sk[3], 3.4) +
      S(closed ? 'M-14 94Q0 99 14 94' : 'M-16 93Q0 97 16 92', Z.lip, 3.6) +
      // earring (his left ear: viewer right)
      `<circle cx="100" cy="44" r="4" fill="${Z.trim}"/>` + P('M96 50h8l2 14h-12Z', Z.trim) + P('M95 64h12l3 96q-9 6 -18 0Z', Z.hairD) + S('M98 70v84M104 70v84', Z.trimD, 1.4) +
      // side locks with amber tips (in front of the ears)
      P('M-96 -70C-112 -10 -108 60 -96 128L-84 168L-76 120C-70 60 -72 0 -66 -48Z', 'url(#ztp)') +
      P('M96 -70C112 -10 108 60 98 124L86 162L80 116C74 60 74 0 68 -48Z', 'url(#ztp)') +
      // fringe, parted on his right, sweeping across
      P('M-104 -36C-112 -120 -56 -170 2 -170C64 -170 112 -122 104 -40L92 -8L84 -40L70 -16L62 -54L44 -22L36 -62L14 -24L8 -70L-14 -28L-22 -66L-40 -18L-50 -58L-70 -14L-76 -50L-96 0Z', 'url(#zhr)') +
      S('M-36 -150C-10 -120 10 -90 14 -40M30 -156C40 -120 48 -90 46 -40M-66 -128C-60 -100 -52 -80 -50 -54', Z.hairL, 3, ' opacity=".55"')
    );
  };


  /* =================================================================================== */
  /* 1. Zhongli at the Pier 7 railing, night                                              */
  /* =================================================================================== */
  def('p_zl_pier', {
    title: 'Xiansheng at the railing, Pier 7',
    w: 1200, h: 900, tags: ['zhongli', 'pier7', 'night', 'sea', 'tonight'],
    svg: (w, h) => {
      const R = rng(707);
      const HZ = 372;
      // skyline on the right: modern towers behind traditional roofs, warm windows
      let towers = '', wins = '', roofs = '', refl = '', lan = '';
      [[800, 250, 40], [850, 214, 34], [900, 236, 48], [960, 170, 50], [1022, 226, 40], [1072, 190, 46], [1130, 236, 42], [1176, 200, 40]].forEach(([x, y, ww]) => {
        towers += `<rect x="${x}" y="${y}" width="${ww}" height="${HZ - y}" fill="#0e1828"/>`;
        for (let yy = y + 8; yy < HZ - 30; yy += 11) for (let xx = x + 5; xx < x + ww - 5; xx += 9) if (R() < 0.4) wins += `M${xx} ${yy}h4v5h-4Z`;
      });
      [[810, 352, 100, 30], [920, 346, 130, 38], [1050, 352, 120, 32], [1170, 344, 130, 40]].forEach(([x, y, ww, hh]) => {
        roofs += `<rect x="${x - ww * 0.4}" y="${y - 2}" width="${ww * 0.8}" height="${HZ - y + 2}" fill="#0a111c"/>` + roof(x, y, ww, hh, '#0a111c', '#b9863c');
        for (let i = 0; i < 4; i++) wins += `M${r0(x - ww * 0.3 + i * ww * 0.18)} ${y + 6}h6v8h-6Z`;
      });
      for (let x = 380; x < 1200; x += 14 + R() * 22) {
        const y = HZ - 4 + R() * 4, big = x > 780;
        if (big) lan += disc(x, y - 6, 8, 'url(#lg)') + disc(x, y - 6, 2.4, R() < 0.5 ? '#ffb05a' : '#ff7a4a');
        else lan += disc(x, y, 1.3 + R(), '#ffc98a', 0.8);
        refl += `<rect x="${r0(x - 1.5)}" y="${r0(HZ + 4 + R() * 4)}" width="${big ? 4 : 2}" height="${r0((big ? 30 : 10) + R() * (big ? 60 : 20))}" rx="1.5" fill="#ffa95a" opacity="${(0.2 + R() * 0.35).toFixed(2)}"/>`;
      }
      let moonRefl = '';
      for (let i = 0; i < 22; i++) {
        const y = HZ + 8 + i * 9, ww = 10 + i * 5 + R() * 10;
        moonRefl += `<rect x="${r0(220 - ww / 2 + (R() - 0.5) * 22)}" y="${y}" width="${r0(ww)}" height="2.4" rx="1.2" fill="#dfe6f0" opacity="${(0.55 - i * 0.02).toFixed(2)}"/>`;
      }
      let ripples = '';
      for (let i = 0; i < 30; i++) ripples += `M${r0(R() * 1200)} ${r0(HZ + 20 + R() * 460)}h${r0(30 + R() * 60)}`;
      const boat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` + P('M-40 0H40L30 12H-30Z', '#070c14') + P('M-4 0V-56L22 -6Z', '#0b1220') + disc(-26, -8, 10, 'url(#lg)') + disc(-26, -8, 2.5, '#ffbe6a') + `<rect x="-27" y="14" width="3" height="40" fill="#ffa95a" opacity=".35"/></g>`;
      const Z = ZL;
      const railY = (x) => 552 - x * 0.0233;
      // Zhongli from behind, hands on the rail, head turned to the sea on the left
      const zl =
        // shadow thrown left by the lamp
        ell(560, 884, 170, 12, '#000', ' opacity=".45"') +
        // legs + shoes
        P('M668 700L664 864H694L700 700Z', '#17110d') + P('M722 700L728 866H758L752 700Z', '#1b140f') +
        ell(678, 868, 20, 8, '#0a0706') + ell(744, 870, 20, 8, '#0a0706') + S('M754 790L758 860', '#ffc77a', 2, ' opacity=".3"') +
        // arms reaching out to the rail
        P('M646 410C622 428 606 474 596 530L622 538C632 494 650 460 670 436Z', 'url(#coat)') +
        P('M774 408C798 428 812 474 820 528L794 534C786 492 770 458 750 436Z', 'url(#coat)') +
        S('M598 520L622 528M796 526L820 520', Z.trim, 4) +
        P('M592 530C588 542 600 550 614 548L624 538L606 528Z', Z.glove) +
        P('M794 532C794 544 808 550 822 544L824 532L810 524Z', Z.glove) +
        // long coat tails split at the back, gold-trimmed
        P('M652 576L636 792Q674 800 708 794L710 586Z', 'url(#tail)') + P('M712 586L714 794Q750 800 786 792L770 576Z', 'url(#tail)') +
        S('M652 580L636 792Q674 800 708 794L710 588M712 588L714 794Q750 800 786 792L770 580', Z.trim, 2.6) +
        S('M676 600L666 780M748 600L758 780', Z.trimD, 1.6, ' opacity=".7"') +
        // coat back
        P('M686 388C662 392 640 400 632 414C628 470 640 524 652 566H770C780 524 790 470 788 412C780 400 758 392 736 386Z', 'url(#coat)') +
        S('M711 404V566', '#000', 2.5, ' opacity=".25"') +
        P('M650 554Q711 566 772 554V578Q711 590 650 578Z', Z.coatD) + S('M650 554Q711 566 772 554M650 578Q711 590 772 578', Z.trim, 2.5) +
        `<g transform="translate(711 568)"><rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" fill="${Z.coatD}" stroke="${Z.trim}" stroke-width="2.5"/><rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="${Z.tip}"/></g>` +
        // high collar
        P('M688 362Q712 372 738 362L744 394Q712 404 682 394Z', Z.coatD) + S('M688 362Q712 372 738 362', Z.trim, 2.5) +
        // head: lost profile to the left
        P('M678 314C668 336 670 358 682 372L696 378C690 358 686 336 688 316Z', Z.sk[2]) +
        P('M675 322C676 312 680 306 686 304L688 322Z', Z.sk[1]) +
        P('M676 326C670 292 692 270 716 270C744 270 760 292 756 326C752 352 740 370 716 372C696 372 682 356 676 326Z', 'url(#zhr)') +
        S('M700 276C714 296 718 330 714 366M724 274C736 294 742 320 738 350M690 286C696 310 696 340 700 364', Z.hairL, 2, ' opacity=".5"') +
        P('M682 290C670 322 670 362 678 396L686 410L690 382C690 356 692 322 698 296Z', 'url(#ztp)') +
        P('M690 334C683 330 679 340 681 349C683 357 690 359 694 353Z', Z.sk[2]) +
        disc(689, 359, 2.6, Z.trim) + P('M686 362h7l1 7h-9Z', Z.trim) + P('M685 369h10l3 54q-8 4 -16 0Z', Z.hairD) + S('M690 373v46', Z.trim, 1.2) +
        // ponytail past the waist
        P('M700 366C726 368 736 400 736 450C736 512 730 562 722 604L714 624L706 602C698 556 692 502 692 446C692 404 692 374 700 366Z', 'url(#pony)') +
        `<rect x="697" y="366" width="32" height="10" rx="4" fill="${Z.coatD}"/><rect x="697" y="369" width="32" height="2.6" fill="${Z.trim}"/>` +
        S('M706 386C712 450 714 520 710 580M722 388C728 450 728 520 720 574M714 390V560', Z.hairL, 1.8, ' opacity=".45"') +
        // rim lights: warm lamp on the right, cool moon on the left
        S('M748 286C758 304 760 328 754 346M786 414C790 470 780 524 770 562M776 410C800 430 814 474 820 524M770 582L786 790', '#ffc77a', 3, ' opacity=".6"') +
        S('M680 306C684 288 696 274 712 270M632 418C630 470 640 524 650 562M646 412C624 430 608 474 598 524', '#9db6da', 2.5, ' opacity=".45"');
      const posts = [60, 300, 520, 960].map((x) => `<rect x="${x}" y="${r0(railY(x) - 2)}" width="22" height="${r0(860 - railY(x))}" fill="#1f1611"/><rect x="${x}" y="${r0(railY(x))}" width="5" height="${r0(860 - railY(x))}" fill="#8a5a34" opacity=".35"/>`).join('');
      const body =
        `<rect width="1200" height="${HZ + 4}" fill="url(#sky)"/>` +
        ell(1000, HZ, 520, 190, 'url(#city)') +
        disc(220, 130, 150, 'url(#mg)') + disc(220, 130, 28, '#f3efe2') + disc(213, 124, 27, '#fffdf6', 0.5) +
        P('M60 150Q160 136 240 146Q330 156 420 140Q360 166 250 166Q150 170 60 150Z', '#1a2638', ' opacity=".85"') + S('M90 150Q180 140 250 148', '#a9b6cc', 2, ' opacity=".35"') +
        P('M480 120Q560 106 640 118Q700 126 760 114Q720 134 640 134Q560 138 480 120Z', '#152033', ' opacity=".6"') +
        // karst cliffs behind the city
        P(`M760 ${HZ}V250C770 220 790 200 806 208C820 160 846 130 866 150C880 170 870 214 890 210C910 150 930 96 962 104C990 112 984 170 1000 176C1020 130 1050 110 1076 126C1098 140 1090 190 1110 186C1130 150 1160 140 1200 150V${HZ}Z`, '#111c2d') +
        towers + `<path d="${wins}" fill="#ffd08a" opacity=".75"/>` + roofs +
        `<rect y="${HZ}" width="1200" height="${900 - HZ}" fill="url(#sea)"/>` +
        `<rect y="${HZ - 1}" width="780" height="2" fill="#3a4d63" opacity=".8"/>` +
        lan + refl + moonRefl + `<path d="${ripples}" stroke="#4d6a86" stroke-width="2" opacity=".3"/>` +
        boat(560, 420, 0.7) + boat(1010, 440, 0.9) +
        // the rod (Liyue lacquer, gold whippings) propped on the railing; its line runs out to the sea
        S('M300 152Q230 330 170 560', '#e6e2d6', 1.3, ' opacity=".5"') +
        // railing + deck
        P('M0 820L1200 792V900H0Z', 'url(#deck)') + S('M0 846L1200 820M0 872L1200 850M0 896L1200 880', '#120c09', 2, ' opacity=".6"') +
        P('M0 808L1200 780V796L0 826Z', '#1a120e') +
        P('M0 690L1200 662V676L0 704Z', '#1d1511') +
        posts +
        P(`M0 552L1200 524L1200 546L0 576Z`, 'url(#rail)') + P('M0 552L1200 524L1200 530L0 558Z', '#a26b3e', ' opacity=".75"') +
        S('M470 892L440 542L300 152', '#5b1f1b', 6) + S('M440 542L300 152', '#8e2c25', 2.5) +
        S('M466 846l-3 -26M446 600l-2 -14M392 400l-3 -8M346 280l-3 -7', '#d9b25b', 8) +
        disc(468, 846, 19, '#2b2a2e') + disc(468, 846, 10, '#7c7a80') + disc(468, 846, 3.5, '#d9b25b') +
        zl +
        // lamp post at the right edge
        `<rect x="1112" y="214" width="16" height="700" fill="#16110e"/>` + `<rect x="1104" y="780" width="32" height="20" fill="#16110e"/>` +
        disc(1120, 190, 330, 'url(#lamp)') +
        P('M1094 160H1146L1138 218H1102Z', '#ffd79a') + P('M1088 152H1152L1142 162H1098Z', '#20160f') + P('M1100 218H1140L1132 228H1108Z', '#20160f') +
        S('M1120 160V218M1106 160L1110 218M1134 160L1130 218', '#6b3b18', 2) +
        disc(1010, 96, 44, 'url(#bk)', 0.55) + disc(1170, 320, 58, 'url(#bk)', 0.4) + disc(950, 250, 22, 'url(#bk)', 0.5) + disc(80, 840, 70, 'url(#bk)', 0.18);
      return wrap(w, h,
        lg('sky', [[0, '#050b16'], [0.6, '#0f1e31'], [1, '#24364a']]) +
        rg('city', [[0, '#f0a25a', 0.42], [0.5, '#c46a3a', 0.12], [1, '#c46a3a', 0]]) +
        glowDef('mg', '#c9d6ea', 0.35) + glowDef('lg', '#ff9a4a', 0.7) + glowDef('lamp', '#ffb768', 0.55) + bokehDef('bk', '#ffc27a') +
        lg('sea', [[0, '#0e1e2e'], [0.4, '#09141f'], [1, '#04090f']]) +
        lg('rail', [[0, '#3a281d'], [1, '#16100c']]) + lg('deck', [[0, '#2a1d15'], [1, '#3c2a1e']]) +
        lg('coat', [[0, ZL.coatL], [0.55, ZL.coat], [1, ZL.coatD]], 1, 0, 0, 0.2) +
        lg('tail', [[0, ZL.coat], [1, '#1a110b']]) +
        lg('pony', [[0, ZL.hair], [0.55, ZL.hair], [0.85, ZL.tip], [1, ZL.tipL]]) +
        zlDefs(ZL) + vigDef(0.7, 0.45) + grainDef(),
        tilt(-2.6, 1.07, body) + vig(w, h) + grain(w, h, 0.12));
    },
  });

  /* =================================================================================== */
  /* 2. Liuli Pavilion dinner, from above at an angle                                     */
  /* =================================================================================== */
  def('p_liuli_dinner', {
    title: 'Dinner at Liuli Pavilion',
    w: 1200, h: 900, tags: ['zhongli', 'liuli', 'dinner', 'food', 'tonight'],
    svg: (w, h) => {
      const R = rng(88);
      const K = 0.58; // foreshortening
      const shadow = (x, y, rx, ry) => ell(x + 10, y + 14, rx, ry, '#000', ' opacity=".4"');
      // blue-and-white porcelain plate
      const plate = (x, y, rx, inner = '#eef1f3') =>
        shadow(x, y, rx, rx * K) + ell(x, y, rx, rx * K, 'url(#por)') + ell(x, y + 3, rx * 0.8, rx * K * 0.78, inner) +
        `<ellipse cx="${x}" cy="${y}" rx="${r0(rx * 0.9)}" ry="${r0(rx * K * 0.88)}" fill="none" stroke="#2c5f9e" stroke-width="3" stroke-dasharray="10 6" opacity=".75"/>` +
        `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${r0(rx * K)}" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`;
      const bowl = (x, y, rx, fill) =>
        shadow(x, y + rx * 0.3, rx * 1.02, rx * K) +
        P(`M${x - rx} ${y}Q${x - rx * 0.9} ${y + rx * 0.86} ${x} ${y + rx * 0.9}Q${x + rx * 0.9} ${y + rx * 0.86} ${x + rx} ${y}Z`, 'url(#porS)') +
        S(`M${r0(x - rx * 0.86)} ${r0(y + rx * 0.4)}Q${x} ${r0(y + rx * 0.62)} ${r0(x + rx * 0.86)} ${r0(y + rx * 0.4)}`, '#2c5f9e', 3, ' opacity=".6"') +
        ell(x, y, rx, rx * K, '#f7f8f9') + ell(x, y + 2, rx * 0.88, rx * K * 0.84, fill);
      const cup = (x, y, s) =>
        shadow(x, y + 30 * s, 54 * s, 28 * s) + ell(x, y + 26 * s, 50 * s, 26 * s, '#e9ecef') + `<ellipse cx="${x}" cy="${y + 26 * s}" rx="${r0(50 * s)}" ry="${r0(26 * s)}" fill="none" stroke="#2c5f9e" stroke-width="2" opacity=".5"/>` +
        P(`M${x - 36 * s} ${y}Q${x - 32 * s} ${y + 36 * s} ${x} ${y + 38 * s}Q${x + 32 * s} ${y + 36 * s} ${x + 36 * s} ${y}Z`, 'url(#porS)') +
        ell(x, y, 36 * s, 18 * s, '#f7f8f9') + ell(x, y + 1 * s, 31 * s, 15 * s, 'url(#tea)') + ell(x - 10 * s, y - 3 * s, 10 * s, 3.5 * s, '#fff3c9', ' opacity=".55"');
      // jade parcels
      let parcels = '';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3, px = 560 + Math.cos(a) * 112, py = 452 + Math.sin(a) * 64;
        parcels += ell(px, py + 8, 44, 30, '#255c30') + ell(px, py, 42, 28, 'url(#jade)') +
          S(`M${r0(px - 36)} ${r0(py + 3)}Q${r0(px)} ${r0(py - 10)} ${r0(px + 36)} ${r0(py + 3)}`, '#1d5228', 3.5) + ell(px - 10, py - 10, 13, 6, '#e3f6c4', ' opacity=".55"');
      }
      parcels += ell(560, 452, 46, 28, 'url(#jade)') + S('M526 454Q560 440 594 454', '#1d5228', 3.5) + disc(548, 440, 7, '#d8352e') + disc(568, 448, 6, '#f2c14a') + disc(578, 436, 5, '#d8352e');
      // crystal shrimp dumplings in the steamer
      let dump = '';
      [[120, 236], [190, 214], [260, 230], [96, 290], [170, 280], [244, 288], [140, 334], [214, 336]].forEach(([x, y]) => {
        dump += ell(x + 3, y + 8, 30, 18, '#a8916a', ' opacity=".5"') + ell(x, y, 30, 20, 'url(#dumpl)') + ell(x + 3, y + 2, 15, 8, '#f39a84', ' opacity=".55"') +
          S(`M${x - 22} ${y - 6}Q${x - 10} ${y - 18} ${x} ${y - 8}Q${x + 10} ${y - 18} ${x + 22} ${y - 6}`, '#fff', 2.2, ' opacity=".75"');
      });
      // almond tofu
      let tofu = '';
      for (let i = 0; i < 7; i++) {
        const tx = 196 + (i % 4) * 30 + (R() - 0.5) * 8 + (i > 3 ? 14 : 0), ty = 578 + Math.floor(i / 4) * 26;
        tofu += P(`M${r0(tx)} ${r0(ty - 11)}l16 10l-16 10l-16 -10Z`, '#fbf7ec') + P(`M${r0(tx)} ${r0(ty + 9)}l16 -10v5l-16 10Z`, '#ddd2bd');
      }
      tofu += disc(226, 590, 4.5, '#d8352e') + disc(262, 604, 4.5, '#d8352e') + disc(196, 600, 4, '#d8352e') + disc(282, 582, 4, '#d8352e');
      // osmanthus scattered on the runner
      let osm = '';
      for (let i = 0; i < 18; i++) osm += disc(330 + R() * 520, 120 + R() * 740, 2.5 + R() * 2, R() < 0.5 ? '#f6b23a' : '#f28c28', 0.85);
      // gloved hand + sleeve (local: wrist at 0,0 pointing +x)
      const hand =
        P('M-8 -40L-360 -70V70L-8 40Z', 'url(#slv)') +
        S('M-14 -40V40', ZL.trim, 9) + S('M-30 -42V42', ZL.trimD, 2.5) + S('M-60 -46L-60 46M-64 -46L-64 46', ZL.trim, 1.6, ' opacity=".8"') +
        P('M-2 -25C24 -31 50 -31 70 -25L116 -13C126 -10 127 3 118 5L74 15C60 23 30 27 -2 25Z', 'url(#glv)') +
        P('M28 18C46 30 70 37 90 35C99 34 99 24 90 22C76 19 60 14 48 8Z', '#121012') +
        S('M72 -12L118 -3M74 2L116 6', '#000', 2.2, ' opacity=".7"') +
        S('M66 -22L110 -12M70 -8L114 -1M72 6L112 8', '#6a6064', 1.8, ' opacity=".55"') +
        S('M8 -14Q36 -21 62 -15M40 24Q62 31 84 30', '#6b6266', 3, ' opacity=".45"');
      const body =
        `<rect width="1200" height="900" fill="url(#tbl)"/>` +
        P('M300 0H860L1010 900H150Z', 'url(#runner)') + P('M300 0H860L1010 900H150Z', 'url(#cloud)', ' opacity=".5"') +
        S('M312 0L164 900M848 0L996 900', '#e2bf68', 4, ' opacity=".7"') + S('M330 0L188 900M830 0L972 900', '#e2bf68', 1.5, ' opacity=".5"') +
        osm +
        // steamer, lid leaning off the corner
        shadow(180, 284, 190, 112) + ell(180, 278, 188, 110, '#a8834e') + ell(180, 272, 172, 98, '#ead9b4') +
        `<ellipse cx="180" cy="272" rx="172" ry="98" fill="none" stroke="#7a5a2c" stroke-width="8"/>` + S('M40 262Q180 230 320 262', '#cdb68a', 2, ' opacity=".6"') + dump +
        // lotus root soup
        bowl(560, 150, 118, 'url(#broth)') +
        [[520, 140], [590, 132], [566, 172]].map(([x, y]) => ell(x, y, 26, 14, '#f3e7c9') + disc(x - 8, y - 2, 4, '#c79a4e') + disc(x + 4, y - 4, 4, '#c79a4e') + disc(x + 10, y + 4, 3.5, '#c79a4e') + disc(x - 2, y + 5, 3.5, '#c79a4e')).join('') +
        P('M618 122L700 60L712 70L640 140Q624 150 616 136Z', '#f4f6f7') + ell(626, 132, 22, 12, '#eef1f3') +
        // sauce dishes
        plate(380, 386, 40, '#2a120b') + ell(374, 382, 12, 5, '#7a3a1c', ' opacity=".6"') + plate(760, 330, 38, '#9b1f10') + disc(752, 326, 5, '#e85b2a') + disc(768, 334, 4, '#e85b2a') +
        // jade parcels
        plate(560, 452, 210) + parcels +
        // steamed fish
        shadow(940, 610, 230, 100) + ell(934, 600, 228, 100, 'url(#por)') + ell(934, 604, 196, 82, '#eef1f3') +
        `<ellipse cx="934" cy="600" rx="208" ry="90" fill="none" stroke="#2c5f9e" stroke-width="3" stroke-dasharray="10 6" opacity=".7"/>` +
        ell(934, 618, 170, 40, '#7a3a14', ' opacity=".55"') +
        P('M776 600C810 552 950 540 1006 580L1072 544L1060 600L1074 652L1006 620C950 664 812 652 776 600Z', 'url(#fish)') +
        P('M776 600C810 552 950 540 1006 580C950 572 830 572 776 600Z', '#7d8a8c', ' opacity=".45"') +
        S('M850 582q8 18 0 36M890 578q8 18 0 38M930 580q8 16 0 34', '#b98a5a', 3, ' opacity=".6"') + disc(806, 594, 6, '#1e1a18') + disc(804, 592, 2, '#fff') +
        S('M830 606l26 -16M870 612l24 -18M912 614l24 -16M950 610l20 -14', '#4c9a3a', 5) + S('M846 598l14 8M886 602l16 6M926 604l14 6', '#f2c76a', 3.5) + S('M860 590l20 4M904 594l18 4', '#e2382a', 2.5) +
        // almond tofu
        bowl(236, 584, 96, '#f6eedc') + tofu +
        // Zhongli's cup, the teapot, the hand reaching in from his side
        cup(824, 226, 1) +
        shadow(1110, 360, 92, 40) + P('M1036 350C1028 280 1184 280 1178 350C1172 384 1042 384 1036 350Z', 'url(#por)') +
        P('M1038 320C1008 312 990 288 978 270L988 264C1000 280 1016 296 1040 304Z', '#e4e8eb') + ell(1106, 292, 50, 15, '#e8edf0') + disc(1106, 282, 10, '#cfd6dc') +
        S('M1046 336Q1106 360 1170 336', '#2c5f9e', 3, ' opacity=".7"') + S('M1056 312Q1066 294 1090 292', '#fff', 5, ' opacity=".7"') +
        `<g transform="translate(952 138) rotate(147)">${hand}</g>` +
        // Childe's side: cup, chopsticks on a rest, the bill folder nearest the camera
        cup(380, 760, 1.25) +
        ell(632, 828, 26, 11, '#3f8a5a') + S('M520 892L780 786M532 904L790 800', '#efe2c2', 8) + S('M700 820L780 786M712 832L790 800', '#c19842', 8) +
        `<g transform="rotate(-9 960 820)"><rect x="852" y="730" width="250" height="200" rx="10" fill="#000" opacity=".45" transform="translate(10 12)"/>` +
        `<rect x="852" y="730" width="250" height="200" rx="10" fill="url(#bill)"/><rect x="865" y="743" width="224" height="174" rx="6" fill="none" stroke="#d9b25b" stroke-width="2"/>` +
        `<rect x="880" y="712" width="164" height="44" fill="#f7f1e2"/>` + S('M894 728h96M894 742h62', '#9a8f7a', 3) +
        `<circle cx="977" cy="828" r="27" fill="none" stroke="#d9b25b" stroke-width="2.5"/>` + T(977, 836, 'LIULI', 16, '#d9b25b', ' text-anchor="middle" letter-spacing="2" font-weight="600"') +
        T(977, 888, 'PAVILION', 12, '#b89545', ' text-anchor="middle" letter-spacing="4"') + `</g>` +
        // warm lantern light from above, lantern tassel out of focus in the corner
        `<rect width="1200" height="900" fill="url(#lamp)" style="mix-blend-mode:soft-light"/>` + ell(420, 300, 520, 360, 'url(#lamp2)') +
        disc(1150, 120, 90, 'url(#bk)', 0.4) + disc(40, 700, 110, 'url(#bk)', 0.22);
      return wrap(w, h,
        lg('tbl', [[0, '#4e2016'], [0.5, '#34130e'], [1, '#1a0906']], 0, 0, 0.4, 1) +
        lg('runner', [[0, '#d9be8c'], [0.55, '#c6a571'], [1, '#97774a']]) +
        `<pattern id="cloud" width="90" height="70" patternUnits="userSpaceOnUse"><path d="M10 40q10 -16 24 -6q8 -14 22 -4q14 -4 14 10M50 70q10 -16 24 -6" fill="none" stroke="#b08a48" stroke-width="2.5"/></pattern>` +
        rg('lamp', [[0, '#ffcc78', 0.9], [0.6, '#ff9d4a', 0.35], [1, '#3a0a00', 0.6]], 0.3, 0.2, 0.9) +
        rg('lamp2', [[0, '#ffd28a', 0.22], [1, '#ffd28a', 0]]) +
        lg('por', [[0, '#ffffff'], [0.6, '#e9edf0'], [1, '#bcc5cc']], 0, 0, 0.3, 1) +
        lg('porS', [[0, '#c3ccd3'], [0.35, '#ffffff'], [1, '#aeb8c0']], 0, 0, 1, 0) +
        rg('tea', [[0, '#eab95c'], [0.7, '#b9782a'], [1, '#8f5518']], 0.45, 0.4, 0.6) +
        rg('broth', [[0, '#f2c86e'], [0.8, '#d39a3e'], [1, '#a8701e']], 0.45, 0.4, 0.6) +
        lg('jade', [[0, '#b4e494'], [0.6, '#62aa5c'], [1, '#2c763c']], 0.2, 0, 0.6, 1) +
        rg('dumpl', [[0, '#fff'], [0.6, '#f6eee2'], [1, '#d9cbb4']], 0.4, 0.35, 0.65) +
        lg('fish', [[0, '#9aa5a6'], [0.4, '#e9e4d8'], [1, '#c9a988']]) +
        lg('slv', [[0, ZL.coatL], [1, ZL.coatD]], 0, 0, 0, 1) +
        lg('glv', [[0, '#3c3537'], [0.5, '#151112'], [1, '#050405']], 0, 0, 0, 1) +
        lg('bill', [[0, '#3a1612'], [1, '#1f0b09']], 0, 0, 1, 1) + bokehDef('bk', '#ffc27a') +
        vigDef(0.65, 0.5) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.09));
    },
  });

  /* ---------- shared scenery ---------- */
  // karst pillar: centre x, base y, width, height
  const karst = (x, base, ww, hh, fill, tufts) => {
    const a = ww / 2;
    let s = P(`M${r0(x - a)} ${base}C${r0(x - a * 1.05)} ${r0(base - hh * 0.55)} ${r0(x - a * 0.9)} ${r0(base - hh * 0.92)} ${r0(x - a * 0.3)} ${r0(base - hh)}C${r0(x)} ${r0(base - hh * 1.04)} ${r0(x + a * 0.5)} ${r0(base - hh * 0.98)} ${r0(x + a * 0.8)} ${r0(base - hh * 0.8)}C${r0(x + a * 1.05)} ${r0(base - hh * 0.5)} ${r0(x + a * 0.96)} ${r0(base - hh * 0.2)} ${r0(x + a)} ${base}Z`, fill);
    if (tufts) s += P(`M${r0(x - a * 0.6)} ${r0(base - hh * 0.97)}q${r0(a * 0.15)} ${r0(-hh * 0.06)} ${r0(a * 0.3)} 0q${r0(a * 0.12)} ${r0(-hh * 0.07)} ${r0(a * 0.32)} ${r0(-hh * 0.01)}q${r0(a * 0.2)} ${r0(-hh * 0.05)} ${r0(a * 0.36)} ${r0(hh * 0.04)}Z`, tufts);
    return s;
  };
  // soft cumulus, lit from below: centre x,y, scale, gradient id
  const cloud = (x, y, s, fill, op = 1) => `<path transform="translate(${x} ${y}) scale(${s} ${s * 0.8})" d="M-120 0C-130 -26 -96 -40 -74 -30C-66 -62 -20 -70 0 -44C16 -66 62 -64 70 -34C96 -44 128 -26 120 0Q0 10 -120 0Z" fill="${fill}" opacity="${op}"/>`;

  // long sunrise/sunset cloud streak
  const streak = (x, y, ww, hh, fill, op = 1) => P(`M${r0(x - ww / 2)} ${y}C${r0(x - ww * 0.3)} ${r0(y - hh)} ${r0(x + ww * 0.05)} ${r0(y - hh * 1.3)} ${r0(x + ww * 0.22)} ${r0(y - hh * 0.6)}C${r0(x + ww * 0.32)} ${r0(y - hh * 0.9)} ${r0(x + ww * 0.46)} ${r0(y - hh * 0.5)} ${r0(x + ww / 2)} ${r0(y + hh * 0.1)}C${r0(x + ww * 0.2)} ${r0(y + hh * 0.3)} ${r0(x - ww * 0.1)} ${r0(y + hh * 0.05)} ${r0(x - ww * 0.25)} ${r0(y + hh * 0.25)}C${r0(x - ww * 0.36)} ${r0(y + hh * 0.3)} ${r0(x - ww * 0.45)} ${r0(y + hh * 0.15)} ${r0(x - ww / 2)} ${y}Z`, fill, op !== 1 ? ` opacity="${op}"` : '');
  // two-tier Liyue hall: centre x, ground y, width. o: {wall, gold, edge, stone, dark}
  const palace = (cx, by, ww, o = {}) => {
    const hh = ww * 0.62, wall = o.wall || '#a8322a', gold = o.gold || 'url(#gold)', edge = o.edge || '#fff2c0', dark = o.dark || '#3a1a12';
    let s = `<rect x="${r0(cx - ww * 0.46)}" y="${r0(by - hh * 0.07)}" width="${r0(ww * 0.92)}" height="${r0(hh * 0.07) + 2}" fill="${o.stone || '#ddd3c2'}"/>` +
      `<rect x="${r0(cx - ww * 0.38)}" y="${r0(by - hh * 0.38)}" width="${r0(ww * 0.76)}" height="${r0(hh * 0.31)}" fill="${wall}"/>`;
    for (let i = 0; i < 7; i++) s += `<rect x="${r0(cx - ww * 0.37 + i * ww * 0.12)}" y="${r0(by - hh * 0.38)}" width="${Math.max(2, r0(ww * 0.018))}" height="${r0(hh * 0.31)}" fill="${dark}" opacity=".45"/>`;
    s += `<rect x="${r0(cx - ww * 0.1)}" y="${r0(by - hh * 0.3)}" width="${r0(ww * 0.2)}" height="${r0(hh * 0.23)}" fill="#e2b04a" opacity=".55"/>` +
      `<rect x="${r0(cx - ww * 0.38)}" y="${r0(by - hh * 0.38)}" width="${r0(ww * 0.76)}" height="${r0(hh * 0.06)}" fill="#000" opacity=".35"/>` +
      `<rect x="${r0(cx - ww * 0.25)}" y="${r0(by - hh * 0.64)}" width="${r0(ww * 0.5)}" height="${r0(hh * 0.2)}" fill="${wall}"/>` +
      `<rect x="${r0(cx - ww * 0.25)}" y="${r0(by - hh * 0.64)}" width="${r0(ww * 0.5)}" height="${r0(hh * 0.05)}" fill="#000" opacity=".35"/>` +
      hall(cx, by - hh * 0.35, ww, hh * 0.2, gold, edge) +
      S(`M${r0(cx - ww * 0.3)} ${r0(by - hh * 0.43)}Q${cx} ${r0(by - hh * 0.45)} ${r0(cx + ww * 0.3)} ${r0(by - hh * 0.43)}`, dark, r0(hh * 0.07), ' stroke-linecap="butt" stroke-dasharray="1.5 6" opacity=".35"') +
      hall(cx, by - hh * 0.61, ww * 0.74, hh * 0.36, gold, edge) +
      S(`M${r0(cx - ww * 0.18)} ${r0(by - hh * 0.75)}Q${cx} ${r0(by - hh * 0.77)} ${r0(cx + ww * 0.18)} ${r0(by - hh * 0.75)}`, dark, r0(hh * 0.12), ' stroke-linecap="butt" stroke-dasharray="1.5 6" opacity=".3"') +
      P(`M${r0(cx - ww * 0.13)} ${r0(by - hh * 0.97)}q${r0(-ww * 0.03)} ${r0(-hh * 0.1)} ${r0(ww * 0.02)} ${r0(-hh * 0.12)}l${r0(ww * 0.01)} ${r0(hh * 0.12)}ZM${r0(cx + ww * 0.13)} ${r0(by - hh * 0.97)}q${r0(ww * 0.03)} ${r0(-hh * 0.1)} ${r0(-ww * 0.02)} ${r0(-hh * 0.12)}l${r0(-ww * 0.01)} ${r0(hh * 0.12)}Z`, edge);
    return s;
  };

  /* =================================================================================== */
  /* 3. The rod on Pier 7 at dusk                                                         */
  /* =================================================================================== */
  def('p_pier7_rod', {
    title: 'Pier 7 at dusk',
    w: 1200, h: 900, tags: ['pier7', 'fishing', 'rod', 'dusk', 'tea', 'tonight'],
    svg: (w, h) => {
      const R = rng(7);
      const HZ = 470;
      let sunRefl = '';
      for (let i = 0; i < 24; i++) {
        const y = HZ + 6 + i * 6, ww = 16 + i * 6 + R() * 18;
        sunRefl += `<rect x="${r0(320 - ww / 2 + (R() - 0.5) * 16)}" y="${y}" width="${r0(ww)}" height="2.6" rx="1.3" fill="#ffd89a" opacity="${(0.8 - i * 0.028).toFixed(2)}"/>`;
      }
      let waves = '', lights = '';
      for (let i = 0; i < 40; i++) waves += `M${r0(R() * 1200)} ${r0(HZ + 10 + R() * 160)}h${r0(16 + R() * 50)}`;
      for (let x = 860; x < 1200; x += 8 + R() * 16) lights += disc(x, HZ - 3 - R() * 6, 1.4 + R() * 1.2, R() < 0.6 ? '#ffd27a' : '#ff8a4a', 0.9);
      let planks = '';
      for (let i = -12; i <= 12; i++) planks += `M${600 + i * 26} 720L${600 + i * 120} 900`;
      const gull = (x, y, s) => S(`M${x - 22 * s} ${y}q${11 * s} -12 ${22 * s} 0q${11 * s} -12 ${22 * s} 0`, '#3a2a40', 3 * s);
      const body =
        `<rect width="1200" height="${HZ + 2}" fill="url(#sky)"/>` +
        disc(320, 450, 360, 'url(#sg)') +
        streak(260, 120, 620, 40, 'url(#cl)', 0.9) + streak(760, 80, 760, 50, 'url(#cl)', 0.85) + streak(1080, 190, 520, 34, 'url(#cl)', 0.8) +
        streak(560, 200, 420, 22, 'url(#cl)', 0.7) + streak(180, 260, 360, 16, 'url(#cl2)', 0.7) + streak(820, 300, 520, 20, 'url(#cl2)', 0.6) + streak(520, 380, 300, 10, 'url(#cl2)', 0.6) +
        disc(320, 452, 38, '#fff3cf') +
        P(`M200 ${HZ - 18}Q320 ${HZ - 30} 460 ${HZ - 20}Q330 ${HZ - 12} 200 ${HZ - 18}Z`, '#e2786a', ' opacity=".6"') +
        gull(700, 230, 1) + gull(752, 262, 0.7) + gull(640, 270, 0.55) +
        // karst pillars on the left, the harbor on the right
        karst(40, HZ, 120, 250, '#7d5f86') + karst(130, HZ, 90, 300, '#755a80') + karst(210, HZ, 80, 200, '#80638a') +
        karst(90, HZ + 2, 120, 170, '#4e3c5e', '#3f304d') + karst(180, HZ + 2, 70, 120, '#4a3a5a') +
        S(`M20 ${HZ - 200}v120M60 ${HZ - 230}v170M118 ${HZ - 270}v200M146 ${HZ - 240}v150M200 ${HZ - 170}v110`, '#9a7aa0', 3, ' opacity=".35"') +
        karst(980, HZ, 70, 180, '#7d5f86') + karst(1060, HZ, 110, 250, '#755a80') + karst(1160, HZ, 90, 200, '#80638a') +
        P(`M840 ${HZ}V${HZ - 22}h30v-12h40v18h26v-26l20 -10l20 10v26h40v-16h50v-20l16 -8l16 8v20h40v-14h30v14h32V${HZ}Z`, '#3b2c4a') +
        roof(930, HZ - 30, 70, 22, '#3b2c4a') + roof(1110, HZ - 40, 80, 26, '#3b2c4a') + lights +
        `<rect y="${HZ}" width="1200" height="${900 - HZ}" fill="url(#sea)"/>` + sunRefl + `<path d="${waves}" stroke="#f0a27a" stroke-width="2" opacity=".35"/>` +
        // a junk under sail
        `<g transform="translate(610 ${HZ + 26})">` + P('M-40 0H44L34 12H-30Z', '#2a1f36') + P('M-10 0V-70Q12 -50 14 -6Z', '#3a2b48') + P('M16 -4V-50Q34 -34 34 -6Z', '#3a2b48') + disc(-30, -6, 8, 'url(#lg)') + disc(-30, -6, 2, '#ffc06a') + '</g>' +
        // the line, the float and its rings
        S('M1150 150Q1110 330 1050 520', '#f4ead8', 1.6, ' opacity=".85"') +
        `<ellipse cx="1050" cy="526" rx="28" ry="5" fill="none" stroke="#f6c9a0" stroke-width="2" opacity=".6"/><ellipse cx="1050" cy="526" rx="50" ry="9" fill="none" stroke="#f6c9a0" stroke-width="1.5" opacity=".35"/>` +
        P('M1044 520Q1050 502 1056 520Z', '#e8402f') + `<rect x="1044" y="519" width="12" height="5" fill="#fff"/>` +
        // deck + railing
        P('M0 716H1200V900H0Z', 'url(#deck)') + `<path d="${planks}" stroke="#2a1a14" stroke-width="3" opacity=".55"/>` + P('M0 716H1200V734H0Z', '#000', ' opacity=".3"') +
        `<rect y="660" width="1200" height="10" fill="#2a1a18"/>` +
        [40, 330, 620, 900, 1170].map((x) => `<rect x="${x}" y="596" width="26" height="124" fill="#2c1c18"/><rect x="${x + 17}" y="596" width="9" height="124" fill="#f0a070" opacity=".3"/><rect x="${x - 5}" y="586" width="36" height="12" rx="3" fill="#3a2620"/>`).join('') +
        `<rect y="598" width="1200" height="20" fill="url(#rail)"/>` + `<rect y="598" width="1200" height="4" fill="#f5b07a" opacity=".55"/>` +
        // a pier lantern on the near post, just lit
        `<rect x="44" y="430" width="18" height="160" fill="#2c1c18"/>` + disc(53, 410, 70, 'url(#lg)') + P('M30 392H76L70 440H36Z', '#ffcf86') + P('M24 384H82L74 394H32Z', '#2c1c18') + S('M53 392V440', '#a0522d', 2) +
        // rod holder clamped to a post, the rod (Liyue lacquer with gold whippings), the reel
        `<rect x="884" y="612" width="58" height="22" rx="5" fill="#3a3a40"/>` + S('M876 760L930 600', '#4a4a52', 16) + S('M876 760L930 600', '#7a7a84', 3) +
        S('M862 780L1150 150', '#5b1f1b', 10) + S('M900 698L1150 150', '#a0362c', 3.5) +
        S('M884 732l7 -15M944 600l5 -11M1004 470l4 -9M1060 348l3 -7M1110 240l2 -5', '#e3bb62', 13) +
        S('M944 600l30 -6M1004 470l24 -5M1060 348l18 -4M1110 240l12 -3', '#c9c3b4', 2.5) +
        disc(904, 720, 32, '#26252a') + disc(904, 720, 19, '#77757c') + disc(904, 720, 7, '#e3bb62') + S('M904 720l36 -10', '#2c2b30', 7) + disc(942, 709, 6, '#e3bb62') +
        S('M904 720L1150 150', '#f4ead8', 1, ' opacity=".6"') +
        // bench in the foreground, with the cup of osmanthus tea
        P('M-30 760H640L668 800H-30Z', 'url(#bench)') + P('M-30 800H668V828H-30Z', '#3a2418') + P('M-30 760H640L644 767H-30Z', '#f3b47e', ' opacity=".5"') +
        S('M0 774H630M0 787H650', '#5a3420', 2, ' opacity=".5"') +
        `<rect x="40" y="828" width="38" height="90" fill="#2a1a12"/><rect x="560" y="828" width="38" height="90" fill="#2a1a12"/>` +
        ell(440, 770, 64, 13, '#1b0f0a', ' opacity=".55"') +
        P('M392 692Q396 760 438 766Q480 760 484 692Z', 'url(#cupg)') + ell(438, 692, 46, 12, '#f3eee4') + ell(438, 693, 40, 10, '#d79a44') +
        disc(426, 690, 2.6, '#ffd66a') + disc(448, 695, 2.2, '#ffd66a') + disc(438, 688, 2, '#ffd66a') + disc(458, 690, 2, '#ffd66a') +
        S('M404 704Q408 744 430 754', '#fff', 3.5, ' opacity=".6"') + S('M398 712Q438 728 478 712', '#6c9a7a', 2.5, ' opacity=".5"') +
        S('M428 676C414 648 444 632 430 604C420 584 438 568 432 548', '#fff', 6, ' opacity=".22"') + S('M452 676C442 652 466 636 454 610', '#fff', 5, ' opacity=".16"') +
        disc(1160, 860, 90, 'url(#bk)', 0.25);
      return wrap(w, h,
        lg('sky', [[0, '#272a55'], [0.32, '#6f4a78'], [0.6, '#d8706c'], [0.85, '#f8a45a'], [1, '#ffd08a']]) +
        lg('cl', [[0, '#5a4672'], [0.6, '#b0627a'], [1, '#f6a07a']]) + lg('cl2', [[0, '#c86a78'], [1, '#ffc48a']]) +
        glowDef('sg', '#ffcf86', 0.85) + glowDef('lg', '#ff9a4a', 0.75) + bokehDef('bk', '#ffc27a') +
        lg('sea', [[0, '#8a6280'], [0.1, '#55476c'], [1, '#232745']]) +
        lg('deck', [[0, '#6e432e'], [1, '#3b2219']]) +
        lg('rail', [[0, '#6a3c2a'], [1, '#3a2018']]) +
        lg('bench', [[0, '#a8683f'], [1, '#6a3c26']]) +
        lg('cupg', [[0, '#bcd0b8'], [0.5, '#f0f2ea'], [1, '#9fb09c']], 0, 0, 1, 0) +
        vigDef(0.55) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.1));
    },
  });

  /* =================================================================================== */
  /* 4. White cranes on Yujing Terrace at dawn                                            */
  /* =================================================================================== */
  // red-crowned crane, feet at 0,0, ~480 tall at s=1, facing right. pose: up | call | preen
  const crane = (x, y, s, pose, flip) => {
    const NECK = {
      up: 'M60 -292C86 -336 64 -386 78 -430C84 -450 92 -464 98 -472',
      call: 'M60 -292C78 -346 64 -402 72 -458',
      preen: 'M60 -292C98 -332 94 -394 48 -398C16 -400 -6 -372 -14 -336',
    }[pose];
    const HD = { up: [102, -474, 0], call: [76, -466, -62], preen: [-16, -328, 118] }[pose];
    const head = `<g transform="translate(${HD[0]} ${HD[1]}) rotate(${HD[2]})">` +
      ell(0, 0, 18, 14, '#1b1819') + P('M-12 -9Q0 -24 15 -10Q2 -5 -12 -9Z', '#d8262d') + ell(-12, 3, 8, 9, '#f8f5ef') +
      disc(5, -2, 2.8, '#2a1410') + disc(5.6, -2.8, 1, '#fff') + P('M13 -4L76 10L13 6Z', '#8f8c6c') + S('M14 -3L74 9', '#c9c49a', 2) + '</g>';
    return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">` +
      S('M-10 -200L-16 -118L-8 0M-8 0l-30 4M-8 0l28 4M-8 0l-8 -8', '#2b2627', 6) + S('M12 -198L16 -116L22 0M22 0l-26 3M22 0l30 2', '#3a3436', 6) +
      disc(-16, -118, 5.5, '#2b2627') + disc(16, -116, 5.5, '#3a3436') +
      `<path d="${NECK}" fill="none" stroke="#f4f1ea" stroke-width="28" stroke-linecap="round"/>` +
      `<path d="${NECK}" pathLength="100" fill="none" stroke="#1b1819" stroke-width="26" stroke-linecap="round" stroke-dasharray="0 34 66"/>` +
      `<path d="${NECK}" transform="translate(-8 2)" pathLength="100" fill="none" stroke="#f8f5ef" stroke-width="7" stroke-linecap="round" stroke-dasharray="0 40 50 10"/>` +
      // plump body + folded wing
      P('M94 -262C100 -308 42 -334 -20 -324C-78 -316 -132 -288 -154 -238C-128 -204 -66 -186 -8 -188C50 -190 88 -220 94 -262Z', 'url(#cw)') +
      S('M-110 -262C-64 -286 0 -298 58 -286M-96 -236C-54 -254 0 -262 46 -252M-70 -212C-36 -222 4 -224 34 -216', '#cbc4b9', 3, ' opacity=".7"') +
      // drooping black bustle
      P('M-36 -302C-92 -308 -152 -286 -180 -232C-188 -214 -186 -196 -176 -180C-166 -204 -150 -220 -132 -228C-146 -206 -150 -186 -144 -166C-130 -192 -114 -210 -94 -220C-98 -204 -96 -190 -90 -178C-78 -204 -58 -226 -42 -240C-32 -260 -28 -284 -36 -302Z', '#1b1819') +
      S('M-64 -288C-112 -280 -150 -254 -170 -220M-76 -264C-112 -248 -136 -222 -146 -190M-64 -246C-86 -228 -98 -206 -100 -188', '#5c5554', 2.5, ' opacity=".8"') +
      S('M94 -262C100 -308 42 -334 -20 -324', '#ffe2a8', 4.5, ' opacity=".85"') + S('M98 -470C110 -482 118 -476 116 -462', '#ffe2a8', 3, ' opacity=".5"') +
      head + '</g>';
  };
  def('p_cranes_yujing', {
    title: 'Cranes on Yujing Terrace, dawn',
    w: 1200, h: 900, tags: ['yujing', 'cranes', 'dawn', 'mist', 'tonight'],
    svg: (w, h) => {
      const k = (x) => 1 - x / 2400;
      const top = (x) => 690 - 0.15 * x;
      const base = (x) => 960 - 0.217 * x;
      const post = (x) => {
        const t = top(x) - 14 * k(x), q = k(x) * 1.15, ww = 48 * q;
        return `<rect x="${r0(x - ww / 2)}" y="${r0(t)}" width="${r0(ww)}" height="${r0(base(x) - t)}" fill="#d9cfbe"/>` +
          `<rect x="${r0(x + ww * 0.1)}" y="${r0(t)}" width="${r0(ww * 0.4)}" height="${r0(base(x) - t)}" fill="#f6efe2"/>` +
          `<rect x="${r0(x - ww * 0.62)}" y="${r0(t - 16 * q)}" width="${r0(ww * 1.24)}" height="${r0(18 * q)}" fill="#e6dccb"/><rect x="${r0(x + ww * 0.1)}" y="${r0(t - 16 * q)}" width="${r0(ww * 0.52)}" height="${r0(18 * q)}" fill="#fbf5ea"/>` +
          P(`M${r0(x - ww * 0.42)} ${r0(t - 16 * q)}C${r0(x - ww * 0.5)} ${r0(t - 54 * q)} ${r0(x - ww * 0.2)} ${r0(t - 74 * q)} ${r0(x)} ${r0(t - 80 * q)}C${r0(x + ww * 0.2)} ${r0(t - 74 * q)} ${r0(x + ww * 0.5)} ${r0(t - 54 * q)} ${r0(x + ww * 0.42)} ${r0(t - 16 * q)}Z`, 'url(#bud)') +
          S(`M${r0(x - ww * 0.22)} ${r0(t - 22 * q)}C${r0(x - ww * 0.26)} ${r0(t - 46 * q)} ${r0(x - ww * 0.1)} ${r0(t - 60 * q)} ${r0(x)} ${r0(t - 64 * q)}C${r0(x + ww * 0.1)} ${r0(t - 60 * q)} ${r0(x + ww * 0.26)} ${r0(t - 46 * q)} ${r0(x + ww * 0.22)} ${r0(t - 22 * q)}`, '#a79c8c', 2.5 * q);
      };
      const panel = (x0, x1) => {
        const y0 = top(x0) + 40 * k(x0), y1 = top(x1) + 40 * k(x1), b0 = base(x0) - 34 * k(x0), b1 = base(x1) - 34 * k(x1);
        const mx = (x0 + x1) / 2, my = (y0 + y1 + b0 + b1) / 4, q = k(mx);
        return P(`M${r0(x0)} ${r0(y0)}L${r0(x1)} ${r0(y1)}L${r0(x1)} ${r0(b1)}L${r0(x0)} ${r0(b0)}Z`, '#c4b9a6') +
          S(`M${r0(x0)} ${r0(y0)}L${r0(x1)} ${r0(y1)}`, '#9c907c', 4 * q) + S(`M${r0(x0)} ${r0(b0)}L${r0(x1)} ${r0(b1)}`, '#efe7d8', 3 * q) +
          S(`M${r0(mx - 80 * q)} ${r0(my + 14 * q)}c${r0(-20 * q)} ${r0(-24 * q)} ${r0(14 * q)} ${r0(-46 * q)} ${r0(30 * q)} ${r0(-22 * q)}c${r0(10 * q)} ${r0(16 * q)} ${r0(-12 * q)} ${r0(26 * q)} ${r0(-18 * q)} ${r0(10 * q)}M${r0(mx - 50 * q)} ${r0(my - 6 * q)}q${r0(50 * q)} ${r0(-14 * q)} ${r0(100 * q)} ${r0(-14 * q)}M${r0(mx + 80 * q)} ${r0(my - 22 * q)}c${r0(20 * q)} ${r0(24 * q)} ${r0(-14 * q)} ${r0(46 * q)} ${r0(-30 * q)} ${r0(22 * q)}c${r0(-10 * q)} ${r0(-16 * q)} ${r0(12 * q)} ${r0(-26 * q)} ${r0(18 * q)} ${r0(-10 * q)}`, '#968a76', 4 * q);
      };
      const body =
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        disc(900, 320, 540, 'url(#sun)') + disc(900, 320, 52, '#fff8e4', 0.95) +
        streak(300, 150, 560, 30, '#fff3e6', 0.55) + streak(700, 90, 700, 36, '#f9e6e2', 0.5) + streak(1100, 220, 360, 16, '#fff1d8', 0.6) + streak(560, 250, 300, 12, '#fff5e6', 0.5) +
        // karst layers dissolving in mist
        karst(60, 520, 110, 300, '#c7bccf') + karst(170, 520, 90, 380, '#bfb3c9') + karst(270, 520, 100, 260, '#c9bed0') + karst(380, 520, 80, 200, '#cdc2d2') +
        karst(1020, 520, 100, 260, '#d2c5cf') + karst(1110, 520, 120, 340, '#c7bacb') + karst(1190, 520, 80, 250, '#cfc2cf') +
        `<rect y="380" width="1200" height="180" fill="url(#mist)"/>` +
        karst(110, 640, 150, 250, '#a99fbb', '#958aa8') + karst(240, 640, 90, 180, '#ada3bd') + karst(1090, 640, 140, 230, '#b1a5bb', '#9d91aa') +
        `<rect y="470" width="1200" height="150" fill="url(#mist)"/>` +
        // Yujing halls with golden roofs below the terrace
        palace(720, 690, 470) + palace(330, 700, 220) + palace(1010, 690, 200) +
        `<rect y="600" width="1200" height="140" fill="url(#mist)"/>` +
        S('M520 196q16 -18 34 -4q16 -20 36 -6', '#5f586d', 3.5) + S('M590 232q11 -12 22 -2q11 -13 24 -4', '#5f586d', 2.5) +
        // balustrade
        P(`M0 ${top(0) + 30}L1200 ${top(1200) + 18}V900H0Z`, '#d6ccbb') +
        panel(150, 505) + panel(545, 800) + panel(830, 1025) + panel(1060, 1200) +
        P(`M0 ${base(0)}L1200 ${base(1200)}V900H0Z`, 'url(#floor)') + S(`M0 ${base(0) - 34}L1200 ${base(1200) - 18}`, '#a89c88', 6) +
        P(`M-10 ${top(-10) - 14}L1210 ${top(1210) - 8}L1210 ${top(1210)}L-10 ${top(-10)}Z`, '#fffaf0') +
        P(`M-10 ${top(-10)}L1210 ${top(1210)}L1210 ${top(1210) + 20}L-10 ${top(-10) + 36}Z`, 'url(#railg)') +
        post(130) + post(525) + post(815) + post(1042) +
        crane(1042, top(1042) - 14 * k(1042) - 80 * k(1042) * 1.15 + 4, 0.36, 'preen', true) +
        crane(690, top(690) - 4, 0.62, 'call', true) +
        crane(330, top(330) - 2, 1, 'up') +
        `<rect width="1200" height="900" fill="url(#haze)"/>`;
      return wrap(w, h,
        lg('sky', [[0, '#9fb0cc'], [0.28, '#d6c2cc'], [0.46, '#f6d0b2'], [0.6, '#ffd99c'], [1, '#f3d8b8']]) +
        glowDef('sun', '#fff1c6', 0.9) +
        lg('mist', [[0, '#fff6ea', 0], [0.5, '#fff4e6', 0.9], [1, '#fff6ea', 0]]) +
        lg('gold', [[0, '#ffe38e'], [0.5, '#e4aa3a'], [1, '#a8641c']]) +
        lg('bud', [[0, '#cfc5b4'], [0.6, '#f4eee2'], [1, '#fffaf0']], 0, 0, 1, 0) +
        lg('railg', [[0, '#e8dfcf'], [1, '#b9ae9b']]) +
        lg('floor', [[0, '#cfc5b4'], [1, '#9c907e']]) +
        lg('cw', [[0, '#ffffff'], [0.7, '#f1ede6'], [1, '#cfc8bd']], 1, 0, 0, 1) +
        lg('haze', [[0, '#fff3dc', 0.12], [0.5, '#fff3dc', 0], [1, '#fff3dc', 0.08]], 1, 0, 0, 0) +
        vigDef(0.32) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.08));
    },
  });
})();
