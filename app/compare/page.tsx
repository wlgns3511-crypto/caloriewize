import { getFoodBySlug } from "@/lib/db";
import { STATIC_COMPARISON_SLUGS } from "@/lib/compare-whitelist";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Foods",
  description: "Compare nutrition facts between foods side by side — calories, macros, vitamins, and minerals.",
  alternates: { canonical: "https://caloriewize.com/compare/" },
  openGraph: { title: "Compare Foods", description: "Compare nutrition facts between foods side by side — calories, macros, vitamins, and minerals.", url: "https://caloriewize.com/compare/" },
};

export default function ComparePage() {
  const pairs = STATIC_COMPARISON_SLUGS
    .slice(0, 200)
    .map((s) => {
      const m = s.match(/^(.+)-vs-(.+)$/);
      if (!m) return null;
      const a = getFoodBySlug(m[1]);
      const b = getFoodBySlug(m[2]);
      if (!a || !b) return null;
      return { slug: s, nameA: a.name, nameB: b.name };
    })
    .filter((p): p is { slug: string; nameA: string; nameB: string } => p !== null);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Compare Foods</h1>
      <p className="text-slate-600 mb-6">Popular side-by-side comparisons.</p>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        {pairs.map((p) => (
          <a key={p.slug} href={`/compare/${p.slug}/`} className="p-3 border border-slate-200 rounded-lg hover:bg-orange-50 text-orange-600">
            {p.nameA} vs {p.nameB}
          </a>
        ))}
      </div>
    </div>
  );
}
