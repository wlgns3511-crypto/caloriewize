import compareKeepList from "./generated/compare-keep.json";

// HCU 2026-04-24: single source of truth = scripts/build-keep-sets.ts output.
// That script emits top-250 DB slice (popularity_score DESC) + GSC evidence
// union (20 URLs earning ≥1 click in 2026-03-24 ~ 2026-04-21 window).
//
// Importing the generated JSON keeps middleware (edge-safe, can't touch
// better-sqlite3) and page.tsx (SSG generateStaticParams) perfectly in sync.
// Rebuild via `npx tsx scripts/build-keep-sets.ts` before any deploy.
export const STATIC_COMPARISON_SLUGS: string[] = compareKeepList as string[];

export const STATIC_COMPARISON_SET: Set<string> = new Set(STATIC_COMPARISON_SLUGS);

export function toCanonicalComparisonSlug(slugA: string, slugB: string): string {
  return [slugA, slugB].sort().join("-vs-");
}

export function isValidComparePair(slugA: string, slugB: string): boolean {
  return STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(slugA, slugB));
}
