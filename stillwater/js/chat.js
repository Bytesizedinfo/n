/* Stillwater · Wren, the live-chat assistant
   Starts as the usual "Hi there! 👋" sales chat and gets less helpful the deeper you go. */
(function () {
  'use strict';
  var SW = window.SW;
  function $(s) { return document.querySelector(s); }
  var root = $('#chat'), log = $('#chatLog'), panel = $('#chatPanel'), launch = $('#chatLaunch'), badge = $('#chatBadge');
  var preview = $('#chatPreview'), previewText = $('#chatPreviewText'), form = $('#chatForm'), input = $('#chatInput');
  var nameEl = $('#chatName'), statusEl = $('#chatStatus'), closeBtn = $('#chatClose');
  if (!root) return;

  ['#chatHeadAvatar', '#chatLaunchAvatar'].forEach(function (s) { $(s).appendChild(SW.art.face('wren', 'chat').el); });

  var unread = 0, open = false, queue = [], busy = false, previewTimer = 0;

  function clockPhrase() {
    var now = new Date(), h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0');
    var h12 = ((h + 11) % 12) + 1;
    if (h >= 22 || h < 5) return 'It’s ' + h12 + ':' + m + ' where you are. Late to be reading about lakes.';
    if (h < 12) return 'It’s ' + h12 + ':' + m + ' in the morning where you are. The mist will be lifting off the water now.';
    if (h < 18) return 'It’s ' + h12 + ':' + m + ' in the afternoon where you are. It gets dark early by the water.';
    return 'It’s ' + h12 + ':' + m + ' where you are. Nearly time to close your shutters.';
  }

  var SCRIPT = [
    { at: 0, delay: 6500, text: 'Hi there! 👋 I’m Wren from the Stillwater team. Thinking about a stay at Hollin Mere?' },
    { at: 0.07, text: 'Just so you know, Seven Days of Stillness has 2 rooms left this autumn 🍂' },
    { at: 0.24, text: 'Still there?' },
    { at: 0.33, text: 'You read slowly. That’s good. Slow is good here.' },
    { at: 0.43, text: clockPhrase },
    { at: 0.56, text: 'please don’t go down to the water', cls: 'lower', stage: 3 },
    { at: 0.65, text: 'they can hear you scrolling', cls: 'lower' },
    { at: 0.72, text: 'i was a guest too. i booked the weekend reset. that was in 1987.', cls: 'lower' },
    { at: 0.84, text: 'wren isn’t here anymore', cls: 'drowned', stage: 4, name: 'w r e n', status: 'Offline' },
    { at: 0.93, text: 'stay', cls: 'drowned', stage: 5, name: '—', status: '' }
  ];

  function setStage(n) { root.setAttribute('data-stage', String(n)); }
  function setWho(name, status) {
    if (name != null) nameEl.textContent = name;
    if (status != null) statusEl.innerHTML = status ? (status === 'Online' ? '<i class="dot"></i>Online · usually replies in minutes' : status) : '&nbsp;';
  }
  function add(text, who, cls) {
    var m = document.createElement('div');
    m.className = 'msg ' + who + (cls ? ' ' + cls : '');
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function typing(ms, then) {
    var t = document.createElement('div');
    t.className = 'msg them typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); if (then) then(); }, ms);
  }
  function showPreview(text) {
    if (open || document.body.classList.contains('hush')) return;
    // on phones, don't stack a speech bubble on top of the cookie banner
    if (window.innerWidth < 600 && !document.getElementById('cookie').hidden) return;
    previewText.textContent = text;
    preview.hidden = false;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () { preview.hidden = true; }, SW.act >= 3 ? 9000 : 6500);
  }
  function say(item) {
    var text = typeof item.text === 'function' ? item.text() : item.text;
    if (item.stage) setStage(item.stage);
    if (item.name != null || item.status != null) setWho(item.name, item.status);
    add(text, 'them', item.cls);
    if (!open) { unread++; badge.textContent = String(unread); badge.hidden = false; showPreview(text); }
  }
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    var item = queue.shift();
    var wait = Math.min(2400, 700 + (typeof item.text === 'string' ? item.text.length * 18 : 900));
    typing(wait, function () { say(item); busy = false; setTimeout(pump, 500); });
  }
  function enqueue(item) {
    queue.push(item);
    if (queue.length > 2) queue.splice(0, queue.length - 2); // scrolled past fast: keep the latest
    pump();
  }

  SCRIPT.forEach(function (item) {
    SW.at(item.at, function () {
      if (item.delay) setTimeout(function () { enqueue(item); }, item.delay);
      else enqueue(item);
    });
  });

  // in act III, Wren sometimes starts typing and then thinks better of it
  SW.at(0.6, function () {
    setTimeout(function () { if (!busy) typing(3400); }, 9000);
  });

  function setOpen(v) {
    open = v;
    panel.hidden = !v;
    preview.hidden = true;
    launch.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (v) { unread = 0; badge.hidden = true; setTimeout(function () { input.focus({ preventScroll: true }); }, 50); log.scrollTop = log.scrollHeight; }
  }
  launch.addEventListener('click', function () { setOpen(!open); });
  preview.addEventListener('click', function () { setOpen(true); });
  closeBtn.addEventListener('click', function () { setOpen(false); });

  var REPLIES = {
    1: function (q) {
      if (/pric|cost|£|how much/i.test(q)) return 'Stays start from £340 per person, all meals included 🌿';
      if (/book|availab|date|room/i.test(q)) return 'You can book using the form further down the page, or I can hold a cabin for you!';
      if (/dog|pet/i.test(q)) return 'We love dogs, but they don’t like the water here, so we ask guests to leave them at home.';
      return 'Thanks for your message! A member of our team will reply within the hour 😊';
    },
    2: function (q) {
      if (/leave|go home|exit|out/i.test(q)) return 'Most guests find they don’t want to.';
      if (/who|what are you|real/i.test(q)) return 'I’m Wren. I look after new arrivals.';
      return ['Of course. We’ll keep a room for you.', 'You can ask Sister Agnes when you arrive.', 'Mm.'][Math.floor(Math.random() * 3)];
    },
    3: function (q) {
      var low = q.toLowerCase().replace(/[^\w\s']/g, '').trim();
      return low ? '"' + low + '". we used to say that too' : 'nobody reads these anymore';
    },
    4: function () { return ['shhh', 'you’re too loud', 'be still', 'we can hear you breathing'][Math.floor(Math.random() * 4)]; }
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';
    add(q, 'me');
    var act = SW.act;
    var reply = REPLIES[act](q);
    setTimeout(function () {
      typing(900 + Math.random() * 900, function () { add(reply, 'them', act >= 4 ? 'drowned' : act === 3 ? 'lower' : ''); });
    }, 400);
  });

  /* after the reset loop */
  SW.on('returned', function () {
    setStage(3);
    setWho('Wren', 'Online');
    queue.length = 0;
    setTimeout(function () { enqueue({ text: 'You came back. They always do.' }); }, 3200);
  });
  if (SW.returned) {
    setStage(3);
    SW.at(0, function () { setTimeout(function () { enqueue({ text: 'Welcome back. Your cabin is ready.' }); }, 5000); });
    // replace the cheerful opener on a return visit
    SCRIPT[0].text = 'You came back.';
  }
})();
