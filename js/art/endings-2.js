/* Ending key art, part 2 (1200×900). Cinematic, emotional cards for the ending screen. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- core helpers ---------------------------------------------------------------------------
  const n = (v) => Math.round(v * 10) / 10;
  const f = Math.round;
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}"${x1 ? ` x1="${x1}"` : ''}${y1 ? ` y1="${y1}"` : ''} x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}"${cx !== 0.5 ? ` cx="${cx}"` : ''}${cy !== 0.5 ? ` cy="${cy}"` : ''}${r !== 0.5 ? ` r="${r}"` : ''}>${stops(s)}</radialGradient>`;
  let S = 1;
  const rnd = () => (S = (S * 16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + (b - a) * rnd();
  const n2 = (v) => Math.round(v * 100) / 100;
  const G = (x, y, s, c, sx) => `<g transform="translate(${n(x)} ${n(y)})${s != null && s !== 1 ? ` scale(${sx != null ? n2(sx) + ' ' : ''}${n2(s)})` : ''}">${c}</g>`;
  const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x ? ' ' + x : ''}/>`;
  const ST = (d, c, w, x = '') => `<path class="s" d="${d}" stroke="${c}" stroke-width="${w}"${x ? ' ' + x : ''}/>`;
  const op = (o) => `opacity="${o}"`;
  const SANS = 'Inter, -apple-system, Helvetica, Arial, sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const txt = (x, y, s, o) =>
    `<text x="${x}" y="${y}" font-family='${o.font || SANS}' font-size="${o.size}"${o.weight ? ` font-weight="${o.weight}"` : ''}` +
    `${o.ls != null ? ` letter-spacing="${o.ls}"` : ''}${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.tr ? ` transform="${o.tr}"` : ''} fill="${o.fill || '#fff'}"${o.op != null ? ` opacity="${o.op}"` : ''}>${s}</text>`;

  // Gradients requested by helpers are collected and emitted with each picture.
  let NEED = new Set();
  const GR = {};
  // OVR maps a gradient id to a flat colour for one picture (saves bytes where the gradient would not show).
  let OVR = {};
  const u = (id) => { if (OVR[id]) return OVR[id]; if (GR[id]) NEED.add(id); return `url(#${id})`; };
  let SKIN = ['#ffe7d6', '#f7cdb0', '#e3a586', '#c98468'];
  const setSkin = (k) => { SKIN = k; };
  GR.sk = () => lg('sk', [[0, SKIN[0]], [0.6, SKIN[1]], [1, SKIN[2]]], 0.2, 0, 0.8, 1);
  GR.hC = () => lg('hC', [[0, '#d9743e'], [0.5, '#b44c26'], [1, '#7a2c16']]);
  GR.hG = () => lg('hG', [[0, '#ee8a46'], [0.55, '#cf6430'], [1, '#9c3c1c']]);
  GR.hZ = () => lg('hZ', [[0, '#4a3022'], [0.6, '#32201a'], [0.85, '#7a4f26'], [1, '#d9a44a']]);
  GR.hL = () => lg('hL', [[0, '#fff1b8'], [0.5, '#f2d27a'], [1, '#d6a84a']]);
  GR.hH = () => lg('hH', [[0, '#5a3428'], [1, '#2c1a17']]);
  GR.jC = () => lg('jC', [[0, '#8a8f99'], [1, '#4c515c']], 0, 0, 0.6, 1);
  GR.sC = () => lg('sC', [[0, '#e04a4a'], [1, '#9c1f2a']], 0, 0, 0.4, 1);
  GR.cZ = () => lg('cZ', [[0, '#4a362a'], [1, '#221812']], 0, 0, 0.5, 1);
  GR.hy = () => lg('hy', [[0, '#bff0ff'], [0.4, '#3aa0e6'], [1, '#1d5fa8']], 0, 0, 1, 1);
  GR.gr = () => lg('gr', [[0, '#5d6878'], [1, '#2c3240']], 0, 0, 0.5, 1);

  const GRAIN =
    `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" result="n"/>` +
    `<feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .7 0 0 0 -.4"/></filter>`;
  const pic = (sd, fn) => () => { NEED = new Set(); OVR = {}; S = sd; return fn(); };
  // Path data and opacity minifier (keeps every picture well under the 25 KB budget)
  const mini = (x) => x.replace(/ d="([^"]*)"/g, (m, d) => ' d="' + d.replace(/ -/g, '-').replace(/([^\d])0\./g, '$1.') + '"')
    .replace(/(opacity|offset)="0\./g, '$1=".').replace(/ y="0"/g, '');
  const svg = (defs, body, g = 0.35, v = 0.6) => mini(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><style>.s{fill:none;stroke-linecap:round;stroke-linejoin:round}</style><defs>${GRAIN}${rg('vig', [[0.55, '#000', 0], [1, '#000', 1]], 0.5, 0.5, 0.75)}` +
    `${defs}${[...NEED].map((k) => GR[k]()).join('')}</defs>${body}` +
    `<rect width="1200" height="900" fill="url(#vig)" opacity="${v}"/><rect width="1200" height="900" filter="url(#grain)" opacity="${g}"/></svg>`);

  // Many circles in one path
  const dots = (k, x0, x1, y0, y1, r0, r2) => {
    let d = '';
    for (let i = 0; i < k; i++) {
      const r = rr(r0, r2), x = rr(x0, x1), y = rr(y0, y1);
      d += `M${f(x + r)} ${f(y)}a${n(r)} ${n(r)} 0 1 0 .1 0`;
    }
    return d;
  };
  // Dots as zero-length round-capped strokes (half the bytes of arcs): use with ST(sd(...), colour, diameter)
  const sd = (k, x0, x1, y0, y1) => { let d = ''; for (let i = 0; i < k; i++) d += `M${f(rr(x0, x1))} ${f(rr(y0, y1))}h0`; return d; };
  // Smooth path through points (Catmull-Rom → cubic Bézier)
  function crv(p, closed) {
    const N = p.length, g = (i) => p[closed ? (i + N) % N : Math.max(0, Math.min(N - 1, i))];
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 0; i < (closed ? N : N - 1); i++) {
      const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
      d += `C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`;
    }
    return d + (closed ? 'Z' : '');
  }
  // Sample a Catmull-Rom spline
  function samp(p, k) {
    const out = [], N = p.length, g = (i) => p[Math.max(0, Math.min(N - 1, i))];
    for (let s = 0; s <= k; s++) {
      const tt = (s / k) * (N - 1), i = Math.min(N - 2, Math.floor(tt)), t = tt - i;
      const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2), t2 = t * t, t3 = t2 * t;
      const q = (j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - e[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + e[j]) * t3);
      out.push([q(0), q(1)]);
    }
    return out;
  }
  // Tapered ribbon along a spline; wf(t) gives the half-width. Returns {d, L, R, pts}
  function ribbon(p, wf, k = 36) {
    const pts = samp(p, k), L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const w = wf(i / (pts.length - 1));
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    const pl = (a) => a.map((q) => `${f(q[0])} ${f(q[1])}`).join('L');
    return { d: `M${pl(L)}L${pl(R.slice().reverse())}Z`, L, R, pts };
  }
  const poly = (a) => 'M' + a.map((q) => `${f(q[0])} ${f(q[1])}`).join('L');
  // Fluffy cloud edge along an ellipse arc (deg; 0 = right, 90 = down)
  function fluff(cx, cy, rx, ry, a0, a1, k, amp, cmd) {
    const Pt = (a, r) => [cx + (rx + r) * Math.cos((a * Math.PI) / 180), cy + (ry + r) * Math.sin((a * Math.PI) / 180)];
    const st = (a1 - a0) / k;
    let d = '';
    for (let i = 0; i <= k; i++) {
      const a = a0 + st * i, [x, y] = Pt(a, 0);
      if (i === 0) { d += (cmd || 'M') + f(x) + ' ' + f(y); continue; }
      const m = amp * rr(0.6, 1.3), [c1x, c1y] = Pt(a - st * 0.8, m * 0.6), [tx, ty] = Pt(a - st * 0.45, m), [c2x, c2y] = Pt(a - st * 0.1, m * 0.3);
      d += `Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)}Q${f(c2x)} ${f(c2y)} ${f(x)} ${f(y)}`;
    }
    return d;
  }
  const cloud = (cx, cy, rx, ry, amp) => fluff(cx, cy, rx, ry, 180, 360, 7, amp) + `Q${f(cx + rx)} ${f(cy + ry * 0.5)} ${f(cx)} ${f(cy + ry * 0.4)}Q${f(cx - rx)} ${f(cy + ry * 0.5)} ${f(cx - rx)} ${f(cy)}Z`;
  // Rain streaks
  const rain = (k, x0, x1, y0, y1, len, ang) => {
    let d = '';
    for (let i = 0; i < k; i++) {
      const x = rr(x0, x1), y = rr(y0, y1), l = len * rr(0.6, 1.3);
      d += `M${f(x)} ${f(y)}l${n(ang * l)} ${f(l)}`;
    }
    return d;
  };
  // Lightning bolt path
  function bolt(x, y, len, dir, k) {
    let d = `M${f(x)} ${f(y)}`, br = '';
    for (let i = 0; i < k; i++) {
      x += rr(-1, 1) * 34 + dir * 10; y += len / k;
      d += `L${f(x)} ${f(y)}`;
      if (rnd() < 0.35) br += `M${f(x)} ${f(y)}l${f(rr(-60, 60))} ${f(rr(30, 70))}l${f(rr(-20, 20))} ${f(rr(20, 40))}`;
    }
    return d + br;
  }

  // ---- characters -----------------------------------------------------------------------------
  // Canonical head: skull top y=-47, face ±37, chin y=46, eyes y=5 (x ±15), mouth y=28, neck to y=64.
  // o.t: turn (-1..1, + looks to viewer's right). o.ex: open|happy|closed|soft. o.mo: smile|grin|laugh|soft|flat|o.
  const INK = '#2a1a1c';
  // Shared face parts are symbols; iris colour = currentColor, the highlight takes fill-opacity from the <use>.
  const lash = (d, w = 3.4) => `<path class="s" d="${d}" stroke="${INK}" stroke-width="${w}"/>`;
  const IRIS = '<ellipse cy="-.5" rx="7.5" ry="9.5" fill="currentColor" fill-opacity="1"/><path d="M-6 3Q0 11 6 3Q4 8 0 8Q-4 8-6 3Z" fill="#fff" fill-opacity=".3"/><ellipse rx="3.6" ry="5" fill="#140c14" fill-opacity=".75"/><circle cx="2.6" cy="-3.6" r="2.3" fill="#fff"/>';
  GR.eo = () => `<g id="eo">${IRIS}${lash('M-10-6Q-2-13 10-7')}</g>`;
  GR.es = () => `<g id="es"><use href="#eo"/><path d="M-11-14H11V-2Q0-6-11-2Z" fill="${SKIN[1]}" fill-opacity="1"/>${lash('M-10-2Q0-6 10-2', 3.2)}</g>`;
  GR.eh = () => `<g id="eh">${lash('M-8 3Q0-7 8 3')}</g>`;
  GR.ec = () => `<g id="ec">${lash('M-9-1Q0 6 9-1', 3)}${lash('M-9-1l-3-2M9-1l3-2', 1.6)}</g>`;
  // face base: ears, skin, jaw shade (light from the left; o.lr mirrors it)
  GR.fb = () => `<g id="fb"><path d="M-35 0C-45-6-47 14-36 18Z" fill="${SKIN[1]}"/><path d="M35 0C45-6 47 14 36 18Z" fill="${SKIN[2]}"/>` +
    `<path d="M-37-6C-37-33-21-47 0-47C21-47 37-33 37-6C37 16 27 31 14 40C8 44 3 46 0 46C-3 46-8 44-14 40C-27 31-37 16-37-6Z" fill="url(#sk)"/>` +
    `<path d="M37-6C37 16 27 31 14 40C8 44 3 46 0 46C22 34 29 14 33-8Z" fill="${SKIN[2]}" opacity=".4"/></g>`;
  GR.bw = () => `<path id="bw" class="s" d="M-22-10Q-15-15-8-11M8-11Q15-15 22-10" stroke="currentColor" stroke-width="2.6"/>`;
  GR.bk = () => rg('bl', [[0, '#ff6f6f', 0.45], [1, '#ff6f6f', 0]]) + `<g id="bk"><ellipse cx="-22" cy="19" rx="10" ry="6" fill="url(#bl)"/><ellipse cx="22" cy="19" rx="10" ry="6" fill="url(#bl)"/><path class="s" d="M1.5 14q-2 4 1.5 5" stroke="${SKIN[3]}" stroke-width="2"/></g>`;
  const MO = {
    smile: ST('M-7 26Q0 32 7 26', '#9a3c3c', 2.6),
    soft: ST('M-5 28Q0 31 5 28', '#9a4848', 2.4),
    flat: ST('M-5 29Q0 30 5 29', '#8a4040', 2.4),
    smirk: ST('M-6 29Q2 31 7 25', '#9a3c3c', 2.6),
    grin: P('M-9 24Q0 27 9 24Q7 35 0 35Q-7 35-9 24Z', '#8c2d33') + P('M-7 25Q0 27 7 25L6 28H-6Z', '#fff'),
    laugh: P('M-11 22Q0 25 11 22Q9 38 0 38Q-9 38-11 22Z', '#7d232b') + P('M-8 23Q0 25 8 23L7 26H-7Z', '#fff') + P('M-5 34Q0 30 5 34Q0 37-5 34Z', '#e0707a'),
    o: '<ellipse cy="29" rx="4.5" ry="5" fill="#7d232b"/>',
  };
  for (const k in MO) GR['m' + k] = () => `<g id="m${k}">${MO[k]}</g>`;
  const use = (id, x, y, ex = '') => `<use href="#${u(id).slice(5, -1)}"${x ? ` x="${x}"` : ''}${y ? ` y="${y}"` : ''}${ex}/>`;

  // Face (skin, ears, eyes, brows, mouth). Draw back hair before, front hair after.
  // o.t: turn (-1..1, + looks to viewer's right). o.ex: open|happy|closed|soft. o.mo: smile|grin|laugh|soft|flat|smirk|o.
  function face(o) {
    const t = o.t || 0, dx = f(t * 9);
    const sL = n(1 - Math.max(0, -t) * 0.35), sR = n(1 - Math.max(0, t) * 0.35), sy = o.ey || 1;
    const ex = { open: 'eo', soft: 'es', happy: 'eh', closed: 'ec' }[o.ex || 'open'];
    if (ex === 'es') u('eo');
    u('sk');
    const hl = o.hl != null ? ` fill-opacity="${o.hl}"` : '';
    const shut = ex === 'eh' || ex === 'ec';
    const eyeU = (x, sx) => `<use href="#${u(ex).slice(5, -1)}" ${!shut && (sx !== 1 || sy !== 1) ? `transform="translate(${x} 5) scale(${sx} ${sy})"` : `x="${x}" y="5"`}${shut ? '' : ` color="${o.eye || '#3a6ab0'}"${hl}`}/>`;
    const sc = (o.lr ? -1 : 1) * (o.round ? 1.06 : 1);
    let s = use('fb', 0, 0, sc !== 1 ? ` transform="scale(${sc} 1)"` : '');
    if (o.fr) s += ST(sd(7, -30 + dx, -14 + dx, 13, 21) + sd(7, 14 + dx, 30 + dx, 13, 21), '#c0703e', 2.2, op(0.7));
    s += use('bk', dx, 0, o.blush != null ? ` opacity="${o.blush}"` : '');
    s += eyeU(-15 + dx, sL) + eyeU(15 + dx, sR);
    if (o.liner) s += ST(`M${-25 + dx} 0l-5 1M${25 + dx} 0l5 1`, o.liner, 2.4);
    s += use('bw', dx, 0, ` color="${o.brow || '#6a3020'}"`) + use('m' + (o.mo || 'smile'), dx, 0);
    return s;
  }
  const neck = (w = 11, y1 = 66) => P(`M-${w} 26V${y1}H${w}V26Z`, u('nk'));
  GR.nk = () => lg('nk', [[0.5, SKIN[3]], [0.8, SKIN[2]]]);

  // Hair locks: quadratic curves between points, bowed sideways by b (swept, strand-like edges)
  function jag(pts, b = 0.18, m = 'M') {
    let d = `${m}${pts[0][0]} ${pts[0][1]}q`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], c = pts[i];
      d += `${f((c[0] - a[0]) / 2 - (c[1] - a[1]) * b)} ${f((c[1] - a[1]) / 2 + (c[0] - a[0]) * b)} ${c[0] - a[0]} ${c[1] - a[1]} `;
    }
    return d.trim();
  }
  const HAIR = {
    // Childe: shaggy outline; fringe swept to his right with a long lock between the eyes
    childeF: jag([[-42, 30], [-40, 12], [-50, 2], [-44, -10], [-52, -24], [-44, -34], [-44, -50], [-26, -56], [-14, -68], [2, -60], [20, -66], [34, -54], [48, -46], [46, -32], [54, -18], [46, -8], [50, 8], [42, 12], [44, 30],
      [38, 8], [36, -6], [30, 6], [27, -14], [17, 2], [13, -18], [3, 8], [-2, -16], [-12, 0], [-17, -17], [-27, -4], [-31, -15], [-37, 6], [-40, -6], [-42, 30]], 0.15) + 'Z',
    childeB: 'M-46 0C-52 24-44 40-34 48L-28 20H28L34 48C44 40 52 24 46 0Z',
    mask: '<g transform="translate(-40 -44) rotate(-34)"><path d="M-25-2C-23-13-11-16-3-13L0-26L3-13C11-16 23-13 25-2C23 7 13 11 0 9C-13 11-23 7-25-2Z" fill="#c8323c" stroke="#5e1018" stroke-width="2.4"/><path d="M-18-3Q-11-9-5-3Q-11 2-18-3ZM18-3Q11-9 5-3Q11 2 18-3Z" fill="#1e060a"/><path class="s" d="M-21-6C-17-11-11-12-5-11" stroke="#ff9a8a" stroke-width="2.4"/></g>',
    // Zhongli: sleek crown, side part, long front locks with amber tips
    zlB: 'M-42-14C-46 26-42 56-34 74L-20 70L-22 30H22L20 70L34 74C42 56 46 26 42-14Z',
    zlF: jag([[-38, 46], [-42, 10], [-44, -24], [-34, -48], [-12, -60], [14, -58], [34, -46], [44, -22], [42, 10], [38, 46], [34, 18], [32, 0], [28, -12], [24, -2], [18, -18], [12, -2], [6, -22], [-2, 0], [-6, -20], [-14, -4], [-20, -18], [-28, -6], [-31, -10], [-33, 14], [-38, 46]], 0.12) + 'Z',
    tonF: jag([[-40, 20], [-46, -14], [-36, -46], [-10, -60], [18, -58], [40, -42], [46, -14], [40, 22], [36, -4], [30, -16], [20, -24], [6, -28], [-6, -22], [-12, -8], [-20, -20], [-28, -10], [-34, 4], [-40, 20]], 0.14) + 'Z',
    anF: jag([[-41, 16], [-50, -6], [-44, -18], [-50, -40], [-30, -56], [-16, -66], [4, -58], [24, -64], [36, -50], [52, -36], [46, -18], [50, 4], [41, 16], [38, -4], [28, -12], [22, 0], [14, -14], [4, 0], [-4, -16], [-14, -2], [-20, -16], [-30, -4], [-36, -10], [-41, 16]], 0.15) + 'Z',
    teuF: jag([[-38, 12], [-42, -4], [-34, 2], [-30, -6], [-22, 6], [-16, -4], [-8, 6], [0, -4], [8, 6], [16, -4], [22, 6], [30, -6], [34, 2], [42, -4], [38, 12]], 0.1),
    lumF: jag([[-38, 40], [-46, 0], [-44, -30], [-26, -54], [2, -60], [30, -52], [46, -30], [46, 2], [38, 40], [34, 10], [32, -8], [24, -2], [20, -20], [12, -2], [6, -26], [-2, -2], [-8, -24], [-18, -4], [-22, -18], [-30, -4], [-34, 12], [-38, 40]], 0.12) + 'Z',
    bobF: jag([[-44, 40], [-48, 0], [-42, -36], [-18, -58], [10, -58], [36, -44], [48, -10], [46, 40], [36, 30], [36, -6], [30, -16], [20, -10], [12, -20], [2, -10], [-8, -20], [-16, -10], [-26, -18], [-34, -6], [-36, 30], [-44, 40]], 0.08) + 'Z',
    htF: jag([[-40, 30], [-46, -20], [-30, -50], [0, -58], [30, -50], [46, -20], [40, 30], [34, -8], [26, -18], [20, -6], [12, -20], [4, -6], [-4, -20], [-12, -6], [-20, -20], [-28, -6], [-34, -10], [-40, 30]], 0.1) + 'Z',
    yelF: jag([[-46, 44], [-48, 0], [-40, -36], [-14, -58], [14, -58], [38, -42], [48, -14], [44, 14], [36, -4], [30, -18], [18, -12], [10, -26], [-2, -8], [-14, -24], [-26, -10], [-32, 10], [-36, 36], [-46, 44]], 0.08) + 'Z',
  };
  // A braid hanging from (x,y), k plaits
  const braid = (x, y, k, fill) => {
    let d = '';
    for (let i = 0; i < k; i++) d += `M${x - 8} ${y + i * 12}q8 ${i % 2 ? 4 : 10} 16 ${i % 2 ? 6 : 0}`;
    return ST(`M${x} ${y - 6}V${y + k * 12}`, fill, 20) + ST(d, '#8c3418', 1.8, op(0.7));
  };

  // Generic rounded shoulders/torso, canonical units (cut at y=yb)
  const torso = (w, yb, fill) => P(`M-14 50C-32 54-${w - 6} 60-${w} 86L-${w + 4} ${yb}H${w + 4}L${w} 86C${w - 6} 60 32 54 14 50Z`, fill);
  const mg = (a, b) => Object.assign({}, a, b);

  // ---- cast (busts at canonical scale; o.body=false for head only) -------------------------------
  const CH = {
    childe(o) {
      const b = o.body !== false;
      return P(HAIR.childeB, u('hC')) +
        (b ? torso(58, 190, u('jC')) + P('M-14 50L0 100L14 50Z', '#23262d') + P('M-14 50L-4 98L-30 62ZM14 50L4 98L30 62Z', '#6c717c') : '') +
        neck() +
        (b ? P('M-24 44C-14 58 14 58 24 44L30 60C14 76-14 76-30 60Z', u('sC')) + P('M8 64C16 92 10 128 18 160L36 156C26 126 32 92 26 60Z', u('sC')) : '') +
        face(mg({ eye: '#2a5fa0', hl: 0.5, brow: '#8a3a1c' }, o)) +
        P(HAIR.childeF, u('hC')) + ST('M-30-48Q-8-60 22-56M10-58Q24-56 34-46', '#f39a62', 3, op(0.55)) + HAIR.mask;
    },
    zhongli(o) {
      const b = o.body !== false;
      return P(HAIR.zlB, u('hZ')) + neck(10, 50) +
        (b ? torso(58, 190, u('cZ')) + P('M-15 34L-17 66Q0 74 17 66L15 34Q0 40-15 34Z', '#2a1d16') + ST('M-17 66Q0 74 17 66M-6 72L-10 190M6 72L10 190', '#c9a24a', 3) +
          `<circle cy="74" r="5" fill="#e0a83a"/>` : '') +
        face(mg({ eye: '#d99a32', liner: '#b8402a', brow: '#3a2418', blush: 0.35, ey: 0.86 }, o)) +
        P(HAIR.zlF, u('hZ'))  +
        `<g transform="translate(${o.t > 0.3 ? -41 : 41} 16)">${ST('M0 0V26', '#c9a24a', 1.6)}<circle cy="27" r="3" fill="#e0b84a"/>${P('M-3 29L-4 52H4L3 29Z', '#d4a63c')}</g>`;
    },
    teucer(o) {
      const b = o.body !== false;
      return (b ? torso(50, 170, '#3b6fb8') + P('M-22 48C-10 60 10 60 22 48L26 62C10 74-10 74-26 62Z', '#f2c14e') : '') + neck(10, 56) +
        face(mg({ round: 1, fr: 1, eye: '#3a7ad0', brow: '#b0582a', mo: 'grin' }, o)) +
        P('M-42-4C-48 10-44 20-38 22L-34 4ZM42-4C48 10 44 20 38 22L34 4Z', u('hG')) + P(HAIR.teuF + 'L42-20H-42Z', u('hG')) +
        P('M-42-18C-44-58 44-58 42-18Z', '#3f80d4') + P('M-46-20C-30-30 30-30 46-20L46-4C30-12-30-12-46-4Z', '#2c62ad') +
        ST('M-30-25V-9M-15-28V-12M0-28V-12M15-28V-12M30-25V-9', '#4a8ae0', 2.4, op(0.6)) +
        `<circle cy="-60" r="13" fill="#f4f1ea"/><circle cx="-4" cy="-64" r="5" fill="#fff"/>`;
    },
    tonia(o) {
      const b = o.body !== false;
      return P(jag([[-40, -10], [-46, 30], [-36, 46], [36, 46], [46, 30], [40, -10]], 0.1) + 'Z', u('hG')) +
        (b ? torso(50, 190, '#6b5a7a') : '') + neck(10, 56) +
        (b ? P('M-26 44C-14 60 14 60 26 44L32 64C14 80-14 80-32 64Z', '#4f8f9a') + ST('M-28 60Q0 76 28 60', '#e9dfc6', 3, op(0.7)) + P('M12 70C18 96 14 120 20 146L36 142C30 118 34 94 28 66Z', '#4f8f9a') + ST('M16 128l18-4M18 136l18-4', '#e9dfc6', 3, op(0.7)) : '') +
        face(mg({ eye: '#3a78c8', brow: '#a8502a', blush: 0.6, mo: 'soft' }, o)) +
        P(HAIR.tonF, u('hG')) + braid(-36, 30, 7, '#c4582a') + `<rect x="-42" y="110" width="12" height="6" rx="2" fill="#4f8f9a"/>` + P('M-41 116L-36 130L-31 116Z', '#c4582a');
    },
    anthon(o) {
      const b = o.body !== false;
      return (b ? torso(54, 190, '#5f7a3a') + ST('M-20 50Q0 66 20 50', '#46602a', 5) : '') + neck(10, 56) +
        face(mg({ eye: '#3a78c8', brow: '#a8502a', fr: 1, mo: 'smirk' }, o)) +
        P(HAIR.anF, u('hG')) +
        ST('M-46 0C-50-60 50-60 46 0', '#2b2e36', 7) + `<rect x="-54" y="-6" width="14" height="26" rx="6" fill="#23262d"/><rect x="40" y="-6" width="14" height="26" rx="6" fill="#23262d"/>` +
        `<rect x="-52" y="2" width="4" height="10" rx="2" fill="#5fe08a"/>` + ST('M-48 16Q-40 36-18 34', '#23262d', 3);
    },
    mama(o) {
      const b = o.body !== false;
      return (b ? torso(56, 190, '#a8543a') + P('M-16 50L0 80L16 50', '#f2e6d4') + ST('M-30 80l4 6M30 80l-4 6', '#7a3424', 3) : '') + neck(10, 56) +
        P('M-46 30C-52 10-50-50 0-58C50-50 52 10 46 30C40 38 30 40 24 34L36 0C30-34-30-34-36 0L-24 34C-30 40-40 38-46 30Z', '#b82f3a') +
        face(mg({ eye: '#7a5a3a', brow: '#8a5a3a', ex: 'happy', mo: 'smile', blush: 0.7 }, o)) +
        P('M-36 0C-36-24-20-34 0-34C20-34 36-24 36 0C30-14 18-20 4-20L0-14L-4-20C-18-20-30-14-36 0Z', '#a8643e') +
        P('M-40 6C-44-44 44-44 40 6C34-24 18-38 0-38C-18-38-34-24-40 6Z', '#c23a44') +
        ST(sd(12, -34, 34, -48, -32), '#ffd9a0', 4.4, op(0.8)) + P('M24 34C34 44 44 54 40 66L50 60C52 48 42 38 30 30Z', '#b82f3a');
    },
    papa(o) {
      const b = o.body !== false;
      return (b ? torso(64, 190, '#2e3f5a') + P('M-18 48Q0 60 18 48L20 58Q0 72-20 58Z', '#3e5274') : '') + neck(11, 56) +
        face(mg({ eye: '#3a6aa0', brow: '#b8a090', mo: 'flat', blush: 0.4 }, o)) +
        ST('M-28-2q4 4 9 3M28-2q-4 4-9 3', SKIN[3], 1.8, op(0.6)) +
        P('M-39-6C-42 4-40 14-36 20L-33-4ZM39-6C42 4 40 14 36 20L33-4Z', '#b09888') +
        P('M-38 4C-40 34-24 58 0 60C24 58 40 34 38 4C34 16 28 22 18 24Q8 18 0 20Q-8 18-18 24C-28 22-34 16-38 4Z', '#b48a72') +
        ST('M-26 32q2 10 8 16M26 32q-2 10-8 16', '#d8c8b8', 2, op(0.6)) +
        P('M-18 24Q-8 14 0 19Q8 14 18 24Q10 30 0 26Q-10 30-18 24Z', '#9a705a') +
        (o.mo === 'laugh' || o.mo === 'grin' ? P('M-8 30Q0 32 8 30Q6 37 0 37Q-6 37-8 30Z', '#6d1f26') : '') +
        P('M-42-8C-46-32-30-52 0-52C34-52 50-34 44-8Z', '#24334d') + P('M-44-14H44V-4H-44Z', '#18202f') + P('M-38-6Q-6 10 28 0L30-6Z', '#0e1420') + ST('M-30-2Q-6 6 20 0', '#4a5a7a', 2, op(0.7));
    },
    hutao(o) {
      const b = o.body !== false;
      return P('M-38-10C-60 40-56 100-44 140L-30 60ZM38-10C60 40 56 100 44 140L30 60Z', u('hH')) +
        (b ? torso(50, 190, '#4a2e26') + P('M-16 50L0 74L16 50Z', '#2a1a16') + `<circle cx="-30" cy="78" r="6" fill="#c8303a"/>` : '') + neck(10, 56) +
        face(mg({ eye: '#c8303a', brow: '#3a2320', mo: 'grin' }, o)) +
        P(HAIR.htF, u('hH')) +
        P('M-54-32Q0-42 54-32L50-24Q0-32-50-24Z', '#1c1416') + P('M-32-34L-30-56Q0-62 30-56L32-34Z', '#231a1c') + P('M-32-42Q0-46 32-42V-34Q0-38-32-34Z', '#7a2a2a') +
        `<circle cx="20" cy="-40" r="6" fill="#e86a7a"/><circle cx="28" cy="-44" r="5" fill="#f08a96"/><circle cx="20" cy="-40" r="2" fill="#ffd36a"/>` +
        P('M-40-36L-48-10L-38-8L-32-34Z', '#c8323c') + ST('M-42-26q3 4-1 8', '#f0c84a', 1.6);
    },
    lumine(o) {
      const b = o.body !== false;
      return P('M-42-10C-48 20-44 40-38 50L36 50C44 40 48 20 42-10Z', u('hL')) +
        (b ? torso(50, 190, '#f2f0ea') + P('M-22 50Q0 66 22 50L24 60Q0 76-24 60Z', '#d4a63c') + ST('M-50 100Q0 120 50 100', '#3a4a7a', 3, op(0.5)) : '') + neck(10, 56) +
        face(mg({ eye: '#d4a23a', brow: '#b8903a', blush: 0.6, mo: 'soft' }, o)) +
        P(HAIR.lumF, u('hL')) +
        `<g transform="translate(36 -30)"><circle r="8" fill="#fff"/><circle cx="-8" cy="4" r="7" fill="#f4f4f4"/><circle cx="6" cy="8" r="7" fill="#eee"/><circle cx="-2" cy="2" r="3.5" fill="#9ad0f0"/></g>`;
    },
    ekat(o) {
      const b = o.body !== false;
      return P('M-44 40C-50 0-46-40 0-56C46-40 50 0 44 40Z', '#2a2230') +
        (b ? torso(50, 190, '#24314f') + P('M-30 52C-16 66 16 66 30 52L36 70C16 86-16 86-36 70Z', '#e8e4dc') + P('M-12 66L0 100L12 66Z', '#f4f1ea') + `<circle cx="-30" cy="104" r="5" fill="#c9a24a"/>` : '') + neck(10, 56) +
        face(mg({ eye: '#5a4a6a', brow: '#2a2230', mo: 'smile' }, o)) +
        P(HAIR.bobF, '#2e2534') ;
    },
    yelan(o) {
      const b = o.body !== false;
      return P('M-44 44C-50 0-46-40 0-56C46-40 50 0 46 20Z', '#25335c') +
        (b ? torso(54, 190, '#f2f2f2') + P('M-14 50L0 80L14 50Z', '#1e2a4a') + P('M-62 90C-50 60-30 54-16 52L-10 70C-30 72-46 84-52 100ZM62 90C50 60 30 54 16 52L10 70C30 72 46 84 52 100Z', '#e6e1d8') : '') + neck(10, 56) +
        face(mg({ eye: '#2f9a6a', brow: '#1e2a4a', mo: 'smirk', ex: 'soft' }, o)) +
        P(HAIR.yelF, '#2b3a68') + ST('M-22-50Q0-58 22-48', '#5a6aa0', 3, op(0.6));
    },
    // Fatui grunt: burly, pale face-plate mask, stubble. o.hat: 'elf' | 'ushanka' | 'none'
    grunt(o) {
      const b = o.body !== false;
      const hat = o.hat === 'elf'
        ? P('M-46-14C-40-50-10-66 20-60C40-56 60-30 76-6L62 4C52-14 40-30 30-30C40-18 44-10 46-14Z', '#2f8f4a') + P('M-50-20C-20-30 20-30 50-20L50-6C20-14-20-14-50-6Z', '#e8e2d6') + `<circle cx="72" cy="4" r="9" fill="#f2c14e"/>`
        : o.hat === 'none' ? P(jag([[-40, -4], [-44, -30], [-26, -50], [0, -54], [26, -50], [44, -30], [40, -4], [30, -26], [0, -30], [-30, -26], [-40, -4]], 0.06) + 'Z', '#4a3a30')
          : P('M-44-6C-48-56 48-56 44-6Z', '#3a3f4a') + P('M-50-18C-20-28 20-28 50-18V0C20-10-20-10-50 0Z', '#7a6450') + P('M-52-10L-56 30L-40 26L-40-6ZM52-10L56 30L40 26L40-6Z', '#7a6450');
      return (b ? torso(84, 200, u('gr')) + P('M-40 50C-20 70 20 70 40 50L52 74C20 96-20 96-52 74Z', '#8a7258') + P('M-6 110l6-9 6 9-6 9Z', '#9fd8ff') : '') + neck(15, 56) +
        `<g transform="scale(1.08 1)">${face(mg({ ex: 'happy', mo: 'grin', blush: 0.3, brow: '#4a3a30' }, o))}</g>` +
        ST(sd(12, -26, 26, 32, 46), '#6a5040', 2.2, op(0.5)) +
        (o.mask !== false ? P('M-42-26C-40-44 40-44 42-26L40 12C26 18 10 14 0 10C-10 14-26 18-40 12Z', '#d3dbe2') + P('M-30-2L-8-6L-10 4ZM30-2L8-6L10 4Z', '#1a202a') + ST('M0-38V8', '#aab6c2', 2.4) + ST('M-38 2C-30 8-12 8 0 6', '#fff', 2, op(0.5)) : '') + hat;
    },
  };
  CH.paimon = (o) => {
    return P('M-28 44C-56 80-62 150-46 182L46 182C62 150 56 80 28 44Z', '#1d2758') + ST('M-30 120h0M12 100h0M30 150h0M-12 160h0M-36 80h0M38 96h0', '#cfe0ff', 4) +
      P('M-18 46C-28 70-30 110-24 128H24C30 110 28 70 18 46Z', '#f6f4ef') + ST('M-24 120H24', '#d4a63c', 4) +
      P('M-18 128L-16 176H-4L-2 128ZM2 128L4 176H16L18 128Z', '#f6f4ef') + neck(8, 54) +
      P('M-46-12C-52 20-48 42-40 48L40 48C48 42 52 20 46-12Z', '#e4e2f0') +
      face(mg({ round: 1, eye: '#8a5ad0', brow: '#c8c4dc', mo: 'laugh', ey: 1.15 }, o)) +
      P(jag([[-46, 30], [-50, -16], [-34, -50], [0, -60], [34, -50], [50, -16], [46, 30], [38, 0], [34, -16], [24, -8], [16, -20], [6, -8], [-4, -20], [-14, -8], [-24, -20], [-32, -8], [-38, 0], [-46, 30]], 0.08) + 'Z', '#fbfbff') +
      ST('M-26-48Q0-58 26-48', '#fff', 3) + `<ellipse cy="-72" rx="30" ry="8" fill="none" stroke="#3a3f7a" stroke-width="3" opacity=".7"/>` +
      P('M0-92L5-78L20-77L8-68L12-54L0-62L-12-54L-8-68L-20-77L-5-78Z', '#232a5c');
  };
  // limbs: rounded stroke sleeve + hand
  const arm = (d, c, w) => ST(d, c, w);
  const hand = (x, y, r = 9, k = SKIN[1]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${k}"/>`;
  // Liyue paper lantern
  GR.lan = () => `<g id="lan"><circle r="46" fill="${u('lglow')}"/>` + ST('M0-40V-24', '#3a2418', 2) +
    P('M-14-24H14L18-18C24-8 24 8 18 18L14 24H-14L-18 18C-24 8-24-8-18-18Z', '#d8342c') + ST('M-8-22C-14-8-14 8-8 22M8-22C14-8 14 8 8 22', '#ffb070', 2, op(0.6)) +
    P('M-12-24H12V-20H-12ZM-12 20H12V24H-12Z', '#e8b04a') + ST('M0 24V40', '#e8b04a', 3) + '</g>';
  const lantern = (x, y, s = 1) => { u('lglow'); return `<use href="#${u('lan').slice(5, -1)}" transform="translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${s})` : ''}"/>`; };
  GR.lglow = () => rg('lglow', [[0, '#ffd080', 0.75], [0.4, '#ffa040', 0.25], [1, '#ff8030', 0]]);

  // Back views (head seen from behind; canonical head coords)
  const BACK = {
    childe: () => P('M-38 4C-46 12-44 26-34 26ZM38 4C46 12 44 26 34 26Z', SKIN[2]) +
      P(jag([[-36, 40], [-44, 20], [-52, 6], [-46, -8], [-54, -24], [-44, -36], [-42, -52], [-24, -58], [-12, -68], [4, -60], [20, -66], [34, -54], [48, -44], [46, -30], [54, -18], [46, -6], [50, 8], [42, 20], [36, 40], [26, 30], [16, 46], [6, 34], [-4, 48], [-14, 32], [-24, 44], [-30, 30], [-36, 40]], 0.13) + 'Z', u('hC')) +
      ST('M-20-40Q0-50 22-40M-30-10Q-20-24-8-30M30-6Q22-20 10-28', '#f39a62', 3, op(0.45)) +
      '<g transform="scale(-1 1)">' + HAIR.mask + '</g>',
    tonia: () => P('M-38 4C-46 12-44 26-34 26ZM38 4C46 12 44 26 34 26Z', SKIN[2]) +
      P(jag([[-36, 40], [-46, 10], [-44, -24], [-30, -50], [0, -58], [30, -50], [44, -24], [46, 10], [36, 40], [16, 50], [-16, 50], [-36, 40]], 0.08) + 'Z', u('hG')) +
      ST('M0-56Q-4-20 0 44M-24-44Q-30-10-24 30M24-44Q30-10 24 30', '#8c3418', 2, op(0.35)),
  };
  // Back torso: shoulders seen from behind (cut at yb)
  const backT = (w, yb, fill) => P(`M-16 40C-36 46-${w - 4} 54-${w} 84L-${w + 4} ${yb}H${w + 4}L${w} 84C${w - 4} 54 36 46 16 40Z`, fill);

  JC.art._a7 = { CH, face, HAIR, lantern, setSkin, reset: () => { NEED = new Set(); } };
  const who = (name, x, y, s, o = {}) => G(x, y, s, CH[name](o), o.flip ? -s : null);

  // ---- 2. The Toy Factory ----------------------------------------------------------------------
  GR.bal = () => `<g id="bal"><path class="s" d="M0 34Q8 70-4 110" stroke="#fff" stroke-width="1.5" opacity=".7"/><ellipse rx="26" ry="32"/><path d="M-4 31h8l-4 6Z"/><ellipse cx="-9" cy="-12" rx="6" ry="10" fill="#fff" opacity=".45" transform="rotate(25 -9 -12)"/></g>`;
  const balloon = (x, y, c, s = 1) => `<use href="#${u('bal').slice(5, -1)}" transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}" fill="${c}"/>`;
  def('end_teucer', {
    title: 'The Toy Factory', w: 1200, h: 900, tags: ['ending', 'family', 'northland', 'teucer', 'zhongli'],
    svg: pic(2, () => {
      setSkin(['#fff0e2', '#f9d4b6', '#e8aa88', '#c98466']);
      let bunt = '', conf = '';
      const cols = ['#e04848', '#3a8ae0', '#f2c14e', '#4ab070'];
      for (let i = 0; i < 14; i++) {
        const x = 40 + i * 82, y = 2 + Math.sin(((x - 40) / 1066) * Math.PI) * 70;
        bunt += `<path d="M${x} ${f(y)}l34 2-16 34Z" fill="${cols[i % 4]}"/>`;
      }
      for (let i = 0; i < 4; i++) conf += ST(sd(14, 0, 1200, 740, 900), cols[i], 7);
      const grunt = (o) => CH.grunt(Object.assign({ hat: 'elf' }, o));
      // Childe carrying Teucer on his shoulders (local coords of a bust at scale 1)
      const teucer = `<g transform="translate(0 -132) scale(.85)">` +
        ST('M-38 64L-74-40M38 64L80-46', '#3b6fb8', 22) + hand(-76, -48, 11) + hand(82, -54, 11) +
        `<g transform="translate(84 -80) rotate(12)">${P('M-13-12L-15-32L-3-16ZM13-12L15-32L3-16Z', '#9cb8d8')}<circle r="17" fill="#dce8f6"/><ellipse cy="9" rx="9" ry="7" fill="#f4f8fc"/><circle cx="-6" cy="-3" r="2.6" fill="#1e2a40"/><circle cx="6" cy="-3" r="2.6" fill="#1e2a40"/><ellipse cy="5" rx="3.4" ry="2.4" fill="#1e2a40"/></g>` +
        torso(48, 150, '#3b6fb8') + CH.teucer({ body: false, ex: 'happy', mo: 'laugh', t: 0.15 }) + '</g>';
      const childe =
        torso(60, 360, u('jC')) + P('M-16 52L0 124L16 52Z', '#23262d') + ST('M0 124V360', '#5a5f69', 3) + ST('M-16 52L-30 70L-4 140M16 52L30 70L4 140', '#5a5f69', 3) +
        ST('M-62 248H62', '#1e2026', 10) + P('M-46 256l9-14 9 14-9 14Z', u('hy')) + `<circle cx="-37" cy="256" r="20" fill="#8ad8ff" opacity=".22"/>` +
        teucer + P(HAIR.childeB, u('hC')) + neck() +
        P('M-24 44C-14 58 14 58 24 44L30 60C14 76-14 76-30 60Z', u('sC')) + P('M8 64C16 92 10 128 18 170L36 166C26 126 32 92 26 60Z', u('sC')) +
        face({ ex: 'happy', mo: 'laugh', brow: '#8a3a1c' }) + P(HAIR.childeF, u('hC')) + ST('M-30-48Q-8-60 22-56', '#f39a62', 3, op(0.55)) + HAIR.mask +
        // Teucer's legs draped over the shoulders, held at the ankles
        ST('M-22 46L-50 58L-46 150M22 46L50 58L46 150', '#2c3e66', 24) + P('M-60 146h28v24h-34ZM60 146h-28v24h34Z', '#6a4028') +
        ST('M-64 92L-94 192L-52 126M64 92L94 192L52 126', u('jC'), 28) + hand(-50, 124, 12) + hand(50, 124, 12);
      const zhongli =
        torso(58, 380, u('cZ')) + ST('M-6 72L-12 380M6 72L12 380', '#c9a24a', 3) + P('M-58 86L-64 380H-40L-30 120Z', '#2a1d16', op(0.6)) +
        neck(10, 50) + P('M-15 34L-17 66Q0 74 17 66L15 34Q0 40-15 34Z', '#2a1d16') + ST('M-17 66Q0 74 17 66', '#c9a24a', 3) + `<circle cy="74" r="5" fill="#e0a83a"/>` +
        P(HAIR.zlB, u('hZ')) + face({ t: -0.25, eye: '#d99a32', liner: '#b8402a', brow: '#3a2418', blush: 0.35, ey: 0.86, mo: 'smile' }) + P(HAIR.zlF, u('hZ')) +
        `<g transform="translate(41 16)">${ST('M0 0V26', '#c9a24a', 1.6)}<circle cy="27" r="3" fill="#e0b84a"/>${P('M-3 29L-4 52H4L3 29Z', '#d4a63c')}</g>` +
        ST('M-56 96Q-70 180-62 256', '#2a1d16', 24) + hand(-62, 262, 10, '#1e1a1c') +
        ST('M56 96Q76 180 40 218', '#2a1d16', 24) + hand(36, 222, 10, '#1e1a1c') + P('M20 198h32q-2 22-16 22q-14 0-16-22Z', '#bfe0cf', 'stroke="#7fa890" stroke-width="2"') + `<ellipse cx="36" cy="199" rx="15" ry="3" fill="#c98a3a"/>` +
        ST('M-12 60L-22 118M12 60L14 118', '#c8323c', 2.5) +
        `<g transform="translate(-4 154) rotate(-4)"><rect x="-44" y="-36" width="80" height="58" rx="5" fill="#fffdf6" stroke="#c9a24a" stroke-width="2"/><rect x="-44" y="-36" width="80" height="14" rx="5" fill="#c8323c"/>` +
        txt(-4, -6, 'FACTORY', { size: 13, weight: 800, anchor: 'middle', fill: '#2a1d16', ls: 0.5 }) + txt(-4, 12, 'MANAGER', { size: 13, weight: 800, anchor: 'middle', fill: '#2a1d16', ls: 0.5 }) + '</g>';
      let flake = '';
      for (let i = 0; i < 6; i++) flake += `<g transform="rotate(${i * 60})"><path d="M0 0V-46M0-22l-10-10M0-22l10-10M0-36l-7-7M0-36l7-7"/></g>`;
      return svg(
        lg('wall', [[0, '#c7cfda'], [0.6, '#dfe3e8'], [1, '#c3c8cf']]) + lg('floor', [[0, '#d8cfc2'], [1, '#9c9184']]) +
        lg('col', [[0, '#e9e4da'], [0.5, '#fbf8f2'], [1, '#cfc8bb']], 0, 0, 1, 0) + rg('lamp', [[0, '#fff3d0', 0.85], [1, '#ffe2a0', 0]]) +
        lg('beam', [[0, '#fff6dc', 0.5], [1, '#fff6dc', 0]]),
        `<rect width="1200" height="900" fill="url(#wall)"/>` +
        P('M0 300H1200M0 620H1200', 'none', 'stroke="#b4bcc8" stroke-width="4"') + ST('M200 320V600M400 320V600M800 320V600M1000 320V600', '#b9c1cc', 3, op(0.6)) +
        `<rect x="90" width="90" height="760" fill="url(#col)"/><rect x="1020" width="90" height="760" fill="url(#col)"/>` + ST('M110 0V760M135 0V760M160 0V760M1040 0V760M1065 0V760M1090 0V760', '#c6beb0', 3, op(0.7)) +
        `<circle cx="600" cy="150" r="260" fill="url(#lamp)"/>` +
        `<rect x="250" y="96" width="700" height="84" rx="6" fill="#3a4a66" stroke="#e0c070" stroke-width="4"/>` +
        `<g transform="translate(300 138) scale(.42)" fill="none" stroke="#e8eef6" stroke-width="7" stroke-linecap="round">${flake}</g>` +
        txt(560, 156, 'NORTHLAND', { size: 52, weight: 700, anchor: 'middle', fill: '#e8cf86', ls: 6, font: SERIF }) + txt(840, 156, 'BANK', { size: 52, weight: 700, anchor: 'middle', fill: '#e8cf86', ls: 6, font: SERIF }) +
        `<g transform="translate(846 140) rotate(-6)"><rect x="-96" y="-50" width="192" height="94" fill="#fffaf0" stroke="#e8dcc0" stroke-width="2"/>` + P('M-110-50l30 10v-16ZM110 40l-30-6v16Z', '#f2d58a', op(0.9)) +
        txt(0, 22, 'TOYS!', { size: 66, weight: 900, anchor: 'middle', fill: '#e04848', font: '"Comic Sans MS", "Chalkboard SE", ' + SANS }) + ST('M-70 34l140-2', '#3a8ae0', 4) + '</g>' +
        `<path d="M0 0Q600 160 1200 0" fill="none" stroke="#7a6a5a" stroke-width="2"/>` + bunt +
        `<g transform="translate(1065 430) rotate(-5)"><rect x="-52" y="-34" width="104" height="70" fill="#fff3a8"/>${txt(0, -6, 'TOY', { size: 22, weight: 900, anchor: 'middle', fill: '#3a8ae0', font: '"Comic Sans MS", ' + SANS })}${txt(0, 22, 'FACTORY →', { size: 18, weight: 900, anchor: 'middle', fill: '#3a8ae0', font: '"Comic Sans MS", ' + SANS })}</g>` +
        `<g transform="translate(135 360) rotate(4)"><rect x="-50" y="-26" width="100" height="56" fill="#fff"/>${txt(0, -2, 'NO BANKING', { size: 14, weight: 900, anchor: 'middle', fill: '#c8323c' })}${txt(0, 18, 'TODAY!!', { size: 14, weight: 900, anchor: 'middle', fill: '#c8323c' })}</g>` +
        P('M0 0L260 0L160 760H0ZM1200 0H980L1060 760H1200Z', 'url(#beam)', op(0.5)) +
        `<rect y="700" width="1200" height="200" fill="url(#floor)"/>` + ST('M0 760L300 700M260 900L560 700M640 900L760 700M1040 900L960 700', '#fff', 3, op(0.25)) +
        // boxes of toys
        `<g transform="translate(330 560)"><rect x="-70" y="-60" width="140" height="120" fill="#c89a5a"/><rect x="-70" y="-60" width="140" height="20" fill="#b0844a"/><rect x="-50" y="-160" width="110" height="100" fill="#d4a86a"/>${txt(5, -100, 'TOYS', { size: 24, weight: 900, anchor: 'middle', fill: '#8a5a2a' })}${txt(0, 10, 'FRAGILE', { size: 16, weight: 800, anchor: 'middle', fill: '#c8323c' })}</g>` +
        balloon(80, 200, '#e04848') + balloon(140, 170, '#3a8ae0') + balloon(110, 120, '#f2c14e') + balloon(1110, 170, '#4ab070') + balloon(1160, 210, '#e04848') + balloon(1060, 130, '#f2c14e') +
        balloon(330, 260, '#3a8ae0', 0.8) + balloon(990, 270, '#e04848', 0.8) +
        // grunts in elf hats
        G(110, 460, 1, grunt({ t: 0.3 }) + ST('M70 90Q120 40 120-60', u('gr'), 30) + hand(120, -70, 13) + ST('M120-70V-200', '#fff', 1.5, op(0.7))) +
        balloon(230, 236, '#f2c14e', 1.1) +
        `<ellipse cx="560" cy="905" rx="200" ry="30" fill="#5a4a3a" opacity=".3"/><ellipse cx="880" cy="905" rx="150" ry="24" fill="#5a4a3a" opacity=".3"/>` +
        G(880, 404, 1.42, zhongli) +
        G(230, 520, 1.25, grunt({ t: 0.35, ex: 'closed', mo: 'laugh' }) + `<g transform="translate(10 160)"><rect x="-62" y="-50" width="124" height="96" fill="#e04848"/><rect x="-10" y="-50" width="20" height="96" fill="#f2c14e"/><rect x="-62" y="-10" width="124" height="18" fill="#f2c14e"/>${P('M0-50C-30-80-50-60-30-50ZM0-50C30-80 50-60 30-50Z', '#f2c14e')}</g>` +
          ST('M-74 96Q-80 150-56 170M74 96Q84 150 66 170', u('gr'), 30) + hand(-54, 170, 13) + hand(66, 170, 13)) +
        G(1110, 560, 1.2, grunt({ t: -0.4, mo: 'laugh' }) + ST('M-74 96Q-110 60-100-40', u('gr'), 30) + hand(-100, -50, 13) + ST('M-100-50l-12-30M-100-50l4-32', SKIN[1], 6)) +
        G(560, 452, 1.4, childe) +
        conf + ST(sd(10, 0, 1200, 0, 700), '#f2c14e', 6, op(0.8)) + ST(sd(10, 0, 1200, 0, 700), '#e04848', 6, op(0.7)) +
        `<rect width="1200" height="900" fill="#ffb060" opacity=".08"/>`
      , 0.3, 0.5);
    }),
  });

  // ---- 3. What Big Brother Does -----------------------------------------------------------------
  def('end_tonia', {
    title: 'What Big Brother Does', w: 1200, h: 900, tags: ['ending', 'family', 'night', 'harbor', 'tonia'],
    svg: pic(3, () => {
      setSkin(['#f0c8b0', '#d9a690', '#b07e72', '#8a5e58']);
      let path = '', sky = '';
      for (let i = 0; i < 36; i++) {
        const y = rr(500, 640), w = (y - 480) * 0.5;
        path += `M${f(905 + rr(-1, 1) * w)} ${f(y)}h${f(rr(8, 30))}`;
      }
      for (let i = 0; i < 9; i++) sky += lantern(f(rr(120, 1100)), f(rr(140, 420)), n2(rr(0.12, 0.22)));
      // Childe from behind (local), Tonia leaning her head on his shoulder
      const childe = backT(62, 186, '#5a5f6a') + ST('M-62 84C-40 70 40 70 62 84M0 66V186M-40 120Q-20 130-6 120', '#7c818c', 3, op(0.7)) +
        neck(11, 50) + BACK.childe() + ST('M40-30Q52-6 44 20M62 90Q66 130 66 186', '#b8c8ff', 3, op(0.5)) +
        P('M-26 40C-14 54 14 54 26 40L32 60C14 74-14 74-32 60Z', u('sC')) + P('M14 62C24 90 18 140 28 186H48C36 140 44 92 30 58Z', u('sC'));
      const toniaB = backT(48, 159, '#5b4e6e') + ST('M-50 90Q-54 130-52 159', '#ffb070', 3, op(0.55)) + braid(4, 46, 9, '#b4502a') + `<rect x="-3" y="152" width="14" height="7" rx="2" fill="#4f8f9a"/>`;
      const toniaH = neck(9, 64) + P('M-26 52C-14 66 14 66 26 52L30 72C14 84-14 84-30 72Z', '#4f8f9a') + ST('M-24 64Q0 76 24 64', '#e9dfc6', 3, op(0.6)) +
        BACK.tonia() + ST('M-44-20Q-50 6-40 30', '#ffb070', 3, op(0.6));
      return svg(
        lg('sky', [[0, '#070d22'], [0.5, '#16234a'], [0.85, '#33426e'], [1, '#4a5582']]) +
        lg('sea', [[0, '#26375e'], [0.3, '#152648'], [1, '#08122a']]) +
        rg('moon', [[0, '#fff8e0', 0.9], [0.1, '#e8eeff', 0.5], [0.4, '#a8b8e8', 0.12], [1, '#8090c0', 0]]) +
        rg('pool', [[0, '#ffb060', 0.55], [0.5, '#ff9040', 0.18], [1, '#ff8030', 0]]) +
        lg('stone', [[0, '#3a3a4a'], [1, '#1a1a26']]) + lg('wood', [[0, '#6a4a3a'], [1, '#3a2620']]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        ST(sd(70, 0, 1200, 0, 420), '#fff', 2.2, op(0.7)) + ST(sd(20, 0, 1200, 0, 300), '#fff', 3.4, op(0.9)) +
        `<circle cx="905" cy="190" r="300" fill="url(#moon)"/><circle cx="905" cy="190" r="38" fill="#fff6e2"/><circle cx="893" cy="182" r="7" fill="#e8dcc0" opacity=".6"/><circle cx="918" cy="200" r="5" fill="#e8dcc0" opacity=".5"/>` +
        sky +
        P('M0 488L70 450L150 470L230 420L300 456L380 440L460 472L560 462L640 480L740 452L820 476L940 446L1040 470L1120 444L1200 460V500H0Z', '#1b2546') +
        P('M210 430V404H198L232 380L266 404H254V430Z', '#1b2546') + ST(sd(26, 0, 1200, 470, 494), '#ffc070', 3, op(0.75)) +
        `<rect y="496" width="1200" height="180" fill="url(#sea)"/>` + ST(path, '#e8ecff', 3, op(0.55)) +
        ST('M0 540Q300 532 600 542T1200 536M0 600Q300 590 600 602T1200 596', '#6a7ab0', 2, op(0.25)) +
        // promenade + railing
        P('M0 660H1200V900H0Z', 'url(#stone)') + P('M0 640H1200V666H0Z', '#4a4a5c') + ST('M0 642H1200', '#8a8aa8', 2, op(0.6)) +
        ST('M60 666V740M200 666V740M340 666V740M860 666V740M1000 666V740M1140 666V740', '#2a2a38', 14) + P('M0 736H1200V752H0Z', '#34344a') +
        // lantern post and its warm pool of light
        `<circle cx="250" cy="330" r="420" fill="url(#pool)"/>` + ST('M250 900V260M250 262Q250 230 290 230', '#1a1418', 10) + lantern(290, 300, 1.15) +
        // the two of them
        G(704, 472, 1.55, childe) +
        G(520, 552, 1.32, toniaB) + `<g transform="translate(540 624) rotate(22) scale(1.32) translate(0 -50)">${toniaH}</g>` +
        ST('M616 600Q540 600 470 632', '#5a5f6a', 30) + ST('M616 588Q540 588 474 616', '#7c818c', 3, op(0.6)) + hand(462, 636, 13, SKIN[1]) +
        `<ellipse cx="300" cy="800" rx="300" ry="70" fill="url(#pool)"/>` + ST('M932 790L1110 360', '#2a2024', 5) + ST('M1110 360Q1150 600 1130 660', '#cfd8ff', 1, op(0.6)) + `<circle cx="958" cy="736" r="11" fill="#3a3a46" stroke="#8a8aa0" stroke-width="2"/>` + ST('M0 812H1200M0 870H1200M150 760L60 900M450 760L420 900M750 760L780 900M1050 760L1140 900', '#5a5a70', 2, op(0.35)) +
        // bench (backrest closest to us)
        P('M320 680H930V708H320ZM320 720H930V748H320Z', 'url(#wood)') + ST('M320 681H930M320 721H930', '#c09070', 2, op(0.7)) +
        ST('M340 680V900M910 680V900', '#1e1a20', 14) + ST('M330 840H920', '#1e1a20', 8) +
        P('M320 756H930V770H320Z', '#1e1a20')
      , 0.3, 0.5);
    }),
  });

  // ---- 6. The Scapegoat -----------------------------------------------------------------------
  def('end_scapegoat', {
    title: 'The Scapegoat', w: 1200, h: 900, tags: ['ending', 'fatui', 'rain', 'night', 'wanted'],
    svg: pic(6, () => {
      setSkin(['#f2e6cc', '#e8d8b6', '#cbb48e', '#a08a66']);
      OVR = { hC: '#5a4432', sC: '#7a4030' };
      let refl = '', cobble = '';
      for (let i = 0; i < 6; i++) cobble += `M${f(700 + i * 110)} 900L${f(880 + i * 8)} 600`;
      for (let i = 0; i < 16; i++) refl += `M${f(rr(980, 1140))} ${f(rr(720, 890))}v${f(rr(20, 70))}`;
      // the hooded figure, walking away (local: feet at 0)
      const hood =
        `<ellipse cx="0" cy="4" rx="70" ry="10" fill="#000" opacity=".35"/>` +
        ST('M-14-150L-20-76L-24-12M14-150L22-80L10-24', '#1e2230', 26) + P('M-38-16H-10V0H-40Z', '#14161e') + P('M-2-40L22-30L18-14L-6-22Z', '#14161e') +
        P('M-48-296C-56-260-54-200-46-146H46C54-200 56-260 48-296C30-310-30-310-48-296Z', '#5c6372') +
        P('M-50-280C-62-240-60-196-50-166L-36-170C-42-200-42-240-36-276ZM50-280C62-240 60-196 50-166L36-170C42-200 42-240 36-276Z', '#4a505e') +
        P('M-34-292C-44-330-32-370 0-374C32-370 44-330 34-292C20-284-20-284-34-292Z', '#5c6372') + ST('M-26-298Q0-286 26-298M0-372Q-6-330 0-290', '#3a3f4c', 4) +
        P('M-32-300L-40-282L-28-288ZM30-300L40-280L26-288Z', '#c4562a') +
        P('M10-288C26-268 44-250 72-248L76-232C46-236 24-254 4-278Z', '#c8323c') + ST('M-46-150H46', '#3a3f4c', 6);
      return svg(
        lg('sky', [[0, '#1a2430'], [1, '#3a4a58']]) + lg('wall', [[0, '#5a6a72'], [1, '#3a464e']], 0, 0, 1, 0.3) +
        lg('street', [[0, '#4a5560'], [1, '#1c2228']]) + rg('lamp', [[0, '#ffd690', 0.85], [0.3, '#ffb060', 0.3], [1, '#ff9040', 0]]) +
        lg('paper', [[0, '#efe3c6'], [1, '#d8c69e']]) + lg('fog', [[0, '#8a9aa8', 0], [1, '#8a9aa8', 0.5]]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        // far buildings down the street
        P('M700 470V300H760V250H830V320H900V280H980V330H1060V240H1200V470Z', '#26303a') + ST('M780 290h14M800 330h14M920 310h12M1080 280h14M1120 320h14', '#ffc878', 6, op(0.7)) +
        ST('M700 200Q850 250 1000 210', '#14181e', 2) + lantern(760, 250, 0.5) + lantern(900, 262, 0.42) +
        `<rect x="640" y="300" width="560" height="200" fill="url(#fog)"/>` +
        `<path d="M640 470H1200V900H640Z" fill="url(#street)"/>` + ST(cobble, '#141a20', 2, op(0.3)) + ST('M690 540H1200M690 620H1200M690 730H1200M690 860H1200', '#141a20', 2, op(0.35)) +
        // street lamp
        `<circle cx="1070" cy="250" r="260" fill="url(#lamp)"/>` + ST('M1070 900V250', '#1a1e24', 10) + P('M1048 236H1092L1084 270H1056Z', '#ffe6a8') + P('M1044 230H1096L1070 214Z', '#1a1e24') +
        ST(refl, '#ffc878', 6, op(0.35)) + `<ellipse cx="1070" cy="820" rx="80" ry="12" fill="#ffc878" opacity=".25"/>` +
        G(860, 712, 1, hood) + `<g transform="translate(860 716) scale(1 -.45)" opacity=".12">${hood}</g>` +
        // the wall
        P('M0 0H660V900H0Z', 'url(#wall)') + P('M0 0H680V40L640 60H0Z', '#1e262c') + ST('M0 54H650', '#121820', 8) + ST(Array.from({ length: 17 }, (_, i) => `M${i * 40} 44q20 14 40 0`).join(''), '#3a464e', 4) +
        ST('M0 700H660M0 760H660M0 820H660M120 700V760M300 700V760M480 700V760M210 760V820M390 760V820M570 760V820', '#2a343a', 3, op(0.6)) +
        P('M660 0V900H690V0Z', '#2c363c') +
        // old torn poster
        `<g transform="translate(560 300) rotate(4)"><path d="M-70-90H70V40L40 60L10 40L-20 70L-70 50Z" fill="#cfc4aa" opacity=".7"/>${ST('M-50-60H50M-50-40H30M-50-20H40', '#6a6050', 4, op(0.5))}</g>` +
        // WANTED poster
        `<g transform="translate(290 380) rotate(-2)">` +
        `<rect x="-170" y="-250" width="340" height="460" fill="#000" opacity=".25" transform="translate(6 8)"/>` +
        P('M-170-250H170V170L150 200L170 210H-170Z', 'url(#paper)') + P('M150 200L170 170V210Z', '#a8987a') +
        txt(0, -184, 'WANTED', { size: 62, weight: 900, anchor: 'middle', fill: '#3a2a20', font: SERIF, ls: 2 }) +
        ST('M-140-160H140', '#3a2a20', 3) +
        `<rect x="-100" y="-146" width="200" height="200" fill="#e8dcbc" stroke="#5a4a3a" stroke-width="3"/>` +
        `<g transform="translate(0 -36) scale(1.35)">${CH.childe({ body: false, mo: 'smirk', eye: '#4a3a2a', brow: '#4a3a2a', blush: 0 })}</g>` +
        P('M-100-146H100V54H-100Z', '#6a5a40', op(0.12)) +
        txt(0, 106, 'TARTAGLIA', { size: 42, weight: 900, anchor: 'middle', fill: '#3a2a20', font: SERIF, ls: 2 }) +
        txt(0, 140, 'alias “Childe” · Fatui Harbinger', { size: 16, anchor: 'middle', fill: '#4a3a2a', font: SERIF }) +
        txt(0, 168, 'REWARD: 5,000,000 MORA', { size: 18, weight: 800, anchor: 'middle', fill: '#8a2a20', font: SERIF, ls: 1 }) +
        `<g transform="translate(70 20) rotate(-10)"><rect x="-26" y="-26" width="52" height="52" fill="none" stroke="#b82a2a" stroke-width="4" opacity=".8"/>${ST('M-14-12H14M0-18V18M-12 4H12M-10 14L10 14', '#b82a2a', 4, op(0.8))}</g>` +
        P('M-170-100C-140-90-120-60-130 0C-136 40-160 60-170 80Z', '#4a3a2a', op(0.12)) + ST('M60-250V-170M100-250V-200M-120 170V210', '#5a6a72', 3, op(0.35)) + '</g>' +
        // drips from the eaves
        ST('M80 60v40M220 60v26M400 60v50M560 60v30', '#9ab0c0', 2, op(0.6)) +
        // rain
        ST(rain(150, -100, 1250, -50, 880, 34, -0.25), '#c8d8e8', 1.6, op(0.45)) + ST(rain(40, -100, 1250, -50, 880, 60, -0.25), '#e0ecf8', 2.4, op(0.35)) +
        ST(sd(40, 640, 1200, 760, 900), '#c8d8e8', 3, op(0.4)) +
        `<rect width="1200" height="900" fill="#1c3448" opacity=".25" style="mix-blend-mode:multiply"/>`
      , 0.35, 0.6);
    }),
  });

  // ---- 8. The Eleventh Resigns ----------------------------------------------------------------
  def('end_defector', {
    title: 'The Eleventh Resigns', w: 1200, h: 900, tags: ['ending', 'fatui', 'dawn', 'pier'],
    svg: pic(8, () => {
      setSkin(['#ffe0c8', '#f2bc98', '#c98a6e', '#a06a56']);
      let rays = '', glit = '';
      for (let i = 0; i < 16; i++) {
        const a = Math.PI + (i / 15) * Math.PI, b = a + 0.05;
        rays += `M790 520L${f(790 + 1400 * Math.cos(a))} ${f(520 + 1400 * Math.sin(a))}L${f(790 + 1400 * Math.cos(b))} ${f(520 + 1400 * Math.sin(b))}Z`;
      }
      for (let i = 0; i < 46; i++) {
        const y = rr(526, 760), w = (y - 515) * 0.7;
        glit += `M${f(790 + rr(-1, 1) * w)} ${f(y)}h${f(rr(10, 40))}`;
      }
      // Childe in profile, facing the sunrise (local: feet at 0)
      const head =
        P('M-6-452H14V-418H-6Z', SKIN[2]) +
        P('M-26-476C-26-500-10-516 8-516C26-516 36-504 38-490L40-484Q38-478 45-467L41-462Q41-458 43-456Q40-453 42-451Q40-446 34-443Q22-438 10-440C-8-442-26-456-26-476Z', SKIN[1]) +
        ST('M21-483q6-3 12 0', '#2a1a1c', 3) + `<ellipse cx="29" cy="-479" rx="2.6" ry="3.6" fill="#2a5fa0"/>` + ST('M23-492q6-3 12-1', '#8a3a1c', 2.4) +
        ST('M36-454l4 0', '#9a4a42', 2) + `<ellipse cx="18" cy="-462" rx="7" ry="4" fill="#ff7a7a" opacity=".3"/>` +
        P(jag([[-34, -440], [-40, -462], [-34, -476], [-42, -494], [-30, -506], [-26, -524], [-6, -528], [4, -542], [18, -528], [34, -528], [40, -512], [54, -506], [44, -496], [50, -484], [38, -488], [36, -478], [28, -492], [20, -482], [10, -496], [4, -470], [-4, -480], [-14, -456], [-20, -462], [-34, -440]], 0.12) + 'Z', u('hC')) +
        `<ellipse cx="-4" cy="-470" rx="7" ry="10" fill="${SKIN[2]}"/>` + ST('M54-506L40-512M40-484L45-467', '#ffd8a0', 2.4, op(0.9));
      const fig =
        `<path d="M-30 0Q-200 60-420 150L-330 160Q-160 70 40 0Z" fill="#1a1020" opacity=".35"/>` +
        ST('M18-410L94-396L150-390', '#3c4049', 28) + P('M146-398C160-400 172-396 174-390C168-382 156-380 146-382Z', SKIN[2]) +
        ST('M-18-236L-22-120L-26-16M12-236L22-124L32-16', '#252834', 30) + P('M-44-20H-10V0H-46ZM18-22H54V-2H16Z', '#16181e') +
        P('M-38-418C-46-380-44-300-42-226H40C42-260 36-300 34-330C40-370 42-400 32-424C10-438-22-436-38-418Z', u('jC')) +
        ST('M-40-296H36', '#1e2026', 9) + P('M-32-292l8-12 8 12-8 12Z', u('hy')) + `<circle cx="-24" cy="-292" r="16" fill="#8ad8ff" opacity=".3"/>` +
        `<g transform="translate(8 -478) scale(1.15) translate(-8 478)">${head}</g>` +
        P('M-24-440C-8-430 18-430 30-442L32-420C14-408-10-410-28-422Z', u('sC')) +
        P(ribbon([[-20, -430], [-72, -428], [-122, -444], [-172, -434], [-216, -450]], (t) => 13 - t * 6).d, u('sC')) +
        ST('M-12-412L-24-330L-12-262', u('jC'), 30) + P('M-22-262C-22-248-8-244-2-252C2-262-4-270-14-270Z', SKIN[1]) +
        `<g transform="translate(-10 -232) rotate(10) scale(1.3)">${P('M-25-2C-23-13-11-16-3-13L0-26L3-13C11-16 23-13 25-2C23 7 13 11 0 9C-13 11-23 7-25-2Z', '#c8323c', 'stroke="#5e1018" stroke-width="2"')}${P('M-18-3Q-11-9-5-3Q-11 2-18-3ZM18-3Q11-9 5-3Q11 2 18-3Z', '#1e060a')}</g>` +
        ST('M32-424C42-400 40-370 34-330M40-226L42-260', '#ffd8a0', 3, op(0.85));
      return svg(
        lg('sky', [[0, '#252a58'], [0.3, '#5a4f88'], [0.48, '#c47e9a'], [0.56, '#f4a88e'], [0.6, '#ffd59a']]) +
        lg('sea', [[0, '#e9a888'], [0.08, '#7a6a94'], [1, '#262850']]) +
        rg('sun', [[0, '#fffbe6'], [0.08, '#fff0c0', 0.95], [0.3, '#ffc890', 0.45], [1, '#ff9a80', 0]]) +
        lg('deck', [[0, '#5a3e3a'], [1, '#2a1c20']]) + lg('rayg', [[0, '#fff2c8', 0.35], [1, '#fff2c8', 0]]),
        `<rect width="1200" height="900" fill="url(#sky)"/>` + P(rays, '#fff2c8', op(0.07)) +
        `<circle cx="790" cy="520" r="520" fill="url(#sun)"/>` +
        P(cloud(300, 300, 170, 26, 18) + cloud(980, 250, 200, 30, 20) + cloud(640, 180, 120, 18, 12), '#f4b4a8', op(0.55)) +
        P('M0 520V470H30V440H44V470H80V420H100V380H110V420H150V470H200V450H260V470H300V520Z', '#3a2f58') + ST('M110 380L200 330M200 330V470M150 380H230', '#3a2f58', 6) +
        `<rect y="520" width="1200" height="380" fill="url(#sea)"/>` + `<ellipse cx="790" cy="522" rx="120" ry="6" fill="#fff8e0"/>` +
        `<path d="M730 520A60 60 0 0 1 850 520Z" fill="#fff8e6"/>` + ST(glit, '#ffe6b0', 3, op(0.8)) +
        ST('M300 300q14-12 28 0q14-12 28 0M380 260q10-8 20 0q10-8 20 0M1000 330q12-10 24 0q12-10 24 0', '#3a2f58', 3.5, op(0.8)) +
        // pier
        P('M0 740H650L730 900H0Z', 'url(#deck)') + ST('M0 772H664M0 812H684M0 856H706M110 740L90 900M260 740L250 900M410 740L420 900M560 740L590 900', '#1e1416', 3, op(0.6)) + P('M650 740L730 900H750L668 740Z', '#1e1416') +
        ST('M640 700V770M120 700V760', '#2a1c20', 18) + ST('M640 700V770', '#ffcf9a', 3, op(0.5)) +
        `<path d="M70 780q40-14 80 0q-40 14-80 0Z" fill="none" stroke="#8a6a4a" stroke-width="6"/>` +
        G(548, 760, 1.04, fig) +
        // the falling pin
        ST('M718 376v34M714 392v24', '#fff2c8', 2, op(0.5)) + `<circle cx="718" cy="430" r="22" fill="#fff2c8" opacity=".35"/>` +
        `<g transform="translate(718 430) rotate(-20)"><circle r="11" fill="#d8b860" stroke="#8a6a2a" stroke-width="2"/>${ST('M0-7V7M-6-3.5L6 3.5M-6 3.5L6-3.5', '#fff6d8', 1.8)}</g>` +
        ST('M700 440l-8-8M736 440l8-8M718 452v10', '#fff6d8', 2, op(0.8)) +
        `<rect width="1200" height="900" fill="url(#rayg)" style="mix-blend-mode:screen"/>`
      , 0.3, 0.55);
    }),
  });

  // ---- 12. Ajax (true ending) ------------------------------------------------------------------
  def('end_true', {
    title: 'Ajax', w: 1200, h: 900, tags: ['ending', 'pier', 'family', 'golden'],
    svg: pic(12, () => {
      setSkin(['#ffeedd', '#f9d2b2', '#e8a886', '#c98466']);
      OVR = { hG: 'url(#hC)', jC: '#6f747e', cZ: '#33251c', sC: '#c8323c' };
      let rail = '', lan = '', glit = '';
      for (let x = 20; x < 1200; x += 118) rail += `M${x} 512V600`;
      for (let i = 0; i < 7; i++) {
        const x = 60 + i * 180;
        lan += lantern(x, f(110 + Math.sin((x / 1200) * Math.PI) * 90), 0.62);
      }
      for (let i = 0; i < 18; i++) glit += `M${f(990 + rr(-1, 1) * rr(10, 150))} ${f(rr(440, 596))}h${f(rr(6, 24))}`;
      const T = (id, x, y, sc) => `<use href="#${id}" transform="translate(${x} ${y})${sc ? ` scale(${sc})` : ''}"/>`;
      // table, from the back edge (y 600) to the front edge (y 690)
      const table =
        P('M40 600H1160L1200 690H0Z', '#fbf3e4') + P('M0 690H1200V800H0Z', u('drop')) + P('M0 762H1200V772H0Z', '#e7c06a', op(0.5)) + ST('M0 792H1200', '#c9a860', 5, 'stroke-dasharray="1 12"') +
        P('M26 632H1174L1180 652H20Z', '#b8302f', op(0.85)) + ST('M26 632H1174M20 652H1180', '#e7b84a', 2);
      const props =
        T('cu', 196, 640) + T('pl', 120, 664, 0.8) + T('gl', 316, 640) +
        T('pl', 410, 650, 1.3) + P('M374 646C382 632 420 626 446 636L462 628L460 652L446 646C420 660 386 658 374 646Z', '#c88a4a') + `<circle cx="386" cy="642" r="3" fill="#2a1a1c"/>` + ST('M400 638l4 10M414 636l4 12M428 638l4 10', '#8a5a2a', 2, op(0.6)) +
        T('pl', 512, 662) + ST('M490 656h0M506 654h0M522 656h0M498 666h0M514 666h0M530 664h0', '#e0cfa8', 14) + ST('M490 656h0M506 654h0M522 656h0M498 666h0M514 666h0M530 664h0', '#fff8e8', 10) +
        T('pl', 604, 640, 0.8) + T('cu', 632, 640) +
        `<g transform="translate(572 666)">${P('M-28 0L-24-22H24L28 0Z', '#fffdf6', 'stroke="#d8c8a6" stroke-width="1.5"')}${txt(0, -6, 'for you', { size: 15, font: SERIF, anchor: 'middle', fill: '#9a3a2a', tr: 'skewX(-8)' })}</g>` +
        P('M664 618Q706 604 748 618V646Q706 662 664 646Z', '#6a4030') + ST('M660 626h-8M752 626h8', '#4a2a1e', 7) + `<ellipse cx="706" cy="618" rx="42" ry="12" fill="#b8283a"/><ellipse cx="712" cy="616" rx="9" ry="4" fill="#fff4ea"/>` + 
        T('cu', 804, 650) + P('M846 650Q834 624 844 604H860Q870 624 858 650Z', '#e6eef6', 'stroke="#9ab0c8" stroke-width="1.5"') +
        `<g fill="#eaf2ff" stroke="#8aa8d8" stroke-width="1.5"><path d="M852 604L836 572L852 584L856 564L862 586L876 576Z"/><path d="M846 608L822 594L840 590Z"/></g>` + ST('M852 606V590M848 610L838 598', '#5a8a4a', 2.5) +
        T('gl', 960, 646) + T('pl', 1050, 664, 1.1) + ST('M1026 660h0M1042 654h0M1058 660h0M1074 656h0M1050 666h0', '#c8743a', 16) + ST('M1028 656h0M1044 650h0M1072 652h0', '#f0a860', 6);
      // the empty chair, turned toward you
      const chair =
        `<ellipse cx="600" cy="896" rx="160" ry="20" fill="#3a2010" opacity=".4"/>` +
        ST('M532 730V880M668 730V880', '#5a3418', 12) +
        P('M514 684Q600 668 686 684L682 712Q600 698 518 712Z', u('wood')) + ST('M560 708V800M600 702V800M640 708V800', '#8a5430', 9) +
        ST('M520 686V812M680 686V812', '#7a4626', 14) +
        P('M492 800H708L728 848H472Z', u('wood')) + P('M472 848H728V862H472Z', '#5a3418') +
        P('M506 800Q600 786 694 800L710 834Q600 852 490 834Z', '#c8403a') +
        ST('M484 860L478 900M716 860L722 900', '#6a3c1e', 15);
      return svg(
        lg('sky', [[0, '#8fbfdc'], [0.3, '#cfd8c8'], [0.5, '#f8d7a2'], [0.62, '#ffc884'], [1, '#ffb070']]) +
        lg('sea', [[0, '#f0b47c'], [0.1, '#8eb0ac'], [1, '#3e7c8c']]) +
        rg('sun', [[0, '#fffbe8'], [0.12, '#fff1c4', 0.95], [0.45, '#ffd28a', 0.4], [1, '#ffc070', 0]]) +
        lg('drop', [[0, '#f3e7d2'], [1, '#d4bf9c']]) + lg('deck', [[0, '#a8704a'], [1, '#5e3a22']]) + lg('wood', [[0, '#b8784a'], [1, '#76442a']], 0, 0, 1, 1) +
        rg('halo', [[0, '#fff2c0', 0.7], [1, '#ffd890', 0]]) + lg('warm', [[0, '#ff9a40', 0], [1, '#ff8a30', 0.5]], 0, 0, 1, 0.3) +
        `<g id="pl"><ellipse cy="3" rx="44" ry="15" fill="#000" opacity=".12"/><ellipse rx="40" ry="13" fill="#fbf7ee" stroke="#d9cdb4" stroke-width="2"/></g>` +
        `<g id="cu"><path d="M-11-14H11Q10 0 0 0Q-10 0-11-14Z" fill="#e8efe6" stroke="#9ab8a4" stroke-width="1.5"/><ellipse cy="-14" rx="11" ry="3" fill="#c98a3a"/></g>` +
        `<g id="gl"><path d="M-8-34H8L6 0H-6Z" fill="#ffd27a" opacity=".75"/><path class="s" d="M-5-30V-6" stroke="#fff" stroke-width="2" opacity=".7"/></g>`,
        `<rect width="1200" height="900" fill="url(#sky)"/>` +
        `<circle cx="990" cy="330" r="330" fill="url(#sun)"/><circle cx="990" cy="330" r="46" fill="#fffbea"/>` +
        P('M0 430L60 370L130 330L230 360L330 400L380 432ZM1080 432L1180 380L1200 390V432Z', '#c99a92', op(0.55)) +
        P('M120 432V404H110L150 386L190 404H180V432ZM250 432V396H238L280 370L322 396H310V432Z', '#a87a74', op(0.6)) +
        `<rect y="430" width="1200" height="180" fill="url(#sea)"/>` + ST(glit, '#fff6d8', 3, op(0.8)) +
        ST('M380 230q12-10 24 0q12-10 24 0M780 160q10-8 20 0q10-8 20 0', '#6a5a5a', 3, op(0.6)) +
        ST('M0 110Q600 290 1200 110', '#5a3a2a', 2) + lan +
        `<rect y="600" width="1200" height="300" fill="url(#deck)"/>` +
        ST(rail, '#6a3e22', 12) + P('M0 504H1200V518H0Z', '#7a4a2a') +
        // family & friends (back to front)
        who('papa', 388, 396, 0.95, { t: 0.1, ex: 'happy', mo: 'laugh' }) + arm('M440 470Q470 430 468 372', '#2e3f5a', 22) + hand(468, 364) + T('gl', 470, 362) +
        who('hutao', 92, 470, 0.9, { t: 0.3 }) + arm('M118 540Q150 520 146 470', '#4a2e26', 18) + hand(146, 462, 8) + ST('M142 456l-4-16M148 456l3-16', SKIN[1], 5) +
        who('ekat', 192, 474, 0.9, { t: 0.2, ex: 'happy' }) +
        who('anthon', 292, 470, 0.9, { t: 0.25, mo: 'grin' }) +
        who('lumine', 954, 474, 0.9, { t: -0.25, mo: 'smile' }) +
        who('tonia', 852, 476, 0.88, { t: -0.2, mo: 'smile', ex: 'happy' }) +
        who('zhongli', 748, 466, 0.96, { t: -0.35, mo: 'smile' }) +
        who('mama', 470, 478, 0.9, { t: 0.25 }) +
        who('childe', 644, 468, 0.98, { t: -0.25, ex: 'happy', mo: 'laugh' }) + arm('M604 552Q560 540 524 548', '#6c717c', 18) +
        who('teucer', 553, 500, 0.78, { t: 0.3, ex: 'happy', mo: 'laugh' }) + hand(522, 552, 8) +
        who('paimon', 1066, 356, 0.55, { t: -0.3 }) + ST('M1032 380L1012 352', '#f2ead8', 7) + `<ellipse cx="1004" cy="340" rx="16" ry="12" fill="#b8682e" transform="rotate(-40 1004 340)"/>` +
        table + props +
        `<circle cx="600" cy="790" r="190" fill="url(#halo)"/>` + chair +
        `<rect width="1200" height="900" fill="url(#warm)" style="mix-blend-mode:soft-light"/>` +
                ST(sd(16, 640, 1200, 100, 600), '#fff6d0', 5, op(0.6))
      , 0.3, 0.45);
    }),
  });

  // ---- dev sheet (temporary) -------------------------------------------------------------------
  def('zz_sheet', {
    title: 'sheet', w: 1200, h: 900, tags: [],
    svg: pic(1, () => svg('', `<rect width="1200" height="900" fill="#cfd6dd"/>` +
      who('childe', 110, 140, 1.4) + who('childe', 320, 140, 1.4, { t: 0.4, ex: 'happy', mo: 'laugh' }) +
      who('zhongli', 530, 140, 1.4) + who('zhongli', 740, 140, 1.4, { t: -0.4, ex: 'soft', mo: 'soft' }) +
      who('teucer', 950, 140, 1.4) + who('tonia', 1120, 140, 1.2, { t: -0.3 }) +
      who('anthon', 90, 470, 1.1) + who('mama', 260, 470, 1.1) + who('papa', 430, 470, 1.1, { mo: 'laugh', ex: 'happy' }) + who('hutao', 600, 470, 1.1) +
      who('lumine', 770, 470, 1.1) + who('ekat', 940, 470, 1.1) + who('yelan', 1110, 470, 1.1) +
      who('grunt', 120, 760, 0.9, { hat: 'elf' }) + who('grunt', 330, 760, 0.9) + who('grunt', 540, 760, 0.9, { hat: 'none', mask: false, ex: 'closed', mo: 'laugh' }) +
      who('childe', 720, 780, 0.6, { t: 0.3 }) + who('zhongli', 800, 780, 0.6, { t: -0.3 }) + who('teucer', 880, 780, 0.6) + who('mama', 960, 780, 0.6) + who('hutao', 1040, 780, 0.6) + who('lumine', 1120, 780, 0.6)
    , 0, 0)),
  });
})();
