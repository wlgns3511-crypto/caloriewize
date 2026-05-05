import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import compareKeepList from './lib/generated/compare-keep.json';
import foodShortsList from './lib/generated/food-shorts.json';

// Prebuilt O(1) lookup set — dumped at build time by scripts/build-keep-sets.ts
// so Edge Runtime middleware never touches SQLite. Stores CANONICAL slugs
// (halves sorted a < b, single-dash `-vs-` join).
const COMPARE_KEEP_SET: Set<string> = new Set(compareKeepList as string[]);

// Short-slug whitelist — the few USDA slugs that are dashless ≤14 chars
// (catsup, honey, tempeh). All other dashless ≤14 char `/food/<slug>/` paths
// are short search queries (apple, banana, chicken, etc.) and 100% 404 today.
// Middleware redirects them to /search/?q=<slug> for recovery.
const SHORT_SLUG_LEN = 14;
const VALID_SHORT_SLUGS: Set<string> = new Set(foodShortsList as string[]);

/**
 * HCU 2026-04-24 cleanup — 410 Gone for pruned /compare/ URLs.
 *
 * Pre-prune: /compare/ had 124,750 comparison pairs. We now keep top-250 by
 * popularity_score DESC + 20 GSC evidence URLs. Remaining ~124,480 pairs
 * still crawled by Google for months from the pre-prune sitemap cache.
 * Returning 410 instead of falling through to notFound()'s 404 signals
 * intentional deletion → faster deindex.
 *
 * Food slugs contain internal dashes so split is ambiguous without DB. We
 * try every -vs- position and accept if any sorted halves match the keep
 * set. Theoretical false positive (a-b-c-vs-d where both splits match)
 * would still land on a renderable page via dynamicParams=false, safe.
 */
function isComparePathKept(slugs: string): boolean {
  if (COMPARE_KEEP_SET.has(slugs)) return true;
  const marker = '-vs-';
  let idx = slugs.indexOf(marker);
  while (idx !== -1) {
    const a = slugs.slice(0, idx);
    const b = slugs.slice(idx + marker.length);
    if (COMPARE_KEEP_SET.has([a, b].sort().join(marker))) return true;
    idx = slugs.indexOf(marker, idx + 1);
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /compare/<slugs>/ — 410 if not in keep-set (canonical or reverse ordering)
  if (pathname.startsWith('/compare/')) {
    const raw = pathname.slice(9).replace(/\/$/, '');
    if (raw && !raw.includes('/') && raw.includes('-vs-')) {
      if (!isComparePathKept(raw)) {
        return new NextResponse('Gone', { status: 410 });
      }
    }
  }

  // Phase 6.1 — short slug recovery for /food/<slug>/.
  // USDA slugs are verbose ("apples-fuji-with-skin-raw"). Short queries like
  // /food/apple/ used to 404 with no recovery. Redirect to search instead.
  if (pathname.startsWith('/food/')) {
    const slug = pathname.slice(6).replace(/\/$/, '');
    if (
      slug &&
      !slug.includes('/') &&
      !slug.includes('-') &&
      slug.length <= SHORT_SLUG_LEN &&
      !VALID_SHORT_SLUGS.has(slug)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/search/';
      url.search = `?q=${encodeURIComponent(slug)}`;
      return NextResponse.redirect(url, 301);
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
