/* Stillwater · art
   Every illustration is generated SVG: the dawn lake, a parametric face used for all guests and guides,
   the valley map, the flooded nave, the drowned congregation, handprints, and the face at the bottom. */
(function () {
  'use strict';
  var SW = window.SW;
  var art = (SW.art = {});

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function n1(v) { return Math.round(v * 10) / 10; }
  function toSvg(markup) {
    var tpl = document.createElement('template');
    tpl.innerHTML = markup.trim();
    return tpl.content.firstElementChild;
  }
  art.toSvg = toSvg;
  /** smooth closed/open path through points (Catmull-Rom → cubic Bézier) */
  function spline(pts, closed) {
    var n = pts.length, d = 'M' + n1(pts[0][0]) + ' ' + n1(pts[0][1]);
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!closed) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
      d += ' C' + n1(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + n1(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
        n1(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + n1(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + n1(p2[0]) + ' ' + n1(p2[1]);
    }
    return d + (closed ? 'Z' : '');
  }
  function shade(h, amt) {
    var n = parseInt(h.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }
    return '#' + ((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1);
  }

  /* =====================================================================
     HERO · dawn over Hollin Mere
     ===================================================================== */
  function conifer(x, y, w, h) {
    var tiers = 5, R = [[x, y - h]], L = [], i, ty, tw;
    for (i = 1; i <= tiers; i++) {
      ty = y - h + h * 0.9 * i / tiers; tw = w * 0.5 * (0.35 + 0.65 * i / tiers);
      R.push([x + tw, ty]);
      if (i < tiers) R.push([x + tw * 0.38, ty - h * 0.035]);
    }
    R.push([x + w * 0.05, y]);
    L.push([x - w * 0.05, y]);
    for (i = tiers; i >= 1; i--) {
      ty = y - h + h * 0.9 * i / tiers; tw = w * 0.5 * (0.35 + 0.65 * i / tiers);
      L.push([x - tw, ty]);
      if (i > 1) { var py = y - h + h * 0.9 * (i - 1) / tiers, pw = w * 0.5 * (0.35 + 0.65 * (i - 1) / tiers); L.push([x - pw * 0.38, py - h * 0.035]); }
    }
    return 'M' + R.concat(L).map(function (p) { return n1(p[0]) + ' ' + n1(p[1]); }).join('L') + 'Z';
  }
  function forest(R, x0, x1, ground, hMin, hMax, step) {
    var d = '';
    for (var x = x0; x < x1; x += step * (0.55 + R() * 0.9)) {
      var h = hMin + R() * (hMax - hMin);
      d += conifer(x, ground(x) + 2, h * (0.3 + R() * 0.1), h);
    }
    return d;
  }
  function ridgePts(R, y0, amp, x0, x1, step, phase) {
    var pts = [];
    for (var x = x0; x <= x1; x += step) {
      pts.push([x, y0 - amp * (0.55 + 0.45 * Math.sin(x * 0.004 + phase)) - amp * 0.35 * Math.sin(x * 0.011 + phase * 2.3) - R() * amp * 0.08]);
    }
    return pts;
  }
  function hillPath(pts, base) {
    var d = spline(pts, false);
    return d + ' L' + pts[pts.length - 1][0] + ' ' + base + ' L' + pts[0][0] + ' ' + base + 'Z';
  }

  art.hero = function () {
    var R = rng(1891), W = 1600, H = 900, HZ = 560;
    var far = hillPath(ridgePts(R, 470, 95, -40, 1640, 80, 1.3), HZ);
    var mid = hillPath(ridgePts(R, 528, 46, -40, 1640, 60, 4.1), HZ);
    var shoreTrees = forest(R, -10, 1610, function () { return HZ - 2; }, 12, 30, 9);
    // low wooded spit on the left, kept below the headline
    var spitPts = [[-40, 520], [140, 528], [330, 540], [520, 552], [640, HZ]];
    var headland = spline(spitPts, false) + ' L640 ' + HZ + ' L-40 ' + HZ + 'Z';
    var headY = function (x) { return x < 140 ? 522 : x < 330 ? 528 + (x - 140) / 190 * 12 : 540 + (x - 330) / 190 * 12; };
    var headTrees = forest(R, -20, 560, headY, 16, 40, 10);
    // tall headland on the right, behind the jetty
    var rightPts = [[1180, HZ], [1290, 500], [1420, 452], [1520, 432], [1640, 424]];
    var rightLand = spline(rightPts, false) + ' L1640 ' + HZ + 'Z';
    var rightY = function (x) { return x < 1290 ? HZ - (x - 1180) / 110 * 56 : x < 1420 ? 504 - (x - 1290) / 130 * 50 : 452 - (x - 1420) / 220 * 24; };
    var rightTrees = forest(R, 1230, 1630, rightY, 50, 110, 15);
    var ripples = '';
    for (var i = 0; i < 46; i++) {
      var ry = HZ + 8 + Math.pow(R(), 1.6) * (H - HZ - 10), rx = R() * W, rl = 20 + (ry - HZ) * (0.15 + R() * 0.5);
      ripples += '<line class="ripple-line" style="animation-delay:-' + n1(R() * 5) + 's" x1="' + n1(rx) + '" y1="' + n1(ry) + '" x2="' + n1(rx + rl) + '" y2="' + n1(ry) + '"/>';
    }
    var sunGlints = '';
    for (var g = 0; g < 18; g++) {
      var gy = HZ + 6 + g * 10 + R() * 4, gw = 30 + R() * 50 - g * 1.2;
      sunGlints += '<rect x="' + n1(960 - gw / 2 + (R() - 0.5) * 14) + '" y="' + n1(gy) + '" width="' + n1(Math.max(6, gw)) + '" height="2.2" rx="1.1" opacity="' + n1(0.7 - g * 0.035) + '"/>';
    }
    // jetty
    var deckL0 = [1010, 900], deckL1 = [905, 700], deckR0 = [1320, 900], deckR1 = [982, 700];
    var planks = '';
    for (var p = 0; p <= 22; p++) {
      var t = Math.pow(p / 22, 1.7);
      var lx = deckL1[0] + (deckL0[0] - deckL1[0]) * t, ly = deckL1[1] + (deckL0[1] - deckL1[1]) * t;
      var rx2 = deckR1[0] + (deckR0[0] - deckR1[0]) * t, ry2 = deckR1[1] + (deckR0[1] - deckR1[1]) * t;
      planks += '<line x1="' + n1(lx) + '" y1="' + n1(ly) + '" x2="' + n1(rx2) + '" y2="' + n1(ry2) + '" stroke-width="' + n1(0.6 + t * 2.4) + '"/>';
    }
    var posts = '';
    [[0, 0.2], [0.33, 0.25], [0.62, 0.35], [1, 0.5]].forEach(function (q) {
      var t = Math.pow(q[0], 1.7);
      var lx = deckL1[0] + (deckL0[0] - deckL1[0]) * t, ly = deckL1[1] + (deckL0[1] - deckL1[1]) * t;
      var rx3 = deckR1[0] + (deckR0[0] - deckR1[0]) * t, ry3 = deckR1[1] + (deckR0[1] - deckR1[1]) * t;
      var w = 4 + t * 18, hgt = 14 + t * 60;
      posts += '<rect x="' + n1(lx - w * 0.3) + '" y="' + n1(ly) + '" width="' + n1(w) + '" height="' + n1(hgt) + '"/>';
      posts += '<rect x="' + n1(rx3 - w * 0.7) + '" y="' + n1(ry3) + '" width="' + n1(w) + '" height="' + n1(hgt) + '"/>';
    });
    // the figure at the end of the jetty
    var fx = 944, fy = 704;
    var figure =
      '<g id="jettyFigure" style="opacity:var(--figure);transition:opacity 2s">' +
        '<path d="M' + (fx - 5) + ' ' + (fy - 52) + ' C' + (fx - 9) + ' ' + (fy - 30) + ' ' + (fx - 12) + ' ' + (fy - 10) + ' ' + (fx - 13) + ' ' + fy + ' L' + (fx + 13) + ' ' + fy + ' C' + (fx + 12) + ' ' + (fy - 10) + ' ' + (fx + 9) + ' ' + (fy - 30) + ' ' + (fx + 5) + ' ' + (fy - 52) + 'Z" fill="#1A2120"/>' +
        '<ellipse cx="' + fx + '" cy="' + (fy - 58) + '" rx="5.2" ry="6.4" fill="#1A2120"/>' +
        '<path d="M' + (fx - 6) + ' ' + (fy - 60) + ' C' + (fx - 8) + ' ' + (fy - 46) + ' ' + (fx - 7) + ' ' + (fy - 36) + ' ' + (fx - 4) + ' ' + (fy - 28) + ' L' + (fx + 4) + ' ' + (fy - 28) + ' C' + (fx + 7) + ' ' + (fy - 36) + ' ' + (fx + 8) + ' ' + (fy - 46) + ' ' + (fx + 6) + ' ' + (fy - 60) + 'Z" fill="#141A19"/>' +
        '<g transform="translate(0,' + (2 * fy + 6) + ') scale(1,-1)" opacity=".28"><path d="M' + (fx - 5) + ' ' + (fy - 52) + ' L' + (fx - 13) + ' ' + fy + ' L' + (fx + 13) + ' ' + fy + ' L' + (fx + 5) + ' ' + (fy - 52) + 'Z" fill="#1A2120"/><ellipse cx="' + fx + '" cy="' + (fy - 58) + '" rx="5.2" ry="6.4" fill="#1A2120"/></g>' +
      '</g>';

    var markup =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C6D3DC"/><stop offset=".45" stop-color="#DCDFDD"/><stop offset=".56" stop-color="#EDE6D6"/><stop offset=".63" stop-color="#F3E5CA"/></linearGradient>' +
        '<radialGradient id="hSun" cx="960" cy="545" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF6DD" stop-opacity=".95"/><stop offset=".12" stop-color="#FCEBC6" stop-opacity=".6"/><stop offset="1" stop-color="#F3E5CA" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="hWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4DCDB"/><stop offset=".3" stop-color="#AEBEC0"/><stop offset="1" stop-color="#6E878B"/></linearGradient>' +
        '<linearGradient id="hHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9E6DC" stop-opacity="0"/><stop offset="1" stop-color="#E9E6DC" stop-opacity=".75"/></linearGradient>' +
        '<filter id="hBlur" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
        '<filter id="hMist" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="16"/></filter>' +
        '<clipPath id="hWaterClip"><rect x="0" y="' + HZ + '" width="' + W + '" height="' + (H - HZ) + '"/></clipPath>' +
        '<g id="hFar"><path d="' + far + '"/></g>' +
      '</defs>' +
      '<rect width="' + W + '" height="' + HZ + '" fill="url(#hSky)"/>' +
      '<rect width="' + W + '" height="' + HZ + '" fill="url(#hSun)"/>' +
      '<circle cx="960" cy="538" r="34" fill="#FFF7E2"/>' +
      '<g class="birds" fill="none" stroke="#3E4A48" stroke-width="2" stroke-linecap="round"><path d="M200 92q8-7 16 0q8-7 16 0"/><path d="M250 112q6-5 12 0q6-5 12 0"/><path d="M176 124q5-4 10 0q5-4 10 0"/></g>' +
      // land above water
      '<path d="' + far + '" fill="#B3C0C4"/>' +
      '<rect y="380" width="' + W + '" height="' + (HZ - 380) + '" fill="url(#hHaze)"/>' +
      '<path d="' + mid + '" fill="#93A4A8"/>' +
      '<path d="' + shoreTrees + '" fill="#6F8285"/>' +
      '<path d="' + rightLand + '" fill="#4F6265"/><path d="' + rightTrees + '" fill="#425457"/>' +
      '<path d="' + headland + '" fill="#4B5E61"/><path d="' + headTrees + '" fill="#36484B"/>' +
      // water + reflections (the reflection shows a spire that is not on the shore)
      '<rect y="' + HZ + '" width="' + W + '" height="' + (H - HZ) + '" fill="url(#hWater)"/>' +
      '<g clip-path="url(#hWaterClip)"><g transform="translate(0 ' + (2 * HZ) + ') scale(1 -1)" opacity=".42" filter="url(#hBlur)">' +
        '<path d="' + far + '" fill="#9DAFB3"/><path d="' + mid + '" fill="#7F9397"/><path d="' + shoreTrees + '" fill="#5F7477"/>' +
        '<path d="' + rightLand + '" fill="#40534F"/><path d="' + rightTrees + '" fill="#36494C"/>' +
        '<path d="' + headland + '" fill="#3C4F52"/><path d="' + headTrees + '" fill="#2C3D40"/>' +
        '<g fill="#3A4B4E"><rect x="702" y="' + (HZ - 46) + '" width="18" height="46"/><path d="M699 ' + (HZ - 46) + ' L711 ' + (HZ - 124) + ' L723 ' + (HZ - 46) + 'Z"/><rect x="720" y="' + (HZ - 22) + '" width="40" height="22"/></g>' +
      '</g></g>' +
      '<g fill="#FFF6DE">' + sunGlints + '</g>' +
      '<g stroke="#EEF2EF" stroke-width="1.4" stroke-linecap="round" opacity=".5">' + ripples + '</g>' +
      // mist
      '<g filter="url(#hMist)" fill="#F4F2EB"><ellipse class="mist" cx="420" cy="' + (HZ - 4) + '" rx="420" ry="16" opacity=".8"/><ellipse class="mist m2" cx="1180" cy="' + (HZ + 6) + '" rx="380" ry="14" opacity=".7"/><ellipse class="mist" cx="800" cy="' + (HZ + 26) + '" rx="520" ry="12" opacity=".45"/></g>' +
      // jetty
      '<g fill="#3C3129">' + posts + '</g>' +
      '<path d="M' + deckL1.join(' ') + ' L' + deckR1.join(' ') + ' L' + deckR0.join(' ') + ' L' + deckL0.join(' ') + 'Z" fill="#6A5848"/>' +
      '<g stroke="#4B3E33">' + planks + '</g>' +
      '<path d="M' + deckL1.join(' ') + ' L' + deckL0.join(' ') + '" stroke="#3E332A" stroke-width="3"/>' +
      figure +
      // dusk: deepens as the visitor goes further down the page
      '<rect width="' + W + '" height="' + H + '" fill="#16201E" style="opacity:calc(var(--d) * .8)"/>' +
      '</svg>';
    return toSvg(markup);
  };

  /* =====================================================================
     FACES · one parametric face for every guest, guide and Wren
     ===================================================================== */
  var PRESETS = {
    margaret: { skin: '#EFCBAE', hair: '#CFC9BF', style: 'set', top: '#7A8E99', bg: '#DCE4E1', age: 1 },
    daniel: { skin: '#8C5B3E', hair: '#1F1A17', style: 'crop', top: '#B08D5B', bg: '#E5DED0', beard: 0.85, glasses: 1 },
    priya: { skin: '#C48B62', hair: '#211611', style: 'long', top: '#8C6C8D', bg: '#E2DCE5' },
    ada: { skin: '#E9D5C2', hair: '#4E3B2D', style: 'bun', top: '#2E2D2C', bg: '#D6D8D0', collar: 1 },
    agnes: { skin: '#EDD1BC', hair: '#E4E1DA', style: 'bun', top: '#2B3735', bg: '#D3DCD9', collar: 1, age: 1 },
    tam: { skin: '#D4A27A', hair: '#5E4029', style: 'wave', top: '#2F5860', bg: '#CFDCDE', beard: 0.55 },
    wren: { skin: '#F2D0BA', hair: '#A9603A', style: 'bob', top: '#9DAE85', bg: '#E5E8DC' }
  };
  var HAIR_BACK = {
    long: 'M38.5 46 C34 66 33 94 38 116 L82 116 C87 94 86 66 81.5 46 Z',
    bob: 'M38 45 C35.5 60 36.5 73 40.5 80 L79.5 80 C83.5 73 84.5 60 82 45 Z'
  };
  var HAIR_FRONT = {
    set: 'M39 52 C36 34 47 24.5 60 24.5 C73 24.5 84 34 81 52 C79 44 73 37.5 66 36.5 C62 39 56 39 52 36.8 C46 38.5 41 44 39 52 Z',
    crop: 'M40 46 C40 32 50 27 60 27 C70 27 80 32 80 46 C75 39 67 35.5 60 35.5 C53 35.5 45 39 40 46 Z',
    long: 'M38.6 56 C36.5 34 47.5 25 60 25 C72.5 25 83.5 34 81.4 56 C80 44 73 36 61.5 34.2 L60 37 C49 37.5 41.5 44 38.6 56 Z',
    bob: 'M38.4 54 C36.5 33 47.5 25 60 25 C72.5 25 83.5 33 81.6 54 C79 42 70 35 58 35.5 C49 36 42 43 38.4 54 Z',
    bun: 'M40 48 C40 33.5 49.5 27 60 27 C70.5 27 80 33.5 80 48 C75.5 40.5 68 36 61 35.4 L60 37.5 L59 35.4 C52 36 44.5 40.5 40 48 Z',
    wave: 'M39.5 49 C38 33 48 25.5 60 25.5 C72 25.5 82 33 80.5 49 C78 43.5 74.5 41 71 41.5 C68 37.5 64.5 39.5 61 37.5 C57 40 52.5 37.5 49.5 40.5 C45.5 39.5 42 43 39.5 49 Z'
  };
  var faceSeq = 0;
  art.faces = [];

  art.face = function (name, kind) {
    var o = PRESETS[name] || PRESETS.wren, id = 'f' + (++faceSeq);
    var skinDark = shade(o.skin, -0.14), hairDark = shade(o.hair, -0.35);
    var vb = kind === 'portrait' ? '12 6 96 120' : kind === 'chat' ? '22 18 76 76' : '0 0 120 120';
    var s = '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    if (kind === 'portrait') {
      s += '<defs><linearGradient id="' + id + 'bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + shade(o.bg, 0.25) + '"/><stop offset="1" stop-color="' + shade(o.bg, -0.06) + '"/></linearGradient></defs>';
      s += '<rect x="0" y="0" width="120" height="130" fill="url(#' + id + 'bg)"/>';
    } else {
      s += '<rect x="0" y="0" width="120" height="130" fill="' + o.bg + '"/>';
    }
    if (o.style === 'bun') s += '<circle cx="60" cy="25" r="9.5" fill="' + o.hair + '"/>';
    if (HAIR_BACK[o.style]) s += '<path d="' + HAIR_BACK[o.style] + '" fill="' + o.hair + '"/>';
    s += '<path d="M10 132 C12 104 34 88 60 86 C86 88 108 104 110 132 Z" fill="' + o.top + '"/>';
    s += '<path d="M53 70 L53 87 Q60 92 67 87 L67 70 Z" fill="' + skinDark + '"/>';
    if (o.collar) s += '<path d="M47 86 Q60 97 73 86 L76 92 Q60 104 44 92 Z" fill="#EDEAE2"/>';
    s += '<ellipse cx="40.5" cy="55" rx="3.2" ry="5" fill="' + skinDark + '"/><ellipse cx="79.5" cy="55" rx="3.2" ry="5" fill="' + skinDark + '"/>';
    s += '<ellipse cx="60" cy="52" rx="20" ry="25" fill="' + o.skin + '"/>';
    s += '<ellipse class="wet" cx="60" cy="52" rx="20" ry="25" fill="#5D7A6E" opacity="0"/>';
    if (o.beard) s += '<path d="M41 56 C42 72 50 79.5 60 79.5 C70 79.5 78 72 79 56 C75 65.5 68 69 60 69 C52 69 45 65.5 41 56 Z" fill="' + o.hair + '" opacity="' + o.beard + '"/>';
    s += '<path d="' + HAIR_FRONT[o.style] + '" fill="' + o.hair + '"/>';
    if (o.style === 'set') s += '<g fill="' + o.hair + '"><circle cx="41" cy="46" r="4"/><circle cx="79" cy="46" r="4"/><circle cx="46" cy="33" r="5"/><circle cx="74" cy="33" r="5"/><circle cx="60" cy="27" r="6"/></g>';
    if (o.age) s += '<g fill="none" stroke="' + skinDark + '" stroke-width=".8" stroke-linecap="round" opacity=".7"><path d="M45.5 57.5 l-2 1.2M74.5 57.5 l2 1.2M53 64.5 q-2 2.5 -1 5M67 64.5 q2 2.5 1 5"/></g>';
    s += '<g fill="none" stroke="' + hairDark + '" stroke-width="1.5" stroke-linecap="round"><path class="brow" d="M47.5 47.8 Q52 45.8 56 47.6"/><path class="brow" d="M64 47.6 Q68 45.8 72.5 47.8"/></g>';
    s += '<g class="eyes">' +
      '<ellipse class="sclera" cx="52" cy="54" rx="3.7" ry="2.7" fill="#F7F4EE"/><ellipse class="sclera" cx="68" cy="54" rx="3.7" ry="2.7" fill="#F7F4EE"/>' +
      '<circle class="pupil" cx="52" cy="54" r="1.9" fill="#221E1C"/><circle class="pupil" cx="68" cy="54" r="1.9" fill="#221E1C"/>' +
      '<path class="lid" d="M48.3 54.2 Q52 56.6 55.7 54.2 M64.3 54.2 Q68 56.6 71.7 54.2" fill="none" stroke="' + hairDark + '" stroke-width="1.4" stroke-linecap="round" opacity="0"/>' +
      '</g>';
    if (o.glasses) s += '<g fill="none" stroke="#2A2522" stroke-width="1.3"><circle cx="52" cy="54" r="6.2"/><circle cx="68" cy="54" r="6.2"/><path d="M58.2 53.6 Q60 52.4 61.8 53.6M45.8 53 L41.5 52M74.2 53 L78.5 52"/></g>';
    s += '<path d="M60 56.5 Q58.5 61 60.6 62.3" fill="none" stroke="' + skinDark + '" stroke-width="1.3" stroke-linecap="round"/>';
    s += '<g class="blush" fill="#E79A8C" opacity=".3"><circle cx="46.5" cy="62" r="4"/><circle cx="73.5" cy="62" r="4"/></g>';
    s += '<path class="mouth" d="M55 66.5 Q60 69 65 66.5" fill="#3A1F1D" fill-opacity="0" stroke="#7A3E38" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>';
    s += '</svg>';
    var el = toSvg(s);
    var f = {
      el: el, kind: kind || 'avatar', name: name,
      pupils: el.querySelectorAll('.pupil'), scleras: el.querySelectorAll('.sclera'),
      lid: el.querySelector('.lid'), mouth: el.querySelector('.mouth'), blush: el.querySelector('.blush'), wet: el.querySelector('.wet'),
      gx: 0, gy: 0, visible: true, shut: false, blinkUntil: 0, nextBlink: performance.now() + 1500 + Math.random() * 5000,
      eyeY: kind === 'portrait' ? (54 - 6) / 120 : kind === 'chat' ? (54 - 18) / 76 : 54 / 120,
      last: ''
    };
    art.faces.push(f);
    if (window.IntersectionObserver) {
      f.visible = false;
      new IntersectionObserver(function (es) { f.visible = es[es.length - 1].isIntersecting; }).observe(el);
    }
    return f;
  };

  var SCLERA = '#F7F4EE', SCLERA_DEAD = '#060807', PUPIL = '#221E1C', PUPIL_DEAD = '#D3D9CB';
  function updateFace(f, d, now) {
    if (!f.visible) return;
    var grow = SW.smooth(0.14, 0.78, d);
    var w = 5 + grow * 8, k = 2.4 + grow * 5.2, open = SW.smooth(0.42, 0.74, d);
    var y = 66.5;
    var mouth = open > 0.02
      ? 'M' + n1(60 - w) + ' ' + y + ' Q60 ' + n1(y + k * 0.45) + ' ' + n1(60 + w) + ' ' + y + ' Q60 ' + n1(y + k * 1.45) + ' ' + n1(60 - w) + ' ' + y + 'Z'
      : 'M' + n1(60 - w) + ' ' + y + ' Q60 ' + n1(y + k) + ' ' + n1(60 + w) + ' ' + y;
    // gaze: follow the pointer from act II, otherwise the middle of the screen
    var tx = 0, ty = 0;
    if (d > 0.17) {
      var r = f.el.getBoundingClientRect();
      var ex = r.left + r.width / 2, ey = r.top + r.height * f.eyeY;
      var px = SW.pointer ? SW.pointer.x : window.innerWidth / 2, py = SW.pointer ? SW.pointer.y : window.innerHeight * 0.45;
      var dx = px - ex, dy = py - ey, dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var m = Math.min(1, dist / 260) * 1.6 * SW.smooth(0.17, 0.3, d);
      tx = dx / dist * m; ty = dy / dist * m * 0.75;
    }
    f.gx += (tx - f.gx) * 0.18; f.gy += (ty - f.gy) * 0.18;
    // natural blinking until things get strange
    if (d < 0.5 && now > f.nextBlink) { f.blinkUntil = now + 130; f.nextBlink = now + 2500 + Math.random() * 5000; }
    var closed = f.shut || now < f.blinkUntil;
    var inv = SW.smooth(0.58, 0.74, d);
    var key = mouth + '|' + n1(f.gx * 10) + '|' + n1(f.gy * 10) + '|' + closed + '|' + n1(inv * 50) + '|' + n1(d * 40);
    if (key === f.last) return;
    f.last = key;
    f.mouth.setAttribute('d', mouth);
    f.mouth.setAttribute('fill-opacity', n1(open));
    var sc = SW.mix(SCLERA, SCLERA_DEAD, inv), pc = SW.mix(PUPIL, PUPIL_DEAD, inv);
    for (var i = 0; i < 2; i++) {
      f.pupils[i].setAttribute('transform', 'translate(' + n1(f.gx) + ' ' + n1(f.gy) + ')');
      f.pupils[i].setAttribute('r', n1(1.9 - inv * 0.9));
      f.pupils[i].setAttribute('fill', pc);
      f.scleras[i].setAttribute('fill', sc);
      f.scleras[i].setAttribute('ry', n1(2.7 + inv * 0.9));
      f.pupils[i].style.opacity = closed ? 0 : 1;
      f.scleras[i].style.opacity = closed ? 0 : 1;
    }
    f.lid.style.opacity = closed ? 1 : 0;
    f.blush.setAttribute('opacity', n1(0.3 * (1 - SW.smooth(0.25, 0.55, d))));
    f.wet.setAttribute('opacity', n1(SW.smooth(0.48, 0.85, d) * 0.5));
  }
  SW.on('frame', function (now) {
    var d = SW.d;
    for (var i = 0; i < art.faces.length; i++) updateFace(art.faces[i], d, now);
  });

  /* =====================================================================
     MAP · every road ends at the water
     ===================================================================== */
  art.map = function () {
    var R = rng(41);
    function blob(cx, cy, rx, ry, wob, seed, steps) {
      var pts = [], s = seed;
      for (var i = 0; i < steps; i++) {
        var a = i / steps * Math.PI * 2;
        var k = 1 + wob * Math.sin(3 * a + s) + wob * 0.6 * Math.sin(5 * a + s * 2.1) + wob * 0.3 * Math.sin(8 * a + s * 0.7);
        pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
      }
      return spline(pts, true);
    }
    var contours = '';
    [[110, 100, 1.2], [540, 86, 2.4], [560, 440, 3.3], [80, 440, 4.6], [300, 470, 5.5]].forEach(function (h) {
      for (var r = 16; r <= 96; r += 16) contours += '<path class="m-contour" d="' + blob(h[0], h[1], r * 1.15, r * 0.9, 0.09, h[2] + r * 0.03, 24) + '"/>';
    });
    var mere = blob(330, 270, 128, 88, 0.07, 2.2, 28);
    var mereRipples = blob(330, 270, 100, 66, 0.06, 2.6, 24) + blob(330, 270, 70, 44, 0.05, 3.1, 20);
    var roads = [
      { d: 'M-10 318 C60 314 120 300 160 292 C180 288 196 286 206 284', end: [206, 284, 0, 1] },
      { d: 'M338 -10 C334 40 344 90 330 140 C326 158 322 172 320 184', end: [320, 184, 1, 0] },
      { d: 'M650 236 C600 240 540 228 500 244 C478 252 462 258 452 262', end: [452, 262, 0, 1] },
      { d: 'M430 530 C420 480 398 440 384 400 C378 382 374 368 372 358', end: [372, 358, 1, 0] }
    ];
    var roadSvg = '';
    roads.forEach(function (r) { roadSvg += '<path class="m-road-case" d="' + r.d + '"/>'; });
    roads.forEach(function (r) {
      var e = r.end, hx = e[2] * 7, hy = e[3] * 7;
      roadSvg += '<path class="m-road" d="' + r.d + '"/><path class="m-end" d="M' + (e[0] - hx) + ' ' + (e[1] - hy) + ' L' + (e[0] + hx) + ' ' + (e[1] + hy) + '"/>';
    });
    var oldRoad = 'M206 284 C250 280 290 274 330 272 M320 184 C324 214 328 244 330 272 M452 262 C410 266 370 270 330 272 M372 358 C362 326 344 296 330 272';
    var village = '';
    for (var v = 0; v < 13; v++) {
      var a = R() * Math.PI * 2, rr = 8 + R() * 26;
      village += '<rect x="' + n1(330 + Math.cos(a) * rr - 3) + '" y="' + n1(272 + Math.sin(a) * rr * 0.7 - 3) + '" width="' + n1(4 + R() * 3) + '" height="' + n1(4 + R() * 3) + '"/>';
    }
    var markup =
      '<svg viewBox="0 0 640 520" aria-hidden="true">' +
      '<rect class="m-land" width="640" height="520"/>' + contours +
      '<path class="m-signal" d="' + blob(330, 272, 205, 160, 0.05, 1.7, 30) + '"/>' +
      '<path class="m-water" d="' + mere + '"/><path class="m-ripple" d="' + mereRipples + '"/>' +
      '<path class="m-old" d="' + oldRoad + '"/>' +
      '<g class="m-village">' + village + '</g>' +
      '<g class="m-church"><rect x="324" y="258" width="12" height="12"/><path d="M330 247 V256 M326.5 250.5 H333.5"/></g>' +
      roadSvg +
      '<path class="m-pin" d="M404 172 C404 163 397 157 390 157 C383 157 376 163 376 172 C376 182 390 196 390 196 C390 196 404 182 404 172 Z"/><circle class="m-pin-dot" cx="390" cy="171" r="5"/>' +
      '<text class="m-label big" x="410" y="176">Stillwater</text>' +
      '<text class="m-label sub" x="268" y="312">Hollin Green (submerged 1891)</text>' +
      '<text class="m-label" x="300" y="234" opacity=".7">Hollin Mere</text>' +
      '<text class="m-label" x="14" y="306">◂ Ravensby station, 38 mi</text>' +
      '<text class="m-label" x="400" y="510">Last fuel, 40 mi ▾</text>' +
      '<text class="m-label" x="346" y="22">Fenmoor Road</text>' +
      '<text class="m-label" x="520" y="226">Gill Lane</text>' +
      '<text class="m-label warn" x="96" y="140">No signal beyond this line</text>' +
      '<g transform="translate(596 64)"><circle r="16" fill="none" stroke="currentColor" class="m-contour" style="stroke-opacity:.5"/><path d="M0 -12 L4 2 L0 0 L-4 2 Z" class="m-pin"/><text class="m-n" x="-4" y="-20">N</text></g>' +
      '<g transform="translate(24 486)"><path d="M0 0 H80 M0 -4 V4 M40 -3 V3 M80 -4 V4" stroke-width="1.4" class="m-end" style="stroke-width:1.4"/><text class="m-label" x="88" y="4">1 mile</text></g>' +
      '</svg>';
    return toSvg(markup);
  };

  /* =====================================================================
     NAVE · the flooded church of St. Hollin
     ===================================================================== */
  art.nave = function () {
    var VPX = 600, VPY = 330, depths = [0.2, 0.3, 0.42, 0.58, 0.8, 1.1, 1.5];
    var cols = '', arches = '', pews = '';
    depths.forEach(function (s, i) {
      var xl = VPX - 500 * s, xr = VPX + 500 * s, w = 46 * s, top = VPY - 300 * s, bottom = VPY + 520 * s;
      var tone = shade('#0E1C1B', 0.08 - i * 0.03);
      cols += '<rect x="' + n1(xl - w / 2) + '" y="' + n1(top) + '" width="' + n1(w) + '" height="' + n1(bottom - top) + '" fill="' + tone + '"/>';
      cols += '<rect x="' + n1(xr - w / 2) + '" y="' + n1(top) + '" width="' + n1(w) + '" height="' + n1(bottom - top) + '" fill="' + tone + '"/>';
      var apex = top - 330 * s;
      arches += '<path d="M' + n1(xl) + ' ' + n1(top) + ' C' + n1(xl) + ' ' + n1(top - 230 * s) + ' ' + n1(VPX - 120 * s) + ' ' + n1(apex + 40 * s) + ' ' + VPX + ' ' + n1(apex) +
        ' C' + n1(VPX + 120 * s) + ' ' + n1(apex + 40 * s) + ' ' + n1(xr) + ' ' + n1(top - 230 * s) + ' ' + n1(xr) + ' ' + n1(top) + '" fill="none" stroke="' + tone + '" stroke-width="' + n1(24 * s) + '"/>';
      if (i < depths.length - 1) {
        var pw = 360 * s, py = VPY + 300 * s, ph = 22 * s;
        pews += '<rect x="' + n1(VPX - 40 * s - pw) + '" y="' + n1(py) + '" width="' + n1(pw) + '" height="' + n1(ph) + '" fill="' + shade(tone, -0.2) + '"/>';
        pews += '<rect x="' + n1(VPX + 40 * s) + '" y="' + n1(py) + '" width="' + n1(pw) + '" height="' + n1(ph) + '" fill="' + shade(tone, -0.2) + '"/>';
      }
    });
    var markup =
      '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="nGlow" cx="600" cy="230" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6E9C92" stop-opacity=".55"/><stop offset=".25" stop-color="#2F5752" stop-opacity=".35"/><stop offset="1" stop-color="#06100F" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="nWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9CC5B9"/><stop offset="1" stop-color="#4F7C73"/></linearGradient>' +
        '<linearGradient id="nFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D1A19" stop-opacity="0"/><stop offset="1" stop-color="#030707"/></linearGradient>' +
        '<radialGradient id="nFog" cx="600" cy="330" r="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#16302D" stop-opacity=".0"/><stop offset=".6" stop-color="#050C0B" stop-opacity=".25"/><stop offset="1" stop-color="#020504" stop-opacity=".85"/></radialGradient>' +
      '</defs>' +
      '<rect width="1200" height="800" fill="url(#nGlow)"/>' +
      '<g opacity=".8"><path d="M560 330 V210 C560 170 580 140 600 122 C620 140 640 170 640 210 V330 Z" fill="url(#nWin)" opacity=".7"/>' +
      '<path d="M600 196 V330 M560 262 H640" stroke="#0B1716" stroke-width="5" fill="none"/><circle cx="600" cy="170" r="22" stroke="#0B1716" stroke-width="5" fill="none"/><path d="M600 148 V192 M578 170 H622" stroke="#0B1716" stroke-width="3"/></g>' +
      '<path d="M0 800 L1200 800 L640 330 L560 330 Z" fill="url(#nFloor)"/>' +
      pews + cols + arches +
      '<rect width="1200" height="800" fill="url(#nFog)"/>' +
      '</svg>';
    return toSvg(markup);
  };

  /* =====================================================================
     THE CONGREGATION · back view and front view in one figure
     ===================================================================== */
  art.drowned = function (seed) {
    var R = rng(seed * 97 + 13), gid = 'dg' + seed;
    var lean = (R() - 0.5) * 6, hx = 50 + lean * 0.4, hy = 42, hw = 13.5 + R() * 2.5, hh = hw * 1.28;
    var head = 'M' + n1(hx - hw) + ' ' + n1(hy - 2) + ' C' + n1(hx - hw) + ' ' + n1(hy - hh * 1.05) + ' ' + n1(hx + hw) + ' ' + n1(hy - hh * 1.05) + ' ' + n1(hx + hw) + ' ' + n1(hy - 2) +
      ' C' + n1(hx + hw) + ' ' + n1(hy + hh * 0.55) + ' ' + n1(hx + hw * 0.45) + ' ' + n1(hy + hh) + ' ' + n1(hx) + ' ' + n1(hy + hh) +
      ' C' + n1(hx - hw * 0.45) + ' ' + n1(hy + hh) + ' ' + n1(hx - hw) + ' ' + n1(hy + hh * 0.55) + ' ' + n1(hx - hw) + ' ' + n1(hy - 2) + 'Z';
    var body = 'M10 172 C12 124 28 90 ' + n1(hx - 12) + ' 76 C' + n1(hx - 6) + ' 71 ' + n1(hx + 6) + ' 71 ' + n1(hx + 12) + ' 76 C72 90 88 124 90 172 Z';
    function strands(n, x0, x1, top, minLen, maxLen, spread, w0, w1) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var t = n > 1 ? i / (n - 1) : 0.5, sx = x0 + (x1 - x0) * t + (R() - 0.5) * 2, len = minLen + R() * (maxLen - minLen);
        var ex = sx + (sx - hx) * spread + (R() - 0.5) * 8;
        out += '<path d="M' + n1(sx) + ' ' + n1(top) + ' C' + n1(sx + (R() - 0.5) * 6) + ' ' + n1(top + len * 0.35) + ' ' + n1(ex + (R() - 0.5) * 6) + ' ' + n1(top + len * 0.7) + ' ' + n1(ex) + ' ' + n1(top + len) + '" stroke-width="' + n1(w0 + R() * (w1 - w0)) + '" opacity="' + n1(0.6 + R() * 0.4) + '"/>';
      }
      return out;
    }
    var back = strands(22, hx - hw * 1.05, hx + hw * 1.05, hy - hh * 0.85, 60, 120, 0.25, 1.2, 3.4);
    function framing(side, n) {
      var out = '';
      for (var i = 0; i < n; i++) {
        var sx = hx + side * (0.5 + i * 0.35), sy = hy - hh * 0.98 + R() * 1.5;
        var c1x = hx + side * (hw * 0.55 + i * 0.5), c1y = hy - hh * 0.75 + i * 0.4;
        var c2x = hx + side * (hw * (0.85 + R() * 0.25)), c2y = hy + R() * hh * 0.3;
        var ex = hx + side * (hw * (0.9 + R() * 0.6)), ey = hy + hh * (1.6 + R() * 1.8);
        out += '<path d="M' + n1(sx) + ' ' + n1(sy) + ' C' + n1(c1x) + ' ' + n1(c1y) + ' ' + n1(c2x) + ' ' + n1(c2y) + ' ' + n1(ex) + ' ' + n1(ey) + '" stroke-width="' + n1(0.9 + R() * 2.2) + '" opacity="' + n1(0.7 + R() * 0.3) + '"/>';
      }
      return out;
    }
    var frontL = framing(-1, 10), frontR = framing(1, 10);
    var across = '';
    if (R() > 0.4) {
      var ax = hx + (R() - 0.5) * hw * 0.9;
      across = '<path d="M' + n1(hx) + ' ' + n1(hy - hh * 0.95) + ' C' + n1(ax) + ' ' + n1(hy - hh * 0.3) + ' ' + n1(ax + (R() - 0.5) * 6) + ' ' + n1(hy + hh * 0.5) + ' ' + n1(ax + (R() - 0.5) * 8) + ' ' + n1(hy + hh * 2) + '" stroke-width="' + n1(0.6 + R() * 0.8) + '" opacity=".8"/>';
    }
    var eyeOff = (R() - 0.5) * 1.2, ey = hy - 1 + (R() - 0.5) * 1.2, mouthH = 3 + R() * 3.5;
    var markup =
      '<svg viewBox="0 0 100 172" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="' + gid + '" cx="50%" cy="34%" r="70%"><stop offset="0" stop-color="#A9B4A5"/><stop offset=".5" stop-color="#6E7D71"/><stop offset=".85" stop-color="#2E3B34"/><stop offset="1" stop-color="#18221D"/></radialGradient>' +
        '<radialGradient id="' + gid + 's"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#030504" stop-opacity=".95"/><stop offset="1" stop-color="#0B120F" stop-opacity="0"/></radialGradient>' +
        '<filter id="' + gid + 'b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".35"/></filter>' +
      '</defs>' +
      '<path d="' + body + '" fill="#071010" stroke="#16262300" stroke-width="1"/>' +
      '<g class="fig-back"><path d="' + head + '" fill="#0A1312"/><g class="hair" fill="none" stroke="#040908" stroke-linecap="round">' + back + '</g></g>' +
      '<g class="fig-front" filter="url(#' + gid + 'b)">' +
        '<g class="hair" fill="none" stroke="#040908" stroke-linecap="round">' + back + '</g>' +
        '<path d="' + head + '" fill="url(#' + gid + ')"/>' +
        '<ellipse cx="' + n1(hx - 5.6) + '" cy="' + n1(ey) + '" rx="5" ry="4.6" fill="url(#' + gid + 's)"/><ellipse cx="' + n1(hx + 5.6) + '" cy="' + n1(ey + 0.4) + '" rx="5" ry="4.6" fill="url(#' + gid + 's)"/>' +
        '<circle cx="' + n1(hx - 5.6 + eyeOff) + '" cy="' + n1(ey) + '" r=".8" fill="#DCE6D6"/><circle cx="' + n1(hx + 5.6 + eyeOff) + '" cy="' + n1(ey + 0.4) + '" r=".8" fill="#DCE6D6"/>' +
        '<ellipse cx="' + n1(hx) + '" cy="' + n1(hy + hh * 0.55) + '" rx="3.4" ry="' + n1(mouthH) + '" fill="url(#' + gid + 's)"/>' +
        '<g class="hair" fill="none" stroke="#040908" stroke-linecap="round">' + frontL + frontR + across + '</g>' +
      '</g>' +
      '</svg>';
    return toSvg(markup);
  };

  art.handprint = function (seed) {
    var R = rng(seed + 300), id = 'hp' + seed;
    var drips = '';
    for (var i = 0; i < 5; i++) {
      var x = 28 + R() * 44, y = 92 + R() * 10;
      drips += '<path d="M' + n1(x) + ' ' + n1(y) + ' q' + n1((R() - 0.5) * 3) + ' ' + n1(12 + R() * 20) + ' 0 ' + n1(18 + R() * 30) + '" stroke-width="' + n1(1.2 + R() * 2) + '"/>';
    }
    var markup =
      '<svg viewBox="0 0 100 150" aria-hidden="true">' +
      '<defs><filter id="' + id + '" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="' + seed + '" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feGaussianBlur in="d" stdDeviation="1.8"/></filter></defs>' +
      '<g fill="#C9D8CF" fill-opacity=".55" filter="url(#' + id + ')">' +
        '<ellipse cx="50" cy="80" rx="25" ry="23"/>' +
        '<rect x="23" y="26" width="10" height="42" rx="5" transform="rotate(-9 28 47)"/>' +
        '<rect x="37" y="13" width="11" height="52" rx="5.5"/>' +
        '<rect x="53" y="15" width="11" height="50" rx="5.5"/>' +
        '<rect x="67" y="27" width="9.5" height="40" rx="4.8" transform="rotate(9 72 47)"/>' +
        '<rect x="73" y="64" width="10" height="30" rx="5" transform="rotate(50 78 79)"/>' +
      '</g>' +
      '<g fill="none" stroke="#C9D8CF" stroke-opacity=".5" stroke-linecap="round" filter="url(#' + id + ')">' + drips + '</g>' +
      '</svg>';
    return toSvg(markup);
  };

  /* =====================================================================
     THE FACE AT THE BOTTOM
     ===================================================================== */
  art.scareFace = function (px) {
    var R = rng(66), id = function (n) { return px + n; };
    function clumps(count, perClump, xFrom, xTo, yTop, yEndMin, yEndMax, splay, wMin, wMax) {
      var out = '';
      for (var c = 0; c < count; c++) {
        var t = count > 1 ? c / (count - 1) : 0.5, cx = xFrom + (xTo - xFrom) * t + (R() - 0.5) * 14;
        var endY = yEndMin + R() * (yEndMax - yEndMin), drift = (cx - 300) * splay + (R() - 0.5) * 40;
        for (var s = 0; s < perClump; s++) {
          var sx = cx + (R() - 0.5) * 10, ex = sx + drift + (R() - 0.5) * 16;
          var y0 = yTop + R() * 14;
          out += '<path d="M' + n1(sx) + ' ' + n1(y0) + ' C' + n1(sx + drift * 0.15 + (R() - 0.5) * 10) + ' ' + n1(y0 + (endY - y0) * 0.33) + ' ' + n1(ex - drift * 0.2 + (R() - 0.5) * 12) + ' ' + n1(y0 + (endY - y0) * 0.7) + ' ' + n1(ex) + ' ' + n1(endY) +
            '" stroke-width="' + n1(wMin + R() * (wMax - wMin)) + '" opacity="' + n1(0.55 + R() * 0.45) + '"/>';
        }
      }
      return out;
    }
    var hairBack = clumps(30, 5, 140, 460, 70, 640, 780, 0.55, 1.4, 4.5);
    function frame(side, count) {
      var out = '';
      for (var c = 0; c < count; c++) {
        var t = c / (count - 1);
        var ox = 300 + side * (6 + t * 26), oy = 92 + R() * 8;
        var c1x = 300 + side * (70 + t * 60), c1y = 112 + t * 40;
        var c2x = 300 + side * (150 + t * 30 + R() * 20), c2y = 250 + R() * 90;
        var ex = 300 + side * (160 + t * 70 + R() * 40), ey = 560 + R() * 220;
        for (var k = 0; k < 4; k++) {
          var j = (R() - 0.5) * 12;
          out += '<path d="M' + n1(ox + j * 0.3) + ' ' + n1(oy) + ' C' + n1(c1x + j) + ' ' + n1(c1y + j) + ' ' + n1(c2x + j) + ' ' + n1(c2y) + ' ' + n1(ex + j * 1.5) + ' ' + n1(ey) +
            '" stroke-width="' + n1(1 + R() * 3.4) + '" opacity="' + n1(0.65 + R() * 0.35) + '"/>';
        }
      }
      return out;
    }
    var hairFrontL = frame(-1, 11), hairFrontR = frame(1, 11);
    // two wet clumps fall across the face, one over the left eye
    var across = '';
    [[286, 94, 214, 700, 5], [318, 98, 360, 740, 3]].forEach(function (c) {
      for (var s = 0; s < c[4]; s++) {
        var sx = c[0] + (R() - 0.5) * 12, ex = c[2] + (R() - 0.5) * 30;
        across += '<path d="M' + n1(sx) + ' ' + n1(c[1]) + ' C' + n1(sx - 10 + R() * 8) + ' ' + n1(260) + ' ' + n1(ex + 14 - R() * 10) + ' ' + n1(420) + ' ' + n1(ex) + ' ' + n1(c[3]) + '" stroke-width="' + n1(0.8 + R() * 2.4) + '" opacity="' + n1(0.6 + R() * 0.4) + '"/>';
      }
    });
    var veins = '';
    function vein(x, y, a, len, depth) {
      if (depth <= 0 || len < 5) return;
      var x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
      veins += '<path d="M' + n1(x) + ' ' + n1(y) + ' Q' + n1((x + x2) / 2 + (R() - 0.5) * 8) + ' ' + n1((y + y2) / 2 + (R() - 0.5) * 8) + ' ' + n1(x2) + ' ' + n1(y2) + '" stroke-width="' + n1(depth * 0.45) + '"/>';
      vein(x2, y2, a + (R() - 0.5) * 0.8, len * 0.7, depth - 1);
      if (R() > 0.4) vein(x2, y2, a + (R() > 0.5 ? 0.7 : -0.7), len * 0.55, depth - 1);
    }
    vein(186, 400, -0.5, 34, 4); vein(414, 410, -2.6, 36, 4); vein(262, 176, 0.4, 26, 3); vein(370, 600, -2, 28, 3); vein(318, 150, 1.4, 22, 3); vein(230, 560, -1, 24, 3);
    var face = 'M300 96 C404 98 462 200 460 330 C458 452 420 560 372 620 C346 652 324 668 300 670 C272 668 248 650 226 620 C178 556 140 452 138 330 C136 200 194 96 300 96 Z';
    // the part of the face the hair leaves uncovered
    var opening = 'M300 120 C258 124 210 164 184 232 C164 292 163 382 174 452 C188 540 224 612 262 650 C278 664 292 670 300 670 C310 670 324 662 340 648 C378 610 412 540 426 452 C437 382 436 292 416 232 C390 164 342 124 300 120 Z';
    var hairMass = 'M60 40 H540 V760 H60 Z ' + opening;
    function eye(cx, cy, look) {
      return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="72" ry="58" fill="url(#' + id('Sock') + ')"/>' +
        '<ellipse cx="' + cx + '" cy="' + (cy + 6) + '" rx="27" ry="17" fill="url(#' + id('Eye') + ')"/>' +
        '<circle cx="' + (cx + look) + '" cy="' + (cy + 5) + '" r="10" fill="#7E887B" opacity=".55"/>' +
        '<circle cx="' + (cx + look) + '" cy="' + (cy + 5) + '" r="3.4" fill="#020302"/>' +
        '<circle cx="' + (cx + look + 3) + '" cy="' + (cy + 2) + '" r="1.3" fill="#EEF3EA" opacity=".85"/>' +
        '<path d="M' + (cx - 34) + ' ' + (cy + 2) + ' Q' + cx + ' ' + (cy - 22) + ' ' + (cx + 34) + ' ' + (cy + 2) + '" stroke="#050807" stroke-width="9" fill="none" opacity=".75" filter="url(#' + id('Soft') + ')"/>' +
        '<path d="M' + (cx - 28) + ' ' + (cy + 18) + ' Q' + cx + ' ' + (cy + 30) + ' ' + (cx + 28) + ' ' + (cy + 18) + '" stroke="#5A2A26" stroke-width="3" fill="none" opacity=".45" filter="url(#' + id('Soft') + ')"/>';
    }
    var markup =
      '<svg viewBox="0 0 600 760" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="' + id('Skin') + '" cx="50%" cy="34%" r="66%"><stop offset="0" stop-color="#D3D8C6"/><stop offset=".33" stop-color="#ADB7A5"/><stop offset=".62" stop-color="#6E7C6F"/><stop offset=".88" stop-color="#2D3932"/><stop offset="1" stop-color="#111814"/></radialGradient>' +
        '<linearGradient id="' + id('Light') + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F0E6" stop-opacity=".08"/><stop offset=".45" stop-color="#E4F0E6" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>' +
        '<radialGradient id="' + id('Sock') + '"><stop offset="0" stop-color="#000"/><stop offset=".45" stop-color="#040605" stop-opacity=".96"/><stop offset=".75" stop-color="#151E19" stop-opacity=".55"/><stop offset="1" stop-color="#151E19" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + id('Eye') + '" cx="44%" cy="38%" r="65%"><stop offset="0" stop-color="#BCC2B1"/><stop offset=".55" stop-color="#868F80"/><stop offset="1" stop-color="#363F37"/></radialGradient>' +
        '<radialGradient id="' + id('Hollow') + '"><stop offset="0" stop-color="#0D1411" stop-opacity=".6"/><stop offset="1" stop-color="#0D1411" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="' + id('Mouth') + '" cx="50%" cy="42%" r="58%"><stop offset="0" stop-color="#000"/><stop offset=".78" stop-color="#030504"/><stop offset="1" stop-color="#1F2924"/></radialGradient>' +
        '<radialGradient id="' + id('Vig') + '" cx="50%" cy="46%" r="64%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".96"/></radialGradient>' +
        '<filter id="' + id('Warp') + '" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".006 .011" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="w"/><feGaussianBlur in="w" stdDeviation=".7"/></filter>' +
        '<filter id="' + id('Soft') + '" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>' +
        '<filter id="' + id('Mottle') + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="4" seed="4" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .08  0 0 0 0 .14  0 0 0 0 .11  0 0 0 -2.4 1.3"/><feComposite in2="SourceGraphic" operator="in"/></filter>' +
        '<filter id="' + id('Grain') + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 .7  0 0 0 0 .75  0 0 0 0 .72  0 0 0 .22 0"/></filter>' +
        '<clipPath id="' + id('Clip') + '"><path d="' + face + '"/></clipPath>' +
        '<clipPath id="' + id('Open') + '"><path d="' + opening + '"/></clipPath>' +
        '<clipPath id="' + id('HairClip') + '"><path d="M300 70 C430 70 500 200 500 340 C500 520 470 700 520 760 H80 C130 700 100 520 100 340 C100 200 170 70 300 70 Z"/></clipPath>' +
        '<radialGradient id="' + id('HairG') + '" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#121A17"/><stop offset=".4" stop-color="#070B0A"/><stop offset="1" stop-color="#000"/></radialGradient>' +
        '<filter id="' + id('Shade') + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>' +
      '</defs>' +
      '<rect width="600" height="760" fill="#000"/>' +
      '<g filter="url(#' + id('Warp') + ')">' +
        '<g fill="none" stroke="#050807" stroke-linecap="round">' + hairBack + '</g>' +
        '<path d="' + face + '" fill="url(#' + id('Skin') + ')"/>' +
        '<g clip-path="url(#' + id('Clip') + ')">' +
          '<rect width="600" height="760" fill="#3A4841" filter="url(#' + id('Mottle') + ')" opacity=".6"/>' +
          '<ellipse cx="196" cy="476" rx="58" ry="92" fill="url(#' + id('Hollow') + ')"/><ellipse cx="404" cy="480" rx="58" ry="92" fill="url(#' + id('Hollow') + ')"/>' +
          '<ellipse cx="300" cy="200" rx="90" ry="40" fill="url(#' + id('Hollow') + ')" opacity=".35"/>' +
          '<g fill="none" stroke="#22362D" stroke-linecap="round" opacity=".4">' + veins + '</g>' +
          '<path d="M300 352 C292 400 286 438 290 462 C296 470 304 470 312 464" fill="none" stroke="#1C2621" stroke-width="10" opacity=".35" filter="url(#' + id('Soft') + ')"/>' +
          '<rect width="600" height="760" fill="url(#' + id('Light') + ')"/>' +
          '<path d="' + opening + '" fill="none" stroke="#060908" stroke-width="56" opacity=".75" filter="url(#' + id('Shade') + ')"/>' +
        '</g>' +
        eye(232, 326, 2) + eye(370, 331, -1) +
        '<ellipse cx="286" cy="466" rx="7" ry="3.6" fill="#050706" transform="rotate(-18 286 466)" filter="url(#' + id('Soft') + ')"/><ellipse cx="314" cy="466" rx="7" ry="3.6" fill="#050706" transform="rotate(18 314 466)" filter="url(#' + id('Soft') + ')"/>' +
        '<path d="M254 524 C264 500 340 500 350 526 C362 590 338 652 302 662 C264 652 240 592 254 524 Z" fill="url(#' + id('Mouth') + ')"/>' +
        '<path d="M254 524 C264 500 340 500 350 526 C362 590 338 652 302 662 C264 652 240 592 254 524 Z" fill="none" stroke="#56656A" stroke-width="5" opacity=".7" filter="url(#' + id('Soft') + ')"/>' +
        '<path d="' + hairMass + '" fill="url(#' + id('HairG') + ')" fill-rule="evenodd" clip-path="url(#' + id('HairClip') + ')"/>' +
        '<g fill="none" stroke="#141D19" stroke-linecap="round" opacity=".9">' + hairFrontL + hairFrontR + '</g>' +
        '<g fill="none" stroke="#040606" stroke-linecap="round">' + across + '</g>' +
      '</g>' +
      '<rect width="600" height="760" filter="url(#' + id('Grain') + ')" clip-path="url(#' + id('Open') + ')"/>' +
      '<rect width="600" height="760" fill="url(#' + id('Vig') + ')"/>' +
      '</svg>';
    return toSvg(markup);
  };

  /* ---------- mount everything that is static ---------- */
  function mount() {
    var hero = document.getElementById('heroScene');
    if (hero) hero.appendChild(art.hero());
    var map = document.getElementById('map');
    if (map) map.appendChild(art.map());
    Array.prototype.forEach.call(document.querySelectorAll('[data-face]'), function (el) {
      var f = art.face(el.getAttribute('data-face'), el.getAttribute('data-kind') || 'avatar');
      el.appendChild(f.el);
      el._face = f;
    });
  }
  mount();
})();
