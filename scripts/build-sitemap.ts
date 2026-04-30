#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { getAllFoods, getAllCategories, countComparisons, getComparisonSlugsPage } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllStates } from '../lib/states-data';
import { getAllInsightArticles } from '../lib/insight-articles';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://caloriewize.com';
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
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/food/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/compare/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/state/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/list/`, priority: '0.9', changefreq: 'monthly' });

// List pages — 2026-04-28 expanded from 2 to 15 list types as part of HCU 5-chunk patch
const LIST_TYPES = [
  'low-calorie', 'high-protein', 'high-fiber', 'low-sodium', 'low-sugar',
  'low-fat', 'low-carb', 'high-vitamin-c', 'high-calcium', 'high-iron',
  'high-potassium', 'low-cholesterol', 'low-saturated-fat',
  'ultra-low-calorie', 'high-protein-low-calorie',
];
for (const t of LIST_TYPES) {
  add({ url: `${SITE_URL}/list/${t}/`, priority: '0.8', changefreq: 'monthly' });
}

// Category pages
for (const c of getAllCategories()) {
  add({ url: `${SITE_URL}/category/${c.slug}/`, priority: '0.8', changefreq: 'monthly' });
}

// State pages
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.8', changefreq: 'monthly' });
}

// Food pages
for (const f of getAllFoods()) {
  add({ url: `${SITE_URL}/food/${f.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Guide pages
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// Blog pages
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: p.updatedAt ?? p.publishedAt, priority: '0.7', changefreq: 'monthly' });
}

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
