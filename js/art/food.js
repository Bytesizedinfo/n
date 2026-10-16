/* Food photography (1200×900): top-down / 3/4 food-app style. */
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

  // One light grain filter (white + dark speckles from a single turbulence).
  const GRAIN =
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .9 0 0 0 -.5" result="l"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.9 0 0 0 .4" result="d"/>` +
    `<feMerge><feMergeNode in="l"/><feMergeNode in="d"/></feMerge></filter>`;
  const SH = rg('sh', [[0, '#000', 0.5], [0.55, '#000', 0.22], [1, '#000', 0]]);
  const VIG = rg('vig', [[0.55, '#000', 0], [1, '#000', 0.42]], 0.5, 0.5, 0.75);
  const shadow = (x, y, rx, ry, o = 1) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sh)" opacity="${o}"/>`;
  const svg = (w, h, defs, body, g = 0.5, v = 1) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${GRAIN}${SH}${VIG}${defs}</defs>${body}` +
    `<rect width="${w}" height="${h}" fill="url(#vig)" opacity="${v}"/><rect width="${w}" height="${h}" filter="url(#grain)" opacity="${g}"/></svg>`;

  // Wooden table with planks running horizontally (base = null draws only the grain lines).
  function wood(w, h, base, dark, light, n = 5) {
    const ph = h / n;
    let planks = '', lines = '';
    for (let i = 0; i < n; i++) {
      const y = i * ph;
      planks += `<rect y="${f(y)}" width="${w}" height="${f(ph)}" fill="${rnd() > 0.5 ? dark : light}" opacity="${r1(rr(0.12, 0.3))}"/>`;
      for (let j = 0; j < 5; j++) {
        const yy = y + rr(8, ph - 8);
        lines += `M0 ${f(yy)}C${f(w * 0.3)} ${f(yy + rr(-9, 9))} ${f(w * 0.6)} ${f(yy + rr(-9, 9))} ${w} ${f(yy + rr(-6, 6))}`;
      }
      lines += `M0 ${f(y)}H${w}`;
    }
    return (base ? `<rect width="${w}" height="${h}" fill="${base}"/>${planks}` : '') + `<path d="${lines}" fill="none" stroke="${dark}" stroke-width="2" opacity=".35"/>`;
  }

  // A pair of chopsticks from (x,y), length L, angle a (deg). Needs a #chop gradient.
  function chopsticks(x, y, L, a, gap = 22) {
    const one = (dy) =>
      `<path d="M0 ${dy - 7}L${L} ${dy - 3.5}L${L} ${dy + 3.5}L0 ${dy + 7}Z" fill="url(#chop)"/>` +
      `<path d="M0 ${dy - 4}L${L} ${dy - 1.5}" stroke="#fff" stroke-width="2" opacity=".25"/>`;
    return (
      `<g transform="translate(${x} ${y}) rotate(${a})">` +
      `<path d="M0 -7L${L} -3.5V${gap + 3.5}L0 ${gap + 7}Z" fill="#000" opacity=".35" transform="translate(10 16)"/>` +
      one(0) + one(gap) + `</g>`
    );
  }
  const chopDef = (c1, c2) => lg('chop', [[0, c1], [1, c2]], 0, 0, 1, 0);

  // Soft steam wisp: stacked translucent strokes.
  function steam(x, y, hgt, sway = 30, o = 1) {
    const d = `M${x} ${y}C${x - sway} ${y - hgt * 0.25} ${x + sway} ${y - hgt * 0.45} ${x} ${y - hgt * 0.62}S${x - sway * 0.8} ${y - hgt * 0.9} ${x + sway * 0.3} ${y - hgt}`;
    return (
      `<g fill="none" stroke="#fff" stroke-linecap="round" opacity="${o}">` +
      `<path d="${d}" stroke-width="46" opacity=".05"/><path d="${d}" stroke-width="26" opacity=".08"/><path d="${d}" stroke-width="10" opacity=".14"/></g>`
    );
  }

  // Specks (seeds, spices) inside a circle, as short strokes in one path.
  function specks(cx, cy, R, n, len, rot = 0) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = rr(0, Math.PI * 2), r = Math.sqrt(rnd()) * R;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, t = rr(0, Math.PI) + rot;
      const dx = Math.cos(t) * len, dy = Math.sin(t) * len;
      d += `M${r1(x - dx)} ${r1(y - dy)}l${r1(dx * 2)} ${r1(dy * 2)}`;
    }
    return d;
  }
  // Little rings (scallion slices) inside a circle.
  function rings(cx, cy, R0, R, n, s = 8) {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = rr(0, 6.28), r = rr(R0, R);
      d += `M${f(cx + Math.cos(a) * r + s)} ${f(cy + Math.sin(a) * r)}a${s} ${r1(s * 0.85)} 0 1 0 0 .1`;
    }
    return d;
  }
  // Smooth irregular blob.
  function blob(x, y, rx, ry, n, jit) {
    const P = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, k = 1 + rr(-jit, jit);
      P.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
    }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = m(P[n - 1], P[0]), d = `M${f(s[0])} ${f(s[1])}`;
    for (let i = 0; i < n; i++) {
      const p = P[i], q = m(P[i], P[(i + 1) % n]);
      d += `Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`;
    }
    return d + 'Z';
  }

  // ---- Lotus root & pork rib soup ---------------------------------------------------------
  def('food_soup', {
    title: 'Lotus root & pork rib soup',
    w: 1200, h: 900, tags: ['food', 'soup', 'lotus'],
    svg: (w, h) => {
      seed(11);
      const cx = 560, cy = 450;
      const slice = (x, y, r, rot, sub) => {
        let holes = `<circle r="${r1(r * 0.12)}"/>`;
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI * 2) / 8 + rr(-0.12, 0.12), hr = r * rr(0.13, 0.19);
          const hx = r1(Math.cos(a) * r * 0.57), hy = r1(Math.sin(a) * r * 0.57);
          holes += `<ellipse cx="${hx}" cy="${hy}" rx="${r1(hr)}" ry="${r1(hr * 0.82)}" transform="rotate(${f((a * 180) / Math.PI)} ${hx} ${hy})"/>`;
        }
        return (
          `<g transform="translate(${x} ${y}) rotate(${rot}) scale(1 .9)">` +
          `<circle r="${r + 4}" fill="#000" opacity=".14" transform="translate(5 7)"/>` +
          `<circle r="${r}" fill="url(#lr)" stroke="#c99a84" stroke-width="5"/>` +
          `<g fill="url(#hole)" stroke="#b5866a" stroke-width="2">${holes}</g>` +
          `<path d="M${-r * 0.7} ${-r * 0.45}A${r * 0.85} ${r * 0.85} 0 0 1 ${r * 0.2} ${-r * 0.82}" fill="none" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>` +
          (sub ? `<circle r="${r + 3}" fill="#d9a35c" opacity="${sub}"/>` : '') +
          `</g>`
        );
      };
      const RIB = 'M-52-30C-26-44 28-42 50-28C64-16 64 18 48 30C24 42-30 42-52 28C-66 16-66-18-52-30Z';
      const rib = (x, y, rot, s) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
        `<path d="${RIB}" fill="#000" opacity=".16" transform="translate(5 7)"/><path d="${RIB}" fill="url(#meat)"/>` +
        `<path d="M-40-24C-14-32 18-32 40-22" stroke="#efd9c8" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/>` +
        `<path d="M-32-4C-10 0 14-2 34 4M-36 12C-14 16 12 14 30 18" stroke="#9a5e48" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>` +
        `<ellipse cx="-54" cy="0" rx="13" ry="19" fill="#f3e8d6" stroke="#d6c2a2" stroke-width="3"/><ellipse cx="54" cy="0" rx="13" ry="19" fill="#f3e8d6" stroke="#d6c2a2" stroke-width="3"/>` +
        `<ellipse cx="55" cy="0" rx="5" ry="8" fill="#d39c8a"/><ellipse cx="-53" cy="0" rx="5" ry="8" fill="#d39c8a"/></g>`;
      let goji = '', oil = '';
      for (let i = 0; i < 11; i++) {
        const a = rr(0, 6.28), r = rr(40, 230), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        goji += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rr(0, 180))})"><ellipse rx="11" ry="7" fill="#d93a22"/><ellipse cx="-3" cy="-2" rx="4" ry="2" fill="#ff9b80"/></g>`;
      }
      for (let i = 0; i < 26; i++) {
        const a = rr(0, 6.28), r = rr(10, 240), s = rr(4, 13);
        oil += `<ellipse cx="${f(cx + Math.cos(a) * r)}" cy="${f(cy + Math.sin(a) * r)}" rx="${r1(s)}" ry="${r1(s * 0.75)}"/>`;
      }
      const SP = 'M-84 0C-84-48 4-56 44-26L136-32C152-33 158-16 156-6C154 4 148 8 136 8L44 24C4 56-84 48-84 0Z';
      return svg(w, h,
        lg('lr', [[0, '#f6e4d8'], [1, '#e2c0ac']], 0, 0, 1, 1) +
        rg('hole', [[0, '#a8703e'], [1, '#d3a062']]) +
        lg('meat', [[0, '#d6a48c'], [1, '#a86e57']], 0, 0, 0.6, 1) +
        lg('porc', [[0, '#ffffff'], [1, '#e2ddd4']], 0, 0, 1, 1) +
        lg('wall', [[0, '#cfc8bd'], [0.5, '#efebe4'], [1, '#ffffff']], 0, 0, 1, 1) +
        rg('broth', [[0, '#f3cf92'], [0.7, '#e0a45c'], [1, '#c4843f']], 0.45, 0.42, 0.6) +
        lg('spoon', [[0, '#ffffff'], [1, '#dcd6cc']], 0, 0, 0, 1) +
        chopDef('#8a5a36', '#4e2c16') +
        `<clipPath id="bc"><circle cx="${cx}" cy="${cy}" r="262"/></clipPath>`,
        wood(w, h, '#b88554', '#7d5230', '#d4a36d', 5) +
        // linen napkin
        `<g transform="rotate(-10 200 760)"><rect x="-80" y="560" width="560" height="460" fill="#f3eee4"/><path d="M-80 600H480M-80 612H480" stroke="#8fb1d9" stroke-width="5"/><path d="M60 560V1020M200 560V1020" stroke="#e2dbcf" stroke-width="10" opacity=".7"/></g>` +
        // raw lotus root on the table
        `<g transform="translate(1040 150) rotate(-20)">${shadow(20, 40, 170, 110, 0.7)}<rect x="-40" y="-90" width="260" height="180" rx="90" fill="#e2c39c"/><path d="M-20-70H200M-20 70H200" stroke="#c99e70" stroke-width="5" opacity=".6"/><path d="M120-90C110-30 110 30 120 90" stroke="#b98a5c" stroke-width="8" fill="none" opacity=".6"/>` +
        `<ellipse cx="-40" cy="0" rx="62" ry="90" fill="url(#lr)" stroke="#c9a07c" stroke-width="5"/><g fill="#c49a7c"><ellipse cx="-40" cy="0" rx="8" ry="12"/><ellipse cx="-40" cy="-46" rx="12" ry="16"/><ellipse cx="-40" cy="46" rx="12" ry="16"/><ellipse cx="-70" cy="-22" rx="10" ry="15"/><ellipse cx="-10" cy="-22" rx="10" ry="15"/><ellipse cx="-70" cy="22" rx="10" ry="15"/><ellipse cx="-10" cy="22" rx="10" ry="15"/></g></g>` +
        `<g transform="translate(940 300)"><ellipse rx="11" ry="7" fill="#d93a22"/><ellipse cx="22" cy="14" rx="11" ry="7" fill="#c9321c" transform="rotate(30 22 14)"/><ellipse cx="-6" cy="26" rx="10" ry="7" fill="#d93a22"/></g>` +
        // bowl
        shadow(cx + 34, cy + 40, 360, 350, 0.9) +
        `<circle cx="${cx}" cy="${cy}" r="318" fill="url(#porc)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="312" fill="none" stroke="#3f6fb0" stroke-width="4"/>` +
        `<circle cx="${cx}" cy="${cy}" r="300" fill="none" stroke="#3f6fb0" stroke-width="2"/>` +
        `<circle cx="${cx}" cy="${cy}" r="292" fill="url(#wall)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="262" fill="url(#broth)"/>` +
        `<g clip-path="url(#bc)">` +
        slice(cx - 110, cy - 90, 78, 10, 0) + slice(cx + 70, cy + 110, 72, 40, 0.35) + slice(cx - 70, cy + 140, 66, 70, 0) +
        rib(cx + 60, cy - 60, -30, 1) + rib(cx - 160, cy + 40, 60, 0.9) + rib(cx + 165, cy + 50, 80, 0.85) + rib(cx - 10, cy + 20, 15, 0.8) +
        slice(cx + 30, cy - 175, 60, 25, 0.5) +
        goji +
        `<path d="${rings(cx, cy, 20, 235, 14)}" fill="none" stroke="#6fae3c" stroke-width="5"/>` +
        `<g fill="#ffe7b4" opacity=".55">${oil}</g>` +
        `<ellipse cx="${cx - 90}" cy="${cy - 120}" rx="140" ry="70" fill="#fff" opacity=".12" transform="rotate(-30 ${cx - 90} ${cy - 120})"/>` +
        `</g>` +
        `<path d="M${cx - 290} ${cy - 40}A292 292 0 0 1 ${cx - 40} ${cy - 290}" fill="none" stroke="#fff" stroke-width="10" opacity=".7" stroke-linecap="round"/>` +
        // porcelain spoon resting in the bowl
        `<g transform="translate(${cx + 160} ${cy - 110}) rotate(-40)">` +
        `<path d="${SP}" fill="#000" opacity=".2" transform="translate(10 14)"/><path d="${SP}" fill="url(#spoon)"/>` +
        `<path d="M-70 0C-70-38 0-44 34-20C40-8 40 8 34 20C0 44-70 38-70 0Z" fill="#e2a65e"/><ellipse cx="-30" cy="-12" rx="26" ry="9" fill="#fff" opacity=".35"/>` +
        `<path d="M58-19L140-23" stroke="#3f6fb0" stroke-width="4" stroke-linecap="round"/></g>` +
        chopsticks(1010, 880, 470, -76) +
        steam(cx - 60, cy - 60, 360, 36) + steam(cx + 60, cy - 30, 300, -30, 0.8) + steam(cx - 160, cy + 20, 260, 26, 0.6)
      );
    },
  });

  // ---- Hotpot -----------------------------------------------------------------------------
  def('food_hotpot', {
    title: 'Hotpot',
    w: 1200, h: 900, tags: ['food', 'hotpot'],
    svg: (w, h) => {
      seed(23);
      const cx = 450, cy = 450, R = 300;
      const S = `M${cx} ${cy - R}C${cx - 220} ${cy - 120} ${cx + 220} ${cy + 120} ${cx} ${cy + R}`;
      let chili = '', pepper = '', bubR = '', bubW = '', beef = '', enoki = '', caps = '';
      for (let i = 0; i < 12; i++) {
        const a = rr(1.7, 4.6), r = rr(60, 270), x = cx + Math.cos(a) * r * 0.9, y = cy + Math.sin(a) * r;
        chili += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rr(0, 360))})"><path d="M-30 0C-26-12 18-14 34-2C38 2 36 6 30 6C10 10-22 12-30 0Z" fill="#8f1209"/><path d="M-22-4C-6-10 14-10 28-4" stroke="#ff6a4a" stroke-width="3" fill="none" opacity=".7"/><path d="M-30 0l-10-4" stroke="#6d7a2a" stroke-width="5" stroke-linecap="round"/></g>`;
      }
      for (let i = 0; i < 40; i++) {
        const a = rr(1.6, 4.7), r = rr(30, 280);
        pepper += `M${f(cx + Math.cos(a) * r * 0.95)} ${f(cy + Math.sin(a) * r)}a5 5 0 1 0 .1 0`;
      }
      for (let i = 0; i < 28; i++) {
        const a = rr(0, 6.28), r = rr(20, 285), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, s = rr(5, 16);
        const c = `M${f(x + s)} ${f(y)}a${r1(s)} ${r1(s)} 0 1 0 .1 0`;
        if (x < cx + 70 * Math.sin((Math.PI * (y - cy)) / R)) bubR += c; else bubW += c;
      }
      for (let i = 0; i < 8; i++) {
        const x = (i % 4) * 70 - 105, y = i < 4 ? -34 : 36;
        let m = '';
        for (let j = 0; j < 4; j++) {
          const yy = rr(-20, 20), xx = rr(-34, 0);
          m += `M${f(xx)} ${f(yy)}q${f(rr(6, 14))} ${f(rr(-8, 8))} ${f(rr(14, 30))} ${f(rr(-5, 5))}`;
        }
        beef += `<g transform="translate(${x} ${y}) rotate(${f(rr(-12, 12))})"><path d="${blob(0, 0, 42, 29, 7, 0.08)}" fill="url(#beef)"/>` +
          `<path d="M24-24C40-14 42 12 26 24" stroke="#7a1424" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>` +
          `<path d="${m}" stroke="#ffe6e2" stroke-width="2.5" fill="none" opacity=".8" stroke-linecap="round"/></g>`;
      }
      for (let i = 0; i < 24; i++) {
        const y0 = rr(-26, 26), a = rr(-0.18, 0.18), L = rr(140, 180), x1 = -80 + L * Math.cos(a), y1 = y0 + L * Math.sin(a);
        enoki += `M-80 ${f(y0)}L${f(x1)} ${f(y1)}`;
        caps += `M${f(x1 + 7)} ${f(y1)}a7 7 0 1 0 .1 0`;
      }
      const fishball = (x, y) => `<circle cx="${x + 4}" cy="${y + 5}" r="25" fill="#000" opacity=".12"/><circle cx="${x}" cy="${y}" r="25" fill="url(#ball)"/>`;
      return svg(w, h,
        lg('steel', [[0, '#f5f7fa'], [0.45, '#b8bec7'], [1, '#6e757f']], 0, 0, 1, 1) +
        lg('steel2', [[0, '#5a616b'], [1, '#d9dde3']], 0, 0, 1, 1) +
        rg('red', [[0, '#e0482a'], [0.65, '#b8220f'], [1, '#7f0f06']], 0.4, 0.4, 0.7) +
        rg('wht', [[0, '#fffaf0'], [0.7, '#f1e6d2'], [1, '#d9c8ac']], 0.6, 0.45, 0.65) +
        rg('slate', [[0, '#3a383e'], [1, '#1b1a1e']], 0.4, 0.4, 0.8) +
        lg('plate', [[0, '#ffffff'], [1, '#d9d6d1']], 0, 0, 1, 1) +
        lg('sesame', [[0, '#d9a868'], [1, '#b07a3a']]) +
        rg('beef', [[0, '#cf4655'], [0.7, '#a8263a'], [1, '#7e1828']], 0.45, 0.4, 0.6) +
        rg('ball', [[0, '#ffffff'], [1, '#e3dccd']], 0.35, 0.3, 0.7) +
        chopDef('#c49a6c', '#8a6038') +
        `<clipPath id="pot"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath>`,
        `<rect width="${w}" height="${h}" fill="url(#slate)"/>` +
        // sauce bowls (left corners)
        `<g transform="translate(70 90)">${shadow(16, 20, 130, 120)}<circle r="112" fill="url(#plate)"/><circle r="92" fill="url(#sesame)"/><path d="M-50-20C-20-40 30-30 50 0" stroke="#f4d6a8" stroke-width="8" fill="none" opacity=".6" stroke-linecap="round"/><circle cx="20" cy="30" r="22" fill="#c2331e" opacity=".85"/><g fill="#4f9a3a"><ellipse cx="-30" cy="20" rx="12" ry="6" transform="rotate(30 -30 20)"/><ellipse cx="-10" cy="40" rx="10" ry="5"/></g></g>` +
        `<g transform="translate(90 820)">${shadow(16, 20, 130, 120)}<circle r="108" fill="url(#plate)"/><circle r="88" fill="#a8240f"/><circle r="88" fill="url(#red)" opacity=".7"/><g fill="#f2e2b8"><circle cx="-20" cy="-30" r="9"/><circle cx="14" cy="-10" r="8"/><circle cx="-30" cy="14" r="8"/><circle cx="24" cy="24" r="9"/></g><g fill="#4f9a3a"><circle cx="0" cy="40" r="7"/><circle cx="40" cy="-30" r="6"/></g></g>` +
        // the pot
        shadow(cx + 30, cy + 40, R + 70, R + 64, 0.9) +
        `<circle cx="${cx}" cy="${cy}" r="${R + 28}" fill="url(#steel)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="url(#steel2)"/>` +
        `<g clip-path="url(#pot)">` +
        `<path d="${S}A${R} ${R} 0 0 1 ${cx} ${cy - R}Z" fill="url(#red)"/>` +
        `<path d="${S}A${R} ${R} 0 0 0 ${cx} ${cy - R}Z" fill="url(#wht)"/>` +
        // red side
        `<g fill="#ff9d3a" opacity=".35"><ellipse cx="${cx - 150}" cy="${cy - 60}" rx="70" ry="40"/><ellipse cx="${cx - 60}" cy="${cy + 180}" rx="50" ry="26"/><ellipse cx="${cx - 200}" cy="${cy + 90}" rx="40" ry="22"/></g>` +
        `<path d="M${cx - 190} ${cy - 150}c20-16 50-14 64 2c-20 6-44 8-64-2ZM${cx - 120} ${cy + 60}c24-14 54-8 66 8c-24 4-48 4-66-8Z" fill="#7a2a1a"/>` +
        `<path d="${pepper}" fill="#5a1208"/>` + chili +
        // white side
        `<g transform="translate(${cx + 150} ${cy - 120})"><circle r="44" fill="#6b4226"/><circle r="44" fill="none" stroke="#4a2a14" stroke-width="6"/><path d="M-20-20L20 20M20-20L-20 20" stroke="#e8d2b0" stroke-width="7" stroke-linecap="round"/></g>` +
        `<g transform="translate(${cx + 70} ${cy + 150})"><circle r="38" fill="#7a4a2a"/><path d="M-16-16L16 16M16-16L-16 16" stroke="#e8d2b0" stroke-width="6" stroke-linecap="round"/></g>` +
        `<rect x="${cx + 170}" y="${cy + 10}" width="70" height="70" rx="10" fill="#fbf3dd" stroke="#e6d4ad" stroke-width="4" transform="rotate(18 ${cx + 205} ${cy + 45})"/>` +
        `<rect x="${cx + 60}" y="${cy - 10}" width="62" height="62" rx="10" fill="#fbf3dd" stroke="#e6d4ad" stroke-width="4" transform="rotate(-12 ${cx + 91} ${cy + 21})"/>` +
        `<g transform="translate(${cx + 210} ${cy + 150}) scale(1 .85)"><circle r="46" fill="#f3e2cb" stroke="#d6b48c" stroke-width="4"/><g fill="#e2c49c"><circle r="7"/><circle cx="0" cy="-26" r="9"/><circle cx="0" cy="26" r="9"/><circle cx="-24" cy="-12" r="8"/><circle cx="24" cy="-12" r="8"/><circle cx="-24" cy="12" r="8"/><circle cx="24" cy="12" r="8"/></g></g>` +
        fishball(cx + 240, cy - 40) + fishball(cx + 200, cy - 210) + fishball(cx + 30, cy + 240) +
        `<g fill="#d63a22"><ellipse cx="${cx + 120}" cy="${cy - 40}" rx="9" ry="6"/><ellipse cx="${cx + 250}" cy="${cy - 110}" rx="9" ry="6"/><ellipse cx="${cx + 110}" cy="${cy + 250}" rx="9" ry="6"/></g>` +
        `<path d="${rings(cx + 150, cy, 10, 120, 8, 7)}" fill="none" stroke="#5fae3e" stroke-width="5"/>` +
        `<path d="${bubW}" fill="none" stroke="#fff" stroke-width="3" opacity=".75"/>` +
        `<path d="${bubR}" fill="none" stroke="#ffb08a" stroke-width="3" opacity=".6"/>` +
        `</g>` +
        `<path d="${S}" fill="none" stroke="url(#steel)" stroke-width="16"/>` +
        `<path d="M${cx - R - 14} ${cy}A${R + 14} ${R + 14} 0 0 1 ${cx} ${cy - R - 14}" fill="none" stroke="#fff" stroke-width="6" opacity=".6"/>` +
        // beef plate (top right)
        `<g transform="translate(960 190) rotate(-8)">${shadow(20, 26, 220, 140)}<rect x="-190" y="-110" width="380" height="220" rx="40" fill="url(#plate)"/><rect x="-170" y="-90" width="340" height="180" rx="30" fill="#f2efea"/>${beef}</g>` +
        // greens + enoki plate (bottom right)
        `<g transform="translate(980 660)">${shadow(20, 26, 220, 200)}<circle r="190" fill="url(#plate)"/><circle r="166" fill="#f2efea"/>` +
        `<g transform="translate(-40 -40)"><path d="M0 0C-60-40-110-20-120 20C-100 60-40 60 0 0Z" fill="#3f8f3a"/><path d="M0 0C-50-10-90 0-112 18" stroke="#9fd47a" stroke-width="5" fill="none"/><path d="M0 0C30-14 60-10 80 4C60 24 30 22 0 0Z" fill="#d9f0c0"/></g>` +
        `<g transform="translate(20 -90) rotate(-30)"><path d="M0 0C-60-40-110-20-120 20C-100 60-40 60 0 0Z" fill="#4c9e3f"/><path d="M0 0C-50-10-90 0-112 18" stroke="#a8dc84" stroke-width="5" fill="none"/><path d="M0 0C30-14 60-10 80 4C60 24 30 22 0 0Z" fill="#e2f4cd"/></g>` +
        `<g transform="translate(-10 70) rotate(-12)"><path d="${enoki}" stroke="#cfc4a6" stroke-width="7" stroke-linecap="round" transform="translate(3 4)"/><path d="${enoki}" stroke="#f7f1e0" stroke-width="6" stroke-linecap="round"/><path d="${caps}" fill="#efe3c2" stroke="#cdbb92" stroke-width="2"/><rect x="-104" y="-34" width="40" height="68" rx="14" fill="#c4ac80"/></g></g>` +
        // small sauce bowl
        `<g transform="translate(1100 430)">${shadow(12, 14, 90, 86)}<circle r="78" fill="url(#plate)"/><circle r="62" fill="#3a1c10"/><circle cx="-14" cy="-10" r="22" fill="#c43a1c" opacity=".8"/><g fill="#f0e2bd"><circle cx="18" cy="16" r="6"/><circle cx="-10" cy="24" r="5"/><circle cx="24" cy="-16" r="5"/></g></g>` +
        chopsticks(770, 880, 430, -38) +
        steam(cx - 80, cy - 40, 380, 40) + steam(cx + 90, cy - 10, 340, -34, 0.9) + steam(cx - 10, cy + 140, 300, 30, 0.7)
      );
    },
  });

  // ---- Baozi ------------------------------------------------------------------------------
  def('food_baozi', {
    title: 'Steamed baozi',
    w: 1200, h: 900, tags: ['food', 'baozi'],
    svg: (w, h) => {
      seed(5);
      const cx = 540, cy = 460;
      let pleats = '';
      for (let i = 0; i < 15; i++) {
        const a = (i * Math.PI * 2) / 15 + rr(-0.08, 0.08);
        const x0 = Math.cos(a) * 84, y0 = Math.sin(a) * 84;
        const c1x = Math.cos(a + 0.55) * 50, c1y = Math.sin(a + 0.55) * 50;
        const x1 = Math.cos(a + 1.1) * 13, y1 = Math.sin(a + 1.1) * 13;
        pleats += `M${r1(x0)} ${r1(y0)}Q${r1(c1x)} ${r1(c1y)} ${r1(x1)} ${r1(y1)}`;
      }
      let buns = `<use href="#bun" transform="translate(${cx} ${cy}) rotate(20)"/>`;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + 0.3;
        buns += `<use href="#bun" transform="translate(${f(cx + Math.cos(a) * 208)} ${f(cy + Math.sin(a) * 208)}) rotate(${f(rr(0, 360))}) scale(${r1(rr(0.94, 1.02))})"/>`;
      }
      let lid = '';
      for (let r = 40; r < 300; r += 26) lid += `<circle r="${r}" fill="none" stroke="${r % 52 ? '#c9a466' : '#b48d50'}" stroke-width="13" stroke-dasharray="${r1(r * 0.18)} ${r1(r * 0.06)}"/>`;
      let ginger = '';
      for (let i = 0; i < 16; i++) {
        const x = rr(-50, 40), y = rr(-40, 40), a = rr(-0.6, 0.6);
        ginger += `M${f(x)} ${f(y)}l${f(Math.cos(a) * 40)} ${f(Math.sin(a) * 40)}`;
      }
      return svg(w, h,
        rg('bunG', [[0, '#ffffff'], [0.6, '#f8f2e8'], [1, '#e3d8c5']], 0.38, 0.35, 0.7) +
        rg('wood', [[0, '#5a4030'], [1, '#2a1c14']], 0.45, 0.45, 0.8) +
        lg('bam', [[0, '#e8cf98'], [0.5, '#d4b273'], [1, '#a98048']], 0, 0, 1, 1) +
        lg('plate', [[0, '#ffffff'], [1, '#d9d6d1']], 0, 0, 1, 1) +
        chopDef('#3a2a20', '#140c08') +
        `<pattern id="perf" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="17" cy="17" r="4" fill="#d6c7aa"/></pattern>` +
        `<g id="bun"><circle r="104" fill="#000" opacity=".24" transform="translate(12 16)"/><circle r="100" fill="url(#bunG)"/>` +
        `<path d="${pleats}" fill="none" stroke="#d6c8af" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="${pleats}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" transform="translate(-3 -3)" opacity=".9"/>` +
        `<circle r="15" fill="#efe5d3"/><path d="M-8-2a8 8 0 1 1 6 9" fill="none" stroke="#d6c8b0" stroke-width="3"/>` +
        `<path d="M-70-40A82 82 0 0 1-30-76" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/></g>`,
        wood(w, h, '#3d2a1e', '#22150d', '#5a4030', 4) +
        `<rect width="${w}" height="${h}" fill="url(#wood)" opacity=".5"/>` +
        // lid leaning in the corner
        `<g transform="translate(1130 70)">${shadow(-20, 30, 330, 320)}<circle r="300" fill="url(#bam)"/>${lid}<circle r="300" fill="none" stroke="#8a6434" stroke-width="10"/></g>` +
        // steamer
        shadow(cx + 30, cy + 40, 420, 410, 0.95) +
        `<circle cx="${cx}" cy="${cy}" r="370" fill="url(#bam)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="352" fill="none" stroke="#b8925a" stroke-width="22" stroke-dasharray="16 9"/>` +
        `<circle cx="${cx}" cy="${cy}" r="336" fill="#7a5a32"/>` +
        `<circle cx="${cx}" cy="${cy}" r="328" fill="#f2e9d8"/><circle cx="${cx}" cy="${cy}" r="328" fill="url(#perf)"/>` +
        `<path d="M${cx - 340} ${cy}A340 340 0 0 1 ${cx} ${cy - 340}" fill="none" stroke="#fff3d0" stroke-width="6" opacity=".6"/>` +
        buns +
        // vinegar & ginger
        `<g transform="translate(1060 760)">${shadow(14, 18, 120, 110)}<circle r="100" fill="url(#plate)"/><circle r="80" fill="#2a120a"/><ellipse cx="-24" cy="-26" rx="30" ry="12" fill="#fff" opacity=".18"/><path d="${ginger}" stroke="#f2d27a" stroke-width="6" stroke-linecap="round"/></g>` +
        chopsticks(960, 905, 520, -74) +
        steam(cx - 40, cy - 60, 420, 40) + steam(cx + 180, cy - 120, 340, -30, 0.85) + steam(cx - 210, cy + 60, 320, 26, 0.75) + steam(cx + 120, cy + 150, 300, 30, 0.6)
      );
    },
  });

  // ---- Noodles ----------------------------------------------------------------------------
  def('food_noodles', {
    title: 'Beef noodle soup',
    w: 1200, h: 900, tags: ['food', 'noodles'],
    svg: (w, h) => {
      seed(31);
      const cx = 520, cy = 455, nx = cx - 40, ny = cy + 30;
      // a swirled nest of noodles
      let nd = '';
      for (let i = 0; i < 22; i++) {
        const r0 = rr(110, 185), a0 = rr(0, 6.28), span = rr(3, 5.5), dr = rr(50, 100), ph = rr(0, 6);
        for (let j = 0; j <= 18; j++) {
          const t = j / 18, a = a0 + span * t, r = r0 - dr * t + Math.sin(a * 3 + ph) * 4;
          nd += (j ? 'L' : 'M') + f(nx + Math.cos(a) * r) + ' ' + f(ny + Math.sin(a) * r * 0.94);
        }
      }
      let oil = '';
      for (let i = 0; i < 34; i++) {
        const a = rr(0, 6.28), r = rr(20, 290), s = rr(5, 22);
        oil += `<ellipse cx="${f(cx + Math.cos(a) * r)}" cy="${f(cy + Math.sin(a) * r)}" rx="${f(s)}" ry="${f(s * 0.8)}"/>`;
      }
      const BEEF = 'M-70-30C-40-46 40-44 70-26C80 0 72 24 60 34C20 44-40 42-66 30C-80 10-80-14-70-30Z';
      const beef = (x, y, rot) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="${BEEF}" fill="#000" opacity=".22" transform="translate(6 8)"/><path d="${BEEF}" fill="url(#beef)" stroke="#4a1c0a" stroke-width="4"/>` +
        `<path d="M-50-14C-20-22 20-18 50-6M-40 14C-10 8 20 12 44 20" stroke="#c48a64" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>` +
        `<path d="M-46-26C-20-34 20-34 46-24" stroke="#fff" stroke-width="4" fill="none" opacity=".25" stroke-linecap="round"/></g>`;
      const egg = (x, y, rot) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><ellipse rx="66" ry="50" fill="#000" opacity=".2" transform="translate(6 8)"/><ellipse rx="66" ry="50" fill="url(#white)"/>` +
        `<ellipse cx="4" cy="2" rx="36" ry="30" fill="url(#yolk)"/><ellipse cx="-6" cy="-8" rx="12" ry="7" fill="#fff" opacity=".5"/></g>`;
      const choy = (x, y, rot) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C30-30 110-50 160-24C150 6 110 30 60 30C30 30 10 20 0 0Z" fill="#2f7a2e"/><path d="M0 0C40-12 100-20 150-22" stroke="#7cc35a" stroke-width="5" fill="none"/>` +
        `<path d="M-6 2C-30-10-60-14-84-4C-70 12-30 18-6 2Z" fill="#dff2c8"/><path d="M0 0C-24-4-50-4-76-2" stroke="#b9dc98" stroke-width="4" fill="none"/></g>`;
      return svg(w, h,
        rg('stone', [[0, '#39404a'], [1, '#1c2026']], 0.4, 0.4, 0.8) +
        lg('bowl', [[0, '#3c5a86'], [1, '#14223a']], 0, 0, 1, 1) +
        lg('bwall', [[0, '#0e1a2c'], [0.6, '#22385a'], [1, '#3e5c88']], 0, 0, 1, 1) +
        rg('broth', [[0, '#d07a36'], [0.7, '#a24f1c'], [1, '#6e300e']], 0.42, 0.42, 0.62) +
        lg('beef', [[0, '#8e4a2e'], [1, '#5a2614']], 0, 0, 1, 1) +
        rg('white', [[0, '#ffffff'], [1, '#e9e3d6']], 0.4, 0.35, 0.7) +
        rg('yolk', [[0, '#ffb64a'], [0.7, '#f08a14'], [1, '#d96a0a']], 0.45, 0.4, 0.6) +
        lg('plate', [[0, '#ffffff'], [1, '#d9d6d1']], 0, 0, 1, 1) +
        chopDef('#2b2b2b', '#0e0e0e') +
        `<path id="nd" d="${nd}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<clipPath id="bc"><circle cx="${cx}" cy="${cy}" r="296"/></clipPath>`,
        `<rect width="${w}" height="${h}" fill="url(#stone)"/>` +
        // terracotta napkin
        `<g transform="rotate(14 1040 260)"><rect x="900" y="-80" width="420" height="560" fill="#c8673e"/><path d="M930-80V480M946-80V480" stroke="#f2c6a8" stroke-width="5" opacity=".7"/></g>` +
        // chili crisp dish
        `<g transform="translate(1060 740)">${shadow(14, 18, 120, 110)}<circle r="100" fill="url(#plate)"/><circle r="80" fill="#9e2a10"/><circle r="80" fill="url(#broth)" opacity=".4"/>` +
        `<g fill="#5a1406"><circle cx="-20" cy="-10" r="10"/><circle cx="14" cy="20" r="8"/><circle cx="26" cy="-24" r="9"/><circle cx="-26" cy="30" r="7"/></g><g fill="#f2e2bd"><circle cx="0" cy="0" r="4"/><circle cx="30" cy="4" r="4"/><circle cx="-10" cy="30" r="4"/></g></g>` +
        // bowl
        shadow(cx + 34, cy + 42, 410, 400, 0.95) +
        `<circle cx="${cx}" cy="${cy}" r="360" fill="url(#bowl)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="356" fill="none" stroke="#7b9cc8" stroke-width="5" opacity=".7"/>` +
        `<circle cx="${cx}" cy="${cy}" r="330" fill="url(#bwall)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="296" fill="url(#broth)"/>` +
        `<g clip-path="url(#bc)">` +
        `<g fill="#ff7a22" opacity=".45">${oil}</g>` +
        choy(cx - 260, cy + 70, -10) + choy(cx - 230, cy + 190, 20) +
        `<ellipse cx="${nx + 10}" cy="${ny + 14}" rx="190" ry="176" fill="#000" opacity=".18"/>` +
        `<use href="#nd" stroke="#b07e34" stroke-width="13"/><use href="#nd" stroke="#f3d78e" stroke-width="9"/><use href="#nd" stroke="#fff3c8" stroke-width="3" transform="translate(-2 -2)"/>` +
        beef(cx + 160, cy - 170, 20) + beef(cx + 215, cy - 75, 60) + beef(cx + 70, cy - 225, -10) +
        egg(cx + 170, cy + 140, -20) + egg(cx + 60, cy + 225, 15) +
        `<path d="${rings(cx, cy, 10, 270, 26, 9)}" fill="none" stroke="#5fb043" stroke-width="5"/>` +
        `<path d="${specks(cx, cy, 260, 50, 4)}" stroke="#f6ead0" stroke-width="4" stroke-linecap="round"/>` +
        `<ellipse cx="${cx - 110}" cy="${cy - 150}" rx="140" ry="60" fill="#fff" opacity=".1" transform="rotate(-35 ${cx - 110} ${cy - 150})"/>` +
        `</g>` +
        `<path d="M${cx - 340} ${cy - 20}A345 345 0 0 1 ${cx - 60} ${cy - 340}" fill="none" stroke="#a9c4ea" stroke-width="7" opacity=".55" stroke-linecap="round"/>` +
        chopsticks(1140, 96, 780, 168) +
        steam(cx - 30, cy - 40, 400, 36) + steam(cx + 110, cy + 20, 330, -30, 0.8)
      );
    },
  });

  // ---- Milk tea ---------------------------------------------------------------------------
  def('food_milktea', {
    title: 'Brown sugar milk tea',
    w: 1200, h: 900, tags: ['food', 'drink', 'milktea'],
    svg: (w, h) => {
      seed(7);
      const body = 'M425 200L470 790A130 26 0 0 0 730 790L775 200Z';
      const half = (y) => 175 - ((y - 200) / 590) * 45;
      // loose pile of pearls, back to front
      const P = [];
      for (let i = 0; i < 64; i++) {
        const y = rr(640, 800), hw = half(y) - 10;
        P.push([600 + rr(-hw, hw), y, rr(14, 17)]);
      }
      P.sort((a, b) => a[1] - b[1]);
      const pearls = P.map(([x, y, r]) => `<use href="#pl" transform="translate(${f(x)} ${f(y)}) scale(${r1(r / 16)})"/>`).join('');
      let drops = '', bokeh = '', tiger = '';
      for (let i = 0; i < 34; i++) {
        const y = rr(270, 760), hw = half(y) - 14, x = 600 + rr(-hw, hw), s = rr(3, 8);
        drops += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${r1(s * 0.8)}" ry="${r1(s)}"/>`;
      }
      for (let i = 0; i < 9; i++) bokeh += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 520))}" r="${f(rr(30, 90))}" opacity="${r1(rr(0.12, 0.3))}"/>`;
      // brown sugar "tiger" streaks: wavy tapering bands
      let tiger2 = '';
      for (let i = 0; i < 8; i++) {
        const x0 = 445 + i * 44 + rr(-10, 10), L = rr(230, 430), w0 = rr(26, 50), ph = rr(0, 6), drift = rr(-24, 24);
        for (const k of [1.7, 1]) {
          const L1 = [], R1 = [];
          for (let y = 0; y <= L; y += 30) {
            const t = y / L, xc = x0 + Math.sin(y / 60 + ph) * 14 + drift * t, ww = (w0 * Math.pow(1 - t, 0.8) + 3) * k;
            L1.push(`${f(xc - ww / 2)} ${f(250 + y)}`);
            R1.unshift(`${f(xc + ww / 2)} ${f(250 + y)}`);
          }
          const d = `M${L1.join('L')}L${R1.join('L')}Z`;
          if (k > 1) tiger2 += d; else tiger += d;
        }
      }
      return svg(w, h,
        lg('bg', [[0, '#ffe4d6'], [1, '#f6bfb8']]) +
        lg('tbl', [[0, '#fff2ea'], [1, '#f3d6cc']]) +
        lg('tea', [[0, '#f3dcc0'], [0.55, '#e6be95'], [1, '#cf9a6a']]) +
        lg('side', [[0, '#fff', 0.5], [0.1, '#fff', 0.08], [0.85, '#fff', 0], [0.95, '#fff', 0.3], [1, '#fff', 0.05]], 0, 0, 1, 0) +
        rg('pearl', [[0, '#7a4a2c'], [0.55, '#2e160a'], [1, '#150803']], 0.35, 0.3, 0.7) +
        lg('straw', [[0, '#8f72dc'], [0.45, '#c8b2f8'], [1, '#7c5fd0']], 0, 0, 1, 0) +
        `<g id="pl"><circle r="16" fill="url(#pearl)"/><ellipse cx="-5" cy="-7" rx="5" ry="3.5" fill="#fff" opacity=".65"/></g>` +
        `<clipPath id="cup"><path d="${body}"/></clipPath>`,
        `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
        `<g fill="#fff">${bokeh}</g>` +
        `<path d="M0 640C300 610 900 610 1200 640V900H0Z" fill="url(#tbl)"/>` +
        shadow(660, 800, 280, 46, 0.7) +
        `<use href="#pl" x="300" y="790"/><use href="#pl" x="336" y="808"/><use href="#pl" x="884" y="826"/>` +
        `<g transform="translate(200 760) rotate(-20)"><path d="M0 0C30-40 100-46 140-20C100 10 40 20 0 0Z" fill="#f6a5bd"/><path d="M10-4C50-24 100-28 130-20" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></g>` +
        `<path d="M640 196L748 -20" stroke="url(#straw)" stroke-width="38"/>` +
        `<path d="M650 190L756 -20" stroke="#fff" stroke-width="6" opacity=".55"/>` +
        `<g clip-path="url(#cup)">` +
        `<path d="M425 250A175 36 0 0 0 775 250L740 800H460Z" fill="url(#tea)"/>` +
        `<path d="${tiger2}" fill="#8a4416" opacity=".22"/><path d="${tiger}" fill="#7a3810" opacity=".42"/>` +
        `<path d="M425 250A175 36 0 0 0 775 250L772 276C700 300 500 300 428 276Z" fill="#8a4518" opacity=".45"/>` +
        `<g fill="#fff" opacity=".32" stroke="#fff" stroke-width="3"><rect x="470" y="262" width="74" height="70" rx="12" transform="rotate(-14 507 297)"/><rect x="600" y="268" width="80" height="74" rx="12" transform="rotate(10 640 305)"/><rect x="540" y="320" width="66" height="60" rx="10" transform="rotate(24 573 350)"/></g>` +
        `<path d="M612 250L590 640" stroke="#b49be8" stroke-width="32" opacity=".35"/>` +
        pearls +
        `<rect x="400" y="190" width="400" height="620" fill="url(#side)"/>` +
        `</g>` +
        `<path d="${body}" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>` +
        `<g fill="#fff" opacity=".55">${drops}</g>` +
        `<ellipse cx="600" cy="790" rx="130" ry="26" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>` +
        // sealed lid with a lotus print
        `<ellipse cx="600" cy="200" rx="181" ry="40" fill="#e9e4ec"/>` +
        `<ellipse cx="600" cy="198" rx="170" ry="34" fill="#fff6fa"/>` +
        `<g transform="translate(600 198) scale(1 .22)"><circle r="120" fill="none" stroke="#f3b6c8" stroke-width="8"/>` +
        `<path d="M0-70C26-40 26 10 0 40C-26 10-26-40 0-70ZM-60-30C-20-24 0 10 0 40C-30 30-56 4-60-30ZM60-30C20-24 0 10 0 40C30 30 56 4 60-30Z" fill="#ef8fac"/></g>` +
        `<path d="M432 214A180 38 0 0 0 768 214" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>` +
        `<ellipse cx="636" cy="196" rx="19" ry="7" fill="#6e52bf"/>`
      , 0.45, 0.8);
    },
  });

  // ---- Pan-fried dumplings with a crispy lace -------------------------------------------------
  def('food_dumplings', {
    title: 'Pan-fried dumplings',
    w: 1200, h: 900, tags: ['food', 'dumplings'],
    svg: (w, h) => {
      seed(17);
      const cx = 520, cy = 440;
      let holes = '';
      for (let i = 0; i < 80; i++) {
        const a = rr(0, 6.28), r = 120 + Math.pow(rnd(), 0.5) * 180, s = rr(3, 4 + (r - 120) * 0.06);
        holes += `M${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}a${f(s)} ${f(s * rr(0.6, 1))} ${f(rr(0, 90))} 1 0 .1 0`;
      }
      // pleats along the top arc of one dumpling
      let pl = '';
      for (let k = -3; k <= 3; k++) {
        const x = k * 22, y = -60 + 0.0062 * x * x;
        pl += `M${x} ${r1(y + 2)}Q${r1(x * 0.85)} ${r1(y + 16)} ${r1(x * 0.7)} ${r1(y + 30)}`;
      }
      let dumps = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * 360) / 8 + 8;
        dumps += `<use href="#dp" transform="translate(${cx} ${cy}) rotate(${a}) translate(226 0) rotate(${90 + f(rr(-5, 5))}) scale(${r1(rr(0.87, 0.92))})"/>`;
      }
      dumps += `<use href="#dp" transform="translate(${cx - 4} ${cy - 36}) rotate(-6) scale(.9)"/><use href="#dp" transform="translate(${cx + 6} ${cy + 44}) rotate(174) scale(.9)"/>`;
      const DP = 'M-88 16C-90-30-50-64 0-64C50-64 90-30 88 16C60 34-60 34-88 16Z';
      return svg(w, h,
        rg('cloth', [[0, '#2c4f57'], [1, '#13262b']], 0.45, 0.45, 0.8) +
        lg('plate', [[0, '#ffffff'], [1, '#d6d2cb']], 0, 0, 1, 1) +
        lg('iron', [[0, '#55565c'], [0.4, '#2a2a2f'], [1, '#111114']], 0, 0, 1, 1) +
        rg('pan', [[0, '#2a2a2e'], [1, '#141416']], 0.45, 0.4, 0.6) +
        rg('lace', [[0, '#c27a24'], [0.5, '#dc9c3e'], [0.85, '#efc366'], [1, '#f4d68e']], 0.5, 0.5, 0.5) +
        lg('dough', [[0, '#fffdf6'], [0.55, '#f6eedf'], [1, '#e6d2ac']]) +
        chopDef('#c9a27a', '#8e6a44') +
        `<g id="dp"><path d="${DP}" fill="#000" opacity=".3" transform="translate(6 9)"/><path d="${DP}" fill="url(#dough)"/>` +
        `<path d="M-86 16C-60 34 60 34 86 16" stroke="#c98a36" stroke-width="8" fill="none" stroke-linecap="round"/>` +
        `<path d="${pl}" stroke="#d6c39f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${pl}" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" transform="translate(-4 0)" opacity=".9"/>` +
        `<path d="M-64-30C-44-52 30-58 54-46" stroke="#fff" stroke-width="6" fill="none" opacity=".8" stroke-linecap="round"/></g>`,
        `<rect width="${w}" height="${h}" fill="url(#cloth)"/>` +
        `<path d="M0 120H1200M0 132H1200" stroke="#5f8a8f" stroke-width="3" opacity=".35"/>` +
        // sauce
        `<g transform="translate(1070 160)">${shadow(14, 18, 130, 120)}<circle r="112" fill="url(#plate)"/><circle r="90" fill="#2e1209"/><path d="M-50-20C-30-50 30-56 54-20C40 10-30 20-50-20Z" fill="#d23a12" opacity=".75"/><g fill="#f0e1b9"><circle cx="-10" cy="30" r="5"/><circle cx="20" cy="40" r="4"/><circle cx="34" cy="10" r="4"/></g><ellipse cx="-30" cy="-40" rx="26" ry="9" fill="#fff" opacity=".25"/></g>` +
        // cast-iron pan with handle
        shadow(cx + 40, cy + 46, 430, 420, 0.95) +
        `<g transform="translate(${cx} ${cy}) rotate(38)"><rect x="330" y="-38" width="300" height="76" rx="30" fill="#000" opacity=".35" transform="translate(10 14)"/><rect x="330" y="-38" width="300" height="76" rx="30" fill="url(#iron)"/><circle cx="586" cy="0" r="16" fill="#13262b"/></g>` +
        `<circle cx="${cx}" cy="${cy}" r="370" fill="url(#iron)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="340" fill="url(#pan)"/>` +
        `<path d="M${cx - 356} ${cy - 30}A358 358 0 0 1 ${cx - 60} ${cy - 352}" stroke="#8a8c94" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>` +
        // crispy lace with holes showing the dark pan
        `<path d="${blob(cx, cy, 304, 304, 44, 0.06)}" fill="url(#lace)"/>` +
        `<path d="${holes}" fill="#1c1c1f" stroke="#a8641c" stroke-width="2.5"/>` +
        dumps +
        `<path d="${specks(cx, cy, 300, 50, 5)}" stroke="#f7ebcf" stroke-width="4.5" stroke-linecap="round"/>` +
        `<path d="${rings(cx, cy, 0, 280, 18, 7)}" fill="none" stroke="#5fae3e" stroke-width="5"/>` +
        steam(cx - 60, cy - 30, 340, 30, 0.8) + steam(cx + 120, cy + 40, 300, -26, 0.6) +
        chopsticks(70, 880, 400, -20)
      , 0.5);
    },
  });


  // ---- Lotus flower pastries ----------------------------------------------------------------
  def('food_lotus_cake', {
    title: 'Lotus flower pastries',
    w: 1200, h: 900, tags: ['food', 'lotus', 'pastry'],
    svg: (w, h) => {
      seed(3);
      const E = (35 * Math.PI) / 180;
      // A flaky lotus pastry seen at 3/4; petals sorted back to front.
      const bloom = (cx, cy, s) => {
        const ringsP = [[7, 46, 1.25, 112, 0.02], [6, 30, 0.82, 100, 0.55], [5, 16, 0.45, 84, 1.1]];
        const P = [];
        ringsP.forEach(([n, rb, tilt, L, off]) => {
          for (let i = 0; i < n; i++) {
            const th = off + (i * Math.PI * 2) / n;
            const bx = rb * Math.cos(th), bz = rb * Math.sin(th);
            const dx = L * Math.sin(tilt) * Math.cos(th);
            const dy = -L * Math.cos(tilt) * Math.cos(E) + L * Math.sin(tilt) * Math.sin(th) * Math.sin(E);
            const l = Math.hypot(dx, dy), ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
            P.push({ z: bz + L * 0.5 * Math.sin(tilt) * Math.sin(th), x: bx, y: bz * Math.sin(E), l, ang });
          }
        });
        P.sort((a, b) => a.z - b.z);
        let out = '', core = false;
        for (const p of P) {
          if (!core && p.z > 4) {
            out += `<ellipse cx="0" cy="-34" rx="26" ry="22" fill="url(#core)"/><ellipse cx="-7" cy="-42" rx="9" ry="5" fill="#fff" opacity=".6"/>`;
            core = true;
          }
          out += `<use href="#pt" transform="translate(${r1(p.x)} ${r1(p.y)}) rotate(${r1(p.ang)}) scale(1 ${r1(p.l / 100)})"/>`;
        }
        return `<g transform="translate(${cx} ${cy}) scale(${s})"><ellipse cx="8" cy="40" rx="150" ry="44" fill="url(#sh)"/>${out}</g>`;
      };
      let veins = '';
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        veins += `M600 660L${f(600 + Math.cos(a) * 420)} ${f(660 + Math.sin(a) * 160)}`;
      }
      let bok = '';
      for (let i = 0; i < 10; i++) bok += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 330))}" r="${f(rr(24, 70))}" opacity="${r1(rr(0.15, 0.4))}"/>`;
      return svg(w, h,
        lg('bg', [[0, '#f6e9d8'], [0.6, '#ead6c0'], [1, '#d4bea4']]) +
        lg('tbl', [[0, '#d9c2a3'], [1, '#a98a66']]) +
        rg('plate', [[0, '#eef6f1'], [0.8, '#d3e6dc'], [1, '#a9c8b8']], 0.5, 0.4, 0.6) +
        rg('leaf', [[0, '#9ccf86'], [0.75, '#5c9a4a'], [1, '#3d7a34']], 0.5, 0.45, 0.6) +
        lg('pet', [[0, '#f3dcb4'], [0.25, '#fdf6ec'], [0.6, '#fbe6e0'], [1, '#ec85a6']], 0, 1, 0, 0) +
        rg('core', [[0, '#ffe08a'], [0.7, '#f2b93c'], [1, '#d8952a']], 0.4, 0.35, 0.7) +
        lg('cup', [[0, '#e9f3ee'], [1, '#a9c8b8']], 0, 0, 1, 0) +
        lg('beam', [[0, '#fff', 0.35], [1, '#fff', 0]]) +
        `<g id="pt"><path d="M0 0C34-18 30-86 0-100C-30-86-34-18 0 0Z" fill="url(#pet)" stroke="#e2b29c" stroke-width="2"/>` +
        `<path d="M0-6C24-20 22-76 0-88C-22-76-24-20 0-6M0-16C15-28 14-66 0-76C-14-66-15-28 0-16M0-28C7-36 7-56 0-62C-7-56-7-36 0-28" fill="none" stroke="#efc4b2" stroke-width="2"/></g>`,
        `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
        `<g fill="#fff">${bok}</g>` +
        `<path d="M120 0L320 0L120 420L-80 420ZM420 0L520 0L330 420L230 420Z" fill="url(#beam)"/>` +
        `<path d="M0 380C300 360 900 360 1200 380V900H0Z" fill="url(#tbl)"/>` +
        `<path d="M0 380C300 360 900 360 1200 380" stroke="#fff" stroke-width="3" opacity=".35" fill="none"/>` +
        // teacup
        `<g transform="translate(1060 360)">${shadow(10, 96, 130, 28)}<path d="M-86 0C-82 64-50 98 0 98C50 98 82 64 86 0Z" fill="url(#cup)"/><ellipse rx="86" ry="22" fill="#d9ebe2"/><ellipse rx="76" ry="16" fill="#c79a3a"/><ellipse cx="-20" cy="-4" rx="26" ry="5" fill="#fff" opacity=".35"/></g>` +
        steam(1060, 340, 280, 22, 0.9) +
        // plate + leaf
        shadow(620, 700, 560, 210, 0.8) +
        `<ellipse cx="600" cy="670" rx="530" ry="205" fill="url(#plate)"/>` +
        `<ellipse cx="600" cy="660" rx="486" ry="178" fill="#e2efe8"/>` +
        `<path d="${blob(600, 660, 440, 160, 30, 0.04)}" fill="url(#leaf)"/>` +
        `<path d="${veins}" stroke="#b4dd98" stroke-width="3" opacity=".55"/>` +
        bloom(390, 590, 1.2) + bloom(810, 585, 1.2) + bloom(600, 700, 1.45) +
        `<g fill="#f2e3c4"><ellipse cx="170" cy="840" rx="18" ry="13"/><ellipse cx="206" cy="866" rx="18" ry="13"/></g>`
      , 0.45, 0.8);
    },
  });

  // ---- Congee -----------------------------------------------------------------------------
  def('food_congee', {
    title: 'Century egg congee',
    w: 1200, h: 900, tags: ['food', 'congee', 'breakfast'],
    svg: (w, h) => {
      seed(41);
      const cx = 520, cy = 460;
      let floss = '', ginger = '';
      for (let i = 0; i < 50; i++) {
        const x = cx + 110 + rr(-70, 70), y = cy - 100 + rr(-46, 46), a = rr(0, 6.28);
        floss += `M${f(x)} ${f(y)}q${f(Math.cos(a) * 14)} ${f(Math.sin(a) * 14)} ${f(Math.cos(a + 1) * 24)} ${f(Math.sin(a + 1) * 24)}`;
      }
      for (let i = 0; i < 20; i++) {
        const x = cx - 150 + rr(-40, 40), y = cy - 110 + rr(-30, 30), a = rr(-0.8, 0.8);
        ginger += `M${f(x)} ${f(y)}l${f(Math.cos(a) * 44)} ${f(Math.sin(a) * 44)}`;
      }
      let wedges = '';
      for (let i = 0; i < 6; i++) wedges += `<use href="#egg" transform="translate(${cx + 10} ${cy + 70}) rotate(${i * 60 + 15}) translate(22 0)"/>`;
      return svg(w, h,
        lg('tbl', [[0, '#e9edf0'], [1, '#c9d2d8']], 0, 0, 1, 1) +
        lg('bowl', [[0, '#5a4438'], [1, '#22160f']], 0, 0, 1, 1) +
        lg('rim', [[0, '#efe2cf'], [1, '#bda789']], 0, 0, 1, 1) +
        rg('cg', [[0, '#fffdf7'], [0.75, '#f5eddd'], [1, '#e2d4bb']], 0.45, 0.42, 0.6) +
        lg('eggG', [[0, '#3a2510'], [0.5, '#7a4e22'], [1, '#a8763c']], 0, 0, 1, 0) +
        lg('yt', [[0, '#f4c062'], [0.5, '#dd9a3a'], [1, '#b06a1c']]) +
        lg('plate', [[0, '#ffffff'], [1, '#d6d2cb']], 0, 0, 1, 1) +
        lg('spoon', [[0, '#ffffff'], [1, '#dcd6cc']]) +
        `<g id="egg"><path d="M0 0C20-30 92-34 112 0C92 34 20 30 0 0Z" fill="#000" opacity=".2" transform="translate(5 7)"/><path d="M0 0C20-30 92-34 112 0C92 34 20 30 0 0Z" fill="url(#eggG)"/>` +
        `<path d="M30 0C42-16 82-16 96 0C82 16 42 16 30 0Z" fill="#33402f"/><path d="M48 0C58-6 76-6 84 0C76 6 58 6 48 0Z" fill="#7b8650"/>` +
        `<path d="M12-8C30-24 80-26 100-10" stroke="#e8c48a" stroke-width="3" fill="none" opacity=".6"/></g>` +
        `<clipPath id="bc"><circle cx="${cx}" cy="${cy}" r="282"/></clipPath>`,
        `<rect width="${w}" height="${h}" fill="url(#tbl)"/>` +
        `<g transform="rotate(-8 900 800)"><rect x="700" y="640" width="640" height="420" fill="#f7f3ec"/><path d="M700 680H1340M700 694H1340" stroke="#e0a85a" stroke-width="5"/></g>` +
        // youtiao on a plate
        `<g transform="translate(1010 200) rotate(-24)">${shadow(14, 22, 220, 130)}<ellipse rx="210" ry="120" fill="url(#plate)"/>` +
        [-70, 10, 90].map((y, i) => `<g transform="translate(${i * 16 - 16} ${y - 20}) rotate(${i * 4 - 4})"><rect x="-150" y="-24" width="300" height="34" rx="17" fill="url(#yt)"/><rect x="-150" y="6" width="300" height="34" rx="17" fill="url(#yt)"/><path d="M-130-10H130M-120 22H120" stroke="#fbe2a6" stroke-width="5" stroke-linecap="round" opacity=".6" stroke-dasharray="30 14"/></g>`).join('') +
        `</g>` +
        // pickles
        `<g transform="translate(130 790)">${shadow(12, 16, 120, 110)}<circle r="100" fill="url(#plate)"/><circle r="80" fill="#f0ece2"/><g fill="#7f9a3a">${[[-20, -10], [16, 14], [20, -24], [-26, 26], [0, 0]].map(([x, y]) => `<rect x="${x - 16}" y="${y - 10}" width="32" height="20" rx="6" transform="rotate(${x} ${x} ${y})"/>`).join('')}</g></g>` +
        // bowl
        shadow(cx + 34, cy + 40, 390, 380, 0.85) +
        `<circle cx="${cx}" cy="${cy}" r="340" fill="url(#bowl)"/>` +
        `<circle cx="${cx}" cy="${cy}" r="336" fill="none" stroke="url(#rim)" stroke-width="12"/>` +
        `<circle cx="${cx}" cy="${cy}" r="320" fill="#2e211a"/>` +
        `<circle cx="${cx}" cy="${cy}" r="282" fill="url(#cg)"/>` +
        `<g clip-path="url(#bc)">` +
        `<path d="M${cx - 200} ${cy + 40}C${cx - 140} ${cy - 40} ${cx - 20} ${cy - 30} ${cx + 40} ${cy + 20}M${cx - 60} ${cy + 200}C${cx} ${cy + 140} ${cx + 120} ${cy + 160} ${cx + 180} ${cy + 100}" stroke="#fff" stroke-width="14" fill="none" opacity=".55" stroke-linecap="round"/>` +
        wedges +
        `<path d="${floss}" stroke="#c48d52" stroke-width="5" fill="none" stroke-linecap="round"/><path d="${floss}" stroke="#e2b276" stroke-width="2" fill="none" transform="translate(-2 -2)"/>` +
        `<path d="${ginger}" stroke="#f3dc8e" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="${rings(cx, cy, 20, 230, 24)}" stroke="#5aa83e" stroke-width="5" fill="none"/>` +
        `<path d="M${cx - 230} ${cy + 120}C${cx - 180} ${cy + 140} ${cx - 120} ${cy + 130} ${cx - 90} ${cy + 160}" stroke="#7a3d12" stroke-width="7" fill="none" opacity=".5" stroke-linecap="round"/>` +
        `<g fill="#e8b84a" opacity=".55"><ellipse cx="${cx - 60}" cy="${cy + 140}" rx="16" ry="10"/><ellipse cx="${cx + 190}" cy="${cy + 30}" rx="12" ry="8"/><ellipse cx="${cx - 170}" cy="${cy + 10}" rx="10" ry="7"/></g>` +
        `<path d="${specks(cx, cy, 220, 40, 2)}" stroke="#6e6a64" stroke-width="3" stroke-linecap="round"/>` +
        `</g>` +
        `<path d="M${cx - 330} ${cy - 20}A334 334 0 0 1 ${cx - 40} ${cy - 330}" fill="none" stroke="#fff6e8" stroke-width="7" opacity=".7" stroke-linecap="round"/>` +
        // spoon
        `<g transform="translate(${cx + 200} ${cy + 170}) rotate(38)"><path d="M-70 0C-70-44 34-50 56-16L150-22C164-22 168-4 156 2L56 12C34 48-70 44-70 0Z" fill="#000" opacity=".2" transform="translate(10 14)"/>` +
        `<path d="M-70 0C-70-44 34-50 56-16L150-22C164-22 168-4 156 2L56 12C34 48-70 44-70 0Z" fill="url(#spoon)"/><ellipse cx="-8" cy="0" rx="50" ry="30" fill="#f4ecdc"/><path d="M70-12L146-16" stroke="#3f6fb0" stroke-width="4" stroke-linecap="round"/></g>` +
        steam(cx - 40, cy - 40, 360, 32, 0.9) + steam(cx + 90, cy, 300, -28, 0.7)
      , 0.45, 0.7);
    },
  });

  // ---- Skewers ----------------------------------------------------------------------------
  def('food_skewers', {
    title: 'Lamb skewers',
    w: 1200, h: 900, tags: ['food', 'skewers', 'night'],
    svg: (w, h) => {
      seed(9);
      // rounded, slightly irregular cube of meat
      const cube = (rx, ry) => {
        const P = [[-rx, -ry], [rx, -ry], [rx, ry], [-rx, ry]].map(([x, y]) => [x + rr(-6, 6), y + rr(-6, 6)]);
        const m = (a, b, t = 0.5) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        const p = (q) => `${f(q[0])} ${f(q[1])}`;
        let d = '';
        for (let i = 0; i < 4; i++) {
          const a = P[i], b = P[(i + 1) % 4], c = P[(i + 2) % 4], m1 = m(a, b), m2 = m(b, c);
          d += (i ? '' : `M${p(m1)}`) + `L${p(m(m1, b, 0.4))}Q${p(b)} ${p(m(b, m2, 0.6))}L${p(m2)}`;
        }
        return d + 'Z';
      };
      const band = (y, n) => {
        let d = '';
        for (let i = 0; i < n; i++) {
          const t = rr(0, 3.14);
          d += `M${f(rr(-290, 230))} ${f(y + rr(-30, 30))}l${f(Math.cos(t) * 6)} ${f(Math.sin(t) * 6)}`;
        }
        return d;
      };
      let sk = '', chili = '', cumin = '';
      for (let s = 0; s < 5; s++) {
        const y = -190 + s * 92;
        sk += `<path d="M-410 ${y}H390" stroke="#000" stroke-width="10" opacity=".3" transform="translate(6 10)"/><path d="M-410 ${y}H390" stroke="url(#metal)" stroke-width="7"/><circle cx="-420" cy="${y}" r="12" fill="none" stroke="url(#metal)" stroke-width="6"/>`;
        for (let i = 0; i < 6; i++) {
          const x = -250 + i * 86 + f(rr(-4, 4)), v = (i * 7 + s * 3) % 4, fat = (i + s) % 3 === 1, rot = f(rr(-12, 12));
          const t = `translate(${x} ${y + f(rr(-3, 3))}) rotate(${rot})`;
          sk += `<use href="#k${v}" transform="translate(5 8) ${t}" fill="#000" opacity=".3"/><use href="#k${v}" transform="${t}" fill="url(#${fat ? 'fat' : 'lean'})" stroke="${fat ? '#b67a3a' : '#3a1206'}" stroke-width="4"/>` +
            `<path d="M${x - 20} ${y - 18}q14-8 30-4" stroke="${fat ? '#fff3d6' : '#e09a66'}" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`;
        }
        chili += band(y, 16);
        cumin += band(y, 18);
      }
      let smoke = '';
      for (let i = 0; i < 3; i++) smoke += steam(260 + i * 320, 900, 700, 60, 0.6);
      return svg(w, h,
        rg('bg', [[0, '#4a2a18'], [0.5, '#24160f'], [1, '#110b08']], 0.2, 0.2, 1) +
        lg('tray', [[0, '#c9ced6'], [1, '#6c727c']], 0, 0, 1, 1) +
        lg('paper', [[0, '#f2e6cc'], [1, '#d9c6a2']], 0, 0, 1, 1) +
        rg('lean', [[0, '#c66c36'], [0.55, '#8e3c18'], [1, '#4a1808']], 0.42, 0.36, 0.62) +
        rg('fat', [[0, '#f8daa6'], [0.6, '#e0aa66'], [1, '#a8662a']], 0.42, 0.36, 0.62) +
        lg('metal', [[0, '#eef0f4'], [1, '#8d939c']]) +
        rg('glow', [[0, '#ff8a2a', 0.55], [1, '#ff8a2a', 0]]) +
        lg('corn', [[0, '#ffe07a'], [1, '#e2a822']]) +
        [0, 1, 2, 3].map((i) => `<path id="k${i}" d="${cube(rr(33, 38), rr(30, 34))}"/>`).join(''),
        `<rect width="${w}" height="${h}" fill="url(#bg)"/>` +
        `<circle cx="80" cy="60" r="520" fill="url(#glow)"/>` +
        `<g transform="translate(600 470) rotate(-7)">` +
        `<rect x="-520" y="-330" width="1040" height="660" rx="40" fill="#000" opacity=".4" transform="translate(16 22)"/>` +
        `<rect x="-520" y="-330" width="1040" height="660" rx="40" fill="url(#tray)"/>` +
        `<rect x="-490" y="-300" width="980" height="600" rx="24" fill="#5b616a"/>` +
        `<path d="M-470-290L470-300L480 290L-480 300Z" fill="url(#paper)"/>` +
        `<g fill="#c9a666" opacity=".35"><ellipse cx="-200" cy="-120" rx="120" ry="60"/><ellipse cx="160" cy="110" rx="160" ry="70"/><ellipse cx="300" cy="-200" rx="80" ry="40"/></g>` +
        `<g transform="rotate(-14) translate(20 -10)">${sk}` +
        `<path d="${chili}" stroke="#d8361c" stroke-width="5" stroke-linecap="round"/><path d="${cumin}" stroke="#d9b874" stroke-width="5" stroke-linecap="round"/></g>` +
        `<g transform="translate(-300 230) rotate(-20)"><rect x="-120" y="-40" width="240" height="80" rx="38" fill="url(#corn)"/><path d="M-110-20H110M-112 0H112M-110 20H110" stroke="#c98a14" stroke-width="3" stroke-dasharray="12 6"/>` +
        `<g fill="#6a3a10" opacity=".55"><ellipse cx="-40" cy="-10" rx="22" ry="12"/><ellipse cx="50" cy="16" rx="26" ry="10"/></g><path d="M-170 0H170" stroke="url(#metal)" stroke-width="6"/></g>` +
        `</g>` +
        `<g transform="translate(1100 110)">${shadow(10, 16, 120, 110)}<circle r="100" fill="url(#tray)"/><circle r="84" fill="#5b616a"/><circle r="80" fill="#c03a18"/><path d="${specks(0, 0, 70, 40, 3)}" stroke="#e8c27a" stroke-width="4" stroke-linecap="round"/></g>` +
        `<g transform="translate(1110 820)"><circle r="120" fill="#000" opacity=".35" transform="translate(12 16)"/><circle r="120" fill="#e9eef4" opacity=".55"/><circle r="108" fill="#5a0f1c"/><g fill="#fff" opacity=".3"><rect x="-60" y="-60" width="56" height="56" rx="8" transform="rotate(12)"/><rect x="0" y="-10" width="52" height="52" rx="8" transform="rotate(-18)"/></g><path d="M-90-40A100 100 0 0 1-30-96" stroke="#fff" stroke-width="6" opacity=".6" fill="none"/></g>` +
        `<g opacity=".7">${smoke}</g>`
      , 0.55, 1);
    },
  });


  // ---- Radish cake ------------------------------------------------------------------------
  def('food_radish_cake', {
    title: 'Pan-fried radish cake',
    w: 1200, h: 900, tags: ['food', 'radish'],
    svg: (w, h) => {
      seed(13);
      const W = 170, T = 60, DX = 30, DY = -66;
      const BITS = ['#c43a3a', '#e08a5a', '#7cb04a', '#c43a3a'];
      const block = (x, y) => {
        let bits = '', spots = '', top = '';
        for (let i = 0; i < 7; i++) bits += `<rect x="${f(x + rr(10, W - 24))}" y="${f(y - T + rr(14, T - 18))}" width="${f(rr(8, 14))}" height="${f(rr(6, 10))}" rx="2" fill="${BITS[f(rr(0, 3))]}"/>`;
        for (let i = 0; i < 6; i++) {
          const u = rr(0.1, 0.9), v = rr(0.15, 0.85);
          spots += `<ellipse cx="${f(x + u * W + v * DX)}" cy="${f(y - T + v * DY)}" rx="${f(rr(8, 20))}" ry="${f(rr(4, 9))}"/>`;
        }
        for (let i = 0; i < 5; i++) {
          const u = rr(0.1, 0.9), v = rr(0.2, 0.8), px = x + u * W + v * DX, py = y - T + v * DY;
          top += i < 3 ? `M${f(px + 7)} ${f(py)}a7 6 0 1 0 0 .1` : '';
        }
        let ses = '';
        for (let i = 0; i < 6; i++) {
          const u = rr(0.1, 0.9), v = rr(0.15, 0.85), px = x + u * W + v * DX, py = y - T + v * DY, t = rr(0, 3);
          ses += `M${f(px)} ${f(py)}l${r1(Math.cos(t) * 7)} ${r1(Math.sin(t) * 4)}`;
        }
        return (
          `<path d="M${x} ${y}H${x + W}L${x + W + DX} ${y + DY}V${y + DY - T}H${x + DX}L${x} ${y - T}Z" fill="#000" opacity=".25" transform="translate(14 10)"/>` +
          `<path d="M${x + W} ${y}L${x + W + DX} ${y + DY}V${y + DY - T}L${x + W} ${y - T}Z" fill="#e2cfa8"/>` +
          `<rect x="${x}" y="${y - T}" width="${W}" height="${T}" fill="url(#cut)"/>` + bits +
          `<rect x="${x}" y="${y - 8}" width="${W}" height="8" fill="#b8742a"/><rect x="${x}" y="${y - T}" width="${W}" height="7" fill="#c98a36"/>` +
          `<path d="M${x} ${y - T}H${x + W}L${x + W + DX} ${y - T + DY}H${x + DX}Z" fill="url(#crust)"/>` +
          `<g fill="#a35e18" opacity=".45">${spots}</g>` +
          `<path d="M${x + 14} ${y - T - 6}H${x + W - 30}" stroke="#ffe3a0" stroke-width="5" opacity=".6" stroke-linecap="round"/>` +
          `<path d="${top}" fill="none" stroke="#5aa83e" stroke-width="5"/><path d="${ses}" stroke="#fbf0d6" stroke-width="4" stroke-linecap="round"/>`
        );
      };
      let bok = '';
      for (let i = 0; i < 9; i++) bok += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 260))}" r="${f(rr(20, 60))}" opacity="${r1(rr(0.12, 0.35))}"/>`;
      const blocks = block(320, 520) + block(520, 520) + block(720, 520) + block(260, 680) + block(470, 680) + block(680, 680);
      const PLATE = 'M300 400Q290 380 320 380H900Q930 380 940 400L1040 700Q1046 724 1016 724H180Q150 724 158 700Z';
      return svg(w, h,
        lg('wall', [[0, '#3a241a'], [1, '#6b4530']]) +
        lg('tbl', [[0, '#8a5a38'], [1, '#c08a5a']]) +
        lg('plate', [[0, '#ffffff'], [1, '#dcd8d0']], 0, 0, 1, 1) +
        lg('cut', [[0, '#f7eedb'], [1, '#e9dcc0']]) +
        lg('crust', [[0, '#e9b154'], [0.5, '#d4923a'], [1, '#b8701e']], 0, 0, 1, 1) +
        chopDef('#2b2b2b', '#0e0e0e'),
        `<rect width="${w}" height="${h}" fill="url(#wall)"/>` +
        `<g fill="#ffcf8a">${bok}</g>` +
        `<path d="M0 300C300 284 900 284 1200 300V900H0Z" fill="url(#tbl)"/>` +
        `<g transform="translate(0 300)" opacity=".5">${wood(1200, 600, null, '#5a3820', '#c99868', 5)}</g>` +
        // sauce dishes
        `<g transform="translate(1030 330)">${shadow(10, 26, 150, 50)}<ellipse rx="130" ry="56" fill="url(#plate)"/><ellipse rx="104" ry="42" fill="#8e2410"/><ellipse cx="-20" cy="-8" rx="50" ry="16" fill="#d8481c" opacity=".7"/><g fill="#4a1206"><circle cx="20" cy="6" r="8"/><circle cx="-40" cy="10" r="6"/><circle cx="50" cy="-10" r="7"/></g></g>` +
        `<g transform="translate(170 350)">${shadow(8, 20, 110, 36)}<ellipse rx="96" ry="40" fill="url(#plate)"/><ellipse rx="74" ry="28" fill="#2a1208"/><ellipse cx="-20" cy="-8" rx="24" ry="6" fill="#fff" opacity=".25"/></g>` +
        // plate
        `<path d="${PLATE}" fill="#000" opacity=".3" transform="translate(16 18)"/><path d="${PLATE}" fill="url(#plate)"/>` +
        `<path d="M330 410H890L976 690H222Z" fill="#f1eee9"/>` +
        blocks +
        chopsticks(60, 860, 520, -16)
      , 0.5, 0.9);
    },
  });
})();
