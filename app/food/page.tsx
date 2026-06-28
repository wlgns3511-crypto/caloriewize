import { getAllFoods } from "@/lib/db";
import type { Metadata } from "next";
import { breadcrumbSchema, datasetSchema } from "@/lib/schema";
import { AuthorBox } from "@/components/AuthorBox";
import { FreshnessTag } from "@/components/FreshnessTag";
import { HubReaderHelp } from "@/components/upgrades/HubReaderHelp";
import { getFoodHubReaderHelp } from "@/lib/hub-reader-help";

export const metadata: Metadata = {
  title: "All Foods",
  description: "Browse calorie and nutrition data for all foods.",
  alternates: { canonical: "/food/" },
  openGraph: { url: "/food/" },
};

export default function FoodsPage() {
  const foods = getAllFoods();
  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'All Foods', url: '/food/' },
  ];
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(
        `CalorieWize all-foods index`,
        `Per-100g calorie and nutrient values for ${foods.length} foods, sourced from USDA FoodData Central. Each entry links to its source FDC ID.`,
        `/food/`,
      )) }} />
      <h1 className="text-3xl font-bold mb-2">All Foods ({foods.length})</h1>
      <p className="text-slate-600 mb-6">
        Alphabetical index of every food in the database, each linking to its full nutrition profile, FDA Daily Value % column, and 5-bucket dietary-fit lens.
      </p>

      {/* PSU — hub reader-help (4 paragraphs) */}
      <HubReaderHelp
        heading={`How to read this index`}
        subjectLabel={`${foods.length.toLocaleString()} foods`}
        paragraphs={getFoodHubReaderHelp(foods.length)}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
        {foods.map((f) => (
          <a key={f.slug} href={`/food/${f.slug}`} className="flex justify-between p-2 border border-slate-100 rounded hover:bg-orange-50">
            <span>{f.name}</span>
            <span className="text-slate-400">{f.calories?.toFixed(0)} cal</span>
          </a>
        ))}
      </div>

      <AuthorBox layer="food-hub" />
      <FreshnessTag source="USDA FoodData Central (CC0 public domain, nutrient data)" />
    </div>
  );
}
