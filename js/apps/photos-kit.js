/* Photos kit — seed library, albums, places, camera metadata and the shared photo renderer (JC.photoKit).
   Used by Photos (js/apps/photos.js) and Camera (js/apps/camera.js). Facts: docs/STORY.md */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});
  const { h } = JC;

  // ── Seed library (chronological; newest at the bottom of the grid) ──────────
  // Extra fields (owned by Photos): city, src (camera metadata), mode ('portrait'|'selfie'|'pano'|'slomo'|…),
  // hidden, deleted (ms), from (contact id for saved images), crop {x,y,w,h} (camera framing), edit {…}, fx (camera look).
  const P = (id, art, t, o) => Object.assign({ id, art, t, albums: [], fav: false, people: [], place: '', caption: '', kind: 'photo' }, o || {});
  JC.store.seed('photos', [
    P('ph_dogs99', 'p_childhood_dogs', '1999-06-12 16:20', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['dogs', 'old-photos', 'lotus-pier'], fav: true, src: 'scan', caption: 'Jasmine. Princess. Love-Love.' }),
    P('ph_kites03', 'p_kites', '2003-04-05 15:30', { place: 'Yunmeng Lake Pavilion, Yunmeng', city: 'yunmeng', albums: ['old-photos', 'lotus-pier'], people: ['wwx', 'ajie'], kind: 'video', dur: 64, src: 'dv', caption: 'Qingming. His kite went higher. Mine stayed up longer.' }),
    P('ph_fam07', 'p_family_2007', '2007-06-19 18:40', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['old-photos', 'lotus-pier'], people: ['mom', 'dad', 'ajie', 'wwx'], fav: true, src: 'scan' }),
    P('ph_cr07', 'p_cloud_recesses', '2007-07-02 08:12', { place: 'Cloud Recesses, Gusu', city: 'gusu', albums: ['old-photos'], people: ['lxc'], src: 'n95', caption: 'Summer program, day one. Mist. Rules. More mist.' }),
    P('ph_rules07', 'p_rules_wall', '2007-07-03 12:40', { place: 'Cloud Recesses, Gusu', city: 'gusu', albums: ['old-photos'], src: 'n95', caption: 'Rule 1,412: No running. He ran.' }),
    P('ph_hotpot07', 'food_hotpot', '2007-08-18 21:05', { place: 'Laoma Hotpot (老妈火锅), Gusu', city: 'gusu', albums: ['old-photos'], people: ['wwx', 'nhs', 'mian'], src: 'n95', caption: 'Laoma, after the summer exams. Wei Wuxian ordered six plates of tripe and paid for none.' }),
    P('ph_wed07', 'p_ajie_wedding', '2007-10-06 11:58', { place: 'Koi Tower, Lanling', city: 'lanling', albums: ['old-photos'], people: ['ajie'], fav: true, src: 'n95', caption: 'She said red suited her. It did.' }),
    P('ph_pond08', 'p_lotus_pond_day', '2008-07-19 10:20', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['old-photos', 'lotus-pier'], src: 'n95' }),
    P('ph_soup08', 'p_ajie_soup', '2008-10-04 18:10', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['old-photos'], fav: true, src: 'n95', caption: 'Week three. Soup again. (Ate all of it.)' }),
    P('ph_dawn09', 'p_sunrise_lake', '2009-11-03 06:14', { place: 'Yunmeng Lake, Yunmeng', city: 'yunmeng', albums: ['old-photos'], src: 'n95' }),
    P('ph_jl14', 'p_jl_kid', '2014-10-18 19:32', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['aling'], people: ['jl'], fav: true, src: 'ip6', caption: 'Six. Gold everything. Blew the candles out twice.' }),
    P('ph_fairy18', 'ph_fairy_puppy', '2018-10-18 20:05', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['dogs', 'aling'], people: ['fairy', 'jl'], src: 'ipxs', caption: 'A-Ling, ten. Named her Fairy. I said nothing. (I said plenty.)' }),
    P('ph_lotus19', 'p_lotus_macro', '2019-07-14 06:40', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['lotus-pier'], fav: true, src: 'ipxs' }),
    P('ph_fairy20', 'av_fairy', '2020-05-02 15:12', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['dogs'], people: ['fairy'], mode: 'portrait', src: 'ip11', caption: 'Ate a slipper. Mine. Looks proud of it.' }),
    P('ph_fairy22', 'ph_fairy_bath', '2022-08-06 11:25', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['dogs'], people: ['fairy'], kind: 'live', src: 'ip13', caption: 'Bath day. She will never forgive me.' }),
    P('ph_flute23', 'p_flute', '2023-03-12 21:40', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', src: 'ip14', caption: 'He left it here. Again.' }),
    P('ph_grad23', 'p_jl_graduation', '2023-06-30 10:15', { place: 'Lanling International School, Lanling', city: 'lanling', albums: ['aling'], people: ['jl'], fav: true, src: 'ip14', caption: 'Scowled in all 41 photos. This is the best one.' }),
    P('ph_fairy23', 'wp_fairy', '2023-09-10 17:40', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['dogs'], people: ['fairy'], mode: 'portrait', src: 'ip14' }),
    P('ph_hotpot24', 'p_hotpot_alumni', '2024-04-13 19:46', { place: 'Laoma Hotpot (老妈火锅), Gusu', city: 'gusu', people: ['wwx', 'nhs', 'mian', 'wn', 'lwj'], kind: 'live', src: 'ip15', caption: 'Reunion. Same place, same table. I paid. Again.' }),
    P('ph_soup24', 'p_lotus_root_soup', '2024-12-08 20:30', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', src: 'ip15', caption: 'Attempt seven. Closer. Not hers.' }),
    P('ph_pups25', 'p_puppies', '2025-06-01 09:12', { place: 'Yunmeng', city: 'yunmeng', albums: ['dogs'], src: 'web', caption: 'For Wei Wuxian. Deploy as needed.' }),
    P('ph_fairy25', 'ph_fairy_office', '2025-11-21 15:48', { place: 'Lotus Pier HQ, Yunmeng', city: 'yunmeng', albums: ['dogs'], people: ['fairy'], src: 'ip17', caption: 'Board meeting. She attended. Voted no on everything.' }),
    P('ph_park26', 'p_dog_park', '2026-04-19 07:05', { place: 'Riverside Park, Yunmeng', city: 'yunmeng', albums: ['dogs'], fav: true, src: 'ip17', caption: 'Didn’t get his name. Good dog.' }),
    P('ph_bday26', 'food_lotus_cake', '2026-05-15 20:30', { place: 'Lotus Pier Residence, Yunmeng', city: 'yunmeng', albums: ['aling'], src: 'ip17', caption: '34. A-Ling brought these. “Don’t make it weird.”' }),
    P('ph_radcake26', 'p_radish_cake', '2026-06-13 11:20', { place: 'Yiling Radish Co. pop-up, Gusu', city: 'gusu', src: 'ip17', caption: 'Not bad. He doesn’t need to know I went.' }),
    P('ph_pondvid26', 'p_lotus_pond_day', '2026-07-18 07:02', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', albums: ['lotus-pier'], kind: 'video', dur: 18, src: 'ip17' }),
    P('ph_permit26', 'p_jl_learner', '2026-08-28 16:30', { place: 'Vehicle Administration Office, Lanling', city: 'lanling', albums: ['aling'], people: ['jl'], fav: true, src: 'ip17', caption: 'Learner permit. God help Lanling.' }),
    P('ph_milktea26', 'food_milktea', '2026-09-05 16:10', { place: 'Lanling', city: 'lanling', albums: ['aling'], src: 'ip17', caption: 'His order. Five toppings. One drink.' }),
    P('ph_hanshi26', 'p_tea_hanshi', '2026-09-25 21:20', { place: 'The Hanshi, Gusu', city: 'gusu', hidden: true, src: 'msg', from: 'lxc' }),
    P('ph_shotbank', 'p_shot_bank', '2026-10-01 08:01', { kind: 'screenshot', src: 'shot' }),
    P('ph_baozi26', 'food_baozi', '2026-10-10 07:30', { place: 'Lotus Pier HQ canteen, Yunmeng', city: 'yunmeng', src: 'ip17', caption: 'Canteen baozi. Acceptable.' }),
    P('ph_bell26', 'p_silver_bell', '2026-10-12 14:20', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', hidden: true, src: 'ip17', caption: 'Polished. Don’t let A-Ling see.' }),
    P('ph_q4', 'p_ops_meeting', '-3 17:20', { place: 'Lotus Pier HQ, Yunmeng', city: 'yunmeng', src: 'ip17', caption: 'Who drew the dog. (Liu Qian.)' }),
    P('ph_cake26', 'p_cake_lotus', '-2 16:05', { place: 'Lotus Pier, Yunmeng', city: 'yunmeng', hidden: true, src: 'msg', from: 'sz', caption: 'Lotus seed paste. Nine petals. Not gold.' }),
    P('ph_radish', 'p_radishes', '-2 21:40', { src: 'msg', from: 'wwx' }),
    P('ph_poster', 'p_dogfriday_poster', '-1 09:05', { place: 'Lotus Pier HQ, Yunmeng', city: 'yunmeng', src: 'ip17', caption: 'Taped to my office door. Again.' }),
    P('ph_receipt', 'p_receipt', '-1 18:20', { place: 'Pet Kingdom, Lanling', city: 'lanling', albums: ['dogs'], src: 'ip17', caption: '20 kg. She eats better than A-Ling.' }),
    P('ph_lobby', 'p_hotel_lobby', '-1 21:10', { place: 'Golden Peony Hotel, Lanling', city: 'lanling', src: 'ip17', caption: 'Room 1808. Of course.' }),
    P('ph_congee', 'food_congee', '+0 07:40', { place: 'Golden Peony Hotel, Lanling', city: 'lanling', src: 'ip17' }),
    P('ph_keys', 'p_car_keys', '+0 18:52', { place: 'Koi Tower, Lanling', city: 'lanling', albums: ['gala-2026'], src: 'ip17', caption: 'Spare key — coat check, ticket 18.' }),
    P('ph_hall', 'p_gala_hall', '+0 19:08', { place: 'Koi Tower, Lanling', city: 'lanling', albums: ['gala-2026'], people: ['lxc', 'nhs', 'jl'], kind: 'live', src: 'ip17' }),
    P('ph_selfie', 'p_jl_selfie_gala', '+0 20:15', { place: 'Koi Tower, Lanling', city: 'lanling', albums: ['aling', 'gala-2026'], people: ['jl'], fav: true, mode: 'selfie', src: 'ip17f', caption: 'He took my phone.' }),
    P('ph_moon_b', 'p_balcony_moon', '+0 22:47', { place: 'Koi Tower, Lanling', city: 'lanling', src: 'ip17', deleted: '+0 22:48', burst: 1 }),
    P('ph_moon', 'p_balcony_moon', '+0 22:47', { place: 'Koi Tower, Lanling', city: 'lanling', albums: ['gala-2026'], kind: 'live', src: 'ip17' }),
    P('ph_taxi', 'p_taxi_night', '+0 23:26', { place: 'Lanling', city: 'lanling', kind: 'live', src: 'ip17' }),
    P('ph_shotgossip', 'p_shot_gossip', '+0 23:33', { kind: 'screenshot', src: 'shot' }),
    P('ph_soupfail', 'p_soup_fail', '2025-12-30 19:20', { src: 'msg', from: 'wwx', deleted: '-4 09:12' }),
  ]);

  JC.store.seed('albums', [
    { id: 'aling', title: 'A-Ling', cover: 'ph_grad23' },
    { id: 'dogs', title: 'Dogs', cover: 'ph_dogs99' },
    { id: 'lotus-pier', title: 'Lotus Pier', cover: 'ph_lotus19' },
    { id: 'gala-2026', title: 'Gala 2026', cover: 'ph_moon' },
    { id: 'old-photos', title: 'Old Photos', cover: 'ph_fam07' },
  ]);

  // ── Places (stylised map coordinates 0..1) ─────────────────────────────────
  const CITIES = {
    lanling: { name: 'Lanling', x: 0.70, y: 0.33 },
    yunmeng: { name: 'Yunmeng', x: 0.47, y: 0.64 },
    gusu: { name: 'Gusu', x: 0.83, y: 0.62 },
    qinghe: { name: 'Qinghe', x: 0.42, y: 0.14 },
    yiling: { name: 'Yiling', x: 0.17, y: 0.47 },
  };
  function cityOf(p) {
    if (p.city && CITIES[p.city]) return p.city;
    const s = (p.place || '').toLowerCase();
    for (const k in CITIES) if (s.includes(k)) return k;
    if (/koi tower|golden peony|jinxing|pet kingdom/.test(s)) return 'lanling';
    if (/lotus pier|guanyin/.test(s)) return 'yunmeng';
    if (/cloud recesses|hanshi|jingshi|laoma/.test(s)) return 'gusu';
    if (/unclean realm/.test(s)) return 'qinghe';
    if (/radish|burial/.test(s)) return 'yiling';
    return null;
  }

  // ── People & pets ──────────────────────────────────────────────────────────
  // face: art id + crop (background-position/size) for the circular face thumbnail
  const PEOPLE = [
    { id: 'jl', name: 'Jin Ling', face: { art: 'av_jl' } },
    { id: 'fairy', name: 'Fairy', pet: true, face: { art: 'av_fairy' } },
    { id: 'wwx', name: 'Wei Wuxian', face: { art: 'p_hotpot_alumni', size: '420%', pos: '30% 38%' }, fallback: { art: 'p_family_2007', size: '520%', pos: '64% 52%' } },
    { id: 'lxc', name: 'Lan Xichen', face: { art: 'av_lxc' } },
    { id: 'ajie', name: 'Jiang Yanli', face: { art: 'p_ajie_wedding', size: '330%', pos: '50% 22%' } },
    { id: 'nhs', name: 'Nie Huaisang', face: { art: 'av_nhs' } },
    { id: 'mian', name: 'Mianmian', face: { art: 'av_mian' } },
    { id: 'wn', name: 'Wen Ning', face: { art: 'p_hotpot_alumni', size: '420%', pos: '72% 40%' } },
    { id: 'lwj', name: 'Lan Wangji', face: { art: 'p_hotpot_alumni', size: '420%', pos: '52% 34%' } },
    { id: 'mom', name: 'Mother', face: { art: 'p_family_2007', size: '520%', pos: '42% 50%' } },
    { id: 'dad', name: 'Father', face: { art: 'p_family_2007', size: '520%', pos: '50% 50%' } },
  ];
  // photos the story may add later: infer who is in them from the art id
  const ART_PEOPLE = {
    p_fairy_roof: ['fairy'], p_jl_selfie_gala: ['jl'], p_jl_learner: ['jl'], p_jl_kid: ['jl'], p_jl_graduation: ['jl'],
    av_fairy: ['fairy'], wp_fairy: ['fairy'], ph_fairy_puppy: ['fairy'], ph_fairy_bath: ['fairy'], ph_fairy_office: ['fairy'],
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

  // ── Extra Fairy photos (Fairy is Jin Ling's huge black dog; she hates baths) ─────────────
  const dogHead = (cx, cy, s) => `
    <g transform="translate(${cx} ${cy}) scale(${s})">
      <ellipse cx="0" cy="0" rx="120" ry="104" fill="#17161c"/>
      <path d="M-104-34c-30 10-52 70-34 120 14 30 40 24 46 2 6-30-2-76-12-122z" fill="#121117"/>
      <path d="M104-34c30 10 52 70 34 120-14 30-40 24-46 2-6-30 2-76 12-122z" fill="#121117"/>
      <ellipse cx="0" cy="44" rx="62" ry="48" fill="#24222b"/>
      <ellipse cx="0" cy="22" rx="22" ry="15" fill="#050507"/>
      <ellipse cx="-6" cy="17" rx="7" ry="4" fill="#5b5966"/>
      <path d="M-18 52q18 14 36 0" stroke="#050507" stroke-width="6" fill="none" stroke-linecap="round"/>
      <circle cx="-44" cy="-20" r="13" fill="#3a2a1a"/><circle cx="44" cy="-20" r="13" fill="#3a2a1a"/>
      <circle cx="-40" cy="-24" r="4.5" fill="#fff"/><circle cx="48" cy="-24" r="4.5" fill="#fff"/>
    </g>`;
  JC.art.def('ph_fairy_puppy', {
    title: 'Fairy, the day she arrived (2018)', w: 1200, h: 900, tags: ['dog', 'fairy', 'puppy', 'birthday'],
    svg: (w, hh) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}">
      <defs><radialGradient id="l" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#ffe6b8"/><stop offset=".6" stop-color="#e2a86a"/><stop offset="1" stop-color="#7a4a2a"/></radialGradient>
      <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b25b"/><stop offset="1" stop-color="#a77a2c"/></linearGradient></defs>
      <rect width="${w}" height="${hh}" fill="url(#l)"/>
      <circle cx="210" cy="170" r="70" fill="#fff3d6" opacity=".35"/><circle cx="1010" cy="140" r="90" fill="#fff3d6" opacity=".25"/>
      <rect x="0" y="690" width="${w}" height="210" fill="#6b3f22"/>
      <rect x="0" y="690" width="${w}" height="10" fill="#8a5631"/>
      <path d="M330 520h540l-30 330H360z" fill="url(#b)"/>
      <path d="M300 470h600v80H300z" fill="#e8c46f"/>
      <rect x="575" y="470" width="50" height="380" fill="#c8102e"/>
      <path d="M600 470c-70-80-170-70-150-10 20 50 110 30 150 10zM600 470c70-80 170-70 150-10-20 50-110 30-150 10z" fill="#d7263d"/>
      <circle cx="600" cy="468" r="22" fill="#a3122a"/>
      ${dogHead(600, 380, 0.95)}
      <path d="M530 470c0-30 140-30 140 0" fill="#17161c"/>
      <path d="M470 460c-30 0-50 14-50 30h70z M730 460c30 0 50 14 50 30h-70z" fill="#17161c"/>
      <text x="600" y="820" font-family="Helvetica,Arial,sans-serif" font-size="34" font-weight="700" fill="#fff6e0" text-anchor="middle" opacity=".85">生日快乐 A-LING · 10</text>
    </svg>`,
  });
  JC.art.def('ph_fairy_bath', {
    title: 'Fairy, bath day', w: 1200, h: 900, tags: ['dog', 'fairy', 'bath'],
    svg: (w, hh) => {
      let bubbles = '';
      for (let i = 0; i < 26; i++) {
        const x = 230 + ((i * 97) % 760), y = 520 + ((i * 53) % 150), r = 14 + ((i * 37) % 30);
        bubbles += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".92"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="#cfe8ff"/>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}">
      <defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8eef5"/><stop offset="1" stop-color="#a9cfdc"/></linearGradient></defs>
      <rect width="${w}" height="${hh}" fill="url(#t)"/>
      <g opacity=".35" stroke="#7fb0c2" stroke-width="3">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 110} 0v560"/>`).join('')}<path d="M0 140h1200M0 280h1200M0 420h1200"/></g>
      <path d="M150 560h900l-40 250c-6 40-40 60-80 60H270c-40 0-74-20-80-60z" fill="#f4f6f8"/>
      <rect x="120" y="540" width="960" height="44" rx="22" fill="#ffffff"/>
      ${dogHead(600, 430, 1.1)}
      <path d="M470 380c-20 30-14 80 0 110M730 380c20 30 14 80 0 110" stroke="#2c2a35" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>
      <g fill="#8fc9ec"><path d="M500 330q-6 18 0 26 6-8 0-26z"/><path d="M700 300q-7 20 0 30 7-10 0-30z"/><path d="M610 270q-5 14 0 20 5-6 0-20z"/></g>
      <path d="M560 455q-22-12-38 6M640 455q22-12 38 6" stroke="#0c0b10" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${bubbles}
      <rect x="930" y="250" width="60" height="140" rx="16" fill="#ff8fb1"/><rect x="942" y="230" width="36" height="30" rx="8" fill="#e45b86"/>
    </svg>`;
    },
  });
  JC.art.def('ph_fairy_office', {
    title: 'Fairy at the board meeting', w: 1200, h: 900, tags: ['dog', 'fairy', 'office'],
    svg: (w, hh) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${hh}">
      <defs><linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece4d6"/><stop offset="1" stop-color="#d9cdb8"/></linearGradient>
      <linearGradient id="win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd8e8"/><stop offset="1" stop-color="#e9d9c0"/></linearGradient></defs>
      <rect width="${w}" height="${hh}" fill="url(#wl)"/>
      <rect x="760" y="80" width="360" height="380" rx="6" fill="url(#win)"/>
      <path d="M760 380q90-60 180-10t180-30v120H760z" fill="#9cc29a" opacity=".7"/>
      <path d="M940 80v380M760 270h360" stroke="#fff" stroke-width="10"/>
      <rect x="0" y="640" width="${w}" height="260" fill="#7b5a43"/>
      <rect x="60" y="430" width="640" height="40" rx="8" fill="#5a3e2c"/>
      <rect x="90" y="470" width="24" height="200" fill="#4a3324"/><rect x="646" y="470" width="24" height="200" fill="#4a3324"/>
      <rect x="160" y="380" width="170" height="50" rx="6" fill="#efe9de"/><rect x="380" y="396" width="120" height="34" rx="4" fill="#3c3a44"/>
      <circle cx="560" cy="404" r="26" fill="#f6f1e6"/><circle cx="560" cy="404" r="18" fill="#8a5a3a"/>
      <ellipse cx="560" cy="780" rx="330" ry="90" fill="#17161c"/>
      <path d="M260 760c-40 10-60 50-40 70 30 10 80 0 90-30z" fill="#121117"/>
      ${dogHead(830, 700, 0.85)}
      <path d="M700 820c80 30 200 20 250-10" stroke="#0e0d12" stroke-width="18" fill="none" stroke-linecap="round"/>
      <rect x="880" y="620" width="70" height="14" rx="7" fill="#c9a227"/><circle cx="915" cy="642" r="10" fill="#e8e8ee"/>
      <text x="230" y="300" font-family="Helvetica,Arial,sans-serif" font-size="40" font-weight="700" fill="#6b5340" opacity=".7">Q4 — YMJ</text>
    </svg>`,
  });
})();
