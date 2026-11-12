// Test profiles (quiz answers) used by the engine tests.

const base = {
  skinType: 'normal', age: '20s', concerns: ['dullness'], sensitivity: '1', barrier: 'ok', triggers: ['none'],
  pregnancy: 'none', rx: ['none'], conditions: ['none'], climate: 'tropical', environment: [], lifestyle: [],
  makeup: 'none', spfHabit: 'daily', currentActives: ['none'], retinoidExp: 'never', steps: 'moderate', pace: 'balanced',
  budget: 'mid', texture: 'any', prefs: [],
};

export const PERSONAS = {
  oilyAcne: { ...base, skinType: 'oily', dehydrated: 'sometimes', concerns: ['acne', 'pores', 'pigment'], topConcern: 'acne',
    acneType: ['comedonal', 'inflamed'], acneSeverity: 'some', pigmentType: ['pih'], environment: ['aircon'], makeup: 'light',
    currentActives: ['niacinamide'], budget: 'budget', texture: 'light', prefs: ['ff'] },
  sensitiveRedness: { ...base, skinType: 'combination', concerns: ['redness', 'pigment'], topConcern: 'redness',
    rednessType: ['flush', 'reactive'], pigmentType: ['pih'], sensitivity: '3', conditions: ['rosacea'], prefs: ['ff'], pace: 'gentle' },
  pregnant: { ...base, skinType: 'dry', concerns: ['acne', 'pigment', 'lines'], topConcern: 'acne', acneType: ['hormonal'],
    acneSeverity: 'few', pigmentType: ['pih'], pregnancy: 'pregnant', retinoidExp: undefined },
  tretinoin: { ...base, concerns: ['lines', 'texture', 'acne'], topConcern: 'lines', acneType: ['comedonal'], acneSeverity: 'few',
    rx: ['tretinoin'], steps: 'full', retinoidExp: 'current', age: '30s' },
  melasma: { ...base, skinType: 'combination', concerns: ['melasma', 'pigment'], topConcern: 'melasma', pigmentType: ['melasma', 'sun'],
    environment: ['outdoors'], age: '30s' },
  matureDry: { ...base, skinType: 'dry', concerns: ['lines', 'firmness', 'dryness'], topConcern: 'lines', age: '50+',
    retinoidExp: 'tolerated', steps: 'full', budget: 'splurge', texture: 'rich', sensitivity: '0' },
  minimal3: { ...base, skinType: 'oily', concerns: ['oiliness', 'acne'], topConcern: 'acne', acneType: ['comedonal'], acneSeverity: 'few',
    steps: 'minimal', makeup: 'full', budget: 'budget' },
  isotretinoin: { ...base, skinType: 'combination', concerns: ['acne', 'dryness'], topConcern: 'acne', acneType: ['cystic'],
    acneSeverity: 'scarring', rx: ['isotretinoin'] },
  barrier: { ...base, skinType: 'combination', concerns: ['acne', 'texture'], topConcern: 'acne', acneType: ['comedonal'],
    acneSeverity: 'some', barrier: 'damaged', sensitivity: '2' },
  fungal: { ...base, skinType: 'oily', concerns: ['acne'], acneType: ['fungal'], acneSeverity: 'some', conditions: ['fungal'] },
  maintain: { ...base, concerns: ['maintain'], steps: 'minimal' },
  fullFast: { ...base, skinType: 'oily', concerns: ['texture', 'dullness', 'pores'], topConcern: 'texture', sensitivity: '0',
    steps: 'full', pace: 'fast', retinoidExp: 'tolerated' },
};

export const INCI = {
  ceraveFoaming: 'Ingredients: Aqua / Water, Cocamidopropyl Hydroxysultaine, Glycerin, Sodium Lauroyl Sarcosinate, Peg-150 Pentaerythrityl Tetrastearate, Niacinamide, Peg-6 Caprylic/Capric Glycerides, Sodium Methyl Cocoyl Taurate, Propylene Glycol, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Methylparaben, Sodium Chloride, Sodium Lauroyl Lactylate, Cholesterol, Phenoxyethanol, Disodium EDTA, Citric Acid, Tetrasodium EDTA, Hydrolyzed Hyaluronic Acid, Phytosphingosine, Xanthan Gum',
  vitcSerum: 'Water, 3-O-Ethyl Ascorbic Acid, Propanediol, Glycerin, Tocopherol, Ferulic Acid, Sodium Hyaluronate, Phenoxyethanol',
  sunscreen: 'Water, Alcohol Denat., Ethylhexyl Methoxycinnamate, Ethylhexyl Salicylate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Cetearyl Alcohol, Parfum (Fragrance), Limonene',
  oily: 'Aqua, Cocos Nucifera (Coconut) Oil, Isopropyl Myristate, Polysorbate 20, Glyceryl Stearate, Caprylic/Capric Triglyceride, Squalane, Lavandula Angustifolia (Lavender) Oil',
  ocr: 'INGREDIENTS: Water, Glycerin, Sodium Hyalu-\nronate, Salicylic Acid, Butylene Glycol; Melaleuca Alternifolia (Tea Tree) Leaf Oil',
};
