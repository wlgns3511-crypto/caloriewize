#!/usr/bin/env tsx
/**
 * build-keep-sets.ts — HCU 2026-04-24 (caloriewize)
 *
 * Emits lib/generated/compare-keep.json consumed by BOTH
 *   - middleware.ts  (Edge runtime — cannot import better-sqlite3)
 *   - lib/compare-whitelist.ts  (page runtime, generateStaticParams)
 *
 * Cut: /compare/ 124,750 → top-250 by popularity_score + GSC evidence.
 *
 * Why middleware (not just dynamicParams=false):
 *   dynamicParams=false returns 404 via notFound(). That's a fuzzy signal.
 *   410 Gone is explicit deletion, accelerates deindex vs. Google's
 *   month-long 404 recrawl dance with the pre-prune sitemap cache.
 *
 * GSC evidence override (2026-03-24 ~ 2026-04-21, 20 URLs earning ≥1 click):
 *   degreewize/zippeek/guidebycity rescues proved algorithmic top-N keep-sets
 *   have 100% miss rate on GSC winners — they're long-tail by definition.
 *   Union prevents same damage pattern here. Food slugs may contain internal
 *   dashes so we iterate -vs- positions and accept the first split where BOTH
 *   halves resolve to foods in DB.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getTopComparisons, getFoodBySlug, getAllFoods } from '../lib/db';

const COMPARE_CAP = 250;

// GSC evidence — /compare/ URLs earning ≥1 click in 28d window per get_gsc_report.
const GSC_EVIDENCE_COMPARES = [
  'apricots-raw-vs-goji-berries-dried',
  'beef-ground-90-lean-meat-10-fat-raw-vs-beef-ground-93-lean-meat-7-fat-raw',
  'alcoholic-beverage-beer-light-higher-alcohol-vs-snacks-potato-chips-made-from-dried-potatoes-reduced-fat',
  'apricots-raw-vs-snacks-popcorn-air-popped',
  'babyfood-juice-pear-vs-rice-crackers',
  'barley-malt-flour-vs-millet-flour',
  'barley-pearled-raw-vs-eggs-grade-a-large-egg-whole',
  'beef-ground-80-lean-meat-20-fat-patty-cooked-broiled-vs-blueberries-dried-sweetened',
  'bread-pumpernickel-vs-bread-white-wheat',
  'bread-white-commercially-prepared-includes-soft-bread-crumbs-vs-rice-white-medium-grain-raw-unenriched',
  'carrabbas-italian-grill-spaghetti-with-meat-sauce-vs-seeds-breadnut-tree-seeds-dried',
  'cheese-low-sodium-cheddar-or-colby-vs-hummus-home-prepared',
  'cherry-juice-tart-vs-grapefruit-juice-white-canned-or-bottled-unsweetened',
  'chicken-broiler-rotisserie-bbq-wing-meat-and-skin-vs-lamb-variety-meats-and-by-products-lungs-raw',
  'cookies-oatmeal-reduced-fat-vs-crackers-saltines-low-salt-includes-oyster-soda-soup',
  'cookies-raisin-soft-type-vs-snacks-tortilla-chips-plain-white-corn-salted',
  'crackers-saltines-includes-oyster-soda-soup-vs-snacks-tortilla-chips-plain-white-corn-salted',
  'cucumber-peeled-raw-vs-onions-red-raw',
  'cucumber-with-peel-raw-vs-vinegar-balsamic',
  'fast-foods-breakfast-burrito-with-egg-cheese-and-sausage-vs-fish-tuna-light-canned-in-oil-drained-solids',
];

/**
 * Food slugs contain internal dashes (e.g. `beef-ground-90-lean-meat-10-fat-raw`).
 * Iterate every -vs- position in the raw slug and return canonical [a,b] sorted
 * at the first split where both halves resolve to a food row.
 */
function canonicaliseGscSlug(raw: string): string | null {
  const marker = '-vs-';
  let idx = raw.indexOf(marker);
  while (idx !== -1) {
    const a = raw.slice(0, idx);
    const b = raw.slice(idx + marker.length);
    if (getFoodBySlug(a) && getFoodBySlug(b)) {
      return [a, b].sort().join(marker);
    }
    idx = raw.indexOf(marker, idx + 1);
  }
  return null;
}

const OUT_DIR = path.resolve(__dirname, '..', 'lib', 'generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

// HCU 2026-05-04 — Bing impressions auto-union (separate index from Google).
const BING_JSON_DIR = path.resolve(__dirname, '..', '..', '_shared', 'data', 'bing_analyze');
const BING_DOMAIN = 'caloriewize.com';
const BING_MIN_IMP = 1;

function loadBingSlugs(routeRe: RegExp): string[] {
  if (!fs.existsSync(BING_JSON_DIR)) return [];
  const files = fs.readdirSync(BING_JSON_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  if (!files.length) return [];
  try {
    // 2026-06-11 partial-run shadow fix (kalimawize 2026-05-15 pattern): the
    // absolute-latest snapshot may be a partial run without this domain —
    // scan newest-first and use the first file that actually contains us.
    // Source-side carry-forward also added to analyze_bing_pages.py same day;
    // this is defense-in-depth for historical partial files.
    let site: any;
    for (let i = files.length - 1; i >= 0; i--) {
      const json = JSON.parse(fs.readFileSync(path.join(BING_JSON_DIR, files[i]), 'utf8'));
      if (json[BING_DOMAIN] && Array.isArray(json[BING_DOMAIN].pages)) { site = json[BING_DOMAIN]; break; }
    }
    if (!site || !Array.isArray(site.pages)) return [];
    const out = new Map<string, number>();
    for (const pg of site.pages) {
      const url = String(pg.url || '');
      const pathOnly = url.replace(/^https?:\/\/[^/]+/, '');
      const m = routeRe.exec(pathOnly);
      if (!m) continue;
      const slug = decodeURIComponent(m[1]);
      const imp = Number(pg.impressions) || 0;
      out.set(slug, (out.get(slug) || 0) + imp);
    }
    return [...out.entries()].filter(([, i]) => i >= BING_MIN_IMP).map(([s]) => s);
  } catch {
    return [];
  }
}

const base = getTopComparisons(COMPARE_CAP).map((p) =>
  [p.slugA, p.slugB].sort().join('-vs-'),
);
const slugSet = new Set<string>(base);

let gscAdded = 0;
let gscSkipped = 0;
for (const raw of GSC_EVIDENCE_COMPARES) {
  const canonical = canonicaliseGscSlug(raw);
  if (canonical) {
    if (!slugSet.has(canonical)) gscAdded++;
    slugSet.add(canonical);
  } else {
    gscSkipped++;
  }
}

// Bing-union — same canonicaliseGscSlug pipeline (food slugs have internal dashes)
const bingRaw = loadBingSlugs(/^\/compare\/([^/]+)\/?$/);
let bingAdded = 0;
let bingSkipped = 0;
for (const raw of bingRaw) {
  const canonical = canonicaliseGscSlug(raw);
  if (canonical) {
    if (!slugSet.has(canonical)) {
      slugSet.add(canonical);
      bingAdded++;
    }
  } else {
    bingSkipped++;
  }
}

const compareKeep = Array.from(slugSet).sort();
fs.writeFileSync(path.join(OUT_DIR, 'compare-keep.json'), JSON.stringify(compareKeep));

console.log(
  `✓ compare-keep.json: ${compareKeep.length} compares (${base.length} base + ${gscAdded} GSC + ${bingAdded} Bing, ${gscSkipped + bingSkipped} skipped)`,
);

// 2026-05-05 — Phase 6.1: short-slug whitelist for middleware redirect.
// USDA full-slug naming uses internal dashes ("apples-fuji-with-skin-raw").
// Short queries (single-word like "apple" OR short dashed like "apple-pie",
// "gluten-free", "ice-cream") returned 100% 404 because dynamicParams=false
// and no fallback. Middleware now redirects ≤20-char slugs to /search/?q=<slug>
// unless the slug is itself a valid food. USDA has 352 real dashed-short
// slugs (oil-oat/figs-raw/kale-raw/bread-egg/...) — this whitelist captures
// every food ≤20 chars so the page keeps serving statically.
const SHORT_LEN = 20;
const validShorts = getAllFoods()
  .map((f) => f.slug)
  .filter((s) => s.length <= SHORT_LEN)
  .sort();
fs.writeFileSync(path.join(OUT_DIR, 'food-shorts.json'), JSON.stringify(validShorts));
console.log(`✓ food-shorts.json: ${validShorts.length} valid short slugs`);
