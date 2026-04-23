import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllInsightArticles } from '@/lib/insight-articles';

const SITE_URL = 'https://caloriewize.com';

export const metadata: Metadata = {
  title: 'Nutrition Insights — Data-Driven Calorie & Food Analysis',
  description: 'Expert analysis of nutrition trends, calorie comparisons, and food cost data. Based on USDA FoodData Central with real pricing analysis.',
  alternates: { canonical: '/insights/' },
  openGraph: { title: 'Nutrition Insights', description: 'Data-driven calorie and nutrition trend analysis.', url: '/insights/' },
};

export default function InsightsIndex() {
  const articles = getAllInsightArticles();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'CalorieWize Insights',
            url: `${SITE_URL}/insights/`,
            numberOfItems: articles.length,
            itemListElement: articles.map((a, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: a.title,
              url: `${SITE_URL}/insights/${a.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Nutrition Insights</h1>
        <p className="text-slate-600 max-w-3xl">
          Data-driven analysis of calories, nutrition, and food costs in America.
          Each article uses real USDA data and retail prices to surface patterns
          that help you make smarter food choices.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/insights/${a.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 p-5 transition-colors"
          >
            <div className="text-xs text-slate-400 mb-1">
              <time dateTime={a.date}>{a.date}</time>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{a.title}</h2>
            <p className="text-sm text-slate-600">{a.summary}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Look up the data yourself</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/food/" className="text-orange-700 hover:underline font-medium">Browse all foods</Link>
            <span className="text-slate-500"> — calories and nutrition facts for 2,500+ foods</span>
          </li>
          <li>
            <Link href="/compare/" className="text-orange-700 hover:underline font-medium">Compare foods</Link>
            <span className="text-slate-500"> — side-by-side nutrition comparison</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
