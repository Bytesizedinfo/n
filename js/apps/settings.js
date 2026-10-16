/* Settings — iOS 26 Settings: shell, row DSL, root page (with the Story section), search, passcode gate,
   intents and live sync with Control Center. Pages live in settings-pages.js and settings-more.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const SK = (JC.settingsKit = JC.settingsKit || { pages: {} });
  const REG = SK.pages;

  // ── state helpers ────────────────────────────────────────────────
  const S = () => JC.state.d.settings;
  let muted = 0;
  function mute(fn) { muted++; try { return fn(); } finally { muted--; } }
  const prefs = () => S().prefs || {};
  function pref(k, d) { const p = prefs(); return p[k] === undefined ? d : p[k]; }
  function setPref(k, v) { mute(() => JC.state.setting('prefs', Object.assign({}, prefs(), { [k]: v }))); }
  const core = (k) => S()[k];
  function setCore(k, v) { mute(() => JC.state.setting(k, v)); }
  function setToggle(k, v) { mute(() => JC.os.setToggle(k, v)); }
  SK.pref = pref;
  SK.setPref = setPref;

  const APP_ORDER = () => Object.keys(JC.os.appNames).filter((id) => id !== 'settings').sort((a, b) => appName(a).localeCompare(appName(b)));
  const appName = (id) => (JC.apps[id] && JC.apps[id].name) || JC.os.appNames[id] || id;

  // ── extra glyphs ─────────────────────────────────────────────────
  JC.icon.add({
    accessibility: '<circle cx="12" cy="12" r="9.2"/><circle cx="12" cy="7.4" r="1.4" fill="currentColor" stroke="none"/><path d="M7.5 9.8 12 10.6l4.5-.8M12 10.6v3.6l-2.4 4.4M12 14.2l2.4 4.4"/>',
    'button.programmable': '<rect x="5" y="8" width="14" height="8" rx="4"/><circle cx="9" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    'switch.2': '<rect x="3.5" y="4.5" width="17" height="6" rx="3"/><circle cx="17.5" cy="7.5" r="1.8" fill="currentColor" stroke="none"/><rect x="3.5" y="13.5" width="17" height="6" rx="3"/><circle cx="6.5" cy="16.5" r="1.8" fill="currentColor" stroke="none"/>',
    faceid: '<path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15M9 9.5v1.5M15 9.5v1.5M12 9.5v4.2h-1M9.6 16.2c1.4 1 3.4 1 4.8 0"/>',
    'hand.raised.fill': '<path d="M8 12.5V6a1.3 1.3 0 0 1 2.6 0v5M10.6 11V4.6a1.3 1.3 0 0 1 2.6 0V11M13.2 11V5.6a1.3 1.3 0 0 1 2.6 0V12M15.8 12V8.2a1.3 1.3 0 0 1 2.6 0v6.3c0 3.9-2.6 6.5-6.3 6.5-2.4 0-4-1-5.3-3l-2.4-3.8a1.3 1.3 0 0 1 2.1-1.5L8 15.2" fill="currentColor" stroke="none"/>',
    'gamecontroller.fill': '<path d="M7.5 7h9c2.6 0 4.2 2.4 4.9 6.1.6 3.3-.6 4.9-2.1 4.9-1.3 0-2-.9-2.8-2-.5-.7-1-1-1.9-1h-5.2c-.9 0-1.4.3-1.9 1-.8 1.1-1.5 2-2.8 2-1.5 0-2.7-1.6-2.1-4.9C3.3 9.4 4.9 7 7.5 7z" fill="currentColor" stroke="none"/><path d="M7.5 10v3.4M5.8 11.7h3.4" style="stroke:var(--knock,#fff)" stroke-width="1.6"/><circle cx="15.6" cy="10.8" r="1" style="fill:var(--knock,#fff)" stroke="none"/><circle cx="17.4" cy="12.8" r="1" style="fill:var(--knock,#fff)" stroke="none"/>',
    'textformat.size': '<path d="M3 18 7.5 6 12 18M4.6 14h5.8M13.5 18l3.2-8.6 3.3 8.6M14.6 15.4h4.2"/>',
    hare: '<path d="M5 18c0-3.5 2.4-6.5 6-6.5 2.4 0 4 1 5.4 1 1.6 0 3.6.9 3.6 2.8 0 1.5-1.2 2.7-3 2.7H5z"/><path d="M14 11.8c-.8-2.5-.4-5.6 1.2-6.8 1.5.9 1.4 4.2.4 6.6M16.6 12.6c.5-2.5 1.7-4.6 3.3-5-.2 1.9-1.2 3.9-2.4 5.3"/>',
    tortoise: '<path d="M4 15.5c.6-4 3.6-6.5 7.5-6.5s6.9 2.5 7.5 6.5z"/><path d="M19 13.5h1.5a1.5 1.5 0 0 0 0-3H19M6.5 15.5v2M16.5 15.5v2"/>',
    'eye.fill': '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="3.2" style="fill:var(--knock,#fff)" stroke="none"/>',
    'lock.shield': '<path d="M12 3 5 6v5.5c0 4.3 3 7.8 7 9.5 4-1.7 7-5.2 7-9.5V6z"/><rect x="9.3" y="10.8" width="5.4" height="4.4" rx="1"/><path d="M10.3 10.8V9.6a1.7 1.7 0 0 1 3.4 0v1.2"/>',
    'location.circle': '<circle cx="12" cy="12" r="9"/><path d="M16.5 7.5 7 11.3l4 1.1 1 4.1z" fill="currentColor" stroke="none"/>',
    'photo.artframe': '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><rect x="6.5" y="6.5" width="11" height="11" rx="1"/><path d="m7 16 3-3.5 2.2 2.3 1.6-1.8L17 16"/>',
    'platter.2.filled.iphone': '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><rect x="8.3" y="10" width="7.4" height="3" rx="1" fill="currentColor" stroke="none"/><rect x="8.3" y="14.2" width="7.4" height="3" rx="1" fill="currentColor" stroke="none"/>',
    'sparkles': '<path d="M10 3.5 11.5 8 16 9.5 11.5 11 10 15.5 8.5 11 4 9.5 8.5 8z" fill="currentColor" stroke="none"/><path d="M17.5 13l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor" stroke="none"/>',
    'checkmark.shield.fill': '<path d="M12 3 5 6v5.5c0 4.3 3 7.8 7 9.5 4-1.7 7-5.2 7-9.5V6z" fill="currentColor" stroke="none"/><path d="m8.8 12 2.3 2.3 4.2-4.6" style="stroke:var(--knock,#fff)" stroke-width="2"/>',
    'externaldrive.fill': '<rect x="3" y="7" width="18" height="10" rx="2.5" fill="currentColor" stroke="none"/><circle cx="17" cy="12" r="1.2" style="fill:var(--knock,#fff)" stroke="none"/>',
    'arrow.triangle.2.circlepath': '<path d="M19 9.5A7.5 7.5 0 0 0 5.6 7.6M5 14.5a7.5 7.5 0 0 0 13.4 1.9"/><path d="m19.5 4.8-.4 4.8-4.8-.4M4.5 19.2l.4-4.8 4.8.4"/>',
    'personalhotspot': '<circle cx="12" cy="12" r="2"/><path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.7 18.3a9 9 0 0 1 0-12.6M18.3 5.7a9 9 0 0 1 0 12.6"/>',
    'figure.wave': '<circle cx="12" cy="4.6" r="1.9" fill="currentColor" stroke="none"/><path d="M12 7.5v7l-2.5 6M12 14.5l2.5 6M7 6.5l5 2 5-4"/>',
    'chevron.left.forwardslash.chevron.right': '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    'network': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>',
    'ear': '<path d="M7 9.5a5 5 0 0 1 10 0c0 2.5-1.6 3.4-2.6 4.4-.9.9-1 1.7-1.1 2.8-.2 1.9-1.4 3.3-3.3 3.3-1.6 0-2.8-1-3.2-2.4"/><path d="M10 10a2 2 0 0 1 4 0c0 1-.8 1.4-1.6 1.6"/>',
    'tray.full.fill': '<path d="M4.4 9.3A2 2 0 0 1 6.2 8h11.6a2 2 0 0 1 1.8 1.3l1.9 4.2V18a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-4.5z" fill="currentColor" stroke="none"/><path d="M6 6h12M7.5 3.5h9"/>',
    'calendar.badge.clock': '<rect x="3.5" y="5" width="13" height="13" rx="2.5"/><path d="M3.5 9.5h13M7 3v4M13 3v4"/><circle cx="17.5" cy="16.5" r="4" fill="currentColor" stroke="none"/><path d="M17.5 14.8v1.9l1.2.8" style="stroke:var(--knock,#fff)" stroke-width="1.4"/>',
  });

  // ── row DSL → JC.ui.row specs ────────────────────────────────────
  const val = (x, ...a) => (typeof x === 'function' ? x(...a) : x);
  function iconSpec(i) {
    if (!i) return undefined;
    if (typeof i === 'string' && i.startsWith('app:')) return { app: i.slice(4) };
    if (Array.isArray(i)) return { glyph: i[0], bg: i[1], color: i[2] || '#fff', size: i[3] };
    return i;
  }
  function pickOf(spec) {
    const cur = spec.get ? spec.get() : spec.core ? core(spec.core) : pref(spec.pref, spec.def);
    const opt = spec.options.find((o) => o[0] === cur);
    return opt ? opt[1] : (spec.empty || '');
  }
  function rowSpec(r) {
    if (!r) return null;
    if (r instanceof Node) return r;
    if (r.hidden && r.hidden()) return null;
    if (r.custom) return { custom: val(r.custom, K) };
    const o = { title: val(r.t), subtitle: val(r.s), icon: iconSpec(val(r.icon)), detail: val(r.d), cls: r.cls };
    if (r.pref !== undefined) {
      o.toggle = { on: !!pref(r.pref, r.def), onChange: (v) => {
        if (r.confirm && v) { K.render(); r.confirm(() => { setPref(r.pref, v); r.after && r.after(v); K.render(); }); return; }
        setPref(r.pref, v); r.after && r.after(v); if (r.rerender) K.render();
      } };
    } else if (r.core !== undefined) {
      const isOn = r.on ? r.on() : !!core(r.core);
      o.toggle = { on: isOn, onChange: (v) => { if (r.set) mute(() => r.set(v)); else setCore(r.core, v); r.after && r.after(v); if (r.rerender !== false) setTimeout(K.render, 280); } };
    } else if (r.locked !== undefined) {
      o.toggle = { on: !!val(r.locked), onChange: () => { setTimeout(K.render, 250); JC.ui.alert({ title: r.lockTitle || r.t, message: val(r.lockMsg) || 'This setting is managed by Yunmeng Jiang Group.', buttons: [{ text: 'OK' }] }); } };
    } else if (r.go) {
      o.chevron = true;
      o.onTap = () => K.go(r.go, val(r.arg));
    } else if (r.pick) {
      o.chevron = true;
      if (o.detail === undefined) o.detail = pickOf(r.pick);
      o.onTap = () => K.go('__pick', Object.assign({ title: val(r.t) }, r.pick));
    } else if (r.tap) {
      o.onTap = () => r.tap(K);
      if (r.chev) o.chevron = true;
    } else if (r.alert) {
      o.onTap = () => JC.ui.alert(Object.assign({ buttons: [{ text: 'OK' }] }, val(r.alert)));
      if (r.chev) o.chevron = true;
    } else if (r.copy) {
      o.menu = () => ({ items: [{ text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(String(o.detail || o.title)); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } }] });
    }
    if (r.tint) o.tinted = true;
    if (r.danger) o.destructive = true;
    if (r.center) o.center = true;
    if (r.check !== undefined) o.check = !!val(r.check);
    if (r.badge) o.badge = val(r.badge);
    if (r.right) o.right = val(r.right);
    if (r.avatar) o.avatar = r.avatar;
    if (r.leading) o.leading = val(r.leading);
    if (r.info) o.info = r.info;
    if (r.swipe) o.swipe = r.swipe;
    return o;
  }
  function buildContent(items) {
    const out = [];
    let pend = [];
    const flush = () => { if (pend.length) { out.push(JC.ui.list(pend)); pend = []; } };
    (items || []).forEach((it) => {
      if (!it) return;
      if (it instanceof Node) { flush(); out.push(it); return; }
      if (it.hidden && it.hidden()) return;
      pend.push({ header: val(it.h), footer: val(it.f), cls: it.cls, rows: (val(it.rows) || []).map(rowSpec).filter(Boolean) });
    });
    flush();
    return out;
  }

  // ── kit object passed to page definitions ────────────────────────
  let nav = null;
  let winRef = null;
  const K = {
    h, U, mute, pref, setPref, core, setCore, setToggle, appName, apps: APP_ORDER, val, pickOf,
    get nav() { return nav; },
    go(id, arg) {
      if (!REG[id]) { JC.ui.alert({ title: 'Coming Soon', message: 'This setting isn’t available on this iPhone.', buttons: [{ text: 'OK' }] }); return null; }
      if (REG[id].gate && !K._gateOpen) { return gate(REG[id].gate, () => nav.replace(makePage(id, arg))); }
      return nav.push(makePage(id, arg));
    },
    back() { nav.pop(); },
    render() { const t = nav && nav.top(); if (t) t.render(); },
    top: () => nav && nav.top(),
    ic: (g, bg, color) => ({ glyph: g, bg, color: color || '#fff' }),
    list: buildContent,
    toast: (t, icon) => JC.ui.toast(t, { icon: icon || 'checkmark' }),
    alert: (o) => JC.ui.alert(Object.assign({ buttons: [{ text: 'OK' }] }, o)),
    sheet: (o) => JC.ui.sheet(o),
    win: () => winRef,
    gb: (n) => (n >= 1000 ? (n / 1000).toFixed(2) + ' TB' : n >= 1 ? n.toFixed(1) + ' GB' : Math.round(n * 1000) + ' MB'),
    flagged: (f) => !!(JC.story && JC.story.flag && JC.story.flag(f)),
    act: (key, value) => { try { JC.story.act('setting', { key, value }); } catch (e) { /* ignore */ } },
    keypad, gate,
    /** stacked horizontal usage bar with legend */
    usageBar(segs, total, o) {
      o = o || {};
      const used = segs.reduce((a, s) => a + s.v, 0);
      const bar = h('div.set-ubar', segs.map((s) => h('div.set-ubar-seg', { style: { flexGrow: String(s.v / total), background: s.c }, attrs: { title: s.name } })), h('div.set-ubar-free', { style: { flexGrow: String(Math.max(0, total - used) / total) } }));
      return h('div.set-usage', o.title ? h('div.set-usage-h', h('span', o.title), h('span.set-usage-r', o.right || '')) : null, bar,
        h('div.set-ulegend', segs.map((s) => h('span.set-uleg', h('i', { style: { background: s.c } }), s.name)), o.freeLabel ? h('span.set-uleg', h('i.free'), o.freeLabel) : null));
    },
  };
  SK.K = K;

  // ── page factory ─────────────────────────────────────────────────
  function makePage(id, arg) {
    const def = REG[id];
    const page = JC.ui.page({
      title: val(def.title, arg) || '',
      large: !!def.large,
      bg: def.bg || 'grouped',
      tint: 'var(--blue)',
      cls: ['set-page', 'set-p-' + id.replace(/[^a-z0-9]/gi, '-')],
      data: { id, arg },
      search: def.search ? def.search(K, arg) : undefined,
      content: (p) => {
        try { return buildContent(def.render(K, arg, p)); } catch (e) { console.error('settings page failed', id, e); return [JC.ui.empty({ icon: 'exclamationmark.triangle.fill', title: 'Something went wrong', text: String(e && e.message) })]; }
      },
      onShow: (p) => { if (p._shown && !def.noRefresh) p.render(); p._shown = true; def.onShow && def.onShow(K, arg, p); },
      onClose: (p) => { def.onClose && def.onClose(K, arg, p); },
    });
    if (def.right) page.setRight(def.right(K, arg, page));
    return page;
  }
  SK.makePage = makePage;

  // generic radio/pick page
  REG.__pick = {
    title: (a) => a.title,
    render: (K2, a) => [{
      h: a.header, f: val(a.footer),
      rows: a.options.map((o) => ({
        t: o[1], s: o[2],
        check: () => (a.get ? a.get() : a.core ? core(a.core) : pref(a.pref, a.def)) === o[0],
        tap: () => {
          const prev = a.get ? a.get() : a.core ? core(a.core) : pref(a.pref, a.def);
          if (prev === o[0]) return;
          const apply = () => {
            if (a.set) mute(() => a.set(o[0]));
            else if (a.core) setCore(a.core, o[0]);
            else setPref(a.pref, o[0]);
            JC.audio.haptic(6);
            a.after && a.after(o[0], prev);
            K.render();
          };
          if (a.confirm) a.confirm(o[0], apply); else apply();
        },
      })),
    }].concat(a.extra ? val(a.extra, K) : []),
  };

  // ── passcode keypad & gate ───────────────────────────────────────
  function keypad(o) {
    let code = '';
    const title = h('div.set-kp-title', o.title || 'Enter Passcode');
    const sub = h('div.set-kp-sub', o.sub || '');
    const dots = h('div.set-kp-dots', [0, 1, 2, 3, 4, 5].map(() => h('i')));
    const err = h('div.set-kp-err');
    const paint = () => Array.from(dots.children).forEach((d, i) => d.classList.toggle('on', i < code.length));
    const press = (d) => {
      if (code.length >= 6) return;
      JC.audio.play('key');
      code += d;
      paint();
      if (code.length === 6) setTimeout(() => { const c = code; code = ''; o.onCode(c, ctl); }, 140);
    };
    const L = { 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ' };
    const keys = h('div.set-kp-keys',
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => h('div.set-kp-key', { onTap: () => press(String(n)) }, h('div.set-kp-n', String(n)), h('div.set-kp-l', L[n] || ''))),
      h('div.set-kp-key.ghost'),
      h('div.set-kp-key', { onTap: () => press('0') }, h('div.set-kp-n', '0')),
      h('div.set-kp-key.del', { onTap: () => { code = code.slice(0, -1); paint(); } }, JC.icon('delete.left', { size: 24 })));
    const el = h('div.set-kp', title, sub, dots, err, keys);
    const ctl = {
      el,
      reset(t, s) { code = ''; paint(); if (t != null) title.textContent = t; if (s != null) sub.textContent = s; err.textContent = ''; },
      wrong(msg) {
        code = '';
        JC.audio.play('error');
        JC.audio.haptic([30, 40, 30]);
        U.anim(dots, [{ transform: 'translateX(0)' }, { transform: 'translateX(-14px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(0)' }], { duration: 380 });
        setTimeout(paint, 300);
        err.textContent = msg || '';
      },
    };
    const onKey = (e) => {
      if (!el.isConnected || JC.kb.visible) return;
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') { code = code.slice(0, -1); paint(); }
    };
    window.addEventListener('keydown', onKey);
    el._off = () => window.removeEventListener('keydown', onKey);
    return ctl;
  }
  let gateFails = 0;
  function gate(title, ok) {
    let kp;
    const page = JC.ui.page({
      title: '', bg: 'grouped', cls: 'set-page set-gate',
      left: [JC.ui.navBtn({ text: 'Cancel', onTap: () => nav.pop() })],
      content: () => {
        kp = keypad({
          title: 'Enter Passcode', sub: title,
          onCode: (c, ctl) => {
            if (c === (core('passcode') || '181008')) { gateFails = 0; K._gateOpen = true; try { ok(); } finally { K._gateOpen = false; } }
            else { gateFails++; ctl.wrong(gateFails >= 3 ? 'Hint: it’s the same passcode that unlocks this iPhone.' : (gateFails === 1 ? '1 Failed Passcode Attempt' : gateFails + ' Failed Passcode Attempts')); }
          },
        });
        return [kp.el];
      },
      onClose: () => kp && kp.el._off && kp.el._off(),
    });
    nav.push(page);
    return page;
  }

  // ── Night Shift / Bold Text / Reduce Motion (applied on the whole screen) ──
  function nightOn() {
    if (pref('ns.manual', false)) return true;
    if (!pref('ns.scheduled', false)) return false;
    const hr = JC.time.date().getHours() + JC.time.date().getMinutes() / 60;
    const from = pref('ns.from', 22), to = pref('ns.to', 7);
    return from > to ? (hr >= from || hr < to) : (hr >= from && hr < to);
  }
  function applyScreenPrefs() {
    const sc = document.getElementById('screen');
    if (!sc) return;
    let ns = document.getElementById('set-nightshift');
    if (!ns) { ns = h('div#set-nightshift'); sc.appendChild(ns); }
    const on = nightOn();
    const warm = pref('ns.warmth', 0.55);
    ns.style.opacity = on ? String(0.1 + warm * 0.26) : (pref('trueTone', true) ? '0.025' : '0');
    sc.classList.toggle('set-bold', !!core('boldText'));
    sc.classList.toggle('set-reduce-motion', !!core('reduceMotion'));
    sc.classList.toggle('set-invert', !!pref('a11y.classicInvert', false));
    sc.classList.toggle('set-gray', pref('a11y.colorFilter', 'off') === 'gray');
  }
  SK.applyScreenPrefs = applyScreenPrefs;
  SK.nightOn = nightOn;
  JC.bus.on('boot', applyScreenPrefs);
  JC.bus.on('minute', () => { if (pref('ns.scheduled', false)) applyScreenPrefs(); });
  JC.bus.on('setting', (e) => { if (e && /^(prefs|boldText|reduceMotion)$/.test(e.key)) applyScreenPrefs(); });

  // ── HOW TO PLAY ──────────────────────────────────────────────────
  function howToPlay() {
    const item = (icon, color, t, b) => h('div.set-htp-i', h('div.set-htp-ic', { style: { background: color } }, JC.icon(icon, { size: 20 })), h('div', h('div.set-htp-t', t), h('div.set-htp-b', b)));
    JC.ui.sheet({
      title: 'How to Play', detent: 'large', right: { text: 'Done' },
      content: () => [h('div.set-htp',
        h('div.set-htp-hero', JC.icon('lotus.fill', { size: 40 }), h('div.set-htp-h', 'Jiang Cheng’s Phone'), h('div.set-htp-s', 'You found this phone in a taxi. Everyone who texts it thinks you are Jiang Cheng.')),
        item('message.fill', 'var(--green)', 'Reply as him — or don’t', 'Choices appear above the keyboard in Messages. Short, sharp and never an emoji is very Jiang Cheng. Gushing is not.'),
        item('eye.fill', 'var(--orange)', 'Suspicion', 'Out-of-character replies make people suspicious. Turn on Show Suspicion Meter to see how close you are to being caught.'),
        item('magnifyingglass', 'var(--blue)', 'Snoop for clues', 'Photos, Notes, Mail, Wallet, Voice Memos and Safari history know things you don’t. Some questions have answers hidden in other apps.'),
        item('lock.fill', 'var(--gray)', 'The passcode', 'You already cracked it. If you change it, don’t forget the new one.'),
        item('clock.fill', 'var(--indigo)', 'The night moves on', 'Messages arrive in real time while you explore. Leaving someone on read is also an answer.'),
        item('lotus.fill', 'var(--purple)', '13 endings', 'Rewind to your last choice or restart the story to find them all. Endings you find stay unlocked.'),
        item('hand.raised.fill', 'var(--pink)', 'Gestures', 'Home: tap or drag up the bar at the bottom (or press Esc). Back: swipe from the left edge. Control Center: drag down from the top right. Notifications: drag down from the top left.'),
        item('hare', 'var(--teal)', 'Message speed', 'Too slow or too fast? Change Message Speed here in Settings › Story.'))],
    });
  }
  SK.howToPlay = howToPlay;

  // ── ROOT ─────────────────────────────────────────────────────────
  const SPEEDS = [[0.7, 'Relaxed', 'More time to read and think'], [1, 'Normal'], [1.6, 'Fast', 'For your second (or tenth) night']];
  function rootRender(K2, a, page) {
    const q = (page && page._q) || '';
    if (q) return searchResults(q);
    const s = S();
    const endings = (JC.story && JC.story.endings) ? JC.story.endings() : [];
    const got = endings.filter((e) => e.unlocked).length;
    const wifiDetail = s.airplane && !s.wifi ? 'Off' : !s.wifi ? 'Off' : s.wifiNet || 'Not Connected';
    const su = pref('su.state', 'idle');
    return [
      { h: 'Story', cls: 'set-story', f: 'You are not Jiang Cheng. Everyone thinks you are.', rows: [
        { t: 'Endings', icon: ['lotus.fill', 'linear-gradient(160deg,#8e6bd8,#4a2f8f)'], d: got + ' of ' + (endings.length || 13), tap: () => JC.os.showEndings(), chev: true },
        { t: 'Rewind to Last Choice', icon: ['arrow.counterclockwise', 'var(--indigo)'], tap: () => {
          if (!JC.state.canRewind()) { K.alert({ title: 'Nothing to Rewind', message: 'You haven’t made a choice yet. Every reply you pick in Messages is a checkpoint.' }); return; }
          JC.ui.alert({ title: 'Rewind to Last Choice?', message: 'The story goes back to just before your last choice. Endings you found stay unlocked.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Rewind', style: 'default', onTap: () => setTimeout(() => JC.story.rewind(), 250) }] });
        } },
        { t: 'Restart Story', icon: ['arrow.clockwise', 'var(--red)'], tap: () => JC.os.confirmRestart() },
        { t: 'Message Speed', icon: ['hare', 'var(--teal)'], pick: { core: 'speed', options: SPEEDS, footer: 'How quickly people type and reply. Relaxed gives you more time; Fast is for replays.', header: 'Typing speed' } },
        { t: 'Show Suspicion Meter', icon: ['eye.fill', 'var(--orange)'], core: 'showSus', rerender: false },
        { t: 'How to Play', icon: ['questionmark.circle', 'var(--blue)'], tap: () => howToPlay(), chev: true },
      ] },
      { cls: 'set-profile', rows: [{ custom: () => h('div.set-prof.tap', { onTap: () => K.go('appleid') }, JC.ui.avatar('me', 62), h('div.set-prof-m', h('div.set-prof-n', 'Jiang Cheng'), h('div.set-prof-s', 'Apple Account, iCloud, and more')), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'set-chev' })) }] },
      su !== 'installed' ? { rows: [{ t: 'iOS 26.1 Update Available', icon: ['gear', 'var(--gray)'], badge: 1, go: 'softwareupdate' }] } : null,
      { rows: [
        { t: 'Airplane Mode', icon: ['airplane', 'var(--orange)'], core: 'airplane', set: (v) => JC.os.setToggle('airplane', v) },
        { t: 'Wi-Fi', icon: ['wifi', 'var(--blue)'], d: wifiDetail, go: 'wifi' },
        { t: 'Bluetooth', icon: ['bluetooth', 'var(--blue)'], d: s.bt ? 'On' : 'Off', go: 'bluetooth' },
        { t: 'Cellular', icon: ['antenna.radiowaves.left.and.right', 'var(--green)'], d: s.airplane ? 'Airplane Mode' : s.cellular ? '' : 'Off', go: 'cellular' },
        { t: 'Personal Hotspot', icon: ['personalhotspot', 'var(--green)'], d: s.hotspot ? 'On' : 'Off', go: 'hotspot' },
        { t: 'Battery', icon: ['battery.100', 'var(--green)'], go: 'battery' },
        { t: 'VPN', icon: ['network', 'var(--blue)'], d: 'Not Connected', go: 'vpn' },
      ] },
      { rows: [
        { t: 'General', icon: ['gearshape.fill', 'var(--gray)'], go: 'general' },
        { t: 'Accessibility', icon: ['accessibility', 'var(--blue)'], go: 'accessibility' },
        { t: 'Action Button', icon: ['button.programmable', 'var(--blue)'], go: 'actionbutton' },
        { t: 'Apple Intelligence & Siri', icon: ['sparkles', 'linear-gradient(135deg,#ff7a59,#c63ad6 55%,#2f7bf6)'], go: 'siri' },
        { t: 'Camera', icon: ['camera.fill', 'var(--gray)'], go: 'camera' },
        { t: 'Control Center', icon: ['switch.2', 'var(--gray)'], go: 'controlcenter' },
        { t: 'Display & Brightness', icon: ['sun.max.fill', 'var(--blue)'], go: 'display' },
        { t: 'Home Screen & App Library', icon: ['apps.iphone', 'var(--indigo)'], go: 'homescreen' },
        { t: 'Search', icon: ['magnifyingglass', 'var(--gray)'], go: 'search' },
        { t: 'StandBy', icon: ['platter.2.filled.iphone', '#1c1c1e'], go: 'standby' },
        { t: 'Wallpaper', icon: ['photo.artframe', 'var(--cyan)'], go: 'wallpaper' },
      ] },
      { rows: [
        { t: 'Notifications', icon: ['bell.fill', 'var(--red)'], go: 'notifications' },
        { t: 'Sounds & Haptics', icon: ['speaker.wave.2.fill', 'var(--pink)'], go: 'sounds' },
        { t: 'Focus', icon: ['moon.fill', 'var(--indigo)'], d: s.focus ? ({ dnd: 'Do Not Disturb', sleep: 'Sleep', personal: 'Personal', work: 'Work' }[s.focus] || 'On') : '', go: 'focus' },
        { t: 'Screen Time', icon: ['hourglass', 'var(--indigo)'], go: 'screentime' },
      ] },
      { rows: [
        { t: 'Face ID & Passcode', icon: ['faceid', 'var(--green)'], go: 'faceid' },
        { t: 'Emergency SOS', icon: ['sos', 'var(--red)'], go: 'sos' },
        { t: 'Privacy & Security', icon: ['hand.raised.fill', 'var(--blue)'], go: 'privacy' },
        { t: 'Passwords', icon: ['key', 'var(--gray)'], go: 'passwords' },
      ] },
      { rows: [
        { t: 'Game Center', icon: ['gamecontroller.fill', 'linear-gradient(135deg,#ff5f6d,#ffc371 40%,#36d1dc 75%,#5b86e5)'], go: 'gamecenter' },
        { t: 'iCloud', icon: ['cloud.fill', 'linear-gradient(180deg,#5ac8fa,#007aff)'], go: 'icloud' },
        { t: 'Wallet & Apple Pay', icon: ['creditcard.fill', '#1c1c1e'], go: 'walletpay' },
      ] },
      { rows: [{ t: 'Apps', icon: ['square.grid.2x2.fill', 'var(--indigo)'], go: 'apps' }] },
      h('div.set-foot', 'Jiang Cheng’s iPhone · iOS ' + (pref('su.state', 'idle') === 'installed' ? '26.1' : '26.0.1')),
    ];
  }

  // ── search ───────────────────────────────────────────────────────
  function searchIndex() {
    const out = [];
    Object.keys(REG).forEach((id) => {
      const d = REG[id];
      if (id.startsWith('__') || d.noSearch) return;
      const title = typeof d.title === 'function' ? null : d.title;
      if (!title) return;
      out.push({ id, t: title, path: d.path || '', icon: d.icon });
      (d.idx || []).forEach((t) => out.push({ id, t, path: (d.path ? d.path + ' › ' : '') + title, icon: d.icon }));
    });
    // story & root items
    [['Endings', 'story-endings'], ['Rewind to Last Choice', 'story-rewind'], ['Restart Story', 'story-restart'], ['Message Speed', 'story-speed'], ['Show Suspicion Meter', 'story-sus'], ['How to Play', 'story-how'], ['Airplane Mode', 'airplane']].forEach(([t, k]) => out.push({ t, path: 'Story', action: k, icon: ['lotus.fill', 'var(--purple)'] }));
    APP_ORDER().forEach((id) => out.push({ id: 'app', arg: id, t: appName(id), path: 'Apps', icon: 'app:' + id }));
    return out;
  }
  function searchResults(q) {
    q = q.toLowerCase();
    const idx = searchIndex();
    const hits = idx.filter((x) => x.t.toLowerCase().includes(q) || (x.path || '').toLowerCase().includes(q) && x.t.toLowerCase().split(' ').some((w) => w.startsWith(q)));
    const seen = new Set();
    const rows = hits.filter((x) => { const k = x.t + '|' + x.path; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.t.toLowerCase().startsWith(q) ? 0 : 1) - (b.t.toLowerCase().startsWith(q) ? 0 : 1) || a.t.length - b.t.length).slice(0, 40)
      .map((x) => ({ t: x.t, s: x.path || null, icon: x.icon, tap: () => runResult(x), chev: true }));
    if (!rows.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results for “' + q + '”', text: 'Check the spelling or try a new search.' })];
    return [{ rows }];
  }
  function runResult(x) {
    const root = nav.top();
    if (root && root.searchEl) { const inp = root.searchEl.querySelector('input'); if (inp) inp.blur(); }
    JC.kb.hide();
    if (x.action) {
      if (x.action === 'story-endings') JC.os.showEndings();
      else if (x.action === 'story-rewind') { if (JC.state.canRewind()) JC.story.rewind(); else K.alert({ title: 'Nothing to Rewind', message: 'You haven’t made a choice yet.' }); }
      else if (x.action === 'story-restart') JC.os.confirmRestart();
      else if (x.action === 'story-speed') K.go('__pick', { title: 'Message Speed', core: 'speed', options: SPEEDS });
      else if (x.action === 'story-how') howToPlay();
      else { clearSearch(); }
      return;
    }
    K.go(x.id, x.arg);
  }
  function clearSearch() {
    const root = nav.stack[0];
    if (!root) return;
    root._q = '';
    const inp = root.searchEl && root.searchEl.querySelector('input');
    if (inp) inp.value = '';
    root.el.classList.remove('searching');
    root.render();
  }

  REG.root = { title: 'Settings', large: true, render: rootRender, noSearch: true };

  // ════════════════════════════════════════════════════════════════
  JC.app({
    id: 'settings',
    name: 'Settings',
    status: 'auto',
    launch(win) {
      winRef = win;
      win.body.classList.add('app-settings');
      const offs = [];
      let root;
      nav = JC.ui.nav(win.body, () => {
        root = JC.ui.page({
          title: 'Settings', large: true, bg: 'grouped', cls: 'set-page set-root', tint: 'var(--blue)',
          search: { placeholder: 'Search', onInput: (q) => { root._q = q.trim(); root.render(); }, onCancel: () => { root._q = ''; root.render(); } },
          content: (p) => buildContent(rootRender(K, null, p)),
          onShow: (p) => { if (p._shown) p.render(); p._shown = true; },
        });
        return root;
      });
      const rerender = () => { if (!muted) K.render(); };
      offs.push(JC.bus.on('setting', rerender));
      offs.push(JC.bus.on('network', rerender));
      offs.push(JC.bus.on('battery', rerender));
      offs.push(JC.bus.on('story:ending', rerender));
      offs.push(JC.bus.on('minute', () => { const t = nav.top(); if (t && t.data && /^(battery|datetime|screentime|about)$/.test(t.data.id)) t.render(); }));

      function openPage(id) {
        const map = { story: null, endings: null, about: ['general', 'about'], faceid: ['faceid'], wifi: ['wifi'], battery: ['battery'], wallpaper: ['wallpaper'], display: ['display'], general: ['general'], screentime: ['screentime'], notifications: ['notifications'], sounds: ['sounds'], bluetooth: ['bluetooth'], cellular: ['cellular'], focus: ['focus'], privacy: ['privacy'], passwords: ['passwords'], softwareupdate: ['general', 'softwareupdate'], datetime: ['general', 'datetime'], keyboard: ['general', 'keyboard'], storage: ['general', 'storage'], icloud: ['appleid', 'icloud'], apps: ['apps'] };
        while (nav.depth() > 1) nav.pop({ instant: true });
        clearSearch();
        if (id === 'endings') { setTimeout(() => JC.os.showEndings(), 250); return; }
        if (id === 'story') {
          root.scrollTop(true);
          const st = root.el.querySelector('.set-story .section-body');
          if (st) U.anim(st, [{ boxShadow: '0 0 0 0 rgba(175,82,222,.0)' }, { boxShadow: '0 0 0 4px rgba(175,82,222,.45)' }, { boxShadow: '0 0 0 0 rgba(175,82,222,0)' }], { duration: 1400 });
          return;
        }
        if (typeof id === 'string' && id.startsWith('app:')) { nav.push(makePage('apps'), { instant: true }); nav.push(makePage('app', id.slice(4)), { instant: true }); return; }
        const path = map[id] || (REG[id] ? [id] : null);
        if (!path) return;
        path.forEach((p, i) => {
          if (REG[p].gate) { gate(REG[p].gate, () => nav.replace(makePage(p))); return; }
          nav.push(makePage(p), { instant: i < path.length - 1 });
        });
      }

      return {
        intent(intent) { if (intent && intent.page) setTimeout(() => openPage(intent.page), 30); else if (intent && intent.id) setTimeout(() => openPage(intent.id), 30); },
        show() { const t = nav.top(); if (t) t.render(); },
        destroy() { offs.forEach((f) => f()); },
      };
    },
  });
})();
