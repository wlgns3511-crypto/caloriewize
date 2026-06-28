/**
 * HubReaderHelp — shared layout for hub-level "How to read…" 4-paragraph
 * reader-help sections. Each of the five hub surfaces (list/[type],
 * category/[slug], state/[slug], food/, list/) supplies its own four
 * paragraphs and renders the same visual structure.
 *
 * Slot rule (matches the per-food InterpretationStrip):
 *   1. dimensionReading   — how to read the primary axis on this hub
 *   2. commonMisreadings  — typical misinterpretation risks
 *   3. notCaptured        — what the hub does not include or guarantee
 *   4. practicalUse       — descriptive way to apply the data
 */

export interface HubReaderHelpProps {
  heading: string;
  subjectLabel: string;
  paragraphs: {
    dimensionReading: string;
    commonMisreadings: string;
    notCaptured: string;
    practicalUse: string;
  };
}

export function HubReaderHelp({ heading, subjectLabel, paragraphs }: HubReaderHelpProps) {
  return (
    <section
      data-upgrade="hub-reader-help"
      aria-label={heading}
      className="not-prose my-8 rounded-xl border border-slate-200 bg-slate-50/50 p-5"
    >
      <header className="flex flex-wrap items-baseline gap-2 mb-4">
        <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
        <span className="text-xs text-slate-500">{subjectLabel}</span>
      </header>

      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Reading the primary dimension
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{paragraphs.dimensionReading}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Common misreadings
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{paragraphs.commonMisreadings}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            What this hub does not capture
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{paragraphs.notCaptured}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Practical use
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{paragraphs.practicalUse}</p>
        </div>
      </div>
    </section>
  );
}
