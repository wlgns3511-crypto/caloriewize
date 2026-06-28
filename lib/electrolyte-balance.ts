/**
 * electrolyte-balance.ts — descriptive sodium-to-potassium (Na:K) balance +
 * under-surfaced micronutrient %DV classification for /food/[slug]/.
 *
 * Why this module exists
 * ----------------------
 * The food row carries sodium AND potassium (plus vitamin C / calcium / iron),
 * but the page only ever showed them as raw mg in the Full Nutrition Facts
 * table: the %DV breakdown stops at cholesterol, and the two electrolytes were
 * never related to each other. The single most evidence-backed thing you can
 * say with both numbers is their RATIO — the dietary Na:K ratio that the WHO,
 * AHA, and US Dietary Guidelines treat as a better blood-pressure signal than
 * sodium alone, because dietary potassium offsets sodium. No food database or
 * label surfaces it as a per-food verdict.
 *
 * This decoder composes:
 *   1. Na:K molar ratio + a WHO-anchored 4-band classification
 *   2. the four under-surfaced micronutrients (potassium, vitamin C, calcium,
 *      iron) as FDA "good / excellent source" classifications (21 CFR §101.54)
 *
 * Honesty boundary
 * ----------------
 * Descriptive only — no clinical claim, no "eat this for your blood pressure."
 * Pure deterministic over the static USDA row. Sodium with no potassium datum
 * routes to an honest UNKNOWN rather than a divide-by-zero or a fabricated band.
 *
 * Sources: USDA FoodData Central (the mg values), FDA Daily Value + 21 CFR
 * §101.54 source-claim thresholds, WHO/US-DGA dietary Na:K guidance.
 */
import type { Food } from './db';

// Atomic masses for the molar conversion (Na 22.99, K 39.10 g/mol). The WHO
// dietary target is usually stated as a MOLAR ratio ≤ 1; converting from the
// mg values requires dividing each by its atomic mass.
const NA_ATOMIC = 22.99;
const K_ATOMIC = 39.1;

// FDA Daily Values (mg) — same constants the page's %DV breakdown uses.
const DV = { potassium: 4700, vitamin_c: 90, calcium: 1300, iron: 18 } as const;

export type NaKBand = 'potassium-rich' | 'balanced' | 'sodium-leaning' | 'sodium-heavy' | 'unknown';

export const NAK_BAND_LABEL: Record<NaKBand, string> = {
  'potassium-rich': 'Potassium-rich',
  balanced: 'Balanced',
  'sodium-leaning': 'Sodium-leaning',
  'sodium-heavy': 'Sodium-heavy',
  unknown: 'Not enough data',
};

export const NAK_BAND_TONE: Record<NaKBand, { bg: string; border: string; text: string; bar: string }> = {
  'potassium-rich': { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', bar: 'bg-emerald-500' },
  balanced: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-900', bar: 'bg-sky-500' },
  'sodium-leaning': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', bar: 'bg-amber-500' },
  'sodium-heavy': { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-900', bar: 'bg-rose-500' },
  unknown: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', bar: 'bg-slate-400' },
};

export type SourceClass = 'excellent' | 'good' | null;

export interface MicronutrientReading {
  nutrient: string;
  valueMg: number;
  dv: number;
  percentDV: number;
  /** FDA 21 CFR §101.54 per-100g: ≥20% DV = excellent, 10-19% = good. */
  sourceClass: SourceClass;
}

export interface ElectrolyteReading {
  band: NaKBand;
  bandLabel: string;
  tone: { bg: string; border: string; text: string; bar: string };
  sodiumMg: number | null;
  potassiumMg: number | null;
  /** Na:K molar ratio (null when potassium is missing/zero). */
  molarRatio: number | null;
  /** Na:K mass ratio (mg/mg) — shown alongside molar for transparency. */
  massRatio: number | null;
  /** True when the molar ratio meets the WHO ≤1 target. */
  meetsWhoTarget: boolean;
  micronutrients: MicronutrientReading[];
  /** Micronutrients the food is a good/excellent source of (for the rollup). */
  sourceHighlights: { nutrient: string; sourceClass: SourceClass }[];
  /** Answer-first descriptive verdict (non-clinical). */
  verdict: string;
}

function classifySource(percentDV: number): SourceClass {
  if (percentDV >= 20) return 'excellent';
  if (percentDV >= 10) return 'good';
  return null;
}

function classifyBand(molar: number | null): NaKBand {
  if (molar === null) return 'unknown';
  if (molar < 0.5) return 'potassium-rich';
  if (molar < 1.0) return 'balanced';
  if (molar < 2.0) return 'sodium-leaning';
  return 'sodium-heavy';
}

function micronutrient(name: string, value: number | null, dv: number): MicronutrientReading | null {
  if (value === null || !Number.isFinite(value)) return null;
  const percentDV = Math.round((value / dv) * 100);
  return { nutrient: name, valueMg: value, dv, percentDV, sourceClass: classifySource(percentDV) };
}

function fmtMolar(n: number): string {
  if (n > 0 && n < 0.05) return '<0.05';
  return n.toFixed(n < 1 ? 2 : 1);
}

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

export function decodeElectrolyteBalance(food: Food): ElectrolyteReading {
  const sodiumMg = food.sodium;
  const potassiumMg = food.potassium;

  const molarRatio =
    sodiumMg !== null && potassiumMg !== null && potassiumMg > 0
      ? (sodiumMg / NA_ATOMIC) / (potassiumMg / K_ATOMIC)
      : null;
  const massRatio =
    sodiumMg !== null && potassiumMg !== null && potassiumMg > 0 ? sodiumMg / potassiumMg : null;

  const band = classifyBand(molarRatio);
  const meetsWhoTarget = molarRatio !== null && molarRatio <= 1;

  const micronutrients = [
    micronutrient('Potassium', food.potassium, DV.potassium),
    micronutrient('Vitamin C', food.vitamin_c, DV.vitamin_c),
    micronutrient('Calcium', food.calcium, DV.calcium),
    micronutrient('Iron', food.iron, DV.iron),
  ].filter((m): m is MicronutrientReading => m !== null);

  const sourceHighlights = micronutrients
    .filter((m) => m.sourceClass !== null)
    .map((m) => ({ nutrient: m.nutrient, sourceClass: m.sourceClass }));

  // ── answer-first verdict (descriptive, non-clinical) ──────────────────────
  const sentences: string[] = [];
  if (band === 'unknown') {
    sentences.push(
      `${food.name} does not have a reported potassium value, so a sodium-to-potassium ratio cannot be computed from the USDA data.`,
    );
  } else {
    const targetClause = meetsWhoTarget
      ? `at or below the WHO dietary target of 1`
      : `above the WHO dietary target of 1`;
    sentences.push(
      `${food.name} has a sodium-to-potassium molar ratio of ${fmtMolar(molarRatio!)} (${sodiumMg!.toFixed(0)} mg sodium to ${potassiumMg!.toFixed(0)} mg potassium per 100 g) — ${targetClause}, which is why it reads as ${NAK_BAND_LABEL[band].toLowerCase()}.`,
    );
  }

  const excellent = sourceHighlights.filter((s) => s.sourceClass === 'excellent').map((s) => s.nutrient.toLowerCase());
  const good = sourceHighlights.filter((s) => s.sourceClass === 'good').map((s) => s.nutrient.toLowerCase());
  if (excellent.length || good.length) {
    const parts: string[] = [];
    if (excellent.length) parts.push(`an excellent source of ${joinList(excellent)}`);
    if (good.length) parts.push(`a good source of ${joinList(good)}`);
    sentences.push(`Per 100 g it is ${joinList(parts)} (FDA source thresholds).`);
  } else {
    sentences.push(`Per 100 g it does not clear the FDA "good source" threshold (10% DV) for potassium, vitamin C, calcium, or iron.`);
  }
  sentences.push(`Descriptive nutrition context only — not clinical or blood-pressure advice.`);

  return {
    band,
    bandLabel: NAK_BAND_LABEL[band],
    tone: NAK_BAND_TONE[band],
    sodiumMg,
    potassiumMg,
    molarRatio,
    massRatio,
    meetsWhoTarget,
    micronutrients,
    sourceHighlights,
    verdict: sentences.join(' '),
  };
}

/**
 * variableMeasured entries (PropertyValue[]) for Dataset/Nutrition JSON-LD.
 * Surfaces the Na:K band + ratio + any source highlights.
 */
export function electrolyteVariableMeasured(reading: ElectrolyteReading): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [
    {
      '@type': 'PropertyValue',
      name: 'SodiumPotassiumBalance',
      value: reading.bandLabel,
      description:
        reading.molarRatio !== null
          ? `Na:K molar ratio ${fmtMolar(reading.molarRatio)} (WHO dietary target ≤ 1)`
          : 'Potassium value unavailable',
    },
  ];
  if (reading.molarRatio !== null) {
    out.push({
      '@type': 'PropertyValue',
      name: 'SodiumToPotassiumMolarRatio',
      value: Number(reading.molarRatio.toFixed(2)),
      unitText: 'ratio',
    });
  }
  for (const m of reading.sourceHighlights) {
    out.push({
      '@type': 'PropertyValue',
      name: `${m.sourceClass === 'excellent' ? 'ExcellentSource' : 'GoodSource'}`,
      value: m.nutrient,
    });
  }
  return out;
}

/** Short band label for an optional title/heading use (kept ≤ a few words). */
export function nakBandShort(reading: ElectrolyteReading): string {
  return reading.bandLabel;
}

/** Exposed for scripts/audit-phase7.ts cohort sweep + the ranked-list query. */
export { classifyBand, classifySource, NA_ATOMIC, K_ATOMIC, DV as ELECTROLYTE_DV };
