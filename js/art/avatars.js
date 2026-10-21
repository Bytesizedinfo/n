/* Contact avatars (600×600): head-and-shoulders portraits that read in 40–90 px circles.
   Every face is built from one shared kit (head, eyes, brows, mouths, hair locks) so the set looks like one family. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---------- svg kit ----------
  const r1 = (n) => Math.round(n * 10) / 10;
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const lgu = (id, s, x1, y1, x2, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const op = (o) => ` opacity="${o}"`;
  const tf = (t) => ` transform="${t}"`;
  const P = (d, fill, x = '') => `<path d="${d}" fill="${fill}"${x}/>`;
  const S = (d, c, w, o, x = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o != null ? op(o) : ''}${x}/>`;
  const C = (cx, cy, r, fill, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${x}/>`;
  const E = (cx, cy, rx, ry, fill, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"${x}/>`;
  const G = (t, s, x = '') => `<g transform="${t}"${x}>${s}</g>`;
  const hairG = (id, c) => lg(id, [[0, c[0]], [0.5, c[1]], [1, c[2]]], 0.15, 0, 0.85, 1);
  const iris = (id, c) => lg(id, [[0, c[2]], [0.5, c[1]], [1, c[0]]]);

  // Skin tones: [highlight, base, shade, deep]
  const SKIN = {
    fair: ['#fff4ec', '#fde1cf', '#f2c4ab', '#d89c83'],
    warm: ['#ffefe2', '#fad7bf', '#ecb698', '#cc8d6f'],
    pale: ['#fffbf8', '#f9ebe4', '#ebd2c8', '#c7a397'],
    tan: ['#f9dcc2', '#eec29f', '#d8a07a', '#b07a58'],
    old: ['#fbe4d2', '#efc9ae', '#daa98a', '#b48266'],
  };
  const FACES = {
    m: 'M198 238C196 302 216 352 254 386Q282 408 300 409Q318 408 346 386C384 352 404 302 402 238C402 170 358 134 300 134C242 134 198 170 198 238Z',
    f: 'M202 238C200 300 220 348 256 382Q284 403 300 404Q316 403 344 382C380 348 400 300 398 238C398 172 356 136 300 136C244 136 202 172 202 238Z',
    c: 'M190 250C188 320 216 366 258 391Q284 405 300 405Q316 405 342 391C384 366 412 320 410 250C410 174 364 138 300 138C236 138 190 174 190 250Z',
    o: 'M196 236C194 306 210 358 248 390Q278 411 300 411Q322 411 352 390C390 358 406 306 404 236C404 166 360 130 300 130C240 130 196 166 196 236Z',
  };
  const skinDefs = (k) =>
    lg('sk', [[0, k[0]], [0.45, k[1]], [1, k[2]]], 0.15, 0.1, 0.85, 0.95) +
    lg('nk', [[0, k[3]], [0.55, k[2]], [1, k[1]]]) +
    rg('bl', [[0, '#ff6f6f', 0.4], [1, '#ff6f6f', 0]]);

  // ears + face (with cheek shade and blush); also defines clip #fc for shadows on the face
  function head(k, o = {}) {
    const F = FACES[o.face || 'm'];
    const ears = o.ears === false ? '' :
      P('M206 272C188 256 168 268 170 296C172 322 190 338 210 332Z', k[1]) +
      P('M394 272C412 256 432 268 430 296C428 322 410 338 390 332Z', k[2]) +
      S('M194 284C184 292 186 310 196 318', k[3], 4, 0.6) + S('M406 284C416 292 414 310 404 318', k[3], 4, 0.6);
    return `<clipPath id="fc"><path d="${F}"/></clipPath>` + ears + P(F, 'url(#sk)') +
      `<g clip-path="url(#fc)">` + P('M410 220C410 300 392 360 340 400L300 420L330 420C380 380 404 330 382 250Z', k[2], op(0.55)) +
      P('M180 120H420V200C380 168 340 158 300 158C260 158 220 168 180 200Z', k[2], op(0.25)) + `</g>` +
      (o.blush === 0 ? '' : `<g${op(o.blush || 1)}>${E(240, 340, 30, 15, 'url(#bl)')}${E(360, 340, 30, 15, 'url(#bl)')}</g>`);
  }
  const neck = (k, w = 32) =>
    P(`M${300 - w} 340V466Q300 486 ${300 + w} 466V340Z`, 'url(#nk)') +
    P(`M${300 - w} 384Q300 432 ${300 + w} 384V414Q300 450 ${300 - w} 414Z`, k[3], op(0.4));
  // soft shadow that the fringe casts on the forehead
  const fringeShade = (d, k, dy = 14) => `<g clip-path="url(#fc)">${P(d, k[3], op(0.45) + tf(`translate(3 ${dy})`))}</g>`;
  const nose = (k, y = 0) => S(`M303 ${316 + y}Q296 ${332 + y} 307 ${336 + y}`, k[3], 4.5, 0.75);

  // One eye. s = -1 (viewer's left) or 1 (viewer's right).
  // o: iris (gradient id), lash, lid (0 open … 0.8 heavy), pup ('dot' | 'x' | 'plum' | 'none'), pc (pupil colour),
  //    hl (highlight strength), k (size), shut (closed smiling eye), liner (coloured flick at the outer corner)
  let EID = 0;
  function eye(cx, cy, s, o = {}) {
    const k = o.k || 1, lid = o.lid || 0, L = o.lash || '#2a1a1c';
    const X = (dx) => r1(cx + s * dx * k), Y = (dy) => r1(cy + dy * k);
    if (o.shut) {
      return S(`M${X(-24)} ${Y(2)}Q${X(2)} ${Y(-20)} ${X(28)} ${Y(0)}`, L, 7 * k) + S(`M${X(28)} ${Y(0)}l${s * 9 * k} ${-5 * k}`, L, 4 * k) +
        (o.liner ? S(`M${X(14)} ${Y(-14)}Q${X(30)} ${Y(-12)} ${X(42)} ${Y(-20)}`, o.liner, 6 * k, 0.55) : '');
    }
    const ox = X(29), oy = Y(-3 + lid * 4);
    const up = `M${X(-24)} ${Y(4)}C${X(-14)} ${Y(-24 + lid * 20)} ${X(14)} ${Y(-31 + lid * 22)} ${ox} ${oy}`;
    const shape = up + `C${X(25)} ${Y(18)} ${X(-8)} ${Y(26)} ${X(-24)} ${Y(4)}Z`;
    const id = 'e' + ++EID;
    const icx = X(2), icy = Y(4);
    const pc = o.pc || '#160c14';
    let pup = '';
    if (o.pup === 'x') pup = S(`M${r1(icx - 9 * k)} ${r1(icy - 11 * k)}L${r1(icx + 9 * k)} ${r1(icy + 11 * k)}M${r1(icx + 9 * k)} ${r1(icy - 11 * k)}L${r1(icx - 9 * k)} ${r1(icy + 11 * k)}`, pc, 5 * k);
    else if (o.pup === 'plum') {
      for (let i = 0; i < 5; i++) {
        const a = (i * 72 - 90) * Math.PI / 180;
        pup += C(r1(icx + Math.cos(a) * 6 * k), r1(icy + Math.sin(a) * 6 * k), 5 * k, pc);
      }
      pup += C(icx, icy, 3 * k, o.pc2 || '#ffb3a8');
    } else if (o.pup !== 'none') pup = E(icx, icy, 8.5 * k, 11.5 * k, pc, op(0.9));
    const hl = o.hl == null ? 1 : o.hl;
    return `<clipPath id="${id}"><path d="${shape}"/></clipPath>` +
      P(shape, o.white || '#fffaf6') +
      `<g clip-path="url(#${id})">` +
      E(icx, icy, r1(19 * k), r1(24.5 * k), `url(#${o.iris || 'ir'})`) + pup +
      E(icx, icy, r1(19 * k), r1(24.5 * k), 'none', ` stroke="${L}" stroke-width="${r1(2.2 * k)}" stroke-opacity=".55"`) +
      S(up, L, 16 * k, 0.25) +
      C(r1(cx - 6 * k), r1(cy - 6 * k + lid * 10), r1(6.5 * k * (hl < 0.5 ? 0.7 : 1)), '#fff', op(hl)) +
      (hl > 0.5 ? C(r1(cx + 7 * k), r1(cy + 13 * k), r1(2.8 * k), '#fff', op(0.85)) : '') +
      `</g>` +
      (o.liner ? S(`M${X(10)} ${Y(-22 + lid * 16)}Q${X(30)} ${Y(-16 + lid * 8)} ${X(44)} ${Y(-14)}`, o.liner, 7 * k, 0.55) : '') +
      S(up, L, 6.5 * k) +
      S(`M${ox} ${oy}l${s * 9 * k} ${-6 * k}`, L, 4.5 * k) +
      S(`M${X(27)} ${Y(4)}Q${X(22)} ${Y(16)} ${X(12)} ${Y(21)}`, L, 2.6 * k, 0.5) +
      S(`M${X(-10)} ${Y(-35 + lid * 18)}Q${X(10)} ${Y(-43 + lid * 18)} ${X(26)} ${Y(-31 + lid * 14)}`, L, 2.4 * k, 0.3);
  }
  const eyes = (o, y = 294, dx = 48) => eye(300 - dx, y, -1, o) + eye(300 + dx, y, 1, o);

  // Tapered brow over the eye at (cx, cy). li lifts the inner end, lo the outer end, ar arches the middle.
  function brow(cx, cy, s, c, o = {}) {
    const w = o.w || 7, li = o.li || 0, lo = o.lo || 0, ar = o.ar == null ? 7 : o.ar;
    const X = (dx) => r1(cx + s * dx);
    const yi = cy - 46 - li, yo = cy - 44 - lo, ym = (yi + yo) / 2 - ar;
    return P(`M${X(-22)} ${r1(yi + w / 2)}Q${X(4)} ${r1(ym + w * 0.4)} ${X(30)} ${r1(yo)}Q${X(4)} ${r1(ym - w * 0.7)} ${X(-22)} ${r1(yi - w / 2)}Z`, c);
  }
  const brows = (c, o = {}, y = 294, dx = 48) => brow(300 - dx, y, -1, c, o) + brow(300 + dx, y, 1, c, Object.assign({}, o, o.r || {}));

  // Mouths (centred on x = 300)
  const LIP = '#b44c56';
  const smile = (w = 24, d = 9, c = LIP, y = 360, sw = 5.5) => S(`M${300 - w} ${y}Q300 ${y + d * 2} ${300 + w} ${y}`, c, sw);
  const smirk = (c = LIP, y = 360) => S(`M276 ${y + 2}Q302 ${y + 14} 328 ${y - 6}`, c, 5.5) + S(`M325 ${y - 11}Q330 ${y - 7} 331 ${y - 2}`, c, 3.5);
  // open smile: w half width, d depth, tilt raises the right corner
  function grin(o = {}) {
    const y = o.y || 350, w = o.w || 32, d = o.d || 30, t = o.tilt || 0;
    const sh = `M${300 - w} ${y + t}Q300 ${y + 10} ${300 + w} ${y - t}Q${300 + w * 0.55} ${y + d} 300 ${y + d}Q${300 - w * 0.55} ${y + d} ${300 - w} ${y + t}Z`;
    return `<clipPath id="mo"><path d="${sh}"/></clipPath>` + P(sh, o.c || '#6e2129') +
      `<g clip-path="url(#mo)">` +
      (o.teeth === false ? '' : P(`M${300 - w} ${y - 6}H${300 + w}V${y + 9}Q300 ${y + 16} ${300 - w} ${y + 9}Z`, '#fff')) +
      (o.gap ? P(`M296 ${y}h8v14h-8z`, '#6e2129') : '') +
      (o.fang ? P(`M${300 + w * 0.45} ${y + 4}l5 13l5 -13z`, '#fff') : '') +
      E(300, y + d, w * 0.55, d * 0.45, '#e2737c') + `</g>` +
      P(sh, 'none', ` stroke="${o.c || '#6e2129'}" stroke-width="3"`);
  }

  // Hair cap: a crown dome plus a fringe of pointed locks. pts run along the hairline from the left side of the
  // head to the right, alternating tip (low) and valley (high). sw leans every lock; top is the crown height.
  function cap(pts, o = {}) {
    const top = o.top == null ? 96 : o.top, sw = o.sw || 0, k = o.k == null ? 0.7 : o.k, wd = o.wd || 0;
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const v = a[1] < b[1] ? a : b, t = a[1] < b[1] ? b : a;
      d += `Q${r1(v[0] + sw)} ${r1(v[1] + (t[1] - v[1]) * k)} ${b[0]} ${b[1]}`;
    }
    const L = pts[0], R = pts[pts.length - 1];
    if (o.crown) return d + o.crown + 'Z';
    d += `C${R[0] + 6 + wd} ${R[1] - 120} ${392 + wd} ${top} 300 ${top}C${208 - wd} ${top} ${L[0] - 6 - wd} ${L[1] - 120} ${L[0]} ${L[1]}Z`;
    return d;
  }
  // tapered lock from a root (x0, y0) of width w to a tip (x1, y1); bend pushes its middle sideways
  const lock = (x0, y0, x1, y1, w, bend = 0) => {
    const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2;
    return `M${r1(x0 - w / 2)} ${y0}Q${r1(mx - w / 2)} ${r1(my)} ${x1} ${y1}Q${r1(mx + w / 2)} ${r1(my)} ${r1(x0 + w / 2)} ${y0}Z`;
  };
  // glossy ring of light on top of the hair: tapered glints along an arc
  function shine(c, y = 150, x0 = 226, x1 = 376, o = 0.45, segs = [[0.05, 0.3], [0.38, 0.62], [0.7, 0.93]], h = 7) {
    const q = (t) => { const u = 1 - t; return [u * u * x0 + 2 * u * t * 300 + t * t * x1, u * u * (y + 18) + 2 * u * t * (y - 26) + t * t * (y + 18)]; };
    const d = segs.map(([a, b]) => {
      const p0 = q(a), p1 = q(b), pm = q((a + b) / 2);
      return `M${r1(p0[0])} ${r1(p0[1])}Q${r1(pm[0])} ${r1(pm[1] - h)} ${r1(p1[0])} ${r1(p1[1])}Q${r1(pm[0])} ${r1(pm[1] + h)} ${r1(p0[0])} ${r1(p0[1])}Z`;
    }).join('');
    return P(d, c, op(o));
  }
  // braid: n alternating lobes from (x0, y0) to (x1, y1)
  function braid(x0, y0, x1, y1, n, w, fill, line) {
    let s = '';
    const a = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI - 90;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, side = i % 2 ? 1 : -1, ww = w * (1 - t * 0.3);
      const cx = r1(x0 + (x1 - x0) * t + side * ww * 0.16), cy = r1(y0 + (y1 - y0) * t);
      s += E(cx, cy, r1(ww * 0.42), r1(((y1 - y0) / n) * 0.8), fill, tf(`rotate(${r1(a + side * 34)} ${cx} ${cy})`)) +
        S(`M${r1(cx - side * ww * 0.3)} ${r1(cy - 8)}Q${cx} ${r1(cy + 4)} ${r1(cx + side * ww * 0.3)} ${r1(cy + 10)}`, line, 3, 0.5);
    }
    return s;
  }

  // Shoulders (neck opening at y ≈ 436)
  const TORSO = 'M0 600V572C8 514 76 474 184 456C226 450 252 444 264 436H336C348 444 374 450 416 456C524 474 592 514 600 572V600Z';
  // fluffy fur collar: a scalloped band along a curve from (x0, y0) dipping toward cy at the neck
  function fur(fill, line, x0 = 130, x1 = 470, y0 = 492, cy = 420, th = 40, n = 12, amp = 11) {
    const q = (t, off) => { const u = 1 - t; return [u * u * x0 + 2 * u * t * 300 + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y0 + off]; };
    let d = '';
    for (let i = 0; i <= n; i++) {
      const p = q(i / n, -th / 2);
      if (!i) d += `M${r1(p[0])} ${r1(p[1])}`;
      else { const m = q((i - 0.5) / n, -th / 2 - amp * [1.3, 0.7, 1][i % 3]); d += `Q${r1(m[0])} ${r1(m[1])} ${r1(p[0])} ${r1(p[1])}`; }
    }
    for (let i = n; i >= 0; i--) {
      const p = q(i / n, th / 2);
      if (i === n) { const e = q(1, 0); d += `Q${r1(e[0] + amp * 1.6)} ${r1(e[1])} ${r1(p[0])} ${r1(p[1])}`; }
      else { const m = q((i + 0.5) / n, th / 2 + amp * [0.8, 1.2, 1][i % 3]); d += `Q${r1(m[0])} ${r1(m[1])} ${r1(p[0])} ${r1(p[1])}`; }
    }
    const b = q(0, 0);
    d += `Q${r1(b[0] - amp * 1.6)} ${r1(b[1])} ${r1(q(0, -th / 2)[0])} ${r1(q(0, -th / 2)[1])}Z`;
    let tufts = '';
    for (let i = 1; i < n; i += 2) {
      const a = q(i / n + 0.02, -th * 0.3), c = q(i / n - 0.02, th * 0.05);
      tufts += `M${r1(a[0])} ${r1(a[1])}Q${r1((a[0] + c[0]) / 2 + 6)} ${r1((a[1] + c[1]) / 2)} ${r1(c[0])} ${r1(c[1])}`;
    }
    return P(d, fill) + S(tufts, line, 3, 0.4);
  }
  // back hair (behind the head) whose lower edge ends in pointed locks instead of a flat cut
  const backHair = (b, x0 = 186, x1 = 414, top = 120) =>
    `M${x0} 300C${x0 - 16} 220 ${x0 + 10} ${top + 8} 300 ${top}C${x1 - 10} ${top + 8} ${x1 + 16} 220 ${x1} 300Q${x1 + 6} ${b - 50} ${x1 - 4} ${b}L${x1 - 20} ${b - 34}L${x1 - 32} ${b + 2}L${x1 - 48} ${b - 44}L${x1 - 60} ${b - 20}H${x0 + 60}L${x0 + 48} ${b - 44}L${x0 + 32} ${b + 2}L${x0 + 20} ${b - 34}L${x0 + 4} ${b}Q${x0 - 6} ${b - 50} ${x0} 300Z`;
  // isometric die with pips on the top face
  const die = (x, y, s, rot) => G(`translate(${x} ${y}) rotate(${rot}) scale(${s})`,
    P('M0-30L28-16L0-2L-28-16Z', '#fff') + P('M-28-16L0-2V30L-28 16Z', '#d6dce8') + P('M28-16L0-2V30L28 16Z', '#aeb8cc') +
    E(0, -16, 5, 3, '#2a3a8a') + E(-14, 0, 3, 4, '#2a3a8a') + E(-14, 14, 3, 4, '#2a3a8a') + E(14, 2, 3, 4, '#2a3a8a') + E(14, 18, 3, 4, '#2a3a8a'));
  const flower5 = (x, y, r, c, mid, rot = 0) => {
    let s = '';
    for (let i = 0; i < 5; i++) s += C(r1(Math.cos((i * 72 + rot) * Math.PI / 180) * r * 0.6), r1(Math.sin((i * 72 + rot) * Math.PI / 180) * r * 0.6), r1(r * 0.55), c);
    return G(`translate(${x} ${y})`, s + C(0, 0, r1(r * 0.3), mid));
  };
  const star = (x, y, r, c, o = 1) => P(`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`, c, op(o));

  // Background: soft radial colour, a halo behind the head, bokeh
  const BOK = [[80, 118, 26, 0.3], [524, 98, 16, 0.42], [544, 300, 34, 0.18], [58, 334, 13, 0.36], [470, 190, 9, 0.5], [128, 226, 7, 0.45]];
  const bgDefs = (c) =>
    rg('bg', [[0, c[0]], [0.55, c[1]], [1, c[2]]], 0.5, 0.36, 0.8) + rg('halo', [[0, '#fff', 0.55], [0.6, '#fff', 0.12], [1, '#fff', 0]]);
  const bgBody = (dots = '#fff', extra = '') =>
    `<rect width="600" height="600" fill="url(#bg)"/>` + C(300, 250, 250, 'url(#halo)') +
    BOK.map(([x, y, r, o]) => C(x, y, r, dots, op(o))).join('') + extra;

  // Register: build() returns [defs, background, character]; the character is drawn larger than the canvas,
  // so drawing coordinates x 54–546, y 36–528 are what shows.
  function avatar(id, title, tags, build) {
    def(id, {
      title, w: 600, h: 600, tags: ['avatar'].concat(tags),
      svg: (w, h) => {
        EID = 0;
        const [d, b, c] = build();
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${d}</defs>${b}<g transform="matrix(1.22 0 0 1.22 -66 -44)">${c}</g></svg>`;
      },
    });
  }
  const GINGER = ['#f29a5a', '#cf6634', '#8c3c1e'];
  const FAMILY_IRIS = ['#8cc4ff', '#3f84de', '#183c86'];

  // ======================================================================================
  // Childe (the phone's owner)
  avatar('av_childe', 'Childe', ['childe', 'me'], () => {
    const k = SKIN.warm;
    const fr = cap([[176, 238], [190, 336], [204, 230], [220, 292], [236, 210], [256, 274], [272, 198], [296, 264], [312, 194], [338, 258], [352, 202], [378, 272], [392, 226], [410, 334], [424, 238]], {
      sw: 8,
      crown: 'C434 196 428 160 412 140L434 124Q414 120 400 110L410 88Q384 94 364 90L368 66Q342 80 318 84Q298 72 272 76L282 90Q252 92 230 104L212 90Q208 112 202 124Q184 136 174 152L156 156Q172 178 172 200Q168 220 176 238',
    });
    return [
      bgDefs(['#d6ecff', '#7fb8ea', '#2d6eb0']) + skinDefs(k) + hairG('hr', ['#e8874e', '#b44a2b', '#6c281a']) +
      iris('ir', ['#6f9fe6', '#2f5bb0', '#122459']) +
      lg('jk', [[0, '#80868f'], [1, '#4a4f58']]) + lg('sc', [[0, '#e5464d'], [1, '#a1202b']]) +
      lg('ms', [[0, '#e8505a'], [1, '#9a1d27']]) + rg('gem', [[0, '#c9f2ff'], [0.45, '#3aa0e6'], [1, '#1d5fa8']], 0.4, 0.35, 0.7),
      bgBody('#fff', S('M40 470Q120 440 200 470T360 470T520 470T680 470', '#fff', 6, 0.18) + S('M-20 520Q60 490 140 520T300 520T460 520T620 520', '#fff', 6, 0.12)),
      P('M174 300C156 220 180 126 250 102C312 82 384 96 420 152C446 200 442 268 426 312L414 354L400 318L388 350L376 300H224L212 352L200 316L188 348Z', 'url(#hr)') +
      neck(k) +
      // grey jacket, dark shirt, red scarf, Vision pendant
      P(TORSO, 'url(#jk)') +
      P('M260 438L300 540L340 438Z', '#2a2e38') +
      P('M262 436L226 452L284 600H300V540Z', '#969ca5') + P('M338 436L374 452L316 600H300V540Z', '#6d727c') +
      S('M110 540Q126 512 152 496M490 540Q474 512 448 496', '#3e424a', 5, 0.5) +
      S('M300 470V486', '#d9b45a', 3) +
      G('translate(300 502)', P('M0-19L14 0L0 19L-14 0Z', '#e2bd5e') + P('M0-13L9 0L0 13L-9 0Z', 'url(#gem)') + C(-2, -5, 2.6, '#fff', op(0.9))) +
      P('M244 426Q300 466 356 426L366 452Q300 498 234 452Z', 'url(#sc)') +
      P('M338 458Q362 504 360 560H416Q408 500 366 448Z', 'url(#sc)') + S('M366 474Q384 510 390 550', '#8a1a24', 4, 0.5) +
      S('M250 444Q300 476 350 444', '#ff8a8a', 3, 0.4) +
      head(k, { face: 'm', blush: 0.45 }) +
      eyes({ lash: '#3a1c18', hl: 0.3 }) +
      brows('#7a3322', { w: 8, ar: 6, r: { lo: 5 } }) +
      nose(k) +
      grin({ y: 352, w: 30, d: 24, tilt: 5 }) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#ffbe8a', 142, 224, 376, 0.4) +
      S('M246 228Q262 200 286 190M320 194Q342 200 360 222M206 170Q224 150 250 140', '#6c281a', 4, 0.45) +
      // Fatui half-mask pushed up on the side of the head
      G('translate(392 148) rotate(26) scale(.92)',
        P('M-70-26Q-36-46 0-36Q36-46 70-26L86-48L80-14Q72 14 38 20Q14 22 0 40Q-14 22-38 20Q-72 14-80-14L-86-48Z', 'url(#ms)') +
        P('M-54-6Q-34-24-12-10Q-30 6-54-6ZM54-6Q34-24 12-10Q30 6 54-6Z', '#3b0c12') +
        S('M-70-26Q-36-46 0-36Q36-46 70-26L86-48L80-14Q72 14 38 20Q14 22 0 40Q-14 22-38 20Q-72 14-80-14L-86-48Z', '#2a0a10', 3.5) +
        S('M-62 8Q-40 14-20 10M62 8Q40 14 20 10M0-34V-14', '#2a0a10', 3, 0.8) + S('M-62-30Q-32-42-6-32', '#ff9a9a', 3, 0.5)) +
      S('M418 334V350', '#c8323c', 3) + P('M418 348l7 12l-7 14l-7-14z', '#c8323c'),
    ];
  });

  // Zhongli
  avatar('av_zl', 'Zhongli', ['zl', 'zhongli'], () => {
    const k = SKIN.fair;
    const fr = cap([[184, 250], [204, 428], [218, 238], [236, 304], [254, 196], [278, 262], [298, 172], [318, 252], [340, 198], [362, 294], [380, 236], [398, 430], [418, 250]], { top: 104, k: 0.68 });
    return [
      bgDefs(['#fff1cf', '#e8bd6c', '#9a6526']) + skinDefs(k) +
      lgu('hr', [[0, '#4a3326'], [0.55, '#2e1f17'], [0.72, '#5a3a1e'], [1, '#f0b55a']], 0, 120, 0, 432) +
      lgu('pt', [[0, '#2e1f17'], [0.4, '#3a2617'], [0.75, '#a06e2c'], [1, '#f2bc62']], 0, 440, 0, 528) +
      iris('ir', ['#ffd77a', '#e09a2c', '#8a4a12']) +
      lg('ct', [[0, '#4a3628'], [1, '#2a1d15']]) + lg('gd', [[0, '#f6d78c'], [1, '#b8862e']]),
      bgBody('#fff8e0', C(110, 470, 40, '#fff', op(0.12)) + C(500, 430, 22, '#fff', op(0.2))),
      P('M186 300C172 220 198 126 300 118C402 126 428 220 414 300C410 340 392 380 366 416L360 470H240L234 416C208 380 190 340 186 300Z', 'url(#hr)') +
      neck(k, 30) +
      P(TORSO, 'url(#ct)') +
      // high collar with gold trim and an amber stone
      P('M258 396Q300 414 342 396L354 462Q300 488 246 462Z', '#3a2a20') +
      S('M258 398Q300 416 342 398', 'url(#gd)', 4) + S('M246 462Q300 488 354 462', 'url(#gd)', 5) +
      S('M262 420Q300 434 338 420M264 442Q300 456 336 442', '#d9a74a', 2, 0.45) +
      P('M300 474L316 494L300 514L284 494Z', 'url(#gd)') + P('M300 484L308 494L300 504L292 494Z', '#e8962c') +
      P('M120 500L190 466L204 494L132 528Z', '#5a4230') + S('M190 466L204 494', 'url(#gd)', 3) +
      P('M480 500L410 466L396 494L468 528Z', '#5a4230') + S('M410 466L396 494', 'url(#gd)', 3) +
      // long ponytail over the shoulder, amber at the tip
      P('M264 430C222 444 192 478 186 530H246C246 498 258 470 284 450Z', 'url(#pt)') +
      S('M240 456Q212 484 206 526M258 452Q234 482 228 526', '#7a5028', 2.5, 0.5) +
      P('M250 436l30-10l7 16l-30 11z', '#d9a74a') +
      head(k, { face: 'm', blush: 0.25 }) +
      eyes({ lash: '#3a1712', lid: 0.42, liner: '#d8452e' }) +
      brows('#3a2418', { w: 6, ar: 3, li: -2 }) +
      nose(k) + smile(16, 4, '#9a4a44', 362, 5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#a87a50', 146, 226, 376, 0.4) +
      S('M300 176Q270 196 252 240M300 176Q330 196 346 236', '#6a4a30', 3, 0.5) +
      // single long tassel earring
      S('M420 330V346', '#d9a74a', 3) + C(420, 352, 7, '#e8962c') + P('M414 360h12l4 92h-20z', '#c89038') + S('M416 366V448M420 366V452M424 366V448', '#8a5a1e', 1.5, 0.7),
    ];
  });

  // Teucer, 8
  avatar('av_teucer', 'Teucer', ['teucer', 'family'], () => {
    const k = SKIN.warm;
    const fr = cap([[184, 250], [192, 318], [208, 232], [226, 276], [246, 226], [270, 272], [292, 222], [316, 270], [338, 224], [362, 274], [384, 230], [404, 320], [416, 250]], { top: 120, sw: 5 });
    const flake = (x, y, r) => G(`translate(${x} ${y})`, S(`M0-${r}V${r}M-${r * 0.87}-${r / 2}L${r * 0.87} ${r / 2}M-${r * 0.87} ${r / 2}L${r * 0.87}-${r / 2}`, '#fff', 3.5, 0.85));
    return [
      bgDefs(['#fffbe0', '#ffe07a', '#f0a43a']) + skinDefs(k) + hairG('hr', ['#ffab64', '#e2763a', '#a24a24']) +
      iris('ir', FAMILY_IRIS) +
      lg('hat', [[0, '#5b9be6'], [1, '#2c5fae']]) + lg('cf', [[0, '#eef4fb'], [1, '#c4d4e6']]) + lg('ct', [[0, '#f26b5b'], [1, '#b8343a']]),
      bgBody('#fff', flake(96, 140, 16) + flake(510, 230, 12) + flake(520, 470, 18) + flake(70, 420, 10)),
      P('M190 300C176 230 200 160 300 156C400 160 424 230 410 300L400 340H200Z', 'url(#hr)') +
      neck(k, 28) +
      // red puffy coat
      P('M20 600C30 520 96 478 196 462C230 456 256 448 268 438H332C344 448 370 456 404 462C504 478 570 520 580 600Z', 'url(#ct)') +
      S('M110 520Q190 500 252 512M348 512Q410 500 490 520', '#8f2430', 5, 0.5) +
      P('M258 438Q300 478 342 438L352 462Q300 506 248 462Z', '#f4e6c8') + S('M262 452Q300 486 338 452', '#d9c8a4', 3, 0.7) +
      head(k, { face: 'c', blush: 1 }) +
      [[224, 332], [238, 322], [252, 334], [348, 334], [362, 322], [376, 332], [234, 346], [366, 346]].map(([x, y]) => C(x, y, 3.4, '#c46a44', op(0.7))).join('') +
      eyes({ lash: '#3a1c18', k: 1.1 }, 300, 50) +
      brows('#b45a30', { w: 7, ar: 9, li: 4 }, 300, 50) +
      nose(k, 6) +
      grin({ y: 358, w: 34, d: 32, gap: true }) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      P(lock(196, 240, 182, 320, 30, -8), 'url(#hr)') + P(lock(404, 240, 418, 320, 30, 8), 'url(#hr)') +
      // knitted beanie with a fold and a pompom
      P('M182 224C176 128 236 78 300 76C364 78 424 128 418 224Z', 'url(#hat)') +
      S('M226 108V204M260 88V204M300 80V204M340 88V204M374 108V204', '#24508f', 4, 0.5) +
      P('M170 220Q300 178 430 220L434 254Q300 214 166 254Z', 'url(#cf)') +
      S('M192 232V248M218 224V242M244 218V236M272 214V232M300 212V230M328 214V232M356 218V236M382 224V242M408 232V248', '#a8b8cc', 4, 0.8) +
      C(300, 72, 34, '#f4f6fb') + C(290, 62, 16, '#fff') + S('M276 68Q300 48 322 70', '#c8d2e0', 4, 0.6),
    ];
  });

  // Tonia, 15
  avatar('av_tonia', 'Tonia', ['tonia', 'family'], () => {
    const k = SKIN.warm;
    const fr = cap([[188, 252], [200, 334], [212, 236], [228, 284], [244, 210], [266, 262], [284, 192], [314, 244], [338, 200], [370, 264], [386, 222], [404, 344], [416, 252]], { top: 108, sw: 10 });
    return [
      bgDefs(['#fff0f3', '#f6b8c6', '#c86a86']) + skinDefs(k) + hairG('hr', GINGER) + iris('ir', FAMILY_IRIS) +
      lg('ct', [[0, '#3a4a78'], [1, '#222c4c']]) + lg('sf', [[0, '#3f9a92'], [1, '#246a66']]),
      bgBody('#fff', star(110, 180, 14, '#fff', 0.7) + star(500, 140, 10, '#fff', 0.7) + star(470, 400, 12, '#fff', 0.5)),
      P(backHair(410), 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#ct)') +
      // chunky knitted scarf
      P('M228 420Q300 470 372 420L392 462Q300 524 208 462Z', 'url(#sf)') +
      S('M232 440Q300 488 368 440', '#f4ead2', 7, 0.9) + S('M222 456Q300 506 378 456', '#1c5450', 3, 0.5) +
      P('M252 470Q246 506 252 540H300Q298 504 296 478Z', 'url(#sf)') + S('M262 490H294M262 510H296', '#f4ead2', 6, 0.9) +
      S('M254 530l-2 10M266 532v10M278 532v10M290 532v10', '#246a66', 4) +
      // braid over the shoulder
      braid(396, 350, 420, 504, 5, 50, 'url(#hr)', '#7a3018') +
      P('M408 494h26v14h-26z', '#3f9a92') + P(lock(421, 506, 424, 528, 26, 0), 'url(#hr)') +
      head(k, { face: 'f', blush: 0.7 }) +
      eyes({ lash: '#3a1c18', lid: 0.12 }) +
      brows('#a24a26', { w: 6, ar: 6, li: 4 }) +
      nose(k) + smile(14, 4, '#b44c56', 364, 5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#ffc08a', 148, 226, 376, 0.45) +
      S('M284 196Q260 220 250 250M296 200Q330 214 352 240', '#8c3c1e', 3, 0.5),
    ];
  });

  // Anthon, 12
  avatar('av_anthon', 'Anthon', ['anthon', 'family'], () => {
    const k = SKIN.warm;
    const fr = cap([[186, 250], [198, 320], [212, 232], [230, 284], [246, 214], [268, 270], [284, 200], [306, 262], [324, 204], [346, 266], [364, 216], [384, 280], [396, 232], [408, 322], [416, 250]], {
      sw: -8, crown: 'C426 190 420 150 400 128L412 108Q388 110 372 104L376 84Q352 92 334 90L330 70Q312 84 296 88L282 70Q272 88 258 94L238 84Q236 102 226 112Q204 124 196 142L178 140Q186 160 184 184Q178 214 186 250',
    });
    let px = '';
    [[70, 120, 22], [500, 90, 16], [520, 330, 26], [64, 400, 14], [470, 470, 18], [120, 520, 12]].forEach(([x, y, s], i) => { px += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${i % 2 ? '#7ff5c4' : '#fff'}" opacity="${i % 2 ? 0.45 : 0.3}"/>`; });
    return [
      bgDefs(['#efe4ff', '#a98ae8', '#4a2e98']) + skinDefs(k) + hairG('hr', GINGER) + iris('ir', FAMILY_IRIS) +
      lg('hd', [[0, '#4f6070'], [1, '#2c3642']]) + lg('cp', [[0, '#3a3c48'], [1, '#16171d']]),
      bgBody('#fff', px),
      P('M190 300C174 220 200 140 300 134C400 140 426 220 410 300L400 340H200Z', 'url(#hr)') +
      neck(k, 28) +
      // hoodie with hood and drawstrings
      P(TORSO, 'url(#hd)') +
      P('M190 470Q300 404 410 470L398 490Q300 440 202 490Z', '#24303c') +
      S('M282 450V512M318 450V512', '#eef2f6', 4) + C(282, 514, 5, '#eef2f6') + C(318, 514, 5, '#eef2f6') +
      head(k, { face: 'c', blush: 0.5 }) +
      eyes({ lash: '#3a1c18', lid: 0.22 }) +
      brows('#a24a26', { w: 7, ar: 5, li: -2, r: { lo: 8, ar: 10 } }) +
      nose(k) + smirk('#a8464e', 362) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#ffc08a', 140, 228, 372, 0.4) +
      // gaming headset: band, ear cups with green light, mic boom
      S('M180 262C168 140 228 82 300 80C372 82 432 140 420 262', 'url(#cp)', 24) +
      S('M190 226C190 140 240 96 300 94', '#5a5e6e', 4, 0.6) +
      `<rect x="146" y="236" width="64" height="112" rx="30" fill="url(#cp)"/><rect x="390" y="236" width="64" height="112" rx="30" fill="url(#cp)"/>` +
      `<rect x="158" y="250" width="40" height="84" rx="20" fill="none" stroke="#3cf0a0" stroke-width="5"/><rect x="402" y="250" width="40" height="84" rx="20" fill="none" stroke="#3cf0a0" stroke-width="5"/>` +
      S('M176 330Q190 392 256 384', '#22232b', 8) + C(258, 383, 11, '#3a3c48') + C(258, 383, 4, '#3cf0a0'),
    ];
  });

  // Mama
  avatar('av_mama', 'Mama', ['mama', 'family'], () => {
    const k = SKIN.warm;
    const fr = cap([[192, 250], [204, 344], [214, 236], [300, 168], [386, 236], [396, 344], [408, 250]], { top: 104, k: 0.72 });
    const sc = 'M206 436C196 340 192 280 198 226C206 168 248 140 300 138C352 140 394 168 402 226C408 280 404 340 394 436Q424 470 462 482C456 400 448 330 440 250C436 180 420 120 382 96C364 70 324 70 300 88C230 92 178 150 164 250C156 330 146 400 138 482Q178 470 206 436Z';
    const hole = 'M206 420C196 340 192 280 198 226C206 168 248 140 300 138C352 140 394 168 402 226C408 280 404 340 394 420Z';
    let dots = '';
    [[178, 220], [198, 150], [244, 110], [300, 104], [352, 100], [404, 150], [420, 230], [172, 310], [428, 320], [164, 400], [438, 404], [160, 460], [440, 462]].forEach(([x, y]) => { dots += flower5(x, y, 13, '#fff1d6', '#e8a63a'); });
    return [
      bgDefs(['#fff4ea', '#ffcaa8', '#e0866a']) + skinDefs(k) + hairG('hr', ['#d89a68', '#a8673e', '#6e3e24']) + iris('ir', FAMILY_IRIS) +
      lg('sf', [[0, '#d94a3a'], [1, '#9a2a24']]) + lg('cd', [[0, '#e8b456'], [1, '#b47e2a']]),
      bgBody('#fff'),
      P(TORSO, 'url(#cd)') +
      neck(k, 28) +
      P('M266 436L300 476L334 436', '#fbf4e6', ' stroke="#e8dcc4" stroke-width="3"') +
      S('M262 446L300 520L338 446', '#a87428', 3, 0.5) + C(300, 506, 5, '#fbf4e6') + C(300, 526, 5, '#fbf4e6') +
      // warm headscarf over her bun, draped onto the shoulders
      P(sc, 'url(#sf)') + S('M144 484l-4 14M156 480l-2 14M168 476v14M180 470l2 14M192 462l4 12M456 484l4 14M444 480l2 14M432 476v14M420 470l-2 14M408 462l-4 12', '#9a2a24', 4) +
      head(k, { face: 'f', blush: 0.8 }) +
      eyes({ lash: '#4a2a22', lid: 0.32 }) +
      S('M208 300l-10-2M210 310l-10 4M392 300l10-2M390 310l10 4', k[3], 3, 0.6) +
      brows('#8a5434', { w: 6, ar: 6, li: 3 }) +
      nose(k) + smile(22, 8, '#b4505a', 360, 5.5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      S('M300 172Q262 196 240 240M300 172Q338 196 360 240', '#6e3e24', 3, 0.5) +
      P(hole + 'M120 520V60H480V520Z', 'url(#sf)', ` fill-rule="evenodd" clip-path="url(#scc)"`) +
      `<clipPath id="scc"><path d="${sc}"/></clipPath>` +
      `<g clip-path="url(#scc)">${dots}</g>` +
      S('M206 436C196 340 192 280 198 226C206 168 248 140 300 138C352 140 394 168 402 226C408 280 404 340 394 436', '#fff1d6', 5, 0.85, ' stroke-dasharray="2 10"') +
      S('M156 440Q300 470 444 440', '#7a1e1a', 3, 0),
    ];
  });

  // Papa
  avatar('av_papa', 'Papa', ['papa', 'family'], () => {
    const k = SKIN.tan;
    return [
      bgDefs(['#f2f6f8', '#b8cad6', '#5e7a8e']) + skinDefs(k) + iris('ir', FAMILY_IRIS) +
      lg('bd', [[0, '#c27448'], [0.6, '#a8684a'], [1, '#bfa392']]) + lg('cp', [[0, '#3a4a6a'], [1, '#1e2638']]) +
      lg('sw', [[0, '#eadfca'], [1, '#bcae92']]),
      bgBody('#fff', S('M0 470H600', '#fff', 3, 0.35) + S('M70 160q16-14 32 0q16-14 32 0M470 220q12-10 24 0q12-10 24 0', '#4a5e70', 4, 0.5)),
      neck(k, 34) +
      // cream cable-knit roll neck
      P(TORSO, 'url(#sw)') +
      S('M200 470Q190 500 200 530M230 466Q222 500 230 530M370 466Q378 500 370 530M400 470Q410 500 400 530', '#a8987a', 5, 0.55) +
      P('M246 414Q300 446 354 414L368 466Q300 500 232 466Z', '#e8dcc4') + S('M252 430Q300 458 348 430M244 448Q300 478 356 448', '#bcae92', 4, 0.7) +
      head(k, { face: 'o', blush: 0.35 }) +
      // greying ginger hair at the temples
      P(lock(200, 210, 196, 290, 26, -4), '#b8835e') + P(lock(400, 210, 404, 290, 26, 4), '#b8835e') +
      S('M196 230L200 280M404 230L400 280', '#e2dad2', 3, 0.7) +
      eyes({ lash: '#3a2418', lid: 0.36, k: 0.92 }) +
      S('M212 298l-12-4M212 308l-12 4M388 298l12-4M388 308l12 4M234 322Q252 330 270 322M330 322Q348 330 366 322', k[3], 3, 0.6) +
      brows('#a8724e', { w: 11, ar: 4, li: 2 }) +
      nose(k) +
      // full beard and moustache
      P('M200 262C196 330 212 386 252 412Q280 432 300 432Q320 432 348 412C388 386 404 330 400 262C396 300 384 330 364 346Q340 358 300 352Q260 358 236 346C216 330 204 300 200 262Z', 'url(#bd)') +
      S('M226 330Q240 380 270 410M374 330Q360 380 330 410M300 384V426M250 350Q262 390 286 418M350 350Q338 390 314 418', '#ece4dc', 3.5, 0.6) +
      S('M284 370Q300 378 316 370', '#5a2a20', 5) +
      P('M254 354Q274 330 300 340Q326 330 346 354Q334 364 316 358Q300 352 284 358Q266 364 254 354Z', '#b0704a') +
      // fisherman's cap
      P('M172 204C164 152 196 106 300 102C404 106 436 152 428 204Z', 'url(#cp)') +
      S('M210 150Q300 118 390 150', '#5a6a8a', 6, 0.5) +
      P('M176 198Q300 180 424 198L426 222Q300 204 174 222Z', '#141a28') +
      S('M182 206Q300 190 418 206', '#c9a24a', 3, 0.85, ' stroke-dasharray="7 5"') +
      P('M200 216Q300 202 400 216Q394 248 300 246Q206 248 200 216Z', '#10141c') + S('M216 224Q300 212 384 224', '#4a5468', 3, 0.6),
    ];
  });

  // Hu Tao
  avatar('av_ht', 'Hu Tao', ['ht', 'hutao'], () => {
    const k = SKIN.fair;
    const fr = cap([[192, 252], [204, 344], [216, 240], [234, 280], [250, 214], [268, 270], [286, 208], [300, 290], [314, 208], [334, 268], [352, 214], [370, 280], [386, 240], [398, 344], [410, 252]], { top: 112 });
    const ghost = G('translate(506 400)', P('M-26 10C-26-20-14-34 0-34C14-34 26-20 26 10L18 4L10 12L0 4L-10 12L-18 4Z', '#fff', op(0.9)) + C(-8, -12, 3.5, '#4a3040') + C(8, -12, 3.5, '#4a3040') + S('M-5-3Q0 1 5-3', '#4a3040', 2.5));
    return [
      bgDefs(['#ffe8d6', '#f59a72', '#a83230']) + skinDefs(k) + hairG('hr', ['#6e3e2e', '#40231a', '#1e100c']) +
      iris('ir', ['#ff8a6a', '#e0302c', '#6a0c14']) +
      lg('ct', [[0, '#5a3426'], [1, '#2e1812']]) + lg('ht', [[0, '#2e2a30'], [1, '#0e0c10']]),
      bgBody('#fff', ghost + flower5(90, 150, 16, '#ffd0d6', '#fff6e0') + flower5(520, 240, 12, '#ffd0d6', '#fff6e0') + flower5(70, 430, 10, '#ffd0d6', '#fff6e0')),
      P('M186 300C170 220 196 128 300 120C404 128 430 220 414 300L404 380H196Z', 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#ct)') +
      P('M228 436L300 530L372 436L398 452L300 560L202 452Z', '#1e1210') +
      S('M232 448L300 536L368 448', '#d9a74a', 3, 0.8) + S('M120 520Q140 492 168 478M480 520Q460 492 432 478', '#c8323c', 4, 0.7) +
      // twin tails over the shoulders
      P('M214 316C172 340 140 404 136 470C134 496 138 516 146 532H202C192 500 194 460 204 420C212 384 226 356 242 338Z', 'url(#hr)') +
      P('M386 316C428 340 460 404 464 470C466 496 462 516 454 532H398C408 500 406 460 396 420C388 384 374 356 358 338Z', 'url(#hr)') +
      S('M170 400Q160 450 170 520M430 400Q440 450 430 520', '#7a4636', 3, 0.5) +
      head(k, { face: 'f', blush: 0.8 }) +
      eyes({ lash: '#2a1214', pup: 'plum', pc: '#4a0610', pc2: '#ffb3a8' }) +
      brows('#3a2018', { w: 6, ar: 10, li: 3 }) +
      nose(k) + grin({ y: 352, w: 26, d: 22, tilt: 4, fang: true }) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      // pork-pie hat with plum blossoms and a red talisman
      E(300, 124, 128, 26, 'url(#ht)') +
      P('M226 126L232 64Q300 50 368 64L374 126Z', 'url(#ht)') + E(300, 64, 68, 12, '#3a343c') +
      P('M228 112Q300 124 372 112L373 126Q300 138 227 126Z', '#6a1c1c') +
      S('M332 100Q362 84 392 92', '#4a2a1a', 4) +
      flower5(350, 98, 18, '#e8455a', '#ffd27a') + flower5(384, 88, 15, '#f0687a', '#ffd27a', 20) + flower5(398, 116, 13, '#e8455a', '#ffd27a', 40) +
      P('M196 128L222 126L228 208L202 212Z', '#e2453a') + S('M206 146H220M208 160Q216 168 222 158M210 178H222M212 192Q218 200 224 190', '#ffd27a', 2.5),
    ];
  });

  // Lumine
  avatar('av_lumine', 'Lumine', ['lumine'], () => {
    const k = SKIN.fair;
    const fr = cap([[190, 252], [202, 364], [214, 236], [232, 290], [246, 212], [266, 272], [282, 200], [302, 264], [318, 200], [340, 270], [356, 212], [376, 280], [390, 236], [400, 368], [412, 252]], { top: 110, sw: 6 });
    let petals = '';
    for (let i = 0; i < 6; i++) petals += P('M0 0Q11-16 0-36Q-11-16 0 0Z', '#fff', ` transform="rotate(${i * 60})" stroke="#c8d6e8" stroke-width="2"`);
    return [
      bgDefs(['#eef9ff', '#a6d8f0', '#3a86b4']) + skinDefs(k) + hairG('hr', ['#fff1b8', '#ecc768', '#b08332']) +
      iris('ir', ['#ffe08a', '#e8a830', '#8c5a16']) +
      lg('dr', [[0, '#ffffff'], [1, '#cfd8e6']]) + lg('gd', [[0, '#f6d78c'], [1, '#c08a2e']]),
      bgBody('#fff', G('translate(96 150) rotate(20)', P('M0 0Q8-10 0-22Q-8-10 0 0Z', '#fff', op(0.8))) + G('translate(500 420) rotate(-30)', P('M0 0Q8-10 0-22Q-8-10 0 0Z', '#fff', op(0.7)))),
      P(backHair(372, 188, 412, 124), 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#dr)') +
      P('M262 436Q300 480 338 436L350 444Q300 500 250 444Z', 'url(#gd)') +
      P('M300 470L312 486L300 502L288 486Z', '#2a4a8a') + S('M300 470L312 486L300 502L288 486Z', 'url(#gd)', 3) +
      S('M100 540Q140 500 200 480M500 540Q460 500 400 480', '#b8c4d6', 4, 0.6) +
      head(k, { face: 'f', blush: 0.6 }) +
      eyes({ lash: '#3a2a18', lid: 0.1 }) +
      brows('#b8893a', { w: 6, ar: 5 }) +
      nose(k) + smile(16, 6, '#b44c56', 362, 5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#fffbe6', 150, 226, 376, 0.7) +
      // white Inteyvat flower
      G('translate(382 182)', petals + C(0, 0, 9, '#f6e7a2') + S('M0 0L-6-12M0 0L8-10M0 0L10 6', '#d9b44a', 2)),
    ];
  });

  // Paimon
  avatar('av_paimon', 'Paimon', ['paimon'], () => {
    const k = SKIN.fair;
    const fr = cap([[188, 256], [198, 352], [212, 240], [234, 282], [252, 226], [276, 276], [296, 222], [320, 278], [342, 226], [366, 282], [388, 240], [402, 352], [412, 256]], { top: 120 });
    let st = '';
    [[110, 120, 10], [480, 90, 14], [520, 280, 8], [70, 330, 9], [500, 470, 11], [140, 500, 7]].forEach(([x, y, r]) => { st += star(x, y, r, '#fff', 0.85); });
    let cape = '';
    [[150, 500], [190, 480], [420, 486], [460, 510], [128, 524], [478, 470]].forEach(([x, y], i) => { cape += star(x, y, i % 2 ? 6 : 9, '#ffe9a8', 0.9); });
    return [
      bgDefs(['#f6f1ff', '#cbb9f6', '#7660c4']) + skinDefs(k) + hairG('hr', ['#ffffff', '#eceefa', '#b9bbd8']) +
      iris('ir', ['#c0a8ff', '#6c4ad2', '#22185c']) +
      lg('cp', [[0, '#2c3a7a'], [1, '#141c44']]) + lg('cl', [[0, '#ffffff'], [1, '#d8dcec']]) + lg('cr', [[0, '#3a3f78'], [1, '#121434']]),
      bgBody('#fff', st),
      // starry cape
      P('M50 600C60 500 130 452 210 442H390C470 452 540 500 550 600Z', 'url(#cp)') + cape +
      P(backHair(380, 184, 416, 130), 'url(#hr)') +
      neck(k, 24) +
      P('M126 600C136 520 186 478 244 466Q270 458 276 448H324Q330 458 356 466C414 478 464 520 474 600Z', 'url(#cl)') +
      P('M256 448Q300 486 344 448L352 462Q300 506 248 462Z', '#f2d07a') + C(300, 486, 8, '#5a8ae8') +
      head(k, { face: 'c', blush: 1 }) +
      eyes({ lash: '#2a1e48', k: 1.3 }, 302, 54) +
      brows('#a0a2c8', { w: 5, ar: 9, li: 5 }, 302, 54) +
      grin({ y: 366, w: 22, d: 26, teeth: false }) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#fff', 152, 228, 372, 0.9) +
            // dark star crown floating above her head
      G('translate(304 76) rotate(-10)', P('M0-46L13-16L46-14L20 6L28 40L0 22L-28 40L-20 6L-46-14L-13-16Z', 'url(#cr)') + P('M0-26L7-10L24-9L11 2L15 20L0 11L-15 20L-11 2L-24-9L-7-10Z', '#6a74c8', op(0.6)) + C(0, 0, 6, '#ffe9a8')),
    ];
  });

  // Ekaterina
  avatar('av_ekat', 'Ekaterina', ['ekat', 'fatui'], () => {
    const k = SKIN.fair;
    const fr = cap([[190, 252], [194, 394], [212, 248], [228, 266], [246, 252], [264, 268], [282, 254], [300, 270], [318, 254], [336, 268], [354, 252], [372, 266], [388, 248], [406, 394], [410, 252]], { top: 112 });
    return [
      bgDefs(['#eef1f8', '#b4bfd8', '#56648a']) + skinDefs(k) + hairG('hr', ['#4a3a44', '#261d24', '#120c10']) +
      iris('ir', ['#bcccf2', '#6a7ab4', '#28325e']) + lg('fr', [[0, '#ffffff'], [1, '#d6dae6']]) + lg('jk', [[0, '#34447e'], [1, '#1a2448']]),
      bgBody('#fff', `<rect x="440" y="60" width="90" height="140" rx="6" fill="#fff" opacity=".12"/><rect x="60" y="380" width="70" height="120" rx="6" fill="#fff" opacity=".1"/>`),
      P('M184 300C168 220 196 126 300 120C404 126 432 220 416 300L414 398Q300 412 186 398Z', 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#jk)') +
      P('M270 436L300 478L330 436Z', '#f6f6fa') + P('M294 446h12l4 30l-10 10l-10-10z', '#c8323c') +
      fur('url(#fr)', '#b8bccc', 140, 460, 488, 424, 38) +
      G('translate(372 508)', P('M0-12L10 0L0 12L-10 0Z', '#c8323c') + C(0, 0, 4, '#ffd27a')) +
      head(k, { face: 'f', blush: 0.5 }) +
      eyes({ lash: '#1e1418', lid: 0.15 }) +
      brows('#2a1e24', { w: 6, ar: 5, li: 1 }) +
      nose(k) + smile(14, 5, '#b04a56', 362, 5) +
      fringeShade(fr, k, 10) +
      P(fr, 'url(#hr)') +
      shine('#8a7a8a', 146, 226, 376, 0.5),
    ];
  });

  // La Signora
  avatar('av_signora', 'La Signora', ['signora', 'fatui', 'harbinger'], () => {
    const k = SKIN.pale;
    const fr = cap([[192, 250], [202, 306], [218, 214], [262, 250], [256, 198], [318, 250], [304, 192], [368, 272], [350, 206], [402, 320], [412, 250]], { top: 110, sw: 16 });
    const mask = 'M300 272C280 252 252 240 228 236C206 232 186 222 172 200C176 238 186 262 204 276C190 286 188 302 196 316C214 320 242 316 264 308C282 302 294 294 300 292C306 294 318 302 336 308C358 316 386 320 404 316C412 302 410 286 396 276C414 262 424 238 428 200C414 222 394 232 372 236C348 240 320 252 300 272Z';
    const holes = 'M226 294Q252 274 278 292Q252 308 226 294ZM374 294Q348 274 322 292Q348 308 374 294Z';
    let snow = '';
    [[90, 120, 6], [140, 300, 4], [510, 160, 5], [470, 330, 7], [70, 470, 5], [540, 500, 4]].forEach(([x, y, r]) => { snow += C(x, y, r, '#fff', op(0.8)); });
    return [
      bgDefs(['#f6f9ff', '#c6d4ee', '#5e6f9e']) + skinDefs(k) + hairG('hr', ['#fffbe8', '#f0d9a0', '#c4a35e']) +
      iris('ir', ['#d6ecff', '#7aa6d8', '#2a4a7a']) + lg('fr', [[0, '#ffffff'], [1, '#dde3ef']]) + lg('mk', [[0, '#3a3040'], [0.5, '#141018'], [1, '#2a1a24']], 0, 0, 1, 0),
      bgBody('#fff', snow),
      neck(k, 26) +
      P(TORSO, '#1c1a24') +
      fur('url(#fr)', '#b8c0d4', 110, 490, 490, 418, 52, 13, 13) +
      head(k, { face: 'f', blush: 0.35 }) +
      eyes({ lash: '#1a1418', lid: 0.3 }) +
      nose(k) +
      // red lips
      P('M278 364Q290 354 300 360Q310 354 322 364Q310 378 300 378Q290 378 278 364Z', '#c4122a') + S('M282 365Q300 368 318 365', '#7a0a18', 2, 0.7) + E(304, 370, 7, 2.5, '#fff', op(0.35)) +
      // black butterfly mask
      P(mask + holes, 'url(#mk)', ' fill-rule="evenodd"') +
      S(mask, '#8a1a2a', 2.5, 0.8) + S('M300 272V290M244 252Q220 262 206 278M356 252Q380 262 394 278', '#5a3a4a', 2.5, 0.7) +
      fringeShade(fr, k, 12) +
      // swept-up pale blonde hair with a high bun
      P('M216 128C200 80 244 40 300 40C356 40 400 80 384 128Z', 'url(#hr)') +
      S('M240 100Q270 60 316 66Q352 74 360 104M262 110Q290 84 330 96', '#c4a35e', 4, 0.6) +
      P(fr, 'url(#hr)') +
      S('M226 210Q270 190 300 226M300 200Q346 196 374 262', '#c4a35e', 3, 0.55) +
      P('M202 258C184 290 196 318 186 346C180 364 194 376 206 366C196 358 198 346 206 330C216 304 208 280 214 258Z', 'url(#hr)') +
      shine('#fff', 150, 226, 376, 0.6) +
      G('translate(372 112)', P('M0-14L10 0L0 14L-10 0Z', '#b0182a') + C(0, 0, 4, '#ffd6dc')),
    ];
  });

  // Scaramouche
  avatar('av_scara', 'Scaramouche', ['scara', 'fatui', 'harbinger'], () => {
    const k = SKIN.pale;
    const fr = cap([[194, 252], [204, 352], [218, 236], [236, 288], [252, 212], [272, 270], [290, 204], [308, 272], [326, 206], [346, 274], [364, 216], [384, 292], [396, 236], [404, 352], [410, 252]], { top: 112, sw: -4 });
    return [
      bgDefs(['#ece2ff', '#8e70d8', '#2a1a62']) + skinDefs(k) + hairG('hr', ['#5c5eaa', '#30316a', '#17173a']) +
      iris('ir', ['#b49cf8', '#5e44b6', '#22144e']) +
      lg('hb', [[0, '#5a4690'], [1, '#2a1f4c']]) + lg('hc', [[0, '#4e3c82'], [1, '#231a42']], 0, 0, 1, 1) + lg('kn', [[0, '#2a2844'], [1, '#14121f']]),
      bgBody('#e6dcff', S('M470 40L440 120L476 130L430 230', '#e6dcff', 5, 0.4) + S('M110 360L86 420L114 426L80 500', '#e6dcff', 4, 0.3)),
      // translucent veil behind
      P('M84 176C78 300 70 420 60 540H190C196 420 204 300 214 196Z', '#c9b6f0', op(0.32)) +
      P('M516 176C522 300 530 420 540 540H410C404 420 396 300 386 196Z', '#c9b6f0', op(0.32)) +
      P(backHair(372, 188, 412, 126), 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#kn)') +
      P('M246 432L300 520L354 432L370 440L300 552L230 440Z', '#f2eef8') + P('M262 434L300 500L338 434Z', '#2a2844') +
      S('M232 444L300 548L368 444', '#8a6ad8', 3, 0.8) +
      head(k, { face: 'm', blush: 0.2 }) +
      eyes({ lash: '#1a1430', lid: 0.42, liner: '#e0303a' }) +
      brows('#2a2a5a', { w: 6, ar: 3, li: -3 }) +
      nose(k) + smirk('#9a4a5a', 364) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      // wide-brimmed hat
      `<g clip-path="url(#fc)">${E(300, 226, 130, 30, '#1a1430', op(0.25))}</g>` +
      P('M70 184C74 156 172 136 300 136C428 136 526 156 530 184C526 210 428 226 300 226C172 226 74 210 70 184Z', 'url(#hb)') +
      S('M84 190C120 208 200 218 300 218C400 218 480 208 516 190', '#8a72c8', 4, 0.6) +
      P('M212 174C214 98 250 58 300 56C350 58 386 98 388 174Z', 'url(#hc)') +
      P('M212 156Q300 176 388 156L388 176Q300 196 212 176Z', '#1a1430') +
      S('M240 92Q270 70 300 70', '#8a72c8', 5, 0.5) +
      G('translate(300 168)', C(0, 0, 11, '#e8c66a') + S('M-6 6L-10 40M6 6L10 40M0 8V44', '#f2eef8', 3, 0.9)),
    ];
  });

  // Il Dottore
  avatar('av_dottore', 'Il Dottore', ['dottore', 'fatui', 'harbinger'], () => {
    const k = SKIN.pale;
    const fr = cap([[188, 252], [198, 330], [214, 230], [236, 274], [254, 206], [278, 254], [300, 198], [322, 254], [346, 206], [366, 274], [386, 230], [402, 330], [412, 252]], {
      sw: 6, crown: 'C426 200 426 160 410 136L428 126Q408 118 396 106L402 86Q376 96 356 92L356 72Q332 86 312 88L300 70Q288 88 270 90L254 76Q248 96 234 104Q206 112 196 128L176 126Q188 150 186 176Q180 214 188 252',
    });
    let hx = '';
    [[90, 150], [130, 220], [480, 120], [520, 200], [480, 420], [90, 420]].forEach(([x, y]) => { hx += P(`M${x} ${y - 24}l21 12v24l-21 12l-21-12v-24z`, 'none', ' stroke="#fff" stroke-width="3" opacity=".25"'); });
    return [
      bgDefs(['#e4f6ef', '#88c8b4', '#245a56']) + skinDefs(k) + hairG('hr', ['#8ab6ea', '#4a72b8', '#1e3870']) +
      lg('mk', [[0, '#5a6274'], [0.5, '#2c3240'], [1, '#14171e']], 0, 0, 1, 1) + rg('rd', [[0, '#ffd0c0'], [0.35, '#ff3b3b'], [1, '#5a0a10']]) +
      lg('ct', [[0, '#2c3446'], [1, '#14181f']]) + lg('fr', [[0, '#f4f6fa'], [1, '#c4cad8']]),
      bgBody('#fff', hx),
      P('M180 300C164 220 190 120 300 112C410 120 436 220 420 300L410 370L396 340L384 376L372 330H228L216 376L204 340L190 370Z', 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#ct)') +
      P('M268 436L300 480L332 436Z', '#e8eaf0') +
      fur('url(#fr)', '#9aa2b4', 120, 480, 492, 424, 44) +
      head(k, { face: 'm', blush: 0 }) +
      grin({ y: 384, w: 38, d: 14, c: '#4a1a22' }) + S('M262 386Q256 380 252 372M338 386Q344 380 348 372', '#7a4a52', 3, 0.7) +
      // beaked mask over the upper face
      P('M196 228Q300 196 404 228L408 300Q372 318 336 314L300 370L264 314Q228 318 192 300Z', 'url(#mk)') +
      S('M300 206V368', '#8a94a8', 3, 0.5) + S('M200 232Q300 202 400 232', '#8a94a8', 3, 0.5) +
      E(252, 280, 24, 13, 'url(#rd)') + E(348, 280, 24, 13, 'url(#rd)') + C(254, 280, 4, '#fff') + C(350, 280, 4, '#fff') +
      C(214, 260, 4, '#8a94a8') + C(386, 260, 4, '#8a94a8') +
      P(fr, 'url(#hr)') +
      shine('#cfe4ff', 142, 226, 376, 0.5),
    ];
  });

  // Pulcinella
  avatar('av_pulci', 'Pulcinella', ['pulci', 'fatui', 'harbinger'], () => {
    const k = SKIN.old;
    const side = 'M210 330C190 328 174 310 178 288C168 274 170 254 180 242C176 224 188 206 202 200C208 192 218 188 228 190C216 210 216 236 222 258C214 278 212 302 210 330Z';
    return [
      bgDefs(['#fff6e6', '#e8c896', '#94703e']) + skinDefs(k) + hairG('hr', ['#ffffff', '#e2e4ec', '#a4a8b8']) +
      lg('wh', [[0, '#ffffff'], [1, '#d4d6e0']]) + lg('ct', [[0, '#5e2c3a'], [1, '#2c121c']]) + lg('fr', [[0, '#d6d2da'], [1, '#9a96a2']]) + rg('gd', [[0, '#fff2b0'], [0.5, '#e2b440'], [1, '#8a6414']], 0.35, 0.3, 0.7),
      bgBody('#fff'),
      neck(k, 32) +
      P(TORSO, 'url(#ct)') +
      fur('url(#fr)', '#6e6a76', 120, 480, 488, 420, 44) +
      head(k, { face: 'o', blush: 0.9 }) +
      eyes({ shut: true, lash: '#5a3a30' }, 296) +
      S('M208 290l-12-6M208 300l-12 2M392 290l12-6M392 300l12 2M246 318Q256 326 266 320M334 320Q344 326 354 318', k[3], 3, 0.65) +
      brows('#f4f4f8', { w: 13, ar: 2, li: 4 }) + brows('#c4c6d2', { w: 4, ar: 2, li: 2 }) +
      nose(k, 2) +
      S('M276 374Q300 388 324 374', '#8a4a40', 5) +
      P('M262 380Q300 400 338 380Q334 420 300 430Q266 420 262 380Z', 'url(#wh)') +
      P('M240 352C256 330 284 332 300 342C316 332 344 330 360 352C376 350 388 340 392 326C392 360 366 380 336 370Q316 362 300 366Q284 362 264 370C234 380 208 360 208 326C212 340 224 350 240 352Z', 'url(#wh)') +
      E(282, 172, 50, 20, '#fff', op(0.35)) + S('M236 176Q270 156 300 156Q330 156 364 176', '#eceef4', 4, 0.8) +
      P(side, 'url(#hr)') + P(side, 'url(#hr)', tf('matrix(-1 0 0 1 600 0)')) +
      S('M196 240Q200 270 208 300M404 240Q400 270 392 300', '#a4a8b8', 3, 0.6) +
      S('M190 474Q300 520 410 474', '#e2b440', 5) + S('M190 474Q300 520 410 474', '#8a6414', 2, 0.6, ' stroke-dasharray="4 6"') +
      // gloved hand on a gold-knobbed cane
      `<rect x="432" y="470" width="14" height="70" fill="#2a1a12"/>` +
      C(439, 462, 22, 'url(#gd)') +
      P('M412 486Q412 462 440 462Q468 464 470 486Q466 506 440 508Q414 506 412 486Z', '#1e1a22') + S('M420 482H462M422 494H460', '#3e3844', 3, 0.8),
    ];
  });

  // Pantalone
  avatar('av_pantalone', 'Pantalone', ['pantalone', 'fatui', 'harbinger'], () => {
    const k = SKIN.fair;
    const fr = cap([[188, 252], [200, 384], [214, 236], [250, 210], [300, 168], [350, 210], [386, 236], [400, 384], [412, 252]], { top: 108, k: 0.66 });
    let coins = '';
    [[90, 140, 26], [510, 110, 18], [530, 330, 30], [70, 400, 16], [480, 500, 20]].forEach(([x, y, r]) => { coins += C(x, y, r, '#fff6d6', op(0.35)) + C(x, y, r * 0.7, 'none', ` stroke="#fff" stroke-width="3" opacity=".45"`); });
    return [
      bgDefs(['#fff8e2', '#ecd391', '#9c782a']) + skinDefs(k) + hairG('hr', ['#4a4452', '#221e28', '#0c0a10']) +
      lg('ct', [[0, '#2a2832'], [1, '#121016']]) + lg('gd', [[0, '#f6d78c'], [1, '#b8862e']]),
      bgBody('#fff', coins),
      P('M186 300C170 220 196 126 300 120C404 126 430 220 414 300C410 360 400 410 384 446H216C200 410 190 360 186 300Z', 'url(#hr)') +
      neck(k, 30) +
      P(TORSO, 'url(#ct)') +
      P('M262 432L300 470L338 432L346 452L300 494L254 452Z', '#f6f4f0') +
      S('M226 446L290 540M374 446L310 540', 'url(#gd)', 4) +
      G('translate(300 504)', P('M0-14L12 0L0 14L-12 0Z', 'url(#gd)') + P('M0-8L6 0L0 8L-6 0Z', '#2e9a6a')) +
      head(k, { face: 'm', blush: 0.3 }) +
      eyes({ shut: true, lash: '#1a1418' }, 296) +
      brows('#1e1a22', { w: 6, ar: 6, li: 2 }) +
      nose(k) + smile(20, 8, '#a8505a', 360, 5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') + P(lock(286, 176, 262, 330, 16, -16), 'url(#hr)') +
      shine('#7a7088', 146, 226, 376, 0.55) +
      // round gold glasses
      C(252, 294, 34, '#fff', op(0.12) + ' stroke="#d9b45a" stroke-width="4"') + C(348, 294, 34, '#fff', op(0.12) + ' stroke="#d9b45a" stroke-width="4"') +
      S('M286 290Q300 282 314 290M218 288L196 280M382 288L404 280', '#d9b45a', 4) +
      S('M234 274L246 268M330 274L342 268', '#fff', 4, 0.8) +
      C(200, 338, 6, 'url(#gd)') + C(400, 338, 6, 'url(#gd)'),
    ];
  });

  // Arlecchino
  avatar('av_arle', 'Arlecchino', ['arle', 'fatui', 'harbinger'], () => {
    const k = SKIN.pale;
    const fr = cap([[190, 252], [200, 350], [214, 236], [232, 292], [248, 208], [270, 276], [284, 198], [310, 270], [322, 200], [350, 276], [364, 214], [384, 290], [396, 236], [402, 350], [412, 252]], { top: 108, sw: 10 });
    return [
      bgDefs(['#fbe8ea', '#d98a94', '#5e1a26']) + skinDefs(k) + hairG('hr', ['#ffffff', '#e4e2ea', '#a6a3b4']) +
      iris('ir', ['#f6eef2', '#c8b4c0', '#6a5662']) + lg('st', [[0, '#26242c'], [1, '#0e0d12']]),
      bgBody('#fff'),
      P('M186 300C170 220 196 128 300 120C404 128 430 220 414 300L408 400L392 380L380 404H220L208 380L192 400Z', '#18161c') +
      neck(k, 28) +
      P(TORSO, 'url(#st)') +
      P('M262 436L300 530L338 436Z', '#f4f4f6') +
      P('M292 446H308L314 524L300 538L286 524Z', '#16141a') + P('M290 440h20l-4 10h-12z', '#2a2830') +
      S('M262 436L232 452L282 560M338 436L368 452L318 560', '#3a3842', 4, 0.8) +
      head(k, { face: 'f', blush: 0.2 }) +
      eyes({ lash: '#16141a', lid: 0.3, pup: 'x', pc: '#0e0c10' }) +
      brows('#2a2830', { w: 6, ar: 3, li: -2 }) +
      nose(k) + smile(12, 3, '#9a4a56', 364, 4.5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      P(lock(272, 204, 290, 280, 22, 8), '#18161c') + P(lock(358, 214, 372, 286, 18, 8), '#18161c') + P(lock(206, 250, 202, 348, 18, -4), '#18161c') +
      shine('#fff', 146, 226, 376, 0.8),
    ];
  });

  // Xiangling, with Guoba
  avatar('av_xl', 'Xiangling', ['xl', 'xiangling'], () => {
    const k = SKIN.fair;
    const fr = cap([[190, 252], [200, 330], [214, 236], [232, 280], [250, 214], [272, 268], [290, 206], [310, 266], [330, 208], [350, 268], [368, 218], [386, 282], [396, 236], [402, 330], [412, 252]], { top: 112, sw: 4 });
    const bun = (x) => C(x, 118, 46, 'url(#hr)') + S(`M${x - 30} 100Q${x} 84 ${x + 30} 100`, '#5a6ab0', 4, 0.6) + S(`M${x - 42} 140Q${x} 166 ${x + 42} 140`, '#e8b23a', 7);
    return [
      bgDefs(['#fff3dc', '#ffc070', '#de5a2a']) + skinDefs(k) + hairG('hr', ['#4e5ea6', '#28326a', '#141a3a']) +
      iris('ir', ['#ffe08a', '#f0a828', '#8a4c10']) +
      lg('tp', [[0, '#f0682c'], [1, '#b8341c']]) + rg('gb', [[0, '#f27a3c'], [0.7, '#d84a22'], [1, '#a8301a']], 0.4, 0.35, 0.7),
      bgBody('#fff', S('M90 420Q70 390 90 360Q110 330 90 300M510 200Q490 170 510 140Q530 110 510 80', '#fff', 6, 0.35) +
        G('translate(480 330) rotate(30)', P('M0-22Q14-20 10 10Q4 30-6 34Q0 10-6-14Z', '#e2302a') + P('M-4-24q4-10 12-8', '#3a8a3a', ' stroke="#3a8a3a" stroke-width="4"'))),
      bun(214) + bun(386) +
      P(backHair(368, 188, 412, 124), 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#tp)') +
      P('M262 436Q300 482 338 436L348 446Q300 500 252 446Z', '#fff4e0') + S('M120 520Q150 490 190 476', '#8a2414', 4, 0.5) +
      head(k, { face: 'f', blush: 0.9 }) +
      eyes({ lash: '#1e1a2e', k: 1.04 }) +
      brows('#28326a', { w: 6, ar: 9, li: 3 }) +
      nose(k) + grin({ y: 352, w: 30, d: 30 }) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#8a9ad8', 148, 226, 376, 0.5) +
      // Guoba peeking over her shoulder
      C(408, 410, 18, '#c8401c') + C(500, 410, 18, '#c8401c') + C(408, 410, 9, '#6a1a0e') + C(500, 410, 9, '#6a1a0e') +
      E(454, 462, 58, 52, 'url(#gb)') +
      E(436, 452, 13, 11, '#fff2dc') + E(472, 452, 13, 11, '#fff2dc') + C(438, 454, 6, '#1a0c08') + C(470, 454, 6, '#1a0c08') +
      C(436, 451, 2, '#fff') + C(468, 451, 2, '#fff') +
      E(454, 476, 18, 12, '#fff2dc') + E(454, 470, 6, 4, '#2a0e06') + S('M446 482Q454 488 462 482', '#6a1a0e', 2.5) +
      C(424, 432, 4, '#ffd0a0') + C(484, 432, 4, '#ffd0a0'),
    ];
  });

  // Beidou
  avatar('av_beidou', 'Beidou', ['beidou'], () => {
    const k = SKIN.warm;
    const fr = cap([[188, 252], [198, 360], [212, 236], [236, 292], [250, 206], [278, 276], [292, 196], [326, 268], [336, 200], [370, 278], [380, 222], [400, 350], [412, 252]], { top: 104, sw: 10 });
    return [
      bgDefs(['#e4f2f4', '#7fb0c0', '#1e4a58']) + skinDefs(k) + hairG('hr', ['#4e3a3e', '#2a1c20', '#120a0c']) +
      iris('ir', ['#ff8a70', '#d0302a', '#701410']) +
      lg('ct', [[0, '#2a2226'], [1, '#100c0e']]) + lg('gd', [[0, '#f6d78c'], [1, '#b8862e']]),
      bgBody('#fff', S('M0 480Q60 450 120 480T240 480T360 480T480 480T600 480', '#fff', 7, 0.25) + S('M0 530Q60 500 120 530T240 530T360 530T480 530T600 530', '#fff', 7, 0.18)),
      P('M180 300C164 220 194 120 300 112C406 120 436 220 420 300C428 380 438 460 444 540H156C162 460 172 380 180 300Z', 'url(#hr)') +
      neck(k, 30) +
      P(TORSO, 'url(#ct)') +
      P('M240 436L300 520L360 436Z', '#c8323c') +
      S('M240 436L196 452L260 560M360 436L404 452L340 560', 'url(#gd)', 4) +
      P('M196 452L170 470L232 560H260Z', '#a8202a', op(0.9)) + P('M404 452L430 470L368 560H340Z', '#a8202a', op(0.9)) +
      head(k, { face: 'f', blush: 0.4 }) +
      eye(348, 294, 1, { lash: '#1e1214' }) +
      brows('#2a1c20', { w: 7, ar: 6, li: -3, r: { lo: 6 } }) +
      nose(k) + grin({ y: 352, w: 30, d: 24, tilt: 6 }) +
      // eyepatch over her right eye
      S('M220 278L176 230M282 276L346 186', '#141014', 6) +
      P('M218 280Q252 260 286 280Q292 312 252 324Q214 314 218 280Z', '#141014') + S('M226 284Q252 270 278 284', '#4a3a40', 3, 0.7) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#8a7078', 144, 226, 376, 0.45) +
      // gold hair ornament with a red tassel
      G('translate(402 186)', C(0, 0, 18, 'url(#gd)') + C(0, 0, 8, '#c8323c') + P('M-4 16h8l6 70h-20z', '#c8323c') + S('M-30-24L28 22', 'url(#gd)', 6)),
    ];
  });

  // Yelan
  avatar('av_yelan', 'Yelan', ['yelan'], () => {
    const k = SKIN.fair;
    const fr = cap([[188, 252], [196, 372], [212, 238], [234, 286], [250, 212], [274, 272], [290, 202], [318, 266], [332, 206], [362, 274], [376, 224], [396, 330], [410, 252]], { top: 108, sw: 8 });
    return [
      bgDefs(['#dcf4f2', '#5ab0b8', '#143650']) + skinDefs(k) + hairG('hr', ['#4e5ea0', '#24305e', '#10162e']) +
      iris('ir', ['#9cffd0', '#2fb87a', '#0e5a3a']) + lg('fr', [[0, '#ffffff'], [1, '#d4dae6']]) + lg('jk', [[0, '#f6f8fc'], [1, '#c4ccda']]),
      bgBody('#fff', S('M60 200Q100 180 140 200M460 150Q500 130 540 150', '#fff', 4, 0.3)),
      P('M184 300C170 220 196 126 300 120C404 126 430 220 416 300L410 340L196 384Z', 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#jk)') +
      P('M262 436L300 500L338 436Z', '#1e2440') +
      fur('url(#fr)', '#b0b8c8', 130, 470, 490, 424, 42) +
      head(k, { face: 'f', blush: 0.4 }) +
      eyes({ lash: '#10162e', lid: 0.3 }) +
      brows('#1e2850', { w: 6, ar: 5, r: { lo: 6, ar: 8 } }) +
      nose(k) + smirk('#a8465a', 362) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#8a9ad8', 146, 226, 376, 0.5) +
      die(462, 470, 1.15, -12) + die(410, 500, 0.9, 18),
    ];
  });

  // Ningguang
  avatar('av_ning', 'Ningguang', ['ning', 'ningguang'], () => {
    const k = SKIN.pale;
    const fr = cap([[188, 252], [200, 404], [214, 236], [240, 286], [256, 210], [290, 262], [300, 180], [310, 262], [344, 210], [360, 286], [386, 236], [400, 404], [412, 252]], { top: 106 });
    const pin = (x, s) => G(`translate(${x} 156)`, S(`M${-s * 30}-30L${s * 26} 26`, 'url(#gd)', 5) + C(0, 0, 16, 'url(#gd)') + C(0, 0, 8, '#2fae7a') +
      S('M-6 14V96M0 16V110M6 14V96', '#d9a74a', 2.5) + C(-6, 100, 4, '#2fae7a') + C(0, 114, 5, '#2fae7a') + C(6, 100, 4, '#2fae7a'));
    return [
      bgDefs(['#edfaf1', '#8ed0a8', '#24705a']) + skinDefs(k) + hairG('hr', ['#ffffff', '#ece6da', '#b2a896']) +
      iris('ir', ['#ff8a80', '#d03440', '#6a0c18']) + lg('gd', [[0, '#f8dd94'], [1, '#b8862e']]) + lg('dr', [[0, '#3a3036'], [1, '#18141a']]),
      bgBody('#fff', star(110, 150, 12, '#fff6c8', 0.8) + star(500, 120, 9, '#fff6c8', 0.8) + star(480, 420, 14, '#fff6c8', 0.6)),
      P('M180 300C164 220 194 120 300 112C406 120 436 220 420 300C428 380 436 460 442 540H158C164 460 172 380 180 300Z', 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#dr)') +
      S('M200 470Q300 520 400 470', 'url(#gd)', 6) +
      P('M256 398Q300 414 344 398L354 456Q300 480 246 456Z', '#2a2228') + S('M256 400Q300 416 344 400M246 456Q300 480 354 456', 'url(#gd)', 4) +
      P('M300 466L316 488L300 510L284 488Z', '#2fae7a') + S('M300 466L316 488L300 510L284 488Z', 'url(#gd)', 3) +
      head(k, { face: 'f', blush: 0.35 }) +
      eyes({ lash: '#2a1418', lid: 0.4 }) +
      brows('#c8beb0', { w: 5, ar: 4 }) +
      nose(k) + smile(14, 4, '#b8323c', 362, 5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      shine('#fff', 148, 226, 376, 0.9) +
      pin(220, -1) + pin(380, 1),
    ];
  });

  // Yun Jin
  avatar('av_yunjin', 'Yun Jin', ['yunjin'], () => {
    const k = SKIN.fair;
    const fr = cap([[190, 252], [200, 340], [214, 236], [234, 280], [252, 214], [274, 266], [292, 206], [312, 266], [332, 210], [352, 268], [370, 220], [388, 282], [396, 238], [402, 340], [412, 252]], { top: 112, sw: 2 });
    const plume = (d) => S(d, '#f4e2c0', 12) + `<path d="${d}" fill="none" stroke="#8a4a24" stroke-width="12" stroke-dasharray="9 11"/>`;
    const tassel = (x) => S(`M${x} 210V318`, '#d9a74a', 2.5) + C(x, 250, 6, '#e2333f') + C(x, 290, 6, '#e2333f') + C(x, 326, 8, '#e2333f');
    return [
      bgDefs(['#fff0f2', '#f4a6b4', '#b03c58']) + skinDefs(k) + hairG('hr', ['#4e3e62', '#261c34', '#120c1a']) +
      iris('ir', ['#d2b0f0', '#8a5ac0', '#3a1a5a']) + lg('gd', [[0, '#f8dd94'], [1, '#b8862e']]) + lg('rb', [[0, '#e0404a'], [1, '#9a1e2c']]) +
      rg('pm', [[0, '#ff7a84'], [0.6, '#e2333f'], [1, '#9a1424']], 0.35, 0.3, 0.7),
      bgBody('#fff'),
      plume('M270 118C240 78 170 66 72 112') + plume('M330 118C360 78 430 66 528 112') +
      P(backHair(430), 'url(#hr)') +
      neck(k, 28) +
      P(TORSO, 'url(#rb)') +
      P('M250 436Q300 480 350 436L364 452Q300 506 236 452Z', 'url(#gd)') + P('M262 436Q300 470 338 436', '#fff4e6') +
      S('M110 530Q140 490 196 470M490 530Q460 490 404 470', '#f6d78c', 5, 0.7) +
      head(k, { face: 'f', blush: 0.7 }) +
      eyes({ lash: '#2a1430', liner: '#e04050' }) +
      brows('#261c34', { w: 6, ar: 6 }) +
      nose(k) + smile(15, 6, '#c8323c', 362, 5.5) +
      fringeShade(fr, k) +
      P(fr, 'url(#hr)') +
      // opera headdress: gold band, jewels, red pompoms, side tassels
      P('M188 214Q300 156 412 214L414 236Q300 180 186 236Z', 'url(#gd)') +
      C(300, 186, 12, '#3ab0b8') + C(244, 200, 7, '#3ab0b8') + C(356, 200, 7, '#3ab0b8') +
      C(232, 156, 16, 'url(#pm)') + C(368, 156, 16, 'url(#pm)') + C(264, 128, 20, 'url(#pm)') + C(336, 128, 20, 'url(#pm)') + C(300, 112, 24, 'url(#pm)') +
      G('translate(300 164)', P('M0-18L8-4L22 0L8 4L0 18L-8 4L-22 0L-8-4Z', 'url(#gd)') + C(0, 0, 6, '#3ab0b8')) +
      tassel(196) + tassel(404),
    ];
  });
})();
