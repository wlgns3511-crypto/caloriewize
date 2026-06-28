/**
 * Authorship + freshness vintages for CalorieWize (Phase 6 v6.4).
 *
 * YMYL HIGH (nutrition / dietary). Authority transfer rather than fabricated
 * individual byline: Editorial Team reviews; SOURCE_AUTHORITIES are the
 * actual DB-row backing (USDA FoodData Central); REFERENCE_AUTHORITIES are
 * body-cite only (FDA, NIH, US Dietary Guidelines, CDC).
 *
 * 6-layer vintage architecture so AuthorBox / sitemap lastmod / Schema
 * dateModified do not collapse to a single sitewide date — that pattern is
 * a known "scaled content" tell and a Trap #1 cluster signal.
 */

export type Layer =
  | 'site'
  | 'food'
  | 'food-hub'
  | 'category'
  | 'state'
  | 'list'
  | 'list-hub'
  | 'blog'
  | 'guide'
  | 'methodology'
  | 'legal';

// 6-layer vintage anchors (+ 2 PSU hub layers — 2026-05-10 PSU rollout)
export const SITE_REVIEWED = '2026-05-10';
export const FOOD_REVIEWED = '2026-04-19';
export const FOOD_HUB_REVIEWED = '2026-05-08';
export const CATEGORY_REVIEWED = '2026-04-19';
export const STATE_REVIEWED = '2026-03-22';
export const BLOG_REVIEWED = '2026-04-13';
export const GUIDE_REVIEWED = '2026-05-27';
export const METHODOLOGY_REVIEWED = '2026-05-10';
export const USDA_DATA_REVIEWED = '2026-04-19';
export const LIST_HUB_REVIEWED = '2026-05-09';

// Backward-compat alias exports (used by build-sitemap.ts and existing pages)
export const FOOD_VINTAGE = FOOD_REVIEWED;
export const CATEGORY_VINTAGE = CATEGORY_REVIEWED;
export const STATE_VINTAGE = STATE_REVIEWED;
export const SITE_VINTAGE = SITE_REVIEWED;
export const ABOUT_VINTAGE = '2026-05-04';
export const METHODOLOGY_VINTAGE = METHODOLOGY_REVIEWED;

// 7 distinct LEGAL_VINTAGES (Trap #1 cluster avoidance)
export const LEGAL_VINTAGES: Record<string, string> = {
  privacy: '2026-04-22',
  terms: '2026-02-18',
  disclaimer: '2025-11-04',
  contact: '2026-03-15',
  about: ABOUT_VINTAGE,
  'editorial-policy': '2026-04-30',
  'corrections-policy': '2026-02-08',
};

export const DB_UPDATED = USDA_DATA_REVIEWED;

// Launch-period footprint guard for HN / PH windows.
// When CW_HUB_LINK is unset (or != "on"), PUBLISHER + EDITORIAL_TEAM.url
// self-reference CalorieWize so that schema.org JSON-LD (datasetSchema,
// reviewedBy, sourceOrganization, AuthorBox) emits CalorieWize as a
// first-class entity instead of surfacing the DataPeek hub. Flip back to
// "on" post-launch to restore the cross-network authorship signal that
// HCU evaluation expects long-term.
const _HUB_ON = process.env.CW_HUB_LINK === "on";

export const PUBLISHER = _HUB_ON
  ? {
      name: 'DataPeek Research Network',
      url: 'https://datapeekfacts.com',
      description: 'A public-data network aggregating government and public datasets across US nutrition, housing, tax, healthcare, and other civic domains.',
    }
  : {
      name: 'CalorieWize',
      url: 'https://caloriewize.com',
      description: 'Free per-100g nutrition data for thousands of US-relevant foods sourced from USDA FoodData Central, classified against FDA Daily Value tiers, FAO/WHO DIAAS protein quality, and NOVA processing groups.',
    };

export const EDITORIAL_TEAM = {
  name: 'CalorieWize Editorial Team',
  url: _HUB_ON
    ? 'https://datapeekfacts.com/editorial-policy/'
    : 'https://caloriewize.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

/**
 * SOURCE_AUTHORITIES — publishers that back rows OR composed verdicts shown
 * on entity pages. Used as schema.org `sourceOrganization` and `creator` on
 * dataset/nutrition markup.
 *
 * 2026-05-19 (Phase 7 P0) — FDA Daily Values and FAO/WHO DIAAS were
 * promoted from REFERENCE_AUTHORITIES into SOURCE_AUTHORITIES because they
 * now back the Protein-Quality Energy tier composed in
 * lib/crosswalk-protein-quality-energy.ts. FDA DV anchors the energy-share
 * dimension; FAO/WHO DIAAS publishes the protein-quality class taxonomy the
 * tier reads against. Their values are not per-row columns in food.db but
 * they back a computed variable surfaced in body + schema. Mitigates Trap
 * T-P0-1 (same-publisher) on the PQE cross-walk.
 */
export const SOURCE_AUTHORITIES = [
  {
    '@type': 'Organization' as const,
    name: 'USDA FoodData Central',
    url: 'https://fdc.nal.usda.gov/',
  },
  {
    '@type': 'Organization' as const,
    name: 'U.S. Food and Drug Administration — Daily Value reference',
    url: 'https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels',
  },
  {
    '@type': 'Organization' as const,
    name: 'FAO/WHO Expert Consultation on Protein Quality (DIAAS, Report 92)',
    url: 'https://www.fao.org/3/i3124e/i3124e.pdf',
  },
];

/**
 * REFERENCE_AUTHORITIES — body-cite only. NIH ODS, US Dietary Guidelines,
 * and CDC Nutrition appear as inline references in editorial commentary,
 * never as DB-row backing or composed-verdict input.
 *
 * 2026-05-19 — FDA Daily Values was promoted into SOURCE_AUTHORITIES once
 * the PQE tier started composing the FDA energy anchor as a verdict input.
 */
export const REFERENCE_AUTHORITIES = [
  {
    '@type': 'Organization' as const,
    name: 'NIH Office of Dietary Supplements',
    url: 'https://ods.od.nih.gov/factsheets/list-all/',
  },
  {
    '@type': 'Organization' as const,
    name: 'US Dietary Guidelines',
    url: 'https://www.dietaryguidelines.gov/',
  },
  {
    '@type': 'Organization' as const,
    name: 'CDC Nutrition',
    url: 'https://www.cdc.gov/nutrition/',
  },
];

export const REVIEWER = SOURCE_AUTHORITIES[0];

/**
 * Resolve the reviewed date for an AuthorBox surface. Legal pages route by
 * slug into LEGAL_VINTAGES so each policy page renders a distinct date.
 */
export function reviewedAtForLayer(layer: Layer, slug?: string): string {
  switch (layer) {
    case 'site':
      return SITE_REVIEWED;
    case 'food':
      return FOOD_REVIEWED;
    case 'food-hub':
      return FOOD_HUB_REVIEWED;
    case 'category':
      return CATEGORY_REVIEWED;
    case 'state':
      return STATE_REVIEWED;
    case 'list':
      return FOOD_REVIEWED;
    case 'list-hub':
      return LIST_HUB_REVIEWED;
    case 'blog':
      return BLOG_REVIEWED;
    case 'guide':
      return GUIDE_REVIEWED;
    case 'methodology':
      return METHODOLOGY_REVIEWED;
    case 'legal':
      if (slug && slug in LEGAL_VINTAGES) return LEGAL_VINTAGES[slug];
      return SITE_REVIEWED;
    default:
      return SITE_REVIEWED;
  }
}
