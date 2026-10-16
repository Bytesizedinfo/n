/* Music — iOS 26 Apple Music: Home / New / Radio / Library / Search, mini player, Now Playing (lyrics, queue,
   AirPlay), playlists you can edit. Playback is synthesized live by music-engine.js. */
(function () {
  'use strict';
  const JC = window.JC;
  const { h } = JC;
  const U = JC.util;
  const D = JC.musicData;
  const M = () => JC.music;

  // ── mixes (virtual playlists) & station artwork ───────────────────
  const lib = () => JC.store.get('mlib', 'lib') || { favs: [], dlAlbums: [], recent: [], plays: {} };
  const byStyle = (styles) => D.songs.filter((s) => styles.includes(s.style)).map((s) => s.id);
  function seededShuffle(ids, seed) {
    const a = ids.slice();
    let x = seed;
    for (let i = a.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) & 0x7fffffff; const j = x % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const MIXES = [
    { id: 'mix_fav', title: 'Favorites Mix', sub: 'Songs you love, all in one place', c: ['#ff6f91', '#b5134b'], ids: () => { const L = lib(); const plays = L.plays || {}; const top = D.songs.map((s) => s.id).sort((a, b) => (plays[b] || 0) - (plays[a] || 0)).slice(0, 8); return Array.from(new Set((L.favs || []).concat(top))); } },
    { id: 'mix_chill', title: 'Chill Mix', sub: 'Gusu Strings Ensemble, Night Taxi, Shen Yao', c: ['#3cc7b4', '#14506b'], ids: () => seededShuffle(byStyle(['guqin', 'ambient', 'lofi', 'ballad']), 7).slice(0, 12) },
    { id: 'mix_getup', title: 'Get Up! Mix', sub: 'Purple Lightning, Koi Pond Boys, LANLING DRIFT', c: ['#ffae4a', '#e0422c'], ids: () => seededShuffle(byStyle(['gym', 'chip', 'pop', 'folk']), 3).slice(0, 12) },
    { id: 'mix_new', title: 'New Music Mix', sub: 'Fresh from Koi Records and more', c: ['#9b7bf0', '#3a2a8f'], ids: () => D.album('kr').songs.concat(D.album('zd').songs.slice(0, 2)) },
  ];
  function gradCover(id, title, c, extra, noNote) {
    JC.art.def(id, {
      title, w: 600, h: 600, tags: ['cover'],
      svg: (w, hh) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient><radialGradient id="r" cx=".2" cy=".1" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="600" height="600" fill="url(#g)"/><rect width="600" height="600" fill="url(#r)"/>${extra || ''}` +
        `<text x="44" y="${title.length > 14 ? 470 : 520}" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="64" fill="#fff">${title.length > 14 ? title.replace(/^(\S+\s\S+)\s/, '$1</text><text x="44" y="540" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="64" fill="#fff">') : title}</text>` +
        (noNote ? '' : `<g transform="translate(44 60)" fill="#fff" fill-opacity=".92"><path d="M10 34V8l22-5v24" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><ellipse cx="6" cy="35" rx="7" ry="6"/><ellipse cx="28" cy="29" rx="7" ry="6"/></g>`) + '</svg>',
    });
  }
  MIXES.forEach((m) => {
    gradCover('cover_' + m.id, m.title, m.c);
    M().virtual[m.id] = { title: m.title, ids: m.ids };
  });
  D.stations.forEach((s) => {
    const waves = '<g fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"><path d="M430 130a90 90 0 0 1 0 120"/><path d="M470 100a140 140 0 0 1 0 180"/><path d="M390 160a45 45 0 0 1 0 60"/></g><circle cx="360" cy="190" r="16" fill="#fff" fill-opacity=".8"/>' +
      (s.live ? '<rect x="44" y="44" width="104" height="44" rx="10" fill="#fff"/><text x="96" y="76" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="26" fill="#e0152f">LIVE</text>' : '');
    gradCover('cover_' + s.id, s.name, s.color, waves, s.live);
  });

  const isFav = (id) => (lib().favs || []).includes(id);
  function toggleFav(id) {
    const L = lib();
    const favs = (L.favs || []).slice();
    const i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.unshift(id);
    JC.store.update('mlib', 'lib', { favs });
    JC.audio.haptic(10);
    JC.ui.toast(i >= 0 ? 'Removed from Favorites' : 'Added to Favorites', { icon: i >= 0 ? 'star' : 'star.fill' });
  }
  const playlists = () => JC.store.all('mplaylists');
  const playlist = (id) => JC.store.get('mplaylists', id);
  function isDownloaded(id) {
    const s = D.song(id);
    const L = lib();
    if ((L.dlSongs || []).includes(id)) return true;
    if (s && (L.dlAlbums || []).includes(s.album)) return true;
    return playlists().some((p) => p.dl && p.songs.includes(id));
  }
  function songsDur(ids) { return ids.reduce((a, id) => a + M().dur(id), 0); }
  function fmtTotal(ids) {
    const mins = Math.round(songsDur(ids) / 60);
    return U.plural(ids.length, 'song') + ', ' + (mins >= 60 ? Math.floor(mins / 60) + ' hour ' + (mins % 60) + ' minutes' : U.plural(mins, 'minute'));
  }
  function ago(t) {
    const d = Math.max(0, JC.time.now() - t);
    const days = Math.floor(d / 86400e3);
    if (days < 1) return 'Updated today';
    if (days === 1) return 'Updated yesterday';
    if (days < 7) return 'Updated ' + days + 'd ago';
    if (days < 60) return 'Updated ' + Math.floor(days / 7) + 'w ago';
    return 'Updated ' + U.fmtDate(t, 'medium');
  }

  /** generic lookup for anything that can be a tile */
  function item(kind, id) {
    if (kind === 'playlist') {
      const mix = MIXES.find((m) => m.id === id);
      if (mix) return { kind, id, title: mix.title, sub: 'Made for You', art: 'cover_' + id, ids: mix.ids() };
      if (id === 'favorites') return { kind, id, title: 'Favorite Songs', sub: 'Apple Music', art: 'cover_mix_fav', ids: lib().favs || [] };
      const p = playlist(id);
      return p ? { kind, id, title: p.title, sub: p.by === 'Jiang Cheng' ? 'Playlist' : 'Playlist · ' + p.by, art: p.art, ids: p.songs, pl: p } : null;
    }
    if (kind === 'album') {
      const a = D.album(id);
      return a ? { kind, id, title: a.title, sub: D.artistName(a.artist), art: a.art, ids: a.songs } : null;
    }
    if (kind === 'station') {
      const s = D.stations.find((x) => x.id === id);
      return s ? { kind, id, title: s.name, sub: s.live ? 'LIVE · ' + s.show : 'Station', art: 'cover_' + id } : null;
    }
    if (kind === 'artist') {
      const a = D.artist(id);
      return a ? { kind, id, title: a.name + ' Station', sub: 'Station', art: a.art } : null;
    }
    if (kind === 'song') {
      const s = D.song(id);
      return s ? { kind, id, title: s.title, sub: D.artistName(s.artist), art: D.art(s), ids: [id] } : null;
    }
    if (kind === 'category' || kind === 'library') return null;
    return null;
  }

  // ── art helpers ──────────────────────────────────────────────────
  function coverEl(it, cls) {
    if (it && it.art) return JC.art.el(it.art, { cls: 'mu-art ' + (cls || '') });
    // mosaic for playlists without artwork
    const ids = (it && it.ids ? it.ids : []).slice(0, 4);
    const el = h('div.mu-art.mu-mosaic', { class: cls });
    if (!ids.length) { el.classList.add('empty'); el.appendChild(JC.icon('music.note', { size: 40 })); return el; }
    const arts = Array.from(new Set(ids.map((x) => D.art(D.song(x)))));
    if (arts.length < 4) { el.classList.add('single'); el.appendChild(JC.art.el(arts[0], { cls: 'mu-mos-i' })); return el; }
    arts.slice(0, 4).forEach((a) => el.appendChild(JC.art.el(a, { cls: 'mu-mos-i' })));
    return el;
  }

  // ════════════════════════════════════════════════════════════════
  JC.app({
    id: 'music',
    name: 'Music',
    status: 'auto',
    launch(win) {
      win.body.classList.add('app-music');
      const offs = [];
      const on = (ev, fn) => offs.push(JC.bus.on(ev, fn));
      let tabs = null;
      const push = (page) => tabs.nav().push(page);
      const tint = 'var(--mu-tint)';

      // ── shared bits ───────────────────────────────────────────────
      function sectionHead(title, onMore, sub) {
        return h('div.mu-shelf-h', { class: { tap: !!onMore }, onTap: onMore || undefined },
          h('div', h('span.mu-shelf-t', title), onMore ? JC.icon('chevron.right', { size: 15, weight: 2.8 }) : null, sub ? h('div.mu-shelf-sub', sub) : null));
      }
      function shelf(title, tiles, onMore, o) {
        return h('div.mu-shelf', { class: o && o.cls }, sectionHead(title, onMore, o && o.sub), h('div.mu-shelf-row.hscroll', tiles));
      }
      function tile(it, o) {
        o = o || {};
        if (!it) return null;
        const el = h('div.mu-tile', { class: o.cls, onTap: () => openItem(it) },
          h('div.mu-tile-art', coverEl(it), it.kind === 'station' || o.playBtn ? h('div.mu-tile-play', { onTap: (e) => { e.stopPropagation(); playItem(it); } }, JC.icon('play.fill', { size: 14 })) : null),
          h('div.mu-tile-t', it.title), it.sub ? h('div.mu-tile-s', o.sub || it.sub) : null);
        JC.ui.contextMenu(el, () => ({ items: itemMenu(it), preview: h('div.mu-ctx-prev', coverEl(it), h('div.mu-ctx-t', it.title), h('div.mu-ctx-s', it.sub || '')) }));
        return el;
      }
      function playItem(it, o) {
        o = o || {};
        if (it.kind === 'station') M().play(it.id);
        else if (it.kind === 'artist') M().play(it.id, { src: { kind: 'artist', id: it.id, title: it.title } });
        else if (it.kind === 'song') M().play(it.id);
        else M().play(it.id, { shuffle: !!o.shuffle });
      }
      function openItem(it) {
        if (it.kind === 'album') push(albumPage(it.id));
        else if (it.kind === 'playlist') push(playlistPage(it.id));
        else if (it.kind === 'station' || it.kind === 'artist') { playItem(it); JC.ui.toast('Playing ' + it.title, { icon: 'dot.radiowaves.left.and.right' }); }
        else if (it.kind === 'song') M().play(it.id);
      }
      function itemMenu(it) {
        const items = [
          { text: 'Play', icon: 'play.fill', onTap: () => playItem(it) },
        ];
        if (it.ids && it.ids.length) {
          items.push({ text: 'Shuffle', icon: 'shuffle', onTap: () => playItem(it, { shuffle: true }) });
          items.push({ text: 'Play Next', icon: 'text.badge.plus', onTap: () => { M().playNext(it.id); JC.ui.toast('Playing Next', { icon: 'text.badge.plus' }); } });
          items.push({ text: 'Play Last', icon: 'list.bullet', onTap: () => { M().playLast(it.id); JC.ui.toast('Playing Last', { icon: 'list.bullet' }); } });
        }
        items.push('-');
        items.push({ text: 'Share…', icon: 'square.and.arrow.up', onTap: () => shareItem(it) });
        return items;
      }
      function shareItem(it) {
        JC.ui.share({ title: it.title, subtitle: it.sub || 'Apple Music', art: it.art, payload: { kind: 'link', text: it.title + ' — ' + (it.sub || 'Apple Music'), url: 'https://music.apple.com/cn/' + it.kind + '/' + it.id } });
      }

      // song rows ------------------------------------------------------
      const bars = () => h('span.mu-bars', h('i'), h('i'), h('i'));
      function songRow(id, o) {
        o = o || {};
        const s = D.song(id);
        if (!s) return null;
        const lead = o.num != null ? h('div.mu-num', h('span.mu-num-n', String(o.num)), bars())
          : h('div.mu-row-art', JC.art.el(D.art(s), { cls: 'mu-art' }), bars());
        const sub = o.sub === false ? null : (o.sub || [D.artistName(s.artist), o.showAlbum ? D.album(s.album).title : null].filter(Boolean).join(' · '));
        const row = h('div.mu-row', { data: { song: id }, class: { 'with-num': o.num != null }, onTap: () => playFrom(id, o) },
          lead,
          h('div.mu-row-main',
            h('div.mu-row-t', h('span.mu-row-tt', s.title), s.explicit ? h('span.mu-e', 'E') : null, isFav(id) && !o.noStar ? h('span.mu-star', JC.icon('star.fill', { size: 10 })) : null),
            sub ? h('div.mu-row-s', isDownloaded(id) && o.dlMark ? JC.icon('arrow.down.circle.fill', { size: 11, cls: 'mu-dl' }) : null, sub) : null),
          o.right || null,
          h('div.mu-more', { onTap: (e) => { e.stopPropagation(); JC.ui.menu(e.currentTarget, songMenu(id, o)); } }, JC.icon('ellipsis', { size: 18 })));
        JC.ui.contextMenu(row, () => ({ items: songMenu(id, o), preview: h('div.mu-ctx-prev', JC.art.el(D.art(s), { cls: 'mu-art' }), h('div.mu-ctx-t', s.title), h('div.mu-ctx-s', D.artistName(s.artist) + ' · ' + D.album(s.album).title)) }));
        markRow(row);
        return row;
      }
      function playFrom(id, o) {
        if (o.queue) M().play(o.src ? o.src.id : id, { queue: o.queue, start: id, src: o.src });
        else M().play(id);
        JC.audio.haptic(6);
      }
      function songMenu(id, o) {
        o = o || {};
        const s = D.song(id);
        const fav = isFav(id);
        const dl = isDownloaded(id);
        const items = [
          { text: 'Add to a Playlist…', icon: 'text.badge.plus', onTap: () => addToPlaylist([id]) },
          { text: 'Play Next', icon: 'arrow.up.right', onTap: () => { M().playNext(id); JC.ui.toast('Playing Next', { icon: 'text.badge.plus' }); } },
          { text: 'Play Last', icon: 'list.bullet', onTap: () => { M().playLast(id); JC.ui.toast('Playing Last', { icon: 'list.bullet' }); } },
          '-',
          { text: fav ? 'Undo Favorite' : 'Favorite', icon: fav ? 'star.fill' : 'star', onTap: () => toggleFav(id) },
          { text: dl ? 'Remove Download' : 'Download', icon: dl ? 'minus.circle' : 'arrow.down.circle', onTap: () => toggleDownloadSong(id) },
          '-',
          o.noAlbum ? null : { text: 'Go to Album', icon: 'square.stack', onTap: () => { closeNP(); push(albumPage(s.album)); } },
          { text: 'Go to Artist', icon: 'music.mic', onTap: () => { closeNP(); push(artistPage(s.artist)); } },
          { text: 'Create Station', icon: 'dot.radiowaves.left.and.right', onTap: () => { M().play(null, { queue: [id].concat(D.songs.filter((x) => x.style === s.style && x.id !== id).map((x) => x.id)), start: id, src: { kind: 'station', id: 'st_' + id, title: s.title + ' Station' } }); JC.ui.toast('Playing ' + s.title + ' Station', { icon: 'dot.radiowaves.left.and.right' }); } },
          { text: 'Share Song…', icon: 'square.and.arrow.up', onTap: () => shareItem({ kind: 'song', id, title: s.title, sub: D.artistName(s.artist), art: D.art(s) }) },
        ];
        if (o.playlist) {
          items.push('-');
          items.push({ text: 'Remove from Playlist', icon: 'minus.circle', destructive: true, onTap: () => { const p = playlist(o.playlist); if (!p) return; const songs = p.songs.slice(); const k = o.index != null ? o.index : songs.indexOf(id); if (k >= 0) songs.splice(k, 1); JC.store.update('mplaylists', p.id, { songs, t: JC.time.now() }); JC.ui.toast('Removed from ' + p.title); } });
        }
        return items.filter(Boolean);
      }
      function toggleDownloadSong(id) {
        const L = lib();
        const dlSongs = (L.dlSongs || []).slice();
        const s = D.song(id);
        if (isDownloaded(id)) {
          const i = dlSongs.indexOf(id);
          if (i >= 0) dlSongs.splice(i, 1);
          // un-download the album too, keep its other songs
          const dlAlbums = (L.dlAlbums || []).filter((a) => a !== s.album);
          if ((L.dlAlbums || []).includes(s.album)) D.album(s.album).songs.forEach((x) => { if (x !== id && !dlSongs.includes(x)) dlSongs.push(x); });
          JC.store.update('mlib', 'lib', { dlSongs, dlAlbums });
          JC.ui.toast('Download removed', { icon: 'minus.circle' });
        } else {
          dlSongs.push(id);
          JC.store.update('mlib', 'lib', { dlSongs });
          JC.ui.toast('Downloaded “' + s.title + '”', { icon: 'arrow.down.circle.fill' });
        }
      }
      function addToPlaylist(ids) {
        const mine = playlists();
        const sh = JC.ui.sheet({
          title: 'Add to a Playlist', detent: 'large', left: { text: 'Cancel' },
          content: () => [
            JC.ui.list([{ rows: [{ icon: { glyph: 'plus', bg: 'var(--fill3)', color: 'var(--mu-tint)' }, title: 'New Playlist…', tinted: true, onTap: () => { sh.close(); newPlaylist(ids); } }] }]),
            JC.ui.list([{ header: 'All Playlists', rows: mine.map((p) => ({ leading: coverEl(item('playlist', p.id), 'mu-pick-art'), title: p.title, subtitle: U.plural(p.songs.length, 'song'), onTap: () => {
              const songs = p.songs.concat(ids.filter((x) => !p.songs.includes(x) || true));
              JC.store.update('mplaylists', p.id, { songs, t: JC.time.now() });
              sh.close();
              JC.ui.toast('Added to “' + p.title + '”', { icon: 'checkmark' });
            } })) }]),
          ],
        });
      }
      function newPlaylist(ids) {
        JC.ui.alert({ title: 'New Playlist', message: 'Name your playlist.', input: { placeholder: 'Playlist Name', value: '' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Create', style: 'default' }] }).then((r) => {
          if (r.index !== 1) return;
          const title = (r.value || '').trim() || 'New Playlist';
          const p = JC.store.add('mplaylists', { title, art: null, by: 'Jiang Cheng', desc: '', songs: (ids || []).slice(), t: JC.time.now(), dl: false, mine: true }, { front: true });
          JC.ui.toast('Created “' + title + '”', { icon: 'checkmark' });
          if (!ids || !ids.length) push(playlistPage(p.id));
        });
      }

      // mark current-song rows without re-rendering
      function markRow(row) {
        const st = M().state();
        const cur = st.cur === row.dataset.song;
        row.classList.toggle('mu-cur', cur);
        row.classList.toggle('mu-cur-playing', cur && st.playing);
      }
      function markAll() { win.body.querySelectorAll('.mu-row[data-song]').forEach(markRow); }

      // ── HOME ───────────────────────────────────────────────────────
      function avatarBtn() {
        return h('div.mu-me', { onTap: () => accountSheet() }, JC.ui.avatar('me', 34));
      }
      function homePage() {
        return JC.ui.page({
          title: 'Home', large: true, tint, largeRight: avatarBtn(), refreshOnShow: true,
          content: () => {
            const L = lib();
            const recent = (L.recent || []).map((r) => item(r.kind, r.id)).filter(Boolean);
            const picks = [
              { it: item('playlist', 'pl_lotus'), k: 'Your Late-Night Favorite', note: 'Played most after midnight' },
              { it: item('playlist', 'pl_aling'), k: 'Made by A-Ling', note: U.plural((item('playlist', 'pl_aling') || { ids: [] }).ids.length, 'song') + ' you haven’t played yet' },
              { it: item('album', 'yl'), k: 'Because You Listened', note: 'You played “Come Home for Soup” ' + ((L.plays || {}).yl5 || 0) + ' times' },
              { it: item('station', 'st_iron'), k: 'Station', note: 'For 5:30 a.m.' },
            ].filter((x) => x.it);
            return [
              h('div.mu-shelf', sectionHead('Top Picks for You'), h('div.mu-shelf-row.hscroll.mu-picks', picks.map((p) => h('div.mu-pick', { onTap: () => openItem(p.it) },
                h('div.mu-pick-k', p.k),
                h('div.mu-pick-card', coverEl(p.it, 'mu-pick-cov'), h('div.mu-pick-foot', h('div.mu-pick-bg', { style: { backgroundImage: `url("${JC.art.url(p.it.art || 'cover_mix_fav')}")` } }), h('div.mu-pick-shade'), h('div.mu-pick-t', p.it.title), h('div.mu-pick-s', p.note))))))),
              recent.length ? shelf('Recently Played', recent.slice(0, 10).map((it) => tile(it)), () => push(recentPage())) : null,
              shelf('Made for You', MIXES.map((m) => tile(item('playlist', m.id), { playBtn: true }))),
              shelf('Stations for You', D.stations.map((s) => tile(item('station', s.id))).concat([tile(item('artist', 'gusu')), tile(item('artist', 'purple'))])),
              shelf('More Like Shen Yao', [tile(item('album', 'sy')), tile(item('album', 'ln')), tile(item('playlist', 'pl_shijie')), tile(item('album', 'cl'))]),
              h('div.mu-foot-note', 'Recommendations are based on what you play. A-Ling’s playlist is not.'),
            ];
          },
        });
      }
      function recentPage() {
        return JC.ui.page({ title: 'Recently Played', tint, content: () => [h('div.mu-grid', (lib().recent || []).map((r) => tile(item(r.kind, r.id))).filter(Boolean))] });
      }
      function accountSheet() {
        // "Share with Friends" is on: A-Ling switched it on in September. The engine reports it with music_play.
        const prefs = Object.assign({ history: true, friends: true, notif: true }, (lib().prefs || {}));
        let sheet = null;
        const setP = (k, v) => {
          prefs[k] = v;
          JC.store.update('mlib', 'lib', { prefs: Object.assign({}, lib().prefs || {}, prefs) });
          if (k === 'friends' && sheet) setTimeout(() => sheet.render(), 260);
        };
        sheet = JC.ui.sheet({
          title: 'Account', detent: 'large', right: { text: 'Done' },
          content: () => [
            h('div.mu-acct', JC.ui.avatar('me', 76), h('div.mu-acct-n', 'Jiang Cheng'), h('div.mu-acct-s', 'jiang.cheng@lotuspier.yunmeng')),
            JC.ui.list([
              { rows: [
                { title: 'Apple Music Family', subtitle: 'Renews November 3 · ¥17/month', detail: '2 members', chevron: true, onTap: () => JC.ui.alert({ title: 'Family Members', message: 'Jiang Cheng (Organizer)\nA-Ling (Jin Ling) — “jiujiu i added myself, ur welcome”', buttons: [{ text: 'OK' }] }) },
                { title: 'Redeem Gift Card or Code', tinted: true, onTap: () => JC.ui.alert({ title: 'Redeem Code', message: 'Enter your code.', input: { placeholder: 'Code', cap: 'characters' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Redeem', style: 'default' }] }).then((r) => { if (r.index === 1) setTimeout(() => JC.ui.alert({ title: 'Code Already Redeemed', message: 'This code was redeemed on October 18, 2025 by A-Ling.', buttons: [{ text: 'OK' }] }), 300); }) },
                { title: 'Send Gift Card by Email', tinted: true, onTap: () => JC.os.open('mail', { compose: { to: '', subject: 'An Apple Music gift for you', body: '' } }) },
              ] },
              { header: 'Privacy', rows: [
                { title: 'Use Listening History', toggle: { on: prefs.history, onChange: (v) => setP('history', v) } },
                { title: 'Share with Friends', toggle: { on: prefs.friends, onChange: (v) => setP('friends', v) } },
              ], footer: prefs.friends ? 'Music you play affects Recently Played and your recommendations. Friends who follow you can see what you’re listening to: A-Ling turned this on in September (“so i can see if ur still listening to sad lake music”).' : 'Music you play affects Recently Played and your recommendations. Nobody can see what you’re listening to.' },
              { header: 'Notifications', rows: [{ title: 'New Music & Pre-Adds', toggle: { on: prefs.notif, onChange: (v) => setP('notif', v) } }] },
              { rows: [{ title: 'Music Settings', chevron: true, onTap: () => JC.os.open('settings', { page: 'app:music' }) }] },
            ]),
          ],
        });
      }

      // ── NEW ────────────────────────────────────────────────────────
      const CHART = ['kt1', 'kt2', 'kt6', 'kt3', 'pl4', 'yl2', 'kt4', 'kt5', 'rn1', 'yl1', 'pl1', 'sj1', 'yl5', 'kt2', 'cr2'].filter((v, i, a) => a.indexOf(v) === i);
      function newPage() {
        const heroes = [
          { k: 'NEW ALBUM', t: 'Koi Records Presents: Golden Hour', s: 'The autumn gala sound — Koi Pond Boys, Peony & the Golden Carp, LANLING DRIFT.', art: 'cover_koi_records', open: () => push(albumPage('kr')) },
          { k: 'UPDATED PLAYLIST', t: 'Top 25: Lanling', s: 'The most-played songs in Lanling right now.', art: 'cover_mix_new', open: () => push(chartPage()) },
          { k: 'COMING SOON', t: 'Sunday Soup', s: 'Yiling Laozu & the Radishes — a new single. Pre-add it now.', art: 'cover_yiling_flute', open: () => push(preaddPage()) },
        ];
        return JC.ui.page({
          title: 'New', large: true, tint, largeRight: avatarBtn(), refreshOnShow: true,
          content: () => [
            h('div.mu-heroes.hscroll', heroes.map((x) => h('div.mu-hero', { onTap: x.open },
              h('div.mu-hero-k', x.k), h('div.mu-hero-t', x.t), h('div.mu-hero-s', x.s),
              h('div.mu-hero-card', JC.art.el(x.art, { cls: 'mu-hero-art' }), h('div.mu-hero-glow', { style: { backgroundImage: `url("${JC.art.url(x.art)}")` } }))))),
            shelf('New Releases', ['kr', 'zd', 'rn', 'yl', 'ln'].map((a) => tile(item('album', a))), () => push(albumsPage('New Releases', ['kr', 'zd', 'rn', 'yl', 'ln']))),
            h('div.mu-shelf', sectionHead('Top Songs: Lanling', () => push(chartPage())), h('div.mu-chart-cols.hscroll', [0, 1, 2].map((c) => h('div.mu-chart-col', CHART.slice(c * 4, c * 4 + 4).map((id, j) => songRow(id, { num: c * 4 + j + 1, queue: CHART, src: { kind: 'chart', id: 'chart', title: 'Top 25: Lanling' }, noStar: true })))))),
            shelf('Koi Records Spotlight', ['koipond', 'peony', 'drift', 'fairy8'].map((a) => artistTile(a))),
            shelf('Everyday Listening', D.categories.slice(0, 6).map((c) => catTile(c))),
          ],
        });
      }
      function artistTile(id) {
        const a = D.artist(id);
        return h('div.mu-atile', { onTap: () => push(artistPage(id)) }, JC.art.el(a.art, { cls: 'mu-atile-art' }), h('div.mu-tile-t', a.name));
      }
      function catTile(c) {
        return h('div.mu-cat', { style: { '--c': c.color }, onTap: () => push(categoryPage(c)) }, h('div.mu-cat-t', c.title), JC.art.el(D.art(D.song(catIds(c)[0])), { cls: 'mu-cat-art' }));
      }
      const catIds = (c) => (c.ids ? c.ids.slice() : byStyle(c.styles));
      function chartPage() {
        return JC.ui.page({
          title: 'Top 25: Lanling', tint, bg: 'plain',
          content: () => [
            h('div.mu-chart-head', JC.art.el('cover_mix_new', { cls: 'mu-art mu-chart-art' }), h('div', h('div.mu-ph-t', 'Top 25: Lanling'), h('div.mu-ph-s', 'Apple Music · Updated daily'))),
            playButtons(() => M().play(null, { queue: CHART, src: { kind: 'chart', id: 'chart', title: 'Top 25: Lanling' } }), () => M().play(null, { queue: CHART, shuffle: true, src: { kind: 'chart', id: 'chart', title: 'Top 25: Lanling' } })),
            h('div.mu-list', CHART.map((id, i) => songRow(id, { num: i + 1, queue: CHART, src: { kind: 'chart', id: 'chart', title: 'Top 25: Lanling' }, right: h('span.mu-move', { class: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'same' : 'down' }, JC.icon(i % 3 === 0 ? 'arrow.up' : i % 3 === 1 ? 'minus' : 'arrow.down', { size: 11, weight: 2.8 })) }))),
            h('div.mu-foot-note', 'Chart positions are based on plays in Lanling this week.'),
          ],
        });
      }
      function preaddPage() {
        return JC.ui.page({
          title: 'Sunday Soup', tint, bg: 'plain', refreshOnShow: true,
          content: (pg) => {
            const added = !!lib().preadd;
            return [
              h('div.mu-ph', h('div.mu-ph-art', JC.art.el('cover_yiling_flute', { cls: 'mu-art' }), h('div.mu-soon', 'COMING SUNDAY')),
                h('div.mu-ph-t', 'Sunday Soup — Single'), h('div.mu-ph-a', { onTap: () => push(artistPage('yiling')) }, 'Yiling Laozu & the Radishes'),
                h('div.mu-ph-m', 'Folk · 2026 · Expected October 18')),
              h('div.mu-btns', mbtn(added ? 'Added' : 'Pre-Add', added ? 'checkmark' : 'plus', () => {
                JC.store.update('mlib', 'lib', { preadd: !added });
                JC.ui.toast(added ? 'Removed from Pre-Adds' : 'You’ll be notified when “Sunday Soup” is available', { icon: added ? 'minus.circle' : 'bell.fill' });
                pg.render();
              })),
              h('div.mu-list', h('div.mu-row.static-row', h('div.mu-num', '1'), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', 'Sunday Soup')), h('div.mu-row-s', 'Available Sunday')), h('div.mu-more', { onTap: () => JC.ui.toast('Not available yet', { icon: 'clock' }) }, JC.icon('ellipsis', { size: 18 })))),
              h('div.mu-desc', 'From the band’s Wavelet: “new song about a soup we keep burning. dedicated to someone who knows who he is. 🍲”'),
            ];
          },
        });
      }

      // ── RADIO ──────────────────────────────────────────────────────
      function radioPage() {
        const hero = D.stations[0];
        return JC.ui.page({
          title: 'Radio', large: true, tint, largeRight: avatarBtn(),
          content: () => [
            h('div.mu-radio-hero', { onTap: () => { M().play(hero.id); JC.ui.toast('Tuning in to ' + hero.name, { icon: 'dot.radiowaves.left.and.right' }); } },
              JC.art.el('cover_' + hero.id, { cls: 'mu-radio-art' }),
              h('div.mu-radio-meta',
                h('div.mu-live', h('span.mu-live-dot'), 'LIVE · 23:00–02:00'),
                h('div.mu-radio-t', hero.show), h('div.mu-radio-s', hero.name + ' ' + hero.host),
                h('div.mu-radio-d', hero.desc),
                mbtn('Listen Now', 'play.fill', (e) => { e.stopPropagation(); M().play(hero.id); }, 'mu-listen'))),
            shelf('Live Now', D.stations.filter((s) => s.live).map((s) => tile(item('station', s.id)))),
            shelf('Stations for You', D.stations.filter((s) => !s.live).map((s) => tile(item('station', s.id)))),
            shelf('Artist Stations', ['gusu', 'yiling', 'purple', 'shenyao', 'nighttaxi'].map((a) => h('div.mu-atile', { onTap: () => { M().play(a, { src: { kind: 'artist', id: a, title: D.artistName(a) + ' Station' } }); JC.ui.toast('Playing ' + D.artistName(a) + ' Station', { icon: 'dot.radiowaves.left.and.right' }); } }, JC.art.el(D.artist(a).art, { cls: 'mu-atile-art' }), h('div.mu-tile-t', D.artistName(a)), h('div.mu-tile-s', 'Station')))),
            h('div.mu-radio-shows',
              sectionHead('Tonight on Lotus FM'),
              JC.ui.list([{ rows: [
                { title: 'Late Night Lake', subtitle: '23:00 · DJ Peony · guqin & quiet songs', detail: 'On Air', onTap: () => M().play(hero.id) },
                { title: 'The Ferry Hour', subtitle: '02:00 · lo-fi and rain', detail: '02:00', onTap: () => JC.ui.toast('Starts at 02:00 — we’ll be here', { icon: 'clock' }) },
                { title: 'Morning Market', subtitle: '06:00 · folk, radishes, traffic', detail: '06:00', onTap: () => JC.ui.toast('Starts at 06:00', { icon: 'clock' }) },
              ] }]),
            ),
          ],
        });
      }

      // ── LIBRARY ────────────────────────────────────────────────────
      function libraryPage() {
        const libRow = (icon, title, open) => h('div.mu-librow', { onTap: open }, JC.icon(icon, { size: 22, cls: 'mu-lib-ic' }), h('div.mu-lib-t', title), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'mu-lib-chev' }));
        return JC.ui.page({
          title: 'Library', large: true, tint, refreshOnShow: true,
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'New Playlist…', icon: 'text.badge.plus', onTap: () => newPlaylist() },
            { text: 'Shuffle All', icon: 'shuffle', onTap: () => M().play('all', { shuffle: true }) },
            '-',
            { text: 'Downloaded Only', icon: 'arrow.down.circle', onTap: () => push(downloadedPage()) },
          ]) })],
          largeRight: avatarBtn(),
          content: () => {
            const recent = playlists().map((p) => ({ it: item('playlist', p.id), t: p.t || 0 }))
              .concat(D.albums.map((a) => ({ it: item('album', a.id), t: JC.time.parse(a.year + '-06-01') })))
              .sort((a, b) => b.t - a.t).map((x) => x.it).filter(Boolean);
            return [
              h('div.mu-libs',
                libRow('music.note.list', 'Playlists', () => push(playlistsPage())),
                libRow('music.mic', 'Artists', () => push(artistsPage())),
                libRow('square.stack', 'Albums', () => push(albumsPage('Albums', D.albums.map((a) => a.id)))),
                libRow('music.note', 'Songs', () => push(songsPage())),
                libRow('star', 'Favorite Songs', () => push(playlistPage('favorites'))),
                libRow('person.crop.square', 'Made for You', () => push(madeForYouPage())),
                libRow('arrow.down.circle', 'Downloaded', () => push(downloadedPage()))),
              h('div.mu-sec-t', 'Recently Added'),
              h('div.mu-grid', recent.map((it) => tile(it))),
            ];
          },
        });
      }
      function playlistsPage() {
        return JC.ui.page({
          title: 'Playlists', tint, refreshOnShow: true,
          right: [JC.ui.navBtn({ icon: 'plus', onTap: () => newPlaylist() })],
          content: () => [
            h('div.mu-list',
              h('div.mu-row.mu-newpl', { onTap: () => newPlaylist() }, h('div.mu-row-art.mu-newpl-art', JC.icon('plus', { size: 26, weight: 2.4 })), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', 'New Playlist…')))),
              h('div.mu-row', { onTap: () => push(playlistPage('favorites')) }, h('div.mu-row-art', coverEl(item('playlist', 'favorites'))), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', 'Favorite Songs')), h('div.mu-row-s', 'Apple Music')), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'mu-chev' })),
              playlists().map((p) => {
                const it = item('playlist', p.id);
                const row = h('div.mu-row', { onTap: () => push(playlistPage(p.id)) }, h('div.mu-row-art', coverEl(it)), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', p.title)), h('div.mu-row-s', p.by === 'Jiang Cheng' ? (p.dl ? 'Downloaded · ' : '') + U.plural(p.songs.length, 'song') : 'by ' + p.by)), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'mu-chev' }));
                JC.ui.contextMenu(row, () => ({ items: itemMenu(it).concat(['-', { text: 'Delete from Library', icon: 'trash', destructive: true, onTap: () => deletePlaylist(p.id) }]) }));
                return row;
              })),
          ],
        });
      }
      function deletePlaylist(id) {
        const p = playlist(id);
        if (!p) return;
        const aling = p.byId === 'jl';
        JC.ui.alert({
          title: 'Delete “' + p.title + '”?',
          message: aling ? 'A-Ling made this playlist on your account. The description says “DONT delete it.”' : 'This playlist will be deleted from your library.',
          buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete Playlist', style: 'destructive' }],
        }).then((r) => {
          if (r.index !== 1) return;
          JC.store.remove('mplaylists', id);
          const n = tabs.nav();
          if (n.top() && n.top().data && n.top().data.pl === id) n.pop();
          JC.ui.toast(aling ? 'Deleted. He will notice.' : 'Playlist deleted', { icon: 'trash' });
        });
      }
      function artistsPage() {
        const list = D.artists.slice().sort((a, b) => a.name.localeCompare(b.name));
        return JC.ui.page({ title: 'Artists', tint, content: () => [h('div.mu-list', list.map((a) => h('div.mu-row.mu-arow', { onTap: () => push(artistPage(a.id)) }, JC.art.el(a.art, { cls: 'mu-arow-art' }), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', a.name))), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'mu-chev' }))))] });
      }
      function albumsPage(title, ids) {
        return JC.ui.page({ title, tint, content: () => [h('div.mu-grid', ids.map((a) => tile(item('album', a))))] });
      }
      function songsPage() {
        const all = D.songs.slice().sort((a, b) => a.title.replace(/^the /i, '').localeCompare(b.title.replace(/^the /i, ''))).map((s) => s.id);
        const src = { kind: 'library', id: 'all', title: 'Songs' };
        let fq = '';
        const page = JC.ui.page({
          title: 'Songs', tint,
          search: { placeholder: 'Find in Songs', onInput: (q) => { fq = q.trim().toLowerCase(); page.render(); } },
          content: () => {
            const ids = all.filter((id) => { const s = D.song(id); return !fq || (s.title + ' ' + D.artistName(s.artist)).toLowerCase().includes(fq); });
            return [
              fq ? null : playButtons(() => M().play(null, { queue: all, src }), () => M().play(null, { queue: all, shuffle: true, src })),
              ids.length ? h('div.mu-list', ids.map((id) => songRow(id, { queue: all, src, dlMark: true }))) : JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results' }),
              h('div.mu-foot-note', U.plural(D.songs.length, 'song') + ', ' + Math.round(songsDur(all) / 60) + ' minutes'),
            ];
          },
        });
        return page;
      }
      function madeForYouPage() {
        return JC.ui.page({ title: 'Made for You', tint, content: () => [h('div.mu-grid', MIXES.map((m) => tile(item('playlist', m.id), { playBtn: true })))] });
      }
      function downloadedPage() {
        return JC.ui.page({
          title: 'Downloaded', tint, refreshOnShow: true,
          content: () => {
            const ids = D.songs.filter((s) => isDownloaded(s.id)).map((s) => s.id);
            const src = { kind: 'library', id: 'downloaded', title: 'Downloaded' };
            return ids.length ? [
              h('div.mu-dl-head', JC.icon('arrow.down.circle.fill', { size: 18 }), h('span', U.plural(ids.length, 'song') + ' · ' + (ids.length * 7.4).toFixed(1) + ' MB on this iPhone')),
              playButtons(() => M().play(null, { queue: ids, src }), () => M().play(null, { queue: ids, src, shuffle: true })),
              h('div.mu-list', ids.map((id) => songRow(id, { queue: ids, src }))),
            ] : [JC.ui.empty({ icon: 'arrow.down.circle', title: 'No Downloads', text: 'Download music to listen without a connection.' })];
          },
        });
      }
      function mbtn(text, icon, onTap, cls) {
        return h('div.mu-btn', { class: cls, onTap: (e) => { JC.audio.haptic(6); onTap(e); } }, icon ? JC.icon(icon, { size: 17, weight: 2.2 }) : null, h('span', text));
      }
      function playButtons(play, shuffle) {
        return h('div.mu-btns', mbtn('Play', 'play.fill', play), mbtn('Shuffle', 'shuffle', shuffle));
      }

      // album page ---------------------------------------------------------
      function albumPage(id) {
        const a = D.album(id);
        const src = { kind: 'album', id, title: a.title };
        const albumMenu = (e) => JC.ui.menu(e.currentTarget, [
              { text: 'Add to a Playlist…', icon: 'text.badge.plus', onTap: () => addToPlaylist(a.songs) },
              { text: 'Play Next', icon: 'arrow.up.right', onTap: () => { M().playNext(id); JC.ui.toast('Playing Next', { icon: 'text.badge.plus' }); } },
              { text: 'Play Last', icon: 'list.bullet', onTap: () => { M().playLast(id); JC.ui.toast('Playing Last'); } },
              '-',
              { text: 'Go to Artist', icon: 'music.mic', onTap: () => push(artistPage(a.artist === 'various' ? 'koipond' : a.artist)) },
              { text: 'Share Album…', icon: 'square.and.arrow.up', onTap: () => shareItem(item('album', id)) },
            ]);
        return JC.ui.page({
          title: '', tint, bg: 'plain', data: { al: id }, refreshOnShow: true,
          onScroll: (y, p) => p.setTitle(y > 330 ? a.title : ''),
          content: (p) => [
            (p.setRight([
              JC.ui.navBtn({ icon: (lib().dlAlbums || []).includes(id) ? 'arrow.down.circle.fill' : 'arrow.down.circle', onTap: (e) => toggleAlbumDl(id, e.currentTarget) }),
              JC.ui.navBtn({ icon: 'ellipsis', onTap: albumMenu }),
            ]), null),
            h('div.mu-ph',
              h('div.mu-ph-art', JC.art.el(a.art, { cls: 'mu-art' })),
              h('div.mu-ph-t', a.title),
              h('div.mu-ph-a', { onTap: () => push(artistPage(a.artist === 'various' ? 'koipond' : a.artist)) }, D.artistName(a.artist)),
              h('div.mu-ph-m', [a.genre, a.year, 'Lossless'].join(' · '))),
            playButtons(() => M().play(id), () => M().play(id, { shuffle: true })),
            h('div.mu-list.mu-tracks', a.songs.map((sid, i) => songRow(sid, { num: i + 1, queue: a.songs, src, sub: a.artist === 'various' ? D.artistName(D.song(sid).artist) : false, noAlbum: true, right: h('span.mu-dur', U.fmtDur(M().dur(sid))) }))),
            h('div.mu-album-foot', h('div', U.fmtDate(JC.time.parse(a.year + '-' + (id === 'kr' ? '10-09' : '05-20')), 'long').replace(/^\w+, /, '') + ', ' + a.year), h('div', fmtTotal(a.songs)), h('div', '℗ ' + a.year + ' ' + a.label)),
            a.sub ? h('div.mu-desc', a.sub) : null,
            shelf('More by ' + D.artistName(a.artist), D.albums.filter((x) => x.artist === a.artist && x.id !== id).map((x) => tile(item('album', x.id))).concat(a.artist === 'gusu' || a.artist === 'various' ? [] : [tile(item('artist', a.artist))])),
          ],
        });
      }
      function toggleAlbumDl(id, btn) {
        const L = lib();
        const dl = (L.dlAlbums || []).slice();
        const i = dl.indexOf(id);
        if (i >= 0) {
          JC.ui.actionSheet({ title: 'Remove Download?', message: 'Songs will stay in your library.', actions: [{ text: 'Remove Download', style: 'destructive', onTap: () => { dl.splice(i, 1); JC.store.update('mlib', 'lib', { dlAlbums: dl }); JC.ui.toast('Download removed'); refreshTop(); } }] });
          return;
        }
        dl.push(id);
        JC.ui.toast('Downloading “' + D.album(id).title + '”…', { icon: 'arrow.down.circle' });
        setTimeout(() => { JC.store.update('mlib', 'lib', { dlAlbums: dl }); JC.ui.toast('Downloaded', { icon: 'arrow.down.circle.fill' }); refreshTop(); }, 1400);
      }

      // playlist page (incl. Favorite Songs and mixes) ---------------------------------
      function playlistPage(id) {
        let editing = false;
        const page = JC.ui.page({
          title: '', tint, bg: 'plain', data: { pl: id }, refreshOnShow: true,
          onScroll: (y, p) => { const it = item('playlist', id); p.setTitle(y > 330 && it ? it.title : ''); },
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => plMenu(e.currentTarget) })],
          content: (p) => {
            const it = item('playlist', id);
            if (!it) return [JC.ui.empty({ icon: 'music.note.list', title: 'Playlist Deleted' })];
            const pl = it.pl;
            const ids = it.ids;
            const src = { kind: 'playlist', id, title: it.title };
            const mine = !!pl;
            const head = h('div.mu-ph',
              h('div.mu-ph-art', coverEl(it)),
              h('div.mu-ph-t', it.title),
              pl ? h('div.mu-ph-a', { onTap: () => { if (pl.byId) JC.os.open('contacts', { contact: pl.byId }); } }, pl.byId ? JC.ui.avatar(pl.byId, 20) : null, pl.by) : h('div.mu-ph-a', it.kind === 'playlist' && MIXES.find((m) => m.id === id) ? 'Made for You' : 'Apple Music'),
              pl ? h('div.mu-ph-m', ago(pl.t)) : h('div.mu-ph-m', id === 'favorites' ? 'Your starred songs' : 'Updated today'));
            const desc = pl && pl.desc ? h('div.mu-desc.clamp', { onTap: (e) => e.currentTarget.classList.toggle('clamp') }, pl.desc) : null;
            if (editing && pl) {
              return [head, desc, h('div.mu-edit-note', 'Drag ≡ to reorder. Tap ⊖ to remove.'), editList(pl)];
            }
            return [
              head, desc,
              ids.length ? playButtons(() => M().play(null, { queue: ids, src }), () => M().play(null, { queue: ids, src, shuffle: true })) : null,
              ids.length ? h('div.mu-list', ids.map((sid, i) => songRow(sid, { queue: ids, src, playlist: mine ? id : null, index: i, dlMark: true }))) :
                JC.ui.empty({ icon: 'music.note.list', title: 'No Songs', text: id === 'favorites' ? 'Tap ☆ on any song to favorite it.' : 'Add songs to this playlist.', action: mine ? { text: 'Add Songs', onTap: () => addSongsSheet(id) } : null }),
              ids.length ? h('div.mu-album-foot', h('div', fmtTotal(ids))) : null,
              mine && ids.length ? h('div.mu-addsongs', mbtn('Add Songs', 'plus', () => addSongsSheet(id), 'small')) : null,
              shelf('You Might Also Like', MIXES.slice(0, 3).map((m) => tile(item('playlist', m.id)))),
            ];
          },
        });
        function plMenu(anchor) {
          const it = item('playlist', id);
          const pl = it && it.pl;
          const items = [
            { text: 'Play Next', icon: 'arrow.up.right', onTap: () => { M().playNext(id); JC.ui.toast('Playing Next', { icon: 'text.badge.plus' }); } },
            { text: 'Play Last', icon: 'list.bullet', onTap: () => { M().playLast(id); JC.ui.toast('Playing Last'); } },
            '-',
          ];
          if (pl) {
            items.push({ text: pl.dl ? 'Remove Download' : 'Download', icon: pl.dl ? 'minus.circle' : 'arrow.down.circle', onTap: () => { JC.store.update('mplaylists', id, { dl: !pl.dl }); JC.ui.toast(pl.dl ? 'Download removed' : 'Downloading “' + pl.title + '”', { icon: 'arrow.down.circle' }); } });
            items.push({ text: 'Add Songs', icon: 'plus', onTap: () => addSongsSheet(id) });
            items.push({ text: 'Edit', icon: 'pencil', onTap: () => { editing = true; page.setRight([JC.ui.navBtn({ text: 'Done', prominent: true, onTap: () => { editing = false; page.setRight([JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => plMenu(e.currentTarget) })]); page.render(); } })]); page.render(); } });
            items.push({ text: 'Rename', icon: 'pencil', onTap: () => JC.ui.alert({ title: 'Rename Playlist', input: { value: pl.title, placeholder: 'Playlist Name' }, buttons: [{ text: 'Cancel', style: 'cancel' }, { text: 'Save', style: 'default' }] }).then((r) => { if (r.index === 1 && r.value && r.value.trim()) JC.store.update('mplaylists', id, { title: r.value.trim() }); }) });
          }
          items.push({ text: 'Share Playlist…', icon: 'square.and.arrow.up', onTap: () => shareItem(it) });
          if (pl) { items.push('-'); items.push({ text: 'Delete from Library', icon: 'trash', destructive: true, onTap: () => deletePlaylist(id) }); }
          JC.ui.menu(anchor, items);
        }
        return page;
      }
      function addSongsSheet(id) {
        let q = '';
        return JC.ui.sheet({
          title: 'Add Songs', detent: 'large', right: { text: 'Done' },
          content: () => {
            const body = h('div.mu-list');
            const field = JC.ui.search({ placeholder: 'Search Your Library', onInput: (v) => { q = v.trim().toLowerCase(); fill(); } });
            function fill() {
              const pp = playlist(id);
              body.innerHTML = '';
              D.songs.filter((x) => !q || (x.title + ' ' + D.artistName(x.artist)).toLowerCase().includes(q)).forEach((x) => {
                const inPl = !!(pp && pp.songs.includes(x.id));
                body.appendChild(h('div.mu-row', { onTap: () => {
                  const cur = playlist(id);
                  if (!cur) return;
                  JC.store.update('mplaylists', id, { songs: cur.songs.concat(x.id), t: JC.time.now() });
                  JC.audio.haptic(6);
                  JC.ui.toast('Added “' + x.title + '”', { icon: 'checkmark' });
                  fill();
                } }, h('div.mu-row-art', JC.art.el(D.art(x), { cls: 'mu-art' })), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', x.title)), h('div.mu-row-s', D.artistName(x.artist))),
                h('div.mu-add', { class: { on: inPl } }, JC.icon(inPl ? 'checkmark' : 'plus', { size: 16, weight: 2.6 }))));
              });
            }
            fill();
            return [h('div.mu-sheet-search', field), body];
          },
        });
      }
      function editList(pl) {
        const wrap = h('div.mu-list.mu-editlist');
        pl.songs.forEach((sid, i) => {
          const s = D.song(sid);
          if (!s) return;
          const handle = h('div.mu-handle', JC.icon('line.3.horizontal.handle', { size: 20 }));
          const row = h('div.mu-row.mu-erow', { data: { i } },
            h('div.mu-minus', { onTap: () => { const songs = pl.songs.slice(); songs.splice(i, 1); JC.store.update('mplaylists', pl.id, { songs, t: JC.time.now() }); } }, JC.icon('minus.circle.fill', { size: 22 })),
            h('div.mu-row-art', JC.art.el(D.art(s), { cls: 'mu-art' })),
            h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', s.title)), h('div.mu-row-s', D.artistName(s.artist))),
            handle);
          dragReorder(handle, row, wrap, (from, to) => {
            const songs = pl.songs.slice();
            const [x] = songs.splice(from, 1);
            songs.splice(to, 0, x);
            JC.store.update('mplaylists', pl.id, { songs, t: JC.time.now() });
          });
          wrap.appendChild(row);
        });
        return wrap;
      }
      /** vertical drag-to-reorder for a row inside a list container */
      function dragReorder(handle, row, list, done) {
        handle.__tap = true;
        handle.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rows = Array.from(list.children);
          const from = rows.indexOf(row);
          const rh = row.getBoundingClientRect().height || 60;
          const sc = (JC.os && JC.os.scale) || 1;
          const y0 = e.clientY;
          let to = from;
          row.classList.add('mu-dragging');
          const mv = (ev) => {
            const dy = (ev.clientY - y0) / sc;
            row.style.transform = `translateY(${dy}px)`;
            to = U.clamp(from + Math.round(dy / (rh / sc)), 0, rows.length - 1);
            rows.forEach((r, k) => {
              if (r === row) return;
              let shift = 0;
              if (from < to && k > from && k <= to) shift = -rh / sc;
              if (from > to && k < from && k >= to) shift = rh / sc;
              r.style.transform = shift ? `translateY(${shift}px)` : '';
            });
          };
          const up = () => {
            window.removeEventListener('pointermove', mv);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            rows.forEach((r) => { r.style.transform = ''; });
            row.classList.remove('mu-dragging');
            if (to !== from) { JC.audio.haptic(8); done(from, to); }
          };
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', up);
          window.addEventListener('pointercancel', up);
        });
      }

      // artist page -------------------------------------------------------------
      function artistPage(id) {
        const a = D.artist(id);
        return JC.ui.page({
          title: '', tint, bg: 'plain', transparentNav: true, refreshOnShow: true,
          onScroll: (y, p) => { p.setTitle(y > 300 ? a.name : ''); p.navbar.classList.toggle('transparent', y < 300); },
          right: [JC.ui.navBtn({ icon: 'ellipsis', onTap: (e) => JC.ui.menu(e.currentTarget, [
            { text: 'Play Station', icon: 'dot.radiowaves.left.and.right', onTap: () => M().play(id, { src: { kind: 'artist', id, title: a.name + ' Station' } }) },
            { text: 'Share Artist…', icon: 'square.and.arrow.up', onTap: () => shareItem({ kind: 'artist', id, title: a.name, sub: a.genre, art: a.art }) },
          ]) })],
          content: () => {
            const plays = lib().plays || {};
            const songs = D.songs.filter((s) => s.artist === id).map((s) => s.id).sort((x, y) => (plays[y] || 0) - (plays[x] || 0));
            const albums = D.albums.filter((x) => x.artist === id || x.songs.some((sid) => D.song(sid).artist === id));
            return [
              h('div.mu-ahero', JC.art.el(a.art, { cls: 'mu-ahero-art' }), h('div.mu-ahero-shade'), h('div.mu-ahero-name', a.name),
                h('div.mu-ahero-play', { onTap: () => M().play(id, { src: { kind: 'artist', id, title: a.name } }) }, JC.icon('play.fill', { size: 22 }))),
              h('div.mu-sec-t', 'Top Songs'),
              h('div.mu-list', songs.slice(0, 5).map((sid) => songRow(sid, { queue: songs, src: { kind: 'artist', id, title: a.name }, showAlbum: true, sub: D.album(D.song(sid).album).title + ' · ' + D.album(D.song(sid).album).year }))),
              shelf('Albums', albums.map((x) => tile(item('album', x.id)))),
              h('div.mu-about', h('div.mu-sec-t', 'About'), h('div.mu-about-t', a.bio), h('div.mu-about-m', (a.genre || '') + ' · Apple Music')),
              shelf('Similar Artists', D.artists.filter((x) => x.id !== id && x.genre === a.genre).concat(D.artists.filter((x) => x.id !== id && x.genre !== a.genre)).slice(0, 4).map((x) => artistTile(x.id))),
            ];
          },
        });
      }
      function categoryPage(c) {
        const ids = catIds(c);
        const src = { kind: 'category', id: c.id, title: c.title };
        return JC.ui.page({
          title: c.title, tint, large: true,
          content: () => [
            playButtons(() => M().play(c.id), () => M().play(c.id, { shuffle: true })),
            h('div.mu-list', ids.map((id) => songRow(id, { queue: ids, src }))),
            shelf('Albums', Array.from(new Set(ids.map((id) => D.song(id).album))).map((a) => tile(item('album', a)))),
          ],
        });
      }

      // ── SEARCH ─────────────────────────────────────────────────────
      let searchQ = '';
      let recentSearches = ['shen yao', 'peony season'];
      function searchPage() {
        const page = JC.ui.page({
          title: 'Search', large: true, tint,
          search: { placeholder: 'Artists, Songs, Lyrics, and More', onInput: (q) => { searchQ = q.trim().toLowerCase(); page.render(); }, onSubmit: (q) => { q = q.trim().toLowerCase(); if (q && !recentSearches.includes(q)) recentSearches.unshift(q); recentSearches = recentSearches.slice(0, 6); } },
          content: () => {
            const q = searchQ;
            if (!q) {
              return [
                recentSearches.length ? h('div.mu-recent-s', h('div.mu-rs-h', h('span', 'Recently Searched'), h('span.mu-rs-clear.tap', { onTap: () => { recentSearches = []; page.render(); } }, 'Clear')),
                  recentSearches.map((r) => h('div.mu-rs-row', { onTap: () => { page.searchEl.querySelector('input').value = r; searchQ = r; page.render(); } }, JC.icon('magnifyingglass', { size: 15 }), h('span', r)))) : null,
                h('div.mu-sec-t', 'Browse Categories'),
                h('div.mu-cats', D.categories.map((c) => catTile(c))),
              ];
            }
            const songs = D.songs.filter((s) => (s.title + ' ' + D.artistName(s.artist) + ' ' + D.album(s.album).title).toLowerCase().includes(q) || (s.lyrics && s.lyrics.some((x) => typeof x !== 'string' && x[1].toLowerCase().includes(q))));
            const artists = D.artists.filter((a) => a.name.toLowerCase().includes(q));
            const albums = D.albums.filter((a) => (a.title + ' ' + D.artistName(a.artist)).toLowerCase().includes(q));
            const pls = playlists().filter((p) => p.title.toLowerCase().includes(q));
            const lyricHit = (s) => { const l = s.lyrics && s.lyrics.find((x) => typeof x !== 'string' && x[1].toLowerCase().includes(q)); return l ? '“' + l[1] + '”' : null; };
            if (!songs.length && !artists.length && !albums.length && !pls.length) return [JC.ui.empty({ icon: 'magnifyingglass', title: 'No Results', text: 'Try a new search.' })];
            return [
              artists.length ? h('div.mu-sec-t', 'Artists') : null,
              artists.length ? h('div.mu-list', artists.map((a) => h('div.mu-row.mu-arow', { onTap: () => push(artistPage(a.id)) }, JC.art.el(a.art, { cls: 'mu-arow-art' }), h('div.mu-row-main', h('div.mu-row-t', h('span.mu-row-tt', a.name)), h('div.mu-row-s', 'Artist')), JC.icon('chevron.right', { size: 14, weight: 2.6, cls: 'mu-chev' })))) : null,
              songs.length ? h('div.mu-sec-t', 'Songs') : null,
              songs.length ? h('div.mu-list', songs.map((s) => songRow(s.id, { sub: lyricHit(s) || undefined }))) : null,
              albums.length ? shelf('Albums', albums.map((a) => tile(item('album', a.id)))) : null,
              pls.length ? shelf('Playlists', pls.map((p) => tile(item('playlist', p.id)))) : null,
            ];
          },
        });
        return page;
      }

      // ── tabs ───────────────────────────────────────────────────────
      tabs = JC.ui.tabs(win.body, {
        tint,
        tabs: [
          { id: 'home', title: 'Home', icon: 'house.fill', root: () => homePage() },
          { id: 'new', title: 'New', icon: 'square.grid.2x2.fill', root: () => newPage() },
          { id: 'radio', title: 'Radio', icon: 'dot.radiowaves.left.and.right', root: () => radioPage() },
          { id: 'library', title: 'Library', icon: 'music.note.list', root: () => libraryPage() },
        ],
        search: { id: 'search', title: 'Search', icon: 'magnifyingglass', root: () => searchPage() },
        active: 'home',
      });
      function refreshTop() {
        ['home', 'new', 'radio', 'library', 'search'].forEach((id) => {
          const n = tabs.nav(id);
          if (n && n.top()) n.top().render();
        });
      }

      // ── mini player ────────────────────────────────────────────────
      const miniArt = h('div.mu-mini-art');
      const miniT = h('div.mu-mini-t');
      const miniS = h('div.mu-mini-s');
      const miniPlay = h('div.mu-mini-btn', { onTap: (e) => { e.stopPropagation(); M().toggle(); JC.audio.haptic(6); } });
      const miniNext = h('div.mu-mini-btn', { onTap: (e) => { e.stopPropagation(); M().next(); } }, JC.icon('forward.fill', { size: 22 }));
      const mini = h('div.mu-mini', { onTap: () => openNP() }, miniArt, h('div.mu-mini-meta', miniT, miniS), miniPlay, miniNext);
      U.drag(mini, { axis: 'y', start: (e, p) => p.dy < 0, end: (e, p) => { if (p.dy < -30) openNP(); } });
      win.body.appendChild(mini);
      let miniArtId = null;
      function paintMini() {
        const np = M().nowPlaying();
        mini.classList.toggle('on', !!np);
        win.body.classList.toggle('mu-has-mini', !!np);
        win.body.classList.toggle('mu-is-playing', !!(np && np.playing));
        if (!np) return;
        if (miniArtId !== np.art) { miniArt.innerHTML = ''; miniArt.appendChild(JC.art.el(np.art, { cls: 'mu-art' })); miniArtId = np.art; }
        miniT.textContent = np.title;
        miniS.textContent = np.artist;
        miniPlay.innerHTML = '';
        miniPlay.appendChild(JC.icon(np.playing ? 'pause.fill' : 'play.fill', { size: 22 }));
      }

      // ── NOW PLAYING ────────────────────────────────────────────────
      let np = null;
      function buildNP() {
        const el = h('div.mu-np');
        const bg = h('div.mu-np-bg', h('div.mu-np-bgi'), h('div.mu-np-bgi.b2'));
        const shade = h('div.mu-np-shade');
        const grab = h('div.mu-np-grab', { onTap: () => closeNP() }, h('span'));
        const artWrap = h('div.mu-np-artwrap');
        const head = h('div.mu-np-head');
        const lyr = h('div.mu-np-lyr.scroll');
        const queue = h('div.mu-np-q.scroll');
        const title = h('div.mu-np-title');
        const artist = h('div.mu-np-artist', { onTap: () => { const s = D.song(M().state().cur); if (s) { closeNP(); tabs.select('library'); push(artistPage(s.artist)); } } });
        const star = h('div.mu-np-ibtn', { onTap: () => { const id = M().state().cur; if (id) { toggleFav(id); paint(true); } } });
        const more = h('div.mu-np-ibtn', { onTap: (e) => { const id = M().state().cur; if (id) JC.ui.menu(e.currentTarget, songMenu(id, {})); } }, JC.icon('ellipsis', { size: 18 }));
        const meta = h('div.mu-np-meta', h('div.mu-np-tt', title, artist), star, more);
        // scrubber
        const fill = h('div.mu-np-fill');
        const track = h('div.mu-np-track', fill);
        const tl = h('span.mu-np-time'), tr = h('span.mu-np-time'), badge = h('span.mu-np-badge', 'Lossless');
        const scrub = h('div.mu-np-scrub', track, h('div.mu-np-times', tl, badge, tr));
        let dragging = null;
        track.__tap = true;
        track.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          const r = track.getBoundingClientRect();
          const dur = M().dur();
          if (!dur) return;
          const at = (cx) => U.clamp((cx - r.left) / r.width, 0, 1) * dur;
          dragging = at(e.clientX);
          scrub.classList.add('drag');
          const mv = (ev) => { dragging = at(ev.clientX); paintProgress(); };
          const up = () => {
            window.removeEventListener('pointermove', mv);
            window.removeEventListener('pointerup', up);
            scrub.classList.remove('drag');
            const v = dragging;
            dragging = null;
            if (v != null) M().seek(v);
          };
          window.addEventListener('pointermove', mv);
          window.addEventListener('pointerup', up);
          paintProgress();
        });
        const prevB = h('div.mu-np-cbtn', { onTap: () => { bump(prevB); M().prev(); } }, JC.icon('backward.fill', { size: 38 }));
        const playB = h('div.mu-np-cbtn.big', { onTap: () => { bump(playB); M().toggle(); } });
        const nextB = h('div.mu-np-cbtn', { onTap: () => { bump(nextB); M().next(); } }, JC.icon('forward.fill', { size: 38 }));
        const ctrls = h('div.mu-np-ctrls', prevB, playB, nextB);
        const vol = JC.ui.slider({ value: JC.state.setting('volume') == null ? 0.6 : JC.state.setting('volume'), min: 0, max: 1, cls: 'mu-np-vol', icons: ['speaker.fill', 'speaker.wave.3.fill'], onInput: (v) => { volMute = true; JC.state.setting('volume', Math.round(v * 100) / 100); JC.audio.applyVolume(); volMute = false; } });
        const lyrB = h('div.mu-np-bbtn', { onTap: () => setMode(np.mode === 'lyrics' ? 'art' : 'lyrics') });
        const airB = h('div.mu-np-bbtn.air', { onTap: () => airplaySheet() });
        const qB = h('div.mu-np-bbtn', { onTap: () => setMode(np.mode === 'queue' ? 'art' : 'queue') }, JC.icon('list.bullet', { size: 22 }));
        const bottom = h('div.mu-np-bottom', lyrB, airB, qB);
        const inner = h('div.mu-np-inner', grab, head, artWrap, lyr, queue, meta, scrub, ctrls, h('div.mu-np-volrow', vol), bottom);
        el.append(bg, shade, inner);
        // drag down to dismiss
        U.drag(el, {
          axis: 'y',
          filter: (e) => !e.target.closest('.mu-np-track, .slider, .mu-np-lyr, .mu-np-q, .mu-np-cbtn, .mu-np-bbtn, .mu-np-ibtn'),
          start: (e, p) => p.dy > 0,
          move: (e, p) => { el.style.transform = `translateY(${Math.max(0, p.dy)}px)`; },
          end: (e, p) => { if (p.dy > 140 || p.vy > 0.6) closeNP(); else { U.anim(el, [{ transform: el.style.transform }, { transform: 'translateY(0)' }], { duration: 240 }).then(() => { el.style.transform = ''; el.getAnimations().forEach((a) => a.cancel()); }); } },
        });
        np = { el, bg, artWrap, head, lyr, queue, title, artist, star, fill, tl, tr, badge, scrub, playB, lyrB, airB, vol, mode: 'art', open: false, songId: null, raf: null, lyrUser: 0, get dragging() { return dragging; } };
        lyr.addEventListener('wheel', () => { np.lyrUser = performance.now(); }, { passive: true });
        lyr.addEventListener('pointerdown', () => { np.lyrUser = performance.now(); });
        return np;
      }
      let volMute = false;
      function bump(b) { U.anim(b, [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], { duration: 260 }); JC.audio.haptic(6); }
      function openNP(mode) {
        const cur = M().nowPlaying();
        if (!cur) { JC.ui.toast('Nothing is playing', { icon: 'music.note' }); return; }
        if (!np) buildNP();
        if (!np.el.isConnected) win.overlays.appendChild(np.el);
        np.mode = mode || np.mode || 'art';
        if (!np.open) {
          np.open = true;
          np.el.style.transform = '';
          U.anim(np.el, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 460, easing: 'cubic-bezier(.2,.9,.25,1)' }).then(() => np.el.getAnimations().forEach((a) => a.cancel()));
          win.setStatus('light');
        }
        paint(true);
        loop();
      }
      function closeNP() {
        if (!np || !np.open) return;
        np.open = false;
        cancelAnimationFrame(np.raf);
        win.setStatus('auto');
        const el = np.el;
        U.anim(el, [{ transform: el.style.transform || 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: 340 }).then(() => { el.remove(); el.style.transform = ''; el.getAnimations().forEach((a) => a.cancel()); });
      }
      function setMode(m) {
        if (!np) return;
        np.mode = m;
        np.lyrUser = 0;
        paint(true);
        if (m === 'lyrics') setTimeout(() => scrollLyric(true), 60);
      }
      function paint(full) {
        if (!np) return;
        const cur = M().nowPlaying();
        const st = M().state();
        if (!cur) { closeNP(); return; }
        const s = D.song(cur.id);
        np.el.className = 'mu-np m-' + np.mode + (cur.playing ? ' playing' : ' paused');
        if (np.songId !== cur.id || full) {
          const changed = np.songId !== cur.id;
          np.songId = cur.id;
          const url = `url("${JC.art.url(cur.art)}")`;
          np.bg.querySelectorAll('.mu-np-bgi').forEach((b) => { b.style.backgroundImage = url; });
          if (changed || !np.artWrap.firstChild) { np.artWrap.innerHTML = ''; np.artWrap.appendChild(JC.art.el(cur.art, { cls: 'mu-np-art' })); }
          np.title.textContent = s.title;
          np.artist.textContent = cur.artist;
          np.star.innerHTML = '';
          np.star.appendChild(JC.icon(isFav(cur.id) ? 'star.fill' : 'star', { size: 18 }));
          np.head.innerHTML = '';
          np.head.append(JC.art.el(cur.art, { cls: 'mu-np-hart' }), h('div.mu-np-htxt', h('div.mu-np-ht', s.title), h('div.mu-np-ha', cur.artist)),
            h('div.mu-np-ibtn', { onTap: () => { toggleFav(cur.id); paint(true); } }, JC.icon(isFav(cur.id) ? 'star.fill' : 'star', { size: 18 })),
            h('div.mu-np-ibtn', { onTap: (e) => JC.ui.menu(e.currentTarget, songMenu(cur.id, {})) }, JC.icon('ellipsis', { size: 18 })));
          np.badge.textContent = s.style === 'gym' || s.style === 'pop' ? 'Dolby Atmos' : 'Lossless';
          if (changed || !np.lyr.firstChild) { renderLyrics(cur.id); np.lyr.scrollTop = 0; lastLine = -1; }
        }
        np.lyrB.innerHTML = '';
        np.lyrB.appendChild(JC.icon(np.mode === 'lyrics' ? 'quote.bubble.fill' : 'quote.bubble', { size: 22 }));
        np.lyrB.classList.toggle('on', np.mode === 'lyrics');
        np.el.querySelectorAll('.mu-np-bbtn')[2].classList.toggle('on', np.mode === 'queue');
        np.airB.innerHTML = '';
        np.airB.appendChild(JC.icon('airplayaudio', { size: 22 }));
        if (st.airplay !== 'iphone') np.airB.appendChild(h('span.mu-air-l', airName(st.airplay)));
        np.playB.innerHTML = '';
        np.playB.appendChild(JC.icon(cur.playing ? 'pause.fill' : 'play.fill', { size: 46 }));
        if (np.mode === 'queue') renderQueue();
        paintProgress();
      }
      function paintProgress() {
        if (!np) return;
        const dur = M().dur();
        const pos = np.dragging != null ? np.dragging : M().pos();
        np.fill.style.width = (dur ? (pos / dur) * 100 : 0) + '%';
        np.tl.textContent = U.fmtDur(pos);
        np.tr.textContent = '-' + U.fmtDur(Math.max(0, dur - pos));
      }
      let lyrLines = [];
      function renderLyrics(id) {
        np.lyr.innerHTML = '';
        const L = M().lyrics(id);
        lyrLines = [];
        if (!L) {
          np.lyr.appendChild(h('div.mu-ly-none', JC.icon('quote.bubble', { size: 34 }), h('div', 'This song is instrumental.'), h('div.mu-ly-sub', 'Lyrics aren’t available — just the guqin, the lake and you.')));
          return;
        }
        L.forEach((l) => {
          const el = h('div.mu-ly', { class: { inst: !!l.inst }, onTap: () => { M().seek(l.t); if (!M().isPlaying()) M().resume(); np.lyrUser = 0; } }, l.inst ? h('span.mu-ly-dots', h('i'), h('i'), h('i')) : l.text);
          lyrLines.push({ t: l.t, el });
          np.lyr.appendChild(el);
        });
        np.lyr.appendChild(h('div.mu-ly-credit', 'Written by ' + D.artistName(D.song(id).artist) + '\nLyrics provided by Koi Lyrics Co.'));
      }
      let lastLine = -1;
      function scrollLyric(force) {
        if (!np || np.mode !== 'lyrics' || !lyrLines.length) return;
        const pos = M().pos();
        let i = -1;
        lyrLines.forEach((l, k) => { if (pos >= l.t - 0.15) i = k; });
        if (i !== lastLine || force) {
          lyrLines.forEach((l, k) => { l.el.classList.toggle('on', k === i); l.el.classList.toggle('past', k < i); });
          lastLine = i;
          if (i >= 0 && (force || performance.now() - np.lyrUser > 3000)) {
            const el = lyrLines[i].el;
            np.lyr.scrollTo({ top: Math.max(0, el.offsetTop - np.lyr.clientHeight * 0.28), behavior: force ? 'auto' : 'smooth' });
          }
        }
      }
      function renderQueue() {
        const st = M().state();
        const q = np.queue;
        const keep = q.scrollTop;
        q.innerHTML = '';
        const btn = (icon, onOff, label, fn) => h('div.mu-q-tbtn', { class: { on: onOff }, onTap: fn }, JC.icon(icon, { size: 18 }), h('span', label));
        q.append(
          h('div.mu-q-tools',
            btn('shuffle', st.shuffle, 'Shuffle', () => { M().setShuffle(!st.shuffle); JC.ui.toast(st.shuffle ? 'Shuffle Off' : 'Shuffle On', { icon: 'shuffle' }); }),
            btn(st.repeat === 'one' ? 'repeat.1' : 'repeat', st.repeat !== 'off', st.repeat === 'one' ? 'Repeat 1' : 'Repeat', () => { const nx = { off: 'all', all: 'one', one: 'off' }[st.repeat]; M().setRepeat(nx); JC.ui.toast({ all: 'Repeat All', one: 'Repeat One', off: 'Repeat Off' }[nx], { icon: nx === 'one' ? 'repeat.1' : 'repeat' }); }),
            btn('infinity', st.autoplay, 'Autoplay', () => { M().setAutoplay(!st.autoplay); JC.ui.toast(st.autoplay ? 'Autoplay Off' : 'Autoplay On — similar music keeps playing', { icon: 'infinity' }); })));
        const hist = st.queue.slice(0, st.qi);
        if (hist.length) {
          q.appendChild(h('div.mu-q-h', h('span', 'History'), h('span.mu-q-clear.tap', { onTap: () => JC.ui.toast('History cleared', { icon: 'trash' }) }, '')));
          hist.forEach((sid, i) => q.appendChild(qRow(sid, i, true)));
        }
        q.appendChild(h('div.mu-q-h', h('span', 'Continue Playing'), st.src ? h('span.mu-q-from', 'From ' + st.src.title) : null));
        const up = h('div.mu-q-list');
        st.queue.forEach((sid, i) => { if (i > st.qi) up.appendChild(qRow(sid, i, false, up)); });
        if (!up.children.length) up.appendChild(h('div.mu-q-empty', st.autoplay ? 'Autoplay will keep the music going.' : 'Nothing else is queued.'));
        q.appendChild(up);
        q.scrollTop = keep;
      }
      function qRow(sid, i, past, list) {
        const s = D.song(sid);
        const handle = past ? null : h('div.mu-handle', JC.icon('line.3.horizontal.handle', { size: 20 }));
        const inner = h('div.mu-q-row', { class: { past }, onTap: () => { const st = M().state(); M().play(null, { queue: st.queue, start: sid, src: st.src }); } },
          JC.art.el(D.art(s), { cls: 'mu-q-art' }), h('div.mu-q-main', h('div.mu-q-t', s.title), h('div.mu-q-s', D.artistName(s.artist))), handle);
        if (past) return inner;
        const row = h('div.mu-q-wrap', h('div.mu-q-rm', JC.icon('trash', { size: 18 })), inner);
        // swipe left to remove
        let dx0 = 0;
        U.drag(inner, {
          axis: 'x',
          filter: (e) => !e.target.closest('.mu-handle'),
          move: (e, p) => { dx0 = Math.min(0, p.dx); inner.style.transform = `translateX(${dx0}px)`; row.style.setProperty('--rm', Math.min(1, -dx0 / 120)); },
          end: (e, p) => {
            if (p.dx < -110) { U.anim(inner, [{ transform: inner.style.transform }, { transform: 'translateX(-420px)' }], { duration: 200 }).then(() => { M().removeAt(i); JC.ui.toast('Removed from Queue', { icon: 'minus.circle' }); }); }
            else { inner.style.transform = ''; row.style.setProperty('--rm', 0); }
          },
        });
        if (handle) dragReorder(handle, row, list, (from, to) => { const st = M().state(); const base = st.qi + 1; M().move(base + from, base + to); });
        return row;
      }
      function airName(id) {
        return { iphone: 'iPhone', airpods: 'JC’s AirPods Pro', sandu: 'Sandu GT', homepod: 'Study — Lotus Pier', tv: 'Room 1808 TV' }[id] || 'iPhone';
      }
      function airplaySheet() {
        const st = M().state();
        const bt = JC.state.setting('bt') && !JC.state.setting('airplane');
        const carGone = JC.story.flag && (JC.story.flag('car_handled') || JC.story.flag('car_cover'));
        const sh = JC.ui.sheet({
          title: 'AirPlay', detent: 'medium', left: { text: 'Done' },
          content: () => [JC.ui.list([{ header: 'Speakers & TVs', rows: [
            { icon: { glyph: 'iphone', bg: 'var(--fill3)', color: 'var(--label)' }, title: 'iPhone', check: st.airplay === 'iphone', onTap: () => { M().setAirplay('iphone'); sh.close(); } },
            { icon: { glyph: 'airpods', bg: 'var(--fill3)', color: 'var(--label)' }, title: 'JC’s AirPods Pro', subtitle: bt ? 'Not Connected' : 'Bluetooth is Off', onTap: () => { sh.close(); JC.ui.alert({ title: 'Couldn’t Connect', message: bt ? 'JC’s AirPods Pro aren’t nearby. They were last seen at the Golden Peony Hotel, Room 1808.' : 'Turn on Bluetooth to connect to AirPods.', buttons: bt ? [{ text: 'OK' }] : [{ text: 'Cancel', style: 'cancel' }, { text: 'Settings', style: 'default', onTap: () => JC.os.open('settings', { page: 'bluetooth' }) }] }); } },
            { icon: { glyph: 'car.side', bg: 'var(--fill3)', color: 'var(--label)' }, title: 'Sandu GT', subtitle: carGone ? 'CarPlay · Water detected' : 'CarPlay · Not Nearby', onTap: () => { sh.close(); JC.ui.alert({ title: 'Sandu GT Unavailable', message: carGone ? 'The car reports: “Moisture detected in cabin. Media unavailable.”\n\nThere are fish in it.' : 'Sandu GT was last connected Thursday at 15:41 in Lanling. Get closer to the car to use CarPlay.', buttons: [{ text: 'OK' }] }); } },
            { icon: { glyph: 'hifispeaker.fill', bg: 'var(--fill3)', color: 'var(--label)' }, title: 'Study — Lotus Pier', subtitle: 'HomePod · Not on this network', onTap: () => { sh.close(); JC.ui.toast('Study — Lotus Pier is 300 km away', { icon: 'hifispeaker.fill' }); } },
            { icon: { glyph: 'tv.fill', bg: 'var(--fill3)', color: 'var(--label)' }, title: 'Room 1808 TV', subtitle: 'Golden Peony Hotel · Unavailable', onTap: () => { sh.close(); JC.ui.alert({ title: 'Room 1808 TV', message: 'This TV is on the Golden Peony Guest network. Join it to AirPlay. (You are not in Room 1808.)', buttons: [{ text: 'OK' }] }); } },
          ] }])],
        });
      }
      function loop() {
        if (!np || !np.open) return;
        cancelAnimationFrame(np.raf);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const frame = (now) => {
          if (!np.open) return;
          paintProgress();
          scrollLyric(false);
          if (np.mode === 'art' && M().isPlaying() && !reduce) {
            const lv = M().levels();
            const t = now / 1000;
            const s = 1 + lv[0] * 0.018;
            np.artWrap.style.transform = `translateY(${(Math.sin(t * 0.9) * 2.2).toFixed(2)}px) scale(${s.toFixed(4)})`;
          } else np.artWrap.style.transform = '';
          np.raf = requestAnimationFrame(frame);
        };
        np.raf = requestAnimationFrame(frame);
      }

      // ── reactions ─────────────────────────────────────────────────
      on('music', () => {
        paintMini();
        markAll();
        if (np && np.open) paint(false);
      });
      on('store:mplaylists', () => refreshTop());
      on('store:mlib', () => { refreshTop(); });
      on('setting:volume', (v) => { if (np && !volMute) np.vol.set(v); });
      paintMini();

      function handle(intent) {
        if (!intent) return;
        if (intent.tab) tabs.select(intent.tab === 'browse' ? 'new' : intent.tab === 'listen' ? 'home' : intent.tab);
        if (intent.play) { M().play(intent.play); setTimeout(() => openNP('art'), 150); }
        if (intent.album && D.album(intent.album)) { tabs.select('library'); push(albumPage(intent.album)); }
        if (intent.playlist && item('playlist', intent.playlist)) { tabs.select('library'); push(playlistPage(intent.playlist)); }
        if (intent.artist && D.artist(intent.artist)) { tabs.select('library'); push(artistPage(intent.artist)); }
        if (intent.id) {
          if (item('playlist', intent.id)) { tabs.select('library'); push(playlistPage(intent.id)); }
          else if (D.album(intent.id)) { tabs.select('library'); push(albumPage(intent.id)); }
          else if (D.song(intent.id)) { M().play(intent.id); setTimeout(() => openNP('art'), 150); }
        }
        if (intent.nowPlaying) setTimeout(() => { openNP(intent.lyrics ? 'lyrics' : 'art'); if (intent.airplay) setTimeout(airplaySheet, 450); }, 80);
      }

      return {
        intent: handle,
        show() { paintMini(); markAll(); if (np && np.open) loop(); },
        hide() { if (np) cancelAnimationFrame(np.raf); },
        back() { if (np && np.open) { if (np.mode !== 'art') setMode('art'); else closeNP(); return true; } return false; },
        destroy() { offs.forEach((f) => f()); if (np) cancelAnimationFrame(np.raf); },
      };
    },
  });
})();
