/**
 * CalorieWize site-specific levers (Phase 6 v6.4).
 *
 * Deterministic classifiers over public USDA FoodData Central rows + the
 * FDA labeling reference. Each lever is pure: same input → same output.
 * Each classifier maps to its FDA / FAO / NOVA source — output strings
 * are surfaced on food pages, list pages, and the methodology page.
 *
 * The unique "thin-site escape" angle: we do not invent proprietary
 * "health scores." We expose verifiable classifications grounded in
 * published reference values (FDA %DV thresholds, Atwater factors, DIAAS
 * quality scores from peer-reviewed literature, NOVA processing groups).
 */

// --- Lever 1: FDA %DV Tier ----------------------------------------------------
// FDA's own front-of-pack guidance: 5% DV or less = LOW; 20% DV or more = HIGH.
// Used on food pages to label individual nutrient values.

export type DvTier = 'low' | 'moderate' | 'high';

export const DV_TIER_LABEL: Record<DvTier, string> = {
  low: '5% or less (FDA: low)',
  moderate: '5–20% (FDA: moderate)',
  high: '20% or more (FDA: high)',
};

export function classifyDvTier(percent: number): DvTier {
  if (percent <= 5) return 'low';
  if (percent >= 20) return 'high';
  return 'moderate';
}

// --- Lever 2: Macro Profile Tier ---------------------------------------------
// Deterministic diet-compatibility tags derived from per-100g macro profile
// using widely-published thresholds. Same thresholds as the methodology page.

export interface MacroProfile {
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  sodium: number | null; // mg per 100g
}

export const MACRO_TAGS = {
  KETO: 'keto-compatible',
  HIGH_PROTEIN: 'high-protein',
  LOW_CALORIE: 'low-calorie',
  ULTRA_LOW_CALORIE: 'ultra-low-calorie',
  HIGH_FIBER: 'high-fiber',
  LOW_SODIUM: 'low-sodium',
  LOW_CARB: 'low-carb',
} as const;

export function classifyMacroProfile(food: MacroProfile): string[] {
  const tags: string[] = [];
  const cals = food.calories ?? 0;
  const carbs = food.carbs ?? 0;
  const protein = food.protein ?? 0;
  const fiber = food.fiber ?? 0;
  const sodium = food.sodium ?? 0;

  // Keto: under ~10% calories from carbs (cals * 0.10 / 4 g/kcal)
  if (cals > 0 && carbs * 4 < cals * 0.1) tags.push(MACRO_TAGS.KETO);
  // High-protein: ≥15g per 100g (~20% calories from protein at typical density)
  if (protein >= 15) tags.push(MACRO_TAGS.HIGH_PROTEIN);
  // Low-calorie: under 100 kcal per 100g
  if (cals > 0 && cals < 100) tags.push(MACRO_TAGS.LOW_CALORIE);
  // Ultra-low-calorie: under 50 kcal per 100g
  if (cals > 0 && cals < 50) tags.push(MACRO_TAGS.ULTRA_LOW_CALORIE);
  // High-fiber: ≥5g per 100g (FDA "good source" threshold ≈ 2.5g, "high" ≈ 5g)
  if (fiber >= 5) tags.push(MACRO_TAGS.HIGH_FIBER);
  // Low-sodium: under 140 mg per 100g (FDA labeling threshold)
  if (sodium > 0 && sodium < 140) tags.push(MACRO_TAGS.LOW_SODIUM);
  // Low-carb: under 10g per 100g
  if (carbs < 10) tags.push(MACRO_TAGS.LOW_CARB);

  return tags;
}

// --- Lever 3: DIAAS Protein Quality Tier -------------------------------------
// Digestible Indispensable Amino Acid Score (FAO 2013 standard, replacing
// PDCAAS). Quality bands per FAO: ≥1.0 excellent, 0.75–1.0 good, <0.75 lower.
// Reference values are from published FAO/WHO and recent peer-reviewed
// literature; we map by USDA food category, not per-row (DIAAS is not a USDA
// field — it is a derived classification surfaced from reference data).

export type DiaasTier = 'excellent' | 'good' | 'lower' | 'unrated';

export const DIAAS_TIER_LABEL: Record<DiaasTier, string> = {
  excellent: 'Excellent (DIAAS ≥ 1.0 — FAO)',
  good: 'Good (DIAAS 0.75–1.0 — FAO)',
  lower: 'Lower (DIAAS < 0.75 — FAO; complement with another protein)',
  unrated: 'Unrated by FAO',
};

const DIAAS_BY_CATEGORY: Record<string, DiaasTier> = {
  // Excellent (≥1.0)
  'dairy-and-egg-products': 'excellent',
  'beef-products': 'excellent',
  'pork-products': 'excellent',
  'lamb-veal-and-game-products': 'excellent',
  'poultry-products': 'excellent',
  'finfish-and-shellfish-products': 'excellent',
  'sausages-and-luncheon-meats': 'excellent',
  // Good (0.75–1.0): soy and pea
  'legumes-and-legume-products': 'good',
  // Lower (<0.75): cereals, most other plant foods
  'cereal-grains-and-pasta': 'lower',
  'breakfast-cereals': 'lower',
  'baked-products': 'lower',
  'nut-and-seed-products': 'lower',
  'vegetables-and-vegetable-products': 'lower',
  'fruits-and-fruit-juices': 'lower',
};

export function classifyProteinQuality(categorySlug: string | null): DiaasTier {
  if (!categorySlug) return 'unrated';
  return DIAAS_BY_CATEGORY[categorySlug] ?? 'unrated';
}

// --- Lever 4: NOVA Processing Tier --------------------------------------------
// NOVA classification system (Monteiro et al., U São Paulo). Maps USDA
// FoodData Central data types onto NOVA groups 1–4. Surfaced to give readers
// a published-systematic processing-tier label rather than an opaque "health
// score."

export type NovaGroup = 1 | 2 | 3 | 4 | null;

export const NOVA_LABEL: Record<NonNullable<NovaGroup>, string> = {
  1: 'NOVA 1 — Unprocessed or minimally processed',
  2: 'NOVA 2 — Processed culinary ingredient',
  3: 'NOVA 3 — Processed food (single-ingredient modification)',
  4: 'NOVA 4 — Ultra-processed (industrial formulation)',
};

const NOVA_BY_USDA_DATA_TYPE: Record<string, NonNullable<NovaGroup>> = {
  foundation_food: 1,
  sr_legacy_food: 1,
  survey_fndds_food: 3, // FNDDS captures as-consumed mixed dishes
  branded_food: 4, // Branded label data is largely industrial
  experimental_food: 1,
};

export function classifyNovaTier(usdaDataType: string | null): NovaGroup {
  if (!usdaDataType) return null;
  return NOVA_BY_USDA_DATA_TYPE[usdaDataType] ?? null;
}

// --- Lever 5: Atwater Factor Reconciler ---------------------------------------
// Tells the reader whether the calorie value on a USDA row is computed by the
// general 4-9-4 Atwater factors or by food-specific factors. Both are valid
// but the food-specific path is more accurate for fibrous and high-fat foods
// (almonds, avocado, nuts). We surface this on food pages so readers can see
// which calculation path applied.

export type AtwaterMethod = 'general-4-9-4' | 'food-specific' | 'unknown';

export const ATWATER_LABEL: Record<AtwaterMethod, string> = {
  'general-4-9-4': 'General factors (4 cal/g protein, 9 cal/g fat, 4 cal/g carb)',
  'food-specific': 'Food-specific factors (Atwater specific)',
  unknown: 'Method not declared in USDA row',
};

export function reconcileAtwater(
  calories: number | null,
  protein: number | null,
  fat: number | null,
  carbs: number | null,
): AtwaterMethod {
  if (calories == null || protein == null || fat == null || carbs == null) return 'unknown';
  const general = protein * 4 + fat * 9 + carbs * 4;
  if (general === 0 && calories === 0) return 'unknown';
  const ratio = calories / Math.max(general, 1);
  // Within ±3% of general factors → general; otherwise food-specific
  if (ratio > 0.97 && ratio < 1.03) return 'general-4-9-4';
  return 'food-specific';
}
