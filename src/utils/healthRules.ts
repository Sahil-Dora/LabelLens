export interface AdditiveDetail {
  name: string;
  eNumber?: string;
  category: string;
  risk: 'Low' | 'Moderate' | 'High';
  description: string;
  laymanExplanation: string;
  icmrContext: string;
}

export interface SwapSuggestion {
  trigger: string;
  alternative: string;
  benefit: string;
}

export const INS_DICTIONARY: Record<string, AdditiveDetail> = {
  '102': {
    name: 'Tartrazine',
    eNumber: 'E102',
    category: 'Synthetic Color (Yellow No. 5)',
    risk: 'High',
    description: 'Azo dye used to give bright yellow color to drinks, candies, and packaged snacks.',
    laymanExplanation: 'Linked to hyperactivity in children and potential allergic or asthmatic reactions.',
    icmrContext: 'Mandatory warning label required on packaged foods containing synthetic colors in India.'
  },
  '110': {
    name: 'Sunset Yellow FCF',
    eNumber: 'E110',
    category: 'Synthetic Color',
    risk: 'High',
    description: 'Artificial orange-yellow azo dye used in carbonated beverages and snacks.',
    laymanExplanation: 'Restricted or banned in several countries due to cumulative sensitivity and health concerns.',
    icmrContext: 'Regulated under FSSAI limits for permitted synthetic food colors.'
  },
  '150D': {
    name: 'Caramel IV (Ammonia-Sulfite Caramel)',
    eNumber: 'E150d',
    category: 'Coloring Agent',
    risk: 'Moderate',
    description: 'Caramel color produced using ammonia and sulfite compounds, common in colas and dark beverages.',
    laymanExplanation: 'Contains trace processing byproducts monitored for long-term metabolic impact.',
    icmrContext: 'Widely used in Indian soft drinks and dark beverages under FSSAI standards.'
  },
  '202': {
    name: 'Potassium Sorbate',
    eNumber: 'E202',
    category: 'Chemical Preservative',
    risk: 'Low',
    description: 'Effective mold and yeast inhibitor used in dairy, baked goods, and beverages.',
    laymanExplanation: 'Generally well-tolerated and metabolized safely by the human body.',
    icmrContext: 'Permitted preservative within safe limits set by FSSAI.'
  },
  '211': {
    name: 'Sodium Benzoate',
    eNumber: 'E211',
    category: 'Chemical Preservative',
    risk: 'Moderate',
    description: 'Broad-spectrum preservative used to prevent mold and bacterial growth in liquids and sauces.',
    laymanExplanation: 'Can form trace amounts of benzene if combined with Vitamin C (ascorbic acid) over time.',
    icmrContext: 'Strictly capped by FSSAI in fruit juices, jams, and squashes.'
  },
  '300': {
    name: 'Ascorbic Acid (Vitamin C)',
    eNumber: 'E300',
    category: 'Antioxidant / Nutrient',
    risk: 'Low',
    description: 'Essential nutrient and antioxidant used to prevent oxidation and browning.',
    laymanExplanation: 'Completely safe and beneficial vitamin supplement.',
    icmrContext: 'Permitted and encouraged as a nutritional additive.'
  },
  '320': {
    name: 'Butylated Hydroxyanisole (BHA)',
    eNumber: 'E320',
    category: 'Synthetic Antioxidant',
    risk: 'High',
    description: 'Synthetic antioxidant used to prevent rancidity in fried chips and edible oils.',
    laymanExplanation: 'Considered a potential endocrine disruptor with cumulative toxicity concerns in high doses.',
    icmrContext: 'FSSAI caps usage at maximum 200 ppm in edible fats and oils.'
  },
  '322': {
    name: 'Lecithin (INS 322)',
    eNumber: 'E322',
    category: 'Natural Emulsifier',
    risk: 'Low',
    description: 'Natural fat derivative commonly sourced from soybeans or eggs to bind ingredients together.',
    laymanExplanation: 'Generally safe and well-tolerated by the human body.',
    icmrContext: 'Permitted widely as a safe natural food additive.'
  },
  '330': {
    name: 'Citric Acid',
    eNumber: 'E330',
    category: 'Acidity Regulator',
    risk: 'Low',
    description: 'Natural organic acid found in citrus fruits, used to tart up flavor and preserve freshness.',
    laymanExplanation: 'Safe natural acidifier present in lemons and oranges.',
    icmrContext: 'Standard permitted food additive in India.'
  },
  '331': {
    name: 'Sodium Citrates',
    eNumber: 'E331',
    category: 'Acidity Regulator / Buffer',
    risk: 'Low',
    description: 'Salt of citric acid used to control pH and tartness in beverages.',
    laymanExplanation: 'Generally recognized as safe for daily consumption.',
    icmrContext: 'Approved by FSSAI for beverages and packaged foods.'
  },
  '500': {
    name: 'Sodium Carbonates (Baking Soda)',
    eNumber: 'INS 500',
    category: 'Acidity Regulator / Raising Agent',
    risk: 'Low',
    description: 'Mineral salt used to control acidity and help baked goods rise.',
    laymanExplanation: 'Completely safe baking ingredient with no adverse health risks.',
    icmrContext: 'Standard permitted ingredient in bakery and processed foods.'
  },
  '621': {
    name: 'Monosodium Glutamate (MSG)',
    eNumber: 'E621',
    category: 'Flavor Enhancer',
    risk: 'Moderate',
    description: 'Sodium salt of glutamic acid used to amplify savory (umami) flavors in snacks and noodles.',
    laymanExplanation: 'Can cause mild headaches or temporary sensitivity in sensitive individuals when consumed in excess.',
    icmrContext: 'Restricted in infant and baby foods by FSSAI.'
  },
  '951': {
    name: 'Aspartame',
    eNumber: 'E951',
    category: 'Artificial Sweetener',
    risk: 'High',
    description: 'Intense low-calorie synthetic sweetener used in diet beverages and sugar-free snacks.',
    laymanExplanation: 'Monitored for long-term metabolic and gut microbiome health impact.',
    icmrContext: 'Must declare warning on packages stating "CONTAINS ASPARTAME. NOT RECOMMENDED FOR PHENYLKETONURICS".'
  }
};

export const decodeAdditive = (tag: string): AdditiveDetail => {
  const codeMatch = tag.match(/\d+[a-zA-Z]*/);
  const code = codeMatch ? codeMatch[0].toUpperCase() : '';
  const numericOnly = code.replace(/[^0-9]/g, '');

  return (
    INS_DICTIONARY[code] ||
    INS_DICTIONARY[numericOnly] || {
      name: `Additive ${tag.replace(/^en:/, '').toUpperCase()}`,
      category: 'General Additive',
      risk: 'Moderate',
      description: 'Regulated food additive used for preservation, texture, or flavor.',
      laymanExplanation: 'Standard processed food ingredient evaluated for general consumption.',
      icmrContext: 'Regulated under standard FSSAI safety norms.'
    }
  );
};

export const checkICMRGuidelines = (product: any) => {
  const flags: string[] = [];
  const nutriments = product?.nutriments || {};

  const sugar = nutriments['sugars_100g'] || 0;
  const fat = nutriments['saturated-fat_100g'] || 0;
  const sodium = nutriments['sodium_100g'] ? nutriments['sodium_100g'] * 1000 : (nutriments['salt_100g'] || 0) * 400;

  if (sugar > 10) {
    flags.push(`⚠️ Excessive Added Sugar: ${sugar.toFixed(1)}g/100g (Exceeds ICMR limit of 10g/100g)`);
  }
  if (fat > 5) {
    flags.push(`⚠️ High Saturated Fat: ${fat.toFixed(1)}g/100g (ICMR threshold: 5g/100g)`);
  }
  if (sodium > 500) {
    flags.push(`⚠️ High Sodium Content: ${sodium.toFixed(0)}mg/100g (ICMR warning cutoff: 500mg/100g)`);
  }

  const ingredients = (product?.ingredients_text || product?.ingredients_text_en || '').toLowerCase();
  if (ingredients.includes('palm oil') || ingredients.includes('palmolein')) {
    flags.push('🌴 Contains Palm Oil / Palmolein (High saturated fat source)');
  }
  if (ingredients.includes('maida') || ingredients.includes('refined wheat flour')) {
    flags.push('🌾 Uses Refined Wheat Flour (Maida) - Low dietary fiber content');
  }

  return flags;
};

export const getIndianSwaps = (icmrFlags: string[], additives: AdditiveDetail[]): SwapSuggestion[] => {
  const swaps: SwapSuggestion[] = [];
  const flagsStr = icmrFlags.join(' ').toLowerCase();
  const hasHighRiskAdditives = additives.some(a => a.risk === 'High');

  if (flagsStr.includes('sugar') || flagsStr.includes('beverage')) {
    swaps.push({
      trigger: 'High Added Sugar / Artificial Sweeteners',
      alternative: 'Fresh Coconut Water, Nimbu Paani (Lemonade with Jaggery), or Chaas (Buttermilk)',
      benefit: 'Natural electrolytes, zero refined sugar spikes, and better hydration.'
    });
  }
  if (flagsStr.includes('maida') || flagsStr.includes('refined wheat flour')) {
    swaps.push({
      trigger: 'Refined Wheat Flour (Maida)',
      alternative: 'Millet Cookies (Ragi/Jowar), Baked Multigrain Khakhra, or Roasted Makhana',
      benefit: 'High dietary fiber, essential micronutrients, and sustained energy.'
    });
  }
  if (flagsStr.includes('sodium') || flagsStr.includes('saturated fat') || flagsStr.includes('palm oil')) {
    swaps.push({
      trigger: 'High Sodium / Palm Oil / Saturated Fat',
      alternative: 'Roasted Chana (Chickpeas), Mixed Nuts & Seeds, or Baked Ragi Chips',
      benefit: 'Heart-healthy plant-based protein, good fats, and lower sodium content.'
    });
  }
  if (hasHighRiskAdditives || flagsStr.includes('synthetic color') || flagsStr.includes('tartrazine')) {
    swaps.push({
      trigger: 'Harmful Synthetic Additives / Colors',
      alternative: 'Traditional Homemade Snacks or Clean-Label Organic Indian Brands',
      benefit: 'Zero artificial azo dyes, no chemical preservatives, and pure ingredients.'
    });
  }

  if (swaps.length === 0) {
    swaps.push({
      trigger: 'General Maintenance',
      alternative: 'Whole seasonal fruits, sprouts, or traditional homemade bites',
      benefit: 'Maximum natural vitamins, minerals, and overall vitality.'
    });
  }

  return swaps;
};

export const checkAllergenProfile = (product: any, profile: string) => {
  const warnings: string[] = [];
  const ingredients = (product?.ingredients_text || product?.ingredients_text_en || '').toLowerCase();
  const nutriments = product?.nutriments || {};
  const sugar = nutriments['sugars_100g'] || 0;

  if (profile === 'Diabetic-Friendly' && (sugar > 5 || ingredients.includes('sugar') || ingredients.includes('syrup') || ingredients.includes('aspartame'))) {
    warnings.push(`🔴 Diabetic Alert: Contains notable sugar (${sugar.toFixed(1)}g/100g) or sweeteners that may spike blood glucose.`);
  }
  if (profile === 'Vegan' && (ingredients.includes('milk') || ingredients.includes('butter') || ingredients.includes('honey') || ingredients.includes('whey') || ingredients.includes('casein'))) {
    warnings.push(`🔴 Vegan Alert: Contains dairy or animal-derived ingredients (milk/butter/whey/honey).`);
  }
  if (profile === 'Jain' && (ingredients.includes('onion') || ingredients.includes('garlic') || ingredients.includes('potato') || ingredients.includes('carrot') || ingredients.includes('ginger'))) {
    warnings.push(`🔴 Jain Alert: Contains root vegetables, onion, or garlic.`);
  }
  if (profile === 'Gluten-Free' && (ingredients.includes('wheat') || ingredients.includes('maida') || ingredients.includes('barley') || ingredients.includes('malt') || ingredients.includes('maida'))) {
    warnings.push(`🔴 Gluten-Free Alert: Contains wheat, maida, or gluten derivatives.`);
  }
  if (profile === 'Nut Allergy' && (ingredients.includes('peanut') || ingredients.includes('almond') || ingredients.includes('cashew') || ingredients.includes('nut') || ingredients.includes('soy'))) {
    warnings.push(`🔴 Allergen Alert: Contains peanuts, tree nuts, or soy derivatives.`);
  }

  if (warnings.length === 0) {
    warnings.push(`🟢 Safe for ${profile}: No direct conflict detected with your selected profile.`);
  }

  return warnings;
};
