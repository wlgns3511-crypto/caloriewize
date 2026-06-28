/**
 * Process raw Wikimedia food images → optimized AVIF + JPEG fallback.
 *
 * Reads scripts/data/food-images-manifest.json, downloads each unique
 * imageUrl (head-noun dedup → one download serves many food slugs),
 * pipes through sharp:
 *   - resize to MAX_DIM (preserve aspect, withoutEnlargement)
 *   - emit  public/food-images/{headNoun-slug}.avif  (quality 50, effort 4)
 *   - emit  public/food-images/{headNoun-slug}.jpg   (mozjpeg quality 78)
 *
 * The manifest carries one row per food slug (~2,589 rows) but multiple
 * rows share the same imageUrl. We process each unique URL exactly once,
 * key the output filename off a slugified head-noun, and write the same
 * avifPath/jpgPath onto every row that shares that head-noun.
 *
 * Cloned from salarybycity/scripts/process-state-images.ts; the head-noun
 * dedup is the only material difference.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(ROOT, 'scripts/data/food-images-manifest.json');
const OUT_DIR = path.join(ROOT, 'public/food-images');
const MAX_DIM = 1280;
const UA = 'caloriewize/1.0 (https://caloriewize.com; wlgns3511@gmail.com)';

interface Entry {
  slug: string;
  headNoun: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  avifPath?: string;
  jpgPath?: string;
  finalWidth?: number;
  finalHeight?: number;
  avifBytes?: number;
  jpgBytes?: number;
  [k: string]: unknown;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

function slugifyHeadNoun(hn: string): string {
  return hn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function downloadBuffer(url: string, attempt = 1): Promise<Buffer> {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (r.status === 429 || r.status === 503) {
    if (attempt > 4) throw new Error(`HTTP ${r.status} after 4 retries`);
    const retryAfter = Number(r.headers.get('retry-after')) || (2 ** attempt);
    await sleep(retryAfter * 1000);
    return downloadBuffer(url, attempt + 1);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

interface ProcessedAsset {
  avifPath: string;
  jpgPath: string;
  finalWidth: number;
  finalHeight: number;
  avifBytes: number;
  jpgBytes: number;
}

async function processUrl(headNoun: string, imageUrl: string): Promise<ProcessedAsset> {
  const fileSlug = slugifyHeadNoun(headNoun);
  const avifPathAbs = path.join(OUT_DIR, `${fileSlug}.avif`);
  const jpgPathAbs = path.join(OUT_DIR, `${fileSlug}.jpg`);

  if (fs.existsSync(avifPathAbs) && fs.existsSync(jpgPathAbs)) {
    // Resume: read existing dimensions from JPG metadata
    const meta = await sharp(jpgPathAbs).metadata();
    const avifStat = fs.statSync(avifPathAbs);
    const jpgStat = fs.statSync(jpgPathAbs);
    return {
      avifPath: `/food-images/${fileSlug}.avif`,
      jpgPath: `/food-images/${fileSlug}.jpg`,
      finalWidth: meta.width ?? 0,
      finalHeight: meta.height ?? 0,
      avifBytes: avifStat.size,
      jpgBytes: jpgStat.size,
    };
  }

  await sleep(400);
  const buf = await downloadBuffer(imageUrl);

  const pipeline = sharp(buf)
    .rotate()
    .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true });

  const meta = await pipeline.clone().toBuffer({ resolveWithObject: true });
  await pipeline.clone().avif({ quality: 50, effort: 4 }).toFile(avifPathAbs);
  await pipeline.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(jpgPathAbs);

  const avifStat = fs.statSync(avifPathAbs);
  const jpgStat = fs.statSync(jpgPathAbs);
  return {
    avifPath: `/food-images/${fileSlug}.avif`,
    jpgPath: `/food-images/${fileSlug}.jpg`,
    finalWidth: meta.info.width,
    finalHeight: meta.info.height,
    avifBytes: avifStat.size,
    jpgBytes: jpgStat.size,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const entries = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as Entry[];

  // Group rows by headNoun — every group shares the same imageUrl, so we
  // process the head-noun once and stamp the output onto every member.
  const byHeadNoun = new Map<string, Entry[]>();
  for (const e of entries) {
    if (!byHeadNoun.has(e.headNoun)) byHeadNoun.set(e.headNoun, []);
    byHeadNoun.get(e.headNoun)!.push(e);
  }
  console.log(`Processing ${byHeadNoun.size} unique head-nouns covering ${entries.length} food rows…`);

  const assetByHeadNoun = new Map<string, ProcessedAsset>();
  let avifTotal = 0;
  let jpgTotal = 0;
  let ok = 0;
  let err = 0;

  for (const [hn, members] of byHeadNoun) {
    process.stdout.write(`  ${hn.padEnd(36)} `);
    try {
      const asset = await processUrl(hn, members[0].imageUrl);
      assetByHeadNoun.set(hn, asset);
      avifTotal += asset.avifBytes;
      jpgTotal += asset.jpgBytes;
      ok++;
      process.stdout.write(`AVIF ${(asset.avifBytes / 1024).toFixed(1)}KB · JPG ${(asset.jpgBytes / 1024).toFixed(1)}KB · ×${members.length}\n`);
    } catch (e) {
      err++;
      process.stdout.write(`ERR ${(e as Error).message}\n`);
    }
  }

  // Stamp asset paths onto every row
  const out: Entry[] = entries.map(e => {
    const a = assetByHeadNoun.get(e.headNoun);
    if (!a) return e;
    return {
      ...e,
      avifPath: a.avifPath,
      jpgPath: a.jpgPath,
      finalWidth: a.finalWidth,
      finalHeight: a.finalHeight,
      avifBytes: a.avifBytes,
      jpgBytes: a.jpgBytes,
    };
  });

  fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2));
  const stamped = out.filter(e => e.avifPath).length;
  console.log(`\nProcessed ${ok}/${byHeadNoun.size} head-nouns (${err} errors) · stamped ${stamped}/${entries.length} food rows`);
  console.log(`AVIF total ${(avifTotal / 1024 / 1024).toFixed(2)} MB · JPG total ${(jpgTotal / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(e => { console.error(e); process.exit(1); });
