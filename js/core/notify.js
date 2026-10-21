/* JC.notify — notifications, banners, badges. Lock screen / Notification Center lists are drawn by os.js using JC.notify.card(). */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;
  const badges = {};
  let bannerQ = [];
  let bannerEl = null;
  let bannerT = null;
  let hiding = false;

  const APP_NAMES = () => (JC.os && JC.os.appNames) || {};

  function list() { return JC.state.d.notifs; }

  function appName(app) {
    if (JC.os && JC.os.appName) return JC.os.appName(app);
    const def = JC.apps && JC.apps[app];
    return APP_NAMES()[app] || (def && def.name) || app.replace(/^\w/, (c) => c.toUpperCase());
  }

  /** small app icon or avatar with an app badge */
  function leading(n, size) {
    size = size || 38;
    if (n.avatar) {
      const wrap = h('div.n-lead.av', { style: { width: size + 'px', height: size + 'px' } });
      wrap.appendChild(n.group && n.group.length > 1 ? JC.ui.groupAvatar(n.group, size) : JC.ui.avatar(n.avatar, size));
      const b = JC.appIcon(n.app);
      b.classList.add('n-appbadge');
      wrap.appendChild(b);
      return wrap;
    }
    const ic = JC.appIcon(n.app);
    ic.classList.add('n-lead');
    ic.style.setProperty('--s', size + 'px');
    return ic;
  }

  function stamp(t) {
    const diff = JC.time.now() - t;
    if (diff < 60e3) return 'now';
    if (diff < 3600e3) return Math.floor(diff / 60e3) + 'm ago';
    if (diff < 86400e3 && U.sameDay(new Date(t), JC.time.date())) return U.fmtTime(t);
    return U.fmtRelative(t);
  }

  const notify = {
    badges,
    appName,
    stamp,
    list,
    push(n) {
      n = Object.assign({ id: U.uid('n'), t: JC.time.now(), app: 'messages' }, n);
      if (typeof n.t === 'string') n.t = JC.time.parse(n.t);
      const pr = notify.prefsFor(n.app);
      if (!pr.allow) return n; // Settings › Notifications › Allow Notifications is off
      if (pr.sounds === false) n.quiet = true;
      if (pr.banners === false) n.noBanner = true;
      if (pr.lock === false && pr.center === false) return n;
      list().unshift(n);
      if (list().length > 80) list().length = 80;
      JC.state.save();
      JC.bus.emit('notifs', n);
      const os = JC.os;
      if (!os || !os.ready) return n;
      const focus = JC.state.d.settings.focus;
      if (os.asleep) os.wake({ quiet: !!focus });
      if (n.silent) return n;
      const viewing = os.isViewing && os.isViewing(n);
      if (!focus && !viewing && !n.quiet) {
        const st = JC.state.d.settings;
        const prefs = st.prefs || {};
        const tone = n.app === 'messages' ? prefs['tone.texttone'] : n.app === 'mail' ? prefs['tone.newmail'] : null;
        if (tone && tone !== 'None' && JC.settingsKit && JC.settingsKit.playTone && !st.silent) JC.settingsKit.playTone(tone);
        else if (tone !== 'None') JC.audio.play(n.app === 'messages' ? 'receive' : 'notify');
        JC.audio.haptic(25);
      }
      if (!os.locked && !focus && !viewing && !n.noBanner) notify.banner(n);
      return n;
    },
    remove(id) {
      const i = list().findIndex((x) => x.id === id);
      if (i >= 0) list().splice(i, 1);
      JC.state.save();
      JC.bus.emit('notifs');
    },
    clear(filter) {
      const keep = filter ? list().filter((n) => !filter(n)) : [];
      JC.state.d.notifs = keep;
      JC.state.save();
      JC.bus.emit('notifs');
    },
    /** clear notifications for a thread/app once the user has seen it */
    seen(match) {
      // drop queued/visible banners that point at what the user is now looking at
      const hits = (n) => (match.thread && n.thread === match.thread) || (match.app && !match.thread && n.app === match.app);
      bannerQ = bannerQ.filter((n) => !hits(n));
      if (bannerEl && bannerEl.__n && hits(bannerEl.__n)) notify.hideBanner();
      const before = list().length;
      JC.state.d.notifs = list().filter((n) => !((match.thread && n.thread === match.thread) || (match.app && !match.thread && n.app === match.app)));
      if (JC.state.d.notifs.length !== before) { JC.state.save(); JC.bus.emit('notifs'); }
    },
    /** per-app notification settings written by the Settings app */
    prefsFor(app) {
      const st = (JC.state && JC.state.d && JC.state.d.settings) || {};
      const off = st.notifOff || {};
      const p = (st.prefs || {})['notif.' + app] || {};
      return { allow: !off[app] && p.allow !== false, sounds: p.sounds, banners: p.banners, lock: p.lock, center: p.center, badges: p.badges, previews: p.previews };
    },
    /** should this notification's content be hidden right now? */
    hidden(n) {
      const st = (JC.state && JC.state.d && JC.state.d.settings) || {};
      const pr = notify.prefsFor(n.app);
      const mode = pr.previews && pr.previews !== 'default' ? pr.previews : st.previews || 'always';
      return mode === 'never' || (mode === 'unlocked' && JC.os && JC.os.locked);
    },
    badge(app, n) {
      if (n === undefined) return notify.prefsFor(app).badges === false || !notify.prefsFor(app).allow ? 0 : badges[app] || 0;
      badges[app] = n || 0;
      JC.bus.emit('badge', { app, n: badges[app] });
      return badges[app];
    },
    open(n) {
      notify.remove(n.id);
      if (n.open) JC.os.open(n.open.app, n.open.intent);
      else if (n.thread) JC.os.open('messages', { thread: n.thread });
      else JC.os.open(n.app);
    },
    card(n, o) {
      o = o || {};
      const hide = notify.hidden(n);
      const shown = hide ? Object.assign({}, n, { avatar: null, title: appName(n.app), subtitle: null, body: 'Notification', art: null }) : n;
      const el = h('div.ncard', { class: o.cls },
        leading(shown, 38),
        h('div.n-main',
          h('div.n-top', h('div.n-title', shown.title || appName(n.app)), h('div.n-time', stamp(n.t))),
          shown.subtitle ? h('div.n-sub', shown.subtitle) : null,
          h('div.n-body', { class: { clamp4: !o.full } }, shown.body || '')),
        shown.art ? JC.art.el(shown.art, { cls: 'n-art' }) : null);
      if (o.onTap) JC.ui.onTap(el, o.onTap);
      if (n.thread) U.longPress(el, () => { if (!JC.os.locked) { if (o.cls === 'banner') notify.hideBanner(); notify.expand(n); } }, 450);
      if (o.swipe !== false) {
        U.drag(el, {
          axis: 'x',
          move: (e, p) => { el.style.transform = `translateX(${p.dx}px)`; el.style.opacity = String(1 - Math.abs(p.dx) / 400); },
          end: (e, p) => {
            if (Math.abs(p.dx) > 120 || Math.abs(p.vx) > 0.7) {
              U.anim(el, [{ transform: el.style.transform }, { transform: `translateX(${p.dx > 0 ? 450 : -450}px)` }], { duration: 220 }).then(() => { notify.remove(n.id); o.onClear && o.onClear(n); });
            } else {
              el.style.transform = '';
              el.style.opacity = '';
            }
          },
        });
      }
      return el;
    },
    banner(n) {
      bannerQ.push(n);
      if (!bannerEl && !hiding) showNext();
    },
    /** expanded message notification with quick reply (long-press a message notification) */
    expand(n) {
      const id = n.thread;
      const layer = document.getElementById('sys-overlays');
      if (!layer || !JC.story) return;
      const back = h('div.qr-back');
      const convo = h('div.qr-convo.scroll');
      const actions = h('div.qr-actions');
      const head = h('div.qr-head', JC.ui.avatar(n.avatar || 'me', 34), h('div.qr-name', JC.story.threadName(id)), h('div.qr-open', { onTap: () => { close(); JC.os.open('messages', { thread: id }); } }, 'Open'));
      const card = h('div.qr-card', head, convo, actions);
      layer.append(back, card);
      JC.ui.onTap(back, () => close());
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
      U.anim(card, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, easing: U.SPRING });
      JC.story.markRead(id);
      const paint = () => {
        convo.innerHTML = '';
        JC.story.messages(id).slice(-6).forEach((m) => {
          if (m.sys) { convo.appendChild(h('div.qr-sys', m.text)); return; }
          convo.appendChild(h('div.qr-msg', { class: m.from === 'me' ? 'me' : 'them' }, m.img ? JC.art.el(m.img, { cls: 'qr-img' }) : JC.story.preview(m)));
        });
        const typing = JC.story.typing(id);
        if (typing) convo.appendChild(h('div.qr-msg.them.typing', h('span'), h('span'), h('span')));
        convo.scrollTop = convo.scrollHeight;
        actions.innerHTML = '';
        const p = JC.story.pending(id);
        if (p) {
          actions.appendChild(h('div.qr-label', (JC.world && JC.world.brand && JC.world.brand.replyAs) || 'Reply'));
          p.options.forEach((o) => actions.appendChild(h('div.qr-opt', { onTap: () => { JC.story.choose(id, o.i); } }, o.label)));
        } else if (JC.story.canReply(id)) {
          const input = JC.ui.input({ placeholder: 'Reply', enterkey: 'send', onSubmit: (v) => { if (v.trim()) { JC.story.send(id, { text: v.trim() }); JC.audio.play('send'); input.value = ''; } } });
          actions.appendChild(h('div.qr-field', input));
        }
      };
      paint();
      const offs = [JC.bus.on('story:thread', (e) => { if (e.thread === id) { paint(); JC.story.markRead(id); } }), JC.bus.on('story:pending', (e) => { if (e.thread === id) paint(); }), JC.bus.on('story:typing', (e) => { if (e.thread === id) paint(); })];
      function close() {
        offs.forEach((f) => f());
        JC.kb.hide();
        U.anim(card, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.95)' }], { duration: 180 }).then(() => card.remove());
        U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => back.remove());
      }
    },
    hideBanner() {
      if (!bannerEl) return;
      const el = bannerEl;
      bannerEl = null;
      hiding = true;
      clearTimeout(bannerT);
      U.anim(el, [{ transform: el.style.transform || 'translateY(0)', opacity: 1 }, { transform: 'translateY(-130%)', opacity: 0.6 }], { duration: 320 }).then(() => { el.remove(); hiding = false; showNext(); });
    },
  };

  function showNext() {
    let n = bannerQ.shift();
    while (n && JC.os && JC.os.isViewing && JC.os.isViewing(n)) n = bannerQ.shift();
    if (!n) return;
    // collapse a burst from the same conversation into its latest message
    while (bannerQ.length && bannerQ[0].thread && bannerQ[0].thread === n.thread) n = bannerQ.shift();
    const layer = document.getElementById('banners');
    if (!layer) return;
    const card = notify.card(n, { cls: 'banner', swipe: false, onTap: () => { notify.hideBanner(); notify.open(n); } });
    card.__n = n;
    layer.appendChild(card);
    bannerEl = card;
    U.anim(card, [{ transform: 'translateY(-130%)', opacity: 0.5 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 520, easing: U.SPRING });
    U.drag(card, {
      axis: 'y',
      move: (e, p) => { card.style.transform = `translateY(${Math.min(p.dy, 14)}px)`; },
      end: (e, p) => { if (p.dy < -20 || p.vy < -0.3) notify.hideBanner(); else card.style.transform = 'translateY(0)'; },
    });
    clearTimeout(bannerT);
    bannerT = setTimeout(() => { if (bannerEl === card) notify.hideBanner(); }, 4800);
  }

  JC.notify = notify;
})();
