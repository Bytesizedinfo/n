/* Stillwater · the descent, the roll of names, the bottom, and what waits there */
(function () {
  'use strict';
  var SW = window.SW, art = SW.art;
  function $(s) { return document.querySelector(s); }
  var root = document.documentElement;

  /* =====================================================================
     DESCENT · a sticky scene driven by progress through a very tall section
     ===================================================================== */
  var descent = $('#descent'), stage = $('#descentStage'), cv = $('#deepCanvas');
  var naveEl = $('#nave'), congEl = $('#congregation'), handsEl = $('#handprints'), depthEl = $('#depth');
  var frags = Array.prototype.slice.call(document.querySelectorAll('#fragments p'));
  naveEl.appendChild(art.nave());

  // rows of the congregation, back to front
  var ROWS = [
    { n: 9, bottom: 33, scale: 0.42, fog: 0.42, blur: 1.4 },
    { n: 7, bottom: 23, scale: 0.58, fog: 0.58, blur: 0.9 },
    { n: 5, bottom: 11, scale: 0.8, fog: 0.75, blur: 0.5 },
    { n: 3, bottom: -2, scale: 1.1, fog: 0.9, blur: 0.2 }
  ];
  var figs = [], seed = 1;
  ROWS.forEach(function (r, ri) {
    var row = document.createElement('div');
    row.className = 'row';
    r.el = row;
    for (var i = 0; i < r.n; i++) {
      var f = document.createElement('div');
      f.className = 'fig';
      f.appendChild(art.drowned(seed++));
      var centre = Math.abs(i - (r.n - 1) / 2);
      // the front row turns last; the one in the middle turns very last
      var start = 0.48 + Math.random() * 0.1 + ri * 0.025 + (ri === 3 && centre === 0 ? 0.08 : 0);
      figs.push({ el: f, start: start, turn: -1 });
      row.appendChild(f);
    }
    congEl.appendChild(row);
  });

  var dctx = cv.getContext('2d'), dpr = 1, W = 0, H = 0;
  var rayCv = document.createElement('canvas'), rayCtx = rayCv.getContext('2d');
  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth; H = stage.clientHeight;
    cv.width = rayCv.width = Math.round(W * dpr); cv.height = rayCv.height = Math.round(H * dpr);
  }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  var snow = [];
  for (var i = 0; i < 150; i++) snow.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.8, a: 0.1 + Math.random() * 0.35, s: 0.2 + Math.random() * 0.8, w: Math.random() * 6.28 });
  var bubbles = [];

  function hexMix(a, b, t) { return SW.mix(a, b, SW.clamp(t, 0, 1)); }
  var inView = false, p = 0, lastNow = 0, handSeed = 0, handMarks = [0.74, 0.79, 0.84, 0.88, 0.91, 0.94];
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(descent);
  else inView = true;

  function progress() {
    var top = descent.getBoundingClientRect().top;
    return SW.clamp(-top / Math.max(1, descent.offsetHeight - window.innerHeight), 0, 1);
  }

  function drawDeep(now, dt) {
    var c = dctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, hexMix('#2A5653', '#030807', p * 1.15));
    g.addColorStop(1, hexMix('#0B2523', '#000101', p * 1.1));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // light from the surface, dying as you sink (drawn soft on their own layer)
    var la = 0.16 * (1 - SW.smooth(0, 0.7, p));
    if (la > 0.002) {
      var r = rayCtx;
      r.setTransform(dpr, 0, 0, dpr, 0, 0);
      r.globalCompositeOperation = 'source-over';
      r.clearRect(0, 0, W, H);
      for (var k = 0; k < 6; k++) {
        var x = W * (0.1 + k * 0.165) + Math.sin(now * 0.00022 + k * 1.7) * W * 0.035, w = W * (0.03 + (k % 3) * 0.018);
        var hg = r.createLinearGradient(x - w * 2, 0, x + w * 2, 0);
        hg.addColorStop(0, 'rgba(170,225,210,0)'); hg.addColorStop(0.5, 'rgba(170,225,210,' + (la * (0.6 + (k % 2) * 0.4)) + ')'); hg.addColorStop(1, 'rgba(170,225,210,0)');
        r.fillStyle = hg;
        r.beginPath(); r.moveTo(x - w, 0); r.lineTo(x + w, 0); r.lineTo(x + w * 2.6 + W * 0.05, H); r.lineTo(x - w * 1.4 + W * 0.05, H); r.closePath(); r.fill();
      }
      r.globalCompositeOperation = 'destination-in';
      var vg = r.createLinearGradient(0, 0, 0, H * 0.9);
      vg.addColorStop(0, 'rgba(0,0,0,1)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
      r.fillStyle = vg; r.fillRect(0, 0, W, H);
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalCompositeOperation = 'lighter';
      c.drawImage(rayCv, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the underside of the surface
      var sa = 0.22 * (1 - SW.smooth(0, 0.12, p));
      if (sa > 0.002) {
        var sg = c.createLinearGradient(0, 0, 0, H * 0.14);
        sg.addColorStop(0, 'rgba(200,235,225,' + sa + ')'); sg.addColorStop(1, 'rgba(200,235,225,0)');
        c.fillStyle = sg; c.fillRect(0, 0, W, H * 0.14);
      }
      c.globalCompositeOperation = 'source-over';
    }
    // marine snow drifts up past you as you sink
    var rise = 0.00004 * dt + Math.max(0, SW.velocity) * 0.00012;
    c.fillStyle = '#C9D8D0';
    for (var s = 0; s < snow.length; s++) {
      var q = snow[s];
      q.y -= rise * q.s * 3; q.w += dt * 0.0006;
      if (q.y < -0.02) { q.y = 1.02; q.x = Math.random(); }
      c.globalAlpha = q.a * (0.4 + 0.6 * (1 - p * 0.6));
      c.beginPath(); c.arc((q.x + Math.sin(q.w) * 0.006) * W, q.y * H, q.r, 0, 6.283); c.fill();
    }
    // bubbles near the surface
    if (p < 0.3 && Math.random() < 0.05) bubbles.push({ x: Math.random() * W, y: H + 10, r: 1.5 + Math.random() * 4, v: 0.04 + Math.random() * 0.06 });
    c.strokeStyle = '#D6E8E0'; c.lineWidth = 1;
    for (var b = bubbles.length - 1; b >= 0; b--) {
      var u = bubbles[b];
      u.y -= u.v * dt; u.x += Math.sin(u.y * 0.03) * 0.3;
      c.globalAlpha = 0.35 * (1 - p * 3);
      c.beginPath(); c.arc(u.x, u.y, u.r, 0, 6.283); c.stroke();
      if (u.y < -10 || c.globalAlpha <= 0) bubbles.splice(b, 1);
    }
    c.globalAlpha = 1;
  }

  function updateDescent(now) {
    var dt = Math.min(64, now - (lastNow || now)); lastNow = now;
    if (!inView) return;
    p = progress();
    drawDeep(now, dt);
    // the church emerges from the murk
    var nv = SW.smooth(0.1, 0.32, p) * (1 - SW.smooth(0.94, 1, p) * 0.8);
    naveEl.style.opacity = nv.toFixed(3);
    naveEl.style.transform = 'scale(' + (0.92 + p * 0.38).toFixed(4) + ') translateY(' + (-p * 4).toFixed(2) + '%)';
    // the congregation, then their faces, then they come closer
    congEl.style.opacity = (SW.smooth(0.3, 0.44, p) * (1 - SW.smooth(0.97, 1, p))).toFixed(3);
    for (var i = 0; i < figs.length; i++) {
      var f = figs[i], t = SW.smooth(f.start, f.start + 0.06, p);
      if (Math.abs(t - f.turn) > 0.004) { f.turn = t; f.el.style.setProperty('--turn', t.toFixed(3)); }
    }
    var a = SW.smooth(0.7, 0.95, p), step = Math.floor(a * 5 + 0.0001) / 5;
    ROWS.forEach(function (r, ri) {
      var k = 1 + step * (1.5 + ri * 0.55);
      var bottom = r.bottom - step * (10 + ri * 22);
      var tf = 'translateX(-50%) scale(' + (r.scale * k).toFixed(3) + ')';
      if (r.tf !== tf || r.b !== bottom) {
        r.tf = tf; r.b = bottom;
        r.el.style.transform = tf;
        r.el.style.bottom = bottom + '%';
        r.el.style.filter = 'brightness(' + (r.fog + step * 0.25).toFixed(2) + ') blur(' + Math.max(0, r.blur - step * 0.8).toFixed(2) + 'px)';
      }
    });
    // words
    for (var j = 0; j < frags.length; j++) {
      var fp = parseFloat(frags[j].getAttribute('data-p')), o = SW.smooth(fp, fp + 0.02, p) * (1 - SW.smooth(fp + 0.08, fp + 0.1, p));
      frags[j].style.opacity = o.toFixed(3);
    }
    depthEl.textContent = (2 + p * 39).toFixed(1).padStart(4, '0');
    // handprints on the glass
    while (handSeed < handMarks.length && p >= handMarks[handSeed]) addHand(handSeed++);
  }
  function addHand(n) {
    var h = document.createElement('div');
    h.className = 'handprint';
    var left = n % 2 ? 58 + Math.random() * 30 : 4 + Math.random() * 28;
    h.style.left = left + '%';
    h.style.top = (8 + Math.random() * 60) + '%';
    h.style.transform = 'rotate(' + ((Math.random() - 0.5) * 50).toFixed(1) + 'deg) scale(' + (0.8 + Math.random() * 0.5).toFixed(2) + ')';
    h.appendChild(art.handprint(n));
    handsEl.appendChild(h);
    requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('in'); }); });
  }
  SW.on('frame', updateDescent);

  /* =====================================================================
     MEMORIAL · your name is already on it
     ===================================================================== */
  var youName = $('#youName'), youYear = $('#youYear');
  youYear.textContent = new Date().getFullYear();
  function setName(n) { youName.textContent = n || 'You'; }
  setName(SW.guestName || SW.store.get('name', ''));
  SW.on('name', setName);

  /* =====================================================================
     THE BOTTOM
     ===================================================================== */
  var bottom = $('#bottom'), surf = $('#surfacing'), line = document.querySelector('.last-line');
  surf.appendChild(art.scareFace('su'));
  var scareEl = $('#scare'), scareFace = $('#scareFace');
  scareFace.appendChild(art.scareFace('sf'));

  var bottomSince = 0, scared = false, rest = 0;
  function atBottom() { return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3; }
  SW.on('frame', function (now) {
    var r = bottom.getBoundingClientRect();
    if (r.top > window.innerHeight) { bottomSince = 0; rest = 0; return; }
    var q = SW.clamp(-r.top / Math.max(1, bottom.offsetHeight - window.innerHeight), 0, 1);
    if (atBottom()) { if (!bottomSince) bottomSince = now; rest = Math.min(1, (now - bottomSince) / 1300); }
    else { bottomSince = 0; rest = 0; }
    var k = SW.clamp(q * 0.8 + rest * 0.2, 0, 1);
    surf.style.opacity = (0.04 + k * 0.32).toFixed(3);
    surf.style.filter = 'blur(' + (7 - k * 5).toFixed(2) + 'px)';
    surf.style.transform = 'translate(-50%, ' + (-40 + (1 - k) * 14).toFixed(2) + '%) scale(' + (0.46 + k * 0.16).toFixed(3) + ')';
    if (q > 0.55) line.classList.add('stay');
    if (!scared && bottomSince && now - bottomSince > 1300) scare();
  });
  function tryingToGoFurther() { if (!scared && bottomSince && performance.now() - bottomSince > 350) scare(); }
  window.addEventListener('wheel', function (e) { if (e.deltaY > 0 && atBottom()) tryingToGoFurther(); }, { passive: true });
  var touchY = null;
  window.addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (touchY != null && touchY - e.touches[0].clientY > 24 && atBottom()) tryingToGoFurther(); }, { passive: true });
  window.addEventListener('keydown', function (e) { if ((e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'End') && atBottom()) tryingToGoFurther(); });

  function scare() {
    scared = true;
    SW.emit('scare');
    document.body.classList.add('hush');
    SW.audio.silence();
    setTimeout(function () {
      scareEl.hidden = false;
      // restart the animation cleanly
      scareEl.classList.remove('go', 'black', 'fadeout');
      void scareEl.offsetWidth;
      scareEl.classList.add('go');
      SW.audio.scream();
      setTimeout(function () { scareEl.classList.add('black'); }, SW.reduced ? 1000 : 1350);
      setTimeout(reset, 3000);
    }, 480);
  }
  SW.scare = function () { if (!scared) scare(); };

  /* =====================================================================
     RESET LOOP · back at the top, nearly as you left it
     ===================================================================== */
  function applyReturned() {
    SW.returned = true;
    var n = SW.guestName || SW.store.get('name', '');
    var title = $('#heroTitle'), sub = $('#heroSub'), book = $('#heroBook');
    title.textContent = n ? 'Welcome back, ' + n + '.' : 'Welcome back.';
    title.style.maxWidth = '14ch';
    sub.textContent = 'Your cabin is ready. It has been ready for a long time. We kept the shutters closed for you.';
    book.textContent = 'Continue your stay';
    book.setAttribute('href', '#descent');
    $('#returnedNote').hidden = false;
    root.style.setProperty('--figure', '1');
  }
  function reset() {
    SW.store.set('returned', true);
    applyReturned();
    // the chat panel and toasts start fresh
    $('#cookie').hidden = true; $('#toast').hidden = true;
    window.scrollTo(0, 0);
    SW.resetDread(0.16);
    line.classList.remove('stay');
    scareEl.classList.add('fadeout');
    setTimeout(function () {
      scareEl.hidden = true;
      scareEl.classList.remove('go', 'black', 'fadeout');
      document.body.classList.remove('hush');
      scared = false; bottomSince = 0;
    }, 1500);
    SW.audio.resume();
    SW.emit('returned');
  }
  if (SW.returned) applyReturned();
})();
