/* Food — Wanmin Go menu photos (1200×900). Overhead and angled food photography, warm light, real tables. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- kit (self-contained) ---------- */
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
  const r0 = Math.round;
  const f1 = (v) => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const stops = (s) =>
    s.split('|').map((t) => {
      const [c, o, a] = t.trim().split(/\s+/);
      return `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`;
    }).join('');
  const lin = (id, v, s) => {
    const [x1, y1, x2, y2] = v.split(' ');
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  };
  const rad = (id, v, s) => {
    const [cx, cy, r, fx, fy] = v.split(' ');
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}>${stops(s)}</radialGradient>`;
  };
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${FONT}" stroke-linecap="round" stroke-linejoin="round"><defs>${defs}</defs>${body}</svg>`;
  // shared defs: soft shadow, vignette, steam, film grain
  const BASE = (vig) =>
    rad('sh', '.5 .5 .5', '#000 0 .5|#000 .55 .28|#000 1 0') +
    rad('vg', '.5 .5 .75', `#000 .55 0|#000 1 ${vig == null ? 0.5 : vig}`) +
    lin('stm', '0 1 0 0', '#fff 0 0|#fff .45 .5|#fff 1 0') +
    rad('hl', '.5 .5 .5', '#fff 0 .9|#fff 1 0') +
    `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const FIN = (op) => `<rect width="1200" height="900" fill="url(#vg)"/><rect width="1200" height="900" filter="url(#gr)" opacity="${op || 0.14}" style="mix-blend-mode:overlay"/>`;
  const sh = (cx, cy, rx, ry, op) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sh)"${op ? ` opacity="${op}"` : ''}/>`;
  const glint = (cx, cy, rx, ry, op) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#hl)" opacity="${op || 0.8}"/>`;
  // random point inside an ellipse
  const inE = (R, cx, cy, rx, ry, k) => {
    const a = R() * TAU, r = Math.sqrt(R()) * (k || 1);
    return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
  };
  // many tiny round dots in one path
  const dots = (R, n, cx, cy, rx, ry, rr, c, op) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = inE(R, cx, cy, rx, ry);
      const r = f1(rr * (0.7 + R() * 0.6));
      d += `M${r0(x - r)} ${r0(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`;
    }
    return `<path d="${d}" fill="${c}"${op ? ` opacity="${op}"` : ''}/>`;
  };
  // short round-capped dashes (sesame, rice, flakes, dill bits)
  const dashes = (R, n, cx, cy, rx, ry, len, sw, c, op) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = inE(R, cx, cy, rx, ry);
      const a = R() * TAU;
      d += `M${r0(x)} ${r0(y)}l${f1(Math.cos(a) * len)} ${f1(Math.sin(a) * len)}`;
    }
    return `<path d="${d}" stroke="${c}" stroke-width="${sw}"${op ? ` opacity="${op}"` : ''}/>`;
  };
  // scallion rings
  const scallions = (R, n, cx, cy, rx, ry, r) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const [x, y] = inE(R, cx, cy, rx, ry);
      const q = f1(r * (0.7 + R() * 0.5));
      d += `M${r0(x - q)} ${r0(y)}a${q} ${q} 0 1 0 ${2 * q} 0a${q} ${q} 0 1 0-${2 * q} 0Z`;
    }
    return `<path d="${d}" fill="#e6f5c8" stroke="#4f9a36" stroke-width="${f1(r * 0.45)}"/>`;
  };
  // tapered stick
  const stick = (x1, y1, x2, y2, w1, w2, c) => {
    const L = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / L, ny = (x2 - x1) / L;
    return `<path d="M${f1(x1 + nx * w1)} ${f1(y1 + ny * w1)}L${f1(x2 + nx * w2)} ${f1(y2 + ny * w2)}L${f1(x2 - nx * w2)} ${f1(y2 - ny * w2)}L${f1(x1 - nx * w1)} ${f1(y1 - ny * w1)}Z" fill="${c}"/>`;
  };
  const chops = (x1, y1, x2, y2, gx, gy, c, hi) =>
    `<g opacity=".35" transform="translate(10 14)">${stick(x1, y1, x2, y2, 7, 3.5, '#000')}${stick(x1 + gx, y1 + gy, x2 + gx * 0.5, y2 + gy * 0.5, 7, 3.5, '#000')}</g>` +
    stick(x1, y1, x2, y2, 7, 3.5, c) + stick(x1 + gx, y1 + gy, x2 + gx * 0.5, y2 + gy * 0.5, 7, 3.5, c) +
    `<path d="M${x1} ${y1 - 2}L${r0((x1 + x2) / 2)} ${r0((y1 + y2) / 2) - 1}" stroke="${hi || '#fff'}" stroke-width="2" opacity=".35"/>`;
  // steam wisps rising from (x,y)
  const steam = (R, x, y, n, ht) => {
    let s = '<g fill="none" stroke="url(#stm)">';
    for (let i = 0; i < n; i++) {
      const x0 = x + (i - (n - 1) / 2) * 70 + (R() - 0.5) * 30, k = ht * (0.7 + R() * 0.4), sw = 14 + R() * 18;
      s += `<path d="M${r0(x0)} ${y}C${r0(x0 - 40)} ${r0(y - k * 0.3)} ${r0(x0 + 40)} ${r0(y - k * 0.5)} ${r0(x0)} ${r0(y - k * 0.7)}S${r0(x0 + 20)} ${r0(y - k)} ${r0(x0 - 10)} ${r0(y - k * 1.15)}" stroke-width="${r0(sw)}" opacity="${f1(0.18 + R() * 0.14)}"/>`;
    }
    return s + '</g>';
  };
  // wooden planks (horizontal), grain lines
  const wood = (R, c0, c1, line, n) => {
    let s = `<rect width="1200" height="900" fill="url(#wd)"/>`;
    let d = '';
    for (let i = 0; i < (n || 26); i++) { const y = r0(R() * 900); d += `M0 ${y}C300 ${y + r0((R() - 0.5) * 24)} 800 ${y + r0((R() - 0.5) * 24)} 1200 ${y + r0((R() - 0.5) * 16)}`; }
    s += `<path d="${d}" fill="none" stroke="${line}" stroke-width="2" opacity=".35"/>`;
    return lin('wd', '0 0 1 1', `${c0} 0|${c1} 1`) + '\u0000' + s;
  };
  const split = (x) => x.split('\u0000');
  // many dried chilies as three paths (pods, sheen, stems)
  const chilis = (list, c) => {
    let pod = '', hi = '', st = '';
    for (const [x, y, a, l] of list) {
      const ca = Math.cos(a * Math.PI / 180), sa = Math.sin(a * Math.PI / 180);
      const P = (u, v) => `${r0(x + u * ca - v * sa)} ${r0(y + u * sa + v * ca)}`;
      pod += `M${P(-l, 0)}Q${P(0, -l * 0.42)} ${P(l, -2)}Q${P(l * 0.2, l * 0.48)} ${P(-l, 0)}Z`;
      hi += `M${P(-l * 0.55, -4)}Q${P(0, -l * 0.26)} ${P(l * 0.6, -5)}`;
      st += `M${P(l, -2)}L${P(l * 1.3, -7)}`;
    }
    return `<path d="${pod}" fill="${c || '#a3150c'}"/><path d="${hi}" stroke="#ff8a6a" stroke-width="2.5" fill="none" opacity=".5"/><path d="${st}" stroke="#6b5a2a" stroke-width="4.5"/>`;
  };
  // Wanmin Go logo
  const logo = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#d8392b"/><path d="M${f1(-r * 0.55)} ${f1(-r * 0.2)}Q0 ${f1(r * 0.8)} ${f1(r * 0.55)} ${f1(-r * 0.2)}" stroke="#fff" stroke-width="${f1(r * 0.22)}" fill="none"/><path d="M${f1(-r * 0.2)} ${f1(-r * 0.7)}q${f1(r * 0.2)} ${f1(r * 0.2)} 0 ${f1(r * 0.45)}M${f1(r * 0.2)} ${f1(-r * 0.7)}q${f1(r * 0.2)} ${f1(r * 0.2)} 0 ${f1(r * 0.45)}" stroke="#fff" stroke-width="${f1(r * 0.13)}" fill="none"/></g>`;

  /* =========================================================================================
     food_hotpot — red spicy hotpot, overhead
     ========================================================================================= */
  def('food_hotpot', {
    title: 'Spicy hotpot', w: 1200, h: 900, tags: ['food', 'hotpot', 'spicy', 'wanmin'],
    svg: (w, h) => {
      const R = rng(101);
      const D = BASE(0.55) +
        lin('bg', '0 0 1 1', '#2b2a2e 0|#17161a 1') +
        lin('rim', '0 0 1 1', '#f2f2f0 0|#a9abb0 .35|#e8e9ea .55|#6d7076 1') +
        rad('br', '.46 .44 .55', '#f0561f 0|#d2280f .45|#a3140a .8|#6e0905 1') +
        rad('ins', '.5 .5 .5', '#000 .82 0|#000 1 .45') +
        rad('oil', '.5 .5 .5', '#ffb347 0 .55|#ff8a2a .6 .25|#ff8a2a 1 0') +
        rad('fb', '.38 .35 .6', '#ffffff 0|#f3e9d8 .6|#cdbb9f 1') +
        lin('plt', '0 0 1 1', '#ffffff 0|#e6e2dc 1') +
        `<g id="bf"><ellipse rx="44" ry="25" fill="#c2414b" stroke="#a3313b" stroke-width="2"/><path d="M-32 -8Q-10 -17 6 -7T34 -4M-32 6Q-8 -3 10 8T30 10" stroke="#f3cfd0" stroke-width="3.5" fill="none"/></g>` +
        `<g id="ls"><circle r="44" fill="#f2e6cc" stroke="#d9c49c" stroke-width="5"/><path d="M-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM15 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM-29 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM4 -19a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM-18 -19a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM4 19a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM-18 19a7 7 0 1 0 14 0a7 7 0 1 0-14 0Z" fill="#8a2a12"/><circle r="44" fill="#d2280f" opacity=".15"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>` + dots(R, 60, 600, 450, 700, 520, 1.6, '#3a393f', 0.8);
      // side plates (cropped by the frame): beef rolls, bok choy, sesame sauce, chili dip
      s += sh(150, 120, 230, 190) + `<circle cx="120" cy="96" r="200" fill="url(#plt)"/><circle cx="120" cy="96" r="168" fill="#f4f1ec"/>`;
      [[70, 40, 20], [160, 30, -10], [230, 90, 60], [60, 130, 10], [150, 130, -20], [230, 190, 40], [130, 210, 0]].forEach(([x, y, a]) => { s += `<use href="#bf" transform="translate(${x} ${y}) rotate(${a})"/>`; });
      s += sh(150, 820, 220, 160) + `<circle cx="120" cy="830" r="190" fill="url(#plt)"/><circle cx="120" cy="830" r="160" fill="#f4f1ec"/>`;
      [[60, 760, -30], [130, 740, 10], [200, 780, 40], [90, 840, -10], [170, 850, 20]].forEach(([x, y, a]) => {
        s += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-14 50C-30 10-34 -40 0 -64C34 -40 30 10 14 50Z" fill="#4f9a3a"/><path d="M-10 50C-14 20-10 -10 0 -40C10 -10 14 20 10 50Z" fill="#e8f3d8"/><path d="M0 -60V40" stroke="#2f6d22" stroke-width="2"/></g>`;
      });
      s += sh(1100, 140, 150, 120) + `<circle cx="1090" cy="120" r="120" fill="url(#plt)"/><circle cx="1090" cy="120" r="94" fill="#c9a06a"/><circle cx="1090" cy="120" r="94" fill="url(#oil)" opacity=".5"/>` + dashes(R, 26, 1090, 120, 80, 80, 3, 3.5, '#f6ead0');
      s += sh(1100, 800, 130, 100) + `<circle cx="1090" cy="790" r="96" fill="url(#plt)"/><circle cx="1090" cy="790" r="74" fill="#6b1d0e"/><circle cx="1078" cy="776" r="40" fill="#b8381a" opacity=".6"/>` + scallions(R, 6, 1090, 790, 50, 50, 6) + dots(R, 22, 1090, 790, 60, 60, 2.6, '#f2dfb2');
      // the pot
      s += sh(612, 482, 400, 380) + `<circle cx="600" cy="450" r="350" fill="url(#rim)"/><circle cx="600" cy="450" r="330" fill="#2e2f33"/><circle cx="600" cy="450" r="318" fill="url(#br)"/>`;
      for (let i = 0; i < 9; i++) { const [x, y] = inE(R, 600, 450, 260, 260); s += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(30 + R() * 60)}" ry="${r0(20 + R() * 40)}" fill="url(#oil)"/>`; }
      s += [[470, 360], [700, 560], [560, 600]].map(([x, y]) => `<use href="#ls" x="${x}" y="${y}"/>`).join('');
      [[700, 340, 20], [430, 520, -15], [640, 420, 40]].forEach(([x, y, a]) => { s += `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-34" y="-30" width="68" height="60" rx="14" fill="#e9a94a"/><rect x="-26" y="-22" width="40" height="18" rx="9" fill="#ffd27a" opacity=".6"/></g>`; });
      [[560, 300], [800, 470], [380, 420], [520, 470]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y + 4}" r="30" fill="#5a0c06" opacity=".5"/><circle cx="${x}" cy="${y}" r="30" fill="url(#fb)"/>`; });
      [[760, 380, 30], [420, 300, -40]].forEach(([x, y, a]) => { s += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-60 -10C-30 -34 30 10 60 -14L56 16C30 40-30 -4-58 22Z" fill="#9c3a32"/><path d="M-50 -2C-20 -20 20 14 50 -4" stroke="#e7b0a4" stroke-width="4" fill="none"/></g>`; });
      const cl = [];
      for (let i = 0; i < 26; i++) { const [x, y] = inE(R, 600, 450, 290, 290); cl.push([x, y, R() * 360, 30 + R() * 16]); }
      s += chilis(cl);
      s += dots(R, 60, 600, 450, 300, 300, 4.5, '#4a0d06') + dots(R, 30, 600, 450, 300, 300, 2.5, '#c76a2a');
      s += scallions(R, 14, 600, 450, 280, 280, 8);
      let bb = '';
      for (let i = 0; i < 16; i++) { const [x, y] = inE(R, 600, 450, 290, 290); const r = r0(4 + R() * 9); bb += `M${r0(x) - r} ${r0(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`; }
      s += `<path d="${bb}" fill="#ff7a4a" fill-opacity=".25" stroke="#ffd2b0" stroke-width="2"/>`;
      s += `<circle cx="600" cy="450" r="318" fill="url(#ins)"/>` + glint(470, 250, 90, 22, 0.35) + `<path d="M330 300A318 318 0 0 1 560 134" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>`;
      s += chops(860, 900, 1180, 470, 26, 6, '#2b1d16', '#c99a6a');
      s += steam(R, 600, 360, 4, 300);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_pelmeni — Snezhnayan dumplings, sour cream, dill
     ========================================================================================= */
  def('food_pelmeni', {
    title: 'Pelmeni with smetana', w: 1200, h: 900, tags: ['food', 'pelmeni', 'snezhnaya', 'dumplings'],
    svg: (w, h) => {
      const R = rng(202);
      const [wd, wb] = split(wood(R, '#9a6a40', '#4e2e18', '#3a2010', 30));
      const BODY = 'M250 460C252 650 420 716 600 716C780 716 948 650 950 460Z';
      const D = BASE(0.5) + wd +
        lin('bw', '0 0 0 1', '#ffffff 0|#e9edf3 .6|#c3cad6 1') +
        lin('bin', '0 0 0 1', '#c9d0dc 0|#eef1f5 .5|#f8fafc 1') +
        rad('pm', '.4 .3 .7', '#fff8ea 0|#f3e3c2 .55|#d9ba88 1') +
        rad('sc', '.4 .35 .6', '#ffffff 0|#f4f2ec .6|#ddd8cc 1') +
        lin('nap', '0 0 1 1', '#e4ecf6 0|#c6d4e6 1') +
        rad('lt', '.25 .2 .9', '#ffe2b0 0 .35|#ffe2b0 1 0') +
        `<clipPath id="bc"><path d="${BODY}"/></clipPath>` +
        `<g id="pe"><ellipse cx="3" cy="10" rx="42" ry="28" fill="#6a4a1e" opacity=".3"/><path d="M-40 4C-40 -26 40 -26 40 4C40 24 22 32 0 32C-22 32-40 24-40 4Z" fill="url(#pm)"/>` +
        `<path d="M-32 -1C-22 -24 22 -24 32 -1C20 9-20 9-32 -1Z" fill="#fcf3e0"/><path d="M-32 -1C-20 9 20 9 32 -1" stroke="#c9a46a" stroke-width="3" fill="none"/><path d="M-24 -7C-12 -18 12 -18 24 -7" stroke="#e6cc98" stroke-width="2" fill="none"/><ellipse cx="-12" cy="-13" rx="12" ry="4.5" fill="#fff" opacity=".85"/></g>`;
      let s = wb;
      // linen napkin + spoon
      s += `<path d="M-40 640L360 600L420 960H-40Z" fill="url(#nap)"/><path d="M-40 680L370 642M-40 730L378 692M-40 780L386 742M60 630L120 960M160 620L220 960M260 610L320 960" stroke="#8aa4c8" stroke-width="3" opacity=".45"/>`;
      s += `<g transform="rotate(-24 230 760)"><ellipse cx="150" cy="760" rx="46" ry="30" fill="#c7cdd6"/><ellipse cx="150" cy="756" rx="36" ry="21" fill="#e9edf2"/><rect x="190" y="752" width="190" height="14" rx="7" fill="#b9c0ca"/></g>`;
      // little bowl of smetana
      s += sh(1060, 210, 150, 90) + `<ellipse cx="1050" cy="190" rx="120" ry="70" fill="url(#bw)"/><ellipse cx="1050" cy="178" rx="100" ry="54" fill="url(#sc)"/><path d="M1000 170q30 -26 60 -6q20 14 40 -4" stroke="#fff" stroke-width="6" fill="none"/>`;
      // the bowl (angled), gzhel ornament clipped to its body
      s += sh(620, 700, 430, 150, 0.9) + `<path d="${BODY}" fill="url(#bw)"/>`;
      let gz = '';
      for (let i = 0; i < 9; i++) { const x = 312 + i * 72, y = 600 + Math.sin(i / 8 * Math.PI) * 44; gz += `M${x} ${r0(y)}c-10-14 0-28 12-30c12 2 22 16 12 30c-6 6-18 6-24 0ZM${x + 12} ${r0(y) + 2}v20M${x + 12} ${r0(y) + 14}l-12 8M${x + 12} ${r0(y) + 14}l12 8`; }
      s += `<g clip-path="url(#bc)"><path d="M250 540C340 640 860 640 950 540" stroke="#2a56b0" stroke-width="9" fill="none"/><path d="M250 690C400 740 800 740 950 690" stroke="#2a56b0" stroke-width="6" fill="none"/><path d="${gz}" fill="#2a56b0" stroke="#2a56b0" stroke-width="2.5"/></g>`;
      s += `<ellipse cx="600" cy="460" rx="350" ry="196" fill="#f4f6f9"/><ellipse cx="600" cy="464" rx="328" ry="178" fill="url(#bin)"/>`;
      s += `<ellipse cx="600" cy="460" rx="350" ry="196" fill="none" stroke="#2a56b0" stroke-width="7"/><ellipse cx="600" cy="460" rx="338" ry="187" fill="none" stroke="#2a56b0" stroke-width="2" opacity=".6"/>`;
      // a heaped pile of pelmeni, back to front
      const P = [];
      for (let i = 0; i < 30; i++) { const a = R() * TAU, r = Math.sqrt(R()); P.push([600 + Math.cos(a) * 270 * r, 480 + Math.sin(a) * 135 * r - (1 - r) * 34, R() * 50 - 25, 0.95 + R() * 0.25]); }
      P.sort((a, b) => a[1] - b[1]);
      for (const [x, y, a, k] of P) s += `<use href="#pe" transform="translate(${r0(x)} ${r0(y)}) rotate(${r0(a)}) scale(${f1(k)})"/>`;
      // melted butter, smetana dollop, dill, black pepper
      s += dots(R, 16, 600, 460, 250, 110, 5, '#ffe48a', 0.7);
      s += `<path d="M530 404C512 376 548 350 584 360C612 340 658 350 666 378C694 390 684 424 656 430C620 448 546 442 530 404Z" fill="url(#sc)"/><path d="M566 376q28 -12 54 4q18 10 30 0" stroke="#fff" stroke-width="7" fill="none"/>`;
      let dill = '';
      for (let i = 0; i < 10; i++) {
        const [x, y] = inE(R, 600, 450, 240, 110);
        const a = R() * TAU;
        dill += `M${r0(x)} ${r0(y)}l${r0(Math.cos(a) * 30)} ${r0(Math.sin(a) * 30)}`;
        for (let k = 1; k < 4; k++) { const px = x + Math.cos(a) * 8 * k, py = y + Math.sin(a) * 8 * k; dill += `M${r0(px)} ${r0(py)}l${r0(Math.cos(a + 0.9) * 10)} ${r0(Math.sin(a + 0.9) * 10)}M${r0(px)} ${r0(py)}l${r0(Math.cos(a - 0.9) * 10)} ${r0(Math.sin(a - 0.9) * 10)}`; }
      }
      s += `<path d="${dill}" stroke="#3f7d2a" stroke-width="2.6" fill="none"/>`;
      s += dots(R, 50, 600, 460, 260, 130, 1.8, '#2a2420');
      s += `<rect width="1200" height="900" fill="url(#lt)"/>` + steam(R, 600, 360, 3, 280);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_almond_tofu — almond jelly, osmanthus syrup, goji
     ========================================================================================= */
  def('food_almond_tofu', {
    title: 'Almond tofu', w: 1200, h: 900, tags: ['food', 'dessert', 'almond-tofu', 'osmanthus'],
    svg: (w, h) => {
      const R = rng(303);
      const D = BASE(0.3) +
        lin('mb', '0 0 1 1', '#faf8f4 0|#e6e1d8 1') +
        lin('gl', '0 0 1 1', '#ffffff 0 .7|#dfe9ee .5 .3|#ffffff 1 .6') +
        rad('syr', '.5 .4 .6', '#fbe9b8 0 .8|#efcf86 1 .9') +
        lin('gb', '0 0 0 1', '#eef5f6 0 .5|#d6e4e8 1 .7') +
        `<g id="cb"><path d="M0 -26L40 -7L0 12L-40 -7Z" fill="#fffdf7" stroke="#fffdf7" stroke-width="5"/><path d="M-40 -7L0 12V44L-40 25Z" fill="#efe6d4" stroke="#efe6d4" stroke-width="5"/><path d="M0 12L40 -7V25L0 44Z" fill="#ddd0b6" stroke="#ddd0b6" stroke-width="5"/><path d="M-22 -9L0 -19" stroke="#fff" stroke-width="5"/><path d="M-40 18L0 37 40 18" stroke="#f0d088" stroke-width="5" fill="none" opacity=".5"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#mb)"/>`;
      s += `<g fill="none" stroke="#b9b2a6" opacity=".35"><path d="M-20 140C200 180 300 100 520 170S900 100 1220 200" stroke-width="2"/><path d="M880 0C860 140 980 220 1220 260M-20 640C120 620 160 720 300 740" stroke-width="1.4"/></g>`;
      // osmanthus sprig + spoon
      s += `<path d="M60 160C140 120 200 130 260 110" stroke="#5a3a1e" stroke-width="5" fill="none"/><g fill="#3f7d2a"><path d="M110 140C120 104 160 98 174 116C158 138 130 146 110 140Z"/><path d="M200 126C220 96 258 98 266 118C248 134 220 136 200 126Z"/></g>` + dots(R, 16, 170, 150, 90, 24, 5, '#f2a21e');
      s += sh(1020, 760, 170, 60, 0.5) + `<g transform="rotate(-28 1000 740)"><path d="M900 700C940 670 1010 680 1030 720C1040 750 1010 780 960 780C910 780 880 740 900 700Z" fill="#fbfbfa" stroke="#dcd7cf" stroke-width="3"/><path d="M1026 724L1190 700L1194 724L1030 750Z" fill="#f4f2ee" stroke="#dcd7cf" stroke-width="3"/></g>`;
      // glass bowl (3/4 view), filling the frame
      s += sh(610, 700, 470, 150, 0.55);
      s += `<path d="M190 440C200 650 380 740 600 740C820 740 1000 650 1010 440Z" fill="url(#gb)"/>`;
      s += `<ellipse cx="600" cy="452" rx="392" ry="206" fill="url(#syr)"/>`;
      // almond tofu cubes, back to front
      const C = [];
      for (let i = 0; i < 17; i++) { const a = R() * TAU, r = Math.sqrt(R()); C.push([600 + Math.cos(a) * 300 * r, 460 + Math.sin(a) * 140 * r, 1 + R() * 0.3]); }
      C.sort((a, b) => a[1] - b[1]);
      for (const [x, y, k] of C) s += `<use href="#cb" transform="translate(${r0(x)} ${r0(y)}) scale(${f1(k)})"/>`;
      // syrup line over the cube bottoms
      s += `<ellipse cx="600" cy="470" rx="380" ry="196" fill="#f3d48e" opacity=".22"/>`;
      // goji, osmanthus florets, mint
      for (let i = 0; i < 11; i++) { const [x, y] = inE(R, 600, 452, 320, 160); const a = r0(R() * 180); s += `<g transform="translate(${r0(x)} ${r0(y)}) rotate(${a})"><ellipse rx="14" ry="8" fill="#d6331f"/><ellipse cx="-4" cy="-3" rx="5" ry="2.4" fill="#ffb4a0"/></g>`; }
      let os = '';
      for (let i = 0; i < 26; i++) { const [x, y] = inE(R, 600, 452, 340, 170); for (let k = 0; k < 4; k++) { const t = k * 1.57 + 0.4; os += `M${r0(x + Math.cos(t) * 4) - 3} ${r0(y + Math.sin(t) * 4)}a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z`; } }
      s += `<path d="${os}" fill="#f2a21e"/>`;
      s += `<g transform="translate(720 360) rotate(-20)"><path d="M0 0C24 -36 84 -36 108 0C84 30 24 30 0 0Z" fill="#4fae5a"/><path d="M0 0H104" stroke="#c8f0c0" stroke-width="2"/></g><g transform="translate(724 364) rotate(30)"><path d="M0 0C18 -28 66 -28 86 0C66 24 18 24 0 0Z" fill="#3f9a4a"/></g>`;
      // glass rim + reflections
      s += `<ellipse cx="600" cy="440" rx="410" ry="216" fill="none" stroke="url(#gl)" stroke-width="20"/><ellipse cx="600" cy="440" rx="410" ry="216" fill="none" stroke="#fff" stroke-width="3"/>` +
        `<path d="M220 520C250 620 380 700 520 726" stroke="#fff" stroke-width="12" fill="none" opacity=".65"/><path d="M970 560C940 620 880 660 820 690" stroke="#fff" stroke-width="7" fill="none" opacity=".55"/>`;
      return wrap(w, h, D, s + FIN(0.1));
    },
  });

  /* =========================================================================================
     food_jade_parcels — jade-green parcels in clear broth on celadon
     ========================================================================================= */
  def('food_jade_parcels', {
    title: 'Jade parcels', w: 1200, h: 900, tags: ['food', 'jade-parcels', 'liyue', 'dumplings'],
    svg: (w, h) => {
      const R = rng(404);
      const D = BASE(0.55) +
        lin('bg', '0 0 1 1', '#244544 0|#122624 1') +
        rad('pl', '.45 .4 .6', '#e3f1ea 0|#bcd9cc .7|#94bfad 1') +
        rad('bro', '.5 .5 .5', '#f6dc9a 0 .55|#e9c06a .8 .5|#e9c06a 1 0') +
        rad('jp', '.38 .32 .7', '#c7f0b6 0|#79c27a .45|#2f8a52 1') +
        lin('rib', '0 0 1 0', '#1f5a2e 0|#2f7a3e 1');
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      let wv = '';
      for (let i = 0; i < 60; i++) wv += `M0 ${i * 15}H1200`;
      for (let i = 0; i < 80; i++) wv += `M${i * 15} 0V900`;
      s += `<path d="${wv}" stroke="#0e1d1c" stroke-width="1.5" opacity=".35"/>`;
      // chopsticks + porcelain rest
      s += `<ellipse cx="1040" cy="760" rx="40" ry="18" fill="#e9efe9"/>` + chops(820, 900, 1180, 600, -24, -10, '#e4d3a8', '#fff');
      // plate
      s += sh(620, 480, 400, 380) + `<circle cx="600" cy="450" r="360" fill="url(#pl)"/><circle cx="600" cy="450" r="300" fill="#cfe5da"/><circle cx="600" cy="450" r="300" fill="none" stroke="#a8cbbb" stroke-width="4"/>`;
      let ck = '';
      for (let i = 0; i < 18; i++) { const a = R() * TAU, r1 = 310 + R() * 20; ck += `M${r0(600 + Math.cos(a) * r1)} ${r0(450 + Math.sin(a) * r1)}l${r0((R() - 0.5) * 30)} ${r0((R() - 0.5) * 30)}`; }
      s += `<path d="${ck}" stroke="#86ad9c" stroke-width="1.5" fill="none"/>`;
      s += `<circle cx="600" cy="450" r="280" fill="url(#bro)"/>`;
      // parcels: ring of 4 + centre
      const parcel = (x, y, a, k) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${k})">` +
        `<ellipse cx="8" cy="14" rx="86" ry="80" fill="#3a2a10" opacity=".25"/>` +
        `<path d="M-74 -10C-80 -60-40 -82 0 -78C44 -84 82 -56 76 -6C82 44 46 78 0 76C-46 80-82 40-74 -10Z" fill="url(#jp)"/>` +
        `<path d="M-60 -30Q-20 -10 0 -4M60 -36Q20 -12 0 -4M-50 40Q-20 10 0 -4M54 40Q20 12 0 -4" stroke="#d9f5c8" stroke-width="3" fill="none" opacity=".6"/>` +
        `<path d="M-76 0C-40 8 40 8 76 -4" stroke="url(#rib)" stroke-width="10" fill="none"/><path d="M-6 -74C-2 -30 2 30-2 74" stroke="url(#rib)" stroke-width="9" fill="none"/>` +
        `<path d="M0 -4C-20 -30-46 -24-36 -6C-28 6-10 0 0 -4C20 -30 46 -24 36 -6C28 6 10 0 0 -4Z" fill="#2a6a36"/><circle r="7" fill="#1f5a2e"/>` +
        `<path d="M-50 -50Q-30 -66 -6 -64" stroke="#fff" stroke-width="7" fill="none" opacity=".55"/></g>`;
      s += parcel(460, 320, -12, 0.92) + parcel(740, 320, 14, 0.92) + parcel(450, 590, 8, 0.92) + parcel(750, 590, -16, 0.92) + parcel(600, 456, 4, 1);
      // ham peeking, goji, sesame, chili oil drops
      [[520, 404, -30], [672, 520, 40]].forEach(([x, y, a]) => { s += `<path d="M${x} ${y}q14 -10 26 0q-12 8-26 0z" fill="#e88a8a" transform="rotate(${a} ${x} ${y})"/>`; });
      for (let i = 0; i < 7; i++) { const [x, y] = inE(R, 600, 450, 250, 250); s += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="12" ry="7" fill="#d6331f" transform="rotate(${r0(R() * 180)} ${r0(x)} ${r0(y)})"/>`; }
      s += dashes(R, 40, 600, 450, 270, 270, 3, 3.5, '#f6ecd2') + dots(R, 10, 600, 450, 260, 260, 7, '#e0581a', 0.55);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_mapo — mapo tofu in a black clay bowl, rice on the side
     ========================================================================================= */
  def('food_mapo', {
    title: 'Mapo tofu', w: 1200, h: 900, tags: ['food', 'mapo', 'tofu', 'spicy'],
    svg: (w, h) => {
      const R = rng(505);
      const [wd, wb] = split(wood(R, '#5a3a24', '#22150d', '#140c07', 24));
      const D = BASE(0.55) + wd +
        lin('cl', '0 0 1 1', '#4a4542 0|#1f1c1b 1') +
        rad('sau', '.45 .42 .6', '#e64a1c 0|#c42c10 .5|#8a1608 1') +
        lin('tf', '0 0 1 1', '#fff6e6 0|#f3dcb8 1') +
        lin('tfs', '0 0 0 1', '#e0b88a 0|#b8824a 1') +
        rad('oil', '.5 .5 .5', '#ff9a3a 0 .6|#ff9a3a 1 0') +
        lin('rb', '0 0 1 1', '#ffffff 0|#d9d6d0 1') +
        `<g id="tq"><rect x="-32" y="-28" width="64" height="64" rx="9" fill="url(#tfs)"/><rect x="-32" y="-34" width="64" height="60" rx="9" fill="url(#tf)"/>` +
        `<path d="M-32 -2C-18 -12-6 6 8 -4S28 2 32 -8V24Q32 34 22 34H-22Q-32 34-32 24Z" fill="#c8361a" opacity=".85"/><path d="M-26 -32C-8 -38 8 -26 28 -34" stroke="#d8481e" stroke-width="5" fill="none" opacity=".7"/>` +
        `<rect x="-22" y="-26" width="22" height="8" rx="4" fill="#fff" opacity=".9"/><circle cx="12" cy="-12" r="4" fill="#7a2a10"/></g>`;
      let s = wb;
      // rice bowl, top right (cropped)
      s += sh(1060, 160, 220, 200) + `<circle cx="1050" cy="130" r="200" fill="url(#rb)"/><circle cx="1050" cy="130" r="176" fill="#fbfaf6"/>`;
      let rice = '';
      for (let i = 0; i < 110; i++) { const [x, y] = inE(R, 1050, 130, 170, 170); const a = R() * TAU; rice += `M${r0(x)} ${r0(y)}l${f1(Math.cos(a) * 9)} ${f1(Math.sin(a) * 9)}`; }
      s += `<path d="${rice}" stroke="#e4ddd0" stroke-width="8"/><path d="${rice}" stroke="#ffffff" stroke-width="5"/>`;
      s += chops(40, 880, 470, 740, 14, 26, '#8a5a34', '#f0c890');
      // clay bowl
      s += sh(612, 480, 400, 380) + `<circle cx="600" cy="450" r="340" fill="url(#cl)"/><circle cx="600" cy="450" r="312" fill="#161312"/><circle cx="600" cy="450" r="300" fill="url(#sau)"/>`;
      s += `<path d="M330 330A340 340 0 0 1 560 112" stroke="#8a8380" stroke-width="5" fill="none" opacity=".6"/>`;
      for (let i = 0; i < 8; i++) { const [x, y] = inE(R, 600, 450, 240, 240); s += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(30 + R() * 50)}" ry="${r0(18 + R() * 30)}" fill="url(#oil)"/>`; }
      s += dots(R, 70, 600, 450, 270, 270, 6, '#5a1c0e') + dots(R, 40, 600, 450, 270, 270, 4, '#8a3418');
      // tofu cubes
      const C = [];
      for (let i = 0; i < 20; i++) { const [x, y] = inE(R, 600, 450, 230, 230); C.push([x, y]); }
      C.sort((a, b) => a[1] - b[1]);
      for (const [x, y] of C) s += `<use href="#tq" transform="translate(${r0(x)} ${r0(y)}) rotate(${r0(R() * 90 - 45)})"/>`;
      // glossy sauce over everything, pork crumbs, scallions, pepper powder
      for (let i = 0; i < 10; i++) { const [x, y] = inE(R, 600, 450, 230, 230); s += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(16 + R() * 26)}" ry="${r0(10 + R() * 14)}" fill="#c42c10" opacity=".75"/>`; }
      s += dots(R, 40, 600, 450, 250, 250, 5, '#6a240e');
      s += scallions(R, 22, 600, 450, 260, 260, 9) + dashes(R, 14, 600, 450, 240, 240, 16, 6, '#5fae3c');
      s += dots(R, 90, 600, 450, 280, 280, 2.2, '#2a0a06', 0.8);
      s += glint(500, 300, 80, 20, 0.5) + steam(R, 600, 330, 3, 260);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_fish_stew — Snezhnayan fish soup in an enamel bowl, rye bread
     ========================================================================================= */
  def('food_fish_stew', {
    title: 'Snezhnayan fish soup', w: 1200, h: 900, tags: ['food', 'snezhnaya', 'fish', 'soup'],
    svg: (w, h) => {
      const R = rng(606);
      const D = BASE(0.4) +
        lin('bg', '0 0 1 1', '#e6edf3 0|#c3d0dc 1') +
        lin('en', '0 0 1 1', '#ffffff 0|#e8edf2 .6|#c6d0db 1') +
        rad('bth', '.45 .4 .6', '#f7d887 0|#e8b85a .6|#c98d32 1') +
        lin('fs', '0 0 1 1', '#fffaf2 0|#efdcc6 1') +
        lin('po', '0 0 1 1', '#fbe9a8 0|#e9c66a 1') +
        lin('bd', '0 0 1 1', '#a8784a 0|#6e4a2a 1') +
        lin('rye', '0 0 1 1', '#5a3420 0|#2e1a10 1');
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      let ln = '';
      for (let i = 0; i < 46; i++) ln += `M0 ${i * 20}H1200`;
      s += `<path d="${ln}" stroke="#a9b8c8" stroke-width="1.4" opacity=".4"/><path d="M0 180H1200M0 200H1200" stroke="#3a5f9a" stroke-width="5" opacity=".5"/>`;
      // board with rye bread
      s += sh(1020, 760, 260, 160) + `<rect x="800" y="610" width="460" height="330" rx="30" fill="url(#bd)" transform="rotate(-8 1000 760)"/>`;
      [[930, 700, -18], [1040, 690, -6], [1000, 790, 10]].forEach(([x, y, a]) => {
        s += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M-70 -50C-70 -80 70 -80 70 -50V50H-70Z" fill="url(#rye)"/><path d="M-60 -44C-60 -66 60 -66 60 -44V42H-60Z" fill="#7a5034"/>` + dots(R, 16, 0, 0, 52, 40, 2.4, '#3a2214') + `</g>`;
      });
      // lemon wedge
      s += `<g transform="translate(250 760) rotate(20)"><path d="M-80 0A80 80 0 0 0 80 0Z" fill="#f2d22e"/><path d="M-66 0A66 66 0 0 0 66 0Z" fill="#fbef9a"/><path d="M0 0L-40 52M0 0L0 66M0 0L40 52M0 0L-62 22M0 0L62 22" stroke="#f2d22e" stroke-width="4"/></g>`;
      // spoon
      s += `<g transform="rotate(30 960 160)"><ellipse cx="880" cy="160" rx="54" ry="36" fill="#b9c2cc"/><ellipse cx="880" cy="156" rx="44" ry="27" fill="#e4e9ef"/><rect x="930" y="152" width="230" height="14" rx="7" fill="#aeb8c3"/></g>`;
      // enamel bowl
      s += sh(592, 472, 380, 360) + `<circle cx="580" cy="450" r="330" fill="url(#en)"/><circle cx="580" cy="450" r="330" fill="none" stroke="#1d3f7a" stroke-width="12"/><circle cx="580" cy="450" r="296" fill="#dfe4ea"/><circle cx="580" cy="450" r="284" fill="url(#bth)"/>`;
      s += `<path d="M330 260A330 330 0 0 1 480 140" stroke="#000" stroke-width="10" fill="none" opacity=".25"/><circle cx="342" cy="250" r="6" fill="#1d3f7a"/>`;
      // potatoes, carrots, fish
      for (let i = 0; i < 8; i++) { const [x, y] = inE(R, 580, 450, 220, 220); s += `<rect x="${r0(x) - 24}" y="${r0(y) - 22}" width="48" height="44" rx="10" fill="url(#po)" transform="rotate(${r0(R() * 90)} ${r0(x)} ${r0(y)})"/>`; }
      for (let i = 0; i < 9; i++) { const [x, y] = inE(R, 580, 450, 230, 230); s += `<circle cx="${r0(x)}" cy="${r0(y)}" r="19" fill="#ef7a24"/><circle cx="${r0(x)}" cy="${r0(y)}" r="10" fill="none" stroke="#ffb066" stroke-width="3"/>`; }
      [[480, 360, 20], [680, 400, -30], [560, 560, 60], [700, 560, 10], [430, 520, -50]].forEach(([x, y, a]) => {
        s += `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse cx="4" cy="10" rx="64" ry="42" fill="#9a6a20" opacity=".3"/><path d="M-56 -30C-30 -42 30 -40 58 -26C64 0 60 24 50 34C20 44-30 42-54 32C-62 8-62 -14-56 -30Z" fill="url(#fs)"/>` +
          `<path d="M-56 -30C-30 -42 30 -40 58 -26" stroke="#8e9aa8" stroke-width="9" fill="none"/><path d="M-50 -34C-20 -42 20 -40 50 -32" stroke="#d6dde6" stroke-width="3" fill="none"/>` +
          `<path d="M-28 -22Q-20 2-30 30M2 -26Q8 2 0 34M30 -22Q36 2 28 30" stroke="#ead6bf" stroke-width="2.5" fill="none"/><ellipse cx="-14" cy="-6" rx="16" ry="6" fill="#fff" opacity=".7"/></g>`;
      });
      // fat droplets, dill, peppercorns, bay leaf
      let fd = '';
      for (let i = 0; i < 30; i++) { const [x, y] = inE(R, 580, 450, 270, 270); const r = r0(3 + R() * 8); fd += `M${r0(x) - r} ${r0(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`; }
      s += `<path d="${fd}" fill="#fff3c4" fill-opacity=".35" stroke="#fff8dc" stroke-width="1.5"/>`;
      s += dashes(R, 70, 580, 450, 270, 270, 9, 3, '#3f7d2a') + dashes(R, 40, 580, 450, 270, 270, 6, 2.4, '#5aa03a');
      s += dots(R, 14, 580, 450, 250, 250, 5, '#2a1a12');
      s += `<g transform="translate(700 300) rotate(-30)"><path d="M-50 0C-30 -24 30 -24 50 0C30 22-30 22-50 0Z" fill="#6a7a3a"/><path d="M-46 0H46" stroke="#a8b46a" stroke-width="2"/></g>`;
      s += glint(470, 300, 80, 24, 0.5) + steam(R, 580, 340, 3, 260);
      return wrap(w, h, D, s + FIN(0.12));
    },
  });

  /* =========================================================================================
     food_sweet_flower_chicken — honey-glazed chicken with sweet flowers (angled)
     ========================================================================================= */
  def('food_sweet_flower_chicken', {
    title: 'Sweet flower chicken', w: 1200, h: 900, tags: ['food', 'chicken', 'sweet-flower', 'glazed'],
    svg: (w, h) => {
      const R = rng(707);
      const D = BASE(0.55) +
        lin('bg', '0 0 0 1', '#3a2416 0|#5a3a22 .5|#2a180e 1') +
        rad('bk', '.5 .5 .5', '#ffcf80 0 .55|#ffcf80 1 0') +
        lin('pl', '0 0 0 1', '#ffffff 0|#e8e2d8 1') +
        rad('ck', '.36 .3 .75', '#ffd27a 0|#e08a2a .4|#a2480e .75|#5a2206 1') +
        rad('gz', '.5 .5 .5', '#e8962e 0 .7|#e8962e 1 0') +
        `<g id="dr"><ellipse cx="-4" cy="14" rx="92" ry="30" fill="#4a1e06" opacity=".22"/>` +
        `<path d="M58 -6L116 -14" stroke="#e9dfcb" stroke-width="17"/><path d="M60 -10L114 -18" stroke="#fff" stroke-width="5" opacity=".7"/><circle cx="122" cy="-24" r="12" fill="#f6efe2"/><circle cx="126" cy="-6" r="12" fill="#f3eadb"/>` +
        `<path d="M-92 4C-96 -42-40 -60 8 -48C40 -40 62 -26 72 -12C78 4 64 18 38 24C-2 36-90 44-92 4Z" fill="url(#ck)"/>` +
        `<path d="M-72 -24C-42 -46 0 -46 40 -30" stroke="#fff1bf" stroke-width="10" fill="none" opacity=".75"/><path d="M-56 -12C-26 -26 10 -24 44 -12" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>` +
        `<path d="M-80 18C-40 30 20 28 60 12" stroke="#6a2a06" stroke-width="6" fill="none" opacity=".45"/><circle cx="-30" cy="6" r="5" fill="#5a2006" opacity=".5"/><circle cx="20" cy="10" r="4" fill="#5a2006" opacity=".5"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      for (let i = 0; i < 12; i++) s += `<circle cx="${r0(R() * 1200)}" cy="${r0(40 + R() * 260)}" r="${r0(20 + R() * 50)}" fill="url(#bk)" opacity="${f1(0.25 + R() * 0.4)}"/>`;
      s += `<path d="M0 420C300 400 900 400 1200 420V900H0Z" fill="#4a2c18"/><path d="M0 420C300 400 900 400 1200 420" stroke="#8a5a32" stroke-width="3" fill="none"/>`;
      // plate (angled)
      s += sh(610, 700, 470, 150, 0.9) + `<ellipse cx="600" cy="620" rx="440" ry="210" fill="url(#pl)"/><ellipse cx="600" cy="620" rx="350" ry="160" fill="#f6f2ea"/><ellipse cx="600" cy="620" rx="350" ry="160" fill="none" stroke="#e2dccf" stroke-width="4"/>`;
      s += `<ellipse cx="600" cy="640" rx="310" ry="124" fill="url(#gz)" opacity=".85"/>`;
      // glazed drumsticks fanned on the plate, back to front
      [[460, 530, -150, 1.15], [670, 515, -20, 1.15], [420, 625, 170, 1.2], [780, 610, -10, 1.2], [570, 650, 20, 1.25], [690, 715, 160, 1.15]].forEach(([x, y, a, k]) => {
        s += `<use href="#dr" transform="translate(${x} ${y}) rotate(${a}) scale(${k} ${Math.abs(a) > 90 ? -k : k})"/>`;
      });
      s += dashes(R, 60, 600, 600, 300, 120, 3, 3.6, '#fff4dc');
      // sweet flowers
      const fl = (x, y, r, a) => {
        let d = '';
        for (let i = 0; i < 5; i++) { const t = (i * 72 + a) * Math.PI / 180; d += `M${f1(x + Math.cos(t) * r * 0.5 - r * 0.42)} ${f1(y + Math.sin(t) * r * 0.5)}a${f1(r * 0.42)} ${f1(r * 0.42)} 0 1 0 ${f1(r * 0.84)} 0a${f1(r * 0.42)} ${f1(r * 0.42)} 0 1 0-${f1(r * 0.84)} 0Z`; }
        return `<path d="${d}" fill="#fff8f0"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.26)}" fill="#f0a6b8"/><circle cx="${x}" cy="${y}" r="${f1(r * 0.12)}" fill="#f6c24a"/>`;
      };
      s += fl(560, 470, 28, 0) + fl(860, 560, 24, 20) + fl(620, 580, 32, 40) + fl(330, 640, 24, 10) + fl(500, 720, 22, 30) + fl(800, 720, 26, 5);
      s += fl(160, 760, 30, 10) + fl(1040, 790, 26, 30) + `<path d="M220 820q30 -10 60 4M960 840q-30 -14-60 2" stroke="#6aa04a" stroke-width="4" fill="none"/>`;
      s += steam(R, 600, 470, 3, 300);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_borscht — beet soup, sour cream swirl, dill, pampushki
     ========================================================================================= */
  def('food_borscht', {
    title: 'Borscht', w: 1200, h: 900, tags: ['food', 'snezhnaya', 'borscht', 'soup'],
    svg: (w, h) => {
      const R = rng(808);
      const [wd, wb] = split(wood(R, '#b48452', '#6a4424', '#5a3818', 28));
      const D = BASE(0.45) + wd +
        lin('bw', '0 0 1 1', '#ffffff 0|#ebe7e0 .6|#c9c2b6 1') +
        rad('bs', '.45 .4 .6', '#c0284c 0|#9a1636 .55|#650a22 1') +
        rad('sc', '.4 .35 .6', '#ffffff 0|#f6f2ea .6|#e2dacb 1') +
        rad('pa', '.35 .3 .7', '#ffe0a0 0|#e9a650 .6|#b06a24 1') +
        lin('nap', '0 0 1 1', '#c8323c 0|#9a2028 1');
      let s = wb;
      // red napkin, pampushki on a plate, spoon
      s += `<path d="M-40 -40H420L360 300H-40Z" fill="url(#nap)"/><path d="M-40 40H400M-40 120H386M-40 200H372M60 -40L0 300M160 -40L100 300M260 -40L200 300" stroke="#f2d0c0" stroke-width="3" opacity=".35"/>`;
      s += sh(1030, 200, 230, 180) + `<circle cx="1020" cy="180" r="190" fill="url(#bw)"/><circle cx="1020" cy="180" r="160" fill="#f7f4ee"/>`;
      [[960, 140], [1070, 120], [1000, 240], [1100, 230]].forEach(([x, y]) => { s += `<circle cx="${x + 4}" cy="${y + 8}" r="54" fill="#6a4020" opacity=".3"/><circle cx="${x}" cy="${y}" r="52" fill="url(#pa)"/><ellipse cx="${x - 14}" cy="${y - 18}" rx="18" ry="9" fill="#fff" opacity=".45"/>` + dashes(R, 10, x, y, 34, 34, 4, 4, '#3f7d2a'); });
      s += `<g transform="rotate(-38 220 720)"><ellipse cx="140" cy="720" rx="56" ry="36" fill="#b9c2cc"/><ellipse cx="140" cy="716" rx="46" ry="27" fill="#e4e9ef"/><rect x="190" y="712" width="240" height="15" rx="7" fill="#aeb8c3"/></g>`;
      // the bowl with a red folk-ornament rim
      s += sh(572, 482, 370, 350) + `<circle cx="560" cy="460" r="320" fill="url(#bw)"/>`;
      let orn = '';
      for (let i = 0; i < 24; i++) { const a = i / 24 * TAU, x = 560 + Math.cos(a) * 300, y = 460 + Math.sin(a) * 300; orn += `<g transform="translate(${r0(x)} ${r0(y)}) rotate(${r0(a * 57.3 + 90)})"><path d="M0 -9L7 0 0 9-7 0Z" fill="#c8323c"/><circle cx="12" r="2.6" fill="#1d3f7a"/></g>`; }
      s += orn + `<circle cx="560" cy="460" r="278" fill="#e9e4dc"/><circle cx="560" cy="460" r="266" fill="url(#bs)"/>`;
      // shredded beets & cabbage, fat droplets
      let shr = '';
      for (let i = 0; i < 40; i++) { const [x, y] = inE(R, 560, 460, 230, 230); const a = R() * TAU, l = 20 + R() * 30; shr += `M${r0(x)} ${r0(y)}q${r0(Math.cos(a + 0.6) * l * 0.5)} ${r0(Math.sin(a + 0.6) * l * 0.5)} ${r0(Math.cos(a) * l)} ${r0(Math.sin(a) * l)}`; }
      s += `<path d="${shr}" stroke="#d8466a" stroke-width="3.5" fill="none" opacity=".65"/>`;
      s += dashes(R, 16, 560, 460, 220, 220, 22, 7, '#f0c8a8', 0.6);
      let fd = '';
      for (let i = 0; i < 26; i++) { const [x, y] = inE(R, 560, 460, 240, 240); const r = r0(3 + R() * 7); fd += `M${r0(x) - r} ${r0(y)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`; }
      s += `<path d="${fd}" fill="#ff9a5a" fill-opacity=".45" stroke="#ffc49a" stroke-width="1.5"/>`;
      // sour cream swirl + dill
      s += `<path d="M512 432C490 400 520 366 552 374C568 350 612 352 620 378C650 384 652 424 626 436C620 466 580 474 560 458C534 470 506 458 512 432Z" fill="url(#sc)"/><path d="M548 420C540 396 580 386 596 404C608 420 590 438 572 432" stroke="#e2d8c6" stroke-width="5" fill="none"/><ellipse cx="560" cy="392" rx="18" ry="7" fill="#fff"/>`;
      let dill = '';
      for (let i = 0; i < 6; i++) {
        const x = 600 + (R() - 0.5) * 100, y = 380 + R() * 60, a = R() * TAU;
        dill += `M${r0(x)} ${r0(y)}l${r0(Math.cos(a) * 44)} ${r0(Math.sin(a) * 44)}`;
        for (let k = 1; k < 5; k++) { const px = x + Math.cos(a) * 9 * k, py = y + Math.sin(a) * 9 * k; dill += `M${r0(px)} ${r0(py)}l${r0(Math.cos(a + 0.9) * 12)} ${r0(Math.sin(a + 0.9) * 12)}M${r0(px)} ${r0(py)}l${r0(Math.cos(a - 0.9) * 12)} ${r0(Math.sin(a - 0.9) * 12)}`; }
      }
      s += `<path d="${dill}" stroke="#2f6d22" stroke-width="3" fill="none"/>`;
      s += glint(440, 330, 70, 20, 0.45) + steam(R, 560, 360, 3, 260);
      return wrap(w, h, D, s + FIN(0.12));
    },
  });

  /* =========================================================================================
     food_mora_meat — braised meat in a golden flatbread pocket (angled)
     ========================================================================================= */
  def('food_mora_meat', {
    title: 'Mora meat', w: 1200, h: 900, tags: ['food', 'mora-meat', 'liyue', 'street-food'],
    svg: (w, h) => {
      const R = rng(909);
      const D = BASE(0.5) +
        lin('bg', '0 0 1 1', '#d8b68a 0|#a8834e 1') +
        lin('pp', '0 0 1 1', '#fbf3e2 0|#e9dcc0 1') +
        rad('bn', '.42 .36 .65', '#ffe6a6 0|#f0b85a .45|#c97e2a .8|#8a4a16 1') +
        lin('bnS', '0 0 0 1', '#d8913e 0|#8a4a16 1') +
        rad('crm', '.5 .45 .6', '#fffaf0 0|#f3e2c2 .7|#e2c492 1') +
        rad('mt', '.4 .3 .7', '#b0583a 0|#6a2412 .6|#3a1006 1') +
        rad('oil', '.5 .5 .5', '#e8401a 0 .7|#e8401a 1 0') +
        `<g id="mc"><path d="M-16 -8C-10 -14 10 -14 16 -6C18 4 12 12 2 12C-10 14-18 6-16 -8Z" fill="url(#mt)"/><path d="M-10 -8Q0 -12 8 -8" stroke="#e8946a" stroke-width="3" fill="none" opacity=".8"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      let fib = '';
      for (let i = 0; i < 50; i++) fib += `M${r0(R() * 1200)} ${r0(R() * 900)}l${r0(20 + R() * 40)} ${r0((R() - 0.5) * 8)}`;
      s += `<path d="${fib}" stroke="#8a6a3a" stroke-width="2" opacity=".35"/>`;
      // chili oil dish
      s += sh(1020, 220, 150, 80) + `<ellipse cx="1010" cy="200" rx="130" ry="70" fill="#f2efe8"/><ellipse cx="1010" cy="194" rx="104" ry="52" fill="#8a1a0a"/><ellipse cx="1010" cy="194" rx="90" ry="40" fill="url(#oil)"/>` + dots(R, 30, 1010, 194, 90, 42, 3, '#3a0a04');
      // a closed one behind, on a square of parchment
      s += `<path d="M90 230L460 190L500 470L120 500Z" fill="url(#pp)"/>` + sh(300, 380, 210, 70) +
        `<ellipse cx="290" cy="356" rx="180" ry="76" fill="url(#bnS)"/><ellipse cx="290" cy="336" rx="180" ry="72" fill="url(#bn)"/>` +
        `<g fill="none" stroke="#a8601e" stroke-width="4" opacity=".55"><ellipse cx="290" cy="336" rx="140" ry="54"/><ellipse cx="290" cy="336" rx="90" ry="34"/><ellipse cx="290" cy="336" rx="40" ry="15"/></g><path d="M150 330Q220 300 290 336T430 330" stroke="#ffe9b0" stroke-width="4" fill="none" opacity=".5"/>`;
      // the hero: open like a clamshell, stuffed
      s += sh(640, 740, 330, 70);
      s += `<g transform="rotate(-6 640 420)"><ellipse cx="640" cy="420" rx="250" ry="132" fill="#c97e2a"/><ellipse cx="640" cy="426" rx="232" ry="118" fill="url(#crm)"/>` + dots(R, 40, 640, 426, 210, 100, 3, '#e6cfa4') + `</g>`;
      s += `<ellipse cx="640" cy="640" rx="270" ry="104" fill="url(#bnS)"/><ellipse cx="640" cy="616" rx="266" ry="96" fill="url(#crm)"/>`;
      // filling heaped and spilling forward
      const M = [];
      for (let i = 0; i < 62; i++) { const a = R() * TAU, r = Math.sqrt(R()); M.push([640 + Math.cos(a) * 236 * r, 600 + Math.sin(a) * 66 * r - (1 - r) * 70, R() * 180, 1.2 + R() * 0.5]); }
      M.sort((a, b) => a[1] - b[1]);
      s += `<path d="M376 622C392 540 520 498 640 498C760 498 888 540 904 622C800 668 480 668 376 622Z" fill="#4a1608"/>`;
      for (const [x, y, a, k] of M) s += `<use href="#mc" transform="translate(${r0(x)} ${r0(y)}) rotate(${r0(a)}) scale(${f1(k)})"/>`;
      s += `<path d="M420 640q10 26-4 40q-10-20 4-40zM840 636q8 22-6 34q-8-18 6-34z" fill="#5a1c0a"/>`;
      s += dots(R, 22, 640, 570, 200, 60, 4, '#ff9a60', 0.55);
      s += dashes(R, 18, 640, 560, 210, 60, 16, 8, '#4fae3c') + dashes(R, 10, 640, 560, 200, 56, 12, 6, '#d8301a');
      let cil = '';
      for (let i = 0; i < 7; i++) { const [x, y] = inE(R, 640, 550, 180, 50); cil += `M${r0(x)} ${r0(y)}c8 -14 22 -14 26 0c-8 10-18 10-26 0Z`; }
      s += `<path d="${cil}" fill="#3f9a3a"/>`;
      // paper sleeve with the Mora stamp
      s += `<path d="M372 696C470 756 810 756 908 696L892 806C800 846 480 846 388 806Z" fill="url(#pp)"/><path d="M372 696C470 756 810 756 908 696" stroke="#d8c8a6" stroke-width="3" fill="none"/>`;
      s += `<circle cx="640" cy="790" r="30" fill="none" stroke="#c89a2a" stroke-width="5"/><text x="640" y="803" font-size="36" font-weight="800" fill="#c89a2a" text-anchor="middle">ℳ</text>`;
      s += `<g transform="translate(180 780) rotate(-20)"><path d="M0 0C30 -20 70 -10 90 10C60 24 20 22 0 0Z" fill="#4fae3c"/><path d="M0 0L-40 20" stroke="#4fae3c" stroke-width="4"/></g>`;
      s += steam(R, 640, 480, 3, 260);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_milk_tea — iced milk tea, brown-sugar stripes, pearls, osmanthus
     ========================================================================================= */
  def('food_milk_tea', {
    title: 'Osmanthus milk tea', w: 1200, h: 900, tags: ['food', 'drink', 'milk-tea', 'osmanthus'],
    svg: (w, h) => {
      const R = rng(1010);
      const top = 150, bot = 790, x0 = 470, x1 = 730, b0 = 500, b1 = 700;
      const CUP = `M${x0} ${top}L${b0} ${bot}H${b1}L${x1} ${top}Z`;
      const D = BASE(0.45) +
        lin('bg', '0 0 0 1', '#2c3a3a 0|#5a4a3a .6|#3a2a1e 1') +
        rad('bk', '.5 .5 .5', '#ffd18a 0 .6|#ffd18a 1 0') + rad('bk2', '.5 .5 .5', '#9ae0d0 0 .5|#9ae0d0 1 0') +
        lin('tea', '0 0 0 1', '#f1dcc0 0|#dcb88e .5|#c08f60 1') +
        lin('cup', '0 0 1 0', '#ffffff 0 .5|#ffffff .15 .1|#ffffff .8 .05|#ffffff 1 .4') +
        lin('tg', '0 0 0 1', '#6a3008 0 .9|#8a4614 .6 .5|#8a4614 1 0') +
        rad('pr', '.35 .3 .6', '#7a4a2a 0|#3a1e10 .7|#1e0e06 1') +
        lin('ctr', '0 0 0 1', '#8a6a4a 0|#4a3220 1') +
        `<clipPath id="cc"><path d="${CUP}"/></clipPath>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      for (let i = 0; i < 14; i++) s += `<circle cx="${r0(R() * 1200)}" cy="${r0(R() * 520)}" r="${r0(24 + R() * 60)}" fill="url(#${i % 3 ? 'bk' : 'bk2'})" opacity="${f1(0.25 + R() * 0.4)}"/>`;
      s += `<path d="M0 640C400 620 800 620 1200 640V900H0Z" fill="url(#ctr)"/><path d="M0 640C400 620 800 620 1200 640" stroke="#b08a60" stroke-width="3" fill="none"/>`;
      s += `<path d="M180 780C260 740 330 740 400 760" stroke="#5a3a1e" stroke-width="5" fill="none"/>` +
        `<g fill="#3f7d2a"><path d="M230 756C240 720 280 712 296 730C280 752 250 760 230 756Z"/><path d="M320 748C340 716 380 716 390 736C370 754 340 758 320 748Z"/></g>` + dots(R, 14, 300, 770, 80, 20, 6, '#f2a21e');
      s += sh(600, 800, 200, 40, 0.9);
      s += `<path d="${CUP}" fill="url(#tea)"/><g clip-path="url(#cc)">`;
      // brown-sugar tiger stripes: organic, thick at the rim, fading down
      let tg = '';
      for (let i = 0; i < 8; i++) {
        const x = x0 + 18 + i * 32 + (R() - 0.5) * 10, wd = 14 + R() * 14, l = 260 + R() * 220;
        tg += `M${r0(x - wd / 2)} ${top}C${r0(x - wd - 10)} ${r0(top + l * 0.3)} ${r0(x + 16)} ${r0(top + l * 0.6)} ${r0(x + 4)} ${r0(top + l)}C${r0(x + 22)} ${r0(top + l * 0.6)} ${r0(x + wd)} ${r0(top + l * 0.3)} ${r0(x + wd / 2)} ${top}Z`;
      }
      s += `<path d="${tg}" fill="url(#tg)"/>`;
      // pearls
      let pr = '';
      for (let i = 0; i < 36; i++) { const yy = bot - 20 - R() * 160, xx = 600 + (R() - 0.5) * 2 * 82; pr += `<circle cx="${r0(xx)}" cy="${r0(yy)}" r="17" fill="url(#pr)"/>`; }
      s += pr + dots(R, 22, 600, bot - 90, 90, 70, 3, '#fff', 0.5);
      [[530, 250, 12], [640, 230, -18], [590, 320, 30], [680, 330, 6]].forEach(([x, y, a]) => { s += `<rect x="${x - 34}" y="${y - 34}" width="68" height="68" rx="12" fill="#fff" opacity=".28" transform="rotate(${a} ${x} ${y})"/><rect x="${x - 26}" y="${y - 26}" width="30" height="10" rx="5" fill="#fff" opacity=".6" transform="rotate(${a} ${x} ${y})"/>`; });
      s += `<path d="M${x0} ${top}H${x1}V${top + 54}C680 ${top + 70} 520 ${top + 70} ${x0} ${top + 54}Z" fill="#f8efe0"/>` + dots(R, 18, 600, top + 30, 110, 16, 4.5, '#f2a21e');
      let cd = '';
      for (let i = 0; i < 44; i++) { const yy = top + 80 + R() * 600, xx = x0 + R() * (x1 - x0), q = f1(2 + R() * 3); cd += `M${r0(xx)} ${r0(yy)}a${q} ${f1(q * 1.3)} 0 1 0 .1 0Z`; }
      s += `<path d="${cd}" fill="#fff" opacity=".55"/></g>`;
      s += `<path d="${CUP}" fill="url(#cup)"/><path d="M${x0 + 26} ${top + 30}L${b0 + 22} ${bot - 40}" stroke="#fff" stroke-width="12" opacity=".35"/>`;
      s += `<ellipse cx="600" cy="${top}" rx="${(x1 - x0) / 2 + 8}" ry="22" fill="#eaeaea" opacity=".9"/><ellipse cx="600" cy="${top}" rx="${(x1 - x0) / 2 - 6}" ry="15" fill="#fff" opacity=".7"/>` + logo(560, top + 2, 13);
      s += `<g transform="rotate(14 640 ${top})"><rect x="626" y="${top - 170}" width="30" height="220" rx="8" fill="#e04a3a"/><rect x="630" y="${top - 170}" width="8" height="220" rx="4" fill="#fff" opacity=".4"/><path d="M626 ${top - 150}h30M626 ${top - 110}h30M626 ${top - 70}h30" stroke="#fff" stroke-width="6" opacity=".55"/></g>`;
      return wrap(w, h, D, s + FIN(0.12));
    },
  });

  /* =========================================================================================
     food_crystal_shrimp — translucent har gow in a bamboo steamer
     ========================================================================================= */
  def('food_crystal_shrimp', {
    title: 'Crystal shrimp dumplings', w: 1200, h: 900, tags: ['food', 'dim-sum', 'har-gow', 'shrimp'],
    svg: (w, h) => {
      const R = rng(1111);
      // pleat bumps along the seam
      let pl = 'M-78 -4';
      for (let i = 1; i <= 10; i++) { const t = i / 10, x = -78 + 156 * t, y = -4 - Math.sin(t * Math.PI) * 40; pl += `Q${f1(x - 6)} ${f1(y - 16)} ${f1(x)} ${f1(y)}`; }
      const D = BASE(0.55) +
        lin('bg', '0 0 1 1', '#2a2620 0|#14120e 1') +
        lin('bm', '0 0 1 1', '#f0d39a 0|#c99a5a .5|#8a6230 1') +
        rad('pp', '.5 .5 .5', '#f7f0e0 0|#e8dcc2 1') +
        rad('sp', '.4 .4 .6', '#ffb08a 0|#f47c50 .6|#d9532e 1') +
        rad('wr', '.42 .35 .7', '#ffffff 0 .45|#f8f4ee .6 .5|#efe8de 1 .8') +
        rad('tea', '.5 .5 .5', '#d9a64a 0|#a8701e 1') +
        `<g id="hg"><ellipse cx="6" cy="18" rx="96" ry="64" fill="#5a4426" opacity=".35"/>` +
        `<path d="M-90 16C-92 -40-46 -64 0 -64C46 -64 92 -40 90 16C70 50 30 56 0 56C-30 56-70 50-90 16Z" fill="#f1e2d6"/>` +
        `<path d="M-60 18C-62 -24 -10 -40 28 -26C56 -16 62 16 44 26C34 2 4 -10-24 6C-36 14-44 28-60 18Z" fill="url(#sp)"/>` +
        `<path d="M-44 6Q-40 -14-24 -20M-18 -4Q-10 -24 6 -26M14 -4Q24 -20 38 -14" stroke="#ffd8c4" stroke-width="5" fill="none"/>` +
        `<path d="M-90 16C-92 -40-46 -64 0 -64C46 -64 92 -40 90 16C70 50 30 56 0 56C-30 56-70 50-90 16Z" fill="url(#wr)"/>` +
        `<path d="${pl}" fill="none" stroke="#e6d9c8" stroke-width="12"/><path d="${pl}" fill="none" stroke="#fffdf8" stroke-width="5"/>` +
        `<path d="M-82 4C-80 -34-50 -56-12 -60" stroke="#fff" stroke-width="7" fill="none" opacity=".85"/><ellipse cx="-24" cy="32" rx="26" ry="7" fill="#fff" opacity=".7"/><circle cx="40" cy="20" r="6" fill="#fff" opacity=".8"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      s += sh(1100, 790, 150, 130) + `<circle cx="1100" cy="780" r="120" fill="#e9efe9"/><circle cx="1100" cy="780" r="98" fill="url(#tea)"/><ellipse cx="1070" cy="750" rx="40" ry="14" fill="#fff" opacity=".3"/>`;
      s += sh(130, 150, 140, 110) + `<circle cx="120" cy="130" r="110" fill="#f4f1ec"/><circle cx="120" cy="130" r="84" fill="#3a1a0a"/><circle cx="110" cy="120" r="50" fill="#5a2a12"/>` + dots(R, 10, 120, 130, 60, 60, 4, '#e8402a');
      s += chops(40, 880, 400, 720, 8, 26, '#6a4428', '#e0b080');
      // steamer: woven rim, parchment liner
      s += sh(612, 482, 400, 380) + `<circle cx="600" cy="450" r="350" fill="url(#bm)"/>`;
      let wv = '';
      for (let r = 304; r < 350; r += 9) wv += `M${600 - r} 450a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`;
      s += `<path d="${wv}" fill="none" stroke="#7a5426" stroke-width="2" opacity=".55"/>`;
      s += `<circle cx="600" cy="450" r="300" fill="#6a4a22"/><circle cx="600" cy="450" r="290" fill="url(#pp)"/>`;
      let holes = '';
      for (let r = 60; r < 280; r += 60) for (let k = 0; k < Math.floor(r / 14); k++) { const a = k / Math.floor(r / 14) * TAU + r; holes += `M${r0(600 + Math.cos(a) * r) - 3} ${r0(450 + Math.sin(a) * r)}a3 3 0 1 0 6 0a3 3 0 1 0-6 0Z`; }
      s += `<path d="${holes}" fill="#d6c8a8"/>`;
      [[470, 320, -24], [740, 330, 22], [440, 580, 196], [720, 590, 160], [596, 456, 76]].forEach(([x, y, a]) => { s += `<use href="#hg" transform="translate(${x} ${y}) rotate(${a})"/>`; });
      s += steam(R, 600, 330, 3, 280);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });

  /* =========================================================================================
     food_noodles — spicy chili-oil noodles, chopsticks lifting a bite
     ========================================================================================= */
  def('food_noodles', {
    title: 'Spicy noodles', w: 1200, h: 900, tags: ['food', 'noodles', 'spicy'],
    svg: (w, h) => {
      const R = rng(1212);
      // dense noodle nest (drawn three times via <use>: shadow, body, sheen)
      let nd = '';
      for (let i = 0; i < 80; i++) {
        const a = R() * TAU, r = Math.sqrt(R()) * 170, x = 560 + Math.cos(a) * r, y = 480 + Math.sin(a) * r * 0.9;
        const b = R() * TAU, l = 70 + R() * 90, bend = (R() - 0.5) * 2.4;
        nd += `M${r0(x)} ${r0(y)}c${r0(Math.cos(b + bend) * l * 0.5)} ${r0(Math.sin(b + bend) * l * 0.5)} ${r0(Math.cos(b - bend * 0.5) * l * 0.8)} ${r0(Math.sin(b - bend * 0.5) * l * 0.8)} ${r0(Math.cos(b) * l)} ${r0(Math.sin(b) * l)}`;
      }
      // lifted strands converging on the chopstick tips
      let lf = '';
      for (let i = 0; i < 7; i++) { const x = 650 + i * 18; lf += `M${x} ${360 + (i % 3) * 14}C${x + 14} ${300 - i * 4} ${770 - i * 6} ${220 + i * 6} ${790 + (i % 3) * 4} ${132 + i * 3}`; }
      const D = BASE(0.55) +
        lin('bg', '0 0 1 1', '#33302e 0|#1a1817 1') +
        lin('bw', '0 0 1 1', '#3a4a6a 0|#1a2236 1') +
        rad('br', '.45 .42 .6', '#e8501e 0|#c42a10 .55|#7a1206 1') +
        rad('oil', '.5 .5 .5', '#ffae4a 0 .6|#ffae4a 1 0') +
        `<path id="nd" d="${nd}"/><path id="lf" d="${lf}"/>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>` + dots(R, 60, 600, 450, 700, 520, 1.6, '#45413e', 0.8);
      const cl = [];
      for (let i = 0; i < 7; i++) cl.push([i < 4 ? 60 + R() * 200 : 980 + R() * 180, i < 4 ? 620 + R() * 240 : 300 + R() * 200, R() * 360, 36 + R() * 10]);
      s += chilis(cl, '#b8180e');
      s += sh(582, 482, 380, 360) + `<circle cx="570" cy="460" r="330" fill="url(#bw)"/><circle cx="570" cy="460" r="330" fill="none" stroke="#c9d4e6" stroke-width="5" opacity=".5"/><circle cx="570" cy="460" r="300" fill="#141a28"/><circle cx="570" cy="460" r="290" fill="url(#br)"/>`;
      for (let i = 0; i < 7; i++) { const [x, y] = inE(R, 570, 460, 220, 220); s += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(30 + R() * 40)}" ry="${r0(20 + R() * 26)}" fill="url(#oil)"/>`; }
      s += `<circle cx="560" cy="480" r="200" fill="#8a2a0e" opacity=".55"/>`;
      s += `<use href="#nd" fill="none" stroke="#8a3a10" stroke-width="13" opacity=".7"/><use href="#nd" fill="none" stroke="#f1cc80" stroke-width="8.5"/><use href="#nd" fill="none" stroke="#fff3c8" stroke-width="2.5" opacity=".7" transform="translate(-1.5 -1.5)"/>`;
      // chili oil over the noodles
      s += dots(R, 36, 560, 480, 190, 170, 8, '#d8300e', 0.7) + dots(R, 50, 560, 480, 220, 200, 2.6, '#5a0e06');
      s += `<g transform="translate(700 380)">` + dots(R, 40, 0, 0, 70, 50, 7, '#7a3418') + dots(R, 20, 0, 0, 60, 40, 5, '#a8522a') + `</g>`;
      let pn = '';
      for (let i = 0; i < 22; i++) { const [x, y] = inE(R, 430, 400, 70, 50); pn += `M${r0(x)} ${r0(y)}l12 -4 6 10-10 8-10-4z`; }
      s += `<path d="${pn}" fill="#e8b878"/>`;
      [[400, 600, 30], [450, 630, 70]].forEach(([x, y, a]) => { s += `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 -70C40 -60 50 10 20 40H-20C-50 10-40 -60 0 -70Z" fill="#3f9a3a"/><path d="M-16 40C-20 10-12 -20 0 -40C12 -20 20 10 16 40Z" fill="#e8f5d8"/><path d="M0 -66V30" stroke="#2a6a22" stroke-width="2"/></g>`; });
      s += scallions(R, 22, 570, 460, 250, 250, 8);
      // lifted bite + chopsticks gripping it
      s += `<use href="#lf" fill="none" stroke="#8a3a10" stroke-width="12" opacity=".6"/><use href="#lf" fill="none" stroke="#f1cc80" stroke-width="8"/><use href="#lf" fill="none" stroke="#fff3c8" stroke-width="2.5" opacity=".7" transform="translate(-1.5 0)"/>`;
      s += dots(R, 10, 760, 220, 40, 70, 5, '#d8300e', 0.7);
      s += chops(1220, -30, 784, 132, 12, 34, '#2a1c14', '#c99a6a');
      s += glint(470, 330, 80, 20, 0.4) + steam(R, 570, 360, 3, 260);
      return wrap(w, h, D, s + FIN(0.14));
    },
  });
})();
