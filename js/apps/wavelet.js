/* Ripple — Liyue's photo-sharing app (Instagram-style, 2026 layout: Home · Reels · DMs · Search · Profile).
   Childe has two accounts (@tartaglia public, @ajax.fishes private) with an account switcher. Feed + stories, reels,
   explore, profiles, DMs (notes, requests), activity, composer (photo picker, caption, location tag, tag people).
   Seeds: wavelet-data.js. Acts: post { id, text, art, loc, place, acct } · like { post, owner, acct } ·
   comment { post, text, owner, acct } · dm { to, text, acct } · story_view { user, frame } · photo_view { id, post }.
   Intents: { id } { post } { user } { compose } { dm } { tab }. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const W = (JC.wavelet = JC.wavelet || {});
  const OWN = ['tartaglia', 'ajax.fishes'];

  JC.appIcon.add('wavelet', () => `<svg ${JC.appIcon.W}><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2ec5d3"/><stop offset=".55" stop-color="#1c7ed6"/><stop offset="1" stop-color="#3b2fb8"/></linearGradient><radialGradient id="b" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="60" height="60" fill="url(#a)"/><rect width="60" height="60" fill="url(#b)"/><ellipse cx="30" cy="32" rx="22" ry="15" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4"/><ellipse cx="30" cy="32" rx="14.5" ry="9.6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.6"/><ellipse cx="30" cy="32" rx="6.6" ry="4.4" fill="none" stroke="#fff" stroke-width="2.8"/><path d="M30 10c-2.6 4.3-4.3 7-4.3 9.2a4.3 4.3 0 0 0 8.6 0c0-2.2-1.7-4.9-4.3-9.2z" fill="#fff"/></svg>`);

  JC.icon.add({
    'rp.plus.square': '<rect x="3.5" y="3.5" width="17" height="17" rx="5.5"/><path d="M12 8v8M8 12h8"/>',
    'rp.bookmark': '<path d="M6.5 3.5h11v17l-5.5-4.3-5.5 4.3z"/>',
    'rp.bookmark.fill': '<path d="M6.5 3.5h11v17l-5.5-4.3-5.5 4.3z" fill="currentColor"/>',
    'rp.comment': '<path d="M20.6 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.4a8.5 8.5 0 1 1 15.7-4.4z"/>',
    'rp.send': '<path d="M21 3.3 10 14.2M21 3.3l-6.4 17.4-4.6-6.5-6.5-4.6z"/>',
    'rp.repost': '<path d="M17 3.5l3 3-3 3"/><path d="M4 11.5v-1a4 4 0 0 1 4-4h12"/><path d="M7 20.5l-3-3 3-3"/><path d="M20 12.5v1a4 4 0 0 1-4 4H4"/>',
    'rp.grid': '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17"/>',
    'rp.reels': '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M3.5 8.5h17M8.5 3.7l2.6 4.7M13.6 3.7l2.6 4.7"/><path d="M10.2 11.6v5l4.3-2.5z" fill="currentColor"/>',
    'rp.tagged': '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="12" cy="10.2" r="2.9"/><path d="M6.8 20.2c.9-2.9 2.8-4.4 5.2-4.4s4.3 1.5 5.2 4.4"/>',
    'rp.verified': '<path fill="currentColor" stroke="none" d="m12 2.4 2.4 1.7 2.9-.1 1 2.7 2.3 1.8-.9 2.8.9 2.8-2.3 1.8-1 2.7-2.9-.1L12 21.6l-2.4-1.7-2.9.1-1-2.7-2.3-1.8.9-2.8-.9-2.8 2.3-1.8 1-2.7 2.9.1z"/><path d="m8.4 12.2 2.4 2.4 4.9-5" stroke="#fff" stroke-width="2.1" fill="none"/>',
    'rp.camera': '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.3" r="3.6"/>',
    'rp.ripple': '<ellipse cx="12" cy="13.5" rx="9" ry="5.5"/><ellipse cx="12" cy="13.5" rx="4.6" ry="2.6"/><path d="M12 2.5c-1.4 2.3-2.3 3.8-2.3 5a2.3 2.3 0 0 0 4.6 0c0-1.2-.9-2.7-2.3-5z" fill="currentColor"/>',
    'rp.person.plus': '<circle cx="10" cy="8" r="3.6"/><path d="M3.5 19.5c.7-3.6 3.2-5.5 6.5-5.5s5.8 1.9 6.5 5.5M18.5 8v6M15.5 11h6"/>',
    'rp.clock.arrow': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3h3"/><path d="M12 8v4.3l2.8 1.7"/>',
    'rp.lock': '<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    'rp.hash': '<path d="M9.5 3.5 7.5 20.5M16.5 3.5l-2 17M4 8.5h16.5M3.5 15.5H20"/>',
    'rp.music': '<path d="M9 18.5V6l11-2.5v12"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>',
  });

  // ── state & data helpers ──────────────────────────────────────────────────
  function P(k, v) {
    if (v === undefined) { const it = JC.store.get('wvstate', k); return it ? it.v : undefined; }
    JC.store.add('wvstate', { id: k, v });
    return v;
  }
  function pmap(k) { return Object.assign({}, P(k) || {}); }
  function pset(k, key, val) { const o = pmap(k); if (val == null || val === false) delete o[key]; else o[key] = val; P(k, o); }
  const ME = () => (OWN.includes(P('acct')) ? P('acct') : 'tartaglia');
  const D = {
    user: (id) => JC.store.get('wvusers', id) || { id, name: id, bio: '', followers: 0, following: 0, unknown: true },
    users: () => JC.store.all('wvusers'),
    post: (id) => JC.store.get('posts', id),
    dm: (handle, acct) => JC.store.get('wvdms', (acct || ME()) + ':' + handle),
  };
  W.data = D;
  W.me = ME;
  const now = () => JC.time.now();
  const flag = (k) => { try { return !!JC.story.flag(k); } catch (e) { return false; } };
  const chapter = () => { try { return (JC.story.api() || {}).chapter || null; } catch (e) { return null; } };
  function condOK(p) {
    const c = p.cond;
    if (!c) return true;
    if (c.flag && !flag(c.flag)) return false;
    if (c.after && now() < JC.time.parse(c.after)) return false;
    return true;
  }
  function visible(p) { return !!p && !p.hidden && !pmap('hiddenPosts')[p.id] && (p.t || 0) <= now() + 60000 && condOK(p); }
  function allPosts() { return JC.store.all('posts').filter(visible).slice().sort((a, b) => (b.t || 0) - (a.t || 0)); }
  W.posts = allPosts;
  const postsBy = (id) => allPosts().filter((p) => p.by === id);
  const tagsIn = (text) => (String(text || '').match(/#[\w一-鿿]+/g) || []).map((t) => t.toLowerCase());
  const postsWithTag = (tag) => { tag = tag.toLowerCase(); return allPosts().filter((p) => tagsIn(p.text).includes(tag)); };
  function trending() {
    const t = ['#RiteOfParting', '#FeiyunMarket', '#NorthlandBank', '#wangshengfashion'];
    if (now() >= JC.time.parse('+2 09:00') || chapter() === 'sun_rite') t.unshift('#FarewellRexLapis');
    if (flag('osial_sent') && now() >= JC.time.parse('+2 23:05')) t.unshift('#HarborBlackout');
    return t;
  }
  function isFollowing(id) {
    if (id === ME()) return true;
    const f = pmap('follow:' + ME());
    if (f[id] != null) return f[id] === 1;
    return (D.user(id).fby || []).includes(ME());
  }
  const followsMe = (id) => (D.user(id).follows || []).includes(ME());
  const isOwn = (id) => OWN.includes(id);

  function avatarSpec(u) {
    if (!u) return { initials: '?', grad: ['#c7c7cc', '#8e8e93'] };
    if (typeof u.avatar === 'string') return { art: u.avatar, initials: String(u.name || u.id).slice(0, 2).toUpperCase(), grad: ['#a5d8ff', '#1c7ed6'] };
    if (u.avatar && typeof u.avatar === 'object') return u.avatar;
    if (u.contact && JC.contacts.get(u.contact)) return JC.contacts.get(u.contact).avatar;
    return { initials: String(u.id || '?').replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase() || '?', grad: ['#c7c7cc', '#8e8e93'] };
  }
  function storyOf(id) { const u = D.user(id); const n = now(); return (u.story || []).filter((f) => f && f.art && f.t <= n && n - f.t < 86400e3); }
  function storySeen(id) { const st = storyOf(id); const s = pmap('seen'); return !st.length || st.every((f) => s[id + ':' + f.t]); }
  function av(id, size, o) {
    o = o || {};
    const a = JC.ui.avatar(avatarSpec(D.user(id)), size);
    if (!o.ring) return a;
    const has = storyOf(id).length > 0;
    return h('div.rp-ring', { class: { new: has && !storySeen(id), seen: has && storySeen(id) }, style: { '--s': size + 'px' } }, a);
  }
  function fmtN(n) {
    n = n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return n.toLocaleString('en-US');
  }
  function ago(t, long) {
    const d = Math.max(0, (now() - (t || 0)) / 1000);
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
  /** location tags (story place ids) */
  const LOCS = ['player-home', 'pier7', 'northland', 'apartment', 'wangsheng', 'heyu', 'liuli', 'yujing', 'wanmin-rest', 'third-round', 'alcor', 'jade', 'golden-house', 'airport', 'wangshu', 'qingce'];
  const locName = (id) => (id === 'player-home' ? 'Chihu Rock, Liyue Harbor' : JC.r7 ? JC.r7.fullName(id) : id);
  const placeIdOf = (name) => { const n = String(name || '').toLowerCase(); if (!n || !JC.r7) return null; return JC.r7.ids().find((id) => { const p = JC.r7.place(id); return p && (p.name.toLowerCase() === n || (p.short || '').toLowerCase() === n || n.startsWith(p.name.toLowerCase())); }) || null; };

  // ── canned replies (DMs, comment replies) ─────────────────────────────────
  const REPLY = {
    wangsheng_hutao: ['mr harbinger!! 👻', 'the director is busy but the director will allow it', 'a poem for u: roses are red / coffins are brown / hurry up and / come by the parlor in town 👻', 'did u know: 2nd coffin half price 🦋', 'hehe ok 👻'],
    'traveler.l': ['ok', 'paimon says hi (she’s eating)', 'why are you on ripple at this hour', 'noted.', 'tuesday. don’t be late.'],
    emergencyfood: ['PAIMON SAW THAT', 'is this about food. it should be about food 🍡', 'CHILDE!!! ⭐', 'paimon is busy (eating)', 'HOTPOT. TOMORROW. PROMISE.'],
    'crux.captain': ['ha! ⚓', 'save it for the deck, kid', 'you talk a lot for someone who lost 14 to 11', 'see you on the alcor'],
    'yunjin.opera': ['Thank you, Director.', 'How kind of you.', 'I hope the second act pleases your guest.'],
    wanmin_chef: ['🔥🔥🔥', 'guoba says hi 🐼', 'come eat!! i’m testing a new chili', 'ooh!! ok!!'],
    kabukimono: ['so you can type.', 'interesting.', 'the fish man is awake. how nice for everyone.', 'boring.', 'you sound different tonight, eleventh.'],
    'liyueharbor.news': ['Thank you for your message. Send tips to tips@lhnews.ly.'],
    northlandbank: ['Thank you for contacting Northland Bank. For account questions, please use the Northland app.'],
    'lyuba.cicin': ['sir?? 🧊', 'yes sir', 'the aquarium is fine sir. probably.'],
    'anya.volt': ['sir it’s late', 'copy that'],
    shellsandsparkles: ['omg he replied 😭', 'thank you!!!! 🐚'],
    _: ['🙂', 'thanks!'],
  };
  const replyIdx = {};
  function canned(id) {
    const arr = REPLY[id] || REPLY._;
    replyIdx[id] = replyIdx[id] == null ? Math.floor(Math.random() * arr.length) : (replyIdx[id] + 1) % arr.length;
    return arr[replyIdx[id]];
  }

  // ── activity & badges ─────────────────────────────────────────────────────
  function addActivity(a, notify) {
    const it = JC.store.add('wvact', Object.assign({ acct: ME(), t: now(), read: false }, a), { front: true });
    if (notify) {
      const p = a.post ? D.post(a.post) : null;
      JC.notify.push({ app: 'wavelet', title: 'Ripple', subtitle: '@' + it.acct, body: notify, art: p ? p.art : undefined, open: { app: 'wavelet', intent: a.post ? { post: a.post } : a.dm ? { dm: a.dm } : { user: a.by } } });
    }
    return it;
  }
  function badgeCount(acct) {
    const acts = JC.store.all('wvact').filter((a) => !a.read && (!acct || (a.acct || 'tartaglia') === acct)).length;
    const dms = JC.store.all('wvdms').filter((d) => !d.request && d.unread && (!acct || d.acct === acct)).length;
    return { acts, dms, total: acts + dms };
  }
  function updateBadge() { JC.notify.badge('wavelet', badgeCount().total); }
  W.updateBadge = updateBadge;

  /** posts that appear because of the story (lilies, pelmeni…) take the moment they appear as their time */
  function reveal() {
    const done = pmap('revealed');
    JC.store.all('posts').forEach((p) => {
      if (!p.cond || done[p.id] || !condOK(p)) return;
      if (p.cond.flex) JC.store.update('posts', p.id, { t: now() - 60000, comments: (p.comments || []).map((c, i) => Object.assign({}, c, { t: now() + (i + 1) * 90000 })) });
      pset('revealed', p.id, 1);
      if (p.cond.flex || p.cond.flag) JC.notify.push({ app: 'wavelet', title: 'Ripple', body: p.by + ' shared a post.', art: p.art, open: { app: 'wavelet', intent: { post: p.id } } });
    });
  }
  JC.bus.on('story:fx', () => { try { reveal(); } catch (e) { console.error('[ripple] reveal', e); } });
  JC.bus.on('minute', () => { try { reveal(); } catch (e) { /* ignore */ } });

  // likes / comments / follows
  function toggleLike(pid, on) {
    const p = D.post(pid);
    if (!p) return;
    const v = on == null ? !p.liked : !!on;
    if (v === !!p.liked) return;
    JC.store.update('posts', pid, { liked: v, likes: Math.max(0, (p.likes || 0) + (v ? 1 : -1)) });
    if (v) JC.story.act('like', { post: pid, owner: p.by, art: p.art, acct: ME() });
  }
  function toggleSave(pid) {
    const on = !pmap('saved')[pid];
    pset('saved', pid, on ? now() : null);
    JC.ui.toast(on ? 'Saved' : 'Removed from saved', { icon: on ? 'rp.bookmark.fill' : 'rp.bookmark' });
    return on;
  }
  function addComment(pid, text) {
    const p = D.post(pid);
    if (!p || !text) return;
    JC.store.update('posts', pid, { comments: (p.comments || []).concat({ by: ME(), text, t: now() }) });
    JC.story.act('comment', { post: pid, text, owner: p.by, acct: ME() });
    if (!isOwn(p.by) && REPLY[p.by] && p.by !== 'balladeer' && Math.random() < 0.8) {
      const me = ME();
      setTimeout(() => {
        const cur = D.post(pid);
        if (!cur) return;
        const line = '@' + me + ' ' + canned(p.by);
        JC.store.update('posts', pid, { comments: (cur.comments || []).concat({ by: p.by, text: line, t: now() }) });
        JC.store.add('wvact', { acct: me, kind: 'reply', by: p.by, post: pid, text: line, t: now(), read: false }, { front: true });
        JC.notify.push({ app: 'wavelet', title: 'Ripple', subtitle: '@' + me, body: p.by + ' replied to your comment: ' + line, art: cur.art, open: { app: 'wavelet', intent: { post: pid } } });
      }, 4000 + Math.random() * 5000);
    }
  }
  function setFollow(id, on) {
    const u = D.user(id);
    if (isFollowing(id) === on) return;
    pset('follow:' + ME(), id, on ? 1 : 0);
    if (!u.unknown) JC.store.update('wvusers', id, { followers: Math.max(0, (u.followers || 0) + (on ? 1 : -1)) });
    const me = D.user(ME());
    JC.store.update('wvusers', ME(), { following: Math.max(0, (me.following || 0) + (on ? 1 : -1)) });
  }
  function followBtn(id, o) {
    o = o || {};
    const b = h('div.rp-btn', { class: { small: !!o.small } });
    const draw = () => {
      const f = isFollowing(id);
      const req = pmap('requested:' + ME())[id];
      b.textContent = f ? 'Following' : req ? 'Requested' : followsMe(id) ? 'Follow back' : 'Follow';
      b.classList.toggle('primary', !f && !req);
    };
    JC.ui.onTap(b, (e) => {
      e.stopPropagation();
      if (isFollowing(id)) { JC.ui.actionSheet({ title: '@' + id, actions: [{ text: 'Unfollow', style: 'destructive', onTap: () => { setFollow(id, false); draw(); } }] }); return; }
      const reqs = pmap('requested:' + ME());
      if (D.user(id).private && !reqs[id]) { pset('requested:' + ME(), id, 1); draw(); JC.ui.toast('Follow request sent', { icon: 'rp.person.plus' }); return; }
      if (reqs[id]) { pset('requested:' + ME(), id, null); draw(); return; }
      setFollow(id, true);
      JC.audio.haptic && JC.audio.haptic(8);
      draw();
    });
    draw();
    return b;
  }

  // ── rich text (@mentions, #tags) ──────────────────────────────────────────
  function rich(app, text) {
    const out = [];
    const re = /([@#][\w一-鿿.]+)/g;
    const s = String(text || '');
    let last = 0, m;
    while ((m = re.exec(s))) {
      const tok = m[1].replace(/\.+$/, '');
      if (m.index > last) out.push(s.slice(last, m.index));
      if (tok[0] === '@') out.push(h('span.rp-mention', { onTap: (e) => { e.stopPropagation(); app.openProfile(tok.slice(1)); } }, tok));
      else out.push(h('span.rp-tag', { onTap: (e) => { e.stopPropagation(); app.openTag(tok); } }, tok));
      last = m.index + tok.length;
      re.lastIndex = last;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  function photoList() {
    let arr = [];
    try { arr = JC.store.all('photos') || []; } catch (e) { arr = []; }
    arr = arr.filter((p) => p && p.art && p.kind !== 'video' && (p.t || 0) <= now() + 60000 && !(p.albums || []).includes('deleted'));
    if (!arr.length) arr = ['p_zl_pier', 'p_pier7_rod', 'p_liuli_dinner', 'p_harbor_day', 'p_bluefin', 'p_catch_1', 'p_catch_2', 'p_rod_gift', 'p_yujing_lanterns', 'p_hotpot_crew', 'p_teucer_plane', 'p_siblings_snow', 'p_morepesok', 'p_northland_lobby', 'p_alcor_deck', 'p_wanmin_kitchen'].map((art, i) => ({ id: 'rpp_' + art, art, t: now() - i * 9e6 }));
    return arr.slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  }

  // ═════════════════════════════════════════════════════════════════════════
  JC.app({
    id: 'wavelet',
    name: 'Ripple',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-wavelet');
      win.el.classList.add('rpapp');
      const app = { win };
      const cards = new Set();
      const offs = [];
      let feedMode = 'all';

      function mk(o) { return JC.ui.page(Object.assign({}, o, { onShow: (pg) => { if (app.tabs) app.tabs.hideBar(!!o.hideBar); if (o.onShow) o.onShow(pg); } })); }
      const curNav = () => app.tabs.nav();
      app.openProfile = (id) => { if (id === ME() && app.tabs.current() !== 'profile') { app.tabs.select('profile'); return; } curNav().push(profilePage(id)); };
      app.openPost = (pid, title) => { if (!D.post(pid) || !visible(D.post(pid))) { JC.ui.toast('This post isn’t available'); return; } curNav().push(postPage(pid, title)); };
      app.openTag = (tag) => curNav().push(tagPage(tag));
      app.openDM = (id) => { app.tabs.select('dms'); app.tabs.nav('dms').push(dmPage(id)); };
      app.openActivity = () => curNav().push(activityPage());

      // ── post card ─────────────────────────────────────────────────────
      function postCard(p, o) {
        o = o || {};
        const pid = p.id;
        const el = h('div.rp-post', { data: { pid } });
        const ratio = U.clamp(JC.art.ratio(p.art) || 1, 0.8, 1.91);
        const u = D.user(p.by);
        const head = h('div.rp-post-head',
          h('div.rp-post-av', { onTap: () => (storyOf(p.by).length && !storySeen(p.by) ? app.openStories(p.by) : app.openProfile(p.by)) }, av(p.by, 34, { ring: true })),
          h('div.rp-post-who', { onTap: () => app.openProfile(p.by) },
            h('div.rp-post-handle', h('span', p.by), u.verified ? JC.icon('rp.verified', { size: 13, cls: 'rp-verified' }) : null, o.suggested ? h('span.rp-sugg', ' · Suggested') : null),
            p.place ? h('div.rp-post-place', { onTap: (e) => { e.stopPropagation(); app.openPlace(p.place); } }, p.place) : p.reel ? h('div.rp-post-place', JC.icon('rp.music', { size: 10 }), ' Original audio') : null),
          !isOwn(p.by) && !isFollowing(p.by) && !o.noFollow ? h('div.rp-post-follow', { onTap: (e) => { e.stopPropagation(); if (D.user(p.by).private) { pset('requested:' + ME(), p.by, 1); JC.ui.toast('Follow request sent'); } else setFollow(p.by, true); e.currentTarget.remove(); } }, 'Follow') : null,
          h('div.rp-post-more', { onTap: () => postMenu(pid) }, JC.icon('ellipsis', { size: 20 })));
        const img = h('div.rp-media-img', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` } });
        const burst = h('div.rp-burst', JC.icon('heart.fill', { size: 96 }));
        const media = h('div.rp-media', { style: { aspectRatio: String(ratio) } }, img, burst, p.reel ? h('div.rp-media-badge', JC.icon('rp.reels', { size: 18 })) : null);
        let lastTap = 0, tapT = 0;
        JC.ui.onTap(media, () => {
          const n = performance.now();
          if (n - lastTap < 300) {
            clearTimeout(tapT); lastTap = 0;
            toggleLike(pid, true);
            burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go');
            JC.audio.haptic && JC.audio.haptic(10);
            return;
          }
          lastTap = n;
          tapT = setTimeout(() => lightbox(D.post(pid) || p), 300);
        });
        const heart = h('div.rp-act.like', { onTap: () => { toggleLike(pid); JC.audio.haptic && JC.audio.haptic(6); } });
        const cmt = h('div.rp-act', { onTap: () => app.openComments(pid) }, JC.icon('rp.comment', { size: 24, weight: 1.9 }));
        const rep = h('div.rp-act', { onTap: () => { const on = !pmap('reposts')[pid]; pset('reposts', pid, on ? 1 : null); JC.ui.toast(on ? 'Reposted to your followers' : 'Repost removed', { icon: 'rp.repost' }); update(); } });
        const send = h('div.rp-act', { onTap: () => app.sharePost(pid) }, JC.icon('rp.send', { size: 23, weight: 1.9 }));
        const save = h('div.rp-act.save', { onTap: () => { toggleSave(pid); update(); } });
        const likeN = h('span.rp-act-n'), cmtN = h('span.rp-act-n');
        const acts = h('div.rp-acts', h('div.rp-act-grp', heart, likeN), h('div.rp-act-grp', cmt, cmtN), rep, send, h('div.spacer'), save);
        const likes = h('div.rp-likes', { onTap: () => likesSheet(pid) });
        const cap = h('div.rp-cap'), cmts = h('div.rp-cmts'), time = h('div.rp-time');
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
          rep.innerHTML = '';
          rep.appendChild(JC.icon('rp.repost', { size: 23, weight: 1.9 }));
          rep.classList.toggle('on', !!pmap('reposts')[pid]);
          save.innerHTML = '';
          save.appendChild(JC.icon(pmap('saved')[pid] ? 'rp.bookmark.fill' : 'rp.bookmark', { size: 23, weight: 1.9 }));
          likes.innerHTML = '';
          if (q.hideLikes && isOwn(q.by)) likes.append('Liked by ', h('b', 'others'));
          else if (q.likes) {
            const friend = q.liked ? null : (q.comments || []).map((c) => c.by).find((b) => !isOwn(b) && b !== q.by && isFollowing(b));
            if (q.liked && q.likes > 1) likes.append('Liked by ', h('b', 'you'), ' and ', h('b', fmtN(q.likes - 1) + (q.likes - 1 === 1 ? ' other' : ' others')));
            else if (friend && q.likes > 1) likes.append('Liked by ', h('b', friend), ' and ', h('b', fmtN(q.likes - 1) + ' others'));
            else likes.append(h('b', fmtN(q.likes) + (q.likes === 1 ? ' like' : ' likes')));
          }
          likes.hidden = !q.likes;
          cap.innerHTML = '';
          if (q.text) {
            const long = q.text.length > 110 && !capOpen;
            cap.append(h('b.rp-cap-by', { onTap: () => app.openProfile(q.by) }, q.by), ' ', ...rich(app, long ? q.text.slice(0, 100).replace(/\s+\S*$/, '') : q.text));
            if (long) cap.append('… ', h('span.rp-more', { onTap: () => { capOpen = true; update(); } }, 'more'));
          }
          cmts.innerHTML = '';
          if (nC) {
            cmts.appendChild(h('div.rp-viewall', { onTap: () => app.openComments(pid) }, nC === 1 ? 'View 1 comment' : 'View all ' + nC + ' comments'));
            const last = q.comments[nC - 1];
            cmts.appendChild(h('div.rp-cmt1', h('b', { onTap: () => app.openProfile(last.by) }, last.by), ' ', ...rich(app, last.text)));
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
        const own = isOwn(p.by);
        const saved = !!pmap('saved')[pid];
        const actions = own ? [
          { text: 'Edit', onTap: () => editCaption(pid) },
          { text: p.hideLikes ? 'Unhide like count' : 'Hide like count', onTap: () => JC.store.update('posts', pid, { hideLikes: !p.hideLikes }) },
          { text: p.noComments ? 'Turn on commenting' : 'Turn off commenting', onTap: () => { JC.store.update('posts', pid, { noComments: !p.noComments }); JC.ui.toast(p.noComments ? 'Commenting turned on' : 'Commenting turned off'); } },
          { text: 'Archive', onTap: () => { pset('hiddenPosts', pid, 1); JC.ui.toast('Moved to your archive', { icon: 'rp.clock.arrow' }); } },
          { text: 'Delete', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Delete post?', message: 'You can restore it from Recently Deleted within 30 days.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('posts', pid); JC.ui.toast('Post deleted', { icon: 'trash' }); } }] }) },
        ] : [
          { text: saved ? 'Remove from saved' : 'Save', onTap: () => toggleSave(pid) },
          { text: 'Copy link', onTap: () => { U.copy('https://ripple.ly/p/' + pid); JC.ui.toast('Link copied', { icon: 'link' }); } },
          { text: 'Share to…', onTap: () => shareOut(pid) },
          { text: isFollowing(p.by) ? 'Unfollow' : 'Follow', onTap: () => setFollow(p.by, !isFollowing(p.by)) },
          { text: 'About this account', onTap: () => aboutAccount(p.by) },
          { text: 'Not interested', onTap: () => { pset('hiddenPosts', pid, 1); JC.ui.toast('You’ll see fewer posts like this', { icon: 'eye.slash' }); } },
          { text: 'Report', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Report', message: p.by === 'kabukimono' ? 'Thanks for letting us know. This account has been reported 312 times this month. It does not appear to care.' : 'Thanks for letting us know. We review reports within 24 hours.', buttons: [{ text: 'OK' }] }) },
        ];
        JC.ui.actionSheet({ actions });
      }
      function aboutAccount(id) {
        const u = D.user(id);
        const joined = u.joined || { 'wangsheng_hutao': 'May 2023', 'traveler.l': 'September 2025', emergencyfood: 'September 2025', tartaglia: 'March 2024', 'ajax.fishes': 'January 2023', balladeer: 'January 2026', 'crux.captain': 'June 2019', 'yunjin.opera': 'April 2021' }[id] || 'August 2022';
        const based = u.based || ({ 'traveler.l': 'Mondstadt', emergencyfood: 'Mondstadt', 'ajax.fishes': 'Snezhnaya', northlandbank: 'Snezhnaya' }[id] || 'Liyue');
        JC.ui.sheet({
          title: 'About this account', detent: 'medium', right: { text: 'Done' },
          content: () => [
            h('div.rp-about-top', av(id, 76), h('div.rp-about-h', id), h('div.rp-about-s', 'To help keep our community authentic, we show information about accounts on Ripple.')),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'calendar', bg: 'var(--indigo)' }, title: 'Date joined', subtitle: joined },
              { icon: { glyph: 'location.fill', bg: 'var(--teal)' }, title: 'Account based in', subtitle: based },
              { icon: { glyph: 'person.fill', bg: 'var(--blue)' }, title: 'Former usernames', subtitle: u.formerly || 'None' },
            ] }]),
          ],
        });
      }
      function editCaption(pid) {
        const p = D.post(pid);
        const field = JC.ui.input({ multiline: true, value: p.text || '', placeholder: 'Write a caption…', autoGrow: true, maxHeight: 200 });
        field.classList.add('rp-edit-field');
        JC.ui.sheet({ title: 'Edit info', detent: 'large', left: { text: 'Cancel' }, right: { text: 'Done', onTap: () => { JC.store.update('posts', pid, { text: field.value.trim() }); JC.ui.toast('Post updated'); } }, content: () => [h('div.rp-edit', JC.art.el(p.art, { cls: 'rp-edit-img' }), field)] });
        setTimeout(() => field.focus(), 450);
      }
      function lightbox(p) {
        if (p.art) JC.story.act('photo_view', { id: p.art, post: p.id || null, app: 'wavelet' });
        const layer = JC.ui.layer();
        const el = h('div.rp-lightbox', JC.art.img(p.art, { cls: 'rp-lb-img' }), h('div.rp-lb-x', { onTap: () => close() }, JC.icon('xmark', { size: 18, weight: 2.6 })), h('div.rp-lb-cap', h('b', p.by), ' · ', ago(p.t, true)));
        layer.appendChild(el);
        U.anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
        U.drag(el, { axis: 'y', move: (e, pp) => { el.style.transform = `translateY(${Math.max(0, pp.dy)}px)`; }, end: (e, pp) => { if (pp.dy > 100) close(); else el.style.transform = ''; }, tap: () => close() });
        function close() { U.anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 }).then(() => el.remove()); app._overlay = null; }
        app._overlay = close;
      }
      function hash(s) { let x = 0; for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0; return x; }
      function likesSheet(pid) {
        const p = D.post(pid);
        const known = Array.from(new Set((p.comments || []).map((c) => c.by).filter((b) => b !== p.by && !isOwn(b))));
        D.users().forEach((u) => { if (known.length < 8 && u.id !== p.by && !isOwn(u.id) && !known.includes(u.id) && hash(u.id + pid) % 3 === 0) known.push(u.id); });
        if (p.liked) known.unshift(ME());
        JC.ui.sheet({
          title: 'Likes', detent: 'large', right: { text: 'Done' },
          content: () => [
            h('div.rp-likes-n', fmtN(p.likes || 0) + (p.likes === 1 ? ' like' : ' likes')),
            JC.ui.list([{ rows: known.map((id) => ({ leading: av(id, 44, { ring: true }), title: h('span.rp-row-h', id, D.user(id).verified ? JC.icon('rp.verified', { size: 12, cls: 'rp-verified' }) : null), subtitle: D.user(id).name, right: isOwn(id) ? null : followBtn(id, { small: true }), onTap: () => app.openProfile(id) })) }], { style: 'plain', cls: 'rp-plain' }),
            (p.likes || 0) > known.length ? h('div.rp-likes-more', 'and ' + fmtN((p.likes || 0) - known.length) + ' others') : null,
          ],
        });
      }

      // ── comments sheet ────────────────────────────────────────────────
      app.openComments = (pid) => {
        const p0 = D.post(pid);
        if (!p0) return;
        const listEl = h('div.rp-cm-list.scroll');
        const postBtn = h('div.rp-cm-post', { onTap: () => post() }, JC.icon('arrow.up', { size: 16, weight: 2.8 }));
        const field = JC.ui.input({ placeholder: 'Add a comment for ' + p0.by + '…', enterkey: 'send', onSubmit: () => post(), onInput: (v) => postBtn.classList.toggle('on', !!v.trim()) });
        field.classList.add('rp-cm-input');
        const emojis = h('div.rp-cm-emojis', ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😂', '🐟'].map((e) => h('div.rp-cm-emoji', { onTap: () => { field.value += e; postBtn.classList.add('on'); field.focus(); } }, e)));
        const bottom = p0.noComments ? h('div.rp-cm-off', 'Commenting has been turned off.') : h('div.rp-cm-bottom', emojis, h('div.rp-cm-row', av(ME(), 34), h('div.rp-cm-field', field, postBtn)));
        const s = JC.ui.sheet({ title: 'Comments', detent: 'large', cls: 'rp-cm-sheet', content: () => h('div.rp-cm', listEl, bottom) });
        function render() {
          const p = D.post(pid);
          if (!p) return;
          listEl.innerHTML = '';
          if (p.text) listEl.appendChild(cmItem({ by: p.by, text: p.text, t: p.t }, -1, true));
          (p.comments || []).filter((c) => (c.t || 0) <= now() + 60000).forEach((c, i) => listEl.appendChild(cmItem(c, i)));
          if (!(p.comments || []).length) listEl.appendChild(h('div.rp-cm-empty', h('b', 'No comments yet'), h('span', 'Start the conversation.')));
        }
        function cmItem(c, i, isCap) {
          const k = pid + ':' + i;
          const liked = pmap('cmLikes');
          const heartEl = isCap ? null : h('div.rp-cm-heart', { class: { on: !!liked[k] }, onTap: (e) => { e.stopPropagation(); const on = !pmap('cmLikes')[k]; pset('cmLikes', k, on ? 1 : null); heartEl.classList.toggle('on', on); heartEl.innerHTML = ''; heartEl.appendChild(JC.icon(on ? 'heart.fill' : 'heart', { size: 14 })); } }, JC.icon(liked[k] ? 'heart.fill' : 'heart', { size: 14 }));
          const el = h('div.rp-cm-item', { class: { cap: !!isCap } },
            h('div.rp-cm-av', { onTap: () => { s.close(); app.openProfile(c.by); } }, av(c.by, 34, { ring: true })),
            h('div.rp-cm-main',
              h('div.rp-cm-top', h('b', { onTap: () => { s.close(); app.openProfile(c.by); } }, c.by), h('span.rp-cm-t', c.t ? ago(c.t) : ''), c.by === p0.by && !isCap ? h('span.rp-cm-author', ' · Author') : null),
              h('div.rp-cm-text', ...rich(app, c.text)),
              isCap ? null : h('div.rp-cm-reply', { onTap: () => { field.value = '@' + c.by + ' '; postBtn.classList.add('on'); field.focus(); } }, 'Reply')),
            heartEl);
          if (!isCap) {
            JC.ui.contextMenu(el, () => ({ items: [
              { text: 'Reply', icon: 'arrowshape.turn.up.left', onTap: () => { field.value = '@' + c.by + ' '; field.focus(); } },
              { text: 'Copy', icon: 'doc.on.doc', onTap: () => { U.copy(c.text); JC.ui.toast('Copied', { icon: 'doc.on.doc' }); } },
              isOwn(c.by) ? { text: 'Delete', icon: 'trash', destructive: true, onTap: () => { const p = D.post(pid); const arr = (p.comments || []).slice(); arr.splice(i, 1); JC.store.update('posts', pid, { comments: arr }); render(); } }
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

      // ── share a post ──────────────────────────────────────────────────
      const linkFor = (pid) => 'https://ripple.ly/p/' + pid;
      function shareOut(pid) {
        const p = D.post(pid);
        JC.ui.share({ title: p.by + ' on Ripple', subtitle: 'ripple.ly', art: p.art, payload: { kind: 'link', title: p.by + ' on Ripple' + (p.text ? ': “' + p.text.slice(0, 60).trim() + (p.text.length > 60 ? '…' : '') + '”' : ''), text: (p.text || '').slice(0, 80), url: linkFor(pid), art: p.art } });
      }
      app.sharePost = (pid) => {
        const p = D.post(pid);
        if (!p) return;
        const picked = new Set();
        const people = JC.store.all('wvdms').filter((d) => d.acct === ME() && !d.request).map((d) => d.with).concat(['traveler.l', 'emergencyfood', 'wangsheng_hutao', 'wanmin_chef', 'crux.captain']).filter((x, i, a) => a.indexOf(x) === i && x !== p.by).slice(0, 9);
        const note = JC.ui.input({ placeholder: 'Write a message…', enterkey: 'send', onSubmit: () => send() });
        note.classList.add('rp-sh-note');
        const sendBar = h('div.rp-sh-send', { hidden: true }, note, h('div.rp-btn.primary.wide', { onTap: () => send() }, 'Send'));
        const grid = h('div.rp-sh-grid');
        const s = JC.ui.sheet({
          title: 'Share', detent: 'large', cls: 'rp-share',
          content: () => h('div.rp-sh', grid, h('div.rp-sh-apps.hscroll',
            shApp(h('div.rp-sh-ic', JC.icon('plus.circle.fill', { size: 26 })), 'Add to story', () => { s.close(); addToStory(p.art); }),
            shApp(h('div.rp-sh-ic', JC.icon('link', { size: 22 })), 'Copy link', () => { s.close(); U.copy(linkFor(pid)); JC.ui.toast('Link copied', { icon: 'link' }); }),
            shApp(h('div.rp-sh-ic.app', JC.appIcon('messages')), 'Messages', () => { s.close(); JC.os.open('messages', { compose: { url: linkFor(pid), title: p.by + ' on Ripple' + (p.text ? ': “' + p.text.slice(0, 60).trim() + (p.text.length > 60 ? '…' : '') + '”' : ''), art: p.art } }); }),
            shApp(h('div.rp-sh-ic', JC.icon('square.and.arrow.up', { size: 22 })), 'Share to…', () => { s.close(); shareOut(pid); }),
            shApp(h('div.rp-sh-ic', JC.icon('square.and.arrow.down', { size: 22 })), 'Download', () => { s.close(); JC.store.add('photos', { art: p.art, t: now(), albums: [], kind: 'photo', caption: 'Saved from Ripple' }, { front: true }); JC.ui.toast('Saved to Photos', { icon: 'square.and.arrow.down' }); })), sendBar),
        });
        function shApp(ic, label, fn) { return h('div.rp-sh-app', { onTap: fn }, ic, h('span', label)); }
        function draw() {
          grid.innerHTML = '';
          people.forEach((id) => grid.appendChild(h('div.rp-sh-p', { class: { on: picked.has(id) }, onTap: () => { if (picked.has(id)) picked.delete(id); else picked.add(id); draw(); } },
            h('div.rp-sh-avw', av(id, 64), h('div.rp-sh-check', JC.icon('checkmark', { size: 12, weight: 3.2 }))), h('div.rp-sh-name', D.user(id).name || id))));
          sendBar.hidden = !picked.size;
        }
        function send() {
          if (!picked.size) return;
          const text = note.value.trim();
          picked.forEach((id) => sendDM(id, { post: pid, text }));
          s.close();
          JC.ui.toast(picked.size === 1 ? 'Sent to ' + Array.from(picked)[0] : 'Sent to ' + picked.size + ' people', { icon: 'rp.send' });
        }
        draw();
      };

      // ── DMs ───────────────────────────────────────────────────────────
      const typingFor = {};
      function sendDM(id, o) {
        const acct = ME();
        const key = acct + ':' + id;
        const cur = JC.store.get('wvdms', key) || { id: key, acct, with: id, msgs: [], unread: 0 };
        const msgs = (cur.msgs || []).slice();
        if (o.post) msgs.push({ from: 'me', post: o.post, t: now() });
        if (o.art) msgs.push({ from: 'me', art: o.art, t: now() });
        if (o.text) msgs.push({ from: 'me', text: o.text, story: o.story, t: now() });
        JC.store.add('wvdms', Object.assign({}, cur, { msgs, request: false }));
        JC.story.act('dm', { to: id, text: o.text || '', post: o.post || null, art: o.art || null, acct, contact: D.user(id).contact || null });
        JC.audio.play('send');
        if (id === 'balladeer') { setTimeout(() => { const d = JC.store.get('wvdms', key); if (d) JC.store.update('wvdms', key, { seenAt: now() }); }, 6000); return; }
        if (!REPLY[id] && D.user(id).unknown) return;
        setTimeout(() => { typingFor[key] = true; JC.bus.emit('rp:typing', key); }, 900);
        setTimeout(() => {
          typingFor[key] = false;
          const d = JC.store.get('wvdms', key) || { id: key, acct, with: id, msgs: [] };
          const p = o.post ? D.post(o.post) : null;
          const reply = p && !o.text ? (p.by === id ? 'u sent me my own post??' : id === 'emergencyfood' ? 'PAIMON LIKES IT' : canned(id)) : canned(id);
          const viewing = app._dmOpen === key && JC.os.isOpen('wavelet');
          JC.store.add('wvdms', Object.assign({}, d, { msgs: (d.msgs || []).concat({ from: id, text: reply, t: now() }), unread: viewing ? 0 : (d.unread || 0) + 1 }));
          JC.bus.emit('rp:typing', key);
          if (!viewing) JC.notify.push({ app: 'wavelet', title: id, subtitle: 'Ripple · @' + acct, body: reply, open: { app: 'wavelet', intent: { dm: id } } });
          else JC.audio.play('receive');
          updateBadge();
        }, 2600 + Math.random() * 3500);
      }
      const NOTES = { emergencyfood: 'HOTPOT TMR 🔥', wangsheng_hutao: 'busy busy 👻', 'traveler.l': '…', 'crux.captain': 'sat 22:00 ⚓', wanmin_chef: 'new chili!! 🌶️', 'yunjin.opera': '🎭 matinee sat' };
      function inboxPage() {
        let q = '';
        let reqMode = false;
        const head = h('div.rp-acct', { onTap: () => accountsSheet() }, h('span'), JC.icon('chevron.down', { size: 12, weight: 2.6 }));
        const page = mk({
          title: '', cls: 'rp-inbox', left: [head],
          right: [JC.ui.navBtn({ icon: 'square.and.pencil', label: 'New message', onTap: () => newDM() })],
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); } },
          content: () => {
            head.firstChild.textContent = ME();
            const all = JC.store.all('wvdms').filter((d) => d.acct === ME());
            const main = all.filter((d) => !d.request).sort((a, b) => lastT(b) - lastT(a));
            const reqs = all.filter((d) => d.request);
            const arr = (reqMode ? reqs : main).filter((d) => !q || (d.with + ' ' + (D.user(d.with).name || '')).toLowerCase().includes(q.toLowerCase()));
            const myNote = P('note:' + ME());
            return [
              reqMode ? null : h('div.rp-notes.hscroll',
                h('div.rp-note.me', { onTap: () => editNote() }, h('div.rp-note-b', myNote || 'Note…'), av(ME(), 62), h('span', 'Your note')),
                Object.keys(NOTES).filter((id) => isFollowing(id)).map((id) => h('div.rp-note', { onTap: () => app.openDM(id) }, h('div.rp-note-b', NOTES[id]), av(id, 62), h('span', D.user(id).name.replace(/\s*\W+$/u, '') || id)))),
              reqMode ? h('div.rp-inbox-h', h('span', 'Message requests'), h('span.rp-link', { onTap: () => { reqMode = false; page.render(); } }, 'Done'))
                : h('div.rp-inbox-h', h('span', 'Messages'), h('span.rp-link', { onTap: () => { reqMode = true; page.render(); } }, 'Requests' + (reqs.length ? ' (' + reqs.length + ')' : ''))),
              reqMode ? h('div.rp-inbox-note', 'Open a chat to get more info about who’s messaging you. They won’t know you’ve seen it until you accept.') : null,
              arr.length ? JC.ui.list([{ rows: arr.map((d) => dmRow(d)) }], { style: 'plain', cls: 'rp-plain rp-dmrows' }) : JC.ui.empty({ icon: 'rp.send', title: reqMode ? 'No requests' : 'No messages', text: reqMode ? 'You don’t have any message requests.' : 'Messages you send and receive will appear here.' }),
            ];
          },
          onShow: () => page.render(),
        });
        function lastT(d) { const m = (d.msgs || [])[(d.msgs || []).length - 1]; return m ? m.t : 0; }
        function dmRow(d) {
          const m = (d.msgs || [])[(d.msgs || []).length - 1] || {};
          const prev = m.from === 'me' ? 'You: ' + (m.post ? 'sent a post' : m.art ? 'sent a photo' : m.text) : m.post ? 'Sent a post by ' + ((D.post(m.post) || { by: '…' }).by) : m.art ? 'Sent a photo' : m.text;
          return {
            leading: av(d.with, 54, { ring: true }),
            title: h('span.rp-dm-name', { class: { unread: !!d.unread } }, D.user(d.with).name || d.with),
            subtitle: h('span.rp-dm-prev', { class: { unread: !!d.unread } }, (prev || '') + ' · ' + ago(m.t)),
            right: h('div.rp-dm-right', d.unread ? h('i.rp-dot') : null, h('div.rp-dm-cam', { onTap: (e) => { e.stopPropagation(); JC.os.open('camera'); } }, JC.icon('rp.camera', { size: 22 }))),
            onTap: () => app.tabs.nav('dms').push(dmPage(d.with)),
            swipe: [{ text: 'Delete', color: 'var(--red)', icon: 'trash.fill', onTap: () => JC.ui.alert({ title: 'Delete chat?', message: 'This deletes the chat for you only.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onTap: () => { JC.store.remove('wvdms', d.id); page.render(); updateBadge(); } }] }) }],
            lead: [{ text: d.unread ? 'Read' : 'Unread', color: 'var(--blue)', icon: 'message.fill', onTap: () => { JC.store.update('wvdms', d.id, { unread: d.unread ? 0 : 1 }); page.render(); updateBadge(); } }],
          };
        }
        function editNote() {
          JC.ui.alert({ title: 'Share a note', message: 'Notes show above your profile picture in your followers’ inboxes for 24 hours.', input: { placeholder: 'Share a thought…', value: P('note:' + ME()) || '' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Share', style: 'default' }] }).then((x) => { if (x.index === 1) { P('note:' + ME(), String(x.value || '').trim().slice(0, 60) || null); page.render(); if (x.value) JC.ui.toast('Note shared', { icon: 'checkmark' }); } });
        }
        function newDM() {
          const s = JC.ui.sheet({
            title: 'New message', detent: 'large', left: { text: 'Cancel' },
            content: () => JC.ui.list([{ header: 'Suggested', rows: D.users().filter((u) => !isOwn(u.id) && isFollowing(u.id)).map((u) => ({ leading: av(u.id, 44), title: u.name || u.id, subtitle: u.id, onTap: () => { s.close(); setTimeout(() => app.tabs.nav('dms').push(dmPage(u.id)), 300); } })) }], { style: 'plain', cls: 'rp-plain' }),
          });
        }
        app.inboxPage = page;
        return page;
      }
      function dmPage(id) {
        const u = D.user(id);
        const acct = ME();
        const key = acct + ':' + id;
        const listEl = h('div.rp-dm-list');
        const typing = h('div.rp-dm-typing', { hidden: true }, av(id, 24), h('div.rp-dm-dots', h('i'), h('i'), h('i')));
        const field = JC.ui.input({ placeholder: 'Message…', enterkey: 'send', onSubmit: () => send(), onInput: (v) => comp.classList.toggle('has', !!v.trim()) });
        field.classList.add('rp-dm-input');
        const comp = h('div.rp-dm-comp',
          h('div.rp-dm-camb', { onTap: () => JC.os.open('camera') }, JC.icon('camera.fill', { size: 18 })),
          field,
          h('div.rp-dm-icons',
            h('div.rp-dm-ic', { onTap: () => JC.ui.toast('Voice messages need the account owner’s voice', { icon: 'mic.slash.fill' }) }, JC.icon('mic', { size: 22 })),
            h('div.rp-dm-ic', { onTap: () => pickPhoto((art) => sendDM(id, { art })) }, JC.icon('photo', { size: 22 })),
            h('div.rp-dm-ic', { onTap: () => { field.value += '😁'; comp.classList.add('has'); } }, JC.icon('face.smiling', { size: 22 }))),
          h('div.rp-dm-send', { onTap: () => send() }, 'Send'));
        const req = (JC.store.get('wvdms', key) || {}).request;
        const reqBar = h('div.rp-dm-req', { hidden: !req },
          h('div.rp-dm-req-t', h('b', id), ' wants to send you a message.'),
          h('div.rp-dm-req-btns',
            h('div.rp-btn', { onTap: () => JC.ui.alert({ title: 'Block ' + id + '?', message: 'They won’t be able to message you or find your profile.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onTap: () => { JC.store.remove('wvdms', key); updateBadge(); page.nav.pop(); } }] }) }, 'Block'),
            h('div.rp-btn', { onTap: () => { JC.store.remove('wvdms', key); updateBadge(); page.nav.pop(); } }, 'Delete'),
            h('div.rp-btn.primary', { onTap: () => { JC.store.update('wvdms', key, { request: false }); reqBar.hidden = true; comp.hidden = false; updateBadge(); } }, 'Accept')));
        comp.hidden = !!req;
        const headTitle = h('div.rp-dm-head', { onTap: () => app.openProfile(id) }, av(id, 30), h('div', h('div.rp-dm-hn', u.name || id), h('div.rp-dm-hs', id)));
        const page = mk({
          title: '', cls: 'rp-dm', bg: 'plain', hideBar: true,
          right: [JC.ui.glassGroup(
            JC.ui.navBtn({ icon: 'phone.fill', iconSize: 18, label: 'Call', onTap: () => call(false) }),
            JC.ui.navBtn({ icon: 'video.fill', iconSize: 19, label: 'Video', onTap: () => call(true) }))],
          content: [h('div.rp-dm-top', av(id, 88), h('div.rp-dm-tn', u.name || id), h('div.rp-dm-ts', id + ' · Ripple'), h('div.rp-dm-ts2', fmtN(u.followers) + ' followers · ' + postsBy(id).length + ' posts'), followsMe(id) ? h('div.rp-dm-ts2', 'Follows @' + acct) : null, h('div.rp-btn.small', { onTap: () => app.openProfile(id) }, 'View profile')), listEl, typing],
          footer: h('div.rp-dm-bottom', reqBar, comp),
          onShow: () => { app._dmOpen = key; markRead(); },
          onHide: () => { if (app._dmOpen === key) app._dmOpen = null; },
        });
        page.navbar.querySelector('.nav-title').replaceWith(headTitle);
        function call(video) {
          if (u.contact && u.contact !== 'me' && JC.contacts.get(u.contact)) JC.story.dial(u.contact, { video });
          else JC.ui.alert({ title: 'Can’t start call', message: id + ' isn’t available for calls on Ripple.', buttons: [{ text: 'OK' }] });
        }
        function markRead() { const d = JC.store.get('wvdms', key); if (d && d.unread) { JC.store.update('wvdms', key, { unread: 0 }); updateBadge(); } }
        function render() {
          const d = JC.store.get('wvdms', key) || { msgs: [] };
          listEl.innerHTML = '';
          let prevT = 0;
          (d.msgs || []).forEach((m, i) => {
            if (!prevT || m.t - prevT > 3600e3) listEl.appendChild(h('div.rp-dm-stamp', U.fmtStamp ? U.fmtStamp(m.t) : U.fmtTime(m.t)));
            prevT = m.t;
            const mine = m.from === 'me';
            const nx = d.msgs[i + 1];
            const lastRun = !nx || nx.from !== m.from;
            let bodyEl;
            if (m.post && D.post(m.post)) {
              const p = D.post(m.post);
              bodyEl = h('div.rp-dm-postcard', { onTap: () => app.openPost(p.id) }, h('div.rp-dm-pc-h', av(p.by, 24), h('b', p.by)), h('div.rp-dm-pc-img', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` } }), p.text ? h('div.rp-dm-pc-t', h('b', p.by), ' ', p.text) : null);
            } else if (m.art) bodyEl = h('div.rp-dm-photo', { style: { backgroundImage: `url("${JC.art.url(m.art)}")` }, onTap: () => lightbox({ art: m.art, by: mine ? acct : id, t: m.t }) });
            else if (m.text) bodyEl = h('div.rp-dm-b', m.story ? h('div.rp-dm-story', 'Replied to their story') : null, m.text);
            else return;
            listEl.appendChild(h('div.rp-dm-m', { class: { mine, last: lastRun } }, !mine ? (lastRun ? av(id, 28) : h('div.rp-dm-avsp')) : null, bodyEl));
          });
          const last = d.msgs && d.msgs[d.msgs.length - 1];
          if (last && last.from === 'me') listEl.appendChild(h('div.rp-dm-seen', d.seenAt || id !== 'balladeer' ? 'Seen' : 'Sent'));
          typing.hidden = !typingFor[key];
          requestAnimationFrame(() => { page.scroll.scrollTop = page.scroll.scrollHeight; });
        }
        function send() {
          const text = field.value.trim();
          if (!text) return;
          field.value = '';
          comp.classList.remove('has');
          sendDM(id, { text });
        }
        const off1 = JC.store.on('wvdms', () => { if (page.el.isConnected) { render(); if (app._dmOpen === key) markRead(); } });
        const off2 = JC.bus.on('rp:typing', (x) => { if (x === key) { typing.hidden = !typingFor[key]; if (typingFor[key]) page.scroll.scrollTop = page.scroll.scrollHeight; } });
        page.opts.onClose = () => { off1(); off2(); };
        render();
        return page;
      }
      function pickPhoto(fn, title) {
        const photos = photoList();
        const s = JC.ui.sheet({
          title: title || 'Recents', detent: 'large', left: { text: 'Cancel' }, cls: 'rp-pick',
          content: () => h('div.rp-grid.g4', photos.map((p) => h('div.rp-cell.sq', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { s.close(); fn(p.art); } }))),
        });
      }

      // ── stories ───────────────────────────────────────────────────────
      function addToStory(art) {
        const me = D.user(ME());
        JC.store.update('wvusers', ME(), { story: (me.story || []).concat({ art, text: '', t: now() }) });
        JC.story.act('post', { kind: 'story', art, text: '', loc: false, place: null, acct: ME() });
        JC.ui.toast('Added to your story', { icon: 'plus.circle.fill' });
        const acct = ME();
        const viewer = acct === 'tartaglia' ? 'kabukimono' : 'traveler.l';
        setTimeout(() => { JC.store.add('wvact', { acct, kind: 'storyview', by: viewer, t: now(), read: false }, { front: true }); JC.notify.push({ app: 'wavelet', title: 'Ripple', subtitle: '@' + acct, body: viewer + ' viewed your story.', open: { app: 'wavelet', intent: { tab: 'profile' } } }); }, 8000);
      }
      app.openStories = (startId, queue, so) => {
        so = so || {};
        const ids = queue && queue.length ? queue.slice() : [startId];
        let ui = Math.max(0, ids.indexOf(startId));
        let fi = 0;
        let elapsed = 0, last = 0, raf = 0, paused = false, downAt = 0;
        const DUR = 5200;
        const layer = JC.ui.layer();
        const bars = h('div.rp-st-bars');
        const headAv = h('div.rp-st-av'), headName = h('div.rp-st-name'), headT = h('div.rp-st-t');
        const media = h('div.rp-st-media');
        const cap = h('div.rp-st-cap');
        const reply = JC.ui.input({ placeholder: 'Send message', enterkey: 'send', onSubmit: () => sendReply(), onFocus: () => { paused = true; }, onBlur: () => { paused = false; } });
        reply.classList.add('rp-st-input');
        const likeBtn = h('div.rp-st-btn', { onTap: () => likeStory() }, JC.icon('heart', { size: 26 }));
        const foot = h('div.rp-st-foot', h('div.rp-st-field', reply), likeBtn, h('div.rp-st-btn', { onTap: () => { paused = true; JC.ui.share({ title: ids[ui] + '’s story', subtitle: 'Ripple', art: frames()[fi].art, payload: { kind: 'photo', art: frames()[fi].art } }); setTimeout(() => { paused = false; }, 1500); } }, JC.icon('rp.send', { size: 24 })));
        const head = h('div.rp-st-head', h('div.rp-st-who', { onTap: () => { close(); app.openProfile(ids[ui]); } }, headAv, headName, headT),
          h('div.rp-st-hbtn', { onTap: () => { paused = true; JC.ui.actionSheet({ actions: [{ text: 'Mute ' + ids[ui], onTap: () => JC.ui.toast('Stories muted') }, { text: 'About this account', onTap: () => aboutAccount(ids[ui]) }, { text: 'Report', style: 'destructive', onTap: () => JC.ui.toast('Story reported') }] }).then(() => { paused = false; }); } }, JC.icon('ellipsis', { size: 22 })),
          h('div.rp-st-hbtn', { onTap: () => close() }, JC.icon('xmark', { size: 22, weight: 2.2 })));
        const stage = h('div.rp-st-stage', media, cap);
        const el = h('div.rp-story', stage, bars, head, foot);
        layer.appendChild(el);
        U.anim(el, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: U.SPRING, fill: 'none' });
        const frames = () => (so.frames && ids[ui] === startId ? so.frames : storyOf(ids[ui]));
        function show() {
          const fr = frames();
          if (!fr.length) { close(); return; }
          fi = U.clamp(fi, 0, fr.length - 1);
          const f = fr[fi];
          bars.innerHTML = '';
          fr.forEach((_, i) => bars.appendChild(h('div.rp-st-bar', h('i', { style: { width: i < fi ? '100%' : '0%' } }))));
          media.style.backgroundImage = `url("${JC.art.url(f.art)}")`;
          cap.textContent = f.text || '';
          cap.hidden = !f.text;
          headAv.innerHTML = '';
          headAv.appendChild(av(ids[ui], 32));
          headName.textContent = ids[ui] === ME() ? 'Your story' : ids[ui];
          headT.textContent = ago(f.t);
          reply.placeholder = ids[ui] === ME() ? 'Viewers' : 'Reply to ' + ids[ui] + '…';
          likeBtn.innerHTML = '';
          const lk = !!pmap('stLikes')[ids[ui] + ':' + f.t];
          likeBtn.appendChild(JC.icon(lk ? 'heart.fill' : 'heart', { size: 26 }));
          likeBtn.classList.toggle('on', lk);
          if (!so.frames) { pset('seen', ids[ui] + ':' + f.t, 1); JC.story.act('story_view', { user: ids[ui], frame: fi, art: f.art }); }
          elapsed = 0;
        }
        function tick(n) {
          if (!el.isConnected) return;
          if (!last) last = n;
          if (!paused) elapsed += n - last;
          last = n;
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
          const f = frames()[fi];
          const k = ids[ui] + ':' + f.t;
          const on = !pmap('stLikes')[k];
          pset('stLikes', k, on ? 1 : null);
          likeBtn.innerHTML = '';
          likeBtn.appendChild(JC.icon(on ? 'heart.fill' : 'heart', { size: 26 }));
          likeBtn.classList.toggle('on', on);
          if (on && ids[ui] !== ME()) JC.audio.haptic && JC.audio.haptic(8);
        }
        function sendReply() {
          const text = reply.value.trim();
          if (!text) return;
          reply.value = '';
          reply.blur();
          if (ids[ui] === ME()) { JC.ui.toast('No viewers yet'); return; }
          sendDM(ids[ui], { text, story: true });
          JC.ui.toast('Message sent', { icon: 'rp.send' });
        }
        U.drag(stage, {
          down: () => { paused = true; downAt = performance.now(); },
          tap: (e) => { paused = false; if (performance.now() - downAt > 350) return; const r = stage.getBoundingClientRect(); if (e.clientX - r.left < r.width * 0.32) prev(); else next(); },
          move: (e, p) => { if (p.axis === 'y' && p.dy > 0) { el.style.transform = `translateY(${p.dy}px) scale(${1 - Math.min(0.15, p.dy / 1500)})`; el.style.borderRadius = '30px'; } },
          end: (e, p) => {
            paused = false;
            if (p.axis === 'y' && p.dy > 110) { close(); return; }
            if (p.axis === 'x' && p.dx < -60) { if (ui < ids.length - 1) { ui++; fi = 0; show(); } else close(); } else if (p.axis === 'x' && p.dx > 60) { if (ui > 0) { ui--; fi = 0; show(); } }
            el.style.transform = ''; el.style.borderRadius = '';
          },
        });
        function close() { cancelAnimationFrame(raf); app._overlay = null; U.anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.92)' }], { duration: 200 }).then(() => el.remove()); scheduleRender(true); }
        app._overlay = close;
        show();
        raf = requestAnimationFrame(tick);
      };
      function myStory() {
        if (storyOf(ME()).length) { JC.ui.actionSheet({ actions: [{ text: 'View your story', onTap: () => app.openStories(ME(), [ME()]) }, { text: 'Add to your story', onTap: () => pickPhoto((art) => addToStory(art), 'Add to story') }] }); return; }
        pickPhoto((art) => addToStory(art), 'Add to story');
      }

      // ── home ──────────────────────────────────────────────────────────
      function storiesRow() {
        const withStory = D.users().filter((u) => !isOwn(u.id) && storyOf(u.id).length && (isFollowing(u.id) || u.id === 'kabukimono'));
        withStory.sort((a, b) => (storySeen(a.id) ? 1 : 0) - (storySeen(b.id) ? 1 : 0));
        const ids = withStory.map((u) => u.id);
        return h('div.rp-stories.hscroll',
          h('div.rp-st-item.me', { onTap: () => myStory() }, h('div.rp-st-avw', av(ME(), 66, { ring: true }), h('div.rp-st-plus', JC.icon('plus', { size: 13, weight: 3 }))), h('div.rp-st-label', 'Your story')),
          ids.map((id) => h('div.rp-st-item', { onTap: () => app.openStories(id, ids) }, av(id, 66, { ring: true }), h('div.rp-st-label', { class: { seen: storySeen(id) } }, id))));
      }
      function feedPosts() {
        const all = allPosts();
        const recentOwn = (p) => isOwn(p.by) && p.by === ME() && now() - p.t < 86400e3 * 3;
        if (feedMode === 'favorites') { const fav = pmap('favs'); return { main: all.filter((p) => fav[p.by]), sugg: [] }; }
        const main = all.filter((p) => recentOwn(p) || (!isOwn(p.by) && isFollowing(p.by)));
        const cut = main.filter((p) => now() - p.t < 86400e3 * 30);
        const sugg = feedMode === 'all' ? all.filter((p) => !isOwn(p.by) && !isFollowing(p.by) && (!D.user(p.by).private) && now() - p.t < 86400e3 * 30).slice(0, 6) : [];
        return { main: cut.length >= 6 ? cut : main.slice(0, 12), sugg };
      }
      function suggestedPeople() {
        const ids = D.users().filter((u) => !isOwn(u.id) && !isFollowing(u.id) && !u.unknown).map((u) => u.id);
        if (!ids.length) return null;
        return h('div.rp-suggest', h('div.rp-sec-h', h('span', 'Suggested for you'), h('span.rp-link', { onTap: () => discover() }, 'See all')),
          h('div.rp-sug-row.hscroll', ids.slice(0, 6).map((id) => h('div.rp-sug', { onTap: () => app.openProfile(id) }, av(id, 76), h('b', id), h('span', followsMe(id) ? 'Follows you' : D.user(id).cat || 'Suggested for you'), followBtn(id, { small: true })))));
      }
      function homePage() {
        const logo = h('div.rp-logo', { onTap: (e) => JC.ui.menu(e.currentTarget, [
          { text: 'For you', icon: 'sparkles', checked: feedMode === 'all', onTap: () => { feedMode = 'all'; page.render(); } },
          { text: 'Following', icon: 'person.2.fill', checked: feedMode === 'following', onTap: () => { feedMode = 'following'; page.render(); } },
          { text: 'Favorites', icon: 'star', checked: feedMode === 'favorites', onTap: () => { feedMode = 'favorites'; page.render(); } },
        ]) }, JC.icon('rp.ripple', { size: 24, weight: 2.2, cls: 'rp-logo-ic' }), h('span', 'Ripple'), JC.icon('chevron.down', { size: 12, weight: 2.8 }));
        const createBtn = JC.ui.navBtn({ icon: 'plus', iconSize: 22, label: 'Create', onTap: () => openCreate() });
        const actBtn = JC.ui.navBtn({ icon: 'heart', iconSize: 21, label: 'Activity', onTap: () => app.openActivity() });
        const actDot = h('span.rp-nbadge');
        actBtn.appendChild(actDot);
        const page = mk({
          title: '', cls: 'rp-home', left: [createBtn], right: [actBtn],
          content: () => {
            const n = badgeCount(ME()).acts;
            actDot.textContent = n ? String(n) : '';
            actDot.hidden = !n;
            const { main, sugg } = feedPosts();
            const out = [storiesRow()];
            if (app._uploading) out.push(h('div.rp-uploading', JC.art.el(app._uploading, { cls: 'rp-up-thumb' }), h('div.rp-up-main', h('div', 'Posting to @' + ME() + '…'), h('div.rp-up-bar', h('i')))));
            main.forEach((p, i) => { out.push(postCard(p, { inFeed: true })); if (i === 2) { const s = suggestedPeople(); if (s) out.push(s); } });
            if (main.length) out.push(h('div.rp-allcaught', JC.icon('checkmark.circle.fill', { size: 34 }), h('b', 'You’re all caught up'), h('span', 'You’ve seen all new posts from accounts you follow.')));
            else out.push(JC.ui.empty({ icon: 'star', title: feedMode === 'favorites' ? 'No favorites yet' : 'Nothing to see', text: feedMode === 'favorites' ? 'Add accounts to Favorites from their profile menu.' : 'Follow people to see their posts here.' }));
            if (sugg.length) { out.push(h('div.rp-sec-h.big', h('span', 'Suggested posts'))); sugg.forEach((p) => out.push(postCard(p, { inFeed: true, suggested: true }))); }
            return out;
          },
        });
        page.navbar.querySelector('.nav-title').replaceWith(logo);
        app.homePage = page;
        return page;
      }
      function postPage(pid, title) {
        const p0 = D.post(pid);
        if (p0 && p0.art) JC.story.act('photo_view', { id: p0.art, post: pid, app: 'wavelet' });
        return mk({ title: title || (p0 && p0.reel ? 'Reel' : 'Post'), cls: 'rp-postpage', content: () => { const p = D.post(pid); return p ? [postCard(p, { open: true })] : JC.ui.empty({ icon: 'photo', title: 'Post unavailable', text: 'This post may have been deleted.' }); } });
      }
      app.openPlace = (name) => {
        const plid = placeIdOf(name);
        curNav().push(mk({
          title: name, cls: 'rp-place',
          content: () => {
            const ps = allPosts().filter((p) => p.place === name || (plid && placeIdOf(p.place) === plid));
            return [h('div.rp-place-top', h('div.rp-place-ic', JC.icon('mappin.fill', { size: 26 })), h('div', h('div.rp-place-n', name), h('div.rp-place-s', fmtN(ps.length) + (ps.length === 1 ? ' post' : ' posts'))), plid ? h('div.rp-btn.small', { onTap: () => JC.os.open('maps', { place: plid }) }, 'View in Maps') : null), gridOf(ps)];
          },
        }));
      };
      function gridOf(ps, o) {
        o = o || {};
        if (!ps.length) return o.empty || JC.ui.empty({ icon: 'photo', title: 'No posts yet' });
        return h('div.rp-grid', { class: { mosaic: !!o.mosaic } }, ps.map((p, i) => h('div.rp-cell', {
          class: { big: !!o.mosaic && i % 10 === 2 },
          style: { backgroundImage: `url("${JC.art.url(p.art)}")` },
          onTap: () => app.openPost(p.id, o.title),
        }, p.reel ? h('div.rp-cell-ic', JC.icon('rp.reels', { size: 15, weight: 2.2 })) : (p.comments || []).length > 3 ? h('div.rp-cell-ic', JC.icon('rp.comment', { size: 14, weight: 2.2 })) : null, p.reel && o.views ? h('div.rp-cell-views', JC.icon('play.fill', { size: 10 }), ' ' + fmtN((p.likes || 1) * 7)) : null)));
      }
      function tagPage(tag) {
        let mode = 0;
        const page = mk({
          title: tag, cls: 'rp-tagpage',
          content: () => {
            let ps = postsWithTag(tag);
            if (mode === 0) ps = ps.slice().sort((a, b) => (b.likes || 0) - (a.likes || 0));
            const followed = !!pmap('tags')[tag.toLowerCase()];
            return [
              h('div.rp-tag-top', h('div.rp-tag-ic', '#'), h('div.rp-tag-meta', h('div.rp-tag-n', tag), h('div.rp-tag-c', fmtN(ps.length) + (ps.length === 1 ? ' post' : ' posts'))), h('div.rp-btn.small', { class: { primary: !followed }, onTap: () => { pset('tags', tag.toLowerCase(), followed ? null : 1); page.render(); } }, followed ? 'Following' : 'Follow')),
              h('div.rp-seg', JC.ui.segmented({ items: ['Top', 'Recent'], value: mode, onChange: (i) => { mode = i; page.render(); } })),
              gridOf(ps, { title: tag, empty: JC.ui.empty({ icon: 'rp.hash', title: 'No posts', text: 'Nobody has posted with ' + tag + ' yet.' }) }),
            ];
          },
        });
        return page;
      }

      // ── reels ─────────────────────────────────────────────────────────
      function reelsPage() {
        let io = null;
        const page = mk({
          title: '', navbar: false, cls: 'rp-reels', bg: '#000',
          content: (pg) => {
            const reels = allPosts().filter((p) => p.reel);
            const wrap = h('div.rp-reel-wrap');
            const top = h('div.rp-reel-top', h('div.rp-reel-title', 'Reels', JC.icon('chevron.down', { size: 12, weight: 2.8 })), h('div.rp-reel-cam', { onTap: () => openCreate() }, JC.icon('rp.camera', { size: 24 })));
            reels.forEach((p) => wrap.appendChild(reelItem(p)));
            if (io) io.disconnect();
            io = new IntersectionObserver((ents) => ents.forEach((e) => e.target.classList.toggle('playing', e.isIntersecting && e.intersectionRatio > 0.6)), { root: pg.scroll, threshold: [0, 0.6, 1] });
            setTimeout(() => wrap.querySelectorAll('.rp-reel').forEach((r) => io.observe(r)), 30);
            return [top, wrap];
          },
        });
        page.scroll.classList.add('rp-reel-scroll');
        return page;
      }
      function reelItem(p) {
        const u = D.user(p.by);
        let lastTap = 0, tapT = 0;
        const burst = h('div.rp-burst', JC.icon('heart.fill', { size: 110 }));
        const pause = h('div.rp-reel-pause', JC.icon('play.fill', { size: 54 }));
        const likeEl = h('div.rp-ra'), likeN = h('span'), cmtN = h('span');
        const el = h('div.rp-reel',
          h('div.rp-reel-media', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` } }),
          h('div.rp-reel-shade'), burst, pause,
          h('div.rp-reel-side',
            h('div.rp-ra-w', likeEl, likeN),
            h('div.rp-ra-w', h('div.rp-ra', { onTap: (e) => { e.stopPropagation(); app.openComments(p.id); } }, JC.icon('rp.comment', { size: 28, weight: 1.9 })), cmtN),
            h('div.rp-ra-w', h('div.rp-ra', { onTap: (e) => { e.stopPropagation(); const on = !pmap('reposts')[p.id]; pset('reposts', p.id, on ? 1 : null); JC.ui.toast(on ? 'Reposted' : 'Repost removed', { icon: 'rp.repost' }); } }, JC.icon('rp.repost', { size: 27, weight: 1.9 })), h('span', fmtN(Math.round((p.likes || 0) / 9)))),
            h('div.rp-ra-w', h('div.rp-ra', { onTap: (e) => { e.stopPropagation(); app.sharePost(p.id); } }, JC.icon('rp.send', { size: 26, weight: 1.9 })), h('span', fmtN(Math.round((p.likes || 0) / 14)))),
            h('div.rp-ra-w', h('div.rp-ra', { onTap: (e) => { e.stopPropagation(); postMenu(p.id); } }, JC.icon('ellipsis', { size: 24 }))),
            h('div.rp-reel-disc', { onTap: (e) => { e.stopPropagation(); JC.ui.toast('Original audio · ' + p.by, { icon: 'music.note' }); } }, av(p.by, 28))),
          h('div.rp-reel-foot',
            h('div.rp-reel-who', h('div', { onTap: (e) => { e.stopPropagation(); app.openProfile(p.by); } }, av(p.by, 32)), h('b', { onTap: (e) => { e.stopPropagation(); app.openProfile(p.by); } }, p.by), u.verified ? JC.icon('rp.verified', { size: 13, cls: 'rp-verified' }) : null, !isOwn(p.by) && !isFollowing(p.by) ? h('span.rp-reel-follow', { onTap: (e) => { e.stopPropagation(); setFollow(p.by, true); e.currentTarget.remove(); } }, 'Follow') : null),
            p.text ? h('div.rp-reel-cap', ...rich(app, p.text)) : null,
            h('div.rp-reel-audio', JC.icon('rp.music', { size: 12 }), h('span', p.by + ' · Original audio'))),
          h('div.rp-reel-prog', h('i')));
        function drawLike() { const q = D.post(p.id) || p; likeEl.innerHTML = ''; likeEl.appendChild(JC.icon(q.liked ? 'heart.fill' : 'heart', { size: 28, weight: 1.9 })); likeEl.classList.toggle('on', !!q.liked); likeN.textContent = fmtN(q.likes || 0); cmtN.textContent = fmtN((q.comments || []).length); }
        JC.ui.onTap(likeEl, (e) => { e.stopPropagation(); toggleLike(p.id); drawLike(); });
        JC.ui.onTap(el, () => {
          const n = performance.now();
          if (n - lastTap < 300) { clearTimeout(tapT); lastTap = 0; toggleLike(p.id, true); drawLike(); burst.classList.remove('go'); void burst.offsetWidth; burst.classList.add('go'); return; }
          lastTap = n;
          tapT = setTimeout(() => { el.classList.toggle('paused'); }, 300);
        });
        el._update = drawLike;
        cards.add(el);
        drawLike();
        return el;
      }

      // ── search / explore ──────────────────────────────────────────────
      function searchPage() {
        let q = '';
        let focused = false;
        const page = mk({
          title: 'Search', navbar: false, cls: 'rp-search',
          search: { placeholder: 'Search', onInput: (v) => { q = v; page.render(); }, onFocus: () => { focused = true; page.render(); }, onCancel: () => { focused = false; q = ''; page.render(); } },
          content: () => {
            if (q.trim()) return results(q.trim());
            if (focused) {
              const recent = Object.keys(pmap('recent')).slice(-6).reverse();
              return [
                recent.length ? h('div.rp-sec-h', h('span', 'Recent'), h('span.rp-link', { onTap: () => { P('recent', {}); page.render(); } }, 'Clear all')) : null,
                recent.length ? JC.ui.list([{ rows: recent.map((id) => userRow(id)) }], { style: 'plain', cls: 'rp-plain' }) : null,
                h('div.rp-sec-h', h('span', 'Trending in Liyue')),
                JC.ui.list([{ rows: trending().map((t) => tagRow(t, true)) }], { style: 'plain', cls: 'rp-plain' }),
              ];
            }
            const ps = allPosts().filter((p) => !isOwn(p.by) && !D.user(p.by).private && now() - p.t < 86400e3 * 120);
            return [h('div.rp-trend.hscroll', trending().map((t) => h('div.rp-chip', { onTap: () => app.openTag(t) }, JC.icon('chart.line.uptrend.xyaxis', { size: 13, weight: 2.2 }), t))), gridOf(ps, { mosaic: true, title: 'Explore', views: true })];
          },
        });
        function userRow(id) {
          const u = D.user(id);
          return { leading: av(id, 46, { ring: true }), title: h('span.rp-row-h', id, u.verified ? JC.icon('rp.verified', { size: 12, cls: 'rp-verified' }) : null), subtitle: (u.name || '') + (u.followers ? ' · ' + fmtN(u.followers) + ' followers' : '') + (isFollowing(id) && !isOwn(id) ? ' · Following' : ''), onTap: () => { pset('recent', id, now()); app.openProfile(id); } };
        }
        function tagRow(t, hot) { const n = postsWithTag(t).length; return { leading: h('div.rp-hash', '#'), title: t, subtitle: hot ? 'Trending · ' + fmtN(n * 1300 + 410) + ' posts' : fmtN(n) + (n === 1 ? ' post' : ' posts'), onTap: () => app.openTag(t) }; }
        function results(qq) {
          const lq = qq.toLowerCase().replace(/^[@#]/, '');
          const us = D.users().filter((u) => (u.id + ' ' + (u.name || '')).toLowerCase().includes(lq));
          const tagMap = {};
          allPosts().forEach((p) => (String(p.text || '').match(/#[\w一-鿿]+/g) || []).forEach((t) => { if (t.toLowerCase().includes(lq) && !tagMap[t.toLowerCase()]) tagMap[t.toLowerCase()] = t; }));
          trending().forEach((t) => { if (t.toLowerCase().includes(lq) && !tagMap[t.toLowerCase()]) tagMap[t.toLowerCase()] = t; });
          const tags = Object.values(tagMap);
          const places = Array.from(new Set(allPosts().map((p) => p.place).filter((pl) => pl && pl.toLowerCase().includes(lq))));
          const out = [];
          if (us.length) out.push(h('div.rp-sec-h', h('span', 'Accounts')), JC.ui.list([{ rows: us.map((u) => userRow(u.id)) }], { style: 'plain', cls: 'rp-plain' }));
          if (tags.length) out.push(h('div.rp-sec-h', h('span', 'Tags')), JC.ui.list([{ rows: tags.map((t) => tagRow(t)) }], { style: 'plain', cls: 'rp-plain' }));
          if (places.length) out.push(h('div.rp-sec-h', h('span', 'Places')), JC.ui.list([{ rows: places.map((pl) => ({ leading: h('div.rp-hash', JC.icon('mappin.fill', { size: 18 })), title: pl, subtitle: (() => { const n = allPosts().filter((p) => p.place === pl).length; return n + (n === 1 ? ' post' : ' posts'); })(), onTap: () => app.openPlace(pl) })) }], { style: 'plain', cls: 'rp-plain' }));
          if (!out.length) out.push(JC.ui.empty({ icon: 'magnifyingglass', title: 'No results for “' + qq + '”', text: 'Try a name, a #tag or a place.' }));
          return out;
        }
        return page;
      }

      // ── create ────────────────────────────────────────────────────────
      let createSel = null;
      let createPrefill = '';
      let createMode = 0;
      function openCreate(pre) {
        pre = pre || {};
        if (pre.art) createSel = pre.art;
        if (pre.text) createPrefill = pre.text;
        app.tabs.select('home');
        const nav = app.tabs.nav('home');
        while (nav.depth() > 1 && nav.pop({ instant: true })) { /* unwind */ }
        nav.push(createPage());
        if (pre.art || pre.text) setTimeout(() => nav.push(captionPage()), 520);
      }
      function createPage() {
        const photos = photoList();
        if (!createSel) createSel = photos[0] ? photos[0].art : 'p_harbor_day';
        const prev = h('div.rp-cr-prev');
        const drawPrev = () => { prev.style.backgroundImage = `url("${JC.art.url(createSel)}")`; };
        const page = mk({
          title: 'New post', cls: 'rp-create', hideBar: true,
          left: [JC.ui.navBtn({ icon: 'xmark', label: 'Close', onTap: () => page.nav.pop() })],
          right: [JC.ui.navBtn({ text: 'Next', prominent: true, cls: 'rp-next', onTap: () => { if (createMode === 1) { addToStory(createSel); page.nav.pop(); } else page.nav.push(captionPage()); } })],
          content: () => {
            drawPrev();
            return [
              prev,
              h('div.rp-cr-bar',
                h('div.rp-cr-album', { onTap: (e) => JC.ui.menu(e.currentTarget, [{ text: 'Recents', checked: true, onTap: () => {} }, { text: 'Favorites', onTap: () => JC.ui.toast('Showing Recents') }, { text: 'Fish', onTap: () => JC.ui.toast('Showing Recents') }]) }, 'Recents', JC.icon('chevron.down', { size: 12, weight: 2.6 })),
                h('div.spacer'),
                h('div.rp-cr-tool', { onTap: () => JC.ui.toast('Select up to 10 photos — one is enough for now') }, JC.icon('square.on.square', { size: 18 })),
                h('div.rp-cr-tool', { onTap: () => JC.os.open('camera') }, JC.icon('camera.fill', { size: 18 }))),
              h('div.rp-grid.g4', photos.map((p) => h('div.rp-cell.sq', { class: { sel: p.art === createSel }, style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { createSel = p.art; page.render(); page.scrollTop(true); } }))),
            ];
          },
          footer: h('div.rp-cr-modes', ['POST', 'STORY'].map((t, i) => h('span.rp-cr-mode', { class: { on: createMode === i }, onTap: (e) => { createMode = i; e.currentTarget.parentNode.querySelectorAll('.rp-cr-mode').forEach((x, k) => x.classList.toggle('on', k === i)); page.setTitle(i ? 'Add to story' : 'New post'); } }, t))),
        });
        return page;
      }
      function captionPage() {
        let place = null;
        const tagged = [];
        const field = JC.ui.input({ multiline: true, placeholder: 'Add a caption…', value: createPrefill, autoGrow: true, maxHeight: 180 });
        field.classList.add('rp-cap-field');
        createPrefill = '';
        const acct = ME();
        const page = mk({
          title: 'New post', cls: 'rp-caption', bg: 'plain', hideBar: true,
          content: (pg) => [
            h('div.rp-cap-top', JC.art.el(createSel, { cls: 'rp-cap-img' }), field),
            JC.ui.list([{ rows: [
              { icon: { glyph: 'person.fill', bg: 'var(--indigo)' }, title: 'Tag people', detail: tagged.length ? tagged.map((x) => '@' + x).join(', ') : '', chevron: true, onTap: () => {
                JC.ui.sheet({ title: 'Tag people', detent: 'large', right: { text: 'Done' }, content: (s) => JC.ui.list([{ rows: D.users().filter((u) => !isOwn(u.id)).map((u) => ({ leading: av(u.id, 36), title: u.id, subtitle: u.name, check: tagged.includes(u.id), onTap: () => { const i = tagged.indexOf(u.id); if (i >= 0) tagged.splice(i, 1); else tagged.push(u.id); s.render(); pg.render(); } })) }]) });
              } },
              { icon: { glyph: 'location.fill', bg: 'var(--teal)' }, title: 'Add location', detail: place ? locName(place) : '', chevron: true, onTap: () => locSheet((id) => { place = id; pg.render(); }, place) },
              { icon: { glyph: 'music.note', bg: 'var(--pink)' }, title: 'Add music', chevron: true, onTap: () => JC.ui.actionSheet({ title: 'Add music', actions: ['Songs of the Frozen Sea · Morepesok Fishermen’s Choir', 'Moonlight Over Yujing · Yun Jin', 'Harbor Lo-fi'].map((s) => ({ text: s, onTap: () => JC.ui.toast('Added “' + s.split(' · ')[0] + '”', { icon: 'music.note' }) })) }) },
              { icon: { glyph: 'eye', bg: 'var(--gray)' }, title: 'Audience', detail: D.user(acct).private ? 'Followers' : 'Everyone', chevron: true, onTap: () => JC.ui.alert({ title: D.user(acct).private ? 'Private account' : 'Public account', message: D.user(acct).private ? 'Only @' + acct + '’s ' + D.user(acct).followers + ' approved followers will see this post.' : '@' + acct + ' is public. Anyone on Ripple can see this post — all ' + fmtN(D.user(acct).followers) + ' followers, and everyone else.', buttons: [{ text: 'OK' }] }) },
            ] }]),
            h('div.rp-cap-note', D.user(acct).private ? 'Posting to @' + acct + ' (private). Only approved followers will see this post.' : 'Posting to @' + acct + ' (public).'),
          ],
          footer: h('div.rp-cap-foot', h('div.rp-share-btn', { onTap: () => share() }, 'Share')),
        });
        function share() {
          let text = field.value.trim();
          if (tagged.length) text = (text ? text + ' ' : '') + tagged.map((x) => '@' + x).join(' ');
          const art = createSel;
          const hn = app.tabs.nav('home');
          while (hn.depth() > 1 && hn.pop({ instant: true })) { /* unwind */ }
          app._uploading = art;
          scheduleRender(true);
          app.homePage && app.homePage.scrollTop(true);
          setTimeout(() => {
            app._uploading = null;
            const p = JC.store.add('posts', { id: U.uid('rppost'), by: acct, t: now(), art, text, place: place ? locName(place) : null, placeId: place, likes: 0, liked: false, comments: [] }, { front: true });
            JC.store.update('wvusers', acct, {});
            JC.story.act('post', { id: p.id, text, art, loc: !!place, place: place || null, acct, kind: 'post' });
            JC.ui.toast('Your post is live', { icon: 'checkmark.circle.fill' });
            reactions(p.id, acct, !!place);
          }, 1800);
        }
        return page;
      }
      function locSheet(cb, cur) {
        let q = '';
        const s = JC.ui.sheet({ title: 'Add location', detent: 'large', left: { text: 'Cancel' }, content: () => {
          const list = h('div');
          const fill = () => {
            list.innerHTML = '';
            const ids = LOCS.filter((id) => !q || locName(id).toLowerCase().includes(q.toLowerCase()));
            list.appendChild(JC.ui.list([{ rows: (cur ? [{ title: 'Remove location', destructive: true, onTap: () => { s.close(); cb(null); } }] : []).concat(ids.map((id) => ({ leading: h('div.rp-hash', JC.icon(id === 'player-home' ? 'location.fill' : 'mappin.fill', { size: 17 })), title: id === 'player-home' ? 'Current location' : locName(id), subtitle: id === 'player-home' ? locName(id) : (JC.r7 && JC.r7.place(id) ? JC.r7.place(id).addr : ''), check: cur === id, onTap: () => { s.close(); cb(id); } }))) }], { style: 'plain', cls: 'rp-plain' }));
          };
          fill();
          return [h('div.rp-locsearch', JC.ui.search({ placeholder: 'Find a location', onInput: (v) => { q = v; fill(); } })), list];
        } });
      }
      function reactions(pid, acct, withLoc) {
        const pub = acct === 'tartaglia';
        const steps = pub ? [
          [4, () => like('lyuba.cicin', 12)], [7, () => comment('emergencyfood', 'is that food?? ⭐')], [11, () => like('wangsheng_hutao', 48)],
          [15, () => comment('wangsheng_hutao', 'mr harbinger posting at this hour 👀👻')], [21, () => like('traveler.l', 130)],
          [28, () => comment('kabukimono', withLoc ? 'nice of you to tell everyone exactly where you are. 🎭' : 'who wrote this one. not the bank, clearly.')],
          [36, () => like('yunjin.opera', 240)], [48, () => comment('traveler.l', 'you okay?')], [62, () => like('crux.captain', 410)],
        ] : [
          [5, () => like('traveler.l', 1)], [9, () => comment('wanmin_chef', 'can i cook it?? 🔥')], [14, () => like('emergencyfood', 1)],
          [20, () => comment('emergencyfood', 'is it edible')], [30, () => like('balladeer', 1)], [44, () => like('crux.captain', 2)],
        ];
        function like(by, n) {
          const p = D.post(pid);
          if (!p) return;
          JC.store.update('posts', pid, { likes: (p.likes || 0) + n });
          JC.store.add('wvact', { acct, kind: 'like', by, post: pid, t: now(), read: false }, { front: true });
          JC.notify.push({ app: 'wavelet', title: 'Ripple', subtitle: '@' + acct, body: by + (n > 1 ? ' and ' + fmtN(n - 1) + ' others' : '') + ' liked your post.', art: p.art, open: { app: 'wavelet', intent: { post: pid } } });
        }
        function comment(by, text) {
          const p = D.post(pid);
          if (!p) return;
          JC.store.update('posts', pid, { comments: (p.comments || []).concat({ by, text, t: now() }) });
          JC.store.add('wvact', { acct, kind: 'comment', by, post: pid, text, t: now(), read: false }, { front: true });
          JC.notify.push({ app: 'wavelet', title: 'Ripple', subtitle: '@' + acct, body: by + ' commented: ' + text, art: p.art, open: { app: 'wavelet', intent: { post: pid } } });
        }
        steps.forEach(([s, fn]) => setTimeout(fn, s * 1000));
      }

      // ── activity ──────────────────────────────────────────────────────
      function activityPage() {
        const page = mk({
          title: 'Notifications', large: true, cls: 'rp-activity',
          right: [JC.ui.navBtn({ icon: 'checkmark', label: 'Mark all read', onTap: () => { markAll(); page.render(); } })],
          content: () => {
            const acts = JC.store.all('wvact').filter((a) => (a.acct || 'tartaglia') === ME() && (a.t || 0) <= now() + 60000).slice().sort((a, b) => b.t - a.t);
            const n = now();
            const groups = [['New', (a) => !a.read], ['Today', (a) => n - a.t < 86400e3], ['This week', (a) => n - a.t < 7 * 86400e3], ['This month', (a) => n - a.t < 31 * 86400e3], ['Earlier', () => true]];
            const used = new Set();
            const out = [];
            const reqs = JC.store.all('wvreqs').filter((r) => r.acct === ME());
            if (reqs.length) out.push(JC.ui.list([{ rows: [{ leading: h('div.rp-req-av', av(reqs[0].id, 44), reqs[1] ? h('div.rp-req-av2', av(reqs[1].id, 32)) : null), title: 'Follow requests', subtitle: reqs[0].id + (reqs.length > 1 ? ' + ' + (reqs.length - 1) + ' other' + (reqs.length > 2 ? 's' : '') : ''), right: h('i.rp-dot'), chevron: true, onTap: () => page.nav.push(requestsPage()) }] }], { style: 'plain', cls: 'rp-plain' }));
            groups.forEach(([label, fn]) => {
              const arr = acts.filter((a) => !used.has(a.id) && fn(a));
              arr.forEach((a) => used.add(a.id));
              if (!arr.length) return;
              out.push(h('div.rp-sec-h', h('span', label)));
              out.push(JC.ui.list([{ rows: arr.map((a) => actRow(a)) }], { style: 'plain', cls: 'rp-plain rp-actrows' }));
            });
            if (!acts.length) out.push(JC.ui.empty({ icon: 'heart', title: 'Activity on your posts', text: 'When someone likes or comments on one of your posts, you’ll see it here.' }));
            return out;
          },
          onShow: () => setTimeout(() => { markAll(); }, 1500),
        });
        function markAll() { JC.store.all('wvact').forEach((a) => { if (!a.read && (a.acct || 'tartaglia') === ME()) JC.store.update('wvact', a.id, { read: true }); }); updateBadge(); }
        function actRow(a) {
          const p = a.post ? D.post(a.post) : null;
          const verb = { like: 'liked your post.', comment: 'commented: ' + (a.text || ''), reply: 'replied: ' + (a.text || ''), mention: 'mentioned you in a post: ' + (a.text || ''),
            follow: 'started following you.', follow_req: 'requested to follow you.', storyview: 'viewed your story.' }[a.kind] || 'interacted with you.';
          let right = null;
          if (p) right = h('div.rp-act-thumb', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: (e) => { e.stopPropagation(); app.openPost(p.id); } });
          else if (a.kind === 'follow') right = followBtn(a.by, { small: true });
          else if (a.kind === 'follow_req') right = h('div.rp-btn.small.primary', { onTap: (e) => { e.stopPropagation(); approve(a.by); JC.store.remove('wvact', a.id); page.render(); } }, 'Confirm');
          return { leading: h('div', { onTap: (e) => { e.stopPropagation(); app.openProfile(a.by); } }, av(a.by, 44, { ring: true })), title: h('span.rp-act-text', h('b', a.by), ' ', verb, ' ', h('span.rp-act-t', ago(a.t))), right, onTap: () => { if (p) app.openPost(p.id); else app.openProfile(a.by); } };
        }
        function approve(id) {
          JC.store.remove('wvreqs', id);
          JC.ui.toast(id + ' can now see @' + ME() + '’s posts', { icon: 'checkmark' });
          JC.store.update('wvusers', ME(), { followers: (D.user(ME()).followers || 0) + 1 });
          const u = D.user(id);
          if (!(u.follows || []).includes(ME())) JC.store.update('wvusers', id, { follows: (u.follows || []).concat(ME()) });
          JC.story.act('dm', { to: id, text: '', approved: true, acct: ME(), kind: 'follow_approve' });
        }
        function requestsPage() {
          return mk({
            title: 'Follow requests', cls: 'rp-reqs',
            content: (pg) => {
              const reqs = JC.store.all('wvreqs').filter((r) => r.acct === ME());
              if (!reqs.length) return JC.ui.empty({ icon: 'rp.person.plus', title: 'No requests', text: 'Follow requests will appear here.' });
              return JC.ui.list([{ rows: reqs.map((r) => ({
                leading: av(r.id, 44), title: r.id, subtitle: D.user(r.id).name, onTap: () => app.openProfile(r.id),
                right: h('div.rp-req-btns',
                  h('div.rp-btn.small.primary', { onTap: (e) => { e.stopPropagation(); approve(r.id); pg.render(); } }, 'Confirm'),
                  h('div.rp-btn.small', { onTap: (e) => { e.stopPropagation(); JC.store.remove('wvreqs', r.id); pg.render(); } }, 'Delete')),
              })) }], { style: 'plain', cls: 'rp-plain' });
            },
          });
        }
        return page;
      }

      // ── profile ───────────────────────────────────────────────────────
      function profilePage(id, isRoot) {
        let tab = 0;
        const acctEl = h('div.rp-acct', { onTap: () => accountsSheet() });
        const page = mk({
          title: isRoot ? '' : id, cls: 'rp-profile', left: isRoot ? [acctEl] : undefined,
          right: [h('div.rp-pr-right')],
          content: (pg) => {
            const pid = isRoot ? ME() : id;
            const own = isOwn(pid);
            const u = D.user(pid);
            const ps = postsBy(pid);
            const locked = !own && u.private && !isFollowing(pid);
            if (isRoot) {
              acctEl.innerHTML = '';
              const other = OWN.find((x) => x !== ME());
              acctEl.append(u.private ? JC.icon('rp.lock', { size: 15, weight: 2.2 }) : null, h('span', pid), JC.icon('chevron.down', { size: 12, weight: 2.6 }), badgeCount(other).total ? h('i.rp-dot.red') : null);
            }
            const right = pg.right.querySelector('.rp-pr-right') || pg.right;
            right.innerHTML = '';
            right.appendChild(own
              ? JC.ui.glassGroup(JC.ui.navBtn({ icon: 'rp.plus.square', iconSize: 21, label: 'Create', onTap: () => openCreate() }), JC.ui.navBtn({ icon: 'line.3.horizontal', iconSize: 20, label: 'Menu', onTap: () => settingsSheet() }))
              : JC.ui.glassGroup(JC.ui.navBtn({ icon: 'bell', iconSize: 20, label: 'Notifications', onTap: () => { const on = !pmap('bells')[pid]; pset('bells', pid, on ? 1 : null); JC.ui.toast(on ? 'Post notifications on for ' + pid : 'Post notifications off', { icon: on ? 'bell.fill' : 'bell.slash.fill' }); } }), JC.ui.navBtn({ icon: 'ellipsis', iconSize: 20, label: 'More', onTap: () => profileMenu(pid) })));
            const header = h('div.rp-pr-head',
              h('div.rp-pr-av', { onTap: () => (storyOf(pid).length ? app.openStories(pid, [pid]) : own ? editProfile() : lightboxAvatar(pid)) }, av(pid, 86, { ring: true }), own ? h('div.rp-pr-plus', { onTap: (e) => { e.stopPropagation(); myStory(); } }, JC.icon('plus', { size: 13, weight: 3 })) : null),
              h('div.rp-pr-right2',
                h('div.rp-pr-name', u.name || pid, u.verified ? JC.icon('rp.verified', { size: 14, cls: 'rp-verified' }) : null),
                h('div.rp-pr-counts',
                  h('div.rp-pr-c', { onTap: () => { if (!locked) pg.scroll.scrollTo({ top: 380, behavior: 'smooth' }); } }, h('b', fmtN(ps.length)), h('span', 'posts')),
                  h('div.rp-pr-c', { onTap: () => { if (!locked) followList(pid, 'followers'); } }, h('b', fmtN(u.followers)), h('span', 'followers')),
                  h('div.rp-pr-c', { onTap: () => { if (!locked) followList(pid, 'following'); } }, h('b', fmtN(u.following)), h('span', 'following')))));
            const info = h('div.rp-pr-info',
              u.cat ? h('div.rp-pr-cat', u.cat) : null,
              u.bio ? h('div.rp-pr-bio', ...rich(app, u.bio)) : null,
              u.link ? h('div.rp-pr-link', { onTap: () => JC.os.open('safari', { url: 'https://' + u.link.replace(/^https?:\/\//, '') }) }, JC.icon('link', { size: 13, weight: 2.2 }), u.link) : null,
              !own && followsMe(pid) ? h('div.rp-pr-follows', 'Follows @' + ME()) : null);
            const btns = own
              ? h('div.rp-pr-btns', h('div.rp-btn', { onTap: () => editProfile() }, 'Edit profile'), h('div.rp-btn', { onTap: () => shareProfile(pid) }, 'Share profile'), h('div.rp-btn.icon', { onTap: () => discover() }, JC.icon('rp.person.plus', { size: 16 })))
              : h('div.rp-pr-btns', followBtn(pid), h('div.rp-btn', { onTap: () => message(pid) }, 'Message'), h('div.rp-btn.icon', { onTap: () => discover() }, JC.icon('rp.person.plus', { size: 16 })));
            const hl = (u.highlights || []).length || own ? h('div.rp-hl.hscroll',
              (u.highlights || []).map((x, i) => h('div.rp-hl-item', { onTap: () => highlight(pid, x, i) }, h('div.rp-hl-c', JC.ui.avatar({ art: x.art }, 60)), h('span', x.title))),
              own ? h('div.rp-hl-item', { onTap: () => pickPhoto((art) => { const me = D.user(ME()); JC.store.update('wvusers', ME(), { highlights: (me.highlights || []).concat({ title: 'Highlight', art }) }); pg.render(); }, 'New highlight') }, h('div.rp-hl-c.new', JC.icon('plus', { size: 26, weight: 1.6 })), h('span', 'New')) : null) : null;
            const tabsEl = locked ? null : h('div.rp-pr-tabs',
              h('div.rp-pr-tab', { class: { on: tab === 0 }, onTap: () => { tab = 0; pg.render(); } }, JC.icon('rp.grid', { size: 22 })),
              h('div.rp-pr-tab', { class: { on: tab === 1 }, onTap: () => { tab = 1; pg.render(); } }, JC.icon('rp.reels', { size: 22 })),
              h('div.rp-pr-tab', { class: { on: tab === 2 }, onTap: () => { tab = 2; pg.render(); } }, JC.icon('rp.tagged', { size: 22 })));
            let body;
            if (locked) body = h('div.rp-private', h('div.rp-private-ic', JC.icon('rp.lock', { size: 30, weight: 1.6 })), h('b', 'This account is private'), h('span', 'Follow this account to see their photos and videos.'));
            else if (tab === 0) body = gridOf(ps, { title: pid, empty: own ? h('div.rp-private', h('b', 'Share photos'), h('span', 'When you share photos, they will appear on your profile.'), h('div.rp-link', { onTap: () => openCreate() }, 'Share your first photo')) : h('div.rp-private', h('div.rp-private-ic', JC.icon('rp.camera', { size: 30, weight: 1.6 })), h('b', 'No posts yet'), pid === 'balladeer' ? h('span', 'Nothing to see here.') : null) });
            else if (tab === 1) body = gridOf(ps.filter((p) => p.reel), { title: 'Reels', views: true, empty: JC.ui.empty({ icon: 'rp.reels', title: 'No reels yet' }) });
            else body = gridOf(allPosts().filter((p) => p.by !== pid && String(p.text || '').toLowerCase().includes('@' + pid.toLowerCase())), { title: 'Tagged', empty: JC.ui.empty({ icon: 'rp.tagged', title: own ? 'Photos and videos of you' : 'No photos', text: own ? 'When people tag you in photos and videos, they’ll appear here.' : '' }) });
            return [header, info, btns, hl, tabsEl, body];
          },
        });
        return page;
      }
      function lightboxAvatar(id) { const u = D.user(id); if (typeof u.avatar === 'string') lightbox({ art: u.avatar, by: id, t: now() }); else JC.ui.toast(id + ' hasn’t added a profile photo'); }
      function highlight(id, x, i) { app.openStories(id, [id], { frames: [{ art: x.art, text: x.title, t: now() - 86400e3 * (12 + i * 23) }] }); }
      function message(id) { app.openDM(id); }
      function profileMenu(id) {
        const fav = !!pmap('favs')[id];
        JC.ui.actionSheet({ title: id, actions: [
          { text: fav ? 'Remove from Favorites' : 'Add to Favorites', onTap: () => { pset('favs', id, fav ? null : 1); JC.ui.toast(fav ? 'Removed from Favorites' : 'Added to Favorites', { icon: 'star.fill' }); } },
          { text: 'About this account', onTap: () => aboutAccount(id) },
          { text: 'Copy profile URL', onTap: () => { U.copy('https://ripple.ly/' + id); JC.ui.toast('Profile URL copied', { icon: 'link' }); } },
          { text: 'Share this profile', onTap: () => shareProfile(id) },
          { text: 'Restrict', onTap: () => JC.ui.alert({ title: 'Restrict ' + id + '?', message: 'Their new comments on your posts will only be visible to them. They won’t know they’re restricted.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Restrict', style: 'default', onTap: () => JC.ui.toast('Restricted ' + id) }] }) },
          { text: 'Block', style: 'destructive', onTap: () => JC.ui.alert({ title: 'Block ' + id + '?', message: id === 'kabukimono' ? 'They won’t be able to find your profile, posts or story on Ripple. (They will make another account.)' : 'They won’t be able to find your profile, posts or story on Ripple.', buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Block', style: 'destructive', onTap: () => JC.ui.toast('Blocked ' + id) }] }) },
        ] });
      }
      function shareProfile(id) { JC.ui.share({ title: '@' + id + ' on Ripple', subtitle: 'ripple.ly/' + id, art: typeof D.user(id).avatar === 'string' ? D.user(id).avatar : undefined, icon: 'person.crop.circle', payload: { kind: 'link', text: '@' + id, url: 'https://ripple.ly/' + id } }); }
      function discover() {
        const s = JC.ui.sheet({
          title: 'Discover people', detent: 'large', right: { text: 'Done' },
          content: () => JC.ui.list([{ header: 'Suggested for you', rows: D.users().filter((u) => !isOwn(u.id) && !isFollowing(u.id)).map((u) => ({ leading: av(u.id, 44, { ring: true }), title: h('span.rp-row-h', u.id, u.verified ? JC.icon('rp.verified', { size: 12, cls: 'rp-verified' }) : null), subtitle: followsMe(u.id) ? 'Follows you' : u.name, right: followBtn(u.id, { small: true }), onTap: () => { s.close(); app.openProfile(u.id); } })) }], { style: 'plain', cls: 'rp-plain' }),
        });
      }
      function followList(id, kind) {
        const all = D.users().map((u) => u.id).filter((x) => x !== id);
        let ids;
        if (kind === 'following') ids = isOwn(id) ? all.filter((x) => (D.user(x).fby || []).includes(id) || pmap('follow:' + id)[x] === 1).filter((x) => pmap('follow:' + id)[x] !== 0) : all.filter((x) => (D.user(id).follows || []).includes(x) || (isOwn(x) && (D.user(id).follows || []).includes(x)));
        else ids = isOwn(id) ? all.filter((x) => (D.user(x).follows || []).includes(id)) : all.filter((x) => (D.user(x).fby || []).includes(id) || (D.user(id).fby || []).includes(x)).concat((D.user(id).fby || []).filter((x) => x !== id));
        ids = Array.from(new Set(ids)).filter((x) => x !== id);
        if (id === 'balladeer' && kind === 'following') ids = ['ajax.fishes'];
        const u = D.user(id);
        const total = kind === 'followers' ? u.followers : u.following;
        const s = JC.ui.sheet({
          title: kind === 'followers' ? 'Followers' : 'Following', detent: 'large', right: { text: 'Done' },
          content: () => [
            JC.ui.list([{ rows: ids.map((x) => ({ leading: av(x, 44, { ring: true }), title: h('span.rp-row-h', x, D.user(x).verified ? JC.icon('rp.verified', { size: 12, cls: 'rp-verified' }) : null), subtitle: D.user(x).name, right: isOwn(x) ? null : followBtn(x, { small: true }), onTap: () => { s.close(); app.openProfile(x); } })) }], { style: 'plain', cls: 'rp-plain' }),
            total > ids.length ? h('div.rp-likes-more', 'and ' + fmtN(total - ids.length) + ' more') : null,
          ],
        });
      }
      function editProfile() {
        const me = ME();
        const u = D.user(me);
        const vals = { name: u.name || '', id: me, pronouns: u.pronouns || '', bio: u.bio || '', link: u.link || '' };
        let avatar = u.avatar;
        JC.ui.sheet({
          title: 'Edit profile', detent: 'large', left: { text: 'Cancel' },
          right: { text: 'Done', onTap: () => {
            JC.store.update('wvusers', me, { name: vals.name.trim(), pronouns: vals.pronouns.trim(), bio: vals.bio.trim(), link: vals.link.trim(), avatar });
            if (vals.id.trim() && vals.id.trim() !== me) JC.ui.alert({ title: 'Username unavailable', message: 'You can only change your username twice within 14 days. (@' + me + ' was changed recently.)', buttons: [{ text: 'OK' }] });
            JC.ui.toast('Profile saved', { icon: 'checkmark' });
            scheduleRender(true);
          } },
          content: (sh) => {
            const field = (k, label, o) => { const inp = JC.ui.input({ value: vals[k], placeholder: label, multiline: !!(o && o.multi), autoGrow: !!(o && o.multi), maxHeight: 120, onInput: (v) => { vals[k] = v; } }); inp.classList.add('rp-ep-input'); return h('div.rp-ep-row', h('div.rp-ep-k', label), inp); };
            return [
              h('div.rp-ep-top', JC.ui.avatar(avatarSpec(Object.assign({}, u, { avatar })), 92), h('div.rp-link', { onTap: () => JC.ui.actionSheet({ actions: [
                { text: 'Choose from library', onTap: () => pickPhoto((art) => { avatar = art; sh.render(); }) },
                { text: me === 'ajax.fishes' ? 'Use fish emoji' : 'Use the portrait', onTap: () => { avatar = me === 'ajax.fishes' ? { emoji: '🐟', grad: ['#a5d8ff', '#1c7ed6'] } : 'av_childe'; sh.render(); } },
                { text: 'Remove current picture', style: 'destructive', onTap: () => { avatar = { initials: 'A', grad: ['#c7c7cc', '#8e8e93'] }; sh.render(); } },
              ] }) }, 'Edit picture or avatar')),
              h('div.rp-ep-fields', field('name', 'Name'), field('id', 'Username'), field('pronouns', 'Pronouns'), field('bio', 'Bio', { multi: true }), field('link', 'Links')),
              JC.ui.list([{ rows: [
                { title: me === 'tartaglia' ? 'Professional dashboard' : 'Switch to professional account', tinted: true, onTap: () => JC.ui.alert({ title: me === 'tartaglia' ? 'Professional dashboard' : 'Professional account', message: me === 'tartaglia' ? 'Accounts reached in the last 30 days: 214,880 (+18%). Most active: Liyue Harbor, Snezhnaya. Managed with Northland Bank Communications.' : 'Professional accounts are public. This account is private for a reason.', buttons: [{ text: 'OK' }] }) },
                { title: 'Personal information settings', tinted: true, onTap: () => JC.ui.alert({ title: 'Personal information', message: 'Email: a••••@northlandbank.sn\nPhone: +9 812 555 ••11\nBirthday: 20 July', buttons: [{ text: 'OK' }] }) },
              ] }]),
            ];
          },
        });
      }
      function settingsSheet() {
        const me = ME();
        const s = JC.ui.sheet({
          title: 'Settings and activity', detent: 'large', cls: 'rp-settings', right: { text: 'Done' },
          content: (sh) => [
            JC.ui.search({ placeholder: 'Search', onInput: () => {} }),
            JC.ui.list([{ header: 'Your account', rows: [{ icon: { glyph: 'person.crop.circle', bg: 'var(--gray)' }, title: 'Accounts Center', subtitle: 'Password, security, personal details', chevron: true, onTap: () => JC.ui.alert({ title: 'Accounts Center', message: 'Changing the password needs the current password and a code sent to the owner’s email. You have neither.', buttons: [{ text: 'OK' }] }) }] }]),
            JC.ui.list([{ header: 'How you use Ripple', rows: [
              { icon: { glyph: 'rp.bookmark', bg: 'var(--indigo)' }, title: 'Saved', chevron: true, onTap: () => { s.close(); curNav().push(savedPage()); } },
              { icon: { glyph: 'rp.clock.arrow', bg: 'var(--teal)' }, title: 'Archive', chevron: true, onTap: () => { s.close(); curNav().push(archivePage()); } },
              { icon: { glyph: 'chart.line.uptrend.xyaxis', bg: 'var(--green)' }, title: 'Your activity', chevron: true, onTap: () => JC.ui.alert({ title: 'Your activity', message: me === 'tartaglia' ? 'Daily average: 6 minutes.\nMost visited profile: @wangsheng_hutao (it’s for work).\nSecond: @crux.captain (it’s for the rematch).' : 'Daily average: 22 minutes.\nMost visited profile: your own.\nMost liked post: the bluefin.', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'bell.fill', bg: 'var(--red)' }, title: 'Notifications', chevron: true, onTap: () => JC.os.open('settings', { page: 'notifications' }) },
            ] }]),
            JC.ui.list([{ header: 'Who can see your content', rows: [
              { icon: { glyph: 'lock.fill', bg: 'var(--purple)' }, title: 'Private account', toggle: { on: !!D.user(me).private, onChange: (v) => {
                if (me === 'tartaglia') { if (v) JC.ui.alert({ title: 'Can’t make this account private', message: 'Verified public figure accounts managed by an organisation (Northland Bank Communications) can’t be made private.', buttons: [{ text: 'OK', onTap: () => sh.render() }] }); return; }
                if (!v) JC.ui.alert({ title: 'Switch to public?', message: 'Anyone on Ripple could see all 40 fish. And their names. Including the bluefin.', buttons: [{ text: 'Keep Private', style: 'cancel', onTap: () => sh.render() }, { text: 'Switch', style: 'destructive', onTap: () => JC.store.update('wvusers', me, { private: false }) }] });
                else JC.store.update('wvusers', me, { private: true });
              } } },
              { icon: { glyph: 'star.fill', bg: 'var(--green)' }, title: 'Close Friends', detail: me === 'tartaglia' ? '0 people' : '3 people', chevron: true, onTap: () => JC.ui.alert({ title: 'Close Friends', message: me === 'tartaglia' ? 'Nobody. This account belongs to the bank.' : '@traveler.l, @emergencyfood, @wanmin_chef', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'nosign', bg: 'var(--red)' }, title: 'Blocked', detail: '0', chevron: true, onTap: () => JC.ui.alert({ title: 'Blocked accounts', message: 'You haven’t blocked anyone. (You considered @kabukimono several times.)', buttons: [{ text: 'OK' }] }) },
              { icon: { glyph: 'circle.fill', bg: 'var(--green)' }, title: 'Activity status', toggle: { on: !!P('activeStatus'), onChange: (v) => P('activeStatus', v) } },
            ] }]),
            JC.ui.list([{ rows: [
              { title: 'Add account', tinted: true, onTap: () => addAccount() },
              { title: 'Log out @' + me, destructive: true, onTap: () => JC.ui.alert({ title: 'Log out of @' + me + '?', message: 'You don’t know the password. If you log out, you’re not getting back in.', buttons: [{ text: 'Stay Logged In', style: 'cancel' }] }) },
            ] }]),
          ],
        });
      }
      function addAccount() { JC.ui.alert({ title: 'Add account', message: 'This phone already has two accounts. That’s plenty for one person.', buttons: [{ text: 'OK' }] }); }
      function accountsSheet() {
        const s = JC.ui.sheet({
          title: 'Accounts', detent: 'medium', right: { text: 'Done' },
          content: () => JC.ui.list([{ rows: OWN.map((id) => {
            const n = badgeCount(id).total;
            return { leading: av(id, 44), title: h('span.rp-row-h', id, D.user(id).private ? JC.icon('rp.lock', { size: 12 }) : null), subtitle: D.user(id).name + (D.user(id).private ? ' · private' : ' · public') + (n && id !== ME() ? ' · ' + n + ' new' : ''), check: id === ME(), onTap: () => { s.close(); switchTo(id); } };
          }).concat([{ icon: { glyph: 'plus', bg: 'var(--fill)', color: 'var(--label)' }, title: 'Add Ripple account', onTap: () => addAccount() }]) }]),
        });
      }
      function switchTo(id) {
        if (id === ME()) return;
        P('acct', id);
        JC.audio.play('tap');
        ['home', 'reels', 'dms', 'search', 'profile'].forEach((t) => { const n = app.tabs.nav(t); if (n) while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ } });
        scheduleRender(true);
        JC.ui.toast('Switched to @' + id, { icon: 'person.crop.circle' });
      }
      function savedPage() { return mk({ title: 'Saved', cls: 'rp-saved', content: () => { const sv = pmap('saved'); return gridOf(allPosts().filter((p) => sv[p.id]), { title: 'Saved', empty: JC.ui.empty({ icon: 'rp.bookmark', title: 'Save', text: 'Save photos that you want to see again. No one is notified.' }) }); } }); }
      function archivePage() {
        return mk({ title: 'Archive', cls: 'rp-saved', content: () => {
          const hidden = pmap('hiddenPosts');
          const arch = JC.store.all('posts').filter((p) => p.by === ME() && hidden[p.id]);
          return [h('div.rp-cap-note', 'Only you can see archived posts. Tap one to show it on your profile again.'),
            arch.length ? h('div.rp-grid', arch.map((p) => h('div.rp-cell', { style: { backgroundImage: `url("${JC.art.url(p.art)}")` }, onTap: () => { pset('hiddenPosts', p.id, null); JC.ui.toast('Shown on profile'); scheduleRender(true); } }))) : JC.ui.empty({ icon: 'rp.clock.arrow', title: 'Nothing archived', text: 'Archived posts appear here.' })];
        } });
      }

      // ── tabs ──────────────────────────────────────────────────────────
      app.tabs = JC.ui.tabs(win.body, {
        tint: 'var(--rp-tint)',
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'reels', title: 'Reels', icon: 'rp.reels', root: () => reelsPage() },
          { id: 'dms', title: 'Messages', icon: 'rp.send', root: () => inboxPage() },
          { id: 'search', title: 'Search', icon: 'magnifyingglass', root: () => searchPage() },
          { id: 'profile', title: 'Profile', icon: 'person.crop.circle', root: () => profilePage(ME(), true) },
        ],
        active: 'home',
        onChange: (id) => { win.el.classList.toggle('rp-dark-tab', id === 'reels'); if (id === 'reels' || id === 'profile' || id === 'dms') { const n = app.tabs.nav(id); if (n && n.top() && n.depth() === 1) n.top().render(); } },
      });
      function tabBadges() {
        const b = badgeCount(ME());
        app.tabs.badge('dms', b.dms || 0);
        updateBadge();
        if (app.homePage && app.homePage.el.isConnected) { const dot = app.homePage.el.querySelector('.rp-nbadge'); if (dot) { dot.textContent = b.acts ? String(b.acts) : ''; dot.hidden = !b.acts; } }
      }
      let rT = 0;
      function scheduleRender(all) {
        clearTimeout(rT);
        rT = setTimeout(() => {
          cards.forEach((c) => { if (!c.isConnected) cards.delete(c); });
          ['home', 'reels', 'dms', 'search', 'profile'].forEach((t) => {
            const nav = app.tabs.nav(t);
            if (!nav) return;
            const top = nav.top();
            if (top && (all || t === app.tabs.current())) { if (top.el.querySelector('.row.swiped')) return; top.render(); }
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
      offs.push(JC.store.on('wvdms', () => { tabBadges(); const top = app.tabs.nav('dms') && app.tabs.nav('dms').top(); if (top && top.el.classList.contains('rp-inbox')) top.render(); }));
      offs.push(JC.store.on('wvusers', () => scheduleRender(false)));
      offs.push(JC.bus.on('story:reset', () => scheduleRender(true)));
      offs.push(JC.bus.on('story:chapter', () => scheduleRender(true)));
      tabBadges();

      // ── intents ───────────────────────────────────────────────────────
      function intent(it) {
        if (!it) return;
        const pid = it.post || it.id;
        if (it.compose) { const c = it.compose === true ? {} : it.compose; openCreate({ art: c.art || c.img || null, text: c.text || '' }); return; }
        if (it.acct && OWN.includes(it.acct)) switchTo(it.acct);
        if (it.dm) { app.tabs.select('dms'); const n = app.tabs.nav('dms'); while (n.depth() > 1 && n.pop({ instant: true })) { /* unwind */ } n.push(dmPage(it.dm)); return; }
        if (it.user) { app.tabs.select('home'); app.openProfile(it.user); return; }
        if (it.tab) { app.tabs.select(it.tab === 'activity' ? 'home' : it.tab); if (it.tab === 'activity') app.openActivity(); return; }
        if (pid) { app.tabs.select('home'); app.openPost(pid); }
      }
      return {
        intent,
        show() { scheduleRender(false); reveal(); },
        hide() { if (app._overlay) app._overlay(); },
        back() {
          if (app._overlay) { app._overlay(); return true; }
          const b = win.overlays.querySelectorAll('.ctx-back, .pmenu-back, .sheet-back');
          if (b.length) { b[b.length - 1].click(); return true; }
          return false;
        },
        destroy() { offs.forEach((f) => f()); clearTimeout(rT); },
      };
    },
  });

  JC.bus.on('boot', () => { try { reveal(); updateBadge(); } catch (e) { /* ignore */ } });
})();
