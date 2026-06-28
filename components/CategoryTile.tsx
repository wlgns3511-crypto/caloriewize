/**
 * Visual tile for a USDA food category — grid-style card with emoji glyph,
 * gradient backdrop, family label, and optional food-count chip.
 *
 * Server component, pure HTML, zero client JS. Renders identically on every
 * platform because all visual layers (gradient, ring, emoji glyph, text) are
 * native OS-rendered. No external image fetch.
 *
 * Honest contract: see lib/category-visuals.ts header — emoji is a universal
 * category SYMBOL, not a fabricated photograph of the category contents.
 */
import Link from 'next/link';
import { getCategoryVisual } from '@/lib/category-visuals';

interface Props {
  slug: string;
  name: string;
  count?: number;            // number of foods in this category (optional stat)
  meanCal?: number;          // mean kcal per 100 g (optional stat)
  size?: 'sm' | 'md' | 'lg';
}

export function CategoryTile({ slug, name, count, meanCal, size = 'md' }: Props) {
  const v = getCategoryVisual(slug);

  const sizePx = {
    sm: { card: 'p-3', emoji: 'text-3xl', title: 'text-sm font-semibold' },
    md: { card: 'p-4', emoji: 'text-4xl', title: 'text-base font-bold' },
    lg: { card: 'p-5', emoji: 'text-5xl', title: 'text-lg font-bold' },
  }[size];

  return (
    <Link
      href={`/category/${slug}/`}
      className={`block bg-gradient-to-br ${v.gradFrom} ${v.gradTo} ${v.ring} border rounded-xl ${sizePx.card} hover:shadow-md hover:scale-[1.02] transition-transform group relative overflow-hidden`}
      aria-label={`${name} category — ${count ?? 'browse'} foods`}
    >
      {/* Decorative emoji glyph in upper-right, large and faded */}
      <span
        aria-hidden="true"
        className={`absolute top-1 right-2 ${sizePx.emoji} opacity-25 group-hover:opacity-40 transition-opacity`}
      >
        {v.emoji}
      </span>
      <div className="relative">
        <span className="text-2xl mr-1.5" aria-hidden="true">{v.emoji}</span>
        <h3 className={`${sizePx.title} ${v.accent} mb-1 inline-block align-middle`}>{name}</h3>
        <div className={`text-xs ${v.accent} opacity-70 font-medium uppercase tracking-wide`}>
          {v.family}
        </div>
        {count != null && (
          <div className={`mt-2 flex items-baseline gap-2 text-xs ${v.accent}`}>
            <span className="font-mono font-bold">{count}</span>
            <span className="opacity-70">foods</span>
            {meanCal != null && meanCal > 0 && (
              <>
                <span className="opacity-40">·</span>
                <span className="font-mono font-bold">{Math.round(meanCal)}</span>
                <span className="opacity-70">kcal avg</span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
