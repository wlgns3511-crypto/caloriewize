import { getLowCalorieFoods, getHighProteinFoods, getAllCategories, countFoods } from "@/lib/db";

function fmt(v: number | null): string { return v !== null ? v.toFixed(0) : '-'; }

export default function Home() {
  const lowCal = getLowCalorieFoods(15);
  const highPro = getHighProteinFoods(15);
  const categories = getAllCategories();
  const total = countFoods();

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-3">Calories & Nutrition Facts</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Find nutrition info for {total}+ foods. Calories, protein, carbs, fat and more. Data from USDA.
        </p>
      </section>

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <a key={cat.slug} href={`/category/${cat.slug}`}
                className="px-3 py-1 rounded-full border border-slate-200 text-sm hover:bg-orange-50 hover:border-orange-300">
                {cat.name}
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section>
          <h2 className="text-xl font-bold mb-4 text-green-700">Lowest Calorie Foods</h2>
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
          <h2 className="text-xl font-bold mb-4 text-blue-700">Highest Protein Foods</h2>
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
