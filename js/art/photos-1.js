/* Photos 1 — the camera roll on Childe's phone: tonight, Zhongli, Liyue. 1200×900 unless noted. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- kit ---------- */
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = "Georgia, 'Times New Roman', serif";
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
  // Liyue hall roof, front view: eave line at y, width w, height h, flared corners
  const hall = (cx, y, w, h, fill, edge, noRib) => {
    const a = w / 2, X = (k) => r0(cx + a * k), Y = (k) => r0(y - h * k);
    return P(`M${X(-1)} ${Y(0.24)}Q${X(-0.82)} ${Y(0)} ${X(-0.62)} ${Y(0)}H${X(0.62)}Q${X(0.82)} ${Y(0)} ${X(1)} ${Y(0.24)}Q${X(0.72)} ${Y(0.3)} ${X(0.52)} ${Y(0.8)}L${X(0.46)} ${Y(1)}H${X(-0.46)}L${X(-0.52)} ${Y(0.8)}Q${X(-0.72)} ${Y(0.3)} ${X(-1)} ${Y(0.24)}Z`, fill) +
      (noRib ? '' : S(`M${X(-0.5)} ${Y(0.42)}Q${cx} ${Y(0.46)} ${X(0.5)} ${Y(0.42)}`, '#000', r0(h * 0.62), ' stroke-linecap="butt" stroke-dasharray="1.6 5.5" opacity=".18"')) +
      (edge ? S(`M${X(-1)} ${Y(0.24)}Q${X(-0.82)} ${Y(0)} ${X(-0.62)} ${Y(0)}H${X(0.62)}Q${X(0.82)} ${Y(0)} ${X(1)} ${Y(0.24)}`, edge, Math.max(1.5, h * 0.07)) +
        S(`M${X(-0.5)} ${Y(1)}H${X(0.5)}`, edge, Math.max(2, h * 0.09)) +
        P(`M${X(-0.5)} ${Y(1)}q${r0(-a * 0.06)} ${r0(-h * 0.2)} ${r0(a * 0.04)} ${r0(-h * 0.24)}l${r0(a * 0.02)} ${r0(h * 0.24)}ZM${X(0.5)} ${Y(1)}q${r0(a * 0.06)} ${r0(-h * 0.2)} ${r0(-a * 0.04)} ${r0(-h * 0.24)}l${r0(-a * 0.02)} ${r0(h * 0.24)}Z`, edge) : '');
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
  const zlHead = (Z, closed, noRing) => {
    const eye = (s) => {
      const x = 40 * s, y = 6;
      if (closed) {
        return S(`M${x - 25 * s} ${y - 2}Q${x - 2 * s} ${y + 10} ${x + 25 * s} ${y - 3}`, Z.lash, 4.8) +
          S(`M${x + 16 * s} ${y + 1}Q${x + 28 * s} ${y - 3} ${x + 37 * s} ${y - 9}`, Z.liner, 5.5, ' opacity=".6"');
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
      P('M-90 -52C-92 6 -86 50 -68 84C-50 114 -22 140 0 143C22 140 50 114 68 84C86 50 92 6 90 -52Z', 'url(#zsk)') +
      P('M90 -40C92 6 86 50 68 84C50 114 22 140 0 143C30 124 64 80 70 -30Z', Z.sk[2], ' opacity=".45"') +
      // brows, eyes, nose, mouth
      S('M-68 -24Q-44 -36 -16 -28M16 -28Q44 -36 68 -24', Z.hairD, 5.5) +
      eye(-1) + eye(1) +
      S('M5 40Q10 56 1 61', Z.sk[3], 3.4) +
      S(closed ? 'M-13 98Q0 101 13 97' : 'M-15 98Q0 100 15 97', Z.lip, 3.6) +
      // earring (his left ear: viewer right)
      (noRing ? '' : `<circle cx="100" cy="44" r="4" fill="${Z.trim}"/>` + P('M96 50h8l2 14h-12Z', Z.trim) + P('M95 64h12l3 96q-9 6 -18 0Z', Z.hairD) + S('M98 70v84M104 70v84', Z.trimD, 1.4)) +
      // side locks with amber tips (in front of the ears)
      P('M-96 -70C-112 -10 -108 60 -96 128L-84 168L-76 120C-70 60 -72 0 -66 -48Z', 'url(#ztp)') +
      P('M96 -70C112 -10 108 60 98 124L86 162L80 116C74 60 74 0 68 -48Z', 'url(#ztp)') +
      // fringe: soft locks, a long strand between the eyes
      P('M-104 -36C-112 -120 -56 -172 2 -172C64 -172 114 -122 104 -40Q96 -20 90 2Q82 -28 70 -40Q62 -22 50 -4Q44 -34 30 -46Q20 -28 8 -8Q2 -40 -10 -50Q-22 -32 -36 -16Q-44 -40 -56 -48Q-68 -28 -82 -6Q-88 -26 -104 -36Z', 'url(#zhr)') +
      S('M-30 -150C-8 -120 6 -80 8 -20M30 -156C44 -120 52 -80 50 -14M-66 -128C-60 -100 -50 -70 -38 -24M72 -130C80 -100 84 -70 88 -10', Z.hairL, 3, ' opacity=".5"')
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
        P('M676 326C670 292 692 268 718 268C746 268 762 292 758 326C754 352 742 372 716 374C696 374 682 358 676 326Z', 'url(#zhr)') +
        P('M680 300C670 318 666 340 670 356C674 368 684 376 696 380L700 360C690 346 684 324 686 302Z', Z.sk[2]) +
        P('M672 336C670 348 674 362 684 372', 'none', ` stroke="${Z.sk[3]}" stroke-width="2" opacity=".6"`) +
        S('M700 274C714 294 720 330 716 368M726 272C738 292 744 320 740 352M690 284C694 300 696 320 698 340', Z.hairL, 2, ' opacity=".5"') +
        P('M688 280C674 314 672 360 680 398L688 412L692 384C692 352 694 316 700 290Z', 'url(#ztp)') +
        P('M694 338C689 335 686 342 688 349C690 355 694 356 697 352Z', Z.sk[2]) +
        disc(692, 358, 2.6, Z.trim) + P('M689 361h7l1 7h-9Z', Z.trim) + P('M688 368h10l3 54q-8 4 -16 0Z', Z.hairD) + S('M693 372v46', Z.trim, 1.2) +
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
    const R = (x0, y0, x1, y1, f, op) => `<rect x="${r0(cx + ww * x0)}" y="${r0(by - hh * y1)}" width="${r0(ww * (x1 - x0))}" height="${r0(hh * (y1 - y0)) + 1}" fill="${f}"${op ? ` opacity="${op}"` : ''}/>`;
    let s = R(-0.46, 0, 0.46, 0.07, o.stone || '#ddd3c2') + R(-0.38, 0.07, 0.38, 0.36, wall);
    for (let i = 0; i < 7; i++) s += R(-0.37 + i * 0.12, 0.07, -0.355 + i * 0.12, 0.36, dark, '.45');
    s += R(-0.1, 0.07, 0.1, 0.28, '#e2b04a', '.5') + R(-0.4, 0.3, 0.4, 0.37, dark, '.55') +
      R(-0.26, 0.5, 0.26, 0.66, wall) + R(-0.26, 0.6, 0.26, 0.67, dark, '.55');
    for (let i = 0; i < 5; i++) s += R(-0.25 + i * 0.12, 0.5, -0.24 + i * 0.12, 0.66, dark, '.4');
    return s + hall(cx, by - hh * 0.34, ww, hh * 0.22, gold, edge) + hall(cx, by - hh * 0.62, ww * 0.72, hh * 0.32, gold, edge);
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
      P('M-30 -300C-80 -302 -132 -282 -152 -240C-162 -218 -164 -194 -158 -166C-150 -180 -142 -190 -132 -198C-134 -180 -132 -164 -124 -150C-116 -170 -106 -186 -94 -196C-92 -182 -86 -170 -78 -162C-72 -190 -56 -216 -40 -236C-30 -256 -26 -280 -30 -300Z', '#1b1819') +
      S('M-56 -286C-104 -276 -136 -248 -150 -206M-62 -262C-96 -246 -118 -220 -126 -186M-56 -244C-76 -226 -88 -206 -92 -188', '#5c5554', 2.5, ' opacity=".8"') +
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
        P('M900 320L180 900H420ZM900 320L620 900H760ZM900 320L1000 900H1120ZM900 320L0 560V680Z', 'url(#rays)') +
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
        lg('sky', [[0, '#8aa0c4'], [0.28, '#d2bccb'], [0.46, '#f6d0b2'], [0.6, '#ffd99c'], [1, '#f3d8b8']]) +
        glowDef('sun', '#fff1c6', 0.9) + rg('rays', [[0, '#fff6dc', 0.45], [1, '#fff6dc', 0]], 900, 320, 720, US) +
        lg('mist', [[0, '#fff6ea', 0], [0.5, '#fff4e6', 0.9], [1, '#fff6ea', 0]]) +
        lg('gold', [[0, '#ffe38e'], [0.5, '#e4aa3a'], [1, '#a8641c']]) +
        lg('bud', [[0, '#cfc5b4'], [0.6, '#f4eee2'], [1, '#fffaf0']], 0, 0, 1, 0) +
        lg('railg', [[0, '#e8dfcf'], [1, '#b9ae9b']]) +
        lg('floor', [[0, '#cfc5b4'], [1, '#9c907e']]) +
        lg('cw', [[0, '#ffffff'], [0.7, '#f1ede6'], [1, '#cfc8bd']], 1, 0, 0, 1) +
        lg('haze', [[0, '#fff3dc', 0.06], [0.5, '#fff3dc', 0], [1, '#fff3dc', 0.04]], 1, 0, 0, 0) +
        vigDef(0.32) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.08));
    },
  });

  /* =================================================================================== */
  /* 5. Celadon tea set, listing photo                                                    */
  /* =================================================================================== */
  // glaze lily mark, small, painted in deep celadon
  const lilyMark = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round">` +
    `<path d="M-14 -16C-6 -24 6 -22 10 -12"/><path d="M-2 -18C2 -26 14 -26 18 -18"/>` +
    `<path d="M10 -12C2 -14 -8 -8 -8 2L-4 -1L-1 5L3 0L7 4C9 -4 12 -10 10 -12Z" fill="${c}" fill-opacity=".85"/>` +
    `<path d="M18 -18C12 -10 14 -2 20 4L22 -1L26 3C28 -6 24 -14 18 -18Z" fill="${c}" fill-opacity=".7"/>` +
    `<path d="M-14 -16C-18 -4 -14 8 -8 16M-12 4C-20 2 -24 8 -24 12C-18 12 -14 10 -12 4Z"/></g>`;
  def('p_teaset', {
    title: 'Celadon tea set (listing photo)',
    w: 1200, h: 900, tags: ['teaset', 'celadon', 'auction', 'market', 'tonight'],
    svg: (w, h) => {
      const R = rng(1016);
      let crack = '';
      for (let i = 0; i < 26; i++) {
        let x = -140 + R() * 280, y = -110 + R() * 200;
        crack += `M${r0(x)} ${r0(y)}`;
        for (let j = 0; j < 4; j++) { x += (R() - 0.5) * 26; y += (R() - 0.5) * 22; crack += `L${r0(x)} ${r0(y)}`; }
      }
      const cup = (x, y, s, mark) => `<g transform="translate(${x} ${y}) scale(${s})">` +
        ell(4, 84, 78, 12, '#000', ' opacity=".5"') + ell(0, 96, 60, 10, '#9fbfa8', ' opacity=".12"') +
        P('M-64 0C-62 52 -32 80 0 82C32 80 62 52 64 0Z', 'url(#glz)') + ell(0, 80, 26, 6, '#6f9480') +
        ell(0, 0, 64, 16, '#a9cbb2') + ell(0, 2, 58, 13, 'url(#inr)') +
        `<ellipse cx="0" cy="0" rx="64" ry="16" fill="none" stroke="#e8f4ea" stroke-width="2.5" opacity=".9"/>` +
        P('M-48 14C-46 40 -30 62 -14 70', 'none', ' stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"') +
        (mark ? lilyMark(14, 44, 1, '#2f6f68') : '') + '</g>';
      const body =
        `<rect width="1200" height="900" fill="url(#bg)"/>` + ell(560, 380, 520, 360, 'url(#spot)') +
        // dark wood surface with grain and a sheen
        `<rect y="560" width="1200" height="340" fill="url(#wood)"/>` +
        S('M0 610Q300 600 600 612T1200 606M0 660Q320 652 640 664T1200 656M0 724Q300 716 620 728T1200 718M0 800Q340 792 660 806T1200 796M0 868Q320 860 640 874T1200 864', '#000', 3, ' opacity=".35"') +
        S('M0 634Q260 628 520 638T1200 632M0 694Q300 688 600 698T1200 690M0 762Q320 756 640 766T1200 758', '#a8714a', 2, ' opacity=".25"') +
        ell(580, 650, 520, 70, 'url(#sheen)') + `<rect y="556" width="1200" height="10" fill="#000" opacity=".4"/>` +
        // teapot
        `<g transform="translate(470 470)">` +
        ell(10, 120, 200, 26, '#000', ' opacity=".55"') + ell(0, 148, 150, 26, '#9fbfa8', ' opacity=".1"') +
        `<path d="M140 -70C240 -104 248 44 140 52" fill="none" stroke="#8fb39b" stroke-width="26" stroke-linecap="round"/>` +
        `<path d="M146 -62C222 -88 228 30 146 40" fill="none" stroke="#c5ddc9" stroke-width="8" stroke-linecap="round" opacity=".6"/>` +
        P('M-150 -50C-196 -60 -224 -96 -244 -138C-250 -150 -232 -158 -226 -148C-208 -112 -186 -88 -150 -80C-130 -70 -126 0 -140 10Z', 'url(#glz)') + ell(-236, -144, 12, 6, '#6f9480') +
        S('M-156 -60C-192 -70 -214 -100 -230 -134', '#fff', 5, ' opacity=".55"') +
        P('M-162 0C-162 -92 -92 -132 0 -132C92 -132 162 -92 162 0C162 70 102 112 0 114C-102 112 -162 70 -162 0Z', 'url(#pot)') +
        `<path d="${crack}" fill="none" stroke="#6c8f79" stroke-width=".8" opacity=".2"/>` +
        ell(0, 112, 92, 13, '#76987f') +
        ell(0, -122, 74, 17, '#a5c7ae') + P('M-70 -124C-64 -166 64 -166 70 -124Z', 'url(#pot)') + ell(0, -164, 16, 9, '#b9d5be') + disc(0, -172, 10, 'url(#glz)') +
        `<ellipse cx="0" cy="-124" rx="70" ry="15" fill="none" stroke="#6f9480" stroke-width="2"/>` +
        P('M-118 -64C-104 -100 -62 -120 -20 -122C-60 -108 -96 -90 -110 -50Z', '#fff', ' opacity=".6"') + ell(-40, -146, 22, 6, '#fff', ' opacity=".55"') +
        P('M-150 20C-140 60 -100 92 -50 104C-100 100 -146 70 -150 20Z', '#fff', ' opacity=".25"') +
        '</g>' +
        // cups (the front one turned to show its mark)
        cup(930, 560, 0.82) + cup(780, 640, 0.95) + cup(250, 690, 1) + cup(590, 726, 1.08, true) +
        // soft-box reflection + watermark
        T(1176, 880, 'FEIYUN MARKET · LOT 1016', 15, '#fff', ' text-anchor="end" letter-spacing="2" opacity=".35"');
      return wrap(w, h,
        rg('bg', [[0, '#3a3430'], [0.6, '#1c1916'], [1, '#0c0a09']], 0.47, 0.4, 0.75) +
        rg('spot', [[0, '#f4ead8', 0.22], [1, '#f4ead8', 0]]) +
        lg('wood', [[0, '#3b2416'], [0.4, '#2a170d'], [1, '#160b06']]) +
        rg('sheen', [[0, '#d9a878', 0.28], [1, '#d9a878', 0]]) +
        rg('pot', [[0, '#eef7ee'], [0.35, '#c4dfc8'], [0.75, '#98bea2'], [1, '#6f9480']], 0.36, 0.3, 0.75) +
        lg('glz', [[0, '#7fa58c'], [0.3, '#cfe5d2'], [0.6, '#a9cbb2'], [1, '#6f9480']], 0, 0, 1, 0) +
        rg('inr', [[0, '#9cc0a5'], [0.7, '#c8e0cc'], [1, '#e6f2e7']], 0.5, 0.6, 0.6) +
        vigDef(0.5) + grainDef(1.1),
        body + vig(w, h) + grain(w, h, 0.06));
    },
  });

  /* =================================================================================== */
  /* 6. Zhongli asleep at the teahouse table                                              */
  /* =================================================================================== */
  const latticeDef = (id, c, sw) => `<pattern id="${id}" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 0H60V60H0ZM30 0V18M30 42V60M0 30H18M42 30H60M18 18H42V42H18Z" fill="none" stroke="${c}" stroke-width="${sw}"/></pattern>`;
  def('p_zl_teahouse', {
    title: 'Xiansheng asleep at the teahouse',
    w: 1200, h: 900, tags: ['zhongli', 'teahouse', 'tea', 'asleep', 'afternoon'],
    svg: (w, h) => {
      const R = rng(1530);
      const Z = ZL;
      let motes = '';
      for (let i = 0; i < 26; i++) motes += disc(160 + R() * 700, 120 + R() * 560, 1.2 + R() * 2.2, '#fff4d0', 0.3 + R() * 0.5);
      const body =
        // wall, lattice window full of afternoon sun, hanging scroll
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        S('M0 120H1200M0 300H1200M0 480H1200', '#2a1a10', 3, ' opacity=".4"') +
        `<rect x="40" y="36" width="400" height="430" fill="url(#win)"/><rect x="40" y="36" width="400" height="430" fill="url(#lat)"/>` +
        `<rect x="40" y="36" width="400" height="430" fill="none" stroke="#2e1c10" stroke-width="22"/>` + `<rect x="30" y="462" width="420" height="18" fill="#3a2414"/>` +
        disc(240, 250, 330, 'url(#glow)') +
        `<rect x="900" y="40" width="170" height="400" fill="#efe2c4"/><rect x="900" y="40" width="170" height="400" fill="none" stroke="#7a5432" stroke-width="10"/>` +
        S('M920 330C960 300 1000 300 1040 250M980 300C990 280 1010 270 1020 268', '#4a3a2a', 3) + P('M1010 262c8 -8 20 -6 22 2c-6 6 -16 8 -22 -2Z', '#c6a640') + disc(1022, 262, 1.5, '#222') +
        P('M940 330q6 -8 12 0q-6 8 -12 0ZM968 310q6 -8 12 0q-6 8 -12 0Z', '#c86a6a', ' opacity=".7"') + `<rect x="890" y="30" width="190" height="12" fill="#5a3a22"/>` +
        // beam of light across the room
        P('M70 60L440 50L1200 700V900H560Z', 'url(#beam)') +
        // table
        P('M0 640H1200V900H0Z', 'url(#tbl)') + `<rect y="636" width="1200" height="8" fill="#000" opacity=".3"/>` +
        S('M0 700Q400 690 800 702T1200 696M0 780Q420 770 820 784T1200 776M0 860Q380 852 780 866T1200 858', '#1e0f07', 2.5, ' opacity=".35"') +
        // window light falling on the table, cut by the lattice
        P('M300 660L760 660L1100 900H520Z', '#ffe6a8', ' opacity=".16"') +
        S('M410 660L700 900M520 660L860 900M630 660L1000 900M330 700H800M380 770H900', '#3a2010', 14, ' opacity=".18" stroke-linecap="butt"') +
        // him: shoulders, coat front
        P('M300 640C300 540 340 470 420 456C470 446 520 440 560 440H640C700 444 770 456 820 476C880 500 900 570 900 640Z', 'url(#coat)') +
        P('M546 440L600 470L654 440L640 640H560Z', Z.coatD) + S('M546 440L590 520L596 640M654 440L612 520L606 640', Z.trim, 3) +
        `<g transform="translate(601 520)"><rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" fill="${Z.tip}" stroke="${Z.trim}" stroke-width="3"/></g>` +
        S('M420 458C470 450 520 446 548 444M652 444C700 448 760 458 816 478', Z.trim, 2.5, ' opacity=".8"') +
        S('M330 560C340 500 370 470 420 458', '#ffd79a', 4, ' opacity=".4"') +
        // collar + neck, head tilted onto his hand
        P('M560 392H636L640 450Q600 466 556 450Z', Z.sk[2]) +
        P('M548 404Q598 426 648 404L656 452Q598 474 540 452Z', Z.coatD) + S('M548 404Q598 426 648 404', Z.trim, 3) +
        `<g transform="translate(592 318) rotate(-20) scale(.95)">${zlHead(Z, true)}</g>` +
        ell(540, 360, 26, 11, '#ff8a7a', ' opacity=".16"') + ell(650, 346, 22, 10, '#ff8a7a', ' opacity=".12"') +
        // ponytail over his left shoulder, onto the table
        P('M664 400C720 410 748 470 748 540C748 600 730 650 700 690L680 708L686 680C700 630 704 580 698 530C692 480 676 440 650 420Z', 'url(#pony)') +
        S('M680 420C708 460 720 520 716 590M696 430C722 470 732 530 726 600', Z.hairL, 2, ' opacity=".5"') +
        // left arm resting on the table
        P('M820 478C870 500 896 580 900 660C880 690 820 700 760 700L600 706L596 660L760 650C800 646 820 620 826 560Z', 'url(#slv)') +
        P('M600 658L620 656L624 706L602 708Z', Z.coatD) + S('M606 658L608 708M616 657L618 707', Z.trim, 3) +
        P('M600 664C566 660 532 668 520 684C514 698 530 710 556 708C574 712 592 710 602 704Z', Z.glove) +
        S('M534 692Q554 686 576 690', '#4a4244', 2, ' opacity=".6"') +
        // right arm: upper arm down to the elbow on the table, forearm up to his cheek
        P('M330 500C304 540 296 610 312 676C330 700 372 704 392 688C392 620 400 560 420 500L400 470Z', Z.coatD) +
        P('M318 676C334 704 380 706 398 690L486 486L438 456C400 540 350 610 318 676Z', 'url(#slv)') +
        S('M330 668C370 600 410 530 446 466', '#ffd79a', 3, ' opacity=".35"') + S('M324 684C344 700 376 702 394 690', '#000', 3, ' opacity=".35"') +
        P('M434 452L490 476L478 504L422 482Z', Z.coatD) + S('M436 456L488 478M428 472L480 494', Z.trim, 3) +
        P('M472 474C462 448 468 420 488 404C504 392 524 386 540 390C556 394 560 410 552 424L544 444C552 452 550 466 538 472C520 484 492 488 472 474Z', Z.glove) +
        P('M526 392C540 386 556 392 556 404C556 414 546 420 534 418Z', '#262022') + P('M536 420C550 416 560 426 556 438C552 446 542 448 534 444Z', '#201b1c') +
        P('M532 446C544 444 552 452 548 462C544 470 534 472 526 468Z', '#1c1718') +
        S('M480 466C500 470 520 468 536 460', '#4a4244', 2.2, ' opacity=".7"') + S('M490 418Q508 404 528 400', '#6a6164', 2.5, ' opacity=".55"') +
        S('M484 414C496 398 516 390 534 392', '#7a7072', 2.5, ' opacity=".5"') +
        // tea: cup with steam, teapot, osmanthus cakes
        ell(1060, 676, 120, 26, '#000', ' opacity=".4"') + P('M968 650C962 580 1150 580 1146 650C1140 690 974 690 968 650Z', 'url(#clay)') +
        P('M970 620C940 610 924 588 916 572L928 566C938 584 950 598 972 606Z', '#5a2e1c') + ell(1058, 590, 54, 12, '#7a4028') + disc(1058, 580, 12, '#5a2e1c') +
        S('M1146 610C1186 600 1188 650 1146 656', '#5a2e1c', 12) + S('M990 620Q1010 600 1040 596', '#e0a070', 4, ' opacity=".4"') +
        ell(860, 768, 80, 18, '#000', ' opacity=".4"') + P('M804 690Q808 760 860 764Q912 760 916 690Z', 'url(#cup)') + ell(860, 690, 56, 14, '#f4efe2') + ell(860, 692, 49, 11, '#c98a3a') +
        S('M816 704Q820 744 846 756', '#fff', 4, ' opacity=".55"') +
        S('M846 676C826 640 870 616 850 576C836 548 864 520 852 488', '#fff', 9, ' opacity=".2"') + S('M876 676C864 646 896 626 880 596C870 576 888 556 882 532', '#fff', 7, ' opacity=".15"') +
        ell(190, 810, 120, 30, '#000', ' opacity=".35"') + ell(186, 800, 118, 30, '#f2ece0') + ell(186, 802, 96, 22, '#e2d8c6') +
        [[146, 792], [216, 796]].map(([x, y]) => P(`M${x - 34} ${y}Q${x - 34} ${y - 26} ${x} ${y - 28}Q${x + 34} ${y - 26} ${x + 34} ${y}Q${x} ${y + 12} ${x - 34} ${y}Z`, '#e9b45a') + ell(x, y - 18, 24, 7, '#f6cf7a') + disc(x, y - 18, 4, '#d9772a')).join('') +
        motes +
        `<rect width="1200" height="900" fill="url(#warm)" style="mix-blend-mode:soft-light"/>`;
      return wrap(w, h,
        lg('wall', [[0, '#5e3d24'], [0.6, '#43291a'], [1, '#2a170c']], 0, 0, 1, 1) +
        lg('win', [[0, '#fff9e4'], [0.6, '#ffe2a0'], [1, '#f6b860']], 0, 0, 0.6, 1) +
        latticeDef('lat', '#3a2414', 6) +
        glowDef('glow', '#ffd892', 0.5) +
        lg('beam', [[0, '#fff1c8', 0.32], [0.6, '#ffe0a0', 0.12], [1, '#ffe0a0', 0]], 0, 0, 1, 1) +
        lg('tbl', [[0, '#7a4a2a'], [0.5, '#5a321b'], [1, '#3a1e0e']], 0, 0, 1, 0.3) +
        lg('coat', [[0, ZL.coatL], [0.5, ZL.coat], [1, ZL.coatD]], 0, 0, 1, 0.6) +
        lg('slv', [[0, ZL.coatL], [1, ZL.coatD]], 0, 0, 0, 1) +
        lg('pony', [[0, ZL.hair], [0.5, ZL.hair], [0.85, ZL.tip], [1, ZL.tipL]], 0, 0, 0, 1) +
        lg('clay', [[0, '#a85c38'], [0.6, '#7a3a22'], [1, '#4a2014']], 0, 0, 0, 1) +
        lg('cup', [[0, '#c9d9c4'], [0.5, '#f4f5ee'], [1, '#a9b8a6']], 0, 0, 1, 0) +
        rg('warm', [[0, '#ffcf80', 0.8], [1, '#4a1a00', 0.5]], 0.2, 0.2, 1) +
        zlDefs(ZL) + vigDef(0.5) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.09));
    },
  });

  /* =================================================================================== */
  /* 7. Zhongli at the open window with his bird                                          */
  /* =================================================================================== */
  def('p_zl_birds', {
    title: 'Xiansheng and the bird',
    w: 1200, h: 900, tags: ['zhongli', 'bird', 'window', 'harbor'],
    svg: (w, h) => {
      const R = rng(42);
      const Z = ZL;
      let roofsNear = '', boats = '';
      [[420, 560, 220, 70], [640, 600, 260, 80], [880, 570, 230, 70], [1100, 610, 260, 80], [520, 660, 300, 90], [800, 680, 320, 90], [1080, 700, 280, 80]].forEach(([x, y, ww, hh]) => {
        roofsNear += `<rect x="${x - ww * 0.36}" y="${y - 4}" width="${ww * 0.72}" height="80" fill="#9a3a2c"/>` + hall(x, y, ww, hh, 'url(#gold)', '#ffeeb0');
      });
      for (let i = 0; i < 9; i++) {
        const x = 420 + R() * 700, y = 400 + R() * 90, s = 0.4 + (y - 400) / 160;
        boats += `<g transform="translate(${r0(x)} ${r0(y)}) scale(${s.toFixed(2)})">` + P('M-26 0H26L18 8H-18Z', '#5a3a2a') + (R() < 0.6 ? P('M-2 0V-40Q16 -26 18 -4Z', '#f2ead8') : P('M-12 0V-14H10V0Z', '#e8dcc4')) + '</g>';
      }
      const bird = `<g transform="translate(884 208) scale(.85)">` +
        P('M14 4L40 22L44 14L48 26L36 30Z', '#d9a514') +
        P('M-26 6C-30 -14 -14 -28 4 -26C20 -24 30 -10 26 6C22 20 4 26 -10 22C-20 18 -24 12 -26 6Z', 'url(#yb)') +
        P('M-4 -6C8 -14 24 -8 28 6C18 12 2 10 -4 -6Z', '#e2a816') + S('M2 -2C10 -6 18 -4 24 4M6 4C12 2 18 4 22 8', '#a8700c', 1.6) +
        disc(-13, -13, 3, '#1a1410') + disc(-12, -14, 1, '#fff') + P('M-25 -11L-34 -7L-25 -5Z', '#f08a3a') + ell(-16, -4, 5, 3, '#ffb070', ' opacity=".5"') +
        S('M-6 22l-3 8M2 22l1 8', '#c47a4a', 2) + '</g>';
      const cage = `<g transform="translate(330 0)">` +
        S('M0 388V414', '#c9a24a', 4) + `<circle cx="0" cy="382" r="9" fill="none" stroke="#c9a24a" stroke-width="4"/>` +
        P('M-92 480C-92 440 -50 414 0 414C50 414 92 440 92 480Z', 'url(#bamboo)') +
        S('M-92 480C-92 440 -50 414 0 414C50 414 92 440 92 480', '#6a4a22', 3) +
        `<path d="M-84 480V634M-60 470V640M-36 462V644M-12 458V646M12 458V646M36 462V644M60 470V640M84 480V634" stroke="#a87a3a" stroke-width="3.5" fill="none"/>` +
        `<path d="M-60 470Q-40 430 0 418M60 470Q40 430 0 418M-36 462Q-20 432 0 418M36 462Q20 432 0 418" stroke="#8a5e2a" stroke-width="3" fill="none"/>` +
        `<rect x="-96" y="478" width="192" height="10" rx="3" fill="#7a5226"/><rect x="-100" y="632" width="200" height="22" rx="4" fill="url(#bamboo)"/>` +
        S('M-70 590H70', '#7a5226', 4) + S('M-24 534L18 528', '#c9a24a', 3) +
        P('M40 540L84 532V600L40 604Z', 'none', ' stroke="#a87a3a" stroke-width="3"') +
        S('M0 654V690', '#b3261e', 5) + P('M-8 690H8L12 740Q0 748 -12 740Z', '#c42d22') +
        S('M-92 480V634', '#fff1c8', 2, ' opacity=".35"') + '</g>';
      const fig =
        // left arm holding the cage up
        P('M452 352C420 380 396 430 392 486C398 500 418 502 428 490C432 446 446 410 470 384Z', 'url(#coat)') +
        P('M392 486C380 452 360 420 346 400L366 386C384 410 406 444 426 486Z', 'url(#coat)') + S('M346 400L366 386', Z.trim, 6) +
        P('M346 400C334 396 322 388 322 378C324 368 336 366 344 372L362 386Z', Z.glove) +
        // back
        P('M512 316C480 324 452 336 440 356C432 450 446 560 468 660L470 900H660L662 660C684 560 700 450 690 356C680 338 650 324 618 316Z', 'url(#coat)') +
        S('M565 340V900', '#000', 3, ' opacity=".25"') +
        S('M446 360C470 352 500 350 520 352M684 360C660 352 630 350 610 352', Z.trim, 3) +
        P('M462 640Q565 656 668 640V668Q565 684 462 668Z', Z.coatD) + S('M462 640Q565 656 668 640M462 668Q565 684 668 668', Z.trim, 3) +
        `<g transform="translate(565 655)"><rect x="-14" y="-14" width="28" height="28" transform="rotate(45)" fill="${Z.coatD}" stroke="${Z.trim}" stroke-width="3"/><rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="${Z.tip}"/></g>` +
        S('M468 672L476 900M662 672L656 900M565 690V900', Z.trim, 3, ' opacity=".85"') +
        // right arm raised to the bird
        P('M680 354C720 352 760 342 792 326L812 352C780 376 736 392 690 396Z', 'url(#coat)') +
        P('M792 326C812 300 830 268 846 240L868 252C856 284 836 320 812 352Z', 'url(#coat)') + S('M846 240L868 252', Z.trim, 6) +
        P('M848 238C852 224 862 214 874 214L900 214C906 216 906 222 900 224L878 226C876 236 868 246 858 250Z', Z.glove) +
        // collar, head (turned a little to the bird), earring
        P('M528 296Q565 308 604 296L610 330Q565 342 520 330Z', Z.coatD) + S('M528 296Q565 308 604 296', Z.trim, 3) +
        P('M600 236C612 252 614 272 606 290L592 300C598 280 598 258 592 240Z', Z.sk[2]) +
        P('M508 236C502 186 530 158 564 158C600 158 624 186 618 236C614 272 596 300 564 302C534 302 514 280 508 236Z', 'url(#zhr)') +
        S('M548 166C540 200 540 250 548 296M574 164C584 200 586 250 580 296M530 180C522 210 520 250 528 286M598 176C606 206 608 240 600 276', Z.hairL, 2.4, ' opacity=".5"') +
        P('M512 214C504 250 508 290 520 320L528 334L530 300C528 270 528 240 532 216Z', 'url(#ztp)') +
        disc(516, 274, 3, Z.trim) + P('M512 278h8l1 9h-10Z', Z.trim) + P('M511 287h11l4 66q-10 5 -19 0Z', Z.hairD) + S('M516 292v58', Z.trim, 1.3) +
        // ponytail
        P('M552 298C584 300 594 340 594 400C594 500 588 600 580 700L572 740L560 700C548 600 540 500 540 400C540 340 542 304 552 298Z', 'url(#pony)') +
        `<rect x="546" y="296" width="40" height="12" rx="5" fill="${Z.coatD}"/><rect x="546" y="300" width="40" height="3" fill="${Z.trim}"/>` +
        S('M558 320C564 420 566 520 562 640M576 322C582 420 582 520 574 640', Z.hairL, 2, ' opacity=".45"') +
        // backlight rim
        S('M612 196C620 220 618 250 610 276M690 360C700 450 686 560 664 660M684 356C720 354 762 344 794 328M796 326C814 300 832 268 848 240', '#fff4d6', 3.5, ' opacity=".7"') +
        S('M512 200C506 230 510 262 520 290M440 360C434 450 446 560 466 660', '#fff4d6', 3, ' opacity=".45"');
      const body =
        // the view: sky, cliffs, sea and harbor
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        streak(600, 140, 500, 26, '#ffffff', 0.7) + streak(980, 200, 380, 18, '#ffffff', 0.6) +
        karst(980, 380, 90, 200, '#8fa8b8') + karst(1060, 380, 120, 260, '#86a0b2') + karst(1140, 380, 90, 180, '#93acbb') + karst(470, 380, 100, 150, '#93acbb') +
        `<rect y="376" width="1200" height="300" fill="url(#sea)"/>` + S('M360 378H1150', '#fff', 2, ' opacity=".5"') +
        `<path d="M400 420h40M520 452h60M700 430h50M860 470h70M980 440h40M640 500h60" stroke="#e8fbff" stroke-width="2" opacity=".6"/>` +
        boats +
        P('M380 520L560 500L720 520L920 504L1150 520V700H380Z', '#7a5a46') + roofsNear +
        disc(760, 300, 420, 'url(#day)') +
        // interior wall around the opening, frame, opened lattice shutters
        P('M0 0H1200V900H0ZM360 70V650H1150V70Z', 'url(#wall)', ' fill-rule="evenodd"') +
        `<rect x="360" y="70" width="790" height="580" fill="none" stroke="#24160d" stroke-width="18"/>` +
        P('M350 640H1160L1180 680H330Z', '#4a3020') + P('M350 640H1160L1164 648H346Z', '#ffe9b8', ' opacity=".6"') +
        P('M352 66L270 30V720L352 660Z', '#3a2618') + P('M352 66L270 30V720L352 660Z', 'url(#lat)', ' opacity=".9"') +
        P('M1158 66L1200 46V700L1158 660Z', '#3a2618') +
        // a potted orchid on the sill
        P('M1036 600H1100L1092 644H1044Z', '#e8e2d6') + S('M1068 600C1060 560 1040 540 1010 530M1068 600C1080 556 1100 540 1130 534M1068 600C1066 560 1070 530 1078 500', '#4f7a3a', 4) +
        disc(1076, 498, 7, '#f4eef8') + disc(1012, 528, 6, '#f4eef8') +
        // floor light
        P('M300 900L380 680H1160L1200 760V900Z', '#ffe7b0', ' opacity=".08"') +
        cage + fig + bird +
        `<rect width="1200" height="900" fill="url(#bloom)"/>`;
      return wrap(w, h,
        lg('sky', [[0, '#7fb2df'], [0.5, '#b8d8ef'], [1, '#e9f2f4']], 0, 0, 0, 0.45) +
        lg('sea', [[0, '#5fa7b0'], [0.5, '#3a8a97'], [1, '#2b6f7c']]) +
        rg('day', [[0, '#fff', 0.35], [1, '#fff', 0]]) +
        lg('gold', [[0, '#ffe08a'], [0.5, '#e2a838'], [1, '#a8641c']]) +
        lg('wall', [[0, '#3a281c'], [0.5, '#2a1b12'], [1, '#160d08']], 0, 0, 1, 1) +
        latticeDef('lat', '#1e120a', 5) +
        lg('coat', [[0, '#2a1c14'], [0.5, ZL.coat], [1, '#5c4232']], 0, 0, 1, 0) +
        lg('pony', [[0, ZL.hair], [0.55, ZL.hair], [0.85, ZL.tip], [1, ZL.tipL]], 0, 0, 0, 1) +
        lg('bamboo', [[0, '#d9b071'], [0.5, '#b88a48'], [1, '#7a5226']], 0, 0, 1, 0) +
        rg('yb', [[0, '#fff27a'], [0.6, '#ffd21e'], [1, '#e6a210']], 0.4, 0.3, 0.7) +
        rg('bloom', [[0, '#fff6dc', 0.18], [0.6, '#fff6dc', 0], [1, '#000', 0.25]], 0.65, 0.35, 0.8) +
        zlDefs(ZL) + vigDef(0.45) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.08));
    },
  });

  /* =================================================================================== */
  /* 8. Two opera tickets for Yun Jin's matinee                                           */
  /* =================================================================================== */
  def('p_zl_opera_tickets', {
    title: 'Opera tickets, Heyu Tea House',
    w: 1200, h: 900, tags: ['opera', 'tickets', 'yunjin', 'heyu', 'zhongli'],
    svg: (w, h) => {
      const R = rng(1500);
      const G = '#e9c46a';
      const scroll = (x, y, sx, sy) => `<path transform="translate(${x} ${y}) scale(${sx} ${sy})" d="M0 26C0 10 10 0 26 0M8 30C8 18 16 10 28 10C34 10 38 14 38 20C38 26 32 28 28 24M30 0C42 0 50 8 50 18" fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round"/>`;
      const ticket = (seat, no) =>
        `<path d="M0 0H440A16 16 0 0 0 472 0H600V250H472A16 16 0 0 0 440 250H0Z" fill="url(#red)"/>` +
        `<path d="M0 0H440A16 16 0 0 0 472 0H600V250H472A16 16 0 0 0 440 250H0Z" fill="url(#dam)" opacity=".5"/>` +
        `<rect x="12" y="12" width="420" height="226" fill="none" stroke="${G}" stroke-width="3"/><rect x="20" y="20" width="404" height="210" fill="none" stroke="${G}" stroke-width="1.2"/>` +
        `<rect x="480" y="12" width="108" height="226" fill="none" stroke="${G}" stroke-width="2"/>` +
        scroll(24, 24, 1, 1) + scroll(420, 24, -1, 1) + scroll(24, 226, 1, -1) + scroll(420, 226, -1, -1) +
        `<path d="M456 18V232" stroke="#f3d78e" stroke-width="2.5" stroke-dasharray="2 7" opacity=".9"/>` +
        `<text x="48" y="74" font-family="${SERIF}" font-size="21" letter-spacing="5" fill="${G}">HEYU TEA HOUSE</text>` +
        `<text x="46" y="148" font-family="${SERIF}" font-size="54" font-weight="700" letter-spacing="2" fill="url(#foil)">YUN JIN</text>` +
        `<path d="M48 166H300" stroke="${G}" stroke-width="1.5"/>` +
        `<text x="48" y="204" font-family="${SERIF}" font-size="22" letter-spacing="3" fill="${G}">SAT 15:00 · BOX 2</text>` +
        // emblem: plumed headdress in a roundel
        `<g transform="translate(366 118) scale(.86)"><circle r="54" fill="#8e1715" stroke="${G}" stroke-width="2.5"/><circle r="46" fill="none" stroke="${G}" stroke-width="1"/>` +
        `<path d="M-6 10C-30 -10 -30 -40 -14 -52M6 10C30 -10 30 -40 14 -52" fill="none" stroke="${G}" stroke-width="3" stroke-linecap="round"/>` +
        `<path d="M-22 18Q0 0 22 18Q0 30 -22 18Z" fill="${G}"/><circle cx="0" cy="4" r="7" fill="${G}"/><circle cx="-24" cy="10" r="5" fill="#f3d78e"/><circle cx="24" cy="10" r="5" fill="#f3d78e"/></g>` +
        `<text x="534" y="58" font-family="${SERIF}" font-size="13" letter-spacing="3" fill="${G}" text-anchor="middle">ADMIT ONE</text>` +
        `<text x="534" y="128" font-family="${SERIF}" font-size="34" font-weight="700" fill="url(#foil)" text-anchor="middle">BOX 2</text>` +
        `<text x="534" y="166" font-family="${SERIF}" font-size="18" letter-spacing="2" fill="${G}" text-anchor="middle">SEAT ${seat}</text>` +
        `<text x="534" y="214" font-family="${FONT}" font-size="12" letter-spacing="2" fill="#f3d78e" text-anchor="middle" opacity=".8">No. ${no}</text>` +
        `<path d="M0 0H600V250H0Z" fill="url(#shine)"/>`;
      let petals = '';
      for (let i = 0; i < 14; i++) petals += disc(R() * 1200, 600 + R() * 300, 3 + R() * 3, R() < 0.5 ? '#f2a640' : '#e88a2a', 0.85);
      const body =
        `<rect width="1200" height="900" fill="url(#cloth)"/>` + `<rect width="1200" height="900" fill="url(#weave)" opacity=".3"/>` +
        ell(560, 420, 700, 520, 'url(#light)') +
        // teacup in the corner
        ell(1090, 120, 150, 96, '#5a3a20', ' opacity=".18"') + ell(1070, 96, 130, 84, '#c8dccd') + ell(1070, 92, 110, 70, 'url(#tea)') + ell(1040, 70, 30, 10, '#fff', ' opacity=".4"') +
        `<ellipse cx="1070" cy="96" rx="130" ry="84" fill="none" stroke="#eef6ef" stroke-width="4"/>` +
        // osmanthus sprig
        S('M40 820C120 780 200 770 300 740M150 784C170 760 200 750 230 748', '#5a4a2a', 4) +
        P('M210 760C230 730 270 726 290 736C270 756 240 764 210 760ZM120 796C130 770 160 760 180 764C168 786 144 798 120 796Z', '#4f7a3a') +
        [[240, 742], [258, 752], [290, 740], [196, 770], [176, 778], [304, 734], [272, 760]].map(([x, y]) => disc(x, y, 6, '#f0a03a') + disc(x, y, 2.5, '#ffd27a')).join('') +
        petals +
        // the two tickets
        `<g transform="translate(150 150) rotate(-7)"><rect x="12" y="18" width="600" height="250" fill="#3a1a0a" opacity=".22"/><rect x="6" y="9" width="600" height="250" fill="#3a1a0a" opacity=".18"/>${ticket(1, '071820')}</g>` +
        `<g transform="translate(330 420) rotate(5)"><rect x="14" y="20" width="600" height="250" fill="#3a1a0a" opacity=".22"/><rect x="7" y="10" width="600" height="250" fill="#3a1a0a" opacity=".18"/>${ticket(2, '071821')}</g>`;
      return wrap(w, h,
        lg('cloth', [[0, '#f4ecdc'], [1, '#e2d4bb']], 0, 0, 1, 1) +
        `<pattern id="weave" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M40 8C56 24 56 56 40 72C24 56 24 24 40 8ZM0 40C16 24 24 40 40 40M80 40C64 56 56 40 40 40" fill="none" stroke="#cdbb98" stroke-width="2"/></pattern>` +
        rg('light', [[0, '#fff8e8', 0.6], [1, '#fff8e8', 0]]) +
        rg('tea', [[0, '#e8c070'], [0.8, '#b98234'], [1, '#8a5a1c']]) +
        lg('red', [[0, '#c72a22'], [0.5, '#a91d19'], [1, '#7e1210']], 0, 0, 1, 1) +
        `<pattern id="dam" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M20 4C28 12 28 28 20 36C12 28 12 12 20 4Z" fill="none" stroke="#e05040" stroke-width="1.2"/></pattern>` +
        lg('foil', [[0, '#fff0b0'], [0.45, '#e9c46a'], [0.55, '#c99a3a'], [1, '#f3d78e']], 0, 0, 1, 1) +
        lg('shine', [[0, '#fff', 0], [0.42, '#fff', 0], [0.5, '#fff', 0.14], [0.58, '#fff', 0], [1, '#fff', 0]], 0, 0, 1, 1) +
        vigDef(0.35) + grainDef(1.2),
        body + vig(w, h) + grain(w, h, 0.07));
    },
  });

  /* =================================================================================== */
  /* 9. Glaze lilies, macro, morning dew                                                  */
  /* =================================================================================== */
  // lanceolate petal from base b to tip t with half-width wd
  const petal = (bx, by, tx, ty, wd, fill, ex = '') => {
    const dx = tx - bx, dy = ty - by, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const c = (k, n) => `${r0(bx + dx * k + nx * n)} ${r0(by + dy * k + ny * n)}`;
    return P(`M${r0(bx)} ${r0(by)}C${c(0.35, wd)} ${c(0.8, wd * 0.9)} ${r0(tx)} ${r0(ty)}C${c(0.8, -wd * 0.7)} ${c(0.35, -wd)} ${r0(bx)} ${r0(by)}Z`, fill, ex);
  };
  const lily = (x, y, s, op = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}">` +
    disc(0, 30, 120, 'url(#lglow)') +
    petal(0, -96, -72, 40, 30, 'url(#pB)') + petal(0, -96, 0, 52, 34, 'url(#pB)') + petal(0, -96, 74, 38, 30, 'url(#pB)') +
    S('M-2 -40L-22 112M0 -40L2 124M2 -40L22 110', '#e6eefa', 1.6) + ell(-22, 114, 4, 7, '#f2d27a') + ell(2, 126, 4, 7, '#f2d27a') + ell(22, 112, 4, 7, '#f2d27a') +
    petal(0, -98, -100, 54, 34, 'url(#pF)') + petal(0, -98, 104, 50, 32, 'url(#pF)') + petal(0, -98, -34, 82, 36, 'url(#pF)') + petal(0, -98, 42, 84, 36, 'url(#pF)') +
    S('M-100 54q-14 4 -18 -8M104 50q14 4 18 -8M-34 82q-8 10 -18 4M42 84q8 10 18 4', '#d9e7fb', 4) +
    S('M0 -90C-20 -40 -30 20 -32 74M0 -90C14 -40 26 20 40 76M-4 -90C-40 -40 -70 10 -96 50M4 -90C40 -40 74 10 100 46', '#7f9fd0', 1.5, ' opacity=".55"') +
    P('M-14 -96C-12 -112 12 -112 14 -96C10 -88 -10 -88 -14 -96Z', '#6f9a6a') + '</g>';
  const dew = (x, y, r) => disc(x, y, r, 'url(#dw)') + `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#3a5a8a" stroke-width="1" opacity=".35"/>` +
    disc(x - r * 0.35, y - r * 0.4, r * 0.28, '#fff') + P(`M${r0(x - r * 0.6)} ${r0(y + r * 0.4)}Q${x} ${r0(y + r * 0.9)} ${r0(x + r * 0.6)} ${r0(y + r * 0.4)}`, 'none', ' stroke="#fff" stroke-width="1.5" opacity=".7"');
  def('p_glaze_lily', {
    title: 'Glaze lilies, morning',
    w: 1200, h: 900, tags: ['glaze lily', 'flowers', 'zhongli', 'guizhong', 'mountains'],
    svg: (w, h) => {
      const R = rng(318);
      let bk = '';
      for (let i = 0; i < 14; i++) bk += disc(R() * 1200, R() * 600, 20 + R() * 50, 'url(#bk)', 0.2 + R() * 0.4);
      const blob = (x, y, rx, ry, c) => ell(x, y, rx, ry, c);
      const body =
        `<rect width="1200" height="900" fill="url(#sky)"/>` + disc(260, 140, 420, 'url(#sun)') +
        // out-of-focus mountains
        blob(160, 640, 300, 240, 'url(#m1)') + blob(460, 600, 260, 300, 'url(#m1)') + blob(780, 660, 320, 230, 'url(#m1)') + blob(1080, 590, 260, 320, 'url(#m1)') +
        blob(300, 820, 420, 200, 'url(#m2)') + blob(900, 840, 480, 220, 'url(#m2)') +
        `<rect y="520" width="1200" height="140" fill="url(#mist)"/>` + bk +
        // a blurred leaf and bud in the foreground
        P('M1200 380C1120 470 1040 640 1010 900H1090C1100 700 1140 540 1200 470Z', 'url(#blur)') + P('M0 640C80 700 150 800 170 900H90C80 820 50 740 0 700Z', 'url(#blur)') +
        lily(330, 330, 0.9, 0.55) + lily(950, 210, 0.7, 0.4) +
        // stem arching over, leaves
        S('M520 900C530 700 540 420 590 280C612 220 650 214 676 240C690 254 690 266 684 276', '#4f7f52', 9) +
        S('M590 300C560 260 470 240 380 250', '#4f7f52', 6, ' opacity=".7"') + S('M640 230C700 180 820 160 920 170', '#4f7f52', 5, ' opacity=".5"') +
        P('M520 900C500 760 430 640 330 560C430 610 520 700 560 900Z', 'url(#leaf)') + P('M560 900C590 740 660 640 760 590C680 660 610 760 600 900Z', 'url(#leaf)') +
        S('M520 880C496 760 440 660 360 584', '#a8d4a0', 2, ' opacity=".5"') +
        // the lily in focus
        lily(684, 380, 1.55) +
        dew(612, 404, 9) + dew(742, 440, 7) + dew(700, 470, 11) + dew(560, 462, 6) + dew(796, 404, 6) + dew(640, 506, 8) + dew(470, 700, 10) + dew(540, 760, 7) +
        disc(686, 586, 9, 'url(#dw)') + S('M686 566V577', '#e6eefa', 1.2, ' opacity=".7"');
      return wrap(w, h,
        lg('sky', [[0, '#b9d0ea'], [0.5, '#e6eef4'], [1, '#f3efe6']]) + glowDef('sun', '#fff6dc', 0.9) +
        rg('m1', [[0, '#8fa2c8', 0.9], [0.6, '#9aaccd', 0.55], [1, '#a9b8d4', 0]]) +
        rg('m2', [[0, '#5f7896', 0.9], [0.6, '#6f86a2', 0.5], [1, '#7a90aa', 0]]) +
        lg('mist', [[0, '#f4f2ee', 0], [0.5, '#f4f2ee', 0.6], [1, '#f4f2ee', 0]]) + bokehDef('bk', '#ffffff') +
        lg('pF', [[0, '#c7d9f4'], [0.45, '#f4f8ff'], [1, '#ffffff']], 0, 0, 0, 1) +
        lg('pB', [[0, '#93afd8'], [1, '#c9daf2']], 0, 0, 0, 1) +
        rg('lglow', [[0, '#e8f2ff', 0.7], [1, '#e8f2ff', 0]]) +
        lg('leaf', [[0, '#7fb07a'], [1, '#2f6a4a']], 0, 0, 1, 1) + lg('blur', [[0, '#3f7a5a', 0], [0.4, '#3f7a5a', 0.45], [1, '#2a5a44', 0.6]], 0, 0, 0, 1) +
        rg('dw', [[0, '#ffffff', 0.25], [0.7, '#cfe0f5', 0.35], [1, '#ffffff', 0.85]], 0.4, 0.35, 0.6) +
        vigDef(0.3) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.07));
    },
  });

  /* =================================================================================== */
  /* 10. Liyue Harbor by day, from a high terrace                                         */
  /* =================================================================================== */
  const junk = (x, y, s, sail = '#f3e6cc', hull = '#6a3a24') => `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-60 0H64L52 16H-48Z', hull) + P('M-60 0L-70 -10H-54ZM64 0L74 -12H58Z', hull) +
    P('M-30 -2V-96Q-6 -80 0 -4Z', sail) + P('M6 -2V-120Q34 -100 40 -4Z', sail) + P('M-52 -2V-56Q-40 -46 -36 -4Z', sail) +
    (s >= 0.4 ? S('M-30 -80H-4M-30 -60H-2M-30 -40H0M6 -100H32M6 -76H36M6 -52H38M6 -28H40', '#b8a080', 2, ' opacity=".6"') : '') + '</g>';
  def('p_harbor_day', {
    title: 'Liyue Harbor from the terrace',
    w: 1200, h: 900, tags: ['liyue', 'harbor', 'day', 'boats', 'city'],
    svg: (w, h) => {
      const R = rng(2026);
      const HZ = 340;
      // rooftops in tiers, back to front
      let city = `<rect y="630" width="1200" height="200" fill="#6a2a1e"/>`;
      [[640, 92, 0.5], [690, 130, 0.75], [770, 190, 1.1]].forEach(([y, ww, k], row) => {
        let walls = '';
        for (let x = -30 + R() * 50 + row * 40; x < 1260; x += ww * (1 + R() * 0.3)) {
          const wv = ww * (0.85 + R() * 0.3), hv = wv * 0.3;
          walls += `M${r0(x - wv * 0.36)} ${y - 2}h${r0(wv * 0.72)}v${r0(70 * k + 30)}h${r0(-wv * 0.72)}Z`;
          city += `<path d="${walls}" fill="${row % 2 ? '#a5382a' : '#b84a34'}"/>` + hall(x, y, wv, hv, R() < 0.78 ? 'url(#gold)' : 'url(#jade)', row ? '#fff0b8' : 0, row < 2);
          walls = '';
        }
      });
      let crowd = '', heads = '', crates = '';
      for (let i = 0; i < 44; i++) {
        const x = r0(40 + R() * 1120), y = r0(620 - x * 0.05 + R() * 14 - 7);
        crowd += `M${x} ${y - 8}h3v7h-3Z`; heads += `M${x} ${y - 12}h3v3h-3Z`;
      }
      for (let i = 0; i < 4; i++) {
        let d = '';
        for (let j = 0; j < 6; j++) { const x = r0(60 + R() * 1100), y = r0(608 - x * 0.05 + R() * 6); d += `M${x} ${y}h${r0(10 + R() * 14)}v${r0(8 + R() * 6)}h-${r0(10 + R() * 14)}Z`; }
        crates += `<path d="${d}" fill="${['#c98a3a', '#3a6a8a', '#7a9a4a', '#a8442a'][i]}"/>`;
      }
      crowd = `<path d="${crowd}" fill="#2a3048"/><path d="${heads}" fill="#e8c8a8"/>`;
      let piers = '', boats = '';
      [120, 330, 540, 760, 980].forEach((x, i) => {
        const y = 616 - x * 0.05;
        piers += P(`M${x} ${y}L${x + 14} ${y - 60}H${x + 46}L${x + 40} ${y}Z`, '#8a6a4a') + S(`M${x + 6} ${y - 20}H${x + 42}M${x + 10} ${y - 40}H${x + 44}`, '#5a3a22', 2);
        boats += junk(x + 76, y - 24, 0.3 + (i % 2) * 0.06, i % 2 ? '#e8d4b0' : '#f3e6cc');
      });
      let waves = '';
      for (let i = 0; i < 32; i++) { const y = HZ + 8 + R() * 260; waves += `M${r0(R() * 1200)} ${r0(y)}h${r0(8 + (y - HZ) * 0.15)}`; }
      const body =
        `<rect width="1200" height="${HZ + 2}" fill="url(#sky)"/>` +
        cloud(220, 120, 1.4, 'url(#cw)') + cloud(560, 70, 1.1, 'url(#cw)', 0.9) + cloud(760, 200, 0.9, 'url(#cw)', 0.85) + cloud(120, 250, 0.7, 'url(#cw)', 0.8) +
        // far islands, sea
        P(`M0 ${HZ}Q40 ${HZ - 18} 90 ${HZ - 10}Q130 ${HZ - 26} 170 ${HZ}Z`, '#8aa6b0') + P(`M300 ${HZ}Q330 ${HZ - 10} 370 ${HZ}Z`, '#97b0b8') +
        `<rect y="${HZ}" width="1200" height="320" fill="url(#sea)"/>` + `<path d="${waves}" stroke="#e8fbff" stroke-width="2" opacity=".45"/>` +
        // great cliffs on the right
        karst(880, 460, 150, 300, '#93a3a4') + karst(1000, 470, 190, 420, '#8a9c9a', '#6f8f6a') + karst(1130, 480, 170, 360, '#7f938e', '#5f8a5a') +
        S('M960 170v260M1010 120v320M1060 160v260M1110 200v240M1160 220v220', '#bfcac6', 4, ' opacity=".3"') +
        karst(1180, 560, 160, 240, '#6c8078', '#4f7a4a') +
        P('M840 470Q1000 440 1200 470V560Q1000 540 840 520Z', '#5f7f6a', ' opacity=".6"') +
        // ships out at sea
        junk(420, 440, 0.9, '#c8402c', '#4a2a1a') + junk(640, 400, 0.45) + junk(250, 392, 0.35) + junk(780, 380, 0.3) + junk(150, 470, 0.5) +
        // quay, piers, boats, crowd
        piers + boats +
        P('M-10 626L1210 566V600L-10 666Z', '#b9a98e') + P('M-10 626L1210 566V572L-10 632Z', '#e2d6bd') + crates + crowd +
        // cargo crane
        S('M700 590L712 500L770 470M712 500L700 470', '#5a3a24', 4) + S('M770 470V520', '#3a2a1a', 1.5) + `<rect x="762" y="520" width="16" height="10" fill="#c98a3a"/>` +
        city +
        // foreground: terrace parapet, red pillar, eave with lantern
        P('M0 820H1200V900H0Z', 'url(#par)') + `<rect y="812" width="1200" height="14" fill="#f3e6c8"/>` +
        [60, 260, 460, 660, 860, 1060].map((x) => `<rect x="${x}" y="826" width="70" height="74" fill="#8a2a1e" opacity=".55"/><path d="M${x + 10} 846h50M${x + 10} 880h50" stroke="#d9b25b" stroke-width="2"/>`).join('') +
        `<rect x="0" y="0" width="96" height="900" fill="url(#pil)"/><rect x="0" y="120" width="96" height="22" fill="#d9b25b"/><rect x="0" y="700" width="96" height="22" fill="#d9b25b"/>` +
        P('M0 0H560L520 26Q300 40 0 70Z', '#3a2016') + P('M0 70Q300 40 520 26L540 34Q300 52 0 82Z', '#d9b25b') +
        S('M300 44V110', '#2a1a10', 3) + P('M272 110H328L338 150Q300 196 262 150Z', 'url(#lan)') + S('M276 120Q300 112 324 120M268 140Q300 132 332 140', '#8a1a12', 2) +
        `<rect x="290" y="166" width="20" height="8" fill="#d9b25b"/>` + S('M300 174V220', '#c42d22', 4) +
        `<rect width="1200" height="900" fill="url(#air)"/>`;
      return wrap(w, h,
        lg('sky', [[0, '#5f9ad6'], [0.6, '#a8cdea'], [1, '#e0eef4']]) +
        lg('cw', [[0, '#ffffff'], [0.7, '#f2f6fa'], [1, '#c9d6e2']]) +
        lg('sea', [[0, '#7cb8c0'], [0.3, '#3f9aa6'], [1, '#2a7a88']]) +
        lg('gold', [[0, '#ffe38e'], [0.5, '#e4aa3a'], [1, '#a8641c']]) + lg('jade', [[0, '#9fe0c0'], [0.5, '#3fa080'], [1, '#1f6a52']]) +
        lg('par', [[0, '#c9473a'], [1, '#7e1e16']]) + lg('pil', [[0, '#7e1e16'], [0.5, '#c9473a'], [1, '#8a2418']], 0, 0, 1, 0) +
        rg('lan', [[0, '#ff9a5a'], [0.6, '#e0402c'], [1, '#a01e14']], 0.4, 0.4, 0.7) +
        lg('air', [[0, '#fff', 0], [0.5, '#e8f2f8', 0.12], [1, '#fff', 0]]) +
        vigDef(0.35) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.07));
    },
  });

  /* =================================================================================== */
  /* 11. Yujing Terrace: white lanterns lit for the Rite of Parting                       */
  /* =================================================================================== */
  // mourner in white, feet at x,y, height hh; c = rim colour
  const mourner = (x, y, hh, flip, face, c = '#ffe2b0') => {
    const k = hh / 160, f = flip ? -1 : 1;
    return `<g transform="translate(${r0(x)} ${r0(y)}) scale(${(k * f).toFixed(3)} ${k.toFixed(3)})">` +
      ell(0, 0, 34, 6, '#000', ' opacity=".3"') +
      P('M-26 0C-24 -50 -20 -100 -16 -122C-8 -130 8 -130 16 -122C22 -100 26 -50 28 0Z', 'url(#robe)') +
      P('M-16 -122C-30 -110 -36 -80 -34 -56L-24 -54C-24 -80 -20 -100 -12 -112Z', '#dfe3ec') +
      S('M16 -122C22 -100 26 -50 28 0', c, 3, ' opacity=".7"') +
      disc(0, -140, 15, '#2a2226') + (face ? P('M2 -154C14 -152 20 -142 18 -132C16 -126 8 -124 2 -126Z', '#e9c6ae') : '') + P('M-15 -146Q0 -160 15 -146V-140H-15Z', '#f4f4f6') + S('M12 -144L22 -120', '#f4f4f6', 4) + '</g>';
  };
  def('p_yujing_lanterns', {
    title: 'Lanterns on Yujing Terrace',
    w: 1200, h: 900, tags: ['yujing', 'lanterns', 'rite', 'evening', 'funeral'],
    svg: (w, h) => {
      const R = rng(1018);
      const VX = 600, VY = 450;
      const Z = [1.15, 1.6, 2.2, 3.1, 4.4, 6.2, 8.8, 12.5];
      let stars = '';
      for (let i = 0; i < 40; i++) stars += disc(R() * 1200, R() * 260, 0.8 + R() * 1.4, '#fff', 0.3 + R() * 0.6);
      let tiles = '';
      for (let i = -10; i <= 10; i++) tiles += `M${VX} ${VY}L${VX + i * 150} 900`;
      Z.forEach((z) => (tiles += `M${r0(VX - 700 / z)} ${r0(VY + 450 / z)}H${r0(VX + 700 / z)}`));
      // lantern posts both sides; a few on the right not lit yet
      let posts = '', glows = '';
      Z.slice().reverse().forEach((z, i) => {
        [-1, 1].forEach((side) => {
          const x = VX + side * 600 / z, by = VY + 450 / z, ph = 340 / z, r = 34 / z;
          const lit = !(side === 1 && z < 2);
          const lx = x - side * 26 / z, ly = by - ph + 40 / z;
          posts += `<rect x="${r0(x - 5 / z)}" y="${r0(by - ph)}" width="${Math.max(1, r0(10 / z))}" height="${r0(ph)}" fill="#1c1a24"/>` +
            S(`M${r0(x)} ${r0(by - ph + 4 / z)}H${r0(lx)}V${r0(ly - r * 1.1)}`, '#1c1a24', Math.max(1, 4 / z));
          if (lit) glows += disc(lx, ly, r * 4, 'url(#lg)') + ell(lx, by + 8 / z, r * 3, r * 0.6, 'url(#fl)');
          posts += ell(lx, ly, r * 0.9, r, lit ? 'url(#lit)' : '#d8dce6') +
            `<ellipse cx="${r0(lx)}" cy="${r0(ly)}" rx="${(r * 0.45).toFixed(1)}" ry="${r0(r)}" fill="none" stroke="${lit ? '#e0b070' : '#aab0c0'}" stroke-width="${Math.max(0.6, 1.6 / z).toFixed(1)}" opacity=".7"/>` +
            `<rect x="${r0(lx - r * 0.4)}" y="${r0(ly - r * 1.1)}" width="${r0(r * 0.8)}" height="${Math.max(1, r0(r * 0.2))}" fill="#2a2630"/>` +
            `<rect x="${r0(lx - r * 0.4)}" y="${r0(ly + r * 0.92)}" width="${r0(r * 0.8)}" height="${Math.max(1, r0(r * 0.2))}" fill="#2a2630"/>` +
            S(`M${r0(lx)} ${r0(ly + r * 1.1)}V${r0(ly + r * 1.9)}`, '#f2f2f4', Math.max(1, 3 / z), ' opacity=".8"');
        });
      });
      const body =
        `<rect width="1200" height="${VY + 4}" fill="url(#sky)"/>` + stars +
        // distant hills, the sea, the hall at the far end
        P(`M0 ${VY}V330C80 300 140 320 200 290C260 260 320 300 380 330L460 ${VY}Z`, '#2a2a48') +
        P(`M740 ${VY}L820 340C880 300 940 270 1000 290C1060 310 1120 280 1200 300V${VY}Z`, '#2a2a48') +
        `<rect x="520" y="${VY - 40}" width="160" height="44" fill="#3a2a3a"/>` + hall(600, VY - 38, 230, 56, 'url(#gold)', '#ffd98a') +
        `<rect x="560" y="${VY - 34}" width="80" height="30" fill="#ffc870" opacity=".55"/>` +
        P(`M0 ${VY}H1200V900H0Z`, 'url(#floor)') + `<path d="${tiles}" stroke="#8a90a8" stroke-width="1.5" opacity=".35"/>` +
        glows + posts +
        // mourners in white, and the lamplighter with his taper
        mourner(460, 560, 64) + mourner(486, 566, 62, true) + mourner(720, 548, 52, true) + mourner(760, 540, 44) + mourner(560, 500, 26) + mourner(640, 496, 24, true) + mourner(674, 494, 22) +
        mourner(390, 640, 108, true) + mourner(880, 610, 92) +
        mourner(262, 790, 160, true, true) + S('M262 676L184 560', '#4a3a2a', 4) + disc(184, 556, 7, '#ffcf70') + disc(184, 556, 18, 'url(#lg)') +
        `<rect width="1200" height="900" fill="url(#dusk)"/>`;
      return wrap(w, h,
        lg('sky', [[0, '#141a3a'], [0.55, '#3a3a6a'], [0.85, '#a8607a'], [1, '#e89a7a']]) +
        lg('floor', [[0, '#3e4262'], [0.4, '#55597a'], [1, '#7a7e98']]) +
        lg('gold', [[0, '#e8c070'], [1, '#8a5a2a']]) +
        rg('lit', [[0, '#fffbea'], [0.6, '#fff0c8'], [1, '#f0c890']], 0.45, 0.4, 0.6) +
        glowDef('lg', '#ffe6b0', 0.55) + rg('fl', [[0, '#ffe6b0', 0.4], [1, '#ffe6b0', 0]]) +
        lg('robe', [[0, '#c9cede'], [0.5, '#f4f5f8'], [1, '#ffffff']], 0, 0, 1, 0) +
        lg('dusk', [[0, '#1a1840', 0], [0.6, '#1a1840', 0], [1, '#1a1840', 0.35]]) +
        vigDef(0.55) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.09));
    },
  });

  /* =================================================================================== */
  /* 12. The Jade Chamber above the harbor at sunset                                      */
  /* =================================================================================== */
  def('p_jade_chamber', {
    title: 'The Jade Chamber at sunset',
    w: 1200, h: 900, tags: ['liyue', 'jade chamber', 'ningguang', 'sunset', 'harbor'],
    svg: (w, h) => {
      const R = rng(9);
      const HZ = 650;
      const J = { wall: '#2f8a6a', dark: '#123a2c', stone: '#e8e2cf' };
      let l1 = '', l2 = '', refl = '', wins = '';
      for (let x = 0; x < 1200; x += 6 + R() * 14) {
        const d = `M${r0(x)} ${r0(HZ + 8 + R() * 10)}h3v3h-3Z`;
        if (R() < 0.6) l1 += d; else l2 += d;
        if (R() < 0.3) refl += `M${r0(x)} ${HZ + 20}h2v${r0(20 + R() * 40)}h-2Z`;
      }
      const lights = `<path d="${l1}" fill="#ffd27a"/><path d="${l2}" fill="#ff8a4a"/>`;
      refl = `<path d="${refl}" fill="#ffb060" opacity=".35"/>`;
      for (let i = 0; i < 30; i++) wins += `M${r0(400 + R() * 320)} ${r0(250 + R() * 110)}h4v6h-4Z`;
      let sunRefl = '';
      for (let i = 0; i < 20; i++) { const y = HZ + 24 + i * 9, ww = 30 + i * 10; sunRefl += `<rect x="${r0(900 - ww / 2 + (R() - 0.5) * 30)}" y="${y}" width="${r0(ww)}" height="3" rx="1.5" fill="#ffc87a" opacity="${(0.7 - i * 0.03).toFixed(2)}"/>`; }
      const body =
        `<rect width="1200" height="${HZ + 2}" fill="url(#sky)"/>` +
        disc(900, 600, 460, 'url(#sun)') + disc(900, 606, 46, '#fff0c8') +
        streak(200, 120, 640, 40, 'url(#cl)', 0.85) + streak(960, 170, 560, 34, 'url(#cl)', 0.8) + streak(600, 470, 900, 26, 'url(#cl2)', 0.7) + streak(1000, 520, 420, 18, 'url(#cl2)', 0.7) +
        // karst cliffs and the shore
        karst(70, HZ, 140, 330, '#3a2a48', '#2a2038') + karst(190, HZ, 110, 240, '#43304f') + karst(1110, HZ, 150, 300, '#3e2c4a', '#2a2038') + karst(1010, HZ, 90, 190, '#4a3456') +
        `<rect y="${HZ}" width="1200" height="${900 - HZ}" fill="url(#sea)"/>` + sunRefl + refl +
        P(`M0 ${HZ + 20}L120 ${HZ}H1200V${HZ + 14}L900 ${HZ + 22}L600 ${HZ + 16}L300 ${HZ + 26}Z`, '#1e1628') + lights +
        // the floating rock
        P('M286 372C296 420 350 456 410 480C466 504 520 540 556 580C590 540 636 510 696 486C756 460 822 424 834 372Z', 'url(#rock)') +
        S('M560 574C594 538 640 508 700 484C760 458 820 424 830 380', '#ff9a5a', 5, ' opacity=".55"') +
        S('M340 410C380 440 420 456 450 476M480 500C500 520 520 540 540 562M620 506C640 490 680 470 720 450M400 396C440 406 470 420 500 440', '#2a1e2e', 3, ' opacity=".5"') +
        S('M330 380C330 420 336 450 330 480M420 384C424 430 420 470 426 500M710 386C712 420 706 450 712 470M780 384C782 410 778 430 782 450', '#3f7a4a', 4, ' opacity=".8"') +
        cloud(330, 520, 1.1, 'url(#cl2)', 0.75) + cloud(780, 500, 0.9, 'url(#cl2)', 0.7) + cloud(560, 560, 0.9, 'url(#cl2)', 0.65) +
        // terrace and halls of jade and gold
        `<rect x="290" y="352" width="540" height="24" fill="#efe8d4"/>` + S('M296 352H824', '#fff6dc', 3) +
        `<path d="M300 352V340M330 352V340M360 352V340M760 352V340M790 352V340M820 352V340M300 341H372M748 341H824" stroke="#efe8d4" stroke-width="3"/>` +
        palace(380, 352, 170, J) + palace(740, 352, 170, J) +
        palace(560, 354, 300, J) + palace(560, 238, 200, J) + `<rect x="530" y="118" width="60" height="46" fill="#2f8a6a"/>` + hall(560, 126, 110, 44, 'url(#gold)', '#fff2c0', 1) +
        S('M560 70V50', '#ffd98a', 4) + disc(560, 46, 6, '#9fe8c8') +
        `<path d="${wins}" fill="#ffe2a0" opacity=".7"/>` +
        S('M650 340C680 300 690 250 680 200M700 340L712 240', '#ffb06a', 3, ' opacity=".35"') +
        disc(560, 300, 340, 'url(#halo)') +
        // birds crossing
        S('M190 300q10 -10 20 0q10 -10 20 0M240 330q7 -7 14 0q7 -7 14 0', '#2a2038', 2.5);
      return wrap(w, h,
        lg('sky', [[0, '#2e2f68'], [0.35, '#7a4a7e'], [0.62, '#d8706a'], [0.85, '#f6a45a'], [1, '#ffd08a']]) +
        glowDef('sun', '#ffcf86', 0.85) + glowDef('halo', '#ffe0a0', 0.18) +
        lg('cl', [[0, '#4a3a6a'], [0.6, '#a0587a'], [1, '#f49a7a']]) + lg('cl2', [[0, '#e88a7a'], [1, '#ffd0a0']]) +
        lg('sea', [[0, '#7a5070'], [0.2, '#4a3a62'], [1, '#1c1c38']]) +
        lg('rock', [[0, '#6a5060'], [0.5, '#3e2e40'], [1, '#22182a']], 0, 0, 1, 1) +
        lg('gold', [[0, '#ffe8a0'], [0.5, '#f0b048'], [1, '#b86a22']]) +
        vigDef(0.5) + grainDef(),
        body + vig(w, h) + grain(w, h, 0.08));
    },
  });
})();
