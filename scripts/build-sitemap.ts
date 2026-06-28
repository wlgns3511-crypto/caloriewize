#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { getAllFoods, getAllCategories, countComparisons, getComparisonSlugsPage } from '../lib/db';
import { getAllStates } from '../lib/states-data';
import { getAllInsightArticles } from '../lib/insight-articles';
import {
  FOOD_VINTAGE,
  CATEGORY_VINTAGE,
  STATE_VINTAGE,
  SITE_VINTAGE,
  ABOUT_VINTAGE,
  METHODOLOGY_VINTAGE,
  LEGAL_VINTAGES,
  BLOG_REVIEWED,
  GUIDE_REVIEWED,
} from '../lib/authorship';
import { entityLastmod } from '../lib/entity-lastmod';

const SITE_URL = 'https://caloriewize.com';

// Phase 6 v6.4 — identity guard. This sitemap builder is hard-pinned to
// caloriewize.com; running it against the wrong site config (cross-imported
// from a sibling project under the monorepo) produced cluster-stamped sitemaps
// in the past. Fail loud if SITE_URL drifts.
if (!SITE_URL.endsWith('caloriewize.com')) {
  throw new Error(`build-sitemap identity guard: expected caloriewize.com, got ${SITE_URL}`);
}
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages
add({ url: `${SITE_URL}/`, lastmod: SITE_VINTAGE, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/food/`, lastmod: FOOD_VINTAGE, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/compare/`, lastmod: FOOD_VINTAGE, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/state/`, lastmod: STATE_VINTAGE, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/list/`, lastmod: FOOD_VINTAGE, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/about/`, lastmod: ABOUT_VINTAGE, priority: '0.6', changefreq: 'yearly' });
add({ url: `${SITE_URL}/methodology/`, lastmod: METHODOLOGY_VINTAGE, priority: '0.6', changefreq: 'yearly' });
add({ url: `${SITE_URL}/privacy/`, lastmod: LEGAL_VINTAGES.privacy, priority: '0.4', changefreq: 'yearly' });
add({ url: `${SITE_URL}/terms/`, lastmod: LEGAL_VINTAGES.terms, priority: '0.4', changefreq: 'yearly' });
add({ url: `${SITE_URL}/disclaimer/`, lastmod: LEGAL_VINTAGES.disclaimer, priority: '0.4', changefreq: 'yearly' });

// List pages — 2026-04-28 expanded from 2 to 15 list types as part of HCU 5-chunk patch
const LIST_TYPES = [
  'low-calorie', 'high-protein', 'high-fiber', 'low-sodium', 'low-sugar',
  'low-fat', 'low-carb', 'high-vitamin-c', 'high-calcium', 'high-iron',
  'high-potassium', 'low-cholesterol', 'low-saturated-fat',
  'ultra-low-calorie', 'high-protein-low-calorie', 'sodium-potassium-balance',
];
for (const t of LIST_TYPES) {
  add({ url: `${SITE_URL}/list/${t}/`, lastmod: FOOD_VINTAGE, priority: '0.8', changefreq: 'monthly' });
}

// Add the new TRUST surfaces (Phase 6 v6.4 expansion)
add({ url: `${SITE_URL}/contact/`, lastmod: LEGAL_VINTAGES.contact, priority: '0.4', changefreq: 'yearly' });
add({ url: `${SITE_URL}/editorial-policy/`, lastmod: LEGAL_VINTAGES['editorial-policy'], priority: '0.4', changefreq: 'yearly' });
add({ url: `${SITE_URL}/corrections-policy/`, lastmod: LEGAL_VINTAGES['corrections-policy'], priority: '0.4', changefreq: 'yearly' });

// Category pages — 60-bucket FNV-1a spread of lastmod (Phase 6 v6.4)
for (const c of getAllCategories()) {
  add({ url: `${SITE_URL}/category/${c.slug}/`, lastmod: entityLastmod(c.slug, 'category'), priority: '0.8', changefreq: 'monthly' });
}

// State pages — 60-bucket FNV-1a spread of lastmod
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, lastmod: entityLastmod(s.slug, 'state'), priority: '0.8', changefreq: 'monthly' });
}

// Food pages — 60-bucket FNV-1a spread of lastmod
for (const f of getAllFoods()) {
  add({ url: `${SITE_URL}/food/${f.slug}/`, lastmod: entityLastmod(f.slug, 'food'), priority: '0.7', changefreq: 'monthly' });
}


// Blog pages

// Insights
add({ url: `${SITE_URL}/insights/`, priority: '0.8', changefreq: 'weekly' });
for (const a of getAllInsightArticles()) {
  add({ url: `${SITE_URL}/insights/${a.slug}/`, lastmod: a.date, priority: '0.8', changefreq: 'monthly' });
}

// Compare pages excluded from sitemap (2026-04-17)
// GSC-whitelist approach generated 404s for entries not in generateStaticParams.
// Thin synthetic matrix (food×food) is doorway-prone per Google scaled-content policy.
// Pages still render via generateStaticParams; just not announced in sitemap.

// Clean old sitemap files
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
