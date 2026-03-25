import { getAllFoods } from "@/lib/db";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "All Foods", description: "Browse calorie and nutrition data for all foods." };
export default function FoodsPage() {
  const foods = getAllFoods();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Foods ({foods.length})</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {foods.map((f) => (
          <a key={f.slug} href={`/food/${f.slug}`} className="flex justify-between p-2 border border-slate-100 rounded hover:bg-orange-50">
            <span>{f.name}</span>
            <span className="text-slate-400">{f.calories?.toFixed(0)} cal</span>
          </a>
        ))}
      </div>
    </div>
  );
}
