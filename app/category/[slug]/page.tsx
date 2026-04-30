import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategories, getFoodsByCategory } from "@/lib/db";
import { getCategoryStats } from "@/lib/food-facts";
import { getCategoryInsight } from "@/lib/food-cluster-insights";
import { fmtCount, fmtNutrient, titleCase } from "@/lib/content-helpers";
import { breadcrumbSchema } from "@/lib/schema";
import { FreshnessTag } from "@/components/FreshnessTag";
import { AuthorBox } from "@/components/AuthorBox";
import { DataSourceBadge } from "@/components/DataSourceBadge";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) return {};
  const foods = getFoodsByCategory(slug);
  // 2026-04-28 — title pattern: query-match prefix + count-as-freshness signal.
  // Previous "Category - Calories & Nutrition" was generic; new title front-loads
  // the count and the per-100g pattern users actually search for.
  const title = `${cat.name} Calories & Nutrition (${foods.length} foods, USDA)`;
  const description = `${cat.name} nutrition database — ${foods.length} foods with calories, protein, fat, carbs, fibre, sodium and full daily-value % per 100 g. USDA FoodData Central source. Sorted lists for highest/lowest calorie, protein, and fibre.`;
  return {
    title: title.length > 60 ? `${cat.name} Calories (${foods.length} foods, USDA)` : title,
    description,
    alternates: { canonical: `/category/${slug}/` },
    openGraph: { url: `/category/${slug}/` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cats = getAllCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();
  const foods = getFoodsByCategory(slug);

  // Layer 1 aggregates
  const stats = getCategoryStats(slug);

  // Layer 2 narrative (slug-hash variants)
  const insight = getCategoryInsight(slug, cat.name, foods);

  // Sorted top-N lists for thickening
  const withCal = foods.filter((f) => f.calories != null && f.calories > 0);
  const highestCal = [...withCal].sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0)).slice(0, 10);
  const lowestCal = [...withCal].sort((a, b) => (a.calories ?? 0) - (b.calories ?? 0)).slice(0, 10);
  const highestProtein = foods
    .filter((f) => f.protein != null && f.protein > 0)
    .sort((a, b) => (b.protein ?? 0) - (a.protein ?? 0))
    .slice(0, 10);
  const highestFiber = foods
    .filter((f) => f.fiber != null && f.fiber > 0)
    .sort((a, b) => (b.fiber ?? 0) - (a.fiber ?? 0))
    .slice(0, 10);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Categories", url: "/category" },
    { name: cat.name, url: `/category/${slug}/` },
  ];

  // FAQ Q&A — bound to the actual aggregates so each category has unique answers
  const faqs = stats
    ? [
        {
          question: `What is the average calorie content of ${cat.name.toLowerCase()}?`,
          answer: `Across ${fmtCount(stats.count)} ${cat.name.toLowerCase()} items in this database, mean calories per 100 g is ${stats.calMean.toFixed(0)} kcal and median is ${stats.calMedian.toFixed(0)} kcal. The top 10% of items in this category land at or above ${stats.calP90.toFixed(0)} kcal/100 g.`,
        },
        {
          question: `How much protein does ${cat.name.toLowerCase()} typically contain?`,
          answer: `Mean protein content across ${cat.name.toLowerCase()} items is ${stats.proteinMean.toFixed(1)} g per 100 g (median ${stats.proteinMedian.toFixed(1)} g). The top decile clears ${stats.proteinP90.toFixed(1)} g protein per 100 g.`,
        },
        {
          question: `Which ${cat.name.toLowerCase()} items have the most fibre?`,
          answer: highestFiber.length
            ? `${highestFiber[0].name} leads with ${(highestFiber[0].fiber ?? 0).toFixed(1)} g of fibre per 100 g, followed by ${highestFiber.slice(1, 4).map((f) => f.name).join(', ')}. Category mean fibre is ${stats.fiberMean.toFixed(1)} g.`
            : `Fibre data is sparse for many ${cat.name.toLowerCase()} items in the USDA dataset, but where reported, mean fibre is ${stats.fiberMean.toFixed(1)} g per 100 g.`,
        },
        {
          question: `What is the lowest-calorie option in ${cat.name.toLowerCase()}?`,
          answer: lowestCal.length
            ? `${lowestCal[0].name} at ${(lowestCal[0].calories ?? 0).toFixed(0)} kcal per 100 g is the lowest-calorie option, with ${lowestCal[1]?.name ?? '—'} (${(lowestCal[1]?.calories ?? 0).toFixed(0)} kcal) close behind.`
            : `No calorie data is reported for items in this category.`,
        },
        {
          question: `Where does this data come from?`,
          answer: `All values are sourced from the USDA FoodData Central database, which provides standard 100 g nutrient profiles for foods in the US food supply. Public-domain CC0 licence; updated periodically by USDA.`,
        },
      ]
    : [];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {i < breadcrumbs.length - 1 ? (
              <a href={b.url} className="hover:underline">{b.name}</a>
            ) : (
              <span className="text-slate-800">{b.name}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{cat.name}</h1>
        <p className="text-slate-600">
          {fmtCount(foods.length)} foods with full nutrition data per 100 g, sourced from USDA FoodData Central.
        </p>
      </header>

      {/* Layer 2 — narrative intro */}
      <section className="mb-8" data-upgrade="cluster-intro">
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-4">
          <p>{insight.intro}</p>
          <p>{insight.distribution}</p>
          <p>{insight.practicalUse}</p>
        </div>
      </section>

      {/* Layer 1 — aggregate stats panel */}
      {stats && (
        <section className="mb-8" data-upgrade="cat-stats">
          <h2 className="text-xl font-bold mb-3">Category at a glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Mean calories" value={`${stats.calMean.toFixed(0)} kcal`} sub={`Median ${stats.calMedian.toFixed(0)}`} />
            <StatCard label="Top 10% calories" value={`${stats.calP90.toFixed(0)} kcal+`} sub={`per 100 g`} />
            <StatCard label="Mean protein" value={fmtNutrient(stats.proteinMean, 'g')} sub={`Median ${stats.proteinMedian.toFixed(1)} g`} />
            <StatCard label="Mean fibre" value={fmtNutrient(stats.fiberMean, 'g')} sub={`Top 10% ${stats.fiberP90.toFixed(1)}+ g`} />
            <StatCard label="Mean sodium" value={`${stats.sodiumMean.toFixed(0)} mg`} sub={`Top 10% ${stats.sodiumP90.toFixed(0)}+ mg`} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Means and medians computed over {fmtCount(stats.count)} items with reported values per 100 g.
          </p>
        </section>
      )}

      {/* Layer 1 — top/bottom lists */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {highestCal.length > 0 && (
          <section data-upgrade="highest-cal">
            <h2 className="text-lg font-bold mb-3">Highest-calorie {cat.name.toLowerCase()}</h2>
            <ol className="space-y-1">
              {highestCal.map((f, i) => (
                <li key={f.slug} className="flex justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    <a href={`/food/${f.slug}/`} className="text-orange-600 hover:underline">{f.name}</a>
                  </span>
                  <span className="text-sm text-slate-500">{(f.calories ?? 0).toFixed(0)} kcal</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {lowestCal.length > 0 && (
          <section data-upgrade="lowest-cal">
            <h2 className="text-lg font-bold mb-3">Lowest-calorie {cat.name.toLowerCase()}</h2>
            <ol className="space-y-1">
              {lowestCal.map((f, i) => (
                <li key={f.slug} className="flex justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    <a href={`/food/${f.slug}/`} className="text-orange-600 hover:underline">{f.name}</a>
                  </span>
                  <span className="text-sm text-slate-500">{(f.calories ?? 0).toFixed(0)} kcal</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {highestProtein.length > 0 && (
          <section data-upgrade="highest-protein">
            <h2 className="text-lg font-bold mb-3">Highest-protein {cat.name.toLowerCase()}</h2>
            <ol className="space-y-1">
              {highestProtein.map((f, i) => (
                <li key={f.slug} className="flex justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    <a href={`/food/${f.slug}/`} className="text-orange-600 hover:underline">{f.name}</a>
                  </span>
                  <span className="text-sm text-slate-500">{(f.protein ?? 0).toFixed(1)} g</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {highestFiber.length > 0 && (
          <section data-upgrade="highest-fiber">
            <h2 className="text-lg font-bold mb-3">Highest-fibre {cat.name.toLowerCase()}</h2>
            <ol className="space-y-1">
              {highestFiber.map((f, i) => (
                <li key={f.slug} className="flex justify-between p-2 hover:bg-slate-50 rounded">
                  <span className="text-sm">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    <a href={`/food/${f.slug}/`} className="text-orange-600 hover:underline">{f.name}</a>
                  </span>
                  <span className="text-sm text-slate-500">{(f.fiber ?? 0).toFixed(1)} g</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {/* Full alphabetical list */}
      <section className="mb-8" data-upgrade="full-list">
        <h2 className="text-xl font-bold mb-3">All {cat.name.toLowerCase()} ({fmtCount(foods.length)})</h2>
        <p className="text-sm text-slate-500 mb-3">Alphabetical. Tap any item for full nutrition profile, daily value % breakdown, and peer comparison.</p>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          {foods.map((f) => (
            <a
              key={f.slug}
              href={`/food/${f.slug}/`}
              className="flex justify-between p-3 border border-slate-100 rounded hover:bg-orange-50 transition-colors"
            >
              <span className="truncate pr-3">{f.name}</span>
              <span className="text-slate-400 flex-shrink-0">{f.calories?.toFixed(0) ?? '—'} cal</span>
            </a>
          ))}
        </div>
      </section>

      {/* Layer 1 — related categories */}
      <section className="mb-8" data-upgrade="other-cats">
        <h2 className="text-xl font-bold mb-3">Other categories</h2>
        <div className="flex flex-wrap gap-2">
          {cats
            .filter((c) => c.slug !== slug)
            .slice(0, 12)
            .map((c) => (
              <a
                key={c.slug}
                href={`/category/${c.slug}/`}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-sm hover:bg-orange-50 hover:border-orange-200"
              >
                {c.name}
              </a>
            ))}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mb-8" data-upgrade="cat-faq">
          <h2 className="text-xl font-bold mb-3">Frequently asked questions</h2>
          {faqs.map((f, i) => (
            <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
              <summary className="p-4 cursor-pointer font-medium">{f.question}</summary>
              <div className="px-4 pb-4 text-slate-600">{f.answer}</div>
            </details>
          ))}
        </section>
      )}

      <AuthorBox />
      <FreshnessTag source="USDA FoodData Central (CC0 public domain, nutrient data)" />
      <DataSourceBadge
        sources={[
          { name: "USDA FoodData Central", url: "https://fdc.nal.usda.gov/" },
          { name: "USDA Dietary Guidelines", url: "https://www.dietaryguidelines.gov/" },
          { name: "FDA Daily Values", url: "https://www.fda.gov/food/new-nutrition-facts-label/daily-value-new-nutrition-and-supplement-facts-labels" },
        ]}
      />

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${cat.name} foods`,
            description: `Nutrition data for ${foods.length} ${cat.name.toLowerCase()} items per 100 g (USDA FoodData Central).`,
            numberOfItems: foods.length,
            itemListElement: foods.slice(0, 50).map((f, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://caloriewize.com/food/${f.slug}/`,
              name: f.name,
            })),
          }),
        }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
