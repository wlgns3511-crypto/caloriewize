import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getTopComparisons, type Food } from "@/lib/db";
import { faqSchema } from "@/lib/schema";

interface Props { params: Promise<{ slugs: string }> }

function parseSlugs(s: string): [string, string] | null {
  const m = s.match(/^(.+)-vs-(.+)$/);
  return m ? [m[1], m[2]] : null;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return getTopComparisons(5000).map((p) => {
    const [a, b] = [p.slugA, p.slugB].sort();
    return { slugs: `${a}-vs-${b}` };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const a = getFoodBySlug(parsed[0]), b = getFoodBySlug(parsed[1]);
  if (!a || !b) return {};
  return {
    title: `${a.name} vs ${b.name} - Nutrition Comparison | CalorieWize`,
    description: `Compare ${a.name} (${a.calories?.toFixed(0)} cal) vs ${b.name} (${b.calories?.toFixed(0)} cal). Side-by-side nutrition, macros, diet suitability.`,
    alternates: { canonical: `/compare/${slugs}` },
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

  const calA = a.calories ?? 0, calB = b.calories ?? 0;
  const protA = a.protein ?? 0, protB = b.protein ?? 0;
  const winner = calA < calB ? a : b;
  const proteinWinner = protA > protB ? a : b;
  const dietA = dietCheck(a), dietB = dietCheck(b);

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

      {/* Which is healthier analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Which Is Healthier: {a.name} or {b.name}?</h2>
        <div className="prose prose-sm max-w-none text-slate-700 space-y-3">
          <p>
            When comparing {a.name} and {b.name}, the healthier choice depends on your nutritional goals.
            {winner.name} is the better option if you are watching your calorie intake, providing {winner.calories?.toFixed(0)} kcal per 100g.
          </p>
          <p>
            For muscle building and satiety, {proteinWinner.name} wins with {proteinWinner.protein?.toFixed(1)}g of protein per 100g.
            {a.fiber !== null && b.fiber !== null && (
              ` In terms of fiber, ${(a.fiber ?? 0) > (b.fiber ?? 0) ? a.name : b.name} provides more at ${Math.max(a.fiber ?? 0, b.fiber ?? 0).toFixed(1)}g per 100g.`
            )}
          </p>
          <p>
            Both foods can be part of a balanced diet. Consider your specific dietary needs, whether that is
            weight loss, muscle gain, or managing a specific health condition, when making your choice.
          </p>
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
