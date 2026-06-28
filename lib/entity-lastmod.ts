/**
 * Entity-level lastmod entropy (Phase 6 v6.4).
 *
 * Sitemap-level signal hygiene: when every page in a section shares a single
 * lastmod, the cluster looks template-stamped to crawlers. Spreading the
 * lastmod across a deterministic 60-day window — anchored to a real review
 * date — keeps the per-entity dates auditable while turning a 1-date cluster
 * into a 60-bucket distribution.
 *
 * Implementation: FNV-1a 32-bit hash of the slug → bucket index 0..59 →
 * offset days back from the anchor. Pure function, no I/O, runs in build.
 */

import { SITE_REVIEWED } from './authorship';

const BUCKETS = 60;
const ANCHOR = SITE_REVIEWED;

/**
 * FNV-1a 32-bit hash. Stable across processes / Node versions, no
 * dependencies. Returns an unsigned 32-bit integer.
 */
function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime multiply, kept in unsigned 32-bit space
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function shiftIso(iso: string, daysBack: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve an entity's sitemap lastmod. Anchor at SITE_REVIEWED, hash the
 * slug into one of 60 buckets, shift the anchor back by that many days.
 *
 * @param slug - the entity's URL slug (e.g. food slug, category slug)
 * @param namespace - per-section salt so identical slugs across sections
 *                    spread independently (e.g. "food", "category", "state")
 */
export function entityLastmod(slug: string, namespace: string = 'site'): string {
  const bucket = fnv1a32(`${namespace}:${slug}`) % BUCKETS;
  return shiftIso(ANCHOR, bucket);
}

export const ENTITY_LASTMOD_BUCKETS = BUCKETS;
export const ENTITY_LASTMOD_ANCHOR = ANCHOR;
