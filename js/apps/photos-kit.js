/* Photos kit — seed library, albums, places, camera metadata and the shared photo renderer (JC.photoKit).
   Used by Photos (js/apps/photos.js) and Camera (js/apps/camera.js). Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;

  // ── Seed library (chronological; newest at the bottom of the grid) ──────────
  // Extra fields (owned by Photos): city, src (camera metadata), mode ('portrait'|'selfie'|'pano'|'slomo'|…),
  // hidden, deleted (ms), from (contact id for saved images), crop {x,y,w,h} (camera framing), edit {…}, fx (camera look).
  const P = (id, art, t, o) => {
    const it = Object.assign({ id, art, t, albums: [], fav: false, people: [], place: '', caption: '', kind: 'photo' }, o || {});
    if (typeof it.deleted === 'string') it.deleted = JC.time.parse(it.deleted); // JC.store only normalises t/start/end/due/created
    return it;
  };
  JC.store.seed('photos', [
    P('p_siblings_snow', 'p_siblings_snow', '2019-01-12 13:20', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family'], people: ['teucer', 'tonia', 'anthon'], fav: true, src: 'scan', caption: 'Four of us. Teucer was the size of a loaf of bread.' }),
    P('p_family_2019', 'p_family_2019', '2019-12-31 20:05', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family'], people: ['mama', 'papa', 'tonia', 'anthon', 'teucer'], src: 'scan', caption: 'New Year. Home on leave. Papa didn’t say much. Mama didn’t stop.' }),
    P('p_teucer_fish23', 'p_catch_1', '2023-07-22 06:12', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family', 'fish'], people: ['teucer'], kind: 'video', dur: 58, src: 'ip15', caption: 'Teucer’s first fish. He named it Ajax Two.' }),
    P('p_morepesok', 'p_morepesok', '2023-12-28 16:40', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family'], src: 'ip15', caption: 'Home.' }),
    P('p_papa_boat', 'p_papa_boat', '2024-07-02 05:30', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family', 'fish'], people: ['papa'], src: 'msg', from: 'mama', caption: 'Papa and the cod. He sent it with no message. That’s Papa for “I miss you”.' }),
    P('p_teucer_drawing', 'p_teucer_drawing', '2025-11-20 18:10', { albums: ['family'], fav: true, src: 'msg', from: 'mama', caption: 'MY BROTHER SELLS TOYS. Framed in my office. Signora asked about it once. Once.' }),
    P('p_mama_pelmeni', 'p_mama_pelmeni', '2025-12-31 19:00', { place: 'Morepesok, Snezhnaya', city: 'morepesok', albums: ['family'], src: 'msg', from: 'mama', caption: 'The recipe is a state secret.' }),
    P('p_bluefin', 'p_bluefin', '2026-01-03 07:40', { place: 'Guyun Stone Forest, Liyue', city: 'guyun', albums: ['fish'], fav: true, src: 'ip17', caption: 'SCARAMOUCHE. 41 kg. Named him after a colleague. Sent the colleague the photo. Worth it.' }),
    P('p_northland_lobby', 'p_northland_lobby', '2026-03-12 09:02', { place: 'Northland Bank, Harbor Road, Liyue Harbor', city: 'liyue', albums: ['liyue'], src: 'ip17', caption: 'First day in Liyue. Ekaterina had already learned my coffee order. Terrifying.' }),
    P('p_catch_1', 'p_catch_1', '2026-03-14 05:58', { place: 'Pier 7, Liyue Harbor', city: 'liyue', albums: ['fish'], src: 'ip17', caption: 'Sea bass. Xiansheng watched for two hours and said it was “very restful”.' }),
    P('p_harbor_day', 'p_harbor_day', '2026-03-20 14:15', { place: 'Yujing Terrace, Liyue Harbor', city: 'liyue', albums: ['liyue'], kind: 'pano', mode: 'pano', src: 'ip17' }),
    P('p_jade_chamber', 'p_jade_chamber', '2026-04-02 18:40', { place: 'Liyue Harbor', city: 'liyue', albums: ['liyue'], src: 'ip17t', caption: 'The Jade Chamber. Ningguang lives up there. Of course she does.' }),
    P('p_zl_birds', 'p_zl_birds', '2026-05-18 16:20', { place: 'Lane of Stone Lions, Liyue Harbor', city: 'liyue', albums: ['xiansheng'], people: ['zl'], src: 'ip17', caption: 'ℳ3,300 birdcage. The thrush doesn’t even live in it. It visits.' }),
    P('p_zl_teahouse', 'p_zl_teahouse', '2026-06-14 15:47', { place: 'Heyu Tea House, Liyue Harbor', city: 'liyue', albums: ['xiansheng'], people: ['zl'], fav: true, hidden: true, src: 'ip17', caption: 'Fell asleep mid-sentence about porcelain. Didn’t wake him. Paid. Obviously.' }),
    P('p_rod_gift', 'p_rod_gift', '2026-07-20 21:30', { place: 'Pier View Residences, Liyue Harbor', city: 'liyue', albums: ['xiansheng', 'fish'], fav: true, src: 'ip17', caption: '“For your birthday. — Z.” He paid for it. HE PAID FOR SOMETHING.' }),
    P('p_hotpot_crew', 'p_hotpot_crew', '2026-07-25 22:10', { place: 'Wanmin Restaurant, Chihu Rock', city: 'liyue', albums: ['liyue'], people: ['lumine', 'paimon', 'xl', 'ht'], src: 'msg', from: 'ht', caption: 'Hotpot crew. Paimon ate my share. Paimon always eats my share.' }),
    P('p_catch_2', 'p_catch_2', '2026-08-02 02:40', { place: 'Pier 7, Liyue Harbor', city: 'liyue', albums: ['fish'], src: 'ip17', caption: 'Too many teeth. Released it. It looked at me like Dottore.' }),
    P('p_wanmin_kitchen', 'p_wanmin_kitchen', '2026-08-11 19:30', { place: 'Wanmin Restaurant, Chihu Rock', city: 'liyue', albums: ['liyue'], people: ['xl'], kind: 'live', src: 'ip17' }),
    P('p_unit3', 'p_unit3', '2026-08-28 03:10', { place: 'Guyun Stone Forest, Liyue', city: 'guyun', src: 'ip17t', deleted: '-3 03:00' }),
    P('p_glaze_lily', 'p_glaze_lily', '2026-09-10 06:30', { place: 'Qingce Village, Liyue', city: 'qingce', albums: ['xiansheng'], src: 'msg', from: 'zl', caption: 'He sent this at 6:30 AM. No message. Just the flower.' }),
    P('p_alcor_deck', 'p_alcor_deck', '2026-09-26 22:05', { place: 'The Alcor, Crux Pier', city: 'liyue', albums: ['liyue'], src: 'ip17', caption: 'Rematch #5. Lost. Laughed mid-fight. Note to self: don’t.' }),
    P('p_teucer_sirfang', 'p_teucer_sirfang', '2026-09-30 20:00', { albums: ['family'], src: 'msg', from: 'teucer', caption: 'Sir Fang, on guard.' }),
    P('p_heyu_stage', 'p_heyu_stage', '2026-10-02 15:20', { place: 'Heyu Tea House, Liyue Harbor', city: 'liyue', albums: ['xiansheng', 'liyue'], people: ['yunjin'], src: 'ip17', caption: 'He mouthed every word of the second act.' }),
    P('p_zl_opera_tickets', 'p_zl_opera_tickets', '2026-10-02 16:40', { place: 'Heyu Tea House, Liyue Harbor', city: 'liyue', albums: ['xiansheng'], src: 'ip17', caption: 'Box Two. Saturday. Don’t tell him yet.' }),
    P('p_tonia_letter', 'p_tonia_letter', '2026-10-10 21:15', { albums: ['family'], src: 'msg', from: 'tonia', caption: '“Explain this.” — Tonia. Haven’t.' }),
    P('p_abyss_map', 'p_abyss_map', '2026-10-14 03:05', { place: 'Pier View Residences, Liyue Harbor', city: 'liyue', src: 'ip17', caption: '' }),
    P('p_aquarium_frozen', 'p_aquarium_frozen', '-5 16:22', { place: 'Northland Bank, Harbor Road, Liyue Harbor', city: 'liyue', src: 'msg', from: 'lyuba', caption: 'Sir’s fish (frozen, again).' }),
    P('p_wangsheng_door', 'p_wangsheng_door', '-7 22:40', { place: 'Wangsheng Funeral Parlor, Feiyun Slope', city: 'liyue', albums: ['liyue'], src: 'ip17', caption: 'Picking him up from work. Hu Tao offered me a coupon.' }),
    P('p_golden_house', 'p_golden_house', '-6 11:00', { place: 'The Golden House, Liyue Harbor', city: 'liyue', albums: ['liyue'], src: 'ip17' }),
    P('p_ops_vending', 'p_ops_vending', '-9 23:10', { place: 'Northland Bank, Harbor Road, Liyue Harbor', city: 'liyue', src: 'msg', from: 'pyotr' }),
    P('p_paimon_food', 'p_paimon_food', '-2 20:30', { src: 'msg', from: 'paimon', caption: 'Receipt: ×38.' }),
    P('p_osial_diagram', 'p_osial_diagram', '-1 23:59', { kind: 'screenshot', src: 'shot' }),
    P('p_yujing_lanterns', 'p_yujing_lanterns', '-1 18:30', { place: 'Yujing Terrace, Liyue Harbor', city: 'liyue', albums: ['liyue'], src: 'ip17', caption: 'They’re putting up the lanterns for the Rite. Xiansheng is very calm about it. Weirdly calm.' }),
    P('p_liuli_dinner', 'p_liuli_dinner', '+0 20:40', { place: 'Liuli Pavilion, Liyue Harbor', city: 'liyue', albums: ['xiansheng'], people: ['zl'], src: 'ip17', caption: 'ℳ8,800. “Other coat.”' }),
    P('p_ledger', 'p_ledger', '+0 22:33', { kind: 'screenshot', src: 'shot' }),
    P('p_zl_pier_b', 'p_zl_pier', '+0 23:11', { place: 'Pier 7, Liyue Harbor', city: 'liyue', src: 'ip17', deleted: '+0 23:11', burst: 1 }),
    P('p_zl_pier', 'p_zl_pier', '+0 23:11', { place: 'Pier 7, Liyue Harbor', city: 'liyue', albums: ['xiansheng'], people: ['zl'], kind: 'live', fav: true, src: 'ip17' }),
    P('p_pier7_rod', 'p_pier7_rod', '+0 23:14', { place: 'Pier 7, Liyue Harbor', city: 'liyue', albums: ['fish'], src: 'ip17' }),
  ]);

  JC.store.seed('albums', [
    { id: 'xiansheng', title: 'Xiansheng', cover: 'p_zl_pier' },
    { id: 'fish', title: 'Fish 🐟', cover: 'p_bluefin' },
    { id: 'family', title: 'Family', cover: 'p_siblings_snow' },
    { id: 'liyue', title: 'Liyue', cover: 'p_harbor_day' },
  ]);

  // ── Places (stylised map coordinates 0..1) ─────────────────────────────────
  const CITIES = {
    liyue: { name: 'Liyue Harbor', x: 0.62, y: 0.64 },
    guyun: { name: 'Guyun Stone Forest', x: 0.80, y: 0.72 },
    qingce: { name: 'Qingce Village', x: 0.47, y: 0.52 },
    morepesok: { name: 'Morepesok', x: 0.40, y: 0.12 },
    zapolyarny: { name: 'Zapolyarny', x: 0.28, y: 0.06 },
  };
  function cityOf(p) {
    if (p.city && CITIES[p.city]) return p.city;
    const s = (p.place || '').toLowerCase();
    for (const k in CITIES) if (s.includes(k)) return k;
    if (/pier 7|liuli|wangsheng|yujing|jade|northland|heyu|wanmin|chihu|alcor|harbor|feiyun|golden house/.test(s)) return 'liyue';
    if (/wangshu|qingce/.test(s)) return 'qingce';
    if (/snezhnaya/.test(s)) return 'morepesok';
    return null;
  }

  // ── People ─────────────────────────────────────────────────────────────────
  // face: art id + crop (background-position/size) for the circular face thumbnail
  const PEOPLE = [
    { id: 'zl', name: 'Zhongli', face: { art: 'av_zl' } },
    { id: 'teucer', name: 'Teucer', face: { art: 'av_teucer' } },
    { id: 'tonia', name: 'Tonia', face: { art: 'av_tonia' } },
    { id: 'anthon', name: 'Anthon', face: { art: 'av_anthon' } },
    { id: 'mama', name: 'Mama', face: { art: 'av_mama' } },
    { id: 'papa', name: 'Papa', face: { art: 'av_papa' } },
    { id: 'lumine', name: 'Lumine', face: { art: 'av_lumine' } },
    { id: 'paimon', name: 'Paimon', face: { art: 'av_paimon' } },
    { id: 'ht', name: 'Hu Tao', face: { art: 'av_ht' } },
    { id: 'xl', name: 'Xiangling', face: { art: 'av_xl' } },
    // tagged (searchable) but Photos never found a usable face
    { id: 'yunjin', name: 'Yun Jin', noFace: true, face: { art: 'av_yunjin' } },
  ];
  // photos the story may add later: infer who is in them from the art id
  const ART_PEOPLE = {
    p_zl_pier: ['zl'], p_zl_teahouse: ['zl'], p_zl_birds: ['zl'], p_liuli_dinner: ['zl'], p_teucer_plane: ['teucer', 'tonia'],
    p_hotpot_crew: ['lumine', 'paimon', 'xl', 'ht'], p_siblings_snow: ['teucer', 'tonia', 'anthon'], p_papa_boat: ['papa'],
  };
  function peopleOf(p) {
    if (p.people && p.people.length) return p.people;
    return ART_PEOPLE[p.art] || [];
  }

  // ── Camera metadata ───────────────────────────────────────────────────────
  const DEV = {
    scan: { dev: 'Scanned Photo', lens: 'Imported print', mp: '3.1 MP', res: '2048 × 1536', fmt: 'JPEG', size: '1.2 MB', noExif: true },
    dv: { dev: 'Sony Handycam DCR-PC105', lens: 'Imported from MiniDV tape', mp: 'SD', res: '720 × 576', fmt: 'MPEG-4', size: '96.4 MB', noExif: true },
    n95: { dev: 'Nokia N95', lens: 'Carl Zeiss Tessar — 5.6 mm ƒ2.8', mp: '5 MP', res: '2592 × 1944', fmt: 'JPEG', size: '1.4 MB', f: 'ƒ2.8', mm: '35 mm' },
    ip6: { dev: 'Apple iPhone 6 Plus', lens: 'Back Camera — 29 mm ƒ2.2', mp: '8 MP', res: '3264 × 2448', fmt: 'JPEG', size: '2.1 MB', f: 'ƒ2.2', mm: '29 mm' },
    ipxs: { dev: 'Apple iPhone XS', lens: 'Wide Camera — 26 mm ƒ1.8', mp: '12 MP', res: '4032 × 3024', fmt: 'HEIF', size: '2.6 MB', f: 'ƒ1.8', mm: '26 mm' },
    ip11: { dev: 'Apple iPhone 11 Pro', lens: 'Telephoto Camera — 52 mm ƒ2.0', mp: '12 MP', res: '4032 × 3024', fmt: 'HEIF', size: '2.9 MB', f: 'ƒ2.0', mm: '52 mm' },
    ip13: { dev: 'Apple iPhone 13 Pro', lens: 'Wide Camera — 26 mm ƒ1.5', mp: '12 MP', res: '4032 × 3024', fmt: 'HEIF', size: '3.0 MB', f: 'ƒ1.5', mm: '26 mm' },
    ip14: { dev: 'Apple iPhone 14 Pro', lens: 'Main Camera — 24 mm ƒ1.78', mp: '12 MP', res: '4032 × 3024', fmt: 'HEIF', size: '3.1 MB', f: 'ƒ1.78', mm: '24 mm' },
    ip15: { dev: 'Apple iPhone 15 Pro', lens: 'Main Camera — 24 mm ƒ1.78', mp: '24 MP', res: '5712 × 4284', fmt: 'HEIF', size: '4.0 MB', f: 'ƒ1.78', mm: '24 mm' },
    ip17: { dev: 'Apple iPhone 17 Pro', lens: 'Main Camera — 24 mm ƒ1.78', mp: '48 MP', res: '8064 × 6048', fmt: 'HEIF', size: '5.2 MB', f: 'ƒ1.78', mm: '24 mm' },
    ip17uw: { dev: 'Apple iPhone 17 Pro', lens: 'Ultra Wide Camera — 13 mm ƒ2.2', mp: '48 MP', res: '8064 × 6048', fmt: 'HEIF', size: '4.8 MB', f: 'ƒ2.2', mm: '13 mm' },
    ip17t: { dev: 'Apple iPhone 17 Pro', lens: 'Telephoto Camera — 100 mm ƒ2.8', mp: '48 MP', res: '8064 × 6048', fmt: 'HEIF', size: '4.6 MB', f: 'ƒ2.8', mm: '100 mm' },
    ip17f: { dev: 'Apple iPhone 17 Pro', lens: 'Front Camera — 23 mm ƒ1.9', mp: '18 MP', res: '4896 × 3672', fmt: 'HEIF', size: '3.3 MB', f: 'ƒ1.9', mm: '23 mm' },
    shot: { dev: 'Screenshot', lens: '', mp: '', res: '1206 × 2622', fmt: 'PNG', size: '1.1 MB', noExif: true },
    msg: { dev: 'Saved from Messages', lens: '', mp: '12 MP', res: '4032 × 3024', fmt: 'JPEG', size: '1.8 MB', noExif: true },
    web: { dev: 'Saved from Safari', lens: '', mp: '', res: '1600 × 1200', fmt: 'JPEG', size: '412 KB', noExif: true },
    wavelet: { dev: 'Saved from Ripple', lens: '', mp: '', res: '2048 × 1536', fmt: 'JPEG', size: '690 KB', noExif: true },
  };
  function devOf(p) {
    if (p.src && DEV[p.src]) return DEV[p.src];
    if (p.kind === 'screenshot') return DEV.shot;
    return DEV.ip17;
  }
  function exifOf(p) {
    const d = devOf(p);
    if (d.noExif) return null;
    const hr = new Date(p.t).getHours();
    const night = hr >= 19 || hr < 6;
    const seed = hash(p.id);
    const iso = night ? [640, 800, 1000, 1250, 1600][seed % 5] : [50, 64, 80, 100, 125][seed % 5];
    const sh = night ? ['1/15 s', '1/20 s', '1/25 s', '1/30 s'][seed % 4] : ['1/250 s', '1/500 s', '1/1000 s', '1/120 s'][seed % 4];
    const ev = ['0 ev', '0 ev', '−0.3 ev', '+0.3 ev'][seed % 4];
    return { iso: 'ISO ' + iso, mm: d.mm || '24 mm', ev, f: d.f || 'ƒ1.78', sh };
  }
  function hash(s) { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }

  // ── Filters & adjustments (CSS) ───────────────────────────────────────────
  const FILTERS = [
    { id: 'none', name: 'Original', css: '' },
    { id: 'vivid', name: 'Vivid', css: 'saturate(1.38) contrast(1.06)' },
    { id: 'vivid-warm', name: 'Vivid Warm', css: 'saturate(1.3) contrast(1.05) sepia(.22)' },
    { id: 'vivid-cool', name: 'Vivid Cool', css: 'saturate(1.25) contrast(1.05) hue-rotate(-12deg) brightness(1.02)' },
    { id: 'dramatic', name: 'Dramatic', css: 'contrast(1.38) saturate(.82) brightness(.92)' },
    { id: 'dramatic-warm', name: 'Dramatic Warm', css: 'contrast(1.32) saturate(.92) sepia(.28) brightness(.92)' },
    { id: 'dramatic-cool', name: 'Dramatic Cool', css: 'contrast(1.32) saturate(.78) hue-rotate(14deg) brightness(.9)' },
    { id: 'mono', name: 'Mono', css: 'grayscale(1)' },
    { id: 'silvertone', name: 'Silvertone', css: 'grayscale(1) sepia(.14) contrast(.92) brightness(1.08)' },
    { id: 'noir', name: 'Noir', css: 'grayscale(1) contrast(1.6) brightness(.86)' },
  ];
  const ADJ = [
    { id: 'exposure', name: 'Exposure', fn: (v) => `brightness(${1 + v * 0.0045})` },
    { id: 'brilliance', name: 'Brilliance', fn: (v) => `brightness(${1 + v * 0.0012}) contrast(${1 - v * 0.0012})` },
    { id: 'highlights', name: 'Highlights', fn: (v) => `brightness(${1 + v * 0.001}) contrast(${1 + v * 0.0012})` },
    { id: 'shadows', name: 'Shadows', fn: (v) => `brightness(${1 + v * 0.0016}) contrast(${1 - v * 0.0016})` },
    { id: 'contrast', name: 'Contrast', fn: (v) => `contrast(${1 + v * 0.005})` },
    { id: 'brightness', name: 'Brightness', fn: (v) => `brightness(${1 + v * 0.0025})` },
    { id: 'blackpoint', name: 'Black Point', fn: (v) => `contrast(${1 + v * 0.003}) brightness(${1 - v * 0.0012})` },
    { id: 'saturation', name: 'Saturation', fn: (v) => `saturate(${Math.max(0, 1 + v * 0.01)})` },
    { id: 'vibrance', name: 'Vibrance', fn: (v) => `saturate(${Math.max(0, 1 + v * 0.005)})` },
    { id: 'warmth', name: 'Warmth', fn: (v) => (v >= 0 ? `sepia(${v * 0.0035}) saturate(${1 + v * 0.002})` : `hue-rotate(${v * 0.12}deg) saturate(${1 + v * 0.002})`) },
    { id: 'tint', name: 'Tint', fn: (v) => `hue-rotate(${v * 0.25}deg)` },
    { id: 'sharpness', name: 'Sharpness', fn: (v) => `contrast(${1 + v * 0.0015})` },
    { id: 'definition', name: 'Definition', fn: (v) => `contrast(${1 + v * 0.002}) saturate(${1 - v * 0.0006})` },
    { id: 'noise', name: 'Noise Reduction', fn: (v) => (v > 0 ? `blur(${(v * 0.006).toFixed(2)}px)` : `contrast(${1 - v * 0.0008})`) },
    { id: 'vignette', name: 'Vignette', fn: () => '' },
  ];
  const AUTO = { exposure: 12, brilliance: 22, highlights: -14, shadows: 18, contrast: 6, saturation: 8, vibrance: 12 };

  function filterCss(p, e) {
    e = e || p.edit || {};
    const parts = [];
    if (p.fx) parts.push(p.fx);
    const f = FILTERS.find((x) => x.id === e.f);
    if (f && f.css) parts.push(f.css);
    const adj = Object.assign({}, e.auto ? AUTO : {}, e.adj || {});
    ADJ.forEach((a) => { const v = adj[a.id]; if (v) { const c = a.fn(v); if (c) parts.push(c); } });
    return parts.join(' ');
  }
  function isEdited(p) {
    const e = p.edit;
    if (!e) return false;
    return !!(e.f && e.f !== 'none') || !!e.auto || !!e.rot || !!e.flip || !!e.straighten || !!e.crop || Object.values(e.adj || {}).some(Boolean);
  }

  // ── Renderer ──────────────────────────────────────────────────────────────
  const FULL = { x: 0, y: 0, w: 1, h: 1 };
  function compose(a, b) { return { x: a.x + b.x * a.w, y: a.y + b.y * a.h, w: a.w * b.w, h: a.h * b.h }; }
  /** largest centred sub-rect of crop c (art-normalised) whose pixel aspect is `target` */
  function cover(c, artAspect, target) {
    const ra = (c.w / c.h) * artAspect;
    if (Math.abs(ra - target) < 1e-4) return c;
    if (ra > target) { const w = c.w * (target / ra); return { x: c.x + (c.w - w) / 2, y: c.y, w, h: c.h }; }
    const hh = c.h * (ra / target);
    return { x: c.x, y: c.y + (c.h - hh) / 2, w: c.w, h: hh };
  }
  function bgFor(el, art, r) {
    el.style.backgroundImage = `url("${JC.art.url(art)}")`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = `${(100 / r.w).toFixed(4)}% ${(100 / r.h).toFixed(4)}%`;
    const px = r.w < 0.9999 ? (r.x / (1 - r.w)) * 100 : 50;
    const py = r.h < 0.9999 ? (r.y / (1 - r.h)) * 100 : 50;
    el.style.backgroundPosition = `${px.toFixed(3)}% ${py.toFixed(3)}%`;
  }
  function artAspect(art) { const m = JC.art.meta(art); return (m.w || 1200) / (m.h || 900); }
  function baseCrop(p, e) { return compose(p.crop || FULL, (e && e.crop) || FULL); }
  /** displayed aspect (w/h) of a photo, after crop + rotation edits */
  function aspectOf(p, e) {
    e = e || p.edit || {};
    const c = baseCrop(p, e);
    const a = (c.w / c.h) * artAspect(p.art);
    const rot = (((e.rot || 0) % 360) + 360) % 360;
    return rot === 90 || rot === 270 ? 1 / a : a;
  }
  /** Paint photo p into `box` (overflow hidden). cAspect = box w/h (defaults to the photo's own aspect). */
  function paint(box, p, cAspect, e) {
    e = e || p.edit || {};
    box.innerHTML = '';
    box.classList.add('phk-box');
    const aa = artAspect(p.art);
    const c0 = baseCrop(p, e);
    const rot = (((e.rot || 0) % 360) + 360) % 360;
    const sw = rot === 90 || rot === 270;
    const disp = aspectOf(p, e);
    const c = cAspect || disp;
    const innerAspect = sw ? 1 / c : c;
    const fit = cover(c0, aa, innerAspect);
    const inner = h('div.phk-img');
    bgFor(inner, p.art, fit);
    if (sw) { inner.style.width = (100 / c).toFixed(4) + '%'; inner.style.height = (100 * c).toFixed(4) + '%'; }
    const st = e.straighten || 0;
    const rad = (Math.abs(st) * Math.PI) / 180;
    const k = st ? Math.cos(rad) + Math.sin(rad) * Math.max(innerAspect, 1 / innerAspect) : 1;
    inner.style.transform = `translate(-50%, -50%) rotate(${rot + st}deg) scale(${(e.flip ? -1 : 1) * k}, ${k})`;
    const f = filterCss(p, e);
    if (f) inner.style.filter = f;
    box.appendChild(inner);
    const vig = ((e.adj && e.adj.vignette) || 0);
    if (vig) box.appendChild(h('div.phk-vig', { style: { background: vig > 0 ? `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${(vig / 100) * 0.75}) 100%)` : `radial-gradient(ellipse at center, transparent 45%, rgba(255,255,255,${(-vig / 100) * 0.6}) 100%)` } }));
    return box;
  }
  function box(p, cAspect, cls) {
    const el = h('div' + (cls ? '.' + cls.split(' ').join('.') : ''));
    paint(el, p, cAspect);
    return el;
  }

  // ── Library helpers ───────────────────────────────────────────────────────
  const all = () => JC.store.all('photos');
  const byT = (a, b) => (a.t - b.t) || (a.id < b.id ? -1 : 1);
  const library = () => all().filter((p) => !p.deleted && !p.hidden).sort(byT);
  function latest() { const l = library(); return l[l.length - 1] || null; }
  /** add a photo (camera, story) — returns the stored item */
  function add(item) {
    const it = Object.assign({ albums: [], fav: false, people: [], place: '', caption: '', kind: 'photo' }, item);
    if (!it.t) it.t = JC.time.now();
    return JC.store.add('photos', it);
  }

  const DUR = (s) => { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  JC.photoKit = {
    CITIES, PEOPLE, DEV, FILTERS, ADJ, AUTO, FULL,
    cityOf, peopleOf, devOf, exifOf, filterCss, isEdited, paint, box, aspectOf, artAspect, cover, compose, bgFor,
    all, library, latest, add, byT, dur: DUR, hash,
  };

})();
