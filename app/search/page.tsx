import type { Metadata } from "next";
import { searchFoods, getLowCalorieFoods, getHighProteinFoods } from "@/lib/db";

export const metadata: Metadata = {
  title: "Search Foods — Calories, Nutrition & Diet Info",
  description: "Search nutrition data for thousands of foods. Find calories, protein, carbs, fat, and diet compatibility.",
  alternates: { canonical: "/search" },
  openGraph: { url: "/search/" },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

function fmt(v: number | null, unit = "g"): string { return v !== null ? `${v.toFixed(1)}${unit}` : "N/A"; }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchFoods(query, 40) : [];
  const lowCal = !query ? getLowCalorieFoods(8) : [];
  const highProtein = !query ? getHighProteinFoods(8) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Search Nutrition Data</h1>
      <p className="text-slate-500 mb-6">Find calories, macros, and diet compatibility for thousands of foods</p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search foods (e.g. chicken, broccoli, almonds...)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-slate-700">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`
              : `No results found for "${query}"`}
          </h2>
          {results.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {results.map((f) => (
                <a
                  key={f.slug}
                  href={`/food/${f.slug}`}
                  className="block p-4 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                >
                  <div className="font-semibold text-slate-900 mb-1 truncate">{f.name}</div>
                  {f.category && <div className="text-xs text-slate-400 mb-2 capitalize">{f.category.replace(/-/g, " ")}</div>}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                    {f.calories != null && <span>Cal: <strong>{f.calories.toFixed(0)}</strong></span>}
                    {f.protein != null && <span>Protein: <strong>{fmt(f.protein)}</strong></span>}
                    {f.carbs != null && <span>Carbs: <strong>{fmt(f.carbs)}</strong></span>}
                    {f.fat != null && <span>Fat: <strong>{fmt(f.fat)}</strong></span>}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-lg text-center text-slate-500">
              <p>Try a different food name or browse featured foods below.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-slate-700">Low-Calorie Foods</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {lowCal.map((f) => (
                <a key={f.slug} href={`/food/${f.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all flex justify-between items-center">
                  <span className="font-medium text-slate-900 truncate">{f.name}</span>
                  <span className="text-xs text-emerald-600 font-medium ml-2 flex-shrink-0">{f.calories?.toFixed(0)} cal</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-700">High-Protein Foods</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {highProtein.map((f) => (
                <a key={f.slug} href={`/food/${f.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex justify-between items-center">
                  <span className="font-medium text-slate-900 truncate">{f.name}</span>
                  <span className="text-xs text-blue-600 font-medium ml-2 flex-shrink-0">{fmt(f.protein)} protein</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
