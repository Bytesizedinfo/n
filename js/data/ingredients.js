// Ingredient knowledge base.
// irritation: rough 0–4 scale used for the nightly "irritation budget".
// pregnancy: 'ok' | 'caution' | 'avoid' (conservative: caution is treated as avoid for leave-on use).
// concerns: 0–3, how much the ingredient helps each concern.
// candidate: true if the routine builder may recommend it as its own step.
// aliases: lowercase INCI / label names. Longest alias wins when several match one ingredient.

export const CONCERNS = {
  acne: 'Breakouts',
  pores: 'Clogged or large-looking pores',
  pigment: 'Dark spots & acne marks',
  melasma: 'Melasma patches',
  dullness: 'Dullness & uneven tone',
  redness: 'Redness & sensitivity',
  lines: 'Fine lines & wrinkles',
  firmness: 'Loss of firmness',
  texture: 'Rough or bumpy texture',
  dryness: 'Dryness & dehydration',
  oiliness: 'Oiliness & shine',
};

export const CONCERN_SHORT = {
  acne: 'breakouts', pores: 'clogged pores', pigment: 'dark spots', melasma: 'melasma',
  dullness: 'dullness', redness: 'redness', lines: 'fine lines', firmness: 'firmness',
  texture: 'texture', dryness: 'dryness', oiliness: 'shine',
};

// Groups that may only appear once in a routine (pick the best one).
export const SINGLE_GROUPS = ['retinoid', 'exfoliant', 'vitc', 'brightener', 'bpo'];

// Strong groups that get a slow ramp-up.
export const RAMP_GROUPS = ['retinoid', 'exfoliant', 'bpo'];

export const INGREDIENTS = [
  // ---------- Retinoids ----------
  { id: 'tretinoin', name: 'Tretinoin', group: 'retinoid', kind: 'active', rx: 'doctor',
    aliases: ['tretinoin', 'retinoic acid', 'retin-a'], irritation: 4, time: 'pm', pregnancy: 'avoid', photosens: true,
    concerns: { acne: 3, pores: 2, pigment: 2.5, melasma: 1, dullness: 2, lines: 3, firmness: 3, texture: 3, oiliness: 1 },
    does: 'the strongest retinoid; speeds skin renewal and builds collagen' },
  { id: 'adapalene', name: 'Adapalene 0.1%', group: 'retinoid', kind: 'active', candidate: true, rx: 'pharmacist',
    aliases: ['adapalene', 'differin'], irritation: 3, time: 'pm', pregnancy: 'avoid', photosens: true,
    concerns: { acne: 3, pores: 3, pigment: 1.5, dullness: 1, lines: 1.5, firmness: 1, texture: 2.5, oiliness: 1 },
    does: 'an acne-focused retinoid that keeps pores from clogging and calms inflamed spots' },
  { id: 'retinal', name: 'Retinal (retinaldehyde)', group: 'retinoid', kind: 'active', candidate: true,
    aliases: ['retinal', 'retinaldehyde'], irritation: 3, time: 'pm', pregnancy: 'avoid', photosens: true,
    concerns: { acne: 2.5, pores: 2, pigment: 2, melasma: 1, dullness: 2, lines: 3, firmness: 3, texture: 3, oiliness: 1 },
    does: 'a fast-acting retinoid, one step from the prescription form, for lines, firmness and texture' },
  { id: 'retinol', name: 'Retinol', group: 'retinoid', kind: 'active', candidate: true,
    aliases: ['retinol'], irritation: 2.5, time: 'pm', pregnancy: 'avoid', photosens: true,
    concerns: { acne: 2, pores: 2, pigment: 2, melasma: 1, dullness: 2, lines: 3, firmness: 2.5, texture: 3, oiliness: 1 },
    does: 'speeds up skin renewal and builds collagen over months' },
  { id: 'hpr', name: 'Gentle retinoid (HPR / granactive)', group: 'retinoid', kind: 'active', candidate: true,
    aliases: ['hydroxypinacolone retinoate', 'granactive retinoid'], irritation: 1.5, time: 'pm', pregnancy: 'avoid', photosens: true,
    concerns: { acne: 1.5, pores: 1.5, pigment: 1.5, dullness: 1.5, lines: 2, firmness: 1.5, texture: 2 },
    does: 'a gentler retinoid that gives retinol-style benefits with less irritation' },
  { id: 'retinyl', name: 'Retinyl esters', group: 'retinoid', kind: 'active', weak: true,
    aliases: ['retinyl palmitate', 'retinyl acetate', 'retinyl propionate', 'retinyl retinoate'], irritation: 0.8, time: 'pm', pregnancy: 'avoid',
    concerns: { lines: 1, texture: 1, dullness: 1 },
    does: 'a mild vitamin A ester' },
  { id: 'bakuchiol', name: 'Bakuchiol', group: 'retinoid-alt', kind: 'active', candidate: true,
    aliases: ['bakuchiol'], irritation: 0.5, time: 'any', pregnancy: 'caution',
    concerns: { acne: 1, pigment: 1, dullness: 1, lines: 1.5, firmness: 1, texture: 1 },
    does: 'a plant-based retinol alternative: gentle, mild results' },

  // ---------- Exfoliating acids ----------
  { id: 'glycolic', name: 'Glycolic acid (AHA)', group: 'exfoliant', sub: 'aha', kind: 'active', candidate: true,
    aliases: ['glycolic acid'], irritation: 2.5, time: 'pm', pregnancy: 'ok', photosens: true,
    concerns: { texture: 3, dullness: 3, pigment: 2, lines: 1.5, pores: 1, acne: 1 },
    does: 'dissolves the dead-cell layer on the surface for smoother, brighter skin' },
  { id: 'lactic', name: 'Lactic acid (AHA)', group: 'exfoliant', sub: 'aha', kind: 'active', candidate: true,
    aliases: ['lactic acid'], irritation: 1.5, time: 'pm', pregnancy: 'ok', photosens: true,
    concerns: { texture: 2, dullness: 2.5, pigment: 1.5, dryness: 1, lines: 1 },
    does: 'a gentler AHA that exfoliates and also hydrates' },
  { id: 'mandelic', name: 'Mandelic acid (AHA)', group: 'exfoliant', sub: 'aha', kind: 'active', candidate: true,
    aliases: ['mandelic acid'], irritation: 1.2, time: 'pm', pregnancy: 'ok', photosens: true,
    concerns: { acne: 1.5, pigment: 2, texture: 2, dullness: 2, pores: 1 },
    does: 'a large-molecule AHA that exfoliates slowly; kind to sensitive skin and acne marks' },
  { id: 'aha', name: 'AHA (other)', group: 'exfoliant', sub: 'aha', kind: 'active',
    aliases: ['citric acid 10', 'malic acid', 'tartaric acid', 'alpha hydroxy acid'], irritation: 1.5, time: 'pm', pregnancy: 'ok', photosens: true,
    concerns: { texture: 1.5, dullness: 1.5 },
    does: 'fruit acids that exfoliate the surface' },
  { id: 'salicylic', name: 'Salicylic acid (BHA)', group: 'exfoliant', sub: 'bha', kind: 'active', candidate: true,
    aliases: ['salicylic acid', 'beta hydroxy acid'], irritation: 2, time: 'any', pregnancy: 'caution',
    concerns: { acne: 2.5, pores: 3, oiliness: 2, texture: 1.5, dullness: 1 },
    does: 'oil-soluble, so it gets inside pores to clear blackheads and breakouts' },
  { id: 'betaine-sal', name: 'Betaine salicylate (gentle BHA)', group: 'exfoliant', sub: 'bha', kind: 'active',
    aliases: ['betaine salicylate', 'willow bark extract', 'salix alba bark extract'], irritation: 1, time: 'any', pregnancy: 'ok',
    concerns: { acne: 1.5, pores: 2, oiliness: 1 },
    does: 'a gentler cousin of salicylic acid for pores' },
  { id: 'lha', name: 'LHA (capryloyl salicylic acid)', group: 'exfoliant', sub: 'bha', kind: 'active',
    aliases: ['capryloyl salicylic acid', 'lha'], irritation: 1.5, time: 'any', pregnancy: 'caution',
    concerns: { acne: 2, pores: 2, texture: 1.5 },
    does: 'a slow-release BHA for pores' },
  { id: 'pha', name: 'PHA (gluconolactone)', group: 'exfoliant', sub: 'pha', kind: 'active', candidate: true,
    aliases: ['gluconolactone', 'lactobionic acid', 'polyhydroxy acid'], irritation: 0.7, time: 'any', pregnancy: 'ok',
    concerns: { texture: 1.5, dullness: 1.5, dryness: 0.5, pores: 0.5 },
    does: 'the gentlest acid: exfoliates lightly while hydrating; safe for sensitive skin' },
  { id: 'peel', name: 'Strong acid peel (AHA 30% + BHA)', group: 'exfoliant', sub: 'peel', kind: 'active',
    aliases: [], irritation: 4, time: 'pm', pregnancy: 'caution', photosens: true,
    concerns: { texture: 3, dullness: 3, pigment: 2, pores: 2 },
    does: 'a strong weekly peel' },
  { id: 'enzyme', name: 'Fruit enzymes', group: 'enzyme', kind: 'active',
    aliases: ['papain', 'bromelain', 'subtilisin'], irritation: 1, time: 'any', pregnancy: 'ok',
    concerns: { texture: 1, dullness: 1 },
    does: 'enzymes that loosen dead skin cells' },

  // ---------- Acne ----------
  { id: 'bpo', name: 'Benzoyl peroxide', group: 'bpo', kind: 'active', candidate: true, rx: 'pharmacist',
    aliases: ['benzoyl peroxide'], irritation: 2.5, time: 'am', pregnancy: 'caution',
    concerns: { acne: 3, pores: 0.5, oiliness: 0.5 },
    does: 'kills acne bacteria; the most reliable fix for red, inflamed spots' },
  { id: 'sulfur', name: 'Sulfur', group: 'sulfur', kind: 'active', candidate: true,
    aliases: ['sulfur', 'sulphur'], irritation: 1.5, time: 'pm', pregnancy: 'ok',
    concerns: { acne: 2, oiliness: 1.5, pores: 1 },
    does: 'dries out spots and calms yeast; good for fungal acne and oily skin' },
  { id: 'zpt', name: 'Zinc pyrithione / ketoconazole wash', group: 'antifungal', kind: 'active',
    aliases: ['zinc pyrithione', 'ketoconazole', 'piroctone olamine', 'climbazole'], irritation: 1, time: 'any', pregnancy: 'ok',
    concerns: { acne: 1, redness: 1 },
    does: 'an anti-yeast ingredient for fungal acne and flaky redness (seborrhoeic dermatitis)' },
  { id: 'teatree', name: 'Tea tree oil', group: 'eo', kind: 'flag',
    aliases: ['melaleuca alternifolia leaf oil', 'melaleuca alternifolia (tea tree) leaf oil', 'tea tree leaf oil', 'tea tree oil'], irritation: 1, time: 'any', pregnancy: 'ok',
    concerns: { acne: 0.5 },
    does: 'mildly antibacterial essential oil; can irritate' },

  // ---------- Vitamin C ----------
  { id: 'laa', name: 'Vitamin C (L-ascorbic acid)', group: 'vitc', kind: 'active', candidate: true,
    aliases: ['ascorbic acid', 'l-ascorbic acid'], irritation: 1.5, time: 'am', pregnancy: 'ok',
    concerns: { pigment: 2.5, dullness: 3, lines: 1.5, firmness: 1.5, melasma: 1.5 },
    does: 'an antioxidant that fades dark spots, brightens and boosts your sunscreen' },
  { id: 'vitc-deriv', name: 'Vitamin C derivative', group: 'vitc', kind: 'active', candidate: true,
    aliases: ['ascorbyl glucoside', 'sodium ascorbyl phosphate', 'magnesium ascorbyl phosphate', '3-o-ethyl ascorbic acid', 'ethyl ascorbic acid', 'ascorbyl tetraisopalmitate', 'tetrahexyldecyl ascorbate', 'ascorbyl palmitate'],
    irritation: 0.5, time: 'am', pregnancy: 'ok',
    concerns: { pigment: 1.5, dullness: 2, lines: 0.5, melasma: 1 },
    does: 'a gentle, stable form of vitamin C for brightness' },

  // ---------- Brighteners / soothers ----------
  { id: 'azelaic', name: 'Azelaic acid', group: 'azelaic', kind: 'active', candidate: true,
    aliases: ['azelaic acid'], irritation: 1, time: 'any', pregnancy: 'ok',
    concerns: { acne: 2, redness: 3, pigment: 2.5, melasma: 2, pores: 1, texture: 1 },
    does: 'calms redness, fades marks and fights breakouts; pregnancy-safe' },
  { id: 'potassium-azeloyl', name: 'Azeloglycine / potassium azeloyl diglycinate', group: 'azelaic', kind: 'active',
    aliases: ['potassium azeloyl diglycinate', 'azeloglicina'], irritation: 0.3, time: 'any', pregnancy: 'ok',
    concerns: { redness: 1.5, pigment: 1, oiliness: 1 },
    does: 'a mild azelaic acid derivative' },
  { id: 'niacinamide', name: 'Niacinamide', group: 'niacinamide', kind: 'active', candidate: true, mergeable: true,
    aliases: ['niacinamide', 'nicotinamide'], irritation: 0.3, time: 'any', pregnancy: 'ok',
    concerns: { oiliness: 2.5, pores: 2, redness: 1.5, pigment: 1.5, acne: 1, dullness: 1, dryness: 1 },
    does: 'controls oil, strengthens the skin barrier and evens tone; easy to pair with anything' },
  { id: 'tranexamic', name: 'Tranexamic acid', group: 'brightener', kind: 'active', candidate: true,
    aliases: ['tranexamic acid'], irritation: 0.3, time: 'any', pregnancy: 'caution',
    concerns: { melasma: 3, pigment: 2.5, redness: 1 },
    does: 'targets stubborn pigment like melasma without irritation' },
  { id: 'arbutin', name: 'Alpha arbutin', group: 'brightener', kind: 'active', candidate: true,
    aliases: ['alpha-arbutin', 'alpha arbutin', 'arbutin'], irritation: 0.3, time: 'any', pregnancy: 'caution',
    concerns: { pigment: 2.5, melasma: 2, dullness: 1 },
    does: 'slows down excess pigment production to fade dark spots' },
  { id: 'kojic', name: 'Kojic acid', group: 'brightener', kind: 'active',
    aliases: ['kojic acid', 'kojic dipalmitate'], irritation: 0.8, time: 'any', pregnancy: 'caution',
    concerns: { pigment: 2, melasma: 1.5 },
    does: 'a pigment-fading ingredient' },
  { id: 'licorice', name: 'Licorice root extract', group: 'brightener-mild', kind: 'support',
    aliases: ['glycyrrhiza glabra root extract', 'glycyrrhiza glabra (licorice) root extract', 'dipotassium glycyrrhizate', 'glabridin'], irritation: 0, time: 'any', pregnancy: 'ok',
    concerns: { pigment: 1, redness: 1 },
    does: 'soothes and gently brightens' },
  { id: 'melasyl', name: 'Melasyl', group: 'brightener', kind: 'active',
    aliases: ['retinyl melasyl', '2-mercaptonicotinoyl glycine'], irritation: 0.3, time: 'any', pregnancy: 'caution',
    concerns: { pigment: 2.5, melasma: 2 },
    does: 'a newer pigment-blocking molecule' },
  { id: 'hydroquinone', name: 'Hydroquinone', group: 'hq', kind: 'active', rx: 'doctor',
    aliases: ['hydroquinone'], irritation: 2, time: 'pm', pregnancy: 'avoid',
    concerns: { pigment: 3, melasma: 3 },
    does: 'a prescription-only pigment fader in Singapore' },

  // ---------- Anti-ageing ----------
  { id: 'peptides', name: 'Peptides', group: 'peptides', kind: 'active', candidate: true, mergeable: true,
    aliases: ['palmitoyl tripeptide', 'palmitoyl pentapeptide', 'palmitoyl tetrapeptide', 'acetyl hexapeptide', 'argireline', 'matrixyl', 'tripeptide', 'hexapeptide', 'pentapeptide', 'tetrapeptide', 'oligopeptide', 'peptide'],
    irritation: 0, time: 'any', pregnancy: 'ok',
    concerns: { lines: 1.5, firmness: 1.5, dryness: 0.5 },
    does: 'signal peptides that support firmness, with no irritation' },
  { id: 'copper', name: 'Copper peptides', group: 'copper', kind: 'active', candidate: true,
    aliases: ['copper tripeptide-1', 'copper tripeptide', 'ghk-cu', 'copper peptide'], irritation: 0.5, time: 'pm', pregnancy: 'ok',
    concerns: { firmness: 2, lines: 1.5, texture: 1, redness: 0.5 },
    does: 'helps repair and firm the skin' },

  // ---------- Barrier / hydration / soothing (support) ----------
  { id: 'ceramides', name: 'Ceramides', group: 'barrier', kind: 'support', mergeable: true,
    aliases: ['ceramide np', 'ceramide ap', 'ceramide eop', 'ceramide ns', 'ceramide as', 'ceramide eos', 'ceramide 1', 'ceramide 2', 'ceramide 3', 'ceramide 6', 'ceramide', 'ceramides', 'phytosphingosine', 'sphingolipids'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: { dryness: 2.5, redness: 1.5 },
    does: 'the lipids that hold your skin barrier together' },
  { id: 'ha', name: 'Hyaluronic acid', group: 'humectant', kind: 'support', mergeable: true,
    aliases: ['sodium hyaluronate', 'hyaluronic acid', 'hydrolyzed hyaluronic acid', 'sodium acetylated hyaluronate', 'sodium hyaluronate crosspolymer'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: { dryness: 2 },
    does: 'draws water into the skin for plumpness' },
  { id: 'glycerin', name: 'Glycerin', group: 'humectant', kind: 'support',
    aliases: ['glycerin', 'glycerine'], irritation: 0, time: 'any', pregnancy: 'ok', concerns: { dryness: 1 },
    does: 'a classic, reliable humectant' },
  { id: 'urea', name: 'Urea', group: 'humectant', kind: 'support',
    aliases: ['urea'], irritation: 0.3, time: 'any', pregnancy: 'ok', concerns: { dryness: 2, texture: 1 },
    does: 'hydrates and softens rough skin' },
  { id: 'panthenol', name: 'Panthenol (B5)', group: 'soothing', kind: 'support',
    aliases: ['panthenol', 'dexpanthenol', 'provitamin b5'], irritation: 0, time: 'any', pregnancy: 'ok', concerns: { redness: 1.5, dryness: 1 },
    does: 'soothes and helps skin repair' },
  { id: 'centella', name: 'Centella asiatica (cica)', group: 'soothing', kind: 'support',
    aliases: ['centella asiatica extract', 'centella asiatica leaf extract', 'centella asiatica', 'madecassoside', 'asiaticoside', 'madecassic acid', 'asiatic acid'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: { redness: 2, acne: 0.5 },
    does: 'calms irritation and redness' },
  { id: 'allantoin', name: 'Allantoin / bisabolol / oat', group: 'soothing', kind: 'support',
    aliases: ['allantoin', 'bisabolol', 'avena sativa kernel extract', 'avena sativa (oat) kernel flour', 'colloidal oatmeal', 'beta-glucan', 'ectoin', 'ectoine'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: { redness: 1.5 },
    does: 'gentle soothers' },
  { id: 'squalane', name: 'Squalane', group: 'emollient', kind: 'support',
    aliases: ['squalane'], irritation: 0, time: 'any', pregnancy: 'ok', concerns: { dryness: 1.5 },
    does: 'a lightweight, non-greasy oil' },
  { id: 'zinc-pca', name: 'Zinc', group: 'oil-control', kind: 'support',
    aliases: ['zinc pca', 'zinc gluconate'], irritation: 0, time: 'any', pregnancy: 'ok', concerns: { oiliness: 1, acne: 0.5 },
    does: 'helps regulate oil' },
  { id: 'antioxidants', name: 'Antioxidants (vitamin E, ferulic, green tea)', group: 'antioxidant', kind: 'support',
    aliases: ['tocopherol', 'tocopheryl acetate', 'ferulic acid', 'resveratrol', 'camellia sinensis leaf extract', 'ubiquinone', 'astaxanthin'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: { dullness: 0.5, lines: 0.5 },
    does: 'protects against pollution and sun damage' },
  { id: 'clay', name: 'Clay', group: 'clay', kind: 'support',
    aliases: ['kaolin', 'bentonite', 'montmorillonite', 'illite', 'volcanic ash', 'charcoal powder'], irritation: 0.3, time: 'any', pregnancy: 'ok',
    concerns: { oiliness: 2, pores: 1 },
    does: 'absorbs excess oil' },

  // ---------- Sunscreen filters ----------
  { id: 'spf-mineral', name: 'Mineral UV filters', group: 'spf', sub: 'mineral', kind: 'filter',
    aliases: ['zinc oxide', 'titanium dioxide'], irritation: 0, time: 'am', pregnancy: 'ok', concerns: {},
    does: 'mineral filters that reflect and absorb UV' },
  { id: 'spf-chemical', name: 'Chemical UV filters', group: 'spf', sub: 'chemical', kind: 'filter',
    aliases: ['butyl methoxydibenzoylmethane', 'avobenzone', 'ethylhexyl methoxycinnamate', 'octinoxate', 'octocrylene', 'homosalate', 'ethylhexyl salicylate', 'octisalate',
      'bis-ethylhexyloxyphenol methoxyphenyl triazine', 'methylene bis-benzotriazolyl tetramethylbutylphenol', 'diethylamino hydroxybenzoyl hexyl benzoate', 'ethylhexyl triazone',
      'drometrizole trisiloxane', 'terephthalylidene dicamphor sulfonic acid', 'phenylbenzimidazole sulfonic acid', 'polysilicone-15', 'diethylhexyl butamido triazone',
      'methoxypropylamino cyclohexenylidene ethoxyethylcyanoacetate', 'tris-biphenyl triazine', 'tinosorb', 'uvinul', 'mexoryl', 'oxybenzone', 'benzophenone-3'],
    irritation: 0, time: 'am', pregnancy: 'ok', concerns: {},
    does: 'filters that absorb UV' },

  // ---------- Flags (not actives) ----------
  { id: 'fragrance', name: 'Fragrance', group: 'fragrance', kind: 'flag',
    aliases: ['parfum', 'fragrance', 'aroma', 'perfume'], irritation: 0.5, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'scent; a top cause of skin reactions' },
  { id: 'fragrance-allergen', name: 'Fragrance allergens', group: 'fragrance', kind: 'flag',
    aliases: ['limonene', 'linalool', 'citronellol', 'geraniol', 'eugenol', 'citral', 'coumarin', 'hexyl cinnamal', 'benzyl salicylate', 'benzyl benzoate', 'farnesol', 'isoeugenol', 'cinnamal', 'amyl cinnamal', 'alpha-isomethyl ionone', 'hydroxycitronellal', 'butylphenyl methylpropional'],
    irritation: 0.3, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'scent compounds that commonly trigger reactions' },
  { id: 'eo', name: 'Essential oils', group: 'eo', kind: 'flag',
    aliases: ['lavandula angustifolia oil', 'lavender oil', 'eucalyptus globulus leaf oil', 'rosmarinus officinalis leaf oil', 'mentha piperita oil', 'peppermint oil',
      'citrus aurantium dulcis peel oil', 'citrus limon peel oil', 'citrus aurantium bergamia fruit oil', 'cananga odorata flower oil', 'pelargonium graveolens oil',
      'cymbopogon', 'menthol', 'camphor', 'leaf oil', 'peel oil', 'flower oil', 'bark oil', 'herb oil', 'rind oil'],
    irritation: 0.8, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'plant scent oils that often irritate sensitive skin' },
  { id: 'alcohol', name: 'Drying alcohol', group: 'alcohol', kind: 'flag',
    aliases: ['alcohol denat', 'alcohol denat.', 'denatured alcohol', 'sd alcohol', 'sd alcohol 40', 'ethanol', 'isopropyl alcohol', 'alcohol'],
    exact: ['alcohol'], irritation: 0.5, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'helps products dry fast but can dry and irritate skin' },
  { id: 'comedogenic', name: 'Possible pore-cloggers', group: 'comedogenic', kind: 'flag',
    aliases: ['isopropyl myristate', 'isopropyl palmitate', 'isopropyl isostearate', 'myristyl myristate', 'cocos nucifera oil', 'cocos nucifera (coconut) oil', 'coconut oil',
      'theobroma cacao seed butter', 'cocoa butter', 'triticum vulgare germ oil', 'wheat germ oil', 'algae extract', 'laureth-4', 'acetylated lanolin', 'oleth-3', 'decyl oleate', 'ethylhexyl palmitate', 'isocetyl stearate'],
    irritation: 0, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'may clog pores in acne-prone skin' },
  { id: 'sls', name: 'Harsh sulfates', group: 'sulfate', kind: 'flag',
    aliases: ['sodium lauryl sulfate', 'ammonium lauryl sulfate'], irritation: 0.8, time: 'any', pregnancy: 'ok', concerns: {},
    does: 'strong cleansing agents that strip the barrier' },
];

// Patterns that may feed Malassezia (fungal acne). Heuristic.
export const FUNGAL_TRIGGER_PATTERNS = [
  /\bpolysorbate[- ]?\d+/, /\b(isopropyl|ethylhexyl|cetyl|glyceryl|sorbitan|peg-\d+|myristyl|decyl|octyldodecyl|isocetyl)\s+(myristate|palmitate|stearate|oleate|laurate|isostearate)\b/,
  /\bsorbitan (oleate|stearate|laurate|isostearate|olivate|sesquioleate)\b/, /\b(olive|olea europaea|argan|argania spinosa|coconut|cocos nucifera|avocado|persea gratissima|sunflower|helianthus annuus|almond|prunus amygdalus|jojoba|simmondsia chinensis|shea|butyrospermum parkii|rosehip|rosa canina|castor|ricinus communis)\b.*\b(oil|butter)\b/,
  /\boleic acid\b/, /\blauric acid\b/, /\bstearic acid\b/, /\bpalmitic acid\b/, /\bmyristic acid\b/,
];

export const BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const CANDIDATES = INGREDIENTS.filter((i) => i.candidate).map((i) => i.id);

// Short names for UI lists.
export function ingName(id) {
  return BY_ID[id] ? BY_ID[id].name : id;
}

export function groupOf(id) {
  const i = BY_ID[id];
  return i ? i.group : null;
}

// Actives a person can tick by hand in the shelf "tick" form.
export const TICKABLE = [
  'retinol', 'retinal', 'adapalene', 'tretinoin', 'hpr', 'retinyl', 'bakuchiol',
  'glycolic', 'lactic', 'mandelic', 'salicylic', 'betaine-sal', 'pha', 'enzyme',
  'bpo', 'sulfur', 'zpt', 'laa', 'vitc-deriv', 'azelaic', 'niacinamide', 'tranexamic', 'arbutin', 'kojic',
  'hydroquinone', 'peptides', 'copper', 'ceramides', 'ha', 'urea', 'panthenol', 'centella', 'squalane', 'clay',
  'spf-mineral', 'spf-chemical', 'fragrance', 'eo', 'alcohol', 'comedogenic',
];
