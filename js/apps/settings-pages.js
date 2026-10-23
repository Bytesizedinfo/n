/* Settings pages, part 1: connectivity, battery, General (+ About, Software Update, Date & Time, Keyboard…),
   Display & Brightness, Wallpaper, Sounds & Haptics, Focus, Notifications, Face ID & Passcode.
   Each page: { title, path, icon, idx:[search terms], render(K, arg, page) → [sections|nodes], right?, gate? } */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const SK = (JC.settingsKit = JC.settingsKit || { pages: {} });
  const P = SK.pages;
  const S = () => JC.state.d.settings;

  // ── tiny SVG charts (battery / screen time) — hairline grid, thin bars, tap tooltips ──
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function roundTop(x, y, w, hh, r) {
    r = Math.min(r, w / 2, hh);
    if (hh <= 0) return '';
    return `M${x},${y + hh}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + hh}Z`;
  }
  /** stacked bar chart. data: [{label, segs:[n…], tip}], colors:[css…], yMax, ticks:[n], fmt(n) */
  SK.barChart = function (o) {
    const W = o.w || 330, H = o.h || 150, padR = 34, padB = 22, top = 10;
    const plotW = W - padR, plotH = H - padB - top;
    const n = o.data.length;
    const slot = plotW / n;
    const bw = Math.min(o.barW || 24, slot * 0.62);
    const yMax = o.yMax || Math.max(1, ...o.data.map((d) => d.segs.reduce((a, b) => a + b, 0)));
    const wrap = h('div.set-chart');
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, role: 'img' });
    (o.ticks || [0, yMax / 2, yMax]).forEach((t) => {
      const y = top + plotH - (t / yMax) * plotH;
      svg.appendChild(svgEl('line', { x1: 0, x2: plotW, y1: y, y2: y, class: 'set-ch-grid' }));
      const tx = svgEl('text', { x: plotW + 6, y: y + 4, class: 'set-ch-ylab' });
      tx.textContent = o.fmt ? o.fmt(t) : String(t);
      svg.appendChild(tx);
    });
    if (o.avg != null) {
      const y = top + plotH - (o.avg / yMax) * plotH;
      svg.appendChild(svgEl('line', { x1: 0, x2: plotW, y1: y, y2: y, class: 'set-ch-avg' }));
      const tx = svgEl('text', { x: plotW + 6, y: y + 4, class: 'set-ch-avgl' });
      tx.textContent = o.avgLabel || 'avg';
      svg.appendChild(tx);
    }
    const tip = h('div.set-ch-tip', { hidden: true });
    const bars = [];
    o.data.forEach((d, i) => {
      const cx = slot * i + slot / 2;
      const x = cx - bw / 2;
      let acc = 0;
      const g = svgEl('g', { class: 'set-ch-bar' });
      const total = d.segs.reduce((a, b) => a + b, 0);
      d.segs.forEach((v, k) => {
        if (v <= 0) return;
        const y0 = top + plotH - ((acc + v) / yMax) * plotH;
        const hh = (v / yMax) * plotH - (acc > 0 ? 2 : 0);
        const isTop = acc + v >= total - 1e-9;
        const path = isTop ? roundTop(x, y0, bw, Math.max(0, hh), 4) : `M${x},${y0}h${bw}v${Math.max(0, hh)}h${-bw}Z`;
        if (path) g.appendChild(svgEl('path', { d: path, fill: o.colors[k] || 'var(--blue)' }));
        acc += v;
      });
      svg.appendChild(g);
      const lab = svgEl('text', { x: cx, y: H - 6, class: 'set-ch-xlab', 'text-anchor': 'middle' });
      lab.textContent = d.label || '';
      svg.appendChild(lab);
      const hit = svgEl('rect', { x: slot * i, y: 0, width: slot, height: H, fill: 'transparent', class: 'set-ch-hit', tabindex: 0 });
      const show = () => {
        bars.forEach((b) => b.classList.remove('on'));
        g.classList.add('on');
        svg.classList.add('picking');
        tip.hidden = false;
        tip.innerHTML = '';
        const tv = d.tip || (o.fmt ? o.fmt(total) : String(total));
        tip.append(h('b', tv), h('span', d.full || d.label || ''));
        const pct = (cx / W) * 100;
        tip.style.left = U.clamp(pct, 14, 86) + '%';
        o.onPick && o.onPick(i);
      };
      hit.addEventListener('pointerenter', show);
      hit.addEventListener('pointerdown', show);
      hit.addEventListener('focus', show);
      svg.appendChild(hit);
      bars.push(g);
    });
    svg.addEventListener('pointerleave', () => { bars.forEach((b) => b.classList.remove('on')); svg.classList.remove('picking'); tip.hidden = true; });
    wrap.append(tip, svg);
    wrap.__tap = true;
    return wrap;
  };
  /** line/area chart with drag-to-scrub. pts:[{t, v, label, charging}] */
  SK.lineChart = function (o) {
    const W = o.w || 330, H = o.h || 140, padR = 34, padB = 22, top = 10;
    const plotW = W - padR, plotH = H - padB - top;
    const n = o.pts.length;
    const X = (i) => (i / (n - 1)) * plotW;
    const Y = (v) => top + plotH - (v / (o.yMax || 100)) * plotH;
    const wrap = h('div.set-chart');
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, role: 'img' });
    (o.ticks || [0, 50, 100]).forEach((t) => {
      svg.appendChild(svgEl('line', { x1: 0, x2: plotW, y1: Y(t), y2: Y(t), class: 'set-ch-grid' }));
      const tx = svgEl('text', { x: plotW + 6, y: Y(t) + 4, class: 'set-ch-ylab' });
      tx.textContent = o.fmt ? o.fmt(t) : t;
      svg.appendChild(tx);
    });
    (o.xTicks || []).forEach((xt) => {
      const tx = svgEl('text', { x: X(xt.i), y: H - 6, class: 'set-ch-xlab', 'text-anchor': xt.i === 0 ? 'start' : 'middle' });
      tx.textContent = xt.label;
      svg.appendChild(tx);
    });
    // columns (iOS draws battery level as thin columns)
    o.pts.forEach((p, i) => {
      const x = X(i) - 1.6;
      const y = Y(p.v);
      svg.appendChild(svgEl('path', { d: roundTop(x, y, 3.2, top + plotH - y, 1.5), fill: p.charging ? 'var(--green)' : p.v <= 20 ? 'var(--red)' : o.color || 'var(--green)', 'fill-opacity': p.charging ? 1 : 0.85 }));
    });
    const cross = svgEl('line', { x1: 0, x2: 0, y1: top, y2: top + plotH, class: 'set-ch-cross', visibility: 'hidden' });
    svg.appendChild(cross);
    const tip = h('div.set-ch-tip', { hidden: true });
    const pick = (clientX) => {
      const r = svg.getBoundingClientRect();
      const fx = U.clamp((clientX - r.left) / r.width, 0, 1) * W;
      const i = U.clamp(Math.round((fx / plotW) * (n - 1)), 0, n - 1);
      const p = o.pts[i];
      cross.setAttribute('x1', X(i)); cross.setAttribute('x2', X(i)); cross.setAttribute('visibility', 'visible');
      tip.hidden = false; tip.innerHTML = '';
      tip.append(h('b', (o.fmt ? o.fmt(p.v) : p.v) + (p.charging ? ' · Charging' : '')), h('span', p.label || ''));
      tip.style.left = U.clamp((X(i) / W) * 100, 14, 86) + '%';
    };
    svg.addEventListener('pointerdown', (e) => { e.stopPropagation(); pick(e.clientX); svg.setPointerCapture && svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'mouse') pick(e.clientX); });
    svg.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); tip.hidden = true; });
    svg.style.touchAction = 'pan-y';
    wrap.append(tip, svg);
    wrap.__tap = true;
    return wrap;
  };

  // ═══ Wi-Fi ═════════════════════════════════════════════════════
  const NETS = [
    { name: 'LiyueHarbor-Free', lock: false, sig: 3, kind: 'open' },
    { name: 'Northland-Liyue-Staff', lock: true, sig: 2, kind: 'enterprise' },
    { name: 'Alcor-Crew', lock: true, sig: 2, kind: 'crux', hotspot: true },
    { name: 'Wanmin Guest', lock: true, sig: 1, kind: 'hotel' },
    { name: 'Pier7-Bait&Tackle', lock: true, sig: 1, kind: 'shop' },
  ];
  const KNOWN0 = ['PierView-2207', 'NB-Liyue-Guest', 'Wangsheng (guest)', 'Heyu Tea House', 'Morepesok Home 🐟'];
  const known = (K) => K.pref('wifi.known', KNOWN0);
  function sigIcon(sig) {
    const s = document.createElement('span');
    s.className = 'set-wsig';
    s.innerHTML = `<svg viewBox="0 0 24 18" width="18" height="14"><path d="M12 15.5 9.6 13.1a3.4 3.4 0 0 1 4.8 0z" fill="currentColor" opacity="1"/><path d="M7.4 10.9a6.5 6.5 0 0 1 9.2 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity="${sig >= 2 ? 1 : 0.25}"/><path d="M4.6 8.1a10.4 10.4 0 0 1 14.8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" opacity="${sig >= 3 ? 1 : 0.25}"/></svg>`;
    return s;
  }
  function netRight(K, net, connected) {
    return h('div.set-netr', net.lock ? JC.icon('lock.fill', { size: 13 }) : null, net.hotspot ? JC.icon('link', { size: 14 }) : sigIcon(net.sig || 2),
      h('div.set-info', { onTap: (e) => { e.stopPropagation(); K.go('wifinet', net.name); } }, JC.icon('info.circle', { size: 22 })));
  }
  function connect(K, name, quiet) {
    if (!K.core('wifi')) K.setToggle('wifi', true);
    K.setCore('wifiNet', name);
    const kn = known(K).slice();
    if (!kn.includes(name)) { kn.unshift(name); K.setPref('wifi.known', kn); }
    JC.bus.emit('network', JC.os.online());
    JC.os.updateStatus();
    K.act('wifiNet', name);
    if (!quiet) JC.audio.play('tink');
    K.render();
  }
  function joining(K, name, then) {
    const t = K.top();
    if (t) { t._joining = name; t.render(); }
    setTimeout(() => { const t2 = K.top(); if (t2) t2._joining = null; then(); }, 1100);
  }
  let fails = {};
  function join(K, net) {
    if (net.kind === 'open') {
      joining(K, net.name, () => {
        const sh = JC.ui.sheet({
          title: 'Log In', detent: 'large', left: { text: 'Cancel' },
          content: () => [h('div.set-portal',
            h('div.set-portal-logo', JC.icon('wifi', { size: 34 })), h('div.set-portal-t', 'Welcome to LiyueHarbor-Free'),
            h('div.set-portal-s', 'Free waterfront Wi-Fi from the Liyue Harbor Authority, by contract with the Qixing.'),
            h('div.set-portal-terms', 'By connecting you agree to: (1) receive up to three SMS messages about Wanmin Restaurant offers, (2) not stream more than 2 hours of opera per day, (3) not fish from Pier 9.'),
            h('div.set-portal-btn', { onTap: () => { sh.close(); connect(K, net.name); K.toast('Connected to LiyueHarbor-Free', 'wifi'); } }, 'Accept & Connect'),
            h('div.set-portal-small', 'Session expires in 2 hours.'))],
        });
      });
      return;
    }
    if (net.kind === 'enterprise') {
      JC.ui.alert({ title: 'Enter the username and password for “Northland-Liyue-Staff”', message: 'Northland Bank Group · Liyue Branch staff only.', input: { placeholder: 'Username', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Next', style: 'default' }] }).then((r) => {
        if (r.index !== 1) return;
        const user = (r.value || '').trim();
        setTimeout(() => JC.ui.alert({ title: 'Password', input: { placeholder: 'Password', type: 'password', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Join', style: 'default' }] }).then((r2) => {
          if (r2.index !== 1) return;
          const ok = /^nb-liyue$/i.test(user) && String(r2.value || '').replace(/[’‘]/g, '\'') === 'Tsaritsa\'sOwn11';
          joining(K, net.name, () => {
            if (ok) { connect(K, net.name); K.toast('Connected to ' + net.name, 'wifi'); try { JC.story.act('login', { site: 'wifi', user }); } catch (e) { /* ignore */ } return; }
            K.alert({ title: 'Unable to join the network “Northland-Liyue-Staff”', message: 'Authentication failed. The Office of the Ninth has been notified of this attempt.' });
          });
        }), 300);
      });
      return;
    }
    JC.ui.alert({
      title: 'Enter the password for “' + net.name + '”',
      message: net.kind === 'home' ? '' : null,
      input: { placeholder: 'Password', type: 'password', cap: 'none' },
      buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Join', style: 'default' }],
    }).then((r) => {
      if (r.index !== 1) return;
      const pw = (r.value || '').trim();
      fails[net.name] = fails[net.name] || 0;
      joining(K, net.name, () => {
        if (net.kind === 'home') {
          if (pw.length >= 8) { connect(K, net.name); K.toast('Connected to ' + net.name, 'wifi'); return; }
          fails[net.name]++;
          K.alert({ title: 'Incorrect password for “' + net.name + '”', message: pw.length ? 'Wi-Fi passwords are at least 8 characters. It’s your own network — you know this one.' : 'Enter a password.' });
          return;
        }
        if (net.kind === 'crux') {
          if (/^(beidou|alcor|crux|rematch|thecrux|captain)\d*$/i.test(pw.replace(/\s/g, ''))) {
            connect(K, net.name);
            setTimeout(() => K.alert({ title: 'Connected', message: '“Alcor-Crew”\nData provided by the Crux Fleet, courtesy of the Captain.\n\nThe network name changes to “REMATCH SATURDAY” for a second, then back.' }), 400);
            return;
          }
          fails[net.name]++;
          K.alert({ title: 'Incorrect password for “' + net.name + '”', message: fails[net.name] >= 2 ? 'It’s the Crux. The password is probably the ship. Or the captain.' : '' });
          return;
        }
        if (net.kind === 'hotel') {
          if (/^guoba\d*$/i.test(pw.replace(/\s/g, ''))) { connect(K, net.name); K.toast('Connected to ' + net.name, 'wifi'); return; }
          fails[net.name]++;
          K.alert({ title: 'Unable to join the network “Wanmin Guest”', message: fails[net.name] >= 2 ? 'The password is written on every Wanmin receipt: the name of Xiangling’s best friend. (He’s a bear. Sort of.)' : 'Incorrect password.' });
          return;
        }
        if (net.kind === 'shop') {
          fails[net.name]++;
          K.alert({ title: 'Unable to join the network “Pier7-Bait&Tackle”', message: fails[net.name] >= 2 ? 'The bait shop is closed. The password is chalked on the board inside. You can’t see it from here.' : 'Incorrect password.' });
        }
      });
    });
  }
  P.wifi = {
    title: 'Wi-Fi', path: '', icon: ['wifi', 'var(--blue)'], idx: ['Wireless', 'Network', 'Ask to Join Networks', 'Auto-Join Hotspot', 'LiyueHarbor-Free', 'Northland-Liyue-Staff'],
    right: (K) => [JC.ui.navBtn({ text: 'Edit', onTap: () => K.go('knownnets') })],
    render(K, a, page) {
      const s = S();
      const on = !!s.wifi;
      const cur = on ? s.wifiNet : null;
      const curNet = cur ? (NETS.find((n) => n.name === cur) || { name: cur, lock: true, sig: 3 }) : null;
      const out = [
        h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--blue)' } }, JC.icon('wifi', { size: 30 })), h('div.set-hero-t', 'Wi-Fi'), h('div.set-hero-s', 'Connect to Wi-Fi, view available networks, and manage settings for joining networks and nearby hotspots.')),
        { rows: [
          { t: 'Wi-Fi', core: 'wifi', set: (v) => JC.os.setToggle('wifi', v) },
          curNet ? { t: curNet.name, s: s.airplane ? 'Airplane Mode' : 'Connected', leading: h('div.set-wcheck', JC.icon('checkmark', { size: 17, weight: 2.6 })), right: netRight(K, curNet, true), tap: () => K.go('wifinet', curNet.name) } : null,
        ].filter(Boolean), f: !on ? 'AirDrop, AirPlay, Notify When Left Behind and improved location accuracy require Wi-Fi.' : (s.airplane ? 'Wi-Fi stays on in Airplane Mode.' : null) },
      ];
      if (on) {
        const joiningName = page && page._joining;
        const others = NETS.filter((n) => n.name !== cur);
        const kn = known(K);
        const mine = others.filter((n) => kn.includes(n.name));
        const rest = others.filter((n) => !kn.includes(n.name));
        const netRow = (n) => ({ leading: h('div.set-wcheck'), t: n.name, s: joiningName === n.name ? 'Joining…' : n.hotspot ? 'Personal Hotspot' : null, right: joiningName === n.name ? h('div.set-spin') : netRight(K, n), tap: () => (kn.includes(n.name) ? (joining(K, n.name, () => connect(K, n.name))) : join(K, n)) });
        if (mine.length) out.push({ h: 'My Networks', rows: mine.map(netRow) });
        out.push({ h: h('span.set-hh', 'Other Networks', h('span.set-spin.sm')), rows: rest.map(netRow).concat([{ t: 'Other…', tap: () => JC.ui.alert({ title: 'Enter network information', input: { placeholder: 'Name', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Join', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value) joining(K, r.value, () => K.alert({ title: 'Unable to join the network “' + r.value + '”', message: 'No network with that name is in range.' })); }) }]) });
      }
      out.push({ rows: [
        { t: 'Ask to Join Networks', pick: { pref: 'wifi.ask', def: 'notify', options: [['off', 'Off'], ['notify', 'Notify'], ['ask', 'Ask']], footer: 'Known networks will be joined automatically. If no known networks are available, you will be notified of available networks.' } },
        { t: 'Auto-Join Hotspot', pick: { pref: 'wifi.hotspot', def: 'ask', options: [['never', 'Never'], ['ask', 'Ask to Join'], ['auto', 'Automatic']], footer: 'Allow this device to automatically discover nearby personal hotspots when no Wi-Fi network is available.' } },
      ], f: 'Known networks will be joined automatically. If no known networks are available, you will be notified of available networks.' });
      return out;
    },
  };
  P.wifinet = {
    title: (name) => name, path: 'Wi-Fi', noSearch: true,
    render(K, name) {
      const s = S();
      const isCur = s.wifi && s.wifiNet === name;
      const kn = known(K).includes(name);
      const net = NETS.find((n) => n.name === name) || { name, lock: true, sig: 2 };
      const home = net.kind === 'home';
      const ip = home ? '192.168.3.27' : net.kind === 'open' ? '10.88.14.203' : net.kind === 'crux' ? '172.20.10.3' : '192.168.0.104';
      return [
        { rows: [
          !isCur ? { t: 'Join This Network', tint: true, tap: () => (kn ? connect(K, name) : join(K, net)) } : null,
          kn || isCur ? { t: 'Forget This Network', tint: true, tap: () => JC.ui.alert({ title: 'Forget Wi-Fi Network “' + name + '”?', message: 'Your iPhone and other devices using iCloud Keychain will no longer join this Wi-Fi network.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Forget', style: 'destructive', onTap: () => {
            K.setPref('wifi.known', known(K).filter((x) => x !== name));
            if (S().wifiNet === name) { K.setCore('wifiNet', null); JC.bus.emit('network', JC.os.online()); JC.os.updateStatus(); K.act('wifiNet', null); }
            K.back();
          } }] }) } : null,
        ].filter(Boolean) },
        { rows: [
          { t: 'Auto-Join', pref: 'wifi.aj.' + name, def: true },
          kn || isCur ? { t: 'Password', d: '••••••••', tap: () => JC.os.unlockThen(() => K.alert({ title: name, message: home ? 'The password you entered is saved in iCloud Keychain.' : 'Password hidden. Face ID is required to show it — and Face ID doesn’t recognize you.' })) } : null,
        ].filter(Boolean) },
        { rows: [
          { t: 'Low Data Mode', pref: 'wifi.ldm.' + name, def: false },
        ], f: 'Low Data Mode helps reduce iPhone data usage over your cellular network or specific Wi-Fi networks you select.' },
        { rows: [
          { t: 'Private Wi-Fi Address', pick: { pref: 'wifi.mac.' + name, def: 'rotating', options: [['off', 'Off'], ['fixed', 'Fixed'], ['rotating', 'Rotating']] } },
          { t: 'Wi-Fi Address', d: '6A:1D:0B:' + (name.length * 7 % 99).toString().padStart(2, '0') + ':5E:92', copy: true },
          { t: 'Limit IP Address Tracking', pref: 'wifi.lip.' + name, def: true },
        ], f: 'Using a private address helps reduce tracking of your iPhone across different Wi-Fi networks.' },
        isCur ? { h: 'IPv4 Address', rows: [
          { t: 'Configure IP', d: 'Automatic', alert: { title: 'Configure IP', message: 'Manual IP configuration is disabled by your device management profile.' } },
          { t: 'IP Address', d: ip, copy: true },
          { t: 'Subnet Mask', d: '255.255.255.0', copy: true },
          { t: 'Router', d: ip.replace(/\.\d+$/, '.1'), copy: true },
        ] } : null,
        isCur ? { h: 'DNS', rows: [{ t: 'Configure DNS', d: 'Automatic', alert: { title: 'Configure DNS', message: 'DNS is set automatically by the network.' } }] } : null,
        { h: 'HTTP Proxy', rows: [{ t: 'Configure Proxy', d: 'Off', alert: { title: 'Configure Proxy', message: 'No proxy is configured for this network.' } }] },
      ];
    },
  };
  P.knownnets = {
    title: 'Known Networks', path: 'Wi-Fi', icon: ['wifi', 'var(--blue)'],
    render(K) {
      const kn = known(K);
      return [{ f: 'Swipe left on a network to forget it. Your iPhone joins known networks automatically.', rows: kn.map((n) => ({ t: n, right: h('div.set-netr', JC.icon('lock.fill', { size: 13 }), sigIcon(1)), tap: () => K.go('wifinet', n), swipe: [{ text: 'Forget', color: 'var(--red)', icon: 'trash', onTap: () => { K.setPref('wifi.known', known(K).filter((x) => x !== n)); if (S().wifiNet === n) { K.setCore('wifiNet', null); JC.os.updateStatus(); } K.render(); } }] })) }];
    },
  };

  // ═══ Bluetooth ═════════════════════════════════════════════════
  const BT = [
    { id: 'airpods', name: 'Childe’s AirPods Pro', icon: 'airpods', kind: 'airpods' },
    { id: 'watch', name: 'Childe’s Apple Watch', icon: 'clock', kind: 'watch' },
    { id: 'sirfang', name: 'Sir Fang (Teucer’s AirTag)', icon: 'tag.fill', kind: 'airtag' },
    { id: 'speaker', name: 'Liyue Branch Lobby Speaker', icon: 'hifispeaker.fill', kind: 'speaker' },
  ];
  P.bluetooth = {
    title: 'Bluetooth', icon: ['bluetooth', 'var(--blue)'], idx: ['AirPods', 'Pair', 'Apple Watch', 'Devices'],
    render(K, a, page) {
      const s = S();
      const gone = K.pref('bt.forgot', []);
      const out = [
        h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--blue)' } }, JC.icon('bluetooth', { size: 30 })), h('div.set-hero-t', 'Bluetooth'), h('div.set-hero-s', 'Connect to accessories you can use for activities such as streaming music, typing, and gaming.')),
        { rows: [{ t: 'Bluetooth', core: 'bt', set: (v) => JC.os.setToggle('bt', v) }], f: s.bt ? 'This iPhone is discoverable as “Childe’s iPhone” while Bluetooth Settings is open.' : 'AirDrop, AirPlay, Find My, and Location Services use Bluetooth.' },
      ];
      if (s.bt) {
        out.push({ h: 'My Devices', rows: BT.filter((d) => !gone.includes(d.id)).map((d) => ({
          t: d.name, d: page && page._btTry === d.id ? '' : 'Not Connected', right: page && page._btTry === d.id ? h('div.set-spin') : h('div.set-info', { onTap: (e) => { e.stopPropagation(); K.go('btdevice', d.id); } }, JC.icon('info.circle', { size: 22 })),
          tap: () => {
            const t = K.top(); t._btTry = d.id; t.render();
            setTimeout(() => {
              t._btTry = null; t.render();
              const msg = {
                airpods: 'Childe’s AirPods Pro aren’t in range. Find My last saw them on Lantern Street, near Wangsheng Funeral Parlor.',
                watch: 'Childe’s Apple Watch is not nearby. It last reported at 23:25 on Friday, at Pier 7. It is probably still on Childe’s wrist.',
                airtag: 'AirTags don’t connect over Bluetooth Settings. Use Find My to locate Sir Fang (he is in Teucer’s backpack).',
                speaker: 'The Liyue Branch lobby speaker is at Northland Bank, 1 Harbor Road. Ekaterina controls the playlist.',
              }[d.kind];
              JC.ui.alert({ title: 'Connection Unsuccessful', message: msg, buttons: d.kind === 'airtag' ? [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Find My', style: 'default', onTap: () => JC.os.open('findmy', { tab: 'items' }) }] : [{ text: 'OK' }] });
            }, 1300);
          },
        })) });
        out.push({ h: h('span.set-hh', 'Other Devices', h('span.set-spin.sm')), rows: [
          { t: 'BAIT-SHOP-RADIO', s: 'Speaker', tap: () => { K.toast('Pairing request sent…', 'bluetooth'); setTimeout(() => K.alert({ title: 'Pairing Unsuccessful', message: '“BAIT-SHOP-RADIO” declined the request. (The bait shop is closed. The radio is still playing the tide report.)' }), 1400); } },
          { t: 'NB-AGENT-07', s: 'Earpiece', tap: () => K.alert({ title: 'Pairing Unsuccessful', message: '“NB-AGENT-07” is not accepting connections. It is close. Very close. Someone is on the promenade.' }) },
        ], f: 'To pair an Apple Watch with your iPhone, go to the Apple Watch app.' });
      }
      return out;
    },
  };
  P.btdevice = {
    title: (id) => (BT.find((d) => d.id === id) || {}).name, path: 'Bluetooth', noSearch: true,
    render(K, id) {
      const d = BT.find((x) => x.id === id);
      const rows = [];
      if (d.kind === 'airpods') {
        rows.push({ rows: [{ t: 'Name', d: d.name, alert: { title: 'Rename AirPods', message: 'Connect the AirPods to rename them.' } }] });
        rows.push({ h: 'Noise Control', rows: [['nc', 'Noise Cancellation'], ['tr', 'Transparency'], ['ad', 'Adaptive'], ['off', 'Off']].map(([k, l]) => ({ t: l, check: () => K.pref('ap.nc', 'ad') === k, tap: () => { K.setPref('ap.nc', k); K.render(); K.toast('Will apply when AirPods connect', 'airpods'); } })) });
        rows.push({ rows: [{ t: 'Ear Tip Fit Test', tap: () => K.alert({ title: 'Ear Tip Fit Test', message: 'Put both AirPods in your ears to start. (They’re in Childe’s pocket, somewhere on Lantern Street.)' }), chev: true }, { t: 'Find My network', pref: 'ap.findmy', def: true }] });
      } else {
        rows.push({ rows: [{ t: 'Type', d: { watch: 'Apple Watch', airtag: 'AirTag', speaker: 'Speaker' }[d.kind] }, d.kind === 'airtag' ? { t: 'Open in Find My', tint: true, tap: () => JC.os.open('findmy', { id: 'sirfang' }) } : null].filter(Boolean) });
      }
      rows.push({ rows: [{ t: 'Forget This Device', tint: true, tap: () => JC.ui.alert({ title: 'Forget “' + d.name + '”?', message: d.kind === 'watch' ? 'Unpair your Apple Watch in the Watch app.' : 'This device will be removed from your iPhone.', buttons: d.kind === 'watch' ? [{ text: 'OK' }] : [{ text: 'Cancel', style: 'cancel' }, { text: 'Forget Device', style: 'destructive', onTap: () => { K.setPref('bt.forgot', K.pref('bt.forgot', []).concat(d.id)); K.back(); } }] }) }] });
      return rows;
    },
  };

  // ═══ Cellular / Hotspot / VPN ══════════════════════════════════
  const CELL = [['wavelet', 12.6], ['music', 6.1], ['photos', 4.8], ['messages', 3.9], ['maps', 2.2], ['safari', 1.7], ['mail', 0.82], ['swift', 0.64], ['lotuseats', 0.41], ['reelrush', 0.38], ['facetime', 0.31], ['weather', 0.12], ['stocks', 0.041], ['health', 0.008]];
  P.cellular = {
    title: 'Cellular', icon: ['antenna.radiowaves.left.and.right', 'var(--green)'], idx: ['Mobile Data', 'Cellular Data', 'Roaming', 'SIM', 'eSIM', 'Data Usage'],
    render(K) {
      const s = S();
      const reset = K.pref('cell.reset', null);
      const k = reset ? 0.004 : 1;
      return [
        { rows: [
          { t: 'Cellular Data', core: 'cellular', set: (v) => JC.os.setToggle('cellular', v) },
          { t: 'Cellular Data Options', d: 'Roaming Off', go: 'celloptions' },
          { t: 'Personal Hotspot', d: s.hotspot ? 'On' : 'Off', go: 'hotspot' },
        ], f: s.airplane ? 'Cellular is off while Airplane Mode is on.' : 'Turn off cellular data to restrict all data to Wi-Fi, including email, web browsing, and push notifications.' },
        { h: 'SIMs', rows: [
          { t: 'Primary', s: 'YM Mobile · +86 555 0716 0515', d: 'On', go: 'sim' },
          { t: 'Add eSIM', tint: true, tap: () => K.alert({ title: 'Add eSIM', message: 'Transferring a cellular plan requires the owner’s Apple Account and a QR code from YM Mobile.' }) },
        ] },
        { h: 'Cellular Data', rows: [
          { t: 'Current Period', d: (38.2 * k).toFixed(reset ? 2 : 1) + ' GB' },
          { t: 'Current Period Roaming', d: 'Zero KB' },
        ].concat(CELL.map(([id, gb]) => ({ t: K.appName(id), s: K.gb(gb * k), icon: 'app:' + id, pref: 'cell.' + id, def: true }))).concat([
          { t: 'System Services', d: K.gb(1.8 * k), alert: { title: 'System Services', message: 'iCloud, Find My, Push Notifications, Software Updates and Time Zone use cellular data.' } },
          { t: 'Personal Hotspot', d: s.hotspot ? K.gb(0.02) : 'Zero KB' },
        ]), f: 'Last Reset: ' + (reset ? U.fmtDate(reset, 'medium') + ' at ' + U.fmtTime(reset) : 'Sep 16, 2026 at 00:00') },
        { rows: [{ t: 'Reset Statistics', tint: true, tap: () => JC.ui.alert({ title: 'Reset Statistics?', message: 'Cellular data usage statistics will be reset.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset Statistics', style: 'destructive', onTap: () => { K.setPref('cell.reset', JC.time.now()); K.render(); } }] }) }] },
      ];
    },
  };
  P.celloptions = {
    title: 'Cellular Data Options', path: 'Cellular', idx: ['Data Roaming', 'Low Data Mode', 'Voice & Data', '5G'],
    render: (K) => [
      { rows: [{ t: 'Data Roaming', pref: 'cell.roam', def: false }], f: 'Turn off Data Roaming to prevent substantial roaming charges when travelling outside YM Mobile’s network.' },
      { rows: [
        { t: 'Voice & Data', pick: { pref: 'cell.vd', def: '5ga', options: [['5gon', '5G On'], ['5ga', '5G Auto'], ['lte', 'LTE']], footer: '5G Auto: use 5G only when it will not significantly reduce battery life.' } },
        { t: 'Data Mode', pick: { pref: 'cell.mode', def: 'std', options: [['more', 'Allow More Data on 5G'], ['std', 'Standard'], ['low', 'Low Data Mode']] } },
      ] },
    ],
  };
  P.sim = {
    title: 'Primary', path: 'Cellular', noSearch: true,
    render: (K) => [
      { rows: [{ t: 'Turn On This Line', locked: true, lockMsg: 'This is the only line on this iPhone.' }] },
      { rows: [{ t: 'Network Selection', d: 'YM Mobile', alert: { title: 'Network Selection', message: 'Automatic network selection is on.' } }, { t: 'Wi-Fi Calling', pref: 'sim.wfc', def: true }, { t: 'Calls on Other Devices', pref: 'sim.cood', def: true }] },
      { rows: [{ t: 'My Number', d: '+86 555 0716 0515', copy: true }, { t: 'SIM PIN', alert: { title: 'SIM PIN', message: 'SIM PIN is off. Turning it on requires the PIN printed on the SIM card holder.' }, chev: true }] },
      { rows: [{ t: 'Carrier Services', tint: true, tap: () => K.alert({ title: 'YM Mobile', message: 'Balance enquiry: dial *1515#\nCustomer service: 10086' }) }] },
    ],
  };
  P.hotspot = {
    title: 'Personal Hotspot', icon: ['personalhotspot', 'var(--green)'], idx: ['Tethering', 'Allow Others to Join', 'Wi-Fi Password'],
    render(K) {
      const on = !!S().hotspot;
      return [
        h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--green)' } }, JC.icon('personalhotspot', { size: 30 })), h('div.set-hero-t', 'Personal Hotspot'), h('div.set-hero-s', 'Personal Hotspot on your iPhone can provide internet access to other devices signed in to your iCloud account without requiring you to enter the password.')),
        { rows: [
          { t: 'Allow Others to Join', core: 'hotspot', set: (v) => { JC.state.setting('hotspot', v); JC.os.updateStatus(); } },
          { t: 'Wi-Fi Password', d: K.pref('hs.pass', 'bluefin0720'), tap: () => JC.ui.alert({ title: 'Wi-Fi Password', message: 'Must be at least 8 characters.', input: { value: K.pref('hs.pass', 'bluefin0720'), cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Done', style: 'default' }] }).then((r) => { if (r.index !== 1) return; if ((r.value || '').length < 8) { K.alert({ title: 'Password Too Short', message: 'The password must be at least 8 characters.' }); return; } K.setPref('hs.pass', r.value); K.render(); }), chev: true },
        ], f: on ? 'Now Discoverable. Other users can look for your shared network using Wi-Fi and Bluetooth under the name “Childe’s iPhone”.' : 'Allow other users or devices not signed in to iCloud to look for your shared network “Childe’s iPhone” when you are in Personal Hotspot settings or when you turn it on in Control Center.' },
        { rows: [{ t: 'Family Sharing', d: 'On', go: 'hsfamily' }] },
        { rows: [{ t: 'Maximize Compatibility', pref: 'hs.compat', def: false }], f: 'Internet performance may be reduced for devices connected to your hotspot when turned on.' },
      ];
    },
  };
  P.hsfamily = {
    title: 'Family Sharing', path: 'Personal Hotspot', noSearch: true,
    render: (K) => [{ rows: [{ t: 'Family Sharing', pref: 'hs.fam', def: true }] }, { h: 'Family Members', rows: [{ t: 'Teucer', avatar: 'teucer', pick: { pref: 'hs.teucer', def: 'auto', options: [['ask', 'Ask for Approval'], ['auto', 'Automatic']] } }, { t: 'Anthon', avatar: 'anthon', pick: { pref: 'hs.anthon', def: 'ask', options: [['ask', 'Ask for Approval'], ['auto', 'Automatic']] } }], f: 'Teucer can join your hotspot automatically. Anthon has to ask. (He knows why.)' }],
  };
  P.vpn = {
    title: 'VPN & Device Management', path: 'General', icon: ['network', 'var(--blue)'], idx: ['VPN', 'Device Management', 'MDM', 'Profile', 'Supervised'],
    render(K, a, page) {
      return [
        { h: 'VPN', rows: [{ t: 'Northland Secure (Liyue)', s: page && page._vpn ? 'Connecting…' : 'Not Connected', right: page && page._vpn ? h('div.set-spin') : null, tap: () => { const t = K.top(); t._vpn = true; t.render(); setTimeout(() => { t._vpn = false; t.render(); K.alert({ title: 'VPN Connection', message: 'Authentication failed. Northland Secure requires the Director’s hardware token. It was on his keychain. His keychain is wherever he is.' }); }, 1600); } }] },
        { h: 'Mobile Device Management', rows: [{ t: 'Northland Bank Group', s: 'Supervised · Liyue Branch IT (Ekaterina)', icon: ['snowflake', '#0f2740'], go: 'mdm' }] },
      ];
    },
  };
  P.mdm = {
    title: 'Northland Bank Group', path: 'VPN & Device Management', noSearch: true,
    render: (K) => [
      h('div.set-hero', h('div.set-hero-ic', { style: { background: '#0f2740' } }, JC.icon('snowflake', { size: 30 })), h('div.set-hero-t', 'Northland Bank Group'), h('div.set-hero-s', 'This iPhone is supervised and managed by Northland Bank Group. The administrator can collect personal data, add and remove accounts and restrictions, manage apps, track this iPhone’s location, and remotely erase it.')),
      { h: 'Restrictions', rows: [{ t: 'Erase iPhone', d: 'Not Allowed' }, { t: 'Delete Apps', d: 'Not Allowed' }, { t: 'Change Device Name', d: 'Not Allowed' }, { t: 'Passcode', d: 'Required (6 digits)' }, { t: 'Lost Mode', d: 'Enabled' }] },
      { h: 'Administrator', rows: [{ t: 'Contact', d: 'Ekaterina (Liyue Branch)', tap: () => JC.os.open('contacts', { contact: 'ekat' }), chev: true }, { t: 'Signed by', d: 'mdm.northland.sn' }, { t: 'Location Reporting', d: 'On · Office of the Eighth' }] },
      { rows: [{ t: 'Remove Management', danger: true, center: true, tap: () => K.alert({ title: 'Can’t Remove Management', message: 'This iPhone is supervised. Only the organization can remove device management. (And the organization is exactly who he threw the phone away from.)' }) }] },
    ],
  };

  // ═══ Battery ═══════════════════════════════════════════════════
  function batterySeries() {
    const now = JC.time.now();
    const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
    const keys = [[0, 71], [1.5, 64], [1.55, 64, 1], [3.2, 100, 1], [5.3, 100], [7.5, 88], [9, 82], [12, 66], [14.1, 58], [14.15, 58, 1], [14.8, 79, 1], [17, 66], [19, 52], [21, 41], [22.8, 32]];
    const pts = [];
    const end = (now - d0.getTime()) / 3600e3;
    for (let t = 0; t <= end + 1e-6; t += 0.25) {
      let v = 0, ch = false;
      if (t >= 22.8) v = 32 + (JC.os.battery() - 32) * ((t - 22.8) / Math.max(0.1, end - 22.8));
      else {
        for (let i = 0; i < keys.length - 1; i++) {
          const [t0, v0, c0] = keys[i], [t1, v1, c1] = keys[i + 1];
          if (t >= t0 && t <= t1) { v = v0 + (v1 - v0) * ((t - t0) / (t1 - t0)); ch = !!(c0 && c1); break; }
        }
      }
      const at = d0.getTime() + t * 3600e3;
      pts.push({ v: Math.round(U.clamp(v, 1, 100)), charging: ch, label: U.fmtTime(at) });
    }
    return pts;
  }
  const USAGE = [['messages', 31, 142], ['phone', 18, 63], ['mail', 9, 48], ['wavelet', 8, 39], ['__home', 7, 31], ['camera', 6, 12], ['maps', 5, 9], ['reelrush', 4, 19], ['music', 3, 4], ['safari', 3, 14], ['health', 2, 3], ['__bg', 4, 0]];
  P.battery = {
    title: 'Battery', icon: ['battery.100', 'var(--green)'], idx: ['Low Power Mode', 'Battery Health', 'Battery Usage', 'Charging'],
    render(K, a, page) {
      const b = JC.os.battery();
      const lpm = !!S().lowPower;
      const showAct = !!(page && page._act);
      const pts = batterySeries();
      const step = Math.max(1, Math.floor(pts.length / 4));
      return [
        h('div.set-batt-head', h('div.set-batt-big', { class: { low: b <= 20 && !lpm, lpm } }, h('div.set-batt-body', h('div.set-batt-fill', { style: { width: b + '%' } })), h('div.set-batt-cap')), h('div', h('div.set-batt-pct', b + '%'), h('div.set-batt-s', JC.os.charging ? 'Charging' : 'Last charged to 100% at 3:12 AM'))),
        { rows: [{ t: 'Low Power Mode', core: 'lowPower', set: (v) => JC.os.setToggle('lowPower', v) }], f: 'Low Power Mode temporarily reduces background activity like downloads and mail fetch until you can fully charge your iPhone.' },
        { rows: [{ t: 'Battery Health & Charging', d: '87%', go: 'batteryhealth' }] },
        { h: 'Last 24 Hours', rows: [{ custom: () => h('div.set-chartcard',
          h('div.set-chart-k', 'BATTERY LEVEL'),
          SK.lineChart({ pts, ticks: [0, 50, 100], fmt: (v) => v + '%', xTicks: [0, step, step * 2, step * 3].filter((i) => i < pts.length).map((i) => ({ i, label: pts[i].label.replace(/:00/, '').replace(/:\d\d/, '') })) }),
          h('div.set-chart-k', 'ACTIVITY'),
          SK.barChart({ data: Array.from({ length: 24 }, (v, i) => { const on = [4, 2, 1, 0, 0, 9, 31, 22, 14, 28, 33, 26, 19, 24, 12, 17, 22, 15, 8, 3, 5, 9, 26, 41][i]; const off = [6, 4, 2, 1, 1, 8, 12, 9, 10, 14, 11, 9, 10, 12, 7, 9, 11, 13, 22, 24, 21, 18, 12, 8][i]; return { label: i % 6 === 0 ? (U.fmtTime(new Date(2026, 9, 16, i)).replace(':00', '')) : '', full: (i < 10 ? '0' : '') + i + ':00', segs: [on, off], tip: on + 'm on · ' + off + 'm off' }; }), colors: ['var(--blue)', 'color-mix(in srgb, var(--blue) 35%, var(--cell))'], yMax: 60, ticks: [0, 30, 60], fmt: (v) => v + 'm', h: 120, barW: 7 }),
          h('div.set-legend', h('span', h('i', { style: { background: 'var(--blue)' } }), 'Screen On'), h('span', h('i', { style: { background: 'color-mix(in srgb, var(--blue) 35%, var(--cell))' } }), 'Screen Off')),
          h('div.set-batt-sum', h('div', h('b', '7h 21m'), h('span', 'Screen Active')), h('div', h('b', '4h 2m'), h('span', 'Screen Idle')))) }] },
        { h: h('span.set-hh', 'Battery Usage by App', h('span.set-hh-link.tap', { onTap: () => { const t = K.top(); t._act = !t._act; t.render(); } }, showAct ? 'Show Battery Usage' : 'Show Activity')), rows: USAGE.map(([id, pct, mins]) => ({
          t: id === '__home' ? 'Home & Lock Screen' : id === '__bg' ? 'Background Activity' : K.appName(id),
          icon: id.startsWith('__') ? ['iphone', 'var(--gray)'] : 'app:' + id,
          s: showAct ? (mins ? mins + ' min on screen' : 'Background') : null,
          d: showAct ? '' : pct + '%',
          tap: id.startsWith('__') ? undefined : () => JC.os.open(id),
        })), f: 'Shows proportion of battery used by each app in the last 24 hours. Tap an app to open it.' },
      ];
    },
  };
  P.batteryhealth = {
    title: 'Battery Health & Charging', path: 'Battery', icon: ['battery.100', 'var(--green)'], idx: ['Maximum Capacity', 'Peak Performance', 'Charging Optimization', 'Cycle Count'],
    render: (K) => [
      { rows: [{ t: 'Battery Health', d: 'Normal' }], f: 'iPhone batteries, like all rechargeable batteries, are consumable components that become less effective as they age.' },
      { rows: [{ t: 'Maximum Capacity', d: '87%' }], f: 'This is a measure of battery capacity relative to when it was new. Lower capacity may result in fewer hours of usage between charges.' },
      { rows: [{ t: 'Peak Performance Capability', s: 'Your battery is currently supporting normal peak performance.' }] },
      { h: 'Charging', rows: [{ t: 'Charging Optimization', pick: { pref: 'batt.opt', def: 'opt', options: [['opt', 'Optimized Battery Charging', 'Learns your routine. (He has none.)'], ['80', '80% Limit'], ['none', 'None']] } }] },
      { h: 'Battery Information', rows: [{ t: 'Cycle Count', d: '412' }, { t: 'Manufacture Date', d: 'August 2025' }, { t: 'First Use', d: 'September 2025' }] },
    ],
  };

  // ═══ General ═══════════════════════════════════════════════════
  P.general = {
    title: 'General', icon: ['gearshape.fill', 'var(--gray)'],
    render: (K) => [
      h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--gray)' } }, JC.icon('gearshape.fill', { size: 30 })), h('div.set-hero-t', 'General'), h('div.set-hero-s', 'Manage your overall setup and preferences for iPhone, such as software updates, device language, CarPlay, AirDrop, and more.')),
      { rows: [{ t: 'About', icon: ['iphone', 'var(--gray)'], go: 'about' }, { t: 'Software Update', icon: ['gearshape.fill', 'var(--gray)'], badge: K.pref('su.state', 'idle') === 'installed' ? 0 : 1, go: 'softwareupdate' }] },
      { rows: [{ t: 'AppleCare & Warranty', icon: ['checkmark.shield.fill', 'var(--red)'], go: 'applecare' }] },
      { rows: [{ t: 'AirDrop', icon: ['dot.radiowaves.left.and.right', 'var(--blue)'], go: 'airdrop' }, { t: 'AirPlay & Continuity', icon: ['rectangle.on.rectangle', 'var(--blue)'], go: 'airplay' }, { t: 'Picture in Picture', icon: ['rectangle.on.rectangle', 'var(--gray)'], go: 'pip' }, { t: 'CarPlay', icon: ['car.fill', 'var(--green)'], go: 'carplay' }] },
      { rows: [{ t: 'iPhone Storage', icon: ['externaldrive.fill', 'var(--gray)'], go: 'storage' }, { t: 'Background App Refresh', icon: ['arrow.triangle.2.circlepath', 'var(--gray)'], go: 'bgrefresh' }] },
      { rows: [{ t: 'Date & Time', icon: ['calendar.badge.clock', 'var(--blue)'], go: 'datetime' }, { t: 'Dictionary', icon: ['book.fill', 'var(--blue)'], go: 'dictionary' }, { t: 'Fonts', icon: ['textformat', 'var(--gray)'], go: 'fonts' }, { t: 'Keyboard', icon: ['keypad', 'var(--gray)'], go: 'keyboard' }, { t: 'Language & Region', icon: ['globe', 'var(--blue)'], go: 'language' }] },
      { rows: [{ t: 'TV Provider', icon: ['tv', 'var(--gray)'], go: 'tvprovider' }] },
      { rows: [{ t: 'VPN & Device Management', icon: ['network', 'var(--blue)'], go: 'vpn' }] },
      { rows: [{ t: 'Legal & Regulatory', icon: ['doc.text', 'var(--gray)'], go: 'legal' }] },
      { rows: [{ t: 'Transfer or Reset iPhone', icon: ['arrow.counterclockwise', 'var(--gray)'], go: 'reset' }, { t: 'Shut Down', tint: true, tap: () => shutDown(K) }] },
    ],
  };
  let modelTap = 0;
  P.about = {
    title: 'About', path: 'General', icon: ['iphone', 'var(--gray)'], idx: ['Serial Number', 'Model', 'iOS Version', 'Capacity', 'IMEI', 'Name'],
    render(K) {
      const photos = JC.store.hasSeed && JC.store.hasSeed('photos') ? JC.store.all('photos').length + 12000 : 12084;
      const songs = (JC.musicData && JC.musicData.songs.length) || 33;
      const ver = K.pref('su.state', 'idle') === 'installed' ? '26.1' : '26.0.1';
      return [
        { rows: [
          { t: 'Name', d: 'Childe’s iPhone', go: 'aboutname' },
          { t: 'iOS Version', d: ver, go: 'iosversion' },
          { t: 'Model Name', d: 'iPhone 17 Pro' },
          { t: 'Model Number', d: modelTap % 2 ? 'iPhone18,1' : 'MG8A4LY/A', tap: () => { modelTap++; K.render(); } },
          { t: 'Serial Number', d: 'NB11L0720AJX', copy: true },
        ] },
        { rows: [{ t: 'AppleCare+', d: 'Expires: 9/18/27', go: 'applecare' }] },
        { rows: [
          { t: 'Songs', d: String(songs), tap: () => JC.os.open('music', { tab: 'library' }) },
          { t: 'Videos', d: '214', tap: () => JC.os.open('photos') },
          { t: 'Photos', d: photos.toLocaleString('en-US'), tap: () => JC.os.open('photos') },
          { t: 'Applications', d: String(Object.keys(JC.os.appNames).length) },
          { t: 'Capacity', d: '512 GB' },
          { t: 'Available', d: '61.43 GB', go: 'storage' },
        ] },
        { rows: [
          { t: 'Wi-Fi Address', d: '6A:1D:0B:7E:5E:92', copy: true },
          { t: 'Bluetooth', d: '6A:1D:0B:7E:5E:93', copy: true },
          { t: 'Modem Firmware', d: '1.03.08' },
          { t: 'SEID', go: 'seid' },
          { t: 'EID', d: '8904 9032 1111 0720 0000 2004 0720 1016', copy: true },
          { t: 'Carrier Lock', d: 'No SIM restrictions' },
        ] },
        { h: 'Physical SIM', rows: [{ t: 'Network', d: 'Jade Mobile' }, { t: 'Carrier', d: 'Jade Mobile 63.0' }, { t: 'IMEI', d: '35 669412 110720 3', copy: true }, { t: 'ICCID', d: '8986 0012 1111 2004 0720', copy: true }] },
        { rows: [{ t: 'Certificate Trust Settings', go: 'certs' }] },
      ];
    },
  };
  P.aboutname = { title: 'Name', path: 'About', noSearch: true, render: (K) => [{ rows: [{ custom: () => h('div.set-field', h('input.set-input', { value: 'Childe’s iPhone', disabled: true })) }], f: 'This iPhone is supervised by Northland Bank Group. The device name can’t be changed.' }] };
  P.iosversion = { title: 'iOS Version', path: 'About', noSearch: true, render: (K) => [h('div.set-doc', h('h3', 'iOS ' + (K.pref('su.state', 'idle') === 'installed' ? '26.1' : '26.0.1')), h('p', 'This update provides important bug fixes and security updates for your iPhone, including a fix for an issue where Liquid Glass buttons could appear too transparent over bright wallpapers.'), h('p', 'For information on the security content of Apple software updates, please visit the Apple Security Releases website.'))] };
  P.seid = { title: 'SEID', path: 'About', noSearch: true, render: () => [{ rows: [{ t: '04 1D 7E 9A 11 07 20 04 10 16 20 26 11 11 0F A1 C3', copy: true }], f: 'Secure Element Identifier. Used by Apple Pay.' }] };
  P.certs = { title: 'Certificate Trust Settings', path: 'About', noSearch: true, render: () => [{ rows: [{ t: 'Trust Store Version', d: '2026091500' }, { t: 'Trust Asset Version', d: '1084' }] }, { h: 'Enable Full Trust for Root Certificates', rows: [{ t: 'Northland Bank Group Root CA', pref: 'cert.nb', def: true }], f: 'Learn more about trusted certificates' }] };

  // software update (download progress continues while you browse)
  const SU = { prog: 0, timer: null };
  function suTick(K) {
    SU.prog = Math.min(1, SU.prog + 0.012 + Math.random() * 0.012);
    if (SU.prog >= 1) { clearInterval(SU.timer); SU.timer = null; K.setPref('su.state', 'ready'); JC.notify && JC.notify.push({ app: 'settings', title: 'iOS 26.1', body: 'iOS 26.1 is ready to install.', open: { app: 'settings', intent: { page: 'softwareupdate' } } }); }
    const t = K.top();
    if (t && t.data && t.data.id === 'softwareupdate') t.render();
  }
  function installNow(K) {
    const b = JC.os.battery();
    if (b < 50 && !JC.os.charging) {
      K.alert({ title: 'Unable to Install Update', message: 'iOS 26.1 requires at least 50% battery, or connect iPhone to power. Battery is at ' + b + '%.\n\n(There is no charger in this taxi.)' });
      return;
    }
    K.setPref('su.state', 'installed');
    K.toast('iOS 26.1 installed', 'checkmark.circle.fill');
    K.render();
  }
  P.softwareupdate = {
    title: 'Software Update', path: 'General', icon: ['gearshape.fill', 'var(--gray)'], idx: ['iOS 26.1', 'Update', 'Automatic Updates', 'Beta Updates'],
    render(K) {
      const st = K.pref('su.state', 'idle');
      const dl = !!SU.timer;
      const head = h('div.set-su',
        h('div.set-su-ic', h('span', '26')),
        h('div.set-su-t', st === 'installed' ? 'iOS 26.1' : 'iOS 26.1'),
        h('div.set-su-s', st === 'installed' ? 'iOS is up to date' : 'Apple Inc. · 6.38 GB'),
        st === 'installed' ? null : h('div.set-su-notes', 'iOS 26.1 brings a Liquid Glass tint control, improved Lock Screen clock fonts, new ringtones, and important bug fixes and security updates. ', h('span.set-link.tap', { onTap: () => JC.os.open('safari', { url: 'support.apple.com/ios-26-1' }) }, 'Learn more…')),
        dl || st === 'downloading' ? h('div.set-su-prog', h('div.set-su-bar', h('div', { style: { width: Math.round(SU.prog * 100) + '%' } })), h('div.set-su-ps', 'Downloading… ' + (SU.prog * 6.38).toFixed(2) + ' GB of 6.38 GB · about ' + Math.max(1, Math.round((1 - SU.prog) * 4)) + ' min remaining')) : null);
      const btns = [];
      if (st === 'idle' && !dl) {
        btns.push({ t: 'Update Now', center: true, tap: () => {
          const start = () => { K.setPref('su.state', 'downloading'); SU.prog = 0.02; clearInterval(SU.timer); SU.timer = setInterval(() => suTick(K), 250); K.render(); };
          if (!(S().wifi && S().wifiNet)) JC.ui.alert({ title: 'Download Using Cellular?', message: 'You are not connected to Wi-Fi. Downloading iOS 26.1 (6.38 GB) uses cellular data.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Download', style: 'default', onTap: start }] });
          else start();
        } });
        btns.push({ t: 'Update Tonight', center: true, tap: () => K.alert({ title: 'Update Tonight', message: 'iPhone will try to update tonight between 2:00 and 4:00 if it is connected to power and Wi-Fi.\n\n(Childe will be very confused.)' }) });
      } else if (st === 'downloading' && !dl) {
        btns.push({ t: 'Resume Download', center: true, tap: () => { clearInterval(SU.timer); SU.timer = setInterval(() => suTick(K), 250); K.render(); } });
      } else if (st === 'ready') {
        btns.push({ t: 'Install Now', center: true, tap: () => installNow(K) });
        btns.push({ t: 'Install Tonight', center: true, tap: () => K.alert({ title: 'Install Tonight', message: 'iOS 26.1 will install between 2:00 and 4:00 if iPhone is connected to power.' }) });
      }
      return [
        { rows: [{ t: 'Automatic Updates', d: K.pref('su.auto', true) ? 'On' : 'Off', go: 'autoupdates' }, { t: 'Beta Updates', d: { off: 'Off', pub: 'iOS 26 Public Beta', dev: 'iOS 26 Developer Beta' }[K.pref('su.beta', 'off')], go: 'betaupdates' }] },
        head,
        btns.length ? { rows: btns, f: st === 'ready' ? 'Installing requires at least 50% battery or a power connection.' : null } : null,
      ];
    },
  };
  P.autoupdates = { title: 'Automatic Updates', path: 'Software Update', idx: ['Security Responses'], render: (K) => [{ h: 'Automatically', rows: [{ t: 'Security Responses & System Files', pref: 'su.sec', def: true }, { t: 'Download iOS Updates', pref: 'su.auto', def: true }, { t: 'Install iOS Updates', pref: 'su.install', def: false }], f: 'iPhone will try to update overnight while charging and connected to Wi-Fi.' }] };
  P.betaupdates = { title: 'Beta Updates', path: 'Software Update', render: (K) => [{ rows: [['off', 'Off'], ['pub', 'iOS 26 Public Beta'], ['dev', 'iOS 26 Developer Beta']].map(([k, l]) => ({ t: l, check: () => K.pref('su.beta', 'off') === k, tap: () => { if (k === 'dev') { K.alert({ title: 'Developer Beta', message: 'The Apple Account tartaglia@northland.sn is not enrolled in the Apple Developer Program.' }); return; } K.setPref('su.beta', k); K.render(); } })), f: 'Beta software is pre-release. Childe tried it once. The phone caught fire. (Metaphorically.)' }] };
  P.applecare = {
    title: 'AppleCare & Warranty', path: 'General', icon: ['checkmark.shield.fill', 'var(--red)'], idx: ['AppleCare+', 'Warranty', 'Theft and Loss', 'Coverage'],
    render: (K) => [
      h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--red)' } }, JC.icon('checkmark.shield.fill', { size: 30 })), h('div.set-hero-t', 'AppleCare+ with Theft and Loss'), h('div.set-hero-s', 'This iPhone · Coverage expires September 18, 2027')),
      { h: 'Coverage', rows: [{ t: 'Accidental Damage', d: '2 incidents left' }, { t: 'Theft and Loss', d: 'Included' }, { t: 'Battery Service', d: 'Included' }, { t: 'Express Replacement', d: 'Included' }] },
      { rows: [
        { t: 'File a Claim for Theft or Loss', tint: true, tap: () => K.alert({ title: 'File a Claim', message: 'Only the owner can file a claim, using his Apple Account password.\n\nAlso: this iPhone isn’t lost. You’re holding it.' }) },
        { t: 'Get Support', tint: true, tap: () => JC.os.open('safari', { url: 'support.apple.com' }) },
      ] },
    ],
  };
  P.airdrop = { title: 'AirDrop', path: 'General', icon: ['dot.radiowaves.left.and.right', 'var(--blue)'], idx: ['Receiving', 'Contacts Only', 'Everyone for 10 Minutes'], render: (K) => [{ rows: [['off', 'Receiving Off'], ['contacts', 'Contacts Only'], ['everyone', 'Everyone for 10 Minutes']].map(([k, l]) => ({ t: l, check: () => K.pref('airdrop', 'contacts') === k, tap: () => { K.setPref('airdrop', k); K.render(); if (k === 'everyone') K.toast('Everyone can AirDrop to this iPhone for 10 minutes', 'dot.radiowaves.left.and.right'); } })), f: 'AirDrop lets you share instantly with people nearby. You can be discoverable in AirDrop to everyone or only to people in your contacts.' }, { h: 'Start Sharing By', rows: [{ t: 'Bringing Devices Together', pref: 'airdrop.near', def: true }] }, { h: 'Out of Range', rows: [{ t: 'Use Cellular Data', pref: 'airdrop.cell', def: true }] }] };
  P.airplay = { title: 'AirPlay & Continuity', path: 'General', icon: ['rectangle.on.rectangle', 'var(--blue)'], idx: ['Handoff', 'iPhone Mirroring', 'Continuity Camera'], render: (K) => [{ rows: [{ t: 'Automatically AirPlay', pick: { pref: 'ap.auto', def: 'ask', options: [['never', 'Never'], ['ask', 'Ask'], ['auto', 'Automatic']] } }], f: 'Automatically stream to AirPlay-compatible devices that you frequently use.' }, { rows: [{ t: 'Transfer to HomePod', pref: 'ap.hp', def: true }] }, { h: 'Continuity', rows: [{ t: 'Handoff', pref: 'handoff', def: true }, { t: 'iPhone Mirroring', go: 'mirroring' }, { t: 'Continuity Camera', pref: 'contcam', def: true }] }] };
  P.mirroring = { title: 'iPhone Mirroring', path: 'AirPlay & Continuity', noSearch: true, render: (K) => [{ h: 'Mac', rows: K.pref('mirror.removed', false) ? [] : [{ t: 'Childe’s MacBook Pro', s: 'Pier View Residences', icon: ['laptopcomputer', 'var(--gray)'], swipe: [{ text: 'Remove', color: 'var(--red)', onTap: () => { K.setPref('mirror.removed', true); K.render(); } }], tap: () => K.alert({ title: 'Childe’s MacBook Pro', message: 'This Mac can mirror this iPhone while it’s locked and nearby. It isn’t nearby. Swipe left to remove it.' }) }], f: 'iPhone Mirroring lets you use your iPhone from your Mac.' }] };
  P.pip = { title: 'Picture in Picture', path: 'General', render: (K) => [{ rows: [{ t: 'Start PiP Automatically', pref: 'pip', def: true }], f: 'When you swipe up to go Home or use other apps, videos and FaceTime calls automatically continue in Picture in Picture.' }] };
  P.carplay = {
    title: 'CarPlay', path: 'General', icon: ['car.fill', 'var(--green)'], idx: ['Car', 'My Cars'],
    render: () => [{ h: 'My Cars', rows: [] , f: 'No cars. Childe takes Harbor Ride everywhere, or runs. (Mostly runs.)' }, { rows: [{ t: 'Harbor Ride', s: 'Ride-hailing', icon: 'app:swift', tap: () => JC.os.open('swift') }] }],
  };
  // storage
  const STORE_APPS = [['photos', 182.4, 'Photos & videos'], ['messages', 41.2, 'Attachments: 18 GB'], ['wavelet', 6.8], ['music', 4.2], ['mail', 2.9], ['maps', 1.9], ['notes', 1.4], ['reelrush', 1.1], ['voicememos', 0.9], ['safari', 0.76], ['camera', 0.52], ['swift', 0.31], ['lotuseats', 0.28], ['stocks', 0.12], ['health', 0.62], ['wallet', 0.21], ['weather', 0.08], ['calculator', 0.02]];
  P.storage = {
    title: 'iPhone Storage', path: 'General', icon: ['externaldrive.fill', 'var(--gray)'], idx: ['Storage', 'Offload Unused Apps', 'Free Up Space'],
    render(K) {
      const off = K.pref('st.offload', false);
      return [
        { rows: [{ custom: () => h('div.set-pad', K.usageBar([
          { name: 'Apps', v: 38, c: 'var(--red)' }, { name: 'Photos', v: 182, c: 'var(--yellow)' }, { name: 'Messages', v: 41, c: 'var(--green)' }, { name: 'iOS', v: 12, c: 'var(--gray)' }, { name: 'System Data', v: 177, c: 'var(--gray3)' },
        ], 512, { title: 'iPhone', right: '450.6 GB of 512 GB Used' })) }] },
        { h: 'Recommendations', rows: [
          { t: off ? 'Offload Unused Apps — Enabled' : 'Offload Unused Apps', s: 'Save 1.9 GB · Automatically offload unused apps when you’re low on storage. Your documents & data will be saved.', tint: !off, tap: () => { K.setPref('st.offload', !off); K.toast(off ? 'Offload Unused Apps turned off' : 'Offload Unused Apps enabled'); K.render(); } },
          { t: 'Review Large Attachments', s: 'See photos, videos and attachments taking up storage in Messages.', tint: true, tap: () => JC.os.open('messages') },
        ] },
        { rows: STORE_APPS.sort((a, b) => b[1] - a[1]).map(([id, gb, sub]) => ({ t: K.appName(id), s: sub || ('Last Used: ' + (id === 'reelrush' ? 'Yesterday' : 'Today')), icon: 'app:' + id, d: K.gb(gb), go: 'appstorage', arg: id })) },
      ];
    },
  };
  P.appstorage = {
    title: (id) => JC.os.appNames[id] || id, path: 'iPhone Storage', noSearch: true,
    render(K, id) {
      const gb = (STORE_APPS.find((x) => x[0] === id) || [0, 0.1])[1];
      return [
        { rows: [{ custom: () => h('div.set-appst', JC.appIcon(id, 60), h('div', h('div.set-appst-n', K.appName(id)), h('div.set-appst-s', id === 'reelrush' ? 'Reel Rush Games' : id === 'northland' ? 'Northland Bank Group' : id === 'feiyun' ? 'Feiyun Commerce Guild' : 'Apple'))) }, { t: 'App Size', d: K.gb(gb * 0.12) }, { t: 'Documents & Data', d: K.gb(gb * 0.88) }] },
        { rows: [{ t: 'Offload App', tint: true, center: true, tap: () => K.alert({ title: 'Offload “' + K.appName(id) + '”?', message: 'Offloading is disabled by your device management profile.' }) }], f: 'This will free up storage used by the app, but keep its documents and data.' },
        { rows: [{ t: 'Delete App', danger: true, center: true, tap: () => K.alert({ title: 'Can’t Delete “' + K.appName(id) + '”', message: 'This iPhone is managed by Northland Bank Group. Apps can’t be deleted. (Ekaterina.)' }) }] },
      ];
    },
  };
  P.bgrefresh = { title: 'Background App Refresh', path: 'General', icon: ['arrow.triangle.2.circlepath', 'var(--gray)'], render: (K) => [{ rows: [{ t: 'Background App Refresh', pick: { pref: 'bgr', def: 'both', options: [['off', 'Off'], ['wifi', 'Wi-Fi'], ['both', 'Wi-Fi & Cellular Data']] } }], f: 'Allow apps to refresh their content when on Wi-Fi or cellular in the background.' }, { rows: K.apps().filter((id) => !['calculator', 'camera', 'contacts'].includes(id)).map((id) => ({ t: K.appName(id), icon: 'app:' + id, pref: 'bgr.' + id, def: id !== 'reelrush' })) }] };
  P.datetime = {
    title: 'Date & Time', path: 'General', icon: ['calendar.badge.clock', 'var(--blue)'], idx: ['24-Hour Time', 'Time Zone', 'Clock'],
    render: (K) => [
      { rows: [{ t: '24-Hour Time', core: 'h24', after: (v) => K.act('h24', v) }] },
      { rows: [{ t: 'Set Automatically', locked: true, lockMsg: 'Date & time are set automatically by your mobile network and can’t be changed on a supervised iPhone.' }, { t: 'Time Zone', d: 'Shanghai', alert: { title: 'Time Zone', message: 'Time zone is set automatically to China Standard Time (Shanghai).' } }] },
      h('div.set-dt', h('div.set-dt-d', U.fmtDate(JC.time.now(), 'full')), h('div.set-dt-t', U.fmtTime(JC.time.now()))),
    ],
  };
  P.dictionary = { title: 'Dictionary', path: 'General', render: (K) => [{ rows: [['oxf', 'Oxford Dictionary of English'], ['xhzd', '现代汉语规范词典'], ['oxcn', 'Oxford Chinese Dictionary (Chinese – English)'], ['app', 'Apple Dictionary'], ['the', 'Oxford American Writer’s Thesaurus']].map(([k, l]) => ({ t: l, check: () => K.pref('dict.' + k, k === 'oxf' || k === 'oxcn'), tap: () => { K.setPref('dict.' + k, !K.pref('dict.' + k, k === 'oxf' || k === 'oxcn')); K.render(); } })) }] };
  P.fonts = { title: 'Fonts', path: 'General', render: () => [JC.ui.empty({ icon: 'textformat', title: 'No Fonts Installed', text: 'Fonts installed from apps appear here.' })] };
  const KBS0 = ['English (US)', '简体中文 – 拼音', 'Emoji'];
  P.keyboard = {
    title: 'Keyboards', path: 'General', icon: ['keypad', 'var(--gray)'], idx: ['Keyboard Clicks', 'Key clicks', 'Text Replacement', 'Auto-Correction', 'Predictive', 'Caps Lock'],
    render: (K) => [
      { rows: [{ t: 'Keyboards', d: String(K.pref('kb.list', KBS0).length), go: 'keyboards' }, { t: 'Text Replacement', go: 'textreplace' }, { t: 'One-Handed Keyboard', pick: { pref: 'kb.oneh', def: 'off', options: [['left', 'Left'], ['off', 'Off'], ['right', 'Right']] } }] },
      { h: 'All Keyboards', rows: [
        { t: 'Keyboard Clicks', core: 'keyClicks', after: (v) => { if (v) JC.audio.play('key'); } },
        { t: 'Auto-Capitalization', pref: 'kb.cap', def: true },
        { t: 'Auto-Correction', pref: 'kb.ac', def: true },
        { t: 'Show Predictions Inline', pref: 'kb.inline', def: true },
        { t: 'Check Spelling', pref: 'kb.spell', def: true },
        { t: 'Enable Caps Lock', pref: 'kb.caps', def: true },
        { t: 'Predictive Text', pref: 'kb.pred', def: true },
        { t: 'Slide to Type', pref: 'kb.slide', def: true },
        { t: 'Character Preview', pref: 'kb.prev', def: true },
        { t: '“.” Shortcut', pref: 'kb.dot', def: true },
      ], f: 'Double-tapping the space bar will insert a period followed by a space.' },
      { h: 'Dictation', rows: [{ t: 'Enable Dictation', pref: 'kb.dict', def: false, confirm: (ok) => JC.ui.alert({ title: 'Enable Dictation?', message: 'Dictation uses Childe’s voice profile. Your voice is not Childe’s.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Enable', style: 'default', onTap: ok }] }) }] },
      { h: 'Emoji', rows: [{ t: 'Memoji Stickers', pref: 'kb.memoji', def: false }], f: 'Send Memoji and Animoji stickers from your emoji keyboard. (Childe uses the fish one 300 times a week.)' },
    ],
  };
  P.keyboards = {
    title: 'Keyboards', path: 'Keyboard', noSearch: true,
    render: (K) => [{ rows: K.pref('kb.list', KBS0).map((k) => ({ t: k, swipe: [{ text: 'Delete', color: 'var(--red)', onTap: () => { const l = K.pref('kb.list', KBS0).filter((x) => x !== k); if (!l.length) { K.alert({ title: 'Can’t Remove', message: 'You need at least one keyboard.' }); return; } K.setPref('kb.list', l); K.render(); } }] })).concat([{ t: 'Add New Keyboard…', tint: true, tap: () => {
      const sh = JC.ui.sheet({ title: 'Add New Keyboard', detent: 'large', left: { text: 'Cancel' }, content: () => [JC.ui.list([{ header: 'Suggested Keyboards', rows: ['繁體中文 – 注音', '粵語 – 傳統', 'Japanese – Kana', 'Korean', 'French (France)', 'Spanish (Mexico)'].map((k) => ({ title: k, onTap: () => { sh.close(); const l = K.pref('kb.list', KBS0); if (!l.includes(k)) K.setPref('kb.list', l.concat(k)); K.render(); } })) }])] });
    } }]), f: 'Swipe left on a keyboard to remove it.' }],
  };
  const TR0 = [['xs', 'xiansheng'], ['fsh', '🐟🐟🐟'], ['omw', 'On my way!'], ['nvm', 'never mind, I’ll pay'], ['fite', 'fight me']];
  P.textreplace = {
    title: 'Text Replacement', path: 'Keyboard', idx: ['Shortcuts'],
    right: (K) => [JC.ui.navBtn({ icon: 'plus', onTap: () => JC.ui.alert({ title: 'Phrase', input: { placeholder: 'Phrase' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Next', style: 'default' }] }).then((r) => { if (r.index !== 1 || !r.value) return; setTimeout(() => JC.ui.alert({ title: 'Shortcut', input: { placeholder: 'Shortcut', cap: 'none' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r2) => { if (r2.index !== 1 || !r2.value) return; K.setPref('kb.tr', K.pref('kb.tr', TR0).concat([[r2.value, r.value]])); K.render(); }), 300); }) })],
    render: (K) => [{ rows: K.pref('kb.tr', TR0).map(([s, p]) => ({ t: p, d: s, swipe: [{ text: 'Delete', color: 'var(--red)', onTap: () => { K.setPref('kb.tr', K.pref('kb.tr', TR0).filter((x) => x[0] !== s)); K.render(); } }] })), f: 'Typing a shortcut replaces it with its phrase. Swipe left to delete.' }],
  };
  P.language = {
    title: 'Language & Region', path: 'General', icon: ['globe', 'var(--blue)'], idx: ['Region', 'Calendar', 'Temperature', 'Measurement', 'First Day of Week', 'Date Format', 'Number Format'],
    render(K) {
      const langs = K.pref('lang.list', ['English', 'Snezhnayan', '简体中文']);
      return [
        { h: 'Preferred Languages', rows: langs.map((l, i) => ({ t: l, s: i === 0 ? 'iPhone Language' : null, swipe: i ? [{ text: 'Delete', color: 'var(--red)', onTap: () => { K.setPref('lang.list', langs.filter((x) => x !== l)); K.render(); } }] : undefined })).concat([{ t: 'Add Language…', tint: true, tap: () => {
          const sh = JC.ui.sheet({ title: 'Add Language', detent: 'large', left: { text: 'Cancel' }, content: () => [JC.ui.list([{ rows: ['繁體中文', '粵語', '日本語', '한국어', 'Français', 'Español', 'Deutsch'].map((l) => ({ title: l, onTap: () => { sh.close(); if (!langs.includes(l)) K.setPref('lang.list', langs.concat(l)); K.render(); K.toast('Added ' + l, 'globe'); } })) }])] });
        } }]), f: 'Apps and websites will use the first language in this list that they support.' },
        { rows: [
          { t: 'Region', pick: { pref: 'lang.region', def: 'ly', options: [['ly', 'Liyue'], ['sn', 'Snezhnaya'], ['md', 'Mondstadt'], ['in', 'Inazuma'], ['fo', 'Fontaine']] } },
          { t: 'Calendar', pick: { pref: 'lang.cal', def: 'greg', options: [['greg', 'Gregorian'], ['chinese', 'Chinese'], ['buddhist', 'Buddhist']] } },
          { t: 'Temperature', pick: { pref: 'lang.temp', def: 'c', options: [['c', 'Celsius (°C)'], ['f', 'Fahrenheit (°F)']] } },
          { t: 'Measurement System', pick: { pref: 'lang.meas', def: 'metric', options: [['metric', 'Metric'], ['us', 'US'], ['uk', 'UK']] } },
          { t: 'First Day of Week', pick: { pref: 'lang.fdw', def: 'mon', options: [['sun', 'Sunday'], ['mon', 'Monday'], ['sat', 'Saturday']] } },
          { t: 'Date Format', pick: { pref: 'lang.df', def: 'ymd', options: [['ymd', '2026/10/16'], ['dmy', '16/10/2026'], ['mdy', '10/16/26']] } },
          { t: 'Number Format', pick: { pref: 'lang.nf', def: 'comma', options: [['comma', '1,234,567.89'], ['space', '1 234 567,89'], ['dot', '1.234.567,89']] } },
        ] },
        { rows: [{ t: 'Live Text', pref: 'lang.lt', def: true }], f: 'Select text in images to copy or take action.' },
        h('div.set-region', h('div.set-region-k', 'Region Format Example'), h('div', U.fmtTime(JC.time.now())), h('div', 'Friday, 16 October 2026'), h('div', 'ℳ12,345.67  4,567.89')),
      ];
    },
  };
  P.tvprovider = { title: 'TV Provider', path: 'General', render: (K) => [{ h: 'Choose Your TV Provider', rows: ['Liyue Broadcasting', 'Heyu Opera Channel', 'Snezhnaya State TV', 'Steambird+'].map((p) => ({ t: p, tap: () => K.alert({ title: p, message: 'Sign in with your TV provider account to watch on this iPhone.' }) })) }] };
  P.legal = { title: 'Legal & Regulatory', path: 'General', render: () => [h('div.set-doc', h('h3', 'Legal Notices'), h('p', 'This is a fan-made story phone set in a modern Teyvat. Every company, stock and fish in it is fictional. Genshin Impact characters belong to HoYoverse; this is an unofficial fan work.'), h('h3', 'Regulatory'), h('p', 'Model A3524 · CMIIT ID: 2025CP1508 · Designed by Apple in California. Found on a pier in Liyue Harbor.'), h('h3', 'RF Exposure'), h('p', 'To reduce exposure to RF energy, use a hands-free option. To reduce exposure to the Fatui, do not answer unknown numbers after midnight.'))] };
  P.reset = {
    title: 'Transfer or Reset iPhone', path: 'General', icon: ['arrow.counterclockwise', 'var(--gray)'], idx: ['Reset', 'Erase All Content and Settings', 'Reset Home Screen Layout', 'Reset Network Settings'],
    render: (K) => [
      h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--blue)' } }, JC.icon('iphone', { size: 30 })), h('div.set-hero-t', 'Prepare for New iPhone'), h('div.set-hero-s', 'Make sure everything’s ready to transfer to a new iPhone, even if you don’t currently have enough iCloud storage to back up.'), h('div.set-hero-btn.tap', { onTap: () => K.alert({ title: 'Get Started', message: 'This requires iCloud Backup and the owner’s Apple Account password.' }) }, 'Get Started')),
      { rows: [
        { t: 'Reset', tint: true, tap: () => JC.ui.actionSheet({ actions: [
          { text: 'Reset All Settings', onTap: () => K.alert({ title: 'Reset All Settings', message: 'Reset All Settings is restricted on this supervised iPhone.' }) },
          { text: 'Reset Network Settings', onTap: () => JC.ui.alert({ title: 'Reset Network Settings?', message: 'This will delete all network settings, returning them to factory defaults.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onTap: () => { K.setPref('wifi.known', []); K.setCore('wifiNet', null); JC.bus.emit('network', JC.os.online()); JC.os.updateStatus(); K.toast('Network settings reset', 'wifi'); } }] }) },
          { text: 'Reset Keyboard Dictionary', onTap: () => { K.setPref('kb.tr', []); K.toast('Keyboard dictionary reset', 'keypad'); } },
          { text: 'Reset Home Screen Layout', onTap: () => JC.ui.alert({ title: 'Reset Home Screen?', message: 'Your Home Screen will be reset to its factory layout.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset Home Screen', style: 'destructive', onTap: () => { JC.os.resetHome(); K.toast('Home Screen reset', 'apps.iphone'); } }] }) },
          { text: 'Reset Location & Privacy', onTap: () => { K.toast('Location & Privacy reset', 'hand.raised.fill'); } },
        ] }) },
        { t: 'Erase All Content and Settings', tint: true, tap: () => K.gate('Erase iPhone', () => { K.back(); setTimeout(() => JC.ui.alert({ title: 'Apple Account Password', message: 'Enter the password for tartaglia@northland.sn to turn off Find My and Activation Lock.', input: { placeholder: 'Password', type: 'password' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Turn Off', style: 'default' }] }).then((r) => { if (r.index === 1) setTimeout(() => K.alert({ title: 'Incorrect Password', message: 'The Apple Account password is incorrect. (You were never going to guess it.)' }), 400); }), 450); }) },
      ] },
    ],
  };
  function shutDown(K) {
    const layer = K.win().overlays;
    const knob = h('div.set-off-knob', JC.icon('power', { size: 26 }));
    const track = h('div.set-off-track', knob, h('span.set-off-t', 'slide to power off'));
    const cancel = h('div.set-off-cancel', { onTap: () => close() }, JC.icon('xmark', { size: 22 }), h('div', 'Cancel'));
    const el = h('div.set-off', track, cancel);
    layer.appendChild(el);
    U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    let x = 0;
    U.drag(knob, {
      axis: 'x',
      move: (e, p) => { x = U.clamp(p.dx, 0, 230); knob.style.transform = `translateX(${x}px)`; track.querySelector('.set-off-t').style.opacity = String(1 - x / 140); },
      end: () => {
        if (x > 200) {
          U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => el.remove());
          setTimeout(() => { JC.os.home(); setTimeout(() => { JC.os.sleep(); JC.ui.toast('Press the side button to turn the screen back on', { icon: 'power' }); }, 400); }, 200);
        } else { knob.style.transform = ''; track.querySelector('.set-off-t').style.opacity = ''; }
      },
    });
    function close() { U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }).then(() => el.remove()); }
  }
  JC.icon.add({ power: '<path d="M12 3.5v8"/><path d="M7.2 6.3a7.5 7.5 0 1 0 9.6 0"/>' });

  // ═══ Display & Brightness ══════════════════════════════════════
  P.display = {
    title: 'Display & Brightness', icon: ['sun.max.fill', 'var(--blue)'], idx: ['Dark Mode', 'Light Mode', 'Appearance', 'Brightness', 'True Tone', 'Night Shift', 'Auto-Lock', 'Raise to Wake', 'Text Size', 'Bold Text', 'Always On'],
    render(K) {
      const a = K.core('appearance') || 'auto';
      const dark = JC.os.dark;
      const phone = (mode, label) => h('div.set-appear.tap', { onTap: () => { K.mute(() => JC.os.setAppearance(mode)); K.act('appearance', mode); K.render(); } },
        h('div.set-appear-ph', { class: mode, style: { backgroundImage: `url("${JC.art.url(K.core('wallpaper') || 'wp_harbor_night')}")` } }, h('div.set-appear-t', U.fmtClock(JC.time.now())), h('div.set-appear-w'), h('div.set-appear-w.b')),
        h('div.set-appear-l', label), h('div.set-radio', { class: { on: (mode === 'dark') === dark } }, (mode === 'dark') === dark ? JC.icon('checkmark', { size: 14, weight: 3 }) : null));
      return [
        { h: 'Appearance', rows: [
          { custom: () => h('div.set-appears', phone('light', 'Light'), phone('dark', 'Dark')) },
          { t: 'Automatic', on: () => a === 'auto', core: 'appearance', set: (v) => JC.os.setAppearance(v ? 'auto' : (JC.os.dark ? 'dark' : 'light')) },
          a === 'auto' ? { t: 'Options', d: 'Light Until Sunset', alert: { title: 'Appearance Schedule', message: 'Automatic follows the appearance of the device you’re using to play.' } } : null,
        ].filter(Boolean) },
        { h: 'Text', rows: [{ t: 'Text Size', go: 'textsize' }, { t: 'Bold Text', core: 'boldText', after: (v) => K.act('boldText', v) }] },
        { h: 'Brightness', rows: [
          { custom: () => h('div.set-slider', JC.ui.slider({ value: K.core('brightness') == null ? 1 : K.core('brightness'), min: 0.05, max: 1, icons: ['sun.min', 'sun.max.fill'], onInput: (v) => K.mute(() => JC.os.setBrightness(v)) })) },
          { t: 'True Tone', pref: 'trueTone', def: true },
        ], f: 'Automatically adapt iPhone display based on ambient lighting conditions to make colors appear consistent in different environments.' },
        { rows: [{ t: 'Night Shift', d: K.pref('ns.manual', false) ? 'On' : K.pref('ns.scheduled', false) ? 'Scheduled' : 'Off', go: 'nightshift' }] },
        { rows: [
          { t: 'Auto-Lock', pick: { pref: 'autolock', def: '1m', options: [['30s', '30 seconds'], ['1m', '1 minute'], ['2m', '2 minutes'], ['3m', '3 minutes'], ['4m', '4 minutes'], ['5m', '5 minutes'], ['never', 'Never']], footer: 'Auto-Lock is paused while you’re playing.' } },
          { t: 'Raise to Wake', pref: 'raise', def: true },
          { t: 'Always On Display', d: K.pref('aod', true) ? 'On' : 'Off', go: 'aod' },
        ] },
        { h: 'Display', rows: [{ t: 'Display Zoom', d: K.pref('zoom', 'default') === 'default' ? 'Default' : 'Larger Text', go: 'displayzoom' }], f: 'Choose a view for iPhone. Larger Text shows larger controls. Default shows more content.' },
      ];
    },
  };
  const SIZES = [0.82, 0.88, 0.94, 1, 1.12, 1.24, 1.36];
  P.textsize = {
    title: 'Text Size', path: 'Display & Brightness', idx: ['Larger Text', 'Dynamic Type', 'Font Size'],
    render(K) {
      const cur = K.core('textSize') || 1;
      const i = SIZES.reduce((best, s, k) => (Math.abs(s - cur) < Math.abs(SIZES[best] - cur) ? k : best), 3);
      const sample = h('div.set-ts-sample', { style: { fontSize: Math.round(17 * SIZES[i]) + 'px' } }, 'Apps that support Dynamic Type will adjust to your preferred reading size below.');
      return [
        sample,
        { rows: [{ custom: () => h('div.set-ts', h('span.set-ts-a.s', 'A'), JC.ui.slider({ value: i, min: 0, max: 6, step: 1, onInput: (v) => { sample.style.fontSize = Math.round(17 * SIZES[v]) + 'px'; }, onChange: (v) => { K.setCore('textSize', SIZES[v]); K.act('textSize', SIZES[v]); } }), h('span.set-ts-a.l', 'A')) }] },
      ];
    },
  };
  P.nightshift = {
    title: 'Night Shift', path: 'Display & Brightness', idx: ['Warmer', 'Blue light', 'Color Temperature'],
    render(K) {
      const sched = K.pref('ns.scheduled', false);
      return [
        h('div.set-hero-s.pad', 'Night Shift automatically shifts the colors of your display to the warmer end of the color spectrum after dark. This may help you get a better night’s sleep.'),
        { rows: [
          { t: 'Scheduled', pref: 'ns.scheduled', def: false, rerender: true },
          sched ? { t: 'From', d: (K.pref('ns.from', 22) + ':00') + ' → ' + ('0' + K.pref('ns.to', 7) + ':00'), go: 'nsschedule' } : null,
        ].filter(Boolean) },
        { rows: [{ t: 'Manually Enable Until Tomorrow', pref: 'ns.manual', def: false }] },
        { h: 'Color Temperature', rows: [{ custom: () => h('div.set-ts', h('span.set-ts-w', 'Less Warm'), JC.ui.slider({ value: K.pref('ns.warmth', 0.55), min: 0, max: 1, onInput: (v) => { const p = Object.assign({}, JC.state.d.settings.prefs || {}, { 'ns.warmth': v }); JC.state.d.settings.prefs = p; SK.applyScreenPrefs(); }, onChange: (v) => K.setPref('ns.warmth', v) }), h('span.set-ts-w', 'More Warm')) }], f: SK.nightOn() ? 'Night Shift is on now.' : 'Turn on Night Shift to preview the color temperature.' },
      ];
    },
  };
  P.nsschedule = { title: 'Schedule', path: 'Night Shift', noSearch: true, render: (K) => [{ rows: [{ t: 'From', pick: { pref: 'ns.from', def: 22, options: [[18, '18:00'], [20, '20:00'], [21, '21:00'], [22, '22:00'], [23, '23:00']] } }, { t: 'To', pick: { pref: 'ns.to', def: 7, options: [[5, '05:00'], [6, '06:00'], [7, '07:00'], [8, '08:00']] } }] }] };
  P.aod = { title: 'Always On Display', path: 'Display & Brightness', render: (K) => [{ rows: [{ t: 'Always On Display', pref: 'aod', def: true }], f: 'Always On Display keeps the time, widgets and notifications visible when iPhone is locked, using very little battery.' }, { rows: [{ t: 'Show Wallpaper', pref: 'aod.wall', def: true }, { t: 'Show Notifications', pref: 'aod.notif', def: true }] }] };
  P.displayzoom = { title: 'Display Zoom', path: 'Display & Brightness', render: (K) => [{ rows: [['default', 'Default', 'Show more content'], ['larger', 'Larger Text', 'Larger controls']].map(([k, l, s]) => ({ t: l, s, check: () => K.pref('zoom', 'default') === k, tap: () => { if (K.pref('zoom', 'default') === k) return; JC.ui.alert({ title: 'Changing Display Zoom will restart iPhone', message: 'The new zoom level will apply the next time this iPhone restarts.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Use ' + l, style: 'default', onTap: () => { K.setPref('zoom', k); K.render(); } }] }); } })) }] };

  // ═══ Wallpaper ═════════════════════════════════════════════════
  const WPS = [['wp_harbor_night', 'Harbor at Night'], ['wp_hydro', 'Hydro'], ['wp_glaze_lily', 'Glaze Lily'], ['wp_morepesok_snow', 'Morepesok Snow'], ['wp_teucer_drawing', 'Teucer’s Drawing'], ['wp_guyun_storm', 'Guyun']];
  function wpPreview(id, kind) {
    const el = h('div.set-wp-ph', { class: kind, style: { backgroundImage: `url("${JC.art.url(id)}")` } });
    if (kind === 'lock') {
      el.append(h('div.set-wp-date', 'Friday, October 16'), h('div.set-wp-time', U.fmtClock(JC.time.now())));
      if (JC.art.has(id + '_fg')) el.appendChild(h('div.set-wp-fg', { style: { backgroundImage: `url("${JC.art.url(id + '_fg')}")` } }));
    } else {
      el.append(h('div.set-wp-icons', Array.from({ length: 16 }, () => h('i'))), h('div.set-wp-dock', h('i'), h('i'), h('i'), h('i')));
    }
    return el;
  }
  function wpGallery(K) {
    const sh = JC.ui.sheet({
      title: 'Add New Wallpaper', detent: 'large', left: { text: 'Cancel' },
      content: () => [h('div.set-wp-gal', WPS.map(([id, name]) => h('div.set-wp-gi.tap', { onTap: () => { sh.close(); setTimeout(() => wpConfirm(K, id, name), 320); } }, h('div.set-wp-gimg', { style: { backgroundImage: `url("${JC.art.url(id)}")` } }), h('div.set-wp-gn', name), K.core('wallpaper') === id ? h('div.set-wp-cur', 'Current') : null)))],
    });
  }
  function wpConfirm(K, id, name) {
    const sh = JC.ui.sheet({
      title: name, detent: 'large', left: { text: 'Cancel' },
      right: { text: 'Add', onTap: () => { JC.os.setWallpaper(id); K.toast('Wallpaper set', 'photo.artframe'); K.render(); } },
      content: () => [h('div.set-wp-confirm', wpPreview(id, 'lock'), wpPreview(id, 'home')), h('div.set-wp-note', 'Set as wallpaper pair for the Lock Screen and Home Screen.'), h('div.set-wp-btn.tap', { onTap: () => { sh.close(); JC.os.setWallpaper(id); K.toast('Wallpaper set', 'photo.artframe'); K.render(); } }, 'Set as Wallpaper Pair')],
    });
  }
  P.wallpaper = {
    title: 'Wallpaper', icon: ['photo.artframe', 'var(--cyan)'], idx: ['Lock Screen', 'Home Screen', 'Background'],
    render(K) {
      const cur = K.core('wallpaper') || 'wp_harbor_night';
      return [
        h('div.set-wp-cur2', h('div.set-wp-col', wpPreview(cur, 'lock'), h('div.set-wp-cust.tap', { onTap: () => wpGallery(K) }, 'Customize')), h('div.set-wp-col', wpPreview(cur, 'home'), h('div.set-wp-cust.tap', { onTap: () => wpGallery(K) }, 'Customize'))),
        { rows: [{ t: 'Add New Wallpaper', tint: true, center: true, tap: () => wpGallery(K) }] },
        { h: 'Collections', rows: WPS.map(([id, name]) => ({ t: name, leading: h('div.set-wp-thumb', { style: { backgroundImage: `url("${JC.art.url(id)}")` } }), check: () => cur === id, tap: () => wpConfirm(K, id, name) })) },
      ];
    },
  };

  // ═══ Sounds & Haptics ══════════════════════════════════════════
  const RINGTONES = ['Reflection', 'Apex', 'Beacon', 'Bulletin', 'By the Seaside', 'Chimes', 'Circuit', 'Constellation', 'Cosmic', 'Crystals', 'Hillside', 'Illuminate', 'Night Owl', 'Opening', 'Playtime', 'Presto', 'Radar', 'Radiate', 'Ripples', 'Sencha', 'Signal', 'Silk', 'Slow Rise', 'Stargaze', 'Summit', 'Twinkle', 'Uplift', 'Waves'];
  const ALERTS = ['Note', 'Aurora', 'Bamboo', 'Chord', 'Circles', 'Complete', 'Hello', 'Input', 'Keys', 'Popcorn', 'Pulse', 'Synth', 'Tri-tone', 'Swoosh', 'Rebound'];
  const TONE_KEYS = [['ringtone', 'Ringtone', 'Reflection', RINGTONES], ['texttone', 'Text Tone', 'Note', ALERTS], ['voicemail', 'New Voicemail', 'Tri-tone', ALERTS], ['newmail', 'New Mail', 'None', ALERTS], ['sentmail', 'Sent Mail', 'Swoosh', ALERTS], ['calendar', 'Calendar Alerts', 'Chord', ALERTS], ['reminder', 'Reminder Alerts', 'Chord', ALERTS], ['default', 'Default Alerts', 'Rebound', ALERTS]];
  let toneStop = null;
  function playTone(name) {
    if (toneStop) toneStop();
    const ctx = JC.audio.ctx && JC.audio.ctx();
    if (!ctx || name === 'None') return;
    if (ctx.state === 'suspended') ctx.resume();
    let x = 0;
    for (let i = 0; i < name.length; i++) x = (x * 31 + name.charCodeAt(i)) >>> 0;
    const pent = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
    const root = 64 + (x % 7);
    const ring = RINGTONES.includes(name) || name === 'TEUCER SAYS HI' || name === 'Morepesok Bells';
    const n = ring ? 10 : 3 + (x % 3);
    const step = ring ? 0.17 : 0.12;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(JC.audio.out || ctx.destination);
    const t0 = ctx.currentTime + 0.03;
    const reps = ring ? 2 : 1;
    for (let r = 0; r < reps; r++) {
      for (let i = 0; i < n; i++) {
        const m = name === 'TEUCER SAYS HI' ? 84 + ((i * 5) % 9) : root + pent[(x >> (i % 13)) % pent.length] + (i === n - 1 ? 12 : 0);
        const f = 440 * Math.pow(2, (m - 69) / 12);
        const t = t0 + r * (n * step + 0.4) + i * step + (i % 2 && name === 'Ripples' ? 0.05 : 0);
        [1, 2.01].forEach((mul, k) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = name === 'TEUCER SAYS HI' ? 'sawtooth' : name === 'Circuit' || name === 'Synth' ? 'square' : 'sine';
          o.frequency.value = f * mul;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime((k ? 0.03 : 0.11) * (name === 'TEUCER SAYS HI' ? 0.5 : 1), t + 0.008);
          g.gain.exponentialRampToValueAtTime(0.0001, t + (ring ? 0.5 : 0.35));
          o.connect(g); g.connect(out);
          o.start(t); o.stop(t + 0.6);
        });
      }
    }
    JC.audio.haptic([20, 40, 20]);
    toneStop = () => { try { out.gain.setTargetAtTime(0, ctx.currentTime, 0.02); setTimeout(() => out.disconnect(), 200); } catch (e) { /* ignore */ } toneStop = null; };
  }
  SK.playTone = playTone;
  P.sounds = {
    title: 'Sounds & Haptics', icon: ['speaker.wave.2.fill', 'var(--pink)'], idx: ['Silent Mode', 'Ringtone', 'Volume', 'Ringer', 'Text Tone', 'Keyboard Feedback', 'Lock Sound', 'System Haptics', 'Vibration'],
    onClose: () => toneStop && toneStop(),
    render(K) {
      return [
        { rows: [{ t: 'Silent Mode', icon: ['bell.slash.fill', 'var(--red)'], core: 'silent', set: (v) => JC.os.setToggle('silent', v) }], f: 'iPhone won’t ring for calls and alerts. Media like music still plays.' },
        { h: 'Ringtone and Alert Volume', rows: [
          { custom: () => h('div.set-slider', JC.ui.slider({ value: K.core('ringer') == null ? 0.7 : K.core('ringer'), min: 0, max: 1, icons: ['speaker.fill', 'speaker.wave.2.fill'], onInput: (v) => { K.setCore('ringer', Math.round(v * 100) / 100); JC.audio.applyVolume(); }, onChange: () => JC.audio.play('tink') })) },
          { t: 'Change with Buttons', pref: 'snd.buttons', def: true },
        ], f: 'The volume of the ringer and alerts can be adjusted using the volume buttons when “Change with Buttons” is on.' },
        { h: 'Media Volume', rows: [{ custom: () => h('div.set-slider', JC.ui.slider({ value: K.core('volume') == null ? 0.6 : K.core('volume'), min: 0, max: 1, icons: ['speaker.fill', 'speaker.wave.3.fill'], onInput: (v) => { K.setCore('volume', Math.round(v * 100) / 100); JC.audio.applyVolume(); }, onChange: () => JC.audio.beep(660, 0.12, 0.06) })) }], f: 'Music, videos and games. Also changes with the volume buttons.' },
        { rows: [{ t: 'Headphone Safety', go: 'headphone' }] },
        { h: 'Sounds and Haptic Patterns', rows: TONE_KEYS.map(([k, label, def]) => ({ t: label, d: K.pref('tone.' + k, k === 'ringtone' ? 'TEUCER SAYS HI' : def), go: 'tones', arg: k })) },
        { rows: [{ t: 'Keyboard Feedback', d: K.core('keyClicks') !== false ? 'Sound' : 'None', go: 'kbfeedback' }, { t: 'Lock Sound', pref: 'snd.lock', def: true }] },
        { h: 'System Haptics', rows: [{ t: 'Haptics', pick: { pref: 'snd.haptics', def: 'always', options: [['always', 'Always Play'], ['silent', 'Play in Silent Mode'], ['notsilent', 'Don’t Play in Silent Mode'], ['never', 'Never Play']] } }, { t: 'System Haptics', pref: 'snd.syshaptics', def: true }], f: 'Play haptics for system controls and interactions.' },
      ];
    },
  };
  P.tones = {
    title: (k) => (TONE_KEYS.find((x) => x[0] === k) || [0, 'Tone'])[1], path: 'Sounds & Haptics', noSearch: true,
    onClose: () => toneStop && toneStop(),
    render(K, k) {
      const def = TONE_KEYS.find((x) => x[0] === k);
      const cur = K.pref('tone.' + k, k === 'ringtone' ? 'TEUCER SAYS HI' : def[2]);
      const pickT = (name) => { K.setPref('tone.' + k, name); if (k === 'ringtone') K.setCore('ringtone', name); playTone(name); K.render(); };
      const row = (name) => ({ t: name, check: () => cur === name, tap: () => pickT(name) });
      return [
        { rows: [{ t: 'Haptics', d: 'Synchronized', alert: { title: 'Haptics', message: 'Haptics play in sync with the tone.' } }] },
        { h: 'Store', rows: [{ t: 'Tone Store', tint: true, tap: () => K.alert({ title: 'Tone Store', message: 'The Tone Store isn’t available in your region.' }) }, { t: 'Download All Purchased Tones', tint: true, tap: () => K.toast('All purchased tones are downloaded', 'arrow.down.circle') }] },
        k === 'ringtone' ? { h: 'Custom', rows: [row('TEUCER SAYS HI'), row('Morepesok Bells')], f: 'Teucer recorded “TEUCER SAYS HI” and set it as your ringtone last winter. You never changed it back. You never will.' } : null,
        { h: k === 'ringtone' ? 'Ringtones' : 'Alert Tones', rows: (k === 'ringtone' ? RINGTONES : ['None'].concat(ALERTS)).map(row) },
        k !== 'ringtone' ? { h: 'Ringtones', rows: RINGTONES.slice(0, 8).map(row) } : null,
      ];
    },
  };
  P.kbfeedback = { title: 'Keyboard Feedback', path: 'Sounds & Haptics', idx: ['Key clicks', 'Keyboard Sound', 'Keyboard Haptic'], render: (K) => [{ rows: [{ t: 'Sound', core: 'keyClicks', after: (v) => { if (v) JC.audio.play('key'); } }, { t: 'Haptic', pref: 'kb.haptic', def: false }] }] };
  P.headphone = { title: 'Headphone Safety', path: 'Sounds & Haptics', render: (K) => [{ rows: [{ t: 'Headphone Notifications', pref: 'hp.notif', def: true }, { t: 'Reduce Loud Audio', pref: 'hp.reduce', def: false }], f: 'iPhone can analyze headphone audio and reduce any sound that is over a set decibel level.' }] };

  // ═══ Focus ═════════════════════════════════════════════════════
  const FOCI = [
    { id: 'dnd', name: 'Do Not Disturb', icon: 'moon.fill', color: 'var(--indigo)', desc: 'Silence notifications and calls. Only people and apps you allow can reach you.' },
    { id: 'sleep', name: 'Sleep', icon: 'bed.double.fill', color: 'var(--teal)', desc: 'Sleep dims your Lock Screen and silences notifications. Schedule: 23:30 – 07:00.' },
    { id: 'personal', name: 'Personal', icon: 'person.fill', color: 'var(--purple)', desc: 'Focus on your personal life. Only family can reach you.' },
    { id: 'work', name: 'Work', icon: 'briefcase.fill', color: 'var(--green)', desc: 'Focus on work. Notifications from Mail, Calendar and the Liyue Branch are allowed.' },
  ];
  P.focus = {
    title: 'Focus', icon: ['moon.fill', 'var(--indigo)'], idx: ['Do Not Disturb', 'Sleep', 'Personal', 'Work', 'Focus Status'],
    right: (K) => [JC.ui.navBtn({ icon: 'plus', onTap: () => {
      const sh = JC.ui.sheet({ title: 'New Focus', detent: 'large', left: { text: 'Cancel' }, content: () => [h('div.set-hero-s.pad', 'What do you want to focus on?'), JC.ui.list([{ rows: [['Driving', 'car.fill', 'var(--blue)'], ['Fitness', 'figure.run', 'var(--green)'], ['Gaming', 'gamecontroller.fill', 'var(--blue)'], ['Mindfulness', 'leaf.fill', 'var(--teal)'], ['Reading', 'book.fill', 'var(--orange)']].map(([n, ic, c]) => ({ title: n, icon: { glyph: ic, bg: c }, onTap: () => { sh.close(); const l = K.pref('focus.custom', []); if (!l.includes(n)) K.setPref('focus.custom', l.concat(n)); K.render(); K.toast(n + ' Focus added', ic); } })) }])] });
    } })],
    render(K) {
      const cur = K.core('focus');
      return [
        { rows: FOCI.map((f) => ({ t: f.name, icon: [f.icon, f.color], d: cur === f.id ? 'On' : '', go: 'focusmode', arg: f.id })).concat(K.pref('focus.custom', []).map((n) => ({ t: n, icon: ['circle.fill', 'var(--gray)'], d: 'Set Up', go: 'focuscustom', arg: n }))) },
        { rows: [{ t: 'Share Across Devices', pref: 'focus.share', def: true }], f: 'Focus is shared across your devices, and turning one on for this device will turn it on for all of them.' },
        { rows: [{ t: 'Focus Status', d: K.pref('focus.status', true) ? 'On' : 'Off', go: 'focusstatus' }], f: 'When you give an app permission, it can share that you have notifications silenced when using Focus.' },
      ];
    },
  };
  P.focusmode = {
    title: (id) => (FOCI.find((f) => f.id === id) || {}).name, path: 'Focus', noSearch: true,
    render(K, id) {
      const f = FOCI.find((x) => x.id === id);
      const on = K.core('focus') === id;
      return [
        h('div.set-hero', h('div.set-hero-ic', { style: { background: f.color } }, JC.icon(f.icon, { size: 30 })), h('div.set-hero-t', f.name), h('div.set-hero-s', f.desc)),
        { rows: [{ t: 'Turn On ' + f.name, on: () => on, core: 'focus', set: (v) => JC.os.setToggle('focus', v ? id : null), after: (v) => K.toast(v ? f.name + ' On' : f.name + ' Off', f.icon) }] },
        { h: 'Allow Notifications', rows: [{ t: 'People', d: id === 'work' ? 'Ekaterina, Signora' : 'Teucer, Mama, Xiansheng', go: 'focuspeople', arg: id }, { t: 'Apps', d: id === 'work' ? 'Mail, Calendar' : 'Phone', go: 'focusapps', arg: id }] },
        { h: 'Set a Schedule', rows: [id === 'sleep' ? { t: '23:30 – 07:00', s: 'Every Day', pref: 'focus.sched.sleep', def: false } : null, { t: 'Add Schedule', tint: true, tap: () => K.alert({ title: 'Add Schedule', message: 'Schedules can turn this Focus on at a time, a location, or when you open an app. (Childe’s Health data suggests he has never slept on schedule.)' }) }].filter(Boolean) },
        { h: 'Customize Screens', rows: [{ custom: () => h('div.set-focus-scr', ['lock', 'home'].map((k) => h('div.set-focus-ph.tap', { onTap: () => K.go('wallpaper') }, wpPreview(K.core('wallpaper') || 'wp_harbor_night', k), h('div', k === 'lock' ? 'Lock Screen' : 'Home Screen')))) }] },
        { rows: [{ t: 'Delete Focus', danger: true, center: true, tap: () => K.alert({ title: 'Can’t Delete', message: f.name + ' is a built-in Focus.' }) }] },
      ];
    },
  };
  P.focuscustom = { title: (n) => n, path: 'Focus', noSearch: true, render: (K, n) => [{ rows: [{ t: 'Turn On ' + n, locked: false, lockTitle: n, lockMsg: 'Finish setting up this Focus on the Focus screen in Control Center.' }] }, { rows: [{ t: 'Delete Focus', danger: true, center: true, tap: () => { K.setPref('focus.custom', K.pref('focus.custom', []).filter((x) => x !== n)); K.back(); } }] }] };
  P.focuspeople = { title: 'People', path: 'Focus', noSearch: true, render: (K, id) => [{ h: 'Allow Notifications From', rows: ['teucer', 'mama', 'zl', 'tonia', 'ekat', 'signora'].map((c) => ({ t: JC.contacts.name(c), avatar: c, pref: 'focus.p.' + id + '.' + c, def: id === 'work' ? (c === 'ekat' || c === 'signora') : (c === 'teucer' || c === 'mama' || c === 'zl') })) }, { rows: [{ t: 'Calls from Favorites', pref: 'focus.fav.' + id, def: true }, { t: 'Allow Repeated Calls', pref: 'focus.rep.' + id, def: true }], f: 'A second call from the same person within three minutes will not be silenced. (Teucer knows this.)' }] };
  P.focusapps = { title: 'Apps', path: 'Focus', noSearch: true, render: (K, id) => [{ h: 'Allow Notifications From', rows: ['phone', 'messages', 'mail', 'calendar', 'findmy', 'reelrush', 'wavelet'].map((a) => ({ t: K.appName(a), icon: 'app:' + a, pref: 'focus.a.' + id + '.' + a, def: id === 'work' ? (a === 'mail' || a === 'calendar') : a === 'phone' })) }, { rows: [{ t: 'Time Sensitive Notifications', pref: 'focus.ts.' + id, def: true }] }] };
  P.focusstatus = { title: 'Focus Status', path: 'Focus', render: (K) => [{ rows: [{ t: 'Share Focus Status', pref: 'focus.status', def: true }], f: 'When you allow an app, it can share with people that you have notifications silenced.' }, { h: 'Share From', rows: FOCI.map((f) => ({ t: f.name, icon: [f.icon, f.color], pref: 'focus.st.' + f.id, def: true })) }] };

  // ═══ Notifications ═════════════════════════════════════════════
  const notifDef = (id) => ({ allow: true, lock: true, center: true, banners: true, style: 'temporary', sounds: true, badges: true, previews: 'default', group: 'auto' });
  const notifOf = (K, id) => Object.assign(notifDef(id), K.pref('notif.' + id, {}));
  function setNotif(K, id, patch) {
    const n = Object.assign(notifOf(K, id), patch);
    K.setPref('notif.' + id, n);
    const off = Object.assign({}, K.core('notifOff') || {});
    if (n.allow) delete off[id]; else off[id] = true;
    K.setCore('notifOff', off);
  }
  P.notifications = {
    title: 'Notifications', icon: ['bell.fill', 'var(--red)'], idx: ['Show Previews', 'Notification Style', 'Banners', 'Badges', 'Scheduled Summary'],
    render(K) {
      const disp = K.pref('notif.display', 'stack');
      const prev = { always: 'Always', unlocked: 'When Unlocked', never: 'Never' }[K.core('previews') || 'always'];
      const card = (k, label) => h('div.set-ndisp.tap', { onTap: () => { K.setPref('notif.display', k); K.render(); } }, h('div.set-ndisp-ph', { class: k }, h('i'), h('i'), h('i')), h('div', label), h('div.set-radio', { class: { on: disp === k } }, disp === k ? JC.icon('checkmark', { size: 14, weight: 3 }) : null));
      return [
        { h: 'Display As', rows: [{ custom: () => h('div.set-ndisps', card('count', 'Count'), card('stack', 'Stack'), card('list', 'List')) }] },
        { rows: [{ t: 'Scheduled Summary', d: K.pref('notif.summary', false) ? 'On' : 'Off', go: 'notifsummary' }, { t: 'Show Previews', d: prev, pick: { core: 'previews', options: [['always', 'Always'], ['unlocked', 'When Unlocked'], ['never', 'Never']], footer: 'Notification previews show the message text on the Lock Screen. (They’re how you cracked the passcode.)' } }, { t: 'Screen Sharing', d: K.pref('notif.share', false) ? 'Notifications On' : 'Notifications Off', tap: () => { K.setPref('notif.share', !K.pref('notif.share', false)); K.render(); } }] },
        { h: 'Siri', rows: [{ t: 'Announce Notifications', d: 'Off', alert: { title: 'Announce Notifications', message: 'Siri can read notifications through AirPods. JC’s AirPods Pro aren’t connected.' } }] },
        { h: 'Notification Style', rows: K.apps().map((id) => { const n = notifOf(K, id); return { t: K.appName(id), icon: 'app:' + id, s: n.allow ? [n.banners ? 'Banners' : null, n.sounds ? 'Sounds' : null, n.badges ? 'Badges' : null].filter(Boolean).join(', ') || 'Deliver Quietly' : 'Off', go: 'notifapp', arg: id }; }) },
      ];
    },
  };
  P.notifsummary = { title: 'Scheduled Summary', path: 'Notifications', render: (K) => [{ rows: [{ t: 'Scheduled Summary', pref: 'notif.summary', def: false, rerender: true }], f: 'Get a summary of your notifications at a time you choose.' }, K.pref('notif.summary', false) ? { h: 'Schedule', rows: [{ t: '1st Summary', d: '08:00' }, { t: '2nd Summary', d: '18:00' }] } : null] };
  P.notifapp = {
    title: (id) => JC.os.appNames[id] || id, path: 'Notifications', noSearch: true,
    render(K, id) {
      const n = notifOf(K, id);
      const set = (patch) => { setNotif(K, id, patch); K.render(); };
      const chk = (k, label, icon) => h('div.set-nalert.tap', { onTap: () => set({ [k]: !n[k] }) }, h('div.set-nalert-ph', { class: k }, JC.icon(icon, { size: 18 })), h('div', label), h('div.set-radio', { class: { on: n[k] } }, n[k] ? JC.icon('checkmark', { size: 14, weight: 3 }) : null));
      return [
        { rows: [{ t: 'Allow Notifications', on: () => n.allow, core: 'prefs', set: (v) => setNotif(K, id, { allow: v }), rerender: true }], f: id === 'messages' && !n.allow ? 'You won’t see when Teucer texts. He will text more.' : null },
        n.allow ? { h: 'Alerts', rows: [{ custom: () => h('div.set-nalerts', chk('lock', 'Lock Screen', 'lock.fill'), chk('center', 'Notification Center', 'tray.full.fill'), chk('banners', 'Banners', 'rectangle.on.rectangle')) }, n.banners ? { t: 'Banner Style', pick: { get: () => notifOf(K, id).style, set: (v) => setNotif(K, id, { style: v }), options: [['temporary', 'Temporary'], ['persistent', 'Persistent']] } } : null].filter(Boolean) } : null,
        n.allow ? { rows: [{ t: 'Sounds', on: () => n.sounds, core: 'prefs', set: (v) => setNotif(K, id, { sounds: v }) }, { t: 'Badges', on: () => n.badges, core: 'prefs', set: (v) => setNotif(K, id, { badges: v }) }] } : null,
        n.allow ? { h: 'Lock Screen Appearance', rows: [{ t: 'Show Previews', pick: { get: () => notifOf(K, id).previews, set: (v) => setNotif(K, id, { previews: v }), options: [['default', 'Always (Default)'], ['unlocked', 'When Unlocked'], ['never', 'Never']] } }, { t: 'Notification Grouping', pick: { get: () => notifOf(K, id).group, set: (v) => setNotif(K, id, { group: v }), options: [['auto', 'Automatic'], ['app', 'By App'], ['off', 'Off']] } }] } : null,
        { rows: [{ t: K.appName(id) + ' Settings', tint: true, tap: () => K.go('app', id) }] },
      ];
    },
  };

  // ═══ Face ID & Passcode ════════════════════════════════════════
  P.faceid = {
    title: 'Face ID & Passcode', icon: ['faceid', 'var(--green)'], gate: 'Face ID & Passcode', idx: ['Passcode', 'Change Passcode', 'Alternate Appearance', 'Face ID', 'Stolen Device Protection', 'Erase Data', 'Require Passcode'],
    render(K) {
      const alt = !!K.core('faceAlt');
      return [
        { h: 'Use Face ID For', rows: [
          { t: 'iPhone Unlock', pref: 'fid.unlock', def: true },
          { t: 'iTunes & App Store', pref: 'fid.store', def: true },
          { t: 'Wallet & Apple Pay', pref: 'fid.pay', def: true },
          { t: 'Password AutoFill', pref: 'fid.pw', def: true },
          { t: 'Other Apps', d: '4 Apps', go: 'fidapps' },
        ], f: 'iPhone can recognize the unique, three-dimensional features of your face to allow secure access to apps and payments.' },
        { rows: [alt ? { t: 'Reset Face ID', tint: true, tap: () => JC.ui.alert({ title: 'Reset Face ID?', message: 'Your alternate appearance will be removed. You’ll need the passcode to unlock.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onTap: () => { K.setCore('faceAlt', false); K.act('faceAlt', false); K.render(); } }] }) }
          : { t: 'Set Up an Alternate Appearance', tint: true, tap: () => enroll(K) }], f: alt ? 'An alternate appearance is set up. Face ID unlocks this iPhone for you now.' : 'In addition to continuously learning how you look, Face ID can recognize an alternate appearance.' },
        { rows: [{ t: 'Face ID with a Mask', pref: 'fid.mask', def: false }] },
        { h: 'Attention', rows: [{ t: 'Require Attention for Face ID', pref: 'fid.att', def: true }, { t: 'Attention Aware Features', pref: 'fid.aware', def: true }], f: 'iPhone will check for attention before dimming the display, expanding a notification when locked, or lowering the volume of some alerts.' },
        { rows: [
          { t: 'Turn Passcode Off', tint: true, tap: () => K.alert({ title: 'Can’t Turn Off Passcode', message: 'A passcode is required by the Northland Bank Group device policy.' }) },
          { t: 'Change Passcode', tint: true, tap: () => changePasscode(K) },
        ] },
        { rows: [{ t: 'Require Passcode', pick: { pref: 'pc.require', def: 'now', options: [['now', 'Immediately'], ['1m', 'After 1 minute'], ['5m', 'After 5 minutes']], footer: 'Shorter times are more secure.' } }, { t: 'Voice Dial', pref: 'pc.voice', def: true }], f: 'Music Voice Control is always enabled.' },
        { h: 'Allow Access When Locked', rows: [['Today View and Search', 1], ['Notification Center', 1], ['Control Center', 1], ['Lock Screen Widgets', 1], ['Live Activities', 1], ['Siri', 1], ['Reply with Message', 1], ['Home Control', 1], ['Wallet', 0], ['Return Missed Calls', 1], ['Accessories', 0]].map(([t, d]) => ({ t, pref: 'pc.locked.' + t, def: !!d })) },
        { rows: [{ t: 'Stolen Device Protection', d: K.pref('sdp', false) ? 'On' : 'Off', go: 'sdp' }] },
        { rows: [{ t: 'Erase Data', pref: 'pc.erase', def: false, confirm: (ok) => JC.ui.alert({ title: 'Erase Data?', message: 'All data on this iPhone will be erased after 10 failed passcode attempts.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Enable', style: 'destructive', onTap: ok }] }) }], f: 'Erase all data on this iPhone after 10 failed passcode attempts. Data protection is enabled.' },
      ];
    },
  };
  P.fidapps = { title: 'Other Apps', path: 'Face ID & Passcode', noSearch: true, render: (K) => [{ rows: ['wallet', 'notes', 'stocks', 'swift'].map((id) => ({ t: K.appName(id), icon: 'app:' + id, pref: 'fid.app.' + id, def: true })), f: 'These apps have requested to use Face ID for authentication.' }] };
  P.sdp = {
    title: 'Stolen Device Protection', path: 'Face ID & Passcode', noSearch: true,
    render: (K) => [
      h('div.set-hero', h('div.set-hero-ic', { style: { background: 'var(--green)' } }, JC.icon('lock.shield', { size: 30 })), h('div.set-hero-t', 'Stolen Device Protection'), h('div.set-hero-s', 'When your iPhone is away from familiar locations, Stolen Device Protection requires Face ID for some actions, and adds a security delay before changing your passcode or Apple Account password.')),
      { rows: [{ t: K.pref('sdp', false) ? 'Turn Off Protection' : 'Turn On Protection', tint: true, tap: () => {
        if (!K.core('faceAlt')) { K.alert({ title: 'Face ID Required', message: 'Set up Face ID to use Stolen Device Protection. Face ID doesn’t recognize you yet.' }); return; }
        K.setPref('sdp', !K.pref('sdp', false));
        K.toast(K.pref('sdp', false) ? 'Stolen Device Protection on' : 'Stolen Device Protection off', 'lock.shield');
        K.render();
      } }], f: 'Require Security Delay: Away from Familiar Locations. (Every location is unfamiliar tonight.)' },
    ],
  };
  function changePasscode(K) {
    let step = 'old';
    let first = '';
    let kp;
    const page = JC.ui.page({
      title: 'Change Passcode', bg: 'grouped', cls: 'set-page set-gate',
      left: [JC.ui.navBtn({ text: 'Cancel', onTap: () => K.back() })],
      content: () => {
        kp = K.keypad({
          title: 'Enter your old passcode',
          onCode: (c, ctl) => {
            if (step === 'old') {
              if (c !== (K.core('passcode') || JC.world.passcode.code)) { ctl.wrong('Wrong passcode. Try again.'); return; }
              step = 'new';
              ctl.reset('Enter your new passcode', 'Passcode Options');
              const sub = kp.el.querySelector('.set-kp-sub');
              sub.classList.add('tap', 'set-link');
              sub.onclick = () => JC.ui.actionSheet({ actions: [{ text: 'Custom Alphanumeric Code' }, { text: 'Custom Numeric Code' }, { text: '4-Digit Numeric Code' }] }).then((i) => { if (i >= 0) K.alert({ title: 'Not Allowed', message: 'Your device management profile requires a 6-digit passcode.' }); });
              return;
            }
            if (step === 'new') {
              if (c === (K.core('passcode') || JC.world.passcode.code)) { ctl.wrong('Enter a different passcode. Cannot reuse the same passcode.'); return; }
              const weak = /^(\d)\1{5}$/.test(c) || c === '123456' || c === '654321';
              const go = () => { first = c; step = 'verify'; ctl.reset('Verify your new passcode', ''); kp.el.querySelector('.set-kp-sub').onclick = null; };
              if (weak) { JC.ui.alert({ title: 'This passcode can be easily guessed', buttons: [{ text: 'Use Anyway', onTap: go }, { text: 'Change Passcode', style: 'cancel', onTap: () => ctl.reset() }] }); return; }
              go();
              return;
            }
            if (step === 'verify') {
              if (c !== first) { step = 'new'; ctl.reset('Enter your new passcode', ''); ctl.wrong('Passcodes did not match. Try again.'); return; }
              K.setCore('passcode', c);
              K.act('passcode', c);
              K.back();
              setTimeout(() => K.alert({ title: 'Passcode Changed', message: 'Your new passcode is ' + c.split('').join(' ') + '.\nDon’t forget it — Childe won’t know it either.' }), 450);
            }
          },
        });
        return [kp.el];
      },
      onClose: () => kp && kp.el._off && kp.el._off(),
    });
    K.nav.push(page);
  }
  function enroll(K) {
    let stage = 0;
    const sh = JC.ui.sheet({
      title: '', detent: 'large', left: { text: 'Cancel' }, cls: 'set-enroll',
      content: () => {
        const ring = h('div.set-fring', Array.from({ length: 60 }, (v, i) => h('i', { style: { transform: `rotate(${i * 6}deg) translateY(-104px)` } })), h('div.set-fface', JC.icon('faceid', { size: 92, weight: 1.6 })));
        const t = h('div.set-en-t', 'How to Set Up Face ID');
        const s = h('div.set-en-s', 'First, position your face in the camera frame. Then move your head in a circle to show all the angles of your face.');
        const btn = h('div.set-en-btn.tap', 'Get Started');
        const scan = (next) => {
          btn.classList.add('busy');
          btn.textContent = 'Move your head slowly to complete the circle.';
          const ticks = Array.from(ring.querySelectorAll('i'));
          ticks.forEach((tk) => tk.classList.remove('on'));
          let i = 0;
          const iv = setInterval(() => { if (!ring.isConnected) { clearInterval(iv); return; } if (ticks[i]) ticks[i].classList.add('on'); i++; if (i % 6 === 0) JC.audio.haptic(4); if (i > 60) { clearInterval(iv); btn.classList.remove('busy'); JC.audio.play('success'); next(); } }, 42);
        };
        btn.onclick = () => {
          if (btn.classList.contains('busy')) return;
          if (stage === 0) { stage = 1; t.textContent = 'Move your head slowly'; s.textContent = 'Move your head slowly to complete the circle.'; scan(() => { stage = 2; t.textContent = 'First Face ID scan complete.'; s.textContent = 'Now move your head slowly to complete the circle a second time.'; btn.textContent = 'Continue'; }); }
          else if (stage === 2) { stage = 3; scan(() => { stage = 4; t.textContent = 'Face ID is now set up.'; s.textContent = 'Face ID is now set up for an alternate appearance. iPhone will unlock when it sees you.'; ring.classList.add('done'); btn.textContent = 'Done'; }); }
          else if (stage === 4) { K.setCore('faceAlt', true); K.act('faceAlt', true); sh.close(); K.render(); K.toast('Face ID is set up', 'checkmark.circle.fill'); }
        };
        btn.__tap = true;
        return [h('div.set-en', ring, t, s, btn)];
      },
    });
  }
  SK.enroll = enroll;
  SK.wpGallery = wpGallery;
  SK.FOCI = FOCI;
})();
