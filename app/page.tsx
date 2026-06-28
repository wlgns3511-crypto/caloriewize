import type { Metadata } from "next";
import { getLowCalorieFoods, getHighProteinFoods, getAllCategories, countFoods, getPopularFoods, getFoodsByCategory } from "@/lib/db";
import { getCategoryStats } from "@/lib/food-facts";
import { PopularEntities } from "@/components/upgrades/PopularEntities";
import { CategoryTile } from "@/components/CategoryTile";

export const metadata: Metadata = {
  title: "CalorieWize — Calories & Nutrition Facts for 2,500+ Foods",
  description: "Free nutrition database. Find calories, protein, carbs, fat, and 13 other nutrients for 2,500+ foods. Compare foods side by side. USDA FoodData Central.",
  alternates: { canonical: "/" },
  openGraph: { title: "CalorieWize — Calories & Nutrition Facts", description: "Free nutrition database for 2,500+ foods. Compare, track macros, and make healthier choices.", url: "/" },
};

function fmt(v: number | null): string { return v !== null ? v.toFixed(0) : '-'; }

export default function Home() {
  const lowCal = getLowCalorieFoods(15);
  const highPro = getHighProteinFoods(15);
  const categories = getAllCategories();
  const total = countFoods();
  const popularFoods = getPopularFoods(12);

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Calories & Nutrition Facts</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Find nutrition info for {total}+ foods. Calories, protein, carbs, fat and more. Data from USDA.
        </p>
      </section>

      <PopularEntities
        heading="Most Searched Foods"
        items={popularFoods.map(f => ({
          name: f.name,
          href: `/food/${f.slug}`,
          stat: f.calories != null ? `${fmt(f.calories)} cal` : undefined,
        }))}
        viewAllHref="/rankings"
        viewAllLabel="View all foods →"
      />

      {categories.length > 0 && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <span className="text-xs text-slate-500">{categories.length} USDA categories · {total.toLocaleString()} foods</span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Each tile shows the food count and mean calories per 100 g for that USDA FoodData Central category.
            Emoji icons are universal Unicode glyphs — symbolic shorthand for the food family, not photographs.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const stats = getCategoryStats(cat.slug);
              return (
                <CategoryTile
                  key={cat.slug}
                  slug={cat.slug}
                  name={cat.name}
                  count={stats?.count ?? getFoodsByCategory(cat.slug).length}
                  meanCal={stats?.calMean}
                  size="md"
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-center">Food Lists</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <a href="/list/low-calorie"
            className="px-3 py-1 rounded-full border border-green-200 text-sm hover:bg-green-50 hover:border-green-400 text-green-700">
            Low Calorie Foods
          </a>
          <a href="/list/high-protein"
            className="px-3 py-1 rounded-full border border-blue-200 text-sm hover:bg-blue-50 hover:border-blue-400 text-blue-700">
            High Protein Foods
          </a>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-700">Lowest Calorie Foods</h2>
            <a href="/list/low-calorie" className="text-sm text-green-600 hover:underline">View all &rarr;</a>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {lowCal.map((f) => (
              <a key={f.slug} href={`/food/${f.slug}`}
                className="flex justify-between items-center p-3 hover:bg-green-50 border-b border-slate-100">
                <span className="text-sm">{f.name}</span>
                <span className="text-sm font-semibold text-green-600">{fmt(f.calories)} cal</span>
              </a>
            ))}
          </div>
        </section>
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-700">Highest Protein Foods</h2>
            <a href="/list/high-protein" className="text-sm text-blue-600 hover:underline">View all &rarr;</a>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {highPro.map((f) => (
              <a key={f.slug} href={`/food/${f.slug}`}
                className="flex justify-between items-center p-3 hover:bg-blue-50 border-b border-slate-100">
                <span className="text-sm">{f.name}</span>
                <span className="text-sm font-semibold text-blue-600">{fmt(f.protein)}g protein</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
