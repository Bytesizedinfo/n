/* Hushling · 03:00 to 03:33
   The page becomes the Halo app. As you scroll, the camera watches the nursery empty, pans by itself,
   switches to your bedroom, then to the front camera of the phone you're holding. Then the face. */
(function () {
  'use strict';
  var SW = window.HL, art = SW.art;
  function $(s) { return document.querySelector(s); }
  var root = document.documentElement;

  /* =====================================================================
     THE TAKEOVER
     ===================================================================== */
  var tk = $('#takeover'), roomEl = $('#tkRoom'), timeEl = $('#tkTime'), alertsEl = $('#tkAlerts');
  var words = Array.prototype.slice.call(document.querySelectorAll('#tkWords p'));
  var N = SW.NANNY;
  var p = 0;
  function progress() {
    var r = tk.getBoundingClientRect();
    return SW.clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
  }
  // where things are at each moment of the descent through the night
  var CUTS = [0.55, 0.7, 0.92];
  function camAt(q) { return q < CUTS[0] ? 'nursery' : q < CUTS[1] ? 'parents' : q < CUTS[2] ? 'front' : 'lost'; }
  var lastCam = 'nursery';

  new SW.Feed($('#tkFeed'), {
    fps: 24,
    update: function (st, d, now, feed) {
      var q = p, cam = camAt(q);
      st.lost = cam === 'lost';
      st.cam = cam === 'lost' ? 'front' : cam;
      st.ir = true; st.ptz = false; st.presence = 1; st.eye = false; st.rock = 0; st.mobile = 0.2; st.front = null; st.nanny = null; st.baby = 'sleep';
      if (cam === 'nursery') {
        st.pan = feed.panFor(q < 0.12 ? 640 : 800);
        if (q < 0.12) { st.nanny = N.corner; st.presence = 2; }
        else if (q < 0.26) { st.nanny = N.cot; st.baby = 'look'; st.presence = 2; st.mobile = 0; }
        else {
          st.baby = 'gone'; st.rock = 1; st.mobile = 0.08; st.eye = true;
          if (q >= 0.4) {
            // the camera moves on its own: left to the window, then right across to the door
            st.ptz = true;
            var k = (q - 0.4) / 0.15;
            st.pan = k < 0.3 ? SW.lerp(0.5, 0, k / 0.3) : SW.lerp(0, 1, (k - 0.3) / 0.7);
            if (st.pan > 0.82) st.nanny = { pose: 'stand', x: 1464, foot: 606, scale: 0.78 };
          }
        }
      } else if (cam === 'parents') {
        st.pan = feed.panFor(1150); st.nanny = { pose: 'hold', x: 1290, foot: 860, scale: 1.05 };
      } else if (cam === 'front') {
        st.pan = feed.panFor(q < 0.77 ? 1030 : 960);
        if (q < 0.77) st.front = { pose: 'stand', x: 1255, foot: 662, scale: 0.9 };
        else if (q < 0.84) st.front = { pose: 'stand', x: 1150, foot: 1010, scale: 1.6 };
        else st.front = { pose: 'head', x: 1100, y: 440, scale: 1.1 + (q - 0.84) * 3 };
      }
      // static where the picture cuts
      var nearCut = 1;
      CUTS.forEach(function (c) { nearCut = Math.min(nearCut, Math.abs(q - c)); });
      st.staticAmt = SW.clamp(1 - nearCut / 0.012, 0, 1) * 0.9 + (q > 0.88 ? (q - 0.88) * 4 : 0);
    }
  });

  var ALERTS = [
    [0.02, 'In the room: 2', true], [0.12, 'Night Shift is settling Maisie'], [0.26, 'Maisie is out of view', true],
    [0.32, 'Night Shift: “She’s with me.”'], [0.42, 'Halo was moved · PTZ auto'], [0.5, 'Door opened · Landing', true],
    [0.56, 'Motion in the Parents’ room', true], [0.64, 'Night Shift: “She’s asleep. I’ll take it from here.”'],
    [0.71, 'Front camera turned on', true], [0.84, 'Faces detected: 2', true]
  ];
  var shown = 0;
  function addAlert(a) {
    var li = document.createElement('li');
    if (a[2]) li.className = 'warn';
    li.innerHTML = '<small></small><span></span>';
    li.querySelector('small').textContent = SW.clock(0.8 + a[0] * 0.2);
    li.querySelector('span').textContent = a[1];
    alertsEl.appendChild(li);
    while (alertsEl.children.length > 4) alertsEl.firstChild.remove();
  }

  var inView = false;
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(tk);
  SW.on('frame', function () {
    if (!inView) return;
    p = progress();
    var cam = camAt(p);
    if (cam !== lastCam) { SW.audio.static(0.5, 0.4); lastCam = cam; }
    var room = cam === 'parents' ? 'Parents’ room' : cam === 'front' ? 'Front camera' : cam === 'lost' ? 'No signal' : 'Nursery';
    if (roomEl.textContent !== room) roomEl.textContent = room;
    var t = SW.clock(SW.d);
    if (timeEl.textContent !== t) timeEl.textContent = t;
    while (shown < ALERTS.length && p >= ALERTS[shown][0]) addAlert(ALERTS[shown++]);
    for (var i = 0; i < words.length; i++) {
      var wp = parseFloat(words[i].getAttribute('data-p'));
      var o = SW.smooth(wp, wp + 0.02, p) * (1 - SW.smooth(wp + 0.09, wp + 0.11, p));
      words[i].style.opacity = o.toFixed(3);
    }
  });

  /* =====================================================================
     THE BOTTOM · timed from the section's own position, never "the end of the document"
     ===================================================================== */
  var bottom = $('#bottom'), line = document.querySelector('.last-line');
  var scareEl = $('#scare');
  $('#scareFace').appendChild(art.irFace());
  var scared = false, stayedSince = 0, deepSince = 0, q = -1;
  function bottomProgress() {
    var r = bottom.getBoundingClientRect();
    if (r.top > window.innerHeight) return -1;
    return SW.clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
  }
  SW.on('frame', function (now) {
    q = bottomProgress();
    if (q < 0) { stayedSince = 0; deepSince = 0; return; }
    if (q >= 0.55) { if (!stayedSince) stayedSince = now; } else stayedSince = 0;
    if (q >= 0.97) { if (!deepSince) deepSince = now; } else deepSince = 0;
    if (stayedSince) line.classList.add('stay');
    if (scared) return;
    if ((stayedSince && now - stayedSince > 2500) || (deepSince && now - deepSince > 1000)) scare();
  });
  function tryingToGoFurther() { if (!scared && q >= 0.9) scare(); }
  window.addEventListener('wheel', function (e) { if (e.deltaY > 0) tryingToGoFurther(); }, { passive: true });
  var touchY = null;
  window.addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function (e) { if (touchY != null && touchY - e.touches[0].clientY > 24) tryingToGoFurther(); }, { passive: true });
  window.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' || e.key === 'End') tryingToGoFurther(); });

  function scare() {
    scared = true;
    SW.emit('scare');
    document.body.classList.add('hush');
    SW.audio.silence();
    setTimeout(function () {
      scareEl.hidden = false;
      scareEl.classList.remove('go', 'black', 'fadeout');
      void scareEl.offsetWidth;
      scareEl.classList.add('go');
      SW.audio.scream();
      setTimeout(function () { scareEl.classList.add('black'); }, SW.reduced ? 1000 : 1350);
      setTimeout(reset, 3000);
    }, 520);
  }
  SW.scare = function () { if (!scared) scare(); };

  /* =====================================================================
     RESET LOOP · back at the top, and Halo kept watch while you were gone
     ===================================================================== */
  function applyReturned() {
    SW.returned = true;
    $('#heroTitle').textContent = 'Welcome back.';
    $('#heroSub').textContent = 'Halo kept watch while you were away. Maisie slept 14h 03m. Visitors: 1.';
    var buy = $('#heroBuy'); buy.textContent = 'Keep watching'; buy.setAttribute('href', '#takeover');
    $('#returnedNote').hidden = false;
    $('#visitors').textContent = '1';
  }
  function reset() {
    SW.store.set('returned', true);
    applyReturned();
    $('#ask').hidden = true; $('#toast').hidden = true;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0; document.body.scrollTop = 0;
    SW.resetDread(0.16);
    line.classList.remove('stay');
    scareEl.classList.add('fadeout');
    setTimeout(function () {
      scareEl.hidden = true;
      scareEl.classList.remove('go', 'black', 'fadeout');
      document.body.classList.remove('hush');
      scared = false; stayedSince = 0; deepSince = 0;
      SW.notify('Welcome back. She’s been good.', true);
    }, 1500);
    SW.audio.resume();
    SW.emit('returned');
  }
  if (SW.returned) applyReturned();
})();
