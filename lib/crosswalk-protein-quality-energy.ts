/**
 * Phase 7 P0 — Protein-Quality Energy Tier (PQE).
 *
 * Cross-walks four authoritative inputs to produce a per-food verdict that
 * no single source publishes:
 *
 *   1. USDA FoodData Central (fdc.nal.usda.gov) — per-100g macro composition.
 *   2. FDA Daily Value reference table (fda.gov) — DV-budget position for
 *      energy and protein at the 2,000-kcal anchor.
 *   3. FAO/WHO DIAAS (fao.org, WHO Report 92) — protein-quality class by
 *      food category (animal ≥100, dairy ~100, soy ~90, legumes ~70,
 *      grains ~50, plant-low ~40). Per-food DIAAS is not published for
 *      most foods; the category-class proxy is the conventional fallback
 *      used in dietary-policy work.
 *   4. Atwater General Factors System (USDA-ARS, 1916; public-domain
 *      methodology) — 4-4-9 kcal/g coherence check. Computes
 *      expected_kcal = 4*carbs + 4*protein + 9*fat and flags any food
 *      whose USDA-reported calories differ from the macro-implied figure
 *      by > 15%. Real cases: fortified beverages (added kcal from
 *      polyols/alcohol), fiber-rich foods (fiber counted as carb but
 *      providing ~2 kcal/g), alcoholic beverages (ethanol at 7 kcal/g).
 *
 * Why this is a real cross-walk (not Phase 6 PSU repackaged):
 *  - Phase 6 decoders (interpretFood, classifyDietaryFits, food-facts) are all
 *    derived from USDA FDC variables alone — T-P0-1 (same-publisher) would
 *    fail if treated as P0.
 *  - PQE adds three independent publishers/methodologies. AI Overview answers
 *    "X has Y calories" by mirroring NutritionIX or USDA — it does not
 *    compose DIAAS class lookup with Atwater coherence per food (T-Q2 pass).
 *
 * Output verdict band lives in title (P1) and entity body (P0 surface).
 */

export type PQEBand =
  | "HIGH_QUALITY_LEAN"
  | "HIGH_QUALITY_DENSE"
  | "LOW_QUALITY_LEAN"
  | "ENERGY_DOMINANT"
  | "COHERENCE_FLAGGED"
  | "UNKNOWN";

export type DIAASClass =
  | "excellent" // ≥100 — animal protein, dairy
  | "good" // 75-99 — soy, quinoa, buckwheat
  | "limited" // 50-74 — legumes, oats
  | "poor" // <50 — most grains, vegetables, fruits, fats
  | "not-applicable"; // beverages, sweets, fats-and-oils (protein-trivial)

export interface PQEReading {
  band: PQEBand;
  /** Human-readable label e.g. "High-quality lean protein". */
  label: string;
  /** Compact label for title slot (≤16 chars). */
  titleLabel: string;
  /** USDA per-100g calories (input). */
  calories: number;
  /** USDA per-100g protein in g (input). */
  protein: number;
  /** USDA per-100g carbs in g (input). */
  carbs: number;
  /** USDA per-100g fat in g (input). */
  fat: number;
  /** DIAAS class assigned from food category. */
  diaasClass: DIAASClass;
  /** Atwater-computed expected kcal from 4-4-9 (carbs/protein/fat). */
  expectedKcal: number;
  /** |observed - expected| / observed. Used to flag coherence outliers. */
  coherenceRatio: number;
  /** Protein as % of total energy (P-kcal / total-kcal). */
  proteinEnergyPct: number;
  /** FDA-DV position for calorie load at 2,000-kcal anchor (per 100g). */
  energyDvPct: number;
  /** Body blurb (entity-level prose). */
  blurb: string;
  /** Caveat for COHERENCE_FLAGGED foods. */
  coherenceCaveat: string | null;
  /** Source citations (visible in body). */
  sourceCitations: string[];
}

/**
 * DIAAS protein-quality class by USDA FDC category. Per-food DIAAS is only
 * published for a handful of foods (FAO/WHO Report 92 + subsequent literature);
 * the category-class proxy is what dietary-policy and food-engineering work
 * uses when per-food DIAAS isn't available. Mapping rationale documented per
 * category — re-tune if FAO publishes a per-food expansion.
 */
const CATEGORY_DIAAS_CLASS: Record<string, DIAASClass> = {
  // Animal protein: ≥100 DIAAS (whey ~125, egg ~118, beef ~112, chicken ~108).
  "beef-products": "excellent",
  "poultry-products": "excellent",
  "pork-products": "excellent",
  "lamb-veal-and-game-products": "excellent",
  "finfish-and-shellfish-products": "excellent",
  "sausages-and-luncheon-meats": "excellent",
  "dairy-and-egg-products": "excellent",
  // Soy + nuts/seeds mixed bag, average to "good" (~75-95).
  "nut-and-seed-products": "good",
  // Legumes: DIAAS ~55-75 depending on processing (chickpea ~58, pea protein
  // isolate ~92 — but raw legume entries in USDA dominate, so "limited").
  "legumes-and-legume-products": "limited",
  // Grain products: rice ~59, wheat ~40, oats ~57 — limited→poor band.
  "cereal-grains-and-pasta": "limited",
  "breakfast-cereals": "limited",
  "baked-products": "poor",
  // Plant-low: vegetables, fruits, fats — protein-trivial.
  "vegetables-and-vegetable-products": "poor",
  "fruits-and-fruit-juices": "poor",
  "spices-and-herbs": "poor",
  // Protein-trivial / not-applicable: beverages, sweets, oils have so little
  // protein the DIAAS class is meaningless. Tier them by energy alone.
  "fats-and-oils": "not-applicable",
  "sweets": "not-applicable",
  "beverages": "not-applicable",
  // Mixed-composition categories: classify by majority-protein-source typical.
  "snacks": "poor",
  "fast-foods": "good",
  "restaurant-foods": "good",
  "meals-entrees-and-side-dishes": "good",
  "soups-sauces-and-gravies": "limited",
  "baby-foods": "limited",
  "american-indianalaska-native-foods": "good",
};

/**
 * High-protein threshold — protein as % of total energy. ≥25% is the
 * conventional "protein-forward" cutoff used by FDA "high-protein" claim
 * rules (≥20% DV per RACC) and by sports-nutrition literature for muscle-
 * protein-synthesis sufficiency.
 */
const HIGH_PROTEIN_ENERGY_PCT = 25;

/**
 * Lean vs dense calorie threshold per 100g. The FDA "low-calorie" food
 * threshold is 40 kcal/serving at the per-RACC level; per 100g, the
 * conventional dietetic boundary between "lean" (water/fiber-dominant) and
 * "energy-dense" foods sits around 200 kcal/100g.
 */
const LEAN_DENSE_KCAL_BOUNDARY = 200;

/** Atwater coherence tolerance. Beyond 15% drift → coherence flag. */
const COHERENCE_TOLERANCE = 0.15;

/** FDA daily-value anchor for total energy. */
const FDA_DV_ENERGY_KCAL = 2000;

function bandLabels(band: PQEBand): { full: string; title: string } {
  switch (band) {
    case "HIGH_QUALITY_LEAN":
      return { full: "High-quality lean protein", title: "HQ lean" };
    case "HIGH_QUALITY_DENSE":
      return { full: "High-quality dense protein", title: "HQ dense" };
    case "LOW_QUALITY_LEAN":
      return { full: "Lean, low protein", title: "Lean light" };
    case "ENERGY_DOMINANT":
      return { full: "Energy-dominant", title: "Energy-dom" };
    case "COHERENCE_FLAGGED":
      return { full: "Macro/kcal coherence flagged", title: "kcal check" };
    case "UNKNOWN":
      return { full: "Insufficient data for tier", title: "—" };
  }
}

function classFor(category: string | null | undefined): DIAASClass {
  if (!category) return "not-applicable";
  return CATEGORY_DIAAS_CLASS[category] ?? "poor";
}

export function decodeProteinQualityEnergy(args: {
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  foodName: string;
}): PQEReading {
  const { foodName } = args;
  const calories = args.calories;
  const protein = args.protein ?? 0;
  const carbs = args.carbs ?? 0;
  const fat = args.fat ?? 0;
  if (
    calories == null ||
    !Number.isFinite(calories) ||
    calories < 0 ||
    (calories === 0 && protein === 0 && carbs === 0 && fat === 0)
  ) {
    return {
      band: "UNKNOWN",
      label: "Insufficient data for tier",
      titleLabel: "—",
      calories: calories ?? 0,
      protein,
      carbs,
      fat,
      diaasClass: classFor(args.category),
      expectedKcal: 0,
      coherenceRatio: 0,
      proteinEnergyPct: 0,
      energyDvPct: 0,
      blurb: `Insufficient macro data to compute a Protein-Quality Energy tier for ${foodName}.`,
      coherenceCaveat: null,
      sourceCitations: defaultCitations(),
    };
  }

  const diaasClass = classFor(args.category);
  const expectedKcal = 4 * carbs + 4 * protein + 9 * fat;
  const coherenceRatio =
    calories > 0 ? Math.abs(calories - expectedKcal) / calories : 0;
  const proteinKcal = 4 * protein;
  const proteinEnergyPct =
    calories > 0 ? (proteinKcal / calories) * 100 : 0;
  const energyDvPct = (calories / FDA_DV_ENERGY_KCAL) * 100;

  // Coherence flag takes precedence — flagging the underlying composition
  // mismatch matters more than slotting the food into a quality tier whose
  // inputs we cannot reconcile.
  let band: PQEBand;
  if (coherenceRatio > COHERENCE_TOLERANCE && calories >= 25) {
    band = "COHERENCE_FLAGGED";
  } else {
    const isProteinForward =
      proteinEnergyPct >= HIGH_PROTEIN_ENERGY_PCT &&
      (diaasClass === "excellent" || diaasClass === "good");
    const isLean = calories < LEAN_DENSE_KCAL_BOUNDARY;
    if (isProteinForward && isLean) band = "HIGH_QUALITY_LEAN";
    else if (isProteinForward && !isLean) band = "HIGH_QUALITY_DENSE";
    else if (!isProteinForward && isLean) band = "LOW_QUALITY_LEAN";
    else band = "ENERGY_DOMINANT";
  }
  const labels = bandLabels(band);

  const blurb = buildBlurb({
    foodName,
    band,
    calories,
    protein,
    proteinEnergyPct,
    diaasClass,
    expectedKcal,
    coherenceRatio,
    energyDvPct,
  });

  const coherenceCaveat =
    band === "COHERENCE_FLAGGED"
      ? `Caveat: the USDA-reported ${calories.toFixed(0)} kcal/100g for ${foodName} differs by ` +
        `${(coherenceRatio * 100).toFixed(0)}% from the Atwater 4-4-9 prediction ` +
        `(${expectedKcal.toFixed(0)} kcal/100g from ${carbs.toFixed(1)}g carbs, ` +
        `${protein.toFixed(1)}g protein, ${fat.toFixed(1)}g fat). Common causes: ` +
        `alcohol (7 kcal/g, not in the 4-4-9 system), fiber accounted at 2 kcal/g rather ` +
        `than 4, polyols, or fortification.`
      : null;

  return {
    band,
    label: labels.full,
    titleLabel: labels.title,
    calories,
    protein,
    carbs,
    fat,
    diaasClass,
    expectedKcal,
    coherenceRatio,
    proteinEnergyPct,
    energyDvPct,
    blurb,
    coherenceCaveat,
    sourceCitations: defaultCitations(),
  };
}

function buildBlurb(args: {
  foodName: string;
  band: PQEBand;
  calories: number;
  protein: number;
  proteinEnergyPct: number;
  diaasClass: DIAASClass;
  expectedKcal: number;
  coherenceRatio: number;
  energyDvPct: number;
}): string {
  const {
    foodName,
    band,
    calories,
    protein,
    proteinEnergyPct,
    diaasClass,
    energyDvPct,
  } = args;
  const proteinShare = proteinEnergyPct.toFixed(0);
  const dvShare = energyDvPct.toFixed(1);
  const classPhrase = diaasClassPhrase(diaasClass);
  switch (band) {
    case "HIGH_QUALITY_LEAN":
      return (
        `${foodName} delivers ${protein.toFixed(1)} g of ${classPhrase} protein per 100 g — ` +
        `${proteinShare}% of its ${calories.toFixed(0)} kcal energy load comes from protein, ` +
        `and the food sits below the 200 kcal/100g lean boundary. ` +
        `Energy load is ${dvShare}% of the FDA 2,000-kcal daily anchor.`
      );
    case "HIGH_QUALITY_DENSE":
      return (
        `${foodName} carries ${protein.toFixed(1)} g of ${classPhrase} protein per 100 g ` +
        `(${proteinShare}% of ${calories.toFixed(0)} kcal from protein), but the overall ` +
        `energy density (${dvShare}% of the FDA daily anchor per 100 g) is above the lean ` +
        `boundary — pair with leaner accompaniments if controlling total kcal intake.`
      );
    case "LOW_QUALITY_LEAN":
      return (
        `${foodName} is lean (${calories.toFixed(0)} kcal/100g, ${dvShare}% of the FDA daily ` +
        `anchor) but protein delivery is modest (${proteinShare}% of energy from ` +
        `${classPhrase} protein). Useful as a low-calorie volume food rather than as a ` +
        `primary protein source.`
      );
    case "ENERGY_DOMINANT":
      return (
        `${foodName} is energy-dense (${calories.toFixed(0)} kcal/100g, ${dvShare}% of the ` +
        `FDA daily anchor) with limited protein contribution — ${proteinShare}% of energy ` +
        `comes from ${classPhrase} protein. Treat as a fat- or carb-forward food rather ` +
        `than a protein source.`
      );
    case "COHERENCE_FLAGGED":
      return (
        `${foodName}'s reported calories diverge from the Atwater 4-4-9 prediction. The ` +
        `tier is suppressed until the underlying composition is reviewed.`
      );
    case "UNKNOWN":
      return `Insufficient macro data to tier ${foodName}.`;
  }
}

function diaasClassPhrase(c: DIAASClass): string {
  switch (c) {
    case "excellent":
      return "high-quality (DIAAS ≥100, animal-class)";
    case "good":
      return "good-quality (DIAAS 75-99, soy/nut-class)";
    case "limited":
      return "limited-quality (DIAAS 50-74, legume/grain-class)";
    case "poor":
      return "low-quality (DIAAS <50, plant-class)";
    case "not-applicable":
      return "trivial-protein";
  }
}

function defaultCitations(): string[] {
  return [
    "USDA FoodData Central (fdc.nal.usda.gov) — per-100g macro values",
    "U.S. Food and Drug Administration — Daily Value reference table (fda.gov)",
    "FAO/WHO Expert Consultation on Protein Quality — DIAAS, Report 92 (fao.org)",
    "Atwater General Factors System — USDA-ARS 4-4-9 methodology (public domain)",
  ];
}

/** Compact label for P1 title slot (≤10 chars). */
export function pqeTitleVerdict(band: PQEBand): string {
  return bandLabels(band).title;
}
