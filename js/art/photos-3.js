/* Photos 3 — Gusu, food, Yunmeng ops. 1200×900. */
(function () {
  'use strict';
  const def = JC.art.def;

  /* ---------- tiny kit (each art file is self-contained) ---------- */
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
  const f1 = (v) => Math.round(v * 10) / 10;
  const r0 = Math.round;
  const stops = (s) =>
    s.split('|').map((t) => {
      const [c, o, a] = t.trim().split(/\s+/);
      return `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`;
    }).join('');
  const lin = (id, v, s, ex) => {
    const [x1, y1, x2, y2] = v.split(' ');
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${ex || ''}>${stops(s)}</linearGradient>`;
  };
  const rad = (id, v, s, ex) => {
    const [cx, cy, r, fx, fy] = v.split(' ');
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ''}${ex || ''}>${stops(s)}</radialGradient>`;
  };
  const US = ' gradientUnits="userSpaceOnUse"';
  const FONT = '-apple-system, Helvetica, Arial, sans-serif';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const grainDef = (id, fr) =>
    `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr || 0.8}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const grain = (id, w, h, op) => `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${op}" style="mix-blend-mode:overlay"/>`;
  const vig = (id, op) => rad(id, '.5 .5 .75', `#000 .55 0|#000 1 ${op}`);
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  // soft bokeh discs
  const bokeh = (R, n, x0, y0, x1, y1, rmin, rmax, ids, omin, omax) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const id = ids[Math.floor(R() * ids.length)];
      s += `<circle cx="${r0(x0 + R() * (x1 - x0))}" cy="${r0(y0 + R() * (y1 - y0))}" r="${r0(rmin + R() * (rmax - rmin))}" fill="url(#${id})" opacity="${f1(omin + R() * (omax - omin))}"/>`;
    }
    return s;
  };
  const bokehDef = (id, c) => rad(id, '.5 .5 .5', `${c} 0 .6|${c} .78 .55|${c} .9 .3|${c} 1 0`);
  const glowDef = (id, c, a) => rad(id, '.5 .5 .5', `${c} 0 ${a == null ? 0.9 : a}|${c} .35 ${f1((a == null ? 0.9 : a) * 0.4)}|${c} 1 0`);

  // smooth ridge line for mountains: bumps [{x, h, w, p}] over base y, sampled every `step`
  const ridge = (W, base, bottom, bumps, seed, step, rough) => {
    const R = rng(seed);
    let d = `M0 ${bottom}`;
    let n1 = 0;
    for (let x = 0; x <= W + step; x += step) {
      let hgt = 0;
      for (const b of bumps) {
        const u = Math.abs(x - b.x) / b.w;
        hgt = Math.max(hgt, b.h * Math.exp(-Math.pow(u, b.p || 2)));
      }
      n1 = n1 * 0.6 + (R() - 0.5) * (rough || 0);
      d += `L${Math.min(x, W)} ${f1(base - hgt + n1)}`;
    }
    return d + `L${W} ${bottom}Z`;
  };

  // traditional hall roof (front view): eave width w at y=0, ridge h above
  const roof = (x, y, w, h, c1, c2) =>
    `<g transform="translate(${x} ${y})"><path d="M${-w / 2 - 26} -6Q${-w / 2} 2 ${-w / 2 + 14} 6H${w / 2 - 14}Q${w / 2} 2 ${w / 2 + 26} -6Q${w / 2 - 6} ${-h * 0.3} ${w / 2 - 34} ${-h}H${-w / 2 + 34}Q${-w / 2 + 6} ${-h * 0.3} ${-w / 2 - 26} -6Z" fill="${c1}"/>` +
    `<path d="M${-w / 2 + 30} ${-h - 4}H${w / 2 - 30}V${-h + 4}H${-w / 2 + 30}Z" fill="${c2}"/><path d="M${-w / 2 + 26} ${-h - 2}q-10-8-12-18q10 4 18 14zM${w / 2 - 26} ${-h - 2}q10-8 12-18q-10 4-18 14z" fill="${c2}"/>` +
    `<path d="M${-w / 2 - 26} -6Q${-w / 2} 2 ${-w / 2 + 14} 6H${w / 2 - 14}Q${w / 2} 2 ${w / 2 + 26} -6" stroke="${c2}" stroke-width="4" fill="none"/></g>`;
  // ink-style pine: curved trunk, branches and flat cloud-shaped foliage pads
  const pine = (x, y, s, flip, c, hi) => {
    const pad = (px, py, rx) => `<path d="M${px - rx} ${py}Q${f1(px - rx * 0.8)} ${f1(py - rx * 0.32)} ${f1(px - rx * 0.4)} ${f1(py - rx * 0.3)}Q${px} ${f1(py - rx * 0.5)} ${f1(px + rx * 0.4)} ${f1(py - rx * 0.3)}Q${f1(px + rx * 0.85)} ${f1(py - rx * 0.3)} ${px + rx} ${py}Z"/>`;
    const P = [[14, -250, 70], [-46, -196, 84], [60, -176, 74], [-14, -132, 96], [74, -104, 60], [-70, -86, 64]];
    let g = `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-8 0Q-14-90 8-160Q20-210 6-262" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
    g += `<path d="${P.map(([px, py]) => `M${px > 0 ? 6 : -4} ${py + 30}Q${px * 0.5} ${py + 10} ${px} ${py}`).join('')}" stroke="${c}" stroke-width="5" fill="none"/>`;
    g += `<g fill="${c}">${P.map(([px, py, rx]) => pad(px, py, rx)).join('')}</g>`;
    if (hi) g += `<g fill="${hi}" opacity=".6">${P.map(([px, py, rx]) => pad(px, py - rx * 0.12, rx * 0.6)).join('')}</g>`;
    return g + '</g>';
  };
  // student in white robes, seen from behind (feet at 0, ~150 tall)
  const student = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22-112Q-30-60-40 0H40Q30-60 22-112Q12-122 0-122Q-12-122-22-112Z" fill="#f4f6f8"/><path d="M-22-112Q-30-60-40 0H-24Q-18-60-14-110Z" fill="#d8dee6"/>` +
    `<path d="M-38-6H38" stroke="#9cc0e8" stroke-width="4"/><circle cx="0" cy="-134" r="13" fill="#1c1513"/><path d="M-6-130Q0-96 6-130Z" fill="#1c1513"/><path d="M-13-138H13" stroke="#f4f6f8" stroke-width="3"/><path d="M10-138q16 4 18 22" stroke="#f4f6f8" stroke-width="2.5" fill="none"/></g>`;


  /* =====================================================================
     p_gusu_moon — moon over the misty rooftops of Cloud Recesses
     ===================================================================== */
  def('p_gusu_moon', {
    title: 'Moon over Gusu', w: 1200, h: 900, tags: ['moon', 'night', 'gusu', 'cloud-recesses', 'xichen'],
    svg: (w, h) => {
      const R = rng(117);
      const defs =
        lin('sky', '0 0 0 1', '#08142a 0|#13284a .55|#2a4668 1') +
        rad('mn', '.45 .4 .6', '#ffffff 0|#f2f4ee .75|#d8dcd0 1') + glowDef('mg', '#cfe0ff', 0.55) +
        lin('mist', '0 0 0 1', '#9ab4cc 0 0|#9ab4cc .5 .5|#9ab4cc 1 0') +
        lin('wall', '0 0 0 1', '#c8d4e0 0|#8a9cb0 1') +
        lin('rf', '0 0 0 1', '#2a3448 0|#161c2a 1') +
        glowDef('win', '#ffcf85', 0.8) +
        vig('vg', 0.55) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      let st = '';
      for (let i = 0; i < 80; i++) st += `<circle cx="${r0(R() * w)}" cy="${r0(R() * 420)}" r="${f1(0.6 + R() * 1.4)}" opacity="${f1(0.3 + R() * 0.7)}"/>`;
      b += `<g fill="#e8f0ff">${st}</g>`;
      b += `<circle cx="820" cy="200" r="340" fill="url(#mg)"/><circle cx="820" cy="200" r="140" fill="url(#mg)"/><circle cx="820" cy="200" r="78" fill="url(#mn)"/>`;
      b += `<g fill="#c8ccc0" opacity=".25"><circle cx="796" cy="184" r="16"/><circle cx="842" cy="222" r="10"/><circle cx="836" cy="176" r="6"/></g>`;
      // mountains + mist
      b += `<path d="${ridge(w, 520, h, [{ x: 150, h: 300, w: 160, p: 1.5 }, { x: 420, h: 220, w: 150 }, { x: 1000, h: 330, w: 170, p: 1.5 }, { x: 700, h: 180, w: 160 }], 4, 10, 6)}" fill="#1e3452"/>`;
      b += `<rect y="380" width="${w}" height="200" fill="url(#mist)"/>`;
      b += `<path d="${ridge(w, 600, h, [{ x: 60, h: 160, w: 200 }, { x: 560, h: 120, w: 220 }, { x: 1150, h: 170, w: 200 }], 7, 10, 5)}" fill="#162a44"/>`;
      // rooftop layers
      const hall = (x, y, wd, s) => {
        let g = `<g transform="translate(${x} ${y}) scale(${s})">`;
        g += `<rect x="${-wd / 2 + 20}" y="0" width="${wd - 40}" height="90" fill="url(#wall)"/><path d="M${-wd / 2 + 20} 4H${wd / 2 - 20}" stroke="#3a2a20" stroke-width="6"/>`;
        for (let k = -wd / 2 + 26; k <= wd / 2 - 26; k += 60) g += `<rect x="${k - 3}" y="0" width="6" height="90" fill="#3a2a20"/>`;
        for (let k = -wd / 2 + 50; k < wd / 2 - 40; k += 60) g += `<rect x="${k}" y="20" width="30" height="44" fill="#3a2a20"/><rect x="${k + 3}" y="23" width="24" height="38" fill="${R() < 0.4 ? '#ffcf85' : '#2a3448'}"/>`;
        g += roof(0, 0, wd, 60, 'url(#rf)', '#4a5a70') + '</g>';
        return g;
      };
      b += hall(250, 600, 420, 0.8) + hall(900, 590, 460, 0.8) + hall(600, 640, 380, 0.7);
      b += `<circle cx="560" cy="680" r="60" fill="url(#win)" opacity=".5"/>`;
      b += `<rect y="600" width="${w}" height="140" fill="url(#mist)"/>`;
      b += hall(160, 790, 520, 1.1) + hall(1020, 800, 560, 1.1);
      b += `<rect y="760" width="${w}" height="140" fill="url(#mist)" opacity=".8"/>`;
      // pine silhouettes
      b += pine(560, 920, 0.95, false, '#0a1424', '#1a2c44') + pine(1150, 720, 0.7, true, '#0a1424', '#1a2c44');
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.09);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_tea_hanshi — tea set, white peony tea, steam, bamboo window
     ===================================================================== */
  def('p_tea_hanshi', {
    title: 'Tea at the Hanshi', w: 1200, h: 900, tags: ['tea', 'hanshi', 'xichen', 'gusu', 'white-peony'],
    svg: (w, h) => {
      const R = rng(85);
      const defs =
        lin('wall', '0 0 0 1', '#e8e0d0 0|#d4c8b2 1') +
        lin('out', '0 0 1 1', '#e8f4d8 0|#b8d8a0 .5|#8ab878 1') +
        lin('tbl', '0 0 0 1', '#8a5a34 0|#5a3a20 1') +
        lin('tblTop', '0 0 0 1', '#a8724a 0|#7a4e2e 1') +
        lin('cel', '0 0 1 0', '#c8dccc 0|#f2f8f2 .4|#b8d0c0 1') +
        lin('tea', '0 0 0 1', '#f6dc8a 0|#e0b45a 1') +
        lin('steam', '0 1 0 0', '#fff 0 .55|#fff 1 0') +
        rad('sun', '.2 .1 .9', '#fff8e0 0 .5|#fff8e0 1 0') +
        vig('vg', 0.45) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      // window with bamboo outside
      b += `<rect x="180" y="60" width="840" height="440" fill="url(#out)"/>`;
      let bam = '';
      for (const [x, wd] of [[240, 26], [330, 20], [470, 30], [610, 22], [760, 28], [880, 20], [960, 26]]) {
        bam += `<rect x="${x}" y="60" width="${wd}" height="440" fill="#5a9a4a"/>`;
        for (let y = 100; y < 500; y += 90 + (x % 30)) bam += `<rect x="${x - 2}" y="${y}" width="${wd + 4}" height="6" fill="#3f7a34"/>`;
      }
      let lv = '';
      for (let i = 0; i < 60; i++) { const x = 180 + R() * 840, y = 60 + R() * 420, a = -60 + R() * 120; lv += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(26 + R() * 18)}" ry="6" transform="rotate(${r0(a)} ${r0(x)} ${r0(y)})"/>`; }
      b += `<g opacity=".85">${bam}</g><g fill="#4f8f3c" opacity=".8">${lv}</g>`;
      b += `<rect x="180" y="60" width="840" height="440" fill="#fff" opacity=".18"/>`;
      // lattice frame
      let lat = '';
      for (let x = 180; x <= 1020; x += 140) lat += `M${x} 60V500`;
      for (let y = 60; y <= 500; y += 110) lat += `M180 ${y}H1020`;
      b += `<path d="${lat}" stroke="#6a4a2a" stroke-width="8"/><rect x="170" y="50" width="860" height="460" fill="none" stroke="#5a3a20" stroke-width="20"/>`;
      b += `<path d="M0 0L700 0L1200 900H300Z" fill="url(#sun)" opacity=".5"/>`;
      // table
      b += `<path d="M0 560H1200V900H0Z" fill="url(#tbl)"/><path d="M0 560H1200V600H0Z" fill="url(#tblTop)"/>`;
      let gr2 = '';
      for (let i = 0; i < 18; i++) { const y = 600 + R() * 300; gr2 += `M0 ${r0(y)}C400 ${r0(y + (R() - 0.5) * 30)} 800 ${r0(y + (R() - 0.5) * 30)} 1200 ${r0(y)}`; }
      b += `<path d="${gr2}" stroke="#4a2e18" stroke-width="2" fill="none" opacity=".45"/>`;
      // tea tray
      b += `<path d="M200 640H1000L1060 760H140Z" fill="#3a2a1e"/><path d="M140 760H1060V780H140Z" fill="#2a1e14"/>`;
      // teapot (celadon)
      b += `<ellipse cx="370" cy="728" rx="120" ry="18" fill="#000" opacity=".3"/>`;
      b += `<path d="M260 640Q250 720 300 730H440Q490 720 480 640Q470 590 370 586Q270 590 260 640Z" fill="url(#cel)"/>`;
      b += `<path d="M480 650Q540 640 560 600L572 606Q560 664 484 690Z" fill="url(#cel)"/><path d="M262 640Q210 640 214 680Q218 712 270 706" stroke="#b0c8b8" stroke-width="12" fill="none"/>`;
      b += `<ellipse cx="370" cy="590" rx="70" ry="12" fill="#d8e8dc"/><ellipse cx="370" cy="578" rx="16" ry="9" fill="#c8dccc"/>`;
      b += `<path d="M300 620Q370 600 440 620" stroke="#fff" stroke-width="6" fill="none" opacity=".6"/>`;
      // cups with pale golden tea + steam
      const cup = (x, y) => `<ellipse cx="${x}" cy="${y + 64}" rx="64" ry="12" fill="#000" opacity=".3"/><path d="M${x - 56} ${y}Q${x - 50} ${y + 60} ${x} ${y + 62}Q${x + 50} ${y + 60} ${x + 56} ${y}Z" fill="url(#cel)"/><ellipse cx="${x}" cy="${y}" rx="56" ry="14" fill="#e8f0e8"/><ellipse cx="${x}" cy="${y + 2}" rx="46" ry="10" fill="url(#tea)"/><ellipse cx="${x - 12}" cy="${y}" rx="14" ry="3" fill="#fff" opacity=".6"/>`;
      b += cup(640, 650) + cup(820, 666);
      for (const [x, d] of [[640, 'M0 0C-20-40 20-70 0-110S-16-170 6-200'], [820, 'M0 0C18-40-18-80 4-120S20-180 0-210']]) b += `<path d="${d}" transform="translate(${x} 640)" stroke="url(#steam)" stroke-width="20" fill="none" stroke-linecap="round" opacity=".7"/>`;
      // dish of dried white peony leaves
      b += `<ellipse cx="960" cy="700" rx="70" ry="22" fill="#e8e4dc"/><ellipse cx="960" cy="696" rx="56" ry="16" fill="#f4f2ec"/>`;
      for (let i = 0; i < 14; i++) b += `<ellipse cx="${r0(925 + R() * 70)}" cy="${r0(688 + R() * 14)}" rx="10" ry="4" fill="${R() < 0.5 ? '#c8d4b8' : '#e8ece0'}" transform="rotate(${r0(R() * 180)} 960 696)"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_cloud_recesses — the Academy gates in mist
     ===================================================================== */
  def('p_cloud_recesses', {
    title: 'Cloud Recesses gates', w: 1200, h: 900, tags: ['gusu', 'cloud-recesses', 'mist', 'academy'],
    svg: (w, h) => {
      const R = rng(3000);
      const defs =
        lin('sky', '0 0 0 1', '#c8d6dc 0|#e8ecea 1') +
        lin('mist', '0 0 0 1', '#f2f4f2 0 0|#f2f4f2 .5 .85|#f2f4f2 1 0') +
        lin('rf', '0 0 0 1', '#4a5660 0|#2a3038 1') +
        lin('wl', '0 0 0 1', '#f6f6f2 0|#d8dad4 1') +
        lin('step', '0 0 0 1', '#b8bcb8 0|#8a8e8a 1') +
        lin('door', '0 0 1 0', '#5a3a28 0|#7a5034 .5|#4a2e1e 1') +
        vig('vg', 0.3) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<path d="${ridge(w, 420, h, [{ x: 120, h: 300, w: 120, p: 1.4 }, { x: 330, h: 200, w: 120 }, { x: 900, h: 340, w: 130, p: 1.4 }, { x: 1120, h: 240, w: 120 }], 2, 10, 5)}" fill="#a8b8bc" opacity=".8"/>`;
      b += `<rect y="300" width="${w}" height="200" fill="url(#mist)"/>`;
      // walls either side + gate building
      b += `<path d="M0 470H380V640H0Z" fill="url(#wl)"/><path d="M820 470H1200V640H820Z" fill="url(#wl)"/>`;
      b += roof(190, 470, 400, 30, 'url(#rf)', '#5a6670') + roof(1010, 470, 400, 30, 'url(#rf)', '#5a6670');
      b += `<path d="M380 360H820V640H380Z" fill="url(#wl)"/>`;
      b += roof(600, 360, 520, 90, 'url(#rf)', '#5a6670');
      b += `<rect x="530" y="250" width="140" height="56" rx="4" fill="#2a3038"/><rect x="540" y="258" width="120" height="40" rx="3" fill="none" stroke="#c8a860" stroke-width="3"/><path d="M560 278q10-10 20 0t20 0t20 0t20 0" stroke="#c8a860" stroke-width="3" fill="none"/>`;
      b += `<path d="M500 640V470Q600 420 700 470V640Z" fill="#2a2420"/><path d="M510 640V476Q560 450 600 448V640Z" fill="url(#door)"/><path d="M690 640V476Q640 450 600 448V640Z" fill="url(#door)"/>`;
      let studs = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) studs += `<circle cx="${528 + c * 24}" cy="${500 + r * 28}" r="4"/><circle cx="${624 + c * 24}" cy="${500 + r * 28}" r="4"/>`;
      b += `<g fill="#d8b060" opacity=".8">${studs}</g>`;
      for (const x of [420, 780]) b += `<rect x="${x - 14}" y="380" width="28" height="260" fill="#e8e8e4"/><rect x="${x - 18}" y="372" width="36" height="12" fill="#c8ccc8"/>`;
      // stone steps
      for (let i = 0; i < 9; i++) { const y = 640 + i * 30, hw = 160 + i * 34; b += `<path d="M${600 - hw} ${y}H${600 + hw}V${y + 30}H${600 - hw}Z" fill="url(#step)"/><path d="M${600 - hw} ${y}H${600 + hw}" stroke="#e0e2de" stroke-width="3"/>`; }
      // stone lanterns
      const lantern = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#9a9e9a"><rect x="-12" y="-80" width="24" height="80"/><path d="M-36-80H36L28-100H-28Z"/><rect x="-22" y="-140" width="44" height="40"/><rect x="-12" y="-132" width="24" height="24" fill="#f8e8c0"/><path d="M-40-140H40L0-176Z"/><circle cx="0" cy="-182" r="7"/></g>`;
      b += lantern(300, 760, 1.2) + lantern(900, 760, 1.2);
      // pines
      b += pine(90, 780, 1.2, false, '#2e4440', '#4a6460') + pine(1120, 800, 1.1, true, '#2e4440', '#4a6460');
      b += student(600, 800, 0.9);
      b += `<rect y="560" width="${w}" height="220" fill="url(#mist)" opacity=".55"/><rect y="760" width="${w}" height="160" fill="url(#mist)" opacity=".5"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_rules_wall — the stone wall covered in rules
     ===================================================================== */
  def('p_rules_wall', {
    title: 'The Wall of Rules', w: 1200, h: 900, tags: ['gusu', 'cloud-recesses', 'rules', 'wall'],
    svg: (w, h) => {
      const R = rng(3000);
      // glyph-like carved marks: one tile of columns, repeated as a pattern
      let marks = '';
      for (let c = 0; c < 4; c++) {
        for (let r = 0; r < 9; r++) {
          const x0 = 10 + c * 30, y0 = 8 + r * 26;
          const n = 3 + Math.floor(R() * 3);
          for (let k = 0; k < n; k++) {
            const t = R();
            if (t < 0.4) marks += `M${r0(x0 + R() * 6)} ${r0(y0 + R() * 18)}h${r0(8 + R() * 10)}`;
            else if (t < 0.75) marks += `M${r0(x0 + 2 + R() * 14)} ${r0(y0 + R() * 6)}v${r0(8 + R() * 12)}`;
            else marks += `M${r0(x0 + R() * 14)} ${r0(y0 + R() * 14)}l${r0(4 + R() * 6)} ${r0(4 + R() * 6)}`;
          }
        }
      }
      const defs =
        lin('sky', '0 0 0 1', '#d0dade 0|#eef0ec 1') +
        lin('stone', '0 0 1 1', '#b8b8b0 0|#9a9c96 .5|#8a8c86 1') +
        lin('mist', '0 0 0 1', '#f2f4f0 0 0|#f2f4f0 .5 .8|#f2f4f0 1 0') +
        lin('rf', '0 0 0 1', '#4a5660 0|#2a3038 1') +
        lin('path', '0 0 0 1', '#c8c4b8 0|#a8a498 1') +
        `<pattern id="gl" width="128" height="242" patternUnits="userSpaceOnUse"><path d="${marks}" stroke="#4a4c48" stroke-width="2.6" stroke-linecap="round" opacity=".75"/><path d="${marks}" stroke="#e8e8e2" stroke-width="1.4" stroke-linecap="round" opacity=".4" transform="translate(1 1)"/></pattern>` +
        vig('vg', 0.35) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<path d="${ridge(w, 300, h, [{ x: 200, h: 200, w: 140, p: 1.4 }, { x: 600, h: 150, w: 160 }, { x: 1000, h: 230, w: 140, p: 1.4 }], 5, 10, 5)}" fill="#b0bec0" opacity=".7"/>`;
      b += `<rect y="200" width="${w}" height="200" fill="url(#mist)"/>`;
      // the wall (slight perspective: taller on the left)
      b += `<path d="M40 180L1160 250V650L40 720Z" fill="url(#stone)"/>`;
      let joints = '';
      for (let i = 1; i < 8; i++) { const x = 40 + i * 140; const y0 = 180 + (i * 140 * 70) / 1120, y1 = 720 - (i * 140 * 70) / 1120; joints += `M${x} ${r0(y0)}V${r0(y1)}`; }
      b += `<path d="${joints}" stroke="#6a6c66" stroke-width="3" opacity=".6"/>`;
      b += `<clipPath id="wc"><path d="M40 196L1160 262V640L40 706Z"/></clipPath><g clip-path="url(#wc)"><g transform="matrix(1 0.0625 0 0.86 40 214)"><rect width="1120" height="560" fill="url(#gl)"/></g></g>`;
      b += roof(600, 196, 1180, 40, 'url(#rf)', '#5a6670').replace('translate(600 196)', 'translate(600 210) skewY(3.6)');
      b += `<path d="M40 720L1160 650V676L40 750Z" fill="#7a7c76"/>`;
      // moss
      let moss = '';
      for (let i = 0; i < 26; i++) { const x = 40 + R() * 1120, y = 640 + (1 - (x - 40) / 1120) * 60 + R() * 20; moss += `<ellipse cx="${r0(x)}" cy="${r0(y)}" rx="${r0(14 + R() * 30)}" ry="${r0(5 + R() * 8)}"/>`; }
      b += `<g fill="#6a8a4a" opacity=".7">${moss}</g>`;
      // path + student reading the rules
      b += `<path d="M0 760L1200 690V900H0Z" fill="url(#path)"/>`;
      let stones = '';
      for (let i = 0; i < 14; i++) stones += `<ellipse cx="${80 + i * 80}" cy="${r0(800 - i * 5)}" rx="34" ry="12"/>`;
      b += `<g fill="#9a968a" opacity=".6">${stones}</g>`;
      b += student(820, 760, 1.25);
      // pine branch framing the top right
      b += pine(1180, 420, 1.1, true, '#2e4440', '#4a6460').replace('<path d="M-8 0Q-14-90 8-160Q20-210 6-262"', '<path d="M-8 0"');
      b += `<rect y="680" width="${w}" height="220" fill="url(#mist)" opacity=".35"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.07);
      return wrap(w, h, defs, b);
    },
  });

  // lotus root slice, 3/4 view (centre x,y; radius r)
  const rootSlice = (x, y, r, rot, fill, hole) => {
    let s = `<g transform="translate(${x} ${y}) rotate(${rot || 0})"><ellipse rx="${r}" ry="${f1(r * 0.62)}" fill="${hole || '#c8a890'}"/><ellipse rx="${f1(r * 0.96)}" ry="${f1(r * 0.58)}" fill="${fill || '#f4e6d4'}"/>`;
    for (let k = 0; k < 7; k++) { const a = (k / 7) * Math.PI * 2; s += `<ellipse cx="${f1(Math.cos(a) * r * 0.56)}" cy="${f1(Math.sin(a) * r * 0.34)}" rx="${f1(r * 0.16)}" ry="${f1(r * 0.1)}" fill="${hole || '#c8a890'}"/>`; }
    return s + `<ellipse rx="${f1(r * 0.13)}" ry="${f1(r * 0.08)}" fill="${hole || '#c8a890'}"/></g>`;
  };

  /* =====================================================================
     p_lotus_root_soup — lotus root & pork rib soup
     ===================================================================== */
  def('p_lotus_root_soup', {
    title: 'Lotus root & pork rib soup', w: 1200, h: 900, tags: ['soup', 'food', 'lotus-root', 'ajie', 'family'],
    svg: (w, h) => {
      const R = rng(1102);
      const defs =
        lin('tbl', '0 0 1 1', '#6a4a32 0|#8a6244 .5|#5a3e2a 1') +
        rad('broth', '.45 .4 .7', '#f2c8a0 0|#d89a6a .6|#b8784a 1') +
        lin('bowl', '0 0 1 0', '#d8d4cc 0|#ffffff .4|#c8c2b8 1') +
        lin('rib', '0 0 1 1', '#a86a44 0|#7a4a2c 1') +
        lin('steam', '0 1 0 0', '#fff 0 .5|#fff 1 0') +
        lin('cloth', '0 0 1 1', '#e8dcc8 0|#d0c0a4 1') +
        vig('vg', 0.5) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#tbl)"/>`;
      let gl = '';
      for (let i = 0; i < 20; i++) { const y = R() * 900; gl += `M0 ${r0(y)}C400 ${r0(y + (R() - 0.5) * 40)} 800 ${r0(y + (R() - 0.5) * 40)} 1200 ${r0(y)}`; }
      b += `<path d="${gl}" stroke="#3a2618" stroke-width="2" fill="none" opacity=".4"/>`;
      // napkin + chopsticks
      b += `<path d="M880 560L1180 500L1220 900H940Z" fill="url(#cloth)"/><path d="M900 600L1190 540" stroke="#c8b494" stroke-width="3"/>`;
      b += `<path d="M960 860L1120 220" stroke="#2a1a10" stroke-width="12" stroke-linecap="round"/><path d="M1010 870L1160 230" stroke="#2a1a10" stroke-width="12" stroke-linecap="round"/>`;
      // bowl
      b += `<ellipse cx="540" cy="560" rx="400" ry="250" fill="#000" opacity=".35" transform="translate(16 30)"/>`;
      b += `<path d="M140 470Q170 760 540 790Q910 760 940 470Z" fill="url(#bowl)"/>`;
      b += `<ellipse cx="540" cy="470" rx="400" ry="210" fill="#f8f6f2"/><ellipse cx="540" cy="470" rx="400" ry="210" fill="none" stroke="#3a6aa8" stroke-width="7"/>`;
      b += `<ellipse cx="540" cy="482" rx="360" ry="180" fill="url(#broth)"/>`;
      // oil sheen
      for (let i = 0; i < 26; i++) b += `<ellipse cx="${r0(260 + R() * 560)}" cy="${r0(360 + R() * 240)}" rx="${r0(6 + R() * 14)}" ry="${r0(3 + R() * 7)}" fill="#ffe8b8" opacity=".55"/>`;
      // ribs
      const rib = (x, y, a, s) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><rect x="-56" y="-26" width="112" height="52" rx="24" fill="url(#rib)"/><path d="M-40-10q20-8 40 0t36 0" stroke="#c88a5a" stroke-width="5" fill="none" opacity=".7"/><rect x="40" y="-12" width="44" height="22" rx="11" fill="#f2e6d0"/><circle cx="86" cy="-2" r="13" fill="#f6ecda"/></g>`;
      b += rib(400, 420, -20, 1) + rib(650, 560, 160, 1.05) + rib(720, 400, 30, 0.9) + rib(360, 570, 10, 0.85);
      // lotus root slices
      b += rootSlice(540, 470, 70, -10) + rootSlice(330, 470, 52, 20) + rootSlice(760, 500, 58, -25) + rootSlice(520, 610, 54, 5) + rootSlice(600, 360, 46, 15);
      // goji + scallion
      for (const [x, y] of [[470, 540], [610, 450], [700, 600], [420, 380], [800, 430]]) b += `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#d8302a"/>`;
      for (let i = 0; i < 14; i++) b += `<circle cx="${r0(300 + R() * 500)}" cy="${r0(380 + R() * 220)}" r="${f1(5 + R() * 3)}" fill="none" stroke="#5aa83a" stroke-width="3.5"/>`;
      // porcelain spoon
      b += `<g transform="translate(830 400) rotate(-30)"><path d="M-60-30Q0-50 60-30Q70 0 60 30Q0 50-60 30Q-70 0-60-30Z" fill="url(#bowl)"/><ellipse cx="0" cy="0" rx="50" ry="24" fill="#f2c8a0"/><path d="M60-12L230-22Q246-10 230 6L60 12Z" fill="url(#bowl)"/></g>`;
      // steam
      for (const [x, d] of [[420, 'M0 0C-40-60 30-110 0-180S-30-280 10-340'], [560, 'M0 0C30-50-30-120 10-190S40-270 0-350'], [700, 'M0 0C-20-60 30-100 0-170S-20-240 10-300']]) b += `<path d="${d}" transform="translate(${x} 400)" stroke="url(#steam)" stroke-width="30" fill="none" stroke-linecap="round" opacity=".55"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_soup_fail — Wei Wuxian's burnt soup pot, smoke
     ===================================================================== */
  def('p_soup_fail', {
    title: 'Soup, attempted', w: 1200, h: 900, tags: ['soup', 'wwx', 'kitchen', 'fail', 'funny'],
    svg: (w, h) => {
      const R = rng(1031);
      const defs =
        lin('wall', '0 0 0 1', '#d8cfc0 0|#bfb3a0 1') +
        lin('ctr', '0 0 0 1', '#4a4a50 0|#2a2a30 1') +
        lin('pot', '0 0 1 0', '#3a3a40 0|#8a8a94 .35|#5a5a64 .7|#24242a 1') +
        rad('fire', '.5 .8 .7', '#fff0a0 0|#ff9a2a .5|#e0401a .85|#e0401a 1 0') +
        rad('smk', '.45 .4 .6', '#8a8a90 0 .85|#6a6a72 .7 .6|#6a6a72 1 0') +
        rad('smk2', '.45 .4 .6', '#c8c8cc 0 .8|#a8a8b0 .7 .5|#a8a8b0 1 0') +
        vig('vg', 0.55) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      let tl = '';
      for (let x = 0; x <= w; x += 100) tl += `M${x} 0V600`;
      for (let y = 0; y <= 600; y += 50) tl += `M0 ${y}H1200`;
      b += `<path d="${tl}" stroke="#a89c88" stroke-width="2.5"/>`;
      // a string of dried red chillies (Wei Wuxian's kitchen)
      b += `<path d="M90 0V300" stroke="#8a6a3a" stroke-width="3"/>`;
      for (let i = 0; i < 9; i++) b += `<path d="M90 ${40 + i * 30}q${i % 2 ? 30 : -30} 6 ${i % 2 ? 46 : -46} 34q${i % 2 ? -26 : 26}-4 ${i % 2 ? -46 : 46}-26z" fill="#c8202a"/>`;
      // counter + stove
      b += `<path d="M0 600H1200V900H0Z" fill="url(#ctr)"/><path d="M0 600H1200" stroke="#6a6a72" stroke-width="5"/>`;
      b += `<ellipse cx="600" cy="680" rx="200" ry="34" fill="#1a1a1e"/><circle cx="600" cy="690" r="150" fill="url(#fire)" opacity=".8"/>`;
      for (let i = 0; i < 10; i++) b += `<path d="M${520 + i * 18} 690q-10-30 6-60q6 30 10 60z" fill="#ffb030" opacity=".9"/>`;
      // pot with black char boiling over
      b += `<path d="M420 430Q410 640 470 670H730Q790 640 780 430Z" fill="url(#pot)"/>`;
      b += `<path d="M408 430H792" stroke="#2a2a30" stroke-width="14" stroke-linecap="round"/>`;
      b += `<path d="M418 440Q430 500 446 520Q456 470 470 520Q484 560 500 470Q520 540 540 600Q556 480 580 520Q600 560 616 470Q636 540 660 580Q676 480 700 520Q716 470 740 560Q760 500 782 440Z" fill="#141210"/>`;
      b += `<path d="M420 420Q500 380 600 400T780 420Q790 440 770 446H430Q410 440 420 420Z" fill="#1a1612"/>`;
      for (let i = 0; i < 8; i++) b += `<circle cx="${r0(450 + R() * 300)}" cy="${r0(398 + R() * 20)}" r="${r0(6 + R() * 10)}" fill="#2a2420" stroke="#3a3430" stroke-width="2"/>`;
      b += `<path d="M380 470q-40 0-40 24t40 24M820 470q40 0 40 24t-40 24" stroke="#3a3a40" stroke-width="16" fill="none"/>`;
      // wooden spoon stuck upright in the sludge
      b += `<path d="M640 410L700 160" stroke="#b07a40" stroke-width="16" stroke-linecap="round"/><ellipse cx="704" cy="140" rx="22" ry="34" fill="#b07a40" transform="rotate(14 704 140)"/><path d="M690 120q12 10 4 40" stroke="#2a2420" stroke-width="6" fill="none"/>`;
      // smoke clouds billowing up
      for (const [x, y, r, g] of [[560, 330, 120, 'smk'], [680, 260, 140, 'smk'], [500, 200, 150, 'smk2'], [760, 150, 170, 'smk2'], [600, 90, 190, 'smk2'], [380, 120, 140, 'smk2'], [880, 300, 120, 'smk2'], [300, 260, 110, 'smk2'], [960, 120, 160, 'smk2']]) b += `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>`;
      // charred lotus root lump on the counter + a phone-flash glare
      b += rootSlice(980, 720, 60, -20, '#3a2a20', '#1a120e') + rootSlice(1060, 760, 44, 10, '#4a3426', '#1a120e');
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.1);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_radishes — huge radishes on a farm table (Yiling Radish Co.)
     ===================================================================== */
  def('p_radishes', {
    title: 'Radish harvest', w: 1200, h: 900, tags: ['radish', 'wwx', 'farm', 'yiling', 'day'],
    svg: (w, h) => {
      const R = rng(1031);
      const defs =
        lin('sky', '0 0 0 1', '#6ab4e8 0|#c8e4f4 1') +
        lin('field', '0 0 0 1', '#8ac45a 0|#5a9a3a 1') +
        lin('tbl', '0 0 0 1', '#b07a48 0|#8a5a32 1') +
        lin('rad', '0 0 0 1', '#ffffff 0|#f4f0e6 .6|#e2dccc 1') +
        lin('radR', '0 0 1 1', '#f05a6a 0|#c02a3a 1') +
        lin('basket', '0 0 0 1', '#c8945a 0|#9a6a38 1') +
        rad('sun', '.5 .5 .5', '#fffbe0 0 .9|#fff4c0 1 0') +
        vig('vg', 0.35) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      b += `<circle cx="1050" cy="100" r="260" fill="url(#sun)"/>`;
      b += `<g fill="#fff" opacity=".9"><ellipse cx="240" cy="120" rx="110" ry="30"/><ellipse cx="300" cy="100" rx="70" ry="36"/></g>`;
      b += `<path d="M0 360Q300 250 600 300T1200 320V420H0Z" fill="#6a9a5a"/>`;
      b += `<path d="M0 400Q600 360 1200 400V560H0Z" fill="url(#field)"/>`;
      let rows = '';
      for (let i = 0; i < 14; i++) rows += `M${-200 + i * 120} 560L${400 + i * 30} 400`;
      b += `<path d="${rows}" stroke="#4a8a2e" stroke-width="10" opacity=".6"/>`;
      b += `<g transform="translate(980 420)"><path d="M-60 0V-70L0-110L60-70V0Z" fill="#c8a070"/><path d="M-70-66L0-120L70-66" stroke="#7a3a2a" stroke-width="14" fill="none"/><rect x="-14" y="-40" width="28" height="40" fill="#6a4a2a"/></g>`;
      // table
      b += `<path d="M0 560H1200V900H0Z" fill="url(#tbl)"/>`;
      let planks = '';
      for (let y = 600; y < 900; y += 70) planks += `M0 ${y}H1200`;
      b += `<path d="${planks}" stroke="#6a4224" stroke-width="5"/>`;
      let knots = '';
      for (let i = 0; i < 10; i++) knots += `<ellipse cx="${r0(R() * w)}" cy="${r0(580 + R() * 300)}" rx="${r0(10 + R() * 16)}" ry="5"/>`;
      b += `<g fill="#6a4224" opacity=".6">${knots}</g>`;
      // giant daikon radishes with leafy tops
      const daikon = (x, y, a, s) => {
        let g = `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">`;
        g += `<path d="M-300-40C-200-60 120-56 200-30C230-20 230 20 200 30C120 56-200 60-300 40C-330 26-330-26-300-40Z" fill="url(#rad)"/>`;
        g += `<path d="M200-30Q300-10 360 0Q300 10 200 30" fill="#f0ece0"/><path d="M360 0L400 4" stroke="#d8d0c0" stroke-width="3"/>`;
        g += `<path d="M-200-40q10 20 0 40M-80-46q8 20 0 46M40-44q6 20 0 40" stroke="#d8d0c0" stroke-width="3" fill="none"/>`;
        g += `<path d="M-300-30C-330-30-340-20-344 0C-340 20-330 30-300 30Z" fill="#c8e0a0"/>`;
        for (const [la, ll] of [[-40, 1], [-15, 1.2], [10, 1.1], [35, 0.9], [-60, 0.8]]) g += `<path d="M-330 0C-400-20-460 0-500 30C-450 50-390 30-330 0Z" fill="#4f9a3a" transform="rotate(${la} -330 0) scale(${ll} 1)"/>`;
        return g + '</g>';
      };
      b += `<ellipse cx="640" cy="780" rx="420" ry="40" fill="#000" opacity=".2"/>`;
      b += daikon(640, 700, -6, 1.1) + daikon(700, 800, 4, 1) + daikon(560, 610, -12, 0.8);
      // basket of red radishes
      b += `<g transform="translate(180 690)"><path d="M-130-40H130L110 90H-110Z" fill="url(#basket)"/>`;
      let weave = '';
      for (let y = -20; y < 90; y += 22) weave += `M-126 ${y}H126`;
      b += `<path d="${weave}" stroke="#8a5a2a" stroke-width="5"/>`;
      for (const [x, y] of [[-80, -50], [-30, -64], [24, -56], [76, -48], [-54, -20], [50, -24]]) b += `<path d="M${x} ${y - 20}l-10-40M${x} ${y - 20}l12-38" stroke="#4f9a3a" stroke-width="6"/><circle cx="${x}" cy="${y}" r="26" fill="url(#radR)"/><ellipse cx="${x - 8}" cy="${y - 10}" rx="7" ry="4" fill="#fff" opacity=".5"/>`;
      b += `<path d="M-120-60Q0-200 120-60" stroke="#9a6a38" stroke-width="12" fill="none"/></g>`;
      // straw hat
      b += `<g transform="translate(1040 640)"><ellipse rx="130" ry="40" fill="#e8c878"/><ellipse cy="-20" rx="64" ry="40" fill="#f0d488"/><path d="M-64-14Q0 0 64-14" stroke="#c8202a" stroke-width="10" fill="none"/></g>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.05);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_radish_cake — radish cake on a plate
     ===================================================================== */
  def('p_radish_cake', {
    title: 'Radish cake', w: 1200, h: 900, tags: ['food', 'radish', 'wwx', 'radish-cake'],
    svg: (w, h) => {
      const R = rng(42);
      const defs =
        lin('mat', '0 0 1 1', '#c8a46a 0|#a8844a 1') +
        rad('plate', '.45 .4 .7', '#ffffff 0|#f2f0ea .7|#d8d4cc 1') +
        lin('cakeTop', '0 0 1 1', '#f4d8a0 0|#d8a050 .5|#b87a2a 1') +
        lin('cakeSide', '0 0 0 1', '#f6ead0 0|#e2cfa8 1') +
        rad('sauce', '.4 .4 .7', '#8a2a14 0|#5a1a0a 1') +
        lin('steam', '0 1 0 0', '#fff 0 .45|#fff 1 0') +
        vig('vg', 0.5) + grainDef('gr', 0.85);
      let b = `<rect width="${w}" height="${h}" fill="url(#mat)"/>`;
      let mat = '';
      for (let x = -40; x < w + 40; x += 26) mat += `M${x} 0V900`;
      b += `<path d="${mat}" stroke="#8a6a3a" stroke-width="3" opacity=".5"/><path d="M0 120H1200M0 780H1200" stroke="#6a4a2a" stroke-width="5" opacity=".4"/>`;
      b += `<ellipse cx="560" cy="470" rx="440" ry="300" fill="#000" opacity=".25" transform="translate(14 22)"/><ellipse cx="560" cy="470" rx="440" ry="300" fill="url(#plate)"/><ellipse cx="560" cy="470" rx="380" ry="250" fill="none" stroke="#e8e4dc" stroke-width="4"/>`;
      // pan-fried radish cakes (3/4 view blocks with crispy tops)
      const cake = (x, y, a) => {
        let g = `<g transform="translate(${x} ${y}) rotate(${a})">`;
        g += `<path d="M-110-50L110-50L110 30L-110 30Z" fill="url(#cakeSide)" transform="translate(0 26)"/>`;
        g += `<path d="M-116-56Q0-64 116-56Q124 0 116 44Q0 52-116 44Q-124 0-116-56Z" fill="url(#cakeTop)"/>`;
        for (let i = 0; i < 9; i++) g += `<ellipse cx="${r0(-90 + R() * 180)}" cy="${r0(-40 + R() * 70)}" rx="${r0(6 + R() * 14)}" ry="${r0(3 + R() * 6)}" fill="#8a5a1a" opacity=".45"/>`;
        for (let i = 0; i < 6; i++) g += `<rect x="${r0(-80 + R() * 160)}" y="${r0(-30 + R() * 50)}" width="${r0(10 + R() * 10)}" height="5" rx="2" fill="#c8402a" opacity=".7"/>`;
        return g + `<path d="M-116-56Q0-64 116-56" stroke="#fff4d0" stroke-width="3" opacity=".5" fill="none"/></g>`;
      };
      b += cake(420, 400, -8) + cake(640, 360, 6) + cake(520, 560, 2) + cake(740, 530, -12);
      for (let i = 0; i < 26; i++) b += `<circle cx="${r0(350 + R() * 480)}" cy="${r0(320 + R() * 300)}" r="${f1(5 + R() * 3)}" fill="none" stroke="#4aa83a" stroke-width="4"/>`;
      // dipping sauce + chopsticks
      b += `<ellipse cx="1030" cy="300" rx="110" ry="70" fill="#000" opacity=".2" transform="translate(8 12)"/><ellipse cx="1030" cy="300" rx="110" ry="70" fill="#f4f2ec"/><ellipse cx="1030" cy="300" rx="84" ry="50" fill="url(#sauce)"/>`;
      for (let i = 0; i < 12; i++) b += `<circle cx="${r0(980 + R() * 100)}" cy="${r0(280 + R() * 40)}" r="${f1(2 + R() * 4)}" fill="#e8402a" opacity=".8"/>`;
      b += `<path d="M900 820L1180 520" stroke="#3a2214" stroke-width="13" stroke-linecap="round"/><path d="M940 840L1196 560" stroke="#3a2214" stroke-width="13" stroke-linecap="round"/>`;
      for (const [x, d] of [[520, 'M0 0C-30-50 20-90 0-150S-20-220 10-260'], [680, 'M0 0C20-40-20-90 6-140S30-200 0-240']]) b += `<path d="${d}" transform="translate(${x} 300)" stroke="url(#steam)" stroke-width="24" fill="none" stroke-linecap="round" opacity=".5"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.06);
      return wrap(w, h, defs, b);
    },
  });

  /* =====================================================================
     p_hotpot_alumni — bubbling hotpot, hands with chopsticks, the red sign
     ===================================================================== */
  def('p_hotpot_alumni', {
    title: 'Laoma Hotpot', w: 1200, h: 900, tags: ['hotpot', 'laoma-hotpot', 'alumni', 'food', 'gusu', 'nhs'],
    svg: (w, h) => {
      const R = rng(2024);
      const BRUSH = "'STKaiti', 'Kaiti SC', 'KaiTi', 'BiauKai', 'Songti SC', 'STSong', 'Noto Serif SC', 'Noto Serif CJK SC', 'Source Han Serif SC', serif";
      const defs =
        lin('wall', '0 0 0 1', '#3a1a12 0|#5a2a1a 1') +
        lin('sign', '0 0 0 1', '#d02a24 0|#a8141a 1') +
        lin('gold', '0 0 0 1', '#ffe8a0 0|#f2c040 .5|#c8901a 1') +
        lin('tbl', '0 0 0 1', '#5a3a28 0|#3a2418 1') +
        lin('potRim', '0 0 1 0', '#8a8a92 0|#e8e8ee .45|#7a7a84 1') +
        rad('red', '.45 .4 .7', '#f0502a 0|#c8281a .6|#8a140e 1') +
        rad('white', '.45 .4 .7', '#fff8ec 0|#f0e2c8 .7|#d8c4a0 1') +
        glowDef('lamp', '#ffcf85', 0.8) +
        lin('steam', '0 1 0 0', '#fff 0 .5|#fff 1 0') +
        lin('beer', '0 0 0 1', '#ffd860 0|#e8a820 1') +
        vig('vg', 0.5) + grainDef('gr', 0.9);
      let b = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
      // the red sign with gold lettering
      b += `<circle cx="600" cy="130" r="420" fill="url(#lamp)" opacity=".45"/>`;
      b += `<rect x="190" y="30" width="820" height="210" rx="14" fill="#2a0a08" transform="translate(8 10)" opacity=".6"/><rect x="190" y="30" width="820" height="210" rx="14" fill="url(#sign)"/><rect x="204" y="44" width="792" height="182" rx="8" fill="none" stroke="url(#gold)" stroke-width="5"/>`;
      b += `<text x="600" y="160" font-family="${BRUSH}" font-size="118" font-weight="700" fill="#5a0a08" text-anchor="middle" letter-spacing="14" opacity=".55" transform="translate(4 5)">老妈火锅</text>`;
      b += `<text x="600" y="160" font-family="${BRUSH}" font-size="118" font-weight="700" fill="url(#gold)" text-anchor="middle" letter-spacing="14">老妈火锅</text>`;
      b += `<text x="600" y="210" font-family="${FONT}" font-size="34" font-weight="700" fill="#ffe8a0" text-anchor="middle" letter-spacing="10">LAOMA HOTPOT</text>`;
      for (const x of [150, 1050]) b += `<g transform="translate(${x} 120)"><path d="M0-90V-60" stroke="#2a0a08" stroke-width="3"/><ellipse rx="44" ry="40" cy="-20" fill="#d0281e"/><rect x="-14" y="-64" width="28" height="8" fill="url(#gold)"/><rect x="-14" y="16" width="28" height="8" fill="url(#gold)"/><path d="M-4 24v30M4 24v30" stroke="#e8b840" stroke-width="3"/></g>`;
      // table
      b += `<path d="M0 330H1200V900H0Z" fill="url(#tbl)"/><path d="M0 330H1200" stroke="#7a5038" stroke-width="5"/>`;
      // plates around the pot
      const plate = (x, y, rx, ry, inner) => `<ellipse cx="${x}" cy="${y + 8}" rx="${rx}" ry="${ry}" fill="#000" opacity=".3"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f4f2ec"/>${inner}`;
      let beef = '';
      for (let i = 0; i < 6; i++) beef += `<path d="M${-70 + i * 22} -26q20-8 30 6q4 30-10 44q-24 4-26-20z" fill="#c8384a" transform="translate(0 0)"/><path d="M${-62 + i * 22} -14q10 4 16 0" stroke="#fff" stroke-width="3" opacity=".7" fill="none"/>`;
      b += plate(170, 470, 140, 70, `<g transform="translate(170 470)">${beef}</g>`);
      let veg = '';
      for (let i = 0; i < 7; i++) veg += `<ellipse cx="${-60 + i * 20}" cy="${(i % 2) * 10 - 6}" rx="26" ry="12" fill="${i % 2 ? '#4aa83a' : '#6ac04a'}" transform="rotate(${-30 + i * 10} ${-60 + i * 20} 0)"/>`;
      b += plate(1030, 470, 140, 70, `<g transform="translate(1030 470)">${veg}</g>`);
      let tofu = '';
      for (let i = 0; i < 6; i++) tofu += `<rect x="${-60 + (i % 3) * 42}" y="${-26 + Math.floor(i / 3) * 30}" width="36" height="26" rx="4" fill="#f8f2e0" stroke="#e0d4b8" stroke-width="2"/>`;
      b += plate(160, 760, 130, 66, `<g transform="translate(160 760)">${tofu}</g>`);
      let enoki = '';
      for (let i = 0; i < 18; i++) enoki += `<path d="M${-50 + i * 6} 30Q${-40 + i * 5} 0 ${-30 + i * 4}-30" stroke="#f4eedc" stroke-width="4" fill="none"/><circle cx="${-30 + i * 4}" cy="-32" r="4" fill="#fff8e8"/>`;
      b += plate(1040, 770, 130, 66, `<g transform="translate(1040 770)">${enoki}</g>`);
      // beer glasses
      for (const x of [330, 870]) b += `<g transform="translate(${x} 380)"><rect x="-34" y="-90" width="68" height="110" rx="8" fill="url(#beer)" opacity=".9"/><rect x="-34" y="-100" width="68" height="20" rx="8" fill="#fffaf0"/><rect x="-26" y="-70" width="10" height="80" fill="#fff" opacity=".35"/></g>`;
      // the yin-yang pot, bubbling
      b += `<ellipse cx="600" cy="640" rx="330" ry="190" fill="#000" opacity=".45" transform="translate(0 20)"/>`;
      b += `<ellipse cx="600" cy="630" rx="330" ry="190" fill="url(#potRim)"/>`;
      b += `<clipPath id="pc"><ellipse cx="600" cy="630" rx="300" ry="170"/></clipPath><g clip-path="url(#pc)"><rect x="280" y="440" width="660" height="400" fill="url(#red)"/><path d="M600 460C700 520 500 560 600 630S500 760 600 800L960 800V460Z" fill="url(#white)"/></g>`;
      b += `<path d="M600 460C700 520 500 560 600 630S500 760 600 800" stroke="#c8c8d0" stroke-width="10" fill="none"/>`;
      let bub = '';
      for (let i = 0; i < 40; i++) { const x = 320 + R() * 560, y = 480 + R() * 300; if (((x - 600) / 300) ** 2 + ((y - 630) / 170) ** 2 > 0.85) continue; const r = 5 + R() * 14; bub += `<circle cx="${r0(x)}" cy="${r0(y)}" r="${r0(r)}" fill="none" stroke="#fff" stroke-width="2.5" opacity="${f1(0.4 + R() * 0.4)}"/>`; }
      b += bub;
      for (let i = 0; i < 18; i++) { const x = 360 + R() * 200, y = 520 + R() * 220; b += `<path d="M${r0(x)} ${r0(y)}q14-10 30 2q-10 12-30-2z" fill="#a8100a" transform="rotate(${r0(R() * 180)} ${r0(x)} ${r0(y)})"/>`; }
      for (let i = 0; i < 20; i++) b += `<circle cx="${r0(360 + R() * 220)}" cy="${r0(520 + R() * 220)}" r="4" fill="#4a1a0a"/>`;
      for (const [x, y] of [[680, 560], [740, 640], [700, 720], [790, 590]]) b += `<ellipse cx="${x}" cy="${y}" rx="22" ry="10" fill="#c89a6a"/><ellipse cx="${x + 30}" cy="${y + 20}" rx="10" ry="10" fill="#d8302a" opacity=".8"/>`;
      // hands with chopsticks reaching in
      const hand = (x, y, a, sleeve) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0L-240 30" stroke="#2a1a10" stroke-width="7" stroke-linecap="round"/><path d="M0 14L-236 46" stroke="#2a1a10" stroke-width="7" stroke-linecap="round"/><path d="M-20-20Q30-36 70-18L80 40Q30 58-20 40Q-36 20-20-20Z" fill="#f0c8a8"/><path d="M-20-6q-20 4-26 14q10 6 26 2" fill="#f0c8a8"/><path d="M70-30L200-40V70L80 50Z" fill="${sleeve}"/></g>`;
      b += hand(1020, 300, 210, '#2a3a6a') + hand(140, 330, -30, '#5a2d82') + hand(980, 860, 140, '#2f9e44') + hand(220, 880, 30, '#e8e4dc');
      for (const [x, d] of [[480, 'M0 0C-30-60 30-110 0-180'], [620, 'M0 0C30-50-30-120 10-190'], [760, 'M0 0C-20-60 30-100 0-170']]) b += `<path d="${d}" transform="translate(${x} 520)" stroke="url(#steam)" stroke-width="34" fill="none" stroke-linecap="round" opacity=".5"/>`;
      b += `<rect width="${w}" height="${h}" fill="url(#vg)"/>` + grain('gr', w, h, 0.08);
      return wrap(w, h, defs, b);
    },
  });
})();
