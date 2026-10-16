/* Camera — iOS 26 camera: viewfinder of what's actually in front of the phone tonight, modes carousel, zoom, flash /
   night / Live / timer / aspect / exposure / styles, front camera (selfie), video recording, panorama. Saves to Photos. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ui = JC.ui;
  const PK = () => JC.photoKit;

  // ── Extra art: the selfie camera (you, in the dark, hood up) and the morning window ──────────
  // Every front-camera shot uses this art id; the 'front-camera' tag marks it for the story (a selfie sent to anyone
  // shows them a stranger's face — js/story/scenes/react-social.js).
  JC.art.def('cam_selfie_dark', {
    title: 'Selfie — dark, hood up', w: 900, h: 1200, tags: ['selfie', 'night', 'hoodie', 'front-camera'],
    svg: (w, hh) => {
      let bokeh = '';
      const cols = ['#ff9f43', '#f368e0', '#54a0ff', '#ffd32a', '#ff6b6b', '#48dbfb', '#c56cf0'];
      for (let i = 0; i < 26; i++) {
        const x = (i * 157) % 900, y = 60 + ((i * 97) % 520), r = 26 + ((i * 41) % 46);
        bokeh += `<circle cx="${x}" cy="${y}" r="${r}" fill="${cols[i % cols.length]}" opacity="${(0.10 + ((i * 13) % 20) / 100).toFixed(2)}"/>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151827"/><stop offset=".55" stop-color="#0d0f19"/><stop offset="1" stop-color="#06070b"/></linearGradient>
          <radialGradient id="glow" cx=".5" cy=".62" r=".42"><stop offset="0" stop-color="#7fa6ff" stop-opacity=".38"/><stop offset=".6" stop-color="#4060c0" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
          <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d3a"/><stop offset="1" stop-color="#14151d"/></linearGradient>
          <linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0c12"/><stop offset=".55" stop-color="#1c2236"/><stop offset="1" stop-color="#4a5b86"/></linearGradient>
          <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter>
        </defs>
        <rect width="${w}" height="${hh}" fill="url(#bg)"/>
        <g filter="url(#b)">${bokeh}<rect x="0" y="560" width="${w}" height="80" fill="#0a0b10" opacity=".6"/></g>
        <path d="M0 640 C 120 600 250 610 330 650 L 0 760 Z" fill="#0f1119" opacity=".9"/>
        <path d="M900 600 C 780 590 690 620 640 660 L 900 760 Z" fill="#0f1119" opacity=".9"/>
        <rect width="${w}" height="${hh}" fill="url(#glow)"/>
        <path d="M450 330 C 300 330 220 450 214 600 C 208 720 250 800 300 860 L 120 1200 L 780 1200 L 600 860 C 650 800 692 720 686 600 C 680 450 600 330 450 330 Z" fill="url(#hood)"/>
        <path d="M450 420 C 360 420 318 500 318 600 C 318 700 372 790 450 800 C 528 790 582 700 582 600 C 582 500 540 420 450 420 Z" fill="url(#face)"/>
        <path d="M390 760 Q450 790 510 760" stroke="#6f86c4" stroke-width="5" fill="none" opacity=".35" stroke-linecap="round"/>
        <path d="M340 900 L 380 1200 M560 900 L 520 1200" stroke="#0a0b10" stroke-width="10" opacity=".6"/>
        <path d="M430 880 q20 30 0 70 M470 880 q-20 30 0 70" stroke="#3b3f52" stroke-width="7" fill="none" stroke-linecap="round"/>
        <rect width="${w}" height="${hh}" fill="#000" opacity=".12"/>
      </svg>`;
    },
  });
  JC.art.def('cam_morning', {
    title: 'Morning over Lanling rooftops', w: 1200, h: 900, tags: ['morning', 'window', 'city'],
    svg: (w, hh) => {
      let blds = '';
      const xs = [0, 90, 170, 260, 330, 430, 520, 600, 700, 790, 880, 980, 1070, 1150];
      xs.forEach((x, i) => {
        const bh = 160 + ((i * 73) % 220), bw = 70 + ((i * 29) % 60);
        blds += `<rect x="${x}" y="${640 - bh}" width="${bw}" height="${bh + 260}" fill="${i % 2 ? '#8e98a8' : '#9aa3b2'}"/>`;
        for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) blds += `<rect x="${x + 10 + c * (bw / 3.4)}" y="${660 - bh + r * 34}" width="10" height="16" fill="${(r + c + i) % 4 ? '#c7cfdb' : '#f4d79a'}" opacity=".8"/>`;
      });
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}">
        <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c4dd"/><stop offset=".6" stop-color="#f1d6b8"/><stop offset="1" stop-color="#f6e2c4"/></linearGradient>
        <radialGradient id="sun" cx=".72" cy=".42" r=".3"><stop offset="0" stop-color="#fff6dc"/><stop offset=".4" stop-color="#ffe2a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient></defs>
        <rect width="${w}" height="${hh}" fill="url(#s)"/>
        <rect width="${w}" height="${hh}" fill="url(#sun)"/>
        <path d="M0 560 Q 300 520 600 548 T 1200 530 V 900 H 0 Z" fill="#b8c2cf" opacity=".6"/>
        <rect x="520" y="300" width="70" height="300" fill="#c9b27a" opacity=".55"/><path d="M520 300 l35 -60 35 60z" fill="#c9b27a" opacity=".55"/>
        ${blds}
        <path d="M0 780 L 1200 760 L 1200 900 L 0 900 Z" fill="#5b6472"/>
        <path d="M0 790 L 1200 772" stroke="#cfd6df" stroke-width="3" opacity=".5"/>
        <g opacity=".5" stroke="#ffffff" stroke-width="2">${Array.from({ length: 22 }, (_, i) => `<path d="M${40 + i * 53} ${80 + ((i * 47) % 300)} l3 14"/>`).join('')}</g>
        <path d="M0 0 H ${w} V 40 H 40 V ${hh} H 0 Z M ${w} 0 V ${hh} H ${w - 40} V 0 Z" fill="#2c2a28"/>
        <rect x="0" y="${hh - 40}" width="${w}" height="40" fill="#2c2a28"/>
        <rect x="${w / 2 - 12}" y="0" width="24" height="${hh}" fill="#2c2a28"/>
      </svg>`;
    },
  });

  JC.icon.add({
    'cam.chevron': '<path d="M6 14.5 12 9l6 5.5"/>',
    'cam.live': '<circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="9.2" stroke-dasharray="1.4 2.2"/>',
    'cam.live.off': '<circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="9.2" stroke-dasharray="1.4 2.2"/><path d="M4 4l16 16"/>',
    'cam.flash.off': '<path d="M13.5 2.8 6.4 13.2h5l-1.2 8 7.4-10.6h-5z"/><path d="M4 4l16 16"/>',
    'cam.flash': '<path d="M13.5 2.8 6.4 13.2h5l-1.2 8 7.4-10.6h-5z" fill="currentColor"/>',
    'cam.flash.auto': '<path d="M11.5 2.8 4.4 13.2h5l-1.2 8 7.4-10.6h-5z"/><path d="M15.5 21l2.5-7 2.5 7M16.3 19h3.4" stroke-width="1.6"/>',
    'cam.night': '<path d="M15.5 3.5a8.6 8.6 0 1 0 5 13.3 7 7 0 0 1-5-13.3z" fill="currentColor"/>',
    'cam.night.off': '<path d="M15.5 3.5a8.6 8.6 0 1 0 5 13.3 7 7 0 0 1-5-13.3z"/><path d="M4 4l16 16"/>',
    'cam.timer': '<circle cx="12" cy="13" r="7.5"/><path d="M12 13V9M10 2.8h4M18 6.5l1.5-1.5"/>',
    'cam.aspect': '<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 7h-1v1.6M15.5 17h1v-1.6"/>',
    'cam.exposure': '<circle cx="12" cy="12" r="8.6"/><path d="M5.9 18.1 18.1 5.9"/><path d="M7.5 9.5h4M9.5 7.5v4M13 15.5h4"/>',
    'cam.styles': '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 12h16M12 4v16" opacity=".6"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/>',
    'cam.grid': '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
    'cam.wide': '<path d="M3 12h18M6.5 8.5 3 12l3.5 3.5M17.5 8.5 21 12l-3.5 3.5"/>',
    'cam.depth': '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4 15.4 9.6M20.3 9.6l-6.9 1.6M17.6 18.6l-4.4-5.2M7 19.2l1.9-6.6M3.7 9.4l6.7 2.4M14.8 3.9 9.4 8.6"/>',
  });

  const MODES = ['TIME-LAPSE', 'SLO-MO', 'CINEMATIC', 'VIDEO', 'PHOTO', 'PORTRAIT', 'PANO'];
  const VIDEO_MODES = ['TIME-LAPSE', 'SLO-MO', 'CINEMATIC', 'VIDEO'];
  const ZOOMS = [0.5, 1, 2, 5];
  const MAG = { 0.5: 1, 1: 1.45, 2: 2.6, 5: 5.2 };
  const STYLES = [
    { id: 'standard', name: 'Standard', css: '' },
    { id: 'amber', name: 'Amber', css: 'sepia(.25) saturate(1.15) hue-rotate(-6deg)' },
    { id: 'gold', name: 'Gold', css: 'sepia(.32) saturate(1.25) brightness(1.04)' },
    { id: 'rose', name: 'Rose Gold', css: 'sepia(.2) hue-rotate(-18deg) saturate(1.2)' },
    { id: 'neutral', name: 'Neutral', css: 'saturate(.82) contrast(.96)' },
    { id: 'coolrose', name: 'Cool Rose', css: 'hue-rotate(-22deg) saturate(1.05) brightness(1.02)' },
    { id: 'bw', name: 'Black & White', css: 'grayscale(1) contrast(1.08)' },
    { id: 'stark', name: 'Stark B&W', css: 'grayscale(1) contrast(1.55) brightness(.9)' },
  ];

  function scene(front) {
    const now = JC.time.date();
    const hr = now.getHours(), mn = now.getMinutes();
    const mins = hr * 60 + mn;
    if (front) return { art: 'cam_selfie_dark', place: mins >= 360 && mins < 1200 ? 'Jinxing Road, Lanling' : 'Lanling', dark: !(mins >= 400 && mins < 1080), fx: mins >= 400 && mins < 1080 ? 'brightness(1.5) contrast(.95)' : '' };
    if (mins >= 360 && mins < 1080) return { art: 'cam_morning', place: 'Jinxing Road, Lanling', dark: false };
    if (mins >= 23 * 60 + 25 || mins < 15) return { art: 'p_taxi_night', place: 'Lanling', dark: true, taxi: true };
    return { art: 'p_moon_street', place: 'Jinxing Road, Lanling', dark: true, rain: true };
  }

  const NOISE = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.2"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>');

  JC.app({
    id: 'camera',
    name: 'Camera',
    status: 'light',
    launch(win, intent0) {
      win.body.classList.add('app-camera');
      const st = {
        mode: 'PHOTO', front: false, zoom: 1, flash: 'auto', live: true, night: true, timer: 0, aspect: '4:3',
        ev: 0, style: 'standard', grid: false, rec: null, busy: false, ctrl: null, lockAE: false, fmt: { VIDEO: '4K · 30', 'SLO-MO': '240', CINEMATIC: 'HD · 30', 'TIME-LAPSE': '' },
        depth: 2.8, lighting: 'Natural Light',
      };
      let sc = scene(false);

      // ── DOM ────────────────────────────────────────────────────────────
      const root = h('div.cam');
      const flashBtn = h('div.cam-ic', { onTap: () => openCtrl('flash') });
      const nightBtn = h('div.cam-night', { onTap: () => { st.night = !st.night; paintTop(); JC.audio.play('tap'); toastHint(st.night ? 'Night Mode On' : 'Night Mode Off'); } });
      const chevBtn = h('div.cam-chev', { onTap: () => toggleStrip() }, JC.icon('cam.chevron', { size: 18, weight: 2.4 }));
      const fmtBtn = h('div.cam-fmt', { onTap: () => cycleFmt() });
      const liveBtn = h('div.cam-ic', { onTap: () => { st.live = !st.live; paintTop(); toastHint(st.live ? 'Live On' : 'Live Off'); } });
      const recPill = h('div.cam-rec', { hidden: true }, h('span.cam-rec-dot'), h('span.cam-rec-t', '00:00:00'));
      const top = h('div.cam-top', h('div.cam-top-l', flashBtn, nightBtn), chevBtn, h('div.cam-top-r', fmtBtn, liveBtn), recPill);

      const frame = h('div.cam-frame');
      const sway = h('div.cam-sway');
      const sceneEl = h('div.cam-scene');
      sway.appendChild(sceneEl);
      const rain = h('div.cam-rain');
      const noise = h('div.cam-noise', { style: { backgroundImage: `url("${NOISE}")` } });
      const vign = h('div.cam-vig');
      const gridEl = h('div.cam-grid', { hidden: true }, h('i'), h('i'), h('i'), h('i'));
      const focus = h('div.cam-focus', { hidden: true }, h('div.cam-focus-sun', JC.icon('sun.max.fill', { size: 15 })));
      const badge = h('div.cam-badge', { hidden: true });
      const hint = h('div.cam-hint', { hidden: true });
      const count = h('div.cam-count', { hidden: true });
      const panoUI = h('div.cam-pano', { hidden: true }, h('div.cam-pano-track', h('div.cam-pano-fill'), h('div.cam-pano-arrow', JC.icon('arrow.right', { size: 22, weight: 2.6 }))), h('div.cam-pano-t', 'Move iPhone continuously when taking a panorama.'));
      const nightDial = h('div.cam-ndial', { hidden: true });
      const blink = h('div.cam-blink');
      const cine = h('div.cam-cine', { hidden: true });
      frame.append(sway, rain, noise, vign, gridEl, cine, focus, badge, hint, count, panoUI, nightDial, blink);

      const zoomBar = h('div.cam-zooms');
      const ctrlStrip = h('div.cam-strip', { hidden: true });
      const ctrlOpts = h('div.cam-opts', { hidden: true });
      const modeRow = h('div.cam-modes');
      const modeWrap = h('div.cam-modewrap', modeRow);
      const thumb = h('div.cam-thumb', { onTap: () => openLast() });
      const shutter = h('div.cam-shutter', { onTap: () => press() }, h('div.cam-shutter-in'));
      const flipBtn = h('div.cam-flip', { onTap: () => (st.rec ? still() : flip()) }, JC.icon('camera.rotate', { size: 26 }));
      const bottom = h('div.cam-bottom', ctrlOpts, ctrlStrip, modeWrap, h('div.cam-row', thumb, shutter, flipBtn));
      const vf = h('div.cam-vf', frame, zoomBar);
      root.append(top, vf, bottom);
      win.body.appendChild(root);

      // ── Viewfinder rendering ─────────────────────────────────────────
      function frameAspect() {
        if (st.mode === 'PANO') return 3 / 4;
        if (VIDEO_MODES.includes(st.mode)) return 9 / 16;
        return st.aspect === '16:9' ? 9 / 16 : st.aspect === '1:1' ? 1 : 3 / 4;
      }
      function mag() { return st.front ? (st.zoom < 1 ? 1 : 1.25) : MAG[st.zoom] || 1; }
      function crop() {
        const aa = PK().artAspect(sc.art);
        const base = PK().cover(PK().FULL, aa, frameAspect());
        const k = mag();
        const w = base.w / k, hh = base.h / k;
        const cx = base.x + base.w / 2, cy = base.y + base.h * (st.front ? 0.5 : 0.48);
        return { x: U.clamp(cx - w / 2, 0, 1 - w), y: U.clamp(cy - hh / 2, 0, 1 - hh), w, h: hh };
      }
      function lookFx() {
        const s = STYLES.find((x) => x.id === st.style);
        const parts = [];
        if (sc.fx) parts.push(sc.fx);
        if (s && s.css) parts.push(s.css);
        if (st.ev) parts.push(`brightness(${(1 + st.ev * 0.18).toFixed(2)})`);
        if (sc.dark && !st.front) parts.push(st.night ? 'brightness(1.12) contrast(1.04)' : 'brightness(.86) contrast(1.08)');
        return parts.join(' ');
      }
      function layoutFrame() {
        const vw = vf.offsetWidth || 402, vh = vf.offsetHeight || 536;
        const fa = frameAspect();
        let fw = vw, fh = vw / fa;
        const video = VIDEO_MODES.includes(st.mode) || st.aspect === '16:9';
        if (fh > vh && !video) { fh = vh; fw = vh * fa; }
        frame.style.width = fw + 'px';
        frame.style.height = fh + 'px';
        frame.style.top = video ? Math.max(0, (vh - fh) / 2) + 'px' : st.aspect === '1:1' && st.mode !== 'PANO' ? (vh - fh) / 2 + 'px' : '0px';
        root.classList.toggle('tall', video);
      }
      function paintScene() {
        sc = scene(st.front);
        PK().bgFor(sceneEl, sc.art, crop());
        sceneEl.style.filter = lookFx();
        sceneEl.style.transform = st.front ? 'scaleX(-1)' : '';
        root.classList.toggle('dark-scene', !!sc.dark);
        rain.hidden = !(sc.rain || sc.taxi) || st.front;
        rain.classList.toggle('taxi', !!sc.taxi);
        noise.style.opacity = sc.dark ? (st.night && !st.front ? 0.14 : 0.24) : 0.06;
        gridEl.hidden = !st.grid;
        cine.hidden = st.mode !== 'CINEMATIC';
        if (st.mode === 'CINEMATIC') { cine.innerHTML = ''; cine.appendChild(h('div.cam-cine-box', h('span', 'TRACKING'))); }
      }
      function paintZoom() {
        zoomBar.innerHTML = '';
        if (st.mode === 'PANO') { zoomBar.hidden = true; return; }
        zoomBar.hidden = false;
        const zs = st.front ? [0.8, 1] : ZOOMS;
        zs.forEach((z) => {
          const on = st.front ? (z < 1) === (st.zoom < 1) : st.zoom === z;
          const label = on ? (z === 0.5 ? '.5×' : z === 0.8 ? '' : z + '×') : (z === 0.5 ? '.5' : z === 0.8 ? '' : String(z));
          zoomBar.appendChild(h('div.cam-z', { class: { on }, onTap: (e) => { e.stopPropagation(); setZoom(z); } }, z === 0.8 ? JC.icon('cam.wide', { size: 15, weight: 2.2 }) : label));
        });
      }
      function setZoom(z) {
        if (st.zoom === z) return;
        st.zoom = z;
        JC.audio.haptic(6);
        JC.audio.play('tap');
        sceneEl.classList.add('zooming');
        paintScene();
        paintZoom();
        setTimeout(() => sceneEl.classList.remove('zooming'), 320);
        showBadge(st.front ? (z < 1 ? 'WIDE' : '') : (z === 0.5 ? '0.5×' : z + '×'), 700);
      }
      function paintTop() {
        flashBtn.innerHTML = '';
        flashBtn.appendChild(JC.icon(st.flash === 'on' ? 'cam.flash' : st.flash === 'auto' ? 'cam.flash.auto' : 'cam.flash.off', { size: 21, weight: 1.9 }));
        flashBtn.classList.toggle('on', st.flash === 'on');
        const nightAvail = sc.dark && !st.front && !VIDEO_MODES.includes(st.mode) && st.mode !== 'PANO';
        nightBtn.hidden = !nightAvail;
        nightBtn.innerHTML = '';
        nightBtn.appendChild(JC.icon(st.night ? 'cam.night' : 'cam.night.off', { size: 16, weight: 2 }));
        if (st.night) nightBtn.appendChild(h('span', '3s'));
        nightBtn.classList.toggle('on', st.night);
        liveBtn.innerHTML = '';
        liveBtn.appendChild(JC.icon(st.live ? 'cam.live' : 'cam.live.off', { size: 22, weight: 1.7 }));
        liveBtn.classList.toggle('on', st.live);
        liveBtn.hidden = !(st.mode === 'PHOTO');
        fmtBtn.hidden = !VIDEO_MODES.includes(st.mode) || st.mode === 'TIME-LAPSE';
        fmtBtn.textContent = st.fmt[st.mode] || '';
      }
      function paintModes() {
        modeRow.innerHTML = '';
        const modes = st.front ? MODES.filter((m) => m !== 'PANO') : MODES;
        modes.forEach((m) => modeRow.appendChild(h('div.cam-mode', { class: { on: st.mode === m }, onTap: () => setMode(m) }, m)));
        requestAnimationFrame(() => {
          const on = modeRow.querySelector('.cam-mode.on');
          if (!on) return;
          const off = on.offsetLeft + on.offsetWidth / 2;
          modeRow.style.transform = `translateX(${201 - off}px)`;
        });
      }
      function paintShutter() {
        shutter.className = 'cam-shutter tap';
        const video = VIDEO_MODES.includes(st.mode);
        if (video) shutter.classList.add('video');
        if (st.mode === 'TIME-LAPSE') shutter.classList.add('lapse');
        if (st.rec) shutter.classList.add('recording');
        if (st.mode === 'PANO' && st.busy) shutter.classList.add('recording', 'video');
        flipBtn.innerHTML = '';
        flipBtn.appendChild(st.rec ? h('div.cam-still') : JC.icon('camera.rotate', { size: 26 }));
        thumb.style.visibility = st.rec ? 'hidden' : '';
      }
      function paintThumb() {
        const p = PK().latest();
        thumb.innerHTML = '';
        if (p) thumb.appendChild(PK().box(p, 1, 'cam-thumb-img'));
      }
      function render() {
        layoutFrame();
        paintScene();
        paintZoom();
        paintTop();
        paintModes();
        paintShutter();
        paintThumb();
        panoUI.hidden = st.mode !== 'PANO';
        hint.hidden = true;
        if (st.mode === 'PORTRAIT') {
          if (st.front) showBadge(st.lighting.toUpperCase(), 0, true);
          else { hint.hidden = false; hint.textContent = sc.dark ? 'More light required.' : 'Place subject within 2.5 m.'; badge.hidden = true; }
        } else if (st.mode === 'CINEMATIC') showBadge('ƒ ' + st.depth.toFixed(1), 0, true);
        else badge.hidden = true;
      }

      // ── Modes ───────────────────────────────────────────────────────
      function setMode(m) {
        if (st.rec || st.busy || st.mode === m) return;
        st.mode = m;
        JC.audio.haptic(6);
        if (m === 'PANO') st.zoom = 1;
        closeCtrl();
        root.classList.add('switching');
        setTimeout(() => root.classList.remove('switching'), 260);
        render();
      }
      function stepMode(d) {
        const modes = st.front ? MODES.filter((x) => x !== 'PANO') : MODES;
        const i = modes.indexOf(st.mode);
        const n = U.clamp(i + d, 0, modes.length - 1);
        if (n !== i) setMode(modes[n]);
      }
      function cycleFmt() {
        const opts = { VIDEO: ['HD · 30', '4K · 30', '4K · 60', 'HD · 60'], 'SLO-MO': ['240', '120'], CINEMATIC: ['HD · 30', '4K · 24', '4K · 30'] }[st.mode];
        if (!opts) return;
        const i = opts.indexOf(st.fmt[st.mode]);
        st.fmt[st.mode] = opts[(i + 1) % opts.length];
        paintTop();
        toastHint(st.mode === 'SLO-MO' ? st.fmt[st.mode] + ' fps' : st.fmt[st.mode].replace(' · ', ' at ') + ' fps');
      }
      function flip() {
        if (st.busy) return;
        st.front = !st.front;
        st.zoom = 1;
        if (st.front && st.mode === 'PANO') st.mode = 'PHOTO';
        JC.audio.play('tap');
        U.anim(frame, [{ transform: 'rotateY(0)', filter: 'blur(0)' }, { transform: 'rotateY(90deg)', filter: 'blur(14px)', offset: 0.5 }, { transform: 'rotateY(0)', filter: 'blur(0)' }], { duration: 520, easing: 'ease-in-out', fill: 'none' });
        setTimeout(render, 250);
      }

      // ── Controls strip (chevron) ─────────────────────────────────────
      function toggleStrip() {
        if (!ctrlStrip.hidden) { closeCtrl(); return; }
        ctrlStrip.hidden = false;
        modeWrap.hidden = true;
        chevBtn.classList.add('open');
        paintStrip();
      }
      function closeCtrl() {
        ctrlStrip.hidden = true;
        ctrlOpts.hidden = true;
        modeWrap.hidden = false;
        chevBtn.classList.remove('open');
        st.ctrl = null;
      }
      function paintStrip() {
        ctrlStrip.innerHTML = '';
        const items = [
          ['flash', st.flash === 'on' ? 'cam.flash' : st.flash === 'auto' ? 'cam.flash.auto' : 'cam.flash.off', st.flash !== 'off'],
          ['night', st.night ? 'cam.night' : 'cam.night.off', st.night],
          ['live', st.live ? 'cam.live' : 'cam.live.off', st.live],
          ['styles', 'cam.styles', st.style !== 'standard'],
          ['aspect', null, false],
          ['exposure', 'cam.exposure', !!st.ev],
          ['timer', 'cam.timer', !!st.timer],
          ['grid', 'cam.grid', st.grid],
        ];
        items.forEach(([id, ic, on]) => {
          if (id === 'night' && (!sc.dark || st.front)) return;
          const b = h('div.cam-sbtn', { class: { on, sel: st.ctrl === id }, onTap: () => openCtrl(id) }, ic ? JC.icon(ic, { size: 20, weight: 1.9 }) : h('span.cam-sbtn-t', st.aspect));
          ctrlStrip.appendChild(b);
        });
      }
      function openCtrl(id) {
        if (ctrlStrip.hidden) { ctrlStrip.hidden = false; modeWrap.hidden = true; chevBtn.classList.add('open'); }
        st.ctrl = id;
        ctrlOpts.hidden = false;
        ctrlOpts.innerHTML = '';
        const pill = (label, active, fn) => h('div.cam-opt', { class: { on: active }, onTap: () => { fn(); JC.audio.play('tap'); paintTop(); paintScene(); paintStrip(); openCtrl(id); } }, label);
        if (id === 'flash') ctrlOpts.append(h('div.cam-opt-k', 'FLASH'), pill('Auto', st.flash === 'auto', () => { st.flash = 'auto'; }), pill('On', st.flash === 'on', () => { st.flash = 'on'; }), pill('Off', st.flash === 'off', () => { st.flash = 'off'; }));
        else if (id === 'night') ctrlOpts.append(h('div.cam-opt-k', 'NIGHT MODE'), pill('Auto · 3s', st.night, () => { st.night = true; }), pill('Off', !st.night, () => { st.night = false; }));
        else if (id === 'live') ctrlOpts.append(h('div.cam-opt-k', 'LIVE'), pill('On', st.live, () => { st.live = true; }), pill('Off', !st.live, () => { st.live = false; }));
        else if (id === 'aspect') ctrlOpts.append(h('div.cam-opt-k', 'ASPECT'), ...['4:3', '16:9', '1:1'].map((a) => pill(a, st.aspect === a, () => { st.aspect = a; layoutFrame(); })));
        else if (id === 'timer') ctrlOpts.append(h('div.cam-opt-k', 'TIMER'), pill('Off', !st.timer, () => { st.timer = 0; }), pill('3s', st.timer === 3, () => { st.timer = 3; }), pill('10s', st.timer === 10, () => { st.timer = 10; }));
        else if (id === 'grid') ctrlOpts.append(h('div.cam-opt-k', 'GRID'), pill('On', st.grid, () => { st.grid = true; }), pill('Off', !st.grid, () => { st.grid = false; }));
        else if (id === 'styles') ctrlOpts.append(h('div.cam-styles.hscroll', STYLES.map((s) => {
          const sw = h('div.cam-style', { class: { on: st.style === s.id }, onTap: () => { st.style = s.id; paintScene(); paintStrip(); openCtrl('styles'); showBadge(s.name.toUpperCase(), 900); } }, h('div.cam-style-img'), h('span', s.name));
          PK().bgFor(sw.firstChild, sc.art, crop());
          sw.firstChild.style.filter = s.css;
          return sw;
        })));
        else if (id === 'exposure') {
          const val = h('div.cam-ev-v', (st.ev > 0 ? '+' : '') + st.ev.toFixed(1));
          const sl = ui.slider({ value: st.ev, min: -2, max: 2, step: 0.1, onInput: (v) => { st.ev = Math.round(v * 10) / 10; val.textContent = (st.ev > 0 ? '+' : '') + st.ev.toFixed(1); paintScene(); } });
          ctrlOpts.append(h('div.cam-opt-k', 'EXPOSURE'), h('div.cam-ev', sl), val);
        }
      }

      // ── Capture ─────────────────────────────────────────────────────
      function press() {
        if (st.mode === 'PANO') { if (st.busy) finishPano(); else startPano(); return; }
        if (VIDEO_MODES.includes(st.mode)) { if (st.rec) stopRec(); else if (!st.busy) withTimer(startRec); return; }
        if (st.busy) return;
        withTimer(shoot);
      }
      function withTimer(fn) {
        if (!st.timer) { fn(); return; }
        st.busy = true;
        let n = st.timer;
        count.hidden = false;
        const tick = () => {
          if (!st.busy) { count.hidden = true; return; }
          if (n <= 0) { count.hidden = true; st.busy = false; fn(); return; }
          count.textContent = String(n);
          U.anim(count, [{ transform: 'scale(1.4)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300, fill: 'none' });
          JC.audio.beep(n <= 3 ? 1320 : 990, 0.08, 0.05);
          n--;
          st.cdT = setTimeout(tick, 1000);
        };
        tick();
      }
      function shoot() {
        const nightShot = sc.dark && !st.front && st.night;
        const doFlash = !st.front && (st.flash === 'on' || (st.flash === 'auto' && sc.dark && !st.night));
        const retina = st.front && st.flash === 'on';
        const finish = () => {
          JC.audio.play('shutter');
          JC.audio.haptic(10);
          if (doFlash || retina) U.anim(blink, [{ opacity: 0, background: '#fff' }, { opacity: 0.95, background: '#fff', offset: 0.2 }, { opacity: 0, background: '#fff' }], { duration: 260, fill: 'none' });
          else U.anim(blink, [{ opacity: 0, background: '#000' }, { opacity: 1, background: '#000', offset: 0.3 }, { opacity: 0, background: '#000' }], { duration: 170, fill: 'none' });
          if (st.live && st.mode === 'PHOTO') showBadge('LIVE', 1200, true);
          const fx = lookFx() + (doFlash ? ' brightness(1.18) contrast(.96)' : '') + (nightShot ? ' brightness(1.1)' : '');
          const item = PK().add({
            art: sc.art,
            t: JC.time.now(),
            added: JC.time.now(),
            crop: crop(),
            fx: fx.trim() || undefined,
            kind: st.live && st.mode === 'PHOTO' ? 'live' : 'photo',
            mode: st.front ? 'selfie' : st.mode === 'PORTRAIT' ? 'portrait' : undefined,
            src: st.front ? 'ip17f' : st.zoom === 0.5 ? 'ip17uw' : st.zoom === 5 ? 'ip17t' : 'ip17',
            place: sc.place, city: 'lanling', albums: [], people: [], caption: '',
          });
          afterSave(item);
        };
        if (retina) {
          const scr = h('div.cam-retina');
          win.body.appendChild(scr);
          setTimeout(() => { finish(); setTimeout(() => scr.remove(), 160); }, 260);
          return;
        }
        if (nightShot) {
          st.busy = true;
          nightDial.hidden = false;
          nightDial.innerHTML = '';
          nightDial.append(h('div.cam-ndial-ring'), h('div.cam-ndial-t', 'Hold still'));
          const ring = nightDial.querySelector('.cam-ndial-ring');
          U.anim(ring, [{ '--p': 0 }, { '--p': 100 }], { duration: 1600, easing: 'linear' });
          let k = 0;
          const iv = setInterval(() => { k += 5; ring.style.setProperty('--p', Math.min(100, k * 6.25)); }, 100);
          setTimeout(() => { clearInterval(iv); nightDial.hidden = true; st.busy = false; finish(); }, 1600);
          return;
        }
        finish();
      }
      function afterSave(item) {
        paintThumb();
        U.anim(thumb, [{ transform: 'scale(.6)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 360, fill: 'none' });
        JC.story.act('photo_taken', { id: item.id, selfie: !!st.front, mode: st.mode.toLowerCase(), kind: item.kind });
      }
      function still() {
        if (!st.rec) return;
        JC.audio.play('shutter');
        U.anim(blink, [{ opacity: 0, background: '#000' }, { opacity: 0.8, background: '#000', offset: 0.3 }, { opacity: 0, background: '#000' }], { duration: 150, fill: 'none' });
        const item = PK().add({ art: sc.art, t: JC.time.now(), crop: crop(), fx: lookFx() || undefined, kind: 'photo', src: 'ip17', place: sc.place, city: 'lanling' });
        afterSave(item);
      }
      function startRec() {
        st.rec = { t0: performance.now(), mode: st.mode, art: sc.art, crop: crop(), fx: lookFx(), place: sc.place, front: st.front };
        JC.audio.beep(1046, 0.09, 0.05);
        recPill.hidden = false;
        top.classList.add('recording');
        modeWrap.classList.add('dim');
        paintShutter();
        st.recT = setInterval(paintRec, 250);
        paintRec();
      }
      function paintRec() {
        if (!st.rec) return;
        const s = Math.floor((performance.now() - st.rec.t0) / 1000);
        const hh = String(Math.floor(s / 3600)).padStart(2, '0');
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        recPill.querySelector('.cam-rec-t').textContent = hh + ':' + mm + ':' + ss;
        if (st.rec.mode === 'TIME-LAPSE') shutter.style.setProperty('--lapse', (s * 30) % 360 + 'deg');
      }
      function stopRec(silent) {
        const r = st.rec;
        if (!r) return;
        clearInterval(st.recT);
        st.rec = null;
        const sec = Math.max(1, Math.round((performance.now() - r.t0) / 1000));
        if (!silent) JC.audio.beep(784, 0.09, 0.05);
        recPill.hidden = true;
        top.classList.remove('recording');
        modeWrap.classList.remove('dim');
        const modeKey = { 'TIME-LAPSE': 'timelapse', 'SLO-MO': 'slomo', CINEMATIC: 'cinematic', VIDEO: undefined }[r.mode];
        const dur = r.mode === 'TIME-LAPSE' ? Math.max(1, Math.round(sec / 8)) : sec;
        const item = PK().add({ art: r.art, t: JC.time.now(), added: JC.time.now(), crop: r.crop, fx: r.fx || undefined, kind: 'video', dur, mode: r.front ? 'selfie' : modeKey, src: r.front ? 'ip17f' : 'ip17', place: r.place, city: 'lanling' });
        paintShutter();
        afterSave(item);
      }
      function startPano() {
        st.busy = true;
        paintShutter();
        const fill = panoUI.querySelector('.cam-pano-fill');
        const arrow = panoUI.querySelector('.cam-pano-arrow');
        panoUI.querySelector('.cam-pano-t').textContent = 'Keep the arrow on the center line.';
        const t0 = performance.now();
        const D = 4200;
        const step = () => {
          if (!st.busy) return;
          const k = Math.min(1, (performance.now() - t0) / D);
          fill.style.width = k * 100 + '%';
          arrow.style.left = k * 100 + '%';
          const c = crop();
          PK().bgFor(sceneEl, sc.art, Object.assign({}, c, { x: U.clamp(k * (1 - c.w), 0, 1 - c.w) }));
          if (k >= 1) { finishPano(); return; }
          st.panoRaf = requestAnimationFrame(step);
        };
        st.panoRaf = requestAnimationFrame(step);
      }
      function finishPano() {
        if (!st.busy) return;
        cancelAnimationFrame(st.panoRaf);
        const fill = panoUI.querySelector('.cam-pano-fill');
        const done = parseFloat(fill.style.width) || 0;
        st.busy = false;
        JC.audio.play('shutter');
        fill.style.width = '0%';
        panoUI.querySelector('.cam-pano-arrow').style.left = '0%';
        panoUI.querySelector('.cam-pano-t').textContent = 'Move iPhone continuously when taking a panorama.';
        paintScene();
        paintShutter();
        if (done < 8) return;
        const w = Math.max(0.3, done / 100);
        const item = PK().add({ art: sc.art, t: JC.time.now(), added: JC.time.now(), crop: { x: 0, y: 0.33, w, h: 0.34 * Math.max(0.6, w) }, fx: lookFx() || undefined, kind: 'photo', mode: 'pano', src: 'ip17', place: sc.place, city: 'lanling' });
        afterSave(item);
      }
      function openLast() {
        const p = PK().latest();
        if (!p) { toastHint('No Photos'); return; }
        JC.os.open('photos', { id: p.id });
      }

      // ── Focus, gestures ──────────────────────────────────────────────
      let focusT = null;
      ui.onTap(frame, (e) => {
        if (!ctrlStrip.hidden) { closeCtrl(); return; }
        const r = ui.toLocal(frame.getBoundingClientRect());
        const p = ui.toLocal({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
        showFocus(p.x - r.x, p.y - r.y, false);
      });
      U.longPress(frame, (e) => {
        const r = ui.toLocal(frame.getBoundingClientRect());
        const p = ui.toLocal({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
        showFocus(p.x - r.x, p.y - r.y, true);
      }, 600);
      function showFocus(x, y, lock) {
        focus.hidden = false;
        focus.style.left = x + 'px';
        focus.style.top = y + 'px';
        focus.classList.toggle('locked', lock);
        U.anim(focus, [{ transform: 'translate(-50%,-50%) scale(1.5)', opacity: 0.4 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }], { duration: 260 });
        st.lockAE = lock;
        if (lock) showBadge('AE/AF LOCK', 0, true);
        else if (badge.textContent === 'AE/AF LOCK') badge.hidden = true;
        JC.audio.haptic(5);
        clearTimeout(focusT);
        if (!lock) focusT = setTimeout(() => { focus.classList.add('fade'); setTimeout(() => { focus.hidden = true; focus.classList.remove('fade'); }, 400); }, 1800);
      }
      // drag on the focus sun = exposure
      U.drag(focus, {
        axis: 'y',
        start: () => { focus._ev = st.ev; clearTimeout(focusT); },
        move: (e, p) => { st.ev = U.clamp(Math.round((focus._ev - p.dy / 60) * 10) / 10, -2, 2); paintScene(); focus.querySelector('.cam-focus-sun').style.transform = `translateY(${-st.ev * 18}px)`; },
        end: () => { if (!st.lockAE) focusT = setTimeout(() => { focus.hidden = true; }, 1600); },
      });
      // swipe on the viewfinder or the mode row to change mode
      [frame, modeWrap].forEach((el) => U.drag(el, {
        axis: 'x',
        start: () => !st.rec && !st.busy,
        end: (e, p) => { if (p.dx < -40 || p.vx < -0.4) stepMode(1); else if (p.dx > 40 || p.vx > 0.4) stepMode(-1); },
      }));
      // mouse wheel zoom over the viewfinder
      frame.addEventListener('wheel', (e) => {
        if (st.front || st.mode === 'PANO') return;
        e.preventDefault();
        const i = ZOOMS.indexOf(st.zoom);
        const n = U.clamp(i + (e.deltaY < 0 ? 1 : -1), 0, ZOOMS.length - 1);
        if (n !== i && !frame._wheelT) { setZoom(ZOOMS[n]); frame._wheelT = setTimeout(() => { frame._wheelT = null; }, 260); }
      }, { passive: false });

      function showBadge(text, ms, keep) {
        if (!text) { badge.hidden = true; return; }
        badge.hidden = false;
        badge.textContent = text;
        clearTimeout(showBadge.t);
        if (!keep && ms) showBadge.t = setTimeout(() => { badge.hidden = true; }, ms);
        else if (keep && ms) showBadge.t = setTimeout(() => { badge.hidden = true; render(); }, ms);
      }
      function toastHint(t) {
        hint.hidden = false;
        hint.textContent = t;
        clearTimeout(toastHint.t);
        toastHint.t = setTimeout(() => { hint.hidden = true; if (st.mode === 'PORTRAIT' && !st.front) { hint.hidden = false; hint.textContent = sc.dark ? 'More light required.' : 'Place subject within 2.5 m.'; } }, 1300);
      }

      // hardware shutter: Camera Control + volume buttons while the camera is open (capture phase, before the OS handlers)
      const hw = (e) => {
        if (!JC.os.isOpen('camera')) return;
        const t = e.target.closest && e.target.closest('.hw-camctl, .hw-volup, .hw-voldown');
        if (!t) return;
        e.stopPropagation();
        e.preventDefault();
        press();
      };
      document.addEventListener('click', hw, true);
      const onKey = (e) => {
        if (!JC.os.isOpen('camera') || JC.kb.visible) return;
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); press(); }
        else if (e.key === 'ArrowLeft') stepMode(-1);
        else if (e.key === 'ArrowRight') stepMode(1);
      };
      window.addEventListener('keydown', onKey);
      const onMinute = () => { const old = sc.art; sc = scene(st.front); if (old !== sc.art) render(); };
      JC.bus.on('minute', onMinute);
      const offPhotos = JC.store.on('photos', () => paintThumb());
      const onLayout = () => { layoutFrame(); };
      JC.bus.on('layout', onLayout);
      JC.bus.on('kb', onLayout);

      function handle(it) {
        if (!it) return;
        if (it.selfie && !st.front) { st.front = true; st.zoom = 1; st.mode = 'PHOTO'; render(); }
        else if (it.selfie === false && st.front) { st.front = false; render(); }
        if (it.mode && MODES.includes(String(it.mode).toUpperCase())) setMode(String(it.mode).toUpperCase());
      }
      requestAnimationFrame(() => { render(); handle(intent0); });
      setTimeout(render, 60);
      return {
        intent: handle,
        show() { root.classList.remove('paused'); render(); },
        hide() {
          root.classList.add('paused');
          if (st.rec) stopRec(true);
          if (st.busy) { st.busy = false; clearTimeout(st.cdT); cancelAnimationFrame(st.panoRaf); count.hidden = true; nightDial.hidden = true; }
          closeCtrl();
        },
        back() { if (!ctrlStrip.hidden) { closeCtrl(); return true; } return false; },
        destroy() {
          document.removeEventListener('click', hw, true);
          window.removeEventListener('keydown', onKey);
          JC.bus.off('minute', onMinute);
          JC.bus.off('layout', onLayout);
          JC.bus.off('kb', onLayout);
          offPhotos();
          clearInterval(st.recT);
        },
      };
    },
  });
})();
