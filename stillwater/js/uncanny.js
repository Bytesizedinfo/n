/* Stillwater · the site misbehaves
   Small wrongnesses that build up: text that has changed when you scroll back, words that flicker,
   eyes that open when you look, counters, a cookie banner that comes back, a booking form you can't refuse. */
(function () {
  'use strict';
  var SW = window.SW;
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function watch(el, fn, opts) {
    if (!window.IntersectionObserver) { fn(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { fn(e.isIntersecting, e); }); }, opts || { threshold: 0.25 }).observe(el);
  }

  /* ---------- text that changes once you've looked away ---------- */
  $$('[data-later]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.3'), seen = false, left = false, done = false;
    watch(el, function (vis) {
      if (done) return;
      if (vis) {
        if (left && SW.maxD >= at) { el.textContent = el.getAttribute('data-later'); done = true; }
        seen = true;
      } else if (seen) {
        left = true;
        if (SW.maxD >= at) { el.textContent = el.getAttribute('data-later'); done = true; }
      }
    }, { threshold: 0 });
  });
  /* ...or right in front of you, for things that are always on screen */
  $$('[data-swap]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.5'), orig = el.textContent;
    SW.on('d', function (d) {
      var want = d >= at ? el.getAttribute('data-swap') : orig;
      if (el.textContent !== want) el.textContent = want;
    });
  });

  /* ---------- subliminal flicker (never faster than once every 3 seconds) ---------- */
  $$('[data-flicker]').forEach(function (el) {
    var at = parseFloat(el.getAttribute('data-at') || '0.3'), visible = false, orig = el.textContent;
    watch(el, function (v) { visible = v; }, { threshold: 0.5 });
    (function tick() {
      setTimeout(function () {
        if (visible && SW.d >= at && SW.d < 0.8) {
          el.textContent = el.getAttribute('data-flicker');
          setTimeout(function () { el.textContent = orig; }, 120);
        }
        tick();
      }, 3200 + Math.random() * 5200);
    })();
  });

  /* ---------- counters and "guests on site" ---------- */
  var stats = $('#stats');
  if (stats) {
    var counted = false;
    watch(stats, function (vis) {
      if (!vis) return;
      if (!counted) {
        counted = true;
        $$('[data-count]', stats).forEach(function (b) {
          var to = parseFloat(b.getAttribute('data-count')), dec = parseInt(b.getAttribute('data-dec') || '0', 10), t0 = performance.now();
          if (SW.reduced || !to) return;
          (function step(now) {
            var t = Math.min(1, (now - t0) / 1600), v = to * (1 - Math.pow(1 - t, 3));
            b.textContent = v.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec });
            if (t < 1) requestAnimationFrame(step);
          })(t0);
        });
        setTimeout(function () {
          var on = $('#onsite');
          if (on) { on.textContent = '1,205'; on.classList.add('bump'); }
        }, 1900);
      } else if (SW.maxD >= 0.3) {
        // the departures counter hesitates
        var dep = $('#departures');
        if (dep && !dep._flinched) { dep._flinched = true; setTimeout(function () { dep.textContent = '1'; setTimeout(function () { dep.textContent = '0'; }, 160); }, 900); }
      }
    }, { threshold: 0.4 });
  }

  /* ---------- the founder's eyes are closed when you come back to her ---------- */
  $$('[data-blink]').forEach(function (el) {
    var visits = 0;
    watch(el, function (vis) {
      var f = el._face; if (!f) return;
      if (vis) {
        visits++;
        if (visits > 1 || SW.maxD >= 0.36) {
          f.shut = true;
          clearTimeout(el._t);
          el._t = setTimeout(function () { f.shut = false; }, 2200);
        }
      }
    }, { threshold: 0.6 });
  });

  /* ---------- parish record: redactions wash away, notes appear in the margin ---------- */
  var record = $('.record');
  if (record) {
    watch(record, function (vis) {
      if (!vis) return;
      $$('.redact', record).forEach(function (r, i) {
        if (r.classList.contains('open')) return;
        setTimeout(function () { if (SW.d >= 0.52) r.classList.add('open'); }, 1600 + i * 2200);
      });
      $$('.margin-note', record).forEach(function (n, i) {
        setTimeout(function () { if (SW.d >= 0.55) n.classList.add('show'); }, 3200 + i * 2600);
      });
    }, { threshold: 0.35 });
  }

  /* ---------- FAQ: a question that writes itself ---------- */
  var typed = $('#typedQ'), faq = $('#faqList');
  if (typed && faq) {
    var started = false;
    watch(faq, function (vis) {
      if (!vis || started || SW.maxD < 0.62) return;
      started = true;
      setTimeout(function () {
        typed.hidden = false;
        var target = $('.typing-target', typed), text = 'Why is the water getting higher?', i = 0;
        (function type() {
          target.textContent = text.slice(0, ++i);
          if (i < text.length) setTimeout(type, 70 + Math.random() * 90);
          else target.classList.add('done');
        })();
      }, 2200);
    }, { threshold: 0.3 });
  }

  /* ---------- the booking form ---------- */
  var form = $('#bookForm');
  if (form) {
    var name = $('#guestName'), stay = $('#stayType'), arrive = $('#arrive'), depart = $('#depart'), consent = $('#consent');
    var note = $('#formNote'), btn = $('#bookBtn'), confirmBox = $('#confirm');
    var today = new Date(), iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    arrive.min = iso;
    var saved = SW.store.get('name', '');
    if (saved) { name.value = saved; SW.guestName = saved; }
    name.addEventListener('input', function () {
      SW.guestName = name.value.trim();
      SW.store.set('name', SW.guestName);
      SW.emit('name', SW.guestName);
    });
    var locked = false;
    function lock() {
      if (locked) return;
      locked = true;
      arrive.value = iso; arrive.disabled = true; arrive.parentNode.classList.add('locked');
      $('#arriveLabel').textContent = 'Arrival · tonight';
      depart.type = 'text'; depart.value = '—'; depart.disabled = true; depart.parentNode.classList.add('locked');
      consent.checked = true;
      setTimeout(function () { stay.value = 'The Long Stay'; stay.parentNode.classList.add('locked'); }, 700);
    }
    watch(form, function (vis) { if (vis && SW.d >= 0.64) lock(); }, { threshold: 0.2 });
    stay.addEventListener('change', function () {
      if (!locked) return;
      setTimeout(function () { stay.value = 'The Long Stay'; note.textContent = 'The Long Stay is the only stay available.'; }, 450);
    });
    consent.addEventListener('change', function () {
      if (!locked || consent.checked) return;
      setTimeout(function () { consent.checked = true; note.textContent = 'You already agreed.'; }, 380);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!locked) { note.textContent = 'Thank you. We’ll confirm your dates within the hour.'; return; }
      btn.textContent = 'You are already here.';
      btn.disabled = true;
      note.textContent = '';
      confirmBox.hidden = false;
      SW.emit('booked');
    });
  }

  /* ---------- newsletter ---------- */
  var news = $('#newsForm');
  if (news) news.addEventListener('submit', function (e) {
    e.preventDefault();
    $('#newsNote').textContent = 'Thank you. We’ll write when the water is still.';
  });
  $$('.yr').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- cookie banner, and its return ---------- */
  var cookie = $('#cookie');
  if (cookie) {
    var accepted = SW.store.get('cookies', null);
    var body = $('#cookieBody'), title = $('#cookieTitle'), acceptBtn = $('#cookieAccept'), settingsBtn = $('#cookieSettings'), prefs = $('#cookiePrefs');
    var phase = 'first';
    if (!accepted && !SW.returned) setTimeout(function () { cookie.hidden = false; }, 1400);
    acceptBtn.addEventListener('click', function () {
      if (phase === 'first') { accepted = new Date().toISOString(); SW.store.set('cookies', accepted); }
      cookie.hidden = true;
    });
    settingsBtn.addEventListener('click', function () {
      prefs.hidden = !prefs.hidden;
      settingsBtn.textContent = prefs.hidden ? 'Settings' : 'Save preferences';
      if (prefs.hidden) acceptBtn.click();
    });
    $('#ckRemember').addEventListener('change', function (e) {
      if (!e.target.checked) setTimeout(function () { e.target.checked = true; }, 500);
    });
    // the descent is no place for banners
    SW.on('act', function (act) { if (act === 4) cookie.hidden = true; });
    SW.at(0.6, function () {
      if (SW.returned) return;
      setTimeout(function () {
        if (SW.act === 4) return;
        phase = 'return';
        cookie.classList.add('returned');
        prefs.hidden = true; settingsBtn.hidden = true;
        if (accepted) {
          var when = new Date(accepted);
          title.textContent = 'Your preferences were saved';
          body.textContent = 'You accepted on ' + when.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) + ' at ' + when.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '. We have kept something of yours. It can’t be given back.';
        } else {
          title.textContent = 'You never accepted';
          body.textContent = 'It didn’t matter. We kept something of yours anyway.';
        }
        acceptBtn.textContent = 'I understand';
        cookie.hidden = false;
      }, 1500);
    });
  }

  /* ---------- "best with headphones" ---------- */
  var toast = $('#toast');
  function hideToast() { toast.hidden = true; }
  if (toast) {
    $('#toastClose').addEventListener('click', hideToast);
    $('#toastAction').addEventListener('click', function () { SW.audio.start(); hideToast(); });
    SW.on('act', function (act) { if (act === 4) hideToast(); });
    SW.at(0.5, function () {
      if (SW.audio.on) return;
      setTimeout(function () {
        if (SW.audio.on || SW.act === 4) return;
        toast.hidden = false;
        setTimeout(hideToast, 10000);
      }, 1200);
    });
  }

  /* ---------- sound buttons ---------- */
  var toggle = $('#soundToggle'), listen = $('#listenBtn');
  function reflect(on) {
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.setAttribute('aria-label', on ? 'Turn off lake sounds' : 'Turn on lake sounds');
    if (listen) listen.querySelector('span').textContent = on ? 'Lake sounds on' : 'Listen to the lake';
  }
  if (toggle) toggle.addEventListener('click', function () { SW.audio.toggle(); });
  if (listen) listen.addEventListener('click', function () { SW.audio.toggle(); });
  SW.on('sound', reflect);

  /* ---------- tab title ---------- */
  var TITLES = [[0, 'Stillwater · Lakeside retreats at Hollin Mere'], [0.3, 'Stillwater · Stay a while'], [0.55, 'Stillwater · Stay'], [0.8, 'stay'], [0.95, 's t a y']];
  var baseTitle = TITLES[0][1];
  SW.on('d', function (d) {
    var t = TITLES[0][1];
    for (var i = 0; i < TITLES.length; i++) if (d >= TITLES[i][0]) t = TITLES[i][1];
    baseTitle = t;
    if (!document.hidden && document.title !== t) document.title = t;
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) document.title = SW.maxD >= 0.3 ? 'come back to the water' : '🌲 Your stay is waiting';
    else document.title = baseTitle;
  });

  /* ---------- ripples where you touch, once you're in the water ---------- */
  document.addEventListener('pointerdown', function (e) {
    if (SW.act < 3 || SW.reduced) return;
    var r = document.createElement('span');
    r.className = 'tap-ripple';
    r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(function () { r.remove(); }, 1700);
  }, { passive: true });

  /* ---------- the woman on the jetty ---------- */
  SW.on('d', function () {
    var on = SW.returned || SW.maxD >= 0.55;
    var want = on ? '1' : '0';
    if (document.documentElement.style.getPropertyValue('--figure') !== want) document.documentElement.style.setProperty('--figure', want);
  });

  /* ---------- unsubscribe: the only way out ---------- */
  $$('[data-unsubscribe]').forEach(function (b) {
    b.addEventListener('click', function () {
      ['returned', 'name', 'cookies'].forEach(SW.store.del);
      location.hash = '';
      location.reload();
    });
  });
})();
