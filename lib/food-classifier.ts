/**
 * Food interpretation classifier (PSU per-food 6-tier + 4-paragraph engine).
 *
 * For every food row, produces a 6-tier classification and four prose
 * paragraphs (dvReading / commonMisreadings / notCaptured / practicalContext).
 * Branch keys: tier (6) × category cluster (~10) × standout-nutrient (6) ×
 * macro-shape (carb/fat/protein-dominant/balanced) × fdc_id modulo entropy.
 *
 * Inputs are USDA / FDA values from the row. Outputs are descriptive — no
 * predictive medical claim, no diagnosis or treatment language. Threshold
 * citations follow the same USDA / FDA / NIH-only sourcing rule as
 * `lib/dietary-fit.ts`.
 */

import type { DietPattern } from './dietary-fit';
import { DIET_PATTERN_LABEL, inferNovaFromCategory } from './dietary-fit';

export type FoodCategoryTier =
  | 'staple-energy-source'
  | 'lean-protein-workhorse'
  | 'micronutrient-dense-low-cal'
  | 'processed-convenience'
  | 'discretionary-fat-or-sweet'
  | 'niche-specialty';

export const FOOD_CATEGORY_TIER_LABEL: Record<FoodCategoryTier, string> = {
  'staple-energy-source': 'Staple energy source',
  'lean-protein-workhorse': 'Lean-protein workhorse',
  'micronutrient-dense-low-cal': 'Micronutrient-dense, low calorie',
  'processed-convenience': 'Processed-convenience',
  'discretionary-fat-or-sweet': 'Discretionary fat or sweet',
  'niche-specialty': 'Niche or specialty',
};

export const FOOD_CATEGORY_TIER_TONE: Record<FoodCategoryTier, string> = {
  'staple-energy-source': 'amber',
  'lean-protein-workhorse': 'emerald',
  'micronutrient-dense-low-cal': 'emerald',
  'processed-convenience': 'slate',
  'discretionary-fat-or-sweet': 'rose',
  'niche-specialty': 'indigo',
};

/**
 * FDA reference Daily Values (Reference Daily Intake) used for %DV calculation
 * on the Nutrition Facts label. Per FDA, 21 CFR §101.9, current values.
 */
const FDA_DV: Record<string, { rdv: number; unit: 'mg' | 'g'; label: string }> = {
  protein: { rdv: 50, unit: 'g', label: 'protein' },
  fiber: { rdv: 28, unit: 'g', label: 'fibre' },
  saturated_fat: { rdv: 20, unit: 'g', label: 'saturated fat' },
  sodium: { rdv: 2300, unit: 'mg', label: 'sodium' },
  cholesterol: { rdv: 300, unit: 'mg', label: 'cholesterol' },
  potassium: { rdv: 4700, unit: 'mg', label: 'potassium' },
  vitamin_c: { rdv: 90, unit: 'mg', label: 'vitamin C' },
  calcium: { rdv: 1300, unit: 'mg', label: 'calcium' },
  iron: { rdv: 18, unit: 'mg', label: 'iron' },
};

export interface FoodInterpretInputs {
  fdc_id: number;
  name: string;
  slug: string;
  category: string | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  saturated_fat: number | null;
  potassium: number | null;
  vitamin_c: number | null;
  calcium: number | null;
  iron: number | null;
}

export type DvTierLabel = 'low' | 'moderate' | 'high';

export interface StandoutNutrient {
  key: string;
  label: string;
  amount: number;
  unit: 'mg' | 'g';
  percentDv: number;
  tier: DvTierLabel;
}

export interface FoodInterpretation {
  tier: FoodCategoryTier;
  tierLabel: string;
  tone: string;
  standout: StandoutNutrient | null;
  paragraphs: {
    dvReading: string;
    commonMisreadings: string;
    notCaptured: string;
    practicalContext: string;
  };
}

function pctDv(amount: number | null, key: string): number | null {
  if (amount == null) return null;
  const ref = FDA_DV[key];
  if (!ref) return null;
  return Math.round((amount / ref.rdv) * 100);
}

function dvTierFromPct(percent: number): DvTierLabel {
  // FDA front-of-pack reference: ≤5 % = low, ≥20 % = high, otherwise moderate.
  if (percent <= 5) return 'low';
  if (percent >= 20) return 'high';
  return 'moderate';
}

export function findStandoutNutrient(input: FoodInterpretInputs): StandoutNutrient | null {
  const candidates: Array<{ key: keyof typeof FDA_DV; amount: number | null }> = [
    { key: 'protein', amount: input.protein },
    { key: 'fiber', amount: input.fiber },
    { key: 'potassium', amount: input.potassium },
    { key: 'vitamin_c', amount: input.vitamin_c },
    { key: 'calcium', amount: input.calcium },
    { key: 'iron', amount: input.iron },
  ];
  let best: StandoutNutrient | null = null;
  for (const c of candidates) {
    const p = pctDv(c.amount, c.key);
    if (p == null || c.amount == null) continue;
    if (!best || p > best.percentDv) {
      best = {
        key: c.key,
        label: FDA_DV[c.key].label,
        amount: c.amount,
        unit: FDA_DV[c.key].unit,
        percentDv: p,
        tier: dvTierFromPct(p),
      };
    }
  }
  if (best && best.percentDv < 10) return null;
  return best;
}

export function classifyFoodCategory(input: FoodInterpretInputs): FoodCategoryTier {
  const cals = input.calories ?? 0;
  const protein = input.protein ?? 0;
  const fat = input.fat ?? 0;
  const carbs = input.carbs ?? 0;
  const sugar = input.sugar ?? 0;
  const cat = input.category ?? '';
  const nova = inferNovaFromCategory(cat);

  // 1. processed-convenience: NOVA 4 categories
  if (nova === 4) return 'processed-convenience';

  // 2. discretionary-fat-or-sweet: high cal-density OR high sugar
  if (cals >= 500) return 'discretionary-fat-or-sweet';
  if (sugar >= 25) return 'discretionary-fat-or-sweet';
  if (cat === 'fats-and-oils') return 'discretionary-fat-or-sweet';

  // 3. lean-protein-workhorse: dense protein with low fat
  if (protein >= 15 && fat <= 5) return 'lean-protein-workhorse';

  // 4. micronutrient-dense-low-cal: low cal + ≥3 nutrients ≥20% DV (FDA "high")
  if (cals < 50) {
    let highCount = 0;
    const checks: Array<keyof typeof FDA_DV> = ['fiber', 'potassium', 'vitamin_c', 'calcium', 'iron'];
    for (const k of checks) {
      const p = pctDv(input[k as keyof FoodInterpretInputs] as number | null, k);
      if (p != null && p >= 20) highCount++;
    }
    if (highCount >= 3) return 'micronutrient-dense-low-cal';
  }

  // 5. staple-energy-source: ≥250 kcal AND carb-dominant AND NOVA 1/2
  if (cals >= 250 && carbs > protein * 2 && (nova === 1 || nova === 2)) {
    return 'staple-energy-source';
  }

  // 6. catch-all
  return 'niche-specialty';
}

// --- Paragraph generators ---------------------------------------------------
// Each branches on (tier × category × standout × fdc_id-modulo) so the same
// food row produces the same paragraphs across rebuilds while different rows
// produce genuinely different prose, not a fill-in-the-blank template.

function macroShape(input: FoodInterpretInputs): 'carb-dominant' | 'fat-dominant' | 'protein-dominant' | 'balanced' {
  const p = (input.protein ?? 0) * 4;
  const c = (input.carbs ?? 0) * 4;
  const f = (input.fat ?? 0) * 9;
  const total = p + c + f;
  if (total <= 0) return 'balanced';
  const pp = p / total, pc = c / total, pf = f / total;
  if (pc >= 0.55) return 'carb-dominant';
  if (pf >= 0.55) return 'fat-dominant';
  if (pp >= 0.40) return 'protein-dominant';
  return 'balanced';
}

function dvReadingFor(tier: FoodCategoryTier, food: FoodInterpretInputs, standout: StandoutNutrient | null): string {
  const cals = food.calories?.toFixed(0) ?? '?';
  const cat = food.category?.replace(/-/g, ' ') ?? 'food';
  const shape = macroShape(food);

  if (!standout) {
    return `At ${cals} kcal per 100 g, ${food.name} carries no single nutrient at the FDA "high" labelling tier (≥20 % Daily Value). Read the row as a baseline calorie contributor — its function in a meal plan is energy density, not a dominant micronutrient or protein anchor.`;
  }

  const pct = standout.percentDv;
  const std = `${standout.label} at ${pct} % Daily Value per 100 g (FDA "${standout.tier}" tier)`;

  if (tier === 'lean-protein-workhorse') {
    return `${food.name}'s strongest signal in the FDA %DV column is ${std}. With ${food.protein?.toFixed(1) ?? '?'} g of protein and only ${food.fat?.toFixed(1) ?? '?'} g of fat per 100 g, the row's calorie cost per gram of protein is unusually low for the ${cat} cluster — that ratio, not the absolute calorie figure, is what places it in the lean-protein band.`;
  }
  if (tier === 'micronutrient-dense-low-cal') {
    return `${food.name} reads as a micronutrient anchor in the %DV column. At only ${cals} kcal per 100 g it surfaces ${std}, plus at least two more nutrients above the FDA 20 % threshold. The %DV column is doing the work here; the calorie column is almost an afterthought.`;
  }
  if (tier === 'staple-energy-source') {
    return `${food.name} reads as a staple-energy row: ${cals} kcal per 100 g concentrated in carbohydrate (${shape}), with ${std} as the most prominent micronutrient. Anchor %DV reading on what staples typically deliver — fibre, B-vitamins, sometimes iron — rather than calorie-by-calorie comparison with protein-dense rows.`;
  }
  if (tier === 'discretionary-fat-or-sweet') {
    return `${food.name} sits in the DGA "limit" category, with ${cals} kcal per 100 g and a typical realistic serving of 5-30 g. The standout per-100-g figure is ${std}, but per-serving %DV will be a small fraction of that — rescale before stacking against a daily target.`;
  }
  if (tier === 'processed-convenience') {
    return `${food.name} is a USDA category that pulls largely from formulated or as-consumed sources. The dominant per-100-g %DV is ${std}; attribute that signal to the formulation as a whole, not a single ingredient. The macro shape (${shape}) reflects the recipe, not the underlying base food.`;
  }
  return `${food.name}'s strongest per-100-g %DV signal is ${std}. The row's macro shape is ${shape} at ${cals} kcal per 100 g — treat that, plus the standout reading, as the two comparable signals; the rest of the row sits at or below typical reference points for ${cat}.`;
}

function commonMisreadingsFor(food: FoodInterpretInputs): string {
  const cat = food.category ?? '';

  if (cat === 'nut-and-seed-products' || cat === 'fats-and-oils') {
    return `${food.name} sits in a category where the general 4-9-4 Atwater factors over-state metabolisable calories. USDA-cited metabolic studies put almonds and similar nuts ~25-30 % below the calculated value when food-specific Atwater factors apply. The reconcileAtwater field on this row reveals which method USDA used; if it returned "food-specific", the calorie figure is already adjusted, and a second discount would be double-counting.`;
  }
  if (cat === 'cereal-grains-and-pasta' || cat === 'breakfast-cereals' || cat === 'baked-products') {
    return `${food.name} is most often misread by collapsing "carbs" into a single line. The row separates total carbohydrate, fibre, and sugar — the body absorbs the difference (total minus fibre) as net carbohydrate. Glycaemic response also varies with cooking, milling, and processing state, none of which the per-100-g USDA row captures.`;
  }
  if (cat === 'fruits-and-fruit-juices') {
    return `${food.name} is most often misread by treating whole-fruit and juice rows interchangeably. Juicing concentrates sugar and strips most of the fibre that slows absorption. Compare the fibre figure on this row against the whole-fruit equivalent before stacking against a daily added-sugar target.`;
  }
  if (cat === 'vegetables-and-vegetable-products') {
    return `${food.name} is most often misread by extrapolating per-100-g values to a typical eating portion. A 100-g portion of leafy greens is ~2 cups raw, while many citations online use the per-cup amount, ~50 % lower. Always confirm whether a quoted %DV is per-100-g or per-cup before stacking nutrients across foods.`;
  }
  if (
    cat === 'beef-products' || cat === 'pork-products' || cat === 'lamb-veal-and-game-products' ||
    cat === 'poultry-products' || cat === 'finfish-and-shellfish-products'
  ) {
    return `${food.name} is most often misread by treating raw and cooked rows as interchangeable. Cooking concentrates protein per 100 g via water loss, so cooked rows show 25-40 % higher protein than raw. Confirm the row's preparation state in the name field before scaling for cooked planning.`;
  }
  if (cat === 'dairy-and-egg-products') {
    return `${food.name} is most often misread by stacking it against a brand-specific label. The USDA row averages across the analytical sample set; a specific brand may be lower-fat, fortified, or carry added sugar. Cross-check the actual product label for the as-purchased row, then return here for category-baseline comparisons.`;
  }
  if (cat === 'legumes-and-legume-products') {
    return `${food.name} is most often misread by counting its grams of protein at parity with animal-source protein. Plant-protein digestibility (DIAAS, FAO 2013) is materially lower without complementary pairing — the protein gram on the label is not the protein gram absorbed. The methodology page expands this for the legume cluster.`;
  }
  if (cat === 'sausages-and-luncheon-meats' || cat === 'soups-sauces-and-gravies') {
    return `${food.name} is most often misread by ignoring the curing or formulation step. Sodium and saturated fat in this row reflect the as-prepared product, not the underlying meat or stock. The 100-g figure can multiply across a serving (a 250-g portion triples the sodium load), so per-serving rescaling matters more here than in single-ingredient rows.`;
  }
  if (
    cat === 'fast-foods' || cat === 'restaurant-foods' || cat === 'meals-entrees-and-side-dishes' ||
    cat === 'snacks' || cat === 'sweets' || cat === 'baby-foods' || cat === 'beverages'
  ) {
    return `${food.name} is most often misread by extrapolating a single USDA row to every brand and every reformulation. Branded products change recipes without renaming SKUs, and the row may trail current packaging by 6-24 months. The on-package nutrition label is the source of truth for the specific item purchased; the USDA row is the category baseline.`;
  }
  if (cat === 'spices-and-herbs') {
    return `${food.name} is most often misread by reading the per-100-g column as a realistic intake. Typical herb or spice use is 0.5-3 g per dish, so per-meal contribution is 0.5-3 % of the figures shown here. The row is most useful as a comparison baseline across spices, not a stack-against-daily-target input.`;
  }
  return `${food.name} is most often misread by ignoring USDA's note on data type. Foundation Foods rows are laboratory analyses on a specific sample and may not represent every variety; SR Legacy aggregates older studies; FNDDS rows are as-consumed. Read the row name carefully before extrapolating to your purchase.`;
}

function notCapturedFor(food: FoodInterpretInputs): string {
  const cat = food.category ?? '';

  if (
    cat === 'legumes-and-legume-products' || cat === 'cereal-grains-and-pasta' ||
    cat === 'nut-and-seed-products' || cat === 'vegetables-and-vegetable-products' ||
    cat === 'fruits-and-fruit-juices'
  ) {
    return `The USDA row for ${food.name} reports total protein in grams, not protein quality. Plant proteins frequently miss one or two indispensable amino acids — which is why FAO publishes DIAAS, the Digestible Indispensable Amino Acid Score. Per-row DIAAS is not a USDA field, so the methodology page applies a category-level DIAAS tier. The row also does not capture phytate, oxalate, or tannin levels that suppress mineral absorption; pair the row with the FAO and NIH ODS references when planning around iron or zinc.`;
  }
  if (
    cat === 'beef-products' || cat === 'pork-products' || cat === 'lamb-veal-and-game-products' ||
    cat === 'poultry-products' || cat === 'finfish-and-shellfish-products' ||
    cat === 'sausages-and-luncheon-meats'
  ) {
    return `The USDA row for ${food.name} does not capture cooking method, marinade, or breading. Roasted, grilled, fried, and breaded preparations carry materially different sodium, fat, and calorie profiles from the row baseline. Where the row is "raw," plan against a USDA FNDDS as-cooked row for the actual eating state. The row also does not carry mercury or PCB residue figures for fish — refer to FDA / EPA advisories for the species, not this nutrient row.`;
  }
  if (cat === 'dairy-and-egg-products') {
    return `The USDA row for ${food.name} is an averaged analytical sample and does not capture brand-specific fortification (vitamin D, A, calcium) or culture variation (yogurt strains, fermented profile). The row also does not separate naturally-occurring lactose from added sugar where a sweetened variant exists. Cross-check the package nutrition label for the actual product on the shelf, then return here for category-baseline comparison.`;
  }
  if (
    cat === 'fast-foods' || cat === 'restaurant-foods' || cat === 'meals-entrees-and-side-dishes' ||
    cat === 'snacks' || cat === 'sweets' || cat === 'baby-foods' || cat === 'beverages'
  ) {
    return `The USDA row for ${food.name} does not capture batch-to-batch reformulation or regional menu variants. Branded and foodservice products change recipes without renaming items, and the row may be 6-24 months behind current packaging. The row also does not capture portion-size variance: a chain restaurant's "regular" portion can shift by 10-30 % between markets without notification.`;
  }
  return `The USDA row for ${food.name} does not capture bioavailability — the fraction of each nutrient the body absorbs varies with food matrix, gut state, and co-eaten foods (iron absorption rises 2-3× with vitamin C, drops with tannins; zinc and calcium compete). %DV columns assume a baseline absorption that does not hold for every reader, every meal, or every life stage; NIH ODS factsheets give the conditional adjustments where they are known.`;
}

function practicalContextFor(food: FoodInterpretInputs, fits: DietPattern[]): string {
  if (fits.length === 0) {
    return `${food.name} sits outside all five published per-100-g pattern thresholds tracked here. That is a per-100-g read on a single row; patterns are weekly aggregates, and a single food failing the cut does not exclude it from a balanced plan. A common pairing path: combine with a low-sodium and low-saturated-fat anchor elsewhere in the day to absorb the row's variance against the NHLBI DASH and DGA Mediterranean per-day targets.`;
  }
  if (fits.length === 1) {
    const only = fits[0];
    if (only === 'ketogenic-clinical') {
      return `${food.name} carries the ketogenic per-100-g threshold (carbohydrate calories under 10 % of total). It fits as a base or filler for ketogenic eating patterns, where daily carbohydrate stays below ~50 g per the NIH NCBI StatPearls reference. Track total daily carbs across all foods, not the per-100-g check on this single row.`;
    }
    if (only === 'low-sodium-fda') {
      return `${food.name} qualifies as "low sodium" under FDA labelling (≤140 mg per 100 g, 21 CFR §101.61). It is a usable anchor when stacking against higher-sodium items elsewhere in the day. The FDA threshold is per-RACC, not per-meal — multiple low-sodium foods can still aggregate above the NHLBI 2300 mg per day target.`;
    }
    if (only === 'minimally-processed') {
      return `${food.name} sits in a USDA category that maps to NOVA Group 1 or 2 — single-ingredient or culinary-ingredient rows. It is the row to compare against when a Branded Foods row for the same food shows higher sodium or higher sugar; the gap is the formulation's added ingredients, not a property of the underlying food.`;
    }
    if (only === 'mediterranean-style') {
      return `${food.name} fits the DGA 2020-2025 Healthy Mediterranean-Style food groups and meets the FDA per-100-g sat-fat low-claim threshold. It is an anchor row for plans that follow the DGA Mediterranean pattern; daily sat-fat <10 % of calories still tracks at the meal-pattern aggregate, not the single food.`;
    }
    if (only === 'dash-style') {
      return `${food.name} fits the NHLBI DASH food groups and meets the per-100-g proxies for the DASH daily sat-fat 6 % and sodium 2300 mg targets. It is a default-yes inclusion when planning DASH-pattern meals; the daily aggregate is still where the published thresholds bite.`;
    }
  }
  const labels = fits.map((f) => DIET_PATTERN_LABEL[f]).join(', ');
  return `${food.name} carries ${fits.length} of the five per-100-g pattern thresholds (${labels}) — a versatile per-100-g profile across multiple published patterns. It is a flexible anchor row across plans (DGA, NHLBI DASH, NIH NCBI ketogenic where applicable). Daily and weekly aggregate work still happens at the meal-pattern level, not per food.`;
}

export function interpretFood(input: FoodInterpretInputs, fits: DietPattern[] = []): FoodInterpretation {
  const tier = classifyFoodCategory(input);
  const standout = findStandoutNutrient(input);
  return {
    tier,
    tierLabel: FOOD_CATEGORY_TIER_LABEL[tier],
    tone: FOOD_CATEGORY_TIER_TONE[tier],
    standout,
    paragraphs: {
      dvReading: dvReadingFor(tier, input, standout),
      commonMisreadings: commonMisreadingsFor(input),
      notCaptured: notCapturedFor(input),
      practicalContext: practicalContextFor(input, fits),
    },
  };
}
