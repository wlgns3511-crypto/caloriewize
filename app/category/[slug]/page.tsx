import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategories, getFoodsByCategory } from "@/lib/db";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cats = getAllCategories();
  const cat = cats.find(c => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} - Calories & Nutrition`,
    description: `Browse calorie and nutrition data for ${cat.name.toLowerCase()}.`,
    alternates: { canonical: `/category/${slug}/` },
    openGraph: { url: `/category/${slug}/` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cats = getAllCategories();
  const cat = cats.find(c => c.slug === slug);
  if (!cat) notFound();
  const foods = getFoodsByCategory(slug);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{cat.name}</h1>
      <p className="text-slate-600 mb-6">{foods.length} foods</p>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {foods.map((f) => (
          <a key={f.slug} href={`/food/${f.slug}`} className="flex justify-between p-3 border border-slate-100 rounded hover:bg-orange-50">
            <span>{f.name}</span>
            <span className="text-slate-400">{f.calories?.toFixed(0)} cal</span>
          </a>
        ))}
      </div>
    </div>
  );
}
