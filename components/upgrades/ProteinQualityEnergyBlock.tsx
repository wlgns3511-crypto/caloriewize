/**
 * Phase 7 P0 — Protein-Quality Energy verdict body block.
 *
 * Mitigates T-P0-2 (verdict UI missing): the P1 title carries the band label
 * but the underlying composition (USDA macros × DIAAS class × Atwater
 * coherence × FDA DV position) must surface as visible entity-body UI,
 * not body-text-only.
 */
import type { PQEReading } from "@/lib/crosswalk-protein-quality-energy";

interface Props {
  reading: PQEReading;
}

const BAND_STYLES: Record<
  PQEReading["band"],
  { chip: string; body: string; ring: string }
> = {
  HIGH_QUALITY_LEAN: {
    chip: "bg-emerald-100 text-emerald-800",
    body: "bg-emerald-50",
    ring: "border-emerald-200",
  },
  HIGH_QUALITY_DENSE: {
    chip: "bg-indigo-100 text-indigo-800",
    body: "bg-indigo-50",
    ring: "border-indigo-200",
  },
  LOW_QUALITY_LEAN: {
    chip: "bg-sky-100 text-sky-800",
    body: "bg-sky-50",
    ring: "border-sky-200",
  },
  ENERGY_DOMINANT: {
    chip: "bg-amber-100 text-amber-800",
    body: "bg-amber-50",
    ring: "border-amber-200",
  },
  COHERENCE_FLAGGED: {
    chip: "bg-rose-100 text-rose-800",
    body: "bg-rose-50",
    ring: "border-rose-300",
  },
  UNKNOWN: {
    chip: "bg-slate-100 text-slate-700",
    body: "bg-white",
    ring: "border-slate-200",
  },
};

export function ProteinQualityEnergyBlock({ reading }: Props) {
  const styles = BAND_STYLES[reading.band];
  const showTable = reading.band !== "UNKNOWN";
  return (
    <section
      data-upgrade="pqe-crosswalk"
      data-band={reading.band}
      aria-label="Protein-Quality Energy Tier (USDA FDC macros × FAO/WHO DIAAS × FDA Daily Value × Atwater coherence)"
      className={`my-6 rounded-xl border ${styles.ring} ${styles.body} p-5`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${styles.chip}`}
        >
          PQE · {reading.titleLabel}
        </span>
        {showTable && (
          <span className="text-sm font-medium text-slate-700">
            {reading.proteinEnergyPct.toFixed(0)}% energy from protein · {reading.energyDvPct.toFixed(1)}% FDA daily anchor
          </span>
        )}
      </header>

      <p className="text-sm text-slate-800 leading-relaxed mb-3">{reading.blurb}</p>

      {showTable && (
        <div className="overflow-x-auto rounded-lg border border-white bg-white/60 mb-3">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-700">Component</th>
                <th className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">Value</th>
                <th className="px-3 py-2 font-semibold text-slate-700">Publisher</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">Calories (per 100 g, observed)</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {reading.calories.toFixed(0)} kcal
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  <a
                    href="https://fdc.nal.usda.gov/"
                    rel="nofollow noopener"
                    target="_blank"
                    className="underline hover:text-slate-700"
                  >
                    fdc.nal.usda.gov
                  </a>
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">Atwater 4-4-9 expected kcal</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {reading.expectedKcal.toFixed(0)} kcal
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">USDA-ARS Atwater (public-domain)</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">Coherence drift</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {(reading.coherenceRatio * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">composed</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">DIAAS protein-quality class</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {reading.diaasClass}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  <a
                    href="https://www.fao.org/3/i3124e/i3124e.pdf"
                    rel="nofollow noopener"
                    target="_blank"
                    className="underline hover:text-slate-700"
                  >
                    fao.org
                  </a>
                </td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2 text-slate-800">FDA daily-anchor share (2,000 kcal)</td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">
                  {reading.energyDvPct.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  <a
                    href="https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels"
                    rel="nofollow noopener"
                    target="_blank"
                    className="underline hover:text-slate-700"
                  >
                    fda.gov
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {reading.coherenceCaveat && (
        <p className="text-xs text-slate-700 bg-white/80 border border-rose-200 rounded-md p-3 mb-3 italic">
          {reading.coherenceCaveat}
        </p>
      )}

      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer">Source citations</summary>
        <ul className="mt-1 list-disc pl-5 space-y-0.5">
          {reading.sourceCitations.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </details>

      <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-current/10 pt-3">
        <strong className="font-semibold">Composition tier, not a diet rule.</strong> The Protein-Quality
        Energy tier composes USDA per-100g macros with the FAO/WHO DIAAS class for the food's category, an
        Atwater 4-4-9 kcal coherence check, and FDA Daily Value framing. Individual dietary needs depend on
        total intake, body composition, and medical context — see a registered dietitian for personalised guidance.
      </p>
    </section>
  );
}
