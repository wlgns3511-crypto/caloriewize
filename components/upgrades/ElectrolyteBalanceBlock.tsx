/**
 * Vertical-Depth — Sodium-to-Potassium (Na:K) balance + micronutrient source
 * body block for /food/[slug]/.
 *
 * Surfaces the two electrolytes as a RATIO (the WHO/AHA dietary signal) instead
 * of two isolated mg figures, and promotes the four micronutrients (potassium,
 * vitamin C, calcium, iron) from the raw Nutrition-Facts table into FDA
 * "good / excellent source" %DV classifications. Descriptive, non-clinical.
 */
import type { ElectrolyteReading } from "@/lib/electrolyte-balance";

interface Props {
  reading: ElectrolyteReading;
}

function fmtMolar(n: number): string {
  if (n > 0 && n < 0.05) return "<0.05";
  return n.toFixed(n < 1 ? 2 : 1);
}

export function ElectrolyteBalanceBlock({ reading }: Props) {
  const { tone, band } = reading;
  const known = band !== "unknown";

  // Width of the potassium share for the split bar (potassium / (sodium + potassium)).
  const na = reading.sodiumMg ?? 0;
  const k = reading.potassiumMg ?? 0;
  const kShare = na + k > 0 ? (k / (na + k)) * 100 : 50;

  return (
    <section
      data-upgrade="electrolyte-balance"
      data-band={band}
      aria-label="Sodium-to-potassium balance (USDA FoodData Central × FDA Daily Value × WHO/US Dietary Guidelines Na:K target)"
      className={`my-6 rounded-xl border ${tone.border} ${tone.bg} p-5`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${tone.text} bg-white/70`}>
          Na:K balance · {reading.bandLabel}
        </span>
        {known && reading.molarRatio !== null && (
          <span className="text-sm font-medium text-slate-700">
            molar ratio {fmtMolar(reading.molarRatio)} · WHO target ≤ 1
          </span>
        )}
      </header>

      <p className="text-sm text-slate-800 leading-relaxed mb-3">{reading.verdict}</p>

      {/* Na vs K split bar */}
      {known && (
        <div className="mb-4 rounded-lg border border-white bg-white/60 p-3">
          <div className="flex items-baseline justify-between text-xs text-slate-600 mb-1">
            <span>Sodium {na.toFixed(0)} mg</span>
            <span>Potassium {k.toFixed(0)} mg</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-rose-200" aria-hidden>
            <div className={`h-full ${tone.bar}`} style={{ width: `${Math.min(100, Math.max(0, kShare)).toFixed(1)}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-600">
            {reading.meetsWhoTarget
              ? "Potassium meets or outweighs sodium on a molar basis — at or below the WHO dietary Na:K target of 1."
              : "Sodium outweighs potassium on a molar basis — above the WHO dietary Na:K target of 1."}
          </p>
        </div>
      )}

      {/* Micronutrient %DV — the four nutrients the Facts table showed only as raw mg */}
      {reading.micronutrients.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white bg-white/60 mb-3">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-700">Micronutrient (per 100 g)</th>
                <th className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">% Daily Value</th>
                <th className="px-3 py-2 font-semibold text-slate-700">FDA source level</th>
              </tr>
            </thead>
            <tbody>
              {reading.micronutrients.map((m) => (
                <tr key={m.nutrient} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">{m.nutrient} ({m.valueMg.toFixed(0)} mg)</td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium">{m.percentDV}%</td>
                  <td className="px-3 py-2 text-xs">
                    {m.sourceClass === "excellent" ? (
                      <span className="font-semibold text-emerald-700">Excellent source (≥20% DV)</span>
                    ) : m.sourceClass === "good" ? (
                      <span className="font-medium text-sky-700">Good source (10–19% DV)</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer">Source citations</summary>
        <ul className="mt-1 list-disc pl-5 space-y-0.5">
          <li>
            <a href="https://fdc.nal.usda.gov/" rel="nofollow noopener" target="_blank" className="underline hover:text-slate-700">USDA FoodData Central</a> — sodium, potassium, and micronutrient values per 100 g.
          </li>
          <li>
            <a href="https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels" rel="nofollow noopener" target="_blank" className="underline hover:text-slate-700">FDA Daily Value</a> + 21 CFR §101.54 source-claim thresholds (≥20% DV excellent, 10–19% good).
          </li>
          <li>
            <a href="https://www.who.int/news-room/fact-sheets/detail/salt-reduction" rel="nofollow noopener" target="_blank" className="underline hover:text-slate-700">WHO</a> / US Dietary Guidelines — dietary sodium-to-potassium ratio target (molar ratio ≤ 1).
          </li>
        </ul>
      </details>

      <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-current/10 pt-3">
        <strong className="font-semibold">Descriptive context, not medical advice.</strong> The sodium-to-potassium
        ratio composes the two USDA electrolyte values against the WHO dietary target; the source levels apply FDA
        per-serving thresholds per 100 g. Blood-pressure and kidney decisions depend on total daily intake and
        individual medical context — follow the DASH guidance or a clinician for personalised advice.
      </p>
    </section>
  );
}
