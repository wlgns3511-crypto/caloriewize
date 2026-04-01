import { getAllFoods } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Compare Foods",
  description: "Compare nutrition facts between foods side by side — calories, macros, vitamins, and minerals.",
  alternates: { canonical: "https://caloriewize.com/compare/" },
  openGraph: { title: "Compare Foods", description: "Compare nutrition facts between foods side by side — calories, macros, vitamins, and minerals.", url: "https://caloriewize.com/compare/" },
};
export default function ComparePage() {
  const foods = getAllFoods().slice(0, 30);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compare Foods</h1>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {foods.slice(0, 15).map((a, i) => {
          const b = foods[i + 15] || foods[0];
          const [x, y] = [a.slug, b.slug].sort();
          return (<a key={i} href={`/compare/${x}-vs-${y}`} className="p-3 border border-slate-200 rounded-lg hover:bg-orange-50 text-orange-600">{a.name} vs {b.name}</a>);
        })}
      </div>
    </div>
  );
}
