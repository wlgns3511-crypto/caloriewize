import type { MetadataRoute } from "next";
import { getAllFoods, getAllCategories, getTopComparisons } from "@/lib/db";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://caloriewize.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const foods = getAllFoods();
  const categories = getAllCategories();
  const comparisons = getTopComparisons(40000);

  const listTypes = ["low-calorie", "high-protein"];

  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/food`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/compare`, changeFrequency: "monthly", priority: 0.9 },
    ...listTypes.map((t) => ({ url: `${SITE_URL}/list/${t}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...foods.map((f) => ({ url: `${SITE_URL}/food/${f.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...comparisons.map((p) => { const [a, b] = [p.slugA, p.slugB].sort(); return { url: `${SITE_URL}/compare/${a}-vs-${b}`, changeFrequency: "monthly" as const, priority: 0.5 }; }),
  ];
}
