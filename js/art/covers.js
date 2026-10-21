/* Album and playlist covers (600×600) for Childe's Music library. Fictional records only. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- helpers ----------------------------------------------------------------------------
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 600 600"><defs>${defs}</defs>${body}</svg>`;
  const f = (n) => Math.round(n * 10) / 10;
  let S = 1;
  const seed = (n) => { S = n; };
  const rnd = () => (S = (S * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = "Georgia, 'Times New Roman', serif";
  const T = (x, y, s, size, o = {}) =>
    `<text x="${x}" y="${y}" font-family="${o.serif ? SERIF : FONT}" font-size="${size}" font-weight="${o.w || 400}" fill="${o.fill || '#fff'}" text-anchor="${o.a || 'middle'}"` +
    `${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.it ? ' font-style="italic"' : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${o.x || ''}>${s}</text>`;
  // Light film/paper grain (the single feTurbulence per image).
  const GRAIN = (freq = 0.8, k = 0.5) =>
    `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" stitchTiles="stitch"/>` +
    `<feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 ${k} 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  const grain = (op = 0.35, blend = 'overlay') => `<rect width="600" height="600" filter="url(#gr)" opacity="${op}" style="mix-blend-mode:${blend}"/>`;
  const dots = (n, x0, x1, y0, y1, r0, r1) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const r = rr(r0, r1), x = rr(x0, x1), y = rr(y0, y1);
      d += `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0`;
    }
    return d;
  };
  // Tapered ribbon along a cubic Bézier (for plumes, slashes, brush strokes).
  function taper(p, w0, w1, n = 26) {
    const at = (t) => {
      const u = 1 - t;
      return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
    };
    const L = [], R = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, a = at(Math.max(0, t - 0.01)), b = at(Math.min(1, t + 0.01)), c = at(t);
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const m = Math.hypot(nx, ny) || 1, w = (w0 + (w1 - w0) * t) / 2;
      nx /= m; ny /= m;
      L.push(`${f(c[0] + nx * w)} ${f(c[1] + ny * w)}`);
      R.push(`${f(c[0] - nx * w)} ${f(c[1] - ny * w)}`);
    }
    return 'M' + L.join('L') + 'L' + R.reverse().join('L') + 'Z';
  }
  const star5 = (cx, cy, r, rot = 0, k = 0.45) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = ((i * 36 + rot - 90) * Math.PI) / 180, rad = i % 2 ? r * k : r;
      d += (i ? 'L' : 'M') + f(cx + Math.cos(a) * rad) + ' ' + f(cy + Math.sin(a) * rad);
    }
    return d + 'Z';
  };

  // ---- Songs of the Frozen Sea (woodcut) ---------------------------------------------------
  def('cover_snezh_folk', {
    title: 'Songs of the Frozen Sea',
    w: 600, h: 600, tags: ['cover', 'music', 'snezhnaya'],
    svg: () => {
      const INK = '#1a2738', PAPER = '#ece2cb', RED = '#b3343a';
      seed(4);
      let rings = '';
      for (let r = 70; r < 520; r += 15) rings += `M${430 - r} 132a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
      let waves = '';
      for (let row = 0; row < 9; row++) {
        const y = 318 + row * 15 + row * row * 0.6, step = 26 + row * 3, off = (row % 2) * step * 0.5;
        let d = `M${f(20 - off)} ${f(y)}`;
        for (let x = 20 - off; x < 600; x += step) d += `q${f(step * 0.25)} ${f(-7 - row * 0.5)} ${f(step * 0.5)} 0t${f(step * 0.5)} 0`;
        waves += `<path d="${d}" fill="none" stroke="${PAPER}" stroke-width="${f(1.4 + row * 0.32)}" stroke-linecap="round"/>`;
      }
      let hatch = '';
      for (let i = 0; i < 14; i++) hatch += `M${148 + i * 9} 352l-6 12`;
      return svg(
        GRAIN(0.9, 0.55) +
        `<clipPath id="bk"><path d="M32 34Q300 28 568 33L566 438Q300 444 34 437Z"/></clipPath>` +
        `<clipPath id="sky"><rect x="30" y="30" width="540" height="300"/></clipPath>`,
        `<rect width="600" height="600" fill="${PAPER}"/>` +
        `<g clip-path="url(#bk)"><rect width="600" height="600" fill="${INK}"/>` +
        `<path clip-path="url(#sky)" d="${rings}" fill="none" stroke="${PAPER}" stroke-width="1.3" opacity=".32"/>` +
        `<circle cx="430" cy="132" r="54" fill="${PAPER}"/>` +
        `<path d="M400 112q16-6 30 2M412 150q18 6 34-4M446 116q8 6 10 18" fill="none" stroke="${INK}" stroke-width="2.2" opacity=".55" stroke-linecap="round"/>` +
        // far ice cliffs
        `<path d="M30 300L70 252L96 270L130 236L170 286L210 268L240 300Z" fill="${PAPER}"/>` +
        `<path d="M70 252L80 300M130 236L136 300M96 270L102 300M170 286L176 300" stroke="${INK}" stroke-width="2.5"/>` +
        `<path d="M470 300L500 274L528 282L556 262L570 270V300Z" fill="${PAPER}"/><path d="M500 274L506 300M556 262L552 300" stroke="${INK}" stroke-width="2.5"/>` +
        `<path d="M30 300H570" stroke="${PAPER}" stroke-width="2"/>` +
        waves +
        // ice floes
        `<path d="M40 420L74 404L132 410L150 426L60 432Z" fill="${PAPER}"/><path d="M80 412l-8 14M96 410l-8 16M112 411l-8 16" stroke="${INK}" stroke-width="2"/>` +
        `<path d="M440 400L482 390L540 396L556 414L452 418Z" fill="${PAPER}"/><path d="M470 398l-6 14M488 394l-6 18M506 395l-6 18M524 396l-6 18" stroke="${INK}" stroke-width="2"/>` +
        // the boat
        `<g transform="rotate(-4 220 340)">` +
        `<path d="M226 238V336" stroke="${PAPER}" stroke-width="5"/>` +
        `<path d="M230 246L300 312H230Z" fill="${RED}"/><path d="M236 262l20 20M236 280l26 26M236 298l12 12" stroke="${INK}" stroke-width="2" opacity=".5"/>` +
        `<path d="M222 252L170 314H222Z" fill="${PAPER}"/><path d="M214 276l-18 22M216 292l-10 14" stroke="${INK}" stroke-width="2"/>` +
        `<path d="M126 330H320L296 368Q220 378 150 366Z" fill="${PAPER}"/>` +
        `<path d="M136 342H312M146 356H302" stroke="${INK}" stroke-width="2.4"/>` +
        `<path d="M${hatch.slice(1)}" stroke="${INK}" stroke-width="1.6"/>` +
        `<path d="M300 312V330" stroke="${PAPER}" stroke-width="3"/><circle cx="300" cy="306" r="7" fill="#f2c45a"/><circle cx="300" cy="306" r="16" fill="#f2c45a" opacity=".25"/>` +
        `<path d="M126 330Q140 322 160 326Q200 320 236 326Q280 320 320 330" fill="none" stroke="${PAPER}" stroke-width="4"/></g>` +
        // snow
        `<path d="${dots(90, 34, 566, 34, 430, 1.2, 3.6)}" fill="${PAPER}"/>` +
        `</g>` +
        `<path d="M32 34Q300 28 568 33L566 438Q300 444 34 437Z" fill="none" stroke="${INK}" stroke-width="2"/>` +
        T(300, 474, 'SONGS OF THE', 17, { serif: 1, fill: INK, ls: 9, w: 700 }) +
        T(300, 524, 'FROZEN SEA', 50, { serif: 1, fill: INK, ls: 7, w: 700 }) +
        `<path d="M150 544H260M340 544H450" stroke="${RED}" stroke-width="2"/><path d="M292 544l8-6 8 6-8 6Z" fill="${RED}"/>` +
        T(300, 572, 'MOREPESOK FISHERMEN’S CHOIR', 12, { fill: RED, ls: 4, w: 700 }) +
        grain(0.55, 'multiply')
      );
    },
  });

  // ---- Yun Jin: The Divine Damsel (opera) --------------------------------------------------
  def('cover_yunjin_opera', {
    title: 'Yun Jin — The Divine Damsel',
    w: 600, h: 600, tags: ['cover', 'music', 'opera', 'yunjin'],
    svg: () => {
      const SIL = '#2a0609', GOLD = '#e8bd62';
      const cloud = (x, y, s) =>
        `<path transform="translate(${x} ${y}) scale(${s})" d="M-40 0C-40-18-22-24-12-14C-10-30 14-32 18-14C30-22 46-10 38 4C50 8 44 22 30 20H-34C-48 20-50 4-40 0ZM-12-14C-6-6 4-6 6-14M18-14C22-6 30-4 38 4" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`;
      const pom = (x, y, r, c) => `<path d="M${x} ${y + r}V${y + r + 14}" stroke="${SIL}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${f(x - r * 0.35)}" cy="${f(y - r * 0.35)}" r="${f(r * 0.3)}" fill="#fff" opacity=".35"/>`;
      const C1 = [[288, 206], [262, 120], [330, 30], [470, 2]], C2 = [[318, 206], [330, 140], [430, 96], [640, 70]];
      const P1 = taper(C1, 20, 9), P2 = taper(C2, 18, 8);
      const cd = (c) => `M${c[0]}C${c[1]} ${c[2]} ${c[3]}`;
      return svg(
        rg('bg', [[0, '#c4262c'], [0.6, '#8e1418'], [1, '#4e080b']], 0.5, 0.42, 0.75) +
        rg('halo', [[0, '#ffe7a8'], [0.55, '#f0c463'], [0.85, '#c98f2e'], [1, '#a46d1c']], 0.45, 0.4, 0.6) +
        lg('btm', [[0, '#3a0508', 0], [1, '#3a0508', 0.75]]) +
        `<clipPath id="pl"><path d="${P1}${P2}"/></clipPath>`,
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<g opacity=".35">${cloud(80, 90, 1.1)}${cloud(520, 250, 0.9)}${cloud(70, 420, 0.9)}${cloud(540, 470, 1.2)}${cloud(150, 230, 0.7)}</g>` +
        `<path d="M24 24H576V576H24Z" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".7"/><path d="M34 34H566V566H34Z" fill="none" stroke="${GOLD}" stroke-width="1" opacity=".5"/>` +
        `<circle cx="292" cy="290" r="176" fill="url(#halo)"/>` +
        `<circle cx="292" cy="290" r="150" fill="none" stroke="#fff3cf" stroke-width="1.5" opacity=".5"/><circle cx="292" cy="290" r="124" fill="none" stroke="#b27a22" stroke-width="1" opacity=".5"/>` +
        // plumes
        `<path d="${P1}${P2}" fill="${SIL}" stroke="${GOLD}" stroke-width="1.6"/>` +
        `<path clip-path="url(#pl)" d="${cd(C1)}${cd(C2)}" fill="none" stroke="${GOLD}" stroke-width="22" stroke-dasharray="2.5 8" opacity=".55"/>` +
        `<path d="${cd(C1)}${cd(C2)}" fill="none" stroke="#f7dfa0" stroke-width="1.2" opacity=".8"/>` +
        // silhouette: profile facing left
        `<path d="M262 252Q248 270 250 284L246 298Q246 304 249 306L236 324Q240 330 247 331L244 339L248 344L245 351Q246 362 256 366Q266 372 276 372L282 402Q262 420 248 444Q220 500 214 600H440Q430 500 404 450Q384 420 344 398Q336 380 344 360Q358 330 352 296Q350 268 340 254Q302 236 262 252Z" fill="${SIL}"/>` +
        // headdress
        `<path d="M248 262Q256 214 300 206Q344 204 356 248Q358 262 350 270Q300 252 252 272Z" fill="${SIL}" stroke="${GOLD}" stroke-width="2"/>` +
        `<path d="M260 248Q300 232 348 246" fill="none" stroke="${GOLD}" stroke-width="2.5"/>` +
        pom(264, 214, 13, '#e8434c') + pom(288, 194, 15, '#f2c45a') + pom(316, 192, 15, '#e8434c') + pom(342, 208, 13, '#f2c45a') +
        `<circle cx="254" cy="258" r="12" fill="${SIL}" stroke="${GOLD}" stroke-width="2"/><circle cx="254" cy="258" r="5" fill="#e8434c"/>` +
        // bead tassels behind the head
        `<path d="M352 262Q366 320 362 392M362 258Q380 312 378 380" fill="none" stroke="${GOLD}" stroke-dasharray="1 7" stroke-linecap="round" stroke-width="4"/>` +
        `<circle cx="362" cy="398" r="5" fill="#e8434c"/><circle cx="378" cy="386" r="5" fill="#e8434c"/>` +
        // collar trim
        `<path d="M262 426Q300 452 372 424" fill="none" stroke="${GOLD}" stroke-width="2.5"/>` +
        `<path d="M232 470q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0q11 13 22 0" fill="none" stroke="${GOLD}" stroke-width="2" opacity=".85"/><path d="M243 484l0 8M265 484l0 8M287 484l0 8M309 484l0 8M331 484l0 8M353 484l0 8M375 484l0 8M397 484l0 8" stroke="#e8434c" stroke-width="4" stroke-linecap="round"/>` +
        // type
        `<g font-family="${SERIF}" fill="${GOLD}" font-size="26" text-anchor="middle" opacity=".9">${['神', '女', '劈', '观'].map((c, i) => `<text x="68" y="${200 + i * 34}">${c}</text>`).join('')}</g>` +
        `<rect x="56" y="342" width="24" height="24" fill="#e8434c"/>` +
        `<rect y="440" width="600" height="160" fill="url(#btm)"/>` +
        `<rect x="140" y="482" width="320" height="2" fill="${GOLD}" opacity=".7"/>` +
        T(300, 532, 'YUN JIN', 52, { serif: 1, w: 700, fill: GOLD, ls: 12 }) +
        T(300, 562, 'THE DIVINE DAMSEL', 15, { serif: 1, fill: '#f7e3b2', ls: 7, it: 1 })
      );
    },
  });

  // ---- lullabies for teucer (crayon) -------------------------------------------------------
  def('cover_lullaby', {
    title: 'lullabies for teucer',
    w: 600, h: 600, tags: ['cover', 'music', 'teucer'],
    svg: () => {
      seed(21);
      let scrib = '';
      for (let i = 0; i < 22; i++) {
        const y = rr(20, 590), x = rr(-40, 400), L = rr(120, 300);
        scrib += `M${f(x)} ${f(y)}q${f(L / 4)} ${f(rr(-8, 8))} ${f(L / 2)} 0t${f(L / 2)} 0`;
      }
      let zz = '';
      for (let i = 0; i < 16; i++) zz += `M${410 + i * 7} ${f(120 - Math.sqrt(Math.max(0, 70 * 70 - (i * 7 - 50) ** 2)) * 0.9)}l14 ${f(Math.sqrt(Math.max(0, 70 * 70 - (i * 7 - 50) ** 2)) * 1.7)}`;
      const fish = (x, y, s, c, c2, flip) =>
        `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">` +
        `<path d="M-60 0C-40-34 20-38 46-6L76-30Q70 0 76 30L46 6C20 38-40 34-60 0Z" fill="${c}" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/>` +
        `<path d="M-6-26Q4-8-6 24M12-24Q20-6 12 22" fill="none" stroke="${c2}" stroke-width="3"/>` +
        `<circle cx="-36" cy="-6" r="7" fill="#fff"/><circle cx="-38" cy="-6" r="3.5" fill="#1b2240"/>` +
        `<path d="M-54 8Q-48 12-42 8" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/></g>`;
      return svg(
        lg('bg', [[0, '#1b2b55'], [0.6, '#2c4a83'], [1, '#4a6fa8']]) + rg('mg', [[0, '#f6d77a', 0.35], [1, '#f6d77a', 0]]) +
        `<filter id="cr" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" result="n"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
        `<feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.2 2.3" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>`,
        `<rect width="600" height="600" fill="url(#bg)"/><circle cx="440" cy="140" r="170" fill="url(#mg)"/>` +
        `<g filter="url(#cr)">` +
        `<path d="${scrib}" fill="none" stroke="#6f8fca" stroke-width="10" opacity=".35" stroke-linecap="round"/>` +
        // moon
        
        `<path d="M470 52A100 100 0 1 0 540 210A84 84 0 1 1 470 52Z" fill="#f7d774" stroke="#e8b84a" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M404 128q12 12 26 0M418 170q14 10 30 0" fill="none" stroke="#6e4a16" stroke-width="6" stroke-linecap="round"/>` +
        `<circle cx="402" cy="160" r="10" fill="#f2a08a" opacity=".7"/>` +
        `<path d="M446 64q-8 20 6 40" fill="none" stroke="#fff3c4" stroke-width="5" stroke-linecap="round" opacity=".7"/>` +
        // stars
        `<path d="${star5(96, 92, 22, 8)}${star5(232, 60, 15, -10)}${star5(318, 168, 12, 6)}${star5(560, 300, 14, 12)}${star5(130, 250, 11, -4)}${star5(520, 40, 10, 0)}" fill="#ffe89a" stroke="#f2c54e" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="${dots(30, 20, 580, 20, 360, 2, 4)}" fill="#fff6cf"/>` +
        // fish swimming in the sky
        fish(222, 300, 1.15, '#f39a4e', '#c3622a', false) + fish(430, 360, 0.75, '#8fd3f0', '#4f9cc6', true) + fish(110, 380, 0.55, '#f7c96a', '#c99230', true) +
        `<path d="M300 280q-8-10 0-18q10-6 6-16M318 262q-6-8 2-14M70 360q-6-8 2-14" fill="none" stroke="#bfe6ff" stroke-width="3" stroke-linecap="round"/>` +
        `<circle cx="296" cy="252" r="6" fill="none" stroke="#bfe6ff" stroke-width="3"/><circle cx="312" cy="236" r="4" fill="none" stroke="#bfe6ff" stroke-width="2.5"/>` +
        // sea
        `<path d="M0 470q25-16 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0V600H0Z" fill="#203a6e"/>` +
        `<path d="M0 470q25-16 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0" fill="none" stroke="#9cc4f0" stroke-width="5"/>` +
        `<path d="M20 500q20-12 40 0t40 0M200 510q20-12 40 0t40 0M420 498q20-12 40 0t40 0" fill="none" stroke="#6f97d4" stroke-width="4"/>` +
        // title
        `<text x="300" y="556" font-family="${FONT}" font-size="40" font-weight="700" fill="#fdf3d2" text-anchor="middle" letter-spacing="1">lullabies for teucer</text>` +
        `<path d="M120 572q90 10 180 0t180 0" fill="none" stroke="#f39a4e" stroke-width="5" stroke-linecap="round"/>` +
        `</g>`
      );
    },
  });

  // ---- FIGHT MIX ---------------------------------------------------------------------------
  def('cover_fight_mix', {
    title: 'FIGHT MIX ⚔️',
    w: 600, h: 600, tags: ['cover', 'music', 'playlist', 'childe'],
    svg: () => {
      seed(9);
      let half = '';
      for (let y = 0; y < 14; y++) for (let x = 0; x < 14; x++) {
        const r = Math.max(0, 6 - (x + y) * 0.42);
        if (r > 0.4) half += `M${f(600 - x * 18 - r)} ${f(y * 18)}a${f(r)} ${f(r)} 0 1 0 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-r * 2)} 0`;
      }
      const blade = (rot) =>
        `<g transform="translate(300 250) rotate(${rot})">` +
        `<path d="M0 -150C26 -110 30 -40 12 40L0 56L-12 40C-6 -30 -12 -100 0 -150Z" fill="url(#bl)" stroke="#e9f8ff" stroke-width="3"/>` +
        `<path d="M0 -140C10 -100 12 -40 4 36" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>` +
        `<path d="M-30 56H30L24 68H-24Z" fill="#c8323c"/><rect x="-7" y="68" width="14" height="44" rx="4" fill="#0e2547"/><circle cy="120" r="9" fill="#c8323c"/></g>`;
      return svg(
        lg('bg', [[0, '#5cc0f5'], [0.45, '#2a86d6'], [1, '#0c2f66']], 0, 0, 0.4, 1) +
        lg('bl', [[0, '#d9f5ff'], [0.5, '#7fd3ff'], [1, '#2a9be6']], 0, 0, 1, 0) +
        lg('sl', [[0, '#fff', 0], [0.5, '#fff', 1], [1, '#fff', 0.2]], 0, 0, 1, 0),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<path d="${half}" fill="#bfe9ff" opacity=".35"/>` +
        // water slashes
        `<path d="${taper([[-20, 420], [140, 300], [380, 160], [640, 60]], 4, 26)}" fill="#e9f9ff" opacity=".9"/>` +
        `<path d="${taper([[-30, 520], [160, 420], [420, 360], [640, 220]], 3, 18)}" fill="#bfeaff" opacity=".7"/>` +
        `<path d="${taper([[620, 330], [480, 300], [300, 380], [120, 600]], 4, 34)}" fill="#fff" opacity=".85"/>` +
        `<path d="${dots(28, 380, 590, 40, 260, 2, 7)}${dots(18, 20, 200, 360, 520, 2, 6)}" fill="#e9f9ff" opacity=".85"/>` +
        blade(-28) + blade(28) +
        `<path d="M300 112l10 26 26 10-26 10-10 26-10-26-26-10 26-10Z" fill="#fff"/>` +
        // type
        `<g font-family="${FONT}" font-weight="900" font-style="italic" text-anchor="middle">` +
        `<text x="306" y="476" font-size="118" fill="#0a1f45" letter-spacing="-2">FIGHT</text>` +
        `<text x="300" y="470" font-size="118" fill="#fff" letter-spacing="-2">FIGHT</text>` +
        `<text x="306" y="566" font-size="92" fill="#0a1f45" letter-spacing="2">MIX</text>` +
        `<text x="300" y="560" font-size="92" fill="#fff" letter-spacing="2">MIX</text></g>` +
        `<path d="M40 498L570 470" stroke="#c8323c" stroke-width="7" stroke-linecap="round"/>` +
        `<g transform="translate(470 520) rotate(-8)"><rect x="-56" y="-18" width="112" height="34" rx="4" fill="#c8323c"/>` +
        T(0, 6, 'VOL. 11', 20, { w: 900, it: 1, ls: 1 }) + `</g>` +
        T(36, 40, 'PLAY LOUD · NO SKIPS', 13, { w: 800, a: 'start', ls: 3, fill: '#e9f9ff' })
      );
    },
  });

  // ---- harbor lofi -------------------------------------------------------------------------
  def('cover_harbor_lofi', {
    title: 'harbor lofi',
    w: 600, h: 600, tags: ['cover', 'music', 'liyue', 'night'],
    svg: () => {
      seed(33);
      let lights = '', refl = '';
      for (let i = 0; i < 26; i++) {
        const x = rr(130, 470), y = rr(318, 344), c = rnd() > 0.35 ? '#ffb45a' : '#ff7a5c';
        lights += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr(1.5, 3.2))}" fill="${c}"/>`;
        if (i % 2) refl += `<rect x="${f(x - 1.5)}" y="${f(352 + rr(0, 6))}" width="3" height="${f(rr(14, 40))}" fill="${c}" opacity=".45"/>`;
      }
      return svg(
        GRAIN(0.85, 0.6) +
        lg('wall', [[0, '#4b3a5e'], [1, '#2b2140']]) +
        lg('sky', [[0, '#1c1f45'], [0.55, '#4b3f7a'], [1, '#c77a8e']]) +
        lg('sea', [[0, '#3a3a6e'], [1, '#141634']]) +
        rg('lamp', [[0, '#ffc77a', 0.55], [1, '#ffc77a', 0]]) +
        lg('desk', [[0, '#5a3b35'], [1, '#2c1c1d']]) +
        rg('moon', [[0, '#fff3d6'], [0.6, '#ffe2b0'], [1, '#ffe2b0', 0]]) +
        `<clipPath id="win"><circle cx="300" cy="250" r="182"/></clipPath>`,
        `<rect width="600" height="600" fill="url(#wall)"/>` +
        `<circle cx="70" cy="380" r="300" fill="url(#lamp)"/>` +
        // view through the moon window
        `<g clip-path="url(#win)"><rect width="600" height="600" fill="url(#sky)"/>` +
        `<circle cx="390" cy="150" r="60" fill="url(#moon)"/><circle cx="390" cy="150" r="24" fill="#fff6e2"/>` +
        `<path d="${dots(26, 120, 480, 70, 220, 0.8, 1.8)}" fill="#fff" opacity=".7"/>` +
        `<path d="M110 330L140 230Q150 214 160 232L176 290L196 210Q206 192 218 212L240 300L262 330ZM380 330L404 244Q414 228 424 246L440 290L456 236Q464 222 474 238L500 330Z" fill="#3b3466"/>` +
        `<path d="M110 340L150 284Q160 270 170 286L190 312L210 296L240 330H330L360 300L380 316L410 290L440 320L500 340Z" fill="#2a2550"/>` +
        // pavilion roofs
        `<path d="M300 300h44v34h-44zM286 300q36-16 72 0l-6 4q-30-10-60 0zM292 286q30-14 60 0l-4 4q-26-8-52 0zM312 274l10-10 10 10z" fill="#1b1838"/>` +
        `<rect x="140" y="330" width="320" height="14" fill="#1b1838"/>` +
        lights +
        `<rect x="100" y="344" width="400" height="160" fill="url(#sea)"/>` + refl +
        `<path d="M200 380q20-4 40 0M330 400q24-4 48 0M150 420q30-4 60 0M380 440q20-4 40 0" stroke="#8f7fc0" stroke-width="2" opacity=".6"/>` +
        `<path d="M240 392h46l-6 8h-34z" fill="#141230"/><path d="M262 392v-26" stroke="#141230" stroke-width="2"/><circle cx="276" cy="384" r="3" fill="#ffb45a"/></g>` +
        // window frame + lattice corners
        `<circle cx="300" cy="250" r="182" fill="none" stroke="#2a1b26" stroke-width="18"/>` +
        `<circle cx="300" cy="250" r="190" fill="none" stroke="#7a4a3a" stroke-width="3" opacity=".6"/>` +
        `<g clip-path="url(#win)"><path d="M100 392H500M100 404H500" stroke="#2a1b26" stroke-width="6"/><path d="${Array.from({ length: 21 }, (_, i) => `M${110 + i * 19} 404V440`).join('')}" stroke="#2a1b26" stroke-width="4"/></g>` +
        // desk, tea, plant, books
        `<path d="M0 446H600V600H0Z" fill="url(#desk)"/><path d="M0 446H600" stroke="#8a5c4a" stroke-width="3"/>` +
        `<path d="M420 400q-10-16 4-28q12-12 2-28M440 404q-8-14 4-24q10-10 2-22" fill="none" stroke="#e8d8f0" stroke-width="3" opacity=".45" stroke-linecap="round"/>` +
        `<path d="M406 410H462L456 446Q434 454 412 446Z" fill="#a8cfc0"/><ellipse cx="434" cy="410" rx="28" ry="6" fill="#7a5a3a"/><path d="M462 418q16 2 12 14q-4 8-16 6" fill="none" stroke="#a8cfc0" stroke-width="5"/>` +
        `<path d="M120 446L112 402H168L160 446Z" fill="#b5654a"/>` +
        `<path d="M140 402C128 370 96 360 92 340C116 342 134 362 140 380C140 350 150 326 170 312C172 340 154 360 144 402Z" fill="#5f9a76"/><path d="M146 402C160 378 186 374 200 364C196 386 170 394 150 402Z" fill="#4c8263"/>` +
        // sleeping cat
        `<path d="M226 446C222 414 250 398 284 400C300 386 306 384 312 392L322 384L322 404C336 418 334 446 320 446Z" fill="#1d1630"/>` +
        `<path d="M232 446C210 446 206 430 224 428" fill="none" stroke="#1d1630" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="M298 410q6 4 12 0" fill="none" stroke="#ffc77a" stroke-width="2" opacity=".7"/>` +
        `<rect x="490" y="420" width="90" height="14" rx="2" fill="#6a5a8c"/><rect x="496" y="406" width="80" height="14" rx="2" fill="#c27a5a"/><rect x="486" y="434" width="96" height="12" rx="2" fill="#3f6a6a"/>` +
        // label
        `<g transform="translate(36 520)"><rect width="168" height="52" rx="6" fill="#f3e6d6"/>` +
        `<text x="16" y="34" font-family="${FONT}" font-size="26" font-weight="600" fill="#2b2140" letter-spacing="-.5">harbor lofi</text></g>` +
        T(564, 560, 'beats to fish to', 13, { a: 'end', fill: '#d9c6e8', op: 0.8, ls: 1 }) +
        grain(0.5)
      );
    },
  });

  // ---- Northland Bank Corporate Anthem (Official) ------------------------------------------
  def('cover_fatui_anthem', {
    title: 'Northland Bank Corporate Anthem (Official)',
    w: 600, h: 600, tags: ['cover', 'music', 'fatui', 'snezhnaya'],
    svg: () => {
      let rays = '';
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2, b = a + 0.06;
        rays += `M300 290L${f(300 + Math.cos(a) * 520)} ${f(290 + Math.sin(a) * 520)}L${f(300 + Math.cos(b) * 520)} ${f(290 + Math.sin(b) * 520)}Z`;
      }
      let flake = '';
      for (let i = 0; i < 8; i++) {
        flake += `<g transform="rotate(${i * 45} 300 290)"><path d="M300 290L292 236L300 196L308 236Z" fill="url(#ice)"/><path d="M300 228l-14-14M300 228l14-14" stroke="#eaf6ff" stroke-width="3" stroke-linecap="round"/></g>`;
      }
      const laurel = (side) => {
        let s = `<g transform="translate(300 0) scale(${side} 1) translate(-300 0)"><path d="M262 420C200 400 170 330 186 250" fill="none" stroke="url(#sil)" stroke-width="4"/>`;
        for (let i = 0; i < 7; i++) {
          const t = i / 7, x = 262 - 70 * Math.sin(t * 1.5) - t * 10, y = 418 - t * 168;
          s += `<path d="M${f(x)} ${f(y)}q-30-4-36-24q26 0 36 24Z" fill="url(#sil)"/><path d="M${f(x)} ${f(y)}q8-26 32-30q-6 24-32 30Z" fill="url(#sil)" opacity=".85"/>`;
        }
        return s + '</g>';
      };
      return svg(
        rg('bg', [[0, '#25447a'], [0.6, '#0f2148'], [1, '#060d22']], 0.5, 0.45, 0.7) +
        lg('sil', [[0, '#f4f8fc'], [0.45, '#9fb2c8'], [0.55, '#dfe8f2'], [1, '#6e8299']], 0, 0, 1, 1) +
        lg('ice', [[0, '#ffffff'], [0.5, '#aee0ff'], [1, '#4f9ad8']], 0, 0, 1, 0) +
        lg('sh', [[0, '#1d3a72'], [1, '#0b1838']]) +
        lg('rb', [[0, '#b52a34'], [1, '#7a121c']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<path d="${rays}" fill="#cfe6ff" opacity=".06"/>` +
        `<path d="M28 28H572V572H28Z" fill="none" stroke="#9fb2c8" stroke-width="1.5" opacity=".6"/>` +
        T(300, 68, 'NORTHLAND BANK GROUP PRESENTS', 11, { w: 600, fill: '#9fb2c8', ls: 5 }) +
        T(300, 110, 'CORPORATE ANTHEM', 40, { serif: 1, w: 700, fill: '#eef4fa', ls: 4 }) +
        T(300, 136, '(Official)', 18, { serif: 1, it: 1, fill: '#aec4dc', ls: 2 }) +
        `<g transform="translate(300 316) scale(.9) translate(-300 -300)">` +
        laurel(1) + laurel(-1) +
        // shield
        `<path d="M300 186L392 214V300C392 362 350 400 300 424C250 400 208 362 208 300V214Z" fill="url(#sh)" stroke="url(#sil)" stroke-width="6"/>` +
        `<path d="M300 200L380 224V300C380 354 344 388 300 410C256 388 220 354 220 300V224Z" fill="none" stroke="#9fb2c8" stroke-width="1.5" opacity=".6"/>` +
        `<g transform="translate(0 6) scale(1) ">${flake}</g>` +
        `<circle cx="300" cy="296" r="14" fill="#eaf6ff"/><circle cx="300" cy="296" r="7" fill="#c8323c"/>` +
        // crown
        `<path d="M262 186L270 152L286 172L300 140L314 172L330 152L338 186Z" fill="url(#sil)"/><circle cx="300" cy="138" r="5" fill="#aee0ff"/><circle cx="270" cy="150" r="4" fill="#aee0ff"/><circle cx="330" cy="150" r="4" fill="#aee0ff"/>` +
        // ribbon
        `<path d="M168 444L200 434L196 470L168 480L180 462Z" fill="#7a121c"/><path d="M432 444L400 434L404 470L432 480L420 462Z" fill="#7a121c"/>` +
        `<path d="M196 430Q300 456 404 430L404 466Q300 492 196 466Z" fill="url(#rb)"/>` +
        `<path id="rp" d="M200 456Q300 482 400 456" fill="none"/>` +
        `<text font-family="${SERIF}" font-size="15" font-weight="700" fill="#f4e6c8" letter-spacing="2.5" text-anchor="middle"><textPath href="#rp" xlink:href="#rp" startOffset="50%">NORTHLAND BANK</textPath></text></g>` +
        T(300, 522, 'Liyue Branch Choir &amp; the Zapolyarny Philharmonic', 12, { serif: 1, it: 1, fill: '#aec4dc', ls: 1 }) +
        // advisory box
        `<g transform="translate(300 548)"><rect x="-112" y="-18" width="224" height="34" fill="#f2f4f7"/><rect x="-108" y="-14" width="216" height="26" fill="none" stroke="#0b1838" stroke-width="1.5"/>` +
        T(0, -1, 'MANDATORY LISTENING', 12, { w: 900, fill: '#0b1838', ls: 2 }) + T(0, 10, 'ALL STAFF · ALL BRANCHES', 7.5, { w: 700, fill: '#0b1838', ls: 2 }) + `</g>`
      );
    },
  });

  // ---- Crux Shanties Vol. 2 ----------------------------------------------------------------
  def('cover_sea_shanties', {
    title: 'Crux Shanties Vol. 2',
    w: 600, h: 600, tags: ['cover', 'music', 'beidou', 'sea'],
    svg: () => {
      const NAVY = '#14294a';
      let claws = '';
      const crest = [[150, 230], [190, 196], [236, 182], [282, 190], [318, 214]];
      for (const [x, y] of crest) claws += `M${x} ${y}q-6-22 12-30q-4 14 6 18q-2-16 14-20q-6 14 4 22q2-10 12-10q-8 8-2 18Z`;
      let lines = '';
      for (let i = 1; i < 7; i++) lines += `M${40 + i * 6} ${600}C${80 + i * 8} ${460 - i * 6} ${110 + i * 14} ${300 + i * 14} ${200 + i * 10} ${236 + i * 14}`;
      let rays = '';
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + (i / 16) * Math.PI, b = a + 0.1;
        rays += `M470 250L${f(470 + Math.cos(a) * 600)} ${f(250 + Math.sin(a) * 600)}L${f(470 + Math.cos(b) * 600)} ${f(250 + Math.sin(b) * 600)}Z`;
      }
      return svg(
        GRAIN(0.9, 0.5) +
        lg('sky', [[0, '#f3e6c8'], [1, '#e2cfa6']]) +
        lg('wv', [[0, '#2a7f8f'], [0.5, '#1b5470'], [1, NAVY]], 0, 0, 1, 1) +
        lg('wv2', [[0, '#3d9aa6'], [1, '#1f5f78']]) +
        lg('sail', [[0, '#d03a3a'], [1, '#8e1c22']]),
        `<rect width="600" height="600" fill="url(#sky)"/>` +
        `<path d="${rays}" fill="#d9bf8a" opacity=".35"/>` +
        `<circle cx="470" cy="250" r="54" fill="#c8323c" opacity=".9"/>` +
        // lightning
        `<path d="M440 0L412 70L436 72L400 150L456 58L430 56L456 0Z" fill="#8a5fd8"/><path d="M560 60L540 112L556 114L530 170L574 102L556 100L574 60Z" fill="#8a5fd8"/>` +
        // ship on the back of the wave
        `<g transform="rotate(10 450 330)">` +
        `<path d="M444 150V316M500 172V312M398 196V318" stroke="#3a2a1e" stroke-width="5"/>` +
        `<path d="M448 156Q490 150 520 160L516 290Q486 282 448 290Z" fill="url(#sail)"/><path d="M448 182H519M448 208H518M448 234H517M448 260H516" stroke="#2a0e10" stroke-width="2.5"/>` +
        `<path d="M504 182Q532 180 552 190L548 288Q526 282 504 286Z" fill="url(#sail)"/><path d="M504 206H550M504 230H549M504 254H549" stroke="#2a0e10" stroke-width="2.5"/>` +
        `<path d="M400 204Q420 198 440 204L438 292Q420 288 400 292Z" fill="url(#sail)"/><path d="M400 226H439M400 248H438M400 270H438" stroke="#2a0e10" stroke-width="2.5"/>` +
        `<path d="M444 150l26-6-26-6Z" fill="#c8323c"/>` +
        `<path d="M360 312H560L540 346Q460 360 384 344Z" fill="#3a2a1e"/><path d="M360 312L344 290L380 312ZM540 312L570 296L560 314Z" fill="#3a2a1e"/>` +
        `<path d="M372 324H548" stroke="#e8bd62" stroke-width="3"/><circle cx="420" cy="334" r="4" fill="#e8bd62"/><circle cx="460" cy="336" r="4" fill="#e8bd62"/><circle cx="500" cy="336" r="4" fill="#e8bd62"/></g>` +
        // great wave
        `<path d="M0 600V420C60 360 90 300 130 250C170 200 236 170 296 190C340 206 352 240 330 262C312 280 280 270 290 248C252 240 226 270 236 310C250 380 360 400 450 380C520 364 570 344 600 330V600Z" fill="url(#wv)"/>` +
        `<path d="${lines}" fill="none" stroke="#7fc6cc" stroke-width="2.5" opacity=".55"/>` +
        `<path d="M130 250C170 200 236 170 296 190C340 206 352 240 330 262C312 280 280 270 290 248" fill="none" stroke="#f6efe0" stroke-width="12" stroke-linecap="round"/>` +
        `<path d="${claws}" fill="#f6efe0"/>` +
        `<path d="M236 310C250 380 360 400 450 380C520 364 570 344 600 330V380C540 410 460 430 380 424C300 418 250 380 236 310Z" fill="url(#wv2)" opacity=".7"/>` +
        `<path d="M300 400q20-10 40 0t40 0t40 0M440 384q20-10 40 0t40 0" fill="none" stroke="#f6efe0" stroke-width="3" opacity=".7"/>` +
        `<path d="M0 520Q150 470 300 510T600 470V600H0Z" fill="${NAVY}"/>` +
        `<path d="M0 520Q150 470 300 510T600 470" fill="none" stroke="#f6efe0" stroke-width="5"/>` +
        `<path d="M40 540q20-10 40 0M190 506q20-10 40 0M330 534q20-10 40 0M480 500q20-10 40 0M110 570q20-10 40 0M400 566q20-10 40 0" fill="none" stroke="#7fc6cc" stroke-width="3" stroke-linecap="round" opacity=".7"/>` +
        // title
        `<g font-family="${SERIF}" font-weight="700" text-anchor="start" fill="${NAVY}">` +
        `<text x="36" y="76" font-size="62" letter-spacing="2">CRUX</text>` +
        `<text x="36" y="128" font-size="44" letter-spacing="3">SHANTIES</text></g>` +
        `<g transform="translate(352 104) rotate(-10)"><circle r="38" fill="#c8323c"/><circle r="32" fill="none" stroke="#f3e6c8" stroke-width="1.5"/>` +
        T(0, -6, 'VOL.', 12, { w: 800, fill: '#f3e6c8', ls: 2 }) + T(0, 20, '2', 30, { serif: 1, w: 700, fill: '#f3e6c8' }) + `</g>` +
        T(36, 566, 'THE CREW OF THE ALCOR', 15, { w: 800, a: 'start', fill: '#f3e6c8', ls: 4 }) +
        T(564, 566, '⚓', 22, { a: 'end', fill: '#f3e6c8' }) +
        grain(0.5, 'multiply')
      );
    },
  });

  // ---- TEUCER'S MIX!!! (handmade) ----------------------------------------------------------
  def('cover_teucer_mix', {
    title: "TEUCER'S MIX!!!",
    w: 600, h: 600, tags: ['cover', 'music', 'playlist', 'teucer'],
    svg: () => {
      let ruled = '';
      for (let y = 70; y < 600; y += 30) ruled += `M0 ${y}H600`;
      const letters = (s, xs, y, size, cols, rots) =>
        s.split('').map((c, i) => `<text x="${xs[i]}" y="${y}" font-size="${size}" fill="${cols[i % cols.length]}" text-anchor="middle" transform="rotate(${rots[i % rots.length]} ${xs[i]} ${y})">${c}</text>`).join('');
      const sticker = (x, y, r, inner, rot = 0) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><circle r="${r + 3}" cx="2" cy="4" fill="#000" opacity=".15"/><circle r="${r}" fill="#fff"/>${inner}</g>`;
      const goldStar = (x, y, r, rot) =>
        `<path d="${star5(x + 2, y + 3, r, rot)}" fill="#000" opacity=".15"/><path d="${star5(x, y, r, rot)}" fill="url(#gold)" stroke="#b98a1e" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="${star5(x - r * 0.15, y - r * 0.2, r * 0.35, rot)}" fill="#fff" opacity=".45"/>`;
      return svg(
        lg('gold', [[0, '#fff1a8'], [0.45, '#f5c842'], [1, '#c8901c']], 0, 0, 1, 1) +
        `<filter id="mk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" result="n"/>` +
        `<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>`,
        `<rect width="600" height="600" fill="#fbf9f1"/>` +
        `<path d="${ruled}" stroke="#a9c8ea" stroke-width="2"/><path d="M64 0V600" stroke="#f08a8a" stroke-width="2.5"/>` +
        [90, 300, 510].map((y) => `<circle cx="30" cy="${y}" r="12" fill="#e9e4d6"/>`).join('') +
        `<g filter="url(#mk)">` +
        // big marker fish
        `<path d="M140 330C180 250 330 250 380 320L450 270Q436 330 452 390L380 340C330 410 180 410 140 330Z" fill="#ff9a3c" stroke="#d2561b" stroke-width="6" stroke-linejoin="round"/>` +
        `<path d="M250 268Q264 330 250 392M290 272Q302 330 290 388" fill="none" stroke="#d2561b" stroke-width="5"/>` +
        `<circle cx="186" cy="318" r="16" fill="#fff" stroke="#222" stroke-width="4"/><circle cx="190" cy="320" r="7" fill="#222"/>` +
        `<path d="M156 346Q170 360 186 350" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M200 268L214 236L236 266" fill="#ffcf4a" stroke="#d2561b" stroke-width="4" stroke-linejoin="round"/>` +
        // bubbles + waves
        `<circle cx="112" cy="300" r="10" fill="none" stroke="#3aa0e6" stroke-width="4"/><circle cx="96" cy="268" r="6" fill="none" stroke="#3aa0e6" stroke-width="4"/>` +
        `<path d="M80 460q20-16 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" fill="none" stroke="#3aa0e6" stroke-width="7" stroke-linecap="round"/>` +
        `<path d="M110 492q20-14 40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0t40 0" fill="none" stroke="#1d5fa8" stroke-width="6" stroke-linecap="round"/>` +
        // title (kid lettering, backwards S)
        `<g font-family="${FONT}" font-weight="900">` +
        letters('TEUCER', [118, 176, 236, 298, 360, 420], 144, 78, ['#e8434c', '#3aa0e6', '#2f9e5a', '#f39a1e', '#8a5fd8', '#e8434c'], [-6, 4, -3, 6, -4, 3]) +
        `<text x="0" y="0" font-size="78" fill="#3aa0e6" transform="translate(478 146) rotate(5) scale(-1 1)" text-anchor="middle">S</text>` +
        letters('MIX!!!', [196, 256, 310, 362, 394, 426], 232, 74, ['#1d5fa8', '#f39a1e', '#2f9e5a', '#e8434c', '#e8434c', '#e8434c'], [4, -5, 3, 8, 12, 16]) + `</g>` +
        `<text x="110" y="560" font-family="${FONT}" font-size="26" font-weight="700" fill="#2b4b8c" transform="rotate(-3 110 560)">for BROTHR (best sogns EVR)</text>` +
        `</g>` +
        // stickers
        goldStar(512, 236, 30, 12) + goldStar(92, 216, 22, -10) + goldStar(540, 470, 24, 20) + goldStar(470, 60, 16, 0) +
        sticker(470, 360, 44,
          `<circle r="38" fill="#dceeff"/><path d="M-26-18L-20-44L-6-26ZM26-18L20-44L6-26Z" fill="#7fb8ea"/>` +
          `<ellipse rx="30" ry="26" cy="2" fill="#fff"/><path d="M-24-6Q0-30 24-6Q12-14 0-2Q-12-14-24-6Z" fill="#7fb8ea"/>` +
          `<circle cx="-11" cy="2" r="6" fill="#16294d"/><circle cx="11" cy="2" r="6" fill="#16294d"/><circle cx="-9" cy="0" r="2" fill="#fff"/><circle cx="13" cy="0" r="2" fill="#fff"/>` +
          `<path d="M-5 12Q0 8 5 12Q0 18-5 12Z" fill="#16294d"/><path d="M-16 26Q0 34 16 26V34H-16Z" fill="#c8323c"/>`, -8) +
        sticker(560, 150, 26, `<path d="M0 14C-30-6-14-26 0-12C14-26 30-6 0 14Z" fill="#e8434c"/>`, 10) +
        sticker(116, 400, 26, `<path d="M-16 0C-8-12 8-12 14 0L22-8V8L14 0C8 12-8 12-16 0Z" fill="#3aa0e6"/><circle cx="-8" cy="-2" r="2.5" fill="#16294d"/>`, -14) +
        `<path d="M520 -10l84 20-10 40-84-20Z" fill="#f6e27a" opacity=".7"/><path d="M-6 556l70 22-10 34-70-22Z" fill="#f6e27a" opacity=".7"/>`
      );
    },
  });
})();
