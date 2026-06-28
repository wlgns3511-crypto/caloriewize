import {
  EDITORIAL_TEAM,
  PUBLISHER,
  REFERENCE_AUTHORITIES,
  SOURCE_AUTHORITIES,
  reviewedAtForLayer,
  type Layer,
} from "@/lib/authorship";

interface Props {
  /** Required — surface category. Used to look up the reviewed date. */
  layer: Layer;
  /** Required when layer="legal" — picks the per-policy date. */
  slug?: string;
  /** Override the resolved reviewed date (rarely used). */
  vintage?: string;
  /** Per-page data source label override. */
  source?: string;
}

export function AuthorBox({ layer, slug, vintage, source = "USDA FoodData Central" }: Props) {
  const reviewedAt = vintage ?? reviewedAtForLayer(layer, slug);

  return (
    <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm">
            Reviewed by the {EDITORIAL_TEAM.name}
          </div>
          {/* Launch-period footprint guard: publisher line gated by CW_HUB_LINK.
              Editorial Team review signal stays (HCU load-bearing); only the
              cross-network publisher attribution hides during launch windows. */}
          {process.env.CW_HUB_LINK === "on" && (
            <div className="text-xs text-slate-500 mt-0.5">
              Part of the <a href={PUBLISHER.url} className="text-slate-700 hover:underline" rel="noopener">{PUBLISHER.name}</a>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        Each food entry's nutrient values come from{' '}
        {SOURCE_AUTHORITIES.map((s, i) => (
          <span key={s.name}>
            {i > 0 && (i === SOURCE_AUTHORITIES.length - 1 ? ', and ' : ', ')}
            <a href={s.url} className="text-slate-700 underline underline-offset-2 hover:text-slate-900" rel="noopener" target="_blank">
              {s.name}
            </a>
          </span>
        ))}
        . Editorial commentary cross-references{' '}
        {REFERENCE_AUTHORITIES.map((r, i) => (
          <span key={r.name}>
            {i > 0 && (i === REFERENCE_AUTHORITIES.length - 1 ? ', and ' : ', ')}
            <a href={r.url} className="text-slate-700 underline underline-offset-2 hover:text-slate-900" rel="noopener" target="_blank">
              {r.name}
            </a>
          </span>
        ))}
        . Calculations and source URLs are audited on every release cycle.
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {reviewedAt && (
          <>
            <span>Last reviewed: <time dateTime={reviewedAt}>{reviewedAt}</time></span>
            <span className="text-slate-300">·</span>
          </>
        )}
        <span>Data source: {source}</span>
        <span className="text-slate-300">·</span>
        <a href="/editorial-policy/" className="underline underline-offset-2 hover:text-slate-900">Editorial policy</a>
        <span className="text-slate-300">·</span>
        <a href="/methodology/" className="underline underline-offset-2 hover:text-slate-900">Methodology</a>
        <span className="text-slate-300">·</span>
        <a href="/corrections-policy/" className="underline underline-offset-2 hover:text-slate-900">Send a correction</a>
      </div>
    </div>
  );
}
