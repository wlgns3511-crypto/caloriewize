/**
 * /list/  — caloriewize HCU 5-chunk patch (2026-04-28).
 *
 * Hub page that lists all 15 list types so the sub-pages have a
 * sensible parent in the breadcrumb and Google has a cluster anchor.
 */
import type { Metadata } from "next";
import { getAllListTypes, getListInsight } from "@/lib/food-cluster-insights";
import { FreshnessTag } from "@/components/FreshnessTag";

export const metadata: Metadata = {
  title: "Food lists by nutrient: 15 ranked guides (USDA)",
  description: "Curated lists of foods sorted by calories, protein, fibre, vitamins, and minerals. 15 ranked guides drawn from USDA FoodData Central with full per-100-g nutrition data.",
  alternates: { canonical: "/list/" },
  openGraph: { url: "/list/" },
};

export default function ListIndexPage() {
  const types = getAllListTypes();
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Food lists", url: "/list/" },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {" / "}
        <span className="text-slate-800">Food lists</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Food lists by nutrient</h1>
        <p className="text-slate-600">
          15 ranked lists drawn from USDA FoodData Central. Each list sorts foods by a single dimension — calories, protein, fibre, vitamins, or minerals — to help you find the items that match a specific dietary goal.
        </p>
      </header>

      <section className="mb-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed">
          <p>
            These lists are mechanical sorts of the underlying USDA dataset, not opinion-driven recommendations. Each ranks the top 60 foods on its dimension and pairs the ranking with median and top-decile context, so you can see where the cutoffs land before adopting any of the items into a regular pattern.
          </p>
          <p className="mt-3">
            Combine lists for harder questions: items appearing on both <em>high-protein</em> and <em>low-calorie</em> are the lean-protein workhorses; items on <em>high-fibre</em> and <em>low-sugar</em> tend to be whole grains and legumes. The cross-list patterns often matter more than any single ranking.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">All lists</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {types.map((t) => {
            const meta = getListInsight(t);
            return (
              <a
                key={t}
                href={`/list/${t}/`}
                className="block p-4 border border-slate-200 rounded-lg hover:border-orange-200 hover:bg-orange-50 transition-colors"
              >
                <div className="font-semibold text-slate-800 mb-1">{meta.title}</div>
                <div className="text-sm text-slate-500">{meta.subtitle}</div>
              </a>
            );
          })}
        </div>
      </section>

      <FreshnessTag source="USDA FoodData Central (CC0 public domain, nutrient data)" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: b.name,
              item: `https://caloriewize.com${b.url}`,
            })),
          }),
        }}
      />
    </div>
  );
}
