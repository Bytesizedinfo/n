/* JC.ui — iOS 26 component kit: navigation, lists, controls, sheets, alerts, menus, share sheet. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const U = JC.util;

  const ui = {};

  // ── helpers ──────────────────────────────────────────────────────
  ui.onTap = (el, fn) => {
    el.addEventListener('click', (e) => {
      if (U._suppress && performance.now() - U._suppress < 60) { e.stopPropagation(); return; }
      fn(e);
    });
    el.__tap = true;
    el.classList.add('tap');
    return el;
  };
  ui.spacer = () => h('div.spacer');
  ui.badge = (n) => (n ? h('span.badge', n > 99 ? '99+' : String(n)) : null);
  ui.icon = (name, size, opts) => JC.icon(name, Object.assign({ size }, opts || {}));

  /** where overlays go: the active app window (so they leave with the app), else the system layer */
  ui.layer = (system) => {
    if (!system && JC.os && JC.os.activeWin && JC.os.activeWin()) return JC.os.activeWin().overlays;
    return document.getElementById('sys-overlays') || document.body;
  };

  function toLocal(rect) {
    // convert a client rect into #screen logical coordinates
    const screen = document.getElementById('screen');
    const sr = screen.getBoundingClientRect();
    const sc = (JC.os && JC.os.scale) || 1;
    return { x: (rect.left - sr.left) / sc, y: (rect.top - sr.top) / sc, w: rect.width / sc, h: rect.height / sc };
  }
  ui.toLocal = toLocal;

  // ── Avatar ───────────────────────────────────────────────────────
  ui.avatar = (who, size) => {
    size = size || 40;
    let spec = who;
    if (typeof who === 'string') {
      const c = who === 'me' ? JC.me : JC.contacts.get(who);
      spec = c ? c.avatar : { initials: '?', grad: ['#a5abb9', '#858994'] };
    }
    spec = spec || {};
    const el = h('div.avatar', { style: { width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.4) + 'px' } });
    if (spec.art && JC.art.has(spec.art)) {
      el.style.backgroundImage = `url("${JC.art.url(spec.art)}")`;
      el.classList.add('img');
    } else {
      const g = spec.grad || ['#a5abb9', '#858994'];
      el.style.background = `linear-gradient(180deg, ${g[0]}, ${g[1]})`;
      if (spec.emoji) {
        el.appendChild(h('span.av-emoji', { style: { fontSize: Math.round(size * 0.55) + 'px' } }, spec.emoji));
      } else {
        el.appendChild(h('span.av-initials', (spec.initials || '?').toUpperCase()));
      }
    }
    return el;
  };
  ui.groupAvatar = (ids, size) => {
    size = size || 40;
    const el = h('div.group-avatar', { style: { width: size + 'px', height: size + 'px' } });
    const pos = [[0.02, 0.06, 0.56], [0.44, 0.0, 0.5], [0.3, 0.46, 0.54]];
    ids.slice(0, 3).forEach((id, i) => {
      const [x, y, s] = pos[i];
      const a = ui.avatar(id, Math.round(size * s));
      a.style.position = 'absolute';
      a.style.left = x * size + 'px';
      a.style.top = y * size + 'px';
      el.appendChild(a);
    });
    return el;
  };

  // ── Buttons ──────────────────────────────────────────────────────
  ui.btn = (o) => {
    o = o || {};
    const el = h('button.btn', {
      type: 'button',
      class: ['k-' + (o.kind || 'plain'), 's-' + (o.size || 'm'), o.cls, o.icon && !o.text ? 'icon-only' : ''],
      disabled: !!o.disabled,
      style: o.tint ? { '--tint': o.tint } : null,
      onTap: (e) => { if (!o.disabled && o.onTap) o.onTap(e); },
      attrs: { 'aria-label': o.label || o.text || o.icon },
    }, o.icon ? JC.icon(o.icon, { size: o.iconSize || (o.size === 'l' ? 22 : 18), weight: o.weight }) : null, o.text ? h('span', o.text) : null);
    return el;
  };
  /** iOS 26 glass nav-bar button: a circle for icons, a capsule for text */
  ui.navBtn = (o) => {
    const el = h('button.navbtn', {
      type: 'button',
      class: [o.text ? 'cap' : 'circ', o.prominent ? 'prominent' : '', o.cls],
      disabled: !!o.disabled,
      onTap: (e) => { if (!o.disabled && o.onTap) o.onTap(e); },
      attrs: { 'aria-label': o.label || o.text || o.icon },
    }, o.icon ? JC.icon(o.icon, { size: o.iconSize || 19, weight: o.weight || 2 }) : null, o.text ? h('span', o.text) : null);
    if (o.badge) el.appendChild(h('span.badge', String(o.badge)));
    return el;
  };
  ui.glassGroup = (...btns) => h('div.glass-group', btns);

  // ── Navigation ───────────────────────────────────────────────────
  ui.page = (o) => {
    o = o || {};
    const p = { opts: o, title: o.title || '', nav: null, data: o.data || {} };
    const el = h('div.page', { class: [o.cls, o.bg === 'grouped' ? 'bg-grouped' : 'bg-plain', o.large ? 'has-large' : '', o.navbar === false ? 'no-navbar' : ''] });
    if (o.bg && o.bg !== 'grouped' && o.bg !== 'plain') el.style.background = o.bg;
    if (o.tint) el.style.setProperty('--tint', o.tint);
    if (o.dark) el.classList.add('force-dark');
    const left = h('div.nav-left');
    const right = h('div.nav-right');
    const title = h('div.nav-title', h('span.nav-title-text', o.title || ''), o.subtitle ? h('span.nav-sub', o.subtitle) : null);
    const navbar = h('div.navbar', { class: { 'always-title': !o.large || o.alwaysTitle, transparent: !!o.transparentNav } }, left, title, right);
    const scroll = h('div.page-scroll.scroll');
    const large = o.large ? h('div.large-title', h('span.lt-text', o.title), o.largeRight || null) : null;
    let searchEl = null;
    if (o.search) {
      searchEl = h('div.page-search', ui.search(Object.assign({}, o.search, {
        onFocus: () => { el.classList.add('searching'); o.search.onFocus && o.search.onFocus(); },
        onCancel: () => { el.classList.remove('searching'); o.search.onCancel && o.search.onCancel(); },
      })));
    }
    const content = h('div.page-content');
    if (o.header) scroll.append(o.header);
    scroll.append(...[large, searchEl, content].filter(Boolean));
    el.append(scroll);
    if (o.navbar !== false) el.append(navbar);
    let toolbar = null;
    if (o.toolbar) {
      toolbar = h('div.toolbar', o.toolbar);
      el.append(toolbar);
      el.classList.add('has-toolbar');
    }
    if (o.footer) el.append(o.footer);

    p.el = el;
    p.scroll = scroll;
    p.content = content;
    p.navbar = navbar;
    p.toolbar = toolbar;
    p.left = left;
    p.right = right;
    p.searchEl = searchEl;
    p.setTitle = (t) => {
      p.title = t;
      title.querySelector('.nav-title-text').textContent = t;
      if (large) large.querySelector('.lt-text').textContent = t;
    };
    p.setRight = (items) => { right.innerHTML = ''; (items || []).forEach((i) => i && right.appendChild(i)); };
    p.setLeft = (items) => { left.innerHTML = ''; (items || []).forEach((i) => i && left.appendChild(i)); p._customLeft = true; };
    p.setToolbar = (items) => {
      if (!toolbar) { toolbar = h('div.toolbar'); el.append(toolbar); el.classList.add('has-toolbar'); p.toolbar = toolbar; }
      toolbar.innerHTML = '';
      (items || []).forEach((i) => i && toolbar.appendChild(i));
    };
    p.render = () => {
      if (typeof o.content === 'function') {
        const st = scroll.scrollTop;
        content.innerHTML = '';
        const out = o.content(p);
        (Array.isArray(out) ? out : [out]).forEach((n) => { if (n) content.appendChild(n); });
        scroll.scrollTop = st;
      } else if (o.content && !content.childNodes.length) {
        (Array.isArray(o.content) ? o.content : [o.content]).forEach((n) => n && content.appendChild(n));
      }
      return p;
    };
    p.scrollTop = (smooth) => scroll.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    p.scrollBottom = (smooth) => scroll.scrollTo({ top: scroll.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });

    (o.left || []).forEach((i) => i && left.appendChild(i));
    if (o.left) p._customLeft = true;
    (o.right || []).forEach((i) => i && right.appendChild(i));

    const onScroll = () => {
      const y = scroll.scrollTop;
      navbar.classList.toggle('scrolled', y > 4);
      if (large) navbar.classList.toggle('show-title', y > large.offsetHeight - 8);
      if (o.onScroll) o.onScroll(y, p);
    };
    scroll.addEventListener('scroll', onScroll, { passive: true });
    p._onScroll = onScroll;
    p.render();
    return p;
  };

  ui.nav = (container, rootFn) => {
    const el = h('div.nav');
    container.appendChild(el);
    const stack = [];
    let busy = false;
    const ctl = { el, stack };

    function backBtn(page) {
      return ui.navBtn({ icon: 'chevron.left', label: 'Back', cls: 'back', weight: 2.3, iconSize: 20, onTap: () => ctl.pop() });
    }

    function attach(page) {
      page.nav = ctl;
      if (stack.length && !page._customLeft && !page.opts.noBack) page.left.prepend(backBtn(page));
    }

    ctl.top = () => stack[stack.length - 1];
    ctl.depth = () => stack.length;
    ctl.push = (page, opts) => {
      if (busy) return page;
      opts = opts || {};
      attach(page);
      const prev = ctl.top();
      stack.push(page);
      el.appendChild(page.el);
      if (!prev || opts.instant) {
        if (prev) { prev.el.classList.add('below'); prev.opts.onHide && prev.opts.onHide(prev); }
        page.opts.onShow && page.opts.onShow(page);
        return page;
      }
      busy = true;
      page.el.classList.add('entering');
      const shade = h('div.nav-shade');
      prev.el.appendChild(shade);
      Promise.all([
        U.anim(page.el, [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: 480 }),
        U.anim(prev.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-28%)' }], { duration: 480 }),
        U.anim(shade, [{ opacity: 0 }, { opacity: 1 }], { duration: 480 }),
      ]).then(() => {
        page.el.classList.remove('entering');
        page.el.getAnimations().forEach((a) => a.cancel());
        prev.el.getAnimations().forEach((a) => a.cancel());
        shade.remove();
        prev.el.classList.add('below');
        busy = false;
        prev.opts.onHide && prev.opts.onHide(prev);
        page.opts.onShow && page.opts.onShow(page);
      });
      return page;
    };
    ctl.pop = (opts) => {
      if (busy || stack.length < 2) return false;
      opts = opts || {};
      const page = stack.pop();
      const prev = ctl.top();
      prev.el.classList.remove('below');
      if (opts.instant) {
        page.el.remove();
        page.opts.onHide && page.opts.onHide(page);
        page.opts.onClose && page.opts.onClose(page);
        prev.opts.onShow && prev.opts.onShow(prev);
        return true;
      }
      busy = true;
      const shade = h('div.nav-shade');
      prev.el.appendChild(shade);
      const from = opts.from || 0;
      Promise.all([
        U.anim(page.el, [{ transform: `translateX(${from}px)` }, { transform: 'translateX(100%)' }], { duration: opts.fast ? 260 : 420 }),
        U.anim(prev.el, [{ transform: `translateX(${-28 + (from / 402) * 28}%)` }, { transform: 'translateX(0)' }], { duration: opts.fast ? 260 : 420 }),
        U.anim(shade, [{ opacity: 1 - from / 402 }, { opacity: 0 }], { duration: opts.fast ? 260 : 420 }),
      ]).then(() => {
        page.el.remove();
        prev.el.getAnimations().forEach((a) => a.cancel());
        shade.remove();
        busy = false;
        page.opts.onHide && page.opts.onHide(page);
        page.opts.onClose && page.opts.onClose(page);
        prev.opts.onShow && prev.opts.onShow(prev);
        if (prev.opts.refreshOnShow) prev.render();
      });
      return true;
    };
    ctl.popToRoot = () => {
      while (stack.length > 2) {
        const p = stack.splice(stack.length - 2, 1)[0];
        p.el.remove();
      }
      return ctl.pop();
    };
    ctl.replace = (page) => {
      const old = stack.pop();
      if (old) old.el.remove();
      attach(page);
      stack.push(page);
      el.appendChild(page.el);
      page.opts.onShow && page.opts.onShow(page);
      return page;
    };
    ctl.reset = (page) => {
      stack.splice(0).forEach((p) => p.el.remove());
      ctl.push(page, { instant: true });
    };

    // edge-swipe back
    U.drag(el, {
      axis: 'x',
      filter: (e) => {
        if (stack.length < 2 || busy) return false;
        const r = el.getBoundingClientRect();
        const sc = (JC.os && JC.os.scale) || 1;
        return (e.clientX - r.left) / sc < 26;
      },
      start: (e, p) => {
        if (p.dx <= 0) return false;
        const prev = stack[stack.length - 2];
        prev.el.classList.remove('below');
        ctl._shade = h('div.nav-shade');
        prev.el.appendChild(ctl._shade);
      },
      move: (e, p) => {
        const page = ctl.top();
        const prev = stack[stack.length - 2];
        const x = Math.max(0, p.dx);
        page.el.style.transform = `translateX(${x}px)`;
        prev.el.style.transform = `translateX(${-28 + (x / 402) * 28}%)`;
        ctl._shade.style.opacity = String(1 - x / 402);
      },
      end: (e, p) => {
        const page = ctl.top();
        const prev = stack[stack.length - 2];
        const x = Math.max(0, p.dx);
        page.el.style.transform = '';
        prev.el.style.transform = '';
        if (ctl._shade) ctl._shade.remove();
        if (x > 130 || p.vx > 0.5) ctl.pop({ from: x, fast: true });
        else {
          U.anim(page.el, [{ transform: `translateX(${x}px)` }, { transform: 'translateX(0)' }], { duration: 250 }).then(() => page.el.getAnimations().forEach((a) => a.cancel()));
          U.anim(prev.el, [{ transform: `translateX(${-28 + (x / 402) * 28}%)` }, { transform: 'translateX(-28%)' }], { duration: 250 }).then(() => { prev.el.getAnimations().forEach((a) => a.cancel()); prev.el.classList.add('below'); });
        }
      },
    });

    const root = typeof rootFn === 'function' ? rootFn(ctl) : rootFn;
    if (root) ctl.push(root, { instant: true });
    return ctl;
  };

  ui.tabs = (container, o) => {
    const el = h('div.tabs');
    container.appendChild(el);
    const panes = {};
    const navs = {};
    let current = null;
    const bar = h('div.tabbar');
    const group = h('div.tabbar-group');
    bar.appendChild(group);
    if (o.tint) el.style.setProperty('--tint', o.tint);
    const items = {};
    o.tabs.forEach((t) => {
      const it = h('div.tab-item', {
        data: { tab: t.id },
        onTap: () => ctl.select(t.id, true),
      }, JC.icon(t.icon, { size: 23 }), h('span.tab-label', t.title));
      if (t.badge) it.appendChild(h('span.tab-badge', String(t.badge)));
      items[t.id] = it;
      group.appendChild(it);
    });
    if (o.search) {
      const s = h('div.tabbar-search', { onTap: () => ctl.select(o.search.id, true) }, JC.icon('magnifyingglass', { size: 21, weight: 2.2 }));
      items[o.search.id] = s;
      bar.appendChild(s);
    }
    el.appendChild(bar);
    const ctl = {
      el, bar,
      select(id, user) {
        const t = o.tabs.find((x) => x.id === id) || (o.search && o.search.id === id ? o.search : null);
        if (!t) return;
        if (current === id && user) {
          const n = navs[id];
          if (n && n.depth() > 1) n.popToRoot();
          else if (n && n.top()) n.top().scrollTop(true);
          return;
        }
        if (!panes[id]) {
          panes[id] = h('div.tab-pane');
          el.insertBefore(panes[id], bar);
          navs[id] = ui.nav(panes[id], t.root);
        }
        Object.keys(panes).forEach((k) => panes[k].classList.toggle('on', k === id));
        Object.keys(items).forEach((k) => items[k].classList.toggle('on', k === id));
        const prev = current;
        current = id;
        if (o.onChange && prev !== id) o.onChange(id);
        const top = navs[id].top();
        if (top && top.opts.onShow && prev !== id && prev !== null) top.opts.onShow(top);
      },
      nav: (id) => navs[id || current],
      current: () => current,
      badge(id, n) {
        const it = items[id];
        if (!it) return;
        const old = it.querySelector('.tab-badge');
        if (old) old.remove();
        if (n) it.appendChild(h('span.tab-badge', String(n)));
      },
      hideBar(on) { bar.classList.toggle('hidden', !!on); },
    };
    ctl.select(o.active || o.tabs[0].id);
    return ctl;
  };

  // ── Lists ────────────────────────────────────────────────────────
  ui.row = (r) => {
    if (r.custom) return h('div.row.custom', r.custom);
    const tappable = !!(r.onTap || r.toggle == null && r.chevron);
    const inner = h('div.row-inner');
    if (r.icon) {
      const ic = r.icon;
      if (ic.glyph) inner.appendChild(h('div.row-icon', { style: { background: ic.bg || 'var(--blue)', color: ic.color || '#fff' } }, JC.icon(ic.glyph, { size: ic.size || 17, weight: 2 })));
      else if (ic.app) { const a = JC.appIcon(ic.app); a.classList.add('row-appicon'); inner.appendChild(a); }
      else if (ic.emoji) inner.appendChild(h('div.row-icon.emoji', { style: { background: ic.bg || 'transparent' } }, ic.emoji));
      else if (ic.node) inner.appendChild(ic.node);
    }
    if (r.avatar) inner.appendChild(ui.avatar(r.avatar, r.avatarSize || 40));
    if (r.art) inner.appendChild(JC.art.el(r.art, { cls: 'row-art' + (r.artCls ? ' ' + r.artCls : '') }));
    if (r.leading) inner.appendChild(r.leading);
    const main = h('div.row-main');
    const t = h('div.row-title', { class: { destructive: !!r.destructive, tinted: !!r.tinted } }, r.title);
    if (r.titleRight) t.appendChild(r.titleRight);
    main.appendChild(t);
    if (r.subtitle) main.appendChild(h('div.row-subtitle', { class: { clamp2: !!r.clamp } }, r.subtitle));
    if (r.subtitle2) main.appendChild(h('div.row-subtitle', r.subtitle2));
    inner.appendChild(main);
    if (r.detail != null) inner.appendChild(h('div.row-detail', r.detail));
    if (r.badge) inner.appendChild(h('span.badge.row-badge', String(r.badge)));
    if (r.right) inner.appendChild(r.right);
    if (r.toggle) inner.appendChild(ui.toggle(r.toggle));
    if (r.check) inner.appendChild(h('div.row-check', JC.icon('checkmark', { size: 18, weight: 2.4 })));
    if (r.info) inner.appendChild(h('div.row-info', { onTap: (e) => { e.stopPropagation(); r.info(e); } }, JC.icon('info.circle', { size: 22 })));
    if (r.chevron || (r.onTap && r.chevron !== false && r.nav)) inner.appendChild(h('div.row-chevron', JC.icon('chevron.right', { size: 14, weight: 2.6 })));
    const row = h('div.row', { class: { center: !!r.center, 'has-icon': !!(r.icon || r.avatar), destructive: !!r.destructive, [r.cls || '_']: !!r.cls } });
    if (r.iconInset) row.style.setProperty('--sep-inset', r.iconInset + 'px');
    if (r.swipe || r.lead) {
      const wrap = h('div.row-swipe');
      const acts = h('div.swipe-acts.trail');
      const leads = h('div.swipe-acts.lead');
      (r.swipe || []).forEach((a) => acts.appendChild(h('div.swipe-act', { style: { background: a.color || 'var(--gray)' }, onTap: (e) => { e.stopPropagation(); close(); a.onTap && a.onTap(); } }, a.icon ? JC.icon(a.icon, { size: 20 }) : null, h('span', a.text))));
      (r.lead || []).forEach((a) => leads.appendChild(h('div.swipe-act', { style: { background: a.color || 'var(--blue)' }, onTap: (e) => { e.stopPropagation(); close(); a.onTap && a.onTap(); } }, a.icon ? JC.icon(a.icon, { size: 20 }) : null, h('span', a.text))));
      wrap.append(leads, acts, inner);
      row.appendChild(wrap);
      let open = 0;
      const tw = () => (r.swipe || []).length * 76;
      const lw = () => (r.lead || []).length * 76;
      const set = (x, anim) => {
        inner.style.transition = anim ? 'transform .3s cubic-bezier(.32,.72,0,1)' : 'none';
        inner.style.transform = `translateX(${x}px)`;
        acts.style.width = Math.max(0, -x) + 'px';
        leads.style.width = Math.max(0, x) + 'px';
      };
      const close = () => { open = 0; set(0, true); };
      row._closeSwipe = close;
      U.drag(inner, {
        axis: 'x',
        start: () => { document.querySelectorAll('.row.swiped').forEach((o) => { if (o !== row && o._closeSwipe) { o._closeSwipe(); o.classList.remove('swiped'); } }); },
        move: (e, p) => {
          let x = open + p.dx;
          if (!r.lead && x > 0) x = x / 6;
          if (!r.swipe && x < 0) x = x / 6;
          set(x, false);
        },
        end: (e, p) => {
          const x = open + p.dx;
          if (r.swipe && x < -Math.min(tw(), 60) / 1.5) {
            if (x < -260 && r.swipe[0].full !== false && r.fullSwipe) { set(-402, true); setTimeout(() => r.swipe[0].onTap && r.swipe[0].onTap(), 200); return; }
            open = -tw(); row.classList.add('swiped');
          } else if (r.lead && x > Math.min(lw(), 60) / 1.5) { open = lw(); row.classList.add('swiped'); }
          else { open = 0; row.classList.remove('swiped'); }
          set(open, true);
        },
      });
      if (r.onTap) ui.onTap(inner, (e) => { if (open) { close(); return; } r.onTap(e); });
    } else {
      row.appendChild(inner);
      if (r.onTap) ui.onTap(row, r.onTap);
    }
    if (r.menu) ui.contextMenu(row, r.menu);
    if (!tappable && !r.toggle && !r.swipe) row.classList.add('static');
    return row;
  };

  ui.list = (sections, o) => {
    o = o || {};
    const el = h('div.list', { class: ['st-' + (o.style || 'inset'), o.cls] });
    (Array.isArray(sections) ? sections : [sections]).forEach((sec) => {
      if (!sec) return;
      const s = h('div.section', { class: sec.cls });
      if (sec.header) s.appendChild(h('div.section-header', { class: { big: !!sec.bigHeader } }, sec.header, sec.headerRight || null));
      const body = h('div.section-body');
      (sec.rows || []).forEach((r) => r && body.appendChild(r instanceof Node ? r : ui.row(r)));
      if (sec.rows && sec.rows.length) s.appendChild(body);
      if (sec.footer) s.appendChild(h('div.section-footer', sec.footer));
      el.appendChild(s);
    });
    return el;
  };

  ui.empty = (o) => h('div.ui-empty', o.icon ? JC.icon(o.icon, { size: 44, weight: 1.4 }) : null, h('div.ui-empty-title', o.title || ''), o.text ? h('div.ui-empty-text', o.text) : null, o.action ? ui.btn(Object.assign({ kind: 'tinted', size: 'm' }, o.action)) : null);

  // ── Controls ─────────────────────────────────────────────────────
  ui.toggle = (o) => {
    let on = !!o.on;
    const el = h('div.toggle', { class: { on }, attrs: { role: 'switch', 'aria-checked': on ? 'true' : 'false', tabindex: 0 } }, h('div.toggle-knob'));
    if (o.tint) el.style.setProperty('--on', o.tint);
    const set = (v, fire) => {
      on = !!v;
      el.classList.toggle('on', on);
      el.setAttribute('aria-checked', on ? 'true' : 'false');
      if (fire && o.onChange) o.onChange(on);
    };
    ui.onTap(el, (e) => { e.stopPropagation(); if (o.disabled) return; JC.audio.haptic(6); set(!on, true); });
    el.set = (v) => set(v, false);
    el.get = () => on;
    return el;
  };

  ui.segmented = (o) => {
    const items = o.items;
    let value = o.value == null ? 0 : o.value;
    const el = h('div.seg', { class: o.cls });
    const thumb = h('div.seg-thumb');
    el.appendChild(thumb);
    const btns = items.map((label, i) => h('div.seg-item', {
      class: { on: i === value },
      onTap: () => { if (i === value) return; set(i); o.onChange && o.onChange(i, items[i]); },
    }, label));
    btns.forEach((b) => el.appendChild(b));
    el.style.setProperty('--n', items.length);
    const set = (i) => {
      value = i;
      btns.forEach((b, j) => b.classList.toggle('on', j === i));
      thumb.style.transform = `translateX(${i * 100}%)`;
    };
    set(value);
    el.set = set;
    el.get = () => value;
    return el;
  };

  ui.slider = (o) => {
    const min = o.min == null ? 0 : o.min, max = o.max == null ? 1 : o.max, step = o.step || 0;
    let v = o.value == null ? min : o.value;
    const fill = h('div.slider-fill');
    const thumb = h('div.slider-thumb');
    const track = h('div.slider-track', fill, thumb);
    const el = h('div.slider', { class: o.cls },
      o.icons ? h('div.slider-ic', JC.icon(o.icons[0], { size: 16 })) : null,
      track,
      o.icons ? h('div.slider-ic', JC.icon(o.icons[1], { size: 20 })) : null);
    const draw = () => {
      const t = (v - min) / (max - min);
      fill.style.width = t * 100 + '%';
      thumb.style.left = t * 100 + '%';
    };
    const fromX = (clientX) => {
      const r = track.getBoundingClientRect();
      let t = U.clamp((clientX - r.left) / r.width, 0, 1);
      let nv = min + t * (max - min);
      if (step) nv = Math.round(nv / step) * step;
      return U.clamp(nv, min, max);
    };
    const setV = (nv, fire) => {
      v = nv;
      draw();
      if (fire && o.onInput) o.onInput(v);
    };
    track.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      setV(fromX(e.clientX), true);
      el.classList.add('active');
      const mv = (ev) => setV(fromX(ev.clientX), true);
      const up = () => {
        el.classList.remove('active');
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        o.onChange && o.onChange(v);
      };
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
    });
    track.__tap = true;
    draw();
    el.set = (nv) => setV(nv, false);
    el.get = () => v;
    return el;
  };

  ui.stepper = (o) => {
    let v = o.value || 0;
    const min = o.min == null ? -Infinity : o.min, max = o.max == null ? Infinity : o.max;
    const el = h('div.stepper',
      h('div.step-btn', { onTap: () => { if (v > min) { v -= o.step || 1; o.onChange && o.onChange(v); } } }, JC.icon('minus', { size: 16, weight: 2.4 })),
      h('div.step-sep'),
      h('div.step-btn', { onTap: () => { if (v < max) { v += o.step || 1; o.onChange && o.onChange(v); } } }, JC.icon('plus', { size: 16, weight: 2.4 })));
    return el;
  };

  ui.input = (o) => {
    o = o || {};
    const tag = o.multiline ? 'textarea' : 'input';
    const el = h(tag + '.field', {
      class: o.cls,
      placeholder: o.placeholder || '',
      value: o.value || '',
      attrs: { inputmode: 'none', enterkeyhint: o.enterkey || (o.multiline ? 'return' : 'done'), autocomplete: 'off', autocorrect: 'off', spellcheck: 'false', autocapitalize: o.cap || 'sentences' },
    });
    if (o.type) el.type = o.type;
    if (o.rows) el.rows = o.rows;
    if (o.max) el.maxLength = o.max;
    if (o.send) el.dataset.send = '1';
    if (o.kbType) el.dataset.kb = o.kbType;
    if (o.cap === 'none') el.dataset.cap = 'none';
    if (o.id) el.id = o.id;
    el.addEventListener('input', () => {
      if (o.autoGrow) { el.style.height = 'auto'; el.style.height = Math.min(o.maxHeight || 120, el.scrollHeight) + 'px'; }
      o.onInput && o.onInput(el.value, el);
    });
    el.addEventListener('kbreturn', () => o.onSubmit && o.onSubmit(el.value, el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && (!o.multiline || o.send)) {
        e.preventDefault();
        // keyboard.js dispatches kbreturn for physical Enter when the on-screen keyboard is up
        if (!JC.kb.visible) o.onSubmit && o.onSubmit(el.value, el);
      }
      if (e.key === 'Escape') el.blur();
    });
    if (o.onFocus) el.addEventListener('focus', o.onFocus);
    if (o.onBlur) el.addEventListener('blur', o.onBlur);
    el.__tap = true;
    return el;
  };

  ui.search = (o) => {
    o = o || {};
    const input = ui.input({ placeholder: o.placeholder || 'Search', enterkey: 'search', onInput: (v) => { clear.hidden = !v; o.onInput && o.onInput(v); }, onSubmit: (v) => { o.onSubmit && o.onSubmit(v); input.blur(); } });
    const clear = h('div.search-clear', { hidden: true, onTap: () => { input.value = ''; clear.hidden = true; o.onInput && o.onInput(''); input.focus(); } }, JC.icon('xmark.circle.fill', { size: 17 }));
    const cancel = h('div.search-cancel', { onTap: () => { input.value = ''; clear.hidden = true; o.onInput && o.onInput(''); input.blur(); el.classList.remove('focused'); o.onCancel && o.onCancel(); } }, o.cancelText || 'Cancel');
    const field = h('div.search-field', JC.icon('magnifyingglass', { size: 17, weight: 2 }), input, clear, o.mic !== false ? h('div.search-mic', { onTap: () => ui.toast((JC.world && JC.world.brand && JC.world.brand.dictation) || 'Dictation isn’t available', { icon: 'mic.slash.fill' }) }, JC.icon('mic.fill', { size: 17 })) : null);
    const el = h('div.search', { class: o.cls }, field, cancel);
    input.addEventListener('focus', () => { el.classList.add('focused'); o.onFocus && o.onFocus(); });
    el.input = input;
    el.setValue = (v) => { input.value = v; clear.hidden = !v; };
    return el;
  };

  /** iOS wheel picker. cols: [{items:[label|{label,value}], value}] */
  ui.wheel = (o) => {
    const ROW = 34;
    const el = h('div.wheel', h('div.wheel-band'));
    const values = [];
    o.cols.forEach((col, ci) => {
      const items = col.items.map((it) => (typeof it === 'object' ? it : { label: String(it), value: it }));
      const list = h('div.wheel-col.scroll', { style: col.width ? { flex: '0 0 ' + col.width + 'px' } : null });
      const pad = () => h('div.wheel-pad');
      list.appendChild(pad());
      const nodes = items.map((it) => h('div.wheel-item', { class: { left: col.align === 'left', right: col.align === 'right' } }, h('span.wheel-face', it.label)));
      nodes.forEach((n) => list.appendChild(n));
      list.appendChild(pad());
      el.appendChild(list);
      let idx = Math.max(0, items.findIndex((it) => it.value === col.value));
      values[ci] = items[idx] ? items[idx].value : undefined;
      const paint = () => {
        const center = list.scrollTop + ROW * 2;
        nodes.forEach((n, i) => {
          const d = (i * ROW - center + ROW * 2) / ROW;
          const a = U.clamp(d * 22, -80, 80);
          n.firstChild.style.transform = `rotateX(${-a}deg)`;
          n.style.opacity = String(U.clamp(1 - Math.abs(d) * 0.28, 0.15, 1));
          n.classList.toggle('sel', Math.abs(d) < 0.5);
        });
      };
      const settle = U.debounce(() => {
        const i = U.clamp(Math.round(list.scrollTop / ROW), 0, items.length - 1);
        if (values[ci] !== items[i].value) {
          values[ci] = items[i].value;
          JC.audio.play('tap');
          o.onChange && o.onChange(values.slice(), ci);
        }
      }, 90);
      list.addEventListener('scroll', () => { paint(); settle(); }, { passive: true });
      nodes.forEach((n, i) => ui.onTap(n, () => list.scrollTo({ top: i * ROW, behavior: 'smooth' })));
      requestAnimationFrame(() => { list.scrollTop = idx * ROW; paint(); });
      // mouse wheel / drag friendly
      U.drag(list, {
        axis: 'y',
        filter: (e) => e.pointerType === 'mouse',
        start: () => { list._st = list.scrollTop; list.style.scrollSnapType = 'none'; },
        move: (e, p) => { list.scrollTop = list._st - p.dy; },
        end: () => { list.style.scrollSnapType = ''; const i = Math.round(list.scrollTop / ROW); list.scrollTo({ top: i * ROW, behavior: 'smooth' }); },
      });
    });
    el.values = () => values.slice();
    return el;
  };

  // ── Overlays ─────────────────────────────────────────────────────
  function backdrop(layer, cls) {
    const b = h('div.backdrop', { class: cls });
    layer.appendChild(b);
    return b;
  }

  ui.alert = (o) => new Promise((resolve) => {
    const layer = ui.layer(true);
    const back = backdrop(layer, 'alert-back');
    let field = null;
    if (o.input) field = ui.input(Object.assign({ cls: 'alert-field' }, o.input, { onSubmit: () => done(o.buttons.length - 1) }));
    const btns = o.buttons || [{ text: 'OK' }];
    const card = h('div.alert', { attrs: { role: 'alertdialog' } },
      o.icon ? h('div.alert-icon', o.icon instanceof Node ? o.icon : JC.icon(o.icon, { size: 34 })) : null,
      o.title ? h('div.alert-title', o.title) : null,
      o.message ? h('div.alert-msg', o.message) : null,
      field,
      h('div.alert-btns', { class: { stack: btns.length > 2 || o.stack } }, btns.map((b, i) => h('div.alert-btn', {
        class: { cancel: b.style === 'cancel', destructive: b.style === 'destructive', primary: b.style === 'default' || b.primary },
        onTap: () => done(i),
      }, b.text))));
    layer.appendChild(card);
    U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    U.anim(card, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(1.12)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 320, easing: U.SPRING });
    if (field) setTimeout(() => field.focus(), 250);
    function done(i) {
      const b = btns[i];
      const val = field ? field.value : undefined;
      if (field) field.blur();
      U.anim(card, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.96)' }], { duration: 160 }).then(() => card.remove());
      U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => back.remove());
      if (b && b.onTap) b.onTap(val);
      resolve({ index: i, text: b && b.text, value: val });
    }
  });

  ui.actionSheet = (o) => new Promise((resolve) => {
    const layer = ui.layer(o.system);
    const back = backdrop(layer, 'sheet-back');
    const acts = o.actions || [];
    const close = (i) => {
      U.anim(wrap, [{ transform: 'translateY(0)' }, { transform: 'translateY(110%)' }], { duration: 280 }).then(() => wrap.remove());
      U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 280 }).then(() => back.remove());
      const a = acts[i];
      if (a && a.onTap) setTimeout(() => a.onTap(), 60);
      resolve(i);
    };
    ui.onTap(back, () => close(-1));
    const group = h('div.as-group',
      (o.title || o.message) ? h('div.as-head', o.title ? h('div.as-title', o.title) : null, o.message ? h('div.as-msg', o.message) : null) : null,
      acts.map((a, i) => h('div.as-btn', { class: { destructive: a.style === 'destructive' }, onTap: () => close(i) }, a.icon ? JC.icon(a.icon, { size: 20 }) : null, h('span', a.text))));
    const cancel = h('div.as-group.as-cancel', h('div.as-btn.bold', { onTap: () => close(-1) }, o.cancel || 'Cancel'));
    const wrap = h('div.action-sheet', group, cancel);
    layer.appendChild(wrap);
    U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    U.anim(wrap, [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }], { duration: 380 });
  });

  ui.sheet = (o) => {
    o = o || {};
    const layer = ui.layer(o.system);
    const win = !o.system && JC.os && JC.os.activeWin ? JC.os.activeWin() : null;
    const back = backdrop(layer, 'sheet-back');
    const detent = o.detent || 'large';
    const el = h('div.sheet', { class: ['d-' + detent, o.cls] });
    if (o.bg) el.style.background = o.bg;
    const s = { el, closed: false };
    const head = h('div.sheet-head',
      h('div.sheet-grabber'),
      h('div.sheet-bar',
        h('div.sheet-left', o.left ? ui.navBtn(Object.assign({ text: o.left.text, icon: o.left.icon }, { onTap: () => { if (o.left.onTap) { if (o.left.onTap(s) !== false) s.close(); } else s.close(); } })) : null),
        h('div.sheet-title', o.title || ''),
        h('div.sheet-right', o.right ? ui.navBtn({ text: o.right.text, icon: o.right.icon, prominent: o.right.bold !== false, disabled: o.right.disabled, onTap: () => { if (o.right.onTap) { if (o.right.onTap(s) !== false) s.close(); } else s.close(); } }) : null)));
    if (o.noHead) head.classList.add('mini');
    const body = h('div.sheet-body.scroll');
    el.append(head, body);
    s.body = body;
    s.head = head;
    s.setTitle = (t) => { head.querySelector('.sheet-title').textContent = t; };
    s.render = () => {
      if (typeof o.content === 'function') {
        body.innerHTML = '';
        const out = o.content(s);
        (Array.isArray(out) ? out : [out]).forEach((n) => n && body.appendChild(n));
      } else if (o.content) body.appendChild(o.content);
    };
    s.setRightDisabled = (d) => { const b = head.querySelector('.sheet-right .navbtn'); if (b) b.disabled = d; };
    s.close = () => {
      if (s.closed) return;
      s.closed = true;
      if (document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
      U.anim(el, [{ transform: el.style.transform || 'translateY(0)' }, { transform: 'translateY(105%)' }], { duration: 300 }).then(() => el.remove());
      U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => back.remove());
      if (win && detent === 'large') win.el.classList.remove('sheet-under');
      o.onClose && o.onClose(s);
    };
    ui.onTap(back, () => { if (!o.modal) s.close(); });
    layer.appendChild(el);
    s.render();
    if (win && detent === 'large') win.el.classList.add('sheet-under');
    U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    U.anim(el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 440 }).then(() => el.getAnimations().forEach((a) => a.cancel()));
    U.drag(head, {
      axis: 'y',
      move: (e, p) => { el.style.transform = `translateY(${Math.max(0, p.dy)}px)`; },
      end: (e, p) => {
        if (p.dy > 120 || p.vy > 0.6) { if (!o.modal) s.close(); else el.style.transform = ''; }
        else { U.anim(el, [{ transform: el.style.transform }, { transform: 'translateY(0)' }], { duration: 250 }).then(() => { el.style.transform = ''; el.getAnimations().forEach((a) => a.cancel()); }); }
      },
    });
    return s;
  };

  let openMenu = null;
  ui.menu = (anchor, items, o) => {
    o = o || {};
    if (openMenu) openMenu();
    const layer = ui.layer(o.system);
    const back = h('div.pmenu-back');
    layer.appendChild(back);
    const menu = h('div.pmenu', { attrs: { role: 'menu' } });
    let group = h('div.pmenu-group');
    menu.appendChild(group);
    if (o.title) group.appendChild(h('div.pmenu-title', o.title));
    items.forEach((it) => {
      if (!it) return;
      if (it === '-') { group = h('div.pmenu-group'); menu.appendChild(group); return; }
      group.appendChild(h('div.pmenu-item', {
        class: { destructive: !!it.destructive, disabled: !!it.disabled },
        onTap: () => { if (it.disabled) return; close(); setTimeout(() => it.onTap && it.onTap(), 120); },
      }, it.checked ? h('span.pmenu-check', JC.icon('checkmark', { size: 15, weight: 2.4 })) : (items.some((x) => x && x.checked !== undefined) ? h('span.pmenu-check') : null),
      h('span.pmenu-text', it.text, it.sub ? h('span.pmenu-sub', it.sub) : null), it.icon ? JC.icon(it.icon, { size: 19 }) : null));
    });
    layer.appendChild(menu);
    const lr = toLocal(layer.getBoundingClientRect());
    const ar = anchor ? toLocal(anchor.getBoundingClientRect()) : { x: 201, y: 400, w: 0, h: 0 };
    const mw = 250;
    const mh = Math.min(menu.offsetHeight || items.length * 44, 600);
    let x = ar.x + ar.w / 2 - mw / 2 - lr.x;
    x = U.clamp(x, 12, 402 - mw - 12);
    if (ar.x + ar.w > 300) x = U.clamp(ar.x + ar.w - mw - lr.x, 12, 402 - mw - 12);
    if (ar.x < 100) x = U.clamp(ar.x - lr.x, 12, 402 - mw - 12);
    let y = ar.y + ar.h + 8 - lr.y;
    let up = false;
    if (y + mh > lr.h - 30) { y = ar.y - mh - 8 - lr.y; up = true; }
    menu.style.left = x + 'px';
    menu.style.top = Math.max(50, y) + 'px';
    menu.style.transformOrigin = `${ar.x + ar.w / 2 - lr.x - x}px ${up ? '100%' : '0'}`;
    U.anim(menu, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, easing: U.SPRING });
    function close() {
      openMenu = null;
      U.anim(menu, [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.8)' }], { duration: 160 }).then(() => menu.remove());
      back.remove();
    }
    ui.onTap(back, close);
    openMenu = close;
    return close;
  };

  /** Long-press context menu. fn() → { items, preview? } */
  ui.contextMenu = (el, fn) => {
    U.longPress(el, () => {
      const spec = typeof fn === 'function' ? fn() : fn;
      if (!spec) return;
      const items = Array.isArray(spec) ? spec : spec.items;
      JC.audio.haptic(12);
      const layer = ui.layer(spec.system);
      const back = h('div.ctx-back');
      layer.appendChild(back);
      const lr = toLocal(layer.getBoundingClientRect());
      const r = toLocal(el.getBoundingClientRect());
      let prev;
      if (spec.preview) prev = h('div.ctx-preview.custom', spec.preview);
      else {
        prev = el.cloneNode(true);
        prev.classList.add('ctx-preview');
        prev.style.width = r.w + 'px';
        prev.style.height = r.h + 'px';
      }
      prev.style.left = (spec.preview ? 16 : r.x - lr.x) + 'px';
      prev.style.top = r.y - lr.y + 'px';
      layer.appendChild(prev);
      const menu = h('div.pmenu.ctx-menu');
      let group = h('div.pmenu-group');
      menu.appendChild(group);
      items.forEach((it) => {
        if (!it) return;
        if (it === '-') { group = h('div.pmenu-group'); menu.appendChild(group); return; }
        group.appendChild(h('div.pmenu-item', { class: { destructive: !!it.destructive }, onTap: () => { close(); setTimeout(() => it.onTap && it.onTap(), 150); } }, h('span.pmenu-text', it.text), it.icon ? JC.icon(it.icon, { size: 19 }) : null));
      });
      layer.appendChild(menu);
      const mh = menu.offsetHeight;
      const ph = spec.preview ? prev.offsetHeight : r.h;
      let top = r.y - lr.y;
      // keep preview + menu on screen
      const maxTop = lr.h - 40 - mh - 12 - ph;
      if (top > maxTop) top = Math.max(60, maxTop);
      prev.style.top = top + 'px';
      menu.style.top = top + ph + 12 + 'px';
      const mw = 250;
      menu.style.left = U.clamp(r.x - lr.x, 12, 402 - mw - 12) + 'px';
      U.anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
      U.anim(prev, [{ transform: 'scale(.96)' }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }], { duration: 350 });
      U.anim(menu, [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 320, easing: U.SPRING });
      function close() {
        U.anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => back.remove());
        U.anim(prev, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).then(() => prev.remove());
        U.anim(menu, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.85)' }], { duration: 160 }).then(() => menu.remove());
      }
      ui.onTap(back, close);
    });
  };

  let toastT = null;
  ui.toast = (text, o) => {
    o = o || {};
    const layer = document.getElementById('sys-toasts') || ui.layer(true);
    layer.innerHTML = '';
    const t = h('div.toast', o.icon ? JC.icon(o.icon, { size: 18 }) : null, h('span', text));
    layer.appendChild(t);
    U.anim(t, [{ opacity: 0, transform: 'translate(-50%,-14px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%,0) scale(1)' }], { duration: 320, easing: U.SPRING });
    clearTimeout(toastT);
    toastT = setTimeout(() => U.anim(t, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-50%,-10px)' }], { duration: 250 }).then(() => t.remove()), o.ms || 1900);
  };

  /** Share sheet. payload: {kind:'photo'|'link'|'text'|'memo'|'note'|'location', art, text, url, id} */
  ui.share = (o) => {
    o = o || {};
    const people = ((JC.world && JC.world.people && JC.world.people.share) || []).filter((id) => JC.contacts.get(id));
    const sendTo = (cid) => {
      s.close();
      const th = JC.story.threadFor(cid);
      const p = o.payload || {};
      if (o.onShareTo) return o.onShareTo(cid, th);
      if (p.kind === 'photo') JC.story.send(th, { img: p.art });
      else if (p.kind === 'memo') JC.story.send(th, { memo: p.id });
      else if (p.kind === 'location') JC.story.send(th, { loc: p.place });
      else JC.story.send(th, { text: p.text || o.title || '' , link: p.url ? { title: o.title, site: o.subtitle, url: p.url, art: p.art } : undefined });
      JC.audio.play('send');
      ui.toast('Sent to ' + JC.contacts.short(cid), { icon: 'paperplane.fill' });
    };
    const s = ui.sheet({
      detent: 'medium',
      noHead: true,
      cls: 'share-sheet',
      content: () => [
        h('div.share-head',
          o.art ? JC.art.el(o.art, { cls: 'share-thumb' }) : h('div.share-thumb.icon', JC.icon(o.icon || 'doc.text', { size: 26 })),
          h('div.share-meta', h('div.share-title', o.title || 'Share'), o.subtitle ? h('div.share-sub', o.subtitle) : null),
          h('div.share-x', { onTap: () => s.close() }, JC.icon('xmark', { size: 15, weight: 2.6 }))),
        h('div.share-people.hscroll', people.map((id) => h('div.share-person', { onTap: () => sendTo(id) },
          h('div.share-av', ui.avatar(id, 62), h('div.share-badge', JC.appIcon('messages'))),
          h('div.share-name', JC.contacts.short(id))))),
        h('div.share-apps.hscroll', [
          ['messages', 'Messages', () => { s.close(); JC.os.open('messages', { compose: o.payload || { text: o.title } }); }],
          ['mail', 'Mail', () => { s.close(); JC.os.open('mail', { compose: { subject: o.title || '', body: (o.payload && (o.payload.text || o.payload.url)) || '' } }); }],
          ['notes', 'Notes', () => { s.close(); JC.store.add('notes', { title: o.title || 'Shared', body: (o.title || '') + '\n' + ((o.payload && (o.payload.text || o.payload.url)) || ''), t: JC.time.now(), folder: 'notes' }, { front: true }); ui.toast('Saved to Notes', { icon: 'checkmark' }); }],
          ['wavelet', 'Wavelet', () => { s.close(); JC.os.open('wavelet', { compose: o.payload || {} }); }],
        ].map(([id, name, fn]) => h('div.share-app', { onTap: fn }, JC.appIcon(id), h('div.share-name', name)))),
        ui.list([{ rows: [
          { title: 'Copy', icon: { node: JC.icon('doc.on.doc', { size: 21 }) }, onTap: () => { s.close(); U.copy(o.payload && (o.payload.text || o.payload.url) || o.title || ''); ui.toast('Copied', { icon: 'doc.on.doc' }); } },
          ...(o.actions || []).map((a) => ({ title: a.text, icon: { node: JC.icon(a.icon || 'circle', { size: 21 }) }, onTap: () => { s.close(); a.onTap && a.onTap(); } })),
          { title: 'Save to Files', icon: { node: JC.icon('folder', { size: 21 }) }, onTap: () => { s.close(); ui.alert({ title: 'Files Unavailable', message: (JC.world && JC.world.device && JC.world.device.files) || 'iCloud Drive isn’t available on this iPhone.', buttons: [{ text: 'OK' }] }); } },
          { title: 'Print', icon: { node: JC.icon('printer', { size: 21 }) }, onTap: () => { s.close(); ui.alert({ title: 'No AirPrint Printers Found', message: (JC.world && JC.world.device && JC.world.device.print) || 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }); } },
        ] }], { cls: 'share-actions' }),
      ],
    });
    return s;
  };

  /** Dev audit: list tappable-looking elements without a handler. */
  ui.audit = () => {
    const bad = [];
    document.querySelectorAll('#screen .tap, #screen button').forEach((el) => {
      if (el.offsetParent === null) return;
      let n = el, ok = false;
      while (n && n !== document.body) { if (n.__tap) { ok = true; break; } n = n.parentElement; }
      if (!ok) bad.push(el);
    });
    return bad;
  };

  JC.ui = ui;
})();
