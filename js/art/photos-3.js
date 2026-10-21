/* Photos 3 — Fatui ops, Project Osial, the hotpot crew, Wangsheng, the storm and the Ledger.
   1200×900 unless noted; the two screenshots are 1206×2622. */
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
  const FONT = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = 'Georgia, Times New Roman, serif';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wrap = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="${FONT}" stroke-linecap="round" stroke-linejoin="round"><defs>${defs}</defs>${body}</svg>`;
  const grainDef = (fr) =>
    `<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fr || 0.85}" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 0 1"/></filter>`;
  const grain = (w, h, op) => `<rect width="${w}" height="${h}" filter="url(#gr)" opacity="${op || 0.22}" style="mix-blend-mode:overlay"/>`;
  const vigDef = (op, r) => rad('vg', `.5 .5 ${r || 0.74}`, `#000 .55 0|#000 1 ${op == null ? 0.55 : op}`);
  const vig = (w, h) => `<rect width="${w}" height="${h}" fill="url(#vg)"/>`;
  const glow = (id, c, a) => rad(id, '.5 .5 .5', `${c} 0 ${a == null ? 0.9 : a}|${c} .4 ${f1((a == null ? 0.9 : a) * 0.32)}|${c} 1 0`);
  const T = (x, y, s, str, ex) => `<text x="${x}" y="${y}" font-size="${s}"${ex ? ' ' + ex : ''}>${esc(str)}</text>`;
  // six-armed snowflake
  const flake = (x, y, r, c, sw) => {
    const a = f1(r * 0.5), b = f1(r * 0.866);
    return `<path d="M${f1(x - r)} ${y}H${f1(x + r)}M${f1(x - a)} ${f1(y - b)}L${f1(x + a)} ${f1(y + b)}M${f1(x - a)} ${f1(y + b)}L${f1(x + a)} ${f1(y - b)}" stroke="${c}" stroke-width="${sw}"/>`;
  };
  // Northland Bank crest: snowflake in a ring
  const crest = (x, y, r, c, sw) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}"/>` + flake(x, y, r * 0.66, c, sw) +
    `<circle cx="${x}" cy="${y}" r="${f1(r * 0.16)}" fill="${c}"/>`;
  const bokeh = (R, n, x0, y0, x1, y1, rmin, rmax, fill, omin, omax) => {
    let s = '';
    for (let i = 0; i < n; i++) s += `<circle cx="${r0(x0 + R() * (x1 - x0))}" cy="${r0(y0 + R() * (y1 - y0))}" r="${r0(rmin + R() * (rmax - rmin))}" fill="${fill}" opacity="${f1(omin + R() * (omax - omin))}"/>`;
    return s;
  };
  // iOS status bar for 1206-wide screenshots
  const statusBar = (time, c) =>
    `<g fill="${c}">${T(178, 108, 48, time, 'font-weight="600" text-anchor="middle"')}` +
    `<rect x="874" y="92" width="11" height="17" rx="3"/><rect x="891" y="84" width="11" height="25" rx="3"/><rect x="908" y="76" width="11" height="33" rx="3"/><rect x="925" y="68" width="11" height="41" rx="3"/>` +
    `<path d="M958 82a42 42 0 0 1 58 0l-7 8a32 32 0 0 0-44 0zM969 94a26 26 0 0 1 36 0l-7 8a16 16 0 0 0-22 0zM980 105l7-7 7 7-7 7z"/>` +
    `<rect x="1036" y="72" width="76" height="37" rx="12" fill="none" stroke="${c}" stroke-opacity=".4" stroke-width="3"/><rect x="1042" y="78" width="50" height="25" rx="7"/><rect x="1116" y="84" width="6" height="13" rx="3" opacity=".4"/></g>` +
    `<rect x="453" y="34" width="300" height="88" rx="44" fill="#000"/>`;
  const homeBar = (w, h, c) => `<rect x="${w / 2 - 140}" y="${h - 34}" width="280" height="11" rx="5.5" fill="${c}"/>`;

  // irregular Guyun stone pillar: jagged tapering sides, rounded top
  const pillarD = (R, cx, top, base, wd) => {
    const L = [], Rt = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, y = base + (top - base) * t, hw = (wd / 2) * (1 - t * 0.16);
      L.push(`${r0(cx - hw + (R() - 0.5) * wd * 0.17)} ${r0(y)}`);
      Rt.push(`${r0(cx + hw + (R() - 0.5) * wd * 0.17)} ${r0(y)}`);
    }
    return `M${L.join('L')}Q${r0(cx)} ${r0(top - wd * 0.2)} ${Rt.reverse().join('L')}Z`;
  };
  // trees and shrubs on a pillar top
  const tuft = (R, cx, top, wd, c) => {
    let d = `M${r0(cx - wd * 0.52)} ${r0(top + wd * 0.02)}`;
    for (let i = 0; i < 4; i++) { const r = (wd / 8) * (0.9 + R() * 0.6); d += `a${f1(r)} ${f1(r * 0.9)} 0 0 1 ${f1(wd * 0.26)} 0`; }
    return `<path d="${d}Z" fill="${c}"/>`;
  };

  /* ---------- people (anime-adjacent heads; head-local units, face ≈ 94 wide) ---------- */
  const skinDefs = () =>
    lin('sk', '0 0 0 1', '#fff3ea 0|#fcdcc8 .55|#f1c1a6 1') +
    rad('bl', '.5 .5 .5', '#ff6b78 0 .5|#ff6b78 1 0') +
    lin('ish', '0 0 0 1', '#000 0 .62|#000 .55 0');
  const FACE = 'M-47 -16C-47 -60 47 -60 47 -16C47 18 31 45 0 56C-31 45 -47 18 -47 -16Z';
  // d: -1 for the left eye (outer corner on the left), 1 for the right eye
  const eye = (x, y, c, k, d) => {
    if (k === 'shut') return `<path d="M${x - 12} ${y + 3}Q${x} ${y - 11} ${x + 12} ${y + 3}" fill="none" stroke="#3a2026" stroke-width="4.6"/>`;
    let p = `<ellipse cx="${x}" cy="${y + 1}" rx="13" ry="12.5" fill="#fff"/><ellipse cx="${x}" cy="${y}" rx="10.5" ry="13.5" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="10.5" ry="13.5" fill="url(#ish)"/>`;
    if (k === 'plum') {
      p += '<g fill="#3a0a10">';
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        p += `<circle cx="${f1(x + 2.9 * Math.cos(a))}" cy="${f1(y + 2 + 2.9 * Math.sin(a))}" r="2.3"/>`;
      }
      p += `</g><circle cx="${x}" cy="${y + 2}" r="1.2" fill="#ffcf6a"/>`;
    } else p += `<ellipse cx="${x}" cy="${y + 2}" rx="4.6" ry="6.6" fill="#1d1216" opacity=".7"/>`;
    if (k === 'star') p += `<path d="M${x + 3} ${y - 11}l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#fff"/><circle cx="${x - 3.6}" cy="${y + 6}" r="2" fill="#fff" opacity=".9"/>`;
    else p += `<circle cx="${x + 3.6}" cy="${y - 5}" r="3.8" fill="#fff"/><circle cx="${x - 3.6}" cy="${y + 6}" r="1.8" fill="#fff" opacity=".85"/>`;
    return p + `<path d="M${x - d * 11} ${y - 11}Q${x + d * 3} ${y - 19} ${x + d * 14} ${y - 6}L${x + d * 17} ${y - 2}" fill="none" stroke="#2b1a1e" stroke-width="4.2"/>` +
      `<path d="M${x - 5} ${y + 15}Q${x} ${y + 16} ${x + 5} ${y + 15}" stroke="#7a4a4a" stroke-width="1.6" fill="none" opacity=".6"/>`;
  };
  const MOUTH = {
    smile: '<path d="M-8 32Q0 38 8 32" fill="none" stroke="#a5444f" stroke-width="3.2"/>',
    open: '<path d="M-12 28Q0 31 12 28Q10 46 0 47Q-10 46-12 28Z" fill="#8c2a35"/><path d="M-7 40Q0 35 7 40Q4 46 0 46Q-4 46-7 40Z" fill="#f08a95"/>',
    grin: '<path d="M-15 26Q0 32 15 25Q9 43 0 43Q-9 43-15 26Z" fill="#7d2230"/><path d="M-14 27Q0 32 14 26L13 30Q0 35-13 31Z" fill="#fff"/><path d="M6 30l2.5 5 2.5-5z" fill="#fff"/><path d="M-6 38Q0 34 6 38Q3 42 0 42Q-3 42-6 38Z" fill="#ef7f8c"/>',
  };
  const head = (o) => {
    const e = o.eyes || ['open', 'open'];
    return `<g transform="translate(${o.x} ${o.y}) rotate(${o.r || 0}) scale(${o.s})">` +
      (o.back || '') +
      `<path d="${FACE}" fill="url(#sk)"/><path d="M47 -16C47 18 31 45 0 56C24 40 38 14 40 -16Z" fill="#e3a68b" opacity=".35"/>` +
      `<ellipse cx="-27" cy="24" rx="12" ry="7" fill="url(#bl)"/><ellipse cx="27" cy="24" rx="12" ry="7" fill="url(#bl)"/>` +
      eye(-19, 6, o.ec, e[0], -1) + eye(19, 6, o.ec, e[1], 1) +
      `<path d="M1 18l-2 4h3" fill="none" stroke="#d4917a" stroke-width="2"/>` +
      MOUTH[o.m || 'smile'] + (o.front || '') + (o.acc || '') + '</g>';
  };
  // neck + shoulders block (head-local), fill = garment
  const torso = (fill, wd, extra) =>
    `<path d="M-13 36H13V90H-13Z" fill="#e8b398"/><path d="M-13 40Q0 54 13 40V50Q0 62-13 50Z" fill="#c98a74" opacity=".5"/>` +
    `<g transform="translate(0 -12)"><path d="M-${wd} 300C-${wd - 6} 160 -84 104 -30 90Q0 108 30 90C84 104 ${wd - 6} 160 ${wd} 300Z" fill="${fill}"/>${extra || ''}</g>`;
  const flower = (x, y, r, c, cc) => {
    let d = '';
    const q = f1(r * 0.42);
    for (let i = 0; i < 5; i++) {
      const a = (i * 72 - 90) * Math.PI / 180;
      d += `M${f1(Math.cos(a) * r * 0.55 - q)} ${f1(Math.sin(a) * r * 0.55)}a${q} ${q} 0 1 0 ${2 * q} 0a${q} ${q} 0 1 0-${2 * q} 0Z`;
    }
    return `<g transform="translate(${x} ${y})"><path d="${d}" fill="${c}"/><circle r="${f1(r * 0.26)}" fill="${cc}"/></g>`;
  };
  // Paimon (head-local): hair back, fringe, star halo
  const PAIMON = {
    back: `<path d="M-58 -6C-68 -66 -28 -82 0 -82C28 -82 68 -66 58 -6L62 40Q52 52 42 42L-42 42Q-52 52-62 40Z" fill="url(#hrP)"/>`,
    front: `<path d="M-54 6C-60 -58 -24 -78 2 -76C30 -76 60 -56 54 6Q50 -18 42 -26Q42 -8 36 0Q32 -24 18 -34Q20 -18 12 -6Q6 -28-6 -36Q-4 -20-12 -6Q-16 -28-28 -32Q-28 -16-34 0Q-40 -20-46 -22Q-48 -6-54 6Z" fill="url(#hrP)"/>` +
      `<path d="M-50 -8Q-62 40-52 92Q-44 64-38 4ZM50 -8Q62 40 52 92Q44 64 38 4Z" fill="#eceaf6"/>`,
    acc: `<g transform="translate(-14 -96) rotate(-18)"><path d="M0 -30L8 -9 30 -9 12 4 19 26 0 13-19 26-12 4-30-9-8-9Z" fill="#1f2650" stroke="#4b5aa8" stroke-width="2.5"/><circle cx="-4" cy="-4" r="2.4" fill="#cdd6ff"/><circle cx="6" cy="6" r="1.6" fill="#cdd6ff"/></g>`,
  };

  /* =========================================================================================
     p_aquarium_frozen — Lyuba froze the office aquarium again
     ========================================================================================= */
  const goldfish = (x, y, s, r, body, fin, ex, ey) =>
    `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">` +
    `<path d="M-44 0C-60 -10-74 -34-86 -30Q-74 0-86 30C-74 34-60 10-44 0Z" fill="${fin}" opacity=".9"/>` +
    `<path d="M-22 -26Q0 -54 24 -24Z" fill="${fin}"/><path d="M-6 26Q-14 44-28 40Q-16 30-6 24Z" fill="${fin}"/>` +
    `<ellipse rx="50" ry="31" fill="${body}"/><ellipse cx="6" cy="12" rx="34" ry="11" fill="#fff" opacity=".22"/>` +
    `<path d="M8 4Q-2 22-14 18Q-6 12 8 4Z" fill="${fin}" opacity=".85"/>` +
    `<circle cx="27" cy="-7" r="10.5" fill="#fff" stroke="#3a3a3a" stroke-width="1.5"/><circle cx="${27 + ex}" cy="${-7 + ey}" r="4.6" fill="#111"/>` +
    `<ellipse cx="49" cy="5" rx="3.2" ry="4.4" fill="#7a2a1a"/></g>`;

  def('p_aquarium_frozen', {
    title: 'Sir’s fish (frozen, again)',
    w: 1200, h: 900, tags: ['ops', 'fatui', 'office', 'aquarium', 'ice', 'fish', 'lyuba'],
    svg: (w, h) => {
      const R = rng(7);
      const D =
        lin('wl', '0 0 0 1', '#e3ebe7 0|#c7d3cf .6|#a9b7b3 1') +
        lin('fl', '0 0 0 1', '#76817f 0|#4d5654 1') +
        lin('cb', '0 0 0 1', '#434a52 0|#262a30 1') +
        lin('wat', '0 0 0 1', '#bfe8f3 0|#8fcde0 .7|#7bb8cc 1') +
        lin('ice', '0 0 1 1', '#f6fdff 0 .66|#cdeefa .38 .42|#a7dcf0 .7 .5|#e8f8ff 1 .72') +
        rad('ie', '.5 .5 .62', '#fff .42 0|#fff 1 .95') + glow('fz', '#ffffff', 0.85) +
        lin('dome', '0 0 0 1', '#ffffff 0|#dff4fc .5|#b1def1 1') +
        lin('icl', '0 0 0 1', '#f4fcff 0|#a8d9ee 1 .6') +
        lin('nt', '0 0 0 1', '#fff47a 0|#f5d63c 1') +
        lin('win', '0 0 0 1', '#0f1d33 0|#1d3552 1') +
        rad('lp', '.5 0 1', '#f7fffc 0 .95|#f7fffc 1 0') +
        glow('cg', '#a8f2ff', 0.9) + vigDef(0.45) + grainDef();
      let s = `<rect width="${w}" height="${h}" fill="url(#wl)"/>`;
      // ceiling + fluorescent panels
      s += `<path d="M0 0H1200V118H0Z" fill="#e7eeec"/><path d="M0 40H1200M0 80H1200M300 0V118M600 0V118M900 0V118" stroke="#cdd8d5" stroke-width="2"/><path d="M0 118H1200" stroke="#97a4a1" stroke-width="3"/>`;
      s += `<path d="M168 18H528L552 94H144Z" fill="#fbfffe"/><path d="M688 18H1048L1072 94H664Z" fill="#fbfffe"/><path d="M168 44H528M160 70H540M688 44H1048M680 70H1060" stroke="#d3ebe6" stroke-width="3"/>`;
      s += `<ellipse cx="350" cy="110" rx="420" ry="190" fill="url(#lp)" opacity=".75"/><ellipse cx="870" cy="110" rx="420" ry="190" fill="url(#lp)" opacity=".75"/>`;
      // window with blinds (night outside)
      s += `<rect x="28" y="168" width="230" height="300" fill="#8b9794"/><rect x="40" y="180" width="206" height="276" fill="url(#win)"/>` +
        bokeh(R, 9, 50, 330, 236, 440, 2, 5, '#ffc767', 0.5, 0.9) +
        `<path d="M40 330H246" stroke="#0a1424" stroke-width="3"/>`;
      for (let y = 188; y < 320; y += 15) s += `<rect x="40" y="${y}" width="206" height="10" fill="#e6ece9" opacity=".92"/>`;
      // poster: days without incident
      s += `<g transform="rotate(1.5 1030 280)"><rect x="928" y="160" width="204" height="250" fill="#fdfdfb"/><rect x="928" y="160" width="204" height="54" fill="#1f2d4d"/>` +
        crest(958, 187, 16, '#dfe8ff', 2.5) + T(982, 194, 17, 'LIYUE BRANCH', 'fill="#fff" font-weight="700" letter-spacing="1"') +
        T(1030, 248, 17, 'DAYS WITHOUT', 'fill="#1f2d4d" font-weight="700" text-anchor="middle"') + T(1030, 270, 17, 'AN INCIDENT', 'fill="#1f2d4d" font-weight="700" text-anchor="middle"') +
        T(1030, 382, 120, '0', 'fill="#c8323c" font-weight="800" text-anchor="middle"') +
        `<rect x="1010" y="150" width="44" height="18" fill="#f2efe0" opacity=".85" transform="rotate(-4 1032 159)"/></g>`;
      // desk partition at left
      s += `<path d="M0 520H222V720H0Z" fill="#6f7f8e"/><path d="M0 520H222V532H0Z" fill="#8798a8"/><rect x="40" y="452" width="120" height="70" rx="5" fill="#22272e"/><rect x="47" y="459" width="106" height="56" fill="#3f6b8a"/><rect x="92" y="520" width="16" height="10" fill="#22272e"/>`;
      // floor + cabinet
      s += `<path d="M0 700H1200V900H0Z" fill="url(#fl)"/><path d="M0 760H1200M0 840H1200" stroke="#5f6967" stroke-width="2" opacity=".6"/>`;
      s += `<ellipse cx="582" cy="868" rx="400" ry="32" fill="#000" opacity=".28"/>`;
      s += `<rect x="232" y="648" width="700" height="216" fill="url(#cb)"/><rect x="232" y="648" width="700" height="14" fill="#5b636c"/><path d="M582 662V864" stroke="#1d2126" stroke-width="3"/><rect x="548" y="740" width="8" height="46" rx="3" fill="#9aa3ad"/><rect x="608" y="740" width="8" height="46" rx="3" fill="#9aa3ad"/>`;
      // frost creeping over the cabinet
      s += `<path d="M232 662H932V700C880 712 860 690 820 706C780 722 760 700 720 712C680 726 640 704 600 718C560 732 520 706 480 720C440 734 400 712 360 724C320 736 280 716 232 728Z" fill="#e8f7ff" opacity=".7"/>`;
      // tank contents
      s += `<rect x="256" y="318" width="648" height="314" fill="url(#wat)"/>`;
      s += `<path d="M256 600Q330 588 420 596T600 592T780 598T904 590V632H256Z" fill="#cdb48c"/>`;
      const pc = ['#e6d2a6', '#a88d64', '#d9805c', '#7fa7c9', '#f0e7d3', '#8a7356'];
      for (let i = 0; i < 34; i++) s += `<ellipse cx="${r0(262 + R() * 636)}" cy="${r0(602 + R() * 26)}" rx="${r0(4 + R() * 6)}" ry="${r0(3 + R() * 3)}" fill="${pc[i % 6]}"/>`;
      s += `<g fill="none"><path d="M320 600C300 540 340 500 318 440M340 600C352 540 330 500 352 456" stroke="#3f9a5a" stroke-width="10"/><path d="M842 600C860 530 820 480 846 410M866 600C870 560 900 520 880 470" stroke="#2f8a50" stroke-width="12"/></g>`;
      s += `<g fill="#4fae66"><ellipse cx="312" cy="470" rx="9" ry="22" transform="rotate(-20 312 470)"/><ellipse cx="350" cy="500" rx="8" ry="20" transform="rotate(24 350 500)"/><ellipse cx="850" cy="450" rx="10" ry="26" transform="rotate(14 850 450)"/><ellipse cx="884" cy="500" rx="9" ry="22" transform="rotate(-18 884 500)"/></g>`;
      // castle
      s += `<path d="M722 600V528H734V516H746V528H758V516H770V528H782V600Z" fill="#8f97a1"/><path d="M742 600V572Q752 556 762 572V600Z" fill="#3b424b"/><rect x="738" y="540" width="8" height="12" fill="#3b424b"/>`;
      // frozen bubbles
      s += `<g fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="2">`;
      [[400, 560, 6], [408, 524, 8], [398, 486, 5], [412, 452, 9], [404, 410, 6], [690, 380, 5], [700, 352, 7]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
      s += '</g>';
      // confused fish (eyes looking every which way)
      s += goldfish(480, 430, 1.25, -8, 'url(#gf)', '#ff9d3c', -4, -4) + goldfish(690, 510, 1.05, 4, '#2f5fd6', '#ffd23f', 4, 3) +
        `<g transform="translate(1380 0) scale(-1 1)">${goldfish(610, 392, 0.62, 26, '#ff7a2e', '#fff', 0, -5)}</g>` +
        goldfish(600, 590, 0.5, 30, '#c9d6e2', '#9fb0c2', 3, 2);
      s += `<g stroke-width="7"><path d="M560 352h22M590 372h20M548 384h18" stroke="#46c7ff"/></g>`;
      // ice: body, frosted edges, cracks, sheen
      s += `<rect x="256" y="318" width="648" height="314" fill="url(#ice)"/><rect x="256" y="318" width="648" height="314" fill="url(#ie)"/>`;
      s += `<g fill="none" stroke="#fff"><path d="M256 420L330 446L372 418L452 470L520 452M520 452L560 380L640 360M520 452L590 520L700 548L760 620M700 548L812 520L904 540M640 360L700 318M330 446L300 540L262 560" stroke-width="3" opacity=".85"/>` +
        `<path d="M372 418L392 360M452 470L430 560M812 520L840 440L904 420M590 520L570 610" stroke-width="2" opacity=".6"/></g>`;
      s += `<path d="M256 420L330 446L372 418L452 470L520 452L560 380L640 360" fill="none" stroke="#6fb6d4" stroke-width="1.5" opacity=".6" transform="translate(2 3)"/>`;
      s += `<ellipse cx="300" cy="600" rx="90" ry="60" fill="url(#fz)"/><ellipse cx="880" cy="350" rx="80" ry="50" fill="url(#fz)"/><ellipse cx="640" cy="625" rx="130" ry="36" fill="url(#fz)"/><ellipse cx="600" cy="460" rx="60" ry="40" fill="url(#fz)" opacity=".5"/>`;
      s += `<path d="M300 318H380L300 632H256V500Z" fill="#fff" opacity=".22"/><path d="M420 318H448L368 632H340Z" fill="#fff" opacity=".14"/>`;
      // tank trims + ice dome pushing the lid up
      s += `<path d="M262 318C292 252 378 232 440 256C500 216 610 222 664 250C730 230 840 246 898 318Z" fill="url(#dome)"/>` +
        `<path d="M300 300C330 268 380 258 420 268M520 246C580 236 620 240 650 256" fill="none" stroke="#fff" stroke-width="6" opacity=".9"/>`;
      s += `<rect x="250" y="300" width="660" height="20" fill="#1c1f24"/><rect x="250" y="630" width="660" height="22" fill="#1c1f24"/><rect x="250" y="300" width="7" height="352" fill="#1c1f24"/><rect x="903" y="300" width="7" height="352" fill="#1c1f24"/>`;
      s += `<g transform="rotate(-7 610 226)"><rect x="300" y="210" width="620" height="20" rx="4" fill="#25292f"/><rect x="300" y="210" width="620" height="5" rx="2" fill="#4a5058"/></g>`;
      s += `<path d="M310 300q14 22 30 4q12 18 26 0q18 26 40 2q10 14 22 0M560 300q16 20 34 2q12 14 24 0M760 300q16 26 36 4q14 16 30-2" fill="#eef9ff" stroke="#c9e9f6" stroke-width="2"/><path d="M250 420q12 30 0 60M910 380q-12 40 0 80" stroke="#eef9ff" stroke-width="9" fill="none"/>`;
      // icicles over the front of the cabinet
      let ic = '';
      let x = 262;
      while (x < 900) {
        const wd = 10 + R() * 18, ht = 14 + R() * 52;
        ic += `M${r0(x)} 652L${r0(x + wd / 2)} ${r0(652 + ht)}L${r0(x + wd)} 652Z`;
        x += wd + R() * 12;
      }
      s += `<path d="${ic}" fill="url(#icl)"/>`;
      // sticky note frozen to the glass (Ekaterina's)
      s += `<g transform="rotate(-6 352 392)"><rect x="296" y="336" width="116" height="110" fill="url(#nt)"/><g fill="#2a2a33" font-weight="700" font-style="italic">` +
        T(306, 366, 19, 'SIR’S FISH') + T(306, 392, 16, 'please do NOT') + T(306, 414, 16, 'freeze them') + T(360, 436, 15, '— E.') + `</g></g>`;
      s += `<rect x="256" y="318" width="648" height="314" fill="#fff" opacity=".1"/>`;
      // Cryo mage's gloved hand from the right edge
      s += `<ellipse cx="1000" cy="450" rx="140" ry="120" fill="url(#cg)" opacity=".7"/><ellipse cx="930" cy="440" rx="110" ry="60" fill="url(#cg)" opacity=".8"/>`;
      s += `<path d="M1200 372C1160 380 1124 396 1100 410L1110 512C1140 520 1170 530 1200 548Z" fill="#253463"/>` +
        `<path d="M1108 402C1094 430 1096 490 1112 520C1124 500 1122 430 1108 402Z" fill="#f4f8ff"/><path d="M1104 412Q1090 460 1108 512" stroke="#c9d8ee" stroke-width="5" fill="none"/>`;
      const fingers = 'M1044 424L994 404L966 410M1040 446L982 440L954 448M1042 468L988 476L964 488M1050 490L1010 506L992 518M1078 418L1050 390L1024 384';
      s += `<g fill="none"><path d="${fingers}" stroke="#90a8c4" stroke-width="29"/><path d="${fingers}" stroke="#e9f1fa" stroke-width="23"/></g>`;
      s += `<ellipse cx="1068" cy="456" rx="50" ry="56" fill="#e9f1fa" stroke="#90a8c4" stroke-width="3"/><path d="M1032 430Q1050 456 1036 486" stroke="#bfd0e3" stroke-width="4" fill="none"/>`;
      s += `<path d="M1072 438l10 16-10 16-10-16z" fill="#7fe3ff"/><circle cx="1072" cy="454" r="22" fill="url(#cg)"/>`;
      // cryo breath: snowflakes drifting from fingertips to the tank
      s += `<g opacity=".95">` + flake(930, 400, 9, '#d8fbff', 2.5) + flake(912, 446, 6, '#d8fbff', 2) + flake(940, 488, 7, '#d8fbff', 2) + flake(892, 372, 5, '#fff', 2) + flake(960, 360, 5, '#fff', 2) + flake(880, 470, 4, '#fff', 1.6) + '</g>';
      s += `<path d="M960 410C920 400 900 420 860 412M958 452C920 450 900 470 870 462" stroke="#e9fdff" stroke-width="3" fill="none" opacity=".7"/>`;
      // fluorescent cast + finish
      s += `<rect width="${w}" height="${h}" fill="#d8fff2" opacity=".07"/>` + vig(w, h) + grain(w, h, 0.2);
      return wrap(w, h, D + lin('gf', '0 0 1 0', '#ffd26b 0|#ff8a2a .6|#e8571c 1'), s);
    },
  });

  /* =========================================================================================
     p_ops_vending — the vending-machine war
     ========================================================================================= */
  def('p_ops_vending', {
    title: 'Vending machine (out of order)',
    w: 1200, h: 900, tags: ['ops', 'fatui', 'office', 'night', 'pyotr', 'lyuba'],
    svg: (w, h) => {
      const R = rng(31);
      const D =
        lin('fl', '0 0 0 1', '#121a28 0|#1c2536 1') +
        lin('lw', '1 0 0 0', '#141c2b 0|#202a3d 1') +
        lin('bd', '0 0 1 0', '#7c1a20 0|#a8252c .5|#6a1219 1') +
        lin('gl', '0 0 0 1', '#f3fbff 0|#cfe6f4 1') +
        lin('fr', '0 0 1 0', '#fff 0 .97|#eef9ff .35 .85|#eef9ff .62 0') +
        lin('nt', '0 0 0 1', '#fff36e 0|#f2cf34 1') +
        rad('pool', '.5 .5 .5', '#bfe8ff 0 .55|#bfe8ff 1 0') +
        glow('ex', '#3dff8a', 0.9) + glow('mg', '#cfefff', 0.6) +
        rad('sc', '.5 .5 .5', '#000 0 .85|#3a1206 .55 .7|#ff7a1a .8 .35|#ff7a1a 1 0') +
        lin('rf', '0 0 0 1', '#cfe6f4 0 .2|#cfe6f4 1 0') +
        vigDef(0.7, 0.7) + grainDef(0.9) + '<clipPath id="gc"><rect x="146" y="238" width="252" height="456"/></clipPath>';
      let s = `<rect width="${w}" height="${h}" fill="#0c121d"/>`;
      // corridor (one-point perspective, VP ≈ 800,425)
      s += `<path d="M0 0H1200L900 350H700Z" fill="#111827"/><path d="M0 900H1200L900 500H700Z" fill="url(#fl)"/>` +
        `<path d="M0 0L700 350V500L0 900Z" fill="url(#lw)"/><path d="M1200 0L900 350V500L1200 900Z" fill="#161e2e"/>` +
        `<rect x="700" y="350" width="200" height="150" fill="#1c2638"/><rect x="772" y="392" width="58" height="108" fill="#121926"/><rect x="790" y="404" width="22" height="26" fill="#2c3b52"/>`;
      s += `<circle cx="801" cy="370" r="40" fill="url(#ex)" opacity=".6"/><rect x="782" y="362" width="38" height="15" rx="2" fill="#1fd16a"/>` + T(801, 374, 10, 'EXIT', 'fill="#eafff1" font-weight="800" text-anchor="middle"');
      // ceiling lights (off) and one dim one far away
      [[800, 80, 200, 22], [800, 190, 120, 14], [800, 262, 76, 9], [800, 305, 46, 6]].forEach(([cx, y, wd, hh], i) => {
        s += `<rect x="${cx - wd / 2}" y="${y}" width="${wd}" height="${hh}" rx="3" fill="${i === 3 ? '#d6e6ff' : '#2a3448'}"/>`;
      });
      // floor seams to VP + doors on the right wall
      s += `<g stroke="#26324a" stroke-width="2" opacity=".7"><path d="M800 500L560 900M800 500L1040 900M700 500L0 900M900 500L1200 900"/><path d="M640 560H970M520 640H1060M330 760H1150"/></g>`;
      s += `<path d="M1010 222L1090 128V735L1010 640Z" fill="#202b3f"/><path d="M1020 236L1080 166V708L1020 632Z" fill="#273449"/><path d="M1032 300L1068 260V340L1032 372Z" fill="#3b4c66"/><circle cx="1026" cy="440" r="4" fill="#8899b0"/>` +
        `<path d="M930 324L950 300V520L930 500Z" fill="#202b3f"/>`;
      // machine glow onto wall and floor
      s += `<ellipse cx="330" cy="470" rx="420" ry="420" fill="url(#mg)" opacity=".55"/><ellipse cx="330" cy="850" rx="360" ry="80" fill="url(#pool)"/>`;
      // reflection of the lit window on the floor
      s += `<rect x="146" y="808" width="252" height="92" fill="url(#rf)"/>`;
      // machine body + side panel
      s += `<path d="M512 128L552 168V756L512 806Z" fill="#4a0d12"/>` +
        `<rect x="120" y="128" width="392" height="678" rx="8" fill="url(#bd)"/><rect x="120" y="784" width="392" height="22" fill="#3a0a0e"/>`;
      s += `<rect x="140" y="146" width="352" height="72" rx="6" fill="#16213a"/>` + crest(182, 182, 22, '#bfe9ff', 3) +
        T(214, 196, 38, 'FROSTFIZZ', 'fill="#e6f8ff" font-weight="800" font-style="italic" letter-spacing="2"');
      // glass + products
      s += `<rect x="146" y="238" width="252" height="456" fill="url(#gl)"/>`;
      const cols = ['#e2432f', '#f2b630', '#2f7fd6', '#3ca35a', '#8e44ad', '#f07c2a', '#1d2b4a', '#e85b8a'];
      for (let row = 0; row < 6; row++) {
        const y = 250 + row * 74;
        for (let c = 0; c < 4; c++) {
          const x = 156 + c * 60;
          const col = cols[(row * 3 + c * 5) % 8];
          if (row % 2 === 0) s += `<rect x="${x + 6}" y="${y + 6}" width="38" height="52" rx="8" fill="${col}"/><rect x="${x + 12}" y="${y + 16}" width="26" height="12" rx="3" fill="#fff" opacity=".7"/>`;
          else s += `<rect x="${x + 10}" y="${y + 2}" width="30" height="56" rx="6" fill="${col}"/><rect x="${x + 10}" y="${y + 2}" width="30" height="8" rx="3" fill="#cfd6de"/><rect x="${x + 14}" y="${y + 22}" width="8" height="30" rx="3" fill="#fff" opacity=".35"/>`;
        }
        s += `<rect x="146" y="${y + 60}" width="252" height="6" fill="#9aa9b8"/>`;
      }
      // one snack dangling, stuck
      s += `<g transform="rotate(24 330 620)"><rect x="312" y="606" width="38" height="52" rx="8" fill="#f2b630"/><rect x="318" y="616" width="26" height="12" rx="3" fill="#fff" opacity=".7"/></g>`;
      // control panel
      s += `<rect x="410" y="238" width="86" height="456" rx="4" fill="#232833"/><rect x="420" y="254" width="66" height="40" rx="3" fill="#0b0f15"/>` + T(453, 282, 22, 'E-11', 'fill="#ff4b4b" font-weight="700" text-anchor="middle" font-family="DejaVu Sans Mono, monospace"');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) s += `<rect x="${422 + c * 22}" y="${316 + r * 24}" width="16" height="16" rx="3" fill="#5c6575"/>`;
      s += `<rect x="432" y="430" width="42" height="8" rx="4" fill="#0b0f15"/><rect x="424" y="470" width="58" height="66" rx="6" fill="#343b48"/><circle cx="453" cy="490" r="6" fill="#4fc3ff"/><rect x="436" y="510" width="34" height="5" fill="#0b0f15"/>`;
      // pickup flap
      s += `<rect x="150" y="712" width="248" height="58" rx="6" fill="#1a0b0d"/><rect x="160" y="718" width="228" height="22" rx="4" fill="#3a1418"/>`;
      // pyro side: scorch mark
      s += `<path d="M420 790C404 760 420 730 440 724C446 690 470 680 478 700C492 680 506 700 500 720C516 740 506 780 494 790Z" fill="#120806" opacity=".85"/><path d="M440 724C446 690 470 680 478 700C492 680 506 700 500 720" fill="none" stroke="#ff7a1a" stroke-width="3" opacity=".6"/><path d="M452 700L446 640M470 690L474 610M488 700L496 650" stroke="#120806" stroke-width="6" opacity=".35"/>`;
      // cryo side: frost + cracks over the left half of the glass
      s += `<g clip-path="url(#gc)"><rect x="146" y="238" width="252" height="456" fill="url(#fr)"/>`;
      s += `<g fill="none" stroke="#fff" stroke-width="2.4" opacity=".9"><path d="M150 300L190 320L200 300M190 320L206 360L230 362M206 360L196 410L214 440M196 410L160 430M160 540L196 560L210 540M196 560L222 600L250 598M222 600L206 650L230 680"/></g>`;
      let cr = '';
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * Math.PI * 2 + R() * 0.3, l = 70 + R() * 110;
        const mx = 236 + Math.cos(a) * l * 0.5 + (R() - 0.5) * 16, my = 372 + Math.sin(a) * l * 0.5 + (R() - 0.5) * 16;
        cr += `M236 372L${r0(mx)} ${r0(my)}L${r0(236 + Math.cos(a) * l)} ${r0(372 + Math.sin(a) * l)}`;
      }
      s += `<path d="${cr}" fill="none" stroke="#3b4a5c" stroke-width="2" opacity=".6" transform="translate(1.5 1.5)"/><path d="${cr}" fill="none" stroke="#fff" stroke-width="2"/>` +
        `<path d="M206 354L236 340L268 356L270 392L240 406L208 390Z" fill="none" stroke="#fff" stroke-width="2"/><path d="M180 332L236 310L296 336L300 410L240 440L178 410Z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/><circle cx="236" cy="372" r="10" fill="#fff" opacity=".85"/></g>`;
      // the sticky note
      s += `<g transform="rotate(5 340 560)"><rect x="282" y="508" width="118" height="108" fill="url(#nt)"/><path d="M282 508h118v14h-118z" fill="#000" opacity=".05"/>` +
        `<g fill="#222" font-weight="800" text-anchor="middle">${T(341, 546, 22, 'OUT OF')}${T(341, 574, 22, 'ORDER')}${T(341, 602, 17, '(PYOTR)', 'font-weight="600" font-style="italic"')}</g></g>`;
      // melt puddle + ice shard
      s += `<ellipse cx="250" cy="836" rx="90" ry="12" fill="#9fc6e0" opacity=".35"/><path d="M226 830l14-22 10 22z" fill="#e8f8ff" opacity=".85"/>`;
      s += vig(w, h) + grain(w, h, 0.28);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_northland_lobby — Northland Bank, Liyue Branch
     ========================================================================================= */
  def('p_northland_lobby', {
    title: 'Northland Bank — Liyue Branch lobby',
    w: 1200, h: 900, tags: ['northland', 'fatui', 'bank', 'ekat', 'lobby'],
    svg: (w, h) => {
      const R = rng(41);
      const D =
        lin('bw', '0 0 0 1', '#22345a 0|#152340 1') +
        lin('fl', '0 0 0 1', '#d9dfe7 0|#f4f6f9 .45|#c9d1dc 1') +
        lin('sw', '0 0 1 0', '#d7dee7 0|#eef2f6 1') +
        lin('swR', '1 0 0 0', '#d7dee7 0|#eef2f6 1') +
        lin('col', '0 0 1 0', '#c9d1db 0|#ffffff .45|#dfe5ec .7|#aeb8c5 1') +
        lin('bn', '0 0 0 1', '#24365e 0|#16223f 1') +
        lin('dk', '0 0 0 1', '#1e2c4b 0|#111a2e 1') +
        lin('dt', '0 0 0 1', '#ffffff 0|#dfe5ec 1') +
        glow('ch', '#bfeaff', 0.95) + glow('cs', '#e8fbff', 1) +
        lin('rf', '0 0 0 1', '#bfeaff 0 .5|#bfeaff 1 0') +
        lin('ceil', '0 0 0 1', '#c9d3de 0|#eef2f6 1') +
        lin('hrE', '0 0 0 1', '#3a3240 0|#1d1820 1') +
        vigDef(0.35, 0.8) + grainDef();
      let s = `<rect width="${w}" height="${h}" fill="#e9eef3"/>`;
      // room shell, VP (600,420)
      s += `<path d="M0 0H1200L980 120H220Z" fill="url(#ceil)"/><path d="M0 900H1200L980 580H220Z" fill="url(#fl)"/>` +
        `<path d="M0 0L220 120V580L0 900Z" fill="url(#sw)"/><path d="M1200 0L980 120V580L1200 900Z" fill="url(#swR)"/>` +
        `<rect x="220" y="120" width="760" height="460" fill="url(#bw)"/>`;
      // coffers
      s += `<g stroke="#b4c0cd" stroke-width="2" fill="none"><path d="M110 60H1090M180 98H1020"/><path d="M400 120L330 0M500 120L470 0M700 120L730 0M800 120L870 0"/></g>`;
      // marble veins on the back wall
      s += `<g fill="none" stroke="#9fb3d6" stroke-width="1.5" opacity=".25"><path d="M220 210C300 190 330 260 420 240S560 300 640 270M560 520C620 480 700 530 760 490S900 520 980 470M240 420C300 440 340 400 380 430"/></g>`;
      // floor tiles in perspective + reflections
      let fl = '';
      for (let i = -6; i <= 6; i++) fl += `M${600 + i * 63} 580L${600 + i * 260} 900`;
      [604, 640, 690, 760, 860].forEach((y) => { fl += `M0 ${y}H1200`; });
      s += `<path d="${fl}" stroke="#aeb9c6" stroke-width="1.6" opacity=".55"/>`;
      s += `<rect x="560" y="580" width="80" height="320" fill="url(#rf)" opacity=".5"/>`;
      // logo + crest
      s += crest(600, 236, 36, '#dce7f5', 4) + `<circle cx="600" cy="236" r="64" fill="url(#cs)" opacity=".25"/>` +
        T(600, 318, 34, 'NORTHLAND BANK', `fill="#e4ebf5" font-family="${SERIF}" letter-spacing="5" text-anchor="middle"`) +
        T(600, 350, 15, 'LIYUE BRANCH · EST. 1789', 'fill="#9fb3d6" letter-spacing="5" text-anchor="middle"');
      // Snezhnayan banners (two on the back wall, two in the foreground)
      const banner = (x, y, wd, ht) => {
        const cx = x + wd / 2;
        return `<path d="M${x} ${y}H${x + wd}V${y + ht}L${cx} ${y + ht - wd * 0.35}L${x} ${y + ht}Z" fill="#eef6ff"/>` +
          `<path d="M${x + wd * 0.12} ${y}H${x + wd * 0.88}V${y + ht - wd * 0.24}L${cx} ${y + ht - wd * 0.5}L${x + wd * 0.12} ${y + ht - wd * 0.24}Z" fill="url(#bn)"/>` +
          crest(cx, y + ht * 0.3, wd * 0.24, '#cfe8ff', Math.max(1.5, wd * 0.035)) +
          `<rect x="${x + wd * 0.12}" y="${y + ht * 0.56}" width="${wd * 0.76}" height="${wd * 0.08}" fill="#c8323c"/>` +
          `<rect x="${x - 6}" y="${y - 8}" width="${wd + 12}" height="10" rx="5" fill="#c7a55a"/>`;
      };
      s += banner(282, 140, 92, 330) + banner(826, 140, 92, 330);
      // Liyue touch: two potted pines by the desk
      const pine = (x) => `<path d="M${x - 26} 576H${x + 26}L${x + 20} 532H${x - 20}Z" fill="#2b5d4b"/><rect x="${x - 24}" y="528" width="48" height="8" rx="3" fill="#c7a55a"/>` +
        `<path d="M${x} 530C${x - 4} 500 ${x + 10} 480 ${x} 450" stroke="#4a3426" stroke-width="7" fill="none"/>` +
        `<g fill="#2f6b4a"><ellipse cx="${x - 22}" cy="470" rx="34" ry="14"/><ellipse cx="${x + 22}" cy="448" rx="30" ry="12"/><ellipse cx="${x - 6}" cy="426" rx="24" ry="10"/></g>` +
        `<g fill="#4c9068"><ellipse cx="${x - 26}" cy="465" rx="22" ry="7"/><ellipse cx="${x + 18}" cy="443" rx="18" ry="6"/></g>`;
      s += pine(268) + pine(932);
      // Ekaterina behind the desk
      s += `<g transform="translate(600 444)">` +
        `<path d="M-30 -18C-34 -50 -14 -62 0 -62C14 -62 34 -50 30 -18L32 6H-32Z" fill="url(#hrE)"/>` +
        `<path d="M-74 70C-72 30 -50 14 -20 10H20C50 14 72 30 74 70Z" fill="#1e2a4a"/>` +
        `<path d="M-58 24C-56 10-46 4-38 8C-32 0-20 2-14 10C-8 4 0 8 0 16C0 8 8 4 14 10C20 2 32 0 38 8C46 4 56 10 58 24C52 36 42 40 34 38C24 46 10 44 0 40C-10 44-24 46-34 38C-42 40-52 36-58 24Z" fill="#f4f6fb"/><path d="M-6 30L0 46 6 30Z" fill="#c8323c"/>` +
        `<path d="M-7 4H7V18H-7Z" fill="#e7b69c"/>` +
        `<path d="M-23 -26C-23 -46 23 -46 23 -26C23 -6 12 8 0 12C-12 8 -23 -6 -23 -26Z" fill="url(#sk)"/>` +
        `<ellipse cx="-9" cy="-22" rx="3.6" ry="4.6" fill="#3a3a5a"/><ellipse cx="9" cy="-22" rx="3.6" ry="4.6" fill="#3a3a5a"/><path d="M-4 -4Q0 -2 4 -4" stroke="#a5444f" stroke-width="2" fill="none"/>` +
        `<path d="M-26 -14C-30 -46 -10 -56 2 -54C20 -54 30 -40 26 -14L22 -26Q10 -38 -6 -40Q-14 -30 -26 -14Z" fill="url(#hrE)"/></g>`;
      // desk
      s += `<path d="M352 498Q600 470 848 498V590Q600 566 352 590Z" fill="url(#dk)"/><path d="M344 488Q600 458 856 488V504Q600 476 344 504Z" fill="url(#dt)"/>` +
        `<path d="M352 560Q600 536 848 560" stroke="#c7a55a" stroke-width="3" fill="none"/>` + crest(600, 528, 18, '#cfe8ff', 2.5) +
        `<rect x="690" y="436" width="64" height="42" rx="3" fill="#20242b"/><rect x="716" y="478" width="12" height="12" fill="#20242b"/><rect x="694" y="440" width="56" height="34" fill="#4c7fa8" opacity=".8"/>` +
        `<circle cx="470" cy="480" r="9" fill="#c7a55a"/><rect x="466" y="470" width="8" height="5" fill="#c7a55a"/>`;
      s += `<path d="M352 590Q600 566 848 590L880 640Q600 610 320 640Z" fill="#1e2c4b" opacity=".18"/>`;
      // columns
      const colm = (x0, x1, yt, yb) => `<rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt}" fill="url(#col)"/>` +
        `<rect x="${x0 - 8}" y="${yt}" width="${x1 - x0 + 16}" height="${(yb - yt) * 0.03}" fill="#c7a55a"/><rect x="${x0 - 8}" y="${yb - (yb - yt) * 0.04}" width="${x1 - x0 + 16}" height="${(yb - yt) * 0.04}" fill="#b8c2ce"/>`;
      s += colm(150, 196, 60, 700) + colm(1004, 1050, 60, 700) + colm(-20, 70, -10, 960) + colm(1130, 1220, -10, 960);
      s += `<rect x="150" y="700" width="46" height="160" fill="url(#col)" opacity=".18"/><rect x="1004" y="700" width="46" height="160" fill="url(#col)" opacity=".18"/>`;
      s += banner(86, 20, 60, 360) + banner(1054, 20, 60, 360);
      // chandelier: ice-blue crystal tiers
      s += `<circle cx="600" cy="100" r="230" fill="url(#ch)" opacity=".6"/><path d="M600 0V30" stroke="#9aa8b8" stroke-width="3"/>`;
      let dr = '';
      const tiers = [[44, 170, 26, 24], [82, 124, 19, 18], [112, 80, 12, 12], [134, 38, 7, 7]];
      tiers.forEach(([y, rx, ry, n]) => {
        s += `<ellipse cx="600" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#e6f8ff" stroke-width="4" opacity=".9"/>`;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const x = 600 + Math.cos(a) * rx, yy = y + Math.sin(a) * ry;
          const l = 22 + R() * 26;
          dr += `M${r0(x)} ${r0(yy)}l-4 ${r0(l * 0.6)}l4 ${r0(l * 0.4)}l4 ${-r0(l * 0.4)}z`;
        }
      });
      s += `<path d="${dr}" fill="#dff6ff" stroke="#9fdcff" stroke-width="1" opacity=".95"/>`;
      s += `<circle cx="600" cy="90" r="56" fill="url(#cs)"/>`;
      s += bokeh(R, 14, 440, 30, 760, 170, 2, 4, '#fff', 0.6, 1);
      s += vig(w, h) + grain(w, h, 0.14);
      return wrap(w, h, D + skinDefs(), s);
    },
  });

  /* =========================================================================================
     p_osial_diagram — the protocol, screenshot (1206×2622)
     ========================================================================================= */
  def('p_osial_diagram', {
    title: 'osial_protocol.pdf — page 3',
    w: 1206, h: 2622, tags: ['screenshot', 'osial', 'fatui', 'signora', 'document', 'guyun'],
    svg: (w, h) => {
      const D =
        lin('sea', '0 0 0 1', '#d5e8f4 0|#8db3cf 1') +
        lin('rk', '0 0 0 1', '#c9b99a 0|#9c8a6c 1') +
        lin('pl', '0 0 1 0', '#8e8a82 0|#bdb8ad .5|#7a766e 1') +
        rad('ent', '.5 .45 .6', '#3a1f2e 0|#141826 .7|#141826 1 .9') +
        glow('rg', '#3ab6ff', 0.9);
      let s = `<rect width="${w}" height="${h}" fill="#1c1c1e"/>` + statusBar('02:14', '#fff');
      s += T(60, 214, 46, 'Done', 'fill="#0a84ff" font-weight="600"') + T(603, 214, 42, 'osial_protocol.pdf', 'fill="#fff" font-weight="600" text-anchor="middle"') +
        `<g fill="none" stroke="#0a84ff" stroke-width="5"><path d="M1080 196v-40M1064 172l16-16 16 16M1058 186h-10v38h64v-38h-10"/></g>`;
      // page
      const X0 = 40, X1 = 1166, M = 110;
      s += `<rect x="${X0}" y="276" width="${X1 - X0}" height="2196" fill="#fff"/>`;
      s += `<rect x="${X0}" y="276" width="${X1 - X0}" height="196" fill="#1b2a4a"/>` + crest(130, 374, 46, '#e8f0ff', 5) +
        T(204, 352, 32, 'NORTHLAND BANK GROUP — CONFIDENTIAL', 'fill="#cfe0ff" font-weight="700" letter-spacing="1.5"') +
        T(204, 422, 50, 'PROJECT OSIAL / PHASE III', 'fill="#fff" font-weight="800" letter-spacing="1"');
      s += `<rect x="${X0}" y="472" width="${X1 - X0}" height="10" fill="#c8323c"/>` +
        T(M, 530, 22, 'TOP SECRET · HARBINGER EYES ONLY · DO NOT COPY', 'fill="#c8323c" font-weight="700" letter-spacing="3"') +
        T(M, 576, 24, 'Ref. NB-SC/OSL-3 · Rev. 4 (9 Oct 2026) · Page 3 of 7', 'fill="#6b7280"');
      // watermark
      s += `<g transform="rotate(-32 603 1400)" fill="#1b2a4a" opacity=".05" font-weight="800" text-anchor="middle">${T(603, 1200, 92, 'CONFIDENTIAL')}${T(603, 1700, 92, 'COPY 11 OF 11')}</g>`;
      const para = (y, head, lines) => {
        let p = T(M, y, 36, head, 'fill="#1b2a4a" font-weight="800"');
        lines.forEach((l, i) => { p += T(M, y + 56 + i * 44, 28, l, 'fill="#26272b"'); });
        return p;
      };
      s += para(650, '1. SITE — GUYUN STONE FOREST', [
        'Offshore pillar field, 31 km south-east of the harbor.',
        'Resonator units fixed at the tide line of pillars G-4,',
        'G-9 and G-17 (“Unit 3”). Beneath the seabed: the',
        'sealed entity on file as OSIAL.',
      ]);
      // ---- diagram ----
      const DY = 880, DH = 900;
      s += `<clipPath id="dc"><rect x="${M}" y="${DY}" width="986" height="${DH}"/></clipPath><rect x="${M}" y="${DY}" width="986" height="${DH}" fill="#f1f5f9" stroke="#c4ccd6" stroke-width="3"/><g clip-path="url(#dc)">`;
      s += `<rect x="${M}" y="${DY + 230}" width="986" height="320" fill="url(#sea)"/>` +
        `<path d="M${M} ${DY + 230}q30 -12 60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t60 0t26 0" fill="none" stroke="#3b6f99" stroke-width="3"/>`;
      s += `<path d="M${M} ${DY + 550}Q300 ${DY + 530} 500 ${DY + 548}T900 ${DY + 540}T1096 ${DY + 550}V${DY + DH}H${M}Z" fill="url(#rk)"/>` +
        `<g fill="none" stroke="#8a7758" stroke-width="2" opacity=".6"><path d="M${M} ${DY + 600}Q400 ${DY + 586} 700 ${DY + 604}T1096 ${DY + 596}M${M} ${DY + 650}Q500 ${DY + 640} 800 ${DY + 656}T1096 ${DY + 650}"/></g>`;
      // the entity
      s += `<path d="M180 ${DY + 860}C200 ${DY + 760} 320 ${DY + 700} 460 ${DY + 720}C520 ${DY + 660} 600 ${DY + 668} 640 ${DY + 704}C700 ${DY + 650} 800 ${DY + 660} 830 ${DY + 712}C920 ${DY + 700} 1020 ${DY + 760} 1040 ${DY + 860}Z" fill="url(#ent)"/>` +
        `<path d="M460 ${DY + 720}C440 ${DY + 680} 470 ${DY + 640} 500 ${DY + 650}M640 ${DY + 704}C630 ${DY + 660} 660 ${DY + 630} 690 ${DY + 646}M830 ${DY + 712}C840 ${DY + 670} 870 ${DY + 660} 890 ${DY + 676}" fill="none" stroke="#141826" stroke-width="22"/>` +
        `<path d="M160 ${DY + 872}C180 ${DY + 740} 330 ${DY + 680} 470 ${DY + 700}C540 ${DY + 640} 610 ${DY + 646} 645 ${DY + 684}C710 ${DY + 630} 820 ${DY + 640} 840 ${DY + 694}C940 ${DY + 684} 1040 ${DY + 750} 1062 ${DY + 872}" fill="none" stroke="#c8323c" stroke-width="3" stroke-dasharray="14 10"/>` +
        `<path d="M590 ${DY + 780}q22 -16 44 0q-22 14 -44 0z" fill="#f2c14e"/><circle cx="612" cy="${DY + 780}" r="5" fill="#3a0a10"/>`;
      // pillars + resonators + field
      [[230, 120, 90], [560, 140, 60], [900, 110, 100]].forEach(([x, wd, top], i) => {
        s += `<path d="M${x - wd / 2} ${DY + 560}L${x - wd / 2 + 8} ${DY + top + 20}Q${x} ${DY + top - 10} ${x + wd / 2 - 8} ${DY + top + 20}L${x + wd / 2} ${DY + 560}Z" fill="url(#pl)"/>` +
          `<path d="M${x - wd / 2 + 6} ${DY + top + 18}Q${x} ${DY + top - 30} ${x + wd / 2 - 6} ${DY + top + 18}Q${x} ${DY + top + 2} ${x - wd / 2 + 6} ${DY + top + 18}Z" fill="#5f8a4c"/>`;
        s += `<g fill="none" stroke="#2b8fd6" stroke-width="3" stroke-dasharray="8 8" opacity=".75">` +
          [70, 130, 200, 280].map((r) => `<path d="M${x - r} ${DY + 240 + r * 0.9}Q${x} ${DY + 240 + r * 1.6} ${x + r} ${DY + 240 + r * 0.9}"/>`).join('') + '</g>';
        s += `<circle cx="${x + wd / 2 + 4}" cy="${DY + 238}" r="34" fill="url(#rg)"/><rect x="${x + wd / 2 - 10}" y="${DY + 214}" width="28" height="48" rx="6" fill="#2b3442"/><circle cx="${x + wd / 2 + 4}" cy="${DY + 232}" r="7" fill="#5fd0ff"/>`;
        const lbl = i === 2 ? 'R-3 “UNIT 3”' : 'R-' + (i + 1);
        const lx = i === 2 ? x - 150 : x + wd / 2 + 30;
        s += `<path d="M${x + wd / 2 + 18} ${DY + 222}L${lx + 10} ${DY + 170}" stroke="#1b2a4a" stroke-width="2"/>` + T(lx, DY + 160, 26, lbl, 'fill="#1b2a4a" font-weight="700"');
      });
      s += T(M + 20, DY + 50, 24, 'Fig. 3 — Cross-section, not to scale', 'fill="#4b5563" font-style="italic"') +
        `<g fill="#4b5563" font-size="22">${T(M + 16, DY + 260, 22, '0 m')}${T(M + 16, DY + 540, 22, '−60 m')}${T(M + 16, DY + 640, 22, '−140 m')}</g>` +
        T(1080, DY + 470, 24, 'resonance field ↓', 'fill="#1d6fb0" font-weight="600" text-anchor="end"') +
        T(1080, DY + 500, 22, '+0.4 Hz / day', 'fill="#1d6fb0" text-anchor="end"') +

        `</g><rect x="${M}" y="${DY}" width="986" height="${DH}" fill="none" stroke="#c4ccd6" stroke-width="3"/>`;
      s += `<path d="M900 ${DY + 700}L940 ${DY + 668}H1000" stroke="#c8323c" stroke-width="2" fill="none"/>` + T(1080, DY + 650, 24, 'ENTITY “OSIAL”', 'fill="#c8323c" font-weight="800" text-anchor="end"') + T(1080, DY + 676, 20, '(dormant)', 'fill="#c8323c" text-anchor="end"');
      // ---- text after the diagram ----
      s += para(1850, '2. METHOD', [
        'Units run phase-locked. The field rises daily until',
        'the entity stirs. Liyue’s “late” protector will be',
        'compelled to answer in person.',
        'Projected collateral:',
      ]);
      s += `<rect x="400" y="2012" width="380" height="34" fill="#111"/>`;
      s += T(M, 2120, 36, '3. AUTHORIZATION', 'fill="#1b2a4a" font-weight="800"') +
        T(M, 2180, 28, 'Release on the signatory’s code only.', 'fill="#26272b"') +
        T(M, 2250, 36, 'Signatory: Tartaglia (11)', 'fill="#111" font-weight="700"') +
        `<path d="M130 2330c30-50 50-40 40 0s30-60 50-30-10 40 20 20 40-40 60-10 20 10 50-10 30 0 60-20" fill="none" stroke="#1d3a8a" stroke-width="4"/>` +
        `<path d="M110 2350H520" stroke="#9ca3af" stroke-width="2"/>` + T(M, 2384, 22, 'Countersignature: — (removed, rev. 4)', 'fill="#6b7280"');
      // red stamp
      s += `<g transform="rotate(-11 850 2280)" fill="none" stroke="#c8323c" opacity=".82"><rect x="660" y="2200" width="380" height="150" rx="10" stroke-width="7"/><rect x="674" y="2214" width="352" height="122" rx="6" stroke-width="2.5"/>` +
        `<g fill="#c8323c" stroke="none" text-anchor="middle" font-weight="900">${T(850, 2284, 52, 'APPROVED', 'letter-spacing="2"')}${T(850, 2318, 16, 'OFFICE OF THE EIGHTH · 09.10', 'letter-spacing="2" font-weight="700"')}</g></g>`;
      s += `<path d="M${M} 2420H1096" stroke="#e5e7eb" stroke-width="2"/>` + T(M, 2452, 20, 'NORTHLAND BANK GROUP · INTERNAL · NB-SC/OSL-3', 'fill="#9ca3af" letter-spacing="1"') + T(1096, 2452, 20, '3 / 7', 'fill="#9ca3af" text-anchor="end"');
      // viewer chrome bottom
      s += `<rect x="503" y="2500" width="200" height="54" rx="27" fill="#3a3a3c"/>` + T(603, 2536, 26, '3 of 7', 'fill="#fff" text-anchor="middle" font-weight="600"') + homeBar(w, h, '#fff');
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_unit3 — the resonator bolted to a Guyun pillar, night
     ========================================================================================= */
  def('p_unit3', {
    title: 'Unit 3',
    w: 1200, h: 900, tags: ['osial', 'guyun', 'night', 'sea', 'resonator', 'fatui'],
    svg: (w, h) => {
      const R = rng(53);
      const D =
        lin('sky', '0 0 0 1', '#050a16 0|#0d1d31 .55|#1b3b4d 1') +
        lin('sea', '0 0 0 1', '#12303e 0|#081a24 .5|#040d13 1') +
        lin('rk', '0 0 1 0', '#3e5368 0|#28384a .25|#151f2a .7|#0a0f15 1') +
        lin('mt', '0 0 1 0', '#e9eef3 0|#aab4c0 .3|#5d6875 .7|#2b323b 1') +
        rad('core', '.5 .5 .5', '#e6fbff 0|#5fd4ff .35|#1478d8 .7|#06243f 1') +
        glow('bg', '#3ab0ff', 0.75) + glow('mn', '#e8f2ff', 0.9) +
        lin('mist', '0 0 0 1', '#6f8fa3 0 0|#6f8fa3 1 .45') +
        vigDef(0.6) + grainDef(0.9);
      let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      s += bokeh(R, 36, 0, 0, 1200, 340, 1, 2, '#dfe8ff', 0.3, 0.9);
      s += `<circle cx="250" cy="150" r="140" fill="url(#mn)" opacity=".5"/><circle cx="250" cy="150" r="38" fill="#eef4ff"/>` +
        `<path d="M60 170C140 150 200 176 280 160S420 150 500 170C420 196 300 186 220 196S100 196 60 170Z" fill="#0c1a2b" opacity=".85"/>`;
      // distant pillars, two depths, with trees on top
      [[70, 330, 64, '#22384a'], [180, 380, 44, '#22384a'], [330, 400, 54, '#2a4254'], [455, 270, 80, '#1d3142'], [560, 350, 46, '#22384a']].forEach(([x, t, wd, c]) => {
        s += `<path d="${pillarD(R, x, t, 540, wd)}" fill="${c}"/>` + tuft(R, x, t, wd, '#16242c');
      });
      [[10, 240, 100], [250, 300, 76]].forEach(([x, t, wd]) => { s += `<path d="${pillarD(R, x, t, 540, wd)}" fill="#142331"/>` + tuft(R, x, t, wd, '#0e1a20'); });
      s += `<rect x="0" y="430" width="1200" height="110" fill="url(#mist)"/>`;
      // sea + moon glitter
      s += `<rect x="0" y="526" width="1200" height="374" fill="url(#sea)"/>`;
      let gl = '';
      for (let i = 0; i < 44; i++) {
        const y = 532 + i * i * 0.17, wd = 8 + i * 2.2 * R();
        gl += `M${r0(250 + (R() - 0.5) * (40 + i * 6) - wd / 2)} ${r0(y)}h${r0(wd)}`;
      }
      s += `<path d="${gl}" stroke="#cfe2ff" stroke-width="2.4" opacity=".55"/>`;
      let wv = '';
      for (let i = 0; i < 36; i++) wv += `M${r0(R() * 1200)} ${r0(560 + R() * 330)}q14 -5 28 0`;
      s += `<path d="${wv}" fill="none" stroke="#5f8ea8" stroke-width="2" opacity=".35"/>`;
      // resonance rings on the water around the pillar
      s += `<g fill="none" stroke="#4fc6ff">` + [[180, 30, 0.5], [270, 46, 0.3], [370, 62, 0.16]].map(([rx, ry, o]) => `<ellipse cx="880" cy="836" rx="${rx}" ry="${ry}" stroke-width="3" opacity="${o}"/>`).join('') + '</g>';
      // the pillar: jagged, stratified, wet
      const P = pillarD(R, 890, -200, 920, 500);
      s += `<path d="${P}" fill="#5b7c98" transform="translate(-5 0)"/><path d="${P}" fill="url(#rk)"/>`;
      let st = '';
      for (let i = 0; i < 16; i++) { const y = r0(20 + i * 56 + R() * 20), x = r0(650 + R() * 160); st += `M${x} ${y}q${r0(60 + R() * 80)} ${r0((R() - 0.5) * 14)} ${r0(160 + R() * 200)} ${r0((R() - 0.5) * 10)}`; }
      s += `<path d="${st}" fill="none" stroke="#05080c" stroke-width="3" opacity=".6"/><path d="${st}" fill="none" stroke="#7da6c6" stroke-width="1.6" opacity=".3" transform="translate(0 -3)"/>`;
      s += `<path d="M760 0L748 150L770 290M1010 320L1000 430M722 650L742 780L728 900M1050 640L1066 800" fill="none" stroke="#05080c" stroke-width="3" opacity=".5"/>`;
      s += `<g fill="#1d3a2a"><path d="M650 116q20 -18 40 -4q16 -14 34 0q-36 12 -74 4z"/><path d="M1060 296q18 -16 36 -2q-18 8 -36 2z"/><path d="M668 690q16 -12 30 -2q-14 6 -30 2z"/></g>`;
      // device glow on the rock
      s += `<circle cx="850" cy="440" r="320" fill="url(#bg)" opacity=".5"/>`;
      // brackets + backplate
      s += `<rect x="676" y="364" width="348" height="26" rx="6" fill="#3a434f"/><rect x="676" y="520" width="348" height="26" rx="6" fill="#3a434f"/>`;
      [690, 1010].forEach((x) => { [377, 533].forEach((y) => { s += `<circle cx="${x}" cy="${y}" r="9" fill="#a9b3bf"/><circle cx="${x - 2}" cy="${y - 2}" r="3" fill="#fff" opacity=".7"/>`; }); });
      s += `<rect x="742" y="296" width="216" height="330" rx="18" fill="#232a33"/>`;
      // body
      s += `<rect x="762" y="306" width="176" height="310" rx="44" fill="url(#mt)"/><rect x="772" y="316" width="156" height="290" rx="38" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
      s += `<circle cx="850" cy="412" r="62" fill="#0b1520"/><circle cx="850" cy="412" r="54" fill="url(#core)"/><circle cx="850" cy="412" r="54" fill="none" stroke="#9feaff" stroke-width="4"/>` +
        `<path d="M850 366A46 46 0 0 1 896 412M850 458A46 46 0 0 1 804 412" fill="none" stroke="#e6fbff" stroke-width="5" opacity=".85"/><circle cx="850" cy="412" r="14" fill="#f2fdff"/>`;
      s += `<circle cx="850" cy="412" r="150" fill="url(#bg)" opacity=".7"/>`;
      for (let i = 0; i < 5; i++) s += `<rect x="842" y="${492 + i * 16}" width="16" height="9" rx="3" fill="${i % 2 ? '#2f8fd8' : '#8fe6ff'}"/>`;
      s += crest(800, 346, 13, '#2b323b', 2.2) + T(850, 598, 22, 'UNIT 3', 'fill="#1a2028" font-weight="800" letter-spacing="4" text-anchor="middle"') +
        T(886, 352, 13, 'NB·OSL', 'fill="#2b323b" font-weight="700" letter-spacing="1" text-anchor="middle"');
      s += `<path d="M850 296V244" stroke="#3a434f" stroke-width="6"/><circle cx="850" cy="240" r="7" fill="#ff4b4b"/><circle cx="850" cy="240" r="22" fill="url(#bg)"/>`;
      // cables: one along the rock, one sagging into the sea
      s += `<path d="M806 614C800 660 740 680 700 720C680 740 676 790 690 860M894 614C900 680 960 700 1000 760C1020 790 1030 830 1024 880" fill="none" stroke="#0a0e13" stroke-width="11"/>` +
        `<path d="M806 614C800 660 740 680 700 720" fill="none" stroke="#5f7d99" stroke-width="2" opacity=".5" transform="translate(-3 -2)"/>`;
      // light on the water below
      s += `<ellipse cx="850" cy="850" rx="140" ry="26" fill="#4fc6ff" opacity=".14"/>`;
      // waves breaking against the base
      s += `<path d="M580 900C610 860 650 852 690 830C720 812 740 838 760 826C790 806 820 830 850 818C890 802 920 834 960 822C1000 808 1040 836 1080 826C1120 816 1160 840 1200 830V900Z" fill="#0b2230"/>` +
        `<path d="M600 866C640 846 670 840 700 822C716 812 732 826 748 820M800 818C830 808 860 826 890 814M940 822C980 806 1020 830 1060 818C1100 808 1140 828 1190 820" fill="none" stroke="#dcefff" stroke-width="4" opacity=".75"/>` +
        `<g fill="#dcefff" opacity=".22"><ellipse cx="716" cy="804" rx="44" ry="26"/><ellipse cx="760" cy="790" rx="30" ry="34"/><ellipse cx="1096" cy="800" rx="40" ry="30"/></g>`;
      s += bokeh(R, 22, 640, 700, 1180, 840, 1, 4, '#e6f4ff', 0.3, 0.8);
      let rn = '';
      for (let i = 0; i < 40; i++) rn += `M${r0(R() * 1200)} ${r0(R() * 900)}l-4 18`;
      s += `<path d="${rn}" stroke="#cfe2ff" stroke-width="1.4" opacity=".25"/>`;
      s += vig(w, h) + grain(w, h, 0.26);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_abyss_map — scribbled map on torn paper
     ========================================================================================= */
  def('p_abyss_map', {
    title: 'A scribbled map',
    w: 1200, h: 900, tags: ['abyss', 'chasm', 'map', 'skirk', 'clue'],
    svg: (w, h) => {
      const R = rng(61);
      const D =
        lin('wd', '0 0 1 1', '#4a3020 0|#2e1d12 .6|#1f140c 1') +
        lin('pp', '0 0 1 1', '#f7f0de 0|#efe5cc 1') +
        rad('lmp', '.25 .2 .9', '#ffd9a0 0 .5|#ffd9a0 1 0') +
        rad('cf', '.5 .5 .5', '#7a4a22 .78 0|#7a4a22 .86 .55|#5a3214 .93 .7|#5a3214 1 0') +
        rad('cff', '.5 .5 .5', '#a0683a 0 .14|#a0683a .85 .08|#a0683a 1 0') +
        lin('pen', '0 0 0 1', '#3b6fd6 0|#1d3f8a 1') +
        vigDef(0.6) + grainDef(0.8);
      let s = `<rect width="${w}" height="${h}" fill="url(#wd)"/>`;
      let gr = '';
      for (let i = 0; i < 22; i++) { const y = r0(R() * 900); gr += `M0 ${y}C300 ${y + r0((R() - 0.5) * 30)} 800 ${y + r0((R() - 0.5) * 30)} 1200 ${y + r0((R() - 0.5) * 20)}`; }
      s += `<path d="${gr}" fill="none" stroke="#1a0f08" stroke-width="2" opacity=".35"/><path d="M0 300H1200M0 640H1200" stroke="#140b06" stroke-width="4" opacity=".6"/>`;
      // paper (torn top edge)
      let tear = 'M170 140';
      for (let x = 170; x < 1000; x += 18) tear += `L${x + 9} ${r0(128 + R() * 22)}L${x + 18} ${r0(136 + R() * 14)}`;
      const paper = tear + 'L1000 820L176 830Z';
      s += `<g transform="rotate(-4 600 480)"><path d="${paper}" fill="#000" opacity=".4" transform="translate(10 14)"/><path d="${paper}" fill="url(#pp)"/>`;
      let rl = '';
      for (let y = 200; y < 820; y += 40) rl += `M176 ${y}H1000`;
      s += `<path d="${rl}" stroke="#9dbbd8" stroke-width="1.6" opacity=".7"/><path d="M250 140V826" stroke="#e08a8a" stroke-width="2" opacity=".7"/>`;
      // ink drawing
      const ink = '#1b2760';
      s += `<g fill="none" stroke="${ink}">`;
      s += `<path d="M300 170C330 240 290 300 340 360S300 470 350 540S320 660 380 760" stroke-width="4"/>`;
      let hatch = '';
      for (let y = 200; y < 760; y += 26) hatch += `M${r0(270 + Math.sin(y / 60) * 16)} ${y}l-24 18`;
      s += `<path d="${hatch}" stroke-width="2.4" opacity=".7"/>`;
      s += `<path d="M470 290l24 -36 24 36M520 300l20 -30 20 30M560 280l26 -40 26 40" stroke-width="3.4"/>`;
      s += `<path d="M380 600C450 560 470 520 540 520S640 480 640 440" stroke-width="3" stroke-dasharray="12 10"/>`;
      let sp = 'M690 440';
      for (let t = 0; t < 26; t += 0.35) { const r = 92 - t * 3.4; sp += `L${f1(690 + Math.cos(t) * r)} ${f1(440 + Math.sin(t) * r * 0.8)}`; }
      s += `<path d="${sp}" stroke-width="4.5"/><path d="${sp}" stroke-width="2" transform="translate(3 2)" opacity=".5"/>`;
      s += `<path d="M560 340C590 330 610 350 630 372" stroke-width="3"/><path d="M620 360l12 14-18 2" stroke-width="3"/>`;
      s += `<rect x="660" y="606" width="292" height="62" rx="4" stroke-width="3" transform="rotate(-2 806 637)"/>`;
      s += `<path d="M420 790C520 784 600 792 700 784M430 804C520 798 610 806 690 800" stroke-width="3"/>`;
      s += `<path d="M360 690l40 0M366 680l30 22M396 680l-30 22" stroke-width="3"/>`;
      s += `<path d="M880 760C900 740 940 740 960 760C940 780 900 780 880 760ZM880 760l-16 -12v24z" stroke-width="3"/>`;
      s += '</g>';
      s += `<path d="M846 382l9 24 24 9-24 9-9 24-9-24-24-9 24-9z" fill="${ink}"/><path d="M846 396l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#f4ecd8"/>`;
      s += `<g fill="${ink}" font-style="italic" font-weight="500">` +
        T(520, 242, 34, 'the Chasm', 'transform="rotate(-6 520 242)"') +
        T(676, 650, 38, '23.71N / 112.04E', 'font-weight="600" transform="rotate(-2 676 650)"') +
        T(424, 774, 40, 'she said 3 AM', 'font-weight="600"') +
        T(800, 482, 26, 'down. keep going') + T(310, 156, 22, 'harbor') + T(316, 712, 24, 'pier 7?') + `</g>`;
      s += `<path d="M720 510l66 -30" stroke="${ink}" stroke-width="2.6"/>`;
      // coffee ring
      s += `<circle cx="880" cy="250" r="96" fill="url(#cff)"/><circle cx="880" cy="250" r="96" fill="url(#cf)"/></g>`;
      // pen
      s += `<g transform="rotate(-28 980 600)"><rect x="840" y="612" width="300" height="24" rx="12" fill="#000" opacity=".35" transform="translate(8 10)"/>` +
        `<path d="M830 624L860 612H1120A12 12 0 0 1 1120 636H860Z" fill="url(#pen)"/><path d="M816 624L842 616V632Z" fill="#c9ced6"/><circle cx="816" cy="624" r="2.5" fill="#222"/>` +
        `<rect x="1050" y="606" width="80" height="8" rx="4" fill="#d9dde3"/><rect x="880" y="616" width="140" height="5" rx="2.5" fill="#fff" opacity=".35"/></g>`;
      s += `<rect width="${w}" height="${h}" fill="url(#lmp)"/>` + vig(w, h) + grain(w, h, 0.2);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_hotpot_crew — selfie at the hotpot table
     ========================================================================================= */
  def('p_hotpot_crew', {
    title: 'hotpot crew 🔥',
    w: 1200, h: 900, tags: ['crew', 'hotpot', 'selfie', 'lumine', 'paimon', 'xl', 'ht', 'me', 'food'],
    svg: (w, h) => {
      const R = rng(23);
      const D = skinDefs() +
        lin('bg', '0 0 0 1', '#5a2418 0|#2c100b 1') +
        glow('lan', '#ffb050', 0.95) + glow('wm', '#ff7a2a', 0.8) +
        lin('tb', '0 0 0 1', '#7a4326 0|#4a2614 .5|#2e170c 1') +
        rad('br', '.5 .45 .6', '#f0491f 0|#c01c10 .5|#7a0c07 1') +
        lin('pot', '0 0 1 0', '#6e3f1c 0|#e8a964 .3|#c27c3e .6|#5e3416 1') +
        lin('hrL', '0 0 0 1', '#fff1bd 0|#f0c96e .55|#c9973f 1') +
        lin('hrP', '0 0 0 1', '#ffffff 0|#eceaf6 .6|#c9c4e0 1') +
        lin('hrX', '0 0 0 1', '#3d4a7c 0|#222a4c 1') +
        lin('hrH', '0 0 0 1', '#4a2a22 0|#1f0f0c 1') +
        lin('stm', '0 1 0 0', '#fff 0 0|#fff .5 .5|#fff 1 0') +
        lin('sl', '0 0 1 0', '#555b66 0|#7b818c .5|#4a4f59 1') +
        vigDef(0.6) + grainDef();
      let s = `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
      s += `<g transform="translate(600 450) rotate(-2.5) scale(1.07) translate(-600 -450)">`;
      s += `<rect x="-40" y="-40" width="1280" height="980" fill="url(#bg)"/>`;
      // lattice screen + lanterns + bokeh
      let lt = '';
      for (let x = 760; x < 1240; x += 44) lt += `M${x} -40V420`;
      for (let y = 0; y < 420; y += 44) lt += `M760 ${y}H1240`;
      s += `<path d="${lt}" stroke="#7a3424" stroke-width="5" opacity=".45"/>`;
      [[120, 70, 50], [400, 20, 40], [1060, 60, 60], [690, 10, 30]].forEach(([x, y, r]) => {
        const k = r0(r * 0.86), q = r0(r * 0.9), b = r0(r * 0.4);
        s += `<circle cx="${x}" cy="${y}" r="${r0(r * 2.6)}" fill="url(#lan)" opacity=".5"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${k}" fill="#e0402a"/>` +
          `<path d="M${x} ${y - k}Q${x - q} ${y} ${x} ${y + k}Q${x + q} ${y} ${x} ${y - k}" fill="none" stroke="#a8241a" stroke-width="3"/>` +
          `<path d="M${x - b} ${y - r - 2}h${2 * b}v10h-${2 * b}zM${x - b} ${y + k - 4}h${2 * b}v10h-${2 * b}zM${x - 2} ${y + k + 6}h5v${r0(r * 0.7)}h-5z" fill="#e7b04a"/>`;
      });
      s += bokeh(R, 9, 0, 0, 1200, 380, 10, 34, '#ffbe6a', 0.12, 0.4);
      // --- Xiangling (left)
      s += head({
        x: 215, y: 372, s: 1.3, ec: '#e8a531', eyes: ['shut', 'shut'], m: 'open',
        back: `<circle cx="-44" cy="-64" r="24" fill="url(#hrX)"/><circle cx="44" cy="-64" r="24" fill="url(#hrX)"/>` +
          `<path d="M-64 -50Q-44 -38 -24 -52M64 -50Q44 -38 24 -52" stroke="#f2c14e" stroke-width="6" fill="none"/>` +
          `<path d="M-56 -4C-66 -64 -26 -80 0 -80C26 -80 66 -64 56 -4L58 34Q46 46 38 36L-38 36Q-46 46-58 34Z" fill="url(#hrX)"/>` +
          torso('#d8452c', 128, `<path d="M-30 90L0 128L30 90L18 84L0 106L-18 84Z" fill="#2a1a1a"/><path d="M-30 90Q0 108 30 90" stroke="#f2c14e" stroke-width="4" fill="none"/><path d="M-100 170Q-60 150 -40 190M100 170Q60 150 40 190" stroke="#2a1a1a" stroke-width="10" fill="none"/>`),
        front: `<path d="M-54 6C-60 -58 -24 -78 2 -76C30 -76 60 -56 54 6Q50 -16 44 -22Q42 -6 36 2Q32 -20 22 -26Q20 -10 14 -2Q8 -22 0 -28Q-2 -10-10 -2Q-14 -22-24 -26Q-26 -10-32 2Q-38 -16-44 -20Q-48 -6-54 6Z" fill="url(#hrX)"/>` +
          `<path d="M-52 -6Q-60 30-50 60L-40 4ZM52 -6Q60 30 50 60L40 4Z" fill="#2a335c"/>`,
      });
      // her arm lifting a slice of beef
      s += `<path d="M300 640C310 560 320 500 344 452L380 470C366 520 360 580 360 650Z" fill="#d8452c"/>` +
        `<ellipse cx="356" cy="446" rx="24" ry="20" fill="#f6d3bd"/>` +
        `<path d="M344 440L404 300M356 440L420 304" stroke="#c9a06a" stroke-width="5"/>` +
        `<path d="M378 318C396 312 420 316 432 326C424 344 432 364 420 384C404 392 386 384 376 372C388 352 372 336 378 318Z" fill="#cf4a52"/><path d="M386 330Q404 326 420 336M384 352Q400 348 422 356M388 372Q402 370 416 378" stroke="#f7d6d0" stroke-width="3" fill="none"/>`;
      // --- Lumine (centre)
      s += head({
        x: 512, y: 336, s: 1.32, ec: '#e0a43a', m: 'smile',
        back: `<path d="M-58 -6C-66 -66 -30 -82 0 -82C30 -82 66 -66 58 -6L60 44Q50 56 40 46L-40 46Q-50 56-60 44Z" fill="url(#hrL)"/>` +
          torso('#f6f3ec', 124, `<path d="M-30 90L0 130L30 90" stroke="#d9a93e" stroke-width="6" fill="none"/><path d="M-120 200Q-80 170 -50 220M120 200Q80 170 50 220" stroke="#d9a93e" stroke-width="5" fill="none"/>`),
        front: `<path d="M-54 6C-60 -58 -24 -78 2 -76C30 -76 60 -56 54 6Q50 -18 42 -26Q42 -8 36 0Q32 -24 18 -34Q20 -18 12 -6Q6 -28-6 -36Q-4 -20-12 -6Q-16 -28-28 -32Q-28 -16-34 0Q-40 -20-46 -22Q-48 -6-54 6Z" fill="url(#hrL)"/>` +
          `<path d="M-50 -8Q-62 40-52 96Q-44 66-38 4ZM50 -8Q62 40 52 96Q44 66 38 4Z" fill="#ebc066"/>`,
        acc: flower(40, -58, 22, '#fff', '#a8d8ff') + flower(40, -58, 13, '#f2f6ff', '#7cc0f0'),
      });
      // --- table, pot, plates
      s += `<ellipse cx="600" cy="960" rx="860" ry="410" fill="url(#tb)"/><path d="M-260 960A860 410 0 0 1 1460 960" fill="none" stroke="#a0623a" stroke-width="5" opacity=".5"/>`;
      // beef plate
      s += `<ellipse cx="170" cy="640" rx="130" ry="50" fill="#e9e4dc"/><ellipse cx="170" cy="636" rx="112" ry="40" fill="#fbf8f3"/>`;
      let bf = '', bm = '';
      for (let i = 0; i < 5; i++) { const x = 104 + i * 28, y = 630 + (i % 2) * 8; bf += `M${x - 30} ${y}a30 18 ${i * 8 - 16} 1 0 60 0a30 18 ${i * 8 - 16} 1 0-60 0Z`; bm += `M${x - 16} ${y - 2}q14 -6 28 2`; }
      s += `<path d="${bf}" fill="#c94650" stroke="#a83440" stroke-width="2"/><path d="${bm}" stroke="#f6d2d2" stroke-width="3" fill="none"/>`;
      // drinks
      s += `<rect x="40" y="520" width="56" height="96" rx="8" fill="#b02a3a" opacity=".85"/><rect x="40" y="520" width="56" height="20" rx="6" fill="#fff" opacity=".35"/><rect x="48" y="540" width="8" height="64" rx="4" fill="#fff" opacity=".4"/>`;
      // pot
      const pcx = 590, pcy = 712;
      s += `<ellipse cx="${pcx}" cy="${pcy + 70}" rx="270" ry="80" fill="#000" opacity=".4"/>` +
        `<path d="M${pcx - 256} ${pcy}Q${pcx - 250} ${pcy + 110} ${pcx} ${pcy + 124}Q${pcx + 250} ${pcy + 110} ${pcx + 256} ${pcy}Z" fill="url(#pot)"/>` +
        `<ellipse cx="${pcx}" cy="${pcy}" rx="256" ry="104" fill="url(#pot)"/><ellipse cx="${pcx}" cy="${pcy + 2}" rx="234" ry="91" fill="#3a1206"/>` +
        `<ellipse cx="${pcx}" cy="${pcy + 6}" rx="228" ry="86" fill="url(#br)"/>`;
      s += `<ellipse cx="${pcx - 60}" cy="${pcy - 20}" rx="120" ry="30" fill="#ff9a3c" opacity=".3"/><ellipse cx="${pcx + 90}" cy="${pcy + 30}" rx="90" ry="20" fill="#ffb347" opacity=".22"/>`;
      // things in the broth
      let pc = '';
      for (let i = 0; i < 18; i++) {
        const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.9;
        pc += `M${r0(pcx + Math.cos(a) * 210 * rr)} ${r0(pcy + 6 + Math.sin(a) * 78 * rr)}a3.5 3.5 0 1 0 .1 0Z`;
      }
      s += `<path d="${pc}" fill="#3a0d06"/>`;
      for (let i = 0; i < 8; i++) {
        const a = R() * Math.PI * 2, rr = 0.25 + R() * 0.65;
        const x = r0(pcx + Math.cos(a) * 205 * rr), y = r0(pcy + 6 + Math.sin(a) * 74 * rr);
        s += `<path d="M${x - 22} ${y}Q${x} ${y - 9} ${x + 22} ${y}Q${x} ${y + 7} ${x - 22} ${y}Z" fill="#8f0f08" transform="rotate(${r0(R() * 180)} ${x} ${y})"/>`;
      }
      [[480, 690], [650, 742], [720, 680], [540, 760]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="17" fill="#f1e2cf"/><circle cx="${x - 5}" cy="${y - 6}" r="5" fill="#fff" opacity=".8"/>`; });
      [[610, 672, 20], [430, 740, -15]].forEach(([x, y, r]) => { s += `<rect x="${x - 20}" y="${y - 14}" width="40" height="28" rx="4" fill="#f4e3b8" transform="rotate(${r} ${x} ${y})"/>`; });
      s += `<g fill="#3f9a3a"><ellipse cx="770" cy="720" rx="34" ry="10" transform="rotate(-20 770 720)"/><ellipse cx="410" cy="700" rx="30" ry="9" transform="rotate(25 410 700)"/></g>`;
      let bb = '';
      for (let i = 0; i < 8; i++) { const a = R() * 6.28, rr = R() * 0.85; bb += `<circle cx="${r0(pcx + Math.cos(a) * 200 * rr)}" cy="${r0(pcy + 6 + Math.sin(a) * 72 * rr)}" r="${r0(4 + R() * 7)}"/>`; }
      s += `<g fill="#ff6a3a" fill-opacity=".35" stroke="#ffc9a0" stroke-width="2">${bb}</g>`;
      s += `<path d="M${pcx - 250} ${pcy - 6}A256 104 0 0 1 ${pcx + 250} ${pcy - 6}" fill="none" stroke="#ffd59a" stroke-width="4" opacity=".7"/>`;
      // dipping bowls
      [[300, 850], [860, 870]].forEach(([x, y]) => { s += `<ellipse cx="${x}" cy="${y}" rx="60" ry="24" fill="#eee8df"/><ellipse cx="${x}" cy="${y - 2}" rx="48" ry="17" fill="#8a3a1c"/><ellipse cx="${x - 10}" cy="${y - 6}" rx="16" ry="5" fill="#d98a3a" opacity=".6"/>`; });
      // --- Paimon (floating, chopsticks up)
      s += `<g transform="translate(716 214)">` +
        `<path d="M-26 58C-58 96-70 160-52 204L0 174 52 204C70 160 58 96 26 58Z" fill="#1d2550"/>` +
        `<g fill="#cdd6ff">${[[-40, 150], [-30, 186], [34, 160], [44, 190], [-14, 120], [20, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>` +
        `<rect x="-14" y="48" width="12" height="40" rx="6" fill="#fbdcc8" transform="translate(8 0)"/>` +
        `<path d="M-22 64C-28 92-32 116-28 134H28C32 116 28 92 22 64Q0 72-22 64Z" fill="#fbfbff"/><path d="M-28 134H28L24 146H-24Z" fill="#e8c46a"/>` +
        `<path d="M-10 146V176M10 146V176" stroke="#fbfbff" stroke-width="12"/>` +
        `<path d="M-20 72C-40 70-50 50-50 30M20 72C40 70 50 50 50 30" stroke="#fbfbff" stroke-width="12" fill="none"/>` +
        `<circle cx="-50" cy="26" r="8.5" fill="#fbdcc8"/><circle cx="50" cy="26" r="8.5" fill="#fbdcc8"/>` +
        `<path d="M-56 34L-40 -50M-48 36L-26 -46" stroke="#c9a06a" stroke-width="4.5"/>` +
        `</g>`;
      s += head(Object.assign({ x: 716, y: 214, s: 0.9, ec: '#8e5fe0', eyes: ['star', 'star'], m: 'open' }, PAIMON));
      // --- Hu Tao (foreground right, peace sign)
      s += head({
        x: 942, y: 410, s: 1.95, r: -6, ec: '#d8343c', eyes: ['plum', 'shut'], m: 'grin',
        back: `<path d="M-60 -10C-70 -70 -30 -84 0 -84C30 -84 70 -70 60 -10L64 60Q52 70 40 60H-40Q-52 70-64 60Z" fill="url(#hrH)"/>` +
          torso('#6e4130', 132, `<path d="M-30 90L0 140L30 90L20 84L0 112L-20 84Z" fill="#1d1210"/><path d="M-30 90Q0 104 30 90" stroke="#c8323c" stroke-width="4" fill="none"/>` + flower(-70, 170, 16, '#d8343c', '#f2c14e')) +
          `<path d="M-56 30C-92 100-98 200-80 300Q-66 312-50 300C-60 220-52 120-38 44ZM56 30C92 100 98 200 80 300Q66 312 50 300C60 220 52 120 38 44Z" fill="url(#hrH)"/>` +
          `<path d="M-60 60C-78 120-80 200-70 280M60 60C78 120 80 200 70 280" stroke="#7a4636" stroke-width="3" fill="none" opacity=".6"/>` +
          `<g fill="#1a1012"><rect x="-64" y="40" width="22" height="14" rx="5" transform="rotate(20 -53 47)"/><rect x="42" y="40" width="22" height="14" rx="5" transform="rotate(-20 53 47)"/></g>`,
        front: `<path d="M-56 8C-62 -58 -24 -80 2 -78C30 -78 62 -56 56 8Q52 -16 44 -26Q44 -8 38 2Q32 -24 20 -34Q20 -14 12 -2Q6 -26-6 -34Q-6 -16-14 -2Q-18 -26-30 -30Q-30 -14-36 2Q-42 -20-48 -22Q-50 -6-56 8Z" fill="url(#hrH)"/>` +
          `<path d="M-52 -6Q-64 30-56 76L-40 2ZM52 -6Q64 30 56 76L40 2Z" fill="#3d2420"/>`,
        acc: `<g transform="translate(6 -14) rotate(-12 0 -70)"><path d="M-44 -70L-40 -110Q0 -120 40 -110L44 -70Z" fill="#1f1719"/><ellipse cx="0" cy="-70" rx="68" ry="12" fill="#141012"/><path d="M-43 -82Q0 -90 43 -82L44 -72Q0 -80-44 -72Z" fill="#8a1d24"/>` +
          flower(28, -96, 13, '#d8343c', '#f2c14e') + flower(44, -82, 10, '#e2505a', '#f2c14e') + flower(12, -84, 9, '#c22a33', '#f2c14e') +
          `<path d="M-64 -70L-70 -20L-54 -18L-50 -68Z" fill="#c8323c"/><path d="M-63 -58L-55 -56M-65 -46L-56 -44M-66 -34L-57 -32" stroke="#f2c14e" stroke-width="2.5"/></g>`,
      });
      // peace sign
      s += `<g transform="translate(1108 362) rotate(12) scale(1.75)">` +
        `<path d="M-30 40L30 40L36 110H-36Z" fill="#6e4130"/>` +
        `<g fill="#fbdcc8" stroke="#d99a80" stroke-width="2.4"><rect x="-17" y="-58" width="14" height="66" rx="7" transform="rotate(-12 -10 6)"/><rect x="3" y="-62" width="14" height="70" rx="7" transform="rotate(10 10 6)"/>` +
        `<rect x="-24" y="-6" width="48" height="50" rx="17"/><rect x="0" y="-12" width="24" height="15" rx="7.5"/><rect x="0" y="2" width="22" height="14" rx="7"/><rect x="-30" y="6" width="32" height="14" rx="7" transform="rotate(-28 -16 13)"/></g>` +
        `<g fill="#2b1d24"><ellipse cx="-16" cy="-52" rx="4.5" ry="6" transform="rotate(-12 -16 -52)"/><ellipse cx="14" cy="-56" rx="4.5" ry="6" transform="rotate(10 14 -56)"/></g>` +
        `<rect x="-24" y="40" width="48" height="8" fill="#2b1d24"/></g>`;
      // --- Childe's arm reaching into the pot (bottom-left)
      s += `<path d="M-60 900C40 840 200 790 330 744L360 812C240 860 120 900 60 940Z" fill="url(#sl)"/>` +
        `<path d="M318 742L350 816" stroke="#c8323c" stroke-width="18"/>` +
        `<path d="M340 740C364 718 404 716 420 734C434 752 420 786 392 798C366 808 344 792 340 740Z" fill="#f4cdb4"/>` +
        `<path d="M396 742L530 700M402 756L536 716" stroke="#3a2a22" stroke-width="5"/>` +
        `<path d="M380 734C394 726 412 728 420 738C410 746 396 748 384 744Z" fill="#f9dcc6" stroke="#d99a80" stroke-width="2"/>` +
        `<path d="M392 770Q404 768 412 760M384 784Q396 784 404 776" stroke="#d99a80" stroke-width="2.4" fill="none"/>` +
        `<circle cx="536" cy="708" r="16" fill="#f1e2cf"/><circle cx="531" cy="702" r="5" fill="#fff" opacity=".8"/>`;
      // steam + warm glow from the pot
      s += `<g fill="none" stroke="url(#stm)"><path d="M520 660C470 580 560 540 510 450C480 400 530 360 500 300" stroke-width="34" opacity=".35"/>` +
        `<path d="M640 650C690 580 610 520 660 440C690 400 650 360 670 320" stroke-width="26" opacity=".3"/><path d="M590 650C580 600 610 560 590 500" stroke-width="18" opacity=".3"/></g>`;
      s += `<ellipse cx="590" cy="640" rx="560" ry="300" fill="url(#wm)" opacity=".35" style="mix-blend-mode:screen"/>`;
      s += '</g>';
      s += vig(w, h) + grain(w, h, 0.22);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_paimon_food — a mountain of takeaway, Paimon on top
     ========================================================================================= */
  def('p_paimon_food', {
    title: 'Paimon’s order arrived',
    w: 1200, h: 900, tags: ['paimon', 'food', 'wanmin-go', 'crew', 'funny'],
    svg: (w, h) => {
      const R = rng(71);
      const D = skinDefs() +
        lin('wl', '0 0 0 1', '#3a2c3c 0|#5a4048 1') +
        lin('fl', '0 0 0 1', '#6a4630 0|#3e2618 1') +
        lin('pw', '0 0 1 0', '#ffffff 0|#efece6 .7|#d9d4cb 1') +
        lin('kr', '0 0 1 0', '#d9ac74 0|#c18f55 .7|#a67442 1') +
        lin('hrP', '0 0 0 1', '#ffffff 0|#eceaf6 .6|#c9c4e0 1') +
        glow('lmp', '#ffc77a', 0.9) + glow('sp', '#fff6c8', 1) +
        vigDef(0.5) + grainDef();
      // reusable takeaway pieces (fill via currentColor where it varies)
      const sym =
        `<g id="lg"><circle r="13" fill="#d8392b"/><path d="M-7 -3Q0 10 7 -3" stroke="#fff" stroke-width="3" fill="none"/><path d="M-3 -9q3 3 0 6M3 -9q3 3 0 6" stroke="#fff" stroke-width="2" fill="none"/></g>` +
        `<g id="pail"><path d="M-46 -56H46L36 50H-36Z" fill="url(#pw)"/><path d="M-46 -56L-30 -80 0 -66 30 -80 46 -56Z" fill="#e6e2da"/><path d="M-42 -60Q0 -118 42 -60" fill="none" stroke="#8a9096" stroke-width="3"/><rect x="-42" y="-30" width="80" height="12" fill="#d8392b"/><use href="#lg" y="10"/></g>` +
        `<g id="box"><path d="M-70 -20L-50 -44H74L54 -20Z" fill="#fff" opacity=".35"/><path d="M-70 -20H54V40H-70Z" fill="currentColor"/><path d="M54 -20L74 -44V16L54 40Z" fill="#000" opacity=".18"/><path d="M-70 -20L-50 -44H74L54 -20Z" fill="currentColor"/><path d="M-70 -20L-50 -44H74L54 -20Z" fill="#fff" opacity=".25"/><rect x="-70" y="0" width="124" height="9" fill="#d8392b"/><use href="#lg" x="-8" y="24" transform="scale(.8)"/></g>` +
        `<g id="tub"><path d="M-44 -18L-38 34H38L44 -18Z" fill="#f6efe4" opacity=".9"/><path d="M-40 0L-37 30H37L40 0Z" fill="#e0782e" opacity=".75"/><ellipse cy="-20" rx="48" ry="11" fill="#c8323c"/><ellipse cy="-24" rx="40" ry="8" fill="#e04a3c"/></g>` +
        `<g id="bag"><path d="M-48 -60H48L54 70H-54Z" fill="url(#kr)"/><path d="M-48 -60L-44 -76H44L48 -60Z" fill="#b8854a"/><path d="M-20 -60Q0 -96 20 -60" fill="none" stroke="#7a5228" stroke-width="5"/><use href="#lg" y="6" transform="scale(1.3)"/><text y="44" font-size="13" font-weight="800" fill="#7a2a1e" text-anchor="middle">WANMIN GO</text></g>` +
        `<g id="cup"><path d="M-26 -40H26L20 40H-20Z" fill="#c99a6a"/><path d="M-26 -40H26L25 -28H-25Z" fill="#fff" opacity=".4"/><ellipse cy="-42" rx="29" ry="7" fill="#f3efe8"/><path d="M6 -44L18 -86" stroke="#d8392b" stroke-width="7"/><circle cx="-8" cy="26" r="4" fill="#3a2418"/><circle cx="4" cy="30" r="4" fill="#3a2418"/><circle cx="12" cy="22" r="4" fill="#3a2418"/></g>` +
        `<g id="stmr"><rect x="-56" y="-20" width="112" height="40" rx="8" fill="#d6b27a"/><path d="M-56 -8H56M-56 6H56" stroke="#b08850" stroke-width="3"/><ellipse cy="-20" rx="56" ry="12" fill="#e6c48e"/></g>`;
      let s = `<rect width="${w}" height="${h}" fill="url(#wl)"/>`;
      // window with night city bokeh + lamp
      s += `<rect x="60" y="60" width="300" height="420" rx="6" fill="#1a1f3a"/><rect x="72" y="72" width="276" height="396" fill="#24305a"/>` +
        bokeh(R, 18, 80, 260, 340, 460, 4, 12, '#ffc76a', 0.35, 0.9) + `<path d="M210 72V468M72 270H348" stroke="#1a1f3a" stroke-width="8"/>`;
      s += `<circle cx="1040" cy="200" r="260" fill="url(#lmp)" opacity=".6"/><path d="M990 120H1090L1070 200H1010Z" fill="#f6e2b8"/><path d="M1040 200V560" stroke="#2a2024" stroke-width="6"/>`;
      s += `<path d="M0 640H1200V900H0Z" fill="url(#fl)"/><path d="M0 700H1200M0 790H1200" stroke="#2e1a10" stroke-width="3" opacity=".5"/>`;
      s += `<ellipse cx="600" cy="830" rx="430" ry="56" fill="#000" opacity=".35"/>`;
      // receipt behind the front items, trailing on the floor
      // the pile: back/top first, front/bottom last
      const P = (id, x, y, sc, r, col) => `<use href="#${id}" transform="translate(${x} ${y}) rotate(${r}) scale(${sc})"${col ? ` color="${col}"` : ''}/>`;
      // Paimon peeking out of the top
      s += head(Object.assign({ x: 600, y: 236, s: 1.25, r: 6, ec: '#8e5fe0', eyes: ['star', 'star'], m: 'open' }, PAIMON));
      s += P('box', 610, 360, 1.1, -4, '#fff') + P('cup', 470, 352, 1, -12) + P('tub', 740, 350, 1, 8);
      s += `<circle cx="540" cy="318" r="13" fill="#fbdcc8"/><circle cx="668" cy="320" r="13" fill="#fbdcc8"/>`;
      s += P('pail', 420, 470, 1.1, -10) + P('stmr', 600, 452, 1.15, 3) + P('stmr', 604, 424, 1.1, 1) + P('pail', 790, 470, 1.05, 12) + P('box', 540, 500, 1.05, 2, '#d9ac74');
      s += P('tub', 300, 590, 1.05, -6) + P('box', 470, 600, 1.15, -3, '#fff') + P('bag', 660, 590, 1.05, 4) + P('box', 860, 600, 1.1, 6, '#fff') + P('cup', 990, 610, 1.05, 10);
      s += P('pail', 200, 720, 1.15, -8) + P('box', 380, 740, 1.2, 2, '#d9ac74') + P('tub', 560, 730, 1.15, 0) + P('pail', 720, 720, 1.2, 6) + P('box', 910, 740, 1.15, -4, '#fff') + P('stmr', 1060, 770, 1.1, 0) + P('cup', 140, 790, 1, -4);
      // receipt
      s += `<path d="M632 520C640 600 620 680 640 760C650 800 700 820 760 830L900 846L896 866L740 852C660 840 610 810 602 760C590 680 612 600 604 524Z" fill="#fbfaf6"/>`;
      let rl = '';
      for (let i = 0; i < 11; i++) rl += `M${612 + (i > 7 ? (i - 7) * 30 : 0)} ${540 + i * 26}h${18 + (i * 7) % 14}`;
      s += `<path d="${rl}" stroke="#9a9a9a" stroke-width="4"/>` + T(780, 846, 15, '×38', 'fill="#555" font-weight="700" transform="rotate(6 780 846)"');
      // sparkles of joy
      [[470, 170, 16], [740, 140, 12], [800, 230, 9], [430, 260, 8]].forEach(([x, y, r]) => { s += `<path d="M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z" fill="#fff4b8"/><circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="url(#sp)" opacity=".5"/>`; });
      s += vig(w, h) + grain(w, h, 0.2);
      return wrap(w, h, D + sym, s);
    },
  });

  /* =========================================================================================
     p_coffin4 — Hu Tao's photo of the showroom
     ========================================================================================= */
  def('p_coffin4', {
    title: 'Coffin No. 4',
    w: 1200, h: 900, tags: ['wangsheng', 'ht', 'coffin', 'hideout', 'clue', 'funny'],
    svg: (w, h) => {
      const R = rng(83);
      const D =
        lin('wl', '0 0 0 1', '#2a1714 0|#1c0f0d 1') +
        lin('fl', '0 0 0 1', '#1e1514 0|#120c0b 1') +
        lin('bd', '0 0 0 1', '#4a1418 0|#2a080b .6|#160405 1') +
        lin('ld', '0 0 0 1', '#6a1e22 0|#3a0c10 .5|#200608 1') +
        lin('mn', '0 0 1 1', '#8fb4ff 0 .35|#8fb4ff 1 0') +
        glow('lt', '#ffb060', 0.95) +
        rad('spot', '.5 .3 .6', '#ffb060 0 .45|#ffb060 1 0') +
        lin('pd', '0 0 1 0', '#4a6680 0 .5|#8fb0c8 .5 .7|#4a6680 1 .5') +
        vigDef(0.72, 0.7) + grainDef(0.9);
      let s = `<rect width="${w}" height="${h}" fill="url(#wl)"/>`;
      // wall panels
      let pn = '';
      for (let x = 0; x <= 1200; x += 150) pn += `M${x} 0V560`;
      s += `<path d="${pn}" stroke="#120807" stroke-width="5"/><path d="M0 120H1200M0 470H1200" stroke="#3a211c" stroke-width="3"/>`;
      // lattice window with moonlight
      s += `<rect x="80" y="110" width="210" height="230" fill="#0e1424"/><rect x="92" y="122" width="186" height="206" fill="#2a3a5c"/>` +
        `<path d="M92 174H278M92 226H278M92 278H278M138 122V328M185 122V328M232 122V328" stroke="#0e1424" stroke-width="6"/>` +
        `<path d="M92 328L278 328L700 900H200Z" fill="url(#mn)" opacity=".35"/>`;
      // sale poster (Hu Tao)
      s += `<g transform="rotate(3 1060 230)"><rect x="972" y="120" width="180" height="230" fill="#efe2c4"/><rect x="972" y="120" width="180" height="46" fill="#a8232b"/>` +
        T(1062, 152, 22, 'WANGSHENG', 'fill="#f6d68a" font-weight="800" text-anchor="middle" letter-spacing="2"') +
        `<g fill="#3a1a14" font-weight="800" text-anchor="middle">${T(1062, 206, 26, 'AUTUMN')}${T(1062, 236, 26, 'SALE')}${T(1062, 278, 17, '2nd coffin', 'font-weight="600"')}${T(1062, 302, 17, 'half price!', 'font-weight="600"')}</g>` +
        `<path d="M1090 318q12 -16 24 0q-12 14 -24 0z" fill="#a8232b"/><circle cx="1102" cy="318" r="3" fill="#efe2c4"/></g>`;
      // floor
      s += `<rect x="0" y="560" width="1200" height="340" fill="url(#fl)"/><path d="M0 560H1200" stroke="#3a241c" stroke-width="3"/>`;
      // hanging lantern above No. 4 + its pool of light
      s += `<path d="M640 0V90" stroke="#1a0e0c" stroke-width="3"/><circle cx="640" cy="140" r="170" fill="url(#lt)" opacity=".6"/>` +
        `<ellipse cx="640" cy="140" rx="44" ry="50" fill="#e0582a"/><path d="M640 90Q604 140 640 190M640 90Q676 140 640 190" fill="none" stroke="#a8301a" stroke-width="3"/><rect x="622" y="86" width="36" height="9" fill="#d9a53e"/><rect x="622" y="186" width="36" height="9" fill="#d9a53e"/>`;
      s += `<ellipse cx="640" cy="560" rx="520" ry="420" fill="url(#spot)"/>`;
      // coffin (side view, head end on the right). local length 620
      const coffin = (x, y, sc, no, open) => {
        let c = `<g transform="translate(${x} ${y}) scale(${sc})">`;
        c += `<rect x="70" y="176" width="34" height="74" fill="#140808"/><rect x="510" y="176" width="34" height="74" fill="#140808"/><rect x="70" y="200" width="474" height="14" fill="#1c0b0b"/>`;
        c += `<path d="M14 96L598 74L604 186H8Z" fill="url(#bd)"/>`;
        c += `<path d="M8 186H604" stroke="#c99a46" stroke-width="5"/><path d="M14 112L598 92" stroke="#c99a46" stroke-width="3" opacity=".7"/>`;
        c += `<circle cx="520" cy="138" r="26" fill="none" stroke="#c99a46" stroke-width="4"/>` + T(520, 149, 30, '壽', `fill="#c99a46" text-anchor="middle" font-family="${SERIF}"`);
        c += `<rect x="260" y="128" width="96" height="36" rx="4" fill="#c99a46"/>` + T(308, 154, 22, 'No. ' + no, 'fill="#2a0a0b" font-weight="800" text-anchor="middle"');
        const lid = `<path d="M-14 104L-16 80C120 52 380 26 624 14L628 80L598 86L14 104Z" fill="url(#ld)"/><path d="M-12 82C120 56 380 30 622 18" stroke="#ff9f6a" stroke-width="3" fill="none" opacity=".35"/><path d="M14 102L598 84" stroke="#c99a46" stroke-width="4"/>`;
        if (open) {
          c += `<path d="M14 96L598 74L598 84L14 104Z" fill="#000"/>`;
          c += `<g transform="translate(34 -26) rotate(-2.5 300 60)">${lid}</g>`;
          c += `<path d="M150 86L598 64L598 84L150 104Z" fill="#050202"/>`;
        } else c += lid;
        return c + '</g>';
      };
      s += `<g opacity=".55">${coffin(-470, 300, 0.95, 3)}</g>` + `<g opacity=".7">${coffin(990, 300, 0.95, 5)}</g>`;
      s += coffin(280, 330, 1, 4, true);
      // wet ginger strand from the gap, drips and a puddle
      s += `<path d="M482 404C478 430 492 450 484 476C478 494 488 508 486 520" fill="none" stroke="#d2692e" stroke-width="6"/>` +
        `<path d="M492 404C494 424 504 440 500 458" fill="none" stroke="#e5874a" stroke-width="3.5"/>` +
        `<path d="M486 524q-5 10 0 14q5 -4 0 -14z" fill="#bfe0ff"/><path d="M490 560q-4 8 0 11q4 -3 0 -11z" fill="#bfe0ff" opacity=".8"/>`;
      s += `<path d="M560 420V480M700 414V470M610 418V448" stroke="#9fc2e0" stroke-width="3" opacity=".45"/>`;
      s += `<ellipse cx="520" cy="610" rx="150" ry="20" fill="url(#pd)"/><ellipse cx="700" cy="640" rx="110" ry="14" fill="url(#pd)" opacity=".7"/><ellipse cx="500" cy="606" rx="40" ry="5" fill="#d6ecff" opacity=".5"/>`;
      // reflection of the coffin in the polished floor
      s += `<path d="M288 600H884V640H288Z" fill="#3a0c10" opacity=".25"/>`;
      // wet footprints leading to No. 4
      [[160, 860, -30], [228, 812, -26], [272, 760, -32], [330, 726, -24], [370, 690, -28], [424, 668, -22], [460, 640, -26]].forEach(([x, y, r], i) => {
        s += `<g transform="translate(${x + (i % 2 ? 14 : -14)} ${y}) rotate(${r + 90})"><ellipse rx="22" ry="10" fill="#4a6680" opacity=".45"/><ellipse cx="22" rx="9" ry="8" fill="#4a6680" opacity=".45"/><ellipse cx="-6" cy="-3" rx="10" ry="3" fill="#b8d4ec" opacity=".35"/></g>`;
      });
      // "RESERVED" talisman on the lid
      s += `<g transform="rotate(-8 452 330)"><rect x="420" y="318" width="64" height="120" fill="#e8c35a"/><rect x="426" y="324" width="52" height="108" fill="none" stroke="#a8232b" stroke-width="2"/>` +
        `<g fill="#a8232b" font-weight="800" text-anchor="middle" font-size="12">${T(452, 346, 12, 'RE')}${T(452, 362, 12, 'SER')}${T(452, 378, 12, 'VED')}</g><path d="M436 392q16 14 32 0M440 410l24 12M464 410l-24 12" stroke="#a8232b" stroke-width="2.4" fill="none"/></g>`;
      // dust in the light
      s += bokeh(R, 18, 480, 160, 820, 420, 1, 3, '#ffd9a8', 0.3, 0.8);
      s += vig(w, h) + grain(w, h, 0.3);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_storm_guyun — storm over Guyun Stone Forest
     ========================================================================================= */
  def('p_storm_guyun', {
    title: 'Storm over Guyun',
    w: 1200, h: 900, tags: ['guyun', 'storm', 'osial', 'sea', 'whirlpool', 'lightning'],
    svg: (w, h) => {
      const R = rng(97);
      const D =
        lin('sky', '0 0 0 1', '#0c0e1a 0|#22263c .45|#4a5270 .8|#5e6884 1') +
        lin('sea', '0 0 0 1', '#2e4c56 0|#15292f .35|#081316 1') +
        glow('lg', '#d9d2ff', 0.9) +
        rad('cl1', '.5 .4 .5', '#0b0c16 0 .95|#141626 .6 .8|#141626 1 0') + rad('cl2', '.5 .4 .5', '#22263a 0 .9|#2c3048 .6 .6|#2c3048 1 0') +
        rad('cl3', '.5 .6 .5', '#4a4878 0 .9|#2a2a48 .6 .7|#2a2a48 1 0') +
        rad('wp', '.5 .5 .5', '#020607 .12|#06191c .3|#0f3238 .62|#1d434a .85|#1d434a 1 0') +
        rad('eye', '.5 .5 .5', '#000 .45|#0a3c40 .7|#3fe6d6 .88 .7|#3fe6d6 1 0') +
        lin('wall', '0 0 0 1', '#5fd8cc 0 .7|#174d50 1 .2') +
        lin('haze', '0 0 0 1', '#6a7694 0 0|#6a7694 1 .6') +
        vigDef(0.62) + grainDef(0.9);
      let s = `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
      // soft, heavy storm clouds (lighter where the lightning is)
      [[130, 70, '#cl1'], [250, 60, '#cl1'], [330, 46, '#cl2']].forEach(([y, n, g], L) => {
        for (let i = 0; i < 12; i++) {
          const x = r0(-60 + i * 115 + R() * 50), rx = r0(110 + R() * 90), ry = r0(n * (0.8 + R() * 0.6));
          const lit = Math.abs(x - 750) < 260;
          s += `<ellipse cx="${x}" cy="${r0(y + (R() - 0.5) * 50)}" rx="${rx}" ry="${ry}" fill="url(${lit && L < 2 ? '#cl3' : g})"/>`;
        }
      });
      // lightning (glow, branches, core) striking a pillar
      const bolt = 'M770 0L752 80L780 130L738 210L766 250L726 330L752 360L728 410';
      const br = 'M752 214L700 260L708 300M766 252L816 296L806 336M738 330L700 356';
      s += `<circle cx="750" cy="220" r="330" fill="url(#lg)" opacity=".45"/>` +
        `<path d="${bolt}${br}" fill="none" stroke="#b9a8ff" stroke-width="16" opacity=".35"/>` +
        `<path d="${bolt}" fill="none" stroke="#fff" stroke-width="5"/><path d="${br}" fill="none" stroke="#f2eeff" stroke-width="2.5"/>`;
      s += `<path d="M130 0L140 50L120 92L134 132L118 170" fill="none" stroke="#d9d2ff" stroke-width="2.5" opacity=".45"/>`;
      // pillars: far, mid, near (with lightning rim on the left edges)
      const pil = (cx, t, wd, c, rim, tf) => {
        const d = pillarD(R, cx, t, 640, wd);
        return (rim ? `<path d="${d}" fill="${rim}" transform="translate(-3 0)"/>` : '') + `<path d="${d}" fill="${c}"/>` + (tf ? tuft(R, cx, t, wd, tf) : '');
      };
      [[90, 380, 50], [210, 340, 70], [400, 400, 44], [520, 360, 40], [660, 420, 50], [930, 360, 64], [1040, 400, 46], [1130, 350, 40]].forEach(([x, t, wd]) => { s += pil(x, t, wd, '#465068', 0, '#38404f'); });
      s += `<rect x="0" y="400" width="1200" height="240" fill="url(#haze)"/>`;
      [[40, 250, 130], [320, 300, 96], [740, 410, 110], [880, 270, 120], [1110, 230, 110]].forEach(([x, t, wd]) => { s += pil(x, t, wd, '#262c3e', '#55547e', '#1a2422'); });
      s += pil(-10, 110, 220, '#12151f', '#3c3c64', '#0e1513') + pil(1180, 70, 240, '#12151f', 0, '#0e1513');
      let sl = '';
      for (let i = 0; i < 14; i++) { const x = r0(R() < 0.5 ? -100 + R() * 200 : 1070 + R() * 200), y = r0(160 + R() * 460); sl += `M${x} ${y}h${r0(30 + R() * 50)}`; }
      s += `<path d="${sl}" stroke="#05060a" stroke-width="3" opacity=".7"/>`;
      s += `<path d="M700 640h60l40 200h-140z" fill="#d9d2ff" opacity=".12"/>`;
      // sea
      s += `<rect x="0" y="618" width="1200" height="282" fill="url(#sea)"/><path d="M0 620H1200" stroke="#9fb6c8" stroke-width="2" opacity=".4"/>`;
      let wc = '';
      for (let i = 0; i < 60; i++) { const y = 626 + R() * 274; const l = 10 + (y - 600) * 0.12 * (0.5 + R()); wc += `M${r0(R() * 1200)} ${r0(y)}q${r0(l / 2)} -4 ${r0(l)} 0`; }
      s += `<path d="${wc}" fill="none" stroke="#c9e6ea" stroke-width="2.2" opacity=".4"/>`;
      // whirlpool
      const cx = 600, cy = 742, RX = 420, K = 0.27;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${RX}" ry="${RX * K}" fill="url(#wp)"/>`;
      for (let arm = 0; arm < 6; arm++) {
        let d = '';
        const ph = arm * (Math.PI * 2 / 6) + R() * 0.4;
        for (let k = 0; k <= 46; k++) {
          const t = k / 46, a = ph + t * Math.PI * 2.4, r = RX * (1 - t * 0.78) * (0.95 + R() * 0.04);
          d += (k ? 'L' : 'M') + r0(cx + Math.cos(a) * r) + ' ' + r0(cy + Math.sin(a) * r * K);
        }
        s += `<path d="${d}" fill="none" stroke="#0a1416" stroke-width="9" opacity=".35"/>` +
          `<path d="${d}" fill="none" stroke="#d6f2f0" stroke-width="${f1(2.5 + R() * 3.5)}" opacity="${f1(0.35 + R() * 0.35)}" stroke-dasharray="${r0(160 + R() * 200)} ${r0(30 + R() * 50)}"/>`;
      }
      // the funnel: lit far wall, glowing eye
      s += `<path d="M${cx - 150} ${cy}A150 ${150 * K} 0 0 1 ${cx + 150} ${cy}A96 ${96 * K} 0 0 0 ${cx - 96} ${cy}Z" fill="url(#wall)"/>` +
        `<ellipse cx="${cx}" cy="${cy + 2}" rx="110" ry="30" fill="url(#eye)"/><ellipse cx="${cx}" cy="${cy + 4}" rx="58" ry="13" fill="#000"/>`;
      s += `<path d="M${cx - 420} ${cy}A420 ${420 * K} 0 0 1 ${cx + 420} ${cy}" fill="none" stroke="#e6fbff" stroke-width="3" opacity=".35" stroke-dasharray="30 18"/>`;
      // foreground rocks
      s += `<path d="M0 900V790C40 776 80 796 120 776C170 750 210 786 260 806C300 826 330 862 360 900Z" fill="#06080c"/><path d="M1200 900V826C1150 816 1110 846 1060 856C1020 866 990 884 970 900Z" fill="#06080c"/>`;
      // rain, one path
      let rn = '';
      for (let i = 0; i < 110; i++) rn += `M${r0(R() * 1300 - 50)} ${r0(R() * 900)}l-14 44`;
      s += `<path d="${rn}" stroke="#c9d2ea" stroke-width="1.6" opacity=".26"/>`;
      s += vig(w, h) + grain(w, h, 0.26);
      return wrap(w, h, D, s);
    },
  });

  /* =========================================================================================
     p_ledger — Notes screenshot (1206×2622)
     ========================================================================================= */
  def('p_ledger', {
    title: 'Ledger — what xiansheng owes me',
    w: 1206, h: 2622, tags: ['screenshot', 'notes', 'zl', 'ledger', 'money'],
    svg: (w, h) => {
      const items = [
        ['Apr 22', 'gala consult dinner (“consult”)', 2400],
        ['Apr 29', 'Xinyue Kiosk — “one of each”', 4150],
        ['May', 'Third-Round Knockout ×9', 2430],
        ['May 18', 'birdcage (antique, for a thrush)', 3300],
        ['Jun', 'Heyu Tea House tab', 5320],
        ['Jun 30', '“tea”', 40000, '(??)'],
        ['Jul', 'jade chess set (he lost on purpose)', 2100],
        ['Aug', 'osmanthus wine ×6', 1450],
        ['Sep 3', 'a book about rocks. 900 pages', 980],
        ['Sep 21', 'umbrella he gave to a stranger', 75],
        ['Oct 2', 'opera box — Yun Jin, Sat', 3600],
        ['Oct 4', 'Liuli Pavilion (the first time)', 6900],
        ['Oct 16', 'Liuli Pavilion', 8800],
      ];
      const total = items.reduce((a, i) => a + i[2], 0);
      const fmt = (n) => 'ℳ' + n.toLocaleString('en-US');
      const Y = '#e3a008';
      let s = `<rect width="${w}" height="${h}" fill="#fff"/>` + statusBar('03:12', '#000');
      // nav
      s += `<path d="M62 176L42 196L62 216" fill="none" stroke="${Y}" stroke-width="7"/>` + T(80, 212, 46, 'Notes', `fill="${Y}"`) +
        `<g fill="none" stroke="${Y}" stroke-width="5"><path d="M1012 214v-40M996 190l16-16 16 16M990 202h-10v36h64v-36h-10"/><circle cx="1124" cy="198" r="26"/></g>` +
        `<g fill="${Y}"><circle cx="1112" cy="198" r="4"/><circle cx="1124" cy="198" r="4"/><circle cx="1136" cy="198" r="4"/></g>`;
      s += T(603, 300, 30, '16 October 2026 at 23:02', 'fill="#8e8e93" text-anchor="middle"');
      s += T(60, 390, 54, 'Ledger — what xiansheng owes me', 'fill="#000" font-weight="700"');
      s += T(60, 460, 36, 'he never carries money. on purpose. I know.', 'fill="#1c1c1e"');
      // table
      const TX = 60, TW = 1086, C1 = 220, C3 = 830, top = 520, rh = 92;
      const n = items.length + 1;
      s += `<rect x="${TX}" y="${top}" width="${TW}" height="${rh * n}" fill="none" stroke="#d1d1d6" stroke-width="3" rx="10"/>`;
      let gl = '';
      for (let i = 1; i < n; i++) gl += `M${TX} ${top + i * rh}H${TX + TW}`;
      gl += `M${TX + C1} ${top}V${top + rh * n}M${TX + C3} ${top}V${top + rh * n}`;
      s += `<path d="${gl}" stroke="#d1d1d6" stroke-width="2.5"/>`;
      s += `<g fill="#8e8e93" font-weight="600">${T(TX + 24, top + 58, 32, 'when')}${T(TX + C1 + 24, top + 58, 32, 'what')}${T(TX + TW - 24, top + 58, 32, 'ℳ', 'text-anchor="end"')}</g>`;
      items.forEach(([d, what, amt, note], i) => {
        const y = top + (i + 1) * rh + 58;
        s += T(TX + 24, y, 32, d, 'fill="#3a3a3c"') + T(TX + C1 + 24, y, 32, what, 'fill="#000"') +
          T(TX + TW - 24, y, 32, amt.toLocaleString('en-US') + (note ? ' ' + note : ''), `fill="${note ? '#c8323c' : '#000'}" text-anchor="end"${note ? ' font-weight="700"' : ''}`);
      });
      const yb = top + rh * n + 90;
      s += T(60, yb, 40, 'total: ' + fmt(total), 'fill="#000" font-weight="700"') +
        T(60, yb + 64, 36, 'paid back so far: ℳ0', 'fill="#1c1c1e"') +
        T(60, yb + 116, 36, '(+ one very long story about salt. does', 'fill="#1c1c1e"') +
        T(60, yb + 164, 36, 'that count. it was a good story)', 'fill="#1c1c1e"') +
        T(60, yb + 250, 36, '- [ ] ask about the “tea”', 'fill="#1c1c1e"') +
        T(60, yb + 300, 36, '- [ ] actually ask him to pay once', 'fill="#1c1c1e"') +
        T(60, yb + 350, 36, '- [x] pay anyway', 'fill="#8e8e93"');
      s += T(60, yb + 470, 40, '— he’s worth it. don’t tell him.', 'fill="#000" font-style="italic" font-weight="600"');
      // bottom toolbar
      s += `<path d="M0 2470H1206" stroke="#e5e5ea" stroke-width="2"/>` +
        `<g fill="none" stroke="${Y}" stroke-width="5">` +
        `<circle cx="120" cy="2522" r="22"/><path d="M110 2522l8 8 14-16"/>` +
        `<rect x="400" y="2504" width="56" height="40" rx="8"/><circle cx="428" cy="2524" r="10"/>` +
        `<path d="M740 2546l8-26 30-30 18 18-30 30zM760 2504l18 18"/>` +
        `<path d="M1060 2506h-30v44h44v-30M1050 2532l40-40 8 8-40 40h-8z"/></g>` + homeBar(w, h, '#000');
      return wrap(w, h, '', s);
    },
  });
})();
