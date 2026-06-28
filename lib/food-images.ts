/**
 * Food-image lookup. Reads the manifest produced by
 * scripts/process-food-images.ts at module load (build time on Mac, then
 * baked into the SSG output — no runtime fs cost on the VPS).
 *
 * Manifest holds one row per food slug (~2,589 rows), but rows are
 * deduplicated by head-noun upstream — many "apple" variants share one
 * Wikimedia photo. We just key by the food slug here; the dedup is
 * invisible at the consumer layer.
 *
 * Cloned from salarybycity/lib/state-images.ts pattern.
 */
import manifest from '@/scripts/data/food-images-manifest.json';

export interface FoodImage {
  slug: string;
  name: string;
  headNoun: string;
  avifPath: string;
  jpgPath: string;
  finalWidth: number;
  finalHeight: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

interface ManifestEntry {
  slug: string;
  name: string;
  headNoun: string;
  avifPath?: string;
  jpgPath?: string;
  finalWidth?: number;
  finalHeight?: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

const BY_SLUG: ReadonlyMap<string, FoodImage> = (() => {
  const m = new Map<string, FoodImage>();
  for (const raw of (manifest as ManifestEntry[])) {
    if (!raw.avifPath || !raw.jpgPath || !raw.finalWidth || !raw.finalHeight) continue;
    m.set(raw.slug, {
      slug: raw.slug,
      name: raw.name,
      headNoun: raw.headNoun,
      avifPath: raw.avifPath,
      jpgPath: raw.jpgPath,
      finalWidth: raw.finalWidth,
      finalHeight: raw.finalHeight,
      commonsFileUrl: raw.commonsFileUrl,
      wikipediaUrl: raw.wikipediaUrl,
      wikipediaTitle: raw.wikipediaTitle,
      licenseShort: raw.licenseShort,
      licenseUrl: raw.licenseUrl,
      artistText: raw.artistText,
      artistHtml: raw.artistHtml,
    });
  }
  return m;
})();

export function getFoodImage(slug: string): FoodImage | undefined {
  return BY_SLUG.get(slug);
}

export function hasFoodImage(slug: string): boolean {
  return BY_SLUG.has(slug);
}
