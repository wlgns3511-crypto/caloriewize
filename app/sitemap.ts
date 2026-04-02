import type { MetadataRoute } from "next";
import { getAllFoods, getAllCategories, getTopComparisons, getRotatingComparisons } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://caloriewize.com";

export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const foods = getAllFoods();
  const categories = getAllCategories();
  // 80% stable core + 20% weekly rotation
  const stableComparisons = getTopComparisons(32000);
  const rotatingComps = getRotatingComparisons(8000);
  const stableSet = new Set(stableComparisons.map(p => `${p.slugA}|${p.slugB}`));
  const deduped = rotatingComps.filter(p => !stableSet.has(`${p.slugA}|${p.slugB}`));
  const comparisons = [...stableComparisons, ...deduped];

  const listTypes = ["low-calorie", "high-protein"];

  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/food/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/compare/`, changeFrequency: "monthly", priority: 0.9 },
    ...listTypes.map((t) => ({ url: `${SITE_URL}/list/${t}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}/`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...foods.map((f) => ({ url: `${SITE_URL}/food/${f.slug}/`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...comparisons.map((p) => { const [a, b] = [p.slugA, p.slugB].sort(); return { url: `${SITE_URL}/compare/${a}-vs-${b}/`, changeFrequency: "monthly" as const, priority: 0.5 }; }),
    { url: `${SITE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
  ];
}
