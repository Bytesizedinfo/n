/* Hushling · art
   Every picture is generated SVG: the Halo device, parent avatars (the parametric face from Stillwater),
   the nursery in colour and in infrared, the parents' room, the front camera, sprites for the feed,
   and the face at the end. The feed (js/feed.js) rasterises these to canvas. */
(function () {
  'use strict';
  var SW = window.HL;
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
  art.rng = rng;
  function shade(h, amt) {
    var n = parseInt(h.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
    function c(v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }
    return '#' + ((1 << 24) | (c(r) << 16) | (c(g) << 8) | c(b)).toString(16).slice(1);
  }

  /* =====================================================================
     FACES · the parametric face from Stillwater, with parents this time
     ===================================================================== */
  var PRESETS = {
    hannah: { skin: '#F1CDB2', hair: '#7A4B2E', style: 'bob', top: '#8C95C9', bg: '#E4E6F2' },
    tom: { skin: '#C68E64', hair: '#1E1714', style: 'crop', top: '#4A57B8', bg: '#E7E3EE', beard: 0.6 },
    ruth: { skin: '#8C5B3E', hair: '#1F1A17', style: 'long', top: '#F0A95B', bg: '#F3E9DD' },
    dev: { skin: '#B07A55', hair: '#241913', style: 'wave', top: '#5B6B8C', bg: '#E3E8EE', glasses: 1 }
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
    var o = PRESETS[name] || PRESETS.hannah, id = 'f' + (++faceSeq);
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
     THE PRODUCT · Halo, a crescent moon with a camera in it
     ===================================================================== */
  art.halo = function () {
    return toSvg(
      '<svg viewBox="0 0 420 420" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="hgGlow" cx="50%" cy="52%" r="50%"><stop offset="0" stop-color="#F7C77F" stop-opacity=".55"/><stop offset=".55" stop-color="#F7C77F" stop-opacity=".12"/><stop offset="1" stop-color="#F7C77F" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="hgBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#ECEDF4"/><stop offset="1" stop-color="#C9CBDA"/></linearGradient>' +
        '<radialGradient id="hgLens" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#4B5487"/><stop offset=".45" stop-color="#151935"/><stop offset="1" stop-color="#05060F"/></radialGradient>' +
        '<mask id="hgMoon"><rect width="420" height="420" fill="#000"/><circle cx="210" cy="210" r="150" fill="#fff"/><circle cx="268" cy="168" r="128" fill="#000"/></mask>' +
        '<filter id="hgShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#141833" flood-opacity=".35"/></filter>' +
      '</defs>' +
      '<circle cx="210" cy="220" r="205" fill="url(#hgGlow)"/>' +
      '<g filter="url(#hgShadow)"><rect width="420" height="420" fill="url(#hgBody)" mask="url(#hgMoon)"/></g>' +
      '<path d="M86 300 A150 150 0 0 0 330 330" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="3" mask="url(#hgMoon)"/>' +
      '<circle cx="128" cy="270" r="31" fill="#DADCE8"/>' +
      '<circle cx="128" cy="270" r="25" fill="url(#hgLens)"/>' +
      '<circle cx="119" cy="261" r="6" fill="#FFFFFF" opacity=".55"/>' +
      '<g fill="#8E2A2A" opacity=".55">' + [0, 1, 2, 3, 4, 5].map(function (i) { var a = i / 6 * Math.PI * 2; return '<circle cx="' + n1(128 + Math.cos(a) * 37) + '" cy="' + n1(270 + Math.sin(a) * 37) + '" r="2.2"/>'; }).join('') + '</g>' +
      '<circle cx="206" cy="340" r="4.5" fill="#F0A95B"/>' +
      '</svg>');
  };

  /* =====================================================================
     PALETTES · the same nursery through a colour sensor and through infrared
     ===================================================================== */
  var PAL = art.PAL = {
    day: {
      wall: '#5D6585', wallDot: '#7D85A6', skirting: '#4A4F69', floor: '#4E4349', floorLine: '#41373D', rug: '#7B6C88', rugEdge: '#695A76',
      window: '#2C3A5E', windowFrame: '#E1DCD2', moon: '#F2EFE0', curtain: '#8C80A6', curtainShade: '#706689',
      cot: '#ECE5D7', cotShade: '#C7BEAE', mattress: '#F3EFE7', sheet: '#C6D1EA', wardrobe: '#D6CDBE', wardrobeShade: '#B5AB9B',
      gap: '#17151E', hall: '#121119', frame: '#E1DCD2', print: '#2E3453', printMark: '#F2EFE0',
      chair: '#B38962', chairShade: '#8D6949', lamp: '#F7C77F', skin: '#F0C8A4', swaddle: '#F2E2EB', swaddleShade: '#D9C5D2', hair: '#6B4A33',
      nDress: '#25242C', nApron: '#E8E5DE', nSkin: '#E6E0D8', nHair: '#1A191E', nEye: '#2B2A2A', glow: 0,
      bed: '#D9D3E2', bedShade: '#B4ADC0', pillow: '#F1EEF4'
    },
    ir: {
      wall: '#5A635D', wallDot: '#6C766F', skirting: '#47504A', floor: '#3A423D', floorLine: '#2F3632', rug: '#57615A', rugEdge: '#4B544E',
      window: '#9EA9A1', windowFrame: '#C3CDC5', moon: '#EEF3EE', curtain: '#6F7972', curtainShade: '#555F58',
      cot: '#D7E0D8', cotShade: '#AFB9B1', mattress: '#E3EBE4', sheet: '#C3CDC6', wardrobe: '#A8B2AA', wardrobeShade: '#89938B',
      gap: '#040605', hall: '#050706', frame: '#C3CDC5', print: '#3B443E', printMark: '#DCE4DD',
      chair: '#808B83', chairShade: '#656F68', lamp: '#A7B2AA', skin: '#DCE5DD', swaddle: '#E6EEE7', swaddleShade: '#C2CCC4', hair: '#3B443E',
      nDress: '#272D29', nApron: '#DCE5DD', nSkin: '#EEF4EE', nHair: '#0D110F', nEye: '#FFFFFF', glow: 1,
      bed: '#B7C1B9', bedShade: '#939D95', pillow: '#D9E2DA'
    },
    front: {
      wall: '#111727', wallDot: '#161D30', hall: '#06080E', frame: '#1C2438', bed: '#1B2236', bedShade: '#121828', pillow: '#2A3350',
      skin: '#8EA2CB', skinDark: '#2E3A5A', hair: '#0B0E17', shirt: '#1E2742',
      nDress: '#0E1220', nApron: '#56627F', nSkin: '#9AACD0', nHair: '#05070C', nEye: '#E8EEFF', glow: 1
    }
  };

  /* =====================================================================
     SCENES · 1600 × 900, the camera's whole field of view (the feed pans across it)
     ===================================================================== */
  function floorboards(P, y0, y1, vx) {
    var s = '';
    for (var x = -400; x <= 2000; x += 110) s += '<path d="M' + n1(vx + (x - vx) * 0.55) + ' ' + y0 + ' L' + x + ' ' + y1 + '" stroke="' + P.floorLine + '" stroke-width="3"/>';
    return s;
  }
  art.nursery = function (P) {
    var stars = '<pattern id="ns' + (P.glow ? 'i' : 'd') + '" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M22 18 l3 7 7 1 -5 5 1 7 -6-4 -6 4 1-7 -5-5 7-1z" fill="' + P.wallDot + '"/><circle cx="66" cy="62" r="3.5" fill="' + P.wallDot + '"/><path d="M62 20 a7 7 0 1 0 6 11 a6 6 0 1 1 -6 -11z" fill="' + P.wallDot + '"/></pattern>';
    var sid = 'ns' + (P.glow ? 'i' : 'd');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">' +
      '<defs>' + stars +
        '<radialGradient id="lampG" cx="1062" cy="572" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F7C77F" stop-opacity="' + (P.glow ? 0 : 0.45) + '"/><stop offset="1" stop-color="#F7C77F" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + shade(P.floor, -0.2) + '"/><stop offset="1" stop-color="' + P.floor + '"/></linearGradient>' +
      '</defs>' +
      // wall
      '<rect width="1600" height="610" fill="' + P.wall + '"/><rect width="1600" height="600" fill="url(#' + sid + ')" opacity=".55"/>' +
      // window and curtains (left)
      '<rect x="112" y="140" width="220" height="300" fill="' + P.windowFrame + '"/><rect x="126" y="154" width="192" height="272" fill="' + P.window + '"/>' +
      '<circle cx="262" cy="214" r="26" fill="' + P.moon + '" opacity=".9"/>' +
      '<path d="M222 154 V426 M126 290 H318" stroke="' + P.windowFrame + '" stroke-width="10"/>' +
      '<path d="M70 120 C90 260 96 380 84 470 L150 470 C146 360 142 240 150 120 Z" fill="' + P.curtain + '"/><path d="M290 120 C300 240 296 360 292 470 L370 470 C356 380 354 260 372 120 Z" fill="' + P.curtain + '"/>' +
      '<path d="M100 120 C110 260 116 380 104 470" stroke="' + P.curtainShade + '" stroke-width="8" fill="none"/><path d="M330 120 C324 240 326 360 330 470" stroke="' + P.curtainShade + '" stroke-width="8" fill="none"/>' +
      '<rect x="56" y="110" width="332" height="12" rx="6" fill="' + P.curtainShade + '"/>' +
      // framed print above the cot
      '<rect x="712" y="118" width="176" height="150" fill="' + P.frame + '"/><rect x="726" y="132" width="148" height="122" fill="' + P.print + '"/>' +
      '<path d="M820 166 a24 24 0 1 0 14 40 a20 20 0 1 1 -14 -40z" fill="' + P.printMark + '"/><circle cx="760" cy="160" r="3" fill="' + P.printMark + '"/><circle cx="782" cy="214" r="2.5" fill="' + P.printMark + '"/><circle cx="852" cy="236" r="2.5" fill="' + P.printMark + '"/>' +
      // doorway (right), open onto a dark landing
      '<rect x="1378" y="160" width="172" height="446" fill="' + P.frame + '"/><rect x="1392" y="174" width="144" height="432" fill="' + P.hall + '"/>' +
      '<path d="M1536 174 L1592 140 L1592 640 L1536 606 Z" fill="' + P.wardrobeShade + '"/><circle cx="1580" cy="400" r="5" fill="' + P.cotShade + '"/>' +
      // wardrobe, left door ajar
      '<rect x="1086" y="150" width="226" height="22" fill="' + P.wardrobeShade + '"/>' +
      '<rect x="1094" y="170" width="210" height="520" fill="' + P.wardrobe + '"/>' +
      '<rect x="1104" y="182" width="88" height="494" fill="' + shade(P.wardrobe, 0.04) + '"/><rect x="1204" y="182" width="90" height="494" fill="' + shade(P.wardrobe, 0.04) + '"/>' +
      '<rect x="1192" y="182" width="12" height="494" fill="' + P.gap + '"/>' +
      '<rect x="1180" y="400" width="5" height="40" rx="2" fill="' + P.wardrobeShade + '"/><rect x="1212" y="400" width="5" height="40" rx="2" fill="' + P.wardrobeShade + '"/>' +
      // skirting and floor
      '<rect y="598" width="1600" height="12" fill="' + P.skirting + '"/>' +
      '<rect y="610" width="1600" height="290" fill="url(#floorG)"/>' + floorboards(P, 610, 900, 800) +
      '<ellipse cx="800" cy="800" rx="560" ry="96" fill="' + P.rugEdge + '"/><ellipse cx="800" cy="800" rx="530" ry="84" fill="' + P.rug + '"/>' +
      // nightlight in the socket
      '<circle cx="1062" cy="572" r="260" fill="url(#lampG)"/><rect x="1052" y="560" width="20" height="26" rx="5" fill="' + P.lamp + '"/>' +
      '<ellipse cx="800" cy="796" rx="290" ry="26" fill="#000" opacity=".22"/>' +
      '</svg>';
  };
  /** the cot and the mobile's arm, on their own layer */
  art.cot = function (P) {
    var bars = '', backBars = '';
    for (var x = 590; x <= 1012; x += 28) backBars += '<rect x="' + x + '" y="440" width="9" height="32" fill="' + P.cotShade + '"/>';
    for (var bx = 580; bx <= 1022; bx += 31) bars += '<rect x="' + bx + '" y="600" width="12" height="150" rx="5" fill="' + P.cot + '"/><rect x="' + (bx + 8) + '" y="600" width="4" height="150" fill="' + P.cotShade + '"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">' +
      '<rect x="562" y="400" width="16" height="400" rx="6" fill="' + P.cotShade + '"/><rect x="1022" y="400" width="16" height="400" rx="6" fill="' + P.cotShade + '"/>' +
      '<rect x="574" y="424" width="452" height="18" rx="6" fill="' + P.cot + '"/>' + backBars +
      '<path d="M606 470 L994 470 L1028 592 L572 592 Z" fill="' + P.mattress + '"/><path d="M620 478 L980 478 L1006 572 L594 572 Z" fill="' + P.sheet + '" opacity=".55"/>' +
      '<rect x="556" y="584" width="488" height="18" rx="6" fill="' + P.cot + '"/>' + bars +
      '<rect x="556" y="746" width="488" height="16" rx="6" fill="' + P.cot + '"/>' +
      '<rect x="546" y="372" width="22" height="430" rx="8" fill="' + P.cot + '"/><rect x="1032" y="372" width="22" height="430" rx="8" fill="' + P.cot + '"/>' +
      '<circle cx="557" cy="368" r="14" fill="' + P.cot + '"/><circle cx="1043" cy="368" r="14" fill="' + P.cot + '"/>' +
      // the mobile's arm
      '<path d="M1043 372 V250 H800 V268" fill="none" stroke="' + P.cotShade + '" stroke-width="8" stroke-linecap="round"/><circle cx="800" cy="272" r="10" fill="' + P.cot + '"/>' +
      '</svg>';
  };

  art.parents = function (P) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">' +
      '<rect width="1600" height="620" fill="' + P.wall + '"/><rect y="610" width="1600" height="290" fill="' + P.floor + '"/>' + floorboards(P, 620, 900, 800) +
      '<rect y="606" width="1600" height="12" fill="' + P.skirting + '"/>' +
      // curtains closed (left) and the door (right)
      '<rect x="60" y="90" width="300" height="420" fill="' + P.curtain + '"/><path d="M110 90 V510 M170 90 V510 M240 90 V510 M300 90 V510" stroke="' + P.curtainShade + '" stroke-width="10"/>' +
      '<rect x="1360" y="150" width="190" height="460" fill="' + P.frame + '"/><rect x="1374" y="164" width="162" height="446" fill="' + P.hall + '"/>' +
      // bed
      '<rect x="430" y="250" width="740" height="290" rx="26" fill="' + P.bedShade + '"/><rect x="452" y="272" width="696" height="240" rx="18" fill="' + P.bed + '"/>' +
      '<ellipse cx="620" cy="482" rx="118" ry="40" fill="' + P.pillow + '"/><ellipse cx="980" cy="482" rx="118" ry="40" fill="' + P.pillow + '"/>' +
      '<path d="M400 520 L1200 520 L1250 840 L350 840 Z" fill="' + P.bed + '"/><path d="M400 520 L1200 520 L1210 580 L390 580 Z" fill="' + P.pillow + '" opacity=".7"/>' +
      // two sleepers: one turned away, one lit by a phone
      '<ellipse cx="610" cy="470" rx="46" ry="38" fill="' + P.hair + '"/><path d="M480 560 C520 520 700 520 760 560 C780 640 760 720 700 760 L500 760 C460 700 460 620 480 560Z" fill="' + P.bedShade + '" opacity=".75"/>' +
      '<ellipse cx="990" cy="462" rx="44" ry="40" fill="' + P.skin + '"/><path d="M948 450 C952 420 1030 416 1034 452 C1020 436 960 436 948 450Z" fill="' + P.hair + '"/>' +
      '<path d="M860 560 C900 520 1080 520 1120 560 C1140 640 1120 720 1060 760 L880 760 C840 700 840 620 860 560Z" fill="' + P.bedShade + '" opacity=".75"/>' +
      '<rect x="968" y="520" width="44" height="70" rx="8" fill="#FFFFFF" opacity=".95"/><circle cx="990" cy="520" r="90" fill="#FFFFFF" opacity=".12"/>' +
      // bedside table
      '<rect x="1220" y="560" width="120" height="200" fill="' + P.wardrobeShade + '"/><rect x="1210" y="552" width="140" height="16" fill="' + P.wardrobe + '"/>' +
      '</svg>';
  };

  art.front = function (P) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">' +
      '<defs><radialGradient id="frG" cx="800" cy="980" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A4A78" stop-opacity=".55"/><stop offset="1" stop-color="#3A4A78" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1600" height="900" fill="' + P.wall + '"/>' +
      '<rect x="1160" y="140" width="190" height="520" fill="' + P.frame + '"/><rect x="1176" y="156" width="158" height="504" fill="' + P.hall + '"/>' +
      '<rect x="240" y="300" width="1120" height="320" rx="30" fill="' + P.bedShade + '"/>' +
      '<rect y="640" width="1600" height="260" fill="' + P.bed + '"/><ellipse cx="800" cy="680" rx="520" ry="80" fill="' + P.pillow + '" opacity=".6"/>' +
      '<rect width="1600" height="900" fill="url(#frG)"/>' +
      '</svg>';
  };

  /* =====================================================================
     SPRITES · drawn over a scene by the feed, in scene coordinates
     ===================================================================== */
  function babySvg(state, P) {
    var g = P.glow;
    var head, eyes = '';
    if (state === 'gone') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">' +
        '<path d="M70 70 C90 40 170 40 230 58 C250 70 236 92 200 96 C150 100 110 98 80 92 C60 88 58 80 70 70Z" fill="' + P.swaddle + '"/>' +
        '<path d="M100 70 C130 60 170 62 200 72 M120 84 C150 80 180 82 200 86" stroke="' + P.swaddleShade + '" stroke-width="4" fill="none"/>' +
        '<ellipse cx="50" cy="66" rx="34" ry="20" fill="' + P.swaddleShade + '" opacity=".5"/></svg>';
    }
    if (state === 'look') {
      eyes = g
        ? '<circle cx="36" cy="58" r="4.2" fill="#FFFFFF"/><circle cx="58" cy="58" r="4.2" fill="#FFFFFF"/>'
        : '<circle cx="36" cy="58" r="3.4" fill="#2A2224"/><circle cx="58" cy="58" r="3.4" fill="#2A2224"/>';
    } else {
      eyes = '<path d="M30 60 q6 4 12 0 M52 60 q6 4 12 0" stroke="#6B4A3C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    }
    head = '<circle cx="47" cy="62" r="29" fill="' + P.skin + '"/><path d="M24 48 C30 30 62 28 72 46 C62 40 40 40 24 48Z" fill="' + P.hair + '"/>' + eyes;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">' +
      '<ellipse cx="150" cy="68" rx="112" ry="38" fill="' + P.swaddle + '"/>' +
      '<path d="M80 50 C120 70 190 70 250 56 M90 88 C140 76 200 78 250 84" stroke="' + P.swaddleShade + '" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      head + '</svg>';
  }
  function mobileSvg(i, P) {
    var shapes = [
      '<path d="M30 8 a22 22 0 1 0 16 36 a18 18 0 1 1 -16 -36z" fill="' + (P.glow ? '#CFD8D0' : '#F3D58C') + '"/>',
      '<path d="M30 6 l6 15 16 1 -12 10 4 16 -14 -9 -14 9 4 -16 -12 -10 16 -1z" fill="' + (P.glow ? '#BFC9C1' : '#BFD0F2') + '"/>',
      '<path d="M12 40 a12 12 0 0 1 8 -22 a16 16 0 0 1 28 4 a11 11 0 0 1 2 22 z" fill="' + (P.glow ? '#E3EBE4' : '#F6F2F7') + '"/>',
      '<path d="M8 34 C18 18 34 18 40 28 L54 20 L48 34 C40 46 18 46 8 34Z" fill="' + (P.glow ? '#AEB8B0' : '#E7B0B9') + '"/>'
    ];
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">' + shapes[i % 4] + '</svg>';
  }
  function chairSvg(P) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 340" width="260" height="340">' +
      '<path d="M20 312 C80 336 180 336 240 312" stroke="' + P.chairShade + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
      '<rect x="44" y="190" width="12" height="122" fill="' + P.chairShade + '"/><rect x="204" y="190" width="12" height="122" fill="' + P.chairShade + '"/>' +
      '<rect x="30" y="176" width="200" height="26" rx="8" fill="' + P.chair + '"/>' +
      '<rect x="44" y="18" width="14" height="172" rx="6" fill="' + P.chair + '"/><rect x="202" y="18" width="14" height="172" rx="6" fill="' + P.chair + '"/>' +
      '<rect x="44" y="18" width="172" height="20" rx="8" fill="' + P.chair + '"/>' +
      [86, 116, 146, 176].map(function (x) { return '<rect x="' + x + '" y="38" width="8" height="140" fill="' + P.chairShade + '"/>'; }).join('') +
      '<path d="M30 120 H70 M190 120 H230" stroke="' + P.chair + '" stroke-width="12" stroke-linecap="round"/>' +
      '</svg>';
  }
  /* Nanny: tall, in an old-fashioned uniform. In infrared her eyes catch the light. */
  function nannySvg(pose, P) {
    var g = P.glow, id = 'nn' + pose + (g ? 'i' : 'd');
    var eyeFill = P.nEye;
    var glowDef = '<filter id="' + id + 'g" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="' + (g ? 4.5 : 0.01) + '" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    if (pose === 'head') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 460" width="400" height="460"><defs>' + glowDef +
        '<radialGradient id="' + id + 'f" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="' + P.nSkin + '"/><stop offset="1" stop-color="' + shade(P.nSkin, -0.55) + '"/></radialGradient></defs>' +
        '<path d="M40 460 C60 380 120 340 200 336 C280 340 340 380 360 460Z" fill="' + P.nDress + '"/><path d="M150 350 L200 400 L250 350 L240 340 L200 372 L160 340Z" fill="' + P.nApron + '"/>' +
        '<rect x="176" y="270" width="48" height="80" fill="' + shade(P.nSkin, -0.35) + '"/>' +
        '<ellipse cx="200" cy="190" rx="92" ry="118" fill="url(#' + id + 'f)" transform="rotate(-8 200 190)"/>' +
        '<path d="M110 160 C110 70 290 60 296 160 C280 110 250 96 200 98 C150 96 122 110 110 160Z" fill="' + P.nHair + '"/><ellipse cx="200" cy="74" rx="46" ry="30" fill="' + P.nHair + '"/>' +
        '<path d="M150 78 L250 78 L238 50 L162 50Z" fill="' + P.nApron + '"/>' +
        '<ellipse cx="164" cy="188" rx="20" ry="14" fill="#05060A" opacity=".85"/><ellipse cx="236" cy="184" rx="20" ry="14" fill="#05060A" opacity=".85"/>' +
        '<g filter="url(#' + id + 'g)"><circle cx="166" cy="188" r="7" fill="' + eyeFill + '"/><circle cx="234" cy="184" r="7" fill="' + eyeFill + '"/></g>' +
        '<path d="M156 254 Q200 284 244 250" stroke="#05060A" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '</svg>';
    }
    var head = function (cx, cy, rot) {
      return '<g transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')">' +
        '<ellipse cx="' + cx + '" cy="' + cy + '" rx="25" ry="33" fill="' + P.nSkin + '"/>' +
        '<path d="M' + (cx - 26) + ' ' + (cy - 4) + ' C' + (cx - 28) + ' ' + (cy - 40) + ' ' + (cx + 28) + ' ' + (cy - 40) + ' ' + (cx + 26) + ' ' + (cy - 4) + ' C' + (cx + 18) + ' ' + (cy - 24) + ' ' + (cx - 18) + ' ' + (cy - 24) + ' ' + (cx - 26) + ' ' + (cy - 4) + 'Z" fill="' + P.nHair + '"/>' +
        '<ellipse cx="' + cx + '" cy="' + (cy - 34) + '" rx="15" ry="10" fill="' + P.nHair + '"/>' +
        '<path d="M' + (cx - 17) + ' ' + (cy - 30) + ' L' + (cx + 17) + ' ' + (cy - 30) + ' L' + (cx + 13) + ' ' + (cy - 40) + ' L' + (cx - 13) + ' ' + (cy - 40) + 'Z" fill="' + P.nApron + '"/>' +
        '<g filter="url(#' + id + 'g)"><circle cx="' + (cx - 9) + '" cy="' + (cy + 1) + '" r="' + (g ? 4.4 : 2.6) + '" fill="' + eyeFill + '"/><circle cx="' + (cx + 9) + '" cy="' + (cy + 1) + '" r="' + (g ? 4.4 : 2.6) + '" fill="' + eyeFill + '"/></g>' +
        '<path d="M' + (cx - 9) + ' ' + (cy + 17) + ' Q' + cx + ' ' + (cy + 22) + ' ' + (cx + 9) + ' ' + (cy + 16) + '" stroke="' + shade(P.nSkin, -0.6) + '" stroke-width="2.4" fill="none"/>' +
        '</g>';
    };
    var dress = '<path d="M80 150 C70 220 60 360 40 560 L180 560 C160 360 150 220 140 150 Z" fill="' + P.nDress + '"/>' +
      '<path d="M84 236 L136 236 L150 430 L70 430 Z" fill="' + P.nApron + '"/><path d="M92 150 L128 150 L132 236 L88 236 Z" fill="' + P.nApron + '"/>' +
      '<path d="M88 146 Q110 160 132 146 L128 140 Q110 150 92 140 Z" fill="' + P.nApron + '"/>';
    var neck = '<rect x="102" y="96" width="16" height="56" fill="' + shade(P.nSkin, -0.18) + '"/>';
    var arms, body;
    if (pose === 'lean') {
      var bent = '<path d="M36 560 C46 430 58 330 74 266 C100 248 160 248 186 266 C202 330 214 430 224 560 Z" fill="' + P.nDress + '"/>' +
        '<path d="M98 266 L162 266 L170 340 L90 340 Z" fill="' + P.nApron + '"/>';
      arms = '<path d="M80 270 C60 292 48 318 40 346" stroke="' + P.nDress + '" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M180 270 C200 292 212 318 220 346" stroke="' + P.nDress + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
        '<path d="M40 346 l-10 14 M40 346 l-2 18 M40 346 l7 16 M220 346 l10 14 M220 346 l2 18 M220 346 l-7 16" stroke="' + P.nSkin + '" stroke-width="4.5" stroke-linecap="round"/>';
      body = bent + arms + '<g transform="translate(130 232) scale(1.3) translate(-130 -232)">' + head(130, 232, 16) + '</g>';
    } else if (pose === 'hold') {
      arms = '<path d="M84 160 C70 210 78 240 110 250 C140 256 150 236 136 160" stroke="' + P.nDress + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="112" cy="228" rx="40" ry="22" fill="' + (g ? '#E6EEE7' : '#F2E2EB') + '"/><circle cx="82" cy="222" r="13" fill="' + (g ? '#DCE5DD' : '#F0C8A4') + '"/>';
      body = dress + neck + arms + head(110, 64, -6);
    } else {
      arms = '<path d="M84 160 C66 250 60 340 62 440" stroke="' + P.nDress + '" stroke-width="13" fill="none" stroke-linecap="round"/><path d="M136 160 C154 250 160 340 158 440" stroke="' + P.nDress + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<path d="M62 440 l-6 40 M62 440 l2 42 M62 440 l9 38 M158 440 l6 40 M158 440 l-2 42 M158 440 l-9 38" stroke="' + P.nSkin + '" stroke-width="4" stroke-linecap="round"/>';
      body = dress + neck + arms + head(110, 64, pose === 'tilt' ? 16 : 4);
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 560" width="260" height="560"><defs>' + glowDef + '</defs>' + body + '</svg>';
  }
  function viewerSvg(P) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 700" width="900" height="700">' +
      '<defs><radialGradient id="vwG" cx="450" cy="470" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#5D6E97"/><stop offset=".45" stop-color="#27304C"/><stop offset="1" stop-color="#0B0E18"/></radialGradient>' +
      '<radialGradient id="vwS" cx="450" cy="560" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2B3658"/><stop offset="1" stop-color="#080A12"/></radialGradient>' +
      '</defs>' +
      '<g>' +
      '<path d="M40 700 C70 560 230 500 450 496 C670 500 830 560 860 700Z" fill="url(#vwS)"/>' +
      '<rect x="392" y="400" width="116" height="120" fill="#141A2C"/>' +
      '<ellipse cx="450" cy="300" rx="150" ry="192" fill="url(#vwG)"/>' +
      '<path d="M296 290 C278 90 622 80 604 290 C590 170 530 128 450 126 C370 128 310 170 296 290Z" fill="#06080F"/>' +
      '<ellipse cx="394" cy="318" rx="40" ry="20" fill="#0A0D17" opacity=".7"/><ellipse cx="506" cy="318" rx="40" ry="20" fill="#0A0D17" opacity=".7"/>' +
      '<path d="M380 438 Q450 456 520 438 Q450 470 380 438Z" fill="#7C8DB6" opacity=".35"/>' +
      '</g></svg>';
  }
  function eyeSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40"><defs><filter id="eg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
      '<circle cx="20" cy="20" r="8" fill="#FFFFFF" filter="url(#eg)"/><circle cx="20" cy="20" r="4" fill="#FFFFFF"/></svg>';
  }

  /* everything the feed can draw, by key */
  art.sprites = {
    'scene:nursery:day': function () { return art.nursery(PAL.day); },
    'scene:nursery:ir': function () { return art.nursery(PAL.ir); },
    'cot:day': function () { return art.cot(PAL.day); },
    'cot:ir': function () { return art.cot(PAL.ir); },
    'scene:parents:ir': function () { return art.parents(PAL.ir); },
    'scene:front': function () { return art.front(PAL.front); },
    'baby:sleep:day': function () { return babySvg('sleep', PAL.day); },
    'baby:sleep:ir': function () { return babySvg('sleep', PAL.ir); },
    'baby:look:day': function () { return babySvg('look', PAL.day); },
    'baby:look:ir': function () { return babySvg('look', PAL.ir); },
    'baby:gone:day': function () { return babySvg('gone', PAL.day); },
    'baby:gone:ir': function () { return babySvg('gone', PAL.ir); },
    'chair:day': function () { return chairSvg(PAL.day); },
    'chair:ir': function () { return chairSvg(PAL.ir); },
    'nanny:stand:day': function () { return nannySvg('stand', PAL.day); },
    'nanny:stand:ir': function () { return nannySvg('stand', PAL.ir); },
    'nanny:tilt:ir': function () { return nannySvg('tilt', PAL.ir); },
    'nanny:lean:ir': function () { return nannySvg('lean', PAL.ir); },
    'nanny:hold:ir': function () { return nannySvg('hold', PAL.ir); },
    'nanny:stand:front': function () { return nannySvg('stand', PAL.front); },
    'nanny:head:front': function () { return nannySvg('head', PAL.front); },
    'viewer': function () { return viewerSvg(PAL.front); },
    'eye': eyeSvg
  };
  for (var mi = 0; mi < 4; mi++) {
    (function (i) {
      art.sprites['mobile:' + i + ':day'] = function () { return mobileSvg(i, PAL.day); };
      art.sprites['mobile:' + i + ':ir'] = function () { return mobileSvg(i, PAL.ir); };
    })(mi);
  }

  /* =====================================================================
     THE FACE AT THE END · pressed to the lens, in infrared
     ===================================================================== */
  art.irFace = function () {
    var R = rng(303), wisps = '';
    for (var i = 0; i < 16; i++) {
      var side = i % 2 ? 1 : -1, x0 = 300 + side * (60 + R() * 120), y0 = 150 + R() * 60;
      wisps += '<path d="M' + n1(x0) + ' ' + n1(y0) + ' C' + n1(x0 + side * 20) + ' ' + n1(y0 + 80) + ' ' + n1(x0 + side * (30 + R() * 30)) + ' ' + n1(y0 + 170) + ' ' + n1(x0 + side * (20 + R() * 40)) + ' ' + n1(y0 + 230 + R() * 120) + '" stroke-width="' + n1(0.8 + R() * 1.6) + '"/>';
    }
    var face = 'M300 70 C430 72 500 190 498 350 C496 500 430 652 300 700 C170 652 104 500 102 350 C100 190 170 72 300 70Z';
    return toSvg(
      '<svg viewBox="0 0 600 760" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="ifSkin" cx="50%" cy="44%" r="62%"><stop offset="0" stop-color="#F2F7F1"/><stop offset=".3" stop-color="#CED8CF"/><stop offset=".68" stop-color="#7A867D"/><stop offset="1" stop-color="#1B221E"/></radialGradient>' +
        '<radialGradient id="ifSock"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#040605" stop-opacity=".92"/><stop offset="1" stop-color="#2A322D" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="ifHot" cx="50%" cy="46%" r="50%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".3"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="ifVig" cx="50%" cy="47%" r="60%"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".96"/></radialGradient>' +
        '<linearGradient id="ifEdgeX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".16" stop-color="#000" stop-opacity="0"/><stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<linearGradient id="ifEdgeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".08" stop-color="#000" stop-opacity="0"/><stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>' +
        '<filter id="ifGlow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
        '<filter id="ifSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>' +
        '<filter id="ifWarp" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".006 .011" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter>' +
        '<filter id="ifGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="8"/><feColorMatrix type="matrix" values="0 0 0 0 .8  0 0 0 0 .85  0 0 0 0 .8  0 0 0 .26 0"/></filter>' +
        '<clipPath id="ifClip"><path d="' + face + '"/></clipPath>' +
      '</defs>' +
      '<rect width="600" height="760" fill="#000"/>' +
      '<g filter="url(#ifWarp)">' +
        // uniform collar and shoulders
        '<path d="M0 760 C30 660 150 620 300 616 C450 620 570 660 600 760Z" fill="#1A201C"/><path d="M220 640 L300 720 L380 640 L360 626 L300 680 L240 626Z" fill="#B9C3BB"/>' +
        '<path d="' + face + '" fill="url(#ifSkin)"/>' +
        '<g clip-path="url(#ifClip)">' +
          '<ellipse cx="190" cy="470" rx="60" ry="96" fill="#0D1411" opacity=".35" filter="url(#ifSoft)"/><ellipse cx="410" cy="470" rx="60" ry="96" fill="#0D1411" opacity=".35" filter="url(#ifSoft)"/>' +
          // hair scraped back from a centre parting, under her cap
          '<path d="M80 330 C70 140 200 56 300 58 C400 56 530 140 520 330 C500 220 440 170 300 166 C160 170 100 220 80 330Z" fill="#0A0E0C"/>' +
          '<path d="M300 60 L300 166" stroke="#3B463F" stroke-width="3"/>' +
        '</g>' +
        '<g fill="none" stroke="#0A0E0C" stroke-linecap="round" opacity=".8">' + wisps + '</g>' +
        '<path d="M170 92 C210 40 390 40 430 92 L404 118 C360 92 240 92 196 118Z" fill="#DDE6DE"/>' +
        '<ellipse cx="216" cy="350" rx="76" ry="56" fill="url(#ifSock)"/><ellipse cx="384" cy="346" rx="76" ry="56" fill="url(#ifSock)"/>' +
        '<g filter="url(#ifGlow)"><circle cx="220" cy="352" r="15" fill="#FFFFFF"/><circle cx="380" cy="348" r="15" fill="#FFFFFF"/></g>' +
        '<path d="M292 392 C284 440 278 476 288 492 C296 498 306 498 314 492" fill="none" stroke="#3F4A43" stroke-width="8" opacity=".45" filter="url(#ifSoft)"/>' +
        // the smile: closed, thin, and far too wide
        '<path d="M150 528 C220 612 380 612 450 528 C400 584 200 584 150 528Z" fill="#030403"/>' +
        '<path d="M140 520 C150 534 156 540 164 540 M460 520 C450 534 444 540 436 540" stroke="#050706" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M150 528 C220 592 380 592 450 528" stroke="#4B554E" stroke-width="2" fill="none" opacity=".5"/>' +
      '</g>' +
      '<rect width="600" height="760" fill="url(#ifHot)"/>' +
      '<rect width="600" height="760" filter="url(#ifGrain)" clip-path="url(#ifClip)"/>' +
      '<g fill="#050706" opacity=".25">' + Array.apply(null, Array(190)).map(function (_, k) { return '<rect y="' + (k * 4) + '" width="600" height="1.6"/>'; }).join('') + '</g>' +
      '<rect width="600" height="760" fill="url(#ifVig)"/><rect width="600" height="760" fill="url(#ifEdgeX)"/><rect width="600" height="760" fill="url(#ifEdgeY)"/>' +
      '</svg>');
  };

  /* ---------- mount the static pictures ---------- */
  function mount() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-halo]'), function (el) { el.appendChild(art.halo()); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-face]'), function (el) {
      var f = art.face(el.getAttribute('data-face'), el.getAttribute('data-kind') || 'avatar');
      el.appendChild(f.el);
      el._face = f;
    });
  }
  mount();
})();
