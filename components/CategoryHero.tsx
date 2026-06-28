/**
 * Banner-style visual hero for a category landing page.
 *
 * Renders a wide gradient block with a large emoji glyph, the category name
 * heading, family label, and a 2-stat strip (food count + mean kcal). Sits
 * above the existing h1 to give the category page a visual identity.
 *
 * Server component, pure HTML. Emoji is rendered natively by the OS — see
 * lib/category-visuals.ts header for the no-fab rationale.
 */
import { getCategoryVisual } from '@/lib/category-visuals';

interface Props {
  slug: string;
  name: string;
  count: number;
  meanCal?: number | null;
  meanProtein?: number | null;
}

export function CategoryHero({ slug, name, count, meanCal, meanProtein }: Props) {
  const v = getCategoryVisual(slug);

  return (
    <section
      className={`relative bg-gradient-to-br ${v.gradFrom} ${v.gradTo} ${v.ring} border rounded-2xl p-6 md:p-8 mb-8 overflow-hidden`}
      aria-label={`${name} category banner`}
    >
      {/* Large decorative emoji glyph in upper-right corner */}
      <span
        aria-hidden="true"
        className="absolute -top-4 -right-4 text-[10rem] md:text-[12rem] opacity-20 select-none leading-none"
      >
        {v.emoji}
      </span>

      <div className="relative max-w-2xl">
        <div className={`text-xs font-semibold uppercase tracking-widest ${v.accent} opacity-80 mb-2`}>
          USDA Category · {v.family}
        </div>
        <h1 className={`text-3xl md:text-4xl font-bold ${v.accent} mb-2 flex items-center gap-3`}>
          <span aria-hidden="true">{v.emoji}</span>
          {name}
        </h1>
        <p className={`text-sm ${v.accent} opacity-80 mb-4`}>
          {count} foods with full per-100 g nutrient data, sourced from USDA FoodData Central.
        </p>

        <div className="flex flex-wrap gap-2">
          <Pill accent={v.accent} label="Items" value={count.toLocaleString()} />
          {meanCal != null && meanCal > 0 && (
            <Pill accent={v.accent} label="Mean calories" value={`${Math.round(meanCal)} kcal`} />
          )}
          {meanProtein != null && meanProtein > 0 && (
            <Pill accent={v.accent} label="Mean protein" value={`${meanProtein.toFixed(1)} g`} />
          )}
        </div>
      </div>
    </section>
  );
}

function Pill({ accent, label, value }: { accent: string; label: string; value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs ${accent} ring-1 ring-white/60`}>
      <span className="opacity-70">{label}</span>
      <span className="font-mono font-bold">{value}</span>
    </span>
  );
}
