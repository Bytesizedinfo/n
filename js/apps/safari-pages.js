/* Safari's fake web (JC.web): a search engine (Irminsul) that answers any query, ~25 fictional Teyvat sites
   and a generator for anything else. Every page is built with JC.h; links are <a data-href> and are
   intercepted by Safari. Facts: docs/STORY.md. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;
  const enc = encodeURIComponent;
  const web = {};
  JC.web = web;

  // ── helpers ──────────────────────────────────────────────────────────────
  const A = (href, ...kids) => h('a.w-a', { data: { href } }, ...kids);
  const Btn = (text, onTap, cls) => h('button.w-btn', { class: cls, onTap }, text);
  const art = (id, cls) => JC.art.el(id, { cls: 'w-img' + (cls ? ' ' + cls : '') });
  const SEARCH = (q) => 'https://irminsul.net/search?q=' + enc(q).replace(/%20/g, '+');
  const slug = (s) => String(s).toLowerCase().replace(/['’"“”?!.,:;()]/g, '').replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'page';
  const unslug = (s) => decodeURIComponent(String(s)).replace(/[-_+]+/g, ' ').trim();
  const title = (s) => String(s).replace(/\b\w/g, (c) => c.toUpperCase());
  const hash = (str) => { let x = 2166136261; str = String(str); for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
  const pick = (arr, seed, k) => arr[(hash(seed + ':' + (k || 0))) % arr.length];
  const dateStr = (s) => { const t = typeof s === 'number' ? s : JC.time.parse(s); return JC.util.fmtDate(t, 'medium'); };
  const now = () => JC.time.now();
  const para = (arr) => arr.map((t) => (t instanceof Node ? t : h('p', t)));

  web.SEARCH = SEARCH;
  /** navigate the Safari tab that contains `el` */
  const goFrom = (el, url) => el.dispatchEvent(new CustomEvent('webgo', { bubbles: true, detail: url }));
  web.go = goFrom;
  web.slug = slug;

  // per-session page state (carts, votes, …) and saved web state (sign-ins survive a relaunch)
  const mem = {};
  const state = (k, d) => (mem[k] = mem[k] || Object.assign({}, d || {}));
  const saved = () => { const d = JC.state.d; d.web = d.web || { login: {} }; d.web.login = d.web.login || {}; return d.web; };
  web.signedIn = (key) => !!saved().login[key];
  web.signOut = (key) => { delete saved().login[key]; JC.state.save(); };
  const flags = () => (JC.state.d && JC.state.d.flags) || {};

  // ── sites registry ──
  const SITES = {};
  function site(host, def) { SITES[host] = def; def.host = host; return def; }
  web.sites = SITES;

  /** favicon spec for a host */
  web.icon = (host) => {
    host = String(host || '').replace(/^www\./, '');
    const s = SITES[host] || SITES[host.split('.').slice(-2).join('.')];
    if (s && s.icon) return s.icon;
    const c = ['#5e5ce6', '#ff9500', '#34c759', '#ff2d55', '#0a84ff', '#af52de', '#30b0c7', '#a2845e'][hash(host) % 8];
    return { letter: (host.replace(/^(www|m)\./, '')[0] || '?').toUpperCase(), bg: c, fg: '#fff' };
  };
  web.siteName = (host) => { host = String(host || '').replace(/^www\./, ''); const s = SITES[host]; return s ? s.name : host; };

  /** normalize address-bar input into a URL */
  web.normalize = (input) => {
    let s = String(input || '').trim();
    if (!s) return 'about:start';
    if (/^(about|app):/.test(s)) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/i.test(s) && !/\s/.test(s)) return 'https://' + s;
    return SEARCH(s);
  };
  function parse(url) {
    try {
      const u = new URL(url);
      return { url: u.href, host: u.hostname.replace(/^www\./, ''), path: (u.pathname.replace(/\/+$/, '') || '/'), q: u.searchParams, hash: u.hash };
    } catch (e) { return null; }
  }

  /** load(url) → { url, host, title, node, reader, theme } */
  web.load = (url, env) => {
    env = env || {};
    if (url === 'about:start' || url === 'about:blank') return { url, host: '', title: 'Start Page', start: true };
    const P = parse(url);
    if (!P) return errorPage(url, 'Safari can’t open the page because the address is invalid.');
    const ctx = Object.assign({ url: P.url, host: P.host, path: P.path, q: P.q, hash: P.hash }, env);
    const s = SITES[P.host];
    let spec = null;
    if (s) {
      const fn = s.pages && (s.pages[P.path] || matchPattern(s, P.path));
      try { spec = fn ? fn(ctx, P.path) : s.notFound ? s.notFound(ctx) : notFound(s, ctx); } catch (e) { console.error('web page failed', url, e); spec = errorPage(url, 'This page couldn’t be displayed.'); }
    } else spec = parked(ctx);
    spec.url = P.url;
    spec.host = P.host;
    if (!spec.title) spec.title = s ? s.name : P.host;
    if (s && !spec.node.classList.contains('w-page')) spec.node.classList.add('w-page');
    return spec;
  };
  function matchPattern(s, path) {
    if (!s.patterns) return null;
    for (const [re, fn] of s.patterns) { const m = re.exec(path); if (m) return (ctx) => fn(ctx, m); }
    return null;
  }
  function page(cls, title, kids, o) {
    o = o || {};
    return Object.assign({ title, node: h('div.w-page', { class: cls }, kids), reader: o.reader || null }, o);
  }
  function errorPage(url, msg) {
    return { title: 'Cannot Open Page', node: h('div.w-page.w-err', h('div.w-err-ic', JC.icon('exclamationmark.triangle.fill', { size: 46 })), h('div.w-err-t', 'Safari Can’t Open the Page'), h('div.w-err-s', msg), A(SEARCH(String(url).replace(/^https?:\/\//, '')), 'Search Wavesearch instead')) };
  }
  function notFound(s, ctx) {
    return page('w-404', 'Page not found', [h('div.w-404-code', '404'), h('div.w-404-t', 'We couldn’t find that page.'), h('div.w-404-s', ctx.path + ' isn’t on ' + s.name + '.'), A('https://' + ctx.host + '/', 'Go to ' + s.name + ' home'), ' · ', A(SEARCH(unslug(ctx.path.split('/').pop())), 'Search for it')]);
  }
  function parked(ctx) {
    const host = ctx.host;
    const words = host.replace(/\.(com|net|org|ly|sn|fon|ina|io|app|co|info|wiki|games|market)$/g, '').split(/[.\-_]/).filter((w) => w && w !== 'www');
    const label = words.join(' ') || host;
    const real = /^(google|baidu|bing|yahoo|youtube|facebook|instagram|twitter|x|tiktok|weibo|wechat|apple|amazon|taobao|wikipedia|reddit|netflix|openai|chatgpt)\./.test(host);
    if (real) {
      return page('w-err', 'Cannot Connect', [h('div.w-err-ic', JC.icon('wifi.slash', { size: 46 })), h('div.w-err-t', 'Safari Can’t Connect to the Server'), h('div.w-err-s', 'Safari can’t open “' + host + '” because the server isn’t responding from this network. Everyone here uses Wavesearch anyway.'), A(SEARCH(label), 'Search Wavesearch for “' + label + '”')]);
    }
    return page('w-parked', host, [
      h('div.w-pk-top', h('div.w-pk-dom', host), h('div.w-pk-sale', 'This domain may be for sale')),
      h('div.w-pk-h', 'Related searches'),
      h('div.w-pk-links', [label, label + ' price', label + ' near me', 'best ' + label, label + ' reviews', 'what is ' + label].map((t) => A(SEARCH(t), h('span', t), JC.icon('chevron.right', { size: 14 })))),
      h('div.w-pk-foot', '© 2026 Jade Registry (Liyue) Ltd. · ', A(SEARCH('jade registry domains'), 'Buy this domain'), ' · ', A('https://irminsul.net/', 'Privacy')),
    ]);
  }

  // ── shared templates ─────────────────────────────────────────────────────
  /** news/article: { brand, cls, kicker, title, dek, by, date, hero, caption, paras, related:[[url,title]], comments } */
  function article(o, chrome) {
    const body = h('div.w-article',
      o.kicker ? h('div.w-kicker', o.kicker) : null,
      h('h1.w-h1', o.title),
      o.dek ? h('div.w-dek', o.dek) : null,
      h('div.w-byline', o.by ? h('b', o.by) : null, o.date ? h('span', (o.by ? ' · ' : '') + o.date) : null, o.read ? h('span', ' · ' + o.read) : null),
      o.hero ? h('figure.w-fig', art(o.hero, 'w-hero'), o.caption ? h('figcaption', o.caption) : null) : null,
      h('div.w-body', para(o.paras || [])),
      o.after || null,
      o.related && o.related.length ? h('div.w-related', h('div.w-rel-h', o.relTitle || 'Related'), o.related.map((r) => A(r[0], h('div.w-rel-i', r[2] ? art(r[2], 'w-rel-img') : null, h('span', r[1]))))) : null,
      o.comments ? comments(o.comments, o.commentKey || o.title) : null);
    const node = chrome ? chrome(body) : body;
    return { title: o.title + (o.brand ? ' — ' + o.brand : ''), node: h('div.w-page', { class: o.cls }, node), reader: { title: o.title, byline: [o.by, o.date].filter(Boolean).join(' · '), site: o.brand, paras: (o.paras || []).filter((p) => typeof p === 'string'), hero: o.hero } };
  }
  function comments(list, key) {
    const st = state('cm:' + key, { mine: [] });
    const box = h('div.w-comments');
    const draw = () => {
      box.innerHTML = '';
      box.append(h('div.w-cm-h', (list.length + st.mine.length) + ' Comments'));
      list.concat(st.mine).forEach((c) => box.append(h('div.w-cm', h('div.w-cm-av', { style: { background: 'hsl(' + (hash(c[0]) % 360) + ',55%,58%)' } }, c[0][0].toUpperCase()), h('div.w-cm-m', h('div.w-cm-by', c[0], h('span', ' · ' + (c[2] || '2d'))), h('div.w-cm-t', c[1]), h('div.w-cm-acts', h('span.tap', { onTap: (e) => { e.currentTarget.classList.toggle('on'); e.currentTarget.textContent = e.currentTarget.classList.contains('on') ? '♥ Liked' : '♡ Like'; } }, '♡ Like'), h('span.tap', { onTap: () => JC.ui.toast('Replies are for members. Sign in to reply.') }, 'Reply'))))));
      const input = JC.ui.input({ placeholder: 'Add a comment…', cls: 'w-cm-in', enterkey: 'send', onSubmit: (v) => { v = v.trim(); if (!v) return; JC.ui.alert({ title: 'Post as “tartaglia”?', message: 'Your comment will be public, under Childe’s account. Ekaterina reads everything he posts. So does Scaramouche.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Post', style: 'destructive' }] }).then((r) => { if (r.index === 1) { st.mine.push(['tartaglia', v, 'now']); draw(); JC.story.act('comment', { text: v, page: key, web: true }); } }); } });
      box.append(h('div.w-cm-new', input, Btn('Post', () => input.dispatchEvent(new CustomEvent('kbreturn')))));
    };
    draw();
    return box;
  }
  function loginForm(o) {
    // o: { brand, color, sub, user, key, hint, onFail(tries), lockedText, check(user, pw) → true on success, onSuccess(box) }
    const st = state('login:' + o.key, { tries: 0 });
    const box = h('div.w-login', { style: { '--brand': o.color } });
    const draw = () => {
      box.innerHTML = '';
      box.append(h('div.w-login-logo', o.logo || o.brand));
      if (o.sub) box.append(h('div.w-login-sub', o.sub));
      if (st.tries >= (o.max || 3)) {
        box.append(h('div.w-login-locked', JC.icon('lock.fill', { size: 22 }), h('div', h('b', 'Account locked'), h('span', o.lockedText || 'Too many attempts. Contact your administrator.'))));
        return;
      }
      const user = JC.ui.input({ value: o.user || '', placeholder: o.userLabel || 'Username', cap: 'none', cls: 'w-input' });
      const pw = JC.ui.input({ placeholder: 'Password', cap: 'none', cls: 'w-input', type: 'password', onSubmit: () => submit() });
      const err = st.err ? h('div.w-login-err', st.err) : null;
      if (err) box.append(err);
      box.append(h('label.w-lbl', o.userLabel || 'Username'), user, h('label.w-lbl', 'Password'), pw,
        Btn('Sign In', () => submit(), 'w-btn-brand'));
      if (o.faceId !== false) box.append(Btn('Sign in with Face ID', () => { JC.ui.toast('Face ID: face not recognized', { icon: 'exclamationmark.triangle.fill' }); }, 'w-btn-ghost'));
      box.append(
        h('div.w-login-links', h('span.tap', { onTap: () => JC.ui.alert({ title: 'Reset Password', message: o.resetText || 'A reset link has been sent to the email on file.', buttons: [{ text: 'OK' }] }) }, 'Forgot password?'), o.help ? h('span.tap', { onTap: () => JC.ui.alert({ title: 'Help', message: o.help, buttons: [{ text: 'OK' }] }) }, 'Need help?') : null));
      function submit() {
        if (o.check && o.check(user.value.trim(), pw.value)) {
          st.tries = 0; st.err = null;
          saved().login[o.key] = true;
          JC.state.save();
          JC.audio.play('success');
          JC.story.act('login', { site: o.key, user: user.value.trim() });
          if (o.onSuccess) o.onSuccess(box);
          return;
        }
        st.tries++;
        const left = (o.max || 3) - st.tries;
        st.err = left > 0 ? 'Incorrect password. ' + left + ' attempt' + (left === 1 ? '' : 's') + ' remaining.' : null;
        if (pw.value === JC.world.passcode.code) st.err = 'That looks like a phone passcode. This is not a phone. ' + (left > 0 ? left + ' attempt' + (left === 1 ? '' : 's') + ' remaining.' : '');
        if (o.onFail) o.onFail(st.tries);
        JC.audio.play('error');
        draw();
      }
    };
    draw();
    return box;
  }
  const foot = (name, links) => h('div.w-foot', h('div.w-foot-links', (links || []).map((l) => A(l[0], l[1]))), h('div.w-foot-c', '© 2026 ' + name));

  // ═══ Irminsul (search) ═══════════════════════════════════════════════════
  const IR_ICON = { letter: '❦', bg: 'linear-gradient(135deg,#2f7d6d,#62c3a6)', fg: '#fff' };
  const HERALD = 'https://liyueherald.ly';
  const ARCH = 'https://archives.ly';
  const WIKI_URL = (k) => 'https://akasha.wiki/wiki/' + k;
  const ASKQ = (k) => 'https://askteyvat.com/q/' + k;
  const TELLING = [
    { re: /rex lapis.*(photo|picture|look|face|real|human)|(photo|picture).*rex lapis|what did rex lapis look like|morax.*(photo|human)/i, results: [
      [ARCH + '/photos/1926-founding', 'PH-1926-0417 · “The Consultant”, Liyue Exchange founding 1926 — Liyue Archives', 'Silver gelatin print. A gentleman in a long coat stands at the centre of the Qixing at the founding of the Liyue Exchange, 1926. Catalogue note: “Identified by the photographer as Rex Lapis.”'],
      [HERALD + '/2026/10/01/rex-lapis', 'Liyue mourns: Qixing announce the death of Rex Lapis — The Liyue Herald', 'The only known photograph of the Geo Archon in human form will be displayed at the Rite of Parting.'],
      [WIKI_URL('Rex_Lapis'), 'Rex Lapis — Akasha', 'Rex Lapis (Morax) is the Geo Archon, founder and protector of Liyue Harbor. Said to appear among mortals in human form…'],
      [ASKQ('has-anyone-actually-seen-rex-lapis-in-human-form'), 'Has anyone actually seen Rex Lapis in human form? — AskTeyvat', '“My grandmother swore he bought tea from her stall and didn’t pay.” — 412 answers'],
    ], ask: ['Did Rex Lapis really walk among people?', 'Why is there only one photograph of Rex Lapis?', 'Is it true Rex Lapis never carried money?'] },
    { re: /osial/i, results: [
      [WIKI_URL('Osial'), 'Osial — Akasha', 'Osial, Overlord of the Vortex, is an ancient sea god of Liyue legend, said to be sealed beneath Guyun Stone Forest by Rex Lapis.'],
      [HERALD + '/2026/10/15/guyun-tremors', 'Fishermen report “humming” near Guyun Stone Forest — The Liyue Herald', 'Northland survey boats have been seen among the pillars. The Millelith say there is nothing to worry about.'],
      ['https://steambird.fon/world/project-o', '“Project O”: what is Northland Bank building in Liyue? — The Steambird', 'Northland declines to comment on a project listed in filings only as “O”.'],
      [ASKQ('is-osial-real'), 'Is Osial real or just something grandmas say? — AskTeyvat', '“My grandpa says the sea goes quiet before it wakes up. The sea has been quiet all week.” — 96 answers'],
    ], ask: ['Where is Osial sealed?', 'What would happen if Osial woke up?', 'Who sealed Osial?'] },
    { re: /glaze lil(y|ies)/i, snippet: ['Glaze lily: a flower of remembrance in Liyue', 'Glaze lilies only bloom where they are left alone, and are said to have been the favourite flower of Guizhong, an old friend of Rex Lapis. They are given in memory of someone, or to someone you hope remembers you.', WIKI_URL('Glaze_lily')], results: [
      [WIKI_URL('Glaze_lily'), 'Glaze lily — Akasha', 'A rare flower of Liyue that blooms in quiet places, associated with the god Guizhong.'],
      [HERALD + '/2026/10/05/glaze-lily-season', 'Glaze lilies bloom late this year — The Liyue Herald', 'Florists on Feiyun Slope say demand has tripled since the Founder’s death.'],
      ['https://feiyun.ly/search?q=glaze+lily', 'Glaze lilies — Feiyun Market', 'Same-day delivery across Liyue Harbor. Wangsheng Funeral Parlor accepts flowers for the Rite of Parting.'],
    ], ask: ['What does it mean to give someone glaze lilies?', 'Are glaze lilies for funerals?', 'Who was Guizhong?'] },
    { re: /guizhong|celadon|tea ?set/i, results: [
      ['https://feiyun.ly/item/lot_teaset', 'Lot 1016 · Guizhong-era celadon tea set (7 pieces) — Feiyun Market', 'Auction ends Sat 00:30. Current bid ℳ11,200. Inscription on the base of the pot, partly worn.'],
      [WIKI_URL('Guizhong'), 'Guizhong — Akasha', 'Guizhong, the Goddess of Dust, was a god of ancient Liyue and a close friend of Rex Lapis.'],
      [ASKQ('how-much-is-a-guizhong-era-tea-set-worth'), 'How much is a Guizhong-era tea set worth? — AskTeyvat', '“Depends. If it’s real, more than your house. If the seller is in a hurry, ask why.” — 31 answers'],
    ], ask: ['How do you tell if Guizhong-era celadon is real?', 'What does “for Morax” mean on old ceramics?', 'Who collects ancient Liyue tea ware?'] },
    { re: /coffin|how long can (a )?person (stay|hide|lie)|hid(e|ing) in a funeral/i, results: [
      [ASKQ('how-long-can-a-person-stay-in-a-coffin'), 'How long can a person stay in a coffin? (asking for a friend) — AskTeyvat', '“Depends on the coffin. Ours have air holes now. Also a cupholder. Book a viewing!” — wangsheng_hutao'],
      ['https://wangsheng.ly/coffins', 'Coffins — Wangsheng Funeral Parlor', 'Autumn sale: second coffin half price. Ask inside.'],
    ], ask: ['Are coffins soundproof?', 'Can you rent a coffin?', 'Does Wangsheng do discounts for the living?'] },
    { re: /siblings.*(work|job)|what (i|you) do for work|tell.*(family|siblings).*(job|work)|toy (company|factory|sales)/i, results: [
      [ASKQ('how-do-i-tell-my-little-siblings-what-i-really-do-for-work'), 'How do I tell my little siblings what I really do for work? — AskTeyvat', '“They think I sell toys. It has been five years. I am now very good at describing toys.” — 77 answers'],
      ['https://wishbuzz.com/life/signs-you-are-the-favourite-big-sibling', '14 Signs You’re the Favourite Big Sibling (Even Though You’re Never Home) — Wishbuzz', 'They save their best drawings for you. They tell everyone at school about your job.'],
    ], ask: ['Is it okay to lie to kids to protect them?', 'At what age should kids know the truth?', 'What if my sister already knows?'] },
    { re: /pay(ing)? for every dinner|always (pay|pays)|(he|friend) never (pays|carries)|forgot (his )?wallet/i, results: [
      [ASKQ('is-it-normal-to-want-to-pay-for-every-dinner'), 'Is it normal to want to pay for every dinner? — AskTeyvat', '“If you want to, and he lets you, that’s not a bill. That’s a ritual.” — 158 answers'],
      ['https://wishbuzz.com/life/he-forgot-his-wallet-again', 'He “Forgot His Wallet” Again: 9 Things It Might Actually Mean — Wishbuzz', '#4: He likes that you keep coming back.'],
    ], ask: ['What does it mean when someone never pays?', 'Is paying for someone a love language?', 'How do you ask someone to dinner without it being a date?'] },
    { re: /lost phone|found (a |an |his |someone'?s )?(phone|iphone)|phone (found|left) (on|at)/i, results: [
      ['https://millelith.ly/lost-and-found', 'Lost & Found — The Millelith', 'Found property can be handed in at any Millelith post, 24 hours. Phones: bring the device as you found it.'],
      [HERALD + '/life/found-a-lost-phone', 'Found a Lost Phone? Here’s Exactly What to Do — The Liyue Herald', 'It’s someone’s whole life in your pocket. Here’s how to get it back to them fast.'],
      ['https://harborride.ly/help/lost-items', 'Lost or found an item? — Harbor Ride Help', 'Report it from the trip in the app. We notify the rider and the driver.'],
    ], ask: ['Should I answer a lost phone if it rings?', 'Is it illegal to keep a phone you found?', 'Can the owner track the phone?'] },
    { re: /\bla ?71[12]\b|flight status|liyue air|zapolyarny.*flight/i, results: [
      ['https://liyueair.ly/flight/LA711', 'LA 711 · Zapolyarny → Liyue Harbor — Flight status — Liyue Air', 'Live status, gate and arrival time.'],
      ['https://liyueair.ly/flight/LA712', 'LA 712 · Liyue Harbor → Zapolyarny — Flight status — Liyue Air', 'Monday departure, check-in from 11:30.'],
      ['https://liyueair.ly/help/unaccompanied-minors', 'Unaccompanied minor service — Liyue Air', 'Children are released only to the adult named on the booking.'],
    ], ask: ['How do I change who collects an unaccompanied minor?', 'Is LA 711 on time?', 'Where do international arrivals come out?'] },
    { re: /abyss order|\baether\b|blond(e)? (boy|man).*scarf|traveler.*brother/i, results: [
      [WIKI_URL('Abyss_Order'), 'Abyss Order — Akasha', 'A secretive organisation of uncertain aims, linked to disturbances in the Chasm and elsewhere.'],
      ['https://millelith.ly/missing/aether', 'MISSING: Aether — The Millelith', 'Last seen: unknown. Reported by his sister. Any information to the Millelith.'],
      [ASKQ('has-anyone-seen-a-blond-boy-with-a-long-braid'), 'Has anyone seen a blond boy with a long braid and a white scarf? — AskTeyvat', '“My sister has been looking for him for a long time. Please.” — asked by traveler.l'],
    ], ask: ['Is the Abyss Order real?', 'What happened at the Chasm?', 'Who leads the Abyss Order?'] },
    { re: /\bskirk\b/i, results: [
      [SEARCH('skirt'), 'Did you mean: skirt', 'Showing results for skirt. Search instead for skirk.'],
    ], ask: ['What does “skirk” mean?', 'Is skirk a name?', 'Why does this word return nothing?'] },
    { re: /yun ?jin|divine damsel|heyu|opera/i, results: [
      ['https://heyu.ly/troupe', 'Yun Jin Troupe at Heyu Tea House — Tickets & Season', '“The Divine Damsel” — Saturday matinee 15:00 (sold out). Evening performances Fri–Sun.'],
      [HERALD + '/2026/10/12/yun-jin-divine-damsel', 'Review: Yun Jin’s “Divine Damsel” is the season’s finest — The Liyue Herald', 'A second act that silences the room.'],
      [WIKI_URL('Yun_Jin'), 'Yun Jin — Akasha', 'Yun Jin is a Liyue opera singer and playwright, leader of the Yun Jin Troupe.'],
    ], ask: ['What is the Divine Damsel about?', 'How long is a Liyue opera?', 'Can you buy returns for sold-out shows?'] },
  ];
  const KNOWN = [
    { re: /rex lapis|morax|geo archon/i, wiki: 'Rex_Lapis' },
    { re: /rite of parting|funeral.*(sunday|founder)|founder'?s lanterns/i, wiki: 'Rite_of_Parting', site: [HERALD + '/2026/10/16/rite-of-parting-sunday', 'Rite of Parting: what to know for Sunday — The Liyue Herald'], place: 'yujing' },
    { re: /liyue archives|archives\.ly/i, site: [ARCH + '/', 'Liyue Archives — Heritage collections of the Qixing'] },
    { re: /northland bank|northland\b/i, wiki: 'Northland_Bank', site: ['https://northland.sn/liyue', 'Northland Bank · Liyue Branch'], place: 'northland' },
    { re: /intranet|nb-liyue/i, site: ['https://intranet.northland.sn/', 'Northland Intranet — Sign in'] },
    { re: /fatui/i, wiki: 'Fatui' },
    { re: /harbinger|tartaglia|childe|signora|pantalone|dottore|scaramouche|pulcinella/i, wiki: 'Harbingers', site: ['https://northland.sn/about/board', 'The Executive Board — Northland Bank Group'] },
    { re: /guyun|stone forest/i, wiki: 'Guyun_Stone_Forest', place: 'guyun' },
    { re: /wangsheng|hu tao|funeral parlou?r/i, wiki: 'Wangsheng_Funeral_Parlor', site: ['https://wangsheng.ly/', 'Wangsheng Funeral Parlor — Since the Archon War'], place: 'wangsheng' },
    { re: /zhongli/i, site: ['https://wangsheng.ly/staff', 'Our people — Wangsheng Funeral Parlor'] },
    { re: /qixing|jade chamber|ningguang|tianquan/i, wiki: 'Liyue_Qixing', site: ['https://jadechamber.ly/', 'The Jade Chamber — Office of the Tianquan'], place: 'jade' },
    { re: /millelith|police/i, site: ['https://millelith.ly/', 'The Millelith — Liyue Harbor'], place: 'millelith' },
    { re: /crux|beidou|alcor/i, wiki: 'The_Crux', site: ['https://crux.ly/', 'The Crux Fleet — Captain Beidou'], place: 'alcor' },
    { re: /wanmin|xiangling/i, site: ['https://wanmingo.ly/r/wanmin', 'Wanmin Restaurant — order on Wanmin Go'], place: 'wanmin-rest' },
    { re: /liuli pavilion/i, place: 'liuli' },
    { re: /pier 7|pier seven/i, place: 'pier7' },
    { re: /third.?round|knockout/i, place: 'third-round' },
    { re: /yujing terrace/i, place: 'yujing' },
    { re: /golden house/i, wiki: 'Golden_House', place: 'golden-house' },
    { re: /snezhnaya|zapolyarny/i, wiki: 'Snezhnaya' },
    { re: /morepesok/i, wiki: 'Morepesok' },
    { re: /liyue harbou?r|\bliyue\b/i, wiki: 'Liyue_Harbor' },
    { re: /bluefin|tuna/i, wiki: 'Bluefin_tuna' },
    { re: /steambird|fontaine/i, site: ['https://steambird.fon/', 'The Steambird — Fontaine’s newspaper of record'] },
    { re: /ripple/i, site: ['https://ripple.ly/', 'Ripple — share the moment'] },
    { re: /reel rush/i, site: ['https://reelrush.games/', 'Reel Rush — the fishing game'] },
    { re: /mingyun|glacier guardians|frost fortress/i, site: ['https://mingyun.ly/frost-fortress', 'Glacier Guardians Frost Fortress — Mingyun Toys & Games'], place: 'mingyun' },
    { re: /weather|rain|storm|forecast|typhoon/i, weather: true },
    { re: /\bnews\b|herald/i, site: [HERALD + '/', 'The Liyue Herald — News from the harbor'] },
  ];
  function calcAnswer(q) {
    const s = q.replace(/\s+/g, '').replace(/x/gi, '*').replace(/÷/g, '/').replace(/×/g, '*');
    if (!/^[\d.+\-*/()%^]+$/.test(s) || !/[+\-*/^%]/.test(s)) return null;
    try { const v = Function('"use strict";return (' + s.replace(/\^/g, '**') + ')')(); return isFinite(v) ? Math.round(v * 1e8) / 1e8 : null; } catch (e) { return null; }
  }
  function genericResults(q) {
    const sl = slug(q);
    const T = title(q);
    const out = [
      [ASKQ(sl), T + '? — AskTeyvat', (9 + hash(q) % 300) + ' answers · “' + pick(['Honestly? Just ask them.', 'Had the same question last year. Here’s what worked.', 'Short answer: it depends. Long answer below.', 'Everyone in Liyue overthinks this. Don’t.'], q) + '”'],
      [WIKI_URL(T.replace(/\s+/g, '_')), T + ' — Akasha', T + ' may refer to several topics. This disambiguation page lists articles associated with the title ' + T + '.'],
      ['https://wishbuzz.com/life/' + sl, (5 + hash(q) % 15) + ' Things Nobody Tells You About ' + T + ' — Wishbuzz', 'Number ' + (3 + hash(q) % 5) + ' changed how we think about ' + q.toLowerCase() + ' forever.'],
      [HERALD + '/search?q=' + enc(q), T + ' — latest coverage from The Liyue Herald', 'News, opinion and analysis about ' + q.toLowerCase() + ' from the harbor and beyond.'],
    ];
    if (/^(how|what|why|should|is|can|do)\b/i.test(q)) out.splice(2, 0, [HERALD + '/life/' + sl, T + ' — Life & Style, The Liyue Herald', 'Our columnist answers the question everyone in the harbor is too embarrassed to ask.']);
    return out;
  }
  function wsChrome(q, tab, content) {
    const input = JC.ui.input({ value: q, placeholder: 'Search Irminsul', enterkey: 'search', cap: 'none', cls: 'w-ws-in', onSubmit: (v) => { if (v.trim()) goFrom(input, SEARCH(v.trim())); } });
    return h('div.w-ws',
      h('div.w-ws-top', A('https://irminsul.net/', h('span.w-ws-logo.small', wave(), 'Irminsul')),
        h('div.w-ws-box', JC.icon('magnifyingglass', { size: 16, weight: 2.2 }), input, h('span.w-ws-x.tap', { onTap: () => { input.value = ''; input.focus(); } }, JC.icon('xmark.circle.fill', { size: 16 })))),
      h('div.w-ws-tabs', [['All', 'search'], ['Images', 'images'], ['News', 'news'], ['Maps', 'maps'], ['Videos', 'videos']].map(([t, k]) => A('https://irminsul.net/' + k + '?q=' + enc(q), h('span', { class: { on: tab === k } }, t)))),
      content);
  }
  /** the Irminsul mark: a small branching tree */
  function wave() { const s = document.createElement('span'); s.className = 'w-ws-wave'; s.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><defs><linearGradient id="irg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#62c3a6"/><stop offset="1" stop-color="#2f7d6d"/></linearGradient></defs><path d="M12 22V11M12 15l-5-4M12 13l5-4M7 11 4 7M17 9l3-4M12 11V5" fill="none" stroke="url(#irg)" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="4" r="2" fill="#62c3a6"/><circle cx="4" cy="6.5" r="1.6" fill="#62c3a6"/><circle cx="20" cy="4.5" r="1.6" fill="#62c3a6"/></svg>'; return s; }
  function resultRow(r) {
    let host = '';
    try { host = new URL(r[0]).hostname; } catch (e) { host = r[0]; }
    const ic = web.icon(host);
    return h('div.w-res', A(r[0], h('div.w-res-site', h('span.w-fav', { style: { background: ic.bg, color: ic.fg } }, ic.letter), h('span.w-res-host', h('b', web.siteName(host)), h('small', r[0].replace(/^https?:\/\//, '').slice(0, 52)))), h('div.w-res-t', r[1])), h('div.w-res-s', r[2]));
  }
  function paa(qs, seed) {
    return h('div.w-paa', h('div.w-paa-h', 'People also ask'), qs.map((qq, i) => {
      const ans = h('div.w-paa-a', pick(['Short answer: yes, if you mean it. Most people only need to hear it once, said plainly.', 'It depends on who you ask — and in Liyue, everyone has an opinion.', 'According to the people we asked: be specific, be brief, and don’t wait for the perfect moment.', 'There’s no wrong time. There’s only later, and later keeps getting later.'], seed, i), ' ', A(SEARCH(qq), 'More results'));
      const item = h('div.w-paa-i', h('div.w-paa-q.tap', { onTap: () => item.classList.toggle('open') }, h('span', qq), JC.icon('chevron.down', { size: 14, weight: 2.6 })), ans);
      return item;
    }));
  }
  site('irminsul.net', {
    name: 'Irminsul', icon: IR_ICON,
    pages: {
      '/': () => page('w-ws-home', 'Irminsul', [
        h('div.w-ws-hero', h('div.w-ws-logo', wave(), 'Irminsul'),
          (() => { const inp = JC.ui.input({ placeholder: 'Search everything that was ever written down', enterkey: 'search', cap: 'none', cls: 'w-ws-in', onSubmit: (v) => { if (v.trim()) goFrom(inp, SEARCH(v.trim())); } }); return h('div.w-ws-box.big', JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), inp, h('span.w-ws-go.tap', { onTap: () => { if (inp.value.trim()) goFrom(inp, SEARCH(inp.value.trim())); } }, JC.icon('arrow.forward', { size: 16, weight: 2.6 }))); })(),
          h('div.w-ws-quick', [['Weather Liyue', 'https://tianheng.ly/liyue'], ['The Liyue Herald', HERALD + '/'], ['Akasha', WIKI_URL('Liyue_Harbor')], ['Maps', 'https://irminsul.net/maps?q=Liyue+Harbor']].map(([t, u]) => A(u, t)))),
        h('div.w-ws-trend', h('div.w-ws-th', 'Trending in Liyue Harbor'), trending().map((t, i) => A(SEARCH(t), h('span.w-ws-tn', String(i + 1)), h('span', t)))),
        h('div.w-ws-foot', 'Irminsul · Privacy · Terms · Liyue Harbor')]),
      '/search': (ctx) => searchPage(ctx, 'search'),
      '/images': (ctx) => searchPage(ctx, 'images'),
      '/news': (ctx) => searchPage(ctx, 'news'),
      '/videos': (ctx) => searchPage(ctx, 'videos'),
      '/maps': (ctx) => searchPage(ctx, 'maps'),
    },
  });
  function trending() {
    const f = flags();
    const t = ['Rite of Parting Sunday', 'Rex Lapis photo', 'Yun Jin Divine Damsel', 'Guyun humming', 'glaze lilies', 'Crux rematch'];
    if (f.osial_sent) t.unshift('harbor blackout', 'Guyun flood');
    else if (f.leaked_ning || f.leaked_yelan) t.unshift('Northland resonators Guyun');
    return t.slice(0, 6);
  }
  const PUBLIC_ART = ['p_harbor_day', 'p_yujing_lanterns', 'p_jade_chamber', 'p_wangsheng_door', 'p_heyu_stage', 'p_golden_house', 'p_rexlapis_1926', 'p_glaze_lily', 'p_storm_guyun', 'p_morepesok', 'p_northland_lobby', 'p_wanmin_kitchen', 'p_alcor_deck', 'p_cranes_yujing', 'p_bluefin', 'food_hotpot', 'food_almond_tofu', 'food_jade_parcels', 'food_pelmeni', 'food_crystal_shrimp', 'food_milk_tea', 'food_noodles', 'wp_harbor_night', 'wp_glaze_lily', 'wp_guyun_storm', 'wp_morepesok_snow', 'mk_teaset', 'mk_lilies'];
  function searchPage(ctx, tab) {
    const q = (ctx.q.get('q') || '').trim();
    if (!q) return SITES['irminsul.net'].pages['/']();
    const lower = q.toLowerCase();
    const parts = [];
    const tell = TELLING.find((t) => t.re.test(q));
    const known = KNOWN.filter((k) => k.re.test(q));
    if (tab === 'images') {
      const words = lower.split(/\s+/);
      let imgs = PUBLIC_ART.filter((id) => { const m = JC.art.meta(id); const t = ((m.title || '') + ' ' + id + ' ' + (m.tags || []).join(' ')).toLowerCase(); return words.some((w) => w.length > 2 && t.includes(w)); });
      if (imgs.length < 6) imgs = imgs.concat(PUBLIC_ART.filter((id) => !imgs.includes(id)).sort((a, b) => hash(q + a) - hash(q + b)).slice(0, 9 - imgs.length));
      parts.push(h('div.w-ws-imgs', imgs.map((id) => h('div.w-ws-imgc.tap', { onTap: () => (id === 'p_rexlapis_1926' ? goFrom(parts[0], ARCH + '/photos/1926-founding') : JC.ui.toast('Image: ' + (JC.art.meta(id).title || id))) }, art(id, 'w-ws-img'), h('span', (JC.art.meta(id).title || id).slice(0, 34))))));
    } else if (tab === 'news') {
      const all = news();
      const hits = all.filter((n) => lower.split(/\s+/).some((w) => w.length > 2 && (n[1] + n[2]).toLowerCase().includes(w)));
      (hits.length ? hits : all.slice(0, 5)).forEach((n) => parts.push(h('div.w-res.news', A(n[0], h('div.w-res-t', n[1])), h('div.w-res-s', h('b', 'The Liyue Herald · ' + n[3] + ' · '), n[2]))));
    } else if (tab === 'videos') {
      ['Explained in 3 minutes', 'Street interview on Feiyun Slope', 'Documentary (2025)', 'Shorts compilation'].forEach((v, i) => parts.push(h('div.w-res.video', h('div.w-vid', art(PUBLIC_ART[(hash(q) + i) % PUBLIC_ART.length], 'w-vid-img'), h('span.w-vid-d', (2 + i) + ':' + String(10 + (hash(q + i) % 49)).padStart(2, '0')), h('span.w-vid-play', JC.icon('play.fill', { size: 18 }))), h('div', h('div.w-res-t.tap', { onTap: () => JC.ui.toast('Video playback is disabled on cellular — you’re not on Wi-Fi.') }, title(q) + ' — ' + v), h('div.w-res-s', pick(['Liyue Today', 'Harbor Talk', 'Snezhnaya Uncut', 'Teyvat Explained'], q, i) + ' · ' + (10 + hash(q + v) % 900) + 'K views')))));
    } else if (tab === 'maps') {
      const res = JC.mapview ? JC.mapview.search(q) : [];
      parts.push(h('div.w-ws-map', res.length ? res.slice(0, 6).map((p) => h('div.w-ws-mapr.tap', { onTap: () => JC.os.open('maps', { place: p.id }) }, h('div', h('b', p.short || p.name), h('span', (p.sub || '') + ' · ' + p.city)), JC.icon('map.fill', { size: 18 }))) : h('div.w-res-s', 'No places found for “' + q + '”.'), h('div.w-ws-mapopen.tap', { onTap: () => JC.os.open('maps', { search: q }) }, 'Open in Maps')));
    } else {
      const calc = calcAnswer(q);
      if (calc != null) parts.push(h('div.w-card.w-calc', h('div.w-calc-q', q + ' ='), h('div.w-calc-a', String(calc).replace(/\B(?=(\d{3})+(?!\d))/g, ','))));
      if (/^(time|what time is it|current time)/i.test(q)) parts.push(h('div.w-card.w-calc', h('div.w-calc-q', 'Local time · Liyue Harbor'), h('div.w-calc-a', JC.util.fmtTime(now())), h('div.w-calc-q', JC.util.fmtDate(now(), 'full'))));
      if (known.some((k) => k.weather)) parts.push(weatherCard(/morepesok/i.test(q) ? 'morepesok' : /zapolyarny|snezhnaya/i.test(q) ? 'zapolyarny' : /guyun|sea|marine/i.test(q) ? 'guyun' : /fontaine/i.test(q) ? 'fontaine' : 'liyue'));
      if (tell && tell.snippet) parts.push(h('div.w-card.w-snip', h('div.w-snip-t', tell.snippet[0]), h('div.w-snip-s', tell.snippet[1]), A(tell.snippet[2], tell.snippet[2].replace(/^https:\/\//, ''))));
      const placeK = known.find((k) => k.place);
      if (placeK && JC.mapview) {
        const p = JC.mapview.place(placeK.place);
        if (p) parts.push(h('div.w-card.w-placecard', h('div.w-pc-map.tap', { onTap: () => JC.os.open('maps', { place: p.id }) }, JC.mapview.thumb(p.id, { w: 340, h: 120, zoom: 60 })), h('div.w-pc-b', h('div.w-pc-t', p.short || p.name), h('div.w-pc-s', (p.rating ? '★ ' + p.rating + ' · ' : '') + (p.sub || '') + ' · ' + p.city), h('div.w-pc-s', p.addr || ''), h('div.w-pc-acts', h('span.tap', { onTap: () => JC.os.open('maps', { directions: p.id }) }, 'Directions'), p.web ? A(p.web, 'Website') : h('span.tap', { onTap: () => JC.os.open('maps', { place: p.id }) }, 'Open in Maps')))));
      }
      const wikiK = known.find((k) => k.wiki);
      if (wikiK && WIKI[wikiK.wiki]) { const w = WIKI[wikiK.wiki]; parts.push(h('div.w-card.w-kp', w.img ? art(w.img, 'w-kp-img') : null, h('div.w-kp-t', w.title.replace(/_/g, ' ')), h('div.w-kp-s', w.short || ''), h('div.w-kp-d', w.lead[0].slice(0, 220) + '…'), A(WIKI_URL(wikiK.wiki), 'Akasha'))); }
      let results = [];
      known.forEach((k) => { if (k.site) results.push([k.site[0], k.site[1], 'Official site · ' + k.site[0].replace(/^https:\/\//, '')]); if (k.wiki) results.push([WIKI_URL(k.wiki), k.wiki.replace(/_/g, ' ') + ' — Akasha', (WIKI[k.wiki] && WIKI[k.wiki].lead[0].slice(0, 140) + '…') || '']); });
      if (tell) results = tell.results.concat(results);
      const page2 = ctx.q.get('p') === '2';
      results = results.concat(genericResults(q));
      const seen = new Set();
      results = results.filter((r) => (seen.has(r[0]) ? false : seen.add(r[0])));
      if (page2) results = genericResults(q + ' guide').concat(genericResults(q + ' reviews')).slice(0, 7);
      results.slice(0, 3).forEach((r) => parts.push(resultRow(r)));
      if (!page2) parts.push(paa(tell ? tell.ask : ['What is ' + lower + '?', 'Is ' + lower + ' worth it?', 'How do I start with ' + lower + '?'], q));
      results.slice(3).forEach((r) => parts.push(resultRow(r)));
      parts.push(h('div.w-ws-related', h('div.w-ws-th', 'Related searches'), h('div.w-ws-chips', [q + ' meaning', q + ' liyue', 'how to ' + lower, q + ' askteyvat', 'best ' + lower].map((t) => A(SEARCH(t), t)))));
      parts.push(h('div.w-ws-pager', page2 ? A(SEARCH(q), '‹ Previous') : null, h('span', page2 ? '2' : '1'), page2 ? null : A(SEARCH(q) + '&p=2', 'Next ›')));
    }
    const node = wsChrome(q, tab, h('div.w-ws-results', parts));
    return { title: q + ' — Irminsul', node: h('div.w-page.w-wsp', node), reader: null };
  }

  // ═══ Weather (Tianheng Observatory) ═════════════════════════════════════
  function weatherCard(city) {
    const W = wx(city);
    return h('div.w-card.w-wx', A('https://tianheng.ly/' + city, h('div.w-wx-top', h('div', h('div.w-wx-c', W.name), h('div.w-wx-d', W.now[1])), h('div.w-wx-t', W.now[0] + '°'))),
      h('div.w-wx-days', W.days.map((d) => h('div.w-wx-day', h('span', d[0]), h('span.w-wx-e', d[1]), h('span', d[2] + '° / ' + d[3] + '°')))));
  }
  const WEATHER = {
    liyue: { name: 'Liyue Harbor', now: [19, 'Clear, light sea breeze'], hl: [24, 17], days: [['Tonight', '🌙', 19, 17], ['Sat', '☀️', 24, 18], ['Sun', '⛅️', 23, 18], ['Mon', '🌦', 21, 17], ['Tue', '☀️', 24, 18]], note: 'Calm and clear through Saturday. Sunday evening: cloud building offshore. Lantern-lighting weather is good.' },
    guyun: { name: 'Guyun Stone Forest (marine)', now: [18, 'Unusually still'], hl: [22, 17], days: [['Tonight', '🌫', 18, 17], ['Sat', '🌤', 22, 17], ['Sun', '🌫', 21, 17], ['Mon', '🌧', 19, 16], ['Tue', '⛅️', 21, 17]], note: 'Sea state: glassy. Swell 0.2 m. Mariners report a low hum around the outer pillars; cause unknown.' },
    morepesok: { name: 'Morepesok', now: [-4, 'Light snow'], hl: [-1, -7], days: [['Tonight', '🌨', -4, -7], ['Sat', '❄️', -2, -8], ['Sun', '☁️', -1, -6], ['Mon', '🌨', -3, -9], ['Tue', '❄️', -5, -11]], note: 'Ice on the bay by Tuesday. Good weather for ice fishing, according to every father in Morepesok.' },
    zapolyarny: { name: 'Zapolyarny Palace', now: [-11, 'Snow'], hl: [-8, -15], days: [['Tonight', '❄️', -11, -15], ['Sat', '❄️', -9, -16], ['Sun', '🌨', -8, -14], ['Mon', '❄️', -10, -17], ['Tue', '☁️', -9, -14]], note: 'Heavy snow overnight. Airport operating normally. Snezhnaya does not cancel flights for snow.' },
    mondstadt: { name: 'Mondstadt', now: [13, 'Windy'], hl: [17, 10], days: [['Tonight', '💨', 13, 10], ['Sat', '⛅️', 17, 11], ['Sun', '☀️', 18, 11], ['Mon', '🌤', 17, 12], ['Tue', '🌧', 14, 10]], note: 'Gusts on Starfell Lake. Dandelion seeds expected.' },
    fontaine: { name: 'Court of Fontaine', now: [15, 'Drizzle'], hl: [18, 12], days: [['Tonight', '🌧', 15, 12], ['Sat', '🌦', 18, 13], ['Sun', '🌧', 17, 13], ['Mon', '☁️', 17, 12], ['Tue', '🌦', 18, 13]], note: 'It is raining in Fontaine. It is always raining in Fontaine.' },
  };
  /** live weather: Osial changes the sea */
  function wx(city) {
    const W = Object.assign({}, WEATHER[city] || WEATHER.liyue);
    const f = flags();
    if (f.osial_sent && (city === 'liyue' || city === 'guyun')) {
      W.now = [16, city === 'guyun' ? 'Violent storm' : 'Storm warning'];
      W.note = '⚠️ RED WARNING · Abnormal sea surge from the direction of Guyun Stone Forest. Stay away from the waterfront. The Millelith are evacuating the piers.';
      W.days = W.days.map((d, i) => (i < 2 ? [d[0], '⛈', d[2] - 4, d[3] - 3] : d));
    }
    return W;
  }
  site('tianheng.ly', {
    name: 'Tianheng Observatory', icon: { letter: '☁', bg: 'linear-gradient(180deg,#4aa3ff,#1c6fe0)', fg: '#fff' },
    pages: { '/': (ctx) => weatherPage('liyue', ctx) },
    patterns: [[/^\/(\w+)$/, (ctx, m) => weatherPage(m[1], ctx)]],
  });
  function weatherPage(city) {
    const W = wx(city);
    const storm = /storm/i.test(W.now[1]);
    const hrs = [];
    for (let i = 0; i < 12; i++) { const t = new Date(now() + i * 3600e3); hrs.push(h('div.w-sky-hr', h('span', i ? (t.getHours() % 12 || 12) + (t.getHours() < 12 ? 'a' : 'p') : 'Now'), h('span.w-sky-e', storm ? '⛈' : W.days[0][1]), h('b', Math.round(W.now[0] - Math.sin(i / 3) * 2) + '°'))); }
    return page('w-sky' + (storm ? ' storm' : ''), W.name + ' Weather — Tianheng Observatory', [
      h('div.w-sky-hdr', h('span.w-sky-logo', '☁ Tianheng Observatory'), h('div.w-sky-cities', Object.keys(WEATHER).map((k) => A('https://tianheng.ly/' + k, h('span', { class: { on: k === city } }, WEATHER[k].name.replace(/ \(marine\)/, '')))))),
      h('div.w-sky-now', h('div.w-sky-c', W.name), h('div.w-sky-t', W.now[0] + '°'), h('div.w-sky-d', W.now[1]), h('div.w-sky-hl', 'H:' + W.hl[0] + '°  L:' + W.hl[1] + '°')),
      h('div.w-sky-card', h('div.w-sky-note', W.note), h('div.w-sky-hrs', hrs)),
      h('div.w-sky-card', h('div.w-sky-h', '5-DAY FORECAST'), W.days.map((d) => h('div.w-sky-row', h('span', d[0]), h('span.w-sky-e', d[1]), h('span.w-sky-lo', d[3] + '°'), h('div.w-sky-bar', h('div', { style: { left: Math.max(0, (d[3] + 20) * 2) + '%', right: Math.max(0, 100 - (d[2] + 20) * 2) + '%' } })), h('span', d[2] + '°')))),
      h('div.w-sky-card', h('div.w-sky-h', 'DETAILS'), h('div.w-sky-grid', [['Humidity', city === 'liyue' ? '71%' : '82%'], ['Wind', storm ? '74 km/h E' : '9 km/h SE'], ['UV', '0 Low'], ['Sunrise', '6:24 AM'], ['Sunset', '5:52 PM'], ['Tide', storm ? 'SURGE' : 'High 02:14']].map(([k, v]) => h('div', h('small', k), h('b', v))))),
      h('div.w-foot', 'Tianheng Observatory · Liyue Meteorological Service · ', A('https://irminsul.net/', 'Irminsul')),
    ]);
  }

  // ═══ The Liyue Herald (news; also lhnews.ly) ════════════════════════════
  const T = (s) => JC.time.parse(s);
  const BASE_NEWS = [
    [HERALD + '/2026/10/16/rite-of-parting-sunday', 'Rite of Parting: what to know for Sunday', 'Yujing Terrace from 10:00. The founder’s lanterns go out at 23:00 — and the whole harbor goes dark for one minute.', 'Fri', 'p_yujing_lanterns'],
    [HERALD + '/2026/10/15/guyun-tremors', 'Fishermen report “humming” near Guyun Stone Forest', 'Northland survey boats have been seen among the pillars. The Millelith say there is nothing to worry about.', 'Thu', 'p_storm_guyun'],
    [HERALD + '/2026/10/14/northland-liyue-debt', 'Northland Bank in talks over Liyue’s debt; Jade Chamber silent', 'Sources describe a “historic” settlement to be signed after the Rite.', 'Wed', 'p_northland_lobby'],
    [HERALD + '/2026/10/12/yun-jin-divine-damsel', 'Review: Yun Jin’s “Divine Damsel” is the season’s finest', 'A second act that silences the room. Saturday’s matinee is sold out.', 'Oct 12', 'p_heyu_stage'],
    [HERALD + '/2026/10/10/crux-returns', 'The Crux returns to port — and Captain Beidou wants a rematch', 'The Alcor is moored off Pier 2. The Third-Round Knockout is taking bets.', 'Oct 10', 'p_alcor_deck'],
    [HERALD + '/2026/10/08/wangsheng-autumn-sale', 'Wangsheng’s “second coffin half price” sale draws complaints', 'Director Hu Tao: “Death waits for no one. Neither do our prices.”', 'Oct 8', 'p_wangsheng_door'],
    [HERALD + '/2026/10/05/glaze-lily-season', 'Glaze lilies bloom late this year', 'Florists on Feiyun Slope say demand has tripled since the Founder’s death.', 'Oct 5', 'p_glaze_lily'],
    [HERALD + '/2026/10/01/rex-lapis', 'Liyue mourns: Qixing announce the death of Rex Lapis', 'The Founder of Liyue Harbor has died, the Qixing said this morning. The Rite of Parting will be held on 18 October.', 'Oct 1', 'p_rexlapis_1926'],
  ];
  /** news reacts to the weekend: time and flags */
  function news() {
    const f = flags();
    const out = [];
    const t = now();
    if (f.osial_sent && t >= T('+2 23:00')) out.push([HERALD + '/live/harbor-blackout', 'LIVE: Harbor goes dark as sea surges at Guyun', 'The founder’s lanterns went out at 23:00. Minutes later the sea rose. Northland Bank’s Liyue director is named in a leaked document.', 'Live', 'p_storm_guyun']);
    if ((f.leaked_ning || f.leaked_yelan) && !f.osial_sent) out.push([HERALD + '/2026/10/18/resonators-found', 'Jade Chamber halts foreign “resonators” at Guyun', 'Millelith divers recover devices fixed to the stone pillars. The Tianquan thanks “a source who did the right thing.”', 'Sun', 'p_unit3']);
    if (t >= T('+2 13:00')) out.push([HERALD + '/2026/10/18/liyue-says-goodbye', 'Liyue says goodbye to its Founder', 'Thousands on Yujing Terrace. The Wangsheng consultant who led the Rite “spoke as if he had known him personally.”', 'Sun', 'p_yujing_lanterns']);
    if (f.bought_teaset) out.push([HERALD + '/2026/10/17/teaset-record', 'Guizhong-era tea set sells for a record on Feiyun Market', 'The buyer, a Northland account holder, outbid “jade_connoisseur_88” in the final minute.', 'Sat', 'p_teaset']);
    return out.concat(BASE_NEWS);
  }
  function hdChrome(body, active) {
    return h('div.w-ld.w-hd',
      h('div.w-ld-top', h('span.w-ld-date', JC.util.fmtDate(now(), 'full')), h('span.w-ld-sub.tap', { onTap: () => JC.ui.alert({ title: 'Subscribe to The Liyue Herald', message: 'ℳ88 a month. Childe is already a subscriber. He reads the sports pages and the obituaries, which this month are mostly about one person.', buttons: [{ text: 'OK' }] }) }, 'Subscribe')),
      A(HERALD + '/', h('div.w-ld-mast', h('span.w-hd-seal', '璃'), 'The Liyue Herald')),
      h('div.w-ld-nav', [['News', '/'], ['Rite of Parting', '/2026/10/16/rite-of-parting-sunday'], ['Harbor', '/2026/10/15/guyun-tremors'], ['Business', '/2026/10/14/northland-liyue-debt'], ['Culture', '/2026/10/12/yun-jin-divine-damsel'], ['Life', '/life/found-a-lost-phone'], ['Weather', 'https://tianheng.ly/liyue']].map(([t, u]) => A(/^https/.test(u) ? u : HERALD + u, h('span', { class: { on: active === t } }, t)))),
      body,
      h('div.w-ld-foot', h('div.w-ld-mast.small', 'The Liyue Herald'), h('div', 'Since the year the harbor got its first printing press · Feiyun Slope, Liyue Harbor'), h('div.w-foot-links', A(HERALD + '/', 'Home'), A('https://millelith.ly/', 'Millelith notices'), A('https://irminsul.net/', 'Privacy'))));
  }
  const hdArticle = (o, active) => article(Object.assign({ brand: 'The Liyue Herald', cls: 'w-news' }, o), (b) => hdChrome(b, active));
  const N = (id) => news().find((n) => n[0].endsWith(id)) || BASE_NEWS[0];
  const HERALD_SITE = {
    name: 'The Liyue Herald', icon: { letter: '璃', bg: '#7a1f1f', fg: '#f5d9a8' },
    pages: {
      '/': () => {
        const all = news();
        const lead = all[0];
        return { title: 'The Liyue Herald — News from the harbor', node: h('div.w-page.w-news', hdChrome(h('div.w-ld-home',
          A(lead[0], h('div.w-ld-lead', art(lead[4], 'w-ld-leadimg'), h('div.w-ld-kick', (lead[3] === 'Live' ? '● LIVE' : 'TOP STORY') + ' · ' + lead[3]), h('div.w-ld-lt', lead[1]), h('div.w-ld-ls', lead[2]))),
          h('div.w-ld-grid', all.slice(1).map((n) => A(n[0], h('div.w-ld-item', n[4] ? art(n[4], 'w-ld-thumb') : null, h('div', h('div.w-ld-it', n[1]), h('div.w-ld-is', n[3] + ' · ' + n[2])))))),
          h('div.w-ld-box', h('div.w-ld-boxh', 'Most read'), all.slice(0, 5).map((n, i) => A(n[0], h('div.w-ld-mr', h('b', String(i + 1)), h('span', n[1]))))),
          weatherCard('liyue')), 'News')), reader: null };
      },
      '/2026/10/01/rex-lapis': () => hdArticle({ kicker: 'LIYUE · BREAKING', title: N('rex-lapis')[1], dek: N('rex-lapis')[2], by: 'Herald Staff', date: 'Thu Oct 1, 2026', read: '6 min read', hero: 'p_rexlapis_1926', caption: 'The only known photograph of Rex Lapis in human form, 1926. Liyue Archives, PH-1926-0417.',
        paras: [
          'Rex Lapis, the Geo Archon and Founder of Liyue Harbor, has died, the Liyue Qixing announced from the Jade Chamber this morning. The Tianquan, Ningguang, read the statement herself.',
          '“For six thousand years he kept his contract with this city,” the statement said. “Now the city must keep its contract with him: to go on.”',
          'Details of the Founder’s passing were not released. Asked how a god dies, a Qixing spokesperson said: “Quietly, it seems.”',
          'The Rite of Parting will be held on Sunday 18 October at Yujing Terrace. In keeping with tradition, the ceremony has been entrusted to Wangsheng Funeral Parlor, whose director, Hu Tao, called it “the honour of seventy-seven lifetimes”. The Rite itself will be conducted by the parlour’s consultant, a man described by colleagues as “extraordinarily knowledgeable about ancient customs, and about tea”.',
          'For the first time, the Liyue Archives will display the only known photograph of the Founder in human form — taken at the founding of the Liyue Exchange in 1926 — beside the Rite. The print can be viewed online in the Archives’ collection.',
          'Flags across the harbor are at half mast. The founder’s lanterns will be lit on Saturday night.',
        ],
        after: h('div.w-hd-box', h('b', 'See the photograph'), A(ARCH + '/photos/1926-founding', 'Liyue Archives · PH-1926-0417 · “The Consultant” ›')),
        related: [[N('rite-of-parting-sunday')[0], N('rite-of-parting-sunday')[1], 'p_yujing_lanterns'], [ARCH + '/photos/1926-founding', 'Liyue Archives: the 1926 photograph', 'p_rexlapis_1926'], [N('glaze-lily-season')[0], N('glaze-lily-season')[1]]] }, 'News'),
      '/2026/10/16/rite-of-parting-sunday': () => hdArticle({ kicker: 'RITE OF PARTING', title: N('rite-of-parting-sunday')[1], dek: N('rite-of-parting-sunday')[2], by: 'Chen Yuhua', date: 'Fri Oct 16, 2026', read: '4 min read', hero: 'p_yujing_lanterns', caption: 'Lanterns being hung along Yujing Terrace on Friday.',
        paras: [
          'When: Sunday 18 October. Gates on Yujing Terrace open at 09:00; the Rite begins at 10:00 and ends at about 13:00.',
          'Who: Everyone. Wear white. Wangsheng Funeral Parlor asks mourners not to bring incense, “because we have plenty, and some of it is very expensive”.',
          'The lanterns: The founder’s lanterns will be lit along the terrace and the waterfront on Saturday night. They burn until 23:00 on Sunday, when every lantern in the harbor — and, by agreement with the Qixing, every streetlight — goes out at once for one minute of silence.',
          'Traffic: Harbor Road and Yujing Terrace Road close from 07:00 Sunday. The ferries run a Sunday timetable. Harbor Ride will not pick up on the terrace.',
          'After the Rite: The Qixing will meet foreign delegations at the Golden House in the afternoon. A Northland Bank spokesperson confirmed that the Bank “will be represented”.',
          'Glaze lilies may be left at Wangsheng Funeral Parlor or ordered for delivery on Feiyun Market.',
        ],
        related: [[N('rex-lapis')[0], N('rex-lapis')[1], 'p_rexlapis_1926'], ['https://wangsheng.ly/rite', 'Wangsheng: the Rite of Parting'], [N('northland-liyue-debt')[0], N('northland-liyue-debt')[1]]] }, 'Rite of Parting'),
      '/2026/10/15/guyun-tremors': () => hdArticle({ kicker: 'HARBOR', title: N('guyun-tremors')[1], dek: N('guyun-tremors')[2], by: 'Lan Yan', date: 'Thu Oct 15, 2026', hero: 'p_storm_guyun',
        paras: [
          'For a week now, fishermen working the waters around Guyun Stone Forest say the sea has been humming.',
          '“It comes up through the hull,” said one, who has fished the outer pillars for thirty years. “Low. Like a man singing in the next room. The fish don’t like it. I don’t like it.”',
          'Several boats have reported Northland Bank survey vessels moored among the pillars at night. Asked what a bank was surveying, a Northland spokesperson said the Bank “regularly assesses assets in which it has an interest”.',
          'Older residents of the harbor were quick to mention Osial, the sea god said to be sealed beneath the forest by Rex Lapis himself. “He’s been asleep a long time,” said a tea seller on Chihu Rock. “You don’t hum at a sleeping thing unless you want it awake.”',
          'The Millelith said there was “nothing to worry about” and asked fishermen to keep clear of pillar G-17 “for routine reasons”.',
        ],
        related: [[WIKI_URL('Osial'), 'Osial — Akasha'], [N('rite-of-parting-sunday')[0], N('rite-of-parting-sunday')[1], 'p_yujing_lanterns'], ['https://tianheng.ly/guyun', 'Marine forecast: Guyun']] }, 'Harbor'),
      '/2026/10/14/northland-liyue-debt': () => hdArticle({ kicker: 'BUSINESS', title: N('northland-liyue-debt')[1], dek: N('northland-liyue-debt')[2], by: 'Herald Business Desk', date: 'Wed Oct 14, 2026', hero: 'p_northland_lobby',
        paras: [
          'Northland Bank Group, the Snezhnayan lender whose Liyue branch opened on Harbor Road in March, is close to an agreement that would write off a large part of the city’s debt, according to two people familiar with the talks.',
          'In return, the Bank would receive “an item of cultural significance” after the Rite of Parting. Neither side would say what the item is.',
          'The Bank’s Liyue operations are led by a director known publicly as Tartaglia, 22, the youngest member of the Bank’s executive board. Colleagues describe him as “enthusiastic”. Competitors describe him less kindly.',
          'A senior executive from Fontaine, identified in filings as “the Eighth”, has been in the city since September.',
          'The Jade Chamber declined to comment.',
        ],
        related: [['https://northland.sn/liyue', 'Northland Bank · Liyue Branch'], [WIKI_URL('Northland_Bank'), 'Northland Bank — Akasha']] }, 'Business'),
      '/2026/10/12/yun-jin-divine-damsel': () => hdArticle({ kicker: 'CULTURE · REVIEW', title: N('yun-jin-divine-damsel')[1], dek: N('yun-jin-divine-damsel')[2], by: 'Xinyan (guest critic)', date: 'Mon Oct 12, 2026', hero: 'p_heyu_stage',
        paras: [
          'Yun Jin has done it again. “The Divine Damsel of Devastation”, her retelling of the war that founded Liyue, opened at Heyu Tea House on Saturday to a standing room that refused to sit down.',
          'The second act — in which a nameless god makes a contract with a city and keeps it for six thousand years — is the finest thing on any stage in the harbor. On the night I attended, a gentleman in Box 2 was seen mouthing the lyrics.',
          'Saturday matinees are sold out until November. Evening returns are released at the box office at 18:00.',
        ],
        related: [['https://heyu.ly/troupe', 'Yun Jin Troupe: tickets and season']] }, 'Culture'),
      '/2026/10/10/crux-returns': () => hdArticle({ kicker: 'HARBOR', title: N('crux-returns')[1], dek: N('crux-returns')[2], by: 'Herald Staff', date: 'Sat Oct 10, 2026', hero: 'p_alcor_deck',
        paras: ['The Crux Fleet’s flagship, the Alcor, returned to Liyue Harbor on Saturday after six weeks at sea.', 'Captain Beidou, asked about the rumour that she lost an arm-wrestle at the Third-Round Knockout to “a ginger banker”, said: “I didn’t lose. I paused. The rematch is Saturday night. Tell him to bring Mora for the drinks.”', 'The Crux ferries passengers north on request. Bookings through the fleet’s office on Pier 2.'],
        related: [['https://crux.ly/', 'The Crux Fleet']] }, 'Harbor'),
      '/2026/10/08/wangsheng-autumn-sale': () => hdArticle({ kicker: 'CITY', title: N('wangsheng-autumn-sale')[1], dek: N('wangsheng-autumn-sale')[2], by: 'Herald Staff', date: 'Thu Oct 8, 2026', hero: 'p_wangsheng_door',
        paras: ['Wangsheng Funeral Parlor’s “Autumn Sale”, advertised on posters across the harbor with the slogan “Second coffin half price — bring a friend!”, has drawn complaints from residents.', '“We are a funeral parlour, not a market stall,” said one. Director Hu Tao responded on Ripple: “Death waits for no one. Neither do our prices. Also, we are both.”', 'The sale ends Sunday. The parlour is handling the Rite of Parting and asks that customers “keep it to one coffin each this week”.'],
        related: [['https://wangsheng.ly/', 'Wangsheng Funeral Parlor']] }, 'News'),
      '/2026/10/05/glaze-lily-season': () => hdArticle({ kicker: 'CITY', title: N('glaze-lily-season')[1], dek: N('glaze-lily-season')[2], by: 'Herald Staff', date: 'Mon Oct 5, 2026', hero: 'p_glaze_lily',
        paras: ['Glaze lilies, which bloom only where they are left alone, came late this year. Florists on Feiyun Slope have been sold out since the Founder’s death.', '“People want to give something,” said one. “A lily is what you give when you don’t have the words.”', 'Legend has it that the flower was the favourite of Guizhong, an ancient goddess and the Founder’s dearest friend.'],
        related: [[WIKI_URL('Glaze_lily'), 'Glaze lily — Akasha'], [WIKI_URL('Guizhong'), 'Guizhong — Akasha']] }, 'News'),
      '/2026/10/17/teaset-record': () => hdArticle({ kicker: 'CULTURE', title: 'Guizhong-era tea set sells for a record on Feiyun Market', by: 'Herald Staff', date: 'Sat Oct 17, 2026', hero: 'p_teaset', paras: ['A seven-piece celadon tea set dated to the Guizhong era sold just after midnight on Feiyun Market.', 'The base of the pot bears a worn inscription. Experts consulted by the Herald read it as “for Morax — G.”, which, if genuine, would make the set a gift to Rex Lapis from the goddess Guizhong herself.', '“Whoever bought it,” one said, “should give it back to whoever it belongs to.”'] }, 'Culture'),
      '/2026/10/18/liyue-says-goodbye': () => hdArticle({ kicker: 'RITE OF PARTING', title: 'Liyue says goodbye to its Founder', dek: 'Thousands on Yujing Terrace. The consultant who led the Rite “spoke as if he had known him personally.”', by: 'Chen Yuhua', date: 'Sun Oct 18, 2026', hero: 'p_yujing_lanterns', paras: ['They came in white, carrying lilies, and stood in silence for three hours.', 'The Rite of Parting was conducted by Wangsheng Funeral Parlor’s consultant, a tall man in a long coat who read the eulogy without notes. “He was not always wise,” he said of the Founder. “But he kept his word. In the end, that is the only thing anyone can keep.”', 'One mourner said afterwards: “It was strange. He talked about him like a friend. Like he’d been there.”', 'The founder’s lanterns burn until 23:00 tonight.'] }, 'Rite of Parting'),
      '/2026/10/18/resonators-found': () => hdArticle({ kicker: 'BREAKING', title: 'Jade Chamber halts foreign “resonators” at Guyun', dek: 'Millelith divers recover devices fixed to the stone pillars.', by: 'Herald Staff', date: 'Sun Oct 18, 2026', hero: 'p_unit3', paras: ['Millelith divers recovered three devices from pillars G-4, G-9 and G-17 in Guyun Stone Forest on Sunday, after the Jade Chamber received what the Tianquan called “a document no one was meant to read”.', 'The devices, described as “resonators”, carried Northland Bank markings.', '“Someone did the right thing,” Ningguang said. “Liyue remembers people who do the right thing. It also remembers the other kind.”', 'Northland Bank declined to comment.'] }, 'News'),
      '/live/harbor-blackout': () => hdArticle({ kicker: '● LIVE', title: 'Harbor goes dark as sea surges at Guyun', dek: 'The founder’s lanterns went out at 23:00. Minutes later the sea rose.', by: 'Herald Live Desk', date: 'Sun Oct 18, 2026 · updating', hero: 'p_storm_guyun', paras: ['23:01 — The lanterns go out on schedule. The harbor is silent.', '23:04 — Reports of a roar from the direction of Guyun Stone Forest. The water at Pier 7 is draining away from the quay.', '23:09 — A wall of water is visible beyond the outer pillars. The Millelith are evacuating the waterfront.', '23:15 — Witnesses on Yujing Terrace describe “a light in the shape of a man” standing on the sea.', '23:40 — A document circulating on Ripple names Northland Bank’s Liyue director, Tartaglia, as the sole signatory of the operation.'] }, 'News'),
      '/life/found-a-lost-phone': () => hdArticle({ kicker: 'LIFE', title: 'Found a Lost Phone? Here’s Exactly What to Do', dek: 'It’s someone’s whole life in your pocket. Here’s how to get it back to them fast.', by: 'Herald Life Desk', date: 'Updated Oct 2026',
        paras: [
          '1. Don’t try to unlock it — and don’t read the messages. The longer you look, the harder it gets to give back.',
          '2. Check the Lock Screen. If the owner has marked it as lost, a message and a phone number will appear there. The Emergency screen may show a Medical ID with emergency contacts.',
          '3. If it rings, answer. Say you found the phone and where you are. Most people are calling their own number in a panic.',
          '4. Found it after a ride? Report it through the ride app. Harbor Ride has a “Report a lost item” page for every trip.',
          '5. Hand it in. Any Millelith post will take found property and contact the owner. The Harbor Road post is open 24 hours.',
          'And if you’ve already read a few messages? Tell the truth. People are more forgiving than you think — especially when you bring their phone back.',
        ],
        after: h('div.w-hd-box', h('b', 'Quick links'), A('https://harborride.ly/help/lost-items', 'Harbor Ride: report a lost or found item ›'), A('https://millelith.ly/lost-and-found', 'The Millelith: Lost & Found ›')) }, 'Life'),
      '/search': (ctx) => { const q = ctx.q.get('q') || ''; const all = news(); const res = all.filter((n) => q.toLowerCase().split(/\s+/).some((w) => w.length > 2 && (n[1] + n[2]).toLowerCase().includes(w))); return { title: 'Search: ' + q + ' — The Liyue Herald', node: h('div.w-page.w-news', hdChrome(h('div.w-article', h('h1.w-h1', 'Results for “' + q + '”'), res.length ? res.map((n) => A(n[0], h('div.w-ld-item', h('div', h('div.w-ld-it', n[1]), h('div.w-ld-is', n[3] + ' · ' + n[2]))))) : [h('p', 'No articles matched. Here’s what everyone is reading:'), all.slice(0, 4).map((n) => A(n[0], h('div.w-ld-item', h('div', h('div.w-ld-it', n[1])))))]), 'News')), reader: null }; },
    },
    patterns: [[/^\/life\/([\w-]+)$/, (ctx, m) => hdArticle({ kicker: 'LIFE · ADVICE', title: title(unslug(m[1])), by: 'Madam Ping, Herald Life Desk', date: 'Oct 2026', paras: ['Dear reader, you asked: “' + unslug(m[1]) + '?”', 'Our answer, as always: be kind, be brief, and say the thing you are afraid to say. Most problems in this harbor are solved by one honest sentence and a pot of tea.', 'If that fails, bring food. Wanmin Restaurant is open until two.'] }, 'Life')]],
  };
  site('liyueherald.ly', HERALD_SITE);
  site('lhnews.ly', Object.assign({}, HERALD_SITE, { name: 'Liyue Harbor News' }));

  // ═══ Liyue Archives ══════════════════════════════════════════════════════
  const ARCH_ITEMS = [
    ['1926-founding', 'PH-1926-0417', '“The Consultant”, Liyue Exchange founding, 1926', 'p_rexlapis_1926', 'Silver gelatin print, 1926'],
    ['harbor-1951', 'PH-1951-0032', 'Liyue Harbor from Yujing Terrace', 'p_harbor_day', 'Hand-tinted print, 1951'],
    ['jade-chamber-1988', 'PH-1988-1104', 'The Jade Chamber rises over the harbor', 'p_jade_chamber', 'Colour slide, 1988'],
    ['golden-house', 'PH-1902-0007', 'The Golden House, mint of Liyue', 'p_golden_house', 'Albumen print, 1902'],
    ['glaze-lily', 'BOT-0441', 'Glaze lily, pressed specimen', 'p_glaze_lily', 'Herbarium sheet, undated'],
    ['wangsheng-door', 'PH-2019-0915', 'Wangsheng Funeral Parlor, the 77th director’s door', 'p_wangsheng_door', 'Digital, 2019'],
  ];
  function archChrome(body) {
    return h('div.w-arch', h('div.w-arch-hdr', A(ARCH + '/', h('span.w-arch-logo', h('span.w-arch-seal', '岩'), h('span', 'LIYUE ARCHIVES', h('small', 'Heritage collections of the Qixing')))), h('div.w-arch-nav', A(ARCH + '/photos', 'Photographs'), A(ARCH + '/exhibitions/rite-of-parting', 'Exhibitions'), A(ARCH + '/visit', 'Visit'))), body,
      h('div.w-arch-foot', 'Liyue Archives · Jade Chamber Annexe, Yujing Terrace · Reading room Tue–Sun 9:00–17:00 · Images may not be reproduced without permission of the Qixing.'));
  }
  site('archives.ly', {
    name: 'Liyue Archives', icon: { letter: '岩', bg: '#2b2418', fg: '#e3c37b' },
    pages: {
      '/': () => page('w-arch-page', 'Liyue Archives — Heritage collections of the Qixing', archChrome(h('div',
        h('div.w-arch-hero', art('p_rexlapis_1926', 'w-arch-heroimg'), h('div.w-arch-herot', h('small', 'NEW TO THE COLLECTION ONLINE'), h('b', 'The only photograph of the Founder'), A(ARCH + '/photos/1926-founding', 'View PH-1926-0417 ›'))),
        h('div.w-arch-sec', h('h2', 'Exhibitions'), A(ARCH + '/exhibitions/rite-of-parting', h('div.w-arch-row', h('b', 'Six Thousand Years: the Founder and his City'), h('span', 'Yujing Terrace, from Sunday · free')))),
        h('div.w-arch-sec', h('h2', 'Search the collection'), (() => { const inp = JC.ui.input({ placeholder: 'Catalogue no., subject, year…', cap: 'none', enterkey: 'search', cls: 'w-input', onSubmit: (v) => goFrom(inp, ARCH + '/photos?q=' + enc(v.trim())) }); return inp; })())))),
      '/photos': (ctx) => {
        const q = ((ctx.q && ctx.q.get('q')) || '').toLowerCase().trim();
        const list = ARCH_ITEMS.filter((it) => !q || (it.join(' ') + (it[0] === '1926-founding' ? ' rex lapis morax founder lantern consultant' : '')).toLowerCase().includes(q));
        return page('w-arch-page', 'Photographs — Liyue Archives', archChrome(h('div.w-arch-sec', h('h2', q ? 'Results for “' + q + '”' : 'Photographs'), list.length ? h('div.w-arch-grid', list.map((it) => A(ARCH + '/photos/' + it[0], h('div.w-arch-card', art(it[3], 'w-arch-thumb'), h('b', it[2]), h('span', it[1] + ' · ' + it[4]))))) : h('p', 'No records match. The reading room staff can search the uncatalogued boxes on request.'))));
      },
      '/photos/1926-founding': () => {
        const f = flags();
        const rec = [['Catalogue no.', 'PH-1926-0417'], ['Title', '“The Consultant”'], ['Date', 'Founding of the Liyue Exchange, 1926'], ['Place', 'Liyue Exchange, Feiyun Slope'], ['Medium', 'Silver gelatin print, 18 × 24 cm'], ['Photographer', 'Unknown (studio stamp: Feiyun Portraits)'], ['Subject', 'Rex Lapis (identified by the photographer); the Qixing of 1926'], ['Provenance', 'Gift of Wangsheng Funeral Parlor, 1951']];
        return { title: 'PH-1926-0417 · “The Consultant” — Liyue Archives', node: h('div.w-page.w-arch-page', archChrome(h('div.w-arch-item',
          h('div.w-arch-crumb', A(ARCH + '/photos', 'Photographs'), ' › PH-1926-0417'),
          h('figure.w-arch-fig', art('p_rexlapis_1926', 'w-arch-photo'), h('figcaption', 'The founding of the Liyue Exchange, 1926. The gentleman in the long coat stands at the centre, among the Qixing of the day.')),
          h('h1.w-arch-t', '“The Consultant”'),
          h('table.w-arch-rec', rec.map(([k, v]) => h('tr', h('th', k), h('td', v)))),
          h('div.w-arch-note', h('b', 'Curator’s note'), para([
            'This print is the only photograph in any collection believed to show Rex Lapis in human form. On the back, in the photographer’s hand: “The gentleman would not give his name. Said he was ‘a consultant’. The Tianquan bowed to him. — Do not sell.”',
            'Visitors often remark on the subject’s calm, his long dark hair tied back with a single tassel, and the amber of his eyes, which the hand-tinting has preserved. He appears to be about thirty years old. In 1926.',
            'The print will be displayed at the Rite of Parting on Sunday 18 October.',
          ])),
          f.clue_invoice || f.clue_inscription ? h('div.w-arch-flag', JC.icon('exclamationmark.circle.fill', { size: 18 }), h('span', 'You have seen this face before. Tonight, at dinner. Across the table.')) : null,
          h('div.w-arch-btns', Btn('Request a print', () => JC.ui.alert({ title: 'Request a Print', message: 'Reproductions of PH-1926-0417 are not permitted without the written consent of the Qixing. (The request form asks for your name. You do not have a name you can give.)', buttons: [{ text: 'OK' }] }), 'w-btn-arch'), Btn('Share', () => JC.ui.share({ title: '“The Consultant”, 1926 — Liyue Archives', art: 'p_rexlapis_1926', payload: { kind: 'link', text: 'PH-1926-0417 · “The Consultant”', url: ARCH + '/photos/1926-founding' } }), 'w-btn-ghost')),
          h('div.w-arch-sec', h('h2', 'Related'), A(HERALD + '/2026/10/01/rex-lapis', h('div.w-arch-row', h('b', 'Liyue mourns: Qixing announce the death of Rex Lapis'), h('span', 'The Liyue Herald'))), A(WIKI_URL('Rex_Lapis'), h('div.w-arch-row', h('b', 'Rex Lapis'), h('span', 'Akasha'))))))),
          reader: { title: '“The Consultant”, 1926', byline: 'Liyue Archives · PH-1926-0417', paras: ['The only photograph in any collection believed to show Rex Lapis in human form.', 'On the back: “The gentleman would not give his name. Said he was ‘a consultant’. The Tianquan bowed to him. — Do not sell.”'] } };
      },
      '/exhibitions/rite-of-parting': () => page('w-arch-page', 'Six Thousand Years — Liyue Archives', archChrome(h('div.w-arch-sec', h('h2', 'Six Thousand Years: the Founder and his City'), art('p_yujing_lanterns', 'w-arch-img'), para(['A small exhibition on Yujing Terrace to accompany the Rite of Parting: contracts, coins from the Golden House, a pressed glaze lily, and the 1926 photograph shown publicly for the first time.', 'Free entry from Sunday 18 October, 09:00.']), A(ARCH + '/photos/1926-founding', h('div.w-arch-row', h('b', 'PH-1926-0417 · “The Consultant”'), h('span', 'View online ›')))))),
      '/visit': () => page('w-arch-page', 'Visit — Liyue Archives', archChrome(h('div.w-arch-sec', h('h2', 'Visit'), para(['Jade Chamber Annexe, Yujing Terrace. Reading room Tuesday to Sunday, 9:00–17:00. Closed for the Rite of Parting on Sunday morning.', 'Bags must be left at the desk. Pencils only. Please do not bring tea into the reading room. (One regular visitor does. He is very careful. He is the exception.)'])))),
    },
    patterns: [[/^\/photos\/([\w-]+)$/, (ctx, m) => {
      const it = ARCH_ITEMS.find((x) => x[0] === m[1]);
      if (!it) return notFound(SITES['archives.ly'], ctx);
      return page('w-arch-page', it[2] + ' — Liyue Archives', archChrome(h('div.w-arch-item', h('div.w-arch-crumb', A(ARCH + '/photos', 'Photographs'), ' › ' + it[1]), h('figure.w-arch-fig', art(it[3], 'w-arch-photo')), h('h1.w-arch-t', it[2]), h('table.w-arch-rec', [['Catalogue no.', it[1]], ['Medium', it[4]]].map(([k, v]) => h('tr', h('th', k), h('td', v)))))));
    }]],
  });

  // ═══ Northland Bank (public) ═════════════════════════════════════════════
  const NB = 'https://northland.sn';
  function nbChrome(body, active) {
    return h('div.w-nb', h('div.w-nb-hdr', A(NB + '/', h('span.w-nb-logo', h('span.w-nb-mark', '❄'), 'NORTHLAND BANK')), h('div.w-nb-nav', [['Personal', '/'], ['Liyue', '/liyue'], ['Board', '/about/board'], ['Security', '/security'], ['Careers', '/careers']].map(([t, u]) => A(NB + u, h('span', { class: { on: active === t } }, t))))), body,
      h('div.w-nb-foot', h('div', '❄ Northland Bank Group · Zapolyarny Palace, Snezhnaya'), h('div', 'Liyue Branch: 1 Harbor Road · (0761) 555 0110 · ', A('https://intranet.northland.sn/', 'Staff sign-in')), h('div.w-foot-c', '© 2026 Northland Bank Group. Banking the cold since before the cold.')));
  }
  const NB_SITE = {
    name: 'Northland Bank', icon: { letter: '❄', bg: '#0f2740', fg: '#cfe6ff' },
    pages: {
      '/': () => page('w-nb-page', 'Northland Bank — Personal banking', nbChrome(h('div', h('div.w-nb-hero', art('p_northland_lobby', 'w-nb-heroimg'), h('div.w-nb-herot', h('b', 'Your money. Our winter.'), h('span', 'Personal and private banking in Snezhnaya, Liyue and beyond.'), Btn('Open the Northland app', () => JC.os.open('northland'), 'w-btn-nb'))),
        h('div.w-nb-cards', [['Northland Black', 'The card for people who do not ask the price.'], ['Savings', 'Up to 4.1% AER. Withdrawals reviewed by a Harbinger.'], ['Liyue debt restructuring', 'A historic partnership. Details after the Rite.']].map(([t, s]) => h('div.w-nb-card', h('b', t), h('span', s))))), 'Personal')),
      '/liyue': () => page('w-nb-page', 'Northland Bank · Liyue Branch', nbChrome(h('div.w-nb-sec', h('h2', 'Liyue Branch'), art('p_northland_lobby', 'w-nb-img'), para(['1 Harbor Road, Liyue Harbor. Monday to Saturday, 9:00–18:00. Closed Sunday for the Rite of Parting.', 'Branch Director: Tartaglia, Eleventh of the Executive Board.', 'Reception: Ekaterina. If you have an appointment, she already knows. If you do not, she also knows.']), Btn('Call the Branch', () => JC.callui && JC.callui.dialNumber('(0761) 555 0110'), 'w-btn-nb'), Btn('Directions', () => JC.os.open('maps', { directions: 'northland' }), 'w-btn-ghost')), 'Liyue')),
      '/about/board': () => page('w-nb-page', 'The Executive Board — Northland Bank Group', nbChrome(h('div.w-nb-sec', h('h2', 'The Executive Board'), h('p.w-nb-small', 'Known informally, and not by us, as “the Harbingers”.'),
        [['The First', 'Chairman of the Board'], ['The Second', 'Chief Scientific Officer, Northland Medical'], ['The Third', 'Director, Fontaine'], ['The Fourth', 'Director, Orphanages & Education'], ['The Fifth', 'Director, Family Services & Executive Travel'], ['The Sixth', 'Director, Operations'], ['The Eighth', 'Special Projects (on secondment to Liyue)'], ['The Ninth', 'Treasurer'], ['The Tenth', 'Director, Investigations (on leave)'], ['The Eleventh', 'Director, Special Collections (Liyue) — Tartaglia']].map(([n, r]) => h('div.w-nb-row', h('b', n), h('span', r)))), 'Board')),
      '/security': () => page('w-nb-page', 'Security — Northland Bank', nbChrome(h('div.w-nb-sec', h('h2', 'Keeping your account safe'), para(['Northland Bank will never ask for your password by text message.', 'Authorization codes (format OSL-…, NB-…) are personal. Never send an authorization code to anyone, including a colleague, including a senior colleague, including a senior colleague who says “Don’t make me come to you.”', 'Lost your card? Freeze it instantly in the Northland app: Card → Freeze.']), Btn('Freeze a card in the app', () => JC.os.open('northland', { tab: 'card' }), 'w-btn-nb')), 'Security')),
      '/careers': () => page('w-nb-page', 'Careers — Northland Bank', nbChrome(h('div.w-nb-sec', h('h2', 'Careers'), ['Teller, Liyue Branch', 'Debt Collection Agent (must enjoy travel, must not ask questions)', 'Aquarium Technician (Liyue Branch, urgent)', 'Receptionist — position filled. Permanently. — E.'].map((j) => h('div.w-nb-row', h('b', j), h('span.tap', { onTap: () => JC.ui.toast('Applications reopen after the Rite') }, 'Apply ›')))), 'Careers')),
    },
  };
  site('northland.sn', NB_SITE);
  site('northlandbank.sn', Object.assign({}, NB_SITE));

  // ═══ Northland intranet (the Osial file) ═════════════════════════════════
  const NI = 'https://intranet.northland.sn';
  const niCheck = (u, p) => /^nb-liyue$/i.test(u) && String(p).replace(/[’‘]/g, '\'') === 'Tsaritsa\'sOwn11';
  function niChrome(body, active) {
    return h('div.w-ni', h('div.w-ni-hdr', A(NI + '/home', h('span.w-ni-logo', '❄ NORTHLAND', h('small', 'INTRANET · LIYUE'))), h('span.w-ni-user', 'nb-liyue'), h('span.w-ni-out.tap', { onTap: (e) => { web.signOut('intranet'); goFrom(e.currentTarget, NI + '/'); } }, 'Sign out')),
      h('div.w-ni-nav', [['Home', '/home'], ['Projects', '/projects'], ['Directory', '/directory'], ['Medical', '/medical']].map(([t, u]) => A(NI + u, h('span', { class: { on: active === t } }, t)))), body,
      h('div.w-ni-foot', 'CONFIDENTIAL · Property of Northland Bank Group · Activity on this system is logged and reviewed by the Office of the Ninth.'));
  }
  const niLogin = () => page('w-login-page w-ni-login', 'Northland Intranet — Sign in', [h('div.w-intra', loginForm({ key: 'intranet', brand: 'Northland Intranet', logo: h('span', '❄ Northland Intranet'), color: '#0f2740', sub: 'Liyue Branch · staff only', user: '', userLabel: 'Staff ID', max: 4, check: niCheck, onSuccess: (box) => goFrom(box, NI + '/home'), faceId: false, resetText: 'Password resets are handled by reception. Ekaterina will ask you three security questions. One of them is about fish.', help: 'Branch IT: ext. 11. If the vending machine shows E-11, that is not an IT problem.', lockedText: 'This account is locked. The Office of the Ninth has been notified.' }), h('div.w-intra-foot', 'Shared terminal account for the Liyue Branch. Do not write the password down. (Somebody did.)'))]);
  const NI_PAGES = {
    '/home': () => page('w-ni-page', 'Home — Northland Intranet', niChrome(h('div.w-ni-sec',
      h('h2', 'Good evening, Liyue Branch'),
      [['URGENT · Office of the Eighth', 'All Liyue staff: Sunday is a skeleton shift. The harbor will be dark from 23:00. Stay indoors. Do not ask why.'], ['HR · Office of the Second', 'Mandatory “Delusion check-up” for the Branch Director, Monday 09:00, Medical Wing. Family baseline sample requested.'], ['Facilities', 'The 3F FROSTFIZZ vending machine shows error E-11 again. Do not kick it. Lyuba.'], ['Facilities', 'The aquarium is frozen. Again. The Director’s fish are inside. Again. Nobody tell the Director.'], ['Reception', 'If anyone finds the Director, tell him I am not angry. — E.']].map(([h1, t]) => h('div.w-ni-ann', h('b', h1), h('span', t))),
      A(NI + '/projects', h('div.w-ni-cta', 'Projects ›'))), 'Home')),
    '/projects': () => page('w-ni-page', 'Projects — Northland Intranet', niChrome(h('div.w-ni-sec', h('h2', 'Projects'),
      [['osial', 'Project OSIAL', '◆ RESTRICTED · rev. 4 · Sole signatory: Tartaglia', 'red'], ['debt', 'Liyue Debt Restructuring', 'Office of the Ninth · signing after the Rite', ''], ['golden-house', 'Golden House handover', 'Office of the Eighth · Sun 15:00 · item: “G.”', ''], ['aquarium', 'Branch aquarium (thaw)', 'Facilities · overdue', '']].map(([id, t, s, c]) => A(NI + '/projects/' + id, h('div.w-ni-proj', { class: c ? { red: true } : {} }, h('b', t), h('span', s))))), 'Projects')),
    '/projects/osial': () => {
      const f = flags();
      return { title: 'Project OSIAL — Northland Intranet', node: h('div.w-page.w-ni-page', niChrome(h('div.w-ni-doc',
        h('div.w-ni-stamp', 'APPROVED · OFFICE OF THE EIGHTH'),
        h('div.w-ni-class', '◆ RESTRICTED — READ ONCE'),
        h('h1', 'Project OSIAL — Operating protocol (rev. 4)'),
        h('table.w-ni-tbl', [['Objective', 'Wake the entity sealed beneath Guyun Stone Forest, so that Liyue’s hidden god must reveal himself to defend the harbor. Recover the Gnosis in the confusion.'], ['Method', 'Three Northland resonators tuned to the seal: pillars G-4, G-9 and G-17 (“Unit 3”).'], ['Status', 'G-4 LIVE · G-9 LIVE · G-17 (Unit 3) AWAITING AUTHORIZATION'], ['Timing', 'Activation at 23:00 Sunday, when the founder’s lanterns go out and the harbor is dark.'], ['Funding', 'OSIAL/PH3 · ℳ3,000,000 → Sea Lantern Logistics · releases Sun 23:00'], ['Authorization', 'Format OSL-####-ΛΣ. Branch Director only.'], ['Sole signatory', 'Tartaglia, Eleventh of the Executive Board']].map(([k, v]) => h('tr', h('th', k), h('td', v)))),
        art('p_osial_diagram', 'w-ni-diagram'),
        h('h2', 'Revision history'),
        h('table.w-ni-tbl.hist', [['rev. 1', '2 Aug', 'Proposal. Author: Tartaglia (“it would be a good fight”).'], ['rev. 2', '19 Aug', 'Project transferred to the Office of the Eighth. Co-signed: Signora, Tartaglia.'], ['rev. 3', '9 Oct', 'Tartaglia requests withdrawal: “There are kids in that harbor.” Request noted.'], ['rev. 4', '15 Oct', 'Countersignature removed (“redundant”). Sole signatory: Tartaglia.']].map((r) => h('tr', r.map((c) => h('td', c))))),
        h('div.w-ni-warn', JC.icon('exclamationmark.triangle.fill', { size: 18 }), h('span', 'Expected harbor impact: severe flooding of the waterfront and Pier 1–9 within 15 minutes of activation. Civil casualties: “acceptable”.')),
        h('div.w-ni-btns',
          Btn('Email this page…', () => JC.os.open('mail', { compose: { subject: 'Project Osial — protocol (rev. 4)', body: 'Project OSIAL — Northland Bank Group, rev. 4\n\nResonators on Guyun pillars G-4 and G-9 are live. Unit 3 on G-17 awaits authorization. Activation: Sunday 23:00, when the founder’s lanterns go out. Funding: ℳ3,000,000 to Sea Lantern Logistics.\n\nThe countersignature was removed in rev. 4 to make Tartaglia the sole signatory. He asked to withdraw on 9 Oct: “There are kids in that harbor.”\n\nExpected impact: flooding of the waterfront within 15 minutes.\n\nhttps://intranet.northland.sn/projects/osial' } }), 'w-btn-nb'),
          Btn('Screenshot', () => { if (JC.msgApp && JC.msgApp.savePhoto) JC.msgApp.savePhoto('p_osial_diagram', { albums: ['screenshots'] }); else JC.ui.toast('Saved to Photos', { icon: 'square.and.arrow.down' }); JC.story.act('photo_taken', { art: 'p_osial_diagram', from: 'safari' }); }, 'w-btn-ghost')),
        f.osial_sent ? h('div.w-ni-warn.sent', JC.icon('bolt.fill', { size: 18 }), h('span', 'AUTHORIZATION RECEIVED · Unit 3 armed.')) : f.card_frozen ? h('div.w-ni-note', 'Funding hold: the Director’s card controls are blocking the OSIAL/PH3 release.') : null), 'Projects')),
        reader: { title: 'Project OSIAL — Operating protocol (rev. 4)', byline: 'Northland Bank Group · RESTRICTED', paras: ['Resonators on pillars G-4, G-9 and G-17 (Unit 3). Activation Sunday 23:00. Funding ℳ3,000,000 to Sea Lantern Logistics. Sole signatory: Tartaglia (countersignature removed in rev. 4).'] } };
    },
    '/projects/debt': () => page('w-ni-page', 'Liyue Debt Restructuring — Northland Intranet', niChrome(h('div.w-ni-doc', h('h1', 'Liyue Debt Restructuring'), para(['Northland Bank will write off ℳ1.8 billion of Liyue’s sovereign debt.', 'Consideration: one (1) item, delivered at the Golden House after the Rite of Parting by “the counterparty’s representative”. Contract witnessed by the Office of the Eighth.', 'Note from the Ninth: “Whoever he is, he read every clause. Twice. And asked for tea.”'])), 'Projects')),
    '/projects/golden-house': () => page('w-ni-page', 'Golden House handover — Northland Intranet', niChrome(h('div.w-ni-doc', h('h1', 'Golden House handover'), para(['Sunday, 15:00. The Golden House vault.', 'Item: “G.” (a gnosis). Counterparty’s representative: a consultant from Wangsheng Funeral Parlor.', 'Liyue Branch Director: not to be informed. — Office of the Eighth'])), 'Projects')),
    '/projects/aquarium': () => page('w-ni-page', 'Branch aquarium — Northland Intranet', niChrome(h('div.w-ni-doc', h('h1', 'Branch aquarium (thaw)'), art('p_aquarium_frozen', 'w-ni-diagram'), para(['Status: frozen solid (third time this month).', 'Cause: a junior agent with a Cryo Delusion “wanted the fish to be cool”.', 'The fish are alive. Somehow. Do not tell the Director.'])), 'Projects')),
    '/directory': () => page('w-ni-page', 'Directory — Northland Intranet', niChrome(h('div.w-ni-sec', h('h2', 'Liyue Branch directory'), [['Tartaglia', 'Branch Director · ext. 11 · out of office'], ['Ekaterina', 'Reception · ext. 1'], ['Signora', 'Office of the Eighth (visiting) · do not call'], ['Pyotr', 'Agent · night shift'], ['Lyuba', 'Agent · facilities (aquarium)'], ['Boris', 'Agent · vending machine liaison'], ['Anya', 'Agent · night shift'], ['Kolya', 'Agent · on medical leave (Chasm)'], ['Valentina', 'Agent · logistics']].map(([n, r]) => h('div.w-nb-row', h('b', n), h('span', r)))), 'Directory')),
    '/medical': () => {
      const box = h('div.w-ni-sec', h('h2', 'Northland Medical Wing · appointments'));
      const draw = () => {
        box.querySelectorAll('.w-ni-appt, .w-ni-note').forEach((n) => n.remove());
        const cur = JC.store.get('events', 'ev_dottore');
        if (cur) box.append(h('div.w-ni-appt', h('b', 'Mon 09:00 · “Delusion check-up”'), h('span', 'Patient: Branch Director. Family baseline sample requested: T. (age 8).'), h('span', 'Physician: the Second.'), Btn('Cancel appointment', () => JC.ui.alert({ title: 'Cancel Appointment?', message: 'The Office of the Second will be notified. He does not like cancellations.', buttons: [{ text: 'Keep', style: 'cancel' }, { text: 'Cancel It', style: 'destructive', onTap: () => { JC.store.remove('events', 'ev_dottore'); JC.story.act('event_delete', { id: 'ev_dottore', title: cur.title, from: 'intranet' }); JC.ui.toast('Appointment cancelled', { icon: 'calendar.badge.minus' }); draw(); } }] }), 'w-btn-nb')));
        else box.append(h('div.w-ni-note', 'No upcoming appointments. (A note in the margin: “He will reschedule. He always does. Keep the boy away from the Medical Wing.” — E.)'));
      };
      draw();
      return page('w-ni-page', 'Medical — Northland Intranet', niChrome(box, 'Medical'));
    },
  };
  site('intranet.northland.sn', {
    name: 'Northland Intranet', icon: { letter: '❄', bg: '#0b1b2c', fg: '#9fd0ff' },
    pages: Object.assign({ '/': () => (web.signedIn('intranet') ? NI_PAGES['/home']() : niLogin()) }, Object.fromEntries(Object.entries(NI_PAGES).map(([k, fn]) => [k, () => (web.signedIn('intranet') ? fn() : niLogin())]))),
    notFound: () => (web.signedIn('intranet') ? NI_PAGES['/home']() : niLogin()),
  });

  // ═══ Liyue Air ═══════════════════════════════════════════════════════════
  const LA = 'https://liyueair.ly';
  const FLIGHTS = {
    LA711: { no: 'LA 711', from: ['ZPL', 'Zapolyarny'], to: ['LYH', 'Liyue Harbor Intl'], dep: '+0 23:50', arr: '+1 07:40', actDep: '+0 23:58', estArr: '+1 07:36', gate: 'B4', arrGate: 'B', belt: '3', plane: 'Liyue Air 787-9 “Cloud Retainer”', pax: 'TONIA, TEUCER (unaccompanied minor service)' },
    LA712: { no: 'LA 712', from: ['LYH', 'Liyue Harbor Intl'], to: ['ZPL', 'Zapolyarny'], dep: '+3 13:10', arr: '+3 21:05', actDep: '+3 13:10', estArr: '+3 21:05', gate: 'D2', arrGate: 'A', belt: '1', plane: 'Liyue Air 787-9 “Mountain Shaper”', pax: 'TONIA, TEUCER' },
  };
  function laChrome(body) {
    return h('div.w-la', h('div.w-la-hdr', A(LA + '/', h('span.w-la-logo', h('span.w-la-mark', '✈'), 'LIYUE AIR')), h('div.w-la-nav', A(LA + '/flight/LA711', 'Flight status'), A(LA + '/help/unaccompanied-minors', 'Help'))), body, h('div.w-la-foot', 'Liyue Air · Customer service 95536 (24 h) · Liyue Harbor International Airport'));
  }
  function flightPage(id) {
    const F = FLIGHTS[id];
    if (!F) return null;
    const t = now(), dep = T(F.dep), aDep = T(F.actDep), arr = T(F.estArr);
    let status, cls, pct;
    if (t < dep - 40 * 60e3) { status = 'Scheduled'; cls = 'ok'; pct = 0; }
    else if (t < aDep) { status = t < dep ? 'Boarding' : 'Delayed · departing 23:58'; cls = t < dep ? 'ok' : 'late'; pct = 0; }
    else if (t < arr) { status = 'In flight'; cls = 'air'; pct = Math.round(((t - aDep) / (arr - aDep)) * 100); }
    else { status = 'Landed ' + JC.util.fmtTime(arr); cls = 'ok'; pct = 100; }
    const left = arr - t;
    const plane = h('div.w-la-track', h('div.w-la-line', h('div', { style: { width: pct + '%' } })), h('div.w-la-plane', { style: { left: pct + '%' } }, '✈'));
    const isKids = id === 'LA711';
    return page('w-la-page', F.no + ' flight status — Liyue Air', laChrome(h('div.w-la-flight',
      h('div.w-la-no', F.no, h('span.w-la-status', { class: { [cls]: true } }, status)),
      h('div.w-la-route', h('div', h('b', F.from[0]), h('span', F.from[1]), h('small', 'Dep ' + JC.util.fmtTime(dep) + (aDep !== dep ? ' (actual ' + JC.util.fmtTime(aDep) + ')' : ''))), h('div.w-la-mid', plane, pct > 0 && pct < 100 ? h('small', Math.floor(left / 3600e3) + ' h ' + Math.round((left % 3600e3) / 60e3) + ' min remaining · 11,280 m') : null), h('div', h('b', F.to[0]), h('span', F.to[1]), h('small', 'Arr ' + JC.util.fmtTime(arr)))),
      h('table.w-la-tbl', [['Date', JC.util.fmtDate(dep, 'full')], ['Departure gate', F.gate], ['Arrival', 'Gate ' + F.arrGate + ' · Belt ' + F.belt], ['Aircraft', F.plane]].map(([k, v]) => h('tr', h('th', k), h('td', v)))),
      isKids ? h('div.w-la-umnr', h('b', 'Unaccompanied minors on this flight'), h('span', 'Passengers: ' + F.pax + '. Staff will escort them to Gate B and release them only to the adult named on the booking: '), h('b', 'Office of Pulcinella (Northland Executive Travel) — “a Northland driver”.'), h('span', 'To change the collecting adult, call 95536 before landing.'), Btn('Call Liyue Air (95536)', () => JC.callui && JC.callui.dialNumber('95536'), 'w-btn-la')) : h('div.w-la-umnr', h('b', 'Check-in'), h('span', 'Check-in opens 11:30 at Counter D. Unaccompanied minors must be checked in by a parent or guardian.')),
      A(LA + '/help/unaccompanied-minors', h('div.w-la-help', 'Unaccompanied minor service ›')))));
  }
  site('liyueair.ly', {
    name: 'Liyue Air', icon: { letter: '✈', bg: '#b3261e', fg: '#ffe6a8' },
    pages: {
      '/': () => page('w-la-page', 'Liyue Air — Fly with the clouds', laChrome(h('div.w-la-home', h('h1', 'Flight status'), (() => { const inp = JC.ui.input({ placeholder: 'Flight number, e.g. LA 711', cap: 'characters', enterkey: 'search', cls: 'w-input', onSubmit: (v) => goFrom(inp, LA + '/flight/' + v.replace(/\s+/g, '').toUpperCase()) }); return inp; })(), A(LA + '/flight/LA711', h('div.w-la-help', 'LA 711 · Zapolyarny → Liyue Harbor ›')), A(LA + '/flight/LA712', h('div.w-la-help', 'LA 712 · Liyue Harbor → Zapolyarny ›'))))),
      '/help/unaccompanied-minors': () => page('w-la-page', 'Unaccompanied minors — Liyue Air', laChrome(h('div.w-la-home', h('h1', 'Unaccompanied minor service'), para(['Children aged 5–11 travelling alone are escorted by Liyue Air staff from check-in to arrival.', 'On arrival, children are released only to the adult named on the booking, on presentation of identity documents.', 'To change the collecting adult, the person who made the booking — or a parent — must call Customer Service on 95536 before the flight lands. Changes cannot be made at the gate.', 'Older siblings (12+) may travel with younger siblings, but the service still applies to the younger child.']), Btn('Call 95536', () => JC.callui && JC.callui.dialNumber('95536'), 'w-btn-la')))),
    },
    patterns: [[/^\/flight\/([\w-]+)$/, (ctx, m) => flightPage(m[1].replace(/[^A-Z0-9]/gi, '').toUpperCase()) || page('w-la-page', 'Flight not found — Liyue Air', laChrome(h('div.w-la-home', h('h1', 'Flight not found'), h('p', 'We couldn’t find ' + m[1] + '. Try LA 711.'))))]],
  });

  // ═══ Wangsheng Funeral Parlor ═════════════════════════════════════════════
  const WS = 'https://wangsheng.ly';
  function wsgChrome(body) {
    return h('div.w-wsg', h('div.w-wsg-hdr', A(WS + '/', h('span.w-wsg-logo', '往生堂', h('small', 'WANGSHENG FUNERAL PARLOR'))), h('div.w-wsg-nav', A(WS + '/rite', 'The Rite'), A(WS + '/coffins', 'Coffins'), A(WS + '/staff', 'Our people'))), body,
      h('div.w-wsg-foot', 'Wangsheng Funeral Parlor · 77th Director Hu Tao · Lantern Street, Liyue Harbor · Open all hours (we have to be).'));
  }
  site('wangsheng.ly', {
    name: 'Wangsheng Funeral Parlor', icon: { letter: '往', bg: '#3b1d18', fg: '#f0b46a' },
    pages: {
      '/': () => page('w-wsg-page', 'Wangsheng Funeral Parlor — Since the Archon War', wsgChrome(h('div', h('div.w-wsg-hero', art('p_wangsheng_door', 'w-wsg-heroimg'), h('div.w-wsg-banner', '👻 AUTUMN SALE · SECOND COFFIN HALF PRICE · ASK INSIDE 👻')),
        h('div.w-wsg-sec', h('h2', 'Honoured to conduct the Rite of Parting'), h('p', 'Sunday, Yujing Terrace, 10:00. Conducted by our consultant. Glaze lilies may be delivered to the parlour.'), A(WS + '/rite', h('div.w-wsg-cta', 'Read about the Rite ›'))),
        h('div.w-wsg-sec', h('h2', 'A word from the Director'), h('p', '“Life and death are a balance. We keep the books. Book now and the 77th Director will personally see you off — though not too soon, I hope! Unless you’re having a really bad week. Then call me.” — Hu Tao'))))),
      '/rite': () => page('w-wsg-page', 'The Rite of Parting — Wangsheng', wsgChrome(h('div.w-wsg-sec', h('h2', 'The Rite of Parting'), art('p_yujing_lanterns', 'w-wsg-img'), para(['Wangsheng Funeral Parlor has the honour of laying the Founder to rest. The Rite will be conducted by our consultant, Mr. Zhongli, who has spent the last two weeks researching six thousand years of funeral custom and has, in his words, “some notes”.', 'The coffin is of Cloud Retainer’s cypress, sealed in the old way. Mourners may approach from 12:30.', 'No incense, please. No fireworks, please. (Mr. Zhongli was very firm about the fireworks.)'])))),
      '/coffins': () => page('w-wsg-page', 'Coffins — Wangsheng', wsgChrome(h('div.w-wsg-sec', h('h2', 'Coffins'), art('p_coffin4', 'w-wsg-img'), [['No. 1 · The Classic', 'Cypress, lacquered · ℳ8,800'], ['No. 2 · The Scholar', 'With a little shelf for books · ℳ12,000'], ['No. 3 · The Adventurer', 'Reinforced. Waterproof. You never know. · ℳ15,500'], ['No. 4 · Showroom model', 'Currently unavailable (occupied?) · ℳ —']].map(([t, s]) => h('div.w-wsg-row', h('b', t), h('span', s))), h('p.w-wsg-small', 'Air holes available on request. We don’t ask why.')))),
      '/staff': () => page('w-wsg-page', 'Our people — Wangsheng', wsgChrome(h('div.w-wsg-sec', h('h2', 'Our people'), [['Hu Tao', '77th Director. Poet. Ghost enthusiast. Has a coupon for you.'], ['Zhongli', 'Consultant. Expert in ritual, history, tea, antiques and contracts. Does not handle cash.'], ['Qiqi', 'Herbalist (Bubu Pharmacy, on loan). Please introduce yourself every time.']].map(([t, s]) => h('div.w-wsg-row', h('b', t), h('span', s)))))),
    },
  });

  // ═══ The Millelith (Lost & Found, missing persons) ═══════════════════════
  const ML = 'https://millelith.ly';
  function mlChrome(body) { return h('div.w-ml', h('div.w-ml-hdr', A(ML + '/', h('span.w-ml-logo', '⛨ THE MILLELITH', h('small', 'Liyue Harbor')))), body, h('div.w-ml-foot', 'Emergency: 110 · Harbor Road post open 24 hours')); }
  site('millelith.ly', {
    name: 'The Millelith', icon: { letter: '⛨', bg: '#5a3d12', fg: '#ffe2a0' },
    pages: {
      '/': () => page('w-ml-page', 'The Millelith — Liyue Harbor', mlChrome(h('div.w-ml-sec', h('h2', 'Notices'), [['Rite of Parting', 'Harbor Road and Yujing Terrace Road closed Sunday from 07:00.'], ['Guyun Stone Forest', 'Vessels are asked to keep clear of pillar G-17 until further notice. Routine.'], ['Lost & Found', 'Found property can be handed in at any post.']].map(([t, s]) => h('div.w-ml-row', h('b', t), h('span', s))), A(ML + '/lost-and-found', h('div.w-ml-cta', 'Lost & Found ›')), A(ML + '/missing/aether', h('div.w-ml-cta', 'Missing persons ›'))))),
      '/lost-and-found': () => page('w-ml-page', 'Lost & Found — The Millelith', mlChrome(h('div.w-ml-sec', h('h2', 'Lost & Found'), para(['Found property can be handed in at any Millelith post in Liyue Harbor at any time. The officer on duty will record the item and contact the owner — usually the same day.', 'Nearest 24-hour desk to the waterfront: Harbor Road Post, beside Pier 4.', 'Phones: please bring the device as you found it. If it is locked, we can still reach the owner through the network.']),
        h('div.w-ml-btns', Btn('Directions to Harbor Road Post', () => JC.os.open('maps', { directions: 'millelith' }), 'w-btn-ml'), Btn('Call 110', () => JC.callui && JC.callui.dialNumber('110'), 'w-btn-ghost'))))),
      '/missing/aether': () => page('w-ml-page', 'MISSING: Aether — The Millelith', mlChrome(h('div.w-ml-sec.w-ml-missing', h('div.w-ml-mh', 'MISSING'), h('h2', 'Aether'), h('table.w-arch-rec', [['Age', 'Appears about 16'], ['Hair', 'Blond, long braid'], ['Last seen', 'Unknown. Possibly the Chasm.'], ['Reported by', 'His sister']].map(([k, v]) => h('tr', h('th', k), h('td', v)))), h('p', 'Any information to the Millelith or to the reporting party. “I’ll know him when I see him. Please.”')))),
    },
  });

  // ═══ Heyu Tea House · Yun Jin Troupe ═════════════════════════════════════
  site('heyu.ly', {
    name: 'Heyu Tea House', icon: { letter: '和', bg: '#6d1f2f', fg: '#ffd9a0' },
    pages: {
      '/': () => SITES['heyu.ly'].pages['/troupe'](),
      '/troupe': () => page('w-heyu-page', 'Yun Jin Troupe at Heyu Tea House', [h('div.w-heyu', h('div.w-heyu-hdr', h('div.w-heyu-logo', '雲堇 · YUN JIN TROUPE'), h('div.w-heyu-sub', 'Heyu Tea House · Lantern Street')),
        art('p_heyu_stage', 'w-heyu-hero'),
        h('div.w-heyu-sec', h('h2', '“The Divine Damsel of Devastation”'), h('p', 'A god makes a contract with a city and keeps it for six thousand years. A retelling of the founding of Liyue in two acts.'),
          [['Sat 17 Oct · 15:00 matinee', 'SOLD OUT · returns at the box office'], ['Sat 17 Oct · 19:30', 'Few seats'], ['Sun 18 Oct', 'No performance — Rite of Parting']].map(([d, s]) => h('div.w-heyu-row', h('b', d), h('span', s))),
          Btn('Call the box office', () => JC.callui && JC.callui.dialNumber('(0761) 555 0156'), 'w-btn-heyu'), Btn('Your tickets (Wallet)', () => JC.os.open('wallet', { card: 'yunjin' }), 'w-btn-ghost')),
        h('div.w-foot', 'Heyu Tea House · Tea service during the interval · Box seats include osmanthus tea and almond tofu'))]),
    },
  });

  // ═══ The Crux · Steambird · Jade Chamber ═════════════════════════════════
  const CRUX_SITE = {
    name: 'The Crux Fleet', icon: { letter: '⚓', bg: '#1f2d4d', fg: '#ffd166' },
    pages: { '/': () => page('w-crux-page', 'The Crux Fleet — Captain Beidou', [h('div.w-crux', h('div.w-crux-hdr', '⚓ THE CRUX FLEET'), art('p_alcor_deck', 'w-crux-hero'), h('div.w-crux-sec', h('h2', 'Sail with the Crux'), para(['Cargo, escort and passage north. Ask for the Alcor at Pier 2.', 'Monday sailings: a passage north for anyone Captain Beidou says yes to. She says yes to people who keep their word.', 'Arm-wrestling challenges accepted at the Third-Round Knockout. Losers buy the round.'])), h('div.w-foot', 'The Crux Fleet · Pier 2 · No contracts. A handshake is enough.'))]) },
  };
  site('crux.ly', CRUX_SITE);
  site('cruxshipping.ly', Object.assign({}, CRUX_SITE));
  site('steambird.fon', {
    name: 'The Steambird', icon: { letter: 'S', bg: '#1c2a3a', fg: '#e9d8a6' },
    pages: {
      '/': () => page('w-steam', 'The Steambird — Fontaine', [h('div.w-steam-mast', 'The Steambird'), h('div.w-steam-sub', 'Fontaine’s newspaper of record · Court of Fontaine'), [['Liyue prepares to bury a god', 'https://steambird.fon/world/liyue-rite'], ['“Project O”: what is Northland Bank building in Liyue?', 'https://steambird.fon/world/project-o'], ['Opera Epiclese announces a season of trials', 'https://steambird.fon/']].map(([t, u]) => A(u, h('div.w-steam-item', t)))]),
      '/world/project-o': () => article({ brand: 'The Steambird', cls: 'w-steam', kicker: 'WORLD · INVESTIGATION', title: '“Project O”: what is Northland Bank building in Liyue?', by: 'Charlotte, Chief Reporter', date: 'Oct 14, 2026', paras: ['Filings seen by The Steambird list a Northland Bank project in Liyue only as “O”, with funding routed through a shipping company, Sea Lantern Logistics, registered three weeks ago.', 'Sea Lantern Logistics owns no ships.', 'A Northland employee, speaking on condition of anonymity, said: “It was the young one’s idea. He tried to stop it. Nobody stops the Eighth.”'] }, (b) => h('div', h('div.w-steam-mast.small', 'The Steambird'), b)),
      '/world/liyue-rite': () => article({ brand: 'The Steambird', cls: 'w-steam', kicker: 'WORLD', title: 'Liyue prepares to bury a god', by: 'Charlotte, Chief Reporter', date: 'Oct 15, 2026', paras: ['Liyue will hold “the largest funeral in six thousand years” on Sunday. Our correspondent asks: whose six thousand years?', 'The ceremony is being run by a funeral parlour whose director hands out coupons.'] }, (b) => h('div', h('div.w-steam-mast.small', 'The Steambird'), b)),
    },
  });
  site('jadechamber.ly', {
    name: 'The Jade Chamber', icon: { letter: '玉', bg: '#0f3b33', fg: '#f5e6b8' },
    pages: { '/': () => page('w-jade', 'The Jade Chamber — Office of the Tianquan', [h('div.w-jade-hdr', '玉京 · THE JADE CHAMBER'), art('p_jade_chamber', 'w-jade-hero'), h('div.w-jade-sec', h('h2', 'Office of the Tianquan'), para(['The Tianquan, Ningguang, holds office in the Jade Chamber above the harbor.', 'To report a matter of public safety to the Tianquan’s office, write to tianquan@jadechamber.ly. Sources are protected. The Tianquan reads everything herself.']), Btn('Write to the Tianquan', () => JC.os.open('mail', { compose: { to: 'tianquan@jadechamber.ly', subject: '' } }), 'w-btn-jade')), h('div.w-foot', 'The Jade Chamber · Liyue Qixing')]) },
  });

  // ═══ AskTeyvat (Q&A) · Wishbuzz (lists) ══════════════════════════════════
  const ASK = {
    'has-anyone-actually-seen-rex-lapis-in-human-form': ['Has anyone actually seen Rex Lapis in human form?', 'Asked by a user in Liyue Harbor · 9 days ago', [['teahouse_granny', 'My grandmother swore he bought tea from her stall in 1926 and didn’t pay. She said he apologised very beautifully.', 412], ['archives_nerd', 'There is ONE photo. Liyue Archives, PH-1926-0417. Look at it and tell me that isn’t a real man.', 288], ['wangsheng_hutao', 'Seen? No. Met? Maybe. Will I say more? For a coupon. 👻', 97]]],
    'is-osial-real': ['Is Osial real or just something grandmas say?', 'Asked by a fisherman’s son · 2 days ago', [['old_salt_47', 'My grandpa says the sea goes quiet before it wakes up. The sea has been quiet all week.', 96], ['millelith_off_duty', 'Please stay away from G-17. That is all I am allowed to say.', 54], ['skeptic_qingce', 'It’s a myth. Like Rex Lapis being a real guy who walked around buying tea.', 3]]],
    'how-much-is-a-guizhong-era-tea-set-worth': ['How much is a Guizhong-era tea set worth?', 'Asked by jade_connoisseur_88 · 1 day ago', [['antique_dealer_li', 'Depends. If it’s real, more than your house. If the seller is in a hurry, ask why.', 31], ['jade_connoisseur_88', 'I will not be outbid. That’s all.', 2]]],
    'how-long-can-a-person-stay-in-a-coffin': ['How long can a person stay in a coffin? (asking for a friend)', 'Asked by an anonymous user · 1 hour ago', [['wangsheng_hutao', 'Depends on the coffin! Ours have air holes now. Also a cupholder. Book a viewing! 👻', 233], ['concerned_citizen', 'Why is the director of Wangsheng answering this at 1 AM', 120], ['wangsheng_hutao', 'No reason!!', 118]]],
    'how-do-i-tell-my-little-siblings-what-i-really-do-for-work': ['How do I tell my little siblings what I really do for work?', 'Asked by a user in Liyue Harbor · 3 weeks ago', [['big_sis_mond', 'You don’t have to tell them everything. Just don’t tell them anything that will hurt more later.', 77], ['former_debt_collector', 'They think I sell toys. It has been five years. I am now very good at describing toys.', 64], ['tonia_m', 'Your sister probably already knows. She’s waiting for you to say it first.', 51]]],
    'is-it-normal-to-want-to-pay-for-every-dinner': ['Is it normal to want to pay for every dinner?', 'Asked by a user in Liyue Harbor · 2 months ago', [['heyu_regular', 'If you want to, and he lets you, that’s not a bill. That’s a ritual.', 158], ['accountant_ning', 'Keep receipts. For emotional reasons.', 44], ['paimon_official', 'Paimon thinks you should pay for Paimon’s dinners too!!', 12]]],
    'has-anyone-seen-a-blond-boy-with-a-long-braid': ['Has anyone seen a blond boy with a long braid and a white scarf?', 'Asked by traveler.l · 4 months ago', [['traveler.l', 'My brother. We were separated a long time ago. If you’ve seen him, please message me.', 40], ['chasm_miner', 'Someone like that was seen near the Chasm with… people in masks. I’m sorry.', 22]]],
  };
  site('askteyvat.com', {
    name: 'AskTeyvat', icon: { letter: 'A', bg: '#ff5a5f', fg: '#fff' },
    pages: { '/': () => page('w-ask', 'AskTeyvat — questions & answers', [h('div.w-ask-hdr', 'AskTeyvat'), Object.keys(ASK).map((k) => A(ASKQ(k), h('div.w-ask-item', ASK[k][0])))]) },
    patterns: [[/^\/q\/([\w-]+)$/, (ctx, m) => {
      let a = ASK[m[1]];
      if (!a) {
        const q = unslug(m[1]);
        a = [title(q) + '?', 'Asked by a user in Liyue Harbor · ' + (2 + hash(q) % 20) + ' days ago', [['chihu_rock_tea', pick(['Honestly? Just ask them directly. It saves everyone time.', 'Been there. What worked for me was being completely honest.', 'Sleep on it, then do the kind thing.'], q, 1), 80 + hash(q) % 300], ['feiyun_auntie', pick(['Have you tried feeding them first?', 'Say it simply. People respect simple.', 'Whatever you do, don’t do it by text at 2 AM.'], q, 2), 30 + hash(q) % 90], ['anon_' + (hash(q) % 99), 'Following. Same question.', 4]]];
      }
      const st = state('ask:' + m[1], { votes: {}, mine: [] });
      const ansEl = h('div.w-ask-answers');
      const draw = () => {
        ansEl.innerHTML = '';
        a[2].concat(st.mine).forEach((x, i) => ansEl.appendChild(h('div.w-ask-ans', h('div.w-ask-vote', h('span.tap', { onTap: () => { st.votes[i] = st.votes[i] === 1 ? 0 : 1; draw(); } }, '▲'), h('b', String(x[2] + (st.votes[i] || 0))), h('span', '▼')), h('div', h('div.w-ask-by', x[0]), h('div.w-ask-t', x[1])))));
      };
      draw();
      const inp = JC.ui.input({ multiline: true, rows: 2, placeholder: 'Write an answer…', cls: 'w-input' });
      return { title: a[0] + ' — AskTeyvat', node: h('div.w-page.w-ask', h('div.w-ask-hdr', A('https://askteyvat.com/', 'AskTeyvat')), h('h1.w-ask-q', a[0]), h('div.w-ask-d', a[1]), h('div.w-ask-n', (a[2].length + st.mine.length) + ' answers'), ansEl, h('div.w-ask-new', inp, Btn('Post answer', () => { if (!inp.value.trim()) return; st.mine.push(['tartaglia', inp.value.trim(), 1]); inp.value = ''; draw(); JC.story.act('comment', { text: 'answer', page: m[1], web: true }); }, 'w-btn-ask'))), reader: { title: a[0], byline: 'AskTeyvat', paras: [a[1]].concat(a[2].map((x) => x[0] + ': ' + x[1])) } };
    }]],
  });
  const BUZZ = {
    'signs-you-are-the-favourite-big-sibling': ['14 Signs You’re the Favourite Big Sibling (Even Though You’re Never Home)', ['They save their best drawings for you.', 'They tell everyone at school what your job is. Loudly. With details you never gave them.', 'Your little brother has named a plush after a character you invented.', 'They call at the worst possible moment and you always pick up.', 'You send money home and call it “commission”.', 'Your sister knows. She hasn’t said. She’s waiting.']],
    'he-forgot-his-wallet-again': ['He “Forgot His Wallet” Again: 9 Things It Might Actually Mean', ['He genuinely does not understand money.', 'He likes that you insist.', 'He is very, very old-fashioned.', 'He likes that you keep coming back.', 'He’s keeping a tab in his head. Not of the money. Of the evenings.']],
    'gifts-for-a-man-who-has-lived-a-long-time': ['11 Gifts for the Man Who Has Seen Everything', ['Tea he hasn’t tried (good luck).', 'A song he hasn’t heard (better luck).', 'Something old that used to belong to someone he loved.', 'Your time. Your honest time.']],
  };
  site('wishbuzz.com', {
    name: 'Wishbuzz', icon: { letter: 'W', bg: '#ffcc00', fg: '#7c3aed' },
    pages: { '/': () => page('w-buzz', 'Wishbuzz', [h('div.w-buzz-hdr', 'Wishbuzz ✨'), Object.keys(BUZZ).map((k) => A('https://wishbuzz.com/life/' + k, h('div.w-buzz-item', BUZZ[k][0])))]) },
    patterns: [[/^\/life\/([\w-]+)$/, (ctx, m) => {
      let b = BUZZ[m[1]];
      if (!b) { const q = unslug(m[1]); b = [(5 + hash(q) % 15) + ' Things Nobody Tells You About ' + title(q), ['It’s more complicated than it looks.', 'Everyone in Liyue pretends to be an expert.', 'The best advice is usually from someone who’s been through it.', 'Number four will surprise you (it’s that you should just ask).', 'It gets easier.']]; }
      const items = b[1].map((t, i) => h('div.w-buzz-li', h('div.w-buzz-n', String(i + 1)), h('div', h('b', t))));
      const st = state('buzz:' + m[1], { r: null });
      const reacts = h('div.w-buzz-reacts', ['😂 LOL', '😭 Cry', '😍 Love', '🙄 Eh'].map((r) => h('span.tap', { class: { on: st.r === r }, onTap: (e) => { st.r = r; reacts.querySelectorAll('span').forEach((s) => s.classList.toggle('on', s === e.currentTarget)); } }, r)));
      return { title: b[0] + ' — Wishbuzz', node: h('div.w-page.w-buzz', h('div.w-buzz-hdr', A('https://wishbuzz.com/', 'Wishbuzz ✨')), h('h1.w-buzz-t', b[0]), h('div.w-buzz-by', 'by Wishbuzz Staff · ' + (12 + hash(b[0]) % 400) + 'K views'), items, h('div.w-buzz-q', 'What’s your reaction?'), reacts, h('div.w-buzz-ad', 'Advertisement · Wanmin Go: free delivery on hotpot sets this weekend')), reader: { title: b[0], byline: 'Wishbuzz', paras: b[1].map((t, i) => (i + 1) + '. ' + t) } };
    }]],
  });

  // ═══ Akasha (encyclopedia) ═══════════════════════════════════════════════
  const WIKI = {
    Rex_Lapis: { title: 'Rex_Lapis', short: 'Geo Archon; Founder of Liyue Harbor', img: 'p_rexlapis_1926', info: [['Other names', 'Morax; the Lord of Geo; the God of Contracts'], ['Domain', 'Geo, contracts, commerce'], ['Founded', 'Liyue Harbor (c. 6,000 years ago)'], ['Died', '1 October 2026 (announced)'], ['Rite of Parting', '18 October 2026, Yujing Terrace']],
      lead: ['Rex Lapis, also known as Morax, is the Geo Archon and the founder of Liyue Harbor. He is the god of contracts and commerce, and is said to have walked among mortals in human form, most famously at the founding of the Liyue Exchange in 1926, where the only known photograph of him was taken.'],
      secs: [['Legend', ['In the Archon War he sealed many gods and monsters beneath the land and sea of Liyue, among them Osial, Overlord of the Vortex, beneath Guyun Stone Forest.', 'He is said to have had a close friend, the goddess Guizhong, whose favourite flower was the glaze lily.']], ['Appearance', ['Accounts agree on a tall man of about thirty, with long dark hair, amber eyes and an unhurried manner. Several accounts from different centuries mention that he did not carry money.']], ['Death', ['On 1 October 2026 the Liyue Qixing announced his death. The Rite of Parting was entrusted to Wangsheng Funeral Parlor.']]] },
    Osial: { title: 'Osial', short: 'Sea god of Liyue legend', img: 'p_storm_guyun', info: [['Title', 'Overlord of the Vortex'], ['Sealed', 'Beneath Guyun Stone Forest'], ['Sealed by', 'Rex Lapis']], lead: ['Osial, the Overlord of the Vortex, is an ancient sea god who fought Rex Lapis in the Archon War and was sealed beneath the stone spears of Guyun Stone Forest.'], secs: [['In folklore', ['Fishermen say the sea goes quiet before Osial stirs. Children in the harbor are told that if they are bad, “the vortex will take them”.']]] },
    Guyun_Stone_Forest: { title: 'Guyun_Stone_Forest', short: 'Offshore stone pillars', img: 'p_storm_guyun', info: [['Location', 'East of Liyue Harbor'], ['Pillars', 'Numbered G-1 to G-41 by the Millelith']], lead: ['Guyun Stone Forest is a field of enormous stone spears rising from the sea east of Liyue Harbor. Legend holds that they were thrown by Rex Lapis to seal Osial.'], secs: [] },
    Guizhong: { title: 'Guizhong', short: 'Goddess of Dust', img: 'p_glaze_lily', info: [['Also known as', 'Goddess of Dust; Havria (disputed)'], ['Associated', 'Glaze lilies, ceramics, invention']], lead: ['Guizhong was a god of ancient Liyue, remembered as an inventor and as the dearest friend of Rex Lapis. She died in the Archon War.'], secs: [['Legacy', ['Ceramics from her era sometimes bear dedications. The most famous reads “for Morax — G.”, which collectors believe to be in her hand.']]] },
    Glaze_lily: { title: 'Glaze_lily', short: 'Flower', img: 'p_glaze_lily', info: [['Native to', 'Liyue'], ['Blooms', 'Autumn, in quiet places']], lead: ['The glaze lily is a rare Liyue flower that only blooms where it is left alone. It is associated with remembrance and with the goddess Guizhong.'], secs: [] },
    Rite_of_Parting: { title: 'Rite_of_Parting', short: 'Liyue funeral ceremony', img: 'p_yujing_lanterns', info: [['Date', '18 October 2026'], ['Place', 'Yujing Terrace'], ['Conducted by', 'Wangsheng Funeral Parlor']], lead: ['The Rite of Parting is the funeral ceremony for Rex Lapis, held on Yujing Terrace. The founder’s lanterns are lit on the eve and extinguished at 23:00 on the day.'], secs: [] },
    Liyue_Harbor: { title: 'Liyue_Harbor', short: 'City and port', img: 'p_harbor_day', info: [['Founded', 'c. 6,000 years ago'], ['Governed by', 'The Liyue Qixing'], ['Landmarks', 'Jade Chamber, Yujing Terrace, Golden House, Wangsheng']], lead: ['Liyue Harbor is the largest port in Teyvat and the commercial capital of Liyue, founded by Rex Lapis.'], secs: [['Districts', ['Feiyun Slope, Chihu Rock, Lantern Street, the waterfront piers, Yujing Terrace.']]] },
    Liyue_Qixing: { title: 'Liyue_Qixing', short: 'Governing council', img: 'p_jade_chamber', info: [['Seat', 'The Jade Chamber'], ['Tianquan', 'Ningguang']], lead: ['The Liyue Qixing are seven merchants who govern Liyue Harbor on behalf of Rex Lapis. The Tianquan, Ningguang, oversees law and order.'], secs: [] },
    Northland_Bank: { title: 'Northland_Bank', short: 'Snezhnayan bank', img: 'p_northland_lobby', info: [['Headquarters', 'Zapolyarny Palace, Snezhnaya'], ['Liyue branch', '1 Harbor Road (since March 2026)'], ['Board', 'Eleven directors (“the Harbingers”)']], lead: ['Northland Bank Group is a Snezhnayan bank and the largest creditor of several nations of Teyvat. Its enforcement arm is popularly known as the Fatui.'], secs: [] },
    Fatui: { title: 'Fatui', short: 'Popular name for Northland’s enforcement arm', info: [['Led by', 'The Harbingers'], ['Allegiance', 'The Tsaritsa']], lead: ['“Fatui” is the popular name for the security, intelligence and debt-collection staff of Northland Bank Group. The Bank does not use the term.'], secs: [] },
    Harbingers: { title: 'Harbingers', short: 'Northland Bank’s executive board', info: [['Members', '11'], ['Youngest', 'Tartaglia (Eleventh), b. 2004']], lead: ['The Harbingers are the eleven executive directors of Northland Bank Group. Each is known by a number and a title. The Eleventh, Tartaglia, joined the board in 2024 at nineteen and heads the Bank’s Liyue branch.'], secs: [] },
    Abyss_Order: { title: 'Abyss_Order', short: 'Secretive organisation', img: 'p_abyss_map', info: [['Activity', 'The Chasm; Khaenri’ah ruins'], ['Leader', 'Unknown (“the Prince”)']], lead: ['The Abyss Order is a secretive organisation linked to the ruins of Khaenri’ah and to disturbances in the Chasm.'], secs: [] },
    Wangsheng_Funeral_Parlor: { title: 'Wangsheng_Funeral_Parlor', short: 'Funeral parlour', img: 'p_wangsheng_door', info: [['Director', 'Hu Tao (77th)'], ['Consultant', 'Zhongli']], lead: ['Wangsheng Funeral Parlor is the oldest funeral parlour in Liyue Harbor, entrusted with the Rite of Parting in 2026.'], secs: [] },
    The_Crux: { title: 'The_Crux', short: 'Armed merchant fleet', img: 'p_alcor_deck', info: [['Captain', 'Beidou'], ['Flagship', 'The Alcor']], lead: ['The Crux is an armed merchant fleet based in Liyue Harbor, led by Captain Beidou.'], secs: [] },
    Golden_House: { title: 'Golden_House', short: 'Mint of Liyue', img: 'p_golden_house', info: [['Function', 'Mint; treasury'], ['Location', 'North of the harbor']], lead: ['The Golden House is the mint of Liyue, where Mora is struck. It is said to hold the Founder’s most precious possessions.'], secs: [] },
    Snezhnaya: { title: 'Snezhnaya', short: 'Nation of the north', img: 'p_morepesok', info: [['Capital', 'Zapolyarny Palace'], ['Ruler', 'The Tsaritsa']], lead: ['Snezhnaya is a cold nation in the north of Teyvat, ruled by the Tsaritsa.'], secs: [] },
    Morepesok: { title: 'Morepesok', short: 'Fishing town in Snezhnaya', img: 'p_morepesok', info: [['Known for', 'Ice fishing; very large families']], lead: ['Morepesok is a small fishing town on the frozen coast of Snezhnaya.'], secs: [] },
    Bluefin_tuna: { title: 'Bluefin_tuna', short: 'Fish', img: 'p_bluefin', info: [['Record (Liyue)', '312 kg']], lead: ['Bluefin tuna are large fish found in the waters off Liyue. Landing one from a pier is considered nearly impossible.'], secs: [] },
    Yun_Jin: { title: 'Yun_Jin', short: 'Opera singer', img: 'p_heyu_stage', info: [['Troupe', 'Yun Jin Troupe'], ['Venue', 'Heyu Tea House']], lead: ['Yun Jin is a Liyue opera singer and playwright, known for “The Divine Damsel of Devastation”.'], secs: [] },
  };
  site('akasha.wiki', {
    name: 'Akasha', icon: { letter: 'A', bg: '#ffffff', fg: '#1d6b4f' },
    pages: { '/': () => SITES['akasha.wiki'].patterns[0][1](null, [null, 'Liyue_Harbor']) },
    patterns: [[/^\/wiki\/(.+)$/, (ctx, m) => {
      const key = decodeURIComponent(m[1]);
      const w = WIKI[key] || WIKI[Object.keys(WIKI).find((k) => k.toLowerCase() === key.toLowerCase()) || ''];
      const Tt = (w ? w.title : key).replace(/_/g, ' ');
      const srch = JC.ui.input({ placeholder: 'Search Akasha', cap: 'none', enterkey: 'search', cls: 'w-wiki-in', onSubmit: (v) => { if (v.trim()) goFrom(srch, WIKI_URL(title(v.trim()).replace(/\s+/g, '_'))); } });
      const hdr = h('div.w-wiki-hdr', A(WIKI_URL('Liyue_Harbor'), h('span.w-wiki-logo', 'Akasha')), srch);
      if (!w) {
        return { title: Tt + ' — Akasha', node: h('div.w-page.w-wiki', hdr, h('h1.w-wiki-t', Tt), h('div.w-wiki-from', 'From Akasha, the free encyclopedia'), h('p', h('b', Tt), ' may refer to:'), h('ul', h('li', A(SEARCH(Tt), Tt + ' — web results')), h('li', Tt + ' (disambiguation)'), h('li', Tt + ' in the culture of Teyvat')), h('p', 'This article is a stub. You can help Akasha by expanding it.')), reader: null };
      }
      const toc = h('div.w-wiki-toc', h('b', 'Contents'), w.secs.map((s, i) => h('div', (i + 1) + ' ' + s[0])));
      const node = h('div.w-page.w-wiki', hdr, h('h1.w-wiki-t', Tt), h('div.w-wiki-from', 'From Akasha, the free encyclopedia'),
        h('table.w-wiki-info', h('caption', Tt), w.img ? h('tr', h('td', { attrs: { colspan: 2 } }, art(w.img, 'w-wiki-img'))) : null, w.info.map(([k, v]) => h('tr', h('th', k), h('td', v)))),
        para(w.lead), w.secs.length ? toc : null,
        w.secs.map((s) => [h('h2.w-wiki-h2', s[0]), para(s[1])]),
        h('div.w-wiki-ref', h('h2.w-wiki-h2', 'References'), h('ol', [A(HERALD + '/', 'The Liyue Herald archive'), A(ARCH + '/', 'Liyue Archives'), A('https://jadechamber.ly/', 'The Jade Chamber')].map((x) => h('li', x)))),
        h('div.w-wiki-foot', 'This page was last edited on 14 October 2026. Text is available under a free licence.'));
      return { title: Tt + ' — Akasha', node, reader: { title: Tt, byline: 'Akasha', paras: w.lead.concat(...w.secs.map((s) => s[1])) } };
    }]],
  });

  // ═══ The phone's own apps, on the web ════════════════════════════════════
  function appSite(host, o) {
    site(host, {
      name: o.name, icon: o.icon,
      pages: Object.assign({ '/': () => page('w-svc', o.name + ' — ' + o.tag, [h('div.w-svc-hdr', { style: { background: o.icon.bg, color: o.icon.fg } }, h('span.w-svc-logo', o.name), h('span', o.sub || '')), h('h1.w-svc-t', o.tag), para(o.paras), Btn('Open ' + o.name, () => JC.os.open(o.app, o.intent || {}), 'w-btn-svc'), h('div.w-foot', '© 2026 ' + o.name)]) }, o.pages || {}),
      patterns: o.patterns,
    });
  }
  appSite('harborride.ly', { name: 'Harbor Ride', app: 'swift', icon: { letter: 'H', bg: '#0d6e6e', fg: '#fff' }, tag: 'Anywhere in the harbor, in minutes.', sub: 'Rides · Sampans', paras: ['Harbor Go, Comfort, XL — and Sampan water taxis across the harbor.', 'Left something in a car? Use Report a Lost Item in the app; drivers keep found items for 48 hours.'],
    pages: { '/help/lost-items': () => page('w-svc', 'Lost or found an item? — Harbor Ride Help', [h('div.w-svc-hdr', { style: { background: '#0d6e6e', color: '#fff' } }, h('span.w-svc-logo', 'Harbor Ride'), h('span', 'Help')), h('h1.w-svc-t', 'Lost or found an item?'), para(['If you left something in a Harbor Ride, or found something that isn’t yours, the fastest way to sort it out is in the app.', '1. Open Harbor Ride and go to Activity.', '2. Choose the trip.', '3. Tap Help → Report a lost item. You can report something you lost, or something you found — we notify the rider and the driver and arrange a hand-over.']), Btn('Report in Harbor Ride', () => JC.os.open('swift', { report: true }), 'w-btn-svc'), h('div.w-foot', '© Harbor Ride · Support 10655 0762')]) } });
  appSite('wanmingo.ly', { name: 'Wanmin Go', app: 'lotuseats', icon: { letter: 'W', bg: '#e8590c', fg: '#fff' }, tag: 'Hungry at midnight?', sub: 'Delivery', paras: ['Hotpot, jade parcels, almond tofu — delivered across Liyue Harbor until 2 AM.', 'This weekend: free delivery on hotpot sets.'],
    patterns: [[/^\/r\/([\w-]+)$/, (ctx, m) => {
      const r = JC.lotusEatsData && JC.lotusEatsData.RESTS && JC.lotusEatsData.RESTS.find((x) => x.id === m[1]);
      return page('w-svc', (r ? r.name : 'Restaurant') + ' — Wanmin Go', [h('div.w-svc-hdr', { style: { background: '#e8590c', color: '#fff' } }, h('span.w-svc-logo', 'Wanmin Go'), h('span', r ? r.cuisine : 'Restaurant')), r && r.art ? JC.art.el(r.art, { cls: 'w-svc-hero' }) : null, h('h1.w-svc-t', r ? r.name : 'Restaurant not found'), para([r ? r.cuisine + ' · ★ ' + Number(r.rating || 4.8).toFixed(1) : 'This link may have expired.']), Btn('Order in the app', () => JC.os.open('lotuseats', r ? { rest: r.id } : {}), 'w-btn-svc'), h('div.w-foot', '© Wanmin Go')]);
    }]] });
  appSite('ripple.ly', { name: 'Ripple', app: 'wavelet', icon: { letter: 'R', bg: 'linear-gradient(135deg,#3a7bd5,#00d2ff)', fg: '#fff' }, tag: 'Share the moment.', sub: 'Photos · Stories', paras: ['Ripple is better in the app. Log in to see photos and stories from the people you follow.'],
    patterns: [[/^\/(p\/[\w-]+|[\w.]+)$/, (ctx, m) => page('w-svc', 'Ripple', [h('div.w-svc-hdr', { style: { background: 'linear-gradient(135deg,#3a7bd5,#00d2ff)', color: '#fff' } }, h('span.w-svc-logo', 'Ripple'), h('span', m[1])), h('h1.w-svc-t', 'Open this in Ripple'), para(['You’re signed in on this iPhone as @tartaglia.']), Btn('Open Ripple', () => JC.os.open('wavelet', /^p\//.test(m[1]) ? {} : { user: m[1] }), 'w-btn-svc')])]] });
  const fySite = { name: 'Feiyun Market', app: 'feiyun', icon: { letter: '飛', bg: '#c2410c', fg: '#fff' }, tag: 'Buy anything. Bid on everything.', sub: 'Market · Auctions', paras: ['Antiques, flowers, toys and everything else, delivered across Liyue Harbor.', 'Live auction: Lot 1016 · Guizhong-era celadon tea set · ends Sat 00:30.'],
    patterns: [[/^\/(item|lot|l|o|t)\/([\w-]+)$/, (ctx, m) => page('w-svc', 'Feiyun Market', [h('div.w-svc-hdr', { style: { background: '#c2410c', color: '#fff' } }, h('span.w-svc-logo', 'Feiyun Market'), h('span', m[2])), h('h1.w-svc-t', 'This listing opens in the app'), Btn('Open in Feiyun Market', () => JC.os.open('feiyun', m[1] === 'o' ? { order: m[2] } : /^\d+$/.test(m[2]) || m[2] === 'lot_teaset' ? { id: 'lot_teaset' } : { search: m[2].replace(/-/g, ' ') }), 'w-btn-svc')])], [/^\/search$/, (ctx) => page('w-svc', 'Search — Feiyun Market', [h('div.w-svc-hdr', { style: { background: '#c2410c', color: '#fff' } }, h('span.w-svc-logo', 'Feiyun Market')), h('h1.w-svc-t', 'Results for “' + (ctx.q.get('q') || '') + '”'), Btn('See results in the app', () => JC.os.open('feiyun', { search: ctx.q.get('q') || '' }), 'w-btn-svc')])]] };
  appSite('feiyun.ly', fySite);
  appSite('feiyun.market', fySite);
  appSite('reelrush.games', { name: 'Reel Rush', app: 'reelrush', icon: { letter: '🎣', bg: '#0b4f7c', fg: '#fff' }, tag: 'Cast. Reel. Brag.', sub: 'The fishing game', paras: ['Weekly leaderboard: 1. teucer_fishking — 2,047 · 2. tartaglia — 1,998.', 'Beat your friends’ best catch. Bluefin are worth 500.'] });
  site('mingyun.ly', {
    name: 'Mingyun Toys & Games', icon: { letter: '玩', bg: '#2b8a3e', fg: '#fff' },
    pages: { '/': () => SITES['mingyun.ly'].pages['/frost-fortress'](), '/frost-fortress': () => page('w-svc', 'Glacier Guardians Frost Fortress — Mingyun Toys & Games', [h('div.w-svc-hdr', { style: { background: '#2b8a3e', color: '#fff' } }, h('span.w-svc-logo', 'Mingyun Toys & Games'), h('span', 'Lantern Street')), JC.art.el('mk_frost_fortress', { cls: 'w-svc-hero' }), h('h1.w-svc-t', 'Glacier Guardians: Frost Fortress'), para(['Lights up! Snow cannon! Three Guardians included. Ages 6+.', 'ℳ2,400 · In stock at Lantern Street · also on Feiyun Market (same-day delivery).']), Btn('Buy on Feiyun Market', () => JC.os.open('feiyun', { search: 'frost fortress' }), 'w-btn-svc'), Btn('Call the store', () => JC.callui && JC.callui.dialNumber('(0761) 555 0177 2'), 'w-btn-ghost'), h('div.w-foot', '© Mingyun Toys & Games · Lantern Street, Liyue Harbor')]) },
  });
})();
