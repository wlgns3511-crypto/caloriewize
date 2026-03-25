import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getAllFoods, getSimilarFoods } from "@/lib/db";
import { breadcrumbSchema, faqSchema, nutritionSchema } from "@/lib/schema";

interface Props { params: Promise<{ slug: string }> }

function fmt(v: number | null, unit = 'g'): string { return v !== null ? `${v.toFixed(1)}${unit}` : 'N/A'; }

export async function generateStaticParams() {
  return getAllFoods().slice(0, 2000).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) return {};
  return {
    title: `${f.name} Calories & Nutrition Facts`,
    description: `${f.name} has ${f.calories?.toFixed(0) || '?'} calories per 100g. Protein: ${fmt(f.protein)}, Carbs: ${fmt(f.carbs)}, Fat: ${fmt(f.fat)}. Full nutrition breakdown.`,
    alternates: { canonical: `/food/${slug}` },
  };
}

export default async function FoodPage({ params }: Props) {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) notFound();

  const similar = getSimilarFoods(slug, f.category, 8);
  const faqs = [
    { question: `How many calories are in ${f.name}?`, answer: `${f.name} contains ${f.calories?.toFixed(0) || 'unknown'} calories per 100g serving.` },
    ...(f.protein ? [{ question: `How much protein is in ${f.name}?`, answer: `${f.name} has ${f.protein.toFixed(1)}g of protein per 100g.` }] : []),
    ...(f.carbs ? [{ question: `How many carbs are in ${f.name}?`, answer: `${f.name} contains ${f.carbs.toFixed(1)}g of carbohydrates per 100g.` }] : []),
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Foods", url: "/food" },
    { name: f.name, url: `/food/${slug}` },
  ];

  const macroTotal = (f.protein || 0) + (f.carbs || 0) + (f.fat || 0);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (<span key={i}>{i > 0 && " / "}{i < 2 ? <a href={b.url} className="hover:underline">{b.name}</a> : <span className="text-slate-800">{b.name}</span>}</span>))}
      </nav>

      <h1 className="text-3xl font-bold mb-2">{f.name}</h1>
      <p className="text-slate-500 mb-6">Nutrition facts per 100g serving</p>

      <div className="bg-orange-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-slate-500">Calories</div>
            <div className="text-3xl font-bold text-orange-600">{f.calories?.toFixed(0) || '-'}</div>
            <div className="text-xs text-slate-400">kcal</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Protein</div>
            <div className="text-2xl font-bold text-blue-600">{fmt(f.protein)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Carbs</div>
            <div className="text-2xl font-bold text-green-600">{fmt(f.carbs)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Fat</div>
            <div className="text-2xl font-bold text-yellow-600">{fmt(f.fat)}</div>
          </div>
        </div>
      </div>

      {macroTotal > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Macro Split</h2>
          <div className="flex h-6 rounded-full overflow-hidden">
            {f.protein && f.protein > 0 && <div className="bg-blue-400" style={{ width: `${(f.protein / macroTotal) * 100}%` }} title={`Protein ${fmt(f.protein)}`} />}
            {f.carbs && f.carbs > 0 && <div className="bg-green-400" style={{ width: `${(f.carbs / macroTotal) * 100}%` }} title={`Carbs ${fmt(f.carbs)}`} />}
            {f.fat && f.fat > 0 && <div className="bg-yellow-400" style={{ width: `${(f.fat / macroTotal) * 100}%` }} title={`Fat ${fmt(f.fat)}`} />}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span className="text-blue-600">Protein {macroTotal > 0 ? ((f.protein || 0) / macroTotal * 100).toFixed(0) : 0}%</span>
            <span className="text-green-600">Carbs {macroTotal > 0 ? ((f.carbs || 0) / macroTotal * 100).toFixed(0) : 0}%</span>
            <span className="text-yellow-600">Fat {macroTotal > 0 ? ((f.fat || 0) / macroTotal * 100).toFixed(0) : 0}%</span>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Full Nutrition Facts</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {[
            ['Calories', f.calories, 'kcal'],
            ['Protein', f.protein, 'g'],
            ['Total Fat', f.fat, 'g'],
            ['Saturated Fat', f.saturated_fat, 'g'],
            ['Carbohydrates', f.carbs, 'g'],
            ['Fiber', f.fiber, 'g'],
            ['Sugar', f.sugar, 'g'],
            ['Sodium', f.sodium, 'mg'],
            ['Cholesterol', f.cholesterol, 'mg'],
            ['Potassium', f.potassium, 'mg'],
            ['Vitamin C', f.vitamin_c, 'mg'],
            ['Calcium', f.calcium, 'mg'],
            ['Iron', f.iron, 'mg'],
          ].map(([label, val, unit]) => (
            <div key={label as string} className="flex justify-between p-3 border-b border-slate-100 hover:bg-slate-50">
              <span className="text-sm">{label as string}</span>
              <span className="text-sm font-medium">{val !== null && val !== undefined ? `${(val as number).toFixed(1)} ${unit}` : 'N/A'}</span>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Similar Foods</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {similar.map((s) => {
              const [a, b] = [slug, s.slug].sort();
              return (
                <div key={s.slug} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                  <a href={`/food/${s.slug}`} className="text-sm text-orange-600 hover:underline">{s.name}</a>
                  <div className="flex gap-3 text-xs text-slate-500">
                    <span>{s.calories?.toFixed(0)} cal</span>
                    <a href={`/compare/${a}-vs-${b}`} className="text-orange-500 hover:underline">Compare</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nutritionSchema(f.name, f)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
