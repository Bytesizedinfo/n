// Example products sold in Singapore, with rough prices.
// Prices are approximate SGD list prices gathered Nov 2026 and spot-checked against Watsons SG and
// other SG retailers. Promotions change them often, so treat them as a guide only.
// flags: ff = fragrance-free (true / false / null = not confirmed, check the label)
//        eo = contains essential oils, alcohol = contains drying alcohol
//        cf = cruelty-free, vegan (true / null = not confirmed)
// types: skin types it suits. sensitive: gentle enough for sensitive skin.
// rx: 'pharmacist' = sold behind the pharmacy counter.

export const PRICES_CHECKED = 'Nov 2026';

const W = 'Watsons', G = 'Guardian', S = 'Sephora SG', P = 'Pharmacy', O = 'Online (Shopee / brand store)';
const ALL = ['oily', 'combination', 'normal', 'dry'];
const OILY = ['oily', 'combination'];
const DRY = ['normal', 'dry'];

export const PRODUCTS = [
  // ---------- First cleanse (oil / balm / micellar) ----------
  { id: 'bioderma-h2o', brand: 'Bioderma', name: 'Sensibio H2O Micellar Water', cat: 'oil-cleanser', actives: [], flags: { ff: true }, types: ALL, sensitive: true, texture: 'water', tier: 'mid', price: 30, size: '500ml', where: [W, G, P] },
  { id: 'garnier-micellar', brand: 'Garnier', name: 'Micellar Cleansing Water (All-in-1)', cat: 'oil-cleanser', actives: [], flags: { ff: true, cf: true }, types: ALL, sensitive: true, texture: 'water', tier: 'budget', price: 12, size: '400ml', where: [W, G] },
  { id: 'kose-softymo', brand: 'Kosé', name: 'Softymo Speedy Cleansing Oil', cat: 'oil-cleanser', actives: [], flags: { ff: null }, types: ALL, sensitive: false, texture: 'oil', tier: 'budget', price: 13, size: '230ml', where: [W, G] },
  { id: 'dhc-dco', brand: 'DHC', name: 'Deep Cleansing Oil', cat: 'oil-cleanser', actives: ['antioxidants'], flags: { ff: true, eo: true }, types: ['normal', 'dry', 'combination'], sensitive: false, texture: 'oil', tier: 'mid', price: 45, size: '200ml', where: [W, O] },
  { id: 'banila-zero', brand: 'Banila Co', name: 'Clean It Zero Cleansing Balm Original', cat: 'oil-cleanser', actives: [], flags: { ff: false }, types: ALL, sensitive: false, texture: 'balm', tier: 'mid', price: 30, size: '100ml', where: [W, O] },

  // ---------- Cleansers ----------
  { id: 'cerave-foaming', brand: 'CeraVe', name: 'Foaming Cleanser', cat: 'cleanser', actives: ['ceramides', 'niacinamide', 'ha'], flags: { ff: true }, types: OILY.concat('normal'), sensitive: true, texture: 'gel', tier: 'budget', price: 20, size: '236ml', where: [W, G] },
  { id: 'cerave-hydrating', brand: 'CeraVe', name: 'Hydrating Cleanser', cat: 'cleanser', actives: ['ceramides', 'ha', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'lotion', tier: 'budget', price: 20, size: '236ml', where: [W, G] },
  { id: 'cerave-sa', brand: 'CeraVe', name: 'SA Smoothing Cleanser', cat: 'cleanser', actives: ['salicylic', 'ceramides', 'niacinamide'], flags: { ff: true }, types: OILY.concat('normal'), sensitive: false, texture: 'gel', tier: 'budget', price: 22, size: '236ml', where: [W, G] },
  { id: 'cetaphil-gentle', brand: 'Cetaphil', name: 'Gentle Skin Cleanser', cat: 'cleanser', actives: ['niacinamide', 'panthenol', 'glycerin'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'lotion', tier: 'budget', price: 17, size: '250ml', where: [W, G, P] },
  { id: 'lrp-toleriane-cleanser', brand: 'La Roche-Posay', name: 'Toleriane Hydrating Gentle Cleanser', cat: 'cleanser', actives: ['ceramides', 'niacinamide', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'cream', tier: 'mid', price: 34, size: '400ml', where: [W, G, P] },
  { id: 'lrp-effaclar-gel', brand: 'La Roche-Posay', name: 'Effaclar Purifying Foaming Gel', cat: 'cleanser', actives: ['zinc-pca'], flags: { ff: false }, types: OILY, sensitive: false, texture: 'gel', tier: 'mid', price: 30, size: '200ml', where: [W, G, P] },
  { id: 'hadalabo-foam', brand: 'Hada Labo', name: 'Gokujyun Foaming Cleanser', cat: 'cleanser', actives: ['ha'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'foam', tier: 'budget', price: 14, size: '160ml', where: [W, G] },
  { id: 'senka-whip', brand: 'Senka', name: 'Perfect Whip Facial Foam', cat: 'cleanser', actives: ['ha', 'glycerin'], flags: { ff: false }, types: OILY.concat('normal'), sensitive: false, texture: 'foam', tier: 'budget', price: 9, size: '120g', where: [W, G] },
  { id: 'cosrx-goodmorning', brand: 'COSRX', name: 'Low pH Good Morning Gel Cleanser', cat: 'cleanser', actives: ['betaine-sal', 'teatree'], flags: { ff: true, eo: true, cf: true }, types: OILY.concat('normal'), sensitive: false, texture: 'gel', tier: 'budget', price: 18, size: '150ml', where: [W, O] },
  { id: 'avene-tolerance-cleanser', brand: 'Avène', name: 'Tolerance Extremely Gentle Cleanser', cat: 'cleanser', actives: ['glycerin'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'lotion', tier: 'mid', price: 38, size: '200ml', where: [W, P] },
  { id: 'nizoral-wash', brand: 'Nizoral', name: 'Anti-Dandruff Shampoo 2% (as a 5-min face wash)', cat: 'cleanser', actives: ['zpt'], flags: { ff: false }, types: ALL, sensitive: false, texture: 'gel', tier: 'budget', price: 18, size: '100ml', where: [W, G, P], note: 'Off-label use for fungal acne or flaky redness: lather, leave 3–5 min, rinse.' },

  // ---------- Toners / essences ----------
  { id: 'hadalabo-lotion', brand: 'Hada Labo', name: 'Gokujyun Hydrating Lotion', cat: 'toner', actives: ['ha', 'glycerin'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'water', tier: 'budget', price: 16, size: '170ml', where: [W, G] },
  { id: 'klairs-supple', brand: 'Dear, Klairs', name: 'Supple Preparation Unscented Toner', cat: 'toner', actives: ['ha', 'centella', 'allantoin'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'water', tier: 'mid', price: 30, size: '180ml', where: [S, O] },
  { id: 'cosrx-snail', brand: 'COSRX', name: 'Advanced Snail 96 Mucin Power Essence', cat: 'toner', actives: ['allantoin', 'panthenol'], flags: { ff: true, cf: true }, types: ALL, sensitive: true, texture: 'essence', tier: 'budget', price: 28, size: '100ml', where: [W, O] },

  // ---------- Leave-on exfoliants ----------
  { id: 'pc-bha', brand: "Paula's Choice", name: 'Skin Perfecting 2% BHA Liquid Exfoliant', cat: 'exfoliant', actives: ['salicylic'], strength: { salicylic: 2 }, flags: { ff: true, cf: true }, types: ALL, sensitive: false, texture: 'liquid', tier: 'mid', price: 52, size: '118ml (30ml ~S$21)', where: [S, O] },
  { id: 'to-sa2', brand: 'The Ordinary', name: 'Salicylic Acid 2% Solution', cat: 'exfoliant', actives: ['salicylic'], strength: { salicylic: 2 }, flags: { ff: true, cf: true, vegan: true }, types: OILY.concat('normal'), sensitive: false, texture: 'liquid', tier: 'budget', price: 10, size: '30ml', where: [W, S] },
  { id: 'cosrx-bha', brand: 'COSRX', name: 'BHA Blackhead Power Liquid', cat: 'exfoliant', actives: ['betaine-sal', 'niacinamide'], flags: { ff: true, cf: true }, types: OILY.concat('normal'), sensitive: true, texture: 'liquid', tier: 'budget', price: 28, size: '100ml', where: [W, O] },
  { id: 'cosrx-aha', brand: 'COSRX', name: 'AHA 7 Whitehead Power Liquid', cat: 'exfoliant', actives: ['glycolic'], strength: { glycolic: 7 }, flags: { ff: true, cf: true }, types: ALL, sensitive: false, texture: 'liquid', tier: 'budget', price: 26, size: '100ml', where: [W, O] },
  { id: 'to-glycolic', brand: 'The Ordinary', name: 'Glycolic Acid 7% Exfoliating Toner', cat: 'exfoliant', actives: ['glycolic'], strength: { glycolic: 7 }, flags: { ff: true, cf: true, vegan: true }, types: ['normal', 'combination', 'oily'], sensitive: false, texture: 'water', tier: 'budget', price: 17, size: '240ml', where: [W, S] },
  { id: 'to-lactic', brand: 'The Ordinary', name: 'Lactic Acid 10% + HA', cat: 'exfoliant', actives: ['lactic', 'ha'], strength: { lactic: 10 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: false, texture: 'serum', tier: 'budget', price: 13, size: '30ml', where: [W, S] },
  { id: 'to-mandelic', brand: 'The Ordinary', name: 'Mandelic Acid 10% + HA', cat: 'exfoliant', actives: ['mandelic', 'ha'], strength: { mandelic: 10 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 13, size: '30ml', where: [W, S] },
  { id: 'inkey-pha', brand: 'The INKEY List', name: 'PHA Toner', cat: 'exfoliant', actives: ['pha', 'niacinamide'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'water', tier: 'budget', price: 20, size: '100ml', where: [S] },
  { id: 'somebymi-toner', brand: 'Some By Mi', name: 'AHA-BHA-PHA 30 Days Miracle Toner', cat: 'exfoliant', actives: ['glycolic', 'betaine-sal', 'pha', 'teatree', 'niacinamide'], flags: { ff: null, eo: true }, types: OILY, sensitive: false, texture: 'water', tier: 'budget', price: 22, size: '150ml', where: [W, O] },

  // ---------- Serums & treatments ----------
  { id: 'to-niacinamide', brand: 'The Ordinary', name: 'Niacinamide 10% + Zinc 1%', cat: 'serum', actives: ['niacinamide', 'zinc-pca'], strength: { niacinamide: 10 }, flags: { ff: true, cf: true, vegan: true }, types: OILY.concat('normal'), sensitive: false, texture: 'serum', tier: 'budget', price: 12, size: '30ml (60ml ~S$19)', where: [W, S] },
  { id: 'cosrx-niacinamide', brand: 'COSRX', name: 'The Niacinamide 15 Serum', cat: 'serum', actives: ['niacinamide', 'zinc-pca'], strength: { niacinamide: 15 }, flags: { ff: true, cf: true }, types: ALL, sensitive: false, texture: 'serum', tier: 'budget', price: 30, size: '20ml', where: [W, O] },
  { id: 'to-azelaic', brand: 'The Ordinary', name: 'Azelaic Acid Suspension 10%', cat: 'treatment', actives: ['azelaic'], strength: { azelaic: 10 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'budget', price: 17, size: '30ml', where: [W, S] },
  { id: 'pc-azelaic', brand: "Paula's Choice", name: '10% Azelaic Acid Booster', cat: 'treatment', actives: ['azelaic', 'licorice'], strength: { azelaic: 10 }, flags: { ff: true, cf: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'mid', price: 60, size: '30ml', where: [S, O] },
  { id: 'to-arbutin', brand: 'The Ordinary', name: 'Alpha Arbutin 2% + HA', cat: 'serum', actives: ['arbutin', 'ha'], strength: { arbutin: 2 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 15, size: '30ml', where: [W, S] },
  { id: 'inkey-txa', brand: 'The INKEY List', name: 'Tranexamic Acid Night Treatment', cat: 'treatment', actives: ['tranexamic', 'niacinamide'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'budget', price: 25, size: '30ml', where: [S] },
  { id: 'lrp-melab3', brand: 'La Roche-Posay', name: 'Mela B3 Serum', cat: 'serum', actives: ['melasyl', 'niacinamide'], flags: { ff: null }, types: ALL, sensitive: true, texture: 'serum', tier: 'splurge', price: 76, size: '30ml', where: [W, G, P] },
  { id: 'to-vitc-gluc', brand: 'The Ordinary', name: 'Ascorbyl Glucoside Solution 12%', cat: 'serum', actives: ['vitc-deriv'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 18, size: '30ml', where: [W, S] },
  { id: 'melano-cc', brand: 'Melano CC (Rohto)', name: 'Vitamin C Brightening Essence', cat: 'serum', actives: ['laa', 'antioxidants'], flags: { ff: false, alcohol: true }, types: OILY.concat('normal'), sensitive: false, texture: 'serum', tier: 'budget', price: 16, size: '20ml', where: [W, G] },
  { id: 'klairs-vitdrop', brand: 'Dear, Klairs', name: 'Freshly Juiced Vitamin Drop (5% vit C)', cat: 'serum', actives: ['laa', 'centella'], strength: { laa: 5 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'mid', price: 30, size: '35ml', where: [S, O] },
  { id: 'pc-c15', brand: "Paula's Choice", name: 'C15 Super Booster', cat: 'serum', actives: ['laa', 'antioxidants', 'peptides'], strength: { laa: 15 }, flags: { ff: true, cf: true }, types: ALL, sensitive: false, texture: 'serum', tier: 'splurge', price: 80, size: '20ml', where: [S, O] },
  { id: 'skinceuticals-cef', brand: 'SkinCeuticals', name: 'C E Ferulic', cat: 'serum', actives: ['laa', 'antioxidants'], strength: { laa: 15 }, flags: { ff: true }, types: ALL, sensitive: false, texture: 'serum', tier: 'splurge', price: 239, size: '30ml', where: [S, P] },
  { id: 'to-retinol02', brand: 'The Ordinary', name: 'Retinol 0.2% in Squalane', cat: 'treatment', actives: ['retinol', 'squalane'], strength: { retinol: 0.2 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: false, texture: 'oil', tier: 'budget', price: 12, size: '30ml', where: [W, S] },
  { id: 'to-retinol05', brand: 'The Ordinary', name: 'Retinol 0.5% in Squalane', cat: 'treatment', actives: ['retinol', 'squalane'], strength: { retinol: 0.5 }, flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: false, texture: 'oil', tier: 'budget', price: 13, size: '30ml', where: [W, S] },
  { id: 'to-granactive', brand: 'The Ordinary', name: 'Granactive Retinoid 2% Emulsion', cat: 'treatment', actives: ['hpr'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'lotion', tier: 'budget', price: 17, size: '30ml', where: [W, S] },
  { id: 'cerave-retinol', brand: 'CeraVe', name: 'Resurfacing Retinol Serum', cat: 'treatment', actives: ['retinol', 'niacinamide', 'ceramides', 'licorice'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'mid', price: 35, size: '30ml', where: [W, G] },
  { id: 'lrp-retinolb3', brand: 'La Roche-Posay', name: 'Retinol B3 Serum', cat: 'treatment', actives: ['retinol', 'niacinamide', 'panthenol'], strength: { retinol: 0.3 }, flags: { ff: null }, types: ALL, sensitive: false, texture: 'serum', tier: 'splurge', price: 65, size: '30ml', where: [W, G, P] },
  { id: 'avene-retrinal', brand: 'Avène', name: 'RetrinAL 0.1 Intensive Cream', cat: 'treatment', actives: ['retinal'], strength: { retinal: 0.1 }, flags: { ff: null }, types: ['normal', 'dry', 'combination'], sensitive: false, texture: 'cream', tier: 'splurge', price: 75, size: '30ml', where: [P, W] },
  { id: 'differin', brand: 'Differin', name: 'Adapalene Gel 0.1%', cat: 'treatment', actives: ['adapalene'], strength: { adapalene: 0.1 }, flags: { ff: true }, types: ALL, sensitive: false, texture: 'gel', tier: 'budget', price: 30, size: '30g', where: [P], rx: 'pharmacist' },
  { id: 'inkey-bakuchiol', brand: 'The INKEY List', name: 'Bakuchiol Retinol Alternative Moisturizer', cat: 'moisturizer', actives: ['bakuchiol', 'squalane'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'budget', price: 22, size: '30ml', where: [S] },
  { id: 'to-buffet', brand: 'The Ordinary', name: 'Multi-Peptide + HA Serum', cat: 'serum', actives: ['peptides', 'ha'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 27, size: '30ml', where: [W, S] },
  { id: 'to-copper', brand: 'The Ordinary', name: 'Multi-Peptide + Copper Peptides 1% Serum', cat: 'serum', actives: ['copper', 'peptides', 'ha'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'mid', price: 40, size: '30ml', where: [S] },
  { id: 'to-ha', brand: 'The Ordinary', name: 'Hyaluronic Acid 2% + B5', cat: 'serum', actives: ['ha', 'panthenol'], flags: { ff: true, cf: true, vegan: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 14, size: '30ml', where: [W, S] },
  { id: 'skin1004-ampoule', brand: 'SKIN1004', name: 'Madagascar Centella Ampoule', cat: 'serum', actives: ['centella'], flags: { ff: true, cf: true }, types: ALL, sensitive: true, texture: 'serum', tier: 'budget', price: 25, size: '55ml', where: [W, O] },
  { id: 'benzac-ac', brand: 'Benzac', name: 'AC 2.5% Gel (benzoyl peroxide)', cat: 'treatment', actives: ['bpo'], strength: { bpo: 2.5 }, flags: { ff: true }, types: ALL, sensitive: false, texture: 'gel', tier: 'budget', price: 18, size: '60g', where: [P, W, G], rx: 'pharmacist' },
  { id: 'lrp-duo', brand: 'La Roche-Posay', name: 'Effaclar Duo+M', cat: 'treatment', actives: ['niacinamide', 'lha', 'salicylic', 'zinc-pca'], flags: { ff: false }, types: OILY, sensitive: false, texture: 'gel', tier: 'mid', price: 38, size: '40ml', where: [W, G, P] },

  // ---------- Spot care ----------
  { id: 'cosrx-patch', brand: 'COSRX', name: 'Acne Pimple Master Patch', cat: 'spot', actives: [], flags: { ff: true, cf: true }, types: ALL, sensitive: true, texture: 'patch', tier: 'budget', price: 7, size: '24 patches', where: [W, G] },
  { id: 'mb-drying', brand: 'Mario Badescu', name: 'Drying Lotion', cat: 'spot', actives: ['sulfur', 'salicylic', 'alcohol'], flags: { ff: true, eo: true, alcohol: true }, types: OILY.concat('normal'), sensitive: false, texture: 'liquid', tier: 'mid', price: 30, size: '29ml', where: [S] },

  // ---------- Moisturisers ----------
  { id: 'cerave-pm', brand: 'CeraVe', name: 'PM Facial Moisturising Lotion', cat: 'moisturizer', actives: ['niacinamide', 'ceramides', 'ha'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'lotion', tier: 'budget', price: 24, size: '52ml', where: [W, G] },
  { id: 'cerave-cream', brand: 'CeraVe', name: 'Moisturising Cream', cat: 'moisturizer', actives: ['ceramides', 'ha', 'glycerin'], flags: { ff: true }, types: DRY, sensitive: true, texture: 'rich', tier: 'budget', price: 28, size: '340g', where: [W, G] },
  { id: 'hadalabo-gel', brand: 'Hada Labo', name: 'Gokujyun Perfect Gel (all-in-one)', cat: 'moisturizer', actives: ['ha', 'glycerin', 'ceramides'], flags: { ff: true }, types: OILY.concat('normal'), sensitive: true, texture: 'gel', tier: 'budget', price: 22, size: '80g', where: [W, G] },
  { id: 'neutrogena-hydroboost', brand: 'Neutrogena', name: 'Hydro Boost Water Gel', cat: 'moisturizer', actives: ['ha', 'glycerin'], flags: { ff: false }, types: OILY.concat('normal'), sensitive: false, texture: 'gel', tier: 'budget', price: 25, size: '50g', where: [W, G] },
  { id: 'cetaphil-oilfree', brand: 'Cetaphil', name: 'Daily Oil-Free Hydrating Lotion', cat: 'moisturizer', actives: ['ha', 'glycerin'], flags: { ff: null }, types: OILY.concat('normal'), sensitive: true, texture: 'lotion', tier: 'budget', price: 22, size: '88ml', where: [W, G] },
  { id: 'physiogel-cream', brand: 'Physiogel', name: 'Daily Moisture Therapy Cream', cat: 'moisturizer', actives: ['ceramides', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'cream', tier: 'budget', price: 25, size: '75ml', where: [W, G, P] },
  { id: 'illiyoon-ato', brand: 'Illiyoon', name: 'Ceramide Ato Concentrate Cream', cat: 'moisturizer', actives: ['ceramides', 'glycerin'], flags: { ff: true }, types: DRY, sensitive: true, texture: 'rich', tier: 'budget', price: 22, size: '200ml', where: [O] },
  { id: 'lrp-tdr', brand: 'La Roche-Posay', name: 'Toleriane Double Repair Moisturiser', cat: 'moisturizer', actives: ['ceramides', 'niacinamide', 'glycerin'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'lotion', tier: 'mid', price: 38, size: '75ml', where: [W, G, P] },
  { id: 'lrp-effaclar-mat', brand: 'La Roche-Posay', name: 'Effaclar Mat', cat: 'moisturizer', actives: ['glycerin'], flags: { ff: false }, types: OILY, sensitive: false, texture: 'gel', tier: 'mid', price: 35, size: '40ml', where: [W, G, P] },
  { id: 'curel-cream', brand: 'Curél', name: 'Intensive Moisture Care Face Cream', cat: 'moisturizer', actives: ['ceramides', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'cream', tier: 'mid', price: 40, size: '40g', where: [W, G] },
  { id: 'clinique-ddmg', brand: 'Clinique', name: 'Dramatically Different Moisturizing Gel', cat: 'moisturizer', actives: ['ha', 'glycerin'], flags: { ff: true }, types: OILY.concat('normal'), sensitive: true, texture: 'gel', tier: 'mid', price: 55, size: '125ml', where: [S] },
  { id: 'kiehls-ufc', brand: "Kiehl's", name: 'Ultra Facial Cream', cat: 'moisturizer', actives: ['squalane', 'glycerin'], flags: { ff: null }, types: ['normal', 'dry', 'combination'], sensitive: true, texture: 'cream', tier: 'mid', price: 52, size: '50ml', where: [S, O] },
  { id: 'fab-urc', brand: 'First Aid Beauty', name: 'Ultra Repair Cream', cat: 'moisturizer', actives: ['allantoin', 'ceramides'], flags: { ff: true, eo: true }, types: DRY, sensitive: false, texture: 'rich', tier: 'mid', price: 50, size: '56g', where: [S] },
  { id: 'belif-aquabomb', brand: 'belif', name: 'The True Cream Aqua Bomb', cat: 'moisturizer', actives: ['glycerin'], flags: { ff: false, eo: true }, types: OILY.concat('normal'), sensitive: false, texture: 'gel', tier: 'mid', price: 55, size: '50ml', where: [S] },
  { id: 'lrp-cicaplast', brand: 'La Roche-Posay', name: 'Cicaplast Baume B5+', cat: 'moisturizer', actives: ['panthenol', 'centella', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'balm', tier: 'budget', price: 25, size: '40ml', where: [W, G, P], note: 'Great as a rich night layer or on dry, irritated patches.' },
  { id: 'avene-cicalfate', brand: 'Avène', name: 'Cicalfate+ Restorative Cream', cat: 'moisturizer', actives: ['allantoin', 'glycerin'], flags: { ff: true }, types: DRY.concat('combination'), sensitive: true, texture: 'balm', tier: 'budget', price: 26, size: '40ml', where: [W, P] },

  // ---------- Sunscreens ----------
  { id: 'biore-aqua', brand: 'Bioré', name: 'UV Aqua Rich Watery Essence SPF50+ PA++++', cat: 'sunscreen', actives: ['spf-chemical', 'ha'], flags: { ff: null, alcohol: true }, types: OILY.concat('normal'), sensitive: false, texture: 'fluid', tier: 'budget', price: 17, size: '50g', where: [W, G] },
  { id: 'skinaqua-toneup', brand: 'Skin Aqua (Rohto)', name: 'Tone Up UV Essence SPF50+ PA++++', cat: 'sunscreen', actives: ['spf-chemical', 'ha'], flags: { ff: null, alcohol: true }, types: ALL, sensitive: false, texture: 'fluid', tier: 'budget', price: 14, size: '80g', where: [W, G] },
  { id: 'anessa-milk', brand: 'Anessa', name: 'Perfect UV Sunscreen Skincare Milk SPF50+ (water-resistant)', cat: 'sunscreen', actives: ['spf-chemical', 'spf-mineral'], flags: { ff: null, alcohol: true }, types: ALL, sensitive: false, texture: 'fluid', tier: 'mid', price: 45, size: '60ml', where: [W, G], note: 'Best pick for sport, sweat or the beach.' },
  { id: 'lrp-uvmune', brand: 'La Roche-Posay', name: 'Anthelios UVMune 400 Invisible Fluid SPF50+', cat: 'sunscreen', actives: ['spf-chemical'], flags: { ff: null }, types: ALL, sensitive: true, texture: 'fluid', tier: 'mid', price: 39, size: '50ml', where: [W, G, P] },
  { id: 'boj-relief', brand: 'Beauty of Joseon', name: 'Relief Sun: Rice + Probiotics SPF50+', cat: 'sunscreen', actives: ['spf-chemical', 'glycerin'], flags: { ff: null, cf: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'budget', price: 22, size: '50ml', where: [W, O] },
  { id: 'skin1004-sunserum', brand: 'SKIN1004', name: 'Hyalu-Cica Water-Fit Sun Serum SPF50+', cat: 'sunscreen', actives: ['spf-chemical', 'centella', 'ha'], flags: { ff: null, cf: true }, types: ALL, sensitive: true, texture: 'fluid', tier: 'budget', price: 22, size: '50ml', where: [W, O] },
  { id: 'skin1004-airfit', brand: 'SKIN1004', name: 'Centella Air-Fit Suncream Plus SPF50+ (mineral)', cat: 'sunscreen', actives: ['spf-mineral', 'centella'], flags: { ff: null, cf: true }, types: ALL, sensitive: true, texture: 'cream', tier: 'mid', price: 32, size: '50ml', where: [O, W] },
  { id: 'roundlab-birch', brand: 'Round Lab', name: 'Birch Juice Moisturizing Sunscreen SPF45', cat: 'sunscreen', actives: ['spf-chemical', 'ha'], flags: { ff: null }, types: DRY.concat('combination'), sensitive: true, texture: 'cream', tier: 'budget', price: 25, size: '50ml', where: [O] },
  { id: 'isntree-watery', brand: 'Isntree', name: 'Hyaluronic Acid Watery Sun Gel SPF50+', cat: 'sunscreen', actives: ['spf-chemical', 'ha'], flags: { ff: null }, types: OILY.concat('normal'), sensitive: true, texture: 'gel', tier: 'budget', price: 24, size: '50ml', where: [O] },
  { id: 'avene-mineral', brand: 'Avène', name: 'Very High Protection Mineral Fluid SPF50+', cat: 'sunscreen', actives: ['spf-mineral'], flags: { ff: true }, types: ALL, sensitive: true, texture: 'fluid', tier: 'mid', price: 40, size: '40ml', where: [P, W] },
  { id: 'supergoop-unseen', brand: 'Supergoop!', name: 'Unseen Sunscreen SPF40', cat: 'sunscreen', actives: ['spf-chemical'], flags: { ff: null }, types: ALL, sensitive: false, texture: 'gel', tier: 'splurge', price: 54, size: '50ml', where: [S] },

  // ---------- Masks ----------
  { id: 'innisfree-volcanic', brand: 'innisfree', name: 'Super Volcanic Pore Clay Mask', cat: 'mask', maskType: 'clay', actives: ['clay'], flags: { ff: null }, types: OILY, sensitive: false, texture: 'clay', tier: 'budget', price: 24, size: '100ml', where: [W, O] },
  { id: 'kiehls-rareearth', brand: "Kiehl's", name: 'Rare Earth Deep Pore Cleansing Masque', cat: 'mask', maskType: 'clay', actives: ['clay'], flags: { ff: null }, types: OILY, sensitive: false, texture: 'clay', tier: 'mid', price: 52, size: '142ml', where: [S, O] },
  { id: 'laneige-sleeping', brand: 'Laneige', name: 'Water Sleeping Mask', cat: 'mask', maskType: 'hydrating', actives: ['ha', 'glycerin'], flags: { ff: false }, types: ALL, sensitive: false, texture: 'gel', tier: 'mid', price: 45, size: '70ml', where: [S, W] },
  { id: 'cosrx-rice', brand: 'COSRX', name: 'Ultimate Nourishing Rice Overnight Spa Mask', cat: 'mask', maskType: 'hydrating', actives: ['glycerin'], flags: { ff: null, cf: true }, types: DRY.concat('combination'), sensitive: true, texture: 'cream', tier: 'budget', price: 24, size: '60ml', where: [O] },
  { id: 'to-peel', brand: 'The Ordinary', name: 'AHA 30% + BHA 2% Peeling Solution', cat: 'mask', maskType: 'peel', actives: ['peel', 'glycolic', 'salicylic'], flags: { ff: true, cf: true, vegan: true }, types: ['normal', 'oily', 'combination'], sensitive: false, texture: 'liquid', tier: 'budget', price: 14, size: '30ml', where: [W, S], note: 'Strong. 10 minutes max, once a week, never on a retinoid night.' },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

export const CATEGORY_LABEL = {
  'oil-cleanser': 'First cleanse (oil, balm or micellar)',
  cleanser: 'Cleanser',
  toner: 'Toner / essence',
  exfoliant: 'Exfoliant',
  serum: 'Serum',
  treatment: 'Treatment',
  spot: 'Spot treatment',
  moisturizer: 'Moisturiser',
  sunscreen: 'Sunscreen',
  mask: 'Mask',
  other: 'Other',
};
