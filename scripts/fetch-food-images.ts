/**
 * Wikimedia Commons image fetcher for caloriewize (2,589 USDA foods).
 *
 * USDA FoodData Central names are highly variable ("Bacon, Turkey, Microwaved",
 * "Beverages, coffee, ready to drink, milk based, sweetened"). We dedupe by
 * extracting a HEAD NOUN per food and only hit Wikipedia once per head-noun
 * (~100-200 unique values across 2,589 foods). All variants of "Apple, raw,
 * with skin" / "Apple, dried" / "Apple, baked" share the single "Apple"
 * Wikipedia photo.
 *
 * Skip rule: only retain permissively-licensed images — CC-BY*, CC-BY-SA*,
 * CC0, PD/PDM, copyrighted-free-use, FAL, GFDL, GPL, No Restrictions.
 *
 * Resume-aware. Polite: 200ms gap between API calls.
 */
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const UA = 'caloriewize/1.0 (https://caloriewize.com; wlgns3511@gmail.com)';
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data/food.db');
const OUT_DIR = path.join(ROOT, 'scripts/data');
const OUT_JSON = path.join(OUT_DIR, 'food-images-manifest.json');

const PERMISSIVE_LICENSES = /^(cc[\s-]?by([\s-]?sa)?(-\d(\.\d)?)?(-[a-z]{2})?|cc0|public[\s-]?domain|pdm|pd|copyrighted[\s-]?free[\s-]?use|fal|free[\s-]?art[\s-]?license|gfdl(\s+\d(\.\d)?)?|gpl(\s*v?\d(\.\d)?)?(\+|-or-later)?|no[\s-]?restrictions|no[\s-]?known[\s-]?restrictions)$/i;
const PHOTO_MIME = /^image\/(jpeg|png|webp|tiff)$/i;

// USDA category prefixes that lead the food name but are NOT the food itself.
// When the first comma-segment matches one of these, we look at the second
// segment for the actual head noun. Lowercased for case-insensitive compare.
const CATEGORY_PREFIXES = new Set<string>([
  'alcoholic beverage', 'beverages', 'beverage',
  'babyfood', 'baby food',
  'cereals', 'cereal',
  'cereals ready-to-eat',
  'fast foods', 'restaurant foods', 'restaurant',
  'meals entrees and side dishes',
  'snacks',
  'soups sauces and gravies',
  'frozen novelties',
  'ice creams',
  'spices', 'spice',
  'sweeteners', 'syrups', 'gravies', 'gravy',
  'fats and oils', 'oil', 'oils',
  'sauce', 'sauces',
  'salad dressing',
  // Brand prefixes — when a brand leads (e.g. "McDonald's, Big Mac") we
  // skip the brand and use the actual food token next over.
  "mcdonald's", 'mcdonalds',
  'kfc', 'subway', 'wendys', "wendy's",
  'taco bell', 'pizza hut', 'burger king',
  'popeyes', 'chick-fil-a', "applebee's", 'applebees',
  "denny's", 'dennys', 'ihop', "domino's", 'dominos',
  'starbucks', 'panera bread',
  'archway home style cookies', 'archway',
  'kelloggs', "kellogg's",
  'general mills',
  'campbells', "campbell's",
  'hot pockets',
  'lean cuisine', 'stouffers', "stouffer's",
]);

// Manual Wikipedia title overrides for head nouns where the bare term
// disambiguates poorly or has no pageimage. Each maps head-noun → title list.
const MANUAL_HEAD_NOUN_TITLES: Record<string, string[]> = {
  // Disambiguation cases — bare title points to wrong article
  // (e.g. "Apple" → Apple Inc. company page with SVG logo).
  'apples': ['Apple (fruit)'],
  'apple': ['Apple (fruit)'],
  'beans': ['Bean'],
  'apricots': ['Apricot'],
  'plums': ['Plum'],
  'peppers': ['Bell pepper'],
  'mushrooms': ['Mushroom'],
  'onions': ['Onion'],
  'tomatoes': ['Tomato'],
  'carrots': ['Carrot'],
  'potatoes': ['Potato'],
  'oranges': ['Orange (fruit)'],
  'orange': ['Orange (fruit)'],
  'pickles': ['Pickled cucumber'],
  'lemon': ['Lemon'],
  'lime': ['Lime (fruit)'],
  'limes': ['Lime (fruit)'],
  'turkey': ['Turkey (bird)', 'Domestic turkey'],
  'water': ['Water', 'Drinking water'],
};

interface Food { slug: string; name: string }

interface ManifestEntry {
  slug: string;
  name: string;
  headNoun: string;     // dedup key
  wikipediaTitle: string;
  wikipediaUrl: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  mime: string;
  commonsFileTitle: string;
  commonsFileUrl: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistHtml: string | null;
  artistText: string | null;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function api<T = unknown>(host: string, params: Record<string, string>): Promise<T> {
  const u = new URL(`https://${host}/w/api.php`);
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${u}`);
  return r.json() as Promise<T>;
}

function stripHtml(s: string | undefined | null): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || null;
}

/**
 * Extract a head-noun from a USDA food name.
 *   "Bacon, Turkey, Microwaved" → "bacon"
 *   "Beverages, coffee, ready to drink, milk based, sweetened" → "coffee"
 *   "Apple, raw, with skin" → "apple"
 *   "Salad dressing, sweet and sour" → "salad dressing" (multi-word)
 *   "Cabbage, Chinese (pak-choi), raw" → "cabbage"
 *
 * Strategy: split by comma, drop any leading segment that matches CATEGORY_PREFIXES,
 * then take the first remaining segment and lowercase it. Stripped of
 * parenthetical qualifiers like "(pak-choi)".
 */
function extractHeadNoun(name: string): string {
  const parts = name.split(/,\s*/).map(s => s.trim().toLowerCase());
  let i = 0;
  while (i < parts.length - 1 && CATEGORY_PREFIXES.has(parts[i])) i++;
  let head = parts[i];
  // Strip parenthetical qualifiers: "cabbage chinese (pak-choi)" → "cabbage chinese"
  head = head.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  // Collapse internal whitespace
  head = head.replace(/\s+/g, ' ');
  return head;
}

function headNounTitleCandidates(headNoun: string): string[] {
  if (MANUAL_HEAD_NOUN_TITLES[headNoun]) return MANUAL_HEAD_NOUN_TITLES[headNoun];
  // Title-case for Wikipedia article matching
  const titleCase = headNoun.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  // Singular fallback for plural -s/-es
  const singular = headNoun.endsWith('ies')
    ? headNoun.slice(0, -3) + 'y'
    : headNoun.endsWith('es')
      ? headNoun.slice(0, -2)
      : headNoun.endsWith('s')
        ? headNoun.slice(0, -1)
        : null;
  const singularTC = singular
    ? singular.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : null;
  const candidates: string[] = [titleCase, `${titleCase} (food)`];
  if (singularTC && singularTC !== titleCase) candidates.push(singularTC, `${singularTC} (food)`);
  return candidates;
}

/**
 * Defensive guard: when Wikipedia redirects "Coffee, ready to drink" → an
 * unrelated article, require at least one significant word overlap between
 * the resolved page title and the head-noun.
 *
 * Tolerant of trivial English inflection so "apples" matches "Apple",
 * "vegetables" matches "Vegetable", "waffles" matches "Waffle". The stem
 * normalization is intentionally conservative — only the most common
 * suffix patterns — to keep the false-positive rate low.
 */
function titleMatchesName(pageTitle: string, headNoun: string): boolean {
  const STOP = new Set(['the', 'and', 'of', 'a', 'an']);
  const stem = (w: string): string => {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  };
  const tokens = (s: string) => new Set(
    s.toLowerCase()
      .replace(/[()\[\]\/.,-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP.has(w))
      .map(stem)
  );
  const nw = tokens(headNoun);
  const tw = tokens(pageTitle);
  for (const w of nw) if (tw.has(w)) return true;
  return false;
}

async function lookupHeadNoun(headNoun: string): Promise<Omit<ManifestEntry, 'slug' | 'name'> | null> {
  for (const title of headNounTitleCandidates(headNoun)) {
    type PageImagesResp = {
      query?: {
        pages?: Array<{
          pageid?: number;
          title: string;
          missing?: boolean;
          original?: { source: string; width: number; height: number };
          pageimage?: string;
        }>;
      };
    };
    const r1 = await api<PageImagesResp>('en.wikipedia.org', {
      action: 'query',
      prop: 'pageimages',
      piprop: 'original|name',
      titles: title,
      redirects: '1',
    });
    const page = r1.query?.pages?.[0];
    if (!page || page.missing || !page.original || !page.pageimage) continue;

    if (!MANUAL_HEAD_NOUN_TITLES[headNoun] && !titleMatchesName(page.title, headNoun)) {
      console.error(`  skip "${headNoun}": resolved "${page.title}" — no overlap`);
      continue;
    }

    const mimeRx = page.original.source.match(/\.(jpe?g|png|webp|tiff?)(?:$|\?)/i);
    if (!mimeRx) continue;

    type ImageInfoResp = {
      query?: {
        pages?: Array<{
          title: string;
          imageinfo?: Array<{
            url?: string;
            descriptionurl?: string;
            mime?: string;
            extmetadata?: Record<string, { value?: string } | undefined>;
          }>;
        }>;
      };
    };
    await sleep(200);
    const r2 = await api<ImageInfoResp>('en.wikipedia.org', {
      action: 'query',
      prop: 'imageinfo',
      iiprop: 'url|mime|extmetadata',
      titles: `File:${page.pageimage}`,
    });
    const fpage = r2.query?.pages?.[0];
    const info = fpage?.imageinfo?.[0];
    if (!info || !info.mime || !PHOTO_MIME.test(info.mime)) continue;
    const meta = info.extmetadata ?? {};
    const licenseShort = stripHtml(meta.LicenseShortName?.value) ?? '';
    const licenseKey = stripHtml(meta.License?.value) ?? licenseShort;
    if (!PERMISSIVE_LICENSES.test(licenseKey)) continue;
    const artistHtml = meta.Artist?.value ?? null;
    return {
      headNoun,
      wikipediaTitle: page.title,
      wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      imageUrl: page.original.source,
      imageWidth: page.original.width,
      imageHeight: page.original.height,
      mime: info.mime,
      commonsFileTitle: fpage!.title,
      commonsFileUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(fpage!.title.replace(/ /g, '_'))}`,
      licenseShort,
      licenseUrl: stripHtml(meta.LicenseUrl?.value),
      artistHtml,
      artistText: stripHtml(artistHtml),
    };
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const db = new Database(DB_PATH, { readonly: true });
  const foods = db.prepare('SELECT slug, name FROM foods ORDER BY slug').all() as Food[];
  console.log(`Loading ${foods.length} foods, extracting head-nouns…`);

  // Group foods by head-noun
  const byHeadNoun = new Map<string, Food[]>();
  for (const f of foods) {
    const hn = extractHeadNoun(f.name);
    if (!hn) continue;
    if (!byHeadNoun.has(hn)) byHeadNoun.set(hn, []);
    byHeadNoun.get(hn)!.push(f);
  }
  const uniqueHeadNouns = Array.from(byHeadNoun.keys()).sort();
  console.log(`Found ${uniqueHeadNouns.length} unique head-nouns across ${foods.length} foods`);

  // Resume-aware: load existing manifest, skip already-resolved head-nouns
  let existing: ManifestEntry[] = [];
  try { existing = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8')); } catch { /* first run */ }
  const haveHeadNouns = new Set(
    existing.filter(e => e.imageUrl).map(e => e.headNoun)
  );
  const todoHeadNouns = uniqueHeadNouns.filter(hn => !haveHeadNouns.has(hn));
  console.log(`Resolving ${todoHeadNouns.length} new head-nouns (${haveHeadNouns.size} already present)…`);

  // Resolve each new head-noun
  const headNounMetadata = new Map<string, Omit<ManifestEntry, 'slug' | 'name'>>();
  // Seed with existing manifest's resolved head-nouns
  for (const e of existing) {
    if (e.imageUrl && !headNounMetadata.has(e.headNoun)) {
      const { slug: _s, name: _n, ...rest } = e;
      headNounMetadata.set(e.headNoun, rest);
    }
  }

  const missingHeadNouns: string[] = [];
  for (const hn of todoHeadNouns) {
    process.stdout.write(`  ${hn.padEnd(36)} `);
    try {
      const meta = await lookupHeadNoun(hn);
      if (meta) {
        headNounMetadata.set(hn, meta);
        process.stdout.write(`OK  ${meta.imageWidth}x${meta.imageHeight}  ${meta.licenseShort}\n`);
      } else {
        missingHeadNouns.push(hn);
        process.stdout.write('MISS\n');
      }
    } catch (err) {
      missingHeadNouns.push(hn);
      process.stdout.write(`ERR ${(err as Error).message}\n`);
    }
    await sleep(200);
  }

  // Fan out: one manifest entry per FOOD, sharing the head-noun's metadata.
  const out: ManifestEntry[] = [];
  for (const f of foods) {
    const hn = extractHeadNoun(f.name);
    const meta = headNounMetadata.get(hn);
    if (!meta) continue;
    out.push({
      slug: f.slug,
      name: f.name,
      ...meta,
    });
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log(`\nResolved ${headNounMetadata.size}/${uniqueHeadNouns.length} head-nouns → ${out.length}/${foods.length} foods`);
  if (missingHeadNouns.length) {
    console.log(`Missing head-nouns (${missingHeadNouns.length}): ${missingHeadNouns.slice(0, 30).join(', ')}${missingHeadNouns.length > 30 ? ' …' : ''}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
