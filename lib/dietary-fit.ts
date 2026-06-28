/**
 * Dietary-fit lens (PSU 5-bucket per-100-g classifier).
 *
 * Each bucket cites a USDA / FDA / NIH document. No arbitrary cutoffs:
 *  - Mediterranean-style → USDA-HHS DGA 2020-2025, Healthy Mediterranean-Style
 *    Pattern (Appendix 2). Sat-fat <10% kcal target proxied per-100-g via FDA
 *    21 CFR §101.62 "low saturated fat" claim (≤1 g per RACC; 100 g for solid
 *    foods).
 *  - Ketogenic-clinical → NIH NCBI StatPearls "Ketogenic Diet" — operational
 *    threshold "<10% calories from carbohydrate" applied per-100-g.
 *  - Minimally-processed → USDA FoodData Central category mapping to Monteiro
 *    2019 NOVA Group 1/2 (single-ingredient laboratory or analytical samples).
 *  - Low-sodium-FDA → 21 CFR §101.61(b)(4)(ii) "Low sodium" claim (≤140 mg
 *    per RACC; 100 g for solid foods).
 *  - DASH-style → NIH NHLBI DASH Eating Plan (NIH Pub. No. 06-4082). DASH-7
 *    food groups + per-100-g proxies of the daily sat-fat 6 % and sodium
 *    2300 mg targets via FDA 21 CFR §101.62 + §101.61.
 */

export type DietPattern =
  | 'mediterranean-style'
  | 'ketogenic-clinical'
  | 'minimally-processed'
  | 'low-sodium-fda'
  | 'dash-style';

export const DIET_PATTERN_LABEL: Record<DietPattern, string> = {
  'mediterranean-style': 'Mediterranean-Style (USDA-HHS DGA)',
  'ketogenic-clinical': 'Ketogenic, clinical (NIH NCBI)',
  'minimally-processed': 'Minimally-processed (USDA FDC + NOVA)',
  'low-sodium-fda': 'Low-sodium (FDA labelling)',
  'dash-style': 'DASH-Style (NIH NHLBI)',
};

export interface PatternCitation {
  source: string;
  url: string;
  spec: string;
}

export const DIET_PATTERN_CITATION: Record<DietPattern, PatternCitation> = {
  'mediterranean-style': {
    source: 'USDA-HHS Dietary Guidelines for Americans 2020-2025 (Appendix 2: Healthy Mediterranean-Style Pattern)',
    url: 'https://www.dietaryguidelines.gov/sites/default/files/2021-03/Dietary_Guidelines_for_Americans-2020-2025.pdf',
    spec: 'Food groups: vegetables, fruits, whole grains, low-fat dairy, seafood, legumes, nuts, oils, herbs/spices. Sat-fat <10 % calories daily target proxied per-100-g via FDA 21 CFR §101.62 (≤1 g sat-fat/100 g).',
  },
  'ketogenic-clinical': {
    source: 'NIH National Center for Biotechnology Information — StatPearls, Ketogenic Diet',
    url: 'https://www.ncbi.nlm.nih.gov/books/NBK499830/',
    spec: 'Carbohydrate calories <10 % of total calories. Operational per-100-g check: carbs × 4 kcal/g < kcal × 0.10.',
  },
  'minimally-processed': {
    source: 'USDA FoodData Central + Monteiro 2019 NOVA classification (cited in NIH publications)',
    url: 'https://fdc.nal.usda.gov/data-documentation.html',
    spec: 'NOVA Group 1/2 — single-ingredient or culinary-ingredient categories (fruits, vegetables, raw meat/fish/dairy/eggs, whole grains, legumes, nuts/seeds, herbs/spices, fats/oils).',
  },
  'low-sodium-fda': {
    source: 'FDA 21 CFR §101.61(b)(4)(ii) — "Low sodium" claim',
    url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-D/section-101.61',
    spec: 'Sodium ≤140 mg per Reference Amount Customarily Consumed. For 100 g RACC solid foods, equals ≤140 mg per 100 g.',
  },
  'dash-style': {
    source: 'NIH NHLBI Dietary Approaches to Stop Hypertension (DASH) Eating Plan (NIH Pub. No. 06-4082)',
    url: 'https://www.nhlbi.nih.gov/education/dash-eating-plan',
    spec: 'DASH food groups: fruits, vegetables, low-fat dairy, whole grains, lean poultry/fish, legumes/nuts/seeds. Daily targets sat-fat 6 % calories + sodium 2300 mg proxied per-100-g via FDA 21 CFR §101.62 (≤1 g sat-fat) + §101.61 (≤140 mg sodium).',
  },
};

/**
 * USDA FoodData Central category → Monteiro 2019 NOVA Group inference.
 * Used by both `classifyDietaryFits` and the food-classifier tier engine.
 *
 * NOVA 1 — unprocessed / minimally-processed: single-ingredient laboratory
 * or analytical samples (raw produce, grains, raw meat/fish/dairy/eggs).
 * NOVA 2 — processed culinary ingredient: fats/oils, refined sugars (latter
 * not separately broken out as a USDA category; lumped under sweets/NOVA 4).
 * NOVA 3 — processed food: single-ingredient modification (cured meats,
 * cooked breakfast cereals, breads).
 * NOVA 4 — ultra-processed: industrial formulation (fast foods, snacks,
 * sweets, ready meals, baby foods, branded beverages).
 */
const CATEGORY_TO_NOVA: Record<string, 1 | 2 | 3 | 4> = {
  'fruits-and-fruit-juices': 1,
  'vegetables-and-vegetable-products': 1,
  'legumes-and-legume-products': 1,
  'nut-and-seed-products': 1,
  'cereal-grains-and-pasta': 1,
  'dairy-and-egg-products': 1,
  'beef-products': 1,
  'pork-products': 1,
  'poultry-products': 1,
  'lamb-veal-and-game-products': 1,
  'finfish-and-shellfish-products': 1,
  'spices-and-herbs': 1,
  'fats-and-oils': 2,
  'baked-products': 3,
  'breakfast-cereals': 3,
  'sausages-and-luncheon-meats': 3,
  'soups-sauces-and-gravies': 3,
  'fast-foods': 4,
  'restaurant-foods': 4,
  'meals-entrees-and-side-dishes': 4,
  'snacks': 4,
  'sweets': 4,
  'baby-foods': 4,
  'beverages': 4,
  'american-indianalaska-native-foods': 1,
};

export function inferNovaFromCategory(category: string | null): 1 | 2 | 3 | 4 | null {
  if (!category) return null;
  return CATEGORY_TO_NOVA[category] ?? null;
}

const MEDITERRANEAN_CATEGORIES = new Set<string>([
  'vegetables-and-vegetable-products',
  'fruits-and-fruit-juices',
  'finfish-and-shellfish-products',
  'legumes-and-legume-products',
  'nut-and-seed-products',
  'dairy-and-egg-products',
  'cereal-grains-and-pasta',
  'fats-and-oils',
  'spices-and-herbs',
]);

const DASH_CATEGORIES = new Set<string>([
  'vegetables-and-vegetable-products',
  'fruits-and-fruit-juices',
  'finfish-and-shellfish-products',
  'poultry-products',
  'legumes-and-legume-products',
  'nut-and-seed-products',
  'dairy-and-egg-products',
  'cereal-grains-and-pasta',
]);

export interface FoodPatternInputs {
  category: string | null;
  calories: number | null;
  carbs: number | null;
  saturated_fat: number | null;
  sodium: number | null;
}

export function classifyDietaryFits(food: FoodPatternInputs): DietPattern[] {
  const fits: DietPattern[] = [];
  const cat = food.category ?? '';
  const cals = food.calories ?? 0;
  const carbs = food.carbs ?? 0;
  const satFat = food.saturated_fat;
  const sodium = food.sodium;

  // FDA 21 CFR §101.62 "low saturated fat" claim: ≤1 g per RACC.
  const lowSatFat = satFat != null && satFat <= 1;
  // FDA 21 CFR §101.61 "low sodium" claim: ≤140 mg per RACC.
  const lowSodium = sodium != null && sodium <= 140;

  // 1. Mediterranean-Style (USDA-HHS DGA Healthy Mediterranean-Style Pattern)
  if (MEDITERRANEAN_CATEGORIES.has(cat) && lowSatFat) {
    fits.push('mediterranean-style');
  }

  // 2. Ketogenic-clinical (NIH NCBI StatPearls — <10% calories from carbs)
  if (cals > 0 && carbs * 4 < cals * 0.10) {
    fits.push('ketogenic-clinical');
  }

  // 3. Minimally-processed (USDA FDC + Monteiro NOVA 1/2)
  const nova = inferNovaFromCategory(cat);
  if (nova === 1 || nova === 2) {
    fits.push('minimally-processed');
  }

  // 4. Low-sodium-FDA (21 CFR §101.61)
  if (lowSodium) {
    fits.push('low-sodium-fda');
  }

  // 5. DASH-Style (NHLBI DASH Eating Plan + per-100-g FDA proxies)
  if (DASH_CATEGORIES.has(cat) && lowSatFat && lowSodium) {
    fits.push('dash-style');
  }

  return fits;
}

export function getCarryingPatternsNarrative(foodName: string, fits: DietPattern[]): string {
  if (fits.length === 0) {
    return `${foodName} does not meet the per-100-g thresholds for any of the five published dietary patterns surfaced on this site. Patterns are daily-or-weekly aggregates: a single food failing a per-100-g cut does not exclude it from a balanced plan, and a single food clearing one does not endorse it as a regular staple.`;
  }
  if (fits.length === 1) {
    return `${foodName} carries one of five published dietary patterns at the per-100-g level: ${DIET_PATTERN_LABEL[fits[0]]}. Each pattern has its own daily or weekly target — single-food fit is one signal toward the pattern, not a recommendation.`;
  }
  const labels = fits.map((f) => DIET_PATTERN_LABEL[f]).join(', ');
  return `${foodName} carries ${fits.length} of five published dietary patterns at the per-100-g level: ${labels}. Multi-pattern fit suggests a versatile staple at the row level; daily and weekly target work still happens at the meal-pattern aggregate, not per food.`;
}
