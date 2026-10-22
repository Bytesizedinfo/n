/* Wanmin Go — restaurant catalogue, delivery addresses, couriers and seeded order history (facts: docs/STORY.md).
   Also JC.r7: the Liyue place helper shared by Wanmin Go, Harbor Ride and Ripple. Names follow STORY.md; positions
   come from Maps (JC.mapview places) when Maps has the place, else from a built-in layout around the player. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  // ═══ Liyue places (ids from docs/STORY.md) ═══
  // n: name · s: short name · a: address · d: [dx, dy] km from the player's flat (fallback layout) · w: waterfront
  const PL = {
    'player-home': { n: 'Chihu Rock, Lane 3', s: 'Chihu Rock, Lane 3', a: 'Lane 3, Chihu Rock', d: [0, 0] },
    pier7: { n: 'Pier 7, Liyue Harbor', s: 'Pier 7', a: 'Pier 7, Harbor Promenade', d: [-1.3, 1.0], w: true },
    northland: { n: 'Northland Bank, Liyue Branch', s: 'Northland Bank', a: 'Harbor Road 1', d: [-0.5, -1.3] },
    wangsheng: { n: 'Wangsheng Funeral Parlor', s: 'Wangsheng', a: 'Feiyun Slope 12', d: [1.7, -1.9] },
    liuli: { n: 'Liuli Pavilion', s: 'Liuli Pavilion', a: 'Feiyun Slope 3', d: [1.2, -0.7] },
    heyu: { n: 'Heyu Tea House', s: 'Heyu Tea House', a: 'Chihu Rock, Upper Terrace', d: [0.4, 0.5] },
    yujing: { n: 'Yujing Terrace', s: 'Yujing Terrace', a: 'Yujing Terrace', d: [2.5, -2.7] },
    jade: { n: 'The Jade Chamber', s: 'Jade Chamber', a: 'Above the harbor', d: [0.8, -3.5] },
    'golden-house': { n: 'The Golden House', s: 'Golden House', a: 'Golden House Road', d: [3.3, -1.2] },
    'wanmin-rest': { n: 'Wanmin Restaurant', s: 'Wanmin Restaurant', a: 'Chihu Rock, Lane 1', d: [0.2, 0.25] },
    xinyue: { n: 'Xinyue Kiosk', s: 'Xinyue Kiosk', a: 'Feiyun Slope 7', d: [0.9, -1.0] },
    'third-round': { n: 'Third-Round Knockout', s: 'Third-Round Knockout', a: 'Dockside Row 4', d: [-1.6, 0.4], w: true },
    alcor: { n: 'The Alcor, Crux Pier', s: 'The Alcor', a: 'Crux Pier', d: [-2.5, 1.5], w: true },
    mingyun: { n: 'Mingyun Toys & Games', s: 'Mingyun Toys', a: 'Feiyun Slope 21', d: [1.0, -1.4] },
    wanwen: { n: 'Wanwen Bookhouse', s: 'Wanwen Bookhouse', a: 'Feiyun Slope 18', d: [1.3, -1.2] },
    bubu: { n: 'Bubu Pharmacy', s: 'Bubu Pharmacy', a: 'Feiyun Slope 30', d: [1.5, -1.5] },
    mingxing: { n: 'Mingxing Jewelry', s: 'Mingxing Jewelry', a: 'Feiyun Slope 9', d: [1.1, -0.9] },
    apartment: { n: 'Pier View Residences 2207', s: 'Pier View Residences', a: 'Harbor Road 40, Apt 2207', d: [-0.9, -0.4] },
    airport: { n: 'Liyue Harbor International (LHI)', s: 'Liyue Harbor Intl. Airport', a: 'Arrivals Hall, Terminal 1', d: [9.2, 6.8] },
    'liyue-grand': { n: 'Liyue Harbor Grand Hotel', s: 'Liyue Harbor Grand', a: 'Harbor Road 88', d: [-0.2, -0.9] },
    wangshu: { n: 'Wangshu Inn', s: 'Wangshu Inn', a: 'Dihua Marsh Road', d: [-14.5, -15.5] },
    guyun: { n: 'Guyun Stone Forest', s: 'Guyun Stone Forest', a: 'Offshore, east of the harbor', d: [6, 9], offshore: true },
    chasm: { n: 'The Chasm', s: 'The Chasm', a: 'Old mine road', d: [10.5, -19] },
    qingce: { n: 'Qingce Village', s: 'Qingce Village', a: 'Qingce terraces', d: [-8, -18] },
    millelith: { n: 'Millelith Station, Harbor', s: 'Millelith Station', a: 'Harbor Road 12', d: [0.6, -0.3] },
    morepesok: { n: 'Morepesok, Snezhnaya', s: 'Morepesok', a: '4 Pristan Lane, Morepesok', d: [0, -900], abroad: true },
    zapolyarny: { n: 'Zapolyarny Palace, Snezhnaya', s: 'Zapolyarny Palace', a: 'Snezhnaya', d: [0, -950], abroad: true },
    // restaurants without a story place of their own
    'northern-kitchen': { n: 'Northern Kitchen', s: 'Northern Kitchen', a: 'Harbor Road 9', d: [-0.6, -0.8] },
    'good-hunter': { n: 'Good Hunter (Liyue)', s: 'Good Hunter', a: 'Feiyun Slope 15', d: [1.0, -0.5] },
    moonchase: { n: 'Moonchase Bakery', s: 'Moonchase Bakery', a: 'Chihu Rock, Lane 6', d: [-0.3, 0.6] },
  };
  const R7 = (JC.r7 = JC.r7 || {});
  R7.PLACES = PL;
  /** a place object { id, name, short, addr, x, y, … } for a story place id (Maps first, then the built-in layout) */
  R7.place = (id) => {
    if (!id) return null;
    if (typeof id === 'object') return id;
    const mv = JC.mapview;
    let p = null;
    try { p = mv ? mv.place(id) : null; } catch (e) { p = null; }
    const f = PL[id];
    if (!f) return p && p.x != null ? p : null;
    const H = mv && mv.HOME ? mv.HOME : [0, 0];
    const base = p && p.x != null && !p.isUser ? p : { x: H[0] + f.d[0], y: H[1] + f.d[1], cat: 'pin', fallback: true };
    return Object.assign({}, base, { id, name: f.n, short: f.s, addr: f.a, city: 'Liyue Harbor', abroad: !!f.abroad, offshore: !!f.offshore, water: !!f.w });
  };
  R7.name = (id) => { const p = R7.place(id); return p ? (p.short || p.name) : String(id || '—'); };
  R7.fullName = (id) => { const p = R7.place(id); return p ? p.name : String(id || '—'); };
  R7.ids = () => Object.keys(PL);
  /** driving leg between two places (Maps routing when it can, else a straight-line estimate) */
  R7.leg = (a, b) => {
    const A = R7.place(a), B = R7.place(b);
    if (!A || !B || A.abroad || B.abroad || A.offshore || B.offshore) return null;
    let rt = null;
    try { rt = JC.mapview ? JC.mapview.route(A, B, 'drive') : null; } catch (e) { rt = null; }
    if (rt && rt.pts && rt.pts.length > 1) return { km: rt.km, min: rt.min, pts: rt.pts };
    const km = Math.max(0.3, Math.hypot(A.x - B.x, A.y - B.y) * 1.3);
    return { km, min: Math.max(3, km * 2.6), pts: [[A.x, A.y], [B.x, B.y]] };
  };
  R7.money = (n) => JC.util.fmtMoney(n);

  // ═══ menu option helpers ═══
  const SPICE = (extra) => ({ n: 'Spice level', one: true, req: true, ch: [['Mild', 0], ['Medium', 0], ['Hot', 0]].concat(extra ? [[extra, 0]] : []) });
  const SUGAR = { n: 'Sweetness', one: true, req: true, ch: [['Regular', 0], ['Less sweet', 0], ['No sugar', 0]] };
  const TEMP = { n: 'Temperature', one: true, req: true, ch: [['Hot', 0], ['Warm', 0], ['Iced', 0]] };
  const RICE = { id: 'rice', n: 'Steamed rice', d: 'One bowl.', p: 6 };

  const RESTS = [
    { id: 'wanmin', name: 'Wanmin Restaurant', place: 'wanmin-rest', cuisine: 'Liyue · Spicy', price: 'ℳℳ', art: 'p_wanmin_kitchen', rating: 4.9, reviews: '6.8k', prep: 14, hours: '10:00-03:00',
      tags: ['liyue', 'spicy', 'hotpot', 'mapo', 'tofu', 'shrimp', 'noodles', 'fish', 'xiangling', 'wanmin', 'late night', 'dumplings'], promo: 'Stamp card: 9 of 10', stamp: true,
      note: 'Chef Xiangling cooks every order herself (Guoba supervises). Our spice levels are not a suggestion.', menu: [
        { cat: 'Popular', items: [
          { id: 'wm_hotpot4', n: 'Wanmin Hotpot Set for Four', d: 'Jueyun chili broth, sliced beef and lamb, shrimp paste, tofu skin, mushrooms, greens and hand-pulled noodles. Burner and pot included.', p: 688, art: 'food_hotpot', tag: '#1 most liked', opts: [{ n: 'Broth', one: true, req: true, ch: [['Jueyun chili', 0], ['Mountain mushroom', 0], ['Half and half', 20]] }, SPICE('Xiangling’s choice')] },
          { id: 'wm_mapo', n: 'Mapo Tofu', d: 'Silken tofu, minced beef, fermented bean paste and a numbing amount of pepper.', p: 68, art: 'food_mapo', opts: [SPICE()] },
          { id: 'wm_jade', n: 'Jade Parcels', d: 'Ham and bamboo shoots wrapped in cabbage leaves, tied with chives, in a clear broth.', p: 88, art: 'food_jade_parcels' },
          { id: 'wm_perch', n: 'Black-Back Perch Stew', d: 'Whole perch braised with chili, ginger and a splash of rice wine.', p: 128, art: 'food_fish_stew' },
        ] },
        { cat: 'Signature', items: [
          { id: 'wm_shrimp', n: 'Crystal Shrimp', d: 'Translucent dumplings, eight per basket.', p: 96, art: 'food_crystal_shrimp' },
          { id: 'wm_mora', n: 'Mora Meat', d: 'Crisp flatbread stuffed with braised pork. Coin-shaped, of course.', p: 38, art: 'food_mora_meat', tag: 'Street classic' },
          { id: 'wm_noodles', n: 'Dragon Beard Noodles', d: 'Hand-pulled to a thousand strands, in pork bone broth.', p: 58, art: 'food_noodles' },
          { id: 'wm_chicken', n: 'Jueyun Chili Chicken', d: 'Dry-fried chicken buried in Jueyun chilies.', p: 92, opts: [SPICE()] },
          { id: 'wm_chopsuey', n: 'Zhongyuan Chop Suey', d: 'Pork, mushroom and seasonal greens. Gentle.', p: 64 },
          { id: 'wm_guoba', n: 'Guoba’s Pick', d: 'Whatever the chef’s red panda pointed at today. Always good. Sometimes surprising.', p: 108, tag: 'Surprise' },
          RICE,
        ] },
        { cat: 'Sweets & drinks', items: [
          { id: 'wm_almond', n: 'Almond Tofu', d: 'Chilled, silky, with osmanthus syrup.', p: 32, art: 'food_almond_tofu' },
          { id: 'wm_milktea', n: 'Osmanthus Milk Tea', d: 'Black tea, fresh milk, osmanthus honey.', p: 28, art: 'food_milk_tea', opts: [SUGAR, TEMP] },
          { id: 'wm_soda', n: 'Chili Lime Soda', d: 'Yes, there is chili in it.', p: 18 },
        ] },
        { cat: 'For the whole table', items: [
          { id: 'wm_everything', n: 'The Whole Menu', d: 'One portion of every dish we cook tonight. 23 dishes, three couriers. Please clear a large table.', p: 4980, tag: 'Paimon’s favourite' },
          { id: 'wm_party', n: 'Party Platter for Ten', d: 'Mora meat, jade parcels, crystal shrimp, chop suey and rice for ten.', p: 880 },
        ] },
      ] },
    { id: 'xinyue', name: 'Xinyue Kiosk', place: 'xinyue', cuisine: 'Fine Liyue dining', price: 'ℳℳℳ', art: 'food_crystal_shrimp', rating: 4.8, reviews: '2.1k', prep: 22, hours: '11:00-23:30',
      tags: ['liyue', 'seafood', 'shrimp', 'crab', 'fine dining', 'xinyue', 'dumplings'], note: 'Upscale Liyue cooking on Feiyun Slope. Delivered in lacquered boxes with a porcelain spoon.', menu: [
        { cat: 'Popular', items: [
          { id: 'xy_crab', n: 'Golden Crab', d: 'Whole crab fried in salted egg yolk.', p: 268, tag: '#1 most liked' },
          { id: 'xy_shrimp', n: 'Crystal Shrimp (premium)', d: 'With a quail egg in every dumpling.', p: 128, art: 'food_crystal_shrimp' },
          { id: 'xy_squirrel', n: 'Squirrel Fish', d: 'Mandarin fish, scored, fried and glazed sweet and sour.', p: 188 },
        ] },
        { cat: 'Mains', items: [
          { id: 'xy_peace', n: 'Prosperous Peace', d: 'Braised abalone with mushrooms. Traditionally ordered by people closing a deal.', p: 238 },
          { id: 'xy_bamboo', n: 'Bamboo Shoot Soup', d: 'Clear, slow, eight hours.', p: 96 },
          { id: 'xy_jade', n: 'Jade Parcels', d: 'Kiosk recipe, with Jueyun ham.', p: 118, art: 'food_jade_parcels' },
        ] },
        { cat: 'Tea', items: [{ id: 'xy_tea', n: 'Jueyun Premium Oolong', d: 'One pot, hot.', p: 98 }] },
      ] },
    { id: 'liuli', name: 'Liuli Pavilion', branch: 'Delivery menu', place: 'liuli', cuisine: 'Banquet · Liyue classics', price: 'ℳℳℳℳ', art: 'food_jade_parcels', rating: 4.9, reviews: '980', prep: 35, hours: '17:00-23:00',
      tags: ['liyue', 'fine dining', 'banquet', 'wine', 'osmanthus', 'liuli', 'crab'], note: 'Dinner service is booked out for the Rite of Parting weekend. Delivery boxes are lacquered — our courier will collect them the next day.', menu: [
        { cat: 'Tasting', items: [
          { id: 'll_tasting', n: 'Pavilion Tasting Box for Two', d: 'Nine courses, two lacquered boxes, two cups.', p: 1680, tag: 'Most ordered' },
          { id: 'll_tianshu', n: 'Tianshu Meat', d: 'Pork belly braised for a whole afternoon.', p: 268 },
          { id: 'll_crab', n: 'Golden Crab', d: 'Salted egg yolk, chili, shiso.', p: 398 },
        ] },
        { cat: 'Classics', items: [
          { id: 'll_jade', n: 'Jade Parcels', d: 'The Pavilion’s own broth.', p: 148, art: 'food_jade_parcels' },
          { id: 'll_peace', n: 'Prosperous Peace', d: 'Abalone, sea cucumber, mushrooms.', p: 188 },
          { id: 'll_moonpie', n: 'Moon Pie', d: 'Flaky, filled with sweetened bean paste.', p: 68 },
        ] },
        { cat: 'Wine', items: [{ id: 'll_wine', n: 'Osmanthus Wine (one jar)', d: 'Sweet, strong, and responsible for a lot of voice memos.', p: 420, alcohol: true }] },
      ] },
    { id: 'third-round', name: 'Third-Round Knockout', place: 'third-round', cuisine: 'Dockside diner · Noodles', price: 'ℳ', art: 'food_noodles', rating: 4.6, reviews: '3.4k', prep: 11, hours: '06:00-02:00',
      tags: ['noodles', 'diner', 'docks', 'fish', 'late night', 'cheap', 'breakfast', 'third round'], promo: 'Punch card: 7 of 10', note: 'A teahouse-diner by the docks. Fighters, dockworkers and one ginger regular who always orders the special.', menu: [
        { cat: 'Popular', items: [
          { id: 'tr_special', n: 'Third-Round Special', d: 'Noodles, two fried eggs, grilled fish and a mountain of pork. “Feeds a fighter.”', p: 98, tag: 'The regular’s usual' },
          { id: 'tr_noodles', n: 'Knockout Noodles', d: 'Thick noodles, chili oil, pork, scallion.', p: 32, art: 'food_noodles', opts: [SPICE()] },
          { id: 'tr_tigerfish', n: 'Grilled Tiger Fish', d: 'Charcoal-grilled, salt and lime.', p: 46 },
        ] },
        { cat: 'More', items: [
          { id: 'tr_honey', n: 'Sticky Honey Roast', d: 'Honey-glazed pork with carrots.', p: 58 },
          { id: 'tr_rice', n: 'Fisherman’s Rice', d: 'Fried rice with whatever came in on the morning boat.', p: 28 },
          { id: 'tr_twists', n: 'Fried Dough Twists ×4', d: 'Crisp, sweet.', p: 12 },
          { id: 'tr_plum', n: 'Iced Plum Drink', d: 'Smoky and tart.', p: 10 },
        ] },
      ] },
    { id: 'northern', name: 'Northern Kitchen', place: 'northern-kitchen', cuisine: 'Snezhnayan home cooking', price: 'ℳℳ', art: 'food_pelmeni', rating: 4.8, reviews: '1.2k', prep: 16, hours: '11:00-04:00',
      tags: ['snezhnaya', 'snezhnayan', 'pelmeni', 'borscht', 'dumplings', 'soup', 'fish', 'stew', 'late night', 'northern'], promo: 'Night shift? Free tea after midnight',
      note: 'Pelmeni, borscht and fish stew the way they make them up north. Our cook is from a fishing village and will not discuss the dill.', menu: [
        { cat: 'Popular', items: [
          { id: 'nk_pelmeni', n: 'Pelmeni (20 pieces)', d: 'Beef and pork, boiled, with butter.', p: 58, art: 'food_pelmeni', tag: '#1 most liked', opts: [{ n: 'Serve with', ch: [['Sour cream', 0], ['Extra butter', 0], ['Dill', 0], ['Vinegar', 0]] }] },
          { id: 'nk_shiftbox', n: 'Night Shift Box', d: '60 pelmeni, borscht for six, black bread and a thermos of tea. Built for offices that never close.', p: 398, art: 'food_pelmeni', tag: 'Office favourite' },
          { id: 'nk_borscht', n: 'Borscht', d: 'Beetroot, cabbage, beef, a spoon of sour cream.', p: 42, art: 'food_borscht' },
          { id: 'nk_ukha', n: 'Ukha (fisherman’s stew)', d: 'Clear fish soup with potato, onion and black pepper.', p: 56, art: 'food_fish_stew' },
        ] },
        { cat: 'More from the north', items: [
          { id: 'nk_pirozhki', n: 'Pirozhki ×4', d: 'Baked buns with cabbage or meat.', p: 36 },
          { id: 'nk_blini', n: 'Blini with salmon roe', d: 'Thin pancakes, butter, roe.', p: 64 },
          { id: 'nk_syrniki', n: 'Syrniki', d: 'Farmer’s cheese pancakes with jam.', p: 34 },
        ] },
        { cat: 'Drinks', items: [
          { id: 'nk_tea', n: 'Black tea with jam', d: 'Glass, holder, spoon.', p: 12 },
          { id: 'nk_kvass', n: 'Kvass', d: 'Bread drink, cold.', p: 14 },
        ] },
      ] },
    { id: 'goodhunter', name: 'Good Hunter', branch: 'Liyue', place: 'good-hunter', cuisine: 'Mondstadt · Comfort food', price: 'ℳℳ', art: 'food_sweet_flower_chicken', rating: 4.7, reviews: '2.9k', prep: 15, hours: '08:00-23:00',
      tags: ['mondstadt', 'sweet madame', 'chicken', 'stew', 'pancake', 'breakfast', 'good hunter'], note: 'Mondstadt’s favourite restaurant, Liyue branch. Sara sends her regards.', menu: [
        { cat: 'Popular', items: [
          { id: 'gh_madame', n: 'Sweet Madame', d: 'Honey-roasted chicken with sweet flowers.', p: 52, art: 'food_sweet_flower_chicken', tag: '#1 most liked' },
          { id: 'gh_toast', n: 'Fisherman’s Toast', d: 'Toast with tomato, onion and fried fish.', p: 28 },
          { id: 'gh_stew', n: 'Cream Stew', d: 'Chicken and mushrooms in a white sauce.', p: 48 },
        ] },
        { cat: 'More', items: [
          { id: 'gh_hash', n: 'Mondstadt Hash Brown', d: 'Crisp potato with a fried egg.', p: 24 },
          { id: 'gh_pancake', n: 'Tea Break Pancake', d: 'Fluffy, berries, cream.', p: 30 },
          { id: 'gh_dandelion', n: 'Dandelion Juice', d: 'Sweet, not wine. Promise.', p: 16 },
          { id: 'gh_cider', n: 'Apple Cider', d: 'Warm, cinnamon.', p: 18 },
        ] },
      ] },
    { id: 'bubu', name: 'Bubu Pharmacy', place: 'bubu', cuisine: 'Pharmacy · 24h delivery', price: 'ℳℳ', hero: 'pharmacy', rating: 4.9, reviews: '740', prep: 9, shop: true, hours: '00:00-24:00',
      tags: ['pharmacy', 'medicine', 'bandages', 'cold', 'flu', 'first aid', 'herbal', 'baizhu', 'qiqi'], note: 'Dr. Baizhu’s pharmacy on Feiyun Slope. Qiqi packs the orders; please be patient with Qiqi.', menu: [
        { cat: 'First aid', items: [
          { id: 'bb_bandage', n: 'Bandages & antiseptic', d: 'Gauze, tape, iodine and sterile pads.', p: 42, tag: 'Bought before' },
          { id: 'bb_ice', n: 'Instant ice packs ×4', d: 'Squeeze, shake, apply.', p: 36 },
          { id: 'bb_pain', n: 'Painkillers', d: 'Twenty tablets. Read the leaflet.', p: 28 },
          { id: 'bb_blanket', n: 'Thermal blanket', d: 'Recommended after cold-water swims.', p: 56 },
        ] },
        { cat: 'Herbal', items: [
          { id: 'bb_tonic', n: 'Warming tonic (Dr. Baizhu)', d: 'Ginseng, ginger, jujube. For chills and shock.', p: 88 },
          { id: 'bb_qiqi', n: 'Qiqi’s herbal tea (box of 12)', d: '“Drink this. …What was I saying?”', p: 48 },
          { id: 'bb_flu', n: 'Cold & flu kit', d: 'Lozenges, tea, tissues and a thermometer.', p: 68 },
        ] },
      ] },
    { id: 'heyu', name: 'Heyu Tea House', place: 'heyu', cuisine: 'Tea · Opera snacks', price: 'ℳℳ', art: 'p_heyu_stage', rating: 4.8, reviews: '1.6k', prep: 10, hours: '09:00-23:00',
      tags: ['tea', 'oolong', 'osmanthus', 'snacks', 'opera', 'yun jin', 'almond tofu', 'heyu', 'dessert'], promo: 'Matinee day: delivery to the boxes',
      note: 'Home of the Yun Jin Troupe. Orders for the boxes are brought in at the interval, quietly.', menu: [
        { cat: 'Tea', items: [
          { id: 'hy_oolong', n: 'Jueyun Premium Oolong (pot)', d: 'Rock-grown, roasted, with a long sweet finish. A favourite of Wangsheng’s consultant.', p: 128, tag: 'House favourite' },
          { id: 'hy_osmanthus', n: 'Osmanthus Tea', d: 'Golden, floral, honest.', p: 48 },
          { id: 'hy_lily', n: 'Glaze Lily Tea', d: 'Delicate. Picked in Qingce at dawn.', p: 68 },
        ] },
        { cat: 'Snacks', items: [
          { id: 'hy_almond', n: 'Almond Tofu', d: 'With osmanthus syrup.', p: 32, art: 'food_almond_tofu' },
          { id: 'hy_cakes', n: 'Sweet Flower Cakes ×6', d: 'Soft, pale and dusted with sugar.', p: 36 },
          { id: 'hy_platter', n: 'Box Snack Platter for Two', d: 'Seeds, dried plums, almond tofu and cakes. Served to your box during the performance.', p: 148 },
          { id: 'hy_seeds', n: 'Sunflower seeds', d: 'Opera tradition. Crack quietly.', p: 12 },
        ] },
      ] },
    { id: 'moonchase', name: 'Moonchase Bakery', place: 'moonchase', cuisine: 'Bakery · Pastries', price: 'ℳℳ', hero: 'bakery', rating: 4.7, reviews: '1.1k', prep: 12, hours: '07:00-21:00',
      tags: ['bakery', 'mooncake', 'cake', 'pastries', 'birthday', 'buns', 'kids', 'dessert'], note: 'Celebration cakes need four hours. Write the message in special instructions.', menu: [
        { cat: 'Popular', items: [
          { id: 'mc_fishbuns', n: 'Fish-shaped buns ×6', d: 'Custard or red bean. Kids love them; so do some adults.', p: 36, tag: 'Kids’ favourite', opts: [{ n: 'Filling', one: true, req: true, ch: [['Custard', 0], ['Red bean', 0], ['Half and half', 0]] }] },
          { id: 'mc_osmanthus', n: 'Osmanthus mooncake', d: 'Single, gift-wrapped.', p: 38 },
          { id: 'mc_yolk', n: 'Salted egg yolk mooncake', d: 'Single, gift-wrapped.', p: 42 },
        ] },
        { cat: 'Cakes', items: [
          { id: 'mc_cake', n: 'Celebration cake (6")', d: 'Sponge, fresh cream, fruit. Serves 6–8.', p: 288, tag: 'Four hours’ notice', opts: [{ n: 'Flavour', one: true, req: true, ch: [['Vanilla', 0], ['Chocolate', 0], ['Osmanthus', 20]] }, { n: 'Extras', ch: [['Candles', 6], ['Sugar fish on top', 12]] }] },
          { id: 'mc_box8', n: 'Mooncake gift box (8)', d: 'Four flavours, two of each.', p: 268 },
          { id: 'mc_ocake', n: 'Osmanthus cake', d: 'Chilled, translucent.', p: 28 },
        ] },
      ] },
    { id: 'wangshu', name: 'Wangshu Inn', branch: 'Inn kitchen', place: 'wangshu', cuisine: 'Inn kitchen · Valley', price: 'ℳℳ', art: 'food_almond_tofu', rating: 4.6, reviews: '430', prep: 18, hours: '07:00-22:00', local: 4,
      tags: ['inn', 'wangshu', 'almond tofu', 'breakfast', 'soup', 'countryside'], note: 'Verr Goldet’s kitchen. Delivers inside the inn and along Dihua Marsh Road only.', menu: [
        { cat: 'Popular', items: [
          { id: 'ws_almond', n: 'Almond Tofu', d: 'A certain regular orders it every night and never comes down to eat it.', p: 28, art: 'food_almond_tofu', tag: '#1 most liked' },
          { id: 'ws_breakfast', n: 'Wangshu Breakfast Set', d: 'Congee, pickles, steamed buns and tea.', p: 58 },
          { id: 'ws_soup', n: 'Mountain Mushroom Soup', d: 'Foraged this morning.', p: 44 },
        ] },
        { cat: 'More', items: [
          { id: 'ws_greens', n: 'Stir-fried Qingce greens', d: 'Garlic, a little oil.', p: 32 },
          { id: 'ws_kids', n: 'Kids’ noodle bowl', d: 'Mild broth, egg, carrots cut like stars.', p: 26 },
          { id: 'ws_tea', n: 'Glaze Lily Tea', d: 'From the valley.', p: 24 },
        ] },
      ] },
  ];

  /** delivery addresses (story place ids) */
  const ADDRS = [
    { id: 'player-home', label: 'Current location', line: 'Chihu Rock, Lane 3', icon: 'location.fill' },
    { id: 'apartment', label: 'Home', line: 'Pier View Residences, Apt 2207', icon: 'house.fill' },
    { id: 'northland', label: 'Work', line: 'Northland Bank, Harbor Road 1 · night desk', icon: 'briefcase.fill' },
    { id: 'wangsheng', label: 'Wangsheng Funeral Parlor', line: 'Feiyun Slope 12', icon: 'building.columns.fill' },
    { id: 'heyu', label: 'Heyu Tea House', line: 'Chihu Rock, Upper Terrace · Box 2', icon: 'cup.and.saucer.fill' },
    { id: 'alcor', label: 'The Alcor', line: 'Crux Pier · hand to the deck crew', icon: 'water.waves' },
    { id: 'wangshu', label: 'Wangshu Inn', line: 'Dihua Marsh Road · front desk', icon: 'bed.double.fill' },
  ];

  /** "Send to a friend": where each contact can receive food (place ids where they are, else the contact id) */
  const FRIENDS = [
    { id: 'paimon', sub: 'Wherever Lumine is', to: 'paimon' },
    { id: 'lumine', sub: 'Wherever she is', to: 'lumine' },
    { id: 'zl', sub: (s) => (s.chapter === 'sat_noon' ? 'Heyu Tea House, Box 2 (matinee)' : 'Wangsheng Funeral Parlor'), to: (s) => (s.chapter === 'sat_noon' ? 'heyu' : 'wangsheng') },
    { id: 'ht', sub: 'Wangsheng Funeral Parlor', to: 'wangsheng' },
    { id: 'ekat', sub: 'Northland Bank · front desk', to: 'northland' },
    { id: 'ops', name: 'Liyue Branch night shift', avatar: { emoji: '🐟', grad: ['#a5d8ff', '#1c4f82'] }, sub: 'Northland Bank · back office, 6 people', to: 'northland' },
    { id: 'xl', sub: 'Wanmin Restaurant (she’ll laugh)', to: 'wanmin-rest' },
    { id: 'beidou', sub: 'The Alcor, Crux Pier', to: 'alcor' },
    { id: 'tonia', kids: true }, { id: 'teucer', kids: true },
    { id: 'mama', abroad: 'Morepesok, Snezhnaya' }, { id: 'papa', abroad: 'Morepesok, Snezhnaya' },
  ];

  const COURIERS = [['Xudong', 4.97, 'E-bike'], ['Ying’er', 4.95, 'Electric scooter'], ['Jifang', 4.92, 'E-bike'], ['Shitou', 4.99, 'On foot (the Chihu Rock stairs)'], ['Lan Yan', 4.96, 'Electric scooter'], ['Tian Tie', 4.9, 'Delivery tricycle']];

  const CATS = [
    { id: 'liyue', n: 'Liyue', art: 'food_mapo', q: ['liyue'] },
    { id: 'hotpot', n: 'Hotpot', art: 'food_hotpot', q: ['hotpot'] },
    { id: 'north', n: 'Snezhnayan', art: 'food_borscht', q: ['snezhnaya', 'pelmeni'] },
    { id: 'noodles', n: 'Noodles', art: 'food_noodles', q: ['noodles'] },
    { id: 'seafood', n: 'Seafood', art: 'food_crystal_shrimp', q: ['seafood', 'shrimp', 'fish'] },
    { id: 'tea', n: 'Tea', art: 'food_milk_tea', q: ['tea', 'oolong'] },
    { id: 'sweets', n: 'Sweets', art: 'food_almond_tofu', q: ['dessert', 'bakery', 'almond tofu', 'mooncake'] },
    { id: 'mond', n: 'Mondstadt', art: 'food_sweet_flower_chicken', q: ['mondstadt'] },
    { id: 'street', n: 'Street food', art: 'food_mora_meat', q: ['cheap', 'street', 'diner', 'mora'] },
    { id: 'pharmacy', n: 'Pharmacy', icon: 'cross.case.fill', q: ['pharmacy'] },
  ];

  // ═══ seeded order history (Childe's account; agrees with the Wanmin Go SMS thread and the bank statement) ═══
  const RX = {};
  RESTS.forEach((r) => r.menu.forEach((c) => c.items.forEach((it) => { RX[r.id + ':' + it.id] = it; })));
  function O(id, rest, to, t, end, lines, more) {
    const items = lines.map(([iid, qty, opts]) => { const it = RX[rest + ':' + iid] || { n: iid, p: 0 }; return { id: iid, name: it.n, qty, price: it.p, opts: opts || '' }; });
    const sub = items.reduce((a, b) => a + b.price * b.qty, 0);
    const fee = more.fee != null ? more.fee : 12;
    const service = Math.min(60, Math.max(4, Math.round(sub * 0.04)));
    const tip = more.tip || 0;
    return Object.assign({ id, rest, to, t, end, status: 'delivered', phase: 'delivered', items, sub, fee, service, tip, discount: 0, total: sub + fee + service + tip, card: 'nb' }, more);
  }
  JC.store.seed('orders', [
    O('o_1016_1230', 'heyu', 'wangsheng', '+0 12:30', '+0 12:52', [['hy_oolong', 1], ['hy_almond', 2]], { for: 'zl', fee: 10, tip: 10, note: 'For Mr. Zhongli. He’ll say he didn’t order it. He didn’t.', courier: { name: 'Shitou', rating: 4.99, vehicle: 'On foot (the Chihu Rock stairs)' }, rated: 5 }),
    O('o_1015_2150', 'northern', 'northland', '-1 21:50', '-1 22:24', [['nk_shiftbox', 2], ['nk_tea', 6]], { for: 'ops', fee: 14, tip: 30, note: 'For the night shift, back office. Lyuba: the pelmeni are hot. Do not freeze them.', courier: { name: 'Tian Tie', rating: 4.9, vehicle: 'Delivery tricycle' }, rated: 5 }),
    O('o_1015_1305', 'wanmin', 'northland', '-1 13:05', '-1 13:31', [['wm_mora', 2], ['wm_noodles', 1, 'Hot'], ['wm_almond', 1]], { fee: 9, note: 'Top floor. Tell security it’s for the director.', courier: { name: 'Xudong', rating: 4.97, vehicle: 'E-bike' }, rated: 5 }),
    O('o_1014_2310', 'wanmin', 'paimon', '-2 23:10', '-2 23:46', [['wm_mapo', 3, 'Hot'], ['wm_jade', 4], ['wm_shrimp', 3], ['wm_mora', 6]], { for: 'paimon', fee: 15, note: 'For Paimon. She knows.', courier: { name: 'Ying’er', rating: 4.95, vehicle: 'Electric scooter' }, rated: 4 }),
    O('o_1013_0212', 'northern', 'apartment', '-3 02:12', '-3 02:41', [['nk_borscht', 1], ['nk_pirozhki', 1], ['nk_tea', 1]], { fee: 11, note: 'Leave it at the door.', courier: { name: 'Lan Yan', rating: 4.96, vehicle: 'Electric scooter' }, rated: 0 }),
    O('o_1010_1925', 'goodhunter', 'paimon', '-6 19:25', '-6 20:05', [['gh_madame', 38]], { for: 'paimon', fee: 18, tip: 20, note: 'Paimon said “a few”. Paimon lied.', courier: { name: 'Tian Tie', rating: 4.9, vehicle: 'Delivery tricycle' }, rated: 5 }),
    O('o_1001_1940', 'heyu', 'wangsheng', '2026-10-01 19:40', '2026-10-01 20:02', [['hy_oolong', 2], ['hy_cakes', 2]], { for: 'zl', fee: 10, note: 'For the parlor staff. It’s going to be a long two weeks.', courier: { name: 'Shitou', rating: 4.99, vehicle: 'On foot (the Chihu Rock stairs)' }, rated: 5 }),
    O('o_0928_2340', 'bubu', 'apartment', '2026-09-28 23:40', '2026-09-29 00:05', [['bb_bandage', 1], ['bb_ice', 2], ['bb_pain', 1]], { fee: 9, note: 'Leave at the door. Don’t knock. Don’t ask.', courier: { name: 'Jifang', rating: 4.92, vehicle: 'E-bike' }, rated: 5 }),
    O('o_0905_1210', 'third-round', 'alcor', '2026-09-05 12:10', '2026-09-05 12:38', [['tr_special', 2], ['tr_plum', 2]], { for: 'beidou', fee: 12, note: 'For the captain. Loser buys lunch. (I didn’t lose. I’m being generous.)', courier: { name: 'Xudong', rating: 4.97, vehicle: 'E-bike' }, rated: 5 }),
    O('o_0720_2010', 'wanmin', 'wanmin-rest', '2026-07-20 20:10', '2026-07-20 20:10', [['wm_hotpot4', 2, 'Half and half · Hot']], { pickup: true, fee: 0, note: 'Pickup · birthday table for the hotpot crew', rated: 5 }),
  ]);

  // ═══ Wanmin Go–only illustrations (bakery and pharmacy listing heroes) ═══
  JC.art.def('wm_hero_bakery', {
    title: 'Moonchase Bakery', w: 1200, h: 900, tags: ['food'],
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a54"/><stop offset="1" stop-color="#1b1430"/></linearGradient><radialGradient id="m" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d8"/><stop offset="1" stop-color="#f3d58a"/></radialGradient><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#5c3a20"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#b)"/><circle cx="930" cy="190" r="120" fill="url(#m)" opacity=".95"/><circle cx="890" cy="160" r="22" fill="#e9c66f" opacity=".5"/>` +
      Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 197) % 1180 + 10}" cy="${(i * 83) % 330 + 20}" r="${1.5 + (i % 3)}" fill="#fff" opacity="${0.3 + (i % 4) * 0.12}"/>`).join('') +
      `<rect y="600" width="${w}" height="300" fill="url(#t)"/><rect y="600" width="${w}" height="16" fill="#a8744a"/>` +
      [[260, 600, 130], [520, 640, 150], [800, 610, 120]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y + 40}" rx="${r}" ry="${r * 0.28}" fill="#000" opacity=".25"/><rect x="${x - r}" y="${y - r * 0.55}" width="${r * 2}" height="${r * 0.9}" rx="${r * 0.2}" fill="#d99a4e"/><ellipse cx="${x}" cy="${y - r * 0.55}" rx="${r}" ry="${r * 0.32}" fill="#e8b062"/><circle cx="${x}" cy="${y - r * 0.55}" r="${r * 0.22}" fill="none" stroke="#b97a35" stroke-width="7"/>` +
        Array.from({ length: 8 }, (_, k) => `<path d="M${x} ${y - r * 0.55}l${(Math.cos((k * Math.PI) / 4) * r * 0.8).toFixed(1)} ${(Math.sin((k * Math.PI) / 4) * r * 0.25).toFixed(1)}" stroke="#c4843d" stroke-width="5" stroke-linecap="round"/>`).join('')).join('') +
      `<path d="M120 790c40-30 90-30 130 0-40 30-90 30-130 0zm130 0 30-22v44z" fill="#f2c27a"/><path d="M930 800c40-30 90-30 130 0-40 30-90 30-130 0zm130 0 30-22v44z" fill="#f2c27a"/></svg>`,
  });
  JC.art.def('wm_hero_pharmacy', {
    title: 'Bubu Pharmacy', w: 1200, h: 900, tags: ['pharmacy'],
    svg: (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f2e6"/><stop offset="1" stop-color="#9fd8bf"/></linearGradient></defs>` +
      `<rect width="${w}" height="${h}" fill="url(#b)"/>` +
      Array.from({ length: 4 }, (_, row) => `<rect x="80" y="${120 + row * 170}" width="1040" height="14" rx="7" fill="#6a4a2e"/>` + Array.from({ length: 9 }, (_, i) => `<rect x="${110 + i * 112}" y="${30 + row * 170}" width="${70 + (i % 3) * 8}" height="90" rx="10" fill="${['#f8f3e6', '#e9c46a', '#f4a261', '#ffffff', '#cde7d8'][(i + row) % 5]}" stroke="#6a4a2e" stroke-opacity=".25" stroke-width="3"/>`).join('')).join('') +
      `<circle cx="600" cy="610" r="190" fill="#fff" opacity=".92"/><rect x="560" y="490" width="80" height="240" rx="18" fill="#2f9e6e"/><rect x="480" y="570" width="240" height="80" rx="18" fill="#2f9e6e"/>` +
      `<text x="600" y="860" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="56" font-weight="800" fill="#1d5c41" letter-spacing="6">BUBU PHARMACY</text></svg>`,
  });

  JC.lotusEatsData = { RESTS, ADDRS, FRIENDS, COURIERS, CATS };
})();
