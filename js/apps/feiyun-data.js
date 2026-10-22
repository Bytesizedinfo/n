/* Feiyun Market — catalogue, sellers, auction lots, seeded orders and seller chats, plus the market's own product
   shots (fy_*) and home banners. The ten mk_* shots live in js/art/market.js; food_* and p_* art is reused where it
   fits. Everything here is data: js/apps/feiyun.js renders it. Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const def = JC.art.def;

  // ═══ art helpers ══════════════════════════════════════════════════════════════════════════════
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const svg = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  const f = (n) => Math.round(n * 10) / 10;
  let SEED = 1;
  const seed = (n) => { SEED = n; };
  const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const SANS = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = "Georgia, 'Times New Roman', serif";
  const MONO = 'Menlo, Consolas, monospace';
  const T = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || SANS}" font-size="${size}" font-weight="${o.w || 400}" fill="${o.fill || '#fff'}" text-anchor="${o.a || 'middle'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.it ? ' font-style="italic"' : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''}>${s}</text>`;
  // studio sweep: wall into floor, key light, vignette, soft contact-shadow gradient `sh`
  function studio(wallT, wallB, floorN, hz, key) {
    key = key || [0.32, 0.18];
    return {
      defs: lg('sW', [[0, wallT], [1, wallB]]) + lg('sF', [[0, wallB], [1, floorN]]) +
        rg('sK', [[0, '#fff', 0.5], [1, '#fff', 0]], key[0], key[1], 0.62) +
        rg('sV', [[0.6, '#000', 0], [1, '#000', 0.16]], 0.5, 0.46, 0.78) +
        rg('sh', [[0, '#000', 0.48], [0.45, '#000', 0.22], [1, '#000', 0]]),
      back: `<rect width="900" height="${hz}" fill="url(#sW)"/><rect y="${hz}" width="900" height="${900 - hz}" fill="url(#sF)"/><rect width="900" height="900" fill="url(#sK)"/>`,
      front: '<rect width="900" height="900" fill="url(#sV)"/>',
    };
  }
  const shadow = (cx, cy, rx, ry, o = 1) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sh)" opacity="${o}"/>`;
  // a pseudo seal-script glyph in a box (x, y, size): short carved strokes
  function glyph(x, y, s) {
    let d = '';
    const n = 4 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) {
      const k = rnd();
      if (k < 0.4) { const yy = y + rr(0.1, 0.9) * s; d += `M${f(x + rr(0.05, 0.3) * s)} ${f(yy)}h${f(rr(0.4, 0.75) * s)}`; }
      else if (k < 0.75) { const xx = x + rr(0.15, 0.85) * s; d += `M${f(xx)} ${f(y + rr(0.02, 0.3) * s)}v${f(rr(0.4, 0.7) * s)}`; }
      else { const x0 = x + rr(0.1, 0.5) * s, y0 = y + rr(0.2, 0.6) * s; d += `M${f(x0)} ${f(y0)}q${f(s * 0.3)} ${f(-s * 0.25)} ${f(s * 0.45)} ${f(s * 0.1)}`; }
    }
    return d;
  }
  // six-petal glaze lily outline centred at (cx, cy)
  function lily(cx, cy, r) {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r;
      const l = a - 0.42, rgt = a + 0.42;
      d += `M${f(cx)} ${f(cy)}Q${f(cx + Math.cos(l) * r * 0.7)} ${f(cy + Math.sin(l) * r * 0.7)} ${f(tx)} ${f(ty)}Q${f(cx + Math.cos(rgt) * r * 0.7)} ${f(cy + Math.sin(rgt) * r * 0.7)} ${f(cx)} ${f(cy)}`;
    }
    return d;
  }

  // ═══ the tea set: glaze detail and the base mark (shown to the winning bidder) ═══════════════
  def('fy_teaset_detail', {
    title: 'Celadon cup, glaze detail', w: 900, h: 900, tags: ['market', 'teaset', 'celadon'],
    svg: (w, h) => {
      seed(77);
      let crackle = '';
      for (let i = 0; i < 46; i++) {
        const x = rr(250, 650), y = rr(380, 650);
        crackle += `M${f(x)} ${f(y)}l${f(rr(-26, 26))} ${f(rr(-18, 18))}l${f(rr(-20, 20))} ${f(rr(-14, 14))}`;
      }
      return svg(w, h,
        lg('wd', [[0, '#3b2416'], [1, '#1c0f08']]) + lg('wl', [[0, '#000', 0], [1, '#000', 0.5]]) +
        lg('cup', [[0, '#9cc4ab'], [0.45, '#d5ead8'], [0.62, '#bcd9c3'], [1, '#7ea78d']], 0, 0, 1, 0) +
        lg('cupIn', [[0, '#6f957d'], [1, '#c9e2cf']]) + rg('bg', [[0, '#5a4a3a'], [1, '#120b07']], 0.5, 0.25, 0.8) +
        rg('sh', [[0, '#000', 0.6], [1, '#000', 0]]),
        `<rect width="900" height="900" fill="url(#bg)"/>` +
        `<rect y="610" width="900" height="290" fill="url(#wd)"/>` +
        [0, 1, 2, 3, 4, 5].map((i) => `<path d="M0 ${640 + i * 46}C300 ${630 + i * 46} 600 ${652 + i * 46} 900 ${636 + i * 46}" stroke="#5a3a24" stroke-opacity=".35" stroke-width="2" fill="none"/>`).join('') +
        // second cup, out of focus
        `<g opacity=".45"><ellipse cx="740" cy="575" rx="92" ry="16" fill="url(#sh)"/><path d="M660 470h160c-4 62-34 100-80 104c-46-4-76-42-80-104z" fill="#8fb39c"/><ellipse cx="740" cy="470" rx="80" ry="15" fill="#a9cbb5"/></g>` +
        `<ellipse cx="450" cy="676" rx="250" ry="30" fill="url(#sh)"/>` +
        `<path d="M228 380h444c-8 170-92 270-222 286c-130-16-214-116-222-286z" fill="url(#cup)"/>` +
        `<ellipse cx="450" cy="380" rx="222" ry="44" fill="url(#cupIn)"/><ellipse cx="450" cy="378" rx="222" ry="44" fill="none" stroke="#e8f4ea" stroke-width="5"/>` +
        `<path d="${lily(450, 520, 62)}" fill="#7ea78d" fill-opacity=".55" stroke="#5f8a70" stroke-width="3"/>` +
        `<path d="M450 582v62M450 610c-20-6-34-18-40-34M450 622c22-4 36-16 42-30" stroke="#5f8a70" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<path d="${crackle}" stroke="#4e7560" stroke-opacity=".28" stroke-width="1.3" fill="none"/>` +
        `<path d="M262 400c10 110 70 196 150 230" stroke="#fff" stroke-opacity=".45" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        `<rect x="560" y="770" width="250" height="56" rx="4" fill="#f4efe4" transform="rotate(-4 685 798)"/>` +
        T(685, 805, 'FY-2210-0417 · cup 2', 21, { font: MONO, fill: '#3a3a3a', tr: 'rotate(-4 685 798)' }));
    },
  });

  def('fy_teaset_base', {
    title: 'Base of the teapot — incised mark', w: 900, h: 900, tags: ['market', 'teaset', 'clue', 'morax'],
    svg: (w, h) => {
      seed(1018);
      let crackle = '';
      for (let i = 0; i < 70; i++) {
        const a = rr(0, Math.PI * 2), r = rr(240, 322);
        const x = 450 + Math.cos(a) * r, y = 430 + Math.sin(a) * r;
        crackle += `M${f(x)} ${f(y)}l${f(rr(-24, 24))} ${f(rr(-24, 24))}l${f(rr(-18, 18))} ${f(rr(-18, 18))}`;
      }
      let script = '';
      [[478, 318], [478, 362], [478, 406], [478, 450], [424, 318], [424, 362], [424, 406]].forEach(([x, y]) => { script += glyph(x, y, 34); });
      let ruler = '';
      for (let i = 0; i <= 20; i++) ruler += `M${220 + i * 23} 842v${i % 2 ? -9 : -18}`;
      const nums = [0, 2, 4, 6, 8, 10].map((n) => T(220 + n * 46, 830, String(n), 15, { fill: '#222', font: MONO })).join('');
      return svg(w, h,
        rg('cl', [[0, '#26304a'], [0.6, '#121726'], [1, '#05060a']], 0.45, 0.4, 0.75) +
        rg('gl', [[0, '#d7ead8'], [0.6, '#acceb6'], [0.9, '#86ad94'], [1, '#6f9680']], 0.42, 0.38, 0.62) +
        rg('inb', [[0, '#e6f1e4'], [1, '#c3dbc8']], 0.45, 0.4, 0.6) +
        lg('ft', [[0, '#c99a68'], [0.5, '#9a6a42'], [1, '#6e4529']], 0, 0, 1, 1) +
        rg('lamp', [[0, '#fff', 0.55], [1, '#fff', 0]], 0.5, 0.5, 0.5),
        `<rect width="900" height="900" fill="url(#cl)"/>` +
        `<path d="M0 120C200 160 340 90 520 150S820 120 900 180M0 760c180-40 330 20 520-20s300-10 380 20" stroke="#3a4766" stroke-opacity=".35" stroke-width="22" fill="none"/>` +
        `<circle cx="458" cy="444" r="334" fill="#000" opacity=".45"/>` +
        `<circle cx="450" cy="430" r="330" fill="url(#gl)"/>` +
        `<circle cx="450" cy="430" r="321" fill="none" stroke="#5e8a72" stroke-opacity=".45" stroke-width="16"/>` +
        `<path d="${crackle}" stroke="#4a6f5a" stroke-opacity=".4" stroke-width="1.4" fill="none"/>` +
        `<circle cx="450" cy="430" r="218" fill="none" stroke="url(#ft)" stroke-width="40"/>` +
        `<circle cx="450" cy="430" r="238" fill="none" stroke="#5b3a22" stroke-opacity=".5" stroke-width="2"/>` +
        `<circle cx="450" cy="430" r="198" fill="url(#inb)"/>` +
        `<path d="M612 300l26 -18" stroke="#3d2716" stroke-width="2.4"/>` +
        // the incised mark: two columns of old script, the lily, a final initial
        `<g transform="translate(1.6 1.8)"><path d="${script}" stroke="#f4faf3" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/></g>` +
        `<path d="${script}" stroke="#6f927c" stroke-width="5" stroke-linecap="round" fill="none"/>` +
        `<g transform="translate(1.4 1.6)"><path d="${lily(376, 372, 40)}" fill="none" stroke="#f4faf3" stroke-width="4" opacity=".8"/></g>` +
        `<path d="${lily(376, 372, 40)}" fill="none" stroke="#6f927c" stroke-width="4"/>` +
        `<path d="M365 470c-14-16-4-36 16-36c14 0 22 8 22 8M392 456h16v18c-10 8-30 8-38-4" stroke="#f4faf3" stroke-opacity=".8" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(1.4 1.6)"/>` +
        `<path d="M365 470c-14-16-4-36 16-36c14 0 22 8 22 8M392 456h16v18c-10 8-30 8-38-4" stroke="#6f927c" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<circle cx="450" cy="430" r="330" fill="url(#lamp)" opacity=".5" transform="translate(-90 -100) scale(1.2)" style="mix-blend-mode:screen"/>` +
        `<ellipse cx="330" cy="250" rx="70" ry="26" fill="#fff" opacity=".35" transform="rotate(-32 330 250)"/>` +
        `<rect x="200" y="806" width="530" height="48" rx="3" fill="#efe7d2"/><path d="${ruler}" stroke="#222" stroke-width="2"/>${nums}` +
        T(722, 830, 'cm', 14, { fill: '#222', font: MONO, a: 'end' }) +
        `<rect x="610" y="56" width="236" height="58" rx="4" fill="#f4efe4" transform="rotate(5 728 85)"/>` +
        T(728, 92, 'FY-2210-0417 · base', 20, { font: MONO, fill: '#333', tr: 'rotate(5 728 85)' }));
    },
  });

  // ═══ other product shots ══════════════════════════════════════════════════════════════════════
  def('fy_jade_seal', {
    title: 'Jade seal with qilin knob', w: 900, h: 900, tags: ['market', 'product', 'antique'],
    svg: (w, h) => {
      const s = studio('#efe9df', '#e2d8c8', '#cbbca6', 600);
      return svg(w, h, s.defs + lg('jd', [[0, '#7fbf98'], [0.5, '#3f8a62'], [1, '#1f5a3e']], 0, 0, 1, 1) + lg('jdT', [[0, '#a7dcb9'], [1, '#4a9a6e']]) + lg('box', [[0, '#7a1c16'], [1, '#4b0e0b']]),
        s.back +
        // seal paste tin + impression on paper
        `<rect x="520" y="610" width="300" height="200" rx="4" fill="#f7f1e3" transform="rotate(-6 670 710)"/>` +
        `<g transform="rotate(-6 670 710)"><rect x="606" y="650" width="120" height="120" fill="#c8281e" opacity=".92"/><path d="M626 672h80M626 700h34v48M686 700v48h20M640 724h20" stroke="#f7f1e3" stroke-width="9" fill="none"/></g>` +
        shadow(330, 742, 210, 40) +
        `<rect x="170" y="560" width="320" height="170" rx="16" fill="url(#box)"/><rect x="170" y="560" width="320" height="34" rx="12" fill="#97261d"/>` +
        `<rect x="236" y="470" width="190" height="200" rx="10" fill="url(#jd)"/>` +
        `<path d="M250 470c6-60 40-96 82-106c20-30 60-30 72 0c22 10 26 40 10 60c-6 22-4 34 0 46z" fill="url(#jdT)"/>` +
        `<circle cx="372" cy="388" r="7" fill="#1f5a3e"/><path d="M320 410c18 8 40 8 60-4M300 450c30 10 70 12 110 0" stroke="#2c6e4c" stroke-width="5" fill="none" stroke-linecap="round"/>` +
        `<path d="M408 372c18-18 34-16 40 2M268 456c-20-8-26-24-14-36" stroke="#2c6e4c" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<path d="M248 480v170" stroke="#fff" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/>` +
        s.front);
    },
  });

  def('fy_coin', {
    title: 'Rite of Parting commemorative Mora, silver', w: 900, h: 900, tags: ['market', 'product', 'coin', 'rite'],
    svg: (w, h) => {
      let rim = '';
      for (let i = 0; i < 90; i++) { const a = (i / 90) * Math.PI * 2; rim += `M${f(450 + Math.cos(a) * 236)} ${f(440 + Math.sin(a) * 236)}L${f(450 + Math.cos(a) * 248)} ${f(440 + Math.sin(a) * 248)}`; }
      return svg(w, h,
        rg('vel', [[0, '#3a1420'], [1, '#12050a']], 0.5, 0.45, 0.7) + rg('ag', [[0, '#ffffff'], [0.45, '#d6d9de'], [1, '#8e939c']], 0.38, 0.32, 0.8) + rg('ag2', [[0, '#f4f5f7'], [1, '#a9aeb6']], 0.4, 0.35, 0.7) +
        `<path id="arc" d="M270 440a180 180 0 1 1 360 0"/>`,
        `<rect width="900" height="900" fill="url(#vel)"/>` +
        `<circle cx="450" cy="440" r="300" fill="#000" opacity=".35"/><circle cx="450" cy="440" r="286" fill="#fff" opacity=".07"/><circle cx="450" cy="440" r="286" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>` +
        `<circle cx="450" cy="440" r="250" fill="url(#ag)"/><path d="${rim}" stroke="#7d828a" stroke-width="3"/>` +
        `<circle cx="450" cy="440" r="226" fill="url(#ag2)"/><circle cx="450" cy="440" r="208" fill="none" stroke="#8e939c" stroke-width="3"/>` +
        // relief: a lantern rising over terrace roofs
        `<path d="M410 300h80l10 26v74l-10 26h-80l-10-26v-74z" fill="#c3c7cd" stroke="#7d828a" stroke-width="4"/><path d="M450 280v20M430 426v18M470 426v18" stroke="#7d828a" stroke-width="4"/>` +
        `<path d="M310 560l70-40 70 22 70-22 70 40z" fill="#b6bac1" stroke="#7d828a" stroke-width="4"/><path d="M300 560h300" stroke="#7d828a" stroke-width="5"/>` +
        `<text font-family="${SERIF}" font-size="26" letter-spacing="6" fill="#6d727a"><textPath href="#arc" startOffset="50%" text-anchor="middle">RITE OF PARTING · 2026</textPath></text>` +
        T(450, 616, '1 OZ · 999 SILVER', 18, { fill: '#6d727a', ls: 3, font: SERIF }) +
        `<ellipse cx="370" cy="330" rx="90" ry="40" fill="#fff" opacity=".45" transform="rotate(-35 370 330)"/>`);
    },
  });

  def('fy_gg_figure', {
    title: 'Glacier Guardians figure: Captain Rime', w: 900, h: 900, tags: ['market', 'product', 'toy', 'teucer'],
    svg: (w, h) => {
      const s = studio('#eef3f8', '#dfe8f1', '#c3d1df', 640);
      return svg(w, h, s.defs + lg('card', [[0, '#2f6fe0'], [1, '#123a8c']]) + lg('ice', [[0, '#e6f6ff'], [1, '#8fd0ff']]) + lg('bl', [[0, '#fff', 0.55], [1, '#fff', 0.15]], 0, 0, 1, 1),
        s.back + shadow(450, 812, 250, 30) +
        `<rect x="230" y="110" width="440" height="690" rx="22" fill="url(#card)"/><circle cx="450" cy="150" r="18" fill="#dfe8f1"/>` +
        T(450, 236, 'GLACIER', 62, { w: 900, fill: '#fff', ls: 2 }) + T(450, 292, 'GUARDIANS', 50, { w: 900, fill: '#bfe6ff', ls: 4 }) +
        `<rect x="290" y="318" width="320" height="400" rx="40" fill="url(#bl)" stroke="#fff" stroke-opacity=".7" stroke-width="4"/>` +
        // the figure
        `<path d="M410 420h80l12 70-12 90h-80l-12-90z" fill="url(#ice)" stroke="#2b5fb8" stroke-width="5"/>` +
        `<circle cx="450" cy="388" r="34" fill="#ffd8b8" stroke="#2b5fb8" stroke-width="5"/><path d="M412 380c4-34 72-34 76 0l-10-6-18 10-10-14-14 14-16-10z" fill="#9fdcff" stroke="#2b5fb8" stroke-width="5"/>` +
        `<path d="M410 440l-46 70M490 440l46 70" stroke="#9fdcff" stroke-width="22" stroke-linecap="round"/><path d="M546 520l26-120" stroke="#e8f6ff" stroke-width="10" stroke-linecap="round"/><path d="M558 404l14-34 14 34z" fill="#bfe6ff"/>` +
        `<path d="M420 580l-8 90M480 580l8 90" stroke="#2b5fb8" stroke-width="22" stroke-linecap="round"/>` +
        `<rect x="296" y="736" width="308" height="40" rx="20" fill="#ffcf3a"/>` + T(450, 763, 'CAPTAIN RIME · WAVE 3', 21, { w: 800, fill: '#123a8c' }) +
        `<circle cx="628" cy="676" r="46" fill="#ff4d3a"/>` + T(628, 672, 'NEW', 21, { w: 900 }) + T(628, 694, 'WAVE 3', 13, { w: 700 }) +
        s.front);
    },
  });

  def('fy_plush_fish', {
    title: 'Reel Rush plush: Big Tuna', w: 900, h: 900, tags: ['market', 'product', 'toy', 'fish'],
    svg: (w, h) => {
      const s = studio('#f3f6fa', '#e4ebf3', '#cfdbe7', 620);
      return svg(w, h, s.defs + lg('bd', [[0, '#2d5fae'], [0.55, '#4f86d6'], [0.56, '#dfe9f6'], [1, '#c9d7ea']]) + lg('fin', [[0, '#ffcf3a'], [1, '#f2a516']]),
        s.back + shadow(450, 690, 300, 40) +
        `<path d="M170 470c40-140 300-190 470-110c40 20 70 50 90 90c-20 40-50 70-90 90c-170 80-430 70-470-70z" fill="url(#bd)"/>` +
        `<path d="M720 450l120-110c10 70 10 150 0 220z" fill="#2d5fae"/>` +
        `<path d="M400 330c20-60 80-90 140-80c-40 20-60 50-60 90z" fill="#2d5fae"/><path d="M420 600c30 40 80 50 120 40c-30-14-50-34-56-60z" fill="#c9d7ea"/>` +
        [0, 1, 2, 3, 4].map((i) => `<path d="M${560 + i * 26} 352l12 10-12 10z" fill="url(#fin)"/>`).join('') +
        `<circle cx="270" cy="440" r="44" fill="#fff"/><circle cx="278" cy="446" r="26" fill="#14213a"/><circle cx="286" cy="436" r="9" fill="#fff"/>` +
        `<path d="M196 520c20 14 44 16 64 6" stroke="#14213a" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="330" cy="500" r="16" fill="#ff9aa8" opacity=".6"/>` +
        `<path d="M300 380c80-60 200-70 300-40" stroke="#fff" stroke-opacity=".35" stroke-width="14" fill="none" stroke-linecap="round"/>` +
        `<rect x="640" y="520" width="110" height="64" rx="8" fill="#fff" transform="rotate(12 695 552)"/>` + T(695, 560, 'REEL RUSH', 17, { w: 900, fill: '#2d5fae', tr: 'rotate(12 695 552)' }) +
        s.front);
    },
  });

  def('fy_line', {
    title: 'HYDRO·CARBON braided line 300 m', w: 900, h: 900, tags: ['market', 'product', 'fishing'],
    svg: (w, h) => {
      const s = studio('#eef1f2', '#e0e5e7', '#c6cfd2', 610);
      let wrap = '';
      for (let i = 0; i < 26; i++) wrap += `M300 ${f(372 + i * 9.5)}c100 ${f(6 + (i % 3))} 200 ${f(6 + (i % 3))} 300 0`;
      return svg(w, h, s.defs + lg('sp', [[0, '#1d2a36'], [1, '#0b1118']]) + lg('ln', [[0, '#3f7a4c'], [0.5, '#6aa874'], [1, '#2f5f3a']], 0, 0, 1, 0),
        s.back + shadow(450, 700, 260, 36) +
        `<rect x="300" y="360" width="300" height="260" fill="url(#ln)"/><path d="${wrap}" stroke="#244a2c" stroke-opacity=".5" stroke-width="2" fill="none"/>` +
        `<ellipse cx="450" cy="352" rx="200" ry="56" fill="url(#sp)"/><ellipse cx="450" cy="346" rx="200" ry="56" fill="#26394a"/><ellipse cx="450" cy="346" rx="64" ry="18" fill="#0b1118"/>` +
        `<path d="M250 346v300c0 30 90 56 200 56s200-26 200-56v-300" fill="none" stroke="#1d2a36" stroke-width="0"/>` +
        `<path d="M250 620c0 32 90 58 200 58s200-26 200-58v24c0 32-90 58-200 58s-200-26-200-58z" fill="url(#sp)"/>` +
        `<rect x="350" y="456" width="200" height="84" rx="10" fill="#fff"/>` + T(450, 492, 'HYDRO·CARBON', 24, { w: 900, fill: '#0b5cad' }) + T(450, 524, '300 m · 20 LB · 8×', 19, { w: 600, fill: '#333' }) +
        `<path d="M600 420c90 30 140 110 150 210" stroke="#4d8f5a" stroke-width="3" fill="none"/>` +
        s.front);
    },
  });

  def('fy_lures', {
    title: 'Snezhnayan spoon lures, set of 6', w: 900, h: 900, tags: ['market', 'product', 'fishing', 'snezhnaya'],
    svg: (w, h) => {
      const s = studio('#f1ede6', '#e5dfd4', '#cdc4b5', 640);
      const cols = [['#e9edf2', '#9aa3ad'], ['#f3c58a', '#b0702e'], ['#e9edf2', '#9aa3ad'], ['#f3c58a', '#b0702e'], ['#e9edf2', '#c8392b'], ['#f3c58a', '#3b6fb6']];
      let g = '';
      cols.forEach((c, i) => {
        const x = 245 + (i % 3) * 205, y = 300 + Math.floor(i / 3) * 250;
        g += `<path d="M${x} ${y - 70}c46 20 52 110 0 150c-52-40-46-130 0-150z" fill="${c[0]}" stroke="${c[1]}" stroke-width="5"/>` +
          `<path d="M${x - 12} ${y - 30}c8-16 24-16 30 0" stroke="#fff" stroke-width="6" fill="none" opacity=".7"/>` +
          (i === 4 ? `<path d="M${x - 18} ${y + 10}h36" stroke="#c8392b" stroke-width="10"/>` : '') +
          `<circle cx="${x}" cy="${y - 78}" r="7" fill="none" stroke="#777" stroke-width="3"/>` +
          `<path d="M${x} ${y + 80}v20c0 18 22 18 22 2" stroke="#555" stroke-width="4" fill="none"/>`;
      });
      return svg(w, h, s.defs + lg('cd', [[0, '#1f3550'], [1, '#13233a']]),
        s.back + shadow(450, 812, 330, 30) + `<rect x="130" y="160" width="640" height="640" rx="20" fill="url(#cd)"/>` +
        T(450, 214, 'MOREPESOK PATTERN · 6 SPOONS', 24, { w: 800, fill: '#cfe3ff', ls: 2 }) + g + s.front);
    },
  });

  def('fy_notebook', {
    title: 'Wanwen linen notebook, A5', w: 900, h: 900, tags: ['market', 'product', 'stationery'],
    svg: (w, h) => {
      const s = studio('#f2efe9', '#e7e2d8', '#d2cabb', 650);
      return svg(w, h, s.defs + lg('cv', [[0, '#a9b79c'], [1, '#7f8f73']], 0, 0, 1, 1),
        s.back + shadow(440, 760, 280, 40) +
        `<rect x="214" y="170" width="460" height="600" rx="16" fill="#f8f4ea" transform="rotate(-4 444 470)"/>` +
        `<rect x="200" y="160" width="460" height="600" rx="16" fill="url(#cv)" transform="rotate(-4 430 460)"/>` +
        `<rect x="588" y="150" width="20" height="620" fill="#4a5a43" transform="rotate(-4 430 460)"/>` +
        T(420, 330, 'WANWEN', 40, { font: SERIF, w: 700, fill: '#5d6b52', ls: 8, tr: 'rotate(-4 430 460)' }) + T(420, 370, 'BOOKHOUSE · LIYUE', 16, { fill: '#5d6b52', ls: 4, tr: 'rotate(-4 430 460)' }) +
        `<rect x="610" y="420" width="260" height="22" rx="11" fill="#1f2a44" transform="rotate(-62 740 431)"/><path d="M748 300l18-10 4 20z" fill="#c9a24a"/>` +
        s.front);
    },
  });

  def('fy_case', {
    title: 'Matte case for iPhone 17 Pro, Hydro blue', w: 900, h: 900, tags: ['market', 'product', 'tech'],
    svg: (w, h) => {
      const s = studio('#edf2f7', '#dde6ef', '#c4d1de', 660);
      return svg(w, h, s.defs + lg('cs', [[0, '#3f8fd8'], [1, '#1d5ea6']], 0, 0, 1, 1) + lg('cam', [[0, '#2a6db3'], [1, '#164a82']]),
        s.back + shadow(420, 780, 210, 34) +
        `<rect x="270" y="130" width="300" height="620" rx="58" fill="url(#cs)"/><rect x="282" y="142" width="276" height="596" rx="48" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>` +
        `<rect x="296" y="160" width="170" height="170" rx="40" fill="url(#cam)"/>` +
        [[338, 202], [338, 288], [420, 245]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="32" fill="#0d2742"/><circle cx="${x}" cy="${y}" r="20" fill="#111"/>`).join('') +
        `<circle cx="420" cy="440" r="40" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="5"/>` +
        `<path d="M548 700c40 20 60 60 54 100" stroke="#c8392b" stroke-width="5" fill="none"/>` +
        `<path d="M600 800c34-30 80-30 100 0c-20 30-66 30-100 0zM700 800l30-22v44z" fill="#d6372a"/><circle cx="626" cy="796" r="5" fill="#fff"/>` +
        `<path d="M300 200v460" stroke="#fff" stroke-opacity=".18" stroke-width="12" stroke-linecap="round"/>` +
        s.front);
    },
  });

  def('fy_fishcharm', {
    title: 'Red fish phone charm, hand-knotted', w: 900, h: 900, tags: ['market', 'product', 'charm', 'fish'],
    svg: (w, h) => {
      const s = studio('#f6f1ea', '#ece4d8', '#d6cab8', 650);
      let knots = '';
      for (let i = 0; i < 7; i++) knots += `<path d="M${330 + i * 34} 470c10-20 24-20 30 0c-6 20-20 20-30 0z" fill="none" stroke="#9c1f17" stroke-width="3" opacity=".6"/>`;
      return svg(w, h, s.defs + lg('fs', [[0, '#e8473a'], [1, '#b0241a']], 0, 0, 1, 1),
        s.back + shadow(450, 640, 230, 30) +
        `<path d="M450 120v140" stroke="#c8392b" stroke-width="6"/><circle cx="450" cy="110" r="22" fill="none" stroke="#c8392b" stroke-width="6"/>` +
        `<rect x="430" y="250" width="40" height="40" rx="8" fill="#d4a63a"/>` +
        `<path d="M290 470c70-120 260-130 340 0c-80 130-270 120-340 0z" fill="url(#fs)"/><path d="M630 470l110-70v140z" fill="#c8392b"/>` +
        knots + `<circle cx="360" cy="452" r="14" fill="#fff"/><circle cx="363" cy="455" r="7" fill="#1a1a1a"/>` +
        `<path d="M450 560v60M436 620h28" stroke="#c8392b" stroke-width="5"/>` + [0, 1, 2, 3, 4].map((i) => `<path d="M${438 + i * 6} 624v${70 + (i % 2) * 14}" stroke="#c8392b" stroke-width="3"/>`).join('') +
        s.front);
    },
  });

  def('fy_beanie', {
    title: 'Fisherman’s beanie, rib knit', w: 900, h: 900, tags: ['market', 'product', 'apparel', 'snezhnaya'],
    svg: (w, h) => {
      const s = studio('#f2eee8', '#e5ded3', '#cfc4b3', 660);
      let ribs = '';
      for (let i = 0; i < 22; i++) ribs += `M${f(232 + i * 20)} ${f(560)}V${f(320 + Math.abs(i - 10.5) * 7)}`;
      return svg(w, h, s.defs + lg('bn', [[0, '#c45a2c'], [1, '#8c3a18']], 0, 0, 1, 1),
        s.back + shadow(450, 752, 280, 36) +
        `<path d="M222 560c0-220 100-330 228-330s228 110 228 330z" fill="url(#bn)"/><path d="${ribs}" stroke="#6e2b10" stroke-opacity=".35" stroke-width="6"/>` +
        `<rect x="206" y="540" width="488" height="190" rx="30" fill="#b24e22"/>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((i) => `<path d="M${226 + i * 20} 556v158" stroke="#6e2b10" stroke-opacity=".35" stroke-width="7"/>`).join('') +
        `<rect x="400" y="600" width="100" height="70" rx="6" fill="#5b3a26"/>` + T(450, 642, 'M·K', 22, { w: 800, fill: '#e8d2b0', font: SERIF }) +
        `<path d="M300 400c40-80 110-120 170-120" stroke="#fff" stroke-opacity=".18" stroke-width="18" fill="none" stroke-linecap="round"/>` +
        s.front);
    },
  });

  // ═══ home banners (1200×520; the copy is HTML on top) ══════════════════════════════════════════
  def('fy_banner_rite', {
    title: 'Rite of Parting — memorial lanterns', w: 1200, h: 520, tags: ['market', 'banner', 'rite'],
    svg: (w, h) => {
      seed(18);
      let lan = '';
      for (let i = 0; i < 22; i++) {
        const x = rr(470, 1180), y = rr(30, 360), sc = rr(0.35, 1.05);
        lan += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sc)})"><circle r="46" fill="url(#lg)" opacity=".55"/><rect x="-18" y="-24" width="36" height="46" rx="10" fill="url(#lb)"/><rect x="-20" y="-28" width="40" height="7" rx="3" fill="#7a2a12"/><path d="M-6 26h12" stroke="#ffd58a" stroke-width="3"/></g>`;
      }
      let stars = '';
      for (let i = 0; i < 40; i++) stars += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 260))}" r="${f(rr(0.8, 2.2))}" fill="#fff" opacity="${f(rr(0.2, 0.7))}"/>`;
      return svg(w, h,
        lg('sk', [[0, '#120d2e'], [0.6, '#3a1d3e'], [1, '#7a3a2a']]) + rg('lg', [[0, '#ffcf6b', 0.9], [1, '#ff8a2a', 0]]) + lg('lb', [[0, '#ffe7a8'], [1, '#ff9a3a']]) + lg('rf', [[0, '#1a0f14'], [1, '#0a0608']]),
        `<rect width="1200" height="520" fill="url(#sk)"/>${stars}<circle cx="1060" cy="90" r="42" fill="#fff4d6" opacity=".9"/>` + lan +
        `<path d="M0 430l90-20 60 14 90-40 140 40 40-14 70 30h120l60-50 50 18 110-12 80 34 100-20 120 22 70-16v124H0z" fill="url(#rf)"/>` +
        `<path d="M640 380l70-40 70 40M660 380v-26h100v26M650 400h120" stroke="#2a1820" stroke-width="10" fill="none"/>` +
        `<rect width="1200" height="520" fill="url(#sk)" opacity=".0"/>`);
    },
  });

  def('fy_banner_snezh', {
    title: 'Snezhnaya imports week', w: 1200, h: 520, tags: ['market', 'banner', 'snezhnaya'],
    svg: (w, h) => {
      seed(9);
      let snow = '';
      for (let i = 0; i < 70; i++) snow += `<circle cx="${f(rr(0, 1200))}" cy="${f(rr(0, 520))}" r="${f(rr(1.5, 5))}" fill="#fff" opacity="${f(rr(0.35, 0.9))}"/>`;
      const flake = (x, y, r) => [0, 60, 120].map((a) => `<path d="M${x} ${y - r}v${2 * r}M${x - r * 0.3} ${y - r * 0.7}l${r * 0.3} ${r * 0.25} ${r * 0.3} -${r * 0.25}" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" transform="rotate(${a} ${x} ${y})"/>`).join('');
      return svg(w, h,
        lg('sk', [[0, '#9ccbf0'], [1, '#e8f4ff']]) + lg('au', [[0, '#7cf0c8', 0], [0.5, '#7cf0c8', 0.45], [1, '#7cf0c8', 0]], 0, 0, 1, 0) + lg('hl', [[0, '#ffffff'], [1, '#d6e6f4']]),
        `<rect width="1200" height="520" fill="url(#sk)"/>` +
        `<path d="M500 60c160 60 360 10 700 60v60c-300-50-520 0-700-60z" fill="url(#au)"/>` +
        `<path d="M0 360c200-90 360-60 520-10s420 40 680-60v230H0z" fill="url(#hl)"/><path d="M0 420c260-60 520-20 760 10s300-10 440-40v130H0z" fill="#fff"/>` +
        `<path d="M600 300c120-80 220 40 340-20s180-90 260-40v70c-80-50-140-10-260 40s-220-60-340 20z" fill="#c8392b"/><path d="M600 300c120-80 220 40 340-20s180-90 260-40" stroke="#e8594a" stroke-width="6" fill="none"/>` +
        [0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${604 + i * 3} ${306 + i * 9}l-26 ${18 + (i % 2) * 8}" stroke="#c8392b" stroke-width="5" stroke-linecap="round"/>`).join('') +
        flake(980, 110, 38) + flake(1130, 330, 26) + flake(640, 120, 20) + snow);
    },
  });

  def('fy_banner_auction', {
    title: 'Feiyun Auctions — antiques night', w: 1200, h: 520, tags: ['market', 'banner', 'auction'],
    svg: (w, h) => svg(w, h,
      lg('bg', [[0, '#3a120c'], [1, '#7a2414']], 0, 0, 1, 1) + rg('sp', [[0, '#ffb24a', 0.55], [1, '#ffb24a', 0]], 0.72, 0.4, 0.5) + lg('cel', [[0, '#cfe6d6'], [1, '#7fa88f']], 0, 0, 1, 1) + lg('gv', [[0, '#c98c4a'], [1, '#7a4a20']]),
      `<rect width="1200" height="520" fill="url(#bg)"/><rect width="1200" height="520" fill="url(#sp)"/>` +
      `<g fill="none" stroke="#e6b25a" stroke-opacity=".18" stroke-width="5">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${i * 180 - 40} 470c30-40 90-40 100 0c10-30 50-30 60 0"/>`).join('')}</g>` +
      `<ellipse cx="860" cy="430" rx="230" ry="30" fill="#000" opacity=".35"/>` +
      `<path d="M740 270c0-70 60-110 130-110s130 40 130 110c0 90-60 150-130 150s-130-60-130-150z" fill="url(#cel)"/><path d="M1000 260c50-10 70 40 40 70" stroke="#9fc3ab" stroke-width="16" fill="none"/>` +
      `<path d="M740 250c-40-40-60-60-90-60" stroke="#9fc3ab" stroke-width="16" fill="none" stroke-linecap="round"/><ellipse cx="870" cy="168" rx="60" ry="16" fill="#b9d7c2"/><circle cx="870" cy="148" r="12" fill="#b9d7c2"/>` +
      `<g transform="rotate(-30 1050 400)"><rect x="990" y="370" width="140" height="56" rx="12" fill="url(#gv)"/><rect x="1050" y="420" width="18" height="120" rx="8" fill="#5a3412"/></g>` +
      `<rect x="1000" y="470" width="150" height="24" rx="6" fill="#5a3412"/>`),
  });

  // ═══ catalogue ════════════════════════════════════════════════════════════════════════════════
  // sellers: logo colours + glyph (JC.icon) for the round shop logo
  const SELLERS = {
    linlang: { name: 'Linlang Curios', handle: 'linlang_curios', glyph: 'fy.vase', bg: ['#3d2b1f', '#a8743c'], loc: 'Liyue Harbor', since: 2011, pos: 98.1, ratings: 1204, followers: '3.9k', reply: 'Usually replies within a few hours', about: 'Curios, porcelain and old things with stories. Consignments welcome. Questions answered; provenance discussed at my discretion.' },
    mingyun: { name: 'Mingyun Toys & Games', handle: 'mingyun_official', glyph: 'fy.toy', bg: ['#1f5fd1', '#5fb6ff'], loc: 'Liyue Harbor', since: 2015, pos: 99.6, ratings: 12480, followers: '41k', reply: 'Usually replies within 10 minutes', official: true, about: 'Liyue’s oldest toy shop, now on Feiyun. Official stockist of Glacier Guardians. Free gift wrap on every order.' },
    qingce: { name: 'Qingce Fields Florist', handle: 'qingce_fields', glyph: 'fy.flower', bg: ['#2f7d5b', '#9fd7b5'], loc: 'Qingce Village', since: 2016, pos: 99.2, ratings: 3102, followers: '8.2k', reply: 'Usually replies within 30 minutes', about: 'Glaze lilies cut at dawn in Qingce and in Liyue Harbor by breakfast. Same-day courier across the harbor, 06:30–22:00. This week we deliver to Wangsheng Funeral Parlor every morning for the Rite.' },
    snezh: { name: 'SNEZHNAYA Atelier', handle: 'snezhnaya_atelier', glyph: 'fy.pen', bg: ['#14213d', '#3b5aa0'], loc: 'Liyue Harbor boutique', since: 2019, pos: 99.8, ratings: 2210, followers: '15k', reply: 'Usually replies within an hour', official: true, about: 'Writing instruments since 1801. Liyue Harbor boutique on Harbor Road. Engraving available.' },
    jueyun: { name: 'Jueyun Tea Co.', handle: 'jueyun_tea', glyph: 'fy.cup', bg: ['#1f4d3a', '#6ea37f'], loc: 'Liyue Harbor', since: 2009, pos: 99.4, ratings: 6034, followers: '22k', reply: 'Usually replies within an hour', official: true, about: 'Single-garden teas from the Jueyun foothills. Home of Jueyun Premium Oolong.' },
    hydro: { name: 'HYDRO·CARBON Tackle', handle: 'hydrocarbon_tackle', glyph: 'fy.fish', bg: ['#0b5cad', '#38a6e8'], loc: 'Liyue Harbor', since: 2018, pos: 99.1, ratings: 4471, followers: '12k', reply: 'Usually replies within an hour', official: true, about: 'Rods, reels and line for sea anglers. Tested off Pier 7 every Thursday.' },
    bamboo: { name: 'Old Bamboo Workshop', handle: 'old_bamboo_qingce', glyph: 'fy.cage', bg: ['#6b5a2a', '#c9b06a'], loc: 'Qingce Village', since: 1998, pos: 100, ratings: 388, followers: '1.1k', reply: 'Usually replies within a day', about: 'Birdcages, steamers and screens, made by hand in Qingce by the Xu family since before anyone kept count.' },
    wanwen: { name: 'Wanwen Bookhouse', handle: 'wanwen_books', glyph: 'book.fill', bg: ['#5d6b52', '#a9b79c'], loc: 'Liyue Harbor', since: 2012, pos: 99.7, ratings: 5290, followers: '18k', reply: 'Usually replies within an hour', about: 'Books, notebooks and postcards from Liyue’s favourite bookshop.' },
    meka: { name: 'Meka Electronics (Fontaine import)', handle: 'meka_fontaine', glyph: 'bolt.fill', bg: ['#2b2f3a', '#6f7a92'], loc: 'Ships from Liyue Harbor', since: 2021, pos: 98.7, ratings: 9861, followers: '30k', reply: 'Usually replies within 2 hours', about: 'Fontaine-engineered chargers and cases. Clockwork precision, harbor prices.' },
    morepesok: { name: 'Morepesok Knit & Co.', handle: 'morepesok_knit', glyph: 'snowflake', bg: ['#8c1d14', '#d6372a'], loc: 'Ships from Morepesok', since: 2020, pos: 99.5, ratings: 1730, followers: '6.4k', reply: 'Usually replies within a day', about: 'Wool from the north shore, knitted by fishermen’s wives in Morepesok. Snezhnaya imports week: free shipping to Liyue.' },
    pantry: { name: 'Snezhnayan Pantry', handle: 'snezh_pantry', glyph: 'fy.bowl', bg: ['#2d4a6d', '#7aa6d6'], loc: 'Liyue Harbor', since: 2022, pos: 98.9, ratings: 2604, followers: '7.7k', reply: 'Usually replies within an hour', about: 'Frozen and fresh from the north: pelmeni, smetana, rye, ukha. Cold-chain delivery across the harbor.' },
    wanmin: { name: 'Wanmin Restaurant', handle: 'wanmin_official', glyph: 'flame.fill', bg: ['#b8321b', '#ff8a3a'], loc: 'Chihu Rock', since: 2017, pos: 99.3, ratings: 7720, followers: '26k', reply: 'Usually replies within 20 minutes', official: true, about: 'Xiangling’s kitchen, bottled. Hotpot bases and chili crisp from Chihu Rock. Guoba approves.' },
    heyu: { name: 'Heyu Tea House', handle: 'heyu_teahouse', glyph: 'music.note', bg: ['#7a2a5a', '#d17aa8'], loc: 'Liyue Harbor', since: 2014, pos: 99.9, ratings: 940, followers: '19k', reply: 'Usually replies within a few hours', official: true, about: 'Opera, tea and charity lots. Proceeds of every auction go to the Liyue Young Performers’ Fund.' },
    mingxing: { name: 'Mingxing Jewelry — Estate', handle: 'mingxing_estate', glyph: 'sparkles', bg: ['#1f5a3e', '#7fbf98'], loc: 'Liyue Harbor', since: 2008, pos: 99.0, ratings: 2380, followers: '9.9k', reply: 'Usually replies within a few hours', about: 'Estate jade, seals and silver, appraised in-house.' },
    wangsheng: { name: 'Wangsheng Funeral Parlor', handle: 'wangsheng_official', glyph: 'fy.lantern', bg: ['#3a0f14', '#9b2a2a'], loc: 'Feiyun Slope', since: 1780, pos: 99.9, ratings: 4400, followers: '33k', reply: 'Usually replies within 1 minute 👻', official: true, about: 'Funerals, pre-planning and memorial goods. Autumn sale: 2nd coffin half price (in parlor only). This week: everything for the Rite of Parting.' },
    goldmint: { name: 'Golden House Mint Shop', handle: 'goldenhouse_mint', glyph: 'fy.coin', bg: ['#6e5214', '#e2b84a'], loc: 'Liyue Harbor', since: 1926, pos: 99.6, ratings: 3120, followers: '14k', reply: 'Usually replies within a day', official: true, about: 'Commemorative issues from the old mint. Every coin ships in a sealed capsule.' },
  };

  // delivery profiles: shop hours + courier (in-game hours)
  const SHIP = {
    florist: { open: 6.5, close: 22, pack: 20, toCourier: 25, ride: 45, courier: 'Qingce Fields courier', label: 'Same-day florist courier' },
    local: { open: 9, close: 21, pack: 35, toCourier: 70, ride: 60, courier: 'Feiyun Swift Courier', label: 'Feiyun Swift — same or next day' },
    insured: { open: 10, close: 19, pack: 60, toCourier: 90, ride: 70, courier: 'Feiyun Swift Insured', label: 'Insured courier, signature required' },
    cold: { open: 8, close: 21, pack: 25, toCourier: 40, ride: 50, courier: 'Feiyun Cold Chain', label: 'Cold-chain delivery' },
    import: { open: 9, close: 20, pack: 120, toCourier: 300, ride: 90, courier: 'Snezhnaya Post → Feiyun Swift', label: 'Imported — 2–3 days', days: 2 },
  };

  // reviews: [stars, by, daysAgo, text, variant?]
  const P = [
    // ── auctions ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lot_teaset', kind: 'auction', cat: 'antiques', seller: 'linlang', ship: 'insured',
      title: 'Guizhong-era celadon tea set — teapot & five cups', short: 'Guizhong-era celadon tea set',
      art: ['mk_teaset', 'p_teaset', 'fy_teaset_detail'], cond: 'Antique · see description',
      lot: { no: 'FY-2210-0417', start: 2800, inc: 200, end: '+1 00:30', watchers: 214 },
      tags: 'celadon tea set teapot cups porcelain guizhong antique jade glaze liyue',
      specs: [['Lot', 'FY-2210-0417'], ['Era', 'Guizhong-era (attributed by seller)'], ['Material', 'Celadon-glazed stoneware'], ['Pieces', 'Teapot and five cups'], ['Marks', 'Incised mark on the base of the teapot — full photos to the winning bidder'], ['Condition', 'Hairline in the foot ring of cup 3; minor glaze skips. No chips.'], ['Provenance', 'Private collection, Qingce. Consignor wishes to remain anonymous.'], ['Height (teapot)', '11.5 cm']],
      desc: ['A celadon tea set of unusual quality: pale jade glaze with a fine crackle, the cups carved under the glaze with a single glaze lily. The teapot lid fits as if it was made yesterday. It was not.', 'Offered from an old family collection near Qingce. The guild’s appraisal desk declined to put a date on it. In my experience that means it is either worthless or priceless, and it is not worthless.', 'Sold as seen. Winning bid is charged automatically when the lot closes. Insured courier with signature, anywhere in Liyue Harbor.'],
      qa: [['Is the mark on the base original?', 'All marks are as photographed. Full base photos go to the winning bidder. House rule.', 3], ['Can you provide a certificate of age?', 'No. The guild’s appraisers looked at it for an hour and went very quiet. Make of that what you will.', 2], ['Is there a reserve?', 'Reserve met. It will sell tonight.', 1]],
    },
    {
      id: 'lot_print', kind: 'auction', cat: 'antiques', seller: 'heyu', ship: 'local',
      title: 'Charity lot: signed print “Yun Jin at Heyu Tea House” (12/50)', short: 'Signed Yun Jin print, 12/50',
      art: ['p_heyu_stage'], cond: 'New · numbered & signed',
      lot: { no: 'FY-2210-0388', start: 400, inc: 50, end: '+1 22:00', watchers: 96 },
      tags: 'yun jin opera print signed poster heyu charity collectible',
      specs: [['Edition', '12 of 50'], ['Size', '50 × 70 cm, archival paper'], ['Signed', 'By Yun Jin, in vermilion ink'], ['Proceeds', 'Liyue Young Performers’ Fund']],
      desc: ['Photographed from the third row at the premiere of “The Divine Damsel of Devastation”. Hand-signed by Yun Jin.', 'Every Mora goes to the Liyue Young Performers’ Fund. Ships rolled in a tube.'],
      qa: [['Will Ms. Yun Jin dedicate it?', 'She dedicates prints to winning bidders when asked nicely. She has asked us to say “nicely” twice.', 4]],
    },
    {
      id: 'lot_seal', kind: 'auction', cat: 'antiques', seller: 'mingxing', ship: 'insured',
      title: 'Qixing-era jade seal with qilin knob, fitted box', short: 'Qixing-era jade seal',
      art: ['fy_jade_seal'], cond: 'Antique · excellent',
      lot: { no: 'FY-2210-0402', start: 1800, inc: 100, end: '+2 20:00', watchers: 61 },
      tags: 'jade seal qilin antique stamp qixing estate',
      specs: [['Material', 'Nephrite jade'], ['Face', '3.2 × 3.2 cm, four characters (illegible, worn)'], ['Box', 'Red lacquer, later'], ['Appraisal', 'In-house, Mingxing Jewelry']],
      desc: ['Estate piece: a jade seal topped with a seated qilin, the face worn smooth by use. Comes with a later lacquer box and a tin of seal paste.'],
      qa: [['Can you read the characters?', 'Our appraiser reads three of four. The fourth may be a name. It may be a joke.', 6]],
    },
    // ── toys (gifts for Teucer) ──────────────────────────────────────────────────────────────
    {
      id: 'toy_sirfang', kind: 'buy', cat: 'toys', seller: 'mingyun', ship: 'local', price: 680, was: 760, sold: 2310, rating: 4.9, nrev: 412, gift: true,
      title: 'Sir Fang plush XL — ice wolf, 80 cm, with scarf', short: 'Sir Fang plush XL',
      art: ['mk_sirfang', 'p_teucer_sirfang'], cond: 'New', opts: { name: 'Size', list: ['XL · 80 cm'] },
      tags: 'sir fang plush wolf toy teddy soft glacier guardians kids gift',
      specs: [['Size', '80 cm (XL)'], ['Material', 'Short-pile plush, cotton-knit scarf'], ['Age', '3+'], ['Care', 'Hand wash 30°, remove scarf first']],
      desc: ['The biggest Sir Fang yet: 80 centimetres of ice wolf, with the red knit scarf every Glacier Guardians fan knows.', 'Free gift wrap in Glacier Guardians paper — add a note at checkout.'],
      reviews: [[5, 'm***a', 4, 'My son sleeps with it every night. The scarf comes off, which is good, because he chews it.', 'XL'], [5, 'snowy_dad', 9, 'Bigger than my nephew. He calls it “the boss”.', 'XL'], [4, 'l***7', 21, 'Lovely, but the box barely fit through my door.']],
      qa: [['Is it washable?', 'Yes, gentle hand wash at 30°. Remove the scarf first.', 12], ['Same Sir Fang as the show?', 'Officially licensed, same face, same scarf, bigger heart.', 30]],
    },
    {
      id: 'toy_frost_fortress', kind: 'buy', cat: 'toys', seller: 'mingyun', ship: 'local', price: 2400, sold: 860, rating: 4.9, nrev: 207, gift: true,
      title: 'Glacier Guardians: Frost Fortress building set, 1,148 pieces', short: 'Glacier Guardians Frost Fortress',
      art: ['mk_frost_fortress'], cond: 'New',
      tags: 'glacier guardians frost fortress building set toy castle ice kids gift lego',
      specs: [['Pieces', '1,148'], ['Figures', 'Captain Rime, Frostfang, Little Sleet'], ['Age', '8+'], ['Size built', '42 × 30 × 38 cm']],
      desc: ['Three towers, a working ice slide, a drawbridge and a secret vault. Includes Captain Rime, Frostfang and Little Sleet.', 'The set every eight-year-old in Morepesok is asking for this winter. Last two in stock in Liyue.'],
      reviews: [[5, 'k***n', 6, 'Built it in one evening with my nephew. The ice slide works with marbles. He has not stopped talking.'], [5, 'brick_baba', 18, 'Instructions are excellent. The vault really locks.'], [4, 'q***i', 40, 'Great set, one bag of grey pieces missing — Mingyun sent it the next day.']],
      qa: [['Does it include Captain Rime?', 'Yes — Captain Rime, Frostfang and Little Sleet.', 5], ['Can you gift wrap it?', 'Free gift wrap on every order. Add a gift note at checkout.', 9]],
    },
    {
      id: 'toy_gg_rime', kind: 'buy', cat: 'toys', seller: 'mingyun', ship: 'local', price: 260, sold: 3120, rating: 4.8, nrev: 590, gift: true,
      title: 'Glacier Guardians figure: Captain Rime (Wave 3)', short: 'Captain Rime figure',
      art: ['fy_gg_figure'], cond: 'New',
      tags: 'glacier guardians figure captain rime action figure toy',
      specs: [['Height', '16 cm'], ['Articulation', '14 points'], ['Accessories', 'Ice spear, shield']],
      desc: ['Wave 3 Captain Rime with ice spear and frost shield.'],
      reviews: [[5, 'a***4', 3, 'Spear is sturdier than wave 2. Kid approved.'], [5, 'tidepool', 15, 'Arrived in two hours.']],
      qa: [],
    },
    {
      id: 'toy_bluefin', kind: 'buy', cat: 'toys', seller: 'mingyun', ship: 'local', price: 128, sold: 4410, rating: 4.7, nrev: 803, gift: true,
      title: 'Reel Rush official plush: “Big Tuna” bluefin, 45 cm', short: 'Reel Rush Big Tuna plush',
      art: ['fy_plush_fish'], cond: 'New',
      tags: 'reel rush plush fish tuna bluefin toy game',
      specs: [['Size', '45 cm'], ['Licence', 'Reel Rush official']],
      desc: ['The legendary catch from Reel Rush, now huggable. Squeaks when squeezed.'],
      reviews: [[5, 'p***r', 2, 'My son named it after his teacher.'], [4, 'deepline', 11, 'Squeak is loud. Very loud.']],
      qa: [['Does the squeak come out?', 'No. We are sorry.', 20]],
    },
    // ── flowers & the Rite ───────────────────────────────────────────────────────────────────
    {
      id: 'lilies_wangsheng', kind: 'buy', cat: 'flowers', seller: 'qingce', ship: 'florist', price: 1288, sold: 640, rating: 5.0, nrev: 188, gift: true, fixedTo: 'wangsheng', card: true,
      title: 'Glaze lily tribute bouquet, 12 stems — delivered to Wangsheng Funeral Parlor', short: 'Glaze lily tribute bouquet',
      art: ['mk_lilies', 'p_glaze_lily'], cond: 'Fresh-cut today',
      tags: 'glaze lily lilies flowers bouquet tribute wangsheng funeral rite of parting memorial',
      specs: [['Stems', '12 glaze lilies, cut at dawn in Qingce'], ['Delivery', 'Wangsheng Funeral Parlor, Feiyun Slope'], ['Card', 'Handwritten card included'], ['Vase life', '7–10 days']],
      desc: ['For the Rite of Parting. Twelve glaze lilies wrapped in undyed paper and tied with green silk, delivered to Wangsheng Funeral Parlor with a handwritten card.', 'Glaze lilies bloom best where someone is remembered. Our couriers go up Feiyun Slope every morning this week.'],
      reviews: [[5, 'h***u', 1, 'Delivered before the parlor opened, still wet with dew. Thank you.'], [5, 'stone_and_tea', 2, 'The card was written in beautiful hand. My grandmother would have loved them.'], [5, 'w***g', 5, 'The staff at Wangsheng put them right by the guest book.']],
      qa: [['Can you deliver Sunday morning, before the Rite?', 'Yes — we go up to the parlor from 06:30 every day this week.', 3], ['Who writes the card?', 'Ms. Lan, by hand. Keep it under 200 characters, she is fast but not that fast.', 6]],
    },
    {
      id: 'flowers_lily6', kind: 'buy', cat: 'flowers', seller: 'qingce', ship: 'florist', price: 520, sold: 1290, rating: 4.9, nrev: 341, gift: true, card: true,
      title: 'Glaze lily stems ×6, paper-wrapped — any address', short: 'Glaze lily stems ×6',
      art: ['p_glaze_lily'], cond: 'Fresh-cut today',
      tags: 'glaze lily lilies flowers stems bouquet qingce',
      specs: [['Stems', '6'], ['Wrap', 'Undyed paper, green silk']],
      desc: ['Six glaze lily stems, cut at dawn. Same-day anywhere in Liyue Harbor.'],
      reviews: [[5, 'c***s', 8, 'They opened overnight and the whole flat smelled like rain.'], [5, 'qingce_girl', 13, 'From my own village. Still the best.']],
      qa: [],
    },
    {
      id: 'rite_lanterns', kind: 'buy', cat: 'flowers', seller: 'wangsheng', ship: 'local', price: 96, sold: 18200, rating: 4.9, nrev: 2604,
      title: 'Memorial paper lanterns ×3 — Rite of Parting edition', short: 'Memorial lanterns ×3',
      art: ['p_yujing_lanterns'], cond: 'New',
      tags: 'lanterns memorial rite of parting paper lantern rex lapis wangsheng yujing',
      specs: [['Set', '3 lanterns, 30 cm'], ['Candle', 'Included, 3 h burn'], ['Use', 'Release at Yujing Terrace, Sun 18 Oct']],
      desc: ['Official Rite of Parting lanterns from Wangsheng. Write a name, light the candle, let it go from Yujing Terrace when the founder’s lanterns rise.', 'From the Director: “Paper lanterns are fire-safe, river-safe and ghost-approved. Buy three, the third one’s for luck~”'],
      reviews: [[5, 'y***n', 1, 'Beautiful. The ink doesn’t smudge on the paper.'], [5, 'lantern_kid', 2, 'The parlor added a free butterfly sticker. Cute but slightly ominous.'], [4, 'g***o', 3, 'Sold out at the harbor stalls, glad these arrived in time.']],
      qa: [['Will they arrive before Sunday?', 'Order by Saturday 18:00 and they’ll be with you before the Rite. 👻', 2]],
    },
    {
      id: 'coin_rite', kind: 'buy', cat: 'antiques', seller: 'goldmint', ship: 'insured', price: 680, sold: 2900, rating: 4.8, nrev: 455,
      title: 'Rite of Parting commemorative Mora, 1 oz silver, sealed capsule', short: 'Rite of Parting silver Mora',
      art: ['fy_coin'], cond: 'New · proof finish',
      tags: 'coin mora silver commemorative rite of parting golden house collectible rex lapis',
      specs: [['Metal', '999 silver, 1 oz'], ['Mintage', '6,000'], ['Mint', 'The Golden House, Liyue Harbor']],
      desc: ['Struck at the Golden House for the Rite of Parting: a lantern rising over the terrace, “RITE OF PARTING · 2026” around the rim.'],
      reviews: [[5, 'n***g', 2, 'Proof finish is flawless.'], [4, 'harbor_numis', 4, 'Capsule was scratched, coin perfect.']],
      qa: [['Is it legal tender?', 'Technically, one Mora. Please do not spend it.', 5]],
    },
    // ── fishing ──────────────────────────────────────────────────────────────────────────────
    {
      id: 'rod_hydro', kind: 'buy', cat: 'fishing', seller: 'hydro', ship: 'local', price: 1980, sold: 520, rating: 4.9, nrev: 133,
      title: 'HYDRO·CARBON 2.7 m sea rod + 4000 reel combo', short: 'HYDRO·CARBON rod + reel',
      art: ['mk_rod'], cond: 'New',
      tags: 'fishing rod reel carbon sea hydro carbon tackle',
      specs: [['Length', '2.7 m, 2 pieces'], ['Reel', 'HYDRO·CARBON 4000, 9+1 bearings'], ['Casting', '20–80 g']],
      desc: ['Our pier rod: light enough to cast all night, stiff enough for a bluefin that has opinions.'],
      reviews: [[5, 'p7_regular', 5, 'Landed a 9 kg sea bass off Pier 7. Rod did not complain.'], [5, 'a***x', 90, 'Gift from someone who never carries money. Best rod I own.']],
      qa: [['Good for night fishing?', 'Tip is pre-whipped for a glow tip. Most of our customers are night people.', 14]],
    },
    {
      id: 'fish_line', kind: 'buy', cat: 'fishing', seller: 'hydro', ship: 'local', price: 138, sold: 7410, rating: 4.8, nrev: 1230,
      title: 'HYDRO·CARBON braided line, 300 m, 20 lb, low-vis green', short: 'Braided line 300 m, 20 lb',
      art: ['fy_line'], cond: 'New', opts: { name: 'Strength', list: ['20 lb', '30 lb', '40 lb'] },
      tags: 'fishing line braid braided 20lb 300m green',
      specs: [['Length', '300 m'], ['Strength', '20 lb (9 kg)'], ['Weave', '8-strand']],
      desc: ['Eight-strand braid that casts like silk and doesn’t forgive bad knots.'],
      reviews: [[5, 'a***x', 24, 'Second spool. Snapped the last one on something enormous. Not the line’s fault.'], [4, 'knotty', 30, 'Colour fades after a month, strength doesn’t.']],
      qa: [],
    },
    {
      id: 'fish_lures', kind: 'buy', cat: 'fishing', seller: 'morepesok', ship: 'import', price: 88, sold: 980, rating: 4.9, nrev: 214, snezh: true,
      title: 'Snezhnayan spoon lures ×6 — Morepesok pattern', short: 'Morepesok spoon lures ×6',
      art: ['fy_lures'], cond: 'New', opts: { name: 'Finish', list: ['Mixed', 'Silver', 'Copper'] },
      tags: 'lures spoon fishing snezhnaya morepesok',
      specs: [['Weight', '14 g each'], ['Made in', 'Morepesok, Snezhnaya']],
      desc: ['Hand-hammered spoons from the north shore. Cod love them. Liyue sea bass, it turns out, also love them.'],
      reviews: [[5, 'old_salt', 7, 'Same spoons my father used.'], [5, 'f***h', 12, 'Ice-fishing gear that works in warm water too.']],
      qa: [],
    },
    // ── tea ──────────────────────────────────────────────────────────────────────────────────
    {
      id: 'birdcage', kind: 'buy', cat: 'antiques', seller: 'bamboo', ship: 'local', price: 1680, sold: 41, rating: 5.0, nrev: 19, gift: true,
      title: 'Antique-style bamboo birdcage, hand-split, Qingce workshop', short: 'Bamboo birdcage, Qingce',
      art: ['mk_birdcage'], cond: 'New · made to order',
      tags: 'birdcage bird cage bamboo antique qingce handmade',
      specs: [['Height', '58 cm'], ['Bamboo', 'Qingce mottled, 5-year'], ['Lead time', 'In stock']],
      desc: ['Split by hand, bent over steam and fitted without a single nail. The hook is brass, the door latches with a bamboo pin.'],
      reviews: [[5, 'a***x', 160, 'Bought for a friend who keeps birds. He talked about the bamboo for forty minutes. Five stars I guess.'], [5, 'qx_lady', 220, 'My finch sings more in it. Unscientific but true.']],
      qa: [['Is it suitable for a thrush?', 'Yes. A gentleman asked the same and then explained the history of thrush-keeping to us. He was correct.', 150]],
    },
    {
      id: 'tea_tin', kind: 'buy', cat: 'tea', seller: 'jueyun', ship: 'local', price: 368, sold: 5600, rating: 4.9, nrev: 980, gift: true,
      title: 'Jueyun Premium Oolong, 250 g gift tin', short: 'Jueyun Premium Oolong 250 g',
      art: ['mk_tea_tin'], cond: 'New · harvest 2026',
      tags: 'tea oolong jueyun tin gift premium liyue',
      specs: [['Harvest', 'Spring 2026'], ['Weight', '250 g'], ['Steeps', '6–8']],
      desc: ['Rolled by hand in the Jueyun foothills. Roasted twice, rested a season. Orchid on the nose, stone in the finish.'],
      reviews: [[5, 'z***i', 12, 'The second steeping is better, as second steepings are.'], [5, 'tea_auntie', 30, 'Gift tin is lovely.']],
      qa: [['Good for gongfu brewing?', 'It was made for it.', 40]],
    },
    {
      id: 'tea_milk', kind: 'buy', cat: 'tea', seller: 'jueyun', ship: 'local', price: 64, sold: 22100, rating: 4.7, nrev: 3402,
      title: 'Osmanthus milk tea kit — 8 cups', short: 'Osmanthus milk tea kit',
      art: ['food_milk_tea'], cond: 'New',
      tags: 'milk tea osmanthus bubble tea kit drink',
      specs: [['Servings', '8'], ['Includes', 'Tea, osmanthus syrup, tapioca']],
      desc: ['Wanmin-street-style osmanthus milk tea at home.'],
      reviews: [[5, 'boba_bae', 2, 'Tastes like the stall by the docks.'], [4, 'q***n', 6, 'Tapioca needs longer than it says.']],
      qa: [],
    },
    // ── stationery ───────────────────────────────────────────────────────────────────────────
    {
      id: 'pen_tonia', kind: 'buy', cat: 'stationery', seller: 'snezh', ship: 'local', price: 1150, sold: 312, rating: 5.0, nrev: 96, gift: true, snezh: true,
      title: 'SNEZHNAYA Atelier fountain pen “Polar Night”, gold nib, gift box', short: 'SNEZHNAYA Atelier fountain pen',
      art: ['mk_pen'], cond: 'New', opts: { name: 'Nib', list: ['Fine', 'Medium', 'Broad'] },
      tags: 'fountain pen snezhnaya atelier gift pen nib stationery writing',
      specs: [['Nib', '14k gold'], ['Body', 'Navy resin, silver trim'], ['Filling', 'Piston'], ['Box', 'Gift box with ink and card']],
      desc: ['Writing instruments since 1801. “Polar Night” is our navy resin pen with a 14k gold nib, in a gift box with a bottle of ink and a blank card.', 'Snezhnaya imports week: free express delivery in Liyue Harbor.'],
      reviews: [[5, 'm***a', 3, 'Bought for my daughter’s exams. The box smells like snow.', 'Fine'], [5, 'ink_stained', 10, 'Smoothest nib I’ve owned.', 'Medium'], [5, 'kaz_poet', 28, 'Wrote three poems with it on a ship deck. Ink did not run.']],
      qa: [['Can it be engraved?', 'Up to 12 characters, Latin or Snezhnayan, adds 2 days. Ask us after ordering.', 4], ['Good for a 15-year-old?', 'Our best-selling pen for students. Piston filler, nearly unbreakable.', 9]],
    },
    {
      id: 'stat_notebook', kind: 'buy', cat: 'stationery', seller: 'wanwen', ship: 'local', price: 58, sold: 9800, rating: 4.8, nrev: 1720,
      title: 'Wanwen linen notebook A5 — dot grid, 192 pages', short: 'Wanwen linen notebook A5',
      art: ['fy_notebook'], cond: 'New', opts: { name: 'Ruling', list: ['Dot grid', 'Lined', 'Blank'] },
      tags: 'notebook journal linen a5 stationery wanwen',
      specs: [['Pages', '192, 100 gsm'], ['Cover', 'Linen, sage']],
      desc: ['Our house notebook: linen cover, lay-flat binding, paper that takes fountain-pen ink without ghosting.'],
      reviews: [[5, 'l***e', 4, 'Fountain-pen friendly as promised.'], [5, 'bookworm_ly', 14, 'Third one this year.']],
      qa: [],
    },
    {
      id: 'stat_postcards', kind: 'buy', cat: 'stationery', seller: 'wanwen', ship: 'local', price: 36, sold: 6100, rating: 4.9, nrev: 880,
      title: 'Postcards of Liyue ×10 — Jade Chamber, harbor, terraces', short: 'Liyue postcards ×10',
      art: ['p_jade_chamber', 'p_harbor_day'], cond: 'New',
      tags: 'postcards liyue jade chamber harbor souvenir',
      specs: [['Set', '10 cards'], ['Print', 'Matte, uncoated back']],
      desc: ['Ten views of Liyue Harbor, printed on paper you can actually write on.'],
      reviews: [[5, 's***a', 9, 'Sent one home to Snezhnaya. Mama framed it.']],
      qa: [],
    },
    // ── electronics ──────────────────────────────────────────────────────────────────────────
    {
      id: 'powerbank', kind: 'buy', cat: 'electronics', seller: 'meka', ship: 'local', price: 229, was: 299, sold: 15300, rating: 4.7, nrev: 2840,
      title: 'Meka 20,000 mAh power bank, 45 W fast charge, white', short: '20,000 mAh power bank',
      art: ['mk_charger'], cond: 'New',
      tags: 'power bank battery charger portable usb-c fast charge electronics',
      specs: [['Capacity', '20,000 mAh'], ['Output', '45 W USB-C PD'], ['Weight', '340 g']],
      desc: ['Charges a phone four times over. Enough for a long night on the pier or a very long game session.'],
      reviews: [[5, 'gamer_anon', 3, 'Kept my console alive for a whole flight.'], [4, 'v***a', 20, 'Heavy, but it’s a brick of power.']],
      qa: [['Allowed on planes?', 'Yes, 74 Wh — under the airline limit.', 7]],
    },
    {
      id: 'elec_case', kind: 'buy', cat: 'electronics', seller: 'meka', ship: 'local', price: 128, sold: 7900, rating: 4.6, nrev: 1310,
      title: 'Matte case for iPhone 17 Pro — Hydro blue', short: 'iPhone 17 Pro case, Hydro blue',
      art: ['fy_case'], cond: 'New', opts: { name: 'Colour', list: ['Hydro blue', 'Pyro red', 'Geo amber'] },
      tags: 'phone case iphone 17 pro matte blue hydro cover',
      specs: [['Fits', 'iPhone 17 Pro'], ['Finish', 'Matte, soft-touch'], ['Lanyard hole', 'Yes']],
      desc: ['Soft-touch matte with a lanyard hole for your charm of choice. Survives piers.'],
      reviews: [[5, 'h***o', 5, 'Survived a drop on wet stone.'], [4, 'pyro_pyotr', 16, 'Red one is VERY red.']],
      qa: [],
    },
    {
      id: 'elec_charm', kind: 'buy', cat: 'electronics', seller: 'morepesok', ship: 'import', price: 28, sold: 2300, rating: 4.9, nrev: 420, snezh: true,
      title: 'Red fish phone charm, hand-knotted — Morepesok', short: 'Red fish phone charm',
      art: ['fy_fishcharm'], cond: 'Handmade',
      tags: 'charm phone charm fish red knot lucky morepesok',
      specs: [['Length', '9 cm'], ['Cord', 'Waxed cotton']],
      desc: ['A red fish for luck at sea, knotted by hand in Morepesok. Little brothers and sisters have been tying these to big brothers’ bags for a hundred years.'],
      reviews: [[5, 't***r', 30, 'Same one my brother has!!!'], [5, 'net_mender', 40, 'Well made, knots are tight.']],
      qa: [],
    },
    // ── apparel ──────────────────────────────────────────────────────────────────────────────
    {
      id: 'scarf', kind: 'buy', cat: 'apparel', seller: 'morepesok', ship: 'import', price: 420, sold: 1840, rating: 4.9, nrev: 377, gift: true, snezh: true,
      title: 'Hand-knitted red scarf, Snezhnayan wool, 180 cm', short: 'Hand-knitted red scarf',
      art: ['mk_scarf'], cond: 'Handmade',
      tags: 'scarf red knitted wool snezhnaya winter apparel',
      specs: [['Length', '180 cm'], ['Wool', 'North-shore sheep, undyed core'], ['Care', 'Cold hand wash']],
      desc: ['Knitted in Morepesok over a winter of long evenings. Warm enough for Snezhnaya, light enough for a Liyue autumn night on the pier.'],
      reviews: [[5, 'k***a', 6, 'Smells faintly of the sea. In a good way.'], [5, 'red_scarf_club', 19, 'Matches my mask. Don’t ask.']],
      qa: [],
    },
    {
      id: 'app_beanie', kind: 'buy', cat: 'apparel', seller: 'morepesok', ship: 'import', price: 160, sold: 1200, rating: 4.8, nrev: 230, gift: true, snezh: true,
      title: 'Fisherman’s beanie, rib knit — Morepesok', short: 'Fisherman’s beanie',
      art: ['fy_beanie'], cond: 'Handmade', opts: { name: 'Colour', list: ['Rust', 'Navy', 'Charcoal'] },
      tags: 'beanie hat knit fisherman winter apparel snezhnaya',
      specs: [['Knit', '2×2 rib, double brim'], ['Size', 'One size (kids’ size on request)']],
      desc: ['The hat every Morepesok child wears to the harbor at dawn.'],
      reviews: [[5, 'b***e', 8, 'Bought the kids’ size for my little brother. He refuses to take it off.', 'Rust']],
      qa: [['Kids’ size?', 'Message us after ordering — we knit a smaller one.', 14]],
    },
    // ── food (Snezhnaya imports week + Wanmin) ───────────────────────────────────────────────
    {
      id: 'food_pelmeni', kind: 'buy', cat: 'food', seller: 'pantry', ship: 'cold', price: 96, sold: 14500, rating: 4.8, nrev: 2210, snezh: true,
      title: 'Frozen pelmeni, Morepesok-style, 1 kg', short: 'Frozen pelmeni 1 kg',
      art: ['food_pelmeni'], cond: 'Frozen',
      tags: 'pelmeni dumplings frozen snezhnaya food smetana',
      specs: [['Weight', '1 kg (~60 pieces)'], ['Filling', 'Pork & beef, onion, pepper']],
      desc: ['Like Mama makes — almost. Boil 7 minutes, add smetana, call your mother.'],
      reviews: [[5, 'homesick_in_ly', 3, 'Close enough to cry.'], [4, 'd***v', 11, 'Needs more pepper. Added more pepper.']],
      qa: [],
    },
    {
      id: 'food_borscht', kind: 'buy', cat: 'food', seller: 'pantry', ship: 'cold', price: 78, sold: 5200, rating: 4.7, nrev: 760, snezh: true,
      title: 'Borscht kit for four — beets, broth, dill, smetana', short: 'Borscht kit for 4',
      art: ['food_borscht'], cond: 'Fresh',
      tags: 'borscht soup beet snezhnaya kit food',
      specs: [['Serves', '4'], ['Cook time', '40 min']],
      desc: ['Everything for a pot of proper borscht, including the smetana.'],
      reviews: [[5, 'z***a', 7, 'Better than the restaurant on Harbor Road.']],
      qa: [],
    },
    {
      id: 'food_ukha', kind: 'buy', cat: 'food', seller: 'pantry', ship: 'cold', price: 88, sold: 2100, rating: 4.8, nrev: 310, snezh: true,
      title: 'Snezhnayan fish soup (ukha) kit', short: 'Ukha fish soup kit',
      art: ['food_fish_stew'], cond: 'Fresh',
      tags: 'fish soup ukha snezhnaya kit food',
      specs: [['Serves', '3'], ['Fish', 'Cod & salmon']],
      desc: ['Fisherman’s soup from the north shore: cod, salmon, potato, dill, a splash of something warming (not included).'],
      reviews: [[5, 'sea_legs', 9, 'Tastes like my grandfather’s boat.']],
      qa: [],
    },
    {
      id: 'food_hotpot', kind: 'buy', cat: 'food', seller: 'wanmin', ship: 'local', price: 66, sold: 30400, rating: 4.9, nrev: 5900,
      title: 'Wanmin spicy hotpot base ×3 — Chihu Rock recipe', short: 'Wanmin hotpot base ×3',
      art: ['food_hotpot'], cond: 'New',
      tags: 'hotpot base spicy chili wanmin food sichuan',
      specs: [['Packs', '3 × 220 g'], ['Heat', '🌶️🌶️🌶️🌶️']],
      desc: ['Xiangling’s own hotpot base. Feeds four, or one Paimon.'],
      reviews: [[5, 'e***d', 1, 'PAIMON APPROVES!!!'], [5, 'spice_lord', 4, 'Actually spicy. Respect.']],
      qa: [['How spicy?', 'Yes.', 10]],
    },
    {
      id: 'food_almond', kind: 'buy', cat: 'food', seller: 'wanmin', ship: 'cold', price: 48, sold: 8800, rating: 4.8, nrev: 1500,
      title: 'Almond tofu dessert cups ×6', short: 'Almond tofu ×6',
      art: ['food_almond_tofu'], cond: 'Chilled',
      tags: 'almond tofu dessert sweet food',
      specs: [['Cups', '6 × 120 g']],
      desc: ['Silky almond tofu with osmanthus syrup.'],
      reviews: [[5, 'd***e', 6, 'Tastes like summer on the terrace.']],
      qa: [],
    },
  ];

  const CATS = [
    { id: 'antiques', name: 'Antiques', glyph: 'fy.vase', c: '#b5651d' },
    { id: 'toys', name: 'Toys', glyph: 'fy.toy', c: '#2f80ed' },
    { id: 'flowers', name: 'Flowers', glyph: 'fy.flower', c: '#2f9e6f' },
    { id: 'fishing', name: 'Fishing', glyph: 'fy.fish', c: '#0b84c6' },
    { id: 'tea', name: 'Tea', glyph: 'fy.cup', c: '#4c8b5a' },
    { id: 'stationery', name: 'Stationery', glyph: 'fy.pen', c: '#5856d6' },
    { id: 'electronics', name: 'Electronics', glyph: 'bolt.fill', c: '#6e7781' },
    { id: 'apparel', name: 'Apparel', glyph: 'fy.shirt', c: '#d6372a' },
    { id: 'food', name: 'Food', glyph: 'fy.bowl', c: '#e8890c' },
    { id: 'auctions', name: 'Auctions', glyph: 'fy.gavel', c: '#a0522d' },
  ];

  // auction state at 23:47 Fri: proxy maxima (hidden) + the visible bid history
  const LOTS = {
    lot_teaset: {
      bidders: { jade_connoisseur_88: { max: 11800, t: '-0 21:12', score: 1204 }, harborside_collector: { max: 11000, t: '-0 22:52', score: 377 } },
      price: 11200, leader: 'jade_connoisseur_88',
      hist: [
        ['-5 00:41', 'qingce_potter', 2800], ['-5 09:12', 'liuli_regular', 3000], ['-5 21:48', 'qingce_potter', 3200], ['-4 13:30', 'stone_and_tea', 3400],
        ['-4 19:02', 'liuli_regular', 3800], ['-4 23:15', 'stone_and_tea', 4000], ['-3 08:44', 'old_harbor_ink', 4400], ['-3 21:15', 'mingxing_appraiser', 5000],
        ['-2 07:20', 'stone_and_tea', 5400], ['-2 10:03', 'mingxing_appraiser', 5600], ['-2 22:31', 'old_harbor_ink', 6400], ['-1 07:50', 'mingxing_appraiser', 7000],
        ['-1 12:12', 'yujing_scholar', 7400], ['-1 18:22', 'harborside_collector', 7800], ['-1 23:59', 'old_harbor_ink', 8600], ['-0 09:16', 'harborside_collector', 9400],
        ['-0 14:40', 'jade_connoisseur_88', 9600], ['-0 18:05', 'harborside_collector', 10200], ['-0 18:05', 'jade_connoisseur_88', 10400, 1],
        ['-0 22:52', 'harborside_collector', 11000], ['-0 22:52', 'jade_connoisseur_88', 11200, 1],
      ],
      events: [{ at: '+1 00:08', who: 'mingxing_appraiser', max: 11400, score: 912 }],
      runnerUp: 'jade_connoisseur_88',
    },
    lot_print: {
      bidders: { yunjin_fanclub_ly: { max: 1700, t: '-0 20:40', score: 88 }, opera_auntie: { max: 1450, t: '-0 19:10', score: 230 } },
      price: 1500, leader: 'yunjin_fanclub_ly',
      hist: [['-2 12:00', 'opera_auntie', 400], ['-1 15:20', 'heyu_regular', 800], ['-1 22:10', 'opera_auntie', 1100], ['-0 19:10', 'opera_auntie', 1450], ['-0 20:40', 'yunjin_fanclub_ly', 1500]],
      events: [{ at: '+1 21:40', who: 'kaz_poet', max: 1950, score: 64 }],
    },
    lot_seal: {
      bidders: { guyun_ceramics: { max: 3900, t: '-1 10:00', score: 640 }, mingxing_appraiser: { max: 3350, t: '-0 16:30', score: 912 } },
      price: 3450, leader: 'guyun_ceramics',
      hist: [['-4 09:00', 'stone_and_tea', 1800], ['-3 18:30', 'guyun_ceramics', 2400], ['-2 11:15', 'old_harbor_ink', 2900], ['-0 16:30', 'mingxing_appraiser', 3350], ['-0 16:30', 'guyun_ceramics', 3450, 1]],
      events: [{ at: '+2 19:52', who: 'old_harbor_ink', max: 4300, score: 455 }],
    },
  };

  // saved addresses (place ids from STORY.md)
  const ADDRS = [
    { id: 'apartment', label: 'Home', name: 'Ajax', line: 'Pier View Residences, 2207', city: 'Liyue Harbor', icon: 'house.fill', saved: true },
    { id: 'wangsheng', label: 'Wangsheng Funeral Parlor', name: 'Zhongli (c/o the Director)', line: 'Feiyun Slope', city: 'Liyue Harbor', icon: 'fy.lantern', saved: true },
    { id: 'airport', label: 'LHI Airport — Arrivals parcel desk', name: 'Hold for pickup', line: 'Liyue Harbor International, Arrivals Hall', city: 'Liyue Harbor', icon: 'airplane', point: true },
    { id: 'liyue-grand', label: 'Liyue Harbor Grand Hotel', name: 'Front desk — hold for guest', line: 'Harbor Road', city: 'Liyue Harbor', icon: 'building.2', point: true },
    { id: 'wangshu', label: 'Wangshu Inn', name: 'Reception — Verr Goldet', line: 'Dihua Marsh road', city: 'Liyue countryside', icon: 'bed.double.fill', point: true, far: true },
    { id: 'player-home', label: 'Chihu Rock, Lane 3', name: '(no name)', line: 'Chihu Rock, Lane 3', city: 'Liyue Harbor', icon: 'mappin.fill', hidden: true },
  ];
  // who signs for parcels
  const SIGNER = { apartment: 'Left with the concierge, Pier View Residences', wangsheng: 'Signed for by: HU TAO (Director) 👻', airport: 'Held at the LHI Arrivals parcel desk', 'liyue-grand': 'Received by the front desk, Liyue Harbor Grand Hotel', wangshu: 'Signed for by: Verr Goldet, Wangshu Inn', 'player-home': 'Left at the door, Chihu Rock, Lane 3', morepesok: 'Delivered to 4 Pristan Lane, Morepesok' };

  // past orders (consistent with STORY.md); steps = [paid, packed, out, delivered]
  const ORDERS = [
    { id: 'fo_1015_line', seller: 'hydro', items: [{ pid: 'fish_line', title: 'HYDRO·CARBON braided line, 300 m, 20 lb', qty: 2, price: 138, art: 'fy_line', opt: '20 lb' }], total: 276, t: '-1 08:14', to: 'apartment', steps: ['-1 08:14', '-1 09:40', '-1 11:05', '-1 12:02'], carrier: 'Feiyun Swift Courier', track: 'FS 8817 2264 01', reviewed: 5 },
    { id: 'fo_0927_tea', seller: 'jueyun', items: [{ pid: 'tea_tin', title: 'Jueyun Premium Oolong, 250 g gift tin', qty: 1, price: 368, art: 'mk_tea_tin' }], total: 368, t: '2026-09-27 19:20', to: 'wangsheng', note: 'So you stop drinking mine. — C.', steps: ['2026-09-27 19:20', '2026-09-28 09:30', '2026-09-28 11:10', '2026-09-28 12:15'], carrier: 'Feiyun Swift Courier', track: 'FS 7731 0920 44', gift: true },
    { id: 'fo_0718_rod', seller: 'hydro', items: [{ pid: 'rod_hydro', title: 'HYDRO·CARBON 2.7 m sea rod + 4000 reel combo', qty: 1, price: 1980, art: 'mk_rod' }], total: 1980, t: '2026-07-18 22:47', to: 'wangsheng', note: 'Happy birthday. I have arranged to settle this with you later. — Z.', steps: ['2026-07-18 22:47', '2026-07-19 09:10', '2026-07-19 10:40', '2026-07-19 11:30'], carrier: 'Feiyun Swift Courier', track: 'FS 6602 0719 18', gift: true, device: 'Ordered from: iPad (Pier View Residences)' },
    { id: 'fo_0514_cage', seller: 'bamboo', items: [{ pid: 'birdcage', title: 'Antique-style bamboo birdcage, hand-split, Qingce workshop', qty: 1, price: 1680, art: 'mk_birdcage' }], total: 1680, t: '2026-05-14 21:03', to: 'wangsheng', note: 'Xiansheng — for the thrush. Don’t tell me what it costs, I already know.', steps: ['2026-05-14 21:03', '2026-05-15 08:40', '2026-05-15 13:00', '2026-05-15 15:22'], carrier: 'Feiyun Swift Courier', track: 'FS 5124 0515 09', gift: true, reviewed: 5 },
    { id: 'fo_1215_gg', seller: 'mingyun', items: [{ pid: 'toy_gg_frostfang', title: 'Glacier Guardians figure: Frostfang Ranger (Wave 2)', qty: 1, price: 240, art: 'fy_gg_figure' }], total: 312, ship: 72, t: '2025-12-12 20:31', to: 'morepesok', toLabel: '4 Pristan Lane, Morepesok', note: 'Merry Christmas Teucer!! From the Northland Toys head office 🧸 — big brother', steps: ['2025-12-12 20:31', '2025-12-13 10:00', '2025-12-28 09:20', '2025-12-29 11:48'], carrier: 'Feiyun Global → Snezhnaya Post', track: 'FG 2025 1213 7781 SN', gift: true, intl: true },
  ];

  // seller chats (history before the player arrives); [time, from: 'me' | 'seller', text, extra]
  const CHATS = [
    { id: 'linlang', seller: 'linlang', product: 'lot_teaset', msgs: [
      ['-0 22:44', 'me', 'hi! the celadon set. is it complete? any chips?'],
      ['-0 22:58', 'seller', 'Good evening. Complete: the pot and five cups. No chips. One hairline in the foot ring of cup 3, photographed.'],
      ['-0 23:01', 'me', 'where did it come from?'],
      ['-0 23:19', 'seller', 'An old family near Qingce. They asked me not to put their name anywhere, and I keep my word. Bidding closes at half past midnight.'],
    ] },
    { id: 'mingyun', seller: 'mingyun', msgs: [
      ['-6 19:02', 'me', 'do you ship Glacier Guardians to Snezhnaya before winter break?'],
      ['-6 19:08', 'seller', 'We do! Feiyun Global, 10–14 days to Morepesok. Last year a very nice customer sent Frostfang there for Christmas 🎄'],
      ['-6 19:09', 'me', 'that was me lol'],
      ['-6 19:10', 'seller', 'Then welcome back! The Frost Fortress is in stock — last two in Liyue.'],
    ] },
    { id: 'bamboo', seller: 'bamboo', msgs: [
      ['2026-05-14 20:40', 'me', 'is the birdcage good for a thrush? asking for a friend who will lecture me if it isn’t'],
      ['2026-05-14 21:30', 'seller', 'It is. Order placed — we’ll deliver to Wangsheng tomorrow.'],
      ['2026-05-16 10:12', 'seller', 'The gentleman who received the cage came by the workshop to thank us. He spoke about bamboo for forty minutes. My father has asked if he would like a job.'],
    ] },
    { id: 'qingce', seller: 'qingce', msgs: [
      ['-2 12:05', 'seller', 'Rite of Parting notice: this week we deliver glaze lilies to Wangsheng Funeral Parlor every morning from 06:30. Tribute bouquets include a handwritten card.'],
    ] },
  ];

  // canned seller replies: [regex, reply] tried in order; `fallback` when nothing matches
  const REPLIES = {
    linlang: {
      rules: [
        [/where|from|provenance|origin|owner|who (sold|owned|had)|family|consign/i, 'An old family near Qingce. That is all the paperwork says, and all I will say. Some things should be bought, not explained.'],
        [/real|authentic|fake|genuine|old|age|date|era|guizhong/i, 'It is exactly as old as it looks. Which is older than it looks.'],
        [/photo|picture|base|mark|bottom|inscri|stamp/i, (s) => (s.won ? 'You have the photo of the base now. I suggest you show it to whoever you bought this for. Gently.' : 'Full base photos go to the winning bidder. House rule. The mark is… worth winning for.')],
        [/end early|buy now|sell (it )?now|offer|private|outside/i, 'Tempting, dear. No. The consignor wants it to run until half past midnight.'],
        [/chip|crack|condition|damage|hairline/i, 'One hairline in the foot ring of cup 3. Nothing else. I have handled it with gloves, as one should.'],
        [/jade_connoisseur|rival|other bidder|outbid/i, 'I don’t discuss my bidders. That one has been very keen all week, though.'],
        [/thank|thanks|ty/i, 'You’re welcome. Bid or don’t — either way, good night.'],
      ],
      fallback: 'I answer questions about the lot. Some of them.',
    },
    mingyun: {
      rules: [
        [/stock|available|left/i, 'In stock and ready to ship! Order before 18:00 for same-day delivery in the harbor.'],
        [/wrap|gift|note/i, 'Free gift wrap in Glacier Guardians paper on every order 🎁 Add your note at checkout.'],
        [/airport|hotel|grand|deliver|ship|arrive|when/i, 'We deliver anywhere in Liyue Harbor, including the LHI parcel desk and hotel front desks. Next morning for late orders.'],
        [/snezhnaya|morepesok|abroad|international/i, 'Feiyun Global ships to Snezhnaya in 10–14 days.'],
        [/rime|frostfang|sleet|figure/i, 'The Frost Fortress includes Captain Rime, Frostfang and Little Sleet!'],
      ],
      fallback: 'Thanks for your message! Our team will get back to you shortly 🧸',
    },
    qingce: {
      rules: [
        [/sunday|rite|before|morning|when|time/i, 'We go up to Wangsheng every morning from 06:30 this week. Order tonight and the lilies are on the Director’s desk by breakfast.'],
        [/card|note|message|write/i, 'Ms. Lan writes every card by hand. Up to 200 characters.'],
        [/fresh|last|vase/i, 'Cut at dawn the day they ship. 7–10 days in a vase if you change the water.'],
        [/wangsheng|parlor|parlour|funeral/i, 'Half our lilies go to the parlor this week. It is a busy time to be remembered.'],
      ],
      fallback: 'Thank you! We’ll reply as soon as we’re out of the fields 🌿',
    },
    snezh: {
      rules: [[/engrav/i, 'Engraving up to 12 characters, Latin or Snezhnayan, adds 2 days. Send us the text after ordering.'], [/nib|fine|medium|broad/i, 'Fine for small handwriting, Medium for most, Broad for signatures and drama.'], [/gift|box|card/i, 'Every pen ships in our gift box with a bottle of ink and a blank card.']],
      fallback: 'Thank you for writing to SNEZHNAYA Atelier. A specialist will reply shortly.',
    },
    wangsheng: {
      rules: [[/coffin|half price|sale/i, 'Autumn sale: 2nd coffin half price!! In parlor only, ask for the Director~ 👻'], [/lantern|rite/i, 'Our lanterns are fire-safe, river-safe and ghost-approved. Order by Saturday 18:00 for the Rite~'], [/zhongli|consultant/i, 'Our consultant is very busy organising a very important funeral. He says hello. Probably.']],
      fallback: 'Wangsheng Funeral Parlor, how may we bury you today? (A human will reply soon. Or a ghost. 👻)',
    },
    bamboo: { rules: [[/thrush|bird|finch/i, 'Every cage we make is good for a thrush. Some gentlemen will tell you why for forty minutes.']], fallback: 'Thank you. We read messages in the evening, after the bamboo.' },
  };
  const DEFAULT_REPLY = 'Thanks for your message! The seller usually replies within a few hours.';

  // suggestion chips in a seller chat
  const QUICK = {
    linlang: ['Where is the set from?', 'Is it authentic?', 'Can I see the base?', 'Will you end it early?'],
    mingyun: ['Is it in stock?', 'Can you gift wrap?', 'Can you deliver to the airport?'],
    qingce: ['Can you deliver before the Rite?', 'Who writes the card?', 'How long do they last?'],
    snezh: ['Can it be engraved?', 'Which nib for a student?', 'Does it come in a gift box?'],
    wangsheng: ['Will lanterns arrive before Sunday?', 'Tell me about the coffin sale'],
    _: ['Is this in stock?', 'When will it arrive?', 'Can you gift wrap?'],
  };

  const TRENDING = ['memorial lanterns', 'glaze lily delivery', 'Frost Fortress', 'Rite of Parting coin', 'celadon tea set', 'pelmeni', 'fountain pen', 'braided line'];
  const RECENT = ['celadon', 'glacier guardians', 'braided line 20lb', 'glaze lily'];
  // shown in "Picks for you" first (Childe's history: fishing, toys for Teucer, tea for xiansheng)
  const PICKS = ['toy_frost_fortress', 'pen_tonia', 'lilies_wangsheng', 'toy_sirfang', 'fish_lures', 'tea_tin', 'powerbank', 'scarf', 'rite_lanterns', 'food_pelmeni', 'elec_case', 'coin_rite', 'toy_bluefin', 'fish_line', 'app_beanie', 'birdcage', 'food_hotpot', 'stat_notebook', 'elec_charm', 'flowers_lily6', 'rod_hydro', 'tea_milk', 'food_borscht', 'toy_gg_rime', 'stat_postcards', 'food_ukha', 'food_almond'];

  JC.feiyunData = { P, CATS, SELLERS, SHIP, LOTS, ADDRS, SIGNER, ORDERS, CHATS, REPLIES, DEFAULT_REPLY, QUICK, TRENDING, RECENT, PICKS };
})();
