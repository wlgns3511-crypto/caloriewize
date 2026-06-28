/**
 * InterpretationStrip — PSU per-food 4-paragraph reader-help.
 *
 * Renders two lenses for a single food row:
 *  1. 5-bucket dietary-fit lens (carrying-patterns row): which of the five
 *     published per-100-g pattern thresholds (DGA Mediterranean, NIH NCBI
 *     ketogenic, USDA FDC + NOVA minimally-processed, FDA low-sodium, NHLBI
 *     DASH) the row clears.
 *  2. 4-paragraph interpretation strip: dvReading / commonMisreadings /
 *     notCaptured / practicalContext, all sourced from the food row's USDA
 *     values and the FDA / NIH thresholds in lib/food-classifier.ts.
 *
 * Pure presentation. No fetch, no state. Caller passes the `interpretation`
 * and `fits` from the lib functions; this component only formats them.
 */

import type { DietPattern } from '@/lib/dietary-fit';
import { DIET_PATTERN_LABEL, DIET_PATTERN_CITATION } from '@/lib/dietary-fit';
import type { FoodInterpretation } from '@/lib/food-classifier';

const TONE_BG: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50/40',
  amber: 'border-amber-200 bg-amber-50/40',
  rose: 'border-rose-200 bg-rose-50/40',
  indigo: 'border-indigo-200 bg-indigo-50/40',
  slate: 'border-slate-200 bg-slate-50/40',
};

const TONE_PILL: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  rose: 'bg-rose-100 text-rose-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  slate: 'bg-slate-100 text-slate-800',
};

const ALL_PATTERNS: DietPattern[] = [
  'mediterranean-style',
  'ketogenic-clinical',
  'minimally-processed',
  'low-sodium-fda',
  'dash-style',
];

export interface InterpretationStripProps {
  foodName: string;
  interpretation: FoodInterpretation;
  fits: DietPattern[];
  carryingNarrative: string;
}

export function InterpretationStrip({
  foodName,
  interpretation,
  fits,
  carryingNarrative,
}: InterpretationStripProps) {
  const tone = interpretation.tone;
  const fitsSet = new Set(fits);

  return (
    <section
      data-upgrade="interpretation-strip"
      aria-label={`How to read ${foodName}`}
      className={`not-prose my-8 rounded-xl border ${TONE_BG[tone] ?? TONE_BG.slate} p-5`}
    >
      <header className="flex flex-wrap items-baseline gap-3 mb-4">
        <h2 className="text-xl font-bold text-slate-900">How to read this food</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TONE_PILL[tone] ?? TONE_PILL.slate}`}>
          {interpretation.tierLabel}
        </span>
        {interpretation.standout && (
          <span className="text-xs text-slate-500">
            standout: {interpretation.standout.label}, {interpretation.standout.percentDv}% DV
          </span>
        )}
      </header>

      {/* 5-bucket dietary-fit row */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Per-100-g pattern fit (5 published patterns)
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_PATTERNS.map((p) => {
            const active = fitsSet.has(p);
            const cite = DIET_PATTERN_CITATION[p];
            return (
              <a
                key={p}
                href={cite.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${cite.source} — ${cite.spec}`}
                className={
                  active
                    ? 'inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-200 hover:bg-emerald-200 transition-colors'
                    : 'inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs border border-slate-200 hover:bg-slate-200 transition-colors'
                }
              >
                <span aria-hidden="true">{active ? '●' : '○'}</span>
                {DIET_PATTERN_LABEL[p]}
              </a>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{carryingNarrative}</p>
      </div>

      {/* 4-paragraph strip */}
      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Reading the %DV column
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {interpretation.paragraphs.dvReading}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Common misreadings
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {interpretation.paragraphs.commonMisreadings}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            What the row does not capture
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {interpretation.paragraphs.notCaptured}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Practical use in a meal plan
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {interpretation.paragraphs.practicalContext}
          </p>
        </div>
      </div>
    </section>
  );
}
