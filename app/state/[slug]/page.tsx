import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug } from '@/lib/states-data';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { StateRich } from '@/components/state/StateRich';
import { getStateInsight } from '@/lib/food-cluster-insights';

interface Props {
  params: Promise<{ slug: string }>;
}

// 2026-04-24 — MUST stay `false`. Next.js 16 soft-404 bug:
// `dynamicParams = true` + `notFound()` + SSG caches the not-found response
// as an HTTP 200 prerender (x-nextjs-cache: HIT, x-nextjs-prerender: 1),
// producing soft-404s that HCU penalizes. Confirmed on the nameblooms
// codebase 2026-04-24. Do NOT flip back without a middleware pre-filter.
export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

function buildFaqs(s: { name: string; code: string; obesityRate: number; popularCuisines: string[]; farmersMarkets: number; dietaryTrends: string[] }) {
  return [
    { question: `What is the obesity rate in ${s.name}?`, answer: `According to CDC BRFSS data, the adult obesity rate in ${s.name} is ${s.obesityRate}%. ${s.obesityRate >= 35 ? `This is significantly above the national average of approximately 32%.` : s.obesityRate >= 30 ? `This is close to the national average of approximately 32%.` : `This is below the national average of approximately 32%.`}` },
    { question: `What are the most popular foods in ${s.name}?`, answer: `${s.name} is known for ${s.popularCuisines.join(', ')}. These reflect the state's unique food culture shaped by geography, immigration patterns, and local agriculture.` },
    { question: `How many farmers markets are in ${s.name}?`, answer: `${s.name} has approximately ${s.farmersMarkets} farmers markets listed in the USDA Farmers Market Directory. Farmers markets provide access to locally grown produce, meats, dairy, and artisan food products.` },
    { question: `What are the main dietary trends in ${s.name}?`, answer: `Key dietary trends in ${s.name} include: ${s.dietaryTrends.join('; ')}. These trends reflect the interplay of local food culture, agricultural output, and public health initiatives.` },
    { question: `How does ${s.name}'s food culture affect nutrition?`, answer: `${s.name}'s food culture directly influences nutrition outcomes. ${s.obesityRate >= 35 ? `With an obesity rate of ${s.obesityRate}%, there is significant room for dietary improvement. Traditional comfort foods and limited healthy food access in some areas contribute to higher obesity.` : s.obesityRate < 28 ? `With a relatively low obesity rate of ${s.obesityRate}%, the state benefits from health-conscious food culture, active lifestyles, and good access to fresh produce.` : `With an obesity rate of ${s.obesityRate}%, the state shows a mix of healthy and traditional food patterns.`}` },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `Food & Nutrition Trends in ${state.name} — Obesity Rate, Local Cuisines, Dietary Data`,
    description: `${state.name} food and nutrition profile: ${state.obesityRate}% obesity rate, ${state.farmersMarkets} farmers markets, popular local foods like ${state.popularCuisines.slice(0, 3).join(', ')}. USDA and CDC data.`,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: {
      title: `Food & Nutrition Trends in ${state.name}`,
      description: `${state.name} food and nutrition profile: ${state.obesityRate}% obesity rate, ${state.farmersMarkets} farmers markets.`,
      url: `/state/${slug}/`,
      type: 'article',
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const allStates = getAllStates();
  const faqs = buildFaqs(state);
  const nationalAvg = allStates.reduce((a, s) => a + s.obesityRate, 0) / allStates.length;
  const rank = [...allStates].sort((a, b) => a.obesityRate - b.obesityRate).findIndex((s) => s.slug === slug) + 1;
  const stateInsight = getStateInsight(slug, state.name, state.obesityRate, nationalAvg, state.popularCuisines, state.farmersMarkets);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
  ];

  // Find nearby states by sorting alphabetically and picking prev/next
  const idx = allStates.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? allStates[idx - 1] : null;
  const next = idx < allStates.length - 1 ? allStates[idx + 1] : null;

  return (
    <article className="max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-orange-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/state/" className="hover:text-orange-700">By State</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">{state.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Food &amp; Nutrition Trends in {state.name}</h1>
      <p className="text-sm text-slate-500 mb-6">
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Sources: CDC BRFSS, USDA Farmers Market Directory
        </span>
        {' · '}
        <a href="/methodology/" className="text-orange-700 hover:underline">Methodology</a>
      </p>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className={`text-2xl font-bold ${state.obesityRate >= 35 ? 'text-red-600' : state.obesityRate >= 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {state.obesityRate}%
          </div>
          <div className="text-xs text-slate-500">Obesity Rate</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">#{rank}</div>
          <div className="text-xs text-slate-500">of {allStates.length} (lowest = #1)</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{state.farmersMarkets}</div>
          <div className="text-xs text-slate-500">Farmers Markets</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">{state.popularCuisines.length}</div>
          <div className="text-xs text-slate-500">Iconic Local Foods</div>
        </div>
      </div>

      {/* Obesity context */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Obesity Rate in {state.name}</h2>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          {state.name}&apos;s adult obesity rate of <strong>{state.obesityRate}%</strong> is{' '}
          {state.obesityRate > nationalAvg + 2 ? (
            <span className="text-red-600 font-semibold">above the national average of {nationalAvg.toFixed(1)}%</span>
          ) : state.obesityRate < nationalAvg - 2 ? (
            <span className="text-emerald-600 font-semibold">below the national average of {nationalAvg.toFixed(1)}%</span>
          ) : (
            <span>near the national average of {nationalAvg.toFixed(1)}%</span>
          )}.
          {' '}The state ranks <strong>#{rank}</strong> out of {allStates.length} states and DC when sorted from lowest to highest obesity rate.
        </p>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>0%</span>
            <span>National avg ({nationalAvg.toFixed(1)}%)</span>
            <span>45%</span>
          </div>
          <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${state.obesityRate >= 35 ? 'bg-red-500' : state.obesityRate >= 30 ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${(state.obesityRate / 45) * 100}%` }}
            />
            <div
              className="absolute inset-y-0 w-0.5 bg-slate-700"
              style={{ left: `${(nationalAvg / 45) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">{state.name}: {state.obesityRate}% adult obesity (CDC BRFSS 2023)</p>
        </div>
      </section>

      {/* Layer 2 narrative — slug-hashed, unique per state */}
      <section className="mb-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>{stateInsight.obesityNarrative}</p>
          <p>{stateInsight.cuisineNarrative}</p>
          <p>{stateInsight.practicalSwap}</p>
        </div>
      </section>

      {/* Popular local cuisines */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Popular Local Foods in {state.name}</h2>
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          {state.name}&apos;s food identity is shaped by geography, immigration history, and local agriculture. These are the iconic foods and dishes most associated with the state.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {state.popularCuisines.map((food) => (
            <div key={food} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-sm text-slate-800">{food}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Farmers markets */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Farmers Markets in {state.name}</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          {state.name} has approximately <strong>{state.farmersMarkets}</strong> farmers markets listed in the USDA Farmers Market Directory.
          {state.farmersMarkets >= 300
            ? ' This is one of the highest counts in the nation, reflecting strong demand for locally sourced produce and artisan foods.'
            : state.farmersMarkets >= 150
            ? ' This provides moderate access to locally grown produce, meats, and dairy products across the state.'
            : ' Expanding farmers market access could help improve fresh food availability and nutritional outcomes in underserved areas.'}
        </p>
      </section>

      {/* Dietary trends */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Dietary Trends in {state.name}</h2>
        <div className="space-y-2">
          {state.dietaryTrends.map((trend) => (
            <div key={trend} className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <span className="text-orange-600 font-bold text-sm flex-shrink-0">&#8594;</span>
              <span className="text-sm text-slate-700">{trend}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8" id="faq">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer font-semibold text-slate-900 flex items-center justify-between gap-2 text-sm">
                <span>{f.question}</span>
                <span className="text-orange-600 text-sm">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Explore other states */}
      <section className="mb-8 rounded-xl bg-orange-50 border border-orange-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Explore Other States</h2>
        <div className="flex flex-wrap gap-2">
          {allStates.filter((s) => s.slug !== slug).slice(0, 12).map((s) => (
            <Link
              key={s.slug}
              href={`/state/${s.slug}/`}
              className="text-xs bg-white border border-orange-200 rounded-full px-3 py-1 hover:bg-orange-100 transition-colors text-slate-700"
            >
              {s.name}
            </Link>
          ))}
          <Link href="/state/" className="text-xs bg-orange-600 text-white rounded-full px-3 py-1 hover:bg-orange-700 transition-colors font-semibold">
            All States &rarr;
          </Link>
        </div>
      </section>

      {/* Prev/Next navigation */}
      <div className="flex justify-between items-center gap-4 py-4 border-t border-slate-200 text-sm">
        {prev ? (
          <Link href={`/state/${prev.slug}/`} className="text-orange-700 hover:underline">&larr; {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/state/${next.slug}/`} className="text-orange-700 hover:underline">{next.name} &rarr;</Link>
        ) : <span />}
      </div>


      <StateRich slug={slug} state={state} />

      <AuthorBox />
      <CrossSiteLinks current="CalorieWize" />
    </article>
  );
}
