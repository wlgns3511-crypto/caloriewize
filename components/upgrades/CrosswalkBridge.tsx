/**
 * Phase 7 P5 — Internal Cross-Walk Bridge for /food/{slug}/.
 *
 * Contextual links from each food page to sibling portfolio sites that share
 * the food-name join key:
 *   - ingredipeek.com — allergen + ingredient check by food name
 *   - calcpeek.com — TDEE / kcal budget by food name
 *
 * Per playbook §8.2 footprint rules:
 *   - anchor uses {foodName} interpolation (not bare template)
 *   - rel="external" explicit
 *   - 2 links (≤ 4 budget)
 *   - placed in entity body fold-1, replaces the static "Related Data
 *     Resources" link block whose bare anchors triggered T-P5-1 (template
 *     footprint).
 *
 * Mitigates T-P5-2 (404 dest): destinations point to host roots so a per-food
 * slug isn't assumed to exist on the sibling site.
 */

interface Props {
  foodName: string;
}

export function CrosswalkBridge({ foodName }: Props) {
  return (
    <aside
      data-upgrade="cross-walk-bridge"
      aria-label={`Other portfolio dimensions for ${foodName}`}
      className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
    >
      <h3 className="text-sm font-semibold text-slate-800 mb-2">
        Other dimensions for {foodName}
      </h3>
      <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
        <li>
          <a
            href="https://ingredipeek.com/"
            rel="external noopener"
            target="_blank"
            className="text-orange-700 underline-offset-2 hover:underline"
          >
            Allergen + ingredient check for {foodName} →
          </a>{" "}
          <span className="text-xs text-slate-500">(scan label ingredients against allergen rules)</span>
        </li>
        <li>
          <a
            href="https://calcpeek.com/"
            rel="external noopener"
            target="_blank"
            className="text-orange-700 underline-offset-2 hover:underline"
          >
            Calculate your daily kcal target — fit {foodName} into your day →
          </a>{" "}
          <span className="text-xs text-slate-500">(TDEE + macro split calculators)</span>
        </li>
      </ul>
    </aside>
  );
}
