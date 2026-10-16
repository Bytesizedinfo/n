/* Wavelet — seed data (profiles, posts, DMs, activity, stories) and a few Wavelet-only illustrations.
   Facts: docs/STORY.md ("Wavelet" + handles). Collections: posts (shared schema), wvusers, wvdms, wvact. */
(function () {
  'use strict';
  const JC = window.JC;

  // ── illustrations used only by Wavelet (fans, gossip cards) ───────────────
  const FONT = 'font-family="-apple-system,Helvetica,Arial,sans-serif"';
  function fan(w, h, o) {
    const cx = w / 2, cy = h * 0.86, R = h * 0.66, r0 = h * 0.13;
    const a0 = Math.PI * 1.06, a1 = Math.PI * 1.94;
    const pt = (r, a) => [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)];
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>` +
      `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.bg[0]}"/><stop offset="1" stop-color="${o.bg[1]}"/></linearGradient>` +
      `<linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.leaf[0]}"/><stop offset="1" stop-color="${o.leaf[1]}"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#bg)"/>`;
    // table edge + shadow
    s += `<rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="${o.table}"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 8}" rx="${R * 0.95}" ry="${h * 0.035}" fill="rgba(0,0,0,.18)"/>`;
    const n = 16;
    for (let i = 0; i < n; i++) {
      const aa = a0 + ((a1 - a0) * i) / n, ab = a0 + ((a1 - a0) * (i + 1)) / n;
      const [x1, y1] = pt(r0, aa), [x2, y2] = pt(R, aa), [x3, y3] = pt(R, ab), [x4, y4] = pt(r0, ab);
      s += `<path d="M${x1} ${y1}L${x2} ${y2}A${R} ${R} 0 0 1 ${x3} ${y3}L${x4} ${y4}A${r0} ${r0} 0 0 0 ${x1} ${y1}Z" fill="url(#lf)" opacity="${i % 2 ? 0.92 : 1}"/>`;
    }
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      const [x2, y2] = pt(R * 0.995, a);
      s += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="rgba(80,50,30,.18)" stroke-width="1.2"/>`;
    }
    // painted motif
    o.motif.forEach((m) => {
      const [mx, my] = pt(R * m.r, a0 + (a1 - a0) * m.a);
      if (m.kind === 'flower') {
        for (let p = 0; p < 6; p++) s += `<ellipse cx="${mx}" cy="${my - m.s * 0.55}" rx="${m.s * 0.42}" ry="${m.s * 0.7}" fill="${m.c}" opacity=".88" transform="rotate(${p * 60} ${mx} ${my})"/>`;
        s += `<circle cx="${mx}" cy="${my}" r="${m.s * 0.3}" fill="${m.c2}"/>`;
      } else if (m.kind === 'lotus') {
        s += `<path d="M${mx} ${my - m.s}C${+mx - m.s * 0.5} ${my - m.s * 0.4} ${+mx - m.s * 0.4} ${my + m.s * 0.3} ${mx} ${my + m.s * 0.35}C${+mx + m.s * 0.4} ${my + m.s * 0.3} ${+mx + m.s * 0.5} ${my - m.s * 0.4} ${mx} ${my - m.s}Z" fill="${m.c}"/>`;
        s += `<path d="M${+mx - m.s} ${my - m.s * 0.2}C${+mx - m.s * 0.6} ${my + m.s * 0.4} ${+mx - m.s * 0.2} ${my + m.s * 0.4} ${mx} ${my + m.s * 0.35}C${+mx - m.s * 0.5} ${my + m.s * 0.1} ${+mx - m.s * 0.8} ${my - m.s * 0.1} ${+mx - m.s} ${my - m.s * 0.2}ZM${+mx + m.s} ${my - m.s * 0.2}C${+mx + m.s * 0.6} ${my + m.s * 0.4} ${+mx + m.s * 0.2} ${my + m.s * 0.4} ${mx} ${my + m.s * 0.35}C${+mx + m.s * 0.5} ${my + m.s * 0.1} ${+mx + m.s * 0.8} ${my - m.s * 0.1} ${+mx + m.s} ${my - m.s * 0.2}Z" fill="${m.c2}"/>`;
      } else if (m.kind === 'leaf') {
        s += `<ellipse cx="${mx}" cy="${my}" rx="${m.s}" ry="${m.s * 0.32}" fill="${m.c}" transform="rotate(${m.rot || -30} ${mx} ${my})" opacity=".85"/>`;
      } else if (m.kind === 'stroke') {
        s += `<path d="M${+mx - m.s} ${my}q${m.s * 0.5} ${-m.s * 0.6} ${m.s} 0t${m.s} 0" fill="none" stroke="${m.c}" stroke-width="${m.s * 0.12}" stroke-linecap="round"/>`;
      }
    });
    // guard sticks + rivet
    const [gx1, gy1] = pt(R * 1.01, a0), [gx2, gy2] = pt(R * 1.01, a1);
    s += `<line x1="${cx}" y1="${cy}" x2="${gx1}" y2="${gy1}" stroke="${o.stick}" stroke-width="7" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${gx2}" y2="${gy2}" stroke="${o.stick}" stroke-width="7" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="9" fill="${o.stick}"/><circle cx="${cx}" cy="${cy}" r="3.5" fill="#f6e7b0"/>`;
    if (o.tassel) s += `<path d="M${cx} ${cy + 9}q6 30 -4 60" stroke="${o.tassel}" stroke-width="3" fill="none"/><path d="M${cx - 10} ${cy + 66}h12l-2 40h-8z" fill="${o.tassel}"/>`;
    return s + '</svg>';
  }
  JC.art.def('wv_fan_peony', {
    title: 'Hand-painted peony fan', w: 1080, h: 1080, tags: ['fan', 'nie'],
    svg: (w, h) => fan(w, h, { bg: ['#f4ead9', '#e6d4b8'], leaf: ['#fffaf0', '#f1e3c8'], table: '#8a5a3a', stick: '#5b3a22', tassel: '#2f9e44',
      motif: [{ kind: 'flower', a: 0.3, r: 0.72, s: 46, c: '#f06595', c2: '#ffd43b' }, { kind: 'flower', a: 0.42, r: 0.55, s: 34, c: '#f783ac', c2: '#ffe066' }, { kind: 'leaf', a: 0.22, r: 0.55, s: 40, c: '#40c057' }, { kind: 'leaf', a: 0.52, r: 0.74, s: 36, c: '#2f9e44', rot: 20 }, { kind: 'stroke', a: 0.72, r: 0.78, s: 60, c: '#495057' }, { kind: 'stroke', a: 0.8, r: 0.62, s: 40, c: '#868e96' }] }),
  });
  JC.art.def('wv_fan_lotus', {
    title: 'Purple lotus fan', w: 1080, h: 1080, tags: ['fan', 'lotus', 'nie'],
    svg: (w, h) => fan(w, h, { bg: ['#2b1d44', '#160f26'], leaf: ['#b197fc', '#7048e8'], table: '#1a1226', stick: '#2b1a12', tassel: '#ae3ec9',
      motif: [{ kind: 'lotus', a: 0.5, r: 0.68, s: 70, c: '#fcc2d7', c2: '#f06595' }, { kind: 'lotus', a: 0.25, r: 0.52, s: 40, c: '#ffdeeb', c2: '#faa2c1' }, { kind: 'leaf', a: 0.72, r: 0.55, s: 52, c: '#38d9a9', rot: 10 }, { kind: 'leaf', a: 0.82, r: 0.75, s: 40, c: '#20c997', rot: -20 }] }),
  });
  JC.art.def('wv_fan_bamboo', {
    title: 'Bamboo fan', w: 1080, h: 1080, tags: ['fan', 'nie'],
    svg: (w, h) => fan(w, h, { bg: ['#e9f5ec', '#cfe8d6'], leaf: ['#ffffff', '#eef4ea'], table: '#6b8f71', stick: '#3d5c2f', tassel: '#e8590c',
      motif: [{ kind: 'leaf', a: 0.2, r: 0.7, s: 60, c: '#2b8a3e', rot: -50 }, { kind: 'leaf', a: 0.3, r: 0.58, s: 48, c: '#37b24d', rot: -20 }, { kind: 'leaf', a: 0.42, r: 0.76, s: 54, c: '#2f9e44', rot: 30 }, { kind: 'leaf', a: 0.62, r: 0.62, s: 50, c: '#40c057', rot: -10 }, { kind: 'stroke', a: 0.8, r: 0.7, s: 50, c: '#212529' }] }),
  });
  function card(w, h, o) {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.g[0]}"/><stop offset="1" stop-color="${o.g[1]}"/></linearGradient>` +
      `<radialGradient id="r" cx=".8" cy=".15" r=".8"><stop offset="0" stop-color="rgba(255,255,255,.22)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>`;
    // tea cup motif
    if (o.cup) {
      const cx = w * 0.5, cy = h * (o.cupY || 0.36), s1 = w * 0.16;
      s += `<path d="M${cx - s1} ${cy}h${s1 * 2}c0 ${s1 * 1.1} -${s1 * 0.5} ${s1 * 1.5} -${s1} ${s1 * 1.5}s-${s1} -${s1 * 0.4} -${s1} -${s1 * 1.5}z" fill="#fff" opacity=".95"/>`;
      s += `<path d="M${cx + s1 * 0.95} ${cy + s1 * 0.25}c${s1 * 0.6} 0 ${s1 * 0.6} ${s1 * 0.7} -${s1 * 0.05} ${s1 * 0.75}" fill="none" stroke="#fff" stroke-width="${s1 * 0.12}"/>`;
      s += `<ellipse cx="${cx}" cy="${cy + s1 * 1.6}" rx="${s1 * 1.5}" ry="${s1 * 0.18}" fill="#fff" opacity=".9"/>`;
      for (let i = -1; i <= 1; i++) s += `<path d="M${cx + i * s1 * 0.45} ${cy - s1 * 0.25}c${-s1 * 0.25} ${-s1 * 0.3} ${s1 * 0.25} ${-s1 * 0.55} 0 ${-s1 * 0.85}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="${s1 * 0.07}" stroke-linecap="round"/>`;
    }
    if (o.mountains) s += `<path d="M0 ${h * 0.72}L${w * 0.2} ${h * 0.5}L${w * 0.36} ${h * 0.62}L${w * 0.55} ${h * 0.38}L${w * 0.78} ${h * 0.6}L${w} ${h * 0.46}V${h}H0Z" fill="rgba(255,255,255,.18)"/><path d="M0 ${h * 0.82}L${w * 0.25} ${h * 0.66}L${w * 0.5} ${h * 0.78}L${w * 0.75} ${h * 0.64}L${w} ${h * 0.76}V${h}H0Z" fill="rgba(255,255,255,.26)"/>`;
    (o.lines || []).forEach((l) => {
      s += `<text x="${l.x != null ? l.x : w / 2}" y="${l.y}" text-anchor="${l.anchor || 'middle'}" ${FONT} font-weight="${l.wt || 800}" font-size="${l.size}" fill="${l.fill || '#fff'}" letter-spacing="${l.ls || 0}" ${l.op ? `fill-opacity="${l.op}"` : ''}>${l.t}</text>`;
    });
    return s + '</svg>';
  }
  JC.art.def('wv_tea_teaser', {
    title: 'Spilling soon', w: 1080, h: 1080, tags: ['gossip'],
    svg: (w, h) => card(w, h, { g: ['#3b1f6e', '#0f6f8f'], cup: true, cupY: 0.3, lines: [
      { t: 'SOMETHING HAPPENED', y: h * 0.66, size: 66, ls: 3 },
      { t: 'ON A BALCONY', y: h * 0.74, size: 66, ls: 3 },
      { t: 'tea brewing… ☕', y: h * 0.83, size: 44, wt: 500, op: 0.85 },
      { t: '#BalconyGate', y: h * 0.93, size: 40, wt: 700, fill: '#7ee8fa' },
    ] }),
  });
  JC.art.def('wv_tea_ceos', {
    title: 'Hottest Single CEOs 2026', w: 1080, h: 1350, tags: ['gossip'],
    svg: (w, h) => card(w, h, { g: ['#f72585', '#7209b7'], lines: [
      { t: 'HOTTEST', y: 210, size: 120, ls: 6 },
      { t: 'SINGLE CEOs', y: 330, size: 96, ls: 4 },
      { t: '2026 EDITION', y: 410, size: 46, wt: 600, op: 0.85, ls: 8 },
      { t: '1.  Lan Xichen', y: 640, size: 74, anchor: 'start', x: 150 },
      { t: 'Gusu Lan Academy', y: 700, size: 38, wt: 500, anchor: 'start', x: 236, op: 0.8 },
      { t: '2.  Nie Huaisang', y: 850, size: 74, anchor: 'start', x: 150 },
      { t: 'Nie Corp · "no comment" 🪭', y: 910, size: 38, wt: 500, anchor: 'start', x: 236, op: 0.8 },
      { t: '3.  Jiang Cheng', y: 1060, size: 74, anchor: 'start', x: 150 },
      { t: 'YMJ · scowls professionally', y: 1120, size: 38, wt: 500, anchor: 'start', x: 236, op: 0.8 },
      { t: '@teaspiller_qh', y: 1270, size: 36, wt: 600, op: 0.75 },
    ] }),
  });
  JC.art.def('wv_tea_return', {
    title: 'Zewu-jun returns', w: 1080, h: 1080, tags: ['gossip', 'gusu'],
    svg: (w, h) => card(w, h, { g: ['#5f8fb8', '#d9e6f2'], mountains: true, lines: [
      { t: 'HE’S BACK.', y: h * 0.3, size: 120, ls: 4 },
      { t: 'one year of seclusion. zero explanations.', y: h * 0.4, size: 40, wt: 500 },
      { t: '#ZewuJunReturns', y: h * 0.92, size: 52, wt: 800, fill: '#1c3d5a' },
    ] }),
  });
  JC.art.def('wv_tea_gala', {
    title: 'Gala live', w: 900, h: 1600, tags: ['gossip'],
    svg: (w, h) => card(w, h, { g: ['#1b1035', '#5a2a82'], cup: true, cupY: 0.36, lines: [
      { t: 'LIVE FROM', y: h * 0.62, size: 80, ls: 4 },
      { t: 'KOI TOWER', y: h * 0.69, size: 96, ls: 4, fill: '#ffd43b' },
      { t: 'who’s sitting next to who 👀', y: h * 0.77, size: 44, wt: 500 },
    ] }),
  });

  const T = (s) => JC.time.parse(s); // JC.time.parse is relative to the fixed story start, safe at load time

  // ── profiles ─────────────────────────────────────────────────────────────
  JC.store.seed('wvusers', [
    { id: 'jiangwanyin', name: 'Jiang Wanyin', avatar: { emoji: '🪷', grad: ['#d0bfff', '#7048e8'] }, bio: 'Yunmeng.', link: '', followers: 2318, following: 4, private: true, followed: false, contact: null, cat: '', pronouns: '' },
    { id: 'rulan_jin', name: 'Jin Ling', avatar: 'av_jl', bio: 'jin group heir (allegedly)\nlanling intl · archery\nfairy’s human 🐕', link: 'lanling-intl.lanling/archery', followers: 48700, following: 212, private: false, followed: true, contact: 'jl', cat: 'Athlete', verified: true,
      story: [{ art: 'p_jl_selfie_gala', text: 'jin gala. kill me', t: T('+0 21:44') }, { art: 'av_fairy', text: 'she wasnt invited. she came anyway', t: T('+0 22:31') }],
      highlights: [{ title: 'fairy', art: 'av_fairy' }, { title: 'archery', art: 'p_jl_learner' }, { title: 'gala', art: 'p_jl_selfie_gala' }] },
    { id: 'yiling_radish_king', name: 'Wei Ying 🥕', avatar: { emoji: '🐶', grad: ['#ffd8a8', '#ff922b'] }, bio: 'founder & chief radish officer @ yiling radish co.\nflute teacher. married to @lanwangji 💍\nNO DOGS', link: 'radish.yiling/shop', followers: 9120, following: 381, private: false, followed: true, contact: 'wwx', cat: 'Farm',
      story: [{ art: 'p_soup_fail', text: 'soup attempt #4. the fire is wrong apparently', t: T('-1 19:20') }, { art: 'p_gala_hall', text: 'they have 400 chandeliers. FOUR HUNDRED', t: T('+0 21:30') }],
      highlights: [{ title: 'radishes', art: 'p_radishes' }, { title: 'flute', art: 'p_flute' }, { title: '520 💍', art: 'p_cloud_recesses' }] },
    { id: 'lanwangji', name: 'Lan Wangji', avatar: { initials: 'LW', grad: ['#e7f5ff', '#a5d8ff'] }, bio: '', link: '', followers: 15400, following: 1, private: false, followed: false, contact: 'lwj', cat: '' },
    { id: 'zewujun', name: 'Lan Xichen', avatar: 'av_lxc', bio: 'Chancellor, Gusu Lan Academy.\nTea, mountains, quiet mornings.', link: 'cloudrecesses.gusu', followers: 211000, following: 58, private: false, followed: true, contact: 'lxc', cat: 'Education', verified: true,
      story: [{ art: 'p_cloud_recesses', text: 'Morning bell.', t: T('+0 06:10') }],
      highlights: [{ title: 'tea', art: 'p_tea_hanshi' }, { title: 'mountains', art: 'p_cloud_recesses' }] },
    { id: 'huaisang_fans', name: 'Huaisang Fans 🪭', avatar: 'av_nhs', bio: 'hand-painted fans by a simple chairman who knows nothing 🙈\nDM for commissions ✉️', link: 'huaisangfans.qinghe/shop', followers: 33800, following: 940, private: false, followed: false, contact: 'nhs', cat: 'Artist',
      story: [{ art: 'wv_fan_lotus', text: 'new drop at midnight 🪭', t: T('+0 20:05') }, { art: 'p_gala_hall', text: 'seating chart? never heard of her 🙈', t: T('+0 19:12') }] },
    { id: 'teaspiller_qh', name: 'tea spiller ☕', avatar: { emoji: '☕', grad: ['#9775fa', '#15aabf'] }, bio: 'anonymous. sources everywhere. never wrong ☕\nDMs open for tips 👀', link: '', followers: 128000, following: 0, private: false, followed: false, contact: null, cat: 'Entertainment',
      story: [{ art: 'wv_tea_gala', text: '', t: T('+0 19:40') }] },
    { id: 'lan_sizhui', name: 'Lan Sizhui', avatar: 'av_sz', bio: 'Gusu Lan Academy · Senior\n“Be kind.”', link: '', followers: 3150, following: 167, private: false, followed: false, contact: 'sz', cat: '' },
    { id: 'jingyi_lan', name: 'LAN JINGYI', avatar: 'av_jy', bio: 'gusu lan academy\nrule #4001: have fun 💀', link: '', followers: 2890, following: 702, private: false, followed: false, contact: 'jy', cat: '',
      story: [{ art: 'food_skewers', text: 'MIDNIGHT SKEWERS 💀', t: T('+0 23:10') }] },
    { id: 'mianmian_studio', name: 'Mianmian Studio', avatar: 'av_mian', bio: 'Architecture & landscape · Yunmeng\nLuo Qingyang, principal.', link: 'mianmian-studio.yunmeng', followers: 6420, following: 190, private: false, followed: false, contact: 'mian', cat: 'Architect' },
    { id: 'lotuspier_ymj', name: 'Yunmeng Jiang Group', avatar: { emoji: '🪷', grad: ['#e5dbff', '#845ef7'] }, bio: 'Logistics · Shipping · Lotus farm foods\nLotus Pier, Yunmeng. Est. 1958.', link: 'lotuspier.yunmeng', followers: 87200, following: 12, private: false, followed: true, contact: null, cat: 'Company', verified: true },
    { id: 'koitower_official', name: 'Koi Tower · Jin Group', avatar: { emoji: '🐟', grad: ['#ffe066', '#f59f00'] }, bio: 'Jin Group headquarters, Lanling.', link: 'koitower.lanling', followers: 154000, following: 3, private: false, followed: false, contact: null, cat: 'Company', verified: true },
    { id: 'lanling_daily', name: 'Lanling Daily', avatar: { initials: 'LD', grad: ['#495057', '#212529'] }, bio: 'News from Lanling and beyond.', link: 'lanlingdaily.lanling', followers: 402000, following: 80, private: false, followed: false, contact: null, cat: 'News', verified: true },
    { id: 'petkingdom_lanling', name: 'Pet Kingdom Lanling', avatar: { emoji: '🐾', grad: ['#c3fae8', '#38d9a9'] }, bio: 'Everything for your best friend.', link: '', followers: 11800, following: 40, private: false, followed: false, contact: null, cat: 'Pet store' },
    { id: 'lotus_fan_88', name: 'xiao lian', avatar: { initials: 'XL', grad: ['#ffdeeb', '#f783ac'] }, bio: 'yunmeng girl 🪷', link: '', followers: 312, following: 870, private: false, followed: false, contact: null, cat: '' },
    { id: 'koi_watchers', name: 'Koi Watchers of Lanling', avatar: { emoji: '🐠', grad: ['#ffc9c9', '#ff6b6b'] }, bio: 'we watch the koi. the koi watch us.', link: '', followers: 1880, following: 9, private: false, followed: false, contact: null, cat: '' },
  ]);

  // ── posts ────────────────────────────────────────────────────────────────
  const C = (by, text, t) => ({ by, text, t });
  JC.store.seed('posts', [
    // tonight
    { id: 'wv_tea_teaser', by: 'teaspiller_qh', t: T('+0 23:20'), art: 'wv_tea_teaser', place: 'Koi Tower', likes: 3914, liked: false,
      text: '👀 Something happened on a certain balcony at Koi Tower tonight. Purple and white were involved. Full tea soon. #BalconyGate #JinGala2026',
      comments: [C('jingyi_lan', 'PURPLE AND WHITE 💀💀', '+0 23:22'), C('lotus_fan_88', 'NO WAY. no way no way', '+0 23:24'), C('huaisang_fans', '🙈🙈🙈', '+0 23:25'), C('rulan_jin', 'delete this', '+0 23:31')] },
    { id: 'wv_jl_gala', by: 'rulan_jin', t: T('+0 21:40'), art: 'p_jl_selfie_gala', place: 'Koi Tower', likes: 812, liked: false,
      text: 'jin group gala. survived. barely #JinGala2026',
      comments: [C('jingyi_lan', 'UR TIE 💀', '+0 21:41'), C('lan_sizhui', 'You look great, A-Ling!', '+0 21:45'), C('yiling_radish_king', 'who dressed u. it was me. i dressed u', '+0 21:52'), C('rulan_jin', '@yiling_radish_king u did NOT', '+0 21:53'), C('huaisang_fans', '🪭👀', '+0 22:02')] },
    { id: 'wv_nhs_gala', by: 'huaisang_fans', t: T('+0 20:12'), art: 'p_gala_hall', place: 'Koi Tower', likes: 2240, liked: false,
      text: 'Koi Tower tonight!! So much gold I can’t see 🙈 Seating chart by: nobody in particular #JinGala2026',
      comments: [C('yiling_radish_king', 'nobody in particular 😭', '+0 20:15'), C('koitower_official', 'Thank you for celebrating with us!', '+0 20:40')] },
    { id: 'wv_koitower_gala', by: 'koitower_official', t: T('+0 19:05'), art: 'p_gala_hall', place: 'Koi Tower, Lanling', likes: 5302, liked: false,
      text: 'Welcome to the Jin Group Autumn Charity Gala. Thank you to every guest supporting Lanling’s children’s hospital tonight. #JinGala2026',
      comments: [C('lanling_daily', 'Live coverage on our page tonight.', '+0 19:20')] },
    { id: 'wv_jy_skewers', by: 'jingyi_lan', t: T('+0 23:12'), art: 'food_skewers', place: 'Gusu', likes: 214, liked: false,
      text: 'midnight skewers bc SOME of us werent invited to the gala 💀 @rulan_jin',
      comments: [C('rulan_jin', 'it was boring anyway', '+0 23:14'), C('lan_sizhui', 'Jingyi, it is past curfew.', '+0 23:15'), C('jingyi_lan', '@lan_sizhui snitch', '+0 23:15')] },
    // this week
    { id: 'wv_wwx_soup', by: 'yiling_radish_king', t: T('-2 20:40'), art: 'p_soup_fail', place: 'The Jingshi', likes: 488, liked: false,
      text: 'soup practice day 3. smoke alarm: 1. me: 0. lan zhan opened every window. it is 12 degrees. we persevere',
      comments: [C('lanwangji', 'The fire is wrong.', '-2 20:44'), C('yiling_radish_king', '@lanwangji ur supposed to be on my side', '-2 20:45'), C('rulan_jin', 'whats the soup for 👀', '-2 21:02')] },
    { id: 'wv_lxc_peony', by: 'zewujun', t: T('-21 10:30'), art: 'p_tea_hanshi', place: 'The Hanshi, Cloud Recesses', likes: 31200, liked: false,
      text: 'A tin of white peony arrived this morning, without a card. Thank you, whoever you are. 🙂',
      comments: [C('huaisang_fans', 'Whoever could it be 🙈🙈', '-21 10:35'), C('teaspiller_qh', '☕☕☕', '-21 10:41'), C('lan_sizhui', 'It smells wonderful, Zewu-jun.', '-21 11:02')] },
    { id: 'wv_lxc_return', by: 'zewujun', t: T('-22 07:15'), art: 'p_cloud_recesses', place: 'Cloud Recesses', likes: 48100, liked: false,
      text: 'Morning mist over the Cloud Recesses. It is good to be home. Thank you to everyone who kept writing while I was away.',
      comments: [C('lanling_daily', 'Welcome back, Chancellor. #ZewuJunReturns', '-22 08:00'), C('yiling_radish_king', 'xiongzhang!!! 🥺', '-22 07:20'), C('lan_sizhui', 'Welcome home.', '-22 07:31')] },
    { id: 'wv_tea_return', by: 'teaspiller_qh', t: T('-22 09:00'), art: 'wv_tea_return', likes: 12800, liked: false,
      text: 'HE’S BACK. One year of seclusion and the Chancellor walks out looking ✨rested✨. Who has he been texting?? (we have theories) #ZewuJunReturns',
      comments: [C('lotus_fan_88', 'who has he been texting 👀', '-22 09:12'), C('jingyi_lan', 'not me thats for sure', '-22 09:30')] },
    { id: 'wv_daily_return', by: 'lanling_daily', t: T('-22 12:00'), art: 'p_rules_wall', place: 'Gusu', likes: 6700, liked: false,
      text: 'Zewu-jun returns to Cloud Recesses after a year away. The Chancellor resumes duties at Gusu Lan Academy on Monday. #ZewuJunReturns',
      comments: [] },
    { id: 'wv_nhs_lotusfan', by: 'huaisang_fans', t: T('-3 16:20'), art: 'wv_fan_lotus', likes: 5100, liked: false,
      text: 'New design: the Lotus Pier fan 🪷 Purple silk, nine petals. Made for a certain someone who will pretend to hate it 🙈 #handpainted',
      comments: [C('yiling_radish_king', 'he WILL hate it. buy two', '-3 16:31'), C('lotus_fan_88', 'take my money', '-3 17:02')] },
    { id: 'wv_nhs_peony', by: 'huaisang_fans', t: T('-12 14:00'), art: 'wv_fan_peony', likes: 3820, liked: false,
      text: 'Peony season is over but the fans are forever 🪭 #handpainted', comments: [C('mianmian_studio', 'Beautiful brushwork.', '-12 15:10')] },
    { id: 'wv_nhs_bamboo', by: 'huaisang_fans', t: T('-40 11:00'), art: 'wv_fan_bamboo', likes: 2990, liked: false, text: 'Bamboo for the brave 🎋 (sold out, sorry!!)', comments: [] },
    { id: 'wv_jl_learner', by: 'rulan_jin', t: T('2026-08-28 16:10'), art: 'p_jl_learner', place: 'Lanling DMV', likes: 1034, liked: false,
      text: 'LEARNER PERMIT. fear me',
      comments: [C('jingyi_lan', 'pray for lanling roads', '2026-08-28 16:12'), C('yiling_radish_king', 'jiujiu is going to have a heart attack', '2026-08-28 16:30'), C('lan_sizhui', 'Congratulations! Please drive carefully.', '2026-08-28 16:41')] },
    { id: 'wv_jl_fairy', by: 'rulan_jin', t: T('-6 18:30'), art: 'av_fairy', place: 'Koi Tower Residences', likes: 2650, liked: false,
      text: '8 years of fairy. she ate my shoe to celebrate',
      comments: [C('petkingdom_lanling', 'Happy gotcha month, Fairy! 🐾', '-6 18:44'), C('yiling_radish_king', 'beautiful. from a distance. a large distance', '-6 19:00')] },
    { id: 'wv_wwx_radish', by: 'yiling_radish_king', t: T('-9 11:20'), art: 'p_radishes', place: 'Yiling Radish Co.', likes: 730, liked: false,
      text: 'BIGGEST RADISH OF THE SEASON. her name is beatrice. she is not for sale. (everyone else is, pop-up this weekend 🥕)',
      comments: [C('lanwangji', 'Beautiful.', '-9 11:21'), C('jingyi_lan', 'beatrice 💀', '-9 12:00')] },
    { id: 'wv_wwx_flute', by: 'yiling_radish_king', t: T('-15 17:00'), art: 'p_flute', place: 'Gusu Lan Academy', likes: 640, liked: false,
      text: 'taught 12 nine-year-olds the flute today. my ears are gone. lan zhan says they were "promising"',
      comments: [C('zewujun', 'They were. 🙂', '-15 17:30')] },
    { id: 'wv_wwx_radishcake', by: 'yiling_radish_king', t: T('2026-02-11 14:40'), art: 'p_radish_cake', likes: 512, liked: false, text: 'new year radish cake!!! a-ling says it looks like a brick. a DELICIOUS brick', comments: [C('rulan_jin', 'it was a brick', '2026-02-11 15:00')] },
    { id: 'wv_tea_ceos', by: 'teaspiller_qh', t: T('2026-01-14 20:00'), art: 'wv_tea_ceos', likes: 22100, liked: false,
      text: 'The list you’ve all been waiting for: HOTTEST SINGLE CEOs 2026 🔥 #2 asked us to say “no comment”. #3 has never smiled in public. We stand by our rankings ☕',
      comments: [C('huaisang_fans', 'Who is #2?? I know nothing 🙈', '2026-01-14 20:05'), C('lotus_fan_88', '#3 deserved #1 sorry', '2026-01-14 20:30'), C('yiling_radish_king', 'LMAOOOO #3', '2026-01-14 21:00')] },
    { id: 'wv_sz_lotus', by: 'lan_sizhui', t: T('-27 15:00'), art: 'p_lotus_pond_day', place: 'Lotus Pier, Yunmeng', likes: 402, liked: false,
      text: 'Visited Lotus Pier with A-Ling. The lotus are almost finished for the year, but it is still beautiful. Thank you for having us, Mr. Jiang.',
      comments: [C('rulan_jin', 'u took 400 photos', '-27 15:10'), C('lan_sizhui', '@rulan_jin 401 now.', '-27 15:11')] },
    { id: 'wv_sz_dumplings', by: 'lan_sizhui', t: T('-8 19:40'), art: 'food_dumplings', place: 'The Jingshi', likes: 288, liked: false, text: 'Dumpling night. Senior Wei made the filling. It was very spicy.', comments: [C('yiling_radish_king', 'it was PERFECT', '-8 19:50')] },
    { id: 'wv_ymj_cakes', by: 'lotuspier_ymj', t: T('-22 12:30'), art: 'food_lotus_cake', place: 'Lotus Pier', likes: 3420, liked: false,
      text: 'Mid-Autumn lotus seed cakes from the Lotus Pier canteen, shipped to every YMJ office this week. Happy Mid-Autumn from all of us. 🥮', comments: [C('mianmian_studio', 'Ours arrived! Thank you.', '-22 14:00')] },
    { id: 'wv_mian_railing', by: 'mianmian_studio', t: T('2026-05-04 10:00'), art: 'p_sunrise_lake', place: 'Lotus Pier Pavilion', likes: 1220, liked: false,
      text: 'Revisiting the Lotus Pier pavilion railing (2023). Some projects you keep thinking about.', comments: [] },
    // Jiang Cheng: private, 3 posts
    { id: 'wv_jc_lotus', by: 'jiangwanyin', t: T('2023-07-19 06:12'), art: 'p_lotus_macro', place: 'Lotus Pier', likes: 41, liked: false, text: 'July.', comments: [C('yiling_radish_king', 'JIANG CHENG HAS AN ACCOUNT??', '2023-07-19 06:30')] },
    { id: 'wv_jc_dog', by: 'jiangwanyin', t: T('2024-05-15 17:40'), art: 'p_dog_park', likes: 58, liked: false, text: 'Not mine.', comments: [C('rulan_jin', 'jiujiu has a secret dog account now', '2024-05-15 18:02'), C('yiling_radish_king', 'NO', '2024-05-15 18:03')] },
    { id: 'wv_jc_lake', by: 'jiangwanyin', t: T('2025-11-02 06:05'), art: 'p_sunrise_lake', place: 'Yunmeng', likes: 37, liked: false, text: '', comments: [C('zewujun', '🙂', '2025-11-02 09:12')] },
    // only once a car flag is set (see wavelet.js)
    { id: 'wv_koi_witness', by: 'koi_watchers', t: T('+0 23:58'), art: 'p_koi_pond_car', place: 'Koi Tower', likes: 960, liked: false, cond: 'car',
      text: 'URGENT: there is a CAR in the koi pond. the koi are fine. a large black dog is on the roof. she seems fine too. #KoiPondGate', comments: [C('jingyi_lan', 'IM SCREAMING 💀', '+0 23:59')] },
  ]);

  // ── Wavelet DMs ─────────────────────────────────────────────────────────
  JC.store.seed('wvdms', [
    { id: 'rulan_jin', unread: 1, msgs: [
      { from: 'rulan_jin', text: 'did u see this', t: T('+0 23:30') },
      { from: 'rulan_jin', post: 'wv_tea_teaser', t: T('+0 23:30') },
      { from: 'rulan_jin', text: 'is this about u. it is isnt it', t: T('+0 23:31') },
    ] },
    { id: 'yiling_radish_king', unread: 0, msgs: [
      { from: 'yiling_radish_king', post: 'wv_wwx_radish', t: T('-9 11:25') },
      { from: 'yiling_radish_king', text: 'beatrice says hi', t: T('-9 11:25') },
      { from: 'me', text: 'Stop sending me vegetables.', t: T('-9 13:02') },
      { from: 'yiling_radish_king', text: 'she is a ROOT vegetable. show some respect', t: T('-9 13:03') },
      { from: 'yiling_radish_king', post: 'wv_wwx_soup', t: T('-2 20:41') },
      { from: 'yiling_radish_king', text: 'practicing. for reasons. no reason', t: T('-2 20:41') },
    ] },
    { id: 'huaisang_fans', unread: 0, msgs: [
      { from: 'huaisang_fans', text: 'Brother Jiang!! Did you see the new fan?? 🪷🪭', t: T('-3 16:25') },
      { from: 'huaisang_fans', post: 'wv_nhs_lotusfan', t: T('-3 16:25') },
      { from: 'me', text: 'No.', t: T('-3 18:40') },
      { from: 'huaisang_fans', text: 'I’ll send you one anyway hehe~', t: T('-3 18:41') },
    ] },
    { id: 'lan_sizhui', unread: 0, msgs: [
      { from: 'lan_sizhui', text: 'Mr. Jiang, thank you for having us at Lotus Pier. A-Ling says hello. (He did not say that, but I think he meant it.)', t: T('-27 15:20') },
      { from: 'me', text: 'Tell him to eat properly.', t: T('-27 16:05') },
    ] },
    { id: 'lotus_fan_88', request: true, unread: 1, msgs: [{ from: 'lotus_fan_88', text: 'omg are u THE jiang cheng?? the YMJ ceo?? 🪷', t: T('-1 22:10') }, { from: 'lotus_fan_88', text: 'ur on the hottest ceos list btw', t: T('-1 22:11') }] },
    { id: 'petkingdom_lanling', request: true, unread: 1, msgs: [{ from: 'petkingdom_lanling', text: 'Hi! Your 20 kg order of Fairy’s usual is ready for pickup 🐾 Show this message at the counter.', t: T('-1 10:00') }] },
    { id: 'koi_watchers', request: true, unread: 1, cond: 'car', msgs: [{ from: 'koi_watchers', text: 'sir. sir the koi are fine. but sir. the car', t: T('+0 23:59') }] },
  ]);

  // ── activity ─────────────────────────────────────────────────────────────
  JC.store.seed('wvact', [
    { kind: 'follow_req', by: 'lotus_fan_88', t: T('-1 22:12'), read: false },
    { kind: 'like', by: 'zewujun', post: 'wv_jc_lake', t: T('-1 23:40'), read: false },
    { kind: 'mention', by: 'yiling_radish_king', post: 'wv_wwx_soup', text: '@jiangwanyin answer ur phone', t: T('+0 23:13'), read: false },
    { kind: 'follow', by: 'zewujun', t: T('-21 10:31'), read: true },
    { kind: 'comment', by: 'zewujun', post: 'wv_jc_lake', text: '🙂', t: T('2025-11-02 09:12'), read: true },
    { kind: 'like', by: 'rulan_jin', post: 'wv_jc_dog', t: T('2024-05-15 18:01'), read: true },
    { kind: 'like', by: 'lan_sizhui', post: 'wv_jc_lotus', t: T('-30 08:00'), read: true },
    { kind: 'follow', by: 'mianmian_studio', t: T('-45 09:00'), read: true },
  ]);

  // follow requests JC never answered (private account)
  JC.store.seed('wvreqs', [
    { id: 'lotus_fan_88', t: T('-1 22:12') },
    { id: 'koi_watchers', t: T('-60 10:00') },
    { id: 'petkingdom_lanling', t: T('-200 10:00') },
  ]);
})();
