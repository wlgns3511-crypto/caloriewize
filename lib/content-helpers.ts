/**
 * content-helpers.ts — caloriewize HCU 5-chunk patch (2026-04-28).
 *
 * Reusable formatters and slug-hash variant pickers shared across
 * food-facts.ts, food-commentary.ts, food-cluster-insights.ts, and the
 * page files.
 *
 * Pattern source: nameblooms lib/name-commentary.ts (canonical).
 * Adapted for the food/nutrition domain (no SSA-specific phrasing).
 *
 * RATIONALE — slug-hash rotation:
 *   The same slug always renders the same variant across rebuilds (idempotent
 *   for indexing), but corpus-wide N variants are used → defeats template
 *   detection. Google sees N copies, not 1 with parameter-stuffing.
 */

/** Frequency phrase: "1 in every N" with sensible rounding by magnitude. */
export function oneInEveryN(pct: number | null | undefined): string {
  if (!pct || pct <= 0) return 'fewer than 1 in 200,000';
  const oneIn = Math.round(1 / pct);
  if (oneIn <= 200) return `roughly 1 in every ${oneIn}`;
  if (oneIn <= 2_000) return `roughly 1 in every ${Math.round(oneIn / 10) * 10}`;
  if (oneIn <= 20_000) return `roughly 1 in every ${Math.round(oneIn / 100) * 100}`;
  return `roughly 1 in every ${Math.round(oneIn / 1_000) * 1_000}`;
}

/** Relative phrase: "X is N× more/less than Y" or null when ratio is too small to mention. */
export function ratioPhrase(myVal: number, theirVal: number, theirName: string): string | null {
  if (!myVal || !theirVal || theirVal <= 0) return null;
  const ratio = myVal / theirVal;
  if (ratio >= 1.5) return `about ${ratio.toFixed(1)}× more than ${theirName}`;
  if (ratio <= 0.67) return `about ${(1 / ratio).toFixed(1)}× less than ${theirName}`;
  return `about the same as ${theirName}`;
}

/** English article based on first letter. */
export function aOrAn(word: string): string {
  if (!word) return 'a';
  const first = word[0].toLowerCase();
  return 'aeiou'.includes(first) ? 'an' : 'a';
}

/**
 * Slug-hash variant selector. Same key always → same option, but corpus-wide
 * we cycle through all options. Defeats template detection because Google
 * sees N variants, not 1 with parameter-stuffing.
 *
 * @param key - slug or page key (deterministic input)
 * @param options - candidate variants
 * @param salt - optional salt to rotate variants per insight slot, so two
 *               adjacent slots on the same page don't collide
 */
export function pickVariant<T>(key: string, options: readonly T[], salt = 0): T {
  if (!options.length) throw new Error('pickVariant: empty options');
  let h = salt;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

/** Format integer counts with locale separators (e.g. 12345 → "12,345"). */
export function fmtCount(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return '—';
  return Math.round(n).toLocaleString('en-US');
}

/** Format a fraction as percentage: 0.123 → "12.3%". */
export function fmtPct(p: number | null | undefined, digits = 1): string {
  if (p == null || !isFinite(p)) return '—';
  return `${(p * 100).toFixed(digits)}%`;
}

/** Format nutrition values with units: (8.0, "g") → "8.0 g". */
export function fmtNutrient(v: number | null | undefined, unit: string, digits = 1): string {
  if (v == null || !isFinite(v)) return '—';
  return `${v.toFixed(digits)} ${unit}`;
}

/** Ordinal suffix: 1 → "1st", 2 → "2nd", 21 → "21st". */
export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Round to N decimal places, returning a Number (not string). */
export function roundTo(n: number, digits = 1): number {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}

/** Title-case a slug: "dairy-and-egg" → "Dairy And Egg". */
export function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Bucket a numeric value into a percentile band label.
 *   ≥0.95 → "top 5%"
 *   ≥0.90 → "top 10%"
 *   ≥0.75 → "top quartile"
 *   ≥0.50 → "above median"
 *   ≥0.25 → "below median"
 *   else  → "bottom quartile"
 */
export function percentileBand(p: number | null | undefined): string {
  if (p == null || !isFinite(p)) return 'unranked';
  if (p >= 0.95) return 'top 5%';
  if (p >= 0.90) return 'top 10%';
  if (p >= 0.75) return 'top quartile';
  if (p >= 0.50) return 'above median';
  if (p >= 0.25) return 'below median';
  return 'bottom quartile';
}
