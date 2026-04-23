import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Nutrition Guides — USDA Data, Calorie Accuracy, Protein, Ultra-Processed, Labels',
  description: 'In-depth nutrition guides backed by USDA data — calorie counting tips, protein requirements, ultra-processed food science, and how to read nutrition labels.',
  alternates: { canonical: '/guide/' },
  openGraph: { url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Nutrition Guides',
            url: 'https://caloriewize.com/guide/',
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://caloriewize.com/guide/${g.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nutrition Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, data-backed guides on calories, macronutrients, and nutrition science — all
          grounded in USDA FoodData Central. Every guide connects to our food database so you can
          look up real numbers as you read.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-xl bg-orange-50 border border-orange-200 p-6 text-center">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Looking for a specific food?</h2>
        <p className="text-sm text-slate-600 mb-4">Search our database of thousands of foods with full USDA nutrition data.</p>
        <Link href="/food/" className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">
          Browse Foods
        </Link>
      </section>
    </div>
  );
}
