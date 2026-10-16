/* Safari's fake web (JC.web): a search engine (Wavesearch) that answers any query, ~25 fictional sites
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
  const SEARCH = (q) => 'https://wavesearch.net/search?q=' + enc(q).replace(/%20/g, '+');
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

  // per-session page state (logins, carts, …)
  const mem = {};
  const state = (k, d) => (mem[k] = mem[k] || Object.assign({}, d || {}));

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
    const words = host.replace(/\.(com|net|org|cn|lanling|yunmeng|gusu|qinghe|yiling|io|app|co|info)$/g, '').split(/[.\-_]/).filter((w) => w && w !== 'www');
    const label = words.join(' ') || host;
    const real = /^(google|baidu|bing|yahoo|youtube|facebook|instagram|twitter|x|tiktok|weibo|wechat|apple|amazon|taobao|wikipedia|reddit|netflix|openai|chatgpt)\./.test(host);
    if (real) {
      return page('w-err', 'Cannot Connect', [h('div.w-err-ic', JC.icon('wifi.slash', { size: 46 })), h('div.w-err-t', 'Safari Can’t Connect to the Server'), h('div.w-err-s', 'Safari can’t open “' + host + '” because the server isn’t responding from this network. Everyone here uses Wavesearch anyway.'), A(SEARCH(label), 'Search Wavesearch for “' + label + '”')]);
    }
    return page('w-parked', host, [
      h('div.w-pk-top', h('div.w-pk-dom', host), h('div.w-pk-sale', 'This domain may be for sale')),
      h('div.w-pk-h', 'Related searches'),
      h('div.w-pk-links', [label, label + ' price', label + ' near me', 'best ' + label, label + ' reviews', 'what is ' + label].map((t) => A(SEARCH(t), h('span', t), JC.icon('chevron.right', { size: 14 })))),
      h('div.w-pk-foot', '© 2026 Lanling Domains Ltd. · ', A(SEARCH('lanling domains'), 'Buy this domain'), ' · ', A('https://wavesearch.net/', 'Privacy')),
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
      const input = JC.ui.input({ placeholder: 'Add a comment…', cls: 'w-cm-in', enterkey: 'send', onSubmit: (v) => { v = v.trim(); if (!v) return; JC.ui.alert({ title: 'Post as “jiang.cheng”?', message: 'Your comment will be public, under Jiang Cheng’s account.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Post', style: 'destructive' }] }).then((r) => { if (r.index === 1) { st.mine.push(['jiang.cheng', v, 'now']); draw(); JC.story.act('web_comment', { text: v, page: key }); } }); } });
      box.append(h('div.w-cm-new', input, Btn('Post', () => input.dispatchEvent(new CustomEvent('kbreturn')))));
    };
    draw();
    return box;
  }
  function loginForm(o) {
    // o: { brand, color, sub, user, key, hint, onFail(tries), lockedText }
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
        st.tries++;
        const left = (o.max || 3) - st.tries;
        st.err = left > 0 ? 'Incorrect password. ' + left + ' attempt' + (left === 1 ? '' : 's') + ' remaining.' : null;
        if (pw.value === '181008') st.err = 'That looks like a phone passcode. This is not a phone. ' + (left > 0 ? left + ' attempt' + (left === 1 ? '' : 's') + ' remaining.' : '');
        if (o.onFail) o.onFail(st.tries);
        JC.audio.play('error');
        draw();
      }
    };
    draw();
    return box;
  }
  const foot = (name, links) => h('div.w-foot', h('div.w-foot-links', (links || []).map((l) => A(l[0], l[1]))), h('div.w-foot-c', '© 2026 ' + name));

  // ═══ Wavesearch ══════════════════════════════════════════════════════════
  const WS_ICON = { letter: 'W', bg: 'linear-gradient(135deg,#2b7bff,#00c2ff)', fg: '#fff' };
  const TELLING = [
    { re: /thank.*brother.*without|say thank you to your brother/i, results: [
      ['https://etiquette.today/thank-you-without-saying-thank-you', 'How to Say “Thank You” Without Saying It — Etiquette Today', 'Some people would rather walk into the sea than say “thank you” out loud. Here are nine ways to say it anyway: show up, cook, remember, fix the thing…'],
      ['https://asklotus.lanling/q/my-brother-did-something-huge-for-me-years-ago', 'My brother did something huge for me years ago and I never thanked him. How do I say it now? — AskLotus', '“Just say it. Two words. He’s been waiting longer than you think.” — 214 answers'],
      ['https://buzzlake.lanling/life/10-signs-brother-secretly-loves-you', '10 Signs Your Brother Secretly Loves You (#7 Will Surprise You) — Buzzlake', 'He insults your cooking but eats all of it. He remembers your birthday and pretends he doesn’t…'],
      ['https://lanlingdaily.lanling/opinion/dear-auntie-peony/brother-dinner', 'Dear Auntie Peony: My brother wants to come home for dinner — Lanling Daily', '“After thirteen years he asked if he can come home for a birthday dinner. I don’t know what to say.” Auntie Peony answers.'],
    ], ask: ['Is a voice message a good way to say thank you?', 'What if they already know?', 'How do you thank someone for something you can never repay?'] },
    { re: /liver.*donor|donor.*(gift|etiquette)|organ donor/i, results: [
      ['https://etiquette.today/gifts-for-organ-donors', 'What Do You Give Someone Who Gave You Part of Their Liver? — Etiquette Today', 'Short answer: nothing that fits in a box. Long answer: your time, your table, and the words you’ve been avoiding.'],
      ['https://wavepedia.org/wiki/Living_donor_liver_transplant', 'Living donor liver transplant — Wavepedia', 'A living donor gives part of their liver; both livers regrow within months. Donors often ask to remain anonymous…'],
      ['https://asklotus.lanling/q/is-it-weird-to-give-a-gift-to-my-liver-donor', 'Is it weird to give a gift to my liver donor? — AskLotus', '“My donor turned out to be someone I know. Very well. It’s been sixteen years. Is it too late?” — 88 answers'],
      ['https://howto.lanling/thank-a-living-donor', 'How to Thank a Living Donor (Even Years Later) — HowTo.lanling', 'Step 1: It is not too late. Step 2: Be specific. Step 3: Don’t make it a speech…'],
    ], ask: ['Can a liver donor drink alcohol?', 'Is it too late to thank a donor after 16 years?', 'Do donors want to be thanked?'] },
    { re: /white peony|bai mudan|peony tea/i, snippet: ['White peony tea: brew at 85 °C (185 °F) for 2–3 minutes', 'Use about 5 g of leaves per 150 ml. Don’t use boiling water — it scalds the buds. Re-steep 3–4 times, adding 30 seconds each time.', 'https://leafandcup.gusu/white-peony-guide'], results: [
      ['https://leafandcup.gusu/white-peony-guide', 'White Peony (Bai Mudan): The Gentle Guide — Leaf & Cup', '85 °C, three minutes, and patience. Why white peony rewards people who don’t rush.'],
      ['https://tea.cloudrecesses.gusu/white-peony', 'Mountain White Peony, 250 g — Cloud Recesses Tea Shop', 'Hand-picked on the Academy terraces. Floral, honeyed, quiet. ¥880.'],
      ['https://wavepedia.org/wiki/White_peony_tea', 'White peony tea — Wavepedia', 'White peony (Bai Mudan) is a white tea made from the bud and two young leaves…'],
      ['https://tea.cloudrecesses.gusu/brewing', 'How We Brew — Cloud Recesses Tea Shop', 'Water just off the boil, around 85 °C. No sugar. No hurry.'],
    ], ask: ['Can you put sugar in white peony tea?', 'Is white peony a good gift?', 'White peony vs silver needle?'] },
    { re: /18th birthday|turning 18|gift.*(has everything|someone who has)/i, results: [
      ['https://buzzlake.lanling/life/gifts-for-18-year-old-who-has-everything', '27 Gifts for the 18-Year-Old Who Has Everything — Buzzlake', 'When they already own a tower, a dog the size of a pony and every sneaker in Lanling.'],
      ['https://etiquette.today/heirlooms-coming-of-age', 'The Heirloom Gift: Why Coming-of-Age Calls for Something Old — Etiquette Today', 'A thing that belonged to someone they never got to know may be the most valuable gift of all.'],
      ['https://asklotus.lanling/q/what-do-i-give-my-nephew-who-is-turning-18', 'What do I give my nephew who is turning 18 and literally owns a tower? — AskLotus', '“Give him something of his mother’s.” — 67 answers'],
      ['https://lanlingdaily.lanling/city/silver-restoration-yunmeng', 'The silversmiths of Yunmeng who bring heirlooms back to life — Lanling Daily', 'At Silver Lotus Jewelers, a family bell can take three weeks…'],
    ], ask: ['What is a good coming-of-age gift?', 'Is jewellery a good gift for an 18-year-old boy?', 'How much should an uncle spend on an 18th birthday?'] },
    { re: /strangle.*nephew|nephew.*strangle|normal to want to/i, results: [
      ['https://asklotus.lanling/q/is-it-normal-to-want-to-strangle-your-nephew', 'Is it normal to want to strangle your nephew? (affectionately) — AskLotus', '“Yes. Ask any uncle. It means you love him.” — 1.2K answers'],
      ['https://buzzlake.lanling/life/signs-you-are-the-cool-uncle', '12 Signs You Are the Cool Uncle (Even If You Yell) — Buzzlake', 'You threaten to break their legs. They text you first when something goes wrong.'],
      ['https://lanlingdaily.lanling/opinion/dear-auntie-peony/teenager-not-mine', 'Dear Auntie Peony: I raised a teenager who isn’t mine — Lanling Daily', '“He is turning eighteen and I don’t know how to stop worrying.”'],
    ], ask: ['How do you handle a teenager who took your car?', 'Is yelling a love language?', 'Do teenagers know you love them?'] },
    { re: /missed you|i'?ve missed you|year apart/i, results: [
      ['https://asklotus.lanling/q/someone-said-ive-missed-you-after-a-year-apart', 'Someone said “I’ve missed you” after a year apart. What does it mean? — AskLotus', '“It means they missed you. You’re allowed to believe it.” — 342 answers'],
      ['https://etiquette.today/what-does-i-missed-you-mean', 'How to Respond When Someone Says “I Missed You” — Etiquette Today', 'You don’t need a speech. “I missed you too” is a complete sentence. So is “Tea tomorrow?”'],
      ['https://lanlingdaily.lanling/culture/zewu-jun-returns', 'Zewu-jun returns to Cloud Recesses after a year away — Lanling Daily', 'The Chancellor of Gusu Lan Academy has resumed his duties after a year of seclusion.'],
    ], ask: ['What should I say back?', 'Is “I missed you” romantic?', 'How do I know if it’s too late?'] },
  ];
  const KNOWN = [
    { re: /yunmeng jiang|\bymj\b/i, wiki: 'Yunmeng_Jiang_Group', site: ['https://lotuspier.yunmeng/', 'Yunmeng Jiang Group — Official Site'] },
    { re: /jiang cheng|jiang wanyin|sandu/i, wiki: 'Jiang_Cheng_(businessman)' },
    { re: /koi tower/i, wiki: 'Koi_Tower', site: ['https://koitower.lanling/', 'Koi Tower — Official Site'], place: 'koi-tower' },
    { re: /jin group|jingroup/i, wiki: 'Jin_Group', site: ['https://ir.jingroup.lanling/', 'Jin Group Investor Relations'] },
    { re: /gusu lan|cloud recesses|lan academy/i, wiki: 'Gusu_Lan_Academy', site: ['https://cloudrecesses.gusu/', 'Gusu Lan Academy — Cloud Recesses'], place: 'cloud-recesses' },
    { re: /lan xichen|zewu/i, wiki: 'Lan_Xichen' },
    { re: /nie corp|unclean realm/i, wiki: 'Nie_Corp', site: ['https://niecorp.qinghe/', 'Nie Corp'], place: 'unclean-realm' },
    { re: /huaisang|fans/i, wiki: 'Nie_Huaisang', site: ['https://huaisangfans.qinghe/', 'Huaisang Fans — Hand-painted fans'] },
    { re: /lanling\b/i, wiki: 'Lanling' },
    { re: /yunmeng\b/i, wiki: 'Yunmeng' },
    { re: /lotus root.*soup|pork rib soup/i, wiki: 'Lotus_root_soup', site: ['https://homekitchen.yunmeng/recipes/lotus-root-pork-rib-soup', 'Lotus Root & Pork Rib Soup — Home Kitchen'] },
    { re: /laoma|hotpot/i, site: ['https://laomahotpot.gusu/', 'Laoma Hotpot 老妈火锅 — Gusu'], place: 'laoma-hotpot' },
    { re: /radish|yiling radish/i, site: ['https://radish.yiling/', 'Yiling Radish Co. — radishes so good you’ll cry'], place: 'radish-farm' },
    { re: /golden peony/i, site: ['https://goldenpeony.lanling/', 'Golden Peony Hotel Lanling'], place: 'golden-peony' },
    { re: /pet kingdom|dog food/i, site: ['https://petkingdom.lanling/', 'Pet Kingdom — Everything for pets'], place: 'pet-kingdom' },
    { re: /lanling international|lanling intl/i, site: ['https://lanling-intl.lanling/', 'Lanling International School'], place: 'lanling-intl' },
    { re: /lost phone|found (a |an )?(phone|iphone)|phone (in|left in) (a )?(taxi|car)/i, site: ['https://howto.lanling/found-a-lost-phone', 'Found a Lost Phone? Here’s Exactly What to Do — HowTo.lanling'] },
    { re: /swift ride|lost item/i, site: ['https://help.swiftride.lanling/lost-items', 'Lost or found an item? — Swift Ride Help'] },
    { re: /lost and found|lost property|police/i, site: ['https://police.lanling/lost-and-found', 'Lost & Found — Lanling Public Security'], place: 'jinxing-police' },
    { re: /tide|water level|lotus pier/i, site: ['https://lotuspier.yunmeng/tides', 'Lotus Pier Tide Tables & Lake Levels'] },
    { re: /weather|rain|forecast/i, weather: true },
    { re: /lanling daily|news/i, site: ['https://lanlingdaily.lanling/', 'Lanling Daily — News from Lanling and beyond'] },
    { re: /intranet/i, site: ['https://intranet.lotuspier.yunmeng/', 'YMJ Intranet — Sign in'] },
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
      ['https://asklotus.lanling/q/' + sl, T + '? — AskLotus', (9 + hash(q) % 300) + ' answers · “' + pick(['Honestly? Just ask them.', 'I had the same question last year. Here’s what worked.', 'Short answer: it depends. Long answer below.', 'Everyone overthinks this. Don’t.'], q) + '”'],
      ['https://wavepedia.org/wiki/' + T.replace(/\s+/g, '_'), T + ' — Wavepedia', T + ' may refer to several topics. This disambiguation page lists articles associated with the title ' + T + '.'],
      ['https://buzzlake.lanling/life/' + sl, (5 + hash(q) % 15) + ' Things Nobody Tells You About ' + T + ' — Buzzlake', 'Number ' + (3 + hash(q) % 5) + ' changed how we think about ' + q.toLowerCase() + ' forever.'],
      ['https://howto.lanling/' + sl, 'How to Handle ' + T + ': A Simple Guide — HowTo.lanling', 'Step-by-step advice with pictures. Updated October 2026.'],
      ['https://lanlingdaily.lanling/search?q=' + enc(q), T + ' — latest coverage from Lanling Daily', 'News, opinion and analysis about ' + q.toLowerCase() + ' from Lanling and the five cities.'],
    ];
    if (/^(how|what|why|should|is|can|do)\b/i.test(q)) out.splice(2, 0, ['https://etiquette.today/' + sl, T + ' — Etiquette Today', 'Our columnist answers the question everyone is too embarrassed to ask.']);
    return out;
  }
  function wsChrome(q, tab, content) {
    const input = JC.ui.input({ value: q, placeholder: 'Search Wavesearch', enterkey: 'search', cap: 'none', cls: 'w-ws-in', onSubmit: (v) => { if (v.trim()) goFrom(input, SEARCH(v.trim())); } });
    const node = h('div.w-ws',
      h('div.w-ws-top', A('https://wavesearch.net/', h('span.w-ws-logo.small', wave(), 'Wavesearch')),
        h('div.w-ws-box', JC.icon('magnifyingglass', { size: 16, weight: 2.2 }), input, h('span.w-ws-x.tap', { onTap: () => { input.value = ''; input.focus(); } }, JC.icon('xmark.circle.fill', { size: 16 })))),
      h('div.w-ws-tabs', [['All', 'search'], ['Images', 'images'], ['News', 'news'], ['Maps', 'maps'], ['Videos', 'videos']].map(([t, k]) => A('https://wavesearch.net/' + k + '?q=' + enc(q), h('span', { class: { on: tab === k } }, t)))),
      content);
    return node;
  }
  function wave() { const s = document.createElement('span'); s.className = 'w-ws-wave'; s.innerHTML = '<svg viewBox="0 0 40 24" width="30" height="18"><path d="M2 14c4-8 8-8 12 0s8 8 12 0 8-8 12 0" fill="none" stroke="url(#wsg)" stroke-width="4" stroke-linecap="round"/><defs><linearGradient id="wsg" x1="0" x2="1"><stop offset="0" stop-color="#2b7bff"/><stop offset="1" stop-color="#00c2ff"/></linearGradient></defs></svg>'; return s; }
  function resultRow(r) {
    let host = '';
    try { host = new URL(r[0]).hostname; } catch (e) { host = r[0]; }
    const ic = web.icon(host);
    return h('div.w-res', A(r[0], h('div.w-res-site', h('span.w-fav', { style: { background: ic.bg, color: ic.fg } }, ic.letter), h('span.w-res-host', h('b', web.siteName(host)), h('small', r[0].replace(/^https?:\/\//, '').slice(0, 52)))), h('div.w-res-t', r[1])), h('div.w-res-s', r[2]));
  }
  function paa(qs, seed) {
    return h('div.w-paa', h('div.w-paa-h', 'People also ask'), qs.map((qq, i) => {
      const ans = h('div.w-paa-a', pick(['Short answer: yes, if you mean it. Most people only need to hear it once, said plainly.', 'It depends on the person — but almost everyone appreciates being asked.', 'According to the experts we spoke to: be specific, be brief, and don’t wait for the perfect moment.', 'There’s no wrong time. There’s only later, and later keeps getting later.'], seed, i), ' ', A(SEARCH(qq), 'More results'));
      const item = h('div.w-paa-i', h('div.w-paa-q.tap', { onTap: () => item.classList.toggle('open') }, h('span', qq), JC.icon('chevron.down', { size: 14, weight: 2.6 })), ans);
      return item;
    }));
  }
  site('wavesearch.net', {
    name: 'Wavesearch', icon: WS_ICON,
    pages: {
      '/': () => page('w-ws-home', 'Wavesearch', [
        h('div.w-ws-hero', h('div.w-ws-logo', wave(), 'Wavesearch'),
          (() => { const inp = JC.ui.input({ placeholder: 'Search the web', enterkey: 'search', cap: 'none', cls: 'w-ws-in', onSubmit: (v) => { if (v.trim()) goFrom(inp, SEARCH(v.trim())); } }); return h('div.w-ws-box.big', JC.icon('magnifyingglass', { size: 18, weight: 2.2 }), inp, h('span.w-ws-go.tap', { onTap: () => { if (inp.value.trim()) goFrom(inp, SEARCH(inp.value.trim())); } }, JC.icon('arrow.right', { size: 16, weight: 2.4 }))); })(),
          h('div.w-ws-quick', [['Weather Lanling', 'https://skycast.weather/lanling'], ['Lanling Daily', 'https://lanlingdaily.lanling/'], ['Wavepedia', 'https://wavepedia.org/wiki/Lanling'], ['Maps', 'https://wavesearch.net/maps?q=Lanling']].map(([t, u]) => A(u, t)))),
        h('div.w-ws-trend', h('div.w-ws-th', 'Trending in Lanling'), ['Jin Group gala', 'Zewu-jun', 'Koi Tower', 'Lanling weather Saturday', 'Golden Week deals', 'Lanling International archery'].map((t, i) => A(SEARCH(t), h('span.w-ws-tn', String(i + 1)), h('span', t)))),
        h('div.w-ws-foot', 'Wavesearch · Privacy · Terms · Lanling')]),
      '/search': (ctx) => searchPage(ctx, 'search'),
      '/images': (ctx) => searchPage(ctx, 'images'),
      '/news': (ctx) => searchPage(ctx, 'news'),
      '/videos': (ctx) => searchPage(ctx, 'videos'),
      '/maps': (ctx) => searchPage(ctx, 'maps'),
    },
  });
  const PUBLIC_ART = ['p_gala_hall', 'p_cloud_recesses', 'p_rules_wall', 'p_lotus_pond_day', 'p_lotus_macro', 'p_sunrise_lake', 'p_hotel_lobby', 'p_radishes', 'p_radish_cake', 'p_tea_hanshi', 'p_gusu_moon', 'p_moon_street', 'food_soup', 'food_hotpot', 'food_baozi', 'food_noodles', 'food_milktea', 'food_dumplings', 'food_lotus_cake', 'food_congee', 'food_skewers', 'food_radish_cake', 'wp_lotus_dusk', 'wp_night_lake', 'wp_cloud', 'wp_peony', 'p_flute'];
  function searchPage(ctx, tab) {
    const q = (ctx.q.get('q') || '').trim();
    if (!q) return SITES['wavesearch.net'].pages['/']();
    const lower = q.toLowerCase();
    const parts = [];
    const tell = TELLING.find((t) => t.re.test(q));
    const known = KNOWN.filter((k) => k.re.test(q));
    if (tab === 'images') {
      const words = lower.split(/\s+/);
      let imgs = PUBLIC_ART.filter((id) => { const m = JC.art.meta(id); const t = ((m.title || '') + ' ' + id + ' ' + (m.tags || []).join(' ')).toLowerCase(); return words.some((w) => w.length > 2 && t.includes(w)); });
      if (imgs.length < 6) imgs = imgs.concat(PUBLIC_ART.filter((id) => !imgs.includes(id)).sort((a, b) => hash(q + a) - hash(q + b)).slice(0, 9 - imgs.length));
      parts.push(h('div.w-ws-imgs', imgs.map((id) => h('div.w-ws-imgc.tap', { onTap: () => JC.ui.toast('Image: ' + (JC.art.meta(id).title || id)) }, art(id, 'w-ws-img'), h('span', (JC.art.meta(id).title || id).slice(0, 34))))));
    } else if (tab === 'news') {
      const news = NEWS.filter((n) => lower.split(/\s+/).some((w) => w.length > 2 && (n[1] + n[2]).toLowerCase().includes(w)));
      (news.length ? news : NEWS.slice(0, 5)).forEach((n) => parts.push(h('div.w-res.news', A(n[0], h('div.w-res-t', n[1])), h('div.w-res-s', h('b', 'Lanling Daily · ' + n[3] + ' · '), n[2]))));
    } else if (tab === 'videos') {
      ['Explained in 3 minutes', 'Street interview', 'Documentary (2025)', 'Shorts compilation'].forEach((v, i) => parts.push(h('div.w-res.video', h('div.w-vid', art(PUBLIC_ART[(hash(q) + i) % PUBLIC_ART.length], 'w-vid-img'), h('span.w-vid-d', (2 + i) + ':' + String(10 + (hash(q + i) % 49)).padStart(2, '0')), h('span.w-vid-play', JC.icon('play.fill', { size: 18 }))), h('div', h('div.w-res-t.tap', { onTap: () => JC.ui.toast('Video playback is disabled on cellular — you’re not on Wi-Fi.') }, title(q) + ' — ' + v), h('div.w-res-s', 'Wavetube · ' + (hash(q + v) % 900 + 12) + 'K views')))));
    } else if (tab === 'maps') {
      const res = JC.mapview ? JC.mapview.search(q) : [];
      parts.push(h('div.w-ws-map', res.length ? res.slice(0, 6).map((p) => h('div.w-ws-mapr.tap', { onTap: () => JC.os.open('maps', { place: p.id }) }, h('div', h('b', p.short || p.name), h('span', (p.sub || '') + ' · ' + p.city)), JC.icon('map.fill', { size: 18 }))) : h('div.w-res-s', 'No places found for “' + q + '”.'), h('div.w-ws-mapopen.tap', { onTap: () => JC.os.open('maps', { search: q }) }, 'Open in Maps')));
    } else {
      // calculator / weather / places / knowledge
      const calc = calcAnswer(q);
      if (calc != null) parts.push(h('div.w-card.w-calc', h('div.w-calc-q', q + ' ='), h('div.w-calc-a', String(calc).replace(/\B(?=(\d{3})+(?!\d))/g, ','))));
      if (/^(time|what time is it|current time)/i.test(q)) parts.push(h('div.w-card.w-calc', h('div.w-calc-q', 'Local time · Lanling'), h('div.w-calc-a', JC.util.fmtTime(now())), h('div.w-calc-q', JC.util.fmtDate(now(), 'full'))));
      if (known.some((k) => k.weather)) parts.push(weatherCard(/gusu/i.test(q) ? 'gusu' : /yunmeng/i.test(q) ? 'yunmeng' : /qinghe/i.test(q) ? 'qinghe' : 'lanling'));
      if (tell && tell.snippet) parts.push(h('div.w-card.w-snip', h('div.w-snip-t', tell.snippet[0]), h('div.w-snip-s', tell.snippet[1]), A(tell.snippet[2], tell.snippet[2].replace(/^https:\/\//, ''))));
      const placeK = known.find((k) => k.place);
      if (placeK && JC.mapview) {
        const p = JC.mapview.place(placeK.place);
        if (p) parts.push(h('div.w-card.w-placecard', h('div.w-pc-map.tap', { onTap: () => JC.os.open('maps', { place: p.id }) }, JC.mapview.thumb(p.id, { w: 340, h: 120, zoom: 60 })), h('div.w-pc-b', h('div.w-pc-t', p.short || p.name), h('div.w-pc-s', (p.rating ? '★ ' + p.rating + ' · ' : '') + (p.sub || '') + ' · ' + p.city), h('div.w-pc-s', p.addr || ''), h('div.w-pc-acts', h('span.tap', { onTap: () => JC.os.open('maps', { directions: p.id }) }, 'Directions'), p.web ? A(p.web, 'Website') : null, h('span.tap', { onTap: () => JC.mapview.callPlace(p.id) }, 'Call')))));
      }
      const wikiK = known.find((k) => k.wiki);
      if (wikiK && WIKI[wikiK.wiki]) { const w = WIKI[wikiK.wiki]; parts.push(h('div.w-card.w-kp', w.img ? art(w.img, 'w-kp-img') : null, h('div.w-kp-t', w.title.replace(/_/g, ' ')), h('div.w-kp-s', w.short || ''), h('div.w-kp-d', w.lead[0].slice(0, 220) + '…'), A('https://wavepedia.org/wiki/' + wikiK.wiki, 'Wavepedia'))); }
      let results = [];
      known.forEach((k) => { if (k.site) results.push([k.site[0], k.site[1], 'Official site · ' + k.site[0].replace(/^https:\/\//, '')]); if (k.wiki) results.push(['https://wavepedia.org/wiki/' + k.wiki, k.wiki.replace(/_/g, ' ') + ' — Wavepedia', (WIKI[k.wiki] && WIKI[k.wiki].lead[0].slice(0, 140) + '…') || '']); });
      if (tell) results = tell.results.concat(results);
      const page2 = ctx.q.get('p') === '2';
      results = results.concat(genericResults(q));
      const seen = new Set();
      results = results.filter((r) => (seen.has(r[0]) ? false : seen.add(r[0])));
      if (page2) results = genericResults(q + ' guide').concat(genericResults(q + ' reviews')).slice(0, 7);
      results.slice(0, 3).forEach((r) => parts.push(resultRow(r)));
      if (!page2) parts.push(paa(tell ? tell.ask : ['What is ' + q.toLowerCase() + '?', 'Is ' + q.toLowerCase() + ' worth it?', 'How do I start with ' + q.toLowerCase() + '?'], q));
      results.slice(3).forEach((r) => parts.push(resultRow(r)));
      parts.push(h('div.w-ws-related', h('div.w-ws-th', 'Related searches'), h('div.w-ws-chips', [q + ' meaning', q + ' lanling', 'how to ' + q.toLowerCase(), q + ' reddit', 'best ' + q.toLowerCase()].map((t) => A(SEARCH(t), t)))));
      parts.push(h('div.w-ws-pager', page2 ? A(SEARCH(q), '‹ Previous') : null, h('span', page2 ? '2' : '1'), page2 ? null : A(SEARCH(q) + '&p=2', 'Next ›')));
    }
    const node = wsChrome(q, tab, h('div.w-ws-results', parts));
    return { title: q + ' — Wavesearch', node: h('div.w-page.w-wsp', node), reader: null };
  }
  function weatherCard(city) {
    const W = WEATHER[city] || WEATHER.lanling;
    return h('div.w-card.w-wx', A('https://skycast.weather/' + city, h('div.w-wx-top', h('div', h('div.w-wx-c', W.name), h('div.w-wx-d', W.now[1])), h('div.w-wx-t', W.now[0] + '°'))),
      h('div.w-wx-days', W.days.map((d) => h('div.w-wx-day', h('span', d[0]), h('span.w-wx-e', d[1]), h('span', d[2] + '° / ' + d[3] + '°')))));
  }

  // ═══ Weather (Skycast) ═══════════════════════════════════════════════════
  const WEATHER = {
    lanling: { name: 'Lanling', now: [14, 'Light rain'], hl: [17, 11], days: [['Tonight', '🌧', 14, 11], ['Sat', '🌦', 19, 12], ['Sun', '☀️', 21, 12], ['Mon', '⛅️', 20, 13], ['Tue', '☁️', 18, 12]], note: 'Rain tapering off before dawn. Saturday clears by noon — good tea weather in Gusu.' },
    gusu: { name: 'Gusu', now: [11, 'Mist'], hl: [16, 9], days: [['Tonight', '🌫', 11, 9], ['Sat', '🌤', 17, 9], ['Sun', '☀️', 19, 10], ['Mon', '🌤', 18, 11], ['Tue', '🌧', 15, 10]], note: 'Mountain mist until mid-morning. Saturday afternoon: mild, still, perfect at 3 PM.' },
    yunmeng: { name: 'Yunmeng', now: [16, 'Clear'], hl: [22, 14], days: [['Tonight', '🌙', 16, 14], ['Sat', '☀️', 23, 15], ['Sun', '☀️', 24, 15], ['Mon', '⛅️', 22, 16], ['Tue', '🌦', 20, 15]], note: 'Calm on the lake. Sunday evening: clear skies, light breeze off the water — dinner outside is an option.' },
    qinghe: { name: 'Qinghe', now: [9, 'Windy'], hl: [14, 6], days: [['Tonight', '💨', 9, 6], ['Sat', '⛅️', 14, 7], ['Sun', '☀️', 16, 8], ['Mon', '☀️', 15, 7], ['Tue', '☁️', 12, 6]], note: 'Gusty north winds overnight. Hold on to your fans.' },
    yiling: { name: 'Yiling', now: [13, 'Cloudy'], hl: [18, 10], days: [['Tonight', '☁️', 13, 10], ['Sat', '🌤', 18, 11], ['Sun', '☀️', 20, 11], ['Mon', '☀️', 21, 12], ['Tue', '🌧', 17, 12]], note: 'Good radish weather, according to nobody but one farmer.' },
  };
  site('skycast.weather', {
    name: 'Skycast', icon: { letter: '☁', bg: 'linear-gradient(180deg,#4aa3ff,#1c6fe0)', fg: '#fff' },
    pages: { '/': (ctx) => weatherPage('lanling', ctx) },
    patterns: [[/^\/(\w+)$/, (ctx, m) => weatherPage(m[1], ctx)]],
  });
  function weatherPage(city) {
    const W = WEATHER[city] || WEATHER.lanling;
    const hrs = [];
    for (let i = 0; i < 12; i++) { const t = new Date(now() + i * 3600e3); hrs.push(h('div.w-sky-hr', h('span', i ? (t.getHours() % 12 || 12) + (t.getHours() < 12 ? 'a' : 'p') : 'Now'), h('span.w-sky-e', i < 6 && city === 'lanling' ? '🌧' : i < 8 ? '☁️' : '🌤'), h('b', Math.round(W.now[0] - Math.sin(i / 3) * 2) + '°'))); }
    return page('w-sky', W.name + ' Weather — Skycast', [
      h('div.w-sky-hdr', h('span.w-sky-logo', '☁ Skycast'), h('div.w-sky-cities', Object.keys(WEATHER).map((k) => A('https://skycast.weather/' + k, h('span', { class: { on: k === city } }, WEATHER[k].name))))),
      h('div.w-sky-now', h('div.w-sky-c', W.name), h('div.w-sky-t', W.now[0] + '°'), h('div.w-sky-d', W.now[1]), h('div.w-sky-hl', 'H:' + W.hl[0] + '°  L:' + W.hl[1] + '°')),
      h('div.w-sky-card', h('div.w-sky-note', W.note), h('div.w-sky-hrs', hrs)),
      h('div.w-sky-card', h('div.w-sky-h', '5-DAY FORECAST'), W.days.map((d) => h('div.w-sky-row', h('span', d[0]), h('span.w-sky-e', d[1]), h('span.w-sky-lo', d[3] + '°'), h('div.w-sky-bar', h('div', { style: { left: (d[3] - 5) * 4 + '%', right: 100 - (d[2] - 5) * 4 + '%' } })), h('span', d[2] + '°')))),
      h('div.w-sky-card', h('div.w-sky-h', 'DETAILS'), h('div.w-sky-grid', [['Humidity', '82%'], ['Wind', '12 km/h NE'], ['UV', '0 Low'], ['Sunrise', '6:18 AM'], ['Sunset', '5:41 PM'], ['AQI', '41 Good']].map(([k, v]) => h('div', h('small', k), h('b', v))))),
      h('div.w-foot', 'Skycast · Data from the Lanling Meteorological Bureau · ', A('https://wavesearch.net/', 'Wavesearch')),
    ]);
  }

  // ═══ Lanling Daily ═══════════════════════════════════════════════════════
  const LD = 'https://lanlingdaily.lanling';
  const NEWS = [
    [LD + '/society/jin-group-autumn-gala', 'Jin Group Autumn Charity Gala raises ¥38 million at Koi Tower', 'Lanling’s brightest night of the year drew the heads of the five great houses — and one notably early exit.', 'Tonight', 'p_gala_hall'],
    [LD + '/culture/zewu-jun-returns', 'Zewu-jun returns to Cloud Recesses after a year away', 'The Chancellor of Gusu Lan Academy has resumed his duties after a year of seclusion.', 'Sep 25', 'p_cloud_recesses'],
    [LD + '/sports/lanling-international-archery', 'Lanling International wins regional archery title', 'Captain Jin Ling, 17, finished with 58 out of 60 — and a scowl for the cameras.', 'Oct 12', null],
    [LD + '/business/ymj-q3-results', 'YMJ posts record quarter as cold-chain volumes climb', 'Yunmeng Jiang Group’s lake-to-coast logistics network grew 12% in Q3.', 'Oct 9', 'p_sunrise_lake'],
    [LD + '/city/koi-pond-turns-40', 'Koi Tower’s famous pond turns 40 — and Old Gold is still in charge', 'Eighty-eight koi, three bridges and one very old fish.', 'Oct 3', null],
    [LD + '/city/silver-restoration-yunmeng', 'The silversmiths of Yunmeng who bring heirlooms back to life', 'At Silver Lotus Jewelers, a family bell can take three weeks.', 'Oct 5', null],
    [LD + '/opinion/dear-auntie-peony/brother-dinner', 'Dear Auntie Peony: My brother wants to come home for dinner', 'Our advice columnist on long silences and short invitations.', 'Oct 13', null],
    [LD + '/opinion/dear-auntie-peony/teenager-not-mine', 'Dear Auntie Peony: I raised a teenager who isn’t mine', 'On worrying, birthdays and the word “jiujiu”.', 'Sep 29', null],
  ];
  function ldChrome(body, active) {
    return h('div.w-ld',
      h('div.w-ld-top', h('span.w-ld-date', JC.util.fmtDate(now(), 'full')), h('span.w-ld-sub.tap', { onTap: () => JC.ui.alert({ title: 'Subscribe to Lanling Daily', message: '¥18 a month. Jiang Cheng is already a subscriber (he reads the business section and, apparently, the advice column).', buttons: [{ text: 'OK' }] }) }, 'Subscribe')),
      A(LD + '/', h('div.w-ld-mast', 'Lanling Daily')),
      h('div.w-ld-nav', [['News', '/'], ['City', '/city/koi-pond-turns-40'], ['Business', '/business/ymj-q3-results'], ['Culture', '/culture/zewu-jun-returns'], ['Sports', '/sports/lanling-international-archery'], ['Opinion', '/opinion/dear-auntie-peony'], ['Weather', 'https://skycast.weather/lanling']].map(([t, u]) => A(/^https/.test(u) ? u : LD + u, h('span', { class: { on: active === t } }, t)))),
      body,
      h('div.w-ld-foot', h('div.w-ld-mast.small', 'Lanling Daily'), h('div', 'Since 1951 · Jinlin District, Lanling'), h('div.w-foot-links', A(LD + '/', 'Home'), A(LD + '/opinion/dear-auntie-peony', 'Write to Auntie Peony'), A('https://wavesearch.net/', 'Privacy'))));
  }
  const ldArticle = (o, active) => article(Object.assign({ brand: 'Lanling Daily', cls: 'w-news' }, o), (b) => ldChrome(b, active));
  site('lanlingdaily.lanling', {
    name: 'Lanling Daily', icon: { letter: 'L', bg: '#121212', fg: '#fff' },
    pages: {
      '/': () => {
        const lead = NEWS[0];
        return { title: 'Lanling Daily — News from Lanling and beyond', node: h('div.w-page.w-news', ldChrome(h('div.w-ld-home',
          A(lead[0], h('div.w-ld-lead', art(lead[4], 'w-ld-leadimg'), h('div.w-ld-kick', 'BREAKING · ' + lead[3]), h('div.w-ld-lt', lead[1]), h('div.w-ld-ls', lead[2]))),
          h('div.w-ld-grid', NEWS.slice(1).map((n) => A(n[0], h('div.w-ld-item', n[4] ? art(n[4], 'w-ld-thumb') : null, h('div', h('div.w-ld-it', n[1]), h('div.w-ld-is', n[3] + ' · ' + n[2])))))),
          h('div.w-ld-box', h('div.w-ld-boxh', 'Most read'), NEWS.slice(0, 5).map((n, i) => A(n[0], h('div.w-ld-mr', h('b', String(i + 1)), h('span', n[1]))))),
          weatherCard('lanling')), 'News')), reader: null };
      },
      '/society/jin-group-autumn-gala': () => ldArticle({ kicker: 'SOCIETY', title: NEWS[0][1], dek: NEWS[0][2], by: 'Feng Yaoyao', date: 'Fri ' + 'Oct 16, 2026 · 11:02 PM', read: '4 min read', hero: 'p_gala_hall', caption: 'The Grand Hall at Koi Tower before dinner. Photo: Lanling Daily',
        paras: [
          'Koi Tower glittered on Friday night as the Jin Group welcomed more than four hundred guests to its Autumn Charity Gala, raising a record ¥38 million for children’s hospitals across the five cities.',
          'The evening, held in the tower’s Grand Hall beneath its famous gold chandeliers, was the first since the group’s governance reforms of 2024 and doubled as an early celebration for heir Jin Ling, who turns eighteen on Sunday. “He spent most of dinner pretending not to enjoy it,” one guest said. “Which means he enjoyed it.”',
          'At the head table: Jiang Cheng, chief executive of the Yunmeng Jiang Group and Mr. Jin’s uncle; Nie Huaisang, chairman of Nie Corp, in a fan of his own design; Professor Lan Wangji and his husband Wei Wuxian, founder of the much-discussed Yiling Radish Co.; and, in his first major public appearance in over a year, Lan Xichen, Chancellor of Gusu Lan Academy.',
          'Seating, guests noted, was “inspired.” Mr. Jiang and Chancellor Lan were seated side by side and were later seen in conversation on the 52nd-floor balcony, where the moon was, by every account, very bright.',
          'Mr. Jiang left shortly after a quarter past eleven. A YMJ spokesperson declined to comment on his early departure, adding only that “Mr. Jiang does not attend parties so much as survive them.”',
          'The auction’s top lot — a lotus-root dinner for twelve cooked at Lotus Pier — went for ¥1.2 million to an anonymous bidder from Qinghe.',
        ],
        related: [[NEWS[1][0], NEWS[1][1], 'p_cloud_recesses'], [NEWS[4][0], NEWS[4][1]], [NEWS[2][0], NEWS[2][1]]] }, 'News'),
      '/culture/zewu-jun-returns': () => ldArticle({ kicker: 'CULTURE', title: NEWS[1][1], dek: 'After a year of quiet, Lan Xichen is back at work — and says he read every letter.', by: 'Mo Xuanyu', date: 'Fri Sep 25, 2026', read: '5 min read', hero: 'p_cloud_recesses', caption: 'The gates of Cloud Recesses in morning mist.',
        paras: [
          'Lan Xichen, the soft-spoken Chancellor of Gusu Lan Academy known affectionately as Zewu-jun, has returned to Cloud Recesses after a year-long period of seclusion.',
          'The Chancellor withdrew from public life in August 2025, weeks after the death of Jin Guangyao, his sworn brother, whose conviction rocked Lanling’s business world. The Academy’s board, chaired by his uncle Lan Qiren, oversaw the school in his absence.',
          '“A year is a long time to be silent,” Chancellor Lan said in a brief statement released this morning, on the eve of the Mid-Autumn Festival. “I am grateful to everyone who was patient with me, and to the few who wrote to me anyway, about ordinary things — the weather, the lotus season, the lake. I read all of it. It helped more than I can say.”',
          'Staff describe a Chancellor who looks rested, if thinner, and who has resumed his morning walks along the Cold Spring. His first act on returning, according to one teacher, was to brew tea for the entire faculty — white peony, “the good kind.”',
          'He is expected to attend the Jin Group’s Autumn Charity Gala in Lanling next month.',
          'Asked whether anything had changed, a student at the Academy put it simply: “He smiles more. Is that allowed? There might be a rule.”',
        ],
        related: [[NEWS[0][0], NEWS[0][1], 'p_gala_hall'], ['https://cloudrecesses.gusu/chancellor', 'A letter from the Chancellor'], ['https://tea.cloudrecesses.gusu/white-peony', 'Cloud Recesses Tea Shop: White Peony']] }, 'Culture'),
      '/sports/lanling-international-archery': () => ldArticle({ kicker: 'SPORTS', title: NEWS[2][1], dek: NEWS[2][2], by: 'Ouyang Zizhen', date: 'Mon Oct 12, 2026', paras: ['Lanling International School has won the regional youth archery championship for the third year running, led by captain Jin Ling, who shot 58 out of a possible 60 in the final round.', 'Mr. Jin, who turns eighteen this week, credited “years of practice” and his coach. Asked who taught him to shoot, he said only, “My uncle. He’s terrifying. Write that down.”', 'The team will compete at the national championships in Gusu in spring.', 'His uncle, reached by phone, said: “Fine. Adequate. He dropped his shoulder on the ninth arrow.” He then hung up.'], related: [[NEWS[0][0], NEWS[0][1]]] }, 'Sports'),
      '/business/ymj-q3-results': () => ldArticle({ kicker: 'BUSINESS', title: NEWS[3][1], dek: NEWS[3][2], by: 'Jin Zixun', date: 'Fri Oct 9, 2026', hero: 'p_sunrise_lake', paras: ['The Yunmeng Jiang Group reported record third-quarter volumes on Friday, as demand for cold-chain shipping from the lake region to the coast continued to grow.', 'The privately held group, rebuilt from near-ruin after the 2008 Lotus Pier fire by chief executive Jiang Cheng, now moves more than a third of the province’s fresh produce, including — fittingly — most of its lotus root.', '“We do not comment on quarterly results,” a spokesperson said, before commenting on them at length. Mr. Jiang himself was unavailable; his assistant noted he was “in a meeting, as always.”', 'Analysts expect the board to approve a new warehouse in Lanling at Monday’s Q4 meeting.'], related: [['https://lotuspier.yunmeng/', 'Yunmeng Jiang Group'], ['https://wavepedia.org/wiki/Yunmeng_Jiang_Group', 'Yunmeng Jiang Group on Wavepedia']] }, 'Business'),
      '/city/koi-pond-turns-40': () => ldArticle({ kicker: 'CITY', title: NEWS[4][1], dek: NEWS[4][2], by: 'Su She', date: 'Sat Oct 3, 2026', paras: ['When the koi pond in front of Koi Tower was dug in 1986, the tower above it was only half built. Forty years later, both are Lanling landmarks — and the pond, arguably, is the better loved.', 'Its eighty-eight koi are tended by a single keeper, Mr. Qin, who knows each by name. The eldest, a gold-and-white giant called Old Gold, is 41 and “has opinions.”', 'The pond has survived typhoons, two renovations and, in 2019, a dog of remarkable size who “only wanted to say hello.” Visitors are reminded that feeding the fish, wading and vehicles beyond the bollards are not permitted.', '“The koi have seen everything,” Mr. Qin said. “Nothing surprises them anymore.”'], related: [['https://koitower.lanling/koi-pond', 'Visit the Koi Pond']] }, 'City'),
      '/city/silver-restoration-yunmeng': () => ldArticle({ kicker: 'CITY', title: NEWS[5][1], dek: NEWS[5][2], by: 'Wen Chao', date: 'Mon Oct 5, 2026', paras: ['In a narrow shop on Lotus Pier Road, three generations of silversmiths repair the things families cannot replace: hairpins, lockets, bells.', '“People bring us things that belonged to someone who is gone,” says Mrs. Ruan, who has run Silver Lotus Jewelers since 1994. “They don’t want it new. They want it to look the way it did when she wore it.”', 'A bell with a lotus engraving, she says, came in last month from “an old Yunmeng family” to be cleaned for a birthday. “The customer said it had to ring. Not shine — ring. So we made it ring.”'], related: [['https://wavesearch.net/search?q=silver+lotus+jewelers', 'Silver Lotus Jewelers']] }, 'City'),
      '/opinion/dear-auntie-peony': () => ({ title: 'Dear Auntie Peony — Lanling Daily', node: h('div.w-page.w-news', ldChrome(h('div.w-article', h('div.w-kicker', 'OPINION · ADVICE'), h('h1.w-h1', 'Dear Auntie Peony'), h('div.w-dek', 'Lanling’s favourite advice column, since 1988. Letters are edited for length; nobody is ever named.'),
        h('div.w-related', [NEWS[6], NEWS[7]].map((n) => A(n[0], h('div.w-rel-i', h('span', n[1])))), A(LD + '/opinion/dear-auntie-peony/donor-gift', h('div.w-rel-i', h('span', 'Dear Auntie Peony: How do I thank someone who saved my life?'))), A(LD + '/opinion/dear-auntie-peony/tea-invitation', h('div.w-rel-i', h('span', 'Dear Auntie Peony: Someone invited me to tea and I panicked')))),
        h('div.w-ld-write', h('b', 'Write to Auntie Peony'), (() => { const inp = JC.ui.input({ multiline: true, rows: 3, placeholder: 'Dear Auntie Peony…', cls: 'w-input' }); return [inp, Btn('Send letter', () => { if (!inp.value.trim()) return; JC.ui.alert({ title: 'Letter Sent', message: 'Auntie Peony receives four hundred letters a week. She reads all of them.', buttons: [{ text: 'OK' }] }); inp.value = ''; }, 'w-btn-dark')]; })())), 'Opinion')), reader: null }),
      '/opinion/dear-auntie-peony/brother-dinner': () => ldArticle({ kicker: 'OPINION · DEAR AUNTIE PEONY', title: NEWS[6][1], by: 'Auntie Peony', date: 'Tue Oct 13, 2026',
        paras: ['Dear Auntie Peony,', 'My brother — adopted, but that has never mattered except when it did — left thirteen years ago. A lot happened. Some of it was his fault. Most of it, I have learned, was not. He came back a few years ago and we have been… civil. He texts too much. I answer too little.', 'Now my nephew is turning eighteen and my brother has asked whether he can come home for the birthday dinner and bring our late sister’s soup. He hasn’t set foot in the house since. I have not answered. Every answer I write sounds wrong. — Stubborn on the Lake', 'Dear Stubborn,', 'You have written me four paragraphs and not one of them says “no.”', 'Here is what I know about long silences: they are never broken by the perfect sentence. They are broken by a short one. “Come.” “Bring the soup.” “Six thirty.” He will understand what you mean, because he has been reading your short answers for longer than you think.', 'You do not have to forgive everything at the dinner table. You only have to set one more bowl. Your sister, I suspect, would have set it years ago.', 'And — tell him the fire was too high. It always is, the first few times.'],
        related: [[NEWS[7][0], NEWS[7][1]], ['https://homekitchen.yunmeng/recipes/lotus-root-pork-rib-soup', 'Recipe: Lotus root & pork rib soup']] }, 'Opinion'),
      '/opinion/dear-auntie-peony/teenager-not-mine': () => ldArticle({ kicker: 'OPINION · DEAR AUNTIE PEONY', title: NEWS[7][1], by: 'Auntie Peony', date: 'Tue Sep 29, 2026', paras: ['Dear Auntie Peony, I raised my nephew from when he was a baby. He is turning eighteen. He has a learner’s permit and a dog the size of a small horse. I am told I am “overprotective.” How do I stop worrying? — Uncle in Lanling', 'Dear Uncle,', 'You don’t. You learn to worry quietly enough that he can still hear himself think.', 'Eighteen is not an ending. He will call you the first time something goes wrong — probably at midnight, probably about a car. When he does, check that he is unhurt before you shout. Then shout, if you must. He will be relieved. It means you are still you.'], related: [[NEWS[6][0], NEWS[6][1]]] }, 'Opinion'),
      '/opinion/dear-auntie-peony/donor-gift': () => ldArticle({ kicker: 'OPINION · DEAR AUNTIE PEONY', title: 'Dear Auntie Peony: How do I thank someone who saved my life?', by: 'Auntie Peony', date: 'Mon Jun 24, 2024', paras: ['Dear Auntie Peony, I found out recently that someone close to me saved my life years ago and never told me. I have no idea what to say. Every gift seems absurd. — Owing', 'Dear Owing,', 'There is no gift. That is the point of what they did: it wasn’t a transaction, so it can’t be repaid like one.', 'Say thank you. Out loud, or in writing, or in a voice message you record at midnight and almost delete. Say it badly if you have to. Then let them see you living the life they kept for you. That is the only thank-you that matches the size of it.'], related: [['https://etiquette.today/gifts-for-organ-donors', 'Etiquette Today: Gifts for donors']] }, 'Opinion'),
      '/opinion/dear-auntie-peony/tea-invitation': () => ldArticle({ kicker: 'OPINION · DEAR AUNTIE PEONY', title: 'Dear Auntie Peony: Someone invited me to tea and I panicked', by: 'Auntie Peony', date: 'Thu Oct 15, 2026', paras: ['Dear Auntie Peony, a dear friend I have not seen in a year invited me to tea on Saturday. I said “I’ll see.” I don’t know why I said that. I want to go. — Unhelpful in Yunmeng', 'Dear Unhelpful,', '“I’ll see” is what people say when they want to go and are afraid of how much.', 'Text back: “Three o’clock is fine.” Then go. Bring nothing; they will already have the tea you like. They always do.'], related: [['https://leafandcup.gusu/white-peony-guide', 'How to brew white peony']] }, 'Opinion'),
      '/search': (ctx) => { const q = ctx.q.get('q') || ''; const res = NEWS.filter((n) => q.toLowerCase().split(/\s+/).some((w) => w.length > 2 && (n[1] + n[2]).toLowerCase().includes(w))); return { title: 'Search: ' + q + ' — Lanling Daily', node: h('div.w-page.w-news', ldChrome(h('div.w-article', h('h1.w-h1', 'Results for “' + q + '”'), res.length ? res.map((n) => A(n[0], h('div.w-ld-item', h('div', h('div.w-ld-it', n[1]), h('div.w-ld-is', n[3] + ' · ' + n[2]))))) : [h('p', 'No articles matched. Here’s what everyone is reading:'), NEWS.slice(0, 4).map((n) => A(n[0], h('div.w-ld-item', h('div', h('div.w-ld-it', n[1])))))]), 'News')), reader: null }; },
    },
  });

  // ═══ Gusu Lan Academy ════════════════════════════════════════════════════
  const CR = 'https://cloudrecesses.gusu';
  const RULES = ['No running within Cloud Recesses.', 'No loud voices.', 'No alcohol within Cloud Recesses.', 'No fighting without permission.', 'No laughing without reason.', 'Do not go out at night.', 'Rise at five. Sleep at nine.', 'Do not speak ill of others behind their backs.', 'Do not be arrogant.', 'Be humble in success.', 'Do not dwell on the past.', 'Be honest in word and deed.', 'Do not deceive.', 'Respect your elders.', 'Do not eat after the evening bell.', 'Do not waste food.', 'No dogs on the mountain. (See also: Appendix F, “Fairy”.)', 'No radishes may be placed upon the Wall of Discipline.', 'The kitchens may not be used to test the smoke alarms. (Added 2026.)', 'No rabbits in the lecture halls. (Amended: no more than two rabbits.)', 'Do not play the flute after quiet hours, however beautifully.', 'Gentleness is not weakness.', 'Speak once, mean it.', 'Do not keep others waiting without reason.', 'A letter unanswered is still a letter received.', 'Do not climb the walls.', 'Do not swim in the Cold Spring without supervision.', 'No gambling.', 'No haircuts in the library.', 'Do not argue with the Chair of the Board. (He will win.)', 'Return borrowed books.', 'Guests must be announced at the gate.', 'Do not leave lanterns unattended. (Amended after the Lantern Incident, 2023.)', 'Silence is not the same as peace.', 'Tea shall be brewed below boiling.', 'No sugar in the white peony.', 'Do not run toward trouble. Walk.', 'When someone asks you to stay, consider staying.', 'No fireworks.', 'Do not feed the koi of other clans.'];
  function crChrome(body, active) {
    return h('div.w-cr',
      h('div.w-cr-hdr', A(CR + '/', h('div.w-cr-logo', h('span.w-cr-seal', '藍'), h('span', 'Gusu Lan Academy'))), h('div.w-cr-nav', [['Home', '/'], ['About', '/about'], ['Rules', '/rules'], ['Chancellor', '/chancellor'], ['Admissions', '/admissions'], ['Visit', '/visit'], ['Tea Shop', 'https://tea.cloudrecesses.gusu/']].map(([t, u]) => A(/^https/.test(u) ? u : CR + u, h('span', { class: { on: active === t } }, t))))),
      body,
      h('div.w-cr-foot', h('div', 'Gusu Lan Academy · Cloud Recesses · Mount Gusu'), h('div', 'Quiet hours 21:00–05:00. Please do not call the Academy during quiet hours.'), h('div.w-foot-links', A(CR + '/rules', 'Wall of Discipline'), A(CR + '/events/wei-lan-520', 'Events'), A('https://tea.cloudrecesses.gusu/', 'Tea Shop'))));
  }
  site('cloudrecesses.gusu', {
    name: 'Gusu Lan Academy', icon: { letter: '藍', bg: '#e9f1f6', fg: '#2e5f7f' },
    pages: {
      '/': () => page('w-cr-page', 'Gusu Lan Academy — Cloud Recesses', crChrome(h('div',
        h('div.w-cr-hero', art('p_cloud_recesses', 'w-cr-heroimg'), h('div.w-cr-herot', h('div', 'Cloud Recesses'), h('small', 'Founded in quiet. Rooted in discipline.'))),
        h('div.w-cr-sec', h('h2', 'News'),
          A(CR + '/chancellor', h('div.w-cr-news', h('b', 'A letter from the Chancellor'), h('span', 'Zewu-jun returns to Cloud Recesses — Sep 25'))),
          A(CR + '/events/autumn-recital', h('div.w-cr-news', h('b', 'Autumn Recital: Professor Lan Wangji, guqin'), h('span', 'Sat Oct 24 · Hall of Elegant Music'))),
          A(CR + '/events/flute-masterclass', h('div.w-cr-news', h('b', 'Flute masterclass with Mr. Wei Ying'), h('span', 'Every Thursday · Bring earplugs (optional)'))),
          A(CR + '/rules', h('div.w-cr-news', h('b', 'Reminder: the Wall of Discipline has been updated'), h('span', 'Rule 3,401 concerns the kitchens')))),
        h('div.w-cr-sec', h('h2', 'Visit'), h('p', 'Cloud Recesses welcomes visitors daily from 9:00 to 17:00. The Hanshi and the Jingshi are private residences and are not open to visitors.'), A(CR + '/visit', 'Plan your visit ›'))), 'Home')),
      '/about': () => page('w-cr-page', 'About — Gusu Lan Academy', crChrome(h('div.w-cr-sec', h('h2', 'About the Academy'), para(['Gusu Lan Academy has taught music, literature and discipline on Mount Gusu for over a century. Its campus, Cloud Recesses, is famous for its mist, its silence and its Wall of Discipline.', 'The Academy is led by Chancellor Lan Xichen. The board is chaired by Lan Qiren. Professor Lan Wangji leads the School of Music.', 'Each summer the Academy hosts a residential programme for students from the great families of the five cities. Alumni of the Summer 2007 programme include leaders in logistics, industry and radish farming.'])), 'About')),
      '/rules': (ctx) => {
        const q = (ctx.q.get('q') || '').toLowerCase();
        const list = h('ol.w-cr-rules');
        const fill = (f) => { list.innerHTML = ''; RULES.forEach((r, i) => { if (f && !r.toLowerCase().includes(f)) return; list.appendChild(h('li', { value: [4, 2, 1, 6, 17, 22, 31, 40, 52, 58, 77, 81, 90, 104, 133, 140, 1138, 2117, 3401, 2876, 3011, 1104, 999, 1880, 2010, 12, 245, 61, 1515, 300, 88, 120, 2988, 3376, 412, 413, 777, 3102, 66, 1021][i] || i + 1 }, r)); }); if (!list.children.length) list.appendChild(h('li.w-cr-none', 'No rule found. That doesn’t mean it’s allowed.')); };
        fill(q);
        const inp = JC.ui.input({ placeholder: 'Search 3,412 rules…', value: q, cap: 'none', cls: 'w-input', onInput: (v) => fill(v.toLowerCase()) });
        return page('w-cr-page', 'The Wall of Discipline — Gusu Lan Academy', crChrome(h('div.w-cr-sec', h('h2', 'The Wall of Discipline'), art('p_rules_wall', 'w-cr-wall'), h('p', 'Three thousand four hundred and twelve rules, carved in stone. A selection is shown below. Students are expected to know all of them. Visitors are expected to try.'), inp, list, h('p.w-cr-small', 'Full text available in the Library of Stone (bring a lantern; do not leave it unattended).')), 'Rules'), { reader: { title: 'The Wall of Discipline', byline: 'Gusu Lan Academy', paras: RULES } });
      },
      '/chancellor': () => page('w-cr-page', 'A Letter from the Chancellor — Gusu Lan Academy', crChrome(h('div.w-cr-sec.w-cr-letter', h('h2', 'A Letter from the Chancellor'), h('div.w-cr-date', 'Mid-Autumn, 2026'), para(['To the students, teachers and friends of Cloud Recesses,', 'I have been away for a year. I will not pretend the reasons were simple; most of you know them, and I am grateful you were kind enough not to ask.', 'I learned some things in the quiet. That silence is not the same as peace. That a person can be surrounded by rules and still lose their way. And that ordinary things — a message about the weather, a photograph of lotus leaves in the rain, a note that says only “the lake froze early this year” — can hold a person to the world more firmly than any discipline.', 'To the friend who wrote to me every week, about nothing and everything, and never once asked me to answer: I read every word. Thank you.', 'I am glad to be home. The tea is on.', '— Lan Xichen, Chancellor']), h('div.w-cr-sign', '曦臣')), 'Chancellor'), { reader: { title: 'A Letter from the Chancellor', byline: 'Lan Xichen · Mid-Autumn 2026', paras: ['To the students, teachers and friends of Cloud Recesses,', 'I have been away for a year…', 'To the friend who wrote to me every week, about nothing and everything, and never once asked me to answer: I read every word. Thank you.', 'I am glad to be home. The tea is on.'] } }),
      '/admissions': () => page('w-cr-page', 'Admissions — Gusu Lan Academy', crChrome(h('div.w-cr-sec', h('h2', 'Admissions'), para(['Applications for the 2027 intake open on 1 November. Candidates sit a written examination and an interview, and are asked to recite twenty rules of their choosing.', 'Scholarships are available. The Academy does not accept donations in exchange for admission, however large, and however Jin.']), Btn('Request a prospectus', () => JC.ui.alert({ title: 'Prospectus Requested', message: 'A printed prospectus will be posted to Jiang Cheng, Lotus Pier. He will be confused.', buttons: [{ text: 'OK' }] }), 'w-btn-cr')), 'Admissions')),
      '/visit': () => page('w-cr-page', 'Visit — Gusu Lan Academy', crChrome(h('div.w-cr-sec', h('h2', 'Visiting Cloud Recesses'), para(['Open daily 9:00–17:00. Quiet hours 21:00–05:00.', 'From Gusu North Station take the Academy shuttle (last departure 20:30) or drive up Cloud Recesses Road (parking at the Main Gate).', 'Please announce yourself at the gate. The Hanshi and the Jingshi are private residences. Tea at the Hanshi is by invitation of the Chancellor only.']), h('div.w-cr-btns', Btn('Directions', () => JC.os.open('maps', { directions: 'cloud-recesses' }), 'w-btn-cr'), Btn('Open in Maps', () => JC.os.open('maps', { place: 'cloud-recesses' }), 'w-btn-ghost'))), 'Visit')),
      '/summer-school': () => page('w-cr-page', 'Summer Programme — Gusu Lan Academy', crChrome(h('div.w-cr-sec', h('h2', 'Summer Programme'), para(['Every summer since 1962, students from the great families have lived and studied at Cloud Recesses for six weeks.', 'The Summer 2007 cohort is remembered fondly by staff, mostly. It is the only cohort for which the Wall of Discipline required an appendix.'])), 'About')),
      '/events/wei-lan-520': () => page('w-cr-page', 'Wei Ying & Lan Zhan — 20 May 2025', crChrome(h('div.w-cr-sec', h('h2', 'Wei Ying & Lan Zhan'), h('div.w-cr-date', 'Tuesday 20 May 2025 · The Orchid Pavilion, Cloud Recesses'), art('p_flute', 'w-cr-wedimg'), para(['Professor Lan Wangji and Mr. Wei Ying were married at Cloud Recesses on the twentieth of May, in a ceremony attended by family and friends from all five cities.', 'The ceremony was quiet, as all things here are. The reception was not, as nothing involving Mr. Wei is.', 'Music was performed by the couple themselves: guqin and dizi. Guests were asked to observe Rule 2: no loud voices. They did not.']), h('p.w-cr-small', 'Photographs © Gusu Lan Academy. Please do not repost pictures of the radish cake.')), 'Home')),
      '/events/autumn-recital': () => page('w-cr-page', 'Autumn Recital', crChrome(h('div.w-cr-sec', h('h2', 'Autumn Recital'), h('p', 'Professor Lan Wangji performs works for guqin. Saturday 24 October, 19:00. Free; quiet audiences only.'), Btn('Reserve a seat', () => JC.ui.toast('Seat reserved for “Jiang Cheng”', { icon: 'checkmark' }), 'w-btn-cr')), 'Home')),
      '/events/flute-masterclass': () => page('w-cr-page', 'Flute Masterclass', crChrome(h('div.w-cr-sec', h('h2', 'Flute Masterclass with Mr. Wei Ying'), h('p', 'Thursdays at 16:00. Mr. Wei teaches dizi and xiao to students of all levels. He also teaches, without being asked, how to cook radishes.'), Btn('Sign up', () => JC.ui.alert({ title: 'Sign Up as Jiang Cheng?', message: 'Mr. Wei would see the name on the list. You know what would happen.', buttons: [{ text: 'Cancel', style: 'cancel' }] }), 'w-btn-cr')), 'Home')),
    },
  });

  // ═══ Cloud Recesses Tea Shop & Leaf and Cup ══════════════════════════════
  const TEA = 'https://tea.cloudrecesses.gusu';
  const TEAS = [['white-peony', 'Mountain White Peony', '250 g tin · Spring 2026', 880, 'p_tea_hanshi', 'Bud and two leaves from the Academy terraces. Floral, honeyed, quiet. Brew at 85 °C.'], ['silver-needle', 'Silver Needle', '100 g · Spring 2026', 1280, 'p_lotus_macro', 'Only the downy buds. Expensive, unhurried, worth it.'], ['cloud-mist', 'Cloud Mist Green', '150 g · Spring 2026', 420, 'p_cloud_recesses', 'The everyday tea of Cloud Recesses. Grown in the mist, as the name suggests.'], ['gentian', 'Gentian Blossom Tisane', '80 g', 160, 'p_gusu_moon', 'Caffeine-free. For quiet hours.']];
  function teaChrome(body) {
    const st = state('teabag', { n: 0, items: [] });
    return h('div.w-tea', h('div.w-tea-hdr', A(TEA + '/', h('span.w-tea-logo', 'Cloud Recesses Tea Shop')), A(TEA + '/bag', h('span.w-tea-bag', JC.icon('bag.fill', { size: 18 }), st.n ? h('b', String(st.n)) : null))), body, h('div.w-tea-foot', 'Grown and packed at Cloud Recesses, Gusu. ', A(TEA + '/brewing', 'Brewing guide'), ' · ', A(CR + '/', 'Gusu Lan Academy')));
  }
  site('tea.cloudrecesses.gusu', {
    name: 'Cloud Recesses Tea Shop', icon: { letter: '茶', bg: '#2f6b4f', fg: '#fff' },
    pages: {
      '/': () => page('w-tea-page', 'Cloud Recesses Tea Shop', teaChrome(h('div', h('div.w-tea-hero', h('div', 'Tea from the mist.'), h('small', 'Hand-picked on Mount Gusu. Delivered across the five cities.')), h('div.w-tea-grid', TEAS.map((t) => A(TEA + '/' + t[0], h('div.w-tea-card', art(t[4], 'w-tea-img'), h('b', t[1]), h('span', t[2]), h('div.w-tea-price', '¥' + t[3])))))))),
      '/brewing': () => page('w-tea-page', 'How We Brew — Cloud Recesses Tea Shop', teaChrome(h('div.w-tea-sec', h('h2', 'How We Brew'), h('table.w-tea-tbl', h('tr', h('th', 'Tea'), h('th', 'Water'), h('th', 'Time')), [['White peony', '85 °C', '2–3 min'], ['Silver needle', '80 °C', '3–4 min'], ['Cloud mist green', '80 °C', '1–2 min'], ['Gentian', '95 °C', '5 min']].map((r) => h('tr', r.map((c) => h('td', c))))), para(['Use about 5 g of leaves for 150 ml of water. Warm the cup first. Never use boiling water on white tea — it bruises the buds.', 'No sugar. (Rule 413.)', 'Re-steep three or four times, adding half a minute each time. Good tea, like good conversation, improves on the second pour.'])))),
      '/bag': () => { const st = state('teabag', { n: 0, items: [] }); return page('w-tea-page', 'Your Bag — Cloud Recesses Tea Shop', teaChrome(h('div.w-tea-sec', h('h2', 'Your Bag'), st.items.length ? [st.items.map((i) => h('div.w-tea-line', h('span', i[0]), h('b', '¥' + i[1]))), h('div.w-tea-line.total', h('span', 'Total'), h('b', '¥' + st.items.reduce((a, b) => a + b[1], 0))), Btn('Checkout', () => JC.ui.alert({ title: 'Sign In to Check Out', message: 'Checkout needs a Cloud Recesses account. The saved account is Tang Mei’s — she ordered the last tin. She would notice.', buttons: [{ text: 'OK' }] }), 'w-btn-tea')] : h('p', 'Your bag is empty. The mountain is patient.')))); },
    },
    patterns: [[/^\/([\w-]+)$/, (ctx, m) => {
      const t = TEAS.find((x) => x[0] === m[1]);
      if (!t) return notFound(SITES['tea.cloudrecesses.gusu'], ctx);
      return page('w-tea-page', t[1] + ' — Cloud Recesses Tea Shop', teaChrome(h('div.w-tea-prod', art(t[4], 'w-tea-pimg'), h('h1', t[1]), h('div.w-tea-sub', t[2]), h('div.w-tea-price.big', '¥' + t[3]), h('p', t[5]), t[0] === 'white-peony' ? h('div.w-tea-note', '★ Last ordered by this device: 25 Sep 2026, delivered to the Hanshi (gift, no card).') : null,
        Btn('Add to Bag', () => { const st = state('teabag', { n: 0, items: [] }); st.n++; st.items.push([t[1], t[3]]); JC.ui.toast('Added to bag', { icon: 'bag.fill' }); }, 'w-btn-tea'), A(TEA + '/brewing', 'Brewing guide ›'))));
    }]],
  });
  site('leafandcup.gusu', {
    name: 'Leaf & Cup', icon: { letter: '🍃', bg: '#f4efe3', fg: '#3c6b46' },
    pages: {
      '/': () => page('w-leaf', 'Leaf & Cup — a tea blog', [h('div.w-leaf-hdr', 'Leaf & Cup'), A('https://leafandcup.gusu/white-peony-guide', h('div.w-leaf-post', h('b', 'White Peony: The Gentle Guide'), h('span', 'Oct 2, 2026')))]),
      '/white-peony-guide': () => article({ brand: 'Leaf & Cup', cls: 'w-leaf', kicker: 'BREWING', title: 'White Peony (Bai Mudan): The Gentle Guide', dek: '85 °C, three minutes, and patience.', by: 'Ning Mei', date: 'Oct 2, 2026', hero: 'p_tea_hanshi', paras: ['White peony is the tea for people who have learned not to rush. It is made from the bud and the first two leaves, withered slowly and dried without fuss, and it tastes — if you let it — of honey, hay and something like the air after rain.', 'Water: 85 °C. Not boiling. If you have no thermometer, boil the water and wait about two minutes with the lid off.', 'Leaf: about 5 g for a 150 ml cup or gaiwan.', 'Time: two to three minutes for the first steep. Add thirty seconds each time after. Good white peony gives four or five steeps.', 'No sugar. I know. Try it once without.', 'A note on giving white peony: it is a quiet gift. It says “I remembered how you take it,” which is often what people mean when they cannot say what they mean.'], related: [['https://tea.cloudrecesses.gusu/white-peony', 'Buy: Mountain White Peony (Cloud Recesses Tea Shop)'], ['https://wavepedia.org/wiki/White_peony_tea', 'White peony tea on Wavepedia']] }, (b) => h('div', h('div.w-leaf-hdr', A('https://leafandcup.gusu/', 'Leaf & Cup')), b)),
    },
  });

  // ═══ Yunmeng Jiang Group (public), tides, intranet, drive ═════════════════
  const YMJ = 'https://lotuspier.yunmeng';
  function ymjChrome(body, active) {
    return h('div.w-ymj', h('div.w-ymj-hdr', A(YMJ + '/', h('span.w-ymj-logo', h('span.w-ymj-lotus', '✿'), 'YUNMENG JIANG GROUP')), h('div.w-ymj-nav', [['About', '/about'], ['Logistics', '/logistics'], ['Lotus Foods', '/foods'], ['Tide Tables', '/tides'], ['Careers', '/careers']].map(([t, u]) => A(YMJ + u, h('span', { class: { on: active === t } }, t))))), body,
      h('div.w-ymj-foot', h('div', '✿ Yunmeng Jiang Group · Lotus Pier, Yunmeng'), h('div', 'Switchboard +86 555 0716 0000 · ', A('https://intranet.lotuspier.yunmeng/', 'Employee login')), h('div.w-foot-c', '© 2026 YMJ. All rights reserved.')));
  }
  site('lotuspier.yunmeng', {
    name: 'Yunmeng Jiang Group', icon: { letter: '✿', bg: '#5b3fa6', fg: '#fff' },
    pages: {
      '/': () => page('w-ymj-page', 'Yunmeng Jiang Group — Lake to Coast', ymjChrome(h('div', h('div.w-ymj-hero', art('p_sunrise_lake', 'w-ymj-heroimg'), h('div.w-ymj-herot', h('div', 'Lake to coast.'), h('small', 'Logistics, lake freight and Lotus Pier foods — since 1952.'))),
        h('div.w-ymj-stats', [['21,400', 'employees'], ['1/3', 'of the province’s fresh produce'], ['74', 'years on the lake']].map((s) => h('div', h('b', s[0]), h('span', s[1])))),
        h('div.w-ymj-sec', h('h2', 'Latest'), A(LD + '/business/ymj-q3-results', h('div.w-ymj-news', 'Record third quarter as cold-chain volumes climb · Oct 9')), A(YMJ + '/foods', h('div.w-ymj-news', 'Lotus Pier lotus root: now in 40 kg crates (please order carefully) · Oct 1')), A(YMJ + '/careers', h('div.w-ymj-news', 'We’re hiring: logistics coordinators who can count to forty · Sep 18')))), 'Home')),
      '/about': () => page('w-ymj-page', 'About YMJ', ymjChrome(h('div.w-ymj-sec', h('h2', 'About'), para(['The Yunmeng Jiang Group was founded on the shore of Yunmeng Lake in 1952 as a family fleet of lotus boats. Today it moves fresh produce, cold-chain freight and lake cargo from the lake country to the coast.', 'Our headquarters remain at Lotus Pier, the Jiang family estate, rebuilt after the fire of 2008. The nine-petal lotus over the gate has been there through all of it.', 'Chief Executive Officer: Jiang Cheng (since 2009).']), A('https://wavepedia.org/wiki/Yunmeng_Jiang_Group', 'YMJ on Wavepedia ›')), 'About')),
      '/logistics': () => page('w-ymj-page', 'Logistics — YMJ', ymjChrome(h('div.w-ymj-sec', h('h2', 'Logistics'), para(['Cold-chain trucking on the G42 corridor. Lake freight from Lotus Pier and Lotus Bay. Next-morning delivery to Lanling, Gusu and Qinghe.', 'Track a shipment: enter a waybill number below.']), (() => { const i = JC.ui.input({ placeholder: 'Waybill number', cap: 'none', cls: 'w-input' }); return [i, Btn('Track', () => JC.ui.alert({ title: 'Waybill ' + (i.value || '—'), message: i.value ? 'In transit · Yunmeng → Lanling · ETA tomorrow 06:40.\n(Unless it is 400 kg of lotus root. That one has arrived. All of it.)' : 'Enter a waybill number.', buttons: [{ text: 'OK' }] }), 'w-btn-ymj')]; })()), 'Logistics')),
      '/foods': () => page('w-ymj-page', 'Lotus Pier Foods — YMJ', ymjChrome(h('div.w-ymj-sec', h('h2', 'Lotus Pier Foods'), art('p_lotus_pond_day', 'w-ymj-img'), para(['Lotus root, lotus seeds and lake fish from the Yunmeng lake country.', 'Lotus root (fresh): 10 kg, 20 kg and 40 kg crates. Wholesale orders by the tonne.', 'Ordering tip from our operations team: please check the decimal point before you press send.'])), 'Lotus Foods')),
      '/careers': () => page('w-ymj-page', 'Careers — YMJ', ymjChrome(h('div.w-ymj-sec', h('h2', 'Careers'), ['Logistics Coordinator (Yunmeng)', 'Cold-Chain Driver (Lanling)', 'Canteen Chef (experience with lotus root essential)', 'Executive Assistant to the CEO — position filled. Permanently. — T.M.'].map((j) => h('div.w-ymj-job', h('b', j), h('span.tap', { onTap: () => JC.ui.toast('Applications open on Monday') }, 'Apply ›')))), 'Careers')),
      '/tides': () => tidesPage(),
    },
  });
  function tidesPage() {
    const d0 = new Date(now());
    const days = [0, 1, 2].map((k) => { const d = new Date(d0); d.setDate(d.getDate() + k); return d; });
    const svg = (k) => {
      const pts = [];
      for (let i = 0; i <= 48; i++) { const x = i * 6.5; const y = 52 - (Math.sin((i / 48) * Math.PI * 4 + k * 0.8) * 18 + Math.sin(i / 7) * 4); pts.push(x.toFixed(1) + ',' + y.toFixed(1)); }
      const nowX = k === 0 ? ((d0.getHours() * 60 + d0.getMinutes()) / 1440) * 312 : -10;
      const s = document.createElement('div');
      s.className = 'w-tide-svg';
      s.innerHTML = `<svg viewBox="0 0 312 90" preserveAspectRatio="none"><polyline points="${pts.join(' ')} 312,90 0,90" fill="rgba(80,140,200,.25)" stroke="none"/><polyline points="${pts.join(' ')}" fill="none" stroke="#3a7bbf" stroke-width="2"/><line x1="${nowX}" x2="${nowX}" y1="0" y2="90" stroke="#e5383b" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`;
      return s;
    };
    const row = (d, k) => h('div.w-tide-day', h('div.w-tide-h', JC.util.fmtDate(d.getTime(), 'full')), svg(k), h('table.w-tide-tbl', h('tr', h('th', 'High'), h('th', 'Low'), h('th', 'High'), h('th', 'Low')), h('tr', [[3, 12], [9, 34], [15, 20], [21, 41]].map(([hh, mm], i) => h('td', String((hh + k) % 24).padStart(2, '0') + ':' + String((mm + k * 23) % 60).padStart(2, '0'), h('br'), h('small', (i % 2 ? (0.4 + k * 0.05).toFixed(2) : (1.8 - k * 0.07).toFixed(2)) + ' m'))))));
    return page('w-ymj-page', 'Lotus Pier Tide Tables', ymjChrome(h('div.w-ymj-sec', h('h2', 'Lotus Pier Tide Tables & Lake Levels'), h('p', 'Yunmeng Lake gauge at Lotus Pier. Where the lake meets the Great River the water rises and falls twice a day; boats at the pier should allow 1.2 m of clearance.'), h('div.w-tide-now', h('div', h('small', 'Now'), h('b', '1.42 m'), h('span', 'Rising')), h('div', h('small', 'Water temp.'), h('b', '17 °C')), h('div', h('small', 'Sunrise'), h('b', '6:21 AM'))), days.map(row), h('p.w-cr-small', 'Gauge maintained by YMJ Lake Freight. Not for navigation. Ask Old Huang.')), 'Tide Tables'));
  }
  site('intranet.lotuspier.yunmeng', {
    name: 'YMJ Intranet', icon: { letter: '✿', bg: '#2d1f52', fg: '#d9c9ff' },
    pages: {
      '/': () => page('w-login-page', 'YMJ Intranet — Sign in', [h('div.w-intra', loginForm({ key: 'ymj', brand: 'YMJ Intranet', logo: h('span', h('span.w-ymj-lotus', '✿'), ' YMJ Intranet'), color: '#5b3fa6', sub: 'Yunmeng Jiang Group · Employees only', user: 'jiangcheng', userLabel: 'Employee ID', max: 3, resetText: 'A password reset request has been sent to Tang Mei (EA), who manages the CEO’s accounts. She will call. She always calls.', help: 'IT helpdesk: ext. 4040 (Mon–Fri 9:00–18:00).', lockedText: 'This account is locked after 3 failed attempts. Contact IT (ext. 4040) — they will ask the CEO why he forgot his password.', onFail: (n) => { if (n === 3) JC.story.act('ymj_locked', {}); } }), h('div.w-intra-foot', 'Unauthorized access is prohibited. All activity is logged.'))]),
    },
    notFound: () => SITES['intranet.lotuspier.yunmeng'].pages['/'](),
  });
  site('drive.lotuspier.yunmeng', {
    name: 'YMJ Drive', icon: { letter: 'D', bg: '#5b3fa6', fg: '#fff' },
    pages: { '/': () => page('w-login-page', 'YMJ Drive — Sign in', [h('div.w-intra', loginForm({ key: 'drive', brand: 'YMJ Drive', logo: h('span', '✿ YMJ Drive'), color: '#5b3fa6', sub: 'Sign in to open “Board — Q4 (FINAL).deck”', user: 'jiang.cheng@lotuspier.yunmeng', userLabel: 'Email', max: 3, resetText: 'Reset link sent to Tang Mei (EA).', lockedText: 'Too many attempts. Try again in 24 hours.' }))]) },
    notFound: () => SITES['drive.lotuspier.yunmeng'].pages['/'](),
  });

  // ═══ Jin Group IR & Koi Tower ═════════════════════════════════════════════
  const IR = 'https://ir.jingroup.lanling';
  function irChrome(body, active) {
    return h('div.w-ir', h('div.w-ir-hdr', A(IR + '/', h('span.w-ir-logo', h('span.w-ir-mark', '金'), 'JIN GROUP')), h('span.w-ir-tag', 'Investor Relations')), h('div.w-ir-nav', [['Overview', '/'], ['Press', '/press'], ['Governance', '/governance'], ['Reports', '/reports']].map(([t, u]) => A(IR + u, h('span', { class: { on: active === t } }, t)))), body, h('div.w-ir-foot', 'Jin Group Holdings · Koi Tower, 88 Jinlin Avenue, Lanling · ', A('https://koitower.lanling/', 'Koi Tower')));
  }
  site('ir.jingroup.lanling', {
    name: 'Jin Group IR', icon: { letter: '金', bg: '#c9a227', fg: '#1a1408' },
    pages: {
      '/': () => {
        const pts = []; let v = 41.2;
        for (let i = 0; i < 60; i++) { v += Math.sin(i * 1.7) * 0.5 + (i > 50 ? 0.15 : 0.02); pts.push((i * 5.2).toFixed(1) + ',' + (80 - (v - 36) * 6).toFixed(1)); }
        const chart = document.createElement('div'); chart.className = 'w-ir-chart';
        chart.innerHTML = `<svg viewBox="0 0 312 90" preserveAspectRatio="none"><polyline points="${pts.join(' ')}" fill="none" stroke="#c9a227" stroke-width="2"/></svg>`;
        return page('w-ir-page', 'Jin Group — Investor Relations', irChrome(h('div', h('div.w-ir-quote', h('div', h('small', 'JNG · Lanling Exchange'), h('b', '¥47.86'), h('span.up', '+1.12 (+2.40%)')), h('div.w-ir-qs', 'As of close, Fri Oct 16 · Gala week')), chart,
          h('div.w-ir-sec', h('h2', 'Latest news'), [['Jin Group Autumn Charity Gala raises ¥38 million', '/press/gala-2026', 'Oct 16'], ['Q3 2026 results: revenue up 6%', '/reports', 'Oct 8'], ['Statement on governance reforms', '/governance', 'Mar 2025'], ['Koi Tower forecourt renovation complete', '/press/forecourt', 'Aug 2026']].map(([t, u, d]) => A(IR + u, h('div.w-ir-news', h('b', t), h('span', d))))),
          h('div.w-ir-sec', h('h2', 'Leadership'), h('p', 'Chair (interim): Board of Directors. Heir: Jin Ling (Advisory Board observer from age 18). Guardian and family adviser: Jiang Cheng, CEO of the Yunmeng Jiang Group.'))), 'Overview'));
      },
      '/press': () => page('w-ir-page', 'Press — Jin Group', irChrome(h('div.w-ir-sec', h('h2', 'Press releases'), [['Jin Group Autumn Charity Gala raises ¥38 million', '/press/gala-2026'], ['Koi Tower forecourt renovation complete', '/press/forecourt']].map(([t, u]) => A(IR + u, h('div.w-ir-news', h('b', t))))), 'Press')),
      '/press/gala-2026': () => article({ brand: 'Jin Group', cls: 'w-ir-page', kicker: 'PRESS RELEASE · LANLING, OCT 16, 2026', title: 'Jin Group Autumn Charity Gala raises ¥38 million for children’s hospitals', by: 'Jin Group Communications', hero: 'p_gala_hall', paras: ['The Jin Group today hosted its annual Autumn Charity Gala at Koi Tower, raising a record ¥38 million for children’s hospitals across Lanling, Yunmeng, Gusu, Qinghe and Yiling.', '“This evening belongs to the children we serve,” the Board said in a statement. “And, a little, to our heir Jin Ling, who turns eighteen this weekend and who asked us not to mention it.”', 'The Group thanks its guests, including the Yunmeng Jiang Group, Nie Corp and Gusu Lan Academy, for their generosity.'] }, (b) => irChrome(b, 'Press')),
      '/press/forecourt': () => article({ brand: 'Jin Group', cls: 'w-ir-page', kicker: 'PRESS RELEASE · AUG 2026', title: 'Koi Tower forecourt renovation complete', by: 'Jin Group Communications', paras: ['The renovated forecourt reopened today with new lighting, three restored stone bridges and reinforced bollards around the koi pond.', 'The koi were not consulted but appear satisfied.'] }, (b) => irChrome(b, 'Press')),
      '/governance': () => page('w-ir-page', 'Governance — Jin Group', irChrome(h('div.w-ir-sec', h('h2', 'Governance'), para(['Following the events of 2024, the Jin Group adopted a new governance framework: an independent board, published audits and an Advisory Board on which the heir will sit as an observer from the age of eighteen.', 'The Group acknowledges the harm done during the tenure of its former chief executive and remains committed to transparency.'])), 'Governance')),
      '/reports': () => page('w-ir-page', 'Reports — Jin Group', irChrome(h('div.w-ir-sec', h('h2', 'Reports'), ['Q3 2026 Results (PDF, 2.1 MB)', 'Annual Report 2025 (PDF, 14 MB)', 'Sustainability Report 2025 (PDF, 6 MB)'].map((t) => h('div.w-ir-news.tap', { onTap: () => JC.ui.alert({ title: 'Download “' + t.split(' (')[0] + '”?', message: 'This PDF will open in Files. Files is managed by Yunmeng Jiang Group IT.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Download', style: 'default', onTap: () => JC.ui.toast('Download failed: storage full') }] }) }, h('b', t), JC.icon('square.and.arrow.down', { size: 18 })))), 'Reports')),
    },
  });
  const KT = 'https://koitower.lanling';
  function ktChrome(body) { return h('div.w-kt', h('div.w-kt-hdr', A(KT + '/', h('span.w-kt-logo', 'KOI TOWER')), h('div.w-kt-nav', A(KT + '/visit', 'Visit'), A(KT + '/koi-pond', 'Koi Pond'), A(KT + '/gala', 'Gala'), A(IR + '/', 'Jin Group'))), body, h('div.w-kt-foot', 'Koi Tower · 88 Jinlin Avenue, Lanling · Lobby 7:00–24:00')); }
  site('koitower.lanling', {
    name: 'Koi Tower', icon: { letter: 'K', bg: 'linear-gradient(135deg,#f6d77a,#b8862b)', fg: '#2a1d05' },
    pages: {
      '/': () => page('w-kt-page', 'Koi Tower — Lanling', ktChrome(h('div', h('div.w-kt-hero', h('div.w-kt-ht', 'Koi Tower'), h('div.w-kt-hs', 'Lanling’s golden landmark · 52 floors · 1987')), h('div.w-kt-cards', [['The Koi Pond', 'Eighty-eight koi and one very old fish.', '/koi-pond'], ['Autumn Charity Gala', 'Friday 16 October · Grand Hall', '/gala'], ['Visit', 'Lobby, café and the 52nd-floor balcony', '/visit']].map(([t, s, u]) => A(KT + u, h('div.w-kt-card', h('b', t), h('span', s)))))))),
      '/koi-pond': () => page('w-kt-page', 'The Koi Pond — Koi Tower', ktChrome(h('div.w-kt-sec', h('h2', 'The Koi Pond'), para(['Dug in 1986, the year the tower’s foundations were laid, the koi pond is home to eighty-eight koi tended by our keeper, Mr. Qin. The eldest, Old Gold, is 41.', 'Please enjoy the pond from the bridges and the path.']), h('div.w-kt-rules', h('b', 'Visitor rules'), h('ol', ['Do not feed the koi.', 'No wading or swimming.', 'No vehicles beyond the bollards.', 'Dogs must be on a lead. (All dogs. Yes, that one too.)', 'Coins thrown in the pond are donated to children’s hospitals.'].map((r) => h('li', r)))), A(LD + '/city/koi-pond-turns-40', 'Read: the pond turns 40 ›')))),
      '/gala': () => page('w-kt-page', 'Autumn Charity Gala 2026 — Koi Tower', ktChrome(h('div.w-kt-sec', h('h2', 'Autumn Charity Gala 2026'), art('p_gala_hall', 'w-kt-img'), para(['Friday 16 October 2026 · Grand Hall · Black tie', 'Doors 19:00 · Dinner 20:00 · Auction 21:30 · Balcony open until midnight.', 'Thank you to all our guests. ¥38 million raised.'])))),
      '/visit': () => page('w-kt-page', 'Visit — Koi Tower', ktChrome(h('div.w-kt-sec', h('h2', 'Visit'), para(['Lobby open 7:00–24:00. Koi Tower Café in the lobby. The 52nd-floor balcony is open to event guests only.', 'Parking: Koi Tower Garage (B1–B4). Valet available during events.']), Btn('Directions', () => JC.os.open('maps', { directions: 'koi-tower' }), 'w-btn-gold')))),
    },
  });

  // ═══ Home Kitchen (recipes) ═══════════════════════════════════════════════
  const HK = 'https://homekitchen.yunmeng';
  const RECIPES = {
    'lotus-root-pork-rib-soup': { title: 'Lotus Root & Pork Rib Soup (the Yunmeng way)', img: 'food_soup', time: '2 h 20 min', serves: '4–5', by: 'Home Kitchen Yunmeng', ing: ['800 g pork ribs, cut into pieces', '2 sections of lotus root (about 600 g), the starchy kind with seven holes', '4 slices of ginger', '2 spring onions, knotted', '10 dried red dates (optional)', '1 tbsp Shaoxing wine', 'Salt to taste', 'About 2.5 litres of water'],
      steps: ['Blanch the ribs: cover with cold water, bring to the boil, skim, then rinse the ribs clean.', 'Peel the lotus root and cut into thick chunks. Don’t slice it thin — it should hold its shape for two hours.', 'Put ribs, ginger, spring onion and wine into a clay pot with the water. Bring to the boil.', 'Add the lotus root. Turn the heat down to the lowest flame you have.', 'Simmer for two hours. Low fire. Don’t rush it. Don’t lift the lid every five minutes.', 'Season with salt only at the end. Serve in big bowls. Make more than you think — people always come back for seconds.'],
      note: 'The secret is the fire. Every grandmother in Yunmeng will tell you the same thing: two hours, low fire, don’t rush it. If your soup tastes burnt, the fire was too high. If it tastes thin, you didn’t wait.',
      comments: [['lake_grandma', 'This is how my mother made it. The pink lotus root is best. Two hours!! Low fire!!', '3d'], ['yiling_radish_king', 'tried this 5 times this week. burned 4 of them (sorry lan zhan, sorry smoke alarm). the 5th was edible. still not as good as hers. what am i doing wrong', '2d'], ['lake_grandma', '@yiling_radish_king the fire is too high, child. lowest flame. then go do something else for two hours.', '2d'], ['yiling_radish_king', '@lake_grandma i don’t know how to do something else for two hours', '2d'], ['soupfan88', 'Made this for my brother when he was sick. He pretended it was from a restaurant.', '1w']] },
    'radish-cake': { title: 'Pan-fried Radish Cake', img: 'food_radish_cake', time: '1 h 30 min', serves: '6', by: 'Home Kitchen Yunmeng', ing: ['1 large white radish (about 1 kg)', '250 g rice flour', '4 dried shiitake', '2 Chinese sausages', 'Dried shrimp', 'Salt, white pepper'], steps: ['Grate the radish and cook it in its own juice for 10 minutes.', 'Fold in rice flour, chopped sausage, shiitake and shrimp.', 'Steam in a greased tin for 45 minutes. Cool completely.', 'Slice and pan-fry until golden.'], note: 'Best with radishes from Burial Mounds hill, according to one very insistent farmer.', comments: [['yiling_radish_king', 'MY RADISHES. 10/10 recipe. buy my radishes', '5d']] },
    'lotus-seed-paste-cake': { title: 'Lotus Seed Paste Birthday Cake', img: 'food_lotus_cake', time: '3 h', serves: '10', by: 'Home Kitchen Yunmeng', ing: ['Sponge: 6 eggs, 150 g sugar, 150 g flour', 'Filling: 500 g lotus seed paste', 'Cream: 400 ml whipping cream', 'Decoration: candied lotus seeds'], steps: ['Bake a sponge and split it into three layers.', 'Loosen the lotus seed paste with a little cream.', 'Layer sponge, paste and cream.', 'Decorate with candied lotus seeds. Write the name in gold if they’re turning eighteen.'], note: 'Or order from Peony Bakery, 48 hours ahead. No one will judge you.', comments: [['jingyi_lan', 'IS THIS THE ONE FOR THE THING. asking for a friend', '1d']] },
  };
  site('homekitchen.yunmeng', {
    name: 'Home Kitchen', icon: { letter: 'H', bg: '#e86a33', fg: '#fff' },
    pages: {
      '/': () => page('w-hk', 'Home Kitchen — Recipes from the lake country', [h('div.w-hk-hdr', A(HK + '/', 'Home Kitchen')), h('div.w-hk-grid', Object.keys(RECIPES).map((k) => A(HK + '/recipes/' + k, h('div.w-hk-card', art(RECIPES[k].img, 'w-hk-img'), h('b', RECIPES[k].title), h('span', RECIPES[k].time)))))]),
      '/recipes': () => SITES['homekitchen.yunmeng'].pages['/'](),
    },
    patterns: [[/^\/recipes\/([\w-]+)$/, (ctx, m) => {
      const R = RECIPES[m[1]];
      if (!R) return notFound(SITES['homekitchen.yunmeng'], ctx);
      const st = state('rec:' + m[1], { saved: false, done: {} });
      const body = h('div.w-hk-rec',
        h('div.w-hk-hdr', A(HK + '/', 'Home Kitchen')),
        art(R.img, 'w-hk-hero'),
        h('h1.w-h1', R.title),
        h('div.w-hk-meta', h('span', '⏱ ' + R.time), h('span', '🍲 Serves ' + R.serves), h('span', '★ 4.9 (1,204)')),
        h('div.w-hk-acts', Btn(st.saved ? '♥ Saved' : '♡ Save', (e) => { st.saved = !st.saved; e.currentTarget.textContent = st.saved ? '♥ Saved' : '♡ Save'; JC.ui.toast(st.saved ? 'Saved to your recipe box' : 'Removed'); }, 'w-btn-ghost'), Btn('Print', () => JC.ui.alert({ title: 'No AirPrint Printers Found', message: 'Make sure you’re on the same Wi-Fi network as a printer.', buttons: [{ text: 'OK' }] }), 'w-btn-ghost'), Btn('Jump to Recipe', (e) => { const t = e.currentTarget.closest('.w-hk-rec').querySelector('.w-hk-ing'); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 'w-btn-ghost')),
        h('div.w-hk-note', R.note),
        h('h2', 'Ingredients'),
        h('ul.w-hk-ing', R.ing.map((i, k) => { const li = h('li.tap', { class: { done: !!st.done[k] }, onTap: () => { st.done[k] = !st.done[k]; li.classList.toggle('done', !!st.done[k]); } }, i); return li; })),
        h('h2', 'Method'),
        h('ol.w-hk-steps', R.steps.map((s) => h('li', s))),
        comments(R.comments, 'recipe:' + m[1]));
      return { title: R.title + ' — Home Kitchen', node: h('div.w-page.w-hk', body), reader: { title: R.title, byline: R.by + ' · ' + R.time, paras: [R.note, 'Ingredients: ' + R.ing.join('; ') + '.'].concat(R.steps) } };
    }]],
  });

  // ═══ HowTo, Etiquette Today, AskLotus, Buzzlake ═══════════════════════════
  site('howto.lanling', {
    name: 'HowTo.lanling', icon: { letter: '?', bg: '#18a058', fg: '#fff' },
    pages: {
      '/': () => page('w-howto', 'HowTo.lanling', [h('div.w-howto-hdr', 'HowTo.lanling'), A('https://howto.lanling/found-a-lost-phone', h('div.w-howto-item', 'Found a Lost Phone? Here’s Exactly What to Do')), A('https://howto.lanling/thank-a-living-donor', h('div.w-howto-item', 'How to Thank a Living Donor'))]),
      '/found-a-lost-phone': () => article({ brand: 'HowTo.lanling', cls: 'w-howto', kicker: 'EVERYDAY ETHICS', title: 'Found a Lost Phone? Here’s Exactly What to Do', dek: 'It’s someone’s whole life in your pocket. Here’s how to get it back to them fast.', by: 'HowTo Staff', date: 'Updated Oct 2026', read: '3 min read',
        paras: [
          '1. Don’t try to unlock it — and don’t read the messages. A phone is someone’s photos, conversations and passwords. The longer you look, the harder it gets to give back.',
          '2. Check the Lock Screen. If the owner has marked it as lost, a message and a phone number will appear there. Many phones also show a Medical ID with emergency contacts — a quick way to reach family.',
          '3. If it rings, answer. Say you found the phone and where you are. Most people are calling their own number in a panic.',
          '4. Found it in a taxi or a ride-hailing car? Report it through the ride app. Swift Ride and others have a “Report a lost item” page for every trip: the company notifies the rider and the driver, and arranges a hand-over.',
          '5. Hand it in. Any police station will take found property and contact the owner. In Lanling, the Jinxing Road Police Station’s Lost & Found desk is open 24 hours.',
          '6. Don’t keep it overnight if you can help it. The owner is probably lying awake, wondering who has it.',
          'And if you’ve already read a few messages? Don’t panic. Tell the truth. People are more forgiving than you think — especially when you bring their phone back.',
        ],
        after: h('div.w-howto-box', h('b', 'Quick links'), A('https://help.swiftride.lanling/lost-items', 'Swift Ride: report a lost or found item ›'), A('https://police.lanling/lost-and-found', 'Lanling police: Lost & Found ›')),
        related: [['https://police.lanling/lost-and-found', 'Lanling Public Security: Lost & Found'], ['https://help.swiftride.lanling/lost-items', 'Swift Ride Help: lost items']] }),
      '/thank-a-living-donor': () => article({ brand: 'HowTo.lanling', cls: 'w-howto', kicker: 'RELATIONSHIPS', title: 'How to Thank a Living Donor (Even Years Later)', by: 'HowTo Staff', date: 'Jun 2024', paras: ['Step 1: It is not too late. Donors rarely expect thanks, which is exactly why it matters.', 'Step 2: Be specific. Not “thanks for everything” — “thank you for my life.”', 'Step 3: Keep it short. A long speech is for you. A short one is for them.', 'Step 4: If you can’t say it in person, record it. A voice message you meant to send is worth nothing; one you sent is worth everything.'] }),
    },
    patterns: [[/^\/([\w-]+)$/, (ctx, m) => {
      const q = unslug(m[1]);
      const steps = ['Take a breath. ' + title(q) + ' is more common than you think.', 'Write down what you actually want to happen.', 'Talk to the person involved — directly, briefly and honestly.', 'Give it a day. Most things look smaller in the morning.', 'If in doubt, ask someone you trust. (Not the internet.)'];
      return article({ brand: 'HowTo.lanling', cls: 'w-howto', kicker: 'GUIDES', title: 'How to Handle ' + title(q) + ': A Simple Guide', by: 'HowTo Staff', date: 'Updated Oct 2026', paras: steps.map((s, i) => (i + 1) + '. ' + s), related: [['https://howto.lanling/found-a-lost-phone', 'Found a Lost Phone? Here’s Exactly What to Do']] });
    }]],
  });
  const ETQ = {
    'thank-you-without-saying-thank-you': ['How to Say “Thank You” Without Saying It', ['Some people would rather walk into the sea than say “thank you” out loud. If you are one of them, you are in good company — and you still owe the words.', 'Nine ways people say it anyway: they show up. They cook. They remember the anniversary nobody else does. They fix the gate. They send soup when you’re sick and deny it afterwards. They keep a seat at the table.', 'But here is the uncomfortable truth: if the thing they did was enormous, the actions are not enough on their own. At some point, the words have to be said. Two of them. You can mutter them. You can say them to the floor. You can record them at midnight and send them before you lose your nerve.', 'They will know what it cost you. That is part of the gift.']],
    'gifts-for-organ-donors': ['What Do You Give Someone Who Gave You Part of Their Liver?', ['Short answer: nothing that fits in a box.', 'Donors almost never want repayment. Many chose to stay anonymous precisely so there would be nothing to repay. What they do want — when they’re asked — is surprisingly simple: to know that you are well, that the life they protected is being lived.', 'So: your time. Your table. A dinner invitation that is about nothing in particular. And, at some point, the sentence you have been avoiding.']],
    'heirlooms-coming-of-age': ['The Heirloom Gift: Why Coming-of-Age Calls for Something Old', ['When someone turns eighteen and already has everything money can buy, give them something it can’t.', 'A watch, a ring, a silver bell — anything that belonged to a parent or grandparent they never got to know — tells them where they come from. Have it cleaned, not changed. Tell them the story. Then let them decide what it means.']],
    'what-does-i-missed-you-mean': ['How to Respond When Someone Says “I Missed You”', ['Panicking is normal. Leaving the room is less advisable, but also common.', '“I missed you” after a long absence is rarely a trap. It usually means exactly what it says. The person has been carrying it for a while and has finally put it down in front of you.', 'You do not need a speech in return. “I missed you too” is a complete sentence. So is “Tea tomorrow?” So is showing up at three o’clock.']],
  };
  site('etiquette.today', {
    name: 'Etiquette Today', icon: { letter: 'E', bg: '#7a1f3d', fg: '#fff' },
    pages: { '/': () => page('w-etq', 'Etiquette Today', [h('div.w-etq-hdr', 'Etiquette Today'), h('div.w-etq-tag', 'Manners for modern people'), Object.keys(ETQ).map((k) => A('https://etiquette.today/' + k, h('div.w-etq-item', ETQ[k][0])))]) },
    patterns: [[/^\/([\w-]+)$/, (ctx, m) => {
      const e = ETQ[m[1]];
      const q = unslug(m[1]);
      const o = e ? { title: e[0], paras: e[1] } : { title: title(q), paras: ['Dear reader, you asked: “' + q + '?”', 'Our answer, as always: be kind, be brief, and say the thing you are afraid to say. Most social problems are solved by one honest sentence delivered at a reasonable volume.', 'If that fails, bring food.'] };
      return article({ brand: 'Etiquette Today', cls: 'w-etq', kicker: 'ADVICE', title: o.title, by: 'Madam Qin, Etiquette Today', date: 'Oct 2026', paras: o.paras, related: Object.keys(ETQ).filter((k) => k !== m[1]).slice(0, 3).map((k) => ['https://etiquette.today/' + k, ETQ[k][0]]) }, (b) => h('div', h('div.w-etq-hdr', A('https://etiquette.today/', 'Etiquette Today')), b));
    }]],
  });
  const ASK = {
    'my-brother-did-something-huge-for-me-years-ago': ['My brother did something huge for me years ago and I never thanked him. How do I say it now?', 'I found out by accident. He doesn’t know I know. It’s been two years since I found out and much longer since it happened. We are not good at talking.', [['moonlit_reader', 'Just say it. Two words. He’s been waiting longer than you think.', 1204], ['lakeside_aunt', 'Invite him over and feed him. Then say it. Food first makes everything easier.', 640], ['anon_uncle', 'I recorded mine as a voice memo and never sent it. Don’t be me. Send it.', 512], ['practical_pan', 'Write it down. You can read it off your phone. Nobody will mind.', 88]]],
    'is-it-weird-to-give-a-gift-to-my-liver-donor': ['Is it weird to give a gift to my liver donor?', 'My donor turned out to be someone I know. Very well. It’s been sixteen years. Is it too late?', [['transplant_nurse', 'Not weird, not too late. Most donors say what they want is to see you doing well.', 980], ['lakeside_aunt', 'Sixteen years? Then say thank you sixteen times.', 330]]],
    'what-do-i-give-my-nephew-who-is-turning-18': ['What do I give my nephew who is turning 18 and literally owns a tower?', 'He has everything. He has a dog the size of a sofa. Help.', [['gift_guru', 'Give him something of his mother’s.', 870], ['cool_uncle_99', 'A day with you. No phones. (He will complain. He will remember it forever.)', 420], ['jingyi_lan', 'NOT A BOW HE HAS 9 BOWS', 66]]],
    'is-it-normal-to-want-to-strangle-your-nephew': ['Is it normal to want to strangle your nephew? (affectionately)', 'He’s 17. He’s fine. Everything is fine. I just want to know if this is normal.', [['every_uncle', 'Yes. Ask any uncle. It means you love him.', 1530], ['therapist_lin', 'This is a very normal feeling expressed in a very alarming way.', 410], ['rulan_jin', 'ok whoever posted this i know it’s you', 9]]],
    'someone-said-ive-missed-you-after-a-year-apart': ['Someone said “I’ve missed you” after a year apart. What does it mean?', 'We wrote to each other — well, I wrote. They were away. Now they’re back and they said it on a balcony and I left. What do I do?', [['moonlit_reader', 'It means they missed you. You’re allowed to believe it.', 1880], ['tea_at_three', 'Go to tea.', 990], ['huaisang_fans', 'hehe~ 👀', 402]]],
  };
  site('asklotus.lanling', {
    name: 'AskLotus', icon: { letter: 'A', bg: '#ff5a5f', fg: '#fff' },
    pages: { '/': () => page('w-ask', 'AskLotus — questions & answers', [h('div.w-ask-hdr', 'AskLotus'), Object.keys(ASK).map((k) => A('https://asklotus.lanling/q/' + k, h('div.w-ask-item', ASK[k][0])))]) },
    patterns: [[/^\/q\/([\w-]+)$/, (ctx, m) => {
      let a = ASK[m[1]];
      if (!a) {
        const q = unslug(m[1]);
        a = [title(q) + '?', 'Asked by a user in Lanling · ' + (2 + hash(q) % 20) + ' days ago', [['helpful_hu', pick(['Honestly? Just ask them directly. It saves everyone time.', 'Been there. What worked for me was being completely honest.', 'Sleep on it, then do the kind thing.'], q, 1), 80 + hash(q) % 300], ['lakeside_aunt', pick(['Have you tried feeding them first?', 'Say it simply. People respect simple.', 'Whatever you do, don’t do it by text at 2 AM.'], q, 2), 30 + hash(q) % 90], ['anon_' + (hash(q) % 99), 'Following. Same question.', 4]]];
      }
      const st = state('ask:' + m[1], { votes: {}, mine: [] });
      const ansEl = h('div.w-ask-answers');
      const draw = () => {
        ansEl.innerHTML = '';
        a[2].concat(st.mine).forEach((x, i) => ansEl.appendChild(h('div.w-ask-ans', h('div.w-ask-vote', h('span.tap', { onTap: () => { st.votes[i] = st.votes[i] === 1 ? 0 : 1; draw(); } }, '▲'), h('b', String(x[2] + (st.votes[i] || 0))), h('span', '▼')), h('div', h('div.w-ask-by', x[0]), h('div.w-ask-t', x[1])))));
      };
      draw();
      const inp = JC.ui.input({ multiline: true, rows: 2, placeholder: 'Write an answer…', cls: 'w-input' });
      return { title: a[0] + ' — AskLotus', node: h('div.w-page.w-ask', h('div.w-ask-hdr', A('https://asklotus.lanling/', 'AskLotus')), h('h1.w-ask-q', a[0]), h('div.w-ask-d', a[1]), h('div.w-ask-n', (a[2].length + st.mine.length) + ' answers'), ansEl, h('div.w-ask-new', inp, Btn('Post answer', () => { if (!inp.value.trim()) return; st.mine.push(['jiang.cheng', inp.value.trim(), 1]); inp.value = ''; draw(); JC.story.act('web_comment', { text: 'answer', page: m[1] }); }, 'w-btn-ask'))), reader: { title: a[0], byline: 'AskLotus', paras: [a[1]].concat(a[2].map((x) => x[0] + ': ' + x[1])) } };
    }]],
  });
  const BUZZ = {
    '10-signs-brother-secretly-loves-you': ['10 Signs Your Brother Secretly Loves You (#7 Will Surprise You)', ['He insults your cooking but eats all of it.', 'He remembers your birthday and pretends he doesn’t. (He bought the gift in July.)', 'He calls you by your full name when he’s angry. And when he’s not.', 'He threatens bodily harm in a tone usually reserved for weather reports.', 'He shows up. Late, scowling, complaining — but he shows up.', 'He knows exactly how you take your tea and acts like it’s common knowledge.', 'He sends soup when you’re sick — anonymously — and denies it for years. (Yes, really. Ask our readers.)', 'He let you keep the bed by the window. You’re thirty-four and you still have it.', 'He told the guard at the gate, “Next time, let him in,” and then never mentioned it again.', 'He reads every message you send. He just doesn’t answer the important ones yet.']],
    'gifts-for-18-year-old-who-has-everything': ['27 Gifts for the 18-Year-Old Who Has Everything', ['A family heirloom, restored.', 'A day with you, phones off.', 'Driving lessons (from a professional, for everyone’s sake).', 'A framed photo of someone they never got to meet.', 'Dog-friendly concert tickets (they exist).', 'A letter, handwritten, to open when they’re thirty.', 'An archery bow (check first: they may already have nine).']],
    'signs-you-are-the-cool-uncle': ['12 Signs You Are the Cool Uncle (Even If You Yell)', ['They text you first when something goes wrong.', 'They text you second when something goes right.', 'You have threatened to break their legs and they find it comforting.', 'Their friends are scared of you. Their friends also want your approval.', 'You bought the dog.']],
  };
  site('buzzlake.lanling', {
    name: 'Buzzlake', icon: { letter: 'B', bg: '#ffcc00', fg: '#e5383b' },
    pages: { '/': () => page('w-buzz', 'Buzzlake', [h('div.w-buzz-hdr', 'Buzzlake'), Object.keys(BUZZ).map((k) => A('https://buzzlake.lanling/life/' + k, h('div.w-buzz-item', BUZZ[k][0])))]) },
    patterns: [[/^\/life\/([\w-]+)$/, (ctx, m) => {
      let b = BUZZ[m[1]];
      if (!b) { const q = unslug(m[1]); b = [(5 + hash(q) % 15) + ' Things Nobody Tells You About ' + title(q), ['It’s more complicated than it looks.', 'Everyone pretends to be an expert.', 'The best advice is usually from someone who’s been through it.', 'Number four will surprise you (it’s that you should just ask).', 'It gets easier.']]; }
      const items = b[1].map((t, i) => h('div.w-buzz-li', h('div.w-buzz-n', String(i + 1)), h('div', h('b', t))));
      const st = state('buzz:' + m[1], { r: null });
      const reacts = h('div.w-buzz-reacts', ['😂 LOL', '😭 Cry', '😍 Love', '🙄 Eh'].map((r) => h('span.tap', { class: { on: st.r === r }, onTap: (e) => { st.r = r; reacts.querySelectorAll('span').forEach((s) => s.classList.toggle('on', s === e.currentTarget)); } }, r)));
      return { title: b[0] + ' — Buzzlake', node: h('div.w-page.w-buzz', h('div.w-buzz-hdr', A('https://buzzlake.lanling/', 'Buzzlake')), h('h1.w-buzz-t', b[0]), h('div.w-buzz-by', 'by Buzzlake Staff · ' + (12 + hash(b[0]) % 400) + 'K views'), items, h('div.w-buzz-q', 'What’s your reaction?'), reacts, h('div.w-buzz-ad', 'Advertisement · Lotus Eats: 20% off hotpot this weekend')), reader: { title: b[0], byline: 'Buzzlake', paras: b[1].map((t, i) => (i + 1) + '. ' + t) } };
    }]],
  });

  // ═══ Wavepedia ═══════════════════════════════════════════════════════════
  const WIKI = {
    Yunmeng_Jiang_Group: { title: 'Yunmeng_Jiang_Group', short: 'Logistics & agriculture conglomerate', img: 'p_lotus_pond_day', info: [['Type', 'Private'], ['Industry', 'Logistics, lake freight, agriculture'], ['Founded', '1952, Yunmeng'], ['Headquarters', 'Lotus Pier, Yunmeng'], ['Key people', 'Jiang Cheng (CEO)'], ['Revenue', '¥48.2 billion (2025)'], ['Employees', '21,400'], ['Emblem', 'Nine-petal lotus']],
      lead: ['The Yunmeng Jiang Group (YMJ) is a privately held logistics, lake-freight and food company headquartered at Lotus Pier on the northern shore of Yunmeng Lake. It is owned by the Jiang family.'],
      secs: [['History', ['Founded in 1952 as a fleet of lotus boats, the company grew into the largest freight operator in the lake country by the 1990s under Jiang Fengmian.', 'In August 2008, during a hostile takeover attempt by the Wen Corporation, a fire at Lotus Pier killed Jiang Fengmian and his wife Yu Ziyuan. The company nearly collapsed.', 'In 2009 their son, Jiang Cheng, then seventeen, took control. Over the following decade he rebuilt YMJ into one of the province’s leading cold-chain logistics groups.']], ['Operations', ['YMJ operates trucking on the G42 Lanling–Yunmeng corridor, lake freight from Lotus Pier and Lotus Bay, and Lotus Pier Foods, which sells lotus root, lotus seeds and lake fish.']], ['Lotus Pier', ['The Jiang family estate and company headquarters. Rebuilt after 2008; the public lotus gardens open on summer weekends.']]] },
    'Jiang_Cheng_(businessman)': { title: 'Jiang_Cheng_(businessman)', short: 'CEO of the Yunmeng Jiang Group', info: [['Born', '15 May 1992, Yunmeng'], ['Occupation', 'Chief executive'], ['Known for', 'Rebuilding YMJ'], ['Courtesy name', 'Wanyin'], ['Relatives', 'Jiang Yanli (sister, d. 2009); Jin Ling (nephew)']],
      lead: ['Jiang Cheng (born 15 May 1992), courtesy name Wanyin, is a businessman who has served as chief executive of the Yunmeng Jiang Group since 2009. He is known for rebuilding the company after the 2008 Lotus Pier fire and for his famously short temper and shorter emails.'],
      secs: [['Personal life', ['Jiang is unmarried. He has been the guardian of his nephew Jin Ling, heir to the Jin Group, since 2009.', 'He is notoriously private. Interviews are rare and usually end early. He is said to own a car named Sandu and to have strong opinions about dogs (positive).']], ['In the press', ['Lanling Daily once described him as a man who “does not attend parties so much as survive them.”']]] },
    Koi_Tower: { title: 'Koi_Tower', short: 'Skyscraper in Lanling', img: 'p_gala_hall', info: [['Location', '88 Jinlin Avenue, Lanling'], ['Completed', '1987'], ['Floors', '52'], ['Owner', 'Jin Group']], lead: ['Koi Tower is a 52-storey skyscraper in the Jinlin District of Lanling and the headquarters of the Jin Group. Its gold crown and the koi pond in its forecourt make it one of the city’s best-known landmarks.'], secs: [['Koi pond', ['The forecourt pond, dug in 1986, holds 88 koi. The eldest, Old Gold, is 41.']]] },
    Jin_Group: { title: 'Jin_Group', short: 'Conglomerate in Lanling', info: [['Type', 'Public (JNG)'], ['Founded', '1958'], ['Headquarters', 'Koi Tower, Lanling'], ['Heir', 'Jin Ling']], lead: ['The Jin Group is a Lanling-based conglomerate with interests in property, finance and luxury retail. Its headquarters is Koi Tower.'], secs: [['Governance', ['After the 2024 conviction of its former chief executive Jin Guangyao, the group adopted an independent board. The heir, Jin Ling, will join its Advisory Board as an observer at eighteen.']]] },
    Gusu_Lan_Academy: { title: 'Gusu_Lan_Academy', short: 'Academy on Mount Gusu', img: 'p_cloud_recesses', info: [['Campus', 'Cloud Recesses'], ['Chancellor', 'Lan Xichen'], ['Chair', 'Lan Qiren'], ['Rules', 'approx. 3,412']], lead: ['Gusu Lan Academy is a private academy of music and letters on Mount Gusu, famous for its misty campus, Cloud Recesses, and its Wall of Discipline.'], secs: [['Summer programme', ['The academy’s residential summer programme has hosted students from the great families since 1962. The 2007 cohort is the subject of an appendix to the rules.']]] },
    Lan_Xichen: { title: 'Lan_Xichen', short: 'Chancellor of Gusu Lan Academy', info: [['Born', '3 September 1989'], ['Title', 'Chancellor'], ['Known as', 'Zewu-jun'], ['Relatives', 'Lan Wangji (brother)']], lead: ['Lan Xichen (born 1989), known as Zewu-jun, is the Chancellor of Gusu Lan Academy. He withdrew from public life in August 2025 and returned in September 2026.'], secs: [['Personal', ['He lives in the Hanshi, a tea house within Cloud Recesses. He is known for his gentleness and his white peony tea.']]] },
    Nie_Corp: { title: 'Nie_Corp', short: 'Industrial group in Qinghe', info: [['Headquarters', 'The Unclean Realm, Qinghe'], ['Chairman', 'Nie Huaisang'], ['Founded', '1931']], lead: ['Nie Corp is a steel and security group headquartered in a fortress-like complex in Qinghe known as the Unclean Realm.'], secs: [['Leadership', ['Chairman Nie Huaisang, who succeeded his late brother, is known for his hand-painted fans and for insisting that he knows nothing about anything.']]] },
    Nie_Huaisang: { title: 'Nie_Huaisang', short: 'Chairman of Nie Corp; fan painter', info: [['Born', '25 February 1993'], ['Occupation', 'Chairman, Nie Corp; artist']], lead: ['Nie Huaisang is the chairman of Nie Corp and the founder of the hand-painted fan brand Huaisang Fans. He is famous for the phrase “I don’t know.”'], secs: [] },
    Lanling: { title: 'Lanling', short: 'City', info: [['Population', '9.8 million'], ['Landmarks', 'Koi Tower, Peony Park'], ['River', 'Great River']], lead: ['Lanling is the largest city of the region, on the north bank of the Great River. It is home to the Jin Group and Koi Tower.'], secs: [['Districts', ['Jinlin, Peony Hill, Fangfei, Riverside, Jinxing and Lanling South.']]] },
    Yunmeng: { title: 'Yunmeng', short: 'City on Yunmeng Lake', img: 'p_sunrise_lake', info: [['Lake', 'Yunmeng Lake'], ['Known for', 'Lotus, lake freight']], lead: ['Yunmeng is a lake city on the northern shore of Yunmeng Lake, known for its lotus fields and as the home of the Yunmeng Jiang Group.'], secs: [] },
    Lotus_root_soup: { title: 'Lotus_root_soup', short: 'Soup', img: 'food_soup', info: [['Region', 'Yunmeng'], ['Main ingredients', 'Lotus root, pork ribs']], lead: ['Lotus root and pork rib soup is a slow-simmered soup from the lake country, traditionally cooked over a low fire for about two hours.'], secs: [['Preparation', ['The ribs are blanched, then simmered with thick chunks of lotus root, ginger and spring onion. Cooks agree that the heat must be low.']]] },
    White_peony_tea: { title: 'White_peony_tea', short: 'White tea', img: 'p_tea_hanshi', info: [['Type', 'White tea'], ['Brew', '85 °C, 2–3 min']], lead: ['White peony (Bai Mudan) is a white tea made from the bud and two leaves of the tea plant. It is brewed below boiling, usually at about 85 °C.'], secs: [] },
    Living_donor_liver_transplant: { title: 'Living_donor_liver_transplant', short: 'Surgical procedure', info: [['Regrowth', '6–8 weeks']], lead: ['In a living donor liver transplant, part of a healthy person’s liver is transplanted into a patient. Both the donor’s remaining liver and the transplanted portion regrow to near-normal size within months.'], secs: [['Donors', ['Donors are often family members. Some choose to remain anonymous to the recipient.']]] },
  };
  site('wavepedia.org', {
    name: 'Wavepedia', icon: { letter: 'W', bg: '#ffffff', fg: '#202122' },
    pages: { '/': () => SITES['wavepedia.org'].patterns[0][1](null, [null, 'Lanling']) },
    patterns: [[/^\/wiki\/(.+)$/, (ctx, m) => {
      const key = decodeURIComponent(m[1]);
      const w = WIKI[key] || WIKI[Object.keys(WIKI).find((k) => k.toLowerCase() === key.toLowerCase()) || ''];
      const T = (w ? w.title : key).replace(/_/g, ' ');
      const srch = JC.ui.input({ placeholder: 'Search Wavepedia', cap: 'none', enterkey: 'search', cls: 'w-wiki-in', onSubmit: (v) => { if (v.trim()) goFrom(srch, 'https://wavepedia.org/wiki/' + title(v.trim()).replace(/\s+/g, '_')); } });
      const hdr = h('div.w-wiki-hdr', A('https://wavepedia.org/wiki/Lanling', h('span.w-wiki-logo', 'Wavepedia')), srch);
      if (!w) {
        return { title: T + ' — Wavepedia', node: h('div.w-page.w-wiki', hdr, h('h1.w-wiki-t', T), h('div.w-wiki-from', 'From Wavepedia, the free encyclopedia'), h('p', h('b', T), ' may refer to:'), h('ul', h('li', A(SEARCH(T), T + ' — web results')), h('li', T + ' (disambiguation)'), h('li', T + ' in the culture of the five cities')), h('p', 'This article is a stub. You can help Wavepedia by ', h('span.tap.w-wiki-link', { onTap: () => JC.ui.alert({ title: 'Edit Wavepedia', message: 'Editing requires an account. You would be editing as “Jiang Cheng”. Wavepedia editors would have questions.', buttons: [{ text: 'OK' }] }) }, 'expanding it'), '.'), h('div.w-wiki-see', h('b', 'See also: '), ['Lanling', 'Yunmeng', 'Gusu_Lan_Academy'].map((k) => A('https://wavepedia.org/wiki/' + k, k.replace(/_/g, ' '))))), reader: null };
      }
      const toc = h('div.w-wiki-toc', h('b', 'Contents'), w.secs.map((s, i) => h('div', (i + 1) + ' ' + s[0])));
      const node = h('div.w-page.w-wiki', hdr, h('h1.w-wiki-t', T), h('div.w-wiki-from', 'From Wavepedia, the free encyclopedia'),
        h('table.w-wiki-info', h('caption', T), w.img ? h('tr', h('td', { attrs: { colspan: 2 } }, art(w.img, 'w-wiki-img'))) : null, w.info.map(([k, v]) => h('tr', h('th', k), h('td', v)))),
        para(w.lead), w.secs.length ? toc : null,
        w.secs.map((s) => [h('h2.w-wiki-h2', s[0]), para(s[1])]),
        h('div.w-wiki-ref', h('h2.w-wiki-h2', 'References'), h('ol', [A(LD + '/', 'Lanling Daily archive'), A('https://lotuspier.yunmeng/about', 'YMJ: About'), A(IR + '/governance', 'Jin Group governance')].map((x) => h('li', x)))),
        h('div.w-wiki-foot', 'This page was last edited on 14 October 2026. Text is available under a free licence.'));
      return { title: T + ' — Wavepedia', node, reader: { title: T, byline: 'Wavepedia', paras: w.lead.concat(...w.secs.map((s) => s[1])) } };
    }]],
  });

  // ═══ Business & personal sites ════════════════════════════════════════════
  function simpleSite(host, o) {
    return site(host, Object.assign({ pages: {} }, o));
  }
  simpleSite('radish.yiling', {
    name: 'Yiling Radish Co.', icon: { letter: '🥕', bg: '#ffefe2', fg: '#e5383b' },
    pages: {
      '/': () => page('w-rad', 'Yiling Radish Co. — radishes so good you’ll cry', [
        h('div.w-rad-hdr', h('div.w-rad-logo', 'YILING RADISH CO.'), h('div.w-rad-tag', 'radishes so good you’ll cry!!! 🥕🥕🥕')),
        art('p_radishes', 'w-rad-hero'),
        h('div.w-rad-pop', h('b', '📣 POP-UP THIS WEEKEND!!'), h('span', 'Lanling Night Market · Fri–Sun · 6 PM till we sell out (or till lan zhan makes me go home)'), Btn('Order on Lotus Eats', () => JC.os.open('lotuseats', { rest: 'yiling-popup' }), 'w-btn-rad')),
        h('div.w-rad-grid', [['Big white radish', '¥12/kg', 'p_radishes'], ['Radish cake (4 pcs)', '¥28', 'p_radish_cake'], ['VERY spicy chili oil', '¥36', 'food_skewers'], ['Radish & rib soup*', '¥42', 'food_soup']].map(([t, p, a]) => h('div.w-rad-card', art(a, 'w-rad-img'), h('b', t), h('span', p)))),
        h('p.w-rad-small', '*not as good as my sister’s. nothing is.'),
        h('div.w-rad-about', h('h2', 'about us'), h('p', 'Yiling Radish Co. is one guy, one hill, a lot of radishes and a husband who does the accounts. I also teach flute at Gusu Lan Academy (come to my Thursday class!!). We are on the slope of Burial Mounds hill — come visit on weekends! (no dogs please. please. i am begging.)'), A('https://cloudrecesses.gusu/events/flute-masterclass', 'flute class →'), ' ', A('https://wavesearch.net/maps?q=Yiling+Radish', 'find the farm →')),
        h('div.w-foot', '© Yiling Radish Co. · Chief Radish Officer: Wei Ying · accounts: Lan Zhan (he says hi) (he didn’t) (he thought it)')]),
    },
  });
  simpleSite('laomahotpot.gusu', {
    name: 'Laoma Hotpot', icon: { letter: '老', bg: '#c8102e', fg: '#ffd84d' },
    pages: {
      '/': () => page('w-laoma', 'Laoma Hotpot 老妈火锅 — Gusu', [
        h('div.w-laoma-hdr', h('div.w-laoma-cn', '老妈火锅'), h('div.w-laoma-en', 'LAOMA HOTPOT · SINCE 1998 · GUSU OLD TOWN')),
        art('p_hotpot_alumni', 'w-laoma-hero'),
        h('div.w-laoma-sec', h('h2', 'Broths'), ['Bone broth (gentle)', 'Numbing mala (not gentle)', 'Yin-yang (for people who can’t decide)', 'Tomato (for children and Lan Wangji)'].map((t, i) => h('div.w-laoma-row', h('span', t), h('b', '¥' + [48, 58, 68, 48][i])))),
        h('div.w-laoma-sec', h('h2', 'Popular'), ['Hand-cut lamb', 'Beef tripe', 'Lotus root slices', 'Shrimp paste', 'Tofu skin'].map((t, i) => h('div.w-laoma-row', h('span', t), h('b', '¥' + [68, 42, 18, 46, 16][i])))),
        h('div.w-laoma-sec', h('h2', 'Our story'), h('p', 'Opened by Ma Laoshi in 1998 by the canal. Students from Cloud Recesses have been sneaking down the mountain for our mala since the beginning. We see you. We will not tell.')),
        h('div.w-laoma-btns', Btn('Reserve a table', () => JC.mapview.callPlace('laoma-hotpot'), 'w-btn-laoma'), Btn('Directions', () => JC.os.open('maps', { directions: 'laoma-hotpot' }), 'w-btn-ghost')),
        h('div.w-foot', '36 Canal Street, Old Town, Gusu · 11:00–02:00 · +86 555 0512 6688')]),
    },
  });
  simpleSite('goldenpeony.lanling', {
    name: 'Golden Peony Hotel', icon: { letter: '❀', bg: '#3a2a12', fg: '#e8c56b' },
    pages: {
      '/': () => page('w-gp', 'Golden Peony Hotel Lanling', [
        h('div.w-gp-hdr', h('div.w-gp-logo', 'GOLDEN PEONY'), h('div.w-gp-sub', 'LANLING · ON THE GREAT RIVER')),
        art('p_hotel_lobby', 'w-gp-hero'),
        h('div.w-gp-sec', h('h2', 'Stay'), ['River Suite', 'Peony Room', 'Moon Terrace Suite'].map((t, i) => h('div.w-gp-room', h('b', t), h('span', ['Panoramic river views · from ¥3,200', 'Garden views · from ¥1,880', 'Private terrace · from ¥6,600'][i]), h('span.tap.w-gp-book', { onTap: () => JC.ui.alert({ title: 'Book ' + t + '?', message: 'You are signed in as Jiang Cheng (Platinum Elite). He already has a room. Room 1808. Until Sunday.', buttons: [{ text: 'OK' }] }) }, 'Book ›')))),
        h('div.w-gp-sec', h('h2', 'Dine'), h('p', 'Silk Moon rooftop bar · Peony Court (Cantonese) · 24-hour in-room dining.')),
        h('div.w-gp-btns', Btn('Call the Hotel', () => JC.mapview.callPlace('golden-peony'), 'w-btn-gold'), Btn('My Reservation', () => JC.os.open('wallet', { card: 'hotel' }), 'w-btn-ghost')),
        h('div.w-foot', '16 Riverside Drive, Lanling · +86 555 0880 1808')]),
    },
  });
  simpleSite('petkingdom.lanling', {
    name: 'Pet Kingdom', icon: { letter: '🐾', bg: '#ff9f0a', fg: '#fff' },
    pages: {
      '/': () => page('w-pet', 'Pet Kingdom — Everything for pets', [
        h('div.w-pet-hdr', h('div.w-pet-logo', 'Pet Kingdom'), h('div.w-pet-sub', '118 Jinxing Road, Lanling · 9:00–21:00 · +86 555 0601 3300')),
        h('div.w-pet-banner', 'Platinum Paw members: 10% off giant-breed food this week'),
        h('div.w-pet-grid', [['Giant Breed Adult, 20 kg', '¥689', 'p_receipt'], ['Orthopedic dog bed XXL', '¥8,800', 'p_dog_park'], ['Chew antler (large)', '¥58', 'p_puppies'], ['Dog shampoo, “no tears”', '¥46', 'p_dog_park']].map(([t, p, a]) => h('div.w-pet-card', art(a, 'w-pet-img'), h('b', t), h('span', p), h('span.tap.w-pet-add', { onTap: () => JC.ui.toast('Added to cart', { icon: 'cart.fill' }) }, 'Add to cart')))),
        h('div.w-pet-sec', h('b', 'Delivery'), h('span', ' Order through Lotus Eats for same-day delivery. '), A('https://wavesearch.net/search?q=pet+kingdom+lotus+eats', 'How it works')),
        h('div.w-foot', '© Pet Kingdom · Self-service dog wash · Grooming by appointment')]),
    },
  });
  simpleSite('lanling-intl.lanling', {
    name: 'Lanling International School', icon: { letter: 'L', bg: '#0b3d6b', fg: '#ffd166' },
    pages: {
      '/': () => page('w-lis', 'Lanling International School', [
        h('div.w-lis-hdr', h('div.w-lis-logo', 'Lanling International School'), h('div.w-lis-nav', A('https://lanling-intl.lanling/parents', 'Parent Portal'), A(LD + '/sports/lanling-international-archery', 'News'))),
        h('div.w-lis-sec', h('h2', 'Notices'), ['Parent–teacher conferences took place on Thursday 15 October. Thank you to all families who attended.', 'Congratulations to the archery team, regional champions for the third year running!', 'Seniors with learner permits: students may not drive to school, or anywhere near the Koi Tower forecourt, without a licensed adult.', 'Chemistry laboratory: reopened. Eyebrows will grow back.'].map((t) => h('div.w-lis-n', t))),
        h('div.w-foot', '2 Academy Road, Lanling · Office Mon–Fri 7:30–17:30')]),
      '/parents': () => page('w-login-page', 'Parent Portal — Lanling International School', [h('div.w-intra', loginForm({ key: 'lis', brand: 'Parent Portal', logo: 'Lanling International · Parent Portal', color: '#0b3d6b', sub: 'Grades, attendance and conference notes', user: 'jiang.cheng@lotuspier.yunmeng', userLabel: 'Email', max: 3, resetText: 'A reset link has been sent to jiang.cheng@lotuspier.yunmeng.', lockedText: 'Account locked. Please contact the school office.' }))]),
    },
  });
  simpleSite('niecorp.qinghe', {
    name: 'Nie Corp', icon: { letter: '聶', bg: '#1f3a2e', fg: '#d4e9d8' },
    pages: {
      '/': () => page('w-nie', 'Nie Corp — Qinghe', [h('div.w-nie-hdr', 'NIE CORP'), h('div.w-nie-sub', 'Steel · Security · Since 1931 · The Unclean Realm, Qinghe'), h('div.w-nie-sec', h('h2', 'A message from our Chairman'), h('p', '“I don’t know very much about steel. Fortunately, our engineers know everything. Please enjoy our website, and maybe also my fans.” — Nie Huaisang'), A('https://huaisangfans.qinghe/', 'Visit Huaisang Fans →')), h('div.w-foot', '© Nie Corp · 1 Nie Road, Qinghe')]),
    },
  });
  simpleSite('huaisangfans.qinghe', {
    name: 'Huaisang Fans', icon: { letter: '扇', bg: '#f6efe2', fg: '#2f9e44' },
    pages: {
      '/': () => page('w-fans', 'Huaisang Fans — hand-painted fans', [h('div.w-fans-hdr', 'Huaisang Fans 🪭'), h('div.w-fans-sub', 'Hand-painted in Qinghe. Every fan is one of a kind (like every secret).'),
        h('div.w-fans-grid', [['Lotus at Dusk', '¥1,200'], ['Mist over Gusu', '¥1,500'], ['Two Koi', '¥980'], ['NEW: Moonlit Balcony ✨', 'Limited · ¥2,600'], ['A Very Large Dog', '¥880'], ['Radish (commissioned)', 'Sold']].map(([t, p]) => h('div.w-fans-card', h('div.w-fans-art', { style: { background: 'hsl(' + (hash(t) % 360) + ',45%,82%)' } }, '🪭'), h('b', t), h('span', p), h('span.tap.w-fans-buy', { onTap: () => JC.ui.alert({ title: t, message: t.includes('Balcony') ? '“Two figures on a balcony under a full moon. One in white, one in purple. Painted tonight.” — The artist knows nothing about where the inspiration came from.' : 'Commissions open. The artist will reply “soon~”.', buttons: [{ text: 'OK' }] }) }, 'Details')))),
        h('div.w-foot', '© Huaisang Fans · The artist knows nothing.')]),
    },
  });
  simpleSite('help.swiftride.lanling', {
    name: 'Swift Ride Help', icon: { letter: 'S', bg: '#111214', fg: '#ffd60a' },
    pages: {
      '/': () => SITES['help.swiftride.lanling'].pages['/lost-items'](),
      '/lost-items': () => page('w-swift', 'Lost or found an item? — Swift Ride Help', [h('div.w-swift-hdr', h('span.w-swift-logo', 'Swift'), h('span', 'Help')), h('h1.w-swift-t', 'Lost or found an item?'),
        para(['If you left something in a Swift Ride, or found something that isn’t yours, the fastest way to sort it out is in the app.', '1. Open Swift Ride and go to Activity.', '2. Choose the trip.', '3. Tap Help → Report a lost item. You can report something you lost, or something you found — we’ll notify the rider and the driver and arrange a hand-over.', 'Items are usually returned within 24 hours.']),
        Btn('Open Swift Ride', () => JC.os.open('swift', { report: true }), 'w-btn-swift'),
        h('div.w-foot', '© Swift Ride · Safety · Terms')]),
    },
  });
  simpleSite('police.lanling', {
    name: 'Lanling Public Security', icon: { letter: '警', bg: '#1d3f72', fg: '#fff' },
    pages: {
      '/': () => SITES['police.lanling'].pages['/lost-and-found'](),
      '/lost-and-found': () => page('w-police', 'Lost & Found — Lanling Public Security', [h('div.w-police-hdr', 'Lanling Public Security Bureau'), h('h1.w-police-t', 'Lost & Found'),
        para(['Found property can be handed in at any police station in Lanling at any time. The officer on duty will record the item and contact the owner — usually the same day.', 'Nearest 24-hour Lost & Found desk to Jinxing District: Jinxing Road Police Station, 140 Jinxing Road.', 'Phones: please bring the device as you found it. If it is locked, we can still reach the owner through the network operator or the emergency contacts on its Lock Screen.']),
        h('div.w-police-btns', Btn('Directions to Jinxing Road Station', () => JC.os.open('maps', { directions: 'jinxing-police' }), 'w-btn-police'), Btn('Call the Station', () => JC.mapview.callPlace('jinxing-police'), 'w-btn-ghost')),
        h('div.w-foot', 'Emergency: 110 · Lanling Public Security Bureau')]),
    },
  });
})();
