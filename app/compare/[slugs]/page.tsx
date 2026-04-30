import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getSimilarFoods, getFoodsBySimilarCalories, type Food } from "@/lib/db";
import { AdSlot } from "@/components/AdSlot";
import { faqSchema } from "@/lib/schema";
import { STATIC_COMPARISON_SLUGS, STATIC_COMPARISON_SET, toCanonicalComparisonSlug } from "@/lib/compare-whitelist";
import { pickVariant } from "@/lib/content-helpers";

interface Props { params: Promise<{ slugs: string }> }

function parseSlugs(s: string): [string, string] | null {
  const m = s.match(/^(.+)-vs-(.+)$/);
  return m ? [m[1], m[2]] : null;
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return STATIC_COMPARISON_SLUGS.flatMap((slugs) => {
    const parsed = parseSlugs(slugs);
    if (!parsed) return [];
    return [{ slugs }, { slugs: `${parsed[1]}-vs-${parsed[0]}` }];
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const a = getFoodBySlug(parsed[0]), b = getFoodBySlug(parsed[1]);
  if (!a || !b) return {};
  const canonicalSlugs = toCanonicalComparisonSlug(a.slug, b.slug);
  if (!STATIC_COMPARISON_SET.has(canonicalSlugs)) return {};
  const title = `${a.name} vs ${b.name} - Nutrition Comparison | CalorieWize`;
  const description = `Compare ${a.name} (${a.calories?.toFixed(0)} cal) vs ${b.name} (${b.calories?.toFixed(0)} cal). Side-by-side nutrition, macros, diet suitability.`;
  return {
    title,
    description,
    alternates: { canonical: `/compare/${canonicalSlugs}/` },
    openGraph: { title, description, url: `/compare/${canonicalSlugs}/` },
  };
}

/* ── helpers ─────────────────────────────────────────────────────── */

function MacroBar({ label, valA, valB, unit, nameA, nameB }: {
  label: string; valA: number | null; valB: number | null; unit: string; nameA: string; nameB: string;
}) {
  const a = valA ?? 0, b = valB ?? 0;
  const max = Math.max(a, b, 0.1);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{label}</span>
        <span>{unit}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs w-20 truncate">{nameA}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
            <div className="bg-orange-400 h-4 rounded-full transition-all" style={{ width: `${(a / max) * 100}%` }} />
          </div>
          <span className="text-xs font-medium w-14 text-right">{valA !== null ? `${valA.toFixed(1)}` : '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-20 truncate">{nameB}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
            <div className="bg-blue-400 h-4 rounded-full transition-all" style={{ width: `${(b / max) * 100}%` }} />
          </div>
          <span className="text-xs font-medium w-14 text-right">{valB !== null ? `${valB.toFixed(1)}` : '-'}</span>
        </div>
      </div>
    </div>
  );
}

function dietCheck(food: Food) {
  const cal = food.calories ?? 999;
  const carbs = food.carbs ?? 999;
  const fat = food.fat ?? 0;
  const protein = food.protein ?? 0;
  const fiber = food.fiber ?? 0;
  return {
    keto: carbs <= 5 ? 'Yes' : carbs <= 10 ? 'Maybe' : 'No',
    lowCarb: carbs <= 20 ? 'Yes' : carbs <= 40 ? 'Maybe' : 'No',
    highProtein: protein >= 20 ? 'Yes' : protein >= 10 ? 'Maybe' : 'No',
    lowCalorie: cal <= 100 ? 'Yes' : cal <= 200 ? 'Maybe' : 'No',
    highFiber: fiber >= 5 ? 'Yes' : fiber >= 2 ? 'Maybe' : 'No',
  };
}

function DietBadge({ value }: { value: string }) {
  const cls = value === 'Yes' ? 'bg-green-100 text-green-700'
    : value === 'Maybe' ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{value}</span>;
}

/* ── page ─────────────────────────────────────────────────────────── */

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();
  const a = getFoodBySlug(parsed[0]), b = getFoodBySlug(parsed[1]);
  if (!a || !b) notFound();
  const canonicalSlugs = toCanonicalComparisonSlug(a.slug, b.slug);
  if (!STATIC_COMPARISON_SET.has(canonicalSlugs)) notFound();
  if (canonicalSlugs !== slugs) {
    redirect(`/compare/${canonicalSlugs}/`);
  }

  const calA = a.calories ?? 0, calB = b.calories ?? 0;
  const protA = a.protein ?? 0, protB = b.protein ?? 0;
  const winner = calA < calB ? a : b;
  const loser = winner === a ? b : a;
  const proteinWinner = protA > protB ? a : b;
  const proteinLoser = proteinWinner === a ? b : a;
  const fiberWinner = (a.fiber ?? 0) > (b.fiber ?? 0) ? a : b;
  const dietA = dietCheck(a), dietB = dietCheck(b);

  // Slug-hashed commentary variants — defeat template detection across the corpus.
  const calDelta = Math.abs(calA - calB);
  const protDelta = Math.abs(protA - protB);
  const pairKey = `${a.slug}-vs-${b.slug}`;
  const verdictPara1 = pickVariant(pairKey, [
    `When ${a.name} and ${b.name} land on the same plate, the calorie story comes first. ${winner.name} runs ${calDelta.toFixed(0)} kcal lighter per 100 g (${winner.calories?.toFixed(0)} vs ${loser.calories?.toFixed(0)}). For anyone tracking a daily budget, that gap compounds across regular use.`,
    `The first axis to compare ${a.name} and ${b.name} on is energy density. ${winner.name} sits at ${winner.calories?.toFixed(0)} kcal/100 g — ${calDelta.toFixed(0)} fewer than ${loser.name}. Whether that gap matters depends on serving size and how often the food appears in your week.`,
    `Calorie-wise, ${winner.name} comes in ${calDelta.toFixed(0)} kcal lighter (${winner.calories?.toFixed(0)} vs ${loser.calories?.toFixed(0)} per 100 g). The ratio matters more than the absolute number — at this gap, swapping one for the other ${calDelta >= 100 ? 'shifts the math meaningfully' : 'nudges intake slightly'}.`,
    `Comparing ${a.name} and ${b.name} on calories alone: ${winner.name} wins by ${calDelta.toFixed(0)} kcal/100 g. That's ${calDelta >= 150 ? 'a substantial gap that shows up in calorie-controlled patterns' : calDelta >= 50 ? 'a moderate gap, useful but not dramatic' : 'a small gap that mostly fades into noise across a varied diet'}.`,
  ], 1);

  const verdictPara2 = pickVariant(pairKey, [
    `On protein, ${proteinWinner.name} delivers ${proteinWinner.protein?.toFixed(1)} g vs ${proteinLoser.protein?.toFixed(1)} g — a ${protDelta.toFixed(1)} g advantage per 100 g. ${a.fiber !== null && b.fiber !== null ? `Fibre tilts toward ${fiberWinner.name} (${fiberWinner.fiber?.toFixed(1)} g), useful for satiety.` : ''}`,
    `For protein-focused eaters, ${proteinWinner.name} pulls ahead by ${protDelta.toFixed(1)} g/100 g (${proteinWinner.protein?.toFixed(1)} vs ${proteinLoser.protein?.toFixed(1)}). ${a.fiber !== null && b.fiber !== null ? `Fibre context: ${fiberWinner.name} carries the heavier load at ${fiberWinner.fiber?.toFixed(1)} g.` : ''}`,
    `${proteinWinner.name}'s ${proteinWinner.protein?.toFixed(1)} g protein/100 g beats ${proteinLoser.name}'s ${proteinLoser.protein?.toFixed(1)} g — relevant if the meal needs to anchor on protein. ${a.fiber !== null && b.fiber !== null ? `Fibre splits in favour of ${fiberWinner.name} (${fiberWinner.fiber?.toFixed(1)} g).` : ''}`,
  ], 2);

  const verdictPara3 = pickVariant(pairKey, [
    `Neither food is universally "healthier" — both fit balanced patterns when used in context. The right pick depends on what the rest of your day looks like: lower-calorie ${winner.name} for energy control, higher-protein ${proteinWinner.name} for satiety and lean-mass support.`,
    `Health framing is the wrong lens here. Both ${a.name} and ${b.name} can earn a spot in a sensible eating pattern; the choice between them rides on the role you need filled — calorie ceiling, protein anchor, or fibre contribution.`,
    `The "which is healthier" question doesn't have a clean answer at this level — both foods bring usable nutrition. Pick by the constraint that's tightest right now: calorie budget pushes you to ${winner.name}, protein target pushes you to ${proteinWinner.name}.`,
    `Don't treat one of these as the "good" choice and the other as the "bad" choice — both ${a.name} and ${b.name} have legitimate roles. The decision is contextual: which gap (calorie, protein, fibre) is most worth closing in your current pattern?`,
  ], 3);

  const rows: [string, number | null, number | null, string][] = [
    ['Calories', a.calories, b.calories, 'kcal'],
    ['Protein', a.protein, b.protein, 'g'],
    ['Total Fat', a.fat, b.fat, 'g'],
    ['Saturated Fat', a.saturated_fat, b.saturated_fat, 'g'],
    ['Carbs', a.carbs, b.carbs, 'g'],
    ['Fiber', a.fiber, b.fiber, 'g'],
    ['Sugar', a.sugar, b.sugar, 'g'],
    ['Sodium', a.sodium, b.sodium, 'mg'],
    ['Cholesterol', a.cholesterol, b.cholesterol, 'mg'],
    ['Potassium', a.potassium, b.potassium, 'mg'],
    ['Vitamin C', a.vitamin_c, b.vitamin_c, 'mg'],
    ['Calcium', a.calcium, b.calcium, 'mg'],
    ['Iron', a.iron, b.iron, 'mg'],
  ];

  const faqs = [
    {
      question: `Which has fewer calories, ${a.name} or ${b.name}?`,
      answer: `${winner.name} has fewer calories with ${winner.calories?.toFixed(0)} kcal per 100g compared to ${winner === a ? b.calories?.toFixed(0) : a.calories?.toFixed(0)} kcal.`,
    },
    {
      question: `Which has more protein, ${a.name} or ${b.name}?`,
      answer: `${proteinWinner.name} has more protein with ${proteinWinner.protein?.toFixed(1)}g per 100g compared to ${proteinWinner === a ? b.protein?.toFixed(1) : a.protein?.toFixed(1)}g.`,
    },
    {
      question: `Is ${a.name} or ${b.name} better for keto?`,
      answer: `${a.name} is ${dietA.keto === 'Yes' ? 'keto-friendly' : dietA.keto === 'Maybe' ? 'possibly keto-friendly' : 'not keto-friendly'} (${a.carbs?.toFixed(1)}g carbs), while ${b.name} is ${dietB.keto === 'Yes' ? 'keto-friendly' : dietB.keto === 'Maybe' ? 'possibly keto-friendly' : 'not keto-friendly'} (${b.carbs?.toFixed(1)}g carbs).`,
    },
    {
      question: `Which is healthier, ${a.name} or ${b.name}?`,
      answer: `It depends on your goals. ${winner.name} is lower in calories (${winner.calories?.toFixed(0)} kcal), while ${proteinWinner.name} has more protein (${proteinWinner.protein?.toFixed(1)}g). Consider your dietary needs when choosing.`,
    },
  ];

  const diets = ['keto', 'lowCarb', 'highProtein', 'lowCalorie', 'highFiber'] as const;
  const dietLabels: Record<string, string> = {
    keto: 'Keto', lowCarb: 'Low-Carb', highProtein: 'High-Protein',
    lowCalorie: 'Low-Calorie', highFiber: 'High-Fiber',
  };

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>{' / '}
        <a href="/compare" className="hover:underline">Compare</a>{' / '}
        <span className="text-slate-800">{a.name} vs {b.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{a.name} vs {b.name}: Nutrition Comparison</h1>
      <p className="text-slate-600 mb-6">
        Detailed side-by-side comparison of {a.name} and {b.name} nutrition facts per 100g serving.
      </p>

      {/* Quick verdict */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-orange-800 mb-2">Quick Verdict</h2>
        <ul className="text-sm text-orange-900 space-y-1">
          <li><strong>Lower calories:</strong> {winner.name} ({winner.calories?.toFixed(0)} kcal)</li>
          <li><strong>More protein:</strong> {proteinWinner.name} ({proteinWinner.protein?.toFixed(1)}g)</li>
          <li><strong>Less fat:</strong> {(a.fat ?? 0) < (b.fat ?? 0) ? a.name : b.name} ({Math.min(a.fat ?? 0, b.fat ?? 0).toFixed(1)}g)</li>
          <li><strong>Less carbs:</strong> {(a.carbs ?? 0) < (b.carbs ?? 0) ? a.name : b.name} ({Math.min(a.carbs ?? 0, b.carbs ?? 0).toFixed(1)}g)</li>
        </ul>
      </div>

      {/* Macro breakdown bars */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Macro Breakdown</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <MacroBar label="Calories" valA={a.calories} valB={b.calories} unit="kcal" nameA={a.name} nameB={b.name} />
          <MacroBar label="Protein" valA={a.protein} valB={b.protein} unit="g" nameA={a.name} nameB={b.name} />
          <MacroBar label="Fat" valA={a.fat} valB={b.fat} unit="g" nameA={a.name} nameB={b.name} />
          <MacroBar label="Carbs" valA={a.carbs} valB={b.carbs} unit="g" nameA={a.name} nameB={b.name} />
          <MacroBar label="Fiber" valA={a.fiber} valB={b.fiber} unit="g" nameA={a.name} nameB={b.name} />
        </div>
      </section>

      <AdSlot id="compare-mid" />

      {/* Full nutrition table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Full Nutrition Comparison (per 100g)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3">Nutrient</th>
                <th className="text-right p-3">{a.name}</th>
                <th className="text-right p-3">{b.name}</th>
                <th className="text-right p-3">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, va, vb, unit]) => {
                const diff = va !== null && vb !== null ? va - vb : null;
                return (
                  <tr key={label} className="border-b border-slate-200">
                    <td className="p-3 font-medium">{label}</td>
                    <td className={`p-3 text-right ${va !== null && vb !== null && va < vb ? 'font-bold text-green-600' : ''}`}>
                      {va !== null ? `${va.toFixed(1)} ${unit}` : '-'}
                    </td>
                    <td className={`p-3 text-right ${va !== null && vb !== null && vb < va ? 'font-bold text-green-600' : ''}`}>
                      {vb !== null ? `${vb.toFixed(1)} ${unit}` : '-'}
                    </td>
                    <td className="p-3 text-right text-xs text-slate-500">
                      {diff !== null ? `${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${unit}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Diet suitability */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Diet Suitability</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left p-3">Diet</th>
                <th className="text-center p-3">{a.name}</th>
                <th className="text-center p-3">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {diets.map((d) => (
                <tr key={d} className="border-b border-slate-200">
                  <td className="p-3 font-medium">{dietLabels[d]}</td>
                  <td className="p-3 text-center"><DietBadge value={dietA[d]} /></td>
                  <td className="p-3 text-center"><DietBadge value={dietB[d]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Which is healthier analysis — slug-hashed variants */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Which Is Healthier: {a.name} or {b.name}?</h2>
        <div className="prose prose-sm max-w-none text-slate-700 space-y-3">
          <p>{verdictPara1}</p>
          <p>{verdictPara2}</p>
          <p>{verdictPara3}</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      {/* Related links */}
      <div className="flex flex-wrap gap-4 mt-6 mb-8">
        <a href={`/food/${parsed[0]}`} className="text-orange-600 hover:underline">{a.name} nutrition &rarr;</a>
        <a href={`/food/${parsed[1]}`} className="text-orange-600 hover:underline">{b.name} nutrition &rarr;</a>
        <a href="/compare" className="text-orange-600 hover:underline">More comparisons &rarr;</a>
        <a href="/calculator" className="text-orange-600 hover:underline">Calorie calculator &rarr;</a>
      </div>

      {/* Smart related comparisons — whitelisted pairs only */}
      {(() => {
        const sameCatA = a.category ? getSimilarFoods(a.slug, a.category, 8) : [];
        const sameCatB = b.category ? getSimilarFoods(b.slug, b.category, 8) : [];
        const similarCal = getFoodsBySimilarCalories(a, 8).filter(f => f.slug !== b.slug);
        const validA = sameCatA.filter(f => STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(a.slug, f.slug))).slice(0, 4);
        const validB = sameCatB.filter(f => STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(b.slug, f.slug))).slice(0, 4);
        const validCal = similarCal.filter(f => STATIC_COMPARISON_SET.has(toCanonicalComparisonSlug(a.slug, f.slug))).slice(0, 4);
        if (validA.length === 0 && validB.length === 0 && validCal.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">Related Comparisons</h2>
            {validA.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Compare {a.name} with similar foods</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {validA.map((f) => {
                    const slug = toCanonicalComparisonSlug(a.slug, f.slug);
                    return (
                      <a key={f.slug} href={`/compare/${slug}/`}
                        className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-orange-700 rounded-full">
                        vs {f.name} ({f.calories?.toFixed(0)} cal)
                      </a>
                    );
                  })}
                </div>
              </>
            )}
            {validB.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Compare {b.name} with similar foods</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {validB.map((f) => {
                    const slug = toCanonicalComparisonSlug(b.slug, f.slug);
                    return (
                      <a key={f.slug} href={`/compare/${slug}/`}
                        className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-orange-700 rounded-full">
                        vs {f.name} ({f.calories?.toFixed(0)} cal)
                      </a>
                    );
                  })}
                </div>
              </>
            )}
            {validCal.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Similar calorie foods</h3>
                <div className="flex flex-wrap gap-2">
                  {validCal.map((f) => {
                    const slug = toCanonicalComparisonSlug(a.slug, f.slug);
                    return (
                      <a key={f.slug} href={`/compare/${slug}/`}
                        className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded-full">
                        {a.name} vs {f.name}
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        );
      })()}

      {/* High-CPC footer */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-8">
        <h2 className="text-lg font-bold mb-3">Looking for More?</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Meal Delivery Plans</h3>
            <p className="text-slate-600">
              Get perfectly portioned meals with exact nutrition info delivered to your door.
              Compare top meal delivery services for your diet goals.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Nutrition Supplements</h3>
            <p className="text-slate-600">
              Fill nutritional gaps with quality supplements.
              Find the best protein powders, vitamins, and minerals for your needs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Weight Loss Programs</h3>
            <p className="text-slate-600">
              Science-backed weight loss programs that work.
              Compare plans with personalized nutrition coaching and tracking.
            </p>
          </div>
        </div>
      </section>

      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
