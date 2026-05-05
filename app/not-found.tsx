import Link from "next/link";
import { getPopularFoods, getAllCategories } from "@/lib/db";

export default function NotFound() {
  const popular = getPopularFoods(8);
  const categories = getAllCategories().slice(0, 8);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-3">Page Not Found</h1>
      <p className="text-slate-500 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Try a search or jump to one of the popular foods below.
      </p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search foods (chicken, broccoli, almonds…)"
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
            autoFocus
          />
          <button type="submit" className="px-5 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">
            Search
          </button>
        </div>
      </form>

      {popular.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Popular foods</h2>
          <div className="flex flex-wrap gap-2">
            {popular.map((f) => (
              <Link
                key={f.slug}
                href={`/food/${f.slug}/`}
                className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm hover:bg-orange-100"
              >
                {f.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Browse categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}/`}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="border-t border-slate-200 pt-6 flex flex-wrap gap-4 text-sm">
        <Link href="/" className="text-orange-600 hover:underline">Home</Link>
        <Link href="/food/" className="text-orange-600 hover:underline">All foods</Link>
        <Link href="/list/" className="text-orange-600 hover:underline">Curated lists</Link>
        <Link href="/contact/" className="text-orange-600 hover:underline">Report a missing food</Link>
      </div>
    </div>
  );
}
