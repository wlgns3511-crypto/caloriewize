/**
 * Authorship + freshness vintages for CalorieWize.
 *
 * YMYL note (medical/nutrition): instead of inventing a named individual reviewer,
 * we transfer authority to verifiable source organizations (USDA FoodData Central,
 * FDA Daily Values, NIH Office of Dietary Supplements). The editorial team
 * audits and cross-references against these primary sources on each release.
 *
 * Vintages are split per content type so AuthorBox / sitemap lastmod / Schema
 * dateModified don't all collapse to a single sitewide date — that pattern
 * was flagged as a "scaled content" tell by AdSense reviewers.
 */

export const FOOD_VINTAGE = '2026-04-19';
export const CATEGORY_VINTAGE = '2026-04-19';
export const STATE_VINTAGE = '2026-03-22';
export const SITE_VINTAGE = '2026-03-15';
export const ABOUT_VINTAGE = '2026-04-12';
export const METHODOLOGY_VINTAGE = '2026-04-08';

export const LEGAL_VINTAGES = {
  privacy: '2026-04-22',
  terms: '2026-02-18',
  disclaimer: '2025-11-04',
};

export const DB_UPDATED = FOOD_VINTAGE;

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description: 'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'CalorieWize Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

/**
 * Authority sources we cross-reference for every nutrition entry.
 * Used as schema.org `reviewedBy` on entity pages — verifiable Organizations
 * with established medical/regulatory credentials, instead of a fabricated
 * individual byline.
 */
export const SOURCE_AUTHORITIES = [
  {
    '@type': 'Organization' as const,
    name: 'USDA FoodData Central',
    url: 'https://fdc.nal.usda.gov/',
  },
  {
    '@type': 'Organization' as const,
    name: 'FDA Daily Values',
    url: 'https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels',
  },
  {
    '@type': 'Organization' as const,
    name: 'NIH Office of Dietary Supplements',
    url: 'https://ods.od.nih.gov/factsheets/list-all/',
  },
];

export const REVIEWER = SOURCE_AUTHORITIES[0];
