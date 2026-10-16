/* Wavelet — a fictional photo-sharing social app (purple→cyan brand). Home feed + stories, Search/Explore, Create,
   Activity, Profile, Wavelet DMs. Seeds: wavelet-data.js. Story acts: post, like, comment, dm. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const ME = 'jiangwanyin';
  const W = (JC.wavelet = JC.wavelet || {});

  JC.icon.add({
    'wv.plus.square': '<rect x="3.5" y="3.5" width="17" height="17" rx="5.5"/><path d="M12 8v8M8 12h8"/>',
    'wv.bookmark': '<path d="M6.5 3.5h11v17l-5.5-4.3-5.5 4.3z"/>',
    'wv.bookmark.fill': '<path d="M6.5 3.5h11v17l-5.5-4.3-5.5 4.3z" fill="currentColor"/>',
    'wv.comment': '<path d="M20.6 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.7-4.4z"/>',
    'wv.send': '<path d="M21 3.3 10 14.2M21 3.3l-6.4 17.4-4.6-6.5-6.5-4.6z"/>',
    'wv.grid': '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>',
    'wv.tagged': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="10.2" r="2.9"/><path d="M6.8 20.2c.9-2.9 2.8-4.4 5.2-4.4s4.3 1.5 5.2 4.4"/>',
    'wv.verified': '<path fill="currentColor" stroke="none" d="m12 2.4 2.4 1.7 2.9-.1 1 2.7 2.3 1.8-.9 2.8.9 2.8-2.3 1.8-1 2.7-2.9-.1L12 21.6l-2.4-1.7-2.9.1-1-2.7-2.3-1.8.9-2.8-.9-2.8 2.3-1.8 1-2.7 2.9.1z"/><path d="m8.4 12.2 2.4 2.4 4.9-5" stroke="#fff" stroke-width="2.1" fill="none"/>',
    'wv.camera': '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.3" r="3.6"/>',
    'wv.wave': '<path d="M2.5 13.5c2.3-4.2 4.7-4.2 7 0s4.7 4.2 7 0 3.3-3.3 5-1.9" stroke-width="2.6"/>',
    'wv.music': '<path d="M9 18.5V6l11-2.5v12"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>',
    'wv.person.plus': '<circle cx="10" cy="8" r="3.6"/><path d="M3.5 19.5c.7-3.6 3.2-5.5 6.5-5.5s5.8 1.9 6.5 5.5M18.5 8v6M15.5 11h6"/>',
    'wv.clock.arrow': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3h3"/><path d="M12 8v4.3l2.8 1.7"/>',
    'wv.lock': '<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    'wv.hash': '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4 8.5h16.5M3.5 15.5H20"/>',
  });

  // ── data helpers ──────────────────────────────────────────────────────────
  const D = {
    user: (id) => JC.store.get('wvusers', id) || { id, name: id, bio: '', followers: 0, following: 0, unknown: true },
    users: () => JC.store.all('wvusers'),
    post: (id) => JC.store.get('posts', id),
    dm: (id) => JC.store.get('wvdms', id),
  };
  W.data = D;
  function P(k, v) {
    if (v === undefined) { const it = JC.store.get('wvstate', k); return it ? it.v : undefined; }
    JC.store.add('wvstate', { id: k, v });
    return v;
  }
  function pmap(k) { return Object.assign({}, P(k) || {}); }
  function pset(k, key, val) { const o = pmap(k); if (val == null || val === false) delete o[key]; else o[key] = val; P(k, o); }

  function carFlag() {
    const f = (JC.state.d && JC.state.d.flags) || {};
    return Object.keys(f).some((k) => f[k] && /^(car_|tow|wn_towed|koi)/.test(k));
  }
  function visible(p) { return !!p && !p.hidden && !pmap('hiddenPosts')[p.id] && (p.cond !== 'car' || carFlag()); }
  function allPosts() { return JC.store.all('posts').filter(visible).slice().sort((a, b) => (b.t || 0) - (a.t || 0)); }
  W.posts = allPosts;
  function postsBy(id) { return allPosts().filter((p) => p.by === id); }
  function tagsIn(text) { return (String(text || '').match(/#[\w一-鿿]+/g) || []).map((t) => t.toLowerCase()); }
  function postsWithTag(tag) { tag = tag.toLowerCase(); return allPosts().filter((p) => tagsIn(p.text).includes(tag)); }
  function trending() {
    const t = ['#JinGala2026', '#BalconyGate', '#ZewuJunReturns'];
    if (carFlag() || postsWithTag('#KoiPondGate').length) t.unshift('#KoiPondGate');
    return t;
  }

  const GRADS = [['#d0bfff', '#7048e8'], ['#a5d8ff', '#1c7ed6'], ['#ffc9c9', '#f03e3e'], ['#b2f2bb', '#2f9e44'], ['#ffe066', '#f08c00'], ['#99e9f2', '#0c8599']];
  function avatarSpec(u) {
    if (!u) return { initials: '?', grad: GRADS[0] };
    if (typeof u.avatar === 'string') return { art: u.avatar, initials: String(u.name || u.id).slice(0, 2).toUpperCase(), grad: GRADS[0] };
    if (u.avatar && typeof u.avatar === 'object') return u.avatar;
    if (u.contact && JC.contacts.get(u.contact)) return JC.contacts.get(u.contact).avatar;
    let n = 0;
    for (const ch of String(u.id || '')) n += ch.charCodeAt(0);
    return { initials: String(u.id || '?').replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() || '?', grad: GRADS[n % GRADS.length] };
  }
  function storyOf(id) { const u = D.user(id); return (u.story || []).filter((f) => f && f.art); }
  function storySeen(id) { const st = storyOf(id); const s = pmap('seen'); return !st.length || st.every((f, i) => s[id + ':' + i]); }
  function av(id, size, o) {
    o = o || {};
    const a = JC.ui.avatar(avatarSpec(D.user(id)), size);
    if (!o.ring) return a;
    const has = storyOf(id).length > 0;
    return h('div.wv-ring', { class: { new: has && !storySeen(id), seen: has && storySeen(id) }, style: { '--s': size + 'px' } }, a);
  }
  function fmtN(n) {
    n = n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString('en-US');
  }
  function ago(t, long) {
    const d = Math.max(0, (JC.time.now() - (t || 0)) / 1000);
    if (d < 60) return long ? 'Just now' : 'now';
    if (d < 3600) { const m = Math.floor(d / 60); return long ? m + (m === 1 ? ' minute ago' : ' minutes ago') : m + 'm'; }
    if (d < 86400) { const x = Math.floor(d / 3600); return long ? x + (x === 1 ? ' hour ago' : ' hours ago') : x + 'h'; }
    const days = Math.floor(d / 86400);
    if (days < 7) return long ? days + (days === 1 ? ' day ago' : ' days ago') : days + 'd';
    const dt = new Date(t);
    if (!long) return days < 53 ? Math.floor(days / 7) + 'w' : (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + String(dt.getFullYear()).slice(2);
    return U.MONTHS[dt.getMonth()] + ' ' + dt.getDate() + (dt.getFullYear() !== JC.time.date().getFullYear() ? ', ' + dt.getFullYear() : '');
  }
  W.ago = ago;
  const PLACE_IDS = { 'koi tower': 'koi-tower', 'lotus pier': 'lotus-pier', 'cloud recesses': 'cloud-recesses', 'the hanshi': 'hanshi', 'the jingshi': 'jingshi', 'yiling radish co.': 'radish-farm', 'yunmeng': 'yunmeng-lake', 'lotus pier pavilion': 'lotus-pier', 'gusu lan academy': 'cloud-recesses', 'koi tower residences': 'koi-tower', 'koi tower, lanling': 'koi-tower', 'the hanshi, cloud recesses': 'hanshi', 'lotus pier, yunmeng': 'lotus-pier', 'golden peony hotel': 'golden-peony' };
  const placeId = (name) => PLACE_IDS[String(name || '').toLowerCase()] || null;

  // ── canned replies ────────────────────────────────────────────────────────
  const REPLY = {
    yiling_radish_king: ['JIANG CHENG??? on WAVELET??', 'lan zhan come look he replied', 'screenshotted. framed. hung on the fridge', 'who is this and what have u done with my brother', 'ok but sunday tho 🥺'],
    rulan_jin: ['why are u on wavelet', 'jiujiu NO. people can SEE this', 'delete this', 'ok', 'stop'],
    huaisang_fans: ['Brother Jiang!! 🙈🪭', 'Hehe~ noted 👀', 'I’ll treasure this forever 🙈', 'I know nothing about anything!!'],
    zewujun: ['Thank you, Wanyin. 🙂', 'I hoped you would see it.', 'It was a good morning.'],
    jingyi_lan: ['MR JIANG??? 💀', 'sorry sorry sorry', 'pls dont tell sizhui', 'IM SCREAMING'],
    lan_sizhui: ['Thank you, Mr. Jiang!', 'A-Ling will be very embarrassed. Thank you.', 'Of course!'],
    teaspiller_qh: ['a message from THE jiang wanyin?? ☕', 'we never reveal our sources ☕', 'noted. 👀', 'no comment ☕'],
    lanwangji: ['Mn.'],
    mianmian_studio: ['Ha. Go to sleep, Jiang Cheng.', 'Noted.'],
    lotus_fan_88: ['OMG HE REPLIED', 'ur even meaner in person 😍', 'sorry sorry!!'],
    petkingdom_lanling: ['Thank you! See you soon 🐾', 'Fairy’s favourite chews are 20% off this week!'],
    koi_watchers: ['the koi thank you for your concern 🐟', 'we have photos. we have many photos'],
    _: ['Thanks!', '🙏', 'Who is this?'],
  };
  const replyIdx = {};
  function canned(id) {
    const arr = REPLY[id] || REPLY._;
    replyIdx[id] = replyIdx[id] == null ? Math.floor(Math.random() * arr.length) : (replyIdx[id] + 1) % arr.length;
    return arr[replyIdx[id]];
  }

  // ── activity & notifications ──────────────────────────────────────────────
  function addActivity(a, notify) {
    const it = JC.store.add('wvact', Object.assign({ t: JC.time.now(), read: false }, a), { front: true });
    if (notify) {
      const p = a.post ? D.post(a.post) : null;
      JC.notify.push({ app: 'wavelet', title: 'Wavelet', body: notify, art: p ? p.art : undefined, open: { app: 'wavelet', intent: a.post ? { post: a.post } : a.dm ? { dm: a.dm } : { user: a.by } } });
    }
    return it;
  }
  function badgeCount() {
    const acts = JC.store.all('wvact').filter((a) => !a.read).length;
    const dms = JC.store.all('wvdms').filter((d) => !d.request && d.unread && (d.cond !== 'car' || carFlag())).length;
    return { acts, dms, total: acts + dms };
  }
  function updateBadge() { JC.notify.badge('wavelet', badgeCount().total); }
  W.updateBadge = updateBadge;

  // likes / comments / follows (shared by every screen)
  function toggleLike(pid, on) {
    const p = D.post(pid);
    if (!p) return;
    const v = on == null ? !p.liked : !!on;
    if (v === !!p.liked) return;
    JC.store.update('posts', pid, { liked: v, likes: Math.max(0, (p.likes || 0) + (v ? 1 : -1)) });
    if (v) JC.story.act('like', { post: pid });
  }
  function toggleSave(pid) {
    const on = !pmap('saved')[pid];
    pset('saved', pid, on ? JC.time.now() : null);
    JC.ui.toast(on ? 'Saved to your collection' : 'Removed from saved', { icon: on ? 'wv.bookmark.fill' : 'wv.bookmark' });
    return on;
  }
  function addComment(pid, text) {
    const p = D.post(pid);
    if (!p || !text) return;
    const c = { by: ME, text, t: JC.time.now() };
    JC.store.update('posts', pid, { comments: (p.comments || []).concat(c) });
    JC.story.act('comment', { post: pid, text });
    if (p.by !== ME && REPLY[p.by] && Math.random() < 0.85) {
      setTimeout(() => {
        const cur = D.post(pid);
        if (!cur) return;
        const line = '@' + ME + ' ' + canned(p.by);
        JC.store.update('posts', pid, { comments: (cur.comments || []).concat({ by: p.by, text: line, t: JC.time.now() }) });
        addActivity({ kind: 'reply', by: p.by, post: pid, text: line }, p.by + ' replied to your comment: ' + line);
      }, 4000 + Math.random() * 5000);
    }
  }
  function isFollowing(id) { const f = pmap('follow'); if (f[id] != null) return f[id] === 1; return !!D.user(id).followed; }
  function setFollow(id, on) {
    const u = D.user(id);
    const was = isFollowing(id);
    if (was === on) return;
    pset('follow', id, on ? 1 : 0);
    if (!u.unknown) JC.store.update('wvusers', id, { followers: Math.max(0, (u.followers || 0) + (on ? 1 : -1)) });
    const me = D.user(ME);
    JC.store.update('wvusers', ME, { following: Math.max(0, (me.following || 0) + (on ? 1 : -1)) });
    if (on && id === 'yiling_radish_king') setTimeout(() => addActivity({ kind: 'dmhint', by: id }, 'yiling_radish_king: u FOLLOWED me?? (again??)'), 3000);
  }
  function followBtn(id, o) {
    o = o || {};
    const b = h('div.wv-btn', { class: { small: !!o.small } });
    const draw = () => {
      const f = isFollowing(id);
      const req = pmap('requested')[id];
      b.textContent = f ? 'Following' : req ? 'Requested' : (D.user(id).followsMe ? 'Follow back' : 'Follow');
      b.classList.toggle('primary', !f && !req);
    };
    JC.ui.onTap(b, (e) => {
      e.stopPropagation();
      const f = isFollowing(id);
      if (f) {
        JC.ui.actionSheet({ title: '@' + id, actions: [{ text: 'Unfollow', style: 'destructive', onTap: () => { setFollow(id, false); draw(); } }] });
        return;
      }
      if (D.user(id).private && !pmap('requested')[id]) { pset('requested', id, 1); draw(); JC.ui.toast('Follow request sent', { icon: 'wv.person.plus' }); return; }
      if (pmap('requested')[id]) { pset('requested', id, null); draw(); return; }
      setFollow(id, true);
      JC.audio.haptic(8);
      draw();
    });
    draw();
    return b;
  }

  // ── rich text (@mentions, #tags, links) ───────────────────────────────────
  function rich(app, text) {
    const out = [];
    const re = /([@#][\w一-鿿.]+)/g;
    const s = String(text || '');
    let last = 0, m;
    while ((m = re.exec(s))) {
      let tok = m[1].replace(/\.+$/, '');
      if (m.index > last) out.push(s.slice(last, m.index));
      if (tok[0] === '@') out.push(h('span.wv-mention', { onTap: (e) => { e.stopPropagation(); app.openProfile(tok.slice(1)); } }, tok));
      else out.push(h('span.wv-tag', { onTap: (e) => { e.stopPropagation(); app.openTag(tok); } }, tok));
      last = m.index + tok.length;
      re.lastIndex = last;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }

  function photoList() {
    let arr = [];
    try { arr = JC.store.all('photos') || []; } catch (e) { arr = []; }
    arr = arr.filter((p) => p && p.art && p.kind !== 'video');
    if (!arr.length) arr = ['p_moon_street', 'p_taxi_night', 'p_balcony_moon', 'p_lotus_macro', 'p_sunrise_lake', 'p_dog_park', 'p_puppies', 'p_lotus_pond_day', 'p_silver_bell', 'p_cake_lotus', 'p_gala_hall', 'p_hotel_lobby', 'p_car_keys', 'p_fairy_roof', 'p_jl_selfie_gala', 'p_childhood_dogs'].map((art, i) => ({ id: 'wvp_' + art, art, t: JC.time.now() - i * 9e6 }));
    return arr.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  }

  // ═════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'wavelet',
    name: 'Wavelet',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-wavelet');
      win.el.classList.add('wvapp');
      const app = { win };
      const cards = new Set();
      const offs = [];
      let feedMode = 'all';

      /** JC.ui.page + floating tab bar visibility (hidden in DMs / composer screens) */
      function mk(o) {
        return JC.ui.page(Object.assign({}, o, { onShow: (pg) => { if (app.tabs) app.tabs.hideBar(!!o.hideBar); if (o.onShow) o.onShow(pg); } }));
      }

      // ── shared openers ────────────────────────────────────────────────
      const curNav = () => app.tabs.nav();
      app.openProfile = (id) => { if (id === ME && app.tabs.current() !== 'profile') { app.tabs.select('profile'); return; } curNav().push(profilePage(id)); };
      app.openPost = (pid, title) => { if (!D.post(pid)) { JC.ui.toast('This post is no longer available'); return; } curNav().push(postPage(pid, title)); };
      app.openTag = (tag) => curNav().push(tagPage(tag));
      app.openInbox = () => curNav().push(inboxPage());
      app.openDM = (id) => curNav().push(dmPage(id));

      // ── post card ─────────────────────────────────────────────────────
      function postCard(p, o) {
        o = o || {};
        const pid = p.id;
        const el = h('div.wv-post', { data: { pid } });
        const ratio = U.clamp(JC.art.ratio(p.art) || 1, 0.8, 1.91);
        const u = D.user(p.by);
        const head = h('div.wv-post-head',
          h('div.wv-post-av', { onTap: () => (storyOf(p.by).length && !storySeen(p.by) ? app.openStories(p.by) : app.openProfile(p.by)) }, av(p.by, 34, { ring: true })),
          h('div.wv-post-who', { onTap: () => app.openProfile(p.by) },
            h('div.wv-post-handle', h('span', p.by), u.verified ? JC.icon('wv.verified', { size: 13, cls: 'wv-verified' }) : null),
            p.place ? h('div.wv-post-place', { onTap: (e) => { e.stopPropagation(); app.openPlace(p.place); } }, p.place) : null),
          p.by !== ME && !isFollowing(p.by) && !o.noFollow ? h('div.wv-post-follow', { onTap: (e) => { e.stopPropagation(); if (D.user(p.by).private) { pset('requested', p.by, 1); JC.ui.toast('Follow request sent'); } else setFollow(p.by, true); e.currentTarget.remove(); } }, 'Follow') : null,
          h('div.wv-post-more', { onTap: () => postMenu(pid) }, JC.icon('ellipsis', { size: 20 })));
        const img = h('div.wv-media-img', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` } });
        const burst = h('div.wv-burst', JC.icon('heart.fill', { size: 96 }));
        const media = h('div.wv-media', { style: { aspectRatio: String(ratio) } }, img, burst);
        let lastTap = 0, tapT = 0;
        JC.ui.onTap(media, () => {
          const n = performance.now();
          if (n - lastTap < 300) {
            clearTimeout(tapT);
            lastTap = 0;
            toggleLike(pid, true);
            burst.classList.remove('go');
            void burst.offsetWidth;
            burst.classList.add('go');
            JC.audio.haptic(10);
            return;
          }
          lastTap = n;
          tapT = setTimeout(() => lightbox(D.post(pid) || p), 300);
        });
        const heart = h('div.wv-act.like', { onTap: () => { toggleLike(pid); JC.audio.haptic(6); } });
        const cmt = h('div.wv-act', { onTap: () => app.openComments(pid) }, JC.icon('wv.comment', { size: 24, weight: 1.9 }));
        const send = h('div.wv-act', { onTap: () => app.sharePost(pid) }, JC.icon('wv.send', { size: 23, weight: 1.9 }));
        const save = h('div.wv-act.save', { onTap: () => { toggleSave(pid); update(); } });
        const likeN = h('span.wv-act-n');
        const cmtN = h('span.wv-act-n');
        const acts = h('div.wv-acts', h('div.wv-act-grp', heart, likeN), h('div.wv-act-grp', cmt, cmtN), send, h('div.spacer'), save);
        const likes = h('div.wv-likes', { onTap: () => likesSheet(pid) });
        const cap = h('div.wv-cap');
        const cmts = h('div.wv-cmts');
        const time = h('div.wv-time');
        el.append(head, media, acts, likes, cap, cmts, time);
        let capOpen = !!o.open;
        function update() {
          const q = D.post(pid);
          if (!q) { el.remove(); return; }
          heart.innerHTML = '';
          heart.appendChild(JC.icon(q.liked ? 'heart.fill' : 'heart', { size: 25, weight: 1.9 }));
          heart.classList.toggle('on', !!q.liked);
          likeN.textContent = q.likes ? fmtN(q.likes) : '';
          const nC = (q.comments || []).length;
          cmtN.textContent = nC ? fmtN(nC) : '';
          save.innerHTML = '';
          save.appendChild(JC.icon(pmap('saved')[pid] ? 'wv.bookmark.fill' : 'wv.bookmark', { size: 23, weight: 1.9 }));
          likes.innerHTML = '';
          if (q.hideLikes && q.by === ME) likes.append('Liked by ', h('b', 'others'));
          else if (q.likes) {
            const friend = q.liked ? null : (q.comments || []).map((c) => c.by).find((b) => b !== ME && b !== q.by && isFollowing(b));
            if (q.liked && q.likes > 1) likes.append('Liked by ', h('b', 'you'), ' and ', h('b', fmtN(q.likes - 1) + (q.likes - 1 === 1 ? ' other' : ' others')));
            else if (friend && q.likes > 1) likes.append('Liked by ', h('b', friend), ' and ', h('b', fmtN(q.likes - 1) + ' others'));
            else likes.append(h('b', fmtN(q.likes) + (q.likes === 1 ? ' like' : ' likes')));
          }
          likes.hidden = !q.likes;
          cap.innerHTML = '';
          if (q.text) {
            const long = q.text.length > 110 && !capOpen;
            cap.append(h('b.wv-cap-by', { onTap: () => app.openProfile(q.by) }, q.by), ' ', ...rich(app, long ? q.text.slice(0, 100).replace(/\s+\S*$/, '') : q.text));
            if (long) cap.append('… ', h('span.wv-more', { onTap: () => { capOpen = true; update(); } }, 'more'));
          }
          cmts.innerHTML = '';
          if (nC) {
            cmts.appendChild(h('div.wv-viewall', { onTap: () => app.openComments(pid) }, nC === 1 ? 'View 1 comment' : 'View all ' + nC + ' comments'));
            const last = q.comments[nC - 1];
            cmts.appendChild(h('div.wv-cmt1', h('b', { onTap: () => app.openProfile(last.by) }, last.by), ' ', ...rich(app, last.text)));
          }
          time.textContent = ago(q.t, true);
        }
        el._update = update;
        update();
        cards.add(el);
        return el;
      }

      function postMenu(pid) {
        const p = D.post(pid);
        if (!p) return;
        const own = p.by === ME;
        const saved = !!pmap('saved')[pid];
        const actions = own ? [
          { text: 'Edit', onTap: () => editCaption(pid) },
          { text: p.hideLikes ? 'Unhide like count' : 'Hide like count', onTap: () => JC.store.update('posts', pid, { hideLikes: !p.hideLikes }) },
          { text: p.noComments ? 'Turn on commenting' : 'Turn off commenting', onTap: () => { JC.store.update('posts', pid, { noComments: !p.noComments }); JC.ui.toast(p.noComments ? 'Commenting turned on' : 'Commenting turned off'); } },
          { text: 'Archive', onTap: () => { pset('hiddenPosts', pid, 1); JC.ui.toast('Moved to your archive', { icon: 'wv.clock.arrow' }); } },
          { text: 'Delete', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Delete post?', message: 'You can restore it from Recently Deleted for 30 days. (Jiang Cheng will notice.)', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('posts', pid); JC.ui.toast('Post deleted', { icon: 'trash' }); } }] }) },
        ] : [
          { text: saved ? 'Remove from saved' : 'Save', onTap: () => toggleSave(pid) },
          { text: 'Copy link', onTap: () => { U.copy('https://wavelet.app/p/' + pid); JC.ui.toast('Link copied', { icon: 'link' }); } },
          { text: 'Share to…', onTap: () => shareOut(pid) },
          { text: isFollowing(p.by) ? 'Unfollow' : 'Follow', onTap: () => setFollow(p.by, !isFollowing(p.by)) },
          { text: 'About this account', onTap: () => aboutAccount(p.by) },
          { text: 'Not interested', onTap: () => { pset('hiddenPosts', pid, 1); JC.ui.toast('We’ll show you fewer posts like this', { icon: 'eye.slash' }); } },
          { text: 'Report', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Report', message: p.by === 'teaspiller_qh' ? 'Thanks for letting us know. You are the 4,012th person to report @teaspiller_qh this year. The account remains anonymous.' : 'Thanks for letting us know. We review reports within 24 hours.', buttons: [{ text: 'OK' }] }) },
        ];
        JC.ui.actionSheet({ actions });
      }

      function aboutAccount(id) {
        const u = D.user(id);
        const joined = { teaspiller_qh: 'March 2021', rulan_jin: 'October 2021', yiling_radish_king: 'March 2023', zewujun: 'June 2016', huaisang_fans: 'May 2019' }[id] || 'August 2020';
        JC.ui.sheet({
          title: 'About this account', detent: 'medium', cls: 'wv-about', right: { text: 'Done' },
          content: () => [
            h('div.wv-about-top', av(id, 76), h('div.wv-about-h', id), h('div.wv-about-s', 'To help keep our community authentic, we’re showing information about accounts on Wavelet.')),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'calendar', bg: 'var(--purple)' }, title: 'Date joined', subtitle: joined },
              { icon: { glyph: 'location.fill', bg: 'var(--teal)' }, title: 'Account based in', subtitle: id === 'teaspiller_qh' ? 'Qinghe' : (u.contact === 'lxc' || u.contact === 'lwj' || id === 'lan_sizhui' || id === 'jingyi_lan' ? 'Gusu' : u.contact === 'wwx' ? 'Yiling' : 'Lanling') },
              { icon: { glyph: 'person.fill', bg: 'var(--indigo)' }, title: 'Former usernames', subtitle: id === 'teaspiller_qh' ? '3 (hidden by the account)' : id === 'yiling_radish_king' ? 'yiling_patriarch_official · radish.dad' : 'None' },
            ] }]),
          ],
        });
      }

      function editCaption(pid) {
        const p = D.post(pid);
        const field = JC.ui.input({ multiline: true, value: p.text || '', placeholder: 'Write a caption…', autoGrow: true, maxHeight: 200 });
        field.classList.add('wv-edit-field');
        JC.ui.sheet({
          title: 'Edit info', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => { JC.store.update('posts', pid, { text: field.value.trim() }); JC.ui.toast('Post updated'); } },
          content: () => [h('div.wv-edit', JC.art.el(p.art, { cls: 'wv-edit-img' }), field)],
        });
        setTimeout(() => field.focus(), 450);
      }

      function lightbox(p) {
        const layer = JC.ui.layer();
        const el = h('div.wv-lightbox', JC.art.img(p.art, { cls: 'wv-lb-img' }), h('div.wv-lb-x', { onTap: () => close() }, JC.icon('xmark', { size: 18, weight: 2.6 })), h('div.wv-lb-cap', h('b', p.by), ' · ', ago(p.t, true)));
        layer.appendChild(el);
        U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
        U.drag(el, { axis: 'y', move: (e, pp) => { el.style.transform = `translateY(${Math.max(0, pp.dy)}px)`; }, end: (e, pp) => { if (pp.dy > 100) close(); else el.style.transform = ''; }, tap: () => close() });
        function close() { U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => el.remove()); app._overlay = null; }
        app._overlay = close;
      }

      function likesSheet(pid) {
        const p = D.post(pid);
        const known = Array.from(new Set((p.comments || []).map((c) => c.by).filter((b) => b !== p.by)));
        D.users().forEach((u) => { if (known.length < 8 && u.id !== p.by && u.id !== ME && !known.includes(u.id) && (M_hash(u.id + pid) % 3 === 0)) known.push(u.id); });
        if (p.liked && !known.includes(ME)) known.unshift(ME);
        JC.ui.sheet({
          title: 'Likes', detent: 'large', cls: 'wv-likes-sheet', right: { text: 'Done' },
          content: () => [
            h('div.wv-likes-n', fmtN(p.likes || 0) + (p.likes === 1 ? ' like' : ' likes')),
            JC.ui.list([{ rows: known.map((id) => ({ leading: av(id, 44, { ring: true }), title: h('span.wv-row-h', id, D.user(id).verified ? JC.icon('wv.verified', { size: 12, cls: 'wv-verified' }) : null), subtitle: D.user(id).name, right: id === ME ? null : followBtn(id, { small: true }), onTap: () => app.openProfile(id) })) }], { style: 'plain', cls: 'wv-plain' }),
            (p.likes || 0) > known.length ? h('div.wv-likes-more', 'and ' + fmtN((p.likes || 0) - known.length) + ' others') : null,
          ],
        });
      }
      function M_hash(s) { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; }

      // ── comments sheet ────────────────────────────────────────────────
      app.openComments = (pid) => {
        const p0 = D.post(pid);
        if (!p0) return;
        const listEl = h('div.wv-cm-list.scroll');
        const postBtn = h('div.wv-cm-post', { onTap: () => post() }, JC.icon('arrow.up', { size: 16, weight: 2.8 }));
        const field = JC.ui.input({ placeholder: 'Add a comment for ' + p0.by + '…', enterkey: 'send', onSubmit: () => post(), onInput: (v) => postBtn.classList.toggle('on', !!v.trim()) });
        field.classList.add('wv-cm-input');
        const emojis = h('div.wv-cm-emojis', ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'].map((e) => h('div.wv-cm-emoji', { onTap: () => { field.value += e; postBtn.classList.add('on'); field.focus(); } }, e)));
        const bottom = p0.noComments
          ? h('div.wv-cm-off', 'Commenting has been turned off.')
          : h('div.wv-cm-bottom', { attrs: { 'data-kbkeep': '' } }, emojis, h('div.wv-cm-row', av(ME, 34), h('div.wv-cm-field', field, postBtn)));
        const s = JC.ui.sheet({ title: 'Comments', detent: 'large', cls: 'wv-cm-sheet', content: () => h('div.wv-cm', listEl, bottom) });
        const liked = pmap('cmLikes');
        function render() {
          const p = D.post(pid);
          if (!p) return;
          listEl.innerHTML = '';
          if (p.text) listEl.appendChild(cmItem({ by: p.by, text: p.text, t: p.t }, -1, true));
          (p.comments || []).forEach((c, i) => listEl.appendChild(cmItem(c, i)));
          if (!(p.comments || []).length) listEl.appendChild(h('div.wv-cm-empty', h('b', 'No comments yet'), h('span', 'Start the conversation.')));
        }
        function cmItem(c, i, isCap) {
          const k = pid + ':' + i;
          const heartEl = isCap ? null : h('div.wv-cm-heart', { class: { on: !!liked[k] }, onTap: (e) => { e.stopPropagation(); liked[k] = !liked[k]; pset('cmLikes', k, liked[k] ? 1 : null); heartEl.classList.toggle('on', !!liked[k]); heartEl.innerHTML = ''; heartEl.appendChild(JC.icon(liked[k] ? 'heart.fill' : 'heart', { size: 14 })); } }, JC.icon(liked[k] ? 'heart.fill' : 'heart', { size: 14 }));
          const el = h('div.wv-cm-item', { class: { cap: !!isCap } },
            h('div.wv-cm-av', { onTap: () => { s.close(); app.openProfile(c.by); } }, av(c.by, 34, { ring: true })),
            h('div.wv-cm-main',
              h('div.wv-cm-top', h('b', { onTap: () => { s.close(); app.openProfile(c.by); } }, c.by), h('span.wv-cm-t', c.t ? ago(c.t) : '')),
              h('div.wv-cm-text', ...rich(app, c.text)),
              isCap ? null : h('div.wv-cm-reply', { onTap: () => { field.value = '@' + c.by + ' '; postBtn.classList.add('on'); field.focus(); } }, 'Reply')),
            heartEl);
          if (!isCap) {
            JC.ui.contextMenu(el, () => ({ items: [
              { text: 'Reply', icon: 'arrowshape.turn.up.left', onTap: () => { field.value = '@' + c.by + ' '; field.focus(); } },
              { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(c.text); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
              c.by === ME ? { text: 'Delete', icon: 'trash', destructive: true, onTap: () => { const p = D.post(pid); const arr = (p.comments || []).slice(); arr.splice(i, 1); JC.store.update('posts', pid, { comments: arr }); render(); } }
                : { text: 'Report', icon: 'exclamationmark.triangle.fill', destructive: true, onTap: () => JC.ui.toast('Comment reported') },
            ] }));
          }
          return el;
        }
        function post() {
          const text = field.value.trim();
          if (!text) return;
          addComment(pid, text);
          field.value = '';
          postBtn.classList.remove('on');
          JC.audio.play('send');
          render();
          listEl.scrollTop = listEl.scrollHeight;
        }
        const off = JC.store.on('posts', () => { if (!s.closed) { const st = listEl.scrollTop; render(); listEl.scrollTop = st; } });
        const oc = s.close;
        s.close = () => { off(); oc(); };
        render();
      };

      // ── share a post (Wavelet send sheet) ─────────────────────────────
      function shareOut(pid) {
        const p = D.post(pid);
        JC.ui.share({ title: p.by + ' on Wavelet', subtitle: 'wavelet.app', art: p.art, payload: { kind: 'link', title: p.by + ' on Wavelet' + (p.text ? ': “' + p.text.slice(0, 60).trim() + (p.text.length > 60 ? '…' : '') + '”' : ''), text: (p.text || '').slice(0, 80), url: 'https://wavelet.app/p/' + pid, art: p.art } });
      }
      app.sharePost = (pid) => {
        const p = D.post(pid);
        if (!p) return;
        const picked = new Set();
        const people = ['rulan_jin', 'yiling_radish_king', 'huaisang_fans', 'zewujun', 'lan_sizhui', 'jingyi_lan', 'lanwangji', 'mianmian_studio', 'teaspiller_qh'].filter((x) => x !== p.by || true);
        const note = JC.ui.input({ placeholder: 'Write a message…', enterkey: 'send', onSubmit: () => send() });
        note.classList.add('wv-sh-note');
        const sendBar = h('div.wv-sh-send', { hidden: true }, note, h('div.wv-btn.primary.wide', { onTap: () => send() }, 'Send'));
        const grid = h('div.wv-sh-grid');
        const s = JC.ui.sheet({
          title: 'Share', detent: 'large', cls: 'wv-share',
          content: () => h('div.wv-sh', grid, h('div.wv-sh-apps.hscroll',
            shApp(h('div.wv-sh-ic', JC.icon('plus.circle.fill', { size: 26 })), 'Add to story', () => { s.close(); addToStory(p.art); }),
            shApp(h('div.wv-sh-ic', JC.icon('link', { size: 22 })), 'Copy link', () => { s.close(); U.copy('https://wavelet.app/p/' + pid); JC.ui.toast('Link copied', { icon: 'link' }); }),
            shApp(h('div.wv-sh-ic.app', JC.appIcon('messages')), 'Messages', () => { s.close(); JC.os.open('messages', { compose: { url: 'https://wavelet.app/p/' + pid, title: p.by + ' on Wavelet' + (p.text ? ': “' + p.text.slice(0, 60).trim() + (p.text.length > 60 ? '…' : '') + '”' : ''), art: p.art } }); }),
            shApp(h('div.wv-sh-ic', JC.icon('square.and.arrow.up', { size: 22 })), 'Share to…', () => { s.close(); shareOut(pid); }),
            shApp(h('div.wv-sh-ic', JC.icon('square.and.arrow.down', { size: 22 })), 'Download', () => { s.close(); JC.store.add('photos', { art: p.art, t: JC.time.now(), albums: [], kind: 'photo' }, { front: true }); JC.ui.toast('Saved to Photos', { icon: 'square.and.arrow.down' }); })), sendBar),
        });
        function shApp(ic, label, fn) { return h('div.wv-sh-app', { onTap: fn }, ic, h('span', label)); }
        function draw() {
          grid.innerHTML = '';
          people.forEach((id) => grid.appendChild(h('div.wv-sh-p', { class: { on: picked.has(id) }, onTap: () => { if (picked.has(id)) picked.delete(id); else picked.add(id); draw(); } },
            h('div.wv-sh-avw', av(id, 64), h('div.wv-sh-check', JC.icon('checkmark', { size: 12, weight: 3.2 }))), h('div.wv-sh-name', D.user(id).name || id))));
          sendBar.hidden = !picked.size;
        }
        function send() {
          if (!picked.size) return;
          const text = note.value.trim();
          picked.forEach((id) => sendDM(id, { post: pid, text: text || '' }));
          s.close();
          JC.ui.toast(picked.size === 1 ? 'Sent to ' + Array.from(picked)[0] : 'Sent to ' + picked.size + ' people', { icon: 'wv.send' });
        }
        draw();
      };

      // ── DMs ───────────────────────────────────────────────────────────
      function sendDM(id, o) {
        const cur = D.dm(id) || { id, msgs: [], unread: 0 };
        const msgs = (cur.msgs || []).slice();
        if (o.post) msgs.push({ from: 'me', post: o.post, t: JC.time.now() });
        if (o.text) msgs.push({ from: 'me', text: o.text, story: o.story, t: JC.time.now() });
        JC.store.add('wvdms', Object.assign({}, cur, { msgs, request: false }));
        JC.story.act('dm', { to: id, text: o.text || '', post: o.post || null });
        JC.audio.play('send');
        if (id === ME) return;
        const delay = 2200 + Math.random() * 3500;
        setTimeout(() => { typingFor[id] = true; JC.bus.emit('wv:typing', id); }, 900);
        setTimeout(() => {
          typingFor[id] = false;
          const d = D.dm(id) || { id, msgs: [] };
          const reply = o.post && !o.text ? (D.post(o.post) && D.post(o.post).by === id ? 'u sent me my own post??' : canned(id)) : canned(id);
          const viewing = app._dmOpen === id && JC.os.isOpen('wavelet');
          JC.store.add('wvdms', Object.assign({}, d, { msgs: (d.msgs || []).concat({ from: id, text: reply, t: JC.time.now() }), unread: viewing ? 0 : (d.unread || 0) + 1 }));
          JC.bus.emit('wv:typing', id);
          if (!viewing) JC.notify.push({ app: 'wavelet', title: id, subtitle: 'Wavelet', body: reply, art: undefined, open: { app: 'wavelet', intent: { dm: id } } });
          else JC.audio.play('receive');
          updateBadge();
        }, delay);
      }
      const typingFor = {};

      function inboxPage() {
        let q = '';
        let reqMode = false;
        const page = mk({
          title: ME, cls: 'wv-inbox', hideBar: true,
          right: [JC.ui.navBtn({ icon: 'square.and.pencil', label: 'New message', onTap: () => newDM() })],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          content: () => {
            const all = JC.store.all('wvdms').filter((d) => d.cond !== 'car' || carFlag());
            const main = all.filter((d) => !d.request).sort((a, b) => lastT(b) - lastT(a));
            const reqs = all.filter((d) => d.request);
            const arr = (reqMode ? reqs : main).filter((d) => !q || (d.id + ' ' + (D.user(d.id).name || '')).toLowerCase().includes(q.toLowerCase()));
            return [
              reqMode ? h('div.wv-inbox-h', h('span', 'Message requests'), h('span.wv-link', { onTap: () => { reqMode = false; page.setTitle(ME); page.render(); } }, 'Done'))
                : h('div.wv-inbox-h', h('span', 'Messages'), h('span.wv-link', { onTap: () => { reqMode = true; page.setTitle('Requests'); page.render(); } }, 'Requests' + (reqs.length ? ' (' + reqs.length + ')' : ''))),
              reqMode ? h('div.wv-inbox-note', 'Open a chat to get more info about who’s messaging you. They won’t know you’ve seen it until you accept.') : null,
              arr.length ? JC.ui.list([{ rows: arr.map((d) => dmRow(d)) }], { style: 'plain', cls: 'wv-plain wv-dmrows' }) : JC.ui.empty({ icon: 'wv.send', title: reqMode ? 'No requests' : 'No messages', text: reqMode ? 'You don’t have any message requests.' : 'Messages you send and receive will appear here.' }),
            ];
          },
          onShow: () => page.render(),
        });
        function lastT(d) { const m = (d.msgs || [])[(d.msgs || []).length - 1]; return m ? m.t : 0; }
        function dmRow(d) {
          const m = (d.msgs || [])[(d.msgs || []).length - 1] || {};
          const prev = m.from === 'me' ? 'You: ' + (m.post ? 'sent a post' : m.text) : m.post ? 'Sent a post by ' + (D.post(m.post) || { by: '…' }).by : m.text;
          return {
            leading: av(d.id, 54, { ring: true }),
            title: h('span.wv-dm-name', { class: { unread: !!d.unread } }, D.user(d.id).name || d.id),
            subtitle: h('span.wv-dm-prev', { class: { unread: !!d.unread } }, (prev || '') + ' · ' + ago(m.t)),
            right: h('div.wv-dm-right', d.unread ? h('i.wv-dot') : null, h('div.wv-dm-cam', { onTap: (e) => { e.stopPropagation(); JC.os.open('camera'); } }, JC.icon('wv.camera', { size: 22 }))),
            onTap: () => app.openDM(d.id),
            swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash.fill', onTap: () => JC.ui.alert({ title: 'Delete chat?', message: 'This deletes the chat for you only.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('wvdms', d.id); page.render(); updateBadge(); } }] }) }],
            lead: [{ text: d.unread ? 'Read' : 'Unread', color: 'var(--blue)', icon: 'message.fill', onTap: () => { JC.store.update('wvdms', d.id, { unread: d.unread ? 0 : 1 }); page.render(); updateBadge(); } }],
          };
        }
        function newDM() {
          const s = JC.ui.sheet({
            title: 'New message', detent: 'large', left: { text: 'Cancel' },
            content: () => JC.ui.list([{ header: 'Suggested', rows: D.users().filter((u) => u.id !== ME).map((u) => ({ leading: av(u.id, 44), title: u.name || u.id, subtitle: u.id, onTap: () => { s.close(); setTimeout(() => app.openDM(u.id), 300); } })) }], { style: 'plain', cls: 'wv-plain' }),
          });
        }
        return page;
      }

      function dmPage(id) {
        const u = D.user(id);
        const listEl = h('div.wv-dm-list');
        const typing = h('div.wv-dm-typing', { hidden: true }, av(id, 24), h('div.wv-dm-dots', h('i'), h('i'), h('i')));
        const field = JC.ui.input({ placeholder: 'Message…', enterkey: 'send', onSubmit: () => send(), onInput: (v) => comp.classList.toggle('has', !!v.trim()) });
        field.classList.add('wv-dm-input');
        const comp = h('div.wv-dm-comp', { attrs: { 'data-kbkeep': '' } },
          h('div.wv-dm-camb', { onTap: () => JC.os.open('camera') }, JC.icon('camera.fill', { size: 18 })),
          field,
          h('div.wv-dm-icons',
            h('div.wv-dm-ic', { onTap: () => JC.ui.toast('Voice messages need Jiang Cheng’s voice', { icon: 'mic.slash.fill' }) }, JC.icon('mic', { size: 22 })),
            h('div.wv-dm-ic', { onTap: () => pickPhoto((art) => sendPhoto(art)) }, JC.icon('photo', { size: 22 })),
            h('div.wv-dm-ic', { onTap: () => { field.value += '❤️'; comp.classList.add('has'); } }, JC.icon('face.smiling', { size: 22 }))),
          h('div.wv-dm-send', { onTap: () => send() }, 'Send'));
        const req = D.dm(id) && D.dm(id).request;
        const reqBar = h('div.wv-dm-req', { hidden: !req },
          h('div.wv-dm-req-t', h('b', id), ' wants to send you a message.'),
          h('div.wv-dm-req-btns',
            h('div.wv-btn', { onTap: () => JC.ui.alert({ title: 'Block ' + id + '?', message: 'They won’t be able to message you or find your profile.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onTap: () => { JC.store.remove('wvdms', id); page.nav.pop(); } }] }) }, 'Block'),
            h('div.wv-btn', { onTap: () => { JC.store.remove('wvdms', id); updateBadge(); page.nav.pop(); } }, 'Delete'),
            h('div.wv-btn.primary', { onTap: () => { JC.store.update('wvdms', id, { request: false }); reqBar.hidden = true; comp.hidden = false; } }, 'Accept')));
        comp.hidden = !!req;
        const headTitle = h('div.wv-dm-head', { onTap: () => app.openProfile(id) }, av(id, 30), h('div', h('div.wv-dm-hn', u.name || id), h('div.wv-dm-hs', id)));
        const page = mk({
          title: '', cls: 'wv-dm', bg: 'plain', hideBar: true,
          right: [JC.ui.glassGroup(
            JC.ui.navBtn({ icon: 'phone.fill', iconSize: 18, label: 'Call', onTap: () => call(false) }),
            JC.ui.navBtn({ icon: 'video.fill', iconSize: 19, label: 'Video', onTap: () => call(true) }))],
          content: [h('div.wv-dm-top', av(id, 88), h('div.wv-dm-tn', u.name || id), h('div.wv-dm-ts', id + ' · Wavelet'), h('div.wv-dm-ts2', fmtN(u.followers) + ' followers · ' + (postsBy(id).length) + ' posts'), h('div.wv-btn.small', { onTap: () => app.openProfile(id) }, 'View profile')), listEl, typing],
          footer: h('div.wv-dm-bottom', reqBar, comp),
          onShow: () => { app._dmOpen = id; markRead(); },
          onHide: () => { if (app._dmOpen === id) app._dmOpen = null; },
        });
        page.navbar.querySelector('.nav-title').replaceWith(headTitle);
        function call(video) {
          if (u.contact) JC.story.dial(u.contact, { video });
          else JC.ui.alert({ title: 'Can’t start call', message: id + ' isn’t available for calls on Wavelet.', buttons: [{ text: 'OK' }] });
        }
        function markRead() { const d = D.dm(id); if (d && d.unread) { JC.store.update('wvdms', id, { unread: 0 }); updateBadge(); } }
        function render() {
          const d = D.dm(id) || { msgs: [] };
          listEl.innerHTML = '';
          let prevT = 0;
          (d.msgs || []).forEach((m, i) => {
            if (!prevT || m.t - prevT > 3600e3) listEl.appendChild(h('div.wv-dm-stamp', U.fmtStamp(m.t)));
            prevT = m.t;
            const mine = m.from === 'me';
            const nx = d.msgs[i + 1];
            const lastRun = !nx || nx.from !== m.from;
            let body;
            if (m.post && D.post(m.post)) {
              const p = D.post(m.post);
              body = h('div.wv-dm-postcard', { onTap: () => app.openPost(p.id) },
                h('div.wv-dm-pc-h', av(p.by, 24), h('b', p.by)),
                h('div.wv-dm-pc-img', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` } }),
                p.text ? h('div.wv-dm-pc-t', h('b', p.by), ' ', p.text) : null);
            } else if (m.art) body = h('div.wv-dm-photo', { style: { backgroundImage: `url("${JC.art.url(m.art)}")` }, onTap: () => lightbox({ art: m.art, by: mine ? ME : id, t: m.t }) });
            else body = h('div.wv-dm-b', m.story ? h('div.wv-dm-story', 'Replied to their story') : null, m.text);
            listEl.appendChild(h('div.wv-dm-m', { class: { mine, last: lastRun } }, !mine ? (lastRun ? av(id, 28) : h('div.wv-dm-avsp')) : null, body));
          });
          if (d.msgs && d.msgs.length && d.msgs[d.msgs.length - 1].from === 'me') listEl.appendChild(h('div.wv-dm-seen', 'Seen'));
          typing.hidden = !typingFor[id];
          requestAnimationFrame(() => { page.scroll.scrollTop = page.scroll.scrollHeight; });
        }
        function send() {
          const text = field.value.trim();
          if (!text) return;
          field.value = '';
          comp.classList.remove('has');
          sendDM(id, { text });
        }
        function sendPhoto(art) {
          const cur = D.dm(id) || { id, msgs: [] };
          JC.store.add('wvdms', Object.assign({}, cur, { msgs: (cur.msgs || []).concat({ from: 'me', art, t: JC.time.now() }) }));
          JC.story.act('dm', { to: id, text: '', art });
          sendDM(id, {});
        }
        const off1 = JC.store.on('wvdms', () => { if (page.el.isConnected) { render(); if (app._dmOpen === id) markRead(); } });
        const off2 = JC.bus.on('wv:typing', (x) => { if (x === id) { typing.hidden = !typingFor[id]; if (typingFor[id]) page.scroll.scrollTop = page.scroll.scrollHeight; } });
        page.opts.onClose = () => { off1(); off2(); };
        render();
        return page;
      }

      function pickPhoto(fn, title) {
        const photos = photoList();
        const s = JC.ui.sheet({
          title: title || 'Recents', detent: 'large', left: { text: 'Cancel' }, cls: 'wv-pick',
          content: () => h('div.wv-grid.g4', photos.map((p) => h('div.wv-cell', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { s.close(); fn(p.art); } }))),
        });
      }

      // ── stories ───────────────────────────────────────────────────────
      function addToStory(art) {
        const me = D.user(ME);
        JC.store.update('wvusers', ME, { story: (me.story || []).concat({ art, text: '', t: JC.time.now() }) });
        JC.ui.toast('Added to your story', { icon: 'plus.circle.fill' });
        setTimeout(() => addActivity({ kind: 'storyview', by: 'yiling_radish_king' }, 'yiling_radish_king viewed your story 👀'), 7000);
      }
      app.openStories = (startId, queue, so) => {
        so = so || {};
        let ids = queue && queue.length ? queue.slice() : [startId];
        let ui = Math.max(0, ids.indexOf(startId));
        let fi = 0;
        let elapsed = 0, last = 0, raf = 0, paused = false, downAt = 0;
        const DUR = 5200;
        const layer = JC.ui.layer();
        const bars = h('div.wv-st-bars');
        const headAv = h('div.wv-st-av');
        const headName = h('div.wv-st-name');
        const headT = h('div.wv-st-t');
        const media = h('div.wv-st-media');
        const cap = h('div.wv-st-cap');
        const reply = JC.ui.input({ placeholder: 'Send message', enterkey: 'send', onSubmit: () => sendReply(), onFocus: () => { paused = true; }, onBlur: () => { paused = false; } });
        reply.classList.add('wv-st-input');
        const likeBtn = h('div.wv-st-btn', { onTap: () => likeStory() }, JC.icon('heart', { size: 26 }));
        const foot = h('div.wv-st-foot', h('div.wv-st-field', reply), likeBtn, h('div.wv-st-btn', { onTap: () => { paused = true; JC.ui.share({ title: ids[ui] + '’s story', subtitle: 'Wavelet', art: frames()[fi].art, payload: { kind: 'photo', art: frames()[fi].art } }); setTimeout(() => { paused = false; }, 1500); } }, JC.icon('wv.send', { size: 24 })));
        const head = h('div.wv-st-head', h('div.wv-st-who', { onTap: () => { close(); app.openProfile(ids[ui]); } }, headAv, headName, headT),
          h('div.wv-st-hbtn', { onTap: () => { paused = true; JC.ui.actionSheet({ actions: [{ text: 'Mute ' + ids[ui], onTap: () => JC.ui.toast('Stories muted') }, { text: 'About this account', onTap: () => aboutAccount(ids[ui]) }, { text: 'Report', style: 'destructive', onTap: () => JC.ui.toast('Story reported') }] }).then(() => { paused = false; }); } }, JC.icon('ellipsis', { size: 22 })),
          h('div.wv-st-hbtn', { onTap: () => close() }, JC.icon('xmark', { size: 22, weight: 2.2 })));
        const stage = h('div.wv-st-stage', media, cap);
        const el = h('div.wv-story', stage, bars, head, foot);
        layer.appendChild(el);
        U.anim(el, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: U.SPRING, fill: 'none' });
        const frames = () => (so.frames && ids[ui] === startId ? so.frames : storyOf(ids[ui]));
        function show() {
          const fr = frames();
          if (!fr.length) { close(); return; }
          fi = U.clamp(fi, 0, fr.length - 1);
          const f = fr[fi];
          bars.innerHTML = '';
          fr.forEach((_, i) => bars.appendChild(h('div.wv-st-bar', h('i', { style: { width: i < fi ? '100%' : '0%' } }))));
          media.style.backgroundImage = `url("${JC.art.url(f.art)}")`;
          cap.textContent = f.text || '';
          cap.hidden = !f.text;
          headAv.innerHTML = '';
          headAv.appendChild(av(ids[ui], 32));
          headName.textContent = ids[ui] === ME ? 'Your story' : ids[ui];
          headT.textContent = ago(f.t);
          reply.placeholder = ids[ui] === ME ? 'Viewers' : 'Reply to ' + ids[ui] + '…';
          foot.classList.toggle('own', ids[ui] === ME);
          likeBtn.innerHTML = '';
          likeBtn.appendChild(JC.icon(pmap('stLikes')[ids[ui] + ':' + fi] ? 'heart.fill' : 'heart', { size: 26 }));
          likeBtn.classList.toggle('on', !!pmap('stLikes')[ids[ui] + ':' + fi]);
          if (!so.frames) pset('seen', ids[ui] + ':' + fi, 1);
          elapsed = 0;
        }
        function tick(now) {
          if (!el.isConnected) return;
          if (!last) last = now;
          if (!paused) elapsed += now - last;
          last = now;
          const bar = bars.children[fi];
          if (bar) bar.firstChild.style.width = Math.min(100, (elapsed / DUR) * 100) + '%';
          if (elapsed >= DUR) next();
          raf = requestAnimationFrame(tick);
        }
        function next() {
          if (fi < frames().length - 1) { fi++; show(); return; }
          if (ui < ids.length - 1) { ui++; fi = 0; U.anim(stage, [{ transform: 'translateX(40%) scale(.92)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 320, fill: 'none' }); show(); return; }
          close();
        }
        function prev() {
          if (fi > 0) { fi--; show(); return; }
          if (ui > 0) { ui--; fi = frames().length - 1; show(); return; }
          elapsed = 0;
        }
        function likeStory() {
          const k = ids[ui] + ':' + fi;
          const on = !pmap('stLikes')[k];
          pset('stLikes', k, on ? 1 : null);
          likeBtn.innerHTML = '';
          likeBtn.appendChild(JC.icon(on ? 'heart.fill' : 'heart', { size: 26 }));
          likeBtn.classList.toggle('on', on);
          if (on && ids[ui] !== ME) JC.audio.haptic(8);
        }
        function sendReply() {
          const text = reply.value.trim();
          if (!text) return;
          if (ids[ui] === ME) { reply.value = ''; JC.ui.toast('No viewers yet'); return; }
          reply.value = '';
          reply.blur();
          sendDM(ids[ui], { text, story: true });
          JC.ui.toast('Message sent', { icon: 'wv.send' });
        }
        U.drag(stage, {
          down: () => { paused = true; downAt = performance.now(); },
          tap: (e) => {
            paused = false;
            if (performance.now() - downAt > 350) return;
            const r = stage.getBoundingClientRect();
            if (e.clientX - r.left < r.width * 0.32) prev(); else next();
          },
          move: (e, p) => { if (p.axis === 'y' && p.dy > 0) { el.style.transform = `translateY(${p.dy}px) scale(${1 - Math.min(0.15, p.dy / 1500)})`; el.style.borderRadius = '30px'; } },
          end: (e, p) => {
            paused = false;
            if (p.axis === 'y' && p.dy > 110) { close(); return; }
            if (p.axis === 'x' && p.dx < -60) { if (ui < ids.length - 1) { ui++; fi = 0; show(); } else close(); }
            else if (p.axis === 'x' && p.dx > 60) { if (ui > 0) { ui--; fi = 0; show(); } }
            el.style.transform = '';
            el.style.borderRadius = '';
          },
        });
        function close() {
          cancelAnimationFrame(raf);
          app._overlay = null;
          U.anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.92)' }], { duration: 200 }).then(() => el.remove());
          scheduleRender(true);
        }
        app._overlay = close;
        show();
        raf = requestAnimationFrame(tick);
      };

      function myStory() {
        if (storyOf(ME).length) {
          JC.ui.actionSheet({ actions: [{ text: 'View your story', onTap: () => app.openStories(ME, [ME]) }, { text: 'Add to your story', onTap: () => pickPhoto((art) => addToStory(art), 'Add to story') }] });
          return;
        }
        pickPhoto((art) => addToStory(art), 'Add to story');
      }

      // ── home ──────────────────────────────────────────────────────────
      function storiesRow() {
        const withStory = D.users().filter((u) => u.id !== ME && storyOf(u.id).length);
        withStory.sort((a, b) => (storySeen(a.id) ? 1 : 0) - (storySeen(b.id) ? 1 : 0));
        const ids = withStory.map((u) => u.id);
        return h('div.wv-stories.hscroll',
          h('div.wv-st-item.me', { onTap: () => myStory() },
            h('div.wv-st-avw', av(ME, 66, { ring: true }), h('div.wv-st-plus', JC.icon('plus', { size: 13, weight: 3 }))),
            h('div.wv-st-label', 'Your story')),
          ids.map((id) => h('div.wv-st-item', { onTap: () => app.openStories(id, ids) }, av(id, 66, { ring: true }), h('div.wv-st-label', { class: { seen: storySeen(id) } }, id))));
      }
      function feedPosts() {
        const all = allPosts();
        if (feedMode === 'following') return all.filter((p) => p.by === ME || isFollowing(p.by));
        if (feedMode === 'favorites') { const fav = pmap('favs'); return all.filter((p) => fav[p.by]); }
        return all.filter((p) => !(p.by === ME && JC.time.now() - p.t > 86400e3 * 3));
      }
      function homePage() {
        const logo = h('div.wv-logo', { onTap: (e) => JC.ui.menu(e.currentTarget, [
          { text: 'For you', icon: 'sparkles', checked: feedMode === 'all', onTap: () => { feedMode = 'all'; page.render(); } },
          { text: 'Following', icon: 'person.2.fill', checked: feedMode === 'following', onTap: () => { feedMode = 'following'; page.render(); } },
          { text: 'Favorites', icon: 'star', checked: feedMode === 'favorites', onTap: () => { feedMode = 'favorites'; page.render(); } },
        ]) }, JC.icon('wv.wave', { size: 26, weight: 2.6, cls: 'wv-logo-ic' }), h('span', 'Wavelet'), JC.icon('chevron.down', { size: 12, weight: 2.8 }));
        const actBtn = JC.ui.navBtn({ icon: 'heart', iconSize: 21, label: 'Activity', onTap: () => app.tabs.select('activity', true) });
        const dmBtn = JC.ui.navBtn({ icon: 'wv.send', iconSize: 20, label: 'Messages', onTap: () => app.openInbox() });
        const dmBadge = h('span.wv-nbadge');
        dmBtn.appendChild(dmBadge);
        const page = mk({
          title: '', cls: 'wv-home', left: [logo], right: [JC.ui.glassGroup(actBtn, dmBtn)],
          content: () => {
            const n = badgeCount().dms;
            dmBadge.textContent = n ? String(n) : '';
            dmBadge.hidden = !n;
            const ps = feedPosts();
            return [
              storiesRow(),
              app._uploading ? h('div.wv-uploading', JC.art.el(app._uploading, { cls: 'wv-up-thumb' }), h('div.wv-up-main', h('div', 'Posting…'), h('div.wv-up-bar', h('i')))) : null,
              ...ps.map((p) => postCard(p, { inFeed: true })),
              ps.length ? h('div.wv-allcaught', JC.icon('checkmark.circle.fill', { size: 34 }), h('b', 'You’re all caught up'), h('span', 'You’ve seen all new posts from the past 3 days.')) : JC.ui.empty({ icon: 'star', title: feedMode === 'favorites' ? 'No favorites yet' : 'Nothing to see', text: feedMode === 'favorites' ? 'Add accounts to Favorites from their profile menu.' : 'Follow people to see their posts here.' }),
            ];
          },
        });
        app.homePage = page;
        return page;
      }

      // ── single post page ──────────────────────────────────────────────
      function postPage(pid, title) {
        const page = mk({
          title: title || 'Post', cls: 'wv-postpage',
          content: () => { const p = D.post(pid); return p ? [postCard(p, { open: true })] : JC.ui.empty({ icon: 'photo', title: 'Post unavailable', text: 'This post may have been deleted.' }); },
        });
        return page;
      }

      // ── place page ────────────────────────────────────────────────────
      app.openPlace = (name) => {
        const pid = placeId(name);
        const page = mk({
          title: name, cls: 'wv-place',
          content: () => {
            const ps = allPosts().filter((p) => p.place === name || (pid && placeId(p.place) === pid));
            return [
              h('div.wv-place-top', h('div.wv-place-ic', JC.icon('mappin.fill', { size: 26 })), h('div', h('div.wv-place-n', name), h('div.wv-place-s', fmtN(ps.length) + (ps.length === 1 ? ' post' : ' posts'))),
                pid ? h('div.wv-btn.small', { onTap: () => JC.os.open('maps', { place: pid }) }, 'View in Maps') : null),
              gridOf(ps),
            ];
          },
        });
        curNav().push(page);
      };

      function gridOf(ps, o) {
        o = o || {};
        if (!ps.length) return o.empty || JC.ui.empty({ icon: 'photo', title: 'No posts yet' });
        return h('div.wv-grid', { class: { mosaic: !!o.mosaic } }, ps.map((p, i) => h('div.wv-cell', {
          class: { big: !!o.mosaic && i % 10 === 2 },
          style: { backgroundImage: `url("${JC.art.url(p.art)}")` },
          onTap: () => app.openPost(p.id, o.title),
        }, (p.comments || []).length > 3 ? h('div.wv-cell-ic', JC.icon('wv.comment', { size: 14, weight: 2.2 })) : null)));
      }

      // ── tag page ──────────────────────────────────────────────────────
      function tagPage(tag) {
        let mode = 0;
        const page = mk({
          title: tag, cls: 'wv-tagpage',
          content: () => {
            let ps = postsWithTag(tag);
            if (mode === 0) ps = ps.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
            const followed = !!pmap('tags')[tag.toLowerCase()];
            return [
              h('div.wv-tag-top', h('div.wv-tag-ic', '#'), h('div.wv-tag-meta', h('div.wv-tag-n', tag), h('div.wv-tag-c', fmtN(ps.length) + (ps.length === 1 ? ' post' : ' posts'))),
                h('div.wv-btn.small', { class: { primary: !followed }, onTap: () => { pset('tags', tag.toLowerCase(), followed ? null : 1); page.render(); } }, followed ? 'Following' : 'Follow')),
              h('div.wv-seg', JC.ui.segmented({ items: ['Top', 'Recent'], value: mode, onChange: (i) => { mode = i; page.render(); } })),
              gridOf(ps, { title: tag, empty: JC.ui.empty({ icon: 'wv.hash', title: 'No posts', text: 'Nobody has posted with ' + tag + ' yet.' }) }),
            ];
          },
        });
        return page;
      }

      // ── search / explore ──────────────────────────────────────────────
      function searchPage() {
        let q = '';
        let focused = false;
        const page = mk({
          title: 'Search', navbar: false, cls: 'wv-search',
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); }, onFocus: () => { focused = true; page.render(); }, onCancel: () => { focused = false; q = ''; page.render(); } },
          content: () => {
            if (q.trim()) return results(q.trim());
            if (focused) {
              const recent = Object.keys(pmap('recent')).slice(-6).reverse();
              return [
                recent.length ? h('div.wv-sec-h', h('span', 'Recent'), h('span.wv-link', { onTap: () => { P('recent', {}); page.render(); } }, 'Clear all')) : null,
                recent.length ? JC.ui.list([{ rows: recent.map((id) => userRow(id)) }], { style: 'plain', cls: 'wv-plain' }) : null,
                h('div.wv-sec-h', h('span', 'Trending')),
                JC.ui.list([{ rows: trending().map((t) => tagRow(t, true)) }], { style: 'plain', cls: 'wv-plain' }),
              ];
            }
            const ps = allPosts().filter((p) => p.by !== ME);
            return [h('div.wv-trend.hscroll', trending().map((t) => h('div.wv-chip', { onTap: () => app.openTag(t) }, JC.icon('chart.line.uptrend.xyaxis', { size: 13, weight: 2.2 }), t))), gridOf(ps, { mosaic: true, title: 'Explore' })];
          },
        });
        function userRow(id) {
          const u = D.user(id);
          return { leading: av(id, 46, { ring: true }), title: h('span.wv-row-h', id, u.verified ? JC.icon('wv.verified', { size: 12, cls: 'wv-verified' }) : null), subtitle: (u.name || '') + (u.followers ? ' · ' + fmtN(u.followers) + ' followers' : '') + (isFollowing(id) ? ' · Following' : ''), onTap: () => { pset('recent', id, JC.time.now()); app.openProfile(id); } };
        }
        function tagRow(t, hot) {
          const n = postsWithTag(t).length;
          return { leading: h('div.wv-hash', '#'), title: t, subtitle: hot ? 'Trending · ' + fmtN(n) + ' posts' : fmtN(n) + (n === 1 ? ' post' : ' posts'), onTap: () => app.openTag(t) };
        }
        function results(q) {
          const lq = q.toLowerCase().replace(/^[@#]/, '');
          const us = D.users().filter((u) => (u.id + ' ' + (u.name || '')).toLowerCase().includes(lq) && (u.id !== 'koi_watchers' || carFlag()));
          const tagMap = {};
          allPosts().forEach((p) => (String(p.text || '').match(/#[\w\u4e00-\u9fff]+/g) || []).forEach((t) => { if (t.toLowerCase().includes(lq) && !tagMap[t.toLowerCase()]) tagMap[t.toLowerCase()] = t; }));
          const tags = Object.values(tagMap);
          const places = Array.from(new Set(allPosts().map((p) => p.place).filter((pl) => pl && pl.toLowerCase().includes(lq))));
          const out = [];
          if (us.length) out.push(h('div.wv-sec-h', h('span', 'Accounts')), JC.ui.list([{ rows: us.map((u) => userRow(u.id)) }], { style: 'plain', cls: 'wv-plain' }));
          if (tags.length) out.push(h('div.wv-sec-h', h('span', 'Tags')), JC.ui.list([{ rows: tags.map((t) => tagRow(t)) }], { style: 'plain', cls: 'wv-plain' }));
          if (places.length) out.push(h('div.wv-sec-h', h('span', 'Places')), JC.ui.list([{ rows: places.map((pl) => ({ leading: h('div.wv-hash', JC.icon('mappin.fill', { size: 18 })), title: pl, subtitle: (() => { const n = allPosts().filter((p) => p.place === pl).length; return n + (n === 1 ? ' post' : ' posts'); })(), onTap: () => app.openPlace(pl) })) }], { style: 'plain', cls: 'wv-plain' }));
          if (!out.length) out.push(JC.ui.empty({ icon: 'magnifyingglass', title: 'No results for “' + q + '”', text: 'Try a name, a #tag or a place.' }));
          return out;
        }
        return page;
      }

      // ── create ────────────────────────────────────────────────────────
      let createSel = null;
      let createPrefill = '';
      function createPage() {
        const photos = photoList();
        if (!createSel) createSel = photos[0] ? photos[0].art : 'p_moon_street';
        const prev = h('div.wv-cr-prev');
        const drawPrev = () => { prev.style.backgroundImage = `url("${JC.art.url(createSel)}")`; };
        const page = mk({
          title: 'New post', cls: 'wv-create',
          left: [JC.ui.navBtn({ icon: 'xmark', label: 'Close', onTap: () => app.tabs.select('home', true) })],
          right: [JC.ui.navBtn({ text: 'Next', prominent: true, cls: 'wv-next', onTap: () => page.nav.push(captionPage()) })],
          content: () => {
            drawPrev();
            return [
              prev,
              h('div.wv-cr-bar',
                h('div.wv-cr-album', { onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Recents', checked: true, onTap: () => {} }, { text: 'Favorites', onTap: () => JC.ui.toast('Showing Recents — Favorites album is empty') }, { text: 'Screenshots', onTap: () => JC.ui.toast('Showing Recents') }]) }, 'Recents', JC.icon('chevron.down', { size: 12, weight: 2.6 })),
                h('div.spacer'),
                h('div.wv-cr-tool', { onTap: () => JC.ui.toast('Select up to 10 photos — multi-select is off for private accounts') }, JC.icon('square.on.square', { size: 18 })),
                h('div.wv-cr-tool', { onTap: () => JC.os.open('camera') }, JC.icon('camera.fill', { size: 18 }))),
              h('div.wv-grid.g4', photos.map((p) => h('div.wv-cell', { class: { sel: p.art === createSel }, style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { createSel = p.art; page.render(); page.scrollTop(true); } }))),
            ];
          },
        });
        return page;
      }
      function captionPage() {
        let place = '';
        const tagged = [];
        const field = JC.ui.input({ multiline: true, placeholder: 'Add a caption…', value: createPrefill, autoGrow: true, maxHeight: 180 });
        field.classList.add('wv-cap-field');
        createPrefill = '';
        const shareBtn = h('div.wv-share-btn', { onTap: () => share() }, 'Share');
        const page = mk({
          title: 'New post', cls: 'wv-caption', bg: 'plain', hideBar: true,
          content: (pg) => [
            h('div.wv-cap-top', JC.art.el(createSel, { cls: 'wv-cap-img' }), field),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'person.fill', bg: 'var(--indigo)' }, title: 'Tag people', detail: tagged.length ? tagged.map((x) => '@' + x).join(', ') : '', chevron: true, onTap: () => {
                JC.ui.sheet({ title: 'Tag people', detent: 'large', right: { text: 'Done' }, content: (s) => JC.ui.list([{ rows: D.users().filter((u) => u.id !== ME).map((u) => ({ leading: av(u.id, 36), title: u.id, subtitle: u.name, check: tagged.includes(u.id), onTap: () => { const i = tagged.indexOf(u.id); if (i >= 0) tagged.splice(i, 1); else tagged.push(u.id); s.render(); pg.render(); } })) }]) });
              } },
              { icon: { glyph: 'location.fill', bg: 'var(--teal)' }, title: 'Add location', detail: place, chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Add location', actions: ['Lotus Pier', 'Yunmeng', 'Koi Tower', 'Golden Peony Hotel', 'Lanling', 'Cloud Recesses'].map((x) => ({ text: x, onTap: () => { place = x; pg.render(); } })).concat(place ? [{ text: 'Remove location', style: 'destructive', onTap: () => { place = ''; pg.render(); } }] : []) }) },
              { icon: { glyph: 'music.note', bg: 'var(--pink)' }, title: 'Add music', chevron: true, onTap: () => JC.ui.alert({ title: 'Add music', message: 'Jiang Cheng’s most-played song is “Gym Mix 3”. Nobody needs to know that.', buttons: [{ text: 'Never mind', style: 'cancel' }] }) },
              { icon: { glyph: 'eye', bg: 'var(--gray)' }, title: 'Audience', detail: 'Followers', chevron: true, onTap: () => JC.ui.alert({ title: 'Private account', message: 'Only Jiang Cheng’s 2,318 approved followers will see this post. That includes Wei Wuxian.', buttons: [{ text: 'OK' }] }) },
            ] }]),
            h('div.wv-cap-note', 'Your account is private. Only approved followers will see this post.'),
          ],
          footer: h('div.wv-cap-foot', shareBtn),
        });
        function share() {
          let text = field.value.trim();
          if (tagged.length) text = (text ? text + ' ' : '') + tagged.map((x) => '@' + x).join(' ');
          const art = createSel;
          app.tabs.select('home', false);
          const hn = app.tabs.nav('home');
          let guard = 8;
          while (hn && hn.depth() > 1 && guard-- > 0) { if (!hn.pop({ instant: true })) break; }
          page.nav.popToRoot();
          app._uploading = art;
          scheduleRender(true);
          app.homePage && app.homePage.scrollTop(true);
          setTimeout(() => {
            app._uploading = null;
            const p = JC.store.add('posts', { id: U.uid('wvpost'), by: ME, t: JC.time.now(), art, text, place, likes: 0, liked: false, comments: [] }, { front: true });
            JC.store.update('wvusers', ME, {});
            JC.story.act('post', { text, art });
            JC.ui.toast('Your post is live', { icon: 'checkmark.circle.fill' });
            reactions(p.id);
          }, 1800);
        }
        return page;
      }
      function reactions(pid) {
        const steps = [
          [4, () => like('rulan_jin', 1)],
          [7, () => comment('yiling_radish_king', 'JIANG CHENG POSTED??')],
          [10, () => like('yiling_radish_king', 3)],
          [13, () => comment('rulan_jin', 'delete this')],
          [18, () => comment('huaisang_fans', '👀')],
          [24, () => like('zewujun', 6)],
          [31, () => comment('yiling_radish_king', 'lan zhan LOOK. he POSTED. on PURPOSE')],
          [40, () => like('lan_sizhui', 9)],
          [52, () => comment('jingyi_lan', 'MR JIANG HAS WAVELET?? 💀')],
          [70, () => like('lanwangji', 4)],
        ];
        function like(by, n) {
          const p = D.post(pid);
          if (!p) return;
          JC.store.update('posts', pid, { likes: (p.likes || 0) + n });
          addActivity({ kind: 'like', by, post: pid }, by + (n > 1 ? ' and ' + (n - 1) + ' others' : '') + ' liked your post.');
        }
        function comment(by, text) {
          const p = D.post(pid);
          if (!p) return;
          JC.store.update('posts', pid, { comments: (p.comments || []).concat({ by, text, t: JC.time.now() }) });
          addActivity({ kind: 'comment', by, post: pid, text }, by + ' commented: ' + text);
        }
        steps.forEach(([s, fn]) => setTimeout(fn, s * 1000));
      }

      // ── activity ──────────────────────────────────────────────────────
      function activityPage() {
        const page = mk({
          title: 'Notifications', large: true, cls: 'wv-activity',
          right: [JC.ui.navBtn({ icon: 'checkmark', label: 'Mark all read', onTap: () => { JC.store.all('wvact').forEach((a) => { if (!a.read) JC.store.update('wvact', a.id, { read: true }); }); updateBadge(); page.render(); } })],
          content: () => {
            const acts = JC.store.all('wvact').slice().sort((a, b) => b.t - a.t);
            const now = JC.time.now();
            const groups = [['New', (a) => !a.read], ['Today', (a) => now - a.t < 86400e3], ['This week', (a) => now - a.t < 7 * 86400e3], ['This month', (a) => now - a.t < 31 * 86400e3], ['Earlier', () => true]];
            const used = new Set();
            const out = [];
            const reqs = JC.store.all('wvreqs');
            if (reqs.length) out.push(JC.ui.list([{ rows: [{ leading: h('div.wv-req-av', av(reqs[0].id, 44), reqs[1] ? h('div.wv-req-av2', av(reqs[1].id, 32)) : null), title: 'Follow requests', subtitle: reqs[0].id + (reqs.length > 1 ? ' + ' + (reqs.length - 1) + ' others' : ''), right: h('i.wv-dot'), chevron: true, onTap: () => page.nav.push(requestsPage()) }] }], { style: 'plain', cls: 'wv-plain' }));
            groups.forEach(([label, fn]) => {
              const arr = acts.filter((a) => !used.has(a.id) && fn(a));
              arr.forEach((a) => used.add(a.id));
              if (!arr.length) return;
              out.push(h('div.wv-sec-h', h('span', label)));
              out.push(JC.ui.list([{ rows: arr.map((a) => actRow(a)) }], { style: 'plain', cls: 'wv-plain wv-actrows' }));
            });
            if (!acts.length) out.push(JC.ui.empty({ icon: 'heart', title: 'Activity on your posts', text: 'When someone likes or comments on one of your posts, you’ll see it here.' }));
            return out;
          },
          onShow: () => setTimeout(() => { JC.store.all('wvact').forEach((a) => { if (!a.read) JC.store.update('wvact', a.id, { read: true }); }); updateBadge(); }, 1500),
        });
        function actRow(a) {
          const p = a.post ? D.post(a.post) : null;
          const verb = {
            like: 'liked your post.', comment: 'commented: ' + (a.text || ''), reply: 'replied: ' + (a.text || ''), mention: 'mentioned you in a comment: ' + (a.text || ''),
            follow: 'started following you.', follow_req: 'requested to follow you.', storyview: 'viewed your story.', dmhint: 'sent you a message.',
          }[a.kind] || 'interacted with you.';
          let right = null;
          if (p) right = h('div.wv-act-thumb', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: (e) => { e.stopPropagation(); app.openPost(p.id); } });
          else if (a.kind === 'follow') right = followBtn(a.by, { small: true });
          else if (a.kind === 'follow_req') right = h('div.wv-btn.small.primary', { onTap: (e) => { e.stopPropagation(); JC.store.remove('wvact', a.id); JC.store.remove('wvreqs', a.by); JC.ui.toast(a.by + ' can now see your posts', { icon: 'checkmark' }); page.render(); } }, 'Confirm');
          return {
            cls: a.read ? 'wv-actrow' : 'wv-actrow',
            leading: h('div', { onTap: (e) => { e.stopPropagation(); app.openProfile(a.by); } }, av(a.by, 44, { ring: true })),
            title: h('span.wv-act-text', h('b', a.by), ' ', verb, ' ', h('span.wv-act-t', ago(a.t))),
            right,
            onTap: () => { if (a.kind === 'dmhint') app.openDM(a.by); else if (p) app.openPost(p.id); else app.openProfile(a.by); },
          };
        }
        function requestsPage() {
          return mk({
            title: 'Follow requests', cls: 'wv-reqs',
            content: (pg) => {
              const reqs = JC.store.all('wvreqs');
              if (!reqs.length) return JC.ui.empty({ icon: 'wv.person.plus', title: 'No requests', text: 'Follow requests will appear here.' });
              return JC.ui.list([{ rows: reqs.map((r) => ({
                leading: av(r.id, 44), title: r.id, subtitle: D.user(r.id).name, onTap: () => app.openProfile(r.id),
                right: h('div.wv-req-btns',
                  h('div.wv-btn.small.primary', { onTap: (e) => { e.stopPropagation(); JC.store.remove('wvreqs', r.id); JC.ui.toast('Request approved'); pg.render(); } }, 'Confirm'),
                  h('div.wv-btn.small', { onTap: (e) => { e.stopPropagation(); JC.store.remove('wvreqs', r.id); pg.render(); } }, 'Delete')),
              })) }], { style: 'plain', cls: 'wv-plain' });
            },
          });
        }
        return page;
      }

      // ── profile ───────────────────────────────────────────────────────
      function profilePage(id, isRoot) {
        const own = id === ME;
        let tab = 0;
        const u0 = D.user(id);
        const left = own ? [h('div.wv-acct', { onTap: () => accountsSheet() }, JC.icon('wv.lock', { size: 15, weight: 2.2 }), h('span', ME), JC.icon('chevron.down', { size: 12, weight: 2.6 }))] : null;
        const right = own
          ? [JC.ui.glassGroup(JC.ui.navBtn({ icon: 'wv.plus.square', iconSize: 21, label: 'Create', onTap: () => app.tabs.select('create', true) }), JC.ui.navBtn({ icon: 'line.3.horizontal', iconSize: 20, label: 'Menu', onTap: () => settingsSheet() }))]
          : [JC.ui.glassGroup(JC.ui.navBtn({ icon: 'bell', iconSize: 20, label: 'Notifications', onTap: () => { const on = !pmap('bells')[id]; pset('bells', id, on ? 1 : null); JC.ui.toast(on ? 'Post notifications on for ' + id : 'Post notifications off', { icon: on ? 'bell.fill' : 'bell.slash.fill' }); } }), JC.ui.navBtn({ icon: 'ellipsis', iconSize: 20, label: 'More', onTap: () => profileMenu(id) }))];
        const page = mk({
          title: own ? '' : id, cls: 'wv-profile', left: isRoot && own ? left : undefined, right,
          content: (pg) => {
            const u = D.user(id);
            const ps = postsBy(id);
            const locked = !own && u.private && !isFollowing(id);
            const header = h('div.wv-pr-head',
              h('div.wv-pr-av', { onTap: () => (storyOf(id).length ? app.openStories(id, [id]) : own ? editProfile() : lightboxAvatar(id)) }, av(id, 86, { ring: true }), own ? h('div.wv-pr-plus', { onTap: (e) => { e.stopPropagation(); myStory(); } }, JC.icon('plus', { size: 13, weight: 3 })) : null),
              h('div.wv-pr-counts',
                h('div.wv-pr-c', { onTap: () => { if (!locked) pg.scroll.scrollTo({ top: 360, behavior: 'smooth' }); } }, h('b', fmtN(ps.length)), h('span', 'posts')),
                h('div.wv-pr-c', { onTap: () => { if (!locked) followList(id, 'followers'); } }, h('b', fmtN(u.followers)), h('span', 'followers')),
                h('div.wv-pr-c', { onTap: () => { if (!locked) followList(id, 'following'); } }, h('b', fmtN(u.following)), h('span', 'following'))));
            const info = h('div.wv-pr-info',
              h('div.wv-pr-name', u.name || id, u.verified ? JC.icon('wv.verified', { size: 14, cls: 'wv-verified' }) : null),
              u.pronouns ? h('span.wv-pr-pron', u.pronouns) : null,
              u.cat ? h('div.wv-pr-cat', u.cat) : null,
              u.bio ? h('div.wv-pr-bio', ...rich(app, u.bio)) : null,
              u.link ? h('div.wv-pr-link', { onTap: () => JC.os.open('safari', { url: 'https://' + u.link.replace(/^https?:\/\//, '') }) }, JC.icon('link', { size: 13, weight: 2.2 }), u.link) : null,
              !own && u.followsMe ? h('div.wv-pr-follows', 'Follows you') : null);
            const btns = own
              ? h('div.wv-pr-btns', h('div.wv-btn', { onTap: () => editProfile() }, 'Edit profile'), h('div.wv-btn', { onTap: () => shareProfile(id) }, 'Share profile'), h('div.wv-btn.icon', { onTap: () => discover() }, JC.icon('wv.person.plus', { size: 16 })))
              : h('div.wv-pr-btns', followBtn(id), h('div.wv-btn', { onTap: () => message(id) }, 'Message'), h('div.wv-btn.icon', { onTap: () => discover() }, JC.icon('wv.person.plus', { size: 16 })));
            const hl = (u.highlights || []).length || own ? h('div.wv-hl.hscroll',
              (u.highlights || []).map((x, i) => h('div.wv-hl-item', { onTap: () => highlight(id, x, i) }, h('div.wv-hl-c', JC.ui.avatar({ art: x.art }, 60)), h('span', x.title))),
              own ? h('div.wv-hl-item', { onTap: () => pickPhoto((art) => { const me = D.user(ME); JC.store.update('wvusers', ME, { highlights: (me.highlights || []).concat({ title: 'Highlight', art }) }); pg.render(); }, 'New highlight') }, h('div.wv-hl-c.new', JC.icon('plus', { size: 26, weight: 1.6 })), h('span', 'New')) : null) : null;
            const tabsEl = locked ? null : h('div.wv-pr-tabs',
              h('div.wv-pr-tab', { class: { on: tab === 0 }, onTap: () => { tab = 0; pg.render(); } }, JC.icon('wv.grid', { size: 22 })),
              h('div.wv-pr-tab', { class: { on: tab === 1 }, onTap: () => { tab = 1; pg.render(); } }, JC.icon('wv.tagged', { size: 22 })));
            let body;
            if (locked) body = h('div.wv-private', h('div.wv-private-ic', JC.icon('wv.lock', { size: 30, weight: 1.6 })), h('b', 'This account is private'), h('span', 'Follow this account to see their photos and videos.'));
            else if (tab === 0) body = gridOf(ps, { title: id, empty: own ? h('div.wv-private', h('b', 'Share photos'), h('span', 'When you share photos, they will appear on your profile.'), h('div.wv-link', { onTap: () => app.tabs.select('create', true) }, 'Share your first photo')) : JC.ui.empty({ icon: 'wv.camera', title: 'No posts yet' }) });
            else {
              const tagged = allPosts().filter((p) => p.by !== id && String(p.text || '').toLowerCase().includes('@' + id.toLowerCase()));
              body = gridOf(tagged, { title: 'Tagged', empty: JC.ui.empty({ icon: 'wv.tagged', title: own ? 'Photos and videos of you' : 'No photos', text: own ? 'When people tag you in photos and videos, they’ll appear here.' : '' }) });
            }
            return [header, info, btns, hl, tabsEl, body];
          },
        });
        return page;
      }
      function lightboxAvatar(id) {
        const u = D.user(id);
        if (typeof u.avatar === 'string') lightbox({ art: u.avatar, by: id, t: JC.time.now() });
        else JC.ui.toast(id + ' hasn’t added a profile photo');
      }
      function highlight(id, x, i) {
        app.openStories(id, [id], { frames: [{ art: x.art, text: x.title, t: JC.time.now() - 86400e3 * (12 + i * 23) }] });
      }
      function message(id) {
        const u = D.user(id);
        if (u.contact && JC.contacts.get(u.contact)) JC.os.open('messages', { thread: JC.story.threadFor(u.contact) });
        else app.openDM(id);
      }
      function profileMenu(id) {
        const fav = !!pmap('favs')[id];
        JC.ui.actionSheet({ title: id, actions: [
          { text: fav ? 'Remove from Favorites' : 'Add to Favorites', onTap: () => { pset('favs', id, fav ? null : 1); JC.ui.toast(fav ? 'Removed from Favorites' : 'Added to Favorites', { icon: 'star.fill' }); } },
          { text: 'About this account', onTap: () => aboutAccount(id) },
          { text: 'Copy profile URL', onTap: () => { U.copy('https://wavelet.app/' + id); JC.ui.toast('Profile URL copied', { icon: 'link' }); } },
          { text: 'Share this profile', onTap: () => shareProfile(id) },
          { text: 'Restrict', onTap: () => JC.ui.alert({ title: 'Restrict ' + id + '?', message: 'Jiang Cheng doesn’t restrict people. He tells them to get lost directly.', buttons: [{ text: 'Fair', style: 'cancel' }] }) },
          { text: 'Block', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Block ' + id + '?', message: id === 'yiling_radish_king' ? 'Jiang Cheng has blocked Wei Wuxian 14 times. He always unblocks him within the hour. Leave it.' : 'They won’t be able to find your profile, posts or story on Wavelet.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onTap: () => JC.ui.toast('Blocked ' + id) }] }) },
        ] });
      }
      function shareProfile(id) {
        JC.ui.share({ title: '@' + id + ' on Wavelet', subtitle: 'wavelet.app/' + id, art: typeof D.user(id).avatar === 'string' ? D.user(id).avatar : undefined, icon: 'person.crop.circle', payload: { kind: 'link', text: '@' + id, url: 'https://wavelet.app/' + id } });
      }
      function discover() {
        const s = JC.ui.sheet({
          title: 'Discover people', detent: 'large', right: { text: 'Done' },
          content: () => JC.ui.list([{ header: 'Suggested for you', rows: D.users().filter((u) => u.id !== ME && !isFollowing(u.id) && u.id !== 'koi_watchers').map((u) => ({ leading: av(u.id, 44, { ring: true }), title: h('span.wv-row-h', u.id, u.verified ? JC.icon('wv.verified', { size: 12, cls: 'wv-verified' }) : null), subtitle: u.name, right: followBtn(u.id, { small: true }), onTap: () => { s.close(); app.openProfile(u.id); } })) }], { style: 'plain', cls: 'wv-plain' }),
        });
      }
      function followList(id, kind) {
        let ids;
        const all = D.users().map((u) => u.id).filter((x) => x !== id);
        if (kind === 'following') {
          if (id === ME) ids = all.filter((x) => isFollowing(x));
          else if (id === 'lanwangji') ids = ['yiling_radish_king'];
          else ids = all.filter((x) => (M_hash(id + x) % 3) === 0 && x !== 'koi_watchers');
        } else {
          ids = all.filter((x) => (M_hash(x + id) % 2) === 0 && x !== 'koi_watchers');
          if (id === ME) ids = ['rulan_jin', 'yiling_radish_king', 'zewujun', 'huaisang_fans', 'lan_sizhui', 'mianmian_studio', 'lotuspier_ymj'];
        }
        const u = D.user(id);
        const total = kind === 'followers' ? u.followers : u.following;
        const s = JC.ui.sheet({
          title: kind === 'followers' ? 'Followers' : 'Following', detent: 'large', right: { text: 'Done' },
          content: () => [
            JC.ui.list([{ rows: ids.map((x) => ({ leading: av(x, 44, { ring: true }), title: h('span.wv-row-h', x, D.user(x).verified ? JC.icon('wv.verified', { size: 12, cls: 'wv-verified' }) : null), subtitle: D.user(x).name, right: x === ME ? null : followBtn(x, { small: true }), onTap: () => { s.close(); app.openProfile(x); } })) }], { style: 'plain', cls: 'wv-plain' }),
            total > ids.length ? h('div.wv-likes-more', 'and ' + fmtN(total - ids.length) + ' more') : null,
          ],
        });
      }
      function editProfile() {
        const u = D.user(ME);
        const vals = { name: u.name || '', id: ME, pronouns: u.pronouns || '', bio: u.bio || '', link: u.link || '', gender: u.gender || 'Prefer not to say' };
        let avatar = u.avatar;
        const s = JC.ui.sheet({
          title: 'Edit profile', detent: 'large', cls: 'wv-editprof', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => {
            const patch = { name: vals.name.trim(), pronouns: vals.pronouns.trim(), bio: vals.bio.trim(), link: vals.link.trim(), gender: vals.gender, avatar };
            JC.store.update('wvusers', ME, patch);
            if (vals.id.trim() && vals.id.trim() !== ME) JC.ui.alert({ title: 'Username unavailable', message: 'Usernames can’t be changed from a phone that isn’t yours. (Also, @jiangwanyin has been his since 2015.)', buttons: [{ text: 'OK' }] });
            JC.ui.toast('Profile saved', { icon: 'checkmark' });
            scheduleRender(true);
          } },
          content: (sh) => {
            const avBox = h('div.wv-ep-av', JC.ui.avatar(avatarSpec(Object.assign({}, u, { avatar })), 92));
            const field = (k, label, o) => {
              const inp = JC.ui.input({ value: vals[k], placeholder: label, multiline: !!(o && o.multi), autoGrow: !!(o && o.multi), maxHeight: 120, onInput: (v) => { vals[k] = v; } });
              inp.classList.add('wv-ep-input');
              return h('div.wv-ep-row', h('div.wv-ep-k', label), inp);
            };
            return [
              h('div.wv-ep-top', avBox, h('div.wv-link', { onTap: () => JC.ui.actionSheet({ actions: [
                { text: 'Choose from library', onTap: () => pickPhoto((art) => { avatar = art; sh.render(); }) },
                { text: 'Use lotus emoji', onTap: () => { avatar = { emoji: '🪷', grad: ['#d0bfff', '#7048e8'] }; sh.render(); } },
                { text: 'Remove current picture', style: 'destructive', onTap: () => { avatar = { initials: 'JW', grad: ['#c7c7cc', '#8e8e93'] }; sh.render(); } },
              ] }) }, 'Edit picture or avatar')),
              h('div.wv-ep-fields', field('name', 'Name'), field('id', 'Username'), field('pronouns', 'Pronouns'), field('bio', 'Bio', { multi: true }), field('link', 'Links'),
                h('div.wv-ep-row.tap', { onTap: () => JC.ui.actionSheet({ title: 'Gender', actions: ['Male', 'Female', 'Custom', 'Prefer not to say'].map((g) => ({ text: g, onTap: () => { vals.gender = g; sh.render(); } })) }) }, h('div.wv-ep-k', 'Gender'), h('div.wv-ep-v', vals.gender), JC.icon('chevron.right', { size: 12, weight: 2.6 }))),
              JC.ui.list([{ rows: [
                { title: 'Switch to professional account', tinted: true, onTap: () => JC.ui.alert({ title: 'Professional account', message: 'YMJ already has an official account (@lotuspier_ymj). Tang Mei runs it. Tang Mei would like you to leave it alone.', buttons: [{ text: 'OK' }] }) },
                { title: 'Personal information settings', tinted: true, onTap: () => JC.ui.alert({ title: 'Personal information', message: 'Email: jiang.cheng@lotuspier.yunmeng\nPhone: +86 555 0716 0515\nBirthday: May 15, 1992', buttons: [{ text: 'OK' }] }) },
              ] }]),
            ];
          },
        });
        return s;
      }
      function settingsSheet() {
        const s = JC.ui.sheet({
          title: 'Settings and activity', detent: 'large', cls: 'wv-settings', right: { text: 'Done' },
          content: (sh) => [
            JC.ui.search({ placeholder: 'Search', onInput: () => {} }),
            JC.ui.list([{ header: 'Your account', rows: [{ icon: { glyph: 'person.crop.circle', bg: 'var(--gray)' }, title: 'Accounts Center', subtitle: 'Password, security, personal details', chevron: true, onTap: () => JC.ui.alert({ title: 'Accounts Center', message: 'Changing Jiang Cheng’s password requires Jiang Cheng’s password. You don’t have it. (It isn’t A-Ling’s birthday this time.)', buttons: [{ text: 'OK' }] }) }] }]),
            JC.ui.list([{ header: 'How you use Wavelet', rows: [
              { icon: { glyph: 'wv.bookmark', bg: 'var(--indigo)' }, title: 'Saved', chevron: true, onTap: () => { s.close(); curNav().push(savedPage()); } },
              { icon: { glyph: 'wv.clock.arrow', bg: 'var(--teal)' }, title: 'Archive', chevron: true, onTap: () => { s.close(); curNav().push(archivePage()); } },
              { icon: { glyph: 'chart.line.uptrend.xyaxis', bg: 'var(--green)' }, title: 'Your activity', chevron: true, onTap: () => JC.ui.alert({ title: 'Your activity', message: 'Daily average: 4 minutes.\nMost visited profile: @rulan_jin (37 times this week).\nSecond most visited: @zewujun (it’s a lot).', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'bell.fill', bg: 'var(--red)' }, title: 'Notifications', chevron: true, onTap: () => JC.os.open('settings', { page: 'notifications' }) },
            ] }]),
            JC.ui.list([{ header: 'Who can see your content', rows: [
              { icon: { glyph: 'lock.fill', bg: 'var(--purple)' }, title: 'Private account', toggle: { on: D.user(ME).private !== false, onChange: (v) => { JC.store.update('wvusers', ME, { private: v }); if (!v) JC.ui.alert({ title: 'Public account?', message: 'Anyone could see Jiang Cheng’s three photos. Including @teaspiller_qh.', buttons: [{ text: 'Keep Private', style: 'default', onTap: () => { JC.store.update('wvusers', ME, { private: true }); sh.render(); } }, { text: 'Switch', style: 'destructive' }] }); } } },
              { icon: { glyph: 'star.fill', bg: 'var(--green)' }, title: 'Close Friends', detail: '0 people', chevron: true, onTap: () => JC.ui.alert({ title: 'Close Friends', message: 'Jiang Cheng’s Close Friends list is empty. (He has Tang Mei. And, under protest, a dog.)', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'nosign', bg: 'var(--red)' }, title: 'Blocked', detail: '1', chevron: true, onTap: () => JC.ui.alert({ title: 'Blocked accounts', message: '@radish.dad — blocked Mar 4, 2023.\n(Wei Wuxian’s old account. He made a new one the same day.)', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'circle.fill', bg: 'var(--green)' }, title: 'Activity status', toggle: { on: !!P('activeStatus'), onChange: (v) => P('activeStatus', v) } },
            ] }]),
            JC.ui.list([{ rows: [
              { title: 'Add account', tinted: true, onTap: () => JC.ui.alert({ title: 'Add account', message: 'One Jiang Cheng is plenty.', buttons: [{ text: 'OK' }] }) },
              { title: 'Log out ' + ME, destructive: true, onTap: () => JC.ui.alert({ title: 'Log out of ' + ME + '?', message: 'You don’t know his password. If you log out, you’re not getting back in.', buttons: [{ text: 'Stay Logged In', style: 'cancel' }] }) },
            ] }]),
          ],
        });
      }
      function accountsSheet() {
        JC.ui.sheet({
          title: 'Accounts', detent: 'medium', right: { text: 'Done' },
          content: () => JC.ui.list([{ rows: [
            { leading: av(ME, 44), title: ME, subtitle: 'Jiang Wanyin · private', check: true },
            { icon: { glyph: 'plus', bg: 'var(--fill)', color: 'var(--label)' }, title: 'Add Wavelet account', onTap: () => JC.ui.alert({ title: 'Add account', message: 'One Jiang Cheng is plenty.', buttons: [{ text: 'OK' }] }) },
          ] }]),
        });
      }
      function savedPage() {
        return mk({ title: 'Saved', cls: 'wv-saved', content: () => { const sv = pmap('saved'); return gridOf(allPosts().filter((p) => sv[p.id]), { title: 'Saved', empty: JC.ui.empty({ icon: 'wv.bookmark', title: 'Save', text: 'Save photos that you want to see again. No one is notified.' }) }); } });
      }
      function archivePage() {
        return mk({ title: 'Archive', cls: 'wv-saved', content: () => {
          const hidden = pmap('hiddenPosts');
          const arch = JC.store.all('posts').filter((p) => p.by === ME && hidden[p.id]);
          return [h('div.wv-cap-note', 'Only you can see archived posts. Tap one to show it on your profile again.'),
            arch.length ? h('div.wv-grid', arch.map((p) => h('div.wv-cell', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { pset('hiddenPosts', p.id, null); JC.ui.toast('Shown on profile'); scheduleRender(true); } }))) : JC.ui.empty({ icon: 'wv.clock.arrow', title: 'Nothing archived', text: 'Archived posts appear here.' })];
        } });
      }

      // ── tabs ──────────────────────────────────────────────────────────
      app.tabs = JC.ui.tabs(win.body, {
        tint: 'var(--wv-tint)',
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'search', title: 'Search', icon: 'magnifyingglass', root: () => searchPage() },
          { id: 'create', title: 'Create', icon: 'wv.plus.square', root: () => createPage() },
          { id: 'activity', title: 'Activity', icon: 'heart', root: () => activityPage() },
          { id: 'profile', title: 'Profile', icon: 'person.crop.circle', root: () => profilePage(ME, true) },
        ],
        active: 'home',
        onChange: (id) => { if (id === 'create') { const n = app.tabs.nav('create'); if (n && n.top()) n.top().render(); } },
      });

      function tabBadges() {
        const b = badgeCount();
        app.tabs.badge('activity', b.acts || 0);
        updateBadge();
      }

      // re-render visible pages when data changes
      let rT = 0;
      function scheduleRender(all) {
        clearTimeout(rT);
        rT = setTimeout(() => {
          cards.forEach((c) => { if (!c.isConnected) cards.delete(c); });
          ['home', 'search', 'create', 'activity', 'profile'].forEach((t) => {
            const nav = app.tabs.nav(t);
            if (!nav) return;
            const top = nav.top();
            if (top && (all || t === app.tabs.current())) {
              if (top.el.querySelector('.row.swiped')) return;
              top.render();
            }
          });
          tabBadges();
        }, 120);
      }
      let lastIds = '';
      offs.push(JC.store.on('posts', () => {
        const ids = allPosts().map((p) => p.id).join(',');
        if (ids !== lastIds) { lastIds = ids; scheduleRender(true); return; }
        cards.forEach((c) => { if (c.isConnected) c._update(); else cards.delete(c); });
      }));
      lastIds = allPosts().map((p) => p.id).join(',');
      offs.push(JC.store.on('wvact', () => tabBadges()));
      offs.push(JC.store.on('wvdms', () => { tabBadges(); const top = app.tabs.nav('home') && app.tabs.nav('home').top(); if (top && top.el.classList.contains('wv-inbox')) top.render(); }));
      offs.push(JC.store.on('wvusers', () => scheduleRender(false)));
      offs.push(JC.bus.on('story:reset', () => scheduleRender(true)));
      tabBadges();

      // ── intents ───────────────────────────────────────────────────────
      function intent(it) {
        if (!it) return;
        const pid = it.post || it.id;
        if (it.compose) {
          const c = it.compose === true ? {} : it.compose;
          const art = c.art || c.img || (c.kind === 'photo' ? c.art : null);
          if (art) createSel = art;
          createPrefill = c.text || '';
          app.tabs.select('create');
          const nav = app.tabs.nav('create');
          nav.popToRoot();
          setTimeout(() => { if (nav.top()) nav.top().render(); if (createPrefill || art) nav.push(captionPage()); }, 60);
          return;
        }
        if (it.dm) { app.tabs.select('home'); app.tabs.nav('home').push(dmPage(it.dm)); return; }
        if (it.user) { app.tabs.select('home'); app.openProfile(it.user); return; }
        if (it.tab) { app.tabs.select(it.tab); return; }
        if (pid) { app.tabs.select('home'); app.openPost(pid); }
      }

      return {
        intent,
        show() { scheduleRender(false); },
        hide() { if (app._overlay) app._overlay(); },
        back() {
          if (app._overlay) { app._overlay(); return true; }
          const ov = win.overlays;
          const b = ov.querySelectorAll('.ctx-back, .pmenu-back, .sheet-back');
          if (b.length) { b[b.length - 1].click(); return true; }
          return false;
        },
        destroy() { offs.forEach((f) => f()); clearTimeout(rT); },
      };
    },
  });

  // badge before the app is first opened
  JC.bus.on('boot', () => { try { updateBadge(); } catch (e) { /* ignore */ } });
})();
