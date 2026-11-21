/* Hushling · the site misbehaves
   Text that changes when you look back (shared with Stillwater), the three monitors on the page,
   push notifications, the cry translator, Night Shift, the activity log and the shop. */
(function () {
  'use strict';
  var SW = window.HL;
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function watch(el, fn, opts) {
    if (!window.IntersectionObserver) { fn(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting, e); }); }, opts || { threshold: 0.25 }).observe(el);
  }

  /* ---------- text that changes once you've looked away (as in Stillwater) ---------- */
  $$('[data-later]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.3'), seen = false, done = false;
    watch(el, function (vis) {
      if (done) return;
      if (vis && seen && SW.maxD >= at) { el.textContent = el.getAttribute('data-later'); done = true; }
      if (vis) seen = true;
      else if (seen && SW.maxD >= at) { el.textContent = el.getAttribute('data-later'); done = true; }
    }, { threshold: 0 });
  });
  $$('[data-swap]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.5'), orig = el.textContent;
    SW.on('d', function (d) { var want = d >= at ? el.getAttribute('data-swap') : orig; if (el.textContent !== want) el.textContent = want; });
  });
  $$('[data-flicker]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.3'), visible = false, orig = el.textContent;
    watch(el, function (v) { visible = v; }, { threshold: 0.5 });
    (function tick() {
      setTimeout(function () {
        if (visible && SW.d >= at && SW.d < 0.8) { el.textContent = el.getAttribute('data-flicker'); setTimeout(function () { el.textContent = orig; }, 140); }
        tick();
      }, 3200 + Math.random() * 5200);
    })();
  });
  $$('.yr').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- sound buttons ---------- */
  var toggle = $('#soundToggle'), listen = $('#listenBtn');
  function reflect() {
    var on = SW.audio.on;
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.setAttribute('aria-label', on ? 'Turn off sound' : 'Turn on sound');
    listen.querySelector('span').textContent = on && SW.audio.lullabyOn ? 'Stop the lullaby' : 'Hear Halo’s lullaby';
    var lb = $('#ctlLullaby'); if (lb) lb.setAttribute('aria-pressed', on && SW.audio.lullabyOn ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () { SW.audio.toggle(); });
  listen.addEventListener('click', function () { SW.audio.lullaby(!(SW.audio.on && SW.audio.lullabyOn)); reflect(); });
  SW.on('sound', reflect); SW.on('lullaby', reflect);

  /* =====================================================================
     THE MONITORS
     ===================================================================== */
  var CORNER = { pose: 'stand', x: 470, foot: 616, scale: 0.82 };
  var NEARER = { pose: 'tilt', x: 512, foot: 630, scale: 0.9 };
  var BEHIND_COT = { pose: 'lean', x: 800, foot: 640, scale: 0.95 };
  SW.NANNY = { corner: CORNER, nearer: NEARER, cot: BEHIND_COT };

  /* hero phone: a calm baby, until you've seen what you've seen */
  var heroStatus = $('#heroStatus');
  new SW.Feed($('#heroFeed'), {
    fps: 20,
    update: function (st) {
      st.baby = 'sleep'; st.mobile = 0.35; st.ir = false;
      st.nanny = SW.returned || SW.maxD >= 0.6 ? { pose: 'stand', x: CORNER.x, foot: CORNER.foot, scale: CORNER.scale, day: true } : null;
    }
  });
  SW.on('returned', function () { heroStatus.innerHTML = '<i class="dot"></i>Maisie is with Nanny'; });
  if (SW.returned) heroStatus.innerHTML = '<i class="dot"></i>Maisie is with Nanny';

  /* live demo: your controls, her rules */
  var demo = { ir: false, panTarget: 0.5, irCount: 0, autoUntil: 0, nextAuto: 0, talking: false, everIR: false };
  var hint = $('#demoHint'), hintTimer = 0;
  function showHint(text, ms) { hint.textContent = text; hint.hidden = false; clearTimeout(hintTimer); hintTimer = setTimeout(function () { hint.hidden = true; }, ms || 1800); }
  var presenceEl = $('#presence'), rateEl = $('#breathRate');
  new SW.Feed($('#demoFeed'), {
    fps: 24,
    update: function (st, d, now) {
      st.pan += (demo.panTarget - st.pan) * 0.08;
      // the camera "helps" in low light once things start to happen
      if (d >= 0.3 && !demo.ir) {
        if (!demo.nextAuto) demo.nextAuto = now + 2500;
        if (now > demo.nextAuto) { demo.autoUntil = now + 1400; demo.nextAuto = now + 8000 + Math.random() * 4000; showHint('LOW LIGHT · IR AUTO', 1400); }
      }
      st.ir = demo.ir || now < demo.autoUntil;
      var stage = Math.max(demo.irCount - 1, d >= 0.4 ? 2 : d >= 0.33 ? 1 : 0);
      st.nanny = d < 0.25 ? null : stage >= 2 ? BEHIND_COT : stage === 1 ? NEARER : CORNER;
      st.baby = d < 0.36 ? 'sleep' : 'look';
      st.mobile = d >= 0.36 ? 0 : SW.audio.lullabyOn ? 0.9 : 0.35;
      st.rock = d >= 0.38 ? 1 : 0;
      st.eye = d >= 0.42;
      st.presence = d >= 0.32 ? 2 : 1;
      st.mic = demo.talking;
      var p = String(st.presence);
      if (presenceEl.textContent !== p) { presenceEl.textContent = p; presenceEl.classList.toggle('alert', st.presence > 1); }
      var r = d >= 0.34 ? '34 · 11' : '34';
      if (rateEl.textContent !== r) rateEl.textContent = r;
    }
  });
  SW.breathGraph($('#breathGraph'));
  $('#ctlLeft').addEventListener('click', function () { demo.panTarget = Math.max(0, demo.panTarget - 0.25); });
  $('#ctlRight').addEventListener('click', function () { demo.panTarget = Math.min(1, demo.panTarget + 0.25); });
  var irBtn = $('#ctlIR');
  irBtn.addEventListener('click', function () {
    demo.ir = !demo.ir;
    irBtn.setAttribute('aria-pressed', demo.ir ? 'true' : 'false');
    if (demo.ir) { demo.everIR = true; if (SW.d >= 0.25) demo.irCount++; }
  });
  $('#ctlLullaby').addEventListener('click', function () { SW.audio.lullaby(!(SW.audio.on && SW.audio.lullabyOn)); reflect(); if (!SW.audio.on) showHint('♪ LULLABY', 1500); });
  var talk = $('#ctlTalk');
  function talkStart(e) { if (e) e.preventDefault(); if (demo.talking) return; demo.talking = true; talk.classList.add('held'); talk.textContent = 'Talking…'; SW.audio.talk(true); }
  function talkEnd() {
    if (!demo.talking) return;
    demo.talking = false; talk.classList.remove('held'); talk.textContent = 'Hold to talk'; SW.audio.talk(false);
    setTimeout(function () {
      if (SW.d >= 0.3) { SW.audio.shh(0.6); showHint('“shh”', 1800); }
      else showHint('Halo turned its voice back up', 1800);
    }, 650);
  }
  talk.addEventListener('pointerdown', talkStart);
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(function (ev) { talk.addEventListener(ev, talkEnd); });
  talk.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') talkStart(e); });
  talk.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') talkEnd(); });
  // steps light up the control they describe
  var CTL = { pan: '#ctlRight', ir: '#ctlIR', lullaby: '#ctlLullaby', talk: '#ctlTalk' };
  $$('.step').forEach(function (step) {
    watch(step, function (vis) {
      step.classList.toggle('active', vis);
      var sel = CTL[step.getAttribute('data-step')];
      if (sel) $(sel).style.boxShadow = vis ? '0 0 0 2px var(--amber)' : '';
    }, { threshold: 0.6 });
  });

  /* picture-in-picture: the demo nursery follows you down the page */
  var pip = $('#pip'), pipLabel = $('#pipLabel'), pipClosed = false, demoVisible = false, pipAuto = { until: 0, next: 0 };
  watch($('#live'), function (v) { demoVisible = v; }, { threshold: 0.05 });
  new SW.Feed($('#pipFeed'), {
    fps: 15,
    update: function (st, d, now) {
      st.osd = false;
      if (d < 0.5) {
        if (d >= 0.3) {
          if (!pipAuto.next) pipAuto.next = now + 3000;
          if (now > pipAuto.next) { pipAuto.until = now + 1300; pipAuto.next = now + 7000 + Math.random() * 4000; }
        }
        st.ir = now < pipAuto.until; st.baby = d < 0.36 ? 'sleep' : 'look'; st.nanny = d >= 0.3 ? (d >= 0.4 ? NEARER : CORNER) : null; st.rock = 0; st.eye = false; st.mobile = 0.35;
      } else if (d < 0.62) {
        st.ir = true; st.baby = 'look'; st.nanny = BEHIND_COT; st.mobile = 0; st.rock = 1;
      } else {
        st.ir = true; st.baby = 'gone'; st.nanny = null; st.eye = true; st.rock = 1; st.mobile = 0.12;
      }
    }
  });
  SW.on('frame', function () {
    var d = SW.d;
    var want = d >= 0.08 && SW.act < 4 && !demoVisible && !(pipClosed && d < 0.5) && !document.body.classList.contains('hush');
    if (pip.hidden === want) pip.hidden = !want;
    var label = d >= 0.5 ? 'Your nursery · live' : 'Demo nursery · live';
    if (pipLabel.textContent !== label) pipLabel.textContent = label;
  });
  $('#pipClose').addEventListener('click', function () { pipClosed = true; pip.hidden = true; });
  SW.at(0.5, function () { if (pipClosed) notify('Halo can’t be closed while she’s settling.', true); pipClosed = false; });
  $('#pipOpen').addEventListener('click', function () { if (SW.d < 0.5) $('#live').scrollIntoView({ behavior: SW.reduced ? 'auto' : 'smooth' }); });

  /* =====================================================================
     PUSH NOTIFICATIONS (and asking permission for them)
     ===================================================================== */
  var notifs = $('#notifs');
  var MOON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M20.5 4.5a12 12 0 1 0 7 19.5A10 10 0 0 1 20.5 4.5z"/></svg>';
  function notify(text, dark) {
    if (document.body.classList.contains('hush')) return;
    var n = document.createElement('div');
    n.className = 'notif' + (dark || SW.act >= 3 ? ' dark' : '');
    n.innerHTML = '<span class="ni">' + MOON + '</span><span class="nt">Halo</span><span class="nw">' + (SW.d >= 0.3 ? SW.clock(SW.d) : 'now') + '</span><span class="nb"></span>';
    n.querySelector('.nb').textContent = text;
    notifs.prepend(n);
    while (notifs.children.length > 3) notifs.lastChild.remove();
    setTimeout(function () { n.classList.add('out'); setTimeout(function () { n.remove(); }, 450); }, SW.act >= 4 ? 9000 : 6000);
  }
  SW.notify = notify;
  var NOTES = [
    [0.05, 'Maisie is asleep 🌙'],
    [0.16, 'Breathing: steady, 34 a minute.'],
    [0.3, 'Someone is in the Nursery.'],
    [0.4, 'Night Shift is settling Maisie.'],
    [0.47, 'Voice detected in the Nursery (not yours).'],
    [0.58, 'Maisie is looking at the camera.'],
    [0.66, 'Maisie is out of view.'],
    [0.74, 'Door opened: Landing.']
  ];
  NOTES.forEach(function (n) { SW.at(n[0], function () { setTimeout(function () { if (!SW.returned || n[0] > 0.05) notify(n[1]); }, n[0] === 0.05 ? 4500 : 600); }); });

  var ask = $('#ask'), askState = SW.store.get('notify', null);
  if (!askState && !SW.returned) setTimeout(function () { ask.hidden = false; }, 1800);
  $('#askAllow').addEventListener('click', function () { askState = 'allowed'; SW.store.set('notify', askState); ask.hidden = true; notify('Thanks. Halo will tell you if anything happens.'); });
  $('#askBlock').addEventListener('click', function () { askState = 'blocked'; SW.store.set('notify', askState); ask.hidden = true; });
  SW.at(0.52, function () { if (askState !== 'allowed') setTimeout(function () { notify('You turned notifications off. Halo doesn’t need permission.', true); }, 2500); });
  SW.on('act', function (act) { if (act >= 3) ask.hidden = true; });

  /* "best with headphones" */
  var toast = $('#toast');
  function hideToast() { toast.hidden = true; }
  $('#toastClose').addEventListener('click', hideToast);
  $('#toastAction').addEventListener('click', function () { SW.audio.start(); hideToast(); });
  SW.at(0.45, function () { setTimeout(function () { if (!SW.audio.on && SW.act < 4) { toast.hidden = false; setTimeout(hideToast, 10000); } }, 1500); });
  SW.on('act', function (act) { if (act === 4) hideToast(); });

  /* =====================================================================
     CRY TRANSLATOR
     ===================================================================== */
  var waveCv = $('#cryWave'), wctx = waveCv.getContext('2d'), playingUntil = 0, cryShape = [];
  for (var i = 0; i < 64; i++) cryShape.push(0.2 + Math.random() * 0.8);
  var EARLY = [['Hungry', 92], ['Tired', 88], ['Wants Mummy', 95]];
  var LATE = [['Wants the lady', 97], ['Scared of the lady', 99], ['Saying her name', 99]];
  var label = $('#cryLabel'), meter = $('#cryMeter'), conf = $('#cryConf');
  function playCry(i) {
    SW.audio.cry(i);
    playingUntil = performance.now() + 1700;
    label.textContent = 'Listening…'; conf.textContent = ''; meter.style.width = '0%';
    setTimeout(function () {
      var r = (SW.d >= 0.53 ? LATE : EARLY)[i];
      label.textContent = r[0]; conf.textContent = r[1] + '%'; meter.style.width = r[1] + '%';
    }, 1800);
  }
  $$('[data-cry]').forEach(function (b) { b.addEventListener('click', function () { playCry(+b.getAttribute('data-cry')); }); });
  var autoCried = false;
  watch($('#translator'), function (vis) { if (vis && !autoCried && SW.d >= 0.5) { autoCried = true; setTimeout(function () { playCry(2); }, 2200); } }, { threshold: 0.5 });
  SW.on('frame', function (now) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = Math.round(waveCv.clientWidth * dpr), H = Math.round(waveCv.clientHeight * dpr);
    if (!W || !H) return;
    if (waveCv.width !== W || waveCv.height !== H) { waveCv.width = W; waveCv.height = H; }
    wctx.clearRect(0, 0, W, H);
    var live = now < playingUntil, n = cryShape.length, bw = W / n;
    wctx.fillStyle = getComputedStyle(waveCv.parentNode.parentNode).getPropertyValue('--wave').trim() || '#9AA3EC';
    for (var k = 0; k < n; k++) {
      var a = live ? cryShape[k] * (0.5 + 0.5 * Math.abs(Math.sin(now / 90 + k * 0.7))) : 0.06 + cryShape[k] * 0.06;
      var h = a * H * 0.8;
      wctx.globalAlpha = live ? 1 : 0.5;
      wctx.fillRect(k * bw + bw * 0.2, (H - h) / 2, bw * 0.6, h);
    }
    wctx.globalAlpha = 1;
  });

  /* =====================================================================
     NIGHT SHIFT, SETUP, THE LOG, THE SHOP
     ===================================================================== */
  var ns = $('#nsSwitch'), nsNote = $('#nsNote');
  ns.addEventListener('change', function () {
    if (ns.checked) return;
    setTimeout(function () { ns.checked = true; nsNote.textContent = 'Night Shift can’t be turned off while she’s settling.'; }, 450);
  });

  var extra = $('.setup-list .extra');
  watch($('.setup-list'), function (vis) {
    if (vis && SW.maxD >= 0.62) setTimeout(function () { extra.hidden = false; }, 3500);
  }, { threshold: 0.3 });

  var events = $$('#events li'), logStarted = false;
  watch($('#events'), function (vis) {
    if (!vis || logStarted) return;
    logStarted = true;
    events.forEach(function (li, k) { setTimeout(function () { li.classList.add('in'); }, 300 + k * 650); });
  }, { threshold: 0.15 });

  var basket = $('#basket'), item = $('#basketItem'), delivery = $('#basketDelivery'), checkout = $('#checkout'), shopNote = $('#shopNote');
  function finish() { return $('#finishDusk').checked ? 'Dusk' : 'Moon white'; }
  $('#addToBasket').addEventListener('click', function () {
    basket.hidden = false;
    if (SW.d >= 0.66) { item.textContent = '1 × Halo 2 (already installed)'; delivery.textContent = 'Already in your home'; }
    else { item.textContent = '1 × Halo 2, ' + finish(); delivery.textContent = 'Free · 2 to 3 days'; }
  });
  checkout.addEventListener('click', function () {
    if (SW.d >= 0.66) { checkout.textContent = 'She’s already here.'; checkout.disabled = true; shopNote.textContent = 'Order complete. Halo will take it from here.'; }
    else shopNote.textContent = 'This is a demo shop, so nothing was charged.';
  });
  $('#newsForm').addEventListener('submit', function (e) { e.preventDefault(); $('#newsNote').textContent = 'Thanks. Your first tip arrives tonight.'; });

  /* ---------- counters ---------- */
  $$('[data-count]').forEach(function (b) {
    var to = parseFloat(b.getAttribute('data-count')), done = false;
    watch(b, function (vis) {
      if (!vis || done || SW.reduced) return;
      done = true;
      var t0 = performance.now();
      (function step(now) { var t = Math.min(1, (now - t0) / 1600); b.textContent = Math.round(to * (1 - Math.pow(1 - t, 3))).toLocaleString('en-GB'); if (t < 1) requestAnimationFrame(step); })(t0);
    }, { threshold: 0.6 });
  });

  /* ---------- tab title ---------- */
  var base = 'Hushling Halo';
  SW.on('d', function (d) {
    var t = d < 0.3 ? 'Hushling Halo · the baby monitor that never sleeps' : d < 0.55 ? 'Halo · Nursery · live' : '● ' + SW.clock(d) + ' · Nursery';
    base = t;
    if (!document.hidden && document.title !== t) document.title = t;
  });
  document.addEventListener('visibilitychange', function () {
    document.title = document.hidden ? (SW.maxD >= 0.3 ? 'She’s awake. Come back.' : '👶 Maisie is asleep') : base;
  });

  /* ---------- unsubscribe: the only way out ---------- */
  $$('[data-unsubscribe]').forEach(function (b) {
    b.addEventListener('click', function () { ['returned', 'notify'].forEach(SW.store.del); location.hash = ''; location.reload(); });
  });
})();
