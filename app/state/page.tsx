import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/states-data';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';

const SITE_URL = 'https://caloriewize.com';

export const metadata: Metadata = {
  title: 'Food & Nutrition by State — Obesity Rates, Local Cuisines, Dietary Trends',
  description: 'Explore food and nutrition data for all 50 US states and DC. Compare obesity rates, discover popular local cuisines, farmers markets, and regional dietary trends.',
  alternates: { canonical: '/state/' },
  openGraph: { url: '/state/' },
};

export default function StatesIndex() {
  const states = getAllStates();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
  ];

  const listItems = states.map((s) => ({
    name: `${s.name} Food & Nutrition`,
    url: `/state/${s.slug}/`,
  }));

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('Food & Nutrition by State', '/state/', listItems)) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Food &amp; Nutrition by State</h1>
        <p className="text-slate-600 max-w-3xl">
          Explore food culture, obesity rates, and dietary trends across all 50 US states and
          Washington DC. Data from the CDC Behavioral Risk Factor Surveillance System (BRFSS),
          USDA Farmers Market Directory, and state health departments.
        </p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{states.length}</div>
          <div className="text-xs text-slate-500">States &amp; DC</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{Math.min(...states.map(s => s.obesityRate)).toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Lowest Obesity Rate</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{Math.max(...states.map(s => s.obesityRate)).toFixed(1)}%</div>
          <div className="text-xs text-slate-500">Highest Obesity Rate</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{states.reduce((a, s) => a + s.farmersMarkets, 0).toLocaleString()}</div>
          <div className="text-xs text-slate-500">Farmers Markets</div>
        </div>
      </div>

      {/* State grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {states.map((s) => (
          <Link
            key={s.slug}
            href={`/state/${s.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50 p-4 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900">{s.name}</h2>
              <span className="text-xs font-mono text-slate-400">{s.code}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className={`font-semibold ${s.obesityRate >= 35 ? 'text-red-600' : s.obesityRate >= 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {s.obesityRate}% obesity
              </span>
              <span>{s.farmersMarkets} markets</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 truncate">{s.popularCuisines.join(' · ')}</p>
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
