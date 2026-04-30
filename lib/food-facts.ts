/**
 * food-facts.ts — caloriewize HCU 5-chunk patch (Layer 1).
 *
 * Pure SQL → derived facts for use by food-commentary.ts and the
 * /food/[slug]/, /category/[slug]/, /list/[type]/ pages.
 *
 * Pattern source: nameblooms lib/name-facts.ts.
 *
 * All queries are read-only and execute at build time (SSG). To keep the
 * 2,589-food prerender from N²-scanning, per-(category, column) sorted
 * arrays are cached on first access and percentiles are computed via
 * binary search.
 */

import Database from 'better-sqlite3';
import path from 'path';
import type { Food } from './db';

const DB_PATH = path.join(process.cwd(), 'data', 'food.db');
let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export interface CategoryStats {
  category: string;
  count: number;
  calMean: number; calMedian: number; calP90: number;
  proteinMean: number; proteinMedian: number; proteinP90: number;
  fiberMean: number; fiberMedian: number; fiberP90: number;
  sugarMean: number; sugarMedian: number; sugarP90: number;
  sodiumMean: number; sodiumMedian: number; sodiumP90: number;
}

export interface PercentileBundle {
  caloriesPct: number | null;     // 0..1; higher = more calories than peers
  proteinPct: number | null;
  fiberPct: number | null;
  sugarPct: number | null;
  sodiumPct: number | null;
  satFatPct: number | null;
  cholesterolPct: number | null;
  vitaminCPct: number | null;
  calciumPct: number | null;
  ironPct: number | null;
  potassiumPct: number | null;
}

/** 12 buckets — mutually exclusive, evaluated in order (most distinctive wins). */
export type FoodStatus =
  | 'high_protein_low_cal'
  | 'protein_powerhouse'
  | 'fiber_rich'
  | 'vitamin_c_powerhouse'
  | 'mineral_rich'
  | 'balanced_macro'
  | 'calorie_dense_indulgent'
  | 'sodium_heavy'
  | 'sugar_heavy'
  | 'sat_fat_heavy'
  | 'ultra_low_cal'
  | 'everyday_moderate';

export interface FoodFacts {
  category: string | null;
  pct: PercentileBundle;
  catStats: CategoryStats | null;
  status: FoodStatus;
  /** Cross-category peer with similar calories (different category). */
  crossPeer: { name: string; slug: string; calories: number; category: string } | null;
  /** Same-category peer with HIGHER calories (closest above). */
  catPeerHigher: { name: string; slug: string; calories: number } | null;
  /** Same-category peer with LOWER calories (closest below). */
  catPeerLower: { name: string; slug: string; calories: number } | null;
  /** How many 100-g servings to reach a 2,000 kcal day. */
  servingsToDay: number | null;
  /** Calories share of macros: protein/carb/fat as fractions of energy. */
  macroSplit: { proteinPct: number; carbPct: number; fatPct: number } | null;
}

// ──────────────────────────────────────────────────────────────────
// Cached per-(category, column) sorted arrays for fast percentile
// ──────────────────────────────────────────────────────────────────

const _columnSortCache = new Map<string, number[]>();
function getSortedColumn(category: string, column: string): number[] {
  const key = `${category}|${column}`;
  const hit = _columnSortCache.get(key);
  if (hit) return hit;
  const rows = getDb().prepare(
    `SELECT ${column} AS v FROM foods WHERE category = ? AND ${column} IS NOT NULL`,
  ).all(category) as { v: number }[];
  const arr = rows.map((r) => r.v).filter((v) => isFinite(v)).sort((a, b) => a - b);
  _columnSortCache.set(key, arr);
  return arr;
}

function percentileInCategory(category: string, column: string, value: number): number | null {
  const arr = getSortedColumn(category, column);
  if (!arr.length) return null;
  // binary search: first index whose value >= `value` → count of strictly smaller items.
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo / arr.length;
}

// ──────────────────────────────────────────────────────────────────
// Category aggregate stats
// ──────────────────────────────────────────────────────────────────

const _statsCache = new Map<string, CategoryStats | null>();
export function getCategoryStats(category: string): CategoryStats | null {
  if (_statsCache.has(category)) return _statsCache.get(category)!;
  const rows = getDb().prepare(`
    SELECT calories, protein, fiber, sugar, sodium
    FROM foods
    WHERE category = ?
      AND calories IS NOT NULL
  `).all(category) as { calories: number; protein: number | null; fiber: number | null; sugar: number | null; sodium: number | null }[];

  if (!rows.length) { _statsCache.set(category, null); return null; }

  const stats = (vals: (number | null)[]) => {
    const xs = vals.filter((v): v is number => v != null && isFinite(v)).sort((a, b) => a - b);
    if (!xs.length) return { mean: 0, median: 0, p90: 0 };
    const sum = xs.reduce((s, x) => s + x, 0);
    const mean = sum / xs.length;
    const median = xs[Math.floor(xs.length / 2)];
    const p90 = xs[Math.floor(xs.length * 0.9)] ?? xs[xs.length - 1];
    return { mean, median, p90 };
  };

  const cal = stats(rows.map((r) => r.calories));
  const protein = stats(rows.map((r) => r.protein));
  const fiber = stats(rows.map((r) => r.fiber));
  const sugar = stats(rows.map((r) => r.sugar));
  const sodium = stats(rows.map((r) => r.sodium));

  const out: CategoryStats = {
    category, count: rows.length,
    calMean: cal.mean, calMedian: cal.median, calP90: cal.p90,
    proteinMean: protein.mean, proteinMedian: protein.median, proteinP90: protein.p90,
    fiberMean: fiber.mean, fiberMedian: fiber.median, fiberP90: fiber.p90,
    sugarMean: sugar.mean, sugarMedian: sugar.median, sugarP90: sugar.p90,
    sodiumMean: sodium.mean, sodiumMedian: sodium.median, sodiumP90: sodium.p90,
  };
  _statsCache.set(category, out);
  return out;
}

// ──────────────────────────────────────────────────────────────────
// Per-food percentiles
// ──────────────────────────────────────────────────────────────────

export function getPercentiles(food: Food): PercentileBundle {
  const empty: PercentileBundle = {
    caloriesPct: null, proteinPct: null, fiberPct: null, sugarPct: null,
    sodiumPct: null, satFatPct: null, cholesterolPct: null,
    vitaminCPct: null, calciumPct: null, ironPct: null, potassiumPct: null,
  };
  if (!food.category) return empty;
  const c = food.category;
  return {
    caloriesPct:    food.calories != null      ? percentileInCategory(c, 'calories', food.calories) : null,
    proteinPct:     food.protein != null       ? percentileInCategory(c, 'protein', food.protein) : null,
    fiberPct:       food.fiber != null         ? percentileInCategory(c, 'fiber', food.fiber) : null,
    sugarPct:       food.sugar != null         ? percentileInCategory(c, 'sugar', food.sugar) : null,
    sodiumPct:      food.sodium != null        ? percentileInCategory(c, 'sodium', food.sodium) : null,
    satFatPct:      food.saturated_fat != null ? percentileInCategory(c, 'saturated_fat', food.saturated_fat) : null,
    cholesterolPct: food.cholesterol != null   ? percentileInCategory(c, 'cholesterol', food.cholesterol) : null,
    vitaminCPct:    food.vitamin_c != null     ? percentileInCategory(c, 'vitamin_c', food.vitamin_c) : null,
    calciumPct:     food.calcium != null       ? percentileInCategory(c, 'calcium', food.calcium) : null,
    ironPct:        food.iron != null          ? percentileInCategory(c, 'iron', food.iron) : null,
    potassiumPct:   food.potassium != null     ? percentileInCategory(c, 'potassium', food.potassium) : null,
  };
}

// ──────────────────────────────────────────────────────────────────
// Status classification
// ──────────────────────────────────────────────────────────────────

export function classifyFood(food: Food, pct: PercentileBundle): FoodStatus {
  const cal = food.calories ?? 0;
  const protein = food.protein ?? 0;
  const fiber = food.fiber ?? 0;
  const sugar = food.sugar ?? 0;
  const sodium = food.sodium ?? 0;
  const satFat = food.saturated_fat ?? 0;
  const vitC = food.vitamin_c ?? 0;
  const potassium = food.potassium ?? 0;
  const calcium = food.calcium ?? 0;
  const iron = food.iron ?? 0;

  // Most distinctive markers first.

  // Ultra-low cal (water-rich / leafy). DV 100 g rule of thumb < 30 kcal.
  if (cal > 0 && cal < 30) return 'ultra_low_cal';

  // High protein + low cal (lean choice — single most-clicked health frame)
  if (protein >= 15 && cal <= 150) return 'high_protein_low_cal';

  // Protein powerhouse — top decile in category and ≥18 g/100 g absolute.
  if ((pct.proteinPct ?? 0) >= 0.9 && protein >= 18) return 'protein_powerhouse';

  // Fiber rich — DV is 28 g, "good source" ≥ 5 g/100 g.
  if (fiber >= 6 || ((pct.fiberPct ?? 0) >= 0.9 && fiber >= 3)) return 'fiber_rich';

  // Vitamin C — DV 90 mg, "good source" ≥ 9 mg / "excellent" ≥ 18 mg.
  if (vitC >= 45 || ((pct.vitaminCPct ?? 0) >= 0.9 && vitC >= 18)) return 'vitamin_c_powerhouse';

  // Mineral-rich: top decile of K/Ca/Fe with non-trivial absolute value.
  if (
    ((pct.calciumPct ?? 0) >= 0.9 && calcium >= 100) ||
    ((pct.ironPct ?? 0) >= 0.9 && iron >= 2) ||
    ((pct.potassiumPct ?? 0) >= 0.9 && potassium >= 350)
  ) return 'mineral_rich';

  // Sodium heavy: ≥ 600 mg/100 g (DV is 2300 mg).
  if (sodium >= 600) return 'sodium_heavy';

  // Sugar heavy: ≥ 15 g/100 g (DV is 50 g).
  if (sugar >= 15) return 'sugar_heavy';

  // Saturated fat heavy: ≥ 5 g/100 g (DV is 20 g).
  if (satFat >= 5) return 'sat_fat_heavy';

  // Calorie-dense + low protein → indulgent
  if (cal >= 300 && protein < 8) return 'calorie_dense_indulgent';

  // Balanced macros (within mid-cal range, no macro <20% of calories)
  if (cal >= 100 && cal <= 350) {
    const pCal = protein * 4;
    const cCal = (food.carbs ?? 0) * 4;
    const fCal = (food.fat ?? 0) * 9;
    const totalMacro = pCal + cCal + fCal;
    if (totalMacro > 0) {
      const pPct = pCal / totalMacro;
      const cPct = cCal / totalMacro;
      const fPct = fCal / totalMacro;
      if (pPct >= 0.20 && cPct >= 0.20 && fPct >= 0.20) return 'balanced_macro';
    }
  }

  return 'everyday_moderate';
}

// ──────────────────────────────────────────────────────────────────
// Peer queries
// ──────────────────────────────────────────────────────────────────

function getCrossPeer(food: Food): FoodFacts['crossPeer'] {
  if (food.calories == null || !food.category) return null;
  const r = getDb().prepare(`
    SELECT name, slug, calories, category
    FROM foods
    WHERE slug != ?
      AND category IS NOT NULL
      AND category != ?
      AND calories IS NOT NULL
    ORDER BY ABS(calories - ?), fdc_id
    LIMIT 1
  `).get(food.slug, food.category, food.calories) as { name: string; slug: string; calories: number; category: string } | undefined;
  return r ?? null;
}

function getCatPeerHigher(food: Food): { name: string; slug: string; calories: number } | null {
  if (food.calories == null || !food.category) return null;
  const r = getDb().prepare(`
    SELECT name, slug, calories
    FROM foods
    WHERE slug != ? AND category = ? AND calories > ?
    ORDER BY calories ASC
    LIMIT 1
  `).get(food.slug, food.category, food.calories) as { name: string; slug: string; calories: number } | undefined;
  return r ?? null;
}

function getCatPeerLower(food: Food): { name: string; slug: string; calories: number } | null {
  if (food.calories == null || !food.category) return null;
  const r = getDb().prepare(`
    SELECT name, slug, calories
    FROM foods
    WHERE slug != ? AND category = ? AND calories < ? AND calories > 0
    ORDER BY calories DESC
    LIMIT 1
  `).get(food.slug, food.category, food.calories) as { name: string; slug: string; calories: number } | undefined;
  return r ?? null;
}

// ──────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────

export function getFoodFacts(food: Food): FoodFacts {
  const pct = getPercentiles(food);
  const catStats = food.category ? getCategoryStats(food.category) : null;
  const status = classifyFood(food, pct);

  const cal = food.calories ?? 0;
  const servingsToDay = cal > 0 ? Math.round(2000 / cal) : null;

  let macroSplit: FoodFacts['macroSplit'] = null;
  const pCal = (food.protein ?? 0) * 4;
  const cCal = (food.carbs ?? 0) * 4;
  const fCal = (food.fat ?? 0) * 9;
  const totalMacro = pCal + cCal + fCal;
  if (totalMacro > 0) {
    macroSplit = {
      proteinPct: pCal / totalMacro,
      carbPct: cCal / totalMacro,
      fatPct: fCal / totalMacro,
    };
  }

  return {
    category: food.category,
    pct,
    catStats,
    status,
    crossPeer: getCrossPeer(food),
    catPeerHigher: getCatPeerHigher(food),
    catPeerLower: getCatPeerLower(food),
    servingsToDay,
    macroSplit,
  };
}
