/* Lotus Eats — restaurant catalogue, addresses and seeded order history (facts: docs/STORY.md).
   Restaurants sit on the shared map (JC.mapview places) so hours, distance and cities agree with Maps. */
(function () {
  'use strict';
  const JC = (window.JC = window.JC || {});

  // ── option-group helpers ──
  const SIZE = (up, a, b) => ({ n: 'Size', one: true, req: true, ch: [[a || 'Regular', 0], [b || 'Large', up]] });
  const SPICE = (extra) => ({ n: 'Spice level', one: true, req: true, ch: [['Not spicy', 0], ['Mild', 0], ['Medium', 0], ['Hot', 0]].concat(extra ? [[extra, 0]] : []) });
  const SUGAR = { n: 'Sugar', one: true, req: true, ch: [['Regular sugar', 0], ['70%', 0], ['50%', 0], ['30%', 0], ['No sugar', 0]] };
  const ICE = { n: 'Ice', one: true, req: true, ch: [['Regular ice', 0], ['Less ice', 0], ['No ice', 0], ['Hot', 0]] };
  const TOP = { n: 'Toppings', ch: [['Brown sugar pearls', 0], ['Extra pearls', 3], ['Grass jelly', 3], ['Cheese foam', 5], ['Pudding', 4]] };
  const RICE = { id: 'rice', n: 'Steamed rice', d: 'One bowl.', p: 3 };

  const OWL = [
    { cat: 'Popular', items: [
      { id: 'cg1', n: 'Century egg & pork congee', d: 'Rice simmered for six hours with preserved duck egg, shredded pork, ginger and scallion.', p: 26, art: 'food_congee', tag: '#1 most liked', opts: [SIZE(6), { n: 'Add-ons', ch: [['Youtiao (fried dough)', 4], ['Salted duck egg', 5], ['Extra ginger', 0], ['No scallion', 0]] }] },
      { id: 'cg2', n: 'Steamed pork baozi ×3', d: 'Pork and cabbage in fluffy dough, steamed to order.', p: 15, art: 'food_baozi', opts: [{ n: 'Dipping sauce', ch: [['Black vinegar', 0], ['Chili oil', 0]] }] },
      { id: 'cg3', n: 'Late-night set for one', d: 'Congee of the day, two baozi, youtiao and hot soy milk. For people who are still at the office.', p: 42, tag: 'Night owl favourite' },
    ] },
    { cat: 'Congee', items: [
      { id: 'cg4', n: 'Fish slice congee', d: 'Grass carp, white pepper, crispy shallots.', p: 32, opts: [SIZE(6)] },
      { id: 'cg5', n: 'Chicken & mushroom congee', d: 'Free-range chicken, shiitake, sesame oil.', p: 28, opts: [SIZE(6)] },
      { id: 'cg6', n: 'Sweet potato & millet congee', d: 'Gentle, golden, good at 3 a.m.', p: 16 },
      { id: 'cg7', n: 'Plain white congee', d: 'Just rice and patience.', p: 8 },
    ] },
    { cat: 'Sides', items: [
      { id: 'cg8', n: 'Youtiao', d: 'Two crisp fried dough sticks.', p: 6 },
      { id: 'cg9', n: 'Tea egg', d: 'Marbled with soy and star anise.', p: 4 },
      { id: 'cg10', n: 'Smashed cucumber', d: 'Garlic, black vinegar, chili.', p: 12 },
      { id: 'cg11', n: 'Pickled mustard greens', d: 'The classic congee companion.', p: 4 },
    ] },
    { cat: 'Drinks', items: [
      { id: 'cg12', n: 'Hot soy milk', d: 'Fresh-ground, lightly sweet.', p: 6, opts: [{ n: 'Sweetness', one: true, req: true, ch: [['Sweet', 0], ['Unsweetened', 0]] }] },
      { id: 'cg13', n: 'Ginger & brown sugar tea', d: 'Warms you from the inside.', p: 8 },
    ] },
  ];

  const RESTS = [
    { id: 'night-owl-ll', name: 'Night Owl Congee', branch: 'Jinxing', place: 'night-owl-ll', cuisine: 'Congee · Late night', price: '¥', art: 'food_congee', rating: 4.7, reviews: '2.4k', prep: 9,
      tags: ['congee', 'late night', 'breakfast', 'baozi', 'chinese', 'night owl', 'porridge'], promo: 'Free soy milk after midnight', menu: OWL },
    { id: 'lotus-root-kitchen', name: 'Lotus Root Kitchen', place: 'lotus-root-kitchen', cuisine: 'Yunmeng home cooking', price: '¥¥', art: 'food_soup', rating: 4.8, reviews: '1.7k', prep: 16,
      tags: ['soup', 'lotus root', 'yunmeng', 'fish', 'noodles', 'chinese', 'home cooking', 'pork rib'], note: 'Our lotus root arrives from Yunmeng every morning.', menu: [
        { cat: 'Popular', items: [
          { id: 'lr1', n: 'Lotus root & pork rib soup', d: 'Yunmeng-style. Pork ribs and lotus root simmered for two hours on a low fire. We don’t rush it.', p: 58, art: 'food_soup', tag: '#1 most liked', opts: [SIZE(30, 'For one', 'Family pot (serves 3–4)'), { n: 'Extras', ch: [['Extra lotus root', 6], ['Peanuts', 3], ['Goji berries', 2]] }] },
          { id: 'lr2', n: 'Sticky-rice stuffed lotus root', d: 'Osmanthus syrup, glutinous rice, served cool.', p: 28, art: 'food_lotus_cake' },
          { id: 'lr3', n: 'Hot dry noodles', d: 'Sesame paste, pickled radish, scallion. A Yunmeng breakfast, served all day.', p: 18, art: 'food_noodles', opts: [SPICE()] },
        ] },
        { cat: 'Mains', items: [
          { id: 'lr4', n: 'Steamed Wuchang fish', d: 'Whole bream, ginger, scallion, light soy.', p: 68 },
          { id: 'lr5', n: 'Yunmeng fish cakes', d: 'Silky, pan-seared, eight pieces.', p: 36 },
          { id: 'lr6', n: 'Lotus root stir-fry', d: 'Crisp slices, dried chili, Sichuan pepper.', p: 26, opts: [SPICE()] },
          { id: 'lr7', n: 'Braised pork with lotus root', d: 'Dark soy, rock sugar, star anise.', p: 46 },
          RICE,
        ] },
        { cat: 'Sweets', items: [
          { id: 'lr8', n: 'Lotus flower pastries ×4', d: 'Flaky petals, lotus seed paste.', p: 24, art: 'food_lotus_cake' },
          { id: 'lr9', n: 'Lotus seed sweet soup', d: 'Lotus seeds, lily bulb, rock sugar. Served warm.', p: 16 },
        ] },
      ] },
    { id: 'skewers', name: 'Night Market Skewers', place: 'night-market', cuisine: 'BBQ · Street food', price: '¥', art: 'food_skewers', rating: 4.6, reviews: '3.3k', prep: 12,
      tags: ['skewers', 'bbq', 'late night', 'lamb', 'street food', 'beer', 'night market', 'spicy'], menu: [
        { cat: 'Popular', items: [
          { id: 'sk1', n: 'Cumin lamb skewers ×5', d: 'Charcoal-grilled, cumin, chili flakes.', p: 30, art: 'food_skewers', tag: '#1 most liked', opts: [SPICE('Night-market hot')] },
          { id: 'sk2', n: 'Grilled squid', d: 'Whole squid, sweet chili glaze.', p: 25 },
          { id: 'sk3', n: 'Chicken wings ×4', d: 'Honey-soy or spicy.', p: 18, opts: [{ n: 'Flavour', one: true, req: true, ch: [['Honey-soy', 0], ['Spicy', 0]] }] },
        ] },
        { cat: 'Grill', items: [
          { id: 'sk4', n: 'Beef skewers ×5', d: 'Black pepper, sesame.', p: 32 },
          { id: 'sk5', n: 'Garlic eggplant', d: 'Split, grilled, buried in garlic.', p: 16 },
          { id: 'sk6', n: 'Grilled corn', d: 'Butter, chili salt.', p: 10 },
          { id: 'sk7', n: 'Cumin potatoes', d: 'Crispy edges, soft middles.', p: 12 },
          { id: 'sk8', n: 'Grilled buns ×2', d: 'Charred mantou, condensed milk.', p: 8 },
        ] },
        { cat: 'Drinks', items: [
          { id: 'sk9', n: 'Sour plum drink', d: 'Smoky, tart, iced.', p: 8 },
          { id: 'sk10', n: 'Lanling lager (500 ml)', d: 'Ice cold. ID checked on delivery.', p: 10, alcohol: true },
        ] },
      ] },
    { id: 'golden-dumpling', name: 'Golden Dumpling House', place: 'golden-dumpling', cuisine: 'Dumplings · Buns', price: '¥', art: 'food_dumplings', rating: 4.6, reviews: '2.6k', prep: 14,
      tags: ['dumplings', 'jiaozi', 'buns', 'baozi', 'chinese', 'late night'], menu: [
        { cat: 'Popular', items: [
          { id: 'gd1', n: 'Pan-fried pork dumplings ×10', d: 'Crisp bottoms, juicy pork, lace skirt.', p: 26, art: 'food_dumplings', tag: '#1 most liked', opts: [{ n: 'Dipping sauce', ch: [['Black vinegar', 0], ['Chili oil', 0], ['Garlic soy', 0]] }] },
          { id: 'gd2', n: 'Pork & chive dumplings ×12', d: 'Boiled, northern style.', p: 22 },
          { id: 'gd3', n: 'Steamed buns ×4', d: 'Pork & bamboo shoot.', p: 16, art: 'food_baozi' },
        ] },
        { cat: 'Dumplings', items: [
          { id: 'gd4', n: 'Shrimp & corn dumplings ×10', d: 'Sweet and bouncy.', p: 32 },
          { id: 'gd5', n: 'Mushroom & tofu dumplings ×12', d: 'Vegetarian.', p: 20 },
          { id: 'gd6', n: 'Dumpling party box (40)', d: 'Four kinds, ten each. Feeds a whole office.', p: 88 },
        ] },
        { cat: 'Sides & soup', items: [
          { id: 'gd7', n: 'Hot & sour soup', d: 'Tofu, wood ear, egg ribbons.', p: 16 },
          { id: 'gd8', n: 'Smashed cucumber', d: 'Garlic and vinegar.', p: 12 },
        ] },
      ] },
    { id: 'koi-cafe', name: 'Koi Tower Café', place: 'koi-cafe', cuisine: 'Café · Desserts', price: '¥¥', art: 'food_milktea', rating: 4.3, reviews: '1.5k', prep: 8,
      tags: ['coffee', 'cafe', 'dessert', 'milk tea', 'cookies', 'koi tower', 'cake'], note: 'Koi Tower lobby. Proceeds from koi cookies feed the 23 koi.', menu: [
        { cat: 'Popular', items: [
          { id: 'kc1', n: 'Brown sugar milk tea', d: 'Tiger stripes, chewy pearls, fresh milk.', p: 28, art: 'food_milktea', opts: [SUGAR, ICE] },
          { id: 'kc2', n: 'Koi cookies (box of 6)', d: 'Butter cookies shaped like the forecourt koi. Gold ones are lucky.', p: 36, tag: 'Gala favourite' },
          { id: 'kc3', n: 'Peony latte', d: 'Rose-peony syrup, oat milk, gold dust.', p: 38, opts: [ICE] },
        ] },
        { cat: 'Bakery', items: [
          { id: 'kc4', n: 'Golden croissant', d: 'Laminated, honey-glazed.', p: 28 },
          { id: 'kc5', n: 'Matcha cheesecake', d: 'Basque-style, burnt top.', p: 42 },
          { id: 'kc6', n: 'Lotus pastries ×4', d: 'Flaky petals, lotus seed paste.', p: 32, art: 'food_lotus_cake' },
        ] },
        { cat: 'Drinks', items: [
          { id: 'kc7', n: 'Americano', d: 'Double shot.', p: 26, opts: [ICE] },
          { id: 'kc8', n: 'Sparkling water', d: '330 ml.', p: 15 },
        ] },
      ] },
    { id: 'yiling-popup', name: 'Yiling Radish Co. Pop-up', place: 'night-market', hours: 'Sat-Sun 18:00-23:30', cuisine: 'Farm stall · Radishes', price: '¥', art: 'food_radish_cake', rating: 4.9, reviews: '318', prep: 10,
      away: 'the radish king is at a fancy gala tonight 🥕 back saturday 6pm!! pre-order and i’ll save u some',
      tags: ['radish', 'vegetarian', 'yiling', 'wei wuxian', 'pop-up', 'spicy', 'night market', 'farm'], note: 'Small-batch radishes from Yiling Radish Co. Run by a flute teacher. No dogs please (seriously).', menu: [
        { cat: 'Popular', items: [
          { id: 'yr1', n: 'Pan-fried radish cake', d: 'Crispy outside, soft inside, chili crisp on top. Grandma-approved (not my grandma).', p: 18, art: 'food_radish_cake', tag: '#1 most liked', opts: [{ n: 'Topping', ch: [['Extra chili crisp', 2], ['Fried shallots', 0]] }] },
          { id: 'yr2', n: 'Very spicy radish salad', d: 'Spice level: Yiling. There are no other levels.', p: 14, tag: 'Spicy' },
          { id: 'yr3', n: 'Radish & lotus root soup', d: 'still working on this one. lan zhan says it’s good. lan zhan is biased', p: 26, art: 'food_soup', opts: [SIZE(12)] },
        ] },
        { cat: 'Take home', items: [
          { id: 'yr4', n: 'Pickled radish jar (500 g)', d: 'Sweet, sour, crunchy. Lasts a month. Won’t last a month.', p: 28 },
          { id: 'yr5', n: 'Mystery radish bag', d: 'whatever didn’t sell. could be radishes. it’s radishes', p: 20 },
          { id: 'yr6', n: 'Radish sticker pack', d: 'Six stickers. One of them is a rabbit holding a radish.', p: 5 },
        ] },
      ] },
    { id: 'grandma-qin', name: 'Grandma Qin’s Kitchen', place: 'grandma-qin', cuisine: 'Home-style Chinese', price: '¥¥', art: 'food_noodles', rating: 4.8, reviews: '2.1k', prep: 18,
      tags: ['home cooking', 'chinese', 'noodles', 'pork', 'vegetables', 'fish', 'family'], menu: [
        { cat: 'Popular', items: [
          { id: 'gq1', n: 'Braised pork belly', d: 'Red-braised, melting, with boiled egg.', p: 48, tag: '#1 most liked' },
          { id: 'gq2', n: 'Stir-fried seasonal greens', d: 'Garlic, a little oyster sauce. Most ordered by people who were told to eat their vegetables.', p: 18 },
          { id: 'gq3', n: 'Beef noodle soup', d: 'Hand-pulled noodles, slow-braised shank, clear broth.', p: 32, art: 'food_noodles', opts: [SPICE()] },
        ] },
        { cat: 'Mains', items: [
          { id: 'gq4', n: 'Tomato & egg stir-fry', d: 'Exactly like home.', p: 22 },
          { id: 'gq5', n: 'Steamed sea bass', d: 'Ginger, scallion, sizzling oil.', p: 58 },
          { id: 'gq6', n: 'Mapo tofu', d: 'Numbing, spicy, minced beef.', p: 26, opts: [SPICE()] },
          RICE,
        ] },
        { cat: 'Sweets', items: [{ id: 'gq7', n: 'Red bean soup', d: 'Grandma Qin’s recipe. Warm.', p: 12 }] },
      ] },
    { id: 'peony-bakery', name: 'Peony Bakery', place: 'peony-bakery', cuisine: 'Bakery · Cakes', price: '¥¥', art: 'food_lotus_cake', rating: 4.8, reviews: '1.9k', prep: 20,
      tags: ['cake', 'birthday', 'bakery', 'dessert', 'pastries', 'egg tart', 'mooncake'], note: 'Celebration cakes need 24 hours’ notice. Message on cake: add it in special instructions.', menu: [
        { cat: 'Celebration cakes', items: [
          { id: 'pb1', n: 'Peony cream cake (6")', d: 'Vanilla sponge, fresh cream, piped peonies. Serves 6–8.', p: 288, tag: 'Pre-order', opts: [{ n: 'Flavour', one: true, req: true, ch: [['Vanilla', 0], ['Chocolate', 0], ['Matcha', 10], ['Mango', 10]] }, { n: 'Extras', ch: [['Number candles', 6], ['Birthday crown', 12], ['Gold leaf', 30]] }] },
          { id: 'pb2', n: 'Lotus mousse cake (8")', d: 'Lotus seed mousse, osmanthus jelly. Serves 10–12.', p: 368, tag: 'Pre-order' },
        ] },
        { cat: 'Pastries', items: [
          { id: 'pb3', n: 'Egg tarts ×4', d: 'Flaky, wobbly, warm.', p: 24 },
          { id: 'pb4', n: 'Lotus flower pastries ×4', d: 'The bakery’s namesake petals.', p: 28, art: 'food_lotus_cake' },
          { id: 'pb5', n: 'Lotus seed mooncake', d: 'Single, salted yolk.', p: 18 },
        ] },
      ] },
    { id: 'pet-kingdom', name: 'Pet Kingdom', place: 'pet-kingdom', cuisine: 'Pet supplies', price: '¥¥', hero: 'pets', rating: 4.5, reviews: '870', prep: 25, shop: true,
      tags: ['pet', 'dog', 'dog food', 'treats', 'toys', 'fairy', 'pets'], note: 'Platinum Paw members: 10% off giant-breed food this week.', menu: [
        { cat: 'Popular', items: [
          { id: 'pk1', n: 'GiantPaws Large Breed Adult, 20 kg', d: 'Complete food for very large dogs. Chicken & rice.', p: 689, tag: 'Bought before' },
          { id: 'pk2', n: 'Salmon training treats', d: 'Soft, small, extremely persuasive.', p: 68 },
          { id: 'pk3', n: 'Squeaky koi toy', d: 'Gold, plush, indestructible (claimed).', p: 39 },
        ] },
        { cat: 'Care', items: [
          { id: 'pk4', n: 'Chew antler (large)', d: 'Long-lasting, naturally shed.', p: 58 },
          { id: 'pk5', n: '“No tears” dog shampoo', d: 'Oatmeal & aloe.', p: 46 },
          { id: 'pk6', n: 'Orthopedic dog bed XXL', d: 'Memory foam. For dogs who are larger than some people.', p: 8800 },
        ] },
      ] },
    { id: 'laoma-hotpot', name: 'Laoma Hotpot', place: 'laoma-hotpot', cuisine: 'Hotpot · Sichuan', price: '¥¥', art: 'food_hotpot', rating: 4.6, reviews: '2.9k', prep: 15, promo: '20% off hotpot · until Sunday', hotpot: true,
      tags: ['hotpot', 'sichuan', 'spicy', 'gusu', 'mala', 'beef', 'lamb', 'noodles'], note: 'Delivery kits come with a portable stove. Please don’t set off the Jingshi smoke alarm.', menu: [
        { cat: 'Popular', items: [
          { id: 'lm1', n: 'Signature hotpot set for 2', d: 'Choice of broth, sliced beef, lamb rolls, tripe, vegetables, tofu skin and noodles. Stove included.', p: 168, art: 'food_hotpot', tag: '#1 most liked', opts: [{ n: 'Broth', one: true, req: true, ch: [['Mala (spicy)', 0], ['Tomato', 0], ['Wild mushroom', 0], ['Yin-yang (two broths)', 10]] }, SPICE('Laoma special')] },
          { id: 'lm2', n: 'Hand-sliced beef', d: 'Marinated, tender.', p: 48 },
          { id: 'lm3', n: 'Hand-pulled noodles', d: 'Toss in at the end.', p: 8, art: 'food_noodles' },
        ] },
        { cat: 'Add to the pot', items: [
          { id: 'lm4', n: 'Lamb rolls', d: 'Paper-thin.', p: 42 },
          { id: 'lm5', n: 'Beef tripe', d: 'Ten seconds. Count them.', p: 38 },
          { id: 'lm6', n: 'Lotus root slices', d: 'Crunchy, soaks up the broth.', p: 12 },
          { id: 'lm7', n: 'Tofu skin', d: 'Silky ribbons.', p: 10 },
        ] },
        { cat: 'Sweets & drinks', items: [
          { id: 'lm8', n: 'Brown sugar rice cakes', d: 'Crispy, sticky, sweet.', p: 18 },
          { id: 'lm9', n: 'Iced plum juice', d: 'Cuts through the spice.', p: 12 },
        ] },
      ] },
    { id: 'auntie-lu', name: 'Auntie Lu’s Soup Kitchen', place: 'auntie-lu', cuisine: 'Soups · Gusu', price: '¥', art: 'food_soup', rating: 4.9, reviews: '1.5k', prep: 20,
      tags: ['soup', 'lotus root', 'pork rib', 'gusu', 'sick', 'flu', 'comfort'], note: 'Feeling unwell? Add a get-well note — we’ll write it by hand.', menu: [
        { cat: 'Popular', items: [
          { id: 'al1', n: 'Lotus root & pork rib soup', d: 'Slow-cooked for two hours. The large pot serves three to four.', p: 88, art: 'food_soup', tag: '#1 most liked', opts: [{ n: 'Size', one: true, req: true, ch: [['Regular', 0], ['Large (serves 3–4)', 60]] }, { n: 'Get-well note', ch: [['Handwritten card (free)', 0]] }] },
          { id: 'al2', n: 'Chicken & mushroom soup', d: 'Old hen, shiitake, ginger.', p: 68 },
        ] },
        { cat: 'Soups', items: [
          { id: 'al3', n: 'Winter melon soup', d: 'Clear, light, cooling.', p: 48 },
          { id: 'al4', n: 'Pear & snow fungus soup', d: 'Good for a sore throat.', p: 32 },
        ] },
        { cat: 'Sides', items: [{ id: 'al5', n: 'Steamed buns ×2', d: 'Plain, soft.', p: 12, art: 'food_baozi' }, RICE] },
      ] },
    { id: 'gusu-teahouse', name: 'Gusu Tea House', place: 'gusu-teahouse', cuisine: 'Tea · Pastries', price: '¥¥', art: 'food_lotus_cake', rating: 4.7, reviews: '1.3k', prep: 12,
      tags: ['tea', 'white peony', 'longjing', 'pastries', 'gusu', 'quiet'], note: 'Please keep voices low when collecting your order.', menu: [
        { cat: 'Tea', items: [
          { id: 'gt1', n: 'White peony (pot)', d: 'Brewed at 85 °C. Floral, honeyed, patient.', p: 68, tag: 'House favourite' },
          { id: 'gt2', n: 'Longjing (pot)', d: 'West Lake dragon well, spring picking.', p: 58 },
          { id: 'gt3', n: 'Osmanthus oolong', d: 'Roasted, sweet finish.', p: 48 },
        ] },
        { cat: 'Pastries', items: [
          { id: 'gt4', n: 'Lotus pastries ×4', d: 'Flaky petals.', p: 32, art: 'food_lotus_cake' },
          { id: 'gt5', n: 'Osmanthus cake', d: 'Chilled, translucent.', p: 22 },
          { id: 'gt6', n: 'Walnut cookies', d: 'Crumbly, not too sweet.', p: 26 },
        ] },
      ] },
    { id: 'night-owl', name: 'Night Owl Congee', branch: 'Old Town, Yunmeng', place: 'night-owl', cuisine: 'Congee · Late night', price: '¥', art: 'food_congee', rating: 4.8, reviews: '5.1k', prep: 9,
      tags: ['congee', 'late night', 'breakfast', 'baozi', 'chinese', 'night owl', 'porridge', 'yunmeng'], menu: OWL },
    { id: 'tea-leaf', name: 'Tea Leaf Milk Tea', place: 'tea-leaf', cuisine: 'Milk tea · Drinks', price: '¥', art: 'food_milktea', rating: 4.5, reviews: '760', prep: 8,
      tags: ['milk tea', 'bubble tea', 'boba', 'drinks', 'yunmeng', 'brown sugar'], note: 'Office orders of 20+ drinks: we bring extra straws and a cooler.', menu: [
        { cat: 'Popular', items: [
          { id: 'tl1', n: 'Brown sugar milk tea', d: 'Fresh milk, brown sugar pearls, tiger stripes.', p: 22, art: 'food_milktea', tag: '#1 most liked', opts: [SUGAR, ICE, TOP] },
          { id: 'tl2', n: 'Jasmine green milk tea', d: 'Fragrant and light.', p: 18, opts: [SUGAR, ICE, TOP] },
        ] },
        { cat: 'Milk tea', items: [
          { id: 'tl3', n: 'Taro milk tea', d: 'Real taro, purple and proud.', p: 22, opts: [SUGAR, ICE, TOP] },
          { id: 'tl4', n: 'Cheese foam black tea', d: 'Salted cream cap.', p: 24, opts: [SUGAR, ICE] },
        ] },
        { cat: 'Fruit tea', items: [{ id: 'tl5', n: 'Lychee oolong', d: 'Iced, fresh lychee.', p: 20, opts: [SUGAR, ICE] }] },
      ] },
  ];

  // Delivery addresses (cities must match the restaurant's city).
  const ADDRS = [
    { id: 'here', label: 'Current location', line: '27 Jinxing Road, Jinxing District', city: 'Lanling', place: 'player-home', icon: 'location.fill' },
    { id: 'gp', label: 'Golden Peony Hotel', line: 'Room 1808 · 16 Riverside Drive, Riverside', city: 'Lanling', place: 'golden-peony', icon: 'bed.double.fill' },
    { id: 'koires', label: 'A-Ling', line: 'Koi Tower Residences · 90 Jinlin Avenue', city: 'Lanling', place: 'koi-residences', icon: 'heart.fill', contact: 'jl' },
    { id: 'lp', label: 'Home', line: 'Lotus Pier Residence · 3 Lotus Pier Road', city: 'Yunmeng', place: 'lp-residence', icon: 'house.fill' },
    { id: 'ymj', label: 'YMJ Main Office', line: 'Lotus Pier · 1 Lotus Pier Road', city: 'Yunmeng', place: 'lotus-pier', icon: 'briefcase.fill' },
    { id: 'wh', label: 'YMJ Warehouse B', line: '6 Warehouse Road, Logistics Park', city: 'Yunmeng', place: 'ymj-warehouse', icon: 'cube.box' },
    { id: 'jingshi', label: 'Wei Wuxian — The Jingshi', line: 'The Jingshi, Cloud Recesses', city: 'Gusu', place: 'jingshi', icon: 'leaf.fill', contact: 'wwx' },
  ];

  const RIDERS = [['Chen Hao', 4.96, 'Electric scooter'], ['Liu Yang', 4.93, 'Electric scooter'], ['Zhou Min', 4.98, 'E-bike'], ['Xu Lei', 4.9, 'Electric scooter'], ['He Jing', 4.95, 'E-bike'], ['Ma Tao', 4.92, 'Electric scooter']];

  // Seeded order history (matches the "eats" SMS thread and the bank SMS).
  JC.store.seed('orders', [
    { id: 'o_tea_wh', rest: 'tea-leaf', to: 'wh', t: '-2 13:10', end: '-2 13:52', status: 'delivered', card: 'ymj',
      items: [{ id: 'tl1', n: 'Brown sugar milk tea', q: 38, p: 22, opts: 'Regular sugar · Less ice' }], sub: 836, fee: 12, service: 10, tip: 20, discount: 0, total: 878,
      note: 'From the boss. Don’t make it a thing.', rider: { name: 'Huang Wei', rating: 4.97, vehicle: 'E-bike + cooler' }, rated: 5 },
    { id: 'o_congee_ymj', rest: 'night-owl', to: 'ymj', t: '2026-03-19 01:12', end: '2026-03-19 01:38', status: 'delivered', card: 'ymj',
      items: [{ id: 'cg3', n: 'Late-night set for one', q: 1, p: 42 }, { id: 'cg1', n: 'Century egg & pork congee', q: 1, p: 26, opts: 'Regular' }], sub: 68, fee: 4, service: 3, tip: 0, discount: 0, total: 75,
      note: 'Leave it with the security desk.', rider: { name: 'Deng Fei', rating: 4.91, vehicle: 'Electric scooter' }, rated: 0 },
    { id: 'o_qin_koi', rest: 'grandma-qin', to: 'koires', t: '2025-12-15 21:05', end: '2025-12-15 21:44', status: 'delivered', card: 'ycb',
      items: [{ id: 'gq1', n: 'Braised pork belly', q: 1, p: 48 }, { id: 'gq2', n: 'Stir-fried seasonal greens', q: 2, p: 18 }, { id: 'gq3', n: 'Beef noodle soup', q: 1, p: 32, opts: 'Mild' }, { id: 'rice', n: 'Steamed rice', q: 2, p: 3 }], sub: 122, fee: 5, service: 4, tip: 5, discount: 0, total: 136,
      note: 'Tell him to eat the vegetables.', rider: { name: 'Su Lan', rating: 4.95, vehicle: 'E-bike' }, rated: 5 },
    { id: 'o_soup_jingshi', rest: 'auntie-lu', to: 'jingshi', t: '2024-12-09 11:50', end: '2024-12-09 12:41', status: 'delivered', card: 'ycb', anon: true,
      items: [{ id: 'al1', n: 'Lotus root & pork rib soup', q: 1, p: 148, opts: 'Large (serves 3–4)' }], sub: 148, fee: 8, service: 4, tip: 8, discount: 0, total: 168,
      note: 'Don’t say who it’s from.', rider: { name: 'Lan Qiu', rating: 4.99, vehicle: 'Electric scooter' }, rated: 5 },
    { id: 'o_fairy_koi', rest: 'pet-kingdom', to: 'koires', t: '2024-10-18 10:20', end: '2024-10-18 11:05', status: 'delivered', card: 'ycb',
      items: [{ id: 'pk2', n: 'Salmon training treats', q: 2, p: 68 }, { id: 'pk3', n: 'Squeaky koi toy', q: 1, p: 39 }], sub: 175, fee: 6, service: 5, tip: 0, discount: 0, total: 186,
      note: 'For Fairy. Do not give to A-Ling.', rider: { name: 'Wang Jun', rating: 4.9, vehicle: 'E-bike' }, rated: 4 },
  ]);

  const CATS = [
    { id: 'congee', n: 'Congee', art: 'food_congee', q: ['congee'] },
    { id: 'hotpot', n: 'Hotpot', art: 'food_hotpot', q: ['hotpot'] },
    { id: 'dumplings', n: 'Dumplings', art: 'food_dumplings', q: ['dumplings', 'buns'] },
    { id: 'noodles', n: 'Noodles', art: 'food_noodles', q: ['noodles'] },
    { id: 'soup', n: 'Soup', art: 'food_soup', q: ['soup'] },
    { id: 'skewers', n: 'BBQ', art: 'food_skewers', q: ['skewers', 'bbq'] },
    { id: 'milktea', n: 'Milk tea', art: 'food_milktea', q: ['milk tea', 'tea', 'coffee'] },
    { id: 'sweets', n: 'Sweets', art: 'food_lotus_cake', q: ['dessert', 'cake', 'pastries', 'bakery'] },
    { id: 'radish', n: 'Radish', art: 'food_radish_cake', q: ['radish'] },
    { id: 'pets', n: 'Pets', icon: 'pawprint.fill', q: ['pet'] },
  ];

  JC.lotusEatsData = { RESTS, ADDRS, RIDERS, CATS };
})();
