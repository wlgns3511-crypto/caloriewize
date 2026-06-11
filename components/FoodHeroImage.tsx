/**
 * Above-the-fold food photo with Wikimedia Commons attribution.
 *
 * Renders a static <picture> (AVIF source + JPEG fallback) — no Next.js
 * /_next/image runtime involved. Pre-rendered into the SSG HTML.
 *
 * LCP candidate, so:
 *   - fetchPriority="high" + decoding="async"
 *   - explicit width/height to reserve layout (no CLS)
 *
 * Many food slugs share an image via head-noun dedup (every "Apple, raw,
 * with skin" / "Apple, dried" variant points to the single Apple photo).
 * The component itself is slug-agnostic — the caller resolves the right
 * image via getFoodImage(slug) and we just render.
 */
import type { FoodImage } from '@/lib/food-images';

interface Props {
  img: FoodImage;
}

export function FoodHeroImage({ img }: Props) {
  return (
    <figure className="mb-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
      <picture>
        <source type="image/avif" srcSet={img.avifPath} />
        <img
          src={img.jpgPath}
          alt={`Photo of ${img.headNoun}`}
          width={img.finalWidth}
          height={img.finalHeight}
          decoding="async"
          fetchPriority="high"
          className="max-h-[500px] max-w-full w-auto h-auto mx-auto block"
        />
      </picture>
      <figcaption className="text-xs text-slate-500 px-3 py-2 bg-slate-50 border-t border-slate-200 leading-relaxed">
        Image
        {img.artistText && img.artistText.toLowerCase() !== 'own work' && (
          <> by <span className="text-slate-600">{img.artistText.slice(0, 80)}</span></>
        )}
        {' · '}
        <a
          href={img.commonsFileUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="underline hover:text-slate-700"
        >
          Wikimedia Commons
        </a>
        {' · '}
        {img.licenseUrl ? (
          <a
            href={img.licenseUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline hover:text-slate-700"
          >
            {img.licenseShort}
          </a>
        ) : (
          <span>{img.licenseShort}</span>
        )}
        {' · resized'}
      </figcaption>
    </figure>
  );
}
