/* Contact avatars (600×600). Stylized flat portraits that read inside 40–90 px circles. */
(function () {
  'use strict';
  const def = JC.art.def;

  // ---- tiny helpers ----------------------------------------------------------------------
  const stops = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lg = (id, s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rg = (id, s, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  const svg = (w, h, defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  const f = (n) => Math.round(n);
  // Characters are drawn a little larger than the canvas so faces read at 40 px.
  const zoom = (s) => `<g transform="matrix(1.1 0 0 1.1 -30 -34)">${s}</g>`;

  // Skin tones: [highlight, base, shade, deep]
  const SKIN = { young: ['#ffe8d8', '#f9d4bb', '#edb796', '#d9977a'], tan: ['#f7cfae', '#ebb48c', '#d6966c', '#b9774f'] };

  // Shared defs: skin, neck, blush, halo.
  const skinDefs = (k) =>
    lg('sk', [[0, k[0]], [0.55, k[1]], [1, k[2]]], 0.2, 0, 0.9, 1) +
    lg('nk', [[0, k[3]], [0.55, k[2]], [1, k[1]]]) +
    rg('bl', [[0, '#ff7e7e', 0.42], [1, '#ff7e7e', 0]]) +
    rg('halo', [[0, '#fff', 0.75], [0.6, '#fff', 0.18], [1, '#fff', 0]]);

  const FACE = 'M300 150C366 150 404 196 404 260C404 316 384 356 350 384C333 398 316 405 300 405C284 405 267 398 250 384C216 356 196 316 196 260C196 196 234 150 300 150Z';
  const FACE_M = 'M300 146C368 146 406 194 406 260C406 314 394 352 364 380C344 398 322 409 300 409C278 409 256 398 236 380C206 352 194 314 194 260C194 194 232 146 300 146Z';

  // Neck (drawn before the clothes), ears + face (after the clothes).
  const neck = (k, x0 = 260, x1 = 340) =>
    `<path d="M${x0} 330V478Q300 500 ${x1} 478V330Z" fill="url(#nk)"/>` +
    `<path d="M${x0} 392Q300 430 ${x1} 392V420Q300 452 ${x0} 420Z" fill="${k[3]}" opacity=".35"/>`;
  const ears = (k) =>
    `<path d="M202 258C182 246 164 262 168 288C172 314 188 326 206 320Z" fill="${k[1]}"/>` +
    `<path d="M398 258C418 246 436 262 432 288C428 314 412 326 394 320Z" fill="${k[2]}"/>` +
    `<path d="M190 272C182 280 184 298 194 304" fill="none" stroke="${k[3]}" stroke-width="5" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M410 272C418 280 416 298 406 304" fill="none" stroke="${k[3]}" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
  const face = (k, shape, blush = 1) =>
    `<path d="${shape || FACE}" fill="url(#sk)"/>` +
    `<path d="M404 262C404 316 384 356 350 384C333 398 316 405 300 405C340 380 372 330 380 262Z" fill="${k[2]}" opacity=".45"/>` +
    `<g opacity="${blush}"><ellipse cx="236" cy="328" rx="32" ry="17" fill="url(#bl)"/><ellipse cx="364" cy="328" rx="32" ry="17" fill="url(#bl)"/></g>`;
  const nose = (k) => `<path d="M302 296Q294 318 304 326" fill="none" stroke="${k[3]}" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;

  // Eyes
  const INK = '#2b1d22';
  const eyeOpen = (cx, cy, c = INK, lid = 0) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="13.5" ry="17" fill="${c}"/>` +
    `<circle cx="${cx + 4.5}" cy="${cy - 6}" r="5.2" fill="#fff"/><circle cx="${cx - 4}" cy="${cy + 7}" r="2.2" fill="#fff" opacity=".8"/>` +
    `<path d="M${cx - 22} ${cy - 4 + lid}Q${cx} ${cy - 25 + lid * 1.4} ${cx + 22} ${cy - 6 + lid}" fill="none" stroke="${c}" stroke-width="6.5" stroke-linecap="round"/>`;
  const eyeHappy = (cx, cy, c = INK, w = 19) => `<path d="M${cx - w} ${cy + 5}Q${cx} ${cy - 18} ${cx + w} ${cy + 5}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;
  const eyeSmile = (cx, cy, c = INK) =>
    `<path d="M${cx - 19} ${cy + 3}Q${cx} ${cy - 21} ${cx + 19} ${cy + 3}Q${cx} ${cy - 5} ${cx - 19} ${cy + 3}Z" fill="${c}" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`;
  const brow = (d, c, w = 9) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

  // Bokeh dots for backgrounds
  const bokeh = (pts, c) => pts.map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}"/>`).join('');
  const BOKEH = [[90, 130, 22, 0.4], [516, 104, 15, 0.5], [530, 300, 30, 0.22], [64, 316, 11, 0.45]];

  // Fluffy edge along an ellipse arc (angles in degrees, 0 = right, 90 = down)
  function fluff(cx, cy, rx, ry, a0, a1, n, amp, cmd) {
    const P = (a, r) => [cx + (rx + r) * Math.cos((a * Math.PI) / 180), cy + (ry + r) * Math.sin((a * Math.PI) / 180)];
    const st = (a1 - a0) / n;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = a0 + st * i;
      const [x, y] = P(a, 0);
      if (i === 0) {
        d += (cmd || 'M') + f(x) + ' ' + f(y);
        continue;
      }
      const [c1x, c1y] = P(a - st * 0.85, amp * 0.5);
      const [tx, ty] = P(a - st * 0.3, amp);
      const [c2x, c2y] = P(a - st * 0.1, amp * 0.3);
      d += `Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)}Q${f(c2x)} ${f(c2y)} ${f(x)} ${f(y)}`;
    }
    return d;
  }

  // ---- Jin Ling ---------------------------------------------------------------------------
  def('av_jl', {
    title: 'Jin Ling',
    w: 600, h: 600, tags: ['avatar', 'jl'],
    svg: (w, h) => {
      const k = SKIN.young;
      const HAIR = '#22171a';
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#fff7da'], [0.5, '#ffd866'], [1, '#e99a10']], 0.5, 0.36, 0.78) +
        lg('hr', [[0, '#4b3127'], [0.45, '#2a1c1b'], [1, '#160f10']], 0, 0, 1, 1) +
        lg('jk', [[0, '#ffd257'], [0.6, '#f4b222'], [1, '#d88a06']]) +
        lg('jkS', [[0, '#c77b05', 0], [1, '#a86200', 0.55]], 0, 0, 1, 0),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        bokeh([[86, 140, 26, 0.35], [520, 110, 18, 0.4], [540, 300, 34, 0.22], [70, 330, 14, 0.4], [470, 190, 8, 0.6]], '#fff') +
        zoom(
          // back hair: short sides, volume on top
          `<path d="M192 270C176 190 214 106 300 100C392 96 434 176 412 270C406 244 398 226 386 214H214C204 228 196 246 192 270Z" fill="url(#hr)"/>` +
          neck(k, 262, 338) +
          // jacket
          `<path d="M36 600C46 520 112 476 210 460L262 452L300 520L338 452L390 460C488 476 554 520 564 600Z" fill="url(#jk)"/>` +
          `<path d="M564 600C554 520 488 476 390 460L420 470C470 500 500 548 504 600Z" fill="url(#jkS)"/>` +
          `<path d="M262 452L300 560L338 452L322 448L300 500L278 448Z" fill="#fffaf0"/>` +
          `<path d="M262 452L228 470L282 600H300Z" fill="#e8a010" opacity=".55"/>` +
          `<path d="M338 452L372 470L318 600H300Z" fill="#c98204" opacity=".45"/>` +
          `<path d="M300 520V600" stroke="#b97200" stroke-width="4" opacity=".6"/>` +
          `<path d="M118 540C130 520 146 508 160 502M482 540C470 520 454 508 440 502" fill="none" stroke="#b97200" stroke-width="5" stroke-linecap="round" opacity=".45"/>` +
          // peony pin
          `<g transform="translate(412 530)"><circle r="22" fill="#f7a8bf"/><circle cx="-8" cy="-6" r="13" fill="#fbc7d6"/><circle cx="9" cy="-4" r="12" fill="#f590ad"/><circle cx="0" cy="8" r="12" fill="#f8b6c8"/><circle r="7" fill="#f2b51d"/></g>` +
          ears(k) + face(k, FACE, 0.7) +
          `<circle cx="422" cy="306" r="6" fill="#f7c52e" stroke="#b97a00" stroke-width="2"/>` +
          // fringe shadow + swept fringe with a little quiff
          `<path d="M200 252C196 170 244 124 302 122C372 122 414 176 402 262C394 240 382 224 368 214C372 234 368 248 360 258C352 234 338 218 318 208C320 222 318 232 312 240C300 222 282 212 262 210C266 222 262 232 256 238C250 222 236 214 222 220C210 228 204 240 200 252Z" fill="${k[3]}" opacity=".35" transform="translate(4 10)"/>` +
          `<path d="M196 250C186 172 226 116 290 108C312 82 352 74 388 86C372 92 362 100 358 110C400 128 422 178 406 260C398 238 386 222 372 212C376 232 372 246 364 256C356 232 340 216 320 206C322 220 320 230 314 238C302 220 284 210 264 208C268 220 264 230 258 236C252 220 238 212 224 218C212 226 202 238 196 250Z" fill="url(#hr)"/>` +
          `<path d="M240 146C270 124 316 118 352 130M300 98C320 86 344 82 366 86" fill="none" stroke="#7a5642" stroke-width="7" stroke-linecap="round" opacity=".55"/>` +
          // cinnabar mark
          `<circle cx="300" cy="234" r="7.5" fill="#e0242f"/><circle cx="298" cy="232" r="2.4" fill="#ff8a8a"/>` +
          // proud brows + eyes, smirk
          brow('M230 242Q254 236 280 248', HAIR, 10) + brow('M320 248Q346 236 370 242', HAIR, 10) +
          eyeOpen(256, 284, INK, 5) + eyeOpen(344, 284, INK, 5) +
          nose(k) +
          `<path d="M280 354Q304 364 326 346" fill="none" stroke="#b5505a" stroke-width="7" stroke-linecap="round"/>`
        )
      );
    },
  });

  // ---- Fairy ------------------------------------------------------------------------------
  def('av_fairy', {
    title: 'Fairy',
    w: 600, h: 600, tags: ['avatar', 'dog', 'fairy'],
    svg: (w, h) => {
      const FUR = 'url(#fur)';
      return svg(w, h,
        rg('bg', [[0, '#f8f0ff'], [0.55, '#d6c1fb'], [1, '#9d7ee6']], 0.5, 0.35, 0.8) +
        rg('halo', [[0, '#fff', 0.8], [0.6, '#fff', 0.2], [1, '#fff', 0]]) +
        lg('fur', [[0, '#3a3b4f'], [0.45, '#1e1e29'], [1, '#121219']], 0.2, 0, 0.8, 1) +
        lg('ruff', [[0, '#2a2b3a'], [1, '#101016']]) +
        rg('sheen', [[0, '#9a9fc6', 0.6], [1, '#9a9fc6', 0]]) +
        lg('muz', [[0, '#40414f'], [1, '#262632']]) +
        lg('gold', [[0, '#ffd45a'], [1, '#d48a06']]) +
        rg('iris', [[0, '#d39448'], [0.7, '#8a5520'], [1, '#4a2a0e']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="260" r="260" fill="url(#halo)"/>` +
        bokeh([[90, 120, 22, 0.4], [510, 90, 14, 0.5], [530, 260, 30, 0.25], [60, 300, 10, 0.5]], '#fff') +
        zoom(
          // chest ruff
          `<path d="M30 640${fluff(300, 590, 262, 200, 180, 360, 24, 20, 'L')}L570 640Z" fill="url(#ruff)"/>` +
          `<path d="M120 470Q150 452 176 450M424 450Q450 452 480 470M200 520Q230 508 252 508M348 508Q370 508 400 520" fill="none" stroke="#4a4e68" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
          // ears
          `<path d="M166 238C154 182 160 120 184 84C220 104 256 142 268 180Z" fill="${FUR}"/>` +
          `<path d="M434 238C446 182 440 120 416 84C380 104 344 142 332 180Z" fill="${FUR}"/>` +
          `<path d="M190 198C186 162 190 132 200 114C224 134 240 156 248 180Z" fill="#4b3a48"/>` +
          `<path d="M410 198C414 162 410 132 400 114C376 134 360 156 352 180Z" fill="#3f303c"/>` +
          // head with fluffy cheeks
          `<path d="${fluff(300, 280, 150, 130, 185, -5, 14, 22)}C452 196 392 146 300 146C208 146 148 196 151 269Z" fill="${FUR}"/>` +
          `<ellipse cx="284" cy="196" rx="92" ry="44" fill="url(#sheen)"/>` +
          `<path d="M178 296C190 330 214 356 244 372M422 296C410 330 386 356 356 372" fill="none" stroke="#4d5170" stroke-width="6" stroke-linecap="round" opacity=".6"/>` +
          `<path d="M226 222C242 212 260 212 272 218M374 222C358 212 340 212 328 218" fill="none" stroke="#7d82a6" stroke-width="7" stroke-linecap="round" opacity=".75"/>` +
          // collar + tag
          `<path d="M150 442Q300 518 450 442L458 472Q300 554 142 472Z" fill="url(#gold)"/>` +
          `<path d="M150 448Q300 522 450 448" fill="none" stroke="#fff3c0" stroke-width="3" opacity=".7"/>` +
          `<circle cx="300" cy="502" r="9" fill="none" stroke="#c9c9d4" stroke-width="5"/>` +
          `<circle cx="300" cy="532" r="25" fill="#f4f4f8"/><circle cx="300" cy="532" r="17" fill="#e4e4ec"/><circle cx="294" cy="525" r="6" fill="#fff"/>` +
          // muzzle
          `<ellipse cx="300" cy="338" rx="80" ry="58" fill="url(#muz)"/>` +
          `<ellipse cx="300" cy="312" rx="50" ry="22" fill="#5a5d78" opacity=".35"/>` +
          // mouth + tongue
          `<path d="M258 354Q300 392 342 354Q332 384 300 388Q268 384 258 354Z" fill="#3b0e1c"/>` +
          `<path d="M280 366Q300 360 320 366L321 404C321 424 279 424 279 404Z" fill="#ff7f9c"/>` +
          `<path d="M300 370V408" stroke="#e05a7a" stroke-width="4" stroke-linecap="round"/>` +
          `<path d="M300 326V350M300 350Q280 370 256 352M300 350Q320 370 344 352" fill="none" stroke="#0b0b10" stroke-width="6" stroke-linecap="round"/>` +
          // nose
          `<path d="M268 304C268 288 332 288 332 304C332 322 314 334 300 334C286 334 268 322 268 304Z" fill="#0b0b10"/>` +
          `<ellipse cx="290" cy="298" rx="12" ry="6" fill="#7c809e"/>` +
          // eyes
          `<circle cx="244" cy="262" r="22" fill="url(#iris)"/><circle cx="246" cy="264" r="13" fill="#0c0806"/><circle cx="252" cy="255" r="7" fill="#fff"/><circle cx="238" cy="271" r="3" fill="#fff" opacity=".8"/>` +
          `<circle cx="356" cy="262" r="22" fill="url(#iris)"/><circle cx="358" cy="264" r="13" fill="#0c0806"/><circle cx="364" cy="255" r="7" fill="#fff"/><circle cx="350" cy="271" r="3" fill="#fff" opacity=".8"/>`
        )
      );
    },
  });

  // ---- Lan Xichen -------------------------------------------------------------------------
  def('av_lxc', {
    title: 'Lan Xichen',
    w: 600, h: 600, tags: ['avatar', 'lxc'],
    svg: (w, h) => {
      const k = SKIN.young;
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#ffffff'], [0.5, '#dcebfb'], [1, '#8fb6e2']], 0.5, 0.35, 0.8) +
        lg('hr', [[0, '#3c4258'], [0.4, '#1f1f2c'], [1, '#14141c']], 0, 0, 1, 1) +
        lg('robe', [[0, '#ffffff'], [1, '#d8e4f1']]) +
        lg('inner', [[0, '#d6e8fa'], [1, '#a6c9ec']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        `<path d="M-20 470C10 430 70 432 92 460C112 430 170 436 180 476C200 470 222 484 222 504H-20Z" fill="#fff" opacity=".7"/>` +
        `<path d="M620 440C590 406 540 410 520 436C500 410 450 416 440 452C420 448 400 462 402 480H620Z" fill="#fff" opacity=".6"/>` +
        zoom(
          // long hair falling behind the back
          `<path d="M178 290C158 186 212 100 300 98C388 100 442 186 422 290C430 350 440 410 446 470H154C160 410 170 350 178 290Z" fill="url(#hr)"/>` +
          neck(k, 256, 344) +
          // white jacket, crossed collar trimmed in pale blue
          `<path d="M26 600C36 520 108 474 210 460L256 454H344L390 460C492 474 564 520 574 600Z" fill="url(#robe)"/>` +
          `<path d="M256 454L300 520L344 454Z" fill="url(#inner)"/>` +
          `<path d="M356 450L334 450L286 516L298 530Z" fill="#a9cdee"/>` +
          `<path d="M240 450L264 450L384 600H354Z" fill="#a9cdee"/>` +
          `<path d="M264 450L276 450L394 600H384Z" fill="#7fb0e0"/>` +
          `<path d="M110 520C122 504 138 494 156 488" fill="none" stroke="#c4d4e6" stroke-width="6" stroke-linecap="round"/>` +
          // low ponytail draped over his shoulder, tied with a pale blue ribbon
          `<path d="M372 404C412 420 440 462 446 516C450 552 444 580 432 606H482C494 568 494 516 476 470C458 428 428 402 392 388Z" fill="url(#hr)"/>` +
          `<path d="M402 430C424 456 436 492 438 532" fill="none" stroke="#5c6488" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
          `<path d="M398 428C414 452 420 480 420 510L408 508C408 482 402 458 390 436ZM406 426C428 446 440 472 444 500L432 502C428 476 416 454 400 434Z" fill="#e6f0fa" stroke="#8fb6e2" stroke-width="2"/>` +
          `<path d="M366 398L410 410L404 432L360 420Z" fill="#cfe3f8" stroke="#8fb6e2" stroke-width="2"/>` +
          ears(k) + face(k, FACE_M, 0.55) +
          // hair cap with a centre part, swept back behind the ears
          `<path d="M200 262C194 192 238 136 300 132C362 136 406 192 400 262C392 226 374 198 346 184C330 176 314 174 300 178C286 174 270 176 254 184C226 198 208 226 200 262Z" fill="${k[3]}" opacity=".3" transform="translate(0 8)"/>` +
          `<path d="M194 262C184 186 236 124 300 120C364 124 416 186 406 262C400 236 390 214 376 198C356 182 330 172 300 176C270 172 244 182 224 198C210 214 200 236 194 262Z" fill="url(#hr)"/>` +
          `<path d="M300 124C330 128 358 142 378 166M300 124C270 128 242 142 222 166" fill="none" stroke="#5c6488" stroke-width="6" stroke-linecap="round" opacity=".6"/>` +
          // two thin strands framing the face
          `<path d="M294 176C262 186 236 210 228 246C222 276 222 306 226 336C232 306 234 276 240 250C248 216 266 192 294 176Z" fill="url(#hr)"/>` +
          `<path d="M306 176C338 186 364 210 372 246C378 276 378 306 374 336C368 306 366 276 360 250C352 216 334 192 306 176Z" fill="url(#hr)"/>` +
          // silver hair crown
          `<path d="M270 112L300 88L330 112L300 122Z" fill="#eef3f9" stroke="#a9bad0" stroke-width="3" stroke-linejoin="round"/>` +
          `<circle cx="300" cy="106" r="5" fill="#9cc0e6"/>` +
          // gentle brows, soft eyes, small smile
          brow('M232 248Q256 238 282 244', '#24212d', 10) + brow('M318 244Q344 238 368 248', '#24212d', 10) +
          eyeOpen(256, 288, INK, 6) + eyeOpen(344, 288, INK, 6) +
          `<path d="M240 306Q256 312 272 306M328 306Q344 312 360 306" fill="none" stroke="${k[3]}" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>` +
          nose(k) +
          `<path d="M280 356Q300 368 320 356" fill="none" stroke="#a6584f" stroke-width="6" stroke-linecap="round"/>`
        )
      );
    },
  });

  // ---- Nie Huaisang -----------------------------------------------------------------------
  def('av_nhs', {
    title: 'Nie Huaisang',
    w: 600, h: 600, tags: ['avatar', 'nhs'],
    svg: (w, h) => {
      const k = SKIN.young;
      // fan geometry: pivot P, radius R, folds from -66° to 66°
      const P = [300, 492], R = 196, r0 = 62, N = 14, A = 66;
      const pt = (deg, rad) => [P[0] + rad * Math.sin((deg * Math.PI) / 180), P[1] - rad * Math.cos((deg * Math.PI) / 180)];
      let folds = '', ribs = '';
      for (let i = 0; i < N; i++) {
        const a0 = -A + (2 * A * i) / N, a1 = -A + (2 * A * (i + 1)) / N;
        const [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R), [x2, y2] = pt(a1, r0 + 34), [x3, y3] = pt(a0, r0 + 34);
        folds += `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}Z" fill="${i % 2 ? '#efe6d2' : '#fbf6ea'}"/>`;
      }
      for (let i = 0; i <= N; i++) {
        const a = -A + (2 * A * i) / N;
        const [x0, y0] = pt(a, r0 + 36), [x1, y1] = pt(a, 6);
        ribs += `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
      }
      const [ex0, ey0] = pt(-A, R), [ex1, ey1] = pt(A, R);
      const arc = `M${f(ex0)} ${f(ey0)}A${R} ${R} 0 0 1 ${f(ex1)} ${f(ey1)}`;
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#f1fff4'], [0.5, '#b4ebc5'], [1, '#3fa66d']], 0.5, 0.35, 0.8) +
        lg('hr', [[0, '#4a3a33'], [0.45, '#261c1c'], [1, '#141011']], 0, 0, 1, 1) +
        lg('jk', [[0, '#4fb37c'], [1, '#22764c']]) +
        `<clipPath id="fanclip"><path d="M${P[0]} ${P[1]}L${f(ex0)} ${f(ey0)}A${R} ${R} 0 0 1 ${f(ex1)} ${f(ey1)}Z"/></clipPath>`,
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        bokeh([[84, 130, 24, 0.4], [520, 100, 16, 0.5], [536, 300, 28, 0.22], [64, 320, 12, 0.45]], '#fff') +
        zoom(
          // bun + hair stick
          `<path d="M232 70L372 118" stroke="#2f8a58" stroke-width="9" stroke-linecap="round"/><circle cx="234" cy="70" r="9" fill="#6fd39a"/>` +
          `<circle cx="300" cy="98" r="44" fill="url(#hr)"/><path d="M270 84C284 70 312 68 328 82" fill="none" stroke="#6e5648" stroke-width="5" stroke-linecap="round" opacity=".7"/>` +
          // back hair to shoulders
          `<path d="M180 300C160 196 214 112 300 110C386 112 440 196 420 300C424 330 428 360 430 388L170 388C172 360 176 330 180 300Z" fill="url(#hr)"/>` +
          neck(k) +
          `<path d="M34 600C44 520 112 476 212 462L300 470L388 462C488 476 556 520 566 600Z" fill="url(#jk)"/>` +
          `<path d="M250 456L300 486L350 456L360 470L300 506L240 470Z" fill="#e9f7ee"/>` +
          ears(k) + face(k) +
          // fringe
          `<path d="M198 268C192 186 236 128 302 126C368 128 410 184 402 270C394 232 376 206 352 192C356 214 348 232 336 242C330 216 314 200 290 192C288 212 278 226 262 236C262 216 254 204 240 200C222 214 206 238 198 268Z" fill="${k[3]}" opacity=".32" transform="translate(2 9)"/>` +
          `<path d="M194 300C180 190 230 120 302 118C374 120 422 190 406 300C400 240 380 206 352 190C356 212 348 230 336 240C330 214 314 198 290 190C288 210 278 224 262 234C262 214 254 202 240 198C214 220 200 254 194 300Z" fill="url(#hr)"/>` +
          `<path d="M256 136C288 124 330 128 360 148" fill="none" stroke="#6e5648" stroke-width="6" stroke-linecap="round" opacity=".55"/>` +
          // playful brows + crescent eyes
          brow('M228 236Q254 220 280 232', '#241a1c', 8.5) + brow('M320 232Q346 220 372 236', '#241a1c', 8.5) +
          eyeSmile(256, 280) + eyeSmile(344, 280) +
          // sleeve
          `<path d="M300 600C300 560 304 520 314 500C350 492 392 510 410 540C420 560 424 580 424 600Z" fill="#2a8456"/>` +
          // fan
          `<g transform="rotate(-8 300 492)">` +
          `<path d="${ribs}" stroke="#8a5a32" stroke-width="7" stroke-linecap="round"/>` +
          `<g clip-path="url(#fanclip)">${folds}` +
          `<path d="M96 420L150 352L184 384L232 318L280 372L318 334L366 386L404 346L470 420Z" fill="#9cc2ad" opacity=".6"/>` +
          `<path d="M110 430L176 380L214 404L262 360L304 394L352 366L420 430Z" fill="#4f8a6c" opacity=".6"/>` +
          `<circle cx="368" cy="330" r="15" fill="#f08a7c" opacity=".85"/>` +
          `<path d="M200 314C228 320 252 336 264 358M226 322l-8-14M246 336l12-10" fill="none" stroke="#5a3a2a" stroke-width="3.5" stroke-linecap="round"/>` +
          `<g fill="#f4a3b8"><circle cx="214" cy="312" r="6"/><circle cx="236" cy="330" r="5"/><circle cx="258" cy="344" r="6"/><circle cx="250" cy="322" r="4"/></g>` +
          `<rect x="330" y="400" width="14" height="18" fill="#d6332f" opacity=".85"/>` +
          `</g>` +
          `<path d="${arc}" fill="none" stroke="#8a5a32" stroke-width="5"/>` +
          `</g>` +
          // hand holding the fan
          `<path d="M276 492C270 470 290 456 312 460C334 464 344 482 338 500C334 516 318 526 300 524C286 522 278 508 276 492Z" fill="${k[1]}"/>` +
          `<path d="M290 470C302 466 316 468 326 476M286 486C300 482 316 484 330 492M288 502C300 500 314 502 324 508" fill="none" stroke="${k[3]}" stroke-width="4" stroke-linecap="round" opacity=".7"/>`
        )
      );
    },
  });

  // ---- Mianmian ---------------------------------------------------------------------------
  def('av_mian', {
    title: 'Mianmian',
    w: 600, h: 600, tags: ['avatar', 'mian'],
    svg: (w, h) => {
      const k = SKIN.young;
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#fff5f8'], [0.5, '#ffc9d9'], [1, '#e7799c']], 0.5, 0.35, 0.8) +
        lg('hr', [[0, '#5a3a35'], [0.45, '#33201f'], [1, '#1d1314']], 0, 0, 1, 1) +
        lg('bz', [[0, '#f093ae'], [1, '#c95d80']]) +
        lg('tn', [[0, '#fff7f2'], [1, '#f1dcd4']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        bokeh(BOKEH, '#fff') +
        zoom(
          // back hair (bob)
          `<path d="M176 300C156 190 214 106 302 104C392 106 446 192 424 300C428 340 430 380 420 408L180 408C170 380 172 340 176 300Z" fill="url(#hr)"/>` +
          neck(k) +
          // turtleneck + blazer
          `<path d="M32 600C42 520 112 478 214 464L386 464C488 478 558 520 568 600Z" fill="url(#bz)"/>` +
          `<path d="M246 470C240 440 250 420 262 412H338C350 420 360 440 354 470L346 600H254Z" fill="url(#tn)"/>` +
          `<path d="M262 412C276 424 324 424 338 412M256 436C276 450 324 450 344 436M252 458C276 472 324 472 348 458" fill="none" stroke="#e2c6bb" stroke-width="4" stroke-linecap="round"/>` +
          `<path d="M214 464L250 470L276 600H190Z" fill="#d86b8e"/><path d="M386 464L350 470L324 600H410Z" fill="#b84f72"/>` +
          `<path d="M214 464L250 470L238 520L204 500Z" fill="#f4a9c0"/><path d="M386 464L350 470L362 520L396 500Z" fill="#d97898"/>` +
          // pencil tucked behind the left ear (drawn behind the ear)
          `<g transform="rotate(58 190 250)"><rect x="128" y="243" width="104" height="15" rx="3" fill="#ffd43b"/><rect x="128" y="243" width="104" height="5" fill="#ffe680"/><path d="M232 243L254 250.5L232 258Z" fill="#f2d2a9"/><path d="M246 247.6L254 250.5L246 253.4Z" fill="#3a3a3a"/><rect x="116" y="243" width="14" height="15" rx="3" fill="#ff8fab"/><rect x="128" y="243" width="5" height="15" fill="#c9c9c9"/></g>` +
          ears(k) +
          `<circle cx="186" cy="322" r="6" fill="#f5c542"/>` +
          face(k) +
          // fringe: side part, tucked left, bob right
          `<path d="M206 258C206 178 248 132 296 128C364 128 410 180 404 262C400 316 404 360 414 398C390 382 382 330 382 284C380 236 362 200 330 182C300 196 258 214 206 258Z" fill="${k[3]}" opacity=".3" transform="translate(-2 8)"/>` +
          `<path d="M200 262C196 176 244 122 298 120C372 120 422 176 412 264C406 320 414 368 432 406C394 402 378 352 376 292C374 240 356 202 326 182C294 200 252 220 200 262Z" fill="url(#hr)"/>` +
          `<path d="M244 140C280 124 330 126 366 150M392 300C394 340 402 372 416 396" fill="none" stroke="#7d5a52" stroke-width="6" stroke-linecap="round" opacity=".55"/>` +
          // brows + eyes with a flick + thin glasses
          brow('M232 246Q256 236 280 244', '#33201f', 7) + brow('M320 244Q344 236 368 246', '#33201f', 7) +
          eyeOpen(256, 286, INK, 3) + eyeOpen(344, 286, INK, 3) +
          `<path d="M234 280L224 272M366 280L376 272" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` +
          `<circle cx="256" cy="288" r="34" fill="none" stroke="#c99a3c" stroke-width="4.5"/><circle cx="344" cy="288" r="34" fill="none" stroke="#c99a3c" stroke-width="4.5"/>` +
          `<path d="M290 284Q300 278 310 284M222 284L204 276M378 284L396 276" fill="none" stroke="#c99a3c" stroke-width="4.5" stroke-linecap="round"/>` +
          `<path d="M236 270L250 262" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>` +
          nose(k) +
          `<path d="M280 352Q300 366 320 352Q300 358 280 352Z" fill="#c44d68" stroke="#c44d68" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`
        )
      );
    },
  });

  // ---- Lan Sizhui -------------------------------------------------------------------------
  def('av_sz', {
    title: 'Lan Sizhui',
    w: 600, h: 600, tags: ['avatar', 'sz'],
    svg: (w, h) => {
      const k = SKIN.young;
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#f2fdff'], [0.5, '#bdeaf3'], [1, '#4fb6cf']], 0.5, 0.35, 0.8) +
        lg('hr', [[0, '#3d3434'], [0.45, '#1e1819'], [1, '#110d0e']], 0, 0, 1, 1) +
        lg('sw', [[0, '#d6ecfb'], [1, '#9cc9ea']]) +
        lg('rb', [[0, '#ffffff'], [1, '#e2eef8']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        bokeh(BOKEH, '#fff') +
        zoom(
          // ribbon tails behind
          `<path d="M392 214C430 240 470 300 488 380C496 420 492 460 480 492C470 452 456 420 440 400C452 360 440 300 404 250Z" fill="url(#rb)" stroke="#c6dcef" stroke-width="3"/>` +
          `<path d="M400 226C452 252 506 300 540 360C520 356 500 346 482 330C460 290 430 262 396 244Z" fill="url(#rb)" stroke="#c6dcef" stroke-width="3"/>` +
          // back hair
          `<path d="M182 300C162 196 214 106 302 104C390 106 440 196 418 300C410 262 400 232 388 214H212C198 232 188 262 182 300Z" fill="url(#hr)"/>` +
          neck(k) +
          // sweater with shirt collar
          `<path d="M34 600C44 520 112 478 212 464L388 464C488 478 556 520 566 600Z" fill="url(#sw)"/>` +
          `<path d="M250 462Q300 520 350 462" fill="none" stroke="#84b6dc" stroke-width="16"/>` +
          `<path d="M256 452L300 500L270 520L240 472Z" fill="#fff"/><path d="M344 452L300 500L330 520L360 472Z" fill="#eef5fb"/>` +
          `<path d="M120 548C132 528 146 516 160 510M480 548C468 528 454 516 440 510" fill="none" stroke="#7fb0d6" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
          ears(k) + face(k, FACE, 0.75) +
          // fringe
          `<path d="M200 270C194 186 240 130 302 128C366 130 410 186 402 272C394 236 378 212 356 200C358 220 352 234 342 244C336 222 322 206 302 198C300 216 292 230 278 240C276 220 268 208 254 204C230 220 210 242 200 270Z" fill="${k[3]}" opacity=".32" transform="translate(2 9)"/>` +
          `<path d="M196 284C186 190 236 122 302 120C370 122 420 190 406 284C398 240 380 212 356 198C358 218 352 232 342 242C336 220 322 204 302 196C300 214 292 228 278 238C276 218 268 206 254 202C226 220 206 248 196 284Z" fill="url(#hr)"/>` +
          `<path d="M240 140C276 124 328 124 362 142" fill="none" stroke="#6e5a58" stroke-width="6" stroke-linecap="round" opacity=".55"/>` +
          // forehead ribbon with cloud
          `<path d="M200 200C262 180 340 180 402 200L400 224C340 206 262 206 202 224Z" fill="url(#rb)" stroke="#c6dcef" stroke-width="2"/>` +
          `<path d="M288 207c3-7 13-7 15 0c5-4 13-1 12 6h-30c-1-4 0-6 3-6Z" fill="#5aa9d6"/>` +
          // kind brows + eyes
          brow('M232 250Q256 240 280 246', '#1e1819', 8) + brow('M320 246Q344 240 368 250', '#1e1819', 8) +
          eyeOpen(256, 288, INK, 2) + eyeOpen(344, 288, INK, 2) +
          `<path d="M240 304Q256 310 272 304M328 304Q344 310 360 304" fill="none" stroke="${k[3]}" stroke-width="3" stroke-linecap="round" opacity=".55"/>` +
          nose(k) +
          `<path d="M276 350Q300 374 324 350Q300 360 276 350Z" fill="#a8424f" stroke="#a8424f" stroke-width="6" stroke-linejoin="round"/>` +
          `<path d="M284 354Q300 358 316 354" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`
        )
      );
    },
  });

  // ---- Lan Jingyi -------------------------------------------------------------------------
  def('av_jy', {
    title: 'Lan Jingyi',
    w: 600, h: 600, tags: ['avatar', 'jy'],
    svg: (w, h) => {
      const k = SKIN.young;
      let rays = '';
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2, b = a + Math.PI / 22;
        rays += `M300 280L${f(300 + 520 * Math.cos(a))} ${f(280 + 520 * Math.sin(a))}L${f(300 + 520 * Math.cos(b))} ${f(280 + 520 * Math.sin(b))}Z`;
      }
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#fffbe0'], [0.45, '#ffd84d'], [1, '#ff9a1a']], 0.5, 0.4, 0.8) +
        lg('hr', [[0, '#4a352c'], [0.45, '#271b19'], [1, '#141010']], 0, 0, 1, 1) +
        lg('hd', [[0, '#ff9b3d'], [1, '#e8590c']]) +
        lg('rb', [[0, '#ffffff'], [1, '#e6eef6']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<path d="${rays}" fill="#fff" opacity=".18"/>` +
        `<circle cx="300" cy="260" r="240" fill="url(#halo)"/>` +
        zoom(
          // ribbon tails (askew)
          `<path d="M402 186C446 176 494 186 530 214C508 222 484 220 462 212C446 226 426 228 404 222Z" fill="url(#rb)" stroke="#d4dfea" stroke-width="3"/>` +
          `<path d="M404 200C440 214 470 246 482 286C462 280 444 266 432 248C420 236 408 226 400 218Z" fill="url(#rb)" stroke="#d4dfea" stroke-width="3"/>` +
          // tufty back hair
          `<path d="M184 300C172 254 168 214 178 182C160 176 148 168 140 156C160 154 176 150 190 142C182 126 180 110 184 94C200 104 216 112 230 114C236 96 248 82 264 74C272 92 284 104 300 108C312 92 328 82 348 78C350 96 356 108 368 116C384 106 404 102 424 104C418 120 410 132 400 140C418 146 434 156 446 170C432 174 420 176 412 178C432 220 432 262 418 300C412 262 402 232 388 214H212C198 232 190 262 184 300Z" fill="url(#hr)"/>` +
          neck(k) +
          // hoodie
          `<path d="M32 600C42 520 112 476 212 462L388 462C488 476 558 520 568 600Z" fill="url(#hd)"/>` +
          `<path d="M196 470C220 440 260 432 300 444C340 432 380 440 404 470C380 500 340 512 300 500C260 512 220 500 196 470Z" fill="#d9480f"/>` +
          `<path d="M232 476Q300 520 368 476Q300 500 232 476Z" fill="#b8400c"/>` +
          `<path d="M262 494C260 530 258 552 256 572M338 494C340 530 342 552 344 572" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` +
          `<circle cx="256" cy="578" r="7" fill="#fff"/><circle cx="344" cy="578" r="7" fill="#fff"/>` +
          ears(k) + face(k) +
          // messy fringe
          `<path d="M196 280C188 190 236 130 300 128C366 130 414 190 404 282C398 252 386 232 370 220L376 250L346 222L340 252L316 214L300 246L284 210L262 248L254 214L230 246L224 222C210 236 200 256 196 280Z" fill="${k[3]}" opacity=".32" transform="translate(2 9)"/>` +
          `<path d="M192 290C182 194 234 122 300 120C368 122 420 194 408 292C400 258 388 234 372 220L378 250L348 220L342 252L318 212L300 246L282 208L262 246L252 212L230 244L222 220C206 236 196 260 192 290Z" fill="url(#hr)"/>` +
          `<path d="M236 142C272 126 326 126 362 144" fill="none" stroke="#6e5648" stroke-width="6" stroke-linecap="round" opacity=".55"/>` +
          // crooked ribbon
          `<path d="M198 214C262 184 340 176 404 186L404 210C340 202 264 210 200 238Z" fill="url(#rb)" stroke="#d4dfea" stroke-width="2"/>` +
          `<path d="M292 197c3-7 13-7 15 0c5-4 13-1 12 6h-30c-1-4 0-6 3-6Z" fill="#5aa9d6"/>` +
          // raised brows, laughing eyes, big grin
          brow('M226 238Q252 216 280 228', '#1c1416', 9) + brow('M320 226Q348 214 374 236', '#1c1416', 9) +
          eyeHappy(256, 284) + eyeHappy(344, 284) +
          `<path d="M250 336Q300 344 350 336Q350 396 300 400Q250 396 250 336Z" fill="#7a1f2b"/>` +
          `<path d="M256 338Q300 346 344 338L340 354Q300 360 260 354Z" fill="#fff"/>` +
          `<path d="M272 384Q300 368 328 384Q316 398 300 399Q284 398 272 384Z" fill="#ff7f8f"/>` +
          `<path d="M250 336Q300 344 350 336" fill="none" stroke="#7a1f2b" stroke-width="5" stroke-linecap="round"/>` +
          `<path d="M302 300Q296 314 304 320" fill="none" stroke="${k[3]}" stroke-width="5" stroke-linecap="round" opacity=".8"/>` +
          `<ellipse cx="232" cy="322" rx="30" ry="16" fill="url(#bl)"/><ellipse cx="368" cy="322" rx="30" ry="16" fill="url(#bl)"/>`
        )
      );
    },
  });

  // ---- Old Huang --------------------------------------------------------------------------
  def('av_huang', {
    title: 'Old Huang',
    w: 600, h: 600, tags: ['avatar', 'huang'],
    svg: (w, h) => {
      const k = SKIN.tan;
      const GREY = '#c9c4c0';
      return svg(w, h,
        skinDefs(k) +
        rg('bg', [[0, '#fff4e6'], [0.5, '#ffc27a'], [1, '#ec7a22']], 0.5, 0.36, 0.8) +
        lg('cap', [[0, '#3a4c6b'], [1, '#1c2940']]) +
        lg('visor', [[0, '#2c2f38'], [0.5, '#0e1015'], [1, '#22252e']], 0, 0, 1, 0) +
        lg('uni', [[0, '#34496b'], [1, '#1d2b45']]) +
        lg('gold', [[0, '#ffe08a'], [1, '#d39a1c']]),
        `<rect width="600" height="600" fill="url(#bg)"/>` +
        `<circle cx="300" cy="250" r="250" fill="url(#halo)"/>` +
        bokeh(BOKEH, '#fff') +
        zoom(
          `<path d="M258 330V478Q300 504 342 478V330Z" fill="url(#nk)"/>` +
          // uniform
          `<path d="M28 600C38 518 110 474 214 460L386 460C490 474 562 518 572 600Z" fill="url(#uni)"/>` +
          `<path d="M250 452L300 506L350 452L364 470L300 540L236 470Z" fill="#e8edf5"/>` +
          `<path d="M250 452L300 506L282 524L232 478Z" fill="#f4f7fb"/>` +
          `<path d="M300 506L300 600" stroke="#13203a" stroke-width="4"/>` +
          `<circle cx="300" cy="560" r="5" fill="#d39a1c"/>` +
          `<path d="M86 500L178 470L184 488L92 520Z" fill="url(#gold)"/><path d="M514 500L422 470L416 488L508 520Z" fill="url(#gold)"/>` +
          `<path d="M392 512L436 506L440 548L414 566L392 548Z" fill="url(#gold)"/><path d="M414 520L418 540" stroke="#a87410" stroke-width="4" stroke-linecap="round"/>` +
          ears(k) + face(k, FACE_M, 0.6) +
          // grey hair sides
          `<path d="M196 262C192 230 196 210 204 196L222 200C214 220 212 240 214 262Z" fill="${GREY}"/>` +
          `<path d="M404 262C408 230 404 210 396 196L378 200C386 220 388 240 386 262Z" fill="#b5afaa"/>` +
          // cap
          `<path d="M182 196C170 150 214 104 300 98C386 104 430 150 418 196Z" fill="url(#cap)"/>` +
          `<path d="M196 190H404V222H196Z" fill="#141c2c"/>` +
          `<path d="M196 196H404" stroke="#d39a1c" stroke-width="4"/>` +
          `<path d="M190 218C230 236 370 236 410 218C400 250 360 262 300 262C240 262 200 250 190 218Z" fill="url(#visor)"/>` +
          `<path d="M232 232C270 244 330 244 368 232" fill="none" stroke="#fff" stroke-width="3" opacity=".25"/>` +
          `<g transform="translate(300 160)"><circle r="26" fill="url(#gold)"/><path d="M0-15C7-6 7 6 0 14C-7 6-7-6 0-15ZM-14-4C-4-2 0 6 0 14C-8 10-13 4-14-4ZM14-4C4-2 0 6 0 14C8 10 13 4 14-4Z" fill="#9a6a0a"/></g>` +
          // bushy brows, crinkled eyes
          brow('M228 284Q254 270 280 280', '#a8a29d', 13) + brow('M320 280Q346 270 372 284', '#a8a29d', 13) +
          eyeHappy(256, 308, '#2b1d1a', 17) + eyeHappy(344, 308, '#2b1d1a', 17) +
          `<path d="M222 304L210 298M222 314L208 316M378 304L390 298M378 314L392 316" stroke="${k[3]}" stroke-width="4" stroke-linecap="round"/>` +
          `<path d="M302 312Q292 334 306 340" fill="none" stroke="${k[3]}" stroke-width="6" stroke-linecap="round"/>` +
          // smile + mustache
          `<path d="M262 366Q300 402 338 366Q300 380 262 366Z" fill="#7a2a22"/><path d="M270 368Q300 378 330 368L328 376Q300 384 272 376Z" fill="#fff"/>` +
          `<path d="M300 346C278 342 254 350 246 368C266 362 284 362 300 356C316 362 334 362 354 368C346 350 322 342 300 346Z" fill="${GREY}"/>` +
          `<path d="M238 354Q232 380 248 398M362 354Q368 380 352 398" fill="none" stroke="${k[3]}" stroke-width="5" stroke-linecap="round" opacity=".8"/>` +
          // thumbs up
          `<g transform="translate(468 470) rotate(8)">` +
          `<path d="M-40 34C-44 8-40-14-26-26C-18-34-14-46-14-62C-14-76 4-80 10-68C16-56 12-40 6-28L38-28C52-28 56-14 48-6C58-2 58 12 48 16C56 22 54 36 44 38C50 46 44 58 32 58L-20 58C-32 58-38 48-40 34Z" fill="${k[1]}" stroke="${k[3]}" stroke-width="4" stroke-linejoin="round"/>` +
          `<path d="M8-6L44-6M10 16L46 16M14 38L40 38" stroke="${k[3]}" stroke-width="4" stroke-linecap="round"/>` +
          `<path d="M-62 30L-36 22L-34 70L-62 74Z" fill="#1d2b45"/>` +
          `</g>`
        )
      );
    },
  });
})();
