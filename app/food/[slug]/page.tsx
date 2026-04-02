import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFoodBySlug, getAllFoods, getSimilarFoods, getPopularFoods, getFoodsBySimilarCalories, getRandomFoods } from "@/lib/db";
import { breadcrumbSchema, faqSchema, nutritionSchema } from "@/lib/schema";
import { analyzeFood } from "@/lib/nutrition-analysis";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { EmbedButton } from "@/components/EmbedButton";
import { FreshnessTag } from "@/components/FreshnessTag";
import { TDEECalculator } from "@/components/TDEECalculator";
import { CiteButton } from "@/components/CiteButton";
import { AuthorBox } from "@/components/AuthorBox";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { MacroBar } from "@/components/MacroBar";
import { CalorieGuessGame } from "@/components/CalorieGuessGame";

interface Props { params: Promise<{ slug: string }> }

function fmt(v: number | null, unit = 'g'): string { return v !== null ? `${v.toFixed(1)}${unit}` : 'N/A'; }

const dvBarColor: Record<string, string> = {
  low: "bg-green-400",
  moderate: "bg-blue-400",
  high: "bg-orange-400",
  very_high: "bg-red-400",
};

export async function generateStaticParams() {
  return getAllFoods().slice(0, 2000).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) return {};
  return {
    title: `${f.name} — Calories, Nutrition & Diet Info`,
    description: `Is ${f.name} healthy? ${f.calories?.toFixed(0) || '?'} cal, ${fmt(f.protein)} protein, ${fmt(f.carbs)} carbs, ${fmt(f.fat)} fat per 100g. Diet compatibility, daily value %, and healthier alternatives.`,
    alternates: { canonical: `/food/${slug}` },
    openGraph: { url: `/food/${slug}` },
  };
}

export default async function FoodPage({ params }: Props) {
  const { slug } = await params;
  const f = getFoodBySlug(slug);
  if (!f) notFound();

  const similar = getSimilarFoods(slug, f.category, 8);
  const quizFoods = getRandomFoods(20)
    .filter(rf => rf.slug !== slug && rf.calories !== null)
    .map(rf => ({ name: rf.name, slug: rf.slug, calories: rf.calories!, category: rf.category || '' }));
  const analysis = analyzeFood(f);

  const faqs = [
    { question: `How many calories are in ${f.name}?`, answer: `${f.name} contains ${f.calories?.toFixed(0) || 'unknown'} calories per 100g serving. This makes it a ${analysis.calorieCategory} food. ${analysis.highlights.length > 0 ? analysis.highlights[0] + '.' : ''}` },
    { question: `Is ${f.name} healthy?`, answer: analysis.summary },
    ...(f.protein ? [{ question: `Is ${f.name} high in protein?`, answer: `${f.name} has ${f.protein.toFixed(1)}g of protein per 100g, making it a ${analysis.proteinCategory} food. ${f.protein >= 15 ? "This is a great choice for muscle building and recovery." : "Consider pairing with other protein-rich foods to meet your daily needs."}` }] : []),
    { question: `Is ${f.name} good for a keto diet?`, answer: analysis.dietCompatibility.find(d => d.name === "Keto")?.reason || "" },
    { question: `Is ${f.name} good for weight loss?`, answer: `${f.name} has ${f.calories?.toFixed(0)} calories per 100g. ${(f.calories || 0) < 100 ? "With under 100 calories per 100g, it can be a good option for calorie-controlled diets." : (f.calories || 0) < 200 ? "At moderate calories, it can fit into a weight loss plan in controlled portions." : "It is calorie-dense, so portion control is important if you are watching your weight."}${(f.fiber || 0) >= 3 ? ` The fiber content (${f.fiber?.toFixed(1)}g) helps with satiety.` : ""}` },
    ...(analysis.concerns.length > 0 ? [{ question: `Are there any health concerns with ${f.name}?`, answer: `Some things to watch: ${analysis.concerns.join(". ")}. As with any food, moderation is key.` }] : []),
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

      <EditorNote note={`All nutrition values for ${f.name} are sourced from the USDA FoodData Central database and represent standard 100g serving sizes. Individual products may vary slightly based on brand and preparation method.`} />

      {/* Health Summary */}
      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg mb-6">
        <h2 className="font-semibold text-emerald-800 mb-1">Health Summary</h2>
        <p className="text-slate-700 text-sm">{analysis.summary}</p>
      </div>

      {/* Macro Card */}
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

      {/* Macro Split */}
      {macroTotal > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Macro Split</h2>
          <div className="flex h-6 rounded-full overflow-hidden">
            {f.protein && f.protein > 0 && <div className="bg-blue-400" style={{ width: `${(f.protein / macroTotal) * 100}%` }} title={`Protein ${fmt(f.protein)}`} />}
            {f.carbs && f.carbs > 0 && <div className="bg-green-400" style={{ width: `${(f.carbs / macroTotal) * 100}%` }} title={`Carbs ${fmt(f.carbs)}`} />}
            {f.fat && f.fat > 0 && <div className="bg-yellow-400" style={{ width: `${(f.fat / macroTotal) * 100}%` }} title={`Fat ${fmt(f.fat)}`} />}
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span className="text-blue-600">Protein {((f.protein || 0) / macroTotal * 100).toFixed(0)}%</span>
            <span className="text-green-600">Carbs {((f.carbs || 0) / macroTotal * 100).toFixed(0)}%</span>
            <span className="text-yellow-600">Fat {((f.fat || 0) / macroTotal * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <MacroBar carbs={f.carbs} protein={f.protein} fat={f.fat} />

      {/* Highlights & Concerns */}
      {(analysis.highlights.length > 0 || analysis.concerns.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {analysis.highlights.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 mb-2">Nutritional Highlights</h3>
              <ul className="space-y-1">
                {analysis.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.concerns.length > 0 && (
            <div className="bg-amber-50 rounded-lg p-4">
              <h3 className="font-semibold text-amber-700 mb-2">Watch Out For</h3>
              <ul className="space-y-1">
                {analysis.concerns.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">!</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <AdSlot id="food-after-highlights" />

      {quizFoods.length >= 5 && <CalorieGuessGame foods={quizFoods} />}

      {/* Diet Compatibility */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Diet Compatibility</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {analysis.dietCompatibility.map((d) => (
            <div key={d.name} className={`p-3 rounded-lg border text-center ${d.compatible ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="text-2xl mb-1">{d.compatible ? "✅" : "⚠️"}</div>
              <div className="font-medium text-sm">{d.name}</div>
              <div className="text-xs text-slate-500 mt-1">{d.compatible ? "Compatible" : "Not ideal"}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Value % Breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">% Daily Value (per 100g)</h2>
        <p className="text-xs text-slate-400 mb-3">Based on a 2,000 calorie diet</p>
        <div className="space-y-2">
          {analysis.dvBreakdown.filter(d => d.value > 0).map((d) => (
            <div key={d.nutrient} className="flex items-center gap-3">
              <span className="text-sm w-28 text-slate-600">{d.nutrient}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                <div className={`h-full rounded-full ${dvBarColor[d.level]}`} style={{ width: `${Math.min(d.percent, 100)}%` }} />
              </div>
              <span className="text-sm font-medium w-12 text-right">{d.percent}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* Full Nutrition Facts */}
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

      <DidYouKnow fact={`${f.name} provides ${f.calories?.toFixed(0) || '?'} kcal per 100g. ${(f.protein || 0) >= 15 ? `With ${f.protein?.toFixed(1)}g of protein, it is considered a high-protein food that supports muscle maintenance and repair.` : (f.fiber || 0) >= 5 ? `With ${f.fiber?.toFixed(1)}g of fiber per serving, it can support digestive health and help you feel full longer.` : `Balancing ${f.name} with a variety of other nutrient-dense foods is the best way to meet your daily nutritional needs.`}`} />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Related:</strong> Check if this food is safe for your diet at <a href="https://ingredipeek.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">IngrediPeek</a> — allergen and ingredient checker for 20,000+ products.
        </p>
      </div>

      <AdSlot id="food-before-similar" />

      {/* Similar Foods */}
      {similar.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Similar Foods to Compare</h2>
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

      {/* Cross-category comparisons — smart internal links */}
      {(() => {
        const crossCat = getFoodsBySimilarCalories(f, 6);
        if (crossCat.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Compare Across Categories</h2>
            <p className="text-sm text-slate-500 mb-3">Foods with similar calories from different categories</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {crossCat.map((c) => {
                const [x, y] = [slug, c.slug].sort();
                return (
                  <a key={c.slug} href={`/compare/${x}-vs-${y}`}
                    className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-orange-50">
                    <span className="text-sm text-orange-600">{f.name} vs {c.name}</span>
                    <span className="text-xs text-slate-400">{c.calories?.toFixed(0)} cal</span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* TDEE Calculator */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">How Does {f.name} Fit Your Daily Calories?</h2>
        <p className="text-sm text-slate-500 mb-4">Use the calculator below to find your daily calorie needs and see how {f.name} fits into your diet plan.</p>
        <div className="max-w-xl">
          <TDEECalculator />
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <AuthorBox />

      <FreshnessTag source="USDA FoodData Central" />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`${f.name} Nutrition Facts`} url={`https://caloriewize.com/food/${slug}`} source="CalorieWize (USDA Data)" />
      </div>

          <EmbedButton url="https://caloriewize.com" title="Data from CalorieWize" site="CalorieWize" siteUrl="https://caloriewize.com" />

      {/* Discover More Comparisons — random pairs */}
      {(() => {
        const randomFoods = getRandomFoods(12);
        const pairs = randomFoods
          .filter((r) => r.slug !== slug)
          .slice(0, 10)
          .map((r) => {
            const [x, y] = [slug, r.slug].sort();
            return { slug: `${x}-vs-${y}`, nameA: x === slug ? f.name : r.name, nameB: x === slug ? r.name : f.name, cal: r.calories };
          });
        if (pairs.length === 0) return null;
        return (
          <section className="mt-8 mb-8">
            <h2 className="text-xl font-bold mb-3">Discover More Comparisons</h2>
            <p className="text-sm text-slate-500 mb-3">See how {f.name} stacks up against other foods</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {pairs.map((p) => (
                <a key={p.slug} href={`/compare/${p.slug}`}
                  className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-orange-50 transition-colors">
                  <span className="text-sm text-orange-600">{p.nameA} vs {p.nameB}</span>
                  <span className="text-xs text-slate-400">{p.cal?.toFixed(0)} cal</span>
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Popular Foods to Compare */}
      {(() => {
        const popular = getPopularFoods(8).filter(p => p.slug !== slug);
        if (!popular.length) return null;
        return (
          <section className="mt-8 mb-8">
            <h2 className="text-xl font-bold mb-3">Compare with Popular Foods</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {popular.map(p => {
                const [a, b] = [slug, p.slug].sort();
                return (
                  <a key={p.slug} href={`/compare/${a}-vs-${b}/`}
                    className="flex justify-between items-center p-3 border border-slate-100 rounded-lg hover:bg-orange-50 transition-colors">
                    <span className="text-sm text-orange-600">{f.name} vs {p.name}</span>
                    <span className="text-xs text-slate-400">{p.calories?.toFixed(0)} cal</span>
                  </a>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Foods in Same Category */}
      {(() => {
        const sameCategory = getSimilarFoods(slug, f.category, 12).slice(8);
        if (!sameCategory.length) return null;
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">More {f.category ? f.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Similar'} Foods</h2>
            <div className="flex flex-wrap gap-2">
              {sameCategory.map(s => (
                <a key={s.slug} href={`/food/${s.slug}/`} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100 transition-colors">
                  {s.name}
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Related Data Resources */}
      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://ingredipeek.com" className="text-orange-600 hover:underline">IngrediPeek - Food allergen checker &rarr;</a>
          <a href="https://calcpeek.com" className="text-orange-600 hover:underline">CalcPeek - TDEE calculator &rarr;</a>
        </div>
      </section>

          <DataFeedback />

          <section className="mt-8 p-6 bg-green-50 rounded-xl border border-green-100">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Reach Your Health Goals</h3>
        <p className="text-green-800 text-sm leading-relaxed">
          Try a personalized meal delivery plan or consult with a registered dietitian to build a nutrition strategy that works for you.
          Track your daily intake with smart food scales and nutrition tracking apps.
        </p>
      </section>

      <DataSourceBadge sources={[
        { name: "USDA FoodData Central", url: "https://fdc.nal.usda.gov" },
        { name: "FDA", url: "https://www.fda.gov" },
      ]} />

      <CrossSiteLinks current="FoodData" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        ...nutritionSchema(f.name, f),
        dateModified: new Date().toISOString().split('T')[0],
        author: { "@type": "Organization", name: "DataPeek" },
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
